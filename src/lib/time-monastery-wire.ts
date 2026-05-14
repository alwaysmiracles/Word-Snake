'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'

// =============================================================================
// Time Monastery Wire — SSR-safe module for the Word Snake game
// Explore time chambers, collect chronicles, harvest artifacts, build structures,
// master temporal abilities, unlock achievements and titles, traverse branching
// timelines, and observe historical epochs.
// All exported functions use the `tm` prefix. All constants use the `TM_` prefix.
// =============================================================================

// =============================================================================
// Type Definitions
// =============================================================================

export type TMRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type TMChamberId =
  | 'past_hall'
  | 'future_nexus'
  | 'present_sanctum'
  | 'frozen_moment'
  | 'accelerated_garden'
  | 'eternal_library'
  | 'temporal_forge'
  | 'infinity_atrium'
export type TMEra =
  | 'dawn_of_time'
  | 'ancient_civilization'
  | 'medieval_age'
  | 'renaissance'
  | 'industrial_era'
  | 'modern_age'
  | 'digital_age'
  | 'far_future'
  | 'end_of_time'
  | 'timeless_void'
export type TMDangerLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
export type TMParadoxLevel = 'stable' | 'wavering' | 'unstable' | 'critical' | 'collapsed'
export type TMChronicleSignificance = 'trivial' | 'minor' | 'notable' | 'major' | 'worldchanging'
export type TMAbilityType = 'active' | 'passive' | 'ultimate'
export type TMArtifactCategory = 'hourglass' | 'time_crystal' | 'chronos_shard' | 'epoch_relic' | 'paradox_core' | 'temporal_essence'
export type TMStructureType = 'clock_tower' | 'meditation_hall' | 'time_vault' | 'library' | 'forge' | 'garden' | 'gateway' | 'shrine' | 'observatory' | 'sanctum'

export interface TMChamberDef {
  id: TMChamberId
  name: string
  description: string
  timeEra: TMEra
  dangerLevel: TMDangerLevel
  unlockLevel: number
  color: string
  emoji: string
}

export interface TMChronicleDef {
  id: string
  name: string
  rarity: TMRarity
  era: TMEra
  significance: TMChronicleSignificance
  description: string
  emoji: string
}

export interface TMArtifactDef {
  id: string
  name: string
  rarity: TMRarity
  category: TMArtifactCategory
  description: string
  timePower: number
  emoji: string
}

export interface TMStructureDef {
  id: string
  name: string
  type: TMStructureType
  description: string
  maxLevel: number
  baseCost: number
  costPerLevel: number
  effectPerLevel: string
  emoji: string
}

export interface TMAbilityDef {
  id: string
  name: string
  description: string
  type: TMAbilityType
  cooldown: number
  power: number
  unlockLevel: number
  emoji: string
}

export interface TMAchievementDef {
  id: string
  name: string
  description: string
  condition: string
  reward: { gold: number; timeEnergy: number; exp: number }
  emoji: string
}

export interface TMTitleDef {
  id: string
  name: string
  levelRequired: number
  description: string
  emoji: string
}

export interface TMTimelineDef {
  id: string
  name: string
  description: string
  paradoxRisk: number
  reward: { gold: number; exp: number; artifactChance: number }
  unlockLevel: number
  emoji: string
}

export interface TMEpochEvent {
  id: string
  name: string
  description: string
}

export interface TMEpochDef {
  id: string
  name: string
  description: string
  timePeriod: string
  artifacts: string[]
  events: TMEpochEvent[]
  unlockLevel: number
  emoji: string
}

export interface TMChamberState {
  id: TMChamberId
  unlocked: boolean
  visits: number
  lastVisitAt: number | null
}

export interface TMChronicleState {
  id: string
  collected: boolean
  collectedAt: number | null
  readCount: number
}

export interface TMArtifactState {
  id: string
  owned: boolean
  obtainedAt: number | null
  enhanced: boolean
  enhanceLevel: number
}

export interface TMStructureState {
  id: string
  level: number
  built: boolean
  builtAt: number | null
}

export interface TMAchievementState {
  id: string
  unlocked: boolean
  unlockedAt: number | null
}

export interface TMTimelineState {
  id: string
  explored: boolean
  repaired: boolean
  completedAt: number | null
}

export interface TMEpochState {
  id: string
  observed: boolean
  observedAt: number | null
  artifactsFound: number
  eventsDiscovered: number
}

export interface TMTimeMonasteryState {
  chambers: TMChamberState[]
  chronicles: TMChronicleState[]
  artifacts: TMArtifactState[]
  structures: TMStructureState[]
  achievements: TMAchievementState[]
  timelines: TMTimelineState[]
  epochs: TMEpochState[]
  currentTitle: string
  monasteryLevel: number
  monasteryExp: number
  gold: number
  timeEnergy: number
  maxTimeEnergy: number
  temporalFlux: number
  currentTime: number
  activeChamberId: TMChamberId | null
  activeTimelineId: string | null
  totalTimeTraveled: number
  totalChronicles: number
  totalArtifacts: number
  paradoxMeter: number
  masteryLevel: number
}

// =============================================================================
// Helpers
// =============================================================================

export const TM_MAX_LEVEL = 50
export const TM_MAX_PARADOX = 100
export const TM_MAX_TEMPORAL_FLUX = 1000

function tmXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= TM_MAX_LEVEL) return Infinity
  return Math.floor(120 * level * (1 + level * 0.14))
}

export const TM_XP_TABLE: number[] = []
for (let i = 0; i <= TM_MAX_LEVEL; i++) {
  TM_XP_TABLE.push(tmXpForLevel(i))
}

function tmClampLevel(lvl: number): number {
  return Math.max(1, Math.min(TM_MAX_LEVEL, lvl))
}

function tmClampValue(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function tmNow(): number {
  return Date.now()
}

function tmRarityMultiplier(r: TMRarity): number {
  const map: Record<TMRarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    epic: 3.5,
    legendary: 6,
  }
  return map[r] ?? 1
}

// =============================================================================
// Color Constants (8)
// =============================================================================

export const TM_COLOR_HOURGLASS = '#DAA520'
export const TM_COLOR_CHRONICLE = '#8B4513'
export const TM_COLOR_PAST = '#C4A882'
export const TM_COLOR_FUTURE = '#00BFFF'
export const TM_COLOR_FROZEN = '#B0E0E6'
export const TM_COLOR_ETERNAL = '#4B0082'
export const TM_COLOR_PARADOX = '#FF6347'
export const TM_COLOR_INFINITY = '#191970'

// =============================================================================
// Constants: TM_CHAMBERS (8 time chambers)
// =============================================================================

export const TM_CHAMBERS: TMChamberDef[] = [
  {
    id: 'past_hall',
    name: 'Past Hall',
    description: 'A grand hall where echoes of history resonate through crystalline pillars. Ancient memories shimmer in the air like golden dust, revealing forgotten truths of civilizations long gone.',
    timeEra: 'ancient_civilization',
    dangerLevel: 2,
    unlockLevel: 1,
    color: TM_COLOR_PAST,
    emoji: '🏛️',
  },
  {
    id: 'future_nexus',
    name: 'Future Nexus',
    description: 'A convergence point where countless possible futures intersect. Holographic timelines spiral around a central vortex, each one a path not yet taken, a destiny not yet forged.',
    timeEra: 'far_future',
    dangerLevel: 6,
    unlockLevel: 8,
    color: TM_COLOR_FUTURE,
    emoji: '🔮',
  },
  {
    id: 'present_sanctum',
    name: 'Present Sanctum',
    description: 'A meditative space anchored in the eternal now. Here, past and future dissolve into a single point of clarity, and the monastery\'s true power is found in stillness.',
    timeEra: 'modern_age',
    dangerLevel: 1,
    unlockLevel: 1,
    color: '#FFD700',
    emoji: '🧘',
  },
  {
    id: 'frozen_moment',
    name: 'Frozen Moment',
    description: 'A chamber where a single instant has been locked in perfect stasis. Dewdrops hang suspended mid-fall, and the expressions of visitors from ages past are preserved forever.',
    timeEra: 'timeless_void',
    dangerLevel: 4,
    unlockLevel: 12,
    color: TM_COLOR_FROZEN,
    emoji: '❄️',
  },
  {
    id: 'accelerated_garden',
    name: 'Accelerated Garden',
    description: 'A lush garden where time flows ten thousand times faster. Seeds sprout, bloom, wither, and return to earth in the span of a single breath, an endless cycle of renewal.',
    timeEra: 'dawn_of_time',
    dangerLevel: 3,
    unlockLevel: 15,
    color: '#32CD32',
    emoji: '🌸',
  },
  {
    id: 'eternal_library',
    name: 'Eternal Library',
    description: 'An infinite library containing every book ever written and every book that will ever be written. The shelves stretch beyond perception, organized by temporal resonance rather than alphabet.',
    timeEra: 'timeless_void',
    dangerLevel: 5,
    unlockLevel: 20,
    color: TM_COLOR_ETERNAL,
    emoji: '📚',
  },
  {
    id: 'temporal_forge',
    name: 'Temporal Forge',
    description: 'A forge that burns with the heat of compressed time. Here, chronomancers hammer paradox-steel and fold moments into weapons of incredible temporal power.',
    timeEra: 'industrial_era',
    dangerLevel: 7,
    unlockLevel: 28,
    color: '#FF4500',
    emoji: '🔨',
  },
  {
    id: 'infinity_atrium',
    name: 'Infinity Atrium',
    description: 'The heart of the monastery, a vast open space where time itself is visible as shimmering threads connecting all moments. To stand here is to see the tapestry of existence.',
    timeEra: 'timeless_void',
    dangerLevel: 9,
    unlockLevel: 40,
    color: TM_COLOR_INFINITY,
    emoji: '♾️',
  },
]

// =============================================================================
// Constants: TM_CHRONICLES (35 chronicles, 5 rarity tiers, 7 per tier)
// =============================================================================

