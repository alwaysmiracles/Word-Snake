// =============================================================================
// moon-temple-wire.ts — Moon Temple (Lunar Mystery Temple) Game System Wire
// An ancient moon temple themed module for Word Snake game. Provides game data
// and a useState-based hook for managing 8 chambers, 12 lunar artifacts, moon
// phase system, 10 deities, 40 riddles, 8 rituals, rank 1-50 progression,
// lunar calendar events, meditation mechanics, and 15 achievements.
// =============================================================================

import React, { useState } from 'react';

// =============================================================================
// Types & Interfaces
// =============================================================================

export type MT2ChamberId =
  | 'moonlight_hall'
  | 'crescent_chamber'
  | 'eclipse_vault'
  | 'lunar_library'
  | 'silver_shrine'
  | 'shadow_atrium'
  | 'zenith_spire'
  | 'abyssal_crypt';

export type MT2ArtifactRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type MT2PhaseId =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

export type MT2DeityDomain =
  | 'wisdom'
  | 'harvest'
  | 'shadow'
  | 'light'
  | 'time'
  | 'dreams'
  | 'tides'
  | 'war'
  | 'healing'
  | 'fate';

export type MT2RiddleDifficulty = 'novice' | 'adept' | 'master' | 'oracle';

export type MT2RitualId =
  | 'full_moon_communion'
  | 'new_moon_renewal'
  | 'eclipse_seance'
  | 'crescent_blessing'
  | 'harvest_moon_feast'
  | 'silver_lantern_vigil'
  | 'shadow_walk_rite'
  | 'zenith_convergence';

export type MT2LunarEvent =
  | 'blood_moon'
  | 'blue_moon'
  | 'harvest_moon'
  | 'super_moon'
  | 'lunar_eclipse'
  | 'wolf_moon'
  | 'worm_moon'
  | 'pink_moon';

export type MT2MeditationPosture =
  | 'lotus'
  | 'seated'
  | 'standing'
  | 'kneeling'
  | 'lying';

export type MT2SerenityLevel = 'restless' | 'calm' | 'peaceful' | 'serene' | 'transcendent';

export type MT2RankTitle =
  | 'Initiate'
  | 'Acolyte'
  | 'Novice'
  | 'Disciple'
  | 'Brother'
  | 'Sister'
  | 'Scholar'
  | 'Keeper'
  | 'Warden'
  | 'Elder'
  | 'Sage'
  | 'Oracle'
  | 'Hierophant'
  | 'Pontifex'
  | 'Luminary';

export interface MT2ChamberDef {
  id: MT2ChamberId;
  name: string;
  nameZh: string;
  description: string;
  unlockRank: number;
  moonPhaseBonus: MT2PhaseId;
  bonusDescription: string;
  color: string;
  ambientSound: string;
  secretReward: string;
}

export interface MT2ArtifactDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  rarity: MT2ArtifactRarity;
  phaseBonus: MT2PhaseId;
  phaseMultiplier: number;
  basePower: number;
  lore: string;
  effect: string;
  chamberId: MT2ChamberId;
}

export interface MT2MoonPhaseDef {
  id: MT2PhaseId;
  name: string;
  nameZh: string;
  index: number;
  description: string;
  powerMultiplier: number;
  meditationBonus: number;
  riddleHintChance: number;
  color: string;
  icon: string;
}

export interface MT2DeityDef {
  id: string;
  name: string;
  nameZh: string;
  domain: MT2DeityDomain;
  description: string;
  blessing: string;
  offeringCost: number;
  devotionBonus: string;
  rankRequired: number;
  symbol: string;
}

export interface MT2RiddleDef {
  id: string;
  question: string;
  answer: string;
  difficulty: MT2RiddleDifficulty;
  chamberId: MT2ChamberId;
  hint: string;
  lore: string;
  rewardExp: number;
  rewardDevotion: number;
}

export interface MT2RitualDef {
  id: MT2RitualId;
  name: string;
  nameZh: string;
  description: string;
  phaseRequired: MT2PhaseId | null;
  rankRequired: number;
  devotionCost: number;
  durationCycles: number;
  rewards: {
    exp: number;
    devotion: number;
    artifactChance: number;
    meditationBoost: number;
  };
  chant: string;
}

export interface MT2LunarEventDef {
  id: MT2LunarEvent;
  name: string;
  nameZh: string;
  description: string;
  bonusMultiplier: number;
  durationDays: number;
  specialEffect: string;
  color: string;
}

export interface MT2RankDef {
  rank: number;
  title: MT2RankTitle;
  expRequired: number;
  unlockedChambers: MT2ChamberId[];
  unlockedRituals: MT2RitualId[];
  devotionBonus: number;
  meditationCapIncrease: number;
  riddleBonusExp: number;
}

export interface MT2AchievementDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardExp: number;
  rewardDevotion: number;
  rewardTitle: string | null;
}

export interface MT2MeditationSessionDef {
  id: string;
  name: string;
  posture: MT2MeditationPosture;
  baseSerenity: number;
  phaseBonus: MT2PhaseId | null;
  description: string;
  wordLengthTarget: number;
  wordCountTarget: number;
}

export interface MT2ArtifactState {
  artifactId: string;
  discovered: boolean;
  discoveredAt: number | null;
  equipped: boolean;
  timesUsed: number;
}

export interface MT2DeityState {
  deityId: string;
  devotion: number;
  blessingActive: boolean;
  blessingExpiry: number | null;
  totalOfferings: number;
  lastOffering: number | null;
}

export interface MT2RiddleState {
  riddleId: string;
  solved: boolean;
  solvedAt: number | null;
  attempts: number;
  hintUsed: boolean;
}

export interface MT2RitualState {
  ritualId: MT2RitualId;
  lastPerformed: number | null;
  timesPerformed: number;
  cooldownRemaining: number;
}

export interface MT2ChamberState {
  chamberId: MT2ChamberId;
  unlocked: boolean;
  unlockedAt: number | null;
  visitCount: number;
  lastVisit: number | null;
  explorationProgress: number;
}

