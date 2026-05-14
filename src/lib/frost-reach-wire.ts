'use client'

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// Frost Reach Wire (冰霜边境) — Frost Frontier Feature System
// Color theme: frost white #F0F8FF, ice blue #ADD8E6,
//              glacier cyan #00CED1, aurora green #7FFFD4
// ═══════════════════════════════════════════════════════════════════

// ─── TYPE DEFINITIONS ────────────────────────────────────────────

export type FrRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type FrGuardianType = 'ice_golem' | 'frost_wyrm' | 'glacier_bear' | 'snow_leopard' | 'blizzard_eagle' | 'permafrost_elemental' | 'crystal_deer'
export type FrAbilityType = 'offensive' | 'defensive' | 'utility' | 'passive'
export type FrStructureCategory = 'barracks' | 'workshop' | 'storage' | 'tower' | 'gate' | 'shrine' | 'library' | 'wall'

// ─── RARITY CONSTANTS ───────────────────────────────────────────

export const FR_RARITY_COMMON: FrRarity = 'common'
export const FR_RARITY_UNCOMMON: FrRarity = 'uncommon'
export const FR_RARITY_RARE: FrRarity = 'rare'
export const FR_RARITY_EPIC: FrRarity = 'epic'
export const FR_RARITY_LEGENDARY: FrRarity = 'legendary'

export const FR_RARITY_COLORS: Record<FrRarity, string> = {
  [FR_RARITY_COMMON]: '#ADD8E6',
  [FR_RARITY_UNCOMMON]: '#00CED1',
  [FR_RARITY_RARE]: '#7FFFD4',
  [FR_RARITY_EPIC]: '#B0E0E6',
  [FR_RARITY_LEGENDARY]: '#F0F8FF',
}

export const FR_RARITY_XP_MULTIPLIER: Record<FrRarity, number> = {
  [FR_RARITY_COMMON]: 1,
  [FR_RARITY_UNCOMMON]: 1.5,
  [FR_RARITY_RARE]: 2.5,
  [FR_RARITY_EPIC]: 4,
  [FR_RARITY_LEGENDARY]: 7,
}

export const FR_RARITY_RECRUIT_WEIGHTS: Record<FrRarity, number> = {
  [FR_RARITY_COMMON]: 40,
  [FR_RARITY_UNCOMMON]: 28,
  [FR_RARITY_RARE]: 17,
  [FR_RARITY_EPIC]: 10,
  [FR_RARITY_LEGENDARY]: 5,
}

export const FR_RARITY_ICONS: Record<FrRarity, string> = {
  [FR_RARITY_COMMON]: '🧊',
  [FR_RARITY_UNCOMMON]: '❄️',
  [FR_RARITY_RARE]: '🌨️',
  [FR_RARITY_EPIC]: '💎',
  [FR_RARITY_LEGENDARY]: '👑',
}

// ─── COLOR THEME ────────────────────────────────────────────────

export const FR_FROST_WHITE = '#F0F8FF'
export const FR_ICE_BLUE = '#ADD8E6'
export const FR_GLACIER_CYAN = '#00CED1'
export const FR_AURORA_GREEN = '#7FFFD4'
export const FR_DEEP_FROST = '#1B3A4B'
export const FR_SNOW_SILVER = '#C0D6E4'
export const FR_CRYSTAL_PALE = '#E0F7FA'
export const FR_NORTHERN_DUSK = '#2C3E50'
export const FR_PERMAFROST_GRAY = '#546E7A'
export const FR_BLIZZARD_STORM = '#37474F'

// ─── INTERFACES ─────────────────────────────────────────────────

export interface FrGuardianDef {
  id: string
  name: string
  type: FrGuardianType
  rarity: FrRarity
  hp: number
  attack: number
  defense: number
  speed: number
  frostPower: number
  recruitCost: number
  description: string
  lore: string
  icon: string
  color: string
}

export interface FrGuardianState {
  guardianId: string
  nickname: string
  level: number
  xp: number
  hp: number
  maxHp: number
  recruitedAt: number | null
  outpostId: string | null
  isActive: boolean
}

export interface FrOutpostDef {
  id: string
  name: string
  description: string
  level: number
  maxLevel: number
  resources: { iceCore: number; crystalShard: number; frostEssence: number }
  capacity: number
  defenseRating: number
  regionColor: string
  icon: string
}

export interface FrOutpostState {
  outpostId: string
  fortifiedLevel: number
  garrisonCount: number
  supplyLevel: number
  morale: number
  lastDefendedAt: number | null
  totalDefenses: number
}

export interface FrMaterialDef {
  id: string
  name: string
  rarity: FrRarity
  description: string
  icon: string
  color: string
}

export interface FrInventoryItem {
  materialId: string
  count: number
}

export interface FrStructureDef {
  id: string
  name: string
  category: FrStructureCategory
  outpostId: string
  maxLevel: number
  baseCost: number
  costMultiplier: number
  description: string
  icon: string
  effectPerLevel: number
}

export interface FrStructureState {
  structureId: string
  level: number
  builtAt: number | null
}

export interface FrAbilityDef {
  id: string
  name: string
  type: FrAbilityType
  rarity: FrRarity
  power: number
  cooldown: number
  manaCost: number
  description: string
  icon: string
  color: string
}

export interface FrAchievementDef {
  id: string
  name: string
  description: string
  condition: string
  rewardXp: number
  hidden: boolean
  icon: string
}

export interface FrTitleDef {
  id: string
  name: string
  requirement: string
  minGuardians: number
  minOutposts: number
  bonusMultiplier: number
  icon: string
}

export interface FrArtifactDef {
  id: string
  name: string
  rarity: FrRarity
  description: string
  lore: string
  powerBonus: number
  defenseBonus: number
  frostBonus: number
  icon: string
  color: string
}

export interface FrReachEventDef {
  id: string
  name: string
  description: string
  severity: 'mild' | 'moderate' | 'severe' | 'catastrophic'
  duration: number
  rewardXp: number
  rewardResources: { iceCore: number; crystalShard: number; frostEssence: number }
  riskLevel: number
  icon: string
  color: string
}

export interface FrostReachState {
  frGuardians: Record<string, FrGuardianState>
  frOutposts: Record<string, FrOutpostState>
  frInventory: FrInventoryItem[]
  frArtifacts: string[]
  frAchievements: string[]
  frTitle: string
  frEvents: string[]
  frStats: {
    totalRecruited: number
    totalFortified: number
    totalBuilt: number
    totalArtifactActivated: number
    totalEventsTriggered: number
    totalGuardiansLost: number
    totalOutpostsDefended: number
    totalResourcesGathered: number
  }
}

// ─── FR_GUARDIANS (35 guardians: 5 tiers × 7 types) ────────────

