/**
 * Cobalt Vault Wire — A secure underground vault treasure management mini-game.
 *
 * Players recruit 35 vault guardians across 7 lock disciplines, manage
 * 8 vault chambers, collect 30 metal/gem materials, build 25 vault
 * structures, unlock 22 vault abilities, discover 15 legendary treasure
 * artifacts, face 12 vault breach events, and ascend through 8 titles
 * from Lock Novice to Vault Deity — backed by a Zustand store with
 * persist middleware.
 *
 * Storage key: cobalt-vault-wire
 * Prefix: cb / CB_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type CbLockDiscipline =
  | 'tumbler'
  | 'wafers'
  | 'combination'
  | 'electronic'
  | 'magnetic'
  | 'biometric'
  | 'quantum'

export type CbRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type CbTitleId =
  | 'title_lock_novice'
  | 'title_pin_wizard'
  | 'title_warden'
  | 'title_steel_keeper'
  | 'title_chamberlord'
  | 'title_vault_sovereign'
  | 'title_master_sealer'
  | 'title_vault_deity'

export interface CbDisciplineDef {
  readonly id: CbLockDiscipline
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface CbGuardianSpecies {
  readonly id: string
  readonly name: string
  readonly discipline: CbLockDiscipline
  readonly rarity: CbRarity
  readonly lockpickingPower: number
  readonly forgingPower: number
  readonly vigilance: number
  readonly description: string
  readonly abilities: string[]
}

export interface CbGuardianInstance {
  readonly id: string
  speciesId: string
  name: string
  level: number
  xp: number
  lockpickingPower: number
  forgingPower: number
  vigilance: number
  morale: number
  endurance: number
  recruitedAt: number
}

export interface CbChamberDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly depth: number
  readonly threatLevel: number
  readonly requiredTitle: CbTitleId
  readonly discipline: CbLockDiscipline
  readonly bgGradient: string
  readonly ambientColor: string
}

export interface CbMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'metal' | 'gem' | 'alloy' | 'crystal_shard' | 'essence'
  readonly rarity: CbRarity
  readonly lockBonus: number
  readonly forgeBonus: number
  readonly value: number
  readonly description: string
}

export interface CbStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'guardian_barracks' | 'forge_station' | 'vault_door' | 'trap_workshop' | 'treasury'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface CbStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  builtAt: number
}

export interface CbAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly discipline: CbLockDiscipline
  readonly type: 'active' | 'passive'
  readonly rarity: CbRarity
  readonly energyCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface CbAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { gold: number; renown: number }
}

export interface CbTitleDef {
  readonly id: CbTitleId
  readonly name: string
  readonly emoji: string
  readonly minRenown: number
  readonly minGuardians: number
  readonly description: string
}

export interface CbRelicDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: CbRarity
  readonly discipline: CbLockDiscipline
  readonly lockBoost: number
  readonly forgeBoost: number
  readonly vigilanceBoost: number
  readonly value: number
  readonly description: string
}

export interface CbEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface CbStoreState {
  guardians: CbGuardianInstance[]
  chambers: string[]
  materials: { materialId: string; count: number }[]
  structures: CbStructureInstance[]
  abilities: string[]
  achievements: string[]
  relics: string[]
  currentTitle: CbTitleId
  gold: number
  renown: number
  totalRecruited: number
  totalForged: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: CbEventDef | null
  eventTurnsRemaining: number
  activeChamber: string | null
}

export interface CbStoreActions {
  cbRecruitGuardian: (speciesId: string) => boolean
  cbDismissGuardian: (guardianId: string) => boolean
  cbTrainGuardian: (guardianId: string) => boolean
  cbForgeLock: (guardianId: string) => boolean
  cbBuildStructure: (structureDefId: string) => boolean
  cbUpgradeStructure: (structureId: string) => boolean
  cbSecureChamber: (chamberId: string) => CbEventDef | null
  cbCollectRelic: (relicId: string) => boolean
  cbUnlockAbility: (abilityId: string) => boolean
  cbUnlockTitle: (titleId: CbTitleId) => boolean
  cbClaimAchievement: (achievementId: string) => boolean
  cbTradeMaterial: (materialId: string, count: number) => number
  cbEndEvent: () => void
  cbResetEvent: () => void
}

export interface CbFullStore extends CbStoreState, CbStoreActions {}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS (8 colors)
// ═══════════════════════════════════════════════════════════════════

export const CB_COBALT_BLUE: string = '#0047AB'
export const CB_VAULT_GOLD: string = '#DAA520'
export const CB_STEEL_GRAY: string = '#708090'
export const CB_LOCK_SILVER: string = '#C0C0C0'
export const CB_FORGE_ORANGE: string = '#FF8C00'
export const CB_CRYSTAL_CYAN: string = '#00CED1'
export const CB_SHADOW_BLACK: string = '#1C1C1C'
export const CB_SAFE_GREEN: string = '#2E8B57'

// ═══════════════════════════════════════════════════════════════════
// SECTION 2b: RARITY DEFINITIONS (5 rarities)
// ═══════════════════════════════════════════════════════════════════

export const CB_RARITIES: readonly { id: CbRarity; name: string; color: string; weight: number }[] = [
  { id: 'common', name: 'Common', color: '#9ca3af', weight: 60 },
  { id: 'uncommon', name: 'Uncommon', color: '#34d399', weight: 25 },
  { id: 'rare', name: 'Rare', color: '#60a5fa', weight: 10 },
  { id: 'epic', name: 'Epic', color: '#a78bfa', weight: 4 },
  { id: 'legendary', name: 'Legendary', color: '#fbbf24', weight: 1 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: CB_DISCIPLINES — 7 Lock Disciplines
// ═══════════════════════════════════════════════════════════════════

export const CB_DISCIPLINES: readonly CbDisciplineDef[] = [
  {
    id: 'tumbler',
    name: 'Tumbler',
    color: CB_LOCK_SILVER,
    description:
      'The oldest and most fundamental lock art. Tumbler masters manipulate spring-loaded pins with precision to release any pin tumbler cylinder.',
  },
  {
    id: 'wafers',
    name: 'Wafers',
    color: CB_STEEL_GRAY,
    description:
      'Wafer lock specialists work with flat disc tumblers aligned by key rotation. Common in automobile locks and file cabinets, but deadly in the vault.',
  },
  {
    id: 'combination',
    name: 'Combination',
    color: CB_VAULT_GOLD,
    description:
      'Combination dial experts memorize and crack multi-number sequences on rotary dials. A single wrong turn spells failure.',
  },
  {
    id: 'electronic',
    name: 'Electronic',
    color: CB_FORGE_ORANGE,
    description:
      'Electronic lock hackers interface with circuit boards, keypads, and smart locks. They understand the flow of electricity as intimately as water.',
  },
  {
    id: 'magnetic',
    name: 'Magnetic',
    color: CB_CRYSTAL_CYAN,
    description:
      'Magnetic lock wardens manipulate magnetic fields to align hidden magnetic pins. Invisible forces are their weapons and shields.',
  },
  {
    id: 'biometric',
    name: 'Biometric',
    color: CB_SAFE_GREEN,
    description:
      'Biometric specialists bypass fingerprint, retinal, and palm scanners. They understand the human body as a lock and the flesh as the key.',
  },
  {
    id: 'quantum',
    name: 'Quantum',
    color: CB_COBALT_BLUE,
    description:
      'The most advanced and dangerous discipline. Quantum guardians manipulate entangled states to crack locks that exist across multiple realities.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: DISCIPLINE SYNERGY TABLE
// ═══════════════════════════════════════════════════════════════════

const CB_SYNERGY_MAP: Record<CbLockDiscipline, CbLockDiscipline[]> = {
  tumbler: ['wafers', 'magnetic'],
  wafers: ['tumbler', 'combination'],
  combination: ['electronic', 'tumbler'],
  electronic: ['biometric', 'quantum'],
  magnetic: ['quantum', 'electronic'],
  biometric: ['electronic', 'combination'],
  quantum: ['magnetic', 'biometric'],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: CB_GUARDIANS — 35 Vault Guardians (5 per discipline)
// ═══════════════════════════════════════════════════════════════════

export const CB_GUARDIANS: readonly CbGuardianSpecies[] = [
  // ── Tumbler Guardians (5) ────────────────────────────────────
  {
    id: 'tum_apprentice_pin',
    name: 'Pin Apprentice',
    discipline: 'tumbler',
    rarity: 'common',
    lockpickingPower: 12,
    forgingPower: 8,
    vigilance: 18,
    description:
      'A young recruit learning to feel pin clicks through the tension wrench. Eager but untested.',
    abilities: ['pin_rake'],
  },
  {
    id: 'tum_rake_specialist',
    name: 'Rake Specialist',
    discipline: 'tumbler',
    rarity: 'common',
    lockpickingPower: 18,
    forgingPower: 10,
    vigilance: 22,
    description:
      'A skilled raker who can open simple pin tumblers in seconds. Their speed is unmatched in basic locks.',
    abilities: ['pin_rake', 'speed_pick'],
  },
  {
    id: 'tum_tension_master',
    name: 'Tension Master',
    discipline: 'tumbler',
    rarity: 'uncommon',
    lockpickingPower: 8,
    forgingPower: 35,
    vigilance: 15,
    description:
      'An expert who feels each pin set through the tension wrench alone. Their sensitivity is legendary.',
    abilities: ['pin_rake', 'tension_feel'],
  },
  {
    id: 'tum_spool_breaker',
    name: 'Spool Breaker',
    discipline: 'tumbler',
    rarity: 'rare',
    lockpickingPower: 55,
    forgingPower: 45,
    vigilance: 30,
    description:
      'A specialist in defeating spool pins, the most devious anti-picking mechanism ever devised.',
    abilities: ['pin_rake', 'tension_feel', 'spool_counter'],
  },
  {
    id: 'tum_grandmaster_pin',
    name: 'Grandmaster Pin',
    discipline: 'tumbler',
    rarity: 'epic',
    lockpickingPower: 80,
    forgingPower: 90,
    vigilance: 25,
    description:
      'The undisputed master of all pin tumbler locks. No pin stack has ever defeated them. Their touch is so refined they can feel individual spring wire tension through three inches of hardened steel.',
    abilities: ['pin_rake', 'speed_pick', 'tension_feel', 'spool_counter'],
  },

  // ── Wafer Guardians (5) ──────────────────────────────────────
  {
    id: 'waf_disc_reader',
    name: 'Disc Reader',
    discipline: 'wafers',
    rarity: 'common',
    lockpickingPower: 15,
    forgingPower: 5,
    vigilance: 30,
    description:
      'A reader of wafer positions who can decode a lock by sound alone. Sharp-eared and patient.',
    abilities: ['wafer_listen'],
  },
  {
    id: 'waf_filed_set',
    name: 'Filed Set',
    discipline: 'wafers',
    rarity: 'common',
    lockpickingPower: 22,
    forgingPower: 8,
    vigilance: 26,
    description:
      'Carries a custom-filed set of wafer picks. Each tool shaped by hand over years of practice.',
    abilities: ['wafer_listen', 'wafer_jiggle'],
  },
  {
    id: 'waf_double_bitted',
    name: 'Double-Bitted Expert',
    discipline: 'wafers',
    rarity: 'uncommon',
    lockpickingPower: 30,
    forgingPower: 15,
    vigilance: 35,
    description:
      'A veteran of double-bitted wafer locks found in high-security cabinets and bank deposit boxes.',
    abilities: ['wafer_listen', 'double_pick'],
  },
  {
    id: 'waf_serrated_warden',
    name: 'Serrated Warden',
    discipline: 'wafers',
    rarity: 'rare',
    lockpickingPower: 50,
    forgingPower: 40,
    vigilance: 40,
    description:
      'Masters the serrated wafer lock, whose teeth are as jagged as a saw blade. Precision beyond measure.',
    abilities: ['wafer_listen', 'wafer_jiggle', 'serrated_flow'],
  },
  {
    id: 'waf_vault_disciple',
    name: 'Vault Disciple',
    discipline: 'wafers',
    rarity: 'epic',
    lockpickingPower: 85,
    forgingPower: 65,
    vigilance: 45,
    description:
      'The supreme wafer lock master. Their hands move with the grace of a concert pianist.',
    abilities: ['wafer_listen', 'wafer_jiggle', 'double_pick', 'serrated_flow'],
  },

  // ── Combination Guardians (5) ────────────────────────────────
  {
    id: 'com_dial_listener',
    name: 'Dial Listener',
    discipline: 'combination',
    rarity: 'common',
    lockpickingPower: 10,
    forgingPower: 10,
    vigilance: 25,
    description:
      'A listener who detects the subtle clicks of combination wheels. Patient as stone.',
    abilities: ['dial_feel'],
  },
  {
    id: 'com_number_savant',
    name: 'Number Savant',
    discipline: 'combination',
    rarity: 'common',
    lockpickingPower: 28,
    forgingPower: 12,
    vigilance: 24,
    description:
      'A mathematical prodigy who can memorize and calculate combination sequences instantly.',
    abilities: ['dial_feel', 'rapid_dial'],
  },
  {
    id: 'com_auto_dialer',
    name: 'Auto Dialer',
    discipline: 'combination',
    rarity: 'uncommon',
    lockpickingPower: 20,
    forgingPower: 35,
    vigilance: 22,
    description:
      'Builds and operates mechanical auto-dialers that test combinations at incredible speed.',
    abilities: ['dial_feel', 'mech_dial'],
  },
  {
    id: 'com_group_master',
    name: 'Group Master',
    discipline: 'combination',
    rarity: 'rare',
    lockpickingPower: 45,
    forgingPower: 50,
    vigilance: 30,
    description:
      'An expert in group-change combination locks where multiple combinations must be set simultaneously.',
    abilities: ['dial_feel', 'rapid_dial', 'group_sync'],
  },
  {
    id: 'com_vault_cracker',
    name: 'Vault Cracker',
    discipline: 'combination',
    rarity: 'epic',
    lockpickingPower: 75,
    forgingPower: 60,
    vigilance: 35,
    description:
      'The legendary vault cracker who has opened every known combination safe on the continent.',
    abilities: ['dial_feel', 'rapid_dial', 'mech_dial', 'group_sync'],
  },

  // ── Electronic Guardians (5) ─────────────────────────────────
  {
    id: 'ele_circuit_reader',
    name: 'Circuit Reader',
    discipline: 'electronic',
    rarity: 'common',
    lockpickingPower: 20,
    forgingPower: 6,
    vigilance: 16,
    description:
      'A reader of circuit schematics who can trace signal paths through any electronic lock board.',
    abilities: ['circuit_trace'],
  },
  {
    id: 'ele_keypad_bypass',
    name: 'Keypad Bypasser',
    discipline: 'electronic',
    rarity: 'common',
    lockpickingPower: 25,
    forgingPower: 10,
    vigilance: 28,
    description:
      'Can bypass standard electronic keypads by reading wear patterns and thermal residues on buttons.',
    abilities: ['circuit_trace', 'thermal_read'],
  },
  {
    id: 'ele_signal_spoof',
    name: 'Signal Spoofer',
    discipline: 'electronic',
    rarity: 'uncommon',
    lockpickingPower: 35,
    forgingPower: 20,
    vigilance: 32,
    description:
      'Generates spoofed RF signals to trick electronic locks into believing the correct key fob is present.',
    abilities: ['circuit_trace', 'rf_spoof'],
  },
  {
    id: 'ele_micro_surgeon',
    name: 'Micro Surgeon',
    discipline: 'electronic',
    rarity: 'rare',
    lockpickingPower: 55,
    forgingPower: 40,
    vigilance: 38,
    description:
      'A surgeon of microelectronics who can reprogram smart lock chips under a microscope.',
    abilities: ['circuit_trace', 'thermal_read', 'chip_reprogram'],
  },
  {
    id: 'ele_ghost_signal',
    name: 'Ghost Signal',
    discipline: 'electronic',
    rarity: 'epic',
    lockpickingPower: 90,
    forgingPower: 55,
    vigilance: 40,
    description:
      'The phantom of electronic security. They can ghost through any electronic lock without leaving a digital trace.',
    abilities: ['circuit_trace', 'rf_spoof', 'thermal_read', 'chip_reprogram'],
  },

  // ── Magnetic Guardians (5) ───────────────────────────────────
  {
    id: 'mag_field_sense',
    name: 'Field Senser',
    discipline: 'magnetic',
    rarity: 'common',
    lockpickingPower: 14,
    forgingPower: 8,
    vigilance: 28,
    description:
      'A natural empath of magnetic fields who can feel the presence and position of hidden magnetic pins.',
    abilities: ['field_sense'],
  },
  {
    id: 'mag_pole_shifter',
    name: 'Pole Shifter',
    discipline: 'magnetic',
    rarity: 'common',
    lockpickingPower: 22,
    forgingPower: 15,
    vigilance: 26,
    description:
      'Carries specialized magnets that can reverse the polarity of magnetic lock pins one by one.',
    abilities: ['field_sense', 'pole_flip'],
  },
  {
    id: 'mag_halbach_master',
    name: 'Halbach Master',
    discipline: 'magnetic',
    rarity: 'uncommon',
    lockpickingPower: 30,
    forgingPower: 40,
    vigilance: 24,
    description:
      'An expert in Halbach arrays who can focus magnetic force to extraordinary intensity on a single point.',
    abilities: ['field_sense', 'halbach_focus'],
  },
  {
    id: 'mag_flux_weaver',
    name: 'Flux Weaver',
    discipline: 'magnetic',
    rarity: 'rare',
    lockpickingPower: 60,
    forgingPower: 55,
    vigilance: 30,
    description:
      'Weaves magnetic flux lines like threads, guiding them through locks to align hidden pins.',
    abilities: ['field_sense', 'pole_flip', 'flux_weave'],
  },
  {
    id: 'mag_void_magnet',
    name: 'Void Magnet',
    discipline: 'magnetic',
    rarity: 'epic',
    lockpickingPower: 100,
    forgingPower: 80,
    vigilance: 35,
    description:
      'Commands a personal magnetic void that nullifies all magnetic security measures within range.',
    abilities: ['field_sense', 'halbach_focus', 'pole_flip', 'flux_weave'],
  },

  // ── Biometric Guardians (5) ──────────────────────────────────
  {
    id: 'bio_forged_print',
    name: 'Forged Print',
    discipline: 'biometric',
    rarity: 'common',
    lockpickingPower: 18,
    forgingPower: 15,
    vigilance: 20,
    description:
      'A master of gel and latex fingerprint replication. Their forged prints fool standard scanners.',
    abilities: ['print_forge'],
  },
  {
    id: 'bio_retina_clone',
    name: 'Retina Cloner',
    discipline: 'biometric',
    rarity: 'common',
    lockpickingPower: 24,
    forgingPower: 12,
    vigilance: 22,
    description:
      'Uses high-resolution lens replicas to trick retinal scanners. Their clones are indistinguishable from living eyes.',
    abilities: ['print_forge', 'retina_spoof'],
  },
  {
    id: 'bio_vein_reader',
    name: 'Vein Reader',
    discipline: 'biometric',
    rarity: 'uncommon',
    lockpickingPower: 35,
    forgingPower: 20,
    vigilance: 30,
    description:
      'Maps and replicates vascular patterns beneath the skin, fooling the most advanced vein scanners.',
    abilities: ['print_forge', 'vein_map'],
  },
  {
    id: 'bio_voice_phantom',
    name: 'Voice Phantom',
    discipline: 'biometric',
    rarity: 'rare',
    lockpickingPower: 50,
    forgingPower: 35,
    vigilance: 35,
    description:
      'Perfectly mimics any voice after hearing just a few seconds. Can fool voice authentication systems flawlessly.',
    abilities: ['print_forge', 'retina_spoof', 'voice_echo'],
  },
  {
    id: 'bio_genetic_key',
    name: 'Genetic Key',
    discipline: 'biometric',
    rarity: 'epic',
    lockpickingPower: 85,
    forgingPower: 70,
    vigilance: 40,
    description:
      'Can synthesize genetic markers on demand. DNA locks, iris patterns, gait recognition — nothing stops them.',
    abilities: ['print_forge', 'retina_spoof', 'vein_map', 'voice_echo'],
  },

  // ── Quantum Guardians (5) ────────────────────────────────────
  {
    id: 'qun_state_observer',
    name: 'State Observer',
    discipline: 'quantum',
    rarity: 'uncommon',
    lockpickingPower: 25,
    forgingPower: 10,
    vigilance: 35,
    description:
      'A novice quantum theorist who can observe qubit states without collapsing them. The first step to impossible locks.',
    abilities: ['qubit_observe'],
  },
  {
    id: 'qun_entangler',
    name: 'Entangler',
    discipline: 'quantum',
    rarity: 'uncommon',
    lockpickingPower: 30,
    forgingPower: 18,
    vigilance: 30,
    description:
      'Creates entangled particle pairs to probe quantum locks across dimensional barriers.',
    abilities: ['qubit_observe', 'entangle_probe'],
  },
  {
    id: 'qun_superposition',
    name: 'Superposition',
    discipline: 'quantum',
    rarity: 'rare',
    lockpickingPower: 55,
    forgingPower: 40,
    vigilance: 38,
    description:
      'Exists in multiple states simultaneously, allowing them to try every combination at once.',
    abilities: ['qubit_observe', 'entangle_probe', 'multi_state'],
  },
  {
    id: 'qun_decoherence',
    name: 'Decoherence',
    discipline: 'quantum',
    rarity: 'epic',
    lockpickingPower: 95,
    forgingPower: 75,
    vigilance: 42,
    description:
      'Can deliberately cause quantum decoherence in any lock, collapsing its security state to the unlocked position.',
    abilities: ['qubit_observe', 'entangle_probe', 'multi_state', 'decohere_force'],
  },
  {
    id: 'qun_vault_origin',
    name: 'Vault Origin',
    discipline: 'quantum',
    rarity: 'legendary',
    lockpickingPower: 130,
    forgingPower: 110,
    vigilance: 50,
    description:
      'The first quantum guardian, said to have originated from the vault itself. They perceive all locks across all timelines simultaneously and can manipulate the fundamental quantum state of any security mechanism.',
    abilities: ['qubit_observe', 'entangle_probe', 'multi_state', 'decohere_force', 'origin_sight'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: CB_CHAMBERS — 8 Vault Chambers
// ═══════════════════════════════════════════════════════════════════

export const CB_CHAMBERS: readonly CbChamberDef[] = [
  {
    id: 'bronze_antechamber',
    name: 'Bronze Antechamber',
    description:
      'The first line of defense. Bronze-reinforced doors guard mundane but valuable treasures. New guardians train here.',
    depth: 0,
    threatLevel: 1,
    requiredTitle: 'title_lock_novice',
    discipline: 'tumbler',
    bgGradient: 'linear-gradient(180deg, #C0C0C0 0%, #708090 50%, #DAA520 100%)',
    ambientColor: CB_LOCK_SILVER,
  },
  {
    id: 'steel_corridor',
    name: 'Steel Corridor',
    description:
      'A long corridor lined with steel vault doors. Each door requires different skills to breach or reinforce.',
    depth: 1,
    threatLevel: 2,
    requiredTitle: 'title_lock_novice',
    discipline: 'wafers',
    bgGradient: 'linear-gradient(180deg, #708090 0%, #2E8B57 50%, #C0C0C0 100%)',
    ambientColor: CB_STEEL_GRAY,
  },
  {
    id: 'crystal_vault',
    name: 'Crystal Vault',
    description:
      'Walls of crystallized lock mechanisms form an otherworldly chamber. Magnetic guardians thrive in its field.',
    depth: 2,
    threatLevel: 3,
    requiredTitle: 'title_pin_wizard',
    discipline: 'magnetic',
    bgGradient: 'linear-gradient(180deg, #00CED1 0%, #1C1C1C 50%, #DAA520 100%)',
    ambientColor: CB_CRYSTAL_CYAN,
  },
  {
    id: 'forge_underbelly',
    name: 'Forge Underbelly',
    description:
      'The vault\'s forge levels where locks are crafted and tempered. Intense heat and molten metal test every guardian.',
    depth: 3,
    threatLevel: 4,
    requiredTitle: 'title_warden',
    discipline: 'combination',
    bgGradient: 'linear-gradient(180deg, #FF8C00 0%, #DAA520 50%, #1C1C1C 100%)',
    ambientColor: CB_FORGE_ORANGE,
  },
  {
    id: 'circuit_depths',
    name: 'Circuit Depths',
    description:
      'An underground realm of humming electronics and blinking lights. Electronic locks guard the deepest data vaults.',
    depth: 4,
    threatLevel: 5,
    requiredTitle: 'title_steel_keeper',
    discipline: 'electronic',
    bgGradient: 'linear-gradient(180deg, #FF8C00 0%, #0047AB 50%, #00CED1 100%)',
    ambientColor: CB_COBALT_BLUE,
  },
  {
    id: 'bio_sanctum',
    name: 'Biometric Sanctum',
    description:
      'A living vault that reads biology itself. Only biometric masters can navigate its flesh-scanning corridors.',
    depth: 5,
    threatLevel: 6,
    requiredTitle: 'title_chamberlord',
    discipline: 'biometric',
    bgGradient: 'linear-gradient(180deg, #2E8B57 0%, #708090 50%, #DAA520 100%)',
    ambientColor: CB_SAFE_GREEN,
  },
  {
    id: 'quantum_abyss',
    name: 'Quantum Abyss',
    description:
      'The deepest chamber where locks exist in superposition. Reality itself is uncertain here. Only quantum guardians survive.',
    depth: 6,
    threatLevel: 7,
    requiredTitle: 'title_vault_sovereign',
    discipline: 'quantum',
    bgGradient: 'linear-gradient(180deg, #0047AB 0%, #1C1C1C 50%, #00CED1 100%)',
    ambientColor: CB_COBALT_BLUE,
  },
  {
    id: 'origin_core',
    name: 'Origin Core',
    description:
      'The mythical center of the vault where all disciplines converge. The rarest treasures and most dangerous locks exist here.',
    depth: 7,
    threatLevel: 8,
    requiredTitle: 'title_master_sealer',
    discipline: 'quantum',
    bgGradient: 'linear-gradient(180deg, #DAA520 0%, #0047AB 50%, #2E8B57 100%)',
    ambientColor: CB_VAULT_GOLD,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: CB_MATERIALS — 30 Metal/Gem Materials
// ═══════════════════════════════════════════════════════════════════

export const CB_MATERIALS: readonly CbMaterialDef[] = [
  // Common (8)
  { id: 'mat_iron_shavings', name: 'Iron Shavings', emoji: '🔩', type: 'metal', rarity: 'common', lockBonus: 2, forgeBonus: 1, value: 10, description: 'Fine iron shavings from grinding lock pins. Useful for basic alloy mixing.' },
  { id: 'mat_brass_wire', name: 'Brass Wire', emoji: '🪝', type: 'metal', rarity: 'common', lockBonus: 5, forgeBonus: 0, value: 15, description: 'Thin brass wire for crafting basic tension wrenches and picks.' },
  { id: 'mat_steel_plate', name: 'Steel Plate', emoji: '🛡️', type: 'metal', rarity: 'common', lockBonus: 1, forgeBonus: 3, value: 12, description: 'A small plate of carbon steel. The backbone of vault door construction.' },
  { id: 'mat_copper_pin', name: 'Copper Pin', emoji: '📌', type: 'metal', rarity: 'common', lockBonus: 4, forgeBonus: 0, value: 18, description: 'A standard copper lock pin. Soft but functional for practice locks.' },
  { id: 'mat_silver_nugget', name: 'Silver Nugget', emoji: '✨', type: 'metal', rarity: 'common', lockBonus: 3, forgeBonus: 2, value: 14, description: 'A nugget of pure silver. Conducts electricity for electronic lock repair.' },
  { id: 'mat_zinc_dust', name: 'Zinc Dust', emoji: '💫', type: 'metal', rarity: 'common', lockBonus: 6, forgeBonus: 0, value: 20, description: 'Fine zinc dust for galvanizing lock components against corrosion.' },
  { id: 'mat_charcoal_brick', name: 'Charcoal Brick', emoji: '▪️', type: 'metal', rarity: 'common', lockBonus: 0, forgeBonus: 4, value: 8, description: 'Compressed charcoal for the forge. Essential fuel for tempering steel.' },
  { id: 'mat_bronze_ingot', name: 'Bronze Ingot', emoji: '🟤', type: 'metal', rarity: 'common', lockBonus: 0, forgeBonus: 5, value: 16, description: 'A solid ingot of bronze alloy. Used in crafting ancient-style vault mechanisms.' },

  // Uncommon (7)
  { id: 'mat_titanium_rod', name: 'Titanium Rod', emoji: '⚙️', type: 'metal', rarity: 'uncommon', lockBonus: 15, forgeBonus: 0, value: 80, description: 'A lightweight titanium rod. The perfect material for high-precision lock picks.' },
  { id: 'mat_tungsten_carbide', name: 'Tungsten Carbide', emoji: '💎', type: 'metal', rarity: 'uncommon', lockBonus: 5, forgeBonus: 8, value: 65, description: 'Extremely hard tungsten carbide. Essential for cutting through reinforced vault walls.' },
  { id: 'mat_ruby_chip', name: 'Ruby Chip', emoji: '🔴', type: 'gem', rarity: 'uncommon', lockBonus: 10, forgeBonus: 0, value: 90, description: 'A chip of synthetic ruby used in laser-guided lock alignment systems.' },
  { id: 'mat_emerald_shard', name: 'Emerald Shard', emoji: '🟢', type: 'gem', rarity: 'uncommon', lockBonus: 0, forgeBonus: 15, value: 70, description: 'A shard of emerald that focuses forge energy. Locks forged with it are nearly unpickable.' },
  { id: 'mat_sapphire_lens', name: 'Sapphire Lens', emoji: '🔵', type: 'gem', rarity: 'uncommon', lockBonus: 8, forgeBonus: 6, value: 75, description: 'A polished sapphire lens for biometric retinal lock calibration.' },
  { id: 'mat_cobalt_alloy', name: 'Cobalt Alloy', emoji: '🔷', type: 'alloy', rarity: 'uncommon', lockBonus: 12, forgeBonus: 10, value: 85, description: 'A proprietary cobalt-chromium alloy. The signature metal of the vault.' },
  { id: 'mat_nitinol_wire', name: 'Nitinol Wire', emoji: '🪃', type: 'alloy', rarity: 'uncommon', lockBonus: 14, forgeBonus: 5, value: 72, description: 'Shape-memory nitinol wire that returns to its set form. Ideal for skeleton keys.' },

  // Rare (6)
  { id: 'mat_platinum_core', name: 'Platinum Core', emoji: '⚪', type: 'metal', rarity: 'rare', lockBonus: 35, forgeBonus: 15, value: 350, description: 'A platinum core for the finest vault lock cylinders. Corrosion-proof and eternal.' },
  { id: 'mat_diamond_dust', name: 'Diamond Dust', emoji: '💠', type: 'gem', rarity: 'rare', lockBonus: 20, forgeBonus: 25, value: 300, description: 'Microscopic diamond particles. The hardest known material, used for cutting any lock.' },
  { id: 'mat_magnetite_crystal', name: 'Magnetite Crystal', emoji: '🧲', type: 'crystal_shard', rarity: 'rare', lockBonus: 30, forgeBonus: 10, value: 320, description: 'A naturally magnetized crystal of magnetite. Amplifies magnetic lock manipulation.' },
  { id: 'mat_opal_matrix', name: 'Opal Matrix', emoji: '🌈', type: 'gem', rarity: 'rare', lockBonus: 15, forgeBonus: 20, value: 380, description: 'A precious opal matrix that diffracts light for holographic lock authentication.' },
  { id: 'mat_stellite_plate', name: 'Stellite Plate', emoji: '🔶', type: 'alloy', rarity: 'rare', lockBonus: 25, forgeBonus: 22, value: 400, description: 'A cobalt-chrome superalloy plate. Withstands extreme heat and wear in vault forge construction.' },
  { id: 'mat_iridium_pin', name: 'Iridium Pin', emoji: '📌', type: 'metal', rarity: 'rare', lockBonus: 28, forgeBonus: 18, value: 360, description: 'An iridium lock pin of extraordinary density. The heaviest pin ever crafted.' },

  // Epic (5)
  { id: 'mat_void_steel', name: 'Void Steel', emoji: '🌀', type: 'alloy', rarity: 'epic', lockBonus: 50, forgeBonus: 40, value: 1500, description: 'Steel forged in the absence of all light. It absorbs impact and vibration completely.' },
  { id: 'mat_singularity_gem', name: 'Singularity Gem', emoji: '🕳️', type: 'gem', rarity: 'epic', lockBonus: 30, forgeBonus: 60, value: 1400, description: 'A gem containing a micro-singularity. Its gravity warps lock mechanisms on contact.' },
  { id: 'mat_phase_crystal', name: 'Phase Crystal', emoji: '🔮', type: 'crystal_shard', rarity: 'epic', lockBonus: 60, forgeBonus: 30, value: 1600, description: 'A crystal that phases between solid states. Locks incorporating it can exist in two configurations.' },
  { id: 'mat_neutron_alloy', name: 'Neutron Alloy', emoji: '⚛️', type: 'alloy', rarity: 'epic', lockBonus: 45, forgeBonus: 50, value: 1700, description: 'An alloy incorporating degenerate matter from neutron stars. Indestructible.' },
  { id: 'mat_entropy_essence', name: 'Entropy Essence', emoji: '💜', type: 'essence', rarity: 'epic', lockBonus: 40, forgeBonus: 35, value: 1800, description: 'Pure concentrated entropy. A single drop accelerates decay in any lock mechanism.' },

  // Legendary (4)
  { id: 'mat_chronos_shard', name: 'Chronos Shard', emoji: '⏳', type: 'crystal_shard', rarity: 'legendary', lockBonus: 70, forgeBonus: 70, value: 8000, description: 'A shard from the clock of time itself. Locks made with it exist outside of temporal flow, making them immune to time-based attack vectors.' },
  { id: 'mat_aetherium_ingot', name: 'Aetherium Ingot', emoji: '🌟', type: 'essence', rarity: 'legendary', lockBonus: 90, forgeBonus: 50, value: 10000, description: 'Solidified aether — the fifth element. Its mere presence nullifies all security systems.' },
  { id: 'mat_void_sapphire', name: 'Void Sapphire', emoji: '💎', type: 'gem', rarity: 'legendary', lockBonus: 60, forgeBonus: 80, value: 9000, description: 'A sapphire grown in absolute vacuum. It absorbs all forms of energy including quantum states.' },
  { id: 'mat_omega_alloy', name: 'Omega Alloy', emoji: '🔱', type: 'alloy', rarity: 'legendary', lockBonus: 80, forgeBonus: 90, value: 12000, description: 'The final alloy. Forged from every known metal and infused with the vault\'s origin energy.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: CB_STRUCTURES — 25 Vault Structures
// ═══════════════════════════════════════════════════════════════════

export const CB_STRUCTURES: readonly CbStructureDef[] = [
  // ── Guardian Barracks (7) ────────────────────────────────────
  { id: 'str_tin_barracks', name: 'Tin Barracks', emoji: '🏚️', category: 'guardian_barracks', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4, description: 'Basic tin-roofed quarters for apprentice guardians. Cramped but functional.' },
  { id: 'str_iron_dormitory', name: 'Iron Dormitory', emoji: '🏢', category: 'guardian_barracks', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 80, costMultiplier: 1.5, description: 'Reinforced iron dormitory housing common guardians. Sturdy bunks and weapon racks.' },
  { id: 'str_steel_citadel', name: 'Steel Citadel', emoji: '🏰', category: 'guardian_barracks', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.5, description: 'A steel citadel for housing uncommon guardians. Includes training yards and armories.' },
  { id: 'str_cobalt_fortress', name: 'Cobalt Fortress', emoji: '🏯', category: 'guardian_barracks', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 180, costMultiplier: 1.6, description: 'A cobalt-blue fortress for rare guardians. Equipped with specialist laboratories.' },
  { id: 'str_vault_sanctum', name: 'Vault Sanctum', emoji: '⛪', category: 'guardian_barracks', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 150, costMultiplier: 1.5, description: 'A sanctum where guardians of all disciplines rest and recover between vault operations.' },
  { id: 'str_depth_bunker', name: 'Depth Bunker', emoji: '⛰️', category: 'guardian_barracks', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 160, costMultiplier: 1.5, description: 'A deep underground bunker built to withstand vault breaches. Guardian morale bonus.' },
  { id: 'str_origin_chamber', name: 'Origin Chamber', emoji: '🌌', category: 'guardian_barracks', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 200, costMultiplier: 1.6, description: 'A chamber connected to the vault\'s origin. Guardians stationed here gain cosmic awareness.' },

  // ── Forge Stations (6) ───────────────────────────────────────
  { id: 'str_basic_forge', name: 'Basic Forge', emoji: '🔨', category: 'forge_station', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, description: 'A coal-fired forge for crafting basic lock components and simple picks.' },
  { id: 'str_arc_furnace', name: 'Arc Furnace', emoji: '⚡', category: 'forge_station', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 250, costMultiplier: 1.6, description: 'An electric arc furnace capable of melting titanium and tungsten for advanced lock making.' },
  { id: 'str_cryo_forge', name: 'Cryo Forge', emoji: '❄️', category: 'forge_station', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 400, costMultiplier: 1.7, description: 'A forge that operates at near absolute zero. Creates locks with molecularly perfect structures.' },
  { id: 'str_quantum_loom', name: 'Quantum Loom', emoji: '🌀', category: 'forge_station', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 600, costMultiplier: 1.8, description: 'Weaves quantum states into physical lock mechanisms. The cutting edge of vault technology.' },
  { id: 'str_stellar_anvil', name: 'Stellar Anvil', emoji: '💫', category: 'forge_station', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 900, costMultiplier: 1.9, description: 'An anvil forged from stellar core material. Anything crafted here is permanently enhanced.' },
  { id: 'str_origin_forge', name: 'Origin Forge', emoji: '🔮', category: 'forge_station', maxLevel: 10, baseEffect: 14, effectPerLevel: 7, baseCost: 850, costMultiplier: 1.9, description: 'The original forge that created the vault. Crafting here taps into the vault\'s fundamental power.' },

  // ── Vault Doors (5) ─────────────────────────────────────────
  { id: 'str_iron_door', name: 'Iron Vault Door', emoji: '🚪', category: 'vault_door', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 120, costMultiplier: 1.5, description: 'A thick iron door with a basic pin tumbler lock. First line of vault defense.' },
  { id: 'str_steel_gate', name: 'Steel Blast Gate', emoji: '🛡️', category: 'vault_door', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.6, description: 'A reinforced steel gate with time-lock mechanism. Withstands explosive force.' },
  { id: 'str_titanium_seal', name: 'Titanium Seal Door', emoji: '🔒', category: 'vault_door', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 500, costMultiplier: 1.7, description: 'A seamless titanium door with biometric and electronic lock integration.' },
  { id: 'str_void_barrier', name: 'Void Barrier', emoji: '🕳️', category: 'vault_door', maxLevel: 10, baseEffect: 20, effectPerLevel: 10, baseCost: 800, costMultiplier: 1.8, description: 'A door made of void steel that exists partially outside normal space. Nearly impenetrable.' },
  { id: 'str_origin_gate', name: 'Origin Gate', emoji: '🌠', category: 'vault_door', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1200, costMultiplier: 2.0, description: 'The ultimate vault door, forged from the vault\'s own origin material. Defies all known intrusion methods.' },

  // ── Trap Workshops (4) ───────────────────────────────────────
  { id: 'str_spring_trap', name: 'Spring Trap Workshop', emoji: '💥', category: 'trap_workshop', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 200, costMultiplier: 1.5, description: 'Crafts spring-loaded traps that trigger when unauthorized access is attempted.' },
  { id: 'str_gas_trap', name: 'Gas Trap Lab', emoji: '💨', category: 'trap_workshop', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 450, costMultiplier: 1.7, description: 'Develops gas-based deterrents and knockout systems for vault corridors.' },
  { id: 'str_laser_grid', name: 'Laser Grid Foundry', emoji: '🔴', category: 'trap_workshop', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 700, costMultiplier: 1.8, description: 'Creates precision laser grid alarm systems that detect the slightest intrusion.' },
  { id: 'str_temporal_trap', name: 'Temporal Trap Forge', emoji: '⏰', category: 'trap_workshop', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1500, costMultiplier: 2.0, description: 'Forges traps that manipulate local time flow within the vault corridors. Intruders find themselves trapped in infinitely repeating time loops, reliving the same thirty seconds of approach forever.' },

  // ── Treasury (3) ─────────────────────────────────────────────
  { id: 'str_coin_vault', name: 'Coin Vault', emoji: '💰', category: 'treasury', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.5, description: 'A secure vault for storing gold reserves. Generates passive gold income.' },
  { id: 'str_relic_vault', name: 'Relic Vault', emoji: '🏛️', category: 'treasury', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 600, costMultiplier: 1.7, description: 'A magically sealed vault that preserves and amplifies the power of stored artifacts.' },
  { id: 'str_infinity_treasury', name: 'Infinity Treasury', emoji: '♾️', category: 'treasury', maxLevel: 10, baseEffect: 30, effectPerLevel: 15, baseCost: 2000, costMultiplier: 2.0, description: 'A treasury that exists in infinite parallel dimensions simultaneously. Its storage capacity is literally without limit, and gold deposited here generates copies across the multiverse.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: CB_ABILITIES — 22 Vault Abilities
// ═══════════════════════════════════════════════════════════════════

export const CB_ABILITIES: readonly CbAbilityDef[] = [
  { id: 'ab_pick_set', name: 'Pick Set', emoji: '🔧', discipline: 'tumbler', type: 'active', rarity: 'common', energyCost: 5, cooldown: 30, power: 15, description: 'Use a standard pick set to manipulate pin tumblers with practiced ease.' },
  { id: 'ab_tension_wrench', name: 'Tension Wrench', emoji: '🔩', discipline: 'tumbler', type: 'active', rarity: 'common', energyCost: 8, cooldown: 45, power: 20, description: 'Apply precise torsional force to the lock cylinder while picking.' },
  { id: 'ab_wafer_jimmy', name: 'Wafer Jimmy', emoji: '🪃', discipline: 'wafers', type: 'active', rarity: 'common', energyCost: 10, cooldown: 60, power: 18, description: 'Use a thin jimmy tool to bypass wafer locks by sliding wafers out of position.' },
  { id: 'ab_magnet_pulse', name: 'Magnet Pulse', emoji: '🧲', discipline: 'magnetic', type: 'active', rarity: 'common', energyCost: 12, cooldown: 90, power: 16, description: 'Emit a concentrated magnetic pulse that realigns magnetic lock pins.' },
  { id: 'ab_dial_master', name: 'Dial Master', emoji: '🔢', discipline: 'combination', type: 'active', rarity: 'common', energyCost: 6, cooldown: 30, power: 12, description: 'Feel the subtle clicks of a combination dial to determine the correct sequence.' },
  { id: 'ab_circuit_probe', name: 'Circuit Probe', emoji: '🔌', discipline: 'electronic', type: 'active', rarity: 'common', energyCost: 7, cooldown: 35, power: 14, description: 'Insert a probe into the electronic lock circuit to read and manipulate signals.' },
  { id: 'ab_bio_spoof', name: 'Bio Spoof', emoji: '👁️', discipline: 'biometric', type: 'active', rarity: 'common', energyCost: 8, cooldown: 40, power: 18, description: 'Deploy a synthetic biometric sample to fool fingerprint and retinal scanners.' },
  { id: 'ab_qubit_scan', name: 'Qubit Scan', emoji: '⚛️', discipline: 'quantum', type: 'active', rarity: 'common', energyCost: 15, cooldown: 60, power: 25, description: 'Scan quantum lock states without collapsing them, revealing the unlock path.' },
  { id: 'ab_rake_burst', name: 'Rake Burst', emoji: '⚡', discipline: 'tumbler', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 90, power: 35, description: 'A rapid raking technique that sets all pins simultaneously through sheer speed.' },
  { id: 'ab_wafer_override', name: 'Wafer Override', emoji: '🔄', discipline: 'wafers', type: 'active', rarity: 'uncommon', energyCost: 20, cooldown: 100, power: 32, description: 'Override all wafer positions using a specialized mechanical jig tool.' },
  { id: 'ab_field_reverse', name: 'Field Reverse', emoji: '🔃', discipline: 'magnetic', type: 'active', rarity: 'uncommon', energyCost: 22, cooldown: 110, power: 30, description: 'Reverse the magnetic field of a lock, flipping all magnetic pins to the unlock position.' },
  { id: 'ab_brute_force', name: 'Brute Force', emoji: '💪', discipline: 'combination', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 28, description: 'Apply overwhelming mechanical force to a combination lock dial, bypassing the mechanism.' },
  { id: 'ab_emergency_access', name: 'Emergency Access', emoji: '🚨', discipline: 'electronic', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 80, power: 26, description: 'Trigger the emergency override circuit built into all electronic locks.' },
  { id: 'ab_genetic_mask', name: 'Genetic Mask', emoji: '🎭', discipline: 'biometric', type: 'active', rarity: 'uncommon', energyCost: 16, cooldown: 70, power: 28, description: 'Generate a perfect genetic mask that matches any authorized biometric profile.' },
  { id: 'ab_pin_feel', name: 'Pin Feel', emoji: '👆', discipline: 'tumbler', type: 'active', rarity: 'rare', energyCost: 30, cooldown: 120, power: 50, description: 'An advanced tactile technique. Feel every pin stack individually through pure touch sensitivity.' },
  { id: 'ab_multi_wafer', name: 'Multi-Wafer', emoji: '📊', discipline: 'wafers', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 110, power: 45, description: 'Simultaneously manipulate all wafers in a multi-wafer lock using a custom tool set.' },
  { id: 'ab_trap_sense', name: 'Trap Sense', emoji: '⚠️', discipline: 'combination', type: 'passive', rarity: 'rare', energyCost: 0, cooldown: 0, power: 15, description: 'Automatically detect and disarm trap mechanisms on combination locks.' },
  { id: 'ab_ghost_signal', name: 'Ghost Signal', emoji: '👻', discipline: 'electronic', type: 'active', rarity: 'rare', energyCost: 25, cooldown: 120, power: 42, description: 'Become invisible to all electronic sensors and cameras for a short duration.' },
  { id: 'ab_dna_key', name: 'DNA Key', emoji: '🧬', discipline: 'biometric', type: 'active', rarity: 'rare', energyCost: 35, cooldown: 150, power: 55, description: 'Synthesize a perfect DNA key on the spot, fooling even genetic-level biometric locks.' },
  { id: 'ab_quantum_tunnel', name: 'Quantum Tunnel', emoji: '🌀', discipline: 'quantum', type: 'active', rarity: 'rare', energyCost: 40, cooldown: 180, power: 60, description: 'Enable guardians to quantum-tunnel through solid vault walls for brief moments.' },
  { id: 'ab_entangle_lock', name: 'Entangle Lock', emoji: '🔗', discipline: 'quantum', type: 'active', rarity: 'epic', energyCost: 50, cooldown: 300, power: 80, description: 'Entangle the lock with a remote particle, causing it to spontaneously unlock.' },
  { id: 'ab_origin_key', name: 'Origin Key', emoji: '🔑', discipline: 'quantum', type: 'active', rarity: 'legendary', energyCost: 60, cooldown: 600, power: 120, description: 'The primordial key. Unlocks any lock in existence by reverting it to its unlocked origin state.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: CB_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const CB_ACHIEVEMENTS: readonly CbAchievementDef[] = [
  { id: 'ach_first_recruit', name: 'First Recruitment', emoji: '🛡️', description: 'Recruit your first vault guardian.', condition: 'recruit_1', reward: { gold: 50, renown: 10 } },
  { id: 'ach_five_recruits', name: 'Warden\'s Hand', emoji: '🤚', description: 'Recruit 5 different vault guardians.', condition: 'recruit_5', reward: { gold: 200, renown: 40 } },
  { id: 'ach_first_forge', name: 'First Lock Forged', emoji: '🔨', description: 'Forge your first lock.', condition: 'forge_1', reward: { gold: 80, renown: 15 } },
  { id: 'ach_ten_forges', name: 'Master Blacksmith', emoji: '⚒️', description: 'Forge locks 10 times.', condition: 'forge_10', reward: { gold: 300, renown: 60 } },
  { id: 'ach_first_build', name: 'Groundbreaking', emoji: '🏗️', description: 'Build your first vault structure.', condition: 'build_1', reward: { gold: 100, renown: 20 } },
  { id: 'ach_five_builds', name: 'Vault Architect', emoji: '🏛️', description: 'Build 5 different vault structures.', condition: 'build_5', reward: { gold: 500, renown: 80 } },
  { id: 'ach_chamber_secure', name: 'Chamber Secured', emoji: '🗺️', description: 'Secure 4 different vault chambers.', condition: 'chamber_4', reward: { gold: 400, renown: 50 } },
  { id: 'ach_all_chambers', name: 'Vault Cartographer', emoji: '🌍', description: 'Secure all 8 vault chambers.', condition: 'chamber_8', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_rare_recruit', name: 'Rare Catch', emoji: '💎', description: 'Recruit a rare guardian.', condition: 'rare_recruit', reward: { gold: 500, renown: 100 } },
  { id: 'ach_epic_recruit', name: 'Epic Discovery', emoji: '🌟', description: 'Recruit an epic guardian.', condition: 'epic_recruit', reward: { gold: 1500, renown: 250 } },
  { id: 'ach_legendary_recruit', name: 'Legendary Guardian', emoji: '👑', description: 'Recruit a legendary guardian.', condition: 'legendary_recruit', reward: { gold: 5000, renown: 500 } },
  { id: 'ach_first_relic', name: 'Artifact Finder', emoji: '🏺', description: 'Discover your first treasure artifact.', condition: 'relic_1', reward: { gold: 300, renown: 60 } },
  { id: 'ach_five_relics', name: 'Treasure Hunter', emoji: '🔍', description: 'Collect 5 different treasure artifacts.', condition: 'relic_5', reward: { gold: 1000, renown: 150 } },
  { id: 'ach_first_breach', name: 'Breach Survivor', emoji: '⚡', description: 'Survive your first vault breach event.', condition: 'event_1', reward: { gold: 200, renown: 30 } },
  { id: 'ach_ten_breaches', name: 'Breach Veteran', emoji: '🏅', description: 'Survive 10 vault breach events.', condition: 'event_10', reward: { gold: 800, renown: 120 } },
  { id: 'ach_upgrade_max', name: 'Master Builder', emoji: '🔨', description: 'Upgrade any structure to maximum level.', condition: 'upgrade_max', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_all_disciplines', name: 'Discipline Master', emoji: '🌈', description: 'Recruit at least one guardian from each discipline.', condition: 'all_disciplines', reward: { gold: 3000, renown: 300 } },
  { id: 'ach_vault_deity', name: 'Vault Deity', emoji: '👑', description: 'Reach the title of Vault Deity.', condition: 'max_title', reward: { gold: 10000, renown: 1000 } },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: CB_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const CB_TITLES: readonly CbTitleDef[] = [
  { id: 'title_lock_novice', name: 'Lock Novice', emoji: '🐣', minRenown: 0, minGuardians: 0, description: 'A beginner who has just started learning the art of locks and vaults.' },
  { id: 'title_pin_wizard', name: 'Pin Wizard', emoji: '🔧', minRenown: 50, minGuardians: 3, description: 'A competent lock handler who can pick common pin tumblers with confidence.' },
  { id: 'title_warden', name: 'Vault Warden', emoji: '🛡️', minRenown: 200, minGuardians: 7, description: 'A skilled warden who guards and manages multiple vault chambers.' },
  { id: 'title_steel_keeper', name: 'Steel Keeper', emoji: '⚒️', minRenown: 500, minGuardians: 12, description: 'An expert in vault security who commands respect across all lock disciplines.' },
  { id: 'title_chamberlord', name: 'Chamberlord', emoji: '🏰', minRenown: 1200, minGuardians: 18, description: 'A lord of the chambers, trusted with the deepest and most dangerous vault sections.' },
  { id: 'title_vault_sovereign', name: 'Vault Sovereign', emoji: '🔱', minRenown: 2500, minGuardians: 24, description: 'A sovereign of the vault, commanding legions of guardians across all disciplines.' },
  { id: 'title_master_sealer', name: 'Master Sealer', emoji: '🗝️', minRenown: 5000, minGuardians: 30, description: 'A legendary sealer whose locks have never been picked. Their name is synonymous with security.' },
  { id: 'title_vault_deity', name: 'Vault Deity', emoji: '👑', minRenown: 10000, minGuardians: 35, description: 'The supreme Vault Deity, master of all locks, guardian of all treasures, lord of the vault.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: CB_RELICS — 15 Legendary Treasure Artifacts
// ═══════════════════════════════════════════════════════════════════

export const CB_RELICS: readonly CbRelicDef[] = [
  { id: 'relic_cobalt_key', name: 'Cobalt Master Key', emoji: '🔑', rarity: 'epic', discipline: 'tumbler', lockBoost: 20, forgeBoost: 15, vigilanceBoost: 10, value: 2000, description: 'A key forged from pure cobalt that can open any tumbler lock ever made.' },
  { id: 'relic_wafer_crown', name: 'Crown of Wafers', emoji: '👑', rarity: 'epic', discipline: 'wafers', lockBoost: 35, forgeBoost: 5, vigilanceBoost: 5, value: 2200, description: 'A crown of perfectly machined wafers. It grants authority over all wafer locks.' },
  { id: 'relic_dial_of_ages', name: 'Dial of Ages', emoji: '⏳', rarity: 'rare', discipline: 'combination', lockBoost: 10, forgeBoost: 10, vigilanceBoost: 15, value: 800, description: 'An ancient combination dial that reveals the combination to any lock it touches.' },
  { id: 'relic_circuit_board', name: 'Primordial Circuit', emoji: '🔌', rarity: 'rare', discipline: 'electronic', lockBoost: 5, forgeBoost: 20, vigilanceBoost: 10, value: 750, description: 'A circuit board from the first electronic lock ever built. It holds ancestral code.' },
  { id: 'relic_magnetic_monopole', name: 'Magnetic Monopole', emoji: '🧲', rarity: 'epic', discipline: 'magnetic', lockBoost: 25, forgeBoost: 20, vigilanceBoost: 15, value: 2500, description: 'A single magnetic monopole of impossible physics. It can unlock any magnetic seal.' },
  { id: 'relic_gene_print', name: 'Gene Print', emoji: '🧬', rarity: 'epic', discipline: 'biometric', lockBoost: 15, forgeBoost: 15, vigilanceBoost: 25, value: 2400, description: 'The first biometric sample ever recorded. It matches every biometric scanner in existence.' },
  { id: 'relic_quantum_key', name: 'Quantum Skeleton Key', emoji: '🔮', rarity: 'epic', discipline: 'quantum', lockBoost: 20, forgeBoost: 25, vigilanceBoost: 10, value: 2600, description: 'A skeleton key that exists in superposition. It is every key at once until observed.' },
  { id: 'relic_eye_of_vault', name: 'Eye of the Vault', emoji: '👁️', rarity: 'legendary', discipline: 'combination', lockBoost: 40, forgeBoost: 30, vigilanceBoost: 20, value: 8000, description: 'A gemstone eye that reveals the internal mechanism of any lock. All secrets are laid bare.' },
  { id: 'relic_vault_stone', name: 'Foundation Stone', emoji: '🗿', rarity: 'legendary', discipline: 'wafers', lockBoost: 30, forgeBoost: 40, vigilanceBoost: 15, value: 7500, description: 'The original foundation stone of the vault. It grants mastery over all structural security.' },
  { id: 'relic_phantom_pick', name: 'Phantom Pick', emoji: '👻', rarity: 'legendary', discipline: 'tumbler', lockBoost: 60, forgeBoost: 20, vigilanceBoost: 20, value: 10000, description: 'A lock pick that can pass through solid matter. No tumbler is safe from its ethereal touch.' },
  { id: 'relic_infinity_dial', name: 'Infinity Dial', emoji: '♾️', rarity: 'legendary', discipline: 'electronic', lockBoost: 25, forgeBoost: 35, vigilanceBoost: 30, value: 9000, description: 'A dial with infinite positions. It can generate any electronic key code instantly.' },
  { id: 'relic_soul_lock', name: 'Soul Lock', emoji: '⚜️', rarity: 'legendary', discipline: 'magnetic', lockBoost: 35, forgeBoost: 35, vigilanceBoost: 25, value: 9500, description: 'A lock that reads the soul. It opens only for the truly worthy and seals all others forever.' },
  { id: 'relic_origin_fingerprint', name: 'Origin Fingerprint', emoji: '📜', rarity: 'epic', discipline: 'biometric', lockBoost: 20, forgeBoost: 15, vigilanceBoost: 30, value: 2300, description: 'The fingerprint of the vault\'s creator. It overrides all biometric security protocols.' },
  { id: 'relic_temporal_key', name: 'Temporal Key', emoji: '⏰', rarity: 'legendary', discipline: 'quantum', lockBoost: 50, forgeBoost: 45, vigilanceBoost: 25, value: 11000, description: 'A key that unlocks locks across time itself. Open a vault door yesterday, close it tomorrow, or bypass a lock that has not yet been invented. The ultimate temporal weapon for any vault guardian.' },
  { id: 'relic_omega_ring', name: 'Omega Ring', emoji: '💍', rarity: 'legendary', discipline: 'quantum', lockBoost: 30, forgeBoost: 30, vigilanceBoost: 40, value: 12000, description: 'The final artifact. A ring of infinite density that controls the fundamental forces binding all locks in existence. The wearer becomes one with the vault itself, perceiving every mechanism as an extension of their own nervous system.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: CB_EVENTS — 12 Vault Breach Events
// ═══════════════════════════════════════════════════════════════════

export const CB_EVENTS: readonly CbEventDef[] = [
  { id: 'evt_tunnel_dig', name: 'Tunnel Dig', emoji: '⛏️', durationTurns: 5, effectType: 'debuff', effectDescription: 'Chamber security reduced by 30%. Tumbler guardians immune.', description: 'Rivals are tunneling beneath the vault walls. Structural integrity is compromised.' },
  { id: 'evt_power_surge', name: 'Power Surge', emoji: '⚡', durationTurns: 3, effectType: 'buff', effectDescription: 'Electronic lock power doubled. Forging speed tripled.', description: 'A massive power surge courses through the vault grid. Electronics are supercharged.' },
  { id: 'evt_rogue_guardian', name: 'Rogue Guardian', emoji: '🏃', durationTurns: 4, effectType: 'debuff', effectDescription: 'One guardian temporarily disabled. Gold reward on recovery.', description: 'A guardian has gone rogue! They must be tracked down and returned to duty.' },
  { id: 'evt_magnetic_storm', name: 'Magnetic Storm', emoji: '🌪️', durationTurns: 3, effectType: 'special', effectDescription: 'Magnetic guardians triple power. All electronic locks disabled.', description: 'A geomagnetic storm floods the vault. Magnetic locks go haywire while magnetic guardians thrive.' },
  { id: 'evt_heist_night', name: 'Heist Night', emoji: '🌙', durationTurns: 2, effectType: 'debuff', effectDescription: 'Vigilance reduced by 25%. Rare materials vulnerable to theft.', description: 'The annual thieves\' convention is in town. Every criminal eye is on your vault tonight.' },
  { id: 'evt_golden_vein', name: 'Golden Vein', emoji: '💎', durationTurns: 5, effectType: 'buff', effectDescription: 'Gold rewards doubled. Mining output increased.', description: 'A rich vein of gold-bearing ore discovered beneath the vault. Prosperity flows.' },
  { id: 'evt_lockdown', name: 'Full Lockdown', emoji: '🚨', durationTurns: 4, effectType: 'buff', effectDescription: 'All vault defense doubled. No chamber access during lockdown.', description: 'Security protocols triggered. Every door sealed, every trap armed. Maximum defense.' },
  { id: 'evt_siege', name: 'Vault Siege', emoji: '🏰', durationTurns: 5, effectType: 'debuff', effectDescription: 'All guardian endurance drains faster. Forging disabled.', description: 'An army of rival vault breakers lays siege to the entrance. Hold the line!' },
  { id: 'evt_quantum_flux', name: 'Quantum Flux', emoji: '🌀', durationTurns: 3, effectType: 'special', effectDescription: 'Quantum guardians gain +50 power. Random materials transform.', description: 'A quantum flux event distorts reality in the lower chambers. Materials shift and change.' },
  { id: 'evt_founder_spirit', name: 'Founder\'s Spirit', emoji: '👻', durationTurns: 4, effectType: 'buff', effectDescription: 'All guardian morale restored. Legendary relic chance increased.', description: 'The spirit of the vault\'s founder walks the halls. Guardians are inspired and relics appear.' },
  { id: 'evt_rust_wave', name: 'Rust Wave', emoji: '🦠', durationTurns: 5, effectType: 'debuff', effectDescription: 'Lock durability reduced. Structure maintenance required.', description: 'A corrosive rust wave sweeps through the vault. Metal weakens and locks degrade.' },
  { id: 'evt_origin_pulse', name: 'Origin Pulse', emoji: '✨', durationTurns: 6, effectType: 'buff', effectDescription: 'All guardian power +20%. Recruitment chance doubled.', description: 'The vault\'s origin core emits a pulse of pure energy. Every guardian is amplified and new recruits are drawn to the vault\'s beacon.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: INTERNAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const CB_MAX_GUARDIAN_LEVEL = 50
const CB_MAX_STRUCTURE_LEVEL = 10
const CB_INITIAL_GOLD = 200
const CB_INITIAL_RENOWN = 0

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: HELPER FUNCTIONS (hoisted with `function`)
// ═══════════════════════════════════════════════════════════════════

function cbXpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.25, level - 1))
}

function cbCalcStats(species: CbGuardianSpecies, level: number) {
  const growth = 1 + (level - 1) * 0.12
  return {
    lockpickingPower: Math.floor(species.lockpickingPower * growth),
    forgingPower: Math.floor(species.forgingPower * growth),
    vigilance: Math.floor(species.vigilance * growth),
  }
}

let _cbIdCounter = 0
function cbGenerateId(): string {
  _cbIdCounter += 1
  return `cb_${_cbIdCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`
}

function cbFindSpecies(id: string): CbGuardianSpecies | undefined {
  return CB_GUARDIANS.find((s) => s.id === id)
}

function cbFindChamber(id: string): CbChamberDef | undefined {
  return CB_CHAMBERS.find((z) => z.id === id)
}

function cbFindMaterial(id: string): CbMaterialDef | undefined {
  return CB_MATERIALS.find((m) => m.id === id)
}

function cbFindStructureDef(id: string): CbStructureDef | undefined {
  return CB_STRUCTURES.find((s) => s.id === id)
}

function cbFindAbility(id: string): CbAbilityDef | undefined {
  return CB_ABILITIES.find((a) => a.id === id)
}

function cbFindRelic(id: string): CbRelicDef | undefined {
  return CB_RELICS.find((r) => r.id === id)
}

function cbFindAchievement(id: string): CbAchievementDef | undefined {
  return CB_ACHIEVEMENTS.find((a) => a.id === id)
}

function cbFindTitle(id: CbTitleId): CbTitleDef | undefined {
  return CB_TITLES.find((t) => t.id === id)
}

function cbRarityMultiplier(rarity: CbRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 5
    case 'epic': return 10
    case 'legendary': return 25
    default: return 1
  }
}

function cbRarityColor(rarity: CbRarity): string {
  switch (rarity) {
    case 'common': return '#9ca3af'
    case 'uncommon': return '#34d399'
    case 'rare': return '#60a5fa'
    case 'epic': return '#a78bfa'
    case 'legendary': return '#fbbf24'
    default: return '#9ca3af'
  }
}

function cbDisciplineColor(discipline: CbLockDiscipline): string {
  switch (discipline) {
    case 'tumbler': return CB_LOCK_SILVER
    case 'wafers': return CB_STEEL_GRAY
    case 'combination': return CB_VAULT_GOLD
    case 'electronic': return CB_FORGE_ORANGE
    case 'magnetic': return CB_CRYSTAL_CYAN
    case 'biometric': return CB_SAFE_GREEN
    case 'quantum': return CB_COBALT_BLUE
    default: return '#888888'
  }
}

/**
 * Check discipline synergy between attacker and defender disciplines.
 * Returns 1.4 for advantage, 0.7 for disadvantage, 1.0 for neutral.
 */
