/**
 * Blizzard Throne Wire — 暴雪王座 (Blizzard Throne / Icy Storm Realm) feature module
 *
 * An icy storm realm where frost monarchs rule from thrones of eternal ice.
 * Summon 35 ice guardians across 5 rarity tiers and 7 species, claim 8 throne
 * locations, collect 30 ice/crystal materials, build 25 throne structures,
 * wield 22 ice abilities, earn 8 titles from Frost Scout to Blizzard Monarch,
 * gather 15 legendary artifacts, and endure 12 throne events — backed by a
 * Zustand store with persist middleware.
 *
 * Storage key: blizzard-throne-wire
 * Prefix: bt / BT_
 */

import { useEffect, useRef } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type BTRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type BTSpecies =
  | 'frost_giant'
  | 'ice_wraith'
  | 'blizzard_hawk'
  | 'snow_golem'
  | 'glacial_wyrm'
  | 'permafrost_knight'
  | 'crystal_queen'

export interface BTGuardianDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly species: BTSpecies
  readonly rarity: BTRarity
  readonly frostPower: number
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

export interface BTSpeciesDef {
  readonly id: BTSpecies
  readonly name: string
  readonly description: string
  readonly color: string
  readonly passiveBonus: string
  readonly passiveValue: number
  readonly preferredThrone: string
}

export interface BTThroneDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly minLevel: number
  readonly unlockCost: number
  readonly bonuses: string[]
  readonly element: BTSpecies
}

export interface BTMaterialDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: BTRarity
  readonly source: string
  readonly value: number
  readonly category: 'frost' | 'crystal' | 'glacier' | 'storm' | 'permafrost' | 'aurora'
}

export interface BTStructureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly costMultiplier: number
  readonly maxLevel: number
  readonly category: 'defense' | 'production' | 'enchantment' | 'storage' | 'summoning'
}

export interface BTAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly element: BTSpecies
  readonly energyCost: number
}

export interface BTAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
  readonly icon: string
}

export interface BTTitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredThrones: number
}

export interface BTArtifactDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: BTRarity
  readonly powerBonus: number
  readonly specialAbility: string
  readonly forgeCost: number
}

export interface BTEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly duration: number
  readonly effects: string[]
  readonly element: BTSpecies
}

export interface BTGuardianEntity {
  readonly id: string
  guardianDefId: string
  name: string
  level: number
  currentHP: number
  maxHP: number
  power: number
  summonedAt: number
  thronesDefended: number
}

export interface BTStructureEntity {
  readonly id: string
  structureDefId: string
  level: number
  built: boolean
}

export interface BTStoreState {
  btLevel: number
  btFrostPower: number
  btBlizzardEnergy: number
  btGuardians: Record<string, BTGuardianEntity>
  btThrones: Record<string, { claimed: boolean; claimedAt: number | null; defenseBonus: number }>
  btStructures: Record<string, BTStructureEntity>
  btArtifacts: string[]
  btAchievements: string[]
  btInventory: Record<string, number>
  btStats: {
    totalGuardiansSummoned: number
    totalThronesClaimed: number
    totalStructuresBuilt: number
    totalArtifactsActivated: number
    totalBlizzardStrikes: number
    totalFrostPowerEarned: number
    totalBlizzardEnergyGained: number
    totalRelicsActivated: number
  }
  btTitle: string
  btActiveEventId: string | null
  btEventTimer: number
  btGold: number
  btIceCrystals: number
  btActiveThroneId: string | null
}

export interface BTStoreActions {
  btSummonGuardian: (guardianId: string) => boolean
  btThroneClaim: (throneId: string) => boolean
  btBuildStructure: (structureId: string) => boolean
  btBlizzardStrike: (targetThroneId: string) => boolean
  btActivateRelic: (artifactId: string) => boolean
  resetBlizzardThrone: () => void
}

export type BTFullStore = BTStoreState & BTStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const BT_COLOR_ICE_BLUE: string = '#87CEEB'
export const BT_COLOR_FROST_WHITE: string = '#E8F4FD'
export const BT_COLOR_GLACIER_CYAN: string = '#00CED1'
export const BT_COLOR_STORM_GRAY: string = '#708090'
export const BT_COLOR_DEEP_FROST: string = '#4A90D9'
export const BT_COLOR_AURORA_TEAL: string = '#00B4D8'
export const BT_COLOR_SNOW_SILVER: string = '#B0C4DE'
export const BT_COLOR_PERMAFROST_NAVY: string = '#2C3E6B'
export const BT_COLOR_CRYSTAL_SHIMMER: string = '#A8E6CF'
export const BT_COLOR_BLIZZARD_VIOLET: string = '#7B68EE'

export const BT_RARITY_COLORS: Record<BTRarity, string> = {
  common: '#9CA3AF',
  uncommon: '#87CEEB',
  rare: '#00CED1',
  epic: '#7B68EE',
  legendary: '#FFD700',
}

export const BT_RARITY_ICONS: Record<BTRarity, string> = {
  common: '🧊',
  uncommon: '❄️',
  rare: '🌨️',
  epic: '💎',
  legendary: '👑',
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════════

const BT_MAX_LEVEL = 50
const BT_INITIAL_GOLD = 500
const BT_INITIAL_FROST_POWER = 100
const BT_INITIAL_BLIZZARD_ENERGY = 50
const BT_INITIAL_ICE_CRYSTALS = 0

function btXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= BT_MAX_LEVEL) return Infinity
  return Math.floor(85 * Math.pow(1.13, level) + level * 20)
}

function btLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < BT_MAX_LEVEL) {
    const needed = btXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function btGenerateId(): string {
  return `bt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function btRarityMultiplier(rarity: BTRarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.5
    case 'rare': return 2.5
    case 'epic': return 4.0
    case 'legendary': return 7.0
  }
}

function btSpeciesColor(species: BTSpecies): string {
  switch (species) {
    case 'frost_giant': return BT_COLOR_ICE_BLUE
    case 'ice_wraith': return BT_COLOR_FROST_WHITE
    case 'blizzard_hawk': return BT_COLOR_GLACIER_CYAN
    case 'snow_golem': return BT_COLOR_STORM_GRAY
    case 'glacial_wyrm': return BT_COLOR_DEEP_FROST
    case 'permafrost_knight': return BT_COLOR_AURORA_TEAL
    case 'crystal_queen': return BT_COLOR_BLIZZARD_VIOLET
  }
}

function btRarityColor(rarity: BTRarity): string {
  return BT_RARITY_COLORS[rarity]
}

function btClamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: BT_SPECIES — 7 Ice Guardian Species
// ═══════════════════════════════════════════════════════════════════

export const BT_SPECIES: readonly BTSpeciesDef[] = [
  {
    id: 'frost_giant',
    name: 'Frost Giant',
    description:
      'Towering behemoths of living ice whose footsteps crack the frozen earth. Frost Giants are the ancient wardens of the tundra, born from glacial calving events during the deepest winters. Their breath crystallizes the air itself, creating localized blizzards that bury entire armies in seconds.',
    color: BT_COLOR_ICE_BLUE,
    passiveBonus: '+12% defense aura to nearby allies',
    passiveValue: 12,
    preferredThrone: 'glacial_peak_throne',
  },
  {
    id: 'ice_wraith',
    name: 'Ice Wraith',
    description:
      'Spectral entities formed from the collective grief of frozen travelers. Ice Wraiths drift silently through the blizzard realm, their translucent bodies made of frozen mist and sorrow. They drain warmth from anything they touch, leaving perfect ice sculptures where living beings once stood.',
    color: BT_COLOR_FROST_WHITE,
    passiveBonus: '+15% frost magic amplification',
    passiveValue: 15,
    preferredThrone: 'spectral_frost_chamber',
  },
  {
    id: 'blizzard_hawk',
    name: 'Blizzard Hawk',
    description:
      'Majestic raptors that ride the winds of perpetual storms. Blizzard Hawks have wings made of razor-sharp ice crystals that refract light into blinding aurora displays. They can sense changes in atmospheric pressure from hundreds of miles away, making them unparalleled scouts.',
    color: BT_COLOR_GLACIER_CYAN,
    passiveBonus: '+18% speed and scouting range',
    passiveValue: 18,
    preferredThrone: 'storm_eye_aerie',
  },
  {
    id: 'snow_golem',
    name: 'Snow Golem',
    description:
      'Sentinel constructs assembled by frost monarchs from enchanted permafrost. Snow Golems stand tireless guard over throne chambers, their bodies slowly regenerating from ambient moisture. Ancient runes carved into their forms grant them awareness of all who approach.',
    color: BT_COLOR_STORM_GRAY,
    passiveBonus: '+10% structure defense bonus',
    passiveValue: 10,
    preferredThrone: 'permafrost_keep',
  },
  {
    id: 'glacial_wyrm',
    name: 'Glacial Wyrm',
    description:
      'Ancient serpentine dragons that burrow through living glaciers. Their scales are plates of thousand-year ice harder than steel, and their blood runs so cold it freezes the ground they crawl upon. Glacial Wyrms are the oldest creatures in the blizzard realm.',
    color: BT_COLOR_DEEP_FROST,
    passiveBonus: '+20% raw power in blizzard conditions',
    passiveValue: 20,
    preferredThrone: 'eternal_ice_hall',
  },
  {
    id: 'permafrost_knight',
    name: 'Permafrost Knight',
    description:
      'Warriors clad in armor forged from permanently frozen ore. Permafrost Knights have sworn oaths of eternal vigilance to their monarchs, their hearts literally frozen to prevent fear from ever taking root. Their swords never dull, for cold preserves all things.',
    color: BT_COLOR_AURORA_TEAL,
    passiveBonus: '+14% attack and counter-strike chance',
    passiveValue: 14,
    preferredThrone: 'frozen_bastion',
  },
  {
    id: 'crystal_queen',
    name: 'Crystal Queen',
    description:
      'Regal mages who command the crystalline structures of the ice realm. Crystal Queens grow crowns of living ice that channel ambient frost energy into devastating spells. Each queen rules a facet of the crystal lattice network that underpins the entire blizzard throne.',
    color: BT_COLOR_BLIZZARD_VIOLET,
    passiveBonus: '+25% magic and energy regeneration',
    passiveValue: 25,
    preferredThrone: 'crystal_sovereign_chamber',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: BT_GUARDIANS — 35 Ice Guardians (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const BT_GUARDIANS: readonly BTGuardianDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'frost_chipping',
    name: 'Frost Chipping',
    description:
      'A small elemental born when ice cracks from thermal expansion. It chitters and sparkles, leaving trails of frost wherever it scurries.',
    species: 'ice_wraith',
    rarity: 'common',
    frostPower: 14,
    summonCost: 10,
    abilities: ['Frostbite Touch', 'Shimmer Veil'],
    lore: 'Frost Chippings are the most numerous guardians in the realm, born by the thousands each time the temperature drops.',
    stats: { attack: 7, defense: 4, speed: 16, magic: 10, hp: 28 },
  },
  {
    id: 'snow_sentinel',
    name: 'Snow Sentinel',
    description:
      'A basic golem made of packed snow and rudimentary frost runes. It patrols corridors with mechanical precision, melting and reforming as needed.',
    species: 'snow_golem',
    rarity: 'common',
    frostPower: 16,
    summonCost: 12,
    abilities: ['Snow Bash', 'Frost Patch'],
    lore: 'Every new monarch receives a dozen Snow Sentinels upon claiming their first throne.',
    stats: { attack: 10, defense: 12, speed: 4, magic: 3, hp: 50 },
  },
  {
    id: 'glacier_chick',
    name: 'Glacier Chick',
    description:
      'A young blizzard hawk still learning to ride the winds. Its ice-feather plumage is not yet fully formed, but its enthusiasm more than compensates.',
    species: 'blizzard_hawk',
    rarity: 'common',
    frostPower: 12,
    summonCost: 8,
    abilities: ['Gust Chill', 'Ice Peck'],
    lore: 'Glacier Chicks are raised in the Storm Eye Aerie by elder hawks who teach them to sense barometric changes.',
    stats: { attack: 8, defense: 5, speed: 20, magic: 6, hp: 22 },
  },
  {
    id: 'permafrost_squire',
    name: 'Permafrost Squire',
    description:
      'A knight-in-training whose armor has not yet fully frozen to their body. They fight with determination that outshines their limited experience.',
    species: 'permafrost_knight',
    rarity: 'common',
    frostPower: 18,
    summonCost: 14,
    abilities: ['Icy Slash', 'Shield Frost'],
    lore: 'Permafrost Squires train for decades before their armor bond is complete. Only then are they true knights.',
    stats: { attack: 12, defense: 14, speed: 8, magic: 4, hp: 45 },
  },
  {
    id: 'frostling_giant',
    name: 'Frostling Giant',
    description:
      'A juvenile frost giant barely twelve feet tall. Its footsteps create miniature ice craters and its laughter causes hail.',
    species: 'frost_giant',
    rarity: 'common',
    frostPower: 20,
    summonCost: 15,
    abilities: ['Ground Pound', 'Ice Breath'],
    lore: 'Frostling Giants grow one foot taller for every century they live. The oldest are taller than mountains.',
    stats: { attack: 14, defense: 10, speed: 3, magic: 5, hp: 55 },
  },
  {
    id: 'crystal_sprout',
    name: 'Crystal Sprout',
    description:
      'A nascent crystal queen whose crown has just begun to form. She channels raw frost energy through her tiny crystalline antlers.',
    species: 'crystal_queen',
    rarity: 'common',
    frostPower: 15,
    summonCost: 11,
    abilities: ['Sparkle Ray', 'Frost Nova (Minor)'],
    lore: 'Crystal Sprouts are rare even among common guardians, as most crystal potential goes unrealized.',
    stats: { attack: 5, defense: 6, speed: 10, magic: 18, hp: 30 },
  },
  {
    id: 'ice_wyrm_hatchling',
    name: 'Ice Wyrm Hatchling',
    description:
      'A newly hatched glacial wyrm no larger than a python. Its scales are soft and translucent, but its frost bite is surprisingly potent.',
    species: 'glacial_wyrm',
    rarity: 'common',
    frostPower: 17,
    summonCost: 13,
    abilities: ['Frost Fang', 'Burrow (Shallow)'],
    lore: 'Glacial Wyrm eggs take five hundred years to hatch. The first thing a hatchling does is eat its own eggshell.',
    stats: { attack: 11, defense: 8, speed: 14, magic: 8, hp: 35 },
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'rime_phantom',
    name: 'Rime Phantom',
    description:
      'An ice wraith that has absorbed the memories of a fallen knight. It wields a ghostly sword of frozen light with deadly precision.',
    species: 'ice_wraith',
    rarity: 'uncommon',
    frostPower: 34,
    summonCost: 50,
    abilities: ['Phantom Strike', 'Memory Freeze', 'Rime Shroud'],
    lore: 'The Rime Phantom still believes it is alive. It patrols the Spectral Frost Chamber endlessly, guarding a throne that no longer exists.',
    stats: { attack: 26, defense: 16, speed: 22, magic: 30, hp: 80 },
  },
  {
    id: 'permafrost_sentinel',
    name: 'Permafrost Sentinel',
    description:
      'An upgraded snow golem whose core has been replaced with ancient permafrost. Its awareness extends to every corner of its assigned chamber.',
    species: 'snow_golem',
    rarity: 'uncommon',
    frostPower: 38,
    summonCost: 55,
    abilities: ['Permafrost Slam', 'Glacial Repair', 'Aura of Cold'],
    lore: 'When a Permafrost Sentinel is destroyed, the cold it releases freezes the killer solid for exactly one year and one day.',
    stats: { attack: 22, defense: 32, speed: 3, magic: 12, hp: 120 },
  },
  {
    id: 'storm_rider_hawk',
    name: 'Storm Rider Hawk',
    description:
      'A blizzard hawk that has learned to ride within the eye of storms. Its ice-crystal feathers create prismatic auroras as it flies.',
    species: 'blizzard_hawk',
    rarity: 'uncommon',
    frostPower: 32,
    summonCost: 48,
    abilities: ['Wind Shear', 'Aurora Dive', 'Storm Sense'],
    lore: 'Storm Rider Hawks can predict storms three days before they form. Monarchs prize them above all other scouts.',
    stats: { attack: 24, defense: 14, speed: 34, magic: 20, hp: 70 },
  },
  {
    id: 'frostguard_veteran',
    name: 'Frostguard Veteran',
    description:
      'A permafrost knight whose armor has fully bonded with their flesh. Their frozen heart beats once per hour, yet they fight with undiminished vigor.',
    species: 'permafrost_knight',
    rarity: 'uncommon',
    frostPower: 36,
    summonCost: 52,
    abilities: ['Permafrost Blade', 'Frost Counter', 'Icy Resolve'],
    lore: 'Frostguard Veterans have fought in so many battles that they no longer feel pain. Their armor is seamless with their body.',
    stats: { attack: 28, defense: 26, speed: 12, magic: 10, hp: 95 },
  },
  {
    id: 'rimeborn_giant',
    name: 'Rimeborn Giant',
    description:
      'A frost giant that was born during a rime ice event, giving it an extra layer of razor-sharp crystalline armor over its ice body.',
    species: 'frost_giant',
    rarity: 'uncommon',
    frostPower: 40,
    summonCost: 58,
    abilities: ['Rime Fists', 'Avalanche Stomp', 'Hail Summon'],
    lore: 'Rimeborn Giants are considered blessed among frost giants. The rime ice that coats them never melts, even in volcanic heat.',
    stats: { attack: 34, defense: 28, speed: 5, magic: 14, hp: 140 },
  },
  {
    id: 'crystal_enchantress',
    name: 'Crystal Enchantress',
    description:
      'A crystal queen who has mastered basic enchantment magic. She can imbue ordinary ice with magical properties, creating temporary guardians and barriers.',
    species: 'crystal_queen',
    rarity: 'uncommon',
    frostPower: 35,
    summonCost: 54,
    abilities: ['Crystal Bolt', 'Ice Barrier', 'Frost Weave'],
    lore: 'Crystal Enchantresses spend centuries studying the lattice structures of ice. Their knowledge of crystalline geometry is unmatched.',
    stats: { attack: 16, defense: 18, speed: 14, magic: 38, hp: 75 },
  },
  {
    id: 'frostwyrm_juvenile',
    name: 'Frostwyrm Juvenile',
    description:
      'A young glacial wyrm that has grown large enough to tunnel through solid ice. Its burrows create networks of frozen tunnels.',
    species: 'glacial_wyrm',
    rarity: 'uncommon',
    frostPower: 37,
    summonCost: 56,
    abilities: ['Tunnel Rush', 'Frost Breath', 'Ice Cocoon'],
    lore: 'Frostwyrm Juveniles create elaborate tunnel systems that later become the foundation of throne chambers.',
    stats: { attack: 30, defense: 22, speed: 20, magic: 16, hp: 100 },
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'phantom_monarch',
    name: 'Phantom Monarch',
    description:
      'An ice wraith that has absorbed the essence of a fallen frost monarch. It commands lesser wraiths and can freeze entire halls with a single gaze.',
    species: 'ice_wraith',
    rarity: 'rare',
    frostPower: 65,
    summonCost: 200,
    abilities: ['Monarch Gaze', 'Wraith Legion', 'Absolute Zero Touch', 'Spectral Blizzard'],
    lore: 'The Phantom Monarch does not remember being alive. It rules its spectral court with the same authority it held in life.',
    stats: { attack: 48, defense: 36, speed: 28, magic: 62, hp: 200 },
  },
  {
    id: 'ancient_permafrost_golem',
    name: 'Ancient Permafrost Golem',
    description:
      'A golem constructed from permafrost that predates the first frost monarch. Its runes glow with primordial cold energy.',
    species: 'snow_golem',
    rarity: 'rare',
    frostPower: 70,
    summonCost: 220,
    abilities: ['Primordial Slam', 'Permafrost Wall', 'Eternal Watch', 'Frostquake'],
    lore: 'This golem was built before the concept of monarchy existed. It simply guards, having forgotten whom it was built to serve.',
    stats: { attack: 40, defense: 55, speed: 2, magic: 30, hp: 300 },
  },
  {
    id: 'tempest_sovereign_hawk',
    name: 'Tempest Sovereign Hawk',
    description:
      'A blizzard hawk that has achieved dominance over an entire storm system. Its wings span forty feet and create perpetual blizzards as it flies.',
    species: 'blizzard_hawk',
    rarity: 'rare',
    frostPower: 62,
    summonCost: 190,
    abilities: ['Tempest Call', 'Aurora Storm', 'Wind Wall', 'Falcon Dive'],
    lore: 'There can only be one Tempest Sovereign Hawk per storm system. When two meet, the resulting battle lasts for decades.',
    stats: { attack: 44, defense: 30, speed: 52, magic: 40, hp: 160 },
  },
  {
    id: 'frostwarden_commander',
    name: 'Frostwarden Commander',
    description:
      'A permafrost knight who commands an entire garrison. Their frozen heart has been replaced with a crystal of eternal frost.',
    species: 'permafrost_knight',
    rarity: 'rare',
    frostPower: 68,
    summonCost: 210,
    abilities: ['Commander Strike', 'Frost Formation', 'Permafrost Bastion', 'Rally Cry'],
    lore: 'The Frostwarden Commander has never retreated. Not because of bravery, but because the cold in their veins will not allow it.',
    stats: { attack: 52, defense: 48, speed: 16, magic: 28, hp: 250 },
  },
  {
    id: 'glacier_colossus',
    name: 'Glacier Colossus',
    description:
      'A frost giant of immense size, carved from a living glacier by the combined efforts of a dozen monarchs. Its body is a walking ice age.',
    species: 'frost_giant',
    rarity: 'rare',
    frostPower: 72,
    summonCost: 240,
    abilities: ['Colossus Slam', 'Glacier Surge', 'Eternal Winter Aura', 'Ice Age Step'],
    lore: 'The Glacier Colossus was so large it took three hundred years to carve. When it walks, the landscape permanently changes.',
    stats: { attack: 58, defense: 42, speed: 3, magic: 20, hp: 350 },
  },
  {
    id: 'crystal_archmage',
    name: 'Crystal Archmage',
    description:
      'A crystal queen whose mastery of ice magic has elevated her to archmage status. She can reshape the crystal lattice of reality itself.',
    species: 'crystal_queen',
    rarity: 'rare',
    frostPower: 66,
    summonCost: 205,
    abilities: ['Crystal Storm', 'Lattice Rewrite', 'Diamond Barrier', 'Frost Omniscience'],
    lore: 'The Crystal Archmage can see through any ice in the realm. Every icicle is an eye, every snowflake a sensor.',
    stats: { attack: 30, defense: 32, speed: 18, magic: 68, hp: 180 },
  },
  {
    id: 'glacial_tyrant_wyrm',
    name: 'Glacial Tyrant Wyrm',
    description:
      'A fully mature glacial wyrm that has claimed dominion over an underground glacier network. Its tunnels span hundreds of miles.',
    species: 'glacial_wyrm',
    rarity: 'rare',
    frostPower: 74,
    summonCost: 250,
    abilities: ['Tyrant Devour', 'Glacial Eruption', 'Permafrost Tunnel', 'Frost Maw'],
    lore: 'The Glacial Tyrant Wyrm has not surfaced in a thousand years. When it does, the ground cracks and lakes freeze instantly.',
    stats: { attack: 60, defense: 38, speed: 28, magic: 35, hp: 280 },
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'wraith_sovereign',
    name: 'Wraith Sovereign',
    description:
      'The supreme ruler of all ice wraiths in a sector. Its spectral form blots out the stars and its presence drops temperatures to absolute zero.',
    species: 'ice_wraith',
    rarity: 'epic',
    frostPower: 110,
    summonCost: 800,
    abilities: ['Sovereign Wail', 'Legion of Shadows', 'Absolute Freeze', 'Wraith Domain', 'Eternal Grief'],
    lore: 'The Wraith Sovereign was once a beloved queen who froze herself to save her people. Now she exists between life and death.',
    stats: { attack: 78, defense: 58, speed: 38, magic: 95, hp: 400 },
  },
  {
    id: 'permafrost_titan',
    name: 'Permafrost Titan',
    description:
      'The largest golem ever constructed, standing three hundred feet tall. Its body is a monument to the art of frost engineering.',
    species: 'snow_golem',
    rarity: 'epic',
    frostPower: 105,
    summonCost: 750,
    abilities: ['Titan Fist', 'Glacier Shield', 'Permanent Sentinel', 'Frostquake', 'Monument Aura'],
    lore: 'The Permafrost Titan was built as a monument that became sentient. It does not serve any monarch — it is a monarch.',
    stats: { attack: 70, defense: 90, speed: 1, magic: 50, hp: 600 },
  },
  {
    id: 'blizzard_emperor_hawk',
    name: 'Blizzard Emperor Hawk',
    description:
      'The undisputed ruler of all blizzard hawks across every storm system. Its wings create weather patterns visible from orbit.',
    species: 'blizzard_hawk',
    rarity: 'epic',
    frostPower: 100,
    summonCost: 700,
    abilities: ['Emperor Dive', 'Supercell', 'Absolute Wind Control', 'Aurora Crown', 'Storm Dominion'],
    lore: 'The Blizzard Emperor Hawk has never landed. It sleeps while flying, eats while flying, and breeds while flying.',
    stats: { attack: 65, defense: 48, speed: 80, magic: 60, hp: 320 },
  },
  {
    id: 'permafrost_legionnaire',
    name: 'Permafrost Legionnaire',
    description:
      'A knight whose frozen heart has been replaced with the Heart of Winter — a mythical organ that grants infinite stamina and absolute cold immunity.',
    species: 'permafrost_knight',
    rarity: 'epic',
    frostPower: 108,
    summonCost: 780,
    abilities: ['Winter Heart Strike', 'Permafrost Legion', 'Absolute Defense', 'Frost Vow', 'Eternal Vigil'],
    lore: 'The Permafrost Legionnaire cannot die by conventional means. Destroying the body only releases a wave of absolute cold.',
    stats: { attack: 85, defense: 75, speed: 22, magic: 45, hp: 450 },
  },
  {
    id: 'rimeforged_behemoth',
    name: 'Rimeforged Behemoth',
    description:
      'A frost giant that was forged rather than born, created when a falling star struck a glacier during the deepest winter ever recorded.',
    species: 'frost_giant',
    rarity: 'epic',
    frostPower: 115,
    summonCost: 850,
    abilities: ['Behemoth Crush', 'Star-Frost Beam', 'Rime Barrier', 'Eternal Blizzard', 'World Freeze'],
    lore: 'The Rimeforged Behemoth contains a piece of a dead star. At night, its body glows with cold celestial light.',
    stats: { attack: 95, defense: 65, speed: 5, magic: 55, hp: 550 },
  },
  {
    id: 'crystal_empress',
    name: 'Crystal Empress',
    description:
      'The supreme crystal queen who rules the entire crystal lattice network. Her crown touches every crystal in the realm simultaneously.',
    species: 'crystal_queen',
    rarity: 'epic',
    frostPower: 112,
    summonCost: 820,
    abilities: ['Empress Command', 'Lattice Collapse', 'Diamond Storm', 'Crystal Domination', 'Frost Reality'],
    lore: 'The Crystal Empress is not one being but seven, each controlling a facet of reality. They speak in perfect unison.',
    stats: { attack: 50, defense: 55, speed: 25, magic: 105, hp: 380 },
  },
  {
    id: 'primordial_glacial_wyrm',
    name: 'Primordial Glacial Wyrm',
    description:
      'A glacial wyrm so ancient it was alive when the first ice formed on the planet. Its scales contain the memory of every winter in history.',
    species: 'glacial_wyrm',
    rarity: 'epic',
    frostPower: 118,
    summonCost: 900,
    abilities: ['Primordial Devour', 'Memory Frost', 'Glacier Realm', 'Time Freeze', 'Eternal Slumber'],
    lore: 'The Primordial Wyrm sleeps beneath the North Pole. Its dreams are what we call ice ages.',
    stats: { attack: 88, defense: 50, speed: 35, magic: 70, hp: 500 },
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'spectral_frost_monarch',
    name: 'Spectral Frost Monarch',
    description:
      'The ghost of the very first frost monarch, whose will is so powerful that even death could not end their reign. They command all ice wraiths across all dimensions.',
    species: 'ice_wraith',
    rarity: 'legendary',
    frostPower: 170,
    summonCost: 3000,
    abilities: ['Monarch Decree', 'Absolute Zero Domain', 'Spectral Throne', 'Eternal Winter', 'Frost Dominion', 'Wraith Apex'],
    lore: 'The Spectral Frost Monarch invented winter. Before them, the world knew only scorching heat and mild autumn.',
    stats: { attack: 120, defense: 90, speed: 50, magic: 150, hp: 800 },
  },
  {
    id: 'eternal_permafrost_colossus',
    name: 'Eternal Permafrost Colossus',
    description:
      'A golem of planetary scale, so large it serves as the foundation for three throne chambers. Its core contains the frozen essence of a dead god.',
    species: 'snow_golem',
    rarity: 'legendary',
    frostPower: 165,
    summonCost: 2800,
    abilities: ['Planetary Slam', 'Core Unleash', 'Eternal Foundation', 'Divine Frost', 'World Pillar', 'Absolute Sentinel'],
    lore: 'The Eternal Colossus does not know it is a golem. It believes it is the planet, and the planet agrees.',
    stats: { attack: 100, defense: 150, speed: 0, magic: 80, hp: 1200 },
  },
  {
    id: 'storm_matriarch_hawk',
    name: 'Storm Matriarch Hawk',
    description:
      'The progenitor of all blizzard hawks, a being older than the atmosphere itself. Her wings create the jet stream and her tears become hailstones.',
    species: 'blizzard_hawk',
    rarity: 'legendary',
    frostPower: 160,
    summonCost: 2600,
    abilities: ['Matriarch Call', 'Atmospheric Control', 'Eternal Storm', 'Aurora Genesis', 'Wind God', 'Frozen Sky'],
    lore: 'The Storm Matriarch laid the first egg on the first mountain during the first winter. All hawks descend from her.',
    stats: { attack: 90, defense: 70, speed: 120, magic: 110, hp: 600 },
  },
  {
    id: 'winter_forged_sovereign',
    name: 'Winter Forged Sovereign',
    description:
      'A permafrost knight who has achieved the ultimate fusion of flesh, ice, and crystal. They are more concept than creature — the embodiment of eternal vigilance.',
    species: 'permafrost_knight',
    rarity: 'legendary',
    frostPower: 175,
    summonCost: 3200,
    abilities: ['Sovereign Blade', 'Eternal Oath', 'Absolute Guard', 'Permafrost Empire', 'Frozen Eternity', 'Winter Apex'],
    lore: 'The Winter Forged Sovereign made a pact with winter itself. They are not a knight of winter — they are winter.',
    stats: { attack: 140, defense: 120, speed: 30, magic: 100, hp: 900 },
  },
  {
    id: 'absolute_frost_titan',
    name: 'Absolute Frost Titan',
    description:
      'The largest frost giant to ever exist, standing taller than the atmosphere. It is visible from space as a pillar of eternal ice reaching into the void.',
    species: 'frost_giant',
    rarity: 'legendary',
    frostPower: 180,
    summonCost: 3500,
    abilities: ['Titan Roar', 'Atmospheric Freeze', 'World Crack', 'Eternal Glacier', 'Absolute Cold', 'Primeval Frost'],
    lore: 'The Absolute Frost Titan is so cold that even other frost giants shiver in its presence. Space itself warms near it.',
    stats: { attack: 160, defense: 100, speed: 2, magic: 120, hp: 1100 },
  },
  {
    id: 'crystal_cosmos_queen',
    name: 'Crystal Cosmos Queen',
    description:
      'The crystal queen whose lattice network extends beyond the atmosphere, connecting to ice crystals in the rings of Saturn. She sees through every snowflake in the galaxy.',
    species: 'crystal_queen',
    rarity: 'legendary',
    frostPower: 168,
    summonCost: 2900,
    abilities: ['Cosmic Crystal', 'Galactic Frost', 'Lattice Omniscience', 'Diamond Universe', 'Eternal Magic', 'Crystal Apex'],
    lore: 'The Crystal Cosmos Queen discovered that the universe is a crystal. She is slowly teaching it to sing.',
    stats: { attack: 80, defense: 80, speed: 40, magic: 160, hp: 700 },
  },
  {
    id: 'world_eater_glacial_wyrm',
    name: 'World Eater Glacial Wyrm',
    description:
      'A glacial wyrm of incomprehensible scale that encircles the planet, burrowing through the mantle. Its hunger is the force that drives continental drift.',
    species: 'glacial_wyrm',
    rarity: 'legendary',
    frostPower: 185,
    summonCost: 3800,
    abilities: ['World Devour', 'Mantle Breath', 'Continental Freeze', 'Core Frost', 'Eternal Hunger', 'Planetary Wyrm'],
    lore: 'The World Eater is not evil. It is simply hungry, and the world is the only thing large enough to satisfy it.',
    stats: { attack: 170, defense: 80, speed: 60, magic: 90, hp: 1500 },
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: BT_THRONES — 8 Throne Locations
// ═══════════════════════════════════════════════════════════════════

export const BT_THRONES: readonly BTThroneDef[] = [
  {
    id: 'frost_gate_chamber',
    name: 'Frost Gate Chamber',
    description:
      'The outermost throne chamber, a vaulted hall of translucent ice where travelers first enter the blizzard realm. The Frost Gate is a massive doorway carved from a single glacier that has never thawed since the dawn of the first winter. Its arch is inscribed with frost runes that only activate when a monarch approaches.',
    minLevel: 1,
    unlockCost: 0,
    bonuses: ['Basic guardian summoning', 'Frost shard gathering', 'Snow golem patrol'],
    element: 'snow_golem',
  },
  {
    id: 'spectral_frost_chamber',
    name: 'Spectral Frost Chamber',
    description:
      'A haunting hall where the walls are made of frozen mist and the ceiling reflects the aurora borealis. Ice wraiths congregate here in the thousands, their whispers creating an ethereal chorus that echoes through every corridor. The throne here is carved from the ice of a frozen lake that reflects the memories of the dead.',
    minLevel: 5,
    unlockCost: 200,
    bonuses: ['Ice wraith summoning bonus', 'Spectral material extraction', 'Wraith communion'],
    element: 'ice_wraith',
  },
  {
    id: 'storm_eye_aerie',
    name: 'Storm Eye Aerie',
    description:
      'An open-air throne perched at the exact center of a perpetual cyclone. Despite the raging blizzard that surrounds it, the eye of the storm is perfectly calm and silent. Blizzard hawks nest in the frozen pillars that support the throne platform, and their calls can be heard across the entire realm.',
    minLevel: 10,
    unlockCost: 500,
    bonuses: ['Blizzard hawk enhancement', 'Storm energy harvesting', 'Atmospheric control'],
    element: 'blizzard_hawk',
  },
  {
    id: 'permafrost_keep',
    name: 'Permafrost Keep',
    description:
      'A fortress throne carved deep into ancient permafrost that has remained frozen for millions of years. Its walls contain fossils of creatures that lived before the ice ages, and the temperature inside never rises above minus forty degrees. Snow golems stand sentinel in every corridor, their frost runes burning with cold blue light.',
    minLevel: 15,
    unlockCost: 1200,
    bonuses: ['Structure defense multiplier', 'Permafrost ore mining', 'Golem reinforcement'],
    element: 'snow_golem',
  },
  {
    id: 'frozen_bastion',
    name: 'Frozen Bastion',
    description:
      'The primary military throne of the blizzard realm, a vast fortress where permafrost knights drill and train. Its armory contains weapons forged from every ice age in history, and its training grounds simulate every blizzard condition imaginable. The throne here is made of frozen iron — the only metal that thrives in absolute cold.',
    minLevel: 20,
    unlockCost: 2000,
    bonuses: ['Knight combat bonuses', 'Frost weapon forging', 'Battle cry amplification'],
    element: 'permafrost_knight',
  },
  {
    id: 'glacial_peak_throne',
    name: 'Glacial Peak Throne',
    description:
      'A throne located at the summit of the tallest peak in the blizzard realm, above the clouds where frost giants rule. The air here is so thin that only frost giants can breathe it comfortably. The throne itself is a massive block of blue ice that glows from within with the light of captured auroras.',
    minLevel: 25,
    unlockCost: 3000,
    bonuses: ['Giant power amplification', 'Glacier ore refinement', 'Avalanche control'],
    element: 'frost_giant',
  },
  {
    id: 'eternal_ice_hall',
    name: 'Eternal Ice Hall',
    description:
      'A throne hall deep underground where glacial wyrms have tunneled for millennia. The ceiling is the belly of a glacier, and the walls are the burrow walls of ancient wyrms whose scales have fused with the ice. Bioluminescent frost fungi light the hall in shades of blue and green.',
    minLevel: 30,
    unlockCost: 5000,
    bonuses: ['Wyrm tunnel network access', 'Deep crystal mining', 'Underground navigation'],
    element: 'glacial_wyrm',
  },
  {
    id: 'crystal_sovereign_chamber',
    name: 'Crystal Sovereign Chamber',
    description:
      'The innermost and most sacred throne, located at the nexus of all crystal lattice lines in the realm. Everything here is made of perfect crystal — the throne, the walls, the floor, even the air itself is laced with frozen crystalline particles. Crystal queens meditate here, connecting their consciousness to every ice crystal in existence.',
    minLevel: 40,
    unlockCost: 10000,
    bonuses: ['Crystal network omniscience', 'Legendary material forging', 'Reality lattice access'],
    element: 'crystal_queen',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: BT_MATERIALS — 30 Ice/Crystal Materials
// ═══════════════════════════════════════════════════════════════════

export const BT_MATERIALS: readonly BTMaterialDef[] = [
  { id: 'frost_shard', name: 'Frost Shard', description: 'A sharp fragment of enchanted ice harvested from frost formations.', rarity: 'common', source: 'Frost Gate Chamber', value: 5, category: 'frost' },
  { id: 'snow_dust', name: 'Snow Dust', description: 'Fine crystalline powder that falls during light snowfall.', rarity: 'common', source: 'All outdoor locations', value: 2, category: 'frost' },
  { id: 'ice_pebble', name: 'Ice Pebble', description: 'A small round stone of clear ice found in frozen streams.', rarity: 'common', source: 'Frozen riverbeds', value: 3, category: 'frost' },
  { id: 'rime_crystal', name: 'Rime Crystal', description: 'A small crystal formed when supercooled water freezes instantly on contact.', rarity: 'common', source: 'Spectral Frost Chamber', value: 6, category: 'crystal' },
  { id: 'hailstone_core', name: 'Hailstone Core', description: 'The perfectly spherical center of a giant hailstone.', rarity: 'common', source: 'Storm Eye Aerie', value: 4, category: 'storm' },
  { id: 'frost_weave', name: 'Frost Weave', description: 'Silk-like threads spun from frozen spider webs.', rarity: 'uncommon', source: 'Spectral Frost Chamber', value: 18, category: 'frost' },
  { id: 'glacier_shard', name: 'Glacier Shard', description: 'A fragment of ancient glacier ice containing compressed air bubbles.', rarity: 'uncommon', source: 'Glacial Peak Throne', value: 22, category: 'glacier' },
  { id: 'aurora_dust', name: 'Aurora Dust', description: 'Luminescent particles shed by auroras during peak activity.', rarity: 'uncommon', source: 'Crystal Sovereign Chamber', value: 25, category: 'aurora' },
  { id: 'permafrost_gem', name: 'Permafrost Gem', description: 'A gemstone formed under permafrost over thousands of years.', rarity: 'uncommon', source: 'Permafrost Keep', value: 28, category: 'permafrost' },
  { id: 'storm_crystal', name: 'Storm Crystal', description: 'A crystal that grows inside thunderclouds during blizzards.', rarity: 'uncommon', source: 'Storm Eye Aerie', value: 20, category: 'storm' },
  { id: 'ice_spider_silk', name: 'Ice Spider Silk', description: 'Silk harvested from ice spiders that weave frost nets.', rarity: 'uncommon', source: 'Permafrost Keep', value: 24, category: 'frost' },
  { id: 'blizzard_essence', name: 'Blizzard Essence', description: 'Concentrated storm energy captured from the heart of a blizzard.', rarity: 'rare', source: 'Storm Eye Aerie', value: 65, category: 'storm' },
  { id: 'frost_diamond', name: 'Frost Diamond', description: 'A diamond formed under extreme cold pressure, harder than normal diamonds.', rarity: 'rare', source: 'Glacial Peak Throne', value: 80, category: 'crystal' },
  { id: 'glacier_heart', name: 'Glacier Heart', description: 'The core of an ancient glacier that still pulses with cold energy.', rarity: 'rare', source: 'Glacial Peak Throne', value: 85, category: 'glacier' },
  { id: 'permafrost_ingot', name: 'Permafrost Ingot', description: 'A refined bar of permafrost ore used in frost weapon forging.', rarity: 'rare', source: 'Permafrost Keep', value: 70, category: 'permafrost' },
  { id: 'spectral_ice', name: 'Spectral Ice', description: 'Ice that exists partially in the spirit realm, glowing with ethereal light.', rarity: 'rare', source: 'Spectral Frost Chamber', value: 75, category: 'crystal' },
  { id: 'aurora_crystal', name: 'Aurora Crystal', description: 'A large crystal infused with aurora energy, shimmering with rainbow hues.', rarity: 'rare', source: 'Crystal Sovereign Chamber', value: 90, category: 'aurora' },
  { id: 'wyrm_scale', name: 'Wyrm Scale', description: 'A scale shed by a glacial wyrm, incredibly hard and cold to the touch.', rarity: 'rare', source: 'Eternal Ice Hall', value: 78, category: 'glacier' },
  { id: 'frost_monarch_shard', name: 'Frost Monarch Shard', description: 'A fragment of a monarch throne, containing residual ruling power.', rarity: 'epic', source: 'Any claimed throne', value: 200, category: 'frost' },
  { id: 'eternal_ice_sample', name: 'Eternal Ice Sample', description: 'Ice that will never melt under any circumstances, no matter the heat.', rarity: 'epic', source: 'Crystal Sovereign Chamber', value: 250, category: 'glacier' },
  { id: 'permafrost_steel', name: 'Permafrost Steel', description: 'An alloy of permafrost ore and frost diamonds, nearly indestructible.', rarity: 'epic', source: 'Frozen Bastion', value: 220, category: 'permafrost' },
  { id: 'aurora_pearl', name: 'Aurora Pearl', description: 'A luminous pearl formed when aurora light solidifies inside a snow oyster.', rarity: 'epic', source: 'Crystal Sovereign Chamber', value: 240, category: 'aurora' },
  { id: 'storm_eye_core', name: 'Storm Eye Core', description: 'The perfectly calm center of a blizzard, crystallized into solid form.', rarity: 'epic', source: 'Storm Eye Aerie', value: 230, category: 'storm' },
  { id: 'wraith_essence', name: 'Wraith Essence', description: 'The concentrated sorrow of a thousand ice wraiths, a potent magical reagent.', rarity: 'epic', source: 'Spectral Frost Chamber', value: 210, category: 'frost' },
  { id: 'cosmic_ice', name: 'Cosmic Ice', description: 'Ice that fell from space, containing traces of extraterrestrial frost.', rarity: 'legendary', source: 'Crystal Sovereign Chamber', value: 600, category: 'aurora' },
  { id: 'world_frost_core', name: 'World Frost Core', description: 'A sample of ice from the planet mantle, containing primordial cold energy.', rarity: 'legendary', source: 'Eternal Ice Hall', value: 700, category: 'glacier' },
  { id: 'absolute_zero_crystal', name: 'Absolute Zero Crystal', description: 'A crystal that exists at absolute zero temperature, defying thermodynamics.', rarity: 'legendary', source: 'Crystal Sovereign Chamber', value: 800, category: 'crystal' },
  { id: 'eternal_blizzard_heart', name: 'Eternal Blizzard Heart', description: 'The heart of a perpetual blizzard, pulsing with infinite storm energy.', rarity: 'legendary', source: 'Storm Eye Aerie', value: 750, category: 'storm' },
  { id: 'monarch_ice_crown', name: 'Monarch Ice Crown', description: 'A crown of eternal ice once worn by the first frost monarch.', rarity: 'legendary', source: 'Frost Gate Chamber (hidden)', value: 900, category: 'frost' },
  { id: 'permafrost_heart_of_winter', name: 'Heart of Winter', description: 'The legendary core of winter itself, from which all cold in the universe originates.', rarity: 'legendary', source: 'Glacial Peak Throne (hidden)', value: 1000, category: 'permafrost' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: BT_STRUCTURES — 25 Throne Structures
// ═══════════════════════════════════════════════════════════════════

export const BT_STRUCTURES: readonly BTStructureDef[] = [
  { id: 'ice_wall', name: 'Ice Wall', description: 'A reinforced wall of enchanted ice protecting the throne approach.', baseCost: 50, costMultiplier: 1.5, maxLevel: 10, category: 'defense' },
  { id: 'frozen_barracks', name: 'Frozen Barracks', description: 'Housing for guardian forces stationed at the throne.', baseCost: 100, costMultiplier: 1.6, maxLevel: 8, category: 'summoning' },
  { id: 'crystal_tower', name: 'Crystal Tower', description: 'A tower of living crystal that amplifies frost magic in the surrounding area.', baseCost: 200, costMultiplier: 1.8, maxLevel: 10, category: 'enchantment' },
  { id: 'glacier_quarry', name: 'Glacier Quarry', description: 'A mining operation that extracts glacier ore from nearby ice formations.', baseCost: 80, costMultiplier: 1.4, maxLevel: 12, category: 'production' },
  { id: 'frost_forge', name: 'Frost Forge', description: 'A forge that uses extreme cold instead of heat to shape materials.', baseCost: 150, costMultiplier: 1.7, maxLevel: 10, category: 'production' },
  { id: 'snow_archive', name: 'Snow Archive', description: 'A library where knowledge is stored in ice crystals that can be read by touch.', baseCost: 120, costMultiplier: 1.5, maxLevel: 8, category: 'storage' },
  { id: 'permafrost_vault', name: 'Permafrost Vault', description: 'A secure storage vault carved into permafrost, keeping items perfectly preserved.', baseCost: 180, costMultiplier: 1.6, maxLevel: 10, category: 'storage' },
  { id: 'blizzard_beacon', name: 'Blizzard Beacon', description: 'A beacon that generates protective blizzards around the throne perimeter.', baseCost: 250, costMultiplier: 2.0, maxLevel: 8, category: 'defense' },
  { id: 'aurora_panel', name: 'Aurora Panel', description: 'A device that harvests aurora energy to power throne enchantments.', baseCost: 300, costMultiplier: 1.9, maxLevel: 6, category: 'enchantment' },
  { id: 'ice_bridge', name: 'Ice Bridge', description: 'A crystalline bridge connecting throne chambers across frozen chasms.', baseCost: 90, costMultiplier: 1.3, maxLevel: 5, category: 'defense' },
  { id: 'frost_laboratory', name: 'Frost Laboratory', description: 'A research facility for developing new frost enchantments and guardian upgrades.', baseCost: 350, costMultiplier: 2.0, maxLevel: 8, category: 'enchantment' },
  { id: 'wyrm_tunnel_gate', name: 'Wyrm Tunnel Gate', description: 'A controlled entrance to the glacial wyrm tunnel network.', baseCost: 200, costMultiplier: 1.7, maxLevel: 6, category: 'defense' },
  { id: 'crystal_greenhouse', name: 'Crystal Greenhouse', description: 'A greenhouse where frost-resistant crystal plants are cultivated for materials.', baseCost: 160, costMultiplier: 1.5, maxLevel: 10, category: 'production' },
  { id: 'rime_bastion', name: 'Rime Bastion', description: 'An elevated defensive platform coated in razor-sharp rime ice.', baseCost: 280, costMultiplier: 1.8, maxLevel: 8, category: 'defense' },
  { id: 'spectral_shrine', name: 'Spectral Shrine', description: 'A shrine where ice wraiths commune, granting bonuses to spectral guardians.', baseCost: 220, costMultiplier: 1.7, maxLevel: 6, category: 'enchantment' },
  { id: 'storm_generator', name: 'Storm Generator', description: 'A device that creates controlled blizzards for energy harvesting.', baseCost: 400, costMultiplier: 2.2, maxLevel: 6, category: 'production' },
  { id: 'frost_infirmary', name: 'Frost Infirmary', description: 'A healing facility where guardians are restored using cryogenic therapy.', baseCost: 140, costMultiplier: 1.5, maxLevel: 8, category: 'production' },
  { id: 'permafrost_armory', name: 'Permafrost Armory', description: 'An armory storing weapons forged from permafrost steel and eternal ice.', baseCost: 320, costMultiplier: 1.9, maxLevel: 8, category: 'storage' },
  { id: 'ice_labyrinth', name: 'Ice Labyrinth', description: 'A maze of ice walls that confuses and traps intruders approaching the throne.', baseCost: 260, costMultiplier: 1.8, maxLevel: 5, category: 'defense' },
  { id: 'glacier_dock', name: 'Glacier Dock', description: 'A docking platform on a frozen lake for ice barges and transport.', baseCost: 110, costMultiplier: 1.4, maxLevel: 6, category: 'production' },
  { id: 'aurora_observatory', name: 'Aurora Observatory', description: 'An observation deck that monitors aurora activity for predictive enchantments.', baseCost: 380, costMultiplier: 2.1, maxLevel: 4, category: 'enchantment' },
  { id: 'cryo_chamber', name: 'Cryo Chamber', description: 'A deep-freeze chamber for storing legendary artifacts and rare guardians.', baseCost: 450, costMultiplier: 2.0, maxLevel: 5, category: 'storage' },
  { id: 'throneroom_expansion', name: 'Throneroom Expansion', description: 'An expansion wing added to the throne chamber, increasing its power and capacity.', baseCost: 500, costMultiplier: 2.5, maxLevel: 4, category: 'enchantment' },
  { id: 'eternal_guard_post', name: 'Eternal Guard Post', description: 'A permanent guard station that never needs rest, powered by ambient frost energy.', baseCost: 200, costMultiplier: 1.6, maxLevel: 10, category: 'defense' },
  { id: 'winter_monument', name: 'Winter Monument', description: 'A monument commemorating frost monarch achievements, providing realm-wide bonuses.', baseCost: 600, costMultiplier: 3.0, maxLevel: 3, category: 'enchantment' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: BT_ABILITIES — 22 Ice Abilities
// ═══════════════════════════════════════════════════════════════════

export const BT_ABILITIES: readonly BTAbilityDef[] = [
  { id: 'frost_breath', name: 'Frost Breath', description: 'Exhale a cone of freezing air that damages and slows all enemies.', cooldown: 3, power: 20, element: 'frost_giant', energyCost: 5 },
  { id: 'glacier_shield', name: 'Glacier Shield', description: 'Summon a wall of glacial ice that absorbs incoming damage.', cooldown: 8, power: 35, element: 'snow_golem', energyCost: 10 },
  { id: 'blizzard_call', name: 'Blizzard Call', description: 'Summon a localized blizzard that reduces visibility and damages enemies.', cooldown: 15, power: 50, element: 'blizzard_hawk', energyCost: 15 },
  { id: 'permafrost_bind', name: 'Permafrost Bind', description: 'Encase a target in permafrost, immobilizing them.', cooldown: 10, power: 40, element: 'permafrost_knight', energyCost: 12 },
  { id: 'crystal_shatter', name: 'Crystal Shatter', description: 'Cause nearby ice crystals to shatter, sending sharp fragments in all directions.', cooldown: 6, power: 30, element: 'crystal_queen', energyCost: 8 },
  { id: 'wraith_phase', name: 'Wraith Phase', description: 'Phase into the spectral plane, becoming immune to physical damage briefly.', cooldown: 12, power: 25, element: 'ice_wraith', energyCost: 10 },
  { id: 'wyrm_burrow', name: 'Wyrm Burrow', description: 'Tunnel through ice to ambush enemies from below.', cooldown: 8, power: 45, element: 'glacial_wyrm', energyCost: 12 },
  { id: 'absolute_freeze', name: 'Absolute Freeze', description: 'Drop the temperature to near absolute zero in a small area.', cooldown: 20, power: 70, element: 'ice_wraith', energyCost: 25 },
  { id: 'hailstorm_barrage', name: 'Hailstorm Barrage', description: 'Call down a devastating hailstorm on the target area.', cooldown: 14, power: 55, element: 'blizzard_hawk', energyCost: 18 },
  { id: 'ice_mirage', name: 'Ice Mirage', description: 'Create illusory copies of guardians from ice and mist.', cooldown: 10, power: 30, element: 'ice_wraith', energyCost: 12 },
  { id: 'frostquake', name: 'Frostquake', description: 'Shatter the ground ice, creating tremors that knock enemies down.', cooldown: 18, power: 60, element: 'frost_giant', energyCost: 22 },
  { id: 'crystal_lance', name: 'Crystal Lance', description: 'Fire a concentrated beam of crystal energy at a single target.', cooldown: 5, power: 40, element: 'crystal_queen', energyCost: 10 },
  { id: 'permafrost_fortress', name: 'Permafrost Fortress', description: 'Raise an impenetrable fortress of permafrost around the throne.', cooldown: 30, power: 80, element: 'snow_golem', energyCost: 30 },
  { id: 'aurora_blind', name: 'Aurora Blind', description: 'Release a burst of aurora light that blinds all enemies.', cooldown: 12, power: 35, element: 'crystal_queen', energyCost: 14 },
  { id: 'storm_eye', name: 'Storm Eye', description: 'Create a calm eye in the blizzard, allowing allies to regroup.', cooldown: 25, power: 45, element: 'blizzard_hawk', energyCost: 20 },
  { id: 'wyrm_fury', name: 'Wyrm Fury', description: 'Enter a berserk state where frost breath and speed are tripled.', cooldown: 20, power: 65, element: 'glacial_wyrm', energyCost: 22 },
  { id: 'rime_prison', name: 'Rime Prison', description: 'Enclose an area in rime ice bars, trapping everything inside.', cooldown: 16, power: 50, element: 'frost_giant', energyCost: 18 },
  { id: 'spectral_army', name: 'Spectral Army', description: 'Summon a temporary army of ice wraith phantoms.', cooldown: 30, power: 75, element: 'ice_wraith', energyCost: 28 },
  { id: 'knight_charge', name: 'Knight Charge', description: 'Lead a charge of permafrost knights that breaks through enemy lines.', cooldown: 15, power: 55, element: 'permafrost_knight', energyCost: 18 },
  { id: 'glacial_drift', name: 'Glacial Drift', description: 'Cause a glacier to advance, pushing everything before it.', cooldown: 22, power: 60, element: 'frost_giant', energyCost: 20 },
  { id: 'crystal_resonance', name: 'Crystal Resonance', description: 'Harmonize all crystals in the area, amplifying all frost abilities.', cooldown: 25, power: 50, element: 'crystal_queen', energyCost: 22 },
  { id: 'eternal_winter', name: 'Eternal Winter', description: 'Cast a permanent winter over the battlefield, freezing everything.', cooldown: 60, power: 100, element: 'frost_giant', energyCost: 50 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: BT_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const BT_ACHIEVEMENTS: readonly BTAchievementDef[] = [
  { id: 'first_summon', name: 'First Frost', description: 'Summon your first ice guardian.', condition: 'Summon 1 guardian', reward: '+50 frost power', icon: '🧊' },
  { id: 'five_summons', name: 'Frost Collection', description: 'Summon 5 different guardians.', condition: 'Summon 5 unique guardians', reward: '+200 frost power', icon: '❄️' },
  { id: 'ten_summons', name: 'Frozen Legion', description: 'Summon 10 different guardians.', condition: 'Summon 10 unique guardians', reward: '+500 frost power', icon: '🌨️' },
  { id: 'first_throne', name: 'Throne Claimant', description: 'Claim your first throne.', condition: 'Claim 1 throne', reward: '+100 blizzard energy', icon: '👑' },
  { id: 'four_thrones', name: 'Quad-Throne Monarch', description: 'Claim 4 different thrones.', condition: 'Claim 4 thrones', reward: '+300 blizzard energy', icon: '🏰' },
  { id: 'all_thrones', name: 'Supreme Monarch', description: 'Claim all 8 thrones.', condition: 'Claim all thrones', reward: '+1000 frost power', icon: '🌍' },
  { id: 'first_structure', name: 'Ice Architect', description: 'Build your first structure.', condition: 'Build 1 structure', reward: '+100 gold', icon: '🏗️' },
  { id: 'ten_structures', name: 'Frost Engineer', description: 'Build 10 structures.', condition: 'Build 10 structures', reward: '+500 gold', icon: '🏗️' },
  { id: 'first_strike', name: 'Blizzard Striker', description: 'Perform your first blizzard strike.', condition: 'Execute 1 blizzard strike', reward: '+150 frost power', icon: '⚡' },
  { id: 'hundred_strikes', name: 'Storm Lord', description: 'Perform 100 blizzard strikes.', condition: 'Execute 100 strikes', reward: '+2000 frost power', icon: '🌪️' },
  { id: 'first_artifact', name: 'Relic Finder', description: 'Activate your first artifact.', condition: 'Activate 1 artifact', reward: '+200 gold', icon: '💎' },
  { id: 'five_artifacts', name: 'Artifact Collector', description: 'Activate 5 artifacts.', condition: 'Activate 5 artifacts', reward: '+1000 gold', icon: '🏛️' },
  { id: 'legendary_guardian', name: 'Legendary Frost', description: 'Summon a legendary guardian.', condition: 'Summon 1 legendary guardian', reward: '+3000 frost power', icon: '⭐' },
  { id: 'max_level', name: 'Eternal Frost', description: 'Reach maximum level.', condition: 'Reach level 50', reward: '+5000 frost power', icon: '❄️' },
  { id: 'all_species', name: 'Complete Collection', description: 'Have at least one guardian of each species.', condition: 'Own 1 of each species', reward: '+1500 frost power', icon: '🦅' },
  { id: 'thousand_power', name: 'Frost Sovereign', description: 'Accumulate 1000 total frost power.', condition: 'Reach 1000 frost power', reward: 'Title: Frost Sovereign', icon: '👑' },
  { id: 'ten_thousand_energy', name: 'Blizzard Emperor', description: 'Accumulate 10000 total blizzard energy.', condition: 'Reach 10000 energy', reward: '+5000 gold', icon: '⚡' },
  { id: 'survive_event', name: 'Storm Survivor', description: 'Survive a throne event.', condition: 'Survive 1 event', reward: '+500 frost power', icon: '🌈' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: BT_TITLES — 8 Titles (Frost Scout → Blizzard Monarch)
// ═══════════════════════════════════════════════════════════════════

export const BT_TITLES: readonly BTTitleDef[] = [
  { id: 'frost_scout', name: 'Frost Scout', description: 'A beginner exploring the frozen edges of the blizzard realm.', requiredLevel: 1, requiredThrones: 0 },
  { id: 'ice_walker', name: 'Ice Walker', description: 'One who has learned to navigate the treacherous frozen landscape.', requiredLevel: 5, requiredThrones: 1 },
  { id: 'glacier_ranger', name: 'Glacier Ranger', description: 'A seasoned traveler of the glacier paths, familiar with all ice formations.', requiredLevel: 10, requiredThrones: 2 },
  { id: 'rime_knight', name: 'Rime Knight', description: 'A warrior who has proven their mettle in the frost wars.', requiredLevel: 15, requiredThrones: 3 },
  { id: 'storm_commander', name: 'Storm Commander', description: 'A leader who commands blizzard hawks and controls storm patterns.', requiredLevel: 20, requiredThrones: 4 },
  { id: 'permafrost_lord', name: 'Permafrost Lord', description: 'A ruler who has claimed the ancient permafrost keeps as their domain.', requiredLevel: 30, requiredThrones: 5 },
  { id: 'frost_sovereign', name: 'Frost Sovereign', description: 'A monarch who rules over the frozen realm with absolute authority.', requiredLevel: 40, requiredThrones: 6 },
  { id: 'blizzard_monarch', name: 'Blizzard Monarch', description: 'The supreme ruler of the blizzard throne, master of all ice and storm.', requiredLevel: 50, requiredThrones: 8 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: BT_ARTIFACTS — 15 Legendary Artifacts
// ═══════════════════════════════════════════════════════════════════

export const BT_ARTIFACTS: readonly BTArtifactDef[] = [
  { id: 'frost_scepter', name: 'Frost Scepter', description: 'A scepter of clear ice that commands lesser ice elementals.', rarity: 'common', powerBonus: 10, specialAbility: '+5% guardian frost power', forgeCost: 100 },
  { id: 'snow_cloak', name: 'Snow Cloak', description: 'A cloak woven from enchanted snowflakes that renders the wearer invisible in blizzards.', rarity: 'common', powerBonus: 8, specialAbility: '+3% evasion in storms', forgeCost: 80 },
  { id: 'ice_crown_shard', name: 'Ice Crown Shard', description: 'A fragment of the legendary Monarch Ice Crown, pulsing with cold energy.', rarity: 'uncommon', powerBonus: 25, specialAbility: '+10% throne defense bonus', forgeCost: 300 },
  { id: 'rime_blade', name: 'Rime Blade', description: 'A sword coated in eternal rime ice that never dulls and freezes what it cuts.', rarity: 'uncommon', powerBonus: 30, specialAbility: '+15% attack power', forgeCost: 350 },
  { id: 'storm_gauntlet', name: 'Storm Gauntlet', description: 'A gauntlet that channels blizzard energy through the wearer arm.', rarity: 'uncommon', powerBonus: 28, specialAbility: '+12% blizzard strike damage', forgeCost: 320 },
  { id: 'glacier_shield_relic', name: 'Glacier Shield Relic', description: 'A shield made from ancient glacier ice, nearly indestructible.', rarity: 'rare', powerBonus: 50, specialAbility: '+25% structure defense', forgeCost: 800 },
  { id: 'permafrost_ring', name: 'Permafrost Ring', description: 'A ring that keeps the wearer body at optimal frost temperature.', rarity: 'rare', powerBonus: 45, specialAbility: '+20% frost resistance', forgeCost: 750 },
  { id: 'aurora_amulet', name: 'Aurora Amulet', description: 'An amulet that captures aurora light and converts it to usable energy.', rarity: 'rare', powerBonus: 55, specialAbility: '+10% energy regeneration', forgeCost: 900 },
  { id: 'wyrm_tooth_necklace', name: 'Wyrm Tooth Necklace', description: 'A necklace of glacial wyrm teeth that grants burrowing abilities.', rarity: 'rare', powerBonus: 48, specialAbility: '+15% speed underground', forgeCost: 820 },
  { id: 'wraith_crown', name: 'Wraith Crown', description: 'A crown of frozen mist that allows communication with ice wraiths.', rarity: 'epic', powerBonus: 80, specialAbility: '+30% wraith guardian power', forgeCost: 2000 },
  { id: 'frost_monarch_sword', name: 'Frost Monarch Sword', description: 'The legendary sword of the first frost monarch, cutting through reality.', rarity: 'epic', powerBonus: 90, specialAbility: '+25% all damage', forgeCost: 2500 },
  { id: 'eternal_blizzard_orb', name: 'Eternal Blizzard Orb', description: 'An orb containing a miniature blizzard that never dissipates.', rarity: 'epic', powerBonus: 85, specialAbility: '+20% blizzard energy generation', forgeCost: 2200 },
  { id: 'heart_of_winter', name: 'Heart of Winter', description: 'The crystallized heart of the winter season itself.', rarity: 'legendary', powerBonus: 150, specialAbility: '+50% all frost abilities', forgeCost: 6000 },
  { id: 'cosmic_ice_staff', name: 'Cosmic Ice Staff', description: 'A staff made from ice that fell from the cosmos, channeling stellar frost.', rarity: 'legendary', powerBonus: 160, specialAbility: '+40% magic power', forgeCost: 7000 },
  { id: 'world_frost_throne_key', name: 'World Frost Throne Key', description: 'The key to the original frost throne, granting dominion over all cold.', rarity: 'legendary', powerBonus: 200, specialAbility: 'Unlock hidden throne bonuses', forgeCost: 10000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: BT_EVENTS — 12 Throne Events
// ═══════════════════════════════════════════════════════════════════

export const BT_EVENTS: readonly BTEventDef[] = [
  { id: 'great_thaw', name: 'The Great Thaw', description: 'Temperatures rise suddenly, threatening to melt throne chambers.', severity: 3, duration: 300, effects: ['Reduced defense', 'Guardian fatigue'], element: 'frost_giant' },
  { id: 'wyrm_migration', name: 'Wyrm Migration', description: 'Glacial wyrms emerge from tunnels in massive numbers.', severity: 4, duration: 240, effects: ['Bonus wyrm materials', 'Tunnel network expansion'], element: 'glacial_wyrm' },
  { id: 'aurora_storm', name: 'Aurora Storm', description: 'An exceptionally powerful aurora creates rare materials everywhere.', severity: 1, duration: 180, effects: ['Double aurora drops', 'Enhanced crystal growth'], element: 'crystal_queen' },
  { id: 'wraith_uprising', name: 'Wraith Uprising', description: 'Ice wraiths become restless and demand attention from the monarch.', severity: 3, duration: 200, effects: ['Spectral guardian bonus', 'Wraith essence gain'], element: 'ice_wraith' },
  { id: 'permafrost_quake', name: 'Permafrost Quake', description: 'Deep permafrost shifts, revealing hidden chambers and resources.', severity: 2, duration: 150, effects: ['New mining opportunities', 'Structure damage risk'], element: 'snow_golem' },
  { id: 'blizzard_surge', name: 'Blizzard Surge', description: 'Blizzard intensity increases dramatically, empowering storm-based abilities.', severity: 2, duration: 360, effects: ['Double storm energy', 'Hawk power boost'], element: 'blizzard_hawk' },
  { id: 'crystal_resonance_event', name: 'Crystal Resonance', description: 'All crystals in the realm begin resonating at the same frequency.', severity: 1, duration: 120, effects: ['Enhanced enchantment', 'Crystal material bonus'], element: 'crystal_queen' },
  { id: 'knight_tournament', name: 'Frost Knight Tournament', description: 'Permafrost knights from across the realm gather to compete.', severity: 1, duration: 480, effects: ['Combat rewards', 'Knight experience boost'], element: 'permafrost_knight' },
  { id: 'glacial_flood', name: 'Glacial Flood', description: 'A glacier dam breaks, flooding lower chambers with freezing water.', severity: 5, duration: 200, effects: ['Structure damage', 'Rare material exposure'], element: 'frost_giant' },
  { id: 'eternal_frost_wave', name: 'Eternal Frost Wave', description: 'A wave of absolute cold sweeps through the realm, strengthening guardians.', severity: 1, duration: 100, effects: ['Guardian power boost', 'Frost material surge'], element: 'ice_wraith' },
  { id: 'monarch_summit', name: 'Monarch Summit', description: 'All frost monarchs are called to the Crystal Sovereign Chamber.', severity: 2, duration: 600, effects: ['Diplomacy rewards', 'Title advancement chance'], element: 'crystal_queen' },
  { id: 'ice_age_echo', name: 'Ice Age Echo', description: 'An echo of a primordial ice age reverberates through time.', severity: 4, duration: 400, effects: ['Massive frost power gain', 'Ancient material discovery'], element: 'glacial_wyrm' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13b: LOOKUP MAPS — Pre-built indexes for fast access
// ═══════════════════════════════════════════════════════════════════

export const BT_GUARDIAN_MAP: ReadonlyMap<string, BTGuardianDef> = new Map(
  BT_GUARDIANS.map((g) => [g.id, g])
)

export const BT_THRONE_MAP: ReadonlyMap<string, BTThroneDef> = new Map(
  BT_THRONES.map((t) => [t.id, t])
)

export const BT_MATERIAL_MAP: ReadonlyMap<string, BTMaterialDef> = new Map(
  BT_MATERIALS.map((m) => [m.id, m])
)

export const BT_STRUCTURE_MAP: ReadonlyMap<string, BTStructureDef> = new Map(
  BT_STRUCTURES.map((s) => [s.id, s])
)

export const BT_ABILITY_MAP: ReadonlyMap<string, BTAbilityDef> = new Map(
  BT_ABILITIES.map((a) => [a.id, a])
)

export const BT_ARTIFACT_MAP: ReadonlyMap<string, BTArtifactDef> = new Map(
  BT_ARTIFACTS.map((a) => [a.id, a])
)

export const BT_EVENT_MAP: ReadonlyMap<string, BTEventDef> = new Map(
  BT_EVENTS.map((e) => [e.id, e])
)

export const BT_ACHIEVEMENT_MAP: ReadonlyMap<string, BTAchievementDef> = new Map(
  BT_ACHIEVEMENTS.map((a) => [a.id, a])
)

export const BT_TITLE_MAP: ReadonlyMap<string, BTTitleDef> = new Map(
  BT_TITLES.map((t) => [t.id, t])
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 13c: RARITY-BASED GUARDIAN LISTS
// ═══════════════════════════════════════════════════════════════════

export const BT_GUARDIANS_BY_RARITY: Record<BTRarity, readonly BTGuardianDef[]> = {
  common: BT_GUARDIANS.filter((g) => g.rarity === 'common'),
  uncommon: BT_GUARDIANS.filter((g) => g.rarity === 'uncommon'),
  rare: BT_GUARDIANS.filter((g) => g.rarity === 'rare'),
  epic: BT_GUARDIANS.filter((g) => g.rarity === 'epic'),
  legendary: BT_GUARDIANS.filter((g) => g.rarity === 'legendary'),
}

export const BT_GUARDIANS_BY_SPECIES: Record<BTSpecies, readonly BTGuardianDef[]> = {
  frost_giant: BT_GUARDIANS.filter((g) => g.species === 'frost_giant'),
  ice_wraith: BT_GUARDIANS.filter((g) => g.species === 'ice_wraith'),
  blizzard_hawk: BT_GUARDIANS.filter((g) => g.species === 'blizzard_hawk'),
  snow_golem: BT_GUARDIANS.filter((g) => g.species === 'snow_golem'),
  glacial_wyrm: BT_GUARDIANS.filter((g) => g.species === 'glacial_wyrm'),
  permafrost_knight: BT_GUARDIANS.filter((g) => g.species === 'permafrost_knight'),
  crystal_queen: BT_GUARDIANS.filter((g) => g.species === 'crystal_queen'),
}

export const BT_MATERIALS_BY_CATEGORY: Record<string, readonly BTMaterialDef[]> = {
  frost: BT_MATERIALS.filter((m) => m.category === 'frost'),
  crystal: BT_MATERIALS.filter((m) => m.category === 'crystal'),
  glacier: BT_MATERIALS.filter((m) => m.category === 'glacier'),
  storm: BT_MATERIALS.filter((m) => m.category === 'storm'),
  permafrost: BT_MATERIALS.filter((m) => m.category === 'permafrost'),
  aurora: BT_MATERIALS.filter((m) => m.category === 'aurora'),
}

export const BT_ARTIFACTS_BY_RARITY: Record<BTRarity, readonly BTArtifactDef[]> = {
  common: BT_ARTIFACTS.filter((a) => a.rarity === 'common'),
  uncommon: BT_ARTIFACTS.filter((a) => a.rarity === 'uncommon'),
  rare: BT_ARTIFACTS.filter((a) => a.rarity === 'rare'),
  epic: BT_ARTIFACTS.filter((a) => a.rarity === 'epic'),
  legendary: BT_ARTIFACTS.filter((a) => a.rarity === 'legendary'),
}

export const BT_STRUCTURES_BY_CATEGORY: Record<string, readonly BTStructureDef[]> = {
  defense: BT_STRUCTURES.filter((s) => s.category === 'defense'),
  production: BT_STRUCTURES.filter((s) => s.category === 'production'),
  enchantment: BT_STRUCTURES.filter((s) => s.category === 'enchantment'),
  storage: BT_STRUCTURES.filter((s) => s.category === 'storage'),
  summoning: BT_STRUCTURES.filter((s) => s.category === 'summoning'),
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 13d: ADDITIONAL UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export function btTotalGuardianPower(guardians: Record<string, BTGuardianEntity>): number {
  return Object.values(guardians).reduce((sum, g) => sum + g.power, 0)
}

export function btTotalThroneDefense(thrones: Record<string, { claimed: boolean; defenseBonus: number }>): number {
  return Object.values(thrones).filter((t) => t.claimed).reduce((sum, t) => sum + t.defenseBonus, 0)
}

export function btTotalStructureDefense(structures: Record<string, BTStructureEntity>): number {
  return Object.values(structures).filter((s) => s.built).reduce((sum) => sum + 1, 0)
}

export function btGuardiansByRarityForState(
  guardians: Record<string, BTGuardianEntity>
): Record<BTRarity, BTGuardianEntity[]> {
  const result: Record<BTRarity, BTGuardianEntity[]> = {
    common: [],
    uncommon: [],
    rare: [],
    epic: [],
    legendary: [],
  }
  for (const entity of Object.values(guardians)) {
    const def = BT_GUARDIAN_MAP.get(entity.guardianDefId)
    if (def) {
      result[def.rarity].push(entity)
    }
  }
  return result
}

export function btUnlockedAbilities(guardians: Record<string, BTGuardianEntity>): string[] {
  const abilitySet = new Set<string>()
  for (const entity of Object.values(guardians)) {
    const def = BT_GUARDIAN_MAP.get(entity.guardianDefId)
    if (def) {
      for (const ability of def.abilities) {
        abilitySet.add(ability)
      }
    }
  }
  return Array.from(abilitySet)
}

export function btCheckAchievement(
  achievementId: string,
  state: BTStoreState
): boolean {
  switch (achievementId) {
    case 'first_summon':
      return state.btStats.totalGuardiansSummoned >= 1
    case 'five_summons':
      return Object.keys(state.btGuardians).length >= 5
    case 'ten_summons':
      return Object.keys(state.btGuardians).length >= 10
    case 'first_throne':
      return state.btStats.totalThronesClaimed >= 1
    case 'four_thrones':
      return state.btStats.totalThronesClaimed >= 4
    case 'all_thrones':
      return state.btStats.totalThronesClaimed >= 8
    case 'first_structure':
      return state.btStats.totalStructuresBuilt >= 1
    case 'ten_structures':
      return state.btStats.totalStructuresBuilt >= 10
    case 'first_strike':
      return state.btStats.totalBlizzardStrikes >= 1
    case 'hundred_strikes':
      return state.btStats.totalBlizzardStrikes >= 100
    case 'first_artifact':
      return state.btStats.totalArtifactsActivated >= 1
    case 'five_artifacts':
      return state.btArtifacts.length >= 5
    case 'legendary_guardian':
      return Object.values(state.btGuardians).some((g) => {
        const def = BT_GUARDIAN_MAP.get(g.guardianDefId)
        return def?.rarity === 'legendary'
      })
    case 'max_level':
      return state.btLevel >= BT_MAX_LEVEL
    case 'all_species': {
      const speciesSet = new Set<string>()
      for (const entity of Object.values(state.btGuardians)) {
        const def = BT_GUARDIAN_MAP.get(entity.guardianDefId)
        if (def) speciesSet.add(def.species)
      }
      return speciesSet.size >= 7
    }
    case 'thousand_power':
      return state.btFrostPower >= 1000
    case 'ten_thousand_energy':
      return state.btStats.totalBlizzardEnergyGained >= 10000
    case 'survive_event':
      return state.btStats.totalBlizzardStrikes >= 5
    default:
      return false
  }
}

export function btGetNextTitle(state: BTStoreState): BTTitleDef {
  const thronesClaimed = Object.values(state.btThrones).filter((t) => t.claimed).length
  for (let i = BT_TITLES.length - 1; i >= 0; i--) {
    const title = BT_TITLES[i]
    if (state.btLevel >= title.requiredLevel && thronesClaimed >= title.requiredThrones) {
      return title
    }
  }
  return BT_TITLES[0]
}

export function btGuardianPowerAtLevel(basePower: number, level: number): number {
  return Math.floor(basePower * (1 + (level - 1) * 0.15))
}

export function btStructureCostAtLevel(structureId: string, currentLevel: number): number {
  const def = BT_STRUCTURE_MAP.get(structureId)
  if (!def) return Infinity
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

export function btCanSummonGuardian(guardianId: string, state: BTStoreState): { canSummon: boolean; reason: string } {
  const def = BT_GUARDIAN_MAP.get(guardianId)
  if (!def) return { canSummon: false, reason: 'Unknown guardian' }
  const existing = Object.values(state.btGuardians).some((g) => g.guardianDefId === guardianId)
  if (existing) return { canSummon: false, reason: 'Already owned' }
  if (state.btBlizzardEnergy < def.summonCost) return { canSummon: false, reason: 'Insufficient blizzard energy' }
  return { canSummon: true, reason: 'Ready' }
}

export function btCanClaimThrone(throneId: string, state: BTStoreState): { canClaim: boolean; reason: string } {
  const def = BT_THRONE_MAP.get(throneId)
  if (!def) return { canClaim: false, reason: 'Unknown throne' }
  if (state.btThrones[throneId]?.claimed) return { canClaim: false, reason: 'Already claimed' }
  if (state.btLevel < def.minLevel) return { canClaim: false, reason: `Requires level ${def.minLevel}` }
  if (state.btGold < def.unlockCost) return { canClaim: false, reason: 'Insufficient gold' }
  return { canClaim: true, reason: 'Ready' }
}

export function btCanBuildStructure(structureId: string, state: BTStoreState): { canBuild: boolean; reason: string } {
  const def = BT_STRUCTURE_MAP.get(structureId)
  if (!def) return { canBuild: false, reason: 'Unknown structure' }
  const existing = state.btStructures[structureId]
  const currentLevel = existing?.level ?? 0
  if (currentLevel >= def.maxLevel) return { canBuild: false, reason: 'Already max level' }
  const cost = btStructureCostAtLevel(structureId, currentLevel)
  if (state.btGold < cost) return { canBuild: false, reason: 'Insufficient gold' }
  return { canBuild: true, reason: 'Ready' }
}

export function btCanActivateRelic(artifactId: string, state: BTStoreState): { canActivate: boolean; reason: string } {
  const def = BT_ARTIFACT_MAP.get(artifactId)
  if (!def) return { canActivate: false, reason: 'Unknown artifact' }
  if (state.btArtifacts.includes(artifactId)) return { canActivate: false, reason: 'Already activated' }
  if (state.btIceCrystals < def.forgeCost) return { canActivate: false, reason: 'Insufficient ice crystals' }
  return { canActivate: true, reason: 'Ready' }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: STORE INITIAL STATE
// ═════════════════════════════════════════════════════════════════

const BT_INITIAL_STATE: BTStoreState = {
  btLevel: 1,
  btFrostPower: BT_INITIAL_FROST_POWER,
  btBlizzardEnergy: BT_INITIAL_BLIZZARD_ENERGY,
  btGuardians: {},
  btThrones: {},
  btStructures: {},
  btArtifacts: [],
  btAchievements: [],
  btInventory: {},
  btStats: {
    totalGuardiansSummoned: 0,
    totalThronesClaimed: 0,
    totalStructuresBuilt: 0,
    totalArtifactsActivated: 0,
    totalBlizzardStrikes: 0,
    totalFrostPowerEarned: 0,
    totalBlizzardEnergyGained: 0,
    totalRelicsActivated: 0,
  },
  btTitle: 'frost_scout',
  btActiveEventId: null,
  btEventTimer: 0,
  btGold: BT_INITIAL_GOLD,
  btIceCrystals: BT_INITIAL_ICE_CRYSTALS,
  btActiveThroneId: null,
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

export const useBlizzardThroneStore = create<BTFullStore>()(
  persist(
    (set, get) => ({
      ...BT_INITIAL_STATE,

      btSummonGuardian: (guardianId: string): boolean => {
        const state = get()
        const guardianDef = BT_GUARDIANS.find((g) => g.id === guardianId)
        if (!guardianDef) return false

        // Check if already owned
        const existingKeys = Object.keys(state.btGuardians)
        if (existingKeys.some((k) => state.btGuardians[k].guardianDefId === guardianId)) return false

        // Check cost
        if (state.btBlizzardEnergy < guardianDef.summonCost) return false

        const entity: BTGuardianEntity = {
          id: btGenerateId(),
          guardianDefId: guardianDef.id,
          name: guardianDef.name,
          level: 1,
          currentHP: guardianDef.stats.hp,
          maxHP: guardianDef.stats.hp,
          power: guardianDef.frostPower,
          summonedAt: Date.now(),
          thronesDefended: 0,
        }

        const newGuardians = { ...state.btGuardians, [entity.id]: entity }
        const xpGain = guardianDef.frostPower * btRarityMultiplier(guardianDef.rarity)
        const newLevel = btLevelFromXp((state.btLevel - 1) * 100 + xpGain)

        set({
          btGuardians: newGuardians,
          btBlizzardEnergy: state.btBlizzardEnergy - guardianDef.summonCost,
          btFrostPower: state.btFrostPower + Math.floor(xpGain),
          btLevel: newLevel,
          btStats: {
            ...state.btStats,
            totalGuardiansSummoned: state.btStats.totalGuardiansSummoned + 1,
            totalFrostPowerEarned: state.btStats.totalFrostPowerEarned + Math.floor(xpGain),
          },
        })

        return true
      },

      btThroneClaim: (throneId: string): boolean => {
        const state = get()
        const throneDef = BT_THRONES.find((t) => t.id === throneId)
        if (!throneDef) return false

        // Check if already claimed
        if (state.btThrones[throneId]?.claimed) return false

        // Check level requirement
        if (state.btLevel < throneDef.minLevel) return false

        // Check cost
        if (state.btGold < throneDef.unlockCost) return false

        const newThrones = {
          ...state.btThrones,
          [throneId]: {
            claimed: true,
            claimedAt: Date.now(),
            defenseBonus: throneDef.minLevel * 5,
          },
        }

        const xpGain = throneDef.minLevel * 20
        const newLevel = btLevelFromXp((state.btLevel - 1) * 100 + xpGain)

        set({
          btThrones: newThrones,
          btGold: state.btGold - throneDef.unlockCost,
          btFrostPower: state.btFrostPower + Math.floor(xpGain),
          btLevel: newLevel,
          btActiveThroneId: throneId,
          btStats: {
            ...state.btStats,
            totalThronesClaimed: state.btStats.totalThronesClaimed + 1,
            totalFrostPowerEarned: state.btStats.totalFrostPowerEarned + Math.floor(xpGain),
          },
        })

        // Check title advancement
        const updatedState = get()
        const thronesClaimed = Object.values(updatedState.btThrones).filter((t) => t.claimed).length
        for (let i = BT_TITLES.length - 1; i >= 0; i--) {
          const title = BT_TITLES[i]
          if (updatedState.btLevel >= title.requiredLevel && thronesClaimed >= title.requiredThrones) {
            if (updatedState.btTitle !== title.id) {
              set({ btTitle: title.id })
            }
            break
          }
        }

        return true
      },

      btBuildStructure: (structureId: string): boolean => {
        const state = get()
        const structDef = BT_STRUCTURES.find((s) => s.id === structureId)
        if (!structDef) return false

        const existing = state.btStructures[structureId]
        const currentLevel = existing?.level ?? 0

        if (currentLevel >= structDef.maxLevel) return false

        const cost = Math.floor(structDef.baseCost * Math.pow(structDef.costMultiplier, currentLevel))
        if (state.btGold < cost) return false

        const newStructures = {
          ...state.btStructures,
          [structureId]: {
            id: btGenerateId(),
            structureDefId: structureId,
            level: currentLevel + 1,
            built: true,
          },
        }

        const xpGain = structDef.baseCost / 5
        const newLevel = btLevelFromXp((state.btLevel - 1) * 100 + xpGain)

        set({
          btStructures: newStructures,
          btGold: state.btGold - cost,
          btFrostPower: state.btFrostPower + Math.floor(xpGain),
          btLevel: newLevel,
          btStats: {
            ...state.btStats,
            totalStructuresBuilt: state.btStats.totalStructuresBuilt + 1,
            totalFrostPowerEarned: state.btStats.totalFrostPowerEarned + Math.floor(xpGain),
          },
        })

        return true
      },

      btBlizzardStrike: (targetThroneId: string): boolean => {
        const state = get()
        const throne = state.btThrones[targetThroneId]
        if (!throne?.claimed) return false
        if (state.btBlizzardEnergy < 10) return false

        const damage = Math.floor(20 + state.btLevel * 5 + Object.keys(state.btGuardians).length * 3)
        const xpGain = damage / 2
        const energyGain = Math.floor(damage / 10)
        const newLevel = btLevelFromXp((state.btLevel - 1) * 100 + xpGain)

        set({
          btBlizzardEnergy: Math.min(9999, state.btBlizzardEnergy - 10 + energyGain),
          btFrostPower: state.btFrostPower + Math.floor(xpGain),
          btLevel: newLevel,
          btGold: state.btGold + Math.floor(damage / 4),
          btStats: {
            ...state.btStats,
            totalBlizzardStrikes: state.btStats.totalBlizzardStrikes + 1,
            totalFrostPowerEarned: state.btStats.totalFrostPowerEarned + Math.floor(xpGain),
            totalBlizzardEnergyGained: state.btStats.totalBlizzardEnergyGained + energyGain,
          },
        })

        return true
      },

      btActivateRelic: (artifactId: string): boolean => {
        const state = get()
        const artifactDef = BT_ARTIFACTS.find((a) => a.id === artifactId)
        if (!artifactDef) return false
        if (state.btArtifacts.includes(artifactId)) return false
        if (state.btIceCrystals < artifactDef.forgeCost) return false

        set({
          btArtifacts: [...state.btArtifacts, artifactId],
          btIceCrystals: state.btIceCrystals - artifactDef.forgeCost,
          btFrostPower: state.btFrostPower + artifactDef.powerBonus,
          btStats: {
            ...state.btStats,
            totalArtifactsActivated: state.btStats.totalArtifactsActivated + 1,
            totalRelicsActivated: state.btStats.totalRelicsActivated + 1,
          },
        })

        return true
      },

      resetBlizzardThrone: () => {
        set(BT_INITIAL_STATE)
      },
    }),
    {
      name: 'blizzard-throne-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: REACT HOOK — useBlizzardThrone
// ═══════════════════════════════════════════════════════════════════

export default function useBlizzardThrone() {
  const state = useBlizzardThroneStore()
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  return {
    // ── Constants ──────────────────────────────────────────────
    BT_SPECIES,
    BT_GUARDIANS,
    BT_THRONES,
    BT_MATERIALS,
    BT_STRUCTURES,
    BT_ABILITIES,
    BT_ACHIEVEMENTS,
    BT_TITLES,
    BT_ARTIFACTS,
    BT_EVENTS,

    BT_COLOR_ICE_BLUE,
    BT_COLOR_FROST_WHITE,
    BT_COLOR_GLACIER_CYAN,
    BT_COLOR_STORM_GRAY,
    BT_COLOR_DEEP_FROST,
    BT_COLOR_AURORA_TEAL,
    BT_COLOR_SNOW_SILVER,
    BT_COLOR_PERMAFROST_NAVY,
    BT_COLOR_CRYSTAL_SHIMMER,
    BT_COLOR_BLIZZARD_VIOLET,

    BT_RARITY_COLORS,
    BT_RARITY_ICONS,

    // ── Lookup Maps ────────────────────────────────────────────
    BT_GUARDIAN_MAP,
    BT_THRONE_MAP,
    BT_MATERIAL_MAP,
    BT_STRUCTURE_MAP,
    BT_ABILITY_MAP,
    BT_ARTIFACT_MAP,
    BT_EVENT_MAP,
    BT_ACHIEVEMENT_MAP,
    BT_TITLE_MAP,

    // ── Filtered Lists ─────────────────────────────────────────
    BT_GUARDIANS_BY_RARITY,
    BT_GUARDIANS_BY_SPECIES,
    BT_MATERIALS_BY_CATEGORY,
    BT_ARTIFACTS_BY_RARITY,
    BT_STRUCTURES_BY_CATEGORY,

    // ── State accessors ────────────────────────────────────────
    btLevel: state.btLevel,
    btFrostPower: state.btFrostPower,
    btBlizzardEnergy: state.btBlizzardEnergy,
    btGuardians: state.btGuardians,
    btThrones: state.btThrones,
    btStructures: state.btStructures,
    btArtifacts: state.btArtifacts,
    btAchievements: state.btAchievements,
    btInventory: state.btInventory,
    btStats: state.btStats,
    btTitle: state.btTitle,
    btActiveEventId: state.btActiveEventId,
    btEventTimer: state.btEventTimer,
    btGold: state.btGold,
    btIceCrystals: state.btIceCrystals,
    btActiveThroneId: state.btActiveThroneId,

    // ── Actions ────────────────────────────────────────────────
    btSummonGuardian: state.btSummonGuardian,
    btThroneClaim: state.btThroneClaim,
    btBuildStructure: state.btBuildStructure,
    btBlizzardStrike: state.btBlizzardStrike,
    btActivateRelic: state.btActivateRelic,
    resetBlizzardThrone: state.resetBlizzardThrone,

    // ── Derived helpers ────────────────────────────────────────
    btGuardianCount: Object.keys(state.btGuardians).length,
    btThroneCount: Object.values(state.btThrones).filter((t) => t.claimed).length,
    btStructureCount: Object.values(state.btStructures).filter((s) => s.built).length,
    btArtifactCount: state.btArtifacts.length,
    btAchievementCount: state.btAchievements.length,
    btCurrentTitleDef: BT_TITLES.find((t) => t.id === state.btTitle) ?? BT_TITLES[0],
    btNextTitle: btGetNextTitle(state),
    btTotalGuardianPower: btTotalGuardianPower(state.btGuardians),
    btTotalThroneDefense: btTotalThroneDefense(state.btThrones),
    btTotalStructureDefense: btTotalStructureDefense(state.btStructures),
    btGuardiansByRarity: btGuardiansByRarityForState(state.btGuardians),
    btUnlockedAbilities: btUnlockedAbilities(state.btGuardians),

    // ── Validation helpers ────────────────────────────────────
    btCanSummonGuardian: (guardianId: string) => btCanSummonGuardian(guardianId, state),
    btCanClaimThrone: (throneId: string) => btCanClaimThrone(throneId, state),
    btCanBuildStructure: (structureId: string) => btCanBuildStructure(structureId, state),
    btCanActivateRelic: (artifactId: string) => btCanActivateRelic(artifactId, state),
    btCheckAchievement: (achievementId: string) => btCheckAchievement(achievementId, state),
    btGuardianPowerAtLevel: btGuardianPowerAtLevel,
    btStructureCostAtLevel: btStructureCostAtLevel,

    // ── Helper functions ───────────────────────────────────────
    btGetGuardianDef: (id: string) => BT_GUARDIAN_MAP.get(id) ?? null,
    btGetThroneDef: (id: string) => BT_THRONE_MAP.get(id) ?? null,
    btGetStructureDef: (id: string) => BT_STRUCTURE_MAP.get(id) ?? null,
    btGetArtifactDef: (id: string) => BT_ARTIFACT_MAP.get(id) ?? null,
    btGetMaterialDef: (id: string) => BT_MATERIAL_MAP.get(id) ?? null,
    btGetSpeciesDef: (id: string) => BT_SPECIES.find((s) => s.id === id) ?? null,
    btGetAbilityDef: (id: string) => BT_ABILITY_MAP.get(id) ?? null,
    btGetEventDef: (id: string) => BT_EVENT_MAP.get(id) ?? null,
    btGetAchievementDef: (id: string) => BT_ACHIEVEMENT_MAP.get(id) ?? null,
    btGetTitleDef: (id: string) => BT_TITLE_MAP.get(id) ?? null,

    btRarityColor,
    btSpeciesColor,
    btRarityMultiplier,
    btRarityIcon: (rarity: BTRarity) => BT_RARITY_ICONS[rarity],
    btClamp,

    // ── Ref for callbacks ──────────────────────────────────────
    stateRef,
  }
}