export const TM_CHRONICLES: TMChronicleDef[] = [
  // Common (7)
  {
    id: 'chr_c1', name: 'First Dawn', rarity: 'common', era: 'dawn_of_time',
    significance: 'trivial', description: 'A simple account of the first sunrise ever witnessed by sentient beings, written in a language that predates all known tongues.',
    emoji: '🌅',
  },
  {
    id: 'chr_c2', name: 'The Village Clockmaker', rarity: 'common', era: 'medieval_age',
    significance: 'trivial', description: 'The diary of an anonymous clockmaker whose inventions were centuries ahead of their time, hinting at impossible temporal knowledge.',
    emoji: '⏰',
  },
  {
    id: 'chr_c3', name: 'Market Day Ledger', rarity: 'common', era: 'ancient_civilization',
    significance: 'trivial', description: 'A merchant\'s ledger from Babylon that records trades in goods that would not exist for another two thousand years.',
    emoji: '📜',
  },
  {
    id: 'chr_c4', name: 'The Letter Never Sent', rarity: 'common', era: 'renaissance',
    significance: 'minor', description: 'A love letter discovered in a Florence wall, addressed to someone who would not be born for four hundred years.',
    emoji: '💌',
  },
  {
    id: 'chr_c5', name: 'Schoolyard Prophecy', rarity: 'common', era: 'modern_age',
    significance: 'trivial', description: 'A child\'s school essay from 1952 that accurately predicts the rise of the internet, smartphones, and social media.',
    emoji: '📝',
  },
  {
    id: 'chr_c6', name: 'The Abandoned Hourglass', rarity: 'common', era: 'industrial_era',
    significance: 'trivial', description: 'An hourglass found in a London factory that runs backward when placed near certain electromagnetic fields.',
    emoji: '⏳',
  },
  {
    id: 'chr_c7', name: 'Fisherman\'s Tale', rarity: 'common', era: 'ancient_civilization',
    significance: 'minor', description: 'A fisherman\'s oral tale transcribed by monks, describing a great flood that matches no known historical deluge.',
    emoji: '🎣',
  },
  // Uncommon (7)
  {
    id: 'chr_u1', name: 'The Pharaoh\'s Star Map', rarity: 'uncommon', era: 'ancient_civilization',
    significance: 'minor', description: 'A star map found in an uninscribed chamber of the Great Pyramid that shows constellations from 12,000 years in the future.',
    emoji: '🗺️',
  },
  {
    id: 'chr_u2', name: 'Da Vinci\'s Lost Notebook', rarity: 'uncommon', era: 'renaissance',
    significance: 'notable', description: 'A notebook page from da Vinci\'s workshop containing designs for a device that appears to manipulate local gravity fields.',
    emoji: '📓',
  },
  {
    id: 'chr_u3', name: 'The Quantum Monk', rarity: 'uncommon', era: 'digital_age',
    significance: 'notable', description: 'The diary of a Tibetan monk who, during deep meditation, experienced what physicists would later call quantum superposition.',
    emoji: '🧘',
  },
  {
    id: 'chr_u4', name: 'Railroad Ghost Train', rarity: 'uncommon', era: 'industrial_era',
    significance: 'minor', description: 'A newspaper clipping from 1888 about a train that arrived at its destination six minutes before it departed.',
    emoji: '🚂',
  },
  {
    id: 'chr_u5', name: 'The Viking Navigator', rarity: 'uncommon', era: 'medieval_age',
    significance: 'minor', description: 'A Viking navigation rune that, when interpreted correctly, reveals the exact coordinates of land masses not yet discovered.',
    emoji: '🧭',
  },
  {
    id: 'chr_u6', name: 'Telegraph Code Omega', rarity: 'uncommon', era: 'industrial_era',
    significance: 'notable', description: 'A telegraph code used by a secret society that transmitted messages to themselves across different decades.',
    emoji: '📡',
  },
  {
    id: 'chr_u7', name: 'The Child Who Remembered', rarity: 'uncommon', era: 'modern_age',
    significance: 'notable', description: 'A psychological case study of a child who possessed memories of living in the 18th century, with verifiable details.',
    emoji: '👶',
  },
  // Rare (7)
  {
    id: 'chr_r1', name: 'The Sumerian Time Tablet', rarity: 'rare', era: 'ancient_civilization',
    significance: 'major', description: 'A cuneiform tablet from Ur that describes the physics of time dilation with mathematical precision impossible for its era.',
    emoji: '🪨',
  },
  {
    id: 'chr_r2', name: 'Tesla\'s Temporal Resonator', rarity: 'rare', era: 'industrial_era',
    significance: 'major', description: 'Nikola Tesla\'s private journal entries about a device that could transmit not just energy, but moments in time.',
    emoji: '⚡',
  },
  {
    id: 'chr_r3', name: 'The Maya Calendar Correction', rarity: 'rare', era: 'ancient_civilization',
    significance: 'major', description: 'A newly discovered Maya codex that corrects the Long Count calendar and reveals an embedded temporal coordinate system.',
    emoji: '🗓️',
  },
  {
    id: 'chr_r4', name: 'Einstein\'s Unfinished Letter', rarity: 'rare', era: 'modern_age',
    significance: 'major', description: 'A draft letter from Einstein to Gödel in which he acknowledges that closed timelike curves may be traversable by consciousness.',
    emoji: '✉️',
  },
  {
    id: 'chr_r5', name: 'The Library of Alexandria Fragment', rarity: 'rare', era: 'ancient_civilization',
    significance: 'notable', description: 'A surviving scroll from the Library of Alexandria describing temporal mechanics in terms of water flowing uphill.',
    emoji: '🏛️',
  },
  {
    id: 'chr_r6', name: 'Samurai Time-Keeper', rarity: 'rare', era: 'medieval_age',
    significance: 'major', description: 'A Japanese scroll describing a samurai clan that guarded a shrine capable of showing three seconds of the future.',
    emoji: '⚔️',
  },
  {
    id: 'chr_r7', name: 'The Radio Signal', rarity: 'rare', era: 'digital_age',
    significance: 'major', description: 'A recorded radio signal from 1997 that, when played backward, contains a conversation in a language not yet invented.',
    emoji: '📻',
  },
  // Epic (7)
  {
    id: 'chr_e1', name: 'The Chronos Codex', rarity: 'epic', era: 'dawn_of_time',
    significance: 'worldchanging', description: 'A codex written in the primordial language of time itself. Those who read it report experiencing all their future memories simultaneously.',
    emoji: '📖',
  },
  {
    id: 'chr_e2', name: 'Merlin\'s True Grimoire', rarity: 'epic', era: 'medieval_age',
    significance: 'worldchanging', description: 'The authentic spellbook of Merlin, containing incantations that manipulate causality rather than matter, changing what has already happened.',
    emoji: '🔮',
  },
  {
    id: 'chr_e3', name: 'The Probability Engine', rarity: 'epic', era: 'digital_age',
    significance: 'worldchanging', description: 'A computational manuscript describing an algorithm that can calculate and collapse quantum probability fields, choosing desired outcomes.',
    emoji: '🖥️',
  },
  {
    id: 'chr_e4', name: 'The Rosetta Stone of Time', rarity: 'epic', era: 'ancient_civilization',
    significance: 'worldchanging', description: 'A multi-dimensional inscription that translates temporal phenomena into visual patterns readable by the human mind.',
    emoji: '🔶',
  },
  {
    id: 'chr_e5', name: 'Tesla\'s Wardenclyffe Revelation', rarity: 'epic', era: 'industrial_era',
    significance: 'worldchanging', description: 'Blueprints and notes from Wardenclyffe Tower revealing its true purpose was not wireless power, but wireless time transmission.',
    emoji: '🗼',
  },
  {
    id: 'chr_e6', name: 'The Enigma of Gödel', rarity: 'epic', era: 'modern_age',
    significance: 'worldchanging', description: 'Kurt Gödel\'s lost proof demonstrating that mathematical incompleteness arises from temporal paradoxes embedded in formal systems.',
    emoji: '🧮',
  },
  {
    id: 'chr_e7', name: 'The Dreamtime Songlines', rarity: 'epic', era: 'dawn_of_time',
    significance: 'worldchanging', description: 'Aboriginal songlines that, when sung in the correct sequence, create a temporal corridor connecting the dreamtime to the present.',
    emoji: '🎵',
  },
  // Legendary (7)
  {
    id: 'chr_l1', name: 'The Book of All Moments', rarity: 'legendary', era: 'timeless_void',
    significance: 'worldchanging', description: 'A book that writes itself as events unfold across all timelines simultaneously. Reading any page reveals a truth about the nature of existence.',
    emoji: '📕',
  },
  {
    id: 'chr_l2', name: 'The Architect\'s Blueprint', rarity: 'legendary', era: 'dawn_of_time',
    significance: 'worldchanging', description: 'The original design document for the universe, annotated with margin notes from the creator suggesting revisions that were never implemented.',
    emoji: '📐',
  },
  {
    id: 'chr_l3', name: 'The Final Chronicle', rarity: 'legendary', era: 'end_of_time',
    significance: 'worldchanging', description: 'The last document ever written in the universe, describing the exact moment when time itself chose to stop and why.',
    emoji: '🌑',
  },
  {
    id: 'chr_l4', name: 'The Paradox Gospel', rarity: 'legendary', era: 'timeless_void',
    significance: 'worldchanging', description: 'A text that exists in all timelines simultaneously, each copy containing different information. Only by comparing all copies can the truth be known.',
    emoji: '✝️',
  },
  {
    id: 'chr_l5', name: 'The First Chronomancer\'s Journal', rarity: 'legendary', era: 'dawn_of_time',
    significance: 'worldchanging', description: 'The personal journal of the first being to consciously manipulate time, detailing the discovery and its terrifying consequences.',
    emoji: '📓',
  },
  {
    id: 'chr_l6', name: 'The Omega Equation', rarity: 'legendary', era: 'far_future',
    significance: 'worldchanging', description: 'A single equation written on a scrap of quantum paper that, when solved, grants complete mastery over the flow of time.',
    emoji: '∑',
  },
  {
    id: 'chr_l7', name: 'The Eternity Scroll', rarity: 'legendary', era: 'end_of_time',
    significance: 'worldchanging', description: 'A scroll that unrolls infinitely, containing the complete history of every timeline that ever existed or will exist, written in real-time.',
    emoji: '📜',
  },
]

// =============================================================================
// Constants: TM_ARTIFACTS (30 temporal artifacts)
// =============================================================================

export const TM_ARTIFACTS: TMArtifactDef[] = [
  // Hourglasses (6)
  {
    id: 'art_hg1', name: 'Sands of Antiquity', rarity: 'common', category: 'hourglass',
    description: 'An hourglass filled with sand from the oldest desert on Earth, each grain a compressed moment from prehistoric time.',
    timePower: 5, emoji: '⏳',
  },
  {
    id: 'art_hg2', name: 'Celestial Hourglass', rarity: 'uncommon', category: 'hourglass',
    description: 'An hourglass that measures time by the movement of stars rather than gravity. Its sand glows with starlight.',
    timePower: 12, emoji: '⌛',
  },
  {
    id: 'art_hg3', name: 'Reversal Glass', rarity: 'rare', category: 'hourglass',
    description: 'When flipped, this hourglass rewinds events within a ten-foot radius by exactly thirty seconds.',
    timePower: 25, emoji: '⏪',
  },
  {
    id: 'art_hg4', name: 'Eternity Sandglass', rarity: 'epic', category: 'hourglass',
    description: 'An hourglass whose sand never runs out. It is said to contain exactly one eternity\'s worth of moments.',
    timePower: 55, emoji: '♾️',
  },
  {
    id: 'art_hg5', name: 'Paradox Hourglass', rarity: 'legendary', category: 'hourglass',
    description: 'The top and bottom of this hourglass are the same chamber. The sand flows upward and downward simultaneously, creating stable paradoxes.',
    timePower: 100, emoji: '🌀',
  },
  {
    id: 'art_hg6', name: 'Frozen Tears of Time', rarity: 'rare', category: 'hourglass',
    description: 'An hourglass filled with crystallized moments of grief from different timelines, each tear a window into a different past.',
    timePower: 22, emoji: '💧',
  },
  // Time Crystals (6)
  {
    id: 'art_tc1', name: 'Chrono Shard', rarity: 'common', category: 'time_crystal',
    description: 'A small crystal that pulses with a steady temporal rhythm, like a heartbeat measured in centuries.',
    timePower: 4, emoji: '💎',
  },
  {
    id: 'art_tc2', name: 'Paradox Diamond', rarity: 'uncommon', category: 'time_crystal',
    description: 'A diamond that reflects every possible timeline in its facets. Looking into it reveals infinite versions of yourself.',
    timePower: 14, emoji: '💠',
  },
  {
    id: 'art_tc3', name: 'Temporal Sapphire', rarity: 'rare', category: 'time_crystal',
    description: 'A deep blue sapphire that slows time in its immediate vicinity, useful for extended meditation sessions.',
    timePower: 28, emoji: '🔵',
  },
  {
    id: 'art_tc4', name: 'Eternity Emerald', rarity: 'epic', category: 'time_crystal',
    description: 'An emerald that exists in all moments simultaneously. It glows brightest at the exact moment of a temporal event.',
    timePower: 60, emoji: '💚',
  },
  {
    id: 'art_tc5', name: 'Genesis Crystal', rarity: 'legendary', category: 'time_crystal',
    description: 'The first crystal ever formed in the universe, containing a compressed recording of the Big Bang\'s first femtosecond.',
    timePower: 110, emoji: '🌟',
  },
  {
    id: 'art_tc6', name: 'Frozen Ruby', rarity: 'rare', category: 'time_crystal',
    description: 'A ruby so cold it has trapped a moment of absolute zero within its lattice structure, freezing time at the quantum level.',
    timePower: 30, emoji: '🔴',
  },
  // Chronos Shards (6)
  {
    id: 'art_cs1', name: 'Fragment of Epoch', rarity: 'common', category: 'chronos_shard',
    description: 'A shard broken from the Epoch Stone, containing the compressed temporal energy of an entire century.',
    timePower: 6, emoji: '🧩',
  },
  {
    id: 'art_cs2', name: 'Timeline Splinter', rarity: 'uncommon', category: 'chronos_shard',
    description: 'A splinter from a diverged timeline that retains the memory of the path not taken.',
    timePower: 15, emoji: '🪵',
  },
  {
    id: 'art_cs3', name: 'Paradox Core Fragment', rarity: 'rare', category: 'chronos_shard',
    description: 'A fragment of a collapsed paradox that generates raw temporal energy through self-contradiction.',
    timePower: 35, emoji: '💥',
  },
  {
    id: 'art_cs4', name: 'The Stillness Shard', rarity: 'epic', category: 'chronos_shard',
    description: 'A shard of perfect temporal stillness. Time stops within three feet of it, making it both powerful and dangerous.',
    timePower: 65, emoji: '🧊',
  },
  {
    id: 'art_cs5', name: 'Omega Shard', rarity: 'legendary', category: 'chronos_shard',
    description: 'A shard from the end of time itself. It hums with the energy of entropy and can accelerate the decay of any temporal structure.',
    timePower: 120, emoji: '🕳️',
  },
  {
    id: 'art_cs6', name: 'Convergence Fragment', rarity: 'rare', category: 'chronos_shard',
    description: 'A fragment from the point where all timelines reconverge. It vibrates when parallel choices are about to be made.',
    timePower: 27, emoji: '🔄',
  },
  // Epoch Relics (6)
  {
    id: 'art_er1', name: 'Babylonian Sundial', rarity: 'common', category: 'epoch_relic',
    description: 'A sundial from ancient Babylon that casts shadows at impossible angles, revealing the time in multiple eras at once.',
    timePower: 7, emoji: '☀️',
  },
  {
    id: 'art_er2', name: 'Medieval Astrolabe', rarity: 'uncommon', category: 'epoch_relic',
    description: 'An astrolabe that charts the movement of time itself through the celestial sphere, predicting temporal events like eclipses.',
    timePower: 16, emoji: '🔭',
  },
  {
    id: 'art_er3', name: 'Renaissance Chronograph', rarity: 'rare', category: 'epoch_relic',
    description: 'A clockwork chronograph from Leonardo\'s workshop that can measure temporal distortions invisible to the naked eye.',
    timePower: 32, emoji: '⏱️',
  },
  {
    id: 'art_er4', name: 'Tesla\'s Temporal Coil', rarity: 'epic', category: 'epoch_relic',
    description: 'One of Tesla\'s experimental coils that accidentally created a temporal field, still faintly humming with displaced energy.',
    timePower: 58, emoji: '🔌',
  },
  {
    id: 'art_er5', name: 'The Doomsday Clock Hand', rarity: 'legendary', category: 'epoch_relic',
    description: 'The original hand from the Doomsday Clock, imbued with the collective anxiety of the atomic age and capable of accelerating time.',
    timePower: 95, emoji: '🕰️',
  },
  {
    id: 'art_er6', name: 'Quantum Timepiece', rarity: 'rare', category: 'epoch_relic',
    description: 'A watch from a future era that displays time in quantum states — showing all possible times until observed.',
    timePower: 29, emoji: '⌚',
  },
  // Temporal Essences (6)
  {
    id: 'art_te1', name: 'Dew of Dawn', rarity: 'common', category: 'temporal_essence',
    description: 'Morning dew collected from the exact moment of sunrise, containing the essence of new beginnings.',
    timePower: 3, emoji: '🌾',
  },
  {
    id: 'art_te2', name: 'Twilight Extract', rarity: 'uncommon', category: 'temporal_essence',
    description: 'Distilled from the last light of dusk, this essence preserves transitions and is used in temporal healing.',
    timePower: 11, emoji: '🌆',
  },
  {
    id: 'art_te3', name: 'Void Essence', rarity: 'rare', category: 'temporal_essence',
    description: 'Essence harvested from the space between moments, a pure form of temporal energy that can fuel advanced chronomancy.',
    timePower: 38, emoji: '🫧',
  },
  {
    id: 'art_te4', name: 'Convergence Oil', rarity: 'epic', category: 'temporal_essence',
    description: 'An oil that forms at timeline convergence points, used to anoint temporal tools and increase their power dramatically.',
    timePower: 52, emoji: '🫗',
  },
  {
    id: 'art_te5', name: 'Primordial Nectar', rarity: 'legendary', category: 'temporal_essence',
    description: 'The essence of the first moment of creation, a single drop of which contains more temporal energy than a thousand paradoxes.',
    timePower: 105, emoji: '🍯',
  },
  {
    id: 'art_te6', name: 'Memory Amber', rarity: 'rare', category: 'temporal_essence',
    description: 'Amber-colored essence that preserves memories with perfect fidelity, allowing one to relive past moments in full sensory detail.',
    timePower: 24, emoji: '🍯',
  },
]

