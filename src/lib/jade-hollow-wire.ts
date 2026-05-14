// =============================================================================
// jade-hollow-wire.ts — Jade Hollow (翡翠幽谷) Game Module
// A jade-themed underground cavern management system for the Word Snake game.
// Tame 35 jade spirits across 8 mystical caverns, mine 30 precious jade materials,
// build 25 upgradeable cavern structures, master 22 jade abilities, discover 15
// legendary artifacts, and survive 12 random hollow events.
//
// Storage key: jade-hollow-wire
// Prefix: jh / JH_
// =============================================================================

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type JHRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type JHSpiritType =
  | 'jade_dragon'
  | 'green_phoenix'
  | 'emerald_tortoise'
  | 'bamboo_spirit'
  | 'moss_walker'
  | 'jade_serpent'
  | 'crystal_fairy'

export type JHAbilityType = 'attack' | 'defense' | 'harvest' | 'taming' | 'utility'
export type JHStructureCategory = 'mining' | 'spirit_care' | 'storage' | 'defense' | 'utility'
export type JHCavernBiome = 'mossland' | 'bamboo' | 'aquatic' | 'crystal' | 'deep' | 'sacred' | 'labyrinth' | 'throne'
export type JHEventCategory = 'bounty' | 'hazard' | 'migration' | 'cosmic'

export interface JHSpiritDef {
  readonly id: string
  readonly name: string
  readonly rarity: JHRarity
  readonly type: JHSpiritType
  readonly basePower: number
  readonly description: string
  readonly lore: string
  readonly preferredCaverns: string[]
}

export interface JHCavernDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly level: number
  readonly resources: string[]
  readonly capacity: number
  readonly biome: JHCavernBiome
  readonly ambientTemp: number
  readonly humidity: number
}

export interface JHMaterialDef {
  readonly id: string
  readonly name: string
  readonly rarity: JHRarity
  readonly description: string
  readonly value: number
  readonly source: string
}

export interface JHStructureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly maxLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly bonusPerLevel: string
  readonly category: JHStructureCategory
}

export interface JHAbilityDef {
  readonly id: string
  readonly name: string
  readonly type: JHAbilityType
  readonly power: number
  readonly cooldown: number
  readonly description: string
  readonly spiritTypeAffinity: JHSpiritType | null
}

export interface JHAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly conditionKey: string
  readonly targetValue: number
  readonly rewardJade: number
  readonly icon: string
}

export interface JHTitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly perks: string[]
}

export interface JHArtifactDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: JHRarity
  readonly effects: string[]
  readonly power: number
  readonly origin: string
}

export interface JHHollowEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly duration: number
  readonly effects: string[]
  readonly category: JHEventCategory
}

export interface SpiritState {
  defId: string
  tamedAt: number
  bondLevel: number
  active: boolean
}

export interface CavernState {
  defId: string
  unlocked: boolean
  mineCount: number
  exhaustion: number
}

export interface InventoryItem {
  materialId: string
  quantity: number
}

export interface JHStoreState {
  jhSpirits: Record<string, SpiritState>
  jhCaverns: Record<string, CavernState>
  jhInventory: InventoryItem[]
  jhArtifacts: string[]
  jhAchievements: string[]
  jhTitle: string
  jhEvents: string[]
  jhStats: {
    totalTamed: number
    totalMined: number
    totalBuilt: number
    totalUpgraded: number
    totalEventsTriggered: number
    totalArtifactsActivated: number
  }
  jhLevel: number
  jhExp: number
  jhJade: number
  jhEnergy: number
  activeCavernId: string | null
  activeEventId: string | null
  eventTimer: number
}

export interface JHStoreActions {
  tameSpirit: (id: string) => boolean
  mineCavern: (id: string) => number
  buildStructure: (id: string) => boolean
  activateArtifact: (id: string) => boolean
  triggerHollowEvent: () => string | null
  resetJadeHollow: () => void
}

export type JHFullStore = JHStoreState & JHStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const JH_COLOR_JADE_GREEN: string = '#00A86B'
export const JH_COLOR_EMERALD: string = '#50C878'
export const JH_COLOR_CRYSTAL_WHITE: string = '#E8F5E9'
export const JH_COLOR_MOSS_BROWN: string = '#6B4226'
export const JH_COLOR_DEEP_JADE: string = '#006B3F'
export const JH_COLOR_MIST_GREEN: string = '#A8D5BA'
export const JH_COLOR_STONE_GRAY: string = '#8B8680'
export const JH_COLOR_GOLD_ACCENT: string = '#DAA520'
export const JH_COLOR_SHADOW_JADE: string = '#004D2E'
export const JH_COLOR_DAWN_GREEN: string = '#98FB98'
export const JH_COLOR_TWILIGHT_TEAL: string = '#2E8B57'
export const JH_COLOR_VOID_DARK: string = '#1A1A2E'

// ═══════════════════════════════════════════════════════════════════
// SECTION 2.5: GAME BALANCE CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const JH_TAME_ENERGY_BASE = 10
export const JH_TAME_ENERGY_PER_RARITY = 5
export const JH_MINE_ENERGY_BASE = 5
export const JH_BUILD_ENERGY_BASE = 15
export const JH_ARTIFACT_ENERGY_COST = 20
export const JH_EVENT_ENERGY_COST = 8
export const JH_MAX_STRUCTURE_LEVEL = 10
export const JH_MAX_ENERGY = 300
export const JH_INITIAL_JADE = 150
export const JH_INITIAL_ENERGY = 100
export const JH_MAX_LEVEL = 60
export const JH_CAVERN_EXHAUSTION_RATE = 12
export const JH_CAVERN_RECOVERY_RATE = 4
export const JH_CAVERN_MAX_EXHAUSTION = 100
export const JH_BOND_LEVEL_MAX = 10
export const JH_EVENT_COOLDOWN_BASE = 30
export const JH_RARITY_TAME_BONUS_COMMON = 1.0
export const JH_RARITY_TAME_BONUS_UNCOMMON = 1.3
export const JH_RARITY_TAME_BONUS_RARE = 1.7
export const JH_RARITY_TAME_BONUS_EPIC = 2.2
export const JH_RARITY_TAME_BONUS_LEGENDARY = 3.0

export const JH_CAVERN_AMBIENT_TEMPS: Record<JHCavernBiome, number> = {
  mossland: 16,
  bamboo: 18,
  aquatic: 14,
  crystal: 20,
  deep: 24,
  sacred: 22,
  labyrinth: 19,
  throne: 28,
}

export const JH_CAVERN_HUMIDITY: Record<JHCavernBiome, number> = {
  mossland: 85,
  bamboo: 70,
  aquatic: 95,
  crystal: 40,
  deep: 90,
  sacred: 60,
  labyrinth: 55,
  throne: 45,
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2.6: SPIRIT TYPE LORE
// ═══════════════════════════════════════════════════════════════════

export const JH_SPIRIT_TYPE_LORE: Record<JHSpiritType, string> = {
  jade_dragon: 'Jade dragons are the most revered spirits of the hollow. Their scales shimmer with translucent jade, and their breath carries the scent of ancient forests. They guard the deepest jade deposits and are said to have carved the first caverns with their tails. Legends speak of a time when jade dragons soared above ground, before retreating into the earth to protect the world\'s jade from surface corruption.',
  green_phoenix: 'Green phoenixes are born from jade embers, rising in plumes of emerald flame. Unlike their fiery cousins, these phoenixes bring renewal to corrupted caverns, their tears crystallizing into jade gems upon touching stone. Each rebirth makes them stronger, and the oldest phoenixes have died and returned so many times they exist in multiple timelines simultaneously.',
  emerald_tortoise: 'Emerald tortoises carry entire micro-ecosystems on their shells. Their slow, deliberate movements create natural terraces in the caverns, and their shells are the hardest substance in the hollow, harder than diamond. Ancient tortoises have been known to sleep for centuries, during which jade forests grow to maturity on their backs before they even stir.',
  bamboo_spirit: 'Bamboo spirits appear as swaying jade stalks that move of their own volition. They communicate through a language of rustling clicks and can grow bamboo bridges across chasms in moments when the hollow is in danger. The oldest bamboo spirits remember when the hollow was first formed and can recount its entire geological history through their rhythmic clicking.',
  moss_walker: 'Moss walkers are gentle giants covered head to toe in enchanted moss. They wander the caverns endlessly, their footprints leaving trails of bioluminescent moss that light the darkest tunnels. Despite their massive size, moss walkers are the most peaceful spirits in the hollow, preferring to heal and nurture rather than fight. Their moss contains the memories of every creature that has ever touched it.',
  jade_serpent: 'Jade serpents slither through the walls of the caverns as if the stone were water. They sense vibrations through the rock and can predict cave-ins hours before they occur, warning other spirits with their distinctive rattling call. The World Jade Serpent, the largest of their kind, encircles the hollow\'s entire mantle and its movements cause the jade veins to pulse with renewed energy.',
  crystal_fairy: 'Crystal fairies are tiny winged spirits made of living crystal. They congregate around jade deposits, their wings refracting light into beautiful patterns. A swarm of crystal fairies can purify corrupted jade with a single synchronized song, and their collective hum resonates at the exact frequency needed to crystallize liquid jade into solid gems. They are the hollow\'s artists and healers.',
}

export const JH_SPIRIT_TYPE_DIET: Record<JHSpiritType, string> = {
  jade_dragon: 'Jade dragons feed on raw jade energy absorbed directly from jade veins. They require massive amounts of jade to sustain their size, which is why they are found only near the richest deposits. A well-fed jade dragon radiates warmth that encourages jade growth in surrounding rock.',
  green_phoenix: 'Green phoenixes consume jade embers, the concentrated crystallized form of jade energy. They create these embers themselves by compressing ambient jade energy through their bodies, effectively recycling the hollow\'s energy in an endless sustainable loop.',
  emerald_tortoise: 'Emerald tortoises are detritivores that consume mineral-rich cave soil and jade dust. Their incredibly slow metabolism means they need only eat once per decade, but when they do, they consume entire hillsides of jade-infused earth.',
  bamboo_spirit: 'Bamboo spirits absorb nutrients through their root systems, drawing jade energy from the soil and water. They are photosynthetic in a unique way, using the faint bioluminescent light of the caverns to supplement their jade energy intake.',
  moss_walker: 'Moss walkers absorb moisture and minerals through the moss on their bodies. They are essentially walking gardens, each moss strand acting as a tiny root that draws nourishment from the air and stone they pass through.',
  jade_serpent: 'Jade serpents hunt by absorbing the residual jade energy left in rock formations after mining. They can also consume jade-infused water and are known to occasionally eat jade pearls formed in underground pools.',
  crystal_fairy: 'Crystal fairies feed on light, specifically the unique spectrum of light produced by jade crystals. They are attracted to bright jade deposits and will swarm to any newly exposed crystal surface, feeding eagerly until the crystal dims.',
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: XP & LEVEL HELPERS
// ═══════════════════════════════════════════════════════════════════

function jhXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= JH_MAX_LEVEL) return Infinity
  return Math.floor(80 * Math.pow(1.12, level) + level * 15)
}

function jhLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < JH_MAX_LEVEL) {
    const needed = jhXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function jhGenerateId(): string {
  return `jh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function jhRarityPower(rarity: JHRarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.4
    case 'rare': return 2.0
    case 'epic': return 3.2
    case 'legendary': return 5.5
  }
}

function jhGetRarityColor(rarity: JHRarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#22D3EE'
    case 'rare': return '#A78BFA'
    case 'epic': return '#F472B6'
    case 'legendary': return '#FBBF24'
  }
}

function jhGetRarityLabel(rarity: JHRarity): string {
  switch (rarity) {
    case 'common': return 'Common'
    case 'uncommon': return 'Uncommon'
    case 'rare': return 'Rare'
    case 'epic': return 'Epic'
    case 'legendary': return 'Legendary'
  }
}

function jhGetSpiritTypeColor(type: JHSpiritType): string {
  switch (type) {
    case 'jade_dragon': return JH_COLOR_JADE_GREEN
    case 'green_phoenix': return JH_COLOR_EMERALD
    case 'emerald_tortoise': return JH_COLOR_MOSS_BROWN
    case 'bamboo_spirit': return '#8DB600'
    case 'moss_walker': return '#6B8E23'
    case 'jade_serpent': return JH_COLOR_DEEP_JADE
    case 'crystal_fairy': return JH_COLOR_CRYSTAL_WHITE
  }
}

function jhGetSpiritTypeLabel(type: JHSpiritType): string {
  switch (type) {
    case 'jade_dragon': return 'Jade Dragon'
    case 'green_phoenix': return 'Green Phoenix'
    case 'emerald_tortoise': return 'Emerald Tortoise'
    case 'bamboo_spirit': return 'Bamboo Spirit'
    case 'moss_walker': return 'Moss Walker'
    case 'jade_serpent': return 'Jade Serpent'
    case 'crystal_fairy': return 'Crystal Fairy'
  }
}

function jhGetAbilityTypeColor(type: JHAbilityType): string {
  switch (type) {
    case 'attack': return '#EF4444'
    case 'defense': return '#3B82F6'
    case 'harvest': return '#22C55E'
    case 'taming': return '#A855F7'
    case 'utility': return '#F59E0B'
  }
}

function jhGetBiomeColor(biome: JHCavernBiome): string {
  switch (biome) {
    case 'mossland': return JH_COLOR_MIST_GREEN
    case 'bamboo': return '#8DB600'
    case 'aquatic': return '#00CED1'
    case 'crystal': return JH_COLOR_CRYSTAL_WHITE
    case 'deep': return JH_COLOR_SHADOW_JADE
    case 'sacred': return JH_COLOR_GOLD_ACCENT
    case 'labyrinth': return JH_COLOR_STONE_GRAY
    case 'throne': return JH_COLOR_JADE_GREEN
  }
}

function jhCheckAchievementCondition(
  stats: JHStoreState['jhStats'],
  caverns: Record<string, CavernState>,
  key: string
): boolean {
  switch (key) {
    case 'totalTamed':
      return stats.totalTamed >= 5
    case 'totalMined':
      return stats.totalMined >= 50
    case 'totalBuilt':
      return stats.totalBuilt >= 10
    case 'totalUpgraded':
      return stats.totalUpgraded >= 25
    case 'totalEventsTriggered':
      return stats.totalEventsTriggered >= 10
    case 'totalArtifactsActivated':
      return stats.totalArtifactsActivated >= 5
    case 'allCavernsUnlocked':
      return Object.values(caverns).every((c) => c.unlocked)
    case 'rareTamed':
      return stats.totalTamed >= 15
    case 'epicTamed':
      return stats.totalTamed >= 25
    case 'legendaryTamed':
      return stats.totalTamed >= 35
    case 'deepMined':
      return stats.totalMined >= 200
    case 'masterBuilder':
      return stats.totalBuilt >= 25
    case 'eventSurvivor':
      return stats.totalEventsTriggered >= 20
    case 'collector':
      return stats.totalArtifactsActivated >= 10
    case 'enduringMiner':
      return stats.totalMined >= 500
    case 'cavernLord':
      return stats.totalBuilt >= 50 && stats.totalUpgraded >= 100
    case 'spiritWhisperer':
      return stats.totalTamed >= 30
    case 'jadeEmperor':
      return stats.totalTamed >= 35 && stats.totalBuilt >= 25 && stats.totalArtifactsActivated >= 15
    default:
      return false
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: JH_SPIRITS — 35 Jade Spirits (5 rarity tiers × 7 types)
// ═══════════════════════════════════════════════════════════════════

export const JH_SPIRITS: readonly JHSpiritDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'spirit_jade_drake',
    name: 'Jade Drake',
    rarity: 'common',
    type: 'jade_dragon',
    basePower: 12,
    description: 'A small dragon hatchling with scales of pale green jade. It curls up in warm spots and its body heat causes nearby jade to glow softly in the dark.',
    lore: 'Jade drakes are the youngest form of jade dragons, born from jade eggs found near warm geothermal vents. They are playful and curious, often getting lost in the winding tunnels of the Moss Gate Entrance.',
    preferredCaverns: ['cavern_moss_gate', 'cavern_bamboo_grotto'],
  },
  {
    id: 'spirit_ember_phoenix',
    name: 'Ember Phoenix',
    rarity: 'common',
    type: 'green_phoenix',
    basePower: 10,
    description: 'A fledgling phoenix that radiates warmth like a jade hearth. Its feathers are green-tipped and it sheds emerald sparks when excited or alarmed.',
    lore: 'Ember phoenixes are the most recently reborn of the phoenix spirits. Their emerald sparks are collected by cavern dwellers as good luck charms and are said to ward off cave-ins.',
    preferredCaverns: ['cavern_moss_gate', 'cavern_bamboo_grotto'],
  },
  {
    id: 'spirit_stone_tortoise',
    name: 'Stone Tortoise',
    rarity: 'common',
    type: 'emerald_tortoise',
    basePower: 14,
    description: 'A patient tortoise with a shell of mossy green stone. It moves so slowly that moss and tiny jade crystals grow on its back during its travels.',
    lore: 'Stone tortoises are the youngest of the emerald tortoise lineage. They can live for centuries without food, drawing sustenance from the jade in their shells. Elder stone tortoises have gardens of jade flowers growing on their backs.',
    preferredCaverns: ['cavern_moss_gate', 'cavern_moss_deep'],
  },
  {
    id: 'spirit_reed_spirit',
    name: 'Reed Spirit',
    rarity: 'common',
    type: 'bamboo_spirit',
    basePower: 8,
    description: 'A thin bamboo-like spirit that sways without wind. It produces gentle chimes when the air pressure changes, alerting cavern dwellers to approaching storms.',
    lore: 'Reed spirits are the most basic form of bamboo consciousness, essentially sentient bamboo stalks. They communicate through vibrations transmitted through their root networks, creating a vast underground communication web.',
    preferredCaverns: ['cavern_moss_gate', 'cavern_bamboo_grotto'],
  },
  {
    id: 'spirit_mossling',
    name: 'Mossling',
    rarity: 'common',
    type: 'moss_walker',
    basePower: 11,
    description: 'A child-sized moss creature that toddles through the caverns, leaving a trail of soft glowing moss. It is curious but easily frightened by loud noises.',
    lore: 'Mosslings are baby moss walkers, born when a parent moss walker sheds a particularly mossy piece of itself that takes on independent life. They imprint on the first creature that shows them kindness.',
    preferredCaverns: ['cavern_moss_gate', 'cavern_moss_deep'],
  },
  {
    id: 'spirit_vine_serpent',
    name: 'Vine Serpent',
    rarity: 'common',
    type: 'jade_serpent',
    basePower: 13,
    description: 'A slender serpent with scales like jade vine leaves. It wraps around stalactites and hangs motionless for days, waiting to sense vibrations through the rock.',
    lore: 'Vine serpents are the scouts of the jade serpent family. They wrap around stone formations and use the rock as an extension of their sensory system, able to detect movement from hundreds of meters away.',
    preferredCaverns: ['cavern_moss_gate', 'cavern_bamboo_grotto'],
  },
  {
    id: 'spirit_dew_fairy',
    name: 'Dew Fairy',
    rarity: 'common',
    type: 'crystal_fairy',
    basePower: 9,
    description: 'A tiny fairy that condenses moisture from the air into jade-tinted dewdrops. These dewdrops are collected by other spirits for their restorative properties.',
    lore: 'Dew fairies are the smallest and most numerous of the crystal fairies. A single cavern can host thousands of dew fairies, their collective light creating a starfield effect on the cavern ceiling.',
    preferredCaverns: ['cavern_moss_gate', 'cavern_emerald_pool'],
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'spirit_jade_wyrm',
    name: 'Jade Wyrm',
    rarity: 'uncommon',
    type: 'jade_dragon',
    basePower: 30,
    description: 'A serpentine dragon that tunnels through jade veins. Its body is flexible as bamboo but hard as jade when threatened, and it leaves polished tunnels wherever it burrows.',
    lore: 'Jade wyrms are adolescents among jade dragons, too large to curl up in warm spots but not yet powerful enough to command the deep deposits. They spend their youth creating elaborate tunnel systems that later become major trade routes.',
    preferredCaverns: ['cavern_bamboo_grotto', 'cavern_emerald_pool'],
  },
  {
    id: 'spirit_flame_phoenix',
    name: 'Flame Phoenix',
    rarity: 'uncommon',
    type: 'green_phoenix',
    basePower: 28,
    description: 'A phoenix whose flames burn green, capable of melting stone into jade. When it dies, it reforms from a jade egg found in the deepest caverns.',
    lore: 'Flame phoenixes have been reborn at least once, gaining significant power from the experience. Their green flames are hot enough to forge jade tools and weapons, making them invaluable allies for builders.',
    preferredCaverns: ['cavern_bamboo_grotto', 'cavern_crystal_sanctum'],
  },
  {
    id: 'spirit_emerald_shelled',
    name: 'Emerald Shelled',
    rarity: 'uncommon',
    type: 'emerald_tortoise',
    basePower: 35,
    description: 'A tortoise with a shell of pure emerald that refracts light into green patterns on cavern walls. Its shell is nearly indestructible and is used as a shield by other spirits.',
    lore: 'The emerald-shelled tortoise has lived long enough for its shell to fully crystallize into emerald. Other spirits seek its protection during hazardous events, sheltering beneath its shell as it retracts into an impenetrable dome.',
    preferredCaverns: ['cavern_emerald_pool', 'cavern_crystal_sanctum'],
  },
  {
    id: 'spirit_grove_tender',
    name: 'Grove Tender',
    rarity: 'uncommon',
    type: 'bamboo_spirit',
    basePower: 25,
    description: 'A bamboo spirit that tends underground gardens. It can coax jade bamboo to grow in barren stone, creating lush groves in the most unexpected places.',
    lore: 'Grove tenders have developed the ability to photosynthesize using bioluminescent light, allowing them to create gardens even in the deepest, darkest chambers. Their groves serve as rest stops for traveling spirits.',
    preferredCaverns: ['cavern_bamboo_grotto', 'cavern_emerald_pool'],
  },
  {
    id: 'spirit_lichen_giant',
    name: 'Lichen Giant',
    rarity: 'uncommon',
    type: 'moss_walker',
    basePower: 32,
    description: 'A towering moss walker wrapped in bioluminescent lichen. It stands sentinel at cavern entrances, its glow visible for hundreds of meters in the darkness.',
    lore: 'Lichen giants have accumulated so much moss and lichen over their long lives that they serve as mobile ecosystems. Dozens of smaller creatures live in their moss, creating a symbiotic relationship of protection and sustenance.',
    preferredCaverns: ['cavern_moss_deep', 'cavern_emerald_pool'],
  },
  {
    id: 'spirit_jade_cobra',
    name: 'Jade Cobra',
    rarity: 'uncommon',
    type: 'jade_serpent',
    basePower: 33,
    description: 'A cobra with a hood of translucent jade that displays hypnotic green patterns. Its venom is not lethal but induces visions of the hollow\'s deepest secrets.',
    lore: 'Jade cobras are the guardians of the serpent family, using their hypnotic hoods to protect nesting areas. Their venom-induced visions are actually genuine glimpses of jade energy flows, making them valuable guides.',
    preferredCaverns: ['cavern_emerald_pool', 'cavern_crystal_sanctum'],
  },
  {
    id: 'spirit_prism_fairy',
    name: 'Prism Fairy',
    rarity: 'uncommon',
    type: 'crystal_fairy',
    basePower: 27,
    description: 'A fairy whose crystalline body splits light into perfect rainbows. Swarms of prism fairies create spectacular light shows in crystal-lined caverns.',
    lore: 'Prism fairies have evolved to refract a wider spectrum of light than their dew fairy cousins. Their rainbow displays serve a practical purpose: signaling between distant caverns using coded color sequences.',
    preferredCaverns: ['cavern_crystal_sanctum', 'cavern_emerald_pool'],
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'spirit_jade_lung',
    name: 'Jade Lung Dragon',
    rarity: 'rare',
    type: 'jade_dragon',
    basePower: 65,
    description: 'A majestic Chinese-style dragon made of interlocking jade scales. It controls underground water currents and can flood or drain caverns at will with a single breath.',
    lore: 'The Jade Lung Dragon is a mature dragon that has claimed a section of the hollow as its territory. It commands the local water table, using underground rivers as highways and defending its domain against intruders with devastating water attacks.',
    preferredCaverns: ['cavern_crystal_sanctum', 'cavern_moss_deep'],
  },
  {
    id: 'spirit_verdant_phoenix',
    name: 'Verdant Phoenix',
    rarity: 'rare',
    type: 'green_phoenix',
    basePower: 60,
    description: 'A phoenix of extraordinary beauty, its tail feathers trail jade fire that solidifies into precious gems on contact with stone. Its cry resonates through every cavern in the hollow.',
    lore: 'The Verdant Phoenix has been reborn multiple times, each cycle increasing its power and beauty. The gems created by its trailing fire are among the most valuable in the hollow, and wars have been fought over the right to collect them.',
    preferredCaverns: ['cavern_jade_heart', 'cavern_crystal_sanctum'],
  },
  {
    id: 'spirit_mountain_tortoise',
    name: 'Mountain Tortoise',
    rarity: 'rare',
    type: 'emerald_tortoise',
    basePower: 72,
    description: 'A tortoise large enough to serve as a living island. Entire ecosystems of moss, jade bamboo, and crystal fairies thrive on its shell as it slowly traverses the deep hollow.',
    lore: 'Mountain tortoises are so large that they are mistaken for hills by inexperienced explorers. Their shells contain complete ecosystems with their own water cycles, weather patterns, and food chains.',
    preferredCaverns: ['cavern_moss_deep', 'cavern_jade_heart'],
  },
  {
    id: 'spirit_ancient_grove',
    name: 'Ancient Grove Spirit',
    rarity: 'rare',
    type: 'bamboo_spirit',
    basePower: 55,
    description: 'A bamboo spirit so old it has become a grove unto itself. Its body is a cluster of interconnected jade bamboo stalks that share a single consciousness.',
    lore: 'Ancient grove spirits have grown so large that individual stalks have developed their own root networks, creating a distributed intelligence. They are the historians of the hollow, recording events in the growth rings of their bamboo bodies.',
    preferredCaverns: ['cavern_bamboo_grotto', 'cavern_moss_deep'],
  },
  {
    id: 'spirit_elder_moss',
    name: 'Elder Moss Walker',
    rarity: 'rare',
    type: 'moss_walker',
    basePower: 68,
    description: 'An ancient moss walker whose body contains thirty-seven species of enchanted moss, each with unique properties. It is considered the healer of the hollow.',
    lore: 'The Elder Moss Walker is the oldest living moss creature, having accumulated moss species from every corner of the hollow over millennia. Each moss species provides a different healing property, making the Elder the most sought-after healer in existence.',
    preferredCaverns: ['cavern_moss_deep', 'cavern_jade_heart'],
  },
  {
    id: 'spirit_quarter_serpent',
    name: 'Quarter Serpent',
    rarity: 'rare',
    type: 'jade_serpent',
    basePower: 62,
    description: 'A massive serpent that is one quarter of the legendary World Serpent. It guards a cardinal direction of the hollow and can sense any movement within its territory.',
    lore: 'Each Quarter Serpent guards one of the four cardinal directions of the hollow. They communicate through vibrations in the rock, coordinating their defense against threats. When all four unite, they form a perimeter that nothing can penetrate.',
    preferredCaverns: ['cavern_serpent_tunnels', 'cavern_jade_heart'],
  },
  {
    id: 'spirit_crown_fairy',
    name: 'Crown Fairy',
    rarity: 'rare',
    type: 'crystal_fairy',
    basePower: 58,
    description: 'A fairy queen whose crystalline crown channels light energy into jade growth. Under her care, barren caverns bloom with jade crystals in a single night.',
    lore: 'Crown fairies are regional leaders among crystal fairies, each commanding a swarm of lesser fairies. Their crowns are not physical objects but crystalline energy formations that pulse with stored light, visible even in absolute darkness.',
    preferredCaverns: ['cavern_crystal_sanctum', 'cavern_jade_heart'],
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'spirit_emperor_jade_dragon',
    name: 'Emperor Jade Dragon',
    rarity: 'epic',
    type: 'jade_dragon',
    basePower: 120,
    description: 'The supreme jade dragon of the hollow, ruler of all dragon spirits. Its scales contain the history of every jade deposit ever formed, and its wisdom spans millennia.',
    lore: 'The Emperor Jade Dragon has ruled the dragon spirits for uncounted ages. It was the first dragon spirit ever tamed by the original Hollow Emperor, and the bond between them persists across incarnations. Its scales are pages of living history.',
    preferredCaverns: ['cavern_jade_heart', 'cavern_dragon_throne'],
  },
  {
    id: 'spirit_eternal_phoenix',
    name: 'Eternal Phoenix',
    rarity: 'epic',
    type: 'green_phoenix',
    basePower: 115,
    description: 'A phoenix that has died and been reborn so many times its consciousness spans multiple timelines. It exists in the past, present, and future simultaneously.',
    lore: 'The Eternal Phoenix has transcended the normal cycle of rebirth. It can perceive all moments of its existence simultaneously, granting it unparalleled foresight. It is said that the Eternal Phoenix can see the hollow\'s future and guide its destiny.',
    preferredCaverns: ['cavern_jade_heart', 'cavern_dragon_throne'],
  },
  {
    id: 'spirit_world_tortoise',
    name: 'World Tortoise',
    rarity: 'epic',
    type: 'emerald_tortoise',
    basePower: 135,
    description: 'A tortoise so ancient it carries an entire cavern system on its shell. Some say the entire Jade Hollow exists on the back of this single, impossibly vast creature.',
    lore: 'The World Tortoise is so old that it has forgotten its own origin. Geologists who have studied its shell have found fossilized evidence of civilizations that predate recorded history, suggesting the World Tortoise has been walking since the dawn of time.',
    preferredCaverns: ['cavern_jade_heart', 'cavern_moss_deep'],
  },
  {
    id: 'spirit_bamboo_sovereign',
    name: 'Bamboo Sovereign',
    rarity: 'epic',
    type: 'bamboo_spirit',
    basePower: 105,
    description: 'The ruler of all bamboo spirits, a towering figure of interlocking jade bamboo that commands every bamboo plant in the hollow with a single thought.',
    lore: 'The Bamboo Sovereign achieved consciousness when a thousand bamboo spirits merged into a single entity during a great hollow event. It retains the memories and personalities of all its component spirits, making it the most complex consciousness in the hollow.',
    preferredCaverns: ['cavern_bamboo_grotto', 'cavern_serpent_tunnels'],
  },
  {
    id: 'spirit_moss_ancient',
    name: 'Moss Ancient',
    rarity: 'epic',
    type: 'moss_walker',
    basePower: 125,
    description: 'The oldest living moss walker, covered in moss that glows with the stored energy of a million sunrises. It is the living memory of the hollow, remembering everything that has ever occurred within.',
    lore: 'The Moss Ancient was the first moss walker, born when the first jade crystal formed in the hollow and moss colonized its surface. Every event since that moment is recorded in the moss layers of its body, accessible to those who know how to read moss.',
    preferredCaverns: ['cavern_moss_deep', 'cavern_jade_heart'],
  },
  {
    id: 'spirit_ouroboros_serpent',
    name: 'Ouroboros Jade Serpent',
    rarity: 'epic',
    type: 'jade_serpent',
    basePower: 118,
    description: 'A serpent that encircles the entire Jade Hollow, eating its own tail in an eternal cycle. Where it passes, jade veins form and the stone itself becomes fertile.',
    lore: 'The Ouroboros Serpent is the living embodiment of the hollow\'s cyclical nature. Its endless circling creates the jade veins that sustain all life in the hollow. Without the Ouroboros, jade would eventually stop forming and the hollow would die.',
    preferredCaverns: ['cavern_serpent_tunnels', 'cavern_jade_heart'],
  },
  {
    id: 'spirit_crystal_matriarch',
    name: 'Crystal Matriarch',
    rarity: 'epic',
    type: 'crystal_fairy',
    basePower: 110,
    description: 'The mother of all crystal fairies, a being of living diamond that refracts the fundamental light of creation itself. Her song can transmute base rock into pure jade.',
    lore: 'The Crystal Matriarch was the first crystal fairy, born when a beam of pure creation light struck a jade crystal at the hollow\'s founding moment. She has given birth to every subsequent generation of crystal fairies, and her song echoes through every crystal in the hollow.',
    preferredCaverns: ['cavern_crystal_sanctum', 'cavern_dragon_throne'],
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'spirit_jade_primordial_dragon',
    name: 'Primordial Jade Dragon',
    rarity: 'legendary',
    type: 'jade_dragon',
    basePower: 200,
    description: 'The first jade dragon, born from the earth\'s core when the planet was young. Its body is the source of all jade in the world, and its heartbeat causes jade to form in rock formations worldwide.',
    lore: 'The Primordial Jade Dragon is not merely a spirit but a force of nature. It existed before the hollow itself, and the hollow formed around it as jade crystallized from its body over billions of years. To tame it is to command the very source of jade.',
    preferredCaverns: ['cavern_dragon_throne'],
  },
  {
    id: 'spirit_azure_phoenix_infinity',
    name: 'Azure Phoenix Infinity',
    rarity: 'legendary',
    type: 'green_phoenix',
    basePower: 195,
    description: 'A phoenix that transcends the cycle of death and rebirth. It exists in a state of perpetual creation, its emerald flames generating new life wherever they touch. It can resurrect any spirit from nothingness.',
    lore: 'The Azure Phoenix Infinity has achieved what no other phoenix has: true immortality. It no longer needs to die to be reborn; instead, it creates new life from pure jade energy, extending its existence indefinitely. Its flames are the source of all renewal in the hollow.',
    preferredCaverns: ['cavern_dragon_throne'],
  },
  {
    id: 'spirit_cosmic_tortoise',
    name: 'Cosmic Tortoise',
    rarity: 'legendary',
    type: 'emerald_tortoise',
    basePower: 210,
    description: 'A tortoise that carries not just caverns but entire dimensions on its back. Its shell contains the blueprints of reality, etched in lines of pure jade and crystal.',
    lore: 'The Cosmic Tortoise is said to be older than the universe itself. Its shell contains the mathematical equations that define reality, written in a language of jade geometry that only the most advanced scholars can decipher. Some believe it is the foundation upon which all dimensions rest.',
    preferredCaverns: ['cavern_dragon_throne'],
  },
  {
    id: 'spirit_bamboo_ancestor',
    name: 'Bamboo Ancestor Spirit',
    rarity: 'legendary',
    type: 'bamboo_spirit',
    basePower: 188,
    description: 'The original bamboo spirit from which all others descended. It predates the Jade Hollow itself, having planted the first seed that grew into the cavern system.',
    lore: 'The Bamboo Ancestor planted the first jade bamboo seed in what would become the hollow. Over eons, that single seed\'s root system expanded and crystallized, forming the very walls and ceilings of every cavern. The Bamboo Ancestor IS the hollow.',
    preferredCaverns: ['cavern_bamboo_grotto', 'cavern_dragon_throne'],
  },
  {
    id: 'spirit_gaia_moss_colossus',
    name: 'Gaia Moss Colossus',
    rarity: 'legendary',
    type: 'moss_walker',
    basePower: 205,
    description: 'A colossus of moss and stone the size of a mountain. Its moss contains the genetic code of every plant species that has ever existed, and it can grow any plant from pure jade energy.',
    lore: 'The Gaia Moss Colossus is the embodiment of planetary plant life, compressed into a single vast organism. If every plant on Earth were to die, the Colossus could regrow the entire biosphere from its moss within a single growing season.',
    preferredCaverns: ['cavern_moss_deep', 'cavern_dragon_throne'],
  },
  {
    id: 'spirit_world_jade_serpent',
    name: 'World Jade Serpent',
    rarity: 'legendary',
    type: 'jade_serpent',
    basePower: 198,
    description: 'The complete World Serpent, formed when all four Quarter Serpents reunite. Its body encircles the planet\'s core, and its jade scales regulate the earth\'s magnetic field.',
    lore: 'The World Jade Serpent is the physical mechanism by which the planet generates its magnetic field. Its jade scales create a dynamo effect as it endlessly circles the core, producing the magnetic shield that protects all life from cosmic radiation.',
    preferredCaverns: ['cavern_serpent_tunnels', 'cavern_dragon_throne'],
  },
  {
    id: 'spirit_diamond_fairy_queen',
    name: 'Diamond Fairy Queen',
    rarity: 'legendary',
    type: 'crystal_fairy',
    basePower: 192,
    description: 'The ultimate crystal fairy, composed of flawless diamond that refracts every wavelength of light simultaneously. Her presence transforms entire cavern systems into crystalline paradises.',
    lore: 'The Diamond Fairy Queen is the final evolution of crystal fairy consciousness. She exists as pure crystallized light, her diamond body being the most perfect crystal ever formed. In her presence, all jade in the hollow resonates at perfect harmony.',
    preferredCaverns: ['cavern_crystal_sanctum', 'cavern_dragon_throne'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: JH_CAVERNS — 8 Cavern Locations
// ═══════════════════════════════════════════════════════════════════

export const JH_CAVERNS: readonly JHCavernDef[] = [
  {
    id: 'cavern_moss_gate',
    name: 'Moss Gate Entrance',
    description: 'A grand archway of living moss marks the entrance to the Jade Hollow. Bioluminescent fungi line the walls, casting an ethereal green glow. The air is thick with the scent of jade and ancient earth. Beginner spirits roam freely here, and the moss-covered pathways are wide and well-lit.',
    level: 1,
    resources: ['mat_moss_dew', 'mat_jade_pebble', 'mat_fungal_thread', 'mat_root_crystal'],
    capacity: 5,
    biome: 'mossland',
    ambientTemp: 16,
    humidity: 85,
  },
  {
    id: 'cavern_bamboo_grotto',
    name: 'Bamboo Grotto',
    description: 'A vast underground chamber where jade bamboo grows in thickets so dense they form natural rooms. The bamboo hums with stored energy, and cutting it releases jade nectar used in taming potions. Bamboo spirits dance between the stalks, their movements creating rhythmic clicking music.',
    level: 5,
    resources: ['mat_jade_bamboo', 'mat_bamboo_nectar', 'mat_green_vine', 'mat_stone_moss'],
    capacity: 8,
    biome: 'bamboo',
    ambientTemp: 18,
    humidity: 70,
  },
  {
    id: 'cavern_emerald_pool',
    name: 'Emerald Pool Cavern',
    description: 'A serene underground lake of liquid emerald, fed by jade springs from deep within the earth. The water glows from within, illuminating stalactites with green light. Rare aquatic jade spirits swim in its depths, and the pool\'s bottom is carpeted with jade gems.',
    level: 10,
    resources: ['mat_emerald_water', 'mat_aquajade', 'mat_pool_crystal', 'mat_deep_moss'],
    capacity: 10,
    biome: 'aquatic',
    ambientTemp: 14,
    humidity: 95,
  },
  {
    id: 'cavern_crystal_sanctum',
    name: 'Crystal Sanctum',
    description: 'A cathedral of enormous jade crystals that emit their own light. The crystals resonate at frequencies that calm aggressive spirits and amplify taming success. Crystal fairies congregate here in vast swarms, their collective song echoing through the hollow.',
    level: 15,
    resources: ['mat_crystal_shard', 'mat_resonance_jade', 'mat_fairy_dust', 'mat_prism_gem'],
    capacity: 12,
    biome: 'crystal',
    ambientTemp: 20,
    humidity: 40,
  },
  {
    id: 'cavern_moss_deep',
    name: 'Deep Moss Hollow',
    description: 'The deepest moss-covered region of the hollow, where moss has evolved into complex organisms over millennia. Walking moss forests, sentient moss carpets, and towering moss trees create an alien landscape. Elder moss walkers guard ancient secrets here.',
    level: 22,
    resources: ['mat_ancient_moss', 'mat_bio_lum_spore', 'mat_living_jade', 'mat_root_core'],
    capacity: 14,
    biome: 'deep',
    ambientTemp: 24,
    humidity: 90,
  },
  {
    id: 'cavern_jade_heart',
    name: 'Jade Heart Chamber',
    description: 'The geographic center of the Jade Hollow, where a massive jade crystal the size of a building pulses with a slow, rhythmic glow like a heartbeat. This crystal is said to be the heart of the hollow itself, and all jade veins in the system connect to it.',
    level: 30,
    resources: ['mat_heart_crystal', 'mat_pulse_jade', 'mat_vein_fragment', 'mat_core_gem'],
    capacity: 16,
    biome: 'sacred',
    ambientTemp: 22,
    humidity: 60,
  },
  {
    id: 'cavern_serpent_tunnels',
    name: 'Serpent Labyrinth',
    description: 'A maze of tunnels carved by the World Jade Serpent over millennia. The passages shift and rearrange periodically, making navigation treacherous. Jade serpents patrol every corridor, and only the most skilled explorers find their way through.',
    level: 38,
    resources: ['mat_serpent_scale', 'mat_tunnel_jade', 'mat_venom_crystal', 'mat_shift_stone'],
    capacity: 18,
    biome: 'labyrinth',
    ambientTemp: 19,
    humidity: 55,
  },
  {
    id: 'cavern_dragon_throne',
    name: 'Dragon Throne Sanctum',
    description: 'The deepest and most sacred chamber of the Jade Hollow, where the Primordial Jade Dragon rests upon a throne of pure jade. The air crackles with raw jade energy, and the walls are lined with the rarest gems. Only legendary spirits dwell here.',
    level: 45,
    resources: ['mat_dragon_jade', 'mat_throne_shard', 'mat_primordial_essence', 'mat_infinity_gem'],
    capacity: 20,
    biome: 'throne',
    ambientTemp: 28,
    humidity: 45,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: JH_MATERIALS — 30 Jade/Gem Materials
// ═══════════════════════════════════════════════════════════════════

export const JH_MATERIALS: readonly JHMaterialDef[] = [
  // Common (6)
  { id: 'mat_moss_dew', name: 'Moss Dew', rarity: 'common', description: 'Drops of water condensed by enchanted moss, tinged with jade green. Used in basic taming potions and cavern healing remedies.', value: 5, source: 'Moss Gate Entrance' },
  { id: 'mat_jade_pebble', name: 'Jade Pebble', rarity: 'common', description: 'A smooth, naturally polished pebble of common jade found in stream beds throughout the hollow. The most basic building material.', value: 4, source: 'Moss Gate Entrance' },
  { id: 'mat_fungal_thread', name: 'Fungal Thread', rarity: 'common', description: 'Silvery threads harvested from bioluminescent cave fungi. Remarkably strong for their weight, used in crafting spirit bonds.', value: 6, source: 'Moss Gate Entrance' },
  { id: 'mat_root_crystal', name: 'Root Crystal', rarity: 'common', description: 'Small crystals that form on the roots of jade bamboo. They glow faintly and are used as light sources in the deeper caverns.', value: 7, source: 'Moss Gate Entrance' },
  { id: 'mat_jade_bamboo', name: 'Jade Bamboo', rarity: 'common', description: 'Segments of jade-infused bamboo, strong yet flexible. Used in construction and as the base material for many tools and weapons.', value: 5, source: 'Bamboo Grotto' },
  { id: 'mat_bamboo_nectar', name: 'Bamboo Nectar', rarity: 'common', description: 'Sweet jade-green liquid harvested from jade bamboo joints. Highly nutritious and mildly restorative, prized by all cavern spirits.', value: 8, source: 'Bamboo Grotto' },

  // Uncommon (6)
  { id: 'mat_green_vine', name: 'Green Vine', rarity: 'uncommon', description: 'Living vines that grow between rock crevices, capable of binding stone together. Used in advanced construction and as restraints for wild spirits.', value: 28, source: 'Bamboo Grotto' },
  { id: 'mat_stone_moss', name: 'Stone Moss', rarity: 'uncommon', description: 'A special moss that slowly converts stone into jade when applied over time. Essential for cavern expansion projects and jade farming.', value: 32, source: 'Bamboo Grotto' },
  { id: 'mat_emerald_water', name: 'Emerald Water', rarity: 'uncommon', description: 'Water from the Emerald Pool, naturally infused with jade energy. Drinking it accelerates healing and enhances spiritual sensitivity.', value: 35, source: 'Emerald Pool Cavern' },
  { id: 'mat_aquajade', name: 'Aquajade', rarity: 'uncommon', description: 'A water jade gem that forms where jade veins intersect underground rivers. It pulses with hydraulic energy and can power simple mechanisms.', value: 30, source: 'Emerald Pool Cavern' },
  { id: 'mat_pool_crystal', name: 'Pool Crystal', rarity: 'uncommon', description: 'Crystals that grow at the bottom of the Emerald Pool, shaped by centuries of water flow into beautiful organic forms.', value: 38, source: 'Emerald Pool Cavern' },
  { id: 'mat_deep_moss', name: 'Deep Moss', rarity: 'uncommon', description: 'Moss from the deeper caverns that has adapted to extreme conditions. It contains concentrated life energy useful in advanced healing.', value: 34, source: 'Emerald Pool Cavern' },

  // Rare (6)
  { id: 'mat_crystal_shard', name: 'Crystal Shard', rarity: 'rare', description: 'A fragment of the great crystals in the Crystal Sanctum. It hums with stored resonance energy and can amplify spirit powers when held.', value: 120, source: 'Crystal Sanctum' },
  { id: 'mat_resonance_jade', name: 'Resonance Jade', rarity: 'rare', description: 'Jade that vibrates at the natural frequency of spiritual energy. Tools made from it harmonize with spirits, making taming significantly easier.', value: 150, source: 'Crystal Sanctum' },
  { id: 'mat_fairy_dust', name: 'Fairy Dust', rarity: 'rare', description: 'Fine crystalline powder shed by crystal fairies during flight. It sparkles perpetually and is a key ingredient in the most potent taming elixirs.', value: 135, source: 'Crystal Sanctum' },
  { id: 'mat_prism_gem', name: 'Prism Gem', rarity: 'rare', description: 'A gem that splits spiritual energy into its component types. Used to identify spirit affinities and optimize taming strategies.', value: 140, source: 'Crystal Sanctum' },
  { id: 'mat_ancient_moss', name: 'Ancient Moss', rarity: 'rare', description: 'Moss that has been growing for thousands of years, containing layers of compressed spiritual history. It glows with wisdom and is used in ancient rituals.', value: 125, source: 'Deep Moss Hollow' },
  { id: 'mat_bio_lum_spore', name: 'Bioluminescent Spore', rarity: 'rare', description: 'Spores from the deepest moss forests that emit intense jade-green light. When cultivated, they can illuminate entire cavern systems.', value: 110, source: 'Deep Moss Hollow' },

  // Epic (6)
  { id: 'mat_living_jade', name: 'Living Jade', rarity: 'epic', description: 'Jade that is technically alive, pulsing with a heartbeat of green light. It grows slowly over time and can be shaped by thought alone when bonded to a spirit.', value: 500, source: 'Deep Moss Hollow' },
  { id: 'mat_root_core', name: 'Root Core', rarity: 'epic', description: 'The crystallized heart of an ancient jade bamboo root system. It contains the genetic memory of the entire bamboo network and can regenerate damaged plants.', value: 550, source: 'Deep Moss Hollow' },
  { id: 'mat_heart_crystal', name: 'Heart Crystal', rarity: 'epic', description: 'A fragment chipped from the Jade Heart itself. It radiates warmth and life energy, and can revive exhausted spirits in moments.', value: 600, source: 'Jade Heart Chamber' },
  { id: 'mat_pulse_jade', name: 'Pulse Jade', rarity: 'epic', description: 'Jade that pulses in synchronization with the Jade Heart\'s rhythm. Weapons and tools made from it gain enhanced power during the pulse.', value: 580, source: 'Jade Heart Chamber' },
  { id: 'mat_vein_fragment', name: 'Vein Fragment', rarity: 'epic', description: 'A piece of a major jade vein still connected to the hollow\'s energy network. It provides a constant stream of jade energy to anything it touches.', value: 520, source: 'Jade Heart Chamber' },
  { id: 'mat_serpent_scale', name: 'Serpent Scale', rarity: 'epic', description: 'A scale shed by the World Jade Serpent during its eternal journey. It is virtually indestructible and channels serpent energy through its surface.', value: 650, source: 'Serpent Labyrinth' },

  // Legendary (6)
  { id: 'mat_dragon_jade', name: 'Dragon Jade', rarity: 'legendary', description: 'Jade formed from the crystallized breath of the Primordial Jade Dragon. It contains a fragment of the dragon\'s consciousness and can command lesser jade creatures.', value: 2500, source: 'Dragon Throne Sanctum' },
  { id: 'mat_throne_shard', name: 'Throne Shard', rarity: 'legendary', description: 'A fragment of the Dragon Throne, the seat of power in the deepest sanctum. It radiates absolute authority over all spirits of the hollow.', value: 3000, source: 'Dragon Throne Sanctum' },
  { id: 'mat_primordial_essence', name: 'Primordial Essence', rarity: 'legendary', description: 'Liquid jade from the very first jade deposit ever formed on the planet. It is the essence of all jade energy, concentrated into a single drop of infinite potential.', value: 3500, source: 'Dragon Throne Sanctum' },
  { id: 'mat_infinity_gem', name: 'Infinity Gem', rarity: 'legendary', description: 'A gem that exists in all moments simultaneously, past, present, and future. Gazing into it reveals the fate of the entire Jade Hollow and all who dwell within.', value: 4000, source: 'Dragon Throne Sanctum' },
  { id: 'mat_venom_crystal', name: 'Venom Crystal', rarity: 'legendary', description: 'Crystallized venom from the World Jade Serpent that has been jade-infused over eons. It can dissolve any barrier, physical or magical, with a single touch.', value: 2800, source: 'Serpent Labyrinth' },
  { id: 'mat_shift_stone', name: 'Shift Stone', rarity: 'legendary', description: 'A stone from the Serpent Labyrinth that has been moved so many times it has learned to move itself. It can teleport short distances and reshape local terrain.', value: 3200, source: 'Serpent Labyrinth' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: JH_STRUCTURES — 25 Upgradeable Cavern Structures
// ═══════════════════════════════════════════════════════════════════

export const JH_STRUCTURES: readonly JHStructureDef[] = [
  // Mining (5)
  { id: 'struct_jade_pick_station', name: 'Jade Pick Station', description: 'A workstation equipped with jade-tipped mining tools for extracting materials from cavern walls.', maxLevel: 10, baseCost: 60, costMultiplier: 1.4, bonusPerLevel: '+5% mining yield', category: 'mining' },
  { id: 'struct_crystal_drill', name: 'Crystal Drill Rig', description: 'A drill powered by crystal resonance that bores through the hardest jade deposits with precision.', maxLevel: 10, baseCost: 300, costMultiplier: 1.5, bonusPerLevel: '+8% mining speed', category: 'mining' },
  { id: 'struct_moss_extractor', name: 'Moss Extractor', description: 'A device that gently harvests moss essence without damaging the living moss colonies beneath.', maxLevel: 10, baseCost: 150, costMultiplier: 1.4, bonusPerLevel: '+3 moss per extraction', category: 'mining' },
  { id: 'struct_vein_scanner', name: 'Vein Scanner Array', description: 'An array of jade-tuned sensors that detect hidden jade veins behind rock walls.', maxLevel: 10, baseCost: 500, costMultiplier: 1.6, bonusPerLevel: '+10% discovery chance', category: 'mining' },
  { id: 'struct_deep_mine_shaft', name: 'Deep Mine Shaft', description: 'A reinforced vertical shaft providing access to deeper, richer jade deposits below the current level.', maxLevel: 10, baseCost: 2000, costMultiplier: 1.8, bonusPerLevel: '+15% deep vein access', category: 'mining' },

  // Spirit Care (5)
  { id: 'struct_spirit_pen', name: 'Spirit Rest Pen', description: 'A comfortable enclosure where tamed spirits rest and recover their energy between activities.', maxLevel: 10, baseCost: 80, costMultiplier: 1.3, bonusPerLevel: '+2 spirit capacity', category: 'spirit_care' },
  { id: 'struct_bonding_shrine', name: 'Bonding Shrine', description: 'A sacred shrine where spirit bonds are strengthened through ritual meditation and jade offerings.', maxLevel: 10, baseCost: 400, costMultiplier: 1.5, bonusPerLevel: '+10% bond growth rate', category: 'spirit_care' },
  { id: 'struct_moss_sanctuary', name: 'Moss Healing Sanctuary', description: 'A healing sanctuary filled with rare mosses that accelerate spirit recovery and soothe exhausted spirits.', maxLevel: 10, baseCost: 600, costMultiplier: 1.5, bonusPerLevel: '+5% recovery speed', category: 'spirit_care' },
  { id: 'struct_taming_arena', name: 'Taming Arena', description: 'An arena where wild spirits can be safely engaged for taming attempts without risk of escape.', maxLevel: 10, baseCost: 800, costMultiplier: 1.6, bonusPerLevel: '+8% tame success rate', category: 'spirit_care' },
  { id: 'struct_spirit_garden', name: 'Spirit Recreation Garden', description: 'A lush underground garden where spirits play and socialize, boosting their happiness and bond levels.', maxLevel: 10, baseCost: 1500, costMultiplier: 1.7, bonusPerLevel: '+3 spirit happiness', category: 'spirit_care' },

  // Storage (5)
  { id: 'struct_jade_chest', name: 'Jade Storage Chest', description: 'A chest carved from solid jade that preserves the magical properties of stored materials indefinitely.', maxLevel: 10, baseCost: 50, costMultiplier: 1.3, bonusPerLevel: '+10 storage slots', category: 'storage' },
  { id: 'struct_crystal_vault', name: 'Crystal Secure Vault', description: 'A secure vault lined with resonance crystals that prevent material degradation and theft over time.', maxLevel: 10, baseCost: 350, costMultiplier: 1.5, bonusPerLevel: '+15 storage capacity', category: 'storage' },
  { id: 'struct_moss_cellar', name: 'Moss Lined Cold Cellar', description: 'A cool underground cellar where moss regulates temperature and humidity for optimal material preservation.', maxLevel: 10, baseCost: 200, costMultiplier: 1.4, bonusPerLevel: '+5% material quality preservation', category: 'storage' },
  { id: 'struct_gem_repository', name: 'Gem Master Repository', description: 'A high-security repository for the rarest and most valuable jade artifacts and precious materials.', maxLevel: 10, baseCost: 2500, costMultiplier: 1.7, bonusPerLevel: '+20 artifact storage', category: 'storage' },
  { id: 'struct_void_container', name: 'Void Pocket Container', description: 'A container that exists partially in a pocket dimension, offering virtually unlimited storage space.', maxLevel: 10, baseCost: 5000, costMultiplier: 2.0, bonusPerLevel: '+50 void storage slots', category: 'storage' },

  // Defense (5)
  { id: 'struct_moss_wall', name: 'Living Moss Barrier', description: 'A living wall of enchanted moss that regenerates when damaged and alerts defenders to approaching threats.', maxLevel: 10, baseCost: 100, costMultiplier: 1.4, bonusPerLevel: '+50 wall HP and regen', category: 'defense' },
  { id: 'struct_jade_turret', name: 'Jade Energy Turret', description: 'An automated turret that fires bolts of concentrated jade energy at hostile entities and event threats.', maxLevel: 10, baseCost: 500, costMultiplier: 1.5, bonusPerLevel: '+15 turret damage per shot', category: 'defense' },
  { id: 'struct_crystal_dome', name: 'Crystal Shield Dome', description: 'A dome of interlocking crystal panels that provides area protection against events and external intrusions.', maxLevel: 10, baseCost: 1200, costMultiplier: 1.6, bonusPerLevel: '+10% shield strength', category: 'defense' },
  { id: 'struct_serpent_trap', name: 'Serpent Venom Pit Trap', description: 'A hidden pit lined with jade serpent venom that immobilizes intruders who fall in for extended periods.', maxLevel: 10, baseCost: 700, costMultiplier: 1.5, bonusPerLevel: '+5s trap immobilize duration', category: 'defense' },
  { id: 'struct_dragon_guardian', name: 'Dragon Guardian Statue', description: 'A statue of a jade dragon that animates to defend the hollow when danger is detected in the area.', maxLevel: 10, baseCost: 3000, costMultiplier: 1.8, bonusPerLevel: '+25 guardian power level', category: 'defense' },

  // Utility (5)
  { id: 'struct_moss_lantern', name: 'Bioluminescent Moss Lantern', description: 'A lantern filled with bioluminescent moss that provides steady jade-green light for cavern exploration.', maxLevel: 10, baseCost: 30, costMultiplier: 1.3, bonusPerLevel: '+5m illumination radius', category: 'utility' },
  { id: 'struct_bamboo_bridge', name: 'Living Bamboo Bridge', description: 'A bridge grown from living jade bamboo that spans chasms and connects isolated cavern platforms.', maxLevel: 10, baseCost: 200, costMultiplier: 1.4, bonusPerLevel: '+10m bridge span length', category: 'utility' },
  { id: 'struct_jade_forge', name: 'Jade Crafting Forge', description: 'A forge heated by jade energy that can shape jade materials into tools, weapons, and powerful artifacts.', maxLevel: 10, baseCost: 800, costMultiplier: 1.5, bonusPerLevel: '+5% craft quality bonus', category: 'utility' },
  { id: 'struct_resonance_bell', name: 'Resonance Bell Tower', description: 'A tower with a massive crystal bell that produces tones calming spirits and boosting all productivity.', maxLevel: 10, baseCost: 1500, costMultiplier: 1.6, bonusPerLevel: '+8% all production rates', category: 'utility' },
  { id: 'struct_portal_gate', name: 'Jade Portal Gate', description: 'A jade-framed portal that allows rapid travel between unlocked caverns, saving vast amounts of travel time.', maxLevel: 10, baseCost: 4000, costMultiplier: 1.9, bonusPerLevel: '+1 portal destination link', category: 'utility' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: JH_ABILITIES — 22 Jade Abilities
// ═══════════════════════════════════════════════════════════════════

export const JH_ABILITIES: readonly JHAbilityDef[] = [
  // Attack (5)
  { id: 'ability_jade_breath', name: 'Jade Breath', type: 'attack', power: 30, cooldown: 3, description: 'Unleash a cone of jade energy that damages hostile entities and purifies corrupted areas.', spiritTypeAffinity: 'jade_dragon' },
  { id: 'ability_emerald_strike', name: 'Emerald Strike', type: 'attack', power: 50, cooldown: 5, description: 'A powerful melee attack using concentrated emerald energy that can shatter stone and jade alike.', spiritTypeAffinity: 'emerald_tortoise' },
  { id: 'ability_phoenix_flare', name: 'Phoenix Flare', type: 'attack', power: 80, cooldown: 8, description: 'Channel the green phoenix\'s fire to create a devastating burst of jade flame in all directions.', spiritTypeAffinity: 'green_phoenix' },
  { id: 'ability_serpent_venom', name: 'Serpent Venom Strike', type: 'attack', power: 65, cooldown: 6, description: 'Inject jade serpent venom that weakens targets over time, reducing their power and resistance.', spiritTypeAffinity: 'jade_serpent' },
  { id: 'ability_dragon_roar', name: 'Dragon Roar', type: 'attack', power: 100, cooldown: 12, description: 'Let loose the terrifying roar of the jade dragon, stunning all enemies in range and causing cave tremors.', spiritTypeAffinity: 'jade_dragon' },

  // Defense (4)
  { id: 'ability_moss_armor', name: 'Moss Armor', type: 'defense', power: 25, cooldown: 4, description: 'Wrap yourself or a spirit in living moss that absorbs incoming damage and slowly regenerates.', spiritTypeAffinity: 'moss_walker' },
  { id: 'ability_tortoise_shell', name: 'Tortoise Shell Shield', type: 'defense', power: 45, cooldown: 7, description: 'Summon a shield of emerald shell energy that blocks all attacks for a short duration.', spiritTypeAffinity: 'emerald_tortoise' },
  { id: 'ability_crystal_barrier', name: 'Crystal Barrier', type: 'defense', power: 70, cooldown: 10, description: 'Raise a wall of interlocking jade crystals that provides cover and reflects energy projectiles.', spiritTypeAffinity: 'crystal_fairy' },
  { id: 'ability_jade_sanctuary', name: 'Jade Sanctuary', type: 'defense', power: 120, cooldown: 20, description: 'Create a zone of absolute protection where no harm can enter, healing all spirits within its bounds.', spiritTypeAffinity: null },

  // Harvest (4)
  { id: 'ability_moss_touch', name: 'Moss Touch', type: 'harvest', power: 15, cooldown: 2, description: 'Channel moss energy to gently extract materials from jade deposits without damaging the surrounding stone.', spiritTypeAffinity: 'moss_walker' },
  { id: 'ability_bamboo_harvest', name: 'Bamboo Harvest', type: 'harvest', power: 30, cooldown: 3, description: 'Command jade bamboo to grow rapidly and yield resources at an accelerated rate for a limited time.', spiritTypeAffinity: 'bamboo_spirit' },
  { id: 'ability_crystal_resonance', name: 'Crystal Resonance', type: 'harvest', power: 55, cooldown: 5, description: 'Tune crystal vibrations to dislodge rare materials from deep within rock formations.', spiritTypeAffinity: 'crystal_fairy' },
  { id: 'ability_jade_transmutation', name: 'Jade Transmutation', type: 'harvest', power: 90, cooldown: 10, description: 'Convert base materials into higher-rarity jade materials using concentrated jade energy.', spiritTypeAffinity: null },

  // Taming (5)
  { id: 'ability_moss_soothe', name: 'Moss Soothe', type: 'taming', power: 20, cooldown: 3, description: 'Release calming moss spores that reduce a wild spirit\'s aggression and make it more receptive to bonding.', spiritTypeAffinity: 'moss_walker' },
  { id: 'ability_bamboo_lure', name: 'Bamboo Lure', type: 'taming', power: 35, cooldown: 4, description: 'Create a decoy of jade bamboo that attracts curious spirits, bringing them within taming range.', spiritTypeAffinity: 'bamboo_spirit' },
  { id: 'ability_fairy_song', name: 'Fairy Enchantment Song', type: 'taming', power: 60, cooldown: 6, description: 'Sing the crystal fairy\'s enchanting melody that mesmerizes spirits and weakens their resistance.', spiritTypeAffinity: 'crystal_fairy' },
  { id: 'ability_dragon_command', name: 'Dragon Command', type: 'taming', power: 85, cooldown: 8, description: 'Issue a command in the ancient dragon tongue that compels lesser spirits to submit and obey.', spiritTypeAffinity: 'jade_dragon' },
  { id: 'ability_jade_pact', name: 'Jade Pact Ritual', type: 'taming', power: 150, cooldown: 15, description: 'Perform the sacred jade pact ritual that forges an unbreakable bond with even the most powerful spirits.', spiritTypeAffinity: null },

  // Utility (4)
  { id: 'ability_moss_path', name: 'Moss Path Finder', type: 'utility', power: 10, cooldown: 2, description: 'Release moss spores that grow along safe paths, revealing hidden routes through the caverns.', spiritTypeAffinity: 'moss_walker' },
  { id: 'ability_bamboo_bridge', name: 'Instant Bamboo Bridge', type: 'utility', power: 25, cooldown: 4, description: 'Grow a temporary bridge of jade bamboo to cross chasms and reach otherwise inaccessible areas.', spiritTypeAffinity: 'bamboo_spirit' },
  { id: 'ability_crystal_light', name: 'Crystal Illumination', type: 'utility', power: 15, cooldown: 1, description: 'Cause nearby crystals to emit intense light, illuminating dark caverns and revealing hidden features.', spiritTypeAffinity: 'crystal_fairy' },
  { id: 'ability_jade_sense', name: 'Jade Sense', type: 'utility', power: 20, cooldown: 3, description: 'Attune your senses to jade energy, allowing you to detect nearby spirits, materials, and hidden dangers.', spiritTypeAffinity: null },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: JH_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const JH_ACHIEVEMENTS: readonly JHAchievementDef[] = [
  { id: 'ach_first_tame', name: 'First Bond', description: 'Tame your first jade spirit and begin your journey into the hollow.', conditionKey: 'totalTamed', targetValue: 1, rewardJade: 50, icon: '🪶' },
  { id: 'ach_spirit_herder', name: 'Spirit Herder', description: 'Tame 5 jade spirits and prove yourself as a capable spirit handler.', conditionKey: 'totalTamed', targetValue: 5, rewardJade: 200, icon: '🐾' },
  { id: 'ach_rare_catcher', name: 'Rare Spirit Catcher', description: 'Successfully tame 15 spirits, including at least one rare spirit.', conditionKey: 'rareTamed', targetValue: 15, rewardJade: 500, icon: '💎' },
  { id: 'ach_epic_whisperer', name: 'Epic Whisperer', description: 'Tame 25 spirits and earn the respect of the elder spirits.', conditionKey: 'epicTamed', targetValue: 25, rewardJade: 1200, icon: '🌟' },
  { id: 'ach_legendary_master', name: 'Legendary Master', description: 'Tame all 35 jade spirits and become the hollow\'s supreme tamer.', conditionKey: 'legendaryTamed', targetValue: 35, rewardJade: 5000, icon: '👑' },
  { id: 'ach_first_mine', name: 'First Extraction', description: 'Mine materials from your first cavern deposit successfully.', conditionKey: 'totalMined', targetValue: 1, rewardJade: 30, icon: '⛏️' },
  { id: 'ach_dedicated_miner', name: 'Dedicated Miner', description: 'Complete 50 mining operations across all caverns.', conditionKey: 'totalMined', targetValue: 50, rewardJade: 300, icon: '🪨' },
  { id: 'ach_deep_excavator', name: 'Deep Excavator', description: 'Mine 200 times and extract treasures from the deepest chambers.', conditionKey: 'deepMined', targetValue: 200, rewardJade: 800, icon: '🏔️' },
  { id: 'ach_enduring_miner', name: 'Enduring Miner', description: 'Mine 500 times, becoming one with the stone itself.', conditionKey: 'enduringMiner', targetValue: 500, rewardJade: 2000, icon: '💪' },
  { id: 'ach_first_build', name: 'First Construction', description: 'Build your first cavern structure and lay the foundation of your domain.', conditionKey: 'totalBuilt', targetValue: 1, rewardJade: 80, icon: '🏗️' },
  { id: 'ach_master_builder', name: 'Master Builder', description: 'Build 10 structures and establish a foothold in the hollow.', conditionKey: 'totalBuilt', targetValue: 10, rewardJade: 400, icon: '🏰' },
  { id: 'ach_architect', name: 'Grand Architect', description: 'Build 25 structures to transform the hollow into a thriving settlement.', conditionKey: 'masterBuilder', targetValue: 25, rewardJade: 1000, icon: '🏛️' },
  { id: 'ach_event_newcomer', name: 'Event Newcomer', description: 'Experience your first random hollow event and survive.', conditionKey: 'totalEventsTriggered', targetValue: 1, rewardJade: 60, icon: '⚡' },
  { id: 'ach_event_veteran', name: 'Event Veteran', description: 'Survive 10 hollow events and learn to anticipate the unexpected.', conditionKey: 'eventSurvivor', targetValue: 10, rewardJade: 500, icon: '🌪️' },
  { id: 'ach_first_artifact', name: 'Artifact Discoverer', description: 'Activate your first legendary jade artifact.', conditionKey: 'totalArtifactsActivated', targetValue: 1, rewardJade: 100, icon: '🔮' },
  { id: 'ach_collector', name: 'Jade Collector', description: 'Activate 10 legendary artifacts and amass an impressive collection.', conditionKey: 'collector', targetValue: 10, rewardJade: 800, icon: '🏺' },
  { id: 'ach_cavern_lord', name: 'Cavern Lord', description: 'Unlock all 8 cavern locations and claim dominion over the entire hollow.', conditionKey: 'allCavernsUnlocked', targetValue: 8, rewardJade: 1500, icon: '🏰' },
  { id: 'ach_jade_emperor', name: 'Jade Emperor', description: 'Achieve mastery: tame 35 spirits, build 25 structures, and activate 15 artifacts.', conditionKey: 'jadeEmperor', targetValue: 1, rewardJade: 10000, icon: '🐉' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: JH_TITLES — 8 Progression Titles
// ═══════════════════════════════════════════════════════════════════

export const JH_TITLES: readonly JHTitleDef[] = [
  { id: 'title_moss_wanderer', name: 'Moss Wanderer', description: 'A newcomer who has just begun exploring the jade-tinted corridors of the hollow, guided by the soft glow of moss.', requiredLevel: 1, perks: ['Access to Moss Gate Entrance', 'Basic moss harvesting'] },
  { id: 'title_bamboo_pathfinder', name: 'Bamboo Pathfinder', description: 'An explorer who has navigated the bamboo groves and learned the ways of the hollow\'s spirit inhabitants.', requiredLevel: 5, perks: ['Access to Bamboo Grotto', 'Bamboo crafting unlocked'] },
  { id: 'title_crystal_seeker', name: 'Crystal Seeker', description: 'A dedicated seeker who chases the glow of jade crystals into the deeper chambers of the hollow.', requiredLevel: 12, perks: ['Access to Emerald Pool', 'Crystal resonance bonus'] },
  { id: 'title_spirit_bonder', name: 'Spirit Bonder', description: 'One who has forged meaningful bonds with multiple jade spirits and earned their deep trust.', requiredLevel: 20, perks: ['Taming success bonus', 'Bond growth acceleration'] },
  { id: 'title_moss_guardian', name: 'Moss Guardian', description: 'A protector of the hollow who tends to its moss and keeps its spirits safe from external harm.', requiredLevel: 28, perks: ['Defense structure bonus', 'Event damage reduction'] },
  { id: 'title_jade_sage', name: 'Jade Sage', description: 'A wise sage who understands the deep connections between jade, spirits, and the living earth.', requiredLevel: 36, perks: ['All abilities enhanced', 'XP gain bonus'] },
  { id: 'title_emerald_sovereign', name: 'Emerald Sovereign', description: 'A sovereign ruler of the emerald depths, commanding respect from all who dwell within the hollow.', requiredLevel: 45, perks: ['Resource generation bonus', 'Spirit power boost'] },
  { id: 'title_hollow_emperor', name: 'Hollow Emperor', description: 'The supreme ruler of the entire Jade Hollow, master of all spirits and keeper of jade wisdom.', requiredLevel: 55, perks: ['All bonuses maximized', 'Legendary spirit access', 'Hollow mastery aura'] },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: JH_ARTIFACTS — 15 Legendary Jade Artifacts
// ═══════════════════════════════════════════════════════════════════

export const JH_ARTIFACTS: readonly JHArtifactDef[] = [
  { id: 'artifact_moss_crown', name: 'Moss Crown of Awakening', description: 'A living crown of enchanted moss that grants its wearer the ability to communicate with all moss-based spirits.', rarity: 'common', effects: ['Spirit Communication', 'Moss Growth Aura', '+10% Taming'], power: 15, origin: 'Moss Gate Entrance' },
  { id: 'artifact_bamboo_flute', name: 'Bamboo Spirit Flute', description: 'A flute carved from ancient jade bamboo whose melodies soothe wild spirits and calm turbulent jade energy.', rarity: 'uncommon', effects: ['Spirit Calming', 'Energy Soothing', '+15% Harvest'], power: 35, origin: 'Bamboo Grotto' },
  { id: 'artifact_emerald_lens', name: 'Emerald Scrying Lens', description: 'A lens of perfect emerald that reveals hidden jade deposits and spirit auras invisible to the naked eye.', rarity: 'uncommon', effects: ['True Sight', 'Deposit Detection', '+20% Mining'], power: 45, origin: 'Emerald Pool Cavern' },
  { id: 'artifact_crystal_pendant', name: 'Crystal Heart Pendant', description: 'A pendant containing a crystal fairy\'s heart crystal that pulses with protective energy.', rarity: 'rare', effects: ['Spirit Shield', 'Energy Regeneration', '+25% Defense'], power: 80, origin: 'Crystal Sanctum' },
  { id: 'artifact_jade_dragon_claw', name: 'Jade Dragon Claw', description: 'A claw from the Emperor Jade Dragon, still warm with draconic power. It can cut through any material.', rarity: 'rare', effects: ['Material Cutting', 'Dragon Authority', '+30% Attack'], power: 95, origin: 'Jade Heart Chamber' },
  { id: 'artifact_phoenix_feather', name: 'Eternal Phoenix Feather', description: 'A feather from the Eternal Phoenix that never fades. It grants its bearer one resurrection per day.', rarity: 'rare', effects: ['Daily Resurrection', 'Jade Flame', '+20% All Stats'], power: 100, origin: 'Jade Heart Chamber' },
  { id: 'artifact_tortoise_shell_shield', name: 'World Tortoise Shield', description: 'A shield made from a fragment of the World Tortoise\'s shell. It is virtually indestructible.', rarity: 'epic', effects: ['Absolute Defense', 'Earth Affinity', '+40% Defense', '+15% HP'], power: 150, origin: 'Deep Moss Hollow' },
  { id: 'artifact_serpent_fang_dagger', name: 'Ouroboros Fang Dagger', description: 'A dagger carved from the World Jade Serpent\'s fang. Its venom can dissolve any barrier.', rarity: 'epic', effects: ['Barrier Dissolve', 'Venom Strike', '+35% Attack', '+10% Speed'], power: 165, origin: 'Serpent Labyrinth' },
  { id: 'artifact_fairy_crown', name: 'Crystal Matriarch Crown', description: 'The crown of the Crystal Matriarch, bestowing command over all crystal fairies and their powers.', rarity: 'epic', effects: ['Fairy Command', 'Crystal Mastery', '+30% Taming', '+25% Harvest'], power: 175, origin: 'Crystal Sanctum' },
  { id: 'artifact_moss_heart_gem', name: 'Moss Ancient Heart', description: 'The crystallized heart of the Moss Ancient, containing the memory of every event in the hollow.', rarity: 'epic', effects: ['Total Recall', 'Healing Aura', '+20% All Stats', '+50% XP'], power: 180, origin: 'Deep Moss Hollow' },
  { id: 'artifact_bamboo_ancestor_staff', name: 'Bamboo Ancestor Staff', description: 'The staff of the first bamboo spirit, capable of growing entire bamboo forests from bare stone.', rarity: 'legendary', effects: ['Forest Creation', 'Plant Mastery', '+50% All Stats'], power: 300, origin: 'Dragon Throne Sanctum' },
  { id: 'artifact_dragon_heart_crystal', name: 'Primordial Dragon Heart', description: 'The crystallized heart of the Primordial Jade Dragon, source of all jade in the world.', rarity: 'legendary', effects: ['Jade Creation', 'Dragon Command', '+60% All Stats', 'Aura of Jade'], power: 350, origin: 'Dragon Throne Sanctum' },
  { id: 'artifact_phoenix_egg', name: 'Phoenix Infinity Egg', description: 'An egg from the Azure Phoenix Infinity that hatches into a temporary phoenix companion.', rarity: 'legendary', effects: ['Phoenix Summon', 'Infinite Resurrection', '+55% All Stats'], power: 340, origin: 'Dragon Throne Sanctum' },
  { id: 'artifact_cosmic_shell', name: 'Cosmic Tortoise Fragment', description: 'A piece of the Cosmic Tortoise\'s shell containing a pocket dimension of living jade.', rarity: 'legendary', effects: ['Dimension Storage', 'Reality Anchor', '+65% Defense'], power: 380, origin: 'Dragon Throne Sanctum' },
  { id: 'artifact_jade_emperor_seal', name: 'Jade Emperor Seal', description: 'The supreme seal of the Hollow Emperor, granting absolute authority over every spirit in the hollow.', rarity: 'legendary', effects: ['Absolute Command', 'Hollow Mastery', '+70% All Stats'], power: 400, origin: 'Dragon Throne Sanctum' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: JH_HOLLOW_EVENTS — 12 Random Hollow Events
// ═══════════════════════════════════════════════════════════════════

export const JH_HOLLOW_EVENTS: readonly JHHollowEventDef[] = [
  { id: 'event_moss_bloom', name: 'Moss Bloom Surge', description: 'A sudden bloom of enchanted moss fills the caverns, creating beautiful bioluminescent displays and boosting moss-related material yields across the entire hollow.', severity: 1, duration: 120, effects: ['Double moss harvest', 'Spirit happiness boost', 'Cavern illumination'], category: 'bounty' },
  { id: 'event_jade_vein_eruption', name: 'Jade Vein Eruption', description: 'A massive jade vein erupts from the cavern walls, depositing rare materials everywhere but destabilizing the local structure temporarily.', severity: 3, duration: 60, effects: ['Material windfall', 'Mining danger increase', 'Temporary cave-ins'], category: 'bounty' },
  { id: 'event_spirit_migration', name: 'Spirit Migration Wave', description: 'A massive migration of wild spirits passes through the hollow, presenting rare taming opportunities but also causing temporary chaos in the caverns.', severity: 2, duration: 180, effects: ['Rare spirit spawns', 'Taming bonus', 'Temporary cavern disruption'], category: 'migration' },
  { id: 'event_crystal_storm', name: 'Crystal Resonance Storm', description: 'The crystals in the Crystal Sanctum begin resonating violently, creating shockwaves that can damage structures and stun nearby spirits.', severity: 4, duration: 90, effects: ['Structure damage risk', 'Spirit stun chance', 'Crystal material bonus'], category: 'hazard' },
  { id: 'event_emerald_flood', name: 'Emerald Pool Overflow', description: 'The Emerald Pool overflows, flooding lower caverns with jade-infused water that accelerates aquatic spirit activity and unlocks new aquatic materials.', severity: 2, duration: 150, effects: ['Flooded lower caverns', 'Aquatic spirit boost', 'Water material bonus'], category: 'bounty' },
  { id: 'event_ancient_awakening', name: 'Ancient Spirit Awakening', description: 'An ancient spirit of immense power awakens from deep slumber within the Jade Heart Chamber, challenging all who dwell in the hollow.', severity: 5, duration: 300, effects: ['Legendary spirit encounter', 'Power rewards', 'Extreme danger'], category: 'cosmic' },
  { id: 'event_moss_withering', name: 'Moss Withering Blight', description: 'A mysterious blight causes moss throughout the hollow to wither and die, reducing healing rates and spirit recovery temporarily.', severity: 3, duration: 200, effects: ['Moss death event', 'Recovery penalty', 'Healing reduction'], category: 'hazard' },
  { id: 'event_jade_earthquake', name: 'Jade Tremor', description: 'Deep tectonic shifts cause jade crystals to fracture and reform, reshaping parts of the cavern layout and revealing new hidden jade deposits.', severity: 4, duration: 30, effects: ['Cavern reshuffle', 'New deposit reveals', 'Structure integrity risk'], category: 'hazard' },
  { id: 'event_fairy_swarm', name: 'Crystal Fairy Swarm', description: 'An enormous swarm of crystal fairies descends on the hollow from the Crystal Sanctum, their collective song creating magical enhancement effects everywhere.', severity: 1, duration: 240, effects: ['All abilities enhanced', 'Material quality boost', 'Spectacular light show'], category: 'bounty' },
  { id: 'event_serpent_passage', name: 'World Serpent Passage', description: 'The World Jade Serpent passes through the hollow on its eternal journey, its massive body causing tremors but leaving behind rare serpent scale deposits.', severity: 5, duration: 180, effects: ['Major tremors', 'Serpent scale windfall', 'Cavern rerouting'], category: 'cosmic' },
  { id: 'event_dragon_dream', name: 'Dragon Dream Cascade', description: 'The Primordial Jade Dragon dreams, and its dream energy washes over the hollow, causing reality to briefly warp and spirits to gain temporary power.', severity: 3, duration: 120, effects: ['Reality warping effects', 'Spirit power boost', 'Vision quests'], category: 'cosmic' },
  { id: 'event_bamboo_flowering', name: 'Jade Bamboo Mass Flowering', description: 'Once every century, all jade bamboo in the hollow flowers simultaneously, releasing clouds of jade pollen with potent magical properties.', severity: 2, duration: 180, effects: ['Bamboo material windfall', 'Spirit attraction wave', 'Taming bonus'], category: 'bounty' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

const INITIAL_STATE: JHStoreState = {
  jhSpirits: {},
  jhCaverns: {},
  jhInventory: [],
  jhArtifacts: [],
  jhAchievements: [],
  jhTitle: 'title_moss_wanderer',
  jhEvents: [],
  jhStats: {
    totalTamed: 0,
    totalMined: 0,
    totalBuilt: 0,
    totalUpgraded: 0,
    totalEventsTriggered: 0,
    totalArtifactsActivated: 0,
  },
  jhLevel: 1,
  jhExp: 0,
  jhJade: JH_INITIAL_JADE,
  jhEnergy: JH_INITIAL_ENERGY,
  activeCavernId: null,
  activeEventId: null,
  eventTimer: 0,
}

const useJHStore = create<JHFullStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // ── tameSpirit ────────────────────────────────────────────
      tameSpirit: (id: string): boolean => {
        const state = get()
        const def = JH_SPIRITS.find((s) => s.id === id)
        if (!def) return false
        if (state.jhSpirits[id]) return false

        const rarityMult = jhRarityPower(def.rarity)
        const energyCost = Math.ceil(JH_TAME_ENERGY_BASE + JH_TAME_ENERGY_PER_RARITY * rarityMult)
        if (state.jhEnergy < energyCost) return false

        const jadeCost = Math.floor(def.basePower * rarityMult * 2)
        if (state.jhJade < jadeCost) return false

        const newSpirit: SpiritState = {
          defId: id,
          tamedAt: Date.now(),
          bondLevel: 1,
          active: true,
        }

        set((prev) => {
          const newExp = prev.jhExp + Math.floor(def.basePower * rarityMult * 10)
          const newLevel = jhLevelFromXp(newExp)
          return {
            jhSpirits: { ...prev.jhSpirits, [id]: newSpirit },
            jhEnergy: Math.max(0, prev.jhEnergy - energyCost),
            jhJade: prev.jhJade - jadeCost,
            jhExp: newExp,
            jhLevel: newLevel,
            jhStats: {
              ...prev.jhStats,
              totalTamed: prev.jhStats.totalTamed + 1,
            },
          }
        })
        return true
      },

      // ── mineCavern ────────────────────────────────────────────
      mineCavern: (id: string): number => {
        const state = get()
        const cavernDef = JH_CAVERNS.find((c) => c.id === id)
        if (!cavernDef) return 0

        const cavernState = state.jhCaverns[id]
        if (!cavernState || !cavernState.unlocked) return 0
        if (cavernState.exhaustion >= JH_CAVERN_MAX_EXHAUSTION) return 0
        if (state.jhEnergy < JH_MINE_ENERGY_BASE) return 0

        const availableMats = cavernDef.resources
        if (availableMats.length === 0) return 0

        const matIndex = Math.floor(Math.random() * availableMats.length)
        const matId = availableMats[matIndex]
        const matDef = JH_MATERIALS.find((m) => m.id === matId)
        if (!matDef) return 0

        const quantity = matDef.rarity === 'common' ? 3 : matDef.rarity === 'uncommon' ? 2 : 1

        set((prev) => {
          const existing = prev.jhInventory.find((i) => i.materialId === matId)
          let newInventory: InventoryItem[]
          if (existing) {
            newInventory = prev.jhInventory.map((i) =>
              i.materialId === matId ? { ...i, quantity: i.quantity + quantity } : i
            )
          } else {
            newInventory = [...prev.jhInventory, { materialId: matId, quantity }]
          }

          const currentCavern = prev.jhCaverns[id]
          const newExhaustion = currentCavern
            ? Math.min(JH_CAVERN_MAX_EXHAUSTION, currentCavern.exhaustion + JH_CAVERN_EXHAUSTION_RATE)
            : JH_CAVERN_EXHAUSTION_RATE

          const newExp = prev.jhExp + Math.floor(matDef.value * quantity * 0.5)
          const newLevel = jhLevelFromXp(newExp)

          return {
            jhInventory: newInventory,
            jhEnergy: Math.max(0, prev.jhEnergy - JH_MINE_ENERGY_BASE),
            jhJade: prev.jhJade + matDef.value * quantity,
            jhCaverns: {
              ...prev.jhCaverns,
              [id]: {
                defId: id,
                unlocked: true,
                mineCount: (currentCavern?.mineCount || 0) + 1,
                exhaustion: newExhaustion,
              },
            },
            jhExp: newExp,
            jhLevel: newLevel,
            activeCavernId: id,
            jhStats: {
              ...prev.jhStats,
              totalMined: prev.jhStats.totalMined + 1,
            },
          }
        })
        return quantity
      },

      // ── buildStructure ────────────────────────────────────────
      buildStructure: (id: string): boolean => {
        const state = get()
        const structDef = JH_STRUCTURES.find((s) => s.id === id)
        if (!structDef) return false

        const existingStructKey = `struct_${id}`
        const existingLevel = state.jhCaverns[existingStructKey]?.mineCount || 0
        if (existingLevel >= structDef.maxLevel) return false

        const nextLevel = existingLevel + 1
        const cost = Math.floor(structDef.baseCost * Math.pow(structDef.costMultiplier, nextLevel - 1))
        if (state.jhJade < cost) return false
        if (state.jhEnergy < JH_BUILD_ENERGY_BASE) return false

        set((prev) => {
          const newExp = prev.jhExp + nextLevel * 20
          const newLevel = jhLevelFromXp(newExp)
          const isInitialBuild = existingLevel === 0
          return {
            jhCaverns: {
              ...prev.jhCaverns,
              [existingStructKey]: {
                defId: existingStructKey,
                unlocked: true,
                mineCount: nextLevel,
                exhaustion: 0,
              },
            },
            jhJade: prev.jhJade - cost,
            jhEnergy: Math.max(0, prev.jhEnergy - JH_BUILD_ENERGY_BASE),
            jhExp: newExp,
            jhLevel: newLevel,
            jhStats: {
              ...prev.jhStats,
              totalBuilt: prev.jhStats.totalBuilt + (isInitialBuild ? 1 : 0),
              totalUpgraded: prev.jhStats.totalUpgraded + 1,
            },
          }
        })
        return true
      },

      // ── activateArtifact ──────────────────────────────────────
      activateArtifact: (id: string): boolean => {
        const state = get()
        const artifactDef = JH_ARTIFACTS.find((a) => a.id === id)
        if (!artifactDef) return false
        if (state.jhArtifacts.includes(id)) return false
        if (state.jhEnergy < JH_ARTIFACT_ENERGY_COST) return false

        const jadeCost = Math.floor(artifactDef.power * jhRarityPower(artifactDef.rarity) * 5)
        if (state.jhJade < jadeCost) return false

        set((prev) => {
          const newExp = prev.jhExp + Math.floor(artifactDef.power * jhRarityPower(artifactDef.rarity) * 20)
          const newLevel = jhLevelFromXp(newExp)
          return {
            jhArtifacts: [...prev.jhArtifacts, id],
            jhEnergy: Math.max(0, prev.jhEnergy - JH_ARTIFACT_ENERGY_COST),
            jhJade: prev.jhJade - jadeCost,
            jhExp: newExp,
            jhLevel: newLevel,
            jhStats: {
              ...prev.jhStats,
              totalArtifactsActivated: prev.jhStats.totalArtifactsActivated + 1,
            },
          }
        })
        return true
      },

      // ── triggerHollowEvent ────────────────────────────────────
      triggerHollowEvent: (): string | null => {
        const state = get()
        if (state.jhEnergy < JH_EVENT_ENERGY_COST) return null

        const availableEvents = JH_HOLLOW_EVENTS.filter((e) => !state.jhEvents.includes(e.id))
        if (availableEvents.length === 0) return null

        const event = availableEvents[Math.floor(Math.random() * availableEvents.length)]

        set((prev) => ({
          jhEvents: [...prev.jhEvents, event.id],
          jhEnergy: Math.max(0, prev.jhEnergy - JH_EVENT_ENERGY_COST),
          activeEventId: event.id,
          eventTimer: event.duration,
          jhJade: prev.jhJade + event.severity * 50,
          jhStats: {
            ...prev.jhStats,
            totalEventsTriggered: prev.jhStats.totalEventsTriggered + 1,
          },
        }))
        return event.id
      },

      // ── resetJadeHollow ───────────────────────────────────────
      resetJadeHollow: () => {
        set({ ...INITIAL_STATE })
      },
    }),
    {
      name: 'jade-hollow-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: DEFAULT EXPORT HOOK
// ═══════════════════════════════════════════════════════════════════

export default function useJadeHollow() {
  const store = useJHStore()

  // ── Getter: Spirit Details ────────────────────────────────────
  const jhGetSpiritDetails = useMemo(() => {
    return JH_SPIRITS.map((spirit) => ({
      ...spirit,
      tamed: !!store.jhSpirits[spirit.id],
      spiritState: store.jhSpirits[spirit.id] || null,
      rarityColor: jhGetRarityColor(spirit.rarity),
      rarityLabel: jhGetRarityLabel(spirit.rarity),
      typeColor: jhGetSpiritTypeColor(spirit.type),
      typeLabel: jhGetSpiritTypeLabel(spirit.type),
      typeLore: JH_SPIRIT_TYPE_LORE[spirit.type],
      typeDiet: JH_SPIRIT_TYPE_DIET[spirit.type],
      tamingCost: Math.ceil(JH_TAME_ENERGY_BASE + JH_TAME_ENERGY_PER_RARITY * jhRarityPower(spirit.rarity)),
      jadeCost: Math.floor(spirit.basePower * jhRarityPower(spirit.rarity) * 2),
    }))
  }, [store.jhSpirits])

  // ── Getter: Tamed Spirits ─────────────────────────────────────
  const jhGetTamedSpirits = useMemo(() => {
    return Object.entries(store.jhSpirits).map(([id, spiritState]) => {
      const def = JH_SPIRITS.find((s) => s.id === spiritState.defId)
      return {
        id,
        ...spiritState,
        def,
        rarityColor: def ? jhGetRarityColor(def.rarity) : '#9CA3AF',
        typeColor: def ? jhGetSpiritTypeColor(def.type) : '#9CA3AF',
        bondProgress: Math.min(100, spiritState.bondLevel * 10),
        power: def ? Math.floor(def.basePower * jhRarityPower(def.rarity) * (1 + spiritState.bondLevel * 0.08)) : 0,
      }
    })
  }, [store.jhSpirits])

  // ── Getter: Cavern Details ────────────────────────────────────
  const jhGetCavernDetails = useMemo(() => {
    return JH_CAVERNS.map((cavern) => {
      const cavernState = store.jhCaverns[cavern.id]
      return {
        ...cavern,
        unlocked: cavernState?.unlocked || false,
        mineCount: cavernState?.mineCount || 0,
        exhaustion: cavernState?.exhaustion || 0,
        maxExhaustion: JH_CAVERN_MAX_EXHAUSTION,
        availableMaterials: cavern.resources
          .map((rId) => JH_MATERIALS.find((m) => m.id === rId))
          .filter(Boolean) as typeof JH_MATERIALS,
        canMine: (cavernState?.unlocked || false) && (cavernState?.exhaustion || 0) < JH_CAVERN_MAX_EXHAUSTION,
        exhaustionPercent: Math.min(100, ((cavernState?.exhaustion || 0) / JH_CAVERN_MAX_EXHAUSTION) * 100),
        biomeColor: jhGetBiomeColor(cavern.biome),
      }
    })
  }, [store.jhCaverns])

  // ── Getter: Material Inventory ────────────────────────────────
  const jhGetMaterialInventory = useMemo(() => {
    return JH_MATERIALS.map((mat) => {
      const owned = store.jhInventory.find((i) => i.materialId === mat.id)?.quantity || 0
      return {
        ...mat,
        owned,
        rarityColor: jhGetRarityColor(mat.rarity),
        rarityLabel: jhGetRarityLabel(mat.rarity),
      }
    })
  }, [store.jhInventory])

  // ── Getter: Structure Details ─────────────────────────────────
  const jhGetStructureDetails = useMemo(() => {
    return JH_STRUCTURES.map((struct) => {
      const key = `struct_${struct.id}`
      const cavernState = store.jhCaverns[key]
      const currentLevel = cavernState?.mineCount || 0
      const nextLevel = currentLevel + 1
      const upgradeCost = Math.floor(struct.baseCost * Math.pow(struct.costMultiplier, nextLevel - 1))
      return {
        ...struct,
        currentLevel,
        built: currentLevel > 0,
        maxed: currentLevel >= struct.maxLevel,
        upgradeCost,
        canAfford: store.jhJade >= upgradeCost && store.jhEnergy >= JH_BUILD_ENERGY_BASE,
      }
    })
  }, [store.jhCaverns, store.jhJade, store.jhEnergy])

  // ── Getter: Artifact Collection ───────────────────────────────
  const jhGetArtifactCollection = useMemo(() => {
    return JH_ARTIFACTS.map((artifact) => ({
      ...artifact,
      activated: store.jhArtifacts.includes(artifact.id),
      rarityColor: jhGetRarityColor(artifact.rarity),
      rarityLabel: jhGetRarityLabel(artifact.rarity),
      activationCost: Math.floor(artifact.power * jhRarityPower(artifact.rarity) * 5),
    }))
  }, [store.jhArtifacts])

  // ── Getter: Unlocked Achievements ─────────────────────────────
  const jhGetUnlockedAchievements = useMemo(() => {
    const unlocked: JHAchievementDef[] = []
    const claimable: JHAchievementDef[] = []

    for (const ach of JH_ACHIEVEMENTS) {
      if (store.jhAchievements.includes(ach.id)) {
        unlocked.push(ach)
      } else if (jhCheckAchievementCondition(store.jhStats, store.jhCaverns, ach.conditionKey)) {
        claimable.push(ach)
      }
    }

    return { unlocked, claimable, total: JH_ACHIEVEMENTS.length, progress: unlocked.length }
  }, [store.jhAchievements, store.jhStats, store.jhCaverns])

  // ── Getter: Title Progress ────────────────────────────────────
  const jhGetTitleProgress = useMemo(() => {
    return JH_TITLES.map((title) => ({
      ...title,
      active: store.jhTitle === title.id,
      unlocked: store.jhLevel >= title.requiredLevel,
    }))
  }, [store.jhTitle, store.jhLevel])

  // ── Getter: Active Event ──────────────────────────────────────
  const jhGetActiveEvent = useMemo(() => {
    if (!store.activeEventId) return null
    return JH_HOLLOW_EVENTS.find((e) => e.id === store.activeEventId) || null
  }, [store.activeEventId])

  // ── Getter: Event History ─────────────────────────────────────
  const jhGetEventHistory = useMemo(() => {
    return store.jhEvents.map((eventId) => {
      const eventDef = JH_HOLLOW_EVENTS.find((e) => e.id === eventId)
      return { eventId, eventDef: eventDef || null }
    })
  }, [store.jhEvents])

  // ── Getter: Stats Summary ─────────────────────────────────────
  const jhGetStatsSummary = useMemo(() => {
    const totalSpirits = JH_SPIRITS.length
    const tamedSpirits = Object.keys(store.jhSpirits).length
    return {
      ...store.jhStats,
      spiritProgress: totalSpirits > 0 ? Math.floor((tamedSpirits / totalSpirits) * 100) : 0,
      totalSpirits,
      tamedSpirits,
      cavernsUnlocked: Object.values(store.jhCaverns).filter((c) => c.unlocked && !c.defId.startsWith('struct_')).length,
      totalCaverns: JH_CAVERNS.length,
      materialsCollected: store.jhInventory.length,
      structuresBuilt: Object.keys(store.jhCaverns).filter((k) => k.startsWith('struct_')).length,
    }
  }, [store.jhStats, store.jhSpirits, store.jhCaverns, store.jhInventory])

  // ── Getter: Rarity Summary ────────────────────────────────────
  const jhGetRaritySummary = useMemo(() => {
    const summary: Record<JHRarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const spiritState of Object.values(store.jhSpirits)) {
      const def = JH_SPIRITS.find((s) => s.id === spiritState.defId)
      if (def) {
        summary[def.rarity] += 1
      }
    }
    for (const aId of store.jhArtifacts) {
      const def = JH_ARTIFACTS.find((a) => a.id === aId)
      if (def) {
        summary[def.rarity] += 1
      }
    }
    return summary
  }, [store.jhSpirits, store.jhArtifacts])

  // ── Getter: Spirit Type Summary ───────────────────────────────
  const jhGetSpiritTypeSummary = useMemo(() => {
    const summary: Record<JHSpiritType, number> = {
      jade_dragon: 0,
      green_phoenix: 0,
      emerald_tortoise: 0,
      bamboo_spirit: 0,
      moss_walker: 0,
      jade_serpent: 0,
      crystal_fairy: 0,
    }
    for (const spiritState of Object.values(store.jhSpirits)) {
      const def = JH_SPIRITS.find((s) => s.id === spiritState.defId)
      if (def) {
        summary[def.type] += 1
      }
    }
    return summary
  }, [store.jhSpirits])

  // ── Level Progress ────────────────────────────────────────────
  const jhLevelProgress = useMemo(() => {
    const currentXpNeeded = jhXpForLevel(store.jhLevel)
    return {
      level: store.jhLevel,
      currentXp: store.jhExp,
      xpToNext: currentXpNeeded,
      maxLevel: store.jhLevel >= JH_MAX_LEVEL,
      progressPercent:
        currentXpNeeded > 0 ? Math.min(100, Math.floor((store.jhExp / currentXpNeeded) * 100)) : 0,
    }
  }, [store.jhLevel, store.jhExp])

  // ── Getter: Next Title ────────────────────────────────────────
  const jhGetNextTitle = useMemo(() => {
    const currentTitle = JH_TITLES.find((t) => t.id === store.jhTitle)
    const currentIndex = currentTitle ? JH_TITLES.indexOf(currentTitle) : -1
    if (currentIndex >= JH_TITLES.length - 1) return null
    return JH_TITLES[currentIndex + 1]
  }, [store.jhTitle])

  // ── Getter: Available Events ──────────────────────────────────
  const jhGetAvailableEvents = useMemo(() => {
    return JH_HOLLOW_EVENTS.filter((e) => !store.jhEvents.includes(e.id))
  }, [store.jhEvents])

  // ── Getter: Energy Status ─────────────────────────────────────
  const jhGetEnergyStatus = useMemo(() => {
    return {
      current: store.jhEnergy,
      max: JH_MAX_ENERGY,
      percent: Math.floor((store.jhEnergy / JH_MAX_ENERGY) * 100),
      isLow: store.jhEnergy < JH_MAX_ENERGY * 0.2,
      isEmpty: store.jhEnergy <= 0,
    }
  }, [store.jhEnergy])

  // ── Getter: Jade Wealth ───────────────────────────────────────
  const jhGetJadeWealth = useMemo(() => {
    const inventoryValue = store.jhInventory.reduce((sum, item) => {
      const def = JH_MATERIALS.find((m) => m.id === item.materialId)
      return sum + (def ? def.value * item.quantity : 0)
    }, 0)
    return {
      jade: store.jhJade,
      inventoryValue,
      totalWealth: store.jhJade + inventoryValue,
    }
  }, [store.jhJade, store.jhInventory])

  // ── Getter: Unlocked Abilities ────────────────────────────────
  const jhGetUnlockedAbilities = useMemo(() => {
    return JH_ABILITIES.map((ability) => ({
      ...ability,
      canUse: store.jhEnergy >= Math.ceil(ability.power / 10),
      typeColor: jhGetAbilityTypeColor(ability.type),
      affinityLabel: ability.spiritTypeAffinity ? jhGetSpiritTypeLabel(ability.spiritTypeAffinity) : null,
    }))
  }, [store.jhEnergy])

  // ── Getter: Structure Categories ──────────────────────────────
  const jhGetStructuresByCategory = useMemo(() => {
    const categories: Record<JHStructureCategory, typeof JH_STRUCTURES> = {
      mining: [],
      spirit_care: [],
      storage: [],
      defense: [],
      utility: [],
    }
    for (const struct of JH_STRUCTURES) {
      categories[struct.category].push(struct)
    }
    return categories
  }, [])

  // ── Getter: Spirits by Type ───────────────────────────────────
  const jhGetSpiritsByType = useMemo(() => {
    const types: Record<JHSpiritType, typeof JH_SPIRITS> = {
      jade_dragon: [],
      green_phoenix: [],
      emerald_tortoise: [],
      bamboo_spirit: [],
      moss_walker: [],
      jade_serpent: [],
      crystal_fairy: [],
    }
    for (const spirit of JH_SPIRITS) {
      types[spirit.type].push(spirit)
    }
    return types
  }, [])

  // ── Getter: Events by Category ───────────────────────────────
  const jhGetEventsByCategory = useMemo(() => {
    const categories: Record<JHEventCategory, typeof JH_HOLLOW_EVENTS> = {
      bounty: [],
      hazard: [],
      migration: [],
      cosmic: [],
    }
    for (const event of JH_HOLLOW_EVENTS) {
      categories[event.category].push(event)
    }
    return categories
  }, [])

  // ── Getter: Top Spirits by Power ─────────────────────────────
  const jhGetTopSpirits = useMemo(() => {
    return [...JH_SPIRITS]
      .sort((a, b) => b.basePower * jhRarityPower(b.rarity) - a.basePower * jhRarityPower(a.rarity))
      .slice(0, 10)
      .map((spirit) => ({
        ...spirit,
        effectivePower: Math.floor(spirit.basePower * jhRarityPower(spirit.rarity)),
        rarityColor: jhGetRarityColor(spirit.rarity),
        typeColor: jhGetSpiritTypeColor(spirit.type),
      }))
  }, [])

  // ── Getter: Cavern Completion Overview ───────────────────────
  const jhGetCavernCompletion = useMemo(() => {
    const total = JH_CAVERNS.length
    const unlocked = JH_CAVERNS.filter((c) => store.jhCaverns[c.id]?.unlocked).length
    const fullyMined = JH_CAVERNS.filter((c) => (store.jhCaverns[c.id]?.exhaustion || 0) >= JH_CAVERN_MAX_EXHAUSTION).length
    return {
      total,
      unlocked,
      fullyMined,
      unlockedPercent: Math.floor((unlocked / total) * 100),
      minedPercent: Math.floor((fullyMined / total) * 100),
    }
  }, [store.jhCaverns])

  // ── Getter: Abilities by Type ────────────────────────────────
  const jhGetAbilitiesByType = useMemo(() => {
    const types: Record<JHAbilityType, typeof JH_ABILITIES> = {
      attack: [],
      defense: [],
      harvest: [],
      taming: [],
      utility: [],
    }
    for (const ability of JH_ABILITIES) {
      types[ability.type].push(ability)
    }
    return types
  }, [])

  // ── Getter: Materials by Rarity ─────────────────────────────
  const jhGetMaterialsByRarity = useMemo(() => {
    const groups: Record<JHRarity, typeof JH_MATERIALS> = {
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      legendary: [],
    }
    for (const mat of JH_MATERIALS) {
      groups[mat.rarity].push(mat)
    }
    return groups
  }, [])

  // ── Getter: Artifact Power Ranking ────────────────────────────
  const jhGetArtifactRanking = useMemo(() => {
    return [...JH_ARTIFACTS]
      .sort((a, b) => b.power * jhRarityPower(b.rarity) - a.power * jhRarityPower(a.rarity))
      .map((artifact, index) => ({
        ...artifact,
        rank: index + 1,
        effectivePower: Math.floor(artifact.power * jhRarityPower(artifact.rarity)),
        rarityColor: jhGetRarityColor(artifact.rarity),
        rarityLabel: jhGetRarityLabel(artifact.rarity),
        activated: store.jhArtifacts.includes(artifact.id),
      }))
  }, [store.jhArtifacts])

  // ── Getter: Active Cavern Full Info ──────────────────────────
  const jhGetActiveCavernInfo = useMemo(() => {
    if (!store.activeCavernId) return null
    const cavernDef = JH_CAVERNS.find((c) => c.id === store.activeCavernId)
    const cavernState = store.jhCaverns[store.activeCavernId]
    if (!cavernDef || !cavernState) return null

    return {
      def: cavernDef,
      state: cavernState,
      biomeColor: jhGetBiomeColor(cavernDef.biome),
      availableMaterials: cavernDef.resources
        .map((rId) => JH_MATERIALS.find((m) => m.id === rId))
        .filter(Boolean) as typeof JH_MATERIALS,
      exhaustionPercent: Math.min(100, (cavernState.exhaustion / JH_CAVERN_MAX_EXHAUSTION) * 100),
      isExhausted: cavernState.exhaustion >= JH_CAVERN_MAX_EXHAUSTION,
      totalMined: cavernState.mineCount,
    }
  }, [store.activeCavernId, store.jhCaverns])

  // ── Getter: Overall Mastery Progress ───────────────────────────
  const jhGetMasteryProgress = useMemo(() => {
    const spiritPercent = JH_SPIRITS.length > 0 ? Math.floor((Object.keys(store.jhSpirits).length / JH_SPIRITS.length) * 100) : 0
    const cavernPercent = JH_CAVERNS.length > 0
      ? Math.floor((JH_CAVERNS.filter((c) => store.jhCaverns[c.id]?.unlocked).length / JH_CAVERNS.length) * 100)
      : 0
    const structPercent = JH_STRUCTURES.length > 0
      ? Math.floor((Object.keys(store.jhCaverns).filter((k) => k.startsWith('struct_')).length / JH_STRUCTURES.length) * 100)
      : 0
    const artifactPercent = JH_ARTIFACTS.length > 0
      ? Math.floor((store.jhArtifacts.length / JH_ARTIFACTS.length) * 100)
      : 0
    const eventPercent = JH_HOLLOW_EVENTS.length > 0
      ? Math.floor((store.jhEvents.length / JH_HOLLOW_EVENTS.length) * 100)
      : 0
    const achievementPercent = JH_ACHIEVEMENTS.length > 0
      ? Math.floor((store.jhAchievements.length / JH_ACHIEVEMENTS.length) * 100)
      : 0

    return {
      spiritPercent,
      cavernPercent,
      structPercent,
      artifactPercent,
      eventPercent,
      achievementPercent,
      overallPercent: Math.floor(
        (spiritPercent + cavernPercent + structPercent + artifactPercent + eventPercent + achievementPercent) / 6
      ),
    }
  }, [store.jhSpirits, store.jhCaverns, store.jhArtifacts, store.jhEvents, store.jhAchievements])

  // ── Getter: Spirit Power Distribution ───────────────────────────
  const jhGetSpiritPowerDistribution = useMemo(() => {
    const distribution: { range: string; count: number; avgPower: number; color: string }[] = [
      { range: '1-25 (Weak)', count: 0, avgPower: 0, color: '#9CA3AF' },
      { range: '26-60 (Moderate)', count: 0, avgPower: 0, color: '#22D3EE' },
      { range: '61-100 (Strong)', count: 0, avgPower: 0, color: '#A78BFA' },
      { range: '101-150 (Elite)', count: 0, avgPower: 0, color: '#F472B6' },
      { range: '151+ (Legendary)', count: 0, avgPower: 0, color: '#FBBF24' },
    ]

    const powers: number[] = []
    for (const spiritState of Object.values(store.jhSpirits)) {
      const def = JH_SPIRITS.find((s) => s.id === spiritState.defId)
      if (def) {
        const power = Math.floor(def.basePower * jhRarityPower(def.rarity) * (1 + spiritState.bondLevel * 0.08))
        powers.push(power)
      }
    }

    for (const p of powers) {
      if (p <= 25) { distribution[0].count += 1; distribution[0].avgPower += p }
      else if (p <= 60) { distribution[1].count += 1; distribution[1].avgPower += p }
      else if (p <= 100) { distribution[2].count += 1; distribution[2].avgPower += p }
      else if (p <= 150) { distribution[3].count += 1; distribution[3].avgPower += p }
      else { distribution[4].count += 1; distribution[4].avgPower += p }
    }

    for (const d of distribution) {
      if (d.count > 0) {
        d.avgPower = Math.floor(d.avgPower / d.count)
      }
    }

    return distribution
  }, [store.jhSpirits])

  // ── Getter: Materials Inventory Value Breakdown ──────────────────
  const jhGetInventoryValueBreakdown = useMemo(() => {
    const breakdown: Record<JHRarity, { count: number; totalValue: number }> = {
      common: { count: 0, totalValue: 0 },
      uncommon: { count: 0, totalValue: 0 },
      rare: { count: 0, totalValue: 0 },
      epic: { count: 0, totalValue: 0 },
      legendary: { count: 0, totalValue: 0 },
    }

    for (const item of store.jhInventory) {
      const def = JH_MATERIALS.find((m) => m.id === item.materialId)
      if (def) {
        breakdown[def.rarity].count += item.quantity
        breakdown[def.rarity].totalValue += def.value * item.quantity
      }
    }

    const grandTotal = Object.values(breakdown).reduce((sum, b) => sum + b.totalValue, 0)
    return { breakdown, grandTotal }
  }, [store.jhInventory])

  // ── Getter: Structure Level Summary ───────────────────────────
  const jhGetStructureLevelSummary = useMemo(() => {
    const levels: Record<number, number> = {}
    for (let i = 0; i <= JH_MAX_STRUCTURE_LEVEL; i++) { levels[i] = 0 }
    for (const key of Object.keys(store.jhCaverns)) {
      if (key.startsWith('struct_')) {
        const cavernState = store.jhCaverns[key]
        if (cavernState && cavernState.mineCount >= 0) {
          levels[cavernState.mineCount] = (levels[cavernState.mineCount] || 0) + 1
        }
      }
    }
    return levels
  }, [store.jhCaverns])

  // ── Getter: Event Impact History ──────────────────────────────
  const jhGetEventImpactHistory = useMemo(() => {
    return store.jhEvents.map((eventId) => {
      const eventDef = JH_HOLLOW_EVENTS.find((e) => e.id === eventId)
      if (!eventDef) return { eventId, severity: 0, jadeEarned: 0, category: 'bounty' as JHEventCategory }
      return {
        eventId,
        name: eventDef.name,
        severity: eventDef.severity,
        jadeEarned: eventDef.severity * 50,
        category: eventDef.category,
        categoryColor: eventDef.category === 'bounty' ? '#22C55E'
          : eventDef.category === 'hazard' ? '#EF4444'
          : eventDef.category === 'migration' ? '#A855F7'
          : '#F59E0B',
      }
    })
  }, [store.jhEvents])

  // ── Getter: Recent Events (last 5) ─────────────────────────
  const jhGetRecentEvents = useMemo(() => {
    return store.jhEvents.slice(-5).reverse().map((eventId) => {
      const eventDef = JH_HOLLOW_EVENTS.find((e) => e.id === eventId)
      return {
        eventId,
        event: eventDef || null,
        name: eventDef?.name || 'Unknown',
        severity: eventDef?.severity || 0,
        category: eventDef?.category || ('bounty' as JHEventCategory),
      }
    })
  }, [store.jhEvents])

  // ── Getter: Total Tamed Power ─────────────────────────────────
  const jhGetTotalTamedPower = useMemo(() => {
    let totalPower = 0
    for (const spiritState of Object.values(store.jhSpirits)) {
      const def = JH_SPIRITS.find((s) => s.id === spiritState.defId)
      if (def) {
        totalPower += Math.floor(def.basePower * jhRarityPower(def.rarity) * (1 + spiritState.bondLevel * 0.08))
      }
    }
    return {
      totalPower,
      averagePower: Object.keys(store.jhSpirits).length > 0
        ? Math.floor(totalPower / Object.keys(store.jhSpirits).length)
        : 0,
      strongestSpirit: [...Object.values(store.jhSpirits)].reduce((best, ss) => {
        const def = JH_SPIRITS.find((s) => s.id === ss.defId)
        if (!def) return best
        const power = Math.floor(def.basePower * jhRarityPower(def.rarity) * (1 + ss.bondLevel * 0.08))
        return power > (best.power || 0) ? { ...ss, power } : best
      }, { power: 0 }).power,
    }
  }, [store.jhSpirits])

  // ── Getter: Taming Cost Estimation ───────────────────────────
  const jhGetTamingCostEstimate = useMemo(() => {
    const untamed = JH_SPIRITS.filter((s) => !store.jhSpirits[s.id])
    const costs = untamed.map((s) => ({
      id: s.id,
      name: s.name,
      rarity: s.rarity,
      rarityLabel: jhGetRarityLabel(s.rarity),
      energyCost: Math.ceil(JH_TAME_ENERGY_BASE + JH_TAME_ENERGY_PER_RARITY * jhRarityPower(s.rarity)),
      jadeCost: Math.floor(s.basePower * jhRarityPower(s.rarity) * 2),
      rarityColor: jhGetRarityColor(s.rarity),
      affordable: store.jhJade >= Math.floor(s.basePower * jhRarityPower(s.rarity) * 2)
        && store.jhEnergy >= Math.ceil(JH_TAME_ENERGY_BASE + JH_TAME_ENERGY_PER_RARITY * jhRarityPower(s.rarity)),
    }))
    return {
      total: untamed.length,
      affordable: costs.filter((c) => c.affordable).length,
      costs: costs.sort((a, b) => a.jadeCost - b.jadeCost),
      cheapest: costs.length > 0 ? costs[0] : null,
    }
  }, [store.jhSpirits, store.jhJade, store.jhEnergy])

  // ── Assemble jhAPI ────────────────────────────────────────────
  const jhAPI = {
    // Constants
    JH_SPIRITS,
    JH_CAVERNS,
    JH_MATERIALS,
    JH_STRUCTURES,
    JH_ABILITIES,
    JH_ACHIEVEMENTS,
    JH_TITLES,
    JH_ARTIFACTS,
    JH_HOLLOW_EVENTS,
    JH_COLOR_JADE_GREEN,
    JH_COLOR_EMERALD,
    JH_COLOR_CRYSTAL_WHITE,
    JH_COLOR_MOSS_BROWN,
    JH_COLOR_DEEP_JADE,
    JH_COLOR_MIST_GREEN,
    JH_COLOR_STONE_GRAY,
    JH_COLOR_GOLD_ACCENT,
    JH_COLOR_SHADOW_JADE,
    JH_COLOR_DAWN_GREEN,
    JH_COLOR_TWILIGHT_TEAL,
    JH_COLOR_VOID_DARK,
    JH_SPIRIT_TYPE_LORE,
    JH_SPIRIT_TYPE_DIET,
    JH_CAVERN_AMBIENT_TEMPS,
    JH_CAVERN_HUMIDITY,
    JH_TAME_ENERGY_BASE,
    JH_TAME_ENERGY_PER_RARITY,
    JH_MINE_ENERGY_BASE,
    JH_BUILD_ENERGY_BASE,
    JH_ARTIFACT_ENERGY_COST,
    JH_EVENT_ENERGY_COST,
    JH_MAX_STRUCTURE_LEVEL,
    JH_MAX_ENERGY,
    JH_MAX_LEVEL,
    JH_CAVERN_MAX_EXHAUSTION,
    JH_BOND_LEVEL_MAX,
    JH_RARITY_TAME_BONUS_COMMON,
    JH_RARITY_TAME_BONUS_UNCOMMON,
    JH_RARITY_TAME_BONUS_RARE,
    JH_RARITY_TAME_BONUS_EPIC,
    JH_RARITY_TAME_BONUS_LEGENDARY,

    // State
    jhSpirits: store.jhSpirits,
    jhCaverns: store.jhCaverns,
    jhInventory: store.jhInventory,
    jhArtifacts: store.jhArtifacts,
    jhAchievements: store.jhAchievements,
    jhTitle: store.jhTitle,
    jhEvents: store.jhEvents,
    jhStats: store.jhStats,
    jhLevel: store.jhLevel,
    jhExp: store.jhExp,
    jhJade: store.jhJade,
    jhEnergy: store.jhEnergy,
    activeCavernId: store.activeCavernId,
    activeEventId: store.activeEventId,
    eventTimer: store.eventTimer,

    // Actions
    tameSpirit: store.tameSpirit,
    mineCavern: store.mineCavern,
    buildStructure: store.buildStructure,
    activateArtifact: store.activateArtifact,
    triggerHollowEvent: store.triggerHollowEvent,
    resetJadeHollow: store.resetJadeHollow,

    // Getters
    jhGetSpiritDetails,
    jhGetTamedSpirits,
    jhGetCavernDetails,
    jhGetMaterialInventory,
    jhGetStructureDetails,
    jhGetArtifactCollection,
    jhGetUnlockedAchievements,
    jhGetTitleProgress,
    jhGetActiveEvent,
    jhGetEventHistory,
    jhGetStatsSummary,
    jhGetRaritySummary,
    jhGetSpiritTypeSummary,
    jhLevelProgress,
    jhGetNextTitle,
    jhGetAvailableEvents,
    jhGetEnergyStatus,
    jhGetJadeWealth,
    jhGetUnlockedAbilities,
    jhGetStructuresByCategory,
    jhGetSpiritsByType,
    jhGetEventsByCategory,
    jhGetTopSpirits,
    jhGetCavernCompletion,
  }

  return jhAPI
}
