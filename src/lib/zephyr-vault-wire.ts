/**
 * Zephyr Vault Wire — 西风宝库 — A floating treasury vault carried by eternal winds.
 *
 * Players summon 35 wind spirits across 7 species, manage 8 airborne vaults,
 * collect 30 wind materials, build 25 vault structures, unlock 22 wind abilities,
 * discover 15 legendary artifacts, face 12 wind events, earn 18 achievements,
 * and ascend through 8 titles from Wind Caller to Zephyr Sovereign — backed
 * by a Zustand store with persist middleware.
 *
 * Storage key: zephyr-vault-wire
 * Prefix: zv / ZV_
 * Color theme: wind white #F5F5F5, zephyr teal #20B2AA, gale silver #C0C0C0, storm violet #8A2BE2
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type ZvSpecies =
  | 'zephyr_fairy'
  | 'gale_hawk'
  | 'cyclone_wyrm'
  | 'breeze_sprite'
  | 'storm_horse'
  | 'tornado_djinn'
  | 'calm_serpent'

export type ZvRarity = 'common' | 'unusual' | 'rare' | 'epic' | 'legendary'

export type ZvVaultId =
  | 'wind_throne'
  | 'gale_treasury'
  | 'zephyr_archive'
  | 'storm_vault'
  | 'breeze_haven'
  | 'tempest_hall'
  | 'whisper_safe'
  | 'cyclone_peak'

export type ZvTitleId =
  | 'title_wind_caller'
  | 'title_breeze_weaver'
  | 'title_gale_rider'
  | 'title_storm_scout'
  | 'title_tempest_keeper'
  | 'title_cyclone_lord'
  | 'title_wind_sovereign'
  | 'title_zephyr_sovereign'

export interface ZvSpeciesDef {
  readonly id: ZvSpecies
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface ZvWindSpiritDef {
  readonly id: string
  readonly name: string
  readonly species: ZvSpecies
  readonly rarity: ZvRarity
  readonly windPower: number
  readonly wisdom: number
  readonly speed: number
  readonly endurance: number
  readonly description: string
  readonly icon: string
  readonly abilities: string[]
  readonly vaultAffinity: ZvVaultId[]
}

export interface ZvVaultDef {
  readonly id: ZvVaultId
  readonly name: string
  readonly description: string
  readonly altitude: number
  readonly threatLevel: number
  readonly requiredTitle: ZvTitleId
  readonly species: ZvSpecies
  readonly bgGradient: string
  readonly ambientColor: string
}

export interface ZvMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'wind_crystal' | 'feather' | 'gem' | 'essence' | 'alloy'
  readonly rarity: ZvRarity
  readonly windBonus: number
  readonly vaultBonus: number
  readonly value: number
  readonly description: string
}

export interface ZvStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'wind_engine' | 'spirit_nest' | 'vault_door' | 'temple_wing' | 'treasury'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface ZvStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  builtAt: number
}

export interface ZvAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly species: ZvSpecies
  readonly type: 'active' | 'passive'
  readonly rarity: ZvRarity
  readonly windCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface ZvAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { windPower: number; renown: number }
}

export interface ZvTitleDef {
  readonly id: ZvTitleId
  readonly name: string
  readonly emoji: string
  readonly minRenown: number
  readonly minSpirits: number
  readonly description: string
}

export interface ZvArtifactDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: ZvRarity
  readonly species: ZvSpecies
  readonly windBoost: number
  readonly vaultBoost: number
  readonly enduranceBoost: number
  readonly value: number
  readonly description: string
}

export interface ZvEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface ZvSpiritInstance {
  readonly id: string
  speciesId: string
  name: string
  level: number
  xp: number
  windPower: number
  wisdom: number
  speed: number
  endurance: number
  morale: number
  recruitedAt: number
}

export interface ZvStoreState {
  spirits: ZvSpiritInstance[]
  vaults: string[]
  materials: { materialId: string; count: number }[]
  structures: ZvStructureInstance[]
  abilities: string[]
  achievements: string[]
  artifacts: string[]
  currentTitle: ZvTitleId
  windPower: number
  renown: number
  totalSummoned: number
  totalForged: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: ZvEventDef | null
  eventTurnsRemaining: number
  activeVault: string | null
}

export interface ZvStoreActions {
  zvSummonWind: (speciesId: string) => boolean
  zvDismissSpirit: (spiritId: string) => boolean
  zvTrainSpirit: (spiritId: string) => boolean
  zvFlyGale: (spiritId: string) => boolean
  zvBuildStructure: (structureDefId: string) => boolean
  zvUpgradeStructure: (structureId: string) => boolean
  zvOpenVault: (vaultId: string) => ZvEventDef | null
  zvCollectArtifact: (artifactId: string) => boolean
  zvUnlockAbility: (abilityId: string) => boolean
  zvUnlockTitle: (titleId: ZvTitleId) => boolean
  zvClaimAchievement: (achievementId: string) => boolean
  zvTradeMaterial: (materialId: string, count: number) => number
  zvForgeBreeze: (spiritId: string) => boolean
  zvEndEvent: () => void
  zvResetEvent: () => void
}

export interface ZvFullStore extends ZvStoreState, ZvStoreActions {}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS (4 core + 6 extended)
// ═══════════════════════════════════════════════════════════════════

export const ZV_WIND_WHITE: string = '#F5F5F5'
export const ZV_ZEPHYR_TEAL: string = '#20B2AA'
export const ZV_GALE_SILVER: string = '#C0C0C0'
export const ZV_STORM_VIOLET: string = '#8A2BE2'
export const ZV_SKY_AZURE: string = '#87CEEB'
export const ZV_DAWN_AMBER: string = '#FFB347'
export const ZV_MIST_SAGE: string = '#87AE73'
export const ZV_TWILIGHT_INDIGO: string = '#4B0082'
export const ZV_BREEZE_MINT: string = '#98FF98'
export const ZV_VOID_DEEP: string = '#191970'

// ═══════════════════════════════════════════════════════════════════
// SECTION 2b: RARITY DEFINITIONS (5 rarities)
// ═══════════════════════════════════════════════════════════════════

export const ZV_RARITIES: readonly { id: ZvRarity; name: string; color: string; weight: number }[] = [
  { id: 'common', name: 'Common', color: '#C0C0C0', weight: 50 },
  { id: 'unusual', name: 'Unusual', color: '#98FF98', weight: 28 },
  { id: 'rare', name: 'Rare', color: '#20B2AA', weight: 14 },
  { id: 'epic', name: 'Epic', color: '#8A2BE2', weight: 6 },
  { id: 'legendary', name: 'Legendary', color: '#FFD700', weight: 2 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: ZV_SPECIES — 7 Wind Spirit Species
// ═══════════════════════════════════════════════════════════════════

export const ZV_SPECIES: readonly ZvSpeciesDef[] = [
  {
    id: 'zephyr_fairy',
    name: 'Zephyr Fairy',
    color: ZV_ZEPHYR_TEAL,
    description:
      'Delicate fairy-like spirits born from gentle western breezes. They dance on wind currents and carry whispers across vast distances. Zephyr Fairies are the most common wind spirits, known for their shimmering translucent wings that scatter light into rainbow prisms.',
  },
  {
    id: 'gale_hawk',
    name: 'Gale Hawk',
    color: ZV_GALE_SILVER,
    description:
      'Majestic raptors that ride gale-force winds with predatory precision. Their silver feathers are razor-sharp and can slice through solid rock. Gale Hawks serve as scouts and warriors of the wind realms, possessing unparalleled speed among aerial spirits.',
  },
  {
    id: 'cyclone_wyrm',
    name: 'Cyclone Wyrm',
    color: ZV_STORM_VIOLET,
    description:
      'Ancient serpentine dragons that dwell at the heart of cyclones. Their massive coils generate the most powerful wind storms known to exist. Cyclone Wyrms are among the oldest and most feared wind spirits, commanding respect from all other species.',
  },
  {
    id: 'breeze_sprite',
    name: 'Breeze Sprite',
    color: ZV_BREEZE_MINT,
    description:
      'Small, playful spirits that emerge from morning breezes and dew-kissed meadows. They chatter in melodic tones and bring refreshing coolness wherever they travel. Breeze Sprites are beloved for their gentle nature and restorative wind magic.',
  },
  {
    id: 'storm_horse',
    name: 'Storm Horse',
    color: ZV_DAWN_AMBER,
    description:
      'Powerful equine spirits that gallop across thunderstorm fronts. Their hooves strike lightning and their manes crackle with static energy. Storm Horses are the steeds of choice for wind realm cavalry, combining raw power with supernatural endurance.',
  },
  {
    id: 'tornado_djinn',
    name: 'Tornado Djinn',
    color: ZV_TWILIGHT_INDIGO,
    description:
      'Mysterious humanoid wind spirits that inhabit the whirling cores of tornadoes. They are master shapeshifters and illusionists, capable of spinning walls of wind that can disorient even the most powerful opponents. Tornado Djinn are the tricksters of the wind spirit world.',
  },
  {
    id: 'calm_serpent',
    name: 'Calm Serpent',
    color: ZV_MIST_SAGE,
    description:
      'Graceful serpentine spirits that glide through still air with hypnotic fluidity. They radiate an aura of profound calm and can silence even the most violent storms. Calm Serpents are the healers and peacekeepers of the wind spirit hierarchy, valued for their wisdom.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: SPECIES SYNERGY TABLE
// ═══════════════════════════════════════════════════════════════════

const ZV_SYNERGY_MAP: Record<ZvSpecies, ZvSpecies[]> = {
  zephyr_fairy: ['breeze_sprite', 'calm_serpent'],
  gale_hawk: ['storm_horse', 'zephyr_fairy'],
  cyclone_wyrm: ['tornado_djinn', 'storm_horse'],
  breeze_sprite: ['zephyr_fairy', 'calm_serpent'],
  storm_horse: ['gale_hawk', 'cyclone_wyrm'],
  tornado_djinn: ['cyclone_wyrm', 'calm_serpent'],
  calm_serpent: ['breeze_sprite', 'tornado_djinn'],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: ZV_WINDS — 35 Wind Spirits (5 per species)
// ═══════════════════════════════════════════════════════════════════

export const ZV_WINDS: readonly ZvWindSpiritDef[] = [
  // ── Zephyr Fairy (5) ────────────────────────────────────────
  {
    id: 'zf_dew_dancer',
    name: 'Dew Dancer',
    species: 'zephyr_fairy',
    rarity: 'common',
    windPower: 12,
    wisdom: 8,
    speed: 20,
    endurance: 18,
    description:
      'A tiny fairy that performs intricate dances on morning dew drops, creating micro-breezes that refresh nearby flora.',
    icon: '🧚',
    abilities: ['fairy_dust'],
    vaultAffinity: ['breeze_haven', 'zephyr_archive'],
  },
  {
    id: 'zf_petal_whisper',
    name: 'Petal Whisper',
    species: 'zephyr_fairy',
    vaultAffinity: ['breeze_haven', 'zephyr_archive'],
    rarity: 'common',
    windPower: 16,
    wisdom: 10,
    speed: 22,
    endurance: 16,
    description:
      'Carries messages between flowers by whispering on gentle breezes. Her voice can be heard across meadow valleys.',
    icon: '🌸',
    abilities: ['fairy_dust', 'gentle_gust'],
  },
  {
    id: 'zf_prism_wing',
    name: 'Prism Wing',
    species: 'zephyr_fairy',
    vaultAffinity: ['breeze_haven', 'zephyr_archive'],
    rarity: 'unusual',
    windPower: 10,
    wisdom: 28,
    speed: 18,
    endurance: 14,
    description:
      'Wings made of living crystal that refract wind into visible spectral patterns. Can reveal hidden wind currents.',
    icon: '✨',
    abilities: ['fairy_dust', 'prism_gale'],
  },
  {
    id: 'zf_mist_queen',
    name: 'Mist Queen',
    species: 'zephyr_fairy',
    vaultAffinity: ['breeze_haven', 'zephyr_archive'],
    rarity: 'rare',
    windPower: 35,
    wisdom: 45,
    speed: 28,
    endurance: 22,
    description:
      'Rules the misty veil between the material world and the wind spirit realm. Her commands carry the weight of ancient zephyrs.',
    icon: '👑',
    abilities: ['fairy_dust', 'prism_gale', 'mist_command'],
  },
  {
    id: 'zf_aurora_mother',
    name: 'Aurora Mother',
    species: 'zephyr_fairy',
    vaultAffinity: ['breeze_haven', 'zephyr_archive'],
    rarity: 'legendary',
    windPower: 80,
    wisdom: 100,
    speed: 50,
    endurance: 40,
    description:
      'The progenitor of all zephyr fairies. She painted the northern lights with the breath of a million baby fairies. Her presence turns violent storms into gentle zephyrs and brings harmony to all wind spirits in range.',
    icon: '🌌',
    abilities: ['fairy_dust', 'prism_gale', 'mist_command', 'aurora_blessing'],
  },

  // ── Gale Hawk (5) ───────────────────────────────────────────
  {
    id: 'gh_silver_pride',
    name: 'Silver Pride',
    species: 'gale_hawk',
    rarity: 'common',
    windPower: 18,
    wisdom: 6,
    speed: 35,
    endurance: 22,
    description:
      'A juvenile hawk with gleaming silver plumage that cuts through headwinds without effort. Eager to prove its worth.',
    icon: '🦅',
    abilities: ['wind_slash'],
    vaultAffinity: ['wind_throne', 'gale_treasury'],
  },
  {
    id: 'gh_storm_scout',
    name: 'Storm Scout',
    species: 'gale_hawk',
    vaultAffinity: ['wind_throne', 'gale_treasury'],
    rarity: 'common',
    windPower: 22,
    wisdom: 12,
    speed: 40,
    endurance: 25,
    description:
      'An experienced scout hawk that patrols the boundaries of the wind realm. Nothing escapes its piercing gaze.',
    icon: '👁️',
    abilities: ['wind_slash', 'keen_sight'],
  },
  {
    id: 'gh_talon_lord',
    name: 'Talon Lord',
    species: 'gale_hawk',
    vaultAffinity: ['wind_throne', 'gale_treasury'],
    rarity: 'unusual',
    windPower: 30,
    wisdom: 18,
    speed: 48,
    endurance: 30,
    description:
      'A massive hawk whose talons generate localized wind vortexes on impact. Can shred cloud formations with a single strike.',
    icon: '🦴',
    abilities: ['wind_slash', 'keen_sight', 'tornado_talons'],
  },
  {
    id: 'gh_void_glider',
    name: 'Void Glider',
    species: 'gale_hawk',
    vaultAffinity: ['wind_throne', 'gale_treasury'],
    rarity: 'epic',
    windPower: 60,
    wisdom: 42,
    speed: 70,
    endurance: 35,
    description:
      'A hawk that can glide through the void between wind currents, appearing and disappearing at will. Its silver feathers absorb all light.',
    icon: '🌑',
    abilities: ['wind_slash', 'keen_sight', 'tornado_talons', 'void_dive'],
  },
  {
    id: 'gh_sky_sovereign',
    name: 'Sky Sovereign',
    species: 'gale_hawk',
    vaultAffinity: ['wind_throne', 'gale_treasury'],
    rarity: 'legendary',
    windPower: 110,
    wisdom: 80,
    speed: 100,
    endurance: 55,
    description:
      'The undisputed king of all aerial predators. His wingspan blots out the sun and his cry spawns gale-force winds. Ancient beyond memory, he has witnessed the birth of every wind realm vault and guards their secrets with absolute authority.',
    icon: '🦅',
    abilities: ['wind_slash', 'keen_sight', 'tornado_talons', 'void_dive', 'sovereign_roar'],
  },

  // ── Cyclone Wyrm (5) ────────────────────────────────────────
  {
    id: 'cw_dust_coil',
    name: 'Dust Coil',
    species: 'cyclone_wyrm',
    rarity: 'common',
    windPower: 20,
    wisdom: 5,
    speed: 12,
    endurance: 30,
    description:
      'A young wyrm that creates small dust devils when it burrows through sandy terrain. Still learning to control its power.',
    icon: '🐍',
    abilities: ['dust_breath'],
    vaultAffinity: ['storm_vault', 'cyclone_peak'],
  },
  {
    id: 'cw_wind_vortex',
    name: 'Wind Vortex',
    species: 'cyclone_wyrm',
    vaultAffinity: ['storm_vault', 'cyclone_peak'],
    rarity: 'common',
    windPower: 28,
    wisdom: 8,
    speed: 14,
    endurance: 35,
    description:
      'A wyrm that can generate sustained vortexes capable of lifting small boulders. Its scales shimmer with trapped wind energy.',
    icon: '🌀',
    abilities: ['dust_breath', 'vortex_strike'],
  },
  {
    id: 'cw_thunder_coil',
    name: 'Thunder Coil',
    species: 'cyclone_wyrm',
    vaultAffinity: ['storm_vault', 'cyclone_peak'],
    rarity: 'unusual',
    windPower: 40,
    wisdom: 15,
    speed: 18,
    endurance: 45,
    description:
      'A formidable wyrm whose coils generate static electricity. Lightning arcs between its scales during storms.',
    icon: '⚡',
    abilities: ['dust_breath', 'vortex_strike', 'thunder_coil_attack'],
  },
  {
    id: 'cw_tempest_serpent',
    name: 'Tempest Serpent',
    species: 'cyclone_wyrm',
    vaultAffinity: ['storm_vault', 'cyclone_peak'],
    rarity: 'epic',
    windPower: 75,
    wisdom: 50,
    speed: 25,
    endurance: 60,
    description:
      'An ancient serpent that sleeps at the center of the largest cyclones. When it wakes, the weather patterns of entire continents shift.',
    icon: '🐲',
    abilities: ['dust_breath', 'vortex_strike', 'thunder_coil_attack', 'tempest_awakening'],
  },
  {
    id: 'cw_world_serpent',
    name: 'World Serpent',
    species: 'cyclone_wyrm',
    vaultAffinity: ['storm_vault', 'cyclone_peak'],
    rarity: 'legendary',
    windPower: 130,
    wisdom: 90,
    speed: 30,
    endurance: 80,
    description:
      'The primordial serpent that encircles the world within the eternal jet stream. Its body is so long it creates the trade winds and the westerlies. Every cyclone on the planet is a reflex of its slumber. To summon it is to command the wind itself.',
    icon: '🐍',
    abilities: ['dust_breath', 'vortex_strike', 'thunder_coil_attack', 'tempest_awakening', 'world_wind_command'],
  },

  // ── Breeze Sprite (5) ───────────────────────────────────────
  {
    id: 'bs_giggle_zephyr',
    name: 'Giggle Zephyr',
    species: 'breeze_sprite',
    rarity: 'common',
    windPower: 8,
    wisdom: 14,
    speed: 28,
    endurance: 10,
    description:
      'A tiny sprite that laughs on the breeze, spreading joy and light winds wherever it travels. Harmless but charming.',
    icon: '😊',
    abilities: ['giggle_burst'],
    vaultAffinity: ['breeze_haven', 'whisper_safe'],
  },
  {
    id: 'bs_meadow_sigh',
    name: 'Meadow Sigh',
    species: 'breeze_sprite',
    vaultAffinity: ['breeze_haven', 'whisper_safe'],
    rarity: 'common',
    windPower: 10,
    wisdom: 18,
    speed: 25,
    endurance: 12,
    description:
      'A gentle sprite whose sighs create perfect meadow breezes. Farmers pray for its presence during harvest season.',
    icon: '🌾',
    abilities: ['giggle_burst', 'soothing_sigh'],
  },
  {
    id: 'bs_frost_breeze',
    name: 'Frost Breeze',
    species: 'breeze_sprite',
    vaultAffinity: ['breeze_haven', 'whisper_safe'],
    rarity: 'unusual',
    windPower: 15,
    wisdom: 30,
    speed: 30,
    endurance: 15,
    description:
      'A sprite that carries the first frost of autumn. Its touch crystallizes moisture and brings winter early to grateful lands.',
    icon: '❄️',
    abilities: ['giggle_burst', 'soothing_sigh', 'frost_touch'],
  },
  {
    id: 'bs_dawn_carrier',
    name: 'Dawn Carrier',
    species: 'breeze_sprite',
    vaultAffinity: ['breeze_haven', 'whisper_safe'],
    rarity: 'rare',
    windPower: 25,
    wisdom: 48,
    speed: 35,
    endurance: 20,
    description:
      'The sprite responsible for delivering the dawn breeze each morning. Its arrival signals the start of a new day across the world.',
    icon: '🌅',
    abilities: ['giggle_burst', 'soothing_sigh', 'frost_touch', 'dawn_herald'],
  },
  {
    id: 'bs_eternal_spring',
    name: 'Eternal Spring',
    species: 'breeze_sprite',
    vaultAffinity: ['breeze_haven', 'whisper_safe'],
    rarity: 'legendary',
    windPower: 60,
    wisdom: 120,
    speed: 45,
    endurance: 30,
    description:
      'The legendary sprite that maintains the eternal spring breeze. Where it walks, flowers bloom perpetually and the air is forever fragrant. Its wisdom is said to contain the memories of every spring breeze since the world was young.',
    icon: '🌸',
    abilities: ['giggle_burst', 'soothing_sigh', 'frost_touch', 'dawn_herald', 'spring_eternity'],
  },

  // ── Storm Horse (5) ─────────────────────────────────────────
  {
    id: 'sh_thunder_colt',
    name: 'Thunder Colt',
    species: 'storm_horse',
    rarity: 'common',
    windPower: 22,
    wisdom: 4,
    speed: 42,
    endurance: 28,
    description:
      'A young storm horse still learning to control its electrical abilities. Sparks fly from its hooves when it runs.',
    icon: '🐎',
    abilities: ['thunder_hoof'],
    vaultAffinity: ['tempest_hall', 'storm_vault'],
  },
  {
    id: 'sh_gale_steed',
    name: 'Gale Steed',
    species: 'storm_horse',
    vaultAffinity: ['tempest_hall', 'storm_vault'],
    rarity: 'common',
    windPower: 28,
    wisdom: 8,
    speed: 50,
    endurance: 32,
    description:
      'A trained warhorse of the wind realm. It charges through gale-force winds without slowing, carrying riders across storm fronts.',
    icon: '🐴',
    abilities: ['thunder_hoof', 'wind_charge'],
  },
  {
    id: 'sh_lightning_stallion',
    name: 'Lightning Stallion',
    species: 'storm_horse',
    vaultAffinity: ['tempest_hall', 'storm_vault'],
    rarity: 'unusual',
    windPower: 38,
    wisdom: 14,
    speed: 58,
    endurance: 40,
    description:
      'A stallion whose mane is made of living lightning. It moves faster than sound and leaves a trail of thunder in its wake.',
    icon: '⚡',
    abilities: ['thunder_hoof', 'wind_charge', 'lightning_mane'],
  },
  {
    id: 'sh_storm_charger',
    name: 'Storm Charger',
    species: 'storm_horse',
    vaultAffinity: ['tempest_hall', 'storm_vault'],
    rarity: 'epic',
    windPower: 65,
    wisdom: 30,
    speed: 75,
    endurance: 55,
    description:
      'The personal mount of tempest warlords. Its war cry summons actual thunderstorms and its charge can breach vault walls.',
    icon: '🌩️',
    abilities: ['thunder_hoof', 'wind_charge', 'lightning_mane', 'storm_call'],
  },
  {
    id: 'sh_wind_warhorse',
    name: 'Wind Warhorse',
    species: 'storm_horse',
    vaultAffinity: ['tempest_hall', 'storm_vault'],
    rarity: 'legendary',
    windPower: 120,
    wisdom: 70,
    speed: 95,
    endurance: 70,
    description:
      'The primordial warhorse that carries the storm gods into battle. Born from the first thunderclap, it is immune to all weather and its gallop reshapes continental wind patterns. Only the most renowned wind callers can hope to ride it.',
    icon: '🐴',
    abilities: ['thunder_hoof', 'wind_charge', 'lightning_mane', 'storm_call', 'warhorse_of_legends'],
  },

  // ── Tornado Djinn (5) ───────────────────────────────────────
  {
    id: 'td_dust_trickster',
    name: 'Dust Trickster',
    species: 'tornado_djinn',
    rarity: 'common',
    windPower: 14,
    wisdom: 18,
    speed: 30,
    endurance: 16,
    description:
      'A mischievous djinn that creates small spinning dust columns to confuse travelers. Loves playing pranks on gale hawks.',
    icon: '💨',
    abilities: ['dust_illusion'],
    vaultAffinity: ['tempest_hall', 'cyclone_peak'],
  },
  {
    id: 'td_wind_phantom',
    name: 'Wind Phantom',
    species: 'tornado_djinn',
    vaultAffinity: ['tempest_hall', 'cyclone_peak'],
    rarity: 'common',
    windPower: 18,
    wisdom: 22,
    speed: 34,
    endurance: 18,
    description:
      'A djinn that can become invisible within strong winds. It strikes from blind spots and vanishes before counterattacks land.',
    icon: '👻',
    abilities: ['dust_illusion', 'wind_disappear'],
  },
  {
    id: 'td_vortex_master',
    name: 'Vortex Master',
    species: 'tornado_djinn',
    vaultAffinity: ['tempest_hall', 'cyclone_peak'],
    rarity: 'unusual',
    windPower: 32,
    wisdom: 35,
    speed: 40,
    endurance: 25,
    description:
      'A djinn that has mastered the art of creating controlled vortexes. Can imprison enemies in spinning wind cages.',
    icon: '🌀',
    abilities: ['dust_illusion', 'wind_disappear', 'vortex_prison'],
  },
  {
    id: 'td_storm_enchanter',
    name: 'Storm Enchanter',
    species: 'tornado_djinn',
    vaultAffinity: ['tempest_hall', 'cyclone_peak'],
    rarity: 'epic',
    windPower: 55,
    wisdom: 60,
    speed: 50,
    endurance: 38,
    description:
      'An arch-djinn whose enchantments can turn calm breezes into devastating tornadoes. His illusions are indistinguishable from reality.',
    icon: '🧞',
    abilities: ['dust_illusion', 'wind_disappear', 'vortex_prison', 'storm_enchantment'],
  },
  {
    id: 'td_chaos_sovereign',
    name: 'Chaos Sovereign',
    species: 'tornado_djinn',
    vaultAffinity: ['tempest_hall', 'cyclone_peak'],
    rarity: 'legendary',
    windPower: 100,
    wisdom: 95,
    speed: 60,
    endurance: 50,
    description:
      'The supreme djinn who embodies chaos itself. It can reshape reality through wind illusions and summon tornadoes that defy physics. Entire cities have been relocated by its tricks. Only the Zephyr Sovereign can command its true loyalty.',
    icon: '🌀',
    abilities: ['dust_illusion', 'wind_disappear', 'vortex_prison', 'storm_enchantment', 'chaos_mastery'],
  },

  // ── Calm Serpent (5) ────────────────────────────────────────
  {
    id: 'cs_breeze_wisdom',
    name: 'Breeze Wisdom',
    species: 'calm_serpent',
    rarity: 'common',
    windPower: 6,
    wisdom: 20,
    speed: 10,
    endurance: 24,
    description:
      'A small serpent that curls around staffs and murmurs ancient wind knowledge into the ears of weary travelers.',
    icon: '🐍',
    abilities: ['calm_aura'],
    vaultAffinity: ['whisper_safe', 'zephyr_archive'],
  },
  {
    id: 'cs_silence_keeper',
    name: 'Silence Keeper',
    species: 'calm_serpent',
    vaultAffinity: ['whisper_safe', 'zephyr_archive'],
    rarity: 'common',
    windPower: 8,
    wisdom: 26,
    speed: 12,
    endurance: 28,
    description:
      'A serpent whose presence creates an aura of absolute stillness. In its coils, even the fiercest storms become gentle zephyrs.',
    icon: '🤫',
    abilities: ['calm_aura', 'storm_quell'],
  },
  {
    id: 'cs_harmony_sage',
    name: 'Harmony Sage',
    species: 'calm_serpent',
    vaultAffinity: ['whisper_safe', 'zephyr_archive'],
    rarity: 'unusual',
    windPower: 12,
    wisdom: 42,
    speed: 15,
    endurance: 35,
    description:
      'An elder serpent that mediates disputes between warring wind spirit factions. Its counsel has prevented countless storms.',
    icon: '☯️',
    abilities: ['calm_aura', 'storm_quell', 'harmony_blessing'],
  },
  {
    id: 'cs_tranquility_elder',
    name: 'Tranquility Elder',
    species: 'calm_serpent',
    vaultAffinity: ['whisper_safe', 'zephyr_archive'],
    rarity: 'rare',
    windPower: 20,
    wisdom: 65,
    speed: 18,
    endurance: 45,
    description:
      'An ancient serpent that has witnessed the calming of a thousand storms. Its scales hold the memories of every wind that has ever blown.',
    icon: '📜',
    abilities: ['calm_aura', 'storm_quell', 'harmony_blessing', 'memory_of_winds'],
  },
  {
    id: 'cs_omniscient_coil',
    name: 'Omniscient Coil',
    species: 'calm_serpent',
    vaultAffinity: ['whisper_safe', 'zephyr_archive'],
    rarity: 'legendary',
    windPower: 50,
    wisdom: 140,
    speed: 22,
    endurance: 60,
    description:
      'The oldest and wisest being in the wind spirit hierarchy. It has existed since before the first breeze and will persist after the last wind dies. Its wisdom encompasses every secret carried by every gust of wind throughout all of history. To earn its gaze is to understand the universe.',
    icon: '🐍',
    abilities: ['calm_aura', 'storm_quell', 'harmony_blessing', 'memory_of_winds', 'omniscient_wisdom'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: ZV_VAULTS — 8 Airborne Vault Locations
// ═══════════════════════════════════════════════════════════════════

export const ZV_VAULTS: readonly ZvVaultDef[] = [
  {
    id: 'wind_throne',
    name: 'Wind Throne',
    description:
      'The primary seat of wind power. A towering throne carved from a single cloud, where the Wind Caller first communes with the eternal breezes. Gentle drafts spiral around its crystalline base, whispering secrets of the upper atmosphere.',
    altitude: 1000,
    threatLevel: 1,
    requiredTitle: 'title_wind_caller',
    species: 'zephyr_fairy',
    bgGradient: 'linear-gradient(180deg, #F5F5F5 0%, #20B2AA 50%, #C0C0C0 100%)',
    ambientColor: ZV_WIND_WHITE,
  },
  {
    id: 'gale_treasury',
    name: 'Gale Treasury',
    description:
      'A vast treasury vault secured by perpetual gale-force winds. Only the fastest spirits can navigate its corridors without being thrown back. Its walls are lined with wind crystals that glow silver in the storm light.',
    altitude: 2500,
    threatLevel: 2,
    requiredTitle: 'title_wind_caller',
    species: 'gale_hawk',
    bgGradient: 'linear-gradient(180deg, #C0C0C0 0%, #F5F5F5 50%, #20B2AA 100%)',
    ambientColor: ZV_GALE_SILVER,
  },
  {
    id: 'zephyr_archive',
    name: 'Zephyr Archive',
    description:
      'An infinite library carried by the gentlest zephyrs. Its pages turn themselves and its books whisper their contents to respectful visitors. The collected wisdom of every wind that has ever blown resides here.',
    altitude: 4000,
    threatLevel: 3,
    requiredTitle: 'title_breeze_weaver',
    species: 'zephyr_fairy',
    bgGradient: 'linear-gradient(180deg, #20B2AA 0%, #98FF98 50%, #F5F5F5 100%)',
    ambientColor: ZV_ZEPHYR_TEAL,
  },
  {
    id: 'storm_vault',
    name: 'Storm Vault',
    description:
      'The most dangerous vault, perpetually surrounded by lightning and thunder. Only the bravest spirits dare approach. Inside, the most powerful wind artifacts pulse with raw elemental energy.',
    altitude: 5500,
    threatLevel: 4,
    requiredTitle: 'title_gale_rider',
    species: 'cyclone_wyrm',
    bgGradient: 'linear-gradient(180deg, #8A2BE2 0%, #4B0082 50%, #C0C0C0 100%)',
    ambientColor: ZV_STORM_VIOLET,
  },
  {
    id: 'breeze_haven',
    name: 'Breeze Haven',
    description:
      'A peaceful sanctuary where gentle breezes carry wounded spirits for recovery. The air here is perpetually fragrant with healing pollen and the soft sounds of wind chimes.',
    altitude: 3500,
    threatLevel: 2,
    requiredTitle: 'title_wind_caller',
    species: 'breeze_sprite',
    bgGradient: 'linear-gradient(180deg, #98FF98 0%, #87AE73 50%, #F5F5F5 100%)',
    ambientColor: ZV_BREEZE_MINT,
  },
  {
    id: 'tempest_hall',
    name: 'Tempest Hall',
    description:
      'A grand hall where tempests are forged and controlled. Masters of wind gather here to shape the weather patterns of entire continents. The hall itself breathes with the rhythm of the storms.',
    altitude: 6500,
    threatLevel: 5,
    requiredTitle: 'title_storm_scout',
    species: 'storm_horse',
    bgGradient: 'linear-gradient(180deg, #FFB347 0%, #8A2BE2 50%, #20B2AA 100%)',
    ambientColor: ZV_DAWN_AMBER,
  },
  {
    id: 'whisper_safe',
    name: 'Whisper Safe',
    description:
      'A hidden vault accessible only through the whispers of the wind. It contains the most precious secrets of the wind realm, protected by layers of silence and misdirection.',
    altitude: 5000,
    threatLevel: 3,
    requiredTitle: 'title_breeze_weaver',
    species: 'calm_serpent',
    bgGradient: 'linear-gradient(180deg, #87AE73 0%, #4B0082 50%, #20B2AA 100%)',
    ambientColor: ZV_MIST_SAGE,
  },
  {
    id: 'cyclone_peak',
    name: 'Cyclone Peak',
    description:
      'The highest vault, perched atop a perpetually spinning cyclone. Reality itself warps here, and only the most powerful spirits can maintain their form. It houses the Zephyr Sovereign throne.',
    altitude: 9000,
    threatLevel: 8,
    requiredTitle: 'title_wind_sovereign',
    species: 'tornado_djinn',
    bgGradient: 'linear-gradient(180deg, #4B0082 0%, #191970 50%, #8A2BE2 100%)',
    ambientColor: ZV_TWILIGHT_INDIGO,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: ZV_MATERIALS — 30 Wind Materials
// ═══════════════════════════════════════════════════════════════════

export const ZV_MATERIALS: readonly ZvMaterialDef[] = [
  // Common (8)
  { id: 'mat_wind_crystal_shard', name: 'Wind Crystal Shard', emoji: '💠', type: 'wind_crystal', rarity: 'common', windBonus: 2, vaultBonus: 1, value: 10, description: 'A small fragment of crystallized wind energy, humming with faint air vibrations.' },
  { id: 'mat_zephyr_feather', name: 'Zephyr Feather', emoji: '🪶', type: 'feather', rarity: 'common', windBonus: 5, vaultBonus: 0, value: 15, description: 'A light feather shed by a passing zephyr fairy. It drifts perpetually even indoors.' },
  { id: 'mat_dust_swirl', name: 'Dust Swirl', emoji: '🌪️', type: 'alloy', rarity: 'common', windBonus: 1, vaultBonus: 3, value: 12, description: 'A concentrated ball of spinning dust particles, useful for basic wind manipulation.' },
  { id: 'mat_breeze_dewdrop', name: 'Breeze Dewdrop', emoji: '💧', type: 'essence', rarity: 'common', windBonus: 4, vaultBonus: 0, value: 18, description: 'A dewdrop carried by morning breezes. It evaporates slowly and carries wind essence.' },
  { id: 'mat_gale_dust', name: 'Gale Dust', emoji: '✨', type: 'alloy', rarity: 'common', windBonus: 3, vaultBonus: 2, value: 14, description: 'Fine metallic dust collected from gale-force winds. Essential for crafting wind talismans.' },
  { id: 'mat_silver_thread', name: 'Silver Thread', emoji: '🧵', type: 'feather', rarity: 'common', windBonus: 6, vaultBonus: 0, value: 20, description: 'A thread of condensed silver wind, used in weaving wind-resistant fabrics.' },
  { id: 'mat_cloud_moss', name: 'Cloud Moss', emoji: '🌿', type: 'essence', rarity: 'common', windBonus: 0, vaultBonus: 4, value: 8, description: 'Moss that grows only on floating cloud islands. It purifies wind currents.' },
  { id: 'mat_breeze_copper', name: 'Breeze Copper', emoji: '🔶', type: 'alloy', rarity: 'common', windBonus: 0, vaultBonus: 5, value: 16, description: 'Copper infused with gentle breeze energy. Conducts wind magic efficiently.' },

  // Unusual (7)
  { id: 'mat_storm_gem_fragment', name: 'Storm Gem Fragment', emoji: '💎', type: 'gem', rarity: 'unusual', windBonus: 15, vaultBonus: 0, value: 80, description: 'A chip of a storm-born gemstone. It crackles with contained lightning and wind energy.' },
  { id: 'mat_hawk_talon_shard', name: 'Hawk Talon Shard', emoji: '🦴', type: 'feather', rarity: 'unusual', windBonus: 5, vaultBonus: 12, value: 65, description: 'A shard from a gale hawk talon. Sharp enough to cut through wind barriers.' },
  { id: 'mat_zephyr_silk', name: 'Zephyr Silk', emoji: '🕸️', type: 'alloy', rarity: 'unusual', windBonus: 10, vaultBonus: 8, value: 90, description: 'Silk spun by wind spiders. Lighter than air and stronger than steel cable.' },
  { id: 'mat_wind_bell_core', name: 'Wind Bell Core', emoji: '🔔', type: 'wind_crystal', rarity: 'unusual', windBonus: 8, vaultBonus: 10, value: 75, description: 'The resonating core of an ancient wind bell. It hums at frequencies that calm storms.' },
  { id: 'mat_tempest_glass', name: 'Tempest Glass', emoji: '🪟', type: 'gem', rarity: 'unusual', windBonus: 12, vaultBonus: 6, value: 70, description: 'Glass forged within lightning storms. It refracts wind into visible patterns.' },
  { id: 'mat_breeze_essence', name: 'Breeze Essence', emoji: '🧪', type: 'essence', rarity: 'unusual', windBonus: 14, vaultBonus: 5, value: 85, description: 'Distilled essence of pure morning breeze. A single drop creates a refreshing gust.' },
  { id: 'mat_gale_alloy_ingot', name: 'Gale Alloy Ingot', emoji: '🟦', type: 'alloy', rarity: 'unusual', windBonus: 10, vaultBonus: 12, value: 72, description: 'An alloy of iron and condensed gale energy. Used in vault door construction.' },

  // Rare (6)
  { id: 'mat_cyclone_heart', name: 'Cyclone Heart', emoji: '💜', type: 'wind_crystal', rarity: 'rare', windBonus: 35, vaultBonus: 20, value: 350, description: 'The crystallized core of a dissipating cyclone. It pulses with immense rotational energy.' },
  { id: 'mat_phoenix_quill', name: 'Phoenix Quill', emoji: '🪶', type: 'feather', rarity: 'rare', windBonus: 20, vaultBonus: 30, value: 300, description: 'A feather from a fire-wind phoenix. It writes wisdom in flames on the wind.' },
  { id: 'mat_thunder_sapphire', name: 'Thunder Sapphire', emoji: '🔵', type: 'gem', rarity: 'rare', windBonus: 30, vaultBonus: 15, value: 320, description: 'A sapphire born from lightning strikes. It stores and releases electrical wind energy.' },
  { id: 'mat_spirit_wind_ore', name: 'Spirit Wind Ore', emoji: '⛏️', type: 'alloy', rarity: 'rare', windBonus: 25, vaultBonus: 25, value: 380, description: 'Rare ore found in high-altitude wind veins. Essential for crafting legendary vault keys.' },
  { id: 'mat_aurora_dust', name: 'Aurora Dust', emoji: '🌌', type: 'essence', rarity: 'rare', windBonus: 15, vaultBonus: 35, value: 400, description: 'Stardust collected from aurora borealis. It amplifies the wisdom of any wind spirit.' },
  { id: 'mat_wyrm_scale', name: 'Wyrm Scale', emoji: '🐉', type: 'feather', rarity: 'rare', windBonus: 28, vaultBonus: 18, value: 360, description: 'A scale shed by a cyclone wyrm during molting. It generates micro-tornadoes when struck.' },

  // Epic (5)
  { id: 'mat_void_wind_core', name: 'Void Wind Core', emoji: '🕳️', type: 'wind_crystal', rarity: 'epic', windBonus: 50, vaultBonus: 40, value: 1500, description: 'Wind energy harvested from the void between worlds. It creates localized reality distortions.' },
  { id: 'mat_storm_sovereign_gem', name: 'Storm Sovereign Gem', emoji: '💠', type: 'gem', rarity: 'epic', windBonus: 40, vaultBonus: 55, value: 1600, description: 'A gem containing the essence of a sovereign storm. It commands all lesser weather patterns.' },
  { id: 'mat_eternal_breeze_essence', name: 'Eternal Breeze Essence', emoji: '🌿', type: 'essence', rarity: 'epic', windBonus: 60, vaultBonus: 35, value: 1400, description: 'The distilled essence of the eternal spring breeze. It can restore any wind spirit to full power.' },
  { id: 'mat_celestial_alloy', name: 'Celestial Alloy', emoji: '⭐', type: 'alloy', rarity: 'epic', windBonus: 45, vaultBonus: 50, value: 1700, description: 'An alloy forged in the upper atmosphere using celestial wind currents. Nearly indestructible.' },
  { id: 'mat_chaos_crystal', name: 'Chaos Crystal', emoji: '🔮', type: 'wind_crystal', rarity: 'epic', windBonus: 55, vaultBonus: 45, value: 1800, description: 'A crystal containing pure chaotic wind energy. It amplifies all wind abilities but is unpredictable.' },

  // Legendary (4)
  { id: 'mat_zephyr_sovereign_crown', name: 'Zephyr Sovereign Crown', emoji: '👑', type: 'wind_crystal', rarity: 'legendary', windBonus: 100, vaultBonus: 80, value: 8000, description: 'The crown of the Zephyr Sovereign, forged from the first breath of the world. It grants dominion over all winds and can reshape weather across entire continents. Its mere presence calms the fiercest storms and awakens dormant wind spirits.' },
  { id: 'mat_world_wind_heart', name: 'World Wind Heart', emoji: '🌍', type: 'essence', rarity: 'legendary', windBonus: 90, vaultBonus: 90, value: 10000, description: 'The crystallized heart of the world wind — the perpetual current that circles the globe. It contains the memory of every breeze, gale, and storm that has ever existed.' },
  { id: 'mat_eternal_vault_key', name: 'Eternal Vault Key', emoji: '🗝️', type: 'alloy', rarity: 'legendary', windBonus: 70, vaultBonus: 120, value: 9000, description: 'A key that can unlock any vault in the wind realm. It was forged by the first Wind Caller and has been passed down through generations of sovereigns.' },
  { id: 'mat_primordial_wind_gem', name: 'Primordial Wind Gem', emoji: '💎', type: 'gem', rarity: 'legendary', windBonus: 80, vaultBonus: 100, value: 12000, description: 'The gem that contains the primordial wind — the very first breath of creation. Its power is limitless but dangerous to wield without proper mastery.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: ZV_STRUCTURES — 25 Vault Structures (max level 10)
// ═══════════════════════════════════════════════════════════════════

export const ZV_STRUCTURES: readonly ZvStructureDef[] = [
  // ── Wind Engine (7) ──────────────────────────────────────────
  { id: 'str_breeze_mill', name: 'Breeze Mill', emoji: '⛲', category: 'wind_engine', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4, description: 'A simple windmill that generates wind energy from the gentlest breezes. The first structure every vault keeper builds.' },
  { id: 'str_gale_turbine', name: 'Gale Turbine', emoji: '💨', category: 'wind_engine', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 100, costMultiplier: 1.5, description: 'A powerful turbine that harvests energy from gale-force winds. Requires sturdy anchoring.' },
  { id: 'str_zephyr_condenser', name: 'Zephyr Condenser', emoji: '❄️', category: 'wind_engine', maxLevel: 10, baseEffect: 6, effectPerLevel: 3, baseCost: 180, costMultiplier: 1.5, description: 'Condenses zephyr energy into usable wind crystals. Produces rare materials passively.' },
  { id: 'str_storm_capacitor', name: 'Storm Capacitor', emoji: '⚡', category: 'wind_engine', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 300, costMultiplier: 1.6, description: 'Stores and releases storm energy on demand. Essential for powering advanced vault mechanisms.' },
  { id: 'str_cyclone_generator', name: 'Cyclone Generator', emoji: '🌀', category: 'wind_engine', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 500, costMultiplier: 1.7, description: 'A massive generator that creates controlled cyclones. The pinnacle of wind engineering.' },
  { id: 'str_djinn_lamp_workshop', name: 'Djinn Lamp Workshop', emoji: '🪔', category: 'wind_engine', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 250, costMultiplier: 1.5, description: 'A workshop where wind djinn craft enchanted lamps that summon localized breezes on command.' },
  { id: 'str_serpent_coil_engine', name: 'Serpent Coil Engine', emoji: '🐍', category: 'wind_engine', maxLevel: 10, baseEffect: 7, effectPerLevel: 3, baseCost: 350, costMultiplier: 1.6, description: 'An engine modeled after calm serpent physiology. It converts chaotic wind into pure calm energy.' },

  // ── Spirit Nest (6) ──────────────────────────────────────────
  { id: 'str_fairy_grove', name: 'Fairy Grove', emoji: '🌳', category: 'spirit_nest', maxLevel: 10, baseEffect: 3, effectPerLevel: 2, baseCost: 80, costMultiplier: 1.4, description: 'A grove of enchanted trees where zephyr fairies nest and rest between summonings.' },
  { id: 'str_hawk_aerie', name: 'Hawk Aerie', emoji: '🏔️', category: 'spirit_nest', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 150, costMultiplier: 1.5, description: 'A towering aerie built on the highest accessible wind current. Gale hawks roost here exclusively.' },
  { id: 'str_wyrm_cavern', name: 'Wyrm Cavern', emoji: '🕳️', category: 'spirit_nest', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 400, costMultiplier: 1.6, description: 'A deep cavern system where cyclone wyrms coil and slumber. Its walls vibrate with trapped wind energy.' },
  { id: 'str_sprite_meadow', name: 'Sprite Meadow', emoji: '🌸', category: 'spirit_nest', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 100, costMultiplier: 1.4, description: 'A floating meadow where breeze sprites play and recharge. It drifts gently on thermal updrafts.' },
  { id: 'str_storm_stable', name: 'Storm Stable', emoji: '🐴', category: 'spirit_nest', maxLevel: 10, baseEffect: 6, effectPerLevel: 3, baseCost: 250, costMultiplier: 1.5, description: 'A reinforced stable built within a perpetual thunderstorm. Storm horses are bred and trained here.' },
  { id: 'str_djinn_palace', name: 'Djinn Palace', emoji: '🏰', category: 'spirit_nest', maxLevel: 10, baseEffect: 9, effectPerLevel: 4, baseCost: 600, costMultiplier: 1.7, description: 'A shifting palace of wind and illusion where tornado djinn reside. Its layout changes with every visit.' },

  // ── Vault Door (5) ──────────────────────────────────────────
  { id: 'str_breeze_gate', name: 'Breeze Gate', emoji: '🚪', category: 'vault_door', maxLevel: 10, baseEffect: 3, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.4, description: 'A gate of woven breeze strands. It opens only to those who speak the wind password softly.' },
  { id: 'str_gale_barrier', name: 'Gale Barrier', emoji: '🌪️', category: 'vault_door', maxLevel: 10, baseEffect: 7, effectPerLevel: 4, baseCost: 300, costMultiplier: 1.5, description: 'A barrier of perpetually blowing gale winds. Only spirits with sufficient wind power can push through.' },
  { id: 'str_storm_seal', name: 'Storm Seal', emoji: '⛈️', category: 'vault_door', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 600, costMultiplier: 1.7, description: 'A seal woven from living lightning. Attempting to force it results in a direct lightning strike.' },
  { id: 'str_cyclone_walls', name: 'Cyclone Walls', emoji: '🌀', category: 'vault_door', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 1000, costMultiplier: 1.8, description: 'Walls of spinning cyclone wind. To pass through, one must find the calm eye and walk without fear.' },
  { id: 'str_origin_windlock', name: 'Origin Windlock', emoji: '🗝️', category: 'vault_door', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1800, costMultiplier: 2.0, description: 'The original lock forged by the first Wind Caller. It opens only to the command of a true Zephyr Sovereign.' },

  // ── Temple Wing (4) ──────────────────────────────────────────
  { id: 'str_wind_shrine', name: 'Wind Shrine', emoji: '⛩️', category: 'temple_wing', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 200, costMultiplier: 1.5, description: 'A shrine where wind spirits come to meditate and grow their wind power. The air here hums with devotion.' },
  { id: 'str_zephyr_cathedral', name: 'Zephyr Cathedral', emoji: '⛪', category: 'temple_wing', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 500, costMultiplier: 1.6, description: 'A grand cathedral where the history of wind spirits is recorded in wind-carved stone tablets.' },
  { id: 'str_temple_of_calm', name: 'Temple of Calm', emoji: '☯️', category: 'temple_wing', maxLevel: 10, baseEffect: 15, effectPerLevel: 6, baseCost: 800, costMultiplier: 1.7, description: 'A temple of absolute serenity where even the angriest spirits find peace. Its calming aura extends for miles.' },
  { id: 'str_sovereign_sanctum', name: 'Sovereign Sanctum', emoji: '👑', category: 'temple_wing', maxLevel: 10, baseEffect: 20, effectPerLevel: 8, baseCost: 1200, costMultiplier: 1.8, description: 'The inner sanctum where the Zephyr Sovereign communes with the world wind. Its power is beyond mortal comprehension.' },

  // ── Treasury (3) ─────────────────────────────────────────────
  { id: 'str_wind_chest', name: 'Wind Chest', emoji: '📦', category: 'treasury', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 150, costMultiplier: 1.4, description: 'A chest that stores wind materials and prevents them from dissipating. Basic but essential for every vault.' },
  { id: 'str_vault_strongroom', name: 'Vault Strongroom', emoji: '🏦', category: 'treasury', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 400, costMultiplier: 1.6, description: 'A reinforced strongroom that protects the most valuable wind artifacts from theft and decay.' },
  { id: 'str_eternal_treasury', name: 'Eternal Treasury', emoji: '🏛️', category: 'treasury', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 900, costMultiplier: 1.8, description: 'A treasury that exists outside of time. Materials stored here never degrade and artifacts grow stronger over centuries.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: ZV_ABILITIES — 22 Wind Abilities
// ═══════════════════════════════════════════════════════════════════

export const ZV_ABILITIES: readonly ZvAbilityDef[] = [
  // ── Zephyr Fairy Abilities (3) ──────────────────────────────
  { id: 'fairy_dust', name: 'Fairy Dust', emoji: '✨', species: 'zephyr_fairy', type: 'active', rarity: 'common', windCost: 5, cooldown: 2, power: 8, description: 'Sprinkle shimmering dust that buffs nearby allies with gentle wind protection.' },
  { id: 'prism_gale', name: 'Prism Gale', emoji: '🌈', species: 'zephyr_fairy', type: 'active', rarity: 'rare', windCost: 20, cooldown: 8, power: 30, description: 'Channel a rainbow gale that refracts light into blinding prisms, dazzling all enemies.' },
  { id: 'mist_command', name: 'Mist Command', emoji: '🌫️', species: 'zephyr_fairy', type: 'passive', rarity: 'rare', windCost: 0, cooldown: 0, power: 25, description: 'Passively generates a mist shield that absorbs incoming damage and obscures vision.' },

  // ── Gale Hawk Abilities (3) ─────────────────────────────────
  { id: 'wind_slash', name: 'Wind Slash', emoji: '🗡️', species: 'gale_hawk', type: 'active', rarity: 'common', windCost: 8, cooldown: 3, power: 15, description: 'Launch a slashing blade of compressed wind that cuts through armor and barriers.' },
  { id: 'keen_sight', name: 'Keen Sight', emoji: '👁️', species: 'gale_hawk', type: 'passive', rarity: 'common', windCost: 0, cooldown: 0, power: 10, description: 'Gain permanent enhanced vision, revealing hidden enemies and traps across vast distances.' },
  { id: 'tornado_talons', name: 'Tornado Talons', emoji: '🦅', species: 'gale_hawk', type: 'active', rarity: 'unusual', windCost: 25, cooldown: 10, power: 40, description: 'Dive with spinning talons that generate a focused tornado on impact, devastating everything below.' },

  // ── Cyclone Wyrm Abilities (3) ──────────────────────────────
  { id: 'dust_breath', name: 'Dust Breath', emoji: '💨', species: 'cyclone_wyrm', type: 'active', rarity: 'common', windCost: 6, cooldown: 4, power: 12, description: 'Exhale a cloud of abrasive dust that blinds and damages enemies in a cone.' },
  { id: 'vortex_strike', name: 'Vortex Strike', emoji: '🌀', species: 'cyclone_wyrm', type: 'active', rarity: 'unusual', windCost: 18, cooldown: 7, power: 28, description: 'Strike with the full force of a wind vortex, lifting targets and slamming them repeatedly.' },
  { id: 'thunder_coil_attack', name: 'Thunder Coil', emoji: '⚡', species: 'cyclone_wyrm', type: 'active', rarity: 'rare', windCost: 30, cooldown: 12, power: 50, description: 'Wrap the enemy in electrified coils that discharge lightning on every constriction.' },

  // ── Breeze Sprite Abilities (3) ─────────────────────────────
  { id: 'giggle_burst', name: 'Giggle Burst', emoji: '😊', species: 'breeze_sprite', type: 'active', rarity: 'common', windCost: 4, cooldown: 2, power: 6, description: 'Release a burst of giggling wind that disorients enemies and heals allies slightly.' },
  { id: 'soothing_sigh', name: 'Soothing Sigh', emoji: '🌬️', species: 'breeze_sprite', type: 'active', rarity: 'common', windCost: 8, cooldown: 5, power: 18, description: 'Let out a deep sigh that creates a calming breeze, healing all allies within range.' },
  { id: 'frost_touch', name: 'Frost Touch', emoji: '❄️', species: 'breeze_sprite', type: 'active', rarity: 'unusual', windCost: 15, cooldown: 6, power: 22, description: 'Touch a target with frost-laced wind, slowing them and dealing ice-wind damage over time.' },

  // ── Storm Horse Abilities (3) ───────────────────────────────
  { id: 'thunder_hoof', name: 'Thunder Hoof', emoji: '🐎', species: 'storm_horse', type: 'active', rarity: 'common', windCost: 10, cooldown: 4, power: 18, description: 'Strike the ground with electrified hooves, sending shockwaves through the earth and air.' },
  { id: 'wind_charge', name: 'Wind Charge', emoji: '💨', species: 'storm_horse', type: 'active', rarity: 'common', windCost: 12, cooldown: 5, power: 20, description: 'Charge forward on a wave of wind, trampling enemies and leaving a trail of electricity.' },
  { id: 'lightning_mane', name: 'Lightning Mane', emoji: '⚡', species: 'storm_horse', type: 'passive', rarity: 'unusual', windCost: 0, cooldown: 0, power: 15, description: 'Passively crackles with lightning that damages nearby enemies and powers up allies.' },

  // ── Tornado Djinn Abilities (3) ─────────────────────────────
  { id: 'dust_illusion', name: 'Dust Illusion', emoji: '👻', species: 'tornado_djinn', type: 'active', rarity: 'common', windCost: 7, cooldown: 3, power: 10, description: 'Create illusory duplicates using swirling dust, confusing enemies about your true position.' },
  { id: 'wind_disappear', name: 'Wind Disappear', emoji: '💨', species: 'tornado_djinn', type: 'active', rarity: 'common', windCost: 10, cooldown: 6, power: 12, description: 'Dissolve into wind particles, becoming invisible and immune to physical attacks briefly.' },
  { id: 'vortex_prison', name: 'Vortex Prison', emoji: '🌀', species: 'tornado_djinn', type: 'active', rarity: 'unusual', windCost: 22, cooldown: 10, power: 35, description: 'Imprison a target in a spinning vortex of wind, immobilizing them for several seconds.' },

  // ── Calm Serpent Abilities (3) ──────────────────────────────
  { id: 'calm_aura', name: 'Calm Aura', emoji: '☯️', species: 'calm_serpent', type: 'passive', rarity: 'common', windCost: 0, cooldown: 0, power: 8, description: 'Passively radiate a calming aura that reduces enemy aggression and prevents panic.' },
  { id: 'storm_quell', name: 'Storm Quell', emoji: '🌤️', species: 'calm_serpent', type: 'active', rarity: 'unusual', windCost: 20, cooldown: 8, power: 32, description: 'Release a wave of absolute calm that suppresses all enemy abilities and weather effects.' },
  { id: 'harmony_blessing', name: 'Harmony Blessing', emoji: '🕊️', species: 'calm_serpent', type: 'active', rarity: 'rare', windCost: 35, cooldown: 15, power: 45, description: 'Bless allies with perfect harmony, granting immunity to debuffs and doubling healing effects.' },

  // ── Legendary Universal Abilities (1) ───────────────────────
  { id: 'sovereign_wind_command', name: 'Sovereign Wind Command', emoji: '👑', species: 'zephyr_fairy', type: 'active', rarity: 'legendary', windCost: 100, cooldown: 30, power: 100, description: 'The ultimate ability available only to the Zephyr Sovereign. Commands all winds in existence, reshaping weather and dominating every wind spirit in range.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: ZV_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const ZV_ACHIEVEMENTS: readonly ZvAchievementDef[] = [
  { id: 'ach_first_summon', name: 'First Whisper', emoji: '🌬️', description: 'Summon your very first wind spirit.', condition: 'totalSummoned', reward: { windPower: 20, renown: 10 } },
  { id: 'ach_summon_10', name: 'Wind Caller Apprentice', emoji: '🧚', description: 'Summon a total of 10 wind spirits.', condition: 'totalSummoned', reward: { windPower: 100, renown: 50 } },
  { id: 'ach_summon_30', name: 'Spirit Herder', emoji: '🐴', description: 'Summon 30 wind spirits across all species.', condition: 'totalSummoned', reward: { windPower: 300, renown: 200 } },
  { id: 'ach_summon_100', name: 'Master of Winds', emoji: '🌪️', description: 'Summon 100 wind spirits total.', condition: 'totalSummoned', reward: { windPower: 1000, renown: 500 } },
  { id: 'ach_first_vault', name: 'Vault Cracker', emoji: '🚪', description: 'Open your first airborne vault.', condition: 'vaultsOpened', reward: { windPower: 30, renown: 15 } },
  { id: 'ach_all_vaults', name: 'Vault Conqueror', emoji: '🏛️', description: 'Open all 8 airborne vaults.', condition: 'vaultsOpened', reward: { windPower: 500, renown: 400 } },
  { id: 'ach_first_structure', name: 'Wind Builder', emoji: '🏗️', description: 'Build your first vault structure.', condition: 'totalBuilt', reward: { windPower: 25, renown: 20 } },
  { id: 'ach_10_structures', name: 'Architect of Breezes', emoji: '🏰', description: 'Build 10 vault structures.', condition: 'totalBuilt', reward: { windPower: 200, renown: 150 } },
  { id: 'ach_max_structure', name: 'Master Builder', emoji: '🗼', description: 'Fully upgrade a structure to maximum level.', condition: 'maxStructureLevel', reward: { windPower: 150, renown: 100 } },
  { id: 'ach_first_forge', name: 'Breeze Smith', emoji: '🔨', description: 'Forge your first breeze material.', condition: 'totalForged', reward: { windPower: 20, renown: 15 } },
  { id: 'ach_forge_50', name: 'Wind Alchemist', emoji: '⚗️', description: 'Forge materials 50 times total.', condition: 'totalForged', reward: { windPower: 250, renown: 180 } },
  { id: 'ach_first_artifact', name: 'Artifact Hunter', emoji: '🏺', description: 'Collect your first legendary artifact.', condition: 'artifactsCollected', reward: { windPower: 100, renown: 50 } },
  { id: 'ach_5_artifacts', name: 'Relic Keeper', emoji: '💎', description: 'Collect 5 legendary artifacts.', condition: 'artifactsCollected', reward: { windPower: 500, renown: 300 } },
  { id: 'ach_all_species', name: 'Full Spectrum', emoji: '🌈', description: 'Recruit at least one spirit from each of the 7 species.', condition: 'allSpeciesRecruited', reward: { windPower: 200, renown: 200 } },
  { id: 'ach_legendary_spirit', name: 'Mythic Summoner', emoji: '👑', description: 'Summon a legendary-tier wind spirit.', condition: 'legendarySummoned', reward: { windPower: 400, renown: 250 } },
  { id: 'ach_10_events', name: 'Storm Survivor', emoji: '⛈️', description: 'Face and survive 10 wind events.', condition: 'totalEventsFaced', reward: { windPower: 300, renown: 200 } },
  { id: 'ach_title_sovereign', name: 'Sovereign Ascendant', emoji: '🏆', description: 'Achieve the title of Zephyr Sovereign.', condition: 'titleUnlocked', reward: { windPower: 1000, renown: 1000 } },
  { id: 'ach_all_abilities', name: 'Wind Mastery', emoji: '📜', description: 'Unlock all 22 wind abilities.', condition: 'allAbilitiesUnlocked', reward: { windPower: 800, renown: 600 } },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: ZV_TITLES — 8 Wind Titles
// ═══════════════════════════════════════════════════════════════════

export const ZV_TITLES: readonly ZvTitleDef[] = [
  { id: 'title_wind_caller', name: 'Wind Caller', emoji: '🌬️', minRenown: 0, minSpirits: 1, description: 'The humble beginning. A mortal who has heard the wind and learned to call its name.' },
  { id: 'title_breeze_weaver', name: 'Breeze Weaver', emoji: '🧶', minRenown: 100, minSpirits: 3, description: 'One who can weave gentle breezes into protective barriers and healing winds.' },
  { id: 'title_gale_rider', name: 'Gale Rider', emoji: '🦅', minRenown: 300, minSpirits: 6, description: 'A rider who mounts gale-force winds and commands them with confident authority.' },
  { id: 'title_storm_scout', name: 'Storm Scout', emoji: '⚡', minRenown: 600, minSpirits: 10, description: 'A scout who ventures fearlessly into the heart of storms to gather intelligence.' },
  { id: 'title_tempest_keeper', name: 'Tempest Keeper', emoji: '🌩️', minRenown: 1000, minSpirits: 15, description: 'A keeper who maintains and controls tempests, preventing catastrophic weather.' },
  { id: 'title_cyclone_lord', name: 'Cyclone Lord', emoji: '🌀', minRenown: 1800, minSpirits: 20, description: 'A lord who commands cyclones at will, reshaping the weather of entire regions.' },
  { id: 'title_wind_sovereign', name: 'Wind Sovereign', emoji: '👑', minRenown: 3000, minSpirits: 28, description: 'A sovereign who holds dominion over all winds within their realm. The penultimate rank.' },
  { id: 'title_zephyr_sovereign', name: 'Zephyr Sovereign', emoji: '🌟', minRenown: 5000, minSpirits: 35, description: 'The supreme ruler of all wind spirits and vaults. The Zephyr Sovereign commands the eternal wind itself and carries the treasury of the world upon infinite breezes.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: ZV_ARTIFACTS — 15 Legendary Artifacts
// ═══════════════════════════════════════════════════════════════════

export const ZV_ARTIFACTS: readonly ZvArtifactDef[] = [
  { id: 'art_wind_callers_horn', name: "Wind Caller's Horn", emoji: '📯', rarity: 'unusual', species: 'zephyr_fairy', windBoost: 20, vaultBoost: 10, enduranceBoost: 5, value: 500, description: 'An ancient horn carved from a cloud. When blown, it summons the nearest wind spirit instantly.' },
  { id: 'art_gale_hawk_plume', name: 'Gale Hawk Plume', emoji: '🪶', rarity: 'rare', species: 'gale_hawk', windBoost: 30, vaultBoost: 15, enduranceBoost: 10, value: 800, description: 'A silver plume from a legendary gale hawk. It grants its bearer the speed of the wind.' },
  { id: 'art_cyclone_scale_armor', name: 'Cyclone Scale Armor', emoji: '🛡️', rarity: 'rare', species: 'cyclone_wyrm', windBoost: 15, vaultBoost: 30, enduranceBoost: 25, value: 900, description: 'Armor made from cyclone wyrm scales. It deflects wind-based attacks and generates a protective vortex.' },
  { id: 'art_dawn_breeze_vial', name: 'Dawn Breeze Vial', emoji: '🧪', rarity: 'unusual', species: 'breeze_sprite', windBoost: 25, vaultBoost: 5, enduranceBoost: 15, value: 600, description: 'A vial containing captured dawn breeze. Its contents can heal any wind spirit to full health.' },
  { id: 'art_thunder_horseshoe', name: 'Thunder Horseshoe', emoji: '🧲', rarity: 'rare', species: 'storm_horse', windBoost: 35, vaultBoost: 20, enduranceBoost: 20, value: 1000, description: 'A horseshoe from a thunder stallion. It generates static electricity that powers all vault mechanisms.' },
  { id: 'art_djinn_lamp', name: 'Djinn Lamp', emoji: '🪔', rarity: 'unusual', species: 'tornado_djinn', windBoost: 18, vaultBoost: 25, enduranceBoost: 8, value: 700, description: 'A lamp that houses a friendly tornado djinn. It can create localized wind illusions on command.' },
  { id: 'art_calm_serpent_orb', name: 'Calm Serpent Orb', emoji: '🔮', rarity: 'rare', species: 'calm_serpent', windBoost: 10, vaultBoost: 10, enduranceBoost: 40, value: 850, description: 'An orb containing a calm serpent aura. It provides complete immunity to wind debuffs.' },
  { id: 'art_eye_of_the_storm', name: 'Eye of the Storm', emoji: '👁️', rarity: 'epic', species: 'cyclone_wyrm', windBoost: 50, vaultBoost: 35, enduranceBoost: 30, value: 2500, description: 'The eye of the primordial storm. It reveals all hidden vault chambers and illuminates secret paths.' },
  { id: 'art_zephyr_crown', name: 'Zephyr Crown', emoji: '👑', rarity: 'epic', species: 'zephyr_fairy', windBoost: 40, vaultBoost: 40, enduranceBoost: 25, value: 2800, description: 'A crown woven from living zephyrs. It grants authority over all fairy spirits and increases summoning success.' },
  { id: 'art_storm_forge_hammer', name: 'Storm Forge Hammer', emoji: '🔨', rarity: 'epic', species: 'storm_horse', windBoost: 30, vaultBoost: 50, enduranceBoost: 35, value: 2600, description: 'A hammer forged in perpetual lightning. It upgrades any vault structure with a single strike.' },
  { id: 'art_eternal_wind_map', name: 'Eternal Wind Map', emoji: '🗺️', rarity: 'epic', species: 'tornado_djinn', windBoost: 35, vaultBoost: 30, enduranceBoost: 20, value: 2200, description: 'A map that shows all wind currents in real-time. It reveals the optimal path to any vault.' },
  { id: 'art_world_serpent_fang', name: 'World Serpent Fang', emoji: '🐍', rarity: 'legendary', species: 'cyclone_wyrm', windBoost: 80, vaultBoost: 60, enduranceBoost: 50, value: 8000, description: 'A fang from the World Serpent itself. It contains the raw power of the global jet stream and can summon catastrophic winds on command.' },
  { id: 'art_aurora_mothers_wings', name: "Aurora Mother's Wings", emoji: '🌌', rarity: 'legendary', species: 'zephyr_fairy', windBoost: 70, vaultBoost: 70, enduranceBoost: 40, value: 9000, description: 'A pair of translucent wings from the Aurora Mother. Their light can banish any darkness and their wind can reach any corner of the world.' },
  { id: 'art_sky_sovereigns_talon', name: "Sky Sovereign's Talon", emoji: '🦅', rarity: 'legendary', species: 'gale_hawk', windBoost: 100, vaultBoost: 50, enduranceBoost: 60, value: 10000, description: 'The right talon of the Sky Sovereign. It grants ultimate authority over all aerial spirits and can slice through the fabric of reality itself.' },
  { id: 'art_omniscient_coils_ring', name: 'Omniscient Coil Ring', emoji: '💍', rarity: 'legendary', species: 'calm_serpent', windBoost: 60, vaultBoost: 80, enduranceBoost: 70, value: 12000, description: 'A ring shaped like the coil of the Omniscient Coil. It grants perfect wisdom, unlimited endurance regeneration, and reveals every secret in the wind realm.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: ZV_EVENTS — 12 Wind Events
// ═══════════════════════════════════════════════════════════════════

export const ZV_EVENTS: readonly ZvEventDef[] = [
  { id: 'evt_zephyr_migration', name: 'Zephyr Migration', emoji: '🦋', durationTurns: 5, effectType: 'buff', effectDescription: 'All zephyr fairy spirits gain double wind power for 5 turns.', description: 'A massive migration of zephyr fairies passes through the vault, boosting all fairy spirits with renewed energy and ancient wisdom.' },
  { id: 'evt_gale_season', name: 'Gale Season', emoji: '🌪️', durationTurns: 4, effectType: 'buff', effectDescription: 'Gale hawks gain +50% speed and vault opening success for 4 turns.', description: 'The annual gale season arrives, bringing fierce winds that empower hawk spirits and blow open weakened vault doors.' },
  { id: 'evt_cyclone_awakening', name: 'Cyclone Awakening', emoji: '🌀', durationTurns: 6, effectType: 'special', effectDescription: 'A sleeping cyclone wyrm stirs, reshaping vault layouts for 6 turns.', description: 'A dormant cyclone wyrm awakens deep within the wind realm. Its stirring reshapes wind patterns and opens temporary passages to hidden vaults.' },
  { id: 'evt_wind_drought', name: 'Wind Drought', emoji: '☀️', durationTurns: 3, effectType: 'debuff', effectDescription: 'All wind power generation is halved for 3 turns.', description: 'The wind stops completely for three days. Wind engines stall, spirits grow weak, and vault mechanisms grind to a halt.' },
  { id: 'evt_storm_invasion', name: 'Storm Invasion', emoji: '⛈️', durationTurns: 5, effectType: 'debuff', effectDescription: 'Enemy storm spirits attack, draining 10% wind power per turn for 5 turns.', description: 'A rogue storm army invades the vault territory, siphoning wind power and threatening to breach vault defenses.' },
  { id: 'evt_breeze_festival', name: 'Breeze Festival', emoji: '🎐', durationTurns: 4, effectType: 'buff', effectDescription: 'Material drop rates doubled and training costs halved for 4 turns.', description: 'The annual breeze festival brings abundant wind materials and joyful spirits. A time of celebration and rapid growth.' },
  { id: 'evt_void_wind_rift', name: 'Void Wind Rift', emoji: '🕳️', durationTurns: 7, effectType: 'special', effectDescription: 'A rift opens, granting access to rare void materials for 7 turns.', description: 'A rift to the void between worlds opens near the vault. Strange void-wind materials seep through, offering rare crafting opportunities but carrying unknown dangers.' },
  { id: 'evt_djinn_trick', name: 'Djinn Trick', emoji: '🧞', durationTurns: 2, effectType: 'debuff', effectDescription: 'Random vaults become misaligned and harder to open for 2 turns.', description: 'A mischievous djinn plays tricks on the vault mechanisms, shuffling vault seals and making navigation treacherous.' },
  { id: 'evt_serpent_awakening', name: 'Serpent Awakening', emoji: '🐍', durationTurns: 5, effectType: 'buff', effectDescription: 'All calm serpent spirits gain triple wisdom for 5 turns.', description: 'The ancient calm serpents enter a period of heightened awareness, sharing their boundless wisdom with all who listen.' },
  { id: 'evt_thunder_rally', name: 'Thunder Rally', emoji: '⚡', durationTurns: 4, effectType: 'buff', effectDescription: 'Storm horse spirits gain charge ability and +30% endurance for 4 turns.', description: 'The storm horses rally their forces, thundering across the sky with renewed ferocity. Their war cry echoes across every vault.' },
  { id: 'evt_aurora_convergence', name: 'Aurora Convergence', emoji: '🌌', durationTurns: 6, effectType: 'special', effectDescription: 'All abilities have zero wind cost for 6 turns.', description: 'The aurora borealis descends to the wind realm, creating a convergence of light and wind that eliminates all ability costs temporarily.' },
  { id: 'evt_vault_storm', name: 'Vault Storm', emoji: '🌩️', durationTurns: 8, effectType: 'special', effectDescription: 'All vaults have double rewards but double threat for 8 turns.', description: 'A massive storm engulfs every vault simultaneously. Danger is extreme but so are the rewards for those brave enough to enter.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: INTERNAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const ZV_INITIAL_WIND_POWER = 100
const ZV_INITIAL_RENOWN = 0
const ZV_MAX_STRUCTURE_LEVEL = 10
const ZV_MAX_SPIRIT_LEVEL = 50
const ZV_XP_PER_LEVEL_BASE = 80
const ZV_SUMMON_BASE_COST = 30
const ZV_FORGE_ENDURANCE_COST = 20
const ZV_TRAIN_BASE_COST = 20

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function zvRarityMultiplier(rarity: ZvRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'unusual': return 2
    case 'rare': return 5
    case 'epic': return 10
    case 'legendary': return 25
    default: return 1
  }
}

function zvRarityColor(rarity: ZvRarity): string {
  switch (rarity) {
    case 'common': return '#C0C0C0'
    case 'unusual': return '#98FF98'
    case 'rare': return '#20B2AA'
    case 'epic': return '#8A2BE2'
    case 'legendary': return '#FFD700'
    default: return '#C0C0C0'
  }
}

function zvSpeciesColor(species: ZvSpecies): string {
  switch (species) {
    case 'zephyr_fairy': return ZV_ZEPHYR_TEAL
    case 'gale_hawk': return ZV_GALE_SILVER
    case 'cyclone_wyrm': return ZV_STORM_VIOLET
    case 'breeze_sprite': return ZV_BREEZE_MINT
    case 'storm_horse': return ZV_DAWN_AMBER
    case 'tornado_djinn': return ZV_TWILIGHT_INDIGO
    case 'calm_serpent': return ZV_MIST_SAGE
    default: return '#888888'
  }
}

function zvCalcStats(species: ZvWindSpiritDef, level: number): {
  windPower: number
  wisdom: number
  speed: number
  endurance: number
} {
  const growth = 1 + (level - 1) * 0.12
  return {
    windPower: Math.floor(species.windPower * growth),
    wisdom: Math.floor(species.wisdom * growth),
    speed: Math.floor(species.speed * growth),
    endurance: Math.floor(species.endurance * growth),
  }
}

function zvCalcStructureUpgradeCost(
  def: ZvStructureDef,
  currentLevel: number
): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

let _zvIdCounter = 0
function zvGenerateId(): string {
  _zvIdCounter += 1
  return `zv_${_zvIdCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`
}

function zvFindSpirit(id: string): ZvWindSpiritDef | undefined {
  return ZV_WINDS.find((s) => s.id === id)
}

function zvFindVault(id: string): ZvVaultDef | undefined {
  return ZV_VAULTS.find((z) => z.id === id)
}

function zvFindMaterial(id: string): ZvMaterialDef | undefined {
  return ZV_MATERIALS.find((m) => m.id === id)
}

function zvFindStructureDef(id: string): ZvStructureDef | undefined {
  return ZV_STRUCTURES.find((s) => s.id === id)
}

function zvFindAbility(id: string): ZvAbilityDef | undefined {
  return ZV_ABILITIES.find((a) => a.id === id)
}

function zvFindArtifact(id: string): ZvArtifactDef | undefined {
  return ZV_ARTIFACTS.find((a) => a.id === id)
}

function zvFindAchievement(id: string): ZvAchievementDef | undefined {
  return ZV_ACHIEVEMENTS.find((a) => a.id === id)
}

function zvFindTitle(id: ZvTitleId): ZvTitleDef | undefined {
  return ZV_TITLES.find((t) => t.id === id)
}

function zvCheckSynergy(a: ZvSpecies, b: ZvSpecies): boolean {
  return ZV_SYNERGY_MAP[a]?.includes(b) ?? false
}

function zvGetXpForLevel(level: number): number {
  if (level <= 1) return 0
  if (level > ZV_MAX_SPIRIT_LEVEL) return Infinity
  return Math.floor(ZV_XP_PER_LEVEL_BASE * level * (1 + level * 0.15))
}

function zvCheckAchievementCondition(condition: string, state: ZvStoreState): boolean {
  switch (condition) {
    case 'totalSummoned':
      return state.totalSummoned >= 10
    case 'vaultsOpened':
      return state.vaults.length >= 8
    case 'totalBuilt':
      return state.totalBuilt >= 10
    case 'maxStructureLevel': {
      for (const s of state.structures) {
        if (s.level >= ZV_MAX_STRUCTURE_LEVEL) return true
      }
      return false
    }
    case 'totalForged':
      return state.totalForged >= 50
    case 'artifactsCollected':
      return state.artifacts.length >= 5
    case 'allSpeciesRecruited': {
      const speciesSet = new Set<string>()
      for (const sp of state.spirits) {
        speciesSet.add(sp.speciesId)
      }
      return speciesSet.size >= 7
    }
    case 'legendarySummoned': {
      for (const sp of state.spirits) {
        const def = zvFindSpirit(sp.speciesId)
        if (def && def.rarity === 'legendary') return true
      }
      return false
    }
    case 'totalEventsFaced':
      return state.totalEventsFaced >= 10
    case 'titleUnlocked': {
      const currentIdx = ZV_TITLES.findIndex((t) => t.id === state.currentTitle)
      return currentIdx >= ZV_TITLES.length - 1
    }
    case 'allAbilitiesUnlocked':
      return state.abilities.length >= ZV_ABILITIES.length
    default:
      return false
  }
}

function zvPickRandomEvent(): ZvEventDef {
  const idx = Math.floor(Math.random() * ZV_EVENTS.length)
  return ZV_EVENTS[idx]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: ZUSTAND STORE — useZvStore
// ═══════════════════════════════════════════════════════════════════

const useZvStore = create<ZvFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      spirits: [] as ZvSpiritInstance[],
      vaults: [] as string[],
      materials: [] as { materialId: string; count: number }[],
      structures: [] as ZvStructureInstance[],
      abilities: [] as string[],
      achievements: [] as string[],
      artifacts: [] as string[],
      currentTitle: 'title_wind_caller' as ZvTitleId,
      windPower: ZV_INITIAL_WIND_POWER,
      renown: ZV_INITIAL_RENOWN,
      totalSummoned: 0,
      totalForged: 0,
      totalBuilt: 0,
      totalEventsFaced: 0,
      activeEvent: null as ZvEventDef | null,
      eventTurnsRemaining: 0,
      activeVault: null as string | null,

      // ── zvSummonWind ──────────────────────────────────────────
      zvSummonWind: (speciesId: string): boolean => {
        const species = zvFindSpirit(speciesId)
        if (!species) return false
        const cost = Math.floor(ZV_SUMMON_BASE_COST * zvRarityMultiplier(species.rarity))
        const state = get()
        if (state.windPower < cost) return false
        const stats = zvCalcStats(species, 1)
        const newSpirit: ZvSpiritInstance = {
          id: zvGenerateId(),
          speciesId,
          name: species.name,
          level: 1,
          xp: 0,
          windPower: stats.windPower,
          wisdom: stats.wisdom,
          speed: stats.speed,
          endurance: stats.endurance,
          morale: 100,
          recruitedAt: Date.now(),
        }
        set((prev) => ({
          spirits: [...prev.spirits, newSpirit],
          windPower: prev.windPower - cost,
          renown: prev.renown + Math.floor(zvRarityMultiplier(species.rarity) * 5),
          totalSummoned: prev.totalSummoned + 1,
        }))
        return true
      },

      // ── zvDismissSpirit ───────────────────────────────────────
      zvDismissSpirit: (spiritId: string): boolean => {
        const state = get()
        const spirit = state.spirits.find((s) => s.id === spiritId)
        if (!spirit) return false
        const species = zvFindSpirit(spirit.speciesId)
        const refund = species ? Math.floor(ZV_SUMMON_BASE_COST * zvRarityMultiplier(species.rarity) * 0.5) : 10
        set((prev) => ({
          spirits: prev.spirits.filter((s) => s.id !== spiritId),
          windPower: prev.windPower + refund,
        }))
        return true
      },

      // ── zvTrainSpirit ─────────────────────────────────────────
      zvTrainSpirit: (spiritId: string): boolean => {
        const state = get()
        const spirit = state.spirits.find((s) => s.id === spiritId)
        if (!spirit) return false
        if (spirit.level >= ZV_MAX_SPIRIT_LEVEL) return false
        const species = zvFindSpirit(spirit.speciesId)
        if (!species) return false
        const trainCost = Math.floor(ZV_TRAIN_BASE_COST * spirit.level)
        if (state.windPower < trainCost) return false
        const xpGain = Math.floor(20 + spirit.level * 5)
        let currentXp = spirit.xp + xpGain
        let newLevel = spirit.level
        const xpNeeded = zvGetXpForLevel(spirit.level + 1)
        if (currentXp >= xpNeeded && spirit.level < ZV_MAX_SPIRIT_LEVEL) {
          currentXp -= xpNeeded
          newLevel = spirit.level + 1
        }
        const stats = zvCalcStats(species, newLevel)
        set((prev) => ({
          spirits: prev.spirits.map((s) => {
            if (s.id !== spiritId) return s
            return {
              ...s,
              level: newLevel,
              xp: currentXp,
              windPower: stats.windPower,
              wisdom: stats.wisdom,
              speed: stats.speed,
              endurance: stats.endurance,
              morale: Math.min(100, s.morale + 10),
            }
          }),
          windPower: prev.windPower - trainCost,
          renown: prev.renown + 2,
        }))
        return true
      },

      // ── zvFlyGale ─────────────────────────────────────────────
      zvFlyGale: (spiritId: string): boolean => {
        const state = get()
        const spirit = state.spirits.find((s) => s.id === spiritId)
        if (!spirit) return false
        if (spirit.endurance < ZV_FORGE_ENDURANCE_COST) return false
        const species = zvFindSpirit(spirit.speciesId)
        if (!species) return false
        const windGain = Math.ceil(spirit.speed / 10) + Math.floor(spirit.level * 0.5)
        set((prev) => ({
          windPower: prev.windPower + windGain,
          renown: prev.renown + 3,
          spirits: prev.spirits.map((s) =>
            s.id === spiritId ? { ...s, endurance: Math.max(0, s.endurance - ZV_FORGE_ENDURANCE_COST) } : s
          ),
        }))
        return true
      },

      // ── zvForgeBreeze ─────────────────────────────────────────
      zvForgeBreeze: (spiritId: string): boolean => {
        const state = get()
        const spirit = state.spirits.find((s) => s.id === spiritId)
        if (!spirit) return false
        if (spirit.endurance < ZV_FORGE_ENDURANCE_COST) return false
        const species = zvFindSpirit(spirit.speciesId)
        if (!species) return false
        const materialId = `mat_${species.species}_alloy`
        const existingMaterial = state.materials.find((m) => m.materialId === materialId)
        const amount = Math.ceil(spirit.windPower / 10)
        set((prev) => ({
          materials: existingMaterial
            ? prev.materials.map((m) => (m.materialId === materialId ? { ...m, count: m.count + amount } : m))
            : [...prev.materials, { materialId, count: amount }],
          totalForged: prev.totalForged + 1,
          renown: prev.renown + 3,
          spirits: prev.spirits.map((s) =>
            s.id === spiritId ? { ...s, endurance: Math.max(0, s.endurance - ZV_FORGE_ENDURANCE_COST) } : s
          ),
        }))
        return true
      },

      // ── zvBuildStructure ──────────────────────────────────────
      zvBuildStructure: (structureDefId: string): boolean => {
        const def = zvFindStructureDef(structureDefId)
        if (!def) return false
        const state = get()
        if (state.windPower < def.baseCost) return false
        const alreadyBuilt = state.structures.find((s) => s.structureDefId === structureDefId)
        if (alreadyBuilt) return false
        const newStructure: ZvStructureInstance = {
          id: zvGenerateId(),
          structureDefId,
          level: 1,
          builtAt: Date.now(),
        }
        set((prev) => ({
          structures: [...prev.structures, newStructure],
          windPower: prev.windPower - def.baseCost,
          totalBuilt: prev.totalBuilt + 1,
          renown: prev.renown + 10,
        }))
        return true
      },

      // ── zvUpgradeStructure ────────────────────────────────────
      zvUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structure = state.structures.find((s) => s.id === structureId)
        if (!structure) return false
        if (structure.level >= ZV_MAX_STRUCTURE_LEVEL) return false
        const def = zvFindStructureDef(structure.structureDefId)
        if (!def) return false
        const cost = zvCalcStructureUpgradeCost(def, structure.level)
        if (state.windPower < cost) return false
        set((prev) => ({
          structures: prev.structures.map((s) =>
            s.id === structureId ? { ...s, level: s.level + 1 } : s
          ),
          windPower: prev.windPower - cost,
          renown: prev.renown + Math.floor(def.effectPerLevel * 2),
        }))
        return true
      },

      // ── zvOpenVault ───────────────────────────────────────────
      zvOpenVault: (vaultId: string): ZvEventDef | null => {
        const vault = zvFindVault(vaultId)
        if (!vault) return null
        const state = get()
        const requiredTitleIdx = ZV_TITLES.findIndex((t) => t.id === vault.requiredTitle)
        const currentTitleIdx = ZV_TITLES.findIndex((t) => t.id === state.currentTitle)
        if (currentTitleIdx < requiredTitleIdx) return null
        const newVaults = state.vaults.includes(vaultId) ? state.vaults : [...state.vaults, vaultId]
        const event = zvPickRandomEvent()
        set((prev) => ({
          vaults: newVaults,
          activeVault: vaultId,
          activeEvent: event,
          eventTurnsRemaining: event.durationTurns,
          totalEventsFaced: prev.totalEventsFaced + 1,
          renown: prev.renown + vault.threatLevel * 20,
          windPower: prev.windPower + vault.threatLevel * 15,
        }))
        return event
      },

      // ── zvCollectArtifact ─────────────────────────────────────
      zvCollectArtifact: (artifactId: string): boolean => {
        const artifact = zvFindArtifact(artifactId)
        if (!artifact) return false
        const state = get()
        if (state.artifacts.includes(artifactId)) return false
        const cost = Math.floor(artifact.value * 0.3)
        if (state.windPower < cost) return false
        set((prev) => ({
          artifacts: [...prev.artifacts, artifactId],
          windPower: prev.windPower - cost,
          renown: prev.renown + Math.floor(zvRarityMultiplier(artifact.rarity) * 15),
        }))
        return true
      },

      // ── zvUnlockAbility ───────────────────────────────────────
      zvUnlockAbility: (abilityId: string): boolean => {
        const ability = zvFindAbility(abilityId)
        if (!ability) return false
        const state = get()
        if (state.abilities.includes(abilityId)) return false
        const cost = Math.floor(100 * zvRarityMultiplier(ability.rarity))
        if (state.windPower < cost) return false
        set((prev) => ({
          abilities: [...prev.abilities, abilityId],
          windPower: prev.windPower - cost,
          renown: prev.renown + Math.floor(zvRarityMultiplier(ability.rarity) * 8),
        }))
        return true
      },

      // ── zvUnlockTitle ─────────────────────────────────────────
      zvUnlockTitle: (titleId: ZvTitleId): boolean => {
        const title = zvFindTitle(titleId)
        if (!title) return false
        const state = get()
        const currentIdx = ZV_TITLES.findIndex((t) => t.id === state.currentTitle)
        const titleIdx = ZV_TITLES.findIndex((t) => t.id === titleId)
        if (titleIdx <= currentIdx) return false
        if (state.renown < title.minRenown) return false
        if (state.spirits.length < title.minSpirits) return false
        set((prev) => ({
          currentTitle: titleId,
          windPower: prev.windPower + 50,
          renown: prev.renown + 100,
        }))
        return true
      },

      // ── zvClaimAchievement ────────────────────────────────────
      zvClaimAchievement: (achievementId: string): boolean => {
        const achievement = zvFindAchievement(achievementId)
        if (!achievement) return false
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!zvCheckAchievementCondition(achievement.condition, state)) return false
        set((prev) => ({
          achievements: [...prev.achievements, achievementId],
          windPower: prev.windPower + achievement.reward.windPower,
          renown: prev.renown + achievement.reward.renown,
        }))
        return true
      },

      // ── zvTradeMaterial ───────────────────────────────────────
      zvTradeMaterial: (materialId: string, count: number): number => {
        const mat = zvFindMaterial(materialId)
        if (!mat) return 0
        const state = get()
        const existing = state.materials.find((m) => m.materialId === materialId)
        const owned = existing ? existing.count : 0
        const tradeCount = Math.min(count, owned)
        if (tradeCount <= 0) return 0
        const earned = tradeCount * mat.value
        set((prev) => ({
          materials: prev.materials.map((m) =>
            m.materialId === materialId ? { ...m, count: m.count - tradeCount } : m
          ).filter((m) => m.count > 0),
          windPower: prev.windPower + earned,
        }))
        return earned
      },

      // ── zvEndEvent ────────────────────────────────────────────
      zvEndEvent: () => {
        set({ activeEvent: null, eventTurnsRemaining: 0, activeVault: null })
      },

      // ── zvResetEvent ──────────────────────────────────────────
      zvResetEvent: () => {
        const event = zvPickRandomEvent()
        set({ activeEvent: event, eventTurnsRemaining: event.durationTurns })
      },
    }),
    {
      name: 'zephyr-vault-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: MAIN HOOK — useZephyrVault()
// ═══════════════════════════════════════════════════════════════════

export default function useZephyrVault() {
  const store = useZvStore()

  const stateRef = useRef(store)
  const [state, setState] = useState(store)

  useEffect(() => {
    stateRef.current = store
    setState(store)
  }, [store])

  // ── useEffect: side effects based on stateRef ────────────────
  useEffect(() => {
    const current = stateRef.current
    if (current.activeEvent && current.eventTurnsRemaining <= 0) {
      current.zvEndEvent()
    }
  }, [state])

  useEffect(() => {
    const current = stateRef.current
    const speciesSet = new Set<string>()
    for (const sp of current.spirits) {
      speciesSet.add(sp.speciesId)
    }
    if (speciesSet.size >= 7) {
      const ach = ZV_ACHIEVEMENTS.find((a) => a.condition === 'allSpeciesRecruited')
      if (ach && !current.achievements.includes(ach.id)) {
        current.zvClaimAchievement(ach.id)
      }
    }
  }, [state])

  useEffect(() => {
    const current = stateRef.current
    for (const sp of current.spirits) {
      const def = zvFindSpirit(sp.speciesId)
      if (def && def.rarity === 'legendary') {
        const ach = ZV_ACHIEVEMENTS.find((a) => a.condition === 'legendarySummoned')
        if (ach && !current.achievements.includes(ach.id)) {
          current.zvClaimAchievement(ach.id)
        }
        break
      }
    }
  }, [state])

  useEffect(() => {
    const current = stateRef.current
    if (current.totalBuilt >= 10) {
      const ach = ZV_ACHIEVEMENTS.find((a) => a.condition === 'totalBuilt')
      if (ach && !current.achievements.includes(ach.id)) {
        current.zvClaimAchievement(ach.id)
      }
    }
  }, [state])

  useEffect(() => {
    const current = stateRef.current
    if (current.totalForged >= 50) {
      const ach = ZV_ACHIEVEMENTS.find((a) => a.condition === 'totalForged')
      if (ach && !current.achievements.includes(ach.id)) {
        current.zvClaimAchievement(ach.id)
      }
    }
  }, [state])

  // ── Computed: Owned spirits with species info ────────────────
  const zvOwnedSpirits = useMemo(() => {
    return state.spirits.map((g) => {
      const species = zvFindSpirit(g.speciesId)
      return {
        ...g,
        species,
        speciesColor: species ? zvSpeciesColor(species.species) : '#888888',
        rarityColor: species ? zvRarityColor(species.rarity) : '#888888',
      }
    })
  }, [state])

  // ── Computed: Available spirits to summon ────────────────────
  const zvAvailableSpirits = useMemo(() => {
    return ZV_WINDS.filter((sp) => {
      const cost = Math.floor(ZV_SUMMON_BASE_COST * zvRarityMultiplier(sp.rarity))
      return state.windPower >= cost
    })
  }, [state])

  // ── Computed: Current title details ──────────────────────────
  const zvCurrentTitleDetail = useMemo(() => {
    return zvFindTitle(state.currentTitle) ?? ZV_TITLES[0]
  }, [state])

  // ── Computed: Next title info ────────────────────────────────
  const zvNextTitle = useMemo(() => {
    const currentIdx = ZV_TITLES.findIndex((t) => t.id === state.currentTitle)
    if (currentIdx >= ZV_TITLES.length - 1) return null
    return ZV_TITLES[currentIdx + 1]
  }, [state])

  // ── Computed: Active vault details ───────────────────────────
  const zvActiveVaultDetail = useMemo(() => {
    if (!state.activeVault) return null
    return zvFindVault(state.activeVault) ?? null
  }, [state])

  // ── Computed: Unopened vaults ────────────────────────────────
  const zvUnopenedVaults = useMemo(() => {
    return ZV_VAULTS.filter((v) => !state.vaults.includes(v.id))
  }, [state])

  // ── Computed: Structures with defs ───────────────────────────
  const zvBuiltStructures = useMemo(() => {
    return state.structures.map((s) => {
      const def = zvFindStructureDef(s.structureDefId)
      return { ...s, def }
    })
  }, [state])

  // ── Computed: Unlockable abilities ───────────────────────────
  const zvUnlockableAbilities = useMemo(() => {
    return ZV_ABILITIES.filter((a) => {
      if (state.abilities.includes(a.id)) return false
      const cost = Math.floor(100 * zvRarityMultiplier(a.rarity))
      return state.windPower >= cost
    })
  }, [state])

  // ── Computed: Owned artifacts with defs ──────────────────────
  const zvOwnedArtifacts = useMemo(() => {
    return state.artifacts
      .map((aId) => zvFindArtifact(aId))
      .filter((a): a is ZvArtifactDef => a !== null)
  }, [state])

  // ── Computed: Unclaimed achievements ─────────────────────────
  const zvUnclaimedAchievements = useMemo(() => {
    return ZV_ACHIEVEMENTS.filter((a) => {
      if (state.achievements.includes(a.id)) return false
      return zvCheckAchievementCondition(a.condition, state)
    })
  }, [state])

  // ── Computed: Inventory materials with defs ──────────────────
  const zvInventoryMaterials = useMemo(() => {
    return state.materials.map((m) => {
      const def = zvFindMaterial(m.materialId)
      return { ...m, def }
    })
  }, [state])

  // ── Computed: Total structure effect ─────────────────────────
  const zvTotalStructureEffect = useMemo(() => {
    let totalEffect = 0
    for (const s of state.structures) {
      const def = zvFindStructureDef(s.structureDefId)
      if (def) {
        totalEffect += def.baseEffect + def.effectPerLevel * (s.level - 1)
      }
    }
    return totalEffect
  }, [state])

  // ── Computed: Average spirit level ───────────────────────────
  const zvAverageSpiritLevel = useMemo(() => {
    if (state.spirits.length === 0) return 0
    const total = state.spirits.reduce((sum, g) => sum + g.level, 0)
    return Math.floor(total / state.spirits.length)
  }, [state])

  // ── Computed: Total spirit power ─────────────────────────────
  const zvTotalSpiritPower = useMemo(() => {
    let windPower = 0
    let wisdom = 0
    let speed = 0
    for (const g of state.spirits) {
      windPower += g.windPower
      wisdom += g.wisdom
      speed += g.speed
    }
    return { windPower, wisdom, speed }
  }, [state])

  // ── Computed: Species distribution ───────────────────────────
  const zvSpeciesDistribution = useMemo(() => {
    const groups: Record<string, number> = {}
    for (const sp of ZV_SPECIES) {
      groups[sp.id] = 0
    }
    for (const g of state.spirits) {
      const def = zvFindSpirit(g.speciesId)
      if (def) {
        groups[def.species] = (groups[def.species] || 0) + 1
      }
    }
    return groups
  }, [state])

  // ── Computed: Rarity distribution ────────────────────────────
  const zvRarityDistribution = useMemo(() => {
    const groups: Record<ZvRarity, number> = { common: 0, unusual: 0, rare: 0, epic: 0, legendary: 0 }
    for (const g of state.spirits) {
      const sp = zvFindSpirit(g.speciesId)
      if (sp) groups[sp.rarity] += 1
    }
    return groups
  }, [state])

  // ── Computed: Spirits grouped by rarity ──────────────────────
  const zvSpiritsByRarity = useMemo(() => {
    const groups: Record<ZvRarity, ZvSpiritInstance[]> = { common: [], unusual: [], rare: [], epic: [], legendary: [] }
    for (const g of state.spirits) {
      const sp = zvFindSpirit(g.speciesId)
      if (sp) groups[sp.rarity].push(g)
    }
    return groups
  }, [state])

  // ── Computed: Spirits grouped by species ─────────────────────
  const zvSpiritsBySpecies = useMemo(() => {
    const groups: Record<string, ZvSpiritInstance[]> = {}
    for (const sp of ZV_SPECIES) {
      groups[sp.id] = []
    }
    for (const g of state.spirits) {
      const sp = zvFindSpirit(g.speciesId)
      if (sp) groups[sp.species].push(g)
    }
    return groups
  }, [state])

  // ── Computed: Title progress ─────────────────────────────────
  const zvTitleProgress = useMemo(() => {
    const currentIdx = ZV_TITLES.findIndex((t) => t.id === state.currentTitle)
    if (currentIdx >= ZV_TITLES.length - 1) {
      return { percent: 100, renownNeeded: 0, spiritsNeeded: 0 }
    }
    const next = ZV_TITLES[currentIdx + 1]
    const renownProgress = Math.min(100, (state.renown / next.minRenown) * 100)
    const spiritProgress = Math.min(100, (state.spirits.length / next.minSpirits) * 100)
    return {
      percent: Math.floor((renownProgress + spiritProgress) / 2),
      renownNeeded: Math.max(0, next.minRenown - state.renown),
      spiritsNeeded: Math.max(0, next.minSpirits - state.spirits.length),
    }
  }, [state])

  // ── Computed: Rare materials count ───────────────────────────
  const zvRareMaterialCount = useMemo(() => {
    let count = 0
    for (const m of state.materials) {
      const def = zvFindMaterial(m.materialId)
      if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
        count += m.count
      }
    }
    return count
  }, [state])

  // ── Computed: Exhausted spirits ──────────────────────────────
  const zvExhaustedSpirits = useMemo(() => {
    return state.spirits.filter((g) => g.endurance < 30)
  }, [state])

  // ── Computed: Low morale spirits ─────────────────────────────
  const zvLowMoraleSpirits = useMemo(() => {
    return state.spirits.filter((g) => g.morale < 30)
  }, [state])

  // ── Computed: Total artifact boost ───────────────────────────
  const zvTotalArtifactBoost = useMemo(() => {
    let windBoost = 0
    let vaultBoost = 0
    let enduranceBoost = 0
    for (const aId of state.artifacts) {
      const artifact = zvFindArtifact(aId)
      if (artifact) {
        windBoost += artifact.windBoost
        vaultBoost += artifact.vaultBoost
        enduranceBoost += artifact.enduranceBoost
      }
    }
    return { windBoost, vaultBoost, enduranceBoost }
  }, [state])

  // ── Computed: Vault level (number) ───────────────────────────
  const zvLevel = useMemo(() => {
    const titleIdx = ZV_TITLES.findIndex((t) => t.id === state.currentTitle)
    return titleIdx + 1
  }, [state])

  // ── Computed: Vault wind power (number) ──────────────────────
  const zvWindPower = useMemo(() => {
    return state.windPower
  }, [state])

  // ── Computed: Vaults opened count (number) ───────────────────
  const zvVaultsOpened = useMemo(() => {
    return state.vaults.length
  }, [state])

  // ── Computed: Structures by category ─────────────────────────
  const zvStructuresByCategory = useMemo(() => {
    const groups: Record<string, ZvStructureInstance[]> = {
      wind_engine: [],
      spirit_nest: [],
      vault_door: [],
      temple_wing: [],
      treasury: [],
    }
    for (const s of state.structures) {
      const def = zvFindStructureDef(s.structureDefId)
      if (def && groups[def.category]) {
        groups[def.category].push(s)
      }
    }
    return groups
  }, [state])

  // ── Computed: Abilities by species ───────────────────────────
  const zvAbilitiesBySpecies = useMemo(() => {
    const groups: Record<string, ZvAbilityDef[]> = {}
    for (const sp of ZV_SPECIES) {
      groups[sp.id] = ZV_ABILITIES.filter((a) => a.species === sp.id)
    }
    groups['universal'] = ZV_ABILITIES.filter((a) => a.rarity === 'legendary')
    return groups
  }, [state])

  // ── Computed: Events by type ─────────────────────────────────
  const zvEventsByType = useMemo(() => {
    const groups: Record<string, ZvEventDef[]> = { buff: [], debuff: [], special: [] }
    for (const e of ZV_EVENTS) {
      groups[e.effectType].push(e)
    }
    return groups
  }, [state])

  // ── Computed: Artifacts by rarity ────────────────────────────
  const zvArtifactsByRarity = useMemo(() => {
    const groups: Record<ZvRarity, ZvArtifactDef[]> = { common: [], unusual: [], rare: [], epic: [], legendary: [] }
    for (const a of ZV_ARTIFACTS) {
      groups[a.rarity].push(a)
    }
    return groups
  }, [state])

  // ── Computed: Materials by type ──────────────────────────────
  const zvMaterialsByType = useMemo(() => {
    const groups: Record<string, ZvMaterialDef[]> = {
      wind_crystal: [],
      feather: [],
      gem: [],
      essence: [],
      alloy: [],
    }
    for (const m of ZV_MATERIALS) {
      if (groups[m.type]) {
        groups[m.type].push(m)
      }
    }
    return groups
  }, [state])

  // ── Computed: Unbuilt structures ─────────────────────────────
  const zvUnbuiltStructures = useMemo(() => {
    return ZV_STRUCTURES.filter((def) => {
      return !state.structures.some((s) => s.structureDefId === def.id)
    })
  }, [state])

  // ── Computed: Collectible artifacts (not yet owned) ─────────
  const zvCollectibleArtifacts = useMemo(() => {
    return ZV_ARTIFACTS.filter((a) => {
      if (state.artifacts.includes(a.id)) return false
      const cost = Math.floor(a.value * 0.3)
      return state.windPower >= cost
    })
  }, [state])

  // ── Computed: Synergy pairs in roster ───────────────────────
  const zvSynergyPairs = useMemo(() => {
    const pairs: { a: ZvSpecies; b: ZvSpecies; name: string }[] = []
    const speciesInRoster = new Set<string>()
    for (const g of state.spirits) {
      const def = zvFindSpirit(g.speciesId)
      if (def) speciesInRoster.add(def.species)
    }
    const rosterArray = Array.from(speciesInRoster) as ZvSpecies[]
    for (let i = 0; i < rosterArray.length; i++) {
      for (let j = i + 1; j < rosterArray.length; j++) {
        if (zvCheckSynergy(rosterArray[i], rosterArray[j])) {
          const aName = ZV_SPECIES.find((s) => s.id === rosterArray[i])?.name ?? rosterArray[i]
          const bName = ZV_SPECIES.find((s) => s.id === rosterArray[j])?.name ?? rosterArray[j]
          pairs.push({ a: rosterArray[i], b: rosterArray[j], name: `${aName} + ${bName}` })
        }
      }
    }
    return pairs
  }, [state])

  // ── Computed: Total synergy bonus multiplier ─────────────────
  const zvSynergyMultiplier = useMemo(() => {
    let pairCount = 0
    const speciesInRoster = new Set<string>()
    for (const g of state.spirits) {
      const def = zvFindSpirit(g.speciesId)
      if (def) speciesInRoster.add(def.species)
    }
    const rosterArray = Array.from(speciesInRoster) as ZvSpecies[]
    for (let i = 0; i < rosterArray.length; i++) {
      for (let j = i + 1; j < rosterArray.length; j++) {
        if (zvCheckSynergy(rosterArray[i], rosterArray[j])) {
          pairCount++
        }
      }
    }
    return 1 + pairCount * 0.1
  }, [state])

  // ── Computed: Effective wind power (with boosts) ─────────────
  const zvEffectiveWindPower = useMemo(() => {
    const artifactBoost = zvTotalArtifactBoost.windBoost
    const structureBoost = zvTotalStructureEffect * 2
    const synergyMult = zvSynergyMultiplier
    return Math.floor((state.windPower + artifactBoost + structureBoost) * synergyMult)
  }, [state, zvTotalArtifactBoost, zvTotalStructureEffect, zvSynergyMultiplier])

  // ── Computed: Unlocked title names ───────────────────────────
  const zvUnlockedTitles = useMemo(() => {
    const currentIdx = ZV_TITLES.findIndex((t) => t.id === state.currentTitle)
    return ZV_TITLES.filter((_, idx) => idx <= currentIdx)
  }, [state])

  // ── Computed: Spirit XP progress for a spirit ────────────────
  const zvSpiritXpProgress = useCallback((spiritId: string) => {
    const spirit = state.spirits.find((s) => s.id === spiritId)
    if (!spirit) return { percent: 0, currentXp: 0, neededXp: 0, level: 0 }
    if (spirit.level >= ZV_MAX_SPIRIT_LEVEL) return { percent: 100, currentXp: spirit.xp, neededXp: 0, level: spirit.level }
    const needed = zvGetXpForLevel(spirit.level + 1)
    const percent = needed > 0 ? Math.floor((spirit.xp / needed) * 100) : 0
    return { percent, currentXp: spirit.xp, neededXp: needed, level: spirit.level }
  }, [state])

  // ═════════════════════════════════════════════════════════════
  // Return zvAPI object
  // ═════════════════════════════════════════════════════════════

  const zvAPI = {
    // ── Direct constants ──────────────────────────────────────
    ZV_WIND_WHITE,
    ZV_ZEPHYR_TEAL,
    ZV_GALE_SILVER,
    ZV_STORM_VIOLET,
    ZV_SKY_AZURE,
    ZV_DAWN_AMBER,
    ZV_MIST_SAGE,
    ZV_TWILIGHT_INDIGO,
    ZV_BREEZE_MINT,
    ZV_VOID_DEEP,
    ZV_SPECIES,
    ZV_RARITIES,
    ZV_WINDS,
    ZV_VAULTS,
    ZV_MATERIALS,
    ZV_STRUCTURES,
    ZV_ABILITIES,
    ZV_ACHIEVEMENTS,
    ZV_TITLES,
    ZV_ARTIFACTS,
    ZV_EVENTS,
    zvCheckSynergy,

    // ── Store state ───────────────────────────────────────────
    spirits: store.spirits,
    vaults: store.vaults,
    materials: store.materials,
    structures: store.structures,
    abilities: store.abilities,
    achievements: store.achievements,
    artifacts: store.artifacts,
    currentTitle: store.currentTitle,
    windPower: store.windPower,
    renown: store.renown,
    totalSummoned: store.totalSummoned,
    totalForged: store.totalForged,
    totalBuilt: store.totalBuilt,
    totalEventsFaced: store.totalEventsFaced,
    activeEvent: store.activeEvent,
    eventTurnsRemaining: store.eventTurnsRemaining,
    activeVault: store.activeVault,

    // ── Store actions ─────────────────────────────────────────
    zvSummonWind: store.zvSummonWind,
    zvDismissSpirit: store.zvDismissSpirit,
    zvTrainSpirit: store.zvTrainSpirit,
    zvFlyGale: store.zvFlyGale,
    zvBuildStructure: store.zvBuildStructure,
    zvUpgradeStructure: store.zvUpgradeStructure,
    zvOpenVault: store.zvOpenVault,
    zvCollectArtifact: store.zvCollectArtifact,
    zvUnlockAbility: store.zvUnlockAbility,
    zvUnlockTitle: store.zvUnlockTitle,
    zvClaimAchievement: store.zvClaimAchievement,
    zvTradeMaterial: store.zvTradeMaterial,
    zvForgeBreeze: store.zvForgeBreeze,
    zvEndEvent: store.zvEndEvent,
    zvResetEvent: store.zvResetEvent,

    // ── Computed getters ──────────────────────────────────────
    zvOwnedSpirits,
    zvAvailableSpirits,
    zvCurrentTitleDetail,
    zvNextTitle,
    zvActiveVaultDetail,
    zvUnopenedVaults,
    zvBuiltStructures,
    zvUnlockableAbilities,
    zvOwnedArtifacts,
    zvUnclaimedAchievements,
    zvInventoryMaterials,
    zvTotalStructureEffect,
    zvAverageSpiritLevel,
    zvTotalSpiritPower,
    zvSpeciesDistribution,
    zvRarityDistribution,
    zvSpiritsByRarity,
    zvSpiritsBySpecies,
    zvTitleProgress,
    zvRareMaterialCount,
    zvExhaustedSpirits,
    zvLowMoraleSpirits,
    zvTotalArtifactBoost,
    zvLevel,
    zvWindPower,
    zvVaultsOpened,
    zvStructuresByCategory,
    zvAbilitiesBySpecies,
    zvEventsByType,
    zvArtifactsByRarity,
    zvMaterialsByType,
    zvUnbuiltStructures,
    zvCollectibleArtifacts,
    zvSynergyPairs,
    zvSynergyMultiplier,
    zvEffectiveWindPower,
    zvUnlockedTitles,
    zvSpiritXpProgress,

    // ── Helpers ───────────────────────────────────────────────
    zvRarityColor,
    zvSpeciesColor,
    zvRarityMultiplier,
    zvGetXpForLevel,
  }

  return zvAPI
}