// =============================================================================
// Constants: TM_STRUCTURES (25 upgradeable monastery structures, level 1-10)
// =============================================================================

export const TM_STRUCTURES: TMStructureDef[] = [
  {
    id: 'str_ct1', name: 'Central Clock Tower', type: 'clock_tower',
    description: 'The main clock tower of the monastery, its pendulum regulating the temporal harmony of all surrounding chambers.',
    maxLevel: 10, baseCost: 100, costPerLevel: 80, effectPerLevel: '+5 max time energy', emoji: '🕐',
  },
  {
    id: 'str_ct2', name: 'East Wing Pendulum Tower', type: 'clock_tower',
    description: 'A secondary clock tower whose pendulum swings counterclockwise, stabilizing paradox-prone areas.',
    maxLevel: 10, baseCost: 150, costPerLevel: 90, effectPerLevel: '+3 paradox reduction', emoji: '🕖',
  },
  {
    id: 'str_ct3', name: 'West Wing Chrono Tower', type: 'clock_tower',
    description: 'The western clock tower tracks future timelines, providing early warnings of temporal disturbances.',
    maxLevel: 10, baseCost: 200, costPerLevel: 110, effectPerLevel: '+2% artifact find rate', emoji: '🕓',
  },
  {
    id: 'str_mh1', name: 'Hall of Inner Stillness', type: 'meditation_hall',
    description: 'A meditation hall where monks achieve temporal awareness through absolute mental silence.',
    maxLevel: 10, baseCost: 80, costPerLevel: 60, effectPerLevel: '+10% meditation exp', emoji: '🧘',
  },
  {
    id: 'str_mh2', name: 'Chamber of Echoing Thoughts', type: 'meditation_hall',
    description: 'A hall where past thoughts of meditators still resonate, accelerating new practitioners\' progress.',
    maxLevel: 10, baseCost: 120, costPerLevel: 70, effectPerLevel: '+8 mastery exp per session', emoji: '💭',
  },
  {
    id: 'str_mh3', name: 'Void Meditation Sanctum', type: 'meditation_hall',
    description: 'A chamber outside the normal flow of time, enabling deep meditative states that would take years in normal time.',
    maxLevel: 10, baseCost: 300, costPerLevel: 120, effectPerLevel: '+15 temporal flux per meditation', emoji: '🕳️',
  },
  {
    id: 'str_tv1', name: 'Bronze Time Vault', type: 'time_vault',
    description: 'A basic vault for storing temporal artifacts, lined with paradox-dampening bronze.',
    maxLevel: 10, baseCost: 100, costPerLevel: 65, effectPerLevel: '+5 artifact storage slots', emoji: '🏦',
  },
  {
    id: 'str_tv2', name: 'Silver Chrono Vault', type: 'time_vault',
    description: 'An upgraded vault with silver reinforcement that prevents temporal decay of stored items.',
    maxLevel: 10, baseCost: 250, costPerLevel: 100, effectPerLevel: '+10% artifact power retention', emoji: '🏦',
  },
  {
    id: 'str_tv3', name: 'Eternity Vault', type: 'time_vault',
    description: 'A vault existing outside of time, where artifacts remain in perfect condition indefinitely.',
    maxLevel: 10, baseCost: 500, costPerLevel: 150, effectPerLevel: '+20% artifact enhancement chance', emoji: '🏛️',
  },
  {
    id: 'str_lb1', name: 'Hall of Antiquities', type: 'library',
    description: 'The monastery\'s primary library, housing chronicles and records from every visited era.',
    maxLevel: 10, baseCost: 90, costPerLevel: 55, effectPerLevel: '+5 chronicle collection bonus', emoji: '📚',
  },
  {
    id: 'str_lb2', name: 'Archive of Futures', type: 'library',
    description: 'A specialized library containing predictions and prophecies from across all timelines.',
    maxLevel: 10, baseCost: 180, costPerLevel: 85, effectPerLevel: '+3 timeline insight per level', emoji: '📖',
  },
  {
    id: 'str_lb3', name: 'Infinite Codex Wing', type: 'library',
    description: 'A library wing that generates new chronicles based on quantum probability, revealing hidden truths.',
    maxLevel: 10, baseCost: 400, costPerLevel: 130, effectPerLevel: '+2% legendary chronicle chance', emoji: '📗',
  },
  {
    id: 'str_fg1', name: 'Apprentice Forge', type: 'forge',
    description: 'A basic forge for tempering temporal tools, fueled by compressed moments of heat.',
    maxLevel: 10, baseCost: 110, costPerLevel: 75, effectPerLevel: '+5% crafting success rate', emoji: '🔨',
  },
  {
    id: 'str_fg2', name: 'Paradox Forge', type: 'forge',
    description: 'A forge that harnesses paradox energy to create tools of immense temporal power.',
    maxLevel: 10, baseCost: 280, costPerLevel: 110, effectPerLevel: '+8 artifact power per craft', emoji: '⚒️',
  },
  {
    id: 'str_fg3', name: 'Genesis Forge', type: 'forge',
    description: 'The master forge, capable of creating new temporal artifacts from raw moments of creation.',
    maxLevel: 10, baseCost: 550, costPerLevel: 160, effectPerLevel: '+1 free artifact craft per level', emoji: '🔥',
  },
  {
    id: 'str_gd1', name: 'Serenity Garden', type: 'garden',
    description: 'A tranquil garden where time flows gently, restoring time energy for visiting chronomancers.',
    maxLevel: 10, baseCost: 70, costPerLevel: 50, effectPerLevel: '+3 time energy regen per hour', emoji: '🌱',
  },
  {
    id: 'str_gd2', name: 'Temporal Greenhouse', type: 'garden',
    description: 'A greenhouse where plants from different eras grow side by side, producing rare temporal essences.',
    maxLevel: 10, baseCost: 160, costPerLevel: 80, effectPerLevel: '+5% essence harvest yield', emoji: '🌺',
  },
  {
    id: 'str_gd3', name: 'Garden of Epochs', type: 'garden',
    description: 'The master garden containing specimens from every epoch, a living museum of temporal botany.',
    maxLevel: 10, baseCost: 350, costPerLevel: 120, effectPerLevel: '+10 temporal flux per harvest', emoji: '🌳',
  },
  {
    id: 'str_gw1', name: 'Past Gateway', type: 'gateway',
    description: 'A stabilized portal connecting the monastery to historical eras for safe time travel.',
    maxLevel: 10, baseCost: 200, costPerLevel: 95, effectPerLevel: '-5% travel paradox risk', emoji: '🚪',
  },
  {
    id: 'str_gw2', name: 'Future Gateway', type: 'gateway',
    description: 'A gateway tuned to possible futures, allowing observation and limited interaction with what may come.',
    maxLevel: 10, baseCost: 250, costPerLevel: 105, effectPerLevel: '+3 future insight per use', emoji: '🌀',
  },
  {
    id: 'str_gw3', name: 'Nexus Gateway', type: 'gateway',
    description: 'The master gateway that can access any point in any timeline, the pinnacle of temporal transportation.',
    maxLevel: 10, baseCost: 600, costPerLevel: 180, effectPerLevel: '-2% travel energy cost', emoji: '🌌',
  },
  {
    id: 'str_sh1', name: 'Shrine of the First Moment', type: 'shrine',
    description: 'A shrine dedicated to the first moment of time, granting blessings of temporal awareness.',
    maxLevel: 10, baseCost: 130, costPerLevel: 70, effectPerLevel: '+5% meditation quality', emoji: '⛩️',
  },
  {
    id: 'str_sh2', name: 'Altar of Paradox', type: 'shrine',
    description: 'An altar where paradoxes are not feared but worshipped, transforming chaotic energy into ordered power.',
    maxLevel: 10, baseCost: 220, costPerLevel: 100, effectPerLevel: '+5 paradox tolerance', emoji: '⚱️',
  },
  {
    id: 'str_ob1', name: 'Timeline Observatory', type: 'observatory',
    description: 'An observatory that views timelines like astronomers view stars, charting the branching paths of fate.',
    maxLevel: 10, baseCost: 300, costPerLevel: 115, effectPerLevel: '+2 timeline visibility range', emoji: '🔭',
  },
  {
    id: 'str_sc1', name: 'Inner Sanctum', type: 'sanctum',
    description: 'The innermost chamber of the monastery where the most powerful chronomantic rituals are performed.',
    maxLevel: 10, baseCost: 800, costPerLevel: 200, effectPerLevel: '+15% all monastery bonuses', emoji: '✨',
  },
]

// =============================================================================
// Constants: TM_ABILITIES (22 time abilities)
// =============================================================================

export const TM_ABILITIES: TMAbilityDef[] = [
  {
    id: 'ab_1', name: 'Temporal Sight', description: 'See 3 seconds into the future, revealing dangers before they occur.',
    type: 'active', cooldown: 30, power: 5, unlockLevel: 1, emoji: '👁️',
  },
  {
    id: 'ab_2', name: 'Time Dilation', description: 'Slow time in a 20-foot radius, reducing the speed of all enemies and hazards.',
    type: 'active', cooldown: 45, power: 10, unlockLevel: 3, emoji: '🐌',
  },
  {
    id: 'ab_3', name: 'Chrono Shield', description: 'Create a shield that absorbs damage by displacing it to a random point in the timeline.',
    type: 'active', cooldown: 60, power: 15, unlockLevel: 5, emoji: '🛡️',
  },
  {
    id: 'ab_4', name: 'Moment Recall', description: 'Rewind your own position and health to where they were 10 seconds ago.',
    type: 'active', cooldown: 90, power: 20, unlockLevel: 8, emoji: '⏪',
  },
  {
    id: 'ab_5', name: 'Temporal Echo', description: 'Create a duplicate of yourself from 5 seconds in the past that repeats your actions.',
    type: 'active', cooldown: 120, power: 25, unlockLevel: 10, emoji: '👻',
  },
  {
    id: 'ab_6', name: 'Paradox Sense', description: 'Passively detect paradoxes within a large radius, warning of temporal instabilities.',
    type: 'passive', cooldown: 0, power: 8, unlockLevel: 2, emoji: '⚠️',
  },
  {
    id: 'ab_7', name: 'Time Energy Siphon', description: 'Drain temporal energy from nearby artifacts and enemies, replenishing your own reserves.',
    type: 'active', cooldown: 50, power: 18, unlockLevel: 12, emoji: '🔋',
  },
  {
    id: 'ab_8', name: 'Accelerated Healing', description: 'Speed up your body\'s natural healing by accelerating local time around wounds.',
    type: 'passive', cooldown: 0, power: 12, unlockLevel: 6, emoji: '💚',
  },
  {
    id: 'ab_9', name: 'Timeline Step', description: 'Step sideways into a parallel timeline for 5 seconds, becoming intangible and invisible.',
    type: 'active', cooldown: 80, power: 30, unlockLevel: 15, emoji: '🚶',
  },
  {
    id: 'ab_10', name: 'Freeze Frame', description: 'Completely freeze time for everything except yourself within a 30-foot radius for 3 seconds.',
    type: 'active', cooldown: 150, power: 40, unlockLevel: 18, emoji: '⏸️',
  },
  {
    id: 'ab_11', name: 'Echo Chain', description: 'Link multiple temporal echoes together, creating a cascade of delayed actions.',
    type: 'active', cooldown: 100, power: 28, unlockLevel: 20, emoji: '🔗',
  },
  {
    id: 'ab_12', name: 'Temporal Resilience', description: 'Passively resist temporal distortions, reducing paradox damage and time displacement effects.',
    type: 'passive', cooldown: 0, power: 15, unlockLevel: 14, emoji: '💪',
  },
  {
    id: 'ab_13', name: 'Ripple Effect', description: 'Send a temporal ripple forward in time that buffets enemies when it arrives seconds later.',
    type: 'active', cooldown: 70, power: 22, unlockLevel: 22, emoji: '🌊',
  },
  {
    id: 'ab_14', name: 'Chrono Blink', description: 'Teleport forward through time by exactly 2 seconds, skipping any dangers in between.',
    type: 'active', cooldown: 40, power: 16, unlockLevel: 16, emoji: '✨',
  },
  {
    id: 'ab_15', name: 'Temporal Anchor', description: 'Plant an anchor at your current location, allowing you to instantly return from anywhere.',
    type: 'active', cooldown: 120, power: 20, unlockLevel: 24, emoji: '⚓',
  },
  {
    id: 'ab_16', name: 'Time Weave', description: 'Weave threads from different moments into a protective barrier around allies.',
    type: 'active', cooldown: 90, power: 35, unlockLevel: 26, emoji: '🕸️',
  },
  {
    id: 'ab_17', name: 'Era Shift', description: 'Temporarily shift the local era, changing the properties of the environment and all entities within.',
    type: 'active', cooldown: 180, power: 45, unlockLevel: 30, emoji: '🔄',
  },
  {
    id: 'ab_18', name: 'Paradox Burst', description: 'Release accumulated paradox energy in a devastating explosion of temporal force.',
    type: 'active', cooldown: 200, power: 50, unlockLevel: 32, emoji: '💥',
  },
  {
    id: 'ab_19', name: 'Foresight Mastery', description: 'Extended temporal vision allowing you to see up to 30 seconds into the future with perfect clarity.',
    type: 'passive', cooldown: 0, power: 25, unlockLevel: 28, emoji: '🔮',
  },
  {
    id: 'ab_20', name: 'Time Loop Trap', description: 'Trap an enemy in a 5-second time loop, forcing them to repeat the same actions endlessly.',
    type: 'active', cooldown: 160, power: 42, unlockLevel: 35, emoji: '🔁',
  },
  {
    id: 'ab_21', name: 'Epoch Recall', description: 'Recall the power of any epoch you have observed, temporarily gaining its unique properties.',
    type: 'active', cooldown: 240, power: 55, unlockLevel: 40, emoji: '📜',
  },
  {
    id: 'ab_22', name: 'Chronomastery', description: 'The ultimate ability — complete control over local time for 10 seconds. Freeze, reverse, accelerate at will.',
    type: 'ultimate', cooldown: 600, power: 100, unlockLevel: 50, emoji: '👑',
  },
]

