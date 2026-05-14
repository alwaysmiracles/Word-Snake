/**
 * Ivory Spire Wire — Ivory Spire Academy mini-game module
 *
 * A scholarly ivory tower academy: enroll 35 scholar apprentices across 7
 * academic disciplines, study in 8 lecture halls, collect 30 knowledge
 * & tome materials, build 25 academy structures, unlock 22 scholarly
 * abilities, discover 15 legendary grimoire artifacts, face 12 academy
 * events, and ascend through 8 titles from Page Turner to Grand Archon
 * — backed by a Zustand store with persist middleware.
 *
 * Storage key: ivory-spire-wire
 * Prefix: iv / IV_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type IvDiscipline =
  | 'alchemy'
  | 'astronomy'
  | 'history'
  | 'geometry'
  | 'music'
  | 'philosophy'
  | 'runology'

export type IvRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type IvTitleId =
  | 'title_page_turner'
  | 'title_bookworm'
  | 'title_scholar'
  | 'title_sage'
  | 'title_lecturer'
  | 'title_professor'
  | 'title_dean'
  | 'title_grand_archon'

export interface IvDisciplineDef {
  readonly id: IvDiscipline
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface IvScholarDef {
  readonly id: string
  readonly name: string
  readonly discipline: IvDiscipline
  readonly rarity: IvRarity
  readonly intellect: number
  readonly wisdom: number
  readonly focus: number
  readonly description: string
  readonly specialties: string[]
}

export interface IvScholarInstance {
  readonly id: string
  scholarDefId: string
  name: string
  level: number
  xp: number
  intellect: number
  wisdom: number
  focus: number
  morale: number
  fatigue: number
  enrolledAt: number
}

export interface IvHallDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly floor: number
  readonly difficultyLevel: number
  readonly requiredTitle: IvTitleId
  readonly discipline: IvDiscipline
  readonly bgGradient: string
  readonly ambientColor: string
}

export interface IvMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'ink' | 'parchment' | 'quill' | 'tome_fragment' | 'essence'
  readonly rarity: IvRarity
  readonly intellectBonus: number
  readonly wisdomBonus: number
  readonly value: number
  readonly description: string
}

export interface IvStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'classroom' | 'library_wing' | 'research_lab' | 'meditation_chamber' | 'artifact_vault'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface IvStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  builtAt: number
}

export interface IvAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly discipline: IvDiscipline
  readonly type: 'active' | 'passive'
  readonly rarity: IvRarity
  readonly energyCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface IvAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { gold: number; renown: number }
}

export interface IvTitleDef {
  readonly id: IvTitleId
  readonly name: string
  readonly emoji: string
  readonly minRenown: number
  readonly minScholars: number
  readonly description: string
}

export interface IvRelicDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: IvRarity
  readonly discipline: IvDiscipline
  readonly intellectBoost: number
  readonly wisdomBoost: number
  readonly focusBoost: number
  readonly value: number
  readonly description: string
}

export interface IvEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface IvStoreState {
  scholars: IvScholarInstance[]
  halls: string[]
  materials: { materialId: string; count: number }[]
  structures: IvStructureInstance[]
  abilities: string[]
  achievements: string[]
  relics: string[]
  currentTitle: IvTitleId
  gold: number
  renown: number
  totalEnrolled: number
  totalResearched: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: IvEventDef | null
  eventTurnsRemaining: number
  activeHall: string | null
}

export interface IvStoreActions {
  ivEnrollScholar: (scholarDefId: string) => boolean
  ivExpelScholar: (scholarId: string) => boolean
  ivTrainScholar: (scholarId: string) => boolean
  ivResearchTome: (scholarId: string) => boolean
  ivBuildStructure: (structureDefId: string) => boolean
  ivUpgradeStructure: (structureId: string) => boolean
  ivAttendLecture: (hallId: string) => IvEventDef | null
  ivCollectRelic: (relicId: string) => boolean
  ivUnlockAbility: (abilityId: string) => boolean
  ivUnlockTitle: (titleId: IvTitleId) => boolean
  ivClaimAchievement: (achievementId: string) => boolean
  ivTradeMaterial: (materialId: string, count: number) => number
  ivEndEvent: () => void
  ivResetEvent: () => void
}

export interface IvFullStore extends IvStoreState, IvStoreActions {}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS (8 colors)
// ═══════════════════════════════════════════════════════════════════

export const IV_IVORY_CREAM: string = '#FFFFF0'
export const IV_PARCHMENT_GOLD: string = '#DAA520'
export const IV_INK_BLACK: string = '#1A1A1A'
export const IV_ROYAL_PURPLE: string = '#6B21A8'
export const IV_LIBRARY_BROWN: string = '#8B4513'
export const IV_CELESTIAL_BLUE: string = '#1E3A5F'
export const IV_WISDOM_GREEN: string = '#2E7D32'
export const IV_SCROLL_TAN: string = '#D2B48C'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: DISCIPLINE DEFINITIONS (7 disciplines)
// ═══════════════════════════════════════════════════════════════════

export const IV_DISCIPLINES: readonly IvDisciplineDef[] = [
  {
    id: 'alchemy',
    name: 'Alchemy',
    color: IV_PARCHMENT_GOLD,
    description:
      'The transmutation arts. Alchemists seek to transform base materials into wisdom itself, pursuing the legendary Philosopher\'s Stone.',
  },
  {
    id: 'astronomy',
    name: 'Astronomy',
    color: IV_CELESTIAL_BLUE,
    description:
      'The study of celestial bodies and cosmic forces. Astronomers chart the stars to divine the universe\'s deepest secrets.',
  },
  {
    id: 'history',
    name: 'History',
    color: IV_LIBRARY_BROWN,
    description:
      'The chronicle of ages past. Historians preserve the knowledge of fallen empires and forgotten scholars.',
  },
  {
    id: 'geometry',
    name: 'Geometry',
    color: IV_WISDOM_GREEN,
    description:
      'The mathematics of form and space. Geometers unlock the hidden patterns that underpin all reality.',
  },
  {
    id: 'music',
    name: 'Music',
    color: IV_ROYAL_PURPLE,
    description:
      'The harmony of sound and soul. Musicians weave melodies that can heal, inspire, or shatter stone.',
  },
  {
    id: 'philosophy',
    name: 'Philosophy',
    color: IV_SCROLL_TAN,
    description:
      'The pursuit of truth through reason. Philosophers question everything to illuminate the path to enlightenment.',
  },
  {
    id: 'runology',
    name: 'Runology',
    color: IV_INK_BLACK,
    description:
      'The ancient art of enchanted script. Runologists inscribe symbols of power that reshape the fabric of magic.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: DISCIPLINE SYNERGY TABLE
// ═══════════════════════════════════════════════════════════════════

const IV_SYNERGY_MAP: Record<IvDiscipline, IvDiscipline[]> = {
  alchemy: ['astronomy', 'runology'],
  astronomy: ['geometry', 'philosophy'],
  history: ['philosophy', 'music'],
  geometry: ['music', 'alchemy'],
  music: ['runology', 'history'],
  philosophy: ['alchemy', 'history'],
  runology: ['astronomy', 'geometry'],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: IV_SCHOLARS — 35 Scholar Apprentices (5 per discipline)
// ═══════════════════════════════════════════════════════════════════

export const IV_SCHOLARS: readonly IvScholarDef[] = [
  // ── Alchemy Scholars (5) ──────────────────────────────────────
  {
    id: 'alc_inkwell_apprentice',
    name: 'Inkwell Apprentice',
    discipline: 'alchemy',
    rarity: 'common',
    intellect: 12,
    wisdom: 8,
    focus: 18,
    description:
      'A wide-eyed novice who has just begun mixing basic reagents. Their first potion was accidentally blue.',
    specialties: ['basic_brewing'],
  },
  {
    id: 'alc_potion_brewer',
    name: 'Elixir Brewer',
    discipline: 'alchemy',
    rarity: 'uncommon',
    intellect: 22,
    wisdom: 15,
    focus: 20,
    description:
      'A reliable brewer capable of crafting healing elixirs and minor transmutation draughts.',
    specialties: ['basic_brewing', 'elixir_craft'],
  },
  {
    id: 'alc_transmutation_adept',
    name: 'Transmutation Adept',
    discipline: 'alchemy',
    rarity: 'rare',
    intellect: 45,
    wisdom: 30,
    focus: 25,
    description:
      'A skilled transmuter who can change lead to silver and knows three of the seven sacred formulas.',
    specialties: ['basic_brewing', 'elixir_craft', 'minor_transmute'],
  },
  {
    id: 'alc_grand_alchemist',
    name: 'Grand Alchemist',
    discipline: 'alchemy',
    rarity: 'epic',
    intellect: 70,
    wisdom: 55,
    focus: 35,
    description:
      'A master of elemental transmutation who commands fire, water, and earth with a single gesture.',
    specialties: ['basic_brewing', 'elixir_craft', 'minor_transmute', 'elemental_transmute'],
  },
  {
    id: 'alc_philosopher_seeker',
    name: "Philosopher's Stone Seeker",
    discipline: 'alchemy',
    rarity: 'legendary',
    intellect: 110,
    wisdom: 90,
    focus: 50,
    description:
      'The last seeker of the Philosopher\'s Stone. Their research has uncovered fragments of the original formula.',
    specialties: ['basic_brewing', 'elixir_craft', 'minor_transmute', 'elemental_transmute', 'stone_ritual'],
  },

  // ── Astronomy Scholars (5) ────────────────────────────────────
  {
    id: 'ast_star_gazer',
    name: 'Star Gazer',
    discipline: 'astronomy',
    rarity: 'common',
    intellect: 10,
    wisdom: 14,
    focus: 16,
    description:
      'A young dreamer who spends nights on the spire\'s observatory deck, charting constellations by candlelight.',
    specialties: ['star_chart'],
  },
  {
    id: 'ast_constellation_mapper',
    name: 'Constellation Mapper',
    discipline: 'astronomy',
    rarity: 'uncommon',
    intellect: 25,
    wisdom: 20,
    focus: 22,
    description:
      'An meticulous cartographer of the night sky who has mapped over two hundred stellar formations.',
    specialties: ['star_chart', 'constellation_routine'],
  },
  {
    id: 'ast_celestial_navigator',
    name: 'Celestial Navigator',
    discipline: 'astronomy',
    rarity: 'rare',
    intellect: 42,
    wisdom: 38,
    focus: 30,
    description:
      'A navigator who can plot courses by starlight alone and has journeyed to three hidden observatories.',
    specialties: ['star_chart', 'constellation_routine', 'celestial_navigation'],
  },
  {
    id: 'ast_astral_theorist',
    name: 'Astral Theorist',
    discipline: 'astronomy',
    rarity: 'epic',
    intellect: 65,
    wisdom: 60,
    focus: 40,
    description:
      'A brilliant theorist who has calculated the positions of all known planets for the next millennium.',
    specialties: ['star_chart', 'constellation_routine', 'celestial_navigation', 'astral_projection'],
  },
  {
    id: 'ast_cosmic_oracle',
    name: 'Cosmic Oracle',
    discipline: 'astronomy',
    rarity: 'legendary',
    intellect: 100,
    wisdom: 95,
    focus: 55,
    description:
      'An oracle who communes with distant stars and can foretell cosmic events before they occur.',
    specialties: ['star_chart', 'constellation_routine', 'celestial_navigation', 'astral_projection', 'cosmic_vision'],
  },

  // ── History Scholars (5) ──────────────────────────────────────
  {
    id: 'his_scroll_reader',
    name: 'Scroll Reader',
    discipline: 'history',
    rarity: 'common',
    intellect: 15,
    wisdom: 10,
    focus: 14,
    description:
      'A diligent reader who has devoured every scroll in the first-floor archive room.',
    specialties: ['ancient_text'],
  },
  {
    id: 'his_archive_scholar',
    name: 'Archive Scholar',
    discipline: 'history',
    rarity: 'uncommon',
    intellect: 28,
    wisdom: 22,
    focus: 18,
    description:
      'A dedicated archivist who has catalogued the spire\'s oldest surviving manuscripts.',
    specialties: ['ancient_text', 'archive_mastery'],
  },
  {
    id: 'his_chronicler',
    name: 'Chronicler of Ages',
    discipline: 'history',
    rarity: 'rare',
    intellect: 48,
    wisdom: 40,
    focus: 22,
    description:
      'A chronicler who can recite the lineage of every Ivory Spire Grand Archon from memory.',
    specialties: ['ancient_text', 'archive_mastery', 'chronicle_binding'],
  },
  {
    id: 'his_loremaster',
    name: 'Loremaster',
    discipline: 'history',
    rarity: 'epic',
    intellect: 72,
    wisdom: 62,
    focus: 30,
    description:
      'A loremaster who has read texts from civilizations that predate recorded history itself.',
    specialties: ['ancient_text', 'archive_mastery', 'chronicle_binding', 'ancestral_recall'],
  },
  {
    id: 'his_time_walker',
    name: 'Time Walker',
    discipline: 'history',
    rarity: 'legendary',
    intellect: 105,
    wisdom: 100,
    focus: 45,
    description:
      'A scholar who has glimpsed the flow of time itself and walks between past and future with equal ease.',
    specialties: ['ancient_text', 'archive_mastery', 'chronicle_binding', 'ancestral_recall', 'time_sight'],
  },

  // ── Geometry Scholars (5) ─────────────────────────────────────
  {
    id: 'geo_angle_student',
    name: 'Angle Student',
    discipline: 'geometry',
    rarity: 'common',
    intellect: 14,
    wisdom: 8,
    focus: 20,
    description:
      'A precise student who measures every angle twice and derives elegant proofs on slate tablets.',
    specialties: ['proof_craft'],
  },
  {
    id: 'geo_shape_weaver',
    name: 'Shape Weaver',
    discipline: 'geometry',
    rarity: 'uncommon',
    intellect: 26,
    wisdom: 18,
    focus: 24,
    description:
      'A weaver of geometric forms who can construct perfect platonic solids from pure imagination.',
    specialties: ['proof_craft', 'shape_construction'],
  },
  {
    id: 'geo_architect_forms',
    name: 'Architect of Forms',
    discipline: 'geometry',
    rarity: 'rare',
    intellect: 44,
    wisdom: 35,
    focus: 28,
    description:
      'An architect who designs impossible structures that defy gravity and conventional mathematics.',
    specialties: ['proof_craft', 'shape_construction', 'spatial_design'],
  },
  {
    id: 'geo_spatial_sage',
    name: 'Spatial Sage',
    discipline: 'geometry',
    rarity: 'epic',
    intellect: 68,
    wisdom: 58,
    focus: 38,
    description:
      'A sage who perceives dimensions beyond the three and can fold space with geometric equations.',
    specialties: ['proof_craft', 'shape_construction', 'spatial_design', 'dimension_folding'],
  },
  {
    id: 'geo_dimensional_archon',
    name: 'Dimensional Archon',
    discipline: 'geometry',
    rarity: 'legendary',
    intellect: 108,
    wisdom: 92,
    focus: 48,
    description:
      'An archon who has glimpsed the twelfth dimension and returned with knowledge that reshapes reality.',
    specialties: ['proof_craft', 'shape_construction', 'spatial_design', 'dimension_folding', 'reality_equation'],
  },

  // ── Music Scholars (5) ────────────────────────────────────────
  {
    id: 'mus_humming_pupil',
    name: 'Humming Pupil',
    discipline: 'music',
    rarity: 'common',
    intellect: 8,
    wisdom: 18,
    focus: 12,
    description:
      'A cheerful pupil who hums constantly and has an uncanny ability to remember any melody after one hearing.',
    specialties: ['basic_melody'],
  },
  {
    id: 'mus_chant_practitioner',
    name: 'Chant Practitioner',
    discipline: 'music',
    rarity: 'uncommon',
    intellect: 16,
    wisdom: 30,
    focus: 20,
    description:
      'A disciplined vocalist whose chants can calm anxious scholars and soothe restless spirits.',
    specialties: ['basic_melody', 'sonic_chant'],
  },
  {
    id: 'mus_symphony_weaver',
    name: 'Symphony Weaver',
    discipline: 'music',
    rarity: 'rare',
    intellect: 28,
    wisdom: 48,
    focus: 32,
    description:
      'A composer whose symphonies can evoke specific emotions and memories in any listener.',
    specialties: ['basic_melody', 'sonic_chant', 'symphony_weave'],
  },
  {
    id: 'mus_bardic_sage',
    name: 'Bardic Sage',
    discipline: 'music',
    rarity: 'epic',
    intellect: 40,
    wisdom: 72,
    focus: 38,
    description:
      'A sage whose songs carry ancient knowledge encoded in harmonic frequencies beyond normal hearing.',
    specialties: ['basic_melody', 'sonic_chant', 'symphony_weave', 'bardic_enchantment'],
  },
  {
    id: 'mus_harmony_incarnate',
    name: 'Harmony Incarnate',
    discipline: 'music',
    rarity: 'legendary',
    intellect: 55,
    wisdom: 110,
    focus: 48,
    description:
      'The living embodiment of universal harmony. A single note from their voice can reshape the fabric of emotion.',
    specialties: ['basic_melody', 'sonic_chant', 'symphony_weave', 'bardic_enchantment', 'cosmic_resonance'],
  },

  // ── Philosophy Scholars (5) ───────────────────────────────────
  {
    id: 'phi_questioning_mind',
    name: 'Questioning Mind',
    discipline: 'philosophy',
    rarity: 'common',
    intellect: 16,
    wisdom: 12,
    focus: 15,
    description:
      'A relentless questioner who challenges every assumption and has argued with three professors this week.',
    specialties: ['socratic_method'],
  },
  {
    id: 'phi_dialectic_debater',
    name: 'Dialectic Debater',
    discipline: 'philosophy',
    rarity: 'uncommon',
    intellect: 30,
    wisdom: 24,
    focus: 18,
    description:
      'A master debater whose dialectic reasoning has won seven consecutive academy discourse tournaments.',
    specialties: ['socratic_method', 'dialectic_logic'],
  },
  {
    id: 'phi_wisdom_seeker',
    name: 'Wisdom Seeker',
    discipline: 'philosophy',
    rarity: 'rare',
    intellect: 50,
    wisdom: 42,
    focus: 25,
    description:
      'A seeker who has meditated for forty days and emerged with insights that confounded the entire faculty.',
    specialties: ['socratic_method', 'dialectic_logic', 'inner_vision'],
  },
  {
    id: 'phi_grand_thinker',
    name: 'Grand Thinker',
    discipline: 'philosophy',
    rarity: 'epic',
    intellect: 74,
    wisdom: 64,
    focus: 35,
    description:
      'A thinker whose philosophical treatises are studied in every academy across the known world.',
    specialties: ['socratic_method', 'dialectic_logic', 'inner_vision', 'paradigm_shift'],
  },
  {
    id: 'phi_ascended_philosopher',
    name: 'Ascended Philosopher',
    discipline: 'philosophy',
    rarity: 'legendary',
    intellect: 102,
    wisdom: 98,
    focus: 52,
    description:
      'A philosopher who has transcended mortal thought. Their very presence inspires enlightenment in all nearby scholars.',
    specialties: ['socratic_method', 'dialectic_logic', 'inner_vision', 'paradigm_shift', 'enlightenment_aura'],
  },

  // ── Runology Scholars (5) ─────────────────────────────────────
  {
    id: 'run_rune_carver',
    name: 'Rune Carver',
    discipline: 'runology',
    rarity: 'common',
    intellect: 14,
    wisdom: 10,
    focus: 22,
    description:
      'A patient carver who inscribes basic protective runes on academy doorways and desk surfaces.',
    specialties: ['basic_rune'],
  },
  {
    id: 'run_sigil_inscriber',
    name: 'Sigil Inscriber',
    discipline: 'runology',
    rarity: 'uncommon',
    intellect: 28,
    wisdom: 20,
    focus: 26,
    description:
      'An inscriber of complex sigils whose enchanted markings can ward entire rooms from eavesdropping.',
    specialties: ['basic_rune', 'sigil_binding'],
  },
  {
    id: 'run_glyph_master',
    name: 'Glyph Master',
    discipline: 'runology',
    rarity: 'rare',
    intellect: 46,
    wisdom: 36,
    focus: 30,
    description:
      'A glyph master who has rediscovered three lost runic alphabets and can read the oldest inscriptions.',
    specialties: ['basic_rune', 'sigil_binding', 'glyph_weaving'],
  },
  {
    id: 'run_arcane_rune_lord',
    name: 'Arcane Rune-Lord',
    discipline: 'runology',
    rarity: 'epic',
    intellect: 70,
    wisdom: 58,
    focus: 40,
    description:
      'A rune-lord whose inscriptions carry the weight of ancient civilizations and can reshape magical fields.',
    specialties: ['basic_rune', 'sigil_binding', 'glyph_weaving', 'arcane_inscription'],
  },
  {
    id: 'run_primordial_scribe',
    name: 'Primordial Scribe',
    discipline: 'runology',
    rarity: 'legendary',
    intellect: 112,
    wisdom: 88,
    focus: 52,
    description:
      'The last scribe who can write in the Primordial Script, the language said to have created the world.',
    specialties: ['basic_rune', 'sigil_binding', 'glyph_weaving', 'arcane_inscription', 'creation_script'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: IV_HALLS — 8 Lecture Halls
// ═══════════════════════════════════════════════════════════════════

export const IV_HALLS: readonly IvHallDef[] = [
  {
    id: 'hall_foundation',
    name: 'Foundation Hall',
    description:
      'The ground-floor lecture hall where all new apprentices receive their first lessons. Rows of worn wooden desks face a towering chalkboard.',
    floor: 0,
    difficultyLevel: 1,
    requiredTitle: 'title_page_turner',
    discipline: 'philosophy',
    bgGradient: 'linear-gradient(180deg, #FFFFF0 0%, #D2B48C 50%, #8B4513 100%)',
    ambientColor: IV_IVORY_CREAM,
  },
  {
    id: 'hall_starlight',
    name: 'Starlight Observatory',
    description:
      'A domed chamber on the second floor with a retractable ceiling. Astronomers gather here to study the night sky through enchanted lenses.',
    floor: 1,
    difficultyLevel: 2,
    requiredTitle: 'title_page_turner',
    discipline: 'astronomy',
    bgGradient: 'linear-gradient(180deg, #1E3A5F 0%, #FFFFF0 50%, #DAA520 100%)',
    ambientColor: IV_CELESTIAL_BLUE,
  },
  {
    id: 'hall_ancient_texts',
    name: 'Hall of Ancient Texts',
    description:
      'A vast library hall lined floor-to-ceiling with crumbling scrolls and leather-bound tomes. History scholars spend decades here.',
    floor: 2,
    difficultyLevel: 3,
    requiredTitle: 'title_bookworm',
    discipline: 'history',
    bgGradient: 'linear-gradient(180deg, #8B4513 0%, #D2B48C 50%, #FFFFF0 100%)',
    ambientColor: IV_LIBRARY_BROWN,
  },
  {
    id: 'hall_alchemical_furnace',
    name: 'Alchemical Furnace Hall',
    description:
      'A heat-filled laboratory where bubbling cauldrons and crackling furnaces line the walls. The air smells of sulfur and possibility.',
    floor: 3,
    difficultyLevel: 4,
    requiredTitle: 'title_scholar',
    discipline: 'alchemy',
    bgGradient: 'linear-gradient(180deg, #DAA520 0%, #1A1A1A 50%, #FFFFF0 100%)',
    ambientColor: IV_PARCHMENT_GOLD,
  },
  {
    id: 'hall_sacred_geometry',
    name: 'Sacred Geometry Chamber',
    description:
      'A hexagonal room where geometric patterns shift and glow on every surface. The laws of mathematics are visible in the air itself.',
    floor: 4,
    difficultyLevel: 5,
    requiredTitle: 'title_sage',
    discipline: 'geometry',
    bgGradient: 'linear-gradient(180deg, #2E7D32 0%, #FFFFF0 50%, #1E3A5F 100%)',
    ambientColor: IV_WISDOM_GREEN,
  },
  {
    id: 'hall_echoing_voices',
    name: 'Hall of Echoing Voices',
    description:
      'A perfectly acoustical chamber where the slightest whisper carries to every corner. Musicians compose their masterpieces here.',
    floor: 5,
    difficultyLevel: 6,
    requiredTitle: 'title_lecturer',
    discipline: 'music',
    bgGradient: 'linear-gradient(180deg, #6B21A8 0%, #D2B48C 50%, #FFFFF0 100%)',
    ambientColor: IV_ROYAL_PURPLE,
  },
  {
    id: 'hall_runic_circles',
    name: 'Runic Circle Sanctum',
    description:
      'A chamber inscribed with countless glowing runic circles. Only master runologists can safely navigate the shifting patterns.',
    floor: 6,
    difficultyLevel: 7,
    requiredTitle: 'title_professor',
    discipline: 'runology',
    bgGradient: 'linear-gradient(180deg, #1A1A1A 0%, #6B21A8 50%, #DAA520 100%)',
    ambientColor: IV_INK_BLACK,
  },
  {
    id: 'hall_ivory_crown',
    name: 'Ivory Crown Apex',
    description:
      'The pinnacle chamber at the very top of the spire. All disciplines converge here. Only the Grand Archon may unlock its doors.',
    floor: 7,
    difficultyLevel: 8,
    requiredTitle: 'title_dean',
    discipline: 'philosophy',
    bgGradient: 'linear-gradient(180deg, #FFFFF0 0%, #DAA520 50%, #6B21A8 100%)',
    ambientColor: IV_PARCHMENT_GOLD,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: IV_MATERIALS — 30 Knowledge/Tome Materials
// ═══════════════════════════════════════════════════════════════════

export const IV_MATERIALS: readonly IvMaterialDef[] = [
  // Common (8)
  { id: 'mat_basic_ink', name: 'Basic Quill Ink', emoji: '🖋️', type: 'ink', rarity: 'common', intellectBonus: 2, wisdomBonus: 1, value: 10, description: 'A small vial of standard academy ink, perfect for taking lecture notes.' },
  { id: 'mat_scrap_parchment', name: 'Scrap Parchment', emoji: '📜', type: 'parchment', rarity: 'common', intellectBonus: 1, wisdomBonus: 3, value: 12, description: 'A torn piece of parchment salvaged from the archive recycling bin.' },
  { id: 'mat_goose_quill', name: 'Goose Feather Quill', emoji: '🪶', type: 'quill', rarity: 'common', intellectBonus: 3, wisdomBonus: 0, value: 14, description: 'A sturdy goose quill, the standard writing instrument of every apprentice.' },
  { id: 'mat_chalk_dust', name: 'Chalk Dust', emoji: '🧹', type: 'essence', rarity: 'common', intellectBonus: 2, wisdomBonus: 2, value: 8, description: 'Fine chalk dust scraped from the foundation hall blackboards.' },
  { id: 'mat_student_notes', name: 'Student Notes', emoji: '📝', type: 'parchment', rarity: 'common', intellectBonus: 4, wisdomBonus: 0, value: 15, description: 'Crammed notes from a diligent student, dense with facts and formulas.' },
  { id: 'mat_iron_ink', name: 'Iron Gall Ink', emoji: '⚗️', type: 'ink', rarity: 'common', intellectBonus: 3, wisdomBonus: 2, value: 16, description: 'Dark iron gall ink that resists fading. Used for permanent records.' },
  { id: 'mat_owl_quill', name: 'Owl Feather Quill', emoji: '🦉', type: 'quill', rarity: 'common', intellectBonus: 5, wisdomBonus: 1, value: 18, description: 'A quill from the academy\'s resident owl. Said to improve recall when writing.' },
  { id: 'mat_wax_seal', name: 'Wax Seal Fragment', emoji: '🔴', type: 'tome_fragment', rarity: 'common', intellectBonus: 0, wisdomBonus: 4, value: 11, description: 'A broken wax seal from a sealed academy document, still faintly warm.' },

  // Uncommon (7)
  { id: 'mat_silver_ink', name: 'Silver Ink', emoji: '✨', type: 'ink', rarity: 'uncommon', intellectBonus: 10, wisdomBonus: 3, value: 80, description: 'Shimmering silver ink that glows faintly in moonlight, used for enchanting texts.' },
  { id: 'mat_vellum_sheet', name: 'Vellum Sheet', emoji: '📜', type: 'parchment', rarity: 'uncommon', intellectBonus: 5, wisdomBonus: 8, value: 65, description: 'Fine calfskin vellum, smooth and durable enough for important treatises.' },
  { id: 'mat_phoenix_quill', name: 'Phoenix Quill', emoji: '🔥', type: 'quill', rarity: 'uncommon', intellectBonus: 12, wisdomBonus: 4, value: 90, description: 'A quill from a phoenix feather. It never runs dry and writes with inner fire.' },
  { id: 'mat_runic_ink', name: 'Runic Ink', emoji: '🪄', type: 'ink', rarity: 'uncommon', intellectBonus: 8, wisdomBonus: 8, value: 75, description: 'Ink infused with ground runic powder. Writing with it creates faint magical effects.' },
  { id: 'mat_star_chart', name: 'Star Chart Fragment', emoji: '⭐', type: 'tome_fragment', rarity: 'uncommon', intellectBonus: 10, wisdomBonus: 6, value: 85, description: 'A fragment of an ancient star chart showing constellations no longer visible.' },
  { id: 'mat_sage_wisdom', name: 'Sage Wisdom Essence', emoji: '💜', type: 'essence', rarity: 'uncommon', intellectBonus: 6, wisdomBonus: 12, value: 72, description: 'Distilled wisdom from a meditation session with a senior sage.' },
  { id: 'mat_alchemical_residue', name: 'Alchemical Residue', emoji: '🧪', type: 'essence', rarity: 'uncommon', intellectBonus: 14, wisdomBonus: 2, value: 78, description: 'A crystalline residue left behind by a transmutation experiment.' },

  // Rare (6)
  { id: 'mat_royal_parchment', name: 'Royal Parchment Scroll', emoji: '📜', type: 'parchment', rarity: 'rare', intellectBonus: 15, wisdomBonus: 15, value: 350, description: 'A scroll made from royal parchment, reserved for the most important academy decrees.' },
  { id: 'mat_dragon_quill', name: 'Dragon Scale Quill', emoji: '🐉', type: 'quill', rarity: 'rare', intellectBonus: 25, wisdomBonus: 10, value: 320, description: 'A quill carved from a dragon scale. It writes with authority and commands attention.' },
  { id: 'mat_celestial_ink', name: 'Celestial Ink', emoji: '🌌', type: 'ink', rarity: 'rare', intellectBonus: 20, wisdomBonus: 18, value: 380, description: 'Ink brewed from starlight essence. Texts written with it shimmer with cosmic energy.' },
  { id: 'mat_primordial_dust', name: 'Primordial Dust', emoji: '✴️', type: 'essence', rarity: 'rare', intellectBonus: 18, wisdomBonus: 20, value: 360, description: 'Dust gathered from the Ivory Crown Apex, said to contain fragments of creation.' },
  { id: 'mat_ancient_tome_page', name: 'Ancient Tome Page', emoji: '📖', type: 'tome_fragment', rarity: 'rare', intellectBonus: 22, wisdomBonus: 14, value: 400, description: 'A single page from a tome older than the academy itself, covered in forgotten script.' },
  { id: 'mat_harmony_crystal', name: 'Harmony Crystal', emoji: '💎', type: 'essence', rarity: 'rare', intellectBonus: 12, wisdomBonus: 25, value: 340, description: 'A crystal that resonates with perfect harmonic frequencies when held near music.' },

  // Epic (5)
  { id: 'mat_void_ink', name: 'Void Ink', emoji: '🕳️', type: 'ink', rarity: 'epic', intellectBonus: 40, wisdomBonus: 30, value: 1500, description: 'Ink distilled from the spaces between dimensions. Writing with it bridges realities.' },
  { id: 'mat_time_parchment', name: 'Parchment of Ages', emoji: '⏳', type: 'parchment', rarity: 'epic', intellectBonus: 30, wisdomBonus: 45, value: 1600, description: 'Parchment that exists in multiple time periods simultaneously.' },
  { id: 'mat_arcane_quill', name: 'Arcane Sapphire Quill', emoji: '💠', type: 'quill', rarity: 'epic', intellectBonus: 50, wisdomBonus: 25, value: 1800, description: 'A quill tipped with a sapphire that channels arcane energy directly onto the page.' },
  { id: 'mat_grand_essence', name: 'Grand Archon Essence', emoji: '👑', type: 'essence', rarity: 'epic', intellectBonus: 35, wisdomBonus: 40, value: 1700, description: 'Essence extracted from the personal effects of a former Grand Archon.' },
  { id: 'mat_forbidden_page', name: 'Forbidden Grimoire Page', emoji: '📕', type: 'tome_fragment', rarity: 'epic', intellectBonus: 45, wisdomBonus: 35, value: 1400, description: 'A page torn from a forbidden grimoire locked in the deepest vault.' },

  // Legendary (4)
  { id: 'mat_creation_ink', name: 'Ink of Creation', emoji: '🌟', type: 'ink', rarity: 'legendary', intellectBonus: 80, wisdomBonus: 60, value: 8000, description: 'The original ink used by the founders to write the academy into existence.' },
  { id: 'mat_infinite_scroll', name: 'Infinite Scroll', emoji: '📜', type: 'parchment', rarity: 'legendary', intellectBonus: 60, wisdomBonus: 80, value: 9000, description: 'A scroll that unrolls endlessly, containing the sum of all knowledge past and future.' },
  { id: 'mat_archon_quill', name: "Archon's Destiny Quill", emoji: '🪶', type: 'quill', rarity: 'legendary', intellectBonus: 100, wisdomBonus: 50, value: 10000, description: 'The quill that writes destiny itself. Whatever it inscribes becomes reality.' },
  { id: 'mat_cosmic_essence', name: 'Cosmic Wisdom Essence', emoji: '🔮', type: 'essence', rarity: 'legendary', intellectBonus: 70, wisdomBonus: 90, value: 12000, description: 'Pure distilled cosmic wisdom from the moment the first star ignited.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: IV_STRUCTURES — 25 Academy Structures (upgradeable to L10)
// ═══════════════════════════════════════════════════════════════════

export const IV_STRUCTURES: readonly IvStructureDef[] = [
  // ── Classrooms (7) ────────────────────────────────────────────
  { id: 'str_basics_classroom', name: 'Basics Classroom', emoji: '📋', category: 'classroom', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4, description: 'A simple classroom with slate desks and a chalkboard for foundational lectures.' },
  { id: 'str_alchemy_lab', name: 'Alchemy Workshop', emoji: '⚗️', category: 'classroom', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 80, costMultiplier: 1.5, description: 'A workshop equipped with cauldrons and alembics for practical alchemy instruction.' },
  { id: 'str_observatory_wing', name: 'Observatory Wing', emoji: '🔭', category: 'classroom', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.5, description: 'An elevated wing with telescopes and star charts for astronomy scholars.' },
  { id: 'str_archive_room', name: 'Private Archive Room', emoji: '📚', category: 'classroom', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 180, costMultiplier: 1.6, description: 'A climate-controlled archive room for preserving and studying rare manuscripts.' },
  { id: 'str_geometry_studio', name: 'Geometry Studio', emoji: '📐', category: 'classroom', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 150, costMultiplier: 1.5, description: 'A studio with interactive geometric models and three-dimensional chalkboards.' },
  { id: 'str_music_room', name: 'Acoustic Practice Room', emoji: '🎵', category: 'classroom', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 160, costMultiplier: 1.5, description: 'A soundproofed room with enchanted instruments that tune themselves to the player.' },
  { id: 'str_runic_chamber', name: 'Runic Inscription Chamber', emoji: '🔲', category: 'classroom', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 200, costMultiplier: 1.6, description: 'A shielded chamber where runologists practice inscribing magical symbols safely.' },

  // ── Library Wings (6) ─────────────────────────────────────────
  { id: 'str_reading_room', name: 'Common Reading Room', emoji: '📖', category: 'library_wing', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, description: 'A quiet reading room stocked with introductory texts for all disciplines.' },
  { id: 'str_reference_hall', name: 'Grand Reference Hall', emoji: '🏛️', category: 'library_wing', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 250, costMultiplier: 1.6, description: 'An expansive hall containing encyclopedias and reference materials spanning every subject.' },
  { id: 'str_forbidden_section', name: 'Restricted Section', emoji: '🔒', category: 'library_wing', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 400, costMultiplier: 1.7, description: 'A locked section housing dangerous and forbidden texts. Access requires special clearance.' },
  { id: 'str_scroll_vault', name: 'Ancient Scroll Vault', emoji: '🏺', category: 'library_wing', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 600, costMultiplier: 1.8, description: 'A vault preserving the oldest scrolls in existence, some written by the academy founders.' },
  { id: 'str_living_library', name: 'Living Library', emoji: '🌳', category: 'library_wing', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 900, costMultiplier: 1.9, description: 'A library where the books are alive and can answer questions about their contents.' },
  { id: 'str_cosmic_archive', name: 'Cosmic Archive', emoji: '🌌', category: 'library_wing', maxLevel: 10, baseEffect: 14, effectPerLevel: 7, baseCost: 850, costMultiplier: 1.9, description: 'An archive that contains copies of every book ever written across all planes of existence.' },

  // ── Research Labs (5) ─────────────────────────────────────────
  { id: 'str_basic_research', name: 'Basic Research Desk', emoji: '🔬', category: 'research_lab', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 120, costMultiplier: 1.5, description: 'A simple desk with basic equipment for conducting entry-level research.' },
  { id: 'str_theory_laboratory', name: 'Theory Laboratory', emoji: '🧪', category: 'research_lab', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.6, description: 'A well-equipped laboratory for testing theoretical models and hypotheses.' },
  { id: 'str_enchantment_lab', name: 'Enchantment Laboratory', emoji: '✨', category: 'research_lab', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 500, costMultiplier: 1.7, description: 'A laboratory where objects and texts can be enchanted with magical properties.' },
  { id: 'str_transmutation_forge', name: 'Transmutation Forge', emoji: '🔥', category: 'research_lab', maxLevel: 10, baseEffect: 20, effectPerLevel: 10, baseCost: 800, costMultiplier: 1.8, description: 'A forge capable of transmuting materials at the molecular level using runic equations.' },
  { id: 'str_creation_crucible', name: 'Creation Crucible', emoji: '🌋', category: 'research_lab', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1200, costMultiplier: 2.0, description: 'The ultimate research tool. Can create new forms of matter from pure knowledge.' },

  // ── Meditation Chambers (4) ───────────────────────────────────
  { id: 'str_quiet_cell', name: 'Quiet Meditation Cell', emoji: '🧘', category: 'meditation_chamber', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 200, costMultiplier: 1.5, description: 'A small, silent cell where scholars can meditate and recover mental focus.' },
  { id: 'str_crystal_grotto', name: 'Crystal Grotto', emoji: '💎', category: 'meditation_chamber', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 450, costMultiplier: 1.7, description: 'A grotto lined with resonance crystals that amplify meditation effects.' },
  { id: 'str_zenith_sanctum', name: 'Zenith Sanctum', emoji: '☀️', category: 'meditation_chamber', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 700, costMultiplier: 1.8, description: 'A sunlit sanctum at the spire\'s midpoint where mental clarity is naturally enhanced.' },
  { id: 'str_void_chamber', name: 'Void Meditation Chamber', emoji: '🌑', category: 'meditation_chamber', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1500, costMultiplier: 2.0, description: 'A chamber that exists in a pocket of void. Time moves differently here, enabling deep reflection.' },

  // ── Artifact Vaults (3) ───────────────────────────────────────
  { id: 'str_display_case', name: 'Artifact Display Case', emoji: '🖼️', category: 'artifact_vault', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.5, description: 'A glass case for displaying collected grimoire artifacts and boosting their passive effects.' },
  { id: 'str_sacred_vault', name: 'Sacred Relic Vault', emoji: '🔐', category: 'artifact_vault', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 600, costMultiplier: 1.7, description: 'A magically sealed vault that preserves and amplifies the power of stored artifacts.' },
  { id: 'str_ivory_sanctuary', name: 'Ivory Sanctuary', emoji: '🏰', category: 'artifact_vault', maxLevel: 10, baseEffect: 30, effectPerLevel: 15, baseCost: 2000, costMultiplier: 2.0, description: 'The innermost sanctuary of the spire, where the most powerful artifacts resonate with cosmic energy.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: IV_ABILITIES — 22 Scholarly Abilities
// ═══════════════════════════════════════════════════════════════════

export const IV_ABILITIES: readonly IvAbilityDef[] = [
  { id: 'ab_rapid_study', name: 'Rapid Study', emoji: '📖', discipline: 'philosophy', type: 'active', rarity: 'common', energyCost: 5, cooldown: 30, power: 15, description: 'Accelerate learning for a short period, absorbing knowledge at double speed.' },
  { id: 'ab_ink_splash', name: 'Ink Splash', emoji: '🖋️', discipline: 'runology', type: 'active', rarity: 'common', energyCost: 8, cooldown: 45, power: 20, description: 'Splash enchanted ink that creates a temporary protective rune circle.' },
  { id: 'ab_star_glimpse', name: 'Star Glimpse', emoji: '⭐', discipline: 'astronomy', type: 'active', rarity: 'common', energyCost: 10, cooldown: 60, power: 10, description: 'Glimpse the alignment of stars to gain insight into an upcoming challenge.' },
  { id: 'ab_history_recall', name: 'History Recall', emoji: '📜', discipline: 'history', type: 'active', rarity: 'common', energyCost: 12, cooldown: 90, power: 5, description: 'Recall a relevant historical event that provides context and wisdom.' },
  { id: 'ab_geometric_shield', name: 'Geometric Shield', emoji: '🛡️', discipline: 'geometry', type: 'active', rarity: 'common', energyCost: 6, cooldown: 30, power: 12, description: 'Construct a geometric barrier that deflects mental fatigue and distractions.' },
  { id: 'ab_soothing_hum', name: 'Soothing Hum', emoji: '🎵', discipline: 'music', type: 'active', rarity: 'common', energyCost: 7, cooldown: 35, power: 10, description: 'Hum a calming melody that restores morale to nearby scholars.' },
  { id: 'ab_basic_transmute', name: 'Basic Transmute', emoji: '⚗️', discipline: 'alchemy', type: 'active', rarity: 'common', energyCost: 8, cooldown: 40, power: 18, description: 'Transmute a common material into a slightly more valuable form.' },
  { id: 'ab_constellation_ritual', name: 'Constellation Ritual', emoji: '🌟', discipline: 'astronomy', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 30, description: 'Perform a ritual that channels the power of a specific constellation into a temporary boost.' },
  { id: 'ab_socratic_strike', name: 'Socratic Strike', emoji: '❓', discipline: 'philosophy', type: 'active', rarity: 'uncommon', energyCost: 20, cooldown: 90, power: 35, description: 'Ask a deeply probing question that stuns opponents with existential doubt.' },
  { id: 'ab_geometric_trap', name: 'Geometric Trap', emoji: '📐', discipline: 'geometry', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 75, power: 28, description: 'Inscribe a geometric pattern that creates an inescapable puzzle trap.' },
  { id: 'ab_archive_mastery', name: 'Archive Mastery', emoji: '📚', discipline: 'history', type: 'active', rarity: 'uncommon', energyCost: 22, cooldown: 100, power: 32, description: 'Access any information in the archive instantly through mental connection.' },
  { id: 'ab_dissonant_chord', name: 'Dissonant Chord', emoji: '🎶', discipline: 'music', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 25, description: 'Play a dissonant chord that disrupts concentration and breaks enchantments.' },
  { id: 'ab_runic_barrier', name: 'Runic Barrier', emoji: '🔲', discipline: 'runology', type: 'active', rarity: 'uncommon', energyCost: 16, cooldown: 55, power: 30, description: 'Inscribe a barrier of protective runes that shield against all harmful effects.' },
  { id: 'ab_elixir_of_clarity', name: 'Elixir of Clarity', emoji: '🧪', discipline: 'alchemy', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 75, power: 28, description: 'Brew an elixir that grants perfect mental clarity and enhanced focus.' },
  { id: 'ab_chronicle_bind', name: 'Chronicle Bind', emoji: '📕', discipline: 'history', type: 'active', rarity: 'rare', energyCost: 30, cooldown: 120, power: 50, description: 'Bind an event into the chronicle permanently, preventing anyone from altering it.' },
  { id: 'ab_paradigm_shift', name: 'Paradigm Shift', emoji: '💡', discipline: 'philosophy', type: 'active', rarity: 'rare', energyCost: 35, cooldown: 150, power: 55, description: 'Introduce a paradigm-shifting idea that reshapes how everyone perceives reality.' },
  { id: 'ab_dimensional_fold', name: 'Dimensional Fold', emoji: '🌀', discipline: 'geometry', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 110, power: 45, description: 'Fold space to create a shortcut between two distant points in the spire.' },
  { id: 'ab_scholarly_instinct', name: 'Scholarly Instinct', emoji: '🧠', discipline: 'history', type: 'passive', rarity: 'rare', energyCost: 0, cooldown: 0, power: 15, description: 'Passively sense nearby knowledge sources and detect hidden texts automatically.' },
  { id: 'ab_arcane_inscription', name: 'Arcane Inscription', emoji: '🔮', discipline: 'runology', type: 'active', rarity: 'rare', energyCost: 25, cooldown: 120, power: 40, description: 'Inscribe an arcane symbol that permanently enhances a scholar\'s chosen attribute.' },
  { id: 'ab_harmonic_resonance', name: 'Harmonic Resonance', emoji: '🎶', discipline: 'music', type: 'active', rarity: 'epic', energyCost: 50, cooldown: 300, power: 80, description: 'Create a resonance frequency that amplifies the abilities of all scholars in the hall.' },
  { id: 'ab_elemental_transmute', name: 'Elemental Transmutation', emoji: '🌋', discipline: 'alchemy', type: 'active', rarity: 'epic', energyCost: 45, cooldown: 250, power: 70, description: 'Transmute the elemental properties of any object, turning lead to gold or water to wine.' },
  { id: 'ab_cosmic_formula', name: 'Cosmic Formula', emoji: '🌌', discipline: 'astronomy', type: 'active', rarity: 'legendary', energyCost: 60, cooldown: 600, power: 120, description: 'Write the cosmic formula that describes the fundamental equation of the universe.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: IV_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const IV_ACHIEVEMENTS: readonly IvAchievementDef[] = [
  { id: 'ach_first_enroll', name: 'First Enrollment', emoji: '🎓', description: 'Enroll your first scholar apprentice.', condition: 'enroll_1', reward: { gold: 50, renown: 10 } },
  { id: 'ach_five_enrolled', name: 'Growing Class', emoji: '📚', description: 'Enroll 5 different scholars.', condition: 'enroll_5', reward: { gold: 200, renown: 40 } },
  { id: 'ach_first_research', name: 'First Discovery', emoji: '🔬', description: 'Conduct your first research session.', condition: 'research_1', reward: { gold: 80, renown: 15 } },
  { id: 'ach_ten_researches', name: 'Prolific Researcher', emoji: '⚗️', description: 'Conduct research 10 times.', condition: 'research_10', reward: { gold: 300, renown: 60 } },
  { id: 'ach_first_build', name: 'Groundbreaking', emoji: '🏗️', description: 'Build your first academy structure.', condition: 'build_1', reward: { gold: 100, renown: 20 } },
  { id: 'ach_five_builds', name: 'Master Architect', emoji: '🏛️', description: 'Build 5 different academy structures.', condition: 'build_5', reward: { gold: 500, renown: 80 } },
  { id: 'ach_hall_attend', name: 'Lecture Attendee', emoji: '🪑', description: 'Attend lectures in 4 different halls.', condition: 'hall_4', reward: { gold: 400, renown: 50 } },
  { id: 'ach_all_halls', name: 'Spire Explorer', emoji: '🗼', description: 'Attend lectures in all 8 halls.', condition: 'hall_8', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_rare_scholar', name: 'Rare Prodigy', emoji: '💎', description: 'Enroll a rare scholar.', condition: 'rare_scholar', reward: { gold: 500, renown: 100 } },
  { id: 'ach_epic_scholar', name: 'Epic Discovery', emoji: '🌟', description: 'Enroll an epic scholar.', condition: 'epic_scholar', reward: { gold: 1500, renown: 250 } },
  { id: 'ach_legendary_scholar', name: 'Legendary Apprenticeship', emoji: '👑', description: 'Enroll a legendary scholar.', condition: 'legendary_scholar', reward: { gold: 5000, renown: 500 } },
  { id: 'ach_first_relic', name: 'Grimoire Finder', emoji: '📖', description: 'Discover your first grimoire artifact.', condition: 'relic_1', reward: { gold: 300, renown: 60 } },
  { id: 'ach_five_relics', name: 'Artifact Collector', emoji: '🔍', description: 'Collect 5 different grimoire artifacts.', condition: 'relic_5', reward: { gold: 1000, renown: 150 } },
  { id: 'ach_first_event', name: 'Event Survivor', emoji: '⚡', description: 'Survive your first academy event.', condition: 'event_1', reward: { gold: 200, renown: 30 } },
  { id: 'ach_ten_events', name: 'Event Veteran', emoji: '🏅', description: 'Survive 10 academy events.', condition: 'event_10', reward: { gold: 800, renown: 120 } },
  { id: 'ach_upgrade_max', name: 'Master Builder', emoji: '🔨', description: 'Upgrade any structure to level 10.', condition: 'upgrade_10', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_all_disciplines', name: 'Renaissance Academy', emoji: '🌈', description: 'Enroll at least one scholar from each discipline.', condition: 'all_disciplines', reward: { gold: 3000, renown: 300 } },
  { id: 'ach_grand_archon', name: 'Grand Archon Ascended', emoji: '👑', description: 'Reach the title of Grand Archon.', condition: 'max_title', reward: { gold: 10000, renown: 1000 } },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: IV_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const IV_TITLES: readonly IvTitleDef[] = [
  { id: 'title_page_turner', name: 'Page Turner', emoji: '📖', minRenown: 0, minScholars: 0, description: 'A humble beginner who has just opened their first book at the Ivory Spire.' },
  { id: 'title_bookworm', name: 'Bookworm', emoji: '📚', minRenown: 50, minScholars: 3, description: 'An avid reader who devours every text they can find and asks thoughtful questions.' },
  { id: 'title_scholar', name: 'Scholar', emoji: '🎓', minRenown: 200, minScholars: 7, description: 'A recognized scholar who has demonstrated mastery of foundational academic knowledge.' },
  { id: 'title_sage', name: 'Sage', emoji: '🧙', minRenown: 500, minScholars: 12, description: 'A wise sage whose counsel is sought by apprentices and professors alike.' },
  { id: 'title_lecturer', name: 'Lecturer', emoji: '🗣️', minRenown: 1200, minScholars: 18, description: 'A respected lecturer who commands the lecture halls with eloquence and deep knowledge.' },
  { id: 'title_professor', name: 'Professor', emoji: '🧑‍🏫', minRenown: 2500, minScholars: 24, description: 'A distinguished professor who has made original contributions to their discipline.' },
  { id: 'title_dean', name: 'Dean', emoji: '🏛️', minRenown: 5000, minScholars: 30, description: 'A powerful dean who oversees multiple floors of the Ivory Spire.' },
  { id: 'title_grand_archon', name: 'Grand Archon', emoji: '👑', minRenown: 10000, minScholars: 35, description: 'The supreme Grand Archon, master of all knowledge and guardian of the Ivory Spire.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: IV_RELICS — 15 Legendary Grimoire Artifacts
// ═══════════════════════════════════════════════════════════════════

export const IV_RELICS: readonly IvRelicDef[] = [
  { id: 'relic_ivory_crown', name: 'Ivory Crown of Wisdom', emoji: '👑', rarity: 'epic', discipline: 'philosophy', intellectBoost: 20, wisdomBoost: 25, focusBoost: 10, value: 2000, description: 'A crown carved from pure ivory that grants its wearer unparalleled philosophical insight.' },
  { id: 'relic_astral_compass', name: 'Astral Compass', emoji: '🧭', rarity: 'epic', discipline: 'astronomy', intellectBoost: 35, wisdomBoost: 10, focusBoost: 15, value: 2200, description: 'A compass that points toward the most intellectually significant event in the vicinity.' },
  { id: 'relic_archive_key', name: 'Key to the Deep Archive', emoji: '🗝️', rarity: 'rare', discipline: 'history', intellectBoost: 15, wisdomBoost: 20, focusBoost: 10, value: 800, description: 'A rusted key that unlocks a hidden archive room containing lost historical texts.' },
  { id: 'relic_platonic_solid', name: 'Platonic Solid Set', emoji: '💎', rarity: 'rare', discipline: 'geometry', intellectBoost: 10, wisdomBoost: 10, focusBoost: 25, value: 750, description: 'A perfect set of five platonic solids that enhance geometric reasoning.' },
  { id: 'relic_shadow_mask', name: 'Mask of the Forgotten Scholar', emoji: '🎭', rarity: 'epic', discipline: 'runology', intellectBoost: 25, wisdomBoost: 15, focusBoost: 20, value: 2500, description: 'A mask that lets its wearer read any language, including scripts not yet invented.' },
  { id: 'relic_harmonica_ages', name: 'Harmonica of the Ages', emoji: '🎵', rarity: 'epic', discipline: 'music', intellectBoost: 10, wisdomBoost: 30, focusBoost: 20, value: 2400, description: 'An ancient harmonica whose melodies contain the wisdom of every era.' },
  { id: 'relic_alchemy_wheel', name: "Alchemist's Wheel", emoji: '☸️', rarity: 'epic', discipline: 'alchemy', intellectBoost: 20, wisdomBoost: 15, focusBoost: 25, value: 2600, description: 'A spinning wheel that reveals the hidden connections between all elements.' },
  { id: 'relic_orb_wisdom', name: 'Orb of Infinite Wisdom', emoji: '🔮', rarity: 'legendary', discipline: 'philosophy', intellectBoost: 40, wisdomBoost: 45, focusBoost: 20, value: 8000, description: 'An orb containing the distilled wisdom of every Grand Archon who ever lived.' },
  { id: 'relic_star_atlas', name: 'Atlas of the Heavens', emoji: '🗺️', rarity: 'legendary', discipline: 'astronomy', intellectBoost: 35, wisdomBoost: 25, focusBoost: 30, value: 7500, description: 'An atlas that maps not just stars but the intellectual pathways between them.' },
  { id: 'relic_quill_destiny', name: "Quill of Destiny", emoji: '🪶', rarity: 'legendary', discipline: 'history', intellectBoost: 50, wisdomBoost: 35, focusBoost: 15, value: 10000, description: 'The quill that recorded the academy\'s founding. Whatever it writes becomes part of history.' },
  { id: 'relic_time_hourglass', name: 'Hourglass of Time', emoji: '⏳', rarity: 'legendary', discipline: 'history', intellectBoost: 30, wisdomBoost: 50, focusBoost: 20, value: 9000, description: 'An hourglass that can slow, stop, or reverse the flow of time within the spire.' },
  { id: 'relic_dimensional_lens', name: 'Dimensional Lens', emoji: '🔍', rarity: 'legendary', discipline: 'geometry', intellectBoost: 40, wisdomBoost: 30, focusBoost: 35, value: 9500, description: 'A lens that reveals hidden dimensions and the geometric structures within them.' },
  { id: 'relic_creation_staff', name: 'Staff of Creation', emoji: '🪄', rarity: 'epic', discipline: 'runology', intellectBoost: 25, wisdomBoost: 20, focusBoost: 30, value: 2300, description: 'A staff that can inscribe runes in the air itself, creating lasting magical effects.' },
  { id: 'relic_philosopher_stone', name: "Philosopher's Stone", emoji: '⛏️', rarity: 'legendary', discipline: 'alchemy', intellectBoost: 55, wisdomBoost: 40, focusBoost: 30, value: 11000, description: 'The legendary stone of the alchemists. It grants mastery over all transmutation.' },
  { id: 'relic_silence_bell', name: 'Bell of Perfect Silence', emoji: '🔔', rarity: 'legendary', discipline: 'music', intellectBoost: 30, wisdomBoost: 45, focusBoost: 40, value: 12000, description: 'A bell whose single toll creates perfect silence, the ideal state for deep contemplation.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: IV_EVENTS — 12 Academy Events
// ═══════════════════════════════════════════════════════════════════

export const IV_EVENTS: readonly IvEventDef[] = [
  { id: 'evt_exam_season', name: 'Exam Season', emoji: '📝', durationTurns: 5, effectType: 'buff', effectDescription: 'Training yields double XP. All scholars gain +10% focus.', description: 'The annual examination period motivates scholars to study harder than ever.' },
  { id: 'evt_dust_storm', name: 'Knowledge Dust Storm', emoji: '🌪️', durationTurns: 3, effectType: 'debuff', effectDescription: 'Research output reduced by 30%. Library wings unaffected.', description: 'A magical dust storm fills the spire, obscuring texts and disrupting concentration.' },
  { id: 'evt_founder_ghost', name: 'Founder\'s Ghost', emoji: '👻', durationTurns: 4, effectType: 'special', effectDescription: 'Runology scholars gain +50 intellect. Rare materials appear.', description: 'The ghost of the academy\'s founder materializes, whispering secrets to runologists.' },
  { id: 'evt_solar_eclipse', name: 'Academic Eclipse', emoji: '🌑', durationTurns: 2, effectType: 'special', effectDescription: 'Astronomy scholars triple power. Philosophy scholars halved.', description: 'A rare eclipse darkens the sky. Astronomy scholars scramble to document the event.' },
  { id: 'evt_ink_shortage', name: 'Ink Shortage', emoji: '🪣', durationTurns: 3, effectType: 'debuff', effectDescription: 'Material collection reduced by 25%. Runology costs increased.', description: 'The academy\'s ink reserves run dangerously low, hampering research efforts.' },
  { id: 'evt_golden_dawn', name: 'Golden Dawn', emoji: '🌅', durationTurns: 5, effectType: 'buff', effectDescription: 'Gold rewards doubled. Alchemy scholars gain +30% intellect.', description: 'The dawn sky turns golden over the spire, signaling a day of exceptional fortune.' },
  { id: 'evt_symposium', name: 'Grand Symposium', emoji: '🎭', durationTurns: 4, effectType: 'buff', effectDescription: 'All scholars gain +20% morale. Renown gains doubled.', description: 'Scholars from across the realm gather for a grand symposium of knowledge exchange.' },
  { id: 'evt_vault_breach', name: 'Vault Breach', emoji: '🚪', durationTurns: 2, effectType: 'debuff', effectDescription: 'Lose 10% gold. Artifact discovery chance increased.', description: 'A section of the vault is breached, but the disturbance reveals hidden artifacts.' },
  { id: 'evt_muse_inspiration', name: 'Muse\'s Inspiration', emoji: '💫', durationTurns: 3, effectType: 'buff', effectDescription: 'Music scholars resurrect focus once. All training doubled.', description: 'The muse of scholarship descends upon the spire, inspiring brilliant new ideas.' },
  { id: 'evt_silent_hours', name: 'Silent Hours', emoji: '🤫', durationTurns: 5, effectType: 'debuff', effectDescription: 'Discipline synergy reduced. Meditation chambers doubled.', description: 'The spire enforces absolute silence. Scholars struggle without verbal communication.' },
  { id: 'evt_runic_surge', name: 'Runic Surge', emoji: '✨', durationTurns: 3, effectType: 'special', effectDescription: 'Bonus renown for research. Puzzle rewards doubled.', description: 'The runic circles throughout the spire pulse with unexpected magical energy.' },
  { id: 'evt_enrollment_fair', name: 'Enrollment Fair', emoji: '🎪', durationTurns: 6, effectType: 'buff', effectDescription: 'Enrollment costs halved. New scholar types appear.', description: 'The annual enrollment fair attracts scholars from distant lands eager to join the academy.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: INTERNAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const IV_MAX_SCHOLAR_LEVEL = 50
const IV_MAX_STRUCTURE_LEVEL = 10
const IV_INITIAL_GOLD = 200
const IV_INITIAL_RENOWN = 0

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: HELPER FUNCTIONS (hoisted with `function`)
// ═══════════════════════════════════════════════════════════════════

function ivXpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.25, level - 1))
}

function ivCalcStats(def: IvScholarDef, level: number) {
  const growth = 1 + (level - 1) * 0.12
  return {
    intellect: Math.floor(def.intellect * growth),
    wisdom: Math.floor(def.wisdom * growth),
    focus: Math.floor(def.focus * growth),
  }
}

let _ivIdCounter = 0
function ivGenerateId(): string {
  _ivIdCounter += 1
  return `iv_${_ivIdCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`
}

function ivFindScholarDef(id: string): IvScholarDef | undefined {
  return IV_SCHOLARS.find((s) => s.id === id)
}

function ivFindHall(id: string): IvHallDef | undefined {
  return IV_HALLS.find((h) => h.id === id)
}

function ivFindMaterial(id: string): IvMaterialDef | undefined {
  return IV_MATERIALS.find((m) => m.id === id)
}

function ivFindStructureDef(id: string): IvStructureDef | undefined {
  return IV_STRUCTURES.find((s) => s.id === id)
}

function ivFindAbility(id: string): IvAbilityDef | undefined {
  return IV_ABILITIES.find((a) => a.id === id)
}

function ivFindRelic(id: string): IvRelicDef | undefined {
  return IV_RELICS.find((r) => r.id === id)
}

function ivFindAchievement(id: string): IvAchievementDef | undefined {
  return IV_ACHIEVEMENTS.find((a) => a.id === id)
}

function ivFindTitle(id: IvTitleId): IvTitleDef | undefined {
  return IV_TITLES.find((t) => t.id === id)
}

function ivRarityMultiplier(rarity: IvRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 5
    case 'epic': return 10
    case 'legendary': return 25
    default: return 1
  }
}

function ivRarityColor(rarity: IvRarity): string {
  switch (rarity) {
    case 'common': return '#9ca3af'
    case 'uncommon': return '#34d399'
    case 'rare': return '#60a5fa'
    case 'epic': return '#a78bfa'
    case 'legendary': return '#fbbf24'
    default: return '#9ca3af'
  }
}

function ivDisciplineColor(discipline: IvDiscipline): string {
  switch (discipline) {
    case 'alchemy': return IV_PARCHMENT_GOLD
    case 'astronomy': return IV_CELESTIAL_BLUE
    case 'history': return IV_LIBRARY_BROWN
    case 'geometry': return IV_WISDOM_GREEN
    case 'music': return IV_ROYAL_PURPLE
    case 'philosophy': return IV_SCROLL_TAN
    case 'runology': return IV_INK_BLACK
    default: return '#888888'
  }
}

export function ivCheckSynergy(primary: IvDiscipline, secondary: IvDiscipline): number {
  const advantages = IV_SYNERGY_MAP[primary]
  if (advantages?.includes(secondary)) return 1.4
  const disadvantages = IV_SYNERGY_MAP[secondary]
  if (disadvantages?.includes(primary)) return 0.7
  return 1.0
}

function ivCalcStructureUpgradeCost(def: IvStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

function ivCalcMaxTitle(renown: number, scholarCount: number): IvTitleId {
  let bestId: IvTitleId = 'title_page_turner'
  for (const title of IV_TITLES) {
    if (renown >= title.minRenown && scholarCount >= title.minScholars) {
      bestId = title.id
    }
  }
  return bestId
}

function ivCheckAchievementCondition(
  condition: string,
  state: IvStoreState
): boolean {
  switch (condition) {
    case 'enroll_1':
      return state.totalEnrolled >= 1
    case 'enroll_5':
      return state.totalEnrolled >= 5
    case 'research_1':
      return state.totalResearched >= 1
    case 'research_10':
      return state.totalResearched >= 10
    case 'build_1':
      return state.totalBuilt >= 1
    case 'build_5':
      return state.totalBuilt >= 5
    case 'hall_4':
      return state.halls.length >= 4
    case 'hall_8':
      return state.halls.length >= 8
    case 'rare_scholar':
      return state.scholars.some((s) => {
        const def = ivFindScholarDef(s.scholarDefId)
        return def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')
      })
    case 'epic_scholar':
      return state.scholars.some((s) => {
        const def = ivFindScholarDef(s.scholarDefId)
        return def && (def.rarity === 'epic' || def.rarity === 'legendary')
      })
    case 'legendary_scholar':
      return state.scholars.some((s) => {
        const def = ivFindScholarDef(s.scholarDefId)
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
    case 'all_disciplines': {
      const disciplines = new Set<IvDiscipline>()
      for (const s of state.scholars) {
        const def = ivFindScholarDef(s.scholarDefId)
        if (def) disciplines.add(def.discipline)
      }
      return disciplines.size >= 7
    }
    case 'max_title':
      return state.currentTitle === 'title_grand_archon'
    default:
      return false
  }
}

function ivPickRandomEvent(): IvEventDef {
  const idx = Math.floor(Math.random() * IV_EVENTS.length)
  return IV_EVENTS[idx]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const useIVStore = create<IvFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      scholars: [] as IvScholarInstance[],
      halls: [] as string[],
      materials: [] as { materialId: string; count: number }[],
      structures: [] as IvStructureInstance[],
      abilities: [] as string[],
      achievements: [] as string[],
      relics: [] as string[],
      currentTitle: 'title_page_turner' as IvTitleId,
      gold: IV_INITIAL_GOLD,
      renown: IV_INITIAL_RENOWN,
      totalEnrolled: 0,
      totalResearched: 0,
      totalBuilt: 0,
      totalEventsFaced: 0,
      activeEvent: null as IvEventDef | null,
      eventTurnsRemaining: 0,
      activeHall: null as string | null,

      // ── ivEnrollScholar ────────────────────────────────────────
      ivEnrollScholar: (scholarDefId: string): boolean => {
        const def = ivFindScholarDef(scholarDefId)
        if (!def) return false
        const cost = Math.floor(50 * ivRarityMultiplier(def.rarity))
        const state = get()
        if (state.gold < cost) return false
        const stats = ivCalcStats(def, 1)
        const newScholar: IvScholarInstance = {
          id: ivGenerateId(),
          scholarDefId,
          name: def.name,
          level: 1,
          xp: 0,
          intellect: stats.intellect,
          wisdom: stats.wisdom,
          focus: stats.focus,
          morale: 80,
          fatigue: 30,
          enrolledAt: Date.now(),
        }
        set((prev) => {
          const newRenown = prev.renown + ivRarityMultiplier(def.rarity) * 5
          return {
            scholars: [...prev.scholars, newScholar],
            gold: prev.gold - cost,
            totalEnrolled: prev.totalEnrolled + 1,
            renown: newRenown,
            currentTitle: ivCalcMaxTitle(newRenown, prev.scholars.length + 1),
          }
        })
        return true
      },

      // ── ivExpelScholar ─────────────────────────────────────────
      ivExpelScholar: (scholarId: string): boolean => {
        const state = get()
        const exists = state.scholars.find((s) => s.id === scholarId)
        if (!exists) return false
        const def = ivFindScholarDef(exists.scholarDefId)
        const refund = def ? Math.floor(25 * ivRarityMultiplier(def.rarity)) : 10
        set((prev) => ({
          scholars: prev.scholars.filter((s) => s.id !== scholarId),
          gold: prev.gold + refund,
          currentTitle: ivCalcMaxTitle(prev.renown, prev.scholars.length - 1),
        }))
        return true
      },

      // ── ivTrainScholar ─────────────────────────────────────────
      ivTrainScholar: (scholarId: string): boolean => {
        const trainCost = 10
        const state = get()
        if (state.gold < trainCost) return false
        set((prev) => {
          const scholars = prev.scholars.map((s) => {
            if (s.id !== scholarId) return s
            const newXp = s.xp + 20
            const xpNeeded = ivXpForLevel(s.level)
            let newLevel = s.level
            let currentXp = newXp
            if (currentXp >= xpNeeded && s.level < IV_MAX_SCHOLAR_LEVEL) {
              newLevel = s.level + 1
              currentXp = newXp - xpNeeded
            }
            const def = ivFindScholarDef(s.scholarDefId)
            const stats = def ? ivCalcStats(def, newLevel) : { intellect: s.intellect, wisdom: s.wisdom, focus: s.focus }
            return {
              ...s,
              level: newLevel,
              xp: currentXp,
              intellect: stats.intellect,
              wisdom: stats.wisdom,
              focus: stats.focus,
              morale: Math.min(100, s.morale + 10),
              fatigue: Math.max(0, s.fatigue - 20),
            }
          })
          return { scholars, gold: prev.gold - trainCost, renown: prev.renown + 2 }
        })
        return true
      },

      // ── ivResearchTome ─────────────────────────────────────────
      ivResearchTome: (scholarId: string): boolean => {
        const state = get()
        const scholar = state.scholars.find((s) => s.id === scholarId)
        if (!scholar) return false
        if (scholar.fatigue > 80) return false
        const def = ivFindScholarDef(scholar.scholarDefId)
        if (!def) return false
        const materialId = `mat_${def.discipline}_${def.rarity}_essence`
        const existingMaterial = state.materials.find((m) => m.materialId === materialId)
        const amount = Math.ceil(scholar.intellect / 10)
        set((prev) => ({
          materials: existingMaterial
            ? prev.materials.map((m) => (m.materialId === materialId ? { ...m, count: m.count + amount } : m))
            : [...prev.materials, { materialId, count: amount }],
          totalResearched: prev.totalResearched + 1,
          renown: prev.renown + 3,
          scholars: prev.scholars.map((s) =>
            s.id === scholarId ? { ...s, fatigue: Math.min(100, s.fatigue + 20) } : s
          ),
        }))
        return true
      },

      // ── ivBuildStructure ───────────────────────────────────────
      ivBuildStructure: (structureDefId: string): boolean => {
        const def = ivFindStructureDef(structureDefId)
        if (!def) return false
        const state = get()
        if (state.gold < def.baseCost) return false
        const alreadyBuilt = state.structures.find((s) => s.structureDefId === structureDefId)
        if (alreadyBuilt) return false
        const newStructure: IvStructureInstance = {
          id: ivGenerateId(),
          structureDefId,
          level: 1,
          builtAt: Date.now(),
        }
        set((prev) => ({
          structures: [...prev.structures, newStructure],
          gold: prev.gold - def.baseCost,
          totalBuilt: prev.totalBuilt + 1,
          renown: prev.renown + 10,
        }))
        return true
      },

      // ── ivUpgradeStructure ─────────────────────────────────────
      ivUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structure = state.structures.find((s) => s.id === structureId)
        if (!structure) return false
        if (structure.level >= IV_MAX_STRUCTURE_LEVEL) return false
        const def = ivFindStructureDef(structure.structureDefId)
        if (!def) return false
        const cost = ivCalcStructureUpgradeCost(def, structure.level)
        if (state.gold < cost) return false
        set((prev) => ({
          structures: prev.structures.map((s) =>
            s.id === structureId ? { ...s, level: s.level + 1 } : s
          ),
          gold: prev.gold - cost,
          renown: prev.renown + Math.floor(def.effectPerLevel * 2),
        }))
        return true
      },

      // ── ivAttendLecture ────────────────────────────────────────
      ivAttendLecture: (hallId: string): IvEventDef | null => {
        const hall = ivFindHall(hallId)
        if (!hall) return null
        const state = get()
        const requiredTitleIdx = IV_TITLES.findIndex((t) => t.id === hall.requiredTitle)
        const currentTitleIdx = IV_TITLES.findIndex((t) => t.id === state.currentTitle)
        if (currentTitleIdx < requiredTitleIdx) return null
        const newHalls = state.halls.includes(hallId) ? state.halls : [...state.halls, hallId]
        const event = ivPickRandomEvent()
        set((prev) => ({
          halls: newHalls,
          activeHall: hallId,
          activeEvent: event,
          eventTurnsRemaining: event.durationTurns,
          totalEventsFaced: prev.totalEventsFaced + 1,
          renown: prev.renown + 5,
        }))
        return event
      },

      // ── ivCollectRelic ─────────────────────────────────────────
      ivCollectRelic: (relicId: string): boolean => {
        const relic = ivFindRelic(relicId)
        if (!relic) return false
        const state = get()
        if (state.relics.includes(relicId)) return false
        set((prev) => {
          const newRenown = prev.renown + Math.floor(ivRarityMultiplier(relic.rarity) * 20)
          return {
            relics: [...prev.relics, relicId],
            renown: newRenown,
            currentTitle: ivCalcMaxTitle(newRenown, prev.scholars.length),
          }
        })
        return true
      },

      // ── ivUnlockAbility ────────────────────────────────────────
      ivUnlockAbility: (abilityId: string): boolean => {
        const ability = ivFindAbility(abilityId)
        if (!ability) return false
        const state = get()
        if (state.abilities.includes(abilityId)) return false
        const cost = Math.floor(100 * ivRarityMultiplier(ability.rarity))
        if (state.gold < cost) return false
        set((prev) => ({
          abilities: [...prev.abilities, abilityId],
          gold: prev.gold - cost,
        }))
        return true
      },

      // ── ivUnlockTitle ──────────────────────────────────────────
      ivUnlockTitle: (titleId: IvTitleId): boolean => {
        const title = ivFindTitle(titleId)
        if (!title) return false
        const state = get()
        if (state.renown < title.minRenown) return false
        if (state.scholars.length < title.minScholars) return false
        set((prev) => ({ currentTitle: titleId }))
        return true
      },

      // ── ivClaimAchievement ─────────────────────────────────────
      ivClaimAchievement: (achievementId: string): boolean => {
        const achievement = ivFindAchievement(achievementId)
        if (!achievement) return false
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!ivCheckAchievementCondition(achievement.condition, state)) return false
        set((prev) => {
          const newRenown = prev.renown + achievement.reward.renown
          return {
            achievements: [...prev.achievements, achievementId],
            gold: prev.gold + achievement.reward.gold,
            renown: newRenown,
            currentTitle: ivCalcMaxTitle(newRenown, prev.scholars.length),
          }
        })
        return true
      },

      // ── ivTradeMaterial ────────────────────────────────────────
      ivTradeMaterial: (materialId: string, count: number): number => {
        const material = ivFindMaterial(materialId)
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

      // ── ivEndEvent ─────────────────────────────────────────────
      ivEndEvent: () => {
        set({ activeEvent: null, eventTurnsRemaining: 0 })
      },

      // ── ivResetEvent ───────────────────────────────────────────
      ivResetEvent: () => {
        const event = ivPickRandomEvent()
        set({ activeEvent: event, eventTurnsRemaining: event.durationTurns })
      },
    }),
    {
      name: 'ivory-spire-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: MAIN HOOK — useIvorySpire()
// ═══════════════════════════════════════════════════════════════════

export default function useIvorySpire() {
  const store = useIVStore()

  // ── Computed: Enrolled scholars with def info ──────────────────
  const ivEnrolledScholars = useMemo(() => {
    return store.scholars.map((s) => {
      const def = ivFindScholarDef(s.scholarDefId)
      return {
        ...s,
        def,
        disciplineColor: def ? ivDisciplineColor(def.discipline) : '#888888',
        rarityColor: def ? ivRarityColor(def.rarity) : '#888888',
      }
    })
  }, [store])

  // ── Computed: Available scholar defs to enroll ────────────────
  const ivAvailableScholars = useMemo(() => {
    return IV_SCHOLARS.filter((def) => {
      const cost = Math.floor(50 * ivRarityMultiplier(def.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Current title details ───────────────────────────
  const ivCurrentTitleDetail = useMemo(() => {
    return ivFindTitle(store.currentTitle) ?? IV_TITLES[0]
  }, [store])

  // ── Computed: Next title info ─────────────────────────────────
  const ivNextTitle = useMemo(() => {
    const currentIdx = IV_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= IV_TITLES.length - 1) return null
    return IV_TITLES[currentIdx + 1]
  }, [store])

  // ── Computed: Active hall details ─────────────────────────────
  const ivActiveHallDetail = useMemo(() => {
    if (!store.activeHall) return null
    return ivFindHall(store.activeHall) ?? null
  }, [store])

  // ── Computed: Unvisited halls ─────────────────────────────────
  const ivUnvisitedHalls = useMemo(() => {
    return IV_HALLS.filter((h) => !store.halls.includes(h.id))
  }, [store])

  // ── Computed: Structures with defs ────────────────────────────
  const ivBuiltStructures = useMemo(() => {
    return store.structures.map((s) => {
      const def = ivFindStructureDef(s.structureDefId)
      return { ...s, def }
    })
  }, [store])

  // ── Computed: Unlockable abilities ────────────────────────────
  const ivUnlockableAbilities = useMemo(() => {
    return IV_ABILITIES.filter((a) => {
      if (store.abilities.includes(a.id)) return false
      const cost = Math.floor(100 * ivRarityMultiplier(a.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Owned relics with defs ──────────────────────────
  const ivOwnedRelics = useMemo(() => {
    return store.relics.map((rId) => {
      const def = ivFindRelic(rId)
      return def ?? null
    }).filter((r): r is IvRelicDef => r !== null)
  }, [store])

  // ── Computed: Unclaimed achievements ──────────────────────────
  const ivUnclaimedAchievements = useMemo(() => {
    return IV_ACHIEVEMENTS.filter((a) => {
      if (store.achievements.includes(a.id)) return false
      return ivCheckAchievementCondition(a.condition, store)
    })
  }, [store])

  // ── Computed: Materials with defs ─────────────────────────────
  const ivInventoryMaterials = useMemo(() => {
    return store.materials.map((m) => {
      const def = ivFindMaterial(m.materialId)
      return { ...m, def }
    })
  }, [store])

  // ── Computed: Total structure effect bonus ────────────────────
  const ivTotalStructureEffect = useMemo(() => {
    let totalEffect = 0
    for (const s of store.structures) {
      const def = ivFindStructureDef(s.structureDefId)
      if (def) {
        totalEffect += def.baseEffect + def.effectPerLevel * (s.level - 1)
      }
    }
    return totalEffect
  }, [store])

  // ── Computed: Average scholar level ───────────────────────────
  const ivAverageScholarLevel = useMemo(() => {
    if (store.scholars.length === 0) return 0
    const total = store.scholars.reduce((sum, s) => sum + s.level, 0)
    return Math.floor(total / store.scholars.length)
  }, [store])

  // ── Computed: Total scholar power ─────────────────────────────
  const ivTotalScholarPower = useMemo(() => {
    return store.scholars.reduce(
      (sum, s) => sum + s.intellect + s.wisdom + s.focus,
      0
    )
  }, [store])

  // ── Computed: Discipline distribution ─────────────────────────
  const ivDisciplineDistribution = useMemo(() => {
    const counts: Record<IvDiscipline, number> = {
      alchemy: 0, astronomy: 0, history: 0, geometry: 0, music: 0, philosophy: 0, runology: 0,
    }
    for (const s of store.scholars) {
      const def = ivFindScholarDef(s.scholarDefId)
      if (def) counts[def.discipline]++
    }
    return counts
  }, [store])

  // ── Computed: Rarity distribution ─────────────────────────────
  const ivRarityDistribution = useMemo(() => {
    const counts: Record<IvRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
    }
    for (const s of store.scholars) {
      const def = ivFindScholarDef(s.scholarDefId)
      if (def) counts[def.rarity]++
    }
    return counts
  }, [store])

  // ── Computed: Scholars by rarity ──────────────────────────────
  const ivScholarsByRarity = useMemo(() => {
    const groups: Record<IvRarity, IvScholarInstance[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    }
    for (const s of store.scholars) {
      const def = ivFindScholarDef(s.scholarDefId)
      if (def) groups[def.rarity].push(s)
    }
    return groups
  }, [store])

  // ── Computed: Scholars by discipline ──────────────────────────
  const ivScholarsByDiscipline = useMemo(() => {
    const groups: Record<IvDiscipline, IvScholarInstance[]> = {
      alchemy: [], astronomy: [], history: [], geometry: [], music: [], philosophy: [], runology: [],
    }
    for (const s of store.scholars) {
      const def = ivFindScholarDef(s.scholarDefId)
      if (def) groups[def.discipline].push(s)
    }
    return groups
  }, [store])

  // ── Computed: Progress to next title ──────────────────────────
  const ivTitleProgress = useMemo(() => {
    const currentIdx = IV_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= IV_TITLES.length - 1) return { percent: 100, renownNeeded: 0, scholarsNeeded: 0 }
    const next = IV_TITLES[currentIdx + 1]
    const renownProgress = Math.min(100, (store.renown / next.minRenown) * 100)
    const scholarProgress = Math.min(100, (store.scholars.length / next.minScholars) * 100)
    return {
      percent: Math.floor((renownProgress + scholarProgress) / 2),
      renownNeeded: Math.max(0, next.minRenown - store.renown),
      scholarsNeeded: Math.max(0, next.minScholars - store.scholars.length),
    }
  }, [store])

  // ── Computed: Rare materials count ────────────────────────────
  const ivRareMaterialCount = useMemo(() => {
    let count = 0
    for (const m of store.materials) {
      const def = ivFindMaterial(m.materialId)
      if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
        count += m.count
      }
    }
    return count
  }, [store])

  // ── Computed: Fatigued scholars ───────────────────────────────
  const ivFatiguedScholars = useMemo(() => {
    return store.scholars.filter((s) => s.fatigue > 70)
  }, [store])

  // ── Computed: Low morale scholars ─────────────────────────────
  const ivUnhappyScholars = useMemo(() => {
    return store.scholars.filter((s) => s.morale < 30)
  }, [store])

  // ── Computed: Total relic boost ───────────────────────────────
  const ivTotalRelicBoost = useMemo(() => {
    let intellectBoost = 0
    let wisdomBoost = 0
    let focusBoost = 0
    for (const rId of store.relics) {
      const relic = ivFindRelic(rId)
      if (relic) {
        intellectBoost += relic.intellectBoost
        wisdomBoost += relic.wisdomBoost
        focusBoost += relic.focusBoost
      }
    }
    return { intellectBoost, wisdomBoost, focusBoost }
  }, [store])

  // ═════════════════════════════════════════════════════════════
  // Return ivAPI object
  // ═════════════════════════════════════════════════════════════

  const ivAPI = {
    // ── Direct constants ──────────────────────────────────────
    IV_IVORY_CREAM,
    IV_PARCHMENT_GOLD,
    IV_INK_BLACK,
    IV_ROYAL_PURPLE,
    IV_LIBRARY_BROWN,
    IV_CELESTIAL_BLUE,
    IV_WISDOM_GREEN,
    IV_SCROLL_TAN,
    IV_DISCIPLINES,
    IV_SCHOLARS,
    IV_HALLS,
    IV_MATERIALS,
    IV_STRUCTURES,
    IV_ABILITIES,
    IV_ACHIEVEMENTS,
    IV_TITLES,
    IV_RELICS,
    IV_EVENTS,
    ivCheckSynergy,

    // ── Store state ───────────────────────────────────────────
    scholars: store.scholars,
    halls: store.halls,
    materials: store.materials,
    structures: store.structures,
    abilities: store.abilities,
    achievements: store.achievements,
    relics: store.relics,
    currentTitle: store.currentTitle,
    gold: store.gold,
    renown: store.renown,
    totalEnrolled: store.totalEnrolled,
    totalResearched: store.totalResearched,
    totalBuilt: store.totalBuilt,
    totalEventsFaced: store.totalEventsFaced,
    activeEvent: store.activeEvent,
    eventTurnsRemaining: store.eventTurnsRemaining,
    activeHall: store.activeHall,

    // ── Store actions ─────────────────────────────────────────
    ivEnrollScholar: store.ivEnrollScholar,
    ivExpelScholar: store.ivExpelScholar,
    ivTrainScholar: store.ivTrainScholar,
    ivResearchTome: store.ivResearchTome,
    ivBuildStructure: store.ivBuildStructure,
    ivUpgradeStructure: store.ivUpgradeStructure,
    ivAttendLecture: store.ivAttendLecture,
    ivCollectRelic: store.ivCollectRelic,
    ivUnlockAbility: store.ivUnlockAbility,
    ivUnlockTitle: store.ivUnlockTitle,
    ivClaimAchievement: store.ivClaimAchievement,
    ivTradeMaterial: store.ivTradeMaterial,
    ivEndEvent: store.ivEndEvent,
    ivResetEvent: store.ivResetEvent,

    // ── Computed getters ──────────────────────────────────────
    ivEnrolledScholars,
    ivAvailableScholars,
    ivCurrentTitleDetail,
    ivNextTitle,
    ivActiveHallDetail,
    ivUnvisitedHalls,
    ivBuiltStructures,
    ivUnlockableAbilities,
    ivOwnedRelics,
    ivUnclaimedAchievements,
    ivInventoryMaterials,
    ivTotalStructureEffect,
    ivAverageScholarLevel,
    ivTotalScholarPower,
    ivDisciplineDistribution,
    ivRarityDistribution,
    ivScholarsByRarity,
    ivScholarsByDiscipline,
    ivTitleProgress,
    ivRareMaterialCount,
    ivFatiguedScholars,
    ivUnhappyScholars,
    ivTotalRelicBoost,
  }

  return ivAPI
}