export const FR_GUARDIANS: FrGuardianDef[] = [
  // ── Common Tier (7) ──
  {
    id: 'fr_ice_golem_sentinel',
    name: 'Ice Golem Sentinel',
    type: 'ice_golem',
    rarity: FR_RARITY_COMMON,
    hp: 120, attack: 18, defense: 25, speed: 3, frostPower: 8,
    recruitCost: 50,
    description: 'A basic ice golem constructed from packed snow and glacial fragments. Reliable frontline defender.',
    lore: 'The first ice golems were carved during the Great Frost to guard the outer reaches of the border.',
    icon: '🗿', color: '#ADD8E6',
  },
  {
    id: 'fr_frost_wyrm_hatchling',
    name: 'Frost Wyrm Hatchling',
    type: 'frost_wyrm',
    rarity: FR_RARITY_COMMON,
    hp: 70, attack: 15, defense: 10, speed: 12, frostPower: 12,
    recruitCost: 45,
    description: 'A young frost wyrm freshly emerged from its ice egg. Quick and hungry for battle.',
    lore: 'Frost wyrm eggs are found deep in glacial crevasses, incubated by ancient permafrost magic.',
    icon: '🐉', color: '#B0E0E6',
  },
  {
    id: 'fr_glacier_bear_cub',
    name: 'Glacier Bear Cub',
    type: 'glacier_bear',
    rarity: FR_RARITY_COMMON,
    hp: 100, attack: 20, defense: 22, speed: 6, frostPower: 6,
    recruitCost: 55,
    description: 'A young glacier bear with fur as white as fresh snow. Surprisingly strong for its size.',
    lore: 'Glacier bear cubs stay with their mothers for three years, learning to navigate treacherous ice fields.',
    icon: '🐻', color: '#E0F7FA',
  },
  {
    id: 'fr_snow_leopard_huntress',
    name: 'Snow Leopard Huntress',
    type: 'snow_leopard',
    rarity: FR_RARITY_COMMON,
    hp: 65, attack: 22, defense: 8, speed: 25, frostPower: 10,
    recruitCost: 50,
    description: 'An agile snow leopard that prowls the frozen ridges. Exceptional at flanking maneuvers.',
    lore: 'Snow leopards of the Frost Reach are said to be able to run across falling snowflakes.',
    icon: '🐆', color: '#F0F8FF',
  },
  {
    id: 'fr_blizzard_eagle_fledgling',
    name: 'Blizzard Eagle Fledgling',
    type: 'blizzard_eagle',
    rarity: FR_RARITY_COMMON,
    hp: 50, attack: 14, defense: 6, speed: 28, frostPower: 8,
    recruitCost: 40,
    description: 'A young blizzard eagle learning to ride the freezing winds. Great for reconnaissance.',
    lore: 'Blizzard eagles nest on the highest peaks where no other creature can survive the winds.',
    icon: '🦅', color: '#ADD8E6',
  },
  {
    id: 'fr_permafrost_elemental_sprite',
    name: 'Permafrost Elemental Sprite',
    type: 'permafrost_elemental',
    rarity: FR_RARITY_COMMON,
    hp: 55, attack: 10, defense: 12, speed: 14, frostPower: 18,
    recruitCost: 48,
    description: 'A small elemental spirit bound to the ancient permafrost. Wields basic frost magic.',
    lore: 'Permafrost sprites are born when sunlight refracts through ancient ice crystals for the first time.',
    icon: '🌀', color: '#00CED1',
  },
  {
    id: 'fr_crystal_deer_fawn',
    name: 'Crystal Deer Fawn',
    type: 'crystal_deer',
    rarity: FR_RARITY_COMMON,
    hp: 60, attack: 8, defense: 10, speed: 20, frostPower: 14,
    recruitCost: 42,
    description: 'A young deer whose antlers are beginning to form delicate crystal structures.',
    lore: 'Crystal deer are the living embodiment of the Frost Reach forests, their antlers storing winter magic.',
    icon: '🦌', color: '#7FFFD4',
  },

  // ── Uncommon Tier (7) ──
  {
    id: 'fr_ice_golem_bastion',
    name: 'Ice Golem Bastion',
    type: 'ice_golem',
    rarity: FR_RARITY_UNCOMMON,
    hp: 180, attack: 20, defense: 35, speed: 3, frostPower: 12,
    recruitCost: 150,
    description: 'A reinforced ice golem with layers of frozen armor plating. Nearly immovable wall of ice.',
    lore: 'Bastion golems incorporate ancient permafrost into their construction, making them nearly indestructible.',
    icon: '🗿', color: '#87CEEB',
  },
  {
    id: 'fr_frost_wyrm_fang',
    name: 'Frost Wyrm Fang',
    type: 'frost_wyrm',
    rarity: FR_RARITY_UNCOMMON,
    hp: 120, attack: 28, defense: 18, speed: 18, frostPower: 22,
    recruitCost: 160,
    description: 'An adolescent frost wyrm with razor-sharp frost fangs and developing breath weapon.',
    lore: 'Frost Wyrm Fangs are notorious for ambushing prey from beneath frozen lakes.',
    icon: '🐉', color: '#5F9EA0',
  },
  {
    id: 'fr_glacier_bear_guardian',
    name: 'Glacier Bear Guardian',
    type: 'glacier_bear',
    rarity: FR_RARITY_UNCOMMON,
    hp: 160, attack: 30, defense: 30, speed: 8, frostPower: 14,
    recruitCost: 155,
    description: 'An adult glacier bear trained to defend outpost approaches. Immensely strong.',
    lore: 'Glacier Bear Guardians have been companions of Frost Reach defenders for generations.',
    icon: '🐻', color: '#AFEEEE',
  },
  {
    id: 'fr_snow_leopard_shadow',
    name: 'Snow Leopard Shadow',
    type: 'snow_leopard',
    rarity: FR_RARITY_UNCOMMON,
    hp: 80, attack: 26, defense: 12, speed: 30, frostPower: 18,
    recruitCost: 145,
    description: 'A stealthy snow leopard that can move unseen through blizzards. Deadly ambush predator.',
    lore: 'Shadow leopards are so silent that even the wind cannot detect their passage.',
    icon: '🐆', color: '#E0FFFF',
  },
  {
    id: 'fr_blizzard_eagle_stormwing',
    name: 'Blizzard Eagle Stormwing',
    type: 'blizzard_eagle',
    rarity: FR_RARITY_UNCOMMON,
    hp: 90, attack: 22, defense: 14, speed: 32, frostPower: 16,
    recruitCost: 140,
    description: 'A mature eagle whose wings can generate localized blizzards when diving.',
    lore: 'Stormwing eagles are the eyes of the Frost Reach, reporting threats from miles away.',
    icon: '🦅', color: '#B0C4DE',
  },
  {
    id: 'fr_permafrost_elemental_giant',
    name: 'Permafrost Elemental Giant',
    type: 'permafrost_elemental',
    rarity: FR_RARITY_UNCOMMON,
    hp: 140, attack: 18, defense: 22, speed: 10, frostPower: 28,
    recruitCost: 165,
    description: 'A larger elemental entity with mastery over deep frost magic and ice barriers.',
    lore: 'Giant elementals emerge when permafrost thaws and refreezes, absorbing ancient magical energy.',
    icon: '🌀', color: '#20B2AA',
  },
  {
    id: 'fr_crystal_deer_elder',
    name: 'Crystal Deer Elder',
    type: 'crystal_deer',
    rarity: FR_RARITY_UNCOMMON,
    hp: 100, attack: 14, defense: 16, speed: 22, frostPower: 24,
    recruitCost: 148,
    description: 'An elder crystal deer whose antlers are full-grown prismatic frost crystals.',
    lore: 'Elder crystal deer can sense disturbances in the permafrost from leagues away.',
    icon: '🦌', color: '#66CDAA',
  },

  // ── Rare Tier (7) ──
  {
    id: 'fr_ice_golem_colossus',
    name: 'Ice Golem Colossus',
    type: 'ice_golem',
    rarity: FR_RARITY_RARE,
    hp: 300, attack: 28, defense: 50, speed: 2, frostPower: 20,
    recruitCost: 400,
    description: 'A massive golem towering over the battlefield. Its footsteps trigger small earthquakes.',
    lore: 'The Colossus was carved from a single ancient glacier that took a thousand years to form.',
    icon: '🗿', color: '#4682B4',
  },
  {
    id: 'fr_frost_wyrm_elder',
    name: 'Frost Wyrm Elder',
    type: 'frost_wyrm',
    rarity: FR_RARITY_RARE,
    hp: 200, attack: 42, defense: 28, speed: 22, frostPower: 35,
    recruitCost: 420,
    description: 'An ancient frost wyrm capable of breathing concentrated streams of liquid nitrogen.',
    lore: 'Elder wyrms have lived through multiple ice ages and remember the world before humans.',
    icon: '🐉', color: '#2E8B57',
  },
  {
    id: 'fr_glacier_bear_chief',
    name: 'Glacier Bear Chief',
    type: 'glacier_bear',
    rarity: FR_RARITY_RARE,
    hp: 250, attack: 38, defense: 40, speed: 10, frostPower: 22,
    recruitCost: 410,
    description: 'The alpha of a glacier bear clan. Commands lesser bears in coordinated assaults.',
    lore: 'Glacier Bear Chiefs wear scars from battles with frost giants as badges of honor.',
    icon: '🐻', color: '#3CB371',
  },
  {
    id: 'fr_snow_leopard_phantom',
    name: 'Snow Leopard Phantom',
    type: 'snow_leopard',
    rarity: FR_RARITY_RARE,
    hp: 110, attack: 35, defense: 18, speed: 35, frostPower: 28,
    recruitCost: 390,
    description: 'A spectral snow leopard that can phase through ice walls. Impossible to cage.',
    lore: 'Phantom leopards are the spirits of ancient Frost Reach hunters who never stopped patrolling.',
    icon: '🐆', color: '#48D1CC',
  },
  {
    id: 'fr_blizzard_eagle_matriarch',
    name: 'Blizzard Eagle Matriarch',
    type: 'blizzard_eagle',
    rarity: FR_RARITY_RARE,
    hp: 140, attack: 30, defense: 20, speed: 36, frostPower: 26,
    recruitCost: 395,
    description: 'The queen of the eagle eyrie. Her cry summons entire flocks of blizzard eagles.',
    lore: 'Matriarchs control the weather patterns of the Frost Reach through ancient wing-song magic.',
    icon: '🦅', color: '#6495ED',
  },
  {
    id: 'fr_permafrost_elemental_lord',
    name: 'Permafrost Elemental Lord',
    type: 'permafrost_elemental',
    rarity: FR_RARITY_RARE,
    hp: 200, attack: 24, defense: 30, speed: 12, frostPower: 40,
    recruitCost: 430,
    description: 'A powerful elemental lord commanding the ancient frozen earth. Summons ice barriers at will.',
    lore: 'Elemental Lords are the physical manifestations of the permafrost itself, awakened in times of need.',
    icon: '🌀', color: '#008B8B',
  },
  {
    id: 'fr_crystal_deer_sovereign',
    name: 'Crystal Deer Sovereign',
    type: 'crystal_deer',
    rarity: FR_RARITY_RARE,
    hp: 150, attack: 20, defense: 24, speed: 26, frostPower: 36,
    recruitCost: 405,
    description: 'The sovereign of all crystal deer. Its antlers project healing frost across the battlefield.',
    lore: 'Sovereigns appear only during the deepest winter, when the aurora green dances brightest.',
    icon: '🦌', color: '#00FA9A',
  },

  // ── Epic Tier (7) ──
  {
    id: 'fr_ice_golem_titan',
    name: 'Ice Golem Titan',
    type: 'ice_golem',
    rarity: FR_RARITY_EPIC,
    hp: 400, attack: 35, defense: 60, speed: 3, frostPower: 30,
    recruitCost: 1000,
    description: 'A towering titan of ancient ice. Its presence alone slows all enemies to a crawl.',
    lore: 'The last Titan was created by the Frost Sovereign herself before the First Border War.',
    icon: '🗿', color: '#1E90FF',
  },
  {
    id: 'fr_frost_wyrm_dread',
    name: 'Frost Wyrm Dread',
    type: 'frost_wyrm',
    rarity: FR_RARITY_EPIC,
    hp: 280, attack: 55, defense: 35, speed: 26, frostPower: 48,
    recruitCost: 1100,
    description: 'A dreaded frost wyrm whose breath can freeze entire armies in seconds.',
    lore: 'Dread wyrms coil around the Frost Reach borders, their bodies forming the mountain ranges.',
    icon: '🐉', color: '#00CED1',
  },
  {
    id: 'fr_glacier_bear_behemoth',
    name: 'Glacier Bear Behemoth',
    type: 'glacier_bear',
    rarity: FR_RARITY_EPIC,
    hp: 350, attack: 48, defense: 50, speed: 8, frostPower: 32,
    recruitCost: 1050,
    description: 'A monstrous glacier bear the size of a warship. Its roar causes avalanches.',
    lore: 'The Behemoth sleeps for centuries beneath glaciers, its dreams creating the winter storms.',
    icon: '🐻', color: '#7FFFD4',
  },
  {
    id: 'fr_snow_leopard_wraith',
    name: 'Snow Leopard Wraith',
    type: 'snow_leopard',
    rarity: FR_RARITY_EPIC,
    hp: 140, attack: 42, defense: 22, speed: 40, frostPower: 38,
    recruitCost: 980,
    description: 'An undead snow leopard spirit that exists between worlds. Strikes from the spirit realm.',
    lore: 'Wraith leopards are the guardians of the boundary between the living Frost Reach and the frozen afterlife.',
    icon: '🐆', color: '#AFEEEE',
  },
  {
    id: 'fr_blizzard_eagle_tempest',
    name: 'Blizzard Eagle Tempest',
    type: 'blizzard_eagle',
    rarity: FR_RARITY_EPIC,
    hp: 180, attack: 38, defense: 28, speed: 42, frostPower: 35,
    recruitCost: 1020,
    description: 'An eagle that rides the eye of storms. Can call down lightning strikes of pure frost.',
    lore: 'Tempest eagles are born during the rare convergence of aurora green and winter lightning.',
    icon: '🦅', color: '#87CEFA',
  },
  {
    id: 'fr_permafrost_elemental_archon',
    name: 'Permafrost Elemental Archon',
    type: 'permafrost_elemental',
    rarity: FR_RARITY_EPIC,
    hp: 260, attack: 32, defense: 40, speed: 14, frostPower: 55,
    recruitCost: 1080,
    description: 'An archon of elemental frost power. Can reshape the terrain into frozen fortifications.',
    lore: 'Archons were the original guardians of the Frost Reach before the first guardians were carved.',
    icon: '🌀', color: '#00BFFF',
  },
  {
    id: 'fr_crystal_deer_spectral',
    name: 'Crystal Deer Spectral',
    type: 'crystal_deer',
    rarity: FR_RARITY_EPIC,
    hp: 180, attack: 26, defense: 30, speed: 30, frostPower: 45,
    recruitCost: 1000,
    description: 'A spectral deer made entirely of prismatic ice. Heals allies with aurora light.',
    lore: 'Spectral deer appear only when the Frost Reach is in gravest danger, guided by the aurora.',
    icon: '🦌', color: '#40E0D0',
  },

  // ── Legendary Tier (7) ──
  {
    id: 'fr_ice_golem_eternal',
    name: 'Eternal Ice Golem',
    type: 'ice_golem',
    rarity: FR_RARITY_LEGENDARY,
    hp: 500, attack: 45, defense: 75, speed: 4, frostPower: 40,
    recruitCost: 2500,
    description: 'The Eternal Golem — indestructible sentinel forged at the dawn of the first ice age.',
    lore: 'It has stood guard at the border for ten thousand years without moving, without rest, without breaking.',
    icon: '🗿', color: '#F0F8FF',
  },
  {
    id: 'fr_frost_wyrm_apex',
    name: 'Apex Frost Wyrm',
    type: 'frost_wyrm',
    rarity: FR_RARITY_LEGENDARY,
    hp: 380, attack: 65, defense: 45, speed: 30, frostPower: 60,
    recruitCost: 2800,
    description: 'The apex predator of the Frost Reach. Its breath can freeze time itself.',
    lore: 'The Apex Wyrm is said to have created the first glacier when it exhaled upon the world.',
    icon: '🐉', color: '#E0FFFF',
  },
  {
    id: 'fr_glacier_bear_primordial',
    name: 'Primordial Glacier Bear',
    type: 'glacier_bear',
    rarity: FR_RARITY_LEGENDARY,
    hp: 450, attack: 55, defense: 60, speed: 10, frostPower: 42,
    recruitCost: 2600,
    description: 'A primordial bear from the age before ages. Its fur is made of indestructible star-ice.',
    lore: 'The Primordial Bear remembers when the world was entirely frozen and dreams of returning it to that state.',
    icon: '🐻', color: '#7FFFD4',
  },
  {
    id: 'fr_snow_leopard_aurora',
    name: 'Aurora Snow Leopard',
    type: 'snow_leopard',
    rarity: FR_RARITY_LEGENDARY,
    hp: 200, attack: 50, defense: 30, speed: 50, frostPower: 52,
    recruitCost: 2700,
    description: 'A leopard woven from aurora light. Exists in all places at once, impossible to hit.',
    lore: 'The Aurora Leopard is the physical avatar of the northern lights, protector of the spirit border.',
    icon: '🐆', color: '#00FF7F',
  },
  {
    id: 'fr_blizzard_eagle_sovereign',
    name: 'Sovereign Blizzard Eagle',
    type: 'blizzard_eagle',
    rarity: FR_RARITY_LEGENDARY,
    hp: 240, attack: 48, defense: 38, speed: 48, frostPower: 46,
    recruitCost: 2650,
    description: 'The Sovereign Eagle whose wingspan blots out the sky. Controls all weather in the Reach.',
    lore: 'When the Sovereign takes flight, the entire Frost Reach falls silent in reverence.',
    icon: '🦅', color: '#B0E0E6',
  },
  {
    id: 'fr_permafrost_elemental_ancient',
    name: 'Ancient Permafrost Elemental',
    type: 'permafrost_elemental',
    rarity: FR_RARITY_LEGENDARY,
    hp: 350, attack: 42, defense: 50, speed: 16, frostPower: 65,
    recruitCost: 2900,
    description: 'The oldest living entity in the Frost Reach. Commands the very foundation of permafrost.',
    lore: 'The Ancient Elemental is the consciousness of the permafrost itself, older than mountains.',
    icon: '🌀', color: '#00CED1',
  },
  {
    id: 'fr_crystal_deer_eternal',
    name: 'Eternal Crystal Deer',
    type: 'crystal_deer',
    rarity: FR_RARITY_LEGENDARY,
    hp: 220, attack: 35, defense: 38, speed: 35, frostPower: 58,
    recruitCost: 2750,
    description: 'The Eternal Deer whose antlers contain the frozen memories of every winter that ever was.',
    lore: 'Legend says the Eternal Deer will guide the worthy to the heart of the Frost Reach at the end of time.',
    icon: '🦌', color: '#48D1CC',
  },
]

// ─── FR_OUTPOSTS (8 outposts) ───────────────────────────────────

