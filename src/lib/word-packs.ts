// Themed Word Packs system for Word Snake
import { getUnlockedAchievements } from '@/lib/achievements'
import { getBestScore } from '@/lib/leaderboard'
import { getStreak } from '@/lib/streak'

export interface WordPackWord {
  word: string
  category: string       // e.g. 'space', 'ocean_life', 'mythology'
  points: number
  definition: string
}

export interface WordPack {
  id: string
  name: string
  emoji: string
  description: string
  words: WordPackWord[]
  unlockType: 'free' | 'achievement' | 'score' | 'streak'
  unlockRequirement?: string   // achievement ID, or 'score:500', or 'streak:7'
  unlockLabel?: string
  color: string               // Theme color for UI
  bgColor: string             // Background gradient class
}

// Category display info for pack-specific categories
export const PACK_CATEGORY_INFO: Record<string, { label: string; color: string; emoji: string }> = {
  space:      { label: 'Space',      color: '#818cf8', emoji: '🚀' },
  ocean_life: { label: 'Ocean Life', color: '#22d3ee', emoji: '🌊' },
  mythology:  { label: 'Mythology',  color: '#f59e0b', emoji: '⚔️' },
  literature: { label: 'Literature', color: '#a78bfa', emoji: '📖' },
  science:    { label: 'Science',    color: '#34d399', emoji: '🔬' },
}