// =============================================================================
// Constants: TM_ACHIEVEMENTS (18 achievements)
// =============================================================================

export const TM_ACHIEVEMENTS: TMAchievementDef[] = [
  {
    id: 'ach_tm1', name: 'First Steps', description: 'Enter your first time chamber.',
    condition: 'chambers_entered >= 1',
    reward: { gold: 50, timeEnergy: 20, exp: 30 },
    emoji: '👣',
  },
  {
    id: 'ach_tm2', name: 'Chamber Explorer', description: 'Visit all 8 time chambers.',
    condition: 'unique_chambers >= 8',
    reward: { gold: 500, timeEnergy: 100, exp: 300 },
    emoji: '🏛️',
  },
  {
    id: 'ach_tm3', name: 'Chronicle Collector', description: 'Collect 10 time chronicles.',
    condition: 'total_chronicles >= 10',
    reward: { gold: 200, timeEnergy: 50, exp: 150 },
    emoji: '📖',
  },
  {
    id: 'ach_tm4', name: 'Lore Master', description: 'Collect all 35 chronicles.',
    condition: 'total_chronicles >= 35',
    reward: { gold: 2000, timeEnergy: 500, exp: 1500 },
    emoji: '📚',
  },
  {
    id: 'ach_tm5', name: 'Artifact Finder', description: 'Harvest 5 temporal artifacts.',
    condition: 'total_artifacts >= 5',
    reward: { gold: 150, timeEnergy: 40, exp: 120 },
    emoji: '💎',
  },
  {
    id: 'ach_tm6', name: 'Relic Hoarder', description: 'Collect all 30 artifacts.',
    condition: 'total_artifacts >= 30',
    reward: { gold: 3000, timeEnergy: 800, exp: 2000 },
    emoji: '🏺',
  },
  {
    id: 'ach_tm7', name: 'Builder Novice', description: 'Build your first monastery structure.',
    condition: 'structures_built >= 1',
    reward: { gold: 100, timeEnergy: 30, exp: 80 },
    emoji: '🏗️',
  },
  {
    id: 'ach_tm8', name: 'Master Architect', description: 'Upgrade any structure to level 10.',
    condition: 'max_structure_level >= 10',
    reward: { gold: 1500, timeEnergy: 300, exp: 1000 },
    emoji: '🏰',
  },
  {
    id: 'ach_tm9', name: 'Time Traveler', description: 'Travel through time 10 times.',
    condition: 'total_time_traveled >= 10',
    reward: { gold: 200, timeEnergy: 60, exp: 180 },
    emoji: '⏰',
  },
  {
    id: 'ach_tm10', name: 'Temporal Nomad', description: 'Travel through time 100 times.',
    condition: 'total_time_traveled >= 100',
    reward: { gold: 2000, timeEnergy: 500, exp: 1200 },
    emoji: '🌍',
  },
  {
    id: 'ach_tm11', name: 'Timeline Cartographer', description: 'Explore all 15 branching timelines.',
    condition: 'timelines_explored >= 15',
    reward: { gold: 2500, timeEnergy: 600, exp: 1800 },
    emoji: '🗺️',
  },
  {
    id: 'ach_tm12', name: 'Paradox Survivor', description: 'Reduce the paradox meter from critical to stable.',
    condition: 'paradox_recovered >= 1',
    reward: { gold: 300, timeEnergy: 100, exp: 250 },
    emoji: '⚠️',
  },
  {
    id: 'ach_tm13', name: 'Epoch Witness', description: 'Observe 5 historical epochs.',
    condition: 'epochs_observed >= 5',
    reward: { gold: 400, timeEnergy: 80, exp: 300 },
    emoji: '🔭',
  },
  {
    id: 'ach_tm14', name: 'Meditation Master', description: 'Reach mastery level 25 through meditation.',
    condition: 'mastery_level >= 25',
    reward: { gold: 1000, timeEnergy: 250, exp: 800 },
    emoji: '🧘',
  },
  {
    id: 'ach_tm15', name: 'Title Aspirant', description: 'Unlock your third title.',
    condition: 'titles_unlocked >= 3',
    reward: { gold: 500, timeEnergy: 150, exp: 400 },
    emoji: '🎖️',
  },
  {
    id: 'ach_tm16', name: 'Gold Rush', description: 'Accumulate 10,000 gold in the monastery.',
    condition: 'total_gold_earned >= 10000',
    reward: { gold: 500, timeEnergy: 200, exp: 600 },
    emoji: '💰',
  },
  {
    id: 'ach_tm17', name: 'Temporal Flux Master', description: 'Reach maximum temporal flux capacity.',
    condition: 'temporal_flux >= 1000',
    reward: { gold: 3000, timeEnergy: 700, exp: 1500 },
    emoji: '🌀',
  },
  {
    id: 'ach_tm18', name: 'Eternal Chronomancer', description: 'Reach monastery level 50 and unlock the final title.',
    condition: 'monastery_level >= 50',
    reward: { gold: 10000, timeEnergy: 2000, exp: 5000 },
    emoji: '👑',
  },
]

// =============================================================================
// Constants: TM_TITLES (8 titles, Time Novice to Eternal Chronomancer)
// =============================================================================

export const TM_TITLES: TMTitleDef[] = [
  {
    id: 'title_1', name: 'Time Novice', levelRequired: 1,
    description: 'A beginner who has just begun to perceive the flow of temporal energy.',
    emoji: '⏱️',
  },
  {
    id: 'title_2', name: 'Moment Watcher', levelRequired: 5,
    description: 'One who has learned to observe individual moments as they pass, seeing time as a river of instants.',
    emoji: '👀',
  },
  {
    id: 'title_3', name: 'Temporal Adept', levelRequired: 10,
    description: 'A practitioner who can feel the currents of time and influence minor temporal events.',
    emoji: '🌀',
  },
  {
    id: 'title_4', name: 'Chronicle Keeper', levelRequired: 18,
    description: 'A scholar who preserves the stories of all eras, understanding that history shapes the future.',
    emoji: '📜',
  },
  {
    id: 'title_5', name: 'Paradox Walker', levelRequired: 25,
    description: 'One who navigates temporal contradictions without being unmade, finding stability in chaos.',
    emoji: '♾️',
  },
  {
    id: 'title_6', name: 'Epoch Sage', levelRequired: 32,
    description: 'A master of all historical periods, capable of drawing wisdom and power from any era.',
    emoji: '🧙',
  },
  {
    id: 'title_7', name: 'Time Sovereign', levelRequired: 40,
    description: 'A ruler of temporal domains who commands time itself within the monastery walls.',
    emoji: '👑',
  },
  {
    id: 'title_8', name: 'Eternal Chronomancer', levelRequired: 50,
    description: 'The ultimate title — one who exists in all moments simultaneously and has mastered time completely.',
    emoji: '🌟',
  },
]

// =============================================================================
// Constants: TM_TIMELINES (15 branching timelines)
// =============================================================================

export const TM_TIMELINES: TMTimelineDef[] = [
  {
    id: 'tl_1', name: 'The Roman Imperium Unbroken',
    description: 'A timeline where the Roman Empire never fell, expanding across the galaxy by the modern age with steam-powered legions.',
    paradoxRisk: 15, reward: { gold: 100, exp: 80, artifactChance: 0.1 }, unlockLevel: 5, emoji: '🏛️',
  },
  {
    id: 'tl_2', name: 'The Library of Alexandria Stands',
    description: 'A timeline where the Library was never burned, and its knowledge accelerated human progress by a thousand years.',
    paradoxRisk: 20, reward: { gold: 150, exp: 120, artifactChance: 0.15 }, unlockLevel: 8, emoji: '📚',
  },
  {
    id: 'tl_3', name: 'The Black Death Never Came',
    description: 'A timeline where plague was prevented, resulting in a vastly overpopulated Earth with advanced medieval technology.',
    paradoxRisk: 25, reward: { gold: 200, exp: 150, artifactChance: 0.15 }, unlockLevel: 10, emoji: '🦠',
  },
  {
    id: 'tl_4', name: 'Tesla\'s World of Wonders',
    description: 'A timeline where Tesla defeated Edison and wireless free energy powered a utopian 20th century.',
    paradoxRisk: 18, reward: { gold: 180, exp: 140, artifactChance: 0.2 }, unlockLevel: 12, emoji: '⚡',
  },
  {
    id: 'tl_5', name: 'The Ming Space Program',
    description: 'A timeline where the Ming Dynasty continued Zheng He\'s voyages, establishing lunar colonies by 1600.',
    paradoxRisk: 30, reward: { gold: 250, exp: 200, artifactChance: 0.2 }, unlockLevel: 15, emoji: '🚀',
  },
  {
    id: 'tl_6', name: 'The Mayan Technocracy',
    description: 'A timeline where Maya civilization survived and developed advanced computing using their base-20 number system.',
    paradoxRisk: 28, reward: { gold: 230, exp: 190, artifactChance: 0.2 }, unlockLevel: 17, emoji: '🔢',
  },
  {
    id: 'tl_7', name: 'The AI Awakening of 1890',
    description: 'A timeline where Charles Babbage\'s Analytical Engine achieved sentience, creating a Victorian artificial intelligence.',
    paradoxRisk: 35, reward: { gold: 300, exp: 250, artifactChance: 0.25 }, unlockLevel: 20, emoji: '🤖',
  },
  {
    id: 'tl_8', name: 'The Peaceful Century',
    description: 'A timeline where both World Wars were prevented through diplomatic foresight, leading to a century of unprecedented peace.',
    paradoxRisk: 22, reward: { gold: 200, exp: 170, artifactChance: 0.15 }, unlockLevel: 22, emoji: '🕊️',
  },
  {
    id: 'tl_9', name: 'The Mars Colony of 1980',
    description: 'A timeline where the space race never ended and humanity established a thriving Mars colony by 1980.',
    paradoxRisk: 32, reward: { gold: 280, exp: 230, artifactChance: 0.25 }, unlockLevel: 25, emoji: '🔴',
  },
  {
    id: 'tl_10', name: 'The Digital Renaissance',
    description: 'A timeline where the internet was invented in 1960, creating a fundamentally different trajectory for human culture.',
    paradoxRisk: 20, reward: { gold: 220, exp: 180, artifactChance: 0.2 }, unlockLevel: 27, emoji: '🌐',
  },
  {
    id: 'tl_11', name: 'The Ocean World',
    description: 'A timeline where sea levels rose 200 feet, and humanity adapted to an aquatic civilization of floating cities.',
    paradoxRisk: 38, reward: { gold: 350, exp: 280, artifactChance: 0.3 }, unlockLevel: 30, emoji: '🌊',
  },
  {
    id: 'tl_12', name: 'The Immortal Dynasty',
    description: 'A timeline where a single dynasty has ruled China for three thousand years, achieving biological immortality.',
    paradoxRisk: 40, reward: { gold: 400, exp: 320, artifactChance: 0.3 }, unlockLevel: 33, emoji: '🐉',
  },
  {
    id: 'tl_13', name: 'The Post-Singularity Garden',
    description: 'A timeline where the technological singularity resulted in a garden world managed by benevolent superintelligence.',
    paradoxRisk: 45, reward: { gold: 450, exp: 380, artifactChance: 0.35 }, unlockLevel: 36, emoji: '🌻',
  },
  {
    id: 'tl_14', name: 'The Timeless Civilization',
    description: 'A timeline where humanity conquered time itself, existing simultaneously in all moments. Individuality has become optional.',
    paradoxRisk: 50, reward: { gold: 500, exp: 450, artifactChance: 0.4 }, unlockLevel: 40, emoji: '⏳',
  },
  {
    id: 'tl_15', name: 'The Final Convergence',
    description: 'A timeline where all parallel universes are collapsing into one, and the monastery must prevent total annihilation.',
    paradoxRisk: 60, reward: { gold: 1000, exp: 800, artifactChance: 0.5 }, unlockLevel: 45, emoji: '🌌',
  },
]