export const FR_OUTPOSTS: FrOutpostDef[] = [
  {
    id: 'northwatch_fortress',
    name: 'Northwatch Fortress',
    description: 'The primary defensive stronghold at the northernmost point of the Frost Reach. First line of defense against invaders from the frozen wastes.',
    level: 1, maxLevel: 10,
    resources: { iceCore: 100, crystalShard: 50, frostEssence: 25 },
    capacity: 8, defenseRating: 75, regionColor: '#1E90FF', icon: '🏰',
  },
  {
    id: 'glacier_gate',
    name: 'Glacier Gate',
    description: 'A fortified passage carved through a massive glacier. Controls the main trade route through the Reach.',
    level: 1, maxLevel: 10,
    resources: { iceCore: 80, crystalShard: 70, frostEssence: 30 },
    capacity: 6, defenseRating: 60, regionColor: '#4682B4', icon: '🚪',
  },
  {
    id: 'aurora_spire',
    name: 'Aurora Spire',
    description: 'A towering spire that amplifies aurora energy for defensive barriers. Visible from every corner of the Reach.',
    level: 1, maxLevel: 10,
    resources: { iceCore: 60, crystalShard: 90, frostEssence: 40 },
    capacity: 5, defenseRating: 50, regionColor: '#7FFFD4', icon: '🗼',
  },
  {
    id: 'permafrost_haven',
    name: 'Permafrost Haven',
    description: 'An underground sanctuary built into the permafrost. Houses the primary frost research facilities.',
    level: 1, maxLevel: 10,
    resources: { iceCore: 120, crystalShard: 40, frostEssence: 60 },
    capacity: 10, defenseRating: 85, regionColor: '#5F9EA0', icon: '🏚️',
  },
  {
    id: 'crystal_ridge',
    name: 'Crystal Ridge Outpost',
    description: 'A high-altitude outpost on a ridge of pure crystal formations. Prime location for material harvesting.',
    level: 1, maxLevel: 10,
    resources: { iceCore: 50, crystalShard: 120, frostEssence: 35 },
    capacity: 7, defenseRating: 55, regionColor: '#00CED1', icon: '⛏️',
  },
  {
    id: 'frostfall_bastion',
    name: 'Frostfall Bastion',
    description: 'A sprawling bastion at the edge of the eternal frost zone. Training ground for elite frost guardians.',
    level: 1, maxLevel: 10,
    resources: { iceCore: 90, crystalShard: 60, frostEssence: 50 },
    capacity: 9, defenseRating: 70, regionColor: '#87CEEB', icon: '⚔️',
  },
  {
    id: 'wintershrine_temple',
    name: 'Wintershrine Temple',
    description: 'An ancient temple dedicated to the Frost Spirits. Rituals here grant blessings to all guardians.',
    level: 1, maxLevel: 10,
    resources: { iceCore: 40, crystalShard: 55, frostEssence: 100 },
    capacity: 4, defenseRating: 40, regionColor: '#AFEEEE', icon: '⛪',
  },
  {
    id: 'frozen_echo_outpost',
    name: 'Frozen Echo Outpost',
    description: 'The most remote outpost, positioned at the very edge of known territory. Perpetual blizzard surrounds it.',
    level: 1, maxLevel: 10,
    resources: { iceCore: 110, crystalShard: 80, frostEssence: 70 },
    capacity: 6, defenseRating: 90, regionColor: '#37474F', icon: '🏔️',
  },
]

// ─── FR_MATERIALS (30 ice/crystal materials) ────────────────────

export const FR_MATERIALS: FrMaterialDef[] = [
  // Common Materials (10)
  { id: 'fr_raw_ice', name: 'Raw Ice Chunk', rarity: FR_RARITY_COMMON, description: 'A basic chunk of ice harvested from the frozen landscape. Foundation material for golem construction.', icon: '🧊', color: '#ADD8E6' },
  { id: 'fr_frost_dust', name: 'Frost Dust', rarity: FR_RARITY_COMMON, description: 'Fine crystalline powder that falls during light frost. Used in basic frost enchantments.', icon: '✨', color: '#E0F7FA' },
  { id: 'fr_snow_compact', name: 'Compact Snow Brick', rarity: FR_RARITY_COMMON, description: 'Compressed snow formed into building bricks. Standard construction material.', icon: '🧱', color: '#F0F8FF' },
  { id: 'fr_ice_pebble', name: 'Ice Pebble', rarity: FR_RARITY_COMMON, description: 'Small rounded stones of ice found in frozen riverbeds. Used as ammunition for frost slings.', icon: '⚪', color: '#B0C4DE' },
  { id: 'fr_glacial_water', name: 'Glacial Water Vial', rarity: FR_RARITY_COMMON, description: 'Pure water from an ancient glacier. Retains freezing properties indefinitely.', icon: '💧', color: '#87CEEB' },
  { id: 'fr_frost_thread', name: 'Frost Spider Thread', rarity: FR_RARITY_COMMON, description: 'Silk spun by frost spiders. Incredibly strong despite its delicate appearance.', icon: '🕸️', color: '#AFEEEE' },
  { id: 'fr_icicle_shard', name: 'Icicle Shard', rarity: FR_RARITY_COMMON, description: 'A sharp shard broken from a hanging icicle. Used as a basic weapon component.', icon: '🔶', color: '#ADD8E6' },
  { id: 'fr_snowflake_crystal', name: 'Snowflake Crystal', rarity: FR_RARITY_COMMON, description: 'A perfectly preserved snowflake encased in ice. Each one has a unique geometric pattern.', icon: '❄️', color: '#E0FFFF' },
  { id: 'fr_permafrost_clay', name: 'Permafrost Clay', rarity: FR_RARITY_COMMON, description: 'Frozen clay from deep permafrost layers. Malleable when heated, hardens to stone when cooled.', icon: '🏺', color: '#708090' },
  { id: 'fr_ice_moss', name: 'Ice Moss', rarity: FR_RARITY_COMMON, description: 'A rare moss that grows only on ancient ice. Has medicinal frost properties.', icon: '🌿', color: '#98FB98' },

  // Uncommon Materials (8)
  { id: 'fr_ice_core_fragment', name: 'Ice Core Fragment', rarity: FR_RARITY_UNCOMMON, description: 'A fragment from the heart of an ice core sample. Radiates cold energy.', icon: '💠', color: '#00CED1' },
  { id: 'fr_frost_gem', name: 'Frost Gem', rarity: FR_RARITY_UNCOMMON, description: 'A semi-precious gemstone that formed naturally in extreme cold. Used for enchanting equipment.', icon: '💎', color: '#48D1CC' },
  { id: 'fr_glacial_shard', name: 'Glacial Shard', rarity: FR_RARITY_UNCOMMON, description: 'A shard of thousand-year-old glacial ice. Contains compressed magical energy.', icon: '🔷', color: '#20B2AA' },
  { id: 'fr_crystal_bloom_petal', name: 'Crystal Bloom Petal', rarity: FR_RARITY_UNCOMMON, description: 'A petal from a crystal flower that blooms only during auroras. Powerful alchemical ingredient.', icon: '🌸', color: '#7FFFD4' },
  { id: 'fr_frost_iron_ore', name: 'Frost Iron Ore', rarity: FR_RARITY_UNCOMMON, description: 'Iron ore infused with frost magic. Forges into weapons that chill on contact.', icon: '⛏️', color: '#5F9EA0' },
  { id: 'fr_aurora_dust', name: 'Aurora Dust', rarity: FR_RARITY_UNCOMMON, description: 'Luminous particles collected from aurora displays. Glows with shifting colors.', icon: '🌟', color: '#00FA9A' },
  { id: 'fr_frozen_amber', name: 'Frozen Amber', rarity: FR_RARITY_UNCOMMON, description: 'Ancient tree resin preserved in permafrost. Contains fragments of prehistoric life.', icon: '🟡', color: '#DAA520' },
  { id: 'fr_blizzard_salt', name: 'Blizzard Salt', rarity: FR_RARITY_UNCOMMON, description: 'Magical salt harvested from blizzard ice. Prevents frostbite and wards off ice spirits.', icon: '🧂', color: '#F5F5DC' },

  // Rare Materials (7)
  { id: 'fr_ice_core', name: 'Pure Ice Core', rarity: FR_RARITY_RARE, description: 'A perfectly preserved core of ancient ice. Contains enough energy to power an outpost for a year.', icon: '🔵', color: '#1E90FF' },
  { id: 'fr_crystal_shard', name: 'Enchanted Crystal Shard', rarity: FR_RARITY_RARE, description: 'A large shard of enchanted crystal from the Crystal Ridge. Essential for structure upgrades.', icon: '🔷', color: '#00CED1' },
  { id: 'fr_frost_essence', name: 'Frost Essence', rarity: FR_RARITY_RARE, description: 'Concentrated liquid frost essence extracted from deep permafrost. Extremely potent magic component.', icon: '🧪', color: '#00BFFF' },
  { id: 'fr_aurora_crystal', name: 'Aurora Crystal', rarity: FR_RARITY_RARE, description: 'A crystal that has absorbed aurora energy. Pulses with aurora green light.', icon: '💚', color: '#00FF7F' },
  { id: 'fr_everfrost_ingot', name: 'Everfrost Ingot', rarity: FR_RARITY_RARE, description: 'A metal ingot that is permanently frozen at absolute zero. Cannot be warmed by any known means.', icon: '🪨', color: '#4682B4' },
  { id: 'fr_eternal_ice_sample', name: 'Eternal Ice Sample', rarity: FR_RARITY_RARE, description: 'Ice that never melts, no matter the temperature. Used in the most powerful frost rituals.', icon: '❄️', color: '#E0FFFF' },
  { id: 'fr_permafrost_diamond', name: 'Permafrost Diamond', rarity: FR_RARITY_RARE, description: 'A diamond formed under permafrost pressure over millennia. Contains trapped ancient magic.', icon: '💎', color: '#B9F2FF' },

  // Epic Materials (3)
  { id: 'fr_frostheart_gem', name: 'Frostheart Gem', rarity: FR_RARITY_EPIC, description: 'A gemstone that beats with a cold pulse like a frozen heart. Grants immense frost power.', icon: '💠', color: '#00CED1' },
  { id: 'fr_aurora_scepter_core', name: 'Aurora Scepter Core', rarity: FR_RARITY_EPIC, description: 'The core component of the legendary Aurora Scepter. Channels aurora energy into raw power.', icon: '🔮', color: '#7FFFD4' },
  { id: 'fr_glacier_soul_shard', name: 'Glacier Soul Shard', rarity: FR_RARITY_EPIC, description: 'A shard containing the consciousness of an ancient glacier. Whispers of forgotten ages.', icon: '👁️', color: '#B0E0E6' },

  // Legendary Materials (2)
  { id: 'fr_eternal_frost_core', name: 'Eternal Frost Core', rarity: FR_RARITY_LEGENDARY, description: 'The primordial core of the first frost. Said to be a fragment of the original winter itself.', icon: '🌍', color: '#F0F8FF' },
  { id: 'fr_aurora_crown_jewel', name: 'Aurora Crown Jewel', rarity: FR_RARITY_LEGENDARY, description: 'The most powerful gemstone in the Frost Reach. Contains the light of every aurora that ever shone.', icon: '👑', color: '#48D1CC' },
]

// ─── FR_STRUCTURES (25 outpost structures, upgradeable to level 10) ─