export const WORD_PACKS: WordPack[] = [
  // Pack 1: Cosmos (free)
  {
    id: 'cosmos',
    name: 'Cosmos',
    emoji: '🚀',
    description: 'Stars, planets, and the vast unknown',
    unlockType: 'free',
    color: '#818cf8',
    bgColor: 'from-indigo-900/40 to-purple-900/40',
    words: [
      { word: 'Nebula', category: 'space', points: 15, definition: 'A cloud of gas and dust in outer space' },
      { word: 'Quasar', category: 'space', points: 25, definition: 'An extremely luminous galactic nucleus' },
      { word: 'Pulsar', category: 'space', points: 20, definition: 'A rotating neutron star emitting radiation' },
      { word: 'Comet', category: 'space', points: 10, definition: 'An icy body that orbits the sun with a glowing tail' },
      { word: 'Eclipse', category: 'space', points: 15, definition: 'When one celestial body obscures another' },
      { word: 'Orbit', category: 'space', points: 10, definition: 'The curved path of an object around a star or planet' },
      { word: 'Nova', category: 'space', points: 15, definition: 'A star showing a sudden burst of brightness' },
      { word: 'Cosmos', category: 'space', points: 10, definition: 'The universe seen as an ordered system' },
      { word: 'Gravity', category: 'space', points: 10, definition: 'The force that attracts objects toward each other' },
      { word: 'Stellar', category: 'space', points: 15, definition: 'Relating to stars or their characteristics' },
      { word: 'Zenith', category: 'space', points: 15, definition: 'The highest point in the sky directly above an observer' },
      { word: 'Aurora', category: 'space', points: 20, definition: 'A natural display of light in the polar sky' },
    ],
  },
  // Pack 2: Ocean Depths (free)
  {
    id: 'ocean_depths',
    name: 'Ocean Depths',
    emoji: '🌊',
    description: 'Mysterious creatures of the deep blue',
    unlockType: 'free',
    color: '#22d3ee',
    bgColor: 'from-cyan-900/40 to-blue-900/40',
    words: [
      { word: 'Kraken', category: 'ocean_life', points: 20, definition: 'A legendary sea monster of enormous size' },
      { word: 'Coral', category: 'ocean_life', points: 10, definition: 'Marine organisms that form colorful reefs' },
      { word: 'Abysmal', category: 'ocean_life', points: 15, definition: 'Extremely deep or unfathomable' },
      { word: 'Tidal', category: 'ocean_life', points: 10, definition: 'Relating to the rise and fall of the sea' },
      { word: 'Pearl', category: 'ocean_life', points: 15, definition: 'A gem formed inside an oyster shell' },
      { word: 'Nautilus', category: 'ocean_life', points: 20, definition: 'A cephalopod with a spiral shell' },
      { word: 'Pelagic', category: 'ocean_life', points: 25, definition: 'Relating to the open sea' },
      { word: 'Anemone', category: 'ocean_life', points: 15, definition: 'A flower-like marine animal with tentacles' },
      { word: 'Lagoon', category: 'ocean_life', points: 10, definition: 'A shallow body of water near the coast' },
      { word: 'Shipwreck', category: 'ocean_life', points: 15, definition: 'The remains of a ship that has sunk' },
      { word: 'Sonar', category: 'ocean_life', points: 15, definition: 'A system for detecting objects underwater' },
      { word: 'Leviathan', category: 'ocean_life', points: 30, definition: 'A massive sea creature from mythology' },
    ],
  },
  // Pack 3: Mythology (locked: achievement 'vocabulary_master')
  {
    id: 'mythology',
    name: 'Mythology',
    emoji: '⚔️',
    description: 'Gods, heroes, and ancient legends',
    unlockType: 'achievement',
    unlockRequirement: 'vocabulary_master',
    unlockLabel: 'Unlock: Collect 50 Words',
    color: '#f59e0b',
    bgColor: 'from-amber-900/40 to-yellow-900/40',
    words: [
      { word: 'Phoenix', category: 'mythology', points: 20, definition: 'A mythical bird that rises from its own ashes' },
      { word: 'Oracle', category: 'mythology', points: 15, definition: 'A priest or priestess who delivers prophecies' },
      { word: 'Titan', category: 'mythology', points: 20, definition: 'A powerful deity from Greek mythology' },
      { word: 'Elysium', category: 'mythology', points: 25, definition: 'The paradise reserved for heroes after death' },
      { word: 'Minotaur', category: 'mythology', points: 20, definition: 'A creature with the body of a man and head of a bull' },
      { word: 'Aegis', category: 'mythology', points: 15, definition: 'A shield or protective backing' },
      { word: 'Nemesis', category: 'mythology', points: 15, definition: 'The goddess of retribution and vengeance' },
      { word: 'Valhalla', category: 'mythology', points: 25, definition: 'The hall where slain Norse warriors go after death' },
      { word: 'Kratos', category: 'mythology', points: 15, definition: 'The personification of strength and power' },
      { word: 'Pantheon', category: 'mythology', points: 20, definition: 'All the gods of a particular mythology' },
      { word: 'Odyssey', category: 'mythology', points: 15, definition: 'A long adventurous journey' },
      { word: 'Quest', category: 'mythology', points: 10, definition: 'A search or pursuit for something important' },
    ],
  },
  // Pack 4: Shakespeare (locked: achievement 'poet_laureate')
  {
    id: 'shakespeare',
    name: 'Shakespeare',
    emoji: '🎭',
    description: 'Words from the Bard himself',
    unlockType: 'achievement',
    unlockRequirement: 'poet_laureate',
    unlockLabel: 'Unlock: Create 5 Poems',
    color: '#a78bfa',
    bgColor: 'from-purple-900/40 to-violet-900/40',
    words: [
      { word: 'Soliloquy', category: 'literature', points: 25, definition: 'An act of speaking thoughts aloud when alone' },
      { word: 'Mirth', category: 'literature', points: 15, definition: 'Amusement, laughter, or gaiety' },
      { word: 'Tragedy', category: 'literature', points: 15, definition: 'A play dealing with sorrowful events' },
      { word: 'Wherefore', category: 'literature', points: 15, definition: 'For what reason (archaic)' },
      { word: 'Courtier', category: 'literature', points: 20, definition: 'A person who attends a royal court' },
      { word: 'Majesty', category: 'literature', points: 15, definition: 'Impressive beauty, scale, or dignity' },
      { word: 'Villain', category: 'literature', points: 10, definition: 'A character whose evil actions drive the plot' },
      { word: 'Dost', category: 'literature', points: 10, definition: 'Do (second person singular, archaic)' },
      { word: 'Hath', category: 'literature', points: 10, definition: 'Has (archaic third person singular)' },
      { word: 'Fie', category: 'literature', points: 20, definition: 'An exclamation expressing disgust or disapproval' },
      { word: 'Verily', category: 'literature', points: 15, definition: 'Truly or certainly (archaic)' },
      { word: 'Forthwith', category: 'literature', points: 20, definition: 'Immediately, without delay' },
    ],
  },
  // Pack 5: Science (locked: score:500)
  {
    id: 'science',
    name: 'Science',
    emoji: '🔬',
    description: 'From quantum to cosmic discoveries',
    unlockType: 'score',
    unlockRequirement: 'score:500',
    unlockLabel: 'Unlock: Reach Score 500',
    color: '#34d399',
    bgColor: 'from-emerald-900/40 to-green-900/40',
    words: [
      { word: 'Quantum', category: 'science', points: 20, definition: 'The minimum amount of any physical entity' },
      { word: 'Entropy', category: 'science', points: 25, definition: 'A measure of disorder in a system' },
      { word: 'Photon', category: 'science', points: 15, definition: 'A particle of light energy' },
      { word: 'Neutron', category: 'science', points: 15, definition: 'A subatomic particle with no electric charge' },
      { word: 'Genome', category: 'science', points: 20, definition: 'The complete set of genes in an organism' },
      { word: 'Catalyst', category: 'science', points: 15, definition: 'A substance that speeds up a chemical reaction' },
      { word: 'Synapse', category: 'science', points: 15, definition: 'A junction between two nerve cells' },
      { word: 'Isotope', category: 'science', points: 20, definition: 'Atoms of the same element with different masses' },
      { word: 'Hypothesis', category: 'science', points: 20, definition: 'A proposed explanation for a phenomenon' },
      { word: 'Fusion', category: 'science', points: 15, definition: 'The process of combining atomic nuclei' },
      { word: 'Kinetic', category: 'science', points: 10, definition: 'Relating to motion and energy' },
      { word: 'Spectrum', category: 'science', points: 15, definition: 'A band of colors or range of values' },
    ],
  },
]

