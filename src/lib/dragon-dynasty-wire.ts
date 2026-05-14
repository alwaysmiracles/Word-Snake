/**
 * Dragon Dynasty Wire — 龙朝 (Dragon Dynasty) feature module for Word Snake
 *
 * An ancient empire ruled by dragons, where dragon emperors govern from jade
 * palaces amidst clouds and fire. Players summon 35 dragon wyverns across 5
 * rarity tiers and 7 species, claim 8 palace locations, collect 30 dragon
 * materials, build 25 palace structures, master 22 dragon abilities, earn
 * 18 achievements, unlock 8 progression titles, activate 15 legendary
 * artifacts, and respond to 12 dynasty events — backed by a Zustand store
 * with persist middleware.
 *
 * Storage key: dragon-dynasty-wire
 * Prefix: dd / DD_
 * Color theme: imperial gold #FFD700, jade green #00A86B, dragon red #C41E3A, cosmic indigo #4B0082
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type DDRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type DDSpecies =
  | 'fire_drake'
  | 'ice_lung'
  | 'storm_wyrm'
  | 'earth_dragon'
  | 'shadow_serpent'
  | 'lightning_eagle'
  | 'cosmic_dragon'

export interface DDWyvernDef {
  readonly id: string
  readonly name: string
  readonly nameCn: string
  readonly species: DDSpecies
  readonly rarity: DDRarity
  readonly power: number
  readonly cost: number
  readonly description: string
}

export interface DDPalaceDef {
  readonly id: string
  readonly name: string
  readonly nameCn: string
  readonly tier: number
  readonly bonus: string
  readonly favorRequired: number
  readonly description: string
}

export interface DDMaterialDef {
  readonly id: string
  readonly name: string
  readonly nameCn: string
  readonly rarity: DDRarity
  readonly description: string
  readonly value: number
  readonly category: 'scale' | 'essence' | 'gem' | 'artifact_fragment'
}

export interface DDStructureDef {
  readonly id: string
  readonly name: string
  readonly nameCn: string
  readonly maxLevel: number
  readonly description: string
  readonly costPerLevel: number
  readonly bonusPerLevel: number
  readonly category: 'defense' | 'production' | 'culture' | 'mystic'
}

export interface DDAbilityDef {
  readonly id: string
  readonly name: string
  readonly nameCn: string
  readonly species: DDSpecies
  readonly power: number
  readonly cooldown: number
  readonly description: string
}

export interface DDAchievementDef {
  readonly id: string
  readonly name: string
  readonly nameCn: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface DDTitleDef {
  readonly id: string
  readonly name: string
  readonly nameCn: string
  readonly requirement: string
  readonly levelRequired: number
  readonly favorBonus: number
}

export interface DDArtifactDef {
  readonly id: string
  readonly name: string
  readonly nameCn: string
  readonly description: string
  readonly lore: string
  readonly power: number
  readonly rarity: DDRarity
}

export interface DDEventDef {
  readonly id: string
  readonly name: string
  readonly nameCn: string
  readonly description: string
  readonly effect: string
  readonly severity: number
}

export interface WyvernState {
  owned: boolean
  count: number
  level: number
}

export interface PalaceState {
  claimed: boolean
  level: number
  garrison: string[]
}

export interface StructureState {
  built: boolean
  level: number
}

export interface InventoryItem {
  id: string
  quantity: number
}

export interface DragonDynastyState {
  ddLevel: number
  ddDragonPower: number
  ddImperialFavor: number
  ddWyverns: Record<string, WyvernState>
  ddPalaces: Record<string, PalaceState>
  ddStructures: Record<string, StructureState>
  ddArtifacts: string[]
  ddAchievements: string[]
  ddInventory: InventoryItem[]
  ddStats: {
    wyvernsSummoned: number
    palacesClaimed: number
    structuresBuilt: number
    abilitiesUsed: number
    artifactsFound: number
    totalDragonPower: number
  }
  ddTitle: string
  ddEvents: string[]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: THEME & COLOR CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const DD_IMPERIAL_GOLD: string = '#FFD700'
export const DD_JADE_GREEN: string = '#00A86B'
export const DD_DRAGON_RED: string = '#C41E3A'
export const DD_COSMIC_INDIGO: string = '#4B0082'
export const DD_CLOUD_WHITE: string = '#FFFAF0'
export const DD_DEEP_JADE: string = '#006B3F'
export const DD_DARK_RED: string = '#8B0000'
export const DD_ROYAL_PURPLE: string = '#7B1FA2'
export const DD_MIDNIGHT: string = '#1A1A2E'
export const DD_LAVA_ORANGE: string = '#FF5722'

export const DD_THEME = {
  primary: DD_IMPERIAL_GOLD,
  secondary: DD_JADE_GREEN,
  danger: DD_DRAGON_RED,
  mystic: DD_COSMIC_INDIGO,
} as const

export const DD_RARITIES: readonly {
  id: DDRarity
  name: string
  nameCn: string
  color: string
  multiplier: number
}[] = [
  { id: 'common', name: 'Common', nameCn: '普通', color: '#9E9E9E', multiplier: 1 },
  { id: 'uncommon', name: 'Uncommon', nameCn: '优良', color: '#22C55E', multiplier: 1.5 },
  { id: 'rare', name: 'Rare', nameCn: '精良', color: '#2196F3', multiplier: 2 },
  { id: 'epic', name: 'Epic', nameCn: '史诗', color: '#A855F7', multiplier: 3 },
  { id: 'legendary', name: 'Legendary', nameCn: '传说', color: DD_IMPERIAL_GOLD, multiplier: 5 },
]

export const DD_SPECIES: readonly {
  id: DDSpecies
  name: string
  nameCn: string
  color: string
  description: string
}[] = [
  { id: 'fire_drake', name: 'Fire Drake', nameCn: '火龙', color: DD_DRAGON_RED, description: 'Serpentine dragons of flame and ash that rule the volcanic peaks.' },
  { id: 'ice_lung', name: 'Ice Lung', nameCn: '冰龙', color: '#00BFFF', description: 'Ancient Chinese-style dragons of frost that command eternal winters.' },
  { id: 'storm_wyrm', name: 'Storm Wyrm', nameCn: '风龙', color: '#708090', description: 'Tempestuous wyrms that ride hurricanes and command lightning.' },
  { id: 'earth_dragon', name: 'Earth Dragon', nameCn: '地龙', color: '#8B4513', description: 'Colossal dragons that dwell beneath mountains and shape continents.' },
  { id: 'shadow_serpent', name: 'Shadow Serpent', nameCn: '暗龙', color: DD_COSMIC_INDIGO, description: 'Stealthy serpents that move between dimensions through darkness.' },
  { id: 'lightning_eagle', name: 'Lightning Eagle', nameCn: '雷鹰龙', color: '#FFD700', description: 'Avian-dragon hybrids that strike with the speed of lightning.' },
  { id: 'cosmic_dragon', name: 'Cosmic Dragon', nameCn: '星龙', color: DD_COSMIC_INDIGO, description: 'Celestial dragons that draw power from the stars themselves.' },
]

export const DD_MAX_STRUCTURE_LEVEL = 10
export const DD_SPECIES_COUNT = 7
export const DD_RARITY_TIER_COUNT = 5

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: DD_WYVERNS — 35 Dragon Wyverns (7 species x 5 tiers)
// ═══════════════════════════════════════════════════════════════════

export const DD_WYVERNS: readonly DDWyvernDef[] = [
  // ── Fire Drake (fire_drake) — 5 tiers ────────────────────────────
  {
    id: 'fire_drake_ember',
    name: 'Ember Hatchling',
    nameCn: '余烬龙崽',
    species: 'fire_drake',
    rarity: 'common',
    power: 10,
    cost: 50,
    description: 'A small but spirited juvenile fire dragon. Its scales glow like cooling lava, and it sneezes harmless sparks when excited. Despite its youth, the ember in its chest burns with the promise of greater flames.',
  },
  {
    id: 'fire_drake_flame',
    name: 'Flame Wyrm',
    nameCn: '烈焰蛇龙',
    species: 'fire_drake',
    rarity: 'uncommon',
    power: 25,
    cost: 200,
    description: 'A fierce ember-scaled drake found prowling near volcanic vents. Its talons leave scorch marks on stone, and its breath can ignite entire forests with a single exhalation. Fire drakes of this caliber serve as elite palace guards.',
  },
  {
    id: 'fire_drake_inferno',
    name: 'Inferno Drake',
    nameCn: '炼狱龙',
    species: 'fire_drake',
    rarity: 'rare',
    power: 55,
    cost: 800,
    description: 'A fearsome dragon wreathed in perpetual flame. Entire villages have been evacuated when an Inferno Drake takes flight. Its body temperature exceeds two thousand degrees, and molten metal flows through its veins instead of blood.',
  },
  {
    id: 'fire_drake_sunfire',
    name: 'Sunfire Emperor',
    nameCn: '日焰帝王龙',
    species: 'fire_drake',
    rarity: 'epic',
    power: 120,
    cost: 3000,
    description: 'An ancient titan whose flames have burned for a thousand years without fading. Legends say it was born when the first sunrise illuminated the primordial world. Its radiance alone can blind armies and melt siege weapons at a hundred paces.',
  },
  {
    id: 'fire_drake_primordial',
    name: 'Primordial Phoenix-Dragon',
    nameCn: '太古凤龙',
    species: 'fire_drake',
    rarity: 'legendary',
    power: 250,
    cost: 12000,
    description: 'The mythical hybrid of dragon and phoenix, said to have emerged from the core of a dying star. Its presence turns sand to glass, and it can resurrect itself from its own ashes. Emperors have waged entire wars for a single feather from this celestial beast.',
  },

  // ── Ice Lung (ice_lung) — 5 tiers ────────────────────────────────
  {
    id: 'ice_lung_frost',
    name: 'Frost Whelp',
    nameCn: '霜龙幼崽',
    species: 'ice_lung',
    rarity: 'common',
    power: 8,
    cost: 45,
    description: 'A tiny dragon with translucent blue scales that jingle like glass when it moves. Frost Whelps love to freeze puddles and create miniature ice sculptures in their dens. Their breath carries the chill of the farthest northern peaks.',
  },
  {
    id: 'ice_lung_glacier',
    name: 'Glacier Serpent',
    nameCn: '冰川蛇龙',
    species: 'ice_lung',
    rarity: 'uncommon',
    power: 22,
    cost: 180,
    description: 'A thick-scaled lung dragon from the deepest glaciers. Its breath can freeze a lake solid in seconds. In the imperial courts, Glacier Serpents are prized for keeping the jade halls cool during sweltering summers.',
  },
  {
    id: 'ice_lung_blizzard',
    name: 'Blizzard Dragon',
    nameCn: '暴雪龙',
    species: 'ice_lung',
    rarity: 'rare',
    power: 50,
    cost: 750,
    description: 'A massive white dragon that summons eternal blizzards around its lair. Ships that stray too near are found frozen mid-wave, preserved perfectly in crystalline ice. Its roar creates avalanches across entire mountain ranges.',
  },
  {
    id: 'ice_lung_permafrost',
    name: 'Permafrost Leviathan',
    nameCn: '永冻利维坦',
    species: 'ice_lung',
    rarity: 'epic',
    power: 110,
    cost: 2800,
    description: 'A primordial ice dragon that has slept since the last Ice Age. Entire mountain ranges are its armor. When it awakens, temperatures plummet across the empire and rivers freeze from source to mouth in a single night.',
  },
  {
    id: 'ice_lung_eternal',
    name: 'Eternal Winter Sovereign',
    nameCn: '永冬之主',
    species: 'ice_lung',
    rarity: 'legendary',
    power: 240,
    cost: 11000,
    description: 'The absolute lord of cold who has existed since before warmth entered the world. Where it flies, temperatures plummet to absolute zero. Even fire dragons shudder at its name. The dynasty calendar marks the age of its last awakening as Year Zero.',
  },

  // ── Storm Wyrm (storm_wyrm) — 5 tiers ────────────────────────────
  {
    id: 'storm_wyrm_breeze',
    name: 'Breeze Hatchling',
    nameCn: '清风龙崽',
    species: 'storm_wyrm',
    rarity: 'common',
    power: 9,
    cost: 48,
    description: 'A hyperactive little dragon crackling with wind energy. It generates miniature cyclones when it sneezes, much to the annoyance of palace servants who must constantly repair wind-damaged tapestries.',
  },
  {
    id: 'storm_wyrm_thunder',
    name: 'Thunder Serpent',
    nameCn: '雷霆蛇龙',
    species: 'storm_wyrm',
    rarity: 'uncommon',
    power: 24,
    cost: 190,
    description: 'A sinuous dragon that channels thunder through its elongated body. When it roars, actual thunder follows and shakes the palace foundations. Thunder Serpents are used as imperial messengers during wartime.',
  },
  {
    id: 'storm_wyrm_tempest',
    name: 'Tempest Dragon',
    nameCn: '暴风龙',
    species: 'storm_wyrm',
    rarity: 'rare',
    power: 52,
    cost: 780,
    description: 'A mythical dragon that controls hurricanes and typhoons. Its wingspan generates electrical storms that can devastate entire fleets. Tempest Dragons are worshipped as sea gods by coastal fishing villages.',
  },
  {
    id: 'storm_wyrm_hurricane',
    name: 'Hurricane Behemoth',
    nameCn: '飓风巨兽',
    species: 'storm_wyrm',
    rarity: 'epic',
    power: 115,
    cost: 3200,
    description: 'The undisputed ruler of storm-wracked skies. When it takes wing, the air pressure change shatters windows for miles. Its body is a living cyclone, and it can summon waterspouts from calm seas with a flick of its tail.',
  },
  {
    id: 'storm_wyrm_celestial',
    name: 'Celestial Storm Emperor',
    nameCn: '天雷风暴帝龙',
    species: 'storm_wyrm',
    rarity: 'legendary',
    power: 245,
    cost: 12500,
    description: 'The primordial spirit of storms given dragon form. It was the first breath of the world and will be its last. Its storms have shaped coastlines, carved canyons, and determined the course of dynastic history for millennia.',
  },

  // ── Earth Dragon (earth_dragon) — 5 tiers ───────────────────────
  {
    id: 'earth_dragon_pebble',
    name: 'Pebble Drake',
    nameCn: '碎石龙崽',
    species: 'earth_dragon',
    rarity: 'common',
    power: 11,
    cost: 55,
    description: 'A small dragon covered in rough stone-like scales. It sleeps buried in the palace gardens and accidentally sprouts jade crystals wherever it rests. Palace gardeners consider Pebble Drakes both a blessing and a nuisance.',
  },
  {
    id: 'earth_dragon_stone',
    name: 'Stone Wyrm',
    nameCn: '岩石蛇龙',
    species: 'earth_dragon',
    rarity: 'uncommon',
    power: 26,
    cost: 210,
    description: 'A heavily armored dragon that moves through solid rock as if swimming through water. Its scales are harder than granite, and it can shape mountains with its claws over centuries of patient work.',
  },
  {
    id: 'earth_dragon_mountain',
    name: 'Mountain Dragon',
    nameCn: '山岳龙',
    species: 'earth_dragon',
    rarity: 'rare',
    power: 58,
    cost: 850,
    description: 'A colossal dragon so large it is often mistaken for a mountain range. Entire ecosystems thrive on its back, and ancient temples have been built in the crevices between its scales. Earthquakes herald its arrival.',
  },
  {
    id: 'earth_dragon_continental',
    name: 'Continental Titan',
    nameCn: '大陆泰坦龙',
    species: 'earth_dragon',
    rarity: 'epic',
    power: 125,
    cost: 3500,
    description: 'A being of such immense size that it once served as the foundation for a dynasty capital. Its movements reshape the landscape, creating valleys and raising peaks. The imperial architects consider it a living monument to stability.',
  },
  {
    id: 'earth_dragon_king',
    name: 'World-Shaping Dragon King',
    nameCn: '塑世龙王',
    species: 'earth_dragon',
    rarity: 'legendary',
    power: 260,
    cost: 13000,
    description: 'The dragon that carved the world itself, separating land from sea and sky from earth at the dawn of creation. Its heartbeat causes tides, and its dreams manifest as mineral deposits and gemstone veins. Empires rise and fall within the span of a single blink of its ancient eyes.',
  },

  // ── Shadow Serpent (shadow_serpent) — 5 tiers ────────────────────
  {
    id: 'shadow_serpent_dusk',
    name: 'Dusk Wraith',
    nameCn: '黄昏幽灵龙',
    species: 'shadow_serpent',
    rarity: 'common',
    power: 10,
    cost: 52,
    description: 'A small dragon that can blend into any shadow. Its eyes glow faintly purple in the dark, and it communicates through whispers that seem to come from everywhere at once. Dusk Wraiths make excellent palace spies.',
  },
  {
    id: 'shadow_serpent_night',
    name: 'Night Fang',
    nameCn: '夜牙龙',
    species: 'shadow_serpent',
    rarity: 'uncommon',
    power: 28,
    cost: 220,
    description: 'A dark-scaled predator that moves through shadows as if swimming. It strikes before targets can react, and its venom induces nightmares that last for weeks. Night Fangs are deployed as imperial assassins during succession crises.',
  },
  {
    id: 'shadow_serpent_void',
    name: 'Void Serpent',
    nameCn: '虚空蛇龙',
    species: 'shadow_serpent',
    rarity: 'rare',
    power: 60,
    cost: 900,
    description: 'A serpentine dragon that exists partially in another dimension. Only its shadow is visible in the material world. Its attacks phase through armor and shields, striking directly at the soul of its targets.',
  },
  {
    id: 'shadow_serpent_eclipse',
    name: 'Eclipse Dragon',
    nameCn: '日蚀龙',
    species: 'shadow_serpent',
    rarity: 'epic',
    power: 130,
    cost: 3600,
    description: 'A colossal dragon of volcanic obsidian glass that can extinguish the sun itself. During its rare appearances, day turns to night across entire provinces. Its dark surface absorbs all light and hope within its vicinity.',
  },
  {
    id: 'shadow_serpent_primordial',
    name: 'Primordial Darkness Incarnate',
    nameCn: '太古暗之化身',
    species: 'shadow_serpent',
    rarity: 'legendary',
    power: 255,
    cost: 14000,
    description: 'An ancient being of pure darkness that predates light itself. It consumes light, hope, and color wherever it passes. The Dragon Dynasty was founded when the first emperor made a pact with this entity, trading eternal shadow for imperial power.',
  },

  // ── Lightning Eagle (lightning_eagle) — 5 tiers ────────────────
  {
    id: 'lightning_eagle_spark',
    name: 'Spark Hawk',
    nameCn: '火花鹰龙',
    species: 'lightning_eagle',
    rarity: 'common',
    power: 12,
    cost: 58,
    description: 'A small raptor-dragon hybrid crackling with static electricity. Its feathers emit tiny sparks during flight, creating a spectacular display against the night sky. Spark Hawks are used as messenger birds in the imperial postal system.',
  },
  {
    id: 'lightning_eagle_thunder_eagle',
    name: 'Thunder Eagle',
    nameCn: '雷鹰龙',
    species: 'lightning_eagle',
    rarity: 'uncommon',
    power: 30,
    cost: 240,
    description: 'A crackling dragon that channels thunder through its magnificent wings. When it screeches, actual thunder follows and echoes across the imperial valleys. Thunder Eagles serve as aerial scouts and skirmishers.',
  },
  {
    id: 'lightning_eagle_storm_talon',
    name: 'Storm Talon',
    nameCn: '暴风利爪龙',
    species: 'lightning_eagle',
    rarity: 'rare',
    power: 62,
    cost: 920,
    description: 'A magnificent eagle-dragon whose talons conduct lightning bolts from the sky. It can strike multiple targets simultaneously during a single dive. Storm Talons are the pride of the imperial air force and are depicted on the dynasty seal.',
  },
  {
    id: 'lightning_eagle_lightning_roc',
    name: 'Lightning Roc',
    nameCn: '雷鹏龙',
    species: 'lightning_eagle',
    rarity: 'epic',
    power: 135,
    cost: 3800,
    description: 'A giant eagle-dragon of mythic proportions whose wingspan darkens the sky. Lightning arcs between every feather on its body, creating an electrified cage that no enemy can approach. It nests atop the highest peak in the empire.',
  },
  {
    id: 'lightning_eagle_celestial_thunderbird',
    name: 'Celestial Thunderbird',
    nameCn: '天雷神鸟',
    species: 'lightning_eagle',
    rarity: 'legendary',
    power: 265,
    cost: 15000,
    description: 'The divine thunderbird that carries the mandate of heaven between celestial and mortal realms. Its wings generate lightning that illuminates the entire empire simultaneously. Emperors who earn its loyalty are said to be truly blessed by the heavens.',
  },

  // ── Cosmic Dragon (cosmic_dragon) — 5 tiers ──────────────────────
  {
    id: 'cosmic_dragon_star',
    name: 'Star Whelp',
    nameCn: '星辰龙崽',
    species: 'cosmic_dragon',
    rarity: 'common',
    power: 14,
    cost: 60,
    description: 'A tiny dragon whose scales shimmer with distant starlight. It floats rather than walks, and at night its body displays a faint approximation of the current constellation map. Star Whelps are kept in the imperial observatory for companionship.',
  },
  {
    id: 'cosmic_dragon_nebula',
    name: 'Nebula Drake',
    nameCn: '星云龙',
    species: 'cosmic_dragon',
    rarity: 'uncommon',
    power: 32,
    cost: 250,
    description: 'A translucent dragon whose body contains swirling nebula-like patterns that shift and evolve. It feeds on starlight and excretes small gemstones formed from compressed cosmic dust. Nebula Drakes are the most beautiful creatures in the imperial menagerie.',
  },
  {
    id: 'cosmic_dragon_galaxy',
    name: 'Galaxy Serpent',
    nameCn: '银河蛇龙',
    species: 'cosmic_dragon',
    rarity: 'rare',
    power: 65,
    cost: 950,
    description: 'A cosmic serpent whose body contains a miniature spiral galaxy that slowly rotates within its translucent form. It draws power from distant stars and can project constellations across the night sky to guide imperial fleets.',
  },
  {
    id: 'cosmic_dragon_constellation',
    name: 'Constellation Dragon',
    nameCn: '星宿龙',
    species: 'cosmic_dragon',
    rarity: 'epic',
    power: 140,
    cost: 4000,
    description: 'A being woven from the fabric of the cosmos itself. Each of its scales contains a different star system, and the positions of its markings predict celestial events with perfect accuracy. The imperial calendar is based on its movements.',
  },
  {
    id: 'cosmic_dragon_celestial_emperor',
    name: 'Cosmic Celestial Emperor Dragon',
    nameCn: '宇宙天帝王龙',
    species: 'cosmic_dragon',
    rarity: 'legendary',
    power: 280,
    cost: 16000,
    description: 'The first dragon, born from the collision of two universes at the moment of creation. It contains within itself all the stars, planets, and dimensions that exist or will ever exist. Its power is limited only by its ancient promise to the mortal emperor to observe rather than intervene.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: DD_PALACES — 8 Palace Locations
// ═══════════════════════════════════════════════════════════════════

export const DD_PALACES: readonly DDPalaceDef[] = [
  {
    id: 'jade_emperor_hall',
    name: 'Jade Emperor Hall',
    nameCn: '玉皇殿',
    tier: 1,
    bonus: '+10% Dragon Power',
    favorRequired: 0,
    description: 'The central seat of the Dragon Dynasty, a magnificent hall carved from a single jade mountain. Dragon emperors have held court here for ten thousand years, and the jade walls resonate with the accumulated wisdom of every ruler who has sat upon the Dragon Throne.',
  },
  {
    id: 'cloud_pavilion_dawn',
    name: 'Cloud Pavilion of Dawn',
    nameCn: '晨云阁',
    tier: 2,
    bonus: '+5 Imperial Favor per cycle',
    favorRequired: 100,
    description: 'A floating pavilion that drifts among the clouds at sunrise, catching the first rays of dawn. The air here is perpetually warm and sweet-scented with lotus blossoms. Dragon scholars meditate here to gain insights from the ancestral spirits.',
  },
  {
    id: 'dragon_throne_sanctuary',
    name: 'Dragon Throne Sanctuary',
    nameCn: '龙座圣所',
    tier: 3,
    bonus: '+15% Summoning Success Rate',
    favorRequired: 300,
    description: 'The most sacred site in the dynasty, where the original Dragon Throne rests upon a pedestal of meteorite iron. Only those with imperial blood may approach the throne itself. The sanctuary pulses with an ancient power that enhances dragon summoning rituals.',
  },
  {
    id: 'phoenix_nest_citadel',
    name: 'Phoenix Nest Citadel',
    nameCn: '凤凰巢城',
    tier: 4,
    bonus: '+20% Material Yield',
    favorRequired: 600,
    description: 'A fortress built within the hollow shell of an ancient phoenix nest, located at the summit of the Immolation Peak. The eternal flames that burn within provide both defense and a source of rare phoenix materials used in dragon alchemy.',
  },
  {
    id: 'thunder_peak_palace',
    name: 'Thunder Peak Palace',
    nameCn: '雷峰宫',
    tier: 5,
    bonus: '+25% Lightning Dragon Power',
    favorRequired: 1000,
    description: 'Perched permanently within a thunderstorm that never dissipates, this palace channels raw lightning into its foundations. Lightning Eagles nest in its towers, and the constant electrical discharge powers ancient imperial mechanisms.',
  },
  {
    id: 'frozen_abyss_fortress',
    name: 'Frozen Abyss Fortress',
    nameCn: '冰渊堡',
    tier: 6,
    bonus: '+25% Ice Dragon Power',
    favorRequired: 1500,
    description: 'A fortress carved into the walls of a bottomless glacial crevasse. The cold here preserves everything perfectly, and ancient dragon eggs have been found frozen in the ice, still viable after millennia. Ice Lung dragons guard its corridors.',
  },
  {
    id: 'shadow_veil_temple',
    name: 'Shadow Veil Temple',
    nameCn: '影纱寺',
    tier: 7,
    bonus: '+25% Shadow Dragon Power',
    favorRequired: 2500,
    description: 'A temple that exists partially in the shadow dimension, accessible only at twilight when the boundaries between worlds thin. Shadow Serpents congregate here, drawn by the ancient void gate that connects the mortal realm to the darkness beyond.',
  },
  {
    id: 'celestial_dragon_court',
    name: 'Celestial Dragon Court',
    nameCn: '天龙廷',
    tier: 8,
    bonus: '+50% All Dragon Power',
    favorRequired: 5000,
    description: 'The ultimate palace, located at the exact point where the mortal plane touches the celestial realm. Only the most powerful dragon emperors can claim this court. Cosmic Dragons circle its spires endlessly, and the floor is made of compressed stardust.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: DD_MATERIALS — 30 Dragon Materials
// ═══════════════════════════════════════════════════════════════════

export const DD_MATERIALS: readonly DDMaterialDef[] = [
  // Scale Materials (8)
  { id: 'dragon_scale', name: 'Dragon Scale', nameCn: '龙鳞', rarity: 'common', description: 'A single iridescent scale shed during molting. Still warm to the touch.', value: 5, category: 'scale' },
  { id: 'wyrm_fang', name: 'Wyrm Fang', nameCn: '蛇牙', rarity: 'common', description: 'A sharp fang from a lesser wyrm, useful for basic enchantments.', value: 4, category: 'scale' },
  { id: 'serpent_scale', name: 'Serpent Scale', nameCn: '蛇鳞', rarity: 'uncommon', description: 'An unusually flexible scale that shimmers with oily colors.', value: 25, category: 'scale' },
  { id: 'dragon_claw', name: 'Dragon Claw', nameCn: '龙爪', rarity: 'uncommon', description: 'A curved claw from an adult dragon, harder than steel.', value: 30, category: 'scale' },
  { id: 'dragon_wing_membrane', name: 'Dragon Wing Membrane', nameCn: '龙翼膜', rarity: 'rare', description: 'A translucent membrane from a dragon wing, lightweight yet incredibly strong.', value: 100, category: 'scale' },
  { id: 'dragon_eye_gem', name: 'Dragon Eye Gem', nameCn: '龙眼宝石', rarity: 'rare', description: 'A crystallized dragon eye that still sees through illusions.', value: 120, category: 'gem' },
  { id: 'dragon_bone', name: 'Dragon Bone', nameCn: '龙骨', rarity: 'epic', description: 'A bone fragment from an ancient dragon, radiating primal energy.', value: 350, category: 'scale' },
  { id: 'dragon_heart', name: 'Dragon Heart', nameCn: '龙心', rarity: 'legendary', description: 'The crystallized heart of a dragon emperor, still pulsing with life force.', value: 1500, category: 'gem' },

  // Essence Materials (10)
  { id: 'flame_essence', name: 'Flame Essence', nameCn: '火焰精华', rarity: 'common', description: 'Bottled fire dragon breath, useful for forging and alchemy.', value: 6, category: 'essence' },
  { id: 'frost_crystal', name: 'Frost Crystal', nameCn: '霜晶', rarity: 'common', description: 'A crystal that perpetually generates cold, harvested from ice dragon lairs.', value: 5, category: 'essence' },
  { id: 'storm_shard', name: 'Storm Shard', nameCn: '风暴碎片', rarity: 'uncommon', description: 'A fragment of concentrated storm energy, crackling with lightning.', value: 28, category: 'essence' },
  { id: 'earth_stone', name: 'Earth Stone', nameCn: '地之石', rarity: 'uncommon', description: 'A dense stone that vibrates with the planet\'s natural frequency.', value: 22, category: 'essence' },
  { id: 'shadow_essence', name: 'Shadow Essence', nameCn: '暗影精华', rarity: 'uncommon', description: 'Bottled darkness that absorbs all light within its vicinity.', value: 26, category: 'essence' },
  { id: 'lightning_bolt_fragment', name: 'Lightning Bolt Fragment', nameCn: '雷击碎片', rarity: 'rare', description: 'A captured lightning bolt frozen in crystallized amber.', value: 95, category: 'essence' },
  { id: 'cosmic_dust', name: 'Cosmic Dust', nameCn: '宇宙尘埃', rarity: 'epic', description: 'Stardust collected from the breath of a cosmic dragon.', value: 400, category: 'essence' },
  { id: 'jade_core', name: 'Jade Core', nameCn: '玉髓', rarity: 'epic', description: 'The heart of a jade formation, containing pure imperial energy.', value: 450, category: 'gem' },
  { id: 'dragon_blood', name: 'Dragon Blood', nameCn: '龙血', rarity: 'rare', description: 'Luminous blood with potent magical properties.', value: 110, category: 'essence' },
  { id: 'phoenix_feather', name: 'Phoenix Feather', nameCn: '凤凰羽', rarity: 'epic', description: 'A feather from a phoenix that burns without being consumed.', value: 500, category: 'essence' },

  // Gem Materials (7)
  { id: 'moonstone', name: 'Moonstone', nameCn: '月长石', rarity: 'common', description: 'A stone that glows with soft lunar light during full moons.', value: 8, category: 'gem' },
  { id: 'sunstone', name: 'Sunstone', nameCn: '日长石', rarity: 'uncommon', description: 'A warm orange gem that captures and stores sunlight.', value: 35, category: 'gem' },
  { id: 'celestial_ink', name: 'Celestial Ink', nameCn: '天墨', rarity: 'rare', description: 'Ink made from ground stardust, used for writing imperial decrees.', value: 85, category: 'gem' },
  { id: 'dragonfire_coal', name: 'Dragonfire Coal', nameCn: '龙火煤', rarity: 'uncommon', description: 'Coal that burns with dragonfire intensity for years without depleting.', value: 20, category: 'gem' },
  { id: 'ice_breath_crystal', name: 'Ice Breath Crystal', nameCn: '冰息水晶', rarity: 'rare', description: 'A crystal formed from condensed ice dragon breath.', value: 90, category: 'gem' },
  { id: 'thunder_stone', name: 'Thunder Stone', nameCn: '雷石', rarity: 'epic', description: 'A stone that generates continuous electrical charge, used to power palace defenses.', value: 380, category: 'gem' },
  { id: 'spirit_jade', name: 'Spirit Jade', nameCn: '灵玉', rarity: 'legendary', description: 'A living jade that contains the spirit of an ancient dragon sage.', value: 2000, category: 'gem' },

  // Artifact Fragments (5)
  { id: 'imperial_seal_fragment', name: 'Imperial Seal Fragment', nameCn: '御玺碎片', rarity: 'rare', description: 'A fragment of the legendary imperial dragon seal, still radiating authority.', value: 130, category: 'artifact_fragment' },
  { id: 'jade_pendant', name: 'Jade Pendant', nameCn: '玉佩', rarity: 'uncommon', description: 'A carved jade pendant that once belonged to a dragon princess.', value: 32, category: 'artifact_fragment' },
  { id: 'imperial_decree_scroll', name: 'Imperial Decree Scroll', nameCn: '圣旨残卷', rarity: 'rare', description: 'A surviving fragment of an ancient imperial decree written in dragon script.', value: 105, category: 'artifact_fragment' },
  { id: 'dynasty_coin', name: 'Dynasty Coin', nameCn: '朝代古币', rarity: 'common', description: 'An ancient coin bearing the face of a dragon emperor.', value: 3, category: 'artifact_fragment' },
  { id: 'emperor_crown_fragment', name: 'Emperor Crown Fragment', nameCn: '帝冠碎片', rarity: 'legendary', description: 'A golden fragment from the Dragon Emperor\'s crown, humming with power.', value: 1800, category: 'artifact_fragment' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: DD_STRUCTURES — 25 Palace Structures
// ═══════════════════════════════════════════════════════════════════

export const DD_STRUCTURES: readonly DDStructureDef[] = [
  { id: 'dragon_wall', name: 'Dragon Wall', nameCn: '龙墙', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A massive defensive wall adorned with dragon reliefs that protects the palace perimeter.', costPerLevel: 100, bonusPerLevel: 5, category: 'defense' },
  { id: 'jade_throne', name: 'Jade Throne', nameCn: '玉座', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'The imperial seat of power carved from pure jade, enhancing ruler authority.', costPerLevel: 200, bonusPerLevel: 10, category: 'culture' },
  { id: 'cloud_bridge', name: 'Cloud Bridge', nameCn: '云桥', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A mystical bridge connecting palace towers through solidified clouds.', costPerLevel: 120, bonusPerLevel: 6, category: 'culture' },
  { id: 'dragon_roost_tower', name: 'Dragon Roost Tower', nameCn: '龙巢塔', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A towering roost where wyverns rest and bond with their handlers.', costPerLevel: 150, bonusPerLevel: 8, category: 'production' },
  { id: 'imperial_library', name: 'Imperial Library', nameCn: '御书房', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'Vast archives containing ten thousand years of dynasty history and dragon lore.', costPerLevel: 180, bonusPerLevel: 9, category: 'culture' },
  { id: 'wyvern_training_ground', name: 'Wyvern Training Ground', nameCn: '龙训场', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'An expansive arena where dragon combat techniques are perfected.', costPerLevel: 140, bonusPerLevel: 7, category: 'production' },
  { id: 'dragon_forge', name: 'Dragon Forge', nameCn: '龙炉', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A forge heated by dragonfire, capable of smelting legendary materials.', costPerLevel: 160, bonusPerLevel: 8, category: 'production' },
  { id: 'spirit_garden', name: 'Spirit Garden', nameCn: '灵园', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A tranquil garden where ancestral dragon spirits meditate and grant blessings.', costPerLevel: 130, bonusPerLevel: 7, category: 'mystic' },
  { id: 'moon_gate', name: 'Moon Gate', nameCn: '月门', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A ceremonial gate aligned with lunar cycles that enhances imperial favor.', costPerLevel: 110, bonusPerLevel: 6, category: 'culture' },
  { id: 'dragon_treasury', name: 'Dragon Treasury', nameCn: '龙库', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'An underground vault protected by dragon guardians, storing dynasty wealth.', costPerLevel: 170, bonusPerLevel: 9, category: 'defense' },
  { id: 'war_drum_pavilion', name: 'War Drum Pavilion', nameCn: '战鼓阁', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A pavilion housing giant war drums made from dragon hide that rally troops.', costPerLevel: 140, bonusPerLevel: 7, category: 'defense' },
  { id: 'star_observatory', name: 'Star Observatory', nameCn: '星象台', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A towering observatory for reading celestial signs and cosmic dragon movements.', costPerLevel: 190, bonusPerLevel: 10, category: 'mystic' },
  { id: 'dragon_hospital', name: 'Dragon Hospital', nameCn: '龙医馆', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A specialized healing facility where injured dragons are treated with spirit jade.', costPerLevel: 150, bonusPerLevel: 8, category: 'production' },
  { id: 'imperial_kitchen', name: 'Imperial Kitchen', nameCn: '御膳房', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A grand kitchen that prepares feasts worthy of dragon emperors and their guests.', costPerLevel: 90, bonusPerLevel: 5, category: 'culture' },
  { id: 'element_shrine', name: 'Element Shrine', nameCn: '元素神祠', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A shrine dedicated to the seven dragon elements, granting balanced bonuses.', costPerLevel: 200, bonusPerLevel: 10, category: 'mystic' },
  { id: 'dragon_market', name: 'Dragon Market', nameCn: '龙市', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A bustling marketplace where rare dragon materials are traded.', costPerLevel: 100, bonusPerLevel: 6, category: 'production' },
  { id: 'barrier_monolith', name: 'Barrier Monolith', nameCn: '壁垒巨石', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A magical standing stone that projects a protective barrier over the palace.', costPerLevel: 220, bonusPerLevel: 11, category: 'defense' },
  { id: 'beacon_tower', name: 'Beacon Tower', nameCn: '烽火台', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A tall beacon tower that relays dragonfire signals across the empire.', costPerLevel: 80, bonusPerLevel: 4, category: 'defense' },
  { id: 'dragon_prison', name: 'Dragon Prison', nameCn: '龙牢', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A maximum-security prison for rogue dragons and dynasty traitors.', costPerLevel: 160, bonusPerLevel: 8, category: 'defense' },
  { id: 'relic_vault', name: 'Relic Vault', nameCn: '圣物库', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A climate-controlled vault for storing legendary artifacts safely.', costPerLevel: 180, bonusPerLevel: 9, category: 'mystic' },
  { id: 'meditation_chamber', name: 'Meditation Chamber', nameCn: '冥想室', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A silent chamber where dragon emperors commune with ancestral spirits.', costPerLevel: 150, bonusPerLevel: 8, category: 'mystic' },
  { id: 'storm_caller_spire', name: 'Storm Caller Spire', nameCn: '召雷塔', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A spire that attracts and stores lightning for powering palace mechanisms.', costPerLevel: 170, bonusPerLevel: 9, category: 'production' },
  { id: 'frozen_terrace', name: 'Frozen Terrace', nameCn: '冰露台', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A terrace of perpetual ice that preserves rare materials and food indefinitely.', costPerLevel: 120, bonusPerLevel: 6, category: 'production' },
  { id: 'shadow_alcove', name: 'Shadow Alcove', nameCn: '暗影壁龛', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'A hidden alcove between dimensions used for secret meetings and stealth operations.', costPerLevel: 140, bonusPerLevel: 7, category: 'mystic' },
  { id: 'cosmic_altar', name: 'Cosmic Altar', nameCn: '宇宙祭坛', maxLevel: DD_MAX_STRUCTURE_LEVEL, description: 'The ultimate structure — an altar that channels cosmic energy directly from the stars.', costPerLevel: 300, bonusPerLevel: 15, category: 'mystic' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: DD_ABILITIES — 22 Dragon Abilities
// ═══════════════════════════════════════════════════════════════════

export const DD_ABILITIES: readonly DDAbilityDef[] = [
  { id: 'dragon_breath', name: 'Dragon Breath', nameCn: '龙息', species: 'fire_drake', power: 30, cooldown: 3, description: 'Unleashes a devastating cone of elemental fire that scorches everything in its path.' },
  { id: 'imperial_decree', name: 'Imperial Decree', nameCn: '圣旨', species: 'cosmic_dragon', power: 50, cooldown: 8, description: 'Issues a binding imperial command that all dragons in the dynasty must obey.' },
  { id: 'jade_shield', name: 'Jade Shield', nameCn: '玉盾', species: 'earth_dragon', power: 25, cooldown: 4, description: 'Conjures a shield of living jade that absorbs damage and heals the user.' },
  { id: 'cloud_walk', name: 'Cloud Walk', nameCn: '踏云', species: 'storm_wyrm', power: 15, cooldown: 2, description: 'Allows the dragon to walk on clouds and move at incredible speed through the sky.' },
  { id: 'dragon_fury', name: 'Dragon Fury', nameCn: '龙怒', species: 'fire_drake', power: 45, cooldown: 6, description: 'Enters a berserk state that doubles attack power but reduces defense.' },
  { id: 'inferno_blast', name: 'Inferno Blast', nameCn: '炼狱爆破', species: 'fire_drake', power: 55, cooldown: 7, description: 'Channels all fire energy into a single devastating explosive blast.' },
  { id: 'frost_nova', name: 'Frost Nova', nameCn: '霜冻新星', species: 'ice_lung', power: 40, cooldown: 5, description: 'Releases a wave of absolute cold that freezes everything within a large radius.' },
  { id: 'thunder_strike', name: 'Thunder Strike', nameCn: '雷击', species: 'lightning_eagle', power: 50, cooldown: 4, description: 'Calls down a pinpoint lightning strike on a single target with devastating precision.' },
  { id: 'earth_shake', name: 'Earth Shake', nameCn: '地裂', species: 'earth_dragon', power: 35, cooldown: 5, description: 'Slams the ground with such force that it creates earthquakes and opens fissures.' },
  { id: 'shadow_meld', name: 'Shadow Meld', nameCn: '暗影融合', species: 'shadow_serpent', power: 20, cooldown: 3, description: 'Merges with shadows, becoming invisible and intangible for a brief duration.' },
  { id: 'lightning_dive', name: 'Lightning Dive', nameCn: '雷鹰俯冲', species: 'lightning_eagle', power: 60, cooldown: 6, description: 'Dives from the sky at lightning speed, striking with electrified talons.' },
  { id: 'cosmic_beam', name: 'Cosmic Beam', nameCn: '宇宙光束', species: 'cosmic_dragon', power: 70, cooldown: 10, description: 'Fires a beam of concentrated cosmic energy that pierces through all defenses.' },
  { id: 'dragons_roar', name: 'Dragon\'s Roar', nameCn: '龙啸', species: 'storm_wyrm', power: 35, cooldown: 4, description: 'A terrifying roar that weakens enemy resolve and disrupts their formations.' },
  { id: 'imperial_guard', name: 'Imperial Guard', nameCn: '御卫', species: 'earth_dragon', power: 30, cooldown: 5, description: 'Summons spectral imperial guards from the jade walls to fight alongside.' },
  { id: 'phoenix_rebirth', name: 'Phoenix Rebirth', nameCn: '凤凰重生', species: 'fire_drake', power: 65, cooldown: 12, description: 'Sacrifices current health to fully heal and dramatically boost all stats.' },
  { id: 'storm_surge', name: 'Storm Surge', nameCn: '风暴涌潮', species: 'storm_wyrm', power: 45, cooldown: 6, description: 'Summons a massive storm surge that sweeps enemies off their feet.' },
  { id: 'stone_skin', name: 'Stone Skin', nameCn: '石化皮肤', species: 'earth_dragon', power: 20, cooldown: 5, description: 'Transforms skin to living stone, granting massive damage resistance.' },
  { id: 'void_slash', name: 'Void Slash', nameCn: '虚空斩', species: 'shadow_serpent', power: 55, cooldown: 5, description: 'Slashes through the fabric of reality, dealing damage that ignores armor.' },
  { id: 'thunder_wing', name: 'Thunder Wing', nameCn: '雷翼', species: 'lightning_eagle', power: 40, cooldown: 4, description: 'Unleashes a shockwave from its wings that stuns all nearby enemies.' },
  { id: 'star_fall', name: 'Star Fall', nameCn: '星落', species: 'cosmic_dragon', power: 80, cooldown: 15, description: 'Calls down a rain of meteorites from the sky, devastating a wide area.' },
  { id: 'dragon_transformation', name: 'Dragon Transformation', nameCn: '龙化', species: 'cosmic_dragon', power: 90, cooldown: 20, description: 'Temporarily transforms into a pure energy dragon with greatly enhanced abilities.' },
  { id: 'celestial_ascension', name: 'Celestial Ascension', nameCn: '天化升仙', species: 'cosmic_dragon', power: 100, cooldown: 30, description: 'The ultimate ability — ascends to the celestial realm, becoming invincible briefly.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: DD_ACHIEVEMENTS — 18 Dynasty Achievements
// ═══════════════════════════════════════════════════════════════════

export const DD_ACHIEVEMENTS: readonly DDAchievementDef[] = [
  { id: 'dd_ach_01', name: 'First Flame', nameCn: '初火', description: 'Summon your first dragon wyvern.', condition: 'wyvernsSummoned >= 1', reward: '+10 Dragon Power' },
  { id: 'dd_ach_02', name: 'Wyrm Collector', nameCn: '龙收藏家', description: 'Summon 10 different dragon wyverns.', condition: 'wyvernsSummoned >= 10', reward: '+50 Dragon Power' },
  { id: 'dd_ach_03', name: 'Palace Conqueror', nameCn: '宫殿征服者', description: 'Claim 3 palace locations.', condition: 'palacesClaimed >= 3', reward: '+100 Imperial Favor' },
  { id: 'dd_ach_04', name: 'Master Builder', nameCn: '建筑大师', description: 'Build 10 palace structures.', condition: 'structuresBuilt >= 10', reward: '+200 Dragon Power' },
  { id: 'dd_ach_05', name: 'Dragon Tamer', nameCn: '驯龙师', description: 'Reach level 20 with the dynasty.', condition: 'level >= 20', reward: '+300 Imperial Favor' },
  { id: 'dd_ach_06', name: 'Imperial Favorite', nameCn: '帝王宠臣', description: 'Accumulate 1000 imperial favor.', condition: 'favor >= 1000', reward: 'Title: Imperial Chancellor' },
  { id: 'dd_ach_07', name: 'Relic Hunter', nameCn: '圣物猎人', description: 'Find 5 legendary artifacts.', condition: 'artifactsFound >= 5', reward: '+500 Dragon Power' },
  { id: 'dd_ach_08', name: 'Dynasty Founder', nameCn: '王朝奠基者', description: 'Claim all 8 palace locations.', condition: 'palacesClaimed >= 8', reward: '+1000 Dragon Power' },
  { id: 'dd_ach_09', name: 'Dragon Army', nameCn: '龙军统帅', description: 'Summon 25 different dragon wyverns.', condition: 'wyvernsSummoned >= 25', reward: '+700 Imperial Favor' },
  { id: 'dd_ach_10', name: 'Artifact Master', nameCn: '圣物大师', description: 'Collect 10 legendary artifacts.', condition: 'artifactsFound >= 10', reward: '+1500 Dragon Power' },
  { id: 'dd_ach_11', name: 'Supreme Commander', nameCn: '最高统帅', description: 'Use 50 dragon abilities in total.', condition: 'abilitiesUsed >= 50', reward: '+400 Imperial Favor' },
  { id: 'dd_ach_12', name: 'Jade Emperor\'s Blessing', nameCn: '玉帝赐福', description: 'Reach level 50.', condition: 'level >= 50', reward: '+2000 Dragon Power' },
  { id: 'dd_ach_13', name: 'Dragon Sage', nameCn: '龙贤者', description: 'Build all 25 palace structures.', condition: 'structuresBuilt >= 25', reward: '+3000 Dragon Power' },
  { id: 'dd_ach_14', name: 'Palace Architect', nameCn: '宫殿建筑师', description: 'Upgrade any structure to level 10.', condition: 'maxStructureLevel >= 10', reward: '+500 Imperial Favor' },
  { id: 'dd_ach_15', name: 'Legendary Summoner', nameCn: '传说召唤师', description: 'Summon all 35 dragon wyverns.', condition: 'wyvernsSummoned >= 35', reward: '+5000 Dragon Power' },
  { id: 'dd_ach_16', name: 'Dragon Dynasty Ruler', nameCn: '龙朝统治者', description: 'Reach level 75.', condition: 'level >= 75', reward: '+10000 Imperial Favor' },
  { id: 'dd_ach_17', name: 'Celestial Conqueror', nameCn: '天界征服者', description: 'Accumulate 5000 total dragon power.', condition: 'totalPower >= 5000', reward: '+2500 Dragon Power' },
  { id: 'dd_ach_18', name: 'Eternal Dragon Emperor', nameCn: '永恒龙帝', description: 'Achieve the title of Celestial Emperor.', condition: 'title == celestial_emperor', reward: 'Eternal glory' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: DD_TITLES — 8 Dynasty Titles
// ═══════════════════════════════════════════════════════════════════

export const DD_TITLES: readonly DDTitleDef[] = [
  { id: 'dragon_hatchling', name: 'Dragon Hatchling', nameCn: '龙崽', requirement: 'Begin your dragon dynasty journey.', levelRequired: 1, favorBonus: 0 },
  { id: 'wyrm_keeper', name: 'Wyrm Keeper', nameCn: '蛇龙守者', requirement: 'Prove yourself worthy of tending young dragons.', levelRequired: 5, favorBonus: 5 },
  { id: 'dragon_knight', name: 'Dragon Knight', nameCn: '龙骑士', requirement: 'Earn the respect of adult dragon warriors.', levelRequired: 10, favorBonus: 10 },
  { id: 'palace_lord', name: 'Palace Lord', nameCn: '宫殿领主', requirement: 'Claim and govern a palace of your own.', levelRequired: 20, favorBonus: 20 },
  { id: 'dragon_duke', name: 'Dragon Duke', nameCn: '龙公爵', requirement: 'Command multiple palaces and their dragon garrisons.', levelRequired: 35, favorBonus: 35 },
  { id: 'imperial_chancellor', name: 'Imperial Chancellor', nameCn: '太傅', requirement: 'Advise the emperor on all matters of dragon governance.', levelRequired: 50, favorBonus: 50 },
  { id: 'dragon_emperor', name: 'Dragon Emperor', nameCn: '龙帝', requirement: 'Ascend to the throne and rule all dragons.', levelRequired: 75, favorBonus: 75 },
  { id: 'celestial_emperor', name: 'Celestial Emperor', nameCn: '天帝', requirement: 'Transcend mortality and join the celestial dragon court.', levelRequired: 100, favorBonus: 100 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: DD_ARTIFACTS — 15 Legendary Artifacts
// ═══════════════════════════════════════════════════════════════════

export const DD_ARTIFACTS: readonly DDArtifactDef[] = [
  { id: 'dragon_emperor_crown', name: 'Dragon Emperor\'s Crown', nameCn: '龙帝皇冠', description: 'A crown forged from the first dragon emperor\'s scales.', lore: 'Wearing it grants visions of every past and future dynasty ruler.', power: 500, rarity: 'legendary' },
  { id: 'jade_dragon_seal', name: 'Jade Dragon Seal', nameCn: '玉龙印', description: 'A seal carved from a single piece of imperial jade.', lore: 'Documents stamped with this seal cannot be forged or countermanded.', power: 400, rarity: 'epic' },
  { id: 'phoenix_flame_sword', name: 'Phoenix Flame Sword', nameCn: '凤凰焰剑', description: 'A blade forged in phoenix fire that never cools.', lore: 'The sword glows hottest in the hands of the righteous.', power: 350, rarity: 'epic' },
  { id: 'thunder_dragon_staff', name: 'Thunder Dragon\'s Staff', nameCn: '雷龙杖', description: 'A staff that channels lightning through its crystalline core.', lore: 'It was the weapon of the first Lightning Eagle emperor.', power: 380, rarity: 'epic' },
  { id: 'cosmic_dragon_orb', name: 'Cosmic Dragon Orb', nameCn: '宇宙龙珠', description: 'An orb containing a miniature galaxy in perpetual motion.', lore: 'Staring into it reveals secrets of the cosmos.', power: 600, rarity: 'legendary' },
  { id: 'shadow_serpent_fang', name: 'Shadow Serpent\'s Fang', nameCn: '暗蛇牙', description: 'A fang that can cut through dimensions.', lore: 'Its venom induces dreams that reveal hidden truths.', power: 320, rarity: 'epic' },
  { id: 'earth_dragon_heart', name: 'Earth Dragon\'s Heart', nameCn: '地龙心', description: 'A living crystal heart that pulses with planetary energy.', lore: 'Planting it in barren soil creates fertile land for miles.', power: 450, rarity: 'legendary' },
  { id: 'ice_dragon_scepter', name: 'Ice Dragon\'s Scepter', nameCn: '冰龙权杖', description: 'A scepter that commands eternal winter within its radius.', lore: 'The first Ice Lung emperor used it to end the Great Drought.', power: 360, rarity: 'epic' },
  { id: 'imperial_dragon_robe', name: 'Imperial Dragon Robe', nameCn: '龙袍', description: 'A ceremonial robe woven from dragon silk.', lore: 'It renders its wearer immune to all elemental damage.', power: 420, rarity: 'epic' },
  { id: 'dragon_bone_armor', name: 'Dragon Bone Armor', nameCn: '龙骨甲', description: 'Full plate armor crafted from dragon bone.', lore: 'Each piece was harvested from a willing dragon ancestor.', power: 300, rarity: 'rare' },
  { id: 'celestial_dragon_wings', name: 'Celestial Dragon Wings', nameCn: '天龙翼', description: 'A pair of wings that grant true flight.', lore: 'They were shed by the Cosmic Celestial Emperor during its first descent to the mortal realm.', power: 550, rarity: 'legendary' },
  { id: 'dragonfire_gem', name: 'Dragonfire Gem', nameCn: '龙火宝石', description: 'A gem that contains perpetual dragonfire.', lore: 'It has been burning since the moment the first dragon breathed fire.', power: 280, rarity: 'rare' },
  { id: 'spirit_jade_pendant', name: 'Spirit Jade Pendant', nameCn: '灵玉佩', description: 'A pendant containing a benevolent dragon spirit.', lore: 'The spirit within offers counsel to its wearer in times of crisis.', power: 250, rarity: 'rare' },
  { id: 'dynasty_founding_scroll', name: 'Dynasty Founding Scroll', nameCn: '建国诏书', description: 'The original scroll that established the Dragon Dynasty.', lore: 'It is said to rewrite itself whenever the dynasty faces existential threat.', power: 700, rarity: 'legendary' },
  { id: 'eternal_dragons_eye', name: 'Eternal Dragon\'s Eye', nameCn: '永世龙眼', description: 'A gemstone formed from the eye of the first dragon.', lore: 'It sees through all deception and across all dimensions.', power: 800, rarity: 'legendary' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: DD_EVENTS — 12 Dynasty Events
// ═══════════════════════════════════════════════════════════════════

export const DD_EVENTS: readonly DDEventDef[] = [
  { id: 'dd_evt_01', name: 'Dragon Migration', nameCn: '龙迁徙', description: 'A massive flock of wild dragons passes through the empire.', effect: '+20% summoning luck for a limited time.', severity: 3 },
  { id: 'dd_evt_02', name: 'Imperial Tournament', nameCn: '御前比武', description: 'Dragon warriors compete for imperial glory in the grand arena.', effect: '+50 Dragon Power to the winner.', severity: 4 },
  { id: 'dd_evt_03', name: 'Jade Festival', nameCn: '玉节', description: 'The annual festival celebrating the jade bond between dragons and mortals.', effect: '+100 Imperial Favor to all participants.', severity: 2 },
  { id: 'dd_evt_04', name: 'Storm Season', nameCn: '风暴季', description: 'A season of particularly violent storms sweeps the empire.', effect: 'Lightning dragon power doubled, fire dragon power halved.', severity: 5 },
  { id: 'dd_evt_05', name: 'Shadow Invasion', nameCn: '暗影入侵', description: 'Shadow creatures pour forth from the void between dimensions.', effect: 'Shadow serpent power tripled, defensive structures damaged.', severity: 7 },
  { id: 'dd_evt_06', name: 'Phoenix Rebirth', nameCn: '凤凰重生', description: 'A phoenix is reborn in the palace flames, blessing the dynasty.', effect: 'All dragons gain a temporary power boost.', severity: 3 },
  { id: 'dd_evt_07', name: 'Cosmic Alignment', nameCn: '宇宙排列', description: 'The stars align in a pattern that empowers cosmic dragons.', effect: 'Cosmic dragon abilities cost no energy for a short time.', severity: 2 },
  { id: 'dd_evt_08', name: 'Great Earthquake', nameCn: '大地震', description: 'The earth dragon king stirs in its sleep beneath the mountains.', effect: 'Earth dragon structures gain a level, others may be damaged.', severity: 6 },
  { id: 'dd_evt_09', name: 'Dragon Awakening', nameCn: '龙觉醒', description: 'An ancient dragon awakens from millennia of slumber.', effect: 'A random legendary wyvern becomes available for summoning.', severity: 5 },
  { id: 'dd_evt_10', name: 'Imperial Betrayal', nameCn: '皇室背叛', description: 'A trusted advisor attempts to seize the dragon throne.', effect: 'Lose imperial favor, gain dragon power from defeating traitor.', severity: 8 },
  { id: 'dd_evt_11', name: 'Spirit Realm Opening', nameCn: '灵界开启', description: 'The barrier between the mortal and spirit realms thins.', effect: 'Mystic structures produce double bonuses for a time.', severity: 4 },
  { id: 'dd_evt_12', name: 'Dynasty Anniversary', nameCn: '王朝纪念日', description: 'The founding anniversary of the Dragon Dynasty is celebrated.', effect: 'All dragon power and imperial favor gains doubled.', severity: 1 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: HELPER FUNCTIONS (outside the hook)
// ═══════════════════════════════════════════════════════════════════

function ddCalcWyvernPower(wyvernId: string, level: number): number {
  const def = DD_WYVERNS.find(w => w.id === wyvernId)
  if (!def) return 0
  const rarityMult = DD_RARITIES.find(r => r.id === def.rarity)?.multiplier ?? 1
  return Math.floor(def.power * rarityMult * (1 + level * 0.15))
}

function ddCalcStructureBonus(structureId: string, level: number): number {
  const def = DD_STRUCTURES.find(s => s.id === structureId)
  if (!def) return 0
  return def.bonusPerLevel * level
}

function ddCalcDynastyLevel(stats: DragonDynastyState['ddStats']): number {
  return Math.floor(
    (stats.wyvernsSummoned * 2 +
      stats.palacesClaimed * 5 +
      stats.structuresBuilt * 3 +
      stats.abilitiesUsed +
      stats.artifactsFound * 10) /
      10,
  ) + 1
}

function ddCalcTitle(level: number): string {
  for (let i = DD_TITLES.length - 1; i >= 0; i--) {
    if (level >= DD_TITLES[i].levelRequired) return DD_TITLES[i].id
  }
  return DD_TITLES[0].id
}

function ddCalcDragonPower(wyverns: DragonDynastyState['ddWyverns']): number {
  let total = 0
  for (const key of Object.keys(wyverns)) {
    const w = wyverns[key]
    if (w && w.owned) {
      total += ddCalcWyvernPower(key, w.level)
    }
  }
  return total
}

function ddCalcStructureTotalBonus(structures: DragonDynastyState['ddStructures']): number {
  let total = 0
  for (const key of Object.keys(structures)) {
    const s = structures[key]
    if (s && s.built) {
      total += ddCalcStructureBonus(key, s.level)
    }
  }
  return total
}

function ddCheckAchievements(state: DragonDynastyState): string[] {
  const newAchievements: string[] = [...state.ddAchievements]
  const metrics: Record<string, number> = {
    wyvernsSummoned: state.ddStats.wyvernsSummoned,
    palacesClaimed: state.ddStats.palacesClaimed,
    structuresBuilt: state.ddStats.structuresBuilt,
    abilitiesUsed: state.ddStats.abilitiesUsed,
    artifactsFound: state.ddStats.artifactsFound,
    totalPower: state.ddDragonPower,
    level: state.ddLevel,
    favor: state.ddImperialFavor,
    maxStructureLevel: Math.max(0, ...Object.values(state.ddStructures).map(s => s.level)),
  }

  for (const ach of DD_ACHIEVEMENTS) {
    if (newAchievements.includes(ach.id)) continue
    const match = ach.condition.match(/(\w+)\s*>=\s*(\d+)/)
    if (!match) {
      if (ach.condition.startsWith('title == ')) {
        const titleId = ach.condition.replace('title == ', '')
        if (state.ddTitle === titleId) {
          newAchievements.push(ach.id)
        }
      }
      continue
    }
    const key = match[1]
    const threshold = parseInt(match[2], 10)
    const value = metrics[key] ?? 0
    if (value >= threshold) {
      newAchievements.push(ach.id)
    }
  }

  return newAchievements
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: INITIAL STATE & ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

const DD_INITIAL_STATE: DragonDynastyState = {
  ddLevel: 1,
  ddDragonPower: 0,
  ddImperialFavor: 50,
  ddWyverns: {},
  ddPalaces: {
    [DD_PALACES[0].id]: { claimed: true, level: 1, garrison: [] },
  },
  ddStructures: {},
  ddArtifacts: [],
  ddAchievements: [],
  ddInventory: [],
  ddStats: {
    wyvernsSummoned: 0,
    palacesClaimed: 1,
    structuresBuilt: 0,
    abilitiesUsed: 0,
    artifactsFound: 0,
    totalDragonPower: 0,
  },
  ddTitle: 'dragon_hatchling',
  ddEvents: [],
}

const useDragonDynastyStore = create<DragonDynastyState>()(
  persist(
    () => ({
      ...DD_INITIAL_STATE,
    }),
    {
      name: 'dragon-dynasty-wire',
    },
  ),
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: MAIN HOOK — useDragonDynasty
// ═══════════════════════════════════════════════════════════════════

export default function useDragonDynasty() {
  const state = useDragonDynastyStore()

  // ─── Computed Values (all depend on state) ─────────────────────

  const ddOwnedWyvernCount = useMemo(() => {
    let count = 0
    for (const key of Object.keys(state.ddWyverns)) {
      const w = state.ddWyverns[key]
      if (w && w.owned) count++
    }
    return count
  }, [state])

  const ddTotalDragonPower = useMemo(() => {
    return ddCalcDragonPower(state.ddWyverns)
  }, [state])

  const ddStructureBonus = useMemo(() => {
    return ddCalcStructureTotalBonus(state.ddStructures)
  }, [state])

  const ddEffectivePower = useMemo(() => {
    return ddTotalDragonPower + ddStructureBonus
  }, [state, ddTotalDragonPower, ddStructureBonus])

  const ddClaimedPalaceCount = useMemo(() => {
    let count = 0
    for (const key of Object.keys(state.ddPalaces)) {
      const p = state.ddPalaces[key]
      if (p && p.claimed) count++
    }
    return count
  }, [state])

  const ddBuiltStructureCount = useMemo(() => {
    let count = 0
    for (const key of Object.keys(state.ddStructures)) {
      const s = state.ddStructures[key]
      if (s && s.built) count++
    }
    return count
  }, [state])

  const ddMaxStructureLevel = useMemo(() => {
    let max = 0
    for (const key of Object.keys(state.ddStructures)) {
      const s = state.ddStructures[key]
      if (s && s.level > max) max = s.level
    }
    return max
  }, [state])

  const ddInventoryCount = useMemo(() => {
    let total = 0
    for (const item of state.ddInventory) {
      total += item.quantity
    }
    return total
  }, [state])

  const ddInventoryValue = useMemo(() => {
    let total = 0
    for (const item of state.ddInventory) {
      const def = DD_MATERIALS.find(m => m.id === item.id)
      if (def) total += def.value * item.quantity
    }
    return total
  }, [state])

  const ddAchievementProgress = useMemo(() => {
    if (DD_ACHIEVEMENTS.length === 0) return 0
    return Math.round((state.ddAchievements.length / DD_ACHIEVEMENTS.length) * 100)
  }, [state])

  const ddArtifactPower = useMemo(() => {
    let total = 0
    for (const artifactId of state.ddArtifacts) {
      const def = DD_ARTIFACTS.find(a => a.id === artifactId)
      if (def) total += def.power
    }
    return total
  }, [state])

  const ddCurrentTitleDef = useMemo(() => {
    const found = DD_TITLES.find(t => t.id === state.ddTitle)
    if (found) return found
    return DD_TITLES[0]
  }, [state])

  const ddAvailablePalaces = useMemo(() => {
    return DD_PALACES.filter(p => {
      const ps = state.ddPalaces[p.id]
      return !ps || !ps.claimed
    })
  }, [state])

  const ddWyvernsBySpecies = useMemo(() => {
    const groups: Record<string, typeof DD_WYVERNS> = {}
    for (const species of DD_SPECIES) {
      groups[species.id] = DD_WYVERNS.filter(w => w.species === species.id)
    }
    return groups
  }, [])

  const ddWyvernsByRarity = useMemo(() => {
    const groups: Record<string, typeof DD_WYVERNS> = {}
    for (const rarity of DD_RARITIES) {
      groups[rarity.id] = DD_WYVERNS.filter(w => w.rarity === rarity.id)
    }
    return groups
  }, [])

  const ddOwnedWyvernDefs = useMemo(() => {
    const defs: DDWyvernDef[] = []
    for (const key of Object.keys(state.ddWyverns)) {
      const w = state.ddWyverns[key]
      if (w && w.owned) {
        const def = DD_WYVERNS.find(d => d.id === key)
        if (def) defs.push(def)
      }
    }
    return defs
  }, [state])

  const ddHasLegendaryWyvern = useMemo(() => {
    for (const key of Object.keys(state.ddWyverns)) {
      const w = state.ddWyverns[key]
      if (w && w.owned) {
        const def = DD_WYVERNS.find(d => d.id === key)
        if (def && def.rarity === 'legendary') return true
      }
    }
    return false
  }, [state])

  const ddHasEpicWyvern = useMemo(() => {
    for (const key of Object.keys(state.ddWyverns)) {
      const w = state.ddWyverns[key]
      if (w && w.owned) {
        const def = DD_WYVERNS.find(d => d.id === key)
        if (def && (def.rarity === 'epic' || def.rarity === 'legendary')) return true
      }
    }
    return false
  }, [state])

  const ddEventHistory = useMemo(() => {
    return state.ddEvents.map(eventId => {
      const def = DD_EVENTS.find(e => e.id === eventId)
      if (def) return def
      return null
    }).filter((e): e is DDEventDef => e !== null)
  }, [state])

  const ddAvailableEvents = useMemo(() => {
    return DD_EVENTS.filter(e => !state.ddEvents.includes(e.id))
  }, [state])

  const ddNextTitle = useMemo(() => {
    const currentIndex = DD_TITLES.findIndex(t => t.id === state.ddTitle)
    if (currentIndex < DD_TITLES.length - 1) return DD_TITLES[currentIndex + 1]
    return null
  }, [state])

  const ddTitleProgress = useMemo(() => {
    const currentDef = ddCurrentTitleDef
    const next = ddNextTitle
    if (!next) return 1
    const progress = Math.min(1, (state.ddLevel - currentDef.levelRequired) / (next.levelRequired - currentDef.levelRequired))
    return progress
  }, [state, ddCurrentTitleDef, ddNextTitle])

  const ddWyvernCollectionRate = useMemo(() => {
    if (DD_WYVERNS.length === 0) return 0
    return Math.round((state.ddStats.wyvernsSummoned / DD_WYVERNS.length) * 100)
  }, [state])

  const ddPalaceCompletionRate = useMemo(() => {
    if (DD_PALACES.length === 0) return 0
    return Math.round((ddClaimedPalaceCount / DD_PALACES.length) * 100)
  }, [state, ddClaimedPalaceCount])

  const ddStructureCompletionRate = useMemo(() => {
    if (DD_STRUCTURES.length === 0) return 0
    return Math.round((ddBuiltStructureCount / DD_STRUCTURES.length) * 100)
  }, [state, ddBuiltStructureCount])

  // ─── Action Functions ──────────────────────────────────────────

  const ddSummonWyvern = useMemo(() => {
    return (wyvernId: string): boolean => {
      const wyvernDef = DD_WYVERNS.find(w => w.id === wyvernId)
      if (!wyvernDef) return false

      let summoned = false
      useDragonDynastyStore.setState((prev) => {
        const existing = prev.ddWyverns[wyvernId]
        if (existing && existing.owned) return prev

        const newWyverns = { ...prev.ddWyverns }
        if (existing) {
          newWyverns[wyvernId] = { ...existing, owned: true, count: existing.count + 1 }
        } else {
          newWyverns[wyvernId] = { owned: true, count: 1, level: 1 }
        }

        const newStats = {
          ...prev.ddStats,
          wyvernsSummoned: prev.ddStats.wyvernsSummoned + 1,
          totalDragonPower: prev.ddStats.totalDragonPower + wyvernDef.power,
        }

        const newLevel = ddCalcDynastyLevel(newStats)
        const newTitle = ddCalcTitle(newLevel)
        const newPower = ddCalcDragonPower(newWyverns) + ddCalcStructureTotalBonus(prev.ddStructures)

        summoned = true
        return {
          ddWyverns: newWyverns,
          ddStats: newStats,
          ddLevel: newLevel,
          ddTitle: newTitle,
          ddDragonPower: newPower,
        }
      })

      if (summoned) {
        useDragonDynastyStore.setState((prev) => {
          return { ddAchievements: ddCheckAchievements(prev) }
        })
      }

      return summoned
    }
  }, [])

  const ddPalaceClaim = useMemo(() => {
    return (palaceId: string): boolean => {
      const palaceDef = DD_PALACES.find(p => p.id === palaceId)
      if (!palaceDef) return false

      let claimed = false
      useDragonDynastyStore.setState((prev) => {
        const existing = prev.ddPalaces[palaceId]
        if (existing && existing.claimed) return prev
        if (prev.ddImperialFavor < palaceDef.favorRequired) return prev

        const newPalaces = { ...prev.ddPalaces }
        newPalaces[palaceId] = { claimed: true, level: 1, garrison: [] }

        const newStats = {
          ...prev.ddStats,
          palacesClaimed: prev.ddStats.palacesClaimed + 1,
        }

        const newLevel = ddCalcDynastyLevel(newStats)
        const newTitle = ddCalcTitle(newLevel)

        claimed = true
        return {
          ddPalaces: newPalaces,
          ddImperialFavor: prev.ddImperialFavor - palaceDef.favorRequired,
          ddStats: newStats,
          ddLevel: newLevel,
          ddTitle: newTitle,
        }
      })

      if (claimed) {
        useDragonDynastyStore.setState((prev) => {
          return { ddAchievements: ddCheckAchievements(prev) }
        })
      }

      return claimed
    }
  }, [])

  const ddBuildStructure = useMemo(() => {
    return (structureId: string): boolean => {
      const structDef = DD_STRUCTURES.find(s => s.id === structureId)
      if (!structDef) return false

      let built = false
      useDragonDynastyStore.setState((prev) => {
        const existing = prev.ddStructures[structureId]
        if (existing && existing.built) {
          // Upgrade existing structure
          if (existing.level >= structDef.maxLevel) return prev
          const newStructures = { ...prev.ddStructures }
          newStructures[structureId] = { ...existing, level: existing.level + 1 }
          const newPower = ddCalcDragonPower(prev.ddWyverns) + ddCalcStructureTotalBonus(newStructures)
          built = true
          return { ddStructures: newStructures, ddDragonPower: newPower }
        }

        const newStructures = { ...prev.ddStructures }
        newStructures[structureId] = { built: true, level: 1 }

        const newStats = {
          ...prev.ddStats,
          structuresBuilt: prev.ddStats.structuresBuilt + 1,
        }

        const newLevel = ddCalcDynastyLevel(newStats)
        const newTitle = ddCalcTitle(newLevel)
        const newPower = ddCalcDragonPower(prev.ddWyverns) + ddCalcStructureTotalBonus(newStructures)

        built = true
        return {
          ddStructures: newStructures,
          ddStats: newStats,
          ddLevel: newLevel,
          ddTitle: newTitle,
          ddDragonPower: newPower,
        }
      })

      if (built) {
        useDragonDynastyStore.setState((prev) => {
          return { ddAchievements: ddCheckAchievements(prev) }
        })
      }

      return built
    }
  }, [])

  const ddDragonBreath = useMemo(() => {
    return (targetId: string, abilityId: string): boolean => {
      const abilityDef = DD_ABILITIES.find(a => a.id === abilityId)
      if (!abilityDef) return false

      let used = false
      useDragonDynastyStore.setState((prev) => {
        const newStats = {
          ...prev.ddStats,
          abilitiesUsed: prev.ddStats.abilitiesUsed + 1,
        }

        // Grant imperial favor based on ability power
        const favorGain = Math.floor(abilityDef.power / 10) + 1
        const newFavor = prev.ddImperialFavor + favorGain

        // Grant random material
        const randomMaterial = DD_MATERIALS[Math.floor(Math.random() * DD_MATERIALS.length)]
        const newInventory = [...prev.ddInventory]
        const existingItem = newInventory.find(i => i.id === randomMaterial.id)
        if (existingItem) {
          existingItem.quantity += 1
        } else {
          newInventory.push({ id: randomMaterial.id, quantity: 1 })
        }

        const newLevel = ddCalcDynastyLevel(newStats)
        const newTitle = ddCalcTitle(newLevel)

        used = true
        return {
          ddStats: newStats,
          ddImperialFavor: newFavor,
          ddInventory: newInventory,
          ddLevel: newLevel,
          ddTitle: newTitle,
        }
      })

      if (used) {
        useDragonDynastyStore.setState((prev) => {
          return { ddAchievements: ddCheckAchievements(prev) }
        })
      }

      return used
    }
  }, [])

  const ddActivateRelic = useMemo(() => {
    return (artifactId: string): boolean => {
      const artifactDef = DD_ARTIFACTS.find(a => a.id === artifactId)
      if (!artifactDef) return false

      let activated = false
      useDragonDynastyStore.setState((prev) => {
        if (prev.ddArtifacts.includes(artifactId)) return prev

        const newArtifacts = [...prev.ddArtifacts, artifactId]
        const newStats = {
          ...prev.ddStats,
          artifactsFound: prev.ddStats.artifactsFound + 1,
        }

        // Grant dragon power equal to artifact power
        const newDragonPower = prev.ddDragonPower + artifactDef.power

        activated = true
        return {
          ddArtifacts: newArtifacts,
          ddStats: newStats,
          ddDragonPower: newDragonPower,
        }
      })

      if (activated) {
        useDragonDynastyStore.setState((prev) => {
          return { ddAchievements: ddCheckAchievements(prev) }
        })
      }

      return activated
    }
  }, [])

  const resetDragonDynasty = useMemo(() => {
    return (): void => {
      useDragonDynastyStore.setState(DD_INITIAL_STATE)
    }
  }, [])

    // ─── Enriched Data (lens functions) ─────────────────────────────

  const ddEnrichedWyverns = useMemo(() => {
    return DD_WYVERNS.map(w => {
      const ws = state.ddWyverns[w.id]
      const speciesDef = DD_SPECIES.find(s => s.id === w.species)
      const rarityDef = DD_RARITIES.find(r => r.id === w.rarity)
      const totalPower = ws ? ddCalcWyvernPower(w.id, ws.level) : w.power
      return {
        ...w,
        speciesDef: speciesDef ?? null,
        rarityDef: rarityDef ?? null,
        speciesColor: speciesDef?.color ?? '#999',
        rarityColor: rarityDef?.color ?? '#999',
        rarityMultiplier: rarityDef?.multiplier ?? 1,
        owned: ws?.owned ?? false,
        ownedLevel: ws?.level ?? 0,
        ownedCount: ws?.count ?? 0,
        totalPower,
        canSummon: !ws?.owned,
      }
    })
  }, [state])

  const ddEnrichedPalaces = useMemo(() => {
    return DD_PALACES.map(p => {
      const ps = state.ddPalaces[p.id]
      return {
        ...p,
        claimed: ps?.claimed ?? false,
        level: ps?.level ?? 0,
        garrison: ps?.garrison ?? [],
        canClaim: !ps?.claimed,
        favorSufficient: state.ddImperialFavor >= p.favorRequired,
        garrisonCount: ps?.garrison.length ?? 0,
      }
    })
  }, [state])

  const ddEnrichedStructures = useMemo(() => {
    return DD_STRUCTURES.map(s => {
      const ss = state.ddStructures[s.id]
      const currentLevel = ss?.level ?? 0
      return {
        ...s,
        built: ss?.built ?? false,
        level: currentLevel,
        totalBonus: ddCalcStructureBonus(s.id, currentLevel),
        upgradeCost: ss && ss.built && currentLevel < s.maxLevel ? s.costPerLevel * (currentLevel + 1) : 0,
        isMaxLevel: currentLevel >= s.maxLevel,
        canBuild: !ss?.built,
      }
    })
  }, [state])

  const ddEnrichedMaterials = useMemo(() => {
    const owned = new Map<string, number>()
    for (const item of state.ddInventory) {
      owned.set(item.id, (owned.get(item.id) ?? 0) + item.quantity)
    }
    return DD_MATERIALS.map(m => ({
      ...m,
      ownedQuantity: owned.get(m.id) ?? 0,
      rarityDef: DD_RARITIES.find(r => r.id === m.rarity) ?? null,
      rarityColor: DD_RARITIES.find(r => r.id === m.rarity)?.color ?? '#999',
    }))
  }, [state])

  const ddEnrichedArtifacts = useMemo(() => {
    return state.ddArtifacts.map(id => DD_ARTIFACTS.find(a => a.id === id)).filter((a): a is DDArtifactDef => a !== null)
  }, [state])

  const ddEnrichedAchievements = useMemo(() => {
    return DD_ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: state.ddAchievements.includes(a.id),
    }))
  }, [state])

  const ddEnrichedAbilities = useMemo(() => {
    return DD_ABILITIES.map(a => ({
      ...a,
      speciesDef: DD_SPECIES.find(s => s.id === a.species) ?? null,
      speciesColor: DD_SPECIES.find(s => s.id === a.species)?.color ?? '#999',
    }))
  }, [])

  const ddEnrichedEvents = useMemo(() => {
    return DD_EVENTS.map(e => ({
      ...e,
      experienced: state.ddEvents.includes(e.id),
    }))
  }, [state])

  // ─── Aggregation helpers ────────────────────────────────────────

  const ddWyvernPowerBySpecies = useMemo(() => {
    const result: Record<string, number> = {}
    for (const species of DD_SPECIES) {
      result[species.id] = 0
    }
    for (const key of Object.keys(state.ddWyverns)) {
      const w = state.ddWyverns[key]
      if (w && w.owned) {
        const def = DD_WYVERNS.find(d => d.id === key)
        if (def) {
          result[def.species] += ddCalcWyvernPower(key, w.level)
        }
      }
    }
    return result
  }, [state])

  const ddWyvernPowerByRarity = useMemo(() => {
    const result: Record<string, number> = {}
    for (const rarity of DD_RARITIES) {
      result[rarity.id] = 0
    }
    for (const key of Object.keys(state.ddWyverns)) {
      const w = state.ddWyverns[key]
      if (w && w.owned) {
        const def = DD_WYVERNS.find(d => d.id === key)
        if (def) {
          result[def.rarity] += ddCalcWyvernPower(key, w.level)
        }
      }
    }
    return result
  }, [state])

  const ddStructuresByCategory = useMemo(() => {
    const groups: Record<string, typeof DD_STRUCTURES> = {}
    for (const s of DD_STRUCTURES) {
      const cat = s.category
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(s)
    }
    return groups
  }, [])

  const ddInventoryByCategory = useMemo(() => {
    const groups: Record<string, typeof DD_MATERIALS> = {}
    for (const m of DD_MATERIALS) {
      const cat = m.category
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(m)
    }
    return groups
  }, [])

  const ddAbilitiesBySpecies = useMemo(() => {
    const groups: Record<string, typeof DD_ABILITIES> = {}
    for (const a of DD_ABILITIES) {
      const sp = a.species
      if (!groups[sp]) groups[sp] = []
      groups[sp].push(a)
    }
    return groups
  }, [])

  const ddPalacesByTier = useMemo(() => {
    return DD_PALACES.slice().sort((a, b) => a.tier - b.tier)
  }, [])

  const ddArtifactsByRarity = useMemo(() => {
    const groups: Record<string, typeof DD_ARTIFACTS> = {}
    for (const a of DD_ARTIFACTS) {
      const r = a.rarity
      if (!groups[r]) groups[r] = []
      groups[r].push(a)
    }
    return groups
  }, [])

  // ─── Dynasty Advisor ───────────────────────────────────────────

  const ddAdvisorTips = useMemo((): string[] => {
    const tips: string[] = []

    if (state.ddWyverns && Object.keys(state.ddWyverns).length === 0) {
      tips.push('Begin your dynasty by summoning your first dragon wyvern from the roster.')
      tips.push('Each species has unique abilities aligned with the seven imperial elements.')
      tips.push('Common wyverns are easiest to summon but legendary ones wield incredible power.')
    }

    if (state.ddImperialFavor < 100) {
      tips.push('Accumulate imperial favor by using dragon abilities and building palace structures.')
      tips.push('Imperial favor is the currency of the Dragon Dynasty — spend it wisely to claim palaces.')
    }

    if (ddClaimedPalaceCount < 3) {
      tips.push('Claim more palaces to unlock higher-tier dragon bonuses and imperial authority.')
      tips.push('Each palace provides unique bonuses that stack with your dragon power.')
    }

    if (ddBuiltStructureCount < 5) {
      tips.push('Build palace structures to generate passive bonuses for your dynasty.')
      tips.push('The Cosmic Altar provides the highest bonus per level among all structures.')
    }

    if (state.ddLevel < 10) {
      tips.push('Focus on summoning wyverns and building structures to accelerate your dynasty level.')
    }

    if (state.ddArtifacts.length === 0) {
      tips.push('Seek legendary artifacts to dramatically boost your total dragon power.')
      tips.push('Artifacts provide permanent power bonuses that stack with wyvern power and structure bonuses.')
    }

    if (ddAchievementProgress < 50) {
      tips.push('Work towards achievements to earn bonus dragon power and imperial favor rewards.')
      tips.push('Achievements unlock automatically as you reach milestones across all dynasty activities.')
    }

    if (state.ddTitle === 'celestial_emperor') {
      tips.push('You have achieved the highest title — the Celestial Emperor reigns supreme.')
    }

    if (tips.length === 0) {
      tips.push('Your dynasty thrives — continue expanding your empire and power.')
      tips.push('Seek legendary wyverns and ancient artifacts to further increase your might.')
    }

    return tips
  }, [state, ddClaimedPalaceCount, ddBuiltStructureCount, ddAchievementProgress])

  const ddDynastyScore = useMemo(() => {
    const wyvernScore = (ddOwnedWyvernCount / DD_WYVERNS.length) * 25
    const palaceScore = (ddClaimedPalaceCount / DD_PALACES.length) * 20
    const structureScore = (ddBuiltStructureCount / DD_STRUCTURES.length) * 20
    const achievementScore = ddAchievementProgress / 100 * 15
    const artifactScore = (state.ddArtifacts.length / DD_ARTIFACTS.length) * 20
    const titleScore = (DD_TITLES.findIndex(t => t.id === state.ddTitle) / (DD_TITLES.length - 1)) * 100
    return Math.round(wyvernScore + palaceScore + structureScore + achievementScore + artifactScore + titleScore)
  }, [state, ddOwnedWyvernCount, ddClaimedPalaceCount, ddBuiltStructureCount, ddAchievementProgress])

  const ddDynastyRank = useMemo((): string => {
    const score = ddDynastyScore
    if (score >= 95) return 'Eternal Dragon Dynasty'
    if (score >= 80) return 'Celestial Empire'
    if (score >= 65) return 'Imperial Dominion'
    if (score >= 50) return 'Rising Dynasty'
    if (score >= 35) return 'Established Dynasty'
    if (score >= 20) return 'Minor Dynasty'
    if (score >= 10) return 'Dragon Outpost'
    return 'Newborn Dynasty'
  }, [ddDynastyScore])

  const ddPowerDistribution = useMemo(() => {
    const wyvernPercent = ddEffectivePower > 0 ? Math.round((ddTotalDragonPower / ddEffectivePower) * 100) : 0
    const structurePercent = ddEffectivePower > 0 ? Math.round((ddStructureBonus / ddEffectivePower) * 100) : 0
    return {
      wyvern: wyvernPercent,
      structure: structurePercent,
    }
  }, [ddEffectivePower, ddTotalDragonPower, ddStructureBonus])

  const ddTopWyverns = useMemo(() => {
    return ddOwnedWyvernDefs
      .map(d => ({
        ...d,
        totalPower: ddCalcWyvernPower(d.id, state.ddWyverns[d.id]?.level ?? 0),
      }))
      .sort((a, b) => b.totalPower - a.totalPower)
      .slice(0, 5)
  }, [state, ddOwnedWyvernDefs])

  const ddUnownedWyverns = useMemo(() => {
    return DD_WYVERNS.filter(w => {
      const ws = state.ddWyverns[w.id]
      return !ws || !ws.owned
    })
  }, [state])

  const ddRareWyvernCount = useMemo(() => {
    let count = 0
    for (const key of Object.keys(state.ddWyverns)) {
      const w = state.ddWyverns[key]
      if (w && w.owned) {
        const def = DD_WYVERNS.find(d => d.id === key)
        if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) count++
      }
    }
    return count
  }, [state])

  const ddEpicWyvernCount = useMemo(() => {
    let count = 0
    for (const key of Object.keys(state.ddWyverns)) {
      const w = state.ddWyverns[key]
      if (w && w.owned) {
        const def = DD_WYVERNS.find(d => d.id === key)
        if (def && (def.rarity === 'epic' || def.rarity === 'legendary')) count++
      }
    }
    return count
  }, [state])

  const ddLegendaryWyvernCount = useMemo(() => {
    let count = 0
    for (const key of Object.keys(state.ddWyverns)) {
      const w = state.ddWyverns[key]
      if (w && w.owned) {
        const def = DD_WYVERNS.find(d => d.id === key)
        if (def && def.rarity === 'legendary') count++
      }
    }
    return count
  }, [state])

  const ddSpeciesCoverage = useMemo(() => {
    const ownedSpecies = new Set<string>()
    for (const key of Object.keys(state.ddWyverns)) {
      const w = state.ddWyverns[key]
      if (w && w.owned) {
        const def = DD_WYVERNS.find(d => d.id === key)
        if (def) ownedSpecies.add(def.species)
      }
    }
    return {
      covered: ownedSpecies.size,
      total: DD_SPECIES_COUNT,
      percent: Math.round((ownedSpecies.size / DD_SPECIES_COUNT) * 100),
    }
  }, [state])

  const ddIsMaxLevel = useMemo(() => {
    return state.ddLevel >= 100
  }, [state])

  const ddCanClaimAnyPalace = useMemo(() => {
    return ddAvailablePalaces.some(p => state.ddImperialFavor >= p.favorRequired)
  }, [state, ddAvailablePalaces])

  const ddFavorToNextPalace = useMemo(() => {
    if (ddAvailablePalaces.length === 0) return 0
    const cheapest = Math.min(...ddAvailablePalaces.map(p => p.favorRequired))
    return Math.max(0, cheapest - state.ddImperialFavor)
  }, [state, ddAvailablePalaces])

  const ddFavorToNextTitle = useMemo(() => {
    if (!ddNextTitle) return 0
    return Math.max(0, ddNextTitle.levelRequired - state.ddLevel)
  }, [state, ddNextTitle])

  // ─── Return API Object ──────────────────────────────────────────

  return {
    // Constants
    DD_IMPERIAL_GOLD,
    DD_JADE_GREEN,
    DD_DRAGON_RED,
    DD_COSMIC_INDIGO,
    DD_CLOUD_WHITE,
    DD_DEEP_JADE,
    DD_DARK_RED,
    DD_ROYAL_PURPLE,
    DD_MIDNIGHT,
    DD_LAVA_ORANGE,
    DD_THEME,
    DD_RARITIES,
    DD_SPECIES,
    DD_SPECIES_COUNT,
    DD_RARITY_TIER_COUNT,
    DD_MAX_STRUCTURE_LEVEL,
    DD_WYVERNS,
    DD_PALACES,
    DD_MATERIALS,
    DD_STRUCTURES,
    DD_ABILITIES,
    DD_ACHIEVEMENTS,
    DD_TITLES,
    DD_ARTIFACTS,
    DD_EVENTS,

    // State
    ddLevel: state.ddLevel,
    ddDragonPower: state.ddDragonPower,
    ddImperialFavor: state.ddImperialFavor,
    ddWyverns: state.ddWyverns,
    ddPalaces: state.ddPalaces,
    ddStructures: state.ddStructures,
    ddArtifacts: state.ddArtifacts,
    ddAchievements: state.ddAchievements,
    ddInventory: state.ddInventory,
    ddStats: state.ddStats,
    ddTitle: state.ddTitle,
    ddEvents: state.ddEvents,

    // Computed
    ddOwnedWyvernCount,
    ddTotalDragonPower,
    ddStructureBonus,
    ddEffectivePower,
    ddClaimedPalaceCount,
    ddBuiltStructureCount,
    ddMaxStructureLevel,
    ddInventoryCount,
    ddInventoryValue,
    ddAchievementProgress,
    ddArtifactPower,
    ddCurrentTitleDef,
    ddAvailablePalaces,
    ddWyvernsBySpecies,
    ddWyvernsByRarity,
    ddOwnedWyvernDefs,
    ddHasLegendaryWyvern,
    ddHasEpicWyvern,
    ddEventHistory,
    ddAvailableEvents,
    ddNextTitle,
    ddTitleProgress,
    ddWyvernCollectionRate,
    ddPalaceCompletionRate,
    ddStructureCompletionRate,

    // Actions
    ddSummonWyvern,
    ddPalaceClaim,
    ddBuildStructure,
    ddDragonBreath,
    ddActivateRelic,
    resetDragonDynasty,
  }
}