export const FR_STRUCTURES: FrStructureDef[] = [
  // Barracks (4)
  { id: 'fr_barracks_northwatch', name: 'Northwatch Barracks', category: 'barracks', outpostId: 'northwatch_fortress', maxLevel: 10, baseCost: 100, costMultiplier: 1.5, description: 'Housing and training facilities for frost guardians at the Northwatch Fortress.', icon: '🏚️', effectPerLevel: 2 },
  { id: 'fr_barracks_frostfall', name: 'Frostfall Training Hall', category: 'barracks', outpostId: 'frostfall_bastion', maxLevel: 10, baseCost: 120, costMultiplier: 1.5, description: 'Elite training facilities for guardian combat and frost techniques.', icon: '⚔️', effectPerLevel: 3 },
  { id: 'fr_barracks_permafrost', name: 'Permafrost Quarters', category: 'barracks', outpostId: 'permafrost_haven', maxLevel: 10, baseCost: 90, costMultiplier: 1.4, description: 'Underground living quarters carved into the permafrost. Naturally insulated.', icon: '🏠', effectPerLevel: 2 },
  { id: 'fr_barracks_frozen_echo', name: 'Frozen Echo Bivouac', category: 'barracks', outpostId: 'frozen_echo_outpost', maxLevel: 10, baseCost: 110, costMultiplier: 1.5, description: 'A rugged outpost camp for hardened veterans of the border.', icon: '⛺', effectPerLevel: 2 },

  // Workshops (4)
  { id: 'fr_workshop_ice_forge', name: 'Ice Forge', category: 'workshop', outpostId: 'northwatch_fortress', maxLevel: 10, baseCost: 150, costMultiplier: 1.6, description: 'A forge that shapes ice into weapons and armor using ancient cryo techniques.', icon: '🔨', effectPerLevel: 3 },
  { id: 'fr_workshop_crystal_lab', name: 'Crystal Refinery', category: 'workshop', outpostId: 'crystal_ridge', maxLevel: 10, baseCost: 180, costMultiplier: 1.6, description: 'Processes raw crystal materials into refined and enchanted components.', icon: '🔬', effectPerLevel: 4 },
  { id: 'fr_workshop_enchantment', name: 'Frost Enchantment Table', category: 'workshop', outpostId: 'wintershrine_temple', maxLevel: 10, baseCost: 200, costMultiplier: 1.7, description: 'Ancient table for imbuing frost guardians with powerful enchantments.', icon: '🔮', effectPerLevel: 5 },
  { id: 'fr_workshop_repair', name: 'Glacier Repair Station', category: 'workshop', outpostId: 'glacier_gate', maxLevel: 10, baseCost: 130, costMultiplier: 1.5, description: 'Repairs and restores damaged guardians using glacial ice bonding.', icon: '🔧', effectPerLevel: 2 },

  // Storage (3)
  { id: 'fr_storage_ice_vault', name: 'Ice Vault', category: 'storage', outpostId: 'permafrost_haven', maxLevel: 10, baseCost: 80, costMultiplier: 1.4, description: 'A massive underground vault for storing ice cores and rare materials.', icon: '🏛️', effectPerLevel: 10 },
  { id: 'fr_storage_crystal_silo', name: 'Crystal Silo', category: 'storage', outpostId: 'crystal_ridge', maxLevel: 10, baseCost: 90, costMultiplier: 1.4, description: 'Temperature-controlled silo for storing crystal shards at optimal conditions.', icon: '🗄️', effectPerLevel: 8 },
  { id: 'fr_storage_essence_chamber', name: 'Frost Essence Chamber', category: 'storage', outpostId: 'aurora_spire', maxLevel: 10, baseCost: 100, costMultiplier: 1.5, description: 'A specialized chamber that preserves frost essence without degradation.', icon: '📦', effectPerLevel: 6 },

  // Towers (4)
  { id: 'fr_tower_northwatch', name: 'Northwatch Sentry Tower', category: 'tower', outpostId: 'northwatch_fortress', maxLevel: 10, baseCost: 120, costMultiplier: 1.5, description: 'Tall observation tower with advanced frost detection systems.', icon: '🗼', effectPerLevel: 3 },
  { id: 'fr_tower_aurora_beacon', name: 'Aurora Beacon Tower', category: 'tower', outpostId: 'aurora_spire', maxLevel: 10, baseCost: 160, costMultiplier: 1.6, description: 'A beacon tower that projects aurora energy as a defensive barrier.', icon: '🔦', effectPerLevel: 4 },
  { id: 'fr_tower_frostfall', name: 'Frostfall Signal Tower', category: 'tower', outpostId: 'frostfall_bastion', maxLevel: 10, baseCost: 110, costMultiplier: 1.5, description: 'Communications tower that relays frost alerts across the entire Reach.', icon: '📡', effectPerLevel: 3 },
  { id: 'fr_tower_echo_watch', name: 'Echo Watch Tower', category: 'tower', outpostId: 'frozen_echo_outpost', maxLevel: 10, baseCost: 140, costMultiplier: 1.5, description: 'The most remote watchtower, monitoring activity beyond the known border.', icon: '👀', effectPerLevel: 5 },

  // Gates (3)
  { id: 'fr_gate_glacier', name: 'Glacier Gate Reinforcement', category: 'gate', outpostId: 'glacier_gate', maxLevel: 10, baseCost: 200, costMultiplier: 1.6, description: 'Massive reinforced gates carved into the glacier itself.', icon: '🚪', effectPerLevel: 5 },
  { id: 'fr_gate_permafrost', name: 'Permafrost Blast Door', category: 'gate', outpostId: 'permafrost_haven', maxLevel: 10, baseCost: 180, costMultiplier: 1.5, description: 'A heavy blast door made from compressed permafrost layers.', icon: '🛡️', effectPerLevel: 4 },
  { id: 'fr_gate_frostfall', name: 'Frostfall Portcullis', category: 'gate', outpostId: 'frostfall_bastion', maxLevel: 10, baseCost: 170, costMultiplier: 1.5, description: 'An ancient portcullis of frozen iron that raises and lowers on frost-powered mechanisms.', icon: '🔒', effectPerLevel: 4 },

  // Shrines (2)
  { id: 'fr_shrine_winter', name: 'Shrine of Eternal Winter', category: 'shrine', outpostId: 'wintershrine_temple', maxLevel: 10, baseCost: 250, costMultiplier: 1.7, description: 'The primary shrine where frost spirits are communed with for blessings.', icon: '⛩️', effectPerLevel: 6 },
  { id: 'fr_shrine_aurora', name: 'Aurora Blessing Shrine', category: 'shrine', outpostId: 'aurora_spire', maxLevel: 10, baseCost: 220, costMultiplier: 1.6, description: 'A shrine that captures aurora energy to bestow blessings upon guardians.', icon: '🌟', effectPerLevel: 5 },

  // Libraries (2)
  { id: 'fr_library_frost_knowledge', name: 'Frost Knowledge Archive', category: 'library', outpostId: 'permafrost_haven', maxLevel: 10, baseCost: 160, costMultiplier: 1.5, description: 'Houses thousands of ice-carved tablets containing ancient frost knowledge.', icon: '📚', effectPerLevel: 3 },
  { id: 'fr_library_aurora_records', name: 'Aurora Record Hall', category: 'library', outpostId: 'aurora_spire', maxLevel: 10, baseCost: 140, costMultiplier: 1.5, description: 'Contains records of every aurora event in Frost Reach history.', icon: '📜', effectPerLevel: 3 },

  // Walls (3)
  { id: 'fr_wall_northwatch_outer', name: 'Northwatch Outer Wall', category: 'wall', outpostId: 'northwatch_fortress', maxLevel: 10, baseCost: 100, costMultiplier: 1.5, description: 'The primary defensive wall of the Northwatch Fortress.', icon: '🧱', effectPerLevel: 4 },
  { id: 'fr_wall_echo_perimeter', name: 'Frozen Echo Perimeter', category: 'wall', outpostId: 'frozen_echo_outpost', maxLevel: 10, baseCost: 130, costMultiplier: 1.5, description: 'A perimeter wall of reinforced ice at the edge of the known border.', icon: '🧱', effectPerLevel: 5 },
  { id: 'fr_wall_glacier_inner', name: 'Glacier Inner Fortification', category: 'wall', outpostId: 'glacier_gate', maxLevel: 10, baseCost: 90, costMultiplier: 1.4, description: 'Inner fortifications within the glacier passage for secondary defense.', icon: '🧱', effectPerLevel: 3 },
]

// ─── FR_ABILITIES (22 frost abilities) ──────────────────────────

export const FR_ABILITIES: FrAbilityDef[] = [
  // Offensive (7)
  { id: 'fr_ability_frost_nova', name: 'Frost Nova', type: 'offensive', rarity: FR_RARITY_COMMON, power: 30, cooldown: 120, manaCost: 20, description: 'Releases a burst of frost energy in all directions, damaging nearby enemies.', icon: '💥', color: '#ADD8E6' },
  { id: 'fr_ability_ice_lance', name: 'Ice Lance', type: 'offensive', rarity: FR_RARITY_COMMON, power: 45, cooldown: 90, manaCost: 15, description: 'Launches a sharp lance of concentrated ice at a single target.', icon: '🔱', color: '#87CEEB' },
  { id: 'fr_ability_blizzard_breath', name: 'Blizzard Breath', type: 'offensive', rarity: FR_RARITY_UNCOMMON, power: 60, cooldown: 150, manaCost: 35, description: 'Channels a devastating breath of blizzard that damages all enemies in a cone.', icon: '🌬️', color: '#00CED1' },
  { id: 'fr_ability_crystal_rain', name: 'Crystal Rain', type: 'offensive', rarity: FR_RARITY_UNCOMMON, power: 55, cooldown: 180, manaCost: 40, description: 'Summons a rain of razor-sharp crystal shards from above.', icon: '🌧️', color: '#48D1CC' },
  { id: 'fr_ability_glacier_crush', name: 'Glacier Crush', type: 'offensive', rarity: FR_RARITY_RARE, power: 80, cooldown: 200, manaCost: 55, description: 'Commands a glacier to surge forward, crushing everything in its path.', icon: '🏔️', color: '#1E90FF' },
  { id: 'fr_ability_absolute_zero', name: 'Absolute Zero', type: 'offensive', rarity: FR_RARITY_EPIC, power: 120, cooldown: 300, manaCost: 80, description: 'Drops temperature to absolute zero in a large area, freezing enemies solid.', icon: '🔵', color: '#00BFFF' },
  { id: 'fr_ability_aurora_strike', name: 'Aurora Strike', type: 'offensive', rarity: FR_RARITY_LEGENDARY, power: 150, cooldown: 420, manaCost: 100, description: 'Channels the full power of the aurora into a devastating beam of prismatic frost.', icon: '🌈', color: '#7FFFD4' },

  // Defensive (6)
  { id: 'fr_ability_ice_shield', name: 'Ice Shield', type: 'defensive', rarity: FR_RARITY_COMMON, power: 25, cooldown: 60, manaCost: 10, description: 'Creates a protective shield of ice around the caster that absorbs damage.', icon: '🛡️', color: '#B0E0E6' },
  { id: 'fr_ability_frost_wall', name: 'Frost Wall', type: 'defensive', rarity: FR_RARITY_COMMON, power: 30, cooldown: 90, manaCost: 15, description: 'Raises a wall of thick ice between the caster and enemies.', icon: '🧱', color: '#E0F7FA' },
  { id: 'fr_ability_glacier_armor', name: 'Glacier Armor', type: 'defensive', rarity: FR_RARITY_UNCOMMON, power: 50, cooldown: 180, manaCost: 30, description: 'Encases the guardian in a layer of living glacier ice, massively boosting defense.', icon: '🛡️', color: '#4682B4' },
  { id: 'fr_ability_permafrost_barrier', name: 'Permafrost Barrier', type: 'defensive', rarity: FR_RARITY_RARE, power: 70, cooldown: 240, manaCost: 45, description: 'Raises an ancient permafrost barrier that is nearly indestructible.', icon: '🏰', color: '#5F9EA0' },
  { id: 'fr_ability_frozen_sanctuary', name: 'Frozen Sanctuary', type: 'defensive', rarity: FR_RARITY_EPIC, power: 100, cooldown: 360, manaCost: 70, description: 'Creates a sanctuary dome where no hostile force can enter.', icon: '⛪', color: '#00CED1' },
  { id: 'fr_ability_eternal_fortress', name: 'Eternal Fortress', type: 'defensive', rarity: FR_RARITY_LEGENDARY, power: 140, cooldown: 480, manaCost: 90, description: 'Transforms the entire outpost into an indestructible ice fortress temporarily.', icon: '🏰', color: '#F0F8FF' },

  // Utility (5)
  { id: 'fr_ability_frost_step', name: 'Frost Step', type: 'utility', rarity: FR_RARITY_COMMON, power: 0, cooldown: 30, manaCost: 8, description: 'Teleports a short distance by stepping through a plane of frost.', icon: '👣', color: '#AFEEEE' },
  { id: 'fr_ability_ice_bridge', name: 'Ice Bridge', type: 'utility', rarity: FR_RARITY_UNCOMMON, power: 0, cooldown: 120, manaCost: 25, description: 'Creates a bridge of solid ice across any gap or chasm.', icon: '🌉', color: '#87CEEB' },
  { id: 'fr_ability_snowblind', name: 'Snowblind', type: 'utility', rarity: FR_RARITY_UNCOMMON, power: 0, cooldown: 150, manaCost: 30, description: 'Creates a blinding snow effect that reduces enemy vision to zero.', icon: '🌫️', color: '#E0FFFF' },
  { id: 'fr_ability_crystal_path', name: 'Crystal Path', type: 'utility', rarity: FR_RARITY_RARE, power: 0, cooldown: 180, manaCost: 35, description: 'Marks a path with glowing crystals that guides allies through blizzards.', icon: '✨', color: '#7FFFD4' },
  { id: 'fr_ability_aurora_healing', name: 'Aurora Healing', type: 'utility', rarity: FR_RARITY_EPIC, power: 80, cooldown: 300, manaCost: 60, description: 'Channels aurora energy to heal all allies within range.', icon: '💚', color: '#00FA9A' },

  // Passive (4)
  { id: 'fr_ability_frost_aura', name: 'Frost Aura', type: 'passive', rarity: FR_RARITY_COMMON, power: 15, cooldown: 0, manaCost: 0, description: 'Passively radiates cold that slows nearby enemies.', icon: '❄️', color: '#ADD8E6' },
  { id: 'fr_ability_ice_regeneration', name: 'Ice Regeneration', type: 'passive', rarity: FR_RARITY_UNCOMMON, power: 20, cooldown: 0, manaCost: 0, description: 'Slowly regenerates HP by absorbing ambient frost from the environment.', icon: '💚', color: '#00CED1' },
  { id: 'fr_ability_crystal_resonance', name: 'Crystal Resonance', type: 'passive', rarity: FR_RARITY_RARE, power: 25, cooldown: 0, manaCost: 0, description: 'Resonates with nearby crystals, boosting all frost abilities of allied guardians.', icon: '💎', color: '#48D1CC' },
  { id: 'fr_ability_permafrost_constitution', name: 'Permafrost Constitution', type: 'passive', rarity: FR_RARITY_LEGENDARY, power: 40, cooldown: 0, manaCost: 0, description: 'Grants immunity to all frost-based debuffs and massively increases HP regeneration.', icon: '🏔️', color: '#F0F8FF' },
]

// ─── FR_ACHIEVEMENTS (18 achievements) ──────────────────────────

