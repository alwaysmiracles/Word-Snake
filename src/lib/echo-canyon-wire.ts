/**
 * Echo Canyon Wire — 回声峡谷 (Echo Canyon) feature module
 *
 * A sound-wave canyon exploration mini-game: capture 35 sound spirits
 * across 7 sound types, explore 8 resonance chambers, harvest harmonic
 * crystals, build echo towers, discover 15 legendary sound artifacts,
 * face 12 canyon events, and ascend through 8 titles from Sound Seeker
 * to Echo Deity — backed by a Zustand store with persist middleware.
 *
 * Storage key: echo-canyon-wire
 * Prefix: ec / EC_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type EcSoundType =
  | 'harmonic'
  | 'resonant'
  | 'dissonant'
  | 'ethereal'
  | 'ancient'
  | 'chaotic'
  | 'primal'

export type EcRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type EcTitleId =
  | 'title_sound_seeker'
  | 'title_echo_listener'
  | 'title_harmonic_adept'
  | 'title_sonic_walker'
  | 'title_chamber_keeper'
  | 'title_canyon_master'
  | 'title_spirit_lord'
  | 'title_echo_deity'

export interface EcSoundTypeDef {
  readonly id: EcSoundType
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface EcSpiritSpecies {
  readonly id: string
  readonly name: string
  readonly soundType: EcSoundType
  readonly rarity: EcRarity
  readonly sonicPower: number
  readonly resonancePower: number
  readonly frequency: number
  readonly description: string
  readonly abilities: string[]
}

export interface EcSpiritInstance {
  readonly id: string
  speciesId: string
  name: string
  level: number
  xp: number
  sonicPower: number
  resonancePower: number
  frequency: number
  charge: number
  harmony: number
  capturedAt: number
}

export interface EcChamberDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly depth: number
  readonly dangerLevel: number
  readonly requiredTitle: EcTitleId
  readonly soundType: EcSoundType
  readonly bgGradient: string
  readonly ambientColor: string
}

export interface EcCrystalDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'shard' | 'resonance_dust' | 'echo_fossil' | 'artifact_fragment' | 'essence'
  readonly rarity: EcRarity
  readonly sonicBonus: number
  readonly resonanceBonus: number
  readonly value: number
  readonly description: string
}

export interface EcStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'echo_tower' | 'resonance_pool' | 'sonic_forge' | 'cave_altar' | 'relic_shrine'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface EcStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  builtAt: number
}

export interface EcAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly soundType: EcSoundType
  readonly type: 'active' | 'passive'
  readonly rarity: EcRarity
  readonly energyCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface EcAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { gold: number; resonance: number }
}

export interface EcTitleDef {
  readonly id: EcTitleId
  readonly name: string
  readonly emoji: string
  readonly minResonance: number
  readonly minSpirits: number
  readonly description: string
}

export interface EcRelicDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: EcRarity
  readonly soundType: EcSoundType
  readonly sonicBoost: number
  readonly resonanceBoost: number
  readonly frequencyBoost: number
  readonly value: number
  readonly description: string
}

export interface EcEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface EcStoreState {
  ownedSpirits: EcSpiritInstance[]
  exploredChambers: string[]
  inventory: { crystalId: string; count: number }[]
  builtStructures: EcStructureInstance[]
  unlockedAbilities: string[]
  titles: EcTitleId[]
  achievements: string[]
  relics: string[]
  currentTitle: EcTitleId
  gold: number
  resonance: number
  totalCaptured: number
  totalHarvested: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: EcEventDef | null
  eventTurnsRemaining: number
  activeChamber: string | null
}

export interface EcStoreActions {
  ecCaptureSpirit: (speciesId: string) => boolean
  ecReleaseSpirit: (spiritId: string) => boolean
  ecChargeSpirit: (spiritId: string) => boolean
  ecHarvestCrystal: (spiritId: string) => boolean
  ecBuildStructure: (structureDefId: string) => boolean
  ecUpgradeStructure: (structureId: string) => boolean
  ecExploreChamber: (chamberId: string) => EcEventDef | null
  ecCollectRelic: (relicId: string) => boolean
  ecUnlockAbility: (abilityId: string) => boolean
  ecUnlockTitle: (titleId: EcTitleId) => boolean
  ecClaimAchievement: (achievementId: string) => boolean
  ecTradeMaterial: (crystalId: string, count: number) => number
  ecEndEvent: () => void
  ecResetEvent: () => void
}

export interface EcFullStore extends EcStoreState, EcStoreActions {}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS (8 colors)
// ═══════════════════════════════════════════════════════════════════

export const EC_CANYON_AMBER: string = '#D4A017'
export const EC_ECHO_BLUE: string = '#4169E1'
export const EC_SONIC_PURPLE: string = '#8B5CF6'
export const EC_CRYSTAL_TEAL: string = '#14B8A6'
export const EC_RESONANCE_GOLD: string = '#F59E0B'
export const EC_CAVE_BROWN: string = '#78350F'
export const EC_SPIRIT_WHITE: string = '#F0F8FF'
export const EC_DISSONANT_RED: string = '#DC2626'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: SOUND TYPE DEFINITIONS (7 types)
// ═══════════════════════════════════════════════════════════════════

export const EC_SOUND_TYPES: readonly EcSoundTypeDef[] = [
  {
    id: 'harmonic',
    name: 'Harmonic',
    color: EC_RESONANCE_GOLD,
    description:
      'Spirits of perfect musical intervals. Harmonic spirits create beautiful, consonant sound patterns that heal and soothe.',
  },
  {
    id: 'resonant',
    name: 'Resonant',
    color: EC_ECHO_BLUE,
    description:
      'Spirits of deep reverberation. Resonant spirits amplify any sound wave, making them powerful allies in the canyons.',
  },
  {
    id: 'dissonant',
    name: 'Dissonant',
    color: EC_DISSONANT_RED,
    description:
      'Spirits of clashing frequencies. Dissonant spirits shatter barriers and break through defenses with raw sonic force.',
  },
  {
    id: 'ethereal',
    name: 'Ethereal',
    color: EC_SONIC_PURPLE,
    description:
      'Spirits from beyond the audible spectrum. Ethereal spirits exist between sound and silence, wielding mysterious powers.',
  },
  {
    id: 'ancient',
    name: 'Ancient',
    color: EC_CAVE_BROWN,
    description:
      'Spirits that have echoed since the canyons first formed. Ancient spirits carry the memories of forgotten civilizations.',
  },
  {
    id: 'chaotic',
    name: 'Chaotic',
    color: EC_DISSONANT_RED,
    description:
      'Spirits of unpredictable sound. Chaotic spirits warp frequencies and create impossible audio phenomena.',
  },
  {
    id: 'primal',
    name: 'Primal',
    color: EC_CANYON_AMBER,
    description:
      'Spirits born from the heartbeat of the earth itself. Primal spirits produce sounds that shake the canyon walls.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: SOUND SYNERGY TABLE
// ═══════════════════════════════════════════════════════════════════

const EC_SYNERGY_MAP: Record<EcSoundType, EcSoundType[]> = {
  harmonic: ['dissonant', 'ethereal'],
  resonant: ['primal', 'ancient'],
  dissonant: ['harmonic', 'chaotic'],
  ethereal: ['resonant', 'ancient'],
  ancient: ['primal', 'ethereal'],
  chaotic: ['dissonant', 'resonant'],
  primal: ['ancient', 'harmonic'],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: EC_SPIRITS — 35 Sound Spirits (5 per sound type × 7)
// ═══════════════════════════════════════════════════════════════════

export const EC_SPIRITS: readonly EcSpiritSpecies[] = [
  // ── Harmonic Spirits (5) ─────────────────────────────────────
  {
    id: 'harm_whisper_wisp',
    name: 'Whisper Wisp',
    soundType: 'harmonic',
    rarity: 'common',
    sonicPower: 12,
    resonancePower: 8,
    frequency: 18,
    description:
      'A gentle spirit that hums soft lullabies in the canyon breezes. Harmless but deeply calming.',
    abilities: ['harm_gentle_hum'],
  },
  {
    id: 'harm_chime_spirit',
    name: 'Chime Spirit',
    soundType: 'harmonic',
    rarity: 'uncommon',
    sonicPower: 22,
    resonancePower: 18,
    frequency: 24,
    description:
      'A crystalline spirit that produces perfect bell-like tones. Its chimes can mend cracked walls.',
    abilities: ['harm_gentle_hum', 'harm_bell_tone'],
  },
  {
    id: 'harm_harmony_siren',
    name: 'Harmony Siren',
    soundType: 'harmonic',
    rarity: 'rare',
    sonicPower: 42,
    resonancePower: 38,
    frequency: 30,
    description:
      'A captivating spirit whose three-voice harmonics can entrance any creature within earshot.',
    abilities: ['harm_gentle_hum', 'harm_bell_tone', 'harm_triad_blast'],
  },
  {
    id: 'harm_resonance_angel',
    name: 'Resonance Angel',
    soundType: 'harmonic',
    rarity: 'epic',
    sonicPower: 68,
    resonancePower: 72,
    frequency: 35,
    description:
      'A radiant winged spirit that sings in perfect fifths. Its song can heal entire chambers at once.',
    abilities: ['harm_gentle_hum', 'harm_bell_tone', 'harm_triad_blast', 'harm_celestial_chord'],
  },
  {
    id: 'harm_aria_deity',
    name: 'Aria Deity',
    soundType: 'harmonic',
    rarity: 'legendary',
    sonicPower: 110,
    resonancePower: 120,
    frequency: 45,
    description:
      'A divine spirit of pure melody. Its aria can reshape the canyon itself, carving new passages with song.',
    abilities: ['harm_gentle_hum', 'harm_bell_tone', 'harm_triad_blast', 'harm_celestial_chord', 'harm_creation_song'],
  },

  // ── Resonant Spirits (5) ─────────────────────────────────────
  {
    id: 'reso_echo_drone',
    name: 'Echo Drone',
    soundType: 'resonant',
    rarity: 'common',
    sonicPower: 15,
    resonancePower: 12,
    frequency: 14,
    description:
      'A low-frequency spirit that amplifies ambient canyon sounds. Simple but surprisingly powerful.',
    abilities: ['reso_amplify'],
  },
  {
    id: 'reso_reverb_wraith',
    name: 'Reverb Wraith',
    soundType: 'resonant',
    rarity: 'uncommon',
    sonicPower: 25,
    resonancePower: 30,
    frequency: 20,
    description:
      'A ghostly spirit that trails long reverberations. It can make whispers sound like thunderclaps.',
    abilities: ['reso_amplify', 'reso_long_tail'],
  },
  {
    id: 'reso_bass_behemoth',
    name: 'Bass Behemoth',
    soundType: 'resonant',
    rarity: 'rare',
    sonicPower: 55,
    resonancePower: 48,
    frequency: 16,
    description:
      'A massive spirit that produces earth-shaking bass frequencies. It can collapse cave walls with a single note.',
    abilities: ['reso_amplify', 'reso_long_tail', 'reso_sub_bass'],
  },
  {
    id: 'reso_tectonic_thrum',
    name: 'Tectonic Thrum',
    soundType: 'resonant',
    rarity: 'epic',
    sonicPower: 80,
    resonancePower: 85,
    frequency: 22,
    description:
      'A spirit that resonates with the tectonic plates themselves. Its vibrations can open fissures in solid rock.',
    abilities: ['reso_amplify', 'reso_long_tail', 'reso_sub_bass', 'reso_plate_chant'],
  },
  {
    id: 'reso_deep_reverberator',
    name: 'Deep Reverberator',
    soundType: 'resonant',
    rarity: 'legendary',
    sonicPower: 130,
    resonancePower: 125,
    frequency: 28,
    description:
      'The living echo of the canyon\'s creation. Its reverberation can be felt for miles and never truly fades.',
    abilities: ['reso_amplify', 'reso_long_tail', 'reso_sub_bass', 'reso_plate_chant', 'reso_eternal_echo'],
  },

  // ── Dissonant Spirits (5) ────────────────────────────────────
  {
    id: 'diss_static_shard',
    name: 'Static Shard',
    soundType: 'dissonant',
    rarity: 'common',
    sonicPower: 18,
    resonancePower: 5,
    frequency: 26,
    description:
      'A jagged spirit of white noise. It crackles and pops, disrupting nearby harmonics.',
    abilities: ['diss_static_burst'],
  },
  {
    id: 'diss_cacophony_imp',
    name: 'Cacophony Imp',
    soundType: 'dissonant',
    rarity: 'uncommon',
    sonicPower: 32,
    resonancePower: 10,
    frequency: 30,
    description:
      'A mischievous spirit that plays random notes at maximum volume. Its pranks can deafen the unwary.',
    abilities: ['diss_static_burst', 'diss_noise_blare'],
  },
  {
    id: 'diss_discord_horror',
    name: 'Discord Horror',
    soundType: 'dissonant',
    rarity: 'rare',
    sonicPower: 60,
    resonancePower: 20,
    frequency: 35,
    description:
      'A terrifying spirit of tritones and minor seconds. Its presence causes physical pain and confusion.',
    abilities: ['diss_static_burst', 'diss_noise_blare', 'diss_tritone_scream'],
  },
  {
    id: 'diss_shatter_storm',
    name: 'Shatter Storm',
    soundType: 'dissonant',
    rarity: 'epic',
    sonicPower: 90,
    resonancePower: 30,
    frequency: 40,
    description:
      'A swirling vortex of destructive frequencies. It can shatter crystal formations and enemy defenses alike.',
    abilities: ['diss_static_burst', 'diss_noise_blare', 'diss_tritone_scream', 'diss_glass_break'],
  },
  {
    id: 'diss_void_screamer',
    name: 'Void Screamer',
    soundType: 'dissonant',
    rarity: 'legendary',
    sonicPower: 145,
    resonancePower: 45,
    frequency: 50,
    description:
      'A spirit from the silence between notes. Its scream is the sound of reality tearing apart.',
    abilities: ['diss_static_burst', 'diss_noise_blare', 'diss_tritone_scream', 'diss_glass_break', 'diss_void_shriek'],
  },

  // ── Ethereal Spirits (5) ─────────────────────────────────────
  {
    id: 'ethe_murmur_wisp',
    name: 'Murmur Wisp',
    soundType: 'ethereal',
    rarity: 'common',
    sonicPower: 10,
    resonancePower: 15,
    frequency: 22,
    description:
      'A barely visible spirit that whispers in languages never spoken. It illuminates hidden paths.',
    abilities: ['ethe_phase_tone'],
  },
  {
    id: 'ethe_phantom_chord',
    name: 'Phantom Chord',
    soundType: 'ethereal',
    rarity: 'uncommon',
    sonicPower: 20,
    resonancePower: 28,
    frequency: 26,
    description:
      'A spirit that plays phantom notes that exist only in the listener\'s mind. Deeply disorienting.',
    abilities: ['ethe_phase_tone', 'ethe_ghost_note'],
  },
  {
    id: 'ethe_astral_singer',
    name: 'Astral Singer',
    soundType: 'ethereal',
    rarity: 'rare',
    sonicPower: 38,
    resonancePower: 45,
    frequency: 32,
    description:
      'A spirit that sings from the astral plane. Its melodies reveal hidden knowledge and forgotten lore.',
    abilities: ['ethe_phase_tone', 'ethe_ghost_note', 'ethe_star_hymn'],
  },
  {
    id: 'ethe_celestial_overtone',
    name: 'Celestial Overtone',
    soundType: 'ethereal',
    rarity: 'epic',
    sonicPower: 62,
    resonancePower: 70,
    frequency: 38,
    description:
      'A spirit composed entirely of overtones above human hearing. Its presence causes euphoria and visions.',
    abilities: ['ethe_phase_tone', 'ethe_ghost_note', 'ethe_star_hymn', 'ethe_ultrasonic_aura'],
  },
  {
    id: 'ethe_dreamweaver',
    name: 'Dreamweaver',
    soundType: 'ethereal',
    rarity: 'legendary',
    sonicPower: 100,
    resonancePower: 110,
    frequency: 42,
    description:
      'The spirit that weaves dreams from sound. It can put entire canyons to sleep with a single lullaby.',
    abilities: ['ethe_phase_tone', 'ethe_ghost_note', 'ethe_star_hymn', 'ethe_ultrasonic_aura', 'ethe_dream_weave'],
  },

  // ── Ancient Spirits (5) ──────────────────────────────────────
  {
    id: 'anci_rune_hum',
    name: 'Rune Hum',
    soundType: 'ancient',
    rarity: 'common',
    sonicPower: 14,
    resonancePower: 18,
    frequency: 10,
    description:
      'A spirit that vibrates at the frequency of ancient canyon runes. It slowly deciphers forgotten inscriptions.',
    abilities: ['anci_rumble'],
  },
  {
    id: 'anci_petrified_echo',
    name: 'Petrified Echo',
    soundType: 'ancient',
    rarity: 'uncommon',
    sonicPower: 28,
    resonancePower: 32,
    frequency: 12,
    description:
      'A spirit trapped in stone for millennia. It produces deep, grinding sounds like tectonic memory.',
    abilities: ['anci_rumble', 'anci_stone_voice'],
  },
  {
    id: 'anci_canyon_elder',
    name: 'Canyon Elder',
    soundType: 'ancient',
    rarity: 'rare',
    sonicPower: 50,
    resonancePower: 55,
    frequency: 15,
    description:
      'An ancient spirit that remembers when the canyons were young. Its deep voice carries the weight of ages.',
    abilities: ['anci_rumble', 'anci_stone_voice', 'anci_deep_time'],
  },
  {
    id: 'anci_primordial_song',
    name: 'Primordial Song',
    soundType: 'ancient',
    rarity: 'epic',
    sonicPower: 78,
    resonancePower: 82,
    frequency: 18,
    description:
      'A spirit that sings the song of creation itself. The canyon walls vibrate in harmony with its voice.',
    abilities: ['anci_rumble', 'anci_stone_voice', 'anci_deep_time', 'anci_creation_drone'],
  },
  {
    id: 'anci_first_resonance',
    name: 'First Resonance',
    soundType: 'ancient',
    rarity: 'legendary',
    sonicPower: 120,
    resonancePower: 115,
    frequency: 25,
    description:
      'The first sound ever to echo in the canyons. It contains the memory of the world\'s first vibration.',
    abilities: ['anci_rumble', 'anci_stone_voice', 'anci_deep_time', 'anci_creation_drone', 'anci_origin_tone'],
  },

  // ── Chaotic Spirits (5) ──────────────────────────────────────
  {
    id: 'chao_noise_sprite',
    name: 'Noise Sprite',
    soundType: 'chaotic',
    rarity: 'common',
    sonicPower: 20,
    resonancePower: 8,
    frequency: 32,
    description:
      'A jittery sprite that produces random frequencies. Unpredictable but occasionally brilliant.',
    abilities: ['chao_static'],
  },
  {
    id: 'chao_feedback_fiend',
    name: 'Feedback Fiend',
    soundType: 'chaotic',
    rarity: 'uncommon',
    sonicPower: 35,
    resonancePower: 15,
    frequency: 36,
    description:
      'A spirit that feeds on its own output, creating spiraling feedback loops of increasing intensity.',
    abilities: ['chao_static', 'chao_loop_spiral'],
  },
  {
    id: 'chao_turbulence_shade',
    name: 'Turbulence Shade',
    soundType: 'chaotic',
    rarity: 'rare',
    sonicPower: 58,
    resonancePower: 28,
    frequency: 42,
    description:
      'A dark spirit of turbulent air. It generates chaotic sound patterns that warp reality in small areas.',
    abilities: ['chao_static', 'chao_loop_spiral', 'chao_warp_tone'],
  },
  {
    id: 'chao_sonic_maelstrom',
    name: 'Sonic Maelstrom',
    soundType: 'chaotic',
    rarity: 'epic',
    sonicPower: 88,
    resonancePower: 40,
    frequency: 48,
    description:
      'A swirling vortex of impossible frequencies. It distorts space-time with sheer auditory chaos.',
    abilities: ['chao_static', 'chao_loop_spiral', 'chao_warp_tone', 'chao_dimensional_drone'],
  },
  {
    id: 'chao_entropy_voice',
    name: 'Entropy Voice',
    soundType: 'chaotic',
    rarity: 'legendary',
    sonicPower: 140,
    resonancePower: 55,
    frequency: 55,
    description:
      'The voice of entropy itself. When it speaks, the canyon walls crack and reform into new shapes.',
    abilities: ['chao_static', 'chao_loop_spiral', 'chao_warp_tone', 'chao_dimensional_drone', 'chao_entropy_crescendo'],
  },

  // ── Primal Spirits (5) ───────────────────────────────────────
  {
    id: 'prim_heartbeat_wisp',
    name: 'Heartbeat Wisp',
    soundType: 'primal',
    rarity: 'common',
    sonicPower: 16,
    resonancePower: 14,
    frequency: 20,
    description:
      'A spirit that pulses with a slow, rhythmic beat like a sleeping giant\'s heart. Grounding and steady.',
    abilities: ['prim_pulse'],
  },
  {
    id: 'prim_pulse_guardian',
    name: 'Pulse Guardian',
    soundType: 'primal',
    rarity: 'uncommon',
    sonicPower: 30,
    resonancePower: 28,
    frequency: 22,
    description:
      'A protective spirit whose steady pulse creates a sonic shield around its allies.',
    abilities: ['prim_pulse', 'prim_shield_beat'],
  },
  {
    id: 'prim_thunder_drum',
    name: 'Thunder Drum',
    soundType: 'primal',
    rarity: 'rare',
    sonicPower: 52,
    resonancePower: 42,
    frequency: 18,
    description:
      'A massive spirit that strikes the canyon floor like a drum, producing thunderous shockwaves.',
    abilities: ['prim_pulse', 'prim_shield_beat', 'prim_thunder_strike'],
  },
  {
    id: 'prim_seismic_bell',
    name: 'Seismic Bell',
    soundType: 'primal',
    rarity: 'epic',
    sonicPower: 85,
    resonancePower: 75,
    frequency: 24,
    description:
      'A colossal bell-shaped spirit. When it rings, the entire canyon vibrates and shifts.',
    abilities: ['prim_pulse', 'prim_shield_beat', 'prim_thunder_strike', 'prim_quake_ring'],
  },
  {
    id: 'prim_world_hum',
    name: 'World Hum',
    soundType: 'primal',
    rarity: 'legendary',
    sonicPower: 135,
    resonancePower: 105,
    frequency: 30,
    description:
      'The fundamental frequency of the planet itself. The World Hum holds all canyons together through resonance.',
    abilities: ['prim_pulse', 'prim_shield_beat', 'prim_thunder_strike', 'prim_quake_ring', 'prim_planetary_tone'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: EC_CHAMBERS — 8 Resonance Chambers
// ═══════════════════════════════════════════════════════════════════

export const EC_CHAMBERS: readonly EcChamberDef[] = [
  {
    id: 'whispering_gorge',
    name: 'Whispering Gorge',
    description:
      'A narrow gorge where every whisper echoes endlessly. Harmonic spirits gather here in great numbers.',
    depth: 0,
    dangerLevel: 1,
    requiredTitle: 'title_sound_seeker',
    soundType: 'harmonic',
    bgGradient: 'linear-gradient(180deg, #F59E0B 0%, #D4A017 50%, #78350F 100%)',
    ambientColor: EC_CANYON_AMBER,
  },
  {
    id: 'crystal_cavern',
    name: 'Crystal Cavern',
    description:
      'A cavern filled with resonant crystals that amplify any sound. Primal spirits nest among the formations.',
    depth: 1,
    dangerLevel: 2,
    requiredTitle: 'title_sound_seeker',
    soundType: 'resonant',
    bgGradient: 'linear-gradient(180deg, #14B8A6 0%, #4169E1 50%, #D4A017 100%)',
    ambientColor: EC_CRYSTAL_TEAL,
  },
  {
    id: 'echoing_falls',
    name: 'Echoing Falls',
    description:
      'A subterranean waterfall where sound bends and warps. Ethereal spirits dance in the mist.',
    depth: 2,
    dangerLevel: 3,
    requiredTitle: 'title_echo_listener',
    soundType: 'ethereal',
    bgGradient: 'linear-gradient(180deg, #8B5CF6 0%, #4169E1 50%, #14B8A6 100%)',
    ambientColor: EC_SONIC_PURPLE,
  },
  {
    id: 'harmonic_grotto',
    name: 'Harmonic Grotto',
    description:
      'A perfectly shaped grotto where sound waves align in mathematical harmony. Ancient spirits resonate here.',
    depth: 3,
    dangerLevel: 4,
    requiredTitle: 'title_harmonic_adept',
    soundType: 'ancient',
    bgGradient: 'linear-gradient(180deg, #78350F 0%, #D4A017 50%, #F59E0B 100%)',
    ambientColor: EC_CAVE_BROWN,
  },
  {
    id: 'dissonance_abyss',
    name: 'Dissonance Abyss',
    description:
      'A terrifying chasm where all sound becomes discord. Chaotic spirits thrive in the pandemonium.',
    depth: 4,
    dangerLevel: 5,
    requiredTitle: 'title_sonic_walker',
    soundType: 'chaotic',
    bgGradient: 'linear-gradient(180deg, #DC2626 0%, #78350F 50%, #8B5CF6 100%)',
    ambientColor: EC_DISSONANT_RED,
  },
  {
    id: 'ancient_amphitheater',
    name: 'Ancient Amphitheater',
    description:
      'A colossal natural amphitheater carved by sound over eons. The most powerful spirits perform here.',
    depth: 5,
    dangerLevel: 6,
    requiredTitle: 'title_chamber_keeper',
    soundType: 'ancient',
    bgGradient: 'linear-gradient(180deg, #D4A017 0%, #78350F 50%, #DC2626 100%)',
    ambientColor: EC_RESONANCE_GOLD,
  },
  {
    id: 'chaos_rift',
    name: 'Chaos Rift',
    description:
      'A tear in reality where frequencies from different dimensions collide. Only the strongest spirits survive.',
    depth: 6,
    dangerLevel: 7,
    requiredTitle: 'title_canyon_master',
    soundType: 'dissonant',
    bgGradient: 'linear-gradient(180deg, #DC2626 0%, #8B5CF6 50%, #4169E1 100%)',
    ambientColor: EC_DISSONANT_RED,
  },
  {
    id: 'primal_core',
    name: 'Primal Core',
    description:
      'The heart of the canyon system where the first sound was born. Legendary spirits guard this sacred place.',
    depth: 7,
    dangerLevel: 8,
    requiredTitle: 'title_spirit_lord',
    soundType: 'primal',
    bgGradient: 'linear-gradient(180deg, #F59E0B 0%, #D4A017 50%, #DC2626 100%)',
    ambientColor: EC_RESONANCE_GOLD,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: EC_CRYSTALS — 30 Harmonic Crystals
// ═══════════════════════════════════════════════════════════════════

export const EC_CRYSTALS: readonly EcCrystalDef[] = [
  // Common (8)
  { id: 'cry_echo_shard', name: 'Echo Shard', emoji: '💎', type: 'shard', rarity: 'common', sonicBonus: 2, resonanceBonus: 1, value: 10, description: 'A small crystalline shard that produces a faint echo when tapped.' },
  { id: 'cry_harmonic_dust', name: 'Harmonic Dust', emoji: '✨', type: 'resonance_dust', rarity: 'common', sonicBonus: 5, resonanceBonus: 0, value: 15, description: 'Fine powder that hums at a pleasant frequency. Used in basic sonic infusions.' },
  { id: 'cry_resonance_pebble', name: 'Resonance Pebble', emoji: '🪨', type: 'shard', rarity: 'common', sonicBonus: 1, resonanceBonus: 3, value: 12, description: 'A smooth pebble from the canyon floor that rings like a tuning fork.' },
  { id: 'cry_whisper_stone', name: 'Whisper Stone', emoji: '🔇', type: 'echo_fossil', rarity: 'common', sonicBonus: 4, resonanceBonus: 0, value: 18, description: 'A stone that captures whispers and replays them weeks later.' },
  { id: 'cry_sound_fragment', name: 'Sound Fragment', emoji: '🔊', type: 'shard', rarity: 'common', sonicBonus: 3, resonanceBonus: 2, value: 14, description: 'A fragment of solidified sound. It vibrates faintly when held.' },
  { id: 'cry_tone_cluster', name: 'Tone Cluster', emoji: '🎵', type: 'resonance_dust', rarity: 'common', sonicBonus: 6, resonanceBonus: 0, value: 20, description: 'A cluster of tiny crystals each tuned to a different note in the scale.' },
  { id: 'cry_cave_quartz', name: 'Cave Quartz', emoji: '⬜', type: 'shard', rarity: 'common', sonicBonus: 5, resonanceBonus: 1, value: 16, description: 'A quartz formation from deep in the caves. It amplifies nearby sounds slightly.' },
  { id: 'cry_pulse_gem', name: 'Pulse Gem', emoji: '💠', type: 'shard', rarity: 'common', sonicBonus: 0, resonanceBonus: 4, value: 8, description: 'A gem that pulses with a slow, rhythmic glow. Used in basic healing rituals.' },

  // Uncommon (7)
  { id: 'cry_chime_crystal', name: 'Chime Crystal', emoji: '🔔', type: 'shard', rarity: 'uncommon', sonicBonus: 15, resonanceBonus: 0, value: 80, description: 'A crystal that produces perfect chime tones. Prized by canyon architects.' },
  { id: 'cry_reverb_gem', name: 'Reverb Gem', emoji: '🔮', type: 'shard', rarity: 'uncommon', sonicBonus: 5, resonanceBonus: 8, value: 65, description: 'A gem that extends sound duration, making any note last ten times longer.' },
  { id: 'cry_bass_quartz', name: 'Bass Quartz', emoji: '⬛', type: 'shard', rarity: 'uncommon', sonicBonus: 20, resonanceBonus: 0, value: 90, description: 'A dense quartz that vibrates at sub-bass frequencies. The ground shakes near it.' },
  { id: 'cry_overtone_shard', name: 'Overtone Shard', emoji: '🌟', type: 'artifact_fragment', rarity: 'uncommon', sonicBonus: 2, resonanceBonus: 15, value: 70, description: 'A shard that reveals hidden overtones in any sound played near it.' },
  { id: 'cry_canyon_echo', name: 'Canyon Echo Stone', emoji: '🏔️', type: 'echo_fossil', rarity: 'uncommon', sonicBonus: 8, resonanceBonus: 12, value: 75, description: 'A stone containing a perfect recording of the canyon\'s natural resonance.' },
  { id: 'cry_sonic_fossil', name: 'Sonic Fossil', emoji: '🦴', type: 'echo_fossil', rarity: 'uncommon', sonicBonus: 18, resonanceBonus: 5, value: 85, description: 'A fossilized imprint of an ancient sound wave. Still faintly audible at night.' },
  { id: 'cry_harmony_opal', name: 'Harmony Opal', emoji: '🌈', type: 'shard', rarity: 'uncommon', sonicBonus: 10, resonanceBonus: 10, value: 72, description: 'An opal that refracts sound into beautiful rainbow harmonics.' },

  // Rare (6)
  { id: 'cry_harmony_diamond', name: 'Harmony Diamond', emoji: '💎', type: 'shard', rarity: 'rare', sonicBonus: 35, resonanceBonus: 15, value: 350, description: 'A flawless diamond tuned to the harmonic series. It can purify any corrupted frequency.' },
  { id: 'cry_dissonance_jade', name: 'Dissonance Jade', emoji: '💚', type: 'artifact_fragment', rarity: 'rare', sonicBonus: 20, resonanceBonus: 25, value: 300, description: 'A jade stone that vibrates with controlled dissonance. Essential for breaking sonic barriers.' },
  { id: 'cry_astral_prism', name: 'Astral Prism', emoji: '🔺', type: 'shard', rarity: 'rare', sonicBonus: 45, resonanceBonus: 0, value: 400, description: 'A prism that splits sound into its component frequencies. Reveals the structure of any tone.' },
  { id: 'cry_ancient_resonite', name: 'Ancient Resonite', emoji: '🟤', type: 'echo_fossil', rarity: 'rare', sonicBonus: 15, resonanceBonus: 20, value: 320, description: 'A mineral from the canyon\'s deepest layer. It contains the resonance of an ancient civilization.' },
  { id: 'cry_chaos_amethyst', name: 'Chaos Amethyst', emoji: '🟣', type: 'artifact_fragment', rarity: 'rare', sonicBonus: 30, resonanceBonus: 25, value: 380, description: 'An amethyst crackling with unstable energy. It can randomly amplify or dampen nearby sounds.' },
  { id: 'cry_primal_sapphire', name: 'Primal Sapphire', emoji: '🔵', type: 'shard', rarity: 'rare', sonicBonus: 25, resonanceBonus: 10, value: 360, description: 'A deep blue sapphire that pulses with the planet\'s fundamental frequency.' },

  // Epic (5)
  { id: 'cry_echo_core', name: 'Echo Core', emoji: '🌀', type: 'essence', rarity: 'epic', sonicBonus: 80, resonanceBonus: 20, value: 1500, description: 'The crystallized essence of pure echo. It contains every sound ever reflected in the canyons.' },
  { id: 'cry_resonance_heart', name: 'Resonance Heart', emoji: '❤️', type: 'essence', rarity: 'epic', sonicBonus: 30, resonanceBonus: 60, value: 1400, description: 'A living crystal that beats like a heart. Its rhythm synchronizes all nearby spirits.' },
  { id: 'cry_sonic_blade_crystal', name: 'Sonic Blade Crystal', emoji: '🗡️', type: 'artifact_fragment', rarity: 'epic', sonicBonus: 75, resonanceBonus: 40, value: 1600, description: 'A razor-sharp crystal that vibrates at cutting frequencies. Can slice through solid rock.' },
  { id: 'cry_cave_pearl', name: 'Cave Pearl', emoji: '🫧', type: 'essence', rarity: 'epic', sonicBonus: 20, resonanceBonus: 20, value: 1800, description: 'A pearl formed over millennia by the drip of resonance-infused water. The ultimate healing reagent.' },
  { id: 'cry_frequency_topaz', name: 'Frequency Topaz', emoji: '🔶', type: 'artifact_fragment', rarity: 'epic', sonicBonus: 40, resonanceBonus: 35, value: 1700, description: 'A topaz that shifts color based on the dominant frequency nearby. Reveals hidden sound types.' },

  // Legendary (4)
  { id: 'cry_world_harmony_gem', name: 'World Harmony Gem', emoji: '🌍', type: 'essence', rarity: 'legendary', sonicBonus: 50, resonanceBonus: 50, value: 8000, description: 'A gem containing the harmonic frequency of the entire world. Holding it brings instant peace.' },
  { id: 'cry_first_sound_crystal', name: 'First Sound Crystal', emoji: '✨', type: 'essence', rarity: 'legendary', sonicBonus: 120, resonanceBonus: 30, value: 10000, description: 'The crystallized vibration of the very first sound in existence. Its power is beyond measure.' },
  { id: 'cry_void_echo_orb', name: 'Void Echo Orb', emoji: '🕳️', type: 'artifact_fragment', rarity: 'legendary', sonicBonus: 60, resonanceBonus: 80, value: 9000, description: 'An orb from the void between sounds. It can silence anything or amplify a whisper to deafening levels.' },
  { id: 'cry_entropy_diamond', name: 'Entropy Diamond', emoji: '💀', type: 'essence', rarity: 'legendary', sonicBonus: 40, resonanceBonus: 40, value: 12000, description: 'A diamond that exists in all frequencies simultaneously. It can reshape the laws of sound itself.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: EC_STRUCTURES — 25 Echo Towers (upgradeable to L10)
// ═══════════════════════════════════════════════════════════════════

export const EC_STRUCTURES: readonly EcStructureDef[] = [
  // ── Echo Towers (7) ──────────────────────────────────────────
  { id: 'str_reed_tower', name: 'Reed Echo Tower', emoji: '🗼', category: 'echo_tower', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4, description: 'A simple tower of resonant reeds that amplifies spirit signals across the canyon.' },
  { id: 'str_basin_tower', name: 'Sound Basin Tower', emoji: '🏛️', category: 'echo_tower', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 80, costMultiplier: 1.5, description: 'A tower built around a natural sound basin. It captures and redirects canyon echoes.' },
  { id: 'str_crystal_spire', name: 'Crystal Spire', emoji: '💎', category: 'echo_tower', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.5, description: 'A towering spire of harmonic crystals. It broadcasts purified frequencies for miles.' },
  { id: 'str_shadow_steeple', name: 'Shadow Steeple', emoji: '🌑', category: 'echo_tower', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 180, costMultiplier: 1.6, description: 'A dark steeple that absorbs and inverts sound waves. Dissonant spirits are drawn to it.' },
  { id: 'str_golden_belfry', name: 'Golden Belfry', emoji: '🔔', category: 'echo_tower', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 150, costMultiplier: 1.5, description: 'A belfry housing a massive golden bell. Its toll can be heard across the entire canyon network.' },
  { id: 'str_moonlight_spire', name: 'Moonlight Spire', emoji: '🌙', category: 'echo_tower', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 160, costMultiplier: 1.5, description: 'A spire that only resonates under moonlight. Ethereal spirits gather at its peak.' },
  { id: 'str_lava_column', name: 'Lava Sound Column', emoji: '🌋', category: 'echo_tower', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 200, costMultiplier: 1.6, description: 'A column of cooled lava with magma channels. Primal spirits power its deep rumble.' },

  // ── Resonance Pools (6) ──────────────────────────────────────
  { id: 'str_echo_pool', name: 'Echo Pool', emoji: '💧', category: 'resonance_pool', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, description: 'A pool of still water that perfectly reflects sound waves. Restores spirit charge and harmony.' },
  { id: 'str_vibration_basin', name: 'Vibration Basin', emoji: '🌊', category: 'resonance_pool', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 250, costMultiplier: 1.6, description: 'A basin that vibrates at healing frequencies. Soaking here cures all spirit ailments.' },
  { id: 'str_crystal_lake', name: 'Crystal Resonance Lake', emoji: '🏊', category: 'resonance_pool', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 400, costMultiplier: 1.7, description: 'A lake filled with tiny floating crystals. It accelerates spirit recovery and growth.' },
  { id: 'str_sacred_spring', name: 'Sacred Spring', emoji: '⛲', category: 'resonance_pool', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 600, costMultiplier: 1.8, description: 'A spring that produces perfectly tuned water drops. It can restore even legendary spirits.' },
  { id: 'str_sonic_sanctum', name: 'Sonic Sanctum', emoji: '🌟', category: 'resonance_pool', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 900, costMultiplier: 1.9, description: 'A soundproofed chamber where spirits can rest without any external interference.' },
  { id: 'str_harmony_hot_spring', name: 'Harmony Hot Spring', emoji: '♨️', category: 'resonance_pool', maxLevel: 10, baseEffect: 14, effectPerLevel: 7, baseCost: 850, costMultiplier: 1.9, description: 'A naturally heated spring that harmonizes spirit frequencies. Grants temporary buffs.' },

  // ── Sonic Forges (5) ─────────────────────────────────────────
  { id: 'str_basic_forge', name: 'Basic Sonic Forge', emoji: '🔨', category: 'sonic_forge', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 120, costMultiplier: 1.5, description: 'A simple forge that uses sound waves to shape and refine crystals.' },
  { id: 'str_frequency_anvil', name: 'Frequency Anvil', emoji: '⚒️', category: 'sonic_forge', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.6, description: 'An anvil tuned to specific frequencies. Perfect for crafting precision sonic tools.' },
  { id: 'str_resonance_crucible', name: 'Resonance Crucible', emoji: '🏺', category: 'sonic_forge', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 500, costMultiplier: 1.7, description: 'A crucible that uses resonance to merge crystal fragments into more powerful forms.' },
  { id: 'str_sonic_extract_chamber', name: 'Sonic Extraction Chamber', emoji: '🔬', category: 'sonic_forge', maxLevel: 10, baseEffect: 20, effectPerLevel: 10, baseCost: 800, costMultiplier: 1.8, description: 'A chamber that isolates and extracts pure sonic essence from raw materials.' },
  { id: 'str_creation_forge', name: 'Creation Forge', emoji: '🌋', category: 'sonic_forge', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1200, costMultiplier: 2.0, description: 'The ultimate sonic forge. It can create legendary crystals from raw sound waves.' },

  // ── Cave Altars (4) ──────────────────────────────────────────
  { id: 'str_rock_altar', name: 'Rock Altar', emoji: '🪨', category: 'cave_altar', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 200, costMultiplier: 1.5, description: 'A simple altar of resonant rock that amplifies ancient spirit abilities.' },
  { id: 'str_echo_shrine', name: 'Echo Shrine', emoji: '🛕', category: 'cave_altar', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 450, costMultiplier: 1.7, description: 'A shrine that captures and preserves echoes of powerful spirits for later use.' },
  { id: 'str_monolith', name: 'Sonic Monolith', emoji: '🗿', category: 'cave_altar', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 700, costMultiplier: 1.8, description: 'A towering monolith that channels deep earth frequencies and boosts all spirit powers.' },
  { id: 'str_summit_altar', name: 'Summit Altar', emoji: '👑', category: 'cave_altar', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1500, costMultiplier: 2.0, description: 'The highest altar at the canyon summit. All sonic blessings are amplified to their maximum here.' },

  // ── Relic Shrines (3) ────────────────────────────────────────
  { id: 'str_relic_pedestal', name: 'Relic Pedestal', emoji: '🖼️', category: 'relic_shrine', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.5, description: 'A stone pedestal for displaying sound relics and boosting their passive effects.' },
  { id: 'str_vault_shrine', name: 'Sacred Vault Shrine', emoji: '🔒', category: 'relic_shrine', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 600, costMultiplier: 1.7, description: 'A magically sealed vault that preserves and amplifies the power of stored relics.' },
  { id: 'str_harmony_shrine', name: 'Harmony Shrine', emoji: '🔔', category: 'relic_shrine', maxLevel: 10, baseEffect: 30, effectPerLevel: 15, baseCost: 2000, costMultiplier: 2.0, description: 'A shrine attuned to the fundamental frequency of creation. It can restore and upgrade relics.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: EC_ABILITIES — 22 Sonic Abilities
// ═══════════════════════════════════════════════════════════════════

export const EC_ABILITIES: readonly EcAbilityDef[] = [
  { id: 'ab_gentle_hum', name: 'Gentle Hum', emoji: '🎵', soundType: 'harmonic', type: 'active', rarity: 'common', energyCost: 5, cooldown: 30, power: 15, description: 'Produce a soothing hum that calms spirits and heals minor wounds.' },
  { id: 'ab_amplify', name: 'Amplify', emoji: '📢', soundType: 'resonant', type: 'active', rarity: 'common', energyCost: 8, cooldown: 45, power: 20, description: 'Amplify a friendly spirit\'s sonic output by 200% for a short duration.' },
  { id: 'ab_static_burst', name: 'Static Burst', emoji: '⚡', soundType: 'dissonant', type: 'active', rarity: 'common', energyCost: 10, cooldown: 60, power: 10, description: 'Release a burst of white noise that scrambles enemy frequencies.' },
  { id: 'ab_phase_tone', name: 'Phase Tone', emoji: '👻', soundType: 'ethereal', type: 'active', rarity: 'common', energyCost: 12, cooldown: 90, power: 5, description: 'Shift partially out of phase with reality, becoming briefly intangible.' },
  { id: 'ab_rumble', name: 'Rumble', emoji: '🌫️', soundType: 'ancient', type: 'active', rarity: 'common', energyCost: 6, cooldown: 30, power: 12, description: 'Create a low-frequency rumble that dislodges hidden crystals from canyon walls.' },
  { id: 'ab_static_noise', name: 'Static Noise', emoji: '📡', soundType: 'chaotic', type: 'active', rarity: 'common', energyCost: 7, cooldown: 35, power: 10, description: 'Generate random noise patterns that confuse enemies and disrupt their abilities.' },
  { id: 'ab_pulse', name: 'Pulse', emoji: '💨', soundType: 'primal', type: 'active', rarity: 'common', energyCost: 8, cooldown: 40, power: 18, description: 'Emit a powerful pulse wave that pushes enemies away and shatters weak barriers.' },
  { id: 'ab_bell_tone', name: 'Bell Tone', emoji: '🔔', soundType: 'harmonic', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 30, description: 'Strike a perfect bell tone that resonates through the canyon, revealing hidden paths.' },
  { id: 'ab_long_tail', name: 'Long Tail', emoji: '🌊', soundType: 'resonant', type: 'active', rarity: 'uncommon', energyCost: 20, cooldown: 90, power: 35, description: 'Extend the duration of any sound ability, making its effects last three times longer.' },
  { id: 'ab_noise_blare', name: 'Noise Blare', emoji: '📯', soundType: 'dissonant', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 75, power: 28, description: 'Blast a wall of noise that deafens enemies and breaks concentration.' },
  { id: 'ab_ghost_note', name: 'Ghost Note', emoji: '👻', soundType: 'ethereal', type: 'active', rarity: 'uncommon', energyCost: 22, cooldown: 100, power: 32, description: 'Play a note that exists between dimensions, damaging enemies on multiple planes.' },
  { id: 'ab_shield_beat', name: 'Shield Beat', emoji: '🛡️', soundType: 'primal', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 25, description: 'Create a sonic shield by producing a steady protective rhythm around allies.' },
  { id: 'ab_stone_voice', name: 'Stone Voice', emoji: '🗿', soundType: 'ancient', type: 'active', rarity: 'uncommon', energyCost: 16, cooldown: 55, power: 30, description: 'Speak with the voice of canyon stone, commanding rock formations to shift.' },
  { id: 'ab_loop_spiral', name: 'Loop Spiral', emoji: '🌀', soundType: 'chaotic', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 80, power: 22, description: 'Create a feedback loop that spirals in power, dealing increasing damage each cycle.' },
  { id: 'ab_triad_blast', name: 'Triad Blast', emoji: '🎶', soundType: 'harmonic', type: 'active', rarity: 'rare', energyCost: 30, cooldown: 120, power: 50, description: 'Fire a devastating triad of perfectly tuned frequencies that shatter defenses.' },
  { id: 'ab_sub_bass', name: 'Sub Bass Drop', emoji: '🔊', soundType: 'resonant', type: 'active', rarity: 'rare', energyCost: 35, cooldown: 150, power: 55, description: 'Drop to sub-bass frequencies that shake the ground and stagger all nearby enemies.' },
  { id: 'ab_star_hymn', name: 'Star Hymn', emoji: '⭐', soundType: 'ethereal', type: 'active', rarity: 'rare', energyCost: 25, cooldown: 120, power: 40, description: 'Sing a hymn borrowed from the stars. Heals allies and reveals invisible threats.' },
  { id: 'ab_warp_tone', name: 'Warp Tone', emoji: '🌀', soundType: 'chaotic', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 110, power: 45, description: 'Produce a tone that warps local space, teleporting the user a short distance.' },
  { id: 'ab_deep_time', name: 'Deep Time', emoji: '⏳', soundType: 'ancient', type: 'passive', rarity: 'rare', energyCost: 0, cooldown: 0, power: 15, description: 'Sense vibrations from the deep past, automatically detecting ancient traps and hidden chambers.' },
  { id: 'ab_thunder_strike', name: 'Thunder Strike', emoji: '⛈️', soundType: 'primal', type: 'active', rarity: 'rare', energyCost: 40, cooldown: 180, power: 60, description: 'Strike the ground with a thunderous sonic blow, creating a shockwave in all directions.' },
  { id: 'ab_celestial_chord', name: 'Celestial Chord', emoji: '🌟', soundType: 'harmonic', type: 'active', rarity: 'epic', energyCost: 50, cooldown: 300, power: 80, description: 'Play a chord from the celestial scale. All friendly spirits gain massive power boost.' },
  { id: 'ab_eternal_echo', name: 'Eternal Echo', emoji: '♾️', soundType: 'resonant', type: 'active', rarity: 'legendary', energyCost: 60, cooldown: 600, power: 120, description: 'Unleash an echo that never fades. It bounces through the canyon, hitting every enemy infinitely.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: EC_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const EC_ACHIEVEMENTS: readonly EcAchievementDef[] = [
  { id: 'ach_first_capture', name: 'First Capture', emoji: '👻', description: 'Capture your first sound spirit.', condition: 'capture_1', reward: { gold: 50, resonance: 10 } },
  { id: 'ach_five_captured', name: 'Spirit Collector', emoji: '🤚', description: 'Capture 5 different spirits.', condition: 'capture_5', reward: { gold: 200, resonance: 40 } },
  { id: 'ach_first_harvest', name: 'Crystal Gatherer', emoji: '💎', description: 'Harvest crystals for the first time.', condition: 'harvest_1', reward: { gold: 80, resonance: 15 } },
  { id: 'ach_ten_harvests', name: 'Master Harvester', emoji: '⚒️', description: 'Harvest crystals 10 times.', condition: 'harvest_10', reward: { gold: 300, resonance: 60 } },
  { id: 'ach_first_build', name: 'Tower Raiser', emoji: '🏗️', description: 'Build your first echo tower.', condition: 'build_1', reward: { gold: 100, resonance: 20 } },
  { id: 'ach_five_builds', name: 'Canyon Architect', emoji: '🏛️', description: 'Build 5 different structures.', condition: 'build_5', reward: { gold: 500, resonance: 80 } },
  { id: 'ach_chamber_explore', name: 'Chamber Explorer', emoji: '🗺️', description: 'Explore 4 different resonance chambers.', condition: 'chamber_4', reward: { gold: 400, resonance: 50 } },
  { id: 'ach_all_chambers', name: 'Canyon Cartographer', emoji: '🌍', description: 'Explore all 8 resonance chambers.', condition: 'chamber_8', reward: { gold: 2000, resonance: 200 } },
  { id: 'ach_rare_capture', name: 'Rare Catch', emoji: '💎', description: 'Capture a rare spirit.', condition: 'rare_capture', reward: { gold: 500, resonance: 100 } },
  { id: 'ach_epic_capture', name: 'Epic Discovery', emoji: '🌟', description: 'Capture an epic spirit.', condition: 'epic_capture', reward: { gold: 1500, resonance: 250 } },
  { id: 'ach_legendary_capture', name: 'Legendary Spiritmaster', emoji: '👑', description: 'Capture a legendary spirit.', condition: 'legendary_capture', reward: { gold: 5000, resonance: 500 } },
  { id: 'ach_first_relic', name: 'Relic Finder', emoji: '🏺', description: 'Discover your first sound artifact.', condition: 'relic_1', reward: { gold: 300, resonance: 60 } },
  { id: 'ach_five_relics', name: 'Artifact Hunter', emoji: '🔍', description: 'Collect 5 different relics.', condition: 'relic_5', reward: { gold: 1000, resonance: 150 } },
  { id: 'ach_first_event', name: 'Event Survivor', emoji: '⚡', description: 'Survive your first canyon event.', condition: 'event_1', reward: { gold: 200, resonance: 30 } },
  { id: 'ach_ten_events', name: 'Event Veteran', emoji: '🏅', description: 'Survive 10 canyon events.', condition: 'event_10', reward: { gold: 800, resonance: 120 } },
  { id: 'ach_upgrade_max', name: 'Master Builder', emoji: '🔨', description: 'Upgrade any structure to level 10.', condition: 'upgrade_10', reward: { gold: 2000, resonance: 200 } },
  { id: 'ach_all_sound_types', name: 'Sound Type Master', emoji: '🌈', description: 'Capture at least one spirit of each sound type.', condition: 'all_sound_types', reward: { gold: 3000, resonance: 300 } },
  { id: 'ach_max_title', name: 'Echo Deity', emoji: '👑', description: 'Reach the title of Echo Deity.', condition: 'max_title', reward: { gold: 10000, resonance: 1000 } },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: EC_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const EC_TITLES: readonly EcTitleDef[] = [
  { id: 'title_sound_seeker', name: 'Sound Seeker', emoji: '👂', minResonance: 0, minSpirits: 0, description: 'A novice who has just begun listening to the canyon echoes.' },
  { id: 'title_echo_listener', name: 'Echo Listener', emoji: '🗣️', minResonance: 50, minSpirits: 3, description: 'One who can distinguish individual echoes in the canyon chorus.' },
  { id: 'title_harmonic_adept', name: 'Harmonic Adept', emoji: '🎵', minResonance: 200, minSpirits: 7, description: 'A skilled practitioner who can harmonize with canyon spirits.' },
  { id: 'title_sonic_walker', name: 'Sonic Walker', emoji: '👟', minResonance: 500, minSpirits: 12, description: 'An explorer who navigates by sound alone, feeling vibrations through the rock.' },
  { id: 'title_chamber_keeper', name: 'Chamber Keeper', emoji: '🛡️', minResonance: 1200, minSpirits: 18, description: 'A guardian of the resonance chambers, trusted with their deepest secrets.' },
  { id: 'title_canyon_master', name: 'Canyon Master', emoji: '🏔️', minResonance: 2500, minSpirits: 24, description: 'A master who commands the entire canyon system through sonic mastery.' },
  { id: 'title_spirit_lord', name: 'Spirit Lord', emoji: '👹', minResonance: 5000, minSpirits: 30, description: 'A legendary being whose voice is obeyed by every spirit in the canyons.' },
  { id: 'title_echo_deity', name: 'Echo Deity', emoji: '👑', minResonance: 10000, minSpirits: 35, description: 'The supreme Echo Deity, master of all sound and resonance in the canyon realm.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: EC_RELICS — 15 Legendary Sound Artifacts
// ═══════════════════════════════════════════════════════════════════

export const EC_RELICS: readonly EcRelicDef[] = [
  { id: 'relic_echo_crown', name: 'Crown of Echoes', emoji: '👑', rarity: 'epic', soundType: 'harmonic', sonicBoost: 20, resonanceBoost: 15, frequencyBoost: 10, value: 2000, description: 'A crown that turns every spoken word into a resonant echo. It commands harmonic spirits.' },
  { id: 'relic_staff_vibrations', name: 'Staff of Vibrations', emoji: '🪄', rarity: 'epic', soundType: 'resonant', sonicBoost: 35, resonanceBoost: 5, frequencyBoost: 5, value: 2200, description: 'A staff that channels raw vibrations. Its touch can make any surface resonate at will.' },
  { id: 'relic_canyon_amulet', name: 'Canyon Amulet', emoji: '📿', rarity: 'rare', soundType: 'primal', sonicBoost: 10, resonanceBoost: 10, frequencyBoost: 15, value: 800, description: 'An amulet containing a piece of the canyon floor. It grants spirits incredible speed.' },
  { id: 'relic_sonic_ring', name: 'Sonic Ring', emoji: '💍', rarity: 'rare', soundType: 'chaotic', sonicBoost: 5, resonanceBoost: 20, frequencyBoost: 10, value: 750, description: 'A ring that produces controlled chaos frequencies. It hardens spirit defenses against disruption.' },
  { id: 'relic_phantom_mask', name: 'Phantom Mask', emoji: '🎭', rarity: 'epic', soundType: 'ethereal', sonicBoost: 25, resonanceBoost: 20, frequencyBoost: 15, value: 2500, description: 'A mask that lets the wearer perceive sounds on every frequency simultaneously.' },
  { id: 'relic_ancient_veil', name: 'Veil of Ages', emoji: '🪶', rarity: 'epic', soundType: 'ancient', sonicBoost: 15, resonanceBoost: 15, frequencyBoost: 25, value: 2400, description: 'A veil woven from ancient sound waves. It protects spirits from all frequency attacks.' },
  { id: 'relic_dissonance_hammer', name: 'Dissonance Hammer', emoji: '🔨', rarity: 'epic', soundType: 'dissonant', sonicBoost: 20, resonanceBoost: 25, frequencyBoost: 10, value: 2600, description: 'A hammer that strikes with destructive frequencies. It can shatter any sonic barrier.' },
  { id: 'relic_sonic_eye', name: 'Eye of Sound', emoji: '👁️', rarity: 'legendary', soundType: 'harmonic', sonicBoost: 40, resonanceBoost: 30, frequencyBoost: 20, value: 8000, description: 'The divine eye that sees sound itself. It reveals the true nature of every frequency.' },
  { id: 'relic_canyon_stone', name: 'Heart of the Canyon', emoji: '🗿', rarity: 'legendary', soundType: 'ancient', sonicBoost: 30, resonanceBoost: 40, frequencyBoost: 15, value: 7500, description: 'A stone from the very center of the canyon. It resonates with the earth\'s core.' },
  { id: 'relic_void_fang', name: 'Fang of Silence', emoji: '🗡️', rarity: 'legendary', soundType: 'dissonant', sonicBoost: 60, resonanceBoost: 20, frequencyBoost: 20, value: 10000, description: 'A fang carved from absolute silence. It can cut sound waves clean in half.' },
  { id: 'relic_resonance_vessel', name: 'Vessel of Resonance', emoji: '🏺', rarity: 'legendary', soundType: 'resonant', sonicBoost: 25, resonanceBoost: 35, frequencyBoost: 30, value: 9000, description: 'A vessel that never empties, containing infinite resonance. Eternal amplification.' },
  { id: 'relic_shadow_scepter', name: 'Shadow Scepter', emoji: '⚜️', rarity: 'legendary', soundType: 'ethereal', sonicBoost: 35, resonanceBoost: 35, frequencyBoost: 25, value: 9500, description: 'A scepter that commands sounds from beyond the audible spectrum.' },
  { id: 'relic_frequency_scroll', name: 'Scroll of Frequencies', emoji: '📜', rarity: 'epic', soundType: 'ethereal', sonicBoost: 20, resonanceBoost: 15, frequencyBoost: 30, value: 2300, description: 'A fragment of the original sound equation. It enhances spirit frequency range.' },
  { id: 'relic_primal_claw', name: 'Claw of the Deep', emoji: '🦁', rarity: 'legendary', soundType: 'primal', sonicBoost: 50, resonanceBoost: 45, frequencyBoost: 25, value: 11000, description: 'A claw from the primal earth spirit. It makes spirits fearless in sonic combat.' },
  { id: 'relic_echo_egg', name: 'Echo Egg', emoji: '🥚', rarity: 'legendary', soundType: 'harmonic', sonicBoost: 30, resonanceBoost: 30, frequencyBoost: 40, value: 12000, description: 'An eternal egg that contains the first echo. A fallen spirit can be reborn from its shell.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: EC_EVENTS — 12 Canyon Events
// ═══════════════════════════════════════════════════════════════════

export const EC_EVENTS: readonly EcEventDef[] = [
  { id: 'evt_sonic_boom', name: 'Sonic Boom', emoji: '💥', durationTurns: 5, effectType: 'buff', effectDescription: 'Harmonic spirit power doubled. All chambers accessible.', description: 'A massive sonic boom echoes through the canyons, temporarily reshaping the acoustic landscape.' },
  { id: 'evt_cave_in', name: 'Cave-In', emoji: '🪨', durationTurns: 3, effectType: 'debuff', effectDescription: 'Frequency reduced by 30%. Primal spirits immune.', description: 'A violent tremor causes cave-ins across the canyon system, blocking many passages.' },
  { id: 'evt_ancient_awakening', name: 'Ancient Awakening', emoji: '🏛️', durationTurns: 4, effectType: 'special', effectDescription: 'Ancient spirits gain +50 power. Rare crystals appear.', description: 'The ancient carvings on canyon walls begin to glow and sing, awakening dormant spirits.' },
  { id: 'evt_silence_fall', name: 'Great Silence', emoji: '🔇', durationTurns: 2, effectType: 'special', effectDescription: 'Ethereal spirits triple power. Harmonic spirits halved.', description: 'An unnatural silence descends on the canyons. Only ethereal spirits can function normally.' },
  { id: 'evt_frequency_storm', name: 'Frequency Storm', emoji: '⛈️', durationTurns: 3, effectType: 'debuff', effectDescription: 'Chaotic spirits lose 25% power. Shield crystals available.', description: 'A storm of conflicting frequencies disrupts all sonic abilities in the canyon.' },
  { id: 'evt_golden_echo', name: 'Golden Echo', emoji: '🌅', durationTurns: 5, effectType: 'buff', effectDescription: 'Gold rewards doubled. Resonant spirits gain +30% power.', description: 'The canyon walls turn golden as perfect echoes bounce between them. A time of great fortune.' },
  { id: 'evt_harmony_festival', name: 'Harmony Festival', emoji: '🎶', durationTurns: 4, effectType: 'buff', effectDescription: 'All spirits gain +20% harmony. Ancient spirits enhanced.', description: 'An annual festival where all spirits sing in unison. Cooperation is at its peak.' },
  { id: 'evt_crystal_surge', name: 'Crystal Surge', emoji: '💎', durationTurns: 2, effectType: 'debuff', effectDescription: 'Lose 10% gold. Relic chance increased.', description: 'Crystals grow explosively throughout the canyons, but some previously stable formations collapse.' },
  { id: 'evt_spirit_migration', name: 'Spirit Migration', emoji: '👻', durationTurns: 3, effectType: 'buff', effectDescription: 'Capture chance doubled. New spirit species appear.', description: 'Thousands of spirits migrate through the canyon. The perfect time to capture new ones.' },
  { id: 'evt_resonance_drought', name: 'Resonance Drought', emoji: '☀️', durationTurns: 5, effectType: 'debuff', effectDescription: 'Resonant spirit power halved. Dissonant spirits thrive.', description: 'The canyons lose their natural resonance. Sound dies quickly in the dry air.' },
  { id: 'evt_rune_madness', name: 'Rune Madness', emoji: '🔤', durationTurns: 3, effectType: 'special', effectDescription: 'Bonus resonance for each exploration. Puzzle rewards doubled.', description: 'Ancient runes on the canyon walls come alive, shifting to reveal hidden puzzles and secrets.' },
  { id: 'evt_choir_awakening', name: 'Great Choir', emoji: '🎤', durationTurns: 6, effectType: 'buff', effectDescription: 'Spirit charge rate doubled. New harmonic crystals appear.', description: 'Every spirit in the canyon joins in a great choir. Their combined voice unlocks new areas.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: INTERNAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const EC_MAX_SPIRIT_LEVEL = 50
const EC_MAX_STRUCTURE_LEVEL = 10
const EC_INITIAL_GOLD = 200
const EC_INITIAL_RESONANCE = 0

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: HELPER FUNCTIONS (hoisted with `function`)
// ═══════════════════════════════════════════════════════════════════

function ecXpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.25, level - 1))
}

function ecCalcStats(species: EcSpiritSpecies, level: number) {
  const growth = 1 + (level - 1) * 0.12
  return {
    sonicPower: Math.floor(species.sonicPower * growth),
    resonancePower: Math.floor(species.resonancePower * growth),
    frequency: Math.floor(species.frequency * growth),
  }
}

let _ecIdCounter = 0
function ecGenerateId(): string {
  _ecIdCounter += 1
  return `ec_${_ecIdCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`
}

function ecFindSpecies(id: string): EcSpiritSpecies | undefined {
  return EC_SPIRITS.find((s) => s.id === id)
}

function ecFindChamber(id: string): EcChamberDef | undefined {
  return EC_CHAMBERS.find((z) => z.id === id)
}

function ecFindCrystal(id: string): EcCrystalDef | undefined {
  return EC_CRYSTALS.find((m) => m.id === id)
}

function ecFindStructureDef(id: string): EcStructureDef | undefined {
  return EC_STRUCTURES.find((s) => s.id === id)
}

function ecFindAbility(id: string): EcAbilityDef | undefined {
  return EC_ABILITIES.find((a) => a.id === id)
}

function ecFindRelic(id: string): EcRelicDef | undefined {
  return EC_RELICS.find((r) => r.id === id)
}

function ecFindAchievement(id: string): EcAchievementDef | undefined {
  return EC_ACHIEVEMENTS.find((a) => a.id === id)
}

function ecFindTitle(id: EcTitleId): EcTitleDef | undefined {
  return EC_TITLES.find((t) => t.id === id)
}

function ecRarityMultiplier(rarity: EcRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 5
    case 'epic': return 10
    case 'legendary': return 25
    default: return 1
  }
}

function ecRarityColor(rarity: EcRarity): string {
  switch (rarity) {
    case 'common': return '#9ca3af'
    case 'uncommon': return '#34d399'
    case 'rare': return '#60a5fa'
    case 'epic': return '#a78bfa'
    case 'legendary': return '#fbbf24'
    default: return '#9ca3af'
  }
}

function ecSoundTypeColor(soundType: EcSoundType): string {
  switch (soundType) {
    case 'harmonic': return EC_RESONANCE_GOLD
    case 'resonant': return EC_ECHO_BLUE
    case 'dissonant': return EC_DISSONANT_RED
    case 'ethereal': return EC_SONIC_PURPLE
    case 'ancient': return EC_CAVE_BROWN
    case 'chaotic': return EC_DISSONANT_RED
    case 'primal': return EC_CANYON_AMBER
    default: return '#888888'
  }
}

export function ecCheckSynergy(attacker: EcSoundType, defender: EcSoundType): number {
  const advantages = EC_SYNERGY_MAP[attacker]
  if (advantages?.includes(defender)) return 1.4
  const disadvantages = EC_SYNERGY_MAP[defender]
  if (disadvantages?.includes(attacker)) return 0.7
  return 1.0
}

function ecCalcStructureUpgradeCost(def: EcStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

function ecCalcMaxTitle(resonance: number, spiritCount: number): EcTitleId {
  let bestId: EcTitleId = 'title_sound_seeker'
  for (const title of EC_TITLES) {
    if (resonance >= title.minResonance && spiritCount >= title.minSpirits) {
      bestId = title.id
    }
  }
  return bestId
}

function ecCheckAchievementCondition(
  condition: string,
  state: EcStoreState
): boolean {
  switch (condition) {
    case 'capture_1':
      return state.totalCaptured >= 1
    case 'capture_5':
      return state.totalCaptured >= 5
    case 'harvest_1':
      return state.totalHarvested >= 1
    case 'harvest_10':
      return state.totalHarvested >= 10
    case 'build_1':
      return state.totalBuilt >= 1
    case 'build_5':
      return state.totalBuilt >= 5
    case 'chamber_4':
      return state.exploredChambers.length >= 4
    case 'chamber_8':
      return state.exploredChambers.length >= 8
    case 'rare_capture':
      return state.ownedSpirits.some((s) => {
        const sp = ecFindSpecies(s.speciesId)
        return sp && (sp.rarity === 'rare' || sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'epic_capture':
      return state.ownedSpirits.some((s) => {
        const sp = ecFindSpecies(s.speciesId)
        return sp && (sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'legendary_capture':
      return state.ownedSpirits.some((s) => {
        const sp = ecFindSpecies(s.speciesId)
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
      return state.builtStructures.some((s) => s.level >= 10)
    case 'all_sound_types': {
      const types = new Set<EcSoundType>()
      for (const s of state.ownedSpirits) {
        const sp = ecFindSpecies(s.speciesId)
        if (sp) types.add(sp.soundType)
      }
      return types.size >= 7
    }
    case 'max_title':
      return state.currentTitle === 'title_echo_deity'
    default:
      return false
  }
}

function ecPickRandomEvent(): EcEventDef {
  const idx = Math.floor(Math.random() * EC_EVENTS.length)
  return EC_EVENTS[idx]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const useECStore = create<EcFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      ownedSpirits: [] as EcSpiritInstance[],
      exploredChambers: [] as string[],
      inventory: [] as { crystalId: string; count: number }[],
      builtStructures: [] as EcStructureInstance[],
      unlockedAbilities: [] as string[],
      titles: [] as EcTitleId[],
      achievements: [] as string[],
      relics: [] as string[],
      currentTitle: 'title_sound_seeker' as EcTitleId,
      gold: EC_INITIAL_GOLD,
      resonance: EC_INITIAL_RESONANCE,
      totalCaptured: 0,
      totalHarvested: 0,
      totalBuilt: 0,
      totalEventsFaced: 0,
      activeEvent: null as EcEventDef | null,
      eventTurnsRemaining: 0,
      activeChamber: null as string | null,

      // ── ecCaptureSpirit ────────────────────────────────────────
      ecCaptureSpirit: (speciesId: string): boolean => {
        const species = ecFindSpecies(speciesId)
        if (!species) return false
        const cost = Math.floor(50 * ecRarityMultiplier(species.rarity))
        const state = get()
        if (state.gold < cost) return false
        const stats = ecCalcStats(species, 1)
        const newSpirit: EcSpiritInstance = {
          id: ecGenerateId(),
          speciesId,
          name: species.name,
          level: 1,
          xp: 0,
          sonicPower: stats.sonicPower,
          resonancePower: stats.resonancePower,
          frequency: stats.frequency,
          charge: 80,
          harmony: 70,
          capturedAt: Date.now(),
        }
        set((prev) => {
          const newResonance = prev.resonance + ecRarityMultiplier(species.rarity) * 5
          const updated = {
            ownedSpirits: [...prev.ownedSpirits, newSpirit],
            gold: prev.gold - cost,
            totalCaptured: prev.totalCaptured + 1,
            resonance: newResonance,
            currentTitle: ecCalcMaxTitle(newResonance, prev.ownedSpirits.length + 1),
          }
          return updated
        })
        return true
      },

      // ── ecReleaseSpirit ───────────────────────────────────────
      ecReleaseSpirit: (spiritId: string): boolean => {
        const state = get()
        const exists = state.ownedSpirits.find((s) => s.id === spiritId)
        if (!exists) return false
        const species = ecFindSpecies(exists.speciesId)
        const refund = species ? Math.floor(25 * ecRarityMultiplier(species.rarity)) : 10
        set((prev) => ({
          ownedSpirits: prev.ownedSpirits.filter((s) => s.id !== spiritId),
          gold: prev.gold + refund,
          currentTitle: ecCalcMaxTitle(prev.resonance, prev.ownedSpirits.length - 1),
        }))
        return true
      },

      // ── ecChargeSpirit ─────────────────────────────────────────
      ecChargeSpirit: (spiritId: string): boolean => {
        const chargeCost = 10
        const state = get()
        if (state.gold < chargeCost) return false
        set((prev) => {
          const updatedSpirits = prev.ownedSpirits.map((s) => {
            if (s.id !== spiritId) return s
            const newXp = s.xp + 20
            const xpNeeded = ecXpForLevel(s.level)
            let newLevel = s.level
            let currentXp = newXp
            if (currentXp >= xpNeeded && s.level < EC_MAX_SPIRIT_LEVEL) {
              newLevel = s.level + 1
              currentXp = newXp - xpNeeded
            }
            const species = ecFindSpecies(s.speciesId)
            const stats = species ? ecCalcStats(species, newLevel) : { sonicPower: s.sonicPower, resonancePower: s.resonancePower, frequency: s.frequency }
            return {
              ...s,
              level: newLevel,
              xp: currentXp,
              sonicPower: stats.sonicPower,
              resonancePower: stats.resonancePower,
              frequency: stats.frequency,
              charge: Math.min(100, s.charge + 10),
              harmony: Math.min(100, s.harmony + 20),
            }
          })
          return { ownedSpirits: updatedSpirits, gold: prev.gold - chargeCost, resonance: prev.resonance + 2 }
        })
        return true
      },

      // ── ecHarvestCrystal ───────────────────────────────────────
      ecHarvestCrystal: (spiritId: string): boolean => {
        const state = get()
        const spirit = state.ownedSpirits.find((s) => s.id === spiritId)
        if (!spirit) return false
        if (spirit.harmony < 20) return false
        const species = ecFindSpecies(spirit.speciesId)
        if (!species) return false
        const crystalId = `cry_${species.soundType}_${species.rarity}_crystal`
        const existingCrystal = state.inventory.find((m) => m.crystalId === crystalId)
        const amount = Math.ceil(spirit.sonicPower / 10)
        set((prev) => ({
          inventory: existingCrystal
            ? prev.inventory.map((m) => (m.crystalId === crystalId ? { ...m, count: m.count + amount } : m))
            : [...prev.inventory, { crystalId, count: amount }],
          totalHarvested: prev.totalHarvested + 1,
          resonance: prev.resonance + 3,
          ownedSpirits: prev.ownedSpirits.map((s) =>
            s.id === spiritId ? { ...s, harmony: Math.max(0, s.harmony - 20) } : s
          ),
        }))
        return true
      },

      // ── ecBuildStructure ──────────────────────────────────────
      ecBuildStructure: (structureDefId: string): boolean => {
        const def = ecFindStructureDef(structureDefId)
        if (!def) return false
        const state = get()
        if (state.gold < def.baseCost) return false
        const alreadyBuilt = state.builtStructures.find((s) => s.structureDefId === structureDefId)
        if (alreadyBuilt) return false
        const newStructure: EcStructureInstance = {
          id: ecGenerateId(),
          structureDefId,
          level: 1,
          builtAt: Date.now(),
        }
        set((prev) => ({
          builtStructures: [...prev.builtStructures, newStructure],
          gold: prev.gold - def.baseCost,
          totalBuilt: prev.totalBuilt + 1,
          resonance: prev.resonance + 10,
        }))
        return true
      },

      // ── ecUpgradeStructure ────────────────────────────────────
      ecUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structure = state.builtStructures.find((s) => s.id === structureId)
        if (!structure) return false
        if (structure.level >= EC_MAX_STRUCTURE_LEVEL) return false
        const def = ecFindStructureDef(structure.structureDefId)
        if (!def) return false
        const cost = ecCalcStructureUpgradeCost(def, structure.level)
        if (state.gold < cost) return false
        set((prev) => ({
          builtStructures: prev.builtStructures.map((s) =>
            s.id === structureId ? { ...s, level: s.level + 1 } : s
          ),
          gold: prev.gold - cost,
          resonance: prev.resonance + Math.floor(def.effectPerLevel * 2),
        }))
        return true
      },

      // ── ecExploreChamber ──────────────────────────────────────
      ecExploreChamber: (chamberId: string): EcEventDef | null => {
        const chamber = ecFindChamber(chamberId)
        if (!chamber) return null
        const state = get()
        const requiredTitleIdx = EC_TITLES.findIndex((t) => t.id === chamber.requiredTitle)
        const currentTitleIdx = EC_TITLES.findIndex((t) => t.id === state.currentTitle)
        if (currentTitleIdx < requiredTitleIdx) return null
        const newChambers = state.exploredChambers.includes(chamberId) ? state.exploredChambers : [...state.exploredChambers, chamberId]
        const event = ecPickRandomEvent()
        set((prev) => ({
          exploredChambers: newChambers,
          activeChamber: chamberId,
          activeEvent: event,
          eventTurnsRemaining: event.durationTurns,
          totalEventsFaced: prev.totalEventsFaced + 1,
          resonance: prev.resonance + 5,
        }))
        return event
      },

      // ── ecCollectRelic ────────────────────────────────────────
      ecCollectRelic: (relicId: string): boolean => {
        const relic = ecFindRelic(relicId)
        if (!relic) return false
        const state = get()
        if (state.relics.includes(relicId)) return false
        set((prev) => {
          const newResonance = prev.resonance + Math.floor(ecRarityMultiplier(relic.rarity) * 20)
          return {
            relics: [...prev.relics, relicId],
            resonance: newResonance,
            currentTitle: ecCalcMaxTitle(newResonance, prev.ownedSpirits.length),
          }
        })
        return true
      },

      // ── ecUnlockAbility ───────────────────────────────────────
      ecUnlockAbility: (abilityId: string): boolean => {
        const ability = ecFindAbility(abilityId)
        if (!ability) return false
        const state = get()
        if (state.unlockedAbilities.includes(abilityId)) return false
        const cost = Math.floor(100 * ecRarityMultiplier(ability.rarity))
        if (state.gold < cost) return false
        set((prev) => ({
          unlockedAbilities: [...prev.unlockedAbilities, abilityId],
          gold: prev.gold - cost,
        }))
        return true
      },

      // ── ecUnlockTitle ─────────────────────────────────────────
      ecUnlockTitle: (titleId: EcTitleId): boolean => {
        const title = ecFindTitle(titleId)
        if (!title) return false
        const state = get()
        if (state.resonance < title.minResonance) return false
        if (state.ownedSpirits.length < title.minSpirits) return false
        set((prev) => ({
          currentTitle: titleId,
          titles: prev.titles.includes(titleId) ? prev.titles : [...prev.titles, titleId],
        }))
        return true
      },

      // ── ecClaimAchievement ────────────────────────────────────
      ecClaimAchievement: (achievementId: string): boolean => {
        const achievement = ecFindAchievement(achievementId)
        if (!achievement) return false
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!ecCheckAchievementCondition(achievement.condition, state)) return false
        set((prev) => {
          const newResonance = prev.resonance + achievement.reward.resonance
          return {
            achievements: [...prev.achievements, achievementId],
            gold: prev.gold + achievement.reward.gold,
            resonance: newResonance,
            currentTitle: ecCalcMaxTitle(newResonance, prev.ownedSpirits.length),
          }
        })
        return true
      },

      // ── ecTradeMaterial ───────────────────────────────────────
      ecTradeMaterial: (crystalId: string, count: number): number => {
        const crystal = ecFindCrystal(crystalId)
        if (!crystal) return 0
        const state = get()
        const owned = state.inventory.find((m) => m.crystalId === crystalId)
        if (!owned || owned.count < count) return 0
        const goldEarned = crystal.value * count
        set((prev) => ({
          inventory:
            owned.count - count <= 0
              ? prev.inventory.filter((m) => m.crystalId !== crystalId)
              : prev.inventory.map((m) => (m.crystalId === crystalId ? { ...m, count: m.count - count } : m)),
          gold: prev.gold + goldEarned,
        }))
        return goldEarned
      },

      // ── ecEndEvent ────────────────────────────────────────────
      ecEndEvent: () => {
        set({ activeEvent: null, eventTurnsRemaining: 0 })
      },

      // ── ecResetEvent ──────────────────────────────────────────
      ecResetEvent: () => {
        const event = ecPickRandomEvent()
        set({ activeEvent: event, eventTurnsRemaining: event.durationTurns })
      },
    }),
    {
      name: 'echo-canyon-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: MAIN HOOK — useEchoCanyon()
// ═══════════════════════════════════════════════════════════════════

export default function useEchoCanyon(): EcAPI {
  const store = useECStore()

  // ── Computed: Owned spirits with species info ─────────────────
  const ecOwnedSpirits = useMemo(() => {
    return store.ownedSpirits.map((s) => {
      const species = ecFindSpecies(s.speciesId)
      return {
        ...s,
        species,
        soundTypeColor: species ? ecSoundTypeColor(species.soundType) : '#888888',
        rarityColor: species ? ecRarityColor(species.rarity) : '#888888',
      }
    })
  }, [store])

  // ── Computed: Available spirit species to capture ─────────────
  const ecAvailableSpecies = useMemo(() => {
    return EC_SPIRITS.filter((sp) => {
      const cost = Math.floor(50 * ecRarityMultiplier(sp.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Current title details ───────────────────────────
  const ecCurrentTitleDetail = useMemo(() => {
    return ecFindTitle(store.currentTitle) ?? EC_TITLES[0]
  }, [store])

  // ── Computed: Next title info ─────────────────────────────────
  const ecNextTitle = useMemo(() => {
    const currentIdx = EC_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= EC_TITLES.length - 1) return null
    return EC_TITLES[currentIdx + 1]
  }, [store])

  // ── Computed: Active chamber details ──────────────────────────
  const ecActiveChamberDetail = useMemo(() => {
    if (!store.activeChamber) return null
    return ecFindChamber(store.activeChamber) ?? null
  }, [store])

  // ── Computed: Unexplored chambers ─────────────────────────────
  const ecUnexploredChambers = useMemo(() => {
    return EC_CHAMBERS.filter((c) => !store.exploredChambers.includes(c.id))
  }, [store])

  // ── Computed: Structures with defs ────────────────────────────
  const ecBuiltStructures = useMemo(() => {
    return store.builtStructures.map((s) => {
      const def = ecFindStructureDef(s.structureDefId)
      return { ...s, def }
    })
  }, [store])

  // ── Computed: Unlockable abilities ────────────────────────────
  const ecUnlockableAbilities = useMemo(() => {
    return EC_ABILITIES.filter((a) => {
      if (store.unlockedAbilities.includes(a.id)) return false
      const cost = Math.floor(100 * ecRarityMultiplier(a.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Owned relics with defs ──────────────────────────
  const ecOwnedRelics = useMemo(() => {
    return store.relics
      .map((rId) => ecFindRelic(rId))
      .filter((r): r is EcRelicDef => r !== undefined)
  }, [store])

  // ── Computed: Unclaimed achievements ──────────────────────────
  const ecUnclaimedAchievements = useMemo(() => {
    return EC_ACHIEVEMENTS.filter((a) => {
      if (store.achievements.includes(a.id)) return false
      return ecCheckAchievementCondition(a.condition, store)
    })
  }, [store])

  // ── Computed: Inventory crystals with defs ────────────────────
  const ecInventoryCrystals = useMemo(() => {
    return store.inventory.map((inv) => {
      const def = ecFindCrystal(inv.crystalId)
      return { ...inv, def }
    })
  }, [store])

  // ── Computed: Total structure effect ──────────────────────────
  const ecTotalStructureEffect = useMemo(() => {
    return store.builtStructures.reduce((sum, s) => {
      const def = ecFindStructureDef(s.structureDefId)
      if (!def) return sum
      return sum + def.baseEffect + def.effectPerLevel * (s.level - 1)
    }, 0)
  }, [store])

  // ── Computed: Average spirit level ────────────────────────────
  const ecAverageSpiritLevel = useMemo(() => {
    if (store.ownedSpirits.length === 0) return 0
    const total = store.ownedSpirits.reduce((sum, s) => sum + s.level, 0)
    return Math.floor(total / store.ownedSpirits.length)
  }, [store])

  // ── Computed: Total spirit power ──────────────────────────────
  const ecTotalSpiritPower = useMemo(() => {
    return store.ownedSpirits.reduce(
      (sum, s) => sum + s.sonicPower + s.resonancePower + s.frequency,
      0
    )
  }, [store])

  // ── Computed: Sound type distribution ────────────────────────
  const ecSoundDistribution = useMemo(() => {
    const counts: Record<EcSoundType, number> = {
      harmonic: 0, resonant: 0, dissonant: 0, ethereal: 0, ancient: 0, chaotic: 0, primal: 0,
    }
    for (const s of store.ownedSpirits) {
      const sp = ecFindSpecies(s.speciesId)
      if (sp) counts[sp.soundType]++
    }
    return counts
  }, [store])

  // ── Computed: Rarity distribution ─────────────────────────────
  const ecRarityDistribution = useMemo(() => {
    const counts: Record<EcRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
    }
    for (const s of store.ownedSpirits) {
      const sp = ecFindSpecies(s.speciesId)
      if (sp) counts[sp.rarity]++
    }
    return counts
  }, [store])

  // ── Computed: Spirits by rarity ──────────────────────────────
  const ecSpiritsByRarity = useMemo(() => {
    const groups: Record<EcRarity, EcSpiritInstance[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    }
    for (const s of store.ownedSpirits) {
      const sp = ecFindSpecies(s.speciesId)
      if (sp) groups[sp.rarity].push(s)
    }
    return groups
  }, [store])

  // ── Computed: Spirits by sound type ───────────────────────────
  const ecSpiritsBySoundType = useMemo(() => {
    const groups: Record<EcSoundType, EcSpiritInstance[]> = {
      harmonic: [], resonant: [], dissonant: [], ethereal: [], ancient: [], chaotic: [], primal: [],
    }
    for (const s of store.ownedSpirits) {
      const sp = ecFindSpecies(s.speciesId)
      if (sp) groups[sp.soundType].push(s)
    }
    return groups
  }, [store])

  // ── Computed: Progress to next title ──────────────────────────
  const ecTitleProgress = useMemo(() => {
    const currentIdx = EC_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= EC_TITLES.length - 1) return { percent: 100, resonanceNeeded: 0, spiritsNeeded: 0 }
    const next = EC_TITLES[currentIdx + 1]
    const resonanceProgress = Math.min(100, (store.resonance / next.minResonance) * 100)
    const spiritProgress = Math.min(100, (store.ownedSpirits.length / next.minSpirits) * 100)
    return {
      percent: Math.floor((resonanceProgress + spiritProgress) / 2),
      resonanceNeeded: Math.max(0, next.minResonance - store.resonance),
      spiritsNeeded: Math.max(0, next.minSpirits - store.ownedSpirits.length),
    }
  }, [store])

  // ── Computed: Rare material count ────────────────────────────
  const ecRareMaterialCount = useMemo(() => {
    let count = 0
    for (const m of store.inventory) {
      const def = ecFindCrystal(m.crystalId)
      if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
        count += m.count
      }
    }
    return count
  }, [store])

  // ── Computed: Weak spirits (low charge) ──────────────────────
  const ecWeakSpirits = useMemo(() => {
    return store.ownedSpirits.filter((s) => s.charge < 30)
  }, [store])

  // ── Computed: Drained spirits (low harmony) ──────────────────
  const ecDrainedSpirits = useMemo(() => {
    return store.ownedSpirits.filter((s) => s.harmony < 30)
  }, [store])

  // ── Computed: Total relic boost ───────────────────────────────
  const ecTotalRelicBoost = useMemo(() => {
    let sonicBoost = 0
    let resonanceBoost = 0
    let frequencyBoost = 0
    for (const rId of store.relics) {
      const relic = ecFindRelic(rId)
      if (relic) {
        sonicBoost += relic.sonicBoost
        resonanceBoost += relic.resonanceBoost
        frequencyBoost += relic.frequencyBoost
      }
    }
    return { sonicBoost, resonanceBoost, frequencyBoost }
  }, [store])

  // ═════════════════════════════════════════════════════════════
  // Return ecAPI object
  // ═════════════════════════════════════════════════════════════

  const ecAPI: EcAPI = {
    // ── Direct constants ──────────────────────────────────────
    EC_CANYON_AMBER,
    EC_ECHO_BLUE,
    EC_SONIC_PURPLE,
    EC_CRYSTAL_TEAL,
    EC_RESONANCE_GOLD,
    EC_CAVE_BROWN,
    EC_SPIRIT_WHITE,
    EC_DISSONANT_RED,
    EC_SOUND_TYPES,
    EC_SPIRITS,
    EC_CHAMBERS,
    EC_CRYSTALS,
    EC_STRUCTURES,
    EC_ABILITIES,
    EC_ACHIEVEMENTS,
    EC_TITLES,
    EC_RELICS,
    EC_EVENTS,
    ecCheckSynergy,

    // ── Store state ───────────────────────────────────────────
    ownedSpirits: store.ownedSpirits,
    exploredChambers: store.exploredChambers,
    inventory: store.inventory,
    builtStructures: store.builtStructures,
    unlockedAbilities: store.unlockedAbilities,
    titles: store.titles,
    achievements: store.achievements,
    relics: store.relics,
    currentTitle: store.currentTitle,
    gold: store.gold,
    resonance: store.resonance,
    totalCaptured: store.totalCaptured,
    totalHarvested: store.totalHarvested,
    totalBuilt: store.totalBuilt,
    totalEventsFaced: store.totalEventsFaced,
    activeEvent: store.activeEvent,
    eventTurnsRemaining: store.eventTurnsRemaining,
    activeChamber: store.activeChamber,

    // ── Store actions ─────────────────────────────────────────
    ecCaptureSpirit: store.ecCaptureSpirit,
    ecReleaseSpirit: store.ecReleaseSpirit,
    ecChargeSpirit: store.ecChargeSpirit,
    ecHarvestCrystal: store.ecHarvestCrystal,
    ecBuildStructure: store.ecBuildStructure,
    ecUpgradeStructure: store.ecUpgradeStructure,
    ecExploreChamber: store.ecExploreChamber,
    ecCollectRelic: store.ecCollectRelic,
    ecUnlockAbility: store.ecUnlockAbility,
    ecUnlockTitle: store.ecUnlockTitle,
    ecClaimAchievement: store.ecClaimAchievement,
    ecTradeMaterial: store.ecTradeMaterial,
    ecEndEvent: store.ecEndEvent,
    ecResetEvent: store.ecResetEvent,

    // ── Computed getters ──────────────────────────────────────
    ecOwnedSpirits,
    ecAvailableSpecies,
    ecCurrentTitleDetail,
    ecNextTitle,
    ecActiveChamberDetail,
    ecUnexploredChambers,
    ecBuiltStructures,
    ecUnlockableAbilities,
    ecOwnedRelics,
    ecUnclaimedAchievements,
    ecInventoryCrystals,
    ecTotalStructureEffect,
    ecAverageSpiritLevel,
    ecTotalSpiritPower,
    ecSoundDistribution,
    ecRarityDistribution,
    ecSpiritsByRarity,
    ecSpiritsBySoundType,
    ecTitleProgress,
    ecRareMaterialCount,
    ecWeakSpirits,
    ecDrainedSpirits,
    ecTotalRelicBoost,
  }

  return ecAPI
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 18: API TYPE (used by consumers)
// ═══════════════════════════════════════════════════════════════════

export interface EcAPI {
  // Color constants
  EC_CANYON_AMBER: string
  EC_ECHO_BLUE: string
  EC_SONIC_PURPLE: string
  EC_CRYSTAL_TEAL: string
  EC_RESONANCE_GOLD: string
  EC_CAVE_BROWN: string
  EC_SPIRIT_WHITE: string
  EC_DISSONANT_RED: string

  // Data constants
  EC_SOUND_TYPES: readonly EcSoundTypeDef[]
  EC_SPIRITS: readonly EcSpiritSpecies[]
  EC_CHAMBERS: readonly EcChamberDef[]
  EC_CRYSTALS: readonly EcCrystalDef[]
  EC_STRUCTURES: readonly EcStructureDef[]
  EC_ABILITIES: readonly EcAbilityDef[]
  EC_ACHIEVEMENTS: readonly EcAchievementDef[]
  EC_TITLES: readonly EcTitleDef[]
  EC_RELICS: readonly EcRelicDef[]
  EC_EVENTS: readonly EcEventDef[]
  ecCheckSynergy: (attacker: EcSoundType, defender: EcSoundType) => number

  // Store state
  ownedSpirits: EcSpiritInstance[]
  exploredChambers: string[]
  inventory: { crystalId: string; count: number }[]
  builtStructures: EcStructureInstance[]
  unlockedAbilities: string[]
  titles: EcTitleId[]
  achievements: string[]
  relics: string[]
  currentTitle: EcTitleId
  gold: number
  resonance: number
  totalCaptured: number
  totalHarvested: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: EcEventDef | null
  eventTurnsRemaining: number
  activeChamber: string | null

  // Store actions
  ecCaptureSpirit: (speciesId: string) => boolean
  ecReleaseSpirit: (spiritId: string) => boolean
  ecChargeSpirit: (spiritId: string) => boolean
  ecHarvestCrystal: (spiritId: string) => boolean
  ecBuildStructure: (structureDefId: string) => boolean
  ecUpgradeStructure: (structureId: string) => boolean
  ecExploreChamber: (chamberId: string) => EcEventDef | null
  ecCollectRelic: (relicId: string) => boolean
  ecUnlockAbility: (abilityId: string) => boolean
  ecUnlockTitle: (titleId: EcTitleId) => boolean
  ecClaimAchievement: (achievementId: string) => boolean
  ecTradeMaterial: (crystalId: string, count: number) => number
  ecEndEvent: () => void
  ecResetEvent: () => void

  // Computed getters
  ecOwnedSpirits: (EcSpiritInstance & { species: EcSpiritSpecies | undefined; soundTypeColor: string; rarityColor: string })[]
  ecAvailableSpecies: EcSpiritSpecies[]
  ecCurrentTitleDetail: EcTitleDef
  ecNextTitle: EcTitleDef | null
  ecActiveChamberDetail: EcChamberDef | null
  ecUnexploredChambers: EcChamberDef[]
  ecBuiltStructures: (EcStructureInstance & { def: EcStructureDef | undefined })[]
  ecUnlockableAbilities: EcAbilityDef[]
  ecOwnedRelics: EcRelicDef[]
  ecUnclaimedAchievements: EcAchievementDef[]
  ecInventoryCrystals: ({ crystalId: string; count: number; def: EcCrystalDef | undefined })[]
  ecTotalStructureEffect: number
  ecAverageSpiritLevel: number
  ecTotalSpiritPower: number
  ecSoundDistribution: Record<EcSoundType, number>
  ecRarityDistribution: Record<EcRarity, number>
  ecSpiritsByRarity: Record<EcRarity, EcSpiritInstance[]>
  ecSpiritsBySoundType: Record<EcSoundType, EcSpiritInstance[]>
  ecTitleProgress: { percent: number; resonanceNeeded: number; spiritsNeeded: number }
  ecRareMaterialCount: number
  ecWeakSpirits: EcSpiritInstance[]
  ecDrainedSpirits: EcSpiritInstance[]
  ecTotalRelicBoost: { sonicBoost: number; resonanceBoost: number; frequencyBoost: number }
}
