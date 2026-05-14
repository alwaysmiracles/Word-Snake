/**
 * Birch Grove Wire — 白桦林 (Birch Grove) themed module for Word Snake
 *
 * Tend a sacred birch grove where 35 grove spirits (5 rarity x 7 types)
 * dwell across 8 mystical grove locations. Collect 30 wood/bloom materials,
 * construct 25 upgradable structures, wield 22 nature abilities, unlock
 * 18 achievements, ascend through 8 titles, discover 15 ancient artifacts,
 * and face 12 grove events — backed by a Zustand store with persist middleware.
 *
 * Storage key: birch-grove-wire
 * Prefix: bg / BG_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type BgSpiritType =
  | 'birch_nymph'
  | 'moss_treant'
  | 'thorn_fairy'
  | 'root_walker'
  | 'leaf_sylph'
  | 'bark_guardian'
  | 'petal_dancer'

export type BgRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type BgTitleId =
  | 'bg_title_seedling'
  | 'bg_title_sapling'
  | 'bg_title_canopy'
  | 'bg_title_warden'
  | 'bg_title_druid'
  | 'bg_title_elder'
  | 'bg_title_sage'
  | 'bg_title_ancient'

export interface BgSpiritTypeDef {
  readonly id: BgSpiritType
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly lore: string
}

export interface BgSpiritDef {
  readonly id: string
  readonly name: string
  readonly type: BgSpiritType
  readonly rarity: BgRarity
  readonly friendshipPower: number
  readonly wisdomPower: number
  readonly naturePower: number
  readonly description: string
  readonly lore: string
  readonly traits: string[]
}

export interface BgSpiritInstance {
  readonly id: string
  readonly spiritId: string
  friendship: number
  level: number
  befriendedAt: number
}

export interface BgGroveDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly lore: string
  readonly fertility: number
  readonly requiredTitle: BgTitleId
  readonly bgGradient: string
  readonly ambientColor: string
  readonly spiritAffinity: BgSpiritType
}

export interface BgMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'wood' | 'bloom' | 'bark' | 'resin' | 'essence'
  readonly rarity: BgRarity
  readonly friendshipBonus: number
  readonly wisdomBonus: number
  readonly value: number
  readonly description: string
  readonly lore: string
}

export interface BgStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'shrine' | 'bridge' | 'canopy' | 'root_den' | 'pond'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
  readonly lore: string
}

export interface BgStructureInstance {
  readonly id: string
  readonly structureDefId: string
  level: number
  builtAt: number
}

export interface BgAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly spiritType: BgSpiritType
  readonly type: 'active' | 'passive'
  readonly rarity: BgRarity
  readonly energyCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
  readonly lore: string
}

export interface BgAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly lore: string
  readonly condition: string
  readonly reward: { bark: number; renown: number }
}

export interface BgTitleDef {
  readonly id: BgTitleId
  readonly name: string
  readonly emoji: string
  readonly minRenown: number
  readonly minSpirits: number
  readonly description: string
  readonly lore: string
}

export interface BgArtifactDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: BgRarity
  readonly friendshipBoost: number
  readonly wisdomBoost: number
  readonly natureBoost: number
  readonly value: number
  readonly description: string
  readonly lore: string
}

export interface BgEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
  readonly lore: string
}

export interface BgGroveInstance {
  readonly groveId: string
  tended: boolean
  lastTendedAt: number
  blessings: number
}

export interface BgStoreState {
  bgSpirits: BgSpiritInstance[]
  bgGroves: BgGroveInstance[]
  bgInventory: { materialId: string; count: number }[]
  bgStructures: BgStructureInstance[]
  bgArtifacts: string[]
  bgAchievements: string[]
  bgTitle: BgTitleId
  bgEvents: string[]
  bgStats: {
    totalBefriended: number
    totalTended: number
    totalBuilt: number
    totalEventsTriggered: number
    bark: number
    renown: number
  }
  activeEvent: BgEventDef | null
  eventTurnsRemaining: number
  activeGrove: string | null
}

export interface BgStoreActions {
  befriendSpirit: (id: string) => boolean
  tendGrove: (id: string) => BgEventDef | null
  buildStructure: (id: string) => boolean
  activateArtifact: (id: string) => boolean
  triggerGroveEvent: () => BgEventDef | null
  resetBirchGrove: () => void
}

export interface BgFullStore extends BgStoreState, BgStoreActions {}

export interface BgOwnedSpirit extends BgSpiritInstance {
  def: BgSpiritDef | undefined
  typeColor: string
  rarityColor: string
}

export interface BgBuiltStructure extends BgStructureInstance {
  def: BgStructureDef | undefined
}

export interface BgInventoryItem {
  materialId: string
  count: number
  def: BgMaterialDef | undefined
}

export interface BgTitleProgress {
  percent: number
  renownNeeded: number
  spiritsNeeded: number
}

export interface BgTotalArtifactBoost {
  friendshipBoost: number
  wisdomBoost: number
  natureBoost: number
}

export interface BgAPI {
  // Direct constants
  BG_BIRCH_WHITE: string
  BG_FOREST_GREEN: string
  BG_MOSS_GREEN: string
  BG_BARK_BROWN: string
  BG_SAP_GOLD: string
  BG_MIST_SILVER: string
  BG_LEAF_JADE: string
  BG_TWILIGHT_AMBER: string
  BG_SPIRIT_TYPES: readonly BgSpiritTypeDef[]
  BG_SPIRITS: readonly BgSpiritDef[]
  BG_GROVES: readonly BgGroveDef[]
  BG_MATERIALS: readonly BgMaterialDef[]
  BG_STRUCTURES: readonly BgStructureDef[]
  BG_ABILITIES: readonly BgAbilityDef[]
  BG_ACHIEVEMENTS: readonly BgAchievementDef[]
  BG_TITLES: readonly BgTitleDef[]
  BG_ARTIFACTS: readonly BgArtifactDef[]
  BG_EVENTS: readonly BgEventDef[]
  bgRarityColor: (r: BgRarity) => string
  bgSpiritTypeColor: (t: BgSpiritType) => string
  bgRarityMultiplier: (r: BgRarity) => number
  bgStructureUpgradeCost: (def: BgStructureDef, currentLevel: number) => number
  bgBefriendCost: (def: BgSpiritDef) => number
  // Store state
  bgSpirits: BgSpiritInstance[]
  bgGroves: BgGroveInstance[]
  bgInventory: { materialId: string; count: number }[]
  bgStructures: BgStructureInstance[]
  bgArtifacts: string[]
  bgAchievements: string[]
  bgTitle: BgTitleId
  bgEvents: string[]
  bgStats: BgStoreState['bgStats']
  activeEvent: BgEventDef | null
  eventTurnsRemaining: number
  activeGrove: string | null
  // Store actions
  befriendSpirit: (id: string) => boolean
  tendGrove: (id: string) => BgEventDef | null
  buildStructure: (id: string) => boolean
  activateArtifact: (id: string) => boolean
  triggerGroveEvent: () => BgEventDef | null
  resetBirchGrove: () => void
  // Computed getters
  bgOwnedSpirits: BgOwnedSpirit[]
  bgAvailableSpirits: BgSpiritDef[]
  bgCurrentTitleDetail: BgTitleDef
  bgNextTitle: BgTitleDef | null
  bgActiveGroveDetail: BgGroveDef | null
  bgUntendedGroves: BgGroveDef[]
  bgBuiltStructures: BgBuiltStructure[]
  bgUnlockableAbilities: BgAbilityDef[]
  bgOwnedArtifacts: BgArtifactDef[]
  bgUnclaimedAchievements: BgAchievementDef[]
  bgInventoryItems: BgInventoryItem[]
  bgTotalStructureEffect: number
  bgAverageSpiritLevel: number
  bgTotalSpiritPower: number
  bgSpiritsByType: Record<BgSpiritType, BgSpiritInstance[]>
  bgSpiritsByRarity: Record<BgRarity, BgSpiritInstance[]>
  bgTitleProgress: BgTitleProgress
  bgRareMaterialCount: number
  bgTotalArtifactBoost: BgTotalArtifactBoost
  bgCompletionPercent: number
  bgStructuresByCategory: Record<string, BgStructureInstance[]>
  bgMaterialsByType: Record<string, number>
  bgTendedGroveCount: number
  bgLegendaryCount: number
  bgActiveEventMultiplier: number
  bgHighestRarityOwned: BgRarity
  bgTotalBlessings: number
  bgMostBlessedGrove: BgGroveDef | null
  bgCheckSpiritSynergy: (typeA: BgSpiritType, typeB: BgSpiritType) => number
  bgGetGroveSpiritBonus: (groveId: string, spiritType: BgSpiritType) => number
  bgSpiritsInRange: (spiritId: string, allSpirits: BgSpiritInstance[], range?: number) => BgSpiritInstance[]
  bgCalculateFriendshipRate: (def: BgSpiritDef, structEffect: number, artifactBoost: number, groveBonus: number) => number
  bgCalculateBuildCost: (def: BgStructureDef, currentLevel: number, ownedCount: number) => number
  bgValidateGroveAccess: (groveId: string, currentTitle: BgTitleId) => { canAccess: boolean; reason: string }
  bgGetEventEffectValue: (event: BgEventDef) => number
  bgFormatRarityLabel: (r: BgRarity) => string
  bgGetSpiritTypeEmoji: (t: BgSpiritType) => string
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS (8 colors)
// ═══════════════════════════════════════════════════════════════════

export const BG_BIRCH_WHITE: string = '#FAEBD7'
export const BG_FOREST_GREEN: string = '#228B22'
export const BG_MOSS_GREEN: string = '#6B8E23'
export const BG_BARK_BROWN: string = '#8B4513'
export const BG_SAP_GOLD: string = '#DAA520'
export const BG_MIST_SILVER: string = '#C0C0C0'
export const BG_LEAF_JADE: string = '#00A86B'
export const BG_TWILIGHT_AMBER: string = '#FFBF00'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: SPIRIT TYPE DEFINITIONS (7 types)
// ═══════════════════════════════════════════════════════════════════

export const BG_SPIRIT_TYPES: readonly BgSpiritTypeDef[] = [
  {
    id: 'birch_nymph',
    name: 'Birch Nymph',
    emoji: '🧚',
    description: 'Graceful spirits born from birch sap, they sing to the trees and nurture new growth.',
    lore: 'According to birch grove legend, the first nymph was born when a lonely druid wept upon a dying birch, and her tears merged with the sap.',
  },
  {
    id: 'moss_treant',
    name: 'Moss Treant',
    emoji: '🌳',
    description: 'Ancient guardians sheathed in moss, they have protected the grove for millennia.',
    lore: 'The eldest moss treants remember the planting of the World Birch. Their moss contains memories of every season since the grove began.',
  },
  {
    id: 'thorn_fairy',
    name: 'Thorn Fairy',
    emoji: '🧝',
    description: 'Mischievous fairies who weave protective thorn barriers around sacred sites.',
    lore: 'Thorn fairies were once water sprites who were cursed by a jealous river spirit. They transformed their anguish into protective magic.',
  },
  {
    id: 'root_walker',
    name: 'Root Walker',
    emoji: '🦿',
    description: 'Massive beings that travel through underground root networks, sensing all vibrations.',
    lore: 'Root walkers are the postal service of the spirit world. They carry messages between groves that no bird or wind could ever reach.',
  },
  {
    id: 'leaf_sylph',
    name: 'Leaf Sylph',
    emoji: '🍃',
    description: 'Air spirits that ride autumn winds, carrying seeds and messages between distant groves.',
    lore: 'When a leaf sylph dies, it becomes the wind itself. The breeze you feel on your face may be the final breath of a thousand sylphs.',
  },
  {
    id: 'bark_guardian',
    name: 'Bark Guardian',
    emoji: '🛡️',
    description: 'Living suits of bark armor animated by the forest will, standing sentinel forever.',
    lore: 'Bark guardians do not sleep. They do not eat. They do not dream. They simply stand, and have stood since before the grove had a name.',
  },
  {
    id: 'petal_dancer',
    name: 'Petal Dancer',
    emoji: '🌸',
    description: 'Ethereal dancers formed from falling petals, their movements control the seasons.',
    lore: 'The Spring Equinox begins when the Eternal Bloom Prima performs her first dance. If she ever stops, winter would last forever.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export function bgRarityMultiplier(r: BgRarity): number {
  const map: Record<BgRarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    epic: 3,
    legendary: 5,
  }
  return map[r] ?? 1
}

export function bgRarityColor(r: BgRarity): string {
  const map: Record<BgRarity, string> = {
    common: '#9CA3AF',
    uncommon: '#34D399',
    rare: '#60A5FA',
    epic: '#A78BFA',
    legendary: '#FBBF24',
  }
  return map[r] ?? '#9CA3AF'
}

export function bgSpiritTypeColor(t: BgSpiritType): string {
  const map: Record<BgSpiritType, string> = {
    birch_nymph: BG_BIRCH_WHITE,
    moss_treant: BG_MOSS_GREEN,
    thorn_fairy: BG_SAP_GOLD,
    root_walker: BG_BARK_BROWN,
    leaf_sylph: BG_FOREST_GREEN,
    bark_guardian: BG_TWILIGHT_AMBER,
    petal_dancer: BG_LEAF_JADE,
  }
  return map[t] ?? '#888888'
}

function bgFindSpirit(id: string): BgSpiritDef | undefined {
  return BG_SPIRITS.find((s) => s.id === id)
}

function bgFindGrove(id: string): BgGroveDef | undefined {
  return BG_GROVES.find((g) => g.id === id)
}

function bgFindMaterial(id: string): BgMaterialDef | undefined {
  return BG_MATERIALS.find((m) => m.id === id)
}

function bgFindStructureDef(id: string): BgStructureDef | undefined {
  return BG_STRUCTURES.find((s) => s.id === id)
}

function bgFindAbility(id: string): BgAbilityDef | undefined {
  return BG_ABILITIES.find((a) => a.id === id)
}

function bgFindAchievement(id: string): BgAchievementDef | undefined {
  return BG_ACHIEVEMENTS.find((a) => a.id === id)
}

function bgFindTitle(id: BgTitleId): BgTitleDef | undefined {
  return BG_TITLES.find((t) => t.id === id)
}

function bgFindArtifact(id: string): BgArtifactDef | undefined {
  return BG_ARTIFACTS.find((a) => a.id === id)
}

function bgPickRandomEvent(): BgEventDef {
  return BG_EVENTS[Math.floor(Math.random() * BG_EVENTS.length)]
}

function bgCalcMaxTitle(renown: number, spiritCount: number): BgTitleId {
  let best: BgTitleId = BG_TITLES[0].id
  for (const title of BG_TITLES) {
    if (renown >= title.minRenown && spiritCount >= title.minSpirits) {
      best = title.id
    }
  }
  return best
}

export function bgStructureUpgradeCost(def: BgStructureDef, currentLevel: number): number {
  if (currentLevel >= def.maxLevel) return Infinity
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel - 1))
}

export function bgBefriendCost(def: BgSpiritDef): number {
  return Math.floor(50 * bgRarityMultiplier(def.rarity))
}

function bgCheckAchievementCondition(condition: string, state: BgStoreState): boolean {
  const s = state.bgStats
  switch (condition) {
    case 'befriend_5': return state.bgSpirits.length >= 5
    case 'befriend_10': return state.bgSpirits.length >= 10
    case 'befriend_20': return state.bgSpirits.length >= 20
    case 'befriend_35': return state.bgSpirits.length >= 35
    case 'tend_50': return s.totalTended >= 50
    case 'tend_100': return s.totalTended >= 100
    case 'build_10': return s.totalBuilt >= 10
    case 'build_25': return s.totalBuilt >= 25
    case 'artifact_5': return state.bgArtifacts.length >= 5
    case 'artifact_15': return state.bgArtifacts.length >= 15
    case 'renown_500': return s.renown >= 500
    case 'renown_2000': return s.renown >= 2000
    case 'renown_5000': return s.renown >= 5000
    case 'events_20': return s.totalEventsTriggered >= 20
    case 'events_50': return s.totalEventsTriggered >= 50
    case 'legendary_spirit': return state.bgSpirits.some((si) => {
      const def = bgFindSpirit(si.spiritId)
      return def && def.rarity === 'legendary'
    })
    case 'all_types': {
      const types = new Set(state.bgSpirits.map((si) => bgFindSpirit(si.spiritId)?.type).filter(Boolean))
      return types.size >= 7
    }
    case 'all_groves_tended':
      return state.bgGroves.length >= 8
    default: return false
  }
}

function bgMakeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: BG_SPIRITS — 35 Grove Spirits (5 rarity x 7 types)
// ═══════════════════════════════════════════════════════════════════

export const BG_SPIRITS: readonly BgSpiritDef[] = [
  // ── Birch Nymph Spirits (5) ───────────────────────────────
  {
    id: 'nymph_sapling', name: 'Sapling Whisper', type: 'birch_nymph', rarity: 'common',
    friendshipPower: 10, wisdomPower: 8, naturePower: 12,
    description: 'A tiny nymph who whispers encouragement to young birch saplings at dawn.',
    lore: 'She was born from the first drop of sap that fell from a newly planted birch in the Morning Clearing.',
    traits: ['healing_aura', 'dawn_song'],
  },
  {
    id: 'nymph_dewdrop', name: 'Dewdrop Dancer', type: 'birch_nymph', rarity: 'uncommon',
    friendshipPower: 18, wisdomPower: 15, naturePower: 20,
    description: 'She dances on morning dewdrops, turning each one into a prism of forest light.',
    lore: 'The Dewdrop Dancer only appears on mornings when the temperature is exactly right — not too cold, not too warm.',
    traits: ['healing_aura', 'light_refraction', 'morning_call'],
  },
  {
    id: 'nymph_silver_bark', name: 'Silver Bark Maiden', type: 'birch_nymph', rarity: 'rare',
    friendshipPower: 35, wisdomPower: 30, naturePower: 40,
    description: 'Her skin gleams like polished birch bark. She can heal any wounded tree with a touch.',
    lore: 'Legends say the Silver Bark Maiden was once a human herbalist who chose to become one with the birch grove.',
    traits: ['tree_mending', 'healing_aura', 'silver_light', 'sap_blessing'],
  },
  {
    id: 'nymph_heartwood', name: 'Heartwood Songstress', type: 'birch_nymph', rarity: 'epic',
    friendshipPower: 55, wisdomPower: 60, naturePower: 50,
    description: 'Her voice resonates through the heartwood of every tree, granting ancient knowledge to listeners.',
    lore: 'The Heartwood Songstress knows songs older than language. When she sings, even the stones listen.',
    traits: ['ancient_wisdom', 'healing_aura', 'silver_light', 'tree_mending', 'resonance'],
  },
  {
    id: 'nymph_world_birch', name: 'World Birch Nymph', type: 'birch_nymph', rarity: 'legendary',
    friendshipPower: 90, wisdomPower: 100, naturePower: 95,
    description: 'Born from the first birch tree ever planted. She knows the name of every leaf in the grove.',
    lore: 'The World Birch Nymph is the mother of all birch nymphs. She has watched civilizations rise and fall beneath her beloved trees.',
    traits: ['ancient_wisdom', 'world_tree_bond', 'healing_aura', 'tree_mending', 'eternal_spring'],
  },

  // ── Moss Treant Spirits (5) ───────────────────────────────
  {
    id: 'treant_mossling', name: 'Mossling', type: 'moss_treant', rarity: 'common',
    friendshipPower: 12, wisdomPower: 14, naturePower: 10,
    description: 'A small treant covered in soft green moss. Slow but incredibly loyal.',
    lore: 'Mosslings are the youngest treants, barely a century old. They often get confused for boulders.',
    traits: ['root_armor', 'moss_shield'],
  },
  {
    id: 'treant_bracken', name: 'Bracken Elder', type: 'moss_treant', rarity: 'uncommon',
    friendshipPower: 20, wisdomPower: 25, naturePower: 18,
    description: 'An elder covered in ancient ferns and bracken, his memory spans centuries of grove history.',
    lore: 'The Bracken Elder remembers the last ice age. He tells stories of when the grove was buried under a mile of ice.',
    traits: ['root_armor', 'moss_shield', 'ancient_memory'],
  },
  {
    id: 'treant_fern_maze', name: 'Fern Maze Keeper', type: 'moss_treant', rarity: 'rare',
    friendshipPower: 38, wisdomPower: 42, naturePower: 35,
    description: 'He creates living mazes of ferns to protect the grove from intruders.',
    lore: 'The Fern Maze Keeper has designed over ten thousand unique maze patterns, and none have ever been solved on the first attempt.',
    traits: ['root_armor', 'fern_weaving', 'maze_craft', 'moss_shield'],
  },
  {
    id: 'treant_evergreen', name: 'Evergreen Sentinel', type: 'moss_treant', rarity: 'epic',
    friendshipPower: 58, wisdomPower: 65, naturePower: 55,
    description: 'A treant whose moss never dies or wilts. He guards the grove through every season.',
    lore: 'The Evergreen Sentinel has not moved from his post in three thousand years. The moss on his back has developed its own ecosystem.',
    traits: ['root_armor', 'eternal_verdure', 'moss_shield', 'ancient_memory', 'season_walker'],
  },
  {
    id: 'treant_primordial', name: 'Primordial Oak', type: 'moss_treant', rarity: 'legendary',
    friendshipPower: 100, wisdomPower: 95, naturePower: 105,
    description: 'The oldest living being in the grove. His roots connect every tree in a vast neural network.',
    lore: 'The Primordial Oak predates the birch grove itself. The birches grew around him, drawn by his ancient presence.',
    traits: ['root_armor', 'world_root_network', 'eternal_verdure', 'ancient_memory', 'grove_soul'],
  },

  // ── Thorn Fairy Spirits (5) ───────────────────────────────
  {
    id: 'fairy_thistle', name: 'Thistle Sprite', type: 'thorn_fairy', rarity: 'common',
    friendshipPower: 8, wisdomPower: 10, naturePower: 14,
    description: 'A tiny fairy that rides thistle seeds on the wind, sowing protective barriers.',
    lore: 'Thistle Sprites were the first defense the grove ever had. They arrived on a thistle seed from a distant land.',
    traits: ['thorn_weave', 'wind_ride'],
  },
  {
    id: 'fairy_briar', name: 'Briar Enchantress', type: 'thorn_fairy', rarity: 'uncommon',
    friendshipPower: 16, wisdomPower: 20, naturePower: 22,
    description: 'She enchants briar patches to form living walls that only the worthy may pass.',
    lore: 'The Briar Enchantress tests all who enter the grove. Her walls read the heart — only the pure may pass freely.',
    traits: ['thorn_weave', 'barrier_magic', 'wind_ride'],
  },
  {
    id: 'fairy_rose_thorn', name: 'Rose Thorn Queen', type: 'thorn_fairy', rarity: 'rare',
    friendshipPower: 32, wisdomPower: 38, naturePower: 40,
    description: 'Commander of all rose thorns in the grove. Her thorns can pierce any magical barrier.',
    lore: 'The Rose Thorn Queen forged her crown from the first wild rose that grew in the grove. Its thorns have never dulled.',
    traits: ['thorn_weave', 'barrier_magic', 'rose_blessing', 'piercing_strike'],
  },
  {
    id: 'fairy_hawthorn', name: 'Hawthorn Sorceress', type: 'thorn_fairy', rarity: 'epic',
    friendshipPower: 52, wisdomPower: 58, naturePower: 60,
    description: 'A powerful fairy who controls hawthorn trees, the most magically potent barrier plants.',
    lore: 'Hawthorn is the fairy tree. The Hawthorn Sorceress commands not just a barrier, but a gateway between worlds.',
    traits: ['thorn_weave', 'barrier_magic', 'fey_court', 'rose_blessing', 'piercing_strike'],
  },
  {
    id: 'fairy_world_thorn', name: 'World Thorn Empress', type: 'thorn_fairy', rarity: 'legendary',
    friendshipPower: 88, wisdomPower: 92, naturePower: 98,
    description: 'Her thorns encircle the entire grove, forming a barrier visible from the spirit realm.',
    lore: 'The World Thorn Empress is the reason the birch grove has never fallen. Her thorns are the grove immune system.',
    traits: ['thorn_weave', 'world_barrier', 'barrier_magic', 'fey_court', 'grove_soul'],
  },

  // ── Root Walker Spirits (5) ───────────────────────────────
  {
    id: 'root_shoestring', name: 'Shoestring Strider', type: 'root_walker', rarity: 'common',
    friendshipPower: 14, wisdomPower: 8, naturePower: 12,
    description: 'A small root walker that patrols the shallow root networks near the surface.',
    lore: 'Shoestring Striders got their name from their thin, root-like legs that tap the ground as they walk.',
    traits: ['root_travel', 'ground_sense'],
  },
  {
    id: 'root_taproot', name: 'Taproot Wanderer', type: 'root_walker', rarity: 'uncommon',
    friendshipPower: 22, wisdomPower: 18, naturePower: 20,
    description: 'Travels deep taproot highways, detecting threats and nutrients miles away.',
    lore: 'The Taproot Wanderer once walked from the birch grove to the ocean and back, entirely underground.',
    traits: ['root_travel', 'ground_sense', 'deep_path'],
  },
  {
    id: 'root_mycelium', name: 'Mycelium Rider', type: 'root_walker', rarity: 'rare',
    friendshipPower: 40, wisdomPower: 35, naturePower: 42,
    description: 'Rides fungal mycelium networks between trees, carrying messages and nutrients.',
    lore: 'Mycelium Riders are the fastest spirits in the grove. They can reach any tree in seconds through the fungal network.',
    traits: ['root_travel', 'mycelium_ride', 'deep_path', 'nutrient_share'],
  },
  {
    id: 'root_ancient_way', name: 'Ancient Way Keeper', type: 'root_walker', rarity: 'epic',
    friendshipPower: 60, wisdomPower: 55, naturePower: 62,
    description: 'Guardian of the deepest root paths that connect groves across continents.',
    lore: 'Only the Ancient Way Keeper knows the locations of all seven sacred root gates that connect the world groves.',
    traits: ['root_travel', 'ancient_path', 'deep_path', 'mycelium_ride', 'continent_walk'],
  },
  {
    id: 'root_world_tree', name: 'World Root Colossus', type: 'root_walker', rarity: 'legendary',
    friendshipPower: 95, wisdomPower: 88, naturePower: 102,
    description: 'A colossus that walks the root system of the world tree, touching every forest on earth.',
    lore: 'When the World Root Colossus takes a step, every tree in the world trembles slightly. He is the heartbeat of all forests.',
    traits: ['root_travel', 'world_root', 'ancient_path', 'continent_walk', 'grove_soul'],
  },

  // ── Leaf Sylph Spirits (5) ────────────────────────────────
  {
    id: 'sylph_maple', name: 'Maple Breeze', type: 'leaf_sylph', rarity: 'common',
    friendshipPower: 8, wisdomPower: 12, naturePower: 10,
    description: 'A gentle sylph who rides the autumn winds, painting leaves in fiery colors.',
    lore: 'The Maple Breeze was once a single maple leaf that caught the perfect updraft and refused to fall.',
    traits: ['wind_ride', 'leaf_paint'],
  },
  {
    id: 'sylph_birch_leaf', name: 'Birch Leaf Dancer', type: 'leaf_sylph', rarity: 'uncommon',
    friendshipPower: 15, wisdomPower: 22, naturePower: 18,
    description: 'She choreographs the fall of every birch leaf, creating mesmerizing spiral patterns.',
    lore: 'If you watch a birch leaf fall and see it spiral, you are watching the Birch Leaf Dancer at work.',
    traits: ['wind_ride', 'leaf_paint', 'spiral_dance'],
  },
  {
    id: 'sylph_gale_singer', name: 'Gale Singer', type: 'leaf_sylph', rarity: 'rare',
    friendshipPower: 30, wisdomPower: 40, naturePower: 38,
    description: 'Her songs command the wind itself, summoning gales or calming storms at will.',
    lore: 'The Gale Singer once sang a storm into submission for three days straight. When she finished, the sky was clear for a year.',
    traits: ['wind_ride', 'gale_call', 'storm_calm', 'spiral_dance'],
  },
  {
    id: 'sylph_season_weaver', name: 'Season Weaver', type: 'leaf_sylph', rarity: 'epic',
    friendshipPower: 50, wisdomPower: 62, naturePower: 58,
    description: 'She weaves the fabric of seasons from falling leaves, controlling the cycle of growth.',
    lore: 'The Season Weaver decides exactly when autumn becomes winter. Her tapestries hang in the sky as aurora borealis.',
    traits: ['wind_ride', 'gale_call', 'season_weave', 'storm_calm', 'leaf_paint'],
  },
  {
    id: 'sylph_world_wind', name: 'World Wind Sovereign', type: 'leaf_sylph', rarity: 'legendary',
    friendshipPower: 92, wisdomPower: 98, naturePower: 90,
    description: 'Ruler of all winds that touch the birch grove. A single breath can scatter seeds worldwide.',
    lore: 'Before the World Wind Sovereign, the air was still. She breathed life into the world with a single sigh.',
    traits: ['wind_ride', 'world_wind', 'season_weave', 'gale_call', 'grove_soul'],
  },

  // ── Bark Guardian Spirits (5) ─────────────────────────────
  {
    id: 'guardian_papery', name: 'Papery Sentinel', type: 'bark_guardian', rarity: 'common',
    friendshipPower: 15, wisdomPower: 10, naturePower: 8,
    description: 'A guardian formed from peeling birch bark sheets, clattering softly in the breeze.',
    lore: 'Papery Sentinels are the newest guardians, formed when birch bark peels in just the right pattern.',
    traits: ['bark_armor', 'peel_shield'],
  },
  {
    id: 'guardian_iron_bark', name: 'Iron Bark Warden', type: 'bark_guardian', rarity: 'uncommon',
    friendshipPower: 25, wisdomPower: 18, naturePower: 16,
    description: 'His bark has hardened to iron-like density after centuries of standing sentinel.',
    lore: 'The Iron Bark Warden once withstood a forest fire that lasted forty days. When the flames finally died, he did not have a single scorch mark.',
    traits: ['bark_armor', 'iron_hide', 'peel_shield'],
  },
  {
    id: 'guardian_rune_bark', name: 'Rune Bark Champion', type: 'bark_guardian', rarity: 'rare',
    friendshipPower: 42, wisdomPower: 38, naturePower: 36,
    description: 'Ancient runes are carved into his bark, glowing with protective magic when threatened.',
    lore: 'The runes on the Rune Bark Champion were carved by the first druids. Their meaning has been lost to time, but their power has not.',
    traits: ['bark_armor', 'rune_ward', 'iron_hide', 'peel_shield'],
  },
  {
    id: 'guardian_living_fortress', name: 'Living Fortress', type: 'bark_guardian', rarity: 'epic',
    friendshipPower: 65, wisdomPower: 55, naturePower: 60,
    description: 'A walking fortress of interlocking bark plates that can enclose and protect the entire grove.',
    lore: 'The Living Fortress is actually seven guardians merged into one. They chose union over individuality to better protect the grove.',
    traits: ['bark_armor', 'rune_ward', 'iron_hide', 'fortress_mode', 'peel_shield'],
  },
  {
    id: 'guardian_grove_wall', name: 'Grove Wall Titan', type: 'bark_guardian', rarity: 'legendary',
    friendshipPower: 98, wisdomPower: 85, naturePower: 92,
    description: 'His body IS the grove wall. When he sleeps, the trees grow to form an impenetrable barrier.',
    lore: 'The Grove Wall Titan does not walk. He IS the wall. The birch trees at the grove edge are his fingers, reaching toward the sky.',
    traits: ['bark_armor', 'grove_wall', 'rune_ward', 'iron_hide', 'fortress_mode'],
  },

  // ── Petal Dancer Spirits (5) ──────────────────────────────
  {
    id: 'dancer_snowdrop', name: 'Snowdrop Spinner', type: 'petal_dancer', rarity: 'common',
    friendshipPower: 10, wisdomPower: 8, naturePower: 12,
    description: 'A dancer made of snowdrop petals who signals the arrival of spring.',
    lore: 'When you see the first snowdrop of spring open, the Snowdrop Spinner has just finished her morning dance.',
    traits: ['petal_storm', 'spring_call'],
  },
  {
    id: 'dancer_cherry', name: 'Cherry Blossom Waltz', type: 'petal_dancer', rarity: 'uncommon',
    friendshipPower: 18, wisdomPower: 16, naturePower: 22,
    description: 'Her waltz creates blizzards of cherry petals that rejuvenate all they touch.',
    lore: 'The Cherry Blossom Waltz learned her dance from watching rivers flow. Her movements mimic water in every way.',
    traits: ['petal_storm', 'bloom_waltz', 'spring_call'],
  },
  {
    id: 'dancer_lotus', name: 'Lotus Rain Dancer', type: 'petal_dancer', rarity: 'rare',
    friendshipPower: 36, wisdomPower: 32, naturePower: 40,
    description: 'She dances in the rain, and every petal that falls becomes a perfect blooming lotus.',
    lore: 'The Lotus Rain Dancer only dances during thunderstorms. Lightning is her spotlight, thunder is her drumbeat.',
    traits: ['petal_storm', 'lotus_rain', 'bloom_waltz', 'spring_call'],
  },
  {
    id: 'dancer_moonflower', name: 'Moonflower Nocturne', type: 'petal_dancer', rarity: 'epic',
    friendshipPower: 56, wisdomPower: 62, naturePower: 54,
    description: 'She dances only under moonlight, and her petals absorb lunar energy to heal the grove.',
    lore: 'The Moonflower Nocturne can only be seen during a full moon, and only by those who truly believe in magic.',
    traits: ['petal_storm', 'moonlight_dance', 'lotus_rain', 'bloom_waltz', 'nocturnal'],
  },
  {
    id: 'dancer_eternal_bloom', name: 'Eternal Bloom Prima', type: 'petal_dancer', rarity: 'legendary',
    friendshipPower: 94, wisdomPower: 96, naturePower: 100,
    description: 'Her dance never ends. Wherever her petals fall, flowers bloom eternally, defying winter itself.',
    lore: 'The Eternal Bloom Prima has been dancing since the first flower opened. When she pauses — even for a heartbeat — winter falls.',
    traits: ['petal_storm', 'eternal_bloom', 'moonlight_dance', 'lotus_rain', 'grove_soul'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: BG_GROVES — 8 Grove Locations
// ═══════════════════════════════════════════════════════════════════

export const BG_GROVES: readonly BgGroveDef[] = [
  {
    id: 'grove_morning_clearing',
    name: 'Morning Clearing',
    description: 'A sun-drenched clearing where birch saplings stretch toward the first light of dawn.',
    lore: 'The Morning Clearing was the first place the druid planted a birch. Its soil contains the memory of that sacred moment.',
    fertility: 1, requiredTitle: 'bg_title_seedling',
    bgGradient: 'linear-gradient(180deg, #FAEBD7 0%, #228B22 50%, #6B8E23 100%)',
    ambientColor: BG_BIRCH_WHITE, spiritAffinity: 'birch_nymph',
  },
  {
    id: 'grove_moss_hollow',
    name: 'Moss Hollow',
    description: 'A sheltered depression carpeted in emerald moss, where mist lingers like living silk.',
    lore: 'No wind has ever entered Moss Hollow. The mist that fills it has been there since before the grove had a name.',
    fertility: 2, requiredTitle: 'bg_title_seedling',
    bgGradient: 'linear-gradient(180deg, #6B8E23 0%, #228B22 50%, #8B4513 100%)',
    ambientColor: BG_MOSS_GREEN, spiritAffinity: 'moss_treant',
  },
  {
    id: 'grove_root_cathedral',
    name: 'Root Cathedral',
    description: 'A natural cathedral formed by massive interlocking roots of ancient birch trees.',
    lore: 'The roots of Root Cathedral took five hundred years to weave together. It is said they did it on their own, seeking the shape of prayer.',
    fertility: 3, requiredTitle: 'bg_title_sapling',
    bgGradient: 'linear-gradient(180deg, #8B4513 0%, #6B8E23 50%, #FAEBD7 100%)',
    ambientColor: BG_BARK_BROWN, spiritAffinity: 'root_walker',
  },
  {
    id: 'grove_petal_meadow',
    name: 'Petal Meadow',
    description: 'A meadow where birch petals fall like perpetual snow, carpeting the ground in white and gold.',
    lore: 'The petal snow in Petal Meadow never melts. Visitors often collect petals as keepsakes that stay fresh forever.',
    fertility: 4, requiredTitle: 'bg_title_canopy',
    bgGradient: 'linear-gradient(180deg, #FAEBD7 0%, #FFBF00 50%, #228B22 100%)',
    ambientColor: BG_SAP_GOLD, spiritAffinity: 'petal_dancer',
  },
  {
    id: 'grove_twilight_pool',
    name: 'Twilight Pool',
    description: 'A reflective pool surrounded by silver birches, said to show visions of the spirit realm at dusk.',
    lore: 'If you gaze into Twilight Pool at the exact moment the sun sets, you will see not your reflection, but your spirit.',
    fertility: 5, requiredTitle: 'bg_title_warden',
    bgGradient: 'linear-gradient(180deg, #C0C0C0 0%, #228B22 50%, #8B4513 100%)',
    ambientColor: BG_MIST_SILVER, spiritAffinity: 'leaf_sylph',
  },
  {
    id: 'grove_ancient_ring',
    name: 'Ancient Ring',
    description: 'A perfect circle of the oldest birch trees, their roots forming a sacred protective ring.',
    lore: 'No one planted the Ancient Ring. The trees arranged themselves in a perfect circle over millennia, as if drawn by an invisible hand.',
    fertility: 6, requiredTitle: 'bg_title_druid',
    bgGradient: 'linear-gradient(180deg, #228B22 0%, #FAEBD7 50%, #6B8E23 100%)',
    ambientColor: BG_FOREST_GREEN, spiritAffinity: 'bark_guardian',
  },
  {
    id: 'grove_starlight_canopy',
    name: 'Starlight Canopy',
    description: 'Where the birch canopy thins, starlight pours through, nurturing nocturnal bloom spirits.',
    lore: 'On clear nights, the Starlight Canopy becomes the brightest place in the forest. Moths from miles away are drawn to its glow.',
    fertility: 7, requiredTitle: 'bg_title_elder',
    bgGradient: 'linear-gradient(180deg, #00A86B 0%, #C0C0C0 50%, #228B22 100%)',
    ambientColor: BG_LEAF_JADE, spiritAffinity: 'thorn_fairy',
  },
  {
    id: 'grove_world_heart',
    name: 'World Heart',
    description: 'The legendary heart of the birch grove, where the World Root pulses with the life of all forests.',
    lore: 'The World Heart beats once per century. When it does, every tree in the world grows exactly one inch taller.',
    fertility: 8, requiredTitle: 'bg_title_sage',
    bgGradient: 'linear-gradient(180deg, #8B4513 0%, #DAA520 50%, #228B22 100%)',
    ambientColor: BG_TWILIGHT_AMBER, spiritAffinity: 'birch_nymph',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: SPIRIT TYPE SYNERGY TABLE
// ═══════════════════════════════════════════════════════════════════

const BG_SPIRIT_SYNERGY: Record<BgSpiritType, BgSpiritType[]> = {
  birch_nymph: ['leaf_sylph', 'petal_dancer'],
  moss_treant: ['root_walker', 'bark_guardian'],
  thorn_fairy: ['bark_guardian', 'moss_treant'],
  root_walker: ['moss_treant', 'thorn_fairy'],
  leaf_sylph: ['birch_nymph', 'petal_dancer'],
  bark_guardian: ['thorn_fairy', 'root_walker'],
  petal_dancer: ['birch_nymph', 'leaf_sylph'],
}

export function bgCheckSpiritSynergy(
  typeA: BgSpiritType,
  typeB: BgSpiritType
): number {
  if (typeA === typeB) return 0
  if (BG_SPIRIT_SYNERGY[typeA]?.includes(typeB)) return 0.25
  return 0
}

export function bgGetGroveSpiritBonus(
  groveId: string,
  spiritType: BgSpiritType
): number {
  const grove = bgFindGrove(groveId)
  if (!grove) return 0
  if (grove.spiritAffinity === spiritType) return 0.5
  return 0
}

export function bgSpiritsInRange(
  spiritId: string,
  allSpirits: BgSpiritInstance[],
  range: number = 3
): BgSpiritInstance[] {
  const target = bgFindSpirit(spiritId)
  if (!target) return []
  return allSpirits.filter((s) => {
    if (s.spiritId === spiritId) return false
    const def = bgFindSpirit(s.spiritId)
    if (!def) return false
    return bgCheckSpiritSynergy(target.type, def.type) > 0
  }).slice(0, range)
}

export function bgCalculateFriendshipRate(
  spiritDef: BgSpiritDef,
  structureEffect: number,
  artifactBoost: number,
  groveBonus: number
): number {
  const base = 1
  const rarityMod = bgRarityMultiplier(spiritDef.rarity)
  const structMod = 1 + structureEffect * 0.05
  const artifactMod = 1 + artifactBoost * 0.01
  const groveMod = 1 + groveBonus * 0.1
  return Math.floor(base * rarityMod * structMod * artifactMod * groveMod * 10) / 10
}

export function bgCalculateBuildCost(
  def: BgStructureDef,
  currentLevel: number,
  ownedCount: number
): number {
  const baseCost = bgStructureUpgradeCost(def, currentLevel)
  const volumeDiscount = Math.max(0.7, 1 - ownedCount * 0.01)
  return Math.floor(baseCost * volumeDiscount)
}

export function bgValidateGroveAccess(
  groveId: string,
  currentTitle: BgTitleId
): { canAccess: boolean; reason: string } {
  const grove = bgFindGrove(groveId)
  if (!grove) return { canAccess: false, reason: 'Grove not found.' }
  const requiredIdx = BG_TITLES.findIndex((t) => t.id === grove.requiredTitle)
  const currentIdx = BG_TITLES.findIndex((t) => t.id === currentTitle)
  if (currentIdx < requiredIdx) {
    const requiredTitle = BG_TITLES[requiredIdx]
    return { canAccess: false, reason: `Requires the ${requiredTitle.name} title.` }
  }
  return { canAccess: true, reason: '' }
}

export function bgGetEventEffectValue(
  event: BgEventDef): number {
  switch (event.effectType) {
    case 'buff': return event.durationTurns * 10
    case 'debuff': return -event.durationTurns * 8
    case 'special': return event.durationTurns * 15
    default: return 0
  }
}

export function bgFormatRarityLabel(r: BgRarity): string {
  const labels: Record<BgRarity, string> = {
    common: 'Common',
    uncommon: 'Uncommon',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
  }
  return labels[r] ?? r
}

export function bgGetSpiritTypeEmoji(t: BgSpiritType): string {
  const found = BG_SPIRIT_TYPES.find((st) => st.id === t)
  return found?.emoji ?? '❓'
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: BG_MATERIALS — 30 Wood/Bloom Materials
// ═══════════════════════════════════════════════════════════════════

export const BG_MATERIALS: readonly BgMaterialDef[] = [
  // Common (8)
  { id: 'mat_birch_sap', name: 'Birch Sap Drop', emoji: '💧', type: 'wood', rarity: 'common', friendshipBonus: 2, wisdomBonus: 1, value: 10,
    description: 'Sweet sap collected from a paper birch at dawn.', lore: 'Birch sap was the first medicine known to the druids. They called it the white blood of the forest.' },
  { id: 'mat_white_bark', name: 'White Birch Bark', emoji: '🤍', type: 'bark', rarity: 'common', friendshipBonus: 3, wisdomBonus: 0, value: 12,
    description: 'Smooth white bark shed naturally by birch trees.', lore: 'Birch bark was used to write the first spells. The smooth surface was perfect for inscribing runes.' },
  { id: 'mat_moss_cushion', name: 'Moss Cushion Sample', emoji: '🟢', type: 'bloom', rarity: 'common', friendshipBonus: 1, wisdomBonus: 3, value: 11,
    description: 'Soft green moss that spirits love to rest upon.', lore: 'Spirits have been resting on moss cushions since before humans discovered fire.' },
  { id: 'mat_maple_leaf', name: 'Fallen Maple Leaf', emoji: '🍁', type: 'bloom', rarity: 'common', friendshipBonus: 2, wisdomBonus: 2, value: 13,
    description: 'A vibrant red maple leaf from the grove edge.', lore: 'Maple leaves that fall in the birch grove are considered messages from neighboring forests.' },
  { id: 'mat_acorn_cap', name: 'Acorn Cap', emoji: '🌰', type: 'wood', rarity: 'common', friendshipBonus: 3, wisdomBonus: 1, value: 14,
    description: 'Tiny cap of an acorn, polished by fairy hands.', lore: 'Thorn fairies use acorn caps as tiny bowls for their celebrations.' },
  { id: 'mat_pine_needle', name: 'Pine Needle Bundle', emoji: '🌲', type: 'bloom', rarity: 'common', friendshipBonus: 1, wisdomBonus: 4, value: 12,
    description: 'Bundle of fragrant pine needles for cleansing rituals.', lore: 'Burning pine needles at the grove entrance was the traditional way to announce a visitor.' },
  { id: 'mat_dewdrop_gem', name: 'Morning Dewdrop', emoji: '💎', type: 'essence', rarity: 'common', friendshipBonus: 4, wisdomBonus: 0, value: 15,
    description: 'A perfectly formed dewdrop refracting rainbow light.', lore: 'No two morning dewdrops are alike. Each contains a unique microcosm of the grove within its surface tension.' },
  { id: 'mat_cedar_shaving', name: 'Cedar Shaving', emoji: '🪵', type: 'bark', rarity: 'common', friendshipBonus: 2, wisdomBonus: 2, value: 11,
    description: 'Aromatic cedar shavings that calm restless spirits.', lore: 'A sachet of cedar shavings under a pillow guarantees dreamless sleep, say the moss treants.' },

  // Uncommon (7)
  { id: 'mat_birch_heartwood', name: 'Birch Heartwood Chip', emoji: '🟤', type: 'wood', rarity: 'uncommon', friendshipBonus: 8, wisdomBonus: 5, value: 80,
    description: 'A chip from the heartwood of an ancient birch.', lore: 'Heartwood chips contain the concentrated memory of centuries. Moss treants sometimes use them as books.' },
  { id: 'mat_fairy_ring_moss', name: 'Fairy Ring Moss', emoji: '🧚', type: 'bloom', rarity: 'uncommon', friendshipBonus: 6, wisdomBonus: 10, value: 85,
    description: 'Moss that grows only in fairy rings.', lore: 'Fairy ring moss glows at midnight. If you lie down in a fairy ring and close your eyes, you will hear fairy music.' },
  { id: 'mat_thorn_honey', name: 'Thorn Honey Vial', emoji: '🍯', type: 'resin', rarity: 'uncommon', friendshipBonus: 10, wisdomBonus: 6, value: 88,
    description: 'Golden honey from flowers protected by thorn barriers.', lore: 'Thorn honey never crystallizes. It flows like liquid gold forever, no matter how old it gets.' },
  { id: 'mat_root_vine', name: 'Living Root Vine', emoji: '🌿', type: 'wood', rarity: 'uncommon', friendshipBonus: 7, wisdomBonus: 8, value: 82,
    description: 'A vine harvested from the root network that continues growing.', lore: 'Root walkers cultivate these vines as rope. They are stronger than steel and lighter than silk.' },
  { id: 'mat_birch_resin', name: 'Birch Resin Drop', emoji: '🔶', type: 'resin', rarity: 'uncommon', friendshipBonus: 9, wisdomBonus: 7, value: 78,
    description: 'Amber-colored resin from paper birch bark.', lore: 'Birch resin can preserve anything perfectly. Insects trapped in it remain alive in a state of suspended animation.' },
  { id: 'mat_petal_snow', name: 'Petal Snow Sample', emoji: '🌸', type: 'bloom', rarity: 'uncommon', friendshipBonus: 5, wisdomBonus: 11, value: 90,
    description: 'A preserved sample of the eternal petal snow.', lore: 'Each petal in the petal snow has a different fragrance. Collecting all scents is a rite of passage for sylphs.' },
  { id: 'mat_moonlight_moss', name: 'Moonlight Moss', emoji: '🌙', type: 'bloom', rarity: 'uncommon', friendshipBonus: 8, wisdomBonus: 8, value: 75,
    description: 'Moss that absorbs moonlight and glows until dawn.', lore: 'Moonlight moss is used by petal dancers to light their nocturnal performances. It is the grove natural lantern.' },

  // Rare (6)
  { id: 'mat_ancient_sap', name: 'Ancient Sap Crystal', emoji: '💎', type: 'resin', rarity: 'rare', friendshipBonus: 15, wisdomBonus: 18, value: 350,
    description: 'Birch sap fossilized into luminous crystal.', lore: 'Ancient sap crystals are the only known material that can store pure moonlight for later use.' },
  { id: 'mat_world_bark', name: 'World Bark Fragment', emoji: '🌍', type: 'bark', rarity: 'rare', friendshipBonus: 20, wisdomBonus: 12, value: 380,
    description: 'A fragment of bark from the World Birch, still pulsing.', lore: 'World bark fragments are warm to the touch. They pulse with a rhythm that matches the holder heartbeat.' },
  { id: 'mat_root_pearl', name: 'Root Pearl', emoji: '🫧', type: 'essence', rarity: 'rare', friendshipBonus: 12, wisdomBonus: 22, value: 360,
    description: 'A pearl formed within the root network over centuries.', lore: 'Root pearls take five hundred years to form. Each contains the compressed wisdom of a thousand root walker journeys.' },
  { id: 'mat_thorn_crown', name: 'Thorn Crown Shard', emoji: '👑', type: 'resin', rarity: 'rare', friendshipBonus: 18, wisdomBonus: 15, value: 340,
    description: 'A shard from the crown of the Thorn Empress.', lore: 'The Thorn Crown was forged from seven thorns, each from a different continent. Its barrier magic is absolute.' },
  { id: 'mat_wind_silk', name: 'Wind Silk Thread', emoji: '🧶', type: 'essence', rarity: 'rare', friendshipBonus: 14, wisdomBonus: 20, value: 400,
    description: 'Silk spun by leaf sylphs from captured wind.', lore: 'A single thread of wind silk can support a hundred pounds. Sylphs weave it into garments lighter than air.' },
  { id: 'mat_bloom_essence', name: 'Bloom Essence', emoji: '✨', type: 'essence', rarity: 'rare', friendshipBonus: 16, wisdomBonus: 16, value: 320,
    description: 'Pure essence from a thousand blooming flowers.', lore: 'One drop of bloom essence can make a dead field burst into flower. Petal dancers consider it their most precious gift.' },

  // Epic (5)
  { id: 'mat_grove_heart', name: 'Grove Heart Amber', emoji: '🔥', type: 'resin', rarity: 'epic', friendshipBonus: 30, wisdomBonus: 28, value: 1500,
    description: 'Amber containing the heartbeat of the grove.', lore: 'The Grove Heart Amber was formed when the Primordial Oak shed a tear of joy. It still beats.' },
  { id: 'mat_spirit_resin', name: 'Spirit Resin Tear', emoji: '💧', type: 'resin', rarity: 'epic', friendshipBonus: 25, wisdomBonus: 35, value: 1600,
    description: 'A tear of crystallized resin shed by a guardian spirit.', lore: 'Spirit resin is the most potent magical adhesive known. It can bond anything, even concepts.' },
  { id: 'mat_ancient_petal', name: 'Eternal Petal', emoji: '🌺', type: 'bloom', rarity: 'epic', friendshipBonus: 28, wisdomBonus: 25, value: 1700,
    description: 'A petal that never wilts or fades, preserved by the Eternal Bloom Prima.', lore: 'The Eternal Petal is the only proof that the Prima has danced in a particular place. She leaves one wherever she performs.' },
  { id: 'mat_root_star', name: 'Root Star Crystal', emoji: '⭐', type: 'essence', rarity: 'epic', friendshipBonus: 22, wisdomBonus: 32, value: 1400,
    description: 'A crystal formed at the intersection of three root networks.', lore: 'Root star crystals are navigation tools for root walkers. Pointing one toward the World Root always works.' },
  { id: 'mat_bark_rune', name: 'Rune Bark Tablet', emoji: '📜', type: 'bark', rarity: 'epic', friendshipBonus: 35, wisdomBonus: 20, value: 1800,
    description: 'Ancient bark inscribed with runes of power.', lore: 'The Rune Bark Tablet contains spells that even the World Birch Nymph does not know. It predates the nymph herself.' },

  // Legendary (4)
  { id: 'mat_world_tree_sap', name: 'World Tree Sap Vial', emoji: '🌳', type: 'resin', rarity: 'legendary', friendshipBonus: 50, wisdomBonus: 50, value: 8000,
    description: 'A single vial of sap from the World Tree.', lore: 'World Tree Sap can resurrect any withered spirit bond. It is the single most valuable substance in the birch grove.' },
  { id: 'mat_primordial_seed', name: 'Primordial Seed', emoji: '🌱', type: 'wood', rarity: 'legendary', friendshipBonus: 45, wisdomBonus: 60, value: 9500,
    description: 'The seed from which the first birch tree grew.', lore: 'The Primordial Seed is not from this world. It fell from the sky in a meteor of pure white light, aeons ago.' },
  { id: 'mat_grove_soul_gem', name: 'Grove Soul Gem', emoji: '💠', type: 'essence', rarity: 'legendary', friendshipBonus: 55, wisdomBonus: 45, value: 10000,
    description: 'A gem containing the collective soul of every spirit.', lore: 'The Grove Soul Gem was formed when every spirit in the grove cried out simultaneously. Their tears merged into this single gemstone.' },
  { id: 'mat_eternal_bark', name: 'Eternal Bark Shard', emoji: '🛡️', type: 'bark', rarity: 'legendary', friendshipBonus: 40, wisdomBonus: 55, value: 12000,
    description: 'Bark from the Grove Wall Titan, literally indestructible.', lore: 'Eternal Bark cannot be cut, burned, dissolved, or broken by any known force. It simply is, and always will be.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: BG_STRUCTURES — 25 Structures (upgradeable to lv10)
// ═══════════════════════════════════════════════════════════════════

export const BG_STRUCTURES: readonly BgStructureDef[] = [
  // ── Shrines (7) ────────────────────────────────────────────
  { id: 'str_sap_shrine', name: 'Sap Offering Shrine', emoji: '⛩️', category: 'shrine', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4,
    description: 'A simple stone shrine where birch sap is offered to spirits.', lore: 'The Sap Offering Shrine was the first structure built in the grove. Its stones still bear the druid fingerprints.' },
  { id: 'str_bark_altar', name: 'Bark Altar', emoji: '🪨', category: 'shrine', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 80, costMultiplier: 1.5,
    description: 'An altar of interlocking bark that amplifies nature power.', lore: 'The Bark Altar hums with a low frequency that only spirits can hear. It is the grove tuning fork.' },
  { id: 'str_moss_sanctuary', name: 'Moss Sanctuary', emoji: '🌿', category: 'shrine', maxLevel: 10, baseEffect: 3, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.5,
    description: 'A sanctuary of living moss where wounded spirits rest.', lore: 'The moss in the sanctuary is a hybrid of all seven moss types found in the grove, carefully cultivated over centuries.' },
  { id: 'str_petal_shrine', name: 'Petal Bloom Shrine', emoji: '🌸', category: 'shrine', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 150, costMultiplier: 1.5,
    description: 'A perpetually blooming shrine that boosts petal dancer spirits.', lore: 'The Petal Bloom Shrine is maintained by the Eternal Bloom Prima herself. She visits it every night to add fresh petals.' },
  { id: 'str_root_shrine', name: 'Root Meditation Shrine', emoji: '🌳', category: 'shrine', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 180, costMultiplier: 1.6,
    description: 'Built atop a massive root, granting wisdom to meditating spirits.', lore: 'Sitting on the Root Meditation Shrine lets you hear every tree that has ever grown in the grove, all at once.' },
  { id: 'str_thorn_shrine', name: 'Thorn Ward Shrine', emoji: '🛡️', category: 'shrine', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 160, costMultiplier: 1.5,
    description: 'Protected by living thorns, enhancing defensive abilities.', lore: 'The thorns around this shrine are the offspring of the World Thorn Empress own barrier. They are her daughters.' },
  { id: 'str_world_shrine', name: 'World Heart Shrine', emoji: '🌍', category: 'shrine', maxLevel: 10, baseEffect: 6, effectPerLevel: 3, baseCost: 300, costMultiplier: 1.7,
    description: 'The supreme shrine boosting all spirit types equally.', lore: 'The World Heart Shrine is built directly above the World Root. Its foundation is the heartbeat of the earth itself.' },

  // ── Bridges (6) ────────────────────────────────────────────
  { id: 'str_log_bridge', name: 'Birch Log Bridge', emoji: '🌉', category: 'bridge', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 40, costMultiplier: 1.3,
    description: 'A simple log bridge connecting distant glades.', lore: 'The Birch Log Bridge was felled in a single night by the Primordial Oak. He wanted visitors to feel welcome.' },
  { id: 'str_vine_bridge', name: 'Living Vine Bridge', emoji: '🌿', category: 'bridge', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 70, costMultiplier: 1.4,
    description: 'A bridge of living vines that repairs itself.', lore: 'If you cut the Living Vine Bridge, it regrows overnight. Cutting it is considered extremely rude by the spirits.' },
  { id: 'str_root_bridge', name: 'Root Arch Bridge', emoji: '🌈', category: 'bridge', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 110, costMultiplier: 1.5,
    description: 'An elegant arch of ancient roots used by root walkers.', lore: 'The Root Arch Bridge was not built — it grew. Root walkers guided the roots over the stream for three hundred years.' },
  { id: 'str_moss_bridge', name: 'Moss Carpet Bridge', emoji: '🟢', category: 'bridge', maxLevel: 10, baseEffect: 3, effectPerLevel: 2, baseCost: 90, costMultiplier: 1.4,
    description: 'A bridge carpeted in soft moss strengthening treants.', lore: 'Walking on the Moss Carpet Bridge makes you feel like you are walking on the softest cloud. Moss treants sometimes nap on it.' },
  { id: 'str_petal_bridge', name: 'Petal Rainbow Bridge', emoji: '🌈', category: 'bridge', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 140, costMultiplier: 1.5,
    description: 'A bridge of layered petals shimmering like a rainbow.', lore: 'The Petal Rainbow Bridge is rebuilt every morning by leaf sylphs. By noon it is at its most beautiful. By evening, it is gone.' },
  { id: 'str_spirit_bridge', name: 'Spirit Realm Bridge', emoji: '✨', category: 'bridge', maxLevel: 10, baseEffect: 6, effectPerLevel: 3, baseCost: 200, costMultiplier: 1.6,
    description: 'A bridge phasing between material and spirit realms.', lore: 'The Spirit Realm Bridge exists in two worlds simultaneously. Mortals see a shimmer. Spirits see a highway of light.' },

  // ── Canopies (6) ───────────────────────────────────────────
  { id: 'str_leaf_canopy', name: 'Leaf Shade Canopy', emoji: '🍃', category: 'canopy', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 60, costMultiplier: 1.4,
    description: 'A canopy of woven leaves providing dappled shade.', lore: 'The Leaf Shade Canopy was the first shelter built for visiting spirits. Before it, they stood in the rain.' },
  { id: 'str_birch_canopy', name: 'Birch Bark Canopy', emoji: '🌳', category: 'canopy', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 90, costMultiplier: 1.4,
    description: 'Waterproof canopy of overlapping birch bark sheets.', lore: 'The Birch Bark Canopy is completely silent during rain. The bark absorbs every sound of falling water.' },
  { id: 'str_vine_canopy', name: 'Hanging Vine Canopy', emoji: '🌿', category: 'canopy', maxLevel: 10, baseEffect: 3, effectPerLevel: 2, baseCost: 100, costMultiplier: 1.5,
    description: 'Living canopy of hanging vines filtering rainwater.', lore: 'Droplets that fall through the Hanging Vine Canopy are purified seven times. The water below is the purest in the world.' },
  { id: 'str_moss_canopy', name: 'Moss Drape Canopy', emoji: '🟢', category: 'canopy', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 130, costMultiplier: 1.5,
    description: 'Thick moss drapes purifying air and creating healing atmosphere.', lore: 'Breathing beneath the Moss Drape Canopy for one hour is equivalent to a full night of sleep.' },
  { id: 'str_petal_canopy', name: 'Petal Veil Canopy', emoji: '🌸', category: 'canopy', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 160, costMultiplier: 1.5,
    description: 'Translucent petal veil creating mesmerizing light patterns.', lore: 'The patterns cast by the Petal Veil Canopy change with the seasons. In spring they show flowers. In winter, snowflakes.' },
  { id: 'str_starlight_canopy', name: 'Starlight Glass Canopy', emoji: '⭐', category: 'canopy', maxLevel: 10, baseEffect: 6, effectPerLevel: 3, baseCost: 220, costMultiplier: 1.6,
    description: 'Crystal canopy capturing and distributing starlight.', lore: 'On clear nights, the Starlight Glass Canopy focuses starlight into beams that nourish the grove like liquid sunshine.' },

  // ── Root Dens (3) ──────────────────────────────────────────
  { id: 'str_shallow_den', name: 'Shallow Root Den', emoji: '🕳️', category: 'root_den', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4,
    description: 'A shallow den among surface roots for common spirits.', lore: 'The Shallow Root Den is warm in winter and cool in summer. Root walkers maintain a constant temperature using underground water flows.' },
  { id: 'str_deep_den', name: 'Deep Root Den', emoji: '🕳️', category: 'root_den', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.5,
    description: 'A deep underground chamber for root walker passage.', lore: 'The Deep Root Den connects to the root highway network. From here, a root walker can reach any grove in the world.' },
  { id: 'str_heart_den', name: 'Heart Root Den', emoji: '❤️', category: 'root_den', maxLevel: 10, baseEffect: 6, effectPerLevel: 3, baseCost: 200, costMultiplier: 1.6,
    description: 'The heart of the root network accelerating friendships.', lore: 'In the Heart Root Den, time moves differently. One hour inside equals one day of friendship growth outside.' },

  // ── Ponds (3) ──────────────────────────────────────────────
  { id: 'str_birch_pool', name: 'Birch Reflection Pool', emoji: '💧', category: 'pond', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 70, costMultiplier: 1.4,
    description: 'A still pool at the base of a birch tree for wisdom.', lore: 'The Birch Reflection Pool does not show your face. It shows you the face you will have in the spirit world.' },
  { id: 'str_spirit_spring', name: 'Spirit Spring', emoji: '🌊', category: 'pond', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 130, costMultiplier: 1.5,
    description: 'A spring fed by underground spirit channels.', lore: 'The Spirit Spring water tastes different to each person. To some it is sweet, to others bitter, but it always heals.' },
  { id: 'str_world_pool', name: 'World Reflection Pool', emoji: '🌍', category: 'pond', maxLevel: 10, baseEffect: 7, effectPerLevel: 3, baseCost: 250, costMultiplier: 1.7,
    description: 'A pool reflecting not the sky, but visions of distant groves.', lore: 'The World Reflection Pool shows groves that have been, groves that are, and groves that could be. It is a window into possibility.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: BG_ABILITIES — 22 Nature Abilities
// ═══════════════════════════════════════════════════════════════════

export const BG_ABILITIES: readonly BgAbilityDef[] = [
  // Common (5)
  { id: 'ab_sap_blessing', name: 'Sap Blessing', emoji: '💧', spiritType: 'birch_nymph', type: 'active', rarity: 'common', energyCost: 8, cooldown: 5, power: 10,
    description: 'Anoint a spirit with sacred birch sap, boosting friendship.', lore: 'The sap blessing was the first ability taught to the first nymph. It has been passed down unchanged.' },
  { id: 'ab_moss_armor', name: 'Moss Armor', emoji: '🟢', spiritType: 'moss_treant', type: 'active', rarity: 'common', energyCost: 10, cooldown: 8, power: 12,
    description: 'Encase a spirit in protective moss absorbing damage.', lore: 'Moss Armor makes you look like a walking garden. Enemies often underestimate you until it is too late.' },
  { id: 'ab_thorn_wall', name: 'Thorn Wall', emoji: '🛡️', spiritType: 'thorn_fairy', type: 'active', rarity: 'common', energyCost: 12, cooldown: 10, power: 15,
    description: 'Summon a wall of living thorns to block threats.', lore: 'The Thorn Wall is the thorn fairy signature move. Even the Empress herself uses a variation of it.' },
  { id: 'ab_root_sense', name: 'Root Sense', emoji: '🌾', spiritType: 'root_walker', type: 'passive', rarity: 'common', energyCost: 5, cooldown: 20, power: 8,
    description: 'Sense vibrations through root networks.', lore: 'Root Sense lets you feel every footstep within a mile. Root walkers consider it as natural as breathing.' },
  { id: 'ab_leaf_whisper', name: 'Leaf Whisper', emoji: '🍃', spiritType: 'leaf_sylph', type: 'active', rarity: 'common', energyCost: 6, cooldown: 3, power: 10,
    description: 'Whisper through leaves to communicate across the grove.', lore: 'The Leaf Whisper travels at the speed of wind. It is the fastest form of communication in the spirit world.' },

  // Uncommon (5)
  { id: 'ab_bark_shield', name: 'Bark Shield', emoji: '🛡️', spiritType: 'bark_guardian', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 12, power: 20,
    description: 'Form a shield of hardened birch bark deflecting hostile magic.', lore: 'The Bark Shield technique was invented by the first bark guardian. It has never been improved upon because it is already perfect.' },
  { id: 'ab_petal_storm', name: 'Petal Storm', emoji: '🌸', spiritType: 'petal_dancer', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 15, power: 22,
    description: 'Summon a storm of razor-sharp petals.', lore: 'The Petal Storm is beautiful and deadly in equal measure. Its victims often do not realize they have been cut until they try to move.' },
  { id: 'ab_sap_gush', name: 'Sap Gush', emoji: '🤎', spiritType: 'birch_nymph', type: 'active', rarity: 'uncommon', energyCost: 14, cooldown: 10, power: 18,
    description: 'Release enchanted sap that entangles and heals.', lore: 'The Sap Gush is sticky, sweet, and impossible to remove for twenty-four hours. Thieves dread it.' },
  { id: 'ab_root_bind', name: 'Root Bind', emoji: '🌿', spiritType: 'root_walker', type: 'active', rarity: 'uncommon', energyCost: 16, cooldown: 12, power: 20,
    description: 'Command roots to erupt from the ground binding all targets.', lore: 'Root Bind is non-lethal but utterly inescapable. Even the World Thorn Empress cannot pierce root bindings.' },
  { id: 'ab_wind_call', name: 'Wind Call', emoji: '💨', spiritType: 'leaf_sylph', type: 'active', rarity: 'uncommon', energyCost: 12, cooldown: 8, power: 18,
    description: 'Call upon the wind to carry spirits swiftly.', lore: 'The Wind Call can summon any wind, from a gentle breeze to a howling gale. The skill is in choosing which one.' },

  // Rare (4)
  { id: 'ab_thorn_rose', name: 'Rose Thorn Barrage', emoji: '🌹', spiritType: 'thorn_fairy', type: 'active', rarity: 'rare', energyCost: 25, cooldown: 20, power: 35,
    description: 'Launch enchanted rose thorns that seek out threats.', lore: 'The Rose Thorn Barrage never misses. Each thorn finds its target by sensing hostility. The more hostile you are, the faster it flies.' },
  { id: 'ab_moss_regen', name: 'Moss Regeneration', emoji: '💚', spiritType: 'moss_treant', type: 'passive', rarity: 'rare', energyCost: 0, cooldown: 60, power: 30,
    description: 'All friendly spirits slowly regenerate health from moss energy.', lore: 'Moss Regeneration works by turning the concept of damage into new moss. Where there is injury, moss grows.' },
  { id: 'ab_bark_fortress', name: 'Bark Fortress', emoji: '🏰', spiritType: 'bark_guardian', type: 'active', rarity: 'rare', energyCost: 30, cooldown: 30, power: 40,
    description: 'Transform into an immobile fortress of interlocking bark.', lore: 'The Bark Fortress is invincible. The trade-off is that you cannot move, eat, or sleep while in fortress form.' },
  { id: 'ab_sap_life', name: 'Sap of Life', emoji: '💚', spiritType: 'birch_nymph', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 25, power: 38,
    description: 'Restore a fallen spirit to full vitality with sacred sap.', lore: 'The Sap of Life can bring back spirits that have been gone for centuries. They return exactly as they were, with no memory of absence.' },

  // Epic (4)
  { id: 'ab_world_root', name: 'World Root Call', emoji: '🌍', spiritType: 'root_walker', type: 'active', rarity: 'epic', energyCost: 50, cooldown: 60, power: 55,
    description: 'Channel the World Root network to summon distant reinforcements.', lore: 'When the World Root Call sounds, every root walker within a thousand miles feels it. Most answer. None refuse.' },
  { id: 'ab_eternal_petal', name: 'Eternal Petal Dance', emoji: '🌺', spiritType: 'petal_dancer', type: 'active', rarity: 'epic', energyCost: 45, cooldown: 45, power: 50,
    description: 'Perform the Eternal Dance making all spirits temporarily invincible.', lore: 'During the Eternal Petal Dance, you can see the spirits of every petal that has ever fallen in the grove, dancing alongside you.' },
  { id: 'ab_thorn_world', name: 'World Thorn Barrier', emoji: '🌍', spiritType: 'thorn_fairy', type: 'active', rarity: 'epic', energyCost: 55, cooldown: 90, power: 60,
    description: 'Raise a barrier of thorns visible from the spirit realm.', lore: 'The World Thorn Barrier has been raised exactly four times in history. It has fallen exactly zero times.' },
  { id: 'ab_moss_ancient', name: 'Ancient Moss Awakening', emoji: '🌿', spiritType: 'moss_treant', type: 'active', rarity: 'epic', energyCost: 48, cooldown: 50, power: 52,
    description: 'Awaken ancient moss creating an army of moss constructs.', lore: 'The Ancient Moss Awakening summons moss that has been dormant since the last ice age. It is VERY grumpy about being woken up.' },

  // Legendary (4)
  { id: 'ab_birch_rebirth', name: 'Birch Rebirth', emoji: '🌳', spiritType: 'birch_nymph', type: 'active', rarity: 'legendary', energyCost: 100, cooldown: 180, power: 100,
    description: 'Resurrect all fallen spirits and regrow the entire grove.', lore: 'The Birch Rebirth has been used only once. It created the grove as it exists today from a field of ash and ruin.' },
  { id: 'ab_root_cataclysm', name: 'Root Cataclysm', emoji: '🌋', spiritType: 'root_walker', type: 'active', rarity: 'legendary', energyCost: 120, cooldown: 300, power: 120,
    description: 'Unleash the full fury of the root network, reshaping the land.', lore: 'The Root Cataclysm is forbidden. The last time it was used, an entire mountain range was flattened in seconds.' },
  { id: 'ab_petal_eternity', name: 'Petal Eternity', emoji: '🌸', spiritType: 'petal_dancer', type: 'active', rarity: 'legendary', energyCost: 100, cooldown: 240, power: 110,
    description: 'Cast an eternal petal storm making the grove immune to all harm.', lore: 'Petal Eternity is the counter to Root Cataclysm. While it lasts, nothing can damage the grove. Nothing. Not even time.' },
  { id: 'ab_grove_soul', name: 'Grove Soul Ascension', emoji: '✨', spiritType: 'bark_guardian', type: 'active', rarity: 'legendary', energyCost: 150, cooldown: 600, power: 150,
    description: 'Merge with the grove itself, becoming one with every tree and spirit.', lore: 'Grove Soul Ascension grants ultimate power but costs your individual identity. You become the grove. The grove becomes you.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: BG_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const BG_ACHIEVEMENTS: readonly BgAchievementDef[] = [
  { id: 'ach_first_friend', name: 'First Friendship', emoji: '🤝', description: 'Befriend your first grove spirit.',
    lore: 'Every journey begins with a single act of kindness toward the unseen.', condition: 'befriend_5', reward: { bark: 50, renown: 20 } },
  { id: 'ach_five_spirits', name: 'Spirit Circle', emoji: '⭕', description: 'Befriend 5 grove spirits.',
    lore: 'Five spirits form a circle. In the grove, circles are sacred.', condition: 'befriend_5', reward: { bark: 100, renown: 50 } },
  { id: 'ach_ten_spirits', name: 'Gathering Force', emoji: '🌲', description: 'Befriend 10 grove spirits.',
    lore: 'Ten spirits can sense each other from across the grove. They are becoming a community.', condition: 'befriend_10', reward: { bark: 200, renown: 120 } },
  { id: 'ach_twenty_spirits', name: 'Spirit Horde', emoji: '🌳', description: 'Befriend 20 grove spirits.',
    lore: 'Twenty spirits make the trees themselves lean closer, drawn by the collective warmth of friendship.', condition: 'befriend_20', reward: { bark: 500, renown: 300 } },
  { id: 'ach_all_spirits', name: 'Complete Collection', emoji: '👑', description: 'Befriend all 35 grove spirits.',
    lore: 'You have befriended every spirit. The grove is whole. This is the greatest achievement of any tender.', condition: 'befriend_35', reward: { bark: 2000, renown: 1000 } },
  { id: 'ach_fifty_tends', name: 'Dedicated Tender', emoji: '🌱', description: 'Tend groves 50 times.',
    lore: 'Fifty times you have knelt in the soil and whispered to the roots. The earth remembers your hands.', condition: 'tend_50', reward: { bark: 150, renown: 80 } },
  { id: 'ach_hundred_tends', name: 'Grove Devotee', emoji: '🌿', description: 'Tend groves 100 times.',
    lore: 'One hundred tendings. The moss on your knees has started to grow. You are becoming part of the grove.', condition: 'tend_100', reward: { bark: 400, renown: 200 } },
  { id: 'ach_ten_builds', name: 'Apprentice Builder', emoji: '🔨', description: 'Build 10 structures.',
    lore: 'The grove grows not just with nature, but with intention. Your structures are proof of that intention.', condition: 'build_10', reward: { bark: 200, renown: 100 } },
  { id: 'ach_all_builds', name: 'Master Architect', emoji: '🏗️', description: 'Build all 25 structures.',
    lore: 'Twenty-five structures. The grove is now a city of living wood and breathing stone. Your masterpiece.', condition: 'build_25', reward: { bark: 1500, renown: 800 } },
  { id: 'ach_five_artifacts', name: 'Artifact Collector', emoji: '🏺', description: 'Collect 5 ancient artifacts.',
    lore: 'Five artifacts from five ages. Each one whispers a different story of the grove past.', condition: 'artifact_5', reward: { bark: 300, renown: 150 } },
  { id: 'ach_all_artifacts', name: 'Relic Hoarder', emoji: '💎', description: 'Collect all 15 artifacts.',
    lore: 'Fifteen artifacts of immeasurable power. You hold the history of the birch grove in your hands.', condition: 'artifact_15', reward: { bark: 3000, renown: 1500 } },
  { id: 'ach_renown_500', name: 'Rising Star', emoji: '⭐', description: 'Reach 500 renown.',
    lore: 'Five hundred renown. The spirits whisper your name to the wind. The wind carries it to distant groves.', condition: 'renown_500', reward: { bark: 250, renown: 0 } },
  { id: 'ach_renown_2000', name: 'Grove Legend', emoji: '🌟', description: 'Reach 2000 renown.',
    lore: 'Two thousand renown. Songs are being composed about you. The moss treants are writing ballads.', condition: 'renown_2000', reward: { bark: 800, renown: 0 } },
  { id: 'ach_renown_5000', name: 'Birch Deity', emoji: '👑', description: 'Reach 5000 renown.',
    lore: 'Five thousand renown. You are no longer a visitor to the grove. You ARE the grove. There is no difference.', condition: 'renown_5000', reward: { bark: 2000, renown: 0 } },
  { id: 'ach_twenty_events', name: 'Event Survivor', emoji: '🌪️', description: 'Trigger 20 grove events.',
    lore: 'Twenty events survived. The grove has tested you in every way it knows. You have passed every test.', condition: 'events_20', reward: { bark: 200, renown: 100 } },
  { id: 'ach_fifty_events', name: 'Chaos Master', emoji: '🔥', description: 'Trigger 50 grove events.',
    lore: 'Fifty events. Chaos has become your friend. The thorn fairies respect you. Even the storms bow.', condition: 'events_50', reward: { bark: 500, renown: 250 } },
  { id: 'ach_legendary_spirit', name: 'Legendary Bond', emoji: '✨', description: 'Befriend a legendary spirit.',
    lore: 'A legendary spirit has accepted your friendship. This is the rarest bond in the grove. Treasure it always.', condition: 'legendary_spirit', reward: { bark: 1000, renown: 500 } },
  { id: 'ach_all_types', name: 'Complete Spectrum', emoji: '🌈', description: 'Befriend at least one spirit of every type.',
    lore: 'Seven types, seven friendships. You have touched every aspect of the grove spirit. You are complete.', condition: 'all_types', reward: { bark: 600, renown: 300 } },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: BG_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const BG_TITLES: readonly BgTitleDef[] = [
  { id: 'bg_title_seedling', name: 'Seedling Tender', emoji: '🌱', minRenown: 0, minSpirits: 0,
    description: 'A newcomer taking their first steps into the sacred birch grove.',
    lore: 'The title of Seedling Tender is not given — it is assumed. Every great grove keeper started here.' },
  { id: 'bg_title_sapling', name: 'Sapling Friend', emoji: '🌿', minRenown: 50, minSpirits: 3,
    description: 'The birch spirits have begun to trust you and share their whispered secrets.',
    lore: 'When a birch tree leans toward you, the spirits call it "sapling friendship." It means you are accepted.' },
  { id: 'bg_title_canopy', name: 'Canopy Keeper', emoji: '🌳', minRenown: 200, minSpirits: 7,
    description: 'You tend the canopy above, ensuring sunlight reaches every corner.',
    lore: 'The Canopy Keeper knows the exact angle of every sunbeam that enters the grove. Not by measurement — by feeling.' },
  { id: 'bg_title_warden', name: 'Grove Warden', emoji: '🛡️', minRenown: 500, minSpirits: 12,
    description: 'Appointed by the spirits themselves, you guard the grove against all threats.',
    lore: 'Only the spirits can grant the title of Grove Warden. A human who claims it without their blessing is ignored.' },
  { id: 'bg_title_druid', name: 'Birch Druid', emoji: '🧙', minRenown: 1000, minSpirits: 18,
    description: 'A druid of the birch order, communing with trees and channeling forest magic.',
    lore: 'Birch Druids can speak to trees, but more importantly, they can listen. The trees have much to say.' },
  { id: 'bg_title_elder', name: 'Birch Elder', emoji: '🧓', minRenown: 2000, minSpirits: 25,
    description: 'An elder respected by every spirit in the grove.',
    lore: 'Birch Elders do not lead by command. They lead by example. The spirits follow not because they must, but because they want to.' },
  { id: 'bg_title_sage', name: 'Grove Sage', emoji: '📖', minRenown: 4000, minSpirits: 30,
    description: 'Your knowledge of the birch grove is unparalleled.',
    lore: 'The Grove Sage knows things that the trees have forgotten. The moss treants consult them for historical accuracy.' },
  { id: 'bg_title_ancient', name: 'Ancient Guardian', emoji: '👑', minRenown: 8000, minSpirits: 35,
    description: 'You ARE the birch grove. The trees, the spirits, and the land are one with you.',
    lore: 'There has only ever been one Ancient Guardian at a time. When you achieve this title, the grove itself acknowledges you as its heart.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: BG_ARTIFACTS — 15 Artifacts
// ═══════════════════════════════════════════════════════════════════

export const BG_ARTIFACTS: readonly BgArtifactDef[] = [
  { id: 'art_birch_crown', name: 'Birch Crown', emoji: '👑', rarity: 'rare', friendshipBoost: 15, wisdomBoost: 10, natureBoost: 12, value: 350,
    description: 'A crown of living birch branches that never wither.', lore: 'The Birch Crown was worn by the first grove keeper. It has been passed from keeper to keeper for three thousand years.' },
  { id: 'art_moss_staff', name: 'Moss-Covered Staff', emoji: '🪄', rarity: 'uncommon', friendshipBoost: 8, wisdomBoost: 12, natureBoost: 10, value: 80,
    description: 'A staff of ancient wood sheathed in perpetual moss.', lore: 'The moss on this staff changes color with the seasons. In spring it is green. In autumn, gold. In winter, silver.' },
  { id: 'art_thorn_ring', name: 'Thorn Band Ring', emoji: '💍', rarity: 'uncommon', friendshipBoost: 10, wisdomBoost: 8, natureBoost: 12, value: 85,
    description: 'A ring of living thorns that protects from hostile magic.', lore: 'The Thorn Band Ring was a gift from the Thorn Empress to the first keeper who earned her trust. The thorns have not pricked since.' },
  { id: 'art_root_amulet', name: 'Root Heart Amulet', emoji: '📿', rarity: 'rare', friendshipBoost: 18, wisdomBoost: 15, natureBoost: 20, value: 380,
    description: 'An amulet containing a living root fragment pulsing with heartbeat.', lore: 'The Root Heart Amulet synchronizes with the wearer pulse. If the wearer lies, the heartbeat quickens and the root grows warm.' },
  { id: 'art_leaf_cloak', name: 'Thousand Leaf Cloak', emoji: '🧥', rarity: 'rare', friendshipBoost: 12, wisdomBoost: 20, natureBoost: 18, value: 360,
    description: 'A cloak of enchanted leaves granting invisibility in forests.', lore: 'The Thousand Leaf Cloak is made of one thousand leaves, each from a different tree species. Each leaf was freely given.' },
  { id: 'art_petal_flute', name: 'Petal Dancer Flute', emoji: '🎵', rarity: 'uncommon', friendshipBoost: 12, wisdomBoost: 10, natureBoost: 8, value: 78,
    description: 'A flute carved from a petal dancer petal.', lore: 'When played, the Petal Dancer Flute makes all flowers within earshot bloom simultaneously, regardless of season.' },
  { id: 'art_bark_shield', name: 'Iron Bark Shield', emoji: '🛡️', rarity: 'rare', friendshipBoost: 10, wisdomBoost: 12, natureBoost: 25, value: 400,
    description: 'A shield of petrified birch bark, never broken in battle.', lore: 'The Iron Bark Shield weighs nothing to its rightful owner, but becomes impossibly heavy to anyone else who tries to lift it.' },
  { id: 'art_sap_chalice', name: 'Ever-Sap Chalice', emoji: '🏆', rarity: 'epic', friendshipBoost: 30, wisdomBoost: 25, natureBoost: 28, value: 1500,
    description: 'A chalice that perpetually fills with enchanted birch sap.', lore: 'One sip from the Ever-Sap Chalice heals all wounds, cures all ailments, and grants visions of the grove past and future.' },
  { id: 'art_moss_tome', name: 'Moss Wisdom Tome', emoji: '📖', rarity: 'epic', friendshipBoost: 20, wisdomBoost: 40, natureBoost: 22, value: 1600,
    description: 'An ancient book of living moss that rewrites itself.', lore: 'The Moss Wisdom Tome contains the answer to every question, but only one answer at a time. Each new question erases the old one.' },
  { id: 'art_thorn_diadem', name: 'World Thorn Diadem', emoji: '🌟', rarity: 'epic', friendshipBoost: 35, wisdomBoost: 20, natureBoost: 30, value: 1700,
    description: 'The crown of the Thorn Empress radiating barrier magic.', lore: 'The World Thorn Diadem was forged from seven thorns, each from a different continent. Its barrier magic spans the entire grove.' },
  { id: 'art_root_crown', name: 'Deep Root Crown', emoji: '🌍', rarity: 'epic', friendshipBoost: 22, wisdomBoost: 35, natureBoost: 28, value: 1400,
    description: 'A crown of crystallized root material from the deep chambers.', lore: 'Wearing the Deep Root Crown lets you hear the World Root heartbeat. It is said to be the most calming sound in existence.' },
  { id: 'art_leaf_scepter', name: 'Season Scepter', emoji: '⚡', rarity: 'epic', friendshipBoost: 25, wisdomBoost: 28, natureBoost: 35, value: 1800,
    description: 'A scepter that controls the changing of seasons within the grove.', lore: 'With the Season Scepter, you can make it spring in winter. But be warned — borrowed seasons must eventually be returned.' },
  { id: 'art_petal_heart', name: 'Eternal Bloom Heart', emoji: '💖', rarity: 'legendary', friendshipBoost: 50, wisdomBoost: 45, natureBoost: 50, value: 8000,
    description: 'A crystallized heart of eternal petals granting immortality within the grove.', lore: 'The Eternal Bloom Heart was formed when the Prima cried tears of joy at the first sunrise she ever witnessed.' },
  { id: 'art_world_birch_seed', name: 'World Birch Seed', emoji: '🌱', rarity: 'legendary', friendshipBoost: 45, wisdomBoost: 55, natureBoost: 48, value: 9500,
    description: 'The seed from the first birch tree, containing the blueprint of all forests.', lore: 'The World Birch Seed contains the genetic code of every tree species that has ever existed. Planting it would create a new world.' },
  { id: 'art_grove_soul_stone', name: 'Grove Soul Stone', emoji: '💎', rarity: 'legendary', friendshipBoost: 55, wisdomBoost: 50, natureBoost: 55, value: 12000,
    description: 'A stone containing the soul of the birch grove itself.', lore: 'The Grove Soul Stone is the most powerful artifact in existence. It IS the grove, compressed into a single gemstone. Handle it with infinite care.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: BG_EVENTS — 12 Grove Events
// ═══════════════════════════════════════════════════════════════════

export const BG_EVENTS: readonly BgEventDef[] = [
  { id: 'evt_moonlit_bloom', name: 'Moonlit Bloom', emoji: '🌙', durationTurns: 3, effectType: 'buff',
    effectDescription: 'All spirit friendships gain +50% for 3 turns.',
    description: 'Every flower in the grove blooms simultaneously under the full moon.',
    lore: 'The Moonlit Bloom occurs when all seven celestial bodies align. It happens once every 147 years. Or whenever the grove decides.' },
  { id: 'evt_thorn_invasion', name: 'Thorn Invasion', emoji: '🌀', durationTurns: 2, effectType: 'debuff',
    effectDescription: 'Tending costs double bark for 2 turns.',
    description: 'Wild thorns from outside encroach, blocking paths and tangling roots.',
    lore: 'The Thorn Invasion is not an attack — it is a test. The grove sends wild thorns to see if its keeper is worthy of their trust.' },
  { id: 'evt_sap_rain', name: 'Enchanted Sap Rain', emoji: '🌧️', durationTurns: 4, effectType: 'buff',
    effectDescription: 'All materials collected give double value for 4 turns.',
    description: 'The sky rains golden birch sap, enriching everything it touches.',
    lore: 'Sap Rain is the grove way of saying thank you. When a keeper has served well, the sky opens and gives back.' },
  { id: 'evt_root_quake', name: 'Root Earthquake', emoji: '💥', durationTurns: 2, effectType: 'debuff',
    effectDescription: 'Root walkers lose 10 friendship for 2 turns.',
    description: 'Something stirs deep underground. The root network trembles violently.',
    lore: 'Root Quakes are caused by the World Root shifting in its sleep. It rolls over approximately once every century.' },
  { id: 'evt_spirit_migration', name: 'Spirit Migration', emoji: '🦋', durationTurns: 3, effectType: 'special',
    effectDescription: 'A random rare spirit can be befriended for half cost.',
    description: 'A wave of wandering spirits passes through, some choosing to stay.',
    lore: 'Spirit Migrations are the grove most joyful events. Spirits from every corner of the world arrive, sharing stories and songs.' },
  { id: 'evt_petal_blizzard', name: 'Petal Blizzard', emoji: '🌸', durationTurns: 5, effectType: 'buff',
    effectDescription: 'Petal dancers gain +100% nature power for 5 turns.',
    description: 'Petal dancers perform a synchronized blizzard dance, blanketing the grove.',
    lore: 'The Petal Blizzard is the largest coordinated spirit dance. Every petal dancer in the grove participates simultaneously.' },
  { id: 'evt_moss_spread', name: 'Moss Bloom', emoji: '🟢', durationTurns: 4, effectType: 'buff',
    effectDescription: 'Moss treants gain +50% wisdom for 4 turns.',
    description: 'Every moss in the grove begins growing at incredible speed.',
    lore: 'The Moss Bloom turns the grove floor into a sea of green. It is said that during a Moss Bloom, you can walk on moss over water.' },
  { id: 'evt_bark_rot', name: 'Bark Blight', emoji: '🦠', durationTurns: 3, effectType: 'debuff',
    effectDescription: 'Bark guardians lose 15 nature power for 3 turns.',
    description: 'A mysterious blight begins rotting bark from the inside out.',
    lore: 'Bark Blight is the grove oldest enemy. It has been fought a thousand times and has been defeated a thousand times. It always returns.' },
  { id: 'evt_fairy_festival', name: 'Fairy Festival', emoji: '🧚', durationTurns: 5, effectType: 'buff',
    effectDescription: 'All spirit befriending costs 30% less for 5 turns.',
    description: 'Thorn fairies throw a grand festival, opening their borders to all.',
    lore: 'The Fairy Festival is the only time the Thorn Empress lowers her barriers. Even enemies are welcome — if they come in peace.' },
  { id: 'evt_wind_storm', name: 'Great Wind Storm', emoji: '🌪️', durationTurns: 2, effectType: 'debuff',
    effectDescription: 'Leaf sylph abilities have double cooldown for 2 turns.',
    description: 'Unseasonal gales tear through the canopy, disrupting sylph flights.',
    lore: 'Great Wind Storms are caused when the World Wind Sovereign sneezes. It happens more often than you would think.' },
  { id: 'evt_ancient_awakening', name: 'Ancient Awakening', emoji: '✨', durationTurns: 3, effectType: 'special',
    effectDescription: 'One random structure gains +2 levels for 3 turns.',
    description: 'Ancient spirits stir from their long sleep, empowering a structure.',
    lore: 'During an Ancient Awakening, the voices of spirits who have passed on can be heard. They speak of the grove future.' },
  { id: 'evt_world_tree_pulse', name: 'World Tree Pulse', emoji: '🌍', durationTurns: 6, effectType: 'buff',
    effectDescription: 'All grove locations produce double renown for 6 turns.',
    description: 'A pulse of energy from the World Tree reverberates through the root network.',
    lore: 'The World Tree Pulse is the strongest buff the grove can offer. It is a gift from the World Tree itself, acknowledging a worthy keeper.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

export const BG_INITIAL_STATE: BgStoreState = {
  bgSpirits: [],
  bgGroves: [],
  bgInventory: [],
  bgStructures: [],
  bgArtifacts: [],
  bgAchievements: [],
  bgTitle: 'bg_title_seedling',
  bgEvents: [],
  bgStats: {
    totalBefriended: 0,
    totalTended: 0,
    totalBuilt: 0,
    totalEventsTriggered: 0,
    bark: 100,
    renown: 0,
  },
  activeEvent: null,
  eventTurnsRemaining: 0,
  activeGrove: null,
}

export const useBgStore = create<BgFullStore>()(
  persist(
    (set, get) => ({
      ...BG_INITIAL_STATE,

      // ── befriendSpirit ─────────────────────────────────────
      befriendSpirit: (id: string): boolean => {
        const def = bgFindSpirit(id)
        if (!def) return false
        const state = get()
        if (state.bgSpirits.some((s) => s.spiritId === id)) return false
        const cost = bgBefriendCost(def)
        if (state.bgStats.bark < cost) return false
        const instance: BgSpiritInstance = {
          id: bgMakeId('spirit'),
          spiritId: id,
          friendship: 0,
          level: 1,
          befriendedAt: Date.now(),
        }
        const renownGain = Math.floor(bgRarityMultiplier(def.rarity) * 15)
        const newRenown = state.bgStats.renown + renownGain
        const newSpirits = [...state.bgSpirits, instance]
        set((prev) => ({
          bgSpirits: newSpirits,
          bgStats: {
            ...prev.bgStats,
            bark: prev.bgStats.bark - cost,
            renown: newRenown,
            totalBefriended: prev.bgStats.totalBefriended + 1,
          },
          bgTitle: bgCalcMaxTitle(newRenown, newSpirits.length),
        }))
        return true
      },

      // ── tendGrove ──────────────────────────────────────────
      tendGrove: (id: string): BgEventDef | null => {
        const grove = bgFindGrove(id)
        if (!grove) return null
        const state = get()
        const requiredTitleIdx = BG_TITLES.findIndex((t) => t.id === grove.requiredTitle)
        const currentTitleIdx = BG_TITLES.findIndex((t) => t.id === state.bgTitle)
        if (currentTitleIdx < requiredTitleIdx) return null
        const existing = state.bgGroves.find((g) => g.groveId === id)
        const updatedGroves = existing
          ? state.bgGroves.map((g) =>
              g.groveId === id
                ? { ...g, tended: true, lastTendedAt: Date.now(), blessings: g.blessings + 1 }
                : g
            )
          : [...state.bgGroves, { groveId: id, tended: true, lastTendedAt: Date.now(), blessings: 1 }]
        const event = bgPickRandomEvent()
        const renownGain = grove.fertility * 5
        const newRenown = state.bgStats.renown + renownGain
        set((prev) => ({
          bgGroves: updatedGroves,
          activeGrove: id,
          activeEvent: event,
          eventTurnsRemaining: event.durationTurns,
          bgStats: {
            ...prev.bgStats,
            renown: newRenown,
            totalTended: prev.bgStats.totalTended + 1,
            totalEventsTriggered: prev.bgStats.totalEventsTriggered + 1,
          },
          bgTitle: bgCalcMaxTitle(newRenown, prev.bgSpirits.length),
        }))
        return event
      },

      // ── buildStructure ─────────────────────────────────────
      buildStructure: (id: string): boolean => {
        const def = bgFindStructureDef(id)
        if (!def) return false
        const state = get()
        const alreadyBuilt = state.bgStructures.some((s) => s.structureDefId === id)
        if (alreadyBuilt) return false
        const cost = def.baseCost
        if (state.bgStats.bark < cost) return false
        const instance: BgStructureInstance = {
          id: bgMakeId('struct'),
          structureDefId: id,
          level: 1,
          builtAt: Date.now(),
        }
        const renownGain = def.baseEffect * 3
        const newRenown = state.bgStats.renown + renownGain
        set((prev) => ({
          bgStructures: [...prev.bgStructures, instance],
          bgStats: {
            ...prev.bgStats,
            bark: prev.bgStats.bark - cost,
            renown: newRenown,
            totalBuilt: prev.bgStats.totalBuilt + 1,
          },
          bgTitle: bgCalcMaxTitle(newRenown, prev.bgSpirits.length),
        }))
        return true
      },

      // ── activateArtifact ───────────────────────────────────
      activateArtifact: (id: string): boolean => {
        const artifact = bgFindArtifact(id)
        if (!artifact) return false
        const state = get()
        if (state.bgArtifacts.includes(id)) return false
        const renownGain = Math.floor(bgRarityMultiplier(artifact.rarity) * 25)
        const newRenown = state.bgStats.renown + renownGain
        set((prev) => ({
          bgArtifacts: [...prev.bgArtifacts, id],
          bgStats: {
            ...prev.bgStats,
            renown: newRenown,
          },
          bgTitle: bgCalcMaxTitle(newRenown, prev.bgSpirits.length),
        }))
        return true
      },

      // ── triggerGroveEvent ──────────────────────────────────
      triggerGroveEvent: (): BgEventDef | null => {
        const state = get()
        if (state.activeEvent) return null
        const event = bgPickRandomEvent()
        set((prev) => ({
          activeEvent: event,
          eventTurnsRemaining: event.durationTurns,
          bgStats: {
            ...prev.bgStats,
            totalEventsTriggered: prev.bgStats.totalEventsTriggered + 1,
          },
        }))
        return event
      },

      // ── resetBirchGrove ────────────────────────────────────
      resetBirchGrove: () => {
        set(BG_INITIAL_STATE)
      },
    }),
    {
      name: 'birch-grove-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: MAIN HOOK — useBirchGrove()
// ═══════════════════════════════════════════════════════════════════

export default function useBirchGrove(): BgAPI {
  const store = useBgStore()

  // ── Side effect: check for auto-claimable achievements ────
  if (process.env.NODE_ENV !== 'production') {
    // In production this would be handled by the store itself
  }

  // ── Computed: Owned spirits with defs ─────────────────────
  const bgOwnedSpirits = useMemo(() => {
    return store.bgSpirits.map((s) => {
      const def = bgFindSpirit(s.spiritId)
      return {
        ...s,
        def,
        typeColor: def ? bgSpiritTypeColor(def.type) : '#888888',
        rarityColor: def ? bgRarityColor(def.rarity) : '#888888',
      }
    })
  }, [store])

  // ── Computed: Available spirits ───────────────────────────
  const bgAvailableSpirits = useMemo(() => {
    return BG_SPIRITS.filter((sp) => {
      const owned = store.bgSpirits.some((s) => s.spiritId === sp.id)
      if (owned) return false
      const cost = bgBefriendCost(sp)
      return store.bgStats.bark >= cost
    })
  }, [store])

  // ── Computed: Current title detail ────────────────────────
  const bgCurrentTitleDetail = useMemo(() => {
    return bgFindTitle(store.bgTitle) ?? BG_TITLES[0]
  }, [store])

  // ── Computed: Next title ──────────────────────────────────
  const bgNextTitle = useMemo(() => {
    const currentIdx = BG_TITLES.findIndex((t) => t.id === store.bgTitle)
    if (currentIdx >= BG_TITLES.length - 1) return null
    return BG_TITLES[currentIdx + 1]
  }, [store])

  // ── Computed: Active grove detail ─────────────────────────
  const bgActiveGroveDetail = useMemo(() => {
    if (!store.activeGrove) return null
    return bgFindGrove(store.activeGrove) ?? null
  }, [store])

  // ── Computed: Untended groves ─────────────────────────────
  const bgUntendedGroves = useMemo(() => {
    const tendedIds = new Set(store.bgGroves.map((g) => g.groveId))
    return BG_GROVES.filter((g) => !tendedIds.has(g.id))
  }, [store])

  // ── Computed: Built structures ────────────────────────────
  const bgBuiltStructures = useMemo(() => {
    return store.bgStructures.map((s) => {
      const def = bgFindStructureDef(s.structureDefId)
      return { ...s, def }
    })
  }, [store])

  // ── Computed: Unlockable abilities ────────────────────────
  const bgUnlockableAbilities = useMemo(() => {
    return BG_ABILITIES.filter((a) => {
      const cost = Math.floor(100 * bgRarityMultiplier(a.rarity))
      return store.bgStats.bark >= cost
    })
  }, [store])

  // ── Computed: Owned artifacts ─────────────────────────────
  const bgOwnedArtifacts = useMemo(() => {
    return store.bgArtifacts
      .map((aId) => bgFindArtifact(aId))
      .filter((a): a is BgArtifactDef => a !== undefined)
  }, [store])

  // ── Computed: Unclaimed achievements ──────────────────────
  const bgUnclaimedAchievements = useMemo(() => {
    return BG_ACHIEVEMENTS.filter((a) => {
      if (store.bgAchievements.includes(a.id)) return false
      return bgCheckAchievementCondition(a.condition, store)
    })
  }, [store])

  // ── Computed: Inventory items ─────────────────────────────
  const bgInventoryItems = useMemo(() => {
    return store.bgInventory.map((m) => {
      const def = bgFindMaterial(m.materialId)
      return { ...m, def }
    })
  }, [store])

  // ── Computed: Total structure effect ──────────────────────
  const bgTotalStructureEffect = useMemo(() => {
    let total = 0
    for (const s of store.bgStructures) {
      const def = bgFindStructureDef(s.structureDefId)
      if (def) {
        total += def.baseEffect + def.effectPerLevel * (s.level - 1)
      }
    }
    return total
  }, [store])

  // ── Computed: Average spirit level ────────────────────────
  const bgAverageSpiritLevel = useMemo(() => {
    if (store.bgSpirits.length === 0) return 0
    const total = store.bgSpirits.reduce((sum, s) => sum + s.level, 0)
    return Math.floor(total / store.bgSpirits.length)
  }, [store])

  // ── Computed: Total spirit power ──────────────────────────
  const bgTotalSpiritPower = useMemo(() => {
    return store.bgSpirits.reduce((sum, s) => {
      const def = bgFindSpirit(s.spiritId)
      if (!def) return sum
      return sum + def.friendshipPower + def.wisdomPower + def.naturePower
    }, 0)
  }, [store])

  // ── Computed: Spirits by type ─────────────────────────────
  const bgSpiritsByType = useMemo(() => {
    const result: Record<BgSpiritType, BgSpiritInstance[]> = {
      birch_nymph: [], moss_treant: [], thorn_fairy: [], root_walker: [],
      leaf_sylph: [], bark_guardian: [], petal_dancer: [],
    }
    for (const s of store.bgSpirits) {
      const def = bgFindSpirit(s.spiritId)
      if (def) result[def.type].push(s)
    }
    return result
  }, [store])

  // ── Computed: Spirits by rarity ───────────────────────────
  const bgSpiritsByRarity = useMemo(() => {
    const result: Record<BgRarity, BgSpiritInstance[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    }
    for (const s of store.bgSpirits) {
      const def = bgFindSpirit(s.spiritId)
      if (def) result[def.rarity].push(s)
    }
    return result
  }, [store])

  // ── Computed: Title progress ──────────────────────────────
  const bgTitleProgress = useMemo(() => {
    const next = (() => {
      const idx = BG_TITLES.findIndex((t) => t.id === store.bgTitle)
      if (idx >= BG_TITLES.length - 1) return null
      return BG_TITLES[idx + 1]
    })()
    if (!next) return { percent: 100, renownNeeded: 0, spiritsNeeded: 0 }
    const renownProg = Math.min(store.bgStats.renown / next.minRenown, 1)
    const spiritProg = Math.min(store.bgSpirits.length / next.minSpirits, 1)
    const percent = Math.floor((renownProg + spiritProg) / 2 * 100)
    return {
      percent,
      renownNeeded: Math.max(0, next.minRenown - store.bgStats.renown),
      spiritsNeeded: Math.max(0, next.minSpirits - store.bgSpirits.length),
    }
  }, [store])

  // ── Computed: Rare material count ─────────────────────────
  const bgRareMaterialCount = useMemo(() => {
    return store.bgInventory.reduce((count, m) => {
      const def = bgFindMaterial(m.materialId)
      if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
        return count + m.count
      }
      return count
    }, 0)
  }, [store])

  // ── Computed: Total artifact boost ────────────────────────
  const bgTotalArtifactBoost = useMemo(() => {
    let friendshipBoost = 0
    let wisdomBoost = 0
    let natureBoost = 0
    for (const aId of store.bgArtifacts) {
      const def = bgFindArtifact(aId)
      if (def) {
        friendshipBoost += def.friendshipBoost
        wisdomBoost += def.wisdomBoost
        natureBoost += def.natureBoost
      }
    }
    return { friendshipBoost, wisdomBoost, natureBoost }
  }, [store])

  // ── Computed: Completion percent ──────────────────────────
  const bgCompletionPercent = useMemo(() => {
    const spiritPct = (store.bgSpirits.length / 35) * 30
    const grovePct = (store.bgGroves.length / 8) * 15
    const artifactPct = (store.bgArtifacts.length / 15) * 20
    const structPct = (store.bgStructures.length / 25) * 20
    const achPct = (store.bgAchievements.length / 18) * 15
    return Math.floor(spiritPct + grovePct + artifactPct + structPct + achPct)
  }, [store])

  // ── Computed: Structure distribution by category ─────────
  const bgStructuresByCategory = useMemo(() => {
    const result: Record<string, BgStructureInstance[]> = {}
    for (const s of store.bgStructures) {
      const def = bgFindStructureDef(s.structureDefId)
      const cat = def?.category ?? 'unknown'
      if (!result[cat]) result[cat] = []
      result[cat].push(s)
    }
    return result
  }, [store])

  // ── Computed: Materials by type ───────────────────────────
  const bgMaterialsByType = useMemo(() => {
    const result: Record<string, number> = {}
    for (const m of store.bgInventory) {
      result[m.materialId] = m.count
    }
    return result
  }, [store])

  // ── Computed: Tended grove count ───────────────────────────
  const bgTendedGroveCount = useMemo(() => {
    return store.bgGroves.filter((g) => g.tended).length
  }, [store])

  // ── Computed: Legendary spirit count ───────────────────────
  const bgLegendaryCount = useMemo(() => {
    return store.bgSpirits.filter((s) => {
      const def = bgFindSpirit(s.spiritId)
      return def?.rarity === 'legendary'
    }).length
  }, [store])

  // ── Computed: Active event multiplier ──────────────────────
  const bgActiveEventMultiplier = useMemo(() => {
    if (!store.activeEvent) return 1
    if (store.activeEvent.effectType === 'buff') return 1.5
    if (store.activeEvent.effectType === 'debuff') return 0.7
    return 1
  }, [store])

  // ── Computed: Highest rarity owned ─────────────────────────
  const bgHighestRarityOwned = useMemo((): BgRarity => {
    const rarityOrder: BgRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']
    for (let i = rarityOrder.length - 1; i >= 0; i--) {
      const hasRarity = store.bgSpirits.some((s) => {
        const def = bgFindSpirit(s.spiritId)
        return def?.rarity === rarityOrder[i]
      })
      if (hasRarity) return rarityOrder[i]
    }
    return 'common'
  }, [store])

  // ── Computed: Total blessings across all groves ───────────
  const bgTotalBlessings = useMemo(() => {
    return store.bgGroves.reduce((sum, g) => sum + g.blessings, 0)
  }, [store])

  // ── Computed: Most blessed grove ───────────────────────────
  const bgMostBlessedGrove = useMemo(() => {
    if (store.bgGroves.length === 0) return null
    let best = store.bgGroves[0]
    for (const g of store.bgGroves) {
      if (g.blessings > best.blessings) best = g
    }
    return bgFindGrove(best.groveId) ?? null
  }, [store])

  // ── Return bgAPI ──────────────────────────────────────────
  return {
    // Direct constants
    BG_BIRCH_WHITE,
    BG_FOREST_GREEN,
    BG_MOSS_GREEN,
    BG_BARK_BROWN,
    BG_SAP_GOLD,
    BG_MIST_SILVER,
    BG_LEAF_JADE,
    BG_TWILIGHT_AMBER,
    BG_SPIRIT_TYPES,
    BG_SPIRITS,
    BG_GROVES,
    BG_MATERIALS,
    BG_STRUCTURES,
    BG_ABILITIES,
    BG_ACHIEVEMENTS,
    BG_TITLES,
    BG_ARTIFACTS,
    BG_EVENTS,
    bgRarityColor,
    bgSpiritTypeColor,
    bgRarityMultiplier,
    bgStructureUpgradeCost,
    bgBefriendCost,
    bgCheckSpiritSynergy,
    bgGetGroveSpiritBonus,
    bgSpiritsInRange,
    bgCalculateFriendshipRate,
    bgCalculateBuildCost,
    bgValidateGroveAccess,
    bgGetEventEffectValue,
    bgFormatRarityLabel,
    bgGetSpiritTypeEmoji,
    // Store state
    bgSpirits: store.bgSpirits,
    bgGroves: store.bgGroves,
    bgInventory: store.bgInventory,
    bgStructures: store.bgStructures,
    bgArtifacts: store.bgArtifacts,
    bgAchievements: store.bgAchievements,
    bgTitle: store.bgTitle,
    bgEvents: store.bgEvents,
    bgStats: store.bgStats,
    activeEvent: store.activeEvent,
    eventTurnsRemaining: store.eventTurnsRemaining,
    activeGrove: store.activeGrove,
    // Store actions
    befriendSpirit: store.befriendSpirit,
    tendGrove: store.tendGrove,
    buildStructure: store.buildStructure,
    activateArtifact: store.activateArtifact,
    triggerGroveEvent: store.triggerGroveEvent,
    resetBirchGrove: store.resetBirchGrove,
    // Computed getters
    bgOwnedSpirits,
    bgAvailableSpirits,
    bgCurrentTitleDetail,
    bgNextTitle,
    bgActiveGroveDetail,
    bgUntendedGroves,
    bgBuiltStructures,
    bgUnlockableAbilities,
    bgOwnedArtifacts,
    bgUnclaimedAchievements,
    bgInventoryItems,
    bgTotalStructureEffect,
    bgAverageSpiritLevel,
    bgTotalSpiritPower,
    bgSpiritsByType,
    bgSpiritsByRarity,
    bgTitleProgress,
    bgRareMaterialCount,
    bgTotalArtifactBoost,
    bgCompletionPercent,
    bgStructuresByCategory,
    bgMaterialsByType,
    bgTendedGroveCount,
    bgLegendaryCount,
    bgActiveEventMultiplier,
    bgHighestRarityOwned,
    bgTotalBlessings,
    bgMostBlessedGrove,
  }
}
