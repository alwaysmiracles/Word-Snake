// ============================================================================
// Ghost Hospital Wire — Word Snake Game
// SSR-safe ghost hospital management module
// No localStorage / window / document / setInterval / addEventListener / Math.random
// ============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';

// ============================================================================
// § 1  Seeded PRNG (mulberry32)
// ============================================================================

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = ((s >>> 0) * 0x2545f491) | 0;
    t = ((t ^ (t >>> 16)) * 0x1a2b3c5d) | 0;
    t = (t ^ (t >>> 16)) >>> 0;
    return t / 0xffffffff;
  };
}

function ghSeededInt(rng: () => number, min: number, max: number): number {
  return min + ((rng() * ((max - min) + 1)) | 0);
}

// ============================================================================
// § 2  Type Definitions
// ============================================================================

export type GhostElement =
  | 'shadow'
  | 'frost'
  | 'fire'
  | 'void'
  | 'crystal'
  | 'dream'
  | 'nature'
  | 'light'
  | 'blood'
  | 'storm';

export type GhostSeverity = 'minor' | 'moderate' | 'severe' | 'critical';
export type GhostMood = 'terrified' | 'anxious' | 'neutral' | 'calm' | 'serene';
export type WardStatus = 'locked' | 'unlocked' | 'active' | 'full';

export interface GhostPatientDef {
  id: string;
  name: string;
  element: GhostElement;
  baseHealth: number;
  description: string;
  ailments: string[];
  wardPreference: string;
  coinsReward: number;
  xpReward: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface WardDef {
  id: string;
  name: string;
  description: string;
  capacity: number;
  unlockLevel: number;
  unlockCost: number;
  allowedElements: GhostElement[];
  moodBonus: number;
  healMultiplier: number;
}

export interface TreatmentDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  healAmount: number;
  xpReward: number;
  cooldown: number;
  targetAilments: string[];
  requiredTool: string | null;
  requiredLevel: number;
  moodChange: number;
}

export interface DoctorDef {
  id: string;
  name: string;
  title: string;
  specialty: GhostElement[];
  hireCost: number;
  salaryPerDay: number;
  healBonus: number;
  moodBonus: number;
  maxPatients: number;
  requiredLevel: number;
  description: string;
}

export interface ToolDef {
  id: string;
  name: string;
  description: string;
  baseAccuracy: number;
  upgradeCosts: number[];
  maxLevel: number;
  effect: string;
}

export interface QuestDef {
  id: string;
  name: string;
  description: string;
  type: 'heal' | 'admit' | 'treat' | 'earn' | 'upgrade' | 'hire' | 'quest';
  target: number;
  coinReward: number;
  xpReward: number;
  requiredLevel: number;
}

export interface NPCDef {
  id: string;
  name: string;
  role: string;
  description: string;
  questGiver: boolean;
  shopItems: string[];
  reputationRewards: { threshold: number; reward: string }[];
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  checkFn: string;
  coinReward: number;
  xpReward: number;
}

export interface TitleDef {
  name: string;
  level: number;
  perks: string[];
}

export interface DailyTaskDef {
  id: string;
  name: string;
  description: string;
  target: number;
  coinReward: number;
  xpReward: number;
}

export interface AdmittedPatient {
  instanceId: string;
  patientDefId: string;
  health: number;
  maxHealth: number;
  mood: number;
  moodLabel: GhostMood;
  severity: GhostSeverity;
  wardId: string;
  admittedAt: number;
  doctorId: string | null;
  ailments: string[];
  element: GhostElement;
  treatmentsApplied: string[];
  isCursed: boolean;
}

export interface HiredDoctor {
  doctorId: string;
  hiredAt: number;
  patientsTreated: number;
  daysWorked: number;
  morale: number;
}