// ─── Storage keys ───────────────────────────────────────────
const ACTIVE_PACK_KEY = 'word-snake-word-pack'
const UNLOCKED_PACKS_KEY = 'word-snake-unlocked-packs'

// ─── Utility functions ──────────────────────────────────────

export function getWordPack(id: string): WordPack | undefined {
  return WORD_PACKS.find((p) => p.id === id)
}

export function getActivePack(): string {
  if (typeof window === 'undefined') return 'default'
  try {
    return localStorage.getItem(ACTIVE_PACK_KEY) ?? 'default'
  } catch {
    return 'default'
  }
}

export function setActivePack(id: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ACTIVE_PACK_KEY, id)
  } catch { /* ignore */ }
}

/** Check if a pack is unlocked based on its requirements */
export function isPackUnlocked(pack: WordPack): boolean {
  if (pack.unlockType === 'free') return true

  try {
    if (pack.unlockType === 'achievement' && pack.unlockRequirement) {
      const unlocked = getUnlockedAchievements()
      return unlocked.includes(pack.unlockRequirement)
    }

    if (pack.unlockType === 'score' && pack.unlockRequirement) {
      const threshold = parseInt(pack.unlockRequirement.split(':')[1], 10)
      // Check the highest score across all difficulties
      const best = Math.max(
        getBestScore('easy'),
        getBestScore('medium'),
        getBestScore('hard'),
        parseInt(localStorage.getItem('word-snake-highscore') ?? '0', 10)
      )
      return best >= threshold
    }

    if (pack.unlockType === 'streak' && pack.unlockRequirement) {
      const threshold = parseInt(pack.unlockRequirement.split(':')[1], 10)
      const streak = getStreak()
      return streak.currentStreak >= threshold
    }
  } catch { /* ignore */ }

  return false
}

/** Get all unlocked pack IDs (persisted separately for reliability) */
export function getUnlockedPacks(): string[] {
  // Always re-check unlock conditions (they may have changed since last save)
  const ids: string[] = []
  for (const pack of WORD_PACKS) {
    if (isPackUnlocked(pack)) {
      ids.push(pack.id)
    }
  }
  return ids
}

/** Get words from a specific pack */
export function getWordsFromPack(packId: string): WordPackWord[] {
  const pack = getWordPack(packId)
  return pack ? pack.words : []
}

/** Get a pack word entry (for point/category lookup) */
export function getPackWordEntry(word: string): WordPackWord | undefined {
  const packId = getActivePack()
  if (packId === 'default') return undefined
  const words = getWordsFromPack(packId)
  return words.find(
    (w) => w.word.toLowerCase() === word.toLowerCase()
  )
}

/** Get category info for both standard and pack categories */
export function getPackCategoryInfo(category: string, word?: string): { label: string; color: string; emoji: string } | null {
  // First check direct category match
  if (PACK_CATEGORY_INFO[category]) return PACK_CATEGORY_INFO[category]
  // If a word is provided, try to find which pack it belongs to
  if (word) {
    for (const pack of WORD_PACKS) {
      const found = pack.words.find(w => w.word.toLowerCase() === word.toLowerCase())
      if (found && PACK_CATEGORY_INFO[found.category]) return PACK_CATEGORY_INFO[found.category]
    }
  }
  return null
}

/**
 * Check all packs and return IDs of any newly unlocked packs.
 * Call this after achievements, scores, or streaks change.
 */
export function checkPackUnlocks(): string[] {
  const previouslyKnown: string[] = []
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(UNLOCKED_PACKS_KEY)
      if (stored) previouslyKnown.push(...JSON.parse(stored))
    } catch { /* ignore */ }
  }

  const nowUnlocked = getUnlockedPacks()

  // Persist current unlocked state
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(UNLOCKED_PACKS_KEY, JSON.stringify(nowUnlocked))
    } catch { /* ignore */ }
  }

  // Return packs that are newly unlocked (in nowUnlocked but not in previouslyKnown)
  return nowUnlocked.filter((id) => !previouslyKnown.includes(id))
}