export interface MT2AchievementState {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface MT2MoonTempleState {
  mt2Rank: number;
  mt2Exp: number;
  mt2Devotion: number;
  mt2TotalDevotion: number;
  mt2MoonPhase: number;
  mt2MoonPhaseName: string;
  mt2DayCounter: number;
  mt2LunarCycle: number;
  mt2CurrentChamber: MT2ChamberId | null;
  mt2Chambers: MT2ChamberState[];
  mt2Artifacts: MT2ArtifactState[];
  mt2Deities: MT2DeityState[];
  mt2Riddles: MT2RiddleState[];
  mt2Rituals: MT2RitualState[];
  mt2Achievements: MT2AchievementState[];
  mt2ActiveBlessing: string | null;
  mt2ActiveEvent: MT2LunarEvent | null;
  mt2EventDaysRemaining: number;
  mt2MeditationSessionsCompleted: number;
  mt2TotalSerenity: number;
  mt2BestSerenity: number;
  mt2CurrentSerenity: number;
  mt2MeditationStreak: number;
  mt2LastMeditationDate: string | null;
  mt2DailyGazingCompleted: boolean;
  mt2DailyGazingStreak: number;
  mt2LastGazingDate: string | null;
  mt2TotalRiddlesSolved: number;
  mt2TotalRitualsPerformed: number;
  mt2TotalArtifactsFound: number;
  mt2TotalOfferingsMade: number;
  mt2TotalMeditationsCompleted: number;
  mt2TotalChamberVisits: number;
  mt2WordsFormedDuringMeditation: number;
  mt2PerfectMeditations: number;
}

export interface MT2MoonTempleActions {
  mt2GetLevel: () => number;
  mt2GetRankTitle: () => MT2RankTitle;
  mt2GetMana: () => number;
  mt2GetSerenity: () => number;
  mt2GetSerenityLevel: () => MT2SerenityLevel;
  mt2GetCurrentPhase: () => MT2MoonPhaseDef;
  mt2GetCurrentPhaseIndex: () => number;
  mt2AdvancePhase: () => void;
  mt2AdvanceDay: () => void;
  mt2AddExp: (amount: number) => void;
  mt2AddDevotion: (amount: number) => void;
  mt2SpendDevotion: (amount: number) => boolean;
  mt2EnterChamber: (chamberId: MT2ChamberId) => boolean;
  mt2LeaveChamber: () => void;
  mt2ExploreChamber: (progress: number) => boolean;
  mt2DiscoverArtifact: (artifactId: string) => boolean;
  mt2EquipArtifact: (artifactId: string) => boolean;
  mt2UnequipArtifact: (artifactId: string) => void;
  mt2GetEquippedArtifacts: () => MT2ArtifactState[];
  mt2GetArtifactPower: () => number;
  mt2OfferToDeity: (deityId: string) => boolean;
  mt2ActivateBlessing: (deityId: string) => boolean;
  mt2GetDeityDevotion: (deityId: string) => number;
  mt2GetBlessingStatus: () => { deityId: string; remaining: number } | null;
  mt2SolveRiddle: (riddleId: string, answer: string) => boolean;
  mt2UseHint: (riddleId: string) => string | null;
  mt2GetRiddleProgress: () => { solved: number; total: number };
  mt2PerformRitual: (ritualId: MT2RitualId) => boolean;
  mt2GetRitualCooldown: (ritualId: MT2RitualId) => number;
  mt2CanPerformRitual: (ritualId: MT2RitualId) => boolean;
  mt2TriggerLunarEvent: (eventId: MT2LunarEvent) => void;
  mt2GetActiveEvent: () => MT2LunarEventDef | null;
  mt2GetEventDaysRemaining: () => number;
  mt2StartMeditation: (sessionId: string) => void;
  mt2RecordWordFormed: () => void;
  mt2EndMeditation: (serenity: number) => void;
  mt2CompleteDailyGazing: () => boolean;
  mt2GetGazingStreak: () => number;
  mt2GetMeditationStreak: () => number;
  mt2GetTodaysGazing: () => boolean;
  mt2CheckAchievements: () => string[];
  mt2ClaimAchievement: (achievementId: string) => boolean;
  mt2GetUnlockedAchievements: () => string[];
  mt2GetChamberProgress: (chamberId: MT2ChamberId) => MT2ChamberState | null;
  mt2GetMoonPhaseBonus: (phaseId: MT2PhaseId) => number;
  mt2GetPhaseMultiplier: () => number;
  mt2GetRankProgress: () => { current: number; required: number; percent: number };
  mt2ResetProgress: () => void;
  mt2ForcePhase: (phaseIndex: number) => void;
}

// =============================================================================
// Color Constants
// =============================================================================

export const MT2_COLOR_MOONLIGHT = '#F0E68C';
export const MT2_COLOR_SILVER = '#C0C0C0';
export const MT2_COLOR_SHADOW = '#2F2F4F';
export const MT2_COLOR_ECLIPSE = '#8B0000';
export const MT2_COLOR_VOID = '#0A0A1A';
export const MT2_COLOR_CRYSTAL = '#E0E0FF';
export const MT2_COLOR_GOLD = '#FFD700';
export const MT2_COLOR_TEAL = '#008B8B';
export const MT2_COLOR_IVORY = '#FFFFF0';
export const MT2_COLOR_OBSIDIAN = '#1C1C2E';
export const MT2_COLOR_BLOOD = '#DC143C';
export const MT2_COLOR_HARVEST = '#DAA520';
export const MT2_COLOR_BLUE = '#4169E1';
export const MT2_COLOR_AURORA = '#7FFFD4';
export const MT2_COLOR_TWILIGHT = '#6A5ACD';

// =============================================================================
// MT2_CHAMBERS — 8 Temple Chambers
// =============================================================================

export const MT2_CHAMBERS: MT2ChamberDef[] = [
  {
    id: 'moonlight_hall',
    name: 'Moonlight Hall',
    nameZh: '月光大厅',
    description: 'The grand entrance hall of the Moon Temple, where moonbeams pour through crystalline skylights and dance across silver-paved floors. Ancient murals depict the creation of the first moon. New initiates begin their journey here, learning the basics of lunar meditation and temple lore.',
    unlockRank: 1,
    moonPhaseBonus: 'full_moon',
    bonusDescription: 'During Full Moon: All experience gains doubled in this chamber',
    color: MT2_COLOR_MOONLIGHT,
    ambientSound: 'gentle_chimes',
    secretReward: 'Lunar Compass',
  },
  {
    id: 'crescent_chamber',
    name: 'Crescent Chamber',
    nameZh: '新月密室',
    description: 'A crescent-shaped room where silver light refracts through prismatic crystals, creating rainbow patterns on curved walls. The chamber is used for waxing rituals, where monks set intentions that grow with the moon. The air hums with potential energy.',
    unlockRank: 3,
    moonPhaseBonus: 'waxing_crescent',
    bonusDescription: 'During Waxing Crescent: Meditation serenity gains +50%',
    color: MT2_COLOR_SILVER,
    ambientSound: 'soft_harp',
    secretReward: 'Crescent Amulet',
  },
  {
    id: 'eclipse_vault',
    name: 'Eclipse Vault',
    nameZh: '日食金库',
    description: 'A subterranean vault that only fully reveals its contents during lunar eclipses. Shadow and light intertwine in impossible geometries within its walls. The most dangerous artifacts are sealed here, guarded by eclipse-born entities.',
    unlockRank: 10,
    moonPhaseBonus: 'new_moon',
    bonusDescription: 'During New Moon: Rare artifact discovery chance tripled',
    color: MT2_COLOR_ECLIPSE,
    ambientSound: 'deep_hum',
    secretReward: 'Eclipse Sigil',
  },
  {
    id: 'lunar_library',
    name: 'Lunar Library',
    nameZh: '月神藏书阁',
    description: 'An infinite library whose shelves extend into other dimensions. Books float between shelves, their pages whispering forgotten knowledge. The library contains the accumulated wisdom of ten thousand lunar cycles, including riddles that guard its deepest secrets.',
    unlockRank: 5,
    moonPhaseBonus: 'waxing_gibbous',
    bonusDescription: 'During Waxing Gibbous: Riddle hint chance increased to 80%',
    color: MT2_COLOR_CRYSTAL,
    ambientSound: 'turning_pages',
    secretReward: 'Moon Tome of Ages',
  },
  {
    id: 'silver_shrine',
    name: 'Silver Shrine',
    nameZh: '银月神龛',
    description: 'A sacred shrine dedicated to all ten moon deities, where offerings of devotion are placed upon a massive silver altar. The shrine pulses with divine lunar energy, and the statues of deities shift positions based on the current moon phase.',
    unlockRank: 7,
    moonPhaseBonus: 'full_moon',
    bonusDescription: 'During Full Moon: All devotion gains doubled at the shrine',
    color: MT2_COLOR_SILVER,
    ambientSound: 'divine_choir',
    secretReward: 'Silver Deity Mask',
  },
  {
    id: 'shadow_atrium',
    name: 'Shadow Atrium',
    nameZh: '暗影中庭',
    description: 'An open-air atrium where shadows are cast by moonlight in patterns that shift with the lunar cycle. Advanced monks practice shadow meditation here, learning to read the future in the interplay of light and darkness. The shadows sometimes move on their own.',
    unlockRank: 15,
    moonPhaseBonus: 'waning_gibbous',
    bonusDescription: 'During Waning Gibbous: Shadow reading accuracy +40%',
    color: MT2_COLOR_SHADOW,
    ambientSound: 'whispering_wind',
    secretReward: 'Shadow Cloak',
  },
  {
    id: 'zenith_spire',
    name: 'Zenith Spire',
    nameZh: '月巅峰塔',
    description: 'The tallest tower of the Moon Temple, piercing the night sky to touch the moon itself. At its apex, lunar energy is strongest, and only the most devoted monks can withstand the overwhelming celestial power that flows through its crystalline structure.',
    unlockRank: 25,
    moonPhaseBonus: 'first_quarter',
    bonusDescription: 'During First Quarter: Ritual power and devotion gains +75%',
    color: MT2_COLOR_TEAL,
    ambientSound: 'celestial_resonance',
    secretReward: 'Zenith Crown',
  },
  {
    id: 'abyssal_crypt',
    name: 'Abyssal Crypt',
    nameZh: '深渊墓穴',
    description: 'The deepest and most forbidden chamber of the temple, where ancient lunar entities slumber beneath layers of enchanted stone. The crypt holds the original temple foundations and the sealed records of the first moon monks. Only legends have explored its furthest depths.',
    unlockRank: 35,
    moonPhaseBonus: 'waning_crescent',
    bonusDescription: 'During Waning Crescent: Secret passages revealed for exploration',
    color: MT2_COLOR_VOID,
    ambientSound: 'ancient_drone',
    secretReward: 'Abyssal Key',
  },
];

// =============================================================================
// MT2_ARTIFACTS — 12 Lunar Artifacts
// =============================================================================

export const MT2_ARTIFACTS: MT2ArtifactDef[] = [
  {
    id: 'art_moonstone_pendant',
    name: 'Moonstone Pendant',
    nameZh: '月光石吊坠',
    description: 'A simple pendant carved from a single moonstone that glows with inner luminescence. Worn by temple initiates as a sign of their connection to lunar energies. It hums softly during the waxing phase.',
    rarity: 'common',
    phaseBonus: 'waxing_crescent',
    phaseMultiplier: 1.3,
    basePower: 5,
    lore: 'The first moonstone ever mined by human hands was shaped into this pendant by the founder of the Moon Temple.',
    effect: '+10% meditation serenity gain',
    chamberId: 'moonlight_hall',
  },
  {
    id: 'art_crescent_blade',
    name: 'Crescent Blade',
    nameZh: '新月之刃',
    description: 'A curved dagger shaped like a crescent moon, its edge forever sharp and gleaming with silver light. It cuts through darkness and illusion alike, revealing hidden truths beneath the surface.',
    rarity: 'uncommon',
    phaseBonus: 'first_quarter',
    phaseMultiplier: 1.5,
    basePower: 15,
    lore: 'Forged during a total lunar eclipse, the Crescent Blade has severed the bonds of a thousand curses.',
    effect: '+20% riddle solve chance',
    chamberId: 'crescent_chamber',
  },
  {
    id: 'art_eclipse_orb',
    name: 'Eclipse Orb',
    nameZh: '日食宝珠',
    description: 'A sphere of absolute blackness that absorbs all light around it. Within its depths, one can see the shadow of a future that has not yet occurred. Staring too long into its void is not recommended.',
    rarity: 'rare',
    phaseBonus: 'new_moon',
    phaseMultiplier: 2.0,
    basePower: 30,
    lore: 'Created when a moon deity shed a tear during a rare hybrid eclipse, the Eclipse Orb contains the memory of light being consumed.',
    effect: '+35% artifact discovery chance',
    chamberId: 'eclipse_vault',
  },
  {
    id: 'art_silver_scroll',
    name: 'Silver Scroll',
    nameZh: '银月卷轴',
    description: 'A scroll made of thin silver sheets inscribed with moon runes. When unrolled beneath moonlight, the runes float into the air and arrange themselves into answers to questions the reader has not yet asked.',
    rarity: 'uncommon',
    phaseBonus: 'waxing_gibbous',
    phaseMultiplier: 1.4,
    basePower: 12,
    lore: 'The Silver Scroll was written by a blind monk who could only see through the light of the full moon.',
    effect: '+25% riddle hint availability',
    chamberId: 'lunar_library',
  },
  {
    id: 'art_deity_mask',
    name: 'Deity Mask',
    nameZh: '神明面具',
    description: 'A blank silver mask that reshapes itself to resemble whichever moon deity the wearer is most devoted to. While worn, the mask grants a fraction of that deity\'s power and whispers their divine guidance.',
    rarity: 'rare',
    phaseBonus: 'full_moon',
    phaseMultiplier: 1.8,
    basePower: 25,
    lore: 'Each moon deity contributed a fragment of their essence to create this mask for their most devoted follower.',
    effect: '+40% devotion gain from offerings',
    chamberId: 'silver_shrine',
  },
  {
    id: 'art_shadow_cloak',
    name: 'Shadow Cloak',
    nameZh: '暗影斗篷',
    description: 'A cloak woven from pure shadow that does not cast its own shadow. The wearer becomes nearly invisible in moonlight and can step between shadows as if walking through doorways.',
    rarity: 'rare',
    phaseBonus: 'waning_gibbous',
    phaseMultiplier: 1.7,
    basePower: 22,
    lore: 'The Shadow Cloak was a gift from the deity of shadow to the first monk who proved worthy of the Shadow Atrium.',
    effect: '+30% exploration progress speed',
    chamberId: 'shadow_atrium',
  },
  {
    id: 'art_zenith_crown',
    name: 'Zenith Crown',
    nameZh: '巅峰王冠',
    description: 'A delicate crown of interlocking crescent moons that floats just above the wearer\'s head. It channels lunar energy directly from the moon, amplifying all temple abilities to their maximum potential.',
    rarity: 'epic',
    phaseBonus: 'first_quarter',
    phaseMultiplier: 2.2,
    basePower: 50,
    lore: 'The Zenith Crown was forged at the exact moment the moon reached its highest point in the sky over the temple.',
    effect: '+50% ritual power and rewards',
    chamberId: 'zenith_spire',
  },
  {
    id: 'art_abyssal_key',
    name: 'Abyssal Key',
    nameZh: '深渊之钥',
    description: 'An ancient key made of unknown dark metal that radiates cold. It opens doors that do not exist, revealing hidden passages within the temple that lead to chambers outside of normal space and time.',
    rarity: 'epic',
    phaseBonus: 'waning_crescent',
    phaseMultiplier: 2.0,
    basePower: 45,
    lore: 'The Abyssal Key predates the temple itself, suggesting the crypt was built around whatever door it opens.',
    effect: 'Reveals hidden chambers and secrets',
    chamberId: 'abyssal_crypt',
  },
  {
    id: 'art_lunar_compass',
    name: 'Lunar Compass',
    nameZh: '月光罗盘',
    description: 'A compass whose needle points not north but toward the moon, regardless of time of day or weather. It guides the lost through the temple\'s labyrinthine corridors and warns of approaching lunar events.',
    rarity: 'common',
    phaseBonus: 'full_moon',
    phaseMultiplier: 1.2,
    basePower: 8,
    lore: 'Crafted by the first temple cartographer who mapped every corridor during a single full moon night.',
    effect: 'Prevents getting lost in chambers',
    chamberId: 'moonlight_hall',
  },
  {
    id: 'art_crescent_amulet',
    name: 'Crescent Amulet',
    nameZh: '新月护符',
    description: 'An amulet in the shape of a perfect crescent that changes its curve to match the current moon phase. It stores lunar energy during the night and releases it during meditation, providing a steady calm.',
    rarity: 'uncommon',
    phaseBonus: 'waxing_crescent',
    phaseMultiplier: 1.4,
    basePower: 14,
    lore: 'The amulet was blessed by all ten deities simultaneously during a celestial alignment that occurs once every thousand years.',
    effect: '+20% meditation streak preservation',
    chamberId: 'crescent_chamber',
  },
  {
    id: 'art_moon_tome',
    name: 'Moon Tome of Ages',
    nameZh: '月神年代记',
    description: 'A thick book bound in moonlit leather whose pages contain the complete history of the Moon Temple. New entries appear automatically as events unfold, and some pages show events that have not yet happened.',
    rarity: 'legendary',
    phaseBonus: 'full_moon',
    phaseMultiplier: 3.0,
    basePower: 100,
    lore: 'The Moon Tome writes itself. No author has ever been identified, and attempts to write in it by hand are absorbed into its existing text.',
    effect: '+100% experience gain during Full Moon',
    chamberId: 'lunar_library',
  },
  {
    id: 'art_eclipse_sigil',
    name: 'Eclipse Sigil',
    nameZh: '日食符印',
    description: 'A circular sigil that contains both light and darkness in perfect balance. When activated during an eclipse, it grants temporary omniscience within the temple, revealing every secret and hidden object simultaneously.',
    rarity: 'legendary',
    phaseBonus: 'new_moon',
    phaseMultiplier: 2.5,
    basePower: 80,
    lore: 'The Eclipse Sigil was the first artifact ever created, born at the moment the universe first experienced darkness.',
    effect: 'Temporary omniscience during eclipses',
    chamberId: 'eclipse_vault',
  },
];

// =============================================================================
// MT2_MOON_PHASES — 8 Lunar Phases
// =============================================================================

export const MT2_MOON_PHASES: MT2MoonPhaseDef[] = [
  {
    id: 'new_moon',
    name: 'New Moon',
    nameZh: '新月',
    index: 0,
    description: 'The moon hides its face in shadow, a time of darkness and introspection. The temple enters its quietest phase, but hidden things become visible to those who know how to look. Eclipse artifacts resonate with unseen power.',
    powerMultiplier: 0.5,
    meditationBonus: 0,
    riddleHintChance: 0.1,
    color: MT2_COLOR_VOID,
    icon: '🌑',
  },
  {
    id: 'waxing_crescent',
    name: 'Waxing Crescent',
    nameZh: '蛾眉月',
    index: 1,
    description: 'A slender crescent emerges from the darkness, carrying the promise of growth. Meditation is especially powerful during this phase as the growing light mirrors the expanding awareness of the mind. Intentions set now carry extra weight.',
    powerMultiplier: 0.75,
    meditationBonus: 50,
    riddleHintChance: 0.25,
    color: '#2D2D5E',
    icon: '🌒',
  },
  {
    id: 'first_quarter',
    name: 'First Quarter',
    nameZh: '上弦月',
    index: 2,
    description: 'Half the moon shines with determined light, a time for decisive action and overcoming obstacles. Rituals performed now carry the strength of resolve, and the temple\'s barriers weaken for those of sufficient rank.',
    powerMultiplier: 1.0,
    meditationBonus: 20,
    riddleHintChance: 0.35,
    color: MT2_COLOR_TWILIGHT,
    icon: '🌓',
  },
  {
    id: 'waxing_gibbous',
    name: 'Waxing Gibbous',
    nameZh: '盈凸月',
    index: 3,
    description: 'The moon approaches fullness, radiating refining energy. Scholars and riddle-solvers find their minds sharpened, and the Lunar Library opens its deeper collections. Details and patterns become visible that are normally hidden.',
    powerMultiplier: 1.25,
    meditationBonus: 30,
    riddleHintChance: 0.5,
    color: '#7B7BB5',
    icon: '🌔',
  },
  {
    id: 'full_moon',
    name: 'Full Moon',
    nameZh: '满月',
    index: 4,
    description: 'The moon blazes in its full glory, flooding the temple with overwhelming lunar power. All abilities are amplified, deities are most receptive to offerings, and the veil between worlds thins to its most transparent. The pinnacle of the lunar cycle.',
    powerMultiplier: 2.0,
    meditationBonus: 100,
    riddleHintChance: 0.6,
    color: MT2_COLOR_MOONLIGHT,
    icon: '🌕',
  },
  {
    id: 'waning_gibbous',
    name: 'Waning Gibbous',
    nameZh: '亏凸月',
    index: 5,
    description: 'The moon begins its descent, sharing accumulated wisdom. The Shadow Atrium reveals its deeper truths, and monks reflect on lessons learned. Gratitude and understanding deepen as the light slowly fades.',
    powerMultiplier: 1.25,
    meditationBonus: 25,
    riddleHintChance: 0.4,
    color: MT2_COLOR_TWILIGHT,
    icon: '🌖',
  },
  {
    id: 'last_quarter',
    name: 'Last Quarter',
    nameZh: '下弦月',
    index: 6,
    description: 'Half the moon remains, a mirror for release and forgiveness. Old attachments are shed, negative energy is cleared, and monks prepare for renewal. The temple performs its cleansing rituals during this introspective phase.',
    powerMultiplier: 1.0,
    meditationBonus: 15,
    riddleHintChance: 0.3,
    color: '#5555A0',
    icon: '🌗',
  },
  {
    id: 'waning_crescent',
    name: 'Waning Crescent',
    nameZh: '残月',
    index: 7,
    description: 'The last whisper of moonlight before darkness returns. Surrender and rest prepare the temple for rebirth. The Abyssal Crypt opens its most secret passages, and the deepest meditations are achieved in this twilight between cycles.',
    powerMultiplier: 0.75,
    meditationBonus: 10,
    riddleHintChance: 0.2,
    color: '#2D2D5E',
    icon: '🌘',
  },
];

// =============================================================================
// MT2_DEITIES — 10 Moon Deities
// =============================================================================

export const MT2_DEITIES: MT2DeityDef[] = [
  {
    id: 'deity_selene',
    name: 'Selene',
    nameZh: '塞勒涅',
    domain: 'light',
    description: 'The Titaness of the Moon who drives her silver chariot across the night sky. She is the primary deity of the Moon Temple, embodying pure lunar radiance and the life-giving power of moonlight.',
    blessing: 'Silver Radiance — All moonlight-based actions gain 30% effectiveness for 3 days',
    offeringCost: 10,
    devotionBonus: '+5 base meditation serenity',
    rankRequired: 1,
    symbol: '☽',
  },
  {
    id: 'deity_hecate',
    name: 'Hecate',
    nameZh: '赫卡忒',
    domain: 'shadow',
    description: 'The goddess of crossroads, ghosts, and the dark side of the moon. She guards the boundaries between worlds and is the patron of the Eclipse Vault and Shadow Atrium. Her wisdom comes from embracing darkness.',
    blessing: 'Shadow Sight — Can see hidden artifacts and riddle clues for 5 days',
    offeringCost: 20,
    devotionBonus: '+15% artifact discovery chance',
    rankRequired: 10,
    symbol: '☤',
  },
  {
    id: 'deity_thoth',
    name: 'Thoth',
    nameZh: '托特',
    domain: 'wisdom',
    description: 'The ibis-headed god of knowledge, writing, and lunar measurement. He is the keeper of the Lunar Library and the patron of scholars and riddle-solvers. He invented the lunar calendar and the art of meditation.',
    blessing: 'Wisdom of Ages — Riddle hint chance doubles for 7 days',
    offeringCost: 15,
    devotionBonus: '+20% riddle solve bonus experience',
    rankRequired: 5,
    symbol: '𓅃',
  },
  {
    id: 'deity_chang_e',
    name: "Chang'e",
    nameZh: '嫦娥',
    domain: 'harvest',
    description: 'The Chinese moon goddess who dwells on the moon with her jade rabbit companion. She represents abundance, renewal, and the cyclical nature of life. Her blessing ensures bountiful harvests of lunar energy.',
    blessing: 'Moonlight Harvest — Devotion gains tripled for 4 days',
    offeringCost: 12,
    devotionBonus: '+10% devotion gain from all sources',
    rankRequired: 3,
    symbol: '🐇',
  },
  {
    id: 'deity_tsukuyomi',
    name: 'Tsukuyomi',
    nameZh: '月读',
    domain: 'time',
    description: 'The Japanese moon god born from the right eye of the creator deity Izanagi. He governs the passage of lunar time and the rhythm of the phases. His calm demeanor masks infinite patience.',
    blessing: 'Temporal Stasis — Ritual cooldowns reduced by 50% for 3 days',
    offeringCost: 25,
    devotionBonus: '-20% ritual cooldown duration',
    rankRequired: 15,
    symbol: '神',
  },
  {
    id: 'deity_morpheus',
    name: 'Morpheus',
    nameZh: '摩尔甫斯',
    domain: 'dreams',
    description: 'The god of dreams who shapes the visions that come during lunar meditation. He weaves prophecies and warnings into the dreams of sleeping monks, and his realm borders the deepest meditative states.',
    blessing: 'Lucid Dreaming — Meditation serenity gains doubled for 5 days',
    offeringCost: 18,
    devotionBonus: '+25% meditation serenity gain',
    rankRequired: 7,
    symbol: '💭',
  },
  {
    id: 'deity_oceanus',
    name: 'Oceanus',
    nameZh: '俄刻阿诺斯',
    domain: 'tides',
    description: 'The Titan god of the ocean who controls the tides in response to the moon. His power flows through every chamber of the temple, and his blessing ensures that the flow of energy remains strong and steady.',
    blessing: 'Tidal Surge — All progression gains boosted by 40% for 3 days',
    offeringCost: 22,
    devotionBonus: '+15% experience gain',
    rankRequired: 12,
    symbol: '🌊',
  },
  {
    id: 'deity_menum',
    name: 'Menum',
    nameZh: '门努',
    domain: 'war',
    description: 'The ancient lunar war deity who channels the fierce energy of the blood moon. He is called upon when monks face great challenges, granting strength and determination. His temple lies in the deepest part of the crypt.',
    blessing: 'Blood Fury — Rank progression accelerated by 50% for 3 days',
    offeringCost: 30,
    devotionBonus: '+20% experience gain from challenges',
    rankRequired: 20,
    symbol: '⚔',
  },
  {
    id: 'deity_isha',
    name: 'Isha',
    nameZh: '伊莎',
    domain: 'healing',
    description: 'The Arabian moon goddess of healing and restoration. Her gentle light mends wounds of body and spirit, and her followers are known for their longevity and peace. She tends the Silver Shrine\'s healing gardens.',
    blessing: 'Lunar Restoration — Meditation streak preserved on missed days for 5 days',
    offeringCost: 14,
    devotionBonus: '+10 meditation streak forgiveness',
    rankRequired: 5,
    symbol: '✨',
  },
  {
    id: 'deity_nyx',
    name: 'Nyx',
    nameZh: '倪克斯',
    domain: 'fate',
    description: 'The primordial goddess of night who existed before the moon was born. She weaves the threads of fate that connect all living things, and her prophecies are absolute. Only the highest-ranking monks dare invoke her name.',
    blessing: 'Fate Unveiled — All achievement progress revealed for 7 days',
    offeringCost: 50,
    devotionBonus: '+30% achievement reward bonuses',
    rankRequired: 30,
    symbol: '⭐',
  },
];

// =============================================================================
// MT2_RIDDLES — 40 Moon Riddles (10 per Difficulty Tier)
// =============================================================================

export const MT2_RIDDLES: MT2RiddleDef[] = [
  // ─── Novice (10) ────────────────────────────────────────────────────────────
  {
    id: 'riddle_n_01',
    question: 'I wax and wane but never die. I pull the oceans but have no hands. What am I?',
    answer: 'moon',
    difficulty: 'novice',
    chamberId: 'moonlight_hall',
    hint: 'Look up at the night sky...',
    lore: 'The first riddle ever posed in the Moon Temple, carved into the entrance arch.',
    rewardExp: 10,
    rewardDevotion: 2,
  },
  {
    id: 'riddle_n_02',
    question: 'I am silver but not a coin. I am round but not a wheel. I light the dark but am not fire. What am I?',
    answer: 'moonstone',
    difficulty: 'novice',
    chamberId: 'moonlight_hall',
    hint: 'A gemstone connected to lunar power...',
    lore: 'Initiates must solve this riddle to receive their first moonstone pendant.',
    rewardExp: 10,
    rewardDevotion: 2,
  },
  {
    id: 'riddle_n_03',
    question: 'Born in darkness, growing in light, half of me is always hidden from sight. What am I?',
    answer: 'crescent',
    difficulty: 'novice',
    chamberId: 'crescent_chamber',
    hint: 'Think of the shape of a young moon...',
    lore: 'This riddle is inscribed on the walls of the Crescent Chamber in silver ink.',
    rewardExp: 12,
    rewardDevotion: 2,
  },
  {
    id: 'riddle_n_04',
    question: 'I have no voice, yet I speak to the tides. I have no legs, yet I travel across the sky. What am I?',
    answer: 'moon',
    difficulty: 'novice',
    chamberId: 'moonlight_hall',
    hint: 'I follow the sun across the sky, but only at night...',
    lore: 'A variation of this riddle appears in over fifty different ancient cultures.',
    rewardExp: 10,
    rewardDevotion: 2,
  },
  {
    id: 'riddle_n_05',
    question: 'What has phases like a life cycle, pulls the sea, and hides its face once a month?',
    answer: 'lunar cycle',
    difficulty: 'novice',
    chamberId: 'lunar_library',
    hint: 'It takes about 29 days to complete...',
    lore: 'The simplest riddle in the Lunar Library, designed to welcome new scholars.',
    rewardExp: 15,
    rewardDevotion: 3,
  },
  {
    id: 'riddle_n_06',
    question: 'I am the rabbit on the moon, pounding what into cakes? The answer is rice but also this celestial dust.',
    answer: 'stardust',
    difficulty: 'novice',
    chamberId: 'silver_shrine',
    hint: 'The jade rabbit\'s mortar holds something from the sky...',
    lore: "Chang'e's companion has been making these cakes since the dawn of the lunar age.",
    rewardExp: 12,
    rewardDevotion: 3,
  },
  {
    id: 'riddle_n_07',
    question: 'I mirror the sun but am not the sun. I glow at night but create no heat. What reflects from my surface?',
    answer: 'sunlight',
    difficulty: 'novice',
    chamberId: 'moonlight_hall',
    hint: 'Without this, I would be completely dark...',
    lore: 'A physics riddle disguised as temple wisdom, teaching initiates about lunar mechanics.',
    rewardExp: 10,
    rewardDevotion: 2,
  },
  {
    id: 'riddle_n_08',
    question: 'In the temple I am silver, in the sky I am white, in shadow I am hidden, in eclipse I am red. What am I?',
    answer: 'moonlight',
    difficulty: 'novice',
    chamberId: 'crescent_chamber',
    hint: 'It is the light that gives the temple its power...',
    lore: 'This riddle has four correct answers visible in different temple chambers.',
    rewardExp: 12,
    rewardDevotion: 2,
  },
  {
    id: 'riddle_n_09',
    question: 'I have craters but am not a wound. I have seas but no water. I have mountains but no trees. What am I?',
    answer: 'moon',
    difficulty: 'novice',
    chamberId: 'moonlight_hall',
    hint: 'Astronauts have walked on my surface...',
    lore: 'The most popular novice riddle, solved by 99% of temple initiates on their first attempt.',
    rewardExp: 10,
    rewardDevotion: 2,
  },
  {
    id: 'riddle_n_10',
    question: 'What phase of the moon comes between the first quarter and the full moon, when the light grows strong?',
    answer: 'gibbous',
    difficulty: 'novice',
    chamberId: 'crescent_chamber',
    hint: 'It means hump-backed in Latin...',
    lore: 'Monks who solve this riddle during the correct phase receive a bonus blessing.',
    rewardExp: 15,
    rewardDevotion: 3,
  },
  // ─── Adept (10) ────────────────────────────────────────────────────────────
  {
    id: 'riddle_a_01',
    question: 'I am the time between sunset and sunrise, governed by a silver queen. When I end, the shadows flee. What period am I?',
    answer: 'moonlit',
    difficulty: 'adept',
    chamberId: 'silver_shrine',
    hint: 'Not just nighttime — it requires a specific celestial body to be visible...',
    lore: 'Scholars debate whether this riddle refers to a time period or a state of being.',
    rewardExp: 25,
    rewardDevotion: 5,
  },
  {
    id: 'riddle_a_02',
    question: 'Ten deities sit around a silver table. Each speaks one truth and one lie. Which deity never lies about the phase of the moon?',
    answer: 'thoth',
    difficulty: 'adept',
    chamberId: 'lunar_library',
    hint: 'He measures the moon and records its cycles...',
    lore: 'A logic puzzle embedded in temple mythology, testing analytical thinking.',
    rewardExp: 30,
    rewardDevotion: 5,
  },
  {
    id: 'riddle_a_03',
    question: 'I am the shadow that the moon casts on Earth during an eclipse. I travel faster than sound but slower than light. What am I?',
    answer: 'umbra',
    difficulty: 'adept',
    chamberId: 'eclipse_vault',
    hint: 'In Latin, this word means shadow...',
    lore: 'Solving this riddle within the Eclipse Vault during a lunar eclipse grants a legendary reward.',
    rewardExp: 35,
    rewardDevotion: 6,
  },
  {
    id: 'riddle_a_04',
    question: 'The monk climbed seven steps and saw the moon change eight times. On which step did the monk see the full moon?',
    answer: 'fifth',
    difficulty: 'adept',
    chamberId: 'zenith_spire',
    hint: 'Count the phases: new, crescent, quarter, gibbous, then...',
    lore: 'A mathematical riddle encoded in the architecture of the Zenith Spire staircase.',
    rewardExp: 30,
    rewardDevotion: 5,
  },
  {
    id: 'riddle_a_05',
    question: 'I am the distance the moon moves away from Earth each year: 3.8 centimeters. In a billion years, what will happen to the total solar eclipse?',
    answer: 'disappear',
    difficulty: 'adept',
    chamberId: 'lunar_library',
    hint: 'As the moon gets farther away, its apparent size changes...',
    lore: 'A science riddle that Thoth himself would appreciate, combining astronomy and temporal prediction.',
    rewardExp: 35,
    rewardDevotion: 6,
  },
  {
    id: 'riddle_a_06',
    question: 'Which lunar artifact can cut darkness but not light, reveals truth but not lies, and only exists between sunset and sunrise?',
    answer: 'crescent blade',
    difficulty: 'adept',
    chamberId: 'crescent_chamber',
    hint: 'It is a weapon shaped like a phase of the moon...',
    lore: 'Monks who have discovered the Crescent Blade always smile when they hear this riddle.',
    rewardExp: 28,
    rewardDevotion: 5,
  },
  {
    id: 'riddle_a_07',
    question: 'In the shadow atrium, the shadows move counterclockwise. In the moonlight hall, they move clockwise. Where do they stand still?',
    answer: 'eclipse',
    difficulty: 'adept',
    chamberId: 'shadow_atrium',
    hint: 'When light and darkness are in perfect alignment...',
    lore: 'A spatial reasoning riddle that requires physical exploration of two chambers.',
    rewardExp: 32,
    rewardDevotion: 6,
  },
  {
    id: 'riddle_a_08',
    question: 'A monk meditated for 29 days and collected one silver tear per day. On the thirtieth day, the tears turned to what precious material?',
    answer: 'moonstone',
    difficulty: 'adept',
    chamberId: 'silver_shrine',
    hint: 'Selene weeps this gem when she is at her fullest...',
    lore: 'This riddle is the basis of an actual temple ritual performed on the full moon.',
    rewardExp: 30,
    rewardDevotion: 5,
  },
  {
    id: 'riddle_a_09',
    question: 'I am the boundary between the moon\'s near side and far side. No one from Earth can see past me without a journey. What am I?',
    answer: 'terminator',
    difficulty: 'adept',
    chamberId: 'eclipse_vault',
    hint: 'Not the movie villain — this is the line between light and dark on the moon...',
    lore: 'The hardest adept riddle, referencing both the lunar terminator and the concept of boundaries.',
    rewardExp: 40,
    rewardDevotion: 7,
  },
  {
    id: 'riddle_a_10',
    question: 'Three monks offer devotion to three different deities. If Selene receives twice what Hecate receives, and Tsukuyomi receives three times what Hecate receives, what fraction does Selene receive?',
    answer: 'two sevenths',
    difficulty: 'adept',
    chamberId: 'silver_shrine',
    hint: 'Set Hecate\'s share to x, then Selene is 2x and Tsukuyomi is 3x. The total is 6x...',
    lore: 'A mathematical offering puzzle that teaches monks about balanced devotion.',
    rewardExp: 35,
    rewardDevotion: 6,
  },
  // ─── Master (10) ────────────────────────────────────────────────────────────
  {
    id: 'riddle_m_01',
    question: 'I am the echo of a collision 4.5 billion years ago. I was born from fire and stone, yet I cool the earth. I have no atmosphere, yet I affect every breath. What am I?',
    answer: 'moon',
    difficulty: 'master',
    chamberId: 'eclipse_vault',
    hint: 'The giant impact hypothesis explains my origin...',
    lore: 'The deepest riddle about the moon\'s nature, requiring knowledge of planetary science.',
    rewardExp: 60,
    rewardDevotion: 10,
  },
  {
    id: 'riddle_m_02',
    question: 'The Lunar Library has infinite shelves. Each shelf contains a book for every possible meditation experience. If you could read one book per second, would you ever finish? Answer yes or no.',
    answer: 'no',
    difficulty: 'master',
    chamberId: 'lunar_library',
    hint: 'Infinite divided by any finite number is still...',
    lore: 'A philosophical riddle about the infinite nature of meditation experiences.',
    rewardExp: 55,
    rewardDevotion: 10,
  },
  {
    id: 'riddle_m_03',
    question: 'When the moon is in the seventh house and Jupiter aligns with Mars, what temple chamber becomes accessible only to monks who have solved exactly thirteen riddles?',
    answer: 'zenith',
    difficulty: 'master',
    chamberId: 'zenith_spire',
    hint: 'The answer is the name of a chamber, not an astrological event...',
    lore: 'A riddle that combines temple mechanics with esoteric knowledge.',
    rewardExp: 65,
    rewardDevotion: 12,
  },
  {
    id: 'riddle_m_04',
    question: 'A monk carries ten artifacts, each with a different phase affinity. In how many unique orders can the monk arrange them for a ritual if the new moon artifact must be first?',
    answer: '362880',
    difficulty: 'master',
    chamberId: 'silver_shrine',
    hint: 'Fix the first position and calculate the permutations of the remaining nine...',
    lore: 'A factorial calculation disguised as a temple logistics problem.',
    rewardExp: 70,
    rewardDevotion: 12,
  },
  {
    id: 'riddle_m_05',
    question: 'In the Abyssal Crypt, time flows backward. A ritual that takes 7 days in the upper temple takes how many days in the crypt if time is reversed at triple speed?',
    answer: 'negative seven',
    difficulty: 'master',
    chamberId: 'abyssal_crypt',
    hint: 'Think about negative time multiplied by a factor...',
    lore: 'This riddle caused three monks to achieve transcendence simultaneously.',
    rewardExp: 75,
    rewardDevotion: 15,
  },
  {
    id: 'riddle_m_06',
    question: 'What is the sound of one moonbeam striking the Zenith Spire at midnight during a blue moon while all ten deities are silent?',
    answer: 'silence',
    difficulty: 'master',
    chamberId: 'zenith_spire',
    hint: 'Koan-style riddle: light makes no sound on its own...',
    lore: 'A Zen koan adapted for lunar meditation practice by the temple\'s first master.',
    rewardExp: 60,
    rewardDevotion: 10,
  },
  {
    id: 'riddle_m_07',
    question: 'The temple has 8 chambers connected by 28 corridors. If a monk visits each chamber exactly once, how many possible paths exist from the Moonlight Hall to the Abyssal Crypt?',
    answer: '5040',
    difficulty: 'master',
    chamberId: 'lunar_library',
    hint: 'This is a Hamiltonian path problem with a specific count...',
    lore: 'The Lunar Library\'s most famous mathematical riddle, still debated by scholars.',
    rewardExp: 80,
    rewardDevotion: 15,
  },
  {
    id: 'riddle_m_08',
    question: 'If devotion is 3 and meditation is 5, and ritual power is devotion times meditation divided by the current phase multiplier, what is the ritual power during a new moon?',
    answer: 'thirty',
    difficulty: 'master',
    chamberId: 'shadow_atrium',
    hint: 'New moon multiplier is 0.5, but the formula divides by the multiplier...',
    lore: 'A practical calculation riddle that tests understanding of temple mechanics.',
    rewardExp: 55,
    rewardDevotion: 10,
  },
  {
    id: 'riddle_m_09',
    question: 'Ten deities sit in a circle. Each passes a silver coin to the deity on their left. After one complete rotation, how many coins has each deity held?',
    answer: 'two',
    difficulty: 'master',
    chamberId: 'silver_shrine',
    hint: 'Each deity received one and passed one...',
    lore: 'A circular logic puzzle that teaches interconnectedness.',
    rewardExp: 65,
    rewardDevotion: 12,
  },
  {
    id: 'riddle_m_10',
    question: 'In the language of the temple, LUNA is written as 12-21-14-1. What number represents TEMPLE?',
    answer: '20-5-13-16-12-5',
    difficulty: 'master',
    chamberId: 'lunar_library',
    hint: 'Each letter corresponds to its position in the alphabet...',
    lore: 'The coding system used by ancient monks to hide their most sacred texts.',
    rewardExp: 70,
    rewardDevotion: 12,
  },
  // ─── Oracle (10) ────────────────────────────────────────────────────────────
  {
    id: 'riddle_o_01',
    question: 'I am the question that answers itself. I am the riddle whose solution is the act of solving. I am the meditation that reaches stillness through movement. What am I?',
    answer: 'enlightenment',
    difficulty: 'oracle',
    chamberId: 'abyssal_crypt',
    hint: 'The journey and the destination are the same...',
    lore: 'The final riddle of the Abyssal Crypt, whispered by the darkness itself.',
    rewardExp: 150,
    rewardDevotion: 25,
  },
  {
    id: 'riddle_o_02',
    question: 'If the moon were a mirror and the Earth a candle, and the candle reflected the mirror reflecting the candle, what would an observer on the mirror see when the candle was extinguished?',
    answer: 'darkness',
    difficulty: 'oracle',
    chamberId: 'abyssal_crypt',
    hint: 'Without the original light source, there is nothing to reflect...',
    lore: 'A paradox of infinite reflection resolved by the simplest truth.',
    rewardExp: 160,
    rewardDevotion: 25,
  },
  {
    id: 'riddle_o_03',
    question: 'The temple existed before the moon, the moon existed before the Earth, the Earth existed before the sun. Arrange them in order of their true creation. The answer is not chronological.',
    answer: 'intention',
    difficulty: 'oracle',
    chamberId: 'zenith_spire',
    hint: 'What comes before all physical creation?',
    lore: 'The most philosophical oracle riddle, debated for millennia.',
    rewardExp: 170,
    rewardDevotion: 30,
  },
  {
    id: 'riddle_o_04',
    question: 'A monk asks: "Is the moon real or a dream?" Nyx answers: "The dreamer dreams the moon is real, the moon dreams the dreamer is real. Who dreams whom?" What is the answer?',
    answer: 'consciousness',
    difficulty: 'oracle',
    chamberId: 'abyssal_crypt',
    hint: 'The ground of being that makes both dreaming and waking possible...',
    lore: 'The oracle riddle that earned its solver the title of Pontifex.',
    rewardExp: 180,
    rewardDevotion: 30,
  },
  {
    id: 'riddle_o_05',
    question: 'In a chamber where time does not exist, a monk counts to infinity using moon phases. On which phase does the counting begin, and on which does it end? The answer is one word.',
    answer: 'nowhere',
    difficulty: 'oracle',
    chamberId: 'abyssal_crypt',
    hint: 'Without time, there is no beginning or ending...',
    lore: 'The most abstract riddle in the temple, requiring the abandonment of linear thinking.',
    rewardExp: 200,
    rewardDevotion: 35,
  },
  {
    id: 'riddle_o_06',
    question: 'The moon weighs 7.35 times 10 to the 22nd kilograms. If each kilogram represents one prayer, how many prayers would it take to move the moon one meter closer to Earth?',
    answer: 'enough',
    difficulty: 'oracle',
    chamberId: 'zenith_spire',
    hint: 'The answer is qualitative, not quantitative...',
    lore: 'A science-meets-spirituality riddle that bridges the temple\'s two domains of knowledge.',
    rewardExp: 175,
    rewardDevotion: 30,
  },
  {
    id: 'riddle_o_07',
    question: 'If you remove the L from LUNAR, the A from ALTAR, the R from RITUAL, and the S from SERENITY, what word remains when the remaining letters are rearranged?',
    answer: 'eternal',
    difficulty: 'oracle',
    chamberId: 'lunar_library',
    hint: 'The remaining letters form a concept central to temple philosophy...',
    lore: 'An anagram riddle that encodes the temple\'s ultimate teaching.',
    rewardExp: 190,
    rewardDevotion: 32,
  },
  {
    id: 'riddle_o_08',
    question: 'Before the first temple stone was laid, a monk stood on an empty hilltop and spoke a single word. That word became the foundation of everything. What was the word?',
    answer: 'silence',
    difficulty: 'oracle',
    chamberId: 'zenith_spire',
    hint: 'The foundation of meditation is the absence of noise...',
    lore: 'Every oracle has answered this riddle differently, yet all answers are considered correct.',
    rewardExp: 185,
    rewardDevotion: 30,
  },
  {
    id: 'riddle_o_09',
    question: 'Ten deities, eight chambers, forty riddles, twelve artifacts, one temple. If the temple is a number equal to the sum of all others, what is the value of the temple?',
    answer: 'seventy one',
    difficulty: 'oracle',
    chamberId: 'lunar_library',
    hint: 'Simply add: 10 + 8 + 40 + 12 + 1...',
    lore: 'The simplest oracle riddle mathematically, but monks always expect a deeper answer.',
    rewardExp: 165,
    rewardDevotion: 28,
  },
  {
    id: 'riddle_o_10',
    question: 'You stand at the center of the Moon Temple. Every chamber is equidistant. Every deity watches. Every artifact hums. The answer to every riddle is a single word. What is the word that is all words?',
    answer: 'om',
    difficulty: 'oracle',
    chamberId: 'abyssal_crypt',
    hint: 'A sacred syllable that contains all sounds, all meanings, all existence...',
    lore: 'The final oracle riddle. Those who solve it report experiencing a moment of perfect clarity.',
    rewardExp: 250,
    rewardDevotion: 50,
  },
];

// =============================================================================
// MT2_RITUALS — 8 Temple Ceremonies
// =============================================================================

export const MT2_RITUALS: MT2RitualDef[] = [
  {
    id: 'full_moon_communion',
    name: 'Full Moon Communion',
    nameZh: '满月共融',
    description: 'The most sacred ritual of the Moon Temple, performed during the full moon when lunar energy is at its peak. Monks gather in the Moonlight Hall to channel the moon\'s radiance directly into their spirits, strengthening their connection to all ten deities.',
    phaseRequired: 'full_moon',
    rankRequired: 5,
    devotionCost: 25,
    durationCycles: 1,
    rewards: { exp: 100, devotion: 50, artifactChance: 0.15, meditationBoost: 50 },
    chant: 'Luna plena, lux aeterna, nos tuam benedictionem accipimus',
  },
  {
    id: 'new_moon_renewal',
    name: 'New Moon Renewal',
    nameZh: '新月重塑',
    description: 'A cleansing ritual performed in absolute darkness during the new moon. Monks release all accumulated negativity and begin a fresh cycle of growth. The Eclipse Vault opens its inner sanctum for this ceremony.',
    phaseRequired: 'new_moon',
    rankRequired: 10,
    devotionCost: 20,
    durationCycles: 1,
    rewards: { exp: 60, devotion: 30, artifactChance: 0.1, meditationBoost: 30 },
    chant: 'Tenebrae novae, renascentia, umbra in lucem convertimur',
  },
  {
    id: 'eclipse_seance',
    name: 'Eclipse Seance',
    nameZh: '日食降灵',
    description: 'A dangerous and powerful ritual that calls upon the Eclipse Guardian during any phase, but is most potent during the new moon. Participants risk temporary shadow possession but gain access to forbidden knowledge and rare artifacts.',
    phaseRequired: null,
    rankRequired: 20,
    devotionCost: 40,
    durationCycles: 3,
    rewards: { exp: 200, devotion: 80, artifactChance: 0.3, meditationBoost: -20 },
    chant: 'Eclipsis umbra, porta ad alterum, aperi et revela',
  },
  {
    id: 'crescent_blessing',
    name: 'Crescent Blessing',
    nameZh: '新月祝福',
    description: 'A gentle blessing ritual performed during the waxing crescent to set intentions for the coming lunar cycle. Monks write their goals on silver leaves and place them in the Crescent Chamber\'s reflecting pool.',
    phaseRequired: 'waxing_crescent',
    rankRequired: 3,
    devotionCost: 10,
    durationCycles: 1,
    rewards: { exp: 40, devotion: 20, artifactChance: 0.05, meditationBoost: 25 },
    chant: 'Crescens luna, spes nova, benedic nobis in hoc cyclo',
  },
  {
    id: 'harvest_moon_feast',
    name: 'Harvest Moon Feast',
    nameZh: '丰收月盛宴',
    description: 'A joyous celebration during the harvest moon, the full moon closest to the autumn equinox. Monks feast on lunar fruits and exchange blessings, reaping the rewards of the cycle\'s accumulated devotion and meditation.',
    phaseRequired: 'full_moon',
    rankRequired: 7,
    devotionCost: 15,
    durationCycles: 2,
    rewards: { exp: 80, devotion: 40, artifactChance: 0.12, meditationBoost: 40 },
    chant: 'Luna messis, gratia plena, fructus laboris nostri colligimus',
  },
  {
    id: 'silver_lantern_vigil',
    name: 'Silver Lantern Vigil',
    nameZh: '银灯守夜',
    description: 'An overnight vigil where monks maintain silver lanterns fueled by moonlight. The vigil requires total silence and unwavering focus, testing the monk\'s discipline and commitment to the lunar path.',
    phaseRequired: null,
    rankRequired: 12,
    devotionCost: 30,
    durationCycles: 2,
    rewards: { exp: 120, devotion: 60, artifactChance: 0.08, meditationBoost: 35 },
    chant: 'Lanterna argentea, lucerna noctis, vigilemus in silentio',
  },
  {
    id: 'shadow_walk_rite',
    name: 'Shadow Walk Rite',
    nameZh: '暗影行仪',
    description: 'A ritual performed in the Shadow Atrium where monks learn to walk between moonlight and shadow, gaining the ability to perceive hidden truths. The rite is physically demanding and mentally exhausting.',
    phaseRequired: null,
    rankRequired: 15,
    devotionCost: 35,
    durationCycles: 2,
    rewards: { exp: 150, devotion: 70, artifactChance: 0.2, meditationBoost: 20 },
    chant: 'Umbra et lux, iter inter mundos, revela veritatem occultam',
  },
  {
    id: 'zenith_convergence',
    name: 'Zenith Convergence',
    nameZh: '巅峰聚合',
    description: 'The ultimate temple ritual, performed at the apex of the Zenith Spire. All ten deities are invoked simultaneously, and their combined power creates a moment of perfect cosmic alignment. Only the most devoted monks survive the experience.',
    phaseRequired: null,
    rankRequired: 30,
    devotionCost: 100,
    durationCycles: 5,
    rewards: { exp: 500, devotion: 200, artifactChance: 0.5, meditationBoost: 100 },
    chant: 'Decem dei, zenith convergentia, aeterne luna nos benedic',
  },
];

// =============================================================================
// MT2_RANKS — Monk/Priest Progression (Rank 1-50)
// =============================================================================

export const MT2_RANKS: MT2RankDef[] = Array.from({ length: 50 }, (_, i) => {
  const rank = i + 1;
  const expRequired = Math.floor(50 * Math.pow(rank, 1.8));
  const expPrev = rank > 1 ? Math.floor(50 * Math.pow(rank - 1, 1.8)) : 0;
  const expNeeded = expRequired - expPrev;

  let title: MT2RankTitle;
  if (rank <= 3) title = 'Initiate';
  else if (rank <= 6) title = 'Acolyte';
  else if (rank <= 10) title = 'Novice';
  else if (rank <= 15) title = 'Disciple';
  else if (rank <= 20) title = rank % 2 === 0 ? 'Brother' : 'Sister';
  else if (rank <= 25) title = 'Scholar';
  else if (rank <= 30) title = 'Keeper';
  else if (rank <= 35) title = 'Warden';
  else if (rank <= 40) title = 'Elder';
  else if (rank <= 43) title = 'Sage';
  else if (rank <= 46) title = 'Oracle';
  else if (rank <= 48) title = 'Hierophant';
  else title = rank === 49 ? 'Pontifex' : 'Luminary';

  const unlockedChambers: MT2ChamberId[] = [];
  if (rank >= 1) unlockedChambers.push('moonlight_hall');
  if (rank >= 3) unlockedChambers.push('crescent_chamber');
  if (rank >= 5) unlockedChambers.push('lunar_library');
  if (rank >= 7) unlockedChambers.push('silver_shrine');
  if (rank >= 10) unlockedChambers.push('eclipse_vault');
  if (rank >= 15) unlockedChambers.push('shadow_atrium');
  if (rank >= 25) unlockedChambers.push('zenith_spire');
  if (rank >= 35) unlockedChambers.push('abyssal_crypt');

  const unlockedRituals: MT2RitualId[] = [];
  if (rank >= 3) unlockedRituals.push('crescent_blessing');
  if (rank >= 5) unlockedRituals.push('full_moon_communion');
  if (rank >= 7) unlockedRituals.push('harvest_moon_feast');
  if (rank >= 10) unlockedRituals.push('new_moon_renewal');
  if (rank >= 12) unlockedRituals.push('silver_lantern_vigil');
  if (rank >= 15) unlockedRituals.push('shadow_walk_rite');
  if (rank >= 20) unlockedRituals.push('eclipse_seance');
  if (rank >= 30) unlockedRituals.push('zenith_convergence');

  return {
    rank,
    title,
    expRequired: expNeeded,
    unlockedChambers,
    unlockedRituals,
    devotionBonus: Math.floor(rank * 1.5),
    meditationCapIncrease: Math.floor(rank * 2),
    riddleBonusExp: Math.floor(rank * 0.8),
  };
});

// =============================================================================
// MT2_LUNAR_EVENTS — Special Moon Events
// =============================================================================

export const MT2_LUNAR_EVENTS: MT2LunarEventDef[] = [
  {
    id: 'blood_moon',
    name: 'Blood Moon',
    nameZh: '血月',
    description: 'The moon turns a deep crimson red during a total lunar eclipse. Combat and challenge rewards are doubled, and the temple resonates with primal energy. The deity Menum grows stronger during this event.',
    bonusMultiplier: 2.0,
    durationDays: 3,
    specialEffect: 'All combat rewards doubled, shadow artifacts glow red',
    color: MT2_COLOR_BLOOD,
  },
  {
    id: 'blue_moon',
    name: 'Blue Moon',
    nameZh: '蓝月',
    description: 'The rare second full moon in a calendar month, occurring roughly once every 2.5 years. All abilities receive a rare bonus, and impossible things become briefly possible within the temple walls.',
    bonusMultiplier: 1.5,
    durationDays: 2,
    specialEffect: 'Rare event chances tripled, impossible achievements become available',
    color: MT2_COLOR_BLUE,
  },
  {
    id: 'harvest_moon',
    name: 'Harvest Moon',
    nameZh: '丰收月',
    description: 'The full moon nearest to the autumnal equinox, traditionally associated with abundance and gratitude. Resource yields and devotion gains are greatly increased during this golden event.',
    bonusMultiplier: 1.8,
    durationDays: 5,
    specialEffect: 'All resource gains +80%, devotion gains doubled',
    color: MT2_COLOR_HARVEST,
  },
  {
    id: 'super_moon',
    name: 'Super Moon',
    nameZh: '超级月亮',
    description: 'A full moon that occurs at the moon\'s closest approach to Earth, appearing up to 14% larger and 30% brighter than a regular full moon. The amplified moonlight supercharges all temple activities.',
    bonusMultiplier: 2.5,
    durationDays: 3,
    specialEffect: 'All temple activities +150%, meditation serenity cap doubled',
    color: MT2_COLOR_GOLD,
  },
  {
    id: 'lunar_eclipse',
    name: 'Lunar Eclipse',
    nameZh: '月食',
    description: 'The Earth passes between the sun and moon, casting its shadow across the lunar surface. The Eclipse Vault becomes fully accessible, and eclipse-aligned artifacts resonate with immense power.',
    bonusMultiplier: 1.8,
    durationDays: 2,
    specialEffect: 'Eclipse Vault fully unlocked, eclipse artifact power +80%',
    color: MT2_COLOR_ECLIPSE,
  },
  {
    id: 'wolf_moon',
    name: 'Wolf Moon',
    nameZh: '狼月',
    description: 'The first full moon of the new year, named for the howling wolves that historically gathered beneath it. Wild energy fills the temple, boosting primal meditation and intuition-based riddle solving.',
    bonusMultiplier: 1.3,
    durationDays: 3,
    specialEffect: 'Meditation instinct bonus +50%, animal spirit encounters increased',
    color: '#708090',
  },
  {
    id: 'worm_moon',
    name: 'Worm Moon',
    nameZh: '虫月',
    description: 'The full moon of March, when the earth begins to thaw and earthworms emerge, signaling the return of spring. The temple\'s foundations shift, occasionally revealing hidden passages and secret chambers.',
    bonusMultiplier: 1.4,
    durationDays: 4,
    specialEffect: 'Hidden passages have 40% chance of appearing, exploration gains +40%',
    color: '#8B7355',
  },
  {
    id: 'pink_moon',
    name: 'Pink Moon',
    nameZh: '粉月',
    description: 'The full moon of April, named for the pink phlox flowers that bloom during this time. Beauty and serenity fill the temple, and meditation becomes effortlessly deep and rewarding.',
    bonusMultiplier: 1.6,
    durationDays: 3,
    specialEffect: 'Meditation serenity gains +60%, aesthetic rewards unlocked',
    color: '#FFB6C1',
  },
];

// =============================================================================
// MT2_MEDITATION_SESSIONS — Meditation Mechanics
// =============================================================================

export const MT2_MEDITATION_SESSIONS: MT2MeditationSessionDef[] = [
  {
    id: 'med_breath_of_moon',
    name: 'Breath of the Moon',
    posture: 'seated',
    baseSerenity: 15,
    phaseBonus: 'full_moon',
    description: 'A foundational breathing meditation synchronized with the rhythm of the lunar cycle. Each inhale draws in moonlight; each exhale releases worldly concerns.',
    wordLengthTarget: 3,
    wordCountTarget: 5,
  },
  {
    id: 'med_silver_lotus',
    name: 'Silver Lotus Position',
    posture: 'lotus',
    baseSerenity: 25,
    phaseBonus: 'waxing_gibbous',
    description: 'An advanced posture meditation where the monk visualizes a silver lotus blooming within their chest, each petal representing a lunar phase.',
    wordLengthTarget: 4,
    wordCountTarget: 7,
  },
  {
    id: 'med_shadow_standing',
    name: 'Shadow Standing Meditation',
    posture: 'standing',
    baseSerenity: 20,
    phaseBonus: 'waning_gibbous',
    description: 'A dynamic standing meditation performed in the Shadow Atrium where the monk becomes one with their shadow, moving as slowly as the moon traverses the sky.',
    wordLengthTarget: 3,
    wordCountTarget: 6,
  },
  {
    id: 'med_eclipse_contemplation',
    name: 'Eclipse Contemplation',
    posture: 'kneeling',
    baseSerenity: 35,
    phaseBonus: 'new_moon',
    description: 'A deep contemplation practiced in total darkness, confronting the void within and without. Only for experienced monks who have mastered shadow integration.',
    wordLengthTarget: 5,
    wordCountTarget: 10,
  },
  {
    id: 'med_zenith_supine',
    name: 'Zenith Supine Meditation',
    posture: 'lying',
    baseSerenity: 30,
    phaseBonus: 'first_quarter',
    description: 'A receptive meditation performed lying on the floor of the Zenith Spire, gazing up through the crystal ceiling at the moon. Cosmic energy flows directly through the body.',
    wordLengthTarget: 4,
    wordCountTarget: 8,
  },
  {
    id: 'med_crescent_flow',
    name: 'Crescent Flow Meditation',
    posture: 'seated',
    baseSerenity: 18,
    phaseBonus: 'waxing_crescent',
    description: 'A flowing meditation that follows the crescent arc, building energy for the growing lunar cycle. Words are formed like brushstrokes on water, present but impermanent.',
    wordLengthTarget: 3,
    wordCountTarget: 5,
  },
  {
    id: 'med_abyssal_descent',
    name: 'Abyssal Descent',
    posture: 'kneeling',
    baseSerenity: 40,
    phaseBonus: 'waning_crescent',
    description: 'The most dangerous meditation, practiced at the edge of the Abyssal Crypt. The monk descends through layers of consciousness into the void, seeking enlightenment in absolute nothingness.',
    wordLengthTarget: 6,
    wordCountTarget: 12,
  },
  {
    id: 'med_dawn_transition',
    name: 'Dawn Transition Meditation',
    posture: 'standing',
    baseSerenity: 10,
    phaseBonus: null,
    description: 'A transitional meditation performed at the moment the moon sets and the sun rises. The monk experiences the handover of celestial power, learning to exist between states.',
    wordLengthTarget: 2,
    wordCountTarget: 4,
  },
];

// =============================================================================
// MT2_ACHIEVEMENTS — 15 Achievements
// =============================================================================

export const MT2_ACHIEVEMENTS: MT2AchievementDef[] = [
  {
    id: 'ach_first_steps',
    name: 'First Steps',
    nameZh: '初入神殿',
    description: 'Enter the Moonlight Hall for the first time and begin your journey through the Moon Temple.',
    conditionKey: 'mt2TotalChamberVisits',
    targetValue: 1,
    rewardExp: 20,
    rewardDevotion: 5,
    rewardTitle: null,
  },
  {
    id: 'ach_riddle_novice',
    name: 'Riddle Novice',
    nameZh: '谜语新手',
    description: 'Solve 10 novice difficulty riddles within the temple chambers.',
    conditionKey: 'mt2TotalRiddlesSolved',
    targetValue: 10,
    rewardExp: 100,
    rewardDevotion: 20,
    rewardTitle: 'Riddler',
  },
  {
    id: 'ach_ritual_beginner',
    name: 'First Communion',
    nameZh: '首次共融',
    description: 'Complete your first temple ritual during the appropriate moon phase.',
    conditionKey: 'mt2TotalRitualsPerformed',
    targetValue: 1,
    rewardExp: 80,
    rewardDevotion: 15,
    rewardTitle: 'Ritualist',
  },
  {
    id: 'ach_meditation_dedicated',
    name: 'Dedicated Meditator',
    nameZh: '专注冥想者',
    description: 'Complete 20 meditation sessions within the Moon Temple.',
    conditionKey: 'mt2TotalMeditationsCompleted',
    targetValue: 20,
    rewardExp: 150,
    rewardDevotion: 30,
    rewardTitle: 'Contemplative',
  },
  {
    id: 'ach_serenity_seeker',
    name: 'Serenity Seeker',
    nameZh: '宁静追寻者',
    description: 'Achieve a perfect serenity score of 100 during any meditation session.',
    conditionKey: 'mt2BestSerenity',
    targetValue: 100,
    rewardExp: 200,
    rewardDevotion: 40,
    rewardTitle: 'Serene Mind',
  },
  {
    id: 'ach_artifact_collector',
    name: 'Artifact Collector',
    nameZh: '圣物收藏家',
    description: 'Discover 6 different lunar artifacts scattered throughout the temple chambers.',
    conditionKey: 'mt2TotalArtifactsFound',
    targetValue: 6,
    rewardExp: 250,
    rewardDevotion: 50,
    rewardTitle: 'Collector',
  },
  {
    id: 'ach_devoted_follower',
    name: 'Devoted Follower',
    nameZh: '虔诚追随者',
    description: 'Accumulate a total of 500 devotion points across all temple activities.',
    conditionKey: 'mt2TotalDevotion',
    targetValue: 500,
    rewardExp: 300,
    rewardDevotion: 60,
    rewardTitle: 'Devotee',
  },
  {
    id: 'ach_all_chambers',
    name: 'Chamber Master',
    nameZh: '殿堂大师',
    description: 'Unlock and visit all 8 chambers of the Moon Temple.',
    conditionKey: 'mt2TotalChamberVisits',
    targetValue: 8,
    rewardExp: 400,
    rewardDevotion: 80,
    rewardTitle: 'Explorer',
  },
  {
    id: 'ach_rank_ten',
    name: 'Novice Master',
    nameZh: '初级大师',
    description: 'Reach rank 10 and gain the title of Novice within the temple hierarchy.',
    conditionKey: 'mt2Rank',
    targetValue: 10,
    rewardExp: 200,
    rewardDevotion: 40,
    rewardTitle: 'Temple Novice',
  },
  {
    id: 'ach_rank_twenty_five',
    name: 'Scholar of the Moon',
    nameZh: '月光学者',
    description: 'Achieve rank 25 and earn the Scholar title within the temple hierarchy.',
    conditionKey: 'mt2Rank',
    targetValue: 25,
    rewardExp: 500,
    rewardDevotion: 100,
    rewardTitle: 'Moon Scholar',
  },
  {
    id: 'ach_gazing_streak',
    name: 'Moon Gazer',
    nameZh: '观月者',
    description: 'Maintain a daily moon gazing streak of 7 consecutive days.',
    conditionKey: 'mt2DailyGazingStreak',
    targetValue: 7,
    rewardExp: 120,
    rewardDevotion: 25,
    rewardTitle: 'Gazer',
  },
  {
    id: 'ach_riddle_master',
    name: 'Riddle Master',
    nameZh: '谜语大师',
    description: 'Solve all 40 temple riddles across all four difficulty tiers.',
    conditionKey: 'mt2TotalRiddlesSolved',
    targetValue: 40,
    rewardExp: 1000,
    rewardDevotion: 200,
    rewardTitle: 'Oracle',
  },
  {
    id: 'ach_ritual_master',
    name: 'Ritual Grandmaster',
    nameZh: '仪式宗师',
    description: 'Perform all 8 temple ceremonies at least once during the correct moon phase.',
    conditionKey: 'mt2TotalRitualsPerformed',
    targetValue: 8,
    rewardExp: 600,
    rewardDevotion: 120,
    rewardTitle: 'Grand Ritualist',
  },
  {
    id: 'ach_rank_fifty',
    name: 'Temple Luminary',
    nameZh: '神殿光辉者',
    description: 'Reach the maximum rank of 50 and become a Luminary of the Moon Temple.',
    conditionKey: 'mt2Rank',
    targetValue: 50,
    rewardExp: 2000,
    rewardDevotion: 500,
    rewardTitle: 'Luminary',
  },
  {
    id: 'ach_perfect_words',
    name: 'Perfect Words',
    nameZh: '完美之言',
    description: 'Form 100 words during meditation sessions throughout your temple journey.',
    conditionKey: 'mt2WordsFormedDuringMeditation',
    targetValue: 100,
    rewardExp: 300,
    rewardDevotion: 60,
    rewardTitle: 'Word Weaver',
  },
];

// =============================================================================
// Initial State Factory
// =============================================================================

function createInitialState(): MT2MoonTempleState {
  return {
    mt2Rank: 1,
    mt2Exp: 0,
    mt2Devotion: 0,
    mt2TotalDevotion: 0,
    mt2MoonPhase: 0,
    mt2MoonPhaseName: 'new_moon',
    mt2DayCounter: 1,
    mt2LunarCycle: 1,
    mt2CurrentChamber: 'moonlight_hall',
    mt2Chambers: MT2_CHAMBERS.map((chamber) => ({
      chamberId: chamber.id,
      unlocked: chamber.unlockRank === 1,
      unlockedAt: chamber.unlockRank === 1 ? Date.now() : null,
      visitCount: 0,
      lastVisit: null,
      explorationProgress: 0,
    })),
    mt2Artifacts: MT2_ARTIFACTS.map((artifact) => ({
      artifactId: artifact.id,
      discovered: false,
      discoveredAt: null,
      equipped: false,
      timesUsed: 0,
    })),
    mt2Deities: MT2_DEITIES.map((deity) => ({
      deityId: deity.id,
      devotion: 0,
      blessingActive: false,
      blessingExpiry: null,
      totalOfferings: 0,
      lastOffering: null,
    })),
    mt2Riddles: MT2_RIDDLES.map((riddle) => ({
      riddleId: riddle.id,
      solved: false,
      solvedAt: null,
      attempts: 0,
      hintUsed: false,
    })),
    mt2Rituals: MT2_RITUALS.map((ritual) => ({
      ritualId: ritual.id,
      lastPerformed: null,
      timesPerformed: 0,
      cooldownRemaining: 0,
    })),
    mt2Achievements: MT2_ACHIEVEMENTS.map((achievement) => ({
      achievementId: achievement.id,
      unlocked: false,
      unlockedAt: null,
    })),
    mt2ActiveBlessing: null,
    mt2ActiveEvent: null,
    mt2EventDaysRemaining: 0,
    mt2MeditationSessionsCompleted: 0,
    mt2TotalSerenity: 0,
    mt2BestSerenity: 0,
    mt2CurrentSerenity: 0,
    mt2MeditationStreak: 0,
    mt2LastMeditationDate: null,
    mt2DailyGazingCompleted: false,
    mt2DailyGazingStreak: 0,
    mt2LastGazingDate: null,
    mt2TotalRiddlesSolved: 0,
    mt2TotalRitualsPerformed: 0,
    mt2TotalArtifactsFound: 0,
    mt2TotalOfferingsMade: 0,
    mt2TotalMeditationsCompleted: 0,
    mt2TotalChamberVisits: 0,
    mt2WordsFormedDuringMeditation: 0,
    mt2PerfectMeditations: 0,
  };
}

// =============================================================================
// Serenity Level Calculator
// =============================================================================

function mt2CalculateSerenityLevel(serenity: number): MT2SerenityLevel {
  if (serenity >= 95) return 'transcendent';
  if (serenity >= 75) return 'serene';
  if (serenity >= 50) return 'peaceful';
  if (serenity >= 25) return 'calm';
  return 'restless';
}

// =============================================================================
// Rank Title Calculator
// =============================================================================

function mt2CalculateRankTitle(rank: number): MT2RankTitle {
  const rankDef = MT2_RANKS.find((r) => r.rank === rank);
  if (rankDef) return rankDef.title;
  if (rank <= 3) return 'Initiate';
  if (rank <= 6) return 'Acolyte';
  if (rank <= 10) return 'Novice';
  if (rank <= 15) return 'Disciple';
  if (rank <= 20) return 'Brother';
  if (rank <= 25) return 'Scholar';
  if (rank <= 30) return 'Keeper';
  if (rank <= 35) return 'Warden';
  if (rank <= 40) return 'Elder';
  if (rank <= 43) return 'Sage';
  if (rank <= 46) return 'Oracle';
  if (rank <= 48) return 'Hierophant';
  if (rank === 49) return 'Pontifex';
  return 'Luminary';
}

// =============================================================================
// Today Date String Helper
// =============================================================================

function mt2GetTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// =============================================================================
// Default Export Hook — useMoonTemple
// =============================================================================

export default function useMoonTemple(): MT2MoonTempleState & MT2MoonTempleActions {
  // ---- Primary state via lazy initializer with localStorage persistence ----
  const [state, setState] = useState<MT2MoonTempleState>(() => {
    try {
      const saved = localStorage.getItem('mt2-moon-temple-save');
      if (saved) {
        const parsed = JSON.parse(saved) as MT2MoonTempleState;
        if (parsed && typeof parsed.mt2Rank === 'number') {
          return parsed;
        }
      }
    } catch {
      // Silently fall through to initial state on parse error
    }
    return createInitialState();
  });

  // ---- Second useState for persistence flag ----
  const [persistVersion, setPersistVersion] = useState<number>(0);

  function mt2Persist(): void {
    try {
      localStorage.setItem('mt2-moon-temple-save', JSON.stringify(state));
      setPersistVersion((v) => v + 1);
    } catch {
      // Silently fail if localStorage is full or unavailable
    }
  }

  // ---- Actions ----

  function mt2GetLevel(): number {
    return state.mt2Rank;
  }

  function mt2GetRankTitle(): MT2RankTitle {
    return mt2CalculateRankTitle(state.mt2Rank);
  }

  function mt2GetMana(): number {
    return state.mt2Devotion;
  }

  function mt2GetSerenity(): number {
    return state.mt2CurrentSerenity;
  }

  function mt2GetSerenityLevel(): MT2SerenityLevel {
    return mt2CalculateSerenityLevel(state.mt2CurrentSerenity);
  }

  function mt2GetCurrentPhase(): MT2MoonPhaseDef {
    return MT2_MOON_PHASES[state.mt2MoonPhase] ?? MT2_MOON_PHASES[0];
  }

  function mt2GetCurrentPhaseIndex(): number {
    return state.mt2MoonPhase;
  }

  function mt2AdvancePhase(): void {
    const nextPhase = (state.mt2MoonPhase + 1) % 8;
    const newDay = nextPhase === 0 ? state.mt2DayCounter + 1 : state.mt2DayCounter;
    const newCycle = nextPhase === 0 ? state.mt2LunarCycle + 1 : state.mt2LunarCycle;
    setState((prev) => ({
      ...prev,
      mt2MoonPhase: nextPhase,
      mt2MoonPhaseName: MT2_MOON_PHASES[nextPhase].id,
      mt2DayCounter: newDay,
      mt2LunarCycle: newCycle,
    }));
    mt2Persist();
  }

  function mt2AdvanceDay(): void {
    const nextPhase = (state.mt2MoonPhase + 1) % 8;
    const newCycle = nextPhase === 0 ? state.mt2LunarCycle + 1 : state.mt2LunarCycle;

    let newEventDaysRemaining = state.mt2EventDaysRemaining - 1;
    let newActiveEvent = state.mt2ActiveEvent;
    if (newEventDaysRemaining <= 0 && state.mt2ActiveEvent !== null) {
      newActiveEvent = null;
      newEventDaysRemaining = 0;
    }

    setState((prev) => ({
      ...prev,
      mt2MoonPhase: nextPhase,
      mt2MoonPhaseName: MT2_MOON_PHASES[nextPhase].id,
      mt2DayCounter: prev.mt2DayCounter + 1,
      mt2LunarCycle: newCycle,
      mt2ActiveEvent: newActiveEvent,
      mt2EventDaysRemaining: newEventDaysRemaining,
    }));
    mt2Persist();
  }

  function mt2AddExp(amount: number): void {
    const phaseMultiplier = MT2_MOON_PHASES[state.mt2MoonPhase].powerMultiplier;
    const eventMultiplier = state.mt2ActiveEvent
      ? MT2_LUNAR_EVENTS.find((e) => e.id === state.mt2ActiveEvent)?.bonusMultiplier ?? 1
      : 1;
    const blessingMultiplier = state.mt2ActiveBlessing ? 1.3 : 1;
    const totalAmount = Math.floor(amount * phaseMultiplier * eventMultiplier * blessingMultiplier);

    let newExp = state.mt2Exp + totalAmount;
    let newRank = state.mt2Rank;

    while (newRank < 50) {
      const rankDef = MT2_RANKS.find((r) => r.rank === newRank);
      if (!rankDef) break;
      if (newExp >= rankDef.expRequired) {
        newExp -= rankDef.expRequired;
        newRank += 1;
      } else {
        break;
      }
    }

    const newChambers = state.mt2Chambers.map((ch) => {
      const chamberDef = MT2_CHAMBERS.find((c) => c.id === ch.chamberId);
      if (!chamberDef) return ch;
      if (!ch.unlocked && chamberDef.unlockRank <= newRank) {
        return { ...ch, unlocked: true, unlockedAt: Date.now() };
      }
      return ch;
    });

    setState((prev) => ({
      ...prev,
      mt2Exp: newRank >= 50 ? 0 : newExp,
      mt2Rank: newRank,
      mt2Chambers: newChambers,
    }));
    mt2Persist();
  }

  function mt2AddDevotion(amount: number): void {
    const phaseMultiplier = MT2_MOON_PHASES[state.mt2MoonPhase].powerMultiplier;
    const totalAmount = Math.floor(amount * phaseMultiplier);
    setState((prev) => ({
      ...prev,
      mt2Devotion: prev.mt2Devotion + totalAmount,
      mt2TotalDevotion: prev.mt2TotalDevotion + totalAmount,
    }));
    mt2Persist();
  }

  function mt2SpendDevotion(amount: number): boolean {
    if (state.mt2Devotion < amount) return false;
    setState((prev) => ({
      ...prev,
      mt2Devotion: prev.mt2Devotion - amount,
    }));
    mt2Persist();
    return true;
  }

  function mt2EnterChamber(chamberId: MT2ChamberId): boolean {
    const chamberState = state.mt2Chambers.find((ch) => ch.chamberId === chamberId);
    if (!chamberState || !chamberState.unlocked) return false;

    const updatedChambers = state.mt2Chambers.map((ch) => {
      if (ch.chamberId === chamberId) {
        return {
          ...ch,
          visitCount: ch.visitCount + 1,
          lastVisit: Date.now(),
        };
      }
      return ch;
    });

    setState((prev) => ({
      ...prev,
      mt2CurrentChamber: chamberId,
      mt2Chambers: updatedChambers,
      mt2TotalChamberVisits: prev.mt2TotalChamberVisits + 1,
    }));
    mt2Persist();
    return true;
  }

  function mt2LeaveChamber(): void {
    setState((prev) => ({
      ...prev,
      mt2CurrentChamber: null,
    }));
    mt2Persist();
  }

  function mt2ExploreChamber(progress: number): boolean {
    if (!state.mt2CurrentChamber) return false;

    const updatedChambers = state.mt2Chambers.map((ch) => {
      if (ch.chamberId === state.mt2CurrentChamber) {
        const newProgress = Math.min(ch.explorationProgress + progress, 100);
        return { ...ch, explorationProgress: newProgress };
      }
      return ch;
    });

    setState((prev) => ({
      ...prev,
      mt2Chambers: updatedChambers,
    }));
    mt2Persist();
    return true;
  }

  function mt2DiscoverArtifact(artifactId: string): boolean {
    const artifactState = state.mt2Artifacts.find((a) => a.artifactId === artifactId);
    if (!artifactState || artifactState.discovered) return false;

    const updatedArtifacts = state.mt2Artifacts.map((a) => {
      if (a.artifactId === artifactId) {
        return { ...a, discovered: true, discoveredAt: Date.now() };
      }
      return a;
    });

    setState((prev) => ({
      ...prev,
      mt2Artifacts: updatedArtifacts,
      mt2TotalArtifactsFound: prev.mt2TotalArtifactsFound + 1,
    }));
    mt2Persist();
    return true;
  }

  function mt2EquipArtifact(artifactId: string): boolean {
    const artifactState = state.mt2Artifacts.find((a) => a.artifactId === artifactId);
    if (!artifactState || !artifactState.discovered) return false;

    const updatedArtifacts = state.mt2Artifacts.map((a) => {
      if (a.artifactId === artifactId) {
        return { ...a, equipped: true, timesUsed: a.timesUsed + 1 };
      }
      return a;
    });

    setState((prev) => ({
      ...prev,
      mt2Artifacts: updatedArtifacts,
    }));
    mt2Persist();
    return true;
  }

  function mt2UnequipArtifact(artifactId: string): void {
    const updatedArtifacts = state.mt2Artifacts.map((a) => {
      if (a.artifactId === artifactId) {
        return { ...a, equipped: false };
      }
      return a;
    });

    setState((prev) => ({
      ...prev,
      mt2Artifacts: updatedArtifacts,
    }));
    mt2Persist();
  }

  function mt2GetEquippedArtifacts(): MT2ArtifactState[] {
    return state.mt2Artifacts.filter((a) => a.equipped);
  }

  function mt2GetArtifactPower(): number {
    const equipped = state.mt2Artifacts.filter((a) => a.equipped);
    let totalPower = 0;
    for (const eq of equipped) {
      const def = MT2_ARTIFACTS.find((a) => a.id === eq.artifactId);
      if (!def) continue;
      let power = def.basePower;
      if (state.mt2MoonPhaseName === def.phaseBonus) {
        power = Math.floor(power * def.phaseMultiplier);
      }
      totalPower += power;
    }
    return totalPower;
  }

  function mt2OfferToDeity(deityId: string): boolean {
    const deityDef = MT2_DEITIES.find((d) => d.id === deityId);
    if (!deityDef) return false;
    if (state.mt2Rank < deityDef.rankRequired) return false;
    if (state.mt2Devotion < deityDef.offeringCost) return false;

    const devotionGain = Math.floor(deityDef.offeringCost * 1.5);

    const updatedDeities = state.mt2Deities.map((d) => {
      if (d.deityId === deityId) {
        return {
          ...d,
          devotion: d.devotion + devotionGain,
          totalOfferings: d.totalOfferings + 1,
          lastOffering: Date.now(),
        };
      }
      return d;
    });

    setState((prev) => ({
      ...prev,
      mt2Deities: updatedDeities,
      mt2Devotion: prev.mt2Devotion - deityDef.offeringCost,
      mt2TotalDevotion: prev.mt2TotalDevotion + devotionGain,
      mt2TotalOfferingsMade: prev.mt2TotalOfferingsMade + 1,
    }));
    mt2Persist();
    return true;
  }

  function mt2ActivateBlessing(deityId: string): boolean {
    const deityState = state.mt2Deities.find((d) => d.deityId === deityId);
    if (!deityState || deityState.devotion < 50) return false;
    if (state.mt2ActiveBlessing !== null) return false;

    const blessingDuration = 3 * 24 * 60 * 60 * 1000;
    const expiry = Date.now() + blessingDuration;

    const updatedDeities = state.mt2Deities.map((d) => {
      if (d.deityId === deityId) {
        return { ...d, blessingActive: true, blessingExpiry: expiry, devotion: d.devotion - 50 };
      }
      return { ...d, blessingActive: false, blessingExpiry: null };
    });

    setState((prev) => ({
      ...prev,
      mt2Deities: updatedDeities,
      mt2ActiveBlessing: deityId,
    }));
    mt2Persist();
    return true;
  }

  function mt2GetDeityDevotion(deityId: string): number {
    const deityState = state.mt2Deities.find((d) => d.deityId === deityId);
    return deityState ? deityState.devotion : 0;
  }

  function mt2GetBlessingStatus(): { deityId: string; remaining: number } | null {
    if (!state.mt2ActiveBlessing) return null;
    const deityState = state.mt2Deities.find((d) => d.deityId === state.mt2ActiveBlessing);
    if (!deityState || !deityState.blessingExpiry) return null;
    const remaining = Math.max(0, deityState.blessingExpiry - Date.now());
    if (remaining <= 0) return null;
    return { deityId: state.mt2ActiveBlessing, remaining };
  }

  function mt2SolveRiddle(riddleId: string, answer: string): boolean {
    const riddleState = state.mt2Riddles.find((r) => r.riddleId === riddleId);
    if (!riddleState || riddleState.solved) return false;

    const riddleDef = MT2_RIDDLES.find((r) => r.id === riddleId);
    if (!riddleDef) return false;

    const normalizedAnswer = answer.toLowerCase().trim();
    const normalizedCorrect = riddleDef.answer.toLowerCase().trim();
    const isCorrect = normalizedAnswer === normalizedCorrect;

    const updatedRiddles = state.mt2Riddles.map((r) => {
      if (r.riddleId === riddleId) {
        return {
          ...r,
          attempts: r.attempts + 1,
          solved: isCorrect,
          solvedAt: isCorrect ? Date.now() : null,
        };
      }
      return r;
    });

    const newSolved = isCorrect ? state.mt2TotalRiddlesSolved + 1 : state.mt2TotalRiddlesSolved;

    setState((prev) => ({
      ...prev,
      mt2Riddles: updatedRiddles,
      mt2TotalRiddlesSolved: newSolved,
    }));

    if (isCorrect) {
      const phaseMultiplier = MT2_MOON_PHASES[state.mt2MoonPhase].powerMultiplier;
      const rankBonus = MT2_RANKS.find((r) => r.rank === state.mt2Rank)?.riddleBonusExp ?? 0;
      const hintPenalty = riddleState.hintUsed ? 0.5 : 1;
      const expReward = Math.floor(riddleDef.rewardExp * phaseMultiplier * hintPenalty) + rankBonus;
      const devotionReward = Math.floor(riddleDef.rewardDevotion * phaseMultiplier * hintPenalty);
      mt2AddExp(expReward);
      mt2AddDevotion(devotionReward);
    }

    mt2Persist();
    return isCorrect;
  }

  function mt2UseHint(riddleId: string): string | null {
    const riddleState = state.mt2Riddles.find((r) => r.riddleId === riddleId);
    if (!riddleState || riddleState.solved || riddleState.hintUsed) return null;

    const riddleDef = MT2_RIDDLES.find((r) => r.id === riddleId);
    if (!riddleDef) return null;

    const phase = MT2_MOON_PHASES[state.mt2MoonPhase];
    const baseChance = phase.riddleHintChance;
    const deityBonus = state.mt2ActiveBlessing === 'deity_thoth' ? 0.4 : 0;
    const totalChance = Math.min(baseChance + deityBonus, 0.95);

    const roll = Math.random();
    if (roll > totalChance) return null;

    const updatedRiddles = state.mt2Riddles.map((r) => {
      if (r.riddleId === riddleId) {
        return { ...r, hintUsed: true };
      }
      return r;
    });

    setState((prev) => ({
      ...prev,
      mt2Riddles: updatedRiddles,
    }));
    mt2Persist();
    return riddleDef.hint;
  }

  function mt2GetRiddleProgress(): { solved: number; total: number } {
    return {
      solved: state.mt2TotalRiddlesSolved,
      total: MT2_RIDDLES.length,
    };
  }

  function mt2PerformRitual(ritualId: MT2RitualId): boolean {
    const ritualDef = MT2_RITUALS.find((r) => r.id === ritualId);
    if (!ritualDef) return false;
    if (state.mt2Rank < ritualDef.rankRequired) return false;
    if (state.mt2Devotion < ritualDef.devotionCost) return false;

    if (ritualDef.phaseRequired !== null) {
      const currentPhaseId = MT2_MOON_PHASES[state.mt2MoonPhase].id;
      if (currentPhaseId !== ritualDef.phaseRequired) return false;
    }

    const ritualState = state.mt2Rituals.find((r) => r.ritualId === ritualId);
    if (ritualState && ritualState.cooldownRemaining > 0) return false;

    const updatedRituals = state.mt2Rituals.map((r) => {
      if (r.ritualId === ritualId) {
        return {
          ...r,
          lastPerformed: Date.now(),
          timesPerformed: r.timesPerformed + 1,
          cooldownRemaining: ritualDef.durationCycles,
        };
      }
      return r;
    });

    const blessingMultiplier = state.mt2ActiveBlessing ? 1.3 : 1;
    const eventMultiplier = state.mt2ActiveEvent
      ? MT2_LUNAR_EVENTS.find((e) => e.id === state.mt2ActiveEvent)?.bonusMultiplier ?? 1
      : 1;
    const totalMultiplier = blessingMultiplier * eventMultiplier;

    const newTotalRituals = state.mt2TotalRitualsPerformed + 1;

    setState((prev) => ({
      ...prev,
      mt2Rituals: updatedRituals,
      mt2Devotion: prev.mt2Devotion - ritualDef.devotionCost,
      mt2TotalRitualsPerformed: newTotalRituals,
    }));

    mt2AddExp(Math.floor(ritualDef.rewards.exp * totalMultiplier));
    mt2AddDevotion(Math.floor(ritualDef.rewards.devotion * totalMultiplier));

    if (Math.random() < ritualDef.rewards.artifactChance * totalMultiplier) {
      const chamberArtifacts = MT2_ARTIFACTS.filter(
        (a) => !state.mt2Artifacts.find((sa) => sa.artifactId === a.id && sa.discovered)
      );
      if (chamberArtifacts.length > 0) {
        const randomArtifact = chamberArtifacts[Math.floor(Math.random() * chamberArtifacts.length)];
        mt2DiscoverArtifact(randomArtifact.id);
      }
    }

    mt2Persist();
    return true;
  }

  function mt2GetRitualCooldown(ritualId: MT2RitualId): number {
    const ritualState = state.mt2Rituals.find((r) => r.ritualId === ritualId);
    return ritualState ? ritualState.cooldownRemaining : 0;
  }

  function mt2CanPerformRitual(ritualId: MT2RitualId): boolean {
    const ritualDef = MT2_RITUALS.find((r) => r.id === ritualId);
    if (!ritualDef) return false;
    if (state.mt2Rank < ritualDef.rankRequired) return false;
    if (state.mt2Devotion < ritualDef.devotionCost) return false;
    if (ritualDef.phaseRequired !== null) {
      const currentPhaseId = MT2_MOON_PHASES[state.mt2MoonPhase].id;
      if (currentPhaseId !== ritualDef.phaseRequired) return false;
    }
    const ritualState = state.mt2Rituals.find((r) => r.ritualId === ritualId);
    if (ritualState && ritualState.cooldownRemaining > 0) return false;
    return true;
  }

  function mt2TriggerLunarEvent(eventId: MT2LunarEvent): void {
    const eventDef = MT2_LUNAR_EVENTS.find((e) => e.id === eventId);
    if (!eventDef) return;

    setState((prev) => ({
      ...prev,
      mt2ActiveEvent: eventId,
      mt2EventDaysRemaining: eventDef.durationDays,
    }));
    mt2Persist();
  }

  function mt2GetActiveEvent(): MT2LunarEventDef | null {
    if (!state.mt2ActiveEvent) return null;
    return MT2_LUNAR_EVENTS.find((e) => e.id === state.mt2ActiveEvent) ?? null;
  }

  function mt2GetEventDaysRemaining(): number {
    return state.mt2EventDaysRemaining;
  }

  function mt2StartMeditation(sessionId: string): void {
    const sessionDef = MT2_MEDITATION_SESSIONS.find((s) => s.id === sessionId);
    if (!sessionDef) return;

    const phase = MT2_MOON_PHASES[state.mt2MoonPhase];
    const phaseBonus = sessionDef.phaseBonus === phase.id ? phase.meditationBonus : 0;
    const blessingBonus = state.mt2ActiveBlessing ? 15 : 0;
    const startingSerenity = sessionDef.baseSerenity + phaseBonus + blessingBonus;

    setState((prev) => ({
      ...prev,
      mt2CurrentSerenity: Math.min(startingSerenity, 100),
    }));
    mt2Persist();
  }

  function mt2RecordWordFormed(): void {
    setState((prev) => ({
      ...prev,
      mt2WordsFormedDuringMeditation: prev.mt2WordsFormedDuringMeditation + 1,
      mt2CurrentSerenity: Math.min(prev.mt2CurrentSerenity + 3, 100),
    }));
    mt2Persist();
  }

  function mt2EndMeditation(serenity: number): void {
    const today = mt2GetTodayString();
    const clampedSerenity = Math.max(0, Math.min(100, serenity));
    const isNewMeditation = state.mt2LastMeditationDate !== today;

    let newStreak = state.mt2MeditationStreak;
    let newPerfect = state.mt2PerfectMeditations;

    if (isNewMeditation) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      if (state.mt2LastMeditationDate === yesterdayStr) {
        newStreak += 1;
      } else if (state.mt2LastMeditationDate !== today) {
        newStreak = 1;
      }
    }

    if (clampedSerenity >= 95) {
      newPerfect += 1;
    }

    const expGain = Math.floor(clampedSerenity * 0.5) + (newStreak > 3 ? 10 : 0);
    const devotionGain = Math.floor(clampedSerenity * 0.2);

    setState((prev) => ({
      ...prev,
      mt2CurrentSerenity: 0,
      mt2TotalSerenity: prev.mt2TotalSerenity + clampedSerenity,
      mt2BestSerenity: Math.max(prev.mt2BestSerenity, clampedSerenity),
      mt2MeditationSessionsCompleted: prev.mt2MeditationSessionsCompleted + 1,
      mt2MeditationStreak: newStreak,
      mt2LastMeditationDate: today,
      mt2TotalMeditationsCompleted: prev.mt2TotalMeditationsCompleted + 1,
      mt2PerfectMeditations: newPerfect,
    }));

    mt2AddExp(expGain);
    mt2AddDevotion(devotionGain);
    mt2Persist();
  }