export interface ActiveQuest {
  questId: string;
  acceptedAt: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface TreatmentRecord {
  timestamp: number;
  patientInstanceId: string;
  treatmentId: string;
  healAmount: number;
  doctorId: string | null;
  success: boolean;
}

export interface HospitalStats {
  totalPatientsHealed: number;
  totalPatientsAdmitted: number;
  totalTreatmentsApplied: number;
  totalSurgeriesPerformed: number;
  totalSoulsRestored: number;
  totalCursedTreated: number;
  totalQuestsCompleted: number;
  totalDailyTasksCompleted: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  hospitalRating: number;
  currentStreak: number;
  bestStreak: number;
}

export interface GhostHospitalState {
  initialized: boolean;
  seed: number;
  level: number;
  xp: number;
  coins: number;
  admittedPatients: AdmittedPatient[];
  hiredDoctors: HiredDoctor[];
  unlockedWards: string[];
  toolLevels: Record<string, number>;
  activeQuests: ActiveQuest[];
  unlockedAchievements: string[];
  treatmentHistory: TreatmentRecord[];
  dailyTaskDate: number;
  dailyTaskProgress: number;
  dailyTaskCompleted: boolean;
  dailyTaskClaimed: boolean;
  npcReputation: Record<string, number>;
  stats: HospitalStats;
  instanceCounter: number;
  questCounter: number;
}

export interface GhostHospitalActions {
  ghGetState: () => GhostHospitalState;
  ghResetState: () => void;
  ghGetLevel: () => number;
  ghGetTitle: () => TitleDef;
  ghGetProgress: () => { level: number; xp: number; xpToNext: number; percent: number };
  ghAddXP: (amount: number) => number[];
  ghGetXPToNext: (level?: number) => number;
  ghGetTotalXP: () => number;
  ghGetCoins: () => number;
  ghAddCoins: (amount: number) => void;
  ghSpendCoins: (amount: number) => boolean;
  ghGetTotalCoinsEarned: () => number;
  ghGetPatients: () => GhostPatientDef[];
  ghAdmitPatient: (patientDefId?: string) => AdmittedPatient | null;
  ghDischargePatient: (instanceId: string) => boolean;
  ghGetAdmittedPatients: () => AdmittedPatient[];
  ghGetPatientInfo: (instanceId: string) => AdmittedPatient | undefined;
  ghSetPatientMood: (instanceId: string, mood: number) => boolean;
  ghGetWards: () => WardDef[];
  ghUnlockWard: (wardId: string) => boolean;
  ghGetWardCapacity: (wardId: string) => number;
  ghGetWardPatients: (wardId: string) => AdmittedPatient[];
  ghGetTreatments: () => TreatmentDef[];
  ghTreatPatient: (instanceId: string, treatmentId: string) => TreatmentRecord | null;
  ghGetTreatmentHistory: () => TreatmentRecord[];
  ghGetBestTreatment: (ailments: string[]) => TreatmentDef | null;
  ghGetDoctors: () => DoctorDef[];
  ghHireDoctor: (doctorId: string) => boolean;
  ghGetDoctorInfo: (doctorId: string) => DoctorDef | undefined;
  ghGetHiredDoctors: () => HiredDoctor[];
  ghGetTools: () => ToolDef[];
  ghUpgradeTool: (toolId: string) => boolean;
  ghGetToolLevel: (toolId: string) => number;
  ghGetToolEffectiveness: (toolId: string) => number;
  ghGetQuests: () => QuestDef[];
  ghAcceptQuest: (questId: string) => boolean;
  ghCompleteQuest: (questId: string) => boolean;
  ghClaimQuestReward: (questId: string) => boolean;
  ghGetActiveQuests: () => ActiveQuest[];
  ghGetAchievements: () => AchievementDef[];
  ghCheckAchievements: () => string[];
  ghUnlockAchievement: (achievementId: string) => boolean;
  ghGetDailyTask: () => DailyTaskDef | null;
  ghCompleteDailyTask: () => boolean;
  ghClaimDailyReward: () => boolean;
  ghGetNPCs: () => NPCDef[];
  ghIncreaseReputation: (npcId: string, amount: number) => number;
  ghGetReputation: (npcId: string) => number;
  ghGetStats: () => HospitalStats;
  ghGetHealRate: () => number;
  ghGetHospitalRating: () => number;
  ghDiagnosePatient: (instanceId: string) => { ailments: string[]; severity: GhostSeverity; recommended: string };
  ghGetRecommendedTreatment: (instanceId: string) => TreatmentDef | null;
  ghSimulateDay: () => { healed: number; earned: number; events: string[] };
  ghGetHospitalSummary: () => { patients: number; doctors: number; wards: number; coins: number; rating: number };
  ghGetUpgradeCost: (toolId: string) => number;
  ghCanAfford: (amount: number) => boolean;
  ghGetRandomInt: (min: number, max: number) => number;
  ghGetRNG: () => () => number;
  ghAdvanceInstanceCounter: () => number;
}

// ============================================================================
// § 3  Constants
// ============================================================================

export const GH_MAX_LEVEL = 50;

export const GH_PATIENTS: GhostPatientDef[] = [
  {
    id: 'poltergeist',
    name: 'Poltergeist',
    element: 'shadow',
    baseHealth: 60,
    description: 'A mischievous spirit that causes disturbances by moving objects.',
    ailments: ['unrest', 'attachment', 'chaos'],
    wardPreference: 'spirit_ward',
    coinsReward: 30,
    xpReward: 15,
    rarity: 'common',
  },
  {
    id: 'banshee',
    name: 'Banshee',
    element: 'storm',
    baseHealth: 80,
    description: 'A wailing spirit whose cries shatter windows and nerves alike.',
    ailments: ['vocal_damage', 'grief', 'scream_tether'],
    wardPreference: 'soul_therapy',
    coinsReward: 55,
    xpReward: 25,
    rarity: 'uncommon',
  },
  {
    id: 'wraith',
    name: 'Wraith',
    element: 'void',
    baseHealth: 100,
    description: 'A dark, spectral entity drained of life force, seeking warmth.',
    ailments: ['life_drain', 'cold_core', 'hollow'],
    wardPreference: 'shadow_wing',
    coinsReward: 70,
    xpReward: 35,
    rarity: 'rare',
  },
  {
    id: 'shadow_wisp',
    name: 'Shadow Wisp',
    element: 'shadow',
    baseHealth: 40,
    description: 'A small flickering shadow fragment, easily frightened.',
    ailments: ['fragility', 'fear', 'dispersal'],
    wardPreference: 'light_recovery',
    coinsReward: 20,
    xpReward: 10,
    rarity: 'common',
  },
  {
    id: 'phantom_child',
    name: 'Phantom Child',
    element: 'dream',
    baseHealth: 50,
    description: 'A playful child ghost searching for lost toys and friends.',
    ailments: ['loneliness', 'toy_attachment', 'dream_loop'],
    wardPreference: 'dream_ward',
    coinsReward: 35,
    xpReward: 18,
    rarity: 'common',
  },
  {
    id: 'spectral_elder',
    name: 'Spectral Elder',
    element: 'light',
    baseHealth: 90,
    description: 'A wise but weary old spirit, slowly fading from memory.',
    ailments: ['memory_fade', 'weakness', 'detachment'],
    wardPreference: 'spirit_ward',
    coinsReward: 60,
    xpReward: 30,
    rarity: 'uncommon',
  },
  {
    id: 'ghostly_cat',
    name: 'Ghostly Cat',
    element: 'nature',
    baseHealth: 45,
    description: 'A spectral feline that haunts moonlit corridors.',
    ailments: ['nine_lives_overflow', 'fur_displacement', 'restlessness'],
    wardPreference: 'ecto_ward',
    coinsReward: 25,
    xpReward: 12,
    rarity: 'common',
  },
  {
    id: 'haunted_knight',
    name: 'Haunted Knight',
    element: 'shadow',
    baseHealth: 120,
    description: 'An armored phantom trapped in an endless battlefield loop.',
    ailments: ['battle_tether', 'armor_rust', 'trauma_loop'],
    wardPreference: 'shadow_wing',
    coinsReward: 80,
    xpReward: 40,
    rarity: 'rare',
  },
  {
    id: 'weeping_lady',
    name: 'Weeping Lady',
    element: 'frost',
    baseHealth: 75,
    description: 'A sorrowful apparition whose tears freeze everything they touch.',
    ailments: ['eternal_grief', 'frost_heart', 'tear_overflow'],
    wardPreference: 'soul_therapy',
    coinsReward: 50,
    xpReward: 25,
    rarity: 'uncommon',
  },
  {
    id: 'floating_skull',
    name: 'Floating Skull',
    element: 'blood',
    baseHealth: 55,
    description: 'A disembodied skull that chatters endlessly about forgotten lore.',
    ailments: ['jaw_dislocation', 'memory_overflow', 'chatter_curse'],
    wardPreference: 'ecto_ward',
    coinsReward: 40,
    xpReward: 20,
    rarity: 'uncommon',
  },
  {
    id: 'bone_collector',
    name: 'Bone Collector',
    element: 'blood',
    baseHealth: 95,
    description: 'A skeletal spirit obsessed with assembling a perfect skeleton.',
    ailments: ['obsession', 'bone_fever', 'assembly_error'],
    wardPreference: 'phantom_icu',
    coinsReward: 65,
    xpReward: 32,
    rarity: 'rare',
  },
  {
    id: 'spirit_fox',
    name: 'Spirit Fox',
    element: 'nature',
    baseHealth: 70,
    description: 'A cunning fox spirit with nine spectral tails.',
    ailments: ['tail_imbalance', 'mischief_curse', 'transformation_stuck'],
    wardPreference: 'dream_ward',
    coinsReward: 55,
    xpReward: 28,
    rarity: 'uncommon',
  },
  {
    id: 'mist_walker',
    name: 'Mist Walker',
    element: 'frost',
    baseHealth: 65,
    description: 'A formless entity that drifts through fog, losing itself.',
    ailments: ['form_dissolution', 'fog_dependency', 'identity_loss'],
    wardPreference: 'light_recovery',
    coinsReward: 45,
    xpReward: 22,
    rarity: 'uncommon',
  },
  {
    id: 'ghoul',
    name: 'Ghoul',
    element: 'blood',
    baseHealth: 85,
    description: 'A ravenous spirit plagued by an insatiable hunger.',
    ailments: ['hunger_curse', 'stomach_void', 'craving_loop'],
    wardPreference: 'phantom_icu',
    coinsReward: 55,
    xpReward: 27,
    rarity: 'uncommon',
  },
  {
    id: 'revenant',
    name: 'Revenant',
    element: 'void',
    baseHealth: 130,
    description: 'A powerful spirit returned to settle an ancient score.',
    ailments: ['vengeance_tether', 'rage_overflow', 'soul_leak'],
    wardPreference: 'shadow_wing',
    coinsReward: 90,
    xpReward: 45,
    rarity: 'legendary',
  },
  {
    id: 'will_o_wisp',
    name: 'Will-o-Wisp',
    element: 'fire',
    baseHealth: 35,
    description: 'A tiny flame spirit that leads the lost astray.',
    ailments: ['flicker_weakness', 'attraction_curse', 'wanderlust'],
    wardPreference: 'light_recovery',
    coinsReward: 30,
    xpReward: 15,
    rarity: 'common',
  },
  {
    id: 'apparition',
    name: 'Apparition',
    element: 'light',
    baseHealth: 50,
    description: 'A brief glimpse of a spirit not yet fully formed.',
    ailments: ['incomplete_form', 'flickering', 'uncertainty'],
    wardPreference: 'spirit_ward',
    coinsReward: 25,
    xpReward: 12,
    rarity: 'common',
  },
  {
    id: 'phantasm',
    name: 'Phantasm',
    element: 'dream',
    baseHealth: 110,
    description: 'A nightmarish illusion spirit that blurs reality.',
    ailments: ['reality_warp', 'nightmare_loop', 'perception_error'],
    wardPreference: 'dream_ward',
    coinsReward: 75,
    xpReward: 38,
    rarity: 'rare',
  },
  {
    id: 'siren_ghost',
    name: 'Siren Ghost',
    element: 'storm',
    baseHealth: 90,
    description: 'A haunting melody spirit that lures others to the deep.',
    ailments: ['song_tether', 'voice_crack', 'oceanic_grief'],
    wardPreference: 'soul_therapy',
    coinsReward: 65,
    xpReward: 32,
    rarity: 'rare',
  },
  {
    id: 'hollow_spirit',
    name: 'Hollow Spirit',
    element: 'void',
    baseHealth: 80,
    description: 'An empty vessel spirit desperately seeking its lost essence.',
    ailments: ['essence_loss', 'hollow_core', 'identity_void'],
    wardPreference: 'phantom_icu',
    coinsReward: 60,
    xpReward: 30,
    rarity: 'uncommon',
  },
  {
    id: 'crystal_ghost',
    name: 'Crystal Ghost',
    element: 'crystal',
    baseHealth: 100,
    description: 'A prismatic spirit whose facets refract ghostly light.',
    ailments: ['refraction_error', 'facet_cracks', 'prism_instability'],
    wardPreference: 'ecto_ward',
    coinsReward: 70,
    xpReward: 35,
    rarity: 'rare',
  },
  {
    id: 'ember_specter',
    name: 'Ember Specter',
    element: 'fire',
    baseHealth: 75,
    description: 'A smoldering ghost that threatens to ignite its surroundings.',
    ailments: ['overheating', 'ember_leak', 'combustion_risk'],
    wardPreference: 'phantom_icu',
    coinsReward: 50,
    xpReward: 25,
    rarity: 'uncommon',
  },
  {
    id: 'frost_wraith',
    name: 'Frost Wraith',
    element: 'frost',
    baseHealth: 115,
    description: 'A frozen wraith encased in spectral ice armor.',
    ailments: ['frost_lock', 'ice_crystals', 'thermal_imbalance'],
    wardPreference: 'shadow_wing',
    coinsReward: 80,
    xpReward: 40,
    rarity: 'rare',
  },
  {
    id: 'void_phantom',
    name: 'Void Phantom',
    element: 'void',
    baseHealth: 140,
    description: 'An enigmatic entity from beyond the veil of existence.',
    ailments: ['dimensional_tear', 'void_leak', 'existential_crisis'],
    wardPreference: 'quarantine_ward',
    coinsReward: 100,
    xpReward: 50,
    rarity: 'legendary',
  },
  {
    id: 'dream_eater',
    name: 'Dream Eater',
    element: 'dream',
    baseHealth: 95,
    description: 'A spectral predator that feeds on the dreams of the living.',
    ailments: ['overindulgence', 'nightmare_indigestion', 'hunger_cycle'],
    wardPreference: 'dream_ward',
    coinsReward: 65,
    xpReward: 33,
    rarity: 'rare',
  },
  {
    id: 'echo_spirit',
    name: 'Echo Spirit',
    element: 'storm',
    baseHealth: 55,
    description: 'A spirit trapped in an endless loop of repeating sounds.',
    ailments: ['echo_loop', 'volume_control', 'repetition_curse'],
    wardPreference: 'soul_therapy',
    coinsReward: 35,
    xpReward: 18,
    rarity: 'common',
  },
  {
    id: 'grave_bloom',
    name: 'Grave Bloom',
    element: 'nature',
    baseHealth: 60,
    description: 'A flower spirit born from grief at a forgotten gravesite.',
    ailments: ['root_decay', 'wilt_curse', 'soil_hunger'],
    wardPreference: 'light_recovery',
    coinsReward: 40,
    xpReward: 20,
    rarity: 'common',
  },
];

export const GH_WARDS: WardDef[] = [
  {
    id: 'spirit_ward',
    name: 'Spirit Ward',
    description: 'General recovery ward for common ghost ailments.',
    capacity: 5,
    unlockLevel: 1,
    unlockCost: 0,
    allowedElements: ['shadow', 'light', 'dream'],
    moodBonus: 5,
    healMultiplier: 1.0,
  },
  {
    id: 'phantom_icu',
    name: 'Phantom ICU',
    description: 'Intensive care for critically damaged spirits.',
    capacity: 3,
    unlockLevel: 3,
    unlockCost: 200,
    allowedElements: ['blood', 'void', 'fire'],
    moodBonus: -5,
    healMultiplier: 1.5,
  },
  {
    id: 'ecto_ward',
    name: 'Ectoplasm Ward',
    description: 'Specialized ward for ectoplasm and form disorders.',
    capacity: 4,
    unlockLevel: 5,
    unlockCost: 350,
    allowedElements: ['crystal', 'nature', 'shadow'],
    moodBonus: 3,
    healMultiplier: 1.2,
  },
  {
    id: 'soul_therapy',
    name: 'Soul Therapy',
    description: 'Mental health ward for traumatized spirits.',
    capacity: 4,
    unlockLevel: 8,
    unlockCost: 500,
    allowedElements: ['storm', 'dream', 'light'],
    moodBonus: 10,
    healMultiplier: 0.8,
  },
  {
    id: 'shadow_wing',
    name: 'Shadow Wing',
    description: 'High-security wing for dark and dangerous spirits.',
    capacity: 3,
    unlockLevel: 12,
    unlockCost: 800,
    allowedElements: ['shadow', 'void', 'blood'],
    moodBonus: -10,
    healMultiplier: 1.3,
  },
  {
    id: 'light_recovery',
    name: 'Light Recovery',
    description: 'A bright, comforting ward that accelerates natural healing.',
    capacity: 6,
    unlockLevel: 15,
    unlockCost: 1000,
    allowedElements: ['light', 'frost', 'nature'],
    moodBonus: 15,
    healMultiplier: 1.1,
  },
  {
    id: 'dream_ward',
    name: 'Dream Ward',
    description: 'A surreal ward where sleep disorders are treated with dreamscapes.',
    capacity: 4,
    unlockLevel: 20,
    unlockCost: 1500,
    allowedElements: ['dream', 'storm', 'void'],
    moodBonus: 8,
    healMultiplier: 1.0,
  },
  {
    id: 'quarantine_ward',
    name: 'Quarantine Ward',
    description: 'Isolation ward for volatile or contagious spectral conditions.',
    capacity: 2,
    unlockLevel: 25,
    unlockCost: 2500,
    allowedElements: ['void', 'fire', 'blood', 'storm'],
    moodBonus: -20,
    healMultiplier: 2.0,
  },
];

export const GH_TREATMENTS: TreatmentDef[] = [
  {
    id: 'ectoplasm_drain',
    name: 'Ectoplasm Drain',
    description: 'Removes excess or corrupted ectoplasm from the patient.',
    cost: 15,
    healAmount: 20,
    xpReward: 10,
    cooldown: 0,
    targetAilments: ['fur_displacement', 'ectoplasm_overflow', 'form_dissolution'],
    requiredTool: null,
    requiredLevel: 1,
    moodChange: -5,
  },
  {
    id: 'soul_mend',
    name: 'Soul Mend',
    description: 'Mends tears and fractures in the spiritual essence.',
    cost: 25,
    healAmount: 35,
    xpReward: 18,
    cooldown: 1,
    targetAilments: ['soul_leak', 'essence_loss', 'hollow_core', 'identity_void'],
    requiredTool: 'soul_probe',
    requiredLevel: 3,
    moodChange: 5,
  },
  {
    id: 'spirit_suture',
    name: 'Spirit Suture',
    description: 'Surgical stitching for spectral form damage.',
    cost: 40,
    healAmount: 50,
    xpReward: 25,
    cooldown: 2,
    targetAilments: ['form_dissolution', 'facet_cracks', 'incomplete_form'],
    requiredTool: 'ectoplasm_scanner',
    requiredLevel: 5,
    moodChange: -10,
  },
  {
    id: 'ghostly_physiotherapy',
    name: 'Ghostly Physiotherapy',
    description: 'Exercises to strengthen the spectral form.',
    cost: 10,
    healAmount: 15,
    xpReward: 8,
    cooldown: 0,
    targetAilments: ['weakness', 'fragility', 'dispersal'],
    requiredTool: null,
    requiredLevel: 1,
    moodChange: 3,
  },
  {
    id: 'aura_cleansing',
    name: 'Aura Cleansing',
    description: 'Purifies corrupted spiritual energy surrounding the patient.',
    cost: 30,
    healAmount: 30,
    xpReward: 15,
    cooldown: 1,
    targetAilments: ['chaos', 'rage_overflow', 'reality_warp'],
    requiredTool: 'aura_reader',
    requiredLevel: 4,
    moodChange: 10,
  },
  {
    id: 'memory_restoration',
    name: 'Memory Restoration',
    description: 'Recovers lost or fragmented ghost memories.',
    cost: 35,
    healAmount: 25,
    xpReward: 20,
    cooldown: 2,
    targetAilments: ['memory_fade', 'memory_overflow', 'identity_loss'],
    requiredTool: 'soul_probe',
    requiredLevel: 6,
    moodChange: 15,
  },
  {
    id: 'ethereal_surgery',
    name: 'Ethereal Surgery',
    description: 'Advanced spectral surgery for complex spiritual wounds.',
    cost: 60,
    healAmount: 70,
    xpReward: 35,
    cooldown: 3,
    targetAilments: ['dimensional_tear', 'soul_leak', 'refraction_error'],
    requiredTool: 'spectrometer',
    requiredLevel: 10,
    moodChange: -15,
  },
  {
    id: 'phantom_therapy',
    name: 'Phantom Therapy',
    description: 'Talk therapy adapted for spirits with trauma.',
    cost: 20,
    healAmount: 15,
    xpReward: 12,
    cooldown: 0,
    targetAilments: ['grief', 'eternal_grief', 'loneliness', 'trauma_loop'],
    requiredTool: null,
    requiredLevel: 2,
    moodChange: 20,
  },
  {
    id: 'haunt_detoxification',
    name: 'Haunt Detoxification',
    description: 'Breaks the spiritual addiction to haunting locations.',
    cost: 30,
    healAmount: 25,
    xpReward: 15,
    cooldown: 1,
    targetAilments: ['attachment', 'attraction_curse', 'tether'],
    requiredTool: 'haunt_detector',
    requiredLevel: 4,
    moodChange: -8,
  },
  {
    id: 'spectral_repair',
    name: 'Spectral Repair',
    description: 'General-purpose repair for spectral form damage.',
    cost: 20,
    healAmount: 25,
    xpReward: 12,
    cooldown: 0,
    targetAilments: ['flickering', 'flicker_weakness', 'uncertainty'],
    requiredTool: 'ectoplasm_scanner',
    requiredLevel: 2,
    moodChange: 5,
  },
  {
    id: 'curse_removal',
    name: 'Curse Removal',
    description: 'Lifts dark curses afflicting the ghost.',
    cost: 50,
    healAmount: 40,
    xpReward: 25,
    cooldown: 2,
    targetAilments: ['chatter_curse', 'mischief_curse', 'repetition_curse', 'wilt_curse', 'hunger_curse'],
    requiredTool: 'aura_reader',
    requiredLevel: 7,
    moodChange: 15,
  },
  {
    id: 'soul_binding',
    name: 'Soul Binding',
    description: 'Rebinds a fraying soul to its host spirit.',
    cost: 55,
    healAmount: 45,
    xpReward: 28,
    cooldown: 2,
    targetAilments: ['soul_leak', 'hollow_core', 'identity_void', 'essence_loss'],
    requiredTool: 'soul_probe',
    requiredLevel: 8,
    moodChange: 10,
  },
  {
    id: 'dimensional_stabilization',
    name: 'Dimensional Stabilization',
    description: 'Anchors a ghost firmly in the current plane of existence.',
    cost: 70,
    healAmount: 60,
    xpReward: 35,
    cooldown: 3,
    targetAilments: ['dimensional_tear', 'void_leak', 'reality_warp', 'existential_crisis'],
    requiredTool: 'dimensional_radar',
    requiredLevel: 12,
    moodChange: 5,
  },
  {
    id: 'shadow_extraction',
    name: 'Shadow Extraction',
    description: 'Removes embedded shadow entities from within a host spirit.',
    cost: 45,
    healAmount: 35,
    xpReward: 22,
    cooldown: 2,
    targetAilments: ['shadow_infestation', 'dark_taint', 'void_leak'],
    requiredTool: 'haunt_detector',
    requiredLevel: 9,
    moodChange: -5,
  },
  {
    id: 'light_infusion',
    name: 'Light Infusion',
    description: 'Channels pure spectral light into weakened spirits.',
    cost: 25,
    healAmount: 30,
    xpReward: 15,
    cooldown: 0,
    targetAilments: ['cold_core', 'frost_heart', 'weakness', 'fragility'],
    requiredTool: 'aura_reader',
    requiredLevel: 3,
    moodChange: 12,
  },
  {
    id: 'dream_weaving',
    name: 'Dream Weaving',
    description: 'Restructures damaged dreamscapes within a sleeping spirit.',
    cost: 35,
    healAmount: 30,
    xpReward: 18,
    cooldown: 1,
    targetAilments: ['dream_loop', 'nightmare_loop', 'nightmare_indigestion', 'overindulgence'],
    requiredTool: 'ghost_frequency_analyzer',
    requiredLevel: 6,
    moodChange: 8,
  },
  {
    id: 'ecto_transfusion',
    name: 'Ecto Transfusion',
    description: 'Transfers healthy ectoplasm to a depleted ghost.',
    cost: 40,
    healAmount: 45,
    xpReward: 22,
    cooldown: 2,
    targetAilments: ['life_drain', 'hunger_cycle', 'stomach_void'],
    requiredTool: 'ectoplasm_scanner',
    requiredLevel: 5,
    moodChange: 5,
  },
  {
    id: 'banshee_voice_therapy',
    name: 'Banshee Voice Therapy',
    description: 'Specialized vocal cord therapy for wailing spirits.',
    cost: 30,
    healAmount: 30,
    xpReward: 16,
    cooldown: 1,
    targetAilments: ['vocal_damage', 'voice_crack', 'scream_tether', 'echo_loop', 'volume_control'],
    requiredTool: 'ghost_frequency_analyzer',
    requiredLevel: 4,
    moodChange: 10,
  },
  {
    id: 'wraith_dematerialization',
    name: 'Wraith Dematerialization',
    description: 'Temporarily dissolves and reforms a corrupted wraith body.',
    cost: 65,
    healAmount: 55,
    xpReward: 30,
    cooldown: 3,
    targetAilments: ['battle_tether', 'vengeance_tether', 'armor_rust'],
    requiredTool: 'spectrometer',
    requiredLevel: 11,
    moodChange: -10,
  },
  {
    id: 'full_spirit_reconstitution',
    name: 'Full Spirit Reconstitution',
    description: 'The ultimate treatment — fully rebuilds a shattered spirit.',
    cost: 100,
    healAmount: 100,
    xpReward: 50,
    cooldown: 5,
    targetAilments: ['dimensional_tear', 'existential_crisis', 'void_leak'],
    requiredTool: 'dimensional_radar',
    requiredLevel: 15,
    moodChange: 20,
  },
];

export const GH_DOCTORS: DoctorDef[] = [
  {
    id: 'dr_mortis_bones',
    name: 'Dr. Mortis Bones',
    title: 'General Practitioner',
    specialty: ['shadow', 'blood'],
    hireCost: 100,
    salaryPerDay: 10,
    healBonus: 5,
    moodBonus: 0,
    maxPatients: 3,
    requiredLevel: 1,
    description: 'A skeletal physician with centuries of general practice experience.',
  },
  {
    id: 'dr_ethel_spectra',
    name: 'Dr. Ethel Spectra',
    title: 'Ectoplasm Specialist',
    specialty: ['crystal', 'shadow'],
    hireCost: 200,
    salaryPerDay: 20,
    healBonus: 10,
    moodBonus: 2,
    maxPatients: 3,
    requiredLevel: 3,
    description: 'An elegant spirit who can read ectoplasm like an open book.',
  },
  {
    id: 'dr_cyrus_fog',
    name: 'Dr. Cyrus Fog',
    title: 'Phantom Surgeon',
    specialty: ['blood', 'void'],
    hireCost: 350,
    salaryPerDay: 30,
    healBonus: 15,
    moodBonus: -5,
    maxPatients: 2,
    requiredLevel: 5,
    description: 'A meticulous surgeon who operates through spectral fog.',
  },
  {
    id: 'dr_luna_wraith',
    name: 'Dr. Luna Wraith',
    title: 'Soul Therapist',
    specialty: ['dream', 'light'],
    hireCost: 250,
    salaryPerDay: 22,
    healBonus: 5,
    moodBonus: 15,
    maxPatients: 4,
    requiredLevel: 4,
    description: 'A compassionate therapist who heals through empathic listening.',
  },
  {
    id: 'dr_hugo_phantom',
    name: 'Dr. Hugo Phantom',
    title: 'Ectoplasm Expert',
    specialty: ['crystal', 'frost'],
    hireCost: 300,
    salaryPerDay: 25,
    healBonus: 12,
    moodBonus: 3,
    maxPatients: 3,
    requiredLevel: 6,
    description: 'A portly phantom who has studied ectoplasm in every form.',
  },
  {
    id: 'dr_ivy_shadow',
    name: 'Dr. Ivy Shadow',
    title: 'Shadow Specialist',
    specialty: ['shadow', 'void'],
    hireCost: 400,
    salaryPerDay: 35,
    healBonus: 18,
    moodBonus: -3,
    maxPatients: 2,
    requiredLevel: 8,
    description: 'A reclusive specialist who understands the deepest shadows.',
  },
  {
    id: 'dr_orion_blaze',
    name: 'Dr. Orion Blaze',
    title: 'Curse Expert',
    specialty: ['fire', 'storm'],
    hireCost: 450,
    salaryPerDay: 38,
    healBonus: 14,
    moodBonus: 5,
    maxPatients: 3,
    requiredLevel: 7,
    description: 'A fiery specialist who burns curses away with spectral flame.',
  },
  {
    id: 'dr_seraphina_light',
    name: 'Dr. Seraphina Light',
    title: 'Soul Healer',
    specialty: ['light', 'dream'],
    hireCost: 500,
    salaryPerDay: 40,
    healBonus: 10,
    moodBonus: 20,
    maxPatients: 4,
    requiredLevel: 10,
    description: 'An angelic healer whose presence alone comforts distressed spirits.',
  },
  {
    id: 'dr_bram_nether',
    name: 'Dr. Bram Nether',
    title: 'Dark Spirit Specialist',
    specialty: ['void', 'blood'],
    hireCost: 600,
    salaryPerDay: 50,
    healBonus: 20,
    moodBonus: -10,
    maxPatients: 2,
    requiredLevel: 12,
    description: 'A veteran of the nether wards who handles the most dangerous cases.',
  },
  {
    id: 'dr_cleo_mist',
    name: 'Dr. Cleo Mist',
    title: 'Pediatric Ghost Specialist',
    specialty: ['dream', 'nature'],
    hireCost: 200,
    salaryPerDay: 18,
    healBonus: 8,
    moodBonus: 18,
    maxPatients: 5,
    requiredLevel: 3,
    description: 'A gentle mist spirit who specializes in young ghost patients.',
  },
  {
    id: 'dr_rex_spook',
    name: 'Dr. Rex Spook',
    title: 'Rehabilitation Specialist',
    specialty: ['shadow', 'light'],
    hireCost: 280,
    salaryPerDay: 24,
    healBonus: 7,
    moodBonus: 8,
    maxPatients: 4,
    requiredLevel: 5,
    description: 'An energetic specialist who makes recovery feel like an adventure.',
  },
  {
    id: 'dr_mira_prism',
    name: 'Dr. Mira Prism',
    title: 'Crystal Spirit Expert',
    specialty: ['crystal', 'light'],
    hireCost: 550,
    salaryPerDay: 45,
    healBonus: 16,
    moodBonus: 5,
    maxPatients: 3,
    requiredLevel: 9,
    description: 'A prismatic spirit who refracts healing light into patients.',
  },
  {
    id: 'dr_desmond_hollow',
    name: 'Dr. Desmond Hollow',
    title: 'Void Specialist',
    specialty: ['void', 'dream'],
    hireCost: 700,
    salaryPerDay: 55,
    healBonus: 22,
    moodBonus: -8,
    maxPatients: 2,
    requiredLevel: 15,
    description: 'A mysterious entity from the void who treats its most fragile residents.',
  },
  {
    id: 'dr_penelope_dream',
    name: 'Dr. Penelope Dream',
    title: 'Dream Disorder Expert',
    specialty: ['dream', 'storm'],
    hireCost: 400,
    salaryPerDay: 32,
    healBonus: 10,
    moodBonus: 12,
    maxPatients: 3,
    requiredLevel: 6,
    description: 'A dreamweaver turned physician who heals through constructed dreams.',
  },
  {
    id: 'dr_atlas_frost',
    name: 'Dr. Atlas Frost',
    title: 'Frost Specter Specialist',
    specialty: ['frost', 'nature'],
    hireCost: 480,
    salaryPerDay: 42,
    healBonus: 15,
    moodBonus: -5,
    maxPatients: 3,
    requiredLevel: 8,
    description: 'A towering frost giant of a doctor who chills ailments into submission.',
  },
];

export const GH_TOOLS: ToolDef[] = [
  {
    id: 'spectrometer',
    name: 'Spectrometer',
    description: 'Analyzes the spectral composition of ghostly forms.',
    baseAccuracy: 0.6,
    upgradeCosts: [100, 250, 500, 1000, 2000],
    maxLevel: 5,
    effect: 'Increases surgery success rate.',
  },
  {
    id: 'ectoplasm_scanner',
    name: 'Ectoplasm Scanner',
    description: 'Detects ectoplasm density and flow patterns.',
    baseAccuracy: 0.5,
    upgradeCosts: [80, 200, 400, 800, 1600],
    maxLevel: 5,
    effect: 'Improves ectoplasm-related treatment effectiveness.',
  },
  {
    id: 'aura_reader',
    name: 'Aura Reader',
    description: 'Visualizes the spiritual aura of ghost patients.',
    baseAccuracy: 0.55,
    upgradeCosts: [90, 220, 450, 900, 1800],
    maxLevel: 5,
    effect: 'Reveals hidden ailments and curses.',
  },
  {
    id: 'spirit_thermometer',
    name: 'Spirit Thermometer',
    description: 'Measures the ethereal temperature of spectral energy.',
    baseAccuracy: 0.45,
    upgradeCosts: [60, 150, 300, 600, 1200],
    maxLevel: 5,
    effect: 'Helps diagnose cold- and fire-related conditions.',
  },
  {
    id: 'haunt_detector',
    name: 'Haunt Detector',
    description: 'Locates haunt attachments and location tethers.',
    baseAccuracy: 0.5,
    upgradeCosts: [100, 240, 480, 960, 1920],
    maxLevel: 5,
    effect: 'Improves haunt detoxification success rate.',
  },
  {
    id: 'soul_probe',
    name: 'Soul Probe',
    description: 'A delicate instrument that probes the depth of a soul.',
    baseAccuracy: 0.4,
    upgradeCosts: [150, 350, 700, 1400, 2800],
    maxLevel: 5,
    effect: 'Critical for soul binding and restoration treatments.',
  },
  {
    id: 'ghost_frequency_analyzer',
    name: 'Ghost Frequency Analyzer',
    description: 'Tunes into the ethereal frequency of ghost vocalizations.',
    baseAccuracy: 0.5,
    upgradeCosts: [110, 260, 520, 1040, 2080],
    maxLevel: 5,
    effect: 'Essential for voice therapy and dream analysis.',
  },
  {
    id: 'dimensional_radar',
    name: 'Dimensional Radar',
    description: 'Maps the dimensional anchors of a ghost patient.',
    baseAccuracy: 0.35,
    upgradeCosts: [200, 450, 900, 1800, 3600],
    maxLevel: 5,
    effect: 'Required for dimensional stabilization procedures.',
  },
];

export const GH_QUESTS: QuestDef[] = [
  { id: 'q_heal_5', name: 'First Steps', description: 'Heal 5 ghost patients.', type: 'heal', target: 5, coinReward: 50, xpReward: 30, requiredLevel: 1 },
  { id: 'q_admit_10', name: 'Growing Ward', description: 'Admit 10 patients total.', type: 'admit', target: 10, coinReward: 80, xpReward: 40, requiredLevel: 2 },
  { id: 'q_treat_20', name: 'Treatment Plan', description: 'Apply 20 treatments.', type: 'treat', target: 20, coinReward: 120, xpReward: 60, requiredLevel: 3 },
  { id: 'q_earn_500', name: 'Spirit Fund', description: 'Earn 500 coins from treatments.', type: 'earn', target: 500, coinReward: 100, xpReward: 50, requiredLevel: 4 },
  { id: 'q_heal_25', name: 'Dedicated Healer', description: 'Heal 25 ghost patients.', type: 'heal', target: 25, coinReward: 200, xpReward: 100, requiredLevel: 5 },
  { id: 'q_upgrade_3', name: 'Better Tools', description: 'Upgrade any tool to level 3.', type: 'upgrade', target: 3, coinReward: 150, xpReward: 75, requiredLevel: 6 },
  { id: 'q_hire_5', name: 'Full Staff', description: 'Hire 5 doctors.', type: 'hire', target: 5, coinReward: 250, xpReward: 120, requiredLevel: 8 },
  { id: 'q_heal_50', name: 'Master Healer', description: 'Heal 50 ghost patients.', type: 'heal', target: 50, coinReward: 400, xpReward: 200, requiredLevel: 10 },
  { id: 'q_treat_100', name: 'Century of Care', description: 'Apply 100 treatments.', type: 'treat', target: 100, coinReward: 500, xpReward: 250, requiredLevel: 12 },
  { id: 'q_earn_2000', name: 'Prosperous Hospital', description: 'Earn 2000 coins total.', type: 'earn', target: 2000, coinReward: 300, xpReward: 150, requiredLevel: 15 },
  { id: 'q_heal_100', name: 'Ghost Savior', description: 'Heal 100 ghost patients.', type: 'heal', target: 100, coinReward: 800, xpReward: 400, requiredLevel: 20 },
  { id: 'q_upgrade_5', name: 'Fully Equipped', description: 'Upgrade any tool to level 5.', type: 'upgrade', target: 5, coinReward: 600, xpReward: 300, requiredLevel: 25 },
  { id: 'q_quest_10', name: 'Quest Champion', description: 'Complete 10 quests.', type: 'quest', target: 10, coinReward: 500, xpReward: 250, requiredLevel: 15 },
  { id: 'q_heal_200', name: 'Legendary Healer', description: 'Heal 200 ghost patients.', type: 'heal', target: 200, coinReward: 1500, xpReward: 750, requiredLevel: 30 },
  { id: 'q_treat_500', name: 'Thousand Hands', description: 'Apply 500 treatments.', type: 'treat', target: 500, coinReward: 2000, xpReward: 1000, requiredLevel: 35 },
];

export const GH_NPCS: NPCDef[] = [
  {
    id: 'nurse_whisper',
    name: 'Nurse Whisper',
    role: 'Head Nurse',
    description: 'A soft-spoken ghost nurse who manages the ward schedule and patient flow.',
    questGiver: true,
    shopItems: ['basic_bandage', 'ecto_salve', 'spirit_balm'],
    reputationRewards: [
      { threshold: 10, reward: 'Ward Efficiency +5%' },
      { threshold: 25, reward: 'Patient Admission Discount' },
      { threshold: 50, reward: 'VIP Ward Access' },
    ],
  },
  {
    id: 'morty_janitor',
    name: 'Morty the Janitor',
    role: 'Spectral Custodian',
    description: 'A friendly ghost janitor who cleans up ectoplasm spills and shares hospital gossip.',
    questGiver: true,
    shopItems: ['ecto_mop', 'ghost_broom', 'spirit_duster'],
    reputationRewards: [
      { threshold: 10, reward: 'Faster Ward Cleaning' },
      { threshold: 30, reward: 'Hidden Room Access' },
    ],
  },
  {
    id: 'sir_casper',
    name: 'Sir Casper',
    role: 'Hospital Founder',
    description: 'The ancient specter who founded the hospital centuries ago. Full of wisdom and secrets.',
    questGiver: true,
    shopItems: ['founder_badge', 'ancient_scroll', 'spirit_key'],
    reputationRewards: [
      { threshold: 20, reward: 'Advanced Treatment Unlocks' },
      { threshold: 50, reward: 'Secret Ward Blueprint' },
    ],
  },
  {
    id: 'pharmacist_gloom',
    name: 'Pharmacist Gloom',
    role: 'Ectoplasm Pharmacist',
    description: 'A melancholic ghost who mixes spectral remedies from ethereal ingredients.',
    questGiver: false,
    shopItems: ['ecto_potion', 'spirit_elixir', 'ghost_antidote', 'curse_cure'],
    reputationRewards: [
      { threshold: 15, reward: 'Discount on Potions' },
      { threshold: 40, reward: 'Rare Ingredient Access' },
    ],
  },
  {
    id: 'receptionist_echo',
    name: 'Receptionist Echo',
    role: 'Front Desk',
    description: 'A friendly echo ghost who greets visitors and handles intake paperwork.',
    questGiver: true,
    shopItems: ['admission_form', 'welcome_gift'],
    reputationRewards: [
      { threshold: 10, reward: 'Priority Admission' },
      { threshold: 30, reward: 'VIP Reception' },
    ],
  },
];

export const GH_ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'ach_first_patient',
    name: 'First Patient',
    description: 'Admit your very first ghost patient.',
    icon: '👻',
    condition: 'admitFirst',
    checkFn: 'totalPatientsAdmitted >= 1',
    coinReward: 25,
    xpReward: 15,
  },
  {
    id: 'ach_healer_10',
    name: 'Apprentice Healer',
    description: 'Successfully heal 10 ghost patients.',
    icon: '💊',
    condition: 'heal10',
    checkFn: 'totalPatientsHealed >= 10',
    coinReward: 100,
    xpReward: 50,
  },
  {
    id: 'ach_healer_100',
    name: 'Miracle Worker',
    description: 'Successfully heal 100 ghost patients.',
    icon: '✨',
    condition: 'heal100',
    checkFn: 'totalPatientsHealed >= 100',
    coinReward: 500,
    xpReward: 250,
  },
  {
    id: 'ach_all_wards',
    name: 'Ward Master',
    description: 'Unlock all 8 hospital wards.',
    icon: '🏥',
    condition: 'allWards',
    checkFn: 'unlockedWards.length >= 8',
    coinReward: 300,
    xpReward: 150,
  },
  {
    id: 'ach_hire_5',
    name: 'Staff Surgeon',
    description: 'Hire at least 5 doctors.',
    icon: '👨‍⚕️',
    condition: 'hire5',
    checkFn: 'hiredDoctors >= 5',
    coinReward: 200,
    xpReward: 100,
  },
  {
    id: 'ach_all_tools',
    name: 'Diagnostician',
    description: 'Upgrade all diagnostic tools to at least level 3.',
    icon: '🔬',
    condition: 'tools3',
    checkFn: 'allToolsLevel3',
    coinReward: 400,
    xpReward: 200,
  },
  {
    id: 'ach_quest_20',
    name: 'Quest Champion',
    description: 'Complete 20 quests.',
    icon: '🏅',
    condition: 'quests20',
    checkFn: 'totalQuestsCompleted >= 20',
    coinReward: 600,
    xpReward: 300,
  },
  {
    id: 'ach_daily_7',
    name: 'Daily Devotee',
    description: 'Complete 7 daily tasks.',
    icon: '📅',
    condition: 'daily7',
    checkFn: 'totalDailyTasksCompleted >= 7',
    coinReward: 150,
    xpReward: 75,
  },
  {
    id: 'ach_coins_10000',
    name: 'Coin King',
    description: 'Accumulate 10,000 total coins earned.',
    icon: '👑',
    condition: 'coins10k',
    checkFn: 'totalCoinsEarned >= 10000',
    coinReward: 1000,
    xpReward: 500,
  },
  {
    id: 'ach_high_spirit',
    name: 'High Spirits',
    description: 'Have 5 admitted patients with mood above 80.',
    icon: '😊',
    condition: 'highMood5',
    checkFn: 'patientsHighMood5',
    coinReward: 200,
    xpReward: 100,
  },
  {
    id: 'ach_cursed_10',
    name: 'Curse Breaker',
    description: 'Treat 10 cursed ghost patients.',
    icon: '🔮',
    condition: 'cursed10',
    checkFn: 'totalCursedTreated >= 10',
    coinReward: 250,
    xpReward: 125,
  },
  {
    id: 'ach_surgery_50',
    name: 'Phantom Surgeon',
    description: 'Perform 50 ethereal surgeries.',
    icon: '🔪',
    condition: 'surgery50',
    checkFn: 'totalSurgeriesPerformed >= 50',
    coinReward: 350,
    xpReward: 175,
  },
  {
    id: 'ach_souls_25',
    name: 'Soul Saver',
    description: 'Restore 25 souls using soul-binding treatments.',
    icon: '💫',
    condition: 'souls25',
    checkFn: 'totalSoulsRestored >= 25',
    coinReward: 300,
    xpReward: 150,
  },
  {
    id: 'ach_max_level',
    name: 'Chief of Spirits',
    description: 'Reach the maximum level of 50.',
    icon: '⭐',
    condition: 'maxLevel',
    checkFn: 'level >= 50',
    coinReward: 2000,
    xpReward: 1000,
  },
  {
    id: 'ach_heal_200',
    name: 'Ghost Whisperer',
    description: 'Heal 200 ghost patients total.',
    icon: '🕊️',
    condition: 'heal200',
    checkFn: 'totalPatientsHealed >= 200',
    coinReward: 800,
    xpReward: 400,
  },
];

