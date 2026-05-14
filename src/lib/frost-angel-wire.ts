/**
 * Frost Angel Wire — 冰霜天使 feature module for Word Snake
 *
 * A celestial frozen realm exploration and management mini-game: summon 35 frost
 * angels across 5 rarity tiers, explore 8 celestial realms, collect 30 blessed
 * materials, build 25 sanctuary structures, wield 22 angelic abilities, earn 8
 * sacred titles, gather 15 halos, and survive 12 divine events — backed by a
 * Zustand store with persist middleware.
 *
 * Storage key: frost-angel-wire
 * Prefix: fa / FA_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type FARarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type FAElement = 'Ice' | 'Light' | 'Crystal' | 'Snow' | 'Star' | 'Halo' | 'Frost'

export interface FAAngelDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly element: FAElement
  readonly rarity: FARarity
  readonly basePower: number
  readonly ability: string
}

export interface FARealmDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly minLevel: number
  readonly unlockCost: number
  readonly bonuses: string[]
}

export interface FAMaterialDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: FARarity
  readonly source: string
  readonly value: number
}

export interface FAStructureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly costMultiplier: number
}

export interface FAAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly element: FAElement
}

export interface FAAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface FATitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredRealms: number
}

export interface FAHaloDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: FARarity
  readonly powerBonus: number
  readonly specialAbility: string
}

export interface FAEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly duration: number
  readonly effects: string[]
}

export interface FASummonedAngel {
  readonly id: string
  angelDefId: string
  name: string
  level: number
  currentHP: number
  maxHP: number
  power: number
  ascended: boolean
  ascensionCount: number
  acquiredAt: number
}

export interface FAOwnedStructure {
  readonly id: string
  structureDefId: string
  level: number
  built: boolean
}

export interface FASanctuaryState {
  health: number
  maxHealth: number
  corruption: number
  lastHealedAt: number | null
}

export interface FAStoreState {
  summonedAngels: FASummonedAngel[]
  collectedMaterials: Record<string, number>
  structures: FAOwnedStructure[]
  achievements: string[]
  currentTitle: string
  collectedHalos: string[]
  unlockedRealms: string[]
  angelLevel: number
  angelExp: number
  gold: number
  faithEnergy: number
  totalSummoned: number
  totalBlessed: number
  totalUpgraded: number
  totalAscended: number
  totalMiracles: number
  activeEventId: string | null
  eventTimer: number
  sanctuary: FASanctuaryState
  activeRealmId: string | null
}

export interface FAStoreActions {
  faSummonAngel: (angelId: string) => boolean
  faBlessMaterial: (materialId: string) => number
  faUpgradeSanctuary: (structureId: string) => boolean
  faUseAbility: (abilityId: string) => boolean
  faTriggerDivineEvent: (eventId: string) => boolean
  faCollectHalo: (haloId: string) => boolean
  faAscendAngel: (instanceId: string) => boolean
  faPurifyCorruption: (amount: number) => boolean
  faHealSanctuary: (amount: number) => boolean
  faUnlockRealm: (realmId: string) => boolean
  faPerformMiracle: (targetId: string) => boolean
}

export type FAFullStore = FAStoreState & FAStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const FA_COLOR_ICE_WHITE: string = '#F0F8FF'
export const FA_COLOR_FROST_BLUE: string = '#A5D8FF'
export const FA_COLOR_CRYSTAL_SILVER: string = '#C0C0E0'
export const FA_COLOR_HALO_GOLD: string = '#FFD700'
export const FA_COLOR_ANGELIC_PINK: string = '#FFB6C1'
export const FA_COLOR_SNOW_LAVENDER: string = '#E6E6FA'
export const FA_COLOR_DIVINE_CYAN: string = '#00CED1'
export const FA_COLOR_WINTER_ROSE: string = '#FF85A2'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: XP & LEVEL HELPERS
// ═══════════════════════════════════════════════════════════════════

const FA_MAX_LEVEL = 50
const FA_INITIAL_GOLD = 500
const FA_INITIAL_ENERGY = 100

function faXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= FA_MAX_LEVEL) return Infinity
  return Math.floor(90 * Math.pow(1.14, level) + level * 18)
}

function faLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < FA_MAX_LEVEL) {
    const needed = faXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function faGenerateId(): string {
  return `fa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function faRarityMultiplier(rarity: FARarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.5
    case 'rare': return 2.2
    case 'epic': return 3.5
    case 'legendary': return 6.0
  }
}

function faElementColor(element: FAElement): string {
  switch (element) {
    case 'Ice': return FA_COLOR_ICE_WHITE
    case 'Light': return FA_COLOR_HALO_GOLD
    case 'Crystal': return FA_COLOR_CRYSTAL_SILVER
    case 'Snow': return FA_COLOR_SNOW_LAVENDER
    case 'Star': return FA_COLOR_DIVINE_CYAN
    case 'Halo': return FA_COLOR_ANGELIC_PINK
    case 'Frost': return FA_COLOR_FROST_BLUE
  }
}

function faRarityColor(rarity: FARarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#22D3EE'
    case 'rare': return '#818CF8'
    case 'epic': return '#F472B6'
    case 'legendary': return '#FBBF24'
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: ELEMENT BONUSES & SUMMON CHANCES
// ═══════════════════════════════════════════════════════════════════

const FA_ELEMENT_BONUSES: Record<FAElement, { defense: number; speed: number; healBonus: number }> = {
  Ice: { defense: 15, speed: 5, healBonus: 0 },
  Light: { defense: 5, speed: 10, healBonus: 20 },
  Crystal: { defense: 20, speed: 0, healBonus: 5 },
  Snow: { defense: 10, speed: 15, healBonus: 0 },
  Star: { defense: 5, speed: 20, healBonus: 10 },
  Halo: { defense: 10, speed: 5, healBonus: 25 },
  Frost: { defense: 25, speed: 0, healBonus: 0 },
}

const FA_SUMMON_CHANCES: Record<FARarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1,
}

const FA_REALM_ELEMENT_BONUS: Record<string, FAElement[]> = {
  whispering_tundra: ['Ice', 'Snow'],
  crystal_vale: ['Crystal', 'Ice'],
  aurora_plateau: ['Light', 'Star'],
  frozen_sanctuary: ['Halo', 'Light'],
  starfall_glacier: ['Star', 'Crystal'],
  halo_cathedral: ['Halo', 'Crystal'],
  void_frost_abyss: ['Frost', 'Star'],
  eternal_winter_throne: ['Frost', 'Ice', 'Crystal', 'Snow', 'Star', 'Halo', 'Light'],
}

function faGetElementBonus(element: FAElement): { defense: number; speed: number; healBonus: number } {
  return FA_ELEMENT_BONUSES[element]
}

function faGetSummonChance(rarity: FARarity, activeRealmId: string | null): number {
  let chance = FA_SUMMON_CHANCES[rarity]
  if (activeRealmId) {
    const bonusElements = FA_REALM_ELEMENT_BONUS[activeRealmId]
    if (bonusElements && bonusElements.length > 2) {
      chance = chance * 1.5
    }
  }
  return Math.min(100, Math.floor(chance))
}

function faGetAscensionBonus(level: number, ascensionCount: number): number {
  return Math.floor(level * 15 * (1 + ascensionCount * 0.3))
}

function faGetStructureBonus(structureId: string, level: number): number {
  switch (structureId) {
    case 'frost_altar': return level * 2
    case 'crystal_summoning_circle': return level * 5
    case 'aurora_conduit': return level * 8
    case 'halo_beacon': return level * 12
    case 'throne_summoning_gate': return level * 20
    case 'faith_well': return level * 3
    case 'divine_forge': return level * 7
    case 'miracle_altar': return level * 15
    default: return level * 2
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: FA_ANGELS — 35 Frost Angels (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const FA_ANGELS: readonly FAAngelDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'frost_sprout',
    name: 'Frost Sprout Angel',
    description:
      'A tiny angel born from the first frost of winter. Its delicate wings shimmer with crystalline dew, and its presence causes gentle snowfall in a small radius around it. Often seen guiding lost travelers through winter forests.',
    element: 'Snow',
    rarity: 'common',
    basePower: 15,
    ability: 'Gentle Snowfall',
  },
  {
    id: 'ice_chip_guardian',
    name: 'Ice Chip Guardian',
    description:
      'A sturdy little angel formed from the hardest ice chip of a frozen lake. It carries a miniature shield made of frozen water and stands guard over the weakest creatures during harsh winters.',
    element: 'Ice',
    rarity: 'common',
    basePower: 18,
    ability: 'Frost Shield',
  },
  {
    id: 'snowdrift_messenger',
    name: 'Snowdrift Messenger',
    description:
      'A swift angel that rides the wind like a snowdrift, delivering messages across frozen landscapes. Its laughter sounds like chiming icicles, and it never gets tired no matter how far it travels.',
    element: 'Snow',
    rarity: 'common',
    basePower: 16,
    ability: 'Wind Glide',
  },
  {
    id: 'crystal_sapling',
    name: 'Crystal Sapling Angel',
    description:
      'A young angel growing from a crystal seed planted in permafrost. As it matures, its wings develop faceted surfaces that refract light into prismatic displays of winter colors.',
    element: 'Crystal',
    rarity: 'common',
    basePower: 17,
    ability: 'Prismatic Glimmer',
  },
  {
    id: 'dawn_flicker',
    name: 'Dawn Flicker Angel',
    description:
      'An angel that appears at the first light of dawn over snowy peaks. It absorbs the golden rays and radiates warmth that melts only the most dangerous ice, leaving beautiful frost patterns behind.',
    element: 'Light',
    rarity: 'common',
    basePower: 20,
    ability: 'Dawn Radiance',
  },
  {
    id: 'halo_wisp',
    name: 'Halo Wisp Angel',
    description:
      'A playful angel whose tiny halo pulses with a soft pink glow. It dances between snowflakes, leaving trails of angelic light that comfort those who are cold and alone.',
    element: 'Halo',
    rarity: 'common',
    basePower: 14,
    ability: 'Comforting Glow',
  },
  {
    id: 'frostbite_scout',
    name: 'Frostbite Scout Angel',
    description:
      'A nimble scout angel that patrols the edges of frozen domains. Its keen senses can detect cracks in ice before they form, and it warns others of impending avalanches with sharp whistles.',
    element: 'Frost',
    rarity: 'common',
    basePower: 19,
    ability: 'Avalanche Warning',
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'glacial_sentinel',
    name: 'Glacial Sentinel Angel',
    description:
      'A tall angel carved from the walls of ancient glaciers. Its body is translucent blue, and within it you can see the frozen history of millennia — air bubbles, ancient pollen, and trapped starlight.',
    element: 'Ice',
    rarity: 'uncommon',
    basePower: 32,
    ability: 'Glacial Wall',
  },
  {
    id: 'starfrost_herald',
    name: 'Starfrost Herald Angel',
    description:
      'A herald angel that falls from the sky during meteor showers, trailing stardust and frost. Its wings are made of condensed starlight that never dims, even in the deepest polar night.',
    element: 'Star',
    rarity: 'uncommon',
    basePower: 35,
    ability: 'Starfall Call',
  },
  {
    id: 'crystal_weaver',
    name: 'Crystal Weaver Angel',
    description:
      'An artisan angel that spins threads of pure crystal from the moisture in frozen air. It weaves intricate tapestries that depict future winters, and wearing its creations grants resistance to all cold.',
    element: 'Crystal',
    rarity: 'uncommon',
    basePower: 30,
    ability: 'Crystal Loom',
  },
  {
    id: 'aurora_dancer',
    name: 'Aurora Dancer Angel',
    description:
      'An ethereal angel that dances within the aurora borealis, painting the sky with ribbons of green and violet light. Its movements create harmonic frequencies that heal the injured and calm the frightened.',
    element: 'Light',
    rarity: 'uncommon',
    basePower: 34,
    ability: 'Aurora Healing',
  },
  {
    id: 'snow_tempest',
    name: 'Snow Tempest Angel',
    description:
      'A fierce angel that commands localized blizzards with a single flap of its enormous wings. It can summon walls of swirling snow to shield allies or bury enemies in drifts ten feet deep.',
    element: 'Snow',
    rarity: 'uncommon',
    basePower: 38,
    ability: 'Blizzard Command',
  },
  {
    id: 'halo_archer',
    name: 'Halo Archer Angel',
    description:
      'An angelic marksman whose bow is shaped from a perfect ring of divine light. Its arrows are condensed halos that freeze their targets in a stasis field of golden ice upon impact.',
    element: 'Halo',
    rarity: 'uncommon',
    basePower: 36,
    ability: 'Halo Arrow',
  },
  {
    id: 'permafrost_keeper',
    name: 'Permafrost Keeper Angel',
    description:
      'A guardian angel tasked with maintaining the ancient permafrost that holds the world\'s oldest secrets. Its touch can freeze anything to absolute zero, and it never forgets anything it has witnessed.',
    element: 'Frost',
    rarity: 'uncommon',
    basePower: 33,
    ability: 'Absolute Zero Touch',
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'diamond_seraph',
    name: 'Diamond Seraph Angel',
    description:
      'A seraph-class angel whose entire being is composed of living diamond. Light entering its crystalline body is amplified a thousandfold, creating devastating beams of concentrated radiance. Unbreakable and eternal.',
    element: 'Crystal',
    rarity: 'rare',
    basePower: 58,
    ability: 'Diamond Beam',
  },
  {
    id: 'winter_monarch',
    name: 'Winter Monarch Angel',
    description:
      'A regal angel that rules over an entire season of winter. Its crown is made of icicles that never melt, and its decree can extend winter across continents or shorten it to a single night.',
    element: 'Frost',
    rarity: 'rare',
    basePower: 62,
    ability: 'Winter Decree',
  },
  {
    id: 'celestial_north',
    name: 'Celestial North Star Angel',
    description:
      'An angel that embodies the North Star itself. It hangs fixed in the celestial sphere, a beacon of unchanging light that has guided countless souls through the darkest and coldest nights of their lives.',
    element: 'Star',
    rarity: 'rare',
    basePower: 55,
    ability: 'Eternal Beacon',
  },
  {
    id: 'frost_wyrm_rider',
    name: 'Frost Wyrm Rider Angel',
    description:
      'A warrior angel that has tamed an ancient frost wyrm. Together they soar through blizzards that would kill any other being, striking from above with claws of ice and breath of liquid nitrogen.',
    element: 'Ice',
    rarity: 'rare',
    basePower: 65,
    ability: 'Wyrm Dive',
  },
  {
    id: 'lightweaver_cherub',
    name: 'Lightweaver Cherub Angel',
    description:
      'A cherub of extraordinary power that weaves physical light into solid constructs. It can build bridges of dawn, walls of noon, and weapons of twilight, all from pure concentrated luminescence.',
    element: 'Light',
    rarity: 'rare',
    basePower: 60,
    ability: 'Solid Light Construct',
  },
  {
    id: 'blizzard_sovereign',
    name: 'Blizzard Sovereign Angel',
    description:
      'An angel that is one with the concept of blizzards themselves. Where it flies, storms follow. It can create whiteout conditions at will, controlling every snowflake within a hundred-mile radius.',
    element: 'Snow',
    rarity: 'rare',
    basePower: 57,
    ability: 'Whiteout Domain',
  },
  {
    id: 'halo_matriarch',
    name: 'Halo Matriarch Angel',
    description:
      'The mother of all halo-bearing angels. She can split her magnificent golden halo into thousands of smaller rings that orbit her like a solar system, each one capable of independent divine intervention.',
    element: 'Halo',
    rarity: 'rare',
    basePower: 63,
    ability: 'Halo Swarm',
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'eternal_glacier_throne',
    name: 'Eternal Glacier Throne Angel',
    description:
      'A colossal angel seated upon a throne carved from a glacier that has existed since the last ice age. Its mere presence drops the temperature by fifty degrees, and its voice causes avalanches on distant mountains.',
    element: 'Ice',
    rarity: 'epic',
    basePower: 95,
    ability: 'Ice Age Awakening',
  },
  {
    id: 'prismatic_archangel',
    name: 'Prismatic Archangel',
    description:
      'An archangel whose six wings each refract a different spectrum of divine light. When all wings spread simultaneously, they create a prismatic barrier that is absolutely impenetrable to any form of attack.',
    element: 'Crystal',
    rarity: 'epic',
    basePower: 100,
    ability: 'Prismatic Fortress',
  },
  {
    id: 'stellar_winter_emperor',
    name: 'Stellar Winter Emperor Angel',
    description:
      'An emperor angel that commands both the cold of deep space and the fury of winter storms. It has extinguished stars with its breath and reignited them with a touch of its frost-tipped fingers.',
    element: 'Star',
    rarity: 'epic',
    basePower: 105,
    ability: 'Stellar Winter',
  },
  {
    id: 'divine_halo_seraphim',
    name: 'Divine Halo Seraphim Angel',
    description:
      'A seraphim-class entity surrounded by seven nested halos of decreasing size, each spinning in a different direction. The combined divine energy output is enough to power a small city with pure faith.',
    element: 'Halo',
    rarity: 'epic',
    basePower: 98,
    ability: 'Sevenfold Halo',
  },
  {
    id: 'absolute_frost_thane',
    name: 'Absolute Frost Thane Angel',
    description:
      'A warrior angel that has achieved mastery over the concept of cold itself. It can freeze concepts, not just matter — it once froze the idea of betrayal in a mortal\'s heart, preventing treason before it could happen.',
    element: 'Frost',
    rarity: 'epic',
    basePower: 92,
    ability: 'Concept Freeze',
  },
  {
    id: 'aurora_queen',
    name: 'Aurora Queen Angel',
    description:
      'The queen of all aurora phenomena across every planet that has an atmosphere. Her crown is the magnetic field itself, and she dances across the sky in curtains of light visible from hundreds of miles away.',
    element: 'Light',
    rarity: 'epic',
    basePower: 96,
    ability: 'Global Aurora',
  },
  {
    id: 'nevada_golem_herald',
    name: 'Nevada Golem Herald Angel',
    description:
      'A unique angel-golem hybrid forged from the heart of a mountain. It can reshape entire landscapes with its hands, creating valleys of ice and mountains of snow in a single afternoon of work.',
    element: 'Snow',
    rarity: 'epic',
    basePower: 88,
    ability: 'Landscape Sculpting',
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'frost_primordial',
    name: 'Frost Primordial Angel',
    description:
      'The first angel ever to exist, born at the exact moment the universe cooled enough for ice to form. It IS the concept of frost given consciousness. To stand before it is to understand the beginning and end of all cold.',
    element: 'Frost',
    rarity: 'legendary',
    basePower: 150,
    ability: 'Genesis of Cold',
  },
  {
    id: 'celestial_diamond_titan',
    name: 'Celestial Diamond Titan Angel',
    description:
      'A titan-class angel composed of celestial diamond — a material that exists in no natural dimension. It is harder than the fabric of reality itself, and its facets contain reflections of every possible universe.',
    element: 'Crystal',
    rarity: 'legendary',
    basePower: 145,
    ability: 'Reality Diamond',
  },
  {
    id: 'north_star_sovereign',
    name: 'North Star Sovereign Angel',
    description:
      'The angelic embodiment of Polaris, the star that has guided humanity for millennia. It is fixed at the center of the celestial sphere, and all navigation magic in every world draws power from its unwavering light.',
    element: 'Star',
    rarity: 'legendary',
    basePower: 140,
    ability: 'Axis Mundi',
  },
  {
    id: 'eternal_winter_archon',
    name: 'Eternal Winter Archon Angel',
    description:
      'The archon responsible for the concept of eternal winter. When this angel descends, spring never comes. Its domain is a paradise of perfect ice sculptures, silent snowfalls, and the peaceful beauty of endless frost.',
    element: 'Ice',
    rarity: 'legendary',
    basePower: 148,
    ability: 'Perpetual Winter',
  },
  {
    id: 'halo_of_creation',
    name: 'Halo of Creation Angel',
    description:
      'The angel whose halo was the template from which all other halos were made. It is said that when this angel first opened its eyes, the light that poured forth became the template for every sunrise that has ever occurred.',
    element: 'Halo',
    rarity: 'legendary',
    basePower: 142,
    ability: 'Genesis Halo',
  },
  {
    id: 'dawn_of_ages',
    name: 'Dawn of Ages Angel',
    description:
      'An ancient being that witnessed the very first dawn. Its body is made of solidified golden light from that primordial morning, and it carries the memory of every sunrise that has graced the world since time began.',
    element: 'Light',
    rarity: 'legendary',
    basePower: 138,
    ability: 'First Dawn',
  },
  {
    id: 'world_snow_mother',
    name: 'World Snow Mother Angel',
    description:
      'The mother goddess of all snowfall. Every snowflake that has ever fallen or will ever fall is a fragment of her infinite being. She blankets the world in white not to kill, but to give the earth peaceful rest.',
    element: 'Snow',
    rarity: 'legendary',
    basePower: 135,
    ability: 'Infinite Snowfall',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: FA_REALMS — 8 Celestial Frozen Realms
// ═══════════════════════════════════════════════════════════════════

export const FA_REALMS: readonly FARealmDef[] = [
  {
    id: 'whispering_tundra',
    name: 'Whispering Tundra',
    description:
      'A vast frozen plain where the wind carries whispers of ancient prayers. The snow here shimmers with a faint internal light, and travelers report hearing their names called by unseen voices.',
    minLevel: 1,
    unlockCost: 0,
    bonuses: ['+5% summon rate', 'Basic material gathering'],
  },
  {
    id: 'crystal_vale',
    name: 'Crystal Vale',
    description:
      'A valley carpeted with natural crystals that grow like flowers from the permafrost. The air is so cold it crackles, and every sound produces harmonics that echo through the crystal formations for hours.',
    minLevel: 5,
    unlockCost: 200,
    bonuses: ['+10% crystal material yield', 'Rare angel encounters'],
  },
  {
    id: 'aurora_plateau',
    name: 'Aurora Plateau',
    description:
      'An elevated plateau perpetually bathed in the colors of the aurora borealis. The magnetic field here is so strong that angelic beings are naturally attracted to it, making it a prime summoning ground.',
    minLevel: 10,
    unlockCost: 500,
    bonuses: ['+15% angel power', 'Aurora healing aura'],
  },
  {
    id: 'frozen_sanctuary',
    name: 'Frozen Sanctuary',
    description:
      'A sacred temple complex carved entirely from a single enormous block of eternal ice. The walls contain frozen scenes depicting the history of frost angels, and the central altar pulses with divine energy.',
    minLevel: 15,
    unlockCost: 1200,
    bonuses: ['+20% faith energy regeneration', 'Sanctuary upgrades available'],
  },
  {
    id: 'starfall_glacier',
    name: 'Starfall Glacier',
    description:
      'A massive glacier embedded with countless meteorite fragments that fell during an ancient cosmic event. The star-metal within the ice gives it an otherworldly blue glow and unique magical properties.',
    minLevel: 22,
    unlockCost: 3000,
    bonuses: ['+25% star element power', 'Star materials available'],
  },
  {
    id: 'halo_cathedral',
    name: 'Halo Cathedral',
    description:
      'A soaring cathedral made of concentric halo rings frozen in space. Light passing through the rings creates rainbow patterns that decode into angelic scripture. The most devout pilgrims journey here to read the rings.',
    minLevel: 30,
    unlockCost: 7500,
    bonuses: ['+30% halo element power', 'Epic angel summoning unlocked'],
  },
  {
    id: 'void_frost_abyss',
    name: 'Void Frost Abyss',
    description:
      'A crevasse so deep that its bottom has never been found. The cold here is not natural — it is the cold of void itself seeping into the world. Only the strongest angels can survive its depths without shattering.',
    minLevel: 38,
    unlockCost: 15000,
    bonuses: ['+35% frost element power', 'Legendary material chance'],
  },
  {
    id: 'eternal_winter_throne',
    name: 'Eternal Winter Throne',
    description:
      'The heart of all frost domains — a palace made of impossible ice that exists in a state of eternal perfection. Time does not pass here. Snow falls upward. The throne at its center resonates with the power of creation.',
    minLevel: 45,
    unlockCost: 30000,
    bonuses: ['+50% all element power', 'Legendary angel summoning', 'Miracle performing'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: FA_MATERIALS — 30 Blessed Materials
// ═══════════════════════════════════════════════════════════════════

export const FA_MATERIALS: readonly FAMaterialDef[] = [
  // Common (6)
  { id: 'frost_dust', name: 'Frost Dust', description: 'Fine crystalline powder harvested from morning frost. Used in basic blessing rituals and as a coolant for angel summoning circles.', rarity: 'common', source: 'whispering_tundra', value: 5 },
  { id: 'snow_essence', name: 'Snow Essence', description: 'Concentrated moisture from untouched snowfall. Has mild healing properties when dissolved in holy water.', rarity: 'common', source: 'whispering_tundra', value: 6 },
  { id: 'ice_pebble', name: 'Ice Pebble', description: 'A small, perfectly smooth stone of clear ice. Never melts at room temperature and can store tiny amounts of faith energy.', rarity: 'common', source: 'whispering_tundra', value: 4 },
  { id: 'frozen_feather', name: 'Frozen Feather', description: 'A feather shed by a low-ranking frost angel. It maintains a constant temperature of exactly zero degrees Celsius.', rarity: 'common', source: 'whispering_tundra', value: 8 },
  { id: 'glacier_shard', name: 'Glacier Shard', description: 'A fragment chipped from an ancient glacier. Contains microscopic air bubbles that produce soft chiming sounds when warmed.', rarity: 'common', source: 'crystal_vale', value: 7 },
  { id: 'frost_blossom', name: 'Frost Blossom', description: 'A rare flower that blooms only in sub-zero temperatures. Its petals are made of thin ice that refracts light like stained glass.', rarity: 'common', source: 'whispering_tundra', value: 9 },

  // Uncommon (6)
  { id: 'crystal_nectar', name: 'Crystal Nectar', description: 'Sweet liquid that flows within crystal formations. It enhances the power of any angelic ability it is mixed with.', rarity: 'uncommon', source: 'crystal_vale', value: 28 },
  { id: 'aurora_silk', name: 'Aurora Silk', description: 'Thread harvested from aurora-touched spider webs. When woven into clothing, it grants resistance to cold and a faint protective glow.', rarity: 'uncommon', source: 'aurora_plateau', value: 35 },
  { id: 'holy_icicle', name: 'Holy Icicle', description: 'An icicle that formed inside a blessed structure. It radiates faint divine energy and can be used as a focus for basic healing spells.', rarity: 'uncommon', source: 'frozen_sanctuary', value: 32 },
  { id: 'starlit_snow', name: 'Starlit Snow', description: 'Snow that has absorbed starlight during a meteor shower. It glows faintly in the dark and is used in star-element angel summoning.', rarity: 'uncommon', source: 'aurora_plateau', value: 40 },
  { id: 'permafrost_resin', name: 'Permafrost Resin', description: 'Ancient tree resin frozen for millennia in permafrost. Contains prehistoric plant DNA that enhances growth-related abilities.', rarity: 'uncommon', source: 'crystal_vale', value: 30 },
  { id: 'halo_fragment', name: 'Halo Fragment', description: 'A small piece of a shattered halo. It still contains traces of divine light that pulse in rhythm with a heartbeat.', rarity: 'uncommon', source: 'frozen_sanctuary', value: 45 },

  // Rare (6)
  { id: 'eternal_ice_core', name: 'Eternal Ice Core', description: 'The heart of a glacier that has never melted since the last ice age. It generates its own cold infinitely and can power structures for centuries.', rarity: 'rare', source: 'frozen_sanctuary', value: 120 },
  { id: 'diamond_frost_gem', name: 'Diamond Frost Gem', description: 'A gemstone formed when diamond dust is compressed by glacier movement over thousands of years. Prisms of light within it shift with the seasons.', rarity: 'rare', source: 'crystal_vale', value: 150 },
  { id: 'aurora_crystal', name: 'Aurora Crystal', description: 'A crystal that has absorbed aurora light for centuries. When activated, it projects a full aurora display in a dome around the user.', rarity: 'rare', source: 'aurora_plateau', value: 140 },
  { id: 'star_metal_shard', name: 'Star Metal Shard', description: 'A fragment of meteorite embedded in the Starfall Glacier. It is lighter than air, harder than diamond, and hums with cosmic energy.', rarity: 'rare', source: 'starfall_glacier', value: 160 },
  { id: 'seraph_tear', name: 'Seraph Tear', description: 'A single frozen tear from a weeping seraph angel. It contains concentrated divine sorrow that can purify corruption in any form.', rarity: 'rare', source: 'frozen_sanctuary', value: 135 },
  { id: 'winter_bloom_seed', name: 'Winter Bloom Seed', description: 'A seed from the mythical Winter Bloom tree that flowers once every thousand years. Planting it accelerates all growth in a frozen area.', rarity: 'rare', source: 'starfall_glacier', value: 110 },

  // Epic (6)
  { id: 'void_ice_crystal', name: 'Void Ice Crystal', description: 'Ice formed at the boundary between reality and void. It is colder than cold — it absorbs heat from the very concept of temperature.', rarity: 'epic', source: 'void_frost_abyss', value: 500 },
  { id: 'archangel_plume', name: 'Archangel Plume', description: 'A feather from an archangel\'s wing. Each barb contains a micro-universe of frozen possibilities. Holding it lets you glimpse alternate timelines.', rarity: 'epic', source: 'halo_cathedral', value: 550 },
  { id: 'genesis_frost_drop', name: 'Genesis Frost Drop', description: 'A drop of the original frost that formed at the dawn of creation. It is said to contain the blueprint for all ice in the universe.', rarity: 'epic', source: 'void_frost_abyss', value: 600 },
  { id: 'halo_ring_core', name: 'Halo Ring Core', description: 'The central luminous core of a halo that has accumulated divine energy for millennia. It pulses with the combined faith of millions.', rarity: 'epic', source: 'halo_cathedral', value: 520 },
  { id: 'world_ice_heart', name: 'World Ice Heart', description: 'A massive crystalline formation found at the geometric center of a glacier. It beats like a heart, regulating the ice flow of the entire region.', rarity: 'epic', source: 'void_frost_abyss', value: 480 },
  { id: 'aurora_crown_shard', name: 'Aurora Crown Shard', description: 'A shard from the Aurora Queen\'s crown. It contains the essence of the most powerful aurora ever witnessed, visible from space.', rarity: 'epic', source: 'halo_cathedral', value: 570 },

  // Legendary (6)
  { id: 'primordial_frost_essence', name: 'Primordial Frost Essence', description: 'The pure essence of the concept of cold itself, distilled into liquid form. A single drop can freeze an ocean. Two drops can freeze time.', rarity: 'legendary', source: 'eternal_winter_throne', value: 5000 },
  { id: 'eternal_diamond', name: 'Eternal Diamond', description: 'A diamond that exists outside of time. It was never formed, it has always existed, and it will never be destroyed. Its facets show every moment simultaneously.', rarity: 'legendary', source: 'eternal_winter_throne', value: 6000 },
  { id: 'star_forge_core', name: 'Star Forge Core', description: 'The core of a dead star preserved in eternal ice. It still contains enough nuclear energy to reignite the star if the ice were ever melted.', rarity: 'legendary', source: 'eternal_winter_throne', value: 5500 },
  { id: 'divine_halo_matrix', name: 'Divine Halo Matrix', description: 'The fundamental pattern from which all halos are constructed. Studying it reveals the mathematical proof of divinity itself.', rarity: 'legendary', source: 'eternal_winter_throne', value: 7000 },
  { id: 'world_tree_frost_sap', name: 'World Tree Frost Sap', description: 'Sap from the roots of the World Tree where they extend into permafrost. It contains the memory of every winter that has ever occurred.', rarity: 'legendary', source: 'eternal_winter_throne', value: 6500 },
  { id: 'throne_of_winter_fragment', name: 'Throne of Winter Fragment', description: 'A piece of the Eternal Winter Throne that has broken off. It still contains a fraction of the throne\'s absolute authority over all cold things.', rarity: 'legendary', source: 'eternal_winter_throne', value: 8000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: FA_STRUCTURES — 25 Sanctuary Structures
// ═══════════════════════════════════════════════════════════════════

export const FA_STRUCTURES: readonly FAStructureDef[] = [
  // Summoning (5)
  { id: 'frost_altar', name: 'Frost Altar', description: 'A basic altar of compacted snow and ice used for summoning common frost angels. Must be maintained below freezing to function.', baseCost: 100, costMultiplier: 1.5 },
  { id: 'crystal_summoning_circle', name: 'Crystal Summoning Circle', description: 'An intricate circle carved from crystal slabs that amplifies summoning rituals. Increases the chance of attracting uncommon angels.', baseCost: 400, costMultiplier: 1.6 },
  { id: 'aurora_conduit', name: 'Aurora Conduit', description: 'A towering crystal antenna that channels aurora energy into summoning circles. Required for rare angel summoning.', baseCost: 1200, costMultiplier: 1.7 },
  { id: 'halo_beacon', name: 'Halo Beacon', description: 'A divine beacon that broadcasts a signal across dimensions, attracting powerful angels from distant celestial realms.', baseCost: 3000, costMultiplier: 1.8 },
  { id: 'throne_summoning_gate', name: 'Throne Summoning Gate', description: 'The ultimate summoning structure connected directly to the Eternal Winter Throne. Capable of calling legendary angels.', baseCost: 8000, costMultiplier: 2.0 },

  // Production (5)
  { id: 'frost_harvester', name: 'Frost Harvester', description: 'An automated device that collects frost and ice from the surrounding air, producing a steady supply of basic materials.', baseCost: 80, costMultiplier: 1.4 },
  { id: 'crystal_growth_chamber', name: 'Crystal Growth Chamber', description: 'A temperature-controlled chamber that accelerates crystal formation. Produces crystal materials at an enhanced rate.', baseCost: 300, costMultiplier: 1.5 },
  { id: 'aurora_condenser', name: 'Aurora Condenser', description: 'Captures aurora energy and condenses it into usable form. Produces rare aurora-based materials during peak activity.', baseCost: 800, costMultiplier: 1.6 },
  { id: 'starlight_collector', name: 'Starlight Collector', description: 'An array of crystal lenses that focuses starlight into a single point, generating star-infused materials overnight.', baseCost: 2000, costMultiplier: 1.7 },
  { id: 'divine_forge', name: 'Divine Forge', description: 'A forge that operates on faith energy rather than heat. It can process and combine any blessed material into powerful items.', baseCost: 5000, costMultiplier: 1.8 },

  // Defense (5)
  { id: 'ice_wall', name: 'Frost Wall', description: 'A wall of reinforced ice that regenerates when damaged. Provides basic protection against hostile entities and harsh weather.', baseCost: 120, costMultiplier: 1.4 },
  { id: 'crystal_barrier', name: 'Crystal Barrier', description: 'A barrier made of interlocking crystal shards that deflect physical and magical attacks. Beautiful and deadly in equal measure.', baseCost: 500, costMultiplier: 1.5 },
  { id: 'halo_shield_generator', name: 'Halo Shield Generator', description: 'Projects a protective dome of divine light powered by concentrated halo energy. Impervious to all but the strongest attacks.', baseCost: 1500, costMultiplier: 1.6 },
  { id: 'blizzard_turret', name: 'Blizzard Turret', description: 'An automated turret that generates localized blizzards to deter intruders. Effective against both ground and aerial threats.', baseCost: 700, costMultiplier: 1.5 },
  { id: 'sanctuary_fortress', name: 'Sanctuary Fortress', description: 'A massive ice citadel that serves as the ultimate defense structure. It generates its own weather system for protection.', baseCost: 4000, costMultiplier: 1.8 },

  // Utility (5)
  { id: 'faith_well', name: 'Faith Well', description: 'A well that draws faith energy from the earth. Passive faith energy regeneration for all sanctuary operations.', baseCost: 150, costMultiplier: 1.4 },
  { id: 'material_vault', name: 'Material Vault', description: 'A cryogenic storage facility that preserves blessed materials at perfect conditions indefinitely.', baseCost: 250, costMultiplier: 1.5 },
  { id: 'angel_rest_chamber', name: 'Angel Rest Chamber', description: 'A peaceful chamber where angels recover their energy faster. Reduces cooldowns on angelic abilities.', baseCost: 600, costMultiplier: 1.5 },
  { id: 'corruption_purifier', name: 'Corruption Purifier', description: 'A device that detects and neutralizes corruption in the sanctuary. Essential for maintaining sanctuary health.', baseCost: 1000, costMultiplier: 1.6 },
  { id: 'miracle_altar', name: 'Miracle Altar', description: 'A sacred altar where miracles can be performed. Requires immense faith energy but produces extraordinary results.', baseCost: 6000, costMultiplier: 2.0 },

  // Divine (5)
  { id: 'prayer_shrine', name: 'Prayer Shrine', description: 'A small shrine that amplifies prayers, generating bonus faith energy from the devotion of summoned angels.', baseCost: 200, costMultiplier: 1.5 },
  { id: 'divine_library', name: 'Divine Library', description: 'Contains scrolls and tablets of angelic knowledge. Studying here unlocks new abilities and improves existing ones.', baseCost: 800, costMultiplier: 1.6 },
  { id: 'halo_gallery', name: 'Halo Gallery', description: 'Displays collected halos in a magnificent hall of mirrors. Each halo displayed provides a passive blessing to the sanctuary.', baseCost: 1500, costMultiplier: 1.7 },
  { id: 'realm_gateway', name: 'Realm Gateway', description: 'A portal structure that allows direct travel between unlocked celestial realms without traversal.', baseCost: 3500, costMultiplier: 1.8 },
  { id: 'eternal_shrine', name: 'Eternal Shrine', description: 'The pinnacle of sanctuary architecture. A shrine that exists in all moments simultaneously, granting permanent blessings.', baseCost: 9000, costMultiplier: 2.0 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: FA_ABILITIES — 22 Angelic Abilities
// ═══════════════════════════════════════════════════════════════════

export const FA_ABILITIES: readonly FAAbilityDef[] = [
  // Ice (4)
  { id: 'frost_lance', name: 'Frost Lance', description: 'Launch a spear of pure ice that pierces through targets and freezes the wound, preventing healing.', cooldown: 5, power: 30, element: 'Ice' },
  { id: 'ice_mirage', name: 'Ice Mirage', description: 'Create illusory copies of yourself made from ice that confuse enemies and absorb damage before shattering.', cooldown: 12, power: 45, element: 'Ice' },
  { id: 'glacial_prison', name: 'Glacial Prison', description: 'Encase a target in a block of glacier ice, completely immobilizing them. The ice thickens over time, making escape harder.', cooldown: 20, power: 80, element: 'Ice' },
  { id: 'cryogenic_pulse', name: 'Cryogenic Pulse', description: 'Release a wave of extreme cold in all directions, flash-freezing everything within range to absolute zero.', cooldown: 30, power: 120, element: 'Ice' },

  // Light (3)
  { id: 'divine_radiance', name: 'Divine Radiance', description: 'Emit a blinding pulse of divine light that damages dark entities and heals all allies within range simultaneously.', cooldown: 15, power: 55, element: 'Light' },
  { id: 'dawn_break', name: 'Dawn Break', description: 'Simulate the first light of dawn, banishing all darkness-based effects and weakening enemies vulnerable to light.', cooldown: 25, power: 90, element: 'Light' },
  { id: 'solar_sanctuary', name: 'Solar Sanctuary', description: 'Create a zone of perpetual daylight that provides continuous healing and damage immunity to all friendly units inside.', cooldown: 45, power: 150, element: 'Light' },

  // Crystal (3)
  { id: 'crystal_shards', name: 'Crystal Shards', description: 'Fire a barrage of razor-sharp crystal shards that embed themselves in targets, causing ongoing damage from internal cuts.', cooldown: 8, power: 40, element: 'Crystal' },
  { id: 'diamond_barrier', name: 'Diamond Barrier', description: 'Summon a barrier of living diamond that absorbs any single attack, then reflects the energy back at the attacker with interest.', cooldown: 18, power: 70, element: 'Crystal' },
  { id: 'prismatic_volley', name: 'Prismatic Volley', description: 'Fire beams of separated light through a crystal prism, creating a rainbow of elemental attacks hitting multiple targets.', cooldown: 35, power: 110, element: 'Crystal' },

  // Snow (3)
  { id: 'snowblind', name: 'Snowblind', description: 'Kick up a blinding swirl of snow that reduces enemy accuracy to zero for a short duration while allies attack freely.', cooldown: 10, power: 35, element: 'Snow' },
  { id: 'avalanche_call', name: 'Avalanche Call', description: 'Trigger a massive avalanche that sweeps across the battlefield, burying enemies under tons of compressed snow.', cooldown: 28, power: 100, element: 'Snow' },
  { id: 'permafrost_ground', name: 'Permafrost Ground', description: 'Transform the ground into deep permafrost that slows all enemy movement to a crawl and damages those who try to force their way through.', cooldown: 22, power: 65, element: 'Snow' },

  // Star (3)
  { id: 'starfall', name: 'Starfall', description: 'Call down a shower of miniature stars that impact the battlefield with explosive force, leaving craters of divine frost.', cooldown: 16, power: 75, element: 'Star' },
  { id: 'constellation_bind', name: 'Constellation Bind', description: 'Connect targets with lines of starlight in a constellation pattern, creating chains that restrict movement and drain energy.', cooldown: 24, power: 85, element: 'Star' },
  { id: 'supernova', name: 'Supernova', description: 'Channel the energy of a dying star into a single catastrophic explosion. Devastates everything in a massive radius.', cooldown: 60, power: 200, element: 'Star' },

  // Halo (3)
  { id: 'halo_strike', name: 'Halo Strike', description: 'Throw a spinning halo like a divine discus that cuts through anything in its path before returning to the caster.', cooldown: 6, power: 50, element: 'Halo' },
  { id: 'halo_cocoon', name: 'Halo Cocoon', description: 'Surround an ally with nested spinning halos that provide complete protection from all damage types for a short time.', cooldown: 20, power: 95, element: 'Halo' },
  { id: 'divine_ring', name: 'Divine Ring', description: 'Expand your halo to enormous size and place it on the ground, creating a ring of divine territory that empowers all inside.', cooldown: 40, power: 130, element: 'Halo' },

  // Frost (3)
  { id: 'frostbite', name: 'Frostbite', description: 'Inflict a deep cold that penetrates to the bone, dealing damage over time and gradually reducing enemy attack power.', cooldown: 7, power: 42, element: 'Frost' },
  { id: 'winter_grasp', name: 'Winter Grasp', description: 'Extend hands of frost from the ground that grab and crush enemies. The grip tightens as the temperature drops.', cooldown: 15, power: 70, element: 'Frost' },
  { id: 'absolute_zero', name: 'Absolute Zero', description: 'Drain all thermal energy from the area, reducing temperature to the theoretical minimum. All molecular motion ceases.', cooldown: 50, power: 180, element: 'Frost' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: FA_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const FA_ACHIEVEMENTS: readonly FAAchievementDef[] = [
  { id: 'ach_first_summon', name: 'First Divine Calling', description: 'Summon your very first frost angel from the Whispering Tundra.', condition: 'Summon 1 angel', reward: '+50 faith energy' },
  { id: 'ach_summon_10', name: 'Angel Collector', description: 'Summon a total of 10 frost angels across all realms.', condition: 'Summon 10 angels', reward: '+200 gold, rare material cache' },
  { id: 'ach_summon_35', name: 'Celestial Menagerie', description: 'Summon all 35 unique frost angels.', condition: 'Summon 35 unique angels', reward: '+5000 gold, legendary halo fragment' },
  { id: 'ach_rare_summon', name: 'Rare Blessing', description: 'Successfully summon a rare-tier frost angel.', condition: 'Own rare angel', reward: '+300 faith energy' },
  { id: 'ach_epic_summon', name: 'Epic Revelation', description: 'Successfully summon an epic-tier frost angel.', condition: 'Own epic angel', reward: '+800 faith energy, rare halo' },
  { id: 'ach_legendary_summon', name: 'Legend Made Flesh', description: 'Summon a legendary frost angel — a being of mythic power.', condition: 'Own legendary angel', reward: '+3000 gold, epic halo' },
  { id: 'ach_first_realm', name: 'Realm Walker', description: 'Unlock your first celestial frozen realm beyond the starting tundra.', condition: 'Unlock 1 realm', reward: '+100 faith energy' },
  { id: 'ach_all_realms', name: 'Master of All Domains', description: 'Unlock and explore all 8 celestial frozen realms.', condition: 'Unlock 8 realms', reward: '+5000 gold, Eternal Realm Walker title' },
  { id: 'ach_material_100', name: 'Resourceful Angel', description: 'Accumulate 100 total blessed materials.', condition: 'Collect 100 materials', reward: '+150 gold' },
  { id: 'ach_material_500', name: 'Hoarfrost Hoarder', description: 'Accumulate 500 total blessed materials.', condition: 'Collect 500 materials', reward: '+800 gold' },
  { id: 'ach_structure_5', name: 'Sanctuary Builder', description: 'Build 5 different sanctuary structures.', condition: 'Build 5 structures', reward: '+200 faith energy' },
  { id: 'ach_structure_15', name: 'Divine Architect', description: 'Build 15 different sanctuary structures.', condition: 'Build 15 structures', reward: '+1500 gold, Architect title' },
  { id: 'ach_structure_25', name: 'Sanctuary Metropolis', description: 'Build all 25 sanctuary structures.', condition: 'Build 25 structures', reward: '+5000 gold, rare halo' },
  { id: 'ach_first_ascension', name: 'First Ascension', description: 'Ascend your first frost angel to a higher form.', condition: 'Ascend 1 angel', reward: '+500 faith energy' },
  { id: 'ach_five_ascensions', name: 'Ascension Master', description: 'Perform 5 angel ascensions total.', condition: 'Ascend 5 angels', reward: '+2000 gold' },
  { id: 'ach_first_miracle', name: 'Miracle Worker', description: 'Perform your very first miracle at the Miracle Altar.', condition: 'Perform 1 miracle', reward: '+1000 faith energy' },
  { id: 'ach_ten_miracles', name: 'Divine Intercession', description: 'Perform 10 miracles total.', condition: 'Perform 10 miracles', reward: '+3000 gold, epic material cache' },
  { id: 'ach_max_level', name: 'Angel of Eternal Winter', description: 'Reach the maximum angel level of 50.', condition: 'Reach level 50', reward: '+10000 gold, legendary material set' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: FA_TITLES — 8 Sacred Titles
// ═══════════════════════════════════════════════════════════════════

export const FA_TITLES: readonly FATitleDef[] = [
  { id: 'title_frost_initiate', name: 'Frost Initiate', description: 'One who has taken the first step onto the frozen path, feeling the divine cold awaken within their soul for the first time.', requiredLevel: 1, requiredRealms: 1 },
  { id: 'title_ice_disciple', name: 'Ice Disciple', description: 'A dedicated student of the frozen arts who has learned to channel basic frost energy and commands the loyalty of their first angels.', requiredLevel: 5, requiredRealms: 2 },
  { id: 'title_crystal_acolyte', name: 'Crystal Acolyte', description: 'An advanced practitioner who has begun to understand the crystal nature of divine cold and can construct simple ice sanctuaries.', requiredLevel: 12, requiredRealms: 3 },
  { id: 'title_snow_guardian', name: 'Snow Guardian', description: 'A protector of the frozen domains who stands watch over the boundary between warmth and cold, ensuring balance is maintained.', requiredLevel: 18, requiredRealms: 4 },
  { id: 'title_aurora_seraph', name: 'Aurora Seraph', description: 'An angelic being touched by the aurora itself, capable of wielding light and frost in equal measure as extensions of divine will.', requiredLevel: 25, requiredRealms: 5 },
  { id: 'title_halo_archon', name: 'Halo Archon', description: 'A being of such divine power that a halo of pure faith energy has manifested around them permanently, visible to all.', requiredLevel: 33, requiredRealms: 6 },
  { id: 'title_frost_sovereign', name: 'Frost Sovereign', description: 'A ruler of multiple frozen realms who commands legions of angels and shapes the weather itself through sheer force of will.', requiredLevel: 42, requiredRealms: 7 },
  { id: 'title_angel_eternal_winter', name: 'Angel of Eternal Winter', description: 'The ultimate title — one who has achieved perfect unity with the concept of eternal winter itself. All frost bows to their command.', requiredLevel: 50, requiredRealms: 8 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: FA_HALOS — 15 Collectible Halo Types
// ═══════════════════════════════════════════════════════════════════

export const FA_HALOS: readonly FAHaloDef[] = [
  { id: 'halo_frost_ring', name: 'Frost Ring Halo', description: 'A simple ring of frozen water vapor that orbits the wearer\'s head. The most basic form of halo, granted to newly summoned angels.', rarity: 'common', powerBonus: 5, specialAbility: 'Minor cold resistance' },
  { id: 'halo_snowflake', name: 'Snowflake Halo', description: 'A perfectly symmetrical snowflake halo that never melts. Its six arms each store a tiny amount of divine energy.', rarity: 'common', powerBonus: 6, specialAbility: 'Frost touch' },
  { id: 'halo_ice_crown', name: 'Ice Crown Halo', description: 'A crown-shaped halo made of clear ice. It feels warm to the wearer despite being frozen, radiating gentle divine light.', rarity: 'common', powerBonus: 7, specialAbility: 'Cold aura' },
  { id: 'halo_crystal_oval', name: 'Crystal Oval Halo', description: 'An oval halo of natural crystal that refracts light into angelic colors. Uncommon halo found in the Crystal Vale.', rarity: 'uncommon', powerBonus: 12, specialAbility: 'Prismatic defense' },
  { id: 'halo_aurora_band', name: 'Aurora Band Halo', description: 'A ribbon-like halo that shimmers with aurora colors, changing hue based on the wearer\'s emotional state.', rarity: 'uncommon', powerBonus: 14, specialAbility: 'Emotional resonance' },
  { id: 'halo_dawn_circle', name: 'Dawn Circle Halo', description: 'A warm golden halo that glows brightest at dawn. It stores solar energy during the day and releases it as healing light at night.', rarity: 'uncommon', powerBonus: 15, specialAbility: 'Solar healing' },
  { id: 'halo_star_prism', name: 'Star Prism Halo', description: 'A multi-pointed star-shaped halo that captures and amplifies starlight. Visible from great distances on clear nights.', rarity: 'uncommon', powerBonus: 13, specialAbility: 'Starlight focus' },
  { id: 'halo_diamond_radiance', name: 'Diamond Radiance Halo', description: 'A halo made of living diamond that is harder than any natural material. It protects the wearer from all physical harm.', rarity: 'rare', powerBonus: 25, specialAbility: 'Diamond skin' },
  { id: 'halo_frost_serpent', name: 'Frost Serpent Halo', description: 'A halo shaped like an ouroboros serpent made of frost. It symbolizes the eternal cycle of freezing and thawing.', rarity: 'rare', powerBonus: 28, specialAbility: 'Cold cycle mastery' },
  { id: 'halo_blizzard_eye', name: 'Blizzard Eye Halo', description: 'A halo that resembles the calm eye of a hurricane-sized blizzard. The wearer can command the storm around them at will.', rarity: 'rare', powerBonus: 30, specialAbility: 'Storm command' },
  { id: 'halo_void_ice', name: 'Void Ice Halo', description: 'A halo formed from void ice — ice that exists between dimensions. It flickers in and out of visibility constantly.', rarity: 'rare', powerBonus: 27, specialAbility: 'Dimensional flicker' },
  { id: 'halo_sevenfold', name: 'Sevenfold Halo', description: 'Seven nested halos spinning in different directions, each representing one of the angelic virtues. Extremely rare.', rarity: 'epic', powerBonus: 50, specialAbility: 'Seven virtues empowerment' },
  { id: 'halo_aurora_empress', name: 'Aurora Empress Halo', description: 'A massive halo that projects aurora curtains in all directions. It makes the wearer visible from space and commands respect from all angels.', rarity: 'epic', powerBonus: 55, specialAbility: 'Global aurora projection' },
  { id: 'halo_throne_ring', name: 'Throne Ring Halo', description: 'A halo identical to those worn by the Frost Primordial itself. It pulses with the authority of the first angel.', rarity: 'epic', powerBonus: 60, specialAbility: 'Primordial authority' },
  { id: 'halo_eternal_winter', name: 'Halo of Eternal Winter', description: 'The ultimate halo — a perfect ring of absolute zero energy that freezes the air, the light, and even time itself around it. Only one exists.', rarity: 'legendary', powerBonus: 100, specialAbility: 'Time freeze aura' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: FA_EVENTS — 12 Divine Events
// ═══════════════════════════════════════════════════════════════════

export const FA_EVENTS: readonly FAEventDef[] = [
  {
    id: 'event_sudden_blizzard',
    name: 'Sudden Blizzard',
    description: 'A fierce blizzard strikes without warning, burying unprotected structures under feet of snow and draining faith energy.',
    severity: 2,
    duration: 60,
    effects: ['Sanctuary structures take damage', 'Faith energy drains 2x faster', 'Angel abilities weakened by 20%'],
  },
  {
    id: 'event_aurora_surge',
    name: 'Aurora Surge',
    description: 'An unusually powerful aurora borealis floods the sky, amplifying all light and star element abilities while revealing hidden materials.',
    severity: 1,
    duration: 90,
    effects: ['Light and Star power +50%', 'Hidden materials become visible', 'Faith energy regeneration +100%'],
  },
  {
    id: 'event_halo_convergence',
    name: 'Halo Convergence',
    description: 'Multiple halos in the sanctuary begin resonating with each other, creating harmonic frequencies that empower all angels.',
    severity: 1,
    duration: 120,
    effects: ['All angel power +25%', 'Halo collection bonus doubled', 'New halo may appear'],
  },
  {
    id: 'event_corruption_breach',
    name: 'Corruption Breach',
    description: 'Dark energy seeps into the sanctuary through a crack in reality, corrupting materials and weakening angelic wards.',
    severity: 4,
    duration: 45,
    effects: ['Sanctuary corruption increases', 'Blessed materials may become corrupted', 'Angel abilities reduced by 40%'],
  },
  {
    id: 'event_divine_meteor_shower',
    name: 'Divine Meteor Shower',
    description: 'Meteors of pure divine ice rain down from the heavens, delivering rare materials and occasionally new angels.',
    severity: 2,
    duration: 60,
    effects: ['Star Metal Shards appear', 'Rare angel summon chance tripled', 'Structures may take meteor damage'],
  },
  {
    id: 'event_eternal_frost_wave',
    name: 'Eternal Frost Wave',
    description: 'A wave of primordial frost energy sweeps through all realms, temporarily unlocking hidden areas and boosting cold powers.',
    severity: 1,
    duration: 80,
    effects: ['All Frost element power +40%', 'Hidden realm areas accessible', 'Material yield doubled'],
  },
  {
    id: 'event_crystal_resonance',
    name: 'Crystal Resonance',
    description: 'All crystal structures in the sanctuary begin vibrating at the same frequency, creating amplified production and defense.',
    severity: 1,
    duration: 100,
    effects: ['Crystal structure output +75%', 'Crystal barrier defense +50%', 'Crystal materials spawn rate doubled'],
  },
  {
    id: 'event_dark_winter',
    name: 'Dark Winter',
    description: 'An unnatural darkness falls over the frozen domains, draining light-based abilities while empowering shadow and void creatures.',
    severity: 3,
    duration: 70,
    effects: ['Light element power -60%', 'Dark creature encounters increase', 'Starlight collectors stop working'],
  },
  {
    id: 'event_holy_snowfall',
    name: 'Holy Snowfall',
    description: 'Snow infused with pure divine energy falls gently across all realms, healing corruption and boosting sanctuary health.',
    severity: 1,
    duration: 90,
    effects: ['Sanctuary corruption decreases rapidly', 'All angels healed to full', 'Holy materials bonus yield'],
  },
  {
    id: 'event_realm_quake',
    name: 'Realm Quake',
    description: 'A tectonic shift in the celestial fabric causes realms to temporarily overlap, creating portals between distant domains.',
    severity: 3,
    duration: 50,
    effects: ['Random realm portals open', 'Cross-realm material gathering possible', 'Structures may take earthquake damage'],
  },
  {
    id: 'event_seraph_descent',
    name: 'Seraph Descent',
    description: 'A seraph-class angel descends from the highest celestial sphere, offering blessings to those deemed worthy.',
    severity: 1,
    duration: 120,
    effects: ['Epic angel summon chance +200%', 'All faith energy costs halved', 'One miracle may be performed for free'],
  },
  {
    id: 'event_void_incursion',
    name: 'Void Incursion',
    description: 'The boundary between the frozen realms and the void weakens, allowing void creatures to invade the sanctuary.',
    severity: 5,
    duration: 40,
    effects: ['Void creatures attack sanctuary', 'All structures under threat', 'Must purify corruption to repel'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: ELEMENT INTERACTIONS & ASCENSION DATA
// ═══════════════════════════════════════════════════════════════════

interface FAElementInteraction {
  attacker: FAElement
  defender: FAElement
  multiplier: number
  description: string
}

const FA_ELEMENT_INTERACTIONS: FAElementInteraction[] = [
  { attacker: 'Ice', defender: 'Snow', multiplier: 1.5, description: 'Ice shatters Snow crystals for bonus damage.' },
  { attacker: 'Ice', defender: 'Crystal', multiplier: 0.7, description: 'Crystal is too hard for pure Ice to break through.' },
  { attacker: 'Light', defender: 'Frost', multiplier: 1.8, description: 'Divine Light melts Frost with devastating effectiveness.' },
  { attacker: 'Light', defender: 'Star', multiplier: 1.3, description: 'Light amplifies Star energy for a synergistic boost.' },
  { attacker: 'Crystal', defender: 'Ice', multiplier: 1.4, description: 'Crystal shards easily cut through regular Ice.' },
  { attacker: 'Crystal', defender: 'Snow', multiplier: 1.2, description: 'Crystal refracts through Snow for bonus damage.' },
  { attacker: 'Snow', defender: 'Frost', multiplier: 0.6, description: 'Snow is no match for the intensity of pure Frost.' },
  { attacker: 'Snow', defender: 'Light', multiplier: 0.5, description: 'Light passes harmlessly through Snow particles.' },
  { attacker: 'Star', defender: 'Ice', multiplier: 1.6, description: 'Star energy radiates through Ice, cracking it apart.' },
  { attacker: 'Star', defender: 'Halo', multiplier: 1.4, description: 'Starlight resonates with Halo energy for amplified power.' },
  { attacker: 'Halo', defender: 'Snow', multiplier: 1.5, description: 'Divine Halo energy illuminates and purifies Snow.' },
  { attacker: 'Halo', defender: 'Frost', multiplier: 1.7, description: 'Halo\'s divine warmth counteracts the bitter cold of Frost.' },
  { attacker: 'Frost', defender: 'Light', multiplier: 1.3, description: 'Extreme Frost can dim and freeze even divine Light.' },
  { attacker: 'Frost', defender: 'Halo', multiplier: 1.1, description: 'Frost slowly encroaches upon Halo energy, weakening it.' },
  { attacker: 'Frost', defender: 'Star', multiplier: 0.8, description: 'The cosmic energy of Stars resists being frozen.' },
]

interface FAAscensionTier {
  tier: number
  name: string
  requiredAscensions: number
  powerMultiplier: number
  hpMultiplier: number
  visualEffect: string
}

const FA_ASCENSION_TIERS: FAAscensionTier[] = [
  { tier: 0, name: 'Mortal Form', requiredAscensions: 0, powerMultiplier: 1.0, hpMultiplier: 1.0, visualEffect: 'Normal angelic appearance with basic wings.' },
  { tier: 1, name: 'Frost Awakened', requiredAscensions: 1, powerMultiplier: 1.3, hpMultiplier: 1.2, visualEffect: 'Wings gain crystalline frost patterns. Aura emits gentle snowfall.' },
  { tier: 2, name: 'Crystal Ascendant', requiredAscensions: 2, powerMultiplier: 1.7, hpMultiplier: 1.5, visualEffect: 'Body partially crystallizes. A secondary halo appears above the head.' },
  { tier: 3, name: 'Aurora Transcendent', requiredAscensions: 3, powerMultiplier: 2.2, hpMultiplier: 1.8, visualEffect: 'Wings become pure aurora light. Movement leaves rainbow frost trails.' },
  { tier: 4, name: 'Celestial Exalted', requiredAscensions: 4, powerMultiplier: 2.8, hpMultiplier: 2.2, visualEffect: 'Three nested halos orbit the body. Divine light radiates in all directions.' },
  { tier: 5, name: 'Eternal Divine', requiredAscensions: 5, powerMultiplier: 3.5, hpMultiplier: 3.0, visualEffect: 'Perfect divine form. Exists partially outside of time. Commands absolute authority over cold.' },
]

interface FARealmMaterialMap {
  realmId: string
  materialIds: string[]
  bonusMaterialIds: string[]
}

const FA_REALM_MATERIAL_MAP: FARealmMaterialMap[] = [
  { realmId: 'whispering_tundra', materialIds: ['frost_dust', 'snow_essence', 'ice_pebble', 'frozen_feather', 'frost_blossom'], bonusMaterialIds: ['glacier_shard'] },
  { realmId: 'crystal_vale', materialIds: ['glacier_shard', 'crystal_nectar', 'diamond_frost_gem', 'permafrost_resin'], bonusMaterialIds: ['aurora_silk'] },
  { realmId: 'aurora_plateau', materialIds: ['aurora_silk', 'starlit_snow', 'holy_icicle'], bonusMaterialIds: ['crystal_nectar'] },
  { realmId: 'frozen_sanctuary', materialIds: ['holy_icicle', 'halo_fragment', 'eternal_ice_core', 'seraph_tear'], bonusMaterialIds: ['winter_bloom_seed'] },
  { realmId: 'starfall_glacier', materialIds: ['star_metal_shard', 'winter_bloom_seed', 'starlit_snow'], bonusMaterialIds: ['eternal_ice_core'] },
  { realmId: 'halo_cathedral', materialIds: ['halo_fragment', 'archangel_plume', 'halo_ring_core', 'aurora_crown_shard'], bonusMaterialIds: ['seraph_tear'] },
  { realmId: 'void_frost_abyss', materialIds: ['void_ice_crystal', 'genesis_frost_drop', 'world_ice_heart'], bonusMaterialIds: ['archangel_plume'] },
  { realmId: 'eternal_winter_throne', materialIds: ['primordial_frost_essence', 'eternal_diamond', 'star_forge_core', 'divine_halo_matrix', 'world_tree_frost_sap', 'throne_of_winter_fragment'], bonusMaterialIds: [] },
]

function faGetElementInteraction(attacker: FAElement, defender: FAElement): FAElementInteraction | null {
  return FA_ELEMENT_INTERACTIONS.find(
    (i) => i.attacker === attacker && i.defender === defender
  ) ?? null
}

function faGetAscensionTier(ascensionCount: number): FAAscensionTier {
  for (let i = FA_ASCENSION_TIERS.length - 1; i >= 0; i--) {
    if (ascensionCount >= FA_ASCENSION_TIERS[i].requiredAscensions) {
      return FA_ASCENSION_TIERS[i]
    }
  }
  return FA_ASCENSION_TIERS[0]
}

function faGetRealmMaterials(realmId: string): FARealmMaterialMap | null {
  return FA_REALM_MATERIAL_MAP.find((m) => m.realmId === realmId) ?? null
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

const useFAStore = create<FAFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      summonedAngels: [] as FASummonedAngel[],
      collectedMaterials: {} as Record<string, number>,
      structures: [] as FAOwnedStructure[],
      achievements: [] as string[],
      currentTitle: 'title_frost_initiate',
      collectedHalos: [] as string[],
      unlockedRealms: ['whispering_tundra'] as string[],
      angelLevel: 1,
      angelExp: 0,
      gold: FA_INITIAL_GOLD,
      faithEnergy: FA_INITIAL_ENERGY,
      totalSummoned: 0,
      totalBlessed: 0,
      totalUpgraded: 0,
      totalAscended: 0,
      totalMiracles: 0,
      activeEventId: null as string | null,
      eventTimer: 0,
      sanctuary: {
        health: 100,
        maxHealth: 100,
        corruption: 0,
        lastHealedAt: null,
      } as FASanctuaryState,
      activeRealmId: 'whispering_tundra' as string | null,

      // ── faSummonAngel ──────────────────────────────────────────
      faSummonAngel: (angelId: string): boolean => {
        const state = get()
        const angelDef = FA_ANGELS.find((a) => a.id === angelId)
        if (!angelDef) return false
        if (state.angelLevel < (FA_REALMS.find((r) => r.id === state.activeRealmId)?.minLevel ?? 1)) return false

        const summonCost = Math.floor(10 * faRarityMultiplier(angelDef.rarity))
        if (state.faithEnergy < summonCost) return false
        if (state.summonedAngels.some((a) => a.angelDefId === angelId)) return false

        const newXp = state.angelExp + angelDef.basePower
        const newLevel = faLevelFromXp(newXp)

        set((prev) => ({
          summonedAngels: [
            ...prev.summonedAngels,
            {
              id: faGenerateId(),
              angelDefId: angelId,
              name: angelDef.name,
              level: 1,
              currentHP: angelDef.basePower * 10,
              maxHP: angelDef.basePower * 10,
              power: angelDef.basePower,
              ascended: false,
              ascensionCount: 0,
              acquiredAt: Date.now(),
            },
          ],
          faithEnergy: Math.max(0, prev.faithEnergy - summonCost),
          angelExp: newXp,
          angelLevel: newLevel,
          gold: prev.gold + Math.floor(angelDef.basePower * 0.5),
          totalSummoned: prev.totalSummoned + 1,
        }))
        return true
      },

      // ── faBlessMaterial ────────────────────────────────────────
      faBlessMaterial: (materialId: string): number => {
        const state = get()
        const mat = FA_MATERIALS.find((m) => m.id === materialId)
        if (!mat) return 0
        if (state.faithEnergy < 3) return 0

        const quantity = mat.rarity === 'common' ? 3 : mat.rarity === 'uncommon' ? 2 : 1
        set((prev) => ({
          collectedMaterials: {
            ...prev.collectedMaterials,
            [materialId]: (prev.collectedMaterials[materialId] || 0) + quantity,
          },
          faithEnergy: Math.max(0, prev.faithEnergy - 3),
          totalBlessed: prev.totalBlessed + quantity,
          gold: prev.gold + mat.value * quantity,
        }))
        return quantity
      },

      // ── faUpgradeSanctuary ─────────────────────────────────────
      faUpgradeSanctuary: (structureId: string): boolean => {
        const state = get()
        const structDef = FA_STRUCTURES.find((s) => s.id === structureId)
        if (!structDef) return false

        const owned = state.structures.find((s) => s.structureDefId === structureId)
        if (!owned) {
          if (state.gold < structDef.baseCost) return false
          const newXp = state.angelExp + 20
          const newLevel = faLevelFromXp(newXp)
          set((prev) => ({
            structures: [
              ...prev.structures,
              {
                id: faGenerateId(),
                structureDefId: structureId,
                level: 1,
                built: true,
              },
            ],
            gold: prev.gold - structDef.baseCost,
            angelExp: newXp,
            angelLevel: newLevel,
            totalUpgraded: prev.totalUpgraded + 1,
          }))
          return true
        }

        if (owned.level >= 10) return false
        const upgradeCost = Math.floor(structDef.baseCost * Math.pow(structDef.costMultiplier, owned.level))
        if (state.gold < upgradeCost) return false

        const newXp = state.angelExp + 25
        const newLevel = faLevelFromXp(newXp)
        set((prev) => ({
          structures: prev.structures.map((s) =>
            s.id === owned.id ? { ...s, level: s.level + 1 } : s
          ),
          gold: prev.gold - upgradeCost,
          angelExp: newXp,
          angelLevel: newLevel,
          totalUpgraded: prev.totalUpgraded + 1,
        }))
        return true
      },

      // ── faUseAbility ───────────────────────────────────────────
      faUseAbility: (abilityId: string): boolean => {
        const state = get()
        const ability = FA_ABILITIES.find((a) => a.id === abilityId)
        if (!ability) return false
        if (state.faithEnergy < ability.cooldown) return false

        set((prev) => ({
          faithEnergy: Math.max(0, prev.faithEnergy - ability.cooldown),
        }))
        return true
      },

      // ── faTriggerDivineEvent ───────────────────────────────────
      faTriggerDivineEvent: (eventId: string): boolean => {
        const state = get()
        const event = FA_EVENTS.find((e) => e.id === eventId)
        if (!event) return false
        if (state.activeEventId !== null) return false

        set((prev) => ({
          activeEventId: eventId,
          eventTimer: event.duration,
          sanctuary: {
            ...prev.sanctuary,
            corruption: event.severity >= 4
              ? Math.min(100, prev.sanctuary.corruption + event.severity * 5)
              : prev.sanctuary.corruption,
            health: event.severity >= 3
              ? Math.max(0, prev.sanctuary.health - event.severity * 3)
              : prev.sanctuary.health,
          },
        }))
        return true
      },

      // ── faCollectHalo ──────────────────────────────────────────
      faCollectHalo: (haloId: string): boolean => {
        const state = get()
        const halo = FA_HALOS.find((h) => h.id === haloId)
        if (!halo) return false
        if (state.collectedHalos.includes(haloId)) return false

        const haloCost = Math.floor(20 * faRarityMultiplier(halo.rarity))
        if (state.gold < haloCost) return false

        const newXp = state.angelExp + halo.powerBonus
        const newLevel = faLevelFromXp(newXp)
        set((prev) => ({
          collectedHalos: [...prev.collectedHalos, haloId],
          gold: prev.gold - haloCost,
          angelExp: newXp,
          angelLevel: newLevel,
        }))
        return true
      },

      // ── faAscendAngel ──────────────────────────────────────────
      faAscendAngel: (instanceId: string): boolean => {
        const state = get()
        const angel = state.summonedAngels.find((a) => a.id === instanceId)
        if (!angel) return false
        if (angel.ascensionCount >= 5) return false

        const ascensionCost = Math.floor(50 * Math.pow(2, angel.ascensionCount))
        if (state.faithEnergy < ascensionCost) return false
        if (state.gold < ascensionCost * 2) return false

        const newXp = state.angelExp + 30
        const newLevel = faLevelFromXp(newXp)
        set((prev) => ({
          summonedAngels: prev.summonedAngels.map((a) =>
            a.id === instanceId
              ? {
                  ...a,
                  level: a.level + 1,
                  power: Math.floor(a.power * 1.3),
                  maxHP: Math.floor(a.maxHP * 1.2),
                  currentHP: Math.floor(a.maxHP * 1.2),
                  ascended: true,
                  ascensionCount: a.ascensionCount + 1,
                }
              : a
          ),
          faithEnergy: Math.max(0, prev.faithEnergy - ascensionCost),
          gold: prev.gold - ascensionCost * 2,
          angelExp: newXp,
          angelLevel: newLevel,
          totalAscended: prev.totalAscended + 1,
        }))
        return true
      },

      // ── faPurifyCorruption ─────────────────────────────────────
      faPurifyCorruption: (amount: number): boolean => {
        const state = get()
        if (state.sanctuary.corruption <= 0) return false
        if (state.faithEnergy < 10) return false

        set((prev) => ({
          sanctuary: {
            ...prev.sanctuary,
            corruption: Math.max(0, prev.sanctuary.corruption - amount),
          },
          faithEnergy: Math.max(0, prev.faithEnergy - 10),
        }))
        return true
      },

      // ── faHealSanctuary ────────────────────────────────────────
      faHealSanctuary: (amount: number): boolean => {
        const state = get()
        if (state.sanctuary.health >= state.sanctuary.maxHealth) return false
        if (state.faithEnergy < 5) return false

        set((prev) => ({
          sanctuary: {
            ...prev.sanctuary,
            health: Math.min(prev.sanctuary.maxHealth, prev.sanctuary.health + amount),
            lastHealedAt: Date.now(),
          },
          faithEnergy: Math.max(0, prev.faithEnergy - 5),
        }))
        return true
      },

      // ── faUnlockRealm ──────────────────────────────────────────
      faUnlockRealm: (realmId: string): boolean => {
        const state = get()
        const realm = FA_REALMS.find((r) => r.id === realmId)
        if (!realm) return false
        if (state.unlockedRealms.includes(realmId)) return false
        if (state.angelLevel < realm.minLevel) return false
        if (state.gold < realm.unlockCost) return false

        const newXp = state.angelExp + realm.minLevel * 20
        const newLevel = faLevelFromXp(newXp)
        set((prev) => ({
          unlockedRealms: [...prev.unlockedRealms, realmId],
          activeRealmId: realmId,
          gold: prev.gold - realm.unlockCost,
          angelExp: newXp,
          angelLevel: newLevel,
        }))
        return true
      },

      // ── faPerformMiracle ───────────────────────────────────────
      faPerformMiracle: (targetId: string): boolean => {
        const state = get()
        if (state.faithEnergy < 100) return false

        let xpGain = 50
        let goldGain = 500
        let materialBonus = 0

        const angel = state.summonedAngels.find((a) => a.id === targetId)
        if (angel) {
          xpGain = 100
          goldGain = 1000
          set((prev) => ({
            summonedAngels: prev.summonedAngels.map((a) =>
              a.id === targetId
                ? {
                    ...a,
                    power: Math.floor(a.power * 1.5),
                    maxHP: Math.floor(a.maxHP * 1.3),
                    currentHP: Math.floor(a.maxHP * 1.3),
                  }
                : a
            ),
          }))
        }

        const material = FA_MATERIALS.find((m) => m.id === targetId)
        if (material) {
          materialBonus = 5
        }

        const newXp = state.angelExp + xpGain
        const newLevel = faLevelFromXp(newXp)
        set((prev) => {
          const updatedMaterials = { ...prev.collectedMaterials }
          if (materialBonus > 0 && material) {
            updatedMaterials[targetId] = (updatedMaterials[targetId] || 0) + materialBonus
          }
          return {
            faithEnergy: Math.max(0, prev.faithEnergy - 100),
            gold: prev.gold + goldGain,
            angelExp: newXp,
            angelLevel: newLevel,
            collectedMaterials: updatedMaterials,
            totalMiracles: prev.totalMiracles + 1,
            sanctuary: {
              ...prev.sanctuary,
              corruption: Math.max(0, prev.sanctuary.corruption - 20),
              health: Math.min(prev.sanctuary.maxHealth, prev.sanctuary.health + 30),
            },
          }
        })
        return true
      },
    }),
    {
      name: 'frost-angel-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: HOOK — useFrostAngel
// ═══════════════════════════════════════════════════════════════════

export default function useFrostAngel() {
  const store = useFAStore()

  // ── Getter: Realm Details ─────────────────────────────────────
  const faGetRealmDetails = useMemo(() => {
    return FA_REALMS.map((realm) => ({
      ...realm,
      unlocked: store.unlockedRealms.includes(realm.id),
      active: store.activeRealmId === realm.id,
      levelMet: store.angelLevel >= realm.minLevel,
      canAfford: store.gold >= realm.unlockCost,
    }))
  }, [store])

  // ── Getter: Material Inventory ────────────────────────────────
  const faGetMaterialInventory = useMemo(() => {
    return FA_MATERIALS.map((mat) => ({
      ...mat,
      owned: store.collectedMaterials[mat.id] || 0,
      rarityColor: faRarityColor(mat.rarity),
    }))
  }, [store])

  // ── Getter: Summoned Angels ───────────────────────────────────
  const faGetSummonedAngels = useMemo(() => {
    return store.summonedAngels.map((a) => {
      const def = FA_ANGELS.find((d) => d.id === a.angelDefId)
      return {
        ...a,
        def,
        elementColor: def ? faElementColor(def.element) : FA_COLOR_ICE_WHITE,
        rarityColor: def ? faRarityColor(def.rarity) : '#9CA3AF',
        totalPower: Math.floor(a.power * (1 + a.level * 0.15) * (1 + a.ascensionCount * 0.3)),
      }
    })
  }, [store])

  // ── Getter: Structure List ────────────────────────────────────
  const faGetStructureList = useMemo(() => {
    return FA_STRUCTURES.map((def) => {
      const owned = store.structures.find((s) => s.structureDefId === def.id)
      const level = owned ? owned.level : 0
      return {
        ...def,
        owned: !!owned,
        level,
        upgradeCost: Math.floor(def.baseCost * Math.pow(def.costMultiplier, level)),
        maxed: level >= 10,
      }
    })
  }, [store])

  // ── Getter: Total Power ───────────────────────────────────────
  const faGetTotalPower = useMemo(() => {
    let angelPower = 0
    for (const a of store.summonedAngels) {
      const def = FA_ANGELS.find((d) => d.id === a.angelDefId)
      if (!def) continue
      const rarityMult = faRarityMultiplier(def.rarity)
      angelPower += Math.floor(
        a.power * rarityMult * (1 + a.level * 0.15) * (1 + a.ascensionCount * 0.3)
      )
    }
    const structurePower = store.structures.reduce(
      (sum, s) => sum + s.level * 12,
      0
    )
    const haloPower = store.collectedHalos.reduce((sum, hId) => {
      const halo = FA_HALOS.find((h) => h.id === hId)
      return sum + (halo ? halo.powerBonus : 0)
    }, 0)
    return { angelPower, structurePower, haloPower, total: angelPower + structurePower + haloPower }
  }, [store])

  // ── Getter: Event Status ──────────────────────────────────────
  const faGetEventStatus = useMemo(() => {
    if (!store.activeEventId) {
      return { active: false, event: null, timer: 0, severity: 0 }
    }
    const event = FA_EVENTS.find((e) => e.id === store.activeEventId)
    return {
      active: true,
      event: event || null,
      timer: store.eventTimer,
      severity: event ? event.severity : 0,
    }
  }, [store.activeEventId, store.eventTimer])

  // ── Getter: Active Event ──────────────────────────────────────
  const faGetActiveEvent = useMemo(() => {
    if (!store.activeEventId) return null
    return FA_EVENTS.find((e) => e.id === store.activeEventId) || null
  }, [store.activeEventId])

  // ── Getter: Next Title ────────────────────────────────────────
  const faGetNextTitle = useMemo(() => {
    const currentTitle = FA_TITLES.find((t) => t.id === store.currentTitle)
    const currentIndex = currentTitle ? FA_TITLES.indexOf(currentTitle) : -1
    if (currentIndex >= FA_TITLES.length - 1) return null
    return FA_TITLES[currentIndex + 1]
  }, [store.currentTitle])

  // ── Getter: Rarity Summary ────────────────────────────────────
  const faGetRaritySummary = useMemo(() => {
    const summary: Record<FARarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const a of store.summonedAngels) {
      const def = FA_ANGELS.find((d) => d.id === a.angelDefId)
      if (def) {
        summary[def.rarity] += 1
      }
    }
    for (const hId of store.collectedHalos) {
      const halo = FA_HALOS.find((h) => h.id === hId)
      if (halo) {
        summary[halo.rarity] += 1
      }
    }
    return summary
  }, [store])

  // ── Getter: Realm Summary ─────────────────────────────────────
  const faGetRealmSummary = useMemo(() => {
    const totalRealms = FA_REALMS.length
    const unlocked = store.unlockedRealms.length
    return {
      totalRealms,
      unlocked,
      percent: Math.floor((unlocked / totalRealms) * 100),
      allUnlocked: unlocked >= totalRealms,
    }
  }, [store.unlockedRealms])

  // ── Getter: Unlocked Achievements ─────────────────────────────
  const faGetUnlockedAchievements = useMemo(() => {
    const unlocked: FAAchievementDef[] = []
    for (const ach of FA_ACHIEVEMENTS) {
      if (store.achievements.includes(ach.id)) {
        unlocked.push(ach)
      }
    }
    return { unlocked, total: FA_ACHIEVEMENTS.length, progress: unlocked.length }
  }, [store])

  // ── Getter: Title Progress ────────────────────────────────────
  const faGetTitleProgress = useMemo(() => {
    return FA_TITLES.map((title) => ({
      ...title,
      unlocked:
        store.angelLevel >= title.requiredLevel &&
        store.unlockedRealms.length >= title.requiredRealms,
      active: store.currentTitle === title.id,
      levelMet: store.angelLevel >= title.requiredLevel,
      realmMet: store.unlockedRealms.length >= title.requiredRealms,
    }))
  }, [store.currentTitle, store.angelLevel, store.unlockedRealms])

  // ── Getter: Collected Halos Detail ────────────────────────────
  const faGetCollectedHalos = useMemo(() => {
    return FA_HALOS.map((halo) => ({
      ...halo,
      collected: store.collectedHalos.includes(halo.id),
      rarityColor: faRarityColor(halo.rarity),
      canAfford:
        store.gold >= Math.floor(20 * faRarityMultiplier(halo.rarity)) &&
        !store.collectedHalos.includes(halo.id),
    }))
  }, [store])

  // ── Getter: Sanctuary Health ──────────────────────────────────
  const faGetSanctuaryHealth = useMemo(() => {
    const { health, maxHealth, corruption, lastHealedAt } = store.sanctuary
    return {
      health,
      maxHealth,
      corruption,
      healthPercent: Math.floor((health / maxHealth) * 100),
      isCorrupted: corruption > 0,
      isCritical: health < maxHealth * 0.25,
      lastHealedAt,
    }
  }, [store.sanctuary])

  // ── Getter: Angel Summoning Costs ─────────────────────────────
  const faGetSummoningCosts = useMemo(() => {
    return FA_ANGELS.filter(
      (a) => !store.summonedAngels.some((s) => s.angelDefId === a.id)
    ).map((angel) => ({
      ...angel,
      summonCost: Math.floor(10 * faRarityMultiplier(angel.rarity)),
      canAfford:
        store.faithEnergy >= Math.floor(10 * faRarityMultiplier(angel.rarity)),
      elementColor: faElementColor(angel.element),
      rarityColor: faRarityColor(angel.rarity),
    }))
  }, [store])

  // ── Level Progress ────────────────────────────────────────────
  const faLevelProgress = useMemo(() => {
    const current = faXpForLevel(store.angelLevel)
    return {
      level: store.angelLevel,
      currentXp: store.angelExp,
      xpToNext: current,
      maxLevel: store.angelLevel >= FA_MAX_LEVEL,
      progressPercent:
        current > 0 ? Math.min(100, Math.floor((store.angelExp / current) * 100)) : 0,
    }
  }, [store.angelLevel, store.angelExp])

  // ── Getter: Ability List ──────────────────────────────────────
  const faGetAbilityList = useMemo(() => {
    return FA_ABILITIES.map((ability) => ({
      ...ability,
      canUse: store.faithEnergy >= ability.cooldown,
      elementColor: faElementColor(ability.element),
    }))
  }, [store.faithEnergy])

  // ── Getter: Event List ────────────────────────────────────────
  const faGetEventList = useMemo(() => {
    return FA_EVENTS.map((event) => ({
      ...event,
      canTrigger: store.activeEventId === null,
      isActive: store.activeEventId === event.id,
    }))
  }, [store.activeEventId])

  // ── Getter: Stats Summary ─────────────────────────────────────
  const { faGetStatsSummary, faGetAngelCountByElement } = useMemo(() => {
    const angelCountByElement: Record<FAElement, number> = {
      Ice: 0,
      Light: 0,
      Crystal: 0,
      Snow: 0,
      Star: 0,
      Halo: 0,
      Frost: 0,
    }
    for (const a of store.summonedAngels) {
      const def = FA_ANGELS.find((d) => d.id === a.angelDefId)
      if (def) {
        angelCountByElement[def.element] += 1
      }
    }

    const statsSummary = {
      totalAngels: store.summonedAngels.length,
      totalMaterials: Object.values(store.collectedMaterials).reduce((s, v) => s + v, 0),
      totalStructures: store.structures.length,
      totalHalos: store.collectedHalos.length,
      totalRealms: store.unlockedRealms.length,
      avgAngelLevel:
        store.summonedAngels.length > 0
          ? Math.floor(
              store.summonedAngels.reduce((s, a) => s + a.level, 0) / store.summonedAngels.length
            )
          : 0,
      totalAscensions: store.summonedAngels.reduce((s, a) => s + a.ascensionCount, 0),
    }

    return { faGetStatsSummary: statsSummary, faGetAngelCountByElement: angelCountByElement }
  }, [store])

  // ── Getter: Upgrade Costs ─────────────────────────────────────
  const faGetUpgradeCosts = useMemo(() => {
    return store.structures.map((s) => {
      const def = FA_STRUCTURES.find((d) => d.id === s.structureDefId)
      if (!def) return { ...s, nextCost: 0, maxed: s.level >= 10 }
      const nextCost = s.level >= 10 ? 0 : Math.floor(def.baseCost * Math.pow(def.costMultiplier, s.level))
      return { ...s, def, nextCost, maxed: s.level >= 10 }
    })
  }, [store.structures])

  // ── Getter: Halo Bonus ────────────────────────────────────────
  const faGetHaloBonus = useMemo(() => {
    let totalPowerBonus = 0
    for (const hId of store.collectedHalos) {
      const halo = FA_HALOS.find((h) => h.id === hId)
      if (halo) {
        totalPowerBonus += halo.powerBonus
      }
    }
    return {
      totalPowerBonus,
      haloCount: store.collectedHalos.length,
      hasLegendaryHalo: store.collectedHalos.some((hId) => {
        const halo = FA_HALOS.find((h) => h.id === hId)
        return halo && halo.rarity === 'legendary'
      }),
    }
  }, [store.collectedHalos])

  // ── Getter: Ascension Tier Details ────────────────────────────
  const faGetAscensionTierDetails = useMemo(() => {
    return store.summonedAngels.map((a) => {
      const def = FA_ANGELS.find((d) => d.id === a.angelDefId)
      const ascensionTier = faGetAscensionTier(a.ascensionCount)
      return {
        ...a,
        def,
        ascensionTier,
        nextTier: a.ascensionCount < 5 ? faGetAscensionTier(a.ascensionCount + 1) : null,
        canAscend: a.ascensionCount < 5,
        ascensionCost: Math.floor(50 * Math.pow(2, a.ascensionCount)),
        ascensionGoldCost: Math.floor(50 * Math.pow(2, a.ascensionCount)) * 2,
      }
    })
  }, [store])

  // ── Getter: Realm Materials Available ─────────────────────────
  const faGetRealmMaterials = useMemo(() => {
    if (!store.activeRealmId) return { materials: [], bonusMaterials: [] }
    const realm = FA_REALMS.find((r) => r.id === store.activeRealmId)
    if (!realm || !realm.materialIds) return { materials: [], bonusMaterials: [] }

    const materials = (realm.materialIds as string[])
      .map((mId: string) => FA_MATERIALS.find((m) => m.id === mId))
      .filter((m): m is FAMaterialDef => m !== undefined)

    const bonusMaterials = ((realm as any).bonusMaterialIds || [] as string[])
      .map((mId: string) => FA_MATERIALS.find((m) => m.id === mId))
      .filter((m): m is FAMaterialDef => m !== undefined)

    return { materials, bonusMaterials }
  }, [store.activeRealmId])

  // ── Getter: Faith Energy Efficiency ───────────────────────────
  const faGetFaithEfficiency = useMemo(() => {
    const structureBonus = store.structures.reduce((sum, s) => {
      return sum + faGetStructureBonus(s.structureDefId, s.level)
    }, 0)
    const haloBonus = store.collectedHalos.reduce((sum, hId) => {
      const halo = FA_HALOS.find((h) => h.id === hId)
      return sum + (halo ? Math.floor(halo.powerBonus * 0.2) : 0)
    }, 0)
    return {
      baseRegen: 1,
      structureBonus,
      haloBonus,
      totalRegen: 1 + structureBonus + haloBonus,
    }
  }, [store])

  // ── Assemble faAPI ────────────────────────────────────────────
  const faAPI = {
    // Constants
    FA_ANGELS,
    FA_REALMS,
    FA_MATERIALS,
    FA_STRUCTURES,
    FA_ABILITIES,
    FA_ACHIEVEMENTS,
    FA_TITLES,
    FA_HALOS,
    FA_EVENTS,
    FA_COLOR_ICE_WHITE,
    FA_COLOR_FROST_BLUE,
    FA_COLOR_CRYSTAL_SILVER,
    FA_COLOR_HALO_GOLD,
    FA_COLOR_ANGELIC_PINK,
    FA_COLOR_SNOW_LAVENDER,
    FA_COLOR_DIVINE_CYAN,
    FA_COLOR_WINTER_ROSE,

    // State
    summonedAngels: store.summonedAngels,
    collectedMaterials: store.collectedMaterials,
    structures: store.structures,
    achievements: store.achievements,
    currentTitle: store.currentTitle,
    collectedHalos: store.collectedHalos,
    unlockedRealms: store.unlockedRealms,
    angelLevel: store.angelLevel,
    angelExp: store.angelExp,
    gold: store.gold,
    faithEnergy: store.faithEnergy,
    totalSummoned: store.totalSummoned,
    totalBlessed: store.totalBlessed,
    totalUpgraded: store.totalUpgraded,
    totalAscended: store.totalAscended,
    totalMiracles: store.totalMiracles,
    activeEventId: store.activeEventId,
    eventTimer: store.eventTimer,
    sanctuary: store.sanctuary,
    activeRealmId: store.activeRealmId,

    // Actions
    faSummonAngel: store.faSummonAngel,
    faBlessMaterial: store.faBlessMaterial,
    faUpgradeSanctuary: store.faUpgradeSanctuary,
    faUseAbility: store.faUseAbility,
    faTriggerDivineEvent: store.faTriggerDivineEvent,
    faCollectHalo: store.faCollectHalo,
    faAscendAngel: store.faAscendAngel,
    faPurifyCorruption: store.faPurifyCorruption,
    faHealSanctuary: store.faHealSanctuary,
    faUnlockRealm: store.faUnlockRealm,
    faPerformMiracle: store.faPerformMiracle,

    // Getters
    faGetRealmDetails,
    faGetMaterialInventory,
    faGetSummonedAngels,
    faGetStructureList,
    faGetTotalPower,
    faGetEventStatus,
    faGetActiveEvent,
    faGetNextTitle,
    faGetRaritySummary,
    faGetRealmSummary,
    faGetUnlockedAchievements,
    faGetTitleProgress,
    faGetCollectedHalos,
    faGetSanctuaryHealth,
    faGetSummoningCosts,
    faLevelProgress,
    faGetAbilityList,
    faGetEventList,
    faGetStatsSummary,
    faGetAngelCountByElement,
    faGetUpgradeCosts,
    faGetHaloBonus,
    faGetAscensionTierDetails,
    faGetRealmMaterials,
    faGetFaithEfficiency,
  }

  return faAPI
}
