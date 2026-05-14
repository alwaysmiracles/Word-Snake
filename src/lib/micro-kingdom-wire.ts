/**
 * Micro Kingdom Wire — 微型王国 feature module for Word Snake
 *
 * A tiny civilization management mini-game: recruit 35 micro citizens across
 * 5 rarity tiers, settle 8 miniature districts, gather 30 micro resources,
 * build 25 micro structures (upgradeable to level 10), wield 22 tiny abilities,
 * earn 8 kingdom titles, invent 15 micro gadgets, and survive 12 giant events
 * — backed by a Zustand store with persist middleware.
 *
 * Storage key: micro-kingdom-wire
 * Prefix: mi / MI_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type MIRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type MIRole = 'Builder' | 'Farmer' | 'Scientist' | 'Artist' | 'Soldier' | 'Trader' | 'Healer'

export interface MICitizenDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly role: MIRole
  readonly rarity: MIRarity
  readonly basePower: number
  readonly ability: string
}

export interface MIDistrictDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly minLevel: number
  readonly settleCost: number
  readonly bonuses: string[]
}

export interface MIResourceDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: MIRarity
  readonly source: string
  readonly value: number
}

export interface MIStructureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly costMultiplier: number
}

export interface MIAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly role: MIRole
}

export interface MIAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface MITitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredDistricts: number
}

export interface MIInventionDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: MIRarity
  readonly powerBonus: number
  readonly specialAbility: string
}

export interface MIGiantEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly duration: number
  readonly effects: string[]
}

export interface MIRecruitedCitizen {
  readonly id: string
  citizenDefId: string
  name: string
  level: number
  currentHP: number
  maxHP: number
  power: number
  promoted: boolean
  promotionCount: number
  acquiredAt: number
}

export interface MIOwnedStructure {
  readonly id: string
  structureDefId: string
  level: number
  built: boolean
}

export interface MIKingdomState {
  prosperity: number
  maxProsperity: number
  morale: number
  lastRepairedAt: number | null
}

export interface MIStoreState {
  recruitedCitizens: MIRecruitedCitizen[]
  collectedResources: Record<string, number>
  structures: MIOwnedStructure[]
  achievements: string[]
  currentTitle: string
  inventedGadgets: string[]
  settledDistricts: string[]
  kingdomLevel: number
  kingdomExp: number
  gold: number
  microEnergy: number
  totalRecruited: number
  totalHarvested: number
  totalUpgraded: number
  totalPromoted: number
  totalInvented: number
  activeEventId: string | null
  eventTimer: number
  kingdom: MIKingdomState
  activeDistrictId: string | null
}

export interface MIStoreActions {
  miRecruitCitizen: (citizenId: string) => boolean
  miHarvestResource: (resourceId: string) => number
  miBuildStructure: (structureId: string) => boolean
  miUseAbility: (abilityId: string) => boolean
  miHandleGiantEvent: (eventId: string) => boolean
  miInventGadget: (gadgetId: string) => boolean
  miResearchTech: (citizenInstanceId: string) => boolean
  miHarvestCrop: (cropId: string) => number
  miTrainSoldier: (soldierInstanceId: string) => boolean
  miSettleDistrict: (districtId: string) => boolean
  miExploreFrontier: (districtId: string) => boolean
  miPromoteCitizen: (instanceId: string) => boolean
  miRepairKingdom: (amount: number) => boolean
  miBoostMorale: (amount: number) => boolean
}

export type MIFullStore = MIStoreState & MIStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const MI_COLOR_MICRO_GREEN: string = '#4ADE80'
export const MI_COLOR_MINI_BLUE: string = '#60A5FA'
export const MI_COLOR_TINY_GOLD: string = '#FACC15'
export const MI_COLOR_PEBBLE_BROWN: string = '#A0785A'
export const MI_COLOR_DEWDROP_SILVER: string = '#C0C0D8'
export const MI_COLOR_INVENTION_COPPER: string = '#B87333'
export const MI_COLOR_FRONTIER_ORANGE: string = '#FB923C'
export const MI_COLOR_KINGDOM_PURPLE: string = '#A78BFA'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: XP & LEVEL HELPERS
// ═══════════════════════════════════════════════════════════════════

const MI_MAX_LEVEL = 50
const MI_INITIAL_GOLD = 500
const MI_INITIAL_ENERGY = 100

function miXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= MI_MAX_LEVEL) return Infinity
  return Math.floor(90 * Math.pow(1.14, level) + level * 18)
}

function miLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < MI_MAX_LEVEL) {
    const needed = miXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function miGenerateId(): string {
  return `mi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function miRarityMultiplier(rarity: MIRarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.5
    case 'rare': return 2.2
    case 'epic': return 3.5
    case 'legendary': return 6.0
  }
}

function miRoleColor(role: MIRole): string {
  switch (role) {
    case 'Builder': return MI_COLOR_PEBBLE_BROWN
    case 'Farmer': return MI_COLOR_MICRO_GREEN
    case 'Scientist': return MI_COLOR_MINI_BLUE
    case 'Artist': return MI_COLOR_KINGDOM_PURPLE
    case 'Soldier': return MI_COLOR_FRONTIER_ORANGE
    case 'Trader': return MI_COLOR_TINY_GOLD
    case 'Healer': return MI_COLOR_DEWDROP_SILVER
  }
}

function miRarityColor(rarity: MIRarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#22D3EE'
    case 'rare': return '#818CF8'
    case 'epic': return '#F472B6'
    case 'legendary': return '#FBBF24'
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: ROLE BONUSES & RECRUIT CHANCES
// ═══════════════════════════════════════════════════════════════════

const MI_ROLE_BONUSES: Record<MIRole, { construction: number; food: number; research: number; defense: number }> = {
  Builder: { construction: 25, food: 0, research: 0, defense: 5 },
  Farmer: { construction: 0, food: 25, research: 0, defense: 0 },
  Scientist: { construction: 5, food: 0, research: 25, defense: 0 },
  Artist: { construction: 0, food: 0, research: 10, defense: 0 },
  Soldier: { construction: 0, food: 0, research: 0, defense: 25 },
  Trader: { construction: 5, food: 10, research: 0, defense: 0 },
  Healer: { construction: 0, food: 10, research: 5, defense: 0 },
}

const MI_RECRUIT_CHANCES: Record<MIRarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1,
}

const MI_DISTRICT_ROLE_BONUS: Record<string, MIRole[]> = {
  crumb_meadows: ['Farmer', 'Healer'],
  pebble_quarter: ['Builder', 'Soldier'],
  dewdrop_basin: ['Healer', 'Artist'],
  seedling_square: ['Farmer', 'Scientist'],
  acorn_fortress: ['Soldier', 'Builder'],
  thread_alley: ['Artist', 'Trader'],
  shell_bay: ['Trader', 'Healer'],
  throne_hill: ['Trader', 'Scientist', 'Artist', 'Builder', 'Farmer', 'Soldier', 'Healer'],
}

function miGetRoleBonus(role: MIRole): { construction: number; food: number; research: number; defense: number } {
  return MI_ROLE_BONUSES[role]
}

function miGetRecruitChance(rarity: MIRarity, activeDistrictId: string | null): number {
  let chance = MI_RECRUIT_CHANCES[rarity]
  if (activeDistrictId) {
    const bonusRoles = MI_DISTRICT_ROLE_BONUS[activeDistrictId]
    if (bonusRoles && bonusRoles.length > 4) {
      chance = chance * 1.5
    }
  }
  return Math.min(100, Math.floor(chance))
}

function miGetPromotionBonus(level: number, promotionCount: number): number {
  return Math.floor(level * 15 * (1 + promotionCount * 0.3))
}

function miGetStructureBonus(structureId: string, level: number): number {
  switch (structureId) {
    case 'crumb_silo': return level * 2
    case 'pebble_workshop': return level * 5
    case 'dewdrop_well': return level * 8
    case 'acorn_barracks': return level * 12
    case 'throne_hall': return level * 20
    case 'seedbed_farm': return level * 3
    case 'thread_loom': return level * 7
    case 'invention_lab': return level * 15
    default: return level * 2
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: MI_CITIZENS — 35 Micro Citizens (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const MI_CITIZENS: readonly MICitizenDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'crumb_builder_pip',
    name: 'Pip the Crumb Builder',
    description:
      'A tiny builder no bigger than a bread crumb who constructs miniature houses from leftover dough. Despite their minuscule size, Pip can assemble a fully functional micro-cottage in under an hour using only toothpick scaffolding and paste made from flour.',
    role: 'Builder',
    rarity: 'common',
    basePower: 15,
    ability: 'Crumb Masonry',
  },
  {
    id: 'pebble_farmer_dill',
    name: 'Dill the Pebble Farmer',
    description:
      'A dedicated micro farmer who tends to gardens growing between pebbles. Dill has learned to coax impossibly small carrots and lettuces from the tiniest cracks in stone, feeding dozens of micro citizens from what giants would call a handful of soil.',
    role: 'Farmer',
    rarity: 'common',
    basePower: 14,
    ability: 'Pebble Harvest',
  },
  {
    id: 'dewdrop_scientist_nyx',
    name: 'Nyx the Dewdrop Scientist',
    description:
      'A curious researcher who studies the physics of dewdrops. Nyx has discovered that surface tension behaves differently at the micro scale, allowing tiny citizens to walk on water surfaces without sinking — a discovery that revolutionized micro transportation.',
    role: 'Scientist',
    rarity: 'common',
    basePower: 16,
    ability: 'Dewdrop Analysis',
  },
  {
    id: 'thread_artist_luna',
    name: 'Luna the Thread Artist',
    description:
      'An imaginative micro artist who weaves tapestries from single threads found on the ground. Luna\'s creations depict epic micro-battles and daily kingdom life, each one small enough to fit on a fingernail but detailed enough to rival giant masterworks.',
    role: 'Artist',
    rarity: 'common',
    basePower: 13,
    ability: 'Thread Weaving',
  },
  {
    id: 'shell_soldier_grit',
    name: 'Grit the Shell Soldier',
    description:
      'A brave micro soldier who wears armor made from a snail shell. Grit patrols the borders of the micro kingdom with a spear carved from a pine needle, ever vigilant against the terrifying creatures that roam the giant world above.',
    role: 'Soldier',
    rarity: 'common',
    basePower: 18,
    ability: 'Shell Shield Bash',
  },
  {
    id: 'seed_trader_bram',
    name: 'Bram the Seed Trader',
    description:
      'A shrewd micro merchant who travels between districts trading seeds, crumbs, and pebbles. Bram knows the value of every micro resource and can negotiate deals that would impress even the most experienced giant traders.',
    role: 'Trader',
    rarity: 'common',
    basePower: 12,
    ability: 'Seed Barter',
  },
  {
    id: 'moss_healer_sage',
    name: 'Sage the Moss Healer',
    description:
      'A gentle healer who uses moss poultices and dewdrop tinctures to cure ailments common among micro citizens. Sage\'s remedies are sought across all districts, and their tiny clinic under a leaf never turns away a patient.',
    role: 'Healer',
    rarity: 'common',
    basePower: 17,
    ability: 'Moss Soothing',
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'acorn_architect_quill',
    name: 'Quill the Acorn Architect',
    description:
      'A master architect who designs elaborate structures from hollowed acorns. Quill\'s blueprints are drawn with spider silk on birch bark, and their buildings feature working micro-plumbing systems powered by capillary action.',
    role: 'Builder',
    rarity: 'uncommon',
    basePower: 30,
    ability: 'Acorn Tower Build',
  },
  {
    id: 'sprout_cultivator_fern',
    name: 'Fern the Sprout Cultivator',
    description:
      'An expert cultivator who has developed techniques to grow micro-crops at accelerated rates. Fern understands the secret language of sprouting seeds and can coax a full harvest from a single grain of wheat in just three days.',
    role: 'Farmer',
    rarity: 'uncommon',
    basePower: 28,
    ability: 'Sprout Acceleration',
  },
  {
    id: 'lens_researcher_optic',
    name: 'Optic the Lens Researcher',
    description:
      'A brilliant scientist who constructs microscopes from dewdrops and insect wings. Optic\'s inventions have revealed entire microscopic ecosystems that exist within a single drop of pond water, changing how all micro citizens understand their world.',
    role: 'Scientist',
    rarity: 'uncommon',
    basePower: 32,
    ability: 'Lens Magnification',
  },
  {
    id: 'petal_painter_iris',
    name: 'Iris the Petal Painter',
    description:
      'A renowned artist who paints miniature portraits using pigments extracted from flower petals. Iris\'s works are so detailed that viewers need a magnifying glass to appreciate the individual brushstrokes, each one no wider than a hair.',
    role: 'Artist',
    rarity: 'uncommon',
    basePower: 29,
    ability: 'Petal Pigment Art',
  },
  {
    id: 'thorn_guardian_rune',
    name: 'Rune the Thorn Guardian',
    description:
      'A fearsome warrior who wields dual blades made from sharpened rose thorns. Rune has defended the kingdom from beetle attacks and centipede invasions, earning a reputation as the most dangerous micro soldier in all eight districts.',
    role: 'Soldier',
    rarity: 'uncommon',
    basePower: 35,
    ability: 'Thorn Blade Storm',
  },
  {
    id: 'nector_merchant_hazel',
    name: 'Hazel the Nectar Merchant',
    description:
      'A wealthy trader who controls the kingdom\'s nectar trade routes. Hazel has established trading partnerships with neighboring micro civilizations and even managed to barter with a friendly bee for exclusive access to premium flower nectar.',
    role: 'Trader',
    rarity: 'uncommon',
    basePower: 27,
    ability: 'Nectar Deal Making',
  },
  {
    id: 'honey_mender_amber',
    name: 'Amber the Honey Mender',
    description:
      'A skilled healer who discovered that diluted honey possesses remarkable antibacterial properties at the micro scale. Amber\'s clinic uses honey-based remedies that can cure wounds that would be fatal to ordinary micro citizens.',
    role: 'Healer',
    rarity: 'uncommon',
    basePower: 31,
    ability: 'Honey Restoration',
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'crystal_engineer_gear',
    name: 'Gear the Crystal Engineer',
    description:
      'A genius engineer who builds intricate clockwork mechanisms from quartz crystal fragments and spider silk gears. Gear\'s inventions include a working micro-compass, a water-powered grain mill, and the kingdom\'s first mechanical crane.',
    role: 'Builder',
    rarity: 'rare',
    basePower: 55,
    ability: 'Crystal Clockwork',
  },
  {
    id: 'golden_grower_sol',
    name: 'Sol the Golden Grower',
    description:
      'A legendary farmer who can grow golden wheat from ordinary seeds through an unknown cultivation technique. Sol\'s golden crops are said to boost the morale of anyone who eats them, and they glow with a warm inner light after sunset.',
    role: 'Farmer',
    rarity: 'rare',
    basePower: 52,
    ability: 'Golden Crop Bloom',
  },
  {
    id: 'atom_theorist_quark',
    name: 'Quark the Atom Theorist',
    description:
      'A revolutionary scientist who has developed theories about the atomic structure of matter that are decades ahead of giant science. Quark works in a laboratory carved inside a grain of sand and uses focused sunlight as their primary research tool.',
    role: 'Scientist',
    rarity: 'rare',
    basePower: 58,
    ability: 'Atomic Insight',
  },
  {
    id: 'mosaic_virtuoso_cera',
    name: 'Cera the Mosaic Virtuoso',
    description:
      'A master artist who creates breathtaking mosaics from colored sand grains and crushed gemstone dust. Cera\'s largest work, a map of the entire micro kingdom, took three years to complete and spans an area the size of a postage stamp.',
    role: 'Artist',
    rarity: 'rare',
    basePower: 50,
    ability: 'Sand Mosaic Creation',
  },
  {
    id: 'steel_commander_forge',
    name: 'Forge the Steel Commander',
    description:
      'An elite military commander who has forged armor and weapons from rusted steel particles found on discarded nails. Forge leads the kingdom\'s elite guard and has never lost a battle against any creature, no matter how large.',
    role: 'Soldier',
    rarity: 'rare',
    basePower: 62,
    ability: 'Steel Formation Charge',
  },
  {
    id: 'silk_road_voyager_gossamer',
    name: 'Gossamer the Silk Road Voyager',
    description:
      'A legendary trader who has mapped trade routes spanning the entire garden, from the rose bed to the compost heap. Gossamer speaks three micro languages and has established the kingdom\'s first embassy with a neighboring ant colony.',
    role: 'Trader',
    rarity: 'rare',
    basePower: 54,
    ability: 'Silk Road Network',
  },
  {
    id: 'dew_surgeon_cryo',
    name: 'Cryo the Dew Surgeon',
    description:
      'A master surgeon who performs delicate operations using scalpels made from frozen dewdrops. Cryo has developed micro-surgical techniques that can repair injuries previously considered untreatable, saving countless micro lives.',
    role: 'Healer',
    rarity: 'rare',
    basePower: 56,
    ability: 'Dewdrop Surgery',
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'monument_mason_colossus',
    name: 'Colossus the Monument Mason',
    description:
      'An architect of mythic proportions among micro folk who builds monuments visible to the naked eye. Colossus constructed the kingdom\'s iconic Crumb Cathedral, a structure five centimeters tall that took an entire generation of builders to complete.',
    role: 'Builder',
    rarity: 'epic',
    basePower: 92,
    ability: 'Monument Erection',
  },
  {
    id: 'living_garden_weaver_gaia',
    name: 'Gaia the Living Garden Weaver',
    description:
      'A transcendent farmer who communicates with plants at a cellular level. Gaia can shape living roots into homes, grow fruit in any shape desired, and has created a self-sustaining ecosystem within the kingdom walls that provides unlimited food.',
    role: 'Farmer',
    rarity: 'epic',
    basePower: 88,
    ability: 'Living Garden Shape',
  },
  {
    id: 'nano_inventor_spark',
    name: 'Spark the Nano Inventor',
    description:
      'A genius inventor working at the very edge of what micro-science can achieve. Spark has created micro-electricity from static charges on butterfly wings and built a tiny telegraph system that connects all eight districts instantly.',
    role: 'Scientist',
    rarity: 'epic',
    basePower: 95,
    ability: 'Nano Invention',
  },
  {
    id: 'dreamweaver_phantasm',
    name: 'Phantasm the Dreamweaver',
    description:
      'An enigmatic artist who creates art that exists in the minds of those who view it. Phantasm paints with bioluminescent algae that emit images when viewed in darkness, creating immersive experiences that feel like shared dreams.',
    role: 'Artist',
    rarity: 'epic',
    basePower: 85,
    ability: 'Dreamscape Painting',
  },
  {
    id: 'thunderguard_titan_warcry',
    name: 'Warcry the Thunderguard Titan',
    description:
      'A warrior of legendary prowess who has single-handedly defeated a spider — the most feared predator in the micro world. Warcry\'s battle cry is so powerful it can startle insects five hundred times their size into retreat.',
    role: 'Soldier',
    rarity: 'epic',
    basePower: 98,
    ability: 'Thunderguard Warcry',
  },
  {
    id: 'horizon_merchant_zephyr',
    name: 'Zephyr the Horizon Merchant',
    description:
      'A merchant who trades not just with neighboring micro civilizations but with the wind itself. Zephyr captures valuable particles carried on air currents and has established trade agreements with traveling pollen spirits that pass through the garden.',
    role: 'Trader',
    rarity: 'epic',
    basePower: 90,
    ability: 'Wind Trade Route',
  },
  {
    id: 'miracle_physician_elysium',
    name: 'Elysium the Miracle Physician',
    description:
      'A physician of extraordinary ability who can cure any ailment using a combination of herbal micro-medicine and what can only be described as miraculous healing energy. Elysium\'s presence alone is enough to ease pain and accelerate recovery.',
    role: 'Healer',
    rarity: 'epic',
    basePower: 93,
    ability: 'Miracle Healing Aura',
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'worldseed_architect_primordia',
    name: 'Primordia the Worldseed Architect',
    description:
      'The first builder in micro history who constructed the very foundation of the Micro Kingdom from a single apple seed. Primordia\'s building techniques are encoded in the kingdom\'s oldest scrolls and are still used by every builder to this day.',
    role: 'Builder',
    rarity: 'legendary',
    basePower: 145,
    ability: 'Worldseed Foundation',
  },
  {
    id: 'everbloom_ancestress_flora',
    name: 'Flora the Everbloom Ancestress',
    description:
      'The mother of all micro agriculture who discovered farming at the dawn of micro civilization. Flora taught the first micro citizens that seeds buried in soil would grow into food, a revelation that transformed wandering micro tribes into a settled kingdom.',
    role: 'Farmer',
    rarity: 'legendary',
    basePower: 138,
    ability: 'Everbloom Genesis',
  },
  {
    id: 'quantum_thinker_axiom',
    name: 'Axiom the Quantum Thinker',
    description:
      'A being of pure intellect who perceives reality at the quantum level. Axiom exists simultaneously in multiple states and has calculated the precise probability of every possible future for the Micro Kingdom, enabling perfect decision-making.',
    role: 'Scientist',
    rarity: 'legendary',
    basePower: 150,
    ability: 'Quantum Probability',
  },
  {
    id: 'eternal_canvas_whisper',
    name: 'Whisper the Eternal Canvas',
    description:
      'An artist whose creations exist outside of time itself. Whisper paints with pigments made from compressed starlight and distilled memories, creating works that change depending on who views them and reveal different meanings at different times of day.',
    role: 'Artist',
    rarity: 'legendary',
    basePower: 140,
    ability: 'Timeless Art Creation',
  },
  {
    id: 'invincible_sentinel_eternal',
    name: 'Eternal the Invincible Sentinel',
    description:
      'A warrior who has never been defeated in combat across centuries of micro warfare. Eternal was present at the founding of the kingdom and has stood guard at the frontier ever since, an unmoving monument to micro courage and resilience.',
    role: 'Soldier',
    rarity: 'legendary',
    basePower: 148,
    ability: 'Eternal Vigilance',
  },
  {
    id: 'cosmic_exchanger_nebula',
    name: 'Nebula the Cosmic Exchanger',
    description:
      'A trader who deals in currencies beyond mortal comprehension — starlight, moonbeams, and fragments of cosmic dust. Nebula\'s caravans travel on moonbeams and return with exotic goods from the furthest corners of the garden galaxy.',
    role: 'Trader',
    rarity: 'legendary',
    basePower: 142,
    ability: 'Cosmic Barter',
  },
  {
    id: 'lifewell_matriarch_vita',
    name: 'Vita the Lifewell Matriarch',
    description:
      'The source of all healing knowledge in the Micro Kingdom. Vita discovered the Lifewell, a miraculous spring hidden beneath the kingdom that cures any wound, disease, or affliction. She is said to be immortal, sustained by the well\'s eternal waters.',
    role: 'Healer',
    rarity: 'legendary',
    basePower: 135,
    ability: 'Lifewell Restoration',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: MI_DISTRICTS — 8 Miniature Districts
// ═══════════════════════════════════════════════════════════════════

export const MI_DISTRICTS: readonly MIDistrictDef[] = [
  {
    id: 'crumb_meadows',
    name: 'Crumb Meadows',
    description:
      'A sprawling district built among fallen bread crumbs on the kitchen floor. The soft, spongy terrain is perfect for farming, and the gentle warmth from the nearby radiator creates a temperate micro-climate ideal for growing micro-crops year-round.',
    minLevel: 1,
    settleCost: 0,
    bonuses: ['+5% food production', 'Basic resource gathering'],
  },
  {
    id: 'pebble_quarter',
    name: 'Pebble Quarter',
    description:
      'A rugged industrial district constructed between smooth river pebbles in the garden path. The stones provide natural fortification, and the narrow gaps between them create perfect defensive corridors against invading insects.',
    minLevel: 5,
    settleCost: 200,
    bonuses: ['+10% construction speed', 'Rare citizen encounters'],
  },
  {
    id: 'dewdrop_basin',
    name: 'Dewdrop Basin',
    description:
      'A shimmering district built around a persistent dewdrop that never evaporates. The basin reflects rainbow light at dawn and serves as the kingdom\'s primary water source and healing center.',
    minLevel: 10,
    settleCost: 500,
    bonuses: ['+15% healing efficiency', 'Dewdrop energy regeneration'],
  },
  {
    id: 'seedling_square',
    name: 'Seedling Square',
    description:
      'A vibrant district centered around an ancient oak seedling. The young tree provides shelter, acorns for building materials, and its roots create a natural irrigation network that waters all the micro-farms in the surrounding area.',
    minLevel: 15,
    settleCost: 1200,
    bonuses: ['+20% research output', 'Advanced farming unlocked'],
  },
  {
    id: 'acorn_fortress',
    name: 'Acorn Fortress',
    description:
      'A heavily fortified military district built inside a massive hollowed oak acorn. The fortress walls are three millimeters thick — impenetrable by any micro creature — and its watchtower provides views of the entire garden.',
    minLevel: 22,
    settleCost: 3000,
    bonuses: ['+25% defense rating', 'Elite soldier training available'],
  },
  {
    id: 'thread_alley',
    name: 'Thread Alley',
    description:
      'A bustling artistic and commercial district woven from colorful threads found on a discarded sweater. The alley is a maze of suspended walkways and hanging shops, the cultural heart of the Micro Kingdom.',
    minLevel: 30,
    settleCost: 7500,
    bonuses: ['+30% trade income', 'Epic artist recruitment unlocked'],
  },
  {
    id: 'shell_bay',
    name: 'Shell Bay',
    description:
      'A prosperous trading port built along the edge of a rain puddle inside a spiral snail shell. The bay connects to other micro civilizations via floating leaf boats and hosts the kingdom\'s largest marketplace.',
    minLevel: 38,
    settleCost: 15000,
    bonuses: ['+35% resource discovery', 'Legendary invention chance'],
  },
  {
    id: 'throne_hill',
    name: 'Throne Hill',
    description:
      'The sovereign heart of the Micro Kingdom, built atop a small mound of rich earth in the garden\'s center. The Royal Throne — a single dandelion seed head — sits at the summit, radiating authority over all eight districts.',
    minLevel: 45,
    settleCost: 30000,
    bonuses: ['+50% all bonuses', 'Legendary citizen recruitment', 'Royal decrees available'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: MI_RESOURCES — 30 Micro Resources
// ═══════════════════════════════════════════════════════════════════

export const MI_RESOURCES: readonly MIResourceDef[] = [
  // Common (6)
  { id: 'bread_crumbs', name: 'Bread Crumbs', description: 'The foundational building material and food source of the Micro Kingdom. Soft, moldable, and abundant in the kitchen territory.', rarity: 'common', source: 'crumb_meadows', value: 5 },
  { id: 'tiny_pebbles', name: 'Tiny Pebbles', description: 'Smooth stones smaller than a grain of rice, used in construction and as ammunition for micro slingshots wielded by soldiers.', rarity: 'common', source: 'pebble_quarter', value: 4 },
  { id: 'morning_dew', name: 'Morning Dew', description: 'Fresh dewdrops collected at dawn before the sun evaporates them. Essential for drinking, healing, and powering simple micro-machines.', rarity: 'common', source: 'dewdrop_basin', value: 6 },
  { id: 'grass_blades', name: 'Grass Blades', description: 'Thin strips of grass used as rope, thatch, and weaving material. A single blade can be split into dozens of useful micro-fibers.', rarity: 'common', source: 'crumb_meadows', value: 3 },
  { id: 'ant_dust', name: 'Ant Dust', description: 'Fine powder collected from ant trails, rich in minerals and pheromone traces. Used in farming as fertilizer and in trading as currency.', rarity: 'common', source: 'pebble_quarter', value: 7 },
  { id: 'seed_flakes', name: 'Seed Flakes', description: 'Thin outer layers of various seeds that provide nutrition and can be pressed into thin sheets for building lightweight shelters.', rarity: 'common', source: 'seedling_square', value: 5 },

  // Uncommon (6)
  { id: 'crystal_grains', name: 'Crystal Grains', description: 'Sugar crystals found near spilled tea. They sparkle like diamonds to micro eyes and can be used to create optical devices and sweet preserves.', rarity: 'uncommon', source: 'crumb_meadows', value: 28 },
  { id: 'silk_threads', name: 'Silk Threads', description: 'Spider silk harvested from abandoned webs. Incredibly strong relative to its thickness, it is the Micro Kingdom\'s most versatile construction material.', rarity: 'uncommon', source: 'thread_alley', value: 35 },
  { id: 'petal_pigment', name: 'Petal Pigment', description: 'Crushed flower petals yielding vivid reds, blues, yellows, and purples. Used by artists to create miniature paintings and by soldiers as war paint.', rarity: 'uncommon', source: 'dewdrop_basin', value: 32 },
  { id: 'pollen_gold', name: 'Pollen Gold', description: 'Golden pollen grains collected from blooming flowers. High in energy content and used as both food seasoning and a form of decorative gold for royal structures.', rarity: 'uncommon', source: 'seedling_square', value: 40 },
  { id: 'iron_filing', name: 'Iron Filings', description: 'Tiny metallic particles from rusted nails and garden tools. Essential for crafting weapons and tools, and can be magnetized for compass construction.', rarity: 'uncommon', source: 'pebble_quarter', value: 30 },
  { id: 'honey_drop', name: 'Honey Drop', description: 'A single drop of honey, enough to feed an entire micro family for a week. Its medicinal properties make it the most valued healing resource in the kingdom.', rarity: 'uncommon', source: 'dewdrop_basin', value: 45 },

  // Rare (6)
  { id: 'diamond_dust', name: 'Diamond Dust', description: 'Microscopic diamond particles shed from a giant\'s ring. Used in the finest cutting tools and as windows for the most prestigious buildings in the kingdom.', rarity: 'rare', source: 'shell_bay', value: 120 },
  { id: 'moonlight_silver', name: 'Moonlight Silver', description: 'Condensed moonlight captured in silver vessels during full moons. This ethereal resource powers advanced micro-technology and glows with a soft, calming light.', rarity: 'rare', source: 'dewdrop_basin', value: 150 },
  { id: 'phoenix_feather_fiber', name: 'Phoenix Feather Fiber', description: 'Micro-fibers from a mythical phoenix feather that drifted down from the sky. They are fireproof, lighter than silk, and radiate gentle warmth constantly.', rarity: 'rare', source: 'thread_alley', value: 140 },
  { id: 'thunderstone_shard', name: 'Thunderstone Shard', description: 'A fragment of fulgurite created when lightning struck sand. It crackles with residual electrical energy and can power micro-machines for months.', rarity: 'rare', source: 'pebble_quarter', value: 160 },
  { id: 'ancient_amber', name: 'Ancient Amber', description: 'A tiny piece of amber containing a prehistoric micro-insect perfectly preserved. Scientists study it to understand micro-evolution and it holds trace amounts of ancient DNA.', rarity: 'rare', source: 'seedling_square', value: 135 },
  { id: 'starlight_crystal', name: 'Starlight Crystal', description: 'A crystal that absorbs starlight during the night and releases it slowly during the day. It is used to illuminate the deepest parts of the kingdom without fire.', rarity: 'rare', source: 'acorn_fortress', value: 110 },

  // Epic (6)
  { id: 'void_mote', name: 'Void Mote', description: 'A speck of pure void matter that fell through a crack in reality. It absorbs all light around it and can be used to create pockets of absolute darkness for stealth operations.', rarity: 'epic', source: 'throne_hill', value: 500 },
  { id: 'time_sand', name: 'Time Sand', description: 'Sand from an hourglass that flows backward. When scattered, it can briefly reverse small events within a centimeter radius, undoing minor damage or mistakes.', rarity: 'epic', source: 'shell_bay', value: 550 },
  { id: 'dragon_scale_flake', name: 'Dragon Scale Flake', description: 'A single scale flake from a dragon that flew overhead centuries ago. It is virtually indestructible and radiates heat, making it the ultimate material for armor plating.', rarity: 'epic', source: 'acorn_fortress', value: 600 },
  { id: 'echo_gem', name: 'Echo Gem', description: 'A gemstone that records and replays sound. Scientists use it to store vast amounts of information, and it serves as the kingdom\'s first audio recording and playback device.', rarity: 'epic', source: 'thread_alley', value: 520 },
  { id: 'living_iron', name: 'Living Iron', description: 'A metallic substance that can reshape itself according to the will of its wielder. It grows when fed iron filings and can repair any structure autonomously.', rarity: 'epic', source: 'pebble_quarter', value: 480 },
  { id: 'cosmic_thread', name: 'Cosmic Thread', description: 'A thread of pure cosmic energy visible only to micro eyes. It can bind anything together regardless of material, and a single strand is stronger than steel cable.', rarity: 'epic', source: 'throne_hill', value: 570 },

  // Legendary (6)
  { id: 'world_seed_heart', name: 'World Seed Heart', description: 'The heart of the legendary World Seed from which the Micro Kingdom was born. It pulses with life energy that sustains the entire kingdom and can germinate an entirely new civilization.', rarity: 'legendary', source: 'throne_hill', value: 5000 },
  { id: 'eternal_dewdrop', name: 'Eternal Dewdrop', description: 'A dewdrop that never evaporates and never freezes. It contains infinite pure water and radiates a healing aura that extends ten centimeters in every direction.', rarity: 'legendary', source: 'throne_hill', value: 6000 },
  { id: 'star_core_fragment', name: 'Star Core Fragment', description: 'A fragment of a dead star that fell to earth as a meteorite. It provides unlimited heat and light, and its energy output could theoretically power the kingdom forever.', rarity: 'legendary', source: 'throne_hill', value: 5500 },
  { id: 'infinity_silk', name: 'Infinity Silk', description: 'A thread that can be stretched infinitely without breaking and always returns to its original length. Woven into the royal banner, it has become the symbol of the kingdom\'s resilience.', rarity: 'legendary', source: 'throne_hill', value: 7000 },
  { id: 'creation_clay', name: 'Creation Clay', description: 'A lump of clay that can be shaped into any object, which then becomes real and permanent. The kingdom\'s founders used the last of it to create the Royal Throne.', rarity: 'legendary', source: 'throne_hill', value: 6500 },
  { id: 'giant_soul_crystal', name: 'Giant Soul Crystal', description: 'A crystal containing a fragment of a giant\'s soul. Through it, micro citizens can glimpse the thoughts and emotions of the giants who walk above them, fostering understanding between scales.', rarity: 'legendary', source: 'throne_hill', value: 8000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: MI_STRUCTURES — 25 Micro Buildings (upgradeable to level 10)
// ═══════════════════════════════════════════════════════════════════

export const MI_STRUCTURES: readonly MIStructureDef[] = [
  // Production (5)
  { id: 'crumb_silo', name: 'Crumb Silo', description: 'A cylindrical storage structure made from hollowed bread crumbs that preserves food indefinitely. Stores up to a month\'s worth of micro-rations for the entire district.', baseCost: 100, costMultiplier: 1.5 },
  { id: 'pebble_workshop', name: 'Pebble Workshop', description: 'A workshop built between two flat pebbles where builders craft tools and weapons from stone. Equipped with a tiny anvil made from a metal filing.', baseCost: 400, costMultiplier: 1.6 },
  { id: 'dewdrop_well', name: 'Dewdrop Well', description: 'A well that collects and stores morning dew for the community. Its capillary walls draw moisture from the air, ensuring a constant water supply even during droughts.', baseCost: 1200, costMultiplier: 1.7 },
  { id: 'seedling_greenhouse', name: 'Seedling Greenhouse', description: 'A transparent structure made from thin leaf membranes that creates a perfect growing environment for rare crops year-round regardless of external weather.', baseCost: 3000, costMultiplier: 1.8 },
  { id: 'invention_lab', name: 'Invention Lab', description: 'A sophisticated laboratory carved inside an acorn shell where scientists conduct experiments too dangerous for ordinary workshops. Houses the kingdom\'s finest equipment.', baseCost: 8000, costMultiplier: 2.0 },

  // Military (5)
  { id: 'acorn_barracks', name: 'Acorn Barracks', description: 'A military quarters carved into a row of aligned acorns. Houses up to fifty micro soldiers and includes an armory, training grounds, and a war room.', baseCost: 80, costMultiplier: 1.4 },
  { id: 'thorn_wall', name: 'Thorn Wall', description: 'A defensive wall constructed from sharpened rose thorns embedded in mud. The thorns are coated with natural irritants that deter even the most determined insect invaders.', baseCost: 300, costMultiplier: 1.5 },
  { id: 'pine_needle_spire', name: 'Pine Needle Spire', description: 'A watchtower made from bundled pine needles that stands three centimeters tall. From its peak, sentries can spot approaching threats from five centimeters away.', baseCost: 800, costMultiplier: 1.6 },
  { id: 'shell_armory', name: 'Shell Armory', description: 'An armory housed inside a snail shell where weapons and armor are forged and stored. Its curved walls provide excellent protection against siege weapons.', baseCost: 2000, costMultiplier: 1.7 },
  { id: 'fortress_gate', name: 'Fortress Gate', description: 'The ultimate defensive structure — a massive gate carved from a peach pit that can withstand any assault. It serves as the primary entrance to the inner kingdom.', baseCost: 5000, costMultiplier: 1.8 },

  // Civilian (5)
  { id: 'thread_cottage', name: 'Thread Cottage', description: 'A cozy dwelling woven from colorful threads with a leaf roof and petal floor. Houses a micro family of up to six with separate rooms for sleeping and storage.', baseCost: 120, costMultiplier: 1.4 },
  { id: 'moss_market', name: 'Moss Market', description: 'An open-air marketplace built on a bed of soft moss. Traders set up stalls made from twigs and leaves, selling goods from across all eight districts.', baseCost: 500, costMultiplier: 1.5 },
  { id: 'petal_theater', name: 'Petal Theater', description: 'A beautiful amphitheater with seats made from overlapping flower petals. Hosts performances, ceremonies, and the annual Micro Kingdom Festival of Tiny Arts.', baseCost: 1500, costMultiplier: 1.6 },
  { id: 'honey_tavern', name: 'Honey Tavern', description: 'A tavern where citizens gather to drink diluted honey mead, share stories, and rest after long days. The warm atmosphere boosts kingdom-wide morale.', baseCost: 700, costMultiplier: 1.5 },
  { id: 'royal_library', name: 'Royal Library', description: 'A grand library housing the kingdom\'s accumulated knowledge, written on thin sheets of bark with spider-ink quills. Scholars from all districts come here to study.', baseCost: 4000, costMultiplier: 1.8 },

  // Utility (5)
  { id: 'dewdrop_fountain', name: 'Dewdrop Fountain', description: 'A fountain powered by capillary action that provides fresh water to all nearby buildings. Its gentle sound is said to calm anxious micro citizens.', baseCost: 150, costMultiplier: 1.4 },
  { id: 'silk_bridge', name: 'Silk Bridge', description: 'A suspension bridge made from spider silk cables spanning gaps between pebbles and twigs. Essential infrastructure connecting distant parts of the kingdom.', baseCost: 250, costMultiplier: 1.5 },
  { id: 'firefly_lantern_post', name: 'Firefly Lantern Post', description: 'A series of lantern posts powered by captured firefly glow. Illuminates the kingdom\'s streets at night, reducing accidents and boosting nighttime productivity.', baseCost: 600, costMultiplier: 1.5 },
  { id: 'windmill_grist', name: 'Windmill Grist', description: 'A tiny windmill made from a feather and twig that grinds grain into flour. Takes advantage of even the gentlest breeze to produce flour for bread-making.', baseCost: 1000, costMultiplier: 1.6 },
  { id: 'signal_horn_hill', name: 'Signal Horn Hill', description: 'A signaling station built on a small mound with a horn made from a hollow grass blade. Used to broadcast warnings and announcements across the entire kingdom.', baseCost: 6000, costMultiplier: 2.0 },

  // Royal (5)
  { id: 'royal_garden', name: 'Royal Garden', description: 'A meticulously maintained garden of miniature flowers and bonsai trees. The garden is a symbol of royal prestige and generates rare petal pigments for the kingdom.', baseCost: 200, costMultiplier: 1.5 },
  { id: 'council_chamber', name: 'Council Chamber', description: 'A circular chamber made from interlocking twigs where the kingdom\'s council meets to make important decisions. Features acorn-wood seating for twelve.', baseCost: 800, costMultiplier: 1.6 },
  { id: 'treasure_vault', name: 'Treasure Vault', description: 'A heavily guarded underground vault where the kingdom\'s most valuable resources and inventions are stored. Protected by multiple locks and elite guards.', baseCost: 1500, costMultiplier: 1.7 },
  { id: 'royal_highway', name: 'Royal Highway', description: 'A paved road made from flattened pebbles connecting all eight districts. Merchants and messengers travel along it at unprecedented micro speeds.', baseCost: 3500, costMultiplier: 1.8 },
  { id: 'throne_hall', name: 'Throne Hall', description: 'The seat of power in the Micro Kingdom — a magnificent hall built inside a dandelion seed head. The Royal Throne sits at its center, overlooking the entire kingdom from on high.', baseCost: 9000, costMultiplier: 2.0 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: MI_ABILITIES — 22 Tiny Abilities
// ═══════════════════════════════════════════════════════════════════

export const MI_ABILITIES: readonly MIAbilityDef[] = [
  // Builder (4)
  { id: 'micro_construct', name: 'Micro Construct', description: 'Rapidly assemble a miniature structure from available materials in seconds, creating temporary shelters or fortifications where none existed before.', cooldown: 5, power: 30, role: 'Builder' },
  { id: 'crumb_reinforce', name: 'Crumb Reinforce', description: 'Coat existing structures with a layer of hardened crumb-cement, doubling their durability against physical impacts and environmental damage.', cooldown: 12, power: 45, role: 'Builder' },
  { id: 'pebble_fortification', name: 'Pebble Fortification', description: 'Erect a circular wall of tightly packed pebbles around a target area, creating a defensive perimeter that can withstand insect-scale attacks.', cooldown: 20, power: 80, role: 'Builder' },
  { id: 'grand_design', name: 'Grand Design', description: 'Unveil a blueprint so perfect that construction speed is tripled across the entire district for a limited time as all builders work in perfect harmony.', cooldown: 30, power: 120, role: 'Builder' },

  // Farmer (3)
  { id: 'green_thumb', name: 'Green Thumb', description: 'Accelerate the growth of nearby plants by touch, causing seeds to sprout and crops to mature in a fraction of their normal growing time.', cooldown: 8, power: 35, role: 'Farmer' },
  { id: 'harvest_boon', name: 'Harvest Boon', description: 'Channel the power of the earth to double the yield of all crops within a small radius. Overflowing baskets feed the district for weeks.', cooldown: 18, power: 65, role: 'Farmer' },
  { id: 'living_wall', name: 'Living Wall', description: 'Cause thick vines and roots to erupt from the ground, forming a living barrier that regenerates when damaged and produces edible fruit.', cooldown: 25, power: 90, role: 'Farmer' },

  // Scientist (3)
  { id: 'microscope_vision', name: 'Microscope Vision', description: 'Enhance vision to perceive details invisible to normal micro eyes, revealing hidden resources, structural weaknesses, and approaching threats.', cooldown: 6, power: 25, role: 'Scientist' },
  { id: 'static_shock', name: 'Static Shock', description: 'Discharge accumulated static electricity in a powerful burst that stuns enemies and powers down micro-electronic devices in the area.', cooldown: 15, power: 55, role: 'Scientist' },
  { id: 'gravity_pulse', name: 'Gravity Pulse', description: 'Generate a localized gravity anomaly that pins enemies to the ground or launches allies to safety. Effects last for several seconds.', cooldown: 35, power: 100, role: 'Scientist' },

  // Artist (3)
  { id: 'illusion_canvas', name: 'Illusion Canvas', description: 'Paint a convincing illusion that confuses enemies and mesmerizes allies. The painted scene is indistinguishable from reality to micro-scale perception.', cooldown: 10, power: 40, role: 'Artist' },
  { id: 'color_bomb', name: 'Color Bomb', description: 'Detonate a burst of blinding color that disorients all who see it. The kaleidoscopic explosion causes confusion, nausea, and temporary blindness.', cooldown: 22, power: 75, role: 'Artist' },
  { id: 'inspiration_aurora', name: 'Inspiration Aurora', description: 'Radiate an aura of creative energy that boosts the productivity and morale of all nearby citizens, granting temporary bonuses to all activities.', cooldown: 40, power: 110, role: 'Artist' },

  // Soldier (5)
  { id: 'needle_strike', name: 'Needle Strike', description: 'Launch a pine needle like a javelin with deadly accuracy, piercing through exoskeletons and armor plating with its razor-sharp tip.', cooldown: 4, power: 28, role: 'Soldier' },
  { id: 'thorn_barrage', name: 'Thorn Barrage', description: 'Throw a handful of sharpened thorns in a wide arc, creating a curtain of pain that forces enemies to retreat or suffer multiple puncture wounds.', cooldown: 10, power: 50, role: 'Soldier' },
  { id: 'shell_charge', name: 'Shell Charge', description: 'Lower the snail-shell shield and charge forward with unstoppable momentum, bowling over enemies and crashing through fragile barriers.', cooldown: 16, power: 70, role: 'Soldier' },
  { id: 'war_drum', name: 'War Drum', description: 'Beat a tiny drum made from a stretched leaf membrane, producing a battle rhythm that emboldens allies and fills enemies with primal dread.', cooldown: 28, power: 95, role: 'Soldier' },
  { id: 'last_stand', name: 'Last Stand', description: 'Enter a state of absolute determination that triples all combat stats but leaves the soldier exhausted afterward. Used only in the direst circumstances.', cooldown: 55, power: 180, role: 'Soldier' },

  // Trader (2)
  { id: 'quick_bargain', name: 'Quick Bargain', description: 'Close a deal so rapidly that the other party has no time to reconsider. Effective for acquiring resources at below-market prices during emergencies.', cooldown: 7, power: 20, role: 'Trader' },
  { id: 'golden_offer', name: 'Golden Offer', description: 'Present an offer so enticing that even hostile parties pause to consider it. Can temporarily pacify enemies or win over neutral factions.', cooldown: 20, power: 60, role: 'Trader' },

  // Healer (2)
  { id: 'dewdrop_soothe', name: 'Dewdrop Soothe', description: 'Apply a carefully prepared dewdrop tincture to wounds, accelerating natural healing and relieving pain. The most commonly used healing ability.', cooldown: 5, power: 22, role: 'Healer' },
  { id: 'moss_poultice', name: 'Moss Poultice', description: 'Apply a living moss compress that continues to heal the patient over time. The moss bonds with the wound, providing sustained regeneration for hours.', cooldown: 15, power: 55, role: 'Healer' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: MI_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const MI_ACHIEVEMENTS: readonly MIAchievementDef[] = [
  { id: 'ach_first_recruit', name: 'First Settler', description: 'Recruit your very first micro citizen to the Crumb Meadows.', condition: 'Recruit 1 citizen', reward: '+50 micro energy' },
  { id: 'ach_recruit_10', name: 'Growing Community', description: 'Recruit a total of 10 micro citizens across all districts.', condition: 'Recruit 10 citizens', reward: '+200 gold, rare resource cache' },
  { id: 'ach_recruit_35', name: 'Kingdom of Miniatures', description: 'Recruit all 35 unique micro citizens.', condition: 'Recruit 35 unique citizens', reward: '+5000 gold, legendary invention fragment' },
  { id: 'ach_rare_recruit', name: 'Rare Discovery', description: 'Successfully recruit a rare-tier micro citizen.', condition: 'Own rare citizen', reward: '+300 micro energy' },
  { id: 'ach_epic_recruit', name: 'Epic Arrival', description: 'Successfully recruit an epic-tier micro citizen.', condition: 'Own epic citizen', reward: '+800 micro energy, rare invention' },
  { id: 'ach_legendary_recruit', name: 'Legend Among Miniatures', description: 'Recruit a legendary micro citizen — a being of mythic stature.', condition: 'Own legendary citizen', reward: '+3000 gold, epic invention' },
  { id: 'ach_first_district', name: 'District Pioneer', description: 'Settle your first miniature district beyond the starting meadows.', condition: 'Settle 1 district', reward: '+100 micro energy' },
  { id: 'ach_all_districts', name: 'Eightfold Kingdom', description: 'Settle and develop all 8 miniature districts.', condition: 'Settle 8 districts', reward: '+5000 gold, Sovereign of Districts title' },
  { id: 'ach_resource_100', name: 'Resourceful Micro', description: 'Accumulate 100 total micro resources.', condition: 'Collect 100 resources', reward: '+150 gold' },
  { id: 'ach_resource_500', name: 'Crumbs Hoarder', description: 'Accumulate 500 total micro resources.', condition: 'Collect 500 resources', reward: '+800 gold' },
  { id: 'ach_structure_5', name: 'Tiny Builder', description: 'Build 5 different micro structures.', condition: 'Build 5 structures', reward: '+200 micro energy' },
  { id: 'ach_structure_15', name: 'Micro Architect', description: 'Build 15 different micro structures.', condition: 'Build 15 structures', reward: '+1500 gold, Architect title' },
  { id: 'ach_structure_25', name: 'Kingdom Metropolis', description: 'Build all 25 micro structures.', condition: 'Build 25 structures', reward: '+5000 gold, rare invention' },
  { id: 'ach_first_promotion', name: 'First Promotion', description: 'Promote your first micro citizen to a higher rank.', condition: 'Promote 1 citizen', reward: '+500 micro energy' },
  { id: 'ach_five_promotions', name: 'Promotion Master', description: 'Promote 5 citizens total across all roles.', condition: 'Promote 5 citizens', reward: '+2000 gold' },
  { id: 'ach_first_invention', name: 'Tinkerer\'s Spark', description: 'Invent your very first micro gadget in the Invention Lab.', condition: 'Invent 1 gadget', reward: '+1000 micro energy' },
  { id: 'ach_ten_inventions', name: 'Master Inventor', description: 'Invent 10 gadgets total.', condition: 'Invent 10 gadgets', reward: '+3000 gold, epic resource cache' },
  { id: 'ach_max_level', name: 'Micro Sovereign', description: 'Reach the maximum kingdom level of 50.', condition: 'Reach level 50', reward: '+10000 gold, legendary resource set' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: MI_TITLES — 8 Kingdom Titles
// ═══════════════════════════════════════════════════════════════════

export const MI_TITLES: readonly MITitleDef[] = [
  { id: 'title_tiny_settler', name: 'Tiny Settler', description: 'One who has taken the first brave step into the micro world, feeling the ground shake beneath their feet as giants pass overhead.', requiredLevel: 1, requiredDistricts: 1 },
  { id: 'title_crumb_collector', name: 'Crumb Collector', description: 'A resourceful micro citizen who has learned to gather and preserve the tiny treasures that giants discard without a second thought.', requiredLevel: 5, requiredDistricts: 2 },
  { id: 'title_pebble_pioneer', name: 'Pebble Pioneer', description: 'An adventurous soul who ventured beyond the meadows to build new settlements among the stones, expanding the kingdom\'s borders.', requiredLevel: 12, requiredDistricts: 3 },
  { id: 'title_dewdrop_ranger', name: 'Dewdrop Ranger', description: 'A skilled explorer who navigates the kingdom\'s waterways and knows every hidden spring and secret dewdrop cache in all eight districts.', requiredLevel: 18, requiredDistricts: 4 },
  { id: 'title_acorn_commander', name: 'Acorn Commander', description: 'A respected military leader who commands the fortress garrison and has led successful defenses against insect incursions.', requiredLevel: 25, requiredDistricts: 5 },
  { id: 'title_silk_chancellor', name: 'Silk Chancellor', description: 'A wise administrator who weaves together the threads of governance, ensuring all districts work in harmony toward common prosperity.', requiredLevel: 33, requiredDistricts: 6 },
  { id: 'title_shell_regent', name: 'Shell Regent', description: 'A regent who rules with strength and compassion from the Shell Bay, commanding the kingdom\'s trade networks and diplomatic relations.', requiredLevel: 42, requiredDistricts: 7 },
  { id: 'title_micro_sovereign', name: 'Micro Sovereign', description: 'The supreme ruler of the Micro Kingdom who sits upon the Dandelion Throne, commanding all eight districts and the loyalty of every micro citizen.', requiredLevel: 50, requiredDistricts: 8 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: MI_INVENTIONS — 15 Micro Inventions
// ═══════════════════════════════════════════════════════════════════

export const MI_INVENTIONS: readonly MIInventionDef[] = [
  { id: 'inv_toothpick_crane', name: 'Toothpick Crane', description: 'A simple but revolutionary crane made from a broken toothpick and silk thread. Can lift objects up to ten times the weight of a micro citizen.', rarity: 'common', powerBonus: 5, specialAbility: 'Heavy lifting' },
  { id: 'inv_dewdrop_lens', name: 'Dewdrop Lens', description: 'A magnifying lens crafted from a perfectly spherical dewdrop held in a twig frame. Reveals details invisible to the naked micro eye.', rarity: 'common', powerBonus: 6, specialAbility: 'Enhanced vision' },
  { id: 'inv_crumb_compass', name: 'Crumb Compass', description: 'A navigation device using a magnetized iron filing suspended in a crumb-shell of water. Always points toward the nearest food source.', rarity: 'common', powerBonus: 7, specialAbility: 'Food detection' },
  { id: 'inv_silk_grappling_hook', name: 'Silk Grappling Hook', description: 'A grappling hook made from a bent thorn and spider silk rope. Allows citizens to scale vertical surfaces and reach elevated districts.', rarity: 'uncommon', powerBonus: 12, specialAbility: 'Vertical traversal' },
  { id: 'inv_thorn_catapult', name: 'Thorn Catapult', description: 'A miniature siege weapon that launches sharpened thorns at high velocity. Provides the kingdom\'s first ranged defensive capability.', rarity: 'uncommon', powerBonus: 14, specialAbility: 'Ranged attack' },
  { id: 'inv_petalmorph_suit', name: 'Petalmorph Suit', description: 'Camouflage armor made from layered flower petals that changes color to match surroundings. Wearer becomes nearly invisible.', rarity: 'uncommon', powerBonus: 15, specialAbility: 'Active camouflage' },
  { id: 'inv_firefly_lantern', name: 'Firefly Lantern', description: 'A lantern powered by a domesticated firefly that provides steady illumination. The firefly is treated well and fed premium nectar.', rarity: 'uncommon', powerBonus: 13, specialAbility: 'Portable light source' },
  { id: 'inv_windmill_generator', name: 'Windmill Generator', description: 'A feather-and-twirligig generator that converts wind energy into static electricity. Powers basic micro-electronic devices.', rarity: 'rare', powerBonus: 25, specialAbility: 'Electricity generation' },
  { id: 'inv_acorn_submarine', name: 'Acorn Submarine', description: 'A watertight vessel carved from an acorn that allows safe underwater exploration of puddles and streams. Crew of four.', rarity: 'rare', powerBonus: 28, specialAbility: 'Underwater travel' },
  { id: 'inv_honeycomb_battery', name: 'Honeycomb Battery', description: 'A battery that stores energy in crystallized honeycomb cells. Provides sustained power output for extended periods without recharging.', rarity: 'rare', powerBonus: 30, specialAbility: 'Energy storage' },
  { id: 'inv_crystal_radio', name: 'Crystal Radio', description: 'A communication device made from a quartz crystal and copper wire. Can transmit and receive messages across the entire kingdom.', rarity: 'rare', powerBonus: 27, specialAbility: 'Long-range communication' },
  { id: 'inv_aether_glider', name: 'Aether Glider', description: 'A glider made from a dandelion seed and silk threads that can ride air currents for kilometers. Opens aerial trade routes.', rarity: 'epic', powerBonus: 50, specialAbility: 'Powered flight' },
  { id: 'inv_time_hourglass', name: 'Time Hourglass', description: 'An hourglass filled with enchanted sand that can briefly slow time in a small area. Effects last only seconds but change everything.', rarity: 'epic', powerBonus: 55, specialAbility: 'Time dilation' },
  { id: 'inv_void_shield', name: 'Void Shield', description: 'A shield projector that creates a barrier of void matter, absorbing all physical and energy attacks. The ultimate defensive invention.', rarity: 'epic', powerBonus: 60, specialAbility: 'Absolute defense' },
  { id: 'inv_worldseed_engine', name: 'Worldseed Engine', description: 'The pinnacle of micro engineering — a device that can generate matter from pure energy. It can create any resource the kingdom needs.', rarity: 'legendary', powerBonus: 100, specialAbility: 'Matter creation' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: MI_EVENTS — 12 Giant Events
// ═══════════════════════════════════════════════════════════════════

export const MI_EVENTS: readonly MIGiantEventDef[] = [
  {
    id: 'event_footstep_quake',
    name: 'Giant Footstep Quake',
    description: 'A giant\'s footstep sends tremors through the ground, toppling micro structures and scattering citizens in panic. Buildings near the impact zone suffer the worst damage.',
    severity: 4,
    duration: 30,
    effects: ['Structures near impact take damage', 'Citizens panicked for 30 seconds', 'Resource storage disrupted'],
  },
  {
    id: 'event_rainstorm_deluge',
    name: 'Rainstorm Deluge',
    description: 'From the micro perspective, a light rain is a catastrophic flood. Enormous water drops the size of boulders crash down, flooding districts and sweeping away unsecured resources.',
    severity: 5,
    duration: 60,
    effects: ['Low-lying districts flooded', 'Resources swept away', 'Travel between districts impossible'],
  },
  {
    id: 'event_sunny_bounty',
    name: 'Sunny Bounty',
    description: 'The warmth of the sun creates perfect growing conditions. Crops grow rapidly, morning dew is abundant, and the entire kingdom enters a period of exceptional prosperity.',
    severity: 1,
    duration: 90,
    effects: ['Crop growth speed +100%', 'Dewdrop collection doubled', 'Citizen morale boosted'],
  },
  {
    id: 'event_ant_colony_march',
    name: 'Ant Colony March',
    description: 'A massive ant column marches directly through the kingdom. While not intentionally hostile, their enormous size and numbers cause collateral damage to everything in their path.',
    severity: 3,
    duration: 45,
    effects: ['Structures trampled by ant column', 'Some resources stolen by foragers', 'Soldiers mobilized'],
  },
  {
    id: 'event_spider_web_trapping',
    name: 'Spider Web Trapping',
    description: 'A spider spins an enormous web across the kingdom overnight. Citizens who wander into it become trapped in the sticky silk, and freeing them requires significant effort.',
    severity: 3,
    duration: 50,
    effects: ['Citizens trapped in web', 'Silk resource collection increased', 'Movement speed reduced'],
  },
  {
    id: 'event_butterfly_migration',
    name: 'Butterfly Migration',
    description: 'Thousands of butterflies pass through the garden, their wingbeats creating beneficial wind currents that power windmills and spread flower pollen across the kingdom.',
    severity: 1,
    duration: 80,
    effects: ['Windmill power output +200%', 'Pollen gold collection tripled', 'Beautiful display boosts morale'],
  },
  {
    id: 'event_breadcrumb_windfall',
    name: 'Breadcrumb Windfall',
    description: 'A giant accidentally drops a large piece of bread, scattering crumbs across the garden. For the micro kingdom, this is equivalent to discovering a gold mine.',
    severity: 1,
    duration: 100,
    effects: ['Bread crumb resources +500%', 'Construction materials unlimited temporarily', 'Feast celebrated'],
  },
  {
    id: 'event_be_invasion',
    name: 'Bee Territorial Invasion',
    description: 'A bee claims the garden as its foraging territory, aggressively investigating every flower. Its enormous size and buzzing wings create terror across all districts.',
    severity: 4,
    duration: 40,
    effects: ['Bee patrols all districts', 'Citizens must hide or flee', 'Honey resources at risk'],
  },
  {
    id: 'event_leaf_fall_season',
    name: 'Great Leaf Fall',
    description: 'Autumn arrives and millions of leaves fall from the trees. From the micro perspective, this is a bombardment of enormous flat structures that bury entire districts.',
    severity: 3,
    duration: 70,
    effects: ['Districts buried under leaves', 'New building materials available', 'Thermal insulation improved'],
  },
  {
    id: 'event_giant_child_play',
    name: 'Giant Child Playtime',
    description: 'A giant child plays in the garden, completely unaware of the micro civilization. Every movement is catastrophic — digging holes, moving rocks, and scattering everything.',
    severity: 5,
    duration: 35,
    effects: ['Terrain reshaped randomly', 'Multiple structures destroyed', 'Emergency evacuation required'],
  },
  {
    id: 'event_ladybug_blessing',
    name: 'Ladybug Blessing',
    description: 'A gentle ladybug lands in the kingdom and rests peacefully. Its presence emits a calming pheromone that cures ailments and drives away predatory insects.',
    severity: 1,
    duration: 120,
    effects: ['All citizens healed', 'Predatory insects repelled', 'Morale maximum boost'],
  },
  {
    id: 'event_garden_sprinkler_flood',
    name: 'Garden Sprinkler Flood',
    description: 'The giant\'s automated sprinkler system activates, unleashing jets of water that from the micro perspective are like waterfalls and geysers of biblical proportions.',
    severity: 4,
    duration: 25,
    effects: ['Massive flooding in all districts', 'Water resources overflow', 'Emergency shelters activated'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: ROLE INTERACTIONS & PROMOTION DATA
// ═══════════════════════════════════════════════════════════════════

interface MIRoleInteraction {
  actor: MIRole
  target: MIRole
  multiplier: number
  description: string
}

const MI_ROLE_INTERACTIONS: MIRoleInteraction[] = [
  { actor: 'Builder', target: 'Farmer', multiplier: 1.5, description: 'Builders construct better farms for Farmers, increasing food output.' },
  { actor: 'Builder', target: 'Soldier', multiplier: 1.4, description: 'Builders reinforce Soldier fortifications, improving defensive capabilities.' },
  { actor: 'Farmer', target: 'Trader', multiplier: 1.3, description: 'Farmers produce surplus food that Traders can sell for premium prices.' },
  { actor: 'Farmer', target: 'Healer', multiplier: 1.6, description: 'Farmers grow medicinal herbs that Healers transform into potent remedies.' },
  { actor: 'Scientist', target: 'Builder', multiplier: 1.5, description: 'Scientists develop better construction techniques that Builders implement.' },
  { actor: 'Scientist', target: 'Soldier', multiplier: 1.3, description: 'Scientists provide Soldiers with advanced weapon technology.' },
  { actor: 'Artist', target: 'Healer', multiplier: 1.2, description: 'Artists create calming environments that boost Healer treatment effectiveness.' },
  { actor: 'Artist', target: 'Trader', multiplier: 1.4, description: 'Artists produce valuable crafts that Traders export for high profits.' },
  { actor: 'Soldier', target: 'Builder', multiplier: 1.1, description: 'Soldiers protect Builders from threats during hazardous construction projects.' },
  { actor: 'Soldier', target: 'Trader', multiplier: 1.2, description: 'Soldiers escort Trader caravans through dangerous territories safely.' },
  { actor: 'Trader', target: 'Scientist', multiplier: 1.4, description: 'Traders acquire exotic materials that Scientists need for advanced research.' },
  { actor: 'Trader', target: 'Builder', multiplier: 1.3, description: 'Traders supply rare building materials that enable grander construction projects.' },
  { actor: 'Healer', target: 'Soldier', multiplier: 1.6, description: 'Healers keep Soldiers in peak condition, extending their combat effectiveness.' },
  { actor: 'Healer', target: 'Farmer', multiplier: 1.2, description: 'Healers treat farm animals and plants, increasing overall agricultural health.' },
]

interface MIPromotionTier {
  tier: number
  name: string
  requiredPromotions: number
  powerMultiplier: number
  hpMultiplier: number
  visualEffect: string
}

const MI_PROMOTION_TIERS: MIPromotionTier[] = [
  { tier: 0, name: 'Apprentice', requiredPromotions: 0, powerMultiplier: 1.0, hpMultiplier: 1.0, visualEffect: 'Ordinary micro citizen appearance with basic clothing.' },
  { tier: 1, name: 'Journeyman', requiredPromotions: 1, powerMultiplier: 1.3, hpMultiplier: 1.2, visualEffect: 'Gains a colored sash indicating their role specialty. Slightly taller posture.' },
  { tier: 2, name: 'Expert', requiredPromotions: 2, powerMultiplier: 1.7, hpMultiplier: 1.5, visualEffect: 'Wears a tiny badge of office and carries specialized equipment for their role.' },
  { tier: 3, name: 'Master', requiredPromotions: 3, powerMultiplier: 2.2, hpMultiplier: 1.8, visualEffect: 'Glowing aura matching their role color. Commands respect from all lower-tier citizens.' },
  { tier: 4, name: 'Grandmaster', requiredPromotions: 4, powerMultiplier: 2.8, hpMultiplier: 2.2, visualEffect: 'Two glowing symbols orbit their body. Their mere presence boosts all nearby allies.' },
  { tier: 5, name: 'Legendary', requiredPromotions: 5, powerMultiplier: 3.5, hpMultiplier: 3.0, visualEffect: 'Transcendent form radiating pure role energy. Appearance changes based on their discipline.' },
]

interface MIDistrictResourceMap {
  districtId: string
  resourceIds: string[]
  bonusResourceIds: string[]
}

const MI_DISTRICT_RESOURCE_MAP: MIDistrictResourceMap[] = [
  { districtId: 'crumb_meadows', resourceIds: ['bread_crumbs', 'grass_blades', 'seed_flakes', 'ant_dust', 'morning_dew'], bonusResourceIds: ['tiny_pebbles'] },
  { districtId: 'pebble_quarter', resourceIds: ['tiny_pebbles', 'iron_filing', 'crystal_grains', 'ant_dust'], bonusResourceIds: ['silk_threads'] },
  { districtId: 'dewdrop_basin', resourceIds: ['morning_dew', 'petal_pigment', 'honey_drop', 'moonlight_silver'], bonusResourceIds: ['crystal_grains'] },
  { districtId: 'seedling_square', resourceIds: ['seed_flakes', 'pollen_gold', 'ancient_amber', 'grass_blades'], bonusResourceIds: ['petal_pigment'] },
  { districtId: 'acorn_fortress', resourceIds: ['iron_filing', 'thunderstone_shard', 'starlight_crystal', 'living_iron'], bonusResourceIds: ['honey_drop'] },
  { districtId: 'thread_alley', resourceIds: ['silk_threads', 'petal_pigment', 'phoenix_feather_fiber', 'echo_gem', 'cosmic_thread'], bonusResourceIds: ['pollen_gold'] },
  { districtId: 'shell_bay', resourceIds: ['honey_drop', 'diamond_dust', 'time_sand', 'dragon_scale_flake'], bonusResourceIds: ['ancient_amber'] },
  { districtId: 'throne_hill', resourceIds: ['world_seed_heart', 'eternal_dewdrop', 'star_core_fragment', 'infinity_silk', 'creation_clay', 'giant_soul_crystal', 'void_mote'], bonusResourceIds: [] },
]

function miGetRoleInteraction(actor: MIRole, target: MIRole): MIRoleInteraction | null {
  return MI_ROLE_INTERACTIONS.find(
    (i) => i.actor === actor && i.target === target
  ) ?? null
}

function miGetPromotionTier(promotionCount: number): MIPromotionTier {
  for (let i = MI_PROMOTION_TIERS.length - 1; i >= 0; i--) {
    if (promotionCount >= MI_PROMOTION_TIERS[i].requiredPromotions) {
      return MI_PROMOTION_TIERS[i]
    }
  }
  return MI_PROMOTION_TIERS[0]
}

function miFindDistrictResourceMap(districtId: string): MIDistrictResourceMap | null {
  return MI_DISTRICT_RESOURCE_MAP.find((m) => m.districtId === districtId) ?? null
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

const useMIStore = create<MIFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      recruitedCitizens: [] as MIRecruitedCitizen[],
      collectedResources: {} as Record<string, number>,
      structures: [] as MIOwnedStructure[],
      achievements: [] as string[],
      currentTitle: 'title_tiny_settler',
      inventedGadgets: [] as string[],
      settledDistricts: ['crumb_meadows'] as string[],
      kingdomLevel: 1,
      kingdomExp: 0,
      gold: MI_INITIAL_GOLD,
      microEnergy: MI_INITIAL_ENERGY,
      totalRecruited: 0,
      totalHarvested: 0,
      totalUpgraded: 0,
      totalPromoted: 0,
      totalInvented: 0,
      activeEventId: null as string | null,
      eventTimer: 0,
      kingdom: {
        prosperity: 100,
        maxProsperity: 100,
        morale: 100,
        lastRepairedAt: null,
      } as MIKingdomState,
      activeDistrictId: 'crumb_meadows' as string | null,

      // ── miRecruitCitizen ───────────────────────────────────────
      miRecruitCitizen: (citizenId: string): boolean => {
        const state = get()
        const citizenDef = MI_CITIZENS.find((c) => c.id === citizenId)
        if (!citizenDef) return false
        if (state.kingdomLevel < (MI_DISTRICTS.find((d) => d.id === state.activeDistrictId)?.minLevel ?? 1)) return false

        const recruitCost = Math.floor(10 * miRarityMultiplier(citizenDef.rarity))
        if (state.microEnergy < recruitCost) return false
        if (state.recruitedCitizens.some((c) => c.citizenDefId === citizenId)) return false

        const newXp = state.kingdomExp + citizenDef.basePower
        const newLevel = miLevelFromXp(newXp)

        set((prev) => ({
          recruitedCitizens: [
            ...prev.recruitedCitizens,
            {
              id: miGenerateId(),
              citizenDefId: citizenId,
              name: citizenDef.name,
              level: 1,
              currentHP: citizenDef.basePower * 10,
              maxHP: citizenDef.basePower * 10,
              power: citizenDef.basePower,
              promoted: false,
              promotionCount: 0,
              acquiredAt: Date.now(),
            },
          ],
          microEnergy: Math.max(0, prev.microEnergy - recruitCost),
          kingdomExp: newXp,
          kingdomLevel: newLevel,
          gold: prev.gold + Math.floor(citizenDef.basePower * 0.5),
          totalRecruited: prev.totalRecruited + 1,
        }))
        return true
      },

      // ── miHarvestResource ──────────────────────────────────────
      miHarvestResource: (resourceId: string): number => {
        const state = get()
        const res = MI_RESOURCES.find((r) => r.id === resourceId)
        if (!res) return 0
        if (state.microEnergy < 3) return 0

        const quantity = res.rarity === 'common' ? 3 : res.rarity === 'uncommon' ? 2 : 1
        set((prev) => ({
          collectedResources: {
            ...prev.collectedResources,
            [resourceId]: (prev.collectedResources[resourceId] || 0) + quantity,
          },
          microEnergy: Math.max(0, prev.microEnergy - 3),
          totalHarvested: prev.totalHarvested + quantity,
          gold: prev.gold + res.value * quantity,
        }))
        return quantity
      },

      // ── miBuildStructure ───────────────────────────────────────
      miBuildStructure: (structureId: string): boolean => {
        const state = get()
        const structDef = MI_STRUCTURES.find((s) => s.id === structureId)
        if (!structDef) return false

        const owned = state.structures.find((s) => s.structureDefId === structureId)
        if (!owned) {
          if (state.gold < structDef.baseCost) return false
          const newXp = state.kingdomExp + 20
          const newLevel = miLevelFromXp(newXp)
          set((prev) => ({
            structures: [
              ...prev.structures,
              {
                id: miGenerateId(),
                structureDefId: structureId,
                level: 1,
                built: true,
              },
            ],
            gold: prev.gold - structDef.baseCost,
            kingdomExp: newXp,
            kingdomLevel: newLevel,
            totalUpgraded: prev.totalUpgraded + 1,
          }))
          return true
        }

        if (owned.level >= 10) return false
        const upgradeCost = Math.floor(structDef.baseCost * Math.pow(structDef.costMultiplier, owned.level))
        if (state.gold < upgradeCost) return false

        const newXp = state.kingdomExp + 25
        const newLevel = miLevelFromXp(newXp)
        set((prev) => ({
          structures: prev.structures.map((s) =>
            s.id === owned.id ? { ...s, level: s.level + 1 } : s
          ),
          gold: prev.gold - upgradeCost,
          kingdomExp: newXp,
          kingdomLevel: newLevel,
          totalUpgraded: prev.totalUpgraded + 1,
        }))
        return true
      },

      // ── miUseAbility ───────────────────────────────────────────
      miUseAbility: (abilityId: string): boolean => {
        const state = get()
        const ability = MI_ABILITIES.find((a) => a.id === abilityId)
        if (!ability) return false
        if (state.microEnergy < ability.cooldown) return false

        set((prev) => ({
          microEnergy: Math.max(0, prev.microEnergy - ability.cooldown),
        }))
        return true
      },

      // ── miHandleGiantEvent ─────────────────────────────────────
      miHandleGiantEvent: (eventId: string): boolean => {
        const state = get()
        const event = MI_EVENTS.find((e) => e.id === eventId)
        if (!event) return false
        if (state.activeEventId !== null) return false

        set((prev) => ({
          activeEventId: eventId,
          eventTimer: event.duration,
          kingdom: {
            ...prev.kingdom,
            prosperity: event.severity >= 4
              ? Math.max(0, prev.kingdom.prosperity - event.severity * 5)
              : prev.kingdom.prosperity,
            morale: event.severity >= 3
              ? Math.max(0, prev.kingdom.morale - event.severity * 8)
              : event.severity <= 1
                ? Math.min(100, prev.kingdom.morale + 15)
                : prev.kingdom.morale,
          },
        }))
        return true
      },

      // ── miInventGadget ────────────────────────────────────────
      miInventGadget: (gadgetId: string): boolean => {
        const state = get()
        const gadget = MI_INVENTIONS.find((g) => g.id === gadgetId)
        if (!gadget) return false
        if (state.inventedGadgets.includes(gadgetId)) return false

        const gadgetCost = Math.floor(20 * miRarityMultiplier(gadget.rarity))
        if (state.gold < gadgetCost) return false
        if (state.microEnergy < 15) return false

        const newXp = state.kingdomExp + gadget.powerBonus
        const newLevel = miLevelFromXp(newXp)
        set((prev) => ({
          inventedGadgets: [...prev.inventedGadgets, gadgetId],
          gold: prev.gold - gadgetCost,
          microEnergy: Math.max(0, prev.microEnergy - 15),
          kingdomExp: newXp,
          kingdomLevel: newLevel,
          totalInvented: prev.totalInvented + 1,
        }))
        return true
      },

      // ── miResearchTech ─────────────────────────────────────────
      miResearchTech: (citizenInstanceId: string): boolean => {
        const state = get()
        const citizen = state.recruitedCitizens.find((c) => c.id === citizenInstanceId)
        if (!citizen) return false
        const def = MI_CITIZENS.find((d) => d.id === citizen.citizenDefId)
        if (!def || def.role !== 'Scientist') return false
        if (state.microEnergy < 20) return false

        const newXp = state.kingdomExp + 40
        const newLevel = miLevelFromXp(newXp)
        set((prev) => ({
          recruitedCitizens: prev.recruitedCitizens.map((c) =>
            c.id === citizenInstanceId
              ? {
                  ...c,
                  power: Math.floor(c.power * 1.2),
                  level: c.level + 1,
                }
              : c
          ),
          microEnergy: Math.max(0, prev.microEnergy - 20),
          kingdomExp: newXp,
          kingdomLevel: newLevel,
        }))
        return true
      },

      // ── miHarvestCrop ──────────────────────────────────────────
      miHarvestCrop: (cropId: string): number => {
        const state = get()
        const res = MI_RESOURCES.find((r) => r.id === cropId)
        if (!res) return 0
        if (state.microEnergy < 5) return 0

        const baseQuantity = res.rarity === 'common' ? 5 : res.rarity === 'uncommon' ? 3 : 2
        const farmerBonus = state.recruitedCitizens.filter((c) => {
          const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
          return def && def.role === 'Farmer'
        }).length
        const quantity = baseQuantity + Math.floor(farmerBonus * 0.5)

        set((prev) => ({
          collectedResources: {
            ...prev.collectedResources,
            [cropId]: (prev.collectedResources[cropId] || 0) + quantity,
          },
          microEnergy: Math.max(0, prev.microEnergy - 5),
          totalHarvested: prev.totalHarvested + quantity,
          gold: prev.gold + res.value * quantity,
        }))
        return quantity
      },

      // ── miTrainSoldier ─────────────────────────────────────────
      miTrainSoldier: (soldierInstanceId: string): boolean => {
        const state = get()
        const citizen = state.recruitedCitizens.find((c) => c.id === soldierInstanceId)
        if (!citizen) return false
        const def = MI_CITIZENS.find((d) => d.id === citizen.citizenDefId)
        if (!def || def.role !== 'Soldier') return false
        if (state.microEnergy < 15) return false
        if (state.gold < 30) return false

        const newXp = state.kingdomExp + 35
        const newLevel = miLevelFromXp(newXp)
        set((prev) => ({
          recruitedCitizens: prev.recruitedCitizens.map((c) =>
            c.id === soldierInstanceId
              ? {
                  ...c,
                  power: Math.floor(c.power * 1.25),
                  maxHP: Math.floor(c.maxHP * 1.15),
                  currentHP: Math.floor(c.maxHP * 1.15),
                  level: c.level + 1,
                }
              : c
          ),
          microEnergy: Math.max(0, prev.microEnergy - 15),
          gold: prev.gold - 30,
          kingdomExp: newXp,
          kingdomLevel: newLevel,
        }))
        return true
      },

      // ── miSettleDistrict ───────────────────────────────────────
      miSettleDistrict: (districtId: string): boolean => {
        const state = get()
        const district = MI_DISTRICTS.find((d) => d.id === districtId)
        if (!district) return false
        if (state.settledDistricts.includes(districtId)) return false
        if (state.kingdomLevel < district.minLevel) return false
        if (state.gold < district.settleCost) return false

        const newXp = state.kingdomExp + district.minLevel * 20
        const newLevel = miLevelFromXp(newXp)
        set((prev) => ({
          settledDistricts: [...prev.settledDistricts, districtId],
          activeDistrictId: districtId,
          gold: prev.gold - district.settleCost,
          kingdomExp: newXp,
          kingdomLevel: newLevel,
        }))
        return true
      },

      // ── miExploreFrontier ──────────────────────────────────────
      miExploreFrontier: (districtId: string): boolean => {
        const state = get()
        const district = MI_DISTRICTS.find((d) => d.id === districtId)
        if (!district) return false
        if (state.settledDistricts.includes(districtId)) return false
        if (state.microEnergy < 25) return false

        const explorationBonus = Math.floor(district.minLevel * 5)
        const resourceDiscovery = Math.floor(Math.random() * 10) + 5
        const newXp = state.kingdomExp + explorationBonus
        const newLevel = miLevelFromXp(newXp)

        set((prev) => ({
          gold: prev.gold + explorationBonus,
          microEnergy: Math.max(0, prev.microEnergy - 25),
          kingdomExp: newXp,
          kingdomLevel: newLevel,
          collectedResources: {
            ...prev.collectedResources,
            bread_crumbs: (prev.collectedResources['bread_crumbs'] || 0) + resourceDiscovery,
          },
          totalHarvested: prev.totalHarvested + resourceDiscovery,
        }))
        return true
      },

      // ── miPromoteCitizen ───────────────────────────────────────
      miPromoteCitizen: (instanceId: string): boolean => {
        const state = get()
        const citizen = state.recruitedCitizens.find((c) => c.id === instanceId)
        if (!citizen) return false
        if (citizen.promotionCount >= 5) return false

        const promotionCost = Math.floor(50 * Math.pow(2, citizen.promotionCount))
        if (state.microEnergy < promotionCost) return false
        if (state.gold < promotionCost * 2) return false

        const newXp = state.kingdomExp + 30
        const newLevel = miLevelFromXp(newXp)
        set((prev) => ({
          recruitedCitizens: prev.recruitedCitizens.map((c) =>
            c.id === instanceId
              ? {
                  ...c,
                  level: c.level + 1,
                  power: Math.floor(c.power * 1.3),
                  maxHP: Math.floor(c.maxHP * 1.2),
                  currentHP: Math.floor(c.maxHP * 1.2),
                  promoted: true,
                  promotionCount: c.promotionCount + 1,
                }
              : c
          ),
          microEnergy: Math.max(0, prev.microEnergy - promotionCost),
          gold: prev.gold - promotionCost * 2,
          kingdomExp: newXp,
          kingdomLevel: newLevel,
          totalPromoted: prev.totalPromoted + 1,
        }))
        return true
      },

      // ── miRepairKingdom ────────────────────────────────────────
      miRepairKingdom: (amount: number): boolean => {
        const state = get()
        if (state.kingdom.prosperity >= state.kingdom.maxProsperity) return false
        if (state.microEnergy < 10) return false

        set((prev) => ({
          kingdom: {
            ...prev.kingdom,
            prosperity: Math.min(prev.kingdom.maxProsperity, prev.kingdom.prosperity + amount),
            lastRepairedAt: Date.now(),
          },
          microEnergy: Math.max(0, prev.microEnergy - 10),
        }))
        return true
      },

      // ── miBoostMorale ──────────────────────────────────────────
      miBoostMorale: (amount: number): boolean => {
        const state = get()
        if (state.kingdom.morale >= 100) return false
        if (state.gold < 20) return false

        set((prev) => ({
          kingdom: {
            ...prev.kingdom,
            morale: Math.min(100, prev.kingdom.morale + amount),
          },
          gold: prev.gold - 20,
        }))
        return true
      },
    }),
    {
      name: 'micro-kingdom-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: HOOK — useMicroKingdom
// ═══════════════════════════════════════════════════════════════════

export default function useMicroKingdom() {
  const store = useMIStore()

  // ── Getter: District Details ──────────────────────────────────
  const miGetDistrictDetails = useMemo(() => {
    return MI_DISTRICTS.map((district) => ({
      ...district,
      settled: store.settledDistricts.includes(district.id),
      active: store.activeDistrictId === district.id,
      levelMet: store.kingdomLevel >= district.minLevel,
      canAfford: store.gold >= district.settleCost,
    }))
  }, [store])

  // ── Getter: Resource Inventory ────────────────────────────────
  const miGetResourceInventory = useMemo(() => {
    return MI_RESOURCES.map((res) => ({
      ...res,
      owned: store.collectedResources[res.id] || 0,
      rarityColor: miRarityColor(res.rarity),
    }))
  }, [store])

  // ── Getter: Recruited Citizens ────────────────────────────────
  const miGetRecruitedCitizens = useMemo(() => {
    return store.recruitedCitizens.map((c) => {
      const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
      return {
        ...c,
        def,
        roleColor: def ? miRoleColor(def.role) : MI_COLOR_PEBBLE_BROWN,
        rarityColor: def ? miRarityColor(def.rarity) : '#9CA3AF',
        totalPower: Math.floor(c.power * (1 + c.level * 0.15) * (1 + c.promotionCount * 0.3)),
      }
    })
  }, [store])

  // ── Getter: Structure List ────────────────────────────────────
  const miGetStructureList = useMemo(() => {
    return MI_STRUCTURES.map((def) => {
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
  const miGetTotalPower = useMemo(() => {
    let citizenPower = 0
    for (const c of store.recruitedCitizens) {
      const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
      if (!def) continue
      const rarityMult = miRarityMultiplier(def.rarity)
      citizenPower += Math.floor(
        c.power * rarityMult * (1 + c.level * 0.15) * (1 + c.promotionCount * 0.3)
      )
    }
    const structurePower = store.structures.reduce(
      (sum, s) => sum + s.level * 12,
      0
    )
    const inventionPower = store.inventedGadgets.reduce((sum, gId) => {
      const gadget = MI_INVENTIONS.find((g) => g.id === gId)
      return sum + (gadget ? gadget.powerBonus : 0)
    }, 0)
    return { citizenPower, structurePower, inventionPower, total: citizenPower + structurePower + inventionPower }
  }, [store])

  // ── Getter: Event Status ──────────────────────────────────────
  const miGetEventStatus = useMemo(() => {
    if (!store.activeEventId) {
      return { active: false, event: null, timer: 0, severity: 0 }
    }
    const event = MI_EVENTS.find((e) => e.id === store.activeEventId)
    return {
      active: true,
      event: event || null,
      timer: store.eventTimer,
      severity: event ? event.severity : 0,
    }
  }, [store.activeEventId, store.eventTimer])

  // ── Getter: Active Event ──────────────────────────────────────
  const miGetActiveEvent = useMemo(() => {
    if (!store.activeEventId) return null
    return MI_EVENTS.find((e) => e.id === store.activeEventId) || null
  }, [store.activeEventId])

  // ── Getter: Next Title ────────────────────────────────────────
  const miGetNextTitle = useMemo(() => {
    const currentTitle = MI_TITLES.find((t) => t.id === store.currentTitle)
    const currentIndex = currentTitle ? MI_TITLES.indexOf(currentTitle) : -1
    if (currentIndex >= MI_TITLES.length - 1) return null
    return MI_TITLES[currentIndex + 1]
  }, [store.currentTitle])

  // ── Getter: Rarity Summary ────────────────────────────────────
  const miGetRaritySummary = useMemo(() => {
    const summary: Record<MIRarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const c of store.recruitedCitizens) {
      const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
      if (def) {
        summary[def.rarity] += 1
      }
    }
    for (const gId of store.inventedGadgets) {
      const gadget = MI_INVENTIONS.find((g) => g.id === gId)
      if (gadget) {
        summary[gadget.rarity] += 1
      }
    }
    return summary
  }, [store])

  // ── Getter: District Summary ──────────────────────────────────
  const miGetDistrictSummary = useMemo(() => {
    const totalDistricts = MI_DISTRICTS.length
    const settled = store.settledDistricts.length
    return {
      totalDistricts,
      settled,
      percent: Math.floor((settled / totalDistricts) * 100),
      allSettled: settled >= totalDistricts,
    }
  }, [store.settledDistricts])

  // ── Getter: Unlocked Achievements ─────────────────────────────
  const miGetUnlockedAchievements = useMemo(() => {
    const unlocked: MIAchievementDef[] = []
    for (const ach of MI_ACHIEVEMENTS) {
      if (store.achievements.includes(ach.id)) {
        unlocked.push(ach)
      }
    }
    return { unlocked, total: MI_ACHIEVEMENTS.length, progress: unlocked.length }
  }, [store])

  // ── Getter: Title Progress ────────────────────────────────────
  const miGetTitleProgress = useMemo(() => {
    return MI_TITLES.map((title) => ({
      ...title,
      unlocked:
        store.kingdomLevel >= title.requiredLevel &&
        store.settledDistricts.length >= title.requiredDistricts,
      active: store.currentTitle === title.id,
      levelMet: store.kingdomLevel >= title.requiredLevel,
      districtMet: store.settledDistricts.length >= title.requiredDistricts,
    }))
  }, [store.currentTitle, store.kingdomLevel, store.settledDistricts])

  // ── Getter: Invented Gadgets Detail ───────────────────────────
  const miGetInventedGadgets = useMemo(() => {
    return MI_INVENTIONS.map((gadget) => ({
      ...gadget,
      invented: store.inventedGadgets.includes(gadget.id),
      rarityColor: miRarityColor(gadget.rarity),
      canAfford:
        store.gold >= Math.floor(20 * miRarityMultiplier(gadget.rarity)) &&
        store.microEnergy >= 15 &&
        !store.inventedGadgets.includes(gadget.id),
    }))
  }, [store])

  // ── Getter: Kingdom Prosperity ────────────────────────────────
  const miGetKingdomProsperity = useMemo(() => {
    const { prosperity, maxProsperity, morale, lastRepairedAt } = store.kingdom
    return {
      prosperity,
      maxProsperity,
      morale,
      prosperityPercent: Math.floor((prosperity / maxProsperity) * 100),
      isLowMorale: morale < 50,
      isCritical: prosperity < maxProsperity * 0.25,
      lastRepairedAt,
    }
  }, [store.kingdom])

  // ── Getter: Citizen Recruiting Costs ──────────────────────────
  const miGetRecruitingCosts = useMemo(() => {
    return MI_CITIZENS.filter(
      (c) => !store.recruitedCitizens.some((s) => s.citizenDefId === c.id)
    ).map((citizen) => ({
      ...citizen,
      recruitCost: Math.floor(10 * miRarityMultiplier(citizen.rarity)),
      canAfford:
        store.microEnergy >= Math.floor(10 * miRarityMultiplier(citizen.rarity)),
      roleColor: miRoleColor(citizen.role),
      rarityColor: miRarityColor(citizen.rarity),
    }))
  }, [store])

  // ── Level Progress ────────────────────────────────────────────
  const miLevelProgress = useMemo(() => {
    const current = miXpForLevel(store.kingdomLevel)
    return {
      level: store.kingdomLevel,
      currentXp: store.kingdomExp,
      xpToNext: current,
      maxLevel: store.kingdomLevel >= MI_MAX_LEVEL,
      progressPercent:
        current > 0 ? Math.min(100, Math.floor((store.kingdomExp / current) * 100)) : 0,
    }
  }, [store.kingdomLevel, store.kingdomExp])

  // ── Getter: Ability List ──────────────────────────────────────
  const miGetAbilityList = useMemo(() => {
    return MI_ABILITIES.map((ability) => ({
      ...ability,
      canUse: store.microEnergy >= ability.cooldown,
      roleColor: miRoleColor(ability.role),
    }))
  }, [store.microEnergy])

  // ── Getter: Event List ────────────────────────────────────────
  const miGetEventList = useMemo(() => {
    return MI_EVENTS.map((event) => ({
      ...event,
      canTrigger: store.activeEventId === null,
      isActive: store.activeEventId === event.id,
    }))
  }, [store.activeEventId])

  // ── Getter: Stats Summary & Role Count (merged, same deps) ───
  const { miGetStatsSummary, miGetCitizenCountByRole } = useMemo(() => {
    const citizenCountByRole: Record<MIRole, number> = {
      Builder: 0,
      Farmer: 0,
      Scientist: 0,
      Artist: 0,
      Soldier: 0,
      Trader: 0,
      Healer: 0,
    }
    for (const c of store.recruitedCitizens) {
      const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
      if (def) {
        citizenCountByRole[def.role] += 1
      }
    }

    const statsSummary = {
      totalCitizens: store.recruitedCitizens.length,
      totalResources: Object.values(store.collectedResources).reduce((s, v) => s + v, 0),
      totalStructures: store.structures.length,
      totalInventions: store.inventedGadgets.length,
      totalDistricts: store.settledDistricts.length,
      avgCitizenLevel:
        store.recruitedCitizens.length > 0
          ? Math.floor(
              store.recruitedCitizens.reduce((s, c) => s + c.level, 0) / store.recruitedCitizens.length
            )
          : 0,
      totalPromotions: store.recruitedCitizens.reduce((s, c) => s + c.promotionCount, 0),
    }

    return { miGetStatsSummary: statsSummary, miGetCitizenCountByRole: citizenCountByRole }
  }, [store])

  // ── Getter: Upgrade Costs ─────────────────────────────────────
  const miGetUpgradeCosts = useMemo(() => {
    return store.structures.map((s) => {
      const def = MI_STRUCTURES.find((d) => d.id === s.structureDefId)
      if (!def) return { ...s, nextCost: 0, maxed: s.level >= 10 }
      const nextCost = s.level >= 10 ? 0 : Math.floor(def.baseCost * Math.pow(def.costMultiplier, s.level))
      return { ...s, def, nextCost, maxed: s.level >= 10 }
    })
  }, [store.structures])

  // ── Getter: Invention Bonus ───────────────────────────────────
  const miGetInventionBonus = useMemo(() => {
    let totalPowerBonus = 0
    for (const gId of store.inventedGadgets) {
      const gadget = MI_INVENTIONS.find((g) => g.id === gId)
      if (gadget) {
        totalPowerBonus += gadget.powerBonus
      }
    }
    return {
      totalPowerBonus,
      gadgetCount: store.inventedGadgets.length,
      hasLegendaryInvention: store.inventedGadgets.some((gId) => {
        const gadget = MI_INVENTIONS.find((g) => g.id === gId)
        return gadget && gadget.rarity === 'legendary'
      }),
    }
  }, [store.inventedGadgets])

  // ── Getter: Promotion Tier Details ────────────────────────────
  const miGetPromotionTierDetails = useMemo(() => {
    return store.recruitedCitizens.map((c) => {
      const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
      const promotionTier = miGetPromotionTier(c.promotionCount)
      return {
        ...c,
        def,
        promotionTier,
        nextTier: c.promotionCount < 5 ? miGetPromotionTier(c.promotionCount + 1) : null,
        canPromote: c.promotionCount < 5,
        promotionCost: Math.floor(50 * Math.pow(2, c.promotionCount)),
        promotionGoldCost: Math.floor(50 * Math.pow(2, c.promotionCount)) * 2,
      }
    })
  }, [store])

  // ── Getter: District Resources Available ──────────────────────
  const miGetDistrictResources = useMemo(() => {
    if (!store.activeDistrictId) return { resources: [], bonusResources: [] }
    const districtMap = miFindDistrictResourceMap(store.activeDistrictId)
    if (!districtMap) return { resources: [], bonusResources: [] }

    const resources = districtMap.resourceIds
      .map((rId: string) => MI_RESOURCES.find((r) => r.id === rId))
      .filter((r): r is MIResourceDef => r !== undefined)

    const bonusResources = districtMap.bonusResourceIds
      .map((rId: string) => MI_RESOURCES.find((r) => r.id === rId))
      .filter((r): r is MIResourceDef => r !== undefined)

    return { resources, bonusResources }
  }, [store.activeDistrictId])

  // ── Getter: Micro Energy Efficiency ───────────────────────────
  const miGetMicroEnergyEfficiency = useMemo(() => {
    const structureBonus = store.structures.reduce((sum, s) => {
      return sum + miGetStructureBonus(s.structureDefId, s.level)
    }, 0)
    const inventionBonus = store.inventedGadgets.reduce((sum, gId) => {
      const gadget = MI_INVENTIONS.find((g) => g.id === gId)
      return sum + (gadget ? Math.floor(gadget.powerBonus * 0.2) : 0)
    }, 0)
    return {
      baseRegen: 1,
      structureBonus,
      inventionBonus,
      totalRegen: 1 + structureBonus + inventionBonus,
    }
  }, [store])

  // ── Getter: Role Synergy Map ──────────────────────────────────
  const miGetRoleSynergies = useMemo(() => {
    return MI_ROLE_INTERACTIONS.map((interaction) => ({
      ...interaction,
      actorColor: miRoleColor(interaction.actor),
      targetColor: miRoleColor(interaction.target),
      hasActor: store.recruitedCitizens.some((c) => {
        const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
        return def && def.role === interaction.actor
      }),
      hasTarget: store.recruitedCitizens.some((c) => {
        const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
        return def && def.role === interaction.target
      }),
      isActive:
        store.recruitedCitizens.some((c) => {
          const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
          return def && def.role === interaction.actor
        }) &&
        store.recruitedCitizens.some((c) => {
          const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
          return def && def.role === interaction.target
        }),
    }))
  }, [store])

  // ── Getter: Farmer Crop Yields ────────────────────────────────
  const miGetFarmerCropYields = useMemo(() => {
    const farmers = store.recruitedCitizens.filter((c) => {
      const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
      return def && def.role === 'Farmer'
    })
    const farmStructures = store.structures.filter((s) => {
      return s.structureDefId === 'seedbed_farm' || s.structureDefId === 'seedling_greenhouse'
    })
    const baseYield = 3
    const farmerBonus = farmers.length * 1.5
    const structureBonus = farmStructures.reduce((sum, s) => sum + s.level * 0.5, 0)
    return {
      baseYield,
      farmerBonus,
      structureBonus,
      totalYield: Math.floor(baseYield + farmerBonus + structureBonus),
      farmerCount: farmers.length,
      farmCount: farmStructures.length,
    }
  }, [store])

  // ── Getter: Soldier Defense Rating ────────────────────────────
  const miGetSoldierDefenseRating = useMemo(() => {
    const soldiers = store.recruitedCitizens.filter((c) => {
      const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
      return def && def.role === 'Soldier'
    })
    const defenseStructures = store.structures.filter((s) => {
      return (
        s.structureDefId === 'thorn_wall' ||
        s.structureDefId === 'acorn_barracks' ||
        s.structureDefId === 'fortress_gate'
      )
    })
    const baseDefense = 10
    const soldierPower = soldiers.reduce((sum, s) => sum + s.power, 0)
    const structureDefense = defenseStructures.reduce((sum, s) => sum + s.level * 8, 0)
    const moraleBonus = store.kingdom.morale * 0.1
    return {
      baseDefense,
      soldierPower,
      structureDefense,
      moraleBonus,
      totalRating: Math.floor(baseDefense + soldierPower * 0.5 + structureDefense + moraleBonus),
      soldierCount: soldiers.length,
      fortCount: defenseStructures.length,
    }
  }, [store])

  // ── Getter: Trader Income Estimator ───────────────────────────
  const miGetTraderIncomeEstimator = useMemo(() => {
    const traders = store.recruitedCitizens.filter((c) => {
      const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
      return def && def.role === 'Trader'
    })
    const tradeStructures = store.structures.filter((s) => {
      return s.structureDefId === 'moss_market' || s.structureDefId === 'royal_highway'
    })
    const baseIncome = 5
    const traderBonus = traders.reduce((sum, t) => sum + Math.floor(t.power * 0.3), 0)
    const structureBonus = tradeStructures.reduce((sum, s) => sum + s.level * 4, 0)
    const moraleMultiplier = 1 + store.kingdom.morale * 0.005
    return {
      baseIncome,
      traderBonus,
      structureBonus,
      moraleMultiplier,
      estimatedIncome: Math.floor((baseIncome + traderBonus + structureBonus) * moraleMultiplier),
      traderCount: traders.length,
      marketCount: tradeStructures.length,
    }
  }, [store])

  // ── Getter: Healer Recovery Rate ──────────────────────────────
  const miGetHealerRecoveryRate = useMemo(() => {
    const healers = store.recruitedCitizens.filter((c) => {
      const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
      return def && def.role === 'Healer'
    })
    const healingStructures = store.structures.filter((s) => {
      return s.structureDefId === 'dewdrop_fountain' || s.structureDefId === 'honey_tavern'
    })
    const baseRecovery = 2
    const healerBonus = healers.reduce((sum, h) => sum + Math.floor(h.power * 0.4), 0)
    const structureBonus = healingStructures.reduce((sum, s) => sum + s.level * 3, 0)
    return {
      baseRecovery,
      healerBonus,
      structureBonus,
      totalRecovery: baseRecovery + healerBonus + structureBonus,
      healerCount: healers.length,
      clinicCount: healingStructures.length,
    }
  }, [store])

  // ── Getter: Scientist Research Output ─────────────────────────
  const miGetScientistResearchOutput = useMemo(() => {
    const scientists = store.recruitedCitizens.filter((c) => {
      const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
      return def && def.role === 'Scientist'
    })
    const labStructures = store.structures.filter((s) => {
      return s.structureDefId === 'invention_lab' || s.structureDefId === 'royal_library'
    })
    const baseOutput = 1
    const scientistBonus = scientists.reduce((sum, s) => sum + Math.floor(s.power * 0.25), 0)
    const labBonus = labStructures.reduce((sum, s) => sum + s.level * 6, 0)
    return {
      baseOutput,
      scientistBonus,
      labBonus,
      totalOutput: baseOutput + scientistBonus + labBonus,
      scientistCount: scientists.length,
      labCount: labStructures.length,
    }
  }, [store])

  // ── Getter: Builder Construction Speed ────────────────────────
  const miGetBuilderConstructionSpeed = useMemo(() => {
    const builders = store.recruitedCitizens.filter((c) => {
      const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
      return def && def.role === 'Builder'
    })
    const workshopStructures = store.structures.filter((s) => {
      return s.structureDefId === 'pebble_workshop' || s.structureDefId === 'crumb_silo'
    })
    const baseSpeed = 1.0
    const builderBonus = builders.reduce((sum, b) => sum + b.level * 0.15, 0)
    const workshopBonus = workshopStructures.reduce((sum, s) => sum + s.level * 0.1, 0)
    return {
      baseSpeed,
      builderBonus,
      workshopBonus,
      totalSpeed: Math.floor((baseSpeed + builderBonus + workshopBonus) * 100) / 100,
      builderCount: builders.length,
      workshopCount: workshopStructures.length,
    }
  }, [store])

  // ── Getter: Artist Morale Contribution ────────────────────────
  const miGetArtistMoraleContribution = useMemo(() => {
    const artists = store.recruitedCitizens.filter((c) => {
      const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
      return def && def.role === 'Artist'
    })
    const culturalStructures = store.structures.filter((s) => {
      return s.structureDefId === 'petal_theater' || s.structureDefId === 'royal_garden'
    })
    const baseMorale = 1
    const artistBonus = artists.reduce((sum, a) => sum + Math.floor(a.power * 0.2), 0)
    const culturalBonus = culturalStructures.reduce((sum, s) => sum + s.level * 2, 0)
    return {
      baseMorale,
      artistBonus,
      culturalBonus,
      totalMoraleContribution: baseMorale + artistBonus + culturalBonus,
      artistCount: artists.length,
      culturalCount: culturalStructures.length,
    }
  }, [store])

  // ── Getter: Giant Event Impact Assessment ─────────────────────
  const miGetGiantEventImpact = useMemo(() => {
    if (!store.activeEventId) {
      return {
        prosperityLoss: 0,
        moraleChange: 0,
        resourceLoss: 0,
        recoveryTime: 0,
        defensiveMitigation: 0,
      }
    }
    const event = MI_EVENTS.find((e) => e.id === store.activeEventId)
    if (!event) {
      return {
        prosperityLoss: 0,
        moraleChange: 0,
        resourceLoss: 0,
        recoveryTime: 0,
        defensiveMitigation: 0,
      }
    }
    const soldiers = store.recruitedCitizens.filter((c) => {
      const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
      return def && def.role === 'Soldier'
    })
    const defensiveMitigation = Math.min(
      80,
      Math.floor(soldiers.reduce((sum, s) => sum + s.power, 0) * 0.3)
    )
    const rawProsperityLoss = event.severity * 8
    const prosperityLoss = Math.max(0, Math.floor(rawProsperityLoss * (1 - defensiveMitigation / 100)))
    const moraleChange = event.severity >= 3 ? -event.severity * 5 : 10
    const resourceLoss = event.severity >= 4 ? Math.floor(event.severity * 12) : 0
    const recoveryTime = Math.max(5, event.duration - Math.floor(defensiveMitigation * 0.5))
    return {
      prosperityLoss,
      moraleChange,
      resourceLoss,
      recoveryTime,
      defensiveMitigation,
    }
  }, [store])

  // ── Getter: Frontier Exploration Opportunities ────────────────
  const miGetFrontierOpportunities = useMemo(() => {
    return MI_DISTRICTS.filter(
      (d) => !store.settledDistricts.includes(d.id)
    ).map((district) => ({
      ...district,
      canExplore: store.kingdomLevel >= Math.max(1, district.minLevel - 3),
      canSettle: store.kingdomLevel >= district.minLevel && store.gold >= district.settleCost,
      explorationReward: Math.floor(district.minLevel * 5),
      resourcePotential: district.minLevel * 3,
    }))
  }, [store])

  // ── Getter: Kingdom Diplomacy Status ──────────────────────────
  const miGetDiplomacyStatus = useMemo(() => {
    const traders = store.recruitedCitizens.filter((c) => {
      const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
      return def && def.role === 'Trader'
    })
    const artists = store.recruitedCitizens.filter((c) => {
      const def = MI_CITIZENS.find((d) => d.id === c.citizenDefId)
      return def && def.role === 'Artist'
    })
    const tradeInfluence = traders.reduce((sum, t) => sum + t.level, 0)
    const culturalInfluence = artists.reduce((sum, a) => sum + a.level, 0)
    const totalInfluence = tradeInfluence + culturalInfluence
    let diplomaticRank = 'Isolated'
    if (totalInfluence >= 50) {
      diplomaticRank = 'Sovereign Power'
    } else if (totalInfluence >= 35) {
      diplomaticRank = 'Regional Leader'
    } else if (totalInfluence >= 20) {
      diplomaticRank = 'Trading Partner'
    } else if (totalInfluence >= 10) {
      diplomaticRank = 'Known Entity'
    } else if (totalInfluence >= 3) {
      diplomaticRank = 'Emerging Contact'
    }
    return {
      tradeInfluence,
      culturalInfluence,
      totalInfluence,
      diplomaticRank,
      canEstablishEmbassy: totalInfluence >= 25,
      alliedFactions: Math.floor(totalInfluence / 10),
    }
  }, [store])

  // ── Getter: Complete Kingdom Overview ─────────────────────────
  const miGetKingdomOverview = useMemo(() => {
    const totalCitizens = store.recruitedCitizens.length
    const totalResources = Object.values(store.collectedResources).reduce((s, v) => s + v, 0)
    const totalStructures = store.structures.length
    const totalInventions = store.inventedGadgets.length
    const settledDistricts = store.settledDistricts.length
    const maxStructLevel = store.structures.length > 0
      ? Math.max(...store.structures.map((s) => s.level))
      : 0
    const maxCitizenLevel = store.recruitedCitizens.length > 0
      ? Math.max(...store.recruitedCitizens.map((c) => c.level))
      : 0

    let overallGrade = 'F'
    const score = totalCitizens * 2 + settledDistricts * 10 + totalInventions * 5 +
      totalStructures * 3 + maxStructLevel * 2 + maxCitizenLevel * 1.5
    if (score >= 200) {
      overallGrade = 'S'
    } else if (score >= 150) {
      overallGrade = 'A'
    } else if (score >= 100) {
      overallGrade = 'B'
    } else if (score >= 60) {
      overallGrade = 'C'
    } else if (score >= 30) {
      overallGrade = 'D'
    }

    return {
      totalCitizens,
      totalResources,
      totalStructures,
      totalInventions,
      settledDistricts,
      maxStructLevel,
      maxCitizenLevel,
      overallGrade,
      score: Math.floor(score),
      kingdomAge: Math.floor((Date.now() - (store.recruitedCitizens[0]?.acquiredAt ?? Date.now())) / 86400000),
    }
  }, [store])

  // ── Assemble miAPI ────────────────────────────────────────────
  const miAPI = {
    // Constants
    MI_CITIZENS,
    MI_DISTRICTS,
    MI_RESOURCES,
    MI_STRUCTURES,
    MI_ABILITIES,
    MI_ACHIEVEMENTS,
    MI_TITLES,
    MI_INVENTIONS,
    MI_EVENTS,
    MI_COLOR_MICRO_GREEN,
    MI_COLOR_MINI_BLUE,
    MI_COLOR_TINY_GOLD,
    MI_COLOR_PEBBLE_BROWN,
    MI_COLOR_DEWDROP_SILVER,
    MI_COLOR_INVENTION_COPPER,
    MI_COLOR_FRONTIER_ORANGE,
    MI_COLOR_KINGDOM_PURPLE,

    // State
    recruitedCitizens: store.recruitedCitizens,
    collectedResources: store.collectedResources,
    structures: store.structures,
    achievements: store.achievements,
    currentTitle: store.currentTitle,
    inventedGadgets: store.inventedGadgets,
    settledDistricts: store.settledDistricts,
    kingdomLevel: store.kingdomLevel,
    kingdomExp: store.kingdomExp,
    gold: store.gold,
    microEnergy: store.microEnergy,
    totalRecruited: store.totalRecruited,
    totalHarvested: store.totalHarvested,
    totalUpgraded: store.totalUpgraded,
    totalPromoted: store.totalPromoted,
    totalInvented: store.totalInvented,
    activeEventId: store.activeEventId,
    eventTimer: store.eventTimer,
    kingdom: store.kingdom,
    activeDistrictId: store.activeDistrictId,

    // Actions
    miRecruitCitizen: store.miRecruitCitizen,
    miHarvestResource: store.miHarvestResource,
    miBuildStructure: store.miBuildStructure,
    miUseAbility: store.miUseAbility,
    miHandleGiantEvent: store.miHandleGiantEvent,
    miInventGadget: store.miInventGadget,
    miResearchTech: store.miResearchTech,
    miHarvestCrop: store.miHarvestCrop,
    miTrainSoldier: store.miTrainSoldier,
    miSettleDistrict: store.miSettleDistrict,
    miExploreFrontier: store.miExploreFrontier,
    miPromoteCitizen: store.miPromoteCitizen,
    miRepairKingdom: store.miRepairKingdom,
    miBoostMorale: store.miBoostMorale,

    // Getters
    miGetDistrictDetails,
    miGetResourceInventory,
    miGetRecruitedCitizens,
    miGetStructureList,
    miGetTotalPower,
    miGetEventStatus,
    miGetActiveEvent,
    miGetNextTitle,
    miGetRaritySummary,
    miGetDistrictSummary,
    miGetUnlockedAchievements,
    miGetTitleProgress,
    miGetInventedGadgets,
    miGetKingdomProsperity,
    miGetRecruitingCosts,
    miLevelProgress,
    miGetAbilityList,
    miGetEventList,
    miGetStatsSummary,
    miGetCitizenCountByRole,
    miGetUpgradeCosts,
    miGetInventionBonus,
    miGetPromotionTierDetails,
    miGetDistrictResources,
    miGetMicroEnergyEfficiency,
    miGetRoleSynergies,
    miGetFarmerCropYields,
    miGetSoldierDefenseRating,
    miGetTraderIncomeEstimator,
    miGetHealerRecoveryRate,
    miGetScientistResearchOutput,
    miGetBuilderConstructionSpeed,
    miGetArtistMoraleContribution,
    miGetGiantEventImpact,
    miGetFrontierOpportunities,
    miGetDiplomacyStatus,
    miGetKingdomOverview,
  }

  return miAPI
}
