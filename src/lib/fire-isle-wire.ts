/**
 * Fire Isle Wire — 火焰岛 (Fire Isle) feature module for Word Snake
 *
 * A volcanic island adventure mini-game: tame 35 fire beasts across 5 rarity
 * tiers, explore 8 volcanic zones, collect 30 volcanic materials, build 25
 * forge structures, wield 22 fire abilities, earn 8 titles, forge 15
 * legendary weapons, and survive 12 eruption events — backed by a Zustand
 * store with persist middleware.
 *
 * Storage key: fire-isle-wire
 * Prefix: fi / FI_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type FIRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type FISpecies = 'Phoenix' | 'Dragon' | 'Salamander' | 'Fire Elemental' | 'Magma Worm' | 'Ember Sprite' | 'Inferno Turtle'
export type FIElement = 'Blaze' | 'Magma' | 'Ash' | 'Lava' | 'Ember' | 'Inferno' | 'Smoke' | 'Fire'

export interface FIBeastDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly species: FISpecies
  readonly rarity: FIRarity
  readonly basePower: number
  readonly ability: string
}

export interface FIZoneDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly dangerLevel: number
  readonly minLevel: number
  readonly resources: string[]
}

export interface FIMaterialDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: FIRarity
  readonly source: string
  readonly value: number
}

export interface FIForgeDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly costMultiplier: number
}

export interface FIOwnedForge {
  readonly id: string
  forgeDefId: string
  level: number
  built: boolean
}

export interface FIAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly element: FIElement
}

export interface FIAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface FITitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredExplored: number
}

export interface FIWeaponDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: FIRarity
  readonly baseDamage: number
  readonly specialEffect: string
  readonly requiredMaterials: { materialId: string; amount: number }[]
}

export interface FIEruptionDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly duration: number
  readonly effects: string[]
}

export interface FITamedBeast {
  readonly id: string
  beastDefId: string
  name: string
  level: number
  currentHP: number
  maxHP: number
  power: number
  loyalty: number
  acquiredAt: number
}

export interface FIIslandState {
  shieldHP: number
  maxShieldHP: number
  blazeIntensity: number
  lastEruptionAt: number | null
}

export interface FIStoreState {
  tamedBeasts: FITamedBeast[]
  collectedMaterials: Record<string, number>
  forges: FIOwnedForge[]
  achievements: string[]
  currentTitle: string
  forgedWeapons: string[]
  exploredZones: string[]
  isleLevel: number
  isleExp: number
  gold: number
  magmaEnergy: number
  totalTamed: number
  totalForged: number
  totalExplored: number
  totalHarvested: number
  totalEruptionsHandled: number
  totalPhoenixSummoned: number
  activeEruptionId: string | null
  eruptionTimer: number
  island: FIIslandState
  activeZoneId: string | null
}

export interface FIStoreActions {
  fiExploreZone: (zoneId: string) => boolean
  fiTameBeast: (beastId: string) => boolean
  fiForgeWeapon: (weaponId: string) => boolean
  fiUseAbility: (abilityId: string) => boolean
  fiHandleEruption: (eruptionId: string) => boolean
  fiHarvestMagma: (materialId: string) => number
  fiBuildForge: (forgeDefId: string) => boolean
  fiUpgradeForge: (forgeId: string) => boolean
  fiExtinguishBlaze: (amount: number) => boolean
  fiSummonPhoenix: (targetId: string) => boolean
  fiActivateShield: (duration: number) => boolean
  fiUnlockTitle: (titleId: string) => boolean
  fiClaimAchievement: (achievementId: string) => boolean
}

export type FIFullStore = FIStoreState & FIStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const FI_COLOR_LAVA_RED: string = '#DC143C'
export const FI_COLOR_INFERNO_ORANGE: string = '#FF6600'
export const FI_COLOR_MAGMA_YELLOW: string = '#FFD700'
export const FI_COLOR_VOLCANIC_BLACK: string = '#1A1A1A'
export const FI_COLOR_ASH_GRAY: string = '#808080'
export const FI_COLOR_FIRE_GOLD: string = '#FFB300'
export const FI_COLOR_EMBER_PURPLE: string = '#8B008B'
export const FI_COLOR_SMOKE_WHITE: string = '#F5F5F5'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: XP & LEVEL HELPERS
// ═══════════════════════════════════════════════════════════════════

const FI_MAX_LEVEL = 50
const FI_INITIAL_GOLD = 500
const FI_INITIAL_ENERGY = 100

function fiXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= FI_MAX_LEVEL) return Infinity
  return Math.floor(85 * Math.pow(1.14, level) + level * 16)
}

function fiLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < FI_MAX_LEVEL) {
    const needed = fiXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function fiGenerateId(): string {
  return `fi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function fiRarityMultiplier(rarity: FIRarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.5
    case 'rare': return 2.2
    case 'epic': return 3.5
    case 'legendary': return 6.0
  }
}

function fiSpeciesColor(species: FISpecies): string {
  switch (species) {
    case 'Phoenix': return FI_COLOR_INFERNO_ORANGE
    case 'Dragon': return FI_COLOR_LAVA_RED
    case 'Salamander': return FI_COLOR_FIRE_GOLD
    case 'Fire Elemental': return FI_COLOR_MAGMA_YELLOW
    case 'Magma Worm': return FI_COLOR_VOLCANIC_BLACK
    case 'Ember Sprite': return FI_COLOR_EMBER_PURPLE
    case 'Inferno Turtle': return FI_COLOR_ASH_GRAY
  }
}

function fiElementColor(element: FIElement): string {
  switch (element) {
    case 'Blaze': return FI_COLOR_LAVA_RED
    case 'Magma': return FI_COLOR_INFERNO_ORANGE
    case 'Ash': return FI_COLOR_ASH_GRAY
    case 'Lava': return FI_COLOR_MAGMA_YELLOW
    case 'Ember': return FI_COLOR_FIRE_GOLD
    case 'Inferno': return FI_COLOR_EMBER_PURPLE
    case 'Smoke': return FI_COLOR_SMOKE_WHITE
    case 'Fire': return FI_COLOR_VOLCANIC_BLACK
  }
}

function fiRarityColor(rarity: FIRarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#22D3EE'
    case 'rare': return '#818CF8'
    case 'epic': return '#F472B6'
    case 'legendary': return '#FBBF24'
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: SPECIES BONUSES & TAME CHANCES
// ═══════════════════════════════════════════════════════════════════

const FI_SPECIES_BONUSES: Record<FISpecies, { attack: number; defense: number; loyaltyBonus: number }> = {
  Phoenix: { attack: 20, defense: 5, loyaltyBonus: 10 },
  Dragon: { attack: 25, defense: 15, loyaltyBonus: 5 },
  Salamander: { attack: 10, defense: 20, loyaltyBonus: 15 },
  'Fire Elemental': { attack: 18, defense: 8, loyaltyBonus: 8 },
  'Magma Worm': { attack: 15, defense: 25, loyaltyBonus: 12 },
  'Ember Sprite': { attack: 8, defense: 5, loyaltyBonus: 25 },
  'Inferno Turtle': { attack: 5, defense: 30, loyaltyBonus: 20 },
}

const FI_TAME_CHANCES: Record<FIRarity, number> = {
  common: 65,
  uncommon: 22,
  rare: 9,
  epic: 3,
  legendary: 1,
}

const FI_ZONE_SPECIES_BONUS: Record<string, FISpecies[]> = {
  smoldering_beach: ['Salamander', 'Ember Sprite'],
  cinder_trail: ['Fire Elemental', 'Salamander'],
  lava_fields: ['Magma Worm', 'Dragon'],
  obsidian_cliffs: ['Dragon', 'Inferno Turtle'],
  magma_depths: ['Magma Worm', 'Fire Elemental'],
  inferno_peak: ['Phoenix', 'Dragon'],
  volcano_core: ['Phoenix', 'Dragon', 'Fire Elemental', 'Magma Worm', 'Ember Sprite', 'Inferno Turtle', 'Salamander'],
  ashlands: ['Ember Sprite', 'Salamander', 'Inferno Turtle'],
}

function fiGetSpeciesBonus(species: FISpecies): { attack: number; defense: number; loyaltyBonus: number } {
  return FI_SPECIES_BONUSES[species]
}

function fiGetTameChance(rarity: FIRarity, activeZoneId: string | null): number {
  let chance = FI_TAME_CHANCES[rarity]
  if (activeZoneId) {
    const bonusSpecies = FI_ZONE_SPECIES_BONUS[activeZoneId]
    if (bonusSpecies && bonusSpecies.length > 2) {
      chance = chance * 1.4
    }
  }
  return Math.min(100, Math.floor(chance))
}

function fiGetLoyaltyBonus(level: number, loyalty: number): number {
  return Math.floor(level * 10 * (1 + loyalty * 0.05))
}

function fiGetForgeBonus(forgeId: string, level: number): number {
  switch (forgeId) {
    case 'ember_anvil': return level * 3
    case 'magma_crucible': return level * 5
    case 'obsidian_workshop': return level * 8
    case 'inferno_forge': return level * 12
    case 'volcano_foundry': return level * 20
    case 'lava_pump_station': return level * 4
    case 'fire_quench_tank': return level * 6
    case 'heat_shield_generator': return level * 10
    default: return level * 2
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: FI_BEASTS — 35 Fire Beasts (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const FI_BEASTS: readonly FIBeastDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'spark_salamander',
    name: 'Spark Salamander',
    description:
      'A small amphibian with skin that crackles with static electricity. Found near cooling lava flows, it absorbs ambient heat and releases it as tiny sparks when startled. A favorite pet among novice beast tamers.',
    species: 'Salamander',
    rarity: 'common',
    basePower: 15,
    ability: 'Spark Shed',
  },
  {
    id: 'ember_imp',
    name: 'Ember Imp',
    description:
      'A mischievous sprite no larger than a fist, composed entirely of glowing embers. It plays pranks on travelers by singeing their clothing and stealing shiny objects. Despite its tricksy nature, it is fiercely loyal once tamed.',
    species: 'Ember Sprite',
    rarity: 'common',
    basePower: 14,
    ability: 'Ember Prank',
  },
  {
    id: 'cinder_lizard',
    name: 'Cinder Lizard',
    description:
      'A common reptile with scales the color of cooling cinders. It basks on warm volcanic rocks and can camouflage itself perfectly among ash deposits. Its tail detaches when grabbed, regrowing within days.',
    species: 'Salamander',
    rarity: 'common',
    basePower: 16,
    ability: 'Ash Camouflage',
  },
  {
    id: 'smoke_wisp',
    name: 'Smoke Wisp',
    description:
      'A faintly visible entity made of warm smoke and cinder. It drifts lazily through the air, following heat sources. When threatened, it disperses into a harmless cloud of gray smoke.',
    species: 'Fire Elemental',
    rarity: 'common',
    basePower: 13,
    ability: 'Smoke Dispersal',
  },
  {
    id: 'lava_grub',
    name: 'Lava Grub',
    description:
      'A plump segmented worm that feeds on cooled magma crust. Its body generates intense internal heat, making it a living furnace. Cooks have been known to use them as portable stoves during expeditions.',
    species: 'Magma Worm',
    rarity: 'common',
    basePower: 17,
    ability: 'Internal Furnace',
  },
  {
    id: 'flame_chick',
    name: 'Flame Chick',
    description:
      'A baby phoenix that has not yet developed its full plumage. Its stubby wings flicker with weak flames, and it chirps in frequencies that sound like popping wood. Extremely cute but prone to accidental arson.',
    species: 'Phoenix',
    rarity: 'common',
    basePower: 18,
    ability: 'Flicker Flutter',
  },
  {
    id: 'basalt_snapper',
    name: 'Basalt Snapper',
    description:
      'A small turtle-like creature with a shell made of compressed basalt. It snaps at anything that comes near with surprising speed for something so slow-moving. Its shell can withstand temperatures up to 2000 degrees.',
    species: 'Inferno Turtle',
    rarity: 'common',
    basePower: 19,
    ability: 'Basalt Bite',
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'blaze_fox',
    name: 'Blaze Fox',
    description:
      'A vulpine creature with fur that smolders perpetually, releasing trails of orange flame when it runs. It is incredibly swift and uses hit-and-run tactics to outmaneuver larger predators on the volcanic island.',
    species: 'Fire Elemental',
    rarity: 'uncommon',
    basePower: 32,
    ability: 'Flame Dash',
  },
  {
    id: 'magma_python',
    name: 'Magma Python',
    description:
      'A serpentine creature that slithers through underground magma channels. Its body temperature exceeds 1200 degrees, and it can constrict its prey while simultaneously melting their armor. Feared by miners and cave explorers.',
    species: 'Magma Worm',
    rarity: 'uncommon',
    basePower: 35,
    ability: 'Molten Constriction',
  },
  {
    id: 'ember_fairy',
    name: 'Ember Fairy',
    description:
      'A larger and more powerful ember sprite with delicate wings of woven firelight. It can heal burns and soothe blisters with a touch of its warm hands. Legends say it was born from the first campfire ever lit by humans.',
    species: 'Ember Sprite',
    rarity: 'uncommon',
    basePower: 30,
    ability: 'Healing Warmth',
  },
  {
    id: 'flame_serpent',
    name: 'Flame Serpent',
    description:
      'A juvenile dragon that has not yet developed wings. Its serpentine body is covered in fine scales that glow cherry-red when agitated. It can breathe short bursts of flame accurate up to thirty feet.',
    species: 'Dragon',
    rarity: 'uncommon',
    basePower: 34,
    ability: 'Flame Burst',
  },
  {
    id: 'ash_salamander_king',
    name: 'Ash Salamander King',
    description:
      'The largest salamander in its colony, distinguished by the crown-like pattern of bright spots on its head. It commands lesser salamanders and can generate a cloud of superheated ash to blind enemies.',
    species: 'Salamander',
    rarity: 'uncommon',
    basePower: 33,
    ability: 'Ash Crown Command',
  },
  {
    id: 'inferno_fledgling',
    name: 'Inferno Fledgling',
    description:
      'A young phoenix that has experienced its first rebirth. Its feathers are brighter and its flames are hotter than a Flame Chick. It can fly short distances and leaves a trail of golden sparks wherever it goes.',
    species: 'Phoenix',
    rarity: 'uncommon',
    basePower: 36,
    ability: 'Golden Trail',
  },
  {
    id: 'lava_shelled_tortoise',
    name: 'Lava Shelled Tortoise',
    description:
      'An ancient tortoise whose shell has partially melted and fused with volcanic rock over centuries. Lava flows between the cracks of its shell, creating natural defenses. It moves slowly but is nearly indestructible.',
    species: 'Inferno Turtle',
    rarity: 'uncommon',
    basePower: 38,
    ability: 'Lava Shell Defense',
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'pyro_dragon',
    name: 'Pyro Dragon',
    description:
      'A fully matured fire dragon with magnificent crimson wings that span forty feet. Its breath weapon is a continuous stream of liquid fire hot enough to melt tungsten. Highly territorial and extremely dangerous when provoked.',
    species: 'Dragon',
    rarity: 'rare',
    basePower: 58,
    ability: 'Liquid Fire Breath',
  },
  {
    id: 'blazing_phoenix',
    name: 'Blazing Phoenix',
    description:
      'A phoenix in the prime of its life cycle, wreathed in flames that burn white-hot at their core. It has died and been reborn three times, each resurrection making it stronger. Its tears can heal any wound.',
    species: 'Phoenix',
    rarity: 'rare',
    basePower: 62,
    ability: 'White Fire Rebirth',
  },
  {
    id: 'magma_wyrm',
    name: 'Magma Wyrm',
    description:
      'A massive worm-like creature that tunnels through the mantle of the volcanic island. Its body is made of living magma contained within a flexible obsidian sheath. When it surfaces, entire sections of the island rearrange.',
    species: 'Magma Worm',
    rarity: 'rare',
    basePower: 60,
    ability: 'Tectonic Tunnel',
  },
  {
    id: 'inferno_elemental',
    name: 'Inferno Elemental',
    description:
      'A sentient column of concentrated fire that stands twelve feet tall. It can reshape itself into any form — a wall, a spear, a shield — and burns at temperatures exceeding 5000 degrees at its core.',
    species: 'Fire Elemental',
    rarity: 'rare',
    basePower: 55,
    ability: 'Shapeflame',
  },
  {
    id: 'crimson_salamander',
    name: 'Crimson Salamander',
    description:
      'A salamander of unusual size and vivid crimson coloring. It has absorbed so much volcanic heat that its blood literally boils. It can spit boiling blood as a weapon and regenerate lost limbs in minutes.',
    species: 'Salamander',
    rarity: 'rare',
    basePower: 52,
    ability: 'Boiling Blood Spit',
  },
  {
    id: 'ember_spirit',
    name: 'Ember Spirit',
    description:
      'A powerful sprite that has accumulated centuries of wisdom and power. It can animate inanimate objects by filling them with ember energy, creating an army of fire-infused servants at will.',
    species: 'Ember Sprite',
    rarity: 'rare',
    basePower: 48,
    ability: 'Ember Animation',
  },
  {
    id: 'volcano_tortoise',
    name: 'Volcano Tortoise',
    description:
      'A colossal tortoise whose shell is literally a miniature volcano, complete with a smoking crater at the summit. It can trigger small eruptions from its shell to devastate enemies in all directions.',
    species: 'Inferno Turtle',
    rarity: 'rare',
    basePower: 65,
    ability: 'Shell Eruption',
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'apocalypse_dragon',
    name: 'Apocalypse Dragon',
    description:
      'An ancient dragon that has witnessed the destruction of entire civilizations by volcanic eruption. Its rage is so intense that the sky turns red when it takes flight. It can trigger volcanic events with its roar alone.',
    species: 'Dragon',
    rarity: 'epic',
    basePower: 98,
    ability: 'Cataclysm Roar',
  },
  {
    id: 'solar_phoenix',
    name: 'Solar Phoenix',
    description:
      'A phoenix that has absorbed the power of a dying star. Its flames match the temperature and brilliance of the sun, and it can blind entire armies with a single flash of its wings. It has been reborn seven times.',
    species: 'Phoenix',
    rarity: 'epic',
    basePower: 105,
    ability: 'Solar Flare Rebirth',
  },
  {
    id: 'mantle_wyrm',
    name: 'Mantle Wyrm',
    description:
      'A titanic worm that lives in the planetary mantle far below the volcanic island. It is so large that its movements cause earthquakes. When it surfaces, it brings magma from the deepest layers of the earth.',
    species: 'Magma Worm',
    rarity: 'epic',
    basePower: 95,
    ability: 'Mantle Surge',
  },
  {
    id: 'blaze_sovereign',
    name: 'Blaze Sovereign Elemental',
    description:
      'The king of all fire elementals on the volcanic island. It stands thirty feet tall and commands every flame within a ten-mile radius. Under its rule, fire is not chaos — it is discipline, order, and absolute destruction.',
    species: 'Fire Elemental',
    rarity: 'epic',
    basePower: 100,
    ability: 'Absolute Blaze Domain',
  },
  {
    id: 'inferno_salamander_lord',
    name: 'Inferno Salamander Lord',
    description:
      'The patriarch of all salamanders on the island, a creature that has lived for over a thousand years in the deepest lava tubes. Its body is covered in ancient rune markings that glow with forgotten fire magic.',
    species: 'Salamander',
    rarity: 'epic',
    basePower: 92,
    ability: 'Rune Ignition',
  },
  {
    id: 'ember_will_o_wisp',
    name: 'Ember Will-o-Wisp',
    description:
      'A ghostly sprite that exists between the material world and the fire plane. It can phase through solid matter, possess other fire creatures, and ignite the very air itself. Those who follow it are never seen again.',
    species: 'Ember Sprite',
    rarity: 'epic',
    basePower: 88,
    ability: 'Fire Plane Phasing',
  },
  {
    id: 'obsidian_fortress_tortoise',
    name: 'Obsidian Fortress Tortoise',
    description:
      'A living fortress, this tortoise carries an entire ecosystem of fire-adapted plants and creatures on its shell. Its shell is made of enchanted obsidian that regenerates faster than any weapon can damage it.',
    species: 'Inferno Turtle',
    rarity: 'epic',
    basePower: 96,
    ability: 'Living Fortress',
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'primordial_fire_dragon',
    name: 'Primordial Fire Dragon',
    description:
      'The first dragon to ever breathe fire, born from the original volcanic eruption that created the island. Its flames are the template for all fire in the world. To face it is to face the concept of fire itself.',
    species: 'Dragon',
    rarity: 'legendary',
    basePower: 150,
    ability: 'Genesis Flame',
  },
  {
    id: 'eternal_phoenix_empress',
    name: 'Eternal Phoenix Empress',
    description:
      'The mother of all phoenixes, a being that has died and been reborn ten thousand times. She carries the memories of every rebirth, and each death has made her wiser and more powerful. Her flame can reignite dead stars.',
    species: 'Phoenix',
    rarity: 'legendary',
    basePower: 148,
    ability: 'Ten Thousand Rebirths',
  },
  {
    id: 'core_magma_leviathan',
    name: 'Core Magma Leviathan',
    description:
      'A creature so massive it wraps around the entire core of the island. It IS the volcanic system. Every eruption, every lava flow, every hot spring is caused by its movements. Taming it means commanding the island itself.',
    species: 'Magma Worm',
    rarity: 'legendary',
    basePower: 145,
    ability: 'Planetary Magma Command',
  },
  {
    id: 'inferno_primordial',
    name: 'Inferno Primordial',
    description:
      'The original fire elemental, a being of pure living flame that has existed since the universe first ignited. It is not made of fire — fire is made of it. Every candle, every bonfire, every supernova is a fragment of its being.',
    species: 'Fire Elemental',
    rarity: 'legendary',
    basePower: 142,
    ability: 'Source of All Flame',
  },
  {
    id: 'world_burn_salamander',
    name: 'World-Burn Salamander',
    description:
      'A salamander of mythic proportions that walks through the world leaving rivers of molten rock in its footprints. Where it steps, the earth melts. Where it sleeps, new volcanoes form. Its loyalty, once earned, is absolute.',
    species: 'Salamander',
    rarity: 'legendary',
    basePower: 140,
    ability: 'World Melt Footprint',
  },
  {
    id: 'ember_dreamweaver',
    name: 'Ember Dreamweaver',
    description:
      'A sprite that exists simultaneously in the waking world and the dream world. It can set fire to nightmares, ignite hope in sleeping minds, and walk through the dreams of every creature on the island at once.',
    species: 'Ember Sprite',
    rarity: 'legendary',
    basePower: 138,
    ability: 'Dream Ignition',
  },
  {
    id: 'tectonic_atlas_tortoise',
    name: 'Tectonic Atlas Tortoise',
    description:
      'A tortoise so ancient that it carries the complete geological history of the island on its shell. Each ridge is a mountain range, each groove a river of lava. It can rearrange the island landscape simply by shifting its weight.',
    species: 'Inferno Turtle',
    rarity: 'legendary',
    basePower: 135,
    ability: 'Continental Reshaping',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: FI_ZONES — 8 Volcanic Zones
// ═══════════════════════════════════════════════════════════════════

export const FI_ZONES: readonly FIZoneDef[] = [
  {
    id: 'smoldering_beach',
    name: 'Smoldering Beach',
    description:
      'A black-sand coastline where steam vents erupt through the ground and the tide leaves behind pools of warm water. The air smells of sulfur and salt, and the sand is hot enough to cook food buried beneath it.',
    dangerLevel: 1,
    minLevel: 1,
    resources: ['volcanic_sand', 'sulfur_crystal', 'warm_pumice', 'sea_char'],
  },
  {
    id: 'cinder_trail',
    name: 'Cinder Trail',
    description:
      'A winding path through fields of cooling volcanic cinder that crunches underfoot like walking on shattered glass. Small fires still burn in patches, and the ground radiates heat in visible waves that distort the air.',
    dangerLevel: 2,
    minLevel: 5,
    resources: ['cinder_clay', 'fire_clay', 'ember_root', 'smoldering_peat'],
  },
  {
    id: 'lava_fields',
    name: 'Lava Fields',
    description:
      'Vast expanses of slow-moving lava rivers bordered by shelves of cooling basalt. The landscape glows orange at night, creating an otherworldly panorama. Bridges of natural stone arch over the hottest flows.',
    dangerLevel: 3,
    minLevel: 10,
    resources: ['basalt_slab', 'lava_glass', 'molten_ore', 'fire_opal_shard'],
  },
  {
    id: 'obsidian_cliffs',
    name: 'Obsidian Cliffs',
    description:
      'Towering cliffs of natural obsidian glass that reflect the volcanic sky like dark mirrors. The cliffs are riddled with caves and tunnels, and ancient fire-worshiping civilizations once carved temples into the glass.',
    dangerLevel: 4,
    minLevel: 15,
    resources: ['obsidian_chunk', 'mirror_stone', 'fire_gem_dust', 'crystal_lava'],
  },
  {
    id: 'magma_depths',
    name: 'Magma Depths',
    description:
      'A vast underground network of magma-filled caverns where the temperature never drops below 800 degrees. Bioluminescent fire-fungi light the passages in shades of crimson and gold. Home to the deepest-dwelling beasts.',
    dangerLevel: 5,
    minLevel: 22,
    resources: ['magma_nectar', 'deep_fire_crystal', 'infernal_iron', 'lava_resin'],
  },
  {
    id: 'inferno_peak',
    name: 'Inferno Peak',
    description:
      'The highest volcanic peak on the island, perpetually wreathed in clouds of ash and fire. Lightning made of pure flame arcs between the cloud layers, and the summit is said to be a gateway to the fire plane.',
    dangerLevel: 6,
    minLevel: 30,
    resources: ['lightning_fire_essence', 'peak_obsidian', 'cloud_ember', 'summit_crystal'],
  },
  {
    id: 'volcano_core',
    name: 'Volcano Core',
    description:
      'The heart of the island volcano, a chamber of liquid fire so intense that reality itself bends near it. Time slows, light curves, and matter dissolves. Only the most powerful beasts and materials can exist here.',
    dangerLevel: 7,
    minLevel: 38,
    resources: ['core_magma', 'reality_shard', 'primordial_fire_ore', 'genesis_ember'],
  },
  {
    id: 'ashlands',
    name: 'Ashlands',
    description:
      'A desolate expanse of fine volcanic ash where nothing grows and the sky is perpetually gray. Beneath the ash lies a buried ancient city of fire mages, preserved perfectly by the insulating blanket of gray powder.',
    dangerLevel: 8,
    minLevel: 45,
    resources: ['ancient_fire_rune', 'ash_amber', 'buried_mage_crystal', 'city_obsidian'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: FI_MATERIALS — 30 Volcanic Materials
// ═══════════════════════════════════════════════════════════════════

export const FI_MATERIALS: readonly FIMaterialDef[] = [
  // Common (6)
  { id: 'volcanic_sand', name: 'Volcanic Sand', description: 'Fine black sand ground from volcanic rock by the ocean. Used in basic forging and glassmaking. Warm to the touch.', rarity: 'common', source: 'smoldering_beach', value: 5 },
  { id: 'sulfur_crystal', name: 'Sulfur Crystal', description: 'Bright yellow crystals that form near volcanic vents. Emits a strong smell and can be used as a basic alchemical reagent.', rarity: 'common', source: 'smoldering_beach', value: 6 },
  { id: 'warm_pumice', name: 'Warm Pumice', description: 'Lightweight volcanic rock filled with air bubbles. Still warm from its formation and useful as an abrasive or insulating material.', rarity: 'common', source: 'smoldering_beach', value: 4 },
  { id: 'sea_char', name: 'Sea Char', description: 'Charred remnants of sea creatures preserved by volcanic heat. Contains concentrated minerals and has mild fire resistance properties.', rarity: 'common', source: 'smoldering_beach', value: 7 },
  { id: 'cinder_clay', name: 'Cinder Clay', description: 'Heat-resistant clay found in the volcanic soil. Essential for forging crucibles and fireproof containers. Remains pliable even at high temperatures.', rarity: 'common', source: 'cinder_trail', value: 8 },
  { id: 'fire_clay', name: 'Fire Clay', description: 'A superior form of cinder clay with higher heat tolerance. Used in the construction of forge linings and blast furnace walls.', rarity: 'common', source: 'cinder_trail', value: 9 },

  // Uncommon (6)
  { id: 'ember_root', name: 'Ember Root', description: 'The root of a fire-adapted plant that grows in volcanic soil. It glows faintly and can be chewed to gain temporary fire resistance.', rarity: 'uncommon', source: 'cinder_trail', value: 28 },
  { id: 'smoldering_peat', name: 'Smoldering Peat', description: 'Partially combusted peat that has been smoldering underground for decades. Burns with an intensely hot but smokeless flame when ignited.', rarity: 'uncommon', source: 'cinder_trail', value: 32 },
  { id: 'basalt_slab', name: 'Basalt Slab', description: 'A flat slab of columnar basalt, perfectly formed by volcanic cooling. Used as a crafting base and building material for fire-resistant structures.', rarity: 'uncommon', source: 'lava_fields', value: 35 },
  { id: 'lava_glass', name: 'Lava Glass', description: 'Glass formed naturally when lava cools rapidly. It has unique optical properties that bend light in strange ways, creating prismatic fire effects.', rarity: 'uncommon', source: 'lava_fields', value: 30 },
  { id: 'molten_ore', name: 'Molten Ore', description: 'Iron ore that has been partially melted by proximity to lava flows. Easier to smelt than raw ore and contains trace amounts of volcanic minerals.', rarity: 'uncommon', source: 'lava_fields', value: 38 },
  { id: 'fire_opal_shard', name: 'Fire Opal Shard', description: 'A small fragment of fire opal found in lava field deposits. It flickers with internal fire when exposed to light and is used in enchanting.', rarity: 'uncommon', source: 'lava_fields', value: 45 },

  // Rare (6)
  { id: 'obsidian_chunk', name: 'Obsidian Chunk', description: 'A large piece of volcanic glass with razor-sharp edges. Can be shaped into weapons or tools of exceptional quality when properly worked.', rarity: 'rare', source: 'obsidian_cliffs', value: 120 },
  { id: 'mirror_stone', name: 'Mirror Stone', description: 'A polished obsidian variant that reflects not light, but heat. Looking into it shows thermal images of surrounding living creatures.', rarity: 'rare', source: 'obsidian_cliffs', value: 150 },
  { id: 'fire_gem_dust', name: 'Fire Gem Dust', description: 'Finely ground dust from fire gems found in cliff deposits. When mixed with molten metal, it creates weapons that burn on contact.', rarity: 'rare', source: 'obsidian_cliffs', value: 130 },
  { id: 'crystal_lava', name: 'Crystal Lava', description: 'Lava that has cooled into a crystalline structure rather than amorphous rock. It pulses with geothermal energy and is used to power advanced forges.', rarity: 'rare', source: 'obsidian_cliffs', value: 140 },
  { id: 'magma_nectar', name: 'Magma Nectar', description: 'A sweet, glowing liquid that flows through certain deep-rock formations. Fire beasts are irresistibly attracted to it, making it invaluable for taming.', rarity: 'rare', source: 'magma_depths', value: 110 },
  { id: 'deep_fire_crystal', name: 'Deep Fire Crystal', description: 'Crystals formed under extreme pressure deep within the volcanic system. They burn with an internal fire that never extinguishes and can light entire caverns.', rarity: 'rare', source: 'magma_depths', value: 160 },

  // Epic (6)
  { id: 'infernal_iron', name: 'Infernal Iron', description: 'Iron ore that has been alloyed with volcanic essences over millennia. When forged, it produces weapons that are virtually indestructible and always warm to the touch.', rarity: 'epic', source: 'magma_depths', value: 500 },
  { id: 'lava_resin', name: 'Lava Resin', description: 'Resin from ancient trees that were petrified by volcanic flows. It burns with an unquenchable blue flame and is used to seal the most powerful weapon enchantments.', rarity: 'epic', source: 'magma_depths', value: 480 },
  { id: 'lightning_fire_essence', name: 'Lightning Fire Essence', description: 'Condensed fire-lightning from the perpetual storms around Inferno Peak. It crackles with electrical energy and burns with plasma-hot intensity.', rarity: 'epic', source: 'inferno_peak', value: 550 },
  { id: 'peak_obsidian', name: 'Peak Obsidian', description: 'Obsidian formed at the extreme altitude of Inferno Peak, where atmospheric pressure gives it unique properties. It is harder than diamond and conducts heat instantly.', rarity: 'epic', source: 'inferno_peak', value: 600 },
  { id: 'cloud_ember', name: 'Cloud Ember', description: 'Embers that float upward from the peak and become trapped in the volcanic cloud layer. They glow with soft purple light and contain storm-fire energy.', rarity: 'epic', source: 'inferno_peak', value: 520 },
  { id: 'summit_crystal', name: 'Summit Crystal', description: 'Crystals that only form at the exact summit of Inferno Peak during lightning strikes. They contain captured fire-lightning and hum with immense power.', rarity: 'epic', source: 'inferno_peak', value: 580 },

  // Legendary (6)
  { id: 'core_magma', name: 'Core Magma', description: 'Liquid magma drawn from the very core of the volcanic island. It is hotter than any naturally occurring substance on the surface and radiates primordial energy.', rarity: 'legendary', source: 'volcano_core', value: 5000 },
  { id: 'reality_shard', name: 'Reality Shard', description: 'A fragment of reality that was warped and crystallized by the extreme conditions in the Volcano Core. It shimmers between existence and non-existence.', rarity: 'legendary', source: 'volcano_core', value: 6000 },
  { id: 'primordial_fire_ore', name: 'Primordial Fire Ore', description: 'Ore that contains the original fire from the creation of the island. Smelting it releases flames that have been trapped since the world began.', rarity: 'legendary', source: 'volcano_core', value: 5500 },
  { id: 'genesis_ember', name: 'Genesis Ember', description: 'An ember from the first fire ever to burn on the island. It has been kept alive for millennia by the volcanic heat and contains the spark of creation.', rarity: 'legendary', source: 'volcano_core', value: 7000 },
  { id: 'ancient_fire_rune', name: 'Ancient Fire Rune', description: 'A perfectly preserved rune stone from the buried fire mage city. It contains spells of immense power that were thought lost to history.', rarity: 'legendary', source: 'ashlands', value: 4500 },
  { id: 'ash_amber', name: 'Ash Amber', description: 'Amber formed from the sap of ancient trees buried under volcanic ash. It perfectly preserves anything trapped within it, including prehistoric fire creatures.', rarity: 'legendary', source: 'ashlands', value: 6500 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: FI_FORGES — 25 Forge Structures
// ═══════════════════════════════════════════════════════════════════

export const FI_FORGES: readonly FIForgeDef[] = [
  // Smelting (5)
  { id: 'ember_anvil', name: 'Ember Anvil', description: 'A basic anvil made from welded volcanic steel. Suitable for shaping common materials into simple weapons and tools.', baseCost: 100, costMultiplier: 1.5 },
  { id: 'magma_crucible', name: 'Magma Crucible', description: 'A heat-resistant crucible lined with cinder clay that can melt uncommon ores without cracking. Essential for intermediate forging.', baseCost: 400, costMultiplier: 1.6 },
  { id: 'obsidian_workshop', name: 'Obsidian Workshop', description: 'A full workshop built from obsidian blocks, equipped with multiple forging stations. Required for working with rare volcanic materials.', baseCost: 1200, costMultiplier: 1.7 },
  { id: 'inferno_forge', name: 'Inferno Forge', description: 'A forge that channels geothermal heat directly from the volcanic system. Can reach temperatures necessary for epic material processing.', baseCost: 3000, costMultiplier: 1.8 },
  { id: 'volcano_foundry', name: 'Volcano Foundry', description: 'The ultimate forging structure, built directly into the side of the volcano. Can process legendary materials and create artifacts of immense power.', baseCost: 8000, costMultiplier: 2.0 },

  // Taming (5)
  { id: 'beast_pen', name: 'Beast Pen', description: 'A simple enclosure of volcanic stone to house tamed fire beasts. Keeps common beasts contained with basic fireproof walls.', baseCost: 80, costMultiplier: 1.4 },
  { id: 'flame_incubator', name: 'Flame Incubator', description: 'A temperature-controlled chamber for raising fire beast eggs and young. Simulates the volcanic conditions needed for healthy beast development.', baseCost: 300, costMultiplier: 1.5 },
  { id: 'loyalty_sanctum', name: 'Loyalty Sanctum', description: 'A dedicated space for bonding with tamed beasts. Meditating here with your beasts increases loyalty faster and strengthens the tamer-beast connection.', baseCost: 800, costMultiplier: 1.6 },
  { id: 'magma_bath_house', name: 'Magma Bath House', description: 'A facility with pools of varying temperatures for healing and rejuvenating fire beasts. Speeds recovery after battles and injuries.', baseCost: 2000, costMultiplier: 1.7 },
  { id: 'primeval_bestiary', name: 'Primeval Bestiary', description: 'A grand library containing knowledge of every fire beast species. Studying here unlocks taming techniques for epic and legendary beasts.', baseCost: 5000, costMultiplier: 1.8 },

  // Defense (5)
  { id: 'stone_barricade', name: 'Stone Barricade', description: 'A simple wall of volcanic stone blocks. Provides basic protection against small lava surges and common fire beast attacks.', baseCost: 60, costMultiplier: 1.3 },
  { id: 'heat_deflector', name: 'Heat Deflector', description: 'An angled obsidian panel that redirects heat from lava flows away from structures. Passive defense that requires no energy to operate.', baseCost: 250, costMultiplier: 1.5 },
  { id: 'fire_break_trench', name: 'Fire Break Trench', description: 'A trench dug around the settlement and filled with cooling lava. Creates an effective firebreak that stops advancing flames and lava flows.', baseCost: 600, costMultiplier: 1.5 },
  { id: 'thermal_dome', name: 'Thermal Dome', description: 'A dome-shaped energy barrier that regulates temperature within. Protects against extreme heat, cold, and volcanic gases.', baseCost: 1500, costMultiplier: 1.7 },
  { id: 'inferno_bastion', name: 'Inferno Bastion', description: 'The ultimate defensive structure, an impenetrable fortress built from enchanted obsidian. Can withstand direct volcanic eruptions and dragon attacks.', baseCost: 4000, costMultiplier: 1.8 },

  // Resource (5)
  { id: 'ash_collector', name: 'Ash Collector', description: 'An automated system that harvests volcanic ash from the air. Produces a steady supply of basic volcanic materials.', baseCost: 100, costMultiplier: 1.4 },
  { id: 'magma_pump_station', name: 'Magma Pump Station', description: 'A pump system that draws magma from underground channels for use in forging and power generation. Provides reliable access to molten material.', baseCost: 400, costMultiplier: 1.5 },
  { id: 'geothermal_well', name: 'Geothermal Well', description: 'A deep well that taps into the volcanic heat beneath the island. Provides unlimited thermal energy for all nearby structures.', baseCost: 1000, costMultiplier: 1.6 },
  { id: 'mineral_extractor', name: 'Mineral Extractor', description: 'A machine that processes volcanic rock to extract valuable minerals and ores. Greatly increases material yield from all sources.', baseCost: 2500, costMultiplier: 1.7 },
  { id: 'core_tap', name: 'Core Tap', description: 'The most advanced resource structure, tapping directly into the volcanic core for unlimited legendary material production.', baseCost: 6000, costMultiplier: 2.0 },

  // Utility (5)
  { id: 'fire_quench_tank', name: 'Fire Quench Tank', description: 'A large tank of enchanted water that never evaporates. Used to rapidly extinguish unwanted fires and cool overheated equipment.', baseCost: 120, costMultiplier: 1.4 },
  { id: 'smoke_ventilation', name: 'Smoke Ventilation', description: 'A system of pipes and fans that removes toxic volcanic gases from the settlement. Improves air quality and reduces health damage from eruptions.', baseCost: 350, costMultiplier: 1.4 },
  { id: 'heat_shield_generator', name: 'Heat Shield Generator', description: 'Generates a personal heat shield that protects tamed beasts and tamers from extreme temperatures during expeditions.', baseCost: 700, costMultiplier: 1.5 },
  { id: 'lava_bridge_builder', name: 'Lava Bridge Builder', description: 'A device that solidifies lava flows into temporary bridges, allowing access to previously unreachable areas of the island.', baseCost: 1500, costMultiplier: 1.6 },
  { id: 'phoenix_summoning_altar', name: 'Phoenix Summoning Altar', description: 'A sacred altar where phoenix energy can be concentrated. Allows summoning of phoenix-type beasts and provides passive healing to all island creatures.', baseCost: 3500, costMultiplier: 1.8 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: FI_ABILITIES — 22 Fire Abilities
// ═══════════════════════════════════════════════════════════════════

export const FI_ABILITIES: readonly FIAbilityDef[] = [
  { id: 'spark_burst', name: 'Spark Burst', description: 'Release a shower of sparks that ignites flammable materials and startles nearby beasts.', cooldown: 5, power: 10, element: 'Blaze' },
  { id: 'ember_breath', name: 'Ember Breath', description: 'Exhale a cloud of hot embers that deal light damage over time to all enemies in a cone.', cooldown: 8, power: 18, element: 'Ember' },
  { id: 'ash_cloud', name: 'Ash Cloud', description: 'Summon a thick cloud of volcanic ash that obscures vision and causes breathing difficulty for enemies.', cooldown: 10, power: 15, element: 'Ash' },
  { id: 'lava_splash', name: 'Lava Splash', description: 'Throw a glob of molten lava that splashes on impact, creating a pool of burning liquid.', cooldown: 12, power: 25, element: 'Lava' },
  { id: 'flame_wall', name: 'Flame Wall', description: 'Conjure a wall of roaring flames that blocks movement and burns anything that passes through.', cooldown: 15, power: 30, element: 'Blaze' },
  { id: 'magma_bolt', name: 'Magma Bolt', description: 'Hurl a bolt of compressed magma that explodes on contact, dealing heavy damage in a small area.', cooldown: 10, power: 35, element: 'Magma' },
  { id: 'inferno_howl', name: 'Inferno Howl', description: 'Release a war cry infused with fire energy that boosts ally power and weakens enemy resolve.', cooldown: 20, power: 28, element: 'Inferno' },
  { id: 'smoke_screen', name: 'Smoke Screen', description: 'Generate a dense cloud of smoke that provides cover for retreat and disorients pursuing enemies.', cooldown: 8, power: 12, element: 'Smoke' },
  { id: 'fire_rain', name: 'Fire Rain', description: 'Call down a rain of burning embers from the sky that damages all enemies in a large area.', cooldown: 25, power: 45, element: 'Fire' },
  { id: 'blaze_surge', name: 'Blaze Surge', description: 'Channel fire energy into a devastating forward surge that incinerates everything in its path.', cooldown: 18, power: 50, element: 'Blaze' },
  { id: 'magma_armor', name: 'Magma Armor', description: 'Cover yourself in a layer of cooling magma that absorbs incoming damage and burns attackers.', cooldown: 30, power: 40, element: 'Magma' },
  { id: 'ash_storm', name: 'Ash Storm', description: ' whip up a violent storm of razor-sharp ash particles that shred anything caught within.', cooldown: 22, power: 38, element: 'Ash' },
  { id: 'lava_eruption', name: 'Lava Eruption', description: 'Cause the ground to erupt with geysers of lava, devastating a wide area around you.', cooldown: 35, power: 65, element: 'Lava' },
  { id: 'ember_nova', name: 'Ember Nova', description: 'Release a spherical shockwave of ember energy that pushes back enemies and heals allies.', cooldown: 28, power: 42, element: 'Ember' },
  { id: 'inferno_blaze', name: 'Inferno Blaze', description: 'Ignite a target with inextinguishable fire that grows stronger over time until it consumes everything.', cooldown: 40, power: 70, element: 'Inferno' },
  { id: 'fire_whip', name: 'Fire Whip', description: 'Form a whip of concentrated fire that can reach distant targets and leave burning wounds.', cooldown: 12, power: 32, element: 'Fire' },
  { id: 'smoke_demon_summon', name: 'Smoke Demon Summon', description: 'Summon a temporary smoke demon from volcanic vents to fight alongside you.', cooldown: 45, power: 55, element: 'Smoke' },
  { id: 'blaze_cannon', name: 'Blaze Cannon', description: 'Focus all available fire energy into a single devastating beam of concentrated flame.', cooldown: 50, power: 85, element: 'Blaze' },
  { id: 'magma_tide', name: 'Magma Tide', description: 'Trigger a wave of magma that sweeps across the battlefield, reshaping terrain and devastating enemies.', cooldown: 55, power: 90, element: 'Magma' },
  { id: 'ash_requiem', name: 'Ash Requiem', description: 'Sing a haunting melody that turns all ash and smoke into weapons, creating a battlefield of burning particles.', cooldown: 60, power: 75, element: 'Ash' },
  { id: 'inferno_phoenix_strike', name: 'Inferno Phoenix Strike', description: 'Channel the power of a phoenix into a devastating dive attack that annihilates a single target.', cooldown: 70, power: 120, element: 'Inferno' },
  { id: 'volcanic_apocalypse', name: 'Volcanic Apocalypse', description: 'Unleash the full fury of the volcanic island, triggering simultaneous eruptions across the entire zone.', cooldown: 90, power: 150, element: 'Fire' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: FI_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const FI_ACHIEVEMENTS: readonly FIAchievementDef[] = [
  { id: 'fi_ach_first_tame', name: 'First Flame', description: 'Tame your very first fire beast.', condition: 'Tame 1 beast', reward: '+50 magma energy' },
  { id: 'fi_ach_five_tames', name: 'Beast Collector', description: 'Tame five different fire beasts.', condition: 'Tame 5 beasts', reward: '+200 gold' },
  { id: 'fi_ach_ten_tames', name: 'Menagerie Master', description: 'Build a collection of ten tamed beasts.', condition: 'Tame 10 beasts', reward: '+500 gold, Ember Fairy unlocked' },
  { id: 'fi_ach_all_common', name: 'Common Flame', description: 'Tame all 7 common fire beasts.', condition: 'Tame all common beasts', reward: '+300 magma energy' },
  { id: 'fi_ach_all_uncommon', name: 'Uncommon Spark', description: 'Tame all 7 uncommon fire beasts.', condition: 'Tame all uncommon beasts', reward: '+800 gold' },
  { id: 'fi_ach_first_legendary', name: 'Legend Ignited', description: 'Successfully tame a legendary fire beast.', condition: 'Tame 1 legendary beast', reward: '+2000 gold, title upgrade' },
  { id: 'fi_ach_first_explore', name: 'Shore Explorer', description: 'Explore the Smoldering Beach for the first time.', condition: 'Explore 1 zone', reward: '+100 gold' },
  { id: 'fi_ach_all_zones', name: 'Island Cartographer', description: 'Explore all 8 volcanic zones on the island.', condition: 'Explore 8 zones', reward: '+5000 gold, +500 magma energy' },
  { id: 'fi_ach_first_forge', name: 'Novice Blacksmith', description: 'Build your first forge structure.', condition: 'Build 1 forge', reward: '+200 gold' },
  { id: 'fi_ach_five_forges', name: 'Forge Architect', description: 'Build and upgrade five different forge structures.', condition: 'Build 5 forges', reward: '+1000 gold' },
  { id: 'fi_ach_max_forge', name: 'Master Forgemaster', description: 'Upgrade any forge structure to maximum level 10.', condition: 'Max level forge', reward: '+3000 gold' },
  { id: 'fi_ach_first_weapon', name: 'Weapon Smith', description: 'Forge your first fire weapon.', condition: 'Forge 1 weapon', reward: '+300 gold' },
  { id: 'fi_ach_ten_weapons', name: 'Arsenal Builder', description: 'Forge ten different fire weapons.', condition: 'Forge 10 weapons', reward: '+2000 gold' },
  { id: 'fi_ach_first_eruption', name: 'Eruption Survivor', description: 'Handle your first volcanic eruption event.', condition: 'Handle 1 eruption', reward: '+500 gold' },
  { id: 'fi_ach_ten_eruptions', name: 'Disaster Veteran', description: 'Successfully handle ten eruption events.', condition: 'Handle 10 eruptions', reward: '+3000 gold, shield upgrade' },
  { id: 'fi_ach_first_phoenix', name: 'Phoenix Caller', description: 'Summon a phoenix for the first time.', condition: 'Summon 1 phoenix', reward: '+800 gold' },
  { id: 'fi_ach_max_level', name: 'Volcano Lord', description: 'Reach the maximum island level.', condition: 'Reach level 50', reward: '+10000 gold, legendary title' },
  { id: 'fi_ach_hundred_harvest', name: 'Resource Baron', description: 'Harvest 100 volcanic materials in total.', condition: 'Harvest 100 materials', reward: '+1500 gold' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: FI_TITLES — 8 Titles (Spark Scout → Inferno Lord/Lady)
// ═══════════════════════════════════════════════════════════════════

export const FI_TITLES: readonly FITitleDef[] = [
  { id: 'fi_title_spark_scout', name: 'Spark Scout', description: 'A newcomer to the volcanic island, just beginning to understand the power of fire.', requiredLevel: 1, requiredExplored: 0 },
  { id: 'fi_title_ember_explorer', name: 'Ember Explorer', description: 'An adventurer who has braved the cinder trails and lived to tell the tale.', requiredLevel: 5, requiredExplored: 2 },
  { id: 'fi_title_blaze_tamer', name: 'Blaze Tamer', description: 'A skilled beast handler who can calm even the most aggressive fire creatures.', requiredLevel: 12, requiredExplored: 3 },
  { id: 'fi_title_magma_walker', name: 'Magma Walker', description: 'One who walks upon molten rock as comfortably as solid ground.', requiredLevel: 20, requiredExplored: 4 },
  { id: 'fi_title_inferno_forger', name: 'Inferno Forger', description: 'A master smith who shapes weapons from the heart of the volcano itself.', requiredLevel: 28, requiredExplored: 5 },
  { id: 'fi_title_volcano_vanguard', name: 'Volcano Vanguard', description: 'A warrior who stands at the front line against eruptions and rampaging beasts.', requiredLevel: 35, requiredExplored: 6 },
  { id: 'fi_title_fire_sovereign', name: 'Fire Sovereign', description: 'A ruler of flame who commands the respect of every beast on the island.', requiredLevel: 42, requiredExplored: 7 },
  { id: 'fi_title_inferno_lord', name: 'Inferno Lord', description: 'The absolute master of the volcanic island. Every flame bows to your will.', requiredLevel: 50, requiredExplored: 8 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: FI_WEAPONS — 15 Legendary Fire-Forged Weapons
// ═══════════════════════════════════════════════════════════════════

export const FI_WEAPONS: readonly FIWeaponDef[] = [
  { id: 'fi_wpn_ember_dagger', name: 'Ember Dagger', description: 'A short blade that glows with trapped ember energy. Each strike leaves a burning wound that smolders for hours.', rarity: 'common', baseDamage: 15, specialEffect: 'Burn: 5 damage over 3s', requiredMaterials: [{ materialId: 'volcanic_sand', amount: 10 }, { materialId: 'ember_root', amount: 2 }] },
  { id: 'fi_wpn_cinder_spear', name: 'Cinder Spear', description: 'A spear with a tip forged from compressed volcanic cinder. It shatters on impact, sending burning shrapnel in all directions.', rarity: 'common', baseDamage: 20, specialEffect: 'Shatter: AoE burst on hit', requiredMaterials: [{ materialId: 'cinder_clay', amount: 8 }, { materialId: 'fire_clay', amount: 5 }] },
  { id: 'fi_wpn_lava_glass_sword', name: 'Lava Glass Sword', description: 'A sword made from a single piece of lava glass. Its edge is molecularly thin and cuts through armor like paper.', rarity: 'uncommon', baseDamage: 35, specialEffect: 'Molecular Cut: Ignore 30% defense', requiredMaterials: [{ materialId: 'lava_glass', amount: 5 }, { materialId: 'basalt_slab', amount: 3 }] },
  { id: 'fi_wpn_magma_hammer', name: 'Magma Hammer', description: 'A war hammer with a head of solidified magma core. Each strike sends shockwaves through the ground that trip nearby enemies.', rarity: 'uncommon', baseDamage: 40, specialEffect: 'Shockwave: Stun in 3m radius', requiredMaterials: [{ materialId: 'molten_ore', amount: 8 }, { materialId: 'fire_opal_shard', amount: 2 }] },
  { id: 'fi_wpn_obsidian_axe', name: 'Obsidian Axe', description: 'A double-bitted axe with blades of mirror-polished obsidian. It reflects heat back at attackers with each swing.', rarity: 'uncommon', baseDamage: 38, specialEffect: 'Heat Reflect: 15% damage return', requiredMaterials: [{ materialId: 'obsidian_chunk', amount: 6 }, { materialId: 'mirror_stone', amount: 2 }] },
  { id: 'fi_wpn_fire_gem_staff', name: 'Fire Gem Staff', description: 'A staff topped with a fire gem that channels raw flame energy. Amplifies all fire abilities by 25%.', rarity: 'rare', baseDamage: 55, specialEffect: 'Amplify: +25% fire ability power', requiredMaterials: [{ materialId: 'fire_gem_dust', amount: 10 }, { materialId: 'crystal_lava', amount: 3 }] },
  { id: 'fi_wpn_infernal_blade', name: 'Infernal Blade', description: 'A longsword forged from infernal iron that burns with an ever-present blue flame. Cannot be extinguished by any means.', rarity: 'rare', baseDamage: 65, specialEffect: 'Eternal Flame: Never extinguish, +10 fire damage', requiredMaterials: [{ materialId: 'infernal_iron', amount: 5 }, { materialId: 'magma_nectar', amount: 3 }] },
  { id: 'fi_wpn_magma_trident', name: 'Magma Trident', description: 'A three-pronged weapon that channels magma through its tines. Can create fountains of lava that reshape the battlefield.', rarity: 'rare', baseDamage: 60, specialEffect: 'Magma Fountain: Create lava terrain', requiredMaterials: [{ materialId: 'deep_fire_crystal', amount: 4 }, { materialId: 'lava_resin', amount: 3 }] },
  { id: 'fi_wpn_storm_fire_bow', name: 'Storm Fire Bow', description: 'A bow crafted from lightning-struck wood at Inferno Peak. Its arrows are bolts of fire-lightning that strike with explosive force.', rarity: 'epic', baseDamage: 85, specialEffect: 'Fire-Lightning Arrow: Chain to 3 targets', requiredMaterials: [{ materialId: 'lightning_fire_essence', amount: 3 }, { materialId: 'peak_obsidian', amount: 2 }] },
  { id: 'fi_wpn_cloud_flame_scepter', name: 'Cloud Flame Scepter', description: 'A scepter wreathed in cloud embers that float upward endlessly. Commands ash storms and smoke elementals.', rarity: 'epic', baseDamage: 80, specialEffect: 'Ash Command: Summon smoke minions', requiredMaterials: [{ materialId: 'cloud_ember', amount: 5 }, { materialId: 'summit_crystal', amount: 2 }] },
  { id: 'fi_wpn_core_magma_greatsword', name: 'Core Magma Greatsword', description: 'A massive sword containing a channel of liquid core magma within its blade. The magma circulates under its own pressure, always flowing.', rarity: 'legendary', baseDamage: 150, specialEffect: 'Magma Flow: +50 damage, melts terrain', requiredMaterials: [{ materialId: 'core_magma', amount: 3 }, { materialId: 'genesis_ember', amount: 1 }] },
  { id: 'fi_wpn_reality_blade', name: 'Reality Blade', description: 'A sword made from a Reality Shard that exists partially in another dimension. It can cut through anything, including concepts like distance.', rarity: 'legendary', baseDamage: 145, specialEffect: 'Dimensional Cut: Hit any target regardless of distance', requiredMaterials: [{ materialId: 'reality_shard', amount: 2 }, { materialId: 'ancient_fire_rune', amount: 2 }] },
  { id: 'fi_wpn_primordial_fire_staff', name: 'Primordial Fire Staff', description: 'A staff containing the original fire from the island creation. Wielding it grants command over all fire on the island.', rarity: 'legendary', baseDamage: 140, specialEffect: 'All-Fire Command: Control all flames in zone', requiredMaterials: [{ materialId: 'primordial_fire_ore', amount: 3 }, { materialId: 'ash_amber', amount: 2 }] },
  { id: 'fi_wpn_amber_warhammer', name: 'Amber Warhammer', description: 'A warhammer with a head of ancient ash amber. Each impact releases prehistoric fire creatures preserved within to fight alongside you.', rarity: 'legendary', baseDamage: 135, specialEffect: 'Ancient Summon: Release 3 fire creatures per hit', requiredMaterials: [{ materialId: 'ash_amber', amount: 3 }, { materialId: 'genesis_ember', amount: 2 }] },
  { id: 'fi_wpn_volcano_crown', name: 'Volcano Crown', description: 'Not a weapon but a crown forged from every legendary material. Wearing it grants mastery over the entire volcanic island and all its inhabitants.', rarity: 'legendary', baseDamage: 0, specialEffect: 'Island Mastery: +100% all stats, all beasts loyal', requiredMaterials: [{ materialId: 'core_magma', amount: 1 }, { materialId: 'reality_shard', amount: 1 }, { materialId: 'genesis_ember', amount: 1 }] },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: FI_ERUPTIONS — 12 Volcanic Eruption Events
// ═══════════════════════════════════════════════════════════════════

export const FI_ERUPTIONS: readonly FIEruptionDef[] = [
  { id: 'fi_erupt_steam_vent', name: 'Steam Vent Eruption', description: 'A sudden eruption of superheated steam from underground vents that scalds everything in range and reduces visibility to zero.', severity: 1, duration: 60, effects: ['Reduced visibility', 'Minor burn damage', 'Material collection -50%'] },
  { id: 'fi_erupt_ash_fall', name: 'Ash Fall', description: 'A thick blanket of volcanic ash descends on the island, coating everything in gray powder and making movement difficult.', severity: 2, duration: 120, effects: ['Movement speed -30%', 'Breathing difficulty', 'Ash material bonus +100%'] },
  { id: 'fi_erupt_lava_flow', name: 'Lava Flow', description: 'A river of molten lava breaks through the surface and begins flowing toward inhabited areas, destroying structures in its path.', severity: 3, duration: 180, effects: ['Structure damage over time', 'New lava materials available', 'Zone partially blocked'] },
  { id: 'fi_erupt_fire_storm', name: 'Fire Storm', description: 'A violent storm of fire and lightning sweeps across the island, igniting everything combustible and driving beasts into a frenzy.', severity: 4, duration: 150, effects: ['All beasts enraged', 'Fire damage to exposed units', 'Lava crystal bonus +200%'] },
  { id: 'fi_erupt_pyroclastic', name: 'Pyroclastic Surge', description: 'A devastating surge of superheated gas, ash, and rock fragments races down the volcano slope at incredible speed. Extremely deadly.', severity: 5, duration: 30, effects: ['Massive damage to all in path', 'Zone temporary lockdown', 'Rare material exposure'] },
  { id: 'fi_erupt_magma_chamber', name: 'Magma Chamber Collapse', description: 'The underground magma chamber partially collapses, causing widespread ground instability and opening deep fissures across the island.', severity: 4, duration: 200, effects: ['Random ground cracks', 'New exploration routes open', 'Beast migration event'] },
  { id: 'fi_erupt_gas_eruption', name: 'Toxic Gas Eruption', description: 'Volcanic gases vent from multiple fissures, filling low-lying areas with poisonous fumes that sicken beasts and tamers alike.', severity: 3, duration: 180, effects: ['Poison damage over time', 'Beast loyalty temporarily reduced', 'Gas-resistant material bonus'] },
  { id: 'fi_erupt_volcanic_tremor', name: 'Volcanic Tremor', description: 'A deep earthquake shakes the entire island, triggering secondary eruptions, landslides, and tsunami-like waves of lava in coastal zones.', severity: 4, duration: 90, effects: ['All structures take damage', 'Coastal zone flooded', 'Deep crystal exposure'] },
  { id: 'fi_erupt_phreatic', name: 'Phreatic Explosion', description: 'Groundwater contacts magma, creating a massive steam explosion that launches rocks and debris high into the air, raining destruction below.', severity: 5, duration: 45, effects: ['AoE rock damage', 'Crater formation', 'New mineral deposits revealed'] },
  { id: 'fi_erupt_lava_fountain', name: 'Lava Fountain', description: 'A spectacular fountain of lava shoots hundreds of feet into the air from the main crater, spraying molten rock over a wide area.', severity: 3, duration: 120, effects: ['Intermittent lava rain damage', 'Spectacular magma crystals form', 'Tourism attraction bonus'] },
  { id: 'fi_erupt_submarine', name: 'Submarine Eruption', description: 'An underwater volcanic eruption near the coast generates massive waves and creates a new island of cooling lava offshore.', severity: 5, duration: 300, effects: ['Coastal zone devastated', 'New island zone unlocked', 'Rare sea-fire materials'] },
  { id: 'fi_erupt_caldera', name: 'Caldera Eruption', description: 'The ultimate volcanic event — the main caldera erupts with full force, threatening to destroy the entire island and everything on it.', severity: 8, duration: 600, effects: ['Island-wide threat', 'All zones affected', 'Legendary beast opportunity', 'All structures at risk'] },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: FI_LAVA_FLOW — Zone-specific flow data
// ═══════════════════════════════════════════════════════════════════

export const FI_LAVA_FLOW: Record<string, { flowRate: number; temperature: number; mineralDensity: number }> = {
  smoldering_beach: { flowRate: 2, temperature: 400, mineralDensity: 0.3 },
  cinder_trail: { flowRate: 5, temperature: 600, mineralDensity: 0.5 },
  lava_fields: { flowRate: 15, temperature: 900, mineralDensity: 0.7 },
  obsidian_cliffs: { flowRate: 8, temperature: 800, mineralDensity: 0.9 },
  magma_depths: { flowRate: 25, temperature: 1200, mineralDensity: 0.8 },
  inferno_peak: { flowRate: 30, temperature: 1500, mineralDensity: 0.6 },
  volcano_core: { flowRate: 50, temperature: 3000, mineralDensity: 1.0 },
  ashlands: { flowRate: 0, temperature: 200, mineralDensity: 0.4 },
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: FI_BEAST_EVOLUTION — Beast evolution paths
// ═══════════════════════════════════════════════════════════════════

export interface FIBeastEvolutionDef {
  readonly baseId: string
  readonly evolvedId: string
  readonly requiredLevel: number
  readonly requiredLoyalty: number
  readonly materialCost: { materialId: string; amount: number }[]
  readonly description: string
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: FI_ZONE_SPAWN_TABLES — Zone-specific beast spawn rates
// ═══════════════════════════════════════════════════════════════════

export const FI_ZONE_SPAWN_TABLES: Record<string, { beastId: string; weight: number }[]> = {
  smoldering_beach: [
    { beastId: 'spark_salamander', weight: 30 },
    { beastId: 'ember_imp', weight: 25 },
    { beastId: 'cinder_lizard', weight: 25 },
    { beastId: 'smoke_wisp', weight: 15 },
    { beastId: 'lava_grub', weight: 5 },
  ],
  cinder_trail: [
    { beastId: 'cinder_lizard', weight: 25 },
    { beastId: 'smoke_wisp', weight: 20 },
    { beastId: 'lava_grub', weight: 15 },
    { beastId: 'blaze_fox', weight: 20 },
    { beastId: 'ember_fairy', weight: 15 },
    { beastId: 'ash_salamander_king', weight: 5 },
  ],
  lava_fields: [
    { beastId: 'blaze_fox', weight: 20 },
    { beastId: 'magma_python', weight: 20 },
    { beastId: 'flame_serpent', weight: 25 },
    { beastId: 'lava_shelled_tortoise', weight: 20 },
    { beastId: 'magma_wyrm', weight: 10 },
    { beastId: 'pyro_dragon', weight: 5 },
  ],
  obsidian_cliffs: [
    { beastId: 'flame_serpent', weight: 15 },
    { beastId: 'lava_shelled_tortoise', weight: 20 },
    { beastId: 'inferno_fledgling', weight: 15 },
    { beastId: 'pyro_dragon', weight: 15 },
    { beastId: 'inferno_elemental', weight: 20 },
    { beastId: 'volcano_tortoise', weight: 10 },
    { beastId: 'apocalypse_dragon', weight: 5 },
  ],
  magma_depths: [
    { beastId: 'magma_python', weight: 15 },
    { beastId: 'inferno_elemental', weight: 20 },
    { beastId: 'crimson_salamander', weight: 15 },
    { beastId: 'inferno_salamander_lord', weight: 10 },
    { beastId: 'magma_wyrm', weight: 15 },
    { beastId: 'mantle_wyrm', weight: 10 },
    { beastId: 'blaze_sovereign', weight: 10 },
    { beastId: 'core_magma_leviathan', weight: 5 },
  ],
  inferno_peak: [
    { beastId: 'inferno_fledgling', weight: 10 },
    { beastId: 'blazing_phoenix', weight: 15 },
    { beastId: 'pyro_dragon', weight: 15 },
    { beastId: 'apocalypse_dragon', weight: 15 },
    { beastId: 'solar_phoenix', weight: 15 },
    { beastId: 'primordial_fire_dragon', weight: 10 },
    { beastId: 'eternal_phoenix_empress', weight: 10 },
    { beastId: 'ember_will_o_wisp', weight: 10 },
  ],
  volcano_core: [
    { beastId: 'blaze_sovereign', weight: 10 },
    { beastId: 'solar_phoenix', weight: 10 },
    { beastId: 'mantle_wyrm', weight: 10 },
    { beastId: 'obsidian_fortress_tortoise', weight: 10 },
    { beastId: 'apocalypse_dragon', weight: 10 },
    { beastId: 'primordial_fire_dragon', weight: 15 },
    { beastId: 'eternal_phoenix_empress', weight: 15 },
    { beastId: 'core_magma_leviathan', weight: 10 },
  ],
  ashlands: [
    { beastId: 'ember_imp', weight: 15 },
    { beastId: 'ember_fairy', weight: 15 },
    { beastId: 'ember_spirit', weight: 15 },
    { beastId: 'ember_will_o_wisp', weight: 15 },
    { beastId: 'inferno_salamander_lord', weight: 10 },
    { beastId: 'obsidian_fortress_tortoise', weight: 10 },
    { beastId: 'ember_dreamweaver', weight: 5 },
    { beastId: 'world_burn_salamander', weight: 5 },
  ],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: FI_FORGE_COMBOS — Forge structure synergy bonuses
// ═══════════════════════════════════════════════════════════════════

export const FI_FORGE_COMBOS: readonly {
  readonly id: string
  readonly forgeIds: string[]
  readonly name: string
  readonly description: string
  readonly bonus: string
}[] = [
  {
    id: 'fi_combo_full_smelting',
    forgeIds: ['ember_anvil', 'magma_crucible', 'obsidian_workshop', 'inferno_forge', 'volcano_foundry'],
    name: 'Master Smelting Suite',
    description: 'Having all five smelting forges creates a production pipeline that dramatically increases output quality and speed.',
    bonus: '+50% forge speed, +25% material quality',
  },
  {
    id: 'fi_combo_taming_paradise',
    forgeIds: ['beast_pen', 'flame_incubator', 'loyalty_sanctum', 'magma_bath_house', 'primeval_bestiary'],
    name: 'Beast Paradise Complex',
    description: 'A complete beast management facility that maximizes taming success, loyalty gain, and beast recovery.',
    bonus: '+30% tame chance, +40% loyalty gain, +50% recovery speed',
  },
  {
    id: 'fi_combo_full_defense',
    forgeIds: ['stone_barricade', 'heat_deflector', 'fire_break_trench', 'thermal_dome', 'inferno_bastion'],
    name: 'Island Fortress Network',
    description: 'Layered defensive structures that protect the entire settlement from even the most catastrophic eruptions.',
    bonus: '-50% eruption damage, +75% shield regeneration',
  },
  {
    id: 'fi_combo_resource_empire',
    forgeIds: ['ash_collector', 'magma_pump_station', 'geothermal_well', 'mineral_extractor', 'core_tap'],
    name: 'Resource Empire',
    description: 'A complete resource extraction network that maximizes material yield from every source on the island.',
    bonus: '+60% harvest yield, +100% rare material chance',
  },
  {
    id: 'fi_combo_utility_master',
    forgeIds: ['fire_quench_tank', 'smoke_ventilation', 'heat_shield_generator', 'lava_bridge_builder', 'phoenix_summoning_altar'],
    name: 'Utility Master Suite',
    description: 'Every utility structure working in harmony provides unmatched expedition support and beast management.',
    bonus: '+30% expedition success, -40% blaze damage, free phoenix healing',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 18: ACHIEVEMENT CHECKER HELPER
// ═══════════════════════════════════════════════════════════════════

function fiCheckAchievementCondition(store: FIStoreState, achievementId: string): boolean {
  switch (achievementId) {
    case 'fi_ach_first_tame':
      return store.totalTamed >= 1
    case 'fi_ach_five_tames':
      return store.totalTamed >= 5
    case 'fi_ach_ten_tames':
      return store.tamedBeasts.length >= 10
    case 'fi_ach_all_common':
      return FI_BEASTS.filter((b) => b.rarity === 'common').every(
        (b) => store.tamedBeasts.some((t) => t.beastDefId === b.id)
      )
    case 'fi_ach_all_uncommon':
      return FI_BEASTS.filter((b) => b.rarity === 'uncommon').every(
        (b) => store.tamedBeasts.some((t) => t.beastDefId === b.id)
      )
    case 'fi_ach_first_legendary':
      return store.tamedBeasts.some((t) => {
        const def = FI_BEASTS.find((d) => d.id === t.beastDefId)
        return def && def.rarity === 'legendary'
      })
    case 'fi_ach_first_explore':
      return store.totalExplored >= 1
    case 'fi_ach_all_zones':
      return store.exploredZones.length >= FI_ZONES.length
    case 'fi_ach_first_forge':
      return store.forges.length >= 1
    case 'fi_ach_five_forges':
      return store.forges.filter((f) => f.built).length >= 5
    case 'fi_ach_max_forge':
      return store.forges.some((f) => f.level >= 10)
    case 'fi_ach_first_weapon':
      return store.totalForged >= 1
    case 'fi_ach_ten_weapons':
      return store.forgedWeapons.length >= 10
    case 'fi_ach_first_eruption':
      return store.totalEruptionsHandled >= 1
    case 'fi_ach_ten_eruptions':
      return store.totalEruptionsHandled >= 10
    case 'fi_ach_first_phoenix':
      return store.totalPhoenixSummoned >= 1
    case 'fi_ach_max_level':
      return store.isleLevel >= FI_MAX_LEVEL
    case 'fi_ach_hundred_harvest':
      return store.totalHarvested >= 100
    default:
      return false
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 19: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

const useFIStore = create<FIFullStore>()(
  persist(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────
      tamedBeasts: [],
      collectedMaterials: {},
      forges: [],
      achievements: [],
      currentTitle: 'fi_title_spark_scout',
      forgedWeapons: [],
      exploredZones: [],
      isleLevel: 1,
      isleExp: 0,
      gold: FI_INITIAL_GOLD,
      magmaEnergy: FI_INITIAL_ENERGY,
      totalTamed: 0,
      totalForged: 0,
      totalExplored: 0,
      totalHarvested: 0,
      totalEruptionsHandled: 0,
      totalPhoenixSummoned: 0,
      activeEruptionId: null,
      eruptionTimer: 0,
      island: {
        shieldHP: 100,
        maxShieldHP: 100,
        blazeIntensity: 0,
        lastEruptionAt: null,
      },
      activeZoneId: null,

      // ── Actions ─────────────────────────────────────────────
      fiExploreZone: (zoneId: string): boolean => {
        const state = get()
        const zone = FI_ZONES.find((z) => z.id === zoneId)
        if (!zone) return false
        if (state.isleLevel < zone.minLevel) return false
        if (state.exploredZones.includes(zoneId)) return false
        if (state.gold < 50) return false

        const xpGain = zone.dangerLevel * 25 + 10
        const goldReward = zone.dangerLevel * 20

        set({
          exploredZones: [...state.exploredZones, zoneId],
          activeZoneId: zoneId,
          isleExp: state.isleExp + xpGain,
          gold: state.gold - 50 + goldReward,
          totalExplored: state.totalExplored + 1,
        })

        const newState = get()
        const neededXp = fiXpForLevel(newState.isleLevel)
        if (neededXp > 0 && newState.isleExp >= neededXp && newState.isleLevel < FI_MAX_LEVEL) {
          set({
            isleLevel: newState.isleLevel + 1,
            isleExp: newState.isleExp - neededXp,
            magmaEnergy: newState.magmaEnergy + 10,
          })
        }

        return true
      },

      fiTameBeast: (beastId: string): boolean => {
        const state = get()
        const beastDef = FI_BEASTS.find((b) => b.id === beastId)
        if (!beastDef) return false
        if (state.tamedBeasts.some((b) => b.beastDefId === beastId)) return false

        const cost = Math.floor(15 * fiRarityMultiplier(beastDef.rarity))
        if (state.magmaEnergy < cost) return false

        const tameChance = fiGetTameChance(beastDef.rarity, state.activeZoneId)
        if (Math.random() * 100 > tameChance) return false

        const newBeast: FITamedBeast = {
          id: fiGenerateId(),
          beastDefId: beastId,
          name: beastDef.name,
          level: 1,
          currentHP: 50 + beastDef.basePower,
          maxHP: 50 + beastDef.basePower,
          power: beastDef.basePower,
          loyalty: 50,
          acquiredAt: Date.now(),
        }

        const xpGain = Math.floor(beastDef.basePower * fiRarityMultiplier(beastDef.rarity))

        set({
          tamedBeasts: [...state.tamedBeasts, newBeast],
          magmaEnergy: state.magmaEnergy - cost,
          isleExp: state.isleExp + xpGain,
          totalTamed: state.totalTamed + 1,
        })

        return true
      },

      fiForgeWeapon: (weaponId: string): boolean => {
        const state = get()
        const weaponDef = FI_WEAPONS.find((w) => w.id === weaponId)
        if (!weaponDef) return false
        if (state.forgedWeapons.includes(weaponId)) return false

        const forgeCost = Math.floor(50 * fiRarityMultiplier(weaponDef.rarity))
        if (state.gold < forgeCost) return false

        const canAffordMaterials = weaponDef.requiredMaterials.every((req) => {
          const owned = state.collectedMaterials[req.materialId] || 0
          return owned >= req.amount
        })
        if (!canAffordMaterials) return false

        const newMaterials = { ...state.collectedMaterials }
        for (const req of weaponDef.requiredMaterials) {
          newMaterials[req.materialId] = (newMaterials[req.materialId] || 0) - req.amount
        }

        const xpGain = Math.floor(weaponDef.baseDamage * fiRarityMultiplier(weaponDef.rarity))

        set({
          forgedWeapons: [...state.forgedWeapons, weaponId],
          gold: state.gold - forgeCost,
          collectedMaterials: newMaterials,
          isleExp: state.isleExp + xpGain,
          totalForged: state.totalForged + 1,
        })

        return true
      },

      fiUseAbility: (abilityId: string): boolean => {
        const state = get()
        const abilityDef = FI_ABILITIES.find((a) => a.id === abilityId)
        if (!abilityDef) return false
        if (state.magmaEnergy < abilityDef.cooldown) return false

        set({
          magmaEnergy: state.magmaEnergy - abilityDef.cooldown,
          isleExp: state.isleExp + Math.floor(abilityDef.power * 0.5),
        })

        return true
      },

      fiHandleEruption: (eruptionId: string): boolean => {
        const state = get()
        if (state.activeEruptionId) return false

        const eruptionDef = FI_ERUPTIONS.find((e) => e.id === eruptionId)
        if (!eruptionDef) return false

        const shieldDamage = eruptionDef.severity * 15
        const goldReward = eruptionDef.severity * 100
        const xpReward = eruptionDef.severity * 50

        const newShieldHP = Math.max(0, state.island.shieldHP - shieldDamage)

        set({
          activeEruptionId: eruptionId,
          eruptionTimer: eruptionDef.duration,
          gold: state.gold + goldReward,
          isleExp: state.isleExp + xpReward,
          totalEruptionsHandled: state.totalEruptionsHandled + 1,
          island: {
            ...state.island,
            shieldHP: newShieldHP,
            blazeIntensity: Math.min(100, state.island.blazeIntensity + eruptionDef.severity * 10),
            lastEruptionAt: Date.now(),
          },
        })

        return true
      },

      fiHarvestMagma: (materialId: string): number => {
        const state = get()
        const materialDef = FI_MATERIALS.find((m) => m.id === materialId)
        if (!materialDef) return 0
        if (state.magmaEnergy < 5) return 0

        const zoneBonus = state.activeZoneId ? (FI_LAVA_FLOW[state.activeZoneId]?.mineralDensity || 0.5) : 0.5
        const amount = Math.floor(Math.random() * 3 + 1 + zoneBonus * 2)
        const rarityBonus = fiRarityMultiplier(materialDef.rarity)
        const finalAmount = Math.max(1, Math.floor(amount / rarityBonus))

        const newMaterials = {
          ...state.collectedMaterials,
          [materialId]: (state.collectedMaterials[materialId] || 0) + finalAmount,
        }

        set({
          collectedMaterials: newMaterials,
          magmaEnergy: state.magmaEnergy - 5,
          totalHarvested: state.totalHarvested + finalAmount,
          isleExp: state.isleExp + finalAmount * 2,
        })

        return finalAmount
      },

      fiBuildForge: (forgeDefId: string): boolean => {
        const state = get()
        const forgeDef = FI_FORGES.find((f) => f.id === forgeDefId)
        if (!forgeDef) return false
        if (state.gold < forgeDef.baseCost) return false
        if (state.forges.some((f) => f.forgeDefId === forgeDefId)) return false

        const newForge: FIOwnedForge = {
          id: fiGenerateId(),
          forgeDefId: forgeDefId,
          level: 1,
          built: true,
        }

        set({
          forges: [...state.forges, newForge],
          gold: state.gold - forgeDef.baseCost,
          isleExp: state.isleExp + 20,
        })

        return true
      },

      fiUpgradeForge: (forgeId: string): boolean => {
        const state = get()
        const forge = state.forges.find((f) => f.id === forgeId)
        if (!forge) return false
        if (forge.level >= 10) return false

        const forgeDef = FI_FORGES.find((d) => d.id === forge.forgeDefId)
        if (!forgeDef) return false

        const upgradeCost = Math.floor(forgeDef.baseCost * Math.pow(forgeDef.costMultiplier, forge.level))
        if (state.gold < upgradeCost) return false

        const updatedForges = state.forges.map((f) => {
          if (f.id === forgeId) {
            return { ...f, level: f.level + 1 }
          }
          return f
        })

        set({
          forges: updatedForges,
          gold: state.gold - upgradeCost,
          isleExp: state.isleExp + forge.level * 15,
        })

        return true
      },

      fiExtinguishBlaze: (amount: number): boolean => {
        const state = get()
        if (state.island.blazeIntensity <= 0) return false
        if (state.magmaEnergy < amount) return false

        const newIntensity = Math.max(0, state.island.blazeIntensity - amount * 5)

        set({
          magmaEnergy: state.magmaEnergy - amount,
          island: { ...state.island, blazeIntensity: newIntensity },
        })

        return true
      },

      fiSummonPhoenix: (_targetId: string): boolean => {
        const state = get()
        if (state.magmaEnergy < 50) return false

        const hasPhoenix = state.tamedBeasts.some((t) => {
          const def = FI_BEASTS.find((d) => d.id === t.beastDefId)
          return def && def.species === 'Phoenix'
        })
        if (!hasPhoenix) return false

        set({
          magmaEnergy: state.magmaEnergy - 50,
          totalPhoenixSummoned: state.totalPhoenixSummoned + 1,
          island: {
            ...state.island,
            shieldHP: Math.min(state.island.maxShieldHP, state.island.shieldHP + 30),
          },
          isleExp: state.isleExp + 100,
        })

        return true
      },

      fiActivateShield: (duration: number): boolean => {
        const state = get()
        if (state.magmaEnergy < 30) return false
        if (state.island.shieldHP >= state.island.maxShieldHP) return false

        const shieldBoost = Math.min(duration * 2, state.island.maxShieldHP - state.island.shieldHP)

        set({
          magmaEnergy: state.magmaEnergy - 30,
          island: {
            ...state.island,
            shieldHP: state.island.shieldHP + shieldBoost,
          },
        })

        return true
      },

      fiUnlockTitle: (titleId: string): boolean => {
        const state = get()
        const titleDef = FI_TITLES.find((t) => t.id === titleId)
        if (!titleDef) return false
        if (state.currentTitle === titleId) return false
        if (state.isleLevel < titleDef.requiredLevel) return false
        if (state.exploredZones.length < titleDef.requiredExplored) return false

        set({ currentTitle: titleId })
        return true
      },

      fiClaimAchievement: (achievementId: string): boolean => {
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!fiCheckAchievementCondition(state, achievementId)) return false

        set({
          achievements: [...state.achievements, achievementId],
          gold: state.gold + 100,
          isleExp: state.isleExp + 50,
        })

        return true
      },
    }),
    {
      name: 'fire-isle-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 20: HOOK — useFireIsle
// ═══════════════════════════════════════════════════════════════════

export default function useFireIsle() {
  const store = useFIStore()

  // ── Getter: Zone Details ─────────────────────────────────────
  const fiGetZoneDetails = useMemo(() => {
    return FI_ZONES.map((zone) => ({
      ...zone,
      explored: store.exploredZones.includes(zone.id),
      unlocked: store.isleLevel >= zone.minLevel,
      active: store.activeZoneId === zone.id,
      flowData: FI_LAVA_FLOW[zone.id] || { flowRate: 0, temperature: 0, mineralDensity: 0 },
      availableMaterials: zone.resources
        .map((rId) => FI_MATERIALS.find((m) => m.id === rId))
        .filter(Boolean),
    }))
  }, [store])

  // ── Getter: Material Inventory ───────────────────────────────
  const fiGetMaterialInventory = useMemo(() => {
    return FI_MATERIALS.map((mat) => ({
      ...mat,
      owned: store.collectedMaterials[mat.id] || 0,
      rarityColor: fiRarityColor(mat.rarity),
    }))
  }, [store])

  // ── Getter: Tamed Beasts ─────────────────────────────────────
  const fiGetTamedBeasts = useMemo(() => {
    return store.tamedBeasts.map((b) => {
      const def = FI_BEASTS.find((d) => d.id === b.beastDefId)
      return {
        ...b,
        def,
        speciesColor: def ? fiSpeciesColor(def.species) : FI_COLOR_ASH_GRAY,
        rarityColor: def ? fiRarityColor(def.rarity) : '#9CA3AF',
        totalPower: Math.floor(
          b.power * fiRarityMultiplier(def ? def.rarity : 'common') * (1 + b.level * 0.12) * (1 + b.loyalty * 0.005)
        ),
        loyaltyTier: b.loyalty >= 90 ? 'devoted' : b.loyalty >= 70 ? 'loyal' : b.loyalty >= 50 ? 'friendly' : 'wary',
      }
    })
  }, [store])

  // ── Getter: Forge List ───────────────────────────────────────
  const fiGetForgeList = useMemo(() => {
    return store.forges.map((f) => {
      const def = FI_FORGES.find((d) => d.id === f.forgeDefId)
      return {
        ...f,
        def,
        upgradeCost: def
          ? Math.floor(def.baseCost * Math.pow(def.costMultiplier, f.level))
          : 0,
        maxed: f.level >= 10,
        forgeBonus: fiGetForgeBonus(f.forgeDefId, f.level),
      }
    })
  }, [store])

  // ── Getter: Total Power ──────────────────────────────────────
  const fiGetTotalPower = useMemo(() => {
    let beastPower = 0
    for (const b of store.tamedBeasts) {
      const def = FI_BEASTS.find((d) => d.id === b.beastDefId)
      if (!def) continue
      const rarityMult = fiRarityMultiplier(def.rarity)
      beastPower += Math.floor(
        b.power * rarityMult * (1 + b.level * 0.12) * (1 + b.loyalty * 0.005)
      )
    }
    const forgePower = store.forges.reduce(
      (sum, f) => sum + fiGetForgeBonus(f.forgeDefId, f.level),
      0
    )
    const weaponPower = store.forgedWeapons.reduce((sum, wId) => {
      const weapon = FI_WEAPONS.find((w) => w.id === wId)
      return sum + (weapon ? weapon.baseDamage : 0)
    }, 0)
    return { beastPower, forgePower, weaponPower, total: beastPower + forgePower + weaponPower }
  }, [store])

  // ── Getter: Eruption Status ──────────────────────────────────
  const fiGetEruptionStatus = useMemo(() => {
    if (!store.activeEruptionId) {
      return { active: false, event: null, timer: 0, severity: 0 }
    }
    const event = FI_ERUPTIONS.find((e) => e.id === store.activeEruptionId)
    return {
      active: true,
      event: event || null,
      timer: store.eruptionTimer,
      severity: event ? event.severity : 0,
    }
  }, [store.activeEruptionId, store.eruptionTimer])

  // ── Getter: Active Eruption ──────────────────────────────────
  const fiGetActiveEruption = useMemo(() => {
    if (!store.activeEruptionId) return null
    return FI_ERUPTIONS.find((e) => e.id === store.activeEruptionId) || null
  }, [store.activeEruptionId])

  // ── Getter: Next Title ───────────────────────────────────────
  const fiGetNextTitle = useMemo(() => {
    const currentTitle = FI_TITLES.find((t) => t.id === store.currentTitle)
    const currentIndex = currentTitle
      ? FI_TITLES.indexOf(currentTitle)
      : -1
    if (currentIndex >= FI_TITLES.length - 1) return null
    return FI_TITLES[currentIndex + 1]
  }, [store.currentTitle])

  // ── Getter: Rarity Summary ───────────────────────────────────
  const fiGetRaritySummary = useMemo(() => {
    const summary: Record<FIRarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const b of store.tamedBeasts) {
      const def = FI_BEASTS.find((d) => d.id === b.beastDefId)
      if (def) {
        summary[def.rarity] += 1
      }
    }
    for (const wId of store.forgedWeapons) {
      const weapon = FI_WEAPONS.find((w) => w.id === wId)
      if (weapon) {
        summary[weapon.rarity] += 1
      }
    }
    return summary
  }, [store])

  // ── Getter: Zone Summary ─────────────────────────────────────
  const fiGetZoneSummary = useMemo(() => {
    const totalZones = FI_ZONES.length
    const explored = store.exploredZones.length
    return {
      totalZones,
      explored,
      percent: Math.floor((explored / totalZones) * 100),
      allExplored: explored >= totalZones,
    }
  }, [store.exploredZones])

  // ── Getter: Unlocked Achievements ────────────────────────────
  const fiGetUnlockedAchievements = useMemo(() => {
    const unlocked: FIAchievementDef[] = []
    const claimable: FIAchievementDef[] = []

    for (const ach of FI_ACHIEVEMENTS) {
      if (store.achievements.includes(ach.id)) {
        unlocked.push(ach)
      } else if (fiCheckAchievementCondition(store, ach.id)) {
        claimable.push(ach)
      }
    }

    return { unlocked, claimable, total: FI_ACHIEVEMENTS.length, progress: unlocked.length }
  }, [store])

  // ── Getter: Title Progress ───────────────────────────────────
  const fiGetTitleProgress = useMemo(() => {
    return FI_TITLES.map((title) => ({
      ...title,
      unlocked:
        store.isleLevel >= title.requiredLevel &&
        store.exploredZones.length >= title.requiredExplored,
      active: store.currentTitle === title.id,
      levelMet: store.isleLevel >= title.requiredLevel,
      exploreMet: store.exploredZones.length >= title.requiredExplored,
    }))
  }, [store.currentTitle, store.isleLevel, store.exploredZones])

  // ── Getter: Forged Weapons Detail ────────────────────────────
  const fiGetForgedWeapons = useMemo(() => {
    return FI_WEAPONS.map((weapon) => ({
      ...weapon,
      forged: store.forgedWeapons.includes(weapon.id),
      canAfford: weapon.requiredMaterials.every((req) => {
        const owned = store.collectedMaterials[req.materialId] || 0
        return owned >= req.amount
      }),
      canForge: !store.forgedWeapons.includes(weapon.id) &&
        weapon.requiredMaterials.every((req) => {
          const owned = store.collectedMaterials[req.materialId] || 0
          return owned >= req.amount
        }) &&
        store.gold >= Math.floor(50 * fiRarityMultiplier(weapon.rarity)),
      rarityColor: fiRarityColor(weapon.rarity),
    }))
  }, [store])

  // ── Getter: Beast Taming Costs ───────────────────────────────
  const fiGetTamingCosts = useMemo(() => {
    return FI_BEASTS.filter(
      (b) => !store.tamedBeasts.some((t) => t.beastDefId === b.id)
    ).map((beast) => ({
      ...beast,
      tameCost: Math.floor(15 * fiRarityMultiplier(beast.rarity)),
      canAfford: store.magmaEnergy >= Math.floor(15 * fiRarityMultiplier(beast.rarity)),
      speciesColor: fiSpeciesColor(beast.species),
      rarityColor: fiRarityColor(beast.rarity),
      tameChance: fiGetTameChance(beast.rarity, store.activeZoneId),
    }))
  }, [store])

  // ── Getter: Ability List ─────────────────────────────────────
  const fiGetAbilityList = useMemo(() => {
    return FI_ABILITIES.map((ability) => ({
      ...ability,
      canUse: store.magmaEnergy >= ability.cooldown,
      elementColor: fiElementColor(ability.element),
    }))
  }, [store.magmaEnergy])

  // ── Getter: Event List ───────────────────────────────────────
  const fiGetEventList = useMemo(() => {
    return FI_ERUPTIONS.map((event) => ({
      ...event,
      canTrigger: store.activeEruptionId === null,
      isActive: store.activeEruptionId === event.id,
    }))
  }, [store.activeEruptionId])

  // ── Getter: Island Health ────────────────────────────────────
  const fiGetIslandHealth = useMemo(() => {
    const { shieldHP, maxShieldHP, blazeIntensity, lastEruptionAt } = store.island
    return {
      shieldHP,
      maxShieldHP,
      blazeIntensity,
      shieldPercent: Math.floor((shieldHP / maxShieldHP) * 100),
      isUnderThreat: blazeIntensity > 50,
      isCritical: shieldHP < maxShieldHP * 0.25,
      lastEruptionAt,
    }
  }, [store.island])

  // ── Level Progress ───────────────────────────────────────────
  const fiLevelProgress = useMemo(() => {
    const current = fiXpForLevel(store.isleLevel)
    return {
      level: store.isleLevel,
      currentXp: store.isleExp,
      xpToNext: current,
      maxLevel: store.isleLevel >= FI_MAX_LEVEL,
      progressPercent:
        current > 0 ? Math.min(100, Math.floor((store.isleExp / current) * 100)) : 0,
    }
  }, [store.isleLevel, store.isleExp])

  // ── Getter: Stats Summary + Beast Count By Species (merged) ──
  const { fiGetStatsSummary, fiGetBeastCountBySpecies } = useMemo(() => {
    const beastCountBySpecies: Record<FISpecies, number> = {
      Phoenix: 0,
      Dragon: 0,
      Salamander: 0,
      'Fire Elemental': 0,
      'Magma Worm': 0,
      'Ember Sprite': 0,
      'Inferno Turtle': 0,
    }
    for (const b of store.tamedBeasts) {
      const def = FI_BEASTS.find((d) => d.id === b.beastDefId)
      if (def) {
        beastCountBySpecies[def.species] += 1
      }
    }

    const statsSummary = {
      totalBeasts: store.tamedBeasts.length,
      totalMaterials: Object.values(store.collectedMaterials).reduce((s, v) => s + v, 0),
      totalForges: store.forges.length,
      totalWeapons: store.forgedWeapons.length,
      totalZonesExplored: store.exploredZones.length,
      avgBeastLevel:
        store.tamedBeasts.length > 0
          ? Math.floor(
              store.tamedBeasts.reduce((s, b) => s + b.level, 0) / store.tamedBeasts.length
            )
          : 0,
      totalTamed: store.totalTamed,
      totalHarvested: store.totalHarvested,
      totalEruptionsHandled: store.totalEruptionsHandled,
      totalPhoenixSummoned: store.totalPhoenixSummoned,
    }

    return { fiGetStatsSummary: statsSummary, fiGetBeastCountBySpecies: beastCountBySpecies }
  }, [store])

  // ── Getter: Upgrade Costs ────────────────────────────────────
  const fiGetUpgradeCosts = useMemo(() => {
    return store.forges.map((f) => {
      const def = FI_FORGES.find((d) => d.id === f.forgeDefId)
      if (!def) return { ...f, nextCost: 0, maxed: f.level >= 10 }
      const nextCost = f.level >= 10 ? 0 : Math.floor(def.baseCost * Math.pow(def.costMultiplier, f.level))
      return { ...f, def, nextCost, maxed: f.level >= 10 }
    })
  }, [store.forges])

  // ── Getter: Tame Bonus ───────────────────────────────────────
  const fiGetTameBonus = useMemo(() => {
    let totalAttackBonus = 0
    let totalDefenseBonus = 0
    let totalLoyaltyBonus = 0
    for (const b of store.tamedBeasts) {
      const def = FI_BEASTS.find((d) => d.id === b.beastDefId)
      if (def) {
        const bonus = fiGetSpeciesBonus(def.species)
        totalAttackBonus += bonus.attack
        totalDefenseBonus += bonus.defense
        totalLoyaltyBonus += bonus.loyaltyBonus
      }
    }
    return {
      totalAttackBonus,
      totalDefenseBonus,
      totalLoyaltyBonus,
      beastCount: store.tamedBeasts.length,
    }
  }, [store.tamedBeasts])

  // ── Getter: Zone Materials ───────────────────────────────────
  const fiGetZoneMaterials = useMemo(() => {
    if (!store.activeZoneId) return { materials: [], bonusMaterials: [] }
    const zone = FI_ZONES.find((z) => z.id === store.activeZoneId)
    if (!zone) return { materials: [], bonusMaterials: [] }

    const materials = zone.resources
      .map((mId) => FI_MATERIALS.find((m) => m.id === mId))
      .filter((m): m is FIMaterialDef => m !== undefined)

    return { materials, bonusMaterials: [] }
  }, [store.activeZoneId])

  // ── Getter: Magma Energy Efficiency ──────────────────────────
  const fiGetMagmaEfficiency = useMemo(() => {
    const forgeBonus = store.forges.reduce((sum, f) => {
      return sum + fiGetForgeBonus(f.forgeDefId, f.level)
    }, 0)
    const beastBonus = store.tamedBeasts.reduce((sum, b) => {
      const def = FI_BEASTS.find((d) => d.id === b.beastDefId)
      return sum + (def ? Math.floor(def.basePower * 0.1) : 0)
    }, 0)
    return {
      baseRegen: 1,
      forgeBonus,
      beastBonus,
      totalRegen: 1 + forgeBonus + beastBonus,
    }
  }, [store])

  // ── Assemble fiAPI ───────────────────────────────────────────
  const fiAPI = {
    // Constants
    FI_BEASTS,
    FI_ZONES,
    FI_MATERIALS,
    FI_FORGES,
    FI_ABILITIES,
    FI_ACHIEVEMENTS,
    FI_TITLES,
    FI_WEAPONS,
    FI_ERUPTIONS,
    FI_LAVA_FLOW,
    FI_ZONE_SPAWN_TABLES,
    FI_FORGE_COMBOS,
    FI_COLOR_LAVA_RED,
    FI_COLOR_INFERNO_ORANGE,
    FI_COLOR_MAGMA_YELLOW,
    FI_COLOR_VOLCANIC_BLACK,
    FI_COLOR_ASH_GRAY,
    FI_COLOR_FIRE_GOLD,
    FI_COLOR_EMBER_PURPLE,
    FI_COLOR_SMOKE_WHITE,

    // State
    tamedBeasts: store.tamedBeasts,
    collectedMaterials: store.collectedMaterials,
    forges: store.forges,
    achievements: store.achievements,
    currentTitle: store.currentTitle,
    forgedWeapons: store.forgedWeapons,
    exploredZones: store.exploredZones,
    isleLevel: store.isleLevel,
    isleExp: store.isleExp,
    gold: store.gold,
    magmaEnergy: store.magmaEnergy,
    totalTamed: store.totalTamed,
    totalForged: store.totalForged,
    totalExplored: store.totalExplored,
    totalHarvested: store.totalHarvested,
    totalEruptionsHandled: store.totalEruptionsHandled,
    totalPhoenixSummoned: store.totalPhoenixSummoned,
    activeEruptionId: store.activeEruptionId,
    eruptionTimer: store.eruptionTimer,
    island: store.island,
    activeZoneId: store.activeZoneId,

    // Actions
    fiExploreZone: store.fiExploreZone,
    fiTameBeast: store.fiTameBeast,
    fiForgeWeapon: store.fiForgeWeapon,
    fiUseAbility: store.fiUseAbility,
    fiHandleEruption: store.fiHandleEruption,
    fiHarvestMagma: store.fiHarvestMagma,
    fiBuildForge: store.fiBuildForge,
    fiUpgradeForge: store.fiUpgradeForge,
    fiExtinguishBlaze: store.fiExtinguishBlaze,
    fiSummonPhoenix: store.fiSummonPhoenix,
    fiActivateShield: store.fiActivateShield,
    fiUnlockTitle: store.fiUnlockTitle,
    fiClaimAchievement: store.fiClaimAchievement,

    // Getters
    fiGetZoneDetails,
    fiGetMaterialInventory,
    fiGetTamedBeasts,
    fiGetForgeList,
    fiGetTotalPower,
    fiGetEruptionStatus,
    fiGetActiveEruption,
    fiGetNextTitle,
    fiGetRaritySummary,
    fiGetZoneSummary,
    fiGetUnlockedAchievements,
    fiGetTitleProgress,
    fiGetForgedWeapons,
    fiGetTamingCosts,
    fiGetAbilityList,
    fiGetEventList,
    fiGetIslandHealth,
    fiLevelProgress,
    fiGetStatsSummary,
    fiGetBeastCountBySpecies,
    fiGetUpgradeCosts,
    fiGetTameBonus,
    fiGetZoneMaterials,
    fiGetMagmaEfficiency,
  }

  return fiAPI
}