export const GH_TITLE_THRESHOLDS: TitleDef[] = [
  { name: 'Intern', level: 1, perks: ['Basic treatments', 'Spirit Ward access'] },
  { name: 'Resident', level: 5, perks: ['Phantom ICU access', 'Hire first doctor'] },
  { name: 'Attending', level: 10, perks: ['Ecto Ward access', 'Advanced treatments'] },
  { name: 'Specialist', level: 18, perks: ['Soul Therapy access', 'Shadow Wing access', 'Quest system'] },
  { name: 'Senior Specialist', level: 27, perks: ['Light Recovery access', 'Legendary patient admits'] },
  { name: 'Ward Director', level: 35, perks: ['Dream Ward access', 'All treatments', 'NPC reputation system'] },
  { name: 'Deputy Chief', level: 43, perks: ['Quarantine Ward access', 'Staff management perks'] },
  { name: 'Chief of Spirits', level: 50, perks: ['All wards', 'All treatments', 'All tools', 'Max bonuses'] },
];

export const GH_DAILY_TASKS: DailyTaskDef[] = [
  { id: 'dt_heal_3', name: 'Daily Healing', description: 'Heal 3 patients today.', target: 3, coinReward: 30, xpReward: 20 },
  { id: 'dt_treat_5', name: 'Treatment Rounds', description: 'Apply 5 treatments today.', target: 5, coinReward: 25, xpReward: 15 },
  { id: 'dt_admit_2', name: 'Admissions', description: 'Admit 2 new patients today.', target: 2, coinReward: 20, xpReward: 10 },
  { id: 'dt_earn_100', name: 'Daily Revenue', description: 'Earn 100 coins from treatments.', target: 100, coinReward: 50, xpReward: 25 },
  { id: 'dt_upgrade_1', name: 'Tool Maintenance', description: 'Upgrade any tool once.', target: 1, coinReward: 40, xpReward: 20 },
  { id: 'dt_doctor_task', name: 'Doctor Rounds', description: 'Have doctors treat 4 patients.', target: 4, coinReward: 35, xpReward: 18 },
];

