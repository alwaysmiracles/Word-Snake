/**
 * Dragon Roost Wire — 龙族巢穴 (Dragon Roost) feature module for Word Snake
 *
 * A comprehensive dragon husbandry mini-game: hatch eggs, raise dragons,
 * battle in arenas, collect treasures, upgrade nest structures, and
 * ascend through legendary titles — backed by a Zustand store with
 * persist middleware.
 *
 * Storage key: ws_dragon_roost
 * Prefix: dr / DR_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type DRElement =
  | 'fire'
  | 'ice'
  | 'lightning'
  | 'shadow'
  | 'crystal'
  | 'storm'
  | 'nature'
  | 'arcane'

export type DRRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface DRElementDef {
  readonly id: DRElement
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface DRDragonSpecies {
  readonly id: string
  readonly name: string
  readonly element: DRElement
  readonly rarity: DRRarity
  readonly hp: number
  readonly attack: number
  readonly defense: number
  readonly speed: number
  readonly description: string
  readonly abilities: string[]
}

export interface DRDragonInstance {
  readonly id: string
  speciesId: string
  name: string
  level: number
  xp: number
  currentHP: number
  maxHP: number
  attack: number
  defense: number
  speed: number
  mood: number
  hunger: number
  trainedCount: number
}

export interface DRNestDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly element: DRElement
  readonly unlockLevel: number
  readonly baseCapacity: number
}

export interface DRNestInstance {
  readonly id: string
  nestDefId: string
  name: string
  dragonIds: string[]
  level: number
  comfort: number
}

export interface DRTreasureDef {
  readonly id: string
  readonly name: string
  readonly rarity: DRRarity
  readonly value: number
  readonly description: string
  readonly element: DRElement
}

export interface DRStructureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly upgradeCostMultiplier: number
}

export interface DRStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  built: boolean
}

export interface DRAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly element: DRElement
  readonly cooldown: number
  readonly power: number
}

export interface DRAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
}

export interface DRTitleDef {
  readonly id: string
  readonly name: string
  readonly requiredLevel: number
  readonly description: string
}

export interface DREggTypeDef {
  readonly id: string
  readonly name: string
  readonly element: DRElement
  readonly rarity: DRRarity
  readonly hatchTime: number
  readonly description: string
}

export interface DREggInstance {
  readonly id: string
  eggTypeId: string
  startedAt: number
  progress: number
  hatched: boolean
}

export interface DRFeedItemDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly nutrition: number
  readonly elementAffinity: DRElement | 'neutral'
  readonly cost: number
}

export interface DRBattleResult {
  winnerId: string
  loserId: string
  rounds: number
  goldReward: number
  xpReward: number
}

export interface DRStoreState {
  dragons: DRDragonInstance[]
  eggs: DREggInstance[]
  nests: DRNestInstance[]
  treasures: string[]
  structures: DRStructureInstance[]
  dragonFood: number
  gold: number
  dragonExp: number
  dragonLevel: number
  achievements: string[]
  currentTitle: string
  totalHatches: number
  totalFeeds: number
  totalBattles: number
  activeNestId: string | null
  incubatorSlots: number
}

export interface DRStoreActions {
  drAcquireDragon: (dragonId: string) => boolean
  drReleaseDragon: (dragonId: string) => boolean
  drHatchEgg: (eggTypeId: string) => boolean
  drAccelerateHatch: (eggInstanceId: string) => boolean
  drFeedDragon: (dragonInstanceId: string, feedItemId: string) => boolean
  drUpgradeStructure: (structInstanceId: string) => boolean
  drBuildStructure: (structDefId: string) => boolean
  drDemolishStructure: (structInstanceId: string) => boolean
  drCollectTreasure: (treasureId: string) => boolean
  drSellTreasure: (treasureId: string) => number
  drSetNest: (nestId: string | null) => void
  drExpandIncubator: () => boolean
  drDragonBattle: (dragonAId: string, dragonBId: string) => DRBattleResult | null
  drTrainDragon: (dragonInstanceId: string) => boolean
  drUnlockTitle: (titleId: string) => boolean
  drClaimAchievement: (achievementId: string) => boolean
  drBuyFeed: (count: number) => boolean
  drGatherGold: () => number
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const DR_COLOR_FIRE: string = '#FF4500'
export const DR_COLOR_ICE: string = '#00BFFF'
export const DR_COLOR_LIGHTNING: string = '#FFD700'
export const DR_COLOR_SHADOW: string = '#4B0082'
export const DR_COLOR_CRYSTAL: string = '#E0FFFF'
export const DR_COLOR_STORM: string = '#708090'
export const DR_COLOR_NATURE: string = '#228B22'
export const DR_COLOR_ARCANE: string = '#9400D3'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: DR_ELEMENTS — 8 Dragon Elements
// ═══════════════════════════════════════════════════════════════════

export const DR_ELEMENTS: readonly DRElementDef[] = [
  {
    id: 'fire',
    name: 'Fire',
    color: DR_COLOR_FIRE,
    description:
      'The primal flame that burns within the heart of every fire dragon. Masters of destruction and passion, fire dragons channel searing heat through breath, claws, and tail.',
  },
  {
    id: 'ice',
    name: 'Ice',
    color: DR_COLOR_ICE,
    description:
      'Cold as the eternal glaciers, ice dragons command frost and blizzards. Their scales shimmer like frozen starlight, and their breath can crystallize anything in an instant.',
  },
  {
    id: 'lightning',
    name: 'Lightning',
    color: DR_COLOR_LIGHTNING,
    description:
      'Born from thunderstorms that rage across the highest peaks, lightning dragons are the fastest of all. Electricity arcs between their scales and illuminates the dark.',
  },
  {
    id: 'shadow',
    name: 'Shadow',
    color: DR_COLOR_SHADOW,
    description:
      'Dwelling between dimensions, shadow dragons draw power from darkness and the void. They can phase through solid matter and strike from angles no opponent expects.',
  },
  {
    id: 'crystal',
    name: 'Crystal',
    color: DR_COLOR_CRYSTAL,
    description:
      'Living jewels whose bodies are made of enchanted gemstone, crystal dragons refract light into dazzling prisms. Their crystalline armor offers unmatched natural defense.',
  },
  {
    id: 'storm',
    name: 'Storm',
    color: DR_COLOR_STORM,
    description:
      'Harbingers of tempests and cyclones, storm dragons control wind, rain, and atmospheric pressure. They ride hurricane winds and summon devastating weather at will.',
  },
  {
    id: 'nature',
    name: 'Nature',
    color: DR_COLOR_NATURE,
    description:
      'Guardians of the wild places, nature dragons are bonded to forests, meadows, and all living things. They command vines, roots, and the healing power of the earth.',
  },
  {
    id: 'arcane',
    name: 'Arcane',
    color: DR_COLOR_ARCANE,
    description:
      'Wielders of pure magical energy, arcane dragons exist partially in other planes of existence. Their spells defy physics and bend reality itself to their will.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: DR_DRAGONS — 35 Dragon Species (7 per element, 5 rarities)
// ═══════════════════════════════════════════════════════════════════

export const DR_DRAGONS: readonly DRDragonSpecies[] = [
  // ── Fire Dragons (7) ────────────────────────────────────────────
  {
    id: 'fire_whelp',
    name: 'Ember Whelp',
    element: 'fire',
    rarity: 'common',
    hp: 80,
    attack: 25,
    defense: 12,
    speed: 18,
    description:
      'A small but spirited juvenile fire dragon. Its scales glow like cooling lava, and it sneezes harmless sparks when excited.',
    abilities: ['fire_breath'],
  },
  {
    id: 'fire_drake',
    name: 'Cinder Drake',
    element: 'fire',
    rarity: 'uncommon',
    hp: 120,
    attack: 35,
    defense: 20,
    speed: 22,
    description:
      'A fierce ember-scaled drake found prowling near volcanic vents. Its talons leave scorch marks on stone.',
    abilities: ['fire_breath', 'inferno_fang'],
  },
  {
    id: 'fire_wyrm',
    name: 'Molten Wyrm',
    element: 'fire',
    rarity: 'uncommon',
    hp: 110,
    attack: 32,
    defense: 24,
    speed: 20,
    description:
      'A serpentine dragon that swims through underground lava rivers. Its body temperature exceeds 2000 degrees.',
    abilities: ['fire_breath', 'lava_surge'],
  },
  {
    id: 'fire_dragon',
    name: 'Inferno Dragon',
    element: 'fire',
    rarity: 'rare',
    hp: 160,
    attack: 48,
    defense: 30,
    speed: 26,
    description:
      'A fearsome dragon wreathed in perpetual flame. Entire villages have been evacuated when an Inferno Dragon takes flight.',
    abilities: ['fire_breath', 'inferno_fang', 'flame_shroud'],
  },
  {
    id: 'fire_titan',
    name: 'Pyraxis the Everburning',
    element: 'fire',
    rarity: 'epic',
    hp: 210,
    attack: 58,
    defense: 42,
    speed: 24,
    description:
      'An ancient titan whose flames have burned for a thousand years without fading. Legends say Pyraxis was born when the world itself ignited.',
    abilities: ['fire_breath', 'inferno_fang', 'flame_shroud', 'apocalypse_fire'],
  },
  {
    id: 'fire_phoenix_dragon',
    name: 'Ashclaw Phoenix Wyrm',
    element: 'fire',
    rarity: 'epic',
    hp: 180,
    attack: 62,
    defense: 35,
    speed: 35,
    description:
      'A hybrid of dragon and phoenix that rises from its own ashes. Each resurrection makes it stronger than before.',
    abilities: ['fire_breath', 'inferno_fang', 'phoenix_rebirth'],
  },
  {
    id: 'fire_sovereign',
    name: 'Ignis Draconis — Primordial Flame',
    element: 'fire',
    rarity: 'legendary',
    hp: 280,
    attack: 75,
    defense: 55,
    speed: 32,
    description:
      'The mythical first fire dragon, said to have emerged from the core of a dying star. Its presence alone turns sand to glass.',
    abilities: ['fire_breath', 'inferno_fang', 'flame_shroud', 'apocalypse_fire', 'stellar_ignition'],
  },

  // ── Ice Dragons (7) ─────────────────────────────────────────────
  {
    id: 'ice_whelp',
    name: 'Frostling',
    element: 'ice',
    rarity: 'common',
    hp: 90,
    attack: 18,
    defense: 22,
    speed: 14,
    description:
      'A tiny dragon with translucent blue scales that jingle like glass when it moves. Frostlings love to freeze puddles.',
    abilities: ['ice_shard'],
  },
  {
    id: 'ice_drake',
    name: 'Glacier Drake',
    element: 'ice',
    rarity: 'uncommon',
    hp: 130,
    attack: 28,
    defense: 35,
    speed: 16,
    description:
      'A thick-scaled drake from the deepest glaciers. Its breath can freeze a lake solid in seconds.',
    abilities: ['ice_shard', 'frost_bite'],
  },
  {
    id: 'ice_wyrm',
    name: 'Rime Serpent',
    element: 'ice',
    rarity: 'uncommon',
    hp: 115,
    attack: 30,
    defense: 28,
    speed: 20,
    description:
      'A coiling serpent dragon that leaves trails of sparkling frost wherever it slithers. Silent and deadly.',
    abilities: ['ice_shard', 'rime_coil'],
  },
  {
    id: 'ice_dragon',
    name: 'Blizzard Monarch',
    element: 'ice',
    rarity: 'rare',
    hp: 170,
    attack: 42,
    defense: 48,
    speed: 18,
    description:
      'A massive white dragon that summons eternal blizzards around its lair. Ships that stray too near are found frozen mid-wave.',
    abilities: ['ice_shard', 'frost_bite', 'absolute_freeze'],
  },
  {
    id: 'ice_titan',
    name: 'Cryos the Eternal',
    element: 'ice',
    rarity: 'epic',
    hp: 220,
    attack: 50,
    defense: 58,
    speed: 16,
    description:
      'A primordial ice dragon that has slept since the last Ice Age. Entire mountain ranges are its armor.',
    abilities: ['ice_shard', 'frost_bite', 'absolute_freeze', 'glacial_eruption'],
  },
  {
    id: 'ice_crystal_dragon',
    name: 'Diamondscale Dragon',
    element: 'ice',
    rarity: 'epic',
    hp: 190,
    attack: 45,
    defense: 62,
    speed: 22,
    description:
      'A dragon whose scales are literally made of enchanted diamond. Unbreakable and blindingly beautiful.',
    abilities: ['ice_shard', 'frost_bite', 'diamond_carapace'],
  },
  {
    id: 'ice_sovereign',
    name: 'Nivalis — The Frost Zero',
    element: 'ice',
    rarity: 'legendary',
    hp: 300,
    attack: 60,
    defense: 72,
    speed: 20,
    description:
      'The absolute lord of cold. Where Nivalis flies, temperatures plummet to absolute zero. Even fire dragons shudder at its name.',
    abilities: ['ice_shard', 'frost_bite', 'absolute_freeze', 'glacial_eruption', 'entropic_cold'],
  },

  // ── Lightning Dragons (7) ───────────────────────────────────────
  {
    id: 'lightning_whelp',
    name: 'Sparklet',
    element: 'lightning',
    rarity: 'common',
    hp: 70,
    attack: 22,
    defense: 10,
    speed: 28,
    description:
      'A hyperactive little dragon crackling with static electricity. Its scales emit tiny sparks when petted.',
    abilities: ['static_jolt'],
  },
  {
    id: 'lightning_drake',
    name: 'Thunder Drake',
    element: 'lightning',
    rarity: 'uncommon',
    hp: 100,
    attack: 38,
    defense: 15,
    speed: 40,
    description:
      'A crackling dragon that channels thunder through its wings. When it roars, actual thunder follows.',
    abilities: ['static_jolt', 'thunder_lance'],
  },
  {
    id: 'lightning_wyrm',
    name: 'Volt Serpent',
    element: 'lightning',
    rarity: 'uncommon',
    hp: 95,
    attack: 35,
    defense: 18,
    speed: 38,
    description:
      'A sinuous dragon that moves faster than sight, leaving streaks of blue lightning behind it.',
    abilities: ['static_jolt', 'voltage_fang'],
  },
  {
    id: 'lightning_dragon',
    name: 'Tempest Dragon',
    element: 'lightning',
    rarity: 'rare',
    hp: 140,
    attack: 55,
    defense: 22,
    speed: 45,
    description:
      'A mythical dragon that controls hurricanes and typhoons. Its wingspan generates electrical storms.',
    abilities: ['static_jolt', 'thunder_lance', 'chain_lightning'],
  },
  {
    id: 'lightning_titan',
    name: 'Zephyrus Stormking',
    element: 'lightning',
    rarity: 'epic',
    hp: 175,
    attack: 65,
    defense: 30,
    speed: 50,
    description:
      'The undisputed ruler of storm-wracked skies. Zephyrus can strike a hundred targets with a single bolt.',
    abilities: ['static_jolt', 'thunder_lance', 'chain_lightning', 'eye_of_storm'],
  },
  {
    id: 'lightning_sky_dragon',
    name: 'Celestial Stormwing',
    element: 'lightning',
    rarity: 'epic',
    hp: 155,
    attack: 58,
    defense: 28,
    speed: 55,
    description:
      'A dragon that flies so high it breaches the ionosphere. Auroras follow in its wake.',
    abilities: ['static_jolt', 'thunder_lance', 'aurora_dash'],
  },
  {
    id: 'lightning_sovereign',
    name: 'Electoris — Living Lightning',
    element: 'lightning',
    rarity: 'legendary',
    hp: 230,
    attack: 80,
    defense: 38,
    speed: 60,
    description:
      'Pure lightning given draconic form. Electoris is not born from egg but from the moment lightning first struck the earth.',
    abilities: ['static_jolt', 'thunder_lance', 'chain_lightning', 'eye_of_storm', 'worldquake'],
  },

  // ── Shadow Dragons (7) ──────────────────────────────────────────
  {
    id: 'shadow_whelp',
    name: 'Duskling',
    element: 'shadow',
    rarity: 'common',
    hp: 75,
    attack: 20,
    defense: 15,
    speed: 24,
    description:
      'A small dragon that can blend into any shadow. Its eyes glow faintly purple in the dark.',
    abilities: ['shadow_bolt'],
  },
  {
    id: 'shadow_drake',
    name: 'Umbra Drake',
    element: 'shadow',
    rarity: 'uncommon',
    hp: 100,
    attack: 40,
    defense: 18,
    speed: 35,
    description:
      'A dark-scaled predator that moves through shadows as if swimming. It strikes before targets can react.',
    abilities: ['shadow_bolt', 'darkslash'],
  },
  {
    id: 'shadow_wyrm',
    name: 'Void Serpent',
    element: 'shadow',
    rarity: 'uncommon',
    hp: 90,
    attack: 38,
    defense: 16,
    speed: 38,
    description:
      'A serpentine dragon that exists partially in another dimension. Only its shadow is visible.',
    abilities: ['shadow_bolt', 'void_tendril'],
  },
  {
    id: 'shadow_dragon',
    name: 'Nightmare Dragon',
    element: 'shadow',
    rarity: 'rare',
    hp: 130,
    attack: 55,
    defense: 25,
    speed: 42,
    description:
      'A dragon that feeds on fear. Its presence causes nightmares, and its breath weapon is pure despair.',
    abilities: ['shadow_bolt', 'darkslash', 'fear_mist'],
  },
  {
    id: 'shadow_titan',
    name: 'Obsidian Wyrm',
    element: 'shadow',
    rarity: 'epic',
    hp: 180,
    attack: 68,
    defense: 40,
    speed: 36,
    description:
      'A colossal dragon of volcanic obsidian glass, sharp enough to cut through steel. Nothing reflects its dark surface.',
    abilities: ['shadow_bolt', 'darkslash', 'fear_mist', 'eclipse'],
  },
  {
    id: 'shadow_phantom',
    name: 'Phantom Dragon',
    element: 'shadow',
    rarity: 'epic',
    hp: 120,
    attack: 60,
    defense: 20,
    speed: 52,
    description:
      'A ghostly dragon that phases between dimensions at will. Physical attacks pass right through it.',
    abilities: ['shadow_bolt', 'darkslash', 'phase_shift'],
  },
  {
    id: 'shadow_sovereign',
    name: 'Tenebris — The Endless Dark',
    element: 'shadow',
    rarity: 'legendary',
    hp: 250,
    attack: 78,
    defense: 48,
    speed: 48,
    description:
      'An ancient being of pure darkness that predates light itself. Tenebris consumes light, hope, and color.',
    abilities: ['shadow_bolt', 'darkslash', 'fear_mist', 'eclipse', 'annihilation'],
  },

  // ── Crystal Dragons (7) ─────────────────────────────────────────
  {
    id: 'crystal_whelp',
    name: 'Prism Whelp',
    element: 'crystal',
    rarity: 'common',
    hp: 100,
    attack: 15,
    defense: 30,
    speed: 12,
    description:
      'A small dragon covered in shimmering crystal growths. It refracts light into rainbow patterns when happy.',
    abilities: ['crystal_spark'],
  },
  {
    id: 'crystal_drake',
    name: 'Quartz Drake',
    element: 'crystal',
    rarity: 'uncommon',
    hp: 140,
    attack: 25,
    defense: 45,
    speed: 14,
    description:
      'A stout dragon with armor-like quartz plating. Its scales deflect most physical attacks effortlessly.',
    abilities: ['crystal_spark', 'shard_barrage'],
  },
  {
    id: 'crystal_wyrm',
    name: 'Amethyst Serpent',
    element: 'crystal',
    rarity: 'uncommon',
    hp: 130,
    attack: 28,
    defense: 40,
    speed: 16,
    description:
      'A graceful serpent dragon with amethyst scales that pulse with healing energy. Coveted by healers.',
    abilities: ['crystal_spark', 'amethyst_glow'],
  },
  {
    id: 'crystal_dragon',
    name: 'Diamond Dragon',
    element: 'crystal',
    rarity: 'rare',
    hp: 180,
    attack: 38,
    defense: 60,
    speed: 18,
    description:
      'A glittering dragon whose entire body is living diamond. No blade has ever scratched its surface.',
    abilities: ['crystal_spark', 'shard_barrage', 'diamond_wall'],
  },
  {
    id: 'crystal_titan',
    name: 'Geode Behemoth',
    element: 'crystal',
    rarity: 'epic',
    hp: 250,
    attack: 42,
    defense: 72,
    speed: 12,
    description:
      'An enormous dragon the size of a mountain, covered in massive crystal formations. Inside its body lies a cavity of jewels.',
    abilities: ['crystal_spark', 'shard_barrage', 'diamond_wall', 'crystalline_eruption'],
  },
  {
    id: 'crystal_aurora',
    name: 'Opal Mirage',
    element: 'crystal',
    rarity: 'epic',
    hp: 160,
    attack: 50,
    defense: 45,
    speed: 28,
    description:
      'A mesmerizing dragon covered in shifting opal scales that display every color. Its form seems to shimmer in and out of focus.',
    abilities: ['crystal_spark', 'shard_barrage', 'prismatic_illusion'],
  },
  {
    id: 'crystal_sovereign',
    name: 'Adamantius — The Living Gem',
    element: 'crystal',
    rarity: 'legendary',
    hp: 320,
    attack: 55,
    defense: 85,
    speed: 22,
    description:
      'The oldest crystal dragon in existence, said to be a single sentient gemstone that grew into a dragon over millennia.',
    abilities: ['crystal_spark', 'shard_barrage', 'diamond_wall', 'crystalline_eruption', 'gemstone_apotheosis'],
  },

  // ── Storm Dragons (7) ───────────────────────────────────────────
  {
    id: 'storm_whelp',
    name: 'Gale Pup',
    element: 'storm',
    rarity: 'common',
    hp: 85,
    attack: 20,
    defense: 14,
    speed: 26,
    description:
      'A fluffy dragon that generates miniature cyclones when it sneezes. Curiously afraid of umbrellas.',
    abilities: ['wind_slash'],
  },
  {
    id: 'storm_drake',
    name: 'Cyclone Drake',
    element: 'storm',
    rarity: 'uncommon',
    hp: 120,
    attack: 32,
    defense: 20,
    speed: 38,
    description:
      'A fierce drake that rides wind currents without flapping its wings. Its roar generates shockwaves.',
    abilities: ['wind_slash', 'gale_breath'],
  },
  {
    id: 'storm_wyrm',
    name: 'Monsoon Serpent',
    element: 'storm',
    rarity: 'uncommon',
    hp: 110,
    attack: 30,
    defense: 22,
    speed: 36,
    description:
      'A sea-dwelling serpent that summons monsoons. Sailors pray for clear skies to avoid its territory.',
    abilities: ['wind_slash', 'tidal_gale'],
  },
  {
    id: 'storm_dragon',
    name: 'Hurricane Dragon',
    element: 'storm',
    rarity: 'rare',
    hp: 155,
    attack: 48,
    defense: 28,
    speed: 44,
    description:
      'A colossal dragon that generates an eternal hurricane around itself. Entire fleets have been lost in its storms.',
    abilities: ['wind_slash', 'gale_breath', 'cataclysm_winds'],
  },
  {
    id: 'storm_titan',
    name: 'Tyranus Skybreaker',
    element: 'storm',
    rarity: 'epic',
    hp: 200,
    attack: 58,
    defense: 35,
    speed: 48,
    description:
      'A titan whose wingspan blackens the sky. When Tyranus takes wing, the air pressure change shatters windows for miles.',
    abilities: ['wind_slash', 'gale_breath', 'cataclysm_winds', 'atmosphere_tear'],
  },
  {
    id: 'storm_maelstrom',
    name: 'Vortex Dragon',
    element: 'storm',
    rarity: 'epic',
    hp: 165,
    attack: 52,
    defense: 30,
    speed: 50,
    description:
      'A dragon that creates spiraling vortexes of air and water. Its attacks pull enemies in before crushing them.',
    abilities: ['wind_slash', 'gale_breath', 'maelstrom_vortex'],
  },
  {
    id: 'storm_sovereign',
    name: 'Ventus — Breath of the World',
    element: 'storm',
    rarity: 'legendary',
    hp: 260,
    attack: 72,
    defense: 42,
    speed: 58,
    description:
      'The primordial spirit of the wind given dragon form. Ventus was the first breath of the world and will be its last.',
    abilities: ['wind_slash', 'gale_breath', 'cataclysm_winds', 'atmosphere_tear', 'planetary_storm'],
  },

  // ── Nature Dragons (7) ──────────────────────────────────────────
  {
    id: 'nature_whelp',
    name: 'Budscale',
    element: 'nature',
    rarity: 'common',
    hp: 95,
    attack: 16,
    defense: 20,
    speed: 14,
    description:
      'A small dragon covered in budding leaves and flowers. It photosynthesizes for energy and smells like a garden.',
    abilities: ['vine_whip'],
  },
  {
    id: 'nature_drake',
    name: 'Thorn Drake',
    element: 'nature',
    rarity: 'uncommon',
    hp: 135,
    attack: 30,
    defense: 35,
    speed: 16,
    description:
      'A formidable drake covered in razor-sharp thorns. Its breath weapon is a cloud of corrosive pollen.',
    abilities: ['vine_whip', 'thorn_barrage'],
  },
  {
    id: 'nature_wyrm',
    name: 'Rootwyrm',
    element: 'nature',
    rarity: 'uncommon',
    hp: 150,
    attack: 22,
    defense: 40,
    speed: 12,
    description:
      'A burrowing dragon that moves through soil as easily as water. Entire forests grow from where it sleeps.',
    abilities: ['vine_whip', 'root_cage'],
  },
  {
    id: 'nature_dragon',
    name: 'Ancient Grove Dragon',
    element: 'nature',
    rarity: 'rare',
    hp: 200,
    attack: 35,
    defense: 55,
    speed: 14,
    description:
      'A colossal dragon so old that trees grow on its back. Its roots extend for miles beneath the earth.',
    abilities: ['vine_whip', 'thorn_barrage', 'nature_wrath'],
  },
  {
    id: 'nature_titan',
    name: 'Verdantis the Evergreen',
    element: 'nature',
    rarity: 'epic',
    hp: 260,
    attack: 40,
    defense: 68,
    speed: 16,
    description:
      'A living forest in dragon form. Verdantis can regenerate any wound instantly and grows stronger with each season.',
    abilities: ['vine_whip', 'thorn_barrage', 'nature_wrath', 'world_tree_bloom'],
  },
  {
    id: 'nature_fairy_dragon',
    name: 'Petalwing Fey',
    element: 'nature',
    rarity: 'epic',
    hp: 140,
    attack: 48,
    defense: 30,
    speed: 40,
    description:
      'A dazzling dragon with butterfly-like wings made of living petals. It commands fairy magic and nature spirits.',
    abilities: ['vine_whip', 'thorn_barrage', 'fey_blessing'],
  },
  {
    id: 'nature_sovereign',
    name: 'Silvanus — Heart of the Wild',
    element: 'nature',
    rarity: 'legendary',
    hp: 310,
    attack: 50,
    defense: 78,
    speed: 24,
    description:
      'The embodiment of nature itself. Silvanus can communicate with every living thing and has dominion over all plant and animal life.',
    abilities: ['vine_whip', 'thorn_barrage', 'nature_wrath', 'world_tree_bloom', 'genesis_bloom'],
  },

  // ── Arcane Dragons (7) ──────────────────────────────────────────
  {
    id: 'arcane_whelp',
    name: 'Sparkmind',
    element: 'arcane',
    rarity: 'common',
    hp: 80,
    attack: 28,
    defense: 14,
    speed: 20,
    description:
      'A tiny dragon with a disproportionately large head buzzing with magical energy. It floats rather than walks.',
    abilities: ['arcane_bolt'],
  },
  {
    id: 'arcane_drake',
    name: 'Mystic Drake',
    element: 'arcane',
    rarity: 'uncommon',
    hp: 110,
    attack: 42,
    defense: 20,
    speed: 24,
    description:
      'A purple-scaled drake covered in glowing arcane runes. Its magic manifests as floating sigils around its body.',
    abilities: ['arcane_bolt', 'rune_blast'],
  },
  {
    id: 'arcane_wyrm',
    name: 'Ethereal Wyrm',
    element: 'arcane',
    rarity: 'uncommon',
    hp: 100,
    attack: 40,
    defense: 18,
    speed: 28,
    description:
      'A translucent dragon that exists partially in the astral plane. Its attacks ignore physical armor entirely.',
    abilities: ['arcane_bolt', 'planar_strike'],
  },
  {
    id: 'arcane_dragon',
    name: 'Sorcerer Dragon',
    element: 'arcane',
    rarity: 'rare',
    hp: 145,
    attack: 58,
    defense: 28,
    speed: 26,
    description:
      'A master of arcane arts, the Sorcerer Dragon casts complex spells mid-flight. Its intellect rivals that of sages.',
    abilities: ['arcane_bolt', 'rune_blast', 'telekinetic_storm'],
  },
  {
    id: 'arcane_titan',
    name: 'Nexus Archdragon',
    element: 'arcane',
    rarity: 'epic',
    hp: 190,
    attack: 70,
    defense: 38,
    speed: 30,
    description:
      'A being of pure concentrated magic, the Nexus Archdragon serves as a living conduit between the material and astral planes.',
    abilities: ['arcane_bolt', 'rune_blast', 'telekinetic_storm', 'dimensional_rift'],
  },
  {
    id: 'arcane_chrono',
    name: 'Chronowyrm',
    element: 'arcane',
    rarity: 'epic',
    hp: 160,
    attack: 62,
    defense: 32,
    speed: 38,
    description:
      'A time-manipulating dragon that can accelerate, slow, or briefly reverse time within a localized area.',
    abilities: ['arcane_bolt', 'rune_blast', 'temporal_freeze'],
  },
  {
    id: 'arcane_sovereign',
    name: 'Aetherius — The Infinite Spell',
    element: 'arcane',
    rarity: 'legendary',
    hp: 240,
    attack: 82,
    defense: 50,
    speed: 40,
    description:
      'The ultimate arcane being, Aetherius is a spell so powerful it gained sentience and took dragon form. Reality bends around it.',
    abilities: ['arcane_bolt', 'rune_blast', 'telekinetic_storm', 'dimensional_rift', 'reality_rewrite'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: DR_NESTS — 8 Nest Biomes
// ═══════════════════════════════════════════════════════════════════

export const DR_NESTS: readonly DRNestDef[] = [
  {
    id: 'volcanic_crag',
    name: 'Volcanic Crag',
    description:
      'A jagged outcrop of blackened obsidian near an active volcano. Rivers of lava flow nearby, keeping the nest warm enough for fire dragon eggs.',
    element: 'fire',
    unlockLevel: 1,
    baseCapacity: 4,
  },
  {
    id: 'frozen_peak',
    name: 'Frozen Peak',
    description:
      'A windswept summit of eternal ice, home to the hardiest ice dragons. Icicles the size of buildings hang from cavern ceilings.',
    element: 'ice',
    unlockLevel: 3,
    baseCapacity: 4,
  },
  {
    id: 'storm_spire',
    name: 'Storm Spire',
    description:
      'A towering stone spire permanently surrounded by lightning storms. Only lightning dragons can navigate the constant turbulence.',
    element: 'lightning',
    unlockLevel: 5,
    baseCapacity: 3,
  },
  {
    id: 'shadow_hollow',
    name: 'Shadow Hollow',
    description:
      'A subterranean cavern where no light has ever reached. The shadows here are alive and protect the dragons that dwell within.',
    element: 'shadow',
    unlockLevel: 8,
    baseCapacity: 3,
  },
  {
    id: 'crystal_cavern',
    name: 'Crystal Cavern',
    description:
      'A vast underground space filled with naturally glowing crystals. The resonance of the crystals strengthens crystal dragon scales.',
    element: 'crystal',
    unlockLevel: 10,
    baseCapacity: 5,
  },
  {
    id: 'thunder_mesa',
    name: 'Thunder Mesa',
    description:
      'A flat-topped mountain plateau battered by perpetual storms. Wind speeds here regularly exceed 200 miles per hour.',
    element: 'storm',
    unlockLevel: 12,
    baseCapacity: 4,
  },
  {
    id: 'ancient_grove',
    name: 'Ancient Grove',
    description:
      'A primordial forest so old the trees have developed sentience. Nature dragons nurture the grove, and the grove nurtures them in return.',
    element: 'nature',
    unlockLevel: 15,
    baseCapacity: 5,
  },
  {
    id: 'arcane_sanctuary',
    name: 'Arcane Sanctuary',
    description:
      'A floating island held aloft by raw magical energy. Only arcane dragons can enter through its dimensional gateway.',
    element: 'arcane',
    unlockLevel: 20,
    baseCapacity: 4,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: DR_TREASURES — 30 Collectible Dragon Treasures
// ═══════════════════════════════════════════════════════════════════

export const DR_TREASURES: readonly DRTreasureDef[] = [
  // Fire Treasures (4)
  { id: 'tr_fire_ember_crown', name: 'Ember Crown', rarity: 'common', value: 50, description: 'A crown forged from cooled volcanic embers. Warm to the touch.', element: 'fire' },
  { id: 'tr_fire_magma_shard', name: 'Magma Shard', rarity: 'uncommon', value: 150, description: 'A fragment of pure magma, captured in an enchanted crystal sphere.', element: 'fire' },
  { id: 'tr_fire_inferno_heart', name: 'Inferno Heart', rarity: 'rare', value: 400, description: 'The crystallized heart of an ancient fire dragon. Burns eternally.', element: 'fire' },
  { id: 'tr_fire_sunstone', name: 'Primordial Sunstone', rarity: 'epic', value: 1200, description: 'A stone that contains a miniature sun within it. Legends say it was the first light of creation.', element: 'fire' },

  // Ice Treasures (4)
  { id: 'tr_ice_frost_gem', name: 'Frost Gem', rarity: 'common', value: 50, description: 'A perfectly clear gemstone that never melts. Perpetually cold.', element: 'ice' },
  { id: 'tr_ice_blizzard_scale', name: 'Blizzard Scale', rarity: 'uncommon', value: 160, description: 'An iridescent scale from a Blizzard Dragon. Whispers of cold wind emanate from it.', element: 'ice' },
  { id: 'tr_ice_eternal_frost', name: 'Eternal Frost', rarity: 'rare', value: 420, description: 'A vial of frost that will never thaw, harvested from the heart of a glacier.', element: 'ice' },
  { id: 'tr_ice_glacier_eye', name: 'Eye of the Glacier', rarity: 'epic', value: 1250, description: 'A massive sapphire formed over millennia inside glacial ice. It sees through all deception.', element: 'ice' },

  // Lightning Treasures (4)
  { id: 'tr_lightning_static_crystal', name: 'Static Crystal', rarity: 'common', value: 55, description: 'A quartz crystal charged with permanent static electricity.', element: 'lightning' },
  { id: 'tr_lightning_storm_fang', name: 'Storm Fang', rarity: 'uncommon', value: 155, description: 'A tooth from a thunder drake, still crackling with residual charge.', element: 'lightning' },
  { id: 'tr_lightning_thunderbolt', name: 'Captured Thunderbolt', rarity: 'rare', value: 450, description: 'Lightning itself, frozen in time and stored in an unbreakable glass vial.', element: 'lightning' },
  { id: 'tr_lightning_zenith_orb', name: 'Zenith Orb', rarity: 'legendary', value: 3000, description: 'An orb containing the pure essence of a lightning strike at its absolute peak power.', element: 'lightning' },

  // Shadow Treasures (4)
  { id: 'tr_shadow_dark_shard', name: 'Dark Shard', rarity: 'common', value: 48, description: 'A fragment of solidified shadow. It absorbs nearby light.', element: 'shadow' },
  { id: 'tr_shadow_nightstone', name: 'Nightstone', rarity: 'uncommon', value: 145, description: 'A stone as black as the void. Staring into it reveals distant stars.', element: 'shadow' },
  { id: 'tr_shadow_void_pearl', name: 'Void Pearl', rarity: 'rare', value: 380, description: 'A pearl formed in the emptiness between dimensions. Impossibly beautiful and unsettling.', element: 'shadow' },
  { id: 'tr_shadow_eclipse_ring', name: 'Ring of Eclipse', rarity: 'epic', value: 1100, description: 'A ring forged during a total eclipse. Wearing it dims all light sources.', element: 'shadow' },

  // Crystal Treasures (4)
  { id: 'tr_crystal_quartz_fang', name: 'Quartz Fang', rarity: 'common', value: 52, description: 'A pointed crystal formation shaped like a dragon fang. Surprisingly sharp.', element: 'crystal' },
  { id: 'tr_crystal_amethyst_heart', name: 'Amethyst Heart', rarity: 'uncommon', value: 165, description: 'A naturally heart-shaped amethyst that pulses with gentle healing energy.', element: 'crystal' },
  { id: 'tr_crystal_diamond_claw', name: 'Diamond Claw', rarity: 'rare', value: 500, description: 'A claw made of pure diamond, shed by a Diamond Dragon. Uncuttable by any known tool.', element: 'crystal' },
  { id: 'tr_crystal_prism_crown', name: 'Crown of Prisms', rarity: 'legendary', value: 3200, description: 'A crown that refracts all light into perfect rainbow spectra. Its creator is unknown.', element: 'crystal' },

  // Storm Treasures (4)
  { id: 'tr_storm_wind_charm', name: 'Wind Charm', rarity: 'common', value: 45, description: 'A small charm that always points into the wind. Sailors prize these.', element: 'storm' },
  { id: 'tr_storm_hurricane_gem', name: 'Hurricane Gem', rarity: 'uncommon', value: 158, description: 'A gemstone with a visible cyclone trapped inside. It generates constant wind.', element: 'storm' },
  { id: 'tr_storm_tempest_core', name: 'Tempest Core', rarity: 'rare', value: 410, description: 'The condensed energy at the center of a hurricane. Impossibly powerful and dangerous.', element: 'storm' },
  { id: 'tr_storm_atlas_orb', name: 'Atlas Orb', rarity: 'epic', value: 1180, description: 'An orb containing the essence of atmospheric pressure. Can flatten or raise mountains.', element: 'storm' },

  // Nature Treasures (3)
  { id: 'tr_nature_ancient_seed', name: 'Ancient Seed', rarity: 'common', value: 46, description: 'A seed from the World Tree. Planting it grows a sapling overnight.', element: 'nature' },
  { id: 'tr_nature_faerie_dust', name: 'Faerie Dust', rarity: 'uncommon', value: 170, description: 'Glowing dust collected from a faerie ring. Grants visions of the natural world.', element: 'nature' },
  { id: 'tr_nature_worldroot', name: 'Fragment of the World Root', rarity: 'legendary', value: 3500, description: 'A piece of the root system that connects all forests on the planet. Pulsates with primordial life.', element: 'nature' },

  // Arcane Treasures (3)
  { id: 'tr_arcane_spell_shard', name: 'Spell Shard', rarity: 'common', value: 54, description: 'A fragment of a broken spell. Whispers incantations when held close to the ear.', element: 'arcane' },
  { id: 'tr_arcane_rune_stone', name: 'Elder Rune Stone', rarity: 'uncommon', value: 168, description: 'A stone inscribed with runes from a forgotten magical language. Their meaning is still debated.', element: 'arcane' },
  { id: 'tr_arcane_aether_core', name: 'Core of Pure Aether', rarity: 'legendary', value: 3800, description: 'The distilled essence of all magical energy in existence. Merely touching it grants temporary omniscience.', element: 'arcane' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: DR_STRUCTURES — 25 Upgradeable Nest Structures
// ═══════════════════════════════════════════════════════════════════

export const DR_STRUCTURES: readonly DRStructureDef[] = [
  // Incubation Structures (5)
  { id: 'str_basic_incubator', name: 'Basic Egg Incubator', description: 'A simple heated nest for incubating dragon eggs. Maintains a stable temperature.', baseCost: 100, upgradeCostMultiplier: 1.5 },
  { id: 'str_enhanced_incubator', name: 'Enhanced Incubator', description: 'An upgraded incubator with temperature controls and humidity regulation.', baseCost: 300, upgradeCostMultiplier: 1.6 },
  { id: 'str_elemental_incubator', name: 'Elemental Incubator', description: 'Attuned to specific dragon elements, this incubator speeds up hatching for matching eggs.', baseCost: 800, upgradeCostMultiplier: 1.7 },
  { id: 'str_arcane_incubator', name: 'Arcane Incubator', description: 'Powered by raw arcane energy, this incubator can hatch any egg at twice the normal speed.', baseCost: 2000, upgradeCostMultiplier: 1.8 },
  { id: 'str_dragon_heart_incubator', name: 'Dragon Heart Incubator', description: 'Built around an actual dragon heart crystal, this is the pinnacle of incubation technology.', baseCost: 5000, upgradeCostMultiplier: 2.0 },

  // Training Structures (5)
  { id: 'str_training_grounds', name: 'Training Grounds', description: 'An open arena where dragons can train and build combat skills.', baseCost: 150, upgradeCostMultiplier: 1.5 },
  { id: 'str_obstacle_course', name: 'Obstacle Course', description: 'A challenging course of elemental hazards that trains dragon speed and reflexes.', baseCost: 400, upgradeCostMultiplier: 1.6 },
  { id: 'str_combat_ring', name: 'Combat Ring', description: 'A dedicated arena for dragon battles with spectator stands and protective wards.', baseCost: 1000, upgradeCostMultiplier: 1.7 },
  { id: 'str_magic_circle', name: 'Arcane Training Circle', description: 'An enchanted circle that boosts magical ability training for arcane and elemental dragons.', baseCost: 2500, upgradeCostMultiplier: 1.8 },
  { id: 'str_ascension_chamber', name: 'Ascension Chamber', description: 'A mystical chamber where dragons can push beyond their limits and unlock hidden potential.', baseCost: 6000, upgradeCostMultiplier: 2.0 },

  // Food Production Structures (5)
  { id: 'str_herb_garden', name: 'Dragon Herb Garden', description: 'A garden growing magical herbs used in dragon feed preparation.', baseCost: 80, upgradeCostMultiplier: 1.4 },
  { id: 'str_feed_mill', name: 'Feed Mill', description: 'Processes raw herbs into nutritious dragon feed at an industrial scale.', baseCost: 200, upgradeCostMultiplier: 1.5 },
  { id: 'str_alchemy_lab', name: 'Dragon Alchemy Lab', description: 'Creates enhanced feed with special properties like element affinity boosts.', baseCost: 600, upgradeCostMultiplier: 1.6 },
  { id: 'str_ambrosia_forge', name: 'Ambrosia Forge', description: 'Forges mythical ambrosia that dramatically boosts dragon growth and mood.', baseCost: 1800, upgradeCostMultiplier: 1.8 },
  { id: 'str_elixir_fountain', name: 'Elixir Fountain', description: 'An enchanted fountain that produces rare elixirs. The water glows with inner light.', baseCost: 4500, upgradeCostMultiplier: 2.0 },

  // Gold Generation Structures (5)
  { id: 'str_gold_mine', name: 'Dragon Gold Mine', description: 'A mine operated by your dragons that produces gold from ore veins.', baseCost: 120, upgradeCostMultiplier: 1.5 },
  { id: 'str_treasure_vault', name: 'Treasure Vault', description: 'A secure vault where dragons can store and protect collected treasures.', baseCost: 350, upgradeCostMultiplier: 1.5 },
  { id: 'str_trade_post', name: 'Dragon Trade Post', description: 'A trading hub where dragon goods can be exchanged for gold with merchants.', baseCost: 900, upgradeCostMultiplier: 1.6 },
  { id: 'str_gem_workshop', name: 'Gem Cutting Workshop', description: 'A workshop for cutting and polishing dragon gems into valuable trade goods.', baseCost: 2200, upgradeCostMultiplier: 1.8 },
  { id: 'str_dragon_bank', name: 'Dragon Hoard Bank', description: 'A massive vault like a dragon hoard, generating interest on stored gold.', baseCost: 5500, upgradeCostMultiplier: 2.0 },

  // Comfort & Decoration Structures (5)
  { id: 'str_heat_lamp', name: 'Cozy Heat Lamp', description: 'A magical heat lamp that keeps the roost warm and comfortable for all dragon types.', baseCost: 60, upgradeCostMultiplier: 1.3 },
  { id: 'str_crystal_chandelier', name: 'Crystal Chandelier', description: 'An elegant chandelier made from enchanted crystals that provides beautiful ambient light.', baseCost: 250, upgradeCostMultiplier: 1.5 },
  { id: 'str_elemental_fountain', name: 'Elemental Fountain', description: 'A fountain that cycles through all eight elements, providing comfort to any dragon.', baseCost: 700, upgradeCostMultiplier: 1.6 },
  { id: 'str_mural_of_ages', name: 'Mural of the Ages', description: 'A massive mural depicting dragon history. Increases nest comfort and dragon mood.', baseCost: 1600, upgradeCostMultiplier: 1.7 },
  { id: 'str_dragon_statue', name: 'Monument to Dragonkind', description: 'A towering statue of the First Dragon. All dragons near it feel a sense of pride and belonging.', baseCost: 4000, upgradeCostMultiplier: 2.0 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: DR_ABILITIES — 22 Dragon Abilities
// ═══════════════════════════════════════════════════════════════════

export const DR_ABILITIES: readonly DRAbilityDef[] = [
  // Fire Abilities (3)
  { id: 'fire_breath', name: 'Fire Breath', description: 'Unleashes a devastating cone of searing flames that incinerates everything in its path.', element: 'fire', cooldown: 2, power: 35 },
  { id: 'inferno_fang', name: 'Inferno Fang', description: 'Bites with fire-enchanted fangs that leave burning wounds that continue to deal damage.', element: 'fire', cooldown: 3, power: 28 },
  { id: 'flame_shroud', name: 'Flame Shroud', description: 'Wraps the dragon in protective flames that burn any attacker and reduce incoming damage.', element: 'fire', cooldown: 5, power: 20 },

  // Ice Abilities (3)
  { id: 'ice_shard', name: 'Ice Shard', description: 'Launches a barrage of razor-sharp ice crystals at the target with pinpoint accuracy.', element: 'ice', cooldown: 2, power: 30 },
  { id: 'frost_bite', name: 'Frost Bite', description: 'A freezing bite that slows the target dramatically and causes numbness.', element: 'ice', cooldown: 3, power: 25 },
  { id: 'absolute_freeze', name: 'Absolute Freeze', description: 'Drops the temperature in an area to near absolute zero, flash-freezing everything.', element: 'ice', cooldown: 6, power: 50 },

  // Lightning Abilities (3)
  { id: 'static_jolt', name: 'Static Jolt', description: 'A quick jolt of electricity that stuns the target momentarily.', element: 'lightning', cooldown: 1, power: 18 },
  { id: 'thunder_lance', name: 'Thunder Lance', description: 'Channels a concentrated beam of thunder directly at the target. Pierces most defenses.', element: 'lightning', cooldown: 3, power: 40 },
  { id: 'chain_lightning', name: 'Chain Lightning', description: 'Lightning that arcs between multiple targets, striking each with devastating force.', element: 'lightning', cooldown: 4, power: 35 },

  // Shadow Abilities (3)
  { id: 'shadow_bolt', name: 'Shadow Bolt', description: 'Fires a bolt of concentrated darkness that drains the life force of the target.', element: 'shadow', cooldown: 2, power: 32 },
  { id: 'darkslash', name: 'Dark Slash', description: 'Claws infused with shadow energy that cut through armor and leave wounds that will not heal.', element: 'shadow', cooldown: 3, power: 30 },
  { id: 'fear_mist', name: 'Fear Mist', description: 'Exhales a cloud of dark mist that causes terror and panic in all who breathe it.', element: 'shadow', cooldown: 5, power: 25 },

  // Crystal Abilities (3)
  { id: 'crystal_spark', name: 'Crystal Spark', description: 'Fires a brilliant spark of refracted light that blinds and burns the target.', element: 'crystal', cooldown: 2, power: 22 },
  { id: 'shard_barrage', name: 'Shard Barrage', description: 'Launches a storm of crystal shards in all directions. Devastating area-of-effect attack.', element: 'crystal', cooldown: 4, power: 38 },
  { id: 'diamond_wall', name: 'Diamond Wall', description: 'Raises an impenetrable wall of enchanted diamond that absorbs all incoming damage.', element: 'crystal', cooldown: 6, power: 15 },

  // Storm Abilities (3)
  { id: 'wind_slash', name: 'Wind Slash', description: 'Creates blades of compressed air that slice through targets with invisible force.', element: 'storm', cooldown: 2, power: 26 },
  { id: 'gale_breath', name: 'Gale Breath', description: 'Exhales a hurricane-force wind that knocks back and disorients enemies.', element: 'storm', cooldown: 3, power: 28 },
  { id: 'cataclysm_winds', name: 'Cataclysm Winds', description: 'Summons a localized tornado that lifts enemies into the air and slams them back down.', element: 'storm', cooldown: 6, power: 48 },

  // Nature Abilities (2)
  { id: 'vine_whip', name: 'Vine Whip', description: 'Summons thorny vines from the ground that lash and entangle the target.', element: 'nature', cooldown: 2, power: 24 },
  { id: 'thorn_barrage', name: 'Thorn Barrage', description: 'Launches hundreds of razor-sharp thorns in a wide cone, piercing multiple targets.', element: 'nature', cooldown: 4, power: 36 },

  // Arcane Abilities (2)
  { id: 'arcane_bolt', name: 'Arcane Bolt', description: 'Fires a bolt of raw magical energy that ignores all physical defenses.', element: 'arcane', cooldown: 2, power: 34 },
  { id: 'rune_blast', name: 'Rune Blast', description: 'Activates ancient runes inscribed in the ground that explode with magical energy.', element: 'arcane', cooldown: 4, power: 42 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: DR_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const DR_ACHIEVEMENTS: readonly DRAchievementDef[] = [
  { id: 'ach_first_hatch', name: 'First Hatchling', description: 'Hatch your very first dragon egg.', condition: 'Hatch 1 egg' },
  { id: 'ach_hatch_10', name: 'Nest Warming', description: 'Hatch 10 dragon eggs total.', condition: 'Hatch 10 eggs' },
  { id: 'ach_hatch_50', name: 'Dragon Farmer', description: 'Hatch 50 dragon eggs. You are becoming quite the breeder.', condition: 'Hatch 50 eggs' },
  { id: 'ach_hatch_100', name: 'Master Breeder', description: 'Hatch 100 dragon eggs. Your dragons know you well.', condition: 'Hatch 100 eggs' },
  { id: 'ach_feed_25', name: 'Dragon Chef', description: 'Feed your dragons 25 times.', condition: 'Feed 25 times' },
  { id: 'ach_feed_100', name: 'Gourmet Keeper', description: 'Feed your dragons 100 times. They love mealtime.', condition: 'Feed 100 times' },
  { id: 'ach_battle_first', name: 'First Blood', description: 'Win your first dragon battle.', condition: 'Win 1 battle' },
  { id: 'ach_battle_25', name: 'Arena Veteran', description: 'Win 25 dragon battles.', condition: 'Win 25 battles' },
  { id: 'ach_battle_100', name: 'Arena Champion', description: 'Win 100 dragon battles. Legends are made of such feats.', condition: 'Win 100 battles' },
  { id: 'ach_treasure_10', name: 'Treasure Hunter', description: 'Collect 10 unique dragon treasures.', condition: 'Collect 10 treasures' },
  { id: 'ach_treasure_25', name: 'Hoard Keeper', description: 'Collect 25 unique dragon treasures.', condition: 'Collect 25 treasures' },
  { id: 'ach_build_5', name: 'Architect', description: 'Build 5 different nest structures.', condition: 'Build 5 structures' },
  { id: 'ach_upgrade_max', name: 'Master Builder', description: 'Upgrade any structure to level 10.', condition: 'Upgrade to level 10' },
  { id: 'ach_nest_all', name: 'Biome Collector', description: 'Unlock all 8 nest biomes.', condition: 'Unlock all nests' },
  { id: 'ach_dragon_10', name: 'Growing Roster', description: 'Own 10 dragons simultaneously.', condition: 'Own 10 dragons' },
  { id: 'ach_dragon_30', name: 'Dragon Army', description: 'Own 30 dragons simultaneously.', condition: 'Own 30 dragons' },
  { id: 'ach_level_25', name: 'Rising Star', description: 'Reach Dragon Roost level 25.', condition: 'Reach level 25' },
  { id: 'ach_level_50', name: 'Dragon God', description: 'Reach the maximum Dragon Roost level.', condition: 'Reach level 50' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: DR_TITLES — 8 Progression Titles
// ═══════════════════════════════════════════════════════════════════

export const DR_TITLES: readonly DRTitleDef[] = [
  { id: 'title_whelp', name: 'Dragon Whelp', requiredLevel: 1, description: 'A fledgling keeper who has just begun their journey with dragons.' },
  { id: 'title_knight', name: 'Dragon Knight', requiredLevel: 5, description: 'A brave keeper who has proven their worth in dragon care and battle.' },
  { id: 'title_tamer', name: 'Dragon Tamer', requiredLevel: 10, description: 'A skilled tamer capable of handling the most temperamental dragons.' },
  { id: 'title_rider', name: 'Dragon Rider', requiredLevel: 18, description: 'A keeper who has earned the trust of their dragons enough to ride them.' },
  { id: 'title_lord', name: 'Dragon Lord', requiredLevel: 28, description: 'A powerful lord commanding a formidable dragon army across multiple biomes.' },
  { id: 'title_sage', name: 'Dragon Sage', requiredLevel: 38, description: 'A wise sage who understands the deepest secrets of dragon nature and magic.' },
  { id: 'title_elder', name: 'Dragon Elder', requiredLevel: 46, description: 'An ancient elder whose bond with dragons transcends mortal understanding.' },
  { id: 'title_god', name: 'Dragon God', requiredLevel: 50, description: 'The ultimate title. A being one with dragonkind, standing equal to the primordial dragons themselves.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: DR_EGG_TYPES — 15 Egg Types
// ═══════════════════════════════════════════════════════════════════

export const DR_EGG_TYPES: readonly DREggTypeDef[] = [
  // Common Eggs (5)
  { id: 'egg_fire_common', name: 'Smoldering Ember Egg', element: 'fire', rarity: 'common', hatchTime: 60, description: 'A warm egg that radiates gentle heat. Small flames dance across its surface.' },
  { id: 'egg_ice_common', name: 'Frosted Crystal Egg', element: 'ice', rarity: 'common', hatchTime: 60, description: 'An egg coated in a thin layer of ice crystals that sparkle in the light.' },
  { id: 'egg_lightning_common', name: 'Static Charge Egg', element: 'lightning', rarity: 'common', hatchTime: 55, description: 'An egg that crackles with tiny lightning bolts. Do not touch with wet hands.' },
  { id: 'egg_shadow_common', name: 'Dark Veil Egg', element: 'shadow', rarity: 'common', hatchTime: 65, description: 'An egg shrouded in wisps of darkness. It seems to absorb the light around it.' },
  { id: 'egg_nature_common', name: 'Moss-Covered Seed Egg', element: 'nature', rarity: 'common', hatchTime: 60, description: 'An egg covered in soft moss with tiny green shoots emerging from its shell.' },

  // Uncommon Eggs (4)
  { id: 'egg_fire_uncommon', name: 'Lava Core Egg', element: 'fire', rarity: 'uncommon', hatchTime: 120, description: 'An egg with veins of molten lava visible beneath its translucent shell.' },
  { id: 'egg_crystal_uncommon', name: 'Quartz Geode Egg', element: 'crystal', rarity: 'uncommon', hatchTime: 110, description: 'An egg that looks like a geode, with glittering crystal formations on its surface.' },
  { id: 'egg_storm_uncommon', name: 'Cloudswirl Egg', element: 'storm', rarity: 'uncommon', hatchTime: 100, description: 'An egg wreathed in a miniature storm cloud. Small rainbows appear in the mist.' },
  { id: 'egg_arcane_uncommon', name: 'Runestone Egg', element: 'arcane', rarity: 'uncommon', hatchTime: 115, description: 'An egg inscribed with glowing arcane runes that shift and change when unobserved.' },

  // Rare Eggs (3)
  { id: 'egg_ice_rare', name: 'Permafrost Egg', element: 'ice', rarity: 'rare', hatchTime: 240, description: 'An egg frozen in permafrost for thousands of years. A cold mist constantly emanates from it.' },
  { id: 'egg_shadow_rare', name: 'Void Seed Egg', element: 'shadow', rarity: 'rare', hatchTime: 260, description: 'An egg that occasionally phases in and out of visibility. It exists in two dimensions simultaneously.' },
  { id: 'egg_nature_rare', name: 'Ancient Bloom Egg', element: 'nature', rarity: 'rare', hatchTime: 250, description: 'An egg covered in flowers from species long extinct. Their fragrance has healing properties.' },

  // Epic Eggs (2)
  { id: 'egg_lightning_epic', name: 'Tempest Heart Egg', element: 'lightning', rarity: 'epic', hatchTime: 480, description: 'An egg containing a miniature storm. Lightning bolts arc from it to any nearby conductive surface.' },
  { id: 'egg_crystal_epic', name: 'Prismatic Diamond Egg', element: 'crystal', rarity: 'epic', hatchTime: 500, description: 'A diamond egg that refracts all light into perfect spectra. It is the most beautiful thing most people have ever seen.' },

  // Legendary Eggs (1)
  { id: 'egg_arcane_legendary', name: 'Cosmic Dragon Egg', element: 'arcane', rarity: 'legendary', hatchTime: 960, description: 'An egg that defies physics. It floats, glows with shifting colors, and seems to contain an entire galaxy within its shell.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: DR_FEED_ITEMS — 20 Dragon Feed Items
// ═══════════════════════════════════════════════════════════════════

export const DR_FEED_ITEMS: readonly DRFeedItemDef[] = [
  // Common Feed Items (6)
  { id: 'feed_fireberry', name: 'Fireberry', description: 'A spicy red berry that glows with inner heat. Fire dragons find it irresistible.', nutrition: 15, elementAffinity: 'fire', cost: 5 },
  { id: 'feed_icecress', name: 'Icecress', description: 'A crisp, cold leaf that never wilts. Excellent for ice dragon health.', nutrition: 15, elementAffinity: 'ice', cost: 5 },
  { id: 'feed_sparkgrain', name: 'Sparkgrain', description: 'A grain that generates tiny static charges. Feeds lightning dragons efficiently.', nutrition: 12, elementAffinity: 'lightning', cost: 5 },
  { id: 'feed_nightpetal', name: 'Nightpetal', description: 'A dark purple flower that only blooms in complete darkness. Shadow dragons love it.', nutrition: 14, elementAffinity: 'shadow', cost: 6 },
  { id: 'feed_stonefungus', name: 'Stone Fungus', description: 'A mineral-rich fungus that grows on cave walls. A hearty meal for crystal dragons.', nutrition: 18, elementAffinity: 'crystal', cost: 4 },
  { id: 'feed_windweed', name: 'Windweed', description: 'A light, airy plant that floats on the breeze. Storm dragons find it refreshing.', nutrition: 13, elementAffinity: 'storm', cost: 5 },

  // Uncommon Feed Items (6)
  { id: 'feed_lavabloom', name: 'Lavabloom', description: 'A flower that grows in volcanic soil. Its nectar is liquid fire, prized by fire dragons.', nutrition: 30, elementAffinity: 'fire', cost: 15 },
  { id: 'feed_glacier_mint', name: 'Glacier Mint', description: 'A mint leaf from glaciers that provides intense cooling. Boosts ice dragon frost breath.', nutrition: 28, elementAffinity: 'ice', cost: 15 },
  { id: 'feed_stormapple', name: 'Stormapple', description: 'An apple charged with electrical energy. One bite makes your hair stand on end.', nutrition: 25, elementAffinity: 'lightning', cost: 15 },
  { id: 'feed_voidmoss', name: 'Voidmoss', description: 'A dark moss from the void between dimensions. Shadow dragons absorb its nutrients through their scales.', nutrition: 26, elementAffinity: 'shadow', cost: 16 },
  { id: 'feed_gemgrass', name: 'Gemgrass', description: 'Blades of grass with crystalline tips that sparkle in light. Strengthens crystal dragon scales.', nutrition: 32, elementAffinity: 'crystal', cost: 14 },
  { id: 'feed_rainleaf', name: 'Rainleaf', description: 'A leaf permanently dripping with rainwater. Storm dragons find it deeply satisfying.', nutrition: 27, elementAffinity: 'storm', cost: 15 },

  // Rare Feed Items (5)
  { id: 'feed_inferno_nut', name: 'Inferno Nut', description: 'A nut so hot it must be stored in a fireproof container. Massive nutrition for fire dragons.', nutrition: 55, elementAffinity: 'fire', cost: 50 },
  { id: 'feed_everfrost_fruit', name: 'Everfrost Fruit', description: 'A fruit harvested from the eternal frost. Never melts and never spoils. A rare delicacy.', nutrition: 52, elementAffinity: 'ice', cost: 50 },
  { id: 'feed_thunder_root', name: 'Thunder Root', description: 'A root that has been struck by lightning thousands of times. Packed with electrical energy.', nutrition: 50, elementAffinity: 'lightning', cost: 50 },
  { id: 'feed_worldbark', name: 'Worldbark', description: 'Bark from the World Tree itself. Contains the accumulated wisdom and nutrition of ages.', nutrition: 60, elementAffinity: 'nature', cost: 55 },
  { id: 'feed_runeberry', name: 'Runeberry', description: 'A shimmering berry inscribed with ancient runes. Enhances arcane dragon magical abilities.', nutrition: 48, elementAffinity: 'arcane', cost: 50 },

  // Legendary Feed Items (3)
  { id: 'feed_dragon_ambrosia', name: 'Dragon Ambrosia', description: 'The mythical food of the gods, adapted for dragons. Eating it causes temporary invincibility and euphoria.', nutrition: 100, elementAffinity: 'neutral', cost: 500 },
  { id: 'feed_prismatic_honey', name: 'Prismatic Honey', description: 'Honey produced by crystal bees from the nectar of every element flower. Universally loved by all dragons.', nutrition: 90, elementAffinity: 'neutral', cost: 400 },
  { id: 'feed_elder_dragon_marrow', name: 'Elder Dragon Marrow', description: 'Marrow from the bones of a dragon elder. The most nutritious substance known to dragonkind.', nutrition: 120, elementAffinity: 'neutral', cost: 800 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════════

const DR_MAX_LEVEL = 50
const DR_INITIAL_INCUBATOR_SLOTS = 2

function drXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.3, level - 1))
}

function drCalculateStats(
  species: DRDragonSpecies,
  level: number
): { maxHP: number; attack: number; defense: number; speed: number } {
  const growth = 1 + (level - 1) * 0.1
  return {
    maxHP: Math.floor(species.hp * growth),
    attack: Math.floor(species.attack * growth),
    defense: Math.floor(species.defense * growth),
    speed: Math.floor(species.speed * growth),
  }
}

let _drIdCounter = 0
function drGenerateId(): string {
  _drIdCounter += 1
  return `dr_${_drIdCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`
}

function drGetElementColor(element: DRElement): string {
  const map: Record<DRElement, string> = {
    fire: DR_COLOR_FIRE,
    ice: DR_COLOR_ICE,
    lightning: DR_COLOR_LIGHTNING,
    shadow: DR_COLOR_SHADOW,
    crystal: DR_COLOR_CRYSTAL,
    storm: DR_COLOR_STORM,
    nature: DR_COLOR_NATURE,
    arcane: DR_COLOR_ARCANE,
  }
  return map[element] ?? '#888888'
}

function drGetRarityPower(rarity: DRRarity): number {
  const map: Record<DRRarity, number> = {
    common: 1,
    uncommon: 1.3,
    rare: 1.6,
    epic: 2.0,
    legendary: 2.5,
  }
  return map[rarity] ?? 1
}

function drGetElementAdvantage(attacker: DRElement, defender: DRElement): number {
  const advantages: Partial<Record<DRElement, DRElement[]>> = {
    fire: ['ice', 'nature'],
    ice: ['lightning', 'crystal'],
    lightning: ['shadow', 'storm'],
    shadow: ['arcane', 'nature'],
    crystal: ['shadow', 'lightning'],
    storm: ['nature', 'fire'],
    nature: ['crystal', 'storm'],
    arcane: ['fire', 'ice'],
  }
  if (advantages[attacker]?.includes(defender)) return 1.4
  if (advantages[defender]?.includes(attacker)) return 0.7
  return 1.0
}

function drPickRandomDragonForEgg(element: DRElement, rarity: DRRarity): DRDragonSpecies | null {
  const candidates = DR_DRAGONS.filter(
    (d) => d.element === element && d.rarity === rarity
  )
  if (candidates.length === 0) {
    const fallback = DR_DRAGONS.filter((d) => d.element === element)
    if (fallback.length === 0) return null
    return fallback[Math.floor(Math.random() * fallback.length)]
  }
  return candidates[Math.floor(Math.random() * candidates.length)]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

interface DRFullStore extends DRStoreState, DRStoreActions {}

const useDRStore = create<DRFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      dragons: [] as DRDragonInstance[],
      eggs: [] as DREggInstance[],
      nests: [
        {
          id: 'nest_volcanic_crag',
          nestDefId: 'volcanic_crag',
          name: 'My Volcanic Crag',
          dragonIds: [] as string[],
          level: 1,
          comfort: 50,
        },
      ] as DRNestInstance[],
      treasures: [] as string[],
      structures: [] as DRStructureInstance[],
      dragonFood: 10,
      gold: 200,
      dragonExp: 0,
      dragonLevel: 1,
      achievements: [] as string[],
      currentTitle: 'title_whelp',
      totalHatches: 0,
      totalFeeds: 0,
      totalBattles: 0,
      activeNestId: 'nest_volcanic_crag',
      incubatorSlots: DR_INITIAL_INCUBATOR_SLOTS,

      // ── drAcquireDragon ─────────────────────────────────────────
      drAcquireDragon(dragonId: string): boolean {
        const species = DR_DRAGONS.find((d) => d.id === dragonId)
        if (!species) return false

        const state = get()
        const nestCapacity = drGetTotalNestCapacity(state)
        if (state.dragons.length >= nestCapacity) return false

        const stats = drCalculateStats(species, 1)
        const instance: DRDragonInstance = {
          id: drGenerateId(),
          speciesId: dragonId,
          name: species.name,
          level: 1,
          xp: 0,
          currentHP: stats.maxHP,
          maxHP: stats.maxHP,
          attack: stats.attack,
          defense: stats.defense,
          speed: stats.speed,
          mood: 80,
          hunger: 80,
          trainedCount: 0,
        }

        set((s) => ({
          dragons: [...s.dragons, instance],
          dragonExp: s.dragonExp + 25,
        }))

        drCheckLevelUp(set, get)
        return true
      },

      // ── drReleaseDragon ─────────────────────────────────────────
      drReleaseDragon(dragonId: string): boolean {
        const state = get()
        const dragon = state.dragons.find((d) => d.id === dragonId)
        if (!dragon) return false

        const species = DR_DRAGONS.find((s) => s.id === dragon.speciesId)
        if (!species) return false

        const refundGold = Math.floor(20 * drGetRarityPower(species.rarity))

        set((s) => ({
          dragons: s.dragons.filter((d) => d.id !== dragonId),
          nests: s.nests.map((n) => ({
            ...n,
            dragonIds: n.dragonIds.filter((id) => id !== dragonId),
          })),
          gold: s.gold + refundGold,
        }))

        return true
      },

      // ── drHatchEgg ──────────────────────────────────────────────
      drHatchEgg(eggTypeId: string): boolean {
        const eggType = DR_EGG_TYPES.find((e) => e.id === eggTypeId)
        if (!eggType) return false

        const state = get()
        const cost = Math.floor(30 * drGetRarityPower(eggType.rarity))
        if (state.gold < cost) return false
        if (state.eggs.length >= state.incubatorSlots) return false

        const instance: DREggInstance = {
          id: drGenerateId(),
          eggTypeId,
          startedAt: Date.now(),
          progress: 0,
          hatched: false,
        }

        set((s) => ({
          eggs: [...s.eggs, instance],
          gold: s.gold - cost,
        }))

        return true
      },

      // ── drAccelerateHatch ───────────────────────────────────────
      drAccelerateHatch(eggInstanceId: string): boolean {
        const state = get()
        const egg = state.eggs.find((e) => e.id === eggInstanceId)
        if (!egg || egg.hatched) return false

        const eggType = DR_EGG_TYPES.find((t) => t.id === egg.eggTypeId)
        if (!eggType) return false

        const cost = Math.floor(50 * drGetRarityPower(eggType.rarity))
        if (state.gold < cost) return false

        const species = drPickRandomDragonForEgg(eggType.element, eggType.rarity)
        if (!species) return false

        const stats = drCalculateStats(species, 1)
        const newDragon: DRDragonInstance = {
          id: drGenerateId(),
          speciesId: species.id,
          name: species.name,
          level: 1,
          xp: 0,
          currentHP: stats.maxHP,
          maxHP: stats.maxHP,
          attack: stats.attack,
          defense: stats.defense,
          speed: stats.speed,
          mood: 90,
          hunger: 90,
          trainedCount: 0,
        }

        set((s) => ({
          eggs: s.eggs.filter((e) => e.id !== eggInstanceId),
          dragons: [...s.dragons, newDragon],
          gold: s.gold - cost,
          totalHatches: s.totalHatches + 1,
          dragonExp: s.dragonExp + 50,
        }))

        drCheckLevelUp(set, get)
        return true
      },

      // ── drFeedDragon ────────────────────────────────────────────
      drFeedDragon(dragonInstanceId: string, feedItemId: string): boolean {
        const feedItem = DR_FEED_ITEMS.find((f) => f.id === feedItemId)
        if (!feedItem) return false

        const state = get()
        if (state.dragonFood < feedItem.cost) return false

        const dragon = state.dragons.find((d) => d.id === dragonInstanceId)
        if (!dragon) return false

        const species = DR_DRAGONS.find((s) => s.id === dragon.speciesId)
        let nutritionBonus = feedItem.nutrition

        if (species && feedItem.elementAffinity === species.element) {
          nutritionBonus = Math.floor(nutritionBonus * 1.5)
        }

        const newMood = Math.min(100, dragon.mood + Math.floor(nutritionBonus * 0.3))
        const newHunger = Math.min(100, dragon.hunger + nutritionBonus)
        const newXp = dragon.xp + Math.floor(nutritionBonus * 0.5)

        const xpToLevel = drXpForLevel(dragon.level)
        let newLevel = dragon.level
        let currentXp = newXp
        let statsUpdated = false
        let updatedMaxHP = dragon.maxHP
        let updatedAttack = dragon.attack
        let updatedDefense = dragon.defense
        let updatedSpeed = dragon.speed

        if (currentXp >= xpToLevel && dragon.level < DR_MAX_LEVEL) {
          newLevel = dragon.level + 1
          currentXp = newXp - xpToLevel
          statsUpdated = true
        }

        if (statsUpdated && species) {
          const newStats = drCalculateStats(species, newLevel)
          updatedMaxHP = newStats.maxHP
          updatedAttack = newStats.attack
          updatedDefense = newStats.defense
          updatedSpeed = newStats.speed
        }

        set((s) => ({
          dragons: s.dragons.map((d) => {
            if (d.id !== dragonInstanceId) return d
            return {
              ...d,
              mood: newMood,
              hunger: newHunger,
              xp: currentXp,
              level: newLevel,
              maxHP: updatedMaxHP,
              attack: updatedAttack,
              defense: updatedDefense,
              speed: updatedSpeed,
            }
          }),
          dragonFood: s.dragonFood - feedItem.cost,
          totalFeeds: s.totalFeeds + 1,
          dragonExp: s.dragonExp + 10,
        }))

        drCheckLevelUp(set, get)
        return true
      },

      // ── drUpgradeStructure ──────────────────────────────────────
      drUpgradeStructure(structInstanceId: string): boolean {
        const state = get()
        const struct = state.structures.find((s) => s.id === structInstanceId)
        if (!struct) return false

        const def = DR_STRUCTURES.find((d) => d.id === struct.structureDefId)
        if (!def) return false

        if (struct.level >= 10) return false

        const cost = Math.floor(
          def.baseCost * Math.pow(def.upgradeCostMultiplier, struct.level)
        )
        if (state.gold < cost) return false

        set((s) => ({
          structures: s.structures.map((st) => {
            if (st.id !== structInstanceId) return st
            return { ...st, level: st.level + 1 }
          }),
          gold: s.gold - cost,
        }))

        return true
      },

      // ── drBuildStructure ────────────────────────────────────────
      drBuildStructure(structDefId: string): boolean {
        const def = DR_STRUCTURES.find((d) => d.id === structDefId)
        if (!def) return false

        const state = get()
        if (state.gold < def.baseCost) return false

        const instance: DRStructureInstance = {
          id: drGenerateId(),
          structureDefId: structDefId,
          level: 1,
          built: true,
        }

        set((s) => ({
          structures: [...s.structures, instance],
          gold: s.gold - def.baseCost,
        }))

        return true
      },

      // ── drDemolishStructure ─────────────────────────────────────
      drDemolishStructure(structInstanceId: string): boolean {
        const state = get()
        const struct = state.structures.find((s) => s.id === structInstanceId)
        if (!struct) return false

        const def = DR_STRUCTURES.find((d) => d.id === struct.structureDefId)
        if (!def) return false

        const refund = Math.floor(def.baseCost * 0.3 * struct.level)

        set((s) => ({
          structures: s.structures.filter((st) => st.id !== structInstanceId),
          gold: s.gold + refund,
        }))

        return true
      },

      // ── drCollectTreasure ───────────────────────────────────────
      drCollectTreasure(treasureId: string): boolean {
        const treasure = DR_TREASURES.find((t) => t.id === treasureId)
        if (!treasure) return false

        const state = get()
        if (state.treasures.includes(treasureId)) return false

        set((s) => ({
          treasures: [...s.treasures, treasureId],
          gold: s.gold + Math.floor(treasure.value * 0.5),
        }))

        return true
      },

      // ── drSellTreasure ──────────────────────────────────────────
      drSellTreasure(treasureId: string): number {
        const treasure = DR_TREASURES.find((t) => t.id === treasureId)
        if (!treasure) return 0

        const state = get()
        if (!state.treasures.includes(treasureId)) return 0

        set((s) => ({
          treasures: s.treasures.filter((t) => t !== treasureId),
          gold: s.gold + treasure.value,
        }))

        return treasure.value
      },

      // ── drSetNest ───────────────────────────────────────────────
      drSetNest(nestId: string | null): void {
        set({ activeNestId: nestId })
      },

      // ── drExpandIncubator ───────────────────────────────────────
      drExpandIncubator(): boolean {
        const state = get()
        const cost = 200 + (state.incubatorSlots - DR_INITIAL_INCUBATOR_SLOTS) * 300
        if (state.gold < cost) return false

        set((s) => ({
          incubatorSlots: s.incubatorSlots + 1,
          gold: s.gold - cost,
        }))

        return true
      },

      // ── drDragonBattle ──────────────────────────────────────────
      drDragonBattle(dragonAId: string, dragonBId: string): DRBattleResult | null {
        if (dragonAId === dragonBId) return null

        const state = get()
        const dragonA = state.dragons.find((d) => d.id === dragonAId)
        const dragonB = state.dragons.find((d) => d.id === dragonBId)

        if (!dragonA || !dragonB) return null

        const speciesA = DR_DRAGONS.find((s) => s.id === dragonA.speciesId)
        const speciesB = DR_DRAGONS.find((s) => s.id === dragonB.speciesId)
        if (!speciesA || !speciesB) return null

        const powerA =
          (dragonA.attack + dragonA.defense + dragonA.speed) *
          drGetRarityPower(speciesA.rarity)
        const powerB =
          (dragonB.attack + dragonB.defense + dragonB.speed) *
          drGetRarityPower(speciesB.rarity)

        const elementMult = drGetElementAdvantage(speciesA.element, speciesB.element)
        const effectiveA = powerA * elementMult
        const effectiveB = powerB / elementMult

        const rounds = 3 + Math.floor(Math.random() * 3)
        let scoreA = 0
        let scoreB = 0

        for (let i = 0; i < rounds; i++) {
          const rollA = effectiveA * (0.8 + Math.random() * 0.4)
          const rollB = effectiveB * (0.8 + Math.random() * 0.4)
          if (rollA >= rollB) {
            scoreA += 1
          } else {
            scoreB += 1
          }
        }

        const winnerId = scoreA >= scoreB ? dragonAId : dragonBId
        const loserId = scoreA >= scoreB ? dragonBId : dragonAId

        const goldReward = 20 + Math.floor(Math.random() * 40)
        const xpReward = 30 + Math.floor(Math.random() * 30)

        set((s) => ({
          totalBattles: s.totalBattles + 1,
          gold: s.gold + goldReward,
          dragonExp: s.dragonExp + xpReward,
          dragons: s.dragons.map((d) => {
            if (d.id === winnerId) {
              return { ...d, xp: d.xp + 15, mood: Math.min(100, d.mood + 5) }
            }
            if (d.id === loserId) {
              return { ...d, mood: Math.max(0, d.mood - 10) }
            }
            return d
          }),
        }))

        drCheckLevelUp(set, get)
        return { winnerId, loserId, rounds, goldReward, xpReward }
      },

      // ── drTrainDragon ───────────────────────────────────────────
      drTrainDragon(dragonInstanceId: string): boolean {
        const state = get()
        const dragon = state.dragons.find((d) => d.id === dragonInstanceId)
        if (!dragon) return false
        if (dragon.hunger < 20) return false

        const cost = 10 + dragon.level * 5
        if (state.gold < cost) return false

        const xpGain = 20 + dragon.level * 3
        const species = DR_DRAGONS.find((s) => s.id === dragon.speciesId)
        const statBoost = 1 + Math.floor(Math.random() * 3)
        const statChoices = ['attack', 'defense', 'speed'] as const
        const boostedStat = statChoices[Math.floor(Math.random() * statChoices.length)]

        const newXp = dragon.xp + xpGain
        const xpToLevel = drXpForLevel(dragon.level)
        let newLevel = dragon.level
        let currentXp = newXp

        if (currentXp >= xpToLevel && dragon.level < DR_MAX_LEVEL) {
          newLevel = dragon.level + 1
          currentXp = newXp - xpToLevel
        }

        let updatedMaxHP = dragon.maxHP
        let updatedAttack = dragon.attack
        let updatedDefense = dragon.defense
        let updatedSpeed = dragon.speed

        if (species) {
          const stats = drCalculateStats(species, newLevel)
          updatedMaxHP = stats.maxHP
          updatedAttack = stats.attack
          updatedDefense = stats.defense
          updatedSpeed = stats.speed
        }

        if (boostedStat === 'attack') updatedAttack += statBoost
        if (boostedStat === 'defense') updatedDefense += statBoost
        if (boostedStat === 'speed') updatedSpeed += statBoost

        set((s) => ({
          dragons: s.dragons.map((d) => {
            if (d.id !== dragonInstanceId) return d
            return {
              ...d,
              xp: currentXp,
              level: newLevel,
              maxHP: updatedMaxHP,
              attack: updatedAttack,
              defense: updatedDefense,
              speed: updatedSpeed,
              hunger: Math.max(0, d.hunger - 20),
              trainedCount: d.trainedCount + 1,
            }
          }),
          gold: s.gold - cost,
          dragonExp: s.dragonExp + 15,
        }))

        drCheckLevelUp(set, get)
        return true
      },

      // ── drUnlockTitle ───────────────────────────────────────────
      drUnlockTitle(titleId: string): boolean {
        const title = DR_TITLES.find((t) => t.id === titleId)
        if (!title) return false

        const state = get()
        if (state.dragonLevel < title.requiredLevel) return false

        set((s) => ({
          currentTitle: titleId,
        }))

        return true
      },

      // ── drClaimAchievement ──────────────────────────────────────
      drClaimAchievement(achievementId: string): boolean {
        const achievement = DR_ACHIEVEMENTS.find((a) => a.id === achievementId)
        if (!achievement) return false

        const state = get()
        if (state.achievements.includes(achievementId)) return false

        if (!drCheckAchievementCondition(state, achievementId)) return false

        set((s) => ({
          achievements: [...s.achievements, achievementId],
          gold: s.gold + 50,
          dragonExp: s.dragonExp + 25,
        }))

        drCheckLevelUp(set, get)
        return true
      },

      // ── drBuyFeed ───────────────────────────────────────────────
      drBuyFeed(count: number): boolean {
        if (count <= 0) return false

        const costPerUnit = 3
        const totalCost = count * costPerUnit

        const state = get()
        if (state.gold < totalCost) return false

        set((s) => ({
          dragonFood: s.dragonFood + count,
          gold: s.gold - totalCost,
        }))

        return true
      },

      // ── drGatherGold ────────────────────────────────────────────
      drGatherGold(): number {
        const state = get()
        const structureBonus = state.structures.reduce((acc, s) => {
          const def = DR_STRUCTURES.find((d) => d.id === s.structureDefId)
          if (!def) return acc
          if (def.id.startsWith('str_gold_') || def.id.startsWith('str_treasure_') || def.id.startsWith('str_trade_') || def.id.startsWith('str_gem_') || def.id.startsWith('str_dragon_bank')) {
            return acc + s.level * 5
          }
          return acc
        }, 0)

        const base = 10 + state.dragonLevel * 2
        const gathered = base + structureBonus

        set((s) => ({
          gold: s.gold + gathered,
        }))

        return gathered
      },
    }),
    {
      name: 'ws_dragon_roost',
      partialize: (state) => ({
        dragons: state.dragons,
        eggs: state.eggs,
        nests: state.nests,
        treasures: state.treasures,
        structures: state.structures,
        dragonFood: state.dragonFood,
        gold: state.gold,
        dragonExp: state.dragonExp,
        dragonLevel: state.dragonLevel,
        achievements: state.achievements,
        currentTitle: state.currentTitle,
        totalHatches: state.totalHatches,
        totalFeeds: state.totalFeeds,
        totalBattles: state.totalBattles,
        activeNestId: state.activeNestId,
        incubatorSlots: state.incubatorSlots,
      }),
    }
  )
)

// ── Store-level helper: check level up ──────────────────────────

function drCheckLevelUp(
  set: (fn: (s: DRFullStore) => Partial<DRFullStore>) => void,
  get: () => DRFullStore
): void {
  const state = get()
  if (state.dragonLevel >= DR_MAX_LEVEL) return

  const needed = drXpForLevel(state.dragonLevel)
  if (state.dragonExp < needed) return

  const newLevel = state.dragonLevel + 1
  const newExp = state.dragonExp - needed

  set(() => ({
    dragonLevel: newLevel,
    dragonExp: newExp,
  }))
}

function drCheckAchievementCondition(state: DRStoreState, achievementId: string): boolean {
  switch (achievementId) {
    case 'ach_first_hatch':
      return state.totalHatches >= 1
    case 'ach_hatch_10':
      return state.totalHatches >= 10
    case 'ach_hatch_50':
      return state.totalHatches >= 50
    case 'ach_hatch_100':
      return state.totalHatches >= 100
    case 'ach_feed_25':
      return state.totalFeeds >= 25
    case 'ach_feed_100':
      return state.totalFeeds >= 100
    case 'ach_battle_first':
      return state.totalBattles >= 1
    case 'ach_battle_25':
      return state.totalBattles >= 25
    case 'ach_battle_100':
      return state.totalBattles >= 100
    case 'ach_treasure_10':
      return state.treasures.length >= 10
    case 'ach_treasure_25':
      return state.treasures.length >= 25
    case 'ach_build_5':
      return state.structures.length >= 5
    case 'ach_upgrade_max':
      return state.structures.some((s) => s.level >= 10)
    case 'ach_nest_all':
      return state.nests.length >= 8
    case 'ach_dragon_10':
      return state.dragons.length >= 10
    case 'ach_dragon_30':
      return state.dragons.length >= 30
    case 'ach_level_25':
      return state.dragonLevel >= 25
    case 'ach_level_50':
      return state.dragonLevel >= 50
    default:
      return false
  }
}

function drGetTotalNestCapacity(state: DRStoreState): number {
  let capacity = 0
  for (const nest of state.nests) {
    const def = DR_NESTS.find((n) => n.id === nest.nestDefId)
    if (def) {
      capacity += def.baseCapacity + nest.level * 2
    }
  }
  const incubatorBonus = state.structures.filter(
    (s) => s.structureDefId.startsWith('str_basic_incubator') ||
           s.structureDefId.startsWith('str_enhanced_incubator') ||
           s.structureDefId.startsWith('str_elemental_incubator') ||
           s.structureDefId.startsWith('str_arcane_incubator') ||
           s.structureDefId.startsWith('str_dragon_heart_incubator')
  ).reduce((acc, s) => acc + s.level, 0)
  return capacity + incubatorBonus
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: MAIN HOOK — useDragonRoost()
// ═══════════════════════════════════════════════════════════════════

export default function useDragonRoost() {
  const store = useDRStore()

  const drGetOwnedDragons = useMemo(() => {
    return store.dragons.map((d) => {
      const species = DR_DRAGONS.find((s) => s.id === d.speciesId)
      return {
        ...d,
        species,
        elementColor: species ? drGetElementColor(species.element) : '#888888',
      }
    })
  }, [store.dragons])

  const drGetIncubatingEggs = useMemo(() => {
    return store.eggs.map((e) => {
      const eggType = DR_EGG_TYPES.find((t) => t.id === e.eggTypeId)
      return { ...e, eggType }
    })
  }, [store.eggs])

  const drGetAvailableEggTypes = useMemo(() => {
    return DR_EGG_TYPES.filter((t) => {
      const cost = Math.floor(30 * drGetRarityPower(t.rarity))
      return store.gold >= cost && store.eggs.length < store.incubatorSlots
    })
  }, [store.gold, store.eggs.length, store.incubatorSlots])

  const drGetTotalPower = useMemo(() => {
    return store.dragons.reduce((total, d) => {
      const species = DR_DRAGONS.find((s) => s.id === d.speciesId)
      if (!species) return total
      const rarityMult = drGetRarityPower(species.rarity)
      return total + Math.floor((d.attack + d.defense + d.speed) * rarityMult * (1 + d.level * 0.1))
    }, 0)
  }, [store.dragons])

  const drGetNestCapacity = useMemo(() => {
    return drGetTotalNestCapacity(store)
  }, [store])

  const drGetNextTitle = useMemo(() => {
    const current = DR_TITLES.find((t) => t.id === store.currentTitle)
    const currentIndex = DR_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIndex < DR_TITLES.length - 1) {
      return DR_TITLES[currentIndex + 1]
    }
    return current ?? DR_TITLES[0]
  }, [store.currentTitle])

  const drGetElementSummary = useMemo(() => {
    const summary: Record<DRElement, number> = {
      fire: 0,
      ice: 0,
      lightning: 0,
      shadow: 0,
      crystal: 0,
      storm: 0,
      nature: 0,
      arcane: 0,
    }
    for (const dragon of store.dragons) {
      const species = DR_DRAGONS.find((s) => s.id === dragon.speciesId)
      if (species) {
        summary[species.element] += 1
      }
    }
    return summary
  }, [store.dragons])

  const drGetRaritySummary = useMemo(() => {
    const summary: Record<DRRarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const dragon of store.dragons) {
      const species = DR_DRAGONS.find((s) => s.id === dragon.speciesId)
      if (species) {
        summary[species.rarity] += 1
      }
    }
    return summary
  }, [store.dragons])

  const drGetAvailableStructures = useMemo(() => {
    const builtIds = new Set(store.structures.map((s) => s.structureDefId))
    return DR_STRUCTURES.filter((def) => !builtIds.has(def.id) && store.gold >= def.baseCost)
  }, [store.structures, store.gold])

  const drGetUpgradeCost = useMemo(() => {
    const costs: Record<string, number> = {}
    for (const struct of store.structures) {
      const def = DR_STRUCTURES.find((d) => d.id === struct.structureDefId)
      if (def) {
        costs[struct.id] = Math.floor(
          def.baseCost * Math.pow(def.upgradeCostMultiplier, struct.level)
        )
      }
    }
    return costs
  }, [store.structures])

  const drGetDragonById = useMemo(() => {
    const map: Record<string, DRDragonInstance & { species?: DRDragonSpecies }> = {}
    for (const d of store.dragons) {
      const species = DR_DRAGONS.find((s) => s.id === d.speciesId)
      map[d.id] = { ...d, species }
    }
    return map
  }, [store.dragons])

  const drGetBattlePrediction = useMemo(() => {
    return (dragonAId: string, dragonBId: string): { winChance: number; favorite: string | null } => {
      const dragonA = store.dragons.find((d) => d.id === dragonAId)
      const dragonB = store.dragons.find((d) => d.id === dragonBId)

      if (!dragonA || !dragonB) return { winChance: 50, favorite: null }

      const speciesA = DR_DRAGONS.find((s) => s.id === dragonA.speciesId)
      const speciesB = DR_DRAGONS.find((s) => s.id === dragonB.speciesId)

      if (!speciesA || !speciesB) return { winChance: 50, favorite: null }

      const powerA = (dragonA.attack + dragonA.defense + dragonA.speed) * drGetRarityPower(speciesA.rarity)
      const powerB = (dragonB.attack + dragonB.defense + dragonB.speed) * drGetRarityPower(speciesB.rarity)

      const elementMult = drGetElementAdvantage(speciesA.element, speciesB.element)
      const effectiveA = powerA * elementMult
      const effectiveB = powerB / elementMult

      const total = effectiveA + effectiveB
      if (total === 0) return { winChance: 50, favorite: null }

      const winChance = Math.round((effectiveA / total) * 100)
      const favorite = effectiveA >= effectiveB ? dragonAId : dragonBId

      return { winChance, favorite }
    }
  }, [store.dragons])

  const drGetUnlockedAchievements = useMemo(() => {
    const unlocked: DRAchievementDef[] = []
    const claimable: DRAchievementDef[] = []

    for (const ach of DR_ACHIEVEMENTS) {
      if (store.achievements.includes(ach.id)) {
        unlocked.push(ach)
      } else if (drCheckAchievementCondition(store, ach.id)) {
        claimable.push(ach)
      }
    }

    return { unlocked, claimable }
  }, [store])

  const drGetTitleProgress = useMemo(() => {
    return DR_TITLES.map((title) => ({
      ...title,
      unlocked: store.dragonLevel >= title.requiredLevel,
      active: store.currentTitle === title.id,
    }))
  }, [store.currentTitle, store.dragonLevel])

  const drActiveNest = useMemo(() => {
    if (!store.activeNestId) return null
    return store.nests.find((n) => n.id === store.activeNestId) ?? null
  }, [store.activeNestId, store.nests])

  const drLevelProgress = useMemo(() => {
    const current = drXpForLevel(store.dragonLevel)
    return {
      level: store.dragonLevel,
      currentXp: store.dragonExp,
      xpToNext: current,
      progressPercent: current > 0 ? Math.min(100, Math.floor((store.dragonExp / current) * 100)) : 0,
      maxLevel: store.dragonLevel >= DR_MAX_LEVEL,
    }
  }, [store.dragonLevel, store.dragonExp])

  const drTreasureCollection = useMemo(() => {
    return store.treasures.map((id) => DR_TREASURES.find((t) => t.id === id)).filter(Boolean) as DRTreasureDef[]
  }, [store.treasures])

  const drTopDragon = useMemo(() => {
    if (store.dragons.length === 0) return null
    return store.dragons.reduce((best, d) => {
      const species = DR_DRAGONS.find((s) => s.id === d.speciesId)
      const rarity = species ? drGetRarityPower(species.rarity) : 1
      const power = (d.attack + d.defense + d.speed) * rarity * (1 + d.level * 0.1)
      const bestSpecies = DR_DRAGONS.find((s) => s.id === best.speciesId)
      const bestRarity = bestSpecies ? drGetRarityPower(bestSpecies.rarity) : 1
      const bestPower = (best.attack + best.defense + best.speed) * bestRarity * (1 + best.level * 0.1)
      return power > bestPower ? d : best
    })
  }, [store.dragons])

  // ── Assemble drAPI ─────────────────────────────────────────────

  const drAPI = {
    // Constants
    DR_ELEMENTS,
    DR_DRAGONS,
    DR_NESTS,
    DR_TREASURES,
    DR_STRUCTURES,
    DR_ABILITIES,
    DR_ACHIEVEMENTS,
    DR_TITLES,
    DR_EGG_TYPES,
    DR_FEED_ITEMS,
    DR_COLOR_FIRE,
    DR_COLOR_ICE,
    DR_COLOR_LIGHTNING,
    DR_COLOR_SHADOW,
    DR_COLOR_CRYSTAL,
    DR_COLOR_STORM,
    DR_COLOR_NATURE,
    DR_COLOR_ARCANE,

    // State
    dragons: store.dragons,
    eggs: store.eggs,
    nests: store.nests,
    treasures: store.treasures,
    structures: store.structures,
    dragonFood: store.dragonFood,
    gold: store.gold,
    dragonExp: store.dragonExp,
    dragonLevel: store.dragonLevel,
    achievements: store.achievements,
    currentTitle: store.currentTitle,
    totalHatches: store.totalHatches,
    totalFeeds: store.totalFeeds,
    totalBattles: store.totalBattles,
    activeNestId: store.activeNestId,
    incubatorSlots: store.incubatorSlots,

    // Actions
    drAcquireDragon: store.drAcquireDragon,
    drReleaseDragon: store.drReleaseDragon,
    drHatchEgg: store.drHatchEgg,
    drAccelerateHatch: store.drAccelerateHatch,
    drFeedDragon: store.drFeedDragon,
    drUpgradeStructure: store.drUpgradeStructure,
    drBuildStructure: store.drBuildStructure,
    drDemolishStructure: store.drDemolishStructure,
    drCollectTreasure: store.drCollectTreasure,
    drSellTreasure: store.drSellTreasure,
    drSetNest: store.drSetNest,
    drExpandIncubator: store.drExpandIncubator,
    drDragonBattle: store.drDragonBattle,
    drTrainDragon: store.drTrainDragon,
    drUnlockTitle: store.drUnlockTitle,
    drClaimAchievement: store.drClaimAchievement,
    drBuyFeed: store.drBuyFeed,
    drGatherGold: store.drGatherGold,

    // Getters
    drGetOwnedDragons,
    drGetIncubatingEggs,
    drGetAvailableEggTypes,
    drGetTotalPower,
    drGetNestCapacity,
    drGetNextTitle,
    drGetElementSummary,
    drGetRaritySummary,
    drGetAvailableStructures,
    drGetUpgradeCost,
    drGetDragonById,
    drGetBattlePrediction,
    drGetUnlockedAchievements,
    drGetTitleProgress,
    drActiveNest,
    drLevelProgress,
    drTreasureCollection,
    drTopDragon,
  }

  return drAPI
}
