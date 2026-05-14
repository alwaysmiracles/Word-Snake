/**
 * Delta Forge Wire — Delta Forge (三角洲熔炉) feature module for Word Snake
 *
 * A forge-themed system where players hire 35 forge workers across 5 rarity
 * tiers and 7 disciplines, manage 8 workshop locations, collect 30 metal and
 * crystal materials, build 25 upgradeable structures, master 22 forge abilities,
 * earn 18 achievements, unlock 8 progression titles, activate 15 legendary
 * artifacts, and respond to 12 random forge events — backed by a Zustand
 * store with persist middleware.
 *
 * Storage key: delta-forge-wire
 * Prefix: dl / DL_
 * Color theme: forge orange #FF6600, river blue #4169E1, steel gray #708090, molten gold #FFD700
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type DLRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type DLWorkerType =
  | 'iron_smith'
  | 'bronze_caster'
  | 'steam_engineer'
  | 'crystal_cutter'
  | 'river_mechanic'
  | 'ore_prospector'
  | 'flux_alchemist'

export interface DLWorkerDef {
  readonly id: string
  readonly name: string
  readonly type: DLWorkerType
  readonly rarity: DLRarity
  readonly power: number
  readonly cost: number
  readonly description: string
}

export interface DLWorkshopDef {
  readonly id: string
  readonly name: string
  readonly level: number
  readonly resources: string[]
  readonly capacity: number
  readonly description: string
}

export interface DLMaterialDef {
  readonly id: string
  readonly name: string
  readonly rarity: DLRarity
  readonly description: string
  readonly value: number
  readonly category: 'metal' | 'crystal' | 'special'
}

export interface DLStructureDef {
  readonly id: string
  readonly name: string
  readonly maxLevel: number
  readonly description: string
  readonly costPerLevel: number
  readonly bonusPerLevel: number
}

export interface DLAbilityDef {
  readonly id: string
  readonly name: string
  readonly type: string
  readonly power: number
  readonly cooldown: number
  readonly description: string
}

export interface DLAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface DLTitleDef {
  readonly id: string
  readonly name: string
  readonly requirement: string
  readonly bonusPercent: number
}

export interface DLArtifactDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly bonus: string
  readonly power: number
  readonly rarity: DLRarity
}

export interface DLEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly effect: string
  readonly severity: number
}

export interface WorkerState {
  hired: boolean
  level: number
  exp: number
}

export interface WorkshopState {
  level: number
  active: boolean
  output: number
}

export interface InventoryItem {
  id: string
  quantity: number
}

export interface DeltaForgeState {
  dlWorkers: Record<string, WorkerState>
  dlWorkshops: Record<string, WorkshopState>
  dlInventory: InventoryItem[]
  dlArtifacts: string[]
  dlAchievements: string[]
  dlTitle: string
  dlEvents: string[]
  dlStructures: Record<string, number>
  dlStats: {
    totalHired: number
    totalForged: number
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: THEME & COLOR CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const DL_FORGE_ORANGE: string = '#FF6600'
export const DL_RIVER_BLUE: string = '#4169E1'
export const DL_STEEL_GRAY: string = '#708090'
export const DL_MOLTEN_GOLD: string = '#FFD700'
export const DL_DEEP_EMBER: string = '#CC4400'
export const DL_COOL_STEEL: string = '#4A5568'
export const DL_RIVER_MIST: string = '#6495ED'
export const DL_MOLTEN_RED: string = '#DC143C'
export const DL_ANVIL_DARK: string = '#2D3748'
export const DL_SPARK_WHITE: string = '#FAFAFA'

export const DL_THEME = {
  primary: DL_FORGE_ORANGE,
  secondary: DL_RIVER_BLUE,
  neutral: DL_STEEL_GRAY,
  accent: DL_MOLTEN_GOLD,
} as const

export const DL_RARITIES: readonly {
  id: DLRarity
  name: string
  nameCn: string
  color: string
  multiplier: number
}[] = [
  { id: 'common', name: 'Common', nameCn: '普通', color: DL_STEEL_GRAY, multiplier: 1 },
  { id: 'uncommon', name: 'Uncommon', nameCn: '稀有', color: '#22C55E', multiplier: 1.5 },
  { id: 'rare', name: 'Rare', nameCn: '精良', color: DL_RIVER_BLUE, multiplier: 2 },
  { id: 'epic', name: 'Epic', nameCn: '史诗', color: '#A855F7', multiplier: 3 },
  { id: 'legendary', name: 'Legendary', nameCn: '传说', color: DL_FORGE_ORANGE, multiplier: 5 },
]

export const DL_WORKER_TYPES: readonly {
  id: DLWorkerType
  name: string
  nameCn: string
  basePower: number
  color: string
}[] = [
  { id: 'iron_smith', name: 'Iron Smith', nameCn: '铁匠', basePower: 10, color: '#78716C' },
  { id: 'bronze_caster', name: 'Bronze Caster', nameCn: '铜铸师', basePower: 8, color: '#CD7F32' },
  { id: 'steam_engineer', name: 'Steam Engineer', nameCn: '蒸汽工程师', basePower: 12, color: '#9CA3AF' },
  { id: 'crystal_cutter', name: 'Crystal Cutter', nameCn: '水晶切割师', basePower: 7, color: '#E879F9' },
  { id: 'river_mechanic', name: 'River Mechanic', nameCn: '河流机械师', basePower: 9, color: DL_RIVER_BLUE },
  { id: 'ore_prospector', name: 'Ore Prospector', nameCn: '矿石探勘者', basePower: 6, color: '#A16207' },
  { id: 'flux_alchemist', name: 'Flux Alchemist', nameCn: '熔剂炼金师', basePower: 11, color: DL_FORGE_ORANGE },
]

export const DL_MAX_STRUCTURE_LEVEL = 10
export const DL_WORKER_TYPE_COUNT = 7
export const DL_RARITY_TIER_COUNT = 5

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: DL_WORKERS — 35 Forge Workers (7 types x 5 tiers)
// ═══════════════════════════════════════════════════════════════════

export const DL_WORKERS: readonly DLWorkerDef[] = [
  // ── Iron Smith (iron_smith) — 5 tiers ─────────────────────────
  {
    id: 'iron_smith_apprentice',
    name: 'Apprentice Iron Smith',
    type: 'iron_smith',
    rarity: 'common',
    power: 10,
    cost: 50,
    description:
      'A young apprentice who has just begun learning the ancient art of ironworking. Their hammer strikes are uncertain but eager, and every bent nail teaches a valuable lesson about patience and heat control.',
  },
  {
    id: 'iron_smith_skilled',
    name: 'Skilled Iron Smith',
    type: 'iron_smith',
    rarity: 'uncommon',
    power: 25,
    cost: 200,
    description:
      'A seasoned iron smith who can shape bars into horseshoes, tools, and simple blades with practiced efficiency. Their forge fires burn with a steady orange glow that never wavers, even through the longest shifts.',
  },
  {
    id: 'iron_smith_elite',
    name: 'Elite Iron Smith',
    type: 'iron_smith',
    rarity: 'rare',
    power: 55,
    cost: 800,
    description:
      'A master of structural ironwork capable of forging heavy gates, reinforced beams, and intricate scrollwork. Their hammer rings echo across the delta, a heartbeat of industry that sustains the entire forge complex.',
  },
  {
    id: 'iron_smith_master',
    name: 'Master Iron Smith',
    type: 'iron_smith',
    rarity: 'epic',
    power: 120,
    cost: 3000,
    description:
      'A legendary smith whose ironwork is said to be indestructible. They have developed proprietary folding techniques that create layers of unparalleled strength. Kings commission their armor, and bridges bear their mark.',
  },
  {
    id: 'iron_smith_legend',
    name: 'Anvil Soul — Legendary Iron Smith',
    type: 'iron_smith',
    rarity: 'legendary',
    power: 250,
    cost: 12000,
    description:
      'The incarnation of the forge spirit itself, manifest as an iron smith of impossible skill. Legend says they once forged a sword from a falling star, and that every anvil they touch rings with the voice of the mountain. Their very presence hardens all nearby metal.',
  },

  // ── Bronze Caster (bronze_caster) — 5 tiers ───────────────────
  {
    id: 'bronze_caster_apprentice',
    name: 'Apprentice Bronze Caster',
    type: 'bronze_caster',
    rarity: 'common',
    power: 8,
    cost: 45,
    description:
      'A fledgling caster learning to pour molten bronze into sand molds. Their first castings are rough and pitted, but each failure reveals the secrets of metal flow and cooling rates that no textbook can teach.',
  },
  {
    id: 'bronze_caster_skilled',
    name: 'Skilled Bronze Caster',
    type: 'bronze_caster',
    rarity: 'uncommon',
    power: 20,
    cost: 180,
    description:
      'A reliable caster who produces ceremonial vessels, bells, and decorative plates with a warm golden patina. Their bronze alloys are perfectly balanced between hardness and acoustic resonance.',
  },
  {
    id: 'bronze_caster_elite',
    name: 'Elite Bronze Caster',
    type: 'bronze_caster',
    rarity: 'rare',
    power: 45,
    cost: 700,
    description:
      'An expert in lost-wax casting who can reproduce the most delicate details in bronze. Statues emerge from their molds with lifelike expressions, and their mechanical bronze components power the forge waterwheels and clock towers.',
  },
  {
    id: 'bronze_caster_master',
    name: 'Master Bronze Caster',
    type: 'bronze_caster',
    rarity: 'epic',
    power: 100,
    cost: 2800,
    description:
      'A virtuoso who has rediscovered ancient Shang dynasty casting secrets. Their monumental bronze works stand as city landmarks, and their alloy formulas are closely guarded secrets passed down through a single lineage.',
  },
  {
    id: 'bronze_caster_legend',
    name: 'Bronze Spirit — Legendary Bronze Caster',
    type: 'bronze_caster',
    rarity: 'legendary',
    power: 220,
    cost: 11000,
    description:
      'A caster who communes with the Bronze Age ancestors themselves. Their castings possess a mystical quality — bronze bells they forge ring with a frequency that can calm storms, and their mirrors are said to reveal hidden truths about anyone who gazes into them.',
  },

  // ── Steam Engineer (steam_engineer) — 5 tiers ─────────────────
  {
    id: 'steam_engineer_junior',
    name: 'Junior Steam Engineer',
    type: 'steam_engineer',
    rarity: 'common',
    power: 12,
    cost: 60,
    description:
      'A young tinkerer fascinated by the power of pressurized steam. They spend their days patching leaks in the forge boiler pipes and dreaming of building their first working engine from salvaged parts.',
  },
  {
    id: 'steam_engineer_senior',
    name: 'Senior Steam Engineer',
    type: 'steam_engineer',
    rarity: 'uncommon',
    power: 30,
    cost: 250,
    description:
      'A capable engineer who maintains the forge steam plant and builds small piston-driven machines. Their pressure gauges are always precise, and they can hear a failing valve from across the workshop floor.',
  },
  {
    id: 'steam_engineer_elite',
    name: 'Elite Steam Engineer',
    type: 'steam_engineer',
    rarity: 'rare',
    power: 65,
    cost: 1000,
    description:
      'A brilliant mechanical engineer who designs and builds advanced steam systems. Their turbines power entire factory wings, and their automated steam hammers triple the forge production output.',
  },
  {
    id: 'steam_engineer_master',
    name: 'Master Steam Engineer',
    type: 'steam_engineer',
    rarity: 'epic',
    power: 140,
    cost: 3500,
    description:
      'An architectural genius of steam technology who has designed the delta forge central power grid. Their clockwork-steam hybrids are marvels that bridge two eras of engineering, and their blueprints are studied by academies worldwide.',
  },
  {
    id: 'steam_engineer_legend',
    name: 'Boiler Heart — Legendary Steam Engineer',
    type: 'steam_engineer',
    rarity: 'legendary',
    power: 280,
    cost: 14000,
    description:
      'An engineer whose heartbeat synchronizes with the rhythm of the forge boilers. They can coax impossible pressures from ordinary steam, build engines that run on river water alone, and have been rumored to channel lightning through copper coils to create perpetual motion devices.',
  },

  // ── Crystal Cutter (crystal_cutter) — 5 tiers ─────────────────
  {
    id: 'crystal_cutter_novice',
    name: 'Novice Crystal Cutter',
    type: 'crystal_cutter',
    rarity: 'common',
    power: 7,
    cost: 40,
    description:
      'A beginner who chips cautiously at raw quartz with simple hand tools. Their fingers are perpetually dusted with fine crystal powder, and their first successful cuts fill them with a pride that borders on obsession.',
  },
  {
    id: 'crystal_cutter_adept',
    name: 'Adept Crystal Cutter',
    type: 'crystal_cutter',
    rarity: 'uncommon',
    power: 18,
    cost: 160,
    description:
      'A skilled lapidary who can transform rough crystal shards into perfectly faceted gems. Their precision cuts maximize internal light refraction, turning ordinary stones into brilliant focal points for the forge lenses.',
  },
  {
    id: 'crystal_cutter_expert',
    name: 'Expert Crystal Cutter',
    type: 'crystal_cutter',
    rarity: 'rare',
    power: 40,
    cost: 650,
    description:
      'A master of crystal resonance who cuts gems to amplify their natural frequencies. Their lenses focus sunlight into beams hot enough to weld steel, and their prisms split forge light into healing spectral bands.',
  },
  {
    id: 'crystal_cutter_master',
    name: 'Master Crystal Cutter',
    type: 'crystal_cutter',
    rarity: 'epic',
    power: 90,
    cost: 2600,
    description:
      'An artist-scientist who can cut crystals so precisely they store and release energy on command. Their crystal batteries power the forge deep in winter, and their optical arrays form the backbone of the forge communication network.',
  },
  {
    id: 'crystal_cutter_legend',
    name: 'Prism Eye — Legendary Crystal Cutter',
    type: 'crystal_cutter',
    rarity: 'legendary',
    power: 200,
    cost: 10000,
    description:
      'A cutter whose eyes themselves have become crystalline after decades of work. They can see flaws inside uncut stones as clearly as words on a page, and their legendary "infinity cut" creates gems that appear to contain an endless internal galaxy of light.',
  },

  // ── River Mechanic (river_mechanic) — 5 tiers ─────────────────
  {
    id: 'river_mechanic_trainee',
    name: 'Trainee River Mechanic',
    type: 'river_mechanic',
    rarity: 'common',
    power: 9,
    cost: 50,
    description:
      'A young mechanic who maintains the river dams and waterwheels that power the lower forges. They have memorized every current and eddy of the delta and can predict flooding before the water even begins to rise.',
  },
  {
    id: 'river_mechanic_veteran',
    name: 'Veteran River Mechanic',
    type: 'river_mechanic',
    rarity: 'uncommon',
    power: 22,
    cost: 190,
    description:
      'An experienced mechanic who can build and repair underwater mechanisms in flowing currents. Their waterproof gearboxes keep the forge waterwheels turning smoothly even during the worst spring floods.',
  },
  {
    id: 'river_mechanic_elite',
    name: 'Elite River Mechanic',
    type: 'river_mechanic',
    rarity: 'rare',
    power: 48,
    cost: 750,
    description:
      'A hydraulic engineering specialist who designs canal systems, locks, and tidal generators. Their river-powered forge complexes are models of efficiency, drawing maximum energy from every drop of water that passes through.',
  },
  {
    id: 'river_mechanic_master',
    name: 'Master River Mechanic',
    type: 'river_mechanic',
    rarity: 'epic',
    power: 105,
    cost: 3200,
    description:
      'A grand engineer who has tamed the entire delta river system. Their flood control networks protect a dozen forge settlements, and their deep-water turbines generate enough power to run every furnace in the delta simultaneously.',
  },
  {
    id: 'river_mechanic_legend',
    name: 'Tide Lord — Legendary River Mechanic',
    type: 'river_mechanic',
    rarity: 'legendary',
    power: 240,
    cost: 13000,
    description:
      'A mechanic who has achieved perfect harmony with the river itself. The water obeys their commands, forming temporary dams, guiding fish away from intake pipes, and even rising to cool overheating forge equipment. The delta river is said to flow in their name.',
  },

  // ── Ore Prospector (ore_prospector) — 5 tiers ─────────────────
  {
    id: 'ore_prospector_beginner',
    name: 'Beginner Ore Prospector',
    type: 'ore_prospector',
    rarity: 'common',
    power: 6,
    cost: 35,
    description:
      'A novice prospector who pans river sediment for trace minerals and chips at exposed rock faces with a pickaxe. Their pockets are always full of interesting stones, though most turn out to be worthless quartz or fool gold.',
  },
  {
    id: 'ore_prospector_advanced',
    name: 'Advanced Ore Prospector',
    type: 'ore_prospector',
    rarity: 'uncommon',
    power: 15,
    cost: 140,
    description:
      'A seasoned prospector who can read geological formations to locate rich veins of iron, copper, and tin. Their trained eye spots mineral indicators that others would walk past without a second glance.',
  },
  {
    id: 'ore_prospector_expert',
    name: 'Expert Ore Prospector',
    type: 'ore_prospector',
    rarity: 'rare',
    power: 35,
    cost: 550,
    description:
      'A master surveyor who uses divining rods, core samples, and river chemistry analysis to map underground ore deposits with uncanny accuracy. Their discoveries have opened entire new mining districts in the delta.',
  },
  {
    id: 'ore_prospector_master',
    name: 'Master Ore Prospector',
    type: 'ore_prospector',
    rarity: 'epic',
    power: 75,
    cost: 2400,
    description:
      'A legendary prospector who has discovered more rare mineral deposits than any other living person. Their deep mineshafts reach veins of extraordinary purity, and their ore processing methods extract maximum yield from every ton mined.',
  },
  {
    id: 'ore_prospector_legend',
    name: 'Vein Walker — Legendary Ore Prospector',
    type: 'ore_prospector',
    rarity: 'legendary',
    power: 180,
    cost: 9000,
    description:
      'A prospector who can feel the pulse of ore veins through the soles of their boots. They walk the earth and sense mineral deposits like a heartbeat beneath the surface. Mountains part for their picks, and the rarest metals seem to surface willingly when they approach.',
  },

  // ── Flux Alchemist (flux_alchemist) — 5 tiers ────────────────
  {
    id: 'flux_alchemist_neophyte',
    name: 'Neophyte Flux Alchemist',
    type: 'flux_alchemist',
    rarity: 'common',
    power: 11,
    cost: 55,
    description:
      'A junior alchemist who mixes basic flux compounds to purify molten ore. Their bubbling cauldrons produce simple slag removers and flux powders that make the senior smiths jobs just a little bit easier.',
  },
  {
    id: 'flux_alchemist_proficient',
    name: 'Proficient Flux Alchemist',
    type: 'flux_alchemist',
    rarity: 'uncommon',
    power: 27,
    cost: 220,
    description:
      'A competent alchemist who brews specialized flux solutions for different metals and crystals. Their purification formulas remove impurities that would otherwise weaken the final product, raising quality across the forge.',
  },
  {
    id: 'flux_alchemist_elite',
    name: 'Elite Flux Alchemist',
    type: 'flux_alchemist',
    rarity: 'rare',
    power: 58,
    cost: 900,
    description:
      'A brilliant alchemist who develops transmutation fluxes that can alloy metals thought to be incompatible. Their secret compounds allow iron and crystal to bond at the molecular level, creating composite materials of extraordinary properties.',
  },
  {
    id: 'flux_alchemist_master',
    name: 'Master Flux Alchemist',
    type: 'flux_alchemist',
    rarity: 'epic',
    power: 125,
    cost: 3800,
    description:
      'A grand alchemist whose fluxes are sought after by every forge in the realm. Their masterwork compound, the Delta Purifier, can extract pure metal from the most contaminated ore, and their binding fluxes create alloys stronger than any known material.',
  },
  {
    id: 'flux_alchemist_legend',
    name: 'Elemental Furnace — Legendary Flux Alchemist',
    type: 'flux_alchemist',
    rarity: 'legendary',
    power: 260,
    cost: 15000,
    description:
      'An alchemist who has transcended mere chemistry and touches true elemental transmutation. Their fluxes can dissolve and reform matter at the atomic level, converting lead to gold in small quantities. The forge crucibles they tend burn with every color simultaneously, a rainbow of elemental fury.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: DL_WORKSHOPS — 8 Workshop Locations
// ═══════════════════════════════════════════════════════════════════

export const DL_WORKSHOPS: readonly DLWorkshopDef[] = [
  {
    id: 'iron_cliff_forge',
    name: 'Iron Cliff Forge',
    level: 3,
    resources: ['raw_iron_chunk', 'refined_steel_bar', 'flux_residue_scrap'],
    capacity: 50,
    description:
      'Perched on a wind-battered cliff overlooking the delta river, this forge uses natural updrafts to superheat its furnaces. The iron ore here is some of the purest in the region, quarried directly from the cliff face. The constant wind also keeps the workers cool during the most intense forging sessions.',
  },
  {
    id: 'bronze_cove_foundry',
    name: 'Bronze Cove Foundry',
    level: 4,
    resources: ['molten_copper_drop', 'tempered_bronze_plate', 'anvil_spark_fragment'],
    capacity: 40,
    description:
      'Nestled in a sheltered cove where the river water is still and deep, this foundry specializes in large-scale bronze casting. The calm waters provide perfect conditions for the water-quenching process that gives their bronze its characteristic strength and deep amber color.',
  },
  {
    id: 'steam_valley_plant',
    name: 'Steam Valley Plant',
    level: 5,
    resources: ['ember_dust_powder', 'steam_condensate_vial', 'forge_slag_compact'],
    capacity: 60,
    description:
      'Located in a narrow valley that channels and amplifies sound, this plant harnesses steam power to drive massive trip hammers and rolling mills. The valley walls echo with the rhythmic thunder of machinery, creating a symphony of industrial progress that can be heard for miles.',
  },
  {
    id: 'crystal_grotto_workshop',
    name: 'Crystal Grotto Workshop',
    level: 6,
    resources: ['rough_quartz_shard', 'river_sapphire_gem', 'tide_crystal_pearl'],
    capacity: 35,
    description:
      'A natural cavern system filled with luminous crystal formations that provide both light and raw material. The grotto acoustics enhance crystal resonance during cutting, and the natural mineral-rich water flowing through the caves is used in the polishing process.',
  },
  {
    id: 'delta_river_dock',
    name: 'Delta River Dock',
    level: 4,
    resources: ['river_essence_bottle', 'tide_crystal_pearl', 'purified_ore_nugget'],
    capacity: 55,
    description:
      'The main dockyard where river barges deliver raw materials from upstream mines and carry finished goods to distant markets. The constant flow of the delta river provides unlimited cooling water and hydropower for the adjacent workshops.',
  },
  {
    id: 'ore_deep_mine',
    name: 'Ore Deep Mine',
    level: 7,
    resources: ['purified_ore_nugget', 'dark_titanium_ingot', 'ember_dust_powder'],
    capacity: 70,
    description:
      'A vast underground mining complex that descends deep into the mineral-rich delta bedrock. The lowest levels reach ancient geological formations containing rare metals and crystals that cannot be found on the surface. Steam-powered elevators carry workers and ore between levels.',
  },
  {
    id: 'flux_alchemy_lab',
    name: 'Flux Alchemy Laboratory',
    level: 5,
    resources: ['flux_residue_scrap', 'alloy_mixture_blend', 'steam_condensate_vial'],
    capacity: 30,
    description:
      'A state-of-the-art alchemical laboratory where flux compounds and alloys are developed. Rows of bubbling retorts, distillation columns, and crystal growth chambers fill the space. The air is thick with the scent of minerals and exotic reagents, and the walls are lined with shelves of carefully labeled specimens.',
  },
  {
    id: 'legendary_summit_forge',
    name: 'Legendary Summit Forge',
    level: 10,
    resources: ['dragon_forge_alloy_slab', 'legendary_prism_crystal', 'primordial_ore_heart'],
    capacity: 100,
    description:
      'The crown jewel of the delta forge network, perched at the highest point where the three rivers of the delta converge. Only master craftsmen may work here, forging legendary items that require the combined power of all elements. The forge fire at its heart has burned without interruption for a thousand years.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: DL_MATERIALS — 30 Metal/Crystal Materials
// ═══════════════════════════════════════════════════════════════════

export const DL_MATERIALS: readonly DLMaterialDef[] = [
  // Metals (10)
  {
    id: 'raw_iron_chunk',
    name: 'Raw Iron Chunk',
    rarity: 'common',
    description: 'A rough lump of iron ore freshly extracted from the cliff quarries. Still containing significant impurities, it requires smelting before it can be used in forge work.',
    value: 5,
    category: 'metal',
  },
  {
    id: 'refined_steel_bar',
    name: 'Refined Steel Bar',
    rarity: 'uncommon',
    description: 'A gleaming bar of refined steel, purified through multiple passes in the blast furnace. Its surface is smooth and cool to the touch, with a faint carbon pattern visible along its length.',
    value: 25,
    category: 'metal',
  },
  {
    id: 'molten_copper_drop',
    name: 'Molten Copper Drop',
    rarity: 'common',
    description: 'A solidified droplet of pure copper, caught mid-drip from the foundry crucible. Its warm reddish-orange hue shifts to green at the edges where surface oxidation has occurred.',
    value: 8,
    category: 'metal',
  },
  {
    id: 'tempered_bronze_plate',
    name: 'Tempered Bronze Plate',
    rarity: 'uncommon',
    description: 'A flat plate of high-quality bronze that has been repeatedly heated and quenched to achieve exceptional hardness. Its golden-brown surface shows the characteristic tempered pattern of controlled cooling.',
    value: 30,
    category: 'metal',
  },
  {
    id: 'dark_titanium_ingot',
    name: 'Dark Titanium Ingot',
    rarity: 'rare',
    description: 'A dense, unusually heavy ingot of dark titanium alloy recovered from the deepest mine shafts. Its deep gunmetal gray surface seems to absorb light, and it is remarkably resistant to heat and corrosion.',
    value: 120,
    category: 'metal',
  },
  {
    id: 'pure_silver_bar',
    name: 'Pure Silver Bar',
    rarity: 'uncommon',
    description: 'A lustrous bar of nearly pure silver, carefully refined through electrolytic purification. It conducts both heat and magical energy with extraordinary efficiency.',
    value: 40,
    category: 'metal',
  },
  {
    id: 'cold_forged_gold_piece',
    name: 'Cold Forged Gold Piece',
    rarity: 'rare',
    description: 'Gold that has been shaped without heat, using only immense pressure and precision strikes. Cold forging aligns the crystalline structure of the gold, making it harder and more lustrous than conventionally worked gold.',
    value: 150,
    category: 'metal',
  },
  {
    id: 'starlight_mithril_ore',
    name: 'Starlight Mithril Ore',
    rarity: 'epic',
    description: 'An extraordinarily rare ore that glows with faint starlight even in total darkness. When forged, mithril is lighter than silk yet stronger than steel, and it resonates with celestial energies.',
    value: 400,
    category: 'metal',
  },
  {
    id: 'abyssal_adamant_core',
    name: 'Abyssal Adamant Core',
    rarity: 'epic',
    description: 'A core sample of adamantite extracted from the deepest borehole ever drilled in the delta. This metal is virtually indestructible and seems to repel all forms of damage through an unknown crystalline mechanism.',
    value: 500,
    category: 'metal',
  },
  {
    id: 'dragon_forge_alloy_slab',
    name: 'Dragon Forge Alloy Slab',
    rarity: 'legendary',
    description:
      'A massive slab of an alloy so rare it can only be created in the Legendary Summit Forge during a specific celestial alignment. Its surface shimmer between silver and gold, and it is said to contain the essence of dragonfire within its molecular lattice.',
    value: 1500,
    category: 'metal',
  },

  // Crystals (10)
  {
    id: 'rough_quartz_shard',
    name: 'Rough Quartz Shard',
    rarity: 'common',
    description: 'A jagged piece of raw quartz with natural pointed terminations. While not particularly valuable, it is an essential material for basic crystal cutting practice and simple lens grinding.',
    value: 4,
    category: 'crystal',
  },
  {
    id: 'river_sapphire_gem',
    name: 'River Sapphire Gem',
    rarity: 'uncommon',
    description: 'A brilliant blue sapphire naturally tumbled smooth by centuries of river current. The constant water flow has polished it to a gemstone quality that would take a cutter weeks to achieve.',
    value: 35,
    category: 'crystal',
  },
  {
    id: 'forge_ruby_crystal',
    name: 'Forge Ruby Crystal',
    rarity: 'rare',
    description: 'A ruby crystal that formed under extreme geological pressure near an ancient volcanic vent. Its deep crimson color contains trace amounts of molten iron, giving it unique heat-conductive properties.',
    value: 100,
    category: 'crystal',
  },
  {
    id: 'mist_emerald_cluster',
    name: 'Mist Emerald Cluster',
    rarity: 'uncommon',
    description: 'A cluster of small emeralds covered in a permanent mist-like inclusion that shifts when viewed from different angles. The mist effect is caused by microscopic fluid inclusions trapped during crystal growth.',
    value: 45,
    category: 'crystal',
  },
  {
    id: 'storm_topaz_prism',
    name: 'Storm Topaz Prism',
    rarity: 'rare',
    description: 'A precisely cut topaz that generates a weak static charge in humid conditions. Storm topaz is formed when lightning strikes sand deposits near crystal veins, fusing quartz and feldspar into this electrified gem.',
    value: 110,
    category: 'crystal',
  },
  {
    id: 'void_amethyst_shard',
    name: 'Void Amethyst Shard',
    rarity: 'epic',
    description: 'A fragment of amethyst so dark it appears almost black, yet contains swirling purple depths when held to the light. This crystal seems to absorb surrounding energy, growing warmer in cold environments and cooler in heat.',
    value: 350,
    category: 'crystal',
  },
  {
    id: 'magma_opal_fire',
    name: 'Magma Opal Fire',
    rarity: 'rare',
    description: 'A fire opal with vivid orange and red play-of-color that mimics flowing magma. These opals form in the cooling zones of volcanic vents where silica-rich waters interact with iron-rich magma.',
    value: 95,
    category: 'crystal',
  },
  {
    id: 'frost_diamond_flawless',
    name: 'Flawless Frost Diamond',
    rarity: 'epic',
    description: 'A perfectly clear diamond with no visible inclusions or flaws, mined from permafrost layers deep beneath the delta. Its extreme clarity causes light to refract in a distinctive frost-white pattern unique to these stones.',
    value: 600,
    category: 'crystal',
  },
  {
    id: 'ancient_pearl_luster',
    name: 'Ancient Pearl Luster',
    rarity: 'epic',
    description: 'A massive pearl of extraordinary iridescence harvested from a river mollusk species that has existed since prehistoric times. Its luster shifts through every color of the spectrum as it rotates.',
    value: 450,
    category: 'crystal',
  },
  {
    id: 'legendary_prism_crystal',
    name: 'Legendary Prism Crystal',
    rarity: 'legendary',
    description:
      'A crystal of impossible geometry that projects rainbows in all directions regardless of light source. It is said to be a fragment of the original crystal that split the primal light into all colors at the dawn of creation.',
    value: 2000,
    category: 'crystal',
  },

  // Special Materials (10)
  {
    id: 'flux_residue_scrap',
    name: 'Flux Residue Scrap',
    rarity: 'common',
    description: 'Leftover flux material from purification processes. While too contaminated for precise alchemical work, it is useful as a general-purpose cleaning agent and basic fire starter.',
    value: 3,
    category: 'special',
  },
  {
    id: 'river_essence_bottle',
    name: 'River Essence Bottle',
    rarity: 'uncommon',
    description: 'A sealed vial containing concentrated essence drawn from the delta river at its deepest confluence point. The liquid within shimmers with all the colors of the minerals the river has carried across the land.',
    value: 28,
    category: 'special',
  },
  {
    id: 'ember_dust_powder',
    name: 'Ember Dust Powder',
    rarity: 'common',
    description: 'Fine powder collected from the cooling beds of the forge furnaces. It retains enough residual heat to warm hands for hours and is used as a base ingredient in many flux compounds.',
    value: 6,
    category: 'special',
  },
  {
    id: 'forge_slag_compact',
    name: 'Compact Forge Slag',
    rarity: 'common',
    description: 'A dense, glassy byproduct of the smelting process compressed into a solid block. While considered waste by some, skilled alchemists can extract trace metals and minerals from slag using specialized flux treatments.',
    value: 4,
    category: 'special',
  },
  {
    id: 'anvil_spark_fragment',
    name: 'Anvil Spark Fragment',
    rarity: 'uncommon',
    description: 'A tiny metallic fragment ejected during a particularly powerful hammer strike on the forge anvil. These fragments retain kinetic energy and are used in flux compounds designed to accelerate metal bonding.',
    value: 18,
    category: 'special',
  },
  {
    id: 'tide_crystal_pearl',
    name: 'Tide Crystal Pearl',
    rarity: 'rare',
    description: 'A rare organic-mineral hybrid that forms in river delta mollusks during extreme tidal events. Its layered structure records centuries of water chemistry data, making it invaluable for ore prospecting.',
    value: 80,
    category: 'special',
  },
  {
    id: 'steam_condensate_vial',
    name: 'Steam Condensate Vial',
    rarity: 'common',
    description: 'Pure distilled water collected from forge steam condensers. Free of all mineral content, it is the preferred solvent for alchemical mixing and crystal growth solutions.',
    value: 2,
    category: 'special',
  },
  {
    id: 'purified_ore_nugget',
    name: 'Purified Ore Nugget',
    rarity: 'uncommon',
    description: 'A small nugget of ore that has been through the full purification process, removing all gangue material. Its concentrated mineral content makes it ideal for precision alloying and flux development.',
    value: 22,
    category: 'special',
  },
  {
    id: 'alloy_mixture_blend',
    name: 'Alloy Mixture Blend',
    rarity: 'rare',
    description: 'A proprietary blend of powdered metals prepared in the Flux Alchemy Lab for creating advanced alloys. The exact formula is a closely guarded secret, but the results speak for themselves in every blade and beam it produces.',
    value: 75,
    category: 'special',
  },
  {
    id: 'primordial_ore_heart',
    name: 'Primordial Ore Heart',
    rarity: 'legendary',
    description:
      'The crystallized core of an ore deposit that has been forming since the planet was young. It contains trace amounts of every naturally occurring element in perfect balance, making it the ultimate catalyst for legendary forging.',
    value: 1800,
    category: 'special',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: DL_STRUCTURES — 25 Forge Structures
// ═══════════════════════════════════════════════════════════════════

export const DL_STRUCTURES: readonly DLStructureDef[] = [
  {
    id: 'iron_smelting_furnace',
    name: 'Iron Smelting Furnace',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'A blast furnace that processes raw iron ore into workable metal ingots.',
    costPerLevel: 100,
    bonusPerLevel: 5,
  },
  {
    id: 'bronze_casting_foundry',
    name: 'Bronze Casting Foundry',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'A specialized facility for pouring molten bronze into molds of all sizes.',
    costPerLevel: 120,
    bonusPerLevel: 6,
  },
  {
    id: 'steam_power_plant',
    name: 'Steam Power Plant',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'Generates steam power for the entire forge complex from river water.',
    costPerLevel: 150,
    bonusPerLevel: 8,
  },
  {
    id: 'crystal_refinery',
    name: 'Crystal Refinery',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'Processes raw crystal shards into perfectly cut gems and optical components.',
    costPerLevel: 130,
    bonusPerLevel: 7,
  },
  {
    id: 'river_dam_forge',
    name: 'River Dam Forge',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'A dam across the delta river that provides water power and flood protection.',
    costPerLevel: 200,
    bonusPerLevel: 10,
  },
  {
    id: 'ore_crushing_mill',
    name: 'Ore Crushing Mill',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'Massive steam-powered crushers that reduce raw ore into processable gravel.',
    costPerLevel: 90,
    bonusPerLevel: 4,
  },
  {
    id: 'flux_distillery',
    name: 'Flux Distillery',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'Distills and purifies flux compounds for advanced metallurgical processes.',
    costPerLevel: 140,
    bonusPerLevel: 7,
  },
  {
    id: 'anvil_sanctuary',
    name: 'Anvil Sanctuary',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'A sacred space containing masterwork anvils used for the finest forging work.',
    costPerLevel: 180,
    bonusPerLevel: 9,
  },
  {
    id: 'molten_river_channel',
    name: 'Molten River Channel',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'A system of channels that diverts molten metal between workshops safely.',
    costPerLevel: 160,
    bonusPerLevel: 8,
  },
  {
    id: 'titan_hammer_tower',
    name: 'Titan Hammer Tower',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'A towering drop-hammer that can deliver immense forging force from great height.',
    costPerLevel: 220,
    bonusPerLevel: 11,
  },
  {
    id: 'crystal_lens_observatory',
    name: 'Crystal Lens Observatory',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'Uses massive crystal lenses to focus sunlight and starlight for precision cutting.',
    costPerLevel: 170,
    bonusPerLevel: 9,
  },
  {
    id: 'underground_mine_shaft',
    name: 'Underground Mine Shaft',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'A deep mine system that provides access to buried ore and crystal deposits.',
    costPerLevel: 190,
    bonusPerLevel: 10,
  },
  {
    id: 'alloy_forge_bay',
    name: 'Alloy Forge Bay',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'A dedicated forging area for creating advanced metal alloys from raw components.',
    costPerLevel: 200,
    bonusPerLevel: 10,
  },
  {
    id: 'steam_pipeline_network',
    name: 'Steam Pipeline Network',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'Distributes steam power from the central plant to every workshop in the complex.',
    costPerLevel: 110,
    bonusPerLevel: 6,
  },
  {
    id: 'ore_sieve_station',
    name: 'Ore Sieve Station',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'Automated sieving equipment that separates ore fragments by size and mineral type.',
    costPerLevel: 80,
    bonusPerLevel: 4,
  },
  {
    id: 'flux_reaction_chamber',
    name: 'Flux Reaction Chamber',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'A reinforced chamber where volatile flux reactions are conducted safely.',
    costPerLevel: 250,
    bonusPerLevel: 12,
  },
  {
    id: 'artifact_assembly_hall',
    name: 'Artifact Assembly Hall',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'A vast hall where multiple forges and workshops collaborate on artifact creation.',
    costPerLevel: 280,
    bonusPerLevel: 14,
  },
  {
    id: 'quenching_tank',
    name: 'Quenching Tank',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'A massive water tank for rapid-cooling hot metal to achieve specific hardness profiles.',
    costPerLevel: 100,
    bonusPerLevel: 5,
  },
  {
    id: 'tempering_kiln',
    name: 'Tempering Kiln',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'A precise temperature-controlled kiln for the tempering and annealing of forged items.',
    costPerLevel: 130,
    bonusPerLevel: 7,
  },
  {
    id: 'crucible_of_ages',
    name: 'Crucible of Ages',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'An ancient crucible that improves with use, storing heat memory from every forging.',
    costPerLevel: 300,
    bonusPerLevel: 15,
  },
  {
    id: 'delta_convergence_core',
    name: 'Delta Convergence Core',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'A mystical structure at the exact confluence of the three delta rivers, amplifying all forge power.',
    costPerLevel: 350,
    bonusPerLevel: 18,
  },
  {
    id: 'molten_gold_vault',
    name: 'Molten Gold Vault',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'A heavily guarded vault that stores molten gold for legendary forging sessions.',
    costPerLevel: 400,
    bonusPerLevel: 20,
  },
  {
    id: 'river_blue_forge',
    name: 'River Blue Forge',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'A forge cooled and powered entirely by river water, producing uniquely strong blue-tempered steel.',
    costPerLevel: 320,
    bonusPerLevel: 16,
  },
  {
    id: 'steel_grey_armory',
    name: 'Steel Grey Armory',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'A vast armory where the finest weapons and armor in the delta are stored and maintained.',
    costPerLevel: 250,
    bonusPerLevel: 13,
  },
  {
    id: 'legendary_forge_heart',
    name: 'Legendary Forge Heart',
    maxLevel: DL_MAX_STRUCTURE_LEVEL,
    description: 'The mystical core of the entire forge network, connecting all structures into a unified system of immense power.',
    costPerLevel: 500,
    bonusPerLevel: 25,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: DL_ABILITIES — 22 Forge Abilities
// ═══════════════════════════════════════════════════════════════════

export const DL_ABILITIES: readonly DLAbilityDef[] = [
  {
    id: 'basic_hammer_strike',
    name: 'Basic Hammer Strike',
    type: 'forge',
    power: 15,
    cooldown: 5,
    description: 'A fundamental forging technique that delivers a clean, powerful strike. Every master smith remembers their first perfect hammer blow, the ring of metal on metal that told them they had found their calling.',
  },
  {
    id: 'molten_rush',
    name: 'Molten Rush',
    type: 'forge',
    power: 40,
    cooldown: 30,
    description: 'Channels the fury of flowing magma into a burst of extreme forging heat. The forge glows white-hot as the rush takes hold, allowing the smith to work metal as if it were soft clay for a brief, intense period.',
  },
  {
    id: 'crystal_resonance',
    name: 'Crystal Resonance',
    type: 'enchant',
    power: 25,
    cooldown: 20,
    description: 'Tunes all active crystals to the same frequency, creating a harmonic resonance that amplifies their individual powers many times over. The resulting harmonic field can cut through any known material.',
  },
  {
    id: 'steam_burst',
    name: 'Steam Burst',
    type: 'craft',
    power: 35,
    cooldown: 25,
    description: 'Releases a controlled burst of high-pressure steam that powers all connected machinery simultaneously. The sudden surge of energy can accelerate production across the entire forge complex.',
  },
  {
    id: 'river_current',
    name: 'River Current',
    type: 'summon',
    power: 20,
    cooldown: 15,
    description: 'Commands the delta river to redirect its flow through the forge waterways at increased velocity. The enhanced current provides both additional power and rapid cooling for all active forging operations.',
  },
  {
    id: 'ore_sense',
    name: 'Ore Sense',
    type: 'extract',
    power: 10,
    cooldown: 60,
    description: 'Grants the ability to detect valuable ore deposits within a large radius. The prospector closes their eyes and feels the mineral vibrations in the earth, pinpointing rich veins that others would never find.',
  },
  {
    id: 'flux_transmutation',
    name: 'Flux Transmutation',
    type: 'enchant',
    power: 50,
    cooldown: 45,
    description: 'Uses a specialized flux compound to temporarily alter the fundamental properties of a material. Iron can become as light as aluminum, lead can become as hard as diamond, and common stone can glow with inner light.',
  },
  {
    id: 'iron_wall',
    name: 'Iron Wall',
    type: 'shield',
    power: 30,
    cooldown: 30,
    description: 'Constructs a temporary barrier of interlocking iron plates that absorbs incoming damage. The wall is forged instantly from ambient iron particles and provides complete protection for a limited duration.',
  },
  {
    id: 'bronze_echo',
    name: 'Bronze Echo',
    type: 'craft',
    power: 35,
    cooldown: 25,
    description: 'Duplicates the last successful forging operation, producing an identical copy at reduced quality. The echo is imperfect, retaining about 70% of the original quality but requiring only a fraction of the effort.',
  },
  {
    id: 'steam_overdrive',
    name: 'Steam Overdrive',
    type: 'empower',
    power: 55,
    cooldown: 50,
    description: 'Pushes all steam systems beyond their rated capacity, multiplying output for a short burst. The machinery groans and the pipes glow red with excess heat, but the results are spectacular while it lasts.',
  },
  {
    id: 'crystal_shatter',
    name: 'Crystal Shatter',
    type: 'extract',
    power: 60,
    cooldown: 40,
    description: 'Channels destructive resonance through a crystal target, shattering it into perfectly usable fragments. Each fragment retains a portion of the original crystal power, making this an efficient harvesting technique.',
  },
  {
    id: 'tide_call',
    name: 'Tide Call',
    type: 'summon',
    power: 45,
    cooldown: 35,
    description: 'Summons a miniature tidal surge through the forge waterways, carrying with it trace minerals and rare materials deposited by the river over centuries. The surge also cleans and cools all equipment it touches.',
  },
  {
    id: 'vein_locator',
    name: 'Vein Locator',
    type: 'extract',
    power: 20,
    cooldown: 55,
    description: 'An advanced prospecting ability that maps the exact boundaries and composition of underground ore veins. The locator creates a mental three-dimensional image of the mineral deposits in the surrounding area.',
  },
  {
    id: 'elemental_fusion',
    name: 'Elemental Fusion',
    type: 'enchant',
    power: 70,
    cooldown: 60,
    description: 'Combines the fundamental elements of fire, water, earth, and air into a single unified forging force. Items crafted under elemental fusion gain properties of all four elements simultaneously.',
  },
  {
    id: 'molten_armor',
    name: 'Molten Armor',
    type: 'shield',
    power: 50,
    cooldown: 40,
    description: 'Coats the caster in a thin layer of semi-molten metal that hardens instantly on contact with air. The armor is both protective and offensive, radiating intense heat that damages anything that comes too close.',
  },
  {
    id: 'crystal_prism',
    name: 'Crystal Prism',
    type: 'enchant',
    power: 40,
    cooldown: 30,
    description: 'Arranges crystals into a prism formation that splits and redirects energy beams. The prism can focus multiple forge energies into a single point or distribute one beam into many directions.',
  },
  {
    id: 'steam_turbine',
    name: 'Steam Turbine',
    type: 'empower',
    power: 65,
    cooldown: 45,
    description: 'Activates the forge master turbine to its maximum rotational speed, generating a sustained power output that far exceeds normal operations. All steam-powered equipment operates at peak efficiency.',
  },
  {
    id: 'river_whirlpool',
    name: 'River Whirlpool',
    type: 'summon',
    power: 55,
    cooldown: 35,
    description: 'Creates a controlled whirlpool in the delta river that dredges up materials from the riverbed. The whirlpool also generates significant hydroelectric power that can be captured for forge operations.',
  },
  {
    id: 'deep_mine',
    name: 'Deep Mine',
    type: 'extract',
    power: 45,
    cooldown: 50,
    description: 'Instantly extends the deepest mine shaft by a significant depth, revealing new ore deposits and crystal formations. The ability also reinforces the shaft walls to prevent collapse.',
  },
  {
    id: 'flux_catalyst',
    name: 'Flux Catalyst',
    type: 'empower',
    power: 60,
    cooldown: 40,
    description: 'Introduces a catalytic flux that accelerates all ongoing forging and alchemical processes. Work that would normally take hours is completed in minutes, though the quality is slightly reduced.',
  },
  {
    id: 'delta_assembly',
    name: 'Delta Assembly',
    type: 'craft',
    power: 80,
    cooldown: 90,
    description: 'Coordinates all forge workers and workshops to simultaneously contribute to a single grand forging project. The combined effort of the entire delta forge network produces items of legendary quality.',
  },
  {
    id: 'legendary_forge_call',
    name: 'Legendary Forge Call',
    type: 'forge',
    power: 100,
    cooldown: 120,
    description: 'The ultimate forging ability, calling upon the spirit of the ancient forge itself. For a brief moment, every forge in the delta burns with the original primordial fire, allowing the creation of artifacts that transcend normal limitations.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: DL_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const DL_ACHIEVEMENTS: readonly DLAchievementDef[] = [
  {
    id: 'first_hire',
    name: 'First Contract',
    description: 'Hire your first forge worker and officially open for business.',
    condition: 'totalHired >= 1',
    reward: '+50 forge coins',
  },
  {
    id: 'ten_workers',
    name: 'Growing Team',
    description: 'Build a team of 10 forge workers across different disciplines.',
    condition: 'totalHired >= 10',
    reward: '+200 forge coins',
  },
  {
    id: 'full_iron_smiths',
    name: 'Iron Brotherhood',
    description: 'Hire all 5 tiers of iron smiths, from apprentice to legendary.',
    condition: 'iron_smith_count >= 5',
    reward: '+500 forge coins, Iron Badge',
  },
  {
    id: 'workshop_pioneer',
    name: 'Workshop Pioneer',
    description: 'Operate your first workshop location in the delta.',
    condition: 'activeWorkshops >= 1',
    reward: '+100 forge coins',
  },
  {
    id: 'all_workshops_active',
    name: 'Delta Overlord',
    description: 'Have all 8 workshops operating simultaneously.',
    condition: 'activeWorkshops >= 8',
    reward: '+2000 forge coins, Delta Seal',
  },
  {
    id: 'material_collector',
    name: 'Material Hoarder',
    description: 'Collect 100 total material units across all types.',
    condition: 'totalMaterials >= 100',
    reward: '+150 forge coins',
  },
  {
    id: 'rare_material_set',
    name: 'Rare Collection',
    description: 'Own at least one of every rare-tier material or above.',
    condition: 'rareMaterialCount >= 10',
    reward: '+800 forge coins, Collector Frame',
  },
  {
    id: 'first_structure',
    name: 'Breaking Ground',
    description: 'Build your first forge structure.',
    condition: 'builtStructures >= 1',
    reward: '+80 forge coins',
  },
  {
    id: 'max_level_structure',
    name: 'Peak Construction',
    description: 'Upgrade any structure to its maximum level of 10.',
    condition: 'maxStructureLevel >= 10',
    reward: '+1500 forge coins, Builder Crown',
  },
  {
    id: 'ability_master',
    name: 'Forge Adept',
    description: 'Use all 22 forge abilities at least once.',
    condition: 'abilitiesUsed >= 22',
    reward: '+1000 forge coins, Adept Ring',
  },
  {
    id: 'artifact_finder',
    name: 'Artifact Hunter',
    description: 'Activate your first legendary forge artifact.',
    condition: 'artifactCount >= 1',
    reward: '+300 forge coins',
  },
  {
    id: 'five_artifacts',
    name: 'Relic Keeper',
    description: 'Activate 5 legendary artifacts simultaneously.',
    condition: 'artifactCount >= 5',
    reward: '+3000 forge coins, Keeper Emblem',
  },
  {
    id: 'event_veteran',
    name: 'Event Veteran',
    description: 'Experience 10 different forge events.',
    condition: 'eventsExperienced >= 10',
    reward: '+600 forge coins',
  },
  {
    id: 'forge_legend',
    name: 'Living Legend',
    description: 'Reach a total forge output of 10,000 units.',
    condition: 'totalForged >= 10000',
    reward: '+5000 forge coins, Legend Title',
  },
  {
    id: 'rare_worker_hire',
    name: 'Elite Recruitment',
    description: 'Hire a rare-tier worker for the first time.',
    condition: 'hasRareWorker === true',
    reward: '+250 forge coins',
  },
  {
    id: 'legendary_worker_hire',
    name: 'Mythic Hiring',
    description: 'Hire a legendary-tier worker.',
    condition: 'hasLegendaryWorker === true',
    reward: '+2000 forge coins, Mythic Seal',
  },
  {
    id: 'title_earner',
    name: 'Title Holder',
    description: 'Earn your first progression title beyond the default.',
    condition: 'currentTitle !== beginner',
    reward: '+100 forge coins',
  },
  {
    id: 'all_achievements',
    name: 'Delta Forge Master',
    description: 'Complete every achievement in the forge system.',
    condition: 'achievementCount >= 18',
    reward: '+10000 forge coins, Master Forge Hammer',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: DL_TITLES — 8 Progression Titles
// ═══════════════════════════════════════════════════════════════════

export const DL_TITLES: readonly DLTitleDef[] = [
  {
    id: 'novice_smelter',
    name: 'Novice Smelter',
    requirement: 'Default title assigned to all new forge recruits.',
    bonusPercent: 0,
  },
  {
    id: 'apprentice_blacksmith',
    name: 'Apprentice Blacksmith',
    requirement: 'Hire 5 workers and operate 1 workshop.',
    bonusPercent: 5,
  },
  {
    id: 'forge_assistant',
    name: 'Forge Assistant',
    requirement: 'Build 3 structures and collect 50 materials.',
    bonusPercent: 10,
  },
  {
    id: 'journeyman_crafter',
    name: 'Journeyman Crafter',
    requirement: 'Hire 15 workers and activate 2 artifacts.',
    bonusPercent: 15,
  },
  {
    id: 'delta_forge_master',
    name: 'Delta Forge Master',
    requirement: 'Have all workshops active and 25 total hires.',
    bonusPercent: 22,
  },
  {
    id: 'summit_artisan',
    name: 'Summit Artisan',
    requirement: 'Reach the Legendary Summit Forge and craft 10 rare items.',
    bonusPercent: 30,
  },
  {
    id: 'lord_of_the_delta',
    name: 'Lord of the Delta',
    requirement: 'Own 10 artifacts and unlock 15 achievements.',
    bonusPercent: 40,
  },
  {
    id: 'primordial_forge_god',
    name: 'Primordial Forge God',
    requirement: 'Complete all achievements, own all artifacts, and master all abilities.',
    bonusPercent: 55,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: DL_ARTIFACTS — 15 Legendary Forge Artifacts
// ═══════════════════════════════════════════════════════════════════

export const DL_ARTIFACTS: readonly DLArtifactDef[] = [
  {
    id: 'anvil_of_dawn',
    name: 'Anvil of Dawn',
    description: 'An anvil forged from meteorite iron during the first sunrise ever witnessed at the delta. Items worked upon this anvil gain a faint golden luminescence.',
    bonus: '+15% forge output, +5% worker efficiency',
    power: 50,
    rarity: 'rare',
  },
  {
    id: 'hammer_of_titans',
    name: 'Hammer of Titans',
    description: 'A war hammer of immense proportions, said to have been wielded by the titans who shaped the delta mountains. Its strikes create shockwaves that can be felt for miles.',
    bonus: '+25% structure building speed',
    power: 80,
    rarity: 'epic',
  },
  {
    id: 'crystal_of_river',
    name: 'Crystal of River',
    description: 'A perfectly spherical crystal grown in the deepest part of the delta river over a thousand years. It pulses with the rhythm of the tides and grants harmony with all water systems.',
    bonus: '+20% river mechanic power, +10% workshop output',
    power: 60,
    rarity: 'rare',
  },
  {
    id: 'steam_core_engine',
    name: 'Steam Core Engine',
    description: 'A miniature perpetual motion engine that generates unlimited steam from a single drop of water. It hums with barely contained energy and glows with internal heat.',
    bonus: '+30% steam engineer power',
    power: 90,
    rarity: 'epic',
  },
  {
    id: 'bronze_mirror_shield',
    name: 'Bronze Mirror Shield',
    description: 'A perfectly polished bronze shield that reflects not only physical attacks but also negative forge events back at their source. The mirror surface shows glimpses of possible futures.',
    bonus: 'Negate negative events, +10% defense',
    power: 55,
    rarity: 'rare',
  },
  {
    id: 'ore_compass',
    name: 'Ore Compass',
    description: 'A compass whose needle points not north but toward the nearest valuable ore deposit. The needle is made from a sliver of the Vein Walker bone and vibrates when rare minerals are near.',
    bonus: '+20% ore prospector power, auto-detect rare veins',
    power: 45,
    rarity: 'uncommon',
  },
  {
    id: 'flux_everfull',
    name: 'Everfull Flux Flask',
    description: 'A small flask that produces an endless supply of basic flux compound. No matter how much is poured out, the flask always remains full. The flux quality improves with the rarity of nearby materials.',
    bonus: '+15% flux alchemist power, unlimited basic flux',
    power: 65,
    rarity: 'rare',
  },
  {
    id: 'molten_crown',
    name: 'Molten Crown',
    description: 'A crown of perpetually molten gold that hovers above the wearer head without ever burning them. It grants authority over all fire-based forge operations and commands the respect of every worker.',
    bonus: '+10% all worker power, +20% hiring success rate',
    power: 100,
    rarity: 'epic',
  },
  {
    id: 'tide_necklace',
    name: 'Tide Necklace',
    description: 'A necklace of water-worn tide crystals strung on a chain of river silver. It allows the wearer to breathe underwater and sense changes in water pressure throughout the delta.',
    bonus: '+15% river mechanic power, +10% material yield',
    power: 40,
    rarity: 'uncommon',
  },
  {
    id: 'steel_shadow_blade',
    name: 'Steel Shadow Blade',
    description: 'A blade forged from steel that has been tempered in total darkness. It exists in a state of semi-shadow, making it nearly invisible and capable of cutting through light itself.',
    bonus: '+35% crystal cutter power, +10% extraction speed',
    power: 75,
    rarity: 'epic',
  },
  {
    id: 'gold_forge_ring',
    name: 'Gold Forge Ring',
    description: 'A ring of solid gold inscribed with microscopic forge runes that can only be read under extreme magnification. Each rune represents a different forging technique mastered by the ring maker.',
    bonus: '+5% all forge abilities, +15% ability cooldown reduction',
    power: 110,
    rarity: 'legendary',
  },
  {
    id: 'delta_compass',
    name: 'Delta Compass',
    description: 'A compass that always points toward the Delta Convergence Core, no matter where in the world it is carried. It is said to guide its bearer back to the forge in times of great need.',
    bonus: '+10% navigation speed, reveal hidden workshop bonuses',
    power: 35,
    rarity: 'uncommon',
  },
  {
    id: 'ancient_crucible',
    name: 'Ancient Crucible',
    description: 'A crucible made from an unknown material that predates human civilization. It can melt and combine any known substance without degrading, and the metal produced within it carries unusual properties.',
    bonus: '+25% alloy quality, unlock secret alloy recipes',
    power: 85,
    rarity: 'epic',
  },
  {
    id: 'legendary_bellows',
    name: 'Legendary Bellows',
    description: 'A pair of enormous bellows carved from the heartwood of the World Tree. A single pump can sustain forge fire for an entire day, and the air they produce carries a faint scent of cedar and lightning.',
    bonus: '+40% iron smith power, +20% fire efficiency',
    power: 130,
    rarity: 'legendary',
  },
  {
    id: 'prism_of_forge',
    name: 'Prism of Forge',
    description: 'The ultimate artifact, a prism of impossible crystal that contains within it the light of the first fire ever lit by human hands. When placed at the center of the forge, it amplifies all operations exponentially.',
    bonus: '+15% all operations, +10% artifact synergy bonus',
    power: 150,
    rarity: 'legendary',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: DL_EVENTS — 12 Random Forge Events
// ═══════════════════════════════════════════════════════════════════

export const DL_EVENTS: readonly DLEventDef[] = [
  {
    id: 'ore_vein_discovery',
    name: 'Ore Vein Discovery',
    description: 'A massive new ore vein has been discovered near one of your workshops! Prospectors rush to stake claims, and the forge buzzes with excitement.',
    effect: '+30% material yield for 3 rounds',
    severity: 1,
  },
  {
    id: 'molten_eruption',
    name: 'Molten Eruption',
    description: 'An underground magma pocket has breached near the Iron Cliff Forge! The eruption is both dangerous and an incredible source of raw forging heat.',
    effect: '+50% forge power for 2 rounds, -10% worker safety',
    severity: 3,
  },
  {
    id: 'crystal_rain',
    name: 'Crystal Rain',
    description: 'Unusual atmospheric conditions cause thousands of tiny crystal shards to rain down across the delta. The Crystal Grotto Workshop glitters like a chandelier.',
    effect: '+20 crystal materials instantly',
    severity: 1,
  },
  {
    id: 'river_flood',
    name: 'River Flood',
    description: 'Heavy rains upstream have caused the delta river to overflow its banks. The River Dock is submerged, and the lower workshops face significant water damage.',
    effect: '-30% workshop output for 2 rounds, +15% river mechanic exp',
    severity: 4,
  },
  {
    id: 'steam_leak',
    name: 'Steam Leak',
    description: 'A critical valve has failed in the Steam Valley Plant, sending scalding steam everywhere. Workers evacuate while engineers scramble to contain the breach.',
    effect: '-20% steam engineer power for 1 round',
    severity: 2,
  },
  {
    id: 'flux_spill',
    name: 'Flux Spill',
    description: 'A storage container of experimental flux compound has ruptured in the laboratory. The spill creates unusual chemical reactions with nearby materials, some beneficial, some chaotic.',
    effect: 'Random material transformation, 50% chance of bonus or loss',
    severity: 3,
  },
  {
    id: 'wandering_smith',
    name: 'Wandering Smith',
    description: 'A master smith from a distant forge has arrived at the delta seeking work. Their skills are exceptional, and they bring with them knowledge of forgotten techniques.',
    effect: '+1 random high-tier worker available for hire at reduced cost',
    severity: 1,
  },
  {
    id: 'merchant_caravan',
    name: 'Merchant Caravan',
    description: 'A caravan of traveling merchants has arrived at the delta, their wagons loaded with rare materials and exotic components from distant lands.',
    effect: 'Access to rare material shop for 3 rounds',
    severity: 1,
  },
  {
    id: 'ancient_blueprint',
    name: 'Ancient Blueprint',
    description: 'Construction workers excavating a new foundation have uncovered an ancient blueprint depicting a legendary structure design of remarkable sophistication.',
    effect: '-50% cost for next structure upgrade',
    severity: 1,
  },
  {
    id: 'forge_spirit',
    name: 'Forge Spirit Awakening',
    description: 'The ancient forge spirit that guards the delta has stirred from its centuries-long slumber. Its awakening empowers all forge operations with spectral energy.',
    effect: '+25% all forge output for 2 rounds',
    severity: 2,
  },
  {
    id: 'meteorite_impact',
    name: 'Meteorite Impact',
    description: 'A small meteorite has struck the delta, creating a crater filled with extraterrestrial metals and crystals never before seen on this world.',
    effect: '+3 random legendary materials, +50% crystal cutter power for 2 rounds',
    severity: 4,
  },
  {
    id: 'delta_convergence',
    name: 'Delta Convergence',
    description: 'The three rivers of the delta have aligned in a rare celestial conjunction, causing their waters to merge with extraordinary force at the confluence point.',
    effect: '+100% river mechanic power for 1 round, unlock convergence bonuses',
    severity: 5,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function dlFindRarityColor(rarity: DLRarity): string {
  const found = DL_RARITIES.find(r => r.id === rarity)
  if (found) return found.color
  return DL_STEEL_GRAY
}

function dlFindWorkerTypeColor(type: DLWorkerType): string {
  const found = DL_WORKER_TYPES.find(t => t.id === type)
  if (found) return found.color
  return DL_STEEL_GRAY
}

function dlCalcRarityMultiplier(rarity: DLRarity): number {
  const found = DL_RARITIES.find(r => r.id === rarity)
  if (found) return found.multiplier
  return 1
}

function dlCalcStructureCost(structureId: string, currentLevel: number): number {
  const def = DL_STRUCTURES.find(s => s.id === structureId)
  if (!def) return 0
  return Math.floor(def.costPerLevel * Math.pow(1.2, currentLevel))
}

function dlCalcStructureBonus(structureId: string, level: number): number {
  const def = DL_STRUCTURES.find(s => s.id === structureId)
  if (!def) return 0
  return def.bonusPerLevel * level
}

function dlCalcWorkerTotalPower(workerId: string, workerLevel: number): number {
  const def = DL_WORKERS.find(w => w.id === workerId)
  if (!def) return 0
  return Math.floor(def.power * workerLevel * dlCalcRarityMultiplier(def.rarity))
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const DL_INITIAL_STATE: DeltaForgeState = {
  dlWorkers: {},
  dlWorkshops: {},
  dlInventory: [],
  dlArtifacts: [],
  dlAchievements: [],
  dlTitle: 'novice_smelter',
  dlEvents: [],
  dlStructures: {},
  dlStats: {
    totalHired: 0,
    totalForged: 0,
  },
}

const useDeltaForgeStore = create<DeltaForgeState>()(
  persist(
    () => ({
      ...DL_INITIAL_STATE,
    }),
    {
      name: 'delta-forge-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: MAIN HOOK — useDeltaForge
// ═══════════════════════════════════════════════════════════════════

export default function useDeltaForge() {
  const state = useDeltaForgeStore()

  // ─── Computed Values (all depend on state) ─────────────────────

  const dlActiveWorkerCount = useMemo(() => {
    let count = 0
    for (const key of Object.keys(state.dlWorkers)) {
      const w = state.dlWorkers[key]
      if (w && w.hired) count++
    }
    return count
  }, [state])

  const dlTotalForgePower = useMemo(() => {
    let total = 0
    for (const key of Object.keys(state.dlWorkers)) {
      const w = state.dlWorkers[key]
      if (w && w.hired) {
        total += dlCalcWorkerTotalPower(key, w.level)
      }
    }
    return total
  }, [state])

  const dlWorkshopEfficiency = useMemo(() => {
    const workshops = Object.entries(state.dlWorkshops)
    if (workshops.length === 0) return 0
    let total = 0
    for (const [, ws] of workshops) {
      if (ws.active) {
        total += ws.level * 10
      }
    }
    return Math.round(total / DL_WORKSHOPS.length)
  }, [state])

  const dlInventoryCount = useMemo(() => {
    let total = 0
    for (const item of state.dlInventory) {
      total += item.quantity
    }
    return total
  }, [state])

  const dlInventoryValue = useMemo(() => {
    let total = 0
    for (const item of state.dlInventory) {
      const def = DL_MATERIALS.find(m => m.id === item.id)
      if (def) {
        total += def.value * item.quantity
      }
    }
    return total
  }, [state])

  const dlAchievementProgress = useMemo(() => {
    if (DL_ACHIEVEMENTS.length === 0) return 0
    return Math.round((state.dlAchievements.length / DL_ACHIEVEMENTS.length) * 100)
  }, [state])

  const dlArtifactPower = useMemo(() => {
    let total = 0
    for (const artifactId of state.dlArtifacts) {
      const def = DL_ARTIFACTS.find(a => a.id === artifactId)
      if (def) {
        total += def.power
      }
    }
    return total
  }, [state])

  const dlAvailableEvents = useMemo(() => {
    return DL_EVENTS.filter(e => !state.dlEvents.includes(e.id))
  }, [state])

  const dlForgeLevel = useMemo(() => {
    const { totalHired, totalForged } = state.dlStats
    return Math.floor((totalHired * 2 + totalForged) / 10) + 1
  }, [state])

  const dlStructureLevel = useMemo(() => {
    let total = 0
    let count = 0
    for (const key of Object.keys(state.dlStructures)) {
      total += state.dlStructures[key]
      count++
    }
    if (count === 0) return 0
    return Math.round(total / count)
  }, [state])

  const dlTotalStructureBonus = useMemo(() => {
    let total = 0
    for (const key of Object.keys(state.dlStructures)) {
      total += dlCalcStructureBonus(key, state.dlStructures[key])
    }
    return total
  }, [state])

  const dlActiveWorkshopCount = useMemo(() => {
    let count = 0
    for (const key of Object.keys(state.dlWorkshops)) {
      const ws = state.dlWorkshops[key]
      if (ws && ws.active) count++
    }
    return count
  }, [state])

  const dlCurrentTitleDef = useMemo(() => {
    const found = DL_TITLES.find(t => t.id === state.dlTitle)
    if (found) return found
    return DL_TITLES[0]
  }, [state])

  const dlHiredWorkerDefs = useMemo(() => {
    const defs: DLWorkerDef[] = []
    for (const key of Object.keys(state.dlWorkers)) {
      const w = state.dlWorkers[key]
      if (w && w.hired) {
        const def = DL_WORKERS.find(d => d.id === key)
        if (def) defs.push(def)
      }
    }
    return defs
  }, [state])

  const dlRareMaterialCount = useMemo(() => {
    let count = 0
    for (const item of state.dlInventory) {
      if (item.quantity > 0) {
        const def = DL_MATERIALS.find(m => m.id === item.id)
        if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
          count++
        }
      }
    }
    return count
  }, [state])

  const dlEventHistory = useMemo(() => {
    return state.dlEvents.map(eventId => {
      const def = DL_EVENTS.find(e => e.id === eventId)
      if (def) return def
      return null
    }).filter((e): e is DLEventDef => e !== null)
  }, [state])

  const dlHasRareWorker = useMemo(() => {
    for (const key of Object.keys(state.dlWorkers)) {
      const w = state.dlWorkers[key]
      if (w && w.hired) {
        const def = DL_WORKERS.find(d => d.id === key)
        if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
          return true
        }
      }
    }
    return false
  }, [state])

  const dlHasLegendaryWorker = useMemo(() => {
    for (const key of Object.keys(state.dlWorkers)) {
      const w = state.dlWorkers[key]
      if (w && w.hired) {
        const def = DL_WORKERS.find(d => d.id === key)
        if (def && def.rarity === 'legendary') {
          return true
        }
      }
    }
    return false
  }, [state])

  const dlEffectiveMultiplier = useMemo(() => {
    return 1 + (dlCurrentTitleDef.bonusPercent / 100) + (dlArtifactPower / 1000)
  }, [state, dlCurrentTitleDef, dlArtifactPower])

  // ─── Action Functions ──────────────────────────────────────────

  const hireWorker = useMemo(() => {
    return (id: string) => {
      const workerDef = DL_WORKERS.find(w => w.id === id)
      if (!workerDef) return false

      let hired = false
      useDeltaForgeStore.setState((prev) => {
        if (prev.dlWorkers[id]?.hired) return prev
        hired = true
        return {
          dlWorkers: {
            ...prev.dlWorkers,
            [id]: { hired: true, level: 1, exp: 0 },
          },
          dlStats: {
            totalHired: prev.dlStats.totalHired + 1,
            totalForged: prev.dlStats.totalForged,
          },
        }
      })

      if (hired) {
        useDeltaForgeStore.setState((prev) => {
          const newInventory = [...prev.dlInventory]
          return { dlInventory: newInventory }
        })
      }

      return hired
    }
  }, [])

  const operateWorkshop = useMemo(() => {
    return (id: string) => {
      const wsDef = DL_WORKSHOPS.find(w => w.id === id)
      if (!wsDef) return false

      let success = false
      useDeltaForgeStore.setState((prev) => {
        const current = prev.dlWorkshops[id] || {
          level: wsDef.level,
          active: false,
          output: 0,
        }

        const newActive = !current.active
        const newLevel = newActive
          ? current.level
          : Math.min(current.level + 1, wsDef.level + 5)
        const newOutput = newActive ? wsDef.capacity * newLevel : 0

        success = true

        return {
          dlWorkshops: {
            ...prev.dlWorkshops,
            [id]: {
              level: newLevel,
              active: newActive,
              output: newOutput,
            },
          },
          dlStats: {
            totalHired: prev.dlStats.totalHired,
            totalForged: prev.dlStats.totalForged + (newActive ? wsDef.capacity : 0),
          },
        }
      })

      return success
    }
  }, [])

  const buildStructure = useMemo(() => {
    return (id: string) => {
      const structDef = DL_STRUCTURES.find(s => s.id === id)
      if (!structDef) return false

      let success = false
      useDeltaForgeStore.setState((prev) => {
        const currentLevel = prev.dlStructures[id] || 0
        if (currentLevel >= structDef.maxLevel) return prev

        success = true
        return {
          dlStructures: {
            ...prev.dlStructures,
            [id]: currentLevel + 1,
          },
          dlStats: {
            totalHired: prev.dlStats.totalHired,
            totalForged: prev.dlStats.totalForged + 1,
          },
        }
      })

      return success
    }
  }, [])

  const activateArtifact = useMemo(() => {
    return (id: string) => {
      const artDef = DL_ARTIFACTS.find(a => a.id === id)
      if (!artDef) return false

      let success = false
      useDeltaForgeStore.setState((prev) => {
        if (prev.dlArtifacts.includes(id)) return prev

        success = true
        return {
          dlArtifacts: [...prev.dlArtifacts, id],
        }
      })

      return success
    }
  }, [])

  const triggerForgeEvent = useMemo(() => {
    return () => {
      const available = DL_EVENTS.filter(
        e => !useDeltaForgeStore.getState().dlEvents.includes(e.id)
      )

      if (available.length === 0) return null

      const randomEvent = available[Math.floor(Math.random() * available.length)]

      useDeltaForgeStore.setState((prev) => ({
        dlEvents: [...prev.dlEvents, randomEvent.id],
      }))

      return randomEvent
    }
  }, [])

  const resetDeltaForge = useMemo(() => {
    return () => {
      useDeltaForgeStore.setState({
        ...DL_INITIAL_STATE,
      })
    }
  }, [])

  // ─── Lookup Helper Functions ───────────────────────────────────

  const dlGetWorkerDef = (id: string): DLWorkerDef | null => {
    return DL_WORKERS.find(w => w.id === id) ?? null
  }

  const dlGetWorkshopDef = (id: string): DLWorkshopDef | null => {
    return DL_WORKSHOPS.find(w => w.id === id) ?? null
  }

  const dlGetMaterialDef = (id: string): DLMaterialDef | null => {
    return DL_MATERIALS.find(m => m.id === id) ?? null
  }

  const dlGetStructureDef = (id: string): DLStructureDef | null => {
    return DL_STRUCTURES.find(s => s.id === id) ?? null
  }

  const dlGetAbilityDef = (id: string): DLAbilityDef | null => {
    return DL_ABILITIES.find(a => a.id === id) ?? null
  }

  const dlGetAchievementDef = (id: string): DLAchievementDef | null => {
    return DL_ACHIEVEMENTS.find(a => a.id === id) ?? null
  }

  const dlGetTitleDef = (id: string): DLTitleDef | null => {
    return DL_TITLES.find(t => t.id === id) ?? null
  }

  const dlGetArtifactDef = (id: string): DLArtifactDef | null => {
    return DL_ARTIFACTS.find(a => a.id === id) ?? null
  }

  const dlGetEventDef = (id: string): DLEventDef | null => {
    return DL_EVENTS.find(e => e.id === id) ?? null
  }

  const dlGetRarityDef = (id: string): (typeof DL_RARITIES)[number] | null => {
    return DL_RARITIES.find(r => r.id === id) ?? null
  }

  const dlGetWorkerTypeDef = (id: string): (typeof DL_WORKER_TYPES)[number] | null => {
    return DL_WORKER_TYPES.find(t => t.id === id) ?? null
  }

  const dlFindRarityColorFor = (rarity: DLRarity): string => {
    return dlFindRarityColor(rarity)
  }

  const dlFindWorkerTypeColorFor = (type: DLWorkerType): string => {
    return dlFindWorkerTypeColor(type)
  }

  const dlCalcRarityMultiplierFor = (rarity: DLRarity): number => {
    return dlCalcRarityMultiplier(rarity)
  }

  const dlCalcStructureCostFor = (structureId: string, currentLevel: number): number => {
    return dlCalcStructureCost(structureId, currentLevel)
  }

  const dlCalcStructureBonusFor = (structureId: string, level: number): number => {
    return dlCalcStructureBonus(structureId, level)
  }

  const dlCalcWorkerPowerFor = (workerId: string, workerLevel: number): number => {
    return dlCalcWorkerTotalPower(workerId, workerLevel)
  }

  // ─── Compose and Return the dlAPI Object ───────────────────────

  const dlAPI = {
    // ── Constants (Pattern A: directly on API) ─────────────────
    DL_WORKERS,
    DL_WORKSHOPS,
    DL_MATERIALS,
    DL_STRUCTURES,
    DL_ABILITIES,
    DL_ACHIEVEMENTS,
    DL_TITLES,
    DL_ARTIFACTS,
    DL_EVENTS,
    DL_RARITIES,
    DL_WORKER_TYPES,
    DL_MAX_STRUCTURE_LEVEL,
    DL_WORKER_TYPE_COUNT,
    DL_RARITY_TIER_COUNT,
    DL_THEME,
    DL_FORGE_ORANGE,
    DL_RIVER_BLUE,
    DL_STEEL_GRAY,
    DL_MOLTEN_GOLD,
    DL_DEEP_EMBER,
    DL_COOL_STEEL,
    DL_RIVER_MIST,
    DL_MOLTEN_RED,
    DL_ANVIL_DARK,
    DL_SPARK_WHITE,

    // ── State ──────────────────────────────────────────────────
    dlState: state,

    // ── Computed Values ────────────────────────────────────────
    dlActiveWorkerCount,
    dlTotalForgePower,
    dlWorkshopEfficiency,
    dlInventoryCount,
    dlInventoryValue,
    dlAchievementProgress,
    dlArtifactPower,
    dlAvailableEvents,
    dlForgeLevel,
    dlStructureLevel,
    dlTotalStructureBonus,
    dlActiveWorkshopCount,
    dlCurrentTitleDef,
    dlHiredWorkerDefs,
    dlRareMaterialCount,
    dlEventHistory,
    dlHasRareWorker,
    dlHasLegendaryWorker,
    dlEffectiveMultiplier,

    // ── Action Functions ───────────────────────────────────────
    hireWorker,
    operateWorkshop,
    buildStructure,
    activateArtifact,
    triggerForgeEvent,
    resetDeltaForge,

    // ── Lookup Helpers ─────────────────────────────────────────
    dlGetWorkerDef,
    dlGetWorkshopDef,
    dlGetMaterialDef,
    dlGetStructureDef,
    dlGetAbilityDef,
    dlGetAchievementDef,
    dlGetTitleDef,
    dlGetArtifactDef,
    dlGetEventDef,
    dlGetRarityDef,
    dlGetWorkerTypeDef,
    dlFindRarityColorFor,
    dlFindWorkerTypeColorFor,
    dlCalcRarityMultiplierFor,
    dlCalcStructureCostFor,
    dlCalcStructureBonusFor,
    dlCalcWorkerPowerFor,
  }

  return dlAPI
}
