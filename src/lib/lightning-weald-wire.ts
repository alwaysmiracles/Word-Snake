/**
 * Lightning Weald Wire — Lightning Weald (闪电荒野) feature module
 *
 * A vast storm-swept grassland where lightning elemental creatures roam
 * beneath thunderclouds. Players summon storm creatures across 7 species and
 * 5 rarity tiers, explore 8 weald locations, collect 30 lightning materials,
 * build 25 structures, master 22 storm abilities, earn 18 achievements,
 * unlock 8 progression titles, activate 15 legendary artifacts, and respond
 * to 12 random weald events — backed by a Zustand store with persist middleware.
 *
 * Storage key: lightning-weald-wire
 * Prefix: LW_
 * Color theme: electric yellow #F1C40F, storm blue #2E86C1,
 *              plasma purple #8E44AD, dark gray #2C3E50
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type LWRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type LWSpecies =
  | 'thunder_wolf'
  | 'storm_eagle'
  | 'lightning_fox'
  | 'plasma_bear'
  | 'static_deer'
  | 'volt_hare'
  | 'arc_mantis'

export interface LWCreatureDef {
  readonly id: string
  readonly name: string
  readonly species: LWSpecies
  readonly rarity: LWRarity
  readonly power: number
  readonly cost: number
  readonly description: string
}

export interface LWWealdDef {
  readonly id: string
  readonly name: string
  readonly level: number
  readonly creatures: string[]
  readonly capacity: number
  readonly description: string
}

export interface LWMaterialDef {
  readonly id: string
  readonly name: string
  readonly rarity: LWRarity
  readonly description: string
  readonly value: number
  readonly category: 'thunder' | 'storm' | 'plasma'
}

export interface LWStructureDef {
  readonly id: string
  readonly name: string
  readonly maxLevel: number
  readonly description: string
  readonly costPerLevel: number
  readonly bonusPerLevel: number
}

export interface LWAbilityDef {
  readonly id: string
  readonly name: string
  readonly type: string
  readonly power: number
  readonly cooldown: number
  readonly description: string
}

export interface LWAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface LWTitleDef {
  readonly id: string
  readonly name: string
  readonly requirement: string
  readonly bonusPercent: number
}

export interface LWArtifactDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly bonus: string
  readonly power: number
  readonly rarity: LWRarity
}

export interface LWEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly effect: string
  readonly severity: number
}

export interface CreatureState {
  summoned: boolean
  level: number
  exp: number
}

export interface WealdState {
  claimed: boolean
  level: number
  energy: number
}

export interface LightningWealdState {
  lwLevel: number
  lwStormPower: number
  lwThunderEnergy: number
  lwStorms: Record<string, CreatureState>
  lwWealds: Record<string, WealdState>
  lwStructures: Record<string, number>
  lwArtifacts: string[]
  lwAchievements: string[]
  lwInventory: Record<string, number>
  lwStats: {
    totalSummoned: number
    totalStrikes: number
    totalBuilt: number
    totalRelicsActivated: number
    totalWealdsClaimed: number
  }
  lwTitle: string
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: THEME & COLOR CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const LW_ELECTRIC_YELLOW: string = '#F1C40F'
export const LW_STORM_BLUE: string = '#2E86C1'
export const LW_PLASMA_PURPLE: string = '#8E44AD'
export const LW_DARK_GRAY: string = '#2C3E50'
export const LW_LIGHTNING_WHITE: string = '#ECF0F1'
export const LW_THUNDER_GOLD: string = '#F39C12'
export const LW_SKY_PALE: string = '#AED6F1'
export const LW_VOID_BLACK: string = '#1A1A2E'
export const LW_SPARK_GREEN: string = '#2ECC71'
export const LW_BOLT_CYAN: string = '#00BCD4'

export const LW_THEME = {
  primary: LW_ELECTRIC_YELLOW,
  secondary: LW_STORM_BLUE,
  neutral: LW_DARK_GRAY,
  accent: LW_PLASMA_PURPLE,
} as const

export const LW_RARITIES: readonly {
  id: LWRarity
  name: string
  nameCn: string
  color: string
  multiplier: number
}[] = [
  { id: 'common', name: 'Common', nameCn: '普通', color: '#95A5A6', multiplier: 1 },
  { id: 'uncommon', name: 'Uncommon', nameCn: '稀有', color: '#27AE60', multiplier: 1.5 },
  { id: 'rare', name: 'Rare', nameCn: '精良', color: LW_STORM_BLUE, multiplier: 2 },
  { id: 'epic', name: 'Epic', nameCn: '史诗', color: LW_PLASMA_PURPLE, multiplier: 3 },
  { id: 'legendary', name: 'Legendary', nameCn: '传说', color: LW_ELECTRIC_YELLOW, multiplier: 5 },
]

export const LW_SPECIES: readonly {
  id: LWSpecies
  name: string
  nameCn: string
  basePower: number
  color: string
}[] = [
  { id: 'thunder_wolf', name: 'Thunder Wolf', nameCn: '雷狼', basePower: 12, color: '#F39C12' },
  { id: 'storm_eagle', name: 'Storm Eagle', nameCn: '暴风鹰', basePower: 14, color: '#3498DB' },
  { id: 'lightning_fox', name: 'Lightning Fox', nameCn: '闪电狐', basePower: 10, color: '#E74C3C' },
  { id: 'plasma_bear', name: 'Plasma Bear', nameCn: '等离子熊', basePower: 16, color: '#9B59B6' },
  { id: 'static_deer', name: 'Static Deer', nameCn: '静电鹿', basePower: 8, color: '#1ABC9C' },
  { id: 'volt_hare', name: 'Volt Hare', nameCn: '伏特兔', basePower: 7, color: '#E67E22' },
  { id: 'arc_mantis', name: 'Arc Mantis', nameCn: '电弧螳螂', basePower: 11, color: '#2ECC71' },
]

export const LW_MAX_STRUCTURE_LEVEL = 10
export const LW_SPECIES_COUNT = 7
export const LW_RARITY_TIER_COUNT = 5

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: LW_STORMS — 35 Storm Creatures (7 species × 5 tiers)
// ═══════════════════════════════════════════════════════════════════

export const LW_STORMS: readonly LWCreatureDef[] = [
  // ── Thunder Wolf (thunder_wolf) — 5 tiers ─────────────────────
  {
    id: 'thunder_wolf_pup',
    name: 'Thunder Wolf Pup',
    species: 'thunder_wolf',
    rarity: 'common',
    power: 12,
    cost: 50,
    description:
      'A young thunder wolf pup whose fur crackles with tiny sparks when it gets excited. It has not yet learned to channel full lightning bolts, but its playful static discharges are enough to make your hair stand on end during every petting session.',
  },
  {
    id: 'thunder_wolf_fang',
    name: 'Thunder Wolf Fang',
    species: 'thunder_wolf',
    rarity: 'uncommon',
    power: 30,
    cost: 200,
    description:
      'An adolescent thunder wolf that has begun to harness static charges in its claws and fangs. When it bites down, a jolt of electricity courses through its jaws powerful enough to stun prey twice its size. It hunts in coordination with its pack during thunderstorms.',
  },
  {
    id: 'thunder_wolf_stormclaw',
    name: 'Stormclaw Thunder Wolf',
    species: 'thunder_wolf',
    rarity: 'rare',
    power: 65,
    cost: 800,
    description:
      'A fearsome alpha-class thunder wolf whose claws leave trails of crackling lightning with every swipe. Its howl can trigger localized thunderstorms, and packs of lesser wolves rally to its call from miles across the weald. The grass around its den is permanently scorched.',
  },
  {
    id: 'thunder_wolf_razorstorm',
    name: 'Razorstorm Thunder Wolf',
    species: 'thunder_wolf',
    rarity: 'epic',
    power: 140,
    cost: 3000,
    description:
      'A legendary predator of the weald whose entire body is wreathed in a corona of electrical fire. Razorstorm wolves can teleport short distances by riding lightning bolts, and their bite carries enough voltage to shatter stone. Only the most powerful storm mages dare approach them.',
  },
  {
    id: 'thunder_wolf_apex',
    name: 'Fenrir Volt — Apex Thunder Wolf',
    species: 'thunder_wolf',
    rarity: 'legendary',
    power: 290,
    cost: 12000,
    description:
      'The primordial wolf of lightning itself, said to have been born from the first thunderclap at the dawn of the world. Fenrir Volt moves like living lightning across the grasslands, leaving glass-scorched earth in its wake. Its presence causes storms to form spontaneously for leagues in every direction.',
  },

  // ── Storm Eagle (storm_eagle) — 5 tiers ──────────────────────
  {
    id: 'storm_eagle_fledgling',
    name: 'Storm Eagle Fledgling',
    species: 'storm_eagle',
    rarity: 'common',
    power: 14,
    cost: 55,
    description:
      'A young eagle with feathers that shimmer with iridescent storm colors. Even as a fledgling, it can sense approaching storms hours before they arrive and rides updrafts with supernatural precision. Its nest is woven from lightning-struck twigs.',
  },
  {
    id: 'storm_eagle_galewing',
    name: 'Galewing Storm Eagle',
    species: 'storm_eagle',
    rarity: 'uncommon',
    power: 35,
    cost: 220,
    description:
      'A full-grown storm eagle whose wingspan creates miniature cyclones as it takes flight. Galewing eagles are the sentinels of the weald, circling high above the thunderheads and diving at impossible speeds to strike prey with wind-force talon strikes.',
  },
  {
    id: 'storm_eagle_thunderlord',
    name: 'Thunderlord Storm Eagle',
    species: 'storm_eagle',
    rarity: 'rare',
    power: 72,
    cost: 900,
    description:
      'A dominant eagle that commands entire storm systems with its wings. When a Thunderlord screeches, every cloud within earshot answers with thunder. They nest at the very tops of the tallest weald peaks, where lightning strikes their nests to incubate their eggs.',
  },
  {
    id: 'storm_eagle_tempestking',
    name: 'Tempest King Storm Eagle',
    species: 'storm_eagle',
    rarity: 'epic',
    power: 155,
    cost: 3500,
    description:
      'An eagle so powerful it rides inside tornadoes without effort. The Tempest King sees through clouds and darkness with electric-field vision, and its talons can rip through steel. Flocks of lesser birds follow it in reverent formations that mirror hurricane spiral patterns.',
  },
  {
    id: 'storm_eagle_zenith',
    name: 'Zeus Talon — Zenith Storm Eagle',
    species: 'storm_eagle',
    rarity: 'legendary',
    power: 310,
    cost: 14000,
    description:
      'The king of all sky predators, a bird so enormous its shadow covers entire valleys. When the Zenith Storm Eagle spreads its wings, the air pressure change generates instant thunderstorms. Its feathers are made of condensed atmospheric electricity, each one containing enough power to light a city for a month.',
  },

  // ── Lightning Fox (lightning_fox) — 5 tiers ──────────────────
  {
    id: 'lightning_fox_kit',
    name: 'Lightning Fox Kit',
    species: 'lightning_fox',
    rarity: 'common',
    power: 10,
    cost: 45,
    description:
      'A small, quick fox with a tail that trails sparks like a living sparkler. Lightning fox kits are notorious tricksters of the weald, using their speed and electrical bursts to confuse predators and steal food from much larger creatures with daring hit-and-run tactics.',
  },
  {
    id: 'lightning_fox_flashpaw',
    name: 'Flashpaw Lightning Fox',
    species: 'lightning_fox',
    rarity: 'uncommon',
    power: 26,
    cost: 180,
    description:
      'An agile fox that can literally outrun lightning bolts for short distances. The Flashpaw leaves afterimages of static charge in its path, creating electrified decoys that confuse pursuers. It communicates with other foxes using rapid-fire pulses of bioluminescent electricity.',
  },
  {
    id: 'lightning_fox_arctail',
    name: 'Arctail Lightning Fox',
    species: 'lightning_fox',
    rarity: 'rare',
    power: 58,
    cost: 750,
    description:
      'A brilliant fox whose nine tails form a living electrical circuit, each tail capable of discharging independently. The Arctail creates elaborate trap networks of invisible static threads across the weald grasslands, ensnaring prey in webs of crackling energy.',
  },
  {
    id: 'lightning_fox_voidstreak',
    name: 'Voidstreak Lightning Fox',
    species: 'lightning_fox',
    rarity: 'epic',
    power: 125,
    cost: 2800,
    description:
      'A fox that has transcended physical speed entirely, existing in a state of perpetual quantum flickering. The Voidstreak can be in multiple locations simultaneously and channels its excess electrical energy into devastating arc-waves that scorch the earth in perfect geometric patterns.',
  },
  {
    id: 'lightning_fox_infinity',
    name: 'Kirin Spark — Infinity Lightning Fox',
    species: 'lightning_fox',
    rarity: 'legendary',
    power: 270,
    cost: 11000,
    description:
      'A mythical fox of infinite tails, each one a different color of the electromagnetic spectrum. The Kirin Spark exists between lightning strikes, visible only in the instant a bolt hits the ground. Its speed is not measured in distance but in probability — it arrives before it leaves.',
  },

  // ── Plasma Bear (plasma_bear) — 5 tiers ─────────────────────
  {
    id: 'plasma_bear_cub',
    name: 'Plasma Bear Cub',
    species: 'plasma_bear',
    rarity: 'common',
    power: 16,
    cost: 60,
    description:
      'A roly-poly bear cub with a warm, glowing plasma core visible through its semi-translucent fur. Despite its cuddly appearance, touching a plasma bear cub without protection results in a nasty burn. It hibernates inside thunderclouds during winter, wrapped in ball lightning.',
  },
  {
    id: 'plasma_bear_furnace',
    name: 'Furnace Plasma Bear',
    species: 'plasma_bear',
    rarity: 'uncommon',
    power: 38,
    cost: 250,
    description:
      'A massive bear whose body temperature exceeds a thousand degrees at the core. The Furnace Bear melts the ground beneath its feet and leaves trails of superheated glass wherever it walks. Its roar superheats the air, creating localized plasma explosions in humid weather.',
  },
  {
    id: 'plasma_bear_thunderhide',
    name: 'Thunderhide Plasma Bear',
    species: 'plasma_bear',
    rarity: 'rare',
    power: 80,
    cost: 1000,
    description:
      'A bear whose hide has been transformed into living plasma by centuries of lightning strikes. The Thunderhide is virtually immune to electrical damage and reflects incoming lightning bolts with amplified force. It fishes in rivers by discharging plasma into the water.',
  },
  {
    id: 'plasma_bear_suncore',
    name: 'Suncore Plasma Bear',
    species: 'plasma_bear',
    rarity: 'epic',
    power: 170,
    cost: 3800,
    description:
      'A colossal bear whose internal plasma core burns with the intensity of a small star. The Suncore Plasma Bear can project concentrated beams of plasma from its mouth and paws, and its mere presence ionizes the atmosphere for hundreds of meters, creating permanent aurora effects above it.',
  },
  {
    id: 'plasma_bear_cosmos',
    name: 'Supernovahide — Cosmos Plasma Bear',
    species: 'plasma_bear',
    rarity: 'legendary',
    power: 330,
    cost: 15000,
    description:
      'A bear that embodies the death and birth of stars within its massive frame. Supernovahide walks through the weald trailing nebulae of ionized gas, and when it roars, solar flares erupt from its jaws. Scientists theorize it may be the living battery that powers all storms on the weald.',
  },

  // ── Static Deer (static_deer) — 5 tiers ──────────────────────
  {
    id: 'static_deer_fawn',
    name: 'Static Deer Fawn',
    species: 'static_deer',
    rarity: 'common',
    power: 8,
    cost: 40,
    description:
      'A delicate fawn whose spotted coat generates gentle static charges as it grazes through the electric grass of the weald. The static keeps predators at bay and causes the weald flowers to bloom in its footprints. Its antlers, when they grow, will be conductive copper-like crystal.',
  },
  {
    id: 'static_deer_voltantler',
    name: 'Voltantler Static Deer',
    species: 'static_deer',
    rarity: 'uncommon',
    power: 22,
    cost: 170,
    description:
      'A graceful deer with branching antlers that act as natural lightning rods, attracting and safely storing electrical energy. The Voltantler can discharge stored lightning through its hooves, creating electric fences of sorts around its grazing territory to protect its herd.',
  },
  {
    id: 'static_deer_thunderhorn',
    name: 'Thunderhorn Static Deer',
    species: 'static_deer',
    rarity: 'rare',
    power: 50,
    cost: 700,
    description:
      'A magnificent stag whose antlers have fused into a single spiraling horn of pure crystalized electricity. The Thunderhorn can channel the entire energy of a thunderstorm through its horn, creating devastating focused beams that carve molten trenches across the weald floor.',
  },
  {
    id: 'static_deer_ioncrown',
    name: 'Ioncrown Static Deer',
    species: 'static_deer',
    rarity: 'epic',
    power: 110,
    cost: 2600,
    description:
      'A deer whose antlers form a living crown of orbiting plasma rings, each ring spinning at a different speed and generating a powerful electromagnetic field. The Ioncrown can manipulate the Earth magnetic field in its vicinity, causing compasses to spin wildly and iron objects to levitate.',
  },
  {
    id: 'static_deer_celestial',
    name: 'Aurora Sovereign — Celestial Static Deer',
    species: 'static_deer',
    rarity: 'legendary',
    power: 250,
    cost: 10000,
    description:
      'The guardian spirit of the northern weald, a deer of breathtaking beauty whose antlers extend into the sky like a tree made of aurora borealis. Where the Celestial Deer walks, the Northern Lights descend to earth, and all electrical energy in the weald flows toward it in reverent rivers of light.',
  },

  // ── Volt Hare (volt_hare) — 5 tiers ──────────────────────────
  {
    id: 'volt_hare_leveret',
    name: 'Volt Hare Leveret',
    species: 'volt_hare',
    rarity: 'common',
    power: 7,
    cost: 35,
    description:
      'A tiny, hyperactive hare that generates static electricity by thumping its powerful hind legs. Each thump creates a small electric pulse that scares off predators and gives the leveret a surprising burst of acceleration. It builds its burrows under lightning-struck trees for protection.',
  },
  {
    id: 'volt_hare_zapfoot',
    name: 'Zapfoot Volt Hare',
    species: 'volt_hare',
    rarity: 'uncommon',
    power: 18,
    cost: 150,
    description:
      'An incredibly fast hare whose feet discharge bolts of electricity with every bounding leap. The Zapfoot can clear the width of a small river in a single jump, trailing a chain of arcing electricity behind it. It processes information so fast it appears to see the world in slow motion.',
  },
  {
    id: 'volt_hare_chargebound',
    name: 'Chargebound Volt Hare',
    species: 'volt_hare',
    rarity: 'rare',
    power: 42,
    cost: 650,
    description:
      'A hare that has learned to accumulate and store enormous electrical charges over time. When fully charged, the Chargebound Volt Hare releases everything in a single explosive burst, accelerating to near-lightning speeds and leaving a crater of fused glass at the starting point.',
  },
  {
    id: 'volt_hare_supercircuit',
    name: 'Supercircuit Volt Hare',
    species: 'volt_hare',
    rarity: 'epic',
    power: 95,
    cost: 2400,
    description:
      'A hare whose nervous system has evolved into a biological superconductor, processing electrical signals millions of times faster than normal creatures. The Supercircuit perceives the electromagnetic spectrum in full, communicates with electrical infrastructure, and can short-circuit entire weald defense systems with a thought.',
  },
  {
    id: 'volt_hare_quantum',
    name: 'Tachyon Pulse — Quantum Volt Hare',
    species: 'volt_hare',
    rarity: 'legendary',
    power: 230,
    cost: 9000,
    description:
      'A hare that exists partially outside normal spacetime, its body flickering between quantum states. The Tachyon Pulse can tunnel through solid matter and moves so fast it creates temporal echoes — afterimages that persist for seconds, each one capable of discharging stored electrical energy independently.',
  },

  // ── Arc Mantis (arc_mantis) — 5 tiers ────────────────────────
  {
    id: 'arc_mantis_nymph',
    name: 'Arc Mantis Nymph',
    species: 'arc_mantis',
    rarity: 'common',
    power: 11,
    cost: 48,
    description:
      'A small praying mantis with forelimbs that conduct electricity between its scythe-like claws. The Arc Mantis Nymph attracts lightning bugs to illuminate its hunting grounds and uses weak electrical arcs to stun small insects before capturing them with lightning-fast strikes.',
  },
  {
    id: 'arc_mantis_sparkblade',
    name: 'Sparkblade Arc Mantis',
    species: 'arc_mantis',
    rarity: 'uncommon',
    power: 28,
    cost: 190,
    description:
      'A lethal predator whose scythe-like forelimbs are natural electrodes, creating sustained electric arcs between them when brought together. The Sparkblade uses these arcs as extendable weapons, sweeping them through tall grass to electrify hiding prey. Its exoskeleton glows with trapped charge.',
  },
  {
    id: 'arc_mantis_voltsiege',
    name: 'Voltsiege Arc Mantis',
    species: 'arc_mantis',
    rarity: 'rare',
    power: 62,
    cost: 850,
    description:
      'A large mantis that generates electric arcs from every joint in its body, becoming a walking cage of lightning. The Voltsiege builds elaborate electric trap webs in the weald canopy, each strand a barely visible arc that stuns and captures anything that touches it. Its strikes can cut through metal.',
  },
  {
    id: 'arc_mantis_stormreaver',
    name: 'Stormreaver Arc Mantis',
    species: 'arc_mantis',
    rarity: 'epic',
    power: 135,
    cost: 3200,
    description:
      'A terrifying mantis the size of a horse whose scythe-blades generate plasma arcs hot enough to vaporize steel. The Stormreaver can project these arcs as ranged weapons, striking targets up to fifty meters away. It builds its nests inside active thunderclouds, held aloft by electromagnetic levitation.',
  },
  {
    id: 'arc_mantis_omega',
    name: 'Tesla Emperor — Omega Arc Mantis',
    species: 'arc_mantis',
    rarity: 'legendary',
    power: 280,
    cost: 13000,
    description:
      'The ultimate insect predator of the lightning weald, a mantis so evolved it generates wireless energy fields capable of powering entire ecosystems. The Tesla Emperor perceives the world as an electrical circuit diagram and manipulates energy flow at will. Its scythe-blades can slice lightning bolts in half.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: LW_WEALDS — 8 Weald Locations
// ═══════════════════════════════════════════════════════════════════

export const LW_WEALDS: readonly LWWealdDef[] = [
  {
    id: 'storm_peaks',
    name: 'Storm Peaks',
    level: 3,
    creatures: [
      'thunder_wolf_pup', 'thunder_wolf_fang', 'storm_eagle_fledgling',
      'lightning_fox_kit', 'volt_hare_leveret', 'arc_mantis_nymph',
    ],
    capacity: 50,
    description:
      'Jagged mountain peaks where thunderclouds permanently cling to the summits. Lightning strikes the exposed rock faces hundreds of times per hour, creating a constant symphony of electrical discharge. The air here tastes of ozone and possibility.',
  },
  {
    id: 'thunder_plains',
    name: 'Thunder Plains',
    level: 4,
    creatures: [
      'thunder_wolf_pup', 'thunder_wolf_fang', 'storm_eagle_fledgling',
      'storm_eagle_galewing', 'lightning_fox_kit', 'static_deer_fawn',
      'volt_hare_leveret',
    ],
    capacity: 60,
    description:
      'Endless flat grasslands swept by constant thunderstorms. The plains are the heart of the weald where most lightning elemental creatures make their homes. Giant fulgurites — glass tubes formed by lightning striking sand — dot the landscape like crystal monuments.',
  },
  {
    id: 'lightning_gorge',
    name: 'Lightning Gorge',
    level: 5,
    creatures: [
      'thunder_wolf_fang', 'thunder_wolf_stormclaw', 'storm_eagle_galewing',
      'lightning_fox_flashpaw', 'plasma_bear_cub', 'volt_hare_zapfoot',
      'arc_mantis_sparkblade',
    ],
    capacity: 45,
    description:
      'A deep canyon carved by millennia of sustained lightning strikes. The gorge walls are lined with veins of thunder crystal that amplify electrical energy. During storms, the entire gorge becomes a massive natural capacitor, storing enough charge to power a civilization.',
  },
  {
    id: 'plasma_meadows',
    name: 'Plasma Meadows',
    level: 6,
    creatures: [
      'plasma_bear_cub', 'plasma_bear_furnace', 'static_deer_fawn',
      'static_deer_voltantler', 'lightning_fox_flashpaw', 'volt_hare_zapfoot',
    ],
    capacity: 55,
    description:
      'Rolling meadows where ball lightning floats gently between wildflowers, illuminating the landscape with soft plasma glow. The grass here has evolved to conduct electricity, forming natural circuit networks that pulse with visible energy. It is the most beautiful and dangerous place in the weald.',
  },
  {
    id: 'static_wetlands',
    name: 'Static Wetlands',
    level: 5,
    creatures: [
      'static_deer_fawn', 'static_deer_voltantler', 'static_deer_thunderhorn',
      'thunder_wolf_stormclaw', 'arc_mantis_sparkblade', 'volt_hare_chargebound',
    ],
    capacity: 40,
    description:
      'Marshy wetlands where the water itself carries an electric charge. St. Elmo fire dances on every reed and cattail, and the swamp gas ignites into shimmering plasma displays. Creatures here have evolved waterproof electrical insulation as a survival adaptation.',
  },
  {
    id: 'arc_canyon',
    name: 'Arc Canyon',
    level: 7,
    creatures: [
      'thunder_wolf_stormclaw', 'thunder_wolf_razorstorm', 'storm_eagle_thunderlord',
      'lightning_fox_arctail', 'arc_mantis_voltsiege', 'volt_hare_chargebound',
    ],
    capacity: 35,
    description:
      'A narrow canyon where the walls are so charged with static electricity that visible arcs leap between them like electric bridges. The canyon floor is a maze of conductive mineral deposits that redirect lightning in unpredictable patterns. Only the most electrically adapted creatures survive here.',
  },
  {
    id: 'thunder_ridge',
    name: 'Thunder Ridge',
    level: 8,
    creatures: [
      'storm_eagle_thunderlord', 'storm_eagle_tempestking', 'plasma_bear_thunderhide',
      'lightning_fox_arctail', 'static_deer_thunderhorn', 'arc_mantis_stormreaver',
    ],
    capacity: 30,
    description:
      'A towering ridge line that acts as the primary lightning rod for the entire weald. Thunder never stops echoing across the ridge, and the accumulated electromagnetic energy makes compasses and electronics useless. Epic-tier creatures patrol the ridge boundaries aggressively.',
  },
  {
    id: 'tempest_heart',
    name: 'Tempest Heart',
    level: 10,
    creatures: [
      'thunder_wolf_razorstorm', 'thunder_wolf_apex', 'storm_eagle_tempestking',
      'storm_eagle_zenith', 'plasma_bear_suncore', 'plasma_bear_cosmos',
      'lightning_fox_voidstreak', 'lightning_fox_infinity', 'static_deer_ioncrown',
      'static_deer_celestial', 'volt_hare_supercircuit', 'volt_hare_quantum',
      'arc_mantis_stormreaver', 'arc_mantis_omega',
    ],
    capacity: 100,
    description:
      'The mythical center of the weald where all storms converge into a single eternal tempest of unmatched fury. The air is so ionized it glows purple, and lightning strikes in continuous sheets rather than individual bolts. Only legendary creatures can survive here, and they guard it fiercely.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: LW_MATERIALS — 30 Lightning/Storm Materials
// ═══════════════════════════════════════════════════════════════════

export const LW_MATERIALS: readonly LWMaterialDef[] = [
  // Thunder Materials (10)
  {
    id: 'thunder_shard',
    name: 'Thunder Shard',
    rarity: 'common',
    description:
      'A jagged fragment of condensed thunder energy found at lightning strike sites. It hums faintly with residual electrical charge and tingles when held.',
    value: 5,
    category: 'thunder',
  },
  {
    id: 'storm_crystal',
    name: 'Storm Crystal',
    rarity: 'uncommon',
    description:
      'A naturally occurring crystal that forms inside thunderclouds under extreme electromagnetic conditions. Its facets refract light into electric blue patterns.',
    value: 25,
    category: 'thunder',
  },
  {
    id: 'bolt_fragment',
    name: 'Bolt Fragment',
    rarity: 'common',
    description:
      'A small piece of solidified lightning bolt, temporarily frozen in its electrical state. It crackles with energy and dissolves back into pure electricity after a few days unless properly stored.',
    value: 8,
    category: 'thunder',
  },
  {
    id: 'thunderheart_gem',
    name: 'Thunderheart Gem',
    rarity: 'rare',
    description:
      'A gemstone formed at the exact center of a thunderstorm, where all electrical forces converge. It pulses rhythmically like a heartbeat and generates a faint static field around it.',
    value: 120,
    category: 'thunder',
  },
  {
    id: 'static_residue',
    name: 'Static Residue',
    rarity: 'common',
    description:
      'A powdery substance left behind when static electricity dissipates. While seemingly inert, it can be recharged and used as a base material for electrical insulation.',
    value: 3,
    category: 'thunder',
  },
  {
    id: 'fulgurite_glass',
    name: 'Fulgurite Glass',
    rarity: 'uncommon',
    description:
      'A tube of naturally formed glass created when lightning strikes sand. Each fulgurite is unique in shape and contains traces of ionized minerals that glow under ultraviolet light.',
    value: 30,
    category: 'thunder',
  },
  {
    id: 'thunder_pelt',
    name: 'Thunder Pelt',
    rarity: 'uncommon',
    description:
      'Fur shed by a thunder wolf during molting season. The fur retains static charge indefinitely and can be woven into electrically conductive fabric for protective gear.',
    value: 22,
    category: 'thunder',
  },
  {
    id: 'electric marrow',
    name: 'Electric Marrow',
    rarity: 'rare',
    description:
      'The conductive core of a thunder-charged bone, harvested from deep within lightning-struck geological formations. It serves as a natural battery that slowly recharges from ambient static.',
    value: 95,
    category: 'thunder',
  },
  {
    id: 'storm_core_essence',
    name: 'Storm Core Essence',
    rarity: 'epic',
    description:
      'Concentrated essence extracted from the eye of a raging storm. It is contained within a special electromagnetic bottle and radiates power so intense it interferes with nearby electronics.',
    value: 400,
    category: 'thunder',
  },
  {
    id: 'primordial_thunder_seed',
    name: 'Primordial Thunder Seed',
    rarity: 'legendary',
    description:
      'A seed-like object containing the compressed energy of the first thunderclap in the weald history. When planted in charged soil, it grows into a thunder tree whose roots conduct lightning deep into the earth.',
    value: 1500,
    category: 'thunder',
  },

  // Storm Materials (10)
  {
    id: 'wind_charged_feather',
    name: 'Wind-Charged Feather',
    rarity: 'common',
    description:
      'A feather from a storm eagle that retains atmospheric charge. It generates a gentle updraft when held and is used in arrow fletching for storm archers.',
    value: 6,
    category: 'storm',
  },
  {
    id: 'cyclone_essence',
    name: 'Cyclone Essence',
    rarity: 'uncommon',
    description:
      'A swirling vial of captured cyclone energy that spins perpetually. The essence inside forms tiny tornado patterns and can be used to power wind-based mechanisms.',
    value: 28,
    category: 'storm',
  },
  {
    id: 'rain_gem',
    name: 'Rain Gem',
    rarity: 'uncommon',
    description:
      'A gemstone formed from raindrops that were struck by lightning in mid-fall, instantly crystalizing them. It is always cool to the touch and releases refreshing mist when warmed.',
    value: 20,
    category: 'storm',
  },
  {
    id: 'tempest_fang',
    name: 'Tempest Fang',
    rarity: 'rare',
    description:
      'A fang from a powerful storm creature, permanently infused with atmospheric pressure energy. When struck, it releases a concussive shockwave equivalent to a thunderclap.',
    value: 110,
    category: 'storm',
  },
  {
    id: 'cloud_compound',
    name: 'Cloud Compound',
    rarity: 'common',
    description:
      'A condensed ball of thundercloud material, dense enough to hold in your hand. It continually generates small static discharges and smells of petrichor and ozone.',
    value: 4,
    category: 'storm',
  },
  {
    id: 'gale_crystal',
    name: 'Gale Crystal',
    rarity: 'rare',
    description:
      'A crystal that grows in the eye of hurricane-force winds, shaped by extreme aerodynamic forces into perfect aerodynamic forms. It generates powerful wind currents when exposed to electrical charge.',
    value: 85,
    category: 'storm',
  },
  {
    id: 'thunderstorm_resin',
    name: 'Thunderstorm Resin',
    rarity: 'common',
    description:
      'Sticky resin secreted by weald trees during electrical storms. It is an excellent natural insulator and is used to coat weald structures to protect them from lightning damage.',
    value: 5,
    category: 'storm',
  },
  {
    id: 'storm_scales',
    name: 'Storm Scales',
    rarity: 'uncommon',
    description:
      'Overlapping scales harvested from the hide of a plasma bear. Each scale is a perfect electrical insulator on the outside and a conductor on the inside, making them ideal for layered armor construction.',
    value: 35,
    category: 'storm',
  },
  {
    id: 'cyclotron_shard',
    name: 'Cyclotron Shard',
    rarity: 'epic',
    description:
      'A fragment of a naturally occurring cyclotron — a geological formation that accelerates charged particles to enormous speeds. The shard generates a constant stream of high-energy particles.',
    value: 450,
    category: 'storm',
  },
  {
    id: 'worldstorm_heart',
    name: 'Worldstorm Heart',
    rarity: 'legendary',
    description:
      'The crystallized core of a storm so massive it once covered the entire weald. The Worldstorm Heart beats with atmospheric rhythm, and holding it causes the sky to darken and thunder to rumble regardless of weather conditions.',
    value: 1800,
    category: 'storm',
  },

  // Plasma Materials (10)
  {
    id: 'plasma_essence',
    name: 'Plasma Essence',
    rarity: 'common',
    description:
      'A small quantity of captured plasma contained in a magnetic field bottle. It glows with an inner light and is warm to the touch, making it useful for heating and illumination.',
    value: 7,
    category: 'plasma',
  },
  {
    id: 'ion_cluster',
    name: 'Ion Cluster',
    rarity: 'uncommon',
    description:
      'A cluster of ionized particles held together by electromagnetic attraction. The cluster hums at a frequency that can be heard but not felt, and it reacts to nearby magnetic fields by changing shape.',
    value: 24,
    category: 'plasma',
  },
  {
    id: 'arc_weave',
    name: 'Arc Weave',
    rarity: 'uncommon',
    description:
      'Silk-like threads produced by arc mantises that are naturally conductive. Woven together, arc weave creates a fabric that can channel electrical energy across its surface without damaging the wearer.',
    value: 32,
    category: 'plasma',
  },
  {
    id: 'plasma_crystal_shard',
    name: 'Plasma Crystal Shard',
    rarity: 'rare',
    description:
      'A shard of crystal that contains trapped plasma in its internal lattice structure. The plasma inside shifts and flows like living fire, and the shard generates a steady electrical current.',
    value: 100,
    category: 'plasma',
  },
  {
    id: 'charge_dust',
    name: 'Charge Dust',
    rarity: 'common',
    description:
      'Fine powder created by the electrical erosion of weald rock. Each grain carries a microscopic electrical charge, and when scattered in large quantities, it creates spectacular static discharge patterns.',
    value: 3,
    category: 'plasma',
  },
  {
    id: 'electromagnetic_ore',
    name: 'Electromagnetic Ore',
    rarity: 'rare',
    description:
      'A dense ore vein that has been permanently magnetized by centuries of lightning strikes. It can be shaped into powerful electromagnets and is the primary material used in weald structure foundations.',
    value: 90,
    category: 'plasma',
  },
  {
    id: 'spark_nectar',
    name: 'Spark Nectar',
    rarity: 'common',
    description:
      'A sweet, electrically charged nectar produced by weald flowers that bloom only during thunderstorms. Volt hares are addicted to it, and it can be refined into a potent energy elixir.',
    value: 4,
    category: 'plasma',
  },
  {
    id: 'fusion_dewdrop',
    name: 'Fusion Dewdrop',
    rarity: 'epic',
    description:
      'A dewdrop that formed at the exact moment two lightning bolts crossed paths, momentarily achieving fusion-level temperatures. The dewdrop contains the compressed energy of that instant and glows with white-hot intensity.',
    value: 380,
    category: 'plasma',
  },
  {
    id: 'aurora_thread',
    name: 'Aurora Thread',
    rarity: 'epic',
    description:
      'A thread of solidified aurora borealis, captured during a rare atmospheric event when northern lights descend to ground level. It shimmers with shifting colors and can be woven into fabric that generates protective energy fields.',
    value: 420,
    category: 'plasma',
  },
  {
    id: 'plasma_dragon_scale',
    name: 'Plasma Dragon Scale',
    rarity: 'legendary',
    description:
      'A scale from the mythical plasma dragon that is said to sleep at the center of the Tempest Heart. It is warm, indestructible, and generates enough energy to power a small city. The scale remembers every lightning strike it has absorbed.',
    value: 2000,
    category: 'plasma',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: LW_STRUCTURES — 25 Weald Structures
// ═══════════════════════════════════════════════════════════════════

export const LW_STRUCTURES: readonly LWStructureDef[] = [
  {
    id: 'lightning_rod',
    name: 'Lightning Rod Tower',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'A tall conductor that attracts and safely grounds lightning strikes, generating usable electrical energy for the weald settlement.',
    costPerLevel: 100,
    bonusPerLevel: 5,
  },
  {
    id: 'storm_tower',
    name: 'Storm Tower',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'An observation tower built to withstand hurricane-force winds, providing advance warning of incoming electrical storms.',
    costPerLevel: 120,
    bonusPerLevel: 6,
  },
  {
    id: 'thunder_shrine',
    name: 'Thunder Shrine',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'A sacred shrine where storm power is amplified through ritualistic lightning channeling, boosting all creatures in range.',
    costPerLevel: 150,
    bonusPerLevel: 8,
  },
  {
    id: 'plasma_forge',
    name: 'Plasma Forge',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'A forge that uses captured plasma energy to smelt and shape conductive materials into powerful equipment and weapons.',
    costPerLevel: 130,
    bonusPerLevel: 7,
  },
  {
    id: 'charge_barn',
    name: 'Charge Barn',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'A reinforced structure where electrical creatures can rest and recharge, recovering their energy reserves faster than in the wild.',
    costPerLevel: 90,
    bonusPerLevel: 4,
  },
  {
    id: 'volt_stable',
    name: 'Volt Stable',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'A stable designed specifically for housing lightning steeds and other ridable storm creatures, with electromagnetic feeding troughs.',
    costPerLevel: 110,
    bonusPerLevel: 5,
  },
  {
    id: 'lightning_farm',
    name: 'Lightning Farm',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'A network of conductive posts across a field that captures and stores electrical energy from passing storms.',
    costPerLevel: 140,
    bonusPerLevel: 7,
  },
  {
    id: 'storm_shelter',
    name: 'Storm Shelter',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'A Faraday-cage reinforced underground bunker that provides complete protection from even the most powerful electrical storms.',
    costPerLevel: 160,
    bonusPerLevel: 8,
  },
  {
    id: 'thunder_anvil',
    name: 'Thunder Anvil',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'An enormous anvil made from a single lightning-struck meteorite, used for forging legendary-quality thunder equipment.',
    costPerLevel: 200,
    bonusPerLevel: 10,
  },
  {
    id: 'arc_gateway',
    name: 'Arc Gateway',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'A massive archway that generates an electric portal, allowing instant travel between weald locations during active storms.',
    costPerLevel: 180,
    bonusPerLevel: 9,
  },
  {
    id: 'plasma_greenhouse',
    name: 'Plasma Greenhouse',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'A greenhouse where electric flowers and spark-producing plants are cultivated for material harvesting and creature feeding.',
    costPerLevel: 100,
    bonusPerLevel: 5,
  },
  {
    id: 'static_silo',
    name: 'Static Silo',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'A tall storage silo that accumulates and stores static electricity in massive capacitor banks for later use.',
    costPerLevel: 170,
    bonusPerLevel: 8,
  },
  {
    id: 'thunder_library',
    name: 'Thunder Library',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'A library of storm knowledge and creature research, providing bonuses to creature training and ability mastery.',
    costPerLevel: 150,
    bonusPerLevel: 7,
  },
  {
    id: 'lightning_lab',
    name: 'Lightning Research Lab',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'A laboratory for studying electrical phenomena and developing new applications for captured storm energy.',
    costPerLevel: 190,
    bonusPerLevel: 9,
  },
  {
    id: 'storm_barracks',
    name: 'Storm Barracks',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'Military-style housing for trained storm creatures that increases the maximum number of creatures that can be deployed simultaneously.',
    costPerLevel: 120,
    bonusPerLevel: 6,
  },
  {
    id: 'charge_quarry',
    name: 'Charge Quarry',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'A mining operation that extracts electromagnetic ore and fulgurite glass from lightning-struck geological formations.',
    costPerLevel: 110,
    bonusPerLevel: 5,
  },
  {
    id: 'volt_workshop',
    name: 'Volt Workshop',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'A workshop for crafting electrical devices, traps, and tools using weald materials and captured storm energy.',
    costPerLevel: 130,
    bonusPerLevel: 6,
  },
  {
    id: 'thunder_market',
    name: 'Thunder Market',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'A bustling marketplace where weald materials, creature eggs, and storm equipment are traded. Higher levels attract rarer merchants.',
    costPerLevel: 140,
    bonusPerLevel: 7,
  },
  {
    id: 'lightning_beacon',
    name: 'Lightning Beacon',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'A towering beacon that projects an electrical signal across the weald, attracting wild storm creatures and guiding them to the settlement.',
    costPerLevel: 160,
    bonusPerLevel: 8,
  },
  {
    id: 'storm_sanctum',
    name: 'Storm Sanctum',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'A sacred chamber where the most powerful storm rituals are performed, granting significant bonuses to thunder energy generation.',
    costPerLevel: 220,
    bonusPerLevel: 11,
  },
  {
    id: 'plasma_condenser',
    name: 'Plasma Condenser',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'A device that condenses diffuse atmospheric electricity into concentrated plasma, dramatically increasing material yield.',
    costPerLevel: 200,
    bonusPerLevel: 10,
  },
  {
    id: 'charge_sanctuary',
    name: 'Charge Sanctuary',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'A peaceful garden charged with gentle static energy where creatures recover faster and bond more strongly with their handlers.',
    costPerLevel: 170,
    bonusPerLevel: 8,
  },
  {
    id: 'thunder_colosseum',
    name: 'Thunder Colosseum',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'An arena where storm creatures compete in electrifying battles. Victory earns rare materials and creature experience at higher rates.',
    costPerLevel: 250,
    bonusPerLevel: 12,
  },
  {
    id: 'tempest_nexus',
    name: 'Tempest Nexus',
    maxLevel: LW_MAX_STRUCTURE_LEVEL,
    description:
      'The ultimate weald structure that channels the combined energy of all other structures into a single focused beam of raw atmospheric power.',
    costPerLevel: 300,
    bonusPerLevel: 15,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: LW_ABILITIES — 22 Storm Abilities
// ═══════════════════════════════════════════════════════════════════

export const LW_ABILITIES: readonly LWAbilityDef[] = [
  {
    id: 'thunder_strike',
    name: 'Thunder Strike',
    type: 'offense',
    power: 25,
    cooldown: 3,
    description:
      'Call down a focused lightning bolt on a single target, dealing moderate electrical damage and stunning briefly.',
  },
  {
    id: 'chain_lightning',
    name: 'Chain Lightning',
    type: 'offense',
    power: 35,
    cooldown: 5,
    description:
      'Launch a bolt that arcs between multiple enemies, dealing decreasing damage to each subsequent target.',
  },
  {
    id: 'storm_surge',
    name: 'Storm Surge',
    type: 'offense',
    power: 50,
    cooldown: 8,
    description:
      'Unleash a wave of storm energy in a wide cone, knocking back enemies and leaving electric residue on the ground.',
  },
  {
    id: 'plasma_bolt',
    name: 'Plasma Bolt',
    type: 'offense',
    power: 40,
    cooldown: 4,
    description:
      'Fire a concentrated sphere of superheated plasma that explodes on impact, dealing area damage and igniting flammable targets.',
  },
  {
    id: 'static_field',
    name: 'Static Field',
    type: 'control',
    power: 15,
    cooldown: 6,
    description:
      'Generate an area of intense static electricity that slows all enemies within and disrupts their electrical abilities.',
  },
  {
    id: 'thunder_clap',
    name: 'Thunder Clap',
    type: 'control',
    power: 20,
    cooldown: 5,
    description:
      'Create a deafening shockwave of compressed thunder that stuns all nearby enemies and shatters fragile structures.',
  },
  {
    id: 'lightning_shield',
    name: 'Lightning Shield',
    type: 'defense',
    power: 30,
    cooldown: 10,
    description:
      'Surround yourself with a crackling shield of electrical energy that absorbs incoming damage and reflects a portion back.',
  },
  {
    id: 'grounding_ward',
    name: 'Grounding Ward',
    type: 'defense',
    power: 25,
    cooldown: 8,
    description:
      'Place a grounding ward that absorbs all electrical attacks in an area, protecting allies and converting damage into energy.',
  },
  {
    id: 'storm_call',
    name: 'Storm Call',
    type: 'summon',
    power: 45,
    cooldown: 12,
    description:
      'Summon a localized thunderstorm centered on a target area, generating persistent lightning strikes for a duration.',
  },
  {
    id: 'arc_weave',
    name: 'Arc Weave',
    type: 'utility',
    power: 10,
    cooldown: 4,
    description:
      'Create a web of electrical arcs between multiple points, forming barriers that damage anything passing through them.',
  },
  {
    id: 'volt_sprint',
    name: 'Volt Sprint',
    type: 'utility',
    power: 8,
    cooldown: 3,
    description:
      'Channel electricity through your legs for a burst of supernatural speed, leaving a trail of sparks and afterimages.',
  },
  {
    id: 'electric_sense',
    name: 'Electric Sense',
    type: 'utility',
    power: 5,
    cooldown: 2,
    description:
      'Perceive the electromagnetic signatures of all creatures and objects in a large radius, revealing hidden threats.',
  },
  {
    id: 'tempest_fury',
    name: 'Tempest Fury',
    type: 'offense',
    power: 70,
    cooldown: 15,
    description:
      'Enter a berserk state where you become a living storm, dealing massive electrical damage with every attack for a short duration.',
  },
  {
    id: 'overcharge',
    name: 'Overcharge',
    type: 'buff',
    power: 35,
    cooldown: 10,
    description:
      'Temporarily supercharge all friendly creatures in range, doubling their attack speed and adding electrical damage to their attacks.',
  },
  {
    id: ' EMP_pulse',
    name: 'EMP Pulse',
    type: 'control',
    power: 40,
    cooldown: 12,
    description:
      'Release a massive electromagnetic pulse that disables all electronic and electrical abilities of enemies in a wide area.',
  },
  {
    id: 'lightning_rod_pull',
    name: 'Lightning Rod Pull',
    type: 'control',
    power: 30,
    cooldown: 7,
    description:
      'Place a charged lightning rod that attracts and pulls distant enemies toward it using electrical attraction forces.',
  },
  {
    id: 'storm_eye',
    name: 'Eye of the Storm',
    type: 'defense',
    power: 50,
    cooldown: 18,
    description:
      'Create a calm eye within a storm area where allies are completely protected from all weather and electrical effects.',
  },
  {
    id: 'plasma_wall',
    name: 'Plasma Wall',
    type: 'defense',
    power: 45,
    cooldown: 14,
    description:
      'Raise a wall of solidified plasma that blocks movement and deals continuous burn damage to anything touching it.',
  },
  {
    id: 'thunder_step',
    name: 'Thunder Step',
    type: 'utility',
    power: 20,
    cooldown: 6,
    description:
      'Teleport through a bolt of lightning to a visible location, dealing electrical damage to everything in your departure path.',
  },
  {
    id: 'fury_of_zeus',
    name: 'Fury of Zeus',
    type: 'ultimate',
    power: 120,
    cooldown: 30,
    description:
      'The ultimate thunder ability. Rain devastating lightning bolts across the entire battlefield, striking every enemy simultaneously.',
  },
  {
    id: 'supernova_burst',
    name: 'Supernova Burst',
    type: 'ultimate',
    power: 150,
    cooldown: 35,
    description:
      'Channel all stored plasma energy into a single catastrophic explosion that devastates everything in a massive radius.',
  },
  {
    id: 'eternal_storm',
    name: 'Eternal Storm',
    type: 'ultimate',
    power: 200,
    cooldown: 45,
    description:
      'The apex ability. Transform the entire weald into a perpetual superstorm for a devastating duration, boosting all storm abilities to maximum power.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: LW_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const LW_ACHIEVEMENTS: readonly LWAchievementDef[] = [
  {
    id: 'first_summon',
    name: 'First Spark',
    description: 'Summon your first storm creature.',
    condition: 'totalSummoned >= 1',
    reward: '50 thunder energy',
  },
  {
    id: 'creature_collector',
    name: 'Creature Collector',
    description: 'Summon 10 different storm creatures.',
    condition: 'totalSummoned >= 10',
    reward: '200 thunder energy, 1 rare material',
  },
  {
    id: 'full_roster',
    name: 'Full Roster',
    description: 'Summon all 35 storm creatures.',
    condition: 'totalSummoned >= 35',
    reward: '1000 thunder energy, 3 legendary materials',
  },
  {
    id: 'weald_explorer',
    name: 'Weald Explorer',
    description: 'Claim 4 weald locations.',
    condition: 'totalWealdsClaimed >= 4',
    reward: '150 storm power',
  },
  {
    id: 'full_weald',
    name: 'Weald Master',
    description: 'Claim all 8 weald locations.',
    condition: 'totalWealdsClaimed >= 8',
    reward: '500 storm power, title unlock',
  },
  {
    id: 'strike_first',
    name: 'Strike!',
    description: 'Perform your first thunder strike.',
    condition: 'totalStrikes >= 1',
    reward: '30 thunder energy',
  },
  {
    id: 'lightning_adept',
    name: 'Lightning Adept',
    description: 'Perform 100 thunder strikes.',
    condition: 'totalStrikes >= 100',
    reward: '300 thunder energy, ability unlock',
  },
  {
    id: 'thousand_bolts',
    name: 'Thousand Bolts',
    description: 'Perform 1,000 thunder strikes.',
    condition: 'totalStrikes >= 1000',
    reward: '1000 thunder energy, 5 epic materials',
  },
  {
    id: 'builder_apprentice',
    name: 'Builder Apprentice',
    description: 'Build your first weald structure.',
    condition: 'totalBuilt >= 1',
    reward: '50 storm power',
  },
  {
    id: 'architect',
    name: 'Weald Architect',
    description: 'Build 15 different structures.',
    condition: 'totalBuilt >= 15',
    reward: '400 storm power',
  },
  {
    id: 'master_builder',
    name: 'Master Builder',
    description: 'Build all 25 structures to max level.',
    condition: 'totalBuilt >= 25',
    reward: '800 storm power, legendary material',
  },
  {
    id: 'artifact_hunter',
    name: 'Artifact Hunter',
    description: 'Activate your first legendary artifact.',
    condition: 'totalRelicsActivated >= 1',
    reward: '200 thunder energy',
  },
  {
    id: 'relic_collector',
    name: 'Relic Collector',
    description: 'Activate 8 legendary artifacts.',
    condition: 'totalRelicsActivated >= 8',
    reward: '600 thunder energy, 3 epic materials',
  },
  {
    id: 'power_surge',
    name: 'Power Surge',
    description: 'Reach 10,000 storm power.',
    condition: 'stormPower >= 10000',
    reward: '500 thunder energy, rare title',
  },
  {
    id: 'energy_hoarder',
    name: 'Energy Hoarder',
    description: 'Accumulate 50,000 thunder energy.',
    condition: 'thunderEnergy >= 50000',
    reward: '1000 storm power',
  },
  {
    id: 'material_mogul',
    name: 'Material Mogul',
    description: 'Own 500 or more materials across all types.',
    condition: 'totalMaterials >= 500',
    reward: '300 thunder energy, 2 rare materials',
  },
  {
    id: 'storm_veteran',
    name: 'Storm Veteran',
    description: 'Reach weald level 20.',
    condition: 'lwLevel >= 20',
    reward: '800 thunder energy, epic artifact',
  },
  {
    id: 'thunder_sovereign',
    name: 'Thunder Sovereign',
    description: 'Reach maximum weald level 50.',
    condition: 'lwLevel >= 50',
    reward: '5000 thunder energy, legendary artifact, final title',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: LW_TITLES — 8 Progression Titles
// ═══════════════════════════════════════════════════════════════════

export const LW_TITLES: readonly LWTitleDef[] = [
  {
    id: 'storm_watcher',
    name: 'Storm Watcher',
    requirement: 'Begin your journey in the Lightning Weald',
    bonusPercent: 0,
  },
  {
    id: 'spark_tender',
    name: 'Spark Tender',
    requirement: 'Summon 5 creatures and claim 2 wealds',
    bonusPercent: 5,
  },
  {
    id: 'bolt_herald',
    name: 'Bolt Herald',
    requirement: 'Reach weald level 10 and perform 50 strikes',
    bonusPercent: 10,
  },
  {
    id: 'tempest_rider',
    name: 'Tempest Rider',
    requirement: 'Reach weald level 18 and summon 20 creatures',
    bonusPercent: 15,
  },
  {
    id: 'storm_warden',
    name: 'Storm Warden',
    requirement: 'Claim 6 wealds and build 15 structures',
    bonusPercent: 20,
  },
  {
    id: 'arc_champion',
    name: 'Arc Champion',
    requirement: 'Activate 8 artifacts and reach level 25',
    bonusPercent: 25,
  },
  {
    id: 'thunder_lord',
    name: 'Thunder Lord',
    requirement: 'Reach level 35 and earn 15 achievements',
    bonusPercent: 30,
  },
  {
    id: 'thunder_sovereign',
    name: 'Thunder Sovereign',
    requirement: 'Reach maximum level 50 and complete all achievements',
    bonusPercent: 50,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: LW_ARTIFACTS — 15 Legendary Artifacts
// ═══════════════════════════════════════════════════════════════════

export const LW_ARTIFACTS: readonly LWArtifactDef[] = [
  {
    id: 'stormbreaker_hammer',
    name: 'Stormbreaker Hammer',
    description:
      'A war hammer forged from the heart of a collapsed thunderhead. Each swing generates a thunderclap that shatters enemy morale and fractures solid rock. The hammerhead glows with captured lightning that never fades.',
    bonus: '+30% thunder damage, stun on critical hit',
    power: 120,
    rarity: 'legendary',
  },
  {
    id: 'tempest_crown',
    name: 'Tempest Crown',
    description:
      'A crown made from braided lightning frozen in metallic form. The wearer gains the authority of the storm itself, commanding lesser electrical phenomena to obey. Storm clouds form overhead whenever the crown is worn.',
    bonus: '+25% storm ability power, aura damage',
    power: 150,
    rarity: 'legendary',
  },
  {
    id: 'lightning_gauntlet',
    name: 'Lightning Gauntlet',
    description:
      'A gauntlet that allows the wearer to catch and throw lightning bolts like javelins. The grip generates an electromagnetic field that attracts electrical energy from the surrounding environment, ensuring the wearer never runs out of ammunition.',
    bonus: '+40% chain lightning damage, extended range',
    power: 110,
    rarity: 'epic',
  },
  {
    id: 'plasma_core_orb',
    name: 'Plasma Core Orb',
    description:
      'A perfectly spherical orb containing a self-sustaining plasma reaction that has been burning for millennia. The orb serves as both a power source and a weapon, capable of projecting concentrated beams of plasma at will.',
    bonus: '+35% plasma ability damage, energy regen',
    power: 130,
    rarity: 'legendary',
  },
  {
    id: 'thunderheart_amulet',
    name: 'Thunderheart Amulet',
    description:
      'An amulet containing a gemstone that pulses with the rhythm of distant thunder. The wearer gains immunity to electrical damage and becomes attuned to approaching storms, able to sense them hours before they arrive.',
    bonus: '+50% lightning resistance, storm sense',
    power: 100,
    rarity: 'epic',
  },
  {
    id: 'stormcaller_horn',
    name: 'Stormcaller Horn',
    description:
      'A horn carved from a single fulgurite, decorated with runes that glow during electrical storms. When blown, the horn summons a localized thunderstorm centered on the user, complete with lightning strikes, rain, and gale-force winds.',
    bonus: '+20% summon power, instant storm call',
    power: 95,
    rarity: 'epic',
  },
  {
    id: 'voltblade_sword',
    name: 'Voltblade',
    description:
      'A sword whose edge is a sustained arc of electrical energy rather than physical metal. The blade cuts through any material and cauterizes wounds instantly. Its energy output increases during electrical storms.',
    bonus: '+45% melee damage, energy drain on hit',
    power: 140,
    rarity: 'legendary',
  },
  {
    id: 'aurora_cloak',
    name: 'Aurora Cloak',
    description:
      'A cloak woven from aurora threads that shimmers with shifting colors. The cloak generates a protective energy field that deflects projectiles and electrical attacks, and the wearer can briefly turn invisible during lightning flashes.',
    bonus: '+30% evasion, flash invisibility',
    power: 115,
    rarity: 'epic',
  },
  {
    id: 'fulgurite_staff',
    name: 'Fulgurite Staff',
    description:
      'A tall staff made from the longest fulgurite ever discovered, running the entire length from base to tip. The staff channels and amplifies lightning, allowing the user to cast thunder abilities at double their normal range and power.',
    bonus: '+50% ability range, +25% ability power',
    power: 160,
    rarity: 'legendary',
  },
  {
    id: 'static_shield_buckler',
    name: 'Static Shield Buckler',
    description:
      'A small shield that generates an expanding dome of static electricity when activated. The dome grows larger with each hit it absorbs, eventually releasing all stored energy in a devastating omnidirectional shockwave.',
    bonus: '+40% block, retaliatory discharge',
    power: 105,
    rarity: 'epic',
  },
  {
    id: 'tempest_eye_ring',
    name: 'Eye of the Tempest',
    description:
      'A ring set with a gemstone that contains a miniature perpetual storm. The gem swirls with cloud patterns and miniature lightning. The ring grants the wearer perfect calm in the midst of chaos and amplifies all storm abilities.',
    bonus: '+35% cooldown reduction, calm focus',
    power: 135,
    rarity: 'legendary',
  },
  {
    id: 'plasma_serpent_whip',
    name: 'Plasma Serpent Whip',
    description:
      'A whip made from living plasma that moves like a serpent, seeking targets on its own. Each lash leaves a trail of superheated plasma that burns for several seconds. The whip can extend to incredible lengths and wraps around targets with electromagnetic precision.',
    bonus: '+30% area control, auto-targeting',
    power: 120,
    rarity: 'epic',
  },
  {
    id: 'thunder_chariot_relief',
    name: 'Thunder Chariot Relief',
    description:
      'An ancient stone tablet depicting a chariot pulled by thunder wolves through a storm. When activated, the relief comes to life, summoning a spectral thunder chariot that the user can ride across the weald at supernatural speed.',
    bonus: '+50% movement speed, spectral mount',
    power: 145,
    rarity: 'legendary',
  },
  {
    id: 'storm_crystal_matrix',
    name: 'Storm Crystal Matrix',
    description:
      'A complex arrangement of storm crystals in a geometric pattern that generates a continuous field of electrical energy. The matrix serves as a portable power station, recharging all electrical equipment and abilities of nearby allies.',
    bonus: '+25% team energy regen, passive aura',
    power: 125,
    rarity: 'epic',
  },
  {
    id: 'worldstorm_orb',
    name: 'Worldstorm Orb',
    description:
      'The most powerful artifact in the weald, a sphere containing the compressed energy of a world-spanning storm. Legends say it was created at the birth of the Lightning Weald itself. Its power is nearly limitless, but using it risks destabilizing the entire region.',
    bonus: '+100% all storm damage, area supremacy',
    power: 200,
    rarity: 'legendary',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: LW_EVENTS — 12 Weald Events
// ═══════════════════════════════════════════════════════════════════

export const LW_EVENTS: readonly LWEventDef[] = [
  {
    id: 'lightning_swarm',
    name: 'Lightning Swarm',
    description:
      'Hundreds of lightning bolts strike the weald simultaneously in a concentrated area, terrifying creatures and illuminating the sky in blinding flashes.',
    effect: 'All creatures gain 20% power for 1 hour. Random material drops tripled.',
    severity: 3,
  },
  {
    id: 'ball_lightning_invasion',
    name: 'Ball Lightning Invasion',
    description:
      'Spheres of glowing plasma drift across the weald in vast numbers, bouncing off structures and rolling through fields. They are beautiful but dangerous to approach.',
    effect: 'Chance to find rare plasma materials. Risk of structure damage if not sheltered.',
    severity: 4,
  },
  {
    id: 'thunder_herd_migration',
    name: 'Thunder Herd Migration',
    description:
      'A massive herd of thunder wolves migrates across the weald, their collective static charges creating spectacular electrical displays as they run.',
    effect: 'Double thunder wolf summon chances for 2 hours. Thunder energy regeneration boosted.',
    severity: 2,
  },
  {
    id: 'plasma_storm_overcharge',
    name: 'Plasma Storm Overcharge',
    description:
      'An unusually powerful plasma storm saturates the weald with excess energy, causing all electrical devices and creatures to operate beyond normal capacity.',
    effect: 'All abilities cost 50% less energy for 30 minutes. Overcharge risk to structures.',
    severity: 5,
  },
  {
    id: 'static_silence',
    name: 'Static Silence',
    description:
      'A mysterious phenomenon where all electrical activity in a section of the weald ceases completely. The silence is eerie and unsettling for creatures adapted to constant electrical stimulation.',
    effect: 'Thunder energy gain halted for 10 minutes. Peaceful material foraging bonus after.',
    severity: 2,
  },
  {
    id: 'fulgurite_bloom',
    name: 'Fulgurite Bloom',
    description:
      'A series of powerful lightning strikes creates hundreds of new fulgurite formations across the weald, revealing deposits of rare minerals and trapped atmospheric gases.',
    effect: 'Large bonus of fulgurite glass and rare materials. Mining structures gain bonus XP.',
    severity: 1,
  },
  {
    id: 'storm_eagle_convergence',
    name: 'Storm Eagle Convergence',
    description:
      'Every storm eagle in the weald gathers at a single peak for a massive aerial display, diving and spiraling through clouds in perfect formation.',
    effect: 'Storm eagle summon chances tripled. Thunder energy regeneration doubled for 1 hour.',
    severity: 2,
  },
  {
    id: 'electromagnetic_anomaly',
    name: 'Electromagnetic Anomaly',
    description:
      'A strange disturbance in the electromagnetic field causes compasses to spin wildly, electronics to malfunction, and creatures to behave unpredictably.',
    effect: 'Random creature behavior changes. Chance of discovering hidden artifact locations.',
    severity: 3,
  },
  {
    id: 'legendary_storm_front',
    name: 'Legendary Storm Front',
    description:
      'An extraordinarily powerful storm front rolls across the weald with winds exceeding two hundred miles per hour and continuous lightning that turns night into day.',
    effect: 'All damage doubled for 20 minutes. Shelter or risk creature injury. Epic loot potential.',
    severity: 5,
  },
  {
    id: 'ancient_thunder_awakening',
    name: 'Ancient Thunder Awakening',
    description:
      'Deep beneath the weald, ancient electrical guardians stir from their millennia-long slumber, their awakening sending shockwaves through the ground and air.',
    effect: 'New legendary creature encounters available. Ancient artifact fragments can be found.',
    severity: 4,
  },
  {
    id: 'aurora_descent',
    name: 'Aurora Descent',
    description:
      'For reasons unknown, the aurora borealis descends from the sky to ground level, bathing the entire weald in shimmering curtains of light. The energy is mesmerizing and restorative.',
    effect: 'All creatures fully healed. Passive energy regeneration tripled for 2 hours. Peaceful event.',
    severity: 1,
  },
  {
    id: 'tempest_split',
    name: 'Tempest Split',
    description:
      'The central storm of the weald splits into two smaller storms that diverge in opposite directions, temporarily revealing areas normally shrouded in perpetual darkness and lightning.',
    effect: 'Hidden weald areas become accessible. Rare materials exposed. Limited time exploration opportunity.',
    severity: 3,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: INITIAL STATE FACTORY
// ═══════════════════════════════════════════════════════════════════

function lwCreateDefaultState(): LightningWealdState {
  const storms: Record<string, CreatureState> = {}
  for (const creature of LW_STORMS) {
    storms[creature.id] = { summoned: false, level: 1, exp: 0 }
  }

  const wealds: Record<string, WealdState> = {}
  for (const weald of LW_WEALDS) {
    wealds[weald.id] = { claimed: false, level: 1, energy: 0 }
  }

  const structures: Record<string, number> = {}
  for (const structure of LW_STRUCTURES) {
    structures[structure.id] = 0
  }

  const inventory: Record<string, number> = {
    thunder_shard: 5,
    bolt_fragment: 3,
    static_residue: 10,
  }

  return {
    lwLevel: 1,
    lwStormPower: 0,
    lwThunderEnergy: 100,
    lwStorms: storms,
    lwWealds: wealds,
    lwStructures: structures,
    lwArtifacts: [],
    lwAchievements: [],
    lwInventory: inventory,
    lwStats: {
      totalSummoned: 0,
      totalStrikes: 0,
      totalBuilt: 0,
      totalRelicsActivated: 0,
      totalWealdsClaimed: 0,
    },
    lwTitle: 'storm_watcher',
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function lwCalcCreatureTotalPower(id: string, level: number): number {
  const def = LW_STORMS.find((s) => s.id === id)
  if (!def) return 0
  const species = LW_SPECIES.find((sp) => sp.id === def.species)
  const rarity = LW_RARITIES.find((r) => r.id === def.rarity)
  const base = species?.basePower ?? 10
  const multiplier = rarity?.multiplier ?? 1
  return Math.floor(base * multiplier * (1 + (level - 1) * 0.15))
}

function lwCalcStructureBonus(id: string, level: number): number {
  const def = LW_STRUCTURES.find((s) => s.id === id)
  if (!def) return 0
  return level * def.bonusPerLevel
}

function lwXpForLevel(lvl: number): number {
  return Math.floor(120 * Math.pow(1.25, lvl - 1))
}

function lwCheckAchievements(
  state: LightningWealdState,
  newAchievements: string[]
): string[] {
  const earned: string[] = [...newAchievements]
  for (const ach of LW_ACHIEVEMENTS) {
    if (state.lwAchievements.includes(ach.id)) continue
    if (earned.includes(ach.id)) continue
    const { totalSummoned, totalStrikes, totalBuilt, totalRelicsActivated, totalWealdsClaimed } =
      state.lwStats
    const totalMaterials = Object.values(state.lwInventory).reduce((sum, qty) => sum + qty, 0)
    let met = false
    if (ach.condition === 'totalSummoned >= 1' && totalSummoned >= 1) met = true
    if (ach.condition === 'totalSummoned >= 10' && totalSummoned >= 10) met = true
    if (ach.condition === 'totalSummoned >= 35' && totalSummoned >= 35) met = true
    if (ach.condition === 'totalWealdsClaimed >= 4' && totalWealdsClaimed >= 4) met = true
    if (ach.condition === 'totalWealdsClaimed >= 8' && totalWealdsClaimed >= 8) met = true
    if (ach.condition === 'totalStrikes >= 1' && totalStrikes >= 1) met = true
    if (ach.condition === 'totalStrikes >= 100' && totalStrikes >= 100) met = true
    if (ach.condition === 'totalStrikes >= 1000' && totalStrikes >= 1000) met = true
    if (ach.condition === 'totalBuilt >= 1' && totalBuilt >= 1) met = true
    if (ach.condition === 'totalBuilt >= 15' && totalBuilt >= 15) met = true
    if (ach.condition === 'totalBuilt >= 25' && totalBuilt >= 25) met = true
    if (ach.condition === 'totalRelicsActivated >= 1' && totalRelicsActivated >= 1) met = true
    if (ach.condition === 'totalRelicsActivated >= 8' && totalRelicsActivated >= 8) met = true
    if (ach.condition === 'stormPower >= 10000' && state.lwStormPower >= 10000) met = true
    if (ach.condition === 'thunderEnergy >= 50000' && state.lwThunderEnergy >= 50000) met = true
    if (ach.condition === 'totalMaterials >= 500' && totalMaterials >= 500) met = true
    if (ach.condition === 'lwLevel >= 20' && state.lwLevel >= 20) met = true
    if (ach.condition === 'lwLevel >= 50' && state.lwLevel >= 50) met = true
    if (met) {
      earned.push(ach.id)
    }
  }
  return earned
}

function lwUpdateTitle(state: LightningWealdState): string {
  const current = LW_TITLES.find((t) => t.id === state.lwTitle)
  const currentIdx = current ? LW_TITLES.indexOf(current) : 0
  for (let i = LW_TITLES.length - 1; i > currentIdx; i--) {
    const title = LW_TITLES[i]
    const { totalSummoned, totalStrikes, totalBuilt, totalRelicsActivated, totalWealdsClaimed } =
      state.lwStats
    let eligible = false
    if (title.id === 'storm_watcher') eligible = true
    if (title.id === 'spark_tender' && totalSummoned >= 5 && totalWealdsClaimed >= 2) eligible = true
    if (title.id === 'bolt_herald' && state.lwLevel >= 10 && totalStrikes >= 50) eligible = true
    if (title.id === 'tempest_rider' && state.lwLevel >= 18 && totalSummoned >= 20) eligible = true
    if (title.id === 'storm_warden' && totalWealdsClaimed >= 6 && totalBuilt >= 15) eligible = true
    if (title.id === 'arc_champion' && totalRelicsActivated >= 8 && state.lwLevel >= 25) eligible = true
    if (title.id === 'thunder_lord' && state.lwLevel >= 35 && state.lwAchievements.length >= 15)
      eligible = true
    if (title.id === 'thunder_sovereign' && state.lwLevel >= 50 && state.lwAchievements.length >= 18)
      eligible = true
    if (eligible) return title.id
  }
  return state.lwTitle
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const LW_INITIAL_STATE = lwCreateDefaultState()

const useLightningWealdStore = create<LightningWealdState>()(
  persist(
    () => ({
      ...LW_INITIAL_STATE,
    }),
    {
      name: 'lightning-weald-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: MAIN HOOK — useLightningWeald
// ═══════════════════════════════════════════════════════════════════

export default function useLightningWeald() {
  const state = useLightningWealdStore()

  // ─── Computed Values (all depend on full state) ──────────────────

  const lwActiveCreatureCount = useMemo(() => {
    let count = 0
    for (const key of Object.keys(state.lwStorms)) {
      const c = state.lwStorms[key]
      if (c && c.summoned) count++
    }
    return count
  }, [state])

  const lwTotalCreaturePower = useMemo(() => {
    let total = 0
    for (const key of Object.keys(state.lwStorms)) {
      const c = state.lwStorms[key]
      if (c && c.summoned) {
        total += lwCalcCreatureTotalPower(key, c.level)
      }
    }
    return total
  }, [state])

  const lwWealdEfficiency = useMemo(() => {
    const wealds = Object.entries(state.lwWealds)
    if (wealds.length === 0) return 0
    let total = 0
    for (const [, ws] of wealds) {
      if (ws.claimed) {
        total += ws.level * 10
      }
    }
    return Math.round(total / LW_WEALDS.length)
  }, [state])

  const lwInventoryCount = useMemo(() => {
    let total = 0
    for (const qty of Object.values(state.lwInventory)) {
      total += qty
    }
    return total
  }, [state])

  const lwInventoryValue = useMemo(() => {
    let total = 0
    for (const [id, qty] of Object.entries(state.lwInventory)) {
      const def = LW_MATERIALS.find((m) => m.id === id)
      if (def) {
        total += def.value * qty
      }
    }
    return total
  }, [state])

  const lwAchievementProgress = useMemo(() => {
    if (LW_ACHIEVEMENTS.length === 0) return 0
    return Math.round((state.lwAchievements.length / LW_ACHIEVEMENTS.length) * 100)
  }, [state])

  const lwArtifactPower = useMemo(() => {
    let total = 0
    for (const artifactId of state.lwArtifacts) {
      const def = LW_ARTIFACTS.find((a) => a.id === artifactId)
      if (def) {
        total += def.power
      }
    }
    return total
  }, [state])

  const lwAvailableEvents = useMemo(() => {
    return LW_EVENTS.filter(
      (e) => !state.lwAchievements.includes('event_' + e.id)
    )
  }, [state])

  const lwWealdLevel = useMemo(() => {
    const { totalSummoned, totalStrikes, totalBuilt, totalRelicsActivated, totalWealdsClaimed } =
      state.lwStats
    return Math.floor(
      (totalSummoned * 2 +
        totalStrikes +
        totalBuilt * 3 +
        totalRelicsActivated * 5 +
        totalWealdsClaimed * 4) /
        8
    ) + 1
  }, [state])

  const lwStructureLevel = useMemo(() => {
    let total = 0
    let count = 0
    for (const key of Object.keys(state.lwStructures)) {
      total += state.lwStructures[key]
      count++
    }
    if (count === 0) return 0
    return Math.round(total / count)
  }, [state])

  const lwTotalStructureBonus = useMemo(() => {
    let total = 0
    for (const key of Object.keys(state.lwStructures)) {
      total += lwCalcStructureBonus(key, state.lwStructures[key])
    }
    return total
  }, [state])

  const lwClaimedWealdCount = useMemo(() => {
    let count = 0
    for (const key of Object.keys(state.lwWealds)) {
      const w = state.lwWealds[key]
      if (w && w.claimed) count++
    }
    return count
  }, [state])

  const lwCurrentTitleDef = useMemo(() => {
    const found = LW_TITLES.find((t) => t.id === state.lwTitle)
    if (found) return found
    return LW_TITLES[0]
  }, [state])

  const lwSummonedCreatureDefs = useMemo(() => {
    const defs: LWCreatureDef[] = []
    for (const key of Object.keys(state.lwStorms)) {
      const c = state.lwStorms[key]
      if (c && c.summoned) {
        const def = LW_STORMS.find((d) => d.id === key)
        if (def) defs.push(def)
      }
    }
    return defs
  }, [state])

  const lwRareCreatureCount = useMemo(() => {
    let count = 0
    for (const key of Object.keys(state.lwStorms)) {
      const c = state.lwStorms[key]
      if (c && c.summoned) {
        const def = LW_STORMS.find((d) => d.id === key)
        if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
          count++
        }
      }
    }
    return count
  }, [state])

  const lwHasLegendaryCreature = useMemo(() => {
    for (const key of Object.keys(state.lwStorms)) {
      const c = state.lwStorms[key]
      if (c && c.summoned) {
        const def = LW_STORMS.find((d) => d.id === key)
        if (def && def.rarity === 'legendary') {
          return true
        }
      }
    }
    return false
  }, [state])

  const lwRareMaterialCount = useMemo(() => {
    let count = 0
    for (const [id, qty] of Object.entries(state.lwInventory)) {
      if (qty > 0) {
        const def = LW_MATERIALS.find((m) => m.id === id)
        if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
          count++
        }
      }
    }
    return count
  }, [state])

  const lwActiveArtifactDefs = useMemo(() => {
    return state.lwArtifacts
      .map((id) => LW_ARTIFACTS.find((a) => a.id === id))
      .filter((a): a is LWArtifactDef => a !== null)
  }, [state])

  const lwEffectiveMultiplier = useMemo(() => {
    return 1 + lwCurrentTitleDef.bonusPercent / 100 + lwArtifactPower / 1000
  }, [state])

  const lwEventHistory = useMemo(() => {
    return state.lwAchievements
      .filter((a) => a.startsWith('event_'))
      .map((a) => {
        const eventId = a.replace('event_', '')
        return LW_EVENTS.find((e) => e.id === eventId) ?? null
      })
      .filter((e): e is LWEventDef => e !== null)
  }, [state])

  const lwMaxThunderEnergy = useMemo(() => {
    return 1000 + state.lwLevel * 200 + lwTotalStructureBonus * 10
  }, [state])

  const lwThunderEnergyPercent = useMemo(() => {
    if (lwMaxThunderEnergy <= 0) return 0
    return Math.min(100, Math.floor((state.lwThunderEnergy / lwMaxThunderEnergy) * 100))
  }, [state])

  const lwCreatureBySpecies = useMemo(() => {
    const result: Record<string, LWCreatureDef[]> = {}
    for (const species of LW_SPECIES) {
      result[species.id] = LW_STORMS.filter((s) => s.species === species.id)
    }
    return result
  }, [state])

  const lwCreatureByRarity = useMemo(() => {
    const result: Record<string, LWCreatureDef[]> = {}
    for (const rarity of LW_RARITIES) {
      result[rarity.id] = LW_STORMS.filter((s) => s.rarity === rarity.id)
    }
    return result
  }, [state])

  const lwMaterialsByCategory = useMemo(() => {
    const thunder = LW_MATERIALS.filter((m) => m.category === 'thunder')
    const storm = LW_MATERIALS.filter((m) => m.category === 'storm')
    const plasma = LW_MATERIALS.filter((m) => m.category === 'plasma')
    return { thunder, storm, plasma }
  }, [state])

  const lwOwnedStructureDefs = useMemo(() => {
    const defs: LWStructureDef[] = []
    for (const key of Object.keys(state.lwStructures)) {
      if (state.lwStructures[key] > 0) {
        const def = LW_STRUCTURES.find((s) => s.id === key)
        if (def) defs.push(def)
      }
    }
    return defs
  }, [state])

  const lwBuildProgress = useMemo(() => {
    if (LW_STRUCTURES.length === 0) return 0
    const built = Object.values(state.lwStructures).filter((lvl) => lvl > 0).length
    return Math.round((built / LW_STRUCTURES.length) * 100)
  }, [state])

  // ─── Action Functions ──────────────────────────────────────────

  const lwSummonStorm = useMemo(() => {
    return (creatureId: string): boolean => {
      const def = LW_STORMS.find((c) => c.id === creatureId)
      if (!def) return false

      let success = false
      useLightningWealdStore.setState((prev) => {
        if (prev.lwStorms[creatureId]?.summoned) return prev
        if (prev.lwThunderEnergy < def.cost) return prev
        success = true
        return {
          lwStorms: {
            ...prev.lwStorms,
            [creatureId]: { summoned: true, level: 1, exp: 0 },
          },
          lwThunderEnergy: Math.max(0, prev.lwThunderEnergy - def.cost),
          lwStats: {
            ...prev.lwStats,
            totalSummoned: prev.lwStats.totalSummoned + 1,
          },
        }
      })

      if (success) {
        useLightningWealdStore.setState((prev) => {
          const newAchievements = lwCheckAchievements(prev, [])
          const newTitle = lwUpdateTitle({ ...prev, lwAchievements: [...prev.lwAchievements, ...newAchievements] })
          if (newAchievements.length > 0 || newTitle !== prev.lwTitle) {
            return {
              lwAchievements: [...prev.lwAchievements, ...newAchievements],
              lwTitle: newTitle,
            }
          }
          return prev
        })
      }
      return success
    }
  }, [state])

  const lwWealdClaim = useMemo(() => {
    return (wealdId: string): boolean => {
      const def = LW_WEALDS.find((w) => w.id === wealdId)
      if (!def) return false

      let success = false
      useLightningWealdStore.setState((prev) => {
        if (prev.lwWealds[wealdId]?.claimed) return prev
        if (prev.lwLevel < def.level) return prev
        success = true
        return {
          lwWealds: {
            ...prev.lwWealds,
            [wealdId]: { claimed: true, level: 1, energy: 100 },
          },
          lwStormPower: prev.lwStormPower + def.capacity * 10,
          lwStats: {
            ...prev.lwStats,
            totalWealdsClaimed: prev.lwStats.totalWealdsClaimed + 1,
          },
        }
      })

      if (success) {
        useLightningWealdStore.setState((prev) => {
          const newAchievements = lwCheckAchievements(prev, [])
          const newTitle = lwUpdateTitle({ ...prev, lwAchievements: [...prev.lwAchievements, ...newAchievements] })
          if (newAchievements.length > 0 || newTitle !== prev.lwTitle) {
            return {
              lwAchievements: [...prev.lwAchievements, ...newAchievements],
              lwTitle: newTitle,
            }
          }
          return prev
        })
      }
      return success
    }
  }, [state])

  const lwBuildStructure = useMemo(() => {
    return (structureId: string): boolean => {
      const def = LW_STRUCTURES.find((s) => s.id === structureId)
      if (!def) return false

      let success = false
      useLightningWealdStore.setState((prev) => {
        const currentLevel = prev.lwStructures[structureId] ?? 0
        if (currentLevel >= def.maxLevel) return prev
        const cost = def.costPerLevel * (currentLevel + 1)
        if (prev.lwStormPower < cost) return prev
        success = true
        return {
          lwStructures: {
            ...prev.lwStructures,
            [structureId]: currentLevel + 1,
          },
          lwStormPower: prev.lwStormPower - cost,
          lwStats: {
            ...prev.lwStats,
            totalBuilt: currentLevel === 0 ? prev.lwStats.totalBuilt + 1 : prev.lwStats.totalBuilt,
          },
        }
      })

      if (success) {
        useLightningWealdStore.setState((prev) => {
          const newAchievements = lwCheckAchievements(prev, [])
          const newTitle = lwUpdateTitle({ ...prev, lwAchievements: [...prev.lwAchievements, ...newAchievements] })
          if (newAchievements.length > 0 || newTitle !== prev.lwTitle) {
            return {
              lwAchievements: [...prev.lwAchievements, ...newAchievements],
              lwTitle: newTitle,
            }
          }
          return prev
        })
      }
      return success
    }
  }, [state])

  const lwThunderStrike = useMemo(() => {
    return (): number => {
      let damageDealt = 0
      useLightningWealdStore.setState((prev) => {
        let structBonus = 0
        for (const key of Object.keys(prev.lwStructures)) {
          structBonus += lwCalcStructureBonus(key, prev.lwStructures[key])
        }
        const baseDamage = 10 + prev.lwLevel * 5 + structBonus
        const artifactBonus = prev.lwArtifacts.reduce((sum, id) => {
          const art = LW_ARTIFACTS.find((a) => a.id === id)
          return sum + (art?.power ?? 0)
        }, 0)
        damageDealt = Math.floor((baseDamage + artifactBonus) * (0.8 + Math.random() * 0.4))
        const energyGain = Math.floor(damageDealt * 0.1)
        const powerGain = Math.floor(damageDealt * 0.05)
        return {
          lwThunderEnergy: Math.min(prev.lwThunderEnergy + energyGain, 100000),
          lwStormPower: prev.lwStormPower + powerGain,
          lwStats: {
            ...prev.lwStats,
            totalStrikes: prev.lwStats.totalStrikes + 1,
          },
        }
      })

      useLightningWealdStore.setState((prev) => {
        const newAchievements = lwCheckAchievements(prev, [])
        if (newAchievements.length > 0) {
          return { lwAchievements: [...prev.lwAchievements, ...newAchievements] }
        }
        return prev
      })
      return damageDealt
    }
  }, [state])

  const lwActivateRelic = useMemo(() => {
    return (artifactId: string): boolean => {
      const def = LW_ARTIFACTS.find((a) => a.id === artifactId)
      if (!def) return false

      let success = false
      useLightningWealdStore.setState((prev) => {
        if (prev.lwArtifacts.includes(artifactId)) return prev
        if (prev.lwThunderEnergy < def.power) return prev
        success = true
        return {
          lwArtifacts: [...prev.lwArtifacts, artifactId],
          lwThunderEnergy: Math.max(0, prev.lwThunderEnergy - def.power),
          lwStats: {
            ...prev.lwStats,
            totalRelicsActivated: prev.lwStats.totalRelicsActivated + 1,
          },
        }
      })

      if (success) {
        useLightningWealdStore.setState((prev) => {
          const newAchievements = lwCheckAchievements(prev, [])
          const newTitle = lwUpdateTitle({ ...prev, lwAchievements: [...prev.lwAchievements, ...newAchievements] })
          if (newAchievements.length > 0 || newTitle !== prev.lwTitle) {
            return {
              lwAchievements: [...prev.lwAchievements, ...newAchievements],
              lwTitle: newTitle,
            }
          }
          return prev
        })
      }
      return success
    }
  }, [state])

  const resetLightningWeald = useMemo(() => {
    return () => {
      useLightningWealdStore.setState(lwCreateDefaultState())
    }
  }, [])

  // ─── Return Plain Object (React Compiler auto-memoizes) ────────

  return {
    // Constants
    LW_THEME,
    LW_RARITIES,
    LW_SPECIES,
    LW_STORMS,
    LW_WEALDS,
    LW_MATERIALS,
    LW_STRUCTURES,
    LW_ABILITIES,
    LW_ACHIEVEMENTS,
    LW_TITLES,
    LW_ARTIFACTS,
    LW_EVENTS,
    LW_ELECTRIC_YELLOW,
    LW_STORM_BLUE,
    LW_PLASMA_PURPLE,
    LW_DARK_GRAY,
    LW_LIGHTNING_WHITE,
    LW_THUNDER_GOLD,
    LW_SKY_PALE,
    LW_VOID_BLACK,
    LW_SPARK_GREEN,
    LW_BOLT_CYAN,
    LW_MAX_STRUCTURE_LEVEL,
    LW_SPECIES_COUNT,
    LW_RARITY_TIER_COUNT,

    // State
    ...state,

    // Computed
    lwActiveCreatureCount,
    lwTotalCreaturePower,
    lwWealdEfficiency,
    lwInventoryCount,
    lwInventoryValue,
    lwAchievementProgress,
    lwArtifactPower,
    lwAvailableEvents,
    lwWealdLevel,
    lwStructureLevel,
    lwTotalStructureBonus,
    lwClaimedWealdCount,
    lwCurrentTitleDef,
    lwSummonedCreatureDefs,
    lwRareCreatureCount,
    lwHasLegendaryCreature,
    lwRareMaterialCount,
    lwActiveArtifactDefs,
    lwEffectiveMultiplier,
    lwEventHistory,
    lwMaxThunderEnergy,
    lwThunderEnergyPercent,
    lwCreatureBySpecies,
    lwCreatureByRarity,
    lwMaterialsByCategory,
    lwOwnedStructureDefs,
    lwBuildProgress,

    // Actions
    lwSummonStorm,
    lwWealdClaim,
    lwBuildStructure,
    lwThunderStrike,
    lwActivateRelic,
    resetLightningWeald,
  }
}
