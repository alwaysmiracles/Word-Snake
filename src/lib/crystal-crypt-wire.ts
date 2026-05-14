/**
 * Crystal Crypt Wire — 水晶地穴 (Crystal Crypt)
 *
 * An underground kingdom of living crystals and gemstone guardians in vast
 * underground caverns. Summon 35 crystal golems across 5 rarity tiers and
 * 7 species, explore 8 crypt locations, collect 30 crystal/gem materials,
 * build 25 crypt structures, wield 22 crystal abilities, earn 8 titles from
 * Gem Novice to Crystal Overlord, gather 15 legendary artifacts, and face
 * 12 crypt events — backed by a Zustand store with persist middleware.
 *
 * Storage key: crystal-crypt-wire
 * Prefix: CC_
 */

import { useEffect, useRef, useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type CCRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type CCSpecies =
  | 'quartz_golem'
  | 'amethyst_wisp'
  | 'ruby_elemental'
  | 'sapphire_guardian'
  | 'emerald_wyrm'
  | 'topaz_beast'
  | 'diamond_titan'

export type CCElement = 'mineral' | 'psychic' | 'fire' | 'water' | 'nature' | 'lightning' | 'radiant'

export interface CCGolemDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly species: CCSpecies
  readonly rarity: CCRarity
  readonly crystalPower: number
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

export interface CCSpeciesDef {
  readonly id: CCSpecies
  readonly name: string
  readonly description: string
  readonly color: string
  readonly passiveBonus: string
  readonly passiveValue: number
  readonly preferredCrypt: string
}

export interface CCCryptDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly minLevel: number
  readonly unlockCost: number
  readonly bonuses: string[]
  readonly element: CCElement
}

export interface CCMaterialDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: CCRarity
  readonly source: string
  readonly value: number
  readonly category: 'crystal' | 'gem' | 'mineral' | 'shard' | 'essence'
}

export interface CCStructureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly costMultiplier: number
  readonly maxLevel: number
  readonly category: 'excavation' | 'production' | 'defense' | 'enchantment' | 'storage'
}

export interface CCAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly element: CCElement
  readonly gemCost: number
}

export interface CCAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
  readonly icon: string
}

export interface CCTitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredCrypts: number
}

export interface CCArtifactDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: CCRarity
  readonly powerBonus: number
  readonly specialAbility: string
  readonly forgeCost: number
}

export interface CCEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly duration: number
  readonly effects: string[]
  readonly element: CCElement
}

export interface CCBoundGolem {
  readonly id: string
  golemDefId: string
  name: string
  level: number
  currentHP: number
  maxHP: number
  power: number
  boundAt: number
  cryptsExplored: number
}

export interface CCOwnedStructure {
  readonly id: string
  structureDefId: string
  level: number
  built: boolean
}

export interface CCStoreState {
  ccLevel: number
  ccCrystalPower: number
  ccGemEnergy: number
  ccBoundGolems: CCBoundGolem[]
  ccClaimedCrypts: string[]
  ccCollectedMaterials: Record<string, number>
  ccStructures: CCOwnedStructure[]
  ccUnlockedAbilities: string[]
  ccAchievements: string[]
  ccActiveTitle: string
  ccForgedArtifacts: string[]
  ccTotalGolemsSummoned: number
  ccTotalCryptsExplored: number
  ccTotalStructuresUpgraded: number
  ccTotalArtifactsForged: number
  ccTotalCrystalPowerEarned: number
  ccActiveEventId: string | null
  ccEventTimer: number
  ccGold: number
  ccCrystalShards: number
  ccActiveCryptId: string | null
  ccStats: {
    totalPrismStrikes: number
    totalRelicActivations: number
    totalCryptClaims: number
    totalStructureBuilds: number
    highestGolemLevel: number
    rarestGolem: string
  }
  ccInventory: Record<string, number>
  ccTitle: string
}

export interface CCStoreActions {
  ccSummonGolem: (golemId: string) => boolean
  ccCryptClaim: (cryptId: string) => boolean
  ccBuildStructure: (structureId: string) => boolean
  ccPrismStrike: (targetId: string) => boolean
  ccActivateRelic: (artifactId: string) => boolean
  resetCrystalCrypt: () => void
}

export type CCFullStore = CCStoreState & CCStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const CC_COLOR_AMETHYST_PURPLE: string = '#9B59B6'
export const CC_COLOR_CRYSTAL_WHITE: string = '#F0F0F5'
export const CC_COLOR_RUBY_RED: string = '#E74C3C'
export const CC_COLOR_EMERALD_GREEN: string = '#2ECC71'
export const CC_COLOR_SAPPHIRE_BLUE: string = '#3498DB'
export const CC_COLOR_TOPAZ_GOLD: string = '#F1C40F'
export const CC_COLOR_DIAMOND_ICE: string = '#E8F4FD'
export const CC_COLOR_CRYPT_DARK: string = '#1A1A2E'
export const CC_COLOR_DEEP_SHADOW: string = '#16213E'
export const CC_COLOR_GLOW_AMETHYST: string = '#D2B4DE'
export const CC_COLOR_GLOW_RUBY: string = '#F1948A'
export const CC_COLOR_GLOW_EMERALD: string = '#82E0AA'
export const CC_COLOR_STONE_GRAY: string = '#7F8C8D'
export const CC_COLOR_CAVE_BROWN: string = '#5D4E37'
export const CC_COLOR_LAVA_ORANGE: string = '#E67E22'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════════

const CC_MAX_LEVEL = 50
const CC_INITIAL_GOLD = 500
const CC_INITIAL_CRYSTAL_POWER = 100
const CC_INITIAL_CRYSTAL_SHARDS = 0

function ccXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= CC_MAX_LEVEL) return Infinity
  return Math.floor(90 * Math.pow(1.12, level) + level * 18)
}

function ccLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < CC_MAX_LEVEL) {
    const needed = ccXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function ccGenerateId(): string {
  return `cc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function ccRarityMultiplier(rarity: CCRarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.5
    case 'rare': return 2.2
    case 'epic': return 3.5
    case 'legendary': return 6.0
  }
}

function ccSpeciesColor(species: CCSpecies): string {
  switch (species) {
    case 'quartz_golem': return CC_COLOR_CRYSTAL_WHITE
    case 'amethyst_wisp': return CC_COLOR_AMETHYST_PURPLE
    case 'ruby_elemental': return CC_COLOR_RUBY_RED
    case 'sapphire_guardian': return CC_COLOR_SAPPHIRE_BLUE
    case 'emerald_wyrm': return CC_COLOR_EMERALD_GREEN
    case 'topaz_beast': return CC_COLOR_TOPAZ_GOLD
    case 'diamond_titan': return CC_COLOR_DIAMOND_ICE
  }
}

function ccElementColor(element: CCElement): string {
  switch (element) {
    case 'mineral': return CC_COLOR_STONE_GRAY
    case 'psychic': return CC_COLOR_AMETHYST_PURPLE
    case 'fire': return CC_COLOR_RUBY_RED
    case 'water': return CC_COLOR_SAPPHIRE_BLUE
    case 'nature': return CC_COLOR_EMERALD_GREEN
    case 'lightning': return CC_COLOR_TOPAZ_GOLD
    case 'radiant': return CC_COLOR_DIAMOND_ICE
  }
}

function ccRarityColor(rarity: CCRarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#34D399'
    case 'rare': return '#60A5FA'
    case 'epic': return '#A78BFA'
    case 'legendary': return '#FBBF24'
  }
}

function ccClamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function ccGetGolemPower(def: CCGolemDef, level: number): number {
  return Math.floor(def.crystalPower * (1 + (level - 1) * 0.15))
}

function ccGetStructureBonus(structureDefId: string, level: number): number {
  const def = CC_STRUCTURES.find(s => s.id === structureDefId)
  if (!def) return 0
  return Math.floor(def.baseCost * 0.05 * level)
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: CC_SPECIES — 7 Crystal Golem Species
// ═══════════════════════════════════════════════════════════════════

export const CC_SPECIES: readonly CCSpeciesDef[] = [
  {
    id: 'quartz_golem',
    name: 'Quartz Golem',
    description:
      'Stolid guardians carved from massive quartz formations deep within the earth. Their translucent bodies pulse with stored geologic energy, and their movements produce harmonic vibrations that resonate through the cavern walls. Quartz golems are the foundation of any crystal army.',
    color: CC_COLOR_CRYSTAL_WHITE,
    passiveBonus: '+10% crystal resonance defense',
    passiveValue: 10,
    preferredCrypt: 'quartz_hollow',
  },
  {
    id: 'amethyst_wisp',
    name: 'Amethyst Wisp',
    description:
      'Ethereal beings that drift through the deepest crypts like violet lanterns. Born from concentrated psychic energy within amethyst clusters, they can project their consciousness across vast distances and sense the presence of any living creature within the underground network.',
    color: CC_COLOR_AMETHYST_PURPLE,
    passiveBonus: '+15% psychic detection range',
    passiveValue: 15,
    preferredCrypt: 'amethyst_sanctum',
  },
  {
    id: 'ruby_elemental',
    name: 'Ruby Elemental',
    description:
      'Blazing entities forged from the volcanic pressure that creates rubies. Their crystalline bodies burn with an inner fire hot enough to melt steel, and their presence warms entire cavern systems to a comfortable temperature. In battle, they channel this fire through their ruby cores.',
    color: CC_COLOR_RUBY_RED,
    passiveBonus: '+12% fire crystal damage',
    passiveValue: 12,
    preferredCrypt: 'ruby_forge',
  },
  {
    id: 'sapphire_guardian',
    name: 'Sapphire Guardian',
    description:
      'Ancient protectors that stand sentinel at the entrances to the most sacred underground chambers. Their sapphire bodies are nearly indestructible, and they project calming blue auras that soothe all friendly creatures within their vicinity while striking terror into intruders.',
    color: CC_COLOR_SAPPHIRE_BLUE,
    passiveBonus: '+15% protective aura strength',
    passiveValue: 15,
    preferredCrypt: 'sapphire_depths',
  },
  {
    id: 'emerald_wyrm',
    name: 'Emerald Wyrm',
    description:
      'Serpentine creatures that tunnel through rock as effortlessly as water flows through sand. Their emerald scales absorb nutrients from mineral deposits, growing larger and stronger with every mile of earth they consume. They are the architects of the underground kingdom.',
    color: CC_COLOR_EMERALD_GREEN,
    passiveBonus: '+10% excavation speed',
    passiveValue: 10,
    preferredCrypt: 'emerald_cavern',
  },
  {
    id: 'topaz_beast',
    name: 'Topaz Beast',
    description:
      'Fierce crystalline predators that store electrical energy within their topaz-laced hides. When threatened, they discharge devastating lightning bolts from every facet of their bodies. Their roars echo through the caverns as thunder, and their footfalls leave scorch marks on stone.',
    color: CC_COLOR_TOPAZ_GOLD,
    passiveBonus: '+8% lightning charge rate',
    passiveValue: 8,
    preferredCrypt: 'topaz_chamber',
  },
  {
    id: 'diamond_titan',
    name: 'Diamond Titan',
    description:
      'The rarest and most powerful of all crystal guardians, forged under extreme pressure deep within the planet mantle. Diamond titans radiate pure white light that purifies all corruption and decay. They are living legends, and to see one is considered the greatest blessing in the underground world.',
    color: CC_COLOR_DIAMOND_ICE,
    passiveBonus: '+20% radiant purification',
    passiveValue: 20,
    preferredCrypt: 'diamond_throne',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: CC_GOLEMS — 35 Crystal Golems (5 per rarity, 7 species)
// ═══════════════════════════════════════════════════════════════════

export const CC_GOLEMS: readonly CCGolemDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'pebble_sentinel',
    name: 'Pebble Sentinel',
    description:
      'A small quartz golem no taller than a child, yet surprisingly determined. It stands guard at tunnel intersections with unwavering vigilance, its single glowing eye scanning for threats with the patience of the mountains themselves.',
    species: 'quartz_golem',
    rarity: 'common',
    crystalPower: 15,
    summonCost: 10,
    abilities: ['Crystal Toss', 'Stone Skin'],
    lore: 'The first Pebble Sentinel was created by a lonely miner who just wanted someone to talk to. It never talks back, but it always listens.',
    stats: { attack: 8, defense: 10, speed: 6, magic: 5, hp: 45 },
  },
  {
    id: 'violet_spark',
    name: 'Violet Spark',
    description:
      'A tiny amethyst wisp that flickers like a candle flame in the darkness. It provides just enough light to guide travelers through narrow passages and emits a gentle hum that eases anxiety and fear.',
    species: 'amethyst_wisp',
    rarity: 'common',
    crystalPower: 12,
    summonCost: 8,
    abilities: ['Glow Pulse', 'Mind Soothe'],
    lore: 'Violet Sparks are born when amethyst clusters resonate at exactly the right frequency during a full moon. This happens more often than you would think.',
    stats: { attack: 4, defense: 3, speed: 20, magic: 14, hp: 25 },
  },
  {
    id: 'ember_crystal',
    name: 'Ember Crystal',
    description:
      'A small ruby elemental that crackles with barely contained heat. Its body temperature hovers just below the melting point of lead, and it leaves scorch marks on any surface it rests upon for too long.',
    species: 'ruby_elemental',
    rarity: 'common',
    crystalPower: 16,
    summonCost: 11,
    abilities: ['Heat Touch', 'Glowing Ember'],
    lore: 'Ember Crystals form when volcanic activity meets ruby deposits. The first one ever recorded accidentally burned down its creator workshop.',
    stats: { attack: 12, defense: 5, speed: 14, magic: 10, hp: 35 },
  },
  {
    id: 'azure_scout',
    name: 'Azure Scout',
    description:
      'A swift sapphire guardian designed for reconnaissance missions. Its streamlined crystal body reflects and refracts light to create distracting illusions while its core senses vibrations through solid rock.',
    species: 'sapphire_guardian',
    rarity: 'common',
    crystalPower: 14,
    summonCost: 9,
    abilities: ['Sonar Ping', 'Crystal Dash'],
    lore: 'Azure Scouts were originally created as messengers between underground kingdoms. Their speed records remain unbroken after three thousand years.',
    stats: { attack: 7, defense: 8, speed: 22, magic: 8, hp: 30 },
  },
  {
    id: 'jade_serpent',
    name: 'Jade Serpent',
    description:
      'A small emerald wyrm that burrows through soft earth and clay with its crystalline fangs. It is more curious than dangerous, often tunneling into places it should not and bringing back treasures it finds.',
    species: 'emerald_wyrm',
    rarity: 'common',
    crystalPower: 13,
    summonCost: 9,
    abilities: ['Burrow', 'Stone Sense'],
    lore: 'Jade Serpents are the pets of choice for underground cartographers. They have an uncanny ability to find hidden passages.',
    stats: { attack: 9, defense: 6, speed: 18, magic: 7, hp: 32 },
  },
  {
    id: 'static_pup',
    name: 'Static Pup',
    description:
      'A playful topaz beast cub crackling with static electricity. It zaps anything that startles it and has a habit of charging at shadows. Despite its shocks, it is fiercely loyal and follows its summoner everywhere.',
    species: 'topaz_beast',
    rarity: 'common',
    crystalPower: 15,
    summonCost: 10,
    abilities: ['Static Shock', 'Quick Spark'],
    lore: 'Static Pups are born during electrical storms underground. Miners say the best time to find one is when your hair stands on end.',
    stats: { attack: 11, defense: 4, speed: 20, magic: 9, hp: 28 },
  },
  {
    id: 'glass_shard',
    name: 'Glass Shard',
    description:
      'A fragment of a diamond titan that gained independent consciousness after being shattered in battle. It is small, sharp, and surprisingly fierce, fighting with a determination that belies its diminutive size.',
    species: 'diamond_titan',
    rarity: 'common',
    crystalPower: 17,
    summonCost: 12,
    abilities: ['Refract Light', 'Sharp Edge'],
    lore: 'Every Glass Shard carries a piece of a fallen titan. Some scholars believe that if enough shards were gathered together, the titan could be reborn.',
    stats: { attack: 13, defense: 7, speed: 16, magic: 6, hp: 38 },
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'granite_paladin',
    name: 'Granite Paladin',
    description:
      'A quartz golem clad in crystalline granite armor that gleams like polished marble. It wields a massive shield of fused quartz crystals and stands immovable against any force, its determination as unyielding as the stone that forms it.',
    species: 'quartz_golem',
    rarity: 'uncommon',
    crystalPower: 32,
    summonCost: 45,
    abilities: ['Crystal Shield Wall', 'Resonance Slam', 'Earth Anchor'],
    lore: 'The Granite Paladin was once a simple wall that guarded a mining village. After a thousand years of watching and waiting, it decided to take matters into its own hands.',
    stats: { attack: 18, defense: 28, speed: 8, magic: 14, hp: 120 },
  },
  {
    id: 'psychic_echo',
    name: 'Psychic Echo',
    description:
      'An amethyst wisp that has absorbed the memories and emotions of every creature that has passed through its crypt. It uses this accumulated psychic energy to project powerful illusions and read the surface thoughts of any nearby being.',
    species: 'amethyst_wisp',
    rarity: 'uncommon',
    crystalPower: 30,
    summonCost: 42,
    abilities: ['Telepathic Link', 'Memory Drain', 'Phantom Voices'],
    lore: 'The Psychic Echo remembers everything that has ever happened within its domain. The weight of these memories has made it both wise and deeply melancholic.',
    stats: { attack: 10, defense: 14, speed: 24, magic: 36, hp: 65 },
  },
  {
    id: 'magma_cryst',
    name: 'Magma Cryst',
    description:
      'A ruby elemental formed from cooling magma around a ruby core. Rivers of liquid fire flow through transparent crystal veins in its body, and its touch ignites even the most fire-resistant materials.',
    species: 'ruby_elemental',
    rarity: 'uncommon',
    crystalPower: 35,
    summonCost: 50,
    abilities: ['Magma Flow', 'Volcanic Eruption', 'Crimson Radiance'],
    lore: 'Magma Crysts are the janitors of the volcanic underworld. They consume excess lava to prevent catastrophic eruptions, recycling the heat into stored energy.',
    stats: { attack: 30, defense: 16, speed: 14, magic: 22, hp: 95 },
  },
  {
    id: 'frost_sentinel',
    name: 'Frost Sentinel',
    description:
      'A sapphire guardian that generates intense cold from its crystalline body. Moisture freezes instantly in its presence, and it can create walls of ice and pathways of frozen crystal across any surface.',
    species: 'sapphire_guardian',
    rarity: 'uncommon',
    crystalPower: 31,
    summonCost: 44,
    abilities: ['Ice Shield', 'Frozen Lance', 'Glacial Step'],
    lore: 'Frost Sentinels keep the deepest chambers cool enough for rare ice crystals to form. Without them, the underground would become an unbearable sauna.',
    stats: { attack: 22, defense: 22, speed: 12, magic: 24, hp: 110 },
  },
  {
    id: 'vine_crystal',
    name: 'Vine Crystal',
    description:
      'An emerald wyrm that has fused with underground root systems. Crystalline vines extend from its emerald scales, allowing it to manipulate the cave flora and entangle enemies in living green chains.',
    species: 'emerald_wyrm',
    rarity: 'uncommon',
    crystalPower: 28,
    summonCost: 40,
    abilities: ['Vine Lash', 'Root Bind', 'Crystal Bloom'],
    lore: 'The Vine Crystal is considered a sacred protector of underground gardens. Wherever it tunnels, rare crystal flowers bloom in its wake.',
    stats: { attack: 24, defense: 18, speed: 20, magic: 18, hp: 85 },
  },
  {
    id: 'thunder_fang',
    name: 'Thunder Fang',
    description:
      'A topaz beast with razor-sharp crystalline teeth that crackle with electricity. It hunts by sensing the electromagnetic fields of other creatures and strikes with lightning-fast precision from the shadows.',
    species: 'topaz_beast',
    rarity: 'uncommon',
    crystalPower: 33,
    summonCost: 46,
    abilities: ['Lightning Fang', 'Thunder Roar', 'Chain Spark'],
    lore: 'Thunder Fangs are the apex predators of the upper caverns. Even ruby elementals give them a wide berth, as water conducts their electricity.',
    stats: { attack: 28, defense: 12, speed: 30, magic: 16, hp: 75 },
  },
  {
    id: 'prism_knight',
    name: 'Prism Knight',
    description:
      'A diamond titan fragment that has reassembled itself into a knight-like form. Its body acts as a perfect prism, splitting light into its component colors and using each wavelength as a different weapon.',
    species: 'diamond_titan',
    rarity: 'uncommon',
    crystalPower: 34,
    summonCost: 48,
    abilities: ['Prism Blade', 'Rainbow Shield', 'Beam Splitter'],
    lore: 'The Prism Knight wanders the underground kingdom seeking the other fragments of its original titan. It fights with the combined fury of seven colors.',
    stats: { attack: 26, defense: 24, speed: 16, magic: 20, hp: 100 },
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'quartz_colossus',
    name: 'Quartz Colossus',
    description:
      'A towering quartz golem that stands thirty feet tall, its body a perfect crystal lattice that vibrates with harmonic resonance. Each step it takes sends tremors through the earth, and its voice is the sound of mountains grinding together.',
    species: 'quartz_golem',
    rarity: 'rare',
    crystalPower: 60,
    summonCost: 200,
    abilities: ['Seismic Slam', 'Harmonic Resonance', 'Quartz Fortress', 'Echo Chamber'],
    lore: 'The Quartz Colossus was built to hold up the ceiling of the Grand Cavern. It has been standing in the same spot for six thousand years and has never complained once.',
    stats: { attack: 45, defense: 55, speed: 6, magic: 30, hp: 300 },
  },
  {
    id: 'amethyst_sovereign',
    name: 'Amethyst Sovereign',
    description:
      'The ruler of all amethyst wisps within a crypt network. Its psychic power is so vast that it can project its consciousness into multiple locations simultaneously, controlling lesser wisps like extensions of its own will.',
    species: 'amethyst_wisp',
    rarity: 'rare',
    crystalPower: 62,
    summonCost: 220,
    abilities: ['Psychic Dominion', 'Wisp Command', 'Mind Palace', 'Astral Projection'],
    lore: 'The Amethyst Sovereign does not have a body in the traditional sense. It exists simultaneously in every amethyst cluster within its domain, a distributed consciousness of violet light.',
    stats: { attack: 20, defense: 30, speed: 40, magic: 70, hp: 180 },
  },
  {
    id: 'ruby_inferno',
    name: 'Ruby Inferno',
    description:
      'A ruby elemental that has absorbed so much thermal energy it has become a walking volcano. Rivers of magma flow through transparent ruby channels in its body, and the air around it shimmers with heat distortion.',
    species: 'ruby_elemental',
    rarity: 'rare',
    crystalPower: 65,
    summonCost: 230,
    abilities: ['Inferno Wave', 'Volcanic Core', 'Magma Armor', 'Crimson Supernova'],
    lore: 'The Ruby Inferno was created during the Great Underground Eruption when a ruby deposit was exposed to magma flow for a hundred consecutive years.',
    stats: { attack: 60, defense: 35, speed: 18, magic: 50, hp: 250 },
  },
  {
    id: 'sapphire_warden',
    name: 'Sapphire Warden',
    description:
      'The supreme guardian of the deepest crypt chambers. Its sapphire body is completely transparent, making it nearly invisible in the crystal-lit depths. It protects the most sacred relics and secrets of the underground kingdom.',
    species: 'sapphire_guardian',
    rarity: 'rare',
    crystalPower: 58,
    summonCost: 190,
    abilities: ['Invisibility', 'Absolute Guard', 'Ice Prison', 'Sapphire Dome'],
    lore: 'The Sapphire Warden has never been defeated in combat. This is partly due to its immense power and partly because no one can find it to fight it.',
    stats: { attack: 35, defense: 60, speed: 28, magic: 45, hp: 280 },
  },
  {
    id: 'emerald_leviathan',
    name: 'Emerald Leviathan',
    description:
      'A colossal emerald wyrm that has tunneled through every layer of the underground kingdom. Its body is over a hundred feet long, and its crystalline scales are so tough that diamond tools barely scratch them.',
    species: 'emerald_wyrm',
    rarity: 'rare',
    crystalPower: 64,
    summonCost: 225,
    abilities: ['Earthquake Burrow', 'Crystal Fangs', 'Verdant Shield', 'Tunnel Network'],
    lore: 'The Emerald Leviathan created the maze of tunnels that connects all eight crypt locations. It did this over the course of a single century, which for a wyrm is practically a weekend project.',
    stats: { attack: 55, defense: 40, speed: 50, magic: 35, hp: 350 },
  },
  {
    id: 'topaz_storm',
    name: 'Topaz Storm',
    description:
      'A topaz beast that has merged with the underground electrical grid. Lightning arcs continuously between its topaz spikes, creating a zone of electrified death around it that extends thirty feet in all directions.',
    species: 'topaz_beast',
    rarity: 'rare',
    crystalPower: 63,
    summonCost: 215,
    abilities: ['Lightning Field', 'Storm Charge', 'Thunder Cascade', 'Electric Cage'],
    lore: 'The Topaz Storm is responsible for powering the entire underground kingdom lighting system. When it sleeps, the lights dim. When it dreams, they flicker.',
    stats: { attack: 52, defense: 25, speed: 60, magic: 40, hp: 200 },
  },
  {
    id: 'diamond_golem',
    name: 'Diamond Golem',
    description:
      'A fully reassembled diamond titan standing eight feet tall in perfect humanoid form. Every facet of its body has been precision-cut to maximize light refraction, creating a dazzling display that blinds enemies and empowers allies.',
    species: 'diamond_titan',
    rarity: 'rare',
    crystalPower: 66,
    summonCost: 240,
    abilities: ['Diamond Fist', 'Light Array', 'Refraction Armor', 'Brilliant Radiance'],
    lore: 'The Diamond Golem took three thousand years to fully reassemble from its scattered fragments. Each piece had to be found, polished, and fitted with impossible precision.',
    stats: { attack: 48, defense: 65, speed: 20, magic: 42, hp: 320 },
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'crystal_mountains',
    name: 'Crystal Mountains',
    description:
      'A quartz golem of such immense size it is mistaken for a geological feature. Its body is literally part of the cavern wall, and it can reshape the entire underground topology by simply shifting its position.',
    species: 'quartz_golem',
    rarity: 'epic',
    crystalPower: 105,
    summonCost: 800,
    abilities: ['Tectonic Shift', 'Crystal Growth', 'Mountain Form', 'Continental Crush', 'Harmonic Immortality'],
    lore: 'The Crystal Mountains has been asleep for so long that three civilizations have risen and fallen on its shoulders without it noticing.',
    stats: { attack: 75, defense: 90, speed: 4, magic: 55, hp: 600 },
  },
  {
    id: 'void_amethyst',
    name: 'Void Amethyst',
    description:
      'An amethyst wisp that has gazed into the void between dimensions and returned changed. Its psychic power extends into other planes of existence, and it can pull knowledge and energy from realities that should not exist.',
    species: 'amethyst_wisp',
    rarity: 'epic',
    crystalPower: 110,
    summonCost: 850,
    abilities: ['Void Gaze', 'Dimensional Mind', 'Psychic Storm', 'Reality Warp', 'Eternal Consciousness'],
    lore: 'The Void Amethyst knows things that drive lesser beings mad. It has learned to compartmentalize this knowledge into smaller, more manageable insanities.',
    stats: { attack: 30, defense: 50, speed: 70, magic: 120, hp: 400 },
  },
  {
    id: 'solar_ruby',
    name: 'Solar Ruby',
    description:
      'A ruby elemental that has captured and contained a miniature star within its ruby core. The nuclear fusion inside it generates heat and light equivalent to a small sun, and its power is literally astronomical in scale.',
    species: 'ruby_elemental',
    rarity: 'epic',
    crystalPower: 108,
    summonCost: 820,
    abilities: ['Solar Flare', 'Nova Burst', 'Star Core', 'Plasma Streams', 'Eternal Combustion'],
    lore: 'The Solar Ruby once fell from the sky as a meteorite. It burned through three miles of solid rock before coming to rest in the Ruby Forge, where it has remained ever since.',
    stats: { attack: 95, defense: 55, speed: 35, magic: 85, hp: 450 },
  },
  {
    id: 'abyssal_sapphire',
    name: 'Abyssal Sapphire',
    description:
      'A sapphire guardian that has descended into the deepest, most pressure-filled depths of the underground ocean. Its body has been compressed to diamond density, making it virtually indestructible, and it radiates an aura of absolute calm.',
    species: 'sapphire_guardian',
    rarity: 'epic',
    crystalPower: 102,
    summonCost: 780,
    abilities: ['Pressure Dome', 'Abyssal Depth', 'Absolute Zero', 'Crystal Ocean', 'Timeless Guard'],
    lore: 'The Abyssal Sapphire has not moved in five hundred years. It does not need to. Everything that approaches it simply loses the will to fight.',
    stats: { attack: 40, defense: 100, speed: 10, magic: 80, hp: 700 },
  },
  {
    id: 'world_root_emerald',
    name: 'World Root Emerald',
    description:
      'An emerald wyrm that has connected its root system to the world tree beneath the surface. It draws power from every living plant on the planet and can command underground forests to grow at will.',
    species: 'emerald_wyrm',
    rarity: 'epic',
    crystalPower: 106,
    summonCost: 810,
    abilities: ['World Roots', 'Forest Awakening', 'Crystal Bloom Dome', 'Nature Wrath', 'Eternal Growth'],
    lore: 'The World Root Emerald is responsible for all underground plant life. Without it, the cavern ecosystem would collapse within days, and the surface would soon follow.',
    stats: { attack: 65, defense: 70, speed: 55, magic: 90, hp: 550 },
  },
  {
    id: 'sky_topaz',
    name: 'Sky Topaz',
    description:
      'A topaz beast that has somehow connected to the ionosphere above ground. Lightning from the surface travels down crystal conductors to fuel its power, and it can call down electrical storms from clear skies miles above.',
    species: 'topaz_beast',
    rarity: 'epic',
    crystalPower: 112,
    summonCost: 880,
    abilities: ['Sky Strike', 'Ion Cannon', 'Lightning Network', 'Thunder God Form', 'Storm Eternal'],
    lore: 'The Sky Topaz is the only crystal creature with a direct connection to the surface world. It serves as a living lightning rod, protecting the underground from electrical surges.',
    stats: { attack: 100, defense: 40, speed: 80, magic: 75, hp: 380 },
  },
  {
    id: 'eternal_diamond',
    name: 'Eternal Diamond',
    description:
      'A diamond titan that has achieved true immortality through perfect crystal resonance. Its body cannot be scratched, chipped, or damaged by any known force, and it radiates a light that heals all crystal beings in its presence.',
    species: 'diamond_titan',
    rarity: 'epic',
    crystalPower: 115,
    summonCost: 900,
    abilities: ['Eternal Light', 'Diamond Barrier', 'Purification Wave', 'Crystal Resurrection', 'Radiant Immortal'],
    lore: 'The Eternal Diamond has existed since before the underground kingdom was founded. It will exist long after the last crystal has crumbled to dust.',
    stats: { attack: 70, defense: 95, speed: 25, magic: 95, hp: 650 },
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'primordial_quartz',
    name: 'Primordial Quartz',
    description:
      'The original crystal from which all other quartz golems descend. It predates the formation of the underground kingdom itself and contains the primordial pattern of crystalline life encoded within its lattice structure.',
    species: 'quartz_golem',
    rarity: 'legendary',
    crystalPower: 160,
    summonCost: 3000,
    abilities: ['Genesis Crystal', 'Lattice Rewrite', 'Earth Memory', 'Crystal Genesis', 'Primordial Form', 'Foundation of All'],
    lore: 'Before there were crystals, there was the Primordial Quartz. Before there was stone, there was the idea of stone. The Primordial Quartz is that idea made real.',
    stats: { attack: 110, defense: 130, speed: 12, magic: 100, hp: 1200 },
  },
  {
    id: 'dream_amethyst',
    name: 'Dream Amethyst',
    description:
      'An amethyst wisp that exists simultaneously in every dream ever dreamed by every creature in the underground kingdom. It can reshape reality by altering dreams, turning nightmares into fortresses and pleasant dreams into healing springs.',
    species: 'amethyst_wisp',
    rarity: 'legendary',
    crystalPower: 165,
    summonCost: 3200,
    abilities: ['Dream Weave', 'Nightmare Army', 'Lucid Reality', 'Collective Unconscious', 'Dream Devourer', 'Eternal Slumber'],
    lore: 'You have met the Dream Amethyst before. Every time you wake from a dream feeling strangely refreshed, it has been watching over you.',
    stats: { attack: 60, defense: 80, speed: 120, magic: 180, hp: 800 },
  },
  {
    id: 'star_ruby',
    name: 'Star Ruby',
    description:
      'A ruby elemental that contains the compressed energy of a dying star. When it unleashes its power, the underground kingdom experiences a second dawn as light and heat flood through every tunnel and chamber simultaneously.',
    species: 'ruby_elemental',
    rarity: 'legendary',
    crystalPower: 170,
    summonCost: 3500,
    abilities: ['Stellar Core', 'Supernova', 'Star Fall', 'Gravity Crush', 'Solar Winds', 'Dawn Eternal'],
    lore: 'The Star Ruby fell from space and burrowed through the planet crust. It was aiming for the core but got distracted by the beautiful crystal formations along the way.',
    stats: { attack: 160, defense: 90, speed: 40, magic: 140, hp: 1000 },
  },
  {
    id: 'deep_sapphire',
    name: 'The Deep Sapphire',
    description:
      'A sapphire guardian from the absolute bottom of the underground ocean, where pressure is so immense that reality itself begins to warp. It carries the weight of miles of water and stone upon its shoulders without effort.',
    species: 'sapphire_guardian',
    rarity: 'legendary',
    crystalPower: 158,
    summonCost: 2900,
    abilities: ['Abyssal Pressure', 'World Weight', 'Frozen Eternity', 'Depth Infinite', 'Guardian Absolute', 'Still Waters'],
    lore: 'The Deep Sapphire has never seen the surface. It has never needed to. Everything worth protecting is already down here.',
    stats: { attack: 80, defense: 160, speed: 15, magic: 130, hp: 1500 },
  },
  {
    id: 'world_tree_emerald',
    name: 'World Tree Emerald',
    description:
      'An emerald wyrm so vast that it has become the support structure of the underground kingdom itself. Its crystalline body forms the pillars and arches of the grandest caverns, and its root system extends to every corner of the subterranean world.',
    species: 'emerald_wyrm',
    rarity: 'legendary',
    crystalPower: 162,
    summonCost: 3100,
    abilities: ['World Tree Root', 'Crystal Canopy', 'Eternal Spring', 'Green Cathedral', 'Nature Apex', 'Living Kingdom'],
    lore: 'If the World Tree Emerald ever decided to leave, the entire underground kingdom would collapse. Fortunately, it seems quite comfortable where it is.',
    stats: { attack: 120, defense: 120, speed: 70, magic: 150, hp: 1400 },
  },
  {
    id: 'cosmic_topaz',
    name: 'Cosmic Topaz',
    description:
      'A topaz beast that has touched the cosmic electrical web connecting all charged particles in the universe. It can channel the electrical energy of entire planets and discharge it in a single devastating bolt.',
    species: 'topaz_beast',
    rarity: 'legendary',
    crystalPower: 168,
    summonCost: 3300,
    abilities: ['Cosmic Lightning', 'Planetary Charge', 'Electromagnetic God', 'Storm of Ages', 'Thunder Reality', 'Infinite Spark'],
    lore: 'The Cosmic Topaz is responsible for the aurora borealis. It does this as a hobby. Its main job is keeping the universe electrical grid from overloading.',
    stats: { attack: 150, defense: 70, speed: 150, magic: 120, hp: 900 },
  },
  {
    id: 'crown_diamond',
    name: 'The Crown Diamond',
    description:
      'The ultimate diamond titan, a being of pure crystalline perfection that serves as the living crown of the Crystal Overlord. Its light purifies all corruption, heals all wounds, and illuminates even the darkest depths of the void.',
    species: 'diamond_titan',
    rarity: 'legendary',
    crystalPower: 175,
    summonCost: 4000,
    abilities: ['Crown Radiance', 'Diamond Throne', 'Absolute Purification', 'Light Eternal', 'Crystal Divinity', 'The Final Facet'],
    lore: 'The Crown Diamond is the last crystal that will ever need to be created. When all other crystals have crumbled, its light will remain, a single perfect point of brilliance in the infinite dark.',
    stats: { attack: 130, defense: 150, speed: 30, magic: 170, hp: 2000 },
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: CC_CRYPTS — 8 Crypt Locations
// ═══════════════════════════════════════════════════════════════════

export const CC_CRYPTS: readonly CCCryptDef[] = [
  {
    id: 'quartz_hollow',
    name: 'Quartz Hollow',
    description:
      'A vast open chamber filled with towering quartz pillars that stretch from floor to ceiling. The pillars glow with soft white light, creating a cathedral-like atmosphere. Mineral-rich water drips from stalactites, slowly building new crystal formations over centuries.',
    minLevel: 1,
    unlockCost: 0,
    bonuses: ['+5% crystal resonance', 'Basic golem summoning', 'Material gathering'],
    element: 'mineral',
  },
  {
    id: 'amethyst_sanctum',
    name: 'Amethyst Sanctum',
    description:
      'A sacred chamber where the largest amethyst clusters in the underground kingdom grow. The air here hums with psychic energy, and visitors often report hearing whispered voices carrying fragments of ancient knowledge. Amethyst wisps congregate here in great numbers.',
    minLevel: 5,
    unlockCost: 200,
    bonuses: ['+10% psychic power', 'Wisp summoning bonus', 'Rare gem discovery'],
    element: 'psychic',
  },
  {
    id: 'ruby_forge',
    name: 'Ruby Forge',
    description:
      'A volcanic chamber where intense heat and pressure naturally forge rubies from carbon deposits. Rivers of lava illuminate enormous ruby crystals embedded in the walls, and the air shimmers with thermal distortion. Ruby elementals consider this their home.',
    minLevel: 10,
    unlockCost: 500,
    bonuses: ['+15% fire crystal damage', 'Artifact crafting', 'Epic material refining'],
    element: 'fire',
  },
  {
    id: 'sapphire_depths',
    name: 'Sapphire Depths',
    description:
      'An underground ocean of crystal-clear water lit from below by massive sapphire deposits on the sea floor. The water is ice-cold and perfectly still, reflecting the sapphire light like a mirror. Sapphire guardians patrol these depths for threats.',
    minLevel: 15,
    unlockCost: 1200,
    bonuses: ['+20% defense bonus', 'Guardian training', 'Structure upgrades available'],
    element: 'water',
  },
  {
    id: 'emerald_cavern',
    name: 'Emerald Cavern',
    description:
      'A lush underground garden where emerald crystals grow among bioluminescent plants and fungi. The cavern is alive with the sound of flowing water and the gentle movement of crystal leaves in underground breezes created by thermal convection.',
    minLevel: 20,
    unlockCost: 2500,
    bonuses: ['+15% excavation yield', 'Nature attunement', 'Crystal growth acceleration'],
    element: 'nature',
  },
  {
    id: 'topaz_chamber',
    name: 'Topaz Chamber',
    description:
      'A cylindrical chamber lined with topaz crystals that act as natural lightning conductors. Constant electrical discharges create a spectacular light show and charge the air with static electricity. Topaz beasts thrive in this electrifying environment.',
    minLevel: 28,
    unlockCost: 5000,
    bonuses: ['+20% lightning power', 'Storm channeling', 'Energy storage capacity'],
    element: 'lightning',
  },
  {
    id: 'diamond_throne',
    name: 'Diamond Throne',
    description:
      'The heart of the underground kingdom, a magnificent chamber where the largest diamond ever discovered serves as a natural throne. Pure white light radiates from the diamond in all directions, purifying everything it touches and healing all crystal beings within range.',
    minLevel: 36,
    unlockCost: 10000,
    bonuses: ['+30% radiant power', 'All crystal bonuses doubled', 'Legendary summoning unlocked'],
    element: 'radiant',
  },
  {
    id: 'prism_nexus',
    name: 'Prism Nexus',
    description:
      'A convergence point where all seven crystal elements meet and merge. The chamber contains a natural prism formation that splits light into the seven crystal colors, each beam connecting to a different crypt location and powering the entire underground network.',
    minLevel: 44,
    unlockCost: 20000,
    bonuses: ['+50% all crystal power', 'Cross-element fusion', 'Ultimate artifact access'],
    element: 'radiant',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: CC_MATERIALS — 30 Crystal/Gem Materials
// ═══════════════════════════════════════════════════════════════════

export const CC_MATERIALS: readonly CCMaterialDef[] = [
  { id: 'quartz_shard', name: 'Quartz Shard', description: 'A basic quartz fragment from cave walls.', rarity: 'common', source: 'Quartz Hollow', value: 5, category: 'crystal' },
  { id: 'rough_amethyst', name: 'Rough Amethyst', description: 'An uncut amethyst chunk with raw psychic energy.', rarity: 'common', source: 'Amethyst Sanctum', value: 8, category: 'crystal' },
  { id: 'raw_ruby', name: 'Raw Ruby', description: 'An unrefined ruby radiating intense heat.', rarity: 'common', source: 'Ruby Forge', value: 10, category: 'gem' },
  { id: 'sapphire_pebble', name: 'Sapphire Pebble', description: 'A smooth sapphire stone from the underground riverbed.', rarity: 'common', source: 'Sapphire Depths', value: 7, category: 'gem' },
  { id: 'emerald_chip', name: 'Emerald Chip', description: 'A small emerald fragment with faint green glow.', rarity: 'common', source: 'Emerald Cavern', value: 6, category: 'crystal' },
  { id: 'topaz_dust', name: 'Topaz Dust', description: 'Fine topaz powder crackling with static.', rarity: 'common', source: 'Topaz Chamber', value: 4, category: 'shard' },
  { id: 'cave_calcite', name: 'Cave Calcite', description: 'A crystalline mineral formation from cavern walls.', rarity: 'common', source: 'Quartz Hollow', value: 3, category: 'mineral' },
  { id: 'crystal_salt', name: 'Crystal Salt', description: 'Salt crystals with purification properties.', rarity: 'common', source: 'Sapphire Depths', value: 4, category: 'mineral' },
  { id: 'amethyst_cluster', name: 'Amethyst Cluster', description: 'A cluster of perfectly formed amethyst crystals.', rarity: 'uncommon', source: 'Amethyst Sanctum', value: 25, category: 'crystal' },
  { id: 'ruby_gem', name: 'Ruby Gem', description: 'A cut and polished ruby of exceptional clarity.', rarity: 'uncommon', source: 'Ruby Forge', value: 30, category: 'gem' },
  { id: 'sapphire_gem', name: 'Sapphire Gem', description: 'A deep blue sapphire with oceanic depths.', rarity: 'uncommon', source: 'Sapphire Depths', value: 28, category: 'gem' },
  { id: 'emerald_gem', name: 'Emerald Gem', description: 'A vivid green emerald with healing aura.', rarity: 'uncommon', source: 'Emerald Cavern', value: 32, category: 'gem' },
  { id: 'topaz_gem', name: 'Topaz Gem', description: 'A golden topaz storing electrical charge.', rarity: 'uncommon', source: 'Topaz Chamber', value: 26, category: 'gem' },
  { id: 'prism_fragments', name: 'Prism Fragments', description: 'Fragments from the great underground prism.', rarity: 'uncommon', source: 'Prism Nexus', value: 35, category: 'shard' },
  { id: 'cave_pearl', name: 'Cave Pearl', description: 'A luminous pearl from underground mollusks.', rarity: 'uncommon', source: 'Sapphire Depths', value: 22, category: 'gem' },
  { id: 'phantom_quartz', name: 'Phantom Quartz', description: 'Quartz with ghostly inclusions that move inside.', rarity: 'uncommon', source: 'Quartz Hollow', value: 20, category: 'crystal' },
  { id: 'fire_opal', name: 'Fire Opal', description: 'An opal that seems to contain living flames.', rarity: 'rare', source: 'Ruby Forge', value: 80, category: 'gem' },
  { id: 'moonstone', name: 'Moonstone', description: 'A stone that stores and releases lunar energy.', rarity: 'rare', source: 'Sapphire Depths', value: 75, category: 'gem' },
  { id: 'star_sapphire', name: 'Star Sapphire', description: 'A sapphire with a perfect six-rayed star within.', rarity: 'rare', source: 'Diamond Throne', value: 90, category: 'gem' },
  { id: 'alexandrite', name: 'Alexandrite', description: 'A color-shifting gem that changes with light.', rarity: 'rare', source: 'Emerald Cavern', value: 85, category: 'gem' },
  { id: 'black_opal', name: 'Black Opal', description: 'A dark opal containing a spectrum of colors.', rarity: 'rare', source: 'Amethyst Sanctum', value: 88, category: 'gem' },
  { id: 'void_crystal', name: 'Void Crystal', description: 'A crystal that absorbs all surrounding light.', rarity: 'rare', source: 'Prism Nexus', value: 95, category: 'crystal' },
  { id: 'crystal_heart', name: 'Crystal Heart', description: 'A crystallized core from an ancient golem.', rarity: 'epic', source: 'Diamond Throne', value: 200, category: 'essence' },
  { id: 'soul_gem', name: 'Soul Gem', description: 'Contains the essence of a crystal spirit.', rarity: 'epic', source: 'Amethyst Sanctum', value: 220, category: 'essence' },
  { id: 'time_crystal', name: 'Time Crystal', description: 'A crystal that pulses with temporal energy.', rarity: 'epic', source: 'Prism Nexus', value: 250, category: 'essence' },
  { id: 'dream_shard', name: 'Dream Shard', description: 'A fragment of solidified dream energy.', rarity: 'epic', source: 'Amethyst Sanctum', value: 230, category: 'shard' },
  { id: 'eternal_flame_crystal', name: 'Eternal Flame Crystal', description: 'A ruby crystal with an unquenchable inner fire.', rarity: 'epic', source: 'Ruby Forge', value: 210, category: 'essence' },
  { id: 'primordial_shard', name: 'Primordial Shard', description: 'A fragment of the first crystal ever created.', rarity: 'legendary', source: 'Prism Nexus', value: 500, category: 'shard' },
  { id: 'crown_diamond', name: 'Crown Diamond Fragment', description: 'A piece of the legendary Crown Diamond itself.', rarity: 'legendary', source: 'Diamond Throne', value: 600, category: 'gem' },
  { id: 'world_tree_sap', name: 'World Tree Sap', description: 'Crystallized sap from the underground World Tree.', rarity: 'legendary', source: 'Emerald Cavern', value: 550, category: 'essence' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: CC_STRUCTURES — 25 Crypt Structures
// ═══════════════════════════════════════════════════════════════════

export const CC_STRUCTURES: readonly CCStructureDef[] = [
  // Excavation (5)
  { id: 'crystal_wall', name: 'Crystal Wall', description: 'Reinforced crystal barrier for defense.', baseCost: 100, costMultiplier: 1.5, maxLevel: 10, category: 'excavation' },
  { id: 'mining_shaft', name: 'Mining Shaft', description: 'Deep shaft for material extraction.', baseCost: 150, costMultiplier: 1.6, maxLevel: 10, category: 'excavation' },
  { id: 'ore_crusher', name: 'Ore Crusher', description: 'Crushes raw materials into usable shards.', baseCost: 200, costMultiplier: 1.7, maxLevel: 8, category: 'excavation' },
  { id: 'drill_station', name: 'Drill Station', description: 'Automated drilling platform for deep excavation.', baseCost: 300, costMultiplier: 1.8, maxLevel: 6, category: 'excavation' },
  { id: 'tunnel_bore', name: 'Tunnel Bore', description: 'Massive machine that carves new passages.', baseCost: 500, costMultiplier: 2.0, maxLevel: 5, category: 'excavation' },
  // Production (5)
  { id: 'gem_altar', name: 'Gem Altar', description: 'Sacred altar for gem refinement rituals.', baseCost: 120, costMultiplier: 1.5, maxLevel: 10, category: 'production' },
  { id: 'crystal_forge', name: 'Crystal Forge', description: 'Forge that shapes raw crystals into tools.', baseCost: 180, costMultiplier: 1.6, maxLevel: 10, category: 'production' },
  { id: 'prism_tower', name: 'Prism Tower', description: 'Tower that focuses light into energy beams.', baseCost: 250, costMultiplier: 1.7, maxLevel: 8, category: 'production' },
  { id: 'resonance_chamber', name: 'Resonance Chamber', description: 'Amplifies crystal harmonic frequencies.', baseCost: 350, costMultiplier: 1.8, maxLevel: 6, category: 'production' },
  { id: 'fusion_reactor', name: 'Fusion Reactor', description: 'Fuses crystal elements into new compounds.', baseCost: 600, costMultiplier: 2.0, maxLevel: 5, category: 'production' },
  // Defense (5)
  { id: 'guardian_pedestal', name: 'Guardian Pedestal', description: 'Pedestal that empowers stationed golems.', baseCost: 130, costMultiplier: 1.5, maxLevel: 10, category: 'defense' },
  { id: 'crystal_turret', name: 'Crystal Turret', description: 'Automated turret firing crystal shards.', baseCost: 200, costMultiplier: 1.6, maxLevel: 10, category: 'defense' },
  { id: 'barrier_field', name: 'Barrier Field', description: 'Energy barrier protecting an area.', baseCost: 280, costMultiplier: 1.7, maxLevel: 8, category: 'defense' },
  { id: 'trap_matrix', name: 'Trap Matrix', description: 'Network of crystal-based traps.', baseCost: 400, costMultiplier: 1.8, maxLevel: 6, category: 'defense' },
  { id: 'fortress_core', name: 'Fortress Core', description: 'Central defense hub controlling all defenses.', baseCost: 700, costMultiplier: 2.0, maxLevel: 5, category: 'defense' },
  // Enchantment (5)
  { id: 'enchanting_table', name: 'Enchanting Table', description: 'Table for imbuing crystals with magical properties.', baseCost: 140, costMultiplier: 1.5, maxLevel: 10, category: 'enchantment' },
  { id: 'rune_circle', name: 'Rune Circle', description: 'Circle inscribed with crystal-enhancing runes.', baseCost: 220, costMultiplier: 1.6, maxLevel: 10, category: 'enchantment' },
  { id: 'scrying_pool', name: 'Scrying Pool', description: 'Pool that reveals hidden crystal deposits.', baseCost: 300, costMultiplier: 1.7, maxLevel: 8, category: 'enchantment' },
  { id: 'mana_crucible', name: 'Mana Crucible', description: 'Converts raw energy into magical crystal essence.', baseCost: 450, costMultiplier: 1.8, maxLevel: 6, category: 'enchantment' },
  { id: 'divine_anvil', name: 'Divine Anvil', description: 'Anvil for forging legendary crystal equipment.', baseCost: 800, costMultiplier: 2.0, maxLevel: 5, category: 'enchantment' },
  // Storage (5)
  { id: 'crystal_vault', name: 'Crystal Vault', description: 'Secure vault for storing precious materials.', baseCost: 110, costMultiplier: 1.4, maxLevel: 10, category: 'storage' },
  { id: 'gem_repository', name: 'Gem Repository', description: 'Climate-controlled storage for rare gems.', baseCost: 160, costMultiplier: 1.5, maxLevel: 10, category: 'storage' },
  { id: 'artifact_case', name: 'Artifact Display Case', description: 'Showcase for legendary artifacts.', baseCost: 280, costMultiplier: 1.6, maxLevel: 8, category: 'storage' },
  { id: 'essence_vessel', name: 'Essence Vessel', description: 'Container that preserves magical essences.', baseCost: 350, costMultiplier: 1.7, maxLevel: 6, category: 'storage' },
  { id: 'void_storage', name: 'Void Storage', description: 'Storage pocket in a pocket dimension.', baseCost: 600, costMultiplier: 2.0, maxLevel: 5, category: 'storage' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: CC_ABILITIES — 22 Crystal Abilities
// ═══════════════════════════════════════════════════════════════════

export const CC_ABILITIES: readonly CCAbilityDef[] = [
  // Mineral abilities (3)
  { id: 'prism_beam', name: 'Prism Beam', description: 'Fires a concentrated beam of refracted crystal light.', cooldown: 3, power: 25, element: 'mineral', gemCost: 10 },
  { id: 'crystal_shield', name: 'Crystal Shield', description: 'Creates a protective barrier from compacted crystals.', cooldown: 5, power: 20, element: 'mineral', gemCost: 15 },
  { id: 'earth_shatter', name: 'Earth Shatter', description: 'Sends seismic waves through crystalline ground.', cooldown: 7, power: 40, element: 'mineral', gemCost: 25 },
  // Psychic abilities (3)
  { id: 'gem_resonance', name: 'Gem Resonance', description: 'Harmonizes with all nearby crystals for a power boost.', cooldown: 6, power: 30, element: 'psychic', gemCost: 20 },
  { id: 'mind_crystal', name: 'Mind Crystal', description: 'Projects psychic energy through a focused crystal lens.', cooldown: 4, power: 28, element: 'psychic', gemCost: 15 },
  { id: 'telekinetic_shard', name: 'Telekinetic Shard', description: 'Hurls crystal shards with psychic force.', cooldown: 3, power: 22, element: 'psychic', gemCost: 10 },
  // Fire abilities (3)
  { id: 'ruby_lance', name: 'Ruby Lance', description: 'A lance of concentrated ruby fire energy.', cooldown: 4, power: 35, element: 'fire', gemCost: 20 },
  { id: 'magma_eruption', name: 'Magma Eruption', description: 'Causes a localized volcanic eruption.', cooldown: 8, power: 50, element: 'fire', gemCost: 30 },
  { id: 'inferno_crystal', name: 'Inferno Crystal', description: 'Ignites all crystals in range simultaneously.', cooldown: 10, power: 60, element: 'fire', gemCost: 40 },
  // Water abilities (3)
  { id: 'frost_crystal', name: 'Frost Crystal', description: 'Fires a shard of absolute zero crystal ice.', cooldown: 4, power: 30, element: 'water', gemCost: 18 },
  { id: 'tidal_wave_crystal', name: 'Tidal Wave Crystal', description: 'Summons a wave of crystal-infused water.', cooldown: 7, power: 45, element: 'water', gemCost: 28 },
  { id: 'ice_prison', name: 'Ice Prison', description: 'Encases a target in unbreakable crystal ice.', cooldown: 9, power: 35, element: 'water', gemCost: 22 },
  // Nature abilities (3)
  { id: 'crystal_vine', name: 'Crystal Vine', description: 'Summons vines of living crystal to entangle.', cooldown: 5, power: 28, element: 'nature', gemCost: 16 },
  { id: 'emerald_heal', name: 'Emerald Heal', description: 'Channels emerald energy to heal crystal beings.', cooldown: 6, power: 25, element: 'nature', gemCost: 20 },
  { id: 'root_network', name: 'Root Network', description: 'Connects to underground root system for awareness.', cooldown: 8, power: 32, element: 'nature', gemCost: 24 },
  // Lightning abilities (3)
  { id: 'thunder_crystal', name: 'Thunder Crystal', description: 'Discharges a bolt of crystal lightning.', cooldown: 3, power: 32, element: 'lightning', gemCost: 15 },
  { id: 'static_field', name: 'Static Field', description: 'Creates a field that slows and damages enemies.', cooldown: 7, power: 40, element: 'lightning', gemCost: 25 },
  { id: 'chain_lightning_crystal', name: 'Chain Lightning Crystal', description: 'Lightning that arcs between multiple crystal targets.', cooldown: 6, power: 38, element: 'lightning', gemCost: 22 },
  // Radiant abilities (4)
  { id: 'radiant_beam', name: 'Radiant Beam', description: 'A beam of pure radiant crystal energy.', cooldown: 5, power: 45, element: 'radiant', gemCost: 30 },
  { id: 'purification_wave', name: 'Purification Wave', description: 'Wave of light that purifies corruption.', cooldown: 8, power: 35, element: 'radiant', gemCost: 25 },
  { id: 'diamond_harden', name: 'Diamond Harden', description: 'Temporarily transforms body to diamond hardness.', cooldown: 10, power: 50, element: 'radiant', gemCost: 35 },
  { id: 'crystalline_storm', name: 'Crystalline Storm', description: 'Summons a devastating storm of crystal shards.', cooldown: 12, power: 70, element: 'radiant', gemCost: 50 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: CC_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const CC_ACHIEVEMENTS: readonly CCAchievementDef[] = [
  { id: 'ach_first_summon', name: 'First Summon', description: 'Summon your first crystal golem.', condition: 'summonFirst', reward: '100 gold', icon: '💎' },
  { id: 'ach_golem_collector', name: 'Golem Collector', description: 'Summon 5 different crystal golems.', condition: 'summonCount(5)', reward: '300 gold', icon: '🏗️' },
  { id: 'ach_crystal_army', name: 'Crystal Army', description: 'Have 15 active golems simultaneously.', condition: 'activeGolems(15)', reward: '600 gold', icon: '⚔️' },
  { id: 'ach_full_spectrum', name: 'Full Spectrum', description: 'Own golems from all 7 species.', condition: 'allSpecies', reward: '800 gold', icon: '🌈' },
  { id: 'ach_crypt_explorer', name: 'Crypt Explorer', description: 'Claim all 8 crypt locations.', condition: 'allCrypts', reward: '1500 gold', icon: '🗺️' },
  { id: 'ach_structure_architect', name: 'Structure Architect', description: 'Build all 25 structure types.', condition: 'allStructures', reward: '2000 gold', icon: '🏛️' },
  { id: 'ach_master_builder', name: 'Master Builder', description: 'Upgrade a structure to max level.', condition: 'maxStructure', reward: '500 gold', icon: '🔨' },
  { id: 'ach_material_hoarder', name: 'Material Hoarder', description: 'Collect 1000 materials total.', condition: 'materialTotal(1000)', reward: '400 gold', icon: '📦' },
  { id: 'ach_ability_master', name: 'Ability Master', description: 'Unlock all 22 crystal abilities.', condition: 'allAbilities', reward: '1200 gold', icon: '✨' },
  { id: 'ach_prism_specialist', name: 'Prism Specialist', description: 'Perform 100 prism strikes.', condition: 'prismStrikes(100)', reward: '700 gold', icon: '🔮' },
  { id: 'ach_relic_activator', name: 'Relic Activator', description: 'Activate 10 different artifacts.', condition: 'relicActivations(10)', reward: '900 gold', icon: '🌟' },
  { id: 'ach_legendary_forge', name: 'Legendary Forge', description: 'Forge a legendary-tier artifact.', condition: 'legendaryArtifact', reward: '2000 gold', icon: '👑' },
  { id: 'ach_epic_collection', name: 'Epic Collection', description: 'Own 10 epic or legendary golems.', condition: 'epicPlusCount(10)', reward: '1500 gold', icon: '🏆' },
  { id: 'ach_power_level', name: 'Power Level', description: 'Reach crypt level 50.', condition: 'maxLevel', reward: '5000 gold', icon: '🌟' },
  { id: 'ach_crystal_overlord', name: 'Crystal Overlord', description: 'Earn the Crystal Overlord title.', condition: 'topTitle', reward: '10000 gold', icon: '👑' },
  { id: 'ach_event_survivor', name: 'Event Survivor', description: 'Survive 20 crypt events.', condition: 'eventsSurvived(20)', reward: '1000 gold', icon: '🌪️' },
  { id: 'ach_title_collector', name: 'Title Collector', description: 'Unlock all 8 progression titles.', condition: 'allTitles', reward: '3000 gold', icon: '🏅' },
  { id: 'ach_diamond_purity', name: 'Diamond Purity', description: 'Own all legendary golems.', condition: 'allLegendary', reward: '10000 gold', icon: '💠' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: CC_TITLES — 8 Titles (Gem Novice → Crystal Overlord)
// ═══════════════════════════════════════════════════════════════════

export const CC_TITLES: readonly CCTitleDef[] = [
  { id: 'title_gem_novice', name: 'Gem Novice', description: 'A beginner who has just discovered the crystal crypts.', requiredLevel: 1, requiredCrypts: 0 },
  { id: 'title_crystal_apprentice', name: 'Crystal Apprentice', description: 'Learning the fundamentals of crystal manipulation.', requiredLevel: 5, requiredCrypts: 1 },
  { id: 'title_gem_cutter', name: 'Gem Cutter', description: 'Skilled at cutting and shaping precious crystals.', requiredLevel: 12, requiredCrypts: 2 },
  { id: 'title_crypt_explorer', name: 'Crypt Explorer', description: 'Has ventured into the deeper chambers of the underground.', requiredLevel: 20, requiredCrypts: 4 },
  { id: 'title_crystal_scholar', name: 'Crystal Scholar', description: 'A master of crystal lore and gemstone properties.', requiredLevel: 28, requiredCrypts: 5 },
  { id: 'title_gem_lord', name: 'Gem Lord', description: 'Commands respect throughout the underground kingdom.', requiredLevel: 36, requiredCrypts: 6 },
  { id: 'title_crystal_sovereign', name: 'Crystal Sovereign', description: 'Rules over vast underground crystal domains.', requiredLevel: 44, requiredCrypts: 7 },
  { id: 'title_crystal_overlord', name: 'Crystal Overlord', description: 'Supreme ruler of all crystal crypts and golems.', requiredLevel: 50, requiredCrypts: 8 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: CC_ARTIFACTS — 15 Legendary Artifacts
// ═══════════════════════════════════════════════════════════════════

export const CC_ARTIFACTS: readonly CCArtifactDef[] = [
  { id: 'amethyst_crown', name: 'Amethyst Crown', description: 'A crown woven from living amethyst crystals that grants psychic dominion over lesser wisps.', rarity: 'rare', powerBonus: 30, specialAbility: 'Psychic Command', forgeCost: 200 },
  { id: 'ruby_blaze_sword', name: 'Ruby Blaze Sword', description: 'A blade forged from a single perfect ruby, forever burning with inner fire.', rarity: 'rare', powerBonus: 35, specialAbility: 'Eternal Flame Strike', forgeCost: 250 },
  { id: 'sapphire_aegis', name: 'Sapphire Aegis', description: 'An impenetrable shield of sapphire crystal that absorbs all damage.', rarity: 'rare', powerBonus: 32, specialAbility: 'Absolute Defense', forgeCost: 220 },
  { id: 'emerald_life_staff', name: 'Emerald Life Staff', description: 'A staff that channels the life force of the underground world tree.', rarity: 'rare', powerBonus: 28, specialAbility: 'Nature Rejuvenation', forgeCost: 180 },
  { id: 'topaz_storm_ring', name: 'Topaz Storm Ring', description: 'A ring that generates perpetual lightning storms around the wearer.', rarity: 'rare', powerBonus: 33, specialAbility: 'Storm Aura', forgeCost: 210 },
  { id: 'diamond_pendant', name: 'Diamond Pendant', description: 'A pendant containing a flawless diamond that radiates pure light.', rarity: 'epic', powerBonus: 50, specialAbility: 'Radiant Purification', forgeCost: 600 },
  { id: 'void_crystal_orb', name: 'Void Crystal Orb', description: 'An orb of void crystal that shows glimpses of alternate realities.', rarity: 'epic', powerBonus: 55, specialAbility: 'Dimension Sight', forgeCost: 700 },
  { id: 'prism_of_seven', name: 'Prism of Seven', description: 'The original prism that splits light into the seven crystal elements.', rarity: 'epic', powerBonus: 60, specialAbility: 'Elemental Split', forgeCost: 800 },
  { id: 'crystal_heart_amulet', name: 'Crystal Heart Amulet', description: 'Contains the crystallized heart of an ancient golem, granting immense vitality.', rarity: 'epic', powerBonus: 65, specialAbility: 'Undying Crystal', forgeCost: 750 },
  { id: 'time_crystal_sandglass', name: 'Time Crystal Sandglass', description: 'An hourglass filled with time crystal sand that can slow or accelerate time.', rarity: 'epic', powerBonus: 70, specialAbility: 'Temporal Manipulation', forgeCost: 900 },
  { id: 'crown_of_diamonds', name: 'Crown of Diamonds', description: 'The ancient crown of the Crystal Overlord, set with seven legendary diamonds.', rarity: 'legendary', powerBonus: 100, specialAbility: 'Overlord Command', forgeCost: 3000 },
  { id: 'world_root_scepter', name: 'World Root Scepter', description: 'Carved from a root of the underground World Tree, it controls all plant life.', rarity: 'legendary', powerBonus: 110, specialAbility: 'World Root Dominion', forgeCost: 3500 },
  { id: 'star_fall_hammer', name: 'Star Fall Hammer', description: 'A hammer forged from meteorite crystal that can shatter mountains with a single blow.', rarity: 'legendary', powerBonus: 120, specialAbility: 'Meteor Strike', forgeCost: 4000 },
  { id: 'eternal_flame_chalice', name: 'Eternal Flame Chalice', description: 'A chalice containing fire from the first ruby ever created, never extinguishing.', rarity: 'legendary', powerBonus: 105, specialAbility: 'Genesis Flame', forgeCost: 3200 },
  { id: 'primordial_lens', name: 'Primordial Lens', description: 'The first lens ever created, capable of revealing the true nature of all crystals.', rarity: 'legendary', powerBonus: 130, specialAbility: 'True Crystal Sight', forgeCost: 5000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: CC_EVENTS — 12 Crypt Events
// ═══════════════════════════════════════════════════════════════════

export const CC_EVENTS: readonly CCEventDef[] = [
  { id: 'evt_crystal_surge', name: 'Crystal Surge', description: 'A massive surge of crystal energy causes spontaneous crystal growth throughout the crypts.', severity: 1, duration: 300, effects: ['+25% material yield', 'Random crystal spawns'], element: 'mineral' },
  { id: 'evt_psychic_storm', name: 'Psychic Storm', description: 'Amethyst wisps go into overdrive, creating a psychic disturbance that affects all crystal beings.', severity: 2, duration: 240, effects: ['+30% psychic ability power', 'Golem confusion chance'], element: 'psychic' },
  { id: 'evt_volcanic_eruption', name: 'Volcanic Eruption', description: 'The Ruby Forge experiences increased volcanic activity, flooding nearby chambers with lava.', severity: 3, duration: 360, effects: ['+50% fire crystal spawns', 'Damage to non-fire golems'], element: 'fire' },
  { id: 'evt_underground_flood', name: 'Underground Flood', description: 'The underground ocean overflows, flooding lower chambers with crystal-clear water.', severity: 2, duration: 300, effects: ['+40% water materials', 'Movement speed penalty'], element: 'water' },
  { id: 'evt_crystal_bloom', name: 'Crystal Bloom', description: 'Rare underground flowers bloom simultaneously, filling the caverns with bioluminescent light.', severity: 1, duration: 240, effects: ['+20% nature crystal growth', 'Healing aura in caverns'], element: 'nature' },
  { id: 'evt_lightning_cascade', name: 'Lightning Cascade', description: 'Electrical storms cascade through the upper caverns, overcharging all topaz formations.', severity: 3, duration: 180, effects: ['+60% lightning power', 'Structure damage risk'], element: 'lightning' },
  { id: 'evt_radiant_dawn', name: 'Radiant Dawn', description: 'The Diamond Throne emits an unprecedented burst of radiant light that illuminates all crypts.', severity: 1, duration: 120, effects: ['+30% all crystal power', 'Corruption purged'], element: 'radiant' },
  { id: 'evt_void_incursion', name: 'Void Incursion', description: 'The boundaries between dimensions thin, allowing void energy to seep into the crypts.', severity: 4, duration: 480, effects: ['-20% defense', 'Rare void materials appear'], element: 'mineral' },
  { id: 'evt_gem_resonance', name: 'Gem Resonance', description: 'All gems in the underground kingdom begin resonating at the same frequency, amplifying their power.', severity: 1, duration: 360, effects: ['+40% gem material quality', 'Ability cooldowns halved'], element: 'psychic' },
  { id: 'evt_earthquake', name: 'Great Earthquake', description: 'A massive earthquake shakes the underground kingdom, revealing new passages and deposits.', severity: 3, duration: 120, effects: ['New crypt areas revealed', 'Structure damage', 'Material bonus'], element: 'mineral' },
  { id: 'evt_crystal_plague', name: 'Crystal Plague', description: 'A mysterious affliction causes crystal formations to weaken and crumble.', severity: 4, duration: 600, effects: ['-30% crystal power', 'Golem HP reduced', 'Rare cure materials spawn'], element: 'nature' },
  { id: 'evt_prism_convergence', name: 'Prism Convergence', description: 'All seven crystal elements align at the Prism Nexus, creating unprecedented fusion opportunities.', severity: 2, duration: 180, effects: ['Cross-element fusion available', 'All bonuses doubled'], element: 'radiant' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: SPECIES BONUSES
// ═══════════════════════════════════════════════════════════════════

const CC_SPECIES_BONUSES: Record<CCSpecies, { attack: number; defense: number; speed: number; magic: number; hp: number }> = {
  quartz_golem: { attack: 5, defense: 10, speed: -2, magic: 3, hp: 15 },
  amethyst_wisp: { attack: 2, defense: 3, speed: 8, magic: 12, hp: -5 },
  ruby_elemental: { attack: 10, defense: 2, speed: 3, magic: 6, hp: 5 },
  sapphire_guardian: { attack: 3, defense: 12, speed: 2, magic: 8, hp: 10 },
  emerald_wyrm: { attack: 6, defense: 5, speed: 7, magic: 5, hp: 8 },
  topaz_beast: { attack: 8, defense: -2, speed: 10, magic: 4, hp: -3 },
  diamond_titan: { attack: 6, defense: 8, speed: -1, magic: 10, hp: 12 },
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

const initialCCState: CCStoreState = {
  ccLevel: 1,
  ccCrystalPower: CC_INITIAL_CRYSTAL_POWER,
  ccGemEnergy: 0,
  ccBoundGolems: [],
  ccClaimedCrypts: ['quartz_hollow'],
  ccCollectedMaterials: {},
  ccStructures: [],
  ccUnlockedAbilities: [],
  ccAchievements: [],
  ccActiveTitle: 'title_gem_novice',
  ccForgedArtifacts: [],
  ccTotalGolemsSummoned: 0,
  ccTotalCryptsExplored: 0,
  ccTotalStructuresUpgraded: 0,
  ccTotalArtifactsForged: 0,
  ccTotalCrystalPowerEarned: 0,
  ccActiveEventId: null,
  ccEventTimer: 0,
  ccGold: CC_INITIAL_GOLD,
  ccCrystalShards: CC_INITIAL_CRYSTAL_SHARDS,
  ccActiveCryptId: 'quartz_hollow',
  ccStats: {
    totalPrismStrikes: 0,
    totalRelicActivations: 0,
    totalCryptClaims: 0,
    totalStructureBuilds: 0,
    highestGolemLevel: 1,
    rarestGolem: 'common',
  },
  ccInventory: {},
  ccTitle: 'title_gem_novice',
}

export const useCrystalCryptStore = create<CCFullStore>()(
  persist(
    (set, get) => ({
      ...initialCCState,

      ccSummonGolem: (golemId: string): boolean => {
        const state = get()
        const golemDef = CC_GOLEMS.find(d => d.id === golemId)
        if (!golemDef) return false
        const cost = Math.floor(golemDef.summonCost * ccRarityMultiplier(golemDef.rarity))
        if (state.ccCrystalPower < cost) return false

        const newGolem: CCBoundGolem = {
          id: ccGenerateId(),
          golemDefId: golemId,
          name: golemDef.name,
          level: 1,
          currentHP: golemDef.stats.hp,
          maxHP: golemDef.stats.hp,
          power: ccGetGolemPower(golemDef, 1),
          boundAt: Date.now(),
          cryptsExplored: 0,
        }

        const speciesBonus = CC_SPECIES_BONUSES[golemDef.species]
        const crystalPowerGain = Math.floor(golemDef.crystalPower * ccRarityMultiplier(golemDef.rarity))

        set({
          ccBoundGolems: [...state.ccBoundGolems, newGolem],
          ccCrystalPower: state.ccCrystalPower - cost,
          ccGemEnergy: state.ccGemEnergy + Math.floor(crystalPowerGain * 0.3),
          ccTotalGolemsSummoned: state.ccTotalGolemsSummoned + 1,
          ccTotalCrystalPowerEarned: state.ccTotalCrystalPowerEarned + crystalPowerGain,
          ccStats: {
            ...state.ccStats,
            rarestGolem: ccRarityTierValue(golemDef.rarity) > ccRarityTierValue(state.ccStats.rarestGolem as CCRarity)
              ? golemDef.rarity
              : state.ccStats.rarestGolem,
          },
        })
        return true
      },

      ccCryptClaim: (cryptId: string): boolean => {
        const state = get()
        const cryptDef = CC_CRYPTS.find(c => c.id === cryptId)
        if (!cryptDef) return false
        if (state.ccClaimedCrypts.includes(cryptId)) return false
        if (state.ccLevel < cryptDef.minLevel) return false
        if (state.ccGold < cryptDef.unlockCost) return false

        const powerGain = cryptDef.minLevel * 10
        set({
          ccClaimedCrypts: [...state.ccClaimedCrypts, cryptId],
          ccGold: state.ccGold - cryptDef.unlockCost,
          ccCrystalPower: state.ccCrystalPower + powerGain,
          ccTotalCryptsExplored: state.ccTotalCryptsExplored + 1,
          ccTotalCrystalPowerEarned: state.ccTotalCrystalPowerEarned + powerGain,
          ccStats: {
            ...state.ccStats,
            totalCryptClaims: state.ccStats.totalCryptClaims + 1,
          },
        })
        return true
      },

      ccBuildStructure: (structureId: string): boolean => {
        const state = get()
        const structDef = CC_STRUCTURES.find(s => s.id === structureId)
        if (!structDef) return false

        const existing = state.ccStructures.find(s => s.structureDefId === structureId)
        const currentLevel = existing ? existing.level : 0
        if (currentLevel >= structDef.maxLevel) return false

        const cost = Math.floor(structDef.baseCost * Math.pow(structDef.costMultiplier, currentLevel))
        if (state.ccGold < cost) return false

        const updatedStructures = existing
          ? state.ccStructures.map(s =>
              s.structureDefId === structureId ? { ...s, level: s.level + 1 } : s
            )
          : [...state.ccStructures, { id: ccGenerateId(), structureDefId: structureId, level: 1, built: true }]

        const isUpgrade = existing !== undefined
        set({
          ccStructures: updatedStructures,
          ccGold: state.ccGold - cost,
          ccTotalStructuresUpgraded: state.ccTotalStructuresUpgraded + 1,
          ccStats: {
            ...state.ccStats,
            totalStructureBuilds: state.ccStats.totalStructureBuilds + 1,
          },
        })
        return true
      },

      ccPrismStrike: (targetId: string): boolean => {
        const state = get()
        const target = state.ccBoundGolems.find(g => g.id === targetId)
        if (!target) return false

        const golemDef = CC_GOLEMS.find(d => d.id === target.golemDefId)
        if (!golemDef) return false

        const damage = Math.floor(golemDef.stats.attack * 1.5 * (1 + target.level * 0.1))
        const newHP = Math.max(0, target.currentHP - damage)
        const powerGain = Math.floor(damage * 0.5)

        set({
          ccBoundGolems: state.ccBoundGolems.map(g =>
            g.id === targetId ? { ...g, currentHP: newHP } : g
          ),
          ccCrystalPower: state.ccCrystalPower + powerGain,
          ccGemEnergy: state.ccGemEnergy + Math.floor(powerGain * 0.2),
          ccTotalCrystalPowerEarned: state.ccTotalCrystalPowerEarned + powerGain,
          ccStats: {
            ...state.ccStats,
            totalPrismStrikes: state.ccStats.totalPrismStrikes + 1,
          },
        })
        return true
      },

      ccActivateRelic: (artifactId: string): boolean => {
        const state = get()
        const artifact = CC_ARTIFACTS.find(a => a.id === artifactId)
        if (!artifact) return false
        if (state.ccForgedArtifacts.includes(artifactId)) return false
        if (state.ccGold < artifact.forgeCost) return false

        set({
          ccForgedArtifacts: [...state.ccForgedArtifacts, artifactId],
          ccGold: state.ccGold - artifact.forgeCost,
          ccTotalArtifactsForged: state.ccTotalArtifactsForged + 1,
          ccTotalCrystalPowerEarned: state.ccTotalCrystalPowerEarned + artifact.powerBonus,
          ccStats: {
            ...state.ccStats,
            totalRelicActivations: state.ccStats.totalRelicActivations + 1,
          },
        })
        return true
      },

      resetCrystalCrypt: () => {
        set(initialCCState)
      },
    }),
    {
      name: 'crystal-crypt-wire',
    }
  )
)

function ccRarityTierValue(rarity: CCRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 3
    case 'epic': return 4
    case 'legendary': return 5
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: THE HOOK
// ═══════════════════════════════════════════════════════════════════

export default function useCrystalCrypt() {
  const store = useCrystalCryptStore()
  const stateRef = useRef(store)

  useEffect(() => {
    stateRef.current = store
  }, [store])

  // ── Auto-tick event timer ─────────────────────────────────────
  useEffect(() => {
    if (stateRef.current.ccActiveEventId === null) return
    if (stateRef.current.ccEventTimer <= 0) return
    const interval = setInterval(() => {
      const current = stateRef.current
      if (current.ccEventTimer > 0) {
        // Timer ticks are managed through the store
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [store.ccActiveEventId, store.ccEventTimer, store])

  // ── Getter: Level Progress ────────────────────────────────────
  const ccLevelProgress = useMemo(() => {
    const currentLevel = store.ccLevel
    if (currentLevel >= CC_MAX_LEVEL) return { progress: 1, xpForNext: 0, xpCurrent: 0 }
    const needed = ccXpForLevel(currentLevel)
    return {
      progress: store.ccCrystalPower / needed,
      xpForNext: needed,
      xpCurrent: store.ccCrystalPower,
    }
  }, [store])

  // ── Getter: Total Power ───────────────────────────────────────
  const ccTotalPower = useMemo(() => {
    const golemPower = store.ccBoundGolems.reduce((sum, g) => sum + g.power, 0)
    const artifactPower = store.ccForgedArtifacts.reduce((sum, aId) => {
      const artifact = CC_ARTIFACTS.find(a => a.id === aId)
      return sum + (artifact ? artifact.powerBonus : 0)
    }, 0)
    const structurePower = store.ccStructures.reduce((sum, s) => {
      return sum + ccGetStructureBonus(s.structureDefId, s.level)
    }, 0)
    return {
      golemPower,
      artifactPower,
      structurePower,
      totalPower: golemPower + artifactPower + structurePower,
    }
  }, [store])

  // ── Getter: Demon Count by Species ────────────────────────────
  const ccGetGolemCountBySpecies = useMemo(() => {
    return (Object.keys(CC_SPECIES_BONUSES) as CCSpecies[]).map(species => {
      const golems = store.ccBoundGolems.filter(d => {
        const def = CC_GOLEMS.find(dd => dd.id === d.golemDefId)
        return def && def.species === species
      })
      return {
        species,
        color: ccSpeciesColor(species),
        count: golems.length,
        totalPower: golems.reduce((s, d) => s + d.power, 0),
      }
    })
  }, [store])

  // ── Getter: Rarity Summary ───────────────────────────────────
  const ccGetRaritySummary = useMemo(() => {
    const summary = (['common', 'uncommon', 'rare', 'epic', 'legendary'] as CCRarity[]).map(rarity => {
      const golems = store.ccBoundGolems.filter(d => {
        const def = CC_GOLEMS.find(dd => dd.id === d.golemDefId)
        return def && def.rarity === rarity
      })
      return {
        rarity,
        color: ccRarityColor(rarity),
        count: golems.length,
        totalPower: golems.reduce((s, d) => s + d.power, 0),
      }
    })
    return summary
  }, [store])

  // ── Getter: Crypt Details ────────────────────────────────────
  const ccGetCryptDetails = useMemo(() => {
    return CC_CRYPTS.map(crypt => ({
      ...crypt,
      isClaimed: store.ccClaimedCrypts.includes(crypt.id),
      isActive: store.ccActiveCryptId === crypt.id,
      color: ccElementColor(crypt.element),
      canClaim: !store.ccClaimedCrypts.includes(crypt.id) &&
        store.ccLevel >= crypt.minLevel &&
        store.ccGold >= crypt.unlockCost,
    }))
  }, [store])

  // ── Getter: Material Inventory ───────────────────────────────
  const ccGetMaterialInventory = useMemo(() => {
    return CC_MATERIALS.map(mat => ({
      ...mat,
      color: ccRarityColor(mat.rarity),
      count: store.ccCollectedMaterials[mat.id] || 0,
      totalValue: (store.ccCollectedMaterials[mat.id] || 0) * mat.value,
    }))
  }, [store])

  // ── Getter: Structure List ───────────────────────────────────
  const ccGetStructureList = useMemo(() => {
    return CC_STRUCTURES.map(sDef => {
      const owned = store.ccStructures.find(s => s.structureDefId === sDef.id)
      const currentLevel = owned ? owned.level : 0
      const upgradeCost = Math.floor(sDef.baseCost * Math.pow(sDef.costMultiplier, currentLevel))
      return {
        ...sDef,
        currentLevel,
        isMaxed: currentLevel >= sDef.maxLevel,
        upgradeCost,
        isBuilt: !!owned,
        nextLevelBonus: ccGetStructureBonus(sDef.id, currentLevel + 1),
        currentBonus: ccGetStructureBonus(sDef.id, currentLevel),
      }
    })
  }, [store])

  // ── Getter: Active Event ─────────────────────────────────────
  const ccGetActiveEvent = useMemo(() => {
    if (!store.ccActiveEventId) return null
    const event = CC_EVENTS.find(e => e.id === store.ccActiveEventId)
    if (!event) return null
    return {
      ...event,
      color: ccElementColor(event.element),
      remaining: store.ccEventTimer,
      severityLabel: store.ccEventTimer > 0 ? 'Active' : 'Expired',
    }
  }, [store])

  // ── Getter: Achievement List ─────────────────────────────────
  const ccGetAchievementList = useMemo(() => {
    return CC_ACHIEVEMENTS.map(ach => ({
      ...ach,
      isUnlocked: store.ccAchievements.includes(ach.id),
    }))
  }, [store])

  // ── Getter: Title Progress ───────────────────────────────────
  const ccGetTitleProgress = useMemo(() => {
    return CC_TITLES.map(title => {
      const isActive = store.ccActiveTitle === title.id
      const levelMet = store.ccLevel >= title.requiredLevel
      const cryptsMet = store.ccClaimedCrypts.length >= title.requiredCrypts
      const canUnlock = levelMet && cryptsMet && !store.ccActiveTitle.includes(title.id)
      return {
        ...title,
        isActive,
        levelMet,
        cryptsMet,
        canUnlock,
        progress: Math.min(
          (store.ccLevel >= title.requiredLevel ? 0.5 : store.ccLevel / title.requiredLevel * 0.5) +
          (store.ccClaimedCrypts.length >= title.requiredCrypts ? 0.5 : store.ccClaimedCrypts.length / Math.max(title.requiredCrypts, 1) * 0.5),
          1
        ),
      }
    })
  }, [store])

  // ── Getter: Artifact List ────────────────────────────────────
  const ccGetArtifactList = useMemo(() => {
    return CC_ARTIFACTS.map(art => ({
      ...art,
      color: ccRarityColor(art.rarity),
      isForged: store.ccForgedArtifacts.includes(art.id),
      canForge: !store.ccForgedArtifacts.includes(art.id) && store.ccGold >= art.forgeCost,
    }))
  }, [store])

  // ── Getter: Bound Golems ─────────────────────────────────────
  const ccGetBoundGolems = useMemo(() => {
    return store.ccBoundGolems.map(bg => {
      const def = CC_GOLEMS.find(d => d.id === bg.golemDefId)
      if (!def) return { ...bg, def: null, speciesColor: '#888', rarityColor: '#888' }
      return {
        ...bg,
        def,
        speciesColor: ccSpeciesColor(def.species),
        rarityColor: ccRarityColor(def.rarity),
        speciesBonus: CC_SPECIES_BONUSES[def.species],
        levelUpCost: Math.floor(ccXpForLevel(bg.level + 1)),
      }
    })
  }, [store])

  // ── Getter: Ability List ─────────────────────────────────────
  const ccGetAbilityList = useMemo(() => {
    return CC_ABILITIES.map(ab => ({
      ...ab,
      color: ccElementColor(ab.element),
      isUnlocked: store.ccUnlockedAbilities.includes(ab.id),
    }))
  }, [store])

  // ── Getter: Summon Chances ───────────────────────────────────
  const ccGetSummonChances = useMemo(() => {
    return (['common', 'uncommon', 'rare', 'epic', 'legendary'] as CCRarity[]).map(rarity => {
      const baseChance = rarity === 'common' ? 50 : rarity === 'uncommon' ? 30 : rarity === 'rare' ? 14 : rarity === 'epic' ? 5 : 1
      const cryptBonus = store.ccClaimedCrypts.length * 2
      const adjustedChance = baseChance + (rarity !== 'common' ? cryptBonus : 0)
      return {
        rarity,
        color: ccRarityColor(rarity),
        chance: Math.min(adjustedChance, 100),
      }
    })
  }, [store])

  // ── Getter: Stats Summary ────────────────────────────────────
  const ccGetStatsSummary = useMemo(() => {
    return {
      totalPower: ccTotalPower.totalPower,
      totalGolems: store.ccBoundGolems.length,
      totalCrypts: store.ccClaimedCrypts.length,
      totalStructures: store.ccStructures.filter(s => s.built).length,
      totalArtifacts: store.ccForgedArtifacts.length,
      totalAbilities: store.ccUnlockedAbilities.length,
      totalAchievements: store.ccAchievements.length,
      totalCrystalPower: store.ccTotalCrystalPowerEarned,
      totalGold: store.ccGold,
      level: store.ccLevel,
    }
  }, [store, ccTotalPower])

  // ── Getter: Event List ───────────────────────────────────────
  const ccGetEventList = useMemo(() => {
    return CC_EVENTS.map(evt => ({
      ...evt,
      color: ccElementColor(evt.element),
      isActive: store.ccActiveEventId === evt.id,
      severityLabel: evt.severity <= 1 ? 'Minor' : evt.severity <= 2 ? 'Moderate' : evt.severity <= 3 ? 'Major' : 'Catastrophic',
    }))
  }, [store])

  // ── Getter: Next Title ───────────────────────────────────────
  const ccGetNextTitle = useMemo(() => {
    const currentIndex = CC_TITLES.findIndex(t => t.id === store.ccActiveTitle)
    if (currentIndex < CC_TITLES.length - 1) {
      return { ...CC_TITLES[currentIndex + 1], isCurrent: false }
    }
    return { ...CC_TITLES[CC_TITLES.length - 1], isCurrent: true }
  }, [store])

  // ── Getter: Crypt Power Breakdown ────────────────────────────
  const ccGetCryptPowerBreakdown = useMemo(() => {
    return CC_CRYPTS.map(crypt => {
      const cryptGolems = store.ccBoundGolems.filter(g => {
        const def = CC_GOLEMS.find(d => d.id === g.golemDefId)
        return def && def.species === CC_SPECIES.find(sp => sp.preferredCrypt === crypt.id)?.id
      })
      const cryptStructures = store.ccStructures.filter(s => {
        const sDef = CC_STRUCTURES.find(ss => ss.id === s.structureDefId)
        return sDef && sDef.category === 'defense'
      })
      return {
        ...crypt,
        color: ccElementColor(crypt.element),
        isClaimed: store.ccClaimedCrypts.includes(crypt.id),
        golemCount: cryptGolems.length,
        golemPower: cryptGolems.reduce((sum, g) => sum + g.power, 0),
        structureCount: cryptStructures.length,
        structurePower: cryptStructures.reduce((sum, s) => sum + ccGetStructureBonus(s.structureDefId, s.level), 0),
        totalCryptPower: cryptGolems.reduce((sum, g) => sum + g.power, 0) + cryptStructures.reduce((sum, s) => sum + ccGetStructureBonus(s.structureDefId, s.level), 0),
      }
    })
  }, [store])

  // ── Getter: Species Details ──────────────────────────────────
  const ccGetSpeciesDetails = useMemo(() => {
    return CC_SPECIES.map(species => {
      const golems = store.ccBoundGolems.filter(g => {
        const def = CC_GOLEMS.find(d => d.id === g.golemDefId)
        return def && def.species === species.id
      })
      const allSpeciesGolems = CC_GOLEMS.filter(g => g.species === species.id)
      return {
        ...species,
        ownedCount: golems.length,
        totalAvailable: allSpeciesGolems.length,
        ownedPower: golems.reduce((sum, g) => sum + g.power, 0),
        speciesGolems: allSpeciesGolems,
      }
    })
  }, [store])

  // ── Assemble ccAPI ────────────────────────────────────────────
  const ccAPI = {
    // Constants
    CC_SPECIES,
    CC_GOLEMS,
    CC_CRYPTS,
    CC_MATERIALS,
    CC_STRUCTURES,
    CC_ABILITIES,
    CC_ACHIEVEMENTS,
    CC_TITLES,
    CC_ARTIFACTS,
    CC_EVENTS,
    CC_COLOR_AMETHYST_PURPLE,
    CC_COLOR_CRYSTAL_WHITE,
    CC_COLOR_RUBY_RED,
    CC_COLOR_EMERALD_GREEN,
    CC_COLOR_SAPPHIRE_BLUE,
    CC_COLOR_TOPAZ_GOLD,
    CC_COLOR_DIAMOND_ICE,
    CC_COLOR_CRYPT_DARK,
    CC_COLOR_DEEP_SHADOW,
    CC_COLOR_GLOW_AMETHYST,
    CC_COLOR_GLOW_RUBY,
    CC_COLOR_GLOW_EMERALD,
    CC_COLOR_STONE_GRAY,
    CC_COLOR_CAVE_BROWN,
    CC_COLOR_LAVA_ORANGE,

    // State
    ccLevel: store.ccLevel,
    ccCrystalPower: store.ccCrystalPower,
    ccGemEnergy: store.ccGemEnergy,
    ccBoundGolems: store.ccBoundGolems,
    ccClaimedCrypts: store.ccClaimedCrypts,
    ccCollectedMaterials: store.ccCollectedMaterials,
    ccStructures: store.ccStructures,
    ccUnlockedAbilities: store.ccUnlockedAbilities,
    ccAchievements: store.ccAchievements,
    ccActiveTitle: store.ccActiveTitle,
    ccForgedArtifacts: store.ccForgedArtifacts,
    ccTotalGolemsSummoned: store.ccTotalGolemsSummoned,
    ccTotalCryptsExplored: store.ccTotalCryptsExplored,
    ccTotalStructuresUpgraded: store.ccTotalStructuresUpgraded,
    ccTotalArtifactsForged: store.ccTotalArtifactsForged,
    ccTotalCrystalPowerEarned: store.ccTotalCrystalPowerEarned,
    ccActiveEventId: store.ccActiveEventId,
    ccEventTimer: store.ccEventTimer,
    ccGold: store.ccGold,
    ccCrystalShards: store.ccCrystalShards,
    ccActiveCryptId: store.ccActiveCryptId,
    ccStats: store.ccStats,
    ccInventory: store.ccInventory,
    ccTitle: store.ccTitle,

    // Actions
    ccSummonGolem: store.ccSummonGolem,
    ccCryptClaim: store.ccCryptClaim,
    ccBuildStructure: store.ccBuildStructure,
    ccPrismStrike: store.ccPrismStrike,
    ccActivateRelic: store.ccActivateRelic,
    resetCrystalCrypt: store.resetCrystalCrypt,

    // Getters
    ccLevelProgress,
    ccTotalPower,
    ccGetGolemCountBySpecies,
    ccGetRaritySummary,
    ccGetCryptDetails,
    ccGetMaterialInventory,
    ccGetStructureList,
    ccGetActiveEvent,
    ccGetAchievementList,
    ccGetTitleProgress,
    ccGetArtifactList,
    ccGetBoundGolems,
    ccGetAbilityList,
    ccGetSummonChances,
    ccGetStatsSummary,
    ccGetEventList,
    ccGetNextTitle,
    ccGetCryptPowerBreakdown,
    ccGetSpeciesDetails,
  }

  return ccAPI
}

export type CrystalCryptAPI = ReturnType<typeof useCrystalCrypt>

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: ADDITIONAL UTILITY EXPORTS
// ═══════════════════════════════════════════════════════════════════

export function ccGetGolemById(id: string): CCGolemDef | undefined {
  return CC_GOLEMS.find(g => g.id === id)
}

export function ccGetCryptById(id: string): CCCryptDef | undefined {
  return CC_CRYPTS.find(c => c.id === id)
}

export function ccGetMaterialById(id: string): CCMaterialDef | undefined {
  return CC_MATERIALS.find(m => m.id === id)
}

export function ccGetStructureById(id: string): CCStructureDef | undefined {
  return CC_STRUCTURES.find(s => s.id === id)
}

export function ccGetAbilityById(id: string): CCAbilityDef | undefined {
  return CC_ABILITIES.find(a => a.id === id)
}

export function ccGetAchievementById(id: string): CCAchievementDef | undefined {
  return CC_ACHIEVEMENTS.find(a => a.id === id)
}

export function ccGetTitleById(id: string): CCTitleDef | undefined {
  return CC_TITLES.find(t => t.id === id)
}

export function ccGetArtifactById(id: string): CCArtifactDef | undefined {
  return CC_ARTIFACTS.find(a => a.id === id)
}

export function ccGetEventById(id: string): CCEventDef | undefined {
  return CC_EVENTS.find(e => e.id === id)
}

export function ccGetSpeciesById(id: string): CCSpeciesDef | undefined {
  return CC_SPECIES.find(s => s.id === id)
}

/** Get all golems filtered by species */
export function ccGetGolemsBySpecies(species: CCSpecies): CCGolemDef[] {
  return CC_GOLEMS.filter(g => g.species === species)
}

/** Get all golems filtered by rarity */
export function ccGetGolemsByRarity(rarity: CCRarity): CCGolemDef[] {
  return CC_GOLEMS.filter(g => g.rarity === rarity)
}

/** Get all materials filtered by category */
export function ccGetMaterialsByCategory(category: CCMaterialDef['category']): CCMaterialDef[] {
  return CC_MATERIALS.filter(m => m.category === category)
}

/** Get all structures filtered by category */
export function ccGetStructuresByCategory(category: CCStructureDef['category']): CCStructureDef[] {
  return CC_STRUCTURES.filter(s => s.category === category)
}

/** Get all abilities filtered by element */
export function ccGetAbilitiesByElement(element: CCElement): CCAbilityDef[] {
  return CC_ABILITIES.filter(a => a.element === element)
}

/** Get all artifacts filtered by rarity */
export function ccGetArtifactsByRarity(rarity: CCRarity): CCArtifactDef[] {
  return CC_ARTIFACTS.filter(a => a.rarity === rarity)
}

/** Calculate total stats for a golem at a given level including species bonuses */
export function ccCalculateGolemStats(golemDef: CCGolemDef, level: number): {
  attack: number
  defense: number
  speed: number
  magic: number
  hp: number
  totalPower: number
} {
  const speciesBonus = CC_SPECIES_BONUSES[golemDef.species]
  const levelMult = 1 + (level - 1) * 0.08
  const attack = Math.floor((golemDef.stats.attack + speciesBonus.attack) * levelMult)
  const defense = Math.floor((golemDef.stats.defense + speciesBonus.defense) * levelMult)
  const speed = Math.max(1, Math.floor((golemDef.stats.speed + speciesBonus.speed) * levelMult))
  const magic = Math.floor((golemDef.stats.magic + speciesBonus.magic) * levelMult)
  const hp = Math.floor((golemDef.stats.hp + speciesBonus.hp) * levelMult)
  const totalPower = attack + defense + speed + magic + Math.floor(hp / 5)
  return { attack, defense, speed, magic, hp, totalPower }
}

/** Calculate the gold cost to build or upgrade a structure */
export function ccCalculateStructureCost(structureDefId: string, currentLevel: number): number {
  const structDef = CC_STRUCTURES.find(s => s.id === structureDefId)
  if (!structDef) return 0
  return Math.floor(structDef.baseCost * Math.pow(structDef.costMultiplier, currentLevel))
}

/** Calculate the crystal power cost to summon a golem */
export function ccCalculateSummonCost(golemDefId: string): number {
  const golemDef = CC_GOLEMS.find(g => g.id === golemDefId)
  if (!golemDef) return 0
  return Math.floor(golemDef.summonCost * ccRarityMultiplier(golemDef.rarity))
}

/** Check if a crypt can be claimed based on current state */
export function ccCanClaimCrypt(
  cryptId: string,
  level: number,
  gold: number,
  claimedCrypts: string[]
): boolean {
  const cryptDef = CC_CRYPTS.find(c => c.id === cryptId)
  if (!cryptDef) return false
  if (claimedCrypts.includes(cryptId)) return false
  if (level < cryptDef.minLevel) return false
  if (gold < cryptDef.unlockCost) return false
  return true
}

/** Check if a golem can be summoned based on current state */
export function ccCanSummonGolem(
  golemDefId: string,
  crystalPower: number
): boolean {
  const golemDef = CC_GOLEMS.find(g => g.id === golemDefId)
  if (!golemDef) return false
  const cost = Math.floor(golemDef.summonCost * ccRarityMultiplier(golemDef.rarity))
  return crystalPower >= cost
}

/** Check if an artifact can be forged */
export function ccCanForgeArtifact(
  artifactId: string,
  gold: number,
  forgedArtifacts: string[]
): boolean {
  const artifact = CC_ARTIFACTS.find(a => a.id === artifactId)
  if (!artifact) return false
  if (forgedArtifacts.includes(artifactId)) return false
  return gold >= artifact.forgeCost
}

/** Get rarity tier order index for comparison */
export function ccRarityIndex(rarity: CCRarity): number {
  return ['common', 'uncommon', 'rare', 'epic', 'legendary'].indexOf(rarity)
}

/** Check if one rarity is higher than another */
export function ccIsRarerThan(a: CCRarity, b: CCRarity): boolean {
  return ccRarityIndex(a) > ccRarityIndex(b)
}

/** Sort golems by power descending */
export function ccSortGolemsByPower(golems: CCGolemDef[]): CCGolemDef[] {
  return [...golems].sort((a, b) => {
    const powerDiff = b.crystalPower - a.crystalPower
    if (powerDiff !== 0) return powerDiff
    return ccRarityIndex(b.rarity) - ccRarityIndex(a.rarity)
  })
}

/** Sort materials by value descending */
export function ccSortMaterialsByValue(materials: CCMaterialDef[]): CCMaterialDef[] {
  return [...materials].sort((a, b) => b.value - a.value)
}

/** Sort artifacts by power bonus descending */
export function ccSortArtifactsByPower(artifacts: CCArtifactDef[]): CCArtifactDef[] {
  return [...artifacts].sort((a, b) => b.powerBonus - a.powerBonus)
}

/** Get the recommended crypt for a given golem species */
export function ccGetRecommendedCrypt(species: CCSpecies): CCCryptDef | undefined {
  const speciesDef = CC_SPECIES.find(s => s.id === species)
  if (!speciesDef) return undefined
  return CC_CRYPTS.find(c => c.id === speciesDef.preferredCrypt)
}

/** Get total material count from an inventory record */
export function ccGetTotalMaterialCount(inventory: Record<string, number>): number {
  let total = 0
  const keys = Object.keys(inventory)
  for (let i = 0; i < keys.length; i++) {
    total += inventory[keys[i]] || 0
  }
  return total
}

/** Get total inventory value from an inventory record */
export function ccGetTotalInventoryValue(inventory: Record<string, number>): number {
  let total = 0
  const keys = Object.keys(inventory)
  for (let i = 0; i < keys.length; i++) {
    const mat = CC_MATERIALS.find(m => m.id === keys[i])
    if (mat) {
      total += (inventory[keys[i]] || 0) * mat.value
    }
  }
  return total
}

/** Format crystal power number with commas */
export function ccFormatCrystalPower(power: number): string {
  return power.toLocaleString()
}

/** Format gold with appropriate suffix */
export function ccFormatGold(gold: number): string {
  if (gold >= 1000000) return `${(gold / 1000000).toFixed(1)}M`
  if (gold >= 1000) return `${(gold / 1000).toFixed(1)}K`
  return gold.toString()
}

/** Get element display name */
export function ccGetElementName(element: CCElement): string {
  const names: Record<CCElement, string> = {
    mineral: 'Mineral',
    psychic: 'Psychic',
    fire: 'Fire',
    water: 'Water',
    nature: 'Nature',
    lightning: 'Lightning',
    radiant: 'Radiant',
  }
  return names[element] || element
}

/** Get species display name */
export function ccGetSpeciesName(species: CCSpecies): string {
  const def = CC_SPECIES.find(s => s.id === species)
  return def ? def.name : species
}

/** Get rarity display name */
export function ccGetRarityName(rarity: CCRarity): string {
  const names: Record<CCRarity, string> = {
    common: 'Common',
    uncommon: 'Uncommon',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
  }
  return names[rarity] || rarity
}

/** Get structure category display name */
export function ccGetStructureCategoryName(category: CCStructureDef['category']): string {
  const names: Record<CCStructureDef['category'], string> = {
    excavation: 'Excavation',
    production: 'Production',
    defense: 'Defense',
    enchantment: 'Enchantment',
    storage: 'Storage',
  }
  return names[category] || category
}

/** Get material category display name */
export function ccGetMaterialCategoryName(category: CCMaterialDef['category']): string {
  const names: Record<CCMaterialDef['category'], string> = {
    crystal: 'Crystal',
    gem: 'Gem',
    mineral: 'Mineral',
    shard: 'Shard',
    essence: 'Essence',
  }
  return names[category] || category
}

/** Validate if a golem ID exists in the definitions */
export function ccIsValidGolemId(id: string): boolean {
  return CC_GOLEMS.some(g => g.id === id)
}

/** Validate if a crypt ID exists in the definitions */
export function ccIsValidCryptId(id: string): boolean {
  return CC_CRYPTS.some(c => c.id === id)
}

/** Validate if a structure ID exists in the definitions */
export function ccIsValidStructureId(id: string): boolean {
  return CC_STRUCTURES.some(s => s.id === id)
}

/** Validate if an ability ID exists in the definitions */
export function ccIsValidAbilityId(id: string): boolean {
  return CC_ABILITIES.some(a => a.id === id)
}

/** Validate if an artifact ID exists in the definitions */
export function ccIsValidArtifactId(id: string): boolean {
  return CC_ARTIFACTS.some(a => a.id === id)
}

/** Validate if a material ID exists in the definitions */
export function ccIsValidMaterialId(id: string): boolean {
  return CC_MATERIALS.some(m => m.id === id)
}

/** Validate if a species is valid */
export function ccIsValidSpecies(id: string): id is CCSpecies {
  return (CC_SPECIES as readonly { id: string }[]).some(s => s.id === id)
}

/** Validate if a rarity is valid */
export function ccIsValidRarity(rarity: string): rarity is CCRarity {
  return ['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(rarity)
}

/** Validate if an element is valid */
export function ccIsValidElement(element: string): element is CCElement {
  return ['mineral', 'psychic', 'fire', 'water', 'nature', 'lightning', 'radiant'].includes(element)
}

/** Get the total number of golem definitions */
export const CC_TOTAL_GOLEM_DEFS = CC_GOLEMS.length

/** Get the total number of crypt definitions */
export const CC_TOTAL_CRYPT_DEFS = CC_CRYPTS.length

/** Get the total number of material definitions */
export const CC_TOTAL_MATERIAL_DEFS = CC_MATERIALS.length

/** Get the total number of structure definitions */
export const CC_TOTAL_STRUCTURE_DEFS = CC_STRUCTURES.length

/** Get the total number of ability definitions */
export const CC_TOTAL_ABILITY_DEFS = CC_ABILITIES.length

/** Get the total number of achievement definitions */
export const CC_TOTAL_ACHIEVEMENT_DEFS = CC_ACHIEVEMENTS.length

/** Get the total number of title definitions */
export const CC_TOTAL_TITLE_DEFS = CC_TITLES.length

/** Get the total number of artifact definitions */
export const CC_TOTAL_ARTIFACT_DEFS = CC_ARTIFACTS.length

/** Get the total number of event definitions */
export const CC_TOTAL_EVENT_DEFS = CC_EVENTS.length

/** Get the total number of species definitions */
export const CC_TOTAL_SPECIES_DEFS = CC_SPECIES.length

/** All rarity tiers in order */
export const CC_RARITY_ORDER: readonly CCRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

/** All species IDs */
export const CC_ALL_SPECIES: readonly CCSpecies[] = [
  'quartz_golem',
  'amethyst_wisp',
  'ruby_elemental',
  'sapphire_guardian',
  'emerald_wyrm',
  'topaz_beast',
  'diamond_titan',
]

/** All elements */
export const CC_ALL_ELEMENTS: readonly CCElement[] = [
  'mineral',
  'psychic',
  'fire',
  'water',
  'nature',
  'lightning',
  'radiant',
]

/** Map of rarity to its color */
export const CC_RARITY_COLORS: Record<CCRarity, string> = {
  common: '#9CA3AF',
  uncommon: '#34D399',
  rare: '#60A5FA',
  epic: '#A78BFA',
  legendary: '#FBBF24',
}

/** Map of species to its color */
export const CC_SPECIES_COLORS: Record<CCSpecies, string> = {
  quartz_golem: CC_COLOR_CRYSTAL_WHITE,
  amethyst_wisp: CC_COLOR_AMETHYST_PURPLE,
  ruby_elemental: CC_COLOR_RUBY_RED,
  sapphire_guardian: CC_COLOR_SAPPHIRE_BLUE,
  emerald_wyrm: CC_COLOR_EMERALD_GREEN,
  topaz_beast: CC_COLOR_TOPAZ_GOLD,
  diamond_titan: CC_COLOR_DIAMOND_ICE,
}

/** Map of element to its color */
export const CC_ELEMENT_COLORS: Record<CCElement, string> = {
  mineral: CC_COLOR_STONE_GRAY,
  psychic: CC_COLOR_AMETHYST_PURPLE,
  fire: CC_COLOR_RUBY_RED,
  water: CC_COLOR_SAPPHIRE_BLUE,
  nature: CC_COLOR_EMERALD_GREEN,
  lightning: CC_COLOR_TOPAZ_GOLD,
  radiant: CC_COLOR_DIAMOND_ICE,
}

/** The complete theme palette object */
export const CC_THEME: Record<string, string> = {
  amethystPurple: CC_COLOR_AMETHYST_PURPLE,
  crystalWhite: CC_COLOR_CRYSTAL_WHITE,
  rubyRed: CC_COLOR_RUBY_RED,
  emeraldGreen: CC_COLOR_EMERALD_GREEN,
  sapphireBlue: CC_COLOR_SAPPHIRE_BLUE,
  topazGold: CC_COLOR_TOPAZ_GOLD,
  diamondIce: CC_COLOR_DIAMOND_ICE,
  cryptDark: CC_COLOR_CRYPT_DARK,
  deepShadow: CC_COLOR_DEEP_SHADOW,
  glowAmethyst: CC_COLOR_GLOW_AMETHYST,
  glowRuby: CC_COLOR_GLOW_RUBY,
  glowEmerald: CC_COLOR_GLOW_EMERALD,
  stoneGray: CC_COLOR_STONE_GRAY,
  caveBrown: CC_COLOR_CAVE_BROWN,
  lavaOrange: CC_COLOR_LAVA_ORANGE,
}