export const GH_SEVERITY_THRESHOLDS = { minor: 1, moderate: 0.7, severe: 0.4, critical: 0.15 } as const;

export const GH_MOOD_LABELS: { min: number; max: number; label: GhostMood }[] = [
  { min: 0, max: 20, label: 'terrified' },
  { min: 21, max: 40, label: 'anxious' },
  { min: 41, max: 60, label: 'neutral' },
  { min: 61, max: 80, label: 'calm' },
  { min: 81, max: 100, label: 'serene' },
];

// ============================================================================
// § 4  Default State Factory
// ============================================================================

function createDefaultState(seed: number): GhostHospitalState {
  return {
    initialized: true,
    seed,
    level: 1,
    xp: 0,
    coins: 100,
    admittedPatients: [],
    hiredDoctors: [],
    unlockedWards: ['spirit_ward'],
    toolLevels: Object.fromEntries(GH_TOOLS.map((t) => [t.id, 0])),
    activeQuests: [],
    unlockedAchievements: [],
    treatmentHistory: [],
    dailyTaskDate: 0,
    dailyTaskProgress: 0,
    dailyTaskCompleted: false,
    dailyTaskClaimed: false,
    npcReputation: Object.fromEntries(GH_NPCS.map((n) => [n.id, 0])),
    stats: {
      totalPatientsHealed: 0,
      totalPatientsAdmitted: 0,
      totalTreatmentsApplied: 0,
      totalSurgeriesPerformed: 0,
      totalSoulsRestored: 0,
      totalCursedTreated: 0,
      totalQuestsCompleted: 0,
      totalDailyTasksCompleted: 0,
      totalCoinsEarned: 0,
      totalCoinsSpent: 0,
      hospitalRating: 50,
      currentStreak: 0,
      bestStreak: 0,
    },
    instanceCounter: 0,
    questCounter: 0,
  };
}