export function cbCheckSynergy(attacker: CbLockDiscipline, defender: CbLockDiscipline): number {
  const advantages = CB_SYNERGY_MAP[attacker]
  if (advantages?.includes(defender)) return 1.4
  const disadvantages = CB_SYNERGY_MAP[defender]
  if (disadvantages?.includes(attacker)) return 0.7
  return 1.0
}

function cbCalcStructureUpgradeCost(def: CbStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

/**
 * Calculate the maximum title achievable given current renown and guardian count.
 * Iterates through all titles and returns the highest one the player qualifies for.
 */
function cbCalcMaxTitle(renown: number, guardianCount: number): CbTitleId {
  let bestId: CbTitleId = 'title_lock_novice'
  for (const title of CB_TITLES) {
    if (renown >= title.minRenown && guardianCount >= title.minGuardians) {
      bestId = title.id
    }
  }
  return bestId
}

/**
 * Evaluate whether a specific achievement condition is met
 * based on the current store state. Each condition maps to
 * a quantitative check against tracked progress counters.
 */
function cbCheckAchievementCondition(
  condition: string,
  state: CbStoreState
): boolean {
  switch (condition) {
    case 'recruit_1':
      return state.totalRecruited >= 1
    case 'recruit_5':
      return state.totalRecruited >= 5
    case 'forge_1':
      return state.totalForged >= 1
    case 'forge_10':
      return state.totalForged >= 10
    case 'build_1':
      return state.totalBuilt >= 1
    case 'build_5':
      return state.totalBuilt >= 5
    case 'chamber_4':
      return state.chambers.length >= 4
    case 'chamber_8':
      return state.chambers.length >= 8
    case 'rare_recruit':
      return state.guardians.some((g) => {
        const sp = cbFindSpecies(g.speciesId)
        return sp && (sp.rarity === 'rare' || sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'epic_recruit':
      return state.guardians.some((g) => {
        const sp = cbFindSpecies(g.speciesId)
        return sp && (sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'legendary_recruit':
      return state.guardians.some((g) => {
        const sp = cbFindSpecies(g.speciesId)
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
    case 'upgrade_max':
      return state.structures.some((s) => s.level >= CB_MAX_STRUCTURE_LEVEL)
    case 'all_disciplines': {
      const disciplines = new Set<CbLockDiscipline>()
      for (const g of state.guardians) {
        const sp = cbFindSpecies(g.speciesId)
        if (sp) disciplines.add(sp.discipline)
      }
      return disciplines.size >= 7
    }
    case 'max_title':
      return state.currentTitle === 'title_vault_deity'
    default:
      return false
  }
}

function cbPickRandomEvent(): CbEventDef {
  const idx = Math.floor(Math.random() * CB_EVENTS.length)
  return CB_EVENTS[idx]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const useCbStore = create<CbFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      guardians: [] as CbGuardianInstance[],
      chambers: [] as string[],
      materials: [] as { materialId: string; count: number }[],
      structures: [] as CbStructureInstance[],
      abilities: [] as string[],
      achievements: [] as string[],
      relics: [] as string[],
      currentTitle: 'title_lock_novice' as CbTitleId,
      gold: CB_INITIAL_GOLD,
      renown: CB_INITIAL_RENOWN,
      totalRecruited: 0,
      totalForged: 0,
      totalBuilt: 0,
      totalEventsFaced: 0,
      activeEvent: null as CbEventDef | null,
      eventTurnsRemaining: 0,
      activeChamber: null as string | null,

      // ── cbRecruitGuardian ─────────────────────────────────────
      cbRecruitGuardian: (speciesId: string): boolean => {
        const species = cbFindSpecies(speciesId)
        if (!species) return false
        const cost = Math.floor(50 * cbRarityMultiplier(species.rarity))
        const state = get()
        if (state.gold < cost) return false
        const stats = cbCalcStats(species, 1)
        const newGuardian: CbGuardianInstance = {
          id: cbGenerateId(),
          speciesId,
          name: species.name,
          level: 1,
          xp: 0,
          lockpickingPower: stats.lockpickingPower,
          forgingPower: stats.forgingPower,
          vigilance: stats.vigilance,
          morale: 80,
          endurance: 70,
          recruitedAt: Date.now(),
        }
        set((prev) => {
          const updated = {
            guardians: [...prev.guardians, newGuardian],
            gold: prev.gold - cost,
            totalRecruited: prev.totalRecruited + 1,
            renown: prev.renown + cbRarityMultiplier(species.rarity) * 5,
            currentTitle: cbCalcMaxTitle(
              prev.renown + cbRarityMultiplier(species.rarity) * 5,
              prev.guardians.length + 1
            ),
          }
          return updated
        })
        return true
      },

      // ── cbDismissGuardian ────────────────────────────────────
      cbDismissGuardian: (guardianId: string): boolean => {
        const state = get()
        const exists = state.guardians.find((g) => g.id === guardianId)
        if (!exists) return false
        const species = cbFindSpecies(exists.speciesId)
        const refund = species ? Math.floor(25 * cbRarityMultiplier(species.rarity)) : 10
        set((prev) => ({
          guardians: prev.guardians.filter((g) => g.id !== guardianId),
          gold: prev.gold + refund,
          currentTitle: cbCalcMaxTitle(prev.renown, prev.guardians.length - 1),
        }))
        return true
      },

      // ── cbTrainGuardian ──────────────────────────────────────
      cbTrainGuardian: (guardianId: string): boolean => {
        const trainCost = 10
        const state = get()
        if (state.gold < trainCost) return false
        set((prev) => {
          const guardians = prev.guardians.map((g) => {
            if (g.id !== guardianId) return g
            const newXp = g.xp + 20
            const xpNeeded = cbXpForLevel(g.level)
            let newLevel = g.level
            let currentXp = newXp
            if (currentXp >= xpNeeded && g.level < CB_MAX_GUARDIAN_LEVEL) {
              newLevel = g.level + 1
              currentXp = newXp - xpNeeded
            }
            const species = cbFindSpecies(g.speciesId)
            const stats = species ? cbCalcStats(species, newLevel) : { lockpickingPower: g.lockpickingPower, forgingPower: g.forgingPower, vigilance: g.vigilance }
            return {
              ...g,
              level: newLevel,
              xp: currentXp,
              lockpickingPower: stats.lockpickingPower,
              forgingPower: stats.forgingPower,
              vigilance: stats.vigilance,
              morale: Math.min(100, g.morale + 10),
              endurance: Math.min(100, g.endurance + 15),
            }
          })
          return { guardians, gold: prev.gold - trainCost, renown: prev.renown + 2 }
        })
        return true
      },

      // ── cbForgeLock ──────────────────────────────────────────
      cbForgeLock: (guardianId: string): boolean => {
        const state = get()
        const guardian = state.guardians.find((g) => g.id === guardianId)
        if (!guardian) return false
        if (guardian.endurance < 20) return false
        const species = cbFindSpecies(guardian.speciesId)
        if (!species) return false
        const materialId = `mat_${species.discipline}_alloy`
        const existingMaterial = state.materials.find((m) => m.materialId === materialId)
        const amount = Math.ceil(guardian.forgingPower / 10)
        set((prev) => ({
          materials: existingMaterial
            ? prev.materials.map((m) => (m.materialId === materialId ? { ...m, count: m.count + amount } : m))
            : [...prev.materials, { materialId, count: amount }],
          totalForged: prev.totalForged + 1,
          renown: prev.renown + 3,
          guardians: prev.guardians.map((g) =>
            g.id === guardianId ? { ...g, endurance: Math.max(0, g.endurance - 20) } : g
          ),
        }))
        return true
      },

      // ── cbBuildStructure ─────────────────────────────────────
      cbBuildStructure: (structureDefId: string): boolean => {
        const def = cbFindStructureDef(structureDefId)
        if (!def) return false
        const state = get()
        if (state.gold < def.baseCost) return false
        const alreadyBuilt = state.structures.find((s) => s.structureDefId === structureDefId)
        if (alreadyBuilt) return false
        const newStructure: CbStructureInstance = {
          id: cbGenerateId(),
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

      // ── cbUpgradeStructure ───────────────────────────────────
      cbUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structure = state.structures.find((s) => s.id === structureId)
        if (!structure) return false
        if (structure.level >= CB_MAX_STRUCTURE_LEVEL) return false
        const def = cbFindStructureDef(structure.structureDefId)
        if (!def) return false
        const cost = cbCalcStructureUpgradeCost(def, structure.level)
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

      // ── cbSecureChamber ──────────────────────────────────────
      cbSecureChamber: (chamberId: string): CbEventDef | null => {
        const chamber = cbFindChamber(chamberId)
        if (!chamber) return null
        const state = get()
        const requiredTitleIdx = CB_TITLES.findIndex((t) => t.id === chamber.requiredTitle)
        const currentTitleIdx = CB_TITLES.findIndex((t) => t.id === state.currentTitle)
        if (currentTitleIdx < requiredTitleIdx) return null
        const newChambers = state.chambers.includes(chamberId) ? state.chambers : [...state.chambers, chamberId]
        const event = cbPickRandomEvent()
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

      // ── cbCollectRelic ───────────────────────────────────────
      cbCollectRelic: (relicId: string): boolean => {
        const relic = cbFindRelic(relicId)
        if (!relic) return false
        const state = get()
        if (state.relics.includes(relicId)) return false
        set((prev) => ({
          relics: [...prev.relics, relicId],
          renown: prev.renown + Math.floor(cbRarityMultiplier(relic.rarity) * 20),
          currentTitle: cbCalcMaxTitle(
            prev.renown + Math.floor(cbRarityMultiplier(relic.rarity) * 20),
            prev.guardians.length
          ),
        }))
        return true
      },

      // ── cbUnlockAbility ──────────────────────────────────────
      cbUnlockAbility: (abilityId: string): boolean => {
        const ability = cbFindAbility(abilityId)
        if (!ability) return false
        const state = get()
        if (state.abilities.includes(abilityId)) return false
        const cost = Math.floor(100 * cbRarityMultiplier(ability.rarity))
        if (state.gold < cost) return false
        set((prev) => ({
          abilities: [...prev.abilities, abilityId],
          gold: prev.gold - cost,
        }))
        return true
      },

      // ── cbUnlockTitle ────────────────────────────────────────
      cbUnlockTitle: (titleId: CbTitleId): boolean => {
        const title = cbFindTitle(titleId)
        if (!title) return false
        const state = get()
        if (state.renown < title.minRenown) return false
        if (state.guardians.length < title.minGuardians) return false
        set((prev) => ({ currentTitle: titleId }))
        return true
      },

      // ── cbClaimAchievement ───────────────────────────────────
      cbClaimAchievement: (achievementId: string): boolean => {
        const achievement = cbFindAchievement(achievementId)
        if (!achievement) return false
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!cbCheckAchievementCondition(achievement.condition, state)) return false
        set((prev) => ({
          achievements: [...prev.achievements, achievementId],
          gold: prev.gold + achievement.reward.gold,
          renown: prev.renown + achievement.reward.renown,
          currentTitle: cbCalcMaxTitle(
            prev.renown + achievement.reward.renown,
            prev.guardians.length
          ),
        }))
        return true
      },

      // ── cbTradeMaterial ──────────────────────────────────────
      cbTradeMaterial: (materialId: string, count: number): number => {
        const material = cbFindMaterial(materialId)
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

      // ── cbEndEvent ───────────────────────────────────────────
      cbEndEvent: () => {
        set({ activeEvent: null, eventTurnsRemaining: 0 })
      },

      // ── cbResetEvent ─────────────────────────────────────────
      cbResetEvent: () => {
        const event = cbPickRandomEvent()
        set({ activeEvent: event, eventTurnsRemaining: event.durationTurns })
      },
    }),
    {
      name: 'cobalt-vault-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: MAIN HOOK — useCobaltVault()
// ═══════════════════════════════════════════════════════════════════

export default function useCobaltVault() {
  const store = useCbStore()

  // ── Computed: Owned guardians with species info ──────────────
  const cbOwnedGuardians = useMemo(() => {
    return store.guardians.map((g) => {
      const species = cbFindSpecies(g.speciesId)
      return {
        ...g,
        species,
        disciplineColor: species ? cbDisciplineColor(species.discipline) : '#888888',
        rarityColor: species ? cbRarityColor(species.rarity) : '#888888',
      }
    })
  }, [store])

  // ── Computed: Available guardian species to recruit ──────────
  const cbAvailableSpecies = useMemo(() => {
    return CB_GUARDIANS.filter((sp) => {
      const cost = Math.floor(50 * cbRarityMultiplier(sp.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Current title details ──────────────────────────
  const cbCurrentTitleDetail = useMemo(() => {
    return cbFindTitle(store.currentTitle) ?? CB_TITLES[0]
  }, [store])

  // ── Computed: Next title info ────────────────────────────────
  const cbNextTitle = useMemo(() => {
    const currentIdx = CB_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= CB_TITLES.length - 1) return null
    return CB_TITLES[currentIdx + 1]
  }, [store])

  // ── Computed: Active chamber details ─────────────────────────
  const cbActiveChamberDetail = useMemo(() => {
    if (!store.activeChamber) return null
    return cbFindChamber(store.activeChamber) ?? null
  }, [store])

  // ── Computed: Unsecured chambers ─────────────────────────────
  const cbUnsecuredChambers = useMemo(() => {
    return CB_CHAMBERS.filter((c) => !store.chambers.includes(c.id))
  }, [store])

  // ── Computed: Structures with defs ───────────────────────────
  const cbBuiltStructures = useMemo(() => {
    return store.structures.map((s) => {
      const def = cbFindStructureDef(s.structureDefId)
      return { ...s, def }
    })
  }, [store])

  // ── Computed: Unlockable abilities ───────────────────────────
  const cbUnlockableAbilities = useMemo(() => {
    return CB_ABILITIES.filter((a) => {
      if (store.abilities.includes(a.id)) return false
      const cost = Math.floor(100 * cbRarityMultiplier(a.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Owned relics with defs ─────────────────────────
  const cbOwnedRelics = useMemo(() => {
    return store.relics
      .map((rId) => cbFindRelic(rId))
      .filter((r): r is CbRelicDef => r !== null)
  }, [store])

  // ── Computed: Unclaimed achievements ─────────────────────────
  const cbUnclaimedAchievements = useMemo(() => {
    return CB_ACHIEVEMENTS.filter((a) => {
      if (store.achievements.includes(a.id)) return false
      return cbCheckAchievementCondition(a.condition, store)
    })
  }, [store])

  // ── Computed: Inventory materials with defs ──────────────────
  const cbInventoryMaterials = useMemo(() => {
    return store.materials.map((m) => {
      const def = cbFindMaterial(m.materialId)
      return { ...m, def }
    })
  }, [store])

  // ── Computed: Total structure effect ─────────────────────────
  const cbTotalStructureEffect = useMemo(() => {
    let totalEffect = 0
    for (const s of store.structures) {
      const def = cbFindStructureDef(s.structureDefId)
      if (def) {
        totalEffect += def.baseEffect + def.effectPerLevel * (s.level - 1)
      }
    }
    return totalEffect
  }, [store])

  // ── Computed: Average guardian level ─────────────────────────
  const cbAverageGuardianLevel = useMemo(() => {
    if (store.guardians.length === 0) return 0
    const total = store.guardians.reduce((sum, g) => sum + g.level, 0)
    return Math.floor(total / store.guardians.length)
  }, [store])

  // ── Computed: Total guardian power ───────────────────────────
  const cbTotalGuardianPower = useMemo(() => {
    let lockpickingPower = 0
    let forgingPower = 0
    let vigilance = 0
    for (const g of store.guardians) {
      lockpickingPower += g.lockpickingPower
      forgingPower += g.forgingPower
      vigilance += g.vigilance
    }
    return { lockpickingPower, forgingPower, vigilance }
  }, [store])

  // ── Computed: Discipline distribution ────────────────────────
  const cbDisciplineDistribution = useMemo(() => {
    const groups: Record<string, number> = {}
    for (const disc of CB_DISCIPLINES) {
      groups[disc.id] = 0
    }
    for (const g of store.guardians) {
      const sp = cbFindSpecies(g.speciesId)
      if (sp) groups[sp.discipline] = (groups[sp.discipline] || 0) + 1
    }
    return groups
  }, [store])

  // ── Computed: Rarity distribution ────────────────────────────
  const cbRarityDistribution = useMemo(() => {
    const groups: Record<CbRarity, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 }
    for (const g of store.guardians) {
      const sp = cbFindSpecies(g.speciesId)
      if (sp) groups[sp.rarity] += 1
    }
    return groups
  }, [store])

  // ── Computed: Guardians grouped by rarity ────────────────────
  const cbGuardiansByRarity = useMemo(() => {
    const groups: Record<CbRarity, CbGuardianInstance[]> = { common: [], uncommon: [], rare: [], epic: [], legendary: [] }
    for (const g of store.guardians) {
      const sp = cbFindSpecies(g.speciesId)
      if (sp) groups[sp.rarity].push(g)
    }
    return groups
  }, [store])

  // ── Computed: Guardians grouped by discipline ────────────────
  const cbGuardiansByDiscipline = useMemo(() => {
    const groups: Record<string, CbGuardianInstance[]> = {}
    for (const disc of CB_DISCIPLINES) {
      groups[disc.id] = []
    }
    for (const g of store.guardians) {
      const sp = cbFindSpecies(g.speciesId)
      if (sp) groups[sp.discipline].push(g)
    }
    return groups
  }, [store])

  // ── Computed: Title progress ─────────────────────────────────
  const cbTitleProgress = useMemo(() => {
    const currentIdx = CB_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= CB_TITLES.length - 1) {
      return { percent: 100, renownNeeded: 0, guardiansNeeded: 0 }
    }
    const next = CB_TITLES[currentIdx + 1]
    const renownProgress = Math.min(100, (store.renown / next.minRenown) * 100)
    const guardianProgress = Math.min(100, (store.guardians.length / next.minGuardians) * 100)
    return {
      percent: Math.floor((renownProgress + guardianProgress) / 2),
      renownNeeded: Math.max(0, next.minRenown - store.renown),
      guardiansNeeded: Math.max(0, next.minGuardians - store.guardians.length),
    }
  }, [store])

  // ── Computed: Rare materials count ───────────────────────────
  const cbRareMaterialCount = useMemo(() => {
    let count = 0
    for (const m of store.materials) {
      const def = cbFindMaterial(m.materialId)
      if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
        count += m.count
      }
    }
    return count
  }, [store])

  // ── Computed: Exhausted guardians ────────────────────────────
  const cbExhaustedGuardians = useMemo(() => {
    return store.guardians.filter((g) => g.endurance < 30)
  }, [store])

  // ── Computed: Low morale guardians ───────────────────────────
  const cbLowMoraleGuardians = useMemo(() => {
    return store.guardians.filter((g) => g.morale < 30)
  }, [store])

  // ── Computed: Total relic boost ──────────────────────────────
  const cbTotalRelicBoost = useMemo(() => {
    let lockBoost = 0
    let forgeBoost = 0
    let vigilanceBoost = 0
    for (const rId of store.relics) {
      const relic = cbFindRelic(rId)
      if (relic) {
        lockBoost += relic.lockBoost
        forgeBoost += relic.forgeBoost
        vigilanceBoost += relic.vigilanceBoost
      }
    }
    return { lockBoost, forgeBoost, vigilanceBoost }
  }, [store])

  // ═════════════════════════════════════════════════════════════
  // Return cbAPI object
  // ═════════════════════════════════════════════════════════════

  const cbAPI = {
    // ── Direct constants ──────────────────────────────────────
    CB_COBALT_BLUE,
    CB_VAULT_GOLD,
    CB_STEEL_GRAY,
    CB_LOCK_SILVER,
    CB_FORGE_ORANGE,
    CB_CRYSTAL_CYAN,
    CB_SHADOW_BLACK,
    CB_SAFE_GREEN,
    CB_DISCIPLINES,
    CB_RARITIES,
    CB_GUARDIANS,
    CB_CHAMBERS,
    CB_MATERIALS,
    CB_STRUCTURES,
    CB_ABILITIES,
    CB_ACHIEVEMENTS,
    CB_TITLES,
    CB_RELICS,
    CB_EVENTS,
    cbCheckSynergy,

    // ── Store state ───────────────────────────────────────────
    guardians: store.guardians,
    chambers: store.chambers,
    materials: store.materials,
    structures: store.structures,
    abilities: store.abilities,
    achievements: store.achievements,
    relics: store.relics,
    currentTitle: store.currentTitle,
    gold: store.gold,
    renown: store.renown,
    totalRecruited: store.totalRecruited,
    totalForged: store.totalForged,
    totalBuilt: store.totalBuilt,
    totalEventsFaced: store.totalEventsFaced,
    activeEvent: store.activeEvent,
    eventTurnsRemaining: store.eventTurnsRemaining,
    activeChamber: store.activeChamber,

    // ── Store actions ─────────────────────────────────────────
    cbRecruitGuardian: store.cbRecruitGuardian,
    cbDismissGuardian: store.cbDismissGuardian,
    cbTrainGuardian: store.cbTrainGuardian,
    cbForgeLock: store.cbForgeLock,
    cbBuildStructure: store.cbBuildStructure,
    cbUpgradeStructure: store.cbUpgradeStructure,
    cbSecureChamber: store.cbSecureChamber,
    cbCollectRelic: store.cbCollectRelic,
    cbUnlockAbility: store.cbUnlockAbility,
    cbUnlockTitle: store.cbUnlockTitle,
    cbClaimAchievement: store.cbClaimAchievement,
    cbTradeMaterial: store.cbTradeMaterial,
    cbEndEvent: store.cbEndEvent,
    cbResetEvent: store.cbResetEvent,

    // ── Computed getters ──────────────────────────────────────
    cbOwnedGuardians,
    cbAvailableSpecies,
    cbCurrentTitleDetail,
    cbNextTitle,
    cbActiveChamberDetail,
    cbUnsecuredChambers,
    cbBuiltStructures,
    cbUnlockableAbilities,
    cbOwnedRelics,
    cbUnclaimedAchievements,
    cbInventoryMaterials,
    cbTotalStructureEffect,
    cbAverageGuardianLevel,
    cbTotalGuardianPower,
    cbDisciplineDistribution,
    cbRarityDistribution,
    cbGuardiansByRarity,
    cbGuardiansByDiscipline,
    cbTitleProgress,
    cbRareMaterialCount,
    cbExhaustedGuardians,
    cbLowMoraleGuardians,
    cbTotalRelicBoost,
  }

  return cbAPI
}