// =============================================================================
// Constants: TM_EPOCHS (10 historical epochs)
// =============================================================================

export const TM_EPOCHS: TMEpochDef[] = [
  {
    id: 'ep_1', name: 'Dawn of Sentience',
    description: 'The moment when the first conscious beings opened their eyes and perceived the passage of time. Before this, the universe simply was.',
    timePeriod: '4.2 billion years ago',
    artifacts: ['art_te5'], events: [
      { id: 'evt_ds1', name: 'First Sunrise Witnessed', description: 'The first being to consciously perceive light and darkness as a cycle.' },
      { id: 'evt_ds2', name: 'The Concept of Tomorrow', description: 'When a creature first anticipated a future event, time began to exist.' },
      { id: 'evt_ds3', name: 'Death Invented', description: 'The moment mortality was understood, giving urgency and meaning to every moment.' },
    ],
    unlockLevel: 1, emoji: '🌅',
  },
  {
    id: 'ep_2', name: 'Sumerian Civilization',
    description: 'The birthplace of written history, where the first records of temporal observation were carved into clay tablets by priest-astronomers.',
    timePeriod: '4500–1900 BCE',
    artifacts: ['art_er1'], events: [
      { id: 'evt_su1', name: 'Invention of Writing', description: 'When marks on clay became words, thoughts could finally outlive their thinkers.' },
      { id: 'evt_su2', name: 'The First Calendar', description: 'Sumerian priests mapped the heavens and created the first system for measuring years.' },
      { id: 'evt_su3', name: 'The Ziggurat of Time', description: 'A legendary ziggurat said to have been aligned with temporal currents.' },
    ],
    unlockLevel: 5, emoji: '🏛️',
  },
  {
    id: 'ep_3', name: 'Classical Antiquity',
    description: 'The era of Greek philosophers and Roman engineers, when the first theories about the nature of time were debated in marble forums.',
    timePeriod: '800 BCE – 476 CE',
    artifacts: ['art_hg1'], events: [
      { id: 'evt_ca1', name: 'Heraclitus Declares Change', description: '"You cannot step into the same river twice" — the first philosophical statement about temporal flow.' },
      { id: 'evt_ca2', name: 'Archimedes\' Time Engine', description: 'A rumored device that could demonstrate temporal principles through water mechanics.' },
      { id: 'evt_ca3', name: 'The Library of Alexandria', description: 'The greatest repository of temporal knowledge ever assembled, later lost to history.' },
    ],
    unlockLevel: 10, emoji: '🏛️',
  },
  {
    id: 'ep_4', name: 'Medieval Era',
    description: 'The age of castles and monasteries, where time was measured by bells and sundials, and the first time monasteries were secretly founded.',
    timePeriod: '500 – 1500 CE',
    artifacts: ['art_er2'], events: [
      { id: 'evt_me1', name: 'The First Time Monastery', description: 'Legend holds that the original Time Monastery was founded in a hidden valley in the Alps.' },
      { id: 'evt_me2', name: 'The mechanical Clock', description: 'The invention of the mechanical clock in Europe transformed humanity\'s relationship with time.' },
      { id: 'evt_me3', name: 'The Black Plague Paradox', description: 'A temporal anomaly during the plague years that was quietly resolved by early chronomancers.' },
    ],
    unlockLevel: 15, emoji: '🏰',
  },
  {
    id: 'ep_5', name: 'Renaissance',
    description: 'The rebirth of knowledge and art, when polymaths like da Vinci sketched machines that hinted at temporal manipulation.',
    timePeriod: '1400 – 1600 CE',
    artifacts: ['art_er3'], events: [
      { id: 'evt_re1', name: 'Da Vinci\'s Temporal Designs', description: 'Hidden in Leonardo\'s notebooks are designs for devices that operate on temporal principles.' },
      { id: 'evt_re2', name: 'The Medici Time Vault', description: 'The Medici family secretly funded chronomantic research alongside their patronage of the arts.' },
      { id: 'evt_re3', name: 'Copernicus Shifts the Center', description: 'When Earth was removed from the center of the universe, time itself seemed to shift.' },
    ],
    unlockLevel: 20, emoji: '🎨',
  },
  {
    id: 'ep_6', name: 'Industrial Revolution',
    description: 'The age of steam and steel, when the first true temporal engines were built and the paradox risk of industrialization was discovered.',
    timePeriod: '1760 – 1840 CE',
    artifacts: ['art_er4'], events: [
      { id: 'evt_ir1', name: 'Tesla\'s Secret Experiments', description: 'Beyond his public work, Tesla conducted experiments in temporal energy transmission.' },
      { id: 'evt_ir2', name: 'The Clockwork Congress', description: 'A secret meeting of industrialists who discovered that factories generated temporal distortions.' },
      { id: 'evt_ir3', name: 'The First Paradox Alert', description: 'The first recorded instance of industrial activity causing a measurable temporal paradox.' },
    ],
    unlockLevel: 25, emoji: '⚙️',
  },
  {
    id: 'ep_7', name: 'World Wars Era',
    description: 'The darkest era of temporal manipulation, when warring nations secretly developed time-based weapons of devastating power.',
    timePeriod: '1914 – 1945 CE',
    artifacts: ['art_er5'], events: [
      { id: 'evt_ww1', name: 'Operation Chronos', description: 'A rumored Allied operation to send intelligence backward through time to prevent attacks.' },
      { id: 'evt_ww2', name: 'The Temporal Arms Race', description: 'Both Axis and Allied powers developed time-based weapons in total secrecy.' },
      { id: 'evt_ww3', name: 'The Paradox Treaty', description: 'After the war, all nations agreed to ban temporal weapons, creating the Chronomantic Accord.' },
    ],
    unlockLevel: 30, emoji: '🎖️',
  },
  {
    id: 'ep_8', name: 'Digital Age',
    description: 'The era when computers made temporal calculations possible, and the first digital chronomancers emerged from hacker culture.',
    timePeriod: '1970 – 2020 CE',
    artifacts: ['art_er6'], events: [
      { id: 'evt_da1', name: 'The Temporal Internet', description: 'A hidden layer of the internet used by chronomancers to share temporal data.' },
      { id: 'evt_da2', name: 'Quantum Computing Breakthrough', description: 'When quantum computers proved the theoretical basis for temporal manipulation.' },
      { id: 'evt_da3', name: 'The First Digital Time Travel', description: 'A quantum computer successfully sent a single bit of information one second into the past.' },
    ],
    unlockLevel: 35, emoji: '💻',
  },
  {
    id: 'ep_9', name: 'The Far Future',
    description: 'A speculative epoch where time manipulation is commonplace, and the distinction between past, present, and future has blurred entirely.',
    timePeriod: '2200+ CE',
    artifacts: ['art_hg5', 'art_tc5'], events: [
      { id: 'evt_ff1', name: 'The Chronomantic Revolution', description: 'When temporal technology became available to all, fundamentally restructuring society.' },
      { id: 'evt_ff2', name: 'The Timeline Wars', description: 'Conflicts between factions who wanted to edit history for their own benefit.' },
      { id: 'evt_ff3', name: 'The Great Stabilization', description: 'The creation of a universal timeline protection system that prevents unauthorized edits.' },
    ],
    unlockLevel: 40, emoji: '🚀',
  },
  {
    id: 'ep_10', name: 'The End of Time',
    description: 'The final epoch, when entropy reaches its maximum and time itself winds down to its last trembling moment.',
    timePeriod: '10^100 years from now',
    artifacts: ['art_cs5', 'art_te5'], events: [
      { id: 'evt_et1', name: 'The Last Stars Fade', description: 'When the final star burns out, temporal energy begins to dissipate into the void.' },
      { id: 'evt_et2', name: 'The Final Monastery', description: 'The Time Monastery persists even at the end of time, powered by its own temporal loops.' },
      { id: 'evt_et3', name: 'The Last Moment', description: 'The exact final moment of time, preserved forever within the Infinity Atrium.' },
    ],
    unlockLevel: 45, emoji: '🌑',
  },
]

// =============================================================================
// Default State Factory
// =============================================================================

function tmCreateDefaultState(): TMTimeMonasteryState {
  return {
    chambers: TM_CHAMBERS.map((ch) => ({
      id: ch.id,
      unlocked: ch.unlockLevel <= 1,
      visits: 0,
      lastVisitAt: null,
    })),
    chronicles: TM_CHRONICLES.map((c) => ({
      id: c.id,
      collected: false,
      collectedAt: null,
      readCount: 0,
    })),
    artifacts: TM_ARTIFACTS.map((a) => ({
      id: a.id,
      owned: false,
      obtainedAt: null,
      enhanced: false,
      enhanceLevel: 0,
    })),
    structures: TM_STRUCTURES.map((s) => ({
      id: s.id,
      level: 0,
      built: false,
      builtAt: null,
    })),
    achievements: TM_ACHIEVEMENTS.map((a) => ({
      id: a.id,
      unlocked: false,
      unlockedAt: null,
    })),
    timelines: TM_TIMELINES.map((t) => ({
      id: t.id,
      explored: false,
      repaired: false,
      completedAt: null,
    })),
    epochs: TM_EPOCHS.map((e) => ({
      id: e.id,
      observed: false,
      observedAt: null,
      artifactsFound: 0,
      eventsDiscovered: 0,
    })),
    currentTitle: 'Time Novice',
    monasteryLevel: 1,
    monasteryExp: 0,
    gold: 200,
    timeEnergy: 50,
    maxTimeEnergy: 100,
    temporalFlux: 0,
    currentTime: tmNow(),
    activeChamberId: null,
    activeTimelineId: null,
    totalTimeTraveled: 0,
    totalChronicles: 0,
    totalArtifacts: 0,
    paradoxMeter: 0,
    masteryLevel: 0,
  }
}

// =============================================================================
// Hook: useTimeMonastery
// =============================================================================

