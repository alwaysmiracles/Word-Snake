/**
 * Fortune Temple Wire — 幸运神殿 (Fortune Temple) feature module for Word Snake
 *
 * A luck/fortune themed temple mini-game: consult 35 fortune tellers across
 * 7 divination arts, explore 8 temple halls, collect 30 fate/oracle materials,
 * build 25 temple structures, discover 15 legendary destiny artifacts, face
 * 12 fate events, and ascend through 8 titles from Luck Novice to Fortune
 * Deity — backed by a Zustand store with persist middleware.
 *
 * Storage key: fortune-temple-wire
 * Prefix: ft / FT_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type FtDivinationArt =
  | 'tarot'
  | 'astrology'
  | 'iching'
  | 'runecasting'
  | 'scrying'
  | 'numerology'
  | 'dreamreading'

export type FtRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type FtTitleId =
  | 'title_luck_novice'
  | 'title_fate_reader'
  | 'title_oracle_apprentice'
  | 'title_diviner'
  | 'title_temple_seer'
  | 'title_fate_weaver'
  | 'title_destiny_lord'
  | 'title_fortune_deity'

export interface FtDivinationArtDef {
  readonly id: FtDivinationArt
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface FtTellerDef {
  readonly id: string
  readonly name: string
  readonly art: FtDivinationArt
  readonly rarity: FtRarity
  readonly insightPower: number
  readonly luckBonus: number
  readonly wisdom: number
  readonly description: string
  readonly specialties: string[]
}

export interface FtTellerInstance {
  readonly id: string
  tellerDefId: string
  name: string
  level: number
  xp: number
  insightPower: number
  luckBonus: number
  wisdom: number
  devotion: number
  favor: number
  consultedAt: number
}

export interface FtHallDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly depth: number
  readonly mysteryLevel: number
  readonly requiredTitle: FtTitleId
  readonly art: FtDivinationArt
  readonly bgGradient: string
  readonly ambientColor: string
}

export interface FtMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'oracle_scroll' | 'fate_crystal' | 'karma_gem' | 'destiny_shard' | 'fortune_essence'
  readonly rarity: FtRarity
  readonly insightBonus: number
  readonly luckBonus: number
  readonly value: number
  readonly description: string
}

export interface FtStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'oracle_chamber' | 'crystal_garden' | 'divination_altar' | 'shrine_of_fate' | 'destiny_sanctum'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface FtStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  builtAt: number
}

export interface FtAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly art: FtDivinationArt
  readonly type: 'active' | 'passive'
  readonly rarity: FtRarity
  readonly karmaCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface FtAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { gold: number; devotion: number }
}

export interface FtTitleDef {
  readonly id: FtTitleId
  readonly name: string
  readonly emoji: string
  readonly minDevotion: number
  readonly minTellers: number
  readonly description: string
}

export interface FtRelicDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: FtRarity
  readonly art: FtDivinationArt
  readonly insightBoost: number
  readonly luckBoost: number
  readonly wisdomBoost: number
  readonly value: number
  readonly description: string
}

export interface FtEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface FtStoreState {
  tellers: FtTellerInstance[]
  halls: string[]
  materials: { materialId: string; count: number }[]
  structures: FtStructureInstance[]
  abilities: string[]
  achievements: string[]
  relics: string[]
  currentTitle: FtTitleId
  gold: number
  devotion: number
  totalConsulted: number
  totalHarvested: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: FtEventDef | null
  eventTurnsRemaining: number
  activeHall: string | null
}

export interface FtStoreActions {
  ftConsultTeller: (tellerDefId: string) => boolean
  ftDismissTeller: (tellerId: string) => boolean
  ftBlessTeller: (tellerId: string) => boolean
  ftReadFortune: (tellerId: string) => boolean
  ftBuildStructure: (structureDefId: string) => boolean
  ftUpgradeStructure: (structureId: string) => boolean
  ftExploreHall: (hallId: string) => FtEventDef | null
  ftCollectRelic: (relicId: string) => boolean
  ftUnlockAbility: (abilityId: string) => boolean
  ftUnlockTitle: (titleId: FtTitleId) => boolean
  ftClaimAchievement: (achievementId: string) => boolean
  ftTradeMaterial: (materialId: string, count: number) => number
  ftEndEvent: () => void
  ftResetEvent: () => void
}

export interface FtFullStore extends FtStoreState, FtStoreActions {}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS (8 colors)
// ═══════════════════════════════════════════════════════════════════

export const FT_FORTUNE_GOLD: string = '#FFD700'
export const FT_DESTINY_PURPLE: string = '#6B21A8'
export const FT_ORACLE_BLUE: string = '#1E40AF'
export const FT_FATE_GREEN: string = '#166534'
export const FT_CRYSTAL_WHITE: string = '#FFF8DC'
export const FT_MYSTIC_INDIGO: string = '#312E81'
export const FT_LUNAR_SILVER: string = '#C0C0C0'
export const FT_KARMA_RED: string = '#991B1B'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: DIVINATION ART DEFINITIONS (7 arts)
// ═══════════════════════════════════════════════════════════════════

export const FT_DIVINATION_ARTS: readonly FtDivinationArtDef[] = [
  {
    id: 'tarot',
    name: 'Tarot',
    color: FT_KARMA_RED,
    description:
      'The ancient art of reading the Major and Minor Arcana. Tarot tellers see past, present, and future in the cards.',
  },
  {
    id: 'astrology',
    name: 'Astrology',
    color: FT_DESTINY_PURPLE,
    description:
      'Reading the celestial bodies and their influence on mortal fate. Astrologers chart the stars to divine destiny.',
  },
  {
    id: 'iching',
    name: 'I Ching',
    color: FT_FATE_GREEN,
    description:
      'The Book of Changes, an ancient Chinese oracle of yin and yang. Its hexagrams reveal the flow of cosmic energy.',
  },
  {
    id: 'runecasting',
    name: 'Rune Casting',
    color: FT_ORACLE_BLUE,
    description:
      'Casting ancient Norse runes carved from sacred wood. Each rune carries the wisdom of the elder gods.',
  },
  {
    id: 'scrying',
    name: 'Scrying',
    color: FT_CRYSTAL_WHITE,
    description:
      'Gazing into crystal balls, dark mirrors, or sacred pools to receive visions. Scryers pierce the veil between worlds.',
  },
  {
    id: 'numerology',
    name: 'Numerology',
    color: FT_LUNAR_SILVER,
    description:
      'The mystical study of numbers and their cosmic vibrations. Numerologists decode the hidden patterns of fate.',
  },
  {
    id: 'dreamreading',
    name: 'Dream Reading',
    color: FT_MYSTIC_INDIGO,
    description:
      'Interpreting prophetic dreams and their symbols. Dream readers walk between the waking world and the dream realm.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: ART SYNERGY TABLE
// ═══════════════════════════════════════════════════════════════════

const FT_SYNERGY_MAP: Record<FtDivinationArt, FtDivinationArt[]> = {
  tarot: ['dreamreading', 'scrying'],
  astrology: ['tarot', 'numerology'],
  iching: ['runecasting', 'dreamreading'],
  runecasting: ['iching', 'numerology'],
  scrying: ['tarot', 'dreamreading'],
  numerology: ['astrology', 'runecasting'],
  dreamreading: ['iching', 'scrying'],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: FT_TELLERS — 35 Fortune Tellers (5 per art)
// ═══════════════════════════════════════════════════════════════════

export const FT_TELLERS: readonly FtTellerDef[] = [
  // ── Tarot Tellers (5) ────────────────────────────────────────
  {
    id: 'tarot_fool_apprentice',
    name: 'Fool\'s Apprentice',
    art: 'tarot',
    rarity: 'common',
    insightPower: 12,
    luckBonus: 8,
    wisdom: 18,
    description:
      'A young card reader who begins every reading with The Fool. Full of naive optimism and surprising accuracy.',
    specialties: ['basic_spread'],
  },
  {
    id: 'tarot_card_weaver',
    name: 'Card Weaver',
    art: 'tarot',
    rarity: 'common',
    insightPower: 18,
    luckBonus: 10,
    wisdom: 22,
    description:
      'A skilled weaver who lays cards in intricate patterns. Her three-card spreads reveal hidden connections.',
    specialties: ['three_card_spread'],
  },
  {
    id: 'tarot_arcana_sage',
    name: 'Arcana Sage',
    art: 'tarot',
    rarity: 'uncommon',
    insightPower: 8,
    luckBonus: 35,
    wisdom: 28,
    description:
      'An elderly sage who reads only the Major Arcana. Each reading takes hours but reveals profound truths.',
    specialties: ['major_arcana', 'three_card_spread'],
  },
  {
    id: 'tarot_fate_dealer',
    name: 'Fate Dealer',
    art: 'tarot',
    rarity: 'rare',
    insightPower: 55,
    luckBonus: 45,
    wisdom: 30,
    description:
      'A mysterious dealer who shuffles destiny itself. The cards rearrange in the querent\'s hands during the reading.',
    specialties: ['major_arcana', 'three_card_spread', 'fate_draw'],
  },
  {
    id: 'tarot_world_seer',
    name: 'World Seer',
    art: 'tarot',
    rarity: 'legendary',
    insightPower: 120,
    luckBonus: 130,
    wisdom: 40,
    description:
      'The last living master of the complete 156-card Tarot de Marseille. A single reading can alter the course of empires.',
    specialties: ['major_arcana', 'three_card_spread', 'fate_draw', 'world_reversal', 'destiny_arrangement'],
  },

  // ── Astrology Tellers (5) ────────────────────────────────────
  {
    id: 'astro_star_gazer',
    name: 'Star Gazer',
    art: 'astrology',
    rarity: 'common',
    insightPower: 15,
    luckBonus: 5,
    wisdom: 20,
    description:
      'A humble astronomer who reads fate in the constellations. Best on clear nights when the stars align.',
    specialties: ['constellation_reading'],
  },
  {
    id: 'astro_zodiac_guide',
    name: 'Zodiac Guide',
    art: 'astrology',
    rarity: 'common',
    insightPower: 22,
    luckBonus: 8,
    wisdom: 24,
    description:
      'An expert in the twelve zodiac signs who creates detailed birth charts. Knows every planetary transit by heart.',
    specialties: ['zodiac_chart', 'constellation_reading'],
  },
  {
    id: 'astro_planet_soothsayer',
    name: 'Planet Soothsayer',
    art: 'astrology',
    rarity: 'uncommon',
    insightPower: 25,
    luckBonus: 20,
    wisdom: 35,
    description:
      'A teller who specializes in planetary alignments and retrograde periods. Can predict the luckiest days.',
    specialties: ['zodiac_chart', 'planetary_alignment'],
  },
  {
    id: 'astro_celestial_oracle',
    name: 'Celestial Oracle',
    art: 'astrology',
    rarity: 'rare',
    insightPower: 50,
    luckBonus: 40,
    wisdom: 45,
    description:
      'An oracle who can see the entire cosmic tapestry. Her readings span lifetimes and generations.',
    specialties: ['zodiac_chart', 'planetary_alignment', 'cosmic_compass'],
  },
  {
    id: 'astro_cosmic_deity',
    name: 'Cosmic Deity',
    art: 'astrology',
    rarity: 'legendary',
    insightPower: 130,
    luckBonus: 100,
    wisdom: 55,
    description:
      'A being who claims to have witnessed the birth of stars. Their natal charts rewrite fate at the deepest level.',
    specialties: ['zodiac_chart', 'planetary_alignment', 'cosmic_compass', 'stellar_rewrite', 'astral_fate'],
  },

  // ── I Ching Tellers (5) ──────────────────────────────────────
  {
    id: 'iching_coin_diviner',
    name: 'Coin Diviner',
    art: 'iching',
    rarity: 'common',
    insightPower: 10,
    luckBonus: 12,
    wisdom: 16,
    description:
      'A traditional diviner who casts three ancient coins. Each toss generates a line of the hexagram.',
    specialties: ['coin_cast'],
  },
  {
    id: 'iching_yarrow_stalker',
    name: 'Yarrow Stalker',
    art: 'iching',
    rarity: 'common',
    insightPower: 18,
    luckBonus: 10,
    wisdom: 26,
    description:
      'Uses the sacred yarrow stalk method for deeper readings. More time-consuming but infinitely more precise.',
    specialties: ['coin_cast', 'yarrow_method'],
  },
  {
    id: 'iching_hexagram_scholar',
    name: 'Hexagram Scholar',
    art: 'iching',
    rarity: 'uncommon',
    insightPower: 20,
    luckBonus: 30,
    wisdom: 32,
    description:
      'A scholar who has memorized all 64 hexagrams and their 384 changing lines. Interprets the subtlest shifts.',
    specialties: ['yarrow_method', 'hexagram_mastery'],
  },
  {
    id: 'iching_change_master',
    name: 'Master of Changes',
    art: 'iching',
    rarity: 'rare',
    insightPower: 48,
    luckBonus: 42,
    wisdom: 50,
    description:
      'A revered master who embodies the principle of change itself. Their readings shift the balance of yin and yang.',
    specialties: ['yarrow_method', 'hexagram_mastery', 'tao_balance'],
  },
  {
    id: 'iching_primordial_sage',
    name: 'Primordial Sage',
    art: 'iching',
    rarity: 'legendary',
    insightPower: 110,
    luckBonus: 120,
    wisdom: 60,
    description:
      'Said to have received the I Ching directly from Fu Xi in a vision. Their hexagrams reshape the fabric of reality.',
    specialties: ['yarrow_method', 'hexagram_mastery', 'tao_balance', 'primordial_order', 'cosmic_change'],
  },

  // ── Rune Casting Tellers (5) ─────────────────────────────────
  {
    id: 'rune_elder_apprentice',
    name: 'Elder Futhark Apprentice',
    art: 'runecasting',
    rarity: 'common',
    insightPower: 14,
    luckBonus: 6,
    wisdom: 22,
    description:
      'A young Viking descendent learning the 24 runes of the Elder Futhark. Eager but still unrefined.',
    specialties: ['single_rune_draw'],
  },
  {
    id: 'rune_stone_reader',
    name: 'Stone Reader',
    art: 'runecasting',
    rarity: 'common',
    insightPower: 20,
    luckBonus: 12,
    wisdom: 25,
    description:
      'Carves runes from sacred river stones and casts them on animal hide. Each stone carries ancient power.',
    specialties: ['single_rune_draw', 'three_rune_cast'],
  },
  {
    id: 'rune_odin_seeker',
    name: 'Odin\'s Seeker',
    art: 'runecasting',
    rarity: 'uncommon',
    insightPower: 28,
    luckBonus: 22,
    wisdom: 38,
    description:
      'A seeker who follows Odin\'s path of sacrifice for wisdom. Can read the runes that others cannot see.',
    specialties: ['three_rune_cast', 'odin_sacrifice'],
  },
  {
    id: 'rune_norn_weaver',
    name: 'Norn Weaver',
    art: 'runecasting',
    rarity: 'rare',
    insightPower: 52,
    luckBonus: 38,
    wisdom: 48,
    description:
      'Communes with the three Norns who spin the threads of fate. Can alter destiny through runic weaving.',
    specialties: ['three_rune_cast', 'odin_sacrifice', 'norn_thread'],
  },
  {
    id: 'rune_yggdrasil_keeper',
    name: 'Yggdrasil Keeper',
    art: 'runecasting',
    rarity: 'legendary',
    insightPower: 115,
    luckBonus: 95,
    wisdom: 58,
    description:
      'Guardian of the World Tree\'s runic secrets. Their carved runes glow with the life force of all nine worlds.',
    specialties: ['three_rune_cast', 'odin_sacrifice', 'norn_thread', 'yggdrasil_rune', 'ragnarok_fate'],
  },

  // ── Scrying Tellers (5) ──────────────────────────────────────
  {
    id: 'scry_mirror_gazer',
    name: 'Mirror Gazer',
    art: 'scrying',
    rarity: 'common',
    insightPower: 16,
    luckBonus: 7,
    wisdom: 20,
    description:
      'A scryer who uses an obsidian mirror passed down through generations. Sees reflections of possible futures.',
    specialties: ['mirror_gaze'],
  },
  {
    id: 'scry_crystal_watcher',
    name: 'Crystal Watcher',
    art: 'scrying',
    rarity: 'common',
    insightPower: 22,
    luckBonus: 14,
    wisdom: 24,
    description:
      'Watches visions form in a large quartz crystal. The images appear as mist that slowly coalesces into truth.',
    specialties: ['mirror_gaze', 'crystal_vision'],
  },
  {
    id: 'scry_pool_diviner',
    name: 'Sacred Pool Diviner',
    art: 'scrying',
    rarity: 'uncommon',
    insightPower: 30,
    luckBonus: 25,
    wisdom: 35,
    description:
      'Scryes into enchanted temple pools fed by underground springs. The water reveals what the eyes cannot see.',
    specialties: ['crystal_vision', 'pool_scrying'],
  },
  {
    id: 'scry_veil_piercer',
    name: 'Veil Piercer',
    art: 'scrying',
    rarity: 'rare',
    insightPower: 55,
    luckBonus: 35,
    wisdom: 52,
    description:
      'A powerful scryer who can pierce the veil between the mortal world and the spirit realm. Sees what others dare not.',
    specialties: ['crystal_vision', 'pool_scrying', 'veil_pierce'],
  },
  {
    id: 'scry_all_seeing_eye',
    name: 'All-Seeing Eye',
    art: 'scrying',
    rarity: 'legendary',
    insightPower: 125,
    luckBonus: 105,
    wisdom: 62,
    description:
      'The legendary scryer whose third eye never closes. They perceive all timelines simultaneously.',
    specialties: ['crystal_vision', 'pool_scrying', 'veil_pierce', 'third_eye', 'omniscient_gaze'],
  },

  // ── Numerology Tellers (5) ───────────────────────────────────
  {
    id: 'num_path_calculator',
    name: 'Life Path Calculator',
    art: 'numerology',
    rarity: 'common',
    insightPower: 10,
    luckBonus: 10,
    wisdom: 20,
    description:
      'Calculates life path numbers from birth dates. Simple but startlingly accurate for basic fortune readings.',
    specialties: ['life_path_number'],
  },
  {
    id: 'num_destiny_decoder',
    name: 'Destiny Decoder',
    art: 'numerology',
    rarity: 'common',
    insightPower: 18,
    luckBonus: 16,
    wisdom: 26,
    description:
      'Decodes the hidden meanings in names and dates. Can calculate soul urge, personality, and expression numbers.',
    specialties: ['life_path_number', 'name_analysis'],
  },
  {
    id: 'num_vibration_reader',
    name: 'Vibration Reader',
    art: 'numerology',
    rarity: 'uncommon',
    insightPower: 24,
    luckBonus: 28,
    wisdom: 34,
    description:
      'Senses the numerical vibrations that permeate all reality. Can identify lucky and unlucky number patterns.',
    specialties: ['name_analysis', 'vibration_sense'],
  },
  {
    id: 'num_matrix_master',
    name: 'Matrix Master',
    art: 'numerology',
    rarity: 'rare',
    insightPower: 45,
    luckBonus: 48,
    wisdom: 46,
    description:
      'Constructs elaborate numerology grids that map an entire lifetime. Can pinpoint critical turning points.',
    specialties: ['name_analysis', 'vibration_sense', 'fate_grid'],
  },
  {
    id: 'num_universal_architect',
    name: 'Universal Architect',
    art: 'numerology',
    rarity: 'legendary',
    insightPower: 100,
    luckBonus: 125,
    wisdom: 65,
    description:
      'Understands that the universe is built on sacred geometry and divine numbers. Can restructure fate itself through mathematics.',
    specialties: ['name_analysis', 'vibration_sense', 'fate_grid', 'sacred_geometry', 'universal_number'],
  },

  // ── Dream Reading Tellers (5) ────────────────────────────────
  {
    id: 'dream_symbol_reader',
    name: 'Symbol Reader',
    art: 'dreamreading',
    rarity: 'common',
    insightPower: 12,
    luckBonus: 9,
    wisdom: 18,
    description:
      'Interprets common dream symbols using ancient dream dictionaries. Knows what snakes, water, and falling mean.',
    specialties: ['symbol_decode'],
  },
  {
    id: 'dream_night_interpreter',
    name: 'Night Interpreter',
    art: 'dreamreading',
    rarity: 'common',
    insightPower: 20,
    luckBonus: 12,
    wisdom: 25,
    description:
      'A night watchman who records and interprets the dreams of temple visitors. Specializes in recurring dreams.',
    specialties: ['symbol_decode', 'recurring_dream'],
  },
  {
    id: 'dream_lucid_walker',
    name: 'Lucid Walker',
    art: 'dreamreading',
    rarity: 'uncommon',
    insightPower: 26,
    luckBonus: 22,
    wisdom: 36,
    description:
      'Can enter the dreams of others while remaining conscious. Navigates the dream realm like a waking world.',
    specialties: ['recurring_dream', 'lucid_entry'],
  },
  {
    id: 'dream_prophecy_seer',
    name: 'Prophecy Dreamer',
    art: 'dreamreading',
    rarity: 'rare',
    insightPower: 48,
    luckBonus: 40,
    wisdom: 50,
    description:
      'Receives genuine prophetic visions in sleep. Every detail of their dreams comes true within one lunar cycle.',
    specialties: ['lucid_entry', 'prophetic_vision'],
  },
  {
    id: 'dream_realm_sovereign',
    name: 'Dream Realm Sovereign',
    art: 'dreamreading',
    rarity: 'legendary',
    insightPower: 118,
    luckBonus: 110,
    wisdom: 58,
    description:
      'Rules the dream realm with absolute authority. Can reshape nightmares into blessings and summon fortune through dreams.',
    specialties: ['lucid_entry', 'prophetic_vision', 'realm_rule', 'dream_weave', 'nightmare_transmute'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: FT_HALLS — 8 Temple Halls
// ═══════════════════════════════════════════════════════════════════

export const FT_HALLS: readonly FtHallDef[] = [
  {
    id: 'hall_entry_courtyard',
    name: 'Entry Courtyard',
    description:
      'The sunlit courtyard where visitors first enter the Fortune Temple. Basic tarot and numerology readings are offered here.',
    depth: 0,
    mysteryLevel: 1,
    requiredTitle: 'title_luck_novice',
    art: 'tarot',
    bgGradient: 'linear-gradient(180deg, #FFD700 0%, #FFF8DC 50%, #C0C0C0 100%)',
    ambientColor: FT_FORTUNE_GOLD,
  },
  {
    id: 'hall_crystal_galleria',
    name: 'Crystal Galleria',
    description:
      'A vast hall lined with thousands of scrying crystals. Each crystal hums with latent fortune energy.',
    depth: 1,
    mysteryLevel: 2,
    requiredTitle: 'title_luck_novice',
    art: 'scrying',
    bgGradient: 'linear-gradient(180deg, #FFF8DC 0%, #C0C0C0 50%, #1E40AF 100%)',
    ambientColor: FT_CRYSTAL_WHITE,
  },
  {
    id: 'hall_star_observatory',
    name: 'Star Observatory',
    description:
      'An open-roofed observatory where astrologers chart the heavens. The ceiling reflects the current sky.',
    depth: 2,
    mysteryLevel: 3,
    requiredTitle: 'title_fate_reader',
    art: 'astrology',
    bgGradient: 'linear-gradient(180deg, #312E81 0%, #6B21A8 50%, #FFD700 100%)',
    ambientColor: FT_MYSTIC_INDIGO,
  },
  {
    id: 'hall_yin_yang_pavilion',
    name: 'Yin-Yang Pavilion',
    description:
      'A serene pavilion of perfect balance where I Ching masters consult the oracle in meditative silence.',
    depth: 3,
    mysteryLevel: 4,
    requiredTitle: 'title_oracle_apprentice',
    art: 'iching',
    bgGradient: 'linear-gradient(180deg, #166534 0%, #FFF8DC 50%, #166534 100%)',
    ambientColor: FT_FATE_GREEN,
  },
  {
    id: 'hall_rune_forge',
    name: 'Rune Forge',
    description:
      'A dim hall where the heat of ancient forges illuminates carved runes on every surface. Power pulses through the stones.',
    depth: 4,
    mysteryLevel: 5,
    requiredTitle: 'title_diviner',
    art: 'runecasting',
    bgGradient: 'linear-gradient(180deg, #1E40AF 0%, #C0C0C0 50%, #FFD700 100%)',
    ambientColor: FT_ORACLE_BLUE,
  },
  {
    id: 'hall_dream_sanctum',
    name: 'Dream Sanctum',
    description:
      'An ethereal hall perpetually bathed in twilight where dream readers walk between sleeping and waking worlds.',
    depth: 5,
    mysteryLevel: 6,
    requiredTitle: 'title_temple_seer',
    art: 'dreamreading',
    bgGradient: 'linear-gradient(180deg, #312E81 0%, #6B21A8 50%, #1E40AF 100%)',
    ambientColor: FT_MYSTIC_INDIGO,
  },
  {
    id: 'hall_number_vault',
    name: 'Number Vault',
    description:
      'A geometrically perfect chamber where numerologists calculate the infinite patterns that govern all fate.',
    depth: 6,
    mysteryLevel: 7,
    requiredTitle: 'title_fate_weaver',
    art: 'numerology',
    bgGradient: 'linear-gradient(180deg, #C0C0C0 0%, #312E81 50%, #FFD700 100%)',
    ambientColor: FT_LUNAR_SILVER,
  },
  {
    id: 'hall_destiny_throne',
    name: 'Throne of Destiny',
    description:
      'The innermost sanctum where the Fortune Deity once sat. All divination arts converge here in perfect harmony.',
    depth: 7,
    mysteryLevel: 8,
    requiredTitle: 'title_destiny_lord',
    art: 'tarot',
    bgGradient: 'linear-gradient(180deg, #FFD700 0%, #6B21A8 50%, #991B1B 100%)',
    ambientColor: FT_FORTUNE_GOLD,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: FT_MATERIALS — 30 Oracle/Fate Materials
// ═══════════════════════════════════════════════════════════════════

export const FT_MATERIALS: readonly FtMaterialDef[] = [
  // Common (8)
  { id: 'mat_tarot_card_fragment', name: 'Tarot Card Fragment', emoji: '🃏', type: 'oracle_scroll', rarity: 'common', insightBonus: 2, luckBonus: 1, value: 10, description: 'A torn piece of a tarot card. The image still shimmers faintly.' },
  { id: 'mat_star_dust', name: 'Star Dust', emoji: '✨', type: 'fate_crystal', rarity: 'common', insightBonus: 5, luckBonus: 0, value: 15, description: 'Fine crystalline dust collected from the observatory floor at dawn.' },
  { id: 'mat_yarrow_stalk', name: 'Yarrow Stalk', emoji: '🌿', type: 'oracle_scroll', rarity: 'common', insightBonus: 1, luckBonus: 3, value: 12, description: 'A single dried yarrow stalk used in I Ching divination. Still carries residual chi.' },
  { id: 'mat_rune_stone_shard', name: 'Rune Stone Shard', emoji: '🪨', type: 'fate_crystal', rarity: 'common', insightBonus: 4, luckBonus: 0, value: 18, description: 'A small chip from a runestone. Faintly warm to the touch.' },
  { id: 'mat_crystal_quartz_chip', name: 'Crystal Quartz Chip', emoji: '💎', type: 'fate_crystal', rarity: 'common', insightBonus: 3, luckBonus: 2, value: 14, description: 'A clear quartz chip from the galleria. It occasionally shows brief flashes of light.' },
  { id: 'mat_number_tablet', name: 'Number Tablet', emoji: '🔢', type: 'karma_gem', rarity: 'common', insightBonus: 6, luckBonus: 0, value: 20, description: 'A clay tablet inscribed with sacred numerological sequences.' },
  { id: 'mat_dream_candle_wax', name: 'Dream Candle Wax', emoji: '🕯️', type: 'oracle_scroll', rarity: 'common', insightBonus: 5, luckBonus: 1, value: 16, description: 'Wax from a candle burned during a prophetic dream ritual. Softly luminescent.' },
  { id: 'mat_fortune_coin', name: 'Fortune Coin', emoji: '🪙', type: 'karma_gem', rarity: 'common', insightBonus: 0, luckBonus: 4, value: 8, description: 'A simple brass coin blessed by a temple novice. Carries a small luck charm.' },

  // Uncommon (7)
  { id: 'mat_major_arcana_card', name: 'Major Arcana Card', emoji: '🎴', type: 'oracle_scroll', rarity: 'uncommon', insightBonus: 15, luckBonus: 0, value: 80, description: 'A complete Major Arcana card in pristine condition. Its image shifts when you are not looking.' },
  { id: 'mat_constellation_map', name: 'Constellation Map', emoji: '🗺️', type: 'oracle_scroll', rarity: 'uncommon', insightBonus: 5, luckBonus: 8, value: 65, description: 'A hand-drawn star chart that marks a rare celestial alignment.' },
  { id: 'mat_hexagram_scroll', name: 'Hexagram Scroll', emoji: '📜', type: 'oracle_scroll', rarity: 'uncommon', insightBonus: 20, luckBonus: 0, value: 90, description: 'An ancient scroll detailing a complete I Ching hexagram with all changing lines.' },
  { id: 'mat_elder_rune_stone', name: 'Elder Rune Stone', emoji: '🪨', type: 'fate_crystal', rarity: 'uncommon', insightBonus: 2, luckBonus: 15, value: 70, description: 'A complete Elder Futhark rune stone carved from enchanted granite.' },
  { id: 'mat_scrying_mirror_shard', name: 'Scrying Mirror Shard', emoji: '🪞', type: 'fate_crystal', rarity: 'uncommon', insightBonus: 8, luckBonus: 12, value: 75, description: 'A fragment of an obsidian scrying mirror. Reflections show alternate timelines.' },
  { id: 'mat_destiny_number_tablet', name: 'Destiny Number Tablet', emoji: '🔢', type: 'karma_gem', rarity: 'uncommon', insightBonus: 18, luckBonus: 5, value: 85, description: 'A golden tablet inscribed with master numerological calculations and life path numbers.' },
  { id: 'mat_dream_catcher_silk', name: 'Dream Catcher Silk', emoji: '🕸️', type: 'destiny_shard', rarity: 'uncommon', insightBonus: 10, luckBonus: 10, value: 72, description: 'Silk thread from a sacred dream catcher woven by temple dream readers.' },

  // Rare (6)
  { id: 'mat_world_card_fragment', name: 'World Card Fragment', emoji: '🌐', type: 'oracle_scroll', rarity: 'rare', insightBonus: 35, luckBonus: 15, value: 350, description: 'A fragment of The World card, the most powerful in the Major Arcana. Radiates completion energy.' },
  { id: 'mat_planetary_essence', name: 'Planetary Essence', emoji: '🪐', type: 'fortune_essence', rarity: 'rare', insightBonus: 20, luckBonus: 25, value: 300, description: 'Bottled essence collected during a rare planetary alignment. Pulsates with celestial power.' },
  { id: 'mat_primordial_hexagram', name: 'Primordial Hexagram', emoji: '☯️', type: 'oracle_scroll', rarity: 'rare', insightBonus: 45, luckBonus: 0, value: 400, description: 'An ancient hexagram drawn by the first I Ching master. The lines shift of their own accord.' },
  { id: 'mat_norn_thread', name: 'Norn Thread', emoji: '🧵', type: 'destiny_shard', rarity: 'rare', insightBonus: 15, luckBonus: 20, value: 320, description: 'A shimmering thread said to be clipped from the loom of the Norns. Cannot be cut by mortal means.' },
  { id: 'mat_vision_crystal', name: 'Vision Crystal', emoji: '🔮', type: 'fate_crystal', rarity: 'rare', insightBonus: 30, luckBonus: 25, value: 380, description: 'A flawless crystal that shows a different prophetic vision to each person who gazes within.' },
  { id: 'mat_sacred_number_gem', name: 'Sacred Number Gem', emoji: '💠', type: 'karma_gem', rarity: 'rare', insightBonus: 25, luckBonus: 10, value: 360, description: 'A gemstone carved with sacred numerological constants. Its facets reflect infinite numbers.' },

  // Epic (5)
  { id: 'mat_fool_to_world_deck', name: 'Fool-to-World Deck', emoji: '🎴', type: 'oracle_scroll', rarity: 'epic', insightBonus: 80, luckBonus: 20, value: 1500, description: 'A miniature complete Tarot deck of 22 cards that shuffles itself and arranges into perfect readings.' },
  { id: 'mat_star_chart_compendium', name: 'Star Chart Compendium', emoji: '📚', type: 'oracle_scroll', rarity: 'epic', insightBonus: 30, luckBonus: 60, value: 1400, description: 'A massive tome containing the star charts of every soul who has ever consulted the temple.' },
  { id: 'mat_cosmic_yarrow_bundle', name: 'Cosmic Yarrow Bundle', emoji: '🌾', type: 'fortune_essence', rarity: 'epic', insightBonus: 20, luckBonus: 20, value: 1600, description: 'Yarrow stalks grown in cosmic soil from the spirit realm. Each stalk contains infinite hexagrams.' },
  { id: 'mat_all_father_rune', name: 'All-Father Rune', emoji: 'ᚨ', type: 'destiny_shard', rarity: 'epic', insightBonus: 75, luckBonus: 40, value: 1800, description: 'A rune carved by Odin himself during his hanging from Yggdrasil. It speaks when held.' },
  { id: 'mat_dream_realm_crystal', name: 'Dream Realm Crystal', emoji: '💫', type: 'fate_crystal', rarity: 'epic', insightBonus: 40, luckBonus: 35, value: 1700, description: 'A crystal that exists simultaneously in the waking world and the dream realm.' },

  // Legendary (4)
  { id: 'mat_fate_weaver_spool', name: 'Fate Weaver Spool', emoji: '🧶', type: 'destiny_shard', rarity: 'legendary', insightBonus: 50, luckBonus: 50, value: 8000, description: 'A spool of golden thread from the Loom of Fate itself. Unraveling it reveals the future.' },
  { id: 'mat_cosmic_compass', name: 'Cosmic Compass', emoji: '🧭', type: 'fortune_essence', rarity: 'legendary', insightBonus: 120, luckBonus: 30, value: 10000, description: 'A compass that always points toward the querent\'s greatest fortune, wherever it may be.' },
  { id: 'mat_destiny_matrix_core', name: 'Destiny Matrix Core', emoji: '🔢', type: 'karma_gem', rarity: 'legendary', insightBonus: 60, luckBonus: 80, value: 9000, description: 'The mathematical core of all destiny. Contained within it is the formula of fate itself.' },
  { id: 'mat_eternal_dream_essence', name: 'Eternal Dream Essence', emoji: '💭', type: 'fortune_essence', rarity: 'legendary', insightBonus: 40, luckBonus: 40, value: 12000, description: 'Pure essence distilled from a dream that has lasted a thousand years. Grants visions of eternity.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: FT_STRUCTURES — 25 Temple Structures (upgradeable to L10)
// ═══════════════════════════════════════════════════════════════════

export const FT_STRUCTURES: readonly FtStructureDef[] = [
  // ── Oracle Chambers (7) ──────────────────────────────────────
  { id: 'str_tarot_parlor', name: 'Tarot Parlor', emoji: '🃏', category: 'oracle_chamber', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4, description: 'A cozy reading room with velvet drapes and candlelight for tarot consultations.' },
  { id: 'str_star_tower', name: 'Star Tower', emoji: '🌌', category: 'oracle_chamber', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 80, costMultiplier: 1.5, description: 'A tall tower with an open roof for astronomical observations and astrological readings.' },
  { id: 'str_hexagram_study', name: 'Hexagram Study', emoji: '☯️', category: 'oracle_chamber', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.5, description: 'A quiet study lined with I Ching texts and yarrow stalk bundles.' },
  { id: 'str_rune_crypt', name: 'Rune Crypt', emoji: '🪨', category: 'oracle_chamber', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 180, costMultiplier: 1.6, description: 'An underground crypt where runestones pulse with ancient power in the darkness.' },
  { id: 'str_scrying_chamber', name: 'Scrying Chamber', emoji: '🔮', category: 'oracle_chamber', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 150, costMultiplier: 1.5, description: 'A soundproofed chamber filled with crystals, mirrors, and sacred water for scrying sessions.' },
  { id: 'str_number_sanctum', name: 'Numerology Sanctum', emoji: '🔢', category: 'oracle_chamber', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 160, costMultiplier: 1.5, description: 'A mathematically perfect chamber where numbers float in the air during calculations.' },
  { id: 'str_dream_canopy', name: 'Dream Canopy', emoji: '🌙', category: 'oracle_chamber', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 200, costMultiplier: 1.6, description: 'A silk-draped canopy under which dream readers enter the dream realm at will.' },

  // ── Crystal Gardens (6) ──────────────────────────────────────
  { id: 'str_quartz_garden', name: 'Quartz Garden', emoji: '💎', category: 'crystal_garden', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, description: 'A garden of clear quartz crystals that amplify fortune energy throughout the temple.' },
  { id: 'str_amethyst_grove', name: 'Amethyst Grove', emoji: '💜', category: 'crystal_garden', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 250, costMultiplier: 1.6, description: 'A grove of towering amethyst crystals that enhance spiritual insight and calm the mind.' },
  { id: 'str_obsidian_maze', name: 'Obsidian Maze', emoji: '🖤', category: 'crystal_garden', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 400, costMultiplier: 1.7, description: 'A maze of obsidian mirrors that reveals hidden truths to those who find the center.' },
  { id: 'str_celestial_geode', name: 'Celestial Geode', emoji: '🪨', category: 'crystal_garden', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 600, costMultiplier: 1.8, description: 'A massive geode containing crystal formations that mirror the night sky.' },
  { id: 'str_fortune_cascade', name: 'Fortune Cascade', emoji: '⛰️', category: 'crystal_garden', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 900, costMultiplier: 1.9, description: 'A waterfall flowing over luminescent crystals that wash visitors in luck.' },
  { id: 'str_destiny_crystal_tree', name: 'Destiny Crystal Tree', emoji: '🌳', category: 'crystal_garden', maxLevel: 10, baseEffect: 14, effectPerLevel: 7, baseCost: 850, costMultiplier: 1.9, description: 'A tree with crystal leaves that fall as fortune tokens to those deemed worthy.' },

  // ── Divination Altars (5) ────────────────────────────────────
  { id: 'str_basic_altar', name: 'Basic Divination Altar', emoji: '🏛️', category: 'divination_altar', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 120, costMultiplier: 1.5, description: 'A simple stone altar used for basic fortune telling rituals and offerings.' },
  { id: 'str_celestial_altar', name: 'Celestial Altar', emoji: '⭐', category: 'divination_altar', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.6, description: 'An altar aligned with the stars that boosts the accuracy of all astrological readings.' },
  { id: 'str_fate_altar', name: 'Altar of Fate', emoji: '⚗️', category: 'divination_altar', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 500, costMultiplier: 1.7, description: 'An ancient altar where fate can be directly petitioned through elaborate rituals.' },
  { id: 'str_destiny_altar', name: 'Destiny Altar', emoji: '🌀', category: 'divination_altar', maxLevel: 10, baseEffect: 20, effectPerLevel: 10, baseCost: 800, costMultiplier: 1.8, description: 'The most powerful altar, capable of rewriting small threads of destiny for those who dare.' },
  { id: 'str_cosmic_altar', name: 'Cosmic Unity Altar', emoji: '🌟', category: 'divination_altar', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1200, costMultiplier: 2.0, description: 'An altar that connects all seven divination arts into one unified cosmic reading.' },

  // ── Shrines of Fate (4) ──────────────────────────────────────
  { id: 'str_luck_shrine', name: 'Luck Shrine', emoji: '🍀', category: 'shrine_of_fate', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 200, costMultiplier: 1.5, description: 'A shrine dedicated to Lady Luck. Offerings here increase fortune for all temple visitors.' },
  { id: 'str_karma_shrine', name: 'Karma Shrine', emoji: '☯️', category: 'shrine_of_fate', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 450, costMultiplier: 1.7, description: 'A shrine that balances cosmic karma. Good deeds here amplify rewards tenfold.' },
  { id: 'str_providence_shrine', name: 'Shrine of Providence', emoji: '⏳', category: 'shrine_of_fate', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 700, costMultiplier: 1.8, description: 'A shrine to divine providence that reveals the hidden hand of fate in all things.' },
  { id: 'str_eternity_shrine', name: 'Eternity Shrine', emoji: '♾️', category: 'shrine_of_fate', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1500, costMultiplier: 2.0, description: 'The ultimate shrine. Prayers here echo through eternity, affecting past, present, and future alike.' },

  // ── Destiny Sanctums (3) ─────────────────────────────────────
  { id: 'str_fate_vault', name: 'Fate Vault', emoji: '🔒', category: 'destiny_sanctum', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.5, description: 'A magically sealed vault that stores the most powerful destiny artifacts and relics.' },
  { id: 'str_oracle_archive', name: 'Oracle Archive', emoji: '📚', category: 'destiny_sanctum', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 600, costMultiplier: 1.7, description: 'A vast archive containing every prophecy ever spoken within the Fortune Temple walls.' },
  { id: 'str_fortune_throne_room', name: 'Fortune Throne Room', emoji: '👑', category: 'destiny_sanctum', maxLevel: 10, baseEffect: 30, effectPerLevel: 15, baseCost: 2000, costMultiplier: 2.0, description: 'The legendary throne room where the Fortune Deity once sat. Its power is beyond measure.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: FT_ABILITIES — 22 Fortune Abilities
// ═══════════════════════════════════════════════════════════════════

export const FT_ABILITIES: readonly FtAbilityDef[] = [
  { id: 'ab_quick_draw', name: 'Quick Draw', emoji: '🃏', art: 'tarot', type: 'active', rarity: 'common', karmaCost: 5, cooldown: 30, power: 15, description: 'Rapidly draw three cards for a quick fortune reading.' },
  { id: 'ab_star_blessing', name: 'Star Blessing', emoji: '⭐', art: 'astrology', type: 'active', rarity: 'common', karmaCost: 8, cooldown: 45, power: 20, description: 'Channel the blessing of your ruling star to boost luck for a reading.' },
  { id: 'ab_coin_cast', name: 'Fortune Coin Cast', emoji: '🪙', art: 'iching', type: 'active', rarity: 'common', karmaCost: 10, cooldown: 60, power: 10, description: 'Cast enchanted coins to generate an auspicious hexagram line.' },
  { id: 'ab_rune_mark', name: 'Rune Mark', emoji: 'ᚨ', art: 'runecasting', type: 'active', rarity: 'common', karmaCost: 12, cooldown: 90, power: 5, description: 'Mark an object or person with a temporary luck rune.' },
  { id: 'ab_crystal_focus', name: 'Crystal Focus', emoji: '🔮', art: 'scrying', type: 'active', rarity: 'common', karmaCost: 6, cooldown: 30, power: 12, description: 'Focus a crystal\'s energy to sharpen visions and insights.' },
  { id: 'ab_lucky_number', name: 'Lucky Number', emoji: '7️⃣', art: 'numerology', type: 'active', rarity: 'common', karmaCost: 7, cooldown: 35, power: 10, description: 'Calculate the querent\'s lucky number for the day to influence outcomes.' },
  { id: 'ab_dream_shield', name: 'Dream Shield', emoji: '🌙', art: 'dreamreading', type: 'active', rarity: 'common', karmaCost: 8, cooldown: 40, power: 18, description: 'Erect a dream barrier that protects against nightmares and bad fortune.' },
  { id: 'ab_arcana_spread', name: 'Arcana Spread', emoji: '🎴', art: 'tarot', type: 'active', rarity: 'uncommon', karmaCost: 15, cooldown: 60, power: 30, description: 'Lay out a ten-card Celtic Cross spread for a comprehensive life reading.' },
  { id: 'ab_retrograde_shield', name: 'Retrograde Shield', emoji: '🛡️', art: 'astrology', type: 'active', rarity: 'uncommon', karmaCost: 20, cooldown: 90, power: 35, description: 'Shield against the negative effects of Mercury retrograde and other alignments.' },
  { id: 'ab_hexagram_weave', name: 'Hexagram Weave', emoji: '☯️', art: 'iching', type: 'active', rarity: 'uncommon', karmaCost: 18, cooldown: 75, power: 28, description: 'Weave multiple hexagrams together to reveal complex fortune patterns.' },
  { id: 'ab_odin_gaze', name: 'Odin\'s Gaze', emoji: '👁️', art: 'runecasting', type: 'active', rarity: 'uncommon', karmaCost: 22, cooldown: 100, power: 32, description: 'See through Odin\'s missing eye to perceive hidden truths and fates.' },
  { id: 'ab_celestial_sight', name: 'Celestial Sight', emoji: '🌟', art: 'scrying', type: 'active', rarity: 'uncommon', karmaCost: 15, cooldown: 60, power: 25, description: 'Gaze into the heavens through a crystal to see cosmic events unfold.' },
  { id: 'ab_destiny_calc', name: 'Destiny Calculation', emoji: '📐', art: 'numerology', type: 'active', rarity: 'uncommon', karmaCost: 18, cooldown: 80, power: 22, description: 'Perform a complex numerological calculation to pinpoint critical destiny moments.' },
  { id: 'ab_prophetic_dream', name: 'Prophetic Dream', emoji: '💭', art: 'dreamreading', type: 'active', rarity: 'uncommon', karmaCost: 16, cooldown: 55, power: 30, description: 'Induce a prophetic dream in the querent that reveals their fortune.' },
  { id: 'ab_fate_reversal', name: 'Fate Reversal', emoji: '🔄', art: 'tarot', type: 'active', rarity: 'rare', karmaCost: 30, cooldown: 120, power: 50, description: 'Reverse the meaning of an unlucky card, turning bad fortune into good.' },
  { id: 'ab_cosmic_alignment', name: 'Cosmic Alignment', emoji: '🌌', art: 'astrology', type: 'active', rarity: 'rare', karmaCost: 35, cooldown: 150, power: 55, description: 'Align the celestial bodies in your favor, granting immense insight for one reading.' },
  { id: 'ab_dao_harmony', name: 'Dao Harmony', emoji: '☯️', art: 'iching', type: 'active', rarity: 'rare', karmaCost: 28, cooldown: 110, power: 45, description: 'Achieve perfect harmony between yin and yang, revealing the optimal path forward.' },
  { id: 'ab_fate_sense', name: 'Fate Sense', emoji: '🏃', art: 'runecasting', type: 'passive', rarity: 'rare', karmaCost: 0, cooldown: 0, power: 15, description: 'Automatically sense incoming fate shifts and danger before they arrive.' },
  { id: 'ab_veil_pierce', name: 'Veil Pierce', emoji: '🌀', art: 'scrying', type: 'active', rarity: 'rare', karmaCost: 40, cooldown: 180, power: 60, description: 'Pierce the veil between worlds to see events in alternate timelines.' },
  { id: 'ab_sacred_geometry', name: 'Sacred Geometry', emoji: '🔷', art: 'numerology', type: 'active', rarity: 'rare', karmaCost: 25, cooldown: 120, power: 40, description: 'Construct sacred geometric patterns that amplify fortune energy.' },
  { id: 'ab_dream_weave', name: 'Dream Weave', emoji: '🕸️', art: 'dreamreading', type: 'active', rarity: 'epic', karmaCost: 50, cooldown: 300, power: 80, description: 'Weave a new reality from dream threads, temporarily rewriting a person\'s fortune.' },
  { id: 'ab_fate_overwrite', name: 'Fate Overwrite', emoji: '✍️', art: 'tarot', type: 'active', rarity: 'legendary', karmaCost: 60, cooldown: 600, power: 120, description: 'The ultimate tarot ability: overwrite a page of destiny with a card of your choosing.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: FT_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const FT_ACHIEVEMENTS: readonly FtAchievementDef[] = [
  { id: 'ach_first_consult', name: 'First Consultation', emoji: '🔮', description: 'Consult your first fortune teller.', condition: 'consult_1', reward: { gold: 50, devotion: 10 } },
  { id: 'ach_five_tellers', name: 'Fortune Collector', emoji: '🤚', description: 'Consult 5 different fortune tellers.', condition: 'consult_5', reward: { gold: 200, devotion: 40 } },
  { id: 'ach_first_reading', name: 'Fortune Received', emoji: '📜', description: 'Receive your first fortune reading.', condition: 'reading_1', reward: { gold: 80, devotion: 15 } },
  { id: 'ach_ten_readings', name: 'Oracle Devotee', emoji: '✨', description: 'Receive 10 fortune readings.', condition: 'reading_10', reward: { gold: 300, devotion: 60 } },
  { id: 'ach_first_build', name: 'Groundbreaking', emoji: '🏗️', description: 'Build your first temple structure.', condition: 'build_1', reward: { gold: 100, devotion: 20 } },
  { id: 'ach_five_builds', name: 'Temple Architect', emoji: '🏛️', description: 'Build 5 different temple structures.', condition: 'build_5', reward: { gold: 500, devotion: 80 } },
  { id: 'ach_hall_explore', name: 'Hall Explorer', emoji: '🗺️', description: 'Explore 4 different temple halls.', condition: 'hall_4', reward: { gold: 400, devotion: 50 } },
  { id: 'ach_all_halls', name: 'Temple Cartographer', emoji: '🌍', description: 'Explore all 8 temple halls.', condition: 'hall_8', reward: { gold: 2000, devotion: 200 } },
  { id: 'ach_rare_teller', name: 'Rare Discovery', emoji: '💎', description: 'Consult a rare fortune teller.', condition: 'rare_teller', reward: { gold: 500, devotion: 100 } },
  { id: 'ach_epic_teller', name: 'Epic Revelation', emoji: '🌟', description: 'Consult an epic fortune teller.', condition: 'epic_teller', reward: { gold: 1500, devotion: 250 } },
  { id: 'ach_legendary_teller', name: 'Legendary Oracle', emoji: '👑', description: 'Consult a legendary fortune teller.', condition: 'legendary_teller', reward: { gold: 5000, devotion: 500 } },
  { id: 'ach_first_relic', name: 'Relic Finder', emoji: '🏺', description: 'Discover your first destiny artifact.', condition: 'relic_1', reward: { gold: 300, devotion: 60 } },
  { id: 'ach_five_relics', name: 'Relic Hunter', emoji: '🔍', description: 'Collect 5 different destiny artifacts.', condition: 'relic_5', reward: { gold: 1000, devotion: 150 } },
  { id: 'ach_first_event', name: 'Fate Survivor', emoji: '⚡', description: 'Survive your first fate event.', condition: 'event_1', reward: { gold: 200, devotion: 30 } },
  { id: 'ach_ten_events', name: 'Fate Veteran', emoji: '🏅', description: 'Survive 10 fate events.', condition: 'event_10', reward: { gold: 800, devotion: 120 } },
  { id: 'ach_upgrade_max', name: 'Master Builder', emoji: '🔨', description: 'Upgrade any structure to level 10.', condition: 'upgrade_10', reward: { gold: 2000, devotion: 200 } },
  { id: 'ach_all_arts', name: 'Master of All Arts', emoji: '🌈', description: 'Consult at least one teller from each divination art.', condition: 'all_arts', reward: { gold: 3000, devotion: 300 } },
  { id: 'ach_max_title', name: 'Fortune Deity', emoji: '👑', description: 'Reach the title of Fortune Deity.', condition: 'max_title', reward: { gold: 10000, devotion: 1000 } },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: FT_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const FT_TITLES: readonly FtTitleDef[] = [
  { id: 'title_luck_novice', name: 'Luck Novice', emoji: '🌱', minDevotion: 0, minTellers: 0, description: 'A newcomer to the Fortune Temple, just beginning to sense the flow of fate.' },
  { id: 'title_fate_reader', name: 'Fate Reader', emoji: '🔮', minDevotion: 50, minTellers: 3, description: 'A reader who can interpret basic fortune signs and omens.' },
  { id: 'title_oracle_apprentice', name: 'Oracle Apprentice', emoji: '📜', minDevotion: 200, minTellers: 7, description: 'An apprentice studying under the temple oracles, learning the deeper arts.' },
  { id: 'title_diviner', name: 'Diviner', emoji: '⭐', minDevotion: 500, minTellers: 12, description: 'A skilled diviner whose readings are sought by kings and commoners alike.' },
  { id: 'title_temple_seer', name: 'Temple Seer', emoji: '👁️', minDevotion: 1200, minTellers: 18, description: 'A seer of the temple who can see beyond the veil of the present moment.' },
  { id: 'title_fate_weaver', name: 'Fate Weaver', emoji: '🧵', minDevotion: 2500, minTellers: 24, description: 'One who can weave and reweave threads of fate with practiced hands.' },
  { id: 'title_destiny_lord', name: 'Destiny Lord', emoji: '🐉', minDevotion: 5000, minTellers: 30, description: 'A lord of destiny whose word shapes the fortune of nations.' },
  { id: 'title_fortune_deity', name: 'Fortune Deity', emoji: '👑', minDevotion: 10000, minTellers: 35, description: 'The supreme Fortune Deity, master of all divination arts and weaver of all fates.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: FT_RELICS — 15 Legendary Destiny Artifacts
// ═══════════════════════════════════════════════════════════════════

export const FT_RELICS: readonly FtRelicDef[] = [
  { id: 'relic_fools_crown', name: 'Fool\'s Crown', emoji: '👑', rarity: 'epic', art: 'tarot', insightBoost: 20, luckBoost: 15, wisdomBoost: 10, value: 2000, description: 'A crown shaped like The Fool card. Wearing it grants the innocence to see all possibilities.' },
  { id: 'relic_celestial_orb', name: 'Celestial Orb', emoji: '🔮', rarity: 'epic', art: 'astrology', insightBoost: 35, luckBoost: 5, wisdomBoost: 5, value: 2200, description: 'A miniature orrery that shows the exact positions of every celestial body at any moment.' },
  { id: 'relic_yarrow_bowl', name: 'Sacred Yarrow Bowl', emoji: '🥣', rarity: 'rare', art: 'iching', insightBoost: 10, luckBoost: 10, wisdomBoost: 15, value: 800, description: 'A jade bowl used by the first I Ching masters. Yarrow stalks cast within never produce an incorrect reading.' },
  { id: 'relic_rune_staff', name: 'Elder Rune Staff', emoji: '🪄', rarity: 'rare', art: 'runecasting', insightBoost: 5, luckBoost: 20, wisdomBoost: 10, value: 750, description: 'A staff carved with all 24 Elder Futhark runes. It hums with the voice of the ancient gods.' },
  { id: 'relic_infinite_mirror', name: 'Infinite Mirror', emoji: '🪞', rarity: 'epic', art: 'scrying', insightBoost: 25, luckBoost: 20, wisdomBoost: 15, value: 2500, description: 'A mirror that reflects not the present but all possible futures simultaneously.' },
  { id: 'relic_number_rosary', name: 'Number Rosary', emoji: '📿', rarity: 'epic', art: 'numerology', insightBoost: 15, luckBoost: 15, wisdomBoost: 25, value: 2400, description: 'A rosary with 108 beads, each inscribed with a sacred number. Counting them reveals cosmic truths.' },
  { id: 'relic_dream_gate_key', name: 'Dream Gate Key', emoji: '🗝️', rarity: 'epic', art: 'dreamreading', insightBoost: 20, luckBoost: 25, wisdomBoost: 10, value: 2600, description: 'A key that opens the gate between the waking world and the dream realm at will.' },
  { id: 'relic_wheel_of_fortune', name: 'Wheel of Fortune', emoji: '🎡', rarity: 'legendary', art: 'tarot', insightBoost: 40, luckBoost: 30, wisdomBoost: 20, value: 8000, description: 'The actual Wheel of Fortune from the Major Arcana, brought to life. It turns of its own accord.' },
  { id: 'relic_star_compass', name: 'Star Compass', emoji: '🧭', rarity: 'legendary', art: 'astrology', insightBoost: 30, luckBoost: 40, wisdomBoost: 15, value: 7500, description: 'A compass that points not north but toward the querent\'s most favorable destiny.' },
  { id: 'relic_primordial_i_ching', name: 'Primordial I Ching', emoji: '📕', rarity: 'legendary', art: 'iching', insightBoost: 60, luckBoost: 20, wisdomBoost: 20, value: 10000, description: 'The original Book of Changes written by Fu Xi. Its hexagrams rewrite the laws of chance.' },
  { id: 'relic_odins_eye', name: 'Odin\'s Eye', emoji: '👁️', rarity: 'legendary', art: 'runecasting', insightBoost: 25, luckBoost: 35, wisdomBoost: 30, value: 9000, description: 'The eye Odin sacrificed for wisdom. It sees all fates, past and future.' },
  { id: 'relic_cosmic_crystal', name: 'Cosmic Crystal', emoji: '💎', rarity: 'legendary', art: 'scrying', insightBoost: 35, luckBoost: 35, wisdomBoost: 25, value: 9500, description: 'A crystal containing a pocket universe. Scrying into it reveals the fate of entire civilizations.' },
  { id: 'relic_infinity_calculus', name: 'Infinity Calculus', emoji: '♾️', rarity: 'epic', art: 'numerology', insightBoost: 20, luckBoost: 15, wisdomBoost: 30, value: 2300, description: 'A mathematical text that proves the infinity of luck. Reading it permanently boosts perception.' },
  { id: 'relic_morpheus_chalice', name: 'Chalice of Morpheus', emoji: '🍷', rarity: 'legendary', art: 'dreamreading', insightBoost: 50, luckBoost: 45, wisdomBoost: 25, value: 11000, description: 'A chalice that grants access to the deepest layers of the collective unconscious.' },
  { id: 'relic_fate_loom_fragment', name: 'Fate Loom Fragment', emoji: '🧶', rarity: 'legendary', art: 'tarot', insightBoost: 30, luckBoost: 30, wisdomBoost: 40, value: 12000, description: 'A fragment of the Loom of Fate itself. Those who hold it can feel every thread of destiny.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: FT_EVENTS — 12 Fate Events
// ═══════════════════════════════════════════════════════════════════

export const FT_EVENTS: readonly FtEventDef[] = [
  { id: 'evt_lucky_star', name: 'Lucky Star', emoji: '⭐', durationTurns: 5, effectType: 'buff', effectDescription: 'All fortune readings gain +50% insight. Double luck bonuses.', description: 'A brilliant star appears in the temple sky, bathing all readings in golden light.' },
  { id: 'evt_karma_storm', name: 'Karma Storm', emoji: '🌩️', durationTurns: 3, effectType: 'debuff', effectDescription: 'Devotion gains halved. Fate events trigger more frequently.', description: 'A storm of karmic energy sweeps through the temple, disturbing the cosmic balance.' },
  { id: 'evt_dream_invasion', name: 'Dream Invasion', emoji: '💭', durationTurns: 4, effectType: 'special', effectDescription: 'Dream readers gain +50 power. Prophetic dreams become common.', description: 'The barrier between the dream realm and waking world thins, causing vivid shared dreams.' },
  { id: 'evt_retrograde_mercury', name: 'Mercury Retrograde', emoji: '☿️', durationTurns: 2, effectType: 'debuff', effectDescription: 'Communication-based readings fail 30% more often. Astrology unpredictable.', description: 'Mercury turns retrograde, scrambling signals and disrupting astrological calculations.' },
  { id: 'evt_fortune_rain', name: 'Fortune Rain', emoji: '🌧️', durationTurns: 3, effectType: 'debuff', effectDescription: 'Material drops increased. Reading accuracy decreased.', description: 'Golden coins rain from the temple ceiling. Beautiful but distracting to serious readings.' },
  { id: 'evt_golden_age', name: 'Golden Age', emoji: '🌅', durationTurns: 5, effectType: 'buff', effectDescription: 'Gold rewards doubled. All tellers gain +20% insight.', description: 'The temple enters a golden age of prosperity. Fortune favors every endeavor.' },
  { id: 'evt_lunar_eclipse', name: 'Lunar Eclipse', emoji: '🌑', durationTurns: 4, effectType: 'buff', effectDescription: 'Scrying power tripled. Dream readings enhanced. Fate events unpredictable.', description: 'The moon turns blood red, amplifying all forms of spiritual vision and prophecy.' },
  { id: 'evt_temple_robbery', name: 'Vault Breach', emoji: '🏃', durationTurns: 2, effectType: 'debuff', effectDescription: 'Lose 10% gold. Destiny artifact chance increased.', description: 'Thieves breach the fate vault! But their abandoned tools reveal a hidden passage...' },
  { id: 'evt_cosmic_alignment', name: 'Grand Cosmic Alignment', emoji: '🌌', durationTurns: 3, effectType: 'buff', effectDescription: 'All divination arts gain +40% power. Rare tellers appear.', description: 'All planets align in a once-in-a-millennium configuration. The temple resonates with cosmic energy.' },
  { id: 'evt_fate_fracture', name: 'Fate Fracture', emoji: '💔', durationTurns: 5, effectType: 'debuff', effectDescription: 'Fortune readings become unstable. Unexpected outcomes common.', description: 'A crack appears in the fabric of fate itself. Readings produce contradictory results.' },
  { id: 'evt_oracle_fever', name: 'Oracle Fever', emoji: '🔤', durationTurns: 3, effectType: 'special', effectDescription: 'Bonus devotion for each consultation. Prophecies come faster.', description: 'A contagious excitement sweeps the temple. Visitors demand readings in record numbers.' },
  { id: 'evt_festival_of_fate', name: 'Festival of Fate', emoji: '🎪', durationTurns: 6, effectType: 'buff', effectDescription: 'Consultation cost halved. New tellers appear. Fortune abounds.', description: 'The annual Festival of Fate draws fortune seekers from across the world to the temple.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: INTERNAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const FT_MAX_TELLER_LEVEL = 50
const FT_MAX_STRUCTURE_LEVEL = 10
const FT_INITIAL_GOLD = 200
const FT_INITIAL_DEVOTION = 0

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: HELPER FUNCTIONS (hoisted with `function`)
// ═══════════════════════════════════════════════════════════════════

function ftXpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.25, level - 1))
}

function ftCalcStats(teller: FtTellerDef, level: number) {
  const growth = 1 + (level - 1) * 0.12
  return {
    insightPower: Math.floor(teller.insightPower * growth),
    luckBonus: Math.floor(teller.luckBonus * growth),
    wisdom: Math.floor(teller.wisdom * growth),
  }
}

let _ftIdCounter = 0
function ftGenerateId(): string {
  _ftIdCounter += 1
  return `ft_${_ftIdCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`
}

function ftFindTeller(id: string): FtTellerDef | undefined {
  return FT_TELLERS.find((t) => t.id === id)
}

function ftFindHall(id: string): FtHallDef | undefined {
  return FT_HALLS.find((h) => h.id === id)
}

function ftFindMaterial(id: string): FtMaterialDef | undefined {
  return FT_MATERIALS.find((m) => m.id === id)
}

function ftFindStructureDef(id: string): FtStructureDef | undefined {
  return FT_STRUCTURES.find((s) => s.id === id)
}

function ftFindAbility(id: string): FtAbilityDef | undefined {
  return FT_ABILITIES.find((a) => a.id === id)
}

function ftFindRelic(id: string): FtRelicDef | undefined {
  return FT_RELICS.find((r) => r.id === id)
}

function ftFindAchievement(id: string): FtAchievementDef | undefined {
  return FT_ACHIEVEMENTS.find((a) => a.id === id)
}

function ftFindTitle(id: FtTitleId): FtTitleDef | undefined {
  return FT_TITLES.find((t) => t.id === id)
}

function ftRarityMultiplier(rarity: FtRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 5
    case 'epic': return 10
    case 'legendary': return 25
    default: return 1
  }
}

function ftRarityColor(rarity: FtRarity): string {
  switch (rarity) {
    case 'common': return '#9ca3af'
    case 'uncommon': return '#34d399'
    case 'rare': return '#60a5fa'
    case 'epic': return '#a78bfa'
    case 'legendary': return '#fbbf24'
    default: return '#9ca3af'
  }
}

function ftArtColor(art: FtDivinationArt): string {
  switch (art) {
    case 'tarot': return FT_KARMA_RED
    case 'astrology': return FT_DESTINY_PURPLE
    case 'iching': return FT_FATE_GREEN
    case 'runecasting': return FT_ORACLE_BLUE
    case 'scrying': return FT_CRYSTAL_WHITE
    case 'numerology': return FT_LUNAR_SILVER
    case 'dreamreading': return FT_MYSTIC_INDIGO
    default: return '#888888'
  }
}

export function ftCheckSynergy(attacker: FtDivinationArt, defender: FtDivinationArt): number {
  const advantages = FT_SYNERGY_MAP[attacker]
  if (advantages?.includes(defender)) return 1.4
  const disadvantages = FT_SYNERGY_MAP[defender]
  if (disadvantages?.includes(attacker)) return 0.7
  return 1.0
}

function ftCalcStructureUpgradeCost(def: FtStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

function ftCalcMaxTitle(devotion: number, tellerCount: number): FtTitleId {
  let bestId: FtTitleId = 'title_luck_novice'
  for (const title of FT_TITLES) {
    if (devotion >= title.minDevotion && tellerCount >= title.minTellers) {
      bestId = title.id
    }
  }
  return bestId
}

function ftCheckAchievementCondition(
  condition: string,
  state: FtStoreState
): boolean {
  switch (condition) {
    case 'consult_1':
      return state.totalConsulted >= 1
    case 'consult_5':
      return state.totalConsulted >= 5
    case 'reading_1':
      return state.totalHarvested >= 1
    case 'reading_10':
      return state.totalHarvested >= 10
    case 'build_1':
      return state.totalBuilt >= 1
    case 'build_5':
      return state.totalBuilt >= 5
    case 'hall_4':
      return state.halls.length >= 4
    case 'hall_8':
      return state.halls.length >= 8
    case 'rare_teller':
      return state.tellers.some((t) => {
        const def = ftFindTeller(t.tellerDefId)
        return def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')
      })
    case 'epic_teller':
      return state.tellers.some((t) => {
        const def = ftFindTeller(t.tellerDefId)
        return def && (def.rarity === 'epic' || def.rarity === 'legendary')
      })
    case 'legendary_teller':
      return state.tellers.some((t) => {
        const def = ftFindTeller(t.tellerDefId)
        return def && def.rarity === 'legendary'
      })
    case 'relic_1':
      return state.relics.length >= 1
    case 'relic_5':
      return state.relics.length >= 5
    case 'event_1':
      return state.totalEventsFaced >= 1
    case 'event_10':
      return state.totalEventsFaced >= 10
    case 'upgrade_10':
      return state.structures.some((s) => s.level >= 10)
    case 'all_arts': {
      const arts = new Set<FtDivinationArt>()
      for (const t of state.tellers) {
        const def = ftFindTeller(t.tellerDefId)
        if (def) arts.add(def.art)
      }
      return arts.size >= 7
    }
    case 'max_title':
      return state.currentTitle === 'title_fortune_deity'
    default:
      return false
  }
}

function ftPickRandomEvent(): FtEventDef {
  const idx = Math.floor(Math.random() * FT_EVENTS.length)
  return FT_EVENTS[idx]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const useFtStore = create<FtFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      tellers: [] as FtTellerInstance[],
      halls: [] as string[],
      materials: [] as { materialId: string; count: number }[],
      structures: [] as FtStructureInstance[],
      abilities: [] as string[],
      achievements: [] as string[],
      relics: [] as string[],
      currentTitle: 'title_luck_novice' as FtTitleId,
      gold: FT_INITIAL_GOLD,
      devotion: FT_INITIAL_DEVOTION,
      totalConsulted: 0,
      totalHarvested: 0,
      totalBuilt: 0,
      totalEventsFaced: 0,
      activeEvent: null as FtEventDef | null,
      eventTurnsRemaining: 0,
      activeHall: null as string | null,

      // ── ftConsultTeller ───────────────────────────────────────
      ftConsultTeller: (tellerDefId: string): boolean => {
        const teller = ftFindTeller(tellerDefId)
        if (!teller) return false
        const cost = Math.floor(50 * ftRarityMultiplier(teller.rarity))
        const state = get()
        if (state.gold < cost) return false
        const stats = ftCalcStats(teller, 1)
        const newTeller: FtTellerInstance = {
          id: ftGenerateId(),
          tellerDefId,
          name: teller.name,
          level: 1,
          xp: 0,
          insightPower: stats.insightPower,
          luckBonus: stats.luckBonus,
          wisdom: stats.wisdom,
          devotion: 80,
          favor: 70,
          consultedAt: Date.now(),
        }
        set((prev) => {
          const updated = {
            tellers: [...prev.tellers, newTeller],
            gold: prev.gold - cost,
            totalConsulted: prev.totalConsulted + 1,
            devotion: prev.devotion + ftRarityMultiplier(teller.rarity) * 5,
            currentTitle: ftCalcMaxTitle(
              prev.devotion + ftRarityMultiplier(teller.rarity) * 5,
              prev.tellers.length + 1
            ),
          }
          return updated
        })
        return true
      },

      // ── ftDismissTeller ───────────────────────────────────────
      ftDismissTeller: (tellerId: string): boolean => {
        const state = get()
        const exists = state.tellers.find((t) => t.id === tellerId)
        if (!exists) return false
        const teller = ftFindTeller(exists.tellerDefId)
        const refund = teller ? Math.floor(25 * ftRarityMultiplier(teller.rarity)) : 10
        set((prev) => ({
          tellers: prev.tellers.filter((t) => t.id !== tellerId),
          gold: prev.gold + refund,
          currentTitle: ftCalcMaxTitle(prev.devotion, prev.tellers.length - 1),
        }))
        return true
      },

      // ── ftBlessTeller ─────────────────────────────────────────
      ftBlessTeller: (tellerId: string): boolean => {
        const blessCost = 10
        const state = get()
        if (state.gold < blessCost) return false
        set((prev) => {
          const tellers = prev.tellers.map((t) => {
            if (t.id !== tellerId) return t
            const newXp = t.xp + 20
            const xpNeeded = ftXpForLevel(t.level)
            let newLevel = t.level
            let currentXp = newXp
            if (currentXp >= xpNeeded && t.level < FT_MAX_TELLER_LEVEL) {
              newLevel = t.level + 1
              currentXp = newXp - xpNeeded
            }
            const def = ftFindTeller(t.tellerDefId)
            const stats = def ? ftCalcStats(def, newLevel) : { insightPower: t.insightPower, luckBonus: t.luckBonus, wisdom: t.wisdom }
            return {
              ...t,
              level: newLevel,
              xp: currentXp,
              insightPower: stats.insightPower,
              luckBonus: stats.luckBonus,
              wisdom: stats.wisdom,
              devotion: Math.min(100, t.devotion + 10),
              favor: Math.min(100, t.favor + 20),
            }
          })
          return { tellers, gold: prev.gold - blessCost, devotion: prev.devotion + 2 }
        })
        return true
      },

      // ── ftReadFortune ─────────────────────────────────────────
      ftReadFortune: (tellerId: string): boolean => {
        const state = get()
        const teller = state.tellers.find((t) => t.id === tellerId)
        if (!teller) return false
        if (teller.favor < 20) return false
        const def = ftFindTeller(teller.tellerDefId)
        if (!def) return false
        const materialId = `mat_${def.art}_essence`
        const existingMaterial = state.materials.find((m) => m.materialId === materialId)
        const amount = Math.ceil(teller.insightPower / 10)
        set((prev) => ({
          materials: existingMaterial
            ? prev.materials.map((m) => (m.materialId === materialId ? { ...m, count: m.count + amount } : m))
            : [...prev.materials, { materialId, count: amount }],
          totalHarvested: prev.totalHarvested + 1,
          devotion: prev.devotion + 3,
          tellers: prev.tellers.map((t) =>
            t.id === tellerId ? { ...t, favor: Math.max(0, t.favor - 20) } : t
          ),
        }))
        return true
      },

      // ── ftBuildStructure ──────────────────────────────────────
      ftBuildStructure: (structureDefId: string): boolean => {
        const def = ftFindStructureDef(structureDefId)
        if (!def) return false
        const state = get()
        if (state.gold < def.baseCost) return false
        const alreadyBuilt = state.structures.find((s) => s.structureDefId === structureDefId)
        if (alreadyBuilt) return false
        const newStructure: FtStructureInstance = {
          id: ftGenerateId(),
          structureDefId,
          level: 1,
          builtAt: Date.now(),
        }
        set((prev) => ({
          structures: [...prev.structures, newStructure],
          gold: prev.gold - def.baseCost,
          totalBuilt: prev.totalBuilt + 1,
          devotion: prev.devotion + 10,
        }))
        return true
      },

      // ── ftUpgradeStructure ────────────────────────────────────
      ftUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structure = state.structures.find((s) => s.id === structureId)
        if (!structure) return false
        if (structure.level >= FT_MAX_STRUCTURE_LEVEL) return false
        const def = ftFindStructureDef(structure.structureDefId)
        if (!def) return false
        const cost = ftCalcStructureUpgradeCost(def, structure.level)
        if (state.gold < cost) return false
        set((prev) => ({
          structures: prev.structures.map((s) =>
            s.id === structureId ? { ...s, level: s.level + 1 } : s
          ),
          gold: prev.gold - cost,
          devotion: prev.devotion + Math.floor(def.effectPerLevel * 2),
        }))
        return true
      },

      // ── ftExploreHall ─────────────────────────────────────────
      ftExploreHall: (hallId: string): FtEventDef | null => {
        const hall = ftFindHall(hallId)
        if (!hall) return null
        const state = get()
        const requiredTitleIdx = FT_TITLES.findIndex((t) => t.id === hall.requiredTitle)
        const currentTitleIdx = FT_TITLES.findIndex((t) => t.id === state.currentTitle)
        if (currentTitleIdx < requiredTitleIdx) return null
        const newHalls = state.halls.includes(hallId) ? state.halls : [...state.halls, hallId]
        const event = ftPickRandomEvent()
        set((prev) => ({
          halls: newHalls,
          activeHall: hallId,
          activeEvent: event,
          eventTurnsRemaining: event.durationTurns,
          totalEventsFaced: prev.totalEventsFaced + 1,
          devotion: prev.devotion + 5,
        }))
        return event
      },

      // ── ftCollectRelic ────────────────────────────────────────
      ftCollectRelic: (relicId: string): boolean => {
        const relic = ftFindRelic(relicId)
        if (!relic) return false
        const state = get()
        if (state.relics.includes(relicId)) return false
        set((prev) => ({
          relics: [...prev.relics, relicId],
          devotion: prev.devotion + Math.floor(ftRarityMultiplier(relic.rarity) * 20),
          currentTitle: ftCalcMaxTitle(
            prev.devotion + Math.floor(ftRarityMultiplier(relic.rarity) * 20),
            prev.tellers.length
          ),
        }))
        return true
      },

      // ── ftUnlockAbility ───────────────────────────────────────
      ftUnlockAbility: (abilityId: string): boolean => {
        const ability = ftFindAbility(abilityId)
        if (!ability) return false
        const state = get()
        if (state.abilities.includes(abilityId)) return false
        const cost = Math.floor(100 * ftRarityMultiplier(ability.rarity))
        if (state.gold < cost) return false
        set((prev) => ({
          abilities: [...prev.abilities, abilityId],
          gold: prev.gold - cost,
        }))
        return true
      },

      // ── ftUnlockTitle ─────────────────────────────────────────
      ftUnlockTitle: (titleId: FtTitleId): boolean => {
        const title = ftFindTitle(titleId)
        if (!title) return false
        const state = get()
        if (state.devotion < title.minDevotion) return false
        if (state.tellers.length < title.minTellers) return false
        set((prev) => ({ currentTitle: titleId }))
        return true
      },

      // ── ftClaimAchievement ────────────────────────────────────
      ftClaimAchievement: (achievementId: string): boolean => {
        const achievement = ftFindAchievement(achievementId)
        if (!achievement) return false
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!ftCheckAchievementCondition(achievement.condition, state)) return false
        set((prev) => ({
          achievements: [...prev.achievements, achievementId],
          gold: prev.gold + achievement.reward.gold,
          devotion: prev.devotion + achievement.reward.devotion,
          currentTitle: ftCalcMaxTitle(
            prev.devotion + achievement.reward.devotion,
            prev.tellers.length
          ),
        }))
        return true
      },

      // ── ftTradeMaterial ───────────────────────────────────────
      ftTradeMaterial: (materialId: string, count: number): number => {
        const material = ftFindMaterial(materialId)
        if (!material) return 0
        const state = get()
        const owned = state.materials.find((m) => m.materialId === materialId)
        if (!owned || owned.count < count) return 0
        const goldEarned = material.value * count
        set((prev) => ({
          materials:
            owned.count - count <= 0
              ? prev.materials.filter((m) => m.materialId !== materialId)
              : prev.materials.map((m) => (m.materialId === materialId ? { ...m, count: m.count - count } : m)),
          gold: prev.gold + goldEarned,
        }))
        return goldEarned
      },

      // ── ftEndEvent ────────────────────────────────────────────
      ftEndEvent: () => {
        set({ activeEvent: null, eventTurnsRemaining: 0 })
      },

      // ── ftResetEvent ──────────────────────────────────────────
      ftResetEvent: () => {
        const event = ftPickRandomEvent()
        set({ activeEvent: event, eventTurnsRemaining: event.durationTurns })
      },
    }),
    {
      name: 'fortune-temple-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: MAIN HOOK — useFortuneTemple()
// ═══════════════════════════════════════════════════════════════════

export default function useFortuneTemple() {
  const store = useFtStore()

  // ── Computed: Owned tellers with def info ───────────────────
  const ftOwnedTellers = useMemo(() => {
    return store.tellers.map((t) => {
      const def = ftFindTeller(t.tellerDefId)
      return {
        ...t,
        def,
        artColor: def ? ftArtColor(def.art) : '#888888',
        rarityColor: def ? ftRarityColor(def.rarity) : '#888888',
      }
    })
  }, [store])

  // ── Computed: Available tellers to consult ──────────────────
  const ftAvailableTellers = useMemo(() => {
    return FT_TELLERS.filter((t) => {
      const cost = Math.floor(50 * ftRarityMultiplier(t.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Current title details ─────────────────────────
  const ftCurrentTitleDetail = useMemo(() => {
    return ftFindTitle(store.currentTitle) ?? FT_TITLES[0]
  }, [store])

  // ── Computed: Next title info ───────────────────────────────
  const ftNextTitle = useMemo(() => {
    const currentIdx = FT_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= FT_TITLES.length - 1) return null
    return FT_TITLES[currentIdx + 1]
  }, [store])

  // ── Computed: Active hall details ───────────────────────────
  const ftActiveHallDetail = useMemo(() => {
    if (!store.activeHall) return null
    return ftFindHall(store.activeHall) ?? null
  }, [store])

  // ── Computed: Unexplored halls ──────────────────────────────
  const ftUnexploredHalls = useMemo(() => {
    return FT_HALLS.filter((h) => !store.halls.includes(h.id))
  }, [store])

  // ── Computed: Structures with defs ──────────────────────────
  const ftBuiltStructures = useMemo(() => {
    return store.structures.map((s) => {
      const def = ftFindStructureDef(s.structureDefId)
      return { ...s, def }
    })
  }, [store])

  // ── Computed: Unlockable abilities ──────────────────────────
  const ftUnlockableAbilities = useMemo(() => {
    return FT_ABILITIES.filter((a) => {
      if (store.abilities.includes(a.id)) return false
      const cost = Math.floor(100 * ftRarityMultiplier(a.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Owned relics with defs ────────────────────────
  const ftOwnedRelics = useMemo(() => {
    return store.relics.map((rId) => {
      const def = ftFindRelic(rId)
      return def ?? null
    }).filter((r): r is FtRelicDef => r !== null)
  }, [store])

  // ── Computed: Unclaimed achievements ────────────────────────
  const ftUnclaimedAchievements = useMemo(() => {
    return FT_ACHIEVEMENTS.filter((a) => {
      if (store.achievements.includes(a.id)) return false
      return ftCheckAchievementCondition(a.condition, store)
    })
  }, [store])

  // ── Computed: Materials with defs ───────────────────────────
  const ftInventoryMaterials = useMemo(() => {
    return store.materials.map((m) => {
      const def = ftFindMaterial(m.materialId)
      return { ...m, def }
    })
  }, [store])

  // ── Computed: Total structure effect bonus ──────────────────
  const ftTotalStructureEffect = useMemo(() => {
    let totalEffect = 0
    for (const s of store.structures) {
      const def = ftFindStructureDef(s.structureDefId)
      if (def) {
        totalEffect += def.baseEffect + def.effectPerLevel * (s.level - 1)
      }
    }
    return totalEffect
  }, [store])

  // ── Computed: Average teller level ──────────────────────────
  const ftAverageTellerLevel = useMemo(() => {
    if (store.tellers.length === 0) return 0
    const total = store.tellers.reduce((sum, t) => sum + t.level, 0)
    return Math.floor(total / store.tellers.length)
  }, [store])

  // ── Computed: Total teller power ────────────────────────────
  const ftTotalTellerPower = useMemo(() => {
    return store.tellers.reduce(
      (sum, t) => sum + t.insightPower + t.luckBonus + t.wisdom,
      0
    )
  }, [store])

  // ── Computed: Art distribution ──────────────────────────────
  const ftArtDistribution = useMemo(() => {
    const counts: Record<FtDivinationArt, number> = {
      tarot: 0, astrology: 0, iching: 0, runecasting: 0, scrying: 0, numerology: 0, dreamreading: 0,
    }
    for (const t of store.tellers) {
      const def = ftFindTeller(t.tellerDefId)
      if (def) counts[def.art]++
    }
    return counts
  }, [store])

  // ── Computed: Rarity distribution ───────────────────────────
  const ftRarityDistribution = useMemo(() => {
    const counts: Record<FtRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
    }
    for (const t of store.tellers) {
      const def = ftFindTeller(t.tellerDefId)
      if (def) counts[def.rarity]++
    }
    return counts
  }, [store])

  // ── Computed: Tellers by rarity ─────────────────────────────
  const ftTellersByRarity = useMemo(() => {
    const groups: Record<FtRarity, FtTellerInstance[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    }
    for (const t of store.tellers) {
      const def = ftFindTeller(t.tellerDefId)
      if (def) groups[def.rarity].push(t)
    }
    return groups
  }, [store])

  // ── Computed: Tellers by art ────────────────────────────────
  const ftTellersByArt = useMemo(() => {
    const groups: Record<FtDivinationArt, FtTellerInstance[]> = {
      tarot: [], astrology: [], iching: [], runecasting: [], scrying: [], numerology: [], dreamreading: [],
    }
    for (const t of store.tellers) {
      const def = ftFindTeller(t.tellerDefId)
      if (def) groups[def.art].push(t)
    }
    return groups
  }, [store])

  // ── Computed: Progress to next title ────────────────────────
  const ftTitleProgress = useMemo(() => {
    const next = ftNextTitle
    if (!next) return { percent: 100, devotionNeeded: 0, tellersNeeded: 0 }
    const devotionProgress = Math.min(100, (store.devotion / next.minDevotion) * 100)
    const tellerProgress = Math.min(100, (store.tellers.length / next.minTellers) * 100)
    return {
      percent: Math.floor((devotionProgress + tellerProgress) / 2),
      devotionNeeded: Math.max(0, next.minDevotion - store.devotion),
      tellersNeeded: Math.max(0, next.minTellers - store.tellers.length),
    }
  }, [store, ftNextTitle])

  // ── Computed: Rare materials count ──────────────────────────
  const ftRareMaterialCount = useMemo(() => {
    let count = 0
    for (const m of store.materials) {
      const def = ftFindMaterial(m.materialId)
      if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
        count += m.count
      }
    }
    return count
  }, [store])

  // ── Computed: Unfavored tellers ─────────────────────────────
  const ftUnfavoredTellers = useMemo(() => {
    return store.tellers.filter((t) => t.favor < 30)
  }, [store])

  // ── Computed: Low devotion tellers ──────────────────────────
  const ftLowDevotionTellers = useMemo(() => {
    return store.tellers.filter((t) => t.devotion < 30)
  }, [store])

  // ── Computed: Total relic boost ─────────────────────────────
  const ftTotalRelicBoost = useMemo(() => {
    let insightBoost = 0
    let luckBoost = 0
    let wisdomBoost = 0
    for (const rId of store.relics) {
      const relic = ftFindRelic(rId)
      if (relic) {
        insightBoost += relic.insightBoost
        luckBoost += relic.luckBoost
        wisdomBoost += relic.wisdomBoost
      }
    }
    return { insightBoost, luckBoost, wisdomBoost }
  }, [store])

  // ═════════════════════════════════════════════════════════════
  // Return ftAPI object
  // ═════════════════════════════════════════════════════════════

  const ftAPI = {
    // ── Direct constants ──────────────────────────────────────
    FT_FORTUNE_GOLD,
    FT_DESTINY_PURPLE,
    FT_ORACLE_BLUE,
    FT_FATE_GREEN,
    FT_CRYSTAL_WHITE,
    FT_MYSTIC_INDIGO,
    FT_LUNAR_SILVER,
    FT_KARMA_RED,
    FT_DIVINATION_ARTS,
    FT_TELLERS,
    FT_HALLS,
    FT_MATERIALS,
    FT_STRUCTURES,
    FT_ABILITIES,
    FT_ACHIEVEMENTS,
    FT_TITLES,
    FT_RELICS,
    FT_EVENTS,
    ftCheckSynergy,

    // ── Store state ───────────────────────────────────────────
    tellers: store.tellers,
    halls: store.halls,
    materials: store.materials,
    structures: store.structures,
    abilities: store.abilities,
    achievements: store.achievements,
    relics: store.relics,
    currentTitle: store.currentTitle,
    gold: store.gold,
    devotion: store.devotion,
    totalConsulted: store.totalConsulted,
    totalHarvested: store.totalHarvested,
    totalBuilt: store.totalBuilt,
    totalEventsFaced: store.totalEventsFaced,
    activeEvent: store.activeEvent,
    eventTurnsRemaining: store.eventTurnsRemaining,
    activeHall: store.activeHall,

    // ── Store actions ─────────────────────────────────────────
    ftConsultTeller: store.ftConsultTeller,
    ftDismissTeller: store.ftDismissTeller,
    ftBlessTeller: store.ftBlessTeller,
    ftReadFortune: store.ftReadFortune,
    ftBuildStructure: store.ftBuildStructure,
    ftUpgradeStructure: store.ftUpgradeStructure,
    ftExploreHall: store.ftExploreHall,
    ftCollectRelic: store.ftCollectRelic,
    ftUnlockAbility: store.ftUnlockAbility,
    ftUnlockTitle: store.ftUnlockTitle,
    ftClaimAchievement: store.ftClaimAchievement,
    ftTradeMaterial: store.ftTradeMaterial,
    ftEndEvent: store.ftEndEvent,
    ftResetEvent: store.ftResetEvent,

    // ── Computed getters ──────────────────────────────────────
    ftOwnedTellers,
    ftAvailableTellers,
    ftCurrentTitleDetail,
    ftNextTitle,
    ftActiveHallDetail,
    ftUnexploredHalls,
    ftBuiltStructures,
    ftUnlockableAbilities,
    ftOwnedRelics,
    ftUnclaimedAchievements,
    ftInventoryMaterials,
    ftTotalStructureEffect,
    ftAverageTellerLevel,
    ftTotalTellerPower,
    ftArtDistribution,
    ftRarityDistribution,
    ftTellersByRarity,
    ftTellersByArt,
    ftTitleProgress,
    ftRareMaterialCount,
    ftUnfavoredTellers,
    ftLowDevotionTellers,
    ftTotalRelicBoost,
  }

  return ftAPI
}