// ============================================================================
// § 5  XP / Level Helpers
// ============================================================================

function xpForLevel(level: number): number {
  if (level >= GH_MAX_LEVEL) return 0;
  return 50 + level * 30 + (level > 10 ? (level - 10) * 20 : 0) + (level > 25 ? (level - 25) * 30 : 0);
}

function totalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

function getTitleForLevel(level: number): TitleDef {
  let title = GH_TITLE_THRESHOLDS[0];
  for (const t of GH_TITLE_THRESHOLDS) {
    if (level >= t.level) title = t;
  }
  return title;
}

function getMoodLabel(mood: number): GhostMood {
  for (const m of GH_MOOD_LABELS) {
    if (mood >= m.min && mood <= m.max) return m.label;
  }
  return 'neutral';
}

function getSeverity(healthPct: number): GhostSeverity {
  if (healthPct > 0.7) return 'minor';
  if (healthPct > 0.4) return 'moderate';
  if (healthPct > 0.15) return 'severe';
  return 'critical';
}

function generateDailyTaskSeed(day: number): number {
  return (day * 7 + 42) & 0x7fffffff;
}

// ============================================================================
// § 6  Main Hook: useGhostHospital
// ============================================================================

function useGhostHospital(seed?: number): GhostHospitalActions {
  const initialSeed = seed ?? 12345;
  const [state, setState] = useState<GhostHospitalState>(() =>
    createDefaultState(initialSeed)
  );

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const rngRef = useRef<() => number>(() => mulberry32(initialSeed)());
  const advanceCounter = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, instanceCounter: prev.instanceCounter + 1 };
      return next;
    });
    return stateRef.current.instanceCounter;
  }, []);

  // ----- Core State -----

  const ghGetState = useCallback((): GhostHospitalState => stateRef.current, []);

  const ghResetState = useCallback(() => {
    setState(createDefaultState(initialSeed));
    rngRef.current = mulberry32(initialSeed)();
  }, [initialSeed]);

  // ----- Level / XP / Title -----

  const ghGetLevel = useCallback((): number => stateRef.current.level, []);

  const ghGetTitle = useCallback((): TitleDef => getTitleForLevel(stateRef.current.level), []);

  const ghGetProgress = useCallback(() => {
    const s = stateRef.current;
    const currentLevelXP = xpForLevel(s.level);
    const prevTotal = totalXPForLevel(s.level);
    const currentTotal = totalXPForLevel(s.level + 1);
    const xpInLevel = s.xp - prevTotal;
    const xpNeeded = currentTotal - prevTotal;
    return {
      level: s.level,
      xp: xpInLevel,
      xpToNext: xpNeeded,
      percent: xpNeeded > 0 ? Math.min(100, (xpInLevel / xpNeeded) * 100) : 100,
    };
  }, []);

  const ghAddXP = useCallback((amount: number): string[] => {
    const levelUps: string[] = [];
    setState((prev) => {
      let xp = prev.xp + amount;
      let level = prev.level;
      let newXP = xp;
      while (level < GH_MAX_LEVEL) {
        const needed = xpForLevel(level);
        if (needed <= 0) break;
        if (newXP >= totalXPForLevel(level) + needed) {
          level++;
          levelUps.push(level);
        } else {
          break;
        }
      }
      return { ...prev, xp: newXP, level };
    });
    return levelUps;
  }, []);

  const ghGetXPToNext = useCallback((level?: number): number => {
    return xpForLevel(level ?? stateRef.current.level);
  }, []);

  const ghGetTotalXP = useCallback((): number => stateRef.current.xp, []);

  // ----- Coins -----

  const ghGetCoins = useCallback((): number => stateRef.current.coins, []);

  const ghAddCoins = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      coins: prev.coins + amount,
      stats: { ...prev.stats, totalCoinsEarned: prev.stats.totalCoinsEarned + amount },
    }));
  }, []);

  const ghSpendCoins = useCallback((amount: number): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.coins >= amount) {
        success = true;
        return {
          ...prev,
          coins: prev.coins - amount,
          stats: { ...prev.stats, totalCoinsSpent: prev.stats.totalCoinsSpent + amount },
        };
      }
      return prev;
    });
    return success;
  }, []);

  const ghGetTotalCoinsEarned = useCallback((): number => stateRef.current.stats.totalCoinsEarned, []);

  // ----- Patients -----

  const ghGetPatients = useCallback((): GhostPatientDef[] => GH_PATIENTS, []);

  const ghAdmitPatient = useCallback((patientDefId?: string): AdmittedPatient | null => {
    let admitted: AdmittedPatient | null = null;
    setState((prev) => {
      const defId = patientDefId ?? (() => {
        const rng = mulberry32(prev.seed + prev.instanceCounter + Date.now());
        const rarityRoll = rng();
        let pool = GH_PATIENTS.filter((p) => p.rarity === 'common');
        if (rarityRoll > 0.6) pool = GH_PATIENTS.filter((p) => p.rarity === 'uncommon');
        if (rarityRoll > 0.85) pool = GH_PATIENTS.filter((p) => p.rarity === 'rare');
        if (rarityRoll > 0.95) pool = GH_PATIENTS.filter((p) => p.rarity === 'legendary');
        if (pool.length === 0) pool = GH_PATIENTS.filter((p) => p.rarity === 'common');
        const idx = ghSeededInt(rng, 0, pool.length - 1);
        return pool[idx].id;
      })();

      const patientDef = GH_PATIENTS.find((p) => p.id === defId);
      if (!patientDef) return prev;

      const wardId = patientDef.wardPreference;
      const wardDef = GH_WARDS.find((w) => w.id === wardId);
      if (wardDef && !prev.unlockedWards.includes(wardId)) return prev;

      const currentInWard = prev.admittedPatients.filter((p) => p.wardId === wardId).length;
      if (wardDef && currentInWard >= wardDef.capacity) return prev;

      const isCursed = (() => {
        const rng = mulberry32(prev.seed + prev.instanceCounter + 7777);
        return rng() > 0.8;
      })();

      const rng = mulberry32(prev.seed + prev.instanceCounter + 3333);
      const healthMult = GH_SEVERITY_THRESHOLDS[
        ['minor', 'moderate', 'severe', 'critical'][ghSeededInt(rng, 0, 3)] as keyof typeof GH_SEVERITY_THRESHOLDS
      ];
      const health = Math.max(5, Math.round(patientDef.baseHealth * healthMult));
      const severity = getSeverity(health / patientDef.baseHealth);
      const mood = ghSeededInt(rng, 20, 80);

      const instanceId = `gh_patient_${prev.instanceCounter + 1}`;

      const newPatient: AdmittedPatient = {
        instanceId,
        patientDefId: defId,
        health,
        maxHealth: patientDef.baseHealth,
        mood,
        moodLabel: getMoodLabel(mood),
        severity,
        wardId,
        admittedAt: Date.now(),
        doctorId: null,
        ailments: [...patientDef.ailments],
        element: patientDef.element,
        treatmentsApplied: [],
        isCursed,
      };

      admitted = newPatient;

      const newStats = {
        ...prev.stats,
        totalPatientsAdmitted: prev.stats.totalPatientsAdmitted + 1,
      };

      // Update quest progress
      const updatedQuests = prev.activeQuests.map((q) => {
        const questDef = GH_QUESTS.find((qd) => qd.id === q.questId);
        if (questDef?.type === 'admit') {
          return { ...q, progress: q.progress + 1 };
        }
        return q;
      });

      // Daily task progress
      let dailyProgress = prev.dailyTaskProgress;
      const dailyTask = ghGetDailyTaskByDate(prev.dailyTaskDate);
      if (dailyTask && dailyTask.id === 'dt_admit_2' && !prev.dailyTaskCompleted) {
        dailyProgress++;
      }

      return {
        ...prev,
        admittedPatients: [...prev.admittedPatients, newPatient],
        instanceCounter: prev.instanceCounter + 1,
        stats: newStats,
        activeQuests: updatedQuests,
        dailyTaskProgress: dailyProgress,
      };
    });
    return admitted;
  }, []);

  const ghDischargePatient = useCallback((instanceId: string): boolean => {
    let removed = false;
    setState((prev) => {
      const patient = prev.admittedPatients.find((p) => p.instanceId === instanceId);
      if (!patient) return prev;

      const patientDef = GH_PATIENTS.find((d) => d.id === patient.patientDefId);
      let coinReward = 0;
      let xpReward = 0;
      let healed = false;

      if (patient.health >= patient.maxHealth * 0.9) {
        healed = true;
        coinReward = patientDef?.coinsReward ?? 20;
        xpReward = patientDef?.xpReward ?? 10;
      }

      removed = true;

      return {
        ...prev,
        admittedPatients: prev.admittedPatients.filter((p) => p.instanceId !== instanceId),
        coins: prev.coins + coinReward,
        xp: prev.xp + xpReward,
        stats: {
          ...prev.stats,
          totalPatientsHealed: prev.stats.totalPatientsHealed + (healed ? 1 : 0),
          totalCoinsEarned: prev.stats.totalCoinsEarned + coinReward,
        },
      };
    });
    return removed;
  }, []);

  const ghGetAdmittedPatients = useCallback((): AdmittedPatient[] => stateRef.current.admittedPatients, []);

  const ghGetPatientInfo = useCallback(
    (instanceId: string): AdmittedPatient | undefined =>
      stateRef.current.admittedPatients.find((p) => p.instanceId === instanceId),
    []
  );

  const ghSetPatientMood = useCallback((instanceId: string, mood: number): boolean => {
    let success = false;
    const clamped = Math.max(0, Math.min(100, mood));
    setState((prev) => {
      const idx = prev.admittedPatients.findIndex((p) => p.instanceId === instanceId);
      if (idx === -1) return prev;
      const updated = [...prev.admittedPatients];
      updated[idx] = { ...updated[idx], mood: clamped, moodLabel: getMoodLabel(clamped) };
      success = true;
      return { ...prev, admittedPatients: updated };
    });
    return success;
  }, []);

  // ----- Wards -----

  const ghGetWards = useCallback((): WardDef[] => GH_WARDS, []);

  const ghUnlockWard = useCallback((wardId: string): boolean => {
    let success = false;
    setState((prev) => {
      const wardDef = GH_WARDS.find((w) => w.id === wardId);
      if (!wardDef) return prev;
      if (prev.unlockedWards.includes(wardId)) return prev;
      if (prev.level < wardDef.unlockLevel) return prev;
      if (prev.coins < wardDef.unlockCost) return prev;

      success = true;
      return {
        ...prev,
        unlockedWards: [...prev.unlockedWards, wardId],
        coins: prev.coins - wardDef.unlockCost,
        stats: {
          ...prev.stats,
          totalCoinsSpent: prev.stats.totalCoinsSpent + wardDef.unlockCost,
        },
      };
    });
    return success;
  }, []);

  const ghGetWardCapacity = useCallback((wardId: string): number => {
    const ward = GH_WARDS.find((w) => w.id === wardId);
    return ward?.capacity ?? 0;
  }, []);

  const ghGetWardPatients = useCallback((wardId: string): AdmittedPatient[] => {
    return stateRef.current.admittedPatients.filter((p) => p.wardId === wardId);
  }, []);

  // ----- Treatments -----

  const ghGetTreatments = useCallback((): TreatmentDef[] => GH_TREATMENTS, []);

  const ghTreatPatient = useCallback(
    (instanceId: string, treatmentId: string): TreatmentRecord | null => {
      let record: TreatmentRecord | null = null;
      setState((prev) => {
        const patientIdx = prev.admittedPatients.findIndex((p) => p.instanceId === instanceId);
        if (patientIdx === -1) return prev;

        const patient = prev.admittedPatients[patientIdx];
        const treatment = GH_TREATMENTS.find((t) => t.id === treatmentId);
        if (!treatment) return prev;
        if (prev.level < treatment.requiredLevel) return prev;
        if (prev.coins < treatment.cost) return prev;

        const doctor = patient.doctorId
          ? prev.hiredDoctors.find((d) => d.doctorId === patient.doctorId)
          : null;
        const doctorDef = doctor ? GH_DOCTORS.find((d) => d.id === doctor.doctorId) : null;

        const toolMatch = treatment.requiredTool;
        let toolBonus = 0;
        if (toolMatch) {
          const toolLevel = prev.toolLevels[toolMatch] ?? 0;
          const toolDef = GH_TOOLS.find((t) => t.id === toolMatch);
          if (toolDef) {
            toolBonus = toolDef.baseAccuracy * (1 + toolLevel * 0.15);
          }
        }

        const doctorBonus = doctorDef?.healBonus ?? 0;

        const wardDef = GH_WARDS.find((w) => w.id === patient.wardId);
        const wardHealMult = wardDef?.healMultiplier ?? 1.0;

        const moodFactor = 0.8 + (patient.mood / 100) * 0.4;

        const isAilmentMatch = treatment.targetAilments.some((a) => patient.ailments.includes(a));
        const matchBonus = isAilmentMatch ? 1.5 : 0.7;

        const rng = mulberry32(prev.seed + prev.instanceCounter + Date.now());
        const randomFactor = 0.85 + rng() * 0.3;

        const baseHeal = treatment.healAmount;
        const totalHeal = Math.round(
          baseHeal * wardHealMult * moodFactor * matchBonus * randomFactor + doctorBonus + toolBonus
        );

        const newHealth = Math.min(patient.maxHealth, patient.health + totalHeal);
        const newMood = Math.max(0, Math.min(100, patient.mood + treatment.moodChange));
        const success = totalHeal > 0;

        const ailmentsLeft = isAilmentMatch
          ? patient.ailments.filter((a) => !treatment.targetAilments.includes(a))
          : patient.ailments;

        const newPatient: AdmittedPatient = {
          ...patient,
          health: newHealth,
          mood: newMood,
          moodLabel: getMoodLabel(newMood),
          severity: getSeverity(newHealth / patient.maxHealth),
          ailments: ailmentsLeft,
          treatmentsApplied: [...patient.treatmentsApplied, treatmentId],
        };

        const newAdmitted = [...prev.admittedPatients];
        newAdmitted[patientIdx] = newPatient;

        const isSurgery = treatment.id === 'ethereal_surgery' || treatment.id === 'spirit_suture' || treatment.id === 'wraith_dematerialization' || treatment.id === 'full_spirit_reconstitution';
        const isSoulRestore = treatment.id === 'soul_mend' || treatment.id === 'soul_binding' || treatment.id === 'memory_restoration';

        const newRecord: TreatmentRecord = {
          timestamp: Date.now(),
          patientInstanceId: instanceId,
          treatmentId,
          healAmount: totalHeal,
          doctorId: patient.doctorId,
          success,
        };
        record = newRecord;

        const updatedDoctors = prev.hiredDoctors.map((d) =>
          d.doctorId === patient.doctorId ? { ...d, patientsTreated: d.patientsTreated + 1 } : d
        );

        const updatedQuests = prev.activeQuests.map((q) => {
          const qd = GH_QUESTS.find((x) => x.id === q.questId);
          if (qd?.type === 'treat') return { ...q, progress: q.progress + 1 };
          if (qd?.type === 'heal' && newHealth >= newPatient.maxHealth * 0.9) {
            return { ...q, progress: q.progress + 1 };
          }
          return q;
        });

        let dailyProgress = prev.dailyTaskProgress;
        const dt = ghGetDailyTaskByDate(prev.dailyTaskDate);
        if (dt && !prev.dailyTaskCompleted) {
          if (dt.id === 'dt_treat_5') dailyProgress++;
          if (dt.id === 'dt_heal_3' && newHealth >= newPatient.maxHealth * 0.9) dailyProgress++;
          if (dt.id === 'dt_earn_100') dailyProgress += treatment.cost;
        }

        return {
          ...prev,
          admittedPatients: newAdmitted,
          coins: prev.coins - treatment.cost,
          xp: prev.xp + treatment.xpReward,
          hiredDoctors: updatedDoctors,
          treatmentHistory: [...prev.treatmentHistory, newRecord],
          instanceCounter: prev.instanceCounter + 1,
          stats: {
            ...prev.stats,
            totalTreatmentsApplied: prev.stats.totalTreatmentsApplied + 1,
            totalSurgeriesPerformed: prev.stats.totalSurgeriesPerformed + (isSurgery ? 1 : 0),
            totalSoulsRestored: prev.stats.totalSoulsRestored + (isSoulRestore ? 1 : 0),
            totalCursedTreated: prev.stats.totalCursedTreated + (patient.isCursed ? 1 : 0),
            totalCoinsSpent: prev.stats.totalCoinsSpent + treatment.cost,
          },
          activeQuests: updatedQuests,
          dailyTaskProgress: dailyProgress,
        };
      });
      return record;
    },
    []
  );

  const ghGetTreatmentHistory = useCallback((): TreatmentRecord[] => stateRef.current.treatmentHistory, []);

  const ghGetBestTreatment = useCallback((ailments: string[]): TreatmentDef | null => {
    let best: TreatmentDef | null = null;
    let bestScore = -1;
    for (const t of GH_TREATMENTS) {
      const matchCount = t.targetAilments.filter((a) => ailments.includes(a)).length;
      const score = matchCount * t.healAmount - t.cost * 0.5;
      if (matchCount > 0 && score > bestScore) {
        bestScore = score;
        best = t;
      }
    }
    return best;
  }, []);

  // ----- Doctors -----

  const ghGetDoctors = useCallback((): DoctorDef[] => GH_DOCTORS, []);

  const ghHireDoctor = useCallback((doctorId: string): boolean => {
    let success = false;
    setState((prev) => {
      const docDef = GH_DOCTORS.find((d) => d.id === doctorId);
      if (!docDef) return prev;
      if (prev.hiredDoctors.some((d) => d.doctorId === doctorId)) return prev;
      if (prev.level < docDef.requiredLevel) return prev;
      if (prev.coins < docDef.hireCost) return prev;

      success = true;

      const updatedQuests = prev.activeQuests.map((q) => {
        const qd = GH_QUESTS.find((x) => x.id === q.questId);
        if (qd?.type === 'hire') return { ...q, progress: q.progress + 1 };
        return q;
      });

      return {
        ...prev,
        hiredDoctors: [
          ...prev.hiredDoctors,
          { doctorId, hiredAt: Date.now(), patientsTreated: 0, daysWorked: 0, morale: 100 },
        ],
        coins: prev.coins - docDef.hireCost,
        stats: { ...prev.stats, totalCoinsSpent: prev.stats.totalCoinsSpent + docDef.hireCost },
        activeQuests: updatedQuests,
      };
    });
    return success;
  }, []);

  const ghGetDoctorInfo = useCallback((doctorId: string): DoctorDef | undefined => {
    return GH_DOCTORS.find((d) => d.id === doctorId);
  }, []);

  const ghGetHiredDoctors = useCallback((): HiredDoctor[] => stateRef.current.hiredDoctors, []);

  // ----- Tools -----

  const ghGetTools = useCallback((): ToolDef[] => GH_TOOLS, []);

  const ghUpgradeTool = useCallback((toolId: string): boolean => {
    let success = false;
    setState((prev) => {
      const toolDef = GH_TOOLS.find((t) => t.id === toolId);
      if (!toolDef) return prev;
      const currentLevel = prev.toolLevels[toolId] ?? 0;
      if (currentLevel >= toolDef.maxLevel) return prev;
      const cost = toolDef.upgradeCosts[currentLevel] ?? Infinity;
      if (prev.coins < cost) return prev;

      success = true;

      const newLevels = { ...prev.toolLevels, [toolId]: currentLevel + 1 };

      const updatedQuests = prev.activeQuests.map((q) => {
        const qd = GH_QUESTS.find((x) => x.id === q.questId);
        if (qd?.type === 'upgrade') {
          const newLevel = currentLevel + 1;
          return { ...q, progress: Math.max(q.progress, newLevel) };
        }
        return q;
      });

      let dailyProgress = prev.dailyTaskProgress;
      const dt = ghGetDailyTaskByDate(prev.dailyTaskDate);
      if (dt && dt.id === 'dt_upgrade_1' && !prev.dailyTaskCompleted) {
        dailyProgress++;
      }

      return {
        ...prev,
        toolLevels: newLevels,
        coins: prev.coins - cost,
        stats: { ...prev.stats, totalCoinsSpent: prev.stats.totalCoinsSpent + cost },
        activeQuests: updatedQuests,
        dailyTaskProgress: dailyProgress,
      };
    });
    return success;
  }, []);

  const ghGetToolLevel = useCallback((toolId: string): number => {
    return stateRef.current.toolLevels[toolId] ?? 0;
  }, []);

  const ghGetToolEffectiveness = useCallback((toolId: string): number => {
    const toolDef = GH_TOOLS.find((t) => t.id === toolId);
    const level = stateRef.current.toolLevels[toolId] ?? 0;
    if (!toolDef) return 0;
    return toolDef.baseAccuracy * (1 + level * 0.15);
  }, []);

  // ----- Quests -----

  const ghGetQuests = useCallback((): QuestDef[] => {
    return GH_QUESTS.filter((q) => q.requiredLevel <= stateRef.current.level);
  }, []);

  const ghAcceptQuest = useCallback((questId: string): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.activeQuests.some((q) => q.questId === questId)) return prev;
      const qDef = GH_QUESTS.find((q) => q.id === questId);
      if (!qDef) return prev;
      if (prev.level < qDef.requiredLevel) return prev;
      if (prev.activeQuests.length >= 5) return prev;

      success = true;
      let initialProgress = 0;
      if (qDef.type === 'heal') initialProgress = prev.stats.totalPatientsHealed;
      if (qDef.type === 'admit') initialProgress = prev.stats.totalPatientsAdmitted;
      if (qDef.type === 'treat') initialProgress = prev.stats.totalTreatmentsApplied;
      if (qDef.type === 'earn') initialProgress = prev.stats.totalCoinsEarned;
      if (qDef.type === 'hire') initialProgress = prev.hiredDoctors.length;

      return {
        ...prev,
        activeQuests: [
          ...prev.activeQuests,
          { questId, acceptedAt: Date.now(), progress: initialProgress, completed: false, claimed: false },
        ],
      };
    });
    return success;
  }, []);

  const ghCompleteQuest = useCallback((questId: string): boolean => {
    let success = false;
    setState((prev) => {
      const idx = prev.activeQuests.findIndex((q) => q.questId === questId);
      if (idx === -1) return prev;
      const q = prev.activeQuests[idx];
      if (q.completed) return prev;

      const qDef = GH_QUESTS.find((qd) => qd.id === questId);
      if (!qDef) return prev;
      if (q.progress < qDef.target) return prev;

      success = true;
      const updated = [...prev.activeQuests];
      updated[idx] = { ...q, completed: true };

      const updatedQuests = prev.activeQuests.map((aq) => {
        const aqd = GH_QUESTS.find((x) => x.id === aq.questId);
        if (aqd?.type === 'quest') return { ...aq, progress: aq.progress + 1 };
        return aq;
      });

      return {
        ...prev,
        activeQuests: updated,
        stats: {
          ...prev.stats,
          totalQuestsCompleted: prev.stats.totalQuestsCompleted + 1,
        },
        activeQuests: updatedQuests,
      };
    });
    return success;
  }, []);

  const ghClaimQuestReward = useCallback((questId: string): boolean => {
    let success = false;
    setState((prev) => {
      const idx = prev.activeQuests.findIndex((q) => q.questId === questId);
      if (idx === -1) return prev;
      const q = prev.activeQuests[idx];
      if (!q.completed || q.claimed) return prev;

      const qDef = GH_QUESTS.find((qd) => qd.id === questId);
      if (!qDef) return prev;

      success = true;
      const updated = [...prev.activeQuests];
      updated[idx] = { ...q, claimed: true };

      return {
        ...prev,
        activeQuests: updated.filter((_, i) => i !== idx),
        coins: prev.coins + qDef.coinReward,
        xp: prev.xp + qDef.xpReward,
        stats: { ...prev.stats, totalCoinsEarned: prev.stats.totalCoinsEarned + qDef.coinReward },
      };
    });
    return success;
  }, []);

  const ghGetActiveQuests = useCallback((): ActiveQuest[] => stateRef.current.activeQuests, []);

  // ----- Achievements -----

  const ghGetAchievements = useCallback((): AchievementDef[] => GH_ACHIEVEMENTS, []);

  const ghCheckAchievements = useCallback((): string[] => {
    const s = stateRef.current;
    const newlyUnlocked: string[] = [];

    for (const ach of GH_ACHIEVEMENTS) {
      if (s.unlockedAchievements.includes(ach.id)) continue;

      let met = false;
      switch (ach.id) {
        case 'ach_first_patient':
          met = s.stats.totalPatientsAdmitted >= 1;
          break;
        case 'ach_healer_10':
          met = s.stats.totalPatientsHealed >= 10;
          break;
        case 'ach_healer_100':
          met = s.stats.totalPatientsHealed >= 100;
          break;
        case 'ach_all_wards':
          met = s.unlockedWards.length >= 8;
          break;
        case 'ach_hire_5':
          met = s.hiredDoctors.length >= 5;
          break;
        case 'ach_all_tools':
          met = Object.values(s.toolLevels).every((l) => l >= 3);
          break;
        case 'ach_quest_20':
          met = s.stats.totalQuestsCompleted >= 20;
          break;
        case 'ach_daily_7':
          met = s.stats.totalDailyTasksCompleted >= 7;
          break;
        case 'ach_coins_10000':
          met = s.stats.totalCoinsEarned >= 10000;
          break;
        case 'ach_high_spirit':
          met = s.admittedPatients.filter((p) => p.mood > 80).length >= 5;
          break;
        case 'ach_cursed_10':
          met = s.stats.totalCursedTreated >= 10;
          break;
        case 'ach_surgery_50':
          met = s.stats.totalSurgeriesPerformed >= 50;
          break;
        case 'ach_souls_25':
          met = s.stats.totalSoulsRestored >= 25;
          break;
        case 'ach_max_level':
          met = s.level >= GH_MAX_LEVEL;
          break;
        case 'ach_heal_200':
          met = s.stats.totalPatientsHealed >= 200;
          break;
      }

      if (met) newlyUnlocked.push(ach.id);
    }

    if (newlyUnlocked.length > 0) {
      setState((prev) => ({
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, ...newlyUnlocked],
      }));
    }

    return newlyUnlocked;
  }, []);

  const ghUnlockAchievement = useCallback((achievementId: string): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.unlockedAchievements.includes(achievementId)) return prev;
      const ach = GH_ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (!ach) return prev;

      success = true;
      return {
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, achievementId],
        coins: prev.coins + ach.coinReward,
        xp: prev.xp + ach.xpReward,
        stats: { ...prev.stats, totalCoinsEarned: prev.stats.totalCoinsEarned + ach.coinReward },
      };
    });
    return success;
  }, []);

  // ----- Daily Tasks -----

  const ghGetDailyTask = useCallback((): DailyTaskDef | null => {
    const day = Math.floor(Date.now() / 86400000);
    return ghGetDailyTaskByDate(day);
  }, []);

  const ghCompleteDailyTask = useCallback((): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.dailyTaskCompleted) return prev;
      const dt = ghGetDailyTaskByDate(prev.dailyTaskDate);
      if (!dt) return prev;
      if (prev.dailyTaskProgress < dt.target) return prev;

      success = true;
      return { ...prev, dailyTaskCompleted: true };
    });
    return success;
  }, []);

  const ghClaimDailyReward = useCallback((): boolean => {
    let success = false;
    setState((prev) => {
      if (!prev.dailyTaskCompleted || prev.dailyTaskClaimed) return prev;
      const dt = ghGetDailyTaskByDate(prev.dailyTaskDate);
      if (!dt) return prev;

      success = true;
      return {
        ...prev,
        dailyTaskClaimed: true,
        coins: prev.coins + dt.coinReward,
        xp: prev.xp + dt.xpReward,
        stats: {
          ...prev.stats,
          totalCoinsEarned: prev.stats.totalCoinsEarned + dt.coinReward,
          totalDailyTasksCompleted: prev.stats.totalDailyTasksCompleted + 1,
        },
      };
    });
    return success;
  }, []);

  // ----- NPCs -----

  const ghGetNPCs = useCallback((): NPCDef[] => GH_NPCS, []);

  const ghIncreaseReputation = useCallback((npcId: string, amount: number): number => {
    let newRep = 0;
    setState((prev) => {
      const current = prev.npcReputation[npcId] ?? 0;
      newRep = current + amount;
      return {
        ...prev,
        npcReputation: { ...prev.npcReputation, [npcId]: newRep },
      };
    });
    return newRep;
  }, []);

  const ghGetReputation = useCallback((npcId: string): number => {
    return stateRef.current.npcReputation[npcId] ?? 0;
  }, []);

  // ----- Stats -----

  const ghGetStats = useCallback((): HospitalStats => stateRef.current.stats, []);

  const ghGetHealRate = useCallback((): number => {
    const s = stateRef.current;
    if (s.stats.totalTreatmentsApplied === 0) return 0;
    const successful = s.treatmentHistory.filter((t) => t.success).length;
    return successful / s.stats.totalTreatmentsApplied;
  }, []);

  const ghGetHospitalRating = useCallback((): number => {
    const s = stateRef.current;
    const healRate = s.treatmentHistory.length > 0
      ? s.treatmentHistory.filter((t) => t.success).length / s.treatmentHistory.length
      : 0;
    const avgMood =
      s.admittedPatients.length > 0
        ? s.admittedPatients.reduce((sum, p) => sum + p.mood, 0) / s.admittedPatients.length
        : 50;
    const wardBonus = s.unlockedWards.length * 3;
    const doctorBonus = s.hiredDoctors.length * 2;
    const rating = Math.round(
      20 + healRate * 30 + (avgMood / 100) * 25 + wardBonus + doctorBonus
    );
    return Math.max(0, Math.min(100, rating));
  }, []);

  // ----- Diagnosis -----

  const ghDiagnosePatient = useCallback(
    (instanceId: string): { ailments: string[]; severity: GhostSeverity; recommended: string } => {
      const patient = stateRef.current.admittedPatients.find((p) => p.instanceId === instanceId);
      if (!patient) {
        return { ailments: [], severity: 'minor', recommended: '' };
      }

      const toolLevel = stateRef.current.toolLevels['aura_reader'] ?? 0;
      const auraDef = GH_TOOLS.find((t) => t.id === 'aura_reader');
      const accuracy = auraDef ? auraDef.baseAccuracy * (1 + toolLevel * 0.15) : 0.5;

      const patientDef = GH_PATIENTS.find((p) => p.id === patient.patientDefId);
      const allAilments = patientDef?.ailments ?? patient.ailments;

      const revealedCount = Math.max(1, Math.ceil(allAilments.length * accuracy));
      const revealed = allAilments.slice(0, revealedCount);

      const best = ghGetBestTreatment(revealed);
      return {
        ailments: revealed,
        severity: patient.severity,
        recommended: best?.name ?? 'General examination needed',
      };
    },
    [ghGetBestTreatment]
  );

  const ghGetRecommendedTreatment = useCallback(
    (instanceId: string): TreatmentDef | null => {
      const patient = stateRef.current.admittedPatients.find((p) => p.instanceId === instanceId);
      if (!patient) return null;
      return ghGetBestTreatment(patient.ailments);
    },
    [ghGetBestTreatment]
  );

  // ----- Simulation -----

  const ghSimulateDay = useCallback((): { healed: number; earned: number; events: string[] } => {
    let healed = 0;
    let earned = 0;
    const events: string[] = [];

    setState((prev) => {
      const newAdmitted = [...prev.admittedPatients];
      const newDoctors = [...prev.hiredDoctors];
      let dayHealed = 0;
      let dayEarned = 0;

      // Doctors heal their assigned patients
      for (const doc of prev.hiredDoctors) {
        const docDef = GH_DOCTORS.find((d) => d.id === doc.doctorId);
        const assignedPatients = newAdmitted.filter((p) => p.doctorId === doc.doctorId);

        for (const pat of assignedPatients) {
          if (pat.health >= pat.maxHealth * 0.9) continue;

          const healBonus = docDef?.healBonus ?? 0;
          const wardDef = GH_WARDS.find((w) => w.id === pat.wardId);
          const wardMult = wardDef?.healMultiplier ?? 1.0;
          const wardMoodBonus = wardDef?.moodBonus ?? 0;

          const rng = mulberry32(prev.seed + prev.instanceCounter + pat.health);
          const autoHeal = Math.round((5 + healBonus) * wardMult * (0.8 + rng() * 0.4));

          const idx = newAdmitted.findIndex((p) => p.instanceId === pat.instanceId);
          if (idx !== -1) {
            newAdmitted[idx] = {
              ...newAdmitted[idx],
              health: Math.min(newAdmitted[idx].maxHealth, newAdmitted[idx].health + autoHeal),
              mood: Math.max(0, Math.min(100, newAdmitted[idx].mood + 2 + (docDef?.moodBonus ?? 0) + wardMoodBonus)),
              severity: getSeverity(Math.min(newAdmitted[idx].maxHealth, newAdmitted[idx].health + autoHeal) / newAdmitted[idx].maxHealth),
              moodLabel: getMoodLabel(Math.max(0, Math.min(100, newAdmitted[idx].mood + 2))),
            };
          }

          const docIdx = newDoctors.findIndex((d) => d.doctorId === doc.doctorId);
          if (docIdx !== -1) {
            newDoctors[docIdx] = {
              ...newDoctors[docIdx],
              patientsTreated: newDoctors[docIdx].patientsTreated + 1,
              daysWorked: newDoctors[docIdx].daysWorked + 1,
            };
          }
        }

        // Pay doctor salary
        dayEarned -= docDef?.salaryPerDay ?? 0;
      }

      // Check for healed patients (auto-discharge with reward)
      const toDischarge = newAdmitted.filter((p) => p.health >= p.maxHealth * 0.9);
      dayHealed = toDischarge.length;

      for (const pat of toDischarge) {
        const patDef = GH_PATIENTS.find((p) => p.id === pat.patientDefId);
        dayEarned += patDef?.coinsReward ?? 20;
        events.push(`${patDef?.name ?? 'Unknown'} was healed and discharged!`);
      }

      // Ward passive mood effects
      for (const pat of newAdmitted) {
        const wardDef = GH_WARDS.find((w) => w.id === pat.wardId);
        if (wardDef && wardDef.moodBonus !== 0) {
          const idx = newAdmitted.findIndex((p) => p.instanceId === pat.instanceId);
          if (idx !== -1) {
            const newMood = Math.max(0, Math.min(100, newAdmitted[idx].mood + wardDef.moodBonus));
            newAdmitted[idx] = {
              ...newAdmitted[idx],
              mood: newMood,
              moodLabel: getMoodLabel(newMood),
            };
          }
        }
      }

      // Natural health decay for critical patients without doctors
      for (const pat of newAdmitted) {
        if (!pat.doctorId && pat.severity === 'critical') {
          const idx = newAdmitted.findIndex((p) => p.instanceId === pat.instanceId);
          if (idx !== -1) {
            const decay = 3;
            newAdmitted[idx] = {
              ...newAdmitted[idx],
              health: Math.max(1, newAdmitted[idx].health - decay),
              severity: getSeverity(Math.max(1, newAdmitted[idx].health - decay) / newAdmitted[idx].maxHealth),
            };
            events.push(`${GH_PATIENTS.find((p) => p.id === pat.patientDefId)?.name ?? 'A patient'} is deteriorating!`);
          }
        }
      }

      // Random event
      const rng = mulberry32(prev.seed + prev.instanceCounter + 9999);
      const eventRoll = rng();
      if (eventRoll > 0.85) {
        events.push('A mysterious fog rolled through the wards overnight.');
      } else if (eventRoll > 0.7) {
        dayEarned += 20;
        events.push('Nurse Whisper found extra ectoplasm supplies. +20 coins!');
      } else if (eventRoll > 0.6) {
        events.push('The spirits were restless last night. Ward mood decreased slightly.');
      }

      if (dayHealed > 0) {
        const streak = prev.stats.currentStreak + 1;
        const bestStreak = Math.max(prev.stats.bestStreak, streak);
        healed = dayHealed;
        earned = dayEarned;
        return {
          ...prev,
          admittedPatients: newAdmitted.filter((p) => p.health < p.maxHealth * 0.9),
          hiredDoctors: newDoctors,
          coins: Math.max(0, prev.coins + dayEarned),
          stats: {
            ...prev.stats,
            totalPatientsHealed: prev.stats.totalPatientsHealed + dayHealed,
            totalCoinsEarned: prev.stats.totalCoinsEarned + Math.max(0, dayEarned),
            totalCoinsSpent: prev.stats.totalCoinsSpent + Math.max(0, -dayEarned),
            currentStreak: streak,
            bestStreak,
          },
          instanceCounter: prev.instanceCounter + 1,
        };
      }

      earned = dayEarned;
      return {
        ...prev,
        admittedPatients: newAdmitted,
        hiredDoctors: newDoctors,
        coins: Math.max(0, prev.coins + dayEarned),
        stats: {
          ...prev.stats,
          totalCoinsSpent: prev.stats.totalCoinsSpent + Math.max(0, -dayEarned),
          currentStreak: 0,
        },
        instanceCounter: prev.instanceCounter + 1,
      };
    });

    return { healed, earned, events };
  }, []);

  // ----- Summary -----

  const ghGetHospitalSummary = useCallback(() => {
    const s = stateRef.current;
    return {
      patients: s.admittedPatients.length,
      doctors: s.hiredDoctors.length,
      wards: s.unlockedWards.length,
      coins: s.coins,
      rating: Math.round(20 + (s.unlockedWards.length * 3) + (s.hiredDoctors.length * 2) + (s.admittedPatients.length > 0 ? s.admittedPatients.reduce((a, p) => a + p.mood, 0) / s.admittedPatients.length / 4 : 12.5)),
    };
  }, []);

  const ghGetUpgradeCost = useCallback((toolId: string): number => {
    const toolDef = GH_TOOLS.find((t) => t.id === toolId);
    const currentLevel = stateRef.current.toolLevels[toolId] ?? 0;
    if (!toolDef || currentLevel >= toolDef.maxLevel) return Infinity;
    return toolDef.upgradeCosts[currentLevel] ?? Infinity;
  }, []);

  const ghCanAfford = useCallback((amount: number): boolean => {
    return stateRef.current.coins >= amount;
  }, []);

  const ghGetRandomInt = useCallback((min: number, max: number): number => {
    const rng = mulberry32(stateRef.current.seed + stateRef.current.instanceCounter + Date.now());
    return ghSeededInt(rng, min, max);
  }, []);

  const ghGetRNG = useCallback((): (() => number) => {
    return mulberry32(stateRef.current.seed + stateRef.current.instanceCounter);
  }, []);

  const ghAdvanceInstanceCounter = useCallback((): number => {
    let counter = 0;
    setState((prev) => {
      counter = prev.instanceCounter + 1;
      return { ...prev, instanceCounter: counter };
    });
    return counter;
  }, []);

  // ----- Return all actions -----
  return {
    ghGetState,
    ghResetState,
    ghGetLevel,
    ghGetTitle,
    ghGetProgress,
    ghAddXP,
    ghGetXPToNext,
    ghGetTotalXP,
    ghGetCoins,
    ghAddCoins,
    ghSpendCoins,
    ghGetTotalCoinsEarned,
    ghGetPatients,
    ghAdmitPatient,
    ghDischargePatient,
    ghGetAdmittedPatients,
    ghGetPatientInfo,
    ghSetPatientMood,
    ghGetWards,
    ghUnlockWard,
    ghGetWardCapacity,
    ghGetWardPatients,
    ghGetTreatments,
    ghTreatPatient,
    ghGetTreatmentHistory,
    ghGetBestTreatment,
    ghGetDoctors,
    ghHireDoctor,
    ghGetDoctorInfo,
    ghGetHiredDoctors,
    ghGetTools,
    ghUpgradeTool,
    ghGetToolLevel,
    ghGetToolEffectiveness,
    ghGetQuests,
    ghAcceptQuest,
    ghCompleteQuest,
    ghClaimQuestReward,
    ghGetActiveQuests,
    ghGetAchievements,
    ghCheckAchievements,
    ghUnlockAchievement,
    ghGetDailyTask,
    ghCompleteDailyTask,
    ghClaimDailyReward,
    ghGetNPCs,
    ghIncreaseReputation,
    ghGetReputation,
    ghGetStats,
    ghGetHealRate,
    ghGetHospitalRating,
    ghDiagnosePatient,
    ghGetRecommendedTreatment,
    ghSimulateDay,
    ghGetHospitalSummary,
    ghGetUpgradeCost,
    ghCanAfford,
    ghGetRandomInt,
    ghGetRNG,
    ghAdvanceInstanceCounter,
  };
}

