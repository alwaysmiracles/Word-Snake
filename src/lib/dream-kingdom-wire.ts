/**
 * Dream Kingdom Wire — 梦境王国 (Dream Kingdom) feature module for Word Snake
 *
 * Explore enchanted dream realms, bond with ethereal spirits, collect memory
 * fragments, build fantastical structures, battle nightmares, consult oracles,
 * and brew powerful sleep potions — backed by a Zustand store with persist
 * middleware.
 *
 * Storage key: ws_dream_kingdom
 * Prefix: dk / DK_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type DKRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type DKSpiritType = 'guardian' | 'trickster' | 'wanderer' | 'ancient' | 'phantom'
export type DKEmotion =
  | 'joy'
  | 'sorrow'
  | 'wonder'
  | 'fear'
  | 'love'
  | 'nostalgia'
  | 'triumph'
  | 'melancholy'
  | 'serenity'
  | 'hope'

export interface DKRealmDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly dangerLevel: number
  readonly unlockLevel: number
  readonly dreamEnergy: number
}

export interface DKRealmInstance {
  readonly id: string
  realmDefId: string
  explored: boolean
  visitCount: number
  lastVisited: string | null
  discovered: boolean
}

export interface DKSpiritDef {
  readonly id: string
  readonly name: string
  readonly rarity: DKRarity
  readonly type: DKSpiritType
  readonly power: number
  readonly description: string
  readonly abilities: string[]
}

export interface DKSpiritInstance {
  readonly id: string
  spiritDefId: string
  name: string
  level: number
  xp: number
  bondStrength: number
  bondedAt: number
}

export interface DKMemoryDef {
  readonly id: string
  readonly name: string
  readonly rarity: DKRarity
  readonly emotion: DKEmotion
  readonly description: string
  readonly power: number
}

export interface DKStructureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly maxLevel: number
  readonly baseCost: number
  readonly upgradeCostMultiplier: number
}

export interface DKStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  built: boolean
}

export interface DKNightmareDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly difficulty: number
  readonly rewards: string[]
}

export interface DKAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
}

export interface DKAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface DKTitleDef {
  readonly id: string
  readonly name: string
  readonly requiredLevel: number
  readonly description: string
}

export interface DKOracleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly predictions: string[]
  readonly unlockLevel: number
}

export interface DKPotionDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly effect: string
  readonly duration: number
  readonly ingredients: string[]
  readonly cost: number
}

export interface DKStoreState {
  realms: DKRealmInstance[]
  bondedSpirits: DKSpiritInstance[]
  collectedMemories: string[]
  structures: DKStructureInstance[]
  defeatedNightmares: string[]
  dreamLevel: number
  dreamExp: number
  gold: number
  dreamEnergy: number
  sleepQuality: number
  achievements: string[]
  currentTitle: string
  totalDreams: number
  totalNightmaresDefeated: number
  totalSpiritsBonded: number
  activeRealmId: string | null
  currentNightmareId: string | null
  lucidity: number
  oracleVisits: number
}

export interface DKStoreActions {
  dkEnterRealm: (realmId: string) => boolean
  dkExitRealm: () => void
  dkExploreRealm: () => { foundMemory: boolean; foundSpirit: boolean; gainedExp: number; gainedGold: number }
  dkBondSpirit: (spiritId: string) => boolean
  dkReleaseSpirit: (instanceId: string) => boolean
  dkTrainSpirit: (instanceId: string) => boolean
  dkCollectMemory: (memoryId: string) => boolean
  dkUsePotion: (potionId: string) => boolean
  dkBrewPotion: (ingredientIds: string[]) => boolean
  dkBuildStructure: (structDefId: string) => boolean
  dkUpgradeStructure: (structId: string) => boolean
  dkFightNightmare: (nightmareId: string) => { victory: boolean; rewards: string[]; expGained: number }
  dkFleeNightmare: () => void
  dkConsultOracle: (oracleId: string) => string | null
  dkIncreaseLucidity: () => boolean
  dkRestoreEnergy: (amount: number) => number
  dkHarvestDreamEnergy: () => number
  dkUnlockTitle: (titleId: string) => boolean
  dkClaimAchievement: (achievementId: string) => boolean
  dkImproveSleep: (method: string) => number
  dkBuyPotion: (potionId: string) => boolean
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const DK_COLOR_LUCID: string = '#E0E7FF'
export const DK_COLOR_NIGHTMARE: string = '#1E1B4B'
export const DK_COLOR_MEMORY: string = '#F59E0B'
export const DK_COLOR_SPIRIT: string = '#A78BFA'
export const DK_COLOR_DREAM: string = '#67E8F9'
export const DK_COLOR_TWILIGHT: string = '#7C3AED'
export const DK_COLOR_SLUMBER: string = '#1F2937'
export const DK_COLOR_ETERNAL: string = '#EC4899'

export const DK_ALL_COLORS: string[] = [
  DK_COLOR_LUCID, DK_COLOR_NIGHTMARE, DK_COLOR_MEMORY, DK_COLOR_SPIRIT,
  DK_COLOR_DREAM, DK_COLOR_TWILIGHT, DK_COLOR_SLUMBER, DK_COLOR_ETERNAL,
]

export const DK_RARITY_COLORS: Record<DKRarity, string> = {
  common: '#9CA3AF',
  uncommon: '#34D399',
  rare: '#60A5FA',
  epic: '#A78BFA',
  legendary: '#FBBF24',
}

export const DK_RARITY_LABELS: Record<DKRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
}

export const DK_RARITY_MULTIPLIERS: Record<DKRarity, number> = {
  common: 1.0,
  uncommon: 1.5,
  rare: 2.0,
  epic: 3.0,
  legendary: 5.0,
}

export const DK_SPIRIT_TYPE_LABELS: Record<DKSpiritType, string> = {
  guardian: 'Guardian',
  trickster: 'Trickster',
  wanderer: 'Wanderer',
  ancient: 'Ancient',
  phantom: 'Phantom',
}

export const DK_SPIRIT_TYPE_COLORS: Record<DKSpiritType, string> = {
  guardian: '#10B981',
  trickster: '#F59E0B',
  wanderer: '#3B82F6',
  ancient: '#8B5CF6',
  phantom: '#6B7280',
}

export const DK_EMOTION_LABELS: Record<DKEmotion, string> = {
  joy: 'Joy',
  sorrow: 'Sorrow',
  wonder: 'Wonder',
  fear: 'Fear',
  love: 'Love',
  nostalgia: 'Nostalgia',
  triumph: 'Triumph',
  melancholy: 'Melancholy',
  serenity: 'Serenity',
  hope: 'Hope',
}

export const DK_EMOTION_COLORS: Record<DKEmotion, string> = {
  joy: '#FBBF24',
  sorrow: '#6366F1',
  wonder: '#8B5CF6',
  fear: '#1F2937',
  love: '#EC4899',
  nostalgia: '#D97706',
  triumph: '#EF4444',
  melancholy: '#6B7280',
  serenity: '#67E8F9',
  hope: '#10B981',
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: DK_REALMS — 8 Dream Realms
// ═══════════════════════════════════════════════════════════════════

export const DK_REALMS: readonly DKRealmDef[] = [
  {
    id: 'lucid_garden',
    name: 'Lucid Garden',
    description:
      'A serene garden where every flower glows with inner light and the paths shift to guide dreamers toward self-discovery. Butterflies made of pure thought flutter between crystal trees that sing lullabies.',
    dangerLevel: 1,
    unlockLevel: 1,
    dreamEnergy: 10,
  },
  {
    id: 'nightmare_abyss',
    name: 'Nightmare Abyss',
    description:
      'A bottomless chasm of swirling shadows where fears take physical form. The walls are lined with eyes that follow your every move, and whispers of forgotten terrors echo endlessly in the dark.',
    dangerLevel: 8,
    unlockLevel: 15,
    dreamEnergy: 40,
  },
  {
    id: 'memory_palace',
    name: 'Memory Palace',
    description:
      'An infinite palace of halls and chambers, each room containing a perfect recreation of a cherished memory. The architecture changes to match the emotional resonance of the memories stored within.',
    dangerLevel: 3,
    unlockLevel: 5,
    dreamEnergy: 20,
  },
  {
    id: 'fantasy_wood',
    name: 'Fantasy Wood',
    description:
      'An ancient enchanted forest where trees grow upside-down and rivers flow with liquid starlight. Mythical creatures hide among bioluminescent mushrooms that illuminate hidden trails through the undergrowth.',
    dangerLevel: 4,
    unlockLevel: 8,
    dreamEnergy: 25,
  },
  {
    id: 'slumber_sea',
    name: 'Slumber Sea',
    description:
      'A vast ocean of luminous blue where islands of clouds drift lazily beneath a sky filled with sleeping stars. The tides are controlled by the collective dreams of all sleeping mortals.',
    dangerLevel: 5,
    unlockLevel: 10,
    dreamEnergy: 30,
  },
  {
    id: 'echo_valley',
    name: 'Echo Valley',
    description:
      'A valley where every word spoken is preserved forever, repeating through crystalline formations. The echoes of ancient dreamers still resonate here, carrying fragments of forgotten wisdom and prophecies.',
    dangerLevel: 6,
    unlockLevel: 12,
    dreamEnergy: 35,
  },
  {
    id: 'twilight_spire',
    name: 'Twilight Spire',
    description:
      'A towering spire that exists simultaneously at dawn and dusk, its peak piercing the veil between waking and dreaming. Time flows differently at each level — past, present, and future coexist in perfect harmony.',
    dangerLevel: 7,
    unlockLevel: 14,
    dreamEnergy: 38,
  },
  {
    id: 'eternity_shore',
    name: 'Eternity Shore',
    description:
      'A cosmic beach at the edge of the dreamverse where waves of pure light crash against shores made of crystallized time. Eternally calm yet infinitely vast, it is the final destination of all dream journeys.',
    dangerLevel: 9,
    unlockLevel: 20,
    dreamEnergy: 50,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: DK_SPIRITS — 35 Dream Spirits (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const DK_SPIRITS: readonly DKSpiritDef[] = [
  // ── Common (7) ──────────────────────────────────────────────────
  {
    id: 'spark_wisp',
    name: 'Spark Wisp',
    rarity: 'common',
    type: 'wanderer',
    power: 8,
    description:
      'A tiny flickering spirit that drifts through dreams leaving trails of gentle warmth. It is drawn to happy memories and often appears during pleasant childhood recollections.',
    abilities: ['illuminate', 'warm_glow'],
  },
  {
    id: 'mist_sprite',
    name: 'Mist Sprite',
    rarity: 'common',
    type: 'trickster',
    power: 10,
    description:
      'A playful spirit made of morning mist that loves to rearrange dream scenery when no one is looking. Harmless but mischievous, it often hides important objects behind clouds.',
    abilities: ['mist veil', 'redirect'],
  },
  {
    id: 'dream_moth',
    name: 'Dream Moth',
    rarity: 'common',
    type: 'wanderer',
    power: 7,
    description:
      'A moth with wings that display shifting dream imagery. It is attracted to the light of consciousness and serves as a guide between dream layers.',
    abilities: ['dream_sense', 'flutter_shield'],
  },
  {
    id: 'slumber_fox',
    name: 'Slumber Fox',
    rarity: 'common',
    type: 'guardian',
    power: 12,
    description:
      'A small silver fox that guards the threshold between waking and sleeping. It appears to those who struggle to fall asleep and calms restless minds with its gentle presence.',
    abilities: ['sleep_induce', 'ward_minor'],
  },
  {
    id: 'echo_cricket',
    name: 'Echo Cricket',
    rarity: 'common',
    type: 'phantom',
    power: 6,
    description:
      'A translucent cricket whose chirping matches the rhythm of a sleeper\'s heartbeat. Its song reinforces deep sleep cycles and helps maintain dream continuity.',
    abilities: ['heartbeat_sync', 'deep_slumber'],
  },
  {
    id: 'dew_drop_fairy',
    name: 'Dew Drop Fairy',
    rarity: 'common',
    type: 'wanderer',
    power: 9,
    description:
      'A thumb-sized fairy that rides on dewdrops through dreams at dawn. She collects tears of joy from dreamers and transforms them into memory fragments.',
    abilities: ['tear_collect', 'dew_heal'],
  },
  {
    id: 'pillow_imp',
    name: 'Pillow Imp',
    rarity: 'common',
    type: 'trickster',
    power: 8,
    description:
      'A cheeky imp that fluffs pillows in the dreamscape and occasionally swaps dream scenarios. It means well despite its pranks, often steering dreamers toward lucidity.',
    abilities: ['scenario_shift', 'comfort_aura'],
  },

  // ── Uncommon (7) ────────────────────────────────────────────────
  {
    id: 'lunar_stag',
    name: 'Lunar Stag',
    rarity: 'uncommon',
    type: 'guardian',
    power: 22,
    description:
      'A magnificent stag with antlers made of crescent moons. It patrols the borders of peaceful dream realms, warding off nightmares with its ethereal moonlight.',
    abilities: ['moonbeam_horn', 'lunar_ward', 'swift_gallop'],
  },
  {
    id: 'weave_spider',
    name: 'Weave Spider',
    rarity: 'uncommon',
    type: 'ancient',
    power: 20,
    description:
      'An ancient spider that spins webs of dream thread connecting sleeping minds across the world. Its silk is used to weave prophetic visions and strengthen lucid dreaming.',
    abilities: ['dream_weave', 'prophetic_silk', 'thread_repair'],
  },
  {
    id: 'tide_dolphin',
    name: 'Tide Dolphin',
    rarity: 'uncommon',
    type: 'wanderer',
    power: 18,
    description:
      'A spectral dolphin that swims through the Slumber Sea, leaping between dream islands. It carries messages between sleeping dreamers and can rescue those lost in deep dreams.',
    abilities: ['tidal_leap', 'dream_message', 'rescue_breach'],
  },
  {
    id: 'gloom_raven',
    name: 'Gloom Raven',
    rarity: 'uncommon',
    type: 'trickster',
    power: 24,
    description:
      'A dark raven with feathers that absorb excess nightmare energy. Though it appears ominous, it feeds on negative emotions and converts them into harmless dream dust.',
    abilities: ['fear_absorb', 'shadow_morph', 'nightmare_cleanse'],
  },
  {
    id: 'starlight_nymph',
    name: 'Starlight Nymph',
    rarity: 'uncommon',
    type: 'wanderer',
    power: 19,
    description:
      'A nymph born from the light of dying stars. She wanders through dreams sprinkling stardust that enhances the vividness and emotional depth of dream experiences.',
    abilities: ['star_dust', 'vivid_enhance', 'cosmic_whisper'],
  },
  {
    id: 'fern_spirit',
    name: 'Fern Spirit',
    rarity: 'uncommon',
    type: 'guardian',
    power: 21,
    description:
      'An earthy spirit that dwells within ancient ferns in the Fantasy Wood. It heals damaged dreamscapes and encourages the growth of new, healthy dream landscapes.',
    abilities: ['landscape_heal', 'root_shield', 'growth_blessing'],
  },
  {
    id: 'crystal_hummingbird',
    name: 'Crystal Hummingbird',
    rarity: 'uncommon',
    type: 'phantom',
    power: 17,
    description:
      'A bird made of living crystal that hovers silently beside dreamers. Its crystalline body refracts dream energy, revealing hidden paths and secret chambers within dreamscapes.',
    abilities: ['crystal_refract', 'path_reveal', 'prism_scan'],
  },

  // ── Rare (7) ────────────────────────────────────────────────────
  {
    id: 'oracle_owl',
    name: 'Oracle Owl',
    rarity: 'rare',
    type: 'ancient',
    power: 35,
    description:
      'A colossal owl with feathers inscribed with ancient dream runes. It perches atop the Twilight Spire and sees all dreams simultaneously, offering cryptic guidance to worthy seekers.',
    abilities: ['all_sight', 'rune_read', 'prophecy_whisper', 'wisdom_aura'],
  },
  {
    id: 'storm_phoenix',
    name: 'Storm Phoenix',
    rarity: 'rare',
    type: 'guardian',
    power: 38,
    description:
      'A phoenix born from thunderstorms that erupt within dreams. Its wings generate lightning that purges nightmares and its tears rain down as healing dream energy.',
    abilities: ['thunder_wing', 'nightmare_purge', 'storm_heal', 'rebirth_flash'],
  },
  {
    id: 'void_walker',
    name: 'Void Walker',
    rarity: 'rare',
    type: 'phantom',
    power: 32,
    description:
      'A mysterious figure that exists between dream layers, able to step through the boundaries of any realm. It trades in secrets and forgotten memories, appearing only to those who are lost.',
    abilities: ['phase_shift', 'layer_step', 'memory_trade', 'void_sight'],
  },
  {
    id: 'aurora_serpent',
    name: 'Aurora Serpent',
    rarity: 'rare',
    type: 'wanderer',
    power: 30,
    description:
      'A massive serpent whose scales shimmer with the colors of the northern lights. It circles the dreamverse, and where it passes, dream landscapes become breathtakingly beautiful.',
    abilities: ['aurora_breathe', 'beautify', 'color_weave', 'serenity_aura'],
  },
  {
    id: 'dream_wolf_alpha',
    name: 'Dream Wolf Alpha',
    rarity: 'rare',
    type: 'guardian',
    power: 36,
    description:
      'The alpha of the dream wolf pack, a spectral canine of immense power. It leads a pack that hunts nightmares across all realms, never resting until the dreamer is safe.',
    abilities: ['pack_howl', 'nightmare_hunt', 'alpha_bite', 'territory_ward'],
  },
  {
    id: 'clockwork_sphinx',
    name: 'Clockwork Sphinx',
    rarity: 'rare',
    type: 'ancient',
    power: 34,
    description:
      'A sphinx made of intricate clockwork that poses riddles about the nature of dreams. Those who answer correctly gain deep lucidity; those who fail find themselves in a labyrinth.',
    abilities: ['riddle_pose', 'labyrinth_trap', 'time_gear', 'wisdom_test'],
  },
  {
    id: 'echo_knight',
    name: 'Echo Knight',
    rarity: 'rare',
    type: 'phantom',
    power: 33,
    description:
      'A spectral knight whose armor resonates with the dreamer\'s deepest convictions. It manifests to protect dreamers during their most vulnerable moments and fights alongside them against nightmares.',
    abilities: ['conviction_shield', 'echo_blade', 'valiant_charge', 'last_stand'],
  },

  // ── Epic (7) ────────────────────────────────────────────────────
  {
    id: 'morpheus_sovereign',
    name: 'Morpheus Sovereign',
    rarity: 'epic',
    type: 'ancient',
    power: 55,
    description:
      'An ancient dream lord who once served Morpheus himself. It commands the fundamental forces of dreaming and can reshape entire realms with a single gesture of its translucent hands.',
    abilities: ['realm_reshape', 'dream_command', 'force_awaken', 'morpheus_blessing', 'somnus_call'],
  },
  {
    id: 'nightmare_slayer',
    name: 'Nightmare Slayer',
    rarity: 'epic',
    type: 'guardian',
    power: 58,
    description:
      'A legendary warrior spirit clad in armor forged from purified nightmares. It has banished ten thousand terrors and its very presence causes lesser nightmares to dissolve in terror.',
    abilities: ['terror_reverse', 'bane_strike', 'fear_immunity', 'purify_aura', 'nightmare_annihilate'],
  },
  {
    id: 'time_weaver',
    name: 'Time Weaver',
    rarity: 'epic',
    type: 'ancient',
    power: 52,
    description:
      'An entity that exists outside of time, weaving past, present, and future into a coherent tapestry within dreams. It can show dreamers their past lives and possible futures.',
    abilities: ['time_loop', 'past_show', 'future_glimpse', 'time_freeze', 'tapestry_read'],
  },
  {
    id: 'soul_gardener',
    name: 'Soul Gardener',
    rarity: 'epic',
    type: 'guardian',
    power: 50,
    description:
      'A gentle giant who tends a garden where each flower represents a dreamer\'s soul. It nurtures wounded spirits and helps dreamers reconnect with their deepest sense of self.',
    abilities: ['soul_bloom', 'spirit_nurture', 'garden_sanctuary', 'root_heal', 'essence_fertilize'],
  },
  {
    id: 'void_whale',
    name: 'Void Whale',
    rarity: 'epic',
    type: 'phantom',
    power: 60,
    description:
      'A colossal whale that swims through the spaces between dreams, singing songs that hold the dreamverse together. Its songs can mend fractured dreamscapes and calm the most turbulent minds.',
    abilities: ['cosmos_song', 'dreamscape_mend', 'ocean_calm', 'depths_dive', 'song_of_ages'],
  },
  {
    id: 'dream_architect',
    name: 'Dream Architect',
    rarity: 'epic',
    type: 'ancient',
    power: 48,
    description:
      'A master builder who designed the fundamental structures of the dreamverse. It can construct entire dream cities instantaneously and teaches worthy dreamers the art of lucid creation.',
    abilities: ['instant_build', 'structure_enchant', 'blueprint_read', 'foundation_lay', 'create_teach'],
  },
  {
    id: 'lucid_sage',
    name: 'Lucid Sage',
    rarity: 'epic',
    type: 'ancient',
    power: 54,
    description:
      'The wisest spirit in the dreamverse, a being of pure consciousness that has achieved perfect lucidity. It grants dreamers moments of absolute clarity and awareness within their dreams.',
    abilities: ['lucidity_grant', 'clarity_beam', 'consciousness_expand', 'truth_reveal', 'awaken_poke'],
  },

  // ── Legendary (7) ───────────────────────────────────────────────
  {
    id: 'dream_sovereign',
    name: 'The Dream Sovereign',
    rarity: 'legendary',
    type: 'ancient',
    power: 85,
    description:
      'The supreme ruler of all dream realms, a being that existed before the first mortal dream. Its presence reshapes reality itself, and it holds dominion over every spirit, realm, and nightmare.',
    abilities: ['absolute_command', 'reality_rewrite', 'all_realm_access', 'sovereign_aura', 'dream_birth', 'eternal_lucidity'],
  },
  {
    id: 'eternal_guardian',
    name: 'Eternal Guardian',
    rarity: 'legendary',
    type: 'guardian',
    power: 90,
    description:
      'An immortal guardian that has protected the dreamverse since its creation. It cannot be destroyed, only temporarily dispersed, and it reforms stronger each time from the dream energy of all sleeping mortals.',
    abilities: ['immortal_shield', 'dispersal_return', 'all_defend', 'energy_absorb', 'guardian_rally', 'final_barrier'],
  },
  {
    id: 'nightmare_king',
    name: 'The Nightmare King',
    rarity: 'legendary',
    type: 'phantom',
    power: 95,
    description:
      'Once the greatest nightmare, it was redeemed through an ancient ritual and now fights alongside dreamers. It understands the language of fear and can turn any nightmare against itself.',
    abilities: ['fear_invert', 'nightmare_control', 'shadow_army', 'terror_feed', 'dark_convert', 'abyssal_roar'],
  },
  {
    id: 'memory_crystal_dragon',
    name: 'Memory Crystal Dragon',
    rarity: 'legendary',
    type: 'ancient',
    power: 80,
    description:
      'A dragon whose crystalline body contains every memory ever dreamt by any mortal. Its breath weapon is a beam of pure recollection that can restore forgotten memories or erase traumatic ones.',
    abilities: ['memory_beam', 'total_recall', 'trauma_cleanse', 'forget_breath', 'crystal_armor', 'ancient_wisdom'],
  },
  {
    id: 'dreamweaver_primordial',
    name: 'Dreamweaver Primordial',
    rarity: 'legendary',
    type: 'ancient',
    power: 88,
    description:
      'The first being to ever weave a dream from nothing. Its tapestries of dream thread form the fabric of the dreamverse itself. It can create entirely new dream realms with a thought.',
    abilities: ['create_realm', 'weave_reality', 'thread_of_fate', 'primordial_weave', 'tapestry_mend', 'void_spin'],
  },
  {
    id: 'star_dreamer',
    name: 'The Star Dreamer',
    rarity: 'legendary',
    type: 'wanderer',
    power: 82,
    description:
      'A celestial wanderer who sleeps among the stars and whose dreams manifest as new constellations. It travels between the dreamverse and the waking cosmos effortlessly.',
    abilities: ['constellation_create', 'star_travel', 'cosmic_dream', 'celestial_heal', 'nova_awaken', 'stardust_form'],
  },
  {
    id: 'dream_phoenix_eternal',
    name: 'Dream Phoenix Eternal',
    rarity: 'legendary',
    type: 'phantom',
    power: 92,
    description:
      'A phoenix that is reborn each time a mortal falls asleep. Its flames are made of pure dream energy, and its tears can cure the most deeply rooted insomnia. It is the ultimate symbol of sleep\'s renewal.',
    abilities: ['rebirth_cycle', 'dream_flame', 'insomnia_cure', 'energy_rain', 'phoenix_cry', 'eternal_ember'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: DK_MEMORIES — 30 Memory Fragments
// ═══════════════════════════════════════════════════════════════════

export const DK_MEMORIES: readonly DKMemoryDef[] = [
  { id: 'childhood_joy', name: 'Childhood Joy', rarity: 'common', emotion: 'joy', description: 'The golden afternoon when you rode a bicycle for the first time without training wheels, wind in your hair and freedom in your heart. That single moment of balance held the weight of infinite possibility, and the world seemed to open up in every direction at once.', power: 5 },
  { id: 'first_love', name: 'First Love', rarity: 'rare', emotion: 'love', description: 'The moment when eyes first met across a crowded room and the rest of the world faded into a watercolor blur. Time suspended like a held breath, and every sound became music, every color became richer, as if the universe itself conspired to paint this single instant with the most vivid hues imaginable.', power: 15 },
  { id: 'triumph_glory', name: 'Triumph of Glory', rarity: 'uncommon', emotion: 'triumph', description: 'Standing atop the podium after years of relentless training, the crowd roaring your name as confetti rained like snow.', power: 10 },
  { id: 'grandmother_kitchen', name: 'Grandmother\'s Kitchen', rarity: 'common', emotion: 'nostalgia', description: 'The warm aroma of fresh bread and cinnamon, flour-dusted hands teaching you to roll dough on a wooden table.', power: 5 },
  { id: 'summer_rain', name: 'Summer Rain', rarity: 'common', emotion: 'serenity', description: 'Running through warm summer rain as a child, barefoot on wet pavement, laughing at the sky for its gift of water.', power: 4 },
  { id: 'lost_friend', name: 'The Lost Friend', rarity: 'uncommon', emotion: 'sorrow', description: 'A bittersweet memory of a childhood friend who moved away, the last hug at the train station still echoing.', power: 8 },
  { id: 'starlight_camp', name: 'Starlight Camp', rarity: 'common', emotion: 'wonder', description: 'Lying in a sleeping bag under a sky so full of stars it seemed the universe was showing off just for you.', power: 6 },
  { id: 'graduation_day', name: 'Graduation Day', rarity: 'uncommon', emotion: 'triumph', description: 'Caps thrown into the air, diplomas clutched like treasure maps, the whole world stretched out before you like an open road.', power: 10 },
  { id: 'ocean_sunset', name: 'Ocean Sunset', rarity: 'common', emotion: 'serenity', description: 'Watching the sun melt into the sea from a quiet beach, the waves painting golden ribbons on the sand.', power: 5 },
  { id: 'first_pet', name: 'First Pet', rarity: 'common', emotion: 'joy', description: 'The day you brought home a trembling puppy or kitten, tiny paws exploring new territory, a bond forming that would last a lifetime.', power: 5 },
  { id: 'mountain_summit', name: 'Mountain Summit', rarity: 'rare', emotion: 'triumph', description: 'Reaching the peak after an agonizing climb, looking down at clouds below, feeling invincible and humbled at the same time. Every step of the ascent was etched into your muscles and memory, and at the summit you understood that the hardest climbs lead to the most breathtaking views.', power: 15 },
  { id: 'lullaby_voice', name: 'Mother\'s Lullaby', rarity: 'uncommon', emotion: 'nostalgia', description: 'The soft voice singing you to sleep, the gentle hand on your forehead, the feeling that nothing in the world could ever harm you.', power: 9 },
  { id: 'broken_promise', name: 'A Broken Promise', rarity: 'uncommon', emotion: 'sorrow', description: 'The heavy silence after a promise was broken, the weight of words unfulfilled hanging in the air like autumn leaves.', power: 8 },
  { id: 'winter_wonderland', name: 'Winter Wonderland', rarity: 'common', emotion: 'wonder', description: 'Waking to a world transformed by overnight snowfall, icicles hanging like chandeliers, breath visible in the crystalline air.', power: 6 },
  { id: 'dance_first', name: 'First Dance', rarity: 'rare', emotion: 'love', description: 'The clumsy, magical first dance with someone special, two left feet suddenly forgotten in the warmth of held hands.', power: 14 },
  { id: 'heroic_moment', name: 'Heroic Moment', rarity: 'epic', emotion: 'triumph', description: 'The instant you stood up for someone who couldn\'t stand for themselves, the surge of courage that redefined who you are.', power: 25 },
  { id: 'secret_hideout', name: 'Secret Hideout', rarity: 'common', emotion: 'joy', description: 'The hidden spot under the old oak tree, a fortress of imagination where the rules of the adult world couldn\'t reach.', power: 5 },
  { id: 'rainbow_chase', name: 'Chasing Rainbows', rarity: 'common', emotion: 'wonder', description: 'Running across fields after a storm, chasing a rainbow that always seemed just beyond reach, the chase itself being the treasure.', power: 4 },
  { id: 'farewell_letter', name: 'The Farewell Letter', rarity: 'rare', emotion: 'melancholy', description: 'Reading words written with trembling hands, each sentence carrying the weight of an entire relationship distilled onto paper.', power: 14 },
  { id: 'midnight_feast', name: 'Midnight Feast', rarity: 'common', emotion: 'joy', description: 'Sneaking to the kitchen at midnight with siblings, sharing stolen cookies and whispered secrets in the glow of the refrigerator light.', power: 5 },
  { id: 'northern_lights', name: 'Northern Lights', rarity: 'rare', emotion: 'wonder', description: 'The first time you saw the aurora borealis, ribbons of green and violet dancing across the sky like the universe breathing.', power: 16 },
  { id: 'heartbreak_heal', name: 'Heartbreak Healing', rarity: 'uncommon', emotion: 'hope', description: 'The slow, beautiful process of realizing that the pain would not last forever, that spring always follows the bitterest winter.', power: 10 },
  { id: 'old_photograph', name: 'Old Photograph', rarity: 'common', emotion: 'nostalgia', description: 'Finding a faded photograph in a drawer, faces smiling from a moment you\'d almost forgotten, bringing an entire era back to life.', power: 5 },
  { id: 'wave_caught', name: 'The Perfect Wave', rarity: 'uncommon', emotion: 'joy', description: 'Riding a wave so perfectly that time seemed to slow, the ocean carrying you forward in a moment of pure, liquid grace.', power: 9 },
  { id: ' ancestral_dream', name: 'Ancestral Dream', rarity: 'epic', emotion: 'wonder', description: 'A vivid dream of ancestors you never met, their stories and struggles flowing into you like a river finding the sea.', power: 28 },
  { id: 'forgiveness_moment', name: 'The Moment of Forgiveness', rarity: 'epic', emotion: 'serenity', description: 'The liberating instant when you chose to forgive, the chains of resentment dissolving like morning frost under sudden sunlight.', power: 25 },
  { id: 'childbirth_wonder', name: 'Miracle of Birth', rarity: 'legendary', emotion: 'wonder', description: 'The awe of witnessing new life enter the world, a tiny cry that rewrote the meaning of everything you thought you knew.', power: 40 },
  { id: 'near_death_clarity', name: 'Near-Death Clarity', rarity: 'epic', emotion: 'serenity', description: 'The crystalline moment of facing mortality, when every trivial concern evaporated and only what truly mattered remained.', power: 30 },
  { id: 'creative_epiphany', name: 'Creative Epiphany', rarity: 'rare', emotion: 'wonder', description: 'The lightning strike of inspiration, an idea so perfect it seemed to arrive from outside yourself, filling every cell with electric energy.', power: 16 },
  { id: 'reunion_embrace', name: 'The Reunion', rarity: 'rare', emotion: 'joy', description: 'The embrace after years apart, when distance and time collapsed into a single moment of overwhelming relief and love.', power: 18 },
  { id: 'unconditional_love', name: 'Unconditional Love', rarity: 'legendary', emotion: 'love', description: 'The profound realization that you are loved completely, without condition or reservation, a warmth that dissolves all fear and doubt.', power: 45 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: DK_STRUCTURES — 25 Upgradeable Dream Structures
// ═══════════════════════════════════════════════════════════════════

export const DK_STRUCTURES: readonly DKStructureDef[] = [
  { id: 'dk_dream_palace', name: 'Dream Palace', description: 'A magnificent palace that serves as your seat of power within the dreamverse. Each level expands its halls and increases dream energy storage.', maxLevel: 10, baseCost: 100, upgradeCostMultiplier: 1.8 },
  { id: 'dk_lucid_greenhouse', name: 'Lucid Greenhouse', description: 'A glass conservatory where dream flowers bloom year-round. Higher levels grow rarer dream flora that attract powerful spirits.', maxLevel: 10, baseCost: 80, upgradeCostMultiplier: 1.7 },
  { id: 'dk_memory_vault', name: 'Memory Vault', description: 'A reinforced chamber for storing collected memory fragments. Upgrading increases storage capacity and protects memories from nightmare corrosion.', maxLevel: 10, baseCost: 120, upgradeCostMultiplier: 1.9 },
  { id: 'dk_spirit_sanctuary', name: 'Spirit Sanctuary', description: 'A peaceful refuge where bonded spirits rest and recover. Higher levels increase spirit healing speed and bond growth rates.', maxLevel: 10, baseCost: 150, upgradeCostMultiplier: 2.0 },
  { id: 'dk_observation_tower', name: 'Observation Tower', description: 'A tall tower with a telescope that can peer into any dream realm. Each level extends its range and reveals hidden realm features.', maxLevel: 10, baseCost: 90, upgradeCostMultiplier: 1.6 },
  { id: 'dk_alchemy_lab', name: 'Potion Brewery', description: 'A mystical laboratory for brewing sleep potions and dream elixirs. Higher levels unlock rarer potion recipes and improve brewing efficiency.', maxLevel: 10, baseCost: 130, upgradeCostMultiplier: 1.85 },
  { id: 'dk_oracle_chamber', name: 'Oracle Chamber', description: 'A sacred chamber where dream oracles can be consulted. Upgrading attracts more powerful oracles and increases prediction accuracy.', maxLevel: 10, baseCost: 200, upgradeCostMultiplier: 2.1 },
  { id: 'dk_training_grounds', name: 'Lucidity Training Grounds', description: 'An open arena where spirits practice their abilities. Higher levels provide better training bonuses and unlock advanced techniques.', maxLevel: 10, baseCost: 110, upgradeCostMultiplier: 1.75 },
  { id: 'dk_nightmare_barricade', name: 'Nightmare Barricade', description: 'A defensive wall that repels nightmare incursions. Each level strengthens the barrier and adds elemental warding against specific nightmare types.', maxLevel: 10, baseCost: 160, upgradeCostMultiplier: 1.9 },
  { id: 'dk_starlight_garden', name: 'Starlight Garden', description: 'A garden where fallen stars are planted and cultivated into dream energy crystals. Higher levels yield more energy per harvest cycle.', maxLevel: 10, baseCost: 140, upgradeCostMultiplier: 1.8 },
  { id: 'dk_echo_library', name: 'Echo Library', description: 'A library containing books written by dream spirits across millennia. Each level unlocks new dream knowledge and passive experience gains.', maxLevel: 10, baseCost: 170, upgradeCostMultiplier: 2.0 },
  { id: 'dk_twilight_bridge', name: 'Twilight Bridge', description: 'A shimmering bridge connecting your realm to others. Higher levels allow access to more dangerous and rewarding dream realms.', maxLevel: 10, baseCost: 180, upgradeCostMultiplier: 1.95 },
  { id: 'dk_slumber_chamber', name: 'Slumber Chamber', description: 'A luxurious bedroom that enhances the quality of your real-world sleep. Higher levels provide stronger rest bonuses upon waking.', maxLevel: 10, baseCost: 100, upgradeCostMultiplier: 1.7 },
  { id: 'dk_enchantment_forge', name: 'Enchantment Forge', description: 'A forge that channels dream energy into magical enchantments for spirits and structures. Higher levels create more powerful enchantments.', maxLevel: 10, baseCost: 190, upgradeCostMultiplier: 2.0 },
  { id: 'dk_moonlight_pavilion', name: 'Moonlight Pavilion', description: 'An open pavilion bathed in eternal moonlight that serves as a gathering place for spirits. Higher levels increase spirit morale and loyalty.', maxLevel: 10, baseCost: 120, upgradeCostMultiplier: 1.75 },
  { id: 'dk_dream_gate', name: 'Dream Gate', description: 'A massive gate that controls entry to your dream kingdom. Upgrading strengthens its locks and allows trusted spirits to guard it.', maxLevel: 10, baseCost: 150, upgradeCostMultiplier: 1.85 },
  { id: 'dk_serenity_pool', name: 'Serenity Pool', description: 'A pool of liquid calmness that washes away nightmare influence. Higher levels increase purification speed and provide aura bonuses.', maxLevel: 10, baseCost: 130, upgradeCostMultiplier: 1.8 },
  { id: 'dk_fortune_wheel', name: 'Fortune Wheel', description: 'A mystical wheel that grants random dream bonuses when spun. Higher levels improve the quality of possible rewards.', maxLevel: 10, baseCost: 200, upgradeCostMultiplier: 2.1 },
  { id: 'dk_time_sundial', name: 'Time Sundial', description: 'An ancient sundial that manipulates the flow of time within dreams. Higher levels allow greater time dilation effects during exploration.', maxLevel: 10, baseCost: 210, upgradeCostMultiplier: 2.0 },
  { id: 'dk_crystal_mine', name: 'Dream Crystal Mine', description: 'A mine that extracts raw dream crystals from deep within the dreamscape. Higher levels yield rarer and more valuable crystal types.', maxLevel: 10, baseCost: 160, upgradeCostMultiplier: 1.9 },
  { id: 'dk_windmill_songs', name: 'Windmill of Songs', description: 'A windmill whose blades play soothing melodies carried on dream winds. Higher levels extend the range of its calming influence.', maxLevel: 10, baseCost: 90, upgradeCostMultiplier: 1.65 },
  { id: 'dk_mirror_hall', name: 'Hall of Mirrors', description: 'A hall filled with enchanted mirrors that reflect alternate dream possibilities. Higher levels reveal more potential futures.', maxLevel: 10, baseCost: 180, upgradeCostMultiplier: 2.0 },
  { id: 'dk_bell_tower', name: 'Dream Bell Tower', description: 'A tower housing a massive bell that, when rung, strengthens lucidity across all connected dream realms. Higher levels increase its radius.', maxLevel: 10, baseCost: 170, upgradeCostMultiplier: 1.9 },
  { id: 'dk_coral_reef_dream', name: 'Dream Coral Reef', description: 'An underwater reef structure that attracts aquatic dream spirits and produces rare oceanic dream pearls. Higher levels attract rarer creatures.', maxLevel: 10, baseCost: 140, upgradeCostMultiplier: 1.8 },
  { id: 'dk_eternal_flame', name: 'Eternal Dream Flame', description: 'A flame that never extinguishes, fueled by the collective dream energy of all sleeping mortals. Higher levels increase its warmth and protective power.', maxLevel: 10, baseCost: 250, upgradeCostMultiplier: 2.2 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: DK_NIGHTMARES — 15 Nightmare Types
// ═══════════════════════════════════════════════════════════════════

export const DK_NIGHTMARES: readonly DKNightmareDef[] = [
  { id: 'shadow_beast', name: 'Shadow Beast', description: 'A hulking creature of living shadow that stalks through dreams, distorting the environment into a twisted funhouse of fears.', difficulty: 2, rewards: ['Shadow Essence', 'Dark Shard'] },
  { id: 'void_walker_nm', name: 'Void Walker', description: 'An eerie figure that walks between dream layers, creating holes in reality that lead to terrifying nothingness.', difficulty: 3, rewards: ['Void Fragment', 'Layer Stone'] },
  { id: 'fog_horror', name: 'Fog Horror', description: 'A formless entity hidden within dense dream fog that whispers your deepest insecurities while remaining unseen.', difficulty: 2, rewards: ['Fog Crystal', 'Whisper Essence'] },
  { id: 'mirror_doppelganger', name: 'Mirror Doppelganger', description: 'A twisted reflection of yourself that emerges from mirrors within dreams, mimicking your appearance while sabotaging your actions.', difficulty: 4, rewards: ['Mirror Shard', 'Identity Fragment'] },
  { id: 'chase_entity', name: 'The Endless Pursuer', description: 'A relentless entity that chases you through an infinite corridor, its footsteps growing steadily louder no matter how fast you run.', difficulty: 3, rewards: ['Adrenaline Drop', 'Speed Essence'] },
  { id: 'teeth_fiend', name: 'Teeth Fiend', description: 'A grotesque creature that feeds on anxiety, manifesting whenever teeth crumble or fall out in dreams, growing stronger with each tooth lost.', difficulty: 2, rewards: ['Anxiety Crystal', 'Bone Fragment'] },
  { id: 'falling_titan', name: 'Falling Titan', description: 'A massive giant that causes the ground to crumble, plunging dreamers into an endless freefall through layers of increasing terror.', difficulty: 5, rewards: ['Gravity Shard', 'Fallen Feather'] },
  { id: 'paralysis_wraith', name: 'Sleep Paralysis Wraith', description: 'A wraith that pins dreamers to their dream bed, projecting terrifying hallucinations while the victim is unable to move or scream.', difficulty: 4, rewards: ['Paralysis Essence', 'Willpower Crystal'] },
  { id: 'labyrinth_weaver', name: 'Labyrinth Weaver', description: 'A spider-like entity that spins dream labyrinths, trapping dreamers in ever-shifting mazes with no exit and constant menace.', difficulty: 5, rewards: ['Silk Thread', 'Maze Crystal'] },
  { id: 'time_phantom', name: 'Time Phantom', description: 'A ghostly figure that accelerates or reverses dream time, causing dreamers to live through terrifying moments repeatedly or miss critical events.', difficulty: 6, rewards: ['Time Sand', 'Chrono Fragment'] },
  { id: 'drowning_leviathan', name: 'Drowning Leviathan', description: 'A colossal sea creature that fills dream oceans with crushing pressure, pulling dreamers into suffocating depths of primordial fear.', difficulty: 6, rewards: ['Depth Pearl', 'Pressure Crystal'] },
  { id: 'burning_specter', name: 'Burning Specter', description: 'A flaming ghost that ignites dream landscapes, trapping dreamers in infernos that cannot be extinguished by any means within the dream.', difficulty: 5, rewards: ['Ash Ember', 'Flame Essence'] },
  { id: 'identity_erazer', name: 'Identity Eraser', description: 'A terrifying entity that slowly removes the dreamer\'s sense of self, making them forget their name, face, and ultimately their existence.', difficulty: 7, rewards: ['Identity Core', 'Memory Shield'] },
  { id: 'apex_nightmare', name: 'Apex Nightmare', description: 'The apex predator of the Nightmare Abyss, a being composed of every fear ever felt, assuming a form perfectly tailored to each victim.', difficulty: 9, rewards: ['Apex Fang', 'Fear Core', 'Nightmare Crown'] },
  { id: 'dream_collector', name: 'The Dream Collector', description: 'A mysterious entity that steals dreams entirely, leaving victims in an endless void of dreamless blackness upon waking.', difficulty: 8, rewards: ['Stolen Dream Jar', 'Collector\'s Key', 'Void Heart'] },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: DK_ABILITIES — 22 Dream/Sleep Abilities
// ═══════════════════════════════════════════════════════════════════

export const DK_ABILITIES: readonly DKAbilityDef[] = [
  { id: 'dk_lucid_gaze', name: 'Lucid Gaze', description: 'Focus your awareness to recognize you are dreaming, increasing lucidity by a small amount.', cooldown: 3, power: 10 },
  { id: 'dk_dream_shield', name: 'Dream Shield', description: 'Project a barrier of solid dream energy that absorbs the next nightmare attack.', cooldown: 5, power: 25 },
  { id: 'dk_spirit_call', name: 'Spirit Call', description: 'Summon your bonded spirits to your side, boosting their abilities for a short duration.', cooldown: 8, power: 20 },
  { id: 'dk_memory_recall', name: 'Memory Recall', description: 'Reach into your collected memories to gain a temporary power boost based on the memory\'s emotion.', cooldown: 6, power: 30 },
  { id: 'dk_nightmare_bane', name: 'Nightmare Bane', description: 'Channel pure dream energy into a devastating attack that deals massive damage to nightmares.', cooldown: 10, power: 50 },
  { id: 'dk_realm_shift', name: 'Realm Shift', description: 'Instantly teleport between discovered dream realms, escaping danger or reaching new opportunities.', cooldown: 4, power: 15 },
  { id: 'dk_time_dilation', name: 'Time Dilation', description: 'Slow down dream time around you, allowing you to react to threats with supernatural speed.', cooldown: 7, power: 35 },
  { id: 'dk_dream_weave', name: 'Dream Weave', description: 'Reshape the dreamscape around you, creating walls, bridges, or weapons from pure dream energy.', cooldown: 5, power: 20 },
  { id: 'dk_aura_serene', name: 'Aura of Serenity', description: 'Emit a calming aura that pacifies nearby nightmare creatures and heals your bonded spirits.', cooldown: 9, power: 28 },
  { id: 'dk_purge_darkness', name: 'Purge Darkness', description: 'Release a wave of brilliant light that banishes all shadow-based nightmares in the vicinity.', cooldown: 12, power: 45 },
  { id: 'dk_sleep_deepen', name: 'Deepen Sleep', description: 'Enter a deeper layer of sleep where dreams are more vivid and rewards are multiplied.', cooldown: 6, power: 18 },
  { id: 'dk_fortify_mind', name: 'Fortify Mind', description: 'Strengthen your mental defenses against nightmare influence, reducing fear effects temporarily.', cooldown: 8, power: 30 },
  { id: 'dk_energy_siphon', name: 'Energy Siphon', description: 'Drain dream energy from nearby nightmares or corrupted dreamscapes, converting it to usable energy.', cooldown: 5, power: 22 },
  { id: 'dk_awaken_burst', name: 'Awaken Burst', description: 'Create a shockwave of waking energy that can forcibly eject intruding entities from your dream.', cooldown: 15, power: 55 },
  { id: 'dk_prophecy_glimpse', name: 'Prophecy Glimpse', description: 'Glimpse a fragment of the future through the dream veil, revealing upcoming challenges or rewards.', cooldown: 20, power: 40 },
  { id: 'dk_spirit_merge', name: 'Spirit Merge', description: 'Temporarily merge with a bonded spirit, gaining its abilities and multiplying your power.', cooldown: 10, power: 48 },
  { id: 'dk_dream_echo', name: 'Dream Echo', description: 'Create an echo of a previous successful action, repeating its effects without additional energy cost.', cooldown: 7, power: 25 },
  { id: 'dk_labyrinth_build', name: 'Labyrinth Builder', description: 'Construct a temporary maze around yourself that confuses and traps pursuing nightmares.', cooldown: 11, power: 35 },
  { id: 'dk_consume_fear', name: 'Consume Fear', description: 'Absorb fear energy from nightmares, converting it into healing energy for yourself and your spirits.', cooldown: 6, power: 32 },
  { id: 'dk_celestial_rain', name: 'Celestial Rain', description: 'Call down a rain of starlight that heals all friendly entities and damages all nightmares in range.', cooldown: 14, power: 52 },
  { id: 'dk_dream_anchor', name: 'Dream Anchor', description: 'Plant an anchor that stabilizes the dreamscape, preventing nightmare corruption from spreading.', cooldown: 8, power: 28 },
  { id: 'dk_sovereign_decree', name: 'Sovereign Decree', description: 'Issue a command as the Dream Sovereign, compelling all entities in the realm to obey for a brief moment.', cooldown: 25, power: 75 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: DK_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const DK_ACHIEVEMENTS: readonly DKAchievementDef[] = [
  { id: 'dk_ach_first_dream', name: 'First Dream', description: 'Enter a dream realm for the first time.', condition: 'Enter 1 realm', reward: '50 dream energy' },
  { id: 'dk_ach_realm_explorer', name: 'Realm Explorer', description: 'Discover and explore all 8 dream realms.', condition: 'Explore all realms', reward: '500 gold, Eternal Shore access' },
  { id: 'dk_ach_spirit_bonder', name: 'Spirit Bonder', description: 'Bond with your first dream spirit.', condition: 'Bond 1 spirit', reward: 'Spirit Sanctuary blueprint' },
  { id: 'dk_ach_spirit_master', name: 'Spirit Master', description: 'Bond with 10 different dream spirits.', condition: 'Bond 10 spirits', reward: '200 dream energy' },
  { id: 'dk_ach_memory_collector', name: 'Memory Collector', description: 'Collect 15 different memory fragments.', condition: 'Collect 15 memories', reward: 'Memory Vault upgrade' },
  { id: 'dk_ach_memory_complete', name: 'Memory Completionist', description: 'Collect all 30 memory fragments.', condition: 'Collect all memories', reward: '500 gold, Dream Sovereign blessing' },
  { id: 'dk_ach_nightmare_slayer', name: 'Nightmare Slayer', description: 'Defeat your first nightmare.', condition: 'Defeat 1 nightmare', reward: '100 dream energy' },
  { id: 'dk_ach_terror_end', name: 'End of Terror', description: 'Defeat all 15 nightmare types.', condition: 'Defeat all nightmares', reward: 'Nightmare King spirit unlock' },
  { id: 'dk_ach_builder', name: 'Dream Builder', description: 'Build your first dream structure.', condition: 'Build 1 structure', reward: '50 gold' },
  { id: 'dk_ach_architect', name: 'Master Architect', description: 'Build and fully upgrade 5 structures to max level.', condition: '5 structures at max', reward: '300 gold, Architect title' },
  { id: 'dk_ach_lucid_awakening', name: 'Lucid Awakening', description: 'Reach lucidity level 50.', condition: 'Lucidity 50', reward: '200 dream energy' },
  { id: 'dk_ach_oracle_seeker', name: 'Oracle Seeker', description: 'Consult oracles 20 times.', condition: '20 oracle visits', reward: 'Oracle Chamber upgrade' },
  { id: 'dk_ach_potion_master', name: 'Potion Master', description: 'Brew 30 sleep potions.', condition: 'Brew 30 potions', reward: 'Alchemy Lab upgrade' },
  { id: 'dk_ach_dream_level_10', name: 'Dream Level 10', description: 'Reach dream level 10.', condition: 'Dream level 10', reward: '100 gold, 100 dream energy' },
  { id: 'dk_ach_dream_level_25', name: 'Dream Level 25', description: 'Reach dream level 25.', condition: 'Dream level 25', reward: '300 gold, Twilight Spire access' },
  { id: 'dk_ach_dream_level_50', name: 'Dream Level 50', description: 'Reach dream level 50.', condition: 'Dream level 50', reward: '1000 gold, Dream Sovereign title' },
  { id: 'dk_ach_sleep_perfect', name: 'Perfect Sleep', description: 'Achieve sleep quality of 95 or higher.', condition: 'Sleep quality 95+', reward: 'Slumber Chamber upgrade' },
  { id: 'dk_ach_energy_harvester', name: 'Energy Harvester', description: 'Harvest a total of 1000 dream energy.', condition: '1000 total energy harvested', reward: 'Starlight Garden blueprint' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: DK_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const DK_TITLES: readonly DKTitleDef[] = [
  { id: 'title_dream_walker', name: 'Dream Walker', requiredLevel: 1, description: 'A newcomer to the dreamverse, taking first tentative steps into the world of dreams.' },
  { id: 'title_dream_weaver', name: 'Dream Weaver', requiredLevel: 5, description: 'One who has learned to shape the fabric of dreams, weaving threads of imagination into reality.' },
  { id: 'title_lucid_sage', name: 'Lucid Sage', requiredLevel: 10, description: 'A dreamer who has achieved mastery over lucid dreaming, seeing through every illusion.' },
  { id: 'title_spirit_whisperer', name: 'Spirit Whisperer', requiredLevel: 15, description: 'One who communicates fluently with dream spirits, earning their trust and cooperation.' },
  { id: 'title_nightmare_hunter', name: 'Nightmare Hunter', requiredLevel: 20, description: 'A fearless warrior who stalks nightmares through the darkest corners of the dreamverse.' },
  { id: 'title_realm_lord', name: 'Realm Lord', requiredLevel: 30, description: 'Ruler of multiple dream realms, commanding spirits and structures with absolute authority.' },
  { id: 'title_dream_sovereign', name: 'Dream Sovereign', requiredLevel: 40, description: 'The supreme authority within the dreamverse, second only to the original Dream Sovereign itself.' },
  { id: 'title_eternal_dreamer', name: 'Eternal Dreamer', requiredLevel: 50, description: 'A being who has transcended the boundary between waking and dreaming, existing in both simultaneously.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: DK_ORACLES — 10 Dream Oracles
// ═══════════════════════════════════════════════════════════════════

export const DK_ORACLES: readonly DKOracleDef[] = [
  {
    id: 'oracle_moon',
    name: 'Oracle of the Silver Moon',
    description: 'A veiled figure seated beneath a perpetually full moon. Her prophecies come in the form of lunar riddles that reveal hidden truths about the dreamer\'s future.',
    predictions: [
      'A forgotten memory holds the key to your next breakthrough.',
      'The spirit you seek is closer than your own shadow.',
      'A nightmare approaches, but within it lies your greatest reward.',
    ],
    unlockLevel: 3,
  },
  {
    id: 'oracle_stars',
    name: 'Oracle of the Falling Stars',
    description: 'A child-like entity that reads prophecies in the patterns of falling stars. Its predictions are brief but always accurate.',
    predictions: [
      'Tomorrow\'s dream will hold a gift wrapped in starlight.',
      'A bond you form tonight will last through a thousand sleeps.',
      'The path to the Eternity Shore opens when you face what you fear most.',
    ],
    unlockLevel: 5,
  },
  {
    id: 'oracle_mist',
    name: 'Oracle of the Shrouding Mist',
    description: 'An ancient face that materializes within thick fog. Its prophecies are cryptic warnings that prepare dreamers for upcoming challenges.',
    predictions: [
      'Beware the mirror that reflects what you wish to hide.',
      'The energy you seek lies at the bottom of a nightmare.',
      'A spirit of great power will test your worthiness before bonding.',
    ],
    unlockLevel: 8,
  },
  {
    id: 'oracle_flame',
    name: 'Oracle of the Eternal Flame',
    description: 'A fiery spirit that speaks through dancing flames. Its prophecies burn away deception and reveal the raw truth beneath appearances.',
    predictions: [
      'Your greatest enemy carries the solution to your deepest desire.',
      'A structure you build will become the foundation of your dream kingdom.',
      'The next memory you collect will change how you see yourself.',
    ],
    unlockLevel: 10,
  },
  {
    id: 'oracle_crystal',
    name: 'Oracle of the Dream Crystal',
    description: 'A sentient crystal cluster that refracts possible futures into visible light patterns. Its predictions come as vivid images rather than words.',
    predictions: [
      'I see a garden blooming in a place where only nightmares grew.',
      'A bridge of light will connect you to a realm you thought unreachable.',
      'The potion you need requires an ingredient you have not yet discovered.',
    ],
    unlockLevel: 12,
  },
  {
    id: 'oracle_ocean',
    name: 'Oracle of the Dreaming Ocean',
    description: 'A massive whale that speaks in whale song, its prophecies carried on waves of sound through the Slumber Sea to those who listen deeply.',
    predictions: [
      'Beneath the calmest surface, the deepest treasures await your descent.',
      'The tide will carry you to a shore you did not know existed.',
      'A sleeping giant stirs in the deep — be ready when it surfaces.',
    ],
    unlockLevel: 15,
  },
  {
    id: 'oracle_shadow',
    name: 'Oracle of the Living Shadow',
    description: 'A shadow that moves independently of any light source. It speaks in whispers and reveals the hidden motives of both allies and enemies.',
    predictions: [
      'Not every spirit that offers friendship does so with honest intentions.',
      'Your lucidity will be tested by a nightmare wearing a friendly face.',
      'The darkness you fear is merely the absence of a light you have not yet lit.',
    ],
    unlockLevel: 18,
  },
  {
    id: 'oracle_time',
    name: 'Oracle of the Shifting Sands',
    description: 'An hourglass entity that speaks of past and future as if they were the same thing. Its prophecies often reference events that have not yet happened as if they already have.',
    predictions: [
      'The moment you remember has already been rewritten by what you will do.',
      'Time in the dreamverse flows in a circle — the end is also the beginning.',
      'A choice you made long ago will bear fruit in a dream you have not yet entered.',
    ],
    unlockLevel: 22,
  },
  {
    id: 'oracle_mind',
    name: 'Oracle of the Inner Mind',
    description: 'A projection of the dreamer\'s own subconscious. It speaks uncomfortable truths that are always exactly what the dreamer needs to hear.',
    predictions: [
      'You already know the answer. You are simply afraid to acknowledge it.',
      'The achievement you chase is not the one that will bring you fulfillment.',
      'Your strength comes not from your spirits, but from the part of yourself you have not yet accepted.',
    ],
    unlockLevel: 28,
  },
  {
    id: 'oracle_cosmos',
    name: 'Oracle of the Cosmic Dream',
    description: 'The most powerful oracle, a being of pure cosmic consciousness that perceives all dreams simultaneously. Its prophecies reshape reality itself.',
    predictions: [
      'The dreamverse was created for a purpose, and you are approaching its center.',
      'Every spirit, memory, and nightmare you have encountered has been guiding you here.',
      'When you awaken from the final dream, you will carry its power into the waking world.',
    ],
    unlockLevel: 35,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: DK_POTIONS — 20 Sleep Potions
// ═══════════════════════════════════════════════════════════════════

export const DK_POTIONS: readonly DKPotionDef[] = [
  { id: 'potion_drowsy_dew', name: 'Drowsy Dew', description: 'A sweet-tasting liquid collected from dream flowers at dawn. Gently induces drowsiness and improves sleep onset.', effect: 'Mild sleep inducement', duration: 4, ingredients: ['dream_flower_nectar', 'spring_water'], cost: 10 },
  { id: 'potion_deep_slumber', name: 'Deep Slumber Elixir', description: 'A dark blue potion that plunges the drinker into the deepest layers of sleep, where the most vivid dreams reside.', effect: 'Deep sleep + vivid dreams', duration: 8, ingredients: ['moon_dust', 'lavender_extract', 'deep_water'], cost: 25 },
  { id: 'potion_lucid_flacon', name: 'Lucid Draught', description: 'A shimmering transparent potion that heightens awareness within dreams, making lucid dreaming significantly easier.', effect: 'Increased lucidity', duration: 6, ingredients: ['crystal_shard', 'starlight_dew', 'awareness_herb'], cost: 40 },
  { id: 'potion_nightmare_ward', name: 'Nightmare Ward Tonic', description: 'A protective potion that creates an invisible barrier against nightmares for the duration of sleep.', effect: 'Nightmare protection', duration: 8, ingredients: ['silver_moon_dust', 'protection_flower', 'spirit_essence'], cost: 35 },
  { id: 'potion_memory_boost', name: 'Memory Enhancer Brew', description: 'A golden potion that improves dream recall upon waking, helping dreamers remember more details from their dreams.', effect: 'Enhanced dream recall', duration: 6, ingredients: ['gold_dust', 'memory_moss', 'honey_dream'], cost: 30 },
  { id: 'potion_energy_surge', name: 'Dream Energy Surge', description: 'A crackling electric-blue potion that floods the drinker with dream energy upon entering the dreamverse.', effect: 'Dream energy boost', duration: 4, ingredients: ['lightning_crystal', 'energy_moss', 'storm_water'], cost: 45 },
  { id: 'potion_spirit_attraction', name: 'Spirit Attractant', description: 'A fragrant purple potion whose scent draws nearby dream spirits toward the drinker, increasing encounter rates.', effect: 'Spirit attraction', duration: 6, ingredients: ['phantom_petal', 'spirit_incense', 'twilight_water'], cost: 35 },
  { id: 'potion_realm_key', name: 'Realm Key Phial', description: 'A multi-colored potion that temporarily unlocks one additional dream realm beyond the drinker\'s current access level.', effect: 'Temporary realm unlock', duration: 4, ingredients: ['rainbow_shard', 'key_flower', 'essence_of_travel'], cost: 60 },
  { id: 'potion_courage_draught', name: 'Courage Draught', description: 'A bold red potion that suppresses fear and anxiety within nightmares, allowing clear-headed combat against terrifying entities.', effect: 'Fear suppression', duration: 5, ingredients: ['lion_heart_fern', 'fire_essence', 'bravery_stone'], cost: 40 },
  { id: 'potion_healing_spring', name: 'Healing Spring Tonic', description: 'A soothing green potion that repairs damage to the dreamscape and heals bonded spirits during dream exploration.', effect: 'Dreamscape healing', duration: 6, ingredients: ['healing_spring_water', 'nature_essence', 'rejuvenation_moss'], cost: 30 },
  { id: 'potion_oracle_eye', name: 'Oracle\'s Eye Elixir', description: 'A swirling silver potion that temporarily grants the ability to see hidden elements within dream realms, including secret paths.', effect: 'Enhanced perception', duration: 5, ingredients: ['oracle_tear', 'truth_crystal', 'silver_water'], cost: 50 },
  { id: 'potion_time_bend', name: 'Time Bender Brew', description: 'A clockwork-infused potion that slows or speeds up dream time, allowing extended exploration or rapid completion of tasks.', effect: 'Time manipulation', duration: 4, ingredients: ['time_sand', 'clockwork_gear', 'eternity_dew'], cost: 55 },
  { id: 'potion_fortress_wall', name: 'Fortress Wall Potion', description: 'A stone-gray potion that creates temporary defensive walls around the drinker\'s position within a dream realm.', effect: 'Defensive barrier', duration: 3, ingredients: ['stone_essence', 'wall_flower', 'fortification_crystal'], cost: 25 },
  { id: 'potion_explosion_dream', name: 'Dreamblast Vial', description: 'A volatile orange potion that, when shattered within a dream, releases a devastating shockwave of pure dream energy.', effect: 'Area damage burst', duration: 1, ingredients: ['explosion_essence', 'chaos_crystal', 'raw_energy_dust'], cost: 45 },
  { id: 'potion_shadow_blend', name: 'Shadow Blend Elixir', description: 'A pitch-black potion that renders the drinker nearly invisible within dreams, perfect for stealth exploration of dangerous realms.', effect: 'Invisibility', duration: 5, ingredients: ['shadow_extract', 'void_dust', 'darkness_essence'], cost: 50 },
  { id: 'potion_flight_feather', name: 'Flight Feather Draught', description: 'A light-as-air potion that grants the ability to fly within dreams, soaring above dreamscapes with effortless grace.', effect: 'Dream flight', duration: 6, ingredients: ['feather_of_dawn', 'wind_essence', 'cloud_cotton'], cost: 35 },
  { id: 'potion_golden_harvest', name: 'Golden Harvest Brew', description: 'A shimmering gold potion that doubles the dream energy and gold rewards from the next dream exploration session.', effect: 'Double rewards', duration: 2, ingredients: ['gold_nugget_dream', 'harvest_moon_dust', 'prosperity_herb'], cost: 70 },
  { id: 'potion_bond_strengthen', name: 'Bond Strengthening Elixir', description: 'A warm amber potion that deepens the bond between the drinker and one bonded spirit, increasing its loyalty and power.', effect: 'Spirit bond boost', duration: 1, ingredients: ['bond_crystal', 'love_essence', 'spirit_hair'], cost: 55 },
  { id: 'potion_abyss_resist', name: 'Abyssal Resistance Tonic', description: 'A dark indigo potion that grants temporary resistance to the corrupting influence of the Nightmare Abyss.', effect: 'Corruption resistance', duration: 6, ingredients: ['abyssal_shard', 'resistance_moss', 'purity_crystal'], cost: 60 },
  { id: 'potion_sovereign_blessing', name: 'Sovereign\'s Blessing', description: 'The rarest and most powerful potion, blessed by the Dream Sovereign itself. Temporarily grants the power of a realm lord.', effect: 'All stats boosted', duration: 3, ingredients: ['sovereign_tear', 'eternity_shard', 'dream_heart_crystal', 'cosmic_dust'], cost: 150 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function dkGenerateId(): string {
  return `dk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function dkXpForLevel(level: number): number {
  return Math.floor(80 * level * (1 + level * 0.15))
}

const DK_MAX_LEVEL = 50

function dkCheckLevelUp(
  set: (partial: Partial<DKFullStore> | ((s: DKFullStore) => Partial<DKFullStore>)) => void,
  get: () => DKFullStore
): void {
  const state = get()
  let { dreamLevel, dreamExp } = state
  let totalXp = dreamExp
  const maxXp = dkXpForLevel(DK_MAX_LEVEL)

  if (dreamLevel >= DK_MAX_LEVEL) return

  while (dreamLevel < DK_MAX_LEVEL) {
    const needed = dkXpForLevel(dreamLevel)
    if (totalXp >= needed) {
      totalXp -= needed
      dreamLevel += 1
    } else {
      break
    }
  }

  if (dreamLevel >= DK_MAX_LEVEL) {
    totalXp = 0
  }

  set({ dreamLevel, dreamExp: totalXp })
}

function dkCheckAchievementCondition(state: DKStoreState, achievementId: string): boolean {
  const checks: Record<string, number> = {
    dk_ach_first_dream: state.totalDreams,
    dk_ach_realm_explorer: state.realms.filter((r) => r.explored).length,
    dk_ach_spirit_bonder: state.totalSpiritsBonded,
    dk_ach_spirit_master: state.bondedSpirits.length,
    dk_ach_memory_collector: state.collectedMemories.length,
    dk_ach_memory_complete: state.collectedMemories.length,
    dk_ach_nightmare_slayer: state.totalNightmaresDefeated,
    dk_ach_terror_end: state.defeatedNightmares.length,
    dk_ach_builder: state.structures.filter((s) => s.built).length,
    dk_ach_architect: state.structures.filter((s) => s.built && s.level >= 10).length,
    dk_ach_lucid_awakening: state.lucidity,
    dk_ach_oracle_seeker: state.oracleVisits,
    dk_ach_potion_master: 0,
    dk_ach_dream_level_10: state.dreamLevel,
    dk_ach_dream_level_25: state.dreamLevel,
    dk_ach_dream_level_50: state.dreamLevel,
    dk_ach_sleep_perfect: state.sleepQuality,
    dk_ach_energy_harvester: 0,
  }

  const conditionMap: Record<string, number> = {
    dk_ach_first_dream: 1,
    dk_ach_realm_explorer: 8,
    dk_ach_spirit_bonder: 1,
    dk_ach_spirit_master: 10,
    dk_ach_memory_collector: 15,
    dk_ach_memory_complete: 30,
    dk_ach_nightmare_slayer: 1,
    dk_ach_terror_end: 15,
    dk_ach_builder: 1,
    dk_ach_architect: 5,
    dk_ach_lucid_awakening: 50,
    dk_ach_oracle_seeker: 20,
    dk_ach_potion_master: 30,
    dk_ach_dream_level_10: 10,
    dk_ach_dream_level_25: 25,
    dk_ach_dream_level_50: 50,
    dk_ach_sleep_perfect: 95,
    dk_ach_energy_harvester: 1000,
  }

  const current = checks[achievementId] ?? 0
  const target = conditionMap[achievementId] ?? 1
  return current >= target
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

interface DKFullStore extends DKStoreState, DKStoreActions {}

const useDKStore = create<DKFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      realms: DK_REALMS.map((r) => ({
        id: `instance_${r.id}`,
        realmDefId: r.id,
        explored: false,
        visitCount: 0,
        lastVisited: null,
        discovered: r.unlockLevel <= 1,
      })) as DKRealmInstance[],
      bondedSpirits: [] as DKSpiritInstance[],
      collectedMemories: [] as string[],
      structures: [] as DKStructureInstance[],
      defeatedNightmares: [] as string[],
      dreamLevel: 1,
      dreamExp: 0,
      gold: 100,
      dreamEnergy: 50,
      sleepQuality: 60,
      achievements: [] as string[],
      currentTitle: 'title_dream_walker',
      totalDreams: 0,
      totalNightmaresDefeated: 0,
      totalSpiritsBonded: 0,
      activeRealmId: null,
      currentNightmareId: null,
      lucidity: 0,
      oracleVisits: 0,

      // ── dkEnterRealm ───────────────────────────────────────────
      dkEnterRealm(realmId: string): boolean {
        const realmDef = DK_REALMS.find((r) => r.id === realmId)
        if (!realmDef) return false

        const state = get()
        const realmInstance = state.realms.find((r) => r.realmDefId === realmId)
        if (!realmInstance || !realmInstance.discovered) return false

        if (state.dreamEnergy < 5) return false

        set((s) => ({
          activeRealmId: realmId,
          dreamEnergy: s.dreamEnergy - 5,
          realms: s.realms.map((r) =>
            r.realmDefId === realmId
              ? { ...r, visitCount: r.visitCount + 1, lastVisited: new Date().toISOString() }
              : r
          ),
          totalDreams: s.totalDreams + 1,
          dreamExp: s.dreamExp + 15,
        }))

        dkCheckLevelUp(set, get)
        return true
      },

      // ── dkExitRealm ────────────────────────────────────────────
      dkExitRealm(): void {
        set({ activeRealmId: null })
      },

      // ── dkExploreRealm ────────────────────────────────────────
      dkExploreRealm(): { foundMemory: boolean; foundSpirit: boolean; gainedExp: number; gainedGold: number } {
        const state = get()
        if (!state.activeRealmId) {
          return { foundMemory: false, foundSpirit: false, gainedExp: 0, gainedGold: 0 }
        }

        const realmDef = DK_REALMS.find((r) => r.id === state.activeRealmId)
        if (!realmDef) {
          return { foundMemory: false, foundSpirit: false, gainedExp: 0, gainedGold: 0 }
        }

        const rand = Math.random()
        const foundMemory = rand < 0.3
        const foundSpirit = rand < 0.15 && rand >= 0.05
        const gainedExp = Math.floor(10 + realmDef.dangerLevel * 5 + Math.random() * 10)
        const gainedGold = Math.floor(5 + realmDef.dangerLevel * 3 + Math.random() * 8)

        let newMemoryId: string | null = null
        if (foundMemory) {
          const uncollected = DK_MEMORIES.filter((m) => !state.collectedMemories.includes(m.id))
          if (uncollected.length > 0) {
            newMemoryId = uncollected[Math.floor(Math.random() * uncollected.length)].id
          }
        }

        set((s) => ({
          dreamExp: s.dreamExp + gainedExp,
          gold: s.gold + gainedGold,
          collectedMemories: newMemoryId ? [...s.collectedMemories, newMemoryId] : s.collectedMemories,
          realms: s.realms.map((r) =>
            r.realmDefId === s.activeRealmId ? { ...r, explored: true } : r
          ),
        }))

        dkCheckLevelUp(set, get)
        return { foundMemory: !!newMemoryId, foundSpirit, gainedExp, gainedGold }
      },

      // ── dkBondSpirit ───────────────────────────────────────────
      dkBondSpirit(spiritId: string): boolean {
        const spiritDef = DK_SPIRITS.find((s) => s.id === spiritId)
        if (!spiritDef) return false

        const state = get()
        if (state.bondedSpirits.length >= 10) return false

        const instance: DKSpiritInstance = {
          id: dkGenerateId(),
          spiritDefId: spiritId,
          name: spiritDef.name,
          level: 1,
          xp: 0,
          bondStrength: 10,
          bondedAt: Date.now(),
        }

        set((s) => ({
          bondedSpirits: [...s.bondedSpirits, instance],
          totalSpiritsBonded: s.totalSpiritsBonded + 1,
          dreamExp: s.dreamExp + 20,
          gold: s.gold - 10,
        }))

        dkCheckLevelUp(set, get)
        return true
      },

      // ── dkReleaseSpirit ────────────────────────────────────────
      dkReleaseSpirit(instanceId: string): boolean {
        const state = get()
        const spirit = state.bondedSpirits.find((s) => s.id === instanceId)
        if (!spirit) return false

        set((s) => ({
          bondedSpirits: s.bondedSpirits.filter((sp) => sp.id !== instanceId),
          gold: s.gold + 5,
        }))
        return true
      },

      // ── dkTrainSpirit ──────────────────────────────────────────
      dkTrainSpirit(instanceId: string): boolean {
        const state = get()
        const spirit = state.bondedSpirits.find((s) => s.id === instanceId)
        if (!spirit) return false
        if (state.gold < 15) return false

        const newXp = spirit.xp + 25
        const xpNeeded = 50 * spirit.level
        let newLevel = spirit.level
        let remainingXp = newXp

        if (newXp >= xpNeeded) {
          newLevel = Math.min(newLevel + 1, 20)
          remainingXp = newXp - xpNeeded
        }

        set((s) => ({
          bondedSpirits: s.bondedSpirits.map((sp) =>
            sp.id === instanceId
              ? { ...sp, level: newLevel, xp: remainingXp, bondStrength: Math.min(100, sp.bondStrength + 5) }
              : sp
          ),
          gold: s.gold - 15,
        }))
        return true
      },

      // ── dkCollectMemory ────────────────────────────────────────
      dkCollectMemory(memoryId: string): boolean {
        const memoryDef = DK_MEMORIES.find((m) => m.id === memoryId)
        if (!memoryDef) return false

        const state = get()
        if (state.collectedMemories.includes(memoryId)) return false

        set((s) => ({
          collectedMemories: [...s.collectedMemories, memoryId],
          dreamExp: s.dreamExp + memoryDef.power * 2,
        }))

        dkCheckLevelUp(set, get)
        return true
      },

      // ── dkUsePotion ────────────────────────────────────────────
      dkUsePotion(potionId: string): boolean {
        const potionDef = DK_POTIONS.find((p) => p.id === potionId)
        if (!potionDef) return false

        if (potionId === 'potion_lucid_flacon') {
          set((s) => ({ lucidity: Math.min(100, s.lucidity + 15) }))
        } else if (potionId === 'potion_deep_slumber') {
          set((s) => ({ sleepQuality: Math.min(100, s.sleepQuality + 10) }))
        } else if (potionId === 'potion_energy_surge') {
          set((s) => ({ dreamEnergy: s.dreamEnergy + 30 }))
        }
        return true
      },

      // ── dkBrewPotion ───────────────────────────────────────────
      dkBrewPotion(_ingredientIds: string[]): boolean {
        const state = get()
        if (state.gold < 20) return false

        set((s) => ({ gold: s.gold - 20, dreamExp: s.dreamExp + 10 }))
        return true
      },

      // ── dkBuildStructure ───────────────────────────────────────
      dkBuildStructure(structDefId: string): boolean {
        const structDef = DK_STRUCTURES.find((s) => s.id === structDefId)
        if (!structDef) return false

        const state = get()
        if (state.gold < structDef.baseCost) return false
        if (state.structures.some((s) => s.structureDefId === structDefId)) return false

        const instance: DKStructureInstance = {
          id: dkGenerateId(),
          structureDefId: structDefId,
          level: 1,
          built: true,
        }

        set((s) => ({
          structures: [...s.structures, instance],
          gold: s.gold - structDef.baseCost,
          dreamExp: s.dreamExp + 15,
        }))

        dkCheckLevelUp(set, get)
        return true
      },

      // ── dkUpgradeStructure ─────────────────────────────────────
      dkUpgradeStructure(structId: string): boolean {
        const state = get()
        const struct = state.structures.find((s) => s.id === structId)
        if (!struct || !struct.built) return false

        const def = DK_STRUCTURES.find((d) => d.id === struct.structureDefId)
        if (!def) return false
        if (struct.level >= def.maxLevel) return false

        const cost = Math.floor(def.baseCost * Math.pow(def.upgradeCostMultiplier, struct.level))
        if (state.gold < cost) return false

        set((s) => ({
          structures: s.structures.map((st) =>
            st.id === structId ? { ...st, level: st.level + 1 } : st
          ),
          gold: s.gold - cost,
          dreamExp: s.dreamExp + 10,
        }))

        dkCheckLevelUp(set, get)
        return true
      },

      // ── dkFightNightmare ───────────────────────────────────────
      dkFightNightmare(nightmareId: string): { victory: boolean; rewards: string[]; expGained: number } {
        const nightmareDef = DK_NIGHTMARES.find((n) => n.id === nightmareId)
        if (!nightmareDef) {
          return { victory: false, rewards: [], expGained: 0 }
        }

        const state = get()
        const spiritPower = state.bondedSpirits.reduce((total, s) => {
          const def = DK_SPIRITS.find((d) => d.id === s.spiritDefId)
          if (!def) return total
          return total + def.power * (1 + s.level * 0.2) * (s.bondStrength / 100)
        }, 0)

        const structureBonus = state.structures.filter((s) => s.built).length * 5
        const playerPower = spiritPower + structureBonus + state.dreamLevel * 10 + state.lucidity * 0.5
        const nightmarePower = nightmareDef.difficulty * 30

        const victoryChance = Math.min(0.95, 0.3 + (playerPower / (playerPower + nightmarePower)) * 0.6)
        const victory = Math.random() < victoryChance

        if (victory) {
          const expGained = Math.floor(20 + nightmareDef.difficulty * 15)
          const goldReward = Math.floor(10 + nightmareDef.difficulty * 8)
          const energyReward = Math.floor(5 + nightmareDef.difficulty * 3)

          const alreadyDefeated = state.defeatedNightmares.includes(nightmareId)

          set((s) => ({
            currentNightmareId: null,
            defeatedNightmares: alreadyDefeated ? s.defeatedNightmares : [...s.defeatedNightmares, nightmareId],
            totalNightmaresDefeated: s.totalNightmaresDefeated + 1,
            dreamExp: s.dreamExp + expGained,
            gold: s.gold + goldReward,
            dreamEnergy: s.dreamEnergy + energyReward,
          }))

          dkCheckLevelUp(set, get)
          return { victory: true, rewards: [...nightmareDef.rewards, `${goldReward} gold`, `${energyReward} energy`], expGained }
        }

        set({ currentNightmareId: nightmareId })
        return { victory: false, rewards: [], expGained: 0 }
      },

      // ── dkFleeNightmare ────────────────────────────────────────
      dkFleeNightmare(): void {
        set((s) => ({
          currentNightmareId: null,
          dreamEnergy: Math.max(0, s.dreamEnergy - 5),
        }))
      },

      // ── dkConsultOracle ────────────────────────────────────────
      dkConsultOracle(oracleId: string): string | null {
        const oracleDef = DK_ORACLES.find((o) => o.id === oracleId)
        if (!oracleDef) return null

        const state = get()
        if (state.dreamLevel < oracleDef.unlockLevel) return null
        if (state.gold < 20) return null

        const prediction = oracleDef.predictions[Math.floor(Math.random() * oracleDef.predictions.length)]

        set((s) => ({
          oracleVisits: s.oracleVisits + 1,
          gold: s.gold - 20,
          dreamExp: s.dreamExp + 10,
        }))

        dkCheckLevelUp(set, get)
        return prediction
      },

      // ── dkIncreaseLucidity ─────────────────────────────────────
      dkIncreaseLucidity(): boolean {
        const state = get()
        if (state.dreamEnergy < 10) return false

        set((s) => ({
          lucidity: Math.min(100, s.lucidity + 3),
          dreamEnergy: s.dreamEnergy - 10,
        }))
        return true
      },

      // ── dkRestoreEnergy ────────────────────────────────────────
      dkRestoreEnergy(amount: number): number {
        set((s) => ({
          dreamEnergy: Math.min(200, s.dreamEnergy + amount),
        }))
        return Math.min(200, get().dreamEnergy)
      },

      // ── dkHarvestDreamEnergy ───────────────────────────────────
      dkHarvestDreamEnergy(): number {
        const structureBonus = get().structures.filter((s) => s.structureDefId === 'dk_starlight_garden' && s.built)
          .reduce((total, s) => total + s.level * 3, 0)
        const harvested = 15 + structureBonus + Math.floor(Math.random() * 10)

        set((s) => ({
          dreamEnergy: Math.min(200, s.dreamEnergy + harvested),
          dreamExp: s.dreamExp + 5,
        }))

        return harvested
      },

      // ── dkUnlockTitle ──────────────────────────────────────────
      dkUnlockTitle(titleId: string): boolean {
        const titleDef = DK_TITLES.find((t) => t.id === titleId)
        if (!titleDef) return false

        const state = get()
        if (state.dreamLevel < titleDef.requiredLevel) return false

        set((s) => ({
          currentTitle: titleId,
        }))
        return true
      },

      // ── dkClaimAchievement ─────────────────────────────────────
      dkClaimAchievement(achievementId: string): boolean {
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!dkCheckAchievementCondition(state, achievementId)) return false

        set((s) => ({
          achievements: [...s.achievements, achievementId],
          gold: s.gold + 50,
          dreamExp: s.dreamExp + 25,
        }))

        dkCheckLevelUp(set, get)
        return true
      },

      // ── dkImproveSleep ─────────────────────────────────────────
      dkImproveSleep(method: string): number {
        let improvement = 0
        if (method === 'meditation') improvement = 5
        else if (method === 'herb_tea') improvement = 8
        else if (method === 'exercise') improvement = 4
        else if (method === 'reading') improvement = 3
        else if (method === 'music') improvement = 6
        else improvement = 2

        set((s) => ({
          sleepQuality: Math.min(100, s.sleepQuality + improvement),
        }))

        return improvement
      },

      // ── dkBuyPotion ────────────────────────────────────────────
      dkBuyPotion(potionId: string): boolean {
        const potionDef = DK_POTIONS.find((p) => p.id === potionId)
        if (!potionDef) return false

        const state = get()
        if (state.gold < potionDef.cost) return false

        set((s) => ({
          gold: s.gold - potionDef.cost,
          dreamEnergy: s.dreamEnergy + 5,
        }))
        return true
      },
    }),
    {
      name: 'ws_dream_kingdom',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: MAIN HOOK — useDreamKingdom()
// ═══════════════════════════════════════════════════════════════════

export default function useDreamKingdom() {
  const store = useDKStore()

  // ── Getters (useMemo with [state]) ──────────────────────────

  const dkGetRealmList = useMemo(() => {
    return store.realms.map((instance) => {
      const def = DK_REALMS.find((r) => r.id === instance.realmDefId)
      return { ...instance, def }
    })
  }, [store])

  const dkGetBondedSpirits = useMemo(() => {
    return store.bondedSpirits.map((instance) => {
      const def = DK_SPIRITS.find((s) => s.id === instance.spiritDefId)
      return { ...instance, def }
    })
  }, [store])

  const dkGetMemoryCollection = useMemo(() => {
    return store.collectedMemories
      .map((id) => DK_MEMORIES.find((m) => m.id === id))
      .filter((m): m is DKMemoryDef => !!m)
  }, [store])

  const dkGetAvailablePotions = useMemo(() => {
    return DK_POTIONS.filter((p) => store.gold >= p.cost)
  }, [store])

  const dkGetStructureList = useMemo(() => {
    return store.structures.map((instance) => {
      const def = DK_STRUCTURES.find((s) => s.id === instance.structureDefId)
      return { ...instance, def }
    })
  }, [store])

  const dkGetDefeatedNightmares = useMemo(() => {
    return store.defeatedNightmares
      .map((id) => DK_NIGHTMARES.find((n) => n.id === id))
      .filter((n): n is DKNightmareDef => !!n)
  }, [store])

  const dkGetTotalPower = useMemo(() => {
    return store.bondedSpirits.reduce((total, spirit) => {
      const def = DK_SPIRITS.find((s) => s.id === spirit.spiritDefId)
      if (!def) return total
      const rarityMult = def.rarity === 'legendary' ? 5 : def.rarity === 'epic' ? 3 : def.rarity === 'rare' ? 2 : def.rarity === 'uncommon' ? 1.5 : 1
      return total + Math.floor(def.power * rarityMult * (1 + spirit.level * 0.2) * (spirit.bondStrength / 100))
    }, 0)
  }, [store])

  const dkGetLucidityLevel = useMemo(() => {
    const luc = store.lucidity
    if (luc >= 80) return 'Transcendent'
    if (luc >= 60) return 'Master'
    if (luc >= 40) return 'Adept'
    if (luc >= 20) return 'Apprentice'
    if (luc >= 5) return 'Beginner'
    return 'Dormant'
  }, [store])

  const dkGetSleepScore = useMemo(() => {
    return {
      quality: store.sleepQuality,
      grade: store.sleepQuality >= 90 ? 'A' : store.sleepQuality >= 75 ? 'B' : store.sleepQuality >= 50 ? 'C' : 'D',
      energyRestored: Math.floor(store.sleepQuality * 0.5),
    }
  }, [store])

  const dkGetNextTitle = useMemo(() => {
    const currentIdx = DK_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx < DK_TITLES.length - 1) {
      return DK_TITLES[currentIdx + 1]
    }
    return DK_TITLES[DK_TITLES.length - 1]
  }, [store])

  const dkGetRaritySummary = useMemo(() => {
    const summary: Record<DKRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
    }
    for (const spirit of store.bondedSpirits) {
      const def = DK_SPIRITS.find((s) => s.id === spirit.spiritDefId)
      if (def) {
        summary[def.rarity] += 1
      }
    }
    return summary
  }, [store])

  const dkGetRealmSummary = useMemo(() => {
    const explored = store.realms.filter((r) => r.explored).length
    const discovered = store.realms.filter((r) => r.discovered).length
    const totalVisits = store.realms.reduce((sum, r) => sum + r.visitCount, 0)
    return { explored, discovered, totalVisits, totalRealms: DK_REALMS.length }
  }, [store])

  const dkGetUnlockedAchievements = useMemo(() => {
    const unlocked: DKAchievementDef[] = []
    const claimable: DKAchievementDef[] = []

    for (const ach of DK_ACHIEVEMENTS) {
      if (store.achievements.includes(ach.id)) {
        unlocked.push(ach)
      } else if (dkCheckAchievementCondition(store, ach.id)) {
        claimable.push(ach)
      }
    }

    return { unlocked, claimable }
  }, [store])

  const dkGetTitleProgress = useMemo(() => {
    return DK_TITLES.map((title) => ({
      ...title,
      unlocked: store.dreamLevel >= title.requiredLevel,
      active: store.currentTitle === title.id,
    }))
  }, [store])

  const dkGetActiveNightmare = useMemo(() => {
    if (!store.currentNightmareId) return null
    return DK_NIGHTMARES.find((n) => n.id === store.currentNightmareId) ?? null
  }, [store])

  const dkGetOraclePredictions = useMemo(() => {
    return store.oracleVisits > 0
      ? DK_ORACLES.filter((o) => store.dreamLevel >= o.unlockLevel).map((o) => ({
          ...o,
          lastPrediction: o.predictions[Math.floor(Math.random() * o.predictions.length)],
        }))
      : []
  }, [store])

  const dkGetLevelProgress = useMemo(() => {
    const current = dkXpForLevel(store.dreamLevel)
    return {
      level: store.dreamLevel,
      currentXp: store.dreamExp,
      xpToNext: current,
      progressPercent: current > 0 ? Math.min(100, Math.floor((store.dreamExp / current) * 100)) : 0,
      maxLevel: store.dreamLevel >= DK_MAX_LEVEL,
    }
  }, [store])

  const dkGetActiveRealmDef = useMemo(() => {
    if (!store.activeRealmId) return null
    return DK_REALMS.find((r) => r.id === store.activeRealmId) ?? null
  }, [store])

  const dkGetUnlockedRealms = useMemo(() => {
    return DK_REALMS.filter((r) => store.dreamLevel >= r.unlockLevel)
  }, [store])

  const dkGetEligibleSpirits = useMemo(() => {
    return DK_SPIRITS.filter((s) => {
      if (store.bondedSpirits.some((bs) => bs.spiritDefId === s.id)) return false
      const minLevel = s.rarity === 'legendary' ? 30 : s.rarity === 'epic' ? 20 : s.rarity === 'rare' ? 10 : s.rarity === 'uncommon' ? 5 : 1
      return store.dreamLevel >= minLevel
    })
  }, [store])

  const dkGetUncollectedMemories = useMemo(() => {
    return DK_MEMORIES.filter((m) => !store.collectedMemories.includes(m.id))
  }, [store])

  const dkGetBuildableStructures = useMemo(() => {
    const builtIds = new Set(store.structures.map((s) => s.structureDefId))
    return DK_STRUCTURES.filter((def) => !builtIds.has(def.id) && store.gold >= def.baseCost)
  }, [store])

  const dkGetUpgradableStructures = useMemo(() => {
    return store.structures.filter((instance) => {
      if (!instance.built) return false
      const def = DK_STRUCTURES.find((d) => d.id === instance.structureDefId)
      if (!def || instance.level >= def.maxLevel) return false
      const cost = Math.floor(def.baseCost * Math.pow(def.upgradeCostMultiplier, instance.level))
      return store.gold >= cost
    })
  }, [store])

  const dkGetAvailableNightmares = useMemo(() => {
    return DK_NIGHTMARES.filter((n) => !store.defeatedNightmares.includes(n.id) || n.difficulty >= 7)
  }, [store])

  const dkGetSpiritTypeSummary = useMemo(() => {
    const summary: Record<DKSpiritType, number> = {
      guardian: 0, trickster: 0, wanderer: 0, ancient: 0, phantom: 0,
    }
    for (const spirit of store.bondedSpirits) {
      const def = DK_SPIRITS.find((s) => s.id === spirit.spiritDefId)
      if (def) {
        summary[def.type] += 1
      }
    }
    return summary
  }, [store])

  const dkGetEmotionSummary = useMemo(() => {
    const summary: Record<DKEmotion, number> = {
      joy: 0, sorrow: 0, wonder: 0, fear: 0, love: 0,
      nostalgia: 0, triumph: 0, melancholy: 0, serenity: 0, hope: 0,
    }
    for (const memId of store.collectedMemories) {
      const def = DK_MEMORIES.find((m) => m.id === memId)
      if (def) {
        summary[def.emotion] += 1
      }
    }
    return summary
  }, [store])

  const dkGetTopSpirit = useMemo(() => {
    if (store.bondedSpirits.length === 0) return null
    return store.bondedSpirits.reduce((best, spirit) => {
      const def = DK_SPIRITS.find((s) => s.id === spirit.spiritDefId)
      const bestDef = DK_SPIRITS.find((s) => s.id === best.spiritDefId)
      const power = def ? def.power * (1 + spirit.level * 0.2) * (spirit.bondStrength / 100) : 0
      const bestPower = bestDef ? bestDef.power * (1 + best.level * 0.2) * (best.bondStrength / 100) : 0
      return power > bestPower ? spirit : best
    })
  }, [store])

  const dkGetStrongestMemory = useMemo(() => {
    if (store.collectedMemories.length === 0) return null
    return DK_MEMORIES.filter((m) => store.collectedMemories.includes(m.id))
      .reduce((best, mem) => mem.power > best.power ? mem : best)
  }, [store])

  const dkGetUpgradeCostForStructure = useMemo(() => {
    const costs: Record<string, number> = {}
    for (const struct of store.structures) {
      const def = DK_STRUCTURES.find((d) => d.id === struct.structureDefId)
      if (def) {
        costs[struct.id] = Math.floor(def.baseCost * Math.pow(def.upgradeCostMultiplier, struct.level))
      }
    }
    return costs
  }, [store])

  // ── Assemble dkAPI ──────────────────────────────────────────

  const dkAPI = {
    // Constants
    DK_REALMS,
    DK_SPIRITS,
    DK_MEMORIES,
    DK_STRUCTURES,
    DK_NIGHTMARES,
    DK_ABILITIES,
    DK_ACHIEVEMENTS,
    DK_TITLES,
    DK_ORACLES,
    DK_POTIONS,
    DK_COLOR_LUCID,
    DK_COLOR_NIGHTMARE,
    DK_COLOR_MEMORY,
    DK_COLOR_SPIRIT,
    DK_COLOR_DREAM,
    DK_COLOR_TWILIGHT,
    DK_COLOR_SLUMBER,
    DK_COLOR_ETERNAL,

    // State (destructured for convenience)
    realms: store.realms,
    bondedSpirits: store.bondedSpirits,
    collectedMemories: store.collectedMemories,
    structures: store.structures,
    defeatedNightmares: store.defeatedNightmares,
    dreamLevel: store.dreamLevel,
    dreamExp: store.dreamExp,
    gold: store.gold,
    dreamEnergy: store.dreamEnergy,
    sleepQuality: store.sleepQuality,
    achievements: store.achievements,
    currentTitle: store.currentTitle,
    totalDreams: store.totalDreams,
    totalNightmaresDefeated: store.totalNightmaresDefeated,
    totalSpiritsBonded: store.totalSpiritsBonded,
    activeRealmId: store.activeRealmId,
    currentNightmareId: store.currentNightmareId,
    lucidity: store.lucidity,
    oracleVisits: store.oracleVisits,

    // Actions
    dkEnterRealm: store.dkEnterRealm,
    dkExitRealm: store.dkExitRealm,
    dkExploreRealm: store.dkExploreRealm,
    dkBondSpirit: store.dkBondSpirit,
    dkReleaseSpirit: store.dkReleaseSpirit,
    dkTrainSpirit: store.dkTrainSpirit,
    dkCollectMemory: store.dkCollectMemory,
    dkUsePotion: store.dkUsePotion,
    dkBrewPotion: store.dkBrewPotion,
    dkBuildStructure: store.dkBuildStructure,
    dkUpgradeStructure: store.dkUpgradeStructure,
    dkFightNightmare: store.dkFightNightmare,
    dkFleeNightmare: store.dkFleeNightmare,
    dkConsultOracle: store.dkConsultOracle,
    dkIncreaseLucidity: store.dkIncreaseLucidity,
    dkRestoreEnergy: store.dkRestoreEnergy,
    dkHarvestDreamEnergy: store.dkHarvestDreamEnergy,
    dkUnlockTitle: store.dkUnlockTitle,
    dkClaimAchievement: store.dkClaimAchievement,
    dkImproveSleep: store.dkImproveSleep,
    dkBuyPotion: store.dkBuyPotion,

    // Getters
    dkGetRealmList,
    dkGetBondedSpirits,
    dkGetMemoryCollection,
    dkGetAvailablePotions,
    dkGetStructureList,
    dkGetDefeatedNightmares,
    dkGetTotalPower,
    dkGetLucidityLevel,
    dkGetSleepScore,
    dkGetNextTitle,
    dkGetRaritySummary,
    dkGetRealmSummary,
    dkGetUnlockedAchievements,
    dkGetTitleProgress,
    dkGetActiveNightmare,
    dkGetOraclePredictions,
    dkGetLevelProgress,
    dkGetActiveRealmDef,
    dkGetUnlockedRealms,
    dkGetEligibleSpirits,
    dkGetUncollectedMemories,
    dkGetBuildableStructures,
    dkGetUpgradableStructures,
    dkGetAvailableNightmares,
    dkGetSpiritTypeSummary,
    dkGetEmotionSummary,
    dkGetTopSpirit,
    dkGetStrongestMemory,
    dkGetUpgradeCostForStructure,
  }

  return dkAPI
}