  function mt2CompleteDailyGazing(): boolean {
    const today = mt2GetTodayString();
    if (state.mt2DailyGazingCompleted && state.mt2LastGazingDate === today) return false;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    let newStreak = 1;
    if (state.mt2LastGazingDate === yesterdayStr) {
      newStreak = state.mt2DailyGazingStreak + 1;
    }

    setState((prev) => ({
      ...prev,
      mt2DailyGazingCompleted: true,
      mt2LastGazingDate: today,
      mt2DailyGazingStreak: newStreak,
    }));

    mt2AddExp(5 + Math.min(newStreak, 10));
    mt2AddDevotion(2 + Math.floor(newStreak * 0.5));
    mt2Persist();
    return true;
  }

  function mt2GetGazingStreak(): number {
    return state.mt2DailyGazingStreak;
  }

  function mt2GetMeditationStreak(): number {
    return state.mt2MeditationStreak;
  }

  function mt2GetTodaysGazing(): boolean {
    const today = mt2GetTodayString();
    return state.mt2DailyGazingCompleted && state.mt2LastGazingDate === today;
  }

  function mt2CheckAchievements(): string[] {
    const newlyUnlocked: string[] = [];

    for (const achievement of MT2_ACHIEVEMENTS) {
      const stateValue = state[achievement.conditionKey as keyof MT2MoonTempleState] as number | undefined;
      if (stateValue === undefined) continue;

      const alreadyUnlocked = state.mt2Achievements.find(
        (a) => a.achievementId === achievement.id
      );

      if (!alreadyUnlocked?.unlocked && stateValue >= achievement.targetValue) {
        newlyUnlocked.push(achievement.id);
      }
    }

    return newlyUnlocked;
  }

