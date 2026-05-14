/**
 * Halo Sanctum Wire — 光环圣殿 (Halo Sanctum) feature module
 *
 * A celestial angelic sanctuary mini-game: command 35 angelic beings
 * across 7 divine orders, maintain 8 sanctum chambers, collect 30
 * halo/feather materials, build 25 sanctum structures, unlock 22
 * divine abilities, discover 15 legendary celestial relics, face
 * 12 sanctum events, and ascend through 8 titles from Mortal Acolyte
 * to Celestial Deity — backed by a Zustand store with persist middleware.
 *
 * Storage key: halo-sanctum-wire
 * Prefix: hl / HL_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type HlDivineOrder =
  | 'seraphim'
  | 'cherubim'
  | 'thrones'
  | 'virtues'
  | 'powers'
  | 'principalities'
  | 'archangels'

export type HlRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type HlTitleId =
  | 'title_mortal_acolyte'
  | 'title_celestial_initiate'
  | 'title_winged_disciple'
  | 'title_radiant_guardian'
  | 'title_herald_of_light'
  | 'title_sanctum_keeper'
  | 'title_divine_seraph'
  | 'title_celestial_deity'

export interface HlDivineOrderDef {
  readonly id: HlDivineOrder
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface HlAngelSpecies {
  readonly id: string
  readonly name: string
  readonly order: HlDivineOrder
  readonly rarity: HlRarity
  readonly gracePower: number
  readonly wingPower: number
  readonly radiance: number
  readonly description: string
  readonly abilities: string[]
}

export interface HlAngelInstance {
  readonly id: string
  speciesId: string
  name: string
  level: number
  xp: number
  gracePower: number
  wingPower: number
  radiance: number
  devotion: number
  vitality: number
  summonedAt: number
}

export interface HlChamberDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly depth: number
  readonly gloryLevel: number
  readonly requiredTitle: HlTitleId
  readonly order: HlDivineOrder
  readonly bgGradient: string
  readonly ambientColor: string
}

export interface HlMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'halo' | 'feather' | 'crystal' | 'relic_shard' | 'essence'
  readonly rarity: HlRarity
  readonly graceBonus: number
  readonly wingBonus: number
  readonly value: number
  readonly description: string
}

export interface HlStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'choir_nest' | 'prayer_font' | 'grace_forge' | 'light_altar' | 'relic_shrine'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface HlStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  builtAt: number
}

export interface HlAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly order: HlDivineOrder
  readonly type: 'active' | 'passive'
  readonly rarity: HlRarity
  readonly faithCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface HlAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { gold: number; renown: number }
}

export interface HlTitleDef {
  readonly id: HlTitleId
  readonly name: string
  readonly emoji: string
  readonly minRenown: number
  readonly minAngels: number
  readonly description: string
}

export interface HlRelicDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: HlRarity
  readonly order: HlDivineOrder
  readonly graceBoost: number
  readonly wingBoost: number
  readonly radianceBoost: number
  readonly value: number
  readonly description: string
}

export interface HlEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface HlStoreState {
  angels: HlAngelInstance[]
  chambers: string[]
  materials: { materialId: string; count: number }[]
  structures: HlStructureInstance[]
  abilities: string[]
  achievements: string[]
  relics: string[]
  currentTitle: HlTitleId
  gold: number
  renown: number
  totalSummoned: number
  totalHarvested: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: HlEventDef | null
  eventTurnsRemaining: number
  activeChamber: string | null
}

export interface HlStoreActions {
  hlSummonAngel: (speciesId: string) => boolean
  hlReleaseAngel: (angelId: string) => boolean
  hlBlessAngel: (angelId: string) => boolean
  hlHarvestHalo: (angelId: string) => boolean
  hlBuildStructure: (structureDefId: string) => boolean
  hlUpgradeStructure: (structureId: string) => boolean
  hlPurifyChamber: (chamberId: string) => HlEventDef | null
  hlCollectRelic: (relicId: string) => boolean
  hlUnlockAbility: (abilityId: string) => boolean
  hlUnlockTitle: (titleId: HlTitleId) => boolean
  hlClaimAchievement: (achievementId: string) => boolean
  hlTradeMaterial: (materialId: string, count: number) => number
  hlEndEvent: () => void
  hlResetEvent: () => void
}

export interface HlFullStore extends HlStoreState, HlStoreActions {}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS (8 colors)
// ═══════════════════════════════════════════════════════════════════

export const HL_HALO_GOLD: string = '#FFD700'
export const HL_DIVINE_WHITE: string = '#FFFAF0'
export const HL_CELESTIAL_BLUE: string = '#4169E1'
export const HL_ANGELIC_SILVER: string = '#C0C0C0'
export const HL_SANCTUM_AMBER: string = '#FF8C00'
export const HL_HOLY_PURPLE: string = '#9370DB'
export const HL_GRACE_GREEN: string = '#98FB98'
export const HL_RADIANCE_ROSE: string = '#FFB6C1'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: DIVINE ORDER DEFINITIONS (7 orders)
// ═══════════════════════════════════════════════════════════════════

export const HL_ORDERS: readonly HlDivineOrderDef[] = [
  {
    id: 'seraphim',
    name: 'Seraphim',
    color: HL_HALO_GOLD,
    description:
      'The burning ones who stand closest to the divine throne. Seraphim radiate consuming fire and endless grace.',
  },
  {
    id: 'cherubim',
    name: 'Cherubim',
    color: HL_HOLY_PURPLE,
    description:
      'Guardians of sacred knowledge and celestial secrets. Cherubim possess four faces and spread their wings over the ark.',
  },
  {
    id: 'thrones',
    name: 'Thrones',
    color: HL_CELESTIAL_BLUE,
    description:
      'Wheels within wheels, carriers of divine justice. Thrones embody perfect order and impartial judgment.',
  },
  {
    id: 'virtues',
    name: 'Virtues',
    color: HL_GRACE_GREEN,
    description:
      'Controllers of the elements and nature. Virtues command stars, seasons, and the turning of the cosmos.',
  },
  {
    id: 'powers',
    name: 'Powers',
    color: HL_SANCTUM_AMBER,
    description:
      'Warrior angels who defend the sanctum against darkness. Powers are the celestial army\'s frontline commanders.',
  },
  {
    id: 'principalities',
    name: 'Principalities',
    color: HL_ANGELIC_SILVER,
    description:
      'Protectors of nations and guardians of realms. Principalities watch over mortal kingdoms from the heavens.',
  },
  {
    id: 'archangels',
    name: 'Archangels',
    color: HL_RADIANCE_ROSE,
    description:
      'The great messengers who deliver divine decrees. Archangels are the most visible and powerful of angelic beings.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: ORDER HARMONY TABLE
// ═══════════════════════════════════════════════════════════════════

const HL_HARMONY_MAP: Record<HlDivineOrder, HlDivineOrder[]> = {
  seraphim: ['cherubim', 'archangels'],
  cherubim: ['thrones', 'seraphim'],
  thrones: ['virtues', 'cherubim'],
  virtues: ['powers', 'thrones'],
  powers: ['principalities', 'virtues'],
  principalities: ['archangels', 'powers'],
  archangels: ['seraphim', 'principalities'],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: HL_ANGELS — 35 Angelic Beings (5 per order)
// ═══════════════════════════════════════════════════════════════════

export const HL_ANGELS: readonly HlAngelSpecies[] = [
  // ── Seraphim (5) ──────────────────────────────────────────────
  {
    id: 'seraph_ember_singer',
    name: 'Ember Singer',
    order: 'seraphim',
    rarity: 'common',
    gracePower: 12,
    wingPower: 8,
    radiance: 18,
    description:
      'A minor seraph whose three pairs of wings shimmer with gentle ember-light. It sings hymns at dawn.',
    abilities: ['holy_glow'],
  },
  {
    id: 'seraph_flame_keeper',
    name: 'Flame Keeper',
    order: 'seraphim',
    rarity: 'common',
    gracePower: 18,
    wingPower: 10,
    radiance: 22,
    description:
      'A diligent seraph tasked with tending the eternal flame of the sanctum altar.',
    abilities: ['holy_glow', 'sacred_flame'],
  },
  {
    id: 'seraph_blaze_herald',
    name: 'Blaze Herald',
    order: 'seraphim',
    rarity: 'uncommon',
    gracePower: 28,
    wingPower: 15,
    radiance: 30,
    description:
      'A seraph that announces divine decrees with columns of living fire. Its voice shakes mountains.',
    abilities: ['holy_glow', 'sacred_flame', 'blaze_trumpet'],
  },
  {
    id: 'seraph_solar_wing',
    name: 'Solar Wing',
    order: 'seraphim',
    rarity: 'rare',
    gracePower: 50,
    wingPower: 35,
    radiance: 42,
    description:
      'A radiant seraph whose wings span the horizon. It channels pure solar grace to purify corruption.',
    abilities: ['holy_glow', 'sacred_flame', 'blaze_trumpet', 'solar_blessing'],
  },
  {
    id: 'seraph_metatron_burn',
    name: 'Metatron\'s Burn',
    order: 'seraphim',
    rarity: 'legendary',
    gracePower: 120,
    wingPower: 80,
    radiance: 95,
    description:
      'The mightiest seraph, bearing the name of the heavenly scribe. Its six wings burn with the fire of creation itself.',
    abilities: ['holy_glow', 'sacred_flame', 'blaze_trumpet', 'solar_blessing', 'creation_fire'],
  },

  // ── Cherubim (5) ──────────────────────────────────────────────
  {
    id: 'cherub_scroll_bearer',
    name: 'Scroll Bearer',
    order: 'cherubim',
    rarity: 'common',
    gracePower: 10,
    wingPower: 14,
    radiance: 15,
    description:
      'A young cherub that carries scrolls of ancient hymns. It guards the entrance to the lower sanctum.',
    abilities: ['ward_shield'],
  },
  {
    id: 'cherub_tome_guardian',
    name: 'Tome Guardian',
    order: 'cherubim',
    rarity: 'common',
    gracePower: 15,
    wingPower: 18,
    radiance: 20,
    description:
      'A cherub entrusted with a celestial tome. It can read the hidden names of creation.',
    abilities: ['ward_shield', 'knowledge_ray'],
  },
  {
    id: 'cherub_wisdom_eye',
    name: 'Wisdom Eye',
    order: 'cherubim',
    rarity: 'uncommon',
    gracePower: 25,
    wingPower: 28,
    radiance: 26,
    description:
      'A four-faced cherub whose gaze reveals hidden truths. Its ox face sees the past, eagle face the future.',
    abilities: ['ward_shield', 'knowledge_ray', 'true_sight'],
  },
  {
    id: 'cherub_uriel_light',
    name: 'Uriel\'s Light',
    order: 'cherubim',
    rarity: 'rare',
    gracePower: 45,
    wingPower: 50,
    radiance: 38,
    description:
      'A cherub blessed by Uriel, illuminator of secrets. Its light can dispel any shadow or illusion.',
    abilities: ['ward_shield', 'knowledge_ray', 'true_sight', 'illuminate'],
  },
  {
    id: 'cherub_ophanim_wheel',
    name: 'Ophanim Wheel',
    order: 'cherubim',
    rarity: 'legendary',
    gracePower: 100,
    wingPower: 90,
    radiance: 85,
    description:
      'A transcendent cherub merged with an ophanim wheel. It sees all directions simultaneously and guards the tree of life.',
    abilities: ['ward_shield', 'knowledge_ray', 'true_sight', 'illuminate', 'omniscience'],
  },

  // ── Thrones (5) ───────────────────────────────────────────────
  {
    id: 'throne_justice_scales',
    name: 'Scale Bearer',
    order: 'thrones',
    rarity: 'common',
    gracePower: 14,
    wingPower: 6,
    radiance: 20,
    description:
      'A lesser throne that holds the scales of minor judgments. It weighs the deeds of mortals impartially.',
    abilities: ['divine_judgment'],
  },
  {
    id: 'throne_balance_keeper',
    name: 'Balance Keeper',
    order: 'thrones',
    rarity: 'common',
    gracePower: 20,
    wingPower: 10,
    radiance: 24,
    description:
      'A throne angel that maintains cosmic balance between light and dark in the sanctum.',
    abilities: ['divine_judgment', 'equilibrium'],
  },
  {
    id: 'throne_verdict_voice',
    name: 'Verdict Voice',
    order: 'thrones',
    rarity: 'uncommon',
    gracePower: 32,
    wingPower: 16,
    radiance: 35,
    description:
      'A throne whose voice is the final verdict. When it speaks, even archangels fall silent.',
    abilities: ['divine_judgment', 'equilibrium', 'final_word'],
  },
  {
    id: 'throne_righteous_axle',
    name: 'Righteous Axle',
    order: 'thrones',
    rarity: 'rare',
    gracePower: 55,
    wingPower: 30,
    radiance: 48,
    description:
      'A great throne spinning on a wheel of righteous fire. It dispenses divine law without mercy or malice.',
    abilities: ['divine_judgment', 'equilibrium', 'final_word', 'wheel_of_law'],
  },
  {
    id: 'throne_sovereign_seat',
    name: 'Sovereign Seat',
    order: 'thrones',
    rarity: 'legendary',
    gracePower: 110,
    wingPower: 60,
    radiance: 100,
    description:
      'The highest throne angel, seat of divine authority. It is said the cosmos turns on its axle.',
    abilities: ['divine_judgment', 'equilibrium', 'final_word', 'wheel_of_law', 'absolute_decree'],
  },

  // ── Virtues (5) ───────────────────────────────────────────────
  {
    id: 'virtue_dew_bringer',
    name: 'Dew Bringer',
    order: 'virtues',
    rarity: 'common',
    gracePower: 8,
    wingPower: 12,
    radiance: 16,
    description:
      'A minor virtue that brings morning dew to sanctum gardens. Its touch makes flowers bloom instantly.',
    abilities: ['nature_blessing'],
  },
  {
    id: 'virtue_wind_whisper',
    name: 'Wind Whisper',
    order: 'virtues',
    rarity: 'common',
    gracePower: 12,
    wingPower: 20,
    radiance: 18,
    description:
      'A virtue that rides the four winds. It can call breezes or gales with a gentle gesture.',
    abilities: ['nature_blessing', 'wind_call'],
  },
  {
    id: 'virtue_star_weaver',
    name: 'Star Weaver',
    order: 'virtues',
    rarity: 'uncommon',
    gracePower: 22,
    wingPower: 18,
    radiance: 35,
    description:
      'A virtue that weaves starlight into protective barriers. Its creations shimmer like the night sky.',
    abilities: ['nature_blessing', 'wind_call', 'starlight_veil'],
  },
  {
    id: 'virtue_season_turner',
    name: 'Season Turner',
    order: 'virtues',
    rarity: 'rare',
    gracePower: 40,
    wingPower: 35,
    radiance: 50,
    description:
      'A great virtue that turns the seasons within the sanctum. It can freeze time or accelerate growth.',
    abilities: ['nature_blessing', 'wind_call', 'starlight_veil', 'time_bloom'],
  },
  {
    id: 'virtue_genesis_spirit',
    name: 'Genesis Spirit',
    order: 'virtues',
    rarity: 'legendary',
    gracePower: 95,
    wingPower: 70,
    radiance: 110,
    description:
      'The virtue present at creation, commanded to tend the garden of Eden. Its grace brings life from nothingness.',
    abilities: ['nature_blessing', 'wind_call', 'starlight_veil', 'time_bloom', 'genesis_breath'],
  },

  // ── Powers (5) ────────────────────────────────────────────────
  {
    id: 'power_blade_squire',
    name: 'Blade Squire',
    order: 'powers',
    rarity: 'common',
    gracePower: 16,
    wingPower: 15,
    radiance: 12,
    description:
      'A young power angel trained in celestial swordsmanship. Eager but needs guidance.',
    abilities: ['holy_strike'],
  },
  {
    id: 'power_shield_warden',
    name: 'Shield Warden',
    order: 'powers',
    rarity: 'common',
    gracePower: 14,
    wingPower: 22,
    radiance: 16,
    description:
      'A power angel that carries a shield of living light. It stands guard at the sanctum gates.',
    abilities: ['holy_strike', 'light_shield'],
  },
  {
    id: 'power_spear_vanguard',
    name: 'Spear Vanguard',
    order: 'powers',
    rarity: 'uncommon',
    gracePower: 30,
    wingPower: 28,
    radiance: 20,
    description:
      'A veteran power that leads the vanguard against demonic incursions. Its spear never misses.',
    abilities: ['holy_strike', 'light_shield', 'piercing_light'],
  },
  {
    id: 'power_banner_commander',
    name: 'Banner Commander',
    order: 'powers',
    rarity: 'rare',
    gracePower: 48,
    wingPower: 55,
    radiance: 35,
    description:
      'A senior power that commands entire angelic legions. Its banner of gold rallies all heavenly hosts.',
    abilities: ['holy_strike', 'light_shield', 'piercing_light', 'rally_host'],
  },
  {
    id: 'power_archon_judicator',
    name: 'Archon Judicator',
    order: 'powers',
    rarity: 'legendary',
    gracePower: 105,
    wingPower: 115,
    radiance: 70,
    description:
      'The supreme power angel, the Archon of celestial warfare. It has never fallen in battle across eternity.',
    abilities: ['holy_strike', 'light_shield', 'piercing_light', 'rally_host', 'heavenly_fury'],
  },

  // ── Principalities (5) ────────────────────────────────────────
  {
    id: 'prince_gate_sentinel',
    name: 'Gate Sentinel',
    order: 'principalities',
    rarity: 'common',
    gracePower: 10,
    wingPower: 10,
    radiance: 22,
    description:
      'A principality assigned to guard a minor sanctum gate. Patient and ever-watchful.',
    abilities: ['realm_watch'],
  },
  {
    id: 'prince_realm_protector',
    name: 'Realm Protector',
    order: 'principalities',
    rarity: 'common',
    gracePower: 16,
    wingPower: 14,
    radiance: 28,
    description:
      'A principality that watches over a mortal kingdom from the celestial heights above.',
    abilities: ['realm_watch', 'kingdom_ward'],
  },
  {
    id: 'prince_crown_shepherd',
    name: 'Crown Shepherd',
    order: 'principalities',
    rarity: 'uncommon',
    gracePower: 24,
    wingPower: 22,
    radiance: 36,
    description:
      'A principality that guides mortal rulers with divine wisdom. It appears only to the worthy.',
    abilities: ['realm_watch', 'kingdom_ward', 'crown_guidance'],
  },
  {
    id: 'prince_emerald_sovereign',
    name: 'Emerald Sovereign',
    order: 'principalities',
    rarity: 'rare',
    gracePower: 42,
    wingPower: 40,
    radiance: 52,
    description:
      'A great principality that rules a continent-sized celestial domain. Its emerald throne shines forever.',
    abilities: ['realm_watch', 'kingdom_ward', 'crown_guidance', 'emerald_light'],
  },
  {
    id: 'prince_empyrean_lord',
    name: 'Empyrean Lord',
    order: 'principalities',
    rarity: 'legendary',
    gracePower: 90,
    wingPower: 85,
    radiance: 120,
    description:
      'The highest principality, ruler of the Empyrean realm. Its radiance can be seen from any point in creation.',
    abilities: ['realm_watch', 'kingdom_ward', 'crown_guidance', 'emerald_light', 'empyrean_shroud'],
  },

  // ── Archangels (5) ────────────────────────────────────────────
  {
    id: 'arch_messenger_dove',
    name: 'Messenger Dove',
    order: 'archangels',
    rarity: 'common',
    gracePower: 12,
    wingPower: 16,
    radiance: 20,
    description:
      'A junior archangel in dove form that delivers minor decrees to the sanctum faithful.',
    abilities: ['divine_message'],
  },
  {
    id: 'arch_trumpet_caller',
    name: 'Trumpet Caller',
    order: 'archangels',
    rarity: 'common',
    gracePower: 18,
    wingPower: 22,
    radiance: 25,
    description:
      'An archangel whose trumpet blast signals the opening of sanctum ceremonies and awakening.',
    abilities: ['divine_message', 'trumpet_blast'],
  },
  {
    id: 'arch_healing_rose',
    name: 'Healing Rose',
    order: 'archangels',
    rarity: 'uncommon',
    gracePower: 26,
    wingPower: 20,
    radiance: 34,
    description:
      'An archangel that manifests as a rose of perfect light. Its petals cure any ailment they touch.',
    abilities: ['divine_message', 'trumpet_blast', 'rose_healing'],
  },
  {
    id: 'arch_raphael_hand',
    name: "Raphael's Hand",
    order: 'archangels',
    rarity: 'rare',
    gracePower: 44,
    wingPower: 38,
    radiance: 55,
    description:
      'An archangel channeling the power of Raphael, the great healer. It can restore angels and mortals alike.',
    abilities: ['divine_message', 'trumpet_blast', 'rose_healing', 'divine_medicine'],
  },
  {
    id: 'arch_michael_sword',
    name: "Michael's Sword",
    order: 'archangels',
    rarity: 'legendary',
    gracePower: 115,
    wingPower: 95,
    radiance: 90,
    description:
      'The archangel bearing the sword of Michael himself. Its mere presence causes demons to flee the sanctum.',
    abilities: ['divine_message', 'trumpet_blast', 'rose_healing', 'divine_medicine', 'archangel_wrath'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: HL_CHAMBERS — 8 Sanctum Chambers
// ═══════════════════════════════════════════════════════════════════

export const HL_CHAMBERS: readonly HlChamberDef[] = [
  {
    id: 'outer_courtyard',
    name: 'Outer Courtyard',
    description:
      'The sunlit entrance to the sanctum where fledgling angels first gather. Morning dew covers marble columns.',
    depth: 0,
    gloryLevel: 1,
    requiredTitle: 'title_mortal_acolyte',
    order: 'virtues',
    bgGradient: 'linear-gradient(180deg, #FFD700 0%, #98FB98 50%, #FFFAF0 100%)',
    ambientColor: HL_GRACE_GREEN,
  },
  {
    id: 'prayer_halls',
    name: 'Hall of Prayers',
    description:
      'Vast halls echoing with eternal hymns. Angelic choirs fill the air with harmonies that soothe the soul.',
    depth: 1,
    gloryLevel: 2,
    requiredTitle: 'title_mortal_acolyte',
    order: 'seraphim',
    bgGradient: 'linear-gradient(180deg, #FFFAF0 0%, #FFD700 50%, #C0C0C0 100%)',
    ambientColor: HL_DIVINE_WHITE,
  },
  {
    id: 'crystal_gardens',
    name: 'Crystal Gardens',
    description:
      'Gardens where crystal flowers bloom with inner light. Virtue angels tend the eternal blossoms here.',
    depth: 2,
    gloryLevel: 3,
    requiredTitle: 'title_celestial_initiate',
    order: 'virtues',
    bgGradient: 'linear-gradient(180deg, #98FB98 0%, #C0C0C0 50%, #9370DB 100%)',
    ambientColor: HL_ANGELIC_SILVER,
  },
  {
    id: 'archive_wings',
    name: 'Archive of Wings',
    description:
      'A vast library where every angelic feather is recorded. Cherubim guard the forbidden tomes within.',
    depth: 3,
    gloryLevel: 4,
    requiredTitle: 'title_winged_disciple',
    order: 'cherubim',
    bgGradient: 'linear-gradient(180deg, #9370DB 0%, #FFFAF0 50%, #4169E1 100%)',
    ambientColor: HL_HOLY_PURPLE,
  },
  {
    id: 'forge_of_grace',
    name: 'Forge of Grace',
    description:
      'A celestial forge where raw faith is hammered into divine weapons and tools. Power angels work the bellows.',
    depth: 4,
    gloryLevel: 5,
    requiredTitle: 'title_radiant_guardian',
    order: 'powers',
    bgGradient: 'linear-gradient(180deg, #FF8C00 0%, #FFD700 50%, #FFB6C1 100%)',
    ambientColor: HL_SANCTUM_AMBER,
  },
  {
    id: 'throne_antechamber',
    name: 'Throne Antechamber',
    description:
      'The solemn chamber before the divine throne. Perfect justice hangs in the still air. Only the worthy may enter.',
    depth: 5,
    gloryLevel: 6,
    requiredTitle: 'title_herald_of_light',
    order: 'thrones',
    bgGradient: 'linear-gradient(180deg, #4169E1 0%, #C0C0C0 50%, #FFD700 100%)',
    ambientColor: HL_CELESTIAL_BLUE,
  },
  {
    id: 'seraph_song',
    name: 'Seraph Song Chamber',
    description:
      'A chamber of pure sound where seraphim sing the creation hymn. The walls vibrate with holy resonance.',
    depth: 6,
    gloryLevel: 7,
    requiredTitle: 'title_sanctum_keeper',
    order: 'seraphim',
    bgGradient: 'linear-gradient(180deg, #FFB6C1 0%, #FFD700 50%, #9370DB 100%)',
    ambientColor: HL_RADIANCE_ROSE,
  },
  {
    id: 'empyrean_core',
    name: 'Empyrean Core',
    description:
      'The heart of the sanctum where all divine orders converge. Pure radiance flows from this sacred center.',
    depth: 7,
    gloryLevel: 8,
    requiredTitle: 'title_divine_seraph',
    order: 'archangels',
    bgGradient: 'linear-gradient(180deg, #FFD700 0%, #FFFAF0 50%, #FFB6C1 100%)',
    ambientColor: HL_HALO_GOLD,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: HL_MATERIALS — 30 Halo/Feather Materials
// ═══════════════════════════════════════════════════════════════════

export const HL_MATERIALS: readonly HlMaterialDef[] = [
  // Common (8)
  { id: 'mat_fledgling_feather', name: 'Fledgling Feather', emoji: '🪶', type: 'feather', rarity: 'common', graceBonus: 2, wingBonus: 1, value: 10, description: 'A soft white feather from a newly summoned angel. Still carries the scent of heaven.' },
  { id: 'mat_dewdrop_halo', name: 'Dewdrop Halo', emoji: '💧', type: 'halo', rarity: 'common', graceBonus: 3, wingBonus: 0, value: 12, description: 'A small halo ring formed from condensed morning dew. Faintly luminous.' },
  { id: 'mat_choir_crystal', name: 'Choir Crystal', emoji: '💎', type: 'crystal', rarity: 'common', graceBonus: 1, wingBonus: 3, value: 14, description: 'A tiny crystal that resonates with angelic hymns. It hums softly in the dark.' },
  { id: 'mat_garden_petal', name: 'Sanctum Petal', emoji: '🌸', type: 'feather', rarity: 'common', graceBonus: 2, wingBonus: 2, value: 8, description: 'A luminous petal from a sanctum garden flower. It never wilts.' },
  { id: 'mat_gate_shard', name: 'Gate Shard', emoji: '✨', type: 'crystal', rarity: 'common', graceBonus: 4, wingBonus: 0, value: 16, description: 'A fragment from the outer sanctum gate. It pulses with protective energy.' },
  { id: 'mat_courtyard_dust', name: 'Courtyard Stardust', emoji: '⭐', type: 'relic_shard', rarity: 'common', graceBonus: 3, wingBonus: 2, value: 11, description: 'Iridescent dust gathered from the outer courtyard at dawn. Used in basic blessings.' },
  { id: 'mat_prayer_candle', name: 'Prayer Candle Wax', emoji: '🕯️', type: 'essence', rarity: 'common', graceBonus: 1, wingBonus: 1, value: 9, description: 'Blessed wax from the hall of prayers. It burns with a pale golden flame.' },
  { id: 'mat_marble_chip', name: 'Sanctum Marble Chip', emoji: '🤍', type: 'crystal', rarity: 'common', graceBonus: 2, wingBonus: 3, value: 10, description: 'A chip of divine marble from the sanctum walls. Surprisingly warm to the touch.' },

  // Uncommon (6)
  { id: 'mat_wisdom_quill', name: 'Wisdom Quill', emoji: '🪶', type: 'feather', rarity: 'uncommon', graceBonus: 8, wingBonus: 5, value: 75, description: 'A quill from a cherub scribe. Words written with it carry a trace of divine knowledge.' },
  { id: 'mat_halo_ring', name: 'Halo Ring Fragment', emoji: '💫', type: 'halo', rarity: 'uncommon', graceBonus: 12, wingBonus: 0, value: 85, description: 'A broken segment of an angelic halo. It still emits warmth and light.' },
  { id: 'mat_season_gem', name: 'Season Gem', emoji: '🔶', type: 'crystal', rarity: 'uncommon', graceBonus: 5, wingBonus: 10, value: 80, description: 'A gem that cycles through the four seasons. Harvested by virtue angels.' },
  { id: 'mat_blade_shard', name: 'Celestial Blade Shard', emoji: '🗡️', type: 'crystal', rarity: 'uncommon', graceBonus: 10, wingBonus: 8, value: 90, description: 'A shard from a power angel\'s blade. It hums with battle-ready energy.' },
  { id: 'mat_banner_thread', name: 'Banner Gold Thread', emoji: '🧵', type: 'feather', rarity: 'uncommon', graceBonus: 6, wingBonus: 12, value: 72, description: 'A golden thread from a principality\'s banner. It cannot be cut by mortal means.' },
  { id: 'mat_trumpet_shard', name: 'Trumpet Brass Shard', emoji: '📯', type: 'relic_shard', rarity: 'uncommon', graceBonus: 7, wingBonus: 7, value: 82, description: 'A fragment of an archangel\'s trumpet. It echoes faintly with the last note played.' },

  // Rare (6)
  { id: 'mat_seraph_fire', name: 'Seraph Holy Fire', emoji: '🔥', type: 'essence', rarity: 'rare', graceBonus: 25, wingBonus: 10, value: 350, description: 'Contained seraphic fire in a crystal vial. It burns without consuming anything.' },
  { id: 'mat_cherub_ink', name: 'Cherub Sacred Ink', emoji: '📜', type: 'essence', rarity: 'rare', graceBonus: 10, wingBonus: 20, value: 320, description: 'Ink made from cherub tears. Writings in this ink become self-fulfilling prophecies.' },
  { id: 'mat_throne_axle', name: 'Throne Wheel Axle', emoji: '⚙️', type: 'crystal', rarity: 'rare', graceBonus: 20, wingBonus: 15, value: 380, description: 'A metal axle from a throne\'s ophanim wheel. It spins perpetually on its own.' },
  { id: 'mat_virtue_nectar', name: 'Virtue Life Nectar', emoji: '🍯', type: 'essence', rarity: 'rare', graceBonus: 15, wingBonus: 15, value: 340, description: 'Nectar collected from virtue-tended flowers. A single drop can revive a withered tree.' },
  { id: 'mat_power_crest', name: 'Power Angel Crest', emoji: '🛡️', type: 'relic_shard', rarity: 'rare', graceBonus: 18, wingBonus: 22, value: 400, description: 'A crest emblem from a power commander. It radiates an aura of invincibility.' },
  { id: 'mat_prince_emerald', name: 'Principality Emerald', emoji: '💚', type: 'crystal', rarity: 'rare', graceBonus: 12, wingBonus: 25, value: 360, description: 'An emerald from a principality\'s throne. It allows glimpses into hidden realms.' },

  // Epic (5)
  { id: 'mat_metatron_pen', name: 'Metatron\'s Pen', emoji: '🖊️', type: 'relic_shard', rarity: 'epic', graceBonus: 40, wingBonus: 30, value: 1500, description: 'A pen said to have been used by Metatron to write the Book of Life itself.' },
  { id: 'mat_uriel_lantern', name: 'Uriel\'s Lantern', emoji: '🏮', type: 'essence', rarity: 'epic', graceBonus: 35, wingBonus: 35, value: 1600, description: 'A lantern fueled by Uriel\'s personal light. It reveals the true nature of all things.' },
  { id: 'mat_throne_crown', name: 'Throne Crown Shard', emoji: '👑', type: 'relic_shard', rarity: 'epic', graceBonus: 30, wingBonus: 40, value: 1400, description: 'A fragment of the crown worn by the highest throne. It commands instant obedience.' },
  { id: 'mat_genesis_seed', name: 'Genesis Seed', emoji: '🌱', type: 'essence', rarity: 'epic', graceBonus: 45, wingBonus: 25, value: 1700, description: 'A seed from the original Garden of Eden. Planted anywhere, it creates a paradise.' },
  { id: 'mat_michael_wing', name: "Michael's Wing Tip", emoji: '🪽', type: 'feather', rarity: 'epic', graceBonus: 50, wingBonus: 50, value: 1800, description: 'A feather from Michael\'s own wing. It glows with righteous fury and healing grace.' },

  // Legendary (5)
  { id: 'mat_creation_spark', name: 'Creation Spark', emoji: '✨', type: 'essence', rarity: 'legendary', graceBonus: 60, wingBonus: 60, value: 8000, description: 'A spark from the moment of creation. It contains infinite potential within its tiny light.' },
  { id: 'mat_tree_of_life_leaf', name: 'Tree of Life Leaf', emoji: '🍃', type: 'feather', rarity: 'legendary', graceBonus: 50, wingBonus: 80, value: 9000, description: 'A leaf from the Tree of Life. Whoever holds it is sustained indefinitely without food or water.' },
  { id: 'mat_heavenly_scepter_gem', name: 'Heavenly Scepter Gem', emoji: '💠', type: 'crystal', rarity: 'legendary', graceBonus: 80, wingBonus: 50, value: 10000, description: 'The central gem from the Heavenly Scepter. It bends reality to the will of its bearer.' },
  { id: 'mat_empyrean_cloth', name: 'Empyrean Cloth Fragment', emoji: '🎭', type: 'relic_shard', rarity: 'legendary', graceBonus: 40, wingBonus: 90, value: 11000, description: 'A scrap of cloth from the Empyrean Lord\'s vestments. It renders the wearer invisible to evil.' },
  { id: 'mat_seven_seal_wax', name: 'Seven Seal Wax', emoji: '📜', type: 'essence', rarity: 'legendary', graceBonus: 70, wingBonus: 70, value: 12000, description: 'Wax from the breaking of the Seven Seals. It pulses with apocalyptic power.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: HL_STRUCTURES — 25 Sanctum Structures
// ═══════════════════════════════════════════════════════════════════

export const HL_STRUCTURES: readonly HlStructureDef[] = [
  // ── Choir Nests (6) ───────────────────────────────────────────
  { id: 'str_seraph_nest', name: 'Seraph Nest', emoji: '🔥', category: 'choir_nest', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 60, costMultiplier: 1.4, description: 'A fiery alcove where seraphim rest their six wings and renew their holy flame.' },
  { id: 'str_cherub_perch', name: 'Cherub Perch', emoji: '📚', category: 'choir_nest', maxLevel: 10, baseEffect: 3, effectPerLevel: 2, baseCost: 50, costMultiplier: 1.4, description: 'A book-lined perch where cherubim study the celestial archives between duties.' },
  { id: 'str_throne_pedestal', name: 'Throne Pedestal', emoji: '🏛️', category: 'choir_nest', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 80, costMultiplier: 1.5, description: 'A rotating pedestal of light where throne angels anchor their cosmic wheels.' },
  { id: 'str_virtue_grove', name: 'Virtue Grove', emoji: '🌿', category: 'choir_nest', maxLevel: 10, baseEffect: 3, effectPerLevel: 2, baseCost: 70, costMultiplier: 1.4, description: 'A living grove where virtue angels commune with the natural world within the sanctum.' },
  { id: 'str_power_barracks', name: 'Power Barracks', emoji: '⚔️', category: 'choir_nest', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 90, costMultiplier: 1.5, description: 'A fortified barracks where power angels maintain their weapons and shield formations.' },
  { id: 'str_prince_palace', name: 'Principality Palace', emoji: '🏰', category: 'choir_nest', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 85, costMultiplier: 1.5, description: 'A mini palace for a principality to conduct celestial governance over its domain.' },

  // ── Prayer Fonts (6) ──────────────────────────────────────────
  { id: 'str_dew_font', name: 'Dew Prayer Font', emoji: '💧', category: 'prayer_font', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, description: 'A font filled with heavenly dew that restores angel vitality and devotion.' },
  { id: 'str_light_pool', name: 'Light Reflection Pool', emoji: '✨', category: 'prayer_font', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 250, costMultiplier: 1.6, description: 'A pool of liquid light where angels meditate and regain their divine radiance.' },
  { id: 'str_holy_well', name: 'Holy Well of Renewal', emoji: '🪣', category: 'prayer_font', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 400, costMultiplier: 1.7, description: 'A well that draws from the river of life. Angels who drink are fully restored.' },
  { id: 'str_grace_spring', name: 'Grace Spring', emoji: '⛲', category: 'prayer_font', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 600, costMultiplier: 1.8, description: 'A spring of pure grace that flows upward. It enhances all angelic abilities.' },
  { id: 'str_crystal_bath', name: 'Crystal Revival Bath', emoji: '💎', category: 'prayer_font', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 900, costMultiplier: 1.9, description: 'A bath carved from a single crystal. Angels emerge with permanently enhanced radiance.' },
  { id: 'str_empyrean_fountain', name: 'Empyrean Fountain', emoji: '🌟', category: 'prayer_font', maxLevel: 10, baseEffect: 14, effectPerLevel: 7, baseCost: 850, costMultiplier: 1.9, description: 'A fountain fed by the Empyrean itself. Its waters grant temporary omniscience.' },

  // ── Grace Forges (5) ──────────────────────────────────────────
  { id: 'str_basic_forge', name: 'Basic Grace Forge', emoji: '🔨', category: 'grace_forge', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 120, costMultiplier: 1.5, description: 'A simple forge that condenses raw faith into usable grace orbs for angelic growth.' },
  { id: 'str_wing_forge', name: 'Wing Crafting Forge', emoji: '🪽', category: 'grace_forge', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.6, description: 'An advanced forge for crafting and enhancing angelic wings with celestial metals.' },
  { id: 'str_halo_forge', name: 'Halo Minting Forge', emoji: '💫', category: 'grace_forge', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 500, costMultiplier: 1.7, description: 'A forge that mints halos of pure light. Each halo strengthens the angel who wears it.' },
  { id: 'str_celestial_anvil', name: 'Celestial Anvil', emoji: '⚒️', category: 'grace_forge', maxLevel: 10, baseEffect: 20, effectPerLevel: 10, baseCost: 800, costMultiplier: 1.8, description: 'An anvil made from a fallen star. Weapons forged here can cut through any darkness.' },
  { id: 'str_creation_forge', name: 'Creation Forge', emoji: '🌋', category: 'grace_forge', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1200, costMultiplier: 2.0, description: 'The ultimate forge, channeling the power of creation itself. It can craft legendary items.' },

  // ── Light Altars (4) ──────────────────────────────────────────
  { id: 'str_dawn_altar', name: 'Dawn Altar', emoji: '🌅', category: 'light_altar', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 200, costMultiplier: 1.5, description: 'An altar aligned to the rising sun. It amplifies morning blessings and seraphim power.' },
  { id: 'str_star_altar', name: 'Starlight Altar', emoji: '⭐', category: 'light_altar', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 450, costMultiplier: 1.7, description: 'An altar that channels starlight. Virtue angels gain enhanced control over nature here.' },
  { id: 'str_zenith_obelisk', name: 'Zenith Obelisk', emoji: '🔺', category: 'light_altar', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 700, costMultiplier: 1.8, description: 'A towering obelisk that focuses light from directly above. All angelic orders are amplified.' },
  { id: 'str_divine_throne_altar', name: 'Divine Throne Altar', emoji: '👑', category: 'light_altar', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1500, costMultiplier: 2.0, description: 'The holiest altar, seat of divine presence. All blessings and prayers are maximized here.' },

  // ── Relic Shrines (4) ─────────────────────────────────────────
  { id: 'str_relic_pedestal', name: 'Relic Display Pedestal', emoji: '🖼️', category: 'relic_shrine', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.5, description: 'A marble pedestal for displaying celestial relics and enhancing their passive effects.' },
  { id: 'str_sacred_vault', name: 'Sacred Relic Vault', emoji: '🔒', category: 'relic_shrine', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 600, costMultiplier: 1.7, description: 'A sealed vault of divine light that preserves and amplifies the power of stored relics.' },
  { id: 'str_angel_shrine', name: 'Archangel Shrine', emoji: '👼', category: 'relic_shrine', maxLevel: 10, baseEffect: 25, effectPerLevel: 10, baseCost: 1000, costMultiplier: 1.8, description: 'A shrine dedicated to the seven archangels. Relics placed here gain their collective blessing.' },
  { id: 'str_empyrean_shrine', name: 'Empyrean Shrine', emoji: '🌟', category: 'relic_shrine', maxLevel: 10, baseEffect: 30, effectPerLevel: 15, baseCost: 2000, costMultiplier: 2.0, description: 'The supreme shrine at the heart of the sanctum. It can restore and even upgrade relics.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: HL_ABILITIES — 22 Divine Abilities
// ═══════════════════════════════════════════════════════════════════

export const HL_ABILITIES: readonly HlAbilityDef[] = [
  { id: 'ab_holy_glow', name: 'Holy Glow', emoji: '✨', order: 'seraphim', type: 'active', rarity: 'common', faithCost: 5, cooldown: 30, power: 15, description: 'Emit a soft radiance that heals nearby angels and illuminates darkness.' },
  { id: 'ab_ward_shield', name: 'Ward Shield', emoji: '🛡️', order: 'cherubim', type: 'active', rarity: 'common', faithCost: 8, cooldown: 45, power: 20, description: 'Project a shimmering shield that blocks incoming corruption for a short duration.' },
  { id: 'ab_divine_judgment', name: 'Divine Judgment', emoji: '⚖️', order: 'thrones', type: 'active', rarity: 'common', faithCost: 10, cooldown: 60, power: 25, description: 'Pass judgment on a target, dealing damage proportional to their sins.' },
  { id: 'ab_nature_blessing', name: 'Nature Blessing', emoji: '🌿', order: 'virtues', type: 'active', rarity: 'common', faithCost: 6, cooldown: 35, power: 12, description: 'Bless the surrounding area, causing flowers to bloom and angels to heal.' },
  { id: 'ab_holy_strike', name: 'Holy Strike', emoji: '⚔️', order: 'powers', type: 'active', rarity: 'common', faithCost: 8, cooldown: 40, power: 18, description: 'Strike with a weapon of pure light that burns through shadow and corruption.' },
  { id: 'ab_realm_watch', name: 'Realm Watch', emoji: '👁️', order: 'principalities', type: 'active', rarity: 'common', faithCost: 7, cooldown: 35, power: 10, description: 'Extend your perception across the sanctum, detecting threats and hidden passages.' },
  { id: 'ab_divine_message', name: 'Divine Message', emoji: '🕊️', order: 'archangels', type: 'active', rarity: 'common', faithCost: 6, cooldown: 30, power: 12, description: 'Send a message that reaches any angel in the sanctum instantaneously.' },
  { id: 'ab_sacred_flame', name: 'Sacred Flame', emoji: '🔥', order: 'seraphim', type: 'active', rarity: 'uncommon', faithCost: 15, cooldown: 60, power: 30, description: 'Summon pillars of sacred fire that purify corruption and strengthen allies.' },
  { id: 'ab_knowledge_ray', name: 'Knowledge Ray', emoji: '📖', order: 'cherubim', type: 'active', rarity: 'uncommon', faithCost: 20, cooldown: 90, power: 35, description: 'Fire a beam of concentrated knowledge that reveals hidden information and stuns enemies.' },
  { id: 'ab_equilibrium', name: 'Equilibrium', emoji: '☯️', order: 'thrones', type: 'active', rarity: 'uncommon', faithCost: 18, cooldown: 75, power: 28, description: 'Balance all forces in the area, neutralizing debuffs and restoring order.' },
  { id: 'ab_wind_call', name: 'Wind Call', emoji: '🌪️', order: 'virtues', type: 'active', rarity: 'uncommon', faithCost: 14, cooldown: 55, power: 22, description: 'Command the winds to sweep through the sanctum, clearing corruption and boosting radiance.' },
  { id: 'ab_light_shield', name: 'Light Shield', emoji: '🔰', order: 'powers', type: 'active', rarity: 'uncommon', faithCost: 16, cooldown: 55, power: 30, description: 'Create a dome of solid light that protects all angels within from harm.' },
  { id: 'ab_kingdom_ward', name: 'Kingdom Ward', emoji: '🏰', order: 'principalities', type: 'active', rarity: 'uncommon', faithCost: 18, cooldown: 80, power: 25, description: 'Erect a ward over a sanctum area, preventing enemy infiltration for a time.' },
  { id: 'ab_trumpet_blast', name: 'Trumpet Blast', emoji: '📯', order: 'archangels', type: 'active', rarity: 'uncommon', faithCost: 15, cooldown: 60, power: 28, description: 'Sound the heavenly trumpet, granting courage to allies and fear to enemies.' },
  { id: 'ab_blaze_trumpet', name: 'Blaze Trumpet', emoji: '🌟', order: 'seraphim', type: 'active', rarity: 'rare', faithCost: 30, cooldown: 120, power: 50, description: 'Channel fire through a trumpet blast that devastates enemies in a wide cone.' },
  { id: 'ab_true_sight', name: 'True Sight', emoji: '👁️‍🗨️', order: 'cherubim', type: 'passive', rarity: 'rare', faithCost: 0, cooldown: 0, power: 15, description: 'Permanently see through illusions and detect the true nature of any being or object.' },
  { id: 'ab_final_word', name: 'Final Word', emoji: '📜', order: 'thrones', type: 'active', rarity: 'rare', faithCost: 35, cooldown: 150, power: 55, description: 'Speak the final word of judgment, sealing a target\'s fate with absolute authority.' },
  { id: 'ab_starlight_veil', name: 'Starlight Veil', emoji: '🌌', order: 'virtues', type: 'active', rarity: 'rare', faithCost: 25, cooldown: 120, power: 40, description: 'Weave a veil of starlight that hides allies and disorients enemies in beautiful patterns.' },
  { id: 'ab_piercing_light', name: 'Piercing Light', emoji: '💫', order: 'powers', type: 'active', rarity: 'rare', faithCost: 28, cooldown: 110, power: 45, description: 'Fire a concentrated beam of light that pierces all barriers and strikes true.' },
  { id: 'ab_crown_guidance', name: 'Crown Guidance', emoji: '👑', order: 'principalities', type: 'active', rarity: 'rare', faithCost: 25, cooldown: 120, power: 40, description: 'Channel the wisdom of the heavenly crown, granting all allies enhanced decision-making.' },
  { id: 'ab_rose_healing', name: 'Rose Healing', emoji: '🌹', order: 'archangels', type: 'active', rarity: 'rare', faithCost: 30, cooldown: 120, power: 48, description: 'Manifest a celestial rose whose petals heal any wound they touch.' },
  { id: 'ab_creation_fire', name: 'Creation Fire', emoji: '☄️', order: 'seraphim', type: 'active', rarity: 'legendary', faithCost: 60, cooldown: 600, power: 120, description: 'Wield the primordial fire of creation itself. Nothing can withstand its purifying flame.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: HL_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const HL_ACHIEVEMENTS: readonly HlAchievementDef[] = [
  { id: 'ach_first_summon', name: 'First Summoning', emoji: '👼', description: 'Summon your first angel.', condition: 'summon_1', reward: { gold: 50, renown: 10 } },
  { id: 'ach_five_summoned', name: 'Choir Gatherer', emoji: '🤚', description: 'Summon 5 different angels.', condition: 'summon_5', reward: { gold: 200, renown: 40 } },
  { id: 'ach_first_harvest', name: 'Halo Collector', emoji: '💫', description: 'Harvest a halo for the first time.', condition: 'harvest_1', reward: { gold: 80, renown: 15 } },
  { id: 'ach_ten_harvests', name: 'Grace Extractor', emoji: '✨', description: 'Harvest halos 10 times.', condition: 'harvest_10', reward: { gold: 300, renown: 60 } },
  { id: 'ach_first_build', name: 'Sanctum Builder', emoji: '🏗️', description: 'Build your first sanctum structure.', condition: 'build_1', reward: { gold: 100, renown: 20 } },
  { id: 'ach_five_builds', name: 'Celestial Architect', emoji: '🏛️', description: 'Build 5 different sanctum structures.', condition: 'build_5', reward: { gold: 500, renown: 80 } },
  { id: 'ach_chamber_purify', name: 'Chamber Purifier', emoji: '🗺️', description: 'Purify 4 different sanctum chambers.', condition: 'chamber_4', reward: { gold: 400, renown: 50 } },
  { id: 'ach_all_chambers', name: 'Sanctum Cartographer', emoji: '🌍', description: 'Purify all 8 sanctum chambers.', condition: 'chamber_8', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_rare_summon', name: 'Rare Blessing', emoji: '💎', description: 'Summon a rare angel.', condition: 'rare_summon', reward: { gold: 500, renown: 100 } },
  { id: 'ach_epic_summon', name: 'Epic Discovery', emoji: '🌟', description: 'Summon an epic angel.', condition: 'epic_summon', reward: { gold: 1500, renown: 250 } },
  { id: 'ach_legendary_summon', name: 'Legendary Summoner', emoji: '👑', description: 'Summon a legendary angel.', condition: 'legendary_summon', reward: { gold: 5000, renown: 500 } },
  { id: 'ach_first_relic', name: 'Relic Finder', emoji: '🏺', description: 'Discover your first celestial relic.', condition: 'relic_1', reward: { gold: 300, renown: 60 } },
  { id: 'ach_five_relics', name: 'Relic Collector', emoji: '🔍', description: 'Collect 5 different relics.', condition: 'relic_5', reward: { gold: 1000, renown: 150 } },
  { id: 'ach_first_event', name: 'Event Survivor', emoji: '⚡', description: 'Survive your first sanctum event.', condition: 'event_1', reward: { gold: 200, renown: 30 } },
  { id: 'ach_ten_events', name: 'Event Veteran', emoji: '🏅', description: 'Survive 10 sanctum events.', condition: 'event_10', reward: { gold: 800, renown: 120 } },
  { id: 'ach_upgrade_max', name: 'Master Builder', emoji: '🔨', description: 'Upgrade any structure to level 10.', condition: 'upgrade_10', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_all_orders', name: 'Order Master', emoji: '🌈', description: 'Summon at least one angel of each divine order.', condition: 'all_orders', reward: { gold: 3000, renown: 300 } },
  { id: 'ach_max_renown', name: 'Celestial Deity', emoji: '👑', description: 'Reach the title of Celestial Deity.', condition: 'max_title', reward: { gold: 10000, renown: 1000 } },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: HL_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const HL_TITLES: readonly HlTitleDef[] = [
  { id: 'title_mortal_acolyte', name: 'Mortal Acolyte', emoji: '🕊️', minRenown: 0, minAngels: 0, description: 'A mortal who has begun to hear the celestial chorus and seeks the light.' },
  { id: 'title_celestial_initiate', name: 'Celestial Initiate', emoji: '👼', minRenown: 50, minAngels: 3, description: 'An initiate welcomed into the outer sanctum. Angels recognize your growing faith.' },
  { id: 'title_winged_disciple', name: 'Winged Disciple', emoji: '🪽', minRenown: 200, minAngels: 7, description: 'A devoted disciple who has earned a pair of spiritual wings and angelic respect.' },
  { id: 'title_radiant_guardian', name: 'Radiant Guardian', emoji: '🛡️', minRenown: 500, minAngels: 12, description: 'A guardian whose radiance protects the sanctum. Powers and virtues salute you.' },
  { id: 'title_herald_of_light', name: 'Herald of Light', emoji: '📰', minRenown: 1200, minAngels: 18, description: 'A herald who carries divine messages to all chambers. Archangels acknowledge your service.' },
  { id: 'title_sanctum_keeper', name: 'Sanctum Keeper', emoji: '🔑', minRenown: 2500, minAngels: 24, description: 'The keeper of the entire sanctum. All seven divine orders answer to your wisdom.' },
  { id: 'title_divine_seraph', name: 'Divine Seraph', emoji: '🔥', minRenown: 5000, minAngels: 30, description: 'A being elevated to seraphic rank. You burn with the fire of divine purpose.' },
  { id: 'title_celestial_deity', name: 'Celestial Deity', emoji: '👑', minRenown: 10000, minAngels: 35, description: 'The supreme Celestial Deity, master of all angelic orders and guardian of creation.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: HL_RELICS — 15 Legendary Celestial Relics
// ═══════════════════════════════════════════════════════════════════

export const HL_RELICS: readonly HlRelicDef[] = [
  { id: 'relic_crown_light', name: 'Crown of Light', emoji: '👑', rarity: 'epic', order: 'seraphim', graceBoost: 20, wingBoost: 15, radianceBoost: 10, value: 2000, description: 'A crown woven from solidified seraphic light. It grants the wearer divine authority.' },
  { id: 'relic_keys_wisdom', name: 'Keys of Wisdom', emoji: '🗝️', rarity: 'epic', order: 'cherubim', graceBoost: 15, wingBoost: 10, radianceBoost: 20, value: 2200, description: 'Golden keys that unlock any celestial lock or sealed chamber in the sanctum.' },
  { id: 'relic_wheel_thrones', name: 'Wheel of Thrones', emoji: '☸️', rarity: 'rare', order: 'thrones', graceBoost: 10, wingBoost: 15, radianceBoost: 15, value: 800, description: 'A miniature ophanim wheel that spins perpetually, revealing hidden cosmic truths.' },
  { id: 'relic_flask_seasons', name: 'Flask of Seasons', emoji: '🧪', rarity: 'rare', order: 'virtues', graceBoost: 5, wingBoost: 20, radianceBoost: 10, value: 750, description: 'A flask containing the essences of all four seasons. Its holder controls the weather.' },
  { id: 'relic_sword_michael', name: 'Sword Fragment', emoji: '⚔️', rarity: 'epic', order: 'powers', graceBoost: 25, wingBoost: 20, radianceBoost: 15, value: 2500, description: 'A fragment of Michael\'s flaming sword. It burns corruption on contact.' },
  { id: 'relic_scepter_realm', name: 'Scepter of Realms', emoji: '⚜️', rarity: 'epic', order: 'principalities', graceBoost: 15, wingBoost: 15, radianceBoost: 25, value: 2400, description: 'A scepter that grants dominion over a small celestial realm within the sanctum.' },
  { id: 'relic_trumpet_gabriel', name: 'Gabriel\'s Trumpet', emoji: '📯', rarity: 'epic', order: 'archangels', graceBoost: 20, wingBoost: 25, radianceBoost: 20, value: 2600, description: 'A trumpet that once belonged to Gabriel. Its blast awakens dormant angelic power.' },
  { id: 'relic_book_enoch', name: 'Book of Enoch', emoji: '📜', rarity: 'legendary', order: 'cherubim', graceBoost: 40, wingBoost: 30, radianceBoost: 20, value: 8000, description: 'The legendary Book of Enoch, containing the secret names of all angels.' },
  { id: 'relic_seven_seals', name: 'Seven Seals', emoji: '🔏', rarity: 'legendary', order: 'thrones', graceBoost: 30, wingBoost: 40, radianceBoost: 15, value: 7500, description: 'The Seven Seals of divine judgment. Each one broken releases immense power.' },
  { id: 'relic_eden_fruit', name: 'Fruit of Eden', emoji: '🍎', rarity: 'legendary', order: 'virtues', graceBoost: 60, wingBoost: 20, radianceBoost: 30, value: 10000, description: 'The last fruit from the Garden of Eden. It grants eternal vitality to its bearer.' },
  { id: 'relic_holy_grail', name: 'Holy Grail', emoji: '🏆', rarity: 'legendary', order: 'powers', graceBoost: 25, wingBoost: 35, radianceBoost: 40, value: 9000, description: 'The legendary Holy Grail. Angels who drink from it are permanently empowered.' },
  { id: 'relic_empyrean_crown', name: 'Empyrean Crown', emoji: '👑', rarity: 'legendary', order: 'principalities', graceBoost: 35, wingBoost: 35, radianceBoost: 35, value: 9500, description: 'The crown of the Empyrean Lord. It allows its wearer to see all of creation.' },
  { id: 'relic_ark_covenant', name: 'Ark of the Covenant', emoji: '📦', rarity: 'epic', order: 'archangels', graceBoost: 20, wingBoost: 15, radianceBoost: 30, value: 2300, description: 'A replica of the Ark. It radiates divine presence and repels all darkness.' },
  { id: 'relic_metatron_cube', name: 'Metatron\'s Cube', emoji: '🔷', rarity: 'legendary', order: 'seraphim', graceBoost: 50, wingBoost: 45, radianceBoost: 50, value: 11000, description: 'The sacred geometric form containing all platonic solids. It maps the structure of creation.' },
  { id: 'relic_philosopher_stone', name: 'Philosopher\'s Stone', emoji: '💎', rarity: 'legendary', order: 'seraphim', graceBoost: 30, wingBoost: 30, radianceBoost: 60, value: 12000, description: 'The legendary stone that transforms base matter into pure divine essence.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: HL_EVENTS — 12 Sanctum Events
// ═══════════════════════════════════════════════════════════════════

export const HL_EVENTS: readonly HlEventDef[] = [
  { id: 'evt_divine_light', name: 'Divine Light Shower', emoji: '✨', durationTurns: 5, effectType: 'buff', effectDescription: 'All angel radiance doubled. Extra halo harvests.', description: 'A cascade of divine light pours through the sanctum, empowering all celestial beings.' },
  { id: 'evt_shadow_incursion', name: 'Shadow Incursion', emoji: '🌑', durationTurns: 3, effectType: 'debuff', effectDescription: 'Angel power reduced by 30%. Power angels immune.', description: 'A wave of shadow pushes against the sanctum barriers. Only the strongest angels hold firm.' },
  { id: 'evt_celestial_choir', name: 'Celestial Choir Assembly', emoji: '🎵', durationTurns: 4, effectType: 'special', effectDescription: 'Seraphim gain +50 power. New materials appear.', description: 'All seven choirs of angels assemble for a grand hymn. The harmonies reshape reality.' },
  { id: 'evt_halo_eclipse', name: 'Halo Eclipse', emoji: '🌚', durationTurns: 2, effectType: 'special', effectDescription: 'Archangel power tripled. Seraphim halved.', description: 'An eclipse dims all halos except those of archangels, who blaze brighter than ever.' },
  { id: 'evt_fallen_tears', name: 'Fallen Angel Tears', emoji: '😢', durationTurns: 3, effectType: 'debuff', effectDescription: 'Cherubim lose 25% power. Rare relics appear.', description: 'Tears from fallen angels rain upon the sanctum, bringing sorrow but also rare gifts.' },
  { id: 'evt_golden_dawn', name: 'Golden Dawn', emoji: '🌅', durationTurns: 5, effectType: 'buff', effectDescription: 'Gold rewards doubled. All angels gain +30% radiance.', description: 'The most magnificent dawn ever seen. Every surface in the sanctum turns to gold momentarily.' },
  { id: 'evt_feather_storm', name: 'Feather Storm', emoji: '🪶', durationTurns: 4, effectType: 'buff', effectDescription: 'All angels gain +20% devotion. Extra feather harvests.', description: 'A gentle storm of angelic feathers fills the sanctum air, each one carrying a blessing.' },
  { id: 'evt_vault_breach', name: 'Vault Breach', emoji: '💥', durationTurns: 2, effectType: 'debuff', effectDescription: 'Lose 10% gold. Relic chance increased.', description: 'An unknown force breaches the relic vault. Things are lost, but something new appears...' },
  { id: 'evt_phoenix_resurrection', name: 'Phoenix Resurrection', emoji: '🔥', durationTurns: 3, effectType: 'buff', effectDescription: 'Seraphim resurrect once. All healing doubled.', description: 'A celestial phoenix rises within the sanctum, its tears healing all angelic wounds.' },
  { id: 'evt_faith_drought', name: 'Faith Drought', emoji: '🏜️', durationTurns: 5, effectType: 'debuff', effectDescription: 'Virtue angel power halved. Throne angels thrive.', description: 'Faith wanes across the sanctum. Gardens wither but the halls of justice grow stronger.' },
  { id: 'evt_sacred_geometry', name: 'Sacred Geometry Shift', emoji: '🔷', durationTurns: 3, effectType: 'special', effectDescription: 'Bonus renown per purification. Puzzle rewards doubled.', description: 'The sacred geometric patterns of the sanctum shift and rearrange, revealing hidden paths.' },
  { id: 'evt_angel_migration', name: 'Great Angel Migration', emoji: '👼', durationTurns: 6, effectType: 'buff', effectDescription: 'Summoning chance doubled. New angel species appear.', description: 'Angels from distant sanctums migrate here. The perfect time to summon new allies.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: INTERNAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const HL_MAX_ANGEL_LEVEL = 50
const HL_MAX_STRUCTURE_LEVEL = 10
const HL_INITIAL_GOLD = 200
const HL_INITIAL_RENOWN = 0

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: HELPER FUNCTIONS (hoisted with `function`)
// ═══════════════════════════════════════════════════════════════════

function hlXpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.25, level - 1))
}

function hlCalcStats(species: HlAngelSpecies, level: number) {
  const growth = 1 + (level - 1) * 0.12
  return {
    gracePower: Math.floor(species.gracePower * growth),
    wingPower: Math.floor(species.wingPower * growth),
    radiance: Math.floor(species.radiance * growth),
  }
}

let _hlIdCounter = 0
function hlGenerateId(): string {
  _hlIdCounter += 1
  return `hl_${_hlIdCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`
}

function hlFindSpecies(id: string): HlAngelSpecies | undefined {
  return HL_ANGELS.find((s) => s.id === id)
}

function hlFindChamber(id: string): HlChamberDef | undefined {
  return HL_CHAMBERS.find((z) => z.id === id)
}

function hlFindMaterial(id: string): HlMaterialDef | undefined {
  return HL_MATERIALS.find((m) => m.id === id)
}

function hlFindStructureDef(id: string): HlStructureDef | undefined {
  return HL_STRUCTURES.find((s) => s.id === id)
}

function hlFindAbility(id: string): HlAbilityDef | undefined {
  return HL_ABILITIES.find((a) => a.id === id)
}

function hlFindRelic(id: string): HlRelicDef | undefined {
  return HL_RELICS.find((r) => r.id === id)
}

function hlFindAchievement(id: string): HlAchievementDef | undefined {
  return HL_ACHIEVEMENTS.find((a) => a.id === id)
}

function hlFindTitle(id: HlTitleId): HlTitleDef | undefined {
  return HL_TITLES.find((t) => t.id === id)
}

function hlRarityMultiplier(rarity: HlRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 5
    case 'epic': return 10
    case 'legendary': return 25
    default: return 1
  }
}

function hlRarityColor(rarity: HlRarity): string {
  switch (rarity) {
    case 'common': return '#9ca3af'
    case 'uncommon': return '#34d399'
    case 'rare': return '#60a5fa'
    case 'epic': return '#a78bfa'
    case 'legendary': return '#fbbf24'
    default: return '#9ca3af'
  }
}

function hlOrderColor(order: HlDivineOrder): string {
  switch (order) {
    case 'seraphim': return HL_HALO_GOLD
    case 'cherubim': return HL_HOLY_PURPLE
    case 'thrones': return HL_CELESTIAL_BLUE
    case 'virtues': return HL_GRACE_GREEN
    case 'powers': return HL_SANCTUM_AMBER
    case 'principalities': return HL_ANGELIC_SILVER
    case 'archangels': return HL_RADIANCE_ROSE
    default: return '#888888'
  }
}

export function hlCheckHarmony(attacker: HlDivineOrder, defender: HlDivineOrder): number {
  const advantages = HL_HARMONY_MAP[attacker]
  if (advantages?.includes(defender)) return 1.4
  const disadvantages = HL_HARMONY_MAP[defender]
  if (disadvantages?.includes(attacker)) return 0.7
  return 1.0
}

function hlCalcStructureUpgradeCost(def: HlStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

function hlCalcMaxTitle(renown: number, angelCount: number): HlTitleId {
  let bestId: HlTitleId = 'title_mortal_acolyte'
  for (const title of HL_TITLES) {
    if (renown >= title.minRenown && angelCount >= title.minAngels) {
      bestId = title.id
    }
  }
  return bestId
}

function hlCheckAchievementCondition(
  condition: string,
  state: HlStoreState
): boolean {
  switch (condition) {
    case 'summon_1':
      return state.totalSummoned >= 1
    case 'summon_5':
      return state.totalSummoned >= 5
    case 'harvest_1':
      return state.totalHarvested >= 1
    case 'harvest_10':
      return state.totalHarvested >= 10
    case 'build_1':
      return state.totalBuilt >= 1
    case 'build_5':
      return state.totalBuilt >= 5
    case 'chamber_4':
      return state.chambers.length >= 4
    case 'chamber_8':
      return state.chambers.length >= 8
    case 'rare_summon':
      return state.angels.some((a) => {
        const sp = hlFindSpecies(a.speciesId)
        return sp && (sp.rarity === 'rare' || sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'epic_summon':
      return state.angels.some((a) => {
        const sp = hlFindSpecies(a.speciesId)
        return sp && (sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'legendary_summon':
      return state.angels.some((a) => {
        const sp = hlFindSpecies(a.speciesId)
        return sp && sp.rarity === 'legendary'
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
    case 'all_orders': {
      const orders = new Set<HlDivineOrder>()
      for (const a of state.angels) {
        const sp = hlFindSpecies(a.speciesId)
        if (sp) orders.add(sp.order)
      }
      return orders.size >= 7
    }
    case 'max_title':
      return state.currentTitle === 'title_celestial_deity'
    default:
      return false
  }
}

function hlPickRandomEvent(): HlEventDef {
  const idx = Math.floor(Math.random() * HL_EVENTS.length)
  return HL_EVENTS[idx]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const useHlStore = create<HlFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      angels: [] as HlAngelInstance[],
      chambers: [] as string[],
      materials: [] as { materialId: string; count: number }[],
      structures: [] as HlStructureInstance[],
      abilities: [] as string[],
      achievements: [] as string[],
      relics: [] as string[],
      currentTitle: 'title_mortal_acolyte' as HlTitleId,
      gold: HL_INITIAL_GOLD,
      renown: HL_INITIAL_RENOWN,
      totalSummoned: 0,
      totalHarvested: 0,
      totalBuilt: 0,
      totalEventsFaced: 0,
      activeEvent: null as HlEventDef | null,
      eventTurnsRemaining: 0,
      activeChamber: null as string | null,

      // ── hlSummonAngel ──────────────────────────────────────────
      hlSummonAngel: (speciesId: string): boolean => {
        const species = hlFindSpecies(speciesId)
        if (!species) return false
        const cost = Math.floor(50 * hlRarityMultiplier(species.rarity))
        const state = get()
        if (state.gold < cost) return false
        const stats = hlCalcStats(species, 1)
        const newAngel: HlAngelInstance = {
          id: hlGenerateId(),
          speciesId,
          name: species.name,
          level: 1,
          xp: 0,
          gracePower: stats.gracePower,
          wingPower: stats.wingPower,
          radiance: stats.radiance,
          devotion: 80,
          vitality: 70,
          summonedAt: Date.now(),
        }
        set((prev) => {
          const updated = {
            angels: [...prev.angels, newAngel],
            gold: prev.gold - cost,
            totalSummoned: prev.totalSummoned + 1,
            renown: prev.renown + hlRarityMultiplier(species.rarity) * 5,
            currentTitle: hlCalcMaxTitle(
              prev.renown + hlRarityMultiplier(species.rarity) * 5,
              prev.angels.length + 1
            ),
          }
          return updated
        })
        return true
      },

      // ── hlReleaseAngel ────────────────────────────────────────
      hlReleaseAngel: (angelId: string): boolean => {
        const state = get()
        const exists = state.angels.find((a) => a.id === angelId)
        if (!exists) return false
        const species = hlFindSpecies(exists.speciesId)
        const refund = species ? Math.floor(25 * hlRarityMultiplier(species.rarity)) : 10
        set((prev) => ({
          angels: prev.angels.filter((a) => a.id !== angelId),
          gold: prev.gold + refund,
          currentTitle: hlCalcMaxTitle(prev.renown, prev.angels.length - 1),
        }))
        return true
      },

      // ── hlBlessAngel ──────────────────────────────────────────
      hlBlessAngel: (angelId: string): boolean => {
        const blessCost = 10
        const state = get()
        if (state.gold < blessCost) return false
        set((prev) => {
          const angels = prev.angels.map((a) => {
            if (a.id !== angelId) return a
            const newXp = a.xp + 20
            const xpNeeded = hlXpForLevel(a.level)
            let newLevel = a.level
            let currentXp = newXp
            if (currentXp >= xpNeeded && a.level < HL_MAX_ANGEL_LEVEL) {
              newLevel = a.level + 1
              currentXp = newXp - xpNeeded
            }
            const species = hlFindSpecies(a.speciesId)
            const stats = species ? hlCalcStats(species, newLevel) : { gracePower: a.gracePower, wingPower: a.wingPower, radiance: a.radiance }
            return {
              ...a,
              level: newLevel,
              xp: currentXp,
              gracePower: stats.gracePower,
              wingPower: stats.wingPower,
              radiance: stats.radiance,
              devotion: Math.min(100, a.devotion + 10),
              vitality: Math.min(100, a.vitality + 20),
            }
          })
          return { angels, gold: prev.gold - blessCost, renown: prev.renown + 2 }
        })
        return true
      },

      // ── hlHarvestHalo ─────────────────────────────────────────
      hlHarvestHalo: (angelId: string): boolean => {
        const state = get()
        const angel = state.angels.find((a) => a.id === angelId)
        if (!angel) return false
        if (angel.vitality < 20) return false
        const species = hlFindSpecies(angel.speciesId)
        if (!species) return false
        const materialId = `mat_${species.order}_${species.rarity}`
        const existingMaterial = state.materials.find((m) => m.materialId === materialId)
        const amount = Math.ceil(angel.gracePower / 10)
        set((prev) => ({
          materials: existingMaterial
            ? prev.materials.map((m) => (m.materialId === materialId ? { ...m, count: m.count + amount } : m))
            : [...prev.materials, { materialId, count: amount }],
          totalHarvested: prev.totalHarvested + 1,
          renown: prev.renown + 3,
          angels: prev.angels.map((a) =>
            a.id === angelId ? { ...a, vitality: Math.max(0, a.vitality - 20) } : a
          ),
        }))
        return true
      },

      // ── hlBuildStructure ──────────────────────────────────────
      hlBuildStructure: (structureDefId: string): boolean => {
        const def = hlFindStructureDef(structureDefId)
        if (!def) return false
        const state = get()
        if (state.gold < def.baseCost) return false
        const alreadyBuilt = state.structures.find((s) => s.structureDefId === structureDefId)
        if (alreadyBuilt) return false
        const newStructure: HlStructureInstance = {
          id: hlGenerateId(),
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

      // ── hlUpgradeStructure ────────────────────────────────────
      hlUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structure = state.structures.find((s) => s.id === structureId)
        if (!structure) return false
        if (structure.level >= HL_MAX_STRUCTURE_LEVEL) return false
        const def = hlFindStructureDef(structure.structureDefId)
        if (!def) return false
        const cost = hlCalcStructureUpgradeCost(def, structure.level)
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

      // ── hlPurifyChamber ──────────────────────────────────────
      hlPurifyChamber: (chamberId: string): HlEventDef | null => {
        const chamber = hlFindChamber(chamberId)
        if (!chamber) return null
        const state = get()
        const requiredTitleIdx = HL_TITLES.findIndex((t) => t.id === chamber.requiredTitle)
        const currentTitleIdx = HL_TITLES.findIndex((t) => t.id === state.currentTitle)
        if (currentTitleIdx < requiredTitleIdx) return null
        const newChambers = state.chambers.includes(chamberId) ? state.chambers : [...state.chambers, chamberId]
        const event = hlPickRandomEvent()
        set((prev) => ({
          chambers: newChambers,
          activeChamber: chamberId,
          activeEvent: event,
          eventTurnsRemaining: event.durationTurns,
          totalEventsFaced: prev.totalEventsFaced + 1,
          renown: prev.renown + 5,
        }))
        return event
      },

      // ── hlCollectRelic ────────────────────────────────────────
      hlCollectRelic: (relicId: string): boolean => {
        const relic = hlFindRelic(relicId)
        if (!relic) return false
        const state = get()
        if (state.relics.includes(relicId)) return false
        set((prev) => ({
          relics: [...prev.relics, relicId],
          renown: prev.renown + Math.floor(hlRarityMultiplier(relic.rarity) * 20),
          currentTitle: hlCalcMaxTitle(
            prev.renown + Math.floor(hlRarityMultiplier(relic.rarity) * 20),
            prev.angels.length
          ),
        }))
        return true
      },

      // ── hlUnlockAbility ───────────────────────────────────────
      hlUnlockAbility: (abilityId: string): boolean => {
        const ability = hlFindAbility(abilityId)
        if (!ability) return false
        const state = get()
        if (state.abilities.includes(abilityId)) return false
        const cost = Math.floor(100 * hlRarityMultiplier(ability.rarity))
        if (state.gold < cost) return false
        set((prev) => ({
          abilities: [...prev.abilities, abilityId],
          gold: prev.gold - cost,
        }))
        return true
      },

      // ── hlUnlockTitle ─────────────────────────────────────────
      hlUnlockTitle: (titleId: HlTitleId): boolean => {
        const title = hlFindTitle(titleId)
        if (!title) return false
        const state = get()
        if (state.renown < title.minRenown) return false
        if (state.angels.length < title.minAngels) return false
        set((prev) => ({ currentTitle: titleId }))
        return true
      },

      // ── hlClaimAchievement ────────────────────────────────────
      hlClaimAchievement: (achievementId: string): boolean => {
        const achievement = hlFindAchievement(achievementId)
        if (!achievement) return false
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!hlCheckAchievementCondition(achievement.condition, state)) return false
        set((prev) => ({
          achievements: [...prev.achievements, achievementId],
          gold: prev.gold + achievement.reward.gold,
          renown: prev.renown + achievement.reward.renown,
          currentTitle: hlCalcMaxTitle(
            prev.renown + achievement.reward.renown,
            prev.angels.length
          ),
        }))
        return true
      },

      // ── hlTradeMaterial ───────────────────────────────────────
      hlTradeMaterial: (materialId: string, count: number): number => {
        const material = hlFindMaterial(materialId)
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

      // ── hlEndEvent ────────────────────────────────────────────
      hlEndEvent: () => {
        set({ activeEvent: null, eventTurnsRemaining: 0 })
      },

      // ── hlResetEvent ──────────────────────────────────────────
      hlResetEvent: () => {
        const event = hlPickRandomEvent()
        set({ activeEvent: event, eventTurnsRemaining: event.durationTurns })
      },
    }),
    {
      name: 'halo-sanctum-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: MAIN HOOK — useHaloSanctum()
// ═══════════════════════════════════════════════════════════════════

export default function useHaloSanctum(): HlAPI {
  const store = useHlStore()

  // ── Computed: Owned angels with species info ──────────────────
  const hlOwnedAngels = useMemo(() => {
    return store.angels.map((a) => {
      const species = hlFindSpecies(a.speciesId)
      return {
        ...a,
        species,
        orderColor: species ? hlOrderColor(species.order) : '#888888',
        rarityColor: species ? hlRarityColor(species.rarity) : '#888888',
      }
    })
  }, [store])

  // ── Computed: Available angel species to summon ──────────────
  const hlAvailableSpecies = useMemo(() => {
    return HL_ANGELS.filter((sp) => {
      const cost = Math.floor(50 * hlRarityMultiplier(sp.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Current title details ───────────────────────────
  const hlCurrentTitleDetail = useMemo(() => {
    return hlFindTitle(store.currentTitle) ?? HL_TITLES[0]
  }, [store])

  // ── Computed: Next title info ─────────────────────────────────
  const hlNextTitle = useMemo(() => {
    const currentIdx = HL_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= HL_TITLES.length - 1) return null
    return HL_TITLES[currentIdx + 1]
  }, [store])

  // ── Computed: Active chamber details ──────────────────────────
  const hlActiveChamberDetail = useMemo(() => {
    if (!store.activeChamber) return null
    return hlFindChamber(store.activeChamber) ?? null
  }, [store])

  // ── Computed: Unpurified chambers ─────────────────────────────
  const hlUnpurifiedChambers = useMemo(() => {
    return HL_CHAMBERS.filter((c) => !store.chambers.includes(c.id))
  }, [store])

  // ── Computed: Structures with defs ────────────────────────────
  const hlBuiltStructures = useMemo(() => {
    return store.structures.map((s) => {
      const def = hlFindStructureDef(s.structureDefId)
      return { ...s, def }
    })
  }, [store])

  // ── Computed: Unlockable abilities ────────────────────────────
  const hlUnlockableAbilities = useMemo(() => {
    return HL_ABILITIES.filter((a) => {
      if (store.abilities.includes(a.id)) return false
      const cost = Math.floor(100 * hlRarityMultiplier(a.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Owned relics with defs ──────────────────────────
  const hlOwnedRelics = useMemo(() => {
    return store.relics.map((rId) => {
      const def = hlFindRelic(rId)
      return def ?? null
    }).filter((r): r is HlRelicDef => r !== null)
  }, [store])

  // ── Computed: Unclaimed achievements ──────────────────────────
  const hlUnclaimedAchievements = useMemo(() => {
    return HL_ACHIEVEMENTS.filter((a) => {
      if (store.achievements.includes(a.id)) return false
      return hlCheckAchievementCondition(a.condition, store)
    })
  }, [store])

  // ── Computed: Materials with defs ─────────────────────────────
  const hlInventoryMaterials = useMemo(() => {
    return store.materials.map((m) => {
      const def = hlFindMaterial(m.materialId)
      return { ...m, def }
    })
  }, [store])

  // ── Computed: Total structure effect bonus ────────────────────
  const hlTotalStructureEffect = useMemo(() => {
    let totalEffect = 0
    for (const s of store.structures) {
      const def = hlFindStructureDef(s.structureDefId)
      if (def) {
        totalEffect += def.baseEffect + def.effectPerLevel * (s.level - 1)
      }
    }
    return totalEffect
  }, [store])

  // ── Computed: Average angel level ─────────────────────────────
  const hlAverageAngelLevel = useMemo(() => {
    if (store.angels.length === 0) return 0
    const total = store.angels.reduce((sum, a) => sum + a.level, 0)
    return Math.floor(total / store.angels.length)
  }, [store])

  // ── Computed: Total angel power ───────────────────────────────
  const hlTotalAngelPower = useMemo(() => {
    return store.angels.reduce(
      (sum, a) => sum + a.gracePower + a.wingPower + a.radiance,
      0
    )
  }, [store])

  // ── Computed: Order distribution ──────────────────────────────
  const hlOrderDistribution = useMemo(() => {
    const counts: Record<HlDivineOrder, number> = {
      seraphim: 0, cherubim: 0, thrones: 0, virtues: 0, powers: 0, principalities: 0, archangels: 0,
    }
    for (const a of store.angels) {
      const sp = hlFindSpecies(a.speciesId)
      if (sp) counts[sp.order]++
    }
    return counts
  }, [store])

  // ── Computed: Rarity distribution ─────────────────────────────
  const hlRarityDistribution = useMemo(() => {
    const counts: Record<HlRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
    }
    for (const a of store.angels) {
      const sp = hlFindSpecies(a.speciesId)
      if (sp) counts[sp.rarity]++
    }
    return counts
  }, [store])

  // ── Computed: Angels by rarity ────────────────────────────────
  const hlAngelsByRarity = useMemo(() => {
    const groups: Record<HlRarity, HlAngelInstance[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    }
    for (const a of store.angels) {
      const sp = hlFindSpecies(a.speciesId)
      if (sp) groups[sp.rarity].push(a)
    }
    return groups
  }, [store])

  // ── Computed: Angels by order ─────────────────────────────────
  const hlAngelsByOrder = useMemo(() => {
    const groups: Record<HlDivineOrder, HlAngelInstance[]> = {
      seraphim: [], cherubim: [], thrones: [], virtues: [], powers: [], principalities: [], archangels: [],
    }
    for (const a of store.angels) {
      const sp = hlFindSpecies(a.speciesId)
      if (sp) groups[sp.order].push(a)
    }
    return groups
  }, [store])

  // ── Computed: Progress to next title ──────────────────────────
  const hlTitleProgress = useMemo(() => {
    const currentIdx = HL_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= HL_TITLES.length - 1) return { percent: 100, renownNeeded: 0, angelsNeeded: 0 }
    const next = HL_TITLES[currentIdx + 1]
    const renownProgress = Math.min(100, (store.renown / next.minRenown) * 100)
    const angelProgress = Math.min(100, (store.angels.length / next.minAngels) * 100)
    return {
      percent: Math.floor((renownProgress + angelProgress) / 2),
      renownNeeded: Math.max(0, next.minRenown - store.renown),
      angelsNeeded: Math.max(0, next.minAngels - store.angels.length),
    }
  }, [store])

  // ── Computed: Rare materials count ────────────────────────────
  const hlRareMaterialCount = useMemo(() => {
    let count = 0
    for (const m of store.materials) {
      const def = hlFindMaterial(m.materialId)
      if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
        count += m.count
      }
    }
    return count
  }, [store])

  // ── Computed: Weakened angels ─────────────────────────────────
  const hlWeakenedAngels = useMemo(() => {
    return store.angels.filter((a) => a.vitality < 30)
  }, [store])

  // ── Computed: Low devotion angels ─────────────────────────────
  const hlUnfaithfulAngels = useMemo(() => {
    return store.angels.filter((a) => a.devotion < 30)
  }, [store])

  // ── Computed: Total relic boost ───────────────────────────────
  const hlTotalRelicBoost = useMemo(() => {
    let graceBoost = 0
    let wingBoost = 0
    let radianceBoost = 0
    for (const rId of store.relics) {
      const relic = hlFindRelic(rId)
      if (relic) {
        graceBoost += relic.graceBoost
        wingBoost += relic.wingBoost
        radianceBoost += relic.radianceBoost
      }
    }
    return { graceBoost, wingBoost, radianceBoost }
  }, [store])

  // ═════════════════════════════════════════════════════════════
  // Return hlAPI object
  // ═════════════════════════════════════════════════════════════

  const hlAPI: HlAPI = {
    // ── Direct constants ──────────────────────────────────────
    HL_HALO_GOLD,
    HL_DIVINE_WHITE,
    HL_CELESTIAL_BLUE,
    HL_ANGELIC_SILVER,
    HL_SANCTUM_AMBER,
    HL_HOLY_PURPLE,
    HL_GRACE_GREEN,
    HL_RADIANCE_ROSE,
    HL_ORDERS,
    HL_ANGELS,
    HL_CHAMBERS,
    HL_MATERIALS,
    HL_STRUCTURES,
    HL_ABILITIES,
    HL_ACHIEVEMENTS,
    HL_TITLES,
    HL_RELICS,
    HL_EVENTS,
    hlCheckHarmony,

    // ── Store state ───────────────────────────────────────────
    angels: store.angels,
    chambers: store.chambers,
    materials: store.materials,
    structures: store.structures,
    abilities: store.abilities,
    achievements: store.achievements,
    relics: store.relics,
    currentTitle: store.currentTitle,
    gold: store.gold,
    renown: store.renown,
    totalSummoned: store.totalSummoned,
    totalHarvested: store.totalHarvested,
    totalBuilt: store.totalBuilt,
    totalEventsFaced: store.totalEventsFaced,
    activeEvent: store.activeEvent,
    eventTurnsRemaining: store.eventTurnsRemaining,
    activeChamber: store.activeChamber,

    // ── Store actions ─────────────────────────────────────────
    hlSummonAngel: store.hlSummonAngel,
    hlReleaseAngel: store.hlReleaseAngel,
    hlBlessAngel: store.hlBlessAngel,
    hlHarvestHalo: store.hlHarvestHalo,
    hlBuildStructure: store.hlBuildStructure,
    hlUpgradeStructure: store.hlUpgradeStructure,
    hlPurifyChamber: store.hlPurifyChamber,
    hlCollectRelic: store.hlCollectRelic,
    hlUnlockAbility: store.hlUnlockAbility,
    hlUnlockTitle: store.hlUnlockTitle,
    hlClaimAchievement: store.hlClaimAchievement,
    hlTradeMaterial: store.hlTradeMaterial,
    hlEndEvent: store.hlEndEvent,
    hlResetEvent: store.hlResetEvent,

    // ── Computed getters ──────────────────────────────────────
    hlOwnedAngels,
    hlAvailableSpecies,
    hlCurrentTitleDetail,
    hlNextTitle,
    hlActiveChamberDetail,
    hlUnpurifiedChambers,
    hlBuiltStructures,
    hlUnlockableAbilities,
    hlOwnedRelics,
    hlUnclaimedAchievements,
    hlInventoryMaterials,
    hlTotalStructureEffect,
    hlAverageAngelLevel,
    hlTotalAngelPower,
    hlOrderDistribution,
    hlRarityDistribution,
    hlAngelsByRarity,
    hlAngelsByOrder,
    hlTitleProgress,
    hlRareMaterialCount,
    hlWeakenedAngels,
    hlUnfaithfulAngels,
    hlTotalRelicBoost,
  }

  return hlAPI
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 18: HlAPI RETURN TYPE
// ═══════════════════════════════════════════════════════════════════

export interface HlAPI {
  // Color constants
  HL_HALO_GOLD: string
  HL_DIVINE_WHITE: string
  HL_CELESTIAL_BLUE: string
  HL_ANGELIC_SILVER: string
  HL_SANCTUM_AMBER: string
  HL_HOLY_PURPLE: string
  HL_GRACE_GREEN: string
  HL_RADIANCE_ROSE: string
  // Data constants
  HL_ORDERS: readonly HlDivineOrderDef[]
  HL_ANGELS: readonly HlAngelSpecies[]
  HL_CHAMBERS: readonly HlChamberDef[]
  HL_MATERIALS: readonly HlMaterialDef[]
  HL_STRUCTURES: readonly HlStructureDef[]
  HL_ABILITIES: readonly HlAbilityDef[]
  HL_ACHIEVEMENTS: readonly HlAchievementDef[]
  HL_TITLES: readonly HlTitleDef[]
  HL_RELICS: readonly HlRelicDef[]
  HL_EVENTS: readonly HlEventDef[]
  hlCheckHarmony: (attacker: HlDivineOrder, defender: HlDivineOrder) => number
  // Store state
  angels: HlAngelInstance[]
  chambers: string[]
  materials: { materialId: string; count: number }[]
  structures: HlStructureInstance[]
  abilities: string[]
  achievements: string[]
  relics: string[]
  currentTitle: HlTitleId
  gold: number
  renown: number
  totalSummoned: number
  totalHarvested: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: HlEventDef | null
  eventTurnsRemaining: number
  activeChamber: string | null
  // Store actions
  hlSummonAngel: (speciesId: string) => boolean
  hlReleaseAngel: (angelId: string) => boolean
  hlBlessAngel: (angelId: string) => boolean
  hlHarvestHalo: (angelId: string) => boolean
  hlBuildStructure: (structureDefId: string) => boolean
  hlUpgradeStructure: (structureId: string) => boolean
  hlPurifyChamber: (chamberId: string) => HlEventDef | null
  hlCollectRelic: (relicId: string) => boolean
  hlUnlockAbility: (abilityId: string) => boolean
  hlUnlockTitle: (titleId: HlTitleId) => boolean
  hlClaimAchievement: (achievementId: string) => boolean
  hlTradeMaterial: (materialId: string, count: number) => number
  hlEndEvent: () => void
  hlResetEvent: () => void
  // Computed getters
  hlOwnedAngels: (HlAngelInstance & { species: HlAngelSpecies | undefined; orderColor: string; rarityColor: string })[]
  hlAvailableSpecies: HlAngelSpecies[]
  hlCurrentTitleDetail: HlTitleDef
  hlNextTitle: HlTitleDef | null
  hlActiveChamberDetail: HlChamberDef | null
  hlUnpurifiedChambers: HlChamberDef[]
  hlBuiltStructures: (HlStructureInstance & { def: HlStructureDef | undefined })[]
  hlUnlockableAbilities: HlAbilityDef[]
  hlOwnedRelics: HlRelicDef[]
  hlUnclaimedAchievements: HlAchievementDef[]
  hlInventoryMaterials: ({ materialId: string; count: number } & { def: HlMaterialDef | undefined })[]
  hlTotalStructureEffect: number
  hlAverageAngelLevel: number
  hlTotalAngelPower: number
  hlOrderDistribution: Record<HlDivineOrder, number>
  hlRarityDistribution: Record<HlRarity, number>
  hlAngelsByRarity: Record<HlRarity, HlAngelInstance[]>
  hlAngelsByOrder: Record<HlDivineOrder, HlAngelInstance[]>
  hlTitleProgress: { percent: number; renownNeeded: number; angelsNeeded: number }
  hlRareMaterialCount: number
  hlWeakenedAngels: HlAngelInstance[]
  hlUnfaithfulAngels: HlAngelInstance[]
  hlTotalRelicBoost: { graceBoost: number; wingBoost: number; radianceBoost: number }
}
