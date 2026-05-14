/**
 * Emerald Spire Wire — 翡翠塔 (Emerald Spire) feature module
 *
 * A gemological emerald tower academy mini-game: enroll 35 gem scholars
 * across 7 gemology schools, study in 8 spire classrooms, collect 30
 * gemstone materials, build 25 spire structures, unlock 22 gem abilities,
 * discover 15 legendary gem artifacts, face 12 spire events, and ascend
 * through 8 titles from Rough Cutter to Emerald Deity — backed by a
 * Zustand store with persist middleware.
 *
 * Storage key: emerald-spire-wire
 * Prefix: em / EM_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type EmGemSchool =
  | 'faceting'
  | 'cabochon'
  | 'carving'
  | 'grading'
  | 'setting'
  | 'polishing'
  | 'enhancement'

export type EmRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type EmTitleId =
  | 'title_rough_cutter'
  | 'title_gem_apprentice'
  | 'title_lapidary'
  | 'title_gem_cutter'
  | 'title_jeweler'
  | 'title_spire_master'
  | 'title_emerald_sage'
  | 'title_emerald_deity'

export interface EmSchoolDef {
  readonly id: EmGemSchool
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface EmScholarDef {
  readonly id: string
  readonly name: string
  readonly school: EmGemSchool
  readonly rarity: EmRarity
  readonly cuttingSkill: number
  readonly clarity: number
  readonly precision: number
  readonly description: string
  readonly abilities: string[]
}

export interface EmScholarInstance {
  readonly id: string
  scholarDefId: string
  name: string
  level: number
  xp: number
  cuttingSkill: number
  clarity: number
  precision: number
  focus: number
  stamina: number
  enrolledAt: number
}

export interface EmClassroomDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly floor: number
  readonly difficultyLevel: number
  readonly requiredTitle: EmTitleId
  readonly school: EmGemSchool
  readonly bgGradient: string
  readonly ambientColor: string
}

export interface EmMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'rough_stone' | 'gem_shard' | 'crystal' | 'artifact_dust' | 'essence'
  readonly rarity: EmRarity
  readonly cuttingBonus: number
  readonly clarityBonus: number
  readonly value: number
  readonly description: string
}

export interface EmStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'workshop' | 'forge' | 'vault' | 'gallery' | 'observatory'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface EmStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  builtAt: number
}

export interface EmAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly school: EmGemSchool
  readonly type: 'active' | 'passive'
  readonly rarity: EmRarity
  readonly focusCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface EmAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { gold: number; renown: number }
}

export interface EmTitleDef {
  readonly id: EmTitleId
  readonly name: string
  readonly emoji: string
  readonly minRenown: number
  readonly minScholars: number
  readonly description: string
}

export interface EmArtifactDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: EmRarity
  readonly school: EmGemSchool
  readonly cuttingBoost: number
  readonly clarityBoost: number
  readonly precisionBoost: number
  readonly value: number
  readonly description: string
}

export interface EmEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface EmStoreState {
  scholars: EmScholarInstance[]
  classrooms: string[]
  materials: { materialId: string; count: number }[]
  structures: EmStructureInstance[]
  abilities: string[]
  achievements: string[]
  artifacts: string[]
  currentTitle: EmTitleId
  gold: number
  renown: number
  totalEnrolled: number
  totalGemsCut: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: EmEventDef | null
  eventTurnsRemaining: number
  activeClassroom: string | null
}

export interface EmStoreActions {
  emEnrollScholar: (scholarDefId: string) => boolean
  emExpelScholar: (scholarId: string) => boolean
  emTrainScholar: (scholarId: string) => boolean
  emCutGem: (scholarId: string) => boolean
  emBuildStructure: (structureDefId: string) => boolean
  emUpgradeStructure: (structureId: string) => boolean
  emAttendClass: (classroomId: string) => EmEventDef | null
  emCollectRelic: (artifactId: string) => boolean
  emUnlockAbility: (abilityId: string) => boolean
  emUnlockTitle: (titleId: EmTitleId) => boolean
  emClaimAchievement: (achievementId: string) => boolean
  emTradeMaterial: (materialId: string, count: number) => number
  emEndEvent: () => void
  emResetEvent: () => void
}

export interface EmFullStore extends EmStoreState, EmStoreActions {}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS (8 colors)
// ═══════════════════════════════════════════════════════════════════

export const EM_EMERALD_GREEN: string = '#046307'
export const EM_GEM_TEAL: string = '#50C878'
export const EM_CRYSTAL_CLEAR: string = '#E0FFFF'
export const EM_GOLD_SETTING: string = '#FFD700'
export const EM_ROUGH_STONE: string = '#808080'
export const EM_FIRE_RED: string = '#FF4500'
export const EM_SPARKLE_WHITE: string = '#FFFAF0'
export const EM_DEEP_FOREST: string = '#004225'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: SCHOOL DEFINITIONS (7 schools)
// ═══════════════════════════════════════════════════════════════════

export const EM_SCHOOLS: readonly EmSchoolDef[] = [
  {
    id: 'faceting',
    name: 'Faceting',
    color: EM_EMERALD_GREEN,
    description:
      'The ancient art of cutting precise angles into gemstones to maximize light refraction and brilliance.',
  },
  {
    id: 'cabochon',
    name: 'Cabochon',
    color: EM_GEM_TEAL,
    description:
      'Shaping gems into smooth, polished domes that reveal inner optical phenomena like chatoyancy and asterism.',
  },
  {
    id: 'carving',
    name: 'Carving',
    color: EM_FIRE_RED,
    description:
      'Sculpting gemstones into intricate shapes and figurines. The oldest and most artistic gem school.',
  },
  {
    id: 'grading',
    name: 'Grading',
    color: EM_CRYSTAL_CLEAR,
    description:
      'Evaluating gemstone quality by color, clarity, cut, and carat weight. The foundation of all gemology.',
  },
  {
    id: 'setting',
    name: 'Setting',
    color: EM_GOLD_SETTING,
    description:
      'Mounting and securing gems into precious metal settings. The bridge between raw beauty and wearable art.',
  },
  {
    id: 'polishing',
    name: 'Polishing',
    color: EM_SPARKLE_WHITE,
    description:
      'Bringing out the final mirror-like finish on gemstones through progressive abrasion and buffing.',
  },
  {
    id: 'enhancement',
    name: 'Enhancement',
    color: EM_DEEP_FOREST,
    description:
      'Advanced techniques to improve gem color and clarity through heat, irradiation, and fracture filling.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: SCHOOL SYNERGY TABLE
// ═══════════════════════════════════════════════════════════════════

const EM_SYNERGY_MAP: Record<EmGemSchool, EmGemSchool[]> = {
  faceting: ['polishing', 'grading'],
  cabochon: ['enhancement', 'carving'],
  carving: ['setting', 'cabochon'],
  grading: ['faceting', 'enhancement'],
  setting: ['polishing', 'carving'],
  polishing: ['faceting', 'setting'],
  enhancement: ['grading', 'cabochon'],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: EM_SCHOLARS — 35 Gem Scholars (5 per school)
// ═══════════════════════════════════════════════════════════════════

export const EM_SCHOLARS: readonly EmScholarDef[] = [
  // ── Faceting Scholars (5) ─────────────────────────────────────
  {
    id: 'facet_pebble_grinder',
    name: 'Pebble Grinder',
    school: 'faceting',
    rarity: 'common',
    cuttingSkill: 12,
    clarity: 8,
    precision: 18,
    description:
      'A beginner who learned to grind pebbles into simple spheres. Every master was once a pebble grinder.',
    abilities: ['facet_basic_cut'],
  },
  {
    id: 'facet_table_cutter',
    name: 'Table Cutter',
    school: 'faceting',
    rarity: 'common',
    cuttingSkill: 18,
    clarity: 10,
    precision: 22,
    description:
      'Specializes in cutting flat table facets. Their work is the foundation of every brilliant cut.',
    abilities: ['facet_basic_cut', 'facet_table_polish'],
  },
  {
    id: 'facet_brilliant_weaver',
    name: 'Brilliant Weaver',
    school: 'faceting',
    rarity: 'uncommon',
    cuttingSkill: 30,
    clarity: 22,
    precision: 35,
    description:
      'Weaves 57 facets into round brilliant cuts that dance with internal fire and spectral color.',
    abilities: ['facet_basic_cut', 'facet_brilliant_pattern'],
  },
  {
    id: 'facet_prism_master',
    name: 'Prism Master',
    school: 'faceting',
    rarity: 'rare',
    cuttingSkill: 55,
    clarity: 45,
    precision: 60,
    description:
      'A master of triangular facet arrangements that split light into perfect rainbow spectra.',
    abilities: ['facet_basic_cut', 'facet_brilliant_pattern', 'facet_prism_array'],
  },
  {
    id: 'facet_emerald_architect',
    name: 'Emerald Architect',
    school: 'faceting',
    rarity: 'legendary',
    cuttingSkill: 120,
    clarity: 100,
    precision: 110,
    description:
      'The legendary creator of the emerald cut. Their facets trap light in endless corridors of green fire.',
    abilities: ['facet_basic_cut', 'facet_brilliant_pattern', 'facet_prism_array', 'facet_emerald_step', 'facet_eternal_gleam'],
  },

  // ── Cabochon Scholars (5) ──────────────────────────────────────
  {
    id: 'cab_stone_smoother',
    name: 'Stone Smoother',
    school: 'cabochon',
    rarity: 'common',
    cuttingSkill: 10,
    clarity: 15,
    precision: 12,
    description:
      'Polishes rough stones into smooth cabochons. Patient and methodical with steady hands.',
    abilities: ['cab_smooth_dome'],
  },
  {
    id: 'cab_star_revealer',
    name: 'Star Revealer',
    school: 'cabochon',
    rarity: 'uncommon',
    cuttingSkill: 25,
    clarity: 35,
    precision: 20,
    description:
      'Reveals the hidden asterism in star sapphires and rubies by orienting the dome perfectly.',
    abilities: ['cab_smooth_dome', 'cab_star_orient'],
  },
  {
    id: 'cab_eye_whisperer',
    name: 'Cat\'s Eye Whisperer',
    school: 'cabochon',
    rarity: 'uncommon',
    cuttingSkill: 28,
    clarity: 38,
    precision: 24,
    description:
      'Unlocks chatoyancy in chrysoberyl, producing the mesmerizing cat\'s eye effect.',
    abilities: ['cab_smooth_dome', 'cab_chatoyant_seal'],
  },
  {
    id: 'cab_moon_gazer',
    name: 'Moon Gazer',
    school: 'cabochon',
    rarity: 'rare',
    cuttingSkill: 48,
    clarity: 65,
    precision: 40,
    description:
      'Specializes in moonstone cabochons that display ethereal blue adularescence under moonlight.',
    abilities: ['cab_smooth_dome', 'cab_star_orient', 'cab_moonlight_glow'],
  },
  {
    id: 'cab_opal_dreamer',
    name: 'Opal Dreamer',
    school: 'cabochon',
    rarity: 'legendary',
    cuttingSkill: 105,
    clarity: 130,
    precision: 90,
    description:
      'The legendary cabochon artist whose opal domes contain entire galaxies of play-of-color.',
    abilities: ['cab_smooth_dome', 'cab_star_orient', 'cab_chatoyant_seal', 'cab_moonlight_glow', 'cab_infinite_fire'],
  },

  // ── Carving Scholars (5) ───────────────────────────────────────
  {
    id: 'carv_gouge_novice',
    name: 'Gouge Novice',
    school: 'carving',
    rarity: 'common',
    cuttingSkill: 14,
    clarity: 6,
    precision: 16,
    description:
      'Learns the basics of gem carving with simple gouges and chisels on soft stones like jade.',
    abilities: ['carv_basic_gouge'],
  },
  {
    id: 'carv_flower_etcher',
    name: 'Flower Etcher',
    school: 'carving',
    rarity: 'uncommon',
    cuttingSkill: 28,
    clarity: 18,
    precision: 32,
    description:
      'Etches delicate floral patterns into rose quartz and amethyst with astonishing detail.',
    abilities: ['carv_basic_gouge', 'carv_floral_relief'],
  },
  {
    id: 'carv_beast_shaper',
    name: 'Beast Shaper',
    school: 'carving',
    rarity: 'uncommon',
    cuttingSkill: 32,
    clarity: 20,
    precision: 35,
    description:
      'Carves lifelike animals from jade and lapis lazuli. Each creature seems ready to breathe.',
    abilities: ['carv_basic_gouge', 'carv_animal_form'],
  },
  {
    id: 'carv_mythic_sculptor',
    name: 'Mythic Sculptor',
    school: 'carving',
    rarity: 'rare',
    cuttingSkill: 52,
    clarity: 38,
    precision: 58,
    description:
      'Sculpts mythological creatures from the hardest gems. Their dragons gleam with inner menace.',
    abilities: ['carv_basic_gouge', 'carv_floral_relief', 'carv_mythic_awakening'],
  },
  {
    id: 'carv_living_jade',
    name: 'Living Jade Master',
    school: 'carving',
    rarity: 'legendary',
    cuttingSkill: 115,
    clarity: 85,
    precision: 120,
    description:
      'Their jade carvings are so lifelike they seem to pulse with warmth. Legends say they breathe life into stone.',
    abilities: ['carv_basic_gouge', 'carv_floral_relief', 'carv_animal_form', 'carv_mythic_awakening', 'carv_jade_breath'],
  },

  // ── Grading Scholars (5) ───────────────────────────────────────
  {
    id: 'grade_loupe_trainee',
    name: 'Loupe Trainee',
    school: 'grading',
    rarity: 'common',
    cuttingSkill: 8,
    clarity: 20,
    precision: 14,
    description:
      'Trains their eye with a 10x loupe to spot basic inclusions and color variations.',
    abilities: ['grade_loupe_inspect'],
  },
  {
    id: 'grade_color_reader',
    name: 'Color Reader',
    school: 'grading',
    rarity: 'uncommon',
    cuttingSkill: 12,
    clarity: 38,
    precision: 22,
    description:
      'Can distinguish between 100 shades of emerald green using only natural daylight.',
    abilities: ['grade_loupe_inspect', 'grade_color_match'],
  },
  {
    id: 'grade_clarity_judge',
    name: 'Clarity Judge',
    school: 'grading',
    rarity: 'uncommon',
    cuttingSkill: 15,
    clarity: 42,
    precision: 28,
    description:
      'Judges gem clarity with flawless precision. A single microscopic inclusion cannot escape their eye.',
    abilities: ['grade_loupe_inspect', 'grade_inclusion_map'],
  },
  {
    id: 'grade_master_appraiser',
    name: 'Master Appraiser',
    school: 'grading',
    rarity: 'rare',
    cuttingSkill: 25,
    clarity: 70,
    precision: 45,
    description:
      'Certifies gems for royal treasuries. Their word on a gem\'s grade is law across the gemological world.',
    abilities: ['grade_loupe_inspect', 'grade_color_match', 'grade_royal_certify'],
  },
  {
    id: 'grade_oracle_eye',
    name: 'Oracle Eye',
    school: 'grading',
    rarity: 'legendary',
    cuttingSkill: 40,
    clarity: 140,
    precision: 80,
    description:
      'The legendary grader who can see through any gem deception. Forgeries turn to dust in their presence.',
    abilities: ['grade_loupe_inspect', 'grade_color_match', 'grade_inclusion_map', 'grade_royal_certify', 'grade_truth_vision'],
  },

  // ── Setting Scholars (5) ───────────────────────────────────────
  {
    id: 'set_prong_novice',
    name: 'Prong Novice',
    school: 'setting',
    rarity: 'common',
    cuttingSkill: 16,
    clarity: 10,
    precision: 20,
    description:
      'Bends simple prongs to hold gems in basic claw settings. The foundation of all jewelry mounting.',
    abilities: ['set_prong_bend'],
  },
  {
    id: 'set_bezel_forger',
    name: 'Bezel Forger',
    school: 'setting',
    rarity: 'uncommon',
    cuttingSkill: 30,
    clarity: 18,
    precision: 32,
    description:
      'Forges precise bezel settings that wrap metal tightly around gem girdles for maximum security.',
    abilities: ['set_prong_bend', 'set_bezel_wrap'],
  },
  {
    id: 'set_pave_artist',
    name: 'Pavé Artist',
    school: 'setting',
    rarity: 'uncommon',
    cuttingSkill: 35,
    clarity: 22,
    precision: 38,
    description:
      'Sets dozens of tiny gems in pave patterns that create fields of sparkling light on metal surfaces.',
    abilities: ['set_prong_bend', 'set_pave_field'],
  },
  {
    id: 'set_tension_master',
    name: 'Tension Master',
    school: 'setting',
    rarity: 'rare',
    cuttingSkill: 50,
    clarity: 30,
    precision: 60,
    description:
      'Sets gems using only metal tension — no prongs, no bezels. The gem appears to float in air.',
    abilities: ['set_prong_bend', 'set_bezel_wrap', 'set_tension_float'],
  },
  {
    id: 'set_celestial_mount',
    name: 'Celestial Mount',
    school: 'setting',
    rarity: 'legendary',
    cuttingSkill: 95,
    clarity: 75,
    precision: 110,
    description:
      'The legendary setter whose mounts channel starlight into gems. Their settings glow at night.',
    abilities: ['set_prong_bend', 'set_bezel_wrap', 'set_pave_field', 'set_tension_float', 'set_starlight_prong'],
  },

  // ── Polishing Scholars (5) ─────────────────────────────────────
  {
    id: 'polish_wheel_turner',
    name: 'Wheel Turner',
    school: 'polishing',
    rarity: 'common',
    cuttingSkill: 18,
    clarity: 12,
    precision: 16,
    description:
      'Operates the basic polishing wheels, learning the patience required for mirror finishes.',
    abilities: ['polish_wheel_buff'],
  },
  {
    id: 'polish_compound_alchemist',
    name: 'Compound Alchemist',
    school: 'polishing',
    rarity: 'uncommon',
    cuttingSkill: 28,
    clarity: 25,
    precision: 30,
    description:
      'Mixes proprietary polishing compounds from diamond dust and cerium oxide for superior finishes.',
    abilities: ['polish_wheel_buff', 'polish_diamond_paste'],
  },
  {
    id: 'polish_mirror_mage',
    name: 'Mirror Mage',
    school: 'polishing',
    rarity: 'uncommon',
    cuttingSkill: 35,
    clarity: 32,
    precision: 34,
    description:
      'Achieves mirror finishes so perfect that gems reflect the viewer\'s soul back at them.',
    abilities: ['polish_wheel_buff', 'polish_soul_mirror'],
  },
  {
    id: 'polish_frost_crafter',
    name: 'Frost Crafter',
    school: 'polishing',
    rarity: 'rare',
    cuttingSkill: 55,
    clarity: 48,
    precision: 50,
    description:
      'Creates a unique frosted polish that diffuses light into soft ethereal glows within gems.',
    abilities: ['polish_wheel_buff', 'polish_diamond_paste', 'polish_frost_glow'],
  },
  {
    id: 'polish_aurora_finisher',
    name: 'Aurora Finisher',
    school: 'polishing',
    rarity: 'legendary',
    cuttingSkill: 100,
    clarity: 95,
    precision: 105,
    description:
      'The legendary polisher whose finish technique creates aurora-like color shifts on every surface.',
    abilities: ['polish_wheel_buff', 'polish_diamond_paste', 'polish_soul_mirror', 'polish_frost_glow', 'polish_aurora_veil'],
  },

  // ── Enhancement Scholars (5) ───────────────────────────────────
  {
    id: 'enh_heat_tender',
    name: 'Heat Tender',
    school: 'enhancement',
    rarity: 'common',
    cuttingSkill: 20,
    clarity: 18,
    precision: 10,
    description:
      'Tends the furnaces used for heat treatment of gemstones. Controls temperature with steady hands.',
    abilities: ['enh_gentle_heat'],
  },
  {
    id: 'enh_color_forger',
    name: 'Color Forger',
    school: 'enhancement',
    rarity: 'uncommon',
    cuttingSkill: 38,
    clarity: 30,
    precision: 18,
    description:
      'Forges deeper, more vivid colors through controlled heat treatment of sapphires and rubies.',
    abilities: ['enh_gentle_heat', 'enh_color_infuse'],
  },
  {
    id: 'enh_inclusion_healer',
    name: 'Inclusion Healer',
    school: 'enhancement',
    rarity: 'uncommon',
    cuttingSkill: 35,
    clarity: 45,
    precision: 20,
    description:
      'Heals fractures and feathers in gems using advanced fracture-filling techniques with glass resins.',
    abilities: ['enh_gentle_heat', 'enh_fracture_seal'],
  },
  {
    id: 'enh_radiant_alchemist',
    name: 'Radiant Alchemist',
    school: 'enhancement',
    rarity: 'rare',
    cuttingSkill: 58,
    clarity: 55,
    precision: 30,
    description:
      'Combines heat and irradiation to produce gems of otherworldly color that glow from within.',
    abilities: ['enh_gentle_heat', 'enh_color_infuse', 'enh_inner_luminesce'],
  },
  {
    id: 'enh_emerald_transcender',
    name: 'Emerald Transcender',
    school: 'enhancement',
    rarity: 'legendary',
    cuttingSkill: 110,
    clarity: 120,
    precision: 70,
    description:
      'The legendary enhancer who can make even the dullest rough stone gleam like the finest emerald.',
    abilities: ['enh_gentle_heat', 'enh_color_infuse', 'enh_fracture_seal', 'enh_inner_luminesce', 'enh_emerald_ascend'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: EM_CLASSROOMS — 8 Spire Classrooms
// ═══════════════════════════════════════════════════════════════════

export const EM_CLASSROOMS: readonly EmClassroomDef[] = [
  {
    id: 'ground_floor_hall',
    name: 'Ground Floor Hall',
    description:
      'The vast entrance hall of the Emerald Spire, where all new scholars begin their training. Sunlight streams through emerald-paned windows.',
    floor: 0,
    difficultyLevel: 1,
    requiredTitle: 'title_rough_cutter',
    school: 'grading',
    bgGradient: 'linear-gradient(180deg, #E0FFFF 0%, #50C878 50%, #046307 100%)',
    ambientColor: EM_GEM_TEAL,
  },
  {
    id: 'quartz_quarter',
    name: 'Quartz Quarter',
    description:
      'A wing dedicated to quartz studies. Rose quartz specimens line the walls, casting a warm pink glow on study benches.',
    floor: 1,
    difficultyLevel: 2,
    requiredTitle: 'title_rough_cutter',
    school: 'polishing',
    bgGradient: 'linear-gradient(180deg, #FFFAF0 0%, #50C878 50%, #E0FFFF 100%)',
    ambientColor: EM_SPARKLE_WHITE,
  },
  {
    id: 'agate_annex',
    name: 'Agate Annex',
    description:
      'A layered chamber mirroring the banding of agate itself. Scholars here learn to read the stories hidden in stone.',
    floor: 2,
    difficultyLevel: 3,
    requiredTitle: 'title_gem_apprentice',
    school: 'cabochon',
    bgGradient: 'linear-gradient(180deg, #FFD700 0%, #808080 50%, #50C878 100%)',
    ambientColor: EM_ROUGH_STONE,
  },
  {
    id: 'jade_gallery',
    name: 'Jade Gallery',
    description:
      'A magnificent gallery where the finest jade carvings are displayed. The air smells of wet stone and ancient earth.',
    floor: 3,
    difficultyLevel: 4,
    requiredTitle: 'title_lapidary',
    school: 'carving',
    bgGradient: 'linear-gradient(180deg, #004225 0%, #50C878 50%, #FFD700 100%)',
    ambientColor: EM_DEEP_FOREST,
  },
  {
    id: 'sapphire_sanctum',
    name: 'Sapphire Sanctum',
    description:
      'A deep blue chamber where sapphire grading occurs under controlled light. The most precise work in the Spire.',
    floor: 4,
    difficultyLevel: 5,
    requiredTitle: 'title_gem_cutter',
    school: 'grading',
    bgGradient: 'linear-gradient(180deg, #FFD700 0%, #E0FFFF 50%, #046307 100%)',
    ambientColor: EM_CRYSTAL_CLEAR,
  },
  {
    id: 'ruby_forge',
    name: 'Ruby Forge',
    description:
      'A hot, fierce workshop where gems are heat-treated to enhance their color. The furnace glow matches the ruby hue of the walls.',
    floor: 5,
    difficultyLevel: 6,
    requiredTitle: 'title_jeweler',
    school: 'enhancement',
    bgGradient: 'linear-gradient(180deg, #FF4500 0%, #50C878 50%, #FFD700 100%)',
    ambientColor: EM_FIRE_RED,
  },
  {
    id: 'diamond_workshop',
    name: 'Diamond Workshop',
    description:
      'The legendary seventh floor where only master faceters work. Diamond dust fills the air like glittering snow.',
    floor: 6,
    difficultyLevel: 7,
    requiredTitle: 'title_spire_master',
    school: 'faceting',
    bgGradient: 'linear-gradient(180deg, #E0FFFF 0%, #808080 50%, #FFD700 100%)',
    ambientColor: EM_CRYSTAL_CLEAR,
  },
  {
    id: 'emerald_apex',
    name: 'Emerald Apex',
    description:
      'The pinnacle of the Spire. A single enormous emerald crystal illuminates the room with living green light. Only Emerald Sages may enter.',
    floor: 7,
    difficultyLevel: 8,
    requiredTitle: 'title_emerald_sage',
    school: 'setting',
    bgGradient: 'linear-gradient(180deg, #50C878 0%, #046307 50%, #FFD700 100%)',
    ambientColor: EM_EMERALD_GREEN,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: EM_MATERIALS — 30 Gemstone Materials
// ═══════════════════════════════════════════════════════════════════

export const EM_MATERIALS: readonly EmMaterialDef[] = [
  // Common (8)
  { id: 'mat_rough_quartz', name: 'Rough Quartz', emoji: '🪨', type: 'rough_stone', rarity: 'common', cuttingBonus: 2, clarityBonus: 1, value: 10, description: 'A cloudy chunk of raw quartz. Good practice material for beginners.' },
  { id: 'mat_tumbled_agate', name: 'Tumbled Agate', emoji: '🟤', type: 'rough_stone', rarity: 'common', cuttingBonus: 1, clarityBonus: 3, value: 12, description: 'A naturally tumbled agate pebble with faint banding patterns.' },
  { id: 'mat_jade_shard', name: 'Jade Shard', emoji: '💚', type: 'gem_shard', rarity: 'common', cuttingBonus: 3, clarityBonus: 2, value: 14, description: 'A small fragment of nephrite jade, smooth and cool to the touch.' },
  { id: 'mat_amethyst_chip', name: 'Amethyst Chip', emoji: '💜', type: 'gem_shard', rarity: 'common', cuttingBonus: 4, clarityBonus: 1, value: 16, description: 'A chip of pale amethyst with hints of purple at the edges.' },
  { id: 'mat_citrine_dust', name: 'Citrine Dust', emoji: '✨', type: 'artifact_dust', rarity: 'common', cuttingBonus: 2, clarityBonus: 2, value: 8, description: 'Fine golden dust from grinding citrine. Used in polishing compounds.' },
  { id: 'mat_rose_quartz_piece', name: 'Rose Quartz Piece', emoji: '🩷', type: 'gem_shard', rarity: 'common', cuttingBonus: 3, clarityBonus: 2, value: 15, description: 'A translucent pink piece of rose quartz with gentle chatoyancy.' },
  { id: 'mat_garnet_grain', name: 'Garnet Grain', emoji: '🔴', type: 'rough_stone', rarity: 'common', cuttingBonus: 5, clarityBonus: 0, value: 18, description: 'A small deep-red garnet crystal, still embedded in mica schist.' },
  { id: 'mat_peridot_flake', name: 'Peridot Flake', emoji: '🟢', type: 'gem_shard', rarity: 'common', cuttingBonus: 4, clarityBonus: 2, value: 20, description: 'An olive-green peridot flake that catches light like spring leaves.' },

  // Uncommon (7)
  { id: 'mat_blue_topaz_cab', name: 'Blue Topaz Cabochon', emoji: '🔵', type: 'crystal', rarity: 'uncommon', cuttingBonus: 8, clarityBonus: 12, value: 80, description: 'A sky-blue topaz cut into a smooth dome with excellent transparency.' },
  { id: 'mat_tourmaline_slice', name: 'Tourmaline Slice', emoji: '🌈', type: 'gem_shard', rarity: 'uncommon', cuttingBonus: 10, clarityBonus: 8, value: 65, description: 'A bi-color tourmaline slice showing pink and green zones.' },
  { id: 'mat_aquamarine_crystal', name: 'Aquamarine Crystal', emoji: '💎', type: 'crystal', rarity: 'uncommon', cuttingBonus: 6, clarityBonus: 15, value: 90, description: 'A sea-blue aquamarine crystal of exceptional clarity.' },
  { id: 'mat_tiger_eye_rough', name: 'Tiger Eye Rough', emoji: '🟡', type: 'rough_stone', rarity: 'uncommon', cuttingBonus: 12, clarityBonus: 5, value: 72, description: 'Raw tiger eye with golden chatoyancy that shifts in the light.' },
  { id: 'mat_moonstone_cab', name: 'Moonstone Cabochon', emoji: '🌙', type: 'crystal', rarity: 'uncommon', cuttingBonus: 5, clarityBonus: 18, value: 85, description: 'A milky moonstone cabochon displaying blue adularescence.' },
  { id: 'mat_opal_fire_dust', name: 'Fire Opal Dust', emoji: '🔥', type: 'artifact_dust', rarity: 'uncommon', cuttingBonus: 15, clarityBonus: 3, value: 75, description: 'Potent dust from grinding Mexican fire opal. Red-orange sparks within.' },
  { id: 'mat_lapis_powder', name: 'Lapis Lazuli Powder', emoji: '🔵', type: 'artifact_dust', rarity: 'uncommon', cuttingBonus: 7, clarityBonus: 10, value: 70, description: 'Deep blue powder with gold pyrite flecks. Ancient pigment material.' },

  // Rare (6)
  { id: 'mat_star_sapphire', name: 'Star Sapphire', emoji: '⭐', type: 'crystal', rarity: 'rare', cuttingBonus: 25, clarityBonus: 35, value: 350, description: 'A gray-blue sapphire displaying a perfect six-rayed star.' },
  { id: 'mat_emerald_rough', name: 'Rough Emerald Crystal', emoji: '💚', type: 'rough_stone', rarity: 'rare', cuttingBonus: 30, clarityBonus: 20, value: 400, description: 'A natural emerald crystal from Colombian mines with vivid green color.' },
  { id: 'mat_ruby_crystal', name: 'Ruby Crystal', emoji: '❤️', type: 'crystal', rarity: 'rare', cuttingBonus: 35, clarityBonus: 15, value: 380, description: 'A pigeon-blood ruby crystal of exceptional color saturation.' },
  { id: 'mat_tsavorite_garnet', name: 'Tsavorite Garnet', emoji: '💚', type: 'crystal', rarity: 'rare', cuttingBonus: 20, clarityBonus: 25, value: 320, description: 'A brilliant green garnet rivaling emerald in color with greater clarity.' },
  { id: 'mat_padparadscha', name: 'Padparadscha Sapphire', emoji: '🧡', type: 'crystal', rarity: 'rare', cuttingBonus: 22, clarityBonus: 28, value: 360, description: 'The rare pink-orange sapphire from Sri Lanka, coveted by collectors.' },
  { id: 'mat_black_opal', name: 'Black Opal', emoji: '🖤', type: 'crystal', rarity: 'rare', cuttingBonus: 18, clarityBonus: 30, value: 420, description: 'An Australian black opal with vivid play-of-color on dark body tone.' },

  // Epic (5)
  { id: 'mat_alexandrite_crystal', name: 'Alexandrite Crystal', emoji: '🌿', type: 'crystal', rarity: 'epic', cuttingBonus: 40, clarityBonus: 60, value: 1800, description: 'The color-change chrysoberyl that shifts from green to red under different light sources.' },
  { id: 'mat_kashmir_sapphire', name: 'Kashmir Sapphire', emoji: '💎', type: 'crystal', rarity: 'epic', cuttingBonus: 35, clarityBonus: 55, value: 2000, description: 'The legendary cornflower blue sapphire from the depleted Kashmir mines.' },
  { id: 'mat_paraiba_tourmaline', name: 'Paraíba Tourmaline', emoji: '💠', type: 'crystal', rarity: 'epic', cuttingBonus: 45, clarityBonus: 50, value: 2200, description: 'An electric neon blue-green tourmaline from Paraíba, Brazil. The gem world\'s most electrifying stone.' },
  { id: 'mat_muzo_emerald', name: 'Muzo Emerald', emoji: '💚', type: 'crystal', rarity: 'epic', cuttingBonus: 38, clarityBonus: 48, value: 1600, description: 'A trapiche emerald from Muzo with its distinctive six-spoke pattern of inclusions.' },
  { id: 'mat_pink_diamond', name: 'Pink Diamond Rough', emoji: '💗', type: 'rough_stone', rarity: 'epic', cuttingBonus: 50, clarityBonus: 45, value: 2500, description: 'A rare pink diamond rough from the Argyle mine. The rarest of diamond colors.' },

  // Legendary (4)
  { id: 'mat_hope_essence', name: 'Hope Diamond Essence', emoji: '💙', type: 'essence', rarity: 'legendary', cuttingBonus: 60, clarityBonus: 80, value: 12000, description: 'Liquid essence extracted from the legendary Hope Diamond. Imbues any gem with supernatural brilliance.' },
  { id: 'mat_kohinoor_dust', name: 'Koh-i-Noor Stardust', emoji: '✨', type: 'essence', rarity: 'legendary', cuttingBonus: 80, clarityBonus: 60, value: 15000, description: 'Stardust from the Mountain of Light itself. Contains the accumulated brilliance of centuries.' },
  { id: 'mat_emerald_tablet_shard', name: 'Emerald Tablet Shard', emoji: '📜', type: 'essence', rarity: 'legendary', cuttingBonus: 50, clarityBonus: 90, value: 18000, description: 'A fragment of the mythical Emerald Tablet of Hermes Trismegistus. Transmutation power flows through it.' },
  { id: 'mat_celestial_alexandrite', name: 'Celestial Alexandrite', emoji: '🌟', type: 'essence', rarity: 'legendary', cuttingBonus: 70, clarityBonus: 70, value: 20000, description: 'An otherworldly alexandrite that displays three distinct color changes under sun, moon, and starlight.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: EM_STRUCTURES — 25 Spire Structures (upgradeable to L10)
// ═══════════════════════════════════════════════════════════════════

export const EM_STRUCTURES: readonly EmStructureDef[] = [
  // ── Workshops (7) ──────────────────────────────────────────────
  { id: 'str_faceting_bench', name: 'Faceting Workbench', emoji: '🔧', category: 'workshop', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4, description: 'A basic lapidary bench with grinding wheels for learning faceting techniques.' },
  { id: 'str_cabochon_station', name: 'Cabochon Station', emoji: '🎨', category: 'workshop', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 80, costMultiplier: 1.5, description: 'A station for shaping and polishing cabochons with progressive grit wheels.' },
  { id: 'str_carving_atelier', name: 'Carving Atelier', emoji: '🪚', category: 'workshop', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.5, description: 'An atelier equipped with diamond-tipped carving tools for intricate gem sculpture.' },
  { id: 'str_grading_lab', name: 'Grading Laboratory', emoji: '🔬', category: 'workshop', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 180, costMultiplier: 1.6, description: 'A climate-controlled lab with standard light sources for accurate gem grading.' },
  { id: 'str_setting_studio', name: 'Setting Studio', emoji: '💍', category: 'workshop', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 150, costMultiplier: 1.5, description: 'A jeweler\'s studio with micro-torches and precision setting tools.' },
  { id: 'str_polishing_room', name: 'Polishing Room', emoji: '✨', category: 'workshop', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 160, costMultiplier: 1.5, description: 'A dust-controlled room with high-speed polishing wheels and compound stations.' },
  { id: 'str_enhancement_oven', name: 'Enhancement Oven', emoji: '🔥', category: 'workshop', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 200, costMultiplier: 1.6, description: 'A high-temperature oven with precise controls for gem heat treatment.' },

  // ── Forges (6) ─────────────────────────────────────────────────
  { id: 'str_basic_forge', name: 'Basic Gem Forge', emoji: '⚒️', category: 'forge', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, description: 'A small forge for melting and alloying precious metals for settings.' },
  { id: 'str_crystal_foundry', name: 'Crystal Foundry', emoji: '🌋', category: 'forge', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 250, costMultiplier: 1.6, description: 'An advanced foundry that can grow synthetic crystals under controlled conditions.' },
  { id: 'str_diamond_press', name: 'Diamond Press', emoji: '💠', category: 'forge', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 400, costMultiplier: 1.7, description: 'A hydraulic press capable of cutting the hardest gemstones with exacting pressure.' },
  { id: 'str_lapidary_cauldron', name: 'Lapidary Cauldron', emoji: '🫧', category: 'forge', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 600, costMultiplier: 1.8, description: 'A magical cauldron where dissimilar gems can be combined into exotic composites.' },
  { id: 'str_starlight_kiln', name: 'Starlight Kiln', emoji: '🌟', category: 'forge', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 900, costMultiplier: 1.9, description: 'A kiln that fires gems under concentrated starlight, producing unique optical effects.' },
  { id: 'str_emerald_crucible', name: 'Emerald Crucible', emoji: '💚', category: 'forge', maxLevel: 10, baseEffect: 14, effectPerLevel: 7, baseCost: 850, costMultiplier: 1.9, description: 'A crucible lined with emerald dust that enhances any gem placed within it.' },

  // ── Vaults (5) ─────────────────────────────────────────────────
  { id: 'str_gem_safe', name: 'Gem Safe', emoji: '🔒', category: 'vault', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 120, costMultiplier: 1.5, description: 'A secure safe for storing valuable gemstones and materials.' },
  { id: 'str_crystal_vault', name: 'Crystal Vault', emoji: '🏛️', category: 'vault', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.6, description: 'A magically reinforced vault that preserves gem brilliance indefinitely.' },
  { id: 'str_emerald_treasury', name: 'Emerald Treasury', emoji: '💰', category: 'vault', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 500, costMultiplier: 1.7, description: 'A treasury that generates interest on stored gem value over time.' },
  { id: 'str_dragon_hoard', name: 'Dragon Hoard Vault', emoji: '🐉', category: 'vault', maxLevel: 10, baseEffect: 20, effectPerLevel: 10, baseCost: 800, costMultiplier: 1.8, description: 'A vault inspired by dragon hoards. Gems stored here gain a protective aura.' },
  { id: 'str_void_repository', name: 'Void Repository', emoji: '🕳️', category: 'vault', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1200, costMultiplier: 2.0, description: 'A pocket-dimension vault with infinite storage. Items placed here exist outside time.' },

  // ── Galleries (4) ──────────────────────────────────────────────
  { id: 'str_display_case', name: 'Gem Display Case', emoji: '🖼️', category: 'gallery', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 200, costMultiplier: 1.5, description: 'An illuminated display case that boosts the renown value of exhibited gems.' },
  { id: 'str_spire_exhibition', name: 'Spire Exhibition Hall', emoji: '🏰', category: 'gallery', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 450, costMultiplier: 1.7, description: 'A grand hall for exhibiting masterwork gems to visiting gemologists.' },
  { id: 'str_rooftop_observatory', name: 'Rooftop Observatory', emoji: '🔭', category: 'gallery', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 700, costMultiplier: 1.8, description: 'An observatory on the Spire roof where gems can be charged by concentrated moonlight.' },
  { id: 'str_eternal_pavilion', name: 'Eternal Pavilion', emoji: '👑', category: 'gallery', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1500, costMultiplier: 2.0, description: 'A pavilion of living crystal that evolves with the gems displayed within it.' },

  // ── Observatories (3) ──────────────────────────────────────────
  { id: 'str_light_lab', name: 'Light Refraction Lab', emoji: '💡', category: 'observatory', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.5, description: 'A laboratory for studying how gems interact with different wavelengths of light.' },
  { id: 'str_spectrum_chamber', name: 'Spectrum Chamber', emoji: '🌈', category: 'observatory', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 600, costMultiplier: 1.7, description: 'A chamber that breaks light into pure spectra, revealing hidden inclusions.' },
  { id: 'str_celestial_lens', name: 'Celestial Lens Array', emoji: '🌟', category: 'observatory', maxLevel: 10, baseEffect: 30, effectPerLevel: 15, baseCost: 2000, costMultiplier: 2.0, description: 'An array of enchanted lenses that focus starlight for the ultimate gem enhancement.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: EM_ABILITIES — 22 Gem Abilities
// ═══════════════════════════════════════════════════════════════════

export const EM_ABILITIES: readonly EmAbilityDef[] = [
  { id: 'ab_basic_cut', name: 'Basic Cut', emoji: '✂️', school: 'faceting', type: 'active', rarity: 'common', focusCost: 5, cooldown: 30, power: 15, description: 'Perform a simple table cut to improve a gem\'s basic light return.' },
  { id: 'ab_dome_shape', name: 'Dome Shape', emoji: '🔮', school: 'cabochon', type: 'active', rarity: 'common', focusCost: 8, cooldown: 45, power: 20, description: 'Shape a gem into a smooth cabochon dome to reveal internal optical effects.' },
  { id: 'ab_rough_hew', name: 'Rough Hew', emoji: '🪨', school: 'carving', type: 'active', rarity: 'common', focusCost: 10, cooldown: 60, power: 10, description: 'Hew a rough preform from raw gem material using chisel and hammer.' },
  { id: 'ab_color_sort', name: 'Color Sort', emoji: '🎨', school: 'grading', type: 'active', rarity: 'common', focusCost: 12, cooldown: 90, power: 5, description: 'Sort a batch of gems by color grade with supernatural precision.' },
  { id: 'ab_claw_set', name: 'Claw Set', emoji: '🤏', school: 'setting', type: 'active', rarity: 'common', focusCost: 6, cooldown: 30, power: 12, description: 'Set a gem using a basic four-prong claw setting quickly and securely.' },
  { id: 'ab_hand_buff', name: 'Hand Buff', emoji: '🤲', school: 'polishing', type: 'active', rarity: 'common', focusCost: 7, cooldown: 35, power: 10, description: 'Buff a gem surface to a satin finish using hand-held felt tools.' },
  { id: 'ab_gentle_flame', name: 'Gentle Flame', emoji: '🔥', school: 'enhancement', type: 'active', rarity: 'common', focusCost: 8, cooldown: 40, power: 18, description: 'Apply gentle heat to a gem to improve its color saturation slightly.' },
  { id: 'ab_brilliant_pattern', name: 'Brilliant Pattern', emoji: '💎', school: 'faceting', type: 'active', rarity: 'uncommon', focusCost: 15, cooldown: 60, power: 30, description: 'Cut a brilliant facet pattern that maximizes fire and scintillation.' },
  { id: 'ab_inclusion_map', name: 'Inclusion Map', emoji: '🗺️', school: 'grading', type: 'active', rarity: 'uncommon', focusCost: 20, cooldown: 90, power: 35, description: 'Map every microscopic inclusion within a gem, creating a complete internal diagram.' },
  { id: 'ab_chatoyant_seal', name: 'Chatoyant Seal', emoji: '👁️', school: 'cabochon', type: 'active', rarity: 'uncommon', focusCost: 18, cooldown: 75, power: 28, description: 'Seal the chatoyant effect into a cabochon permanently through precision orientation.' },
  { id: 'ab_floral_relief', name: 'Floral Relief', emoji: '🌸', school: 'carving', type: 'active', rarity: 'uncommon', focusCost: 22, cooldown: 100, power: 32, description: 'Carve a detailed floral relief into gemstone with microscopic petal detail.' },
  { id: 'ab_bezel_wrap', name: 'Bezel Wrap', emoji: '💍', school: 'setting', type: 'active', rarity: 'uncommon', focusCost: 15, cooldown: 60, power: 25, description: 'Form a seamless bezel setting that appears to grow from the metal organically.' },
  { id: 'ab_diamond_paste', name: 'Diamond Paste', emoji: '✨', school: 'polishing', type: 'active', rarity: 'uncommon', focusCost: 18, cooldown: 80, power: 22, description: 'Apply diamond paste polish to achieve a mirror finish on hard gemstones.' },
  { id: 'ab_color_infuse', name: 'Color Infuse', emoji: '🎨', school: 'enhancement', type: 'active', rarity: 'uncommon', focusCost: 16, cooldown: 55, power: 30, description: 'Infuse deeper color into a gem through controlled heat and atmospheric conditions.' },
  { id: 'ab_prism_array', name: 'Prism Array', emoji: '🔺', school: 'faceting', type: 'active', rarity: 'rare', focusCost: 30, cooldown: 120, power: 50, description: 'Cut an array of precise triangular facets that split light into perfect spectral colors.' },
  { id: 'ab_royal_certify', name: 'Royal Certification', emoji: '📜', school: 'grading', type: 'active', rarity: 'rare', focusCost: 35, cooldown: 150, power: 55, description: 'Issue a royal certification that permanently increases a gem\'s market value.' },
  { id: 'ab_animal_form', name: 'Animal Form', emoji: '🦎', school: 'carving', type: 'active', rarity: 'rare', focusCost: 28, cooldown: 110, power: 45, description: 'Carve a gem into a lifelike animal form that seems to breathe with inner fire.' },
  { id: 'ab_soul_mirror', name: 'Soul Mirror Polish', emoji: '🪞', school: 'polishing', type: 'passive', rarity: 'rare', focusCost: 0, cooldown: 0, power: 15, description: 'Passive: All polished gems by this scholar gain a slight soul-reflecting quality.' },
  { id: 'ab_tension_float', name: 'Tension Float Set', emoji: '💫', school: 'setting', type: 'active', rarity: 'rare', focusCost: 40, cooldown: 180, power: 60, description: 'Set a gem using pure metal tension so it appears to levitate within its mounting.' },
  { id: 'ab_inner_luminesce', name: 'Inner Luminescence', emoji: '🌟', school: 'enhancement', type: 'active', rarity: 'rare', focusCost: 25, cooldown: 120, power: 40, description: 'Enhance a gem so it glows with soft inner light visible even in complete darkness.' },
  { id: 'ab_emerald_step', name: 'Emerald Step Cut', emoji: '💚', school: 'faceting', type: 'active', rarity: 'epic', focusCost: 50, cooldown: 300, power: 80, description: 'Execute the perfect emerald step cut, creating corridors of light within the gem.' },
  { id: 'ab_emerald_ascend', name: 'Emerald Ascension', emoji: '👑', school: 'enhancement', type: 'active', rarity: 'legendary', focusCost: 60, cooldown: 600, power: 120, description: 'Transcend any gem into an emerald-like state with unmatched color depth and clarity.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: EM_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const EM_ACHIEVEMENTS: readonly EmAchievementDef[] = [
  { id: 'ach_first_enroll', name: 'First Enrollment', emoji: '💎', description: 'Enroll your first gem scholar.', condition: 'enroll_1', reward: { gold: 50, renown: 10 } },
  { id: 'ach_five_scholars', name: 'Scholar Collector', emoji: '🤚', description: 'Enroll 5 different gem scholars.', condition: 'enroll_5', reward: { gold: 200, renown: 40 } },
  { id: 'ach_first_cut', name: 'First Cut', emoji: '✂️', description: 'Cut your first gemstone.', condition: 'cut_1', reward: { gold: 80, renown: 15 } },
  { id: 'ach_ten_cuts', name: 'Master Cutter', emoji: '💎', description: 'Cut gemstones 10 times.', condition: 'cut_10', reward: { gold: 300, renown: 60 } },
  { id: 'ach_first_build', name: 'Spire Groundbreaking', emoji: '🏗️', description: 'Build your first spire structure.', condition: 'build_1', reward: { gold: 100, renown: 20 } },
  { id: 'ach_five_builds', name: 'Spire Architect', emoji: '🏰', description: 'Build 5 different spire structures.', condition: 'build_5', reward: { gold: 500, renown: 80 } },
  { id: 'ach_classroom_attend', name: 'Diligent Student', emoji: '📚', description: 'Attend 4 different classrooms.', condition: 'classroom_4', reward: { gold: 400, renown: 50 } },
  { id: 'ach_all_classrooms', name: 'Spire Sage', emoji: '🌍', description: 'Attend all 8 spire classrooms.', condition: 'classroom_8', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_rare_scholar', name: 'Rare Discovery', emoji: '💎', description: 'Enroll a rare scholar.', condition: 'rare_enroll', reward: { gold: 500, renown: 100 } },
  { id: 'ach_epic_scholar', name: 'Epic Brilliance', emoji: '🌟', description: 'Enroll an epic scholar.', condition: 'epic_enroll', reward: { gold: 1500, renown: 250 } },
  { id: 'ach_legendary_scholar', name: 'Legendary Master', emoji: '👑', description: 'Enroll a legendary scholar.', condition: 'legendary_enroll', reward: { gold: 5000, renown: 500 } },
  { id: 'ach_first_artifact', name: 'Artifact Finder', emoji: '🏺', description: 'Discover your first gem artifact.', condition: 'artifact_1', reward: { gold: 300, renown: 60 } },
  { id: 'ach_five_artifacts', name: 'Artifact Hunter', emoji: '🔍', description: 'Collect 5 different gem artifacts.', condition: 'artifact_5', reward: { gold: 1000, renown: 150 } },
  { id: 'ach_first_event', name: 'Event Survivor', emoji: '⚡', description: 'Survive your first spire event.', condition: 'event_1', reward: { gold: 200, renown: 30 } },
  { id: 'ach_ten_events', name: 'Event Veteran', emoji: '🏅', description: 'Survive 10 spire events.', condition: 'event_10', reward: { gold: 800, renown: 120 } },
  { id: 'ach_upgrade_max', name: 'Master Builder', emoji: '🔨', description: 'Upgrade any structure to level 10.', condition: 'upgrade_10', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_all_schools', name: 'School polymath', emoji: '🌈', description: 'Enroll at least one scholar from each school.', condition: 'all_schools', reward: { gold: 3000, renown: 300 } },
  { id: 'ach_max_title', name: 'Emerald Deity', emoji: '👑', description: 'Reach the title of Emerald Deity.', condition: 'max_title', reward: { gold: 10000, renown: 1000 } },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: EM_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const EM_TITLES: readonly EmTitleDef[] = [
  { id: 'title_rough_cutter', name: 'Rough Cutter', emoji: '🪨', minRenown: 0, minScholars: 0, description: 'A beginner who breaks rough stones and dreams of cutting their first gem.' },
  { id: 'title_gem_apprentice', name: 'Gem Apprentice', emoji: '💎', minRenown: 50, minScholars: 3, description: 'An apprentice learning the fundamentals of gem cutting and polishing.' },
  { id: 'title_lapidary', name: 'Lapidary', emoji: '✨', minRenown: 200, minScholars: 7, description: 'A skilled lapidary who can transform rough stones into beautiful gems.' },
  { id: 'title_gem_cutter', name: 'Gem Cutter', emoji: '✂️', minRenown: 500, minScholars: 12, description: 'An expert cutter whose faceted gems command respect in every gem market.' },
  { id: 'title_jeweler', name: 'Master Jeweler', emoji: '💍', minRenown: 1200, minScholars: 18, description: 'A master jeweler who designs and creates breathtaking gem-set pieces.' },
  { id: 'title_spire_master', name: 'Spire Master', emoji: '🏰', minRenown: 2500, minScholars: 24, description: 'A master of the Emerald Spire who commands all seven gemology schools.' },
  { id: 'title_emerald_sage', name: 'Emerald Sage', emoji: '🌿', minRenown: 5000, minScholars: 30, description: 'A sage whose knowledge of gems borders on the supernatural and legendary.' },
  { id: 'title_emerald_deity', name: 'Emerald Deity', emoji: '👑', minRenown: 10000, minScholars: 35, description: 'The supreme Emerald Deity, master of all gems and ruler of the Spire itself.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: EM_RARITIES — 5 Rarity Definitions
// ═══════════════════════════════════════════════════════════════════

export const EM_RARITIES: readonly { id: EmRarity; name: string; color: string; description: string }[] = [
  { id: 'common', name: 'Common', color: EM_ROUGH_STONE, description: 'Everyday gemstone material found in abundance.' },
  { id: 'uncommon', name: 'Uncommon', color: EM_GEM_TEAL, description: 'Above-average quality stones with good color and clarity.' },
  { id: 'rare', name: 'Rare', color: EM_CRYSTAL_CLEAR, description: 'Exceptional gems prized by collectors and jewelers.' },
  { id: 'epic', name: 'Epic', color: EM_FIRE_RED, description: 'Legendary stones of extraordinary beauty and rarity.' },
  { id: 'legendary', name: 'Legendary', color: EM_GOLD_SETTING, description: 'Mythical gems of incalculable value, each one unique.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: EM_RELICS — 15 Legendary Gem Artifacts
// ═══════════════════════════════════════════════════════════════════

export const EM_RELICS: readonly EmArtifactDef[] = [
  { id: 'relic_emerald_tablet', name: 'Emerald Tablet', emoji: '📜', rarity: 'epic', school: 'enhancement', cuttingBoost: 20, clarityBoost: 15, precisionBoost: 10, value: 2000, description: 'A tablet inscribed with the secrets of gem transmutation in ancient emerald ink.' },
  { id: 'relic_lapidary_lens', name: 'Lapidary Lens', emoji: '🔍', rarity: 'epic', school: 'grading', cuttingBoost: 35, clarityBoost: 5, precisionBoost: 5, value: 2200, description: 'A magnifying lens that reveals the true nature and hidden flaws of any gemstone.' },
  { id: 'relic_gem_scales', name: 'Gemologist Scales', emoji: '⚖️', rarity: 'rare', school: 'grading', cuttingBoost: 10, clarityBoost: 10, precisionBoost: 15, value: 800, description: 'Perfectly balanced scales that can weigh even the smallest gem dust particles.' },
  { id: 'relic_jade_chisel', name: 'Jade Chisel', emoji: '🪚', rarity: 'rare', school: 'carving', cuttingBoost: 5, clarityBoost: 20, precisionBoost: 10, value: 750, description: 'A chisel carved from ancient jade that never dulls and guides the hand to perfect cuts.' },
  { id: 'relic_diamond_tongs', name: 'Diamond Tongs', emoji: '🔧', rarity: 'epic', school: 'faceting', cuttingBoost: 25, clarityBoost: 20, precisionBoost: 15, value: 2500, description: 'Tongs tipped with industrial diamond that can hold and position the hardest gems.' },
  { id: 'relic_opal_crown', name: 'Opal Crown', emoji: '👑', rarity: 'epic', school: 'setting', cuttingBoost: 15, clarityBoost: 15, precisionBoost: 25, value: 2400, description: 'A crown set with opals that shift colors to match the gems being worked on.' },
  { id: 'relic_forge_hammer', name: 'Forge Hammer', emoji: '🔨', rarity: 'epic', school: 'enhancement', cuttingBoost: 20, clarityBoost: 25, precisionBoost: 10, value: 2600, description: 'A hammer that strikes with precisely calibrated force for heat-treating gems.' },
  { id: 'relic_star_diadem', name: 'Star Diadem', emoji: '⭐', rarity: 'legendary', school: 'faceting', cuttingBoost: 40, clarityBoost: 30, precisionBoost: 20, value: 8000, description: 'A diadem set with star sapphires that guide the cutter\'s hand to perfect facet angles.' },
  { id: 'relic_philosopher_gem', name: 'Philosopher\'s Gem', emoji: '💠', rarity: 'legendary', school: 'enhancement', cuttingBoost: 30, clarityBoost: 40, precisionBoost: 15, value: 7500, description: 'A gem that embodies the philosopher\'s stone. It enhances any material it touches.' },
  { id: 'relic_heart_of_fire', name: 'Heart of Fire Ruby', emoji: '❤️', rarity: 'legendary', school: 'enhancement', cuttingBoost: 60, clarityBoost: 20, precisionBoost: 20, value: 10000, description: 'A ruby so perfectly cut that it generates its own heat. Essential for heat treatments.' },
  { id: 'relic_ocean_eye', name: 'Ocean Eye Aquamarine', emoji: '🌊', rarity: 'legendary', school: 'cabochon', cuttingBoost: 25, clarityBoost: 35, precisionBoost: 30, value: 9000, description: 'A cabochon so clear it seems to contain an entire ocean within its depths.' },
  { id: 'relic_night_sapphire', name: 'Night Sapphire', emoji: '🌑', rarity: 'legendary', school: 'grading', cuttingBoost: 35, clarityBoost: 35, precisionBoost: 25, value: 9500, description: 'A black star sapphire that reveals hidden inclusions under its star pattern.' },
  { id: 'relic_ancient_scribe', name: 'Ancient Scribe Pen', emoji: '🪶', rarity: 'epic', school: 'grading', cuttingBoost: 20, clarityBoost: 15, precisionBoost: 30, value: 2300, description: 'A pen that writes gem certification documents with unforgeable emerald ink.' },
  { id: 'relic_eternal_setting', name: 'Eternal Setting', emoji: '💍', rarity: 'legendary', school: 'setting', cuttingBoost: 50, clarityBoost: 45, precisionBoost: 25, value: 11000, description: 'A setting that adjusts itself to perfectly hold any gem, no matter the shape or size.' },
  { id: 'relic_prism_of_ages', name: 'Prism of Ages', emoji: '🔺', rarity: 'legendary', school: 'faceting', cuttingBoost: 30, clarityBoost: 30, precisionBoost: 40, value: 12000, description: 'A crystal prism that has focused a million sunrises. It splits light into pure knowledge.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: EM_EVENTS — 12 Spire Events
// ═══════════════════════════════════════════════════════════════════

export const EM_EVENTS: readonly EmEventDef[] = [
  { id: 'evt_emerald_rain', name: 'Emerald Rain', emoji: '💚', durationTurns: 5, effectType: 'buff', effectDescription: 'Cutting skill doubled. All classrooms accessible.', description: 'A rain of small emeralds falls from the Spire apex, filling the halls with green light.' },
  { id: 'evt_crystal_storm', name: 'Crystal Storm', emoji: '🌪️', durationTurns: 3, effectType: 'debuff', effectDescription: 'Precision reduced by 30%. Polishing school immune.', description: 'A storm of crystal shards sweeps through the Spire, disrupting delicate work.' },
  { id: 'evt_ancient_vein', name: 'Ancient Vein Discovered', emoji: '⛏️', durationTurns: 4, effectType: 'special', effectDescription: 'Enhancement scholars gain +50 power. Rare materials appear.', description: 'An ancient gem vein is discovered deep beneath the Spire, yielding extraordinary rough.' },
  { id: 'evt_solar_eclipse', name: 'Gem Eclipse', emoji: '🌑', durationTurns: 2, effectType: 'special', effectDescription: 'Grading scholars triple precision. Faceting halved.', description: 'The sun dims and gems reveal hidden colors only visible in eclipse light.' },
  { id: 'evt_fissure_quake', name: 'Spire Fissure', emoji: '💎', durationTurns: 3, effectType: 'debuff', effectDescription: 'Carving scholars lose 25% skill. Setting school unaffected.', description: 'A tremor opens a fissure in the Spire wall, revealing a hidden crystal cache.' },
  { id: 'evt_golden_hour', name: 'Golden Hour', emoji: '🌅', durationTurns: 5, effectType: 'buff', effectDescription: 'Gold rewards doubled. Setting scholars gain +30% skill.', description: 'The setting sun casts golden light through the Spire windows, illuminating every gem.' },
  { id: 'evt_gem_festival', name: 'Gemstone Festival', emoji: '🎉', durationTurns: 4, effectType: 'buff', effectDescription: 'All scholars gain +20% focus. Grading scholars enhanced.', description: 'The annual gem festival brings visiting masters who share their techniques.' },
  { id: 'evt_vault_breach', name: 'Vault Breach', emoji: '🏃', durationTurns: 2, effectType: 'debuff', effectDescription: 'Lose 10% gold. Artifact discovery chance increased.', description: 'A section of the vault collapses, revealing a hidden chamber of ancient artifacts.' },
  { id: 'evt_starlight_surge', name: 'Starlight Surge', emoji: '🌟', durationTurns: 3, effectType: 'buff', effectDescription: 'Enhancement school resurrects one failed cut. All polishing doubled.', description: 'A surge of concentrated starlight bathes the Spire apex, energizing all gems.' },
  { id: 'evt_drought', name: 'Gem Drought', emoji: '☀️', durationTurns: 5, effectType: 'debuff', effectDescription: 'Cutting skill halved. Enhancement school thrives.', description: 'A drought of gem material. Rough stones become scarce but enhancement flourishes.' },
  { id: 'evt_inscription_madness', name: 'Inscription Madness', emoji: '🔤', durationTurns: 3, effectType: 'special', effectDescription: 'Bonus renown for each class attended. Achievement rewards doubled.', description: 'Ancient gem inscriptions appear on the Spire walls, containing lost techniques.' },
  { id: 'evt_merchant_caravan', name: 'Merchant Caravan', emoji: '🐪', durationTurns: 6, effectType: 'buff', effectDescription: 'Enrollment chance doubled. New rare scholars appear.', description: 'A caravan of foreign gem merchants arrives, bringing rare scholars and exotic materials.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: INTERNAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const EM_MAX_SCHOLAR_LEVEL = 50
const EM_MAX_STRUCTURE_LEVEL = 10
const EM_INITIAL_GOLD = 200
const EM_INITIAL_RENOWN = 0

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: HELPER FUNCTIONS (hoisted with `function`)
// ═══════════════════════════════════════════════════════════════════

function emXpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.25, level - 1))
}

function emCalcStats(def: EmScholarDef, level: number) {
  const growth = 1 + (level - 1) * 0.12
  return {
    cuttingSkill: Math.floor(def.cuttingSkill * growth),
    clarity: Math.floor(def.clarity * growth),
    precision: Math.floor(def.precision * growth),
  }
}

let _emIdCounter = 0
function emGenerateId(): string {
  _emIdCounter += 1
  return `em_${_emIdCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`
}

function emFindScholarDef(id: string): EmScholarDef | undefined {
  return EM_SCHOLARS.find((s) => s.id === id)
}

function emFindClassroom(id: string): EmClassroomDef | undefined {
  return EM_CLASSROOMS.find((c) => c.id === id)
}

function emFindMaterial(id: string): EmMaterialDef | undefined {
  return EM_MATERIALS.find((m) => m.id === id)
}

function emFindStructureDef(id: string): EmStructureDef | undefined {
  return EM_STRUCTURES.find((s) => s.id === id)
}

function emFindAbility(id: string): EmAbilityDef | undefined {
  return EM_ABILITIES.find((a) => a.id === id)
}

function emFindArtifact(id: string): EmArtifactDef | undefined {
  return EM_RELICS.find((r) => r.id === id)
}

function emFindAchievement(id: string): EmAchievementDef | undefined {
  return EM_ACHIEVEMENTS.find((a) => a.id === id)
}

function emFindTitle(id: EmTitleId): EmTitleDef | undefined {
  return EM_TITLES.find((t) => t.id === id)
}

function emRarityMultiplier(rarity: EmRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 5
    case 'epic': return 10
    case 'legendary': return 25
    default: return 1
  }
}

function emRarityColor(rarity: EmRarity): string {
  switch (rarity) {
    case 'common': return EM_ROUGH_STONE
    case 'uncommon': return EM_GEM_TEAL
    case 'rare': return EM_CRYSTAL_CLEAR
    case 'epic': return EM_FIRE_RED
    case 'legendary': return EM_GOLD_SETTING
    default: return EM_ROUGH_STONE
  }
}

function emSchoolColor(school: EmGemSchool): string {
  switch (school) {
    case 'faceting': return EM_EMERALD_GREEN
    case 'cabochon': return EM_GEM_TEAL
    case 'carving': return EM_FIRE_RED
    case 'grading': return EM_CRYSTAL_CLEAR
    case 'setting': return EM_GOLD_SETTING
    case 'polishing': return EM_SPARKLE_WHITE
    case 'enhancement': return EM_DEEP_FOREST
    default: return '#888888'
  }
}

export function emCheckSynergy(schoolA: EmGemSchool, schoolB: EmGemSchool): number {
  const advantages = EM_SYNERGY_MAP[schoolA]
  if (advantages?.includes(schoolB)) return 1.4
  const disadvantages = EM_SYNERGY_MAP[schoolB]
  if (disadvantages?.includes(schoolA)) return 0.7
  return 1.0
}

function emCalcStructureUpgradeCost(def: EmStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

function emCalcMaxTitle(renown: number, scholarCount: number): EmTitleId {
  let bestId: EmTitleId = 'title_rough_cutter'
  for (const title of EM_TITLES) {
    if (renown >= title.minRenown && scholarCount >= title.minScholars) {
      bestId = title.id
    }
  }
  return bestId
}

function emCheckAchievementCondition(
  condition: string,
  state: EmStoreState
): boolean {
  switch (condition) {
    case 'enroll_1':
      return state.totalEnrolled >= 1
    case 'enroll_5':
      return state.totalEnrolled >= 5
    case 'cut_1':
      return state.totalGemsCut >= 1
    case 'cut_10':
      return state.totalGemsCut >= 10
    case 'build_1':
      return state.totalBuilt >= 1
    case 'build_5':
      return state.totalBuilt >= 5
    case 'classroom_4':
      return state.classrooms.length >= 4
    case 'classroom_8':
      return state.classrooms.length >= 8
    case 'rare_enroll':
      return state.scholars.some((s) => {
        const def = emFindScholarDef(s.scholarDefId)
        return def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')
      })
    case 'epic_enroll':
      return state.scholars.some((s) => {
        const def = emFindScholarDef(s.scholarDefId)
        return def && (def.rarity === 'epic' || def.rarity === 'legendary')
      })
    case 'legendary_enroll':
      return state.scholars.some((s) => {
        const def = emFindScholarDef(s.scholarDefId)
        return def && def.rarity === 'legendary'
      })
    case 'artifact_1':
      return state.artifacts.length >= 1
    case 'artifact_5':
      return state.artifacts.length >= 5
    case 'event_1':
      return state.totalEventsFaced >= 1
    case 'event_10':
      return state.totalEventsFaced >= 10
    case 'upgrade_10':
      return state.structures.some((s) => s.level >= 10)
    case 'all_schools': {
      const schools = new Set<EmGemSchool>()
      for (const s of state.scholars) {
        const def = emFindScholarDef(s.scholarDefId)
        if (def) schools.add(def.school)
      }
      return schools.size >= 7
    }
    case 'max_title':
      return state.currentTitle === 'title_emerald_deity'
    default:
      return false
  }
}

function emPickRandomEvent(): EmEventDef {
  const idx = Math.floor(Math.random() * EM_EVENTS.length)
  return EM_EVENTS[idx]
}

function emCalcTotalInventoryValue(materials: { materialId: string; count: number }[]): number {
  let total = 0
  for (const m of materials) {
    const def = emFindMaterial(m.materialId)
    if (def) total += def.value * m.count
  }
  return total
}

function emCountStructuresByCategory(
  structures: EmStructureInstance[],
  category: EmStructureDef['category']
): number {
  let count = 0
  for (const s of structures) {
    const def = emFindStructureDef(s.structureDefId)
    if (def && def.category === category) count++
  }
  return count
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: ZUSTAND STORE WITH PERSIST
//
// Storage key: emerald-spire-wire
// Store variable: useEMStore (internal)
// Hook variable: useEmeraldSpire (exported default)
// API variable: emAPI (returned from hook)
// ═══════════════════════════════════════════════════════════════════

const useEMStore = create<EmFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      scholars: [] as EmScholarInstance[],
      classrooms: [] as string[],
      materials: [] as { materialId: string; count: number }[],
      structures: [] as EmStructureInstance[],
      abilities: [] as string[],
      achievements: [] as string[],
      artifacts: [] as string[],
      currentTitle: 'title_rough_cutter' as EmTitleId,
      gold: EM_INITIAL_GOLD,
      renown: EM_INITIAL_RENOWN,
      totalEnrolled: 0,
      totalGemsCut: 0,
      totalBuilt: 0,
      totalEventsFaced: 0,
      activeEvent: null as EmEventDef | null,
      eventTurnsRemaining: 0,
      activeClassroom: null as string | null,

      // ── emEnrollScholar ────────────────────────────────────────
      emEnrollScholar: (scholarDefId: string): boolean => {
        const def = emFindScholarDef(scholarDefId)
        if (!def) return false
        const cost = Math.floor(50 * emRarityMultiplier(def.rarity))
        const state = get()
        if (state.gold < cost) return false
        const stats = emCalcStats(def, 1)
        const newScholar: EmScholarInstance = {
          id: emGenerateId(),
          scholarDefId,
          name: def.name,
          level: 1,
          xp: 0,
          cuttingSkill: stats.cuttingSkill,
          clarity: stats.clarity,
          precision: stats.precision,
          focus: 80,
          stamina: 70,
          enrolledAt: Date.now(),
        }
        set((prev) => {
          const updated = {
            scholars: [...prev.scholars, newScholar],
            gold: prev.gold - cost,
            totalEnrolled: prev.totalEnrolled + 1,
            renown: prev.renown + emRarityMultiplier(def.rarity) * 5,
            currentTitle: emCalcMaxTitle(
              prev.renown + emRarityMultiplier(def.rarity) * 5,
              prev.scholars.length + 1
            ),
          }
          return updated
        })
        return true
      },

      // ── emExpelScholar ─────────────────────────────────────────
      emExpelScholar: (scholarId: string): boolean => {
        const state = get()
        const exists = state.scholars.find((s) => s.id === scholarId)
        if (!exists) return false
        const def = emFindScholarDef(exists.scholarDefId)
        const refund = def ? Math.floor(25 * emRarityMultiplier(def.rarity)) : 10
        set((prev) => ({
          scholars: prev.scholars.filter((s) => s.id !== scholarId),
          gold: prev.gold + refund,
          currentTitle: emCalcMaxTitle(prev.renown, prev.scholars.length - 1),
        }))
        return true
      },

      // ── emTrainScholar ─────────────────────────────────────────
      emTrainScholar: (scholarId: string): boolean => {
        const trainCost = 10
        const state = get()
        if (state.gold < trainCost) return false
        set((prev) => {
          const scholars = prev.scholars.map((s) => {
            if (s.id !== scholarId) return s
            const newXp = s.xp + 20
            const xpNeeded = emXpForLevel(s.level)
            let newLevel = s.level
            let currentXp = newXp
            if (currentXp >= xpNeeded && s.level < EM_MAX_SCHOLAR_LEVEL) {
              newLevel = s.level + 1
              currentXp = newXp - xpNeeded
            }
            const def = emFindScholarDef(s.scholarDefId)
            const stats = def ? emCalcStats(def, newLevel) : { cuttingSkill: s.cuttingSkill, clarity: s.clarity, precision: s.precision }
            return {
              ...s,
              level: newLevel,
              xp: currentXp,
              cuttingSkill: stats.cuttingSkill,
              clarity: stats.clarity,
              precision: stats.precision,
              focus: Math.min(100, s.focus + 10),
              stamina: Math.min(100, s.stamina + 20),
            }
          })
          return { scholars, gold: prev.gold - trainCost, renown: prev.renown + 2 }
        })
        return true
      },

      // ── emCutGem ──────────────────────────────────────────────
      emCutGem: (scholarId: string): boolean => {
        const state = get()
        const scholar = state.scholars.find((s) => s.id === scholarId)
        if (!scholar) return false
        if (scholar.stamina < 20) return false
        const def = emFindScholarDef(scholar.scholarDefId)
        if (!def) return false
        const materialId = `mat_${def.school}_${def.rarity}_gem`
        const existingMaterial = state.materials.find((m) => m.materialId === materialId)
        const amount = Math.ceil(scholar.cuttingSkill / 10)
        set((prev) => ({
          materials: existingMaterial
            ? prev.materials.map((m) => (m.materialId === materialId ? { ...m, count: m.count + amount } : m))
            : [...prev.materials, { materialId, count: amount }],
          totalGemsCut: prev.totalGemsCut + 1,
          renown: prev.renown + 3,
          scholars: prev.scholars.map((s) =>
            s.id === scholarId ? { ...s, stamina: Math.max(0, s.stamina - 20) } : s
          ),
        }))
        return true
      },

      // ── emBuildStructure ──────────────────────────────────────
      emBuildStructure: (structureDefId: string): boolean => {
        const def = emFindStructureDef(structureDefId)
        if (!def) return false
        const state = get()
        if (state.gold < def.baseCost) return false
        const alreadyBuilt = state.structures.find((s) => s.structureDefId === structureDefId)
        if (alreadyBuilt) return false
        const newStructure: EmStructureInstance = {
          id: emGenerateId(),
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

      // ── emUpgradeStructure ────────────────────────────────────
      emUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structure = state.structures.find((s) => s.id === structureId)
        if (!structure) return false
        if (structure.level >= EM_MAX_STRUCTURE_LEVEL) return false
        const def = emFindStructureDef(structure.structureDefId)
        if (!def) return false
        const cost = emCalcStructureUpgradeCost(def, structure.level)
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

      // ── emAttendClass ─────────────────────────────────────────
      emAttendClass: (classroomId: string): EmEventDef | null => {
        const classroom = emFindClassroom(classroomId)
        if (!classroom) return null
        const state = get()
        const requiredTitleIdx = EM_TITLES.findIndex((t) => t.id === classroom.requiredTitle)
        const currentTitleIdx = EM_TITLES.findIndex((t) => t.id === state.currentTitle)
        if (currentTitleIdx < requiredTitleIdx) return null
        const newClassrooms = state.classrooms.includes(classroomId) ? state.classrooms : [...state.classrooms, classroomId]
        const event = emPickRandomEvent()
        set((prev) => ({
          classrooms: newClassrooms,
          activeClassroom: classroomId,
          activeEvent: event,
          eventTurnsRemaining: event.durationTurns,
          totalEventsFaced: prev.totalEventsFaced + 1,
          renown: prev.renown + 5,
        }))
        return event
      },

      // ── emCollectRelic ────────────────────────────────────────
      emCollectRelic: (artifactId: string): boolean => {
        const artifact = emFindArtifact(artifactId)
        if (!artifact) return false
        const state = get()
        if (state.artifacts.includes(artifactId)) return false
        set((prev) => ({
          artifacts: [...prev.artifacts, artifactId],
          renown: prev.renown + Math.floor(emRarityMultiplier(artifact.rarity) * 20),
          currentTitle: emCalcMaxTitle(
            prev.renown + Math.floor(emRarityMultiplier(artifact.rarity) * 20),
            prev.scholars.length
          ),
        }))
        return true
      },

      // ── emUnlockAbility ───────────────────────────────────────
      emUnlockAbility: (abilityId: string): boolean => {
        const ability = emFindAbility(abilityId)
        if (!ability) return false
        const state = get()
        if (state.abilities.includes(abilityId)) return false
        const cost = Math.floor(100 * emRarityMultiplier(ability.rarity))
        if (state.gold < cost) return false
        set((prev) => ({
          abilities: [...prev.abilities, abilityId],
          gold: prev.gold - cost,
        }))
        return true
      },

      // ── emUnlockTitle ─────────────────────────────────────────
      emUnlockTitle: (titleId: EmTitleId): boolean => {
        const title = emFindTitle(titleId)
        if (!title) return false
        const state = get()
        if (state.renown < title.minRenown) return false
        if (state.scholars.length < title.minScholars) return false
        set((prev) => ({ currentTitle: titleId }))
        return true
      },

      // ── emClaimAchievement ────────────────────────────────────
      emClaimAchievement: (achievementId: string): boolean => {
        const achievement = emFindAchievement(achievementId)
        if (!achievement) return false
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!emCheckAchievementCondition(achievement.condition, state)) return false
        set((prev) => ({
          achievements: [...prev.achievements, achievementId],
          gold: prev.gold + achievement.reward.gold,
          renown: prev.renown + achievement.reward.renown,
          currentTitle: emCalcMaxTitle(
            prev.renown + achievement.reward.renown,
            prev.scholars.length
          ),
        }))
        return true
      },

      // ── emTradeMaterial ───────────────────────────────────────
      emTradeMaterial: (materialId: string, count: number): number => {
        const material = emFindMaterial(materialId)
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

      // ── emEndEvent ────────────────────────────────────────────
      emEndEvent: () => {
        set({ activeEvent: null, eventTurnsRemaining: 0 })
      },

      // ── emResetEvent ──────────────────────────────────────────
      emResetEvent: () => {
        const event = emPickRandomEvent()
        set({ activeEvent: event, eventTurnsRemaining: event.durationTurns })
      },
    }),
    {
      name: 'emerald-spire-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 18: MAIN HOOK — useEmeraldSpire()
// ═══════════════════════════════════════════════════════════════════

export default function useEmeraldSpire() {
  const store = useEMStore()

  // ── Computed: Enrolled scholars with def info ─────────────────
  const emEnrolledScholars = useMemo(() => {
    return store.scholars.map((s) => {
      const def = emFindScholarDef(s.scholarDefId)
      return {
        ...s,
        def,
        schoolColor: def ? emSchoolColor(def.school) : '#888888',
        rarityColor: def ? emRarityColor(def.rarity) : '#888888',
      }
    })
  }, [store])

  // ── Computed: Available scholars to enroll ─────────────────────
  const emAvailableScholars = useMemo(() => {
    return EM_SCHOLARS.filter((def) => {
      const cost = Math.floor(50 * emRarityMultiplier(def.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Current title details ───────────────────────────
  const emCurrentTitleDetail = useMemo(() => {
    return emFindTitle(store.currentTitle) ?? EM_TITLES[0]
  }, [store])

  // ── Computed: Next title info ─────────────────────────────────
  const emNextTitle = useMemo(() => {
    const currentIdx = EM_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= EM_TITLES.length - 1) return null
    return EM_TITLES[currentIdx + 1]
  }, [store])

  // ── Computed: Active classroom details ─────────────────────────
  const emActiveClassroomDetail = useMemo(() => {
    if (!store.activeClassroom) return null
    return emFindClassroom(store.activeClassroom) ?? null
  }, [store])

  // ── Computed: Unattended classrooms ────────────────────────────
  const emUnattendedClassrooms = useMemo(() => {
    return EM_CLASSROOMS.filter((c) => !store.classrooms.includes(c.id))
  }, [store])

  // ── Computed: Built structures with defs ───────────────────────
  const emBuiltStructures = useMemo(() => {
    return store.structures.map((s) => {
      const def = emFindStructureDef(s.structureDefId)
      return { ...s, def }
    })
  }, [store])

  // ── Computed: Unlockable abilities ────────────────────────────
  const emUnlockableAbilities = useMemo(() => {
    return EM_ABILITIES.filter((a) => {
      if (store.abilities.includes(a.id)) return false
      const cost = Math.floor(100 * emRarityMultiplier(a.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Owned artifacts with defs ────────────────────────
  const emOwnedArtifacts = useMemo(() => {
    return store.artifacts.map((rId) => {
      const def = emFindArtifact(rId)
      return def ?? null
    }).filter((r): r is EmArtifactDef => r !== null)
  }, [store])

  // ── Computed: Unclaimed achievements ──────────────────────────
  const emUnclaimedAchievements = useMemo(() => {
    return EM_ACHIEVEMENTS.filter((a) => {
      if (store.achievements.includes(a.id)) return false
      return emCheckAchievementCondition(a.condition, store)
    })
  }, [store])

  // ── Computed: Materials with defs ─────────────────────────────
  const emInventoryMaterials = useMemo(() => {
    return store.materials.map((m) => {
      const def = emFindMaterial(m.materialId)
      return { ...m, def }
    })
  }, [store])

  // ── Computed: Total structure effect bonus ────────────────────
  const emTotalStructureEffect = useMemo(() => {
    let totalEffect = 0
    for (const s of store.structures) {
      const def = emFindStructureDef(s.structureDefId)
      if (def) {
        totalEffect += def.baseEffect + def.effectPerLevel * (s.level - 1)
      }
    }
    return totalEffect
  }, [store])

  // ── Computed: Average scholar level ───────────────────────────
  const emAverageScholarLevel = useMemo(() => {
    if (store.scholars.length === 0) return 0
    const total = store.scholars.reduce((sum, s) => sum + s.level, 0)
    return Math.floor(total / store.scholars.length)
  }, [store])

  // ── Computed: Total scholar power ─────────────────────────────
  const emTotalScholarPower = useMemo(() => {
    return store.scholars.reduce(
      (sum, s) => sum + s.cuttingSkill + s.clarity + s.precision,
      0
    )
  }, [store])

  // ── Computed: School distribution ─────────────────────────────
  const emSchoolDistribution = useMemo(() => {
    const counts: Record<EmGemSchool, number> = {
      faceting: 0, cabochon: 0, carving: 0, grading: 0, setting: 0, polishing: 0, enhancement: 0,
    }
    for (const s of store.scholars) {
      const def = emFindScholarDef(s.scholarDefId)
      if (def) counts[def.school]++
    }
    return counts
  }, [store])

  // ── Computed: Rarity distribution ─────────────────────────────
  const emRarityDistribution = useMemo(() => {
    const counts: Record<EmRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
    }
    for (const s of store.scholars) {
      const def = emFindScholarDef(s.scholarDefId)
      if (def) counts[def.rarity]++
    }
    return counts
  }, [store])

  // ── Computed: Scholars by rarity ──────────────────────────────
  const emScholarsByRarity = useMemo(() => {
    const groups: Record<EmRarity, EmScholarInstance[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    }
    for (const s of store.scholars) {
      const def = emFindScholarDef(s.scholarDefId)
      if (def) groups[def.rarity].push(s)
    }
    return groups
  }, [store])

  // ── Computed: Scholars by school ───────────────────────────────
  const emScholarsBySchool = useMemo(() => {
    const groups: Record<EmGemSchool, EmScholarInstance[]> = {
      faceting: [], cabochon: [], carving: [], grading: [], setting: [], polishing: [], enhancement: [],
    }
    for (const s of store.scholars) {
      const def = emFindScholarDef(s.scholarDefId)
      if (def) groups[def.school].push(s)
    }
    return groups
  }, [store])

  // ── Computed: Progress to next title ──────────────────────────
  const emTitleProgress = useMemo(() => {
    const next = emNextTitle
    if (!next) return { percent: 100, renownNeeded: 0, scholarsNeeded: 0 }
    const renownProgress = Math.min(100, (store.renown / next.minRenown) * 100)
    const scholarProgress = Math.min(100, (store.scholars.length / next.minScholars) * 100)
    return {
      percent: Math.floor((renownProgress + scholarProgress) / 2),
      renownNeeded: Math.max(0, next.minRenown - store.renown),
      scholarsNeeded: Math.max(0, next.minScholars - store.scholars.length),
    }
  }, [store, emNextTitle])

  // ── Computed: Rare materials count ────────────────────────────
  const emRareMaterialCount = useMemo(() => {
    let count = 0
    for (const m of store.materials) {
      const def = emFindMaterial(m.materialId)
      if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
        count += m.count
      }
    }
    return count
  }, [store])

  // ── Computed: Exhausted scholars ───────────────────────────────
  const emExhaustedScholars = useMemo(() => {
    return store.scholars.filter((s) => s.stamina < 30)
  }, [store])

  // ── Computed: Unfocused scholars ───────────────────────────────
  const emUnfocusedScholars = useMemo(() => {
    return store.scholars.filter((s) => s.focus < 30)
  }, [store])

  // ── Computed: Total artifact boost ─────────────────────────────
  const emTotalArtifactBoost = useMemo(() => {
    let cuttingBoost = 0
    let clarityBoost = 0
    let precisionBoost = 0
    for (const aId of store.artifacts) {
      const artifact = emFindArtifact(aId)
      if (artifact) {
        cuttingBoost += artifact.cuttingBoost
        clarityBoost += artifact.clarityBoost
        precisionBoost += artifact.precisionBoost
      }
    }
    return { cuttingBoost, clarityBoost, precisionBoost }
  }, [store])

  // ═════════════════════════════════════════════════════════════
  // Return emAPI object
  // ═════════════════════════════════════════════════════════════

  const emAPI = {
    // ── Direct constants ──────────────────────────────────────
    EM_EMERALD_GREEN,
    EM_GEM_TEAL,
    EM_CRYSTAL_CLEAR,
    EM_GOLD_SETTING,
    EM_ROUGH_STONE,
    EM_FIRE_RED,
    EM_SPARKLE_WHITE,
    EM_DEEP_FOREST,
    EM_SCHOOLS,
    EM_RARITIES,
    EM_SCHOLARS,
    EM_CLASSROOMS,
    EM_MATERIALS,
    EM_STRUCTURES,
    EM_ABILITIES,
    EM_ACHIEVEMENTS,
    EM_TITLES,
    EM_RELICS,
    EM_EVENTS,
    emCheckSynergy,

    // ── Store state ───────────────────────────────────────────
    scholars: store.scholars,
    classrooms: store.classrooms,
    materials: store.materials,
    structures: store.structures,
    abilities: store.abilities,
    achievements: store.achievements,
    artifacts: store.artifacts,
    currentTitle: store.currentTitle,
    gold: store.gold,
    renown: store.renown,
    totalEnrolled: store.totalEnrolled,
    totalGemsCut: store.totalGemsCut,
    totalBuilt: store.totalBuilt,
    totalEventsFaced: store.totalEventsFaced,
    activeEvent: store.activeEvent,
    eventTurnsRemaining: store.eventTurnsRemaining,
    activeClassroom: store.activeClassroom,

    // ── Store actions ─────────────────────────────────────────
    emEnrollScholar: store.emEnrollScholar,
    emExpelScholar: store.emExpelScholar,
    emTrainScholar: store.emTrainScholar,
    emCutGem: store.emCutGem,
    emBuildStructure: store.emBuildStructure,
    emUpgradeStructure: store.emUpgradeStructure,
    emAttendClass: store.emAttendClass,
    emCollectRelic: store.emCollectRelic,
    emUnlockAbility: store.emUnlockAbility,
    emUnlockTitle: store.emUnlockTitle,
    emClaimAchievement: store.emClaimAchievement,
    emTradeMaterial: store.emTradeMaterial,
    emEndEvent: store.emEndEvent,
    emResetEvent: store.emResetEvent,

    // ── Computed getters ──────────────────────────────────────
    emEnrolledScholars,
    emAvailableScholars,
    emCurrentTitleDetail,
    emNextTitle,
    emActiveClassroomDetail,
    emUnattendedClassrooms,
    emBuiltStructures,
    emUnlockableAbilities,
    emOwnedArtifacts,
    emUnclaimedAchievements,
    emInventoryMaterials,
    emTotalStructureEffect,
    emAverageScholarLevel,
    emTotalScholarPower,
    emSchoolDistribution,
    emRarityDistribution,
    emScholarsByRarity,
    emScholarsBySchool,
    emTitleProgress,
    emRareMaterialCount,
    emExhaustedScholars,
    emUnfocusedScholars,
    emTotalArtifactBoost,
  }

  return emAPI
}
