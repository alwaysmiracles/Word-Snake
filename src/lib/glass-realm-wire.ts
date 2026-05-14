// ============================================================================
// Glass Realm Wire — 玻璃境 · Glass Crafting & Crystalline Dimension Module
// ============================================================================
// Feature module for the Word Snake game (单词贪吃蛇).
// Prefix: `GX_` for all constants.
// No recursive functions. No `&&` short-circuit side effects.
// SSR-safe: no direct localStorage/window access outside of Zustand persist.
// ============================================================================

import { useMemo, useCallback, useRef, useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════════════
// Types & Interfaces
// ═══════════════════════════════════════════════════════════════════════════

export type GxRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'

export type GxSpecies = 'crystal_serpent' | 'prism_walker' | 'glass_phoenix' | 'silicon_golem' | 'rainbow_sprite' | 'opal_giant' | 'diamond_wraith'

export type GxPrismLocation = 'crystal_apex' | 'refraction_hall' | 'prism_garden' | 'shattered_terrace' | 'obsidian_mirror' | 'amber_vault' | 'silica_cathedral' | 'diamond_core'

export type GxGlassElement = 'Clear' | 'Fire' | 'Ice' | 'Earth' | 'Shadow' | 'Light' | 'Astral' | 'Void'

export interface GxRarityInfo {
  key: GxRarity
  label: string
  color: string
  glow: string
  clarityMultiplier: number
  dropWeight: number
}

export interface GxGolemDef {
  id: string
  name: string
  species: GxSpecies
  rarity: GxRarity
  power: number
  clarity: number
  health: number
  description: string
  lore: string
}

export interface GxPrismDef {
  id: string
  name: string
  location: GxPrismLocation
  description: string
  requiredClarity: number
  lightBonus: number
  color: string
  icon: string
}

export interface GxMaterialDef {
  id: string
  name: string
  rarity: GxRarity
  source: string
  description: string
}

export interface GxStructureDef {
  id: string
  name: string
  category: string
  maxLevel: number
  baseCost: number
  upgradeMultiplier: number
  description: string
  effectPerLevel: string
  icon: string
}

export interface GxAbilityDef {
  id: string
  name: string
  description: string
  cooldown: number
  power: number
  element: GxGlassElement
  rarity: GxRarity
  clarityCost: number
  icon: string
}

export interface GxAchievementDef {
  id: string
  name: string
  description: string
  icon: string
  condition: string
  reward: { clarity: number; prisms: number }
}

export interface GxTitleDef {
  id: string
  name: string
  levelReq: number
  icon: string
  description: string
  color: string
}

export interface GxArtifactDef {
  id: string
  name: string
  rarity: GxRarity
  description: string
  power: number
  abilities: string[]
  golemBonus: string
  icon: string
}

export interface GxEventDef {
  id: string
  name: string
  description: string
  duration: number
  reward: string
  requirement: string
  icon: string
  color: string
}

// ── Instance types (player-owned state) ──────────────────────────────────

export interface GxArtifactInstance {
  instanceId: string
  defId: string
  level: number
  equipped: boolean
  forgedAt: number
}

export interface GxStructureState {
  [structureId: string]: number
}

export interface GxEventProgress {
  eventId: string
  startedAt: number
  progress: number
  completed: boolean
  rewardClaimed: boolean
}

// ── Full store state ────────────────────────────────────────────────────

export interface GlassRealmState {
  golemsTamed: string[]
  prismsFormed: string[]
  materials: Record<string, number>
  structures: GxStructureState
  abilitiesLearned: string[]
  achievementsUnlocked: string[]
  currentPrism: string
  artifacts: GxArtifactInstance[]
  eventProgress: GxEventProgress[]
  clarity: number
  prismsFormedCount: number
  level: number
  titleIndex: number
  totalGlassForged: number
  totalLightRefracted: number
  totalGolemsTamed: number
  totalPrismsBuilt: number
  totalStructuresUpgraded: number
  totalAbilitiesActivated: number
  totalMaterialsCollected: number
  totalArtifactsForged: number
  totalShatters: number
  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════════════════
// Color Theme Constants
// ═══════════════════════════════════════════════════════════════════════════

export const GX_COLOR_CRYSTAL_WHITE = '#F0F8FF'
export const GX_COLOR_PRISMATIC_RAINBOW = '#FF69B4'
export const GX_COLOR_GLASS_CYAN = '#00CED1'
export const GX_COLOR_AMBER_GOLD = '#FFBF00'
export const GX_COLOR_OPALESCENT = '#FFD6E8'
export const GX_COLOR_OBSIDIAN = '#1C1C2E'
export const GX_COLOR_FROSTED = '#B0E0E6'
export const GX_COLOR_PHANTOM = '#DDA0DD'

export const GX_THEME = {
  primary: GX_COLOR_CRYSTAL_WHITE,
  secondary: GX_COLOR_GLASS_CYAN,
  accent: GX_COLOR_AMBER_GOLD,
  prismatic: GX_COLOR_PRISMATIC_RAINBOW,
  background: '#0A0A1A',
  surface: '#12122A',
  surfaceLight: '#1E1E3E',
  textPrimary: '#F0F8FF',
  textSecondary: '#88BBCC',
  border: '#2A4A5A',
  borderLight: '#3A6A7A',
  rainbow: ['#FF1744', '#FF9100', '#FFD600', '#00E676', '#00CED1', '#651FFF', '#FF69B4'],
}

// ═══════════════════════════════════════════════════════════════════════════
// Rarity Data
// ═══════════════════════════════════════════════════════════════════════════

export const GX_RARITY: Record<GxRarity, GxRarityInfo> = {
  Common: {
    key: 'Common',
    label: 'Common',
    color: '#9CA3AF',
    glow: 'rgba(156,163,175,0.3)',
    clarityMultiplier: 1,
    dropWeight: 40,
  },
  Uncommon: {
    key: 'Uncommon',
    label: 'Uncommon',
    color: '#00CED1',
    glow: 'rgba(0,206,209,0.35)',
    clarityMultiplier: 1.5,
    dropWeight: 30,
  },
  Rare: {
    key: 'Rare',
    label: 'Rare',
    color: '#00E676',
    glow: 'rgba(0,230,118,0.4)',
    clarityMultiplier: 2.5,
    dropWeight: 18,
  },
  Epic: {
    key: 'Epic',
    label: 'Epic',
    color: '#FF69B4',
    glow: 'rgba(255,105,180,0.45)',
    clarityMultiplier: 4,
    dropWeight: 9,
  },
  Legendary: {
    key: 'Legendary',
    label: 'Legendary',
    color: '#FFBF00',
    glow: 'rgba(255,191,0,0.5)',
    clarityMultiplier: 7,
    dropWeight: 3,
  },
}

export const GX_RARITY_ORDER: GxRarity[] = [
  'Common',
  'Uncommon',
  'Rare',
  'Epic',
  'Legendary',
]

export const GX_SPECIES: GxSpecies[] = [
  'crystal_serpent',
  'prism_walker',
  'glass_phoenix',
  'silicon_golem',
  'rainbow_sprite',
  'opal_giant',
  'diamond_wraith',
]

export const GX_SPECIES_INFO: Record<GxSpecies, { label: string; icon: string; color: string }> = {
  crystal_serpent: { label: 'Crystal Serpent', icon: '🐍', color: '#00CED1' },
  prism_walker: { label: 'Prism Walker', icon: '🚶', color: '#FF69B4' },
  glass_phoenix: { label: 'Glass Phoenix', icon: '🔥', color: '#FF4500' },
  silicon_golem: { label: 'Silicon Golem', icon: '🗿', color: '#B0C4DE' },
  rainbow_sprite: { label: 'Rainbow Sprite', icon: '🧚', color: '#FFD700' },
  opal_giant: { label: 'Opal Giant', icon: '💎', color: '#FFD6E8' },
  diamond_wraith: { label: 'Diamond Wraith', icon: '👻', color: '#F0F8FF' },
}

// ═══════════════════════════════════════════════════════════════════════════
// Numerical Constants
// ═══════════════════════════════════════════════════════════════════════════

export const GX_MAX_CLARITY = 9999
export const GX_GOLEM_COUNT = 35
export const GX_PRISM_COUNT = 8
export const GX_MATERIAL_COUNT = 30
export const GX_STRUCTURE_COUNT = 25
export const GX_ABILITY_COUNT = 22
export const GX_ACHIEVEMENT_COUNT = 18
export const GX_TITLE_COUNT = 8
export const GX_ARTIFACT_COUNT = 15
export const GX_EVENT_COUNT = 12
export const GX_FORGE_CLARITY_COST = 15
export const GX_REFRACT_CLARITY_COST = 10
export const GX_BUILD_PRISM_COST = 50
export const GX_SHATTER_REFUND_RATE = 0.4
export const GX_CLARITY_PER_LEVEL = 200
export const GX_TAME_GOLEM_BASE_CLARITY = 25
export const GX_UPGRADE_DISCOUNT_LVL5 = 0.1

// ═══════════════════════════════════════════════════════════════════════════
// GX_GOLEMS (35, 5 rarity tiers, 7 species)
// ═══════════════════════════════════════════════════════════════════════════

export const GX_GOLEMS: GxGolemDef[] = [
  // ── Common (7, one per species) ──────────────────────────────
  {
    id: 'serpent_shardling',
    name: 'Shardling Serpent',
    species: 'crystal_serpent',
    rarity: 'Common',
    power: 8,
    clarity: 10,
    health: 40,
    description: 'A small serpent made of translucent crystal shards that slithers through glass surfaces.',
    lore: 'Born from the first fractures of the Crystal Apex, these tiny serpents are the realm\'s most abundant guardians.',
  },
  {
    id: 'walker_prismite',
    name: 'Prismite Walker',
    species: 'prism_walker',
    rarity: 'Common',
    power: 7,
    clarity: 12,
    health: 50,
    description: 'A diminutive humanoid figure of refractive glass that walks with careful, measured steps.',
    lore: 'Prismite Walkers are the workers of the Glass Realm, endlessly polishing every surface to perfect clarity.',
  },
  {
    id: 'phoenix_sparklet',
    name: 'Sparklet Phoenix',
    species: 'glass_phoenix',
    rarity: 'Common',
    power: 9,
    clarity: 8,
    health: 30,
    description: 'A fledgling phoenix of warm glass that emits tiny sparks of refracted light when it flutters.',
    lore: 'The youngest phoenix golems cannot yet rebirth, but their spark-filled wings are a sight of pure wonder.',
  },
  {
    id: 'golem_silica_pebble',
    name: 'Silica Pebble Golem',
    species: 'silicon_golem',
    rarity: 'Common',
    power: 10,
    clarity: 5,
    health: 80,
    description: 'A chunky golem formed from compressed silica sand, slow but incredibly durable.',
    lore: 'The foundation of the realm\'s defense, Silica Pebble Golems stand guard at every threshold.',
  },
  {
    id: 'sprite_irid_wisp',
    name: 'Iridescent Wisp',
    species: 'rainbow_sprite',
    rarity: 'Common',
    power: 6,
    clarity: 15,
    health: 25,
    description: 'A tiny floating sprite that cycles through every color of the rainbow as it moves.',
    lore: 'Iridescent Wisps are the messengers of the Glass Realm, carrying prismatic signals between the prisms.',
  },
  {
    id: 'opal_pebble_giant',
    name: 'Opal Pebble Giant',
    species: 'opal_giant',
    rarity: 'Common',
    power: 11,
    clarity: 7,
    health: 70,
    description: 'A small giant made of rough opalescent glass that shifts colors with each step.',
    lore: 'Even the smallest Opal Giants carry the weight of centuries in their shimmering frames.',
  },
  {
    id: 'wraith_flicker',
    name: 'Flicker Wraith',
    species: 'diamond_wraith',
    rarity: 'Common',
    power: 8,
    clarity: 13,
    health: 35,
    description: 'A ghostly wraith of thin diamond glass that flickers in and out of visibility.',
    lore: 'Flicker Wraiths patrol the borders of reality, ensuring no crack forms in the realm\'s crystalline walls.',
  },

  // ── Uncommon (7, one per species) ────────────────────────────
  {
    id: 'serpent_facet_viper',
    name: 'Facet Viper',
    species: 'crystal_serpent',
    rarity: 'Uncommon',
    power: 18,
    clarity: 28,
    health: 80,
    description: 'A coiling serpent with precisely cut facets along its body that scatter light in dazzling patterns.',
    lore: 'Facet Vipers were bred in the Refraction Hall to guard the most valuable glass specimens.',
  },
  {
    id: 'walker_beam_sentinel',
    name: 'Beam Sentinel',
    species: 'prism_walker',
    rarity: 'Uncommon',
    power: 16,
    clarity: 25,
    health: 100,
    description: 'A taller walker with a crystal lens embedded in its chest that projects light beams.',
    lore: 'Beam Sentinels use their chest lenses to illuminate hidden pathways through the darker prisms.',
  },
  {
    id: 'phoenix_ember_glass',
    name: 'Ember Glass Phoenix',
    species: 'glass_phoenix',
    rarity: 'Uncommon',
    power: 20,
    clarity: 22,
    health: 65,
    description: 'A phoenix with amber-tinted glass wings that burn with trapped eternal firelight.',
    lore: 'The Ember Glass Phoenix can sustain a single rebirth, dissolving into glass beads and reforming.',
  },
  {
    id: 'golem_quartz_guardian',
    name: 'Quartz Guardian',
    species: 'silicon_golem',
    rarity: 'Uncommon',
    power: 22,
    clarity: 18,
    health: 150,
    description: 'A reinforced golem of polished quartz crystal with exceptional defensive capabilities.',
    lore: 'Quartz Guardians form the first line of defense at the Obsidian Mirror, their bodies reflecting all attacks.',
  },
  {
    id: 'sprite_prisma_fairy',
    name: 'Prisma Fairy',
    species: 'rainbow_sprite',
    rarity: 'Uncommon',
    power: 15,
    clarity: 30,
    health: 45,
    description: 'A fairy-like sprite with delicate prismatic wings that leave trails of rainbow light.',
    lore: 'Prisma Fairies tend the Prism Garden, ensuring every flower receives exactly the right spectrum.',
  },
  {
    id: 'opal_moonstone_colossus',
    name: 'Moonstone Colossus',
    species: 'opal_giant',
    rarity: 'Uncommon',
    power: 24,
    clarity: 20,
    health: 140,
    description: 'A towering giant of blue-white moonstone opal that glows softly under the realm\'s ambient light.',
    lore: 'The Moonstone Colossus is said to have been the first Opal Giant, carved from a fallen moonstone meteor.',
  },
  {
    id: 'wraith_specter_glass',
    name: 'Specter of Glass',
    species: 'diamond_wraith',
    rarity: 'Uncommon',
    power: 19,
    clarity: 26,
    health: 60,
    description: 'A semi-transparent wraith that phases through solid glass structures at will.',
    lore: 'Specters of Glass are the scouts of the Diamond Core, able to pass through any barrier to gather intelligence.',
  },

  // ── Rare (7, one per species) ────────────────────────────────
  {
    id: 'serpent_crystal_hydra',
    name: 'Crystal Hydra',
    species: 'crystal_serpent',
    rarity: 'Rare',
    power: 35,
    clarity: 55,
    health: 160,
    description: 'A multi-headed serpent with each head made from a different type of crystal.',
    lore: 'The Crystal Hydra guards the deepest chambers of the Crystal Apex, its many heads seeing in all directions at once.',
  },
  {
    id: 'walker_prism_paladin',
    name: 'Prism Paladin',
    species: 'prism_walker',
    rarity: 'Rare',
    power: 32,
    clarity: 50,
    health: 200,
    description: 'An armored walker clad in layered prismatic glass that refracts all incoming attacks.',
    lore: 'Prism Paladins are the elite guardians of the Refraction Hall, sworn to protect the purity of light.',
  },
  {
    id: 'phoenix_inferno_glass',
    name: 'Inferno Glass Phoenix',
    species: 'glass_phoenix',
    rarity: 'Rare',
    power: 38,
    clarity: 48,
    health: 130,
    description: 'A phoenix whose glass body burns with internal inferno, radiating intense heat and light.',
    lore: 'The Inferno Glass Phoenix can resurrect itself endlessly, each rebirth making its glass body harder and more radiant.',
  },
  {
    id: 'golem_obsidian_titan',
    name: 'Obsidian Titan',
    species: 'silicon_golem',
    rarity: 'Rare',
    power: 40,
    clarity: 42,
    health: 300,
    description: 'A massive titan forged from volcanic obsidian glass, nearly indestructible.',
    lore: 'The Obsidian Titan sleeps beneath the Shattered Terrace, awakening only when the realm faces existential threats.',
  },
  {
    id: 'sprite_aurora_sylph',
    name: 'Aurora Sylph',
    species: 'rainbow_sprite',
    rarity: 'Rare',
    power: 30,
    clarity: 58,
    health: 90,
    description: 'A majestic sprite surrounded by a perpetual aurora of shifting glass colors.',
    lore: 'Aurora Sylphs dance in the upper reaches of the realm, their auroras visible from every prism.',
  },
  {
    id: 'opal_fire_opal_juggernaut',
    name: 'Fire Opal Juggernaut',
    species: 'opal_giant',
    rarity: 'Rare',
    power: 42,
    clarity: 45,
    health: 280,
    description: 'A colossal giant of blazing fire opal that radiates heat capable of melting steel.',
    lore: 'The Fire Opal Juggernaut was created in the heart of the Amber Vault, tempered by ancient firestorms.',
  },
  {
    id: 'wraith_diamond_phantom',
    name: 'Diamond Phantom',
    species: 'diamond_wraith',
    rarity: 'Rare',
    power: 36,
    clarity: 52,
    health: 110,
    description: 'A wraith of perfect diamond glass that is completely invisible in bright light.',
    lore: 'Diamond Phantoms are the realm\'s silent assassins, striking from positions of pure invisibility.',
  },

  // ── Epic (7, one per species) ────────────────────────────────
  {
    id: 'serpent_singularity_serpent',
    name: 'Singularity Serpent',
    species: 'crystal_serpent',
    rarity: 'Epic',
    power: 65,
    clarity: 100,
    health: 350,
    description: 'A colossal serpent whose body contains a gravitational singularity of crystallized light.',
    lore: 'The Singularity Serpent encircles the entire realm within its coils, its gravitational pull holding the Glass Realm together.',
  },
  {
    id: 'walker_chromatic_knight',
    name: 'Chromatic Knight',
    species: 'prism_walker',
    rarity: 'Epic',
    power: 60,
    clarity: 95,
    health: 420,
    description: 'A towering knight encased in chromatic armor that shifts through the entire spectrum.',
    lore: 'The Chromatic Knight is the champion of the Refraction Hall, undefeated in ten thousand years of glass combat.',
  },
  {
    id: 'phoenix_eternal_flame_bird',
    name: 'Eternal Flame Phoenix',
    species: 'glass_phoenix',
    rarity: 'Epic',
    power: 70,
    clarity: 88,
    health: 280,
    description: 'A magnificent phoenix made of glass that contains an eternal flame that never dims.',
    lore: 'The Eternal Flame Phoenix was the first glass phoenix, born when the realm\'s creators captured the primordial fire.',
  },
  {
    id: 'golem_crystal_colossus',
    name: 'Crystal Colossus',
    species: 'silicon_golem',
    rarity: 'Epic',
    power: 75,
    clarity: 82,
    health: 600,
    description: 'A mountain-sized golem of living crystal that reshapes terrain with every movement.',
    lore: 'The Crystal Colossus is the backbone of the realm\'s architecture, able to raise new structures in hours.',
  },
  {
    id: 'sprite_spectrum_monarch',
    name: 'Spectrum Monarch',
    species: 'rainbow_sprite',
    rarity: 'Epic',
    power: 58,
    clarity: 110,
    health: 200,
    description: 'The queen of all rainbow sprites, commanding the entire visible spectrum as her domain.',
    lore: 'The Spectrum Monarch\'s wings contain every color that exists, and several colors that do not yet have names.',
  },
  {
    id: 'opal_black_opal_leviathan',
    name: 'Black Opal Leviathan',
    species: 'opal_giant',
    rarity: 'Epic',
    power: 72,
    clarity: 85,
    health: 550,
    description: 'A devastating giant of black opal that absorbs all light and converts it to raw power.',
    lore: 'The Black Opal Leviathan is both guardian and terror of the Obsidian Mirror, a being of absolute darkness and immense strength.',
  },
  {
    id: 'wraith_diamond_sovereign',
    name: 'Diamond Sovereign',
    species: 'diamond_wraith',
    rarity: 'Epic',
    power: 68,
    clarity: 92,
    health: 250,
    description: 'The supreme wraith of diamond glass, existing simultaneously in all reflective surfaces.',
    lore: 'The Diamond Sovereign sees through every mirror and glass surface in the realm simultaneously, omniscient and omnipresent.',
  },

  // ── Legendary (7, one per species) ───────────────────────────
  {
    id: 'serpent_ouroboros_crystal',
    name: 'Crystal Ouroboros',
    species: 'crystal_serpent',
    rarity: 'Legendary',
    power: 120,
    clarity: 200,
    health: 800,
    description: 'The eternal serpent that devours its own crystalline tail, symbolizing infinity and the endless cycle of glass.',
    lore: 'The Crystal Ouroboros is the oldest being in the Glass Realm, predating even the prisms themselves. Its body is a single, unbroken loop of flawless crystal that generates infinite clarity.',
  },
  {
    id: 'walker_prism_archon',
    name: 'Prism Archon',
    species: 'prism_walker',
    rarity: 'Legendary',
    power: 115,
    clarity: 190,
    health: 900,
    description: 'The archon of all prism walkers, a being of pure refracted light given humanoid form.',
    lore: 'The Prism Archon was the first conscious being created in the Glass Realm, tasked with walking the boundaries of reality and ensuring they hold firm.',
  },
  {
    id: 'phoenix_supernova_glass',
    name: 'Supernova Glass Phoenix',
    species: 'glass_phoenix',
    rarity: 'Legendary',
    power: 130,
    clarity: 180,
    health: 700,
    description: 'A phoenix containing the captured light of a supernova, the most powerful light source in existence.',
    lore: 'When the Supernova Glass Phoenix dies, it explodes in a burst of creation, birthing dozens of lesser glass phoenixes from its shards.',
  },
  {
    id: 'golem_eternal_diamond_fortress',
    name: 'Eternal Diamond Fortress',
    species: 'silicon_golem',
    rarity: 'Legendary',
    power: 140,
    clarity: 170,
    health: 1500,
    description: 'A golem the size of a mountain fortress, made of diamond-hard glass that cannot be scratched.',
    lore: 'The Eternal Diamond Fortress is the Glass Realm\'s ultimate defense, a living stronghold that has never been breached in all of history.',
  },
  {
    id: 'sprite_prismatic_deity',
    name: 'Prismatic Deity',
    species: 'rainbow_sprite',
    rarity: 'Legendary',
    power: 110,
    clarity: 220,
    health: 500,
    description: 'A deity of pure prismatic light that manifests as a kaleidoscopic sprite of infinite colors.',
    lore: 'The Prismatic Deity is the living embodiment of the visible spectrum itself. Wherever it flies, new colors are born into the world.',
  },
  {
    id: 'opal_cosmic_opal_behemoth',
    name: 'Cosmic Opal Behemoth',
    species: 'opal_giant',
    rarity: 'Legendary',
    power: 135,
    clarity: 175,
    health: 1300,
    description: 'A behemoth of cosmic opal that contains miniature galaxies within its swirling glass body.',
    lore: 'The Cosmic Opal Behemoth was formed from the collision of two crystallized stars, its body containing the remnants of entire solar systems.',
  },
  {
    id: 'wraith_void_diamond_emperor',
    name: 'Void Diamond Emperor',
    species: 'diamond_wraith',
    rarity: 'Legendary',
    power: 125,
    clarity: 210,
    health: 600,
    description: 'The emperor of all diamond wraiths, a being that exists in the void between all glass surfaces.',
    lore: 'The Void Diamond Emperor rules the spaces between reflections, commanding an army of wraiths that can step through any glass surface instantaneously.',
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// GX_PRISMS (8 locations)
// ═══════════════════════════════════════════════════════════════════════════

export const GX_PRISMS: GxPrismDef[] = [
  {
    id: 'crystal_apex',
    name: 'Crystal Apex',
    location: 'crystal_apex',
    description: 'The highest point of the Glass Realm, a towering spire of flawless crystal that catches starlight and splits it into seven pure beams. The birthplace of all crystal serpents.',
    requiredClarity: 0,
    lightBonus: 1.0,
    color: GX_COLOR_CRYSTAL_WHITE,
    icon: '🔺',
  },
  {
    id: 'refraction_hall',
    name: 'Refraction Hall',
    location: 'refraction_hall',
    description: 'A grand hall of precisely aligned prisms where light is bent, split, and recombined into infinite patterns. Home to the Prism Walker species.',
    requiredClarity: 100,
    lightBonus: 1.3,
    color: GX_COLOR_PRISMATIC_RAINBOW,
    icon: '🏛️',
  },
  {
    id: 'prism_garden',
    name: 'Prism Garden',
    location: 'prism_garden',
    description: 'A luminous garden where flowers made of living glass bloom in perpetual prismatic light. Rainbow sprites dance among the crystalline petals.',
    requiredClarity: 250,
    lightBonus: 1.5,
    color: '#FF69B4',
    icon: '🌺',
  },
  {
    id: 'shattered_terrace',
    name: 'Shattered Terrace',
    location: 'shattered_terrace',
    description: 'A vast terrace covered in fragments of broken glass that somehow form beautiful patterns when viewed from above. Silicon golems carefully rearrange them.',
    requiredClarity: 500,
    lightBonus: 1.8,
    color: '#B0C4DE',
    icon: '💥',
  },
  {
    id: 'obsidian_mirror',
    name: 'Obsidian Mirror',
    location: 'obsidian_mirror',
    description: 'A perfectly flat obsidian surface the size of a lake that reflects not what is, but what could be. Diamond wraiths guard its edges.',
    requiredClarity: 800,
    lightBonus: 2.0,
    color: '#1C1C2E',
    icon: '🪞',
  },
  {
    id: 'amber_vault',
    name: 'Amber Vault',
    location: 'amber_vault',
    description: 'A vault of warm amber glass that preserves everything within it perfectly. The oldest artifacts and secrets of the realm are stored here.',
    requiredClarity: 1200,
    lightBonus: 2.3,
    color: GX_COLOR_AMBER_GOLD,
    icon: '🏦',
  },
  {
    id: 'silica_cathedral',
    name: 'Silica Cathedral',
    location: 'silica_cathedral',
    description: 'A cathedral constructed entirely from silica glass so pure it is invisible. Only the refraction of light reveals its magnificent architecture.',
    requiredClarity: 1800,
    lightBonus: 2.7,
    color: '#E0FFFF',
    icon: '⛪',
  },
  {
    id: 'diamond_core',
    name: 'Diamond Core',
    location: 'diamond_core',
    description: 'The heart of the Glass Realm, a sphere of compressed diamond energy that generates all the light and clarity that sustains the crystalline dimension.',
    requiredClarity: 3000,
    lightBonus: 3.5,
    color: '#F0F8FF',
    icon: '💎',
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// GX_MATERIALS (30)
// ═══════════════════════════════════════════════════════════════════════════

export const GX_MATERIALS: GxMaterialDef[] = [
  // ── Common (10) ──────────────────────────────────────────────
  {
    id: 'prismatic_glass',
    name: 'Prismatic Glass',
    rarity: 'Common',
    source: 'Crystal Apex surface deposits',
    description: 'Basic glass that shimmers with faint rainbow colors when light passes through. The fundamental building block of the realm.',
  },
  {
    id: 'crystal_shard',
    name: 'Crystal Shard',
    rarity: 'Common',
    source: 'Shattered Terrace fragments',
    description: 'A sharp fragment of pure crystal, useful for cutting and shaping other glass materials.',
  },
  {
    id: 'opal_dust',
    name: 'Opal Dust',
    rarity: 'Common',
    source: 'Opal Giant skin shedding',
    description: 'Fine iridescent powder shed by opal giants. Adds shimmer to any glass mixture.',
  },
  {
    id: 'silica_sand',
    name: 'Silica Sand',
    rarity: 'Common',
    source: 'Shattered Terrace beaches',
    description: 'Pure white sand ground from crystallized silica. The base ingredient for all glass forging.',
  },
  {
    id: 'frost_quartz',
    name: 'Frost Quartz',
    rarity: 'Common',
    source: 'Crystal Apex ice caves',
    description: 'Quartz that is naturally cold to the touch. Used to create frosted glass effects.',
  },
  {
    id: 'light_dew',
    name: 'Light Dew',
    rarity: 'Common',
    source: 'Prism Garden morning condensation',
    description: 'Drops of condensed light that collect on glass flowers at dawn. A mild clarity booster.',
  },
  {
    id: 'glass_resin',
    name: 'Glass Resin',
    rarity: 'Common',
    source: 'Silica Cathedral sap flows',
    description: 'A sticky, transparent resin that bonds glass pieces together with exceptional strength.',
  },
  {
    id: 'mirror_sliver',
    name: 'Mirror Sliver',
    rarity: 'Common',
    source: 'Obsidian Mirror edge chips',
    description: 'A thin sliver of mirrored glass that reflects with perfect fidelity despite its small size.',
  },
  {
    id: 'prism_moth_scale',
    name: 'Prism Moth Scale',
    rarity: 'Common',
    source: 'Prism Garden moth colonies',
    description: 'A single iridescent scale from a prism moth. Collecting many creates potent prismatic compounds.',
  },
  {
    id: 'amber_pebble',
    name: 'Amber Pebble',
    rarity: 'Common',
    source: 'Amber Vault floor deposits',
    description: 'A small warm pebble of amber glass that radiates gentle golden light indefinitely.',
  },

  // ── Uncommon (8) ─────────────────────────────────────────────
  {
    id: 'refractive_crystal',
    name: 'Refractive Crystal',
    rarity: 'Uncommon',
    source: 'Refraction Hall deep deposits',
    description: 'A crystal with extraordinary light-bending properties. Essential for crafting precision optical devices.',
  },
  {
    id: 'frozen_spark',
    name: 'Frozen Spark',
    rarity: 'Uncommon',
    source: 'Diamond Core periphery',
    description: 'A spark of diamond energy trapped in ice crystal. Emits cold light that never fades.',
  },
  {
    id: 'serpent_scale',
    name: 'Crystal Serpent Scale',
    rarity: 'Uncommon',
    source: 'Crystal Serpent molting',
    description: 'A translucent scale from a crystal serpent. Extremely durable and razor-sharp along the edges.',
  },
  {
    id: 'phoenix_tear',
    name: 'Phoenix Glass Tear',
    rarity: 'Uncommon',
    source: 'Glass Phoenix emotional shedding',
    description: 'A teardrop of molten glass shed by a glass phoenix during emotional peaks. Contains trace phoenix fire.',
  },
  {
    id: 'walker_core_shard',
    name: 'Walker Core Shard',
    rarity: 'Uncommon',
    source: 'Decommissioned Prism Walkers',
    description: 'A fragment from the core crystal of a prism walker. Still pulses with residual directional energy.',
  },
  {
    id: 'spectrum_thread',
    name: 'Spectrum Thread',
    rarity: 'Uncommon',
    source: 'Rainbow Sprite silk weaving',
    description: 'A thread of pure spectrum light woven into a tangible filament by rainbow sprites.',
  },
  {
    id: 'giant_bone_glass',
    name: 'Giant Bone Glass',
    rarity: 'Uncommon',
    source: 'Opal Giant remains',
    description: 'A piece of the structural bone from an opal giant. Incredibly dense and strong opalescent glass.',
  },
  {
    id: 'wraith_essence',
    name: 'Wraith Essence',
    rarity: 'Uncommon',
    source: 'Diamond Wraith residual energy',
    description: 'Captured essence from a diamond wraith\'s phase trail. Enables partial transparency in crafted items.',
  },

  // ── Rare (7) ─────────────────────────────────────────────────
  {
    id: 'diamond_dust',
    name: 'Diamond Dust',
    rarity: 'Rare',
    source: 'Diamond Core mining operations',
    description: 'Microscopic diamond particles from the core of the realm. The most valuable abrasive in existence.',
  },
  {
    id: 'obsidian_heart',
    name: 'Obsidian Heart',
    rarity: 'Rare',
    source: 'Obsidian Mirror deep veins',
    description: 'The core of a large obsidian glass formation. Pulsates with absorbed light energy.',
  },
  {
    id: 'aurora_crystal',
    name: 'Aurora Crystal',
    rarity: 'Rare',
    source: 'Upper realm atmosphere',
    description: 'A crystal that formed in the aurora of the Glass Realm\'s sky. Shifts between all colors continuously.',
  },
  {
    id: 'eternal_flame_shard',
    name: 'Eternal Flame Shard',
    rarity: 'Rare',
    source: 'Glass Phoenix rebirth sites',
    description: 'A shard from a phoenix\'s rebirth cocoon. Burns with fire that consumes no fuel.',
  },
  {
    id: 'prism_seed',
    name: 'Prism Seed',
    rarity: 'Rare',
    source: 'Prism Garden ancient trees',
    description: 'A seed from a prism tree that, when planted, grows into a new source of refracted light.',
  },
  {
    id: 'void_mercury',
    name: 'Void Mercury',
    rarity: 'Rare',
    source: 'Spaces between prisms',
    description: 'Liquid glass from the void between dimensions. Impossible to contain in anything but diamond.',
  },
  {
    id: 'silicon_soul',
    name: 'Silicon Soul',
    rarity: 'Rare',
    source: 'Silicon Golem consciousness extraction',
    description: 'The crystallized consciousness of a silicon golem. Contains memories and combat experience.',
  },

  // ── Epic (3) ─────────────────────────────────────────────────
  {
    id: 'genesis_spark',
    name: 'Genesis Spark',
    rarity: 'Epic',
    source: 'Realm creation residue',
    description: 'A spark of the original creation energy that birthed the Glass Realm. Can create glass from nothing.',
  },
  {
    id: 'infinity_prism',
    name: 'Infinity Prism',
    rarity: 'Epic',
    source: 'Refraction Hall anomaly',
    description: 'A prism that creates infinite reflections, each containing a perfect copy of any object placed before it.',
  },
  {
    id: 'star_glass',
    name: 'Star Glass',
    rarity: 'Epic',
    source: 'Crystallized starlight',
    description: 'Glass forged from the light of captured stars. Warm, heavy, and imbued with cosmic energy.',
  },

  // ── Legendary (2) ────────────────────────────────────────────
  {
    id: 'realm_crystal',
    name: 'Realm Crystal',
    rarity: 'Legendary',
    source: 'The Diamond Core itself',
    description: 'A fragment of the Diamond Core itself. Contains the fundamental code of the Glass Realm\'s reality. Indescribably powerful.',
  },
  {
    id: 'void_diamond',
    name: 'Void Diamond',
    rarity: 'Legendary',
    source: 'The space between all realities',
    description: 'A diamond that exists in all realities simultaneously. Looking into it reveals not reflections, but other versions of the observer.',
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// GX_STRUCTURES (25, upgradeable to level 10)
// ═══════════════════════════════════════════════════════════════════════════

export const GX_STRUCTURES: GxStructureDef[] = [
  // ── Glass Forging (5) ────────────────────────────────────────
  {
    id: 'glass_kiln',
    name: 'Glass Kiln',
    category: 'forging',
    maxLevel: 10,
    baseCost: 50,
    upgradeMultiplier: 1.4,
    description: 'A basic kiln for smelting raw silica into usable glass. The foundation of all glass crafting.',
    effectPerLevel: '+5% smelting speed per level',
    icon: '🔥',
  },
  {
    id: 'prism_forge',
    name: 'Prism Forge',
    category: 'forging',
    maxLevel: 10,
    baseCost: 150,
    upgradeMultiplier: 1.5,
    description: 'A specialized forge for crafting prisms with precise angles and perfect optical clarity.',
    effectPerLevel: '+8% prism quality per level',
    icon: '🔨',
  },
  {
    id: 'diamond_anvil',
    name: 'Diamond Anvil',
    category: 'forging',
    maxLevel: 10,
    baseCost: 400,
    upgradeMultiplier: 1.6,
    description: 'An anvil of compressed diamond for working the hardest glass materials in the realm.',
    effectPerLevel: '+10% forging efficiency per level',
    icon: '⚒️',
  },
  {
    id: 'light_crucible',
    name: 'Light Crucible',
    category: 'forging',
    maxLevel: 10,
    baseCost: 800,
    upgradeMultiplier: 1.7,
    description: 'A crucible that uses focused light to melt and fuse materials impossible to heat by conventional means.',
    effectPerLevel: '+12% rare material success rate per level',
    icon: '⚗️',
  },
  {
    id: 'genesis_oven',
    name: 'Genesis Oven',
    category: 'forging',
    maxLevel: 10,
    baseCost: 2000,
    upgradeMultiplier: 1.8,
    description: 'The ultimate forge, powered by genesis sparks. Can create glass artifacts from pure clarity energy.',
    effectPerLevel: '+15% artifact power per level',
    icon: '🌟',
  },

  // ── Golem Facilities (4) ──────────────────────────────────────
  {
    id: 'golem_pen',
    name: 'Golem Pen',
    category: 'golem',
    maxLevel: 10,
    baseCost: 60,
    upgradeMultiplier: 1.3,
    description: 'A pen of reinforced glass for housing and taming wild glass golems.',
    effectPerLevel: '+2 golem capacity per level',
    icon: '🏠',
  },
  {
    id: 'training_arena',
    name: 'Crystal Training Arena',
    category: 'golem',
    maxLevel: 10,
    baseCost: 200,
    upgradeMultiplier: 1.4,
    description: 'An arena where golems train and increase their power through controlled combat.',
    effectPerLevel: '+5% golem XP gain per level',
    icon: '🏟️',
  },
  {
    id: 'healing_sanctuary',
    name: 'Glass Healing Sanctuary',
    category: 'golem',
    maxLevel: 10,
    baseCost: 350,
    upgradeMultiplier: 1.5,
    description: 'A sanctuary of healing light that repairs damaged golems and restores their crystalline structure.',
    effectPerLevel: '+8% healing speed per level',
    icon: '🏥',
  },
  {
    id: 'evolution_chamber',
    name: 'Golem Evolution Chamber',
    category: 'golem',
    maxLevel: 10,
    baseCost: 700,
    upgradeMultiplier: 1.6,
    description: 'A chamber that can evolve golems to higher rarity forms using rare materials.',
    effectPerLevel: '+5% evolution success rate per level',
    icon: '🧬',
  },

  // ── Prism Buildings (4) ──────────────────────────────────────
  {
    id: 'prism_stand',
    name: 'Prism Stand',
    category: 'prism',
    maxLevel: 10,
    baseCost: 80,
    upgradeMultiplier: 1.3,
    description: 'A simple stand that holds a prism and captures its refracted light for practical use.',
    effectPerLevel: '+3 clarity per hour per level',
    icon: '📐',
  },
  {
    id: 'light_collector',
    name: 'Light Collector Array',
    category: 'prism',
    maxLevel: 10,
    baseCost: 250,
    upgradeMultiplier: 1.4,
    description: 'An array of crystal collectors that gathers ambient light from across the realm.',
    effectPerLevel: '+8 light collection per hour per level',
    icon: '☀️',
  },
  {
    id: 'refraction_tower',
    name: 'Refraction Tower',
    category: 'prism',
    maxLevel: 10,
    baseCost: 500,
    upgradeMultiplier: 1.5,
    description: 'A tall tower with prismatic windows that amplifies and redirects light to distant locations.',
    effectPerLevel: '+10% light amplification per level',
    icon: '🗼',
  },
  {
    id: 'prism_citadel',
    name: 'Prism Citadel',
    category: 'prism',
    maxLevel: 10,
    baseCost: 1500,
    upgradeMultiplier: 1.7,
    description: 'The ultimate prism structure, a citadel that commands all refracted light in the realm.',
    effectPerLevel: '+15% all prism bonuses per level',
    icon: '🏰',
  },

  // ── Material Processing (4) ──────────────────────────────────
  {
    id: 'sand_sifter',
    name: 'Sand Sifter',
    category: 'material',
    maxLevel: 10,
    baseCost: 40,
    upgradeMultiplier: 1.3,
    description: 'A mechanical sifter that separates pure silica from impure sand deposits.',
    effectPerLevel: '+5% material purity per level',
    icon: '🔍',
  },
  {
    id: 'dust_grinder',
    name: 'Crystal Dust Grinder',
    category: 'material',
    maxLevel: 10,
    baseCost: 120,
    upgradeMultiplier: 1.4,
    description: 'A grinder that reduces crystal shards into fine, usable dust for glass mixtures.',
    effectPerLevel: '+8% grinding yield per level',
    icon: '⚙️',
  },
  {
    id: 'alloy_chamber',
    name: 'Glass Alloy Chamber',
    category: 'material',
    maxLevel: 10,
    baseCost: 300,
    upgradeMultiplier: 1.5,
    description: 'A chamber for combining different glass materials into new, stronger alloy compounds.',
    effectPerLevel: '+2 alloy recipes per level',
    icon: '🧪',
  },
  {
    id: 'essence_extractor',
    name: 'Essence Extractor',
    category: 'material',
    maxLevel: 10,
    baseCost: 600,
    upgradeMultiplier: 1.6,
    description: 'Extracts the pure essence from rare materials, concentrating their properties.',
    effectPerLevel: '+10% extraction efficiency per level',
    icon: '⚗️',
  },

  // ── Storage & Preservation (4) ───────────────────────────────
  {
    id: 'glass_vault',
    name: 'Glass Storage Vault',
    category: 'storage',
    maxLevel: 10,
    baseCost: 70,
    upgradeMultiplier: 1.3,
    description: 'A temperature-controlled vault for storing raw materials safely.',
    effectPerLevel: '+50 material storage per level',
    icon: '🏦',
  },
  {
    id: 'artifact_display',
    name: 'Artifact Display Hall',
    category: 'storage',
    maxLevel: 10,
    baseCost: 200,
    upgradeMultiplier: 1.4,
    description: 'A hall with illuminated display cases for exhibiting forged glass artifacts.',
    effectPerLevel: '+3 artifact display slots per level',
    icon: '🖼️',
  },
  {
    id: 'amber_preserve',
    name: 'Amber Preservation Unit',
    category: 'storage',
    maxLevel: 10,
    baseCost: 350,
    upgradeMultiplier: 1.5,
    description: 'Uses amber glass to perfectly preserve materials and prevent degradation over time.',
    effectPerLevel: '+10% preservation rate per level',
    icon: '🍯',
  },
  {
    id: 'void_storage',
    name: 'Void Storage Pocket',
    category: 'storage',
    maxLevel: 10,
    baseCost: 900,
    upgradeMultiplier: 1.7,
    description: 'A pocket dimension of void glass that provides infinite storage space for items.',
    effectPerLevel: '+100 void storage slots per level',
    icon: '🕳️',
  },

  // ── Utility & Defense (4) ────────────────────────────────────
  {
    id: 'clarity_beacon',
    name: 'Clarity Beacon',
    category: 'utility',
    maxLevel: 10,
    baseCost: 100,
    upgradeMultiplier: 1.4,
    description: 'A beacon that emits pulses of pure clarity, boosting all nearby activity.',
    effectPerLevel: '+5% global clarity gain per level',
    icon: '💡',
  },
  {
    id: 'glass_wall',
    name: 'Reinforced Glass Wall',
    category: 'utility',
    maxLevel: 10,
    baseCost: 180,
    upgradeMultiplier: 1.5,
    description: 'A wall of laminated crystal glass that protects structures from external threats.',
    effectPerLevel: '+10% defense per level',
    icon: '🧱',
  },
  {
    id: 'prism_gate',
    name: 'Prism Transportation Gate',
    category: 'utility',
    maxLevel: 10,
    baseCost: 500,
    upgradeMultiplier: 1.6,
    description: 'A gate that uses prismatic light to teleport between unlocked realm locations.',
    effectPerLevel: '-8% teleport cooldown per level',
    icon: '🚪',
  },
  {
    id: 'diamond_shield',
    name: 'Diamond Shield Generator',
    category: 'utility',
    maxLevel: 10,
    baseCost: 1200,
    upgradeMultiplier: 1.8,
    description: 'Generates a protective diamond glass shield over the entire realm settlement.',
    effectPerLevel: '+15% shield strength per level',
    icon: '🛡️',
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// GX_ABILITIES (22)
// ═══════════════════════════════════════════════════════════════════════════

export const GX_ABILITIES: GxAbilityDef[] = [
  // ── Common (6) ───────────────────────────────────────────────
  {
    id: 'glass_shard_barrage',
    name: 'Glass Shard Barrage',
    description: 'Launch a volley of razor-sharp glass shards that deal light damage and cause bleeding.',
    cooldown: 2,
    power: 8,
    element: 'Clear',
    rarity: 'Common',
    clarityCost: 5,
    icon: '💢',
  },
  {
    id: 'frost_ray',
    name: 'Frost Ray',
    description: 'Emit a ray of frozen light through a frosted glass conduit, slowing and chilling the target.',
    cooldown: 3,
    power: 10,
    element: 'Ice',
    rarity: 'Common',
    clarityCost: 8,
    icon: '❄️',
  },
  {
    id: 'amber_glow_heal',
    name: 'Amber Glow Heal',
    description: 'Radiate warm amber light that heals wounds and soothes cracked glass surfaces.',
    cooldown: 4,
    power: 12,
    element: 'Fire',
    rarity: 'Common',
    clarityCost: 7,
    icon: '💛',
  },
  {
    id: 'crystal_barrier',
    name: 'Crystal Barrier',
    description: 'Summon a barrier of crystal glass that absorbs incoming damage and reflects light.',
    cooldown: 5,
    power: 15,
    element: 'Light',
    rarity: 'Common',
    clarityCost: 10,
    icon: '🛡️',
  },
  {
    id: 'opal_shimmer',
    name: 'Opal Shimmer',
    description: 'Create a dazzling opalescent flash that confuses enemies and reveals hidden objects.',
    cooldown: 3,
    power: 8,
    element: 'Astral',
    rarity: 'Common',
    clarityCost: 6,
    icon: '✨',
  },
  {
    id: 'mirror_flash',
    name: 'Mirror Flash',
    description: 'Reflect concentrated light off mirrored glass to temporarily blind all nearby threats.',
    cooldown: 4,
    power: 10,
    element: 'Light',
    rarity: 'Common',
    clarityCost: 8,
    icon: '🪞',
  },

  // ── Uncommon (6) ─────────────────────────────────────────────
  {
    id: 'prismatic_burst',
    name: 'Prismatic Burst',
    description: 'Detonate a prismatic glass orb, releasing a rainbow explosion of all elemental damage types.',
    cooldown: 8,
    power: 25,
    element: 'Astral',
    rarity: 'Uncommon',
    clarityCost: 18,
    icon: '🌈',
  },
  {
    id: 'obsidian_spike',
    name: 'Obsidian Spike',
    description: 'Launch a spike of obsidian glass that pierces through all defenses and armor.',
    cooldown: 6,
    power: 28,
    element: 'Shadow',
    rarity: 'Uncommon',
    clarityCost: 20,
    icon: '🗡️',
  },
  {
    id: 'phantom_phase',
    name: 'Phantom Phase',
    description: 'Phase through solid matter by temporarily entering the void between glass dimensions.',
    cooldown: 10,
    power: 20,
    element: 'Void',
    rarity: 'Uncommon',
    clarityCost: 22,
    icon: '👻',
  },
  {
    id: 'crystal_beam_focus',
    name: 'Crystal Beam Focus',
    description: 'Fire a concentrated beam of focused crystal light that cuts through any material.',
    cooldown: 7,
    power: 30,
    element: 'Light',
    rarity: 'Uncommon',
    clarityCost: 15,
    icon: '🔦',
  },
  {
    id: 'ember_storm',
    name: 'Ember Storm',
    description: 'Summon a storm of glass embers that swirl around, burning and blinding enemies.',
    cooldown: 9,
    power: 26,
    element: 'Fire',
    rarity: 'Uncommon',
    clarityCost: 20,
    icon: '🌪️',
  },
  {
    id: 'frost_cage',
    name: 'Frost Cage',
    description: 'Encase a target in a cage of frosted crystal glass that slowly freezes them solid.',
    cooldown: 12,
    power: 32,
    element: 'Ice',
    rarity: 'Uncommon',
    clarityCost: 25,
    icon: '🧊',
  },

  // ── Rare (5) ─────────────────────────────────────────────────
  {
    id: 'glass_construct',
    name: 'Glass Construct',
    description: 'Create a temporary glass golem construct from raw light energy that fights alongside you.',
    cooldown: 20,
    power: 50,
    element: 'Light',
    rarity: 'Rare',
    clarityCost: 40,
    icon: '🗿',
  },
  {
    id: 'void_prison',
    name: 'Void Prison',
    description: 'Trap a target in a cage of void glass that exists between dimensions, completely isolating them.',
    cooldown: 25,
    power: 55,
    element: 'Void',
    rarity: 'Rare',
    clarityCost: 45,
    icon: '⬛',
  },
  {
    id: 'spectrum_storm',
    name: 'Spectrum Storm',
    description: 'Unleash a swirling storm of every color of glass, dealing continuous prismatic damage.',
    cooldown: 22,
    power: 48,
    element: 'Astral',
    rarity: 'Rare',
    clarityCost: 42,
    icon: '🌀',
  },
  {
    id: 'obsidian_golem_summon',
    name: 'Obsidian Golem Summon',
    description: 'Summon a massive obsidian glass golem from the ground. Nearly indestructible and immensely powerful.',
    cooldown: 30,
    power: 60,
    element: 'Shadow',
    rarity: 'Rare',
    clarityCost: 50,
    icon: '🗿',
  },
  {
    id: 'phoenix_resurrection',
    name: 'Phoenix Resurrection',
    description: 'Release a phoenix of amber glass that revives fallen allies and incinerates enemies.',
    cooldown: 28,
    power: 52,
    element: 'Fire',
    rarity: 'Rare',
    clarityCost: 48,
    icon: '🔥',
  },

  // ── Epic (3) ─────────────────────────────────────────────────
  {
    id: 'crystal_palace',
    name: 'Crystal Palace',
    description: 'Summon a crystal palace that provides complete shelter, healing, and damage immunity for all allies within.',
    cooldown: 60,
    power: 100,
    element: 'Light',
    rarity: 'Epic',
    clarityCost: 80,
    icon: '🏰',
  },
  {
    id: 'phantom_eclipse',
    name: 'Phantom Eclipse',
    description: 'Plunge the area into total darkness using phantom glass. Only allies can see. Enemies are paralyzed by fear.',
    cooldown: 50,
    power: 90,
    element: 'Void',
    rarity: 'Epic',
    clarityCost: 75,
    icon: '🌑',
  },
  {
    id: 'prismatic_nova',
    name: 'Prismatic Nova',
    description: 'Detonate a prismatic nova that deals massive damage of all elements simultaneously across a huge area.',
    cooldown: 55,
    power: 95,
    element: 'Astral',
    rarity: 'Epic',
    clarityCost: 85,
    icon: '💫',
  },

  // ── Legendary (2) ────────────────────────────────────────────
  {
    id: 'genesis_creation',
    name: 'Genesis Creation',
    description: 'The original glass creation ability. Temporarily reshape reality itself through the power of living glass.',
    cooldown: 120,
    power: 200,
    element: 'Light',
    rarity: 'Legendary',
    clarityCost: 150,
    icon: '✨',
  },
  {
    id: 'void_transcendence',
    name: 'Void Transcendence',
    description: 'Step completely into the void, becoming invulnerable and omnipresent for a brief, glorious moment of transcendence.',
    cooldown: 120,
    power: 250,
    element: 'Void',
    rarity: 'Legendary',
    clarityCost: 200,
    icon: '♾️',
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// GX_ACHIEVEMENTS (18)
// ═══════════════════════════════════════════════════════════════════════════

export const GX_ACHIEVEMENTS: GxAchievementDef[] = [
  {
    id: 'first_forge',
    name: 'First Light',
    description: 'Forge your first piece of glass in the Glass Realm kiln.',
    icon: '🔥',
    condition: 'totalGlassForged >= 1',
    reward: { clarity: 25, prisms: 1 },
  },
  {
    id: 'ten_forges',
    name: 'Glass Apprentice',
    description: 'Forge 10 pieces of glass of any type.',
    icon: '🔨',
    condition: 'totalGlassForged >= 10',
    reward: { clarity: 100, prisms: 3 },
  },
  {
    id: 'hundred_forges',
    name: 'Master Forgemaster',
    description: 'Forge 100 pieces of glass. The kiln recognizes your mastery.',
    icon: '🏭',
    condition: 'totalGlassForged >= 100',
    reward: { clarity: 500, prisms: 10 },
  },
  {
    id: 'first_golem',
    name: 'First Taming',
    description: 'Successfully tame your first glass golem.',
    icon: '🐍',
    condition: 'totalGolemsTamed >= 1',
    reward: { clarity: 50, prisms: 2 },
  },
  {
    id: 'seven_golems',
    name: 'Species Collector',
    description: 'Tame at least one golem of each of the 7 species.',
    icon: '🧬',
    condition: 'tamedSpeciesCount >= 7',
    reward: { clarity: 300, prisms: 8 },
  },
  {
    id: 'all_golems',
    name: 'Golem Overlord',
    description: 'Tame all 35 glass golems across every rarity and species.',
    icon: '👑',
    condition: 'golemsTamed.length >= 35',
    reward: { clarity: 2000, prisms: 30 },
  },
  {
    id: 'first_prism',
    name: 'Prism Builder',
    description: 'Construct your first prism at any realm location.',
    icon: '🔺',
    condition: 'totalPrismsBuilt >= 1',
    reward: { clarity: 40, prisms: 2 },
  },
  {
    id: 'all_prisms',
    name: 'Realm Illuminator',
    description: 'Build prisms at all 8 realm locations.',
    icon: '💡',
    condition: 'prismsFormed.length >= 8',
    reward: { clarity: 1500, prisms: 25 },
  },
  {
    id: 'first_artifact',
    name: 'Artisan\'s First Creation',
    description: 'Forge your first legendary glass artifact.',
    icon: '💎',
    condition: 'totalArtifactsForged >= 1',
    reward: { clarity: 75, prisms: 3 },
  },
  {
    id: 'five_artifacts',
    name: 'Artifact Collector',
    description: 'Forge and collect 5 different glass artifacts.',
    icon: '🏺',
    condition: 'artifacts.length >= 5',
    reward: { clarity: 400, prisms: 10 },
  },
  {
    id: 'epic_artifact',
    name: 'Epic Craftsman',
    description: 'Forge an artifact of Epic or higher rarity.',
    icon: '⚡',
    condition: 'hasEpicArtifact',
    reward: { clarity: 800, prisms: 15 },
  },
  {
    id: 'ten_materials',
    name: 'Material Gatherer',
    description: 'Collect at least 10 different types of glass materials.',
    icon: '🧲',
    condition: 'uniqueMaterialCount >= 10',
    reward: { clarity: 150, prisms: 5 },
  },
  {
    id: 'all_materials',
    name: 'Hoarder of Glass',
    description: 'Collect all 30 types of glass materials.',
    icon: '📚',
    condition: 'uniqueMaterialCount >= 30',
    reward: { clarity: 1200, prisms: 20 },
  },
  {
    id: 'clarity_500',
    name: 'Clarity Seeker',
    description: 'Reach 500 total clarity.',
    icon: '👁️',
    condition: 'clarity >= 500',
    reward: { clarity: 100, prisms: 5 },
  },
  {
    id: 'clarity_3000',
    name: 'Diamond Core Access',
    description: 'Reach 3000 clarity to unlock the Diamond Core.',
    icon: '💎',
    condition: 'clarity >= 3000',
    reward: { clarity: 500, prisms: 20 },
  },
  {
    id: 'max_structure',
    name: 'Architect Supreme',
    description: 'Upgrade any structure to its maximum level of 10.',
    icon: '🏗️',
    condition: 'hasMaxStructure',
    reward: { clarity: 300, prisms: 8 },
  },
  {
    id: 'first_shatter',
    name: 'Breaker of Glass',
    description: 'Shatter your first glass item to reclaim materials.',
    icon: '💥',
    condition: 'totalShatters >= 1',
    reward: { clarity: 20, prisms: 1 },
  },
  {
    id: 'level_50',
    name: 'Glass Immortal',
    description: 'Reach Glass Realm level 50.',
    icon: '🌟',
    condition: 'level >= 50',
    reward: { clarity: 3000, prisms: 50 },
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// GX_TITLES (8, Glass Shard → Crystal Deity)
// ═══════════════════════════════════════════════════════════════════════════

export const GX_TITLES: GxTitleDef[] = [
  {
    id: 'glass_shard',
    name: 'Glass Shard',
    levelReq: 1,
    icon: '🔷',
    description: 'A beginner who has just entered the Glass Realm. Fragile, but full of potential.',
    color: '#B0C4DE',
  },
  {
    id: 'prism_apprentice',
    name: 'Prism Apprentice',
    levelReq: 5,
    icon: '🔺',
    description: 'An apprentice learning the art of light refraction and glass forging.',
    color: GX_COLOR_GLASS_CYAN,
  },
  {
    id: 'crystal_artisan',
    name: 'Crystal Artisan',
    levelReq: 12,
    icon: '💎',
    description: 'A skilled artisan who can craft glass of remarkable quality and beauty.',
    color: '#00E676',
  },
  {
    id: 'golem_master',
    name: 'Golem Master',
    levelReq: 20,
    icon: '🗿',
    description: 'A master of glass golems, commanding creatures of living crystal.',
    color: GX_COLOR_PRISMATIC_RAINBOW,
  },
  {
    id: 'prism_scholar',
    name: 'Prism Scholar',
    levelReq: 30,
    icon: '📖',
    description: 'A scholar who understands the deepest secrets of light and refraction.',
    color: '#818CF8',
  },
  {
    id: 'obsidian_lord',
    name: 'Obsidian Lord',
    levelReq: 40,
    icon: '👑',
    description: 'A lord of obsidian glass, commanding the darkness and the reflections within.',
    color: '#DDA0DD',
  },
  {
    id: 'diamond_sage',
    name: 'Diamond Sage',
    levelReq: 55,
    icon: '✨',
    description: 'A sage whose wisdom is as flawless and eternal as diamond.',
    color: GX_COLOR_AMBER_GOLD,
  },
  {
    id: 'crystal_deity',
    name: 'Crystal Deity',
    levelReq: 75,
    icon: '♾️',
    description: 'A deity of the Glass Realm, commanding all glass, light, and crystal.',
    color: GX_COLOR_CRYSTAL_WHITE,
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// GX_ARTIFACTS (15 legendary artifacts)
// ═══════════════════════════════════════════════════════════════════════════

export const GX_ARTIFACTS: GxArtifactDef[] = [
  // ── Common (3) ───────────────────────────────────────────────
  {
    id: 'glass_vial_clarity',
    name: 'Vial of Clarity',
    rarity: 'Common',
    description: 'A simple vial that makes murky liquids perfectly clear. Essential for any glass apprentice.',
    power: 5,
    abilities: ['Purify', 'Inspect'],
    golemBonus: 'crystal_serpent',
    icon: '🧪',
  },
  {
    id: 'frost_bead_eternal',
    name: 'Eternal Frost Bead',
    rarity: 'Common',
    description: 'A small bead that stays perpetually cold, radiating a gentle chill that soothes cracked glass.',
    power: 7,
    abilities: ['Cool', 'Preserve'],
    golemBonus: 'glass_phoenix',
    icon: '🔵',
  },
  {
    id: 'amber_charm_sun',
    name: 'Amber Sun Charm',
    rarity: 'Common',
    description: 'A charm of amber glass that captures a ray of sunlight and releases it on command.',
    power: 6,
    abilities: ['Warm', 'Illuminate'],
    golemBonus: 'rainbow_sprite',
    icon: '💛',
  },

  // ── Uncommon (3) ─────────────────────────────────────────────
  {
    id: 'crystal_orb_foresight',
    name: 'Crystal Orb of Foresight',
    rarity: 'Uncommon',
    description: 'A flawless crystal sphere that shows blurred images of possible futures when heated.',
    power: 15,
    abilities: ['Predict', 'Scry'],
    golemBonus: 'diamond_wraith',
    icon: '🔮',
  },
  {
    id: 'obsidian_shield_dark',
    name: 'Obsidian Shield of Dark',
    rarity: 'Uncommon',
    description: 'A thick slab of obsidian glass that absorbs impacts. The surface ripples when struck.',
    power: 18,
    abilities: ['Protect', 'Absorb'],
    golemBonus: 'silicon_golem',
    icon: '🛡️',
  },
  {
    id: 'prismatic_kaleidoscope',
    name: 'Prismatic Kaleidoscope',
    rarity: 'Uncommon',
    description: 'An ever-shifting kaleidoscope that creates infinite geometric patterns from ambient light.',
    power: 14,
    abilities: ['Create', 'Distract'],
    golemBonus: 'prism_walker',
    icon: '🌀',
  },

  // ── Rare (4) ─────────────────────────────────────────────────
  {
    id: 'crystal_staff_refraction',
    name: 'Staff of Refraction',
    rarity: 'Rare',
    description: 'A staff topped with a perfect crystal that bends any light beam to follow complex paths.',
    power: 35,
    abilities: ['Refract', 'Redirect', 'Amplify'],
    golemBonus: 'crystal_serpent',
    icon: '🪄',
  },
  {
    id: 'phantom_skeleton_key',
    name: 'Phantom Skeleton Key',
    rarity: 'Rare',
    description: 'A key of phantom glass that can unlock any physical or magical lock in the realm.',
    power: 42,
    abilities: ['Unlock', 'Phase', 'Access'],
    golemBonus: 'diamond_wraith',
    icon: '🔑',
  },
  {
    id: 'emerald_garden_orb',
    name: 'Emerald Garden Orb',
    rarity: 'Rare',
    description: 'Contains a miniature living garden inside. Plants grow at accelerated speed near it.',
    power: 30,
    abilities: ['Grow', 'Heal', 'Sustain'],
    golemBonus: 'opal_giant',
    icon: '🌿',
  },
  {
    id: 'amber_sundial_ages',
    name: 'Amber Sundial of Ages',
    rarity: 'Rare',
    description: 'An ancient sundial that can slow or accelerate the passage of time in a small area.',
    power: 36,
    abilities: ['Time Control', 'Age', 'Restore'],
    golemBonus: 'glass_phoenix',
    icon: '⏰',
  },

  // ── Epic (3) ─────────────────────────────────────────────────
  {
    id: 'crystal_throne_architect',
    name: 'Crystal Throne of the Architect',
    rarity: 'Epic',
    description: 'A throne carved from a single massive crystal. Sitting upon it grants mastery over all glass.',
    power: 75,
    abilities: ['Command', 'Create', 'Control', 'Transcend'],
    golemBonus: 'prism_walker',
    icon: '👑',
  },
  {
    id: 'obsidian_leviathan_scale',
    name: 'Obsidian Leviathan Scale',
    rarity: 'Epic',
    description: 'A scale from the legendary glass leviathan. Converts all damage absorbed into energy.',
    power: 80,
    abilities: ['Absorb', 'Convert', 'Shield', 'Unbreakable'],
    golemBonus: 'silicon_golem',
    icon: '🐉',
  },
  {
    id: 'prismatic_all_seeing_eye',
    name: 'Prismatic All-Seeing Eye',
    rarity: 'Epic',
    description: 'An eye of prismatic glass that sees through all illusions and reveals the true form of everything.',
    power: 72,
    abilities: ['True Sight', 'Reveal', 'Nullify', 'Perceive'],
    golemBonus: 'rainbow_sprite',
    icon: '👁️',
  },

  // ── Legendary (2) ────────────────────────────────────────────
  {
    id: 'genesis_prism_creation',
    name: 'Genesis Prism of Creation',
    rarity: 'Legendary',
    description: 'The first prism ever created, said to have refracted the light that created the Glass Realm. Can create glass from nothing.',
    power: 150,
    abilities: ['Create', 'Genesis', 'Reality Warp', 'Omniscience', 'Transcend'],
    golemBonus: 'all_species',
    icon: '💠',
  },
  {
    id: 'void_glass_heart_eternity',
    name: 'Void Glass Heart of Eternity',
    rarity: 'Legendary',
    description: 'The crystallized heart of the void itself. Grants eternal life and the power to walk between all realities.',
    power: 200,
    abilities: ['Eternal', 'Void Walk', 'Reality Shift', 'Omnipresence', 'Transcend'],
    golemBonus: 'all_species',
    icon: '🖤',
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// GX_EVENTS (12)
// ═══════════════════════════════════════════════════════════════════════════

export const GX_EVENTS: GxEventDef[] = [
  {
    id: 'prism_festival',
    name: 'Festival of Prisms',
    description: 'A grand celebration where all prisms in the realm shine at maximum intensity, doubling clarity gains for the duration.',
    duration: 24,
    reward: '+100% clarity for 24 hours',
    requirement: 'Form at least 1 prism',
    icon: '🎉',
    color: GX_COLOR_PRISMATIC_RAINBOW,
  },
  {
    id: 'golem_uprising',
    name: 'Golem Uprising',
    description: 'Wild glass golems emerge from the Shattered Terrace. Tame them for bonus rewards and exclusive rare golems.',
    duration: 48,
    reward: 'Rare golem taming chance +50%',
    requirement: 'Reach level 5',
    icon: '🗿',
    color: '#B0C4DE',
  },
  {
    id: 'diamond_rain',
    name: 'Diamond Rain',
    description: 'A meteor shower of diamond particles rains across the realm. Collect diamond dust and void diamonds.',
    duration: 12,
    reward: '2x diamond material drops',
    requirement: 'Visit Crystal Apex',
    icon: '💎',
    color: GX_COLOR_CRYSTAL_WHITE,
  },
  {
    id: 'phantom_eclipse',
    name: 'Phantom Eclipse',
    description: 'The realm plunges into twilight as phantom glass fills the sky. Wraith abilities are enhanced, void materials appear.',
    duration: 6,
    reward: '+100% void material spawns',
    requirement: 'Reach level 15',
    icon: '🌑',
    color: '#DDA0DD',
  },
  {
    id: 'amber_bloom',
    name: 'Amber Bloom Season',
    description: 'The Amber Vault flowers bloom, producing rare amber pebbles and eternal flame shards in abundance.',
    duration: 36,
    reward: '3x amber material drops',
    requirement: 'Unlock Amber Vault',
    icon: '🌸',
    color: GX_COLOR_AMBER_GOLD,
  },
  {
    id: 'crystal_surge',
    name: 'Crystal Surge',
    description: 'A surge of crystalline energy flows through the realm, boosting all crystal serpent abilities.',
    duration: 18,
    reward: '+50% serpent power',
    requirement: 'Own a crystal serpent',
    icon: '⚡',
    color: '#00CED1',
  },
  {
    id: 'rainbow_convergence',
    name: 'Rainbow Convergence',
    description: 'All seven colors of the spectrum align, creating a rare convergence that enhances prismatic abilities.',
    duration: 8,
    reward: 'All prismatic abilities doubled',
    requirement: 'Own 3 prisms',
    icon: '🌈',
    color: '#FF69B4',
  },
  {
    id: 'glass_carnival',
    name: 'Glass Carnival',
    description: 'A carnival of glass games and challenges. Complete mini-games to win exclusive artifacts and materials.',
    duration: 72,
    reward: 'Exclusive carnival artifacts',
    requirement: 'Reach level 10',
    icon: '🎪',
    color: '#FF6B6B',
  },
  {
    id: 'frost_shatter',
    name: 'Frost Shatter Night',
    description: 'The realm freezes over. Shatter ice glass formations to reveal hidden treasures beneath.',
    duration: 10,
    reward: 'Hidden treasure reveals',
    requirement: 'Own frost materials',
    icon: '🧊',
    color: '#87CEEB',
  },
  {
    id: 'obsidian_night',
    name: 'Obsidian Night',
    description: 'Darkness falls as obsidian glass spreads across the realm. Defend your prisms from the encroaching shadow.',
    duration: 24,
    reward: 'Exclusive obsidian artifacts',
    requirement: 'Reach level 25',
    icon: '⬛',
    color: '#1C1C2E',
  },
  {
    id: 'genesis_remembrance',
    name: 'Genesis Remembrance',
    description: 'The realm remembers its creation. Genesis sparks materialize everywhere, and forging costs are halved.',
    duration: 48,
    reward: '-50% forging costs',
    requirement: 'Reach level 35',
    icon: '✨',
    color: '#FFD700',
  },
  {
    id: 'void_breach',
    name: 'Void Breach',
    description: 'A breach opens between dimensions. Dangerous void entities emerge, but so do the rarest materials.',
    duration: 16,
    reward: 'Legendary material chance +200%',
    requirement: 'Reach level 45',
    icon: '🕳️',
    color: '#4B0082',
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// Default State
// ═══════════════════════════════════════════════════════════════════════════

const GX_DEFAULT_STATE: GlassRealmState = {
  golemsTamed: [],
  prismsFormed: [],
  materials: {},
  structures: {},
  abilitiesLearned: [],
  achievementsUnlocked: [],
  currentPrism: 'crystal_apex',
  artifacts: [],
  eventProgress: [],
  clarity: 0,
  prismsFormedCount: 0,
  level: 1,
  titleIndex: 0,
  totalGlassForged: 0,
  totalLightRefracted: 0,
  totalGolemsTamed: 0,
  totalPrismsBuilt: 0,
  totalStructuresUpgraded: 0,
  totalAbilitiesActivated: 0,
  totalMaterialsCollected: 0,
  totalArtifactsForged: 0,
  totalShatters: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// ═══════════════════════════════════════════════════════════════════════════
// Zustand Store
// ═══════════════════════════════════════════════════════════════════════════

interface GlassRealmActions {
  setGolemsTamed: (golems: string[]) => void
  setPrismsFormed: (prisms: string[]) => void
  setMaterials: (materials: Record<string, number>) => void
  setStructures: (structures: GxStructureState) => void
  setAbilitiesLearned: (abilities: string[]) => void
  setAchievementsUnlocked: (achievements: string[]) => void
  setCurrentPrism: (prism: string) => void
  setArtifacts: (artifacts: GxArtifactInstance[]) => void
  setEventProgress: (events: GxEventProgress[]) => void
  setClarity: (clarity: number) => void
  setPrismsFormedCount: (count: number) => void
  setLevel: (level: number) => void
  setTitleIndex: (index: number) => void
  setTotalGlassForged: (count: number) => void
  setTotalLightRefracted: (count: number) => void
  setTotalGolemsTamed: (count: number) => void
  setTotalPrismsBuilt: (count: number) => void
  setTotalStructuresUpgraded: (count: number) => void
  setTotalAbilitiesActivated: (count: number) => void
  setTotalMaterialsCollected: (count: number) => void
  setTotalArtifactsForged: (count: number) => void
  setTotalShatters: (count: number) => void
  setUpdatedAt: (date: string) => void
  resetRealm: () => void
  patchState: (partial: Partial<GlassRealmState>) => void
}

export type GlassRealmStore = GlassRealmState & GlassRealmActions

export const useGlassRealmStore = create<GlassRealmStore>()(
  persist(
    (set) => ({
      ...GX_DEFAULT_STATE,

      setGolemsTamed: (golems) => set({ golemsTamed: golems, updatedAt: new Date().toISOString() }),
      setPrismsFormed: (prisms) => set({ prismsFormed: prisms, updatedAt: new Date().toISOString() }),
      setMaterials: (materials) => set({ materials, updatedAt: new Date().toISOString() }),
      setStructures: (structures) => set({ structures, updatedAt: new Date().toISOString() }),
      setAbilitiesLearned: (abilities) => set({ abilitiesLearned: abilities, updatedAt: new Date().toISOString() }),
      setAchievementsUnlocked: (achievements) => set({ achievementsUnlocked: achievements, updatedAt: new Date().toISOString() }),
      setCurrentPrism: (prism) => set({ currentPrism: prism, updatedAt: new Date().toISOString() }),
      setArtifacts: (artifacts) => set({ artifacts, updatedAt: new Date().toISOString() }),
      setEventProgress: (events) => set({ eventProgress: events, updatedAt: new Date().toISOString() }),
      setClarity: (clarity) => set({ clarity, updatedAt: new Date().toISOString() }),
      setPrismsFormedCount: (count) => set({ prismsFormedCount: count, updatedAt: new Date().toISOString() }),
      setLevel: (level) => set({ level, updatedAt: new Date().toISOString() }),
      setTitleIndex: (index) => set({ titleIndex: index, updatedAt: new Date().toISOString() }),
      setTotalGlassForged: (count) => set({ totalGlassForged: count, updatedAt: new Date().toISOString() }),
      setTotalLightRefracted: (count) => set({ totalLightRefracted: count, updatedAt: new Date().toISOString() }),
      setTotalGolemsTamed: (count) => set({ totalGolemsTamed: count, updatedAt: new Date().toISOString() }),
      setTotalPrismsBuilt: (count) => set({ totalPrismsBuilt: count, updatedAt: new Date().toISOString() }),
      setTotalStructuresUpgraded: (count) => set({ totalStructuresUpgraded: count, updatedAt: new Date().toISOString() }),
      setTotalAbilitiesActivated: (count) => set({ totalAbilitiesActivated: count, updatedAt: new Date().toISOString() }),
      setTotalMaterialsCollected: (count) => set({ totalMaterialsCollected: count, updatedAt: new Date().toISOString() }),
      setTotalArtifactsForged: (count) => set({ totalArtifactsForged: count, updatedAt: new Date().toISOString() }),
      setTotalShatters: (count) => set({ totalShatters: count, updatedAt: new Date().toISOString() }),
      setUpdatedAt: (date) => set({ updatedAt: date }),
      resetRealm: () => set({
        ...GX_DEFAULT_STATE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      patchState: (partial) => set({
        ...partial,
        updatedAt: new Date().toISOString(),
      }),
    }),
    {
      name: 'glass-realm-storage',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════

function gxClamp(value: number, min: number, max: number): number {
  if (value < min) return min
  if (value > max) return max
  return value
}

function gxGenerateInstanceId(): string {
  return `gi_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Hook
// ═══════════════════════════════════════════════════════════════════════════

export default function useGlassRealm() {
  const state = useGlassRealmStore()
  const stateRef = useRef(state)

  // Keep ref in sync via useEffect only
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // ── Computed: Current Title ──────────────────────────────────
  const currentTitle = useMemo(() => {
    let title = GX_TITLES[0]
    for (const t of GX_TITLES) {
      if (state.level >= t.levelReq) {
        title = t
      }
    }
    return title
  }, [state])

  // ── Computed: Unlocked Prisms ────────────────────────────────
  const unlockedPrisms = useMemo(() => {
    return GX_PRISMS.filter((prism) => state.clarity >= prism.requiredClarity)
  }, [state])

  // ── Computed: Available Abilities ────────────────────────────
  const availableAbilities = useMemo(() => {
    return GX_ABILITIES.filter((ability) => {
      if (state.abilitiesLearned.includes(ability.id)) return false
      return true
    })
  }, [state])

  // ── Computed: Learned Abilities ──────────────────────────────
  const learnedAbilities = useMemo(() => {
    return GX_ABILITIES.filter((ability) => state.abilitiesLearned.includes(ability.id))
  }, [state])

  // ── Computed: Tamed Golems with details ─────────────────────
  const tamedGolems = useMemo(() => {
    return state.golemsTamed
      .map((id) => GX_GOLEMS.find((g) => g.id === id))
      .filter((g): g is GxGolemDef => g !== undefined)
  }, [state])

  // ── Computed: Golem Stats ───────────────────────────────────
  const golemStats = useMemo(() => {
    const bySpecies: Record<string, number> = {}
    const byRarity: Record<string, number> = {}
    let totalPower = 0

    for (const species of GX_SPECIES) {
      bySpecies[species] = 0
    }
    for (const rarity of GX_RARITY_ORDER) {
      byRarity[rarity] = 0
    }

    for (const golemId of state.golemsTamed) {
      const golem = GX_GOLEMS.find((g) => g.id === golemId)
      if (golem) {
        bySpecies[golem.species] = (bySpecies[golem.species] || 0) + 1
        byRarity[golem.rarity] = (byRarity[golem.rarity] || 0) + 1
        totalPower += golem.power
      }
    }

    const speciesCollected = Object.values(bySpecies).filter((c) => c > 0).length

    return {
      bySpecies,
      byRarity,
      totalPower,
      total: state.golemsTamed.length,
      speciesCollected,
      allSpecies: speciesCollected >= 7,
    }
  }, [state])

  // ── Computed: Structure Summary ─────────────────────────────
  const structureSummary = useMemo(() => {
    const entries = GX_STRUCTURES.map((s) => ({
      ...s,
      level: state.structures[s.id] || 0,
    }))
    const totalLevels = entries.reduce((sum, e) => sum + e.level, 0)
    const maxedCount = entries.filter((e) => e.level >= e.maxLevel).length
    return {
      entries,
      totalLevels,
      maxedCount,
      hasMaxed: maxedCount > 0,
    }
  }, [state])

  // ── Computed: Achievements with status ──────────────────────
  const achievementsWithStatus = useMemo(() => {
    return GX_ACHIEVEMENTS.map((ach) => ({
      ...ach,
      unlocked: state.achievementsUnlocked.includes(ach.id),
    }))
  }, [state])

  // ── Computed: Event status ──────────────────────────────────
  const eventsWithStatus = useMemo(() => {
    return GX_EVENTS.map((event) => {
      const progress = state.eventProgress.find((ep) => ep.eventId === event.id)
      return {
        ...event,
        active: progress !== undefined && !progress.completed,
        completed: progress?.completed ?? false,
        rewardClaimed: progress?.rewardClaimed ?? false,
        progress: progress?.progress ?? 0,
        startedAt: progress?.startedAt ?? null,
      }
    })
  }, [state])

  // ── Computed: Material counts ───────────────────────────────
  const materialInventory = useMemo(() => {
    const result: { def: GxMaterialDef; count: number }[] = []
    for (const mat of GX_MATERIALS) {
      const count = state.materials[mat.id] || 0
      if (count > 0) {
        result.push({ def: mat, count })
      }
    }
    return result
  }, [state])

  // ── Computed: Artifact inventory ────────────────────────────
  const artifactInventory = useMemo(() => {
    return state.artifacts.map((instance) => {
      const def = GX_ARTIFACTS.find((a) => a.id === instance.defId)
      return {
        instance,
        def,
      }
    }).filter((item) => item.def !== undefined) as { instance: GxArtifactInstance; def: GxArtifactDef }[]
  }, [state])

  // ── Computed: Active event bonuses ──────────────────────────
  const activeEventBonuses = useMemo(() => {
    const bonuses: { name: string; effect: string; color: string }[] = []
    for (const ep of state.eventProgress) {
      if (ep.completed || ep.rewardClaimed) continue
      const eventDef = GX_EVENTS.find((e) => e.id === ep.eventId)
      if (eventDef) {
        bonuses.push({
          name: eventDef.name,
          effect: eventDef.reward,
          color: eventDef.color,
        })
      }
    }
    return bonuses
  }, [state])

  // ── Computed: Level progress ────────────────────────────────
  const levelProgress = useMemo(() => {
    const currentTitleDef = GX_TITLES[state.titleIndex] || GX_TITLES[0]
    const nextTitleDef = GX_TITLES[state.titleIndex + 1]
    return {
      currentLevel: state.level,
      currentTitle: currentTitleDef,
      nextTitle: nextTitleDef ?? null,
      clarityToNextTitle: nextTitleDef ? nextTitleDef.levelReq - state.level : 0,
      hasTitleProgression: nextTitleDef !== undefined,
    }
  }, [state])

  // ── Computed: Overall progress stats ────────────────────────
  const overallProgress = useMemo(() => {
    const golemPct = Math.round((state.golemsTamed.length / GX_GOLEM_COUNT) * 100)
    const prismPct = Math.round((state.prismsFormed.length / GX_PRISM_COUNT) * 100)
    const materialPct = Math.round((materialInventory.length / GX_MATERIAL_COUNT) * 100)
    const achievementPct = Math.round((state.achievementsUnlocked.length / GX_ACHIEVEMENT_COUNT) * 100)
    const abilityPct = Math.round((state.abilitiesLearned.length / GX_ABILITY_COUNT) * 100)
    const artifactPct = Math.round((state.artifacts.length / GX_ARTIFACT_COUNT) * 100)
    const structureTotalLevels = Object.values(state.structures).reduce((s, l) => s + l, 0)
    const structureMaxLevels = GX_STRUCTURE_COUNT * 10
    const structurePct = Math.round((structureTotalLevels / structureMaxLevels) * 100)
    const totalPct = Math.round(
      (golemPct + prismPct + materialPct + achievementPct + abilityPct + artifactPct + structurePct) / 7
    )
    return {
      golemPct,
      prismPct,
      materialPct,
      achievementPct,
      abilityPct,
      artifactPct,
      structurePct,
      totalPct,
      overallGrade: totalPct >= 90 ? 'S' : totalPct >= 75 ? 'A' : totalPct >= 55 ? 'B' : totalPct >= 35 ? 'C' : 'D',
    }
  }, [state, materialInventory])

  // ═══════════════════════════════════════════════════════════════
  // Actions
  // ═══════════════════════════════════════════════════════════════

  // ── Forge Glass ─────────────────────────────────────────────
  const gxForgeGlass = useCallback((materialId: string) => {
    const store = useGlassRealmStore.getState()
    const material = GX_MATERIALS.find((m) => m.id === materialId)
    if (!material) return { success: false, message: 'Material not found.' }

    const currentCount = store.materials[materialId] || 0
    if (currentCount < 1) return { success: false, message: 'Not enough materials.' }

    const rarityInfo = GX_RARITY[material.rarity]
    const clarityGain = Math.floor(rarityInfo.clarityMultiplier * 10)

    useGlassRealmStore.getState().patchState({
      materials: {
        ...store.materials,
        [materialId]: currentCount - 1,
      },
      clarity: gxClamp(store.clarity + clarityGain, 0, GX_MAX_CLARITY),
      totalGlassForged: store.totalGlassForged + 1,
    })

    return { success: true, message: `Forged glass from ${material.name}! +${clarityGain} clarity.`, clarityGain }
  }, [])

  // ── Refract Light ───────────────────────────────────────────
  const gxRefractLight = useCallback((prismId: string | null) => {
    const store = useGlassRealmStore.getState()
    if (store.clarity < GX_REFRACT_CLARITY_COST) {
      return { success: false, message: 'Not enough clarity to refract light.', clarityGain: 0 }
    }

    let lightBonus = 1.0
    if (prismId) {
      const prism = GX_PRISMS.find((p) => p.id === prismId)
      if (prism) {
        lightBonus = prism.lightBonus
      }
    }

    const baseGain = 5
    const clarityGain = Math.floor(baseGain * lightBonus)

    useGlassRealmStore.getState().patchState({
      clarity: gxClamp(store.clarity - GX_REFRACT_CLARITY_COST + clarityGain, 0, GX_MAX_CLARITY),
      totalLightRefracted: store.totalLightRefracted + 1,
    })

    return { success: true, message: `Refracted light! +${clarityGain} clarity.`, clarityGain }
  }, [])

  // ── Build Prism ─────────────────────────────────────────────
  const gxBuildPrism = useCallback((prismId: string) => {
    const store = useGlassRealmStore.getState()
    const prismDef = GX_PRISMS.find((p) => p.id === prismId)
    if (!prismDef) return { success: false, message: 'Prism not found.' }

    if (store.prismsFormed.includes(prismId)) {
      return { success: false, message: 'Prism already built at this location.' }
    }

    if (store.clarity < prismDef.requiredClarity) {
      return { success: false, message: `Need ${prismDef.requiredClarity} clarity. Current: ${store.clarity}.` }
    }

    if (store.clarity < GX_BUILD_PRISM_COST) {
      return { success: false, message: `Need ${GX_BUILD_PRISM_COST} clarity to build a prism.` }
    }

    useGlassRealmStore.getState().patchState({
      prismsFormed: [...store.prismsFormed, prismId],
      clarity: store.clarity - GX_BUILD_PRISM_COST,
      prismsFormedCount: store.prismsFormedCount + 1,
      totalPrismsBuilt: store.totalPrismsBuilt + 1,
    })

    return { success: true, message: `Built ${prismDef.name}!` }
  }, [])

  // ── Shatter ─────────────────────────────────────────────────
  const gxShatter = useCallback((materialId: string) => {
    const store = useGlassRealmStore.getState()
    const currentCount = store.materials[materialId] || 0
    if (currentCount < 1) return { success: false, message: 'Nothing to shatter.', refund: 0 }

    const material = GX_MATERIALS.find((m) => m.id === materialId)
    const baseRefund = material ? Math.floor(GX_SHATTER_REFUND_RATE * 5) : 1
    const refund = Math.max(1, baseRefund)

    useGlassRealmStore.getState().patchState({
      materials: {
        ...store.materials,
        [materialId]: currentCount - 1,
      },
      clarity: gxClamp(store.clarity + refund, 0, GX_MAX_CLARITY),
      totalShatters: store.totalShatters + 1,
    })

    return { success: true, message: `Shattered ${material?.name || 'item'}. +${refund} clarity.`, refund }
  }, [])

  // ── Tame Golem ──────────────────────────────────────────────
  const gxTameGolem = useCallback((golemId: string) => {
    const store = useGlassRealmStore.getState()
    const golem = GX_GOLEMS.find((g) => g.id === golemId)
    if (!golem) return { success: false, message: 'Golem not found.' }

    if (store.golemsTamed.includes(golemId)) {
      return { success: false, message: 'Golem already tamed.' }
    }

    const rarityInfo = GX_RARITY[golem.rarity]
    const cost = Math.floor(GX_TAME_GOLEM_BASE_CLARITY * rarityInfo.clarityMultiplier)

    if (store.clarity < cost) {
      return { success: false, message: `Need ${cost} clarity to tame this golem.` }
    }

    useGlassRealmStore.getState().patchState({
      golemsTamed: [...store.golemsTamed, golemId],
      clarity: store.clarity - cost,
      totalGolemsTamed: store.totalGolemsTamed + 1,
    })

    return { success: true, message: `Tamed ${golem.name}!`, cost }
  }, [])

  // ── Upgrade Structure ───────────────────────────────────────
  const gxUpgradeStructure = useCallback((structureId: string) => {
    const store = useGlassRealmStore.getState()
    const structDef = GX_STRUCTURES.find((s) => s.id === structureId)
    if (!structDef) return { success: false, message: 'Structure not found.', newLevel: 0 }

    const currentLevel = store.structures[structureId] || 0
    if (currentLevel >= structDef.maxLevel) {
      return { success: false, message: 'Structure already at max level.', newLevel: currentLevel }
    }

    const newLevel = currentLevel + 1
    const baseCost = structDef.baseCost * Math.pow(structDef.upgradeMultiplier, currentLevel)
    const discount = currentLevel >= 5 ? GX_UPGRADE_DISCOUNT_LVL5 : 0
    const cost = Math.floor(baseCost * (1 - discount))

    if (store.clarity < cost) {
      return { success: false, message: `Need ${cost} clarity to upgrade.`, newLevel: currentLevel }
    }

    const fameGain = newLevel * 10

    useGlassRealmStore.getState().patchState({
      structures: { ...store.structures, [structureId]: newLevel },
      clarity: store.clarity - cost,
      totalStructuresUpgraded: store.totalStructuresUpgraded + 1,
    })

    return { success: true, message: `Upgraded ${structDef.name} to level ${newLevel}!`, newLevel, cost, fameGain }
  }, [])

  // ── Activate Ability ────────────────────────────────────────
  const gxActivateAbility = useCallback((abilityId: string) => {
    const store = useGlassRealmStore.getState()
    const ability = GX_ABILITIES.find((a) => a.id === abilityId)
    if (!ability) return { success: false, message: 'Ability not found.', effect: '' }

    if (!store.abilitiesLearned.includes(abilityId)) {
      return { success: false, message: 'Ability not yet learned.', effect: '' }
    }

    if (store.clarity < ability.clarityCost) {
      return { success: false, message: `Need ${ability.clarityCost} clarity.`, effect: '' }
    }

    const energyReturn = Math.floor(ability.power * 0.3)

    useGlassRealmStore.getState().patchState({
      clarity: gxClamp(store.clarity - ability.clarityCost + energyReturn, 0, GX_MAX_CLARITY),
      totalAbilitiesActivated: store.totalAbilitiesActivated + 1,
    })

    return { success: true, message: `Activated ${ability.name}!`, effect: ability.description, energyReturn }
  }, [])

  // ── Learn Ability ───────────────────────────────────────────
  const gxLearnAbility = useCallback((abilityId: string) => {
    const store = useGlassRealmStore.getState()
    const ability = GX_ABILITIES.find((a) => a.id === abilityId)
    if (!ability) return { success: false, message: 'Ability not found.' }

    if (store.abilitiesLearned.includes(abilityId)) {
      return { success: false, message: 'Ability already learned.' }
    }

    const rarityInfo = GX_RARITY[ability.rarity]
    const learnCost = Math.floor(ability.clarityCost * rarityInfo.clarityMultiplier * 2)

    if (store.clarity < learnCost) {
      return { success: false, message: `Need ${learnCost} clarity to learn this ability.` }
    }

    useGlassRealmStore.getState().patchState({
      abilitiesLearned: [...store.abilitiesLearned, abilityId],
      clarity: store.clarity - learnCost,
    })

    return { success: true, message: `Learned ${ability.name}!`, learnCost }
  }, [])

  // ── Collect Material ────────────────────────────────────────
  const gxCollectMaterial = useCallback((materialId: string, count: number = 1) => {
    const store = useGlassRealmStore.getState()
    const material = GX_MATERIALS.find((m) => m.id === materialId)
    if (!material) return { success: false, message: 'Material not found.' }

    const currentCount = store.materials[materialId] || 0
    const newCount = currentCount + count
    const rarityInfo = GX_RARITY[material.rarity]
    const clarityGain = Math.floor(count * rarityInfo.clarityMultiplier * 2)

    useGlassRealmStore.getState().patchState({
      materials: { ...store.materials, [materialId]: newCount },
      clarity: gxClamp(store.clarity + clarityGain, 0, GX_MAX_CLARITY),
      totalMaterialsCollected: store.totalMaterialsCollected + count,
    })

    return { success: true, message: `Collected ${count}x ${material.name}! +${clarityGain} clarity.`, newCount, clarityGain }
  }, [])

  // ── Forge Artifact ──────────────────────────────────────────
  const gxForgArtifact = useCallback((artifactDefId: string, requiredMaterials: { materialId: string; count: number }[]) => {
    const store = useGlassRealmStore.getState()
    const artifactDef = GX_ARTIFACTS.find((a) => a.id === artifactDefId)
    if (!artifactDef) return { success: false, message: 'Artifact definition not found.' }

    // Check materials
    for (const req of requiredMaterials) {
      const currentCount = store.materials[req.materialId] || 0
      if (currentCount < req.count) {
        return { success: false, message: `Insufficient materials.` }
      }
    }

    // Deduct materials
    const newMaterials = { ...store.materials }
    for (const req of requiredMaterials) {
      newMaterials[req.materialId] = (newMaterials[req.materialId] || 0) - req.count
    }

    const rarityInfo = GX_RARITY[artifactDef.rarity]
    const clarityGain = Math.floor(rarityInfo.clarityMultiplier * 50)

    const newInstance: GxArtifactInstance = {
      instanceId: gxGenerateInstanceId(),
      defId: artifactDefId,
      level: 1,
      equipped: false,
      forgedAt: Date.now(),
    }

    useGlassRealmStore.getState().patchState({
      materials: newMaterials,
      artifacts: [...store.artifacts, newInstance],
      clarity: gxClamp(store.clarity + clarityGain, 0, GX_MAX_CLARITY),
      totalArtifactsForged: store.totalArtifactsForged + 1,
    })

    return { success: true, message: `Forged ${artifactDef.name}! +${clarityGain} clarity.`, instance: newInstance, clarityGain }
  }, [])

  // ── Equip Artifact ──────────────────────────────────────────
  const gxEquipArtifact = useCallback((instanceId: string) => {
    const store = useGlassRealmStore.getState()
    const instance = store.artifacts.find((a) => a.instanceId === instanceId)
    if (!instance) return { success: false, message: 'Artifact not found.' }

    const newArtifacts = store.artifacts.map((a) => ({
      ...a,
      equipped: a.instanceId === instanceId ? true : (a.defId === instance.defId ? false : a.equipped),
    }))

    useGlassRealmStore.getState().setArtifacts(newArtifacts)
    return { success: true, message: `Equipped ${instanceId}.` }
  }, [])

  // ── Start Event ─────────────────────────────────────────────
  const gxStartEvent = useCallback((eventId: string) => {
    const store = useGlassRealmStore.getState()
    const eventDef = GX_EVENTS.find((e) => e.id === eventId)
    if (!eventDef) return { success: false, message: 'Event not found.' }

    const existing = store.eventProgress.find((ep) => ep.eventId === eventId)
    if (existing && !existing.completed) {
      return { success: false, message: 'Event already active.' }
    }

    const newProgress: GxEventProgress = {
      eventId,
      startedAt: Date.now(),
      progress: 0,
      completed: false,
      rewardClaimed: false,
    }

    useGlassRealmStore.getState().setEventProgress([...store.eventProgress, newProgress])
    return { success: true, message: `Started ${eventDef.name}!` }
  }, [])

  // ── Complete Event ──────────────────────────────────────────
  const gxCompleteEvent = useCallback((eventId: string) => {
    const store = useGlassRealmStore.getState()
    const eventDef = GX_EVENTS.find((e) => e.id === eventId)
    if (!eventDef) return { success: false, message: 'Event not found.' }

    const newEventProgress = store.eventProgress.map((ep) => {
      if (ep.eventId === eventId) {
        return { ...ep, completed: true }
      }
      return ep
    })

    const bonus = Math.floor(eventDef.duration * 5)
    useGlassRealmStore.getState().patchState({
      eventProgress: newEventProgress,
      clarity: gxClamp(store.clarity + bonus, 0, GX_MAX_CLARITY),
    })

    return { success: true, message: `Completed ${eventDef.name}! +${bonus} clarity.`, bonus }
  }, [])

  // ── Claim Event Reward ──────────────────────────────────────
  const gxClaimEventReward = useCallback((eventId: string) => {
    const store = useGlassRealmStore.getState()
    const eventDef = GX_EVENTS.find((e) => e.id === eventId)
    if (!eventDef) return { success: false, message: 'Event not found.' }

    const existing = store.eventProgress.find((ep) => ep.eventId === eventId)
    if (!existing || !existing.completed) {
      return { success: false, message: 'Event not completed yet.' }
    }
    if (existing.rewardClaimed) {
      return { success: false, message: 'Reward already claimed.' }
    }

    const reward = Math.floor(eventDef.duration * 10)

    const newEventProgress = store.eventProgress.map((ep) => {
      if (ep.eventId === eventId) {
        return { ...ep, rewardClaimed: true }
      }
      return ep
    })

    useGlassRealmStore.getState().patchState({
      eventProgress: newEventProgress,
      clarity: gxClamp(store.clarity + reward, 0, GX_MAX_CLARITY),
    })

    return { success: true, message: `Claimed reward for ${eventDef.name}! +${reward} clarity.`, reward }
  }, [])

  // ── Check Achievements ──────────────────────────────────────
  const gxCheckAchievements = useCallback(() => {
    const store = useGlassRealmStore.getState()

    const evalCondition = (condition: string): boolean => {
      if (condition === 'totalGlassForged >= 1') return store.totalGlassForged >= 1
      if (condition === 'totalGlassForged >= 10') return store.totalGlassForged >= 10
      if (condition === 'totalGlassForged >= 100') return store.totalGlassForged >= 100
      if (condition === 'totalGolemsTamed >= 1') return store.totalGolemsTamed >= 1
      if (condition === 'totalPrismsBuilt >= 1') return store.totalPrismsBuilt >= 1
      if (condition === 'totalArtifactsForged >= 1') return store.totalArtifactsForged >= 1
      if (condition === 'totalShatters >= 1') return store.totalShatters >= 1
      if (condition === 'clarity >= 500') return store.clarity >= 500
      if (condition === 'clarity >= 3000') return store.clarity >= 3000
      if (condition === 'level >= 50') return store.level >= 50
      if (condition === 'level >= 5') return store.level >= 5
      if (condition === 'level >= 15') return store.level >= 15
      if (condition === 'level >= 25') return store.level >= 25
      if (condition === 'level >= 35') return store.level >= 35
      if (condition === 'level >= 45') return store.level >= 45

      if (condition === 'tamedSpeciesCount >= 7') {
        const speciesSet = new Set<string>()
        for (const gid of store.golemsTamed) {
          const g = GX_GOLEMS.find((gg) => gg.id === gid)
          if (g) speciesSet.add(g.species)
        }
        return speciesSet.size >= 7
      }
      if (condition === 'golemsTamed.length >= 35') return store.golemsTamed.length >= 35
      if (condition === 'prismsFormed.length >= 8') return store.prismsFormed.length >= 8
      if (condition === 'artifacts.length >= 5') return store.artifacts.length >= 5
      if (condition === 'hasEpicArtifact') {
        return store.artifacts.some((a) => {
          const def = GX_ARTIFACTS.find((aa) => aa.id === a.defId)
          return def && (def.rarity === 'Epic' || def.rarity === 'Legendary')
        })
      }
      if (condition.startsWith('uniqueMaterialCount')) {
        const uniqueCount = Object.values(store.materials).filter((c) => c > 0).length
        if (condition.includes('>= 10')) return uniqueCount >= 10
        if (condition.includes('>= 30')) return uniqueCount >= 30
      }
      if (condition === 'hasMaxStructure') {
        return Object.values(store.structures).some((l) => l >= 10)
      }
      return false
    }

    const newAchievements: string[] = []
    let totalClarityReward = 0
    let totalPrismReward = 0

    for (const ach of GX_ACHIEVEMENTS) {
      if (store.achievementsUnlocked.includes(ach.id)) continue
      if (evalCondition(ach.condition)) {
        newAchievements.push(ach.id)
        totalClarityReward += ach.reward.clarity
        totalPrismReward += ach.reward.prisms
      }
    }

    if (newAchievements.length > 0) {
      useGlassRealmStore.getState().patchState({
        achievementsUnlocked: [...store.achievementsUnlocked, ...newAchievements],
        clarity: gxClamp(store.clarity + totalClarityReward, 0, GX_MAX_CLARITY),
        prismsFormedCount: store.prismsFormedCount + totalPrismReward,
      })
    }

    return {
      newAchievements,
      totalClarityReward,
      totalPrismReward,
    }
  }, [])

  // ── Level Up ────────────────────────────────────────────────
  const gxLevelUp = useCallback(() => {
    const store = useGlassRealmStore.getState()
    const clarityNeeded = store.level * GX_CLARITY_PER_LEVEL

    if (store.clarity < clarityNeeded) {
      return { success: false, message: `Need ${clarityNeeded} clarity. Current: ${store.clarity}.`, newLevel: store.level }
    }

    const newLevel = store.level + 1

    // Check for title upgrades
    let newTitleIndex = store.titleIndex
    for (let i = GX_TITLES.length - 1; i >= 0; i--) {
      if (newLevel >= GX_TITLES[i].levelReq) {
        newTitleIndex = i
        break
      }
    }

    useGlassRealmStore.getState().patchState({
      clarity: store.clarity - clarityNeeded,
      level: newLevel,
      titleIndex: newTitleIndex,
    })

    return { success: true, message: `Leveled up to ${newLevel}!`, newLevel, titleUpgraded: newTitleIndex !== store.titleIndex }
  }, [])

  // ── Get Golem Details ───────────────────────────────────────
  const gxGetGolemDetails = useCallback((golemId: string) => {
    const golem = GX_GOLEMS.find((g) => g.id === golemId)
    if (!golem) return null

    const rarityInfo = GX_RARITY[golem.rarity]
    const speciesInfo = GX_SPECIES_INFO[golem.species]
    const tamed = state.golemsTamed.includes(golemId)

    return {
      ...golem,
      rarityColor: rarityInfo.color,
      rarityGlow: rarityInfo.glow,
      rarityLabel: rarityInfo.label,
      clarityMultiplier: rarityInfo.clarityMultiplier,
      speciesLabel: speciesInfo.label,
      speciesIcon: speciesInfo.icon,
      speciesColor: speciesInfo.color,
      tamed,
    }
  }, [state])

  // ── Get Prism Details ───────────────────────────────────────
  const gxGetPrismDetails = useCallback((prismId: string) => {
    const prism = GX_PRISMS.find((p) => p.id === prismId)
    if (!prism) return null

    const formed = state.prismsFormed.includes(prismId)
    const unlocked = state.clarity >= prism.requiredClarity
    const isCurrent = state.currentPrism === prismId

    return {
      ...prism,
      formed,
      unlocked,
      isCurrent,
    }
  }, [state])

  // ── Get Structure Details ───────────────────────────────────
  const gxGetStructureDetails = useCallback((structureId: string) => {
    const structDef = GX_STRUCTURES.find((s) => s.id === structureId)
    if (!structDef) return null

    const level = state.structures[structureId] || 0
    const cost = level < structDef.maxLevel
      ? Math.floor(structDef.baseCost * Math.pow(structDef.upgradeMultiplier, level))
      : 0
    const isMaxed = level >= structDef.maxLevel

    return {
      ...structDef,
      level,
      upgradeCost: cost,
      isMaxed,
      totalEffect: level > 0 ? `${level} levels (${structDef.effectPerLevel})` : 'Not built',
    }
  }, [state])

  // ── Get Ability Details ─────────────────────────────────────
  const gxGetAbilityDetails = useCallback((abilityId: string) => {
    const ability = GX_ABILITIES.find((a) => a.id === abilityId)
    if (!ability) return null

    const learned = state.abilitiesLearned.includes(abilityId)
    const canActivate = learned && state.clarity >= ability.clarityCost

    return {
      ...ability,
      learned,
      canActivate,
    }
  }, [state])

  // ── Get Artifact Details ────────────────────────────────────
  const gxGetArtifactDetails = useCallback((artifactDefId: string) => {
    const def = GX_ARTIFACTS.find((a) => a.id === artifactDefId)
    if (!def) return null

    const rarityInfo = GX_RARITY[def.rarity]
    const instances = state.artifacts.filter((a) => a.defId === artifactDefId)
    const equippedInstance = state.artifacts.find((a) => a.defId === artifactDefId && a.equipped)

    return {
      def,
      rarityColor: rarityInfo.color,
      rarityGlow: rarityInfo.glow,
      rarityLabel: rarityInfo.label,
      instanceCount: instances.length,
      equippedInstanceId: equippedInstance?.instanceId ?? null,
    }
  }, [state])

  // ── Get Stats ───────────────────────────────────────────────
  const gxGetStats = useCallback(() => {
    return {
      clarity: state.clarity,
      maxClarity: GX_MAX_CLARITY,
      clarityPercent: Math.round((state.clarity / GX_MAX_CLARITY) * 100),
      level: state.level,
      titleIndex: state.titleIndex,
      golemsTamed: state.golemsTamed.length,
      prismsFormed: state.prismsFormed.length,
      totalGlassForged: state.totalGlassForged,
      totalLightRefracted: state.totalLightRefracted,
      totalGolemsTamed: state.totalGolemsTamed,
      totalPrismsBuilt: state.totalPrismsBuilt,
      totalStructuresUpgraded: state.totalStructuresUpgraded,
      totalAbilitiesActivated: state.totalAbilitiesActivated,
      totalMaterialsCollected: state.totalMaterialsCollected,
      totalArtifactsForged: state.totalArtifactsForged,
      totalShatters: state.totalShatters,
      achievementsUnlocked: state.achievementsUnlocked.length,
      artifactCount: state.artifacts.length,
      activeEvents: state.eventProgress.filter((ep) => !ep.completed).length,
    }
  }, [state])

  // ── Spend Clarity ───────────────────────────────────────────
  const gxSpendClarity = useCallback((amount: number) => {
    const store = useGlassRealmStore.getState()
    if (store.clarity < amount) return false

    useGlassRealmStore.getState().setClarity(store.clarity - amount)
    return true
  }, [])

  // ── Add Clarity ─────────────────────────────────────────────
  const gxAddClarity = useCallback((amount: number) => {
    const store = useGlassRealmStore.getState()
    useGlassRealmStore.getState().setClarity(gxClamp(store.clarity + amount, 0, GX_MAX_CLARITY))
  }, [])

  // ── Reset Realm ─────────────────────────────────────────────
  const gxResetRealm = useCallback(() => {
    useGlassRealmStore.getState().resetRealm()
  }, [])

  // ── Visit Prism ─────────────────────────────────────────────
  const gxVisitPrism = useCallback((prismId: string) => {
    const prism = GX_PRISMS.find((p) => p.id === prismId)
    if (!prism) return { success: false, message: 'Prism not found.' }

    if (state.clarity < prism.requiredClarity) {
      return { success: false, message: 'Prism not yet unlocked.' }
    }

    useGlassRealmStore.getState().setCurrentPrism(prismId)
    return { success: true, message: `Visited ${prism.name}!` }
  }, [state])

  // ── Equip Artifact by ID ────────────────────────────────────
  const gxUnequipArtifact = useCallback((instanceId: string) => {
    const store = useGlassRealmStore.getState()
    const instance = store.artifacts.find((a) => a.instanceId === instanceId)
    if (!instance) return { success: false, message: 'Artifact not found.' }
    if (!instance.equipped) return { success: false, message: 'Artifact not equipped.' }

    const newArtifacts = store.artifacts.map((a) => {
      if (a.instanceId === instanceId) {
        return { ...a, equipped: false }
      }
      return a
    })

    useGlassRealmStore.getState().setArtifacts(newArtifacts)
    return { success: true, message: 'Artifact unequipped.' }
  }, [])

  // ── Get Species Breakdown ───────────────────────────────────
  const gxGetSpeciesBreakdown = useCallback((species: GxSpecies) => {
    const speciesGolems = GX_GOLEMS.filter((g) => g.species === species)
    const tamedInSpecies = state.golemsTamed.filter((gid) => {
      const g = GX_GOLEMS.find((gg) => gg.id === gid)
      return g !== undefined && g.species === species
    })
    return {
      species,
      info: GX_SPECIES_INFO[species],
      total: speciesGolems.length,
      tamed: tamedInSpecies.length,
      golems: speciesGolems.map((g) => ({
        ...g,
        tamed: state.golemsTamed.includes(g.id),
      })),
      fullyCollected: tamedInSpecies.length >= speciesGolems.length,
    }
  }, [state])

  // ── Get Rarity Breakdown ────────────────────────────────────
  const gxGetRarityBreakdown = useCallback((rarity: GxRarity) => {
    const rarityGolems = GX_GOLEMS.filter((g) => g.rarity === rarity)
    const tamedInRarity = state.golemsTamed.filter((gid) => {
      const g = GX_GOLEMS.find((gg) => gg.id === gid)
      return g !== undefined && g.rarity === rarity
    })
    return {
      rarity,
      info: GX_RARITY[rarity],
      total: rarityGolems.length,
      tamed: tamedInRarity.length,
      golems: rarityGolems.map((g) => ({
        ...g,
        tamed: state.golemsTamed.includes(g.id),
      })),
      fullyCollected: tamedInRarity.length >= rarityGolems.length,
    }
  }, [state])

  // ── Get Material Details ────────────────────────────────────
  const gxGetMaterialDetails = useCallback((materialId: string) => {
    const material = GX_MATERIALS.find((m) => m.id === materialId)
    if (!material) return null

    const count = state.materials[materialId] || 0
    const rarityInfo = GX_RARITY[material.rarity]

    return {
      ...material,
      count,
      rarityColor: rarityInfo.color,
      rarityGlow: rarityInfo.glow,
      rarityLabel: rarityInfo.label,
    }
  }, [state])

  // ── Get Event Details ───────────────────────────────────────
  const gxGetEventDetails = useCallback((eventId: string) => {
    const eventDef = GX_EVENTS.find((e) => e.id === eventId)
    if (!eventDef) return null

    const progress = state.eventProgress.find((ep) => ep.eventId === eventId)
    return {
      ...eventDef,
      active: progress !== undefined && !progress.completed,
      completed: progress?.completed ?? false,
      rewardClaimed: progress?.rewardClaimed ?? false,
      progress: progress?.progress ?? 0,
      startedAt: progress?.startedAt ?? null,
    }
  }, [state])

  // ═══════════════════════════════════════════════════════════════
  // Return Everything
  // ═══════════════════════════════════════════════════════════════

  return {
    // ── Constants ─────────────────────────────────────────────
    GX_COLOR_CRYSTAL_WHITE,
    GX_COLOR_PRISMATIC_RAINBOW,
    GX_COLOR_GLASS_CYAN,
    GX_COLOR_AMBER_GOLD,
    GX_COLOR_OPALESCENT,
    GX_COLOR_OBSIDIAN,
    GX_COLOR_FROSTED,
    GX_COLOR_PHANTOM,
    GX_THEME,
    GX_RARITY,
    GX_RARITY_ORDER,
    GX_SPECIES,
    GX_SPECIES_INFO,
    GX_MAX_CLARITY,
    GX_GOLEM_COUNT,
    GX_PRISM_COUNT,
    GX_MATERIAL_COUNT,
    GX_STRUCTURE_COUNT,
    GX_ABILITY_COUNT,
    GX_ACHIEVEMENT_COUNT,
    GX_TITLE_COUNT,
    GX_ARTIFACT_COUNT,
    GX_EVENT_COUNT,
    GX_FORGE_CLARITY_COST,
    GX_REFRACT_CLARITY_COST,
    GX_BUILD_PRISM_COST,
    GX_SHATTER_REFUND_RATE,
    GX_CLARITY_PER_LEVEL,
    GX_TAME_GOLEM_BASE_CLARITY,
    GX_UPGRADE_DISCOUNT_LVL5,
    GX_GOLEMS,
    GX_PRISMS,
    GX_MATERIALS,
    GX_STRUCTURES,
    GX_ABILITIES,
    GX_ACHIEVEMENTS,
    GX_TITLES,
    GX_ARTIFACTS,
    GX_EVENTS,

    // ── State ─────────────────────────────────────────────────
    gxLevel: state.level,
    gxClarity: state.clarity,
    gxPrismsFormed: state.prismsFormedCount,
    golemsTamed: state.golemsTamed,
    prismsFormed: state.prismsFormed,
    materials: state.materials,
    structures: state.structures,
    abilitiesLearned: state.abilitiesLearned,
    achievementsUnlocked: state.achievementsUnlocked,
    currentPrism: state.currentPrism,
    artifacts: state.artifacts,
    eventProgress: state.eventProgress,
    titleIndex: state.titleIndex,
    totalGlassForged: state.totalGlassForged,
    totalLightRefracted: state.totalLightRefracted,
    totalGolemsTamed: state.totalGolemsTamed,
    totalPrismsBuilt: state.totalPrismsBuilt,
    totalStructuresUpgraded: state.totalStructuresUpgraded,
    totalAbilitiesActivated: state.totalAbilitiesActivated,
    totalMaterialsCollected: state.totalMaterialsCollected,
    totalArtifactsForged: state.totalArtifactsForged,
    totalShatters: state.totalShatters,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,

    // ── Computed ──────────────────────────────────────────────
    currentTitle,
    unlockedPrisms,
    availableAbilities,
    learnedAbilities,
    tamedGolems,
    golemStats,
    structureSummary,
    achievementsWithStatus,
    eventsWithStatus,
    materialInventory,
    artifactInventory,
    activeEventBonuses,
    levelProgress,
    overallProgress,

    // ── Actions ───────────────────────────────────────────────
    gxForgeGlass,
    gxRefractLight,
    gxBuildPrism,
    gxShatter,
    gxTameGolem,
    gxUpgradeStructure,
    gxActivateAbility,
    gxLearnAbility,
    gxCollectMaterial,
    gxForgArtifact,
    gxEquipArtifact,
    gxUnequipArtifact,
    gxStartEvent,
    gxCompleteEvent,
    gxClaimEventReward,
    gxCheckAchievements,
    gxLevelUp,
    gxVisitPrism,
    gxSpendClarity,
    gxAddClarity,
    gxResetRealm,

    // ── Getters ───────────────────────────────────────────────
    gxGetGolemDetails,
    gxGetPrismDetails,
    gxGetStructureDetails,
    gxGetAbilityDetails,
    gxGetArtifactDetails,
    gxGetStats,
    gxGetSpeciesBreakdown,
    gxGetRarityBreakdown,
    gxGetMaterialDetails,
    gxGetEventDetails,
  }
}
