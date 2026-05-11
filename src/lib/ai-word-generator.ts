'use client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GeneratedWordPack = {
  name: string
  emoji: string
  description: string
  words: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  language: string
  createdAt: number
}

export type GenerateRequest = {
  theme: string
  language?: string
  count?: number
  difficulty?: 'easy' | 'medium' | 'hard'
}

export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const MAX_GENERATED_PACKS = 20
export const MAX_WORDS_PER_PACK = 30

// ---------------------------------------------------------------------------
// Theme Suggestions
// ---------------------------------------------------------------------------

export const THEME_SUGGESTIONS: { name: string; emoji: string; description: string }[] = [
  { name: 'Ocean Life', emoji: '🐠', description: 'Creatures and wonders beneath the waves' },
  { name: 'Space', emoji: '🚀', description: 'Planets, stars, and cosmic exploration' },
  { name: 'Ancient History', emoji: '🏛️', description: 'Civilizations, myths, and legendary figures' },
  { name: 'Food & Cooking', emoji: '🍳', description: 'Ingredients, dishes, and culinary terms' },
  { name: 'Music', emoji: '🎵', description: 'Instruments, genres, and musical concepts' },
  { name: 'Sports', emoji: '⚽', description: 'Games, athletes, and sporting events' },
  { name: 'Technology', emoji: '💻', description: 'Gadgets, programming, and digital innovation' },
  { name: 'Nature', emoji: '🌿', description: 'Flora, fauna, and natural landscapes' },
  { name: 'Fantasy', emoji: '🐉', description: 'Magic, mythical creatures, and enchanted realms' },
  { name: 'Science', emoji: '🔬', description: 'Experiments, elements, and discoveries' },
  { name: 'Art & Design', emoji: '🎨', description: 'Styles, tools, and creative expression' },
  { name: 'Travel', emoji: '✈️', description: 'Destinations, cultures, and adventures abroad' },
]

// ---------------------------------------------------------------------------
// Language Options
// ---------------------------------------------------------------------------

export const LANGUAGE_OPTIONS: { code: string; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português' },
]

// ---------------------------------------------------------------------------
// Built-in Word Lists (20+ words per theme)
// ---------------------------------------------------------------------------

const THEME_WORD_LISTS: Record<string, string[]> = {
  'Ocean Life': [
    'whale', 'coral', 'shark', 'octopus', 'dolphin', 'jellyfish', 'seahorse', 'turtle',
    'lobster', 'plankton', 'starfish', 'eel', 'urchin', 'anemone', 'barnacle', 'kelp',
    'trench', 'reef', 'current', 'tidal', 'squid', 'narwhal', 'manatee', 'angler',
  ],
  'Space': [
    'star', 'moon', 'mars', 'orbit', 'comet', 'nebula', 'galaxy', 'asteroid', 'rocket',
    'saturn', 'pluto', 'venus', 'meteor', 'cosmos', 'quasar', 'pulsar', 'eclipse',
    'constellation', 'telescope', 'astronaut', 'satellite', 'supernova', 'gravity', 'voyager',
  ],
  'Ancient History': [
    'rome', 'egypt', 'pharaoh', 'gladiator', 'colosseum', 'sphinx', 'pyramid', 'empire',
    'legion', 'chariot', 'spear', 'shield', 'oracle', 'temple', 'troy', 'spartan',
    'viking', 'knight', 'castle', 'medieval', 'samurai', 'dynasty', 'emperor', 'mythology',
  ],
  'Food & Cooking': [
    'bread', 'pasta', 'sushi', 'steak', 'salad', 'soup', 'cake', 'pizza', 'rice',
    'spice', 'grill', 'roast', 'bake', 'sauce', 'chef', 'menu', 'recipe', 'pepper',
    'garlic', 'butter', 'cheese', 'mango', 'vanilla', 'chocolate',
  ],
  'Music': [
    'drum', 'piano', 'guitar', 'violin', 'flute', 'trumpet', 'melody', 'rhythm', 'chord',
    'tempo', 'bass', 'harp', 'organ', 'banjo', 'tuba', 'lyric', 'tempo', 'chorus',
    'acoustic', 'sonata', 'symphony', 'harmony', 'treble', 'baritone',
  ],
  'Sports': [
    'soccer', 'tennis', 'boxing', 'rugby', 'golf', 'hockey', 'cricket', 'fencing',
    'marathon', 'sprint', 'javelin', 'archery', 'wrestling', 'cycling', 'swimmer',
    'goalie', 'referee', 'stadium', 'trophy', 'medal', 'athlete', 'dribble', 'penalty',
  ],
  'Technology': [
    'code', 'byte', 'pixel', 'cloud', 'data', 'bot', 'chip', 'wire', 'laser', 'drone',
    'server', 'binary', 'cursor', 'kernel', 'socket', 'router', 'codec', 'debug',
    'script', 'deploy', 'cache', 'crypto', 'sensor', 'firmware',
  ],
  'Nature': [
    'tree', 'lake', 'river', 'forest', 'mountain', 'valley', 'meadow', 'canyon',
    'desert', 'island', 'glacier', 'volcano', 'waterfall', 'jungle', 'prairie',
    'cave', 'blossom', 'moss', 'fern', 'petal', 'oak', 'cedar', 'aurora', 'tundra',
  ],
  'Fantasy': [
    'dragon', 'wizard', 'elf', 'dwarf', 'troll', 'gnome', 'fairy', 'spell', 'potion',
    'wand', 'sword', 'quest', 'realm', 'dungeon', 'knight', 'throne', 'goblin',
    'griffin', 'phoenix', 'sorcerer', 'enchanted', 'prophecy', 'rune', 'amulet',
  ],
  'Science': [
    'atom', 'cell', 'gene', 'laser', 'plasma', 'proton', 'neutron', 'enzyme', 'virus',
    'fusion', 'isotope', 'molecule', 'gravity', 'entropy', 'catalyst', 'particle',
    'spectrum', 'magnetic', 'quantum', 'friction', 'voltage', 'element', 'nucleus',
    'hypothesis',
  ],
  'Art & Design': [
    'brush', 'canvas', 'easel', 'palette', 'sketch', 'mural', 'mosaic', 'sculpture',
    'pottery', 'gallery', 'portrait', 'abstract', 'texture', 'gradient', 'vivid',
    'charcoal', 'watercolor', 'pastel', 'collage', 'origami', 'pattern', 'hue',
    'symmetry', 'calligraphy',
  ],
  'Travel': [
    'passport', 'itinerary', 'luggage', 'voyage', 'expedition', 'journey', 'compass',
    'harbor', 'bridge', 'temple', 'souvenir', 'atlas', 'nomad', 'beacon', 'archipelago',
    'caravan', 'pilgrimage', 'frontier', 'landmark', 'safari', 'excursion', 'fjord',
    'oasis', 'terminal',
  ],
}