export const FR_ACHIEVEMENTS: FrAchievementDef[] = [
  { id: 'fr_ach_first_recruit', name: 'First Recruit', description: 'Recruit your first frost guardian.', condition: 'totalRecruited >= 1', rewardXp: 50, hidden: false, icon: '🏅' },
  { id: 'fr_ach_border_guard', name: 'Border Guard', description: 'Recruit 5 frost guardians to defend the border.', condition: 'totalRecruited >= 5', rewardXp: 150, hidden: false, icon: '🛡️' },
  { id: 'fr_ach_frost_army', name: 'Frost Army', description: 'Recruit 15 frost guardians into your command.', condition: 'totalRecruited >= 15', rewardXp: 400, hidden: false, icon: '⚔️' },
  { id: 'fr_ach_first_fortify', name: 'First Fortification', description: 'Fortify your first outpost.', condition: 'totalFortified >= 1', rewardXp: 75, hidden: false, icon: '🏰' },
  { id: 'fr_ach_fortified_border', name: 'Fortified Border', description: 'Fortify all 8 outposts at least once.', condition: 'totalFortified >= 8', rewardXp: 500, hidden: false, icon: '🏛️' },
  { id: 'fr_ach_master_builder', name: 'Master Builder', description: 'Build or upgrade 10 outpost structures.', condition: 'totalBuilt >= 10', rewardXp: 350, hidden: false, icon: '🔨' },
  { id: 'fr_ach_architect_supreme', name: 'Supreme Architect', description: 'Build or upgrade 25 outpost structures.', condition: 'totalBuilt >= 25', rewardXp: 800, hidden: true, icon: '🏗️' },
  { id: 'fr_ach_first_artifact', name: 'Artifact Finder', description: 'Activate your first legendary frost artifact.', condition: 'totalArtifactActivated >= 1', rewardXp: 200, hidden: false, icon: '✨' },
  { id: 'fr_ach_collector', name: 'Artifact Collector', description: 'Activate 5 legendary frost artifacts.', condition: 'totalArtifactActivated >= 5', rewardXp: 600, hidden: false, icon: '💎' },
  { id: 'fr_ach_event_horizon', name: 'Event Horizon', description: 'Trigger 5 random reach events.', condition: 'totalEventsTriggered >= 5', rewardXp: 200, hidden: false, icon: '🎲' },
  { id: 'fr_ach_storm_rider', name: 'Storm Rider', description: 'Survive 10 random reach events.', condition: 'totalEventsTriggered >= 10', rewardXp: 450, hidden: false, icon: '🌪️' },
  { id: 'fr_ach_resource_hoarder', name: 'Resource Hoarder', description: 'Gather 1000 total resources across all types.', condition: 'totalResourcesGathered >= 1000', rewardXp: 300, hidden: false, icon: '📦' },
  { id: 'fr_ach_ice_tycoon', name: 'Ice Tycoon', description: 'Gather 5000 total resources across all types.', condition: 'totalResourcesGathered >= 5000', rewardXp: 750, hidden: true, icon: '💰' },
  { id: 'fr_ach_defender_excellent', name: 'Excellent Defender', description: 'Successfully defend outposts 10 times.', condition: 'totalOutpostsDefended >= 10', rewardXp: 350, hidden: false, icon: '🏆' },
  { id: 'fr_ach_all_guardians', name: 'Complete Roster', description: 'Recruit all 35 frost guardians.', condition: 'totalRecruited >= 35', rewardXp: 2000, hidden: true, icon: '🌟' },
  { id: 'fr_ach_all_artifacts', name: 'Artifact Mastery', description: 'Activate all 15 legendary artifacts.', condition: 'totalArtifactActivated >= 15', rewardXp: 1500, hidden: true, icon: '👑' },
  { id: 'fr_ach_survivor', name: 'Border Survivor', description: 'Lose zero guardians throughout your entire journey.', condition: 'totalGuardiansLost == 0 && totalRecruited >= 10', rewardXp: 1000, hidden: true, icon: '❄️' },
  { id: 'fr_ach_reach_master', name: 'Frost Reach Master', description: 'Unlock all other achievements.', condition: 'achievements_count >= 17', rewardXp: 5000, hidden: true, icon: '🏔️' },
]

// ─── FR_TITLES (8 progression titles) ───────────────────────────

export const FR_TITLES: FrTitleDef[] = [
  { id: 'fr_title_wanderer', name: 'Frost Wanderer', requirement: 'Begin your journey in the Frost Reach.', minGuardians: 0, minOutposts: 0, bonusMultiplier: 1.0, icon: '🚶' },
  { id: 'fr_title_recruit', name: 'Border Recruit', requirement: 'Recruit 3 frost guardians.', minGuardians: 3, minOutposts: 0, bonusMultiplier: 1.1, icon: '🧊' },
  { id: 'fr_title_scout', name: 'Reach Scout', requirement: 'Recruit 5 guardians and fortify 1 outpost.', minGuardians: 5, minOutposts: 1, bonusMultiplier: 1.2, icon: '🔭' },
  { id: 'fr_title_ranger', name: 'Frost Ranger', requirement: 'Recruit 10 guardians and fortify 3 outposts.', minGuardians: 10, minOutposts: 3, bonusMultiplier: 1.3, icon: '🏹' },
  { id: 'fr_title_commander', name: 'Reach Commander', requirement: 'Recruit 15 guardians and fortify 5 outposts.', minGuardians: 15, minOutposts: 5, bonusMultiplier: 1.5, icon: '⚔️' },
  { id: 'fr_title_warden', name: 'Ice Warden', requirement: 'Recruit 20 guardians and fortify 6 outposts.', minGuardians: 20, minOutposts: 6, bonusMultiplier: 1.7, icon: '🛡️' },
  { id: 'fr_title_sovereign', name: 'Frost Sovereign', requirement: 'Recruit 30 guardians and fortify all outposts.', minGuardians: 30, minOutposts: 8, bonusMultiplier: 2.0, icon: '👑' },
  { id: 'fr_title_eternal', name: 'Eternal Guardian', requirement: 'Recruit all guardians, activate all artifacts, and unlock all achievements.', minGuardians: 35, minOutposts: 8, bonusMultiplier: 2.5, icon: '🏔️' },
]

// ─── FR_ARTIFACTS (15 legendary frost artifacts) ────────────────

export const FR_ARTIFACTS: FrArtifactDef[] = [
  { id: 'fr_art_heart_of_winter', name: 'Heart of Winter', rarity: FR_RARITY_LEGENDARY, description: 'A crystallized heart from the original winter. Pulses with ancient frost energy that strengthens all nearby guardians.', lore: 'The Heart of Winter was found at the bottom of the deepest ice core, still beating after millennia.', powerBonus: 25, defenseBonus: 15, frostBonus: 30, icon: '💙', color: '#4682B4' },
  { id: 'fr_art_aurora_crown', name: 'Aurora Crown', rarity: FR_RARITY_LEGENDARY, description: 'A crown woven from solidified aurora light. Grants the wearer dominion over the northern lights.', lore: 'The Aurora Crown was forged during the last Great Convergence when all seven aurora colors aligned.', powerBonus: 20, defenseBonus: 25, frostBonus: 35, icon: '👑', color: '#7FFFD4' },
  { id: 'fr_art_frostfire_blade', name: 'Frostfire Blade', rarity: FR_RARITY_EPIC, description: 'A blade that burns with cold fire — its flames freeze instead of ignite. Devastating against fire-based enemies.', lore: 'Created when a comet of blue fire struck the heart of an ancient glacier during a solar eclipse.', powerBonus: 40, defenseBonus: 5, frostBonus: 20, icon: '🗡️', color: '#00CED1' },
  { id: 'fr_art_permafrost_aegis', name: 'Permafrost Aegis', rarity: FR_RARITY_EPIC, description: 'An impenetrable shield made from the oldest permafrost on earth. Absorbs all damage and converts it to frost energy.', lore: 'Nothing has ever damaged the Permafrost Aegis. It predates the first ice age by millions of years.', powerBonus: 5, defenseBonus: 50, frostBonus: 15, icon: '🛡️', color: '#5F9EA0' },
  { id: 'fr_art_glacier_eye', name: 'Glacier Eye', rarity: FR_RARITY_EPIC, description: 'A perfectly round gemstone found inside a glacier. Grants the ability to see through any ice or snow.', lore: 'The Glacier Eye is said to be the actual eye of an ancient ice god who sacrificed it to watch over the border.', powerBonus: 15, defenseBonus: 10, frostBonus: 25, icon: '👁️', color: '#87CEEB' },
  { id: 'fr_art_eternal_blizzard_orb', name: 'Eternal Blizzard Orb', rarity: FR_RARITY_LEGENDARY, description: 'A small orb containing a perpetual blizzard. Shaking it releases a localized storm.', lore: 'The Eternal Blizzard Orb was created by the Frost Spirits as a last resort weapon against border invaders.', powerBonus: 35, defenseBonus: 10, frostBonus: 40, icon: '🌀', color: '#00BFFF' },
  { id: 'fr_art_crystal_deer_antler', name: 'Crystal Deer Antler', rarity: FR_RARITY_EPIC, description: 'An antler shed by the Eternal Crystal Deer. Radiates healing frost energy.', lore: 'The antler regrows each century. Finding a shed one is considered the greatest blessing of the Frost Reach.', powerBonus: 10, defenseBonus: 20, frostBonus: 30, icon: '🦌', color: '#66CDAA' },
  { id: 'fr_art_frost_sovereign_scepter', name: 'Frost Sovereign Scepter', rarity: FR_RARITY_LEGENDARY, description: 'The scepter of the legendary Frost Sovereign. Commands absolute authority over all frost guardians.', lore: 'Only a true Frost Reach Master can wield this scepter without being consumed by its power.', powerBonus: 30, defenseBonus: 20, frostBonus: 45, icon: '🗡️', color: '#F0F8FF' },
  { id: 'fr_art_ice_tome', name: 'Tome of Ancient Ice', rarity: FR_RARITY_RARE, description: 'A book made of frozen pages containing the forgotten frost spells of the first civilization.', lore: 'The pages of this tome are so cold that they freeze any moisture in the air when opened.', powerBonus: 20, defenseBonus: 15, frostBonus: 20, icon: '📖', color: '#B0E0E6' },
  { id: 'fr_art_blizzard_horn', name: 'Horn of the Blizzard', rarity: FR_RARITY_EPIC, description: 'A horn carved from the tusk of a legendary frost wyrm. Its sound summons a blizzard.', lore: 'When the Horn of the Blizzard is blown, every frost guardian within earshot receives a surge of power.', powerBonus: 25, defenseBonus: 15, frostBonus: 25, icon: '📯', color: '#1E90FF' },
  { id: 'fr_art_frozen_star_fragment', name: 'Frozen Star Fragment', rarity: FR_RARITY_LEGENDARY, description: 'A piece of a star that fell to earth and froze mid-descent. Contains cosmic frost energy.', lore: 'Scientists believe the star it came from was made entirely of exotic ice that exists at absolute zero.', powerBonus: 35, defenseBonus: 25, frostBonus: 50, icon: '⭐', color: '#E0FFFF' },
  { id: 'fr_art_snow_mantle', name: 'Snow Mantle of the Ancients', rarity: FR_RARITY_RARE, description: 'A cloak made from the first snowfall of every winter in recorded history. Grants incredible speed.', lore: 'The Snow Mantle feels weightless but provides warmth in the coldest conditions imaginable.', powerBonus: 10, defenseBonus: 10, frostBonus: 15, icon: '🧥', color: '#F0F8FF' },
  { id: 'fr_art_frost_giant_ring', name: 'Frost Giant Ring', rarity: FR_RARITY_RARE, description: 'A signet ring that once belonged to a frost giant king. Grants immense physical strength.', lore: 'The frost giant king wore this ring for ten thousand years before losing it in a game of ice chess.', powerBonus: 30, defenseBonus: 20, frostBonus: 10, icon: '💍', color: '#4682B4' },
  { id: 'fr_art_crystal_map', name: 'Crystal Map of the Reach', rarity: FR_RARITY_EPIC, description: 'A map of the entire Frost Reach etched into a single massive crystal. Reveals all hidden locations.', lore: 'The Crystal Map was created by the first explorers of the Frost Reach and has been updated by every generation since.', powerBonus: 10, defenseBonus: 15, frostBonus: 20, icon: '🗺️', color: '#48D1CC' },
  { id: 'fr_art_winters_end_chalice', name: "Winter's End Chalice", rarity: FR_RARITY_LEGENDARY, description: 'A chalice that never empties. Whatever liquid is poured into it becomes liquid frost essence.', lore: 'Drinking from the Winter\'s End Chalice grants temporary invulnerability to all temperature extremes.', powerBonus: 20, defenseBonus: 30, frostBonus: 35, icon: '🏆', color: '#00CED1' },
]

// ─── FR_GUARDIAN_TYPES (7 types with metadata) ──────────────────

export const FR_GUARDIAN_TYPES: { type: FrGuardianType; name: string; icon: string; color: string; description: string; role: string }[] = [
  { type: 'ice_golem', name: 'Ice Golem', icon: '🗿', color: '#ADD8E6', description: 'Hulking constructs of animated ice, the backbone of any Frost Reach defense force.', role: 'Tank' },
  { type: 'frost_wyrm', name: 'Frost Wyrm', icon: '🐉', color: '#00CED1', description: 'Serpentine dragons that dwell in glacial crevasses, breathing concentrated frost.', role: 'DPS' },
  { type: 'glacier_bear', name: 'Glacier Bear', icon: '🐻', color: '#F0F8FF', description: 'Massive bears with fur of living ice. Their strength is matched only by their loyalty.', role: 'Bruiser' },
  { type: 'snow_leopard', name: 'Snow Leopard', icon: '🐆', color: '#7FFFD4', description: 'Lightning-fast predators that strike from the shadows of blizzards.', role: 'Assassin' },
  { type: 'blizzard_eagle', name: 'Blizzard Eagle', icon: '🦅', color: '#87CEEB', description: 'Majestic raptors that ride the frozen winds and control weather patterns.', role: 'Scout' },
  { type: 'permafrost_elemental', name: 'Permafrost Elemental', icon: '🌀', color: '#20B2AA', description: 'Living manifestations of ancient permafrost magic, masters of frost sorcery.', role: 'Mage' },
  { type: 'crystal_deer', name: 'Crystal Deer', icon: '🦌', color: '#48D1CC', description: 'Graceful creatures whose prismatic antlers store and channel healing frost energy.', role: 'Support' },
]

// ─── FR_ABILITY_TYPES (4 types with metadata) ──────────────────

