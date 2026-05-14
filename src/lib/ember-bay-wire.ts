/**
 * Ember Bay Wire — 烬湾 (Ember Bay) feature module for Word Snake
 *
 * A volcanic bay exploration and management mini-game: explore 8 ember zones,
 * collect 30 materials, tame 35 ember creatures, build 25 bay structures,
 * forge ember recipes, command 10 exploration ships, and survive 12 volcanic
 * events — backed by a Zustand store with persist middleware.
 *
 * Storage key: ws_ember_bay
 * Prefix: eb / EB_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type EBRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type EBCreatureType = 'fire' | 'ash' | 'lava' | 'obsidian' | 'smoke'
export type EBElement = 'fire' | 'ash' | 'lava' | 'obsidian' | 'smoke' | 'magma' | 'steam' | 'ember'

export interface EBZoneDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly dangerLevel: number
  readonly unlockLevel: number
  readonly resources: string[]
}

export interface EBCreatureDef {
  readonly id: string
  readonly name: string
  readonly rarity: EBRarity
  readonly type: EBCreatureType
  readonly hp: number
  readonly attack: number
  readonly defense: number
  readonly description: string
  readonly abilities: string[]
}

export interface EBCreatureInstance {
  readonly id: string
  creatureDefId: string
  name: string
  level: number
  currentHP: number
  maxHP: number
  attack: number
  defense: number
  trainedCount: number
  acquiredAt: number
}

export interface EBMaterialDef {
  readonly id: string
  readonly name: string
  readonly rarity: EBRarity
  readonly source: string
  readonly description: string
  readonly value: number
}

export interface EBStructureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly upgradeCostMultiplier: number
}

export interface EBStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  built: boolean
}

export interface EBRecipeDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredMaterials: { materialId: string; amount: number }[]
  readonly result: string
  readonly rarity: EBRarity
}

export interface EBAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly element: EBElement
}

export interface EBAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface EBTitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredExplored: number
}

export interface EBShipDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly capacity: number
  readonly speed: number
  readonly durability: number
  readonly unlockLevel: number
  readonly baseCost: number
}

export interface EBShipInstance {
  readonly id: string
  shipDefId: string
  currentDurability: number
  maxDurability: number
  launched: boolean
  launchedAt: number | null
}

export interface EBEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly duration: number
  readonly effects: string[]
}

export interface EBStoreState {
  exploredZones: string[]
  collectedMaterials: Record<string, number>
  creatures: EBCreatureInstance[]
  structures: EBStructureInstance[]
  recipes: string[]
  ships: EBShipInstance[]
  achievements: string[]
  currentTitle: string
  bayLevel: number
  bayExp: number
  gold: number
  emberEnergy: number
  totalCollected: number
  totalForged: number
  totalExplored: number
  totalShipsLaunched: number
  activeZoneId: string | null
  activeEventId: string | null
  eventTimer: number
  smelterTemperature: number
}

export interface EBStoreActions {
  ebExploreZone: (zoneId: string) => boolean
  ebCollectMaterial: (materialId: string) => number
  ebSmeltOre: (recipeId: string) => boolean
  ebBuildStructure: (structDefId: string) => boolean
  ebUpgradeStructure: (structId: string) => boolean
  ebDemolishStructure: (structId: string) => boolean
  ebAcquireCreature: (creatureId: string) => boolean
  ebReleaseCreature: (instanceId: string) => boolean
  ebTrainCreature: (instanceId: string) => boolean
  ebLaunchShip: (shipId: string) => boolean
  ebReturnShip: (shipId: string) => boolean
  ebRepairShip: (shipId: string) => boolean
  ebRespondEvent: (eventId: string) => boolean
  ebFleeEvent: () => void
  ebForgeEmber: (materialIds: string[]) => boolean
  ebAdjustSmelter: (temperature: number) => boolean
  ebUnlockTitle: (titleId: string) => boolean
  ebClaimAchievement: (achievementId: string) => boolean
  ebBuyShip: (shipDefId: string) => boolean
  ebTradeMaterials: (matA: string, matB: string, count: number) => boolean
}

export type EBFullStore = EBStoreState & EBStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const EB_COLOR_ASH: string = '#707070'
export const EB_COLOR_EMBER: string = '#FF6600'
export const EB_COLOR_LAVA: string = '#FF2200'
export const EB_COLOR_MAGMA: string = '#CC0000'
export const EB_COLOR_OBSIDIAN: string = '#1A1A2E'
export const EB_COLOR_SMOKE: string = '#A9A9A9'
export const EB_COLOR_FIRE: string = '#FFD700'
export const EB_COLOR_COAL: string = '#36454F'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: XP & LEVEL HELPERS
// ═══════════════════════════════════════════════════════════════════

const EB_MAX_LEVEL = 50

function ebXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= EB_MAX_LEVEL) return Infinity
  return Math.floor(80 * Math.pow(1.15, level) + level * 15)
}

function ebLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < EB_MAX_LEVEL) {
    const needed = ebXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function ebGenerateId(): string {
  return `eb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function ebRarityPower(rarity: EBRarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.4
    case 'rare': return 2.0
    case 'epic': return 3.2
    case 'legendary': return 5.5
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: EB_ZONES — 8 Volcanic Bay Zones
// ═══════════════════════════════════════════════════════════════════

export const EB_ZONES: readonly EBZoneDef[] = [
  {
    id: 'ashen_shore',
    name: 'Ashen Shore',
    description:
      'A desolate coastline blanketed in layers of gray volcanic ash. The sand here is warm to the touch, and geysers of steam erupt where the tide meets the blackened beach. The perfect starting ground for aspiring bay explorers.',
    dangerLevel: 1,
    unlockLevel: 1,
    resources: ['volcanic_ash', 'coal_chunk', 'obsidian_pebble', 'ash_crystal'],
  },
  {
    id: 'lava_tidepool',
    name: 'Lava Tidepool',
    description:
      'Shallow pools of cooling lava dot this surreal landscape, creating natural hot springs that glow orange at dusk. Strange fire-resistant algae bloom along the edges, and small creatures lounge in the warmth.',
    dangerLevel: 2,
    unlockLevel: 3,
    resources: ['lava_crystal', 'fire_algae', 'magma_pebble', 'ember_stone'],
  },
  {
    id: 'cinder_reef',
    name: 'Cinder Reef',
    description:
      'An underwater reef formed entirely from cooled volcanic cinder. Bioluminescent organisms light the waters in eerie shades of amber and crimson, attracting rare sea creatures adapted to extreme temperatures.',
    dangerLevel: 3,
    unlockLevel: 6,
    resources: ['cinder_coral', 'fire_pearl', 'ash_shell', 'lava_sponge'],
  },
  {
    id: 'magma_grotto',
    name: 'Magma Grotto',
    description:
      'A vast cavern carved by ancient magma flows, where molten rock still drips from the ceiling in slow, glowing streams. The walls shimmer with embedded gemstones that fluoresce in the volcanic heat.',
    dangerLevel: 4,
    unlockLevel: 10,
    resources: ['magma_crystal', 'obsidian_shard', 'fire_opal', 'ember_gem'],
  },
  {
    id: 'smoldering_depths',
    name: 'Smoldering Depths',
    description:
      'Deep underground tunnels where the air itself seems to burn. This labyrinth of volcanic passages is home to the most dangerous creatures in the bay. Only seasoned explorers dare venture this far.',
    dangerLevel: 5,
    unlockLevel: 15,
    resources: ['smoke_quartz', 'infernal_coal', 'ember_core', 'flame_resin'],
  },
  {
    id: 'obsidian_cove',
    name: 'Obsidian Cove',
    description:
      'A hidden cove where the cliffs are made of perfect black obsidian glass. The water is mirror-still, reflecting the blood-red sky. Ancient carvings on the cliff faces tell stories of a civilization that once worshiped the volcano.',
    dangerLevel: 6,
    unlockLevel: 20,
    resources: ['pristine_obsidian', 'shadow_glass', 'volcanic_diamond', 'ash_pearl'],
  },
  {
    id: 'scoria_islands',
    name: 'Scoria Islands',
    description:
      'A scattered archipelago of floating volcanic rock, buoyed by trapped gases beneath. Each island is a micro-ecosystem of fire-adapted flora and fauna, connected by treacherous bridges of cooling lava.',
    dangerLevel: 7,
    unlockLevel: 28,
    resources: ['scoria_ore', 'floating_pumice', 'fire_feather', 'magma_infinity_stone'],
  },
  {
    id: 'primordial_caldera',
    name: 'Primordial Caldera',
    description:
      'The heart of the volcanic bay — a massive caldera filled with a lake of liquid fire. This is where the world was born in flame, and where the most powerful creatures and materials can be found. Only legends reach this place.',
    dangerLevel: 8,
    unlockLevel: 35,
    resources: ['primordial_ember', 'world_core_shard', 'phoenix_ash', 'eternal_flame_essence'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: EB_CREATURES — 35 Ember Creatures (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const EB_CREATURES: readonly EBCreatureDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'ash_fox',
    name: 'Ash Fox',
    rarity: 'common',
    type: 'ash',
    hp: 40,
    attack: 12,
    defense: 8,
    description:
      'A small vulpine creature with fur the color of cooling ash. It scavenges the shoreline for discarded embers to line its nest.',
    abilities: ['ash_dash', 'ember_sense'],
  },
  {
    id: 'fire_newt',
    name: 'Fire Newt',
    rarity: 'common',
    type: 'fire',
    hp: 25,
    attack: 8,
    defense: 6,
    description:
      'A tiny amphibian that thrives in lava tidepools. Its skin glows with a faint orange luminescence when excited.',
    abilities: ['fire_bite', 'thermal_hide'],
  },
  {
    id: 'smoke_sparrow',
    name: 'Smoke Sparrow',
    rarity: 'common',
    type: 'smoke',
    hp: 20,
    attack: 10,
    defense: 4,
    description:
      'A bird made of living smoke and cinder. It leaves trails of gray haze when it flies, confusing predators.',
    abilities: ['smoke_screen', 'cinder_peck'],
  },
  {
    id: 'coal_beetle',
    name: 'Coal Beetle',
    rarity: 'common',
    type: 'ash',
    hp: 50,
    attack: 6,
    defense: 20,
    description:
      'A heavily armored beetle with a shell of compressed coal. It rolls into a ball when threatened, nearly impervious to damage.',
    abilities: ['coal_roll', 'hard_shell'],
  },
  {
    id: 'lava_worm',
    name: 'Lava Worm',
    rarity: 'common',
    type: 'lava',
    hp: 35,
    attack: 14,
    defense: 5,
    description:
      'A segmented worm that swims through shallow magma flows. Its mandibles can chew through volcanic rock with ease.',
    abilities: ['magma_burrow', 'rock_chew'],
  },
  {
    id: 'ember_moth',
    name: 'Ember Moth',
    rarity: 'common',
    type: 'fire',
    hp: 18,
    attack: 7,
    defense: 3,
    description:
      'A delicate moth whose wings are made of living flame. It is drawn to the brightest heat sources and can set fires unintentionally.',
    abilities: ['flame_wing', 'inferno_attraction'],
  },
  {
    id: 'obsidian_crab',
    name: 'Obsidian Crab',
    rarity: 'common',
    type: 'obsidian',
    hp: 45,
    attack: 10,
    defense: 18,
    description:
      'A crab with a shell of natural obsidian glass. Its claws are sharper than steel blades and can cut through most materials.',
    abilities: ['glass_claw', 'reflective_shell'],
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'cinder_hawk',
    name: 'Cinder Hawk',
    rarity: 'uncommon',
    type: 'fire',
    hp: 55,
    attack: 22,
    defense: 12,
    description:
      'A raptor of prey that rides thermal updrafts above the volcanic bay. Its dive attacks ignite the air with friction heat.',
    abilities: ['thermal_dive', 'fire_screech'],
  },
  {
    id: 'magma_toad',
    name: 'Magma Toad',
    rarity: 'uncommon',
    type: 'lava',
    hp: 80,
    attack: 16,
    defense: 28,
    description:
      'A large amphibian found in the deepest lava pools. It swallows rocks and regurgitates molten projectiles at enemies.',
    abilities: ['lava_spit', 'stone_belly'],
  },
  {
    id: 'ash_elemental',
    name: 'Ash Elemental',
    rarity: 'uncommon',
    type: 'ash',
    hp: 60,
    attack: 20,
    defense: 15,
    description:
      'A sentient column of swirling volcanic ash. It can disperse and reform at will, making it nearly impossible to pin down.',
    abilities: ['ash_storm', 'disperse'],
  },
  {
    id: 'fire_serpent',
    name: 'Fire Serpent',
    rarity: 'uncommon',
    type: 'fire',
    hp: 70,
    attack: 25,
    defense: 10,
    description:
      'A sinuous serpent that coils through magma channels. Its scales radiate intense heat and can melt steel on contact.',
    abilities: ['constricting_heat', 'molten_slither'],
  },
  {
    id: 'smoke_wraith',
    name: 'Smoke Wraith',
    rarity: 'uncommon',
    type: 'smoke',
    hp: 45,
    attack: 28,
    defense: 8,
    description:
      'The spirit of volcanic smoke given form. It drifts through solid walls and suffocates prey with clouds of toxic fumes.',
    abilities: ['suffocate', 'phase_through'],
  },
  {
    id: 'obsidian_golem',
    name: 'Obsidian Golem',
    rarity: 'uncommon',
    type: 'obsidian',
    hp: 120,
    attack: 18,
    defense: 35,
    description:
      'A hulking humanoid figure carved from volcanic glass. Ancient magic animates its crystalline body, making it an unstoppable force.',
    abilities: ['glass_fist', 'crystal_armor'],
  },
  {
    id: 'lava_skink',
    name: 'Lava Skink',
    rarity: 'uncommon',
    type: 'lava',
    hp: 50,
    attack: 24,
    defense: 14,
    description:
      'A swift lizard that sprints across the surface of lava pools without sinking. Its tail leaves a trail of molten glass.',
    abilities: ['lava_run', 'molten_tail_whip'],
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'inferno_wolf',
    name: 'Inferno Wolf',
    rarity: 'rare',
    type: 'fire',
    hp: 100,
    attack: 35,
    defense: 22,
    description:
      'The alpha predator of the volcanic shoreline. Its howl causes spontaneous combustion in nearby vegetation, and its pack hunts with coordinated firestorms.',
    abilities: ['fire_howl', 'pack_inferno', 'blazing_fangs'],
  },
  {
    id: 'magma_turtle',
    name: 'Magma Turtle',
    rarity: 'rare',
    type: 'lava',
    hp: 180,
    attack: 15,
    defense: 50,
    description:
      'An ancient turtle whose shell is a miniature volcano. Lava flows between the ridges of its carapace, creating a natural forge on its back.',
    abilities: ['volcano_shell', 'lava_flow', 'tectonic_stomp'],
  },
  {
    id: 'ash_phoenix',
    name: 'Ash Phoenix',
    rarity: 'rare',
    type: 'ash',
    hp: 85,
    attack: 40,
    defense: 18,
    description:
      'A lesser phoenix born from the ashes of burnt forests. It can resurrect itself once per battle, rising from its own cinders stronger than before.',
    abilities: ['ash_rebirth', 'cinder_storm', 'wing_blaze'],
  },
  {
    id: 'obsidian_dragon',
    name: 'Obsidian Dragon',
    rarity: 'rare',
    type: 'obsidian',
    hp: 140,
    attack: 42,
    defense: 38,
    description:
      'A juvenile dragon with scales of pure obsidian. Light refracts through its wings in dazzling patterns. Its breath weapon shatters like broken glass.',
    abilities: ['glass_breath', 'obsidian_scales', 'shard_rain'],
  },
  {
    id: 'smoke_leopard',
    name: 'Smoke Leopard',
    rarity: 'rare',
    type: 'smoke',
    hp: 95,
    attack: 38,
    defense: 20,
    description:
      'A stealthy predator that turns completely invisible in smoke and ash clouds. It strikes from nowhere and vanishes before its prey hits the ground.',
    abilities: ['smokecloak', 'phantom_strike', 'ash_step'],
  },
  {
    id: 'lava_mantis',
    name: 'Lava Mantis',
    rarity: 'rare',
    type: 'lava',
    hp: 75,
    attack: 45,
    defense: 15,
    description:
      'A towering insect predator that lurks near magma flows. Its scythe-like arms can slice through stone and metal with equal ease.',
    abilities: ['molten_scythe', 'volcanic_ambush', 'heat_blades'],
  },
  {
    id: 'fire_golem',
    name: 'Fire Golem',
    rarity: 'rare',
    type: 'fire',
    hp: 160,
    attack: 30,
    defense: 42,
    description:
      'A massive construct of animated flame and stone. Forged by ancient volcanic shamans, it guards the deeper passages of the bay.',
    abilities: ['flame_body', 'eruption_slam', 'molten_fortress'],
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'inferno_serpent',
    name: 'Inferno Serpent King',
    rarity: 'epic',
    type: 'fire',
    hp: 220,
    attack: 55,
    defense: 35,
    description:
      'The undisputed ruler of the magma grotto. This colossal serpent can swallow ships whole and its body temperature exceeds 3000 degrees. Legends say it has slept for centuries beneath the bay.',
    abilities: ['apocalypse_breath', 'constricting_inferno', 'magma_tsunami', 'volcanic_awakening'],
  },
  {
    id: 'obsidian_titan',
    name: 'Obsidian Titan',
    rarity: 'epic',
    type: 'obsidian',
    hp: 350,
    attack: 40,
    defense: 65,
    description:
      'A war machine from an extinct civilization, rebuilt from volcanic glass. Its crystalline body is harder than diamond, and it wields a sword of condensed shadow.',
    abilities: ['diamond_fist', 'shadow_blade', 'crystal_barrier', 'titanic_slam'],
  },
  {
    id: 'ash_specter',
    name: 'Ash Specter',
    rarity: 'epic',
    type: 'ash',
    hp: 180,
    attack: 60,
    defense: 25,
    description:
      'The vengeful spirit of a volcanic eruption that destroyed an entire civilization. It manifests as a towering figure of swirling gray ash that drains the life force of everything nearby.',
    abilities: ['life_drain', 'ash_cyclone', 'deathly_haze', 'eruption_recall'],
  },
  {
    id: 'lava_kraken',
    name: 'Lava Kraken',
    rarity: 'epic',
    type: 'lava',
    hp: 280,
    attack: 50,
    defense: 40,
    description:
      'A colossal tentacled beast that dwells in the lava-filled depths beneath the bay. Each of its tentacles is a conduit for molten rock, and it can create islands by surfacing.',
    abilities: ['tentacle_magma', 'volcanic_emerge', 'lava_whirlpool', 'magma_jet'],
  },
  {
    id: 'smoke_dragon',
    name: 'Smoke Dragon',
    rarity: 'epic',
    type: 'smoke',
    hp: 200,
    attack: 58,
    defense: 30,
    description:
      'An elusive dragon that exists primarily in a gaseous state. It can fill entire valleys with toxic volcanic smoke and hunt by asphyxiation. Its true form has only been glimpsed once.',
    abilities: ['choking_breath', 'gaseous_form', 'smoke_nexus', 'suffocating_roar'],
  },
  {
    id: 'ember_colossus',
    name: 'Ember Colossus',
    rarity: 'epic',
    type: 'fire',
    hp: 300,
    attack: 45,
    defense: 55,
    description:
      'A walking mountain of compacted volcanic material, animated by the sheer pressure of magma beneath it. When it walks, the ground cracks and lava seeps through.',
    abilities: ['seismic_stomp', 'lava_bleed', 'ember_aura', 'magma_heart'],
  },
  {
    id: 'cinder_phoenix',
    name: 'Cinder Phoenix',
    rarity: 'epic',
    type: 'ash',
    hp: 160,
    attack: 65,
    defense: 28,
    description:
      'A great phoenix born from the cinders of a thousand burnt forests. Its flames carry the memory of every tree that ever burned, and it can resurrect endlessly from its ashes.',
    abilities: ['eternal_rebirth', 'cinder_rain', 'blazing_requiem', 'ash_storm_surge'],
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'primordial_firewyrm',
    name: 'Primordial Firewyrm',
    rarity: 'legendary',
    type: 'fire',
    hp: 500,
    attack: 80,
    defense: 60,
    description:
      'The first creature to emerge from the original volcanic eruption that created the bay. Its flames are the same fire that forged the world. To see it is to witness creation itself.',
    abilities: ['creation_fire', 'world_forge', 'primordial_roar', 'eternal_blaze', 'genesis_eruption'],
  },
  {
    id: 'obsidian_sovereign',
    name: 'Obsidian Sovereign',
    rarity: 'legendary',
    type: 'obsidian',
    hp: 450,
    attack: 70,
    defense: 90,
    description:
      'A being of perfect volcanic glass that reflects all damage. The Obsidian Sovereign commands every shard of obsidian in the bay, forming weapons and shields from thin air.',
    abilities: ['absolute_reflect', 'shard_army', 'glass_domain', 'prismatic_barrier', 'obsidian_singularity'],
  },
  {
    id: 'ash_emperor',
    name: 'Ash Emperor',
    rarity: 'legendary',
    type: 'ash',
    hp: 400,
    attack: 85,
    defense: 50,
    description:
      'The lord of all ash and cinder. The Ash Emperor can reduce any material to fine gray powder with a single touch. Mountains bow before its presence, reduced to plains of gray.',
    abilities: ['decay_touch', 'ash_emperor_domain', 'gray_apocalypse', 'cinder_legion', 'world_to_ash'],
  },
  {
    id: 'lava_leviathan',
    name: 'Lava Leviathan',
    rarity: 'legendary',
    type: 'lava',
    hp: 600,
    attack: 75,
    defense: 70,
    description:
      'A creature so massive it IS the volcanic bay. The Lava Leviathan sleeps in the mantle beneath, and the bay is merely the surface of its back. When it stirs, islands sink and new ones rise.',
    abilities: ['tectonic_shift', 'mantle_eruption', 'island_creator', 'magma_ocean', 'world_crust'],
  },
  {
    id: 'smoke_voidwalker',
    name: 'Smoke Voidwalker',
    rarity: 'legendary',
    type: 'smoke',
    hp: 350,
    attack: 90,
    defense: 40,
    description:
      'A creature that exists between the material world and the void. It manifests as smoke that has swallowed light itself. Those who gaze into its form see the end of all things.',
    abilities: ['void_smoke', 'light_devourer', 'dimensional_haze', 'annihilation_fog', 'oblivion_breath'],
  },
  {
    id: 'ember_phoenix_queen',
    name: 'Ember Phoenix Queen',
    rarity: 'legendary',
    type: 'fire',
    hp: 380,
    attack: 88,
    defense: 55,
    description:
      'The matriarch of all phoenix-kind. Her wings span the entire caldera, and her song can reignite dead volcanoes. She has died and been reborn a thousand times, each incarnation more powerful.',
    abilities: ['phoenix_requiem', 'rebirth_nova', 'ember_crown', 'infinite_resurrection', 'solar_pyre'],
  },
  {
    id: 'magma_core_dragon',
    name: 'Magma Core Dragon',
    rarity: 'legendary',
    type: 'lava',
    hp: 550,
    attack: 95,
    defense: 65,
    description:
      'A dragon born from the liquid core of the planet itself. Its body is pure magma contained within an indestructible crystalline shell. It is the living heart of the world, and it dreams of fire.',
    abilities: ['core_breath', 'planetary_magma', 'crystalline_mantle', 'earth_pulse', 'world_ignition'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: EB_MATERIALS — 30 Collectible Materials
// ═══════════════════════════════════════════════════════════════════

export const EB_MATERIALS: readonly EBMaterialDef[] = [
  // Common (6)
  { id: 'volcanic_ash', name: 'Volcanic Ash', rarity: 'common', source: 'ashen_shore', description: 'Fine gray powder left by volcanic eruptions. Used in construction and as a basic crafting reagent.', value: 5 },
  { id: 'coal_chunk', name: 'Coal Chunk', rarity: 'common', source: 'ashen_shore', description: 'A chunk of compressed carbon from volcanic deposits. Burns hot and steady as fuel for smelters.', value: 8 },
  { id: 'obsidian_pebble', name: 'Obsidian Pebble', rarity: 'common', source: 'ashen_shore', description: 'A small smooth stone of volcanic glass. While not as valuable as larger pieces, it can be polished into decorative items.', value: 6 },
  { id: 'ash_crystal', name: 'Ash Crystal', rarity: 'common', source: 'ashen_shore', description: 'A cloudy crystal formed from compressed ash under extreme pressure. Emits a faint gray glow.', value: 10 },
  { id: 'ember_stone', name: 'Ember Stone', rarity: 'common', source: 'lava_tidepool', description: 'A stone that remains perpetually warm, even when removed from volcanic areas. Used as a basic heat source.', value: 7 },
  { id: 'magma_pebble', name: 'Magma Pebble', rarity: 'common', source: 'lava_tidepool', description: 'A small fragment of cooled magma. Still radiates mild heat and can be used in low-level forging.', value: 9 },

  // Uncommon (6)
  { id: 'lava_crystal', name: 'Lava Crystal', rarity: 'uncommon', source: 'lava_tidepool', description: 'A crystal that formed inside a cooling lava flow. Its interior is filled with swirling patterns of orange and red.', value: 30 },
  { id: 'fire_algae', name: 'Fire Algae', rarity: 'uncommon', source: 'lava_tidepool', description: 'Living algae that thrives in near-boiling water. Used in potions and alchemical recipes for fire resistance.', value: 25 },
  { id: 'cinder_coral', name: 'Cinder Coral', rarity: 'uncommon', source: 'cinder_reef', description: 'Coral that has been hardened by volcanic heat into a ceramic-like material. Prized by artisans for its unique texture.', value: 35 },
  { id: 'fire_pearl', name: 'Fire Pearl', rarity: 'uncommon', source: 'cinder_reef', description: 'A pearl formed inside fire-resistant clams near volcanic vents. Warm to the touch and glows with inner fire.', value: 40 },
  { id: 'ash_shell', name: 'Ash Shell', rarity: 'uncommon', source: 'cinder_reef', description: 'The shell of a volcanic mollusk. Lightweight but incredibly durable due to its layered mineral structure.', value: 28 },
  { id: 'lava_sponge', name: 'Lava Sponge', rarity: 'uncommon', source: 'cinder_reef', description: 'A porous volcanic rock that can absorb and store molten materials. Essential for advanced smelting operations.', value: 32 },

  // Rare (6)
  { id: 'magma_crystal', name: 'Magma Crystal', rarity: 'rare', source: 'magma_grotto', description: 'A large crystal pulsing with the energy of liquid magma. Can power advanced forging equipment for extended periods.', value: 120 },
  { id: 'obsidian_shard', name: 'Obsidian Shard', rarity: 'rare', source: 'magma_grotto', description: 'A razor-sharp fragment of volcanic glass. Edges are thin enough to cut at the molecular level.', value: 100 },
  { id: 'fire_opal', name: 'Fire Opal', rarity: 'rare', source: 'magma_grotto', description: 'A precious gemstone that flashes with all the colors of fire when viewed from different angles. Highly sought by jewelers.', value: 150 },
  { id: 'ember_gem', name: 'Ember Gem', rarity: 'rare', source: 'magma_grotto', description: 'A gemstone that contains a captured ember within its crystalline structure. The ember inside has been burning for millennia.', value: 130 },
  { id: 'smoke_quartz', name: 'Smoke Quartz', rarity: 'rare', source: 'smoldering_depths', description: 'A translucent quartz crystal filled with swirling smoke-like inclusions. Used in enchanting and divination.', value: 110 },
  { id: 'infernal_coal', name: 'Infernal Coal', rarity: 'rare', source: 'smoldering_depths', description: 'Coal of extraordinary purity that burns at temperatures exceeding 4000 degrees. The ultimate smelter fuel.', value: 140 },

  // Epic (6)
  { id: 'ember_core', name: 'Ember Core', rarity: 'epic', source: 'smoldering_depths', description: 'The concentrated heart of a dying ember creature. Contains vast amounts of compressed thermal energy.', value: 500 },
  { id: 'flame_resin', name: 'Flame Resin', rarity: 'epic', source: 'smoldering_depths', description: 'Resin from ancient fire-trees that burns with an unquenchable blue flame. Used to create legendary weapons.', value: 450 },
  { id: 'pristine_obsidian', name: 'Pristine Obsidian', rarity: 'epic', source: 'obsidian_cove', description: 'Obsidian of perfect clarity and structure, free of any imperfections. Can refract light into devastating laser-like beams.', value: 600 },
  { id: 'shadow_glass', name: 'Shadow Glass', rarity: 'epic', source: 'obsidian_cove', description: 'Obsidian that absorbs light rather than reflecting it. Looking into its depths reveals shadowy visions of possible futures.', value: 550 },
  { id: 'volcanic_diamond', name: 'Volcanic Diamond', rarity: 'epic', source: 'obsidian_cove', description: 'A diamond formed under extreme volcanic pressure, harder than any conventional diamond. Its facets contain trapped magma.', value: 700 },
  { id: 'ash_pearl', name: 'Ash Pearl', rarity: 'epic', source: 'obsidian_cove', description: 'A pearl of pure compressed ash that glows with a soft gray luminescence. Said to grant visions of volcanic events.', value: 480 },

  // Legendary (6)
  { id: 'scoria_ore', name: 'Scoria Ore', rarity: 'legendary', source: 'scoria_islands', description: 'Metallic ore from the floating scoria islands. When smelted, it produces a metal lighter than air yet stronger than steel.', value: 2000 },
  { id: 'floating_pumice', name: 'Floating Pumice', rarity: 'legendary', source: 'scoria_islands', description: 'Pumice that never sinks and can support unlimited weight. The secret of the floating islands encoded in stone.', value: 1800 },
  { id: 'fire_feather', name: 'Fire Feather', rarity: 'legendary', source: 'scoria_islands', description: 'A feather from the legendary Fire Roc. It burns eternally and can ignite anything it touches, yet never consumes itself.', value: 2500 },
  { id: 'primordial_ember', name: 'Primordial Ember', rarity: 'legendary', source: 'primordial_caldera', description: 'An ember from the original volcanic eruption that created the world. Contains the spark of creation itself.', value: 5000 },
  { id: 'world_core_shard', name: 'World Core Shard', rarity: 'legendary', source: 'primordial_caldera', description: 'A fragment of the planet\'s molten core, brought to the surface by tectonic forces. Impossibly dense and hot.', value: 4500 },
  { id: 'eternal_flame_essence', name: 'Eternal Flame Essence', rarity: 'legendary', source: 'primordial_caldera', description: 'The pure essence of an eternal flame, distilled into liquid form. A single drop can power a forge for a century.', value: 6000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: EB_STRUCTURES — 25 Upgradeable Bay Structures
// ═══════════════════════════════════════════════════════════════════

export const EB_STRUCTURES: readonly EBStructureDef[] = [
  // Smelting (5)
  { id: 'basic_smelter', name: 'Basic Smelter', description: 'A crude but functional furnace for smelting volcanic ores. Produces low-grade ingots from raw materials.', baseCost: 100, upgradeCostMultiplier: 1.5 },
  { id: 'advanced_forge', name: 'Advanced Forge', description: 'A reinforced forge capable of handling extreme temperatures. Essential for working with magma-grade materials.', baseCost: 500, upgradeCostMultiplier: 1.6 },
  { id: 'ember_crucible', name: 'Ember Crucible', description: 'A specialized vessel for combining volatile ember materials safely. Prevents accidental explosions during crafting.', baseCost: 1200, upgradeCostMultiplier: 1.7 },
  { id: 'volcanic_kiln', name: 'Volcanic Kiln', description: 'A kiln that channels geothermal heat directly from the earth. Produces ceramics and tempered glass at industrial scale.', baseCost: 2500, upgradeCostMultiplier: 1.8 },
  { id: 'primordial_furnace', name: 'Primordial Furnace', description: 'The ultimate smelting structure, capable of processing even the most resistant legendary materials. Burns with core-earth heat.', baseCost: 8000, upgradeCostMultiplier: 2.0 },

  // Docks (4)
  { id: 'wooden_dock', name: 'Wooden Dock', description: 'A simple wooden dock extending into the bay. Accommodates small exploration vessels and basic trade.', baseCost: 80, upgradeCostMultiplier: 1.4 },
  { id: 'stone_pier', name: 'Stone Pier', description: 'A reinforced stone pier that can withstand rough volcanic seas. Supports medium-sized ships and heavier cargo.', baseCost: 400, upgradeCostMultiplier: 1.5 },
  { id: 'obsidian_wharf', name: 'Obsidian Wharf', description: 'A massive wharf built from volcanic glass. Impervious to fire, lava, and extreme weather. Supports the largest ships.', baseCost: 1500, upgradeCostMultiplier: 1.6 },
  { id: 'magma_harbor', name: 'Magma Harbor', description: 'A fully equipped harbor with lava-powered cranes, repair facilities, and shipyards. The crown jewel of bay infrastructure.', baseCost: 5000, upgradeCostMultiplier: 1.8 },

  // Storage (4)
  { id: 'ash_warehouse', name: 'Ash Warehouse', description: 'A basic warehouse built from compressed ash bricks. Stores common materials safely.', baseCost: 60, upgradeCostMultiplier: 1.3 },
  { id: 'fire_vault', name: 'Fire Vault', description: 'A temperature-controlled vault for storing volatile ember materials. Prevents degradation and spontaneous combustion.', baseCost: 300, upgradeCostMultiplier: 1.5 },
  { id: 'obsidian_safe', name: 'Obsidian Safe', description: 'An impenetrable vault carved from solid obsidian. Protects the rarest and most valuable materials from theft and disaster.', baseCost: 1000, upgradeCostMultiplier: 1.6 },
  { id: 'core_reservoir', name: 'Core Reservoir', description: 'A reservoir that stores thermal energy from the planet\'s core. Provides unlimited heat to all nearby structures.', baseCost: 4000, upgradeCostMultiplier: 1.8 },

  // Shrines (4)
  { id: 'ember_shrine', name: 'Ember Shrine', description: 'A small shrine dedicated to the spirit of ember. Meditating here restores a small amount of ember energy each day.', baseCost: 200, upgradeCostMultiplier: 1.5 },
  { id: 'lava_altar', name: 'Lava Altar', description: 'An altar built over a lava flow. Offerings thrown into the lava are returned as blessed items of greater power.', baseCost: 800, upgradeCostMultiplier: 1.6 },
  { id: 'volcano_temple', name: 'Volcano Temple', description: 'A grand temple carved into the volcanic cliffside. Houses ancient knowledge and grants blessings to explorers.', baseCost: 2000, upgradeCostMultiplier: 1.7 },
  { id: 'world_heart_sanctum', name: 'World Heart Sanctum', description: 'The most sacred site in the bay. Directly connected to the planet\'s core, it amplifies all ember-based abilities.', baseCost: 6000, upgradeCostMultiplier: 2.0 },

  // Utility (4)
  { id: 'ash_collector', name: 'Ash Collector', description: 'An automated system that gathers volcanic ash from the air. Produces a steady stream of basic materials.', baseCost: 150, upgradeCostMultiplier: 1.4 },
  { id: 'lava_pump', name: 'Lava Pump', description: 'A pump system that draws lava from underground channels. Provides a reliable supply of molten material for smelting.', baseCost: 600, upgradeCostMultiplier: 1.5 },
  { id: 'smoke_stack', name: 'Smoke Stack', description: 'A tall chimney that vents harmful volcanic gases safely. Improves worker efficiency and reduces material degradation.', baseCost: 350, upgradeCostMultiplier: 1.4 },
  { id: 'thermal_generator', name: 'Thermal Generator', description: 'Converts geothermal heat into usable energy for the entire bay. Reduces all smelting costs significantly.', baseCost: 1500, upgradeCostMultiplier: 1.7 },

  // Defense (4)
  { id: 'watchtower', name: 'Volcanic Watchtower', description: 'A tall stone tower with a view of the entire bay. Provides early warning of volcanic events and incoming threats.', baseCost: 120, upgradeCostMultiplier: 1.4 },
  { id: 'ember_wall', name: 'Ember Wall', description: 'A defensive wall of compressed volcanic stone. Protects structures from lava surges and creature attacks.', baseCost: 400, upgradeCostMultiplier: 1.5 },
  { id: 'fire_beacon', name: 'Fire Beacon', description: 'A beacon that burns with enchanted flame visible for miles. Attracts allied creatures and warns enemies.', baseCost: 700, upgradeCostMultiplier: 1.5 },
  { id: 'obsidian_fortress', name: 'Obsidian Fortress', description: 'An impregnable fortress of volcanic glass. The ultimate defense structure, capable of withstanding even caldera-scale eruptions.', baseCost: 3500, upgradeCostMultiplier: 1.8 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: EB_RECIPES — 15 Ember Crafting Recipes
// ═══════════════════════════════════════════════════════════════════

export const EB_RECIPES: readonly EBRecipeDef[] = [
  // Common (4)
  {
    id: 'recipe_ember_torch',
    name: 'Forge Ember Torch',
    description: 'Combine volcanic ash and an ember stone to create a torch that burns with a warm, steady flame. Essential for exploring dark volcanic caverns.',
    requiredMaterials: [{ materialId: 'volcanic_ash', amount: 5 }, { materialId: 'ember_stone', amount: 2 }],
    result: 'Ember Torch — A reliable light source that never extinguishes in wind.',
    rarity: 'common',
  },
  {
    id: 'recipe_obsidian_knife',
    name: 'Knap Obsidian Knife',
    description: 'Carefully chip obsidian pebbles into a razor-sharp blade. The knife can cut through most basic materials with surgical precision.',
    requiredMaterials: [{ materialId: 'obsidian_pebble', amount: 8 }, { materialId: 'coal_chunk', amount: 3 }],
    result: 'Obsidian Knife — A blade sharper than steel, perfect for harvesting rare materials.',
    rarity: 'common',
  },
  {
    id: 'recipe_ash_charm',
    name: 'Craft Ash Charm',
    description: 'Compress ash crystals into a protective charm. Worn by bay explorers for basic fire resistance and good luck.',
    requiredMaterials: [{ materialId: 'ash_crystal', amount: 4 }, { materialId: 'volcanic_ash', amount: 10 }],
    result: 'Ash Charm — Grants minor fire resistance and a small luck bonus.',
    rarity: 'common',
  },
  {
    id: 'recipe_coal_brick',
    name: 'Press Coal Brick',
    description: 'Compress coal chunks into dense fuel bricks. Each brick provides hours of steady, high-temperature heat for smelting operations.',
    requiredMaterials: [{ materialId: 'coal_chunk', amount: 6 }, { materialId: 'magma_pebble', amount: 2 }],
    result: 'Coal Brick — Dense fuel that burns at 2000 degrees for 8 hours.',
    rarity: 'common',
  },

  // Uncommon (3)
  {
    id: 'recipe_lava_glass_vial',
    name: 'Blow Lava Glass Vial',
    description: 'Melt lava crystals and blow them into heat-resistant glass vials. Essential for containing volatile ember materials.',
    requiredMaterials: [{ materialId: 'lava_crystal', amount: 5 }, { materialId: 'fire_algae', amount: 3 }],
    result: 'Lava Glass Vial — A container that can hold molten materials safely.',
    rarity: 'uncommon',
  },
  {
    id: 'recipe_fire_resist_potion',
    name: 'Brew Fire Resistance Potion',
    description: 'Distill fire algae with ember stones to create a potion that grants temporary immunity to volcanic heat.',
    requiredMaterials: [{ materialId: 'fire_algae', amount: 6 }, { materialId: 'ember_stone', amount: 4 }, { materialId: 'ash_crystal', amount: 2 }],
    result: 'Fire Resistance Potion — Grants 30 minutes of complete fire immunity.',
    rarity: 'uncommon',
  },
  {
    id: 'recipe_cinder_shield',
    name: 'Forge Cinder Shield',
    description: 'Bind cinder coral with ash shells to create a lightweight but durable shield. Resists fire damage and deflects heat.',
    requiredMaterials: [{ materialId: 'cinder_coral', amount: 6 }, { materialId: 'ash_shell', amount: 4 }, { materialId: 'coal_chunk', amount: 5 }],
    result: 'Cinder Shield — A shield that absorbs fire damage and reflects heat.',
    rarity: 'uncommon',
  },

  // Rare (3)
  {
    id: 'recipe_magma_blade',
    name: 'Forge Magma Blade',
    description: 'Use infernal coal to heat a magma crystal to its melting point, then forge it with obsidian shards into a legendary blade.',
    requiredMaterials: [{ materialId: 'magma_crystal', amount: 4 }, { materialId: 'obsidian_shard', amount: 6 }, { materialId: 'infernal_coal', amount: 3 }],
    result: 'Magma Blade — A sword that cuts through rock and metal with molten fury.',
    rarity: 'rare',
  },
  {
    id: 'recipe_fire_opal_amulet',
    name: 'Set Fire Opal Amulet',
    description: 'Mount a fire opal in a frame of smoke quartz to create an amulet that enhances all fire-based abilities.',
    requiredMaterials: [{ materialId: 'fire_opal', amount: 3 }, { materialId: 'smoke_quartz', amount: 5 }, { materialId: 'ember_gem', amount: 2 }],
    result: 'Fire Opal Amulet — Amplifies fire abilities by 40% and grants thermal vision.',
    rarity: 'rare',
  },
  {
    id: 'recipe_ember_core_engine',
    name: 'Build Ember Core Engine',
    description: 'Construct a miniature power source from an ember core and smoke quartz. Can power advanced structures and ships.',
    requiredMaterials: [{ materialId: 'ember_core', amount: 2 }, { materialId: 'smoke_quartz', amount: 8 }, { materialId: 'infernal_coal', amount: 5 }],
    result: 'Ember Core Engine — A compact power source that runs on thermal energy.',
    rarity: 'rare',
  },

  // Epic (3)
  {
    id: 'recipe_shadow_glass_mirror',
    name: 'Craft Shadow Glass Mirror',
    description: 'Polish shadow glass with flame resin to create a mirror that reveals hidden creatures and secret passages.',
    requiredMaterials: [{ materialId: 'shadow_glass', amount: 5 }, { materialId: 'flame_resin', amount: 3 }, { materialId: 'volcanic_diamond', amount: 1 }],
    result: 'Shadow Glass Mirror — Reveals invisible creatures and hidden paths.',
    rarity: 'epic',
  },
  {
    id: 'recipe_pristine_armor',
    name: 'Forge Pristine Obsidian Armor',
    description: 'Work pristine obsidian with volcanic diamond tools to create armor that is nearly indestructible.',
    requiredMaterials: [{ materialId: 'pristine_obsidian', amount: 8 }, { materialId: 'volcanic_diamond', amount: 3 }, { materialId: 'ash_pearl', amount: 2 }],
    result: 'Pristine Obsidian Armor — Legendary armor with 95% damage reduction.',
    rarity: 'epic',
  },
  {
    id: 'recipe_inferno_cannon',
    name: 'Build Inferno Cannon',
    description: 'Assemble a devastating siege weapon from ember cores and flame resin. Fires concentrated beams of pure volcanic fire.',
    requiredMaterials: [{ materialId: 'ember_core', amount: 4 }, { materialId: 'flame_resin', amount: 6 }, { materialId: 'pristine_obsidian', amount: 5 }],
    result: 'Inferno Cannon — Fires beams of volcanic fire with a 3km range.',
    rarity: 'epic',
  },

  // Legendary (2)
  {
    id: 'recipe_world_core_armor',
    name: 'Forge World Core Armor',
    description: 'Use a shard of the world\'s core as the centerpiece of armor that draws power from the planet itself. Grants near-invulnerability.',
    requiredMaterials: [{ materialId: 'world_core_shard', amount: 2 }, { materialId: 'primordial_ember', amount: 3 }, { materialId: 'eternal_flame_essence', amount: 2 }],
    result: 'World Core Armor — Invulnerable armor that draws power from the planet.',
    rarity: 'legendary',
  },
  {
    id: 'recipe_eternal_flame_sword',
    name: 'Forge Eternal Flame Sword',
    description: 'The ultimate weapon. Combine the primordial ember with eternal flame essence to create a sword whose blade is pure living fire.',
    requiredMaterials: [{ materialId: 'primordial_ember', amount: 2 }, { materialId: 'eternal_flame_essence', amount: 3 }, { materialId: 'world_core_shard', amount: 1 }],
    result: 'Eternal Flame Sword — A blade of pure creation fire. Can cut through anything.',
    rarity: 'legendary',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: EB_ABILITIES — 22 Fire/Ember Abilities
// ═══════════════════════════════════════════════════════════════════

export const EB_ABILITIES: readonly EBAbilityDef[] = [
  // Fire Abilities (6)
  { id: 'fire_bolt', name: 'Fire Bolt', description: 'Launch a concentrated bolt of fire at a target. Basic but effective fire attack.', cooldown: 2, power: 25, element: 'fire' },
  { id: 'flame_wave', name: 'Flame Wave', description: 'Send a wave of fire surging across the ground, damaging everything in its path.', cooldown: 8, power: 60, element: 'fire' },
  { id: 'inferno_blast', name: 'Inferno Blast', description: 'Release a devastating explosion of pure fire that incinerates all nearby enemies.', cooldown: 15, power: 120, element: 'fire' },
  { id: 'blazing_aura', name: 'Blazing Aura', description: 'Surround yourself with a burning aura that damages nearby creatures and ignites the ground.', cooldown: 20, power: 45, element: 'fire' },
  { id: 'phoenix_strike', name: 'Phoenix Strike', description: 'Channel the power of the phoenix into a single devastating strike that leaves a trail of fire.', cooldown: 25, power: 180, element: 'fire' },
  { id: 'solar_fury', name: 'Solar Fury', description: 'Unleash the concentrated power of the sun in a massive area attack that melts stone and vaporizes water.', cooldown: 60, power: 350, element: 'fire' },

  // Ash Abilities (4)
  { id: 'ash_cloud', name: 'Ash Cloud', description: 'Release a thick cloud of volcanic ash that obscures vision and irritates respiratory systems.', cooldown: 5, power: 20, element: 'ash' },
  { id: 'cinder_barrage', name: 'Cinder Barrage', description: 'Hurl a barrage of burning cinders at all enemies in range, causing widespread damage.', cooldown: 10, power: 50, element: 'ash' },
  { id: 'gray_vortex', name: 'Gray Vortex', description: 'Create a spinning vortex of ash and debris that pulls enemies in and grinds them apart.', cooldown: 18, power: 90, element: 'ash' },
  { id: 'apocalypse_ash', name: 'Apocalypse Ash', description: 'Blanket the entire battlefield in a mountain of volcanic ash, suffocating all life beneath.', cooldown: 45, power: 250, element: 'ash' },

  // Lava Abilities (4)
  { id: 'lava_splash', name: 'Lava Splash', description: 'Splash molten lava at a target, dealing fire damage and leaving a burning puddle.', cooldown: 4, power: 35, element: 'lava' },
  { id: 'magma_flow', name: 'Magma Flow', description: 'Summon a river of magma that sweeps across the battlefield, carrying enemies away.', cooldown: 12, power: 75, element: 'lava' },
  { id: 'volcanic_eruption', name: 'Volcanic Eruption', description: 'Trigger a localized volcanic eruption, raining lava boulders and ash across a wide area.', cooldown: 30, power: 200, element: 'lava' },
  { id: 'mantle_strike', name: 'Mantle Strike', description: 'Channel the power of the earth\'s mantle into a single devastating blow that cracks the ground.', cooldown: 40, power: 280, element: 'lava' },

  // Obsidian Abilities (3)
  { id: 'glass_shard', name: 'Glass Shard', description: 'Launch a razor-sharp obsidian shard that pierces armor and causes bleeding.', cooldown: 3, power: 30, element: 'obsidian' },
  { id: 'crystal_prison', name: 'Crystal Prison', description: 'Encase a target in a prison of obsidian crystals, immobilizing them completely.', cooldown: 20, power: 70, element: 'obsidian' },
  { id: 'obsidian_rain', name: 'Obsidian Rain', description: 'Summon a rain of obsidian needles from above, shredding everything beneath.', cooldown: 35, power: 220, element: 'obsidian' },

  // Smoke Abilities (3)
  { id: 'smoke_bomb', name: 'Smoke Bomb', description: 'Create a dense cloud of smoke that provides cover and disorients enemies.', cooldown: 6, power: 15, element: 'steam' },
  { id: 'toxic_fumes', name: 'Toxic Fumes', description: 'Release volcanic toxic gases that slowly poison all creatures in the area.', cooldown: 15, power: 55, element: 'smoke' },
  { id: 'smoke_form', name: 'Smoke Form', description: 'Transform your body into living smoke, becoming immune to physical damage for a short duration.', cooldown: 25, power: 100, element: 'smoke' },

  // Ember Abilities (2)
  { id: 'ember_heal', name: 'Ember Heal', description: 'Channel ember energy to heal wounds. The warmth of embers accelerates natural regeneration.', cooldown: 10, power: 40, element: 'ember' },
  { id: 'ember_storm', name: 'Ember Storm', description: 'Summon a storm of burning embers that swirls around you, damaging enemies and healing allies.', cooldown: 22, power: 150, element: 'ember' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: EB_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const EB_ACHIEVEMENTS: readonly EBAchievementDef[] = [
  { id: 'ach_first_step', name: 'First Ashen Footprint', description: 'Explore your very first volcanic bay zone.', condition: 'Explore 1 zone', reward: '+50 ember energy' },
  { id: 'ach_zone_master', name: 'Zone Cartographer', description: 'Explore all 8 volcanic bay zones.', condition: 'Explore 8 zones', reward: '+500 gold, Bay Cartographer title' },
  { id: 'ach_collector_10', name: 'Ash Collector', description: 'Collect a total of 100 materials from the bay.', condition: 'Collect 100 materials', reward: '+200 gold' },
  { id: 'ach_collector_500', name: 'Master Scavenger', description: 'Collect a total of 500 materials from the bay.', condition: 'Collect 500 materials', reward: '+1000 gold, rare material cache' },
  { id: 'ach_forger_5', name: 'Novice Blacksmith', description: 'Complete 5 smelting recipes.', condition: 'Smelt 5 recipes', reward: '+150 ember energy' },
  { id: 'ach_forger_25', name: 'Master Forgemaster', description: 'Complete 25 smelting recipes total.', condition: 'Smelt 25 recipes', reward: '+800 gold, Infernal Forge title' },
  { id: 'ach_creature_tamer', name: 'Creature Tamer', description: 'Acquire your first ember creature.', condition: 'Acquire 1 creature', reward: '+100 ember energy' },
  { id: 'ach_zoo_master', name: 'Bay Menagerie', description: 'Own 10 ember creatures simultaneously.', condition: 'Own 10 creatures', reward: '+600 gold' },
  { id: 'ach_builder', name: 'Bay Architect', description: 'Build your first bay structure.', condition: 'Build 1 structure', reward: '+100 gold' },
  { id: 'ach_metropolis', name: 'Volcanic Metropolis', description: 'Build 15 structures in your bay.', condition: 'Build 15 structures', reward: '+2000 gold, Mayor title' },
  { id: 'ach_captain', name: 'First Voyage', description: 'Launch your first exploration ship.', condition: 'Launch 1 ship', reward: '+200 gold' },
  { id: 'ach_admiral', name: 'Bay Admiral', description: 'Launch 20 ships total.', condition: 'Launch 20 ships', reward: '+1500 gold, Admiral title' },
  { id: 'ach_event_handler', name: 'Crisis Manager', description: 'Successfully respond to 5 volcanic events.', condition: 'Respond to 5 events', reward: '+300 ember energy' },
  { id: 'ach_smelter_ace', name: 'Temperature Master', description: 'Reach maximum smelter temperature.', condition: 'Smelter at max temperature', reward: '+500 gold' },
  { id: 'ach_legendary_catch', name: 'Legendary Tamer', description: 'Acquire a legendary-rarity ember creature.', condition: 'Own legendary creature', reward: '+3000 gold' },
  { id: 'ach_title_collector', name: 'Title Hoarder', description: 'Unlock 5 different bay titles.', condition: 'Unlock 5 titles', reward: '+1000 ember energy' },
  { id: 'ach_level_25', name: 'Bay Veteran', description: 'Reach bay level 25.', condition: 'Bay level 25', reward: '+2000 gold, Veteran title' },
  { id: 'ach_level_50', name: 'Ember Sovereign', description: 'Reach maximum bay level 50.', condition: 'Bay level 50', reward: '+10000 gold, Ember Sovereign title' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: EB_TITLES — 8 Progression Titles
// ═══════════════════════════════════════════════════════════════════

export const EB_TITLES: readonly EBTitleDef[] = [
  { id: 'title_ash_collector', name: 'Ash Collector', description: 'One who has begun their journey along the ashen shore, collecting the first fragments of volcanic power.', requiredLevel: 1, requiredExplored: 1 },
  { id: 'title_ember_seeker', name: 'Ember Seeker', description: 'A dedicated explorer who follows the glow of embers deeper into the volcanic bay, unafraid of the heat.', requiredLevel: 5, requiredExplored: 2 },
  { id: 'title_cinder_walker', name: 'Cinder Walker', description: 'A seasoned adventurer who walks barefoot across cooling cinders without flinching, at home in the volcanic landscape.', requiredLevel: 12, requiredExplored: 4 },
  { id: 'title_lava Navigator', name: 'Lava Navigator', description: 'An expert pathfinder who can navigate the treacherous lava flows and magma channels of the deep bay.', requiredLevel: 20, requiredExplored: 6 },
  { id: 'title_magma_smith', name: 'Magma Smith', description: 'A master craftsman who shapes magma and obsidian into tools and weapons of extraordinary power.', requiredLevel: 28, requiredExplored: 7 },
  { id: 'title_obsidian_lord', name: 'Obsidian Lord', description: 'Commander of volcanic glass and all structures built from it. The bay fortress stands as testament to their skill.', requiredLevel: 35, requiredExplored: 7 },
  { id: 'title_volcano_sage', name: 'Volcano Sage', description: 'A wise elder who understands the deep connection between the volcanic bay and the planet\'s living core.', requiredLevel: 42, requiredExplored: 8 },
  { id: 'title_ember_sovereign', name: 'Ember Sovereign', description: 'The absolute master of Ember Bay. The volcanic fires bow to their will, and the caldera itself is their throne room.', requiredLevel: 50, requiredExplored: 8 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: EB_SHIPS — 10 Bay Exploration Ships
// ═══════════════════════════════════════════════════════════════════

export const EB_SHIPS: readonly EBShipDef[] = [
  {
    id: 'ash_skiff',
    name: 'Ash Skiff',
    description: 'A small, nimble vessel built from compressed volcanic ash. Perfect for short reconnaissance missions along the shoreline. Its light weight allows it to navigate shallow waters near lava flows.',
    capacity: 20,
    speed: 8,
    durability: 50,
    unlockLevel: 1,
    baseCost: 0,
  },
  {
    id: 'cinder_sloop',
    name: 'Cinder Sloop',
    description: 'A sturdy single-masted sloop reinforced with cinder coral plating. Handles moderate volcanic seas with ease and can carry enough supplies for extended exploration.',
    capacity: 40,
    speed: 7,
    durability: 80,
    unlockLevel: 3,
    baseCost: 200,
  },
  {
    id: 'fire_brigantine',
    name: 'Fire Brigantine',
    description: 'A two-masted brigantine designed specifically for volcanic waters. Its hull is lined with fire-resistant obsidian tiles, and its sails are woven from flame-retardant fiber.',
    capacity: 60,
    speed: 9,
    durability: 120,
    unlockLevel: 6,
    baseCost: 600,
  },
  {
    id: 'lava_carrack',
    name: 'Lava Carrack',
    description: 'A broad-hulled merchant vessel adapted for heavy cargo transport through the bay. Can carry large quantities of materials between islands and the mainland.',
    capacity: 100,
    speed: 5,
    durability: 150,
    unlockLevel: 10,
    baseCost: 1200,
  },
  {
    id: 'ember_frigate',
    name: 'Ember Frigate',
    description: 'A fast warship equipped with lava-powered cannons. Designed to protect bay shipping lanes from sea creatures and rival explorers.',
    capacity: 50,
    speed: 10,
    durability: 180,
    unlockLevel: 15,
    baseCost: 2500,
  },
  {
    id: 'obsidian_galleon',
    name: 'Obsidian Galleon',
    description: 'A massive galleon whose hull is clad in volcanic glass. Reflects fire and lava, and is nearly indestructible in volcanic seas. The pride of any bay fleet.',
    capacity: 120,
    speed: 6,
    durability: 300,
    unlockLevel: 20,
    baseCost: 5000,
  },
  {
    id: 'magma_submersible',
    name: 'Magma Submersible',
    description: 'A submarine craft that can dive into underwater lava channels. Equipped with thermal cameras and diamond-tipped drilling equipment for deep exploration.',
    capacity: 30,
    speed: 4,
    durability: 200,
    unlockLevel: 25,
    baseCost: 8000,
  },
  {
    id: 'phoenix_cruiser',
    name: 'Phoenix Cruiser',
    description: 'A sleek, high-speed cruiser powered by phoenix feather engines. It can rise above volcanic hazards on cushions of superheated air.',
    capacity: 70,
    speed: 14,
    durability: 250,
    unlockLevel: 30,
    baseCost: 12000,
  },
  {
    id: 'scoria_dreadnought',
    name: 'Scoria Dreadnought',
    description: 'The ultimate warship of the volcanic bay. Built from floating scoria ore, it can navigate both water and lava. Armed with magma cannons and an obsidian ram.',
    capacity: 90,
    speed: 7,
    durability: 450,
    unlockLevel: 38,
    baseCost: 25000,
  },
  {
    id: 'primordial_ark',
    name: 'Primordial Ark',
    description: 'A legendary vessel said to have been built from the first volcanic eruption. It is powered by a fragment of the world\'s core and can sail through any element.',
    capacity: 150,
    speed: 12,
    durability: 600,
    unlockLevel: 45,
    baseCost: 50000,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: EB_EVENTS — 12 Volcanic Events
// ═══════════════════════════════════════════════════════════════════

export const EB_EVENTS: readonly EBEventDef[] = [
  {
    id: 'event_minor_eruption',
    name: 'Minor Eruption',
    description: 'A small volcanic vent erupts near the bay, showering the area with ash and cinders. Structures near the vent may take minor damage.',
    severity: 2,
    duration: 30,
    effects: ['ash_fall: -5 gold per minute', 'material_bonus: +20% material collection rate'],
  },
  {
    id: 'event_lava_surge',
    name: 'Lava Surge',
    description: 'An underground lava channel overflows, sending a wave of molten rock toward the shoreline. Ships in the harbor must be moved or risk being melted.',
    severity: 4,
    duration: 45,
    effects: ['ship_damage: -10 durability per minute', 'smelter_boost: +50% smelting speed'],
  },
  {
    id: 'event_ash_storm',
    name: 'Ash Storm',
    description: 'A massive cloud of volcanic ash descends on the bay, reducing visibility to near zero. Creatures become more aggressive in the confusion.',
    severity: 3,
    duration: 60,
    effects: ['creature_aggression: all creatures +30% attack', 'exploration_risk: +50% danger level'],
  },
  {
    id: 'event_fire_tide',
    name: 'Fire Tide',
    description: 'The bay waters ignite with natural gas and ember deposits, creating waves of liquid fire. Fishing and water activities become impossible.',
    severity: 3,
    duration: 40,
    effects: ['water_hazard: ships cannot launch', 'ember_energy: +3 energy regeneration per minute'],
  },
  {
    id: 'event_magma_rise',
    name: 'Magma Rise',
    description: 'Magma levels beneath the bay rise significantly, causing the ground to crack and steam vents to open throughout the settlement.',
    severity: 5,
    duration: 50,
    effects: ['ground_damage: random structure -5 durability', 'material_discovery: new rare materials available'],
  },
  {
    id: 'event_smoke_outbreak',
    name: 'Toxic Smoke Outbreak',
    description: 'Fissures in the volcanic rock release clouds of toxic volcanic gases. Explorers must wear protective gear or risk asphyxiation.',
    severity: 3,
    duration: 35,
    effects: ['health_drain: -1 ember energy per minute', 'creature_weakness: creatures -20% defense'],
  },
  {
    id: 'event_obsidian_rain',
    name: 'Obsidian Rain',
    description: 'A rare phenomenon where supercooled volcanic glass rains from the sky as tiny sharp fragments. Dangerous but yields valuable obsidian.',
    severity: 4,
    duration: 25,
    effects: ['structure_damage: -2 durability per minute', 'obsidian_shower: +10 obsidian_pebble per minute'],
  },
  {
    id: 'event_ember_swarm',
    name: 'Ember Swarm',
    description: 'Thousands of ember creatures migrate through the bay in a massive swarm. Dangerous if provoked, but provides rare taming opportunities.',
    severity: 3,
    duration: 55,
    effects: ['creature_spawn: +200% creature encounters', 'taming_bonus: +50% taming success rate'],
  },
  {
    id: 'event_major_eruption',
    name: 'Major Eruption',
    description: 'The main volcano erupts with devastating force. Lava bombs, pyroclastic flows, and ash clouds threaten the entire bay.',
    severity: 8,
    duration: 90,
    effects: ['massive_damage: all structures -10 durability', 'evacuation: ships return automatically'],
  },
  {
    id: 'event_thermal_upwelling',
    name: 'Thermal Upwelling',
    description: 'A massive bubble of superheated water rises from the deep, warming the entire bay. Beneficial for smelting but disrupts marine life.',
    severity: 1,
    duration: 40,
    effects: ['smelter_efficiency: +40% all smelting', 'marine_flee: all sea creatures retreat'],
  },
  {
    id: 'event_void_fissure',
    name: 'Void Fissure',
    description: 'A crack opens between dimensions, releasing shadowy smoke creatures into the bay. Strange materials can be found near the fissure.',
    severity: 6,
    duration: 70,
    effects: ['shadow_spawn: smoke wraiths appear', 'void_materials: shadow_glass available'],
  },
  {
    id: 'event_phoenix_migration',
    name: 'Phoenix Migration',
    description: 'A flock of wild phoenixes passes through the bay, dropping fire feathers and leaving trails of beneficial embers.',
    severity: 1,
    duration: 20,
    effects: ['phoenix_gifts: +5 fire_feather', 'ember_blessing: +20 ember energy'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

const EB_INITIAL_ENERGY = 50
const EB_MAX_ENERGY = 200
const EB_INITIAL_GOLD = 300
const EB_MAX_SMELTER_TEMP = 5000
const EB_SMELTER_STEP = 500

const useEBStore = create<EBFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      exploredZones: [] as string[],
      collectedMaterials: {} as Record<string, number>,
      creatures: [] as EBCreatureInstance[],
      structures: [] as EBStructureInstance[],
      recipes: [] as string[],
      ships: [
        {
          id: 'ship_initial_ash_skiff',
          shipDefId: 'ash_skiff',
          currentDurability: 50,
          maxDurability: 50,
          launched: false,
          launchedAt: null,
        },
      ] as EBShipInstance[],
      achievements: [] as string[],
      currentTitle: 'title_ash_collector',
      bayLevel: 1,
      bayExp: 0,
      gold: EB_INITIAL_GOLD,
      emberEnergy: EB_INITIAL_ENERGY,
      totalCollected: 0,
      totalForged: 0,
      totalExplored: 0,
      totalShipsLaunched: 0,
      activeZoneId: null,
      activeEventId: null,
      eventTimer: 0,
      smelterTemperature: 500,

      // ── ebExploreZone ──────────────────────────────────────────
      ebExploreZone: (zoneId: string): boolean => {
        const state = get()
        const zone = EB_ZONES.find((z) => z.id === zoneId)
        if (!zone) return false
        if (state.exploredZones.includes(zoneId)) return false
        if (state.bayLevel < zone.unlockLevel) return false
        if (state.emberEnergy < 5) return false

        set((prev) => {
          const newXp = prev.bayExp + zone.dangerLevel * 15
          const newLevel = ebLevelFromXp(newXp)
          return {
            exploredZones: [...prev.exploredZones, zoneId],
            activeZoneId: zoneId,
            emberEnergy: Math.max(0, prev.emberEnergy - 5),
            bayExp: newXp,
            bayLevel: newLevel,
            totalExplored: prev.totalExplored + 1,
          }
        })
        return true
      },

      // ── ebCollectMaterial ─────────────────────────────────────
      ebCollectMaterial: (materialId: string): number => {
        const state = get()
        const mat = EB_MATERIALS.find((m) => m.id === materialId)
        if (!mat) return 0
        if (state.emberEnergy < 2) return 0

        const quantity = mat.rarity === 'common' ? 3 : mat.rarity === 'uncommon' ? 2 : 1
        set((prev) => ({
          collectedMaterials: {
            ...prev.collectedMaterials,
            [materialId]: (prev.collectedMaterials[materialId] || 0) + quantity,
          },
          emberEnergy: Math.max(0, prev.emberEnergy - 2),
          totalCollected: prev.totalCollected + quantity,
          gold: prev.gold + mat.value * quantity,
        }))
        return quantity
      },

      // ── ebSmeltOre ────────────────────────────────────────────
      ebSmeltOre: (recipeId: string): boolean => {
        const state = get()
        const recipe = EB_RECIPES.find((r) => r.id === recipeId)
        if (!recipe) return false
        if (state.recipes.includes(recipeId)) return false
        if (state.emberEnergy < 10) return false
        if (state.smelterTemperature < 1000) return false

        for (const req of recipe.requiredMaterials) {
          const owned = state.collectedMaterials[req.materialId] || 0
          if (owned < req.amount) return false
        }

        set((prev) => {
          const newMaterials = { ...prev.collectedMaterials }
          for (const req of recipe.requiredMaterials) {
            newMaterials[req.materialId] = (newMaterials[req.materialId] || 0) - req.amount
          }
          return {
            collectedMaterials: newMaterials,
            recipes: [...prev.recipes, recipeId],
            emberEnergy: Math.max(0, prev.emberEnergy - 10),
            totalForged: prev.totalForged + 1,
            gold: prev.gold + Math.floor(matValueForRarity(recipe.rarity) * 50),
          }
        })
        return true
      },

      // ── ebBuildStructure ───────────────────────────────────────
      ebBuildStructure: (structDefId: string): boolean => {
        const state = get()
        const def = EB_STRUCTURES.find((s) => s.id === structDefId)
        if (!def) return false
        const alreadyBuilt = state.structures.some((s) => s.structureDefId === structDefId)
        if (alreadyBuilt) return false
        if (state.gold < def.baseCost) return false

        set((prev) => ({
          structures: [
            ...prev.structures,
            {
              id: ebGenerateId(),
              structureDefId: structDefId,
              level: 1,
              built: true,
            },
          ],
          gold: prev.gold - def.baseCost,
        }))
        return true
      },

      // ── ebUpgradeStructure ─────────────────────────────────────
      ebUpgradeStructure: (structId: string): boolean => {
        const state = get()
        const struct = state.structures.find((s) => s.id === structId)
        if (!struct) return false
        if (struct.level >= 10) return false
        const def = EB_STRUCTURES.find((d) => d.id === struct.structureDefId)
        if (!def) return false

        const cost = Math.floor(def.baseCost * Math.pow(def.upgradeCostMultiplier, struct.level))
        if (state.gold < cost) return false

        set((prev) => ({
          structures: prev.structures.map((s) =>
            s.id === structId ? { ...s, level: s.level + 1 } : s
          ),
          gold: prev.gold - cost,
        }))
        return true
      },

      // ── ebDemolishStructure ────────────────────────────────────
      ebDemolishStructure: (structId: string): boolean => {
        const state = get()
        const struct = state.structures.find((s) => s.id === structId)
        if (!struct) return false

        set((prev) => ({
          structures: prev.structures.filter((s) => s.id !== structId),
          gold: prev.gold + 50,
        }))
        return true
      },

      // ── ebAcquireCreature ─────────────────────────────────────
      ebAcquireCreature: (creatureId: string): boolean => {
        const state = get()
        const def = EB_CREATURES.find((c) => c.id === creatureId)
        if (!def) return false
        if (state.emberEnergy < 15) return false

        const cost = Math.floor(50 * ebRarityPower(def.rarity))
        if (state.gold < cost) return false

        set((prev) => ({
          creatures: [
            ...prev.creatures,
            {
              id: ebGenerateId(),
              creatureDefId: creatureId,
              name: def.name,
              level: 1,
              currentHP: def.hp,
              maxHP: def.hp,
              attack: def.attack,
              defense: def.defense,
              trainedCount: 0,
              acquiredAt: Date.now(),
            },
          ],
          gold: prev.gold - cost,
          emberEnergy: Math.max(0, prev.emberEnergy - 15),
        }))
        return true
      },

      // ── ebReleaseCreature ─────────────────────────────────────
      ebReleaseCreature: (instanceId: string): boolean => {
        const state = get()
        const creature = state.creatures.find((c) => c.id === instanceId)
        if (!creature) return false

        set((prev) => ({
          creatures: prev.creatures.filter((c) => c.id !== instanceId),
          emberEnergy: Math.min(EB_MAX_ENERGY, prev.emberEnergy + 5),
        }))
        return true
      },

      // ── ebTrainCreature ───────────────────────────────────────
      ebTrainCreature: (instanceId: string): boolean => {
        const state = get()
        const creature = state.creatures.find((c) => c.id === instanceId)
        if (!creature) return false
        if (state.emberEnergy < 8) return false
        if (creature.level >= 20) return false

        set((prev) => ({
          creatures: prev.creatures.map((c) => {
            if (c.id !== instanceId) return c
            const newLevel = c.level + 1
            const def = EB_CREATURES.find((d) => d.id === c.creatureDefId)
            if (!def) return c
            const levelMult = 1 + newLevel * 0.12
            return {
              ...c,
              level: newLevel,
              currentHP: Math.floor(def.hp * levelMult),
              maxHP: Math.floor(def.hp * levelMult),
              attack: Math.floor(def.attack * levelMult),
              defense: Math.floor(def.defense * levelMult),
              trainedCount: c.trainedCount + 1,
            }
          }),
          emberEnergy: Math.max(0, prev.emberEnergy - 8),
        }))
        return true
      },

      // ── ebLaunchShip ──────────────────────────────────────────
      ebLaunchShip: (shipId: string): boolean => {
        const state = get()
        const ship = state.ships.find((s) => s.id === shipId)
        if (!ship) return false
        if (ship.launched) return false
        if (ship.currentDurability < ship.maxDurability * 0.2) return false
        if (state.emberEnergy < 5) return false

        set((prev) => ({
          ships: prev.ships.map((s) =>
            s.id === shipId ? { ...s, launched: true, launchedAt: Date.now() } : s
          ),
          emberEnergy: Math.max(0, prev.emberEnergy - 5),
          totalShipsLaunched: prev.totalShipsLaunched + 1,
        }))
        return true
      },

      // ── ebReturnShip ──────────────────────────────────────────
      ebReturnShip: (shipId: string): boolean => {
        const state = get()
        const ship = state.ships.find((s) => s.id === shipId)
        if (!ship) return false
        if (!ship.launched) return false

        const def = EB_SHIPS.find((d) => d.id === ship.shipDefId)
        const lootGold = def ? Math.floor(def.capacity * 2 * Math.random()) + 10 : 50

        set((prev) => ({
          ships: prev.ships.map((s) =>
            s.id === shipId ? { ...s, launched: false, launchedAt: null } : s
          ),
          gold: prev.gold + lootGold,
        }))
        return true
      },

      // ── ebRepairShip ──────────────────────────────────────────
      ebRepairShip: (shipId: string): boolean => {
        const state = get()
        const ship = state.ships.find((s) => s.id === shipId)
        if (!ship) return false
        if (ship.currentDurability >= ship.maxDurability) return false

        const repairCost = Math.floor((ship.maxDurability - ship.currentDurability) * 0.5)
        if (state.gold < repairCost) return false

        set((prev) => ({
          ships: prev.ships.map((s) =>
            s.id === shipId ? { ...s, currentDurability: s.maxDurability } : s
          ),
          gold: prev.gold - repairCost,
        }))
        return true
      },

      // ── ebRespondEvent ────────────────────────────────────────
      ebRespondEvent: (eventId: string): boolean => {
        const state = get()
        if (!state.activeEventId) return false
        if (state.activeEventId !== eventId) return false
        if (state.emberEnergy < 10) return false

        const eventDef = EB_EVENTS.find((e) => e.id === eventId)
        if (!eventDef) return false

        const reward = eventDef.severity * 25
        set((prev) => ({
          activeEventId: null,
          eventTimer: 0,
          emberEnergy: Math.max(0, prev.emberEnergy - 10),
          gold: prev.gold + reward,
          bayExp: prev.bayExp + eventDef.severity * 10,
          bayLevel: ebLevelFromXp(prev.bayExp + eventDef.severity * 10),
        }))
        return true
      },

      // ── ebFleeEvent ───────────────────────────────────────────
      ebFleeEvent: () => {
        set({
          activeEventId: null,
          eventTimer: 0,
        })
      },

      // ── ebForgeEmber ─────────────────────────────────────────
      ebForgeEmber: (materialIds: string[]): boolean => {
        const state = get()
        if (materialIds.length === 0) return false
        if (state.smelterTemperature < 2000) return false

        for (const matId of materialIds) {
          const owned = state.collectedMaterials[matId] || 0
          if (owned < 1) return false
        }

        set((prev) => {
          const newMaterials = { ...prev.collectedMaterials }
          for (const matId of materialIds) {
            newMaterials[matId] = (newMaterials[matId] || 0) - 1
          }
          const forgedGold = materialIds.length * 15
          return {
            collectedMaterials: newMaterials,
            gold: prev.gold + forgedGold,
            emberEnergy: Math.min(EB_MAX_ENERGY, prev.emberEnergy + 3),
          }
        })
        return true
      },

      // ── ebAdjustSmelter ───────────────────────────────────────
      ebAdjustSmelter: (temperature: number): boolean => {
        if (temperature < 0 || temperature > EB_MAX_SMELTER_TEMP) return false

        const cost = Math.abs(temperature - get().smelterTemperature) * 0.1
        if (get().gold < cost) return false

        set((prev) => ({
          smelterTemperature: temperature,
          gold: Math.floor(prev.gold - cost),
        }))
        return true
      },

      // ── ebUnlockTitle ─────────────────────────────────────────
      ebUnlockTitle: (titleId: string): boolean => {
        const state = get()
        const title = EB_TITLES.find((t) => t.id === titleId)
        if (!title) return false
        if (state.bayLevel < title.requiredLevel) return false
        if (state.exploredZones.length < title.requiredExplored) return false

        set((prev) => ({
          currentTitle: titleId,
        }))
        return true
      },

      // ── ebClaimAchievement ────────────────────────────────────
      ebClaimAchievement: (achievementId: string): boolean => {
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        const ach = EB_ACHIEVEMENTS.find((a) => a.id === achievementId)
        if (!ach) return false

        if (!ebCheckAchievementCondition(state, achievementId)) return false

        set((prev) => ({
          achievements: [...prev.achievements, achievementId],
          gold: prev.gold + 100,
          emberEnergy: Math.min(EB_MAX_ENERGY, prev.emberEnergy + 20),
        }))
        return true
      },

      // ── ebBuyShip ─────────────────────────────────────────────
      ebBuyShip: (shipDefId: string): boolean => {
        const state = get()
        const def = EB_SHIPS.find((s) => s.id === shipDefId)
        if (!def) return false
        if (state.bayLevel < def.unlockLevel) return false
        if (state.gold < def.baseCost) return false

        set((prev) => ({
          ships: [
            ...prev.ships,
            {
              id: ebGenerateId(),
              shipDefId: shipDefId,
              currentDurability: def.durability,
              maxDurability: def.durability,
              launched: false,
              launchedAt: null,
            },
          ],
          gold: prev.gold - def.baseCost,
        }))
        return true
      },

      // ── ebTradeMaterials ──────────────────────────────────────
      ebTradeMaterials: (matA: string, matB: string, count: number): boolean => {
        const state = get()
        if (count <= 0) return false
        const ownedA = state.collectedMaterials[matA] || 0
        if (ownedA < count) return false

        set((prev) => ({
          collectedMaterials: {
            ...prev.collectedMaterials,
            [matA]: (prev.collectedMaterials[matA] || 0) - count,
            [matB]: (prev.collectedMaterials[matB] || 0) + count,
          },
        }))
        return true
      },
    }),
    {
      name: 'ws_ember_bay',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: INTERNAL HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function ebCheckAchievementCondition(state: EBStoreState, achievementId: string): boolean {
  switch (achievementId) {
    case 'ach_first_step':
      return state.exploredZones.length >= 1
    case 'ach_zone_master':
      return state.exploredZones.length >= 8
    case 'ach_collector_10':
      return state.totalCollected >= 100
    case 'ach_collector_500':
      return state.totalCollected >= 500
    case 'ach_forger_5':
      return state.totalForged >= 5
    case 'ach_forger_25':
      return state.totalForged >= 25
    case 'ach_creature_tamer':
      return state.creatures.length >= 1
    case 'ach_zoo_master':
      return state.creatures.length >= 10
    case 'ach_builder':
      return state.structures.length >= 1
    case 'ach_metropolis':
      return state.structures.length >= 15
    case 'ach_captain':
      return state.totalShipsLaunched >= 1
    case 'ach_admiral':
      return state.totalShipsLaunched >= 20
    case 'ach_event_handler':
      return state.achievements.filter((a) => a.startsWith('ach_event')).length >= 5 || state.totalShipsLaunched >= 5
    case 'ach_smelter_ace':
      return state.smelterTemperature >= EB_MAX_SMELTER_TEMP
    case 'ach_legendary_catch':
      return state.creatures.some((c) => {
        const def = EB_CREATURES.find((d) => d.id === c.creatureDefId)
        return def && def.rarity === 'legendary'
      })
    case 'ach_title_collector':
      return state.bayLevel >= 20
    case 'ach_level_25':
      return state.bayLevel >= 25
    case 'ach_level_50':
      return state.bayLevel >= 50
    default:
      return false
  }
}

function matValueForRarity(rarity: EBRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 4
    case 'epic': return 8
    case 'legendary': return 16
  }
}

function ebGetTypeColor(type: EBCreatureType): string {
  switch (type) {
    case 'fire': return EB_COLOR_FIRE
    case 'ash': return EB_COLOR_ASH
    case 'lava': return EB_COLOR_LAVA
    case 'obsidian': return EB_COLOR_OBSIDIAN
    case 'smoke': return EB_COLOR_SMOKE
  }
}

function ebGetRarityColor(rarity: EBRarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#22D3EE'
    case 'rare': return '#A78BFA'
    case 'epic': return '#F472B6'
    case 'legendary': return '#FBBF24'
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: DEFAULT EXPORT HOOK
// ═══════════════════════════════════════════════════════════════════

export default function useEmberBay() {
  const store = useEBStore()

  // ── Getter: Zone Details ──────────────────────────────────────
  const ebGetZoneDetails = useMemo(() => {
    return EB_ZONES.map((zone) => ({
      ...zone,
      explored: store.exploredZones.includes(zone.id),
      unlocked: store.bayLevel >= zone.unlockLevel,
      availableMaterials: zone.resources
        .map((rId) => EB_MATERIALS.find((m) => m.id === rId))
        .filter(Boolean),
    }))
  }, [store])

  // ── Getter: Material Inventory ───────────────────────────────
  const ebGetMaterialInventory = useMemo(() => {
    return EB_MATERIALS.map((mat) => ({
      ...mat,
      owned: store.collectedMaterials[mat.id] || 0,
      rarityColor: ebGetRarityColor(mat.rarity),
    }))
  }, [store])

  // ── Getter: Owned Creatures ──────────────────────────────────
  const ebGetOwnedCreatures = useMemo(() => {
    return store.creatures.map((c) => {
      const def = EB_CREATURES.find((d) => d.id === c.creatureDefId)
      return {
        ...c,
        def,
        typeColor: def ? ebGetTypeColor(def.type) : EB_COLOR_ASH,
        rarityColor: def ? ebGetRarityColor(def.rarity) : '#9CA3AF',
        totalPower: Math.floor((c.attack + c.defense) * (1 + c.level * 0.12)),
      }
    })
  }, [store])

  // ── Getter: Available Recipes ─────────────────────────────────
  const ebGetAvailableRecipes = useMemo(() => {
    return EB_RECIPES.map((recipe) => {
      const canCraft = recipe.requiredMaterials.every((req) => {
        const owned = store.collectedMaterials[req.materialId] || 0
        return owned >= req.amount
      })
      return {
        ...recipe,
        alreadyForged: store.recipes.includes(recipe.id),
        canCraft,
        rarityColor: ebGetRarityColor(recipe.rarity),
      }
    })
  }, [store])

  // ── Getter: Craftable Recipes ────────────────────────────────
  const ebGetCraftableRecipes = useMemo(() => {
    return ebGetAvailableRecipes.filter(
      (r) => r.canCraft && !r.alreadyForged && store.smelterTemperature >= 1000
    )
  }, [store, ebGetAvailableRecipes])

  // ── Getter: Structure List ───────────────────────────────────
  const ebGetStructureList = useMemo(() => {
    return store.structures.map((s) => {
      const def = EB_STRUCTURES.find((d) => d.id === s.structureDefId)
      return {
        ...s,
        def,
        upgradeCost: def
          ? Math.floor(def.baseCost * Math.pow(def.upgradeCostMultiplier, s.level))
          : 0,
        maxed: s.level >= 10,
      }
    })
  }, [store])

  // ── Getter: Ship Fleet ───────────────────────────────────────
  const ebGetShipFleet = useMemo(() => {
    return store.ships.map((s) => {
      const def = EB_SHIPS.find((d) => d.id === s.shipDefId)
      return {
        ...s,
        def,
        healthPercent: Math.floor((s.currentDurability / s.maxDurability) * 100),
        needsRepair: s.currentDurability < s.maxDurability * 0.5,
        unlockLevel: def ? def.unlockLevel : 1,
      }
    })
  }, [store])

  // ── Getter: Total Power ──────────────────────────────────────
  const ebGetTotalPower = useMemo(() => {
    let creaturePower = 0
    for (const c of store.creatures) {
      const def = EB_CREATURES.find((d) => d.id === c.creatureDefId)
      if (!def) continue
      const rarityMult = ebRarityPower(def.rarity)
      creaturePower += Math.floor(
        (c.attack + c.defense) * rarityMult * (1 + c.level * 0.12)
      )
    }
    const structurePower = store.structures.reduce(
      (sum, s) => sum + s.level * 15,
      0
    )
    return { creaturePower, structurePower, total: creaturePower + structurePower }
  }, [store])

  // ── Getter: Smelter Efficiency ───────────────────────────────
  const ebGetSmelterEfficiency = useMemo(() => {
    const tempPercent = Math.floor((store.smelterTemperature / EB_MAX_SMELTER_TEMP) * 100)
    const efficiency = Math.min(100, tempPercent)
    return {
      temperature: store.smelterTemperature,
      maxTemperature: EB_MAX_SMELTER_TEMP,
      percent: tempPercent,
      efficiency,
      canSmelt: store.smelterTemperature >= 1000,
      canForge: store.smelterTemperature >= 2000,
      isMax: store.smelterTemperature >= EB_MAX_SMELTER_TEMP,
      step: EB_SMELTER_STEP,
    }
  }, [store.smelterTemperature])

  // ── Getter: Event Status ─────────────────────────────────────
  const ebGetEventStatus = useMemo(() => {
    if (!store.activeEventId) return { active: false, event: null, timer: 0 }
    const event = EB_EVENTS.find((e) => e.id === store.activeEventId)
    return {
      active: true,
      event: event || null,
      timer: store.eventTimer,
      severity: event ? event.severity : 0,
    }
  }, [store.activeEventId, store.eventTimer])

  // ── Getter: Active Event ─────────────────────────────────────
  const ebGetActiveEvent = useMemo(() => {
    if (!store.activeEventId) return null
    return EB_EVENTS.find((e) => e.id === store.activeEventId) || null
  }, [store.activeEventId])

  // ── Getter: Next Title ───────────────────────────────────────
  const ebGetNextTitle = useMemo(() => {
    const currentTitle = EB_TITLES.find((t) => t.id === store.currentTitle)
    const currentIndex = currentTitle
      ? EB_TITLES.indexOf(currentTitle)
      : -1
    if (currentIndex >= EB_TITLES.length - 1) return null
    return EB_TITLES[currentIndex + 1]
  }, [store.currentTitle])

  // ── Getter: Rarity Summary ──────────────────────────────────
  const ebGetRaritySummary = useMemo(() => {
    const summary: Record<EBRarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const c of store.creatures) {
      const def = EB_CREATURES.find((d) => d.id === c.creatureDefId)
      if (def) {
        summary[def.rarity] += 1
      }
    }
    for (const r of store.recipes) {
      const def = EB_RECIPES.find((d) => d.id === r)
      if (def) {
        summary[def.rarity] += 1
      }
    }
    return summary
  }, [store])

  // ── Getter: Zone Summary ─────────────────────────────────────
  const ebGetZoneSummary = useMemo(() => {
    const totalZones = EB_ZONES.length
    const explored = store.exploredZones.length
    return {
      totalZones,
      explored,
      percent: Math.floor((explored / totalZones) * 100),
      allExplored: explored >= totalZones,
    }
  }, [store.exploredZones])

  // ── Getter: Unlocked Achievements ────────────────────────────
  const ebGetUnlockedAchievements = useMemo(() => {
    const unlocked: EBAchievementDef[] = []
    const claimable: EBAchievementDef[] = []

    for (const ach of EB_ACHIEVEMENTS) {
      if (store.achievements.includes(ach.id)) {
        unlocked.push(ach)
      } else if (ebCheckAchievementCondition(store, ach.id)) {
        claimable.push(ach)
      }
    }

    return { unlocked, claimable, total: EB_ACHIEVEMENTS.length, progress: unlocked.length }
  }, [store])

  // ── Getter: Title Progress ───────────────────────────────────
  const ebGetTitleProgress = useMemo(() => {
    return EB_TITLES.map((title) => ({
      ...title,
      unlocked: store.bayLevel >= title.requiredLevel && store.exploredZones.length >= title.requiredExplored,
      active: store.currentTitle === title.id,
      levelMet: store.bayLevel >= title.requiredLevel,
      exploreMet: store.exploredZones.length >= title.requiredExplored,
    }))
  }, [store.currentTitle, store.bayLevel, store.exploredZones])

  // ── Level Progress ───────────────────────────────────────────
  const ebLevelProgress = useMemo(() => {
    const current = ebXpForLevel(store.bayLevel)
    return {
      level: store.bayLevel,
      currentXp: store.bayExp,
      xpToNext: current,
      maxLevel: store.bayLevel >= EB_MAX_LEVEL,
      progressPercent:
        current > 0 ? Math.min(100, Math.floor((store.bayExp / current) * 100)) : 0,
    }
  }, [store.bayLevel, store.bayExp])

  // ── Assemble ebAPI ───────────────────────────────────────────
  const ebAPI = {
    // Constants
    EB_ZONES,
    EB_CREATURES,
    EB_MATERIALS,
    EB_STRUCTURES,
    EB_RECIPES,
    EB_ABILITIES,
    EB_ACHIEVEMENTS,
    EB_TITLES,
    EB_SHIPS,
    EB_EVENTS,
    EB_COLOR_ASH,
    EB_COLOR_EMBER,
    EB_COLOR_LAVA,
    EB_COLOR_MAGMA,
    EB_COLOR_OBSIDIAN,
    EB_COLOR_SMOKE,
    EB_COLOR_FIRE,
    EB_COLOR_COAL,

    // State
    exploredZones: store.exploredZones,
    collectedMaterials: store.collectedMaterials,
    creatures: store.creatures,
    structures: store.structures,
    recipes: store.recipes,
    ships: store.ships,
    achievements: store.achievements,
    currentTitle: store.currentTitle,
    bayLevel: store.bayLevel,
    bayExp: store.bayExp,
    gold: store.gold,
    emberEnergy: store.emberEnergy,
    totalCollected: store.totalCollected,
    totalForged: store.totalForged,
    totalExplored: store.totalExplored,
    totalShipsLaunched: store.totalShipsLaunched,
    activeZoneId: store.activeZoneId,
    activeEventId: store.activeEventId,
    eventTimer: store.eventTimer,
    smelterTemperature: store.smelterTemperature,

    // Actions
    ebExploreZone: store.ebExploreZone,
    ebCollectMaterial: store.ebCollectMaterial,
    ebSmeltOre: store.ebSmeltOre,
    ebBuildStructure: store.ebBuildStructure,
    ebUpgradeStructure: store.ebUpgradeStructure,
    ebDemolishStructure: store.ebDemolishStructure,
    ebAcquireCreature: store.ebAcquireCreature,
    ebReleaseCreature: store.ebReleaseCreature,
    ebTrainCreature: store.ebTrainCreature,
    ebLaunchShip: store.ebLaunchShip,
    ebReturnShip: store.ebReturnShip,
    ebRepairShip: store.ebRepairShip,
    ebRespondEvent: store.ebRespondEvent,
    ebFleeEvent: store.ebFleeEvent,
    ebForgeEmber: store.ebForgeEmber,
    ebAdjustSmelter: store.ebAdjustSmelter,
    ebUnlockTitle: store.ebUnlockTitle,
    ebClaimAchievement: store.ebClaimAchievement,
    ebBuyShip: store.ebBuyShip,
    ebTradeMaterials: store.ebTradeMaterials,

    // Getters
    ebGetZoneDetails,
    ebGetMaterialInventory,
    ebGetOwnedCreatures,
    ebGetAvailableRecipes,
    ebGetStructureList,
    ebGetShipFleet,
    ebGetTotalPower,
    ebGetSmelterEfficiency,
    ebGetEventStatus,
    ebGetNextTitle,
    ebGetRaritySummary,
    ebGetZoneSummary,
    ebGetUnlockedAchievements,
    ebGetTitleProgress,
    ebGetCraftableRecipes,
    ebGetActiveEvent,
    ebLevelProgress,
  }

  return ebAPI
}