// ============================================================================
// § 7  Helper: Daily Task Selection by Date (pure function)
// ============================================================================

function ghGetDailyTaskByDate(day: number): DailyTaskDef | null {
  const seed = generateDailyTaskSeed(day);
  const idx = seed % GH_DAILY_TASKS.length;
  return GH_DAILY_TASKS[idx];
}

// ============================================================================
// § 8  Additional Standalone Utility Exports
// ============================================================================

export function ghGetPatientDefById(id: string): GhostPatientDef | undefined {
  return GH_PATIENTS.find((p) => p.id === id);
}

export function ghGetWardDefById(id: string): WardDef | undefined {
  return GH_WARDS.find((w) => w.id === id);
}

export function ghGetTreatmentDefById(id: string): TreatmentDef | undefined {
  return GH_TREATMENTS.find((t) => t.id === id);
}

export function ghGetDoctorDefById(id: string): DoctorDef | undefined {
  return GH_DOCTORS.find((d) => d.id === id);
}

export function ghGetToolDefById(id: string): ToolDef | undefined {
  return GH_TOOLS.find((t) => t.id === id);
}

export function ghGetQuestDefById(id: string): QuestDef | undefined {
  return GH_QUESTS.find((q) => q.id === id);
}

export function ghGetNPCDefById(id: string): NPCDef | undefined {
  return GH_NPCS.find((n) => n.id === id);
}

