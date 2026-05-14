/**
 * Raven Tower Wire — A dark gothic tower mini-game for Word Snake
 *
 * Command 35 ravens across 7 dark arts, explore 8 tower floors,
 * collect 30 shadow/feather materials, build 25 tower structures,
 * unlock 22 raven abilities, discover 15 legendary dark relics,
 * face 12 tower events, and ascend through 8 titles from Raven
 * Fledgling to Tower Deity — backed by a Zustand store with
 * persist middleware.
 *
 * Storage key: raven-tower-wire
 * Prefix: rt / RT_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type RtDarkArt =
  | 'shadowmancy'
  | 'bloodmagic'
  | 'soulbinding'
  | 'cursecraft'
  | 'necromancy'
  | 'darkalchemy'
  | 'voidweaving'

export type RtRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type RtTitleId =
  | 'title_raven_fledgling'
  | 'title_shadow_apprentice'
  | 'title_dark_flockmaster'
  | 'title_curse_weaver'
  | 'title_tower_keeper'
  | 'title_soul_archon'
  | 'title_abyss_lord'
  | 'title_tower_deity'

export interface RtDarkArtDef {
  readonly id: RtDarkArt
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface RtRavenSpecies {
  readonly id: string
  readonly name: string
  readonly darkArt: RtDarkArt
  readonly rarity: RtRarity
  readonly shadowPower: number
  readonly bloodPower: number
  readonly agility: number
  readonly description: string
  readonly abilities: string[]
}

export interface RtRavenInstance {
  readonly id: string
  speciesId: string
  name: string
  level: number
  xp: number
  shadowPower: number
  bloodPower: number
  agility: number
  loyalty: number
  hunger: number
  boundAt: number
}

export interface RtFloorDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly depth: number
  readonly dangerLevel: number
  readonly requiredTitle: RtTitleId
  readonly darkArt: RtDarkArt
  readonly bgGradient: string
  readonly ambientColor: string
}

export interface RtMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'shadow' | 'feather' | 'bone' | 'relic_shard' | 'essence'
  readonly rarity: RtRarity
  readonly shadowBonus: number
  readonly bloodBonus: number
  readonly value: number
  readonly description: string
}

export interface RtStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'raven_roost' | 'shadow_chamber' | 'blood_lab' | 'dark_altar' | 'relic_vault'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface RtStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  builtAt: number
}

export interface RtAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly darkArt: RtDarkArt
  readonly type: 'active' | 'passive'
  readonly rarity: RtRarity
  readonly energyCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface RtAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { gold: number; renown: number }
}

export interface RtTitleDef {
  readonly id: RtTitleId
  readonly name: string
  readonly emoji: string
  readonly minRenown: number
  readonly minRavens: number
  readonly description: string
}

export interface RtRelicDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: RtRarity
  readonly darkArt: RtDarkArt
  readonly shadowBoost: number
  readonly bloodBoost: number
  readonly agilityBoost: number
  readonly value: number
  readonly description: string
}

export interface RtEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface RtStoreState {
  ravens: RtRavenInstance[]
  floors: string[]
  materials: { materialId: string; count: number }[]
  structures: RtStructureInstance[]
  abilities: string[]
  achievements: string[]
  relics: string[]
  currentTitle: RtTitleId
  gold: number
  renown: number
  totalBound: number
  totalHarvested: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: RtEventDef | null
  eventTurnsRemaining: number
  activeFloor: string | null
}

export interface RtStoreActions {
  rtBindRaven: (speciesId: string) => boolean
  rtReleaseRaven: (ravenId: string) => boolean
  rtFeedRaven: (ravenId: string) => boolean
  rtHarvestFeather: (ravenId: string) => boolean
  rtBuildStructure: (structureDefId: string) => boolean
  rtUpgradeStructure: (structureId: string) => boolean
  rtExploreFloor: (floorId: string) => RtEventDef | null
  rtCollectRelic: (relicId: string) => boolean
  rtUnlockAbility: (abilityId: string) => boolean
  rtUnlockTitle: (titleId: RtTitleId) => boolean
  rtClaimAchievement: (achievementId: string) => boolean
  rtTradeMaterial: (materialId: string, count: number) => number
  rtEndEvent: () => void
  rtResetEvent: () => void
}

export interface RtFullStore extends RtStoreState, RtStoreActions {}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS (8 colors)
// ═══════════════════════════════════════════════════════════════════

export const RT_RAVEN_BLACK: string = '#1C1C1C'
export const RT_SHADOW_PURPLE: string = '#4A0E4E'
export const RT_MOONLIGHT_SILVER: string = '#C0C0C0'
export const RT_BLOOD_RED: string = '#8B0000'
export const RT_BONE_WHITE: string = '#FFFFF0'
export const RT_MIDNIGHT_BLUE: string = '#191970'
export const RT_DARK_GREEN: string = '#006400'
export const RT_GOTHIC_GOLD: string = '#8B6914'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: DARK ART DEFINITIONS (7 dark arts)
// ═══════════════════════════════════════════════════════════════════

export const RT_DARK_ARTS: readonly RtDarkArtDef[] = [
  {
    id: 'shadowmancy',
    name: 'Shadowmancy',
    color: RT_RAVEN_BLACK,
    description:
      'The art of bending shadows to your will. Shadowmancy ravens can slip between darkness and light, striking from unseen angles.',
  },
  {
    id: 'bloodmagic',
    name: 'Blood Magic',
    color: RT_BLOOD_RED,
    description:
      'Ancient and forbidden, blood magic ravens draw power from life essence itself. Their crimson feathers drip with dark vitality.',
  },
  {
    id: 'soulbinding',
    name: 'Soul Binding',
    color: RT_MOONLIGHT_SILVER,
    description:
      'Ravens that forge bonds between living souls and the ethereal realm. They channel spiritual energy through spectral chains.',
  },
  {
    id: 'cursecraft',
    name: 'Cursecraft',
    color: RT_SHADOW_PURPLE,
    description:
      'Masters of hexes and jinxes. Cursecraft ravens weave intricate patterns of misfortune around their targets.',
  },
  {
    id: 'necromancy',
    name: 'Necromancy',
    color: RT_DARK_GREEN,
    description:
      'Ravens that commune with the dead and command skeletal forces. They serve as messengers between the living and the departed.',
  },
  {
    id: 'darkalchemy',
    name: 'Dark Alchemy',
    color: RT_GOTHIC_GOLD,
    description:
      'Ravens versed in transmutation and forbidden elixirs. Their feathers shimmer with metallic, transformative energy.',
  },
  {
    id: 'voidweaving',
    name: 'Void Weaving',
    color: RT_MIDNIGHT_BLUE,
    description:
      'The rarest and most dangerous art. Voidweaving ravens can tear holes in reality itself, pulling power from the abyss.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: DARK ART SYNERGY TABLE
// ═══════════════════════════════════════════════════════════════════

const RT_SYNERGY_MAP: Record<RtDarkArt, RtDarkArt[]> = {
  shadowmancy: ['bloodmagic', 'soulbinding'],
  bloodmagic: ['necromancy', 'cursecraft'],
  soulbinding: ['voidweaving', 'shadowmancy'],
  cursecraft: ['shadowmancy', 'darkalchemy'],
  necromancy: ['bloodmagic', 'soulbinding'],
  darkalchemy: ['cursecraft', 'voidweaving'],
  voidweaving: ['soulbinding', 'darkalchemy'],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: RT_RAVENS — 35 Raven Species (5 per dark art, one each rarity)
// ═══════════════════════════════════════════════════════════════════

export const RT_RAVENS: readonly RtRavenSpecies[] = [
  // ── Shadowmancy Ravens (5) ─────────────────────────────────
  {
    id: 'shade_dusk_crow',
    name: 'Dusk Crow',
    darkArt: 'shadowmancy',
    rarity: 'common',
    shadowPower: 14,
    bloodPower: 6,
    agility: 20,
    description:
      'A common crow wrapped in twilight shadows. It can dim candles with a thought and blend into any darkness.',
    abilities: ['ab_shadow_glide'],
  },
  {
    id: 'shade_gloom_raven',
    name: 'Gloom Raven',
    darkArt: 'shadowmancy',
    rarity: 'uncommon',
    shadowPower: 28,
    bloodPower: 12,
    agility: 30,
    description:
      'A raven that radiates an aura of gloom. Its shadow extends far beyond its body, creating zones of blindness.',
    abilities: ['ab_shadow_glide', 'ab_gloom_aura'],
  },
  {
    id: 'shade_umbral_specter',
    name: 'Umbral Specter',
    darkArt: 'shadowmancy',
    rarity: 'rare',
    shadowPower: 50,
    bloodPower: 20,
    agility: 42,
    description:
      'A raven that exists primarily in shadow form. It can pass through solid walls when in total darkness.',
    abilities: ['ab_shadow_glide', 'ab_gloom_aura', 'ab_phase_shadow'],
  },
  {
    id: 'shade_eclipse_lord',
    name: 'Eclipse Lord',
    darkArt: 'shadowmancy',
    rarity: 'epic',
    shadowPower: 85,
    bloodPower: 35,
    agility: 55,
    description:
      'A massive raven that blots out the moon. When it spreads its wings, entire rooms fall into supernatural darkness.',
    abilities: ['ab_shadow_glide', 'ab_gloom_aura', 'ab_phase_shadow', 'ab_eclipse_wings'],
  },
  {
    id: 'shade_void_herald',
    name: 'Void Herald',
    darkArt: 'shadowmancy',
    rarity: 'legendary',
    shadowPower: 130,
    bloodPower: 55,
    agility: 70,
    description:
      'The ultimate shadow raven, herald of the void between worlds. It can consume light itself and create permanent shadows.',
    abilities: ['ab_shadow_glide', 'ab_gloom_aura', 'ab_phase_shadow', 'ab_eclipse_wings', 'ab_void_call'],
  },

  // ── Blood Magic Ravens (5) ────────────────────────────────
  {
    id: 'blood_crimson_spy',
    name: 'Crimson Spy',
    darkArt: 'bloodmagic',
    rarity: 'common',
    shadowPower: 8,
    bloodPower: 18,
    agility: 16,
    description:
      'A small blood-red raven that can taste fear in the air. It tracks prey by sensing their heartbeat.',
    abilities: ['ab_blood_sense'],
  },
  {
    id: 'blood_gore_talon',
    name: 'Gore Talon',
    darkArt: 'bloodmagic',
    rarity: 'uncommon',
    shadowPower: 15,
    bloodPower: 35,
    agility: 24,
    description:
      'A raven with talons stained permanently crimson. It draws strength from every wound it inflicts.',
    abilities: ['ab_blood_sense', 'ab_siphon_strike'],
  },
  {
    id: 'blood_hemomancer',
    name: 'Hemomancer Raven',
    darkArt: 'bloodmagic',
    rarity: 'rare',
    shadowPower: 25,
    bloodPower: 58,
    agility: 35,
    description:
      'A raven that can control blood itself, forming razor-sharp constructs from spilled life essence.',
    abilities: ['ab_blood_sense', 'ab_siphon_strike', 'ab_crimson_construct'],
  },
  {
    id: 'blood_sanguine_king',
    name: 'Sanguine King',
    darkArt: 'bloodmagic',
    rarity: 'epic',
    shadowPower: 40,
    bloodPower: 90,
    agility: 45,
    description:
      'A towering raven drenched in dark vitality. It can resurrect fallen allies by returning stolen blood.',
    abilities: ['ab_blood_sense', 'ab_siphon_strike', 'ab_crimson_construct', 'ab_blood_pact'],
  },
  {
    id: 'blood_carmine_god',
    name: 'Carmine God',
    darkArt: 'bloodmagic',
    rarity: 'legendary',
    shadowPower: 60,
    bloodPower: 140,
    agility: 58,
    description:
      'A god of blood in raven form. It controls every drop of blood within a mile radius, turning enemies against themselves.',
    abilities: ['ab_blood_sense', 'ab_siphon_strike', 'ab_crimson_construct', 'ab_blood_pact', 'ab_vitality_storm'],
  },

  // ── Soul Binding Ravens (5) ───────────────────────────────
  {
    id: 'soul_whisper_wraith',
    name: 'Whisper Wraith',
    darkArt: 'soulbinding',
    rarity: 'common',
    shadowPower: 10,
    bloodPower: 10,
    agility: 18,
    description:
      'A pale raven that carries whispers of the dead. It can relay messages between the living and departed.',
    abilities: ['ab_soul_whisper'],
  },
  {
    id: 'soul_ethereal_binder',
    name: 'Ethereal Binder',
    darkArt: 'soulbinding',
    rarity: 'uncommon',
    shadowPower: 18,
    bloodPower: 18,
    agility: 28,
    description:
      'A translucent raven that forges spectral chains between souls. Bound targets share their strength.',
    abilities: ['ab_soul_whisper', 'ab_spectral_chain'],
  },
  {
    id: 'soul_phantom_flock',
    name: 'Phantom Flock',
    darkArt: 'soulbinding',
    rarity: 'rare',
    shadowPower: 30,
    bloodPower: 30,
    agility: 40,
    description:
      'A raven that splits into a flock of phantom copies. Each phantom carries a fragment of a captured soul.',
    abilities: ['ab_soul_whisper', 'ab_spectral_chain', 'ab_phantom_split'],
  },
  {
    id: 'soul_spirit_sovereign',
    name: 'Spirit Sovereign',
    darkArt: 'soulbinding',
    rarity: 'epic',
    shadowPower: 48,
    bloodPower: 48,
    agility: 52,
    description:
      'A raven crowned with ethereal light. It commands an army of bound spirits that do its bidding without question.',
    abilities: ['ab_soul_whisper', 'ab_spectral_chain', 'ab_phantom_split', 'ab_spirit_army'],
  },
  {
    id: 'soul_anima_deity',
    name: 'Anima Deity',
    darkArt: 'soulbinding',
    rarity: 'legendary',
    shadowPower: 70,
    bloodPower: 70,
    agility: 65,
    description:
      'The deity of souls in raven form. It can bind entire armies of spirits, grant immortality, and sever souls from bodies.',
    abilities: ['ab_soul_whisper', 'ab_spectral_chain', 'ab_phantom_split', 'ab_spirit_army', 'ab_anima_eruption'],
  },

  // ── Cursecraft Ravens (5) ─────────────────────────────────
  {
    id: 'curse_hex_crow',
    name: 'Hex Crow',
    darkArt: 'cursecraft',
    rarity: 'common',
    shadowPower: 12,
    bloodPower: 8,
    agility: 22,
    description:
      'A crow that caws in patterns that carry minor hexes. Those who hear it suffer from bad luck for hours.',
    abilities: ['ab_minor_hex'],
  },
  {
    id: 'curse_jinx_raven',
    name: 'Jinx Raven',
    darkArt: 'cursecraft',
    rarity: 'uncommon',
    shadowPower: 24,
    bloodPower: 14,
    agility: 32,
    description:
      'A raven whose feathers are inscribed with curse sigils. It can lay persistent jinxes that follow targets.',
    abilities: ['ab_minor_hex', 'ab_persistent_jinx'],
  },
  {
    id: 'curse_bane_herald',
    name: 'Bane Herald',
    darkArt: 'cursecraft',
    rarity: 'rare',
    shadowPower: 42,
    bloodPower: 22,
    agility: 38,
    description:
      'A raven that announces doom wherever it lands. Its curses weaken defenses and drain magical energy.',
    abilities: ['ab_minor_hex', 'ab_persistent_jinx', 'ab_bane_mark'],
  },
  {
    id: 'curse_maledict_elder',
    name: 'Maledict Elder',
    darkArt: 'cursecraft',
    rarity: 'epic',
    shadowPower: 68,
    bloodPower: 32,
    agility: 48,
    description:
      'An ancient raven that has accumulated centuries of curse knowledge. Its gaze alone can seal magical abilities.',
    abilities: ['ab_minor_hex', 'ab_persistent_jinx', 'ab_bane_mark', 'ab_malison_gaze'],
  },
  {
    id: 'curse_doom_sovereign',
    name: 'Doom Sovereign',
    darkArt: 'cursecraft',
    rarity: 'legendary',
    shadowPower: 105,
    bloodPower: 50,
    agility: 62,
    description:
      'The supreme curse raven. Its voice carries a doom that cannot be lifted by any magic. Entire kingdoms have fallen to its caw.',
    abilities: ['ab_minor_hex', 'ab_persistent_jinx', 'ab_bane_mark', 'ab_malison_gaze', 'ab_apocalypse_hex'],
  },

  // ── Necromancy Ravens (5) ─────────────────────────────────
  {
    id: 'necro_bone_messenger',
    name: 'Bone Messenger',
    darkArt: 'necromancy',
    rarity: 'common',
    shadowPower: 10,
    bloodPower: 14,
    agility: 14,
    description:
      'A raven with bones visible through translucent flesh. It carries messages to and from the underworld.',
    abilities: ['ab_death_whisper'],
  },
  {
    id: 'necro_skeletal_flock',
    name: 'Skeletal Flock',
    darkArt: 'necromancy',
    rarity: 'uncommon',
    shadowPower: 20,
    bloodPower: 28,
    agility: 22,
    description:
      'A raven that commands a flock of skeletal bird constructs. The constructs fight relentlessly and feel no pain.',
    abilities: ['ab_death_whisper', 'ab_bone_summon'],
  },
  {
    id: 'necro_grave_caller',
    name: 'Grave Caller',
    darkArt: 'necromancy',
    rarity: 'rare',
    shadowPower: 35,
    bloodPower: 45,
    agility: 30,
    description:
      'A raven that can wake the dead from their graves. Its caw opens cracks in the earth from which skeletal hands emerge.',
    abilities: ['ab_death_whisper', 'ab_bone_summon', 'ab_grave_rise'],
  },
  {
    id: 'necro_lich_guardian',
    name: 'Lich Guardian',
    darkArt: 'necromancy',
    rarity: 'epic',
    shadowPower: 55,
    bloodPower: 72,
    agility: 40,
    description:
      'An immortal raven bound to undeath. It can absorb souls to heal itself and raise powerful undead servants.',
    abilities: ['ab_death_whisper', 'ab_bone_summon', 'ab_grave_rise', 'ab_soul_reap'],
  },
  {
    id: 'necro_death_lord',
    name: 'Death Lord Raven',
    darkArt: 'necromancy',
    rarity: 'legendary',
    shadowPower: 85,
    bloodPower: 110,
    agility: 52,
    description:
      'A raven that is death incarnate. Wherever it lands, the dead rise and the living wither. It cannot be truly destroyed.',
    abilities: ['ab_death_whisper', 'ab_bone_summon', 'ab_grave_rise', 'ab_soul_reap', 'ab_apotheosis'],
  },

  // ── Dark Alchemy Ravens (5) ───────────────────────────────
  {
    id: 'alch_gilded_scout',
    name: 'Gilded Scout',
    darkArt: 'darkalchemy',
    rarity: 'common',
    shadowPower: 8,
    bloodPower: 12,
    agility: 24,
    description:
      'A raven with metallic golden feathers. It can transmute small objects and detect precious metals underground.',
    abilities: ['ab_gold_sense'],
  },
  {
    id: 'alch_venom_brewer',
    name: 'Venom Brewer',
    darkArt: 'darkalchemy',
    rarity: 'uncommon',
    shadowPower: 16,
    bloodPower: 30,
    agility: 26,
    description:
      'A raven that secretes alchemical venom from its beak. It can brew deadly poisons from common ingredients.',
    abilities: ['ab_gold_sense', 'ab_venom_brew'],
  },
  {
    id: 'alch_transmute_sage',
    name: 'Transmute Sage',
    darkArt: 'darkalchemy',
    rarity: 'rare',
    shadowPower: 28,
    bloodPower: 48,
    agility: 36,
    description:
      'A raven sage that can transmute matter on a larger scale. It turns lead to gold and enemies to stone.',
    abilities: ['ab_gold_sense', 'ab_venom_brew', 'ab_matter_shift'],
  },
  {
    id: 'alch_elixir_archon',
    name: 'Elixir Archon',
    darkArt: 'darkalchemy',
    rarity: 'epic',
    shadowPower: 42,
    bloodPower: 75,
    agility: 44,
    description:
      'A raven that brews elixirs of immense power. It can grant temporary invincibility or transmute entire rooms.',
    abilities: ['ab_gold_sense', 'ab_venom_brew', 'ab_matter_shift', 'ab_elixir_rain'],
  },
  {
    id: 'alch_philosopher_bird',
    name: 'Philosopher Bird',
    darkArt: 'darkalchemy',
    rarity: 'legendary',
    shadowPower: 65,
    bloodPower: 115,
    agility: 55,
    description:
      'The legendary Philosopher Bird said to possess the secret of immortality. Its tears can resurrect the dead and grant eternal life.',
    abilities: ['ab_gold_sense', 'ab_venom_brew', 'ab_matter_shift', 'ab_elixir_rain', 'ab_immortal_transmute'],
  },

  // ── Void Weaving Ravens (5) ───────────────────────────────
  {
    id: 'void_rift_scout',
    name: 'Rift Scout',
    darkArt: 'voidweaving',
    rarity: 'common',
    shadowPower: 16,
    bloodPower: 8,
    agility: 18,
    description:
      'A raven with eyes that peer into the void. It can create tiny tears in space to store small objects.',
    abilities: ['ab_rift_glimpse'],
  },
  {
    id: 'void_abyss_glider',
    name: 'Abyss Glider',
    darkArt: 'voidweaving',
    rarity: 'uncommon',
    shadowPower: 30,
    bloodPower: 16,
    agility: 34,
    description:
      'A raven that glides through tears in reality. It can teleport short distances and pull objects through void rifts.',
    abilities: ['ab_rift_glimpse', 'ab_void_step'],
  },
  {
    id: 'void_nexus_weaver',
    name: 'Nexus Weaver',
    darkArt: 'voidweaving',
    rarity: 'rare',
    shadowPower: 52,
    bloodPower: 26,
    agility: 42,
    description:
      'A raven that weaves nexus points between realities. It can create stable portals and summon creatures from the abyss.',
    abilities: ['ab_rift_glimpse', 'ab_void_step', 'ab_nexus_portal'],
  },
  {
    id: 'void_dimension_lord',
    name: 'Dimension Lord',
    darkArt: 'voidweaving',
    rarity: 'epic',
    shadowPower: 78,
    bloodPower: 40,
    agility: 50,
    description:
      'A raven that rules a pocket dimension of pure void. It can banish enemies to its domain and trap them forever.',
    abilities: ['ab_rift_glimpse', 'ab_void_step', 'ab_nexus_portal', 'ab_dimensional_banish'],
  },
  {
    id: 'void_abyss_god',
    name: 'Abyss God Raven',
    darkArt: 'voidweaving',
    rarity: 'legendary',
    shadowPower: 120,
    bloodPower: 60,
    agility: 64,
    description:
      'The god of the abyss in raven form. It can unmake reality itself, opening gates to the infinite void that consumes all.',
    abilities: ['ab_rift_glimpse', 'ab_void_step', 'ab_nexus_portal', 'ab_dimensional_banish', 'ab_abyss_unmake'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: RT_FLOORS — 8 Tower Floors
// ═══════════════════════════════════════════════════════════════════

export const RT_FLOORS: readonly RtFloorDef[] = [
  {
    id: 'floor_crypt_entrance',
    name: 'Crypt Entrance',
    description:
      'The crumbling entrance to the Raven Tower. Weakened wards allow passage to the curious and the bold. Common ravens gather here.',
    depth: 0,
    dangerLevel: 1,
    requiredTitle: 'title_raven_fledgling',
    darkArt: 'shadowmancy',
    bgGradient: 'linear-gradient(180deg, #1C1C1C 0%, #4A0E4E 50%, #191970 100%)',
    ambientColor: RT_RAVEN_BLACK,
  },
  {
    id: 'floor_blood_cellar',
    name: 'Blood Cellar',
    description:
      'A damp cellar stained with centuries of dark rituals. Blood magic ravens are drawn to the copper scent that permeates the stone.',
    depth: 1,
    dangerLevel: 2,
    requiredTitle: 'title_raven_fledgling',
    darkArt: 'bloodmagic',
    bgGradient: 'linear-gradient(180deg, #8B0000 0%, #1C1C1C 50%, #4A0E4E 100%)',
    ambientColor: RT_BLOOD_RED,
  },
  {
    id: 'floor_soul_gallery',
    name: 'Soul Gallery',
    description:
      'A vast hall lined with portraits whose eyes follow visitors. The trapped spirits whisper secrets to soulbinding ravens.',
    depth: 2,
    dangerLevel: 3,
    requiredTitle: 'title_shadow_apprentice',
    darkArt: 'soulbinding',
    bgGradient: 'linear-gradient(180deg, #C0C0C0 0%, #1C1C1C 50%, #4A0E4E 100%)',
    ambientColor: RT_MOONLIGHT_SILVER,
  },
  {
    id: 'floor_curse_vault',
    name: 'Curse Vault',
    description:
      'A sealed vault where the tower\'s most dangerous curses are stored. The air crackles with malevolent energy.',
    depth: 3,
    dangerLevel: 4,
    requiredTitle: 'title_dark_flockmaster',
    darkArt: 'cursecraft',
    bgGradient: 'linear-gradient(180deg, #4A0E4E 0%, #8B0000 50%, #1C1C1C 100%)',
    ambientColor: RT_SHADOW_PURPLE,
  },
  {
    id: 'floor_necropolis',
    name: 'Necropolis',
    description:
      'An indoor graveyard where the tower\'s necromancers buried their experiments. Undead roam freely among the tombstones.',
    depth: 4,
    dangerLevel: 5,
    requiredTitle: 'title_curse_weaver',
    darkArt: 'necromancy',
    bgGradient: 'linear-gradient(180deg, #006400 0%, #1C1C1C 50%, #8B0000 100%)',
    ambientColor: RT_DARK_GREEN,
  },
  {
    id: 'floor_alchemy_spire',
    name: 'Alchemy Spire',
    description:
      'A soaring spire filled with bubbling cauldrons and transmutation circles. Dark alchemy ravens conduct forbidden experiments here.',
    depth: 5,
    dangerLevel: 6,
    requiredTitle: 'title_tower_keeper',
    darkArt: 'darkalchemy',
    bgGradient: 'linear-gradient(180deg, #8B6914 0%, #006400 50%, #1C1C1C 100%)',
    ambientColor: RT_GOTHIC_GOLD,
  },
  {
    id: 'floor_void_sanctum',
    name: 'Void Sanctum',
    description:
      'A chamber where reality itself is thin. Void rifts shimmer in the corners, and abyssal whispers fill the air.',
    depth: 6,
    dangerLevel: 7,
    requiredTitle: 'title_soul_archon',
    darkArt: 'voidweaving',
    bgGradient: 'linear-gradient(180deg, #191970 0%, #4A0E4E 50%, #C0C0C0 100%)',
    ambientColor: RT_MIDNIGHT_BLUE,
  },
  {
    id: 'floor_tower_throne',
    name: 'Tower Throne',
    description:
      'The pinnacle of the Raven Tower. All dark arts converge here, and the Tower Deity holds court over the abyss.',
    depth: 7,
    dangerLevel: 8,
    requiredTitle: 'title_abyss_lord',
    darkArt: 'shadowmancy',
    bgGradient: 'linear-gradient(180deg, #8B6914 0%, #4A0E4E 50%, #191970 100%)',
    ambientColor: RT_GOTHIC_GOLD,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: RT_MATERIALS — 30 Shadow/Feather/Bone Materials
// ═══════════════════════════════════════════════════════════════════

export const RT_MATERIALS: readonly RtMaterialDef[] = [
  // Common (8)
  { id: 'mat_dusk_feather', name: 'Dusk Feather', emoji: '🪶', type: 'feather', rarity: 'common', shadowBonus: 2, bloodBonus: 1, value: 10, description: 'A feather shed by a dusk crow at twilight. It fades between light and dark.' },
  { id: 'mat_shadow_essence', name: 'Shadow Essence', emoji: '💧', type: 'shadow', rarity: 'common', shadowBonus: 5, bloodBonus: 0, value: 15, description: 'Bottled essence of pure shadow, harvested from dark corners of the tower.' },
  { id: 'mat_bone_shard', name: 'Bone Shard', emoji: '🦴', type: 'bone', rarity: 'common', shadowBonus: 1, bloodBonus: 3, value: 12, description: 'A small shard of bone from an animated skeleton. Still faintly warm.' },
  { id: 'mat_crimson_drop', name: 'Crimson Drop', emoji: '🩸', type: 'essence', rarity: 'common', shadowBonus: 0, bloodBonus: 5, value: 18, description: 'A drop of blood-infused essence that pulses with dark vitality.' },
  { id: 'mat_crow_quill', name: 'Crow Quill', emoji: '✒️', type: 'feather', rarity: 'common', shadowBonus: 3, bloodBonus: 2, value: 14, description: 'A jet-black quill from a common crow. Useful for writing curse sigils.' },
  { id: 'mat_soul_thread', name: 'Soul Thread', emoji: '🧵', type: 'relic_shard', rarity: 'common', shadowBonus: 4, bloodBonus: 2, value: 16, description: 'A gossamer thread of soul energy. It hums faintly when touched.' },
  { id: 'mat_ash_claw', name: 'Ash Claw', emoji: '🦅', type: 'bone', rarity: 'common', shadowBonus: 2, bloodBonus: 2, value: 12, description: 'A claw that crumbles to ash when squeezed. Undead ravens drop these.' },
  { id: 'mat_raven_eye', name: 'Raven Eye', emoji: '👁️', type: 'shadow', rarity: 'common', shadowBonus: 6, bloodBonus: 0, value: 20, description: 'A preserved raven eye that still sees into the spirit world.' },

  // Uncommon (7)
  { id: 'mat_gloom_plume', name: 'Gloom Plume', emoji: '🪶', type: 'feather', rarity: 'uncommon', shadowBonus: 12, bloodBonus: 4, value: 80, description: 'A feather that radiates an aura of gloom. Shadowmancers prize these.' },
  { id: 'mat_blood_vial', name: 'Enchanted Blood Vial', emoji: '🧪', type: 'essence', rarity: 'uncommon', shadowBonus: 5, bloodBonus: 15, value: 90, description: 'A vial of blood that glows red in the dark. It amplifies blood magic rituals.' },
  { id: 'mat_spectral_bone', name: 'Spectral Bone', emoji: '💀', type: 'bone', rarity: 'uncommon', shadowBonus: 8, bloodBonus: 10, value: 75, description: 'A translucent bone from a ghost raven. It phases in and out of visibility.' },
  { id: 'mat_hex_crystal', name: 'Hex Crystal', emoji: '🔮', type: 'relic_shard', rarity: 'uncommon', shadowBonus: 10, bloodBonus: 6, value: 85, description: 'A crystal formed from concentrated curse energy. It vibrates with malice.' },
  { id: 'mat_grave_dust', name: 'Grave Dust', emoji: '🌾', type: 'shadow', rarity: 'uncommon', shadowBonus: 14, bloodBonus: 3, value: 70, description: 'Dust gathered from the Necropolis floor. Necromancers use it to raise the dead.' },
  { id: 'mat_alchemy_feather', name: 'Gilded Alchemy Feather', emoji: '✨', type: 'feather', rarity: 'uncommon', shadowBonus: 6, bloodBonus: 12, value: 82, description: 'A feather with a metallic golden sheen. It transmutes anything it touches.' },
  { id: 'mat_rift_shard', name: 'Rift Shard', emoji: '💠', type: 'relic_shard', rarity: 'uncommon', shadowBonus: 15, bloodBonus: 5, value: 88, description: 'A shard of reality torn from a void rift. It hums with dimensional energy.' },

  // Rare (6)
  { id: 'mat_eclipse_feather', name: 'Eclipse Feather', emoji: '🌑', type: 'feather', rarity: 'rare', shadowBonus: 25, bloodBonus: 12, value: 350, description: 'A feather that absorbs all light. Eclipse ravens shed only one per century.' },
  { id: 'mat_sanguine_heart', name: 'Sanguine Heart', emoji: '❤️‍🔥', type: 'essence', rarity: 'rare', shadowBonus: 10, bloodBonus: 30, value: 400, description: 'The still-beating heart of a blood magic construct. It pumps dark blood endlessly.' },
  { id: 'mat_soul_crystal', name: 'Soul Crystal', emoji: '💎', type: 'relic_shard', rarity: 'rare', shadowBonus: 20, bloodBonus: 18, value: 380, description: 'A crystal containing a trapped soul. The soul whispers prophecies from within.' },
  { id: 'mat_curse_totem', name: 'Curse Totem', emoji: '🗿', type: 'bone', rarity: 'rare', shadowBonus: 28, bloodBonus: 15, value: 360, description: 'A bone totem carved with ancient curse sigils. It radiates waves of misfortune.' },
  { id: 'mat_lich_phylactery', name: 'Lich Phylactery Shard', emoji: '⚱️', type: 'relic_shard', rarity: 'rare', shadowBonus: 22, bloodBonus: 22, value: 420, description: 'A fragment of a lich\'s phylactery. It pulses with unholy necromantic energy.' },
  { id: 'mat_void_pearl', name: 'Void Pearl', emoji: '🔮', type: 'shadow', rarity: 'rare', shadowBonus: 30, bloodBonus: 10, value: 390, description: 'A pearl formed in the abyss between dimensions. Staring into it reveals other worlds.' },

  // Epic (5)
  { id: 'mat_void_herald_feather', name: 'Void Herald Plume', emoji: '🪶', type: 'feather', rarity: 'epic', shadowBonus: 45, bloodBonus: 25, value: 1500, description: 'A massive plume from a Void Herald raven. It contains a fragment of the void itself.' },
  { id: 'mat_carmine_blood', name: 'Carmine God Essence', emoji: '🍷', type: 'essence', rarity: 'epic', shadowBonus: 20, bloodBonus: 55, value: 1800, description: 'Essence of divine blood magic. A single drop can resurrect the recently dead.' },
  { id: 'mat_anima_shard', name: 'Anima Shard', emoji: '🌟', type: 'relic_shard', rarity: 'epic', shadowBonus: 35, bloodBonus: 35, value: 1700, description: 'A shard of pure anima energy from the Soul Sovereign. It can bind any soul.' },
  { id: 'mat_doom_sigil', name: 'Doom Sovereign Sigil', emoji: '☠️', type: 'bone', rarity: 'epic', shadowBonus: 50, bloodBonus: 20, value: 1600, description: 'A sigil bearing the mark of the Doom Sovereign. It curses all who touch it.' },
  { id: 'mat_philosopher_tear', name: 'Philosopher Bird Tear', emoji: '💧', type: 'essence', rarity: 'epic', shadowBonus: 25, bloodBonus: 40, value: 1900, description: 'A tear from the Philosopher Bird. It can transmute lead to gold and grant visions.' },

  // Legendary (4)
  { id: 'mat_tower_deity_plume', name: 'Tower Deity Plume', emoji: '👑', type: 'feather', rarity: 'legendary', shadowBonus: 60, bloodBonus: 60, value: 8000, description: 'The supreme feather of the Tower Deity. It commands all dark arts and bends reality.' },
  { id: 'mat_abyss_core', name: 'Abyss Core', emoji: '🕳️', type: 'shadow', rarity: 'legendary', shadowBonus: 80, bloodBonus: 40, value: 10000, description: 'A crystallized fragment of the abyss itself. It contains infinite void energy.' },
  { id: 'mat_death_lord_skull', name: 'Death Lord Skull', emoji: '💀', type: 'bone', rarity: 'legendary', shadowBonus: 50, bloodBonus: 70, value: 9000, description: 'The skull of the Death Lord raven. It still speaks prophecies of doom.' },
  { id: 'mat_immortal_elixir', name: 'Immortal Elixir', emoji: '⚗️', type: 'essence', rarity: 'legendary', shadowBonus: 40, bloodBonus: 50, value: 12000, description: 'The legendary elixir of immortality. One sip grants eternal life and mastery of all arts.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: RT_STRUCTURES — 25 Tower Structures (upgradeable to L10)
// ═══════════════════════════════════════════════════════════════════

export const RT_STRUCTURES: readonly RtStructureDef[] = [
  // ── Raven Roosts (7) ───────────────────────────────────────
  { id: 'str_shadow_roost', name: 'Shadow Roost', emoji: '🏚️', category: 'raven_roost', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4, description: 'A darkened roost where shadowmancy ravens rest and regenerate their dark power.' },
  { id: 'str_blood_perch', name: 'Blood Perch', emoji: '🩸', category: 'raven_roost', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 80, costMultiplier: 1.5, description: 'A perch stained with ritual blood that empowers blood magic ravens.' },
  { id: 'str_soul_nest', name: 'Soul Nest', emoji: '👻', category: 'raven_roost', maxLevel: 10, baseEffect: 3, effectPerLevel: 2, baseCost: 100, costMultiplier: 1.5, description: 'A nest woven from spectral threads where soulbinding ravens commune with spirits.' },
  { id: 'str_hex_eyrie', name: 'Hex Eyrie', emoji: '🔮', category: 'raven_roost', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.5, description: 'A cursed eyrie high in the tower where cursecraft ravens sharpen their hexes.' },
  { id: 'str_bone_aerie', name: 'Bone Aerie', emoji: '☠️', category: 'raven_roost', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 140, costMultiplier: 1.6, description: 'An aerie built from bones of the dead where necromancy ravens command skeletal flocks.' },
  { id: 'str_gilded_cage', name: 'Gilded Cage', emoji: '⚙️', category: 'raven_roost', maxLevel: 10, baseEffect: 3, effectPerLevel: 2, baseCost: 110, costMultiplier: 1.5, description: 'A golden cage where dark alchemy ravens brew their transmutative concoctions.' },
  { id: 'str_void_perch', name: 'Void Perch', emoji: '🌀', category: 'raven_roost', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 180, costMultiplier: 1.6, description: 'A perch that hovers in a void rift where voidweaving ravens draw abyssal power.' },

  // ── Shadow Chambers (6) ────────────────────────────────────
  { id: 'str_dusk_room', name: 'Dusk Chamber', emoji: '🌑', category: 'shadow_chamber', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, description: 'A chamber of eternal dusk that strengthens shadowmancy abilities and heals shadow ravens.' },
  { id: 'str_blood_sanctum', name: 'Blood Sanctum', emoji: '🩸', category: 'shadow_chamber', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 250, costMultiplier: 1.6, description: 'A sanctum where blood rituals amplify the power of all blood magic in the tower.' },
  { id: 'str_spirit_vault', name: 'Spirit Vault', emoji: '👻', category: 'shadow_chamber', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 400, costMultiplier: 1.7, description: 'A vault containing bound spirits that boost soulbinding power and provide spectral scouts.' },
  { id: 'str_curse_library', name: 'Curse Library', emoji: '📜', category: 'shadow_chamber', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 600, costMultiplier: 1.8, description: 'A library of forbidden curse tomes that enhances cursecraft abilities and unlocks new hex patterns.' },
  { id: 'str_death_hall', name: 'Hall of the Dead', emoji: '⚰️', category: 'shadow_chamber', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 900, costMultiplier: 1.9, description: 'A hall lined with sarcophagi that empowers necromancy and provides a steady supply of undead servants.' },
  { id: 'str_void_observatory', name: 'Void Observatory', emoji: '🔭', category: 'shadow_chamber', maxLevel: 10, baseEffect: 14, effectPerLevel: 7, baseCost: 850, costMultiplier: 1.9, description: 'An observatory that peers into the void. It reveals secrets of other dimensions and empowers voidweaving.' },

  // ── Blood Labs (5) ─────────────────────────────────────────
  { id: 'str_basic_lab', name: 'Basic Blood Lab', emoji: '🧪', category: 'blood_lab', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 120, costMultiplier: 1.5, description: 'A simple laboratory for extracting and refining basic dark essences from materials.' },
  { id: 'str_alchemy_bench', name: 'Dark Alchemy Bench', emoji: '⚗️', category: 'blood_lab', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.6, description: 'An advanced bench for combining dark materials into powerful elixirs and poisons.' },
  { id: 'str_soul_extractor', name: 'Soul Extractor', emoji: '🔬', category: 'blood_lab', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 500, costMultiplier: 1.7, description: 'A device that extracts soul energy from defeated enemies and stores it for later use.' },
  { id: 'str_curse_forge', name: 'Curse Forge', emoji: '🔨', category: 'blood_lab', maxLevel: 10, baseEffect: 20, effectPerLevel: 10, baseCost: 800, costMultiplier: 1.8, description: 'A forge that shapes curse energy into physical weapons and totems of immense power.' },
  { id: 'str_abyss_crucible', name: 'Abyss Crucible', emoji: '🌋', category: 'blood_lab', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1200, costMultiplier: 2.0, description: 'The ultimate creation tool. It can synthesize legendary materials from abyssal energy and raw components.' },

  // ── Dark Altars (4) ────────────────────────────────────────
  { id: 'str_shadow_altar', name: 'Shadow Altar', emoji: '🕯️', category: 'dark_altar', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 200, costMultiplier: 1.5, description: 'An altar of black stone that amplifies shadowmancy rituals and dark ceremonies.' },
  { id: 'str_blood_altar', name: 'Blood Sacrifice Altar', emoji: '⛧', category: 'dark_altar', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 450, costMultiplier: 1.7, description: 'An altar stained with ancient blood offerings. It powers blood magic and grants dark boons.' },
  { id: 'str_soul_altar', name: 'Soul Binding Altar', emoji: '⛓️', category: 'dark_altar', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 700, costMultiplier: 1.8, description: 'A massive altar ringed with soul chains. It binds powerful entities and grants dominion over spirits.' },
  { id: 'str_void_altar', name: 'Abyss Gateway Altar', emoji: '🌀', category: 'dark_altar', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1500, costMultiplier: 2.0, description: 'The supreme altar. It opens a gateway to the abyss, granting access to limitless dark power.' },

  // ── Relic Vaults (3) ───────────────────────────────────────
  { id: 'str_relic_display', name: 'Relic Display Case', emoji: '🖼️', category: 'relic_vault', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.5, description: 'A cursed display case that amplifies the passive effects of stored dark relics.' },
  { id: 'str_sacred_vault', name: 'Cursed Relic Vault', emoji: '🔒', category: 'relic_vault', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 600, costMultiplier: 1.7, description: 'A magically sealed vault preserved by dark enchantments. It protects and enhances relic power.' },
  { id: 'str_abyss_shrine', name: 'Abyss Shrine', emoji: '🗡️', category: 'relic_vault', maxLevel: 10, baseEffect: 30, effectPerLevel: 15, baseCost: 2000, costMultiplier: 2.0, description: 'A shrine to the abyss that can restore, upgrade, and even evolve legendary relics placed within.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: RT_ABILITIES — 22 Raven Abilities
// ═══════════════════════════════════════════════════════════════════

export const RT_ABILITIES: readonly RtAbilityDef[] = [
  { id: 'ab_shadow_glide', name: 'Shadow Glide', emoji: '🌑', darkArt: 'shadowmancy', type: 'active', rarity: 'common', energyCost: 5, cooldown: 30, power: 15, description: 'Glide through shadows, becoming invisible to enemies for a short duration.' },
  { id: 'ab_blood_sense', name: 'Blood Sense', emoji: '🩸', darkArt: 'bloodmagic', type: 'active', rarity: 'common', energyCost: 6, cooldown: 35, power: 18, description: 'Sense the heartbeat and location of all living creatures within range.' },
  { id: 'ab_soul_whisper', name: 'Soul Whisper', emoji: '👻', darkArt: 'soulbinding', type: 'active', rarity: 'common', energyCost: 7, cooldown: 40, power: 12, description: 'Whisper to spirits, gaining information and temporary spectral protection.' },
  { id: 'ab_minor_hex', name: 'Minor Hex', emoji: '🔮', darkArt: 'cursecraft', type: 'active', rarity: 'common', energyCost: 8, cooldown: 45, power: 20, description: 'Place a minor hex on a target, reducing their luck and combat effectiveness.' },
  { id: 'ab_death_whisper', name: 'Death Whisper', emoji: '💀', darkArt: 'necromancy', type: 'active', rarity: 'common', energyCost: 10, cooldown: 50, power: 14, description: 'Whisper to the dead, raising skeletal birds that fight alongside your flock.' },
  { id: 'ab_gold_sense', name: 'Gold Sense', emoji: '✨', darkArt: 'darkalchemy', type: 'active', rarity: 'common', energyCost: 5, cooldown: 25, power: 10, description: 'Detect precious metals and hidden treasures within the tower walls.' },
  { id: 'ab_rift_glimpse', name: 'Rift Glimpse', emoji: '🌀', darkArt: 'voidweaving', type: 'active', rarity: 'common', energyCost: 8, cooldown: 40, power: 16, description: 'Glimpse through a void rift to see hidden areas and detect invisible threats.' },
  { id: 'ab_gloom_aura', name: 'Gloom Aura', emoji: '🌫️', darkArt: 'shadowmancy', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 28, description: 'Emit an aura of supernatural gloom that blinds enemies and weakens light-based magic.' },
  { id: 'ab_siphon_strike', name: 'Siphon Strike', emoji: '💉', darkArt: 'bloodmagic', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 70, power: 32, description: 'Strike with blood-soaked talons that drain life force from the target.' },
  { id: 'ab_spectral_chain', name: 'Spectral Chain', emoji: '⛓️', darkArt: 'soulbinding', type: 'active', rarity: 'uncommon', energyCost: 16, cooldown: 65, power: 25, description: 'Forge spectral chains that bind a target\'s soul, preventing escape and reducing power.' },
  { id: 'ab_persistent_jinx', name: 'Persistent Jinx', emoji: '💫', darkArt: 'cursecraft', type: 'active', rarity: 'uncommon', energyCost: 20, cooldown: 80, power: 30, description: 'Place a persistent jinx that follows the target, causing escalating bad fortune.' },
  { id: 'ab_bone_summon', name: 'Bone Summon', emoji: '🦴', darkArt: 'necromancy', type: 'active', rarity: 'uncommon', energyCost: 22, cooldown: 90, power: 28, description: 'Summon skeletal constructs from nearby remains to fight as temporary allies.' },
  { id: 'ab_venom_brew', name: 'Venom Brew', emoji: '🧪', darkArt: 'darkalchemy', type: 'active', rarity: 'uncommon', energyCost: 14, cooldown: 55, power: 26, description: 'Brew a potent venom from gathered materials that can be applied to weapons or traps.' },
  { id: 'ab_void_step', name: 'Void Step', emoji: '🌀', darkArt: 'voidweaving', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 75, power: 30, description: 'Step through a void rift to teleport a short distance, bypassing obstacles and enemies.' },
  { id: 'ab_phase_shadow', name: 'Phase Shadow', emoji: '👤', darkArt: 'shadowmancy', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 120, power: 48, description: 'Phase completely into shadow form, becoming intangible and able to pass through solid matter.' },
  { id: 'ab_crimson_construct', name: 'Crimson Construct', emoji: '🗿', darkArt: 'bloodmagic', type: 'active', rarity: 'rare', energyCost: 32, cooldown: 130, power: 52, description: 'Form a construct from hardened blood that fights autonomously and explodes on destruction.' },
  { id: 'ab_phantom_split', name: 'Phantom Split', emoji: '👥', darkArt: 'soulbinding', type: 'active', rarity: 'rare', energyCost: 25, cooldown: 110, power: 42, description: 'Split into multiple phantom copies that confuse enemies and attack simultaneously.' },
  { id: 'ab_bane_mark', name: 'Bane Mark', emoji: '☠️', darkArt: 'cursecraft', type: 'active', rarity: 'rare', energyCost: 30, cooldown: 120, power: 50, description: 'Mark a target with an ancient bane that amplifies all future curses and drains their magic.' },
  { id: 'ab_grave_rise', name: 'Grave Rise', emoji: '⚰️', darkArt: 'necromancy', type: 'active', rarity: 'rare', energyCost: 35, cooldown: 140, power: 55, description: 'Raise a powerful undead servant from a nearby grave that persists until destroyed.' },
  { id: 'ab_matter_shift', name: 'Matter Shift', emoji: '⚗️', darkArt: 'darkalchemy', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 115, power: 45, description: 'Transmute matter in the environment, turning walls to glass or enemies to stone temporarily.' },
  { id: 'ab_eclipse_wings', name: 'Eclipse Wings', emoji: '🌑', darkArt: 'shadowmancy', type: 'active', rarity: 'epic', energyCost: 45, cooldown: 240, power: 78, description: 'Spread wings of pure darkness that blot out all light in a massive area, empowering all shadow allies.' },
  { id: 'ab_nexus_portal', name: 'Nexus Portal', emoji: '🌀', darkArt: 'voidweaving', type: 'active', rarity: 'epic', energyCost: 50, cooldown: 300, power: 85, description: 'Open a stable nexus portal that allows travel between two points and summons abyssal creatures.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: RT_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const RT_ACHIEVEMENTS: readonly RtAchievementDef[] = [
  { id: 'ach_first_bind', name: 'First Binding', emoji: '🦅', description: 'Bind your first raven to the tower.', condition: 'bind_1', reward: { gold: 50, renown: 10 } },
  { id: 'ach_five_bound', name: 'Flock Forming', emoji: '🐦‍⬛', description: 'Bind 5 different ravens.', condition: 'bind_5', reward: { gold: 200, renown: 40 } },
  { id: 'ach_first_harvest', name: 'Feather Collector', emoji: '🪶', description: 'Harvest feathers for the first time.', condition: 'harvest_1', reward: { gold: 80, renown: 15 } },
  { id: 'ach_ten_harvests', name: 'Master Plucker', emoji: '🧵', description: 'Harvest materials 10 times.', condition: 'harvest_10', reward: { gold: 300, renown: 60 } },
  { id: 'ach_first_build', name: 'Dark Foundation', emoji: '🏗️', description: 'Build your first tower structure.', condition: 'build_1', reward: { gold: 100, renown: 20 } },
  { id: 'ach_five_builds', name: 'Tower Architect', emoji: '🏚️', description: 'Build 5 different tower structures.', condition: 'build_5', reward: { gold: 500, renown: 80 } },
  { id: 'ach_floor_explore', name: 'Floor Explorer', emoji: '🗺️', description: 'Explore 4 different tower floors.', condition: 'floor_4', reward: { gold: 400, renown: 50 } },
  { id: 'ach_all_floors', name: 'Tower Cartographer', emoji: '🏰', description: 'Explore all 8 tower floors.', condition: 'floor_8', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_rare_bind', name: 'Rare Catch', emoji: '💎', description: 'Bind a rare raven.', condition: 'rare_bind', reward: { gold: 500, renown: 100 } },
  { id: 'ach_epic_bind', name: 'Epic Discovery', emoji: '🌟', description: 'Bind an epic raven.', condition: 'epic_bind', reward: { gold: 1500, renown: 250 } },
  { id: 'ach_legendary_bind', name: 'Legendary Binder', emoji: '👑', description: 'Bind a legendary raven.', condition: 'legendary_bind', reward: { gold: 5000, renown: 500 } },
  { id: 'ach_first_relic', name: 'Relic Finder', emoji: '🏺', description: 'Discover your first dark relic.', condition: 'relic_1', reward: { gold: 300, renown: 60 } },
  { id: 'ach_five_relics', name: 'Relic Hunter', emoji: '🔍', description: 'Collect 5 different relics.', condition: 'relic_5', reward: { gold: 1000, renown: 150 } },
  { id: 'ach_first_event', name: 'Event Survivor', emoji: '⚡', description: 'Survive your first tower event.', condition: 'event_1', reward: { gold: 200, renown: 30 } },
  { id: 'ach_ten_events', name: 'Event Veteran', emoji: '🏅', description: 'Survive 10 tower events.', condition: 'event_10', reward: { gold: 800, renown: 120 } },
  { id: 'ach_upgrade_max', name: 'Master Builder', emoji: '🔨', description: 'Upgrade any structure to level 10.', condition: 'upgrade_10', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_all_arts', name: 'Dark Art Master', emoji: '🌈', description: 'Bind at least one raven of each dark art.', condition: 'all_arts', reward: { gold: 3000, renown: 300 } },
  { id: 'ach_max_title', name: 'Tower Deity', emoji: '👑', description: 'Reach the title of Tower Deity.', condition: 'max_title', reward: { gold: 10000, renown: 1000 } },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: RT_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const RT_TITLES: readonly RtTitleDef[] = [
  { id: 'title_raven_fledgling', name: 'Raven Fledgling', emoji: '🐣', minRenown: 0, minRavens: 0, description: 'A novice who has just begun their journey into the dark arts of the Raven Tower.' },
  { id: 'title_shadow_apprentice', name: 'Shadow Apprentice', emoji: '🌑', minRenown: 50, minRavens: 3, description: 'An apprentice who can bind common ravens and perform basic shadow rituals.' },
  { id: 'title_dark_flockmaster', name: 'Dark Flockmaster', emoji: '🐦‍⬛', minRenown: 200, minRavens: 7, description: 'A skilled master of a growing dark flock. The ravens obey without question.' },
  { id: 'title_curse_weaver', name: 'Curse Weaver', emoji: '🔮', minRenown: 500, minRavens: 12, description: 'A powerful weaver of curses whose hexes are feared throughout the tower.' },
  { id: 'title_tower_keeper', name: 'Tower Keeper', emoji: '🏚️', minRenown: 1200, minRavens: 18, description: 'A keeper of the tower\'s deepest secrets, entrusted with guarding its forbidden floors.' },
  { id: 'title_soul_archon', name: 'Soul Archon', emoji: '👻', minRenown: 2500, minRavens: 24, description: 'An archon who commands souls and bends spirits to their iron will.' },
  { id: 'title_abyss_lord', name: 'Abyss Lord', emoji: '🌀', minRenown: 5000, minRavens: 30, description: 'A lord of the abyss who commands the void and all its terrible inhabitants.' },
  { id: 'title_tower_deity', name: 'Tower Deity', emoji: '👑', minRenown: 10000, minRavens: 35, description: 'The supreme Tower Deity, master of all dark arts and sovereign of the Raven Tower.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: RT_RELICS — 15 Legendary Dark Relics
// ═══════════════════════════════════════════════════════════════════

export const RT_RELICS: readonly RtRelicDef[] = [
  { id: 'relic_shadow_crown', name: 'Crown of Shadows', emoji: '👑', rarity: 'epic', darkArt: 'shadowmancy', shadowBoost: 20, bloodBoost: 15, agilityBoost: 10, value: 2000, description: 'A crown woven from living shadows. It grants dominion over all darkness in the tower.' },
  { id: 'relic_blood_chalice', name: 'Blood Chalice', emoji: '🍷', rarity: 'epic', darkArt: 'bloodmagic', shadowBoost: 10, bloodBoost: 35, agilityBoost: 5, value: 2200, description: 'A chalice that never empties. Drinking from it grants immense blood magic power.' },
  { id: 'relic_soul_mirror', name: 'Soul Mirror', emoji: '🪞', rarity: 'rare', darkArt: 'soulbinding', shadowBoost: 12, bloodBoost: 12, agilityBoost: 18, value: 800, description: 'A mirror that reflects the souls of those who gaze into it. It reveals hidden truths.' },
  { id: 'relic_hex_staff', name: 'Hex Staff', emoji: '🪄', rarity: 'rare', darkArt: 'cursecraft', shadowBoost: 8, bloodBoost: 20, agilityBoost: 12, value: 750, description: 'A staff inscribed with hex sigils. It amplifies curse power and extends range.' },
  { id: 'relic_death_mask', name: 'Death Mask', emoji: '🎭', rarity: 'epic', darkArt: 'necromancy', shadowBoost: 25, bloodBoost: 18, agilityBoost: 15, value: 2500, description: 'A mask that allows the wearer to see and command the dead. Undead recognize the wearer as their master.' },
  { id: 'relic_alchemy_ring', name: 'Philosopher Ring', emoji: '💍', rarity: 'epic', darkArt: 'darkalchemy', shadowBoost: 15, bloodBoost: 15, agilityBoost: 25, value: 2400, description: 'A ring that enhances transmutation. It can turn base materials into precious substances.' },
  { id: 'relic_void_compass', name: 'Void Compass', emoji: '🧭', rarity: 'epic', darkArt: 'voidweaving', shadowBoost: 18, bloodBoost: 10, agilityBoost: 22, value: 2300, description: 'A compass that points toward void rifts. It guides its bearer through dimensional tears.' },
  { id: 'relic_shadowblade', name: 'Shadowblade', emoji: '🗡️', rarity: 'legendary', darkArt: 'shadowmancy', shadowBoost: 45, bloodBoost: 20, agilityBoost: 25, value: 8000, description: 'A blade forged from solidified shadow. It cuts through any defense and cannot be blocked.' },
  { id: 'relic_sanguine_scepter', name: 'Sanguine Scepter', emoji: '⚜️', rarity: 'legendary', darkArt: 'bloodmagic', shadowBoost: 20, bloodBoost: 50, agilityBoost: 15, value: 9500, description: 'A scepter that controls all blood within range. It can command enemies\' blood against them.' },
  { id: 'relic_anima_orb', name: 'Anima Orb', emoji: '🔮', rarity: 'legendary', darkArt: 'soulbinding', shadowBoost: 30, bloodBoost: 30, agilityBoost: 30, value: 8500, description: 'An orb containing millions of captured souls. It grants omniscience and spiritual dominance.' },
  { id: 'relic_malediction_tome', name: 'Tome of Malediction', emoji: '📖', rarity: 'legendary', darkArt: 'cursecraft', shadowBoost: 40, bloodBoost: 25, agilityBoost: 20, value: 10000, description: 'The ultimate curse grimoire. It contains every curse ever devised and can invent new ones.' },
  { id: 'relic_necronomicon', name: 'Necronomicon Fragment', emoji: '📜', rarity: 'legendary', darkArt: 'necromancy', shadowBoost: 35, bloodBoost: 35, agilityBoost: 25, value: 9000, description: 'A fragment of the legendary Necronomicon. It grants mastery over life and death itself.' },
  { id: 'relic_immortal_vial', name: 'Immortal Vial', emoji: '⚗️', rarity: 'legendary', darkArt: 'darkalchemy', shadowBoost: 25, bloodBoost: 40, agilityBoost: 35, value: 11000, description: 'A vial containing the elixir of immortality. It can grant eternal life to its bearer.' },
  { id: 'relic_abyss_key', name: 'Key to the Abyss', emoji: '🗝️', rarity: 'legendary', darkArt: 'voidweaving', shadowBoost: 50, bloodBoost: 30, agilityBoost: 40, value: 12000, description: 'A key that opens the gates of the abyss itself. It grants unlimited access to void energy.' },
  { id: 'relic_tower_heart', name: 'Heart of the Tower', emoji: '🖤', rarity: 'epic', darkArt: 'shadowmancy', shadowBoost: 22, bloodBoost: 22, agilityBoost: 18, value: 2600, description: 'The crystallized heart of the Raven Tower. It resonates with all dark arts equally.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: RT_EVENTS — 12 Tower Events
// ═══════════════════════════════════════════════════════════════════

export const RT_EVENTS: readonly RtEventDef[] = [
  { id: 'evt_shadow_surge', name: 'Shadow Surge', emoji: '🌑', durationTurns: 5, effectType: 'buff', effectDescription: 'Shadowmancy raven power doubled. Dark corners reveal secrets.', description: 'A surge of shadow energy floods the tower, empowering shadow ravens and revealing hidden passages.' },
  { id: 'evt_blood_moon', name: 'Blood Moon Rising', emoji: '🩸', durationTurns: 4, effectType: 'buff', effectDescription: 'Blood magic ravens gain +50% power. All healing doubled.', description: 'The moon turns crimson, amplifying blood magic to unprecedented levels across the tower.' },
  { id: 'evt_soul_storm', name: 'Soul Storm', emoji: '👻', durationTurns: 3, effectType: 'special', effectDescription: 'Soulbinding ravens triple power. Free soul materials appear.', description: 'A storm of displaced souls sweeps through the tower, providing rare soulbinding materials.' },
  { id: 'evt_curse_epidemic', name: 'Curse Epidemic', emoji: '☠️', durationTurns: 3, effectType: 'debuff', effectDescription: 'All ravens lose 25% loyalty. Curse materials available.', description: 'An ancient curse reactivates, spreading through the tower and affecting all ravens within.' },
  { id: 'evt_grave_awakening', name: 'Grave Awakening', emoji: '⚰️', durationTurns: 5, effectType: 'buff', effectDescription: 'Necromancy ravens gain +60% power. Free undead allies.', description: 'The dead rise throughout the tower. Necromancy ravens can command vast skeletal armies.' },
  { id: 'evt_alchemical_bloom', name: 'Alchemical Bloom', emoji: '⚗️', durationTurns: 4, effectType: 'buff', effectDescription: 'Material harvest doubled. Alchemy ravens gain +40% power.', description: 'A rare bloom of alchemical energy fills the tower, making transmutation effortless.' },
  { id: 'evt_void_tear', name: 'Void Tear', emoji: '🌀', durationTurns: 2, effectType: 'special', effectDescription: 'Voidweaving ravens triple power. Random void portals open.', description: 'A massive tear in reality opens in the tower, releasing abyssal energy and strange creatures.' },
  { id: 'evt_tower_quake', name: 'Tower Quake', emoji: '💥', durationTurns: 2, effectType: 'debuff', effectDescription: 'Lose 10% gold. Hidden rooms revealed on all floors.', description: 'The tower shakes violently, damaging structures but revealing secret chambers long sealed.' },
  { id: 'evt_raven_migration', name: 'Dark Raven Migration', emoji: '🦅', durationTurns: 6, effectType: 'buff', effectDescription: 'Binding chance doubled. Rare ravens appear on all floors.', description: 'Thousands of dark ravens migrate to the tower. The perfect time to bind new species.' },
  { id: 'evt_abyss_whisper', name: 'Abyss Whisper', emoji: '👁️', durationTurns: 3, effectType: 'special', effectDescription: 'Renown gain doubled. Relic discovery chance increased.', description: 'The abyss whispers secrets of hidden relics and forgotten treasures throughout the tower.' },
  { id: 'evt_dark_festival', name: 'Festival of Dark Arts', emoji: '🎭', durationTurns: 5, effectType: 'buff', effectDescription: 'All raven loyalty restored. All dark arts gain +20% power.', description: 'A rare festival where all dark arts are celebrated. Ravens are inspired and loyal.' },
  { id: 'evt_tower_siege', name: 'Tower Under Siege', emoji: '🏰', durationTurns: 4, effectType: 'debuff', effectDescription: 'Defense reduced. Epic materials drop from invaders.', description: 'Outside forces besiege the tower. Defeating invaders yields rare and epic materials.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: INTERNAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const RT_MAX_RAVEN_LEVEL = 50
const RT_MAX_STRUCTURE_LEVEL = 10
const RT_INITIAL_GOLD = 200
const RT_INITIAL_RENOWN = 0

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: HELPER FUNCTIONS (hoisted with `function`)
// ═══════════════════════════════════════════════════════════════════

function rtXpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.25, level - 1))
}

function rtCalcStats(species: RtRavenSpecies, level: number) {
  const growth = 1 + (level - 1) * 0.12
  return {
    shadowPower: Math.floor(species.shadowPower * growth),
    bloodPower: Math.floor(species.bloodPower * growth),
    agility: Math.floor(species.agility * growth),
  }
}

let _rtIdCounter = 0
function rtGenerateId(): string {
  _rtIdCounter += 1
  return `rt_${_rtIdCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`
}

function rtFindSpecies(id: string): RtRavenSpecies | undefined {
  return RT_RAVENS.find((s) => s.id === id)
}

function rtFindFloor(id: string): RtFloorDef | undefined {
  return RT_FLOORS.find((z) => z.id === id)
}

function rtFindMaterial(id: string): RtMaterialDef | undefined {
  return RT_MATERIALS.find((m) => m.id === id)
}

function rtFindStructureDef(id: string): RtStructureDef | undefined {
  return RT_STRUCTURES.find((s) => s.id === id)
}

function rtFindAbility(id: string): RtAbilityDef | undefined {
  return RT_ABILITIES.find((a) => a.id === id)
}

function rtFindRelic(id: string): RtRelicDef | undefined {
  return RT_RELICS.find((r) => r.id === id)
}

function rtFindAchievement(id: string): RtAchievementDef | undefined {
  return RT_ACHIEVEMENTS.find((a) => a.id === id)
}

function rtFindTitle(id: RtTitleId): RtTitleDef | undefined {
  return RT_TITLES.find((t) => t.id === id)
}

function rtRarityMultiplier(rarity: RtRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 5
    case 'epic': return 10
    case 'legendary': return 25
    default: return 1
  }
}

function rtRarityColor(rarity: RtRarity): string {
  switch (rarity) {
    case 'common': return '#9ca3af'
    case 'uncommon': return '#34d399'
    case 'rare': return '#60a5fa'
    case 'epic': return '#a78bfa'
    case 'legendary': return '#fbbf24'
    default: return '#9ca3af'
  }
}

function rtDarkArtColor(art: RtDarkArt): string {
  switch (art) {
    case 'shadowmancy': return RT_RAVEN_BLACK
    case 'bloodmagic': return RT_BLOOD_RED
    case 'soulbinding': return RT_MOONLIGHT_SILVER
    case 'cursecraft': return RT_SHADOW_PURPLE
    case 'necromancy': return RT_DARK_GREEN
    case 'darkalchemy': return RT_GOTHIC_GOLD
    case 'voidweaving': return RT_MIDNIGHT_BLUE
    default: return '#888888'
  }
}

export function rtCheckSynergy(attacker: RtDarkArt, defender: RtDarkArt): number {
  const advantages = RT_SYNERGY_MAP[attacker]
  if (advantages?.includes(defender)) return 1.4
  const disadvantages = RT_SYNERGY_MAP[defender]
  if (disadvantages?.includes(attacker)) return 0.7
  return 1.0
}

function rtCalcStructureUpgradeCost(def: RtStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

function rtCalcMaxTitle(renown: number, ravenCount: number): RtTitleId {
  let bestId: RtTitleId = 'title_raven_fledgling'
  for (const title of RT_TITLES) {
    if (renown >= title.minRenown && ravenCount >= title.minRavens) {
      bestId = title.id
    }
  }
  return bestId
}

function rtCheckAchievementCondition(
  condition: string,
  state: RtStoreState
): boolean {
  switch (condition) {
    case 'bind_1':
      return state.totalBound >= 1
    case 'bind_5':
      return state.totalBound >= 5
    case 'harvest_1':
      return state.totalHarvested >= 1
    case 'harvest_10':
      return state.totalHarvested >= 10
    case 'build_1':
      return state.totalBuilt >= 1
    case 'build_5':
      return state.totalBuilt >= 5
    case 'floor_4':
      return state.floors.length >= 4
    case 'floor_8':
      return state.floors.length >= 8
    case 'rare_bind':
      return state.ravens.some((s) => {
        const sp = rtFindSpecies(s.speciesId)
        return sp && (sp.rarity === 'rare' || sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'epic_bind':
      return state.ravens.some((s) => {
        const sp = rtFindSpecies(s.speciesId)
        return sp && (sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'legendary_bind':
      return state.ravens.some((s) => {
        const sp = rtFindSpecies(s.speciesId)
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
    case 'all_arts': {
      const arts = new Set<RtDarkArt>()
      for (const s of state.ravens) {
        const sp = rtFindSpecies(s.speciesId)
        if (sp) arts.add(sp.darkArt)
      }
      return arts.size >= 7
    }
    case 'max_title':
      return state.currentTitle === 'title_tower_deity'
    default:
      return false
  }
}

function rtPickRandomEvent(): RtEventDef {
  const idx = Math.floor(Math.random() * RT_EVENTS.length)
  return RT_EVENTS[idx]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const useRtStore = create<RtFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      ravens: [] as RtRavenInstance[],
      floors: [] as string[],
      materials: [] as { materialId: string; count: number }[],
      structures: [] as RtStructureInstance[],
      abilities: [] as string[],
      achievements: [] as string[],
      relics: [] as string[],
      currentTitle: 'title_raven_fledgling' as RtTitleId,
      gold: RT_INITIAL_GOLD,
      renown: RT_INITIAL_RENOWN,
      totalBound: 0,
      totalHarvested: 0,
      totalBuilt: 0,
      totalEventsFaced: 0,
      activeEvent: null as RtEventDef | null,
      eventTurnsRemaining: 0,
      activeFloor: null as string | null,

      // ── rtBindRaven ───────────────────────────────────────────
      rtBindRaven: (speciesId: string): boolean => {
        const species = rtFindSpecies(speciesId)
        if (!species) return false
        const cost = Math.floor(50 * rtRarityMultiplier(species.rarity))
        const state = get()
        if (state.gold < cost) return false
        const stats = rtCalcStats(species, 1)
        const newRaven: RtRavenInstance = {
          id: rtGenerateId(),
          speciesId,
          name: species.name,
          level: 1,
          xp: 0,
          shadowPower: stats.shadowPower,
          bloodPower: stats.bloodPower,
          agility: stats.agility,
          loyalty: 80,
          hunger: 70,
          boundAt: Date.now(),
        }
        set((prev) => {
          const updated = {
            ravens: [...prev.ravens, newRaven],
            gold: prev.gold - cost,
            totalBound: prev.totalBound + 1,
            renown: prev.renown + rtRarityMultiplier(species.rarity) * 5,
            currentTitle: rtCalcMaxTitle(
              prev.renown + rtRarityMultiplier(species.rarity) * 5,
              prev.ravens.length + 1
            ),
          }
          return updated
        })
        return true
      },

      // ── rtReleaseRaven ────────────────────────────────────────
      rtReleaseRaven: (ravenId: string): boolean => {
        const state = get()
        const exists = state.ravens.find((s) => s.id === ravenId)
        if (!exists) return false
        const species = rtFindSpecies(exists.speciesId)
        const refund = species ? Math.floor(25 * rtRarityMultiplier(species.rarity)) : 10
        set((prev) => ({
          ravens: prev.ravens.filter((s) => s.id !== ravenId),
          gold: prev.gold + refund,
          currentTitle: rtCalcMaxTitle(prev.renown, prev.ravens.length - 1),
        }))
        return true
      },

      // ── rtFeedRaven ───────────────────────────────────────────
      rtFeedRaven: (ravenId: string): boolean => {
        const feedCost = 10
        const state = get()
        if (state.gold < feedCost) return false
        set((prev) => {
          const ravens = prev.ravens.map((s) => {
            if (s.id !== ravenId) return s
            const newXp = s.xp + 20
            const xpNeeded = rtXpForLevel(s.level)
            let newLevel = s.level
            let currentXp = newXp
            if (currentXp >= xpNeeded && s.level < RT_MAX_RAVEN_LEVEL) {
              newLevel = s.level + 1
              currentXp = newXp - xpNeeded
            }
            const species = rtFindSpecies(s.speciesId)
            const stats = species ? rtCalcStats(species, newLevel) : { shadowPower: s.shadowPower, bloodPower: s.bloodPower, agility: s.agility }
            return {
              ...s,
              level: newLevel,
              xp: currentXp,
              shadowPower: stats.shadowPower,
              bloodPower: stats.bloodPower,
              agility: stats.agility,
              loyalty: Math.min(100, s.loyalty + 10),
              hunger: Math.min(100, s.hunger + 20),
            }
          })
          return { ravens, gold: prev.gold - feedCost, renown: prev.renown + 2 }
        })
        return true
      },

      // ── rtHarvestFeather ──────────────────────────────────────
      rtHarvestFeather: (ravenId: string): boolean => {
        const state = get()
        const raven = state.ravens.find((s) => s.id === ravenId)
        if (!raven) return false
        if (raven.hunger < 20) return false
        const species = rtFindSpecies(raven.speciesId)
        if (!species) return false
        const materialId = `mat_${species.darkArt}_${species.rarity}_feather`
        const existingMaterial = state.materials.find((m) => m.materialId === materialId)
        const amount = Math.ceil(raven.shadowPower / 10)
        set((prev) => ({
          materials: existingMaterial
            ? prev.materials.map((m) => (m.materialId === materialId ? { ...m, count: m.count + amount } : m))
            : [...prev.materials, { materialId, count: amount }],
          totalHarvested: prev.totalHarvested + 1,
          renown: prev.renown + 3,
          ravens: prev.ravens.map((s) =>
            s.id === ravenId ? { ...s, hunger: Math.max(0, s.hunger - 20) } : s
          ),
        }))
        return true
      },

      // ── rtBuildStructure ──────────────────────────────────────
      rtBuildStructure: (structureDefId: string): boolean => {
        const def = rtFindStructureDef(structureDefId)
        if (!def) return false
        const state = get()
        if (state.gold < def.baseCost) return false
        const alreadyBuilt = state.structures.find((s) => s.structureDefId === structureDefId)
        if (alreadyBuilt) return false
        const newStructure: RtStructureInstance = {
          id: rtGenerateId(),
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

      // ── rtUpgradeStructure ────────────────────────────────────
      rtUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structure = state.structures.find((s) => s.id === structureId)
        if (!structure) return false
        if (structure.level >= RT_MAX_STRUCTURE_LEVEL) return false
        const def = rtFindStructureDef(structure.structureDefId)
        if (!def) return false
        const cost = rtCalcStructureUpgradeCost(def, structure.level)
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

      // ── rtExploreFloor ────────────────────────────────────────
      rtExploreFloor: (floorId: string): RtEventDef | null => {
        const floor = rtFindFloor(floorId)
        if (!floor) return null
        const state = get()
        const requiredTitleIdx = RT_TITLES.findIndex((t) => t.id === floor.requiredTitle)
        const currentTitleIdx = RT_TITLES.findIndex((t) => t.id === state.currentTitle)
        if (currentTitleIdx < requiredTitleIdx) return null
        const newFloors = state.floors.includes(floorId) ? state.floors : [...state.floors, floorId]
        const event = rtPickRandomEvent()
        set((prev) => ({
          floors: newFloors,
          activeFloor: floorId,
          activeEvent: event,
          eventTurnsRemaining: event.durationTurns,
          totalEventsFaced: prev.totalEventsFaced + 1,
          renown: prev.renown + 5,
        }))
        return event
      },

      // ── rtCollectRelic ────────────────────────────────────────
      rtCollectRelic: (relicId: string): boolean => {
        const relic = rtFindRelic(relicId)
        if (!relic) return false
        const state = get()
        if (state.relics.includes(relicId)) return false
        set((prev) => ({
          relics: [...prev.relics, relicId],
          renown: prev.renown + Math.floor(rtRarityMultiplier(relic.rarity) * 20),
          currentTitle: rtCalcMaxTitle(
            prev.renown + Math.floor(rtRarityMultiplier(relic.rarity) * 20),
            prev.ravens.length
          ),
        }))
        return true
      },

      // ── rtUnlockAbility ───────────────────────────────────────
      rtUnlockAbility: (abilityId: string): boolean => {
        const ability = rtFindAbility(abilityId)
        if (!ability) return false
        const state = get()
        if (state.abilities.includes(abilityId)) return false
        const cost = Math.floor(100 * rtRarityMultiplier(ability.rarity))
        if (state.gold < cost) return false
        set((prev) => ({
          abilities: [...prev.abilities, abilityId],
          gold: prev.gold - cost,
        }))
        return true
      },

      // ── rtUnlockTitle ─────────────────────────────────────────
      rtUnlockTitle: (titleId: RtTitleId): boolean => {
        const title = rtFindTitle(titleId)
        if (!title) return false
        const state = get()
        if (state.renown < title.minRenown) return false
        if (state.ravens.length < title.minRavens) return false
        set((prev) => ({ currentTitle: titleId }))
        return true
      },

      // ── rtClaimAchievement ────────────────────────────────────
      rtClaimAchievement: (achievementId: string): boolean => {
        const achievement = rtFindAchievement(achievementId)
        if (!achievement) return false
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!rtCheckAchievementCondition(achievement.condition, state)) return false
        set((prev) => ({
          achievements: [...prev.achievements, achievementId],
          gold: prev.gold + achievement.reward.gold,
          renown: prev.renown + achievement.reward.renown,
          currentTitle: rtCalcMaxTitle(
            prev.renown + achievement.reward.renown,
            prev.ravens.length
          ),
        }))
        return true
      },

      // ── rtTradeMaterial ───────────────────────────────────────
      rtTradeMaterial: (materialId: string, count: number): number => {
        const material = rtFindMaterial(materialId)
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

      // ── rtEndEvent ────────────────────────────────────────────
      rtEndEvent: () => {
        set({ activeEvent: null, eventTurnsRemaining: 0 })
      },

      // ── rtResetEvent ──────────────────────────────────────────
      rtResetEvent: () => {
        const event = rtPickRandomEvent()
        set({ activeEvent: event, eventTurnsRemaining: event.durationTurns })
      },
    }),
    {
      name: 'raven-tower-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: MAIN HOOK — useRavenTower()
// ═══════════════════════════════════════════════════════════════════

export default function useRavenTower(): RtAPI {
  const store = useRtStore()

  // ── Computed: Owned ravens with species info ────────────────
  const rtOwnedRavens = useMemo(() => {
    return store.ravens.map((s) => {
      const species = rtFindSpecies(s.speciesId)
      return {
        ...s,
        species,
        artColor: species ? rtDarkArtColor(species.darkArt) : '#888888',
        rarityColor: species ? rtRarityColor(species.rarity) : '#888888',
      }
    })
  }, [store])

  // ── Computed: Available raven species to bind ───────────────
  const rtAvailableSpecies = useMemo(() => {
    return RT_RAVENS.filter((sp) => {
      const cost = Math.floor(50 * rtRarityMultiplier(sp.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Current title details ─────────────────────────
  const rtCurrentTitleDetail = useMemo(() => {
    return rtFindTitle(store.currentTitle) ?? RT_TITLES[0]
  }, [store])

  // ── Computed: Next title info ───────────────────────────────
  const rtNextTitle = useMemo(() => {
    const currentIdx = RT_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= RT_TITLES.length - 1) return null
    return RT_TITLES[currentIdx + 1]
  }, [store])

  // ── Computed: Active floor details ──────────────────────────
  const rtActiveFloorDetail = useMemo(() => {
    if (!store.activeFloor) return null
    return rtFindFloor(store.activeFloor) ?? null
  }, [store])

  // ── Computed: Unexplored floors ─────────────────────────────
  const rtUnexploredFloors = useMemo(() => {
    return RT_FLOORS.filter((z) => !store.floors.includes(z.id))
  }, [store])

  // ── Computed: Structures with defs ──────────────────────────
  const rtBuiltStructures = useMemo(() => {
    return store.structures.map((s) => {
      const def = rtFindStructureDef(s.structureDefId)
      return { ...s, def }
    })
  }, [store])

  // ── Computed: Unlockable abilities ──────────────────────────
  const rtUnlockableAbilities = useMemo(() => {
    return RT_ABILITIES.filter((a) => {
      if (store.abilities.includes(a.id)) return false
      const cost = Math.floor(100 * rtRarityMultiplier(a.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Owned relics with defs ────────────────────────
  const rtOwnedRelics = useMemo(() => {
    return store.relics.map((rId) => {
      const def = rtFindRelic(rId)
      return def ?? null
    }).filter((r): r is RtRelicDef => r !== null)
  }, [store])

  // ── Computed: Unclaimed achievements ────────────────────────
  const rtUnclaimedAchievements = useMemo(() => {
    return RT_ACHIEVEMENTS.filter((a) => {
      if (store.achievements.includes(a.id)) return false
      return rtCheckAchievementCondition(a.condition, store)
    })
  }, [store])

  // ── Computed: Materials with defs ───────────────────────────
  const rtInventoryMaterials = useMemo(() => {
    return store.materials.map((m) => {
      const def = rtFindMaterial(m.materialId)
      return { ...m, def }
    })
  }, [store])

  // ── Computed: Total structure effect bonus ──────────────────
  const rtTotalStructureEffect = useMemo(() => {
    let totalEffect = 0
    for (const s of store.structures) {
      const def = rtFindStructureDef(s.structureDefId)
      if (def) {
        totalEffect += def.baseEffect + def.effectPerLevel * (s.level - 1)
      }
    }
    return totalEffect
  }, [store])

  // ── Computed: Average raven level ───────────────────────────
  const rtAverageRavenLevel = useMemo(() => {
    if (store.ravens.length === 0) return 0
    const total = store.ravens.reduce((sum, s) => sum + s.level, 0)
    return Math.floor(total / store.ravens.length)
  }, [store])

  // ── Computed: Total raven power ─────────────────────────────
  const rtTotalRavenPower = useMemo(() => {
    return store.ravens.reduce(
      (sum, s) => sum + s.shadowPower + s.bloodPower + s.agility,
      0
    )
  }, [store])

  // ── Computed: Dark art distribution ─────────────────────────
  const rtDarkArtDistribution = useMemo(() => {
    const counts: Record<RtDarkArt, number> = {
      shadowmancy: 0, bloodmagic: 0, soulbinding: 0, cursecraft: 0,
      necromancy: 0, darkalchemy: 0, voidweaving: 0,
    }
    for (const s of store.ravens) {
      const sp = rtFindSpecies(s.speciesId)
      if (sp) counts[sp.darkArt]++
    }
    return counts
  }, [store])

  // ── Computed: Rarity distribution ───────────────────────────
  const rtRarityDistribution = useMemo(() => {
    const counts: Record<RtRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
    }
    for (const s of store.ravens) {
      const sp = rtFindSpecies(s.speciesId)
      if (sp) counts[sp.rarity]++
    }
    return counts
  }, [store])

  // ── Computed: Ravens by rarity ──────────────────────────────
  const rtRavensByRarity = useMemo(() => {
    const groups: Record<RtRarity, RtRavenInstance[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    }
    for (const s of store.ravens) {
      const sp = rtFindSpecies(s.speciesId)
      if (sp) groups[sp.rarity].push(s)
    }
    return groups
  }, [store])

  // ── Computed: Ravens by dark art ────────────────────────────
  const rtRavensByDarkArt = useMemo(() => {
    const groups: Record<RtDarkArt, RtRavenInstance[]> = {
      shadowmancy: [], bloodmagic: [], soulbinding: [], cursecraft: [],
      necromancy: [], darkalchemy: [], voidweaving: [],
    }
    for (const s of store.ravens) {
      const sp = rtFindSpecies(s.speciesId)
      if (sp) groups[sp.darkArt].push(s)
    }
    return groups
  }, [store])

  // ── Computed: Progress to next title ────────────────────────
  const rtTitleProgress = useMemo(() => {
    const next = rtNextTitle
    if (!next) return { percent: 100, renownNeeded: 0, ravensNeeded: 0 }
    const renownProgress = Math.min(100, (store.renown / next.minRenown) * 100)
    const ravenProgress = Math.min(100, (store.ravens.length / next.minRavens) * 100)
    return {
      percent: Math.floor((renownProgress + ravenProgress) / 2),
      renownNeeded: Math.max(0, next.minRenown - store.renown),
      ravensNeeded: Math.max(0, next.minRavens - store.ravens.length),
    }
  }, [store, rtNextTitle])

  // ── Computed: Rare materials count ──────────────────────────
  const rtRareMaterialCount = useMemo(() => {
    let count = 0
    for (const m of store.materials) {
      const def = rtFindMaterial(m.materialId)
      if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
        count += m.count
      }
    }
    return count
  }, [store])

  // ── Computed: Hungry ravens ─────────────────────────────────
  const rtHungryRavens = useMemo(() => {
    return store.ravens.filter((s) => s.hunger < 30)
  }, [store])

  // ── Computed: Disloyal ravens ───────────────────────────────
  const rtDisloyalRavens = useMemo(() => {
    return store.ravens.filter((s) => s.loyalty < 30)
  }, [store])

  // ── Computed: Total relic boost ─────────────────────────────
  const rtTotalRelicBoost = useMemo(() => {
    let shadowBoost = 0
    let bloodBoost = 0
    let agilityBoost = 0
    for (const rId of store.relics) {
      const relic = rtFindRelic(rId)
      if (relic) {
        shadowBoost += relic.shadowBoost
        bloodBoost += relic.bloodBoost
        agilityBoost += relic.agilityBoost
      }
    }
    return { shadowBoost, bloodBoost, agilityBoost }
  }, [store])

  // ═════════════════════════════════════════════════════════════
  // Return rtAPI object
  // ═════════════════════════════════════════════════════════════

  const rtAPI: RtAPI = {
    // ── Direct constants ──────────────────────────────────────
    RT_RAVEN_BLACK,
    RT_SHADOW_PURPLE,
    RT_MOONLIGHT_SILVER,
    RT_BLOOD_RED,
    RT_BONE_WHITE,
    RT_MIDNIGHT_BLUE,
    RT_DARK_GREEN,
    RT_GOTHIC_GOLD,
    RT_DARK_ARTS,
    RT_RAVENS,
    RT_FLOORS,
    RT_MATERIALS,
    RT_STRUCTURES,
    RT_ABILITIES,
    RT_ACHIEVEMENTS,
    RT_TITLES,
    RT_RELICS,
    RT_EVENTS,
    rtCheckSynergy,

    // ── Store state ───────────────────────────────────────────
    ravens: store.ravens,
    floors: store.floors,
    materials: store.materials,
    structures: store.structures,
    abilities: store.abilities,
    achievements: store.achievements,
    relics: store.relics,
    currentTitle: store.currentTitle,
    gold: store.gold,
    renown: store.renown,
    totalBound: store.totalBound,
    totalHarvested: store.totalHarvested,
    totalBuilt: store.totalBuilt,
    totalEventsFaced: store.totalEventsFaced,
    activeEvent: store.activeEvent,
    eventTurnsRemaining: store.eventTurnsRemaining,
    activeFloor: store.activeFloor,

    // ── Store actions ─────────────────────────────────────────
    rtBindRaven: store.rtBindRaven,
    rtReleaseRaven: store.rtReleaseRaven,
    rtFeedRaven: store.rtFeedRaven,
    rtHarvestFeather: store.rtHarvestFeather,
    rtBuildStructure: store.rtBuildStructure,
    rtUpgradeStructure: store.rtUpgradeStructure,
    rtExploreFloor: store.rtExploreFloor,
    rtCollectRelic: store.rtCollectRelic,
    rtUnlockAbility: store.rtUnlockAbility,
    rtUnlockTitle: store.rtUnlockTitle,
    rtClaimAchievement: store.rtClaimAchievement,
    rtTradeMaterial: store.rtTradeMaterial,
    rtEndEvent: store.rtEndEvent,
    rtResetEvent: store.rtResetEvent,

    // ── Computed getters ──────────────────────────────────────
    rtOwnedRavens,
    rtAvailableSpecies,
    rtCurrentTitleDetail,
    rtNextTitle,
    rtActiveFloorDetail,
    rtUnexploredFloors,
    rtBuiltStructures,
    rtUnlockableAbilities,
    rtOwnedRelics,
    rtUnclaimedAchievements,
    rtInventoryMaterials,
    rtTotalStructureEffect,
    rtAverageRavenLevel,
    rtTotalRavenPower,
    rtDarkArtDistribution,
    rtRarityDistribution,
    rtRavensByRarity,
    rtRavensByDarkArt,
    rtTitleProgress,
    rtRareMaterialCount,
    rtHungryRavens,
    rtDisloyalRavens,
    rtTotalRelicBoost,
  }

  return rtAPI
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 18: RTAPI TYPE DEFINITION
// ═══════════════════════════════════════════════════════════════════

export interface RtAPI {
  // Direct constants
  readonly RT_RAVEN_BLACK: string
  readonly RT_SHADOW_PURPLE: string
  readonly RT_MOONLIGHT_SILVER: string
  readonly RT_BLOOD_RED: string
  readonly RT_BONE_WHITE: string
  readonly RT_MIDNIGHT_BLUE: string
  readonly RT_DARK_GREEN: string
  readonly RT_GOTHIC_GOLD: string
  readonly RT_DARK_ARTS: readonly RtDarkArtDef[]
  readonly RT_RAVENS: readonly RtRavenSpecies[]
  readonly RT_FLOORS: readonly RtFloorDef[]
  readonly RT_MATERIALS: readonly RtMaterialDef[]
  readonly RT_STRUCTURES: readonly RtStructureDef[]
  readonly RT_ABILITIES: readonly RtAbilityDef[]
  readonly RT_ACHIEVEMENTS: readonly RtAchievementDef[]
  readonly RT_TITLES: readonly RtTitleDef[]
  readonly RT_RELICS: readonly RtRelicDef[]
  readonly RT_EVENTS: readonly RtEventDef[]
  readonly rtCheckSynergy: (attacker: RtDarkArt, defender: RtDarkArt) => number

  // Store state
  readonly ravens: RtRavenInstance[]
  readonly floors: string[]
  readonly materials: { materialId: string; count: number }[]
  readonly structures: RtStructureInstance[]
  readonly abilities: string[]
  readonly achievements: string[]
  readonly relics: string[]
  readonly currentTitle: RtTitleId
  readonly gold: number
  readonly renown: number
  readonly totalBound: number
  readonly totalHarvested: number
  readonly totalBuilt: number
  readonly totalEventsFaced: number
  readonly activeEvent: RtEventDef | null
  readonly eventTurnsRemaining: number
  readonly activeFloor: string | null

  // Store actions
  rtBindRaven: (speciesId: string) => boolean
  rtReleaseRaven: (ravenId: string) => boolean
  rtFeedRaven: (ravenId: string) => boolean
  rtHarvestFeather: (ravenId: string) => boolean
  rtBuildStructure: (structureDefId: string) => boolean
  rtUpgradeStructure: (structureId: string) => boolean
  rtExploreFloor: (floorId: string) => RtEventDef | null
  rtCollectRelic: (relicId: string) => boolean
  rtUnlockAbility: (abilityId: string) => boolean
  rtUnlockTitle: (titleId: RtTitleId) => boolean
  rtClaimAchievement: (achievementId: string) => boolean
  rtTradeMaterial: (materialId: string, count: number) => number
  rtEndEvent: () => void
  rtResetEvent: () => void

  // Computed getters
  readonly rtOwnedRavens: readonly (RtRavenInstance & { species: RtRavenSpecies | undefined; artColor: string; rarityColor: string })[]
  readonly rtAvailableSpecies: readonly RtRavenSpecies[]
  readonly rtCurrentTitleDetail: RtTitleDef
  readonly rtNextTitle: RtTitleDef | null
  readonly rtActiveFloorDetail: RtFloorDef | null
  readonly rtUnexploredFloors: readonly RtFloorDef[]
  readonly rtBuiltStructures: readonly (RtStructureInstance & { def: RtStructureDef | undefined })[]
  readonly rtUnlockableAbilities: readonly RtAbilityDef[]
  readonly rtOwnedRelics: readonly RtRelicDef[]
  readonly rtUnclaimedAchievements: readonly RtAchievementDef[]
  readonly rtInventoryMaterials: readonly ({ materialId: string; count: number; def: RtMaterialDef | undefined })[]
  readonly rtTotalStructureEffect: number
  readonly rtAverageRavenLevel: number
  readonly rtTotalRavenPower: number
  readonly rtDarkArtDistribution: Record<RtDarkArt, number>
  readonly rtRarityDistribution: Record<RtRarity, number>
  readonly rtRavensByRarity: Record<RtRarity, RtRavenInstance[]>
  readonly rtRavensByDarkArt: Record<RtDarkArt, RtRavenInstance[]>
  readonly rtTitleProgress: { percent: number; renownNeeded: number; ravensNeeded: number }
  readonly rtRareMaterialCount: number
  readonly rtHungryRavens: readonly RtRavenInstance[]
  readonly rtDisloyalRavens: readonly RtRavenInstance[]
  readonly rtTotalRelicBoost: { shadowBoost: number; bloodBoost: number; agilityBoost: number }
}