// ---------------------------------------------------------------------------
// Prompt Builder (for LLM API route)
// ---------------------------------------------------------------------------

export function buildPromptForLLM(request: GenerateRequest): string {
  const count = Math.min(Math.max(request.count ?? 15, 5), MAX_WORDS_PER_PACK)
  const language = request.language ?? 'English'
  const difficulty = request.difficulty ?? 'medium'

  return `You are a creative word-list generator for the game "Word Snake". Generate a themed word pack and respond ONLY with valid JSON (no markdown fences).

Requirements:
- Theme: "${request.theme}"
- Language: ${language}
- Word count: exactly ${count} words
- Difficulty: ${difficulty}
  - easy: short words (3-4 letters)
  - medium: moderate words (5-8 letters)
  - hard: long words (9+ letters)
- All words must be ${difficulty === 'easy' ? '3-4' : difficulty === 'medium' ? '5-8' : '9+'} letters long
- No duplicates, no proper nouns, no hyphens, no apostrophes
- Only letters a-z allowed

Respond with this exact JSON structure:
{
  "name": "pack name (themed and catchy)",
  "emoji": "single thematic emoji",
  "description": "one-sentence description",
  "words": ["word1", "word2", ...],
  "difficulty": "${difficulty}",
  "language": "${language}"
}`
}

// ---------------------------------------------------------------------------
// LLM Response Parser
// ---------------------------------------------------------------------------

export function parseLLMResponse(response: string): GeneratedWordPack {
  // Strip markdown code fences if present
  const cleaned = response
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  const data = JSON.parse(cleaned)

  const themeMatch = THEME_SUGGESTIONS.find(
    (t) => data.name?.toLowerCase().includes(t.name.toLowerCase())
  )
  const emoji = data.emoji || (themeMatch ? themeMatch.emoji : '📦')

  return {
    name: data.name || 'Custom Pack',
    emoji,
    description: data.description || '',
    words: Array.isArray(data.words) ? data.words.slice(0, MAX_WORDS_PER_PACK) : [],
    difficulty: ['easy', 'medium', 'hard'].includes(data.difficulty)
      ? data.difficulty
      : 'medium',
    language: data.language || 'English',
    createdAt: Date.now(),
  }
}

// ---------------------------------------------------------------------------
// Word Pack Validator
// ---------------------------------------------------------------------------

