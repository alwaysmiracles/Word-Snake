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
  chinese_emotion:    { label: 'Chinese Emotion',    color: '#f87171', emoji: '❤️' },
  chinese_aesthetic:  { label: 'Chinese Aesthetic',  color: '#fb923c', emoji: '🎨' },
  chinese_character:  { label: 'Character',          color: '#fbbf24', emoji: '👤' },
  chinese_philosophy: { label: 'Philosophy',         color: '#a78bfa', emoji: '💭' },
  chinese_culture:    { label: 'Culture',            color: '#34d399', emoji: '🏮' },
  japanese_philosophy:{ label: 'Japanese Philosophy', color: '#f472b6', emoji: '🌸' },
  japanese_aesthetic: { label: 'Japanese Aesthetic', color: '#c084fc', emoji: '宗' },
  japanese_values:    { label: 'Values',             color: '#4ade80', emoji: '💎' },
  japanese_nature:    { label: 'Nature',             color: '#2dd4bf', emoji: '🌲' },
  japanese_culture:   { label: 'Culture',            color: '#fb7185', emoji: '🏯' },
  japanese_emotion:   { label: 'Emotion',            color: '#f9a8d4', emoji: '💗' },
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
  // Pack 6: Chinese Words (free)
  {
    id: 'chinese',
    name: '中文词汇',
    emoji: '🏯',
    description: 'Beautiful Chinese words with pinyin and meanings',
    unlockType: 'free',
    color: '#ef4444',
    bgColor: 'from-red-900/40 to-orange-900/40',
    words: [
      { word: 'Yuanfen', category: 'chinese_emotion', points: 15, definition: 'The binding force that brings people together by destiny' },
      { word: 'Wabi-sabi', category: 'chinese_aesthetic', points: 20, definition: 'Finding beauty in imperfection and simplicity' },
      { word: 'Xiaoren', category: 'chinese_character', points: 10, definition: 'A petty or small-minded person' },
      { word: 'Junzi', category: 'chinese_character', points: 15, definition: 'A person of noble character, a gentleman' },
      { word: 'Mandate', category: 'chinese_philosophy', points: 12, definition: 'The divine right to rule, from Tianming' },
      { word: 'Qi', category: 'chinese_philosophy', points: 18, definition: 'The vital life force that flows through all things' },
      { word: 'Yin-Yang', category: 'chinese_philosophy', points: 15, definition: 'The dual nature of all existence, complementary opposites' },
      { word: 'Dao', category: 'chinese_philosophy', points: 20, definition: 'The fundamental principle underlying all of reality' },
      { word: 'Kung Fu', category: 'chinese_culture', points: 12, definition: 'Any skill achieved through hard work and practice' },
      { word: 'Dim Sum', category: 'chinese_culture', points: 10, definition: 'A traditional Cantonese style of small plate dining' },
      { word: 'Zen', category: 'chinese_philosophy', points: 18, definition: 'A state of calm attentiveness, from Chinese Chan' },
      { word: 'Fengshui', category: 'chinese_culture', points: 15, definition: 'The art of arranging surroundings to harmonize with nature' },
    ],
  },
  // Pack 7: Japanese Words (free)
  {
    id: 'japanese',
    name: '日本語',
    emoji: '🎌',
    description: 'Evocative Japanese words with deep cultural meaning',
    unlockType: 'free',
    color: '#ec4899',
    bgColor: 'from-pink-900/40 to-rose-900/40',
    words: [
      { word: 'Ikigai', category: 'japanese_philosophy', points: 20, definition: 'A reason for being, the intersection of passion and purpose' },
      { word: 'Kintsugi', category: 'japanese_aesthetic', points: 22, definition: 'The art of repairing broken pottery with gold, embracing flaws' },
      { word: 'Shibui', category: 'japanese_aesthetic', points: 18, definition: 'A subtle, unobtrusive beauty of simple elegance' },
      { word: 'Mono-no-aware', category: 'japanese_philosophy', points: 25, definition: 'The bittersweet awareness of the impermanence of things' },
      { word: 'Wabi', category: 'japanese_aesthetic', points: 15, definition: 'Simplicity and quiet elegance, finding beauty in austerity' },
      { word: 'Sabi', category: 'japanese_aesthetic', points: 15, definition: 'The beauty of age, wear, and the passage of time' },
      { word: 'Mottainai', category: 'japanese_values', points: 18, definition: 'Regret over waste, the importance of using things fully' },
      { word: 'Omotenashi', category: 'japanese_values', points: 20, definition: 'Selfless hospitality, anticipating needs before they arise' },
      { word: 'Gaman', category: 'japanese_values', points: 15, definition: 'Enduring hardship with patience and dignity' },
      { word: 'Forest-bathing', category: 'japanese_nature', points: 12, definition: 'Shinrin-yoku, immersing in the forest atmosphere for wellness' },
      { word: 'Tsundoku', category: 'japanese_culture', points: 14, definition: 'Buying books but letting them pile up unread' },
      { word: 'Natsukashii', category: 'japanese_emotion', points: 16, definition: 'A nostalgic longing for the past, fond memories' },
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
