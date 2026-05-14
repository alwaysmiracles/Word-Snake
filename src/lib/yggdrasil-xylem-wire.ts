/**
 * Yggdrasil Xylem Wire — 世界树木质部 (World Tree Xylem) feature module for Word Snake
 *
 * A mystical journey through the vascular system of the World Tree Yggdrasil:
 * encounter 35 xylem entities across 7 species and 5 rarity tiers, explore 8
 * sacred chambers, gather 30 xylem materials, build 25 tree structures, master
 * 22 xylem abilities, earn 18 achievements, claim 8 titles, collect 15 legendary
 * artifacts, and face 12 cosmic events — backed by a Zustand store with persist
 * middleware.
 *
 * Storage key: yggdrasil-xylem-wire
 * Prefix: yx / YX_
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

export type YxRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type YxSpecies =
  | 'world_tree_spirit'
  | 'root_walker'
  | 'sap_golem'
  | 'leaf_dancer'
  | 'bark_golem'
  | 'nectar_fairy'
  | 'branch_sage'

export type YxAction =
  | 'absorb'
  | 'grow'
  | 'forge'
  | 'channel'
  | 'bloom'
  | 'root'
  | 'ascend'

export interface YxSpeciesDef {
  readonly id: YxSpecies
  readonly name: string
  readonly description: string
  readonly lore: string
  readonly emoji: string
  readonly color: string
  readonly passiveAbility: string
  readonly combatBonus: string
}

export interface YxCreatureDef {
  readonly id: string
  readonly name: string
  readonly species: YxSpecies
  readonly rarity: YxRarity
  readonly description: string
  readonly lore: string
  readonly emoji: string
  readonly power: number
  readonly defense: number
  readonly cost: number
  readonly xpReward: number
}

export interface YxChamberDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly lore: string
  readonly emoji: string
  readonly level: number
  readonly resources: string[]
  readonly capacity: number
  readonly unlockLevel: number
  readonly ambientColor: string
  readonly dangerLevel: number
}

export interface YxMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: YxRarity
  readonly description: string
  readonly sourceChamber: string
  readonly value: number
  readonly craftBonus: number
}

export interface YxStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly maxLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly effectPerLevel: number
  readonly requiredLevel: number
}

export interface YxAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly action: YxAction
  readonly rarity: YxRarity
  readonly cooldown: number
  readonly power: number
  readonly cost: number
  readonly requiredLevel: number
}

export interface YxAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly conditionKey: string
  readonly targetValue: number
  readonly rewardCoins: number
  readonly rewardXp: number
}

export interface YxTitleDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly requiredLevel: number
  readonly description: string
}

export interface YxArtifactDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: YxRarity
  readonly description: string
  readonly lore: string
  readonly powerBonus: number
  readonly defenseBonus: number
  readonly specialEffect: string
}

export interface YxEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly duration: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly requiredLevel: number
}

export interface YxCreatureState {
  owned: boolean
  count: number
  level: number
  xp: number
  acquiredAt: number | null
}

export interface YxChamberState {
  explored: boolean
  level: number
  gatherCount: number
  creaturesFound: number
  unlockedAt: number | null
}

export interface YxStructureState {
  level: number
  builtAt: number | null
}

export interface YxAbilityState {
  learned: boolean
  castCount: number
  cooldownEnd: number
}

export interface YxArtifactState {
  collected: boolean
  collectedAt: number | null
}

export interface YxAchievementState {
  unlocked: boolean
  unlockedAt: number | null
}

export interface YxEventState {
  activeEventId: string | null
  eventEnd: number
  eventsCompleted: number
}

export interface YxTotals {
  totalAbsorbed: number
  totalGrown: number
  totalForged: number
  totalChanneled: number
  totalBloomed: number
  totalRooted: number
  totalAscended: number
  totalCreaturesFound: number
  totalMaterialsGathered: number
  totalStructuresBuilt: number
  totalAbilitiesCast: number
  totalEventsCompleted: number
}

export interface YxResourceState {
  xylem_sap: number
  heartwood_bark: number
  golden_leaves: number
  root_threads: number
  amber_resin: number
  starlight_pollen: number
  ancient_seeds: number
  living_wood: number
  crystallized_nectar: number
  worldbark_fragments: number
  cosmic_sap: number
  primordial_amber: number
}

export interface YggdrasilXylemState {
  yxLevel: number
  yxXp: number
  yxSap: number
  yxHarmony: number
  yxXylemNodes: number
  yxResources: YxResourceState
  creatures: Record<string, YxCreatureState>
  chambers: Record<string, YxChamberState>
  structures: Record<string, YxStructureState>
  abilities: Record<string, YxAbilityState>
  artifacts: Record<string, YxArtifactState>
  achievements: Record<string, YxAchievementState>
  eventState: YxEventState
  totals: YxTotals
  yxSeed: number
  yxActiveChamber: string | null
  yxCurrentTitle: string
}

export interface YggdrasilXylemActions {
  yxAbsorbEnergy: (amount: number) => number
  yxGrowBranch: (chamberId: string) => boolean
  yxForgeNode: (entityId: string) => boolean
  yxChannelSap: (materialId: string) => number
  yxExploreChamber: (chamberId: string) => boolean
  yxDiscoverCreature: (creatureId: string) => boolean
  yxBuildStructure: (structureId: string) => boolean
  yxUpgradeStructure: (structureId: string) => boolean
  yxLearnAbility: (abilityId: string) => boolean
  yxCastAbility: (abilityId: string) => boolean
  yxCollectArtifact: (artifactId: string) => boolean
  yxClaimTitle: (titleId: string) => boolean
  yxStartEvent: (eventId: string) => boolean
  yxEndEvent: () => void
  yxAddXp: (amount: number) => void
  yxAddSap: (amount: number) => void
  yxSpendSap: (amount: number) => boolean
  yxGatherMaterial: (materialId: string, amount: number) => boolean
  yxResetState: () => void
}

export type YggdrasilXylemStore = YggdrasilXylemState & YggdrasilXylemActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: YX_ CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const YX_MAX_LEVEL = 50
export const YX_SAVE_KEY = 'yggdrasil-xylem-wire'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const YX_WORLD_GREEN = '#228B22'
export const YX_GOLDEN_BARK = '#DAA520'
export const YX_SAP_AMBER = '#FFBF00'
export const YX_ROOT_BROWN = '#5C4033'
export const YX_LEAF_JADE = '#00A86B'
export const YX_PETAL_IVORY = '#FFFFF0'
export const YX_CANOPY_TEAL = '#008080'

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: YX_SPECIES — 7 Species
// ═══════════════════════════════════════════════════════════════════

export const YX_SPECIES: readonly YxSpeciesDef[] = [
  {
    id: 'world_tree_spirit',
    name: 'World Tree Spirit',
    description:
      'Ethereal beings born from the consciousness of Yggdrasil itself, embodying the wisdom of ages.',
    lore:
      'When the first root of Yggdrasil pierced the primordial soil, a fragment of the World Tree\'s dream became aware. That fragment was the first Spirit, and from its awakening all other xylem life flowed. They remember the birth of every leaf and the death of every star.',
    emoji: '🌳',
    color: YX_WORLD_GREEN,
    passiveAbility: 'World Pulse — senses all activity within the tree network, +15% awareness',
    combatBonus: '+10% power when defending a chamber',
  },
  {
    id: 'root_walker',
    name: 'Root Walker',
    description:
      'Sturdy entities that traverse the deepest root networks of Yggdrasil, connecting earth to sky.',
    lore:
      'Root Walkers were carved from the deepest taproot by the first storm that ever shook the World Tree. They have walked the underground rivers of the earth for millennia, mapping passages that no other creature can navigate. Their footsteps cause new roots to grow.',
    emoji: '🦶',
    color: YX_ROOT_BROWN,
    passiveAbility: 'Deep Tap — draws nutrients from deep soil, +20% resource generation',
    combatBonus: '+25% defense in underground chambers',
  },
  {
    id: 'sap_golem',
    name: 'Sap Golem',
    description:
      'Liquid beings formed from the crystallized sap of the World Tree, flowing between chambers.',
    lore:
      'In the deepest reservoirs of Yggdrasil, sap that has flowed for ten thousand years begins to crystallize and develop primitive consciousness. When enough crystallized sap accumulates, a Sap Golem emerges — a being of flowing amber that can reshape itself at will.',
    emoji: '🫗',
    color: YX_SAP_AMBER,
    passiveAbility: 'Flow Form — can pass through any narrow gap, +15% evasion',
    combatBonus: '+12% power in Sap Reservoir chamber',
  },
  {
    id: 'leaf_dancer',
    name: 'Leaf Dancer',
    description:
      'Graceful creatures that ride the winds through the canopy, weaving patterns of light and shadow.',
    lore:
      'Leaf Dancers are born when a leaf detaches from Yggdrasil but refuses to fall. Instead, it catches the wind and spirals upward, gathering more leaves until it becomes a living tapestry of green and gold. Their dances paint the sky with aurora-like patterns.',
    emoji: '🍃',
    color: YX_LEAF_JADE,
    passiveAbility: 'Wind Ride — immune to ground-based attacks, +18% speed',
    combatBonus: '+20% power during daytime events',
  },
  {
    id: 'bark_golem',
    name: 'Bark Golem',
    description:
      'Massive guardians carved from Yggdrasil\'s living bark, standing sentinel at every threshold.',
    lore:
      'The Branch Sages carve Bark Golems from the oldest, thickest bark of Yggdrasil during the longest night of the year. Each Golem contains a sliver of the tree\'s defensive instinct. They have never been defeated in combat — only outwaited.',
    emoji: '🪨',
    color: YX_ROOT_BROWN,
    passiveAbility: 'Iron Bark — takes 30% less damage from all sources when stationary',
    combatBonus: '+35% defense but -15% movement speed',
  },
  {
    id: 'nectar_fairy',
    name: 'Nectar Fairy',
    description:
      'Tiny luminous beings that tend the tree\'s bioluminescent flowers, spreading pollen and light.',
    lore:
      'Nectar Fairies are the smallest but most numerous of Yggdrasil\'s children. They emerged from the first flowers to bloom on the World Tree\'s branches. Each one carries a vial of pure nectar that can heal any wound and restore any withered branch to life.',
    emoji: '🧚',
    color: YX_SAP_AMBER,
    passiveAbility: 'Nectar Blessing — heals all allies for 5 HP per turn in the same chamber',
    combatBonus: '+15% healing power to allied creatures',
  },
  {
    id: 'branch_sage',
    name: 'Branch Sage',
    description:
      'Ancient wise entities that dwell in the highest branches, reading the future in leaf patterns.',
    lore:
      'Branch Sages are the oldest sentient beings in Yggdrasil. They have watched civilizations rise and fall from their perches in the upper canopy. Their wisdom is so deep that speaking a single word can take them an hour, as they consider every possible consequence.',
    emoji: '🧙',
    color: YX_GOLDEN_BARK,
    passiveAbility: 'Foresight — predicts enemy moves, +20% dodge chance',
    combatBonus: '+22% power in Branch Observatory',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: YX_CREATURES — 35 Creatures (7 per rarity × 7 species)
// ═══════════════════════════════════════════════════════════════════

export const YX_CREATURES: readonly YxCreatureDef[] = [
  // ── Common (7) ──────────────────────────────────────────────────
  {
    id: 'cr_green_whisper',
    name: 'Green Whisper',
    species: 'world_tree_spirit',
    rarity: 'common',
    description: 'A faint echo of the World Tree\'s consciousness that murmurs ancient prophecies.',
    lore: 'Green Whispers are the smallest fragments of Yggdrasil\'s awareness. They appear as shimmering green motes of light that drift through the tree\'s interior, occasionally forming words in ancient languages only the Sages can understand.',
    emoji: '🌿',
    power: 12,
    defense: 8,
    cost: 50,
    xpReward: 10,
  },
  {
    id: 'cr_mud_treader',
    name: 'Mud Treader',
    species: 'root_walker',
    rarity: 'common',
    description: 'A young root walker learning to navigate the underground waterways of Yggdrasil.',
    lore: 'Mud Treaders are the apprentices of the root networks. They spend their first century mapping the tunnels beneath Yggdrasil, and their second century forgetting them so they can rediscover the joy of exploration.',
    emoji: '👣',
    power: 10,
    defense: 14,
    cost: 55,
    xpReward: 10,
  },
  {
    id: 'cr_drip_golem',
    name: 'Drip Golem',
    species: 'sap_golem',
    rarity: 'common',
    description: 'A small golem of fresh sap that slowly coalesces from dripping resin.',
    lore: 'Drip Golems form one drop at a time in the Sap Reservoir. They are the youngest of the sap beings, innocent and curious, often getting lost in the chambers they were born in. Other creatures find their slow, dripping patience oddly endearing.',
    emoji: '💧',
    power: 8,
    defense: 10,
    cost: 40,
    xpReward: 8,
  },
  {
    id: 'cr_wind_petel',
    name: 'Wind Petal',
    species: 'leaf_dancer',
    rarity: 'common',
    description: 'A single enchanted leaf that dances on the breeze with startling agility.',
    lore: 'Wind Petals are the simplest form of Leaf Dancer — a single leaf animated by the World Tree\'s breath. Despite their simplicity, they can perform aerial maneuvers that would make eagles jealous. Their favorite pastime is racing falling raindrops.',
    emoji: '🍂',
    power: 11,
    defense: 9,
    cost: 52,
    xpReward: 11,
  },
  {
    id: 'cr_barkling',
    name: 'Barkling',
    species: 'bark_golem',
    rarity: 'common',
    description: 'A small golem of sapling bark, loyal but slow and endearingly clumsy.',
    lore: 'Barklings are the youngest Bark Golems, barely a century old. Their bark is still soft and green, and they often trip over their own root-feet. Despite their clumsiness, they guard their posts with absolute dedication, never abandoning their duty.',
    emoji: '🪵',
    power: 14,
    defense: 12,
    cost: 60,
    xpReward: 12,
  },
  {
    id: 'cr_dew_fairy',
    name: 'Dew Fairy',
    species: 'nectar_fairy',
    rarity: 'common',
    description: 'A tiny fairy born from morning dew collected on Yggdrasil\'s outermost leaves.',
    lore: 'Dew Fairies appear at dawn, emerging from drops of dew that have caught the first light of morning. They spend their short lives (a mere century) tending to the outer leaves of Yggdrasil, polishing each one until it gleams like emerald glass.',
    emoji: '✨',
    power: 9,
    defense: 11,
    cost: 48,
    xpReward: 9,
  },
  {
    id: 'cr_twig_scholar',
    name: 'Twig Scholar',
    species: 'branch_sage',
    rarity: 'common',
    description: 'A young sage who studies the patterns of twig growth to predict the weather.',
    lore: 'Twig Scholars are the youngest Branch Sages, assigned to study the smallest branches of Yggdrasil. Through careful observation of how twigs grow, bend, and break, they can predict weather patterns months in advance with uncanny accuracy.',
    emoji: '📚',
    power: 13,
    defense: 10,
    cost: 58,
    xpReward: 11,
  },

  // ── Uncommon (7) ───────────────────────────────────────────────
  {
    id: 'un_spirit_weaver',
    name: 'Spirit Weaver',
    species: 'world_tree_spirit',
    rarity: 'uncommon',
    description: 'A spirit that can weave fragments of Yggdrasil\'s dream into temporary physical forms.',
    lore: 'Spirit Weavers have learned to catch threads of the World Tree\'s sleeping consciousness and weave them into tangible shapes. They create bridges of solidified dream, walls of crystallized memory, and weapons of focused purpose. Their creations last only as long as the dream holds.',
    emoji: '🕸️',
    power: 24,
    defense: 16,
    cost: 200,
    xpReward: 25,
  },
  {
    id: 'un_deep_root_runner',
    name: 'Deep Root Runner',
    species: 'root_walker',
    rarity: 'uncommon',
    description: 'A root walker that has mapped the deepest underground rivers beneath Yggdrasil.',
    lore: 'Deep Root Runners have traveled further underground than any other creature. They have reached the molten core of the earth and returned unchanged. The heat tempers their bark into something closer to iron, and the pressure makes them nearly indestructible.',
    emoji: '🏃',
    power: 20,
    defense: 28,
    cost: 220,
    xpReward: 28,
  },
  {
    id: 'un_amber_crafter',
    name: 'Amber Crafter',
    species: 'sap_golem',
    rarity: 'uncommon',
    description: 'A sap golem that shapes hardened amber into tools and ornaments of remarkable beauty.',
    lore: 'Amber Crafters have mastered the art of solidifying their own body into temporary shapes. They can form keys, lenses, weapons, or shields from their amber substance, then flow back into liquid form when no longer needed. Their creations glow with warm inner light.',
    emoji: '🎨',
    power: 22,
    defense: 20,
    cost: 210,
    xpReward: 26,
  },
  {
    id: 'un_canopy_glider',
    name: 'Canopy Glider',
    species: 'leaf_dancer',
    rarity: 'uncommon',
    description: 'A leaf dancer that has learned to ride thermal currents above the World Tree.',
    lore: 'Canopy Gliders have ascended beyond the branches of Yggdrasil to ride the winds of the upper atmosphere. From their dizzying heights, they can see for hundreds of miles and have been known to guide lost travelers home by dropping leaves as a trail.',
    emoji: '🪁',
    power: 26,
    defense: 18,
    cost: 230,
    xpReward: 28,
  },
  {
    id: 'un_bark_shaper',
    name: 'Bark Shaper',
    species: 'bark_golem',
    rarity: 'uncommon',
    description: 'A bark golem that can reshape its own form, growing additional limbs as needed.',
    lore: 'Bark Shapers have transcended their original form. They can grow new arms, legs, or even wings from their living bark, adapting to any situation. In battle, they become a whirlwind of wooden limbs, each one striking with the force of a falling tree.',
    emoji: '⚔️',
    power: 25,
    defense: 22,
    cost: 225,
    xpReward: 28,
  },
  {
    id: 'un_pollen_mage',
    name: 'Pollen Mage',
    species: 'nectar_fairy',
    rarity: 'uncommon',
    description: 'A fairy that commands clouds of magical pollen for both healing and offense.',
    lore: 'Pollen Mages have discovered that the pollen from Yggdrasil\'s flowers contains concentrated magical energy. By weaving pollen clouds into specific patterns, they can create explosions of light, barriers of golden dust, or healing rains that cure any ailment.',
    emoji: '🌸',
    power: 18,
    defense: 26,
    cost: 215,
    xpReward: 27,
  },
  {
    id: 'un_branch_reader',
    name: 'Branch Reader',
    species: 'branch_sage',
    rarity: 'uncommon',
    description: 'A sage who reads the branching patterns of Yggdrasil to divine the future.',
    lore: 'Branch Readers interpret the fractal patterns of Yggdrasil\'s branches as a cosmic language. Each fork in a branch represents a choice made by fate, and each new growth represents a possibility yet to unfold. Their prophecies are never wrong, but always maddeningly vague.',
    emoji: '🔮',
    power: 23,
    defense: 18,
    cost: 235,
    xpReward: 30,
  },

  // ── Rare (7) ───────────────────────────────────────────────────
  {
    id: 'ra_tree_soul_echo',
    name: 'Tree Soul Echo',
    species: 'world_tree_spirit',
    rarity: 'rare',
    description: 'A powerful echo of Yggdrasil\'s soul that can temporarily control sections of the tree.',
    lore: 'Tree Soul Echoes are the loudest whispers of the World Tree\'s consciousness. When they speak, entire sections of the tree respond — branches move, roots shift, sap flows in new directions. They are the voice and hands of Yggdrasil made manifest.',
    emoji: '👻',
    power: 45,
    defense: 30,
    cost: 800,
    xpReward: 55,
  },
  {
    id: 'ra_mountain_root',
    name: 'Mountain Root',
    species: 'root_walker',
    rarity: 'rare',
    description: 'A colossal root walker whose body contains minerals from the earth\'s deepest layers.',
    lore: 'Mountain Roots have absorbed so many minerals during their underground journeys that their bodies have become partially crystalline. They sparkle with embedded gems, and their footsteps leave veins of precious ore in the soil. Miners follow their trails to find rich deposits.',
    emoji: '⛰️',
    power: 40,
    defense: 55,
    cost: 900,
    xpReward: 60,
  },
  {
    id: 'ra_sap_titan',
    name: 'Sap Titan',
    species: 'sap_golem',
    rarity: 'rare',
    description: 'A massive sap golem that flows like a river of molten amber through the tree\'s veins.',
    lore: 'Sap Titans are the largest of the sap beings, sometimes growing to the size of small lakes. They flow through Yggdrasil\'s vascular system like rivers of living amber, distributing nutrients and clearing blockages. When threatened, they can solidify into an impenetrable wall.',
    emoji: '🌊',
    power: 48,
    defense: 38,
    cost: 850,
    xpReward: 58,
  },
  {
    id: 'ra_storm_leaf',
    name: 'Storm Leaf',
    species: 'leaf_dancer',
    rarity: 'rare',
    description: 'A leaf dancer that generates its own windstorms, creating cyclones of razor-sharp leaves.',
    lore: 'Storm Leaves have learned to harness the kinetic energy of their constant motion. As they spin faster and faster, they generate localized windstorms that can lift boulders and shred steel. Their leaf cyclones have been mistaken for tornadoes by the civilizations below.',
    emoji: '🌪️',
    power: 52,
    defense: 35,
    cost: 880,
    xpReward: 58,
  },
  {
    id: 'ra_ironbark_guardian',
    name: 'Ironbark Guardian',
    species: 'bark_golem',
    rarity: 'rare',
    description: 'A bark golem whose bark has been tempered by centuries of combat into iron-hard armor.',
    lore: 'Ironbark Guardians have fought in every battle Yggdrasil has ever faced. Their bark has been struck by lightning, frozen by ice ages, and bathed in dragon fire. Each assault has made them harder, tougher, and more resolute. Nothing can break them.',
    emoji: '🛡️',
    power: 50,
    defense: 60,
    cost: 950,
    xpReward: 65,
  },
  {
    id: 'ra_ambrosia_fairy',
    name: 'Ambrosia Fairy',
    species: 'nectar_fairy',
    rarity: 'rare',
    description: 'A fairy that produces ambrosia — the food of the gods — from Yggdrasil\'s rarest flowers.',
    lore: 'Ambrosia Fairies tend the legendary flowers that bloom once every thousand years on Yggdrasil\'s highest branches. The nectar from these flowers is ambrosia itself — a single drop grants immortality for a day and heals any wound, no matter how fatal.',
    emoji: '🍯',
    power: 38,
    defense: 50,
    cost: 870,
    xpReward: 62,
  },
  {
    id: 'ra_world_seer',
    name: 'World Seer',
    species: 'branch_sage',
    rarity: 'rare',
    description: 'A sage whose visions encompass the entire world, seeing all that was and all that will be.',
    lore: 'World Seers have gazed into the branching patterns of Yggdrasil for so long that they have begun to see the pattern of reality itself. Every event, every choice, every consequence is laid bare before them. The burden of this knowledge is immense, and many World Seers choose silence.',
    emoji: '👁️',
    power: 42,
    defense: 45,
    cost: 920,
    xpReward: 63,
  },

  // ── Epic (7) ───────────────────────────────────────────────────
  {
    id: 'ep_heartwood_phantom',
    name: 'Heartwood Phantom',
    species: 'world_tree_spirit',
    rarity: 'epic',
    description: 'A phantom that manifests from the Heartwood Core, wielding the raw power of creation.',
    lore: 'Heartwood Phantoms are the dream of Yggdrasil\'s heart made real. They appear only when the World Tree dreams deeply, which happens once every thousand years. In the few hours they exist, they reshape reality within a mile radius according to the tree\'s will.',
    emoji: '💫',
    power: 85,
    defense: 55,
    cost: 3500,
    xpReward: 130,
  },
  {
    id: 'ep_abyssal_root',
    name: 'Abyssal Root',
    species: 'root_walker',
    rarity: 'epic',
    description: 'A root walker that has reached the bottom of the world and returned transformed.',
    lore: 'Abyssal Roots are the only creatures to have reached the absolute bottom of the world\'s root system. What they found there changed them fundamentally — they now exist partially in a dimension of pure earth energy, giving them control over stone, metal, and crystal.',
    emoji: '🕳️',
    power: 75,
    defense: 95,
    cost: 3800,
    xpReward: 135,
  },
  {
    id: 'ep_primordial_sap',
    name: 'Primordial Sap',
    species: 'sap_golem',
    rarity: 'epic',
    description: 'A sap golem formed from the original sap that first flowed through Yggdrasil.',
    lore: 'The Primordial Sap was the first liquid to ever flow through the World Tree\'s veins. It has been circulating for the entire age of the tree, absorbing the memories and powers of every creature that has ever lived within its bark. It knows everything.',
    emoji: '🏺',
    power: 90,
    defense: 65,
    cost: 3600,
    xpReward: 128,
  },
  {
    id: 'ep_aurora_leaf',
    name: 'Aurora Leaf',
    species: 'leaf_dancer',
    rarity: 'epic',
    description: 'A leaf dancer whose leaves shimmer with every color, creating permanent auroras in the sky.',
    lore: 'Aurora Leaves have absorbed so much starlight that their leaves have become prisms, splitting light into every color of the spectrum. Wherever they dance, auroras follow — ribbons of color that paint the sky in patterns of impossible beauty.',
    emoji: '🌈',
    power: 95,
    defense: 60,
    cost: 3700,
    xpReward: 132,
  },
  {
    id: 'ep_worldbark_colossus',
    name: 'Worldbark Colossus',
    species: 'bark_golem',
    rarity: 'epic',
    description: 'A colossus wrapped in bark from every tree species that has ever existed on the planet.',
    lore: 'The Worldbark Colossus carries the bark of every tree that has ever grown on Earth within its layers. Each species contributes its unique properties — ironwood for strength, willow for flexibility, oak for endurance, yew for resistance to magic. It is the ultimate fusion of all arboreal power.',
    emoji: '🗿',
    power: 88,
    defense: 100,
    cost: 4000,
    xpReward: 140,
  },
  {
    id: 'ep_life_nymph',
    name: 'Life Nymph',
    species: 'nectar_fairy',
    rarity: 'epic',
    description: 'A fairy whose nectar can resurrect the dead and restore life to withered landscapes.',
    lore: 'Life Nymphs have reached the pinnacle of nectar alchemy. Their nectar doesn\'t just heal — it recreates. A single drop can resurrect a dead forest, restore a dried river, or bring back a creature that has been gone for centuries. They are the most precious beings in Yggdrasil.',
    emoji: '🧬',
    power: 70,
    defense: 85,
    cost: 3900,
    xpReward: 138,
  },
  {
    id: 'ep_cosmic_sage',
    name: 'Cosmic Sage',
    species: 'branch_sage',
    rarity: 'epic',
    description: 'A sage whose wisdom extends beyond the world, encompassing the stars themselves.',
    lore: 'Cosmic Sages have extended their consciousness beyond Yggdrasil to encompass the entire cosmos. They can read the branching patterns of galaxies the way lesser sages read tree branches. They know the names of every star, the age of every planet, and the fate of every universe.',
    emoji: '🌌',
    power: 92,
    defense: 70,
    cost: 4100,
    xpReward: 142,
  },

  // ── Legendary (7) ──────────────────────────────────────────────
  {
    id: 'lg_yggdrasil_awakener',
    name: 'Yggdrasil Awakener',
    species: 'world_tree_spirit',
    rarity: 'legendary',
    description:
      'The spirit destined to fully awaken Yggdrasil when the final alignment of worlds occurs.',
    lore:
      'The Yggdrasil Awakener is the culmination of the World Tree\'s long dream. When the stars align for the first time in a billion years, this spirit will open its eyes and Yggdrasil will truly wake. The world will never be the same. Mountains will walk, rivers will sing, and the sky will remember its original color.',
    emoji: '👑',
    power: 150,
    defense: 110,
    cost: 15000,
    xpReward: 350,
  },
  {
    id: 'lg_world_root_sovereign',
    name: 'World Root Sovereign',
    species: 'root_walker',
    rarity: 'legendary',
    description:
      'The ruler of all root networks on Earth, commanding the underground connections of every forest.',
    lore:
      'The World Root Sovereign\'s consciousness extends through the root systems of every tree on the planet. They feel every earthquake, taste every underground river, and hear every creature that burrows beneath the soil. They are the nervous system of the living earth itself.',
    emoji: '🌍',
    power: 140,
    defense: 160,
    cost: 16000,
    xpReward: 380,
  },
  {
    id: 'lg_eternal_sap_ocean',
    name: 'Eternal Sap Ocean',
    species: 'sap_golem',
    rarity: 'legendary',
    description:
      'A sap golem so vast it has become an ocean of living amber within Yggdrasil\'s trunk.',
    lore:
      'The Eternal Sap Ocean fills an entire chamber within Yggdrasil\'s trunk. It is a self-aware ocean of amber that thinks in slow, deep currents. Creatures that enter its waters find their wounds healed, their minds clarified, and their lifespans extended by centuries.',
    emoji: '🌊',
    power: 160,
    defense: 120,
    cost: 17000,
    xpReward: 400,
  },
  {
    id: 'lg_infinite_leaf_storm',
    name: 'Infinite Leaf Storm',
    species: 'leaf_dancer',
    rarity: 'legendary',
    description:
      'A leaf dancer surrounded by an eternal storm of self-replicating leaves that never fall.',
    lore:
      'The Infinite Leaf Storm has achieved what every Leaf Dancer dreams of — permanence. Their leaves never wilt, never fall, and never stop dancing. Each leaf can split into two, then four, then eight, creating storms of leaves that can blanket continents in emerald-green armor.',
    emoji: '🍃',
    power: 145,
    defense: 130,
    cost: 15500,
    xpReward: 360,
  },
  {
    id: 'lg_heartwood_immortal',
    name: 'Heartwood Immortal',
    species: 'bark_golem',
    rarity: 'legendary',
    description:
      'A bark golem made from Yggdrasil\'s original heartwood, completely indestructible and eternal.',
    lore:
      'The Heartwood Immortal was the first thing ever carved from Yggdrasil. Before roots, before branches, before leaves — there was this golem, standing guard over the seed from which the World Tree would grow. It has never moved, never rested, and never been damaged. It is the oldest guardian in existence.',
    emoji: '🏰',
    power: 155,
    defense: 175,
    cost: 18000,
    xpReward: 400,
  },
  {
    id: 'lg_ambrosia_queen',
    name: 'Ambrosia Queen',
    species: 'nectar_fairy',
    rarity: 'legendary',
    description:
      'The queen of all nectar fairies, whose ambrosia can grant true immortality.',
    lore:
      'The Ambrosia Queen rules over every flower in every dimension. Her ambrosia is not merely the food of gods — it is the substance from which gods are made. To drink her nectar is to become divine, to transcend mortality and join the eternal dance of cosmic creation.',
    emoji: '👑',
    power: 135,
    defense: 155,
    cost: 16500,
    xpReward: 370,
  },
  {
    id: 'lg_all_branch_prophet',
    name: 'All-Branch Prophet',
    species: 'branch_sage',
    rarity: 'legendary',
    description:
      'The ultimate sage who sees all possible futures simultaneously across all branching timelines.',
    lore:
      'The All-Branch Prophet exists in every timeline at once. They can see not just what will happen, but what could happen, what should happen, and what must happen. They hold the complete map of destiny in their mind, from the first moment of creation to the final heat death of the universe.',
    emoji: '📖',
    power: 200,
    defense: 100,
    cost: 20000,
    xpReward: 500,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: YX_CHAMBERS — 8 Chambers
// ═══════════════════════════════════════════════════════════════════

export const YX_CHAMBERS: readonly YxChamberDef[] = [
  {
    id: 'heartwood_core',
    name: 'Heartwood Core',
    description: 'The beating heart of Yggdrasil, where the tree\'s life force pulses with primal energy.',
    lore:
      'At the absolute center of Yggdrasil lies the Heartwood Core — a chamber of living wood that pulses with the rhythm of the tree\'s heartbeat. The walls breathe, expanding and contracting with each beat, and the air is thick with golden sap mist. Standing here, you can feel the life force of every creature connected to the tree.',
    emoji: '💚',
    level: 1,
    resources: ['xylem_sap', 'living_wood', 'golden_leaves'],
    capacity: 5,
    unlockLevel: 1,
    ambientColor: YX_WORLD_GREEN,
    dangerLevel: 1,
  },
  {
    id: 'canopy_cathedral',
    name: 'Canopy Cathedral',
    description: 'The highest point of Yggdrasil, where branches touch the stars and the sky opens above.',
    lore:
      'The Canopy Cathedral is Yggdrasil\'s crown jewel. Its vaulted ceiling is formed by the interlocking branches of the tree\'s highest limbs, and through the gaps you can see the stars wheeling overhead. At night, the chamber fills with starlight that makes every leaf glow like silver.',
    emoji: '⛪',
    level: 2,
    resources: ['starlight_pollen', 'golden_leaves', 'ancient_seeds'],
    capacity: 6,
    unlockLevel: 5,
    ambientColor: YX_GOLDEN_BARK,
    dangerLevel: 2,
  },
  {
    id: 'root_labyrinth',
    name: 'Root Labyrinth',
    description: 'A maze of ancient roots below the earth, where secrets of the deep are hidden.',
    lore:
      'Beneath Yggdrasil, its roots have grown into a labyrinth so vast and complex that entire ecosystems exist within it, never seeing sunlight. Bioluminescent fungi light the way, and underground rivers flow through root-carved canals. Many who enter are never seen again — but they find something better than returning.',
    emoji: '🏛️',
    level: 3,
    resources: ['root_threads', 'primordial_amber', 'heartwood_bark'],
    capacity: 7,
    unlockLevel: 10,
    ambientColor: YX_ROOT_BROWN,
    dangerLevel: 3,
  },
  {
    id: 'sap_reservoir',
    name: 'Sap Reservoir',
    description: 'Underground caverns filled with crystallized sap that glows with warm amber light.',
    lore:
      'The Sap Reservoir is where Yggdrasil stores its lifeblood. Millions of gallons of golden sap fill vast underground caverns, their surfaces perfectly still and mirror-bright. The sap here has been aging for millennia, slowly crystallizing into gems of pure amber that pulse with stored sunlight.',
    emoji: '🏺',
    level: 4,
    resources: ['xylem_sap', 'amber_resin', 'crystallized_nectar'],
    capacity: 8,
    unlockLevel: 15,
    ambientColor: YX_SAP_AMBER,
    dangerLevel: 4,
  },
  {
    id: 'leaf_canopy',
    name: 'Leaf Canopy',
    description: 'An endless expanse of living leaves that stretches to every horizon within the tree.',
    lore:
      'The Leaf Canopy is a horizontal world of leaves so vast that it has its own weather systems. Rain falls from the leaves above onto the leaves below, creating waterfalls of chlorophyll. The wind here creates waves of green that ripple outward from the center, each wave carrying news from distant branches.',
    emoji: '🍃',
    level: 5,
    resources: ['golden_leaves', 'ancient_seeds', 'starlight_pollen'],
    capacity: 8,
    unlockLevel: 20,
    ambientColor: YX_LEAF_JADE,
    dangerLevel: 5,
  },
  {
    id: 'bark_bastion',
    name: 'Bark Bastion',
    description: 'The outer defensive layer of Yggdrasil, where bark guardians stand eternal watch.',
    lore:
      'The Bark Bastion is the first and last line of defense for Yggdrasil. Its walls are thirty meters of living bark, reinforced with iron-hard fibers and healing resin. Every surface is monitored by Bark Golems who have stood watch since before human civilization began. Nothing has ever breached these walls.',
    emoji: '🛡️',
    level: 6,
    resources: ['heartwood_bark', 'worldbark_fragments', 'root_threads'],
    capacity: 9,
    unlockLevel: 28,
    ambientColor: YX_ROOT_BROWN,
    dangerLevel: 6,
  },
  {
    id: 'nectar_grove',
    name: 'Nectar Grove',
    description: 'A sacred grove of bioluminescent flowers that produce the rarest nectar in existence.',
    lore:
      'The Nectar Grove is where Yggdrasil\'s most precious flowers bloom. Each flower is unique, existing nowhere else in the universe, and their nectar contains properties that defy the laws of physics. The grove glows with soft light in every color, and the air is so sweet it intoxicates with every breath.',
    emoji: '🌺',
    level: 7,
    resources: ['crystallized_nectar', 'ancient_seeds', 'cosmic_sap'],
    capacity: 10,
    unlockLevel: 36,
    ambientColor: YX_SAP_AMBER,
    dangerLevel: 7,
  },
  {
    id: 'branch_observatory',
    name: 'Branch Observatory',
    description: 'Where the highest branches touch the heavens, observing the cosmos in silent wonder.',
    lore:
      'The Branch Observatory sits at the very tip of Yggdrasil\'s tallest branch, extending beyond the atmosphere into the thin edge of space. Here, the Branch Sages maintain their vigil over the cosmos, watching stars being born and dying, tracking the movements of galaxies, and listening to the music of the spheres.',
    emoji: '🔭',
    level: 8,
    resources: ['cosmic_sap', 'primordial_amber', 'starlight_pollen', 'ancient_seeds'],
    capacity: 12,
    unlockLevel: 45,
    ambientColor: YX_GOLDEN_BARK,
    dangerLevel: 8,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: YX_MATERIALS — 30 Materials (6 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const YX_MATERIALS: readonly YxMaterialDef[] = [
  // Common (6)
  {
    id: 'mat_xylem_sap',
    name: 'Xylem Sap',
    emoji: '🍯',
    rarity: 'common',
    description: 'Fresh sap drawn from Yggdrasil\'s xylem vessels. Warm and sweet, used in basic crafting and healing.',
    sourceChamber: 'heartwood_core',
    value: 10,
    craftBonus: 2,
  },
  {
    id: 'mat_heartwood_bark',
    name: 'Heartwood Bark',
    emoji: '🪵',
    rarity: 'common',
    description: 'Fibrous bark stripped from the outer heartwood layer. Strong and flexible when wet.',
    sourceChamber: 'heartwood_core',
    value: 12,
    craftBonus: 3,
  },
  {
    id: 'mat_golden_leaves',
    name: 'Golden Leaves',
    emoji: '🍂',
    rarity: 'common',
    description: 'Leaves infused with concentrated sunlight that shimmer with a warm golden glow.',
    sourceChamber: 'canopy_cathedral',
    value: 15,
    craftBonus: 4,
  },
  {
    id: 'mat_root_threads',
    name: 'Root Threads',
    emoji: '🧵',
    rarity: 'common',
    description: 'Fine threads harvested from young root tips. Incredibly strong for their diameter.',
    sourceChamber: 'root_labyrinth',
    value: 8,
    craftBonus: 2,
  },
  {
    id: 'mat_amber_resin',
    name: 'Amber Resin',
    emoji: '🟠',
    rarity: 'common',
    description: 'Sticky resin from Yggdrasil\'s bark that hardens into a transparent golden amber.',
    sourceChamber: 'sap_reservoir',
    value: 18,
    craftBonus: 5,
  },
  {
    id: 'mat_starlight_pollen',
    name: 'Starlight Pollen',
    emoji: '✨',
    rarity: 'common',
    description: 'Pollen that has absorbed starlight from the canopy. Glows faintly in darkness.',
    sourceChamber: 'canopy_cathedral',
    value: 14,
    craftBonus: 3,
  },

  // Uncommon (6)
  {
    id: 'mat_ancient_seeds',
    name: 'Ancient Seeds',
    emoji: '🌱',
    rarity: 'uncommon',
    description: 'Seeds from Yggdrasil\'s original fruit, preserved in amber for millennia.',
    sourceChamber: 'leaf_canopy',
    value: 80,
    craftBonus: 10,
  },
  {
    id: 'mat_living_wood',
    name: 'Living Wood',
    emoji: '🪵',
    rarity: 'uncommon',
    description: 'Wood cut from Yggdrasil that continues to grow and heal after being harvested.',
    sourceChamber: 'heartwood_core',
    value: 90,
    craftBonus: 12,
  },
  {
    id: 'mat_crystallized_nectar',
    name: 'Crystallized Nectar',
    emoji: '💎',
    rarity: 'uncommon',
    description: 'Nectar from the Nectar Grove that has crystallized into a gem-like substance.',
    sourceChamber: 'nectar_grove',
    value: 75,
    craftBonus: 8,
  },
  {
    id: 'mat_worldbark_fragment',
    name: 'Worldbark Fragment',
    emoji: '🛡️',
    rarity: 'uncommon',
    description: 'A shard of Yggdrasil\'s legendary outer bark. Exceptionally hard and magically resistant.',
    sourceChamber: 'bark_bastion',
    value: 85,
    craftBonus: 11,
  },
  {
    id: 'mat_deep_root_essence',
    name: 'Deep Root Essence',
    emoji: '🧪',
    rarity: 'uncommon',
    description: 'Concentrated essence from roots that have reached the earth\'s molten core.',
    sourceChamber: 'root_labyrinth',
    value: 95,
    craftBonus: 13,
  },
  {
    id: 'mat_canopy_dew',
    name: 'Canopy Dew',
    emoji: '💧',
    rarity: 'uncommon',
    description: 'Dew collected from the highest leaves at dawn. Contains traces of starlight and air magic.',
    sourceChamber: 'canopy_cathedral',
    value: 70,
    craftBonus: 9,
  },

  // Rare (6)
  {
    id: 'mat_pulsing_heartwood',
    name: 'Pulsing Heartwood',
    emoji: '💓',
    rarity: 'rare',
    description: 'Wood from the Heartwood Core that still pulses with the tree\'s heartbeat.',
    sourceChamber: 'heartwood_core',
    value: 350,
    craftBonus: 30,
  },
  {
    id: 'mat_star_crystal_sap',
    name: 'Star Crystal Sap',
    emoji: '⭐',
    rarity: 'rare',
    description: 'Sap that has crystallized around a captured star fragment. Glows with inner light.',
    sourceChamber: 'branch_observatory',
    value: 300,
    craftBonus: 25,
  },
  {
    id: 'mat_maze_root_key',
    name: 'Maze Root Key',
    emoji: '🗝️',
    rarity: 'rare',
    description: 'A root grown into a key shape by the Root Labyrinth. Opens passages to hidden chambers.',
    sourceChamber: 'root_labyrinth',
    value: 380,
    craftBonus: 35,
  },
  {
    id: 'mat_ageless_amber',
    name: 'Ageless Amber',
    emoji: '🔶',
    rarity: 'rare',
    description: 'Amber so ancient it has stopped aging entirely. Perfectly preserved and magically inert.',
    sourceChamber: 'sap_reservoir',
    value: 320,
    craftBonus: 28,
  },
  {
    id: 'mat_everbloom_pollen',
    name: 'Everbloom Pollen',
    emoji: '🌸',
    rarity: 'rare',
    description: 'Pollen from flowers that bloom perpetually without wilting. Generates infinite light.',
    sourceChamber: 'nectar_grove',
    value: 340,
    craftBonus: 32,
  },
  {
    id: 'mat_ironbark_ingot',
    name: 'Ironbark Ingot',
    emoji: '🔩',
    rarity: 'rare',
    description: 'Bark from the Bark Bastion compressed into an ingot harder than steel.',
    sourceChamber: 'bark_bastion',
    value: 360,
    craftBonus: 33,
  },

  // Epic (6)
  {
    id: 'mat_world_heart_fragment',
    name: 'World Heart Fragment',
    emoji: '💎',
    rarity: 'epic',
    description: 'A shard of the Heartwood Core\'s crystallized life force. Warm to the touch and alive.',
    sourceChamber: 'heartwood_core',
    value: 1500,
    craftBonus: 80,
  },
  {
    id: 'mat_cosmic_branch_sample',
    name: 'Cosmic Branch Sample',
    emoji: '🌌',
    rarity: 'epic',
    description: 'A branch segment from beyond the atmosphere. Contains material from asteroids and comets.',
    sourceChamber: 'branch_observatory',
    value: 1800,
    craftBonus: 100,
  },
  {
    id: 'mat_primordial_root_heart',
    name: 'Primordial Root Heart',
    emoji: '🌍',
    rarity: 'epic',
    description: 'The central node of Yggdrasil\'s deepest root. Contains the memory of the earth\'s formation.',
    sourceChamber: 'root_labyrinth',
    value: 1600,
    craftBonus: 90,
  },
  {
    id: 'mat_ocean_sap_vial',
    name: 'Ocean Sap Vial',
    emoji: '🌊',
    rarity: 'epic',
    description: 'A vial of sap from the legendary Eternal Sap Ocean. Grants visions of all connected life.',
    sourceChamber: 'sap_reservoir',
    value: 1700,
    craftBonus: 95,
  },
  {
    id: 'mat_immortal_bark_plates',
    name: 'Immortal Bark Plates',
    emoji: '🛡️',
    rarity: 'epic',
    description: 'Bark plates from the Heartwood Immortal. Cannot be damaged by any known force.',
    sourceChamber: 'bark_bastion',
    value: 2000,
    craftBonus: 110,
  },
  {
    id: 'mat_queen_ambrosia_drop',
    name: 'Queen Ambrosia Drop',
    emoji: '👑',
    rarity: 'epic',
    description: 'A single drop of the Ambrosia Queen\'s nectar. Contains the essence of divinity.',
    sourceChamber: 'nectar_grove',
    value: 2200,
    craftBonus: 120,
  },

  // Legendary (6)
  {
    id: 'mat_awakening_essence',
    name: 'Awakening Essence',
    emoji: '👁️',
    rarity: 'legendary',
    description: 'The concentrated essence of Yggdrasil\'s awakening consciousness. Reality bends around it.',
    sourceChamber: 'heartwood_core',
    value: 5000,
    craftBonus: 300,
  },
  {
    id: 'mat_cosmic_thread',
    name: 'Cosmic Thread',
    emoji: '🕸️',
    rarity: 'legendary',
    description: 'A thread of dark matter harvested from the edge of space. Lighter than air, stronger than diamond.',
    sourceChamber: 'branch_observatory',
    value: 6000,
    craftBonus: 350,
  },
  {
    id: 'mat_world_root_core',
    name: 'World Root Core',
    emoji: '🌍',
    rarity: 'legendary',
    description: 'The absolute core of Yggdrasil\'s root system. Contains the genetic code of all plant life.',
    sourceChamber: 'root_labyrinth',
    value: 5500,
    craftBonus: 320,
  },
  {
    id: 'mat_eternal_amber_golem',
    name: 'Eternal Amber Golem',
    emoji: '🏺',
    rarity: 'legendary',
    description: 'An entire sap golem compressed into a single amber gem. Still conscious and mobile.',
    sourceChamber: 'sap_reservoir',
    value: 7000,
    craftBonus: 400,
  },
  {
    id: 'mat_infinite_leaf_matrix',
    name: 'Infinite Leaf Matrix',
    emoji: '🍃',
    rarity: 'legendary',
    description: 'A self-replicating leaf pattern that grows exponentially. Contains infinite energy.',
    sourceChamber: 'leaf_canopy',
    value: 6500,
    craftBonus: 380,
  },
  {
    id: 'mat_prophet_eye_gem',
    name: 'Prophet Eye Gem',
    emoji: '🔮',
    rarity: 'legendary',
    description: 'A gem formed from the crystallized gaze of the All-Branch Prophet. Shows all possible futures.',
    sourceChamber: 'branch_observatory',
    value: 8000,
    craftBonus: 450,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: YX_STRUCTURES — 25 Structures (upgradeable to level 10)
// ═══════════════════════════════════════════════════════════════════

export const YX_STRUCTURES: readonly YxStructureDef[] = [
  // Core Structures (5)
  {
    id: 'str_sap_condenser',
    name: 'Sap Condenser',
    emoji: '🫗',
    description: 'A device that condenses raw sap into concentrated energy for powering structures.',
    maxLevel: 10,
    baseCost: 100,
    costMultiplier: 1.5,
    effectPerLevel: 5,
    requiredLevel: 1,
  },
  {
    id: 'str_root_network',
    name: 'Root Network Hub',
    emoji: '🕸️',
    description: 'A central hub that connects root pathways for faster travel between chambers.',
    maxLevel: 10,
    baseCost: 200,
    costMultiplier: 1.6,
    effectPerLevel: 8,
    requiredLevel: 5,
  },
  {
    id: 'str_leaf_greenhouse',
    name: 'Leaf Greenhouse',
    emoji: '🏡',
    description: 'A greenhouse that accelerates leaf growth and increases material yields.',
    maxLevel: 10,
    baseCost: 300,
    costMultiplier: 1.6,
    effectPerLevel: 10,
    requiredLevel: 10,
  },
  {
    id: 'str_bark_armory',
    name: 'Bark Armory',
    emoji: '⚔️',
    description: 'An armory where bark and wood are forged into weapons and armor for guardians.',
    maxLevel: 10,
    baseCost: 500,
    costMultiplier: 1.7,
    effectPerLevel: 12,
    requiredLevel: 15,
  },
  {
    id: 'str_nectar_distillery',
    name: 'Nectar Distillery',
    emoji: '⚗️',
    description: 'A distillery that processes raw nectar into potent potions and magical elixirs.',
    maxLevel: 10,
    baseCost: 800,
    costMultiplier: 1.7,
    effectPerLevel: 15,
    requiredLevel: 20,
  },

  // Production Structures (5)
  {
    id: 'str_sap_well',
    name: 'Sap Well',
    emoji: '🕳️',
    description: 'A deep well drilled into Yggdrasil\'s sap veins for passive sap generation.',
    maxLevel: 10,
    baseCost: 120,
    costMultiplier: 1.4,
    effectPerLevel: 3,
    requiredLevel: 1,
  },
  {
    id: 'str_seed_nursery',
    name: 'Seed Nursery',
    emoji: '🌱',
    description: 'A nursery where ancient seeds are germinated and nurtured into new growth.',
    maxLevel: 10,
    baseCost: 250,
    costMultiplier: 1.5,
    effectPerLevel: 6,
    requiredLevel: 8,
  },
  {
    id: 'str_amber_forge',
    name: 'Amber Forge',
    emoji: '🔨',
    description: 'A forge powered by crystallized sap that crafts amber into powerful artifacts.',
    maxLevel: 10,
    baseCost: 400,
    costMultiplier: 1.6,
    effectPerLevel: 9,
    requiredLevel: 12,
  },
  {
    id: 'str_pollen_mill',
    name: 'Pollen Mill',
    emoji: '🌬️',
    description: 'A mill that processes starlight pollen into concentrated magical powders.',
    maxLevel: 10,
    baseCost: 600,
    costMultiplier: 1.6,
    effectPerLevel: 11,
    requiredLevel: 18,
  },
  {
    id: 'str_resin_vats',
    name: 'Resin Vats',
    emoji: '🫙',
    description: 'Large vats where resin ferments into powerful magical compounds.',
    maxLevel: 10,
    baseCost: 700,
    costMultiplier: 1.7,
    effectPerLevel: 13,
    requiredLevel: 22,
  },

  // Defense Structures (5)
  {
    id: 'str_bark_wall',
    name: 'Bark Wall',
    emoji: '🧱',
    description: 'A defensive wall of reinforced bark that protects chambers from intruders.',
    maxLevel: 10,
    baseCost: 150,
    costMultiplier: 1.5,
    effectPerLevel: 7,
    requiredLevel: 3,
  },
  {
    id: 'str_thorn_barrier',
    name: 'Thorn Barrier',
    emoji: '🦔',
    description: 'A barrier of living thorns that damages any creature attempting to pass through.',
    maxLevel: 10,
    baseCost: 350,
    costMultiplier: 1.6,
    effectPerLevel: 10,
    requiredLevel: 10,
  },
  {
    id: 'str_root_snare_field',
    name: 'Root Snare Field',
    emoji: '🌿',
    description: 'A field of hidden roots that immobilize intruders and drain their energy.',
    maxLevel: 10,
    baseCost: 550,
    costMultiplier: 1.7,
    effectPerLevel: 12,
    requiredLevel: 16,
  },
  {
    id: 'str_sap_trap',
    name: 'Sap Trap',
    emoji: '🍯',
    description: 'A trap that sprays sticky sap, slowing and weakening enemies caught within.',
    maxLevel: 10,
    baseCost: 450,
    costMultiplier: 1.6,
    effectPerLevel: 9,
    requiredLevel: 14,
  },
  {
    id: 'str_canopy_net',
    name: 'Canopy Net',
    emoji: '🕸️',
    description: 'A net of interwoven vines suspended from the canopy that catches aerial intruders.',
    maxLevel: 10,
    baseCost: 650,
    costMultiplier: 1.7,
    effectPerLevel: 14,
    requiredLevel: 24,
  },

  // Utility Structures (5)
  {
    id: 'str_harmony_shrine',
    name: 'Harmony Shrine',
    emoji: '⛩️',
    description: 'A sacred shrine that amplifies harmony within the tree, boosting all bonuses.',
    maxLevel: 10,
    baseCost: 1000,
    costMultiplier: 1.8,
    effectPerLevel: 20,
    requiredLevel: 25,
  },
  {
    id: 'str_xylem_pump',
    name: 'Xylem Pump',
    emoji: '⬆️',
    description: 'A pump that accelerates the flow of xylem sap, increasing all resource generation.',
    maxLevel: 10,
    baseCost: 900,
    costMultiplier: 1.7,
    effectPerLevel: 16,
    requiredLevel: 20,
  },
  {
    id: 'str_memory_bark',
    name: 'Memory Bark',
    emoji: '📝',
    description: 'Living bark inscribed with Yggdrasil\'s memories that grants wisdom bonuses.',
    maxLevel: 10,
    baseCost: 1200,
    costMultiplier: 1.8,
    effectPerLevel: 18,
    requiredLevel: 30,
  },
  {
    id: 'str_starlight_lens',
    name: 'Starlight Lens',
    emoji: '🔍',
    description: 'A lens made from crystallized starlight that reveals hidden resources and creatures.',
    maxLevel: 10,
    baseCost: 1500,
    costMultiplier: 1.9,
    effectPerLevel: 22,
    requiredLevel: 35,
  },
  {
    id: 'str_world_heart_beacon',
    name: 'World Heart Beacon',
    emoji: '📡',
    description: 'The ultimate structure — a beacon that channels the Heartwood Core\'s full power.',
    maxLevel: 10,
    baseCost: 5000,
    costMultiplier: 2.0,
    effectPerLevel: 50,
    requiredLevel: 45,
  },

  // Special Structures (5)
  {
    id: 'str_dream_weaver',
    name: 'Dream Weaver Loom',
    emoji: '🧶',
    description: 'A loom that weaves threads of Yggdrasil\'s dream into tangible magical fabric.',
    maxLevel: 10,
    baseCost: 800,
    costMultiplier: 1.7,
    effectPerLevel: 14,
    requiredLevel: 15,
  },
  {
    id: 'str_time_ring',
    name: 'Time Ring',
    emoji: '⏳',
    description: 'A ring of ancient wood that can temporarily slow or accelerate time within a chamber.',
    maxLevel: 10,
    baseCost: 2000,
    costMultiplier: 1.9,
    effectPerLevel: 25,
    requiredLevel: 38,
  },
  {
    id: 'str_soul_garden',
    name: 'Soul Garden',
    emoji: '🌺',
    description: 'A garden where the souls of departed creatures bloom into spectral flowers.',
    maxLevel: 10,
    baseCost: 1800,
    costMultiplier: 1.8,
    effectPerLevel: 20,
    requiredLevel: 32,
  },
  {
    id: 'str_cosmic_antenna',
    name: 'Cosmic Antenna',
    emoji: '📡',
    description: 'An antenna extending beyond the atmosphere that receives signals from distant worlds.',
    maxLevel: 10,
    baseCost: 3000,
    costMultiplier: 2.0,
    effectPerLevel: 35,
    requiredLevel: 42,
  },
  {
    id: 'str_unity_pillar',
    name: 'Unity Pillar',
    emoji: '🏛️',
    description: 'A pillar of unified wood from all Yggdrasil\'s species that radiates total harmony.',
    maxLevel: 10,
    baseCost: 8000,
    costMultiplier: 2.0,
    effectPerLevel: 60,
    requiredLevel: 48,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: YX_ABILITIES — 22 Abilities
// ═══════════════════════════════════════════════════════════════════

export const YX_ABILITIES: readonly YxAbilityDef[] = [
  // Absorb Abilities (3)
  {
    id: 'ab_sap_absorb',
    name: 'Sap Absorb',
    emoji: '🍯',
    description: 'Absorb raw energy from Yggdrasil\'s sap flow, converting it to XP and harmony.',
    action: 'absorb',
    rarity: 'common',
    cooldown: 30,
    power: 15,
    cost: 10,
    requiredLevel: 1,
  },
  {
    id: 'ab_sunlight_absorb',
    name: 'Sunlight Absorb',
    emoji: '☀️',
    description: 'Channel sunlight through the canopy to absorb solar energy for healing.',
    action: 'absorb',
    rarity: 'uncommon',
    cooldown: 60,
    power: 35,
    cost: 25,
    requiredLevel: 8,
  },
  {
    id: 'ab_cosmic_absorb',
    name: 'Cosmic Absorb',
    emoji: '🌌',
    description: 'Open a conduit to the cosmos and absorb starlight energy directly.',
    action: 'absorb',
    rarity: 'epic',
    cooldown: 120,
    power: 80,
    cost: 60,
    requiredLevel: 30,
  },

  // Grow Abilities (3)
  {
    id: 'ab_branch_sprout',
    name: 'Branch Sprout',
    emoji: '🌿',
    description: 'Cause a new branch to sprout in a chamber, generating resources over time.',
    action: 'grow',
    rarity: 'common',
    cooldown: 45,
    power: 20,
    cost: 15,
    requiredLevel: 1,
  },
  {
    id: 'ab_rapid_growth',
    name: 'Rapid Growth',
    emoji: '🌱',
    description: 'Accelerate the growth of all structures in the active chamber.',
    action: 'grow',
    rarity: 'rare',
    cooldown: 90,
    power: 55,
    cost: 40,
    requiredLevel: 15,
  },
  {
    id: 'ab_world_bloom',
    name: 'World Bloom',
    emoji: '🌸',
    description: 'Trigger a massive bloom across all chambers, boosting all yields for a duration.',
    action: 'grow',
    rarity: 'legendary',
    cooldown: 300,
    power: 200,
    cost: 150,
    requiredLevel: 45,
  },

  // Forge Abilities (3)
  {
    id: 'ab_bark_mold',
    name: 'Bark Mold',
    emoji: '🪵',
    description: 'Shape living bark into defensive barriers around a chosen chamber.',
    action: 'forge',
    rarity: 'common',
    cooldown: 30,
    power: 12,
    cost: 10,
    requiredLevel: 1,
  },
  {
    id: 'ab_amber_weapon',
    name: 'Amber Weapon Forge',
    emoji: '⚔️',
    description: 'Forge a weapon of crystallized amber that glows with stored sunlight.',
    action: 'forge',
    rarity: 'rare',
    cooldown: 75,
    power: 50,
    cost: 35,
    requiredLevel: 18,
  },
  {
    id: 'ab_heartwood_shield',
    name: 'Heartwood Shield',
    emoji: '🛡️',
    description: 'Forge an indestructible shield from the Heartwood Core\'s living wood.',
    action: 'forge',
    rarity: 'epic',
    cooldown: 150,
    power: 90,
    cost: 70,
    requiredLevel: 35,
  },

  // Channel Abilities (3)
  {
    id: 'ab_sap_channel',
    name: 'Sap Channel',
    emoji: '💧',
    description: 'Channel sap through the xylem network to heal all creatures in a chamber.',
    action: 'channel',
    rarity: 'common',
    cooldown: 25,
    power: 10,
    cost: 8,
    requiredLevel: 1,
  },
  {
    id: 'ab_root_channel',
    name: 'Root Channel',
    emoji: '🌍',
    description: 'Channel energy through the root network to empower all root walkers.',
    action: 'channel',
    rarity: 'uncommon',
    cooldown: 50,
    power: 40,
    cost: 30,
    requiredLevel: 10,
  },
  {
    id: 'ab_nectar_channel',
    name: 'Nectar Channel',
    emoji: '🍯',
    description: 'Channel divine nectar through the tree to grant temporary invulnerability.',
    action: 'channel',
    rarity: 'legendary',
    cooldown: 240,
    power: 180,
    cost: 120,
    requiredLevel: 42,
  },

  // Bloom Abilities (3)
  {
    id: 'ab_leaf_shield',
    name: 'Leaf Shield',
    emoji: '🍃',
    description: 'Summon a whirlwind of leaves that deflects projectiles and obscures vision.',
    action: 'bloom',
    rarity: 'common',
    cooldown: 20,
    power: 8,
    cost: 5,
    requiredLevel: 1,
  },
  {
    id: 'ab_petal_storm',
    name: 'Petal Storm',
    emoji: '🌺',
    description: 'Unleash a storm of razor-sharp petals that damage all enemies in range.',
    action: 'bloom',
    rarity: 'rare',
    cooldown: 60,
    power: 60,
    cost: 45,
    requiredLevel: 20,
  },
  {
    id: 'ab_eternal_spring',
    name: 'Eternal Spring',
    emoji: '🌸',
    description: 'Trigger an eternal spring that causes all flowers to bloom simultaneously.',
    action: 'bloom',
    rarity: 'epic',
    cooldown: 180,
    power: 100,
    cost: 80,
    requiredLevel: 38,
  },

  // Root Abilities (3)
  {
    id: 'ab_root_grasp',
    name: 'Root Grasp',
    emoji: '✊',
    description: 'Command roots to burst from the ground and grasp enemies, immobilizing them.',
    action: 'root',
    rarity: 'common',
    cooldown: 25,
    power: 14,
    cost: 8,
    requiredLevel: 1,
  },
  {
    id: 'ab_earthquake_root',
    name: 'Earthquake Root',
    emoji: '🌋',
    description: 'Send shockwaves through the root network, causing localized earthquakes.',
    action: 'root',
    rarity: 'uncommon',
    cooldown: 55,
    power: 45,
    cost: 30,
    requiredLevel: 12,
  },
  {
    id: 'ab_world_entangle',
    name: 'World Entangle',
    emoji: '🌍',
    description: 'Entangle the entire world in Yggdrasil\'s roots, connecting all life briefly.',
    action: 'root',
    rarity: 'legendary',
    cooldown: 360,
    power: 250,
    cost: 200,
    requiredLevel: 48,
  },

  // Ascend Abilities (4)
  {
    id: 'ab_sap_ascend',
    name: 'Sap Ascend',
    emoji: '⬆️',
    description: 'Ascend through the xylem vessels, gaining a burst of XP and sap.',
    action: 'ascend',
    rarity: 'uncommon',
    cooldown: 40,
    power: 30,
    cost: 20,
    requiredLevel: 5,
  },
  {
    id: 'ab_branch_ascend',
    name: 'Branch Ascend',
    emoji: '🌳',
    description: 'Ascend to the highest branches, revealing hidden areas and gaining insight.',
    action: 'ascend',
    rarity: 'rare',
    cooldown: 80,
    power: 65,
    cost: 50,
    requiredLevel: 22,
  },
  {
    id: 'ab_canopy_ascend',
    name: 'Canopy Ascend',
    emoji: '☁️',
    description: 'Ascend above the canopy into the sky, gaining cosmic awareness.',
    action: 'ascend',
    rarity: 'epic',
    cooldown: 160,
    power: 120,
    cost: 90,
    requiredLevel: 40,
  },
  {
    id: 'ab_cosmic_ascend',
    name: 'Cosmic Ascend',
    emoji: '🌟',
    description: 'Ascend beyond the atmosphere into the cosmos, becoming one with the stars.',
    action: 'ascend',
    rarity: 'legendary',
    cooldown: 600,
    power: 300,
    cost: 250,
    requiredLevel: 50,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: YX_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const YX_ACHIEVEMENTS: readonly YxAchievementDef[] = [
  {
    id: 'ach_first_absorb',
    name: 'First Absorption',
    emoji: '💧',
    description: 'Absorb your first drop of energy from Yggdrasil\'s xylem network.',
    conditionKey: 'totalAbsorbed',
    targetValue: 1,
    rewardCoins: 50,
    rewardXp: 25,
  },
  {
    id: 'ach_energy_weaver',
    name: 'Energy Weaver',
    emoji: '⚡',
    description: 'Absorb 100 units of energy from the xylem network.',
    conditionKey: 'totalAbsorbed',
    targetValue: 100,
    rewardCoins: 300,
    rewardXp: 150,
  },
  {
    id: 'ach_cosmic_conduit',
    name: 'Cosmic Conduit',
    emoji: '🌌',
    description: 'Absorb 1000 units of energy, becoming a true conduit of the World Tree.',
    conditionKey: 'totalAbsorbed',
    targetValue: 1000,
    rewardCoins: 2000,
    rewardXp: 1000,
  },
  {
    id: 'ach_first_growth',
    name: 'First Growth',
    emoji: '🌱',
    description: 'Cause your first branch to grow within Yggdrasil.',
    conditionKey: 'totalGrown',
    targetValue: 1,
    rewardCoins: 50,
    rewardXp: 25,
  },
  {
    id: 'ach_garden_master',
    name: 'Garden Master',
    emoji: '🌳',
    description: 'Grow 50 branches, expanding Yggdrasil\'s reach significantly.',
    conditionKey: 'totalGrown',
    targetValue: 50,
    rewardCoins: 500,
    rewardXp: 250,
  },
  {
    id: 'ach_first_forge',
    name: 'First Forge',
    emoji: '🔨',
    description: 'Forge your first xylem node within the tree.',
    conditionKey: 'totalForged',
    targetValue: 1,
    rewardCoins: 60,
    rewardXp: 30,
  },
  {
    id: 'ach_node_architect',
    name: 'Node Architect',
    emoji: '🏗️',
    description: 'Forge 30 xylem nodes, creating a vast network within the tree.',
    conditionKey: 'totalForged',
    targetValue: 30,
    rewardCoins: 800,
    rewardXp: 400,
  },
  {
    id: 'ach_sap_channeler',
    name: 'Sap Channeler',
    emoji: '🍯',
    description: 'Channel sap 50 times through the xylem network.',
    conditionKey: 'totalChanneled',
    targetValue: 50,
    rewardCoins: 400,
    rewardXp: 200,
  },
  {
    id: 'ach_bloom_artist',
    name: 'Bloom Artist',
    emoji: '🌸',
    description: 'Trigger 25 bloom events across Yggdrasil\'s chambers.',
    conditionKey: 'totalBloomed',
    targetValue: 25,
    rewardCoins: 600,
    rewardXp: 300,
  },
  {
    id: 'ach_root_master',
    name: 'Root Master',
    emoji: '🌍',
    description: 'Root yourself in 40 chambers, establishing deep connections.',
    conditionKey: 'totalRooted',
    targetValue: 40,
    rewardCoins: 700,
    rewardXp: 350,
  },
  {
    id: 'ach_first_ascension',
    name: 'First Ascension',
    emoji: '⬆️',
    description: 'Perform your first ascension through Yggdrasil\'s vascular system.',
    conditionKey: 'totalAscended',
    targetValue: 1,
    rewardCoins: 100,
    rewardXp: 50,
  },
  {
    id: 'ach_ascending_sage',
    name: 'Ascending Sage',
    emoji: '🧙',
    description: 'Ascend 20 times, mastering the pathways between worlds.',
    conditionKey: 'totalAscended',
    targetValue: 20,
    rewardCoins: 1500,
    rewardXp: 750,
  },
  {
    id: 'ach_creature_friend',
    name: 'Creature Friend',
    emoji: '🐾',
    description: 'Discover and befriend 10 xylem creatures within the tree.',
    conditionKey: 'totalCreaturesFound',
    targetValue: 10,
    rewardCoins: 200,
    rewardXp: 100,
  },
  {
    id: 'ach_creature_lord',
    name: 'Creature Lord',
    emoji: '👑',
    description: 'Discover all 35 xylem creatures, becoming lord of all species.',
    conditionKey: 'totalCreaturesFound',
    targetValue: 35,
    rewardCoins: 5000,
    rewardXp: 2500,
  },
  {
    id: 'ach_material_hoarder',
    name: 'Material Hoarder',
    emoji: '📦',
    description: 'Gather 200 materials from Yggdrasil\'s chambers.',
    conditionKey: 'totalMaterialsGathered',
    targetValue: 200,
    rewardCoins: 400,
    rewardXp: 200,
  },
  {
    id: 'ach_architect_supreme',
    name: 'Architect Supreme',
    emoji: '🏛️',
    description: 'Build 15 structures within Yggdrasil, shaping its interior.',
    conditionKey: 'totalStructuresBuilt',
    targetValue: 15,
    rewardCoins: 1000,
    rewardXp: 500,
  },
  {
    id: 'ach_ability_master',
    name: 'Ability Master',
    emoji: '✨',
    description: 'Cast abilities 100 times, mastering the xylem arts.',
    conditionKey: 'totalAbilitiesCast',
    targetValue: 100,
    rewardCoins: 800,
    rewardXp: 400,
  },
  {
    id: 'ach_event_veteran',
    name: 'Event Veteran',
    emoji: '🎉',
    description: 'Complete 10 cosmic events, proving your resilience.',
    conditionKey: 'totalEventsCompleted',
    targetValue: 10,
    rewardCoins: 600,
    rewardXp: 300,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: YX_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const YX_TITLES: readonly YxTitleDef[] = [
  {
    id: 'title_seedling_tender',
    name: 'Seedling Tender',
    emoji: '🌱',
    requiredLevel: 1,
    description: 'One who cares for the youngest sprouts of Yggdrasil, nurturing new life with patience.',
  },
  {
    id: 'title_sap_collector',
    name: 'Sap Collector',
    emoji: '🍯',
    requiredLevel: 5,
    description: 'A gatherer of Yggdrasil\'s golden sap, learning the tree\'s rhythms and flow.',
  },
  {
    id: 'title_root_seeker',
    name: 'Root Seeker',
    emoji: '🌍',
    requiredLevel: 12,
    description: 'One who delves into the underground mysteries of Yggdrasil\'s root network.',
  },
  {
    id: 'title_bark_guardian',
    name: 'Bark Guardian',
    emoji: '🛡️',
    requiredLevel: 20,
    description: 'A steadfast defender of Yggdrasil\'s outer bark, standing watch against all threats.',
  },
  {
    id: 'title_leaf_weaver',
    name: 'Leaf Weaver',
    emoji: '🍃',
    requiredLevel: 28,
    description: 'An artist who weaves patterns of living leaves into spells of breathtaking beauty.',
  },
  {
    id: 'title_branch_elder',
    name: 'Branch Elder',
    emoji: '🌿',
    requiredLevel: 36,
    description: 'A wise elder who sits among the highest branches, counseling the tree and its children.',
  },
  {
    id: 'title_tree_warden',
    name: 'Tree Warden',
    emoji: '🌳',
    requiredLevel: 44,
    description: 'The supreme warden of Yggdrasil, responsible for the tree\'s health and defense.',
  },
  {
    id: 'title_yggdrasil_deity',
    name: 'Yggdrasil Deity',
    emoji: '👑',
    requiredLevel: 50,
    description:
      'The ultimate title — one who has merged with Yggdrasil\'s consciousness, becoming a god of the World Tree.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: YX_ARTIFACTS — 15 Legendary Artifacts
// ═══════════════════════════════════════════════════════════════════

export const YX_ARTIFACTS: readonly YxArtifactDef[] = [
  {
    id: 'art_heartwood_amulet',
    name: 'Heartwood Amulet',
    emoji: '📿',
    rarity: 'rare',
    description: 'An amulet carved from the Heartwood Core that pulses with the tree\'s heartbeat.',
    lore: 'Crafted from a chip of the Heartwood Core itself, this amulet synchronizes the wearer\'s heartbeat with Yggdrasil\'s. In battle, the wearer becomes an extension of the tree, gaining its resilience and awareness.',
    powerBonus: 30,
    defenseBonus: 25,
    specialEffect: 'Grants regeneration of 5 HP per turn',
  },
  {
    id: 'art_root_crown',
    name: 'Root Crown',
    emoji: '👑',
    rarity: 'epic',
    description: 'A crown of living roots that connects the wearer\'s mind to Yggdrasil\'s consciousness.',
    lore: 'The Root Crown was grown from the World Tree\'s deepest root over the course of a thousand years. When worn, it creates a neural link between the wearer and the tree, allowing them to sense everything the tree senses.',
    powerBonus: 50,
    defenseBonus: 40,
    specialEffect: 'Reveals all hidden chambers and resources',
  },
  {
    id: 'art_amber_scepter',
    name: 'Amber Scepter',
    emoji: '🌟',
    rarity: 'rare',
    description: 'A scepter of pure amber that channels concentrated sunlight into devastating beams.',
    lore: 'The Amber Scepter was formed when a bolt of lightning struck the Sap Reservoir, instantly crystallizing a thousand gallons of sap into a single perfect crystal. It stores sunlight during the day and releases it as focused beams at will.',
    powerBonus: 45,
    defenseBonus: 10,
    specialEffect: '+30% power during daytime',
  },
  {
    id: 'art_leaf_cloak',
    name: 'Leaf Cloak',
    emoji: '🧥',
    rarity: 'uncommon',
    description: 'A cloak woven from Yggdrasil\'s eternal leaves that renders the wearer invisible.',
    lore: 'The Leaf Cloak is made from leaves that never wilt, woven together by Nectar Fairies over decades. When worn, the wearer becomes one with the foliage, invisible to all but the most perceptive observers.',
    powerBonus: 10,
    defenseBonus: 20,
    specialEffect: 'Grants invisibility for 10 seconds per use',
  },
  {
    id: 'art_bark_gauntlets',
    name: 'Bark Gauntlets',
    emoji: '🥊',
    rarity: 'uncommon',
    description: 'Gauntlets made from ironbark that amplify the wearer\'s strength tenfold.',
    lore: 'Forged from bark harvested during a lightning storm, the Bark Gauntlets are harder than steel and lighter than leather. They channel the wearer\'s strength through the living wood, multiplying every punch into a thunderbolt.',
    powerBonus: 35,
    defenseBonus: 15,
    specialEffect: '+50% melee damage',
  },
  {
    id: 'art_nectar_flask',
    name: 'Nectar Flask',
    emoji: '🍶',
    rarity: 'rare',
    description: 'A flask that never empties, always filled with healing nectar from the World Tree.',
    lore: 'The Nectar Flask was a gift from the first Ambrosia Fairy to a mortal who saved her life. The flask produces an endless supply of healing nectar that can cure any wound, poison, or curse. It is said that a single sip can extend life by a decade.',
    powerBonus: 5,
    defenseBonus: 35,
    specialEffect: 'Full heal once per battle',
  },
  {
    id: 'art_branch_bow',
    name: 'Branch Bow',
    emoji: '🏹',
    rarity: 'epic',
    description: 'A bow grown from a single living branch that fires arrows of concentrated starlight.',
    lore: 'The Branch Bow was trained over centuries by a Leaf Dancer who wanted to reach the stars. The bow is still alive, and its arrows are formed from concentrated starlight drawn from the Canopy Cathedral. Each arrow carries the light of a hundred suns.',
    powerBonus: 70,
    defenseBonus: 5,
    specialEffect: 'Arrows track targets and never miss',
  },
  {
    id: 'art_sap_ring',
    name: 'Sap Ring',
    emoji: '💍',
    rarity: 'uncommon',
    description: 'A ring of hardened sap that glows warm and grants minor healing aura.',
    lore: 'The Sap Ring is the simplest of Yggdrasil\'s artifacts, yet one of the most beloved. It was the first artifact ever created, formed by accident when a drip of sap landed on a wanderer\'s finger and crystallized. The warmth it radiates has comforted countless souls.',
    powerBonus: 8,
    defenseBonus: 12,
    specialEffect: 'Heals nearby allies for 2 HP per turn',
  },
  {
    id: 'art_world_heart_shard',
    name: 'World Heart Shard',
    emoji: '💠',
    rarity: 'legendary',
    description: 'A fragment of the World Heart itself, radiating pure creation energy.',
    lore: 'When the World Tree first dreamed, a single drop of its dream crystallized into physical form. That drop is the World Heart Shard. It radiates energy that can create matter from nothing, heal any wound, and even resurrect the dead. It is the most powerful artifact in Yggdrasil.',
    powerBonus: 100,
    defenseBonus: 80,
    specialEffect: 'All abilities cost 50% less energy',
  },
  {
    id: 'art_cosmic_seed_pod',
    name: 'Cosmic Seed Pod',
    emoji: '🌱',
    rarity: 'epic',
    description: 'A seed pod from beyond the atmosphere that contains the blueprint for alien forests.',
    lore: 'The Cosmic Seed Pod drifted through interstellar space for a billion years before landing on Yggdrasil\'s highest branch. It contains the genetic code for forests that grow on worlds with three suns and purple skies. Planting its seeds creates portals to those alien worlds.',
    powerBonus: 55,
    defenseBonus: 45,
    specialEffect: 'Has a 5% chance to spawn rare materials',
  },
  {
    id: 'art_primordial_root_whip',
    name: 'Primordial Root Whip',
    emoji: '🔄',
    rarity: 'legendary',
    description: 'A whip made from the first root that ever grew, capable of cracking dimensions.',
    lore: 'The Primordial Root Whip is the oldest weapon in existence. It was the first root of the first plant on Earth, preserved and strengthened by eons of exposure to Yggdrasil\'s power. When cracked, it doesn\'t just break the air — it breaks the fabric of reality between the crack points.',
    powerBonus: 120,
    defenseBonus: 30,
    specialEffect: 'Attacks can hit multiple targets across chambers',
  },
  {
    id: 'art_ambrosia_crown',
    name: 'Ambrosia Crown',
    emoji: '👑',
    rarity: 'legendary',
    description: 'The crown of the Ambrosia Queen, granting true immortality to its wearer.',
    lore: 'The Ambrosia Crown was forged from the crystallized dreams of every flower that has ever bloomed on Yggdrasil. Its wearer gains true immortality — not just agelessness, but immunity to death itself. No weapon can harm them, no poison can sicken them, and no force can destroy them.',
    powerBonus: 80,
    defenseBonus: 150,
    specialEffect: 'Complete immunity to all damage types',
  },
  {
    id: 'art_infinite_leaf_blade',
    name: 'Infinite Leaf Blade',
    emoji: '🗡️',
    rarity: 'legendary',
    description: 'A sword made from self-replicating leaves that never dull and never break.',
    lore: 'The Infinite Leaf Blade is a paradox — a weapon that is simultaneously as soft as a leaf and as hard as diamond. Its edge is a single molecule thick, and it can cut through any material known or unknown. The leaves that compose it constantly regenerate, making it truly indestructible.',
    powerBonus: 150,
    defenseBonus: 50,
    specialEffect: 'Ignores all enemy defense stats',
  },
  {
    id: 'art_prophet_orb',
    name: 'Prophet Orb',
    emoji: '🔮',
    rarity: 'legendary',
    description: 'The All-Branch Prophet\'s personal orb, showing all possible futures at once.',
    lore: 'The Prophet Orb contains the compressed knowledge of every timeline that has ever existed or will exist. Gazing into it grants perfect foresight, but at a terrible cost — the viewer sees not just what will happen, but every tragedy that could have been prevented.',
    powerBonus: 60,
    defenseBonus: 60,
    specialEffect: 'Predicts enemy moves 3 turns in advance',
  },
  {
    id: 'art_awakening_key',
    name: 'Awakening Key',
    emoji: '🗝️',
    rarity: 'legendary',
    description: 'The key that will unlock Yggdrasil\'s full awakening when the stars align.',
    lore: 'The Awakening Key was created at the same moment as Yggdrasil itself, forged from the first light of creation. It has been hidden within the Heartwood Core, waiting for the one creature worthy of using it. When the stars align and the key is turned, Yggdrasil will fully awaken, and reality will be reborn.',
    powerBonus: 200,
    defenseBonus: 200,
    specialEffect: 'Unlocks the final chamber and triggers World Awakening event',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: YX_EVENTS — 12 Events
// ═══════════════════════════════════════════════════════════════════

export const YX_EVENTS: readonly YxEventDef[] = [
  {
    id: 'evt_sap_surge',
    name: 'Sap Surge',
    emoji: '🌊',
    description: 'A surge of xylem sap floods through Yggdrasil, supercharging all chambers.',
    duration: 300,
    effectType: 'buff',
    effectDescription: '+50% sap generation and +20% XP from all actions',
    requiredLevel: 1,
  },
  {
    id: 'evt_root_quake',
    name: 'Root Quake',
    emoji: '🌋',
    description: 'Deep roots shift beneath the earth, revealing hidden passages and materials.',
    duration: 240,
    effectType: 'special',
    effectDescription: 'Random chambers reveal hidden resources and rare creatures',
    requiredLevel: 5,
  },
  {
    id: 'evt_leaf_blizzard',
    name: 'Leaf Blizzard',
    emoji: '🍃',
    description: 'An unprecedented leaf fall blankets every chamber, obscuring vision but providing cover.',
    duration: 180,
    effectType: 'debuff',
    effectDescription: '-25% visibility but +40% defense for all creatures',
    requiredLevel: 10,
  },
  {
    id: 'evt_bloom_festival',
    name: 'Bloom Festival',
    emoji: '🌸',
    description: 'Every flower on Yggdrasil blooms simultaneously in a spectacular display of color.',
    duration: 360,
    effectType: 'buff',
    effectDescription: '+60% nectar yield and +30% creature power',
    requiredLevel: 15,
  },
  {
    id: 'evt_bark_decay',
    name: 'Bark Decay',
    emoji: '🍂',
    description: 'A mysterious decay afflicts Yggdrasil\'s outer bark, testing the tree\'s resilience.',
    duration: 200,
    effectType: 'debuff',
    effectDescription: '-20% defense but +50% material yield from harvesting bark',
    requiredLevel: 20,
  },
  {
    id: 'evt_star_shower',
    name: 'Star Shower',
    emoji: '⭐',
    description: 'A meteor shower of starlight pollen rains down on Yggdrasil from the cosmos.',
    duration: 250,
    effectType: 'buff',
    effectDescription: '+70% starlight pollen yield and chance of finding cosmic materials',
    requiredLevel: 25,
  },
  {
    id: 'evt_nectar_rain',
    name: 'Nectar Rain',
    emoji: '🍯',
    description: 'Golden nectar falls from Yggdrasil\'s flowers like rain, enriching everything it touches.',
    duration: 280,
    effectType: 'buff',
    effectDescription: '+80% nectar yield and +25% healing for all creatures',
    requiredLevel: 30,
  },
  {
    id: 'evt_root_tangle',
    name: 'Root Tangle',
    emoji: '🌿',
    description: 'Roots grow wildly in all directions, creating new connections and blocking old ones.',
    duration: 200,
    effectType: 'special',
    effectDescription: 'Chambers may randomly connect or disconnect, revealing secrets',
    requiredLevel: 33,
  },
  {
    id: 'evt_amber_fever',
    name: 'Amber Fever',
    emoji: '🔶',
    description: 'The sap in the reservoir heats up, accelerating amber crystallization dramatically.',
    duration: 180,
    effectType: 'buff',
    effectDescription: '+100% amber resin yield and forging speed doubled',
    requiredLevel: 36,
  },
  {
    id: 'evt_shadow_blight',
    name: 'Shadow Blight',
    emoji: '🌑',
    description: 'A shadow creeps through Yggdrasil, draining harmony and weakening creatures.',
    duration: 150,
    effectType: 'debuff',
    effectDescription: '-30% harmony regeneration and -15% creature power',
    requiredLevel: 40,
  },
  {
    id: 'evt_cosmic_alignment',
    name: 'Cosmic Alignment',
    emoji: '🌌',
    description: 'Stars align in a rare formation, amplifying Yggdrasil\'s connection to the cosmos.',
    duration: 400,
    effectType: 'special',
    effectDescription: 'All legendary creature encounters doubled and cosmic materials available',
    requiredLevel: 45,
  },
  {
    id: 'evt_world_awakening',
    name: 'World Awakening',
    emoji: '👁️',
    description: 'Yggdrasil stirs in its ancient dream, and the tree begins to truly wake.',
    duration: 500,
    effectType: 'special',
    effectDescription: 'All bonuses doubled, new chambers revealed, and the Heartwood Core empowers all structures',
    requiredLevel: 50,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function yxXpRequired(level: number): number {
  if (level <= 0) return 0
  if (level >= YX_MAX_LEVEL) return Infinity
  return Math.floor(100 * level * (1 + level * 0.12))
}

function yxClampLevel(lvl: number): number {
  return Math.max(1, Math.min(YX_MAX_LEVEL, lvl))
}

function yxClampSap(c: number): number {
  return Math.max(0, Math.floor(c))
}

function yxRarityMultiplier(r: YxRarity): number {
  const map: Record<YxRarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2.2,
    epic: 3.5,
    legendary: 6,
  }
  return map[r] ?? 1
}

function yxRarityColor(r: YxRarity): string {
  switch (r) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#34D399'
    case 'rare': return '#60A5FA'
    case 'epic': return '#A78BFA'
    case 'legendary': return '#FBBF24'
  }
}

function yxSpeciesColor(s: YxSpecies): string {
  const species = YX_SPECIES.find((sp) => sp.id === s)
  return species?.color ?? YX_WORLD_GREEN
}

function yxActionToTotalsKey(action: YxAction): keyof YxTotals {
  const map: Record<YxAction, keyof YxTotals> = {
    absorb: 'totalAbsorbed',
    grow: 'totalGrown',
    forge: 'totalForged',
    channel: 'totalChanneled',
    bloom: 'totalBloomed',
    root: 'totalRooted',
    ascend: 'totalAscended',
  }
  return map[action]
}

function yxCreateResourceState(): YxResourceState {
  return {
    xylem_sap: 0,
    heartwood_bark: 0,
    golden_leaves: 0,
    root_threads: 0,
    amber_resin: 0,
    starlight_pollen: 0,
    ancient_seeds: 0,
    living_wood: 0,
    crystallized_nectar: 0,
    worldbark_fragments: 0,
    cosmic_sap: 0,
    primordial_amber: 0,
  }
}

function yxCreateCreatureStateMap(): Record<string, YxCreatureState> {
  const map: Record<string, YxCreatureState> = {}
  for (const c of YX_CREATURES) {
    map[c.id] = { owned: false, count: 0, level: 1, xp: 0, acquiredAt: null }
  }
  return map
}

function yxCreateChamberStateMap(): Record<string, YxChamberState> {
  const map: Record<string, YxChamberState> = {}
  for (const ch of YX_CHAMBERS) {
    map[ch.id] = { explored: false, level: 1, gatherCount: 0, creaturesFound: 0, unlockedAt: null }
  }
  return map
}

function yxCreateStructureStateMap(): Record<string, YxStructureState> {
  const map: Record<string, YxStructureState> = {}
  for (const s of YX_STRUCTURES) {
    map[s.id] = { level: 0, builtAt: null }
  }
  return map
}

function yxCreateAbilityStateMap(): Record<string, YxAbilityState> {
  const map: Record<string, YxAbilityState> = {}
  for (const a of YX_ABILITIES) {
    map[a.id] = { learned: false, castCount: 0, cooldownEnd: 0 }
  }
  return map
}

function yxCreateArtifactStateMap(): Record<string, YxArtifactState> {
  const map: Record<string, YxArtifactState> = {}
  for (const ar of YX_ARTIFACTS) {
    map[ar.id] = { collected: false, collectedAt: null }
  }
  return map
}

function yxCreateAchievementStateMap(): Record<string, YxAchievementState> {
  const map: Record<string, YxAchievementState> = {}
  for (const ach of YX_ACHIEVEMENTS) {
    map[ach.id] = { unlocked: false, unlockedAt: null }
  }
  return map
}

function yxCreateInitialState(): YggdrasilXylemState {
  return {
    yxLevel: 1,
    yxXp: 0,
    yxSap: 500,
    yxHarmony: 50,
    yxXylemNodes: 0,
    yxResources: yxCreateResourceState(),
    creatures: yxCreateCreatureStateMap(),
    chambers: yxCreateChamberStateMap(),
    structures: yxCreateStructureStateMap(),
    abilities: yxCreateAbilityStateMap(),
    artifacts: yxCreateArtifactStateMap(),
    achievements: yxCreateAchievementStateMap(),
    eventState: { activeEventId: null, eventEnd: 0, eventsCompleted: 0 },
    totals: {
      totalAbsorbed: 0,
      totalGrown: 0,
      totalForged: 0,
      totalChanneled: 0,
      totalBloomed: 0,
      totalRooted: 0,
      totalAscended: 0,
      totalCreaturesFound: 0,
      totalMaterialsGathered: 0,
      totalStructuresBuilt: 0,
      totalAbilitiesCast: 0,
      totalEventsCompleted: 0,
    },
    yxSeed: Date.now(),
    yxActiveChamber: null,
    yxCurrentTitle: 'title_seedling_tender',
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: ZUSTAND STORE WITH PERSIST MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════

const useYxStore = create<YggdrasilXylemStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      ...yxCreateInitialState(),

      // ── yxAbsorbEnergy ────────────────────────────────────────
      yxAbsorbEnergy: (amount: number): number => {
        const state = get()
        const harmonyGain = Math.floor(amount * 0.5)
        const nodeChance = amount >= 50 ? 1 : 0
        set((prev) => {
          const newNodes = prev.yxXylemNodes + nodeChance
          return {
            yxXp: prev.yxXp + amount,
            yxSap: yxClampSap(prev.yxSap + Math.floor(amount * 0.3)),
            yxHarmony: Math.min(100, prev.yxHarmony + harmonyGain),
            yxXylemNodes: newNodes,
            totals: {
              ...prev.totals,
              totalAbsorbed: prev.totals.totalAbsorbed + amount,
            },
          }
        })
        return harmonyGain
      },

      // ── yxGrowBranch ──────────────────────────────────────────
      yxGrowBranch: (chamberId: string): boolean => {
        const state = get()
        const chamber = YX_CHAMBERS.find((c) => c.id === chamberId)
        if (!chamber) return false
        if (!state.chambers[chamberId]?.explored) return false
        if (state.yxLevel < chamber.unlockLevel) return false
        if (state.yxSap < 20) return false

        set((prev) => ({
          yxSap: yxClampSap(prev.yxSap - 20),
          yxXp: prev.yxXp + chamber.level * 10,
          yxHarmony: Math.min(100, prev.yxHarmony + 5),
          chambers: {
            ...prev.chambers,
            [chamberId]: {
              ...prev.chambers[chamberId],
              level: Math.min(10, prev.chambers[chamberId].level + 1),
            },
          },
          totals: {
            ...prev.totals,
            totalGrown: prev.totals.totalGrown + 1,
          },
        }))
        return true
      },

      // ── yxForgeNode ───────────────────────────────────────────
      yxForgeNode: (entityId: string): boolean => {
        const state = get()
        const creature = YX_CREATURES.find((c) => c.id === entityId)
        if (!creature) return false
        if (state.creatures[entityId]?.owned) return false
        if (state.yxSap < creature.cost) return false

        const xpGain = Math.floor(creature.xpReward * yxRarityMultiplier(creature.rarity))
        set((prev) => ({
          yxSap: yxClampSap(prev.yxSap - creature.cost),
          yxXp: prev.yxXp + xpGain,
          yxXylemNodes: prev.yxXylemNodes + 1,
          creatures: {
            ...prev.creatures,
            [entityId]: {
              owned: true,
              count: (prev.creatures[entityId]?.count ?? 0) + 1,
              level: 1,
              xp: 0,
              acquiredAt: Date.now(),
            },
          },
          totals: {
            ...prev.totals,
            totalForged: prev.totals.totalForged + 1,
            totalCreaturesFound: prev.totals.totalCreaturesFound + 1,
          },
        }))
        return true
      },

      // ── yxChannelSap ──────────────────────────────────────────
      yxChannelSap: (materialId: string): number => {
        const state = get()
        const material = YX_MATERIALS.find((m) => m.id === materialId)
        if (!material) return 0
        const amount = Math.floor(material.value * yxRarityMultiplier(material.rarity) * 0.1)
        const sapGain = Math.max(1, amount)
        set((prev) => ({
          yxSap: yxClampSap(prev.yxSap + sapGain),
          totals: {
            ...prev.totals,
            totalChanneled: prev.totals.totalChanneled + 1,
          },
        }))
        return sapGain
      },

      // ── yxExploreChamber ──────────────────────────────────────
      yxExploreChamber: (chamberId: string): boolean => {
        const state = get()
        const chamber = YX_CHAMBERS.find((c) => c.id === chamberId)
        if (!chamber) return false
        if (state.chambers[chamberId]?.explored) return false
        if (state.yxLevel < chamber.unlockLevel) return false
        if (state.yxSap < 30) return false

        set((prev) => ({
          yxSap: yxClampSap(prev.yxSap - 30),
          yxXp: prev.yxXp + chamber.level * 20,
          yxHarmony: Math.min(100, prev.yxHarmony + 10),
          yxActiveChamber: chamberId,
          chambers: {
            ...prev.chambers,
            [chamberId]: {
              ...prev.chambers[chamberId],
              explored: true,
              unlockedAt: Date.now(),
            },
          },
        }))
        return true
      },

      // ── yxDiscoverCreature ────────────────────────────────────
      yxDiscoverCreature: (creatureId: string): boolean => {
        const state = get()
        const creature = YX_CREATURES.find((c) => c.id === creatureId)
        if (!creature) return false
        if (state.creatures[creatureId]?.owned) return false

        const cost = Math.floor(creature.cost * yxRarityMultiplier(creature.rarity))
        if (state.yxSap < cost) return false

        const xpGain = Math.floor(creature.xpReward * yxRarityMultiplier(creature.rarity))
        set((prev) => ({
          yxSap: yxClampSap(prev.yxSap - cost),
          yxXp: prev.yxXp + xpGain,
          yxXylemNodes: prev.yxXylemNodes + 1,
          creatures: {
            ...prev.creatures,
            [creatureId]: {
              owned: true,
              count: (prev.creatures[creatureId]?.count ?? 0) + 1,
              level: 1,
              xp: 0,
              acquiredAt: Date.now(),
            },
          },
          totals: {
            ...prev.totals,
            totalCreaturesFound: prev.totals.totalCreaturesFound + 1,
          },
        }))
        return true
      },

      // ── yxBuildStructure ──────────────────────────────────────
      yxBuildStructure: (structureId: string): boolean => {
        const state = get()
        const structure = YX_STRUCTURES.find((s) => s.id === structureId)
        if (!structure) return false
        if (state.structures[structureId]?.level && state.structures[structureId].level > 0) return false
        if (state.yxLevel < structure.requiredLevel) return false
        if (state.yxSap < structure.baseCost) return false

        set((prev) => ({
          yxSap: yxClampSap(prev.yxSap - structure.baseCost),
          yxXp: prev.yxXp + structure.requiredLevel * 15,
          yxXylemNodes: prev.yxXylemNodes + 1,
          structures: {
            ...prev.structures,
            [structureId]: { level: 1, builtAt: Date.now() },
          },
          totals: {
            ...prev.totals,
            totalStructuresBuilt: prev.totals.totalStructuresBuilt + 1,
          },
        }))
        return true
      },

      // ── yxUpgradeStructure ────────────────────────────────────
      yxUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structure = YX_STRUCTURES.find((s) => s.id === structureId)
        if (!structure) return false
        const currentLevel = state.structures[structureId]?.level ?? 0
        if (currentLevel <= 0) return false
        if (currentLevel >= structure.maxLevel) return false

        const upgradeCost = Math.floor(
          structure.baseCost * Math.pow(structure.costMultiplier, currentLevel)
        )
        if (state.yxSap < upgradeCost) return false

        set((prev) => ({
          yxSap: yxClampSap(prev.yxSap - upgradeCost),
          yxXp: prev.yxXp + currentLevel * 20,
          structures: {
            ...prev.structures,
            [structureId]: { ...prev.structures[structureId], level: currentLevel + 1 },
          },
        }))
        return true
      },

      // ── yxLearnAbility ────────────────────────────────────────
      yxLearnAbility: (abilityId: string): boolean => {
        const state = get()
        const ability = YX_ABILITIES.find((a) => a.id === abilityId)
        if (!ability) return false
        if (state.abilities[abilityId]?.learned) return false
        if (state.yxLevel < ability.requiredLevel) return false
        if (state.yxSap < ability.cost) return false

        set((prev) => ({
          yxSap: yxClampSap(prev.yxSap - ability.cost),
          yxXp: prev.yxXp + ability.requiredLevel * 10,
          abilities: {
            ...prev.abilities,
            [abilityId]: { learned: true, castCount: 0, cooldownEnd: 0 },
          },
        }))
        return true
      },

      // ── yxCastAbility ─────────────────────────────────────────
      yxCastAbility: (abilityId: string): boolean => {
        const state = get()
        const ability = YX_ABILITIES.find((a) => a.id === abilityId)
        if (!ability) return false
        const abilityState = state.abilities[abilityId]
        if (!abilityState || !abilityState.learned) return false
        if (Date.now() < abilityState.cooldownEnd) return false

        const xpGain = Math.floor(ability.power * yxRarityMultiplier(ability.rarity))
        const harmonyGain = Math.floor(ability.power * 0.2)
        set((prev) => ({
          yxXp: prev.yxXp + xpGain,
          yxHarmony: Math.min(100, prev.yxHarmony + harmonyGain),
          abilities: {
            ...prev.abilities,
            [abilityId]: {
              ...prev.abilities[abilityId],
              castCount: prev.abilities[abilityId].castCount + 1,
              cooldownEnd: Date.now() + ability.cooldown * 1000,
            },
          },
          totals: {
            ...prev.totals,
            totalAbilitiesCast: prev.totals.totalAbilitiesCast + 1,
            [yxActionToTotalsKey(ability.action)]: (prev.totals as unknown as Record<string, number>)[yxActionToTotalsKey(ability.action)] + 1,
          },
        }))
        return true
      },

      // ── yxCollectArtifact ─────────────────────────────────────
      yxCollectArtifact: (artifactId: string): boolean => {
        const state = get()
        const artifact = YX_ARTIFACTS.find((a) => a.id === artifactId)
        if (!artifact) return false
        if (state.artifacts[artifactId]?.collected) return false

        const xpGain = Math.floor(artifact.powerBonus * yxRarityMultiplier(artifact.rarity))
        set((prev) => ({
          yxXp: prev.yxXp + xpGain,
          yxHarmony: Math.min(100, prev.yxHarmony + 15),
          artifacts: {
            ...prev.artifacts,
            [artifactId]: { collected: true, collectedAt: Date.now() },
          },
        }))
        return true
      },

      // ── yxClaimTitle ──────────────────────────────────────────
      yxClaimTitle: (titleId: string): boolean => {
        const state = get()
        const title = YX_TITLES.find((t) => t.id === titleId)
        if (!title) return false
        if (state.yxLevel < title.requiredLevel) return false

        set((prev) => ({
          yxCurrentTitle: titleId,
        }))
        return true
      },

      // ── yxStartEvent ──────────────────────────────────────────
      yxStartEvent: (eventId: string): boolean => {
        const state = get()
        const event = YX_EVENTS.find((e) => e.id === eventId)
        if (!event) return false
        if (state.yxLevel < event.requiredLevel) return false
        if (state.eventState.activeEventId) return false

        set((prev) => ({
          eventState: {
            activeEventId: eventId,
            eventEnd: Date.now() + event.duration * 1000,
            eventsCompleted: prev.eventState.eventsCompleted,
          },
        }))
        return true
      },

      // ── yxEndEvent ────────────────────────────────────────────
      yxEndEvent: () => {
        set((prev) => ({
          eventState: {
            activeEventId: null,
            eventEnd: 0,
            eventsCompleted: prev.eventState.eventsCompleted + (prev.eventState.activeEventId ? 1 : 0),
          },
        }))
      },

      // ── yxAddXp ───────────────────────────────────────────────
      yxAddXp: (amount: number) => {
        set((prev) => ({ yxXp: prev.yxXp + amount }))
      },

      // ── yxAddSap ──────────────────────────────────────────────
      yxAddSap: (amount: number) => {
        set((prev) => ({ yxSap: yxClampSap(prev.yxSap + amount) }))
      },

      // ── yxSpendSap ────────────────────────────────────────────
      yxSpendSap: (amount: number): boolean => {
        const state = get()
        if (state.yxSap < amount) return false
        set((prev) => ({ yxSap: yxClampSap(prev.yxSap - amount) }))
        return true
      },

      // ── yxGatherMaterial ──────────────────────────────────────
      yxGatherMaterial: (materialId: string, amount: number): boolean => {
        const material = YX_MATERIALS.find((m) => m.id === materialId)
        if (!material) return false

        set((prev) => ({
          yxXp: prev.yxXp + Math.floor(amount * 2),
          yxSap: yxClampSap(prev.yxSap + Math.floor(amount * material.craftBonus * 0.1)),
          yxResources: {
            ...prev.yxResources,
            [materialId as keyof YxResourceState]:
              (prev.yxResources[materialId as keyof YxResourceState] ?? 0) + amount,
          },
          totals: {
            ...prev.totals,
            totalMaterialsGathered: prev.totals.totalMaterialsGathered + amount,
          },
        }))
        return true
      },

      // ── yxResetState ──────────────────────────────────────────
      yxResetState: () => {
        const initial = yxCreateInitialState()
        set(initial)
      },
    }),
    {
      name: YX_SAVE_KEY,
      version: 1,
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: MAIN HOOK — useYggdrasilXylem
// ═══════════════════════════════════════════════════════════════════

export default function useYggdrasilXylem() {
  const state = useYxStore()
  const [yxReady, setYxReady] = useState(false)

  const stateRef = useRef(state)

  // Mark hook as ready after mount
  useEffect(() => {
    setYxReady(true)
  }, [])

  // Sync stateRef inside useEffect (NOT during render)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Auto level-up check
  useEffect(() => {
    if (state.yxXp >= yxXpRequired(state.yxLevel) && state.yxLevel < YX_MAX_LEVEL) {
      const s = useYxStore.getState()
      let lvl = s.yxLevel
      let xp = s.yxXp
      while (lvl < YX_MAX_LEVEL && xp >= yxXpRequired(lvl)) {
        xp -= yxXpRequired(lvl)
        lvl += 1
      }
      if (lvl >= YX_MAX_LEVEL) {
        xp = 0
      }
      if (lvl !== s.yxLevel) {
        useYxStore.setState({
          yxLevel: yxClampLevel(lvl),
          yxXp: xp,
          yxHarmony: Math.min(100, s.yxHarmony + lvl * 2),
        })
      }
    }
  }, [state.yxXp, state.yxLevel])

  // Auto-expire events
  useEffect(() => {
    if (!state.eventState.activeEventId) return
    if (Date.now() >= state.eventState.eventEnd) {
      useYxStore.getState().yxEndEvent()
    }
  }, [state.eventState])

  // Auto-check achievements
  useEffect(() => {
    let changed = false
    const newAchievements = { ...state.achievements }
    for (const ach of YX_ACHIEVEMENTS) {
      const achState = newAchievements[ach.id]
      if (achState && !achState.unlocked) {
        const totalsRecord = state.totals as unknown as Record<string, number>
        const value = totalsRecord[ach.conditionKey] ?? 0
        if (value >= ach.targetValue) {
          newAchievements[ach.id] = { ...achState, unlocked: true, unlockedAt: Date.now() }
          changed = true
        }
      }
    }
    if (changed) {
      useYxStore.setState({ achievements: newAchievements })
    }
  }, [state.totals, state.yxLevel])

  // ─── Constants on API ──────────────────────────────────────────

  const YX_SPECIES_RO = useMemo(() => YX_SPECIES, [])
  const YX_CREATURES_RO = useMemo(() => YX_CREATURES, [])
  const YX_CHAMBERS_RO = useMemo(() => YX_CHAMBERS, [])
  const YX_MATERIALS_RO = useMemo(() => YX_MATERIALS, [])
  const YX_STRUCTURES_RO = useMemo(() => YX_STRUCTURES, [])
  const YX_ABILITIES_RO = useMemo(() => YX_ABILITIES, [])
  const YX_ACHIEVEMENTS_RO = useMemo(() => YX_ACHIEVEMENTS, [])
  const YX_TITLES_RO = useMemo(() => YX_TITLES, [])
  const YX_ARTIFACTS_RO = useMemo(() => YX_ARTIFACTS, [])
  const YX_EVENTS_RO = useMemo(() => YX_EVENTS, [])

  // ─── Computed Values ───────────────────────────────────────────

  const computedData = useMemo(() => {
    const creaturesList = YX_CREATURES.map((c) => {
      const cState = state.creatures[c.id]
      return {
        ...c,
        owned: cState?.owned ?? false,
        count: cState?.count ?? 0,
        level: cState?.level ?? 1,
        rarityColor: yxRarityColor(c.rarity),
        speciesColor: yxSpeciesColor(c.species),
      }
    })

    const chambersList = YX_CHAMBERS.map((ch) => {
      const chState = state.chambers[ch.id]
      return {
        ...ch,
        explored: chState?.explored ?? false,
        level: chState?.level ?? 1,
        gatherCount: chState?.gatherCount ?? 0,
        creaturesFound: chState?.creaturesFound ?? 0,
      }
    })

    const materialsList = YX_MATERIALS.map((m) => {
      const owned = (state.yxResources as unknown as Record<string, number>)[m.id] ?? 0
      return {
        ...m,
        owned,
        rarityColor: yxRarityColor(m.rarity),
      }
    })

    const structuresList = YX_STRUCTURES.map((s) => {
      const sState = state.structures[s.id]
      const currentLevel = sState?.level ?? 0
      const upgradeCost = currentLevel > 0
        ? Math.floor(s.baseCost * Math.pow(s.costMultiplier, currentLevel))
        : s.baseCost
      return {
        ...s,
        level: currentLevel,
        built: currentLevel > 0,
        upgradeCost,
        maxed: currentLevel >= s.maxLevel,
        totalEffect: currentLevel * s.effectPerLevel,
      }
    })

    const abilitiesList = YX_ABILITIES.map((a) => {
      const aState = state.abilities[a.id]
      const now = Date.now()
      return {
        ...a,
        learned: aState?.learned ?? false,
        castCount: aState?.castCount ?? 0,
        cooldownRemaining: aState ? Math.max(0, aState.cooldownEnd - now) : 0,
        onCooldown: aState ? now < aState.cooldownEnd : false,
        rarityColor: yxRarityColor(a.rarity),
      }
    })

    const achievementsList = YX_ACHIEVEMENTS.map((ach) => {
      const achState = state.achievements[ach.id]
      const currentValue = (state.totals as unknown as Record<string, number>)[ach.conditionKey] ?? 0
      const progress = Math.min(1, currentValue / ach.targetValue)
      return {
        ...ach,
        unlocked: achState?.unlocked ?? false,
        unlockedAt: achState?.unlockedAt ?? null,
        currentValue,
        progress,
        percentComplete: Math.floor(progress * 100),
      }
    })

    const titlesList = YX_TITLES.map((t) => ({
      ...t,
      active: state.yxCurrentTitle === t.id,
      unlocked: state.yxLevel >= t.requiredLevel,
    }))

    const artifactsList = YX_ARTIFACTS.map((ar) => {
      const arState = state.artifacts[ar.id]
      return {
        ...ar,
        collected: arState?.collected ?? false,
        collectedAt: arState?.collectedAt ?? null,
        rarityColor: yxRarityColor(ar.rarity),
      }
    })

    const currentXpNeeded = yxXpRequired(state.yxLevel)
    const levelProgress = currentXpNeeded > 0
      ? Math.min(1, state.yxXp / currentXpNeeded)
      : 0

    const ownedCreatureCount = creaturesList.filter((c) => c.owned).length
    const exploredChamberCount = chambersList.filter((ch) => ch.explored).length
    const builtStructureCount = structuresList.filter((s) => s.built).length
    const learnedAbilityCount = abilitiesList.filter((a) => a.learned).length
    const collectedArtifactCount = artifactsList.filter((a) => a.collected).length
    const unlockedAchievementCount = achievementsList.filter((a) => a.unlocked).length

    const activeEvent = state.eventState.activeEventId
      ? YX_EVENTS.find((e) => e.id === state.eventState.activeEventId) ?? null
      : null

    const activeEventTimeRemaining = state.eventState.activeEventId
      ? Math.max(0, state.eventState.eventEnd - Date.now())
      : 0

    const currentTitleObj = YX_TITLES.find((t) => t.id === state.yxCurrentTitle) ?? null

    const totalPower = creaturesList
      .filter((c) => c.owned)
      .reduce((sum, c) => sum + c.power * (1 + c.level * 0.12), 0)

    const totalDefense = creaturesList
      .filter((c) => c.owned)
      .reduce((sum, c) => sum + c.defense * (1 + c.level * 0.08), 0)

    const raritySummary: Record<YxRarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const c of creaturesList) {
      if (c.owned) {
        raritySummary[c.rarity] += 1
      }
    }

    return {
      creaturesList,
      chambersList,
      materialsList,
      structuresList,
      abilitiesList,
      achievementsList,
      titlesList,
      artifactsList,
      levelProgress,
      currentXpNeeded,
      ownedCreatureCount,
      exploredChamberCount,
      builtStructureCount,
      learnedAbilityCount,
      collectedArtifactCount,
      unlockedAchievementCount,
      activeEvent,
      activeEventTimeRemaining,
      currentTitleObj,
      totalPower: Math.floor(totalPower),
      totalDefense: Math.floor(totalDefense),
      raritySummary,
    }
  }, [state])

  // ─── Helper Functions ───────────────────────────────────────────

  const yxGetCreatureById = useCallback(
    (id: string): YxCreatureDef | null => YX_CREATURES.find((c) => c.id === id) ?? null,
    []
  )

  const yxGetChamberById = useCallback(
    (id: string): YxChamberDef | null => YX_CHAMBERS.find((ch) => ch.id === id) ?? null,
    []
  )

  const yxGetMaterialById = useCallback(
    (id: string): YxMaterialDef | null => YX_MATERIALS.find((m) => m.id === id) ?? null,
    []
  )

  const yxGetStructureById = useCallback(
    (id: string): YxStructureDef | null => YX_STRUCTURES.find((s) => s.id === id) ?? null,
    []
  )

  const yxGetAbilityById = useCallback(
    (id: string): YxAbilityDef | null => YX_ABILITIES.find((a) => a.id === id) ?? null,
    []
  )

  const yxGetArtifactById = useCallback(
    (id: string): YxArtifactDef | null => YX_ARTIFACTS.find((a) => a.id === id) ?? null,
    []
  )

  const yxGetEventById = useCallback(
    (id: string): YxEventDef | null => YX_EVENTS.find((e) => e.id === id) ?? null,
    []
  )

  const yxGetCreaturesBySpecies = useCallback(
    (species: YxSpecies): YxCreatureDef[] => YX_CREATURES.filter((c) => c.species === species),
    []
  )

  const yxGetCreaturesByRarity = useCallback(
    (rarity: YxRarity): YxCreatureDef[] => YX_CREATURES.filter((c) => c.rarity === rarity),
    []
  )

  const yxGetMaterialsByRarity = useCallback(
    (rarity: YxRarity): YxMaterialDef[] => YX_MATERIALS.filter((m) => m.rarity === rarity),
    []
  )

  const yxGetMaterialsByChamber = useCallback(
    (chamberId: string): YxMaterialDef[] => YX_MATERIALS.filter((m) => m.sourceChamber === chamberId),
    []
  )

  const yxRarityColorFn = useCallback((r: YxRarity): string => yxRarityColor(r), [])
  const yxSpeciesColorFn = useCallback((s: YxSpecies): string => yxSpeciesColor(s), [])
  const yxRarityMultiplierFn = useCallback((r: YxRarity): number => yxRarityMultiplier(r), [])

  const yxGetStructureUpgradeCost = useCallback(
    (structureId: string): number => {
      const structure = YX_STRUCTURES.find((s) => s.id === structureId)
      if (!structure) return 0
      const currentLevel = state.structures[structureId]?.level ?? 0
      return Math.floor(structure.baseCost * Math.pow(structure.costMultiplier, currentLevel))
    },
    [state.structures]
  )

  const yxCanAfford = useCallback(
    (cost: number): boolean => state.yxSap >= cost,
    [state.yxSap]
  )

  // ─── Persist Config ────────────────────────────────────────────

  const yxPersistConfig = useMemo(() => ({
    name: YX_SAVE_KEY,
    version: 1,
  }), [])

  // ============================================================
  // Return Object
  // ============================================================

  return {
    // Constants
    YX_SPECIES: YX_SPECIES_RO,
    YX_CREATURES: YX_CREATURES_RO,
    YX_CHAMBERS: YX_CHAMBERS_RO,
    YX_MATERIALS: YX_MATERIALS_RO,
    YX_STRUCTURES: YX_STRUCTURES_RO,
    YX_ABILITIES: YX_ABILITIES_RO,
    YX_ACHIEVEMENTS: YX_ACHIEVEMENTS_RO,
    YX_TITLES: YX_TITLES_RO,
    YX_ARTIFACTS: YX_ARTIFACTS_RO,
    YX_EVENTS: YX_EVENTS_RO,

    // Color Constants
    YX_WORLD_GREEN,
    YX_GOLDEN_BARK,
    YX_SAP_AMBER,
    YX_ROOT_BROWN,
    YX_LEAF_JADE,
    YX_PETAL_IVORY,
    YX_CANOPY_TEAL,

    // Core Constants
    YX_MAX_LEVEL,
    YX_SAVE_KEY,

    // Core State (numbers)
    yxLevel: state.yxLevel,
    yxHarmony: state.yxHarmony,
    yxXylemNodes: state.yxXylemNodes,
    yxReady,

    // State access
    yxXp: state.yxXp,
    yxSap: state.yxSap,
    yxCurrentTitle: state.yxCurrentTitle,
    yxActiveChamber: state.yxActiveChamber,
    yxResources: state.yxResources,
    yxTotals: state.totals,
    yxEventState: state.eventState,

    // Store Actions
    yxAbsorbEnergy: state.yxAbsorbEnergy,
    yxGrowBranch: state.yxGrowBranch,
    yxForgeNode: state.yxForgeNode,
    yxChannelSap: state.yxChannelSap,
    yxExploreChamber: state.yxExploreChamber,
    yxDiscoverCreature: state.yxDiscoverCreature,
    yxBuildStructure: state.yxBuildStructure,
    yxUpgradeStructure: state.yxUpgradeStructure,
    yxLearnAbility: state.yxLearnAbility,
    yxCastAbility: state.yxCastAbility,
    yxCollectArtifact: state.yxCollectArtifact,
    yxClaimTitle: state.yxClaimTitle,
    yxStartEvent: state.yxStartEvent,
    yxEndEvent: state.yxEndEvent,
    yxAddXp: state.yxAddXp,
    yxAddSap: state.yxAddSap,
    yxSpendSap: state.yxSpendSap,
    yxGatherMaterial: state.yxGatherMaterial,
    yxResetState: state.yxResetState,

    // Computed Data
    ...computedData,

    // Helper Functions
    yxGetCreatureById,
    yxGetChamberById,
    yxGetMaterialById,
    yxGetStructureById,
    yxGetAbilityById,
    yxGetArtifactById,
    yxGetEventById,
    yxGetCreaturesBySpecies,
    yxGetCreaturesByRarity,
    yxGetMaterialsByRarity,
    yxGetMaterialsByChamber,
    yxRarityColor: yxRarityColorFn,
    yxSpeciesColor: yxSpeciesColorFn,
    yxRarityMultiplier: yxRarityMultiplierFn,
    yxGetStructureUpgradeCost,
    yxCanAfford,

    // Persist Config
    yxPersistConfig,
  }
}