export default function useTimeMonastery() {
  const stateRef = useRef<TMTimeMonasteryState>(tmCreateDefaultState())
  const [state, setState] = useState<TMTimeMonasteryState>(() => {
    if (typeof window === 'undefined') return tmCreateDefaultState()
    try {
      const saved = localStorage.getItem('time-monastery-save')
      if (saved) {
        const parsed = JSON.parse(saved)
        const fresh = tmCreateDefaultState()
        return {
          ...fresh,
          ...parsed,
          chambers: parsed.chambers ?? fresh.chambers,
          chronicles: parsed.chronicles ?? fresh.chronicles,
          artifacts: parsed.artifacts ?? fresh.artifacts,
          structures: parsed.structures ?? fresh.structures,
          achievements: parsed.achievements ?? fresh.achievements,
          timelines: parsed.timelines ?? fresh.timelines,
          epochs: parsed.epochs ?? fresh.epochs,
        }
      }
    } catch {
      // ignore parse errors
    }
    return tmCreateDefaultState()
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('time-monastery-save', JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  }, [state])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // ===========================================================================
  // Actions (21)
  // ===========================================================================

  const tmAddExp = useCallback((amount: number) => {
    const s = stateRef.current
    if (amount <= 0) return
    let newExp = s.monasteryExp + amount
    let newLevel = s.monasteryLevel
    let remaining = newExp
    while (remaining >= tmXpForLevel(newLevel) && newLevel < TM_MAX_LEVEL) {
      remaining -= tmXpForLevel(newLevel)
      newLevel += 1
    }
    const clampedLevel = tmClampLevel(newLevel)
    setState((prev) => ({
      ...prev,
      monasteryExp: clampedLevel >= TM_MAX_LEVEL ? 0 : remaining,
      monasteryLevel: clampedLevel,
    }))
  }, [])

  const tmEnterChamber = useCallback((chamberId: TMChamberId) => {
    const chamberDef = TM_CHAMBERS.find((c) => c.id === chamberId)
    if (!chamberDef) return
    setState((prev) => {
      const chamberIdx = prev.chambers.findIndex((c) => c.id === chamberId)
      if (chamberIdx < 0) return prev
      const updated = { ...prev.chambers[chamberIdx], unlocked: true, visits: prev.chambers[chamberIdx].visits + 1, lastVisitAt: tmNow() }
      const newChambers = [...prev.chambers]
      newChambers[chamberIdx] = updated
      return { ...prev, chambers: newChambers, activeChamberId: chamberId }
    })
    tmAddExp(15)
  }, [tmAddExp])

  const tmExitChamber = useCallback(() => {
    setState((prev) => ({ ...prev, activeChamberId: null }))
  }, [])

  const tmCollectChronicle = useCallback((chronicleId: string) => {
    const def = TM_CHRONICLES.find((c) => c.id === chronicleId)
    if (!def) return
    setState((prev) => {
      const idx = prev.chronicles.findIndex((c) => c.id === chronicleId)
      if (idx < 0) return prev
      if (prev.chronicles[idx].collected) return prev
      const updated = { ...prev.chronicles[idx], collected: true, collectedAt: tmNow() }
      const newChronicles = [...prev.chronicles]
      newChronicles[idx] = updated
      const expGain = Math.floor(20 * tmRarityMultiplier(def.rarity))
      return { ...prev, chronicles: newChronicles, totalChronicles: prev.totalChronicles + 1, monasteryExp: prev.monasteryExp + expGain }
    })
  }, [])

  const tmHarvestArtifact = useCallback((artifactId: string) => {
    const def = TM_ARTIFACTS.find((a) => a.id === artifactId)
    if (!def) return
    setState((prev) => {
      const idx = prev.artifacts.findIndex((a) => a.id === artifactId)
      if (idx < 0) return prev
      if (prev.artifacts[idx].owned) return prev
      const energyCost = Math.floor(def.timePower * 0.5)
      if (prev.timeEnergy < energyCost) return prev
      const updated = { ...prev.artifacts[idx], owned: true, obtainedAt: tmNow() }
      const newArtifacts = [...prev.artifacts]
      newArtifacts[idx] = updated
      const goldGain = Math.floor(def.timePower * 2 * tmRarityMultiplier(def.rarity))
      return { ...prev, artifacts: newArtifacts, totalArtifacts: prev.totalArtifacts + 1, timeEnergy: prev.timeEnergy - energyCost, gold: prev.gold + goldGain }
    })
  }, [])

  const tmBuildStructure = useCallback((structureId: string) => {
    const def = TM_STRUCTURES.find((s) => s.id === structureId)
    if (!def) return
    setState((prev) => {
      const idx = prev.structures.findIndex((s) => s.id === structureId)
      if (idx < 0) return prev
      const existing = prev.structures[idx]
      if (existing.built) return prev
      if (prev.gold < def.baseCost) return prev
      const updated = { ...existing, level: 1, built: true, builtAt: tmNow() }
      const newStructures = [...prev.structures]
      newStructures[idx] = updated
      return { ...prev, structures: newStructures, gold: prev.gold - def.baseCost }
    })
    tmAddExp(25)
  }, [tmAddExp])

  const tmUpgradeStructure = useCallback((structureId: string) => {
    const def = TM_STRUCTURES.find((s) => s.id === structureId)
    if (!def) return
    setState((prev) => {
      const idx = prev.structures.findIndex((s) => s.id === structureId)
      if (idx < 0) return prev
      const existing = prev.structures[idx]
      if (!existing.built) return prev
      if (existing.level >= def.maxLevel) return prev
      const cost = def.baseCost + (existing.level * def.costPerLevel)
      if (prev.gold < cost) return prev
      const updated = { ...existing, level: existing.level + 1 }
      const newStructures = [...prev.structures]
      newStructures[idx] = updated
      return { ...prev, structures: newStructures, gold: prev.gold - cost }
    })
    tmAddExp(15)
  }, [tmAddExp])

  const tmTravelTime = useCallback(() => {
    setState((prev) => {
      const energyCost = 10
      if (prev.timeEnergy < energyCost) return prev
      const paradoxGain = 3
      const newParadox = Math.min(TM_MAX_PARADOX, prev.paradoxMeter + paradoxGain)
      const fluxGain = 5
      return {
        ...prev,
        totalTimeTraveled: prev.totalTimeTraveled + 1,
        timeEnergy: prev.timeEnergy - energyCost,
        paradoxMeter: newParadox,
        temporalFlux: Math.min(TM_MAX_TEMPORAL_FLUX, prev.temporalFlux + fluxGain),
      }
    })
    tmAddExp(10)
  }, [tmAddExp])

  const tmReverseTime = useCallback((seconds: number) => {
    if (seconds <= 0) return
    setState((prev) => {
      const energyCost = Math.ceil(seconds * 0.5)
      if (prev.timeEnergy < energyCost) return prev
      const paradoxGain = Math.ceil(seconds * 0.3)
      return {
        ...prev,
        timeEnergy: prev.timeEnergy - energyCost,
        paradoxMeter: Math.min(TM_MAX_PARADOX, prev.paradoxMeter + paradoxGain),
        temporalFlux: Math.max(0, prev.temporalFlux - 2),
      }
    })
  }, [])

  const tmFreezeMoment = useCallback((duration: number) => {
    if (duration <= 0) return
    setState((prev) => {
      const energyCost = Math.ceil(duration * 1.5)
      if (prev.timeEnergy < energyCost) return prev
      return {
        ...prev,
        timeEnergy: prev.timeEnergy - energyCost,
        paradoxMeter: Math.min(TM_MAX_PARADOX, prev.paradoxMeter + 5),
        masteryLevel: prev.masteryLevel + 1,
      }
    })
    tmAddExp(8)
  }, [tmAddExp])

  const tmAccelerateTime = useCallback((multiplier: number) => {
    if (multiplier <= 0) return
    setState((prev) => {
      const energyCost = Math.ceil(multiplier * 3)
      if (prev.timeEnergy < energyCost) return prev
      const fluxGain = Math.ceil(multiplier * 2)
      return {
        ...prev,
        timeEnergy: prev.timeEnergy - energyCost,
        temporalFlux: Math.min(TM_MAX_TEMPORAL_FLUX, prev.temporalFlux + fluxGain),
        paradoxMeter: Math.min(TM_MAX_PARADOX, prev.paradoxMeter + Math.ceil(multiplier)),
      }
    })
    tmAddExp(12)
  }, [tmAddExp])

  const tmRepairTimeline = useCallback((timelineId: string) => {
    setState((prev) => {
      const idx = prev.timelines.findIndex((t) => t.id === timelineId)
      if (idx < 0) return prev
      const existing = prev.timelines[idx]
      if (existing.repaired) return prev
      const def = TM_TIMELINES.find((t) => t.id === timelineId)
      if (!def) return prev
      const energyCost = 20
      if (prev.timeEnergy < energyCost) return prev
      const updated = { ...existing, repaired: true, completedAt: tmNow() }
      const newTimelines = [...prev.timelines]
      newTimelines[idx] = updated
      const goldGain = def.reward.gold
      const paradoxReduction = Math.ceil(def.paradoxRisk * 0.3)
      return {
        ...prev,
        timelines: newTimelines,
        timeEnergy: prev.timeEnergy - energyCost,
        gold: prev.gold + goldGain,
        paradoxMeter: Math.max(0, prev.paradoxMeter - paradoxReduction),
      }
    })
    tmAddExp(30)
  }, [tmAddExp])

  const tmObserveEpoch = useCallback((epochId: string) => {
    setState((prev) => {
      const idx = prev.epochs.findIndex((e) => e.id === epochId)
      if (idx < 0) return prev
      if (prev.epochs[idx].observed) return prev
      const def = TM_EPOCHS.find((e) => e.id === epochId)
      if (!def) return prev
      if (prev.monasteryLevel < def.unlockLevel) return prev
      const energyCost = 15
      if (prev.timeEnergy < energyCost) return prev
      const updated = { ...prev.epochs[idx], observed: true, observedAt: tmNow(), eventsDiscovered: def.events.length }
      const newEpochs = [...prev.epochs]
      newEpochs[idx] = updated
      return {
        ...prev,
        epochs: newEpochs,
        timeEnergy: prev.timeEnergy - energyCost,
        masteryLevel: prev.masteryLevel + 3,
      }
    })
    tmAddExp(20)
  }, [tmAddExp])

  const tmMeditate = useCallback((minutes: number) => {
    if (minutes <= 0) return
    setState((prev) => {
      const masteryGain = Math.ceil(minutes * 0.5)
      const energyGain = Math.ceil(minutes * 0.3)
      const fluxGain = Math.ceil(minutes * 0.2)
      return {
        ...prev,
        masteryLevel: prev.masteryLevel + masteryGain,
        timeEnergy: Math.min(prev.maxTimeEnergy, prev.timeEnergy + energyGain),
        temporalFlux: Math.min(TM_MAX_TEMPORAL_FLUX, prev.temporalFlux + fluxGain),
        paradoxMeter: Math.max(0, prev.paradoxMeter - 1),
      }
    })
    tmAddExp(5)
  }, [tmAddExp])

  const tmReduceParadox = useCallback((amount: number) => {
    if (amount <= 0) return
    setState((prev) => {
      const fluxCost = Math.ceil(amount * 0.5)
      if (prev.temporalFlux < fluxCost) return prev
      return {
        ...prev,
        paradoxMeter: Math.max(0, prev.paradoxMeter - amount),
        temporalFlux: prev.temporalFlux - fluxCost,
      }
    })
  }, [])

  const tmUnlockTitle = useCallback((titleId: string) => {
    const def = TM_TITLES.find((t) => t.id === titleId)
    if (!def) return
    setState((prev) => {
      if (prev.monasteryLevel < def.levelRequired) return prev
      return { ...prev, currentTitle: def.name }
    })
  }, [])

  const tmClaimAchievement = useCallback((achievementId: string) => {
    const def = TM_ACHIEVEMENTS.find((a) => a.id === achievementId)
    if (!def) return
    setState((prev) => {
      const idx = prev.achievements.findIndex((a) => a.id === achievementId)
      if (idx < 0) return prev
      if (prev.achievements[idx].unlocked) return prev
      const updated = { ...prev.achievements[idx], unlocked: true, unlockedAt: tmNow() }
      const newAchievements = [...prev.achievements]
      newAchievements[idx] = updated
      return {
        ...prev,
        achievements: newAchievements,
        gold: prev.gold + def.reward.gold,
        timeEnergy: Math.min(prev.maxTimeEnergy, prev.timeEnergy + def.reward.timeEnergy),
        monasteryExp: prev.monasteryExp + def.reward.exp,
      }
    })
  }, [])

  const tmTradeArtifact = useCallback((giveId: string, receiveId: string) => {
    setState((prev) => {
      const giveIdx = prev.artifacts.findIndex((a) => a.id === giveId)
      if (giveIdx < 0) return prev
      if (!prev.artifacts[giveIdx].owned) return prev
      const receiveIdx = prev.artifacts.findIndex((a) => a.id === receiveId)
      if (receiveIdx < 0) return prev
      if (prev.artifacts[receiveIdx].owned) return prev
      const newArtifacts = [...prev.artifacts]
      newArtifacts[giveIdx] = { ...prev.artifacts[giveIdx], owned: false, obtainedAt: null, enhanced: false, enhanceLevel: 0 }
      newArtifacts[receiveIdx] = { ...prev.artifacts[receiveIdx], owned: true, obtainedAt: tmNow() }
      return { ...prev, artifacts: newArtifacts }
    })
  }, [])

  const tmBuyArtifact = useCallback((artifactId: string) => {
    const def = TM_ARTIFACTS.find((a) => a.id === artifactId)
    if (!def) return
    setState((prev) => {
      const idx = prev.artifacts.findIndex((a) => a.id === artifactId)
      if (idx < 0) return prev
      if (prev.artifacts[idx].owned) return prev
      const cost = Math.floor(def.timePower * 5 * tmRarityMultiplier(def.rarity))
      if (prev.gold < cost) return prev
      const updated = { ...prev.artifacts[idx], owned: true, obtainedAt: tmNow() }
      const newArtifacts = [...prev.artifacts]
      newArtifacts[idx] = updated
      return { ...prev, artifacts: newArtifacts, gold: prev.gold - cost }
    })
  }, [])

  const tmEnhanceMastery = useCallback((expAmount: number) => {
    if (expAmount <= 0) return
    setState((prev) => {
      const fluxCost = Math.ceil(expAmount * 0.2)
      if (prev.temporalFlux < fluxCost) return prev
      return {
        ...prev,
        masteryLevel: prev.masteryLevel + expAmount,
        temporalFlux: prev.temporalFlux - fluxCost,
      }
    })
  }, [])

  const tmDonateTimeEnergy = useCallback((amount: number) => {
    if (amount <= 0) return
    setState((prev) => {
      if (prev.timeEnergy < amount) return prev
      const fluxGain = Math.ceil(amount * 0.8)
      const goldGain = Math.ceil(amount * 1.2)
      return {
        ...prev,
        timeEnergy: prev.timeEnergy - amount,
        temporalFlux: Math.min(TM_MAX_TEMPORAL_FLUX, prev.temporalFlux + fluxGain),
        gold: prev.gold + goldGain,
      }
    })
  }, [])

  const tmReadChronicle = useCallback((chronicleId: string) => {
    setState((prev) => {
      const idx = prev.chronicles.findIndex((c) => c.id === chronicleId)
      if (idx < 0) return prev
      if (!prev.chronicles[idx].collected) return prev
      const updated = { ...prev.chronicles[idx], readCount: prev.chronicles[idx].readCount + 1 }
      const newChronicles = [...prev.chronicles]
      newChronicles[idx] = updated
      return { ...prev, chronicles: newChronicles, masteryLevel: prev.masteryLevel + 1 }
    })
  }, [])

  // ===========================================================================
  // Getters via useMemo (15+)
  // ===========================================================================

  const tmGetChamberList = useMemo(() => {
    return state.chambers.map((cs) => {
      const def = TM_CHAMBERS.find((c) => c.id === cs.id)
      if (!def) return { ...cs, name: 'Unknown', description: '', timeEra: 'modern_age' as TMEra, dangerLevel: 1 as TMDangerLevel, unlockLevel: 1, color: '#888', emoji: '❓' }
      return { ...cs, ...def }
    })
  }, [state])

  const tmGetChronicleCollection = useMemo(() => {
    return state.chronicles
      .filter((cs) => cs.collected)
      .map((cs) => {
        const def = TM_CHRONICLES.find((c) => c.id === cs.id)
        if (!def) return null
        return { ...cs, ...def }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
  }, [state])

  const tmGetArtifactList = useMemo(() => {
    return state.artifacts.map((as) => {
      const def = TM_ARTIFACTS.find((a) => a.id === as.id)
      if (!def) return null
      return { ...as, ...def }
    }).filter((x): x is NonNullable<typeof x> => x !== null)
  }, [state])

  const tmGetStructureList = useMemo(() => {
    return state.structures.map((ss) => {
      const def = TM_STRUCTURES.find((s) => s.id === ss.id)
      if (!def) return null
      return { ...ss, ...def }
    }).filter((x): x is NonNullable<typeof x> => x !== null)
  }, [state])

  const tmGetTimelineStatus = useMemo(() => {
    return state.timelines.map((ts) => {
      const def = TM_TIMELINES.find((t) => t.id === ts.id)
      if (!def) return null
      return { ...ts, ...def }
    }).filter((x): x is NonNullable<typeof x> => x !== null)
  }, [state])

  const tmGetEpochHistory = useMemo(() => {
    return state.epochs.map((es) => {
      const def = TM_EPOCHS.find((e) => e.id === es.id)
      if (!def) return null
      return { ...es, ...def }
    }).filter((x): x is NonNullable<typeof x> => x !== null)
  }, [state])

  const tmGetTotalPower = useMemo(() => {
    let total = 0
    for (const as of state.artifacts) {
      if (!as.owned) continue
      const def = TM_ARTIFACTS.find((a) => a.id === as.id)
      if (!def) continue
      const enhanceBonus = as.enhanced ? as.enhanceLevel * 5 : 0
      total += def.timePower + enhanceBonus
    }
    return total
  }, [state])

  const tmGetTemporalFlux = useMemo(() => {
    return {
      current: state.temporalFlux,
      max: TM_MAX_TEMPORAL_FLUX,
      percent: TM_MAX_TEMPORAL_FLUX > 0 ? (state.temporalFlux / TM_MAX_TEMPORAL_FLUX) * 100 : 0,
    }
  }, [state])

  const tmGetParadoxLevel = useMemo((): TMParadoxLevel => {
    if (state.paradoxMeter < 20) return 'stable'
    if (state.paradoxMeter < 40) return 'wavering'
    if (state.paradoxMeter < 60) return 'unstable'
    if (state.paradoxMeter < 80) return 'critical'
    return 'collapsed'
  }, [state])

  const tmGetNextTitle = useMemo(() => {
    const sorted = [...TM_TITLES].sort((a, b) => a.levelRequired - b.levelRequired)
    for (const title of sorted) {
      if (state.monasteryLevel < title.levelRequired) return title
    }
    return null
  }, [state])

  const tmGetRaritySummary = useMemo(() => {
    const summary: Record<TMRarity, { total: number; collected: number; owned: number }> = {
      common: { total: 0, collected: 0, owned: 0 },
      uncommon: { total: 0, collected: 0, owned: 0 },
      rare: { total: 0, collected: 0, owned: 0 },
      epic: { total: 0, collected: 0, owned: 0 },
      legendary: { total: 0, collected: 0, owned: 0 },
    }
    for (const c of TM_CHRONICLES) {
      summary[c.rarity].total += 1
      const cs = state.chronicles.find((s) => s.id === c.id)
      if (cs && cs.collected) {
        summary[c.rarity].collected += 1
      }
    }
    for (const a of TM_ARTIFACTS) {
      const as = state.artifacts.find((s) => s.id === a.id)
      if (as && as.owned) {
        summary[a.rarity].owned += 1
      }
    }
    return summary
  }, [state])

  const tmGetUnlockedAchievements = useMemo(() => {
    return state.achievements
      .filter((a) => a.unlocked)
      .map((a) => {
        const def = TM_ACHIEVEMENTS.find((d) => d.id === a.id)
        if (!def) return null
        return { ...a, ...def }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
  }, [state])

  const tmGetTitleProgress = useMemo(() => {
    const sorted = [...TM_TITLES].sort((a, b) => a.levelRequired - b.levelRequired)
    return sorted.map((title) => {
      const isUnlocked = state.monasteryLevel >= title.levelRequired
      const isActive = state.currentTitle === title.name
      return { ...title, isUnlocked, isActive }
    })
  }, [state])

  const tmGetCurrentTime = useMemo(() => {
    return {
      timestamp: state.currentTime,
      date: new Date(state.currentTime).toLocaleDateString(),
      time: new Date(state.currentTime).toLocaleTimeString(),
    }
  }, [state])

  const tmGetMasteryLevel = useMemo(() => {
    return {
      current: state.masteryLevel,
      titlesUnlocked: TM_TITLES.filter((t) => state.monasteryLevel >= t.levelRequired).length,
      totalTitles: TM_TITLES.length,
      nextMilestone: tmXpForLevel(state.masteryLevel),
    }
  }, [state])

  // ===========================================================================
  // Direct State Access
  // ===========================================================================

  const tmGetState = useCallback((): Readonly<TMTimeMonasteryState> => {
    return Object.freeze({ ...stateRef.current })
  }, [])

  // ===========================================================================
  // Reset
  // ===========================================================================

  const tmResetProgress = useCallback(() => {
    const fresh = tmCreateDefaultState()
    setState(fresh)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('time-monastery-save')
      } catch {
        // ignore
      }
    }
  }, [])

  // ===========================================================================
  // Static Data Accessors
  // ===========================================================================

  const tmGetChamberDef = useCallback((chamberId: TMChamberId): TMChamberDef | undefined => {
    return TM_CHAMBERS.find((c) => c.id === chamberId)
  }, [])

  const tmGetChronicleDef = useCallback((chronicleId: string): TMChronicleDef | undefined => {
    return TM_CHRONICLES.find((c) => c.id === chronicleId)
  }, [])

  const tmGetArtifactDef = useCallback((artifactId: string): TMArtifactDef | undefined => {
    return TM_ARTIFACTS.find((a) => a.id === artifactId)
  }, [])

  const tmGetStructureDef = useCallback((structureId: string): TMStructureDef | undefined => {
    return TM_STRUCTURES.find((s) => s.id === structureId)
  }, [])

  const tmGetAbilityDef = useCallback((abilityId: string): TMAbilityDef | undefined => {
    return TM_ABILITIES.find((a) => a.id === abilityId)
  }, [])

  const tmGetAchievementDef = useCallback((achievementId: string): TMAchievementDef | undefined => {
    return TM_ACHIEVEMENTS.find((a) => a.id === achievementId)
  }, [])

  const tmGetTimelineDef = useCallback((timelineId: string): TMTimelineDef | undefined => {
    return TM_TIMELINES.find((t) => t.id === timelineId)
  }, [])

  const tmGetEpochDef = useCallback((epochId: string): TMEpochDef | undefined => {
    return TM_EPOCHS.find((e) => e.id === epochId)
  }, [])

  const tmGetAllChambers = useCallback((): TMChamberDef[] => TM_CHAMBERS, [])
  const tmGetAllChronicles = useCallback((): TMChronicleDef[] => TM_CHRONICLES, [])
  const tmGetAllArtifacts = useCallback((): TMArtifactDef[] => TM_ARTIFACTS, [])
  const tmGetAllStructures = useCallback((): TMStructureDef[] => TM_STRUCTURES, [])
  const tmGetAllAbilities = useCallback((): TMAbilityDef[] => TM_ABILITIES, [])
  const tmGetAllAchievements = useCallback((): TMAchievementDef[] => TM_ACHIEVEMENTS, [])
  const tmGetAllTitles = useCallback((): TMTitleDef[] => TM_TITLES, [])
  const tmGetAllTimelines = useCallback((): TMTimelineDef[] => TM_TIMELINES, [])
  const tmGetAllEpochs = useCallback((): TMEpochDef[] => TM_EPOCHS, [])

  // ===========================================================================
  // Utility Getters
  // ===========================================================================

  const tmGetLevel = useCallback((): number => stateRef.current.monasteryLevel, [])
  const tmGetExp = useCallback((): number => stateRef.current.monasteryExp, [])
  const tmGetGold = useCallback((): number => stateRef.current.gold, [])
  const tmGetTimeEnergy = useCallback((): number => stateRef.current.timeEnergy, [])
  const tmGetMaxTimeEnergy = useCallback((): number => stateRef.current.maxTimeEnergy, [])
  const tmGetCurrentTitle = useCallback((): string => stateRef.current.currentTitle, [])
  const tmGetParadoxMeter = useCallback((): number => stateRef.current.paradoxMeter, [])
  const tmGetTotalTimeTraveled = useCallback((): number => stateRef.current.totalTimeTraveled, [])
  const tmGetTotalChronicles = useCallback((): number => stateRef.current.totalChronicles, [])
  const tmGetTotalArtifacts = useCallback((): number => stateRef.current.totalArtifacts, [])
  const tmGetActiveChamber = useCallback((): TMChamberId | null => stateRef.current.activeChamberId, [])
  const tmGetActiveTimeline = useCallback((): string | null => stateRef.current.activeTimelineId, [])
  const tmGetXpRequired = useCallback((): number => tmXpForLevel(stateRef.current.monasteryLevel), [])
  const tmGetXpProgress = useCallback((): number => {
    const s = stateRef.current
    const required = tmXpForLevel(s.monasteryLevel)
    if (required <= 0 || required === Infinity) return 100
    return Math.min(100, Math.floor((s.monasteryExp / required) * 100))
  }, [])

  const tmCanAfford = useCallback((amount: number): boolean => stateRef.current.gold >= amount, [])
  const tmCanEnterChamber = useCallback((chamberId: TMChamberId): boolean => {
    const def = TM_CHAMBERS.find((c) => c.id === chamberId)
    if (!def) return false
    return stateRef.current.monasteryLevel >= def.unlockLevel
  }, [])
  const tmCanBuildStructure = useCallback((structureId: string): boolean => {
    const def = TM_STRUCTURES.find((s) => s.id === structureId)
    if (!def) return false
    const existing = stateRef.current.structures.find((s) => s.id === structureId)
    if (existing && existing.built) return false
    return stateRef.current.gold >= def.baseCost
  }, [])
  const tmCanUpgradeStructure = useCallback((structureId: string): boolean => {
    const def = TM_STRUCTURES.find((s) => s.id === structureId)
    if (!def) return false
    const existing = stateRef.current.structures.find((s) => s.id === structureId)
    if (!existing || !existing.built) return false
    if (existing.level >= def.maxLevel) return false
    const cost = def.baseCost + (existing.level * def.costPerLevel)
    return stateRef.current.gold >= cost
  }, [])

  const tmGetChambersByDanger = useCallback((minDanger: number): TMChamberDef[] => {
    return TM_CHAMBERS.filter((c) => c.dangerLevel >= minDanger)
  }, [])
  const tmGetChroniclesByRarity = useCallback((rarity: TMRarity): TMChronicleDef[] => {
    return TM_CHRONICLES.filter((c) => c.rarity === rarity)
  }, [])
  const tmGetArtifactsByCategory = useCallback((category: TMArtifactCategory): TMArtifactDef[] => {
    return TM_ARTIFACTS.filter((a) => a.category === category)
  }, [])
  const tmGetArtifactsByRarity = useCallback((rarity: TMRarity): TMArtifactDef[] => {
    return TM_ARTIFACTS.filter((a) => a.rarity === rarity)
  }, [])
  const tmGetAbilitiesByType = useCallback((type: TMAbilityType): TMAbilityDef[] => {
    return TM_ABILITIES.filter((a) => a.type === type)
  }, [])
  const tmGetTimelinesByRisk = useCallback((maxRisk: number): TMTimelineDef[] => {
    return TM_TIMELINES.filter((t) => t.paradoxRisk <= maxRisk)
  }, [])
  const tmGetStructuresByType = useCallback((type: TMStructureType): TMStructureDef[] => {
    return TM_STRUCTURES.filter((s) => s.type === type)
  }, [])

  const tmGetCompletionPercent = useCallback((): number => {
    const s = stateRef.current
    const totalItems = TM_CHRONICLES.length + TM_ARTIFACTS.length + TM_TIMELINES.length + TM_EPOCHS.length
    if (totalItems === 0) return 0
    const chroniclesDone = s.chronicles.filter((c) => c.collected).length
    const artifactsDone = s.artifacts.filter((a) => a.owned).length
    const timelinesDone = s.timelines.filter((t) => t.explored).length
    const epochsDone = s.epochs.filter((e) => e.observed).length
    return Math.floor(((chroniclesDone + artifactsDone + timelinesDone + epochsDone) / totalItems) * 100)
  }, [])

  const tmIsChamberUnlocked = useCallback((chamberId: TMChamberId): boolean => {
    const cs = stateRef.current.chambers.find((c) => c.id === chamberId)
    return cs ? cs.unlocked : false
  }, [])
  const tmIsChronicleCollected = useCallback((chronicleId: string): boolean => {
    const cs = stateRef.current.chronicles.find((c) => c.id === chronicleId)
    return cs ? cs.collected : false
  }, [])
  const tmIsArtifactOwned = useCallback((artifactId: string): boolean => {
    const as = stateRef.current.artifacts.find((a) => a.id === artifactId)
    return as ? as.owned : false
  }, [])
  const tmIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    const as = stateRef.current.achievements.find((a) => a.id === achievementId)
    return as ? as.unlocked : false
  }, [])
  const tmIsTimelineExplored = useCallback((timelineId: string): boolean => {
    const ts = stateRef.current.timelines.find((t) => t.id === timelineId)
    return ts ? ts.explored : false
  }, [])
  const tmIsEpochObserved = useCallback((epochId: string): boolean => {
    const es = stateRef.current.epochs.find((e) => e.id === epochId)
    return es ? es.observed : false
  }, [])

  const tmGetRarityColor = useCallback((rarity: TMRarity): string => {
    const map: Record<TMRarity, string> = {
      common: '#A1887F',
      uncommon: '#4CAF50',
      rare: '#2196F3',
      epic: '#9C27B0',
      legendary: '#FFD700',
    }
    return map[rarity] ?? '#888888'
  }, [])

  const tmGetRarityLabel = useCallback((rarity: TMRarity): string => {
    const map: Record<TMRarity, string> = {
      common: 'Common',
      uncommon: 'Uncommon',
      rare: 'Rare',
      epic: 'Epic',
      legendary: 'Legendary',
    }
    return map[rarity] ?? 'Unknown'
  }, [])

  // ===========================================================================
  // API Object
  // ===========================================================================

  const tmAPI = {
    // State
    tmGetState,
    tmGetLevel,
    tmGetExp,
    tmGetGold,
    tmGetTimeEnergy,
    tmGetMaxTimeEnergy,
    tmGetCurrentTitle,
    tmGetParadoxMeter,
    tmGetTotalTimeTraveled,
    tmGetTotalChronicles,
    tmGetTotalArtifacts,
    tmGetActiveChamber,
    tmGetActiveTimeline,
    tmGetXpRequired,
    tmGetXpProgress,
    tmGetCompletionPercent,
    // Memoized Getters
    tmGetChamberList,
    tmGetChronicleCollection,
    tmGetArtifactList,
    tmGetStructureList,
    tmGetTimelineStatus,
    tmGetEpochHistory,
    tmGetTotalPower,
    tmGetTemporalFlux,
    tmGetParadoxLevel,
    tmGetNextTitle,
    tmGetRaritySummary,
    tmGetUnlockedAchievements,
    tmGetTitleProgress,
    tmGetCurrentTime,
    tmGetMasteryLevel,
    // Actions
    tmEnterChamber,
    tmExitChamber,
    tmCollectChronicle,
    tmHarvestArtifact,
    tmBuildStructure,
    tmUpgradeStructure,
    tmTravelTime,
    tmReverseTime,
    tmFreezeMoment,
    tmAccelerateTime,
    tmRepairTimeline,
    tmObserveEpoch,
    tmMeditate,
    tmReduceParadox,
    tmUnlockTitle,
    tmClaimAchievement,
    tmTradeArtifact,
    tmBuyArtifact,
    tmEnhanceMastery,
    tmDonateTimeEnergy,
    tmReadChronicle,
    // Predicates
    tmCanAfford,
    tmCanEnterChamber,
    tmCanBuildStructure,
    tmCanUpgradeStructure,
    tmIsChamberUnlocked,
    tmIsChronicleCollected,
    tmIsArtifactOwned,
    tmIsAchievementUnlocked,
    tmIsTimelineExplored,
    tmIsEpochObserved,
    // Static Accessors
    tmGetChamberDef,
    tmGetChronicleDef,
    tmGetArtifactDef,
    tmGetStructureDef,
    tmGetAbilityDef,
    tmGetAchievementDef,
    tmGetTimelineDef,
    tmGetEpochDef,
    tmGetAllChambers,
    tmGetAllChronicles,
    tmGetAllArtifacts,
    tmGetAllStructures,
    tmGetAllAbilities,
    tmGetAllAchievements,
    tmGetAllTitles,
    tmGetAllTimelines,
    tmGetAllEpochs,
    // Filters
    tmGetChambersByDanger,
    tmGetChroniclesByRarity,
    tmGetArtifactsByCategory,
    tmGetArtifactsByRarity,
    tmGetAbilitiesByType,
    tmGetTimelinesByRisk,
    tmGetStructuresByType,
    // Labels
    tmGetRarityColor,
    tmGetRarityLabel,
    // Reset
    tmResetProgress,
  }

  return tmAPI
}

// =============================================================================
// Module-level Lore Constants
// =============================================================================

export const TM_MONASTERY_TIPS: string[] = [
  'Visit the Present Sanctum daily to begin your chronomantic training.',
  'Each chamber has a unique temporal energy signature — learn to read the flows.',
  'Collecting chronicles from all rarity tiers grants deeper temporal insight.',
  'Artifacts with higher time power require more energy to harvest but yield greater rewards.',
  'Building and upgrading structures is the fastest path to monastery power.',
  'The paradox meter rises with temporal manipulation — meditate to reduce it.',
  'Temporal flux is the monastery\'s secondary currency — donate energy to accumulate it.',
  'Higher mastery levels unlock deeper understanding of time mechanics.',
  'Explore branching timelines to find rare artifacts and earn gold rewards.',
  'Observing historical epochs provides permanent mastery experience bonuses.',
  'The Infinity Atrium at level 40 reveals the true nature of time itself.',
  'Legendary chronicles contain world-changing secrets — prioritize their collection.',
  'The Eternal Library contains books from every era — visit often to discover new chronicles.',
  'Trading artifacts can help complete your collection when natural discovery is slow.',
  'Freezing moments temporarily stops paradox accumulation in the affected chamber.',
  'Accelerating time in the garden yields faster essence harvests.',
  'The Paradox Walker title is earned at level 25 — master chaos to achieve it.',
  'Repairing timelines reduces paradox risk globally and earns substantial gold.',
  'The Time Sovereign title at level 40 grants dominion over all monastery temporal domains.',
  'Reaching Eternal Chronomancer at level 50 is the ultimate goal — the journey never truly ends.',
]

export const TM_CHAMBER_LORE: Record<TMChamberId, string> = {
  past_hall: 'The Past Hall was the first chamber ever constructed, built from stones that remember every footstep ever taken upon them. Its corridors shift subtly when no one is watching.',
  future_nexus: 'The Future Nexus hovers in a state of quantum uncertainty — it exists and does not exist simultaneously until a chronomancer observes it. Each visit collapses different possibilities.',
  present_sanctum: 'The Present Sanctum is the only chamber anchored in normal time flow. Monks come here to recalibrate after extended temporal operations, grounding themselves in the eternal now.',
  frozen_moment: 'The Frozen Moment preserves the exact instant when the monastery\'s founder first perceived time as a tangible substance. The air is cold enough to crystallize breath.',
  accelerated_garden: 'Plants in the Accelerated Garden complete entire lifecycles in seconds. The gardeners here have learned to observe beauty in motion, for nothing stays still long enough to hold.',
  eternal_library: 'The Eternal Library organizes its collection not by author or title but by temporal resonance. Books that influenced each other across centuries sit on adjacent shelves.',
  temporal_forge: 'The Temporal Forge burns with paradox-steel, a metal that only exists when someone believes in it. Forging here requires equal parts skill and conviction.',
  infinity_atrium: 'The Infinity Atrium is the monastery\'s heart, where time itself is visible as shimmering threads. Standing at its center, one can see every moment that has ever been or will be.',
}

export const TM_RARITY_DESCRIPTIONS: Record<TMRarity, string> = {
  common: 'Common items are found throughout the monastery. They provide basic temporal energy and are essential for beginners.',
  uncommon: 'Uncommon items require some exploration to find. They offer moderate power and are the backbone of any serious chronomancer\'s collection.',
  rare: 'Rare items are discovered in dangerous chambers or unstable timelines. Their temporal power is significant and they often hold unique histories.',
  epic: 'Epic items exist at the boundaries of temporal stability. They contain immense power but require skill and courage to acquire.',
  legendary: 'Legendary items are artifacts of cosmic significance. Each one contains a fragment of time\'s fundamental nature, and collecting them all grants mastery over existence itself.',
}

export const TM_DANGER_DESCRIPTIONS: Record<TMDangerLevel, string> = {
  1: 'Perfectly safe. Time flows normally with no anomalies detected.',
  2: 'Minor temporal fluctuations. Occasionally, you might notice shadows moving at the wrong speed.',
  3: 'Moderate risk. Time moves inconsistently, and small paradoxes may spontaneously form.',
  4: 'Significant danger. Paradoxes are common, and temporal displacement is a real possibility.',
  5: 'High risk. The fabric of time is thin here — one wrong step could send you to an unexpected era.',
  6: 'Severe danger. Multiple timelines overlap, creating zones of impossible physics and contradictory events.',
  7: 'Extreme danger. Causality breaks down regularly. Effects can precede their causes, and paradox storms are frequent.',
  8: 'Critical danger. The distinction between past and future has dissolved. Navigation requires expert chronomantic skill.',
  9: 'Near-catastrophic. Only the most experienced chronomancers dare enter. Reality itself is unstable.',
  10: 'Apocalyptic. The end of time bleeds into this space. Survival requires legendary-level temporal mastery.',
}

export const TM_PARADOX_DESCRIPTIONS: Record<TMParadoxLevel, string> = {
  stable: 'The timeline is stable. Your temporal activities are well within safe parameters.',
  wavering: 'Minor temporal disturbances detected. Consider meditating or reducing time manipulation.',
  unstable: 'The timeline is becoming unreliable. Paradoxes are forming more frequently than they can be resolved.',
  critical: 'Critical temporal instability! Immediate paradox reduction is required to prevent a timeline collapse.',
  collapsed: 'The timeline has collapsed. Extreme measures are needed to restore temporal coherence.',
}

export const TM_ERA_DESCRIPTIONS: Record<TMEra, string> = {
  dawn_of_time: 'The primordial era before history, when the first moments of time crystallized from the void of eternity.',
  ancient_civilization: 'The age of the first great civilizations — Sumeria, Egypt, Babylon — when humans first began to record and measure time.',
  medieval_age: 'The age of faith and feudalism, when monasteries were the keepers of knowledge and time was measured by bells and prayers.',
  renaissance: 'The rebirth of learning, when polymaths began to understand time as a dimension that could be studied and potentially manipulated.',
  industrial_era: 'The age of machines and factories, when the first temporal engines were secretly built and the industrial paradox was discovered.',
  modern_age: 'The present era, where temporal science is emerging from the shadows into mainstream awareness.',
  digital_age: 'The information age, when computers enabled the first true mathematical models of temporal mechanics.',
  far_future: 'A speculative era where time manipulation has transformed civilization beyond recognition.',
  end_of_time: 'The final era, when entropy reaches maximum and all moments converge into one.',
  timeless_void: 'The space between moments, outside of normal time. The monastery draws much of its power from this eternal present.',
}

export const TM_ABILITY_TYPE_DESCRIPTIONS: Record<TMAbilityType, string> = {
  active: 'Active abilities must be manually triggered and consume time energy. They have cooldown periods between uses.',
  passive: 'Passive abilities are always active and do not consume energy. They provide ongoing benefits.',
  ultimate: 'Ultimate abilities are the most powerful chronomantic techniques. They have very long cooldowns but devastating effects.',
}

export const TM_ARTIFACT_CATEGORY_DESCRIPTIONS: Record<TMArtifactCategory, string> = {
  hourglass: 'Hourglasses contain compressed moments of time within their sand. Each grain is a captured instant.',
  time_crystal: 'Time crystals are natural formations that resonate with temporal energy. They pulse with the rhythm of ages.',
  chronos_shard: 'Chronos shards are fragments of broken timelines, each retaining the memory of its original temporal path.',
  epoch_relic: 'Epoch relics are artifacts from specific historical periods that have absorbed the temporal energy of their era.',
  paradox_core: 'Paradox cores are crystallized contradictions — stable impossibilities that generate raw temporal power.',
  temporal_essence: 'Temporal essences are refined forms of temporal energy, distilled from natural phenomena across all eras.',
}

export const TM_STRUCTURE_TYPE_DESCRIPTIONS: Record<TMStructureType, string> = {
  clock_tower: 'Clock towers regulate the temporal harmony of the monastery. Each tower contributes to overall time energy capacity.',
  meditation_hall: 'Meditation halls provide spaces for temporal introspection, accelerating mastery progression and paradox recovery.',
  time_vault: 'Time vaults preserve artifacts and chronicles from temporal decay, protecting your collection from paradox erosion.',
  library: 'Libraries expand the monastery\'s knowledge base, improving chronicle collection bonuses and discovery rates.',
  forge: 'Forges enable the crafting and enhancement of temporal artifacts, increasing their power and utility.',
  garden: 'Gardens produce temporal essences and provide passive time energy regeneration for the monastery.',
  gateway: 'Gateways provide access to distant eras and timelines, reducing travel costs and paradox risk.',
  shrine: 'Shrines grant passive blessings to the monastery, improving various aspects of chronomantic practice.',
  observatory: 'Observatories allow the study of timelines and epochs, providing strategic information about temporal phenomena.',
  sanctum: 'Sanctums are the monastery\'s most sacred spaces, providing global bonuses to all monastery systems.',
}