export function ghGetAchievementDefById(id: string): AchievementDef | undefined {
  return GH_ACHIEVEMENTS.find((a) => a.id === id);
}

export function ghGetPatientsByElement(element: GhostElement): GhostPatientDef[] {
  return GH_PATIENTS.filter((p) => p.element === element);
}

export function ghGetPatientsByRarity(rarity: GhostPatientDef['rarity']): GhostPatientDef[] {
  return GH_PATIENTS.filter((p) => p.rarity === rarity);
}

export function ghGetTreatmentsForAilment(ailment: string): TreatmentDef[] {
  return GH_TREATMENTS.filter((t) => t.targetAilments.includes(ailment));
}

export function ghGetDoctorsBySpecialty(element: GhostElement): DoctorDef[] {
  return GH_DOCTORS.filter((d) => d.specialty.includes(element));
}

export function ghGetWardsForElement(element: GhostElement): WardDef[] {
  return GH_WARDS.filter((w) => w.allowedElements.includes(element));
}

export function ghCalculateXPCurve(level: number): number {
  return totalXPForLevel(level);
}

export function ghGetLevelFromXP(xp: number): number {
  let level = 1;
  let accumulated = 0;
  while (level < GH_MAX_LEVEL) {
    const needed = xpForLevel(level);
    if (accumulated + needed > xp) break;
    accumulated += needed;
    level++;
  }
  return level;
}

