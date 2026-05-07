// Pool of interesting English words for the snake game
export const WORD_POOL: string[] = [
  // Nature
  'river', 'ocean', 'forest', 'mountain', 'flower', 'breeze', 'sunset', 'rainbow',
  'thunder', 'meadow', 'valley', 'island', 'desert', 'glacier', 'aurora', 'storm',
  // Emotions
  'joy', 'hope', 'peace', 'dream', 'wonder', 'courage', 'bliss', 'calm',
  'fury', 'grace', 'pride', 'faith', 'love', 'zeal', 'mirth', 'dread',
  // Elements
  'fire', 'water', 'earth', 'wind', 'light', 'shadow', 'frost', 'flame',
  'spark', 'stone', 'crystal', 'ember', 'smoke', 'cloud', 'tide', 'dew',
  // Time
  'dawn', 'dusk', 'twilight', 'eternity', 'moment', 'season', 'epoch', 'hour',
  // Creatures
  'eagle', 'wolf', 'dolphin', 'phoenix', 'dragon', 'falcon', 'tiger', 'swan',
  // Qualities
  'wisdom', 'beauty', 'strength', 'freedom', 'magic', 'power', 'honor', 'truth',
  // Objects
  'sword', 'crown', 'shield', 'lantern', 'mirror', 'compass', 'feather', 'key',
  // Actions
  'soar', 'dance', 'shine', 'bloom', 'whisper', 'glow', 'sparkle', 'drift',
]

export function getRandomWord(exclude: string[] = []): string {
  const available = WORD_POOL.filter((w) => !exclude.includes(w))
  if (available.length === 0) return WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]
  return available[Math.floor(Math.random() * available.length)]
}
