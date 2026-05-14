/**
 * Ember Abyss — 余烬深渊 (Ember Abyss) feature module
 *
 * A volcanic underworld where fire demons and magma creatures rule from
 * obsidian fortresses above rivers of lava. Summon 35 fire beasts across
 * 5 rarity tiers and 7 species, claim 8 chasm locations, collect 30
 * fire/magma materials, build 25 abyss structures, wield 22 fire abilities,
 * earn 8 titles from Spark Tender to Abyss Overlord, gather 15 legendary
 * artifacts, and endure 12 abyss events — backed by a Zustand store with
 * persist middleware.
 *
 * Storage key: ember-abyss-wire
 * Prefix: ea / EA_
 */

import { useEffect, useRef, useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type EARarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type EASpecies = 'magma_wurm' | 'ash_elemental' | 'lava_titan' | 'smoke_specter' | 'ember_phoenix' | 'obsidian_golem' | 'flame_serpent'
export type EAElementType = 'magma' | 'ash' | 'lava' | 'smoke' | 'ember' | 'obsidian' | 'flame'

export interface EABeastDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly species: EASpecies
  readonly rarity: EARarity
  readonly emberPower: number
  readonly summonCost: number
  readonly abilities: string[]
  readonly lore: string
  readonly stats: {
    attack: number
    defense: number
    speed: number
    magic: number
    hp: number
  }
}

export interface EASpeciesDef {
  readonly id: EASpecies
  readonly name: string
  readonly description: string
  readonly color: string
  readonly passiveBonus: string
  readonly passiveValue: number
  readonly preferredChasm: string
}

export interface EAChasmDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly minLevel: number
  readonly unlockCost: number
  readonly bonuses: string[]
  readonly element: EAElementType
}

export interface EAMaterialDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: EARarity
  readonly source: string
  readonly value: number
  readonly category: 'magma' | 'ash' | 'lava' | 'obsidian' | 'ember' | 'smoke'
}

export interface EAStructureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly costMultiplier: number
  readonly maxLevel: number
  readonly category: 'fortification' | 'extraction' | 'defense' | 'enchantment' | 'storage'
}

export interface EAAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly element: EAElementType
  readonly emberCost: number
}

export interface EAAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
  readonly icon: string
}

export interface EATitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredBeasts: number
}

export interface EAArtifactDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: EARarity
  readonly powerBonus: number
  readonly specialAbility: string
  readonly forgeCost: number
}

export interface EAEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly duration: number
  readonly effects: string[]
  readonly element: EAElementType
}

export interface EATamedBeast {
  readonly id: string
  beastDefId: string
  name: string
  level: number
  currentHP: number
  maxHP: number
  power: number
  tamedAt: number
  expeditionsCompleted: number
}

export interface EAOwnedStructure {
  readonly id: string
  structureDefId: string
  level: number
  built: boolean
}

export interface EAStoreState {
  eaLevel: number
  eaEmberPower: number
  eaLavaEnergy: number
  eaBeasts: Record<string, EATamedBeast>
  eaChasms: string[]
  eaStructures: EAOwnedStructure[]
  eaArtifacts: string[]
  eaAchievements: string[]
  eaInventory: Record<string, number>
  eaStats: {
    totalBeastsSummoned: number
    totalChasmsClaimed: number
    totalStructuresBuilt: number
    totalArtifactsActivated: number
    totalEmberPowerEarned: number
    totalStrikesPerformed: number
    totalPlayTime: number
  }
  eaTitle: string
}

export interface EAStoreActions {
  eaSummonBeast: (beastId: string) => boolean
  eaChasmClaim: (chasmId: string) => boolean
  eaBuildStructure: (structureId: string) => boolean
  eaMagmaStrike: (chasmId: string) => boolean
  eaActivateRelic: (artifactId: string) => boolean
  resetEmberAbyss: () => void
}

export type EAFullStore = EAStoreState & EAStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const EA_LAVA_RED = '#FF4500'
export const EA_EMBER_ORANGE = '#FF8C00'
export const EA_OBSIDIAN_BLACK = '#1A1A2E'
export const EA_ASH_GRAY = '#808080'
export const EA_MOLTEN_GOLD = '#FFB347'
export const EA_INFERNO_CRIMSON = '#DC143C'
export const EA_SMOKE_CHARCOAL = '#36454F'
export const EA_FLAME_YELLOW = '#FFD700'
export const EA_HEAT_WHITE = '#FFF8F0'
export const EA_DEPTHS_INDIGO = '#0F0F23'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════════

const EA_MAX_LEVEL = 50
const EA_INITIAL_EMBER_POWER = 100
const EA_INITIAL_LAVA_ENERGY = 500