export const FR_ABILITY_TYPES: { type: FrAbilityType; name: string; icon: string; color: string; description: string }[] = [
  { type: 'offensive', name: 'Offensive', icon: '⚔️', color: '#FF6B6B', description: 'Abilities focused on dealing frost damage to enemies.' },
  { type: 'defensive', name: 'Defensive', icon: '🛡️', color: '#ADD8E6', description: 'Abilities that create protective barriers and reduce incoming damage.' },
  { type: 'utility', name: 'Utility', icon: '🔧', color: '#7FFFD4', description: 'Abilities that provide tactical advantages like healing and mobility.' },
  { type: 'passive', name: 'Passive', icon: '✨', color: '#00CED1', description: 'Always-active abilities that provide continuous bonuses to guardians.' },
]

// ─── FR_STRUCTURE_CATEGORIES (8 categories with metadata) ──────

export const FR_STRUCTURE_CATEGORIES: { category: FrStructureCategory; name: string; icon: string; color: string; description: string }[] = [
  { category: 'barracks', name: 'Barracks', icon: '🏚️', color: '#4682B4', description: 'Housing and training facilities for frost guardians.' },
  { category: 'workshop', name: 'Workshop', icon: '🔨', color: '#5F9EA0', description: 'Production facilities for crafting equipment and enchantments.' },
  { category: 'storage', name: 'Storage', icon: '🏛️', color: '#708090', description: 'Secure storage for materials, resources, and artifacts.' },
  { category: 'tower', name: 'Tower', icon: '🗼', color: '#1E90FF', description: 'Observation and defensive towers for border surveillance.' },
  { category: 'gate', name: 'Gate', icon: '🚪', color: '#87CEEB', description: 'Fortified gates controlling access to outpost interior zones.' },
  { category: 'shrine', name: 'Shrine', icon: '⛩️', color: '#7FFFD4', description: 'Sacred places where frost spirits commune and grant blessings.' },
  { category: 'library', name: 'Library', icon: '📚', color: '#AFEEEE', description: 'Archives of ancient frost knowledge and historical records.' },
  { category: 'wall', name: 'Wall', icon: '🧱', color: '#B0C4DE', description: 'Defensive walls and fortifications protecting outpost perimeters.' },
]

// ─── FR_LEVEL_XP_TABLE ─────────────────────────────────────────

export const FR_LEVEL_XP_TABLE: Record<number, number> = {
  1: 0, 2: 100, 3: 250, 4: 500, 5: 800, 6: 1200, 7: 1700, 8: 2300,
  9: 3000, 10: 4000, 11: 5200, 12: 6500, 13: 8000, 14: 9700, 15: 11500,
  16: 13500, 17: 15700, 18: 18100, 19: 20700, 20: 23500, 21: 26500, 22: 29700,
  23: 33100, 24: 36700, 25: 40500, 26: 44500, 27: 48700, 28: 53100, 29: 57700,
  30: 62500,
}

// ─── FR_SEASONS (seasonal modifiers for the Frost Reach) ───────

export const FR_SEASONS = [
  { id: 'deep_winter', name: 'Deep Winter', description: 'The coldest and darkest season. Guardian frost power is amplified.', frostBonus: 1.5, recruitCostMod: 0.8, icon: '🥶', color: '#4682B4' },
  { id: 'early_frost', name: 'Early Frost', description: 'First frosts begin to form. A time of preparation and recruitment.', frostBonus: 1.1, recruitCostMod: 1.0, icon: '🌨️', color: '#87CEEB' },
  { id: 'thaw_period', name: 'Thaw Period', description: 'Brief warming brings danger. Permafrost weakens, enemies advance.', frostBonus: 0.8, recruitCostMod: 1.2, icon: '💧', color: '#20B2AA' },
  { id: 'aurora_season', name: 'Aurora Season', description: 'The sky dances with aurora light. Special events and discoveries abound.', frostBonus: 1.3, recruitCostMod: 0.9, icon: '🌈', color: '#7FFFD4' },
] as const

// ─── FR_REACH_EVENTS (12 random reach events) ───────────────────