export function ghGetElements(): GhostElement[] {
  return ['shadow', 'frost', 'fire', 'void', 'crystal', 'dream', 'nature', 'light', 'blood', 'storm'];
}

export function ghGetRarities(): GhostPatientDef['rarity'][] {
  return ['common', 'uncommon', 'rare', 'legendary'];
}

export function ghGetSeverities(): GhostSeverity[] {
  return ['minor', 'moderate', 'severe', 'critical'];
}

export function ghGetMoodLabels(): GhostMood[] {
  return ['terrified', 'anxious', 'neutral', 'calm', 'serene'];
}

export function ghGetSeededRNG(seed: number): () => number {
  return mulberry32(seed);
}

export function ghSeverityToColor(severity: GhostSeverity): string {
  switch (severity) {
    case 'minor': return '#4ade80';
    case 'moderate': return '#facc15';
    case 'severe': return '#f97316';
    case 'critical': return '#ef4444';
    default: return '#94a3b8';
  }
}

export function ghElementToColor(element: GhostElement): string {
  switch (element) {
    case 'shadow': return '#6366f1';
    case 'frost': return '#67e8f9';
    case 'fire': return '#f97316';
    case 'void': return '#1e1b4b';
    case 'crystal': return '#e879f9';
    case 'dream': return '#a78bfa';
    case 'nature': return '#4ade80';
    case 'light': return '#fde68a';
    case 'blood': return '#dc2626';
    case 'storm': return '#38bdf8';
    default: return '#94a3b8';
  }
}

export function ghRarityToColor(rarity: GhostPatientDef['rarity']): string {
  switch (rarity) {
    case 'common': return '#9ca3af';
    case 'uncommon': return '#4ade80';
    case 'rare': return '#60a5fa';
    case 'legendary': return '#fbbf24';
    default: return '#9ca3af';
  }
}

export function ghMoodToEmoji(mood: GhostMood): string {
  switch (mood) {
    case 'terrified': return '😱';
    case 'anxious': return '😟';
    case 'neutral': return '😐';
    case 'calm': return '🙂';
    case 'serene': return '😌';
    default: return '😐';
  }
}

export function ghValidateState(partial: Partial<GhostHospitalState>): boolean {
  if (partial.level !== undefined && (partial.level < 1 || partial.level > GH_MAX_LEVEL)) return false;
  if (partial.coins !== undefined && partial.coins < 0) return false;
  if (partial.xp !== undefined && partial.xp < 0) return false;
  return true;
}

export function ghCreateInitialState(seed?: number): GhostHospitalState {
  return createDefaultState(seed ?? 12345);
}

export function ghExportStateToString(state: GhostHospitalState): string {
  return JSON.stringify(state);
}

export function ghImportStateFromString(json: string): GhostHospitalState | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed && parsed.initialized !== undefined && parsed.level !== undefined) {
      return parsed as GhostHospitalState;
    }
    return null;
  } catch {
    return null;
  }
}

export function ghMigrateState(oldState: Partial<GhostHospitalState>): GhostHospitalState {
  const base = createDefaultState(oldState.seed ?? 12345);
  return {
    ...base,
    ...oldState,
    stats: { ...base.stats, ...(oldState.stats ?? {}) },
    toolLevels: { ...base.toolLevels, ...(oldState.toolLevels ?? {}) },
    npcReputation: { ...base.npcReputation, ...(oldState.npcReputation ?? {}) },
  };
}

export function ghGetTreatmentCooldownLeft(
  history: TreatmentRecord[],
  treatmentId: string,
  cooldown: number,
  now: number
): number {
  const lastUse = history
    .filter((t) => t.treatmentId === treatmentId)
    .sort((a, b) => b.timestamp - a.timestamp)[0];

  if (!lastUse || cooldown <= 0) return 0;
  const elapsed = (now - lastUse.timestamp) / 1000;
  return Math.max(0, cooldown - elapsed);
}

export function ghGetWardStatus(
  wardId: string,
  unlockedWards: string[],
  currentPatients: number,
  capacity: number
): WardStatus {
  if (!unlockedWards.includes(wardId)) return 'locked';
  if (currentPatients === 0) return 'active';
  if (currentPatients >= capacity) return 'full';
  return 'active';
}

export function ghCalculateAdmissionCost(patientDefId: string, level: number): number {
  const def = GH_PATIENTS.find((p) => p.id === patientDefId);
  if (!def) return 50;
  const baseCost = def.rarity === 'common' ? 10 : def.rarity === 'uncommon' ? 20 : def.rarity === 'rare' ? 40 : 80;
  const levelDiscount = Math.floor(level / 10) * 5;
  return Math.max(5, baseCost - levelDiscount);
}

export function ghGetDoctorSalary(doctorId: string): number {
  return GH_DOCTORS.find((d) => d.id === doctorId)?.salaryPerDay ?? 0;
}

export function ghGetDoctorMaxPatients(doctorId: string): number {
  return GH_DOCTORS.find((d) => d.id === doctorId)?.maxPatients ?? 0;
}

export function ghGetNPCReputationRewards(npcId: string): { threshold: number; reward: string }[] {
  return GH_NPCS.find((n) => n.id === npcId)?.reputationRewards ?? [];
}

export function ghGetNextTitle(level: number): TitleDef | null {
  const current = getTitleForLevel(level);
  const idx = GH_TITLE_THRESHOLDS.indexOf(current);
  if (idx < GH_TITLE_THRESHOLDS.length - 1) {
    return GH_TITLE_THRESHOLDS[idx + 1];
  }
  return null;
}

export function ghGetTitleProgress(level: number, xp: number): { current: TitleDef; next: TitleDef | null; percent: number } {
  const current = getTitleForLevel(level);
  const next = ghGetNextTitle(level);
  if (!next) return { current, next: null, percent: 100 };

  const currentLevelXP = totalXPForLevel(current.level);
  const nextLevelXP = totalXPForLevel(next.level);
  const range = nextLevelXP - currentLevelXP;
  const progress = xp - currentLevelXP;
  const percent = range > 0 ? Math.min(100, (progress / range) * 100) : 100;

  return { current, next, percent };
}

export function ghSortPatientsByHealth(patients: AdmittedPatient[], ascending: boolean): AdmittedPatient[] {
  return [...patients].sort((a, b) => {
    const aPct = a.health / a.maxHealth;
    const bPct = b.health / b.maxHealth;
    return ascending ? aPct - bPct : bPct - aPct;
  });
}

export function ghSortPatientsByMood(patients: AdmittedPatient[], ascending: boolean): AdmittedPatient[] {
  return [...patients].sort((a, b) => ascending ? a.mood - b.mood : b.mood - a.mood);
}

export function ghFilterPatientsBySeverity(patients: AdmittedPatient[], severity: GhostSeverity): AdmittedPatient[] {
  return patients.filter((p) => p.severity === severity);
}

export function ghFilterPatientsByElement(patients: AdmittedPatient[], element: GhostElement): AdmittedPatient[] {
  return patients.filter((p) => p.element === element);
}

export function ghFilterPatientsByWard(patients: AdmittedPatient[], wardId: string): AdmittedPatient[] {
  return patients.filter((p) => p.wardId === wardId);
}

export function ghAssignDoctorToPatient(
  state: GhostHospitalState,
  doctorId: string,
  instanceId: string
): GhostHospitalState | null {
  const patient = state.admittedPatients.find((p) => p.instanceId === instanceId);
  const doctor = state.hiredDoctors.find((d) => d.doctorId === doctorId);
  const docDef = GH_DOCTORS.find((d) => d.id === doctorId);

  if (!patient || !doctor || !docDef) return null;

  const currentAssignments = state.admittedPatients.filter((p) => p.doctorId === doctorId).length;
  if (currentAssignments >= docDef.maxPatients) return null;

  return {
    ...state,
    admittedPatients: state.admittedPatients.map((p) =>
      p.instanceId === instanceId ? { ...p, doctorId } : p
    ),
  };
}

export function ghUnassignDoctorFromPatient(
  state: GhostHospitalState,
  instanceId: string
): GhostHospitalState {
  return {
    ...state,
    admittedPatients: state.admittedPatients.map((p) =>
      p.instanceId === instanceId ? { ...p, doctorId: null } : p
    ),
  };
}

export function ghGetHospitalCapacity(state: GhostHospitalState): number {
  let total = 0;
  for (const wardId of state.unlockedWards) {
    const wardDef = GH_WARDS.find((w) => w.id === wardId);
    if (wardDef) total += wardDef.capacity;
  }
  return total;
}

export function ghIsHospitalFull(state: GhostHospitalState): boolean {
  return state.admittedPatients.length >= ghGetHospitalCapacity(state);
}

// ============================================================================
// § 9  Default Export
// ============================================================================

export default useGhostHospital;