export function validateWordPack(pack: GeneratedWordPack): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!pack.name || pack.name.trim().length === 0) {
    errors.push('Pack name is required')
  }
  if (!pack.emoji) {
    errors.push('Pack emoji is required')
  }
  if (!Array.isArray(pack.words)) {
    errors.push('Words must be an array')
    return { valid: false, errors }
  }
  if (pack.words.length < 3) {
    errors.push(`At least 3 words required, got ${pack.words.length}`)
  }
  if (pack.words.length > MAX_WORDS_PER_PACK) {
    errors.push(`Maximum ${MAX_WORDS_PER_PACK} words allowed, got ${pack.words.length}`)
  }

  const validCharPattern = /^[a-zA-Z]+$/ // will be relaxed for non-Latin languages
  const uniqueWords = new Set<string>()
  pack.words.forEach((word, i) => {
    if (typeof word !== 'string' || word.length === 0) {
      errors.push(`Word at index ${i} is empty or invalid`)
      return
    }
    if (word.length < 2) {
      errors.push(`"${word}" is too short (min 2 characters)`)
    }
    if (word.length > 20) {
      errors.push(`"${word}" is too long (max 20 characters)`)
    }
    if (!validCharPattern.test(word)) {
      errors.push(`"${word}" contains invalid characters (only letters allowed)`)
    }
    const lower = word.toLowerCase()
    if (uniqueWords.has(lower)) {
      errors.push(`Duplicate word: "${word}"`)
    }
    uniqueWords.add(lower)
  })

  return { valid: errors.length === 0, errors }
}

// ---------------------------------------------------------------------------
// Difficulty Estimator
// ---------------------------------------------------------------------------

export function estimateDifficulty(word: string): 'easy' | 'medium' | 'hard' {
  const len = word.length
  if (len < 5) return 'easy'
  if (len <= 8) return 'medium'
  return 'hard'
}

// ---------------------------------------------------------------------------
// Theme Emoji Helper
// ---------------------------------------------------------------------------

export function getThemeEmoji(theme: string): string {
  const match = THEME_SUGGESTIONS.find(
    (t) => theme.toLowerCase().includes(t.name.toLowerCase())
  )
  return match ? match.emoji : '📦'
}

// ---------------------------------------------------------------------------
// Deterministic Word Pack Generator (no LLM needed)
// ---------------------------------------------------------------------------

export function generateWordPackFromLLM(request: GenerateRequest): Promise<GeneratedWordPack> {
  const count = Math.min(Math.max(request.count ?? 15, 5), MAX_WORDS_PER_PACK)
  const language = request.language ?? 'English'
  const requestedDifficulty = request.difficulty ?? 'medium'

  // Find the best-matching theme list
  const themeName = THEME_SUGGESTIONS.find(
    (t) => request.theme.toLowerCase().includes(t.name.toLowerCase())
  )?.name

  let sourceWords: string[] = themeName
    ? [...THEME_WORD_LISTS[themeName]]
    : Object.values(THEME_WORD_LISTS).flat()

  // Filter by difficulty
  const filtered = sourceWords.filter((w) => estimateDifficulty(w) === requestedDifficulty)
  if (filtered.length >= count) {
    sourceWords = filtered
  }

  // Simple deterministic shuffle using theme as seed
  const seed = request.theme
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const shuffled = [...sourceWords].sort((a, b) => {
    const ha = (seed * (a.charCodeAt(0) + 1) + a.charCodeAt(a.length - 1)) % 997
    const hb = (seed * (b.charCodeAt(0) + 1) + b.charCodeAt(b.length - 1)) % 997
    return ha - hb
  })

  const words = Array.from(new Set(shuffled)).slice(0, count)
  const emoji = getThemeEmoji(request.theme)
  const resolvedName = themeName || request.theme

  // Compute actual difficulty from selected words
  const avgLen = words.reduce((s, w) => s + w.length, 0) / Math.max(words.length, 1)
  const difficulty: 'easy' | 'medium' | 'hard' =
    requestedDifficulty === 'easy' || (avgLen < 5 && words.every((w) => w.length < 5))
      ? 'easy'
      : requestedDifficulty === 'hard' || words.every((w) => w.length > 8)
        ? 'hard'
        : 'medium'

  const pack: GeneratedWordPack = {
    name: resolvedName,
    emoji,
    description: `A ${difficulty} word pack about ${resolvedName} in ${language}`,
    words,
    difficulty,
    language,
    createdAt: Date.now(),
  }

  return Promise.resolve(pack)
}

// ---------------------------------------------------------------------------
// LocalStorage Helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'word-snake-ai-packs'

export function saveGeneratedPack(pack: GeneratedWordPack): void {
  if (typeof window === 'undefined') return

  const existing = getGeneratedPacks()
  // Don't exceed max
  const updated = [pack, ...existing].slice(0, MAX_GENERATED_PACKS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function getGeneratedPacks(): GeneratedWordPack[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as GeneratedWordPack[]
  } catch {
    return []
  }
}