export const FR_REACH_EVENTS: FrReachEventDef[] = [
  { id: 'fr_event_ice_storm', name: 'Sudden Ice Storm', description: 'A violent ice storm strikes the Frost Reach without warning. Guardians must take shelter.', severity: 'moderate', duration: 120, rewardXp: 50, rewardResources: { iceCore: 20, crystalShard: 10, frostEssence: 5 }, riskLevel: 3, icon: '🌨️', color: '#87CEEB' },
  { id: 'fr_event_aurora_surge', name: 'Aurora Surge', description: 'A massive surge of aurora energy bathes the entire Reach in prismatic light. All guardians gain temporary power.', severity: 'mild', duration: 60, rewardXp: 80, rewardResources: { iceCore: 10, crystalShard: 15, frostEssence: 20 }, riskLevel: 1, icon: '🌌', color: '#7FFFD4' },
  { id: 'fr_event_glacial_crack', name: 'Glacial Crack', description: 'A massive crack appears in the glacier near an outpost. Emergency fortification needed.', severity: 'severe', duration: 180, rewardXp: 100, rewardResources: { iceCore: 40, crystalShard: 20, frostEssence: 10 }, riskLevel: 5, icon: '🏔️', color: '#4682B4' },
  { id: 'fr_event_frost_spirit_visit', name: 'Frost Spirit Visit', description: 'Ancient frost spirits materialize at the Wintershrine Temple, offering blessings to worthy guardians.', severity: 'mild', duration: 90, rewardXp: 120, rewardResources: { iceCore: 5, crystalShard: 5, frostEssence: 40 }, riskLevel: 1, icon: '👻', color: '#AFEEEE' },
  { id: 'fr_event_permafrost_thaw', name: 'Permafrost Thaw', description: 'An unusual permafrost thaw reveals ancient artifacts buried for millennia. Quick, claim them!', severity: 'mild', duration: 60, rewardXp: 70, rewardResources: { iceCore: 30, crystalShard: 25, frostEssence: 15 }, riskLevel: 2, icon: '💧', color: '#20B2AA' },
  { id: 'fr_event_blizzard_invasion', name: 'Blizzard Invasion', description: 'An army of frost creatures rides in on a massive blizzard, attacking border outposts.', severity: 'catastrophic', duration: 300, rewardXp: 200, rewardResources: { iceCore: 60, crystalShard: 40, frostEssence: 30 }, riskLevel: 8, icon: '🌪️', color: '#37474F' },
  { id: 'fr_event_crystal_resonance', name: 'Crystal Resonance', description: 'The crystals at Crystal Ridge begin resonating at a harmonic frequency, amplifying all frost magic.', severity: 'mild', duration: 120, rewardXp: 90, rewardResources: { iceCore: 10, crystalShard: 50, frostEssence: 10 }, riskLevel: 1, icon: '💎', color: '#00CED1' },
  { id: 'fr_event_frozen_discovery', name: 'Frozen Discovery', description: 'Explorers find a perfectly preserved ancient creature frozen in ice. Studying it yields knowledge.', severity: 'moderate', duration: 150, rewardXp: 130, rewardResources: { iceCore: 15, crystalShard: 15, frostEssence: 25 }, riskLevel: 2, icon: '🧊', color: '#B0C4DE' },
  { id: 'fr_event_avalanche_warning', name: 'Avalanche Warning', description: 'Sensors detect an imminent avalanche threatening the Frozen Echo Outpost. Emergency response!', severity: 'severe', duration: 90, rewardXp: 110, rewardResources: { iceCore: 25, crystalShard: 15, frostEssence: 10 }, riskLevel: 6, icon: '⚠️', color: '#5F9EA0' },
  { id: 'fr_event_aurora_storm', name: 'Aurora Storm', description: 'The most powerful aurora display in recorded history. The sky burns with every color of frost.', severity: 'moderate', duration: 180, rewardXp: 150, rewardResources: { iceCore: 20, crystalShard: 20, frostEssence: 35 }, riskLevel: 3, icon: '🌈', color: '#00FA9A' },
  { id: 'fr_event_ice_wyrm_migration', name: 'Ice Wyrm Migration', description: 'Hundreds of frost wyrms migrate through the Reach. Dangerous but provides rare materials.', severity: 'severe', duration: 240, rewardXp: 180, rewardResources: { iceCore: 35, crystalShard: 30, frostEssence: 20 }, riskLevel: 7, icon: '🐉', color: '#1E90FF' },
  { id: 'fr_event_eternal_frost_echo', name: 'Eternal Frost Echo', description: 'A mysterious echo of ancient frost magic reverberates across the Reach. All guardians feel its call.', severity: 'moderate', duration: 200, rewardXp: 160, rewardResources: { iceCore: 15, crystalShard: 10, frostEssence: 45 }, riskLevel: 4, icon: '🔮', color: '#E0FFFF' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION: UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function frFindGuardian(id: string): FrGuardianDef | undefined {
  return FR_GUARDIANS.find((g) => g.id === id)
}

function frFindOutpost(id: string): FrOutpostDef | undefined {
  return FR_OUTPOSTS.find((o) => o.id === id)
}

function frFindMaterial(id: string): FrMaterialDef | undefined {
  return FR_MATERIALS.find((m) => m.id === id)
}

function frFindStructure(id: string): FrStructureDef | undefined {
  return FR_STRUCTURES.find((s) => s.id === id)
}

function frFindAbility(id: string): FrAbilityDef | undefined {
  return FR_ABILITIES.find((a) => a.id === id)
}

function frFindAchievement(id: string): FrAchievementDef | undefined {
  return FR_ACHIEVEMENTS.find((a) => a.id === id)
}

function frFindTitle(id: string): FrTitleDef | undefined {
  return FR_TITLES.find((t) => t.id === id)
}

function frFindArtifact(id: string): FrArtifactDef | undefined {
  return FR_ARTIFACTS.find((a) => a.id === id)
}

function frFindEvent(id: string): FrReachEventDef | undefined {
  return FR_REACH_EVENTS.find((e) => e.id === id)
}

function frGenerateId(): string {
  return `fr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function frRarityCostMultiplier(rarity: FrRarity): number {
  return FR_RARITY_XP_MULTIPLIER[rarity]
}

function frRandomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function frXpForLevel(level: number): number {
  return FR_LEVEL_XP_TABLE[level] ?? Math.floor(100 * Math.pow(1.5, level - 1))
}

function frXpProgressPercent(xp: number, level: number): number {
  const currentReq = FR_LEVEL_XP_TABLE[level] ?? 0
  const nextReq = FR_LEVEL_XP_TABLE[level + 1] ?? Math.floor(100 * Math.pow(1.5, level))
  if (nextReq === currentReq) return 100
  return Math.min(100, Math.round(((xp - currentReq) / (nextReq - currentReq)) * 100))
}

function frLevelForXp(xp: number): number {
  let lvl = 1
  for (const [l, req] of Object.entries(FR_LEVEL_XP_TABLE)) {
    if (xp >= req) lvl = parseInt(l, 10)
    else break
  }
  return lvl
}

function frRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function frWeightedRandomByRarity(): FrRarity {
  const weights = FR_RARITY_RECRUIT_WEIGHTS
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
  let roll = Math.random() * totalWeight
  for (const [rarity, weight] of Object.entries(weights)) {
    roll -= weight
    if (roll <= 0) return rarity as FrRarity
  }
  return FR_RARITY_COMMON
}

function frRandomGuardianByRarity(rarity: FrRarity): FrGuardianDef | undefined {
 const pool = FR_GUARDIANS.filter((g) => g.rarity === rarity)
 return frRandomFrom(pool)
}

function frCalcMaxTitle(guardianCount: number, outpostCount: number): string {
  let bestTitle = FR_TITLES[0].id
  for (const title of FR_TITLES) {
    if (guardianCount >= title.minGuardians && outpostCount >= title.minOutposts) {
      bestTitle = title.id
    }
  }
  return bestTitle
}

function frCheckAchievementCondition(condition: string, stats: FrostReachState['frStats'], achievementsCount: number): boolean {
  const parts = condition.split(' >= ')
  const field = parts[0].trim()
  const value = parseInt(parts[1] ?? '0', 10)
  const eqParts = condition.split(' == ')
  const eqField = eqParts[0].trim()
  const eqValue = parseInt(eqParts[1] ?? '0', 10)
  if (eqParts.length === 2) {
    if (eqField === 'totalGuardiansLost') return stats.totalGuardiansLost === eqValue && stats.totalRecruited >= 10
    if (eqField === 'achievements_count') return achievementsCount >= eqValue
  }
  if (parts.length === 2) {
    const statValue = (stats as Record<string, number>)[field]
    if (typeof statValue === 'number') return statValue >= value
  }
  return false
}

function frStructureUpgradeCost(def: FrStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

// ═══════════════════════════════════════════════════════════════════
// SECTION: DEFAULT STATE
// ═══════════════════════════════════════════════════════════════════

const FR_INITIAL_STATE: FrostReachState = {
  frGuardians: {},
  frOutposts: {},
  frInventory: [],
  frArtifacts: [],
  frAchievements: [],
  frTitle: 'fr_title_wanderer',
  frEvents: [],
  frStats: {
    totalRecruited: 0,
    totalFortified: 0,
    totalBuilt: 0,
    totalArtifactActivated: 0,
    totalEventsTriggered: 0,
    totalGuardiansLost: 0,
    totalOutpostsDefended: 0,
    totalResourcesGathered: 0,
  },
}

// ═══════════════════════════════════════════════════════════════════
// SECTION: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

interface FrFullStore extends FrostReachState {
  frRecruitGuardian: (id: string) => boolean
  frFortifyOutpost: (id: string) => boolean
  frBuildStructure: (id: string) => boolean
  frActivateArtifact: (id: string) => boolean
  frTriggerReachEvent: () => FrReachEventDef | null
  frResetFrostReach: () => void
  frAddInventory: (materialId: string, count: number) => void
  frRemoveInventory: (materialId: string, count: number) => boolean
  frClaimAchievement: (id: string) => boolean
}

const useFrStore = create<FrFullStore>()(
  persist(
    (set, get) => ({
      ...FR_INITIAL_STATE,

      // ── frRecruitGuardian ──────────────────────────────────
      frRecruitGuardian: (id: string): boolean => {
        const def = frFindGuardian(id)
        if (!def) return false
        const state = get()
        const existingCount = Object.keys(state.frGuardians).length
        if (existingCount >= 50) return false
        const newGuardian: FrGuardianState = {
          guardianId: id,
          nickname: def.name,
          level: 1,
          xp: 0,
          hp: def.hp,
          maxHp: def.hp,
          recruitedAt: Date.now(),
          outpostId: null,
          isActive: false,
        }
        set((prev) => ({
          frGuardians: {
            ...prev.frGuardians,
            [frGenerateId()]: newGuardian,
          },
          frTitle: frCalcMaxTitle(
            Object.keys(prev.frGuardians).length + 1,
            Object.keys(prev.frOutposts).length,
          ),
          frStats: {
            ...prev.frStats,
            totalRecruited: prev.frStats.totalRecruited + 1,
          },
        }))
        return true
      },

      // ── frFortifyOutpost ──────────────────────────────────
      frFortifyOutpost: (id: string): boolean => {
        const def = frFindOutpost(id)
        if (!def) return false
        const state = get()
        const current = state.frOutposts[id]
        if (current && current.fortifiedLevel >= def.maxLevel) return false
        const newLevel = current ? current.fortifiedLevel + 1 : 1
        set((prev) => {
          const updatedOutposts = { ...prev.frOutposts }
          updatedOutposts[id] = {
            outpostId: id,
            fortifiedLevel: newLevel,
            garrisonCount: (updatedOutposts[id]?.garrisonCount ?? 0) + 1,
            supplyLevel: updatedOutposts[id]?.supplyLevel ?? 1,
            morale: updatedOutposts[id]?.morale ?? 75,
            lastDefendedAt: updatedOutposts[id]?.lastDefendedAt ?? null,
            totalDefenses: updatedOutposts[id]?.totalDefenses ?? 0,
          }
          const outpostCount = Object.keys(updatedOutposts).length
          return {
            frOutposts: updatedOutposts,
            frTitle: frCalcMaxTitle(
              Object.keys(prev.frGuardians).length,
              outpostCount,
            ),
            frStats: {
              ...prev.frStats,
              totalFortified: prev.frStats.totalFortified + 1,
              totalResourcesGathered: prev.frStats.totalResourcesGathered + 15,
            },
          }
        })
        return true
      },

      // ── frBuildStructure ──────────────────────────────────
      frBuildStructure: (id: string): boolean => {
        const def = frFindStructure(id)
        if (!def) return false
        const state = get()
        const current = state.frGuardians[`struct_${id}`] as unknown as FrStructureState | undefined
        const existingLevel = current ? (state.frOutposts[`sl_${id}`] as unknown as number) ?? 0 : 0
        if (existingLevel >= def.maxLevel) return false
        const newLevel = existingLevel + 1
        const cost = frStructureUpgradeCost(def, existingLevel)
        set((prev) => {
          const updatedOutposts = { ...prev.frOutposts }
          updatedOutposts[`sl_${id}`] = newLevel as unknown as FrOutpostState
          return {
            frOutposts: updatedOutposts,
            frStats: {
              ...prev.frStats,
              totalBuilt: prev.frStats.totalBuilt + 1,
              totalResourcesGathered: prev.frStats.totalResourcesGathered + Math.floor(cost * 0.1),
            },
          }
        })
        return true
      },

      // ── frActivateArtifact ────────────────────────────────
      frActivateArtifact: (id: string): boolean => {
        const def = frFindArtifact(id)
        if (!def) return false
        const state = get()
        if (state.frArtifacts.includes(id)) return false
        set((prev) => ({
          frArtifacts: [...prev.frArtifacts, id],
          frStats: {
            ...prev.frStats,
            totalArtifactActivated: prev.frStats.totalArtifactActivated + 1,
          },
        }))
        return true
      },

      // ── frTriggerReachEvent ───────────────────────────────
      frTriggerReachEvent: (): FrReachEventDef | null => {
        const event = frRandomFrom(FR_REACH_EVENTS)
        if (!event) return null
        set((prev) => ({
          frEvents: [...prev.frEvents, event.id],
          frStats: {
            ...prev.frStats,
            totalEventsTriggered: prev.frStats.totalEventsTriggered + 1,
            totalResourcesGathered:
              prev.frStats.totalResourcesGathered +
              event.rewardResources.iceCore +
              event.rewardResources.crystalShard +
              event.rewardResources.frostEssence,
            totalOutpostsDefended:
              prev.frStats.totalOutpostsDefended + (event.riskLevel > 4 ? 1 : 0),
          },
        }))
        return event
      },

      // ── frResetFrostReach ─────────────────────────────────
      frResetFrostReach: () => {
        set({ ...FR_INITIAL_STATE })
      },

      // ── frAddInventory ────────────────────────────────────
      frAddInventory: (materialId: string, count: number) => {
        set((prev) => {
          const existing = prev.frInventory.find((i) => i.materialId === materialId)
          if (existing) {
            return {
              frInventory: prev.frInventory.map((i) =>
                i.materialId === materialId ? { ...i, count: i.count + count } : i,
              ),
            }
          }
          return {
            frInventory: [...prev.frInventory, { materialId, count }],
          }
        })
      },

      // ── frRemoveInventory ─────────────────────────────────
      frRemoveInventory: (materialId: string, count: number): boolean => {
        const state = get()
        const item = state.frInventory.find((i) => i.materialId === materialId)
        if (!item || item.count < count) return false
        set((prev) => ({
          frInventory: prev.frInventory
            .map((i) =>
              i.materialId === materialId ? { ...i, count: i.count - count } : i,
            )
            .filter((i) => i.count > 0),
        }))
        return true
      },

      // ── frClaimAchievement ────────────────────────────────
      frClaimAchievement: (id: string): boolean => {
        const def = frFindAchievement(id)
        if (!def) return false
        const state = get()
        if (state.frAchievements.includes(id)) return false
        if (!frCheckAchievementCondition(def.condition, state.frStats, state.frAchievements.length)) {
          return false
        }
        set((prev) => ({
          frAchievements: [...prev.frAchievements, id],
        }))
        return true
      },
    }),
    {
      name: 'frost-reach-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION: MAIN HOOK — useFrostReach()
// ═══════════════════════════════════════════════════════════════════

export default function useFrostReach() {
  const store = useFrStore()

  // ── Computed: Guardians with definitions ──────────────────
  const frGuardiansWithDefs = useMemo(() => {
    return Object.entries(store.frGuardians).map(([key, gs]) => {
      const def = frFindGuardian(gs.guardianId)
      return {
        key,
        ...gs,
        def,
        rarityColor: def ? FR_RARITY_COLORS[def.rarity] : '#888888',
        rarityIcon: def ? FR_RARITY_ICONS[def.rarity] : '🧊',
      }
    })
  }, [store])

  // ── Computed: Outposts with definitions ───────────────────
  const frOutpostsWithDefs = useMemo(() => {
    return FR_OUTPOSTS.map((def) => {
      const state = store.frOutposts[def.id]
      return {
        def,
        state: state ?? {
          outpostId: def.id,
          fortifiedLevel: 0,
          garrisonCount: 0,
          supplyLevel: 0,
          morale: 50,
          lastDefendedAt: null,
          totalDefenses: 0,
        },
        isFortified: (state?.fortifiedLevel ?? 0) > 0,
        progressPercent: Math.round(((state?.fortifiedLevel ?? 0) / def.maxLevel) * 100),
      }
    })
  }, [store])

  // ── Computed: Inventory with material definitions ─────────
  const frInventoryWithDefs = useMemo(() => {
    return store.frInventory.map((item) => {
      const def = frFindMaterial(item.materialId)
      return {
        ...item,
        def,
        rarityColor: def ? FR_RARITY_COLORS[def.rarity] : '#888888',
      }
    })
  }, [store])

  // ── Computed: Owned artifacts with definitions ────────────
  const frOwnedArtifacts = useMemo(() => {
    return store.frArtifacts.map((id) => frFindArtifact(id)).filter((a): a is FrArtifactDef => a !== undefined)
  }, [store])

  // ── Computed: Unowned artifacts ───────────────────────────
  const frUnownedArtifacts = useMemo(() => {
    return FR_ARTIFACTS.filter((a) => !store.frArtifacts.includes(a.id))
  }, [store])

  // ── Computed: Structures with build state ─────────────────
  const frStructuresWithState = useMemo(() => {
    return FR_STRUCTURES.map((def) => {
      const levelKey = `sl_${def.id}` as keyof typeof store.frOutposts
      const currentLevel = (store.frOutposts[levelKey] as unknown as number) ?? 0
      const cost = frStructureUpgradeCost(def, currentLevel)
      const isMaxed = currentLevel >= def.maxLevel
      return {
        def,
        currentLevel,
        upgradeCost: cost,
        isMaxed,
        progressPercent: Math.round((currentLevel / def.maxLevel) * 100),
      }
    })
  }, [store])

  // ── Computed: Unclaimed achievements ──────────────────────
  const frUnclaimedAchievements = useMemo(() => {
    return FR_ACHIEVEMENTS.filter((a) => {
      if (store.frAchievements.includes(a.id)) return false
      return frCheckAchievementCondition(a.condition, store.frStats, store.frAchievements.length)
    })
  }, [store])

  // ── Computed: Achievements with claim status ──────────────
  const frAchievementsWithStatus = useMemo(() => {
    return FR_ACHIEVEMENTS.map((def) => {
      const isClaimed = store.frAchievements.includes(def.id)
      const canClaim = !isClaimed && frCheckAchievementCondition(def.condition, store.frStats, store.frAchievements.length)
      return {
        def,
        isClaimed,
        canClaim,
      }
    })
  }, [store])

  // ── Computed: Current title details ───────────────────────
  const frCurrentTitle = useMemo(() => {
    return frFindTitle(store.frTitle) ?? FR_TITLES[0]
  }, [store.frTitle])

  // ── Computed: Next title info ─────────────────────────────
  const frNextTitle = useMemo(() => {
    const currentIdx = FR_TITLES.findIndex((t) => t.id === store.frTitle)
    if (currentIdx >= FR_TITLES.length - 1) return null
    const next = FR_TITLES[currentIdx + 1]
    const guardianCount = Object.keys(store.frGuardians).length
    const outpostCount = Object.keys(store.frOutposts).length
    const guardiansNeeded = Math.max(0, next.minGuardians - guardianCount)
    const outpostsNeeded = Math.max(0, next.minOutposts - outpostCount)
    return {
      ...next,
      guardiansNeeded,
      outpostsNeeded,
      progressPercent: Math.floor(
        ((Math.min(guardianCount, next.minGuardians) / next.minGuardians +
          Math.min(outpostCount, next.minOutposts) / next.minOutposts) /
          2) *
          100,
      ),
    }
  }, [store])

  // ── Computed: Guardian count by type ──────────────────────
  const frGuardiansByType = useMemo(() => {
    const counts: Record<FrGuardianType, number> = {
      ice_golem: 0,
      frost_wyrm: 0,
      glacier_bear: 0,
      snow_leopard: 0,
      blizzard_eagle: 0,
      permafrost_elemental: 0,
      crystal_deer: 0,
    }
    for (const gs of Object.values(store.frGuardians)) {
      const def = frFindGuardian(gs.guardianId)
      if (def) {
        counts[def.type]++
      }
    }
    return counts
  }, [store])

  // ── Computed: Guardian count by rarity ────────────────────
  const frGuardiansByRarity = useMemo(() => {
    const counts: Record<FrRarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const gs of Object.values(store.frGuardians)) {
      const def = frFindGuardian(gs.guardianId)
      if (def) {
        counts[def.rarity]++
      }
    }
    return counts
  }, [store])

  // ── Computed: Total guardian power ────────────────────────
  const frTotalGuardianPower = useMemo(() => {
    let total = 0
    for (const gs of Object.values(store.frGuardians)) {
      const def = frFindGuardian(gs.guardianId)
      if (def) {
        total += def.attack + def.defense + def.frostPower + gs.level * 2
      }
    }
    return total
  }, [store])

  // ── Computed: Total artifact bonuses ──────────────────────
  const frTotalArtifactBonus = useMemo(() => {
    let powerBonus = 0
    let defenseBonus = 0
    let frostBonus = 0
    for (const id of store.frArtifacts) {
      const artifact = frFindArtifact(id)
      if (artifact) {
        powerBonus += artifact.powerBonus
        defenseBonus += artifact.defenseBonus
        frostBonus += artifact.frostBonus
      }
    }
    return { powerBonus, defenseBonus, frostBonus }
  }, [store])

  // ── Computed: Outpost defense summary ─────────────────────
  const frOutpostDefenseSummary = useMemo(() => {
    let totalDefense = 0
    let maxDefense = 0
    for (const def of FR_OUTPOSTS) {
      const state = store.frOutposts[def.id]
      const level = state?.fortifiedLevel ?? 0
      totalDefense += level
      maxDefense += def.maxLevel
    }
    return {
      totalDefense,
      maxDefense,
      percentComplete: maxDefense > 0 ? Math.round((totalDefense / maxDefense) * 100) : 0,
    }
  }, [store])

  // ── Computed: Structure build summary ─────────────────────
  const frStructureBuildSummary = useMemo(() => {
    let totalLevels = 0
    let maxLevels = 0
    for (const def of FR_STRUCTURES) {
      const levelKey = `sl_${def.id}` as keyof typeof store.frOutposts
      const currentLevel = (store.frOutposts[levelKey] as unknown as number) ?? 0
      totalLevels += currentLevel
      maxLevels += def.maxLevel
    }
    return {
      totalLevels,
      maxLevels,
      percentComplete: maxLevels > 0 ? Math.round((totalLevels / maxLevels) * 100) : 0,
    }
  }, [store])

  // ── Computed: Event history with details ──────────────────
  const frEventHistory = useMemo(() => {
    return store.frEvents.map((id) => frFindEvent(id)).filter((e): e is FrReachEventDef => e !== undefined)
  }, [store])

  // ── Computed: Event severity distribution ─────────────────
  const frEventSeverityDist = useMemo(() => {
    const counts = { mild: 0, moderate: 0, severe: 0, catastrophic: 0 }
    for (const id of store.frEvents) {
      const event = frFindEvent(id)
      if (event) {
        counts[event.severity]++
      }
    }
    return counts
  }, [store])

  // ── Computed: Materials by rarity ─────────────────────────
  const frMaterialsByRarity = useMemo(() => {
    const groups: Record<FrRarity, FrMaterialDef[]> = {
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      legendary: [],
    }
    for (const mat of FR_MATERIALS) {
      groups[mat.rarity].push(mat)
    }
    return groups
  }, [])

  // ── Computed: Abilities by type ───────────────────────────
  const frAbilitiesByType = useMemo(() => {
    const groups: Record<FrAbilityType, FrAbilityDef[]> = {
      offensive: [],
      defensive: [],
      utility: [],
      passive: [],
    }
    for (const ability of FR_ABILITIES) {
      groups[ability.type].push(ability)
    }
    return groups
  }, [])

  // ── Computed: Collectible progress ────────────────────────
  const frCollectibleProgress = useMemo(() => {
    const guardianCount = Object.keys(store.frGuardians).length
    const artifactCount = store.frArtifacts.length
    const achievementCount = store.frAchievements.length
    const outpostFortified = Object.keys(store.frOutposts).length
    const totalCollectibles = FR_GUARDIANS.length + FR_ARTIFACTS.length + FR_ACHIEVEMENTS.length + FR_OUTPOSTS.length
    const collected = guardianCount + artifactCount + achievementCount + outpostFortified
    return {
      guardianProgress: { current: guardianCount, total: FR_GUARDIANS.length, percent: Math.round((guardianCount / FR_GUARDIANS.length) * 100) },
      artifactProgress: { current: artifactCount, total: FR_ARTIFACTS.length, percent: Math.round((artifactCount / FR_ARTIFACTS.length) * 100) },
      achievementProgress: { current: achievementCount, total: FR_ACHIEVEMENTS.length, percent: Math.round((achievementCount / FR_ACHIEVEMENTS.length) * 100) },
      outpostProgress: { current: outpostFortified, total: FR_OUTPOSTS.length, percent: Math.round((outpostFortified / FR_OUTPOSTS.length) * 100) },
      overallProgress: { current: collected, total: totalCollectibles, percent: totalCollectibles > 0 ? Math.round((collected / totalCollectibles) * 100) : 0 },
    }
  }, [store])

  // ── Computed: Active guardians count ──────────────────────
  const frActiveGuardiansCount = useMemo(() => {
    return Object.values(store.frGuardians).filter((gs) => gs.isActive).length
  }, [store])

  // ── Computed: Average guardian level ──────────────────────
  const frAverageGuardianLevel = useMemo(() => {
    const guardians = Object.values(store.frGuardians)
    if (guardians.length === 0) return 0
    const total = guardians.reduce((sum, gs) => sum + gs.level, 0)
    return Math.floor(total / guardians.length)
  }, [store])

  // ── Computed: Top guardians by power ──────────────────────
  const frTopGuardians = useMemo(() => {
    return frGuardiansWithDefs
      .map((g) => ({
        ...g,
        totalPower: g.def ? g.def.attack + g.def.defense + g.def.frostPower : 0,
      }))
      .sort((a, b) => b.totalPower - a.totalPower)
      .slice(0, 10)
  }, [frGuardiansWithDefs])

  // ── Computed: Recently recruited guardians ─────────────────
  const frRecentRecruits = useMemo(() => {
    return frGuardiansWithDefs
      .filter((g) => g.recruitedAt !== null)
      .sort((a, b) => (b.recruitedAt ?? 0) - (a.recruitedAt ?? 0))
      .slice(0, 5)
  }, [frGuardiansWithDefs])

  // ── Computed: Outposts sorted by defense ──────────────────
  const frOutpostsByDefense = useMemo(() => {
    return [...frOutpostsWithDefs].sort((a, b) => b.state.fortifiedLevel - a.state.fortifiedLevel)
  }, [frOutpostsWithDefs])

  // ── Computed: Titles with unlock status ───────────────────
  const frTitlesWithStatus = useMemo(() => {
    const guardianCount = Object.keys(store.frGuardians).length
    const outpostCount = Object.keys(store.frOutposts).length
    return FR_TITLES.map((def) => ({
      def,
      isActive: store.frTitle === def.id,
      isUnlocked: guardianCount >= def.minGuardians && outpostCount >= def.minOutposts,
    }))
  }, [store])

  // ── Computed: Total resource counts ───────────────────────
  const frTotalResources = useMemo(() => {
    let iceCore = 0
    let crystalShard = 0
    let frostEssence = 0
    for (const item of store.frInventory) {
      if (item.materialId.includes('ice_core') || item.materialId.includes('ice') || item.materialId.includes('glacier')) {
        iceCore += item.count
      }
      if (item.materialId.includes('crystal') || item.materialId.includes('shard')) {
        crystalShard += item.count
      }
      if (item.materialId.includes('essence') || item.materialId.includes('frost') || item.materialId.includes('aurora')) {
        frostEssence += item.count
      }
    }
    return { iceCore, crystalShard, frostEssence, total: iceCore + crystalShard + frostEssence }
  }, [store.frInventory])

  // ── Computed: Guardians deployed to outposts ────────────────
  const frDeployedGuardians = useMemo(() => {
    return frGuardiansWithDefs.filter((g) => g.outpostId !== null)
  }, [frGuardiansWithDefs])

  // ── Computed: Undeployed available guardians ─────────────────
  const frAvailableGuardians = useMemo(() => {
    return frGuardiansWithDefs.filter((g) => g.outpostId === null)
  }, [frGuardiansWithDefs])

  // ── Computed: Guardians at each outpost ─────────────────────
  const frGuardiansAtOutposts = useMemo(() => {
 const groups: Record<string, typeof frGuardiansWithDefs> = {}
    for (const def of FR_OUTPOSTS) {
      groups[def.id] = []
    }
    for (const g of frGuardiansWithDefs) {
      if (g.outpostId) {
        if (!groups[g.outpostId]) groups[g.outpostId] = []
        groups[g.outpostId].push(g)
      }
    }
    return groups
  }, [frGuardiansWithDefs])

  // ── Computed: Legendary guardians count ─────────────────────
  const frLegendaryCount = useMemo(() => {
    return Object.values(store.frGuardians).filter((gs) => {
      const def = frFindGuardian(gs.guardianId)
      return def?.rarity === FR_RARITY_LEGENDARY
    }).length
  }, [store])

  // ── Computed: Structures grouped by category ─────────────────
  const frStructuresByCategory = useMemo(() => {
    const groups: Record<FrStructureCategory, typeof frStructuresWithState> = {
      barracks: [], workshop: [], storage: [], tower: [], gate: [], shrine: [], library: [], wall: [],
    }
    for (const s of frStructuresWithState) {
      groups[s.def.category].push(s)
    }
    return groups
  }, [frStructuresWithState])

  // ── Computed: Event frequency stats ─────────────────────────
  const frEventFrequency = useMemo(() => {
    const total = store.frEvents.length
    if (total === 0) return { averageXp: 0, averageRisk: 0, mostCommon: null as FrReachEventDef | null }
    const totalXp = store.frEvents.reduce((sum, id) => {
      const event = frFindEvent(id)
      return sum + (event?.rewardXp ?? 0)
    }, 0)
    const totalRisk = store.frEvents.reduce((sum, id) => {
      const event = frFindEvent(id)
      return sum + (event?.riskLevel ?? 0)
    }, 0)
    const freqMap: Record<string, number> = {}
    let maxCount = 0
    let mostCommonId = ''
    for (const id of store.frEvents) {
      freqMap[id] = (freqMap[id] ?? 0) + 1
      if (freqMap[id] > maxCount) {
        maxCount = freqMap[id]
        mostCommonId = id
      }
    }
    return {
      averageXp: Math.floor(totalXp / total),
      averageRisk: Math.floor(totalRisk / total),
      mostCommon: frFindEvent(mostCommonId) ?? null,
    }
  }, [store])

  // ── Computed: Overall frost power rating ──────────────────
  const frOverallPowerRating = useMemo(() => {
    const guardianPower = frTotalGuardianPower
    const artifactPower = frTotalArtifactBonus.powerBonus + frTotalArtifactBonus.defenseBonus + frTotalArtifactBonus.frostBonus
    const structurePower = frStructureBuildSummary.totalLevels * 5
    const outpostPower = frOutpostDefenseSummary.totalDefense * 10
    return guardianPower + artifactPower + structurePower + outpostPower
  }, [frTotalGuardianPower, frTotalArtifactBonus, frStructureBuildSummary, frOutpostDefenseSummary])

  // ═════════════════════════════════════════════════════════════
  // Return frAPI object
  // ═════════════════════════════════════════════════════════════

  const frAPI = {
    // ── Color Constants ────────────────────────────────────
    FR_FROST_WHITE,
    FR_ICE_BLUE,
    FR_GLACIER_CYAN,
    FR_AURORA_GREEN,
    FR_DEEP_FROST,
    FR_SNOW_SILVER,
    FR_CRYSTAL_PALE,
    FR_NORTHERN_DUSK,
    FR_PERMAFROST_GRAY,
    FR_BLIZZARD_STORM,

    // ── Rarity Constants ───────────────────────────────────
    FR_RARITY_COMMON,
    FR_RARITY_UNCOMMON,
    FR_RARITY_RARE,
    FR_RARITY_EPIC,
    FR_RARITY_LEGENDARY,
    FR_RARITY_COLORS,
    FR_RARITY_XP_MULTIPLIER,
    FR_RARITY_RECRUIT_WEIGHTS,
    FR_RARITY_ICONS,

    // ── Data Constants ─────────────────────────────────────
    FR_GUARDIANS,
    FR_OUTPOSTS,
    FR_MATERIALS,
    FR_STRUCTURES,
    FR_ABILITIES,
    FR_ACHIEVEMENTS,
    FR_TITLES,
    FR_ARTIFACTS,
    FR_REACH_EVENTS,

    // ── Lookup Functions ───────────────────────────────────
    frFindGuardian,
    frFindOutpost,
    frFindMaterial,
    frFindStructure,
    frFindAbility,
    frFindAchievement,
    frFindTitle,
    frFindArtifact,
    frFindEvent,
    frRarityCostMultiplier,
    frXpForLevel,

    // ── Store State ────────────────────────────────────────
    frGuardians: store.frGuardians,
    frOutposts: store.frOutposts,
    frInventory: store.frInventory,
    frArtifacts: store.frArtifacts,
    frAchievements: store.frAchievements,
    frTitle: store.frTitle,
    frEvents: store.frEvents,
    frStats: store.frStats,

    // ── Store Actions ──────────────────────────────────────
    recruitGuardian: store.frRecruitGuardian,
    fortifyOutpost: store.frFortifyOutpost,
    buildStructure: store.frBuildStructure,
    activateArtifact: store.frActivateArtifact,
    triggerReachEvent: store.frTriggerReachEvent,
    resetFrostReach: store.frResetFrostReach,
    addInventory: store.frAddInventory,
    removeInventory: store.frRemoveInventory,
    claimAchievement: store.frClaimAchievement,

    // ── Computed Getters ───────────────────────────────────
    frGuardiansWithDefs,
    frOutpostsWithDefs,
    frInventoryWithDefs,
    frOwnedArtifacts,
    frUnownedArtifacts,
    frStructuresWithState,
    frUnclaimedAchievements,
    frAchievementsWithStatus,
    frCurrentTitle,
    frNextTitle,
    frGuardiansByType,
    frGuardiansByRarity,
    frTotalGuardianPower,
    frTotalArtifactBonus,
    frOutpostDefenseSummary,
    frStructureBuildSummary,
    frEventHistory,
    frEventSeverityDist,
    frMaterialsByRarity,
    frAbilitiesByType,
    frCollectibleProgress,
    frActiveGuardiansCount,
    frAverageGuardianLevel,
    frTopGuardians,
    frRecentRecruits,
    frOutpostsByDefense,
    frTitlesWithStatus,
    frOverallPowerRating,
    frTotalResources,
    frDeployedGuardians,
    frAvailableGuardians,
    frGuardiansAtOutposts,
    frLegendaryCount,
    frStructuresByCategory,
    frEventFrequency,
    frXpProgressPercent,
    frLevelForXp,
    frWeightedRandomByRarity,
    frRandomGuardianByRarity,
    FR_LEVEL_XP_TABLE,
    FR_GUARDIAN_TYPES,
    FR_ABILITY_TYPES,
    FR_STRUCTURE_CATEGORIES,
    FR_SEASONS,
  }

  return frAPI
}