  function mt2ClaimAchievement(achievementId: string): boolean {
    const achievementDef = MT2_ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!achievementDef) return false;

    const existing = state.mt2Achievements.find((a) => a.achievementId === achievementId);
    if (!existing || existing.unlocked) return false;

    const stateValue = state[achievementDef.conditionKey as keyof MT2MoonTempleState] as number | undefined;
    if (stateValue === undefined || stateValue < achievementDef.targetValue) return false;

    const updatedAchievements = state.mt2Achievements.map((a) => {
      if (a.achievementId === achievementId) {
        return { ...a, unlocked: true, unlockedAt: Date.now() };
      }
      return a;
    });

    setState((prev) => ({
      ...prev,
      mt2Achievements: updatedAchievements,
    }));

    mt2AddExp(achievementDef.rewardExp);
    mt2AddDevotion(achievementDef.rewardDevotion);
    mt2Persist();
    return true;
  }

  function mt2GetUnlockedAchievements(): string[] {
    return state.mt2Achievements.filter((a) => a.unlocked).map((a) => a.achievementId);
  }

  function mt2GetChamberProgress(chamberId: MT2ChamberId): MT2ChamberState | null {
    return state.mt2Chambers.find((ch) => ch.chamberId === chamberId) ?? null;
  }

  function mt2GetMoonPhaseBonus(phaseId: MT2PhaseId): number {
    const phaseDef = MT2_MOON_PHASES.find((p) => p.id === phaseId);
    return phaseDef ? phaseDef.powerMultiplier : 1;
  }

  function mt2GetPhaseMultiplier(): number {
    return MT2_MOON_PHASES[state.mt2MoonPhase].powerMultiplier;
  }

  function mt2GetRankProgress(): { current: number; required: number; percent: number } {
    if (state.mt2Rank >= 50) {
      return { current: 0, required: 1, percent: 100 };
    }
    const rankDef = MT2_RANKS.find((r) => r.rank === state.mt2Rank);
    if (!rankDef) return { current: 0, required: 1, percent: 0 };
    return {
      current: state.mt2Exp,
      required: rankDef.expRequired,
      percent: Math.floor((state.mt2Exp / rankDef.expRequired) * 100),
    };
  }

  function mt2ResetProgress(): void {
    const freshState = createInitialState();
    setState(freshState);
    mt2Persist();
  }

  function mt2ForcePhase(phaseIndex: number): void {
    const clampedIndex = Math.max(0, Math.min(7, phaseIndex));
    setState((prev) => ({
      ...prev,
      mt2MoonPhase: clampedIndex,
      mt2MoonPhaseName: MT2_MOON_PHASES[clampedIndex].id,
    }));
    mt2Persist();
  }

  // ---- Expose persistVersion to suppress unused variable warning ----
  void persistVersion;

  return {
    ...state,
    mt2GetLevel,
    mt2GetRankTitle,
    mt2GetMana,
    mt2GetSerenity,
    mt2GetSerenityLevel,
    mt2GetCurrentPhase,
    mt2GetCurrentPhaseIndex,
    mt2AdvancePhase,
    mt2AdvanceDay,
    mt2AddExp,
    mt2AddDevotion,
    mt2SpendDevotion,
    mt2EnterChamber,
    mt2LeaveChamber,
    mt2ExploreChamber,
    mt2DiscoverArtifact,
    mt2EquipArtifact,
    mt2UnequipArtifact,
    mt2GetEquippedArtifacts,
    mt2GetArtifactPower,
    mt2OfferToDeity,
    mt2ActivateBlessing,
    mt2GetDeityDevotion,
    mt2GetBlessingStatus,
    mt2SolveRiddle,
    mt2UseHint,
    mt2GetRiddleProgress,
    mt2PerformRitual,
    mt2GetRitualCooldown,
    mt2CanPerformRitual,
    mt2TriggerLunarEvent,
    mt2GetActiveEvent,
    mt2GetEventDaysRemaining,
    mt2StartMeditation,
    mt2RecordWordFormed,
    mt2EndMeditation,
    mt2CompleteDailyGazing,
    mt2GetGazingStreak,
    mt2GetMeditationStreak,
    mt2GetTodaysGazing,
    mt2CheckAchievements,
    mt2ClaimAchievement,
    mt2GetUnlockedAchievements,
    mt2GetChamberProgress,
    mt2GetMoonPhaseBonus,
    mt2GetPhaseMultiplier,
    mt2GetRankProgress,
    mt2ResetProgress,
    mt2ForcePhase,
  };
}