function eaGenerateId(): string {
  return `ea_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function eaRarityMultiplier(rarity: EARarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.5
    case 'rare': return 2.2
    case 'epic': return 3.5
    case 'legendary': return 6.0
  }
}

function eaRarityColor(rarity: EARarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#34D399'
    case 'rare': return '#60A5FA'
    case 'epic': return '#A78BFA'
    case 'legendary': return '#FBBF24'
  }
}

function eaSpeciesColor(species: EASpecies): string {
  switch (species) {
    case 'magma_wurm': return EA_LAVA_RED
    case 'ash_elemental': return EA_ASH_GRAY
    case 'lava_titan': return EA_INFERNO_CRIMSON
    case 'smoke_specter': return EA_SMOKE_CHARCOAL
    case 'ember_phoenix': return EA_EMBER_ORANGE
    case 'obsidian_golem': return EA_OBSIDIAN_BLACK
    case 'flame_serpent': return EA_FLAME_YELLOW
  }
}

function eaElementColor(element: EAElementType): string {
  switch (element) {
    case 'magma': return EA_LAVA_RED
    case 'ash': return EA_ASH_GRAY
    case 'lava': return EA_INFERNO_CRIMSON
    case 'smoke': return EA_SMOKE_CHARCOAL
    case 'ember': return EA_EMBER_ORANGE
    case 'obsidian': return EA_OBSIDIAN_BLACK
    case 'flame': return EA_FLAME_YELLOW
  }
}

function eaGetBeastPower(def: EABeastDef, level: number): number {
  return Math.floor(def.emberPower * (1 + (level - 1) * 0.15))
}

function eaGetStructureBonus(structureId: string, level: number): number {
  const def = EA_STRUCTURES.find(s => s.id === structureId)
  if (!def) return 0
  return Math.floor(def.baseCost * Math.pow(1.05, level) * 0.1)
}

function eaGetUpgradeCost(def: EAStructureDef, currentLevel: number): number {
  if (currentLevel >= def.maxLevel) return 0
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

function eaGetSummonChance(rarity: EARarity, chasmId: string | null): number {
  const base: Record<EARarity, number> = {
    common: 0.45,
    uncommon: 0.28,
    rare: 0.15,
    epic: 0.08,
    legendary: 0.04,
  }
  const chasm = chasmId ? EA_CHASMS.find(c => c.id === chasmId) : null
  const depthBonus = chasm ? chasm.minLevel * 0.002 : 0
  return Math.min(0.95, base[rarity] + depthBonus)
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: EA_SPECIES — 7 Fire Beast Species
// ═══════════════════════════════════════════════════════════════════

export const EA_SPECIES: readonly EASpeciesDef[] = [
  {
    id: 'magma_wurm',
    name: 'Magma Wurm',
    description:
      'Colossal serpentine beasts that burrow through molten rock, leaving tunnels of cooling magma in their wake. Their segmented bodies are armored with volcanic scales that glow from within, and their jaws can crush obsidian like glass.',
    color: EA_LAVA_RED,
    passiveBonus: '+10% magma damage output',
    passiveValue: 10,
    preferredChasm: 'magma_river',
  },
  {
    id: 'ash_elemental',
    name: 'Ash Elemental',
    description:
      'Beings of concentrated volcanic ash that swirl in humanoid forms. They draw power from the remnants of ancient eruptions and can reshape themselves into weapons, shields, or walls of suffocating ash at will.',
    color: EA_ASH_GRAY,
    passiveBonus: '+12% ash shield durability',
    passiveValue: 12,
    preferredChasm: 'ash_chambers',
  },
  {
    id: 'lava_titan',
    name: 'Lava Titan',
    description:
      'Massive humanoid giants forged from cooled basalt with cores of molten lava. They are among the oldest creatures in the abyss, predating the first volcanic eruption. Each step they take sends tremors through the underworld.',
    color: EA_INFERNO_CRIMSON,
    passiveBonus: '+15% structure build speed',
    passiveValue: 15,
    preferredChasm: 'obsidian_fortress',
  },
  {
    id: 'smoke_specter',
    name: 'Smoke Specter',
    description:
      'Ethereal beings composed of toxic volcanic gases and superheated steam. They drift through the chasms as shimmering clouds of poison, capable of suffocating entire chambers or obscuring vision with impenetrable smoke screens.',
    color: EA_SMOKE_CHARCOAL,
    passiveBonus: '+8% smoke stealth duration',
    passiveValue: 8,
    preferredChasm: 'smoke_pits',
  },
  {
    id: 'ember_phoenix',
    name: 'Ember Phoenix',
    description:
      'Radiant birds of living flame that cycle endlessly between combustion and rebirth. Their feathers are made of pure ember-light, and their song sounds like crackling flames harmonizing with distant volcanic rumbles.',
    color: EA_EMBER_ORANGE,
    passiveBonus: '+10% ember regeneration rate',
    passiveValue: 10,
    preferredChasm: 'infernal_throne',
  },
  {
    id: 'obsidian_golem',
    name: 'Obsidian Golem',
    description:
      'Sentient constructs of polished volcanic glass animated by geothermal energy. They are nearly indestructible, their surfaces reflecting firelight in mesmerizing patterns. Ancient empires built armies of them to guard their abyss fortresses.',
    color: EA_OBSIDIAN_BLACK,
    passiveBonus: '+18% defense rating',
    passiveValue: 18,
    preferredChasm: 'obsidian_fortress',
  },
  {
    id: 'flame_serpent',
    name: 'Flame Serpent',
    description:
      'Graceful serpents that swim through lava rivers as though they were water. Their scales shimmer with iridescent fire, and their venom is liquid flame that burns through any material. They are revered by fire lords as sacred guardians.',
    color: EA_FLAME_YELLOW,
    passiveBonus: '+12% attack speed',
    passiveValue: 12,
    preferredChasm: 'lava_falls',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: EA_BEASTS — 35 Fire Beasts (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const EA_BEASTS: readonly EABeastDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'cinder_worm',
    name: 'Cinder Worm',
    description: 'A small segmented worm that tunnels through cooling ash beds, leaving trails of tiny embers. Harmless alone, but swarms can reduce entire settlements to smoldering ruins in hours.',
    species: 'magma_wurm',
    rarity: 'common',
    emberPower: 15,
    summonCost: 10,
    abilities: ['Ember Trail', 'Burrow'],
    lore: 'Cinder Worms are considered pests by fire lords, but scholars study them for their remarkable ability to sense volcanic tremors days before eruptions.',
    stats: { attack: 8, defense: 3, speed: 18, magic: 12, hp: 30 },
  },
  {
    id: 'ash_wisp',
    name: 'Ash Wisp',
    description: 'A flickering spirit of volcanic ash that drifts on thermal currents. It appears as a faint gray glow that intensifies when danger is near, making it a useful sentinel for abyss explorers.',
    species: 'ash_elemental',
    rarity: 'common',
    emberPower: 14,
    summonCost: 8,
    abilities: ['Ash Cloud', 'Ember Sense'],
    lore: 'Ash Wisps are born from the final breath of dying volcanoes. Each one carries a memory of the eruption that created it.',
    stats: { attack: 6, defense: 4, speed: 22, magic: 14, hp: 25 },
  },
  {
    id: 'basalt_golem_minor',
    name: 'Basalt Golem',
    description: 'A crude humanoid construct of rough basalt chunks held together by molten veins. Slow but incredibly durable, it serves as the basic laborer of the obsidian fortresses.',
    species: 'obsidian_golem',
    rarity: 'common',
    emberPower: 18,
    summonCost: 12,
    abilities: ['Stone Fist', 'Magma Veins'],
    lore: 'The first Basalt Golems were created by accident when a lava flow cooled around a dying fire elemental, preserving its consciousness in stone.',
    stats: { attack: 10, defense: 14, speed: 4, magic: 6, hp: 50 },
  },
  {
    id: 'smoke_imp',
    name: 'Smoke Imp',
    description: 'A mischievous creature made of concentrated chimney smoke and volcanic gases. It delights in obscuring vision and playing tricks on larger fire beasts by stealing their heat.',
    species: 'smoke_specter',
    rarity: 'common',
    emberPower: 13,
    summonCost: 9,
    abilities: ['Smoke Screen', 'Heat Siphon'],
    lore: 'Smoke Imps are the only creatures that can pass through walls of solid obsidian — by temporarily dissolving into their component gases.',
    stats: { attack: 5, defense: 2, speed: 26, magic: 16, hp: 20 },
  },
  {
    id: 'spark_ling',
    name: 'Sparkling',
    description: 'A tiny bird-like creature that resembles a phoenix in miniature. Its feathers glow with a warm orange light, and it can ignite small fires with a single chirp.',
    species: 'ember_phoenix',
    rarity: 'common',
    emberPower: 12,
    summonCost: 8,
    abilities: ['Spark Ignite', 'Warm Glow'],
    lore: 'Sparklings are born in clusters of five from the same ember. They remain bonded for life, and if one dies, the others will carry its spark until they can be reborn together.',
    stats: { attack: 7, defense: 3, speed: 28, magic: 10, hp: 22 },
  },
  {
    id: 'flame_hatchling',
    name: 'Flame Hatchling',
    description: 'A young flame serpent no larger than a garden hose. Despite its small size, it can raise its body temperature to over a thousand degrees and its bite injects liquid fire venom.',
    species: 'flame_serpent',
    rarity: 'common',
    emberPower: 16,
    summonCost: 11,
    abilities: ['Fire Bite', 'Heat Coil'],
    lore: 'Flame Hatchlings are born in lava river deltas where they must swim against the current to prove their strength before their first molt.',
    stats: { attack: 12, defense: 6, speed: 20, magic: 8, hp: 28 },
  },
  {
    id: 'slag_beetle',
    name: 'Slag Beetle',
    description: 'A beetle with a shell made of volcanic slag that glows red-hot. It feeds on cooling magma and stores excess heat in its abdomen, which it can release in defensive bursts.',
    species: 'magma_wurm',
    rarity: 'common',
    emberPower: 17,
    summonCost: 11,
    abilities: ['Slag Shield', 'Heat Burst'],
    lore: 'Slag Beetles are used as living batteries by abyss engineers. A single beetle can power a forge for three days before needing to feed again.',
    stats: { attack: 9, defense: 12, speed: 10, magic: 8, hp: 35 },
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'magma_viper',
    name: 'Magma Viper',
    description: 'A venomous serpent that swims through underground magma channels with incredible speed. Its fangs inject molten venom that burns from the inside, and its scales radiate intense heat.',
    species: 'magma_wurm',
    rarity: 'uncommon',
    emberPower: 32,
    summonCost: 50,
    abilities: ['Molten Strike', 'Thermal Coil', 'Venom Burn'],
    lore: 'The Magma Viper\'s venom is harvested by abyss alchemists and used to forge weapons that burn with an eternal flame.',
    stats: { attack: 28, defense: 12, speed: 32, magic: 18, hp: 75 },
  },
  {
    id: 'ash_storm_elemental',
    name: 'Ash Storm Elemental',
    description: 'A swirling vortex of volcanic ash and superheated air that can generate localized ash storms. It expands and contracts at will, engulfing enemies in suffocating clouds of searing particulates.',
    species: 'ash_elemental',
    rarity: 'uncommon',
    emberPower: 30,
    summonCost: 45,
    abilities: ['Ash Storm', 'Choking Cloud', 'Thermal Updraft'],
    lore: 'Ash Storm Elementals form naturally when multiple Ash Wisps merge during particularly violent eruptions. The process is irreversible and creates a being of far greater power.',
    stats: { attack: 22, defense: 18, speed: 24, magic: 28, hp: 70 },
  },
  {
    id: 'obsidian_guardian',
    name: 'Obsidian Guardian',
    description: 'A humanoid golem of polished obsidian with glowing veins of magma running through its joints. It stands seven feet tall and wields a massive shield carved from a single piece of volcanic glass.',
    species: 'obsidian_golem',
    rarity: 'uncommon',
    emberPower: 35,
    summonCost: 52,
    abilities: ['Obsidian Shield', 'Reflective Surface', 'Magma Pulse'],
    lore: 'Obsidian Guardians are the standard soldiers of the abyss fortresses. They require no rest, no food, and no motivation beyond their core directive to guard.',
    stats: { attack: 24, defense: 32, speed: 8, magic: 14, hp: 100 },
  },
  {
    id: 'smoke_phantom',
    name: 'Smoke Phantom',
    description: 'A spectral entity that exists partially in the material world and partially in the smoke dimension. It can become invisible in any environment with sufficient ash or smoke, striking from perfect concealment.',
    species: 'smoke_specter',
    rarity: 'uncommon',
    emberPower: 28,
    summonCost: 42,
    abilities: ['Phase Shift', 'Smoke Form', 'Suffocate'],
    lore: 'Smoke Phantoms are feared even by other fire beasts because they can extinguish flames by absorbing the heat directly into their ethereal form.',
    stats: { attack: 20, defense: 10, speed: 34, magic: 26, hp: 55 },
  },
  {
    id: 'ember_falcon',
    name: 'Ember Falcon',
    description: 'A raptor wreathed in constant flame, capable of diving at incredible speeds to deliver devastating fire strikes. Its talons can pierce steel, and its screech ignites anything flammable within range.',
    species: 'ember_phoenix',
    rarity: 'uncommon',
    emberPower: 34,
    summonCost: 48,
    abilities: ['Fire Dive', 'Ignition Screech', 'Ember Trail'],
    lore: 'Ember Falcons are used as scouts and messengers by the fire lords. They can fly through lava fountains without injury and navigate by sensing magnetic fields in the volcanic rock.',
    stats: { attack: 30, defense: 14, speed: 38, magic: 20, hp: 65 },
  },
  {
    id: 'lava_constrictor',
    name: 'Lava Constrictor',
    description: 'A massive flame serpent that crushes its prey with coils of superheated scales. Its body temperature is hot enough to melt iron, and anything it wraps around is simultaneously crushed and incinerated.',
    species: 'flame_serpent',
    rarity: 'uncommon',
    emberPower: 36,
    summonCost: 54,
    abilities: ['Constrict', 'Lava Coil', 'Heat Crush'],
    lore: 'Lava Constrictors are the apex predators of the lava rivers. Even lava titans give them a wide berth, as their crushing power can crack basalt pillars.',
    stats: { attack: 26, defense: 22, speed: 16, magic: 22, hp: 95 },
  },
  {
    id: 'molten_hound',
    name: 'Molten Hound',
    description: 'A wolf-like beast with fur of living flame and eyes of molten gold. It hunts in packs through the ash fields of the abyss, tracking prey by their body heat with supernatural precision.',
    species: 'magma_wurm',
    rarity: 'uncommon',
    emberPower: 31,
    summonCost: 46,
    abilities: ['Flame Bite', 'Pack Hunt', 'Heat Trail'],
    lore: 'A pack of Molten Hounds is called a "blaze." A full blaze can bring down creatures ten times their individual size through coordinated thermal attacks.',
    stats: { attack: 26, defense: 14, speed: 36, magic: 12, hp: 68 },
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'magma_leviathan',
    name: 'Magma Leviathan',
    description: 'A colossal wurm the size of a subway train that tunnels through the deepest magma chambers. Its passage causes earthquakes, and its appetite is so vast it consumes entire lava flows in minutes.',
    species: 'magma_wurm',
    rarity: 'rare',
    emberPower: 62,
    summonCost: 200,
    abilities: ['Tunnel Collapse', 'Magma Surge', 'Seismic Roar', 'Devour Flow'],
    lore: 'The last confirmed sighting of a Magma Leviathan was three centuries ago. It swallowed an entire chasm and disappeared, leaving behind a tunnel system that is still being mapped.',
    stats: { attack: 52, defense: 34, speed: 20, magic: 38, hp: 250 },
  },
  {
    id: 'ash_colossus',
    name: 'Ash Colossus',
    description: 'A towering elemental of compacted volcanic ash that stands thirty feet tall. Its body is dense enough to crush buildings, and it generates clouds of suffocating ash with every step.',
    species: 'ash_elemental',
    rarity: 'rare',
    emberPower: 58,
    summonCost: 180,
    abilities: ['Ashquake', 'Dense Form', 'Choking Aura', 'Volcanic Exhale'],
    lore: 'Ash Colossi are formed when a volcano erupts directly into an ash elemental\'s territory. The elemental absorbs the eruption and grows to immense size.',
    stats: { attack: 48, defense: 52, speed: 8, magic: 42, hp: 300 },
  },
  {
    id: 'obsidian_warmaster',
    name: 'Obsidian Warmaster',
    description: 'An elite golem commander encased in ornate obsidian armor etched with ancient volcanic runes. It carries a massive sword of crystallized magma and commands legions of lesser golems with telepathic precision.',
    species: 'obsidian_golem',
    rarity: 'rare',
    emberPower: 65,
    summonCost: 220,
    abilities: ['Command Strike', 'Fortress Wall', 'Rune Activation', 'Obsidian Army'],
    lore: 'Obsidian Warmasters are the only golems capable of independent strategic thought. They are considered legal persons in the abyss courts.',
    stats: { attack: 56, defense: 48, speed: 14, magic: 44, hp: 280 },
  },
  {
    id: 'smoke_revenant',
    name: 'Smoke Revenant',
    description: 'A spectral warrior encased in plate armor forged from solidified smoke. It wields a greatsword that exists between dimensions, capable of cutting through both material and ethereal beings.',
    species: 'smoke_specter',
    rarity: 'rare',
    emberPower: 60,
    summonCost: 190,
    abilities: ['Dimensional Blade', 'Smoke Form', 'Ethereal Strike', 'Suffocating Aura'],
    lore: 'Smoke Revenants were once mortal warriors who died in volcanic eruptions. Their rage and desire to protect their homes transformed them into these powerful spectral beings.',
    stats: { attack: 58, defense: 28, speed: 30, magic: 50, hp: 200 },
  },
  {
    id: 'inferno_phoenix',
    name: 'Inferno Phoenix',
    description: 'A magnificent phoenix wreathed in flames hot enough to melt steel at thirty paces. When it dies, it explodes in a supernova of ember and fire, only to be reborn from its own ashes seconds later.',
    species: 'ember_phoenix',
    rarity: 'rare',
    emberPower: 64,
    summonCost: 210,
    abilities: ['Phoenix Dive', 'Supernova Burst', 'Ash Rebirth', 'Eternal Flame'],
    lore: 'There are only seven Inferno Phoenixes in existence at any given time. When one is permanently destroyed, a new one spontaneously ignites from the hottest magma on the planet.',
    stats: { attack: 54, defense: 26, speed: 46, magic: 48, hp: 180 },
  },
  {
    id: 'king_cobra_infernal',
    name: 'King Cobra Infernal',
    description: 'A massive flame serpent with a hood that spreads wide enough to blanket a small building in firelight. Its venom can melt through three feet of solid rock in seconds.',
    species: 'flame_serpent',
    rarity: 'rare',
    emberPower: 66,
    summonCost: 225,
    abilities: ['Fire Hood', 'Venom Spray', 'Hypnotic Flames', 'Infernal Coil'],
    lore: 'The King Cobra Infernal is the only flame serpent that can breathe fire. All other serpents generate heat but cannot project it. This makes the king both feared and envied.',
    stats: { attack: 60, defense: 30, speed: 38, magic: 44, hp: 220 },
  },
  {
    id: 'lava_titan_brute',
    name: 'Lava Titan Brute',
    description: 'A hulking titan of basalt and magma that stands over twenty feet tall. Its fists are larger than boulders, and each punch generates enough kinetic energy to trigger small earthquakes.',
    species: 'lava_titan',
    rarity: 'rare',
    emberPower: 68,
    summonCost: 230,
    abilities: ['Titan Punch', 'Magma Armor', 'Ground Slam', 'Eruption Stomp'],
    lore: 'Lava Titan Brutes are the backbone of abyss construction. A single titan can excavate a fortress foundation in a day and build the walls in a week.',
    stats: { attack: 64, defense: 44, speed: 10, magic: 36, hp: 350 },
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'world_borer',
    name: 'World Borer',
    description: 'A wurm so vast it circles the planet\'s mantle, its body passing through every magma chamber in existence. Where it surfaces, volcanoes erupt. Where it dives, chasms form. It is the architect of the abyss itself.',
    species: 'magma_wurm',
    rarity: 'epic',
    emberPower: 105,
    summonCost: 800,
    abilities: ['World Tunnel', 'Magma Tsunami', 'Seismic Cascade', 'Planetary Eruption', 'Core Dive'],
    lore: 'The World Borer is not a creature that can be summoned — it can only be bargained with. It communicates through vibrations in the earth, and its demands are always absolute.',
    stats: { attack: 88, defense: 58, speed: 40, magic: 72, hp: 600 },
  },
  {
    id: 'ash_apocalypse',
    name: 'Ash Apocalypse',
    description: 'An elemental of such concentrated volcanic ash that it blots out the sun for miles around. Its mere presence causes all nearby fires to intensify to inferno levels, and its breath can bury entire regions in suffocating gray.',
    species: 'ash_elemental',
    rarity: 'epic',
    emberPower: 100,
    summonCost: 750,
    abilities: ['Eternal Ash', 'Apocalypse Cloud', 'Gray Death', 'Cinder Rain', 'Volcanic Exhale'],
    lore: 'The Ash Apocalypse is said to be the physical manifestation of a volcano that died. Its rage at being extinguished drives it to smother all flames on the planet.',
    stats: { attack: 72, defense: 64, speed: 24, magic: 96, hp: 500 },
  },
  {
    id: 'obsidian_overlord',
    name: 'Obsidian Overlord',
    description: 'The supreme commander of all obsidian golems, a colossal construct of perfect volcanic glass that reflects all damage. It has commanded the fortress armies for ten thousand years without rest or hesitation.',
    species: 'obsidian_golem',
    rarity: 'epic',
    emberPower: 110,
    summonCost: 850,
    abilities: ['Absolute Defense', 'Fortress Command', 'Mirror Surface', 'Obsidian Legion', 'Reflection Beam'],
    lore: 'The Obsidian Overlord was the first golem ever created. Its creator died in the attempt, but the Overlord remembers everything and has spent millennia perfecting the art of war.',
    stats: { attack: 74, defense: 96, speed: 18, magic: 80, hp: 650 },
  },
  {
    id: 'smoke_annihilator',
    name: 'Smoke Annihilator',
    description: 'A spectral being of absolute void smoke that can extinguish any fire and absorb any heat. It exists as the antithesis of the abyss itself — a being of cold, suffocating nothingness that the fire beasts both fear and respect.',
    species: 'smoke_specter',
    rarity: 'epic',
    emberPower: 102,
    summonCost: 780,
    abilities: ['Void Smoke', 'Absolute Chill', 'Ethereal Absorption', 'Dimensional Rift', 'Oblivion Breath'],
    lore: 'The Smoke Annihilator is the only creature in the abyss that is cold. Fire beasts instinctively avoid it, not out of fear, but because its presence causes them physical pain.',
    stats: { attack: 82, defense: 52, speed: 42, magic: 88, hp: 420 },
  },
  {
    id: 'sol_phoenix',
    name: 'Sol Phoenix',
    description: 'A phoenix of such intense flame that it emits actual sunlight from its feathers. Where it flies, the abyss brightens as if a window to the surface has been opened. Its tears can cure any affliction, even the curse of undeath.',
    species: 'ember_phoenix',
    rarity: 'epic',
    emberPower: 108,
    summonCost: 820,
    abilities: ['Solar Flare', 'Light Burst', 'Sunfire Wings', 'Resurrection Cry', 'Eternal Combustion'],
    lore: 'The Sol Phoenix is believed to be the original phoenix from which all others descend. Its flame is not destruction but creation — it births new volcanoes and new life with every wingbeat.',
    stats: { attack: 78, defense: 50, speed: 56, magic: 94, hp: 450 },
  },
  {
    id: 'serpent_sovereign',
    name: 'Serpent Sovereign',
    description: 'The king of all flame serpents, a being of pure liquid fire that commands every lava river in the abyss. Its coils form the boundaries of the chasm territories, and its hisses are the sound of flowing magma.',
    species: 'flame_serpent',
    rarity: 'epic',
    emberPower: 112,
    summonCost: 880,
    abilities: ['River Command', 'Magma Flood', 'Sovereign Coil', 'Fire Tsunami', 'Eternal Venom'],
    lore: 'The Serpent Sovereign predates the abyss itself. It was the first creature to swim through molten rock, and it has been swimming ever since, shaping the underworld with every turn.',
    stats: { attack: 86, defense: 56, speed: 52, magic: 84, hp: 550 },
  },
  {
    id: 'titan_primordius',
    name: 'Titan Primordius',
    description: 'The oldest lava titan in existence, born from the first volcanic eruption in planetary history. Its body is a map of every eruption that has ever occurred, with each flow recorded in its basalt skin as raised relief.',
    species: 'lava_titan',
    rarity: 'epic',
    emberPower: 106,
    summonCost: 810,
    abilities: ['Primordial Strength', 'Magma Heartbeat', 'Earth Shatter', 'Core Awakening', 'Eternal Stance'],
    lore: 'Titan Primordius has not moved in a thousand years. It sits at the center of the deepest chasm, meditating on the heat of the planet\'s core, and nothing can disturb its contemplation.',
    stats: { attack: 92, defense: 82, speed: 6, magic: 68, hp: 700 },
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'magma_god',
    name: 'Magma God',
    description: 'The primordial deity of magma, an entity of pure molten intelligence that exists at the boundary between solid rock and liquid fire. It knows every grain of sand that has ever been melted and can reshape continents with a thought.',
    species: 'magma_wurm',
    rarity: 'legendary',
    emberPower: 160,
    summonCost: 3000,
    abilities: ['Divine Magma', 'Continent Forge', 'Mantle Command', 'Core Communion', 'Planetary Melt', 'Genesis Eruption'],
    lore: 'The Magma God does not rule the abyss — it IS the abyss. Every magma flow, every chasm, every volcanic eruption is an extension of its vast consciousness.',
    stats: { attack: 140, defense: 90, speed: 60, magic: 150, hp: 1000 },
  },
  {
    id: 'ash_origin',
    name: 'Ash Origin',
    description: 'The first ash elemental, a being composed of the ash from the star that seeded this planet with fire. It carries within it the memory of every volcanic eruption since the dawn of geological time.',
    species: 'ash_elemental',
    rarity: 'legendary',
    emberPower: 155,
    summonCost: 2800,
    abilities: ['Cosmic Ash', 'Temporal Haze', 'Geological Memory', 'Primordial Storm', 'Entropy Ashes', 'Eternal Gray'],
    lore: 'The Ash Origin remembers a time before fire existed. It was there when the first molecule heated enough to combust, and it has been collecting the residue ever since.',
    stats: { attack: 120, defense: 110, speed: 40, magic: 140, hp: 900 },
  },
  {
    id: 'obsidian_eternal',
    name: 'Obsidian Eternal',
    description: 'A golem of perfect indestructibility forged from the first obsidian ever created. Nothing in existence can scratch, chip, or damage it. It stands at the gates of the Infernal Throne as the ultimate guardian.',
    species: 'obsidian_golem',
    rarity: 'legendary',
    emberPower: 165,
    summonCost: 3200,
    abilities: ['Absolute Invincibility', 'Perfect Reflection', 'Eternal Fortress', 'Obsidian Singularity', 'Wall of Eternity', 'Impervious'],
    lore: 'The Obsidian Eternal was forged by the planet itself as a defense mechanism. It has stood guard for four billion years and has never once been challenged successfully.',
    stats: { attack: 110, defense: 160, speed: 20, magic: 120, hp: 1200 },
  },
  {
    id: 'void_smoke',
    name: 'Void Smoke',
    description: 'A being of smoke that exists between dimensions, capable of simultaneously occupying every point in the abyss. It is the silence between eruptions, the stillness between lava flows, the absence that defines all fire.',
    species: 'smoke_specter',
    rarity: 'legendary',
    emberPower: 158,
    summonCost: 2900,
    abilities: ['Omnipresent Smoke', 'Dimensional Eclipse', 'Void Touch', 'Absolute Annihilation', 'Smoke Universe', 'The Great Silence'],
    lore: 'The Void Smoke is what remains when all fire goes out. It is the inevitable end of all heat, all light, all motion. The fire beasts fear it more than anything else in existence.',
    stats: { attack: 130, defense: 80, speed: 100, magic: 135, hp: 800 },
  },
  {
    id: 'phoenix_omega',
    name: 'Phoenix Omega',
    description: 'The final phoenix, the one whose death and rebirth will signal the end of the current age. Its flames are white-hot and carry the combined heat of every phoenix that has ever lived, died, and been reborn.',
    species: 'ember_phoenix',
    rarity: 'legendary',
    emberPower: 162,
    summonCost: 3100,
    abilities: ['Omega Flame', 'Apocalypse Rebirth', 'White Fire', 'Infinite Resurrection', 'Solar Supernova', 'The Final Ember'],
    lore: 'When the Phoenix Omega dies for the last time, its ashes will cool for a thousand years before igniting again as a new star. The cycle of fire depends on its eternal rhythm.',
    stats: { attack: 135, defense: 85, speed: 80, magic: 145, hp: 850 },
  },
  {
    id: 'ouroboros_ignis',
    name: 'Ouroboros Ignis',
    description: 'The flame serpent that devours its own tail in an eternal cycle of creation and destruction. It is the personification of the magma cycle — every eruption feeds it, every cooling flow empowers it.',
    species: 'flame_serpent',
    rarity: 'legendary',
    emberPower: 168,
    summonCost: 3300,
    abilities: ['Eternal Cycle', 'Self-Consumption', 'Magma Ouroboros', 'Infinity Coil', 'Cycle Break', 'Primordial Fang'],
    lore: 'The Ouroboros Ignis has been eating its own tail since before time had meaning. Its hunger is infinite, its satisfaction is instantaneous, and its cycle never ends.',
    stats: { attack: 150, defense: 70, speed: 70, magic: 130, hp: 950 },
  },
  {
    id: 'titan_progenitor',
    name: 'Titan Progenitor',
    description: 'The first being to walk on molten rock, the ancestor of all lava titans and, some say, the ancestor of all fire in the abyss. Its heart is a micro-star, and its footsteps create volcanoes.',
    species: 'lava_titan',
    rarity: 'legendary',
    emberPower: 170,
    summonCost: 3500,
    abilities: ['Progenitor Strength', 'Heart of Stars', 'Volcanic Genesis', 'Core Awakening', 'Planetary Stomp', 'The First Flame'],
    lore: 'The Titan Progenitor remembers when the planet was entirely molten. It misses those days of perfect fluidity, when rock was like water and every direction was down.',
    stats: { attack: 160, defense: 100, speed: 30, magic: 120, hp: 1100 },
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: EA_CHASMS — 8 Abyss Chasm Locations
// ═══════════════════════════════════════════════════════════════════

export const EA_CHASMS: readonly EAChasmDef[] = [
  {
    id: 'magma_river',
    name: 'Magma River',
    description:
      'A vast underground river of flowing magma that cuts through the upper abyss like a burning scar. The river\'s current is strong enough to carry beasts and debris for miles, and its banks are lined with deposits of rare volcanic minerals.',
    minLevel: 1,
    unlockCost: 0,
    bonuses: ['+5% beast summon power', 'Basic material gathering', 'Fire beast encounters'],
    element: 'magma',
  },
  {
    id: 'ash_chambers',
    name: 'Ash Chambers',
    description:
      'Enormous caverns filled with layers of compacted volcanic ash from ancient eruptions. The air is thick with fine particulates that glow faintly with residual heat, and strange creatures nest in the soft ash dunes.',
    minLevel: 5,
    unlockCost: 200,
    bonuses: ['+10% ash material yield', 'Smoke beast encounters', 'Obsidian deposits'],
    element: 'ash',
  },
  {
    id: 'lava_falls',
    name: 'Lava Falls',
    description:
      'Cascading waterfalls of molten rock that thunder into vast lava pools with incredible force. The constant roar of falling magma can be heard throughout the abyss, and the mist of superheated vapor creates a permanent thermal haze.',
    minLevel: 10,
    unlockCost: 500,
    bonuses: ['+15% lava energy generation', 'Rare beast encounters', 'Magma crystal veins'],
    element: 'lava',
  },
  {
    id: 'smoke_pits',
    name: 'Smoke Pits',
    description:
      'Deep volcanic vents that release constant streams of toxic gases and superheated steam. The pits are surrounded by rings of crystallized sulfur that glow with an eerie yellow-green light in the darkness.',
    minLevel: 15,
    unlockCost: 1200,
    bonuses: ['+20% smoke ability power', 'Epic beast encounters', 'Sulfur deposits'],
    element: 'smoke',
  },
  {
    id: 'obsidian_fortress',
    name: 'Obsidian Fortress',
    description:
      'A sprawling citadel of polished obsidian that rises from a lake of cooling magma. The fortress is home to the most powerful obsidian golems and serves as the administrative center of the abyss.',
    minLevel: 20,
    unlockCost: 2500,
    bonuses: ['+25% structure defense', 'Artifact crafting', 'Golem army recruitment'],
    element: 'obsidian',
  },
  {
    id: 'ember_forge',
    name: 'Ember Forge',
    description:
      'An ancient forge built into the side of an active volcanic vent. The forge\'s heat is so intense that it can melt any known material, and legendary weapons forged here carry the essence of the abyss itself.',
    minLevel: 28,
    unlockCost: 4000,
    bonuses: ['+30% forging quality', 'Legendary artifact forging', 'Ember phoenix nesting grounds'],
    element: 'ember',
  },
  {
    id: 'infernal_depths',
    name: 'Infernal Depths',
    description:
      'The deepest reaches of the abyss where the boundary between rock and magma becomes indistinct. Gravity behaves erratically here, and the air is so hot that it ignites spontaneously. Only the most powerful beasts dare to dwell.',
    minLevel: 35,
    unlockCost: 6000,
    bonuses: ['+35% all beast stats', 'Legendary beast encounters', 'Core material extraction'],
    element: 'flame',
  },
  {
    id: 'infernal_throne',
    name: 'Infernal Throne',
    description:
      'The heart of the Ember Abyss — a vast chamber at the planet\'s mantle boundary where the temperature approaches that of the core itself. The Infernal Throne sits atop a pillar of pure magma, radiating power that sustains the entire abyss ecosystem.',
    minLevel: 45,
    unlockCost: 10000,
    bonuses: ['+50% all power bonuses', 'All legendary content unlocked', 'Title advancement'],
    element: 'magma',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: EA_MATERIALS — 30 Fire/Magma Materials
// ═══════════════════════════════════════════════════════════════════

export const EA_MATERIALS: readonly EAMaterialDef[] = [
  // Common (6)
  { id: 'magma_core', name: 'Magma Core', description: 'A concentrated sphere of pure magma energy harvested from the deepest flows', rarity: 'common', source: 'magma_river', value: 15, category: 'magma' },
  { id: 'ash_crystal', name: 'Ash Crystal', description: 'Crystallized volcanic ash that still radiates residual heat', rarity: 'common', source: 'ash_chambers', value: 12, category: 'ash' },
  { id: 'obsidian_shard', name: 'Obsidian Shard', description: 'A sharp fragment of volcanic glass with razor edges', rarity: 'common', source: 'obsidian_fortress', value: 10, category: 'obsidian' },
  { id: 'ember_dust', name: 'Ember Dust', description: 'Fine particles of concentrated ember-light collected from phoenix feathers', rarity: 'common', source: 'ember_forge', value: 14, category: 'ember' },
  { id: 'smoke_residue', name: 'Smoke Residue', description: 'Condensed volcanic smoke that retains magical properties', rarity: 'common', source: 'smoke_pits', value: 8, category: 'smoke' },
  { id: 'lava_pebble', name: 'Lava Pebble', description: 'A small stone of cooling lava that still glows with inner heat', rarity: 'common', source: 'lava_falls', value: 10, category: 'lava' },
  // Uncommon (6)
  { id: 'fire_opal', name: 'Fire Opal', description: 'A gemstone that flickers with internal flame, highly prized by abyss jewelers', rarity: 'uncommon', source: 'magma_river', value: 50, category: 'magma' },
  { id: 'sulfur_cluster', name: 'Sulfur Cluster', description: 'A cluster of crystalline sulfur with potent magical reactivity', rarity: 'uncommon', source: 'smoke_pits', value: 45, category: 'smoke' },
  { id: 'basalt_plate', name: 'Basalt Plate', description: 'A flat slab of reinforced basalt used in structure construction', rarity: 'uncommon', source: 'obsidian_fortress', value: 40, category: 'obsidian' },
  { id: 'lava_quartz', name: 'Lava Quartz', description: 'Quartz formed under extreme volcanic pressure with embedded magma inclusions', rarity: 'uncommon', source: 'lava_falls', value: 55, category: 'lava' },
  { id: 'ember_fragments', name: 'Ember Fragments', description: 'Broken pieces of phoenix feathers that still contain living flame', rarity: 'uncommon', source: 'ember_forge', value: 48, category: 'ember' },
  { id: 'volcanic_glass', name: 'Volcanic Glass', description: 'Translucent volcanic glass of exceptional clarity and magical conductivity', rarity: 'uncommon', source: 'ash_chambers', value: 42, category: 'ash' },
  // Rare (6)
  { id: 'infernal_sapphire', name: 'Infernal Sapphire', description: 'A deep red sapphire that burns with eternal internal flame', rarity: 'rare', source: 'infernal_depths', value: 200, category: 'magma' },
  { id: 'primordial_ash', name: 'Primordial Ash', description: 'Ash from the first volcanic eruption, imbued with creation energy', rarity: 'rare', source: 'ash_chambers', value: 180, category: 'ash' },
  { id: 'obsidian_heart', name: 'Obsidian Heart', description: 'The core crystal of an obsidian golem, containing its consciousness', rarity: 'rare', source: 'obsidian_fortress', value: 220, category: 'obsidian' },
  { id: 'phoenix_ash', name: 'Phoenix Ash', description: 'The sacred ash left behind when a phoenix completes its rebirth cycle', rarity: 'rare', source: 'ember_forge', value: 250, category: 'ember' },
  { id: 'smoke_essence', name: 'Smoke Essence', description: 'Liquid smoke that exists between material and ethereal states', rarity: 'rare', source: 'smoke_pits', value: 190, category: 'smoke' },
  { id: 'magma_crystal', name: 'Magma Crystal', description: 'A crystal formed from pure magma under extreme pressure deep in the earth', rarity: 'rare', source: 'magma_river', value: 210, category: 'magma' },
  // Epic (6)
  { id: 'dragon_fire_stone', name: 'Dragon Fire Stone', description: 'A legendary gem that contains the concentrated fury of an ancient fire dragon', rarity: 'epic', source: 'infernal_depths', value: 800, category: 'magma' },
  { id: 'void_ash_orb', name: 'Void Ash Orb', description: 'A sphere of ash so dense it creates its own gravitational field', rarity: 'epic', source: 'infernal_throne', value: 750, category: 'ash' },
  { id: 'eternal_obsidian', name: 'Eternal Obsidian', description: 'Obsidian that cannot be broken by any known force, the same material as the Eternal golem', rarity: 'epic', source: 'obsidian_fortress', value: 850, category: 'obsidian' },
  { id: 'omega_ember', name: 'Omega Ember', description: 'A fragment of the Phoenix Omega\'s flame, burning at the temperature of a small star', rarity: 'epic', source: 'ember_forge', value: 900, category: 'ember' },
  { id: 'dimensional_smoke', name: 'Dimensional Smoke', description: 'Smoke that exists in multiple dimensions simultaneously, useful for portal crafting', rarity: 'epic', source: 'smoke_pits', value: 780, category: 'smoke' },
  { id: 'core_lava_sample', name: 'Core Lava Sample', description: 'A vial of lava from the planet\'s outer core, dangerously radioactive', rarity: 'epic', source: 'infernal_depths', value: 820, category: 'lava' },
  // Legendary (6)
  { id: 'magma_god_heart', name: 'Magma God Heart', description: 'The crystallized heart of the Magma God, pulsing with planetary volcanic energy', rarity: 'legendary', source: 'infernal_throne', value: 3000, category: 'magma' },
  { id: 'ash_of_creation', name: 'Ash of Creation', description: 'The primordial ash from which all fire was born, containing the essence of ignition', rarity: 'legendary', source: 'infernal_throne', value: 2800, category: 'ash' },
  { id: 'obsidian_singularity', name: 'Obsidian Singularity', description: 'A point of infinite density compressed into volcanic glass, warping reality around it', rarity: 'legendary', source: 'infernal_throne', value: 3200, category: 'obsidian' },
  { id: 'phoenix_omega_feather', name: 'Phoenix Omega Feather', description: 'A single feather from the Phoenix Omega, containing infinite resurrection energy', rarity: 'legendary', source: 'infernal_throne', value: 3500, category: 'ember' },
  { id: 'smoke_of_oblivion', name: 'Smoke of Oblivion', description: 'Smoke that can erase anything from existence by absorbing its heat signature', rarity: 'legendary', source: 'infernal_throne', value: 2900, category: 'smoke' },
  { id: 'lava_of genesis', name: 'Lava of Genesis', description: 'Molten rock from the planet\'s formation that still contains the energy of creation', rarity: 'legendary', source: 'infernal_throne', value: 3100, category: 'lava' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: EA_STRUCTURES — 25 Abyss Structures
// ═══════════════════════════════════════════════════════════════════

export const EA_STRUCTURES: readonly EAStructureDef[] = [
  // Fortification (5)
  { id: 'lava_wall', name: 'Lava Wall', description: 'A defensive wall of solidified lava that radiates heat to deter intruders', baseCost: 100, costMultiplier: 1.5, maxLevel: 10, category: 'fortification' },
  { id: 'obsidian_fortress_gate', name: 'Obsidian Fortress Gate', description: 'An imposing gate of polished obsidian that seals the fortress from unwanted visitors', baseCost: 200, costMultiplier: 1.6, maxLevel: 10, category: 'fortification' },
  { id: 'magma_moat', name: 'Magma Moat', description: 'A moat of flowing lava that surrounds structures and burns anything that falls in', baseCost: 150, costMultiplier: 1.5, maxLevel: 10, category: 'fortification' },
  { id: 'ember_barricade', name: 'Ember Barricade', description: 'A barrier of concentrated ember energy that blocks physical and magical attacks', baseCost: 180, costMultiplier: 1.7, maxLevel: 10, category: 'fortification' },
  { id: 'infernal_tower', name: 'Infernal Tower', description: 'A watchtower that provides line of sight over the entire chasm and early warning of threats', baseCost: 250, costMultiplier: 1.8, maxLevel: 10, category: 'fortification' },
  // Extraction (5)
  { id: 'ember_forge', name: 'Ember Forge', description: 'A forge that uses concentrated ember heat to craft weapons and artifacts', baseCost: 300, costMultiplier: 1.6, maxLevel: 10, category: 'extraction' },
  { id: 'magma_pump', name: 'Magma Pump', description: 'Extracts raw magma from deep veins for processing and energy generation', baseCost: 200, costMultiplier: 1.5, maxLevel: 10, category: 'extraction' },
  { id: 'ash_collector', name: 'Ash Collector', description: 'A device that harvests and processes volcanic ash into usable materials', baseCost: 150, costMultiplier: 1.5, maxLevel: 10, category: 'extraction' },
  { id: 'obsidian_quarry', name: 'Obsidian Quarry', description: 'A mining operation that extracts high-quality obsidian from volcanic deposits', baseCost: 350, costMultiplier: 1.7, maxLevel: 10, category: 'extraction' },
  { id: 'smoke_condenser', name: 'Smoke Condenser', description: 'Captures volcanic smoke and condenses it into liquid smoke for various uses', baseCost: 180, costMultiplier: 1.6, maxLevel: 10, category: 'extraction' },
  // Defense (5)
  { id: 'flame_turret', name: 'Flame Turret', description: 'An automated turret that fires concentrated bolts of fire at approaching threats', baseCost: 400, costMultiplier: 1.8, maxLevel: 10, category: 'defense' },
  { id: 'inferno_mine', name: 'Inferno Mine', description: 'A pressure-sensitive mine that detonates in a sphere of devastating fire', baseCost: 250, costMultiplier: 1.7, maxLevel: 10, category: 'defense' },
  { id: 'smoke_screen_generator', name: 'Smoke Screen Generator', description: 'Generates dense clouds of obscuring smoke to hide structures from detection', baseCost: 200, costMultiplier: 1.5, maxLevel: 10, category: 'defense' },
  { id: 'lava_trap', name: 'Lava Trap', description: 'A hidden pit that fills with lava when triggered, trapping and incinerating intruders', baseCost: 300, costMultiplier: 1.8, maxLevel: 10, category: 'defense' },
  { id: 'ember_guardian_shrine', name: 'Ember Guardian Shrine', description: 'A shrine that summons an ember guardian to patrol and defend the area', baseCost: 500, costMultiplier: 2.0, maxLevel: 10, category: 'defense' },
  // Enchantment (5)
  { id: 'rune_ember_altar', name: 'Rune Ember Altar', description: 'An altar inscribed with ancient volcanic runes that enhances beast abilities', baseCost: 350, costMultiplier: 1.7, maxLevel: 10, category: 'enchantment' },
  { id: 'ash_enchantment_circle', name: 'Ash Enchantment Circle', description: 'A ritual circle that channels ash elemental energy for enchantments', baseCost: 400, costMultiplier: 1.8, maxLevel: 10, category: 'enchantment' },
  { id: 'obsidian_enhancement_lab', name: 'Obsidian Enhancement Lab', description: 'A laboratory that uses obsidian resonance to enhance equipment', baseCost: 450, costMultiplier: 1.9, maxLevel: 10, category: 'enchantment' },
  { id: 'flame_incubator', name: 'Flame Incubator', description: 'An incubation chamber that speeds up beast egg hatching and growth', baseCost: 300, costMultiplier: 1.6, maxLevel: 10, category: 'enchantment' },
  { id: 'smoke_divination_chamber', name: 'Smoke Divination Chamber', description: 'A chamber where smoke patterns reveal information about abyss events', baseCost: 280, costMultiplier: 1.7, maxLevel: 10, category: 'enchantment' },
  // Storage (5)
  { id: 'magma_vault', name: 'Magma Vault', description: 'A heat-proof vault for storing valuable magma materials and artifacts', baseCost: 120, costMultiplier: 1.4, maxLevel: 10, category: 'storage' },
  { id: 'ash_repository', name: 'Ash Repository', description: 'A climate-controlled storage facility for preserving ash materials', baseCost: 100, costMultiplier: 1.4, maxLevel: 10, category: 'storage' },
  { id: 'obsidian_armory', name: 'Obsidian Armory', description: 'An armory that stores and maintains obsidian weapons and gear', baseCost: 200, costMultiplier: 1.5, maxLevel: 10, category: 'storage' },
  { id: 'ember_bank', name: 'Ember Bank', description: 'A secure vault for storing ember power and valuable fire currencies', baseCost: 150, costMultiplier: 1.5, maxLevel: 10, category: 'storage' },
  { id: 'smoke_archive', name: 'Smoke Archive', description: 'An archive that preserves knowledge and scrolls in smoke-bound form', baseCost: 180, costMultiplier: 1.6, maxLevel: 10, category: 'storage' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: EA_ABILITIES — 22 Fire Abilities
// ═══════════════════════════════════════════════════════════════════

export const EA_ABILITIES: readonly EAAbilityDef[] = [
  // Magma (4)
  { id: 'magma_burst', name: 'Magma Burst', description: 'Unleash a concentrated burst of magma in a target direction, dealing heavy fire damage', cooldown: 15000, power: 30, element: 'magma', emberCost: 15 },
  { id: 'magma_flow', name: 'Magma Flow', description: 'Create a river of magma that sweeps across the battlefield, damaging and slowing enemies', cooldown: 30000, power: 50, element: 'magma', emberCost: 30 },
  { id: 'magma_shield', name: 'Magma Shield', description: 'Form a protective barrier of cooling magma that absorbs incoming attacks', cooldown: 20000, power: 25, element: 'magma', emberCost: 20 },
  { id: 'magma_eruption', name: 'Magma Eruption', description: 'Trigger a localized volcanic eruption that devastates a wide area', cooldown: 60000, power: 80, element: 'magma', emberCost: 50 },
  // Ash (3)
  { id: 'ash_storm', name: 'Ash Storm', description: 'Summon a swirling storm of volcanic ash that blinds and damages all nearby enemies', cooldown: 25000, power: 40, element: 'ash', emberCost: 25 },
  { id: 'ash_blind', name: 'Ash Blind', description: 'Targeted ash burst that blinds a single enemy for several seconds', cooldown: 12000, power: 20, element: 'ash', emberCost: 10 },
  { id: 'ash_wall', name: 'Ash Wall', description: 'Raise a wall of compacted volcanic ash that blocks movement and projectiles', cooldown: 18000, power: 30, element: 'ash', emberCost: 18 },
  // Lava (4)
  { id: 'lava_lash', name: 'Lava Lash', description: 'Strike with a whip of molten lava that extends to incredible range', cooldown: 10000, power: 22, element: 'lava', emberCost: 12 },
  { id: 'lava_pool', name: 'Lava Pool', description: 'Create a pool of lava at a target location that damages anything standing in it', cooldown: 20000, power: 35, element: 'lava', emberCost: 22 },
  { id: 'lava_rain', name: 'Lava Rain', description: 'Call down a rain of molten rock droplets from above, showering a large area', cooldown: 35000, power: 55, element: 'lava', emberCost: 35 },
  { id: 'lava_tsunami', name: 'Lava Tsunami', description: 'Send a massive wave of lava cascading across the battlefield', cooldown: 60000, power: 85, element: 'lava', emberCost: 55 },
  // Smoke (3)
  { id: 'smoke_veil', name: 'Smoke Veil', description: 'Envelop yourself in obscuring smoke, becoming invisible and gaining evasion', cooldown: 15000, power: 20, element: 'smoke', emberCost: 15 },
  { id: 'smoke_bomb', name: 'Smoke Bomb', description: 'Throw a concentrated smoke bomb that fills a room with suffocating haze', cooldown: 20000, power: 30, element: 'smoke', emberCost: 18 },
  { id: 'smoke_mirror', name: 'Smoke Mirror', description: 'Create a duplicate of yourself from smoke that confuses enemies', cooldown: 25000, power: 25, element: 'smoke', emberCost: 20 },
  // Ember (4)
  { id: 'ember_blast', name: 'Ember Blast', description: 'Fire a concentrated blast of ember energy that explodes on impact', cooldown: 8000, power: 18, element: 'ember', emberCost: 10 },
  { id: 'ember_heal', name: 'Ember Heal', description: 'Channel ember energy to restore health to yourself or an ally', cooldown: 20000, power: 25, element: 'ember', emberCost: 15 },
  { id: 'ember_inferno', name: 'Ember Inferno', description: 'Ignite the entire area in a raging inferno of ember-fire', cooldown: 45000, power: 65, element: 'ember', emberCost: 40 },
  { id: 'ember_phoenix_rise', name: 'Phoenix Rise', description: 'Transform into a phoenix of pure ember, gaining flight and fire immunity temporarily', cooldown: 90000, power: 70, element: 'ember', emberCost: 45 },
  // Obsidian (2)
  { id: 'obsidian_spike', name: 'Obsidian Spike', description: 'Launch a spike of volcanic glass that pierces armor and deals bleeding damage', cooldown: 12000, power: 24, element: 'obsidian', emberCost: 14 },
  { id: 'obsidian_fortress', name: 'Fortress Form', description: 'Temporarily transform into an invincible obsidian statue that reflects all damage', cooldown: 60000, power: 60, element: 'obsidian', emberCost: 38 },
  // Flame (2)
  { id: 'flame_strike', name: 'Flame Strike', description: 'A swift melee attack wreathed in fire that deals bonus damage to burning targets', cooldown: 5000, power: 15, element: 'flame', emberCost: 8 },
  { id: 'flame_aura', name: 'Flame Aura', description: 'Surround yourself with a constant aura of flame that burns nearby enemies', cooldown: 30000, power: 35, element: 'flame', emberCost: 22 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: EA_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const EA_ACHIEVEMENTS: readonly EAAchievementDef[] = [
  { id: 'first_spark', name: 'First Spark', description: 'Summon your first fire beast', condition: 'summon_1', reward: '+50 ember power', icon: '🔥' },
  { id: 'beast_lord', name: 'Beast Lord', description: 'Tame 10 fire beasts', condition: 'summon_10', reward: '+200 ember power', icon: '🐉' },
  { id: 'chasm_explorer', name: 'Chasm Explorer', description: 'Claim 4 different chasm locations', condition: 'chasm_4', reward: '+300 lava energy', icon: '🌋' },
  { id: 'fortress_builder', name: 'Fortress Builder', description: 'Build 5 abyss structures', condition: 'build_5', reward: '+400 lava energy', icon: '🏰' },
  { id: 'rare_tamer', name: 'Rare Tamer', description: 'Summon a rare tier fire beast', condition: 'rare_beast', reward: '+500 ember power', icon: '💎' },
  { id: 'abyss_architect', name: 'Abyss Architect', description: 'Build 15 abyss structures', condition: 'build_15', reward: '+1000 lava energy', icon: '🏗️' },
  { id: 'material_hoarder', name: 'Material Hoarder', description: 'Collect 100 total materials', condition: 'material_100', reward: '+600 ember power', icon: '📦' },
  { id: 'epic_beast', name: 'Epic Beast Master', description: 'Summon an epic tier fire beast', condition: 'epic_beast', reward: '+1000 ember power', icon: '🌟' },
  { id: 'full_chasms', name: 'Full Abyss Map', description: 'Claim all 8 chasm locations', condition: 'chasm_8', reward: '+2000 lava energy', icon: '🗺️' },
  { id: 'structure_master', name: 'Structure Master', description: 'Build 25 abyss structures', condition: 'build_25', reward: '+1500 lava energy', icon: '🏛️' },
  { id: 'legendary_tamer', name: 'Legendary Tamer', description: 'Summon a legendary tier fire beast', condition: 'legendary_beast', reward: '+2000 ember power', icon: '👑' },
  { id: 'relic_hunter', name: 'Relic Hunter', description: 'Activate 5 legendary artifacts', condition: 'artifact_5', reward: '+1500 ember power', icon: '⚜️' },
  { id: 'magma_strike_100', name: 'Magma Strike Veteran', description: 'Perform 100 magma strikes', condition: 'strike_100', reward: '+800 ember power', icon: '⚡' },
  { id: 'abyss_lord', name: 'Abyss Lord', description: 'Reach level 30', condition: 'level_30', reward: '+3000 lava energy', icon: '🛡️' },
  { id: 'phoenix_guardian', name: 'Phoenix Guardian', description: 'Summon all 7 ember phoenix species beasts', condition: 'phoenix_7', reward: '+2000 ember power', icon: '🦅' },
  { id: 'obsidian_army', name: 'Obsidian Army', description: 'Build all obsidian category structures', condition: 'obsidian_5', reward: '+1200 lava energy', icon: '🗿' },
  { id: 'title_abyss_overlord', name: 'Abyss Overlord', description: 'Earn the Abyss Overlord title', condition: 'title_max', reward: '+5000 ember power', icon: '🏆' },
  { id: 'collection_complete', name: 'Complete Collection', description: 'Summon all 35 fire beasts', condition: 'summon_35', reward: '+5000 ember power, Abyss Overlord title', icon: '👑' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: EA_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const EA_TITLES: readonly EATitleDef[] = [
  { id: 'spark_tender', name: 'Spark Tender', description: 'A novice keeper of small embers, learning the ways of fire', requiredLevel: 1, requiredBeasts: 0 },
  { id: 'ember_keeper', name: 'Ember Keeper', description: 'One who tends the eternal embers and keeps the abyss fires burning', requiredLevel: 5, requiredBeasts: 3 },
  { id: 'flame_walker', name: 'Flame Walker', description: 'A warrior who walks through fire unharmed, wielding flames as weapons', requiredLevel: 10, requiredBeasts: 7 },
  { id: 'magma_lord', name: 'Magma Lord', description: 'A ruler of the magma rivers who commands the flow of molten rock', requiredLevel: 18, requiredBeasts: 14 },
  { id: 'obsidian_sovereign', name: 'Obsidian Sovereign', description: 'Master of the obsidian fortresses, commander of the golem armies', requiredLevel: 25, requiredBeasts: 21 },
  { id: 'inferno_monarch', name: 'Inferno Monarch', description: 'The ruler of the infernal depths who commands the deepest fires', requiredLevel: 32, requiredBeasts: 28 },
  { id: 'volcanic_emperor', name: 'Volcanic Emperor', description: 'Emperor of the volcanic underworld, sovereign over all fire beasts', requiredLevel: 40, requiredBeasts: 33 },
  { id: 'abyss_overlord', name: 'Abyss Overlord', description: 'The supreme ruler of the Ember Abyss, master of all that burns', requiredLevel: 50, requiredBeasts: 35 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: EA_ARTIFACTS — 15 Legendary Artifacts
// ═══════════════════════════════════════════════════════════════════

export const EA_ARTIFACTS: readonly EAArtifactDef[] = [
  { id: 'magma_core_amulet', name: 'Magma Core Amulet', description: 'An amulet containing a miniature star of pure magma energy that radiates constant heat', rarity: 'common', powerBonus: 20, specialAbility: '+10% magma ability power', forgeCost: 100 },
  { id: 'ash_crown', name: 'Ash Crown', description: 'A crown woven from the ash of a thousand extinguished volcanoes', rarity: 'uncommon', powerBonus: 35, specialAbility: '+15% ash ability power', forgeCost: 300 },
  { id: 'obsidian_blade', name: 'Obsidian Blade', description: 'A sword of volcanic glass that can cut through any material', rarity: 'uncommon', powerBonus: 40, specialAbility: '+20% attack damage', forgeCost: 400 },
  { id: 'ember_torch', name: 'Ember Torch', description: 'A torch that burns with eternal ember-light, never dimming or extinguishing', rarity: 'common', powerBonus: 25, specialAbility: '+5% ember regeneration', forgeCost: 150 },
  { id: 'lava_scepter', name: 'Lava Scepter', description: 'A scepter topped with a sphere of flowing lava that amplifies command', rarity: 'rare', powerBonus: 70, specialAbility: '+25% lava energy generation', forgeCost: 1000 },
  { id: 'smoke_cloak', name: 'Smoke Cloak', description: 'A cloak of living smoke that provides perfect invisibility', rarity: 'rare', powerBonus: 60, specialAbility: '+30% evasion chance', forgeCost: 800 },
  { id: 'infernal_helm', name: 'Infernal Helm', description: 'A helmet forged in the deepest chasm that protects against all fire', rarity: 'epic', powerBonus: 120, specialAbility: '+40% fire resistance', forgeCost: 2500 },
  { id: 'phoenix_quill', name: 'Phoenix Quill', description: 'A writing instrument made from a phoenix feather that writes in fire', rarity: 'epic', powerBonus: 100, specialAbility: '+20% all beast power', forgeCost: 2000 },
  { id: 'titan_fist', name: 'Titan Fist', description: 'A gauntlet that grants the strength of a lava titan to the wearer', rarity: 'epic', powerBonus: 130, specialAbility: '+50% physical damage', forgeCost: 2800 },
  { id: 'serpent_circlet', name: 'Serpent Circlet', description: 'A circlet that allows communication with flame serpents', rarity: 'rare', powerBonus: 55, specialAbility: '+15% beast summon success', forgeCost: 900 },
  { id: 'world_borer_fang', name: 'World Borer Fang', description: 'A fang from the legendary World Borer that can tunnel through anything', rarity: 'legendary', powerBonus: 200, specialAbility: '+50% magma damage', forgeCost: 8000 },
  { id: 'ash_origin_pearl', name: 'Ash Origin Pearl', description: 'A pearl from the first ash elemental containing creation energy', rarity: 'legendary', powerBonus: 180, specialAbility: '+40% all ability power', forgeCost: 7000 },
  { id: 'eternal_obsidian_shield', name: 'Eternal Obsidian Shield', description: 'A shield made from the same obsidian as the Eternal golem', rarity: 'legendary', powerBonus: 220, specialAbility: '+60% defense', forgeCost: 9000 },
  { id: 'omega_phoenix_plume', name: 'Omega Phoenix Plume', description: 'A feather from the Phoenix Omega that grants partial immortality', rarity: 'legendary', powerBonus: 250, specialAbility: 'Auto-revive once per battle', forgeCost: 10000 },
  { id: 'ouroboros_ring', name: 'Ouroboros Ring', description: 'A ring depicting the flame serpent eating its tail, granting infinite energy', rarity: 'legendary', powerBonus: 280, specialAbility: '+100% ember regeneration', forgeCost: 12000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: EA_EVENTS — 12 Abyss Events
// ═══════════════════════════════════════════════════════════════════

export const EA_EVENTS: readonly EAEventDef[] = [
  { id: 'volcanic_eruption', name: 'Volcanic Eruption', description: 'A massive eruption shakes the abyss, revealing new magma deposits but damaging structures', severity: 7, duration: 60000, effects: ['Doubles material spawns', '20% structure damage', 'Increases beast aggression'], element: 'magma' },
  { id: 'ash_storm', name: 'Ash Storm', description: 'A devastating storm of volcanic ash engulfs the chasms, reducing visibility and damaging smoke beasts', severity: 5, duration: 45000, effects: ['Reduces visibility to zero', 'Smoke beasts take 30% more damage', 'Ash material bonus'], element: 'ash' },
  { id: 'lava_flood', name: 'Lava Flood', description: 'Rising magma levels flood the lower chasms, forcing beasts to higher ground', severity: 6, duration: 50000, effects: ['Lower chasms inaccessible', 'Lava energy +50%', 'Rare materials surface'], element: 'lava' },
  { id: 'smoke_invasion', name: 'Smoke Specter Invasion', description: 'Hordes of smoke specters pour from the depths, attacking structures and beasts', severity: 8, duration: 70000, effects: ['Wave-based enemy spawns', 'Smoke material bonus', 'Defense ability boost'], element: 'smoke' },
  { id: 'ember_surge', name: 'Ember Surge', description: 'A wave of concentrated ember energy sweeps through the abyss, empowering phoenix beasts', severity: 3, duration: 30000, effects: ['Ember beasts +50% power', 'Phoenix summon chance doubled', 'Ember regeneration doubled'], element: 'ember' },
  { id: 'obsidian_resonance', name: 'Obsidian Resonance', description: 'All obsidian in the abyss begins to vibrate with harmonic energy', severity: 4, duration: 40000, effects: ['Obsidian golems +30% defense', 'Structure repair bonus', 'Artifact discovery chance +25%'], element: 'obsidian' },
  { id: 'flame_rebellion', name: 'Flame Rebellion', description: 'The flame serpents rise up in coordinated rebellion, attacking all other species', severity: 9, duration: 80000, effects: ['Flame serpent encounters only', 'Double flame serpent loot', 'Other species flee'], element: 'flame' },
  { id: 'infernal_convergence', name: 'Infernal Convergence', description: 'All fire element types converge in a single point, creating unprecedented power', severity: 10, duration: 90000, effects: ['All element bonuses active', 'Triple material yield', 'Legendary encounter chance'], element: 'magma' },
  { id: 'magma_core_exposure', name: 'Magma Core Exposure', description: 'The planet\'s magma core becomes briefly accessible, revealing legendary materials', severity: 6, duration: 55000, effects: ['Legendary materials available', 'Magma energy +100%', 'Core beast encounters'], element: 'magma' },
  { id: 'ash_plague', name: 'Ash Plague', description: 'A supernatural plague of living ash sweeps through the abyss, weakening beasts', severity: 7, duration: 65000, effects: ['All beasts -20% HP', 'Ash material +200%', 'Smoke beasts immune'], element: 'ash' },
  { id: 'phoenix_rebirth_cycle', name: 'Phoenix Rebirth Cycle', description: 'All phoenixes in the abyss enter their rebirth cycle simultaneously', severity: 2, duration: 35000, effects: ['Phoenix beasts transform', 'Massive ember power reward', 'All beasts healed'], element: 'ember' },
  { id: 'abyss_quake', name: 'Abyss Quake', description: 'A catastrophic earthquake reshapes the abyss, destroying and creating structures', severity: 8, duration: 75000, effects: ['Random structure destruction', 'New structure slots', 'Material redistribution', 'Rare artifact discovery'], element: 'lava' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: INITIAL STATE
// ═══════════════════════════════════════════════════════════════════

const initialEAState: EAStoreState = {
  eaLevel: 1,
  eaEmberPower: EA_INITIAL_EMBER_POWER,
  eaLavaEnergy: EA_INITIAL_LAVA_ENERGY,
  eaBeasts: {},
  eaChasms: ['magma_river'],
  eaStructures: [],
  eaArtifacts: [],
  eaAchievements: [],
  eaInventory: {},
  eaStats: {
    totalBeastsSummoned: 0,
    totalChasmsClaimed: 0,
    totalStructuresBuilt: 0,
    totalArtifactsActivated: 0,
    totalEmberPowerEarned: 0,
    totalStrikesPerformed: 0,
    totalPlayTime: 0,
  },
  eaTitle: 'spark_tender',
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

export const useEmberAbyssStore = create<EAFullStore>()(
  persist(
    (set, get) => ({
      ...initialEAState,

      eaSummonBeast: (beastId: string): boolean => {
        const state = get()
        const beastDef = EA_BEASTS.find((b) => b.id === beastId)
        if (!beastDef) return false
        if (state.eaEmberPower < beastDef.summonCost) return false

        const newBeast: EATamedBeast = {
          id: eaGenerateId(),
          beastDefId: beastId,
          name: beastDef.name,
          level: 1,
          currentHP: beastDef.stats.hp,
          maxHP: beastDef.stats.hp,
          power: eaGetBeastPower(beastDef, 1),
          tamedAt: Date.now(),
          expeditionsCompleted: 0,
        }

        const updatedBeasts = { ...state.eaBeasts, [newBeast.id]: newBeast }
        const powerReward = Math.floor(beastDef.emberPower * eaRarityMultiplier(beastDef.rarity))

        set({
          eaBeasts: updatedBeasts,
          eaEmberPower: state.eaEmberPower - beastDef.summonCost,
          eaStats: {
            ...state.eaStats,
            totalBeastsSummoned: state.eaStats.totalBeastsSummoned + 1,
            totalEmberPowerEarned: state.eaStats.totalEmberPowerEarned + powerReward,
          },
        })
        return true
      },

      eaChasmClaim: (chasmId: string): boolean => {
        const state = get()
        const chasm = EA_CHASMS.find((c) => c.id === chasmId)
        if (!chasm) return false
        if (state.eaChasms.includes(chasmId)) return false
        if (state.eaLevel < chasm.minLevel) return false
        if (state.eaLavaEnergy < chasm.unlockCost) return false

        set({
          eaChasms: [...state.eaChasms, chasmId],
          eaLavaEnergy: state.eaLavaEnergy - chasm.unlockCost,
          eaStats: {
            ...state.eaStats,
            totalChasmsClaimed: state.eaStats.totalChasmsClaimed + 1,
          },
        })
        return true
      },

      eaBuildStructure: (structureId: string): boolean => {
        const state = get()
        const structureDef = EA_STRUCTURES.find((s) => s.id === structureId)
        if (!structureDef) return false
        const existing = state.eaStructures.find((s) => s.structureDefId === structureId)
        if (existing) return false
        if (state.eaLavaEnergy < structureDef.baseCost) return false

        const newStructure: EAOwnedStructure = {
          id: eaGenerateId(),
          structureDefId: structureId,
          level: 1,
          built: true,
        }

        set({
          eaStructures: [...state.eaStructures, newStructure],
          eaLavaEnergy: state.eaLavaEnergy - structureDef.baseCost,
          eaStats: {
            ...state.eaStats,
            totalStructuresBuilt: state.eaStats.totalStructuresBuilt + 1,
          },
        })
        return true
      },

      eaMagmaStrike: (chasmId: string): boolean => {
        const state = get()
        if (!state.eaChasms.includes(chasmId)) return false
        if (state.eaEmberPower < 10) return false

        const chasmDef = EA_CHASMS.find((c) => c.id === chasmId)
        const bonusMultiplier = chasmDef ? chasmDef.minLevel * 0.1 : 1.0
        const emberCost = Math.floor(10 * bonusMultiplier)
        if (state.eaEmberPower < emberCost) return false

        const powerGain = Math.floor(20 + bonusMultiplier * 5)
        const materialChance = 0.3 + bonusMultiplier * 0.05

        const updatedInventory = { ...state.eaInventory }
        const chasmMaterials = EA_MATERIALS.filter((m) => m.source === chasmId)
        for (const mat of chasmMaterials) {
          if (Math.random() < materialChance) {
            const amount = mat.rarity === 'legendary' ? 1 : mat.rarity === 'epic' ? 1 : mat.rarity === 'rare' ? 2 : 3
            updatedInventory[mat.id] = (updatedInventory[mat.id] ?? 0) + amount
          }
        }

        set({
          eaEmberPower: state.eaEmberPower - emberCost,
          eaLavaEnergy: state.eaLavaEnergy + Math.floor(powerGain * 0.5),
          eaInventory: updatedInventory,
          eaStats: {
            ...state.eaStats,
            totalStrikesPerformed: state.eaStats.totalStrikesPerformed + 1,
            totalEmberPowerEarned: state.eaStats.totalEmberPowerEarned + powerGain,
          },
        })
        return true
      },

      eaActivateRelic: (artifactId: string): boolean => {
        const state = get()
        const artifact = EA_ARTIFACTS.find((a) => a.id === artifactId)
        if (!artifact) return false
        if (state.eaArtifacts.includes(artifactId)) return false
        if (state.eaLavaEnergy < artifact.forgeCost) return false

        set({
          eaArtifacts: [...state.eaArtifacts, artifactId],
          eaLavaEnergy: state.eaLavaEnergy - artifact.forgeCost,
          eaStats: {
            ...state.eaStats,
            totalArtifactsActivated: state.eaStats.totalArtifactsActivated + 1,
          },
        })
        return true
      },

      resetEmberAbyss: () => {
        set(initialEAState)
      },
    }),
    {
      name: 'ember-abyss-wire',
      version: 1,
    },
  ),
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: THE HOOK
// ═══════════════════════════════════════════════════════════════════

export default function useEmberAbyss() {
  const store = useEmberAbyssStore()
  const stateRef = useRef(store)

  useEffect(() => {
    stateRef.current = store
  }, [store])

  // ── Getter: Level Progress ────────────────────────────────────
  const eaLevelProgress = useMemo(() => {
    const currentLevel = store.eaLevel
    if (currentLevel >= EA_MAX_LEVEL) return { progress: 1, powerForNext: 0, powerCurrent: 0 }
    const needed = Math.floor(90 * Math.pow(1.12, currentLevel) + currentLevel * 18)
    return {
      progress: Math.min(1, store.eaEmberPower / needed),
      powerForNext: needed,
      powerCurrent: store.eaEmberPower,
    }
  }, [store])

  // ── Getter: Total Power ───────────────────────────────────────
  const eaTotalPower = useMemo(() => {
    const beastPower = Object.values(store.eaBeasts).reduce((sum, b) => sum + b.power, 0)
    const artifactPower = store.eaArtifacts.reduce((sum, aId) => {
      const art = EA_ARTIFACTS.find((a) => a.id === aId)
      return sum + (art ? art.powerBonus : 0)
    }, 0)
    const structurePower = store.eaStructures.reduce((sum, s) => {
      return sum + eaGetStructureBonus(s.structureDefId, s.level)
    }, 0)
    return {
      beastPower,
      artifactPower,
      structurePower,
      totalPower: beastPower + artifactPower + structurePower,
    }
  }, [store])

  // ── Getter: Beast Count by Species ────────────────────────────
  const eaGetBeastCountBySpecies = useMemo(() => {
    return EA_SPECIES.map((species) => {
      const beasts = Object.values(store.eaBeasts).filter((b) => {
        const def = EA_BEASTS.find((bd) => bd.id === b.beastDefId)
        return def && def.species === species.id
      })
      return {
        species: species.id,
        name: species.name,
        color: eaSpeciesColor(species.id),
        count: beasts.length,
        totalPower: beasts.reduce((s, b) => s + b.power, 0),
      }
    })
  }, [store])

  // ── Getter: Rarity Summary ───────────────────────────────────
  const eaGetRaritySummary = useMemo(() => {
    const summary = (['common', 'uncommon', 'rare', 'epic', 'legendary'] as EARarity[]).map((rarity) => {
      const beasts = Object.values(store.eaBeasts).filter((b) => {
        const def = EA_BEASTS.find((bd) => bd.id === b.beastDefId)
        return def && def.rarity === rarity
      })
      return {
        rarity,
        color: eaRarityColor(rarity),
        count: beasts.length,
        totalPower: beasts.reduce((s, b) => s + b.power, 0),
      }
    })
    return summary
  }, [store])

  // ── Getter: Chasm Details ────────────────────────────────────
  const eaGetChasmDetails = useMemo(() => {
    return EA_CHASMS.map((chasm) => ({
      ...chasm,
      isClaimed: store.eaChasms.includes(chasm.id),
      canClaim: store.eaLevel >= chasm.minLevel && store.eaLavaEnergy >= chasm.unlockCost && !store.eaChasms.includes(chasm.id),
      elementColor: eaElementColor(chasm.element),
    }))
  }, [store])

  // ── Getter: Material Inventory ────────────────────────────────
  const eaGetMaterialInventory = useMemo(() => {
    return EA_MATERIALS.map((mat) => ({
      ...mat,
      owned: store.eaInventory[mat.id] ?? 0,
      categoryColor: mat.category === 'magma' ? EA_LAVA_RED
        : mat.category === 'ash' ? EA_ASH_GRAY
        : mat.category === 'lava' ? EA_INFERNO_CRIMSON
        : mat.category === 'obsidian' ? EA_OBSIDIAN_BLACK
        : mat.category === 'ember' ? EA_EMBER_ORANGE
        : EA_SMOKE_CHARCOAL,
    }))
  }, [store])

  // ── Getter: Structure List ───────────────────────────────────
  const eaGetStructureList = useMemo(() => {
    return EA_STRUCTURES.map((structureDef) => {
      const owned = store.eaStructures.find((s) => s.structureDefId === structureDef.id)
      const currentLevel = owned ? owned.level : 0
      const isMaxed = currentLevel >= structureDef.maxLevel
      const upgradeCost = isMaxed ? 0 : eaGetUpgradeCost(structureDef, currentLevel)
      return {
        ...structureDef,
        currentLevel,
        isMaxed,
        upgradeCost,
        bonus: eaGetStructureBonus(structureDef.id, currentLevel),
        canUpgrade: !isMaxed && store.eaLavaEnergy >= upgradeCost,
        isBuilt: !!owned,
      }
    })
  }, [store])

  // ── Getter: Ability List ──────────────────────────────────────
  const eaGetAbilityList = useMemo(() => {
    return EA_ABILITIES.map((ability) => ({
      ...ability,
      elementColor: eaElementColor(ability.element),
    }))
  }, [store])

  // ── Getter: Achievement List ──────────────────────────────────
  const eaGetAchievementList = useMemo(() => {
    return EA_ACHIEVEMENTS.map((ach) => ({
      ...ach,
      completed: store.eaAchievements.includes(ach.id),
    }))
  }, [store])

  // ── Getter: Title Progress ────────────────────────────────────
  const eaGetTitleProgress = useMemo(() => {
    return EA_TITLES.map((title) => ({
      ...title,
      isActive: store.eaTitle === title.id,
      levelMet: store.eaLevel >= title.requiredLevel,
      beastsMet: Object.keys(store.eaBeasts).length >= title.requiredBeasts,
      canEquip: store.eaLevel >= title.requiredLevel && Object.keys(store.eaBeasts).length >= title.requiredBeasts,
    }))
  }, [store])

  // ── Getter: Artifact List ─────────────────────────────────────
  const eaGetArtifactList = useMemo(() => {
    return EA_ARTIFACTS.map((art) => ({
      ...art,
      isActivated: store.eaArtifacts.includes(art.id),
      canActivate: !store.eaArtifacts.includes(art.id) && store.eaLavaEnergy >= art.forgeCost,
    }))
  }, [store])

  // ── Getter: Tamed Beast Details ───────────────────────────────
  const eaGetTamedBeasts = useMemo(() => {
    return Object.values(store.eaBeasts).map((beast) => {
      const def = EA_BEASTS.find((b) => b.id === beast.beastDefId)
      const speciesDef = def ? EA_SPECIES.find((s) => s.id === def.species) : null
      return {
        ...beast,
        beastDef: def,
        speciesDef,
        speciesColor: def ? eaSpeciesColor(def.species) : '#888888',
        rarityColor: def ? eaRarityColor(def.rarity) : '#888888',
      }
    })
  }, [store])

  // ── Getter: Summon Chances ────────────────────────────────────
  const eaGetSummonChances = useMemo(() => {
    const activeChasm = store.eaChasms[store.eaChasms.length - 1] ?? null
    const chances: Record<EARarity, number> = {
      common: eaGetSummonChance('common', activeChasm),
      uncommon: eaGetSummonChance('uncommon', activeChasm),
      rare: eaGetSummonChance('rare', activeChasm),
      epic: eaGetSummonChance('epic', activeChasm),
      legendary: eaGetSummonChance('legendary', activeChasm),
    }
    return chances
  }, [store])

  // ── Getter: Stats Summary ─────────────────────────────────────
  const eaGetStatsSummary = useMemo(() => {
    const totalArtifactCount = store.eaArtifacts.length
    const hasLegendaryArtifact = store.eaArtifacts.some((aId) => {
      const art = EA_ARTIFACTS.find((a) => a.id === aId)
      return art && art.rarity === 'legendary'
    })
    const totalMaterialCount = Object.values(store.eaInventory).reduce((s, v) => s + v, 0)
    return {
      totalBeasts: Object.keys(store.eaBeasts).length,
      totalChasms: store.eaChasms.length,
      totalAbilities: EA_ABILITIES.length,
      totalAchievements: store.eaAchievements.length,
      totalArtifacts: totalArtifactCount,
      hasLegendaryArtifact,
      totalStructures: store.eaStructures.length,
      totalMaterialCount,
      totalStrikes: store.eaStats.totalStrikesPerformed,
    }
  }, [store])

  // ── Getter: Power Breakdown ───────────────────────────────────
  const eaGetPowerBreakdown = useMemo(() => {
    const beastPower = Object.values(store.eaBeasts).reduce((s, b) => s + b.power, 0)
    const artifactPower = store.eaArtifacts.reduce((s, aId) => {
      const art = EA_ARTIFACTS.find((a) => a.id === aId)
      return s + (art ? art.powerBonus : 0)
    }, 0)
    const structurePower = store.eaStructures.reduce((s, st) => {
      return s + eaGetStructureBonus(st.structureDefId, st.level)
    }, 0)
    const totalPower = beastPower + artifactPower + structurePower + store.eaEmberPower
    return {
      beastPower,
      artifactPower,
      structurePower,
      emberPower: store.eaEmberPower,
      totalPower,
      beastPercent: totalPower > 0 ? Math.floor((beastPower / totalPower) * 100) : 0,
      artifactPercent: totalPower > 0 ? Math.floor((artifactPower / totalPower) * 100) : 0,
      structurePercent: totalPower > 0 ? Math.floor((structurePower / totalPower) * 100) : 0,
      emberPercent: totalPower > 0 ? Math.floor((store.eaEmberPower / totalPower) * 100) : 0,
    }
  }, [store])

  // ── Getter: Summoning Costs ────────────────────────────────────
  const eaGetSummoningCosts = useMemo(() => {
    return EA_BEASTS.map((b) => ({
      beastId: b.id,
      name: b.name,
      rarity: b.rarity,
      rarityColor: eaRarityColor(b.rarity),
      summonCost: b.summonCost,
      canAfford: store.eaEmberPower >= b.summonCost,
      isTamed: Object.values(store.eaBeasts).some((beast) => beast.beastDefId === b.id),
    }))
  }, [store])

  // ── Getter: Species Details ───────────────────────────────────
  const eaGetSpeciesDetails = useMemo(() => {
    return EA_SPECIES.map((species) => {
      const beasts = Object.values(store.eaBeasts).filter((beast) => {
        const def = EA_BEASTS.find((b) => b.id === beast.beastDefId)
        return def && def.species === species.id
      })
      return {
        ...species,
        boundCount: beasts.length,
        totalPower: beasts.reduce((s, b) => s + b.power, 0),
      }
    })
  }, [store])

  // ── Getter: Chasm Materials ──────────────────────────────────
  const eaGetChasmMaterials = useMemo(() => {
    return EA_CHASMS.map((chasm) => {
      const availableMaterials = EA_MATERIALS.filter((m) => m.source === chasm.id)
      const isClaimed = store.eaChasms.includes(chasm.id)
      return {
        chasmId: chasm.id,
        chasmName: chasm.name,
        isClaimed,
        availableMaterials,
        materialCount: availableMaterials.length,
        elementColor: eaElementColor(chasm.element),
      }
    })
  }, [store])

  // ── Getter: Upgrade Costs ─────────────────────────────────────
  const eaGetUpgradeCosts = useMemo(() => {
    return EA_STRUCTURES.map((s) => {
      const owned = store.eaStructures.find((os) => os.structureDefId === s.id)
      const level = owned ? owned.level : 0
      return {
        structureId: s.id,
        name: s.name,
        currentLevel: level,
        cost: eaGetUpgradeCost(s, level),
      }
    })
  }, [store])

  // ── Getter: Unlocked Achievements Detail ──────────────────────
  const eaGetUnlockedAchievements = useMemo(() => {
    return store.eaAchievements.map((aId) => {
      const ach = EA_ACHIEVEMENTS.find((a) => a.id === aId)
      return {
        id: aId,
        name: ach?.name ?? 'Unknown',
        description: ach?.description ?? '',
        reward: ach?.reward ?? '',
        icon: ach?.icon ?? '🏅',
      }
    })
  }, [store])

  // ── Getter: Event List ───────────────────────────────────────
  const eaGetEventList = useMemo(() => {
    return EA_EVENTS.map((event) => ({
      ...event,
      elementColor: eaElementColor(event.element),
    }))
  }, [])

  // ── Assemble eaAPI ────────────────────────────────────────────
  const eaAPI = {
    // Constants
    EA_SPECIES,
    EA_BEASTS,
    EA_CHASMS,
    EA_MATERIALS,
    EA_STRUCTURES,
    EA_ABILITIES,
    EA_ACHIEVEMENTS,
    EA_TITLES,
    EA_ARTIFACTS,
    EA_EVENTS,
    EA_LAVA_RED,
    EA_EMBER_ORANGE,
    EA_OBSIDIAN_BLACK,
    EA_ASH_GRAY,
    EA_MOLTEN_GOLD,
    EA_INFERNO_CRIMSON,
    EA_SMOKE_CHARCOAL,
    EA_FLAME_YELLOW,
    EA_HEAT_WHITE,
    EA_DEPTHS_INDIGO,

    // State
    eaLevel: store.eaLevel,
    eaEmberPower: store.eaEmberPower,
    eaLavaEnergy: store.eaLavaEnergy,
    eaBeasts: store.eaBeasts,
    eaChasms: store.eaChasms,
    eaStructures: store.eaStructures,
    eaArtifacts: store.eaArtifacts,
    eaAchievements: store.eaAchievements,
    eaInventory: store.eaInventory,
    eaStats: store.eaStats,
    eaTitle: store.eaTitle,

    // Actions
    eaSummonBeast: store.eaSummonBeast,
    eaChasmClaim: store.eaChasmClaim,
    eaBuildStructure: store.eaBuildStructure,
    eaMagmaStrike: store.eaMagmaStrike,
    eaActivateRelic: store.eaActivateRelic,
    resetEmberAbyss: store.resetEmberAbyss,

    // Getters
    eaLevelProgress,
    eaTotalPower,
    eaGetBeastCountBySpecies,
    eaGetRaritySummary,
    eaGetChasmDetails,
    eaGetMaterialInventory,
    eaGetStructureList,
    eaGetAbilityList,
    eaGetAchievementList,
    eaGetTitleProgress,
    eaGetArtifactList,
    eaGetTamedBeasts,
    eaGetSummonChances,
    eaGetStatsSummary,
    eaGetPowerBreakdown,
    eaGetSummoningCosts,
    eaGetSpeciesDetails,
    eaGetChasmMaterials,
    eaGetUpgradeCosts,
    eaGetUnlockedAchievements,
    eaGetEventList,
  }

  return eaAPI
}
