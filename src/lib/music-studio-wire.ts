// =============================================================================
// Music Studio Wire — Word Snake Game
// =============================================================================
// A full in-game music composition studio with instruments, a note grid,
// song library, genre templates, chord builder, rhythm patterns, playback,
// recording, daily challenges, achievements, and practice mode.
// =============================================================================

// ─── Type Definitions ─────────────────────────────────────────────────────────

export type MuInstrumentId =
  | 'piano' | 'guitar' | 'drums' | 'bass'
  | 'violin' | 'flute' | 'trumpet' | 'synth'

export interface MuInstrument {
  id: MuInstrumentId
  name: string
  emoji: string
  color: string
  description: string
}

export interface MuNote {
  name: string        // e.g. 'C4'
  frequency: number
  octave: number
  isBlack: boolean
  label: string
}

export interface MuCompositionNote {
  name: string
  frequency: number
  index: number
}

export interface MuSong {
  id: string
  name: string
  genre: string
  notes: MuCompositionNote[]
  bpm: number
  keySignature: string
  timeSignature: string
  createdAt: number
  instrument: MuInstrumentId
}

export interface MuGenre {
  id: string
  name: string
  emoji: string
  color: string
  description: string
  templateNotes: string[]
  defaultBpm: number
  defaultKey: string
}

export interface MuChordType {
  id: string
  name: string
  intervals: number[]
  description: string
}

export interface MuChord {
  root: string
  type: string
  notes: string[]
  name: string
}

export interface MuRhythmPattern {
  id: string
  name: string
  emoji: string
  beatsPerMeasure: number
  subdivision: number
  pattern: number[]   // 1 = hit, 0 = rest
  description: string
}

export interface MuAchievement {
  id: string
  name: string
  emoji: string
  description: string
  unlockedAt: number | null
  target: number
  category: string
}

export interface MuDailyChallenge {
  date: string
  keySignature: string
  bpm: number
  timeSignature: string
  genreId: string
  hint: string
  bonusDescription: string
  completed: boolean
}

export interface MuPlaybackState {
  isPlaying: boolean
  currentNoteIndex: number
  totalNotes: number
  songId: string | null
}

export interface MuRecordingState {
  isRecording: boolean
  notes: MuCompositionNote[]
  startTime: number
}

export interface MuStats {
  songsComposed: number
  totalNotesPlayed: number
  favoriteGenre: string
  practiceTimeSeconds: number
  achievementsUnlocked: number
  dailyStreak: number
  longestComposition: number
  mostUsedInstrument: MuInstrumentId
}

export interface MuMetronomeState {
  enabled: boolean
  bpm: number
  currentBeat: number
  beatsPerMeasure: number
}

export interface MuMusicStudioState {
  initialized: boolean
  selectedInstrument: MuInstrumentId
  composition: MuCompositionNote[]
  songLibrary: MuSong[]
  selectedGenre: string
  bpm: number
  keySignature: string
  timeSignature: string
  playback: MuPlaybackState
  recording: MuRecordingState
  metronome: MuMetronomeState
  achievements: MuAchievement[]
  dailyChallenge: MuDailyChallenge
  stats: MuStats
  practiceStartTime: number | null
  completedDailyDates: string[]
}

// ─── Instrument Constants ────────────────────────────────────────────────────

const INSTRUMENTS: MuInstrument[] = [
  { id: 'piano',   name: 'Piano',   emoji: '🎹', color: '#4A90D9', description: 'Classic keys — versatile and expressive' },
  { id: 'guitar',  name: 'Guitar',  emoji: '🎸', color: '#E67E22', description: 'Warm strummed or plucked tones' },
  { id: 'drums',   name: 'Drums',   emoji: '🥁', color: '#E74C3C', description: 'Percussive hits and beats' },
  { id: 'bass',    name: 'Bass',    emoji: '🎸', color: '#2C3E50', description: 'Deep low-end foundation' },
  { id: 'violin',  name: 'Violin',  emoji: '🎻', color: '#8E44AD', description: 'Lyrical bowed strings' },
  { id: 'flute',   name: 'Flute',   emoji: '🪈', color: '#1ABC9C', description: 'Airy and light melodies' },
  { id: 'trumpet', name: 'Trumpet', emoji: '📯', color: '#F39C12', description: 'Bright and bold brass' },
  { id: 'synth',   name: 'Synth',   emoji: '🎛️', color: '#9B59B6', description: 'Electronic synthesized sounds' },
]

// ─── Note Grid Constants (C3 – B5, 36 notes) ────────────────────────────────

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const NOTE_BLACK_SET = new Set(['C#', 'D#', 'F#', 'G#', 'A#'])

const NOTE_FREQUENCIES: Record<string, number> = {
  C3: 130.81, 'C#3': 138.59, D3: 146.83, 'D#3': 155.56, E3: 164.81,
  F3: 174.61, 'F#3': 185.00, G3: 196.00, 'G#3': 207.65, A3: 220.00,
  'A#3': 233.08, B3: 246.94,
  C4: 261.63, 'C#4': 277.18, D4: 293.66, 'D#4': 311.13, E4: 329.63,
  F4: 349.23, 'F#4': 369.99, G4: 392.00, 'G#4': 415.30, A4: 440.00,
  'A#4': 466.16, B4: 493.88,
  C5: 523.25, 'C#5': 554.37, D5: 587.33, 'D#5': 622.25, E5: 659.25,
  F5: 698.46, 'F#5': 739.99, G5: 783.99, 'G#5': 830.61, A5: 880.00,
  'A#5': 932.33, B5: 987.77,
}

const ALL_NOTES: MuNote[] = []
for (let octave = 3; octave <= 5; octave++) {
  for (const name of NOTE_NAMES) {
    const full = `${name}${octave}`
    const freq = NOTE_FREQUENCIES[full]
    if (freq) {
      ALL_NOTES.push({
        name: full,
        frequency: freq,
        octave,
        isBlack: NOTE_BLACK_SET.has(name),
        label: name,
      })
    }
  }
}

// ─── Key Signature Constants ──────────────────────────────────────────────────

const KEY_SIGNATURES = [
  'C major', 'G major', 'D major', 'A major', 'E major', 'B major',
  'F major', 'Bb major', 'Eb major', 'Ab major',
  'A minor', 'E minor', 'B minor', 'D minor', 'G minor',
]

const TIME_SIGNATURES = ['4/4', '3/4', '6/8']

// ─── Genre Constants ──────────────────────────────────────────────────────────

const GENRES: MuGenre[] = [
  {
    id: 'classical', name: 'Classical', emoji: '🎼', color: '#8E44AD',
    description: 'Elegant compositions rooted in tradition',
    templateNotes: ['C4', 'E4', 'G4', 'C5', 'G4', 'E4', 'D4', 'F4', 'A4', 'D5', 'A4', 'F4'],
    defaultBpm: 90, defaultKey: 'C major',
  },
  {
    id: 'jazz', name: 'Jazz', emoji: '🎷', color: '#2C3E50',
    description: 'Smooth harmonies with swing feel',
    templateNotes: ['C4', 'E4', 'G4', 'Bb4', 'A4', 'F4', 'D4', 'G4', 'E4', 'C5', 'B4', 'G4'],
    defaultBpm: 110, defaultKey: 'Bb major',
  },
  {
    id: 'pop', name: 'Pop', emoji: '🎤', color: '#E74C3C',
    description: 'Catchy melodies that stick in your head',
    templateNotes: ['C4', 'D4', 'E4', 'G4', 'A4', 'G4', 'E4', 'D4', 'C4', 'E4', 'G4', 'C5'],
    defaultBpm: 120, defaultKey: 'C major',
  },
  {
    id: 'rock', name: 'Rock', emoji: '🪨', color: '#E67E22',
    description: 'Powerful riffs and driving energy',
    templateNotes: ['E4', 'E4', 'G4', 'A4', 'B4', 'A4', 'G4', 'E4', 'D4', 'E4', 'G4', 'B4'],
    defaultBpm: 130, defaultKey: 'E minor',
  },
  {
    id: 'ambient', name: 'Ambient', emoji: '🌌', color: '#1ABC9C',
    description: 'Atmospheric soundscapes and textures',
    templateNotes: ['C4', 'E4', 'G4', 'B4', 'C5', 'B4', 'G4', 'E4', 'D4', 'F4', 'A4', 'C5'],
    defaultBpm: 70, defaultKey: 'C major',
  },
  {
    id: 'electronic', name: 'Electronic', emoji: '⚡', color: '#9B59B6',
    description: 'Synthesized beats and digital tones',
    templateNotes: ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'F4', 'F4', 'C4', 'Eb4', 'G4', 'C5'],
    defaultBpm: 140, defaultKey: 'C minor',
  },
]

// ─── Chord Type Constants ────────────────────────────────────────────────────

const CHORD_TYPES: MuChordType[] = [
  { id: 'major', name: 'Major', intervals: [0, 4, 7], description: 'Happy and bright — root, major third, perfect fifth' },
  { id: 'minor', name: 'Minor', intervals: [0, 3, 7], description: 'Sad and dark — root, minor third, perfect fifth' },
  { id: 'seventh', name: 'Seventh', intervals: [0, 4, 7, 10], description: 'Bluesy tension — major triad plus minor seventh' },
  { id: 'diminished', name: 'Diminished', intervals: [0, 3, 6], description: 'Unstable and tense — root, minor third, diminished fifth' },
]

// ─── Rhythm Pattern Constants ────────────────────────────────────────────────

const RHYTHM_PATTERNS: MuRhythmPattern[] = [
  { id: 'basic_44', name: 'Basic 4/4', emoji: '🥁', beatsPerMeasure: 4, subdivision: 4,
    pattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    description: 'Steady quarter-note pulse' },
  { id: 'rock_beat', name: 'Rock Beat', emoji: '🪨', beatsPerMeasure: 4, subdivision: 4,
    pattern: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    description: 'Driving eighth-note rock feel' },
  { id: 'waltz', name: 'Waltz', emoji: '💃', beatsPerMeasure: 3, subdivision: 4,
    pattern: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    description: 'Elegant 3/4 time waltz' },
  { id: 'syncopated', name: 'Syncopated', emoji: '🎤', beatsPerMeasure: 4, subdivision: 4,
    pattern: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0],
    description: 'Off-beat syncopated groove' },
  { id: 'shuffle', name: 'Shuffle', emoji: '🎷', beatsPerMeasure: 4, subdivision: 6,
    pattern: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    description: 'Swing shuffle triplet feel' },
  { id: 'six_eight', name: '6/8 Time', emoji: '🌊', beatsPerMeasure: 6, subdivision: 4,
    pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
    description: 'Flowing 6/8 compound time' },
  { id: 'drum_fill', name: 'Drum Fill', emoji: '💥', beatsPerMeasure: 4, subdivision: 8,
    pattern: [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    description: 'Rapid build-up fill' },
  { id: 'minimal', name: 'Minimal Pulse', emoji: '⚪', beatsPerMeasure: 4, subdivision: 2,
    pattern: [1, 0, 0, 0, 1, 0, 0, 0],
    description: 'Sparse half-note pulse' },
]

// ─── Achievement Constants ───────────────────────────────────────────────────

const ACHIEVEMENT_DEFS: Omit<MuAchievement, 'unlockedAt'>[] = [
  { id: 'first_song', name: 'First Song', emoji: '🎵', description: 'Compose your first song', target: 1, category: 'composition' },
  { id: 'composer_5', name: 'Composer 5', emoji: '🎶', description: 'Compose 5 songs', target: 5, category: 'composition' },
  { id: 'composer_10', name: 'Composer 10', emoji: '🎼', description: 'Compose 10 songs', target: 10, category: 'composition' },
  { id: 'composer_20', name: 'Master Composer', emoji: '🏆', description: 'Compose 20 songs', target: 20, category: 'composition' },
  { id: 'genre_master', name: 'Genre Master', emoji: '🌟', description: 'Save a song in every genre', target: 6, category: 'genre' },
  { id: 'chord_builder', name: 'Chord Builder', emoji: '🎸', description: 'Build 10 different chords', target: 10, category: 'theory' },
  { id: 'note_100', name: '100 Notes', emoji: '💯', description: 'Play 100 total notes', target: 100, category: 'notes' },
  { id: 'note_500', name: '500 Notes', emoji: '🔥', description: 'Play 500 total notes', target: 500, category: 'notes' },
  { id: 'note_1000', name: '1000 Notes', emoji: '⚡', description: 'Play 1000 total notes', target: 1000, category: 'notes' },
  { id: 'daily_3', name: 'Daily Streak 3', emoji: '📅', description: 'Complete 3 daily challenges in a row', target: 3, category: 'daily' },
  { id: 'daily_7', name: 'Weekly Warrior', emoji: '🗓️', description: 'Complete 7 daily challenges in a row', target: 7, category: 'daily' },
  { id: 'long_composition', name: 'Epic Composer', emoji: '📜', description: 'Compose a song with 32 notes', target: 32, category: 'composition' },
  { id: 'multi_instrument', name: 'Multi-Instrumentalist', emoji: '🎹', description: 'Use 5 different instruments', target: 5, category: 'instrument' },
  { id: 'practice_30m', name: 'Practice 30m', emoji: '⏱️', description: 'Accumulate 30 minutes of practice time', target: 1800, category: 'practice' },
  { id: 'sharer', name: 'Song Sharer', emoji: '🔗', description: 'Generate a share code for a song', target: 1, category: 'social' },
]

// ─── Module-Level State (SSR-safe) ───────────────────────────────────────────

let _state: MuMusicStudioState | null = null

// ─── Internal Helpers ────────────────────────────────────────────────────────

function createDefaultState(): MuMusicStudioState {
  return {
    initialized: false,
    selectedInstrument: 'piano',
    composition: [],
    songLibrary: [],
    selectedGenre: 'pop',
    bpm: 120,
    keySignature: 'C major',
    timeSignature: '4/4',
    playback: { isPlaying: false, currentNoteIndex: -1, totalNotes: 0, songId: null },
    recording: { isRecording: false, notes: [], startTime: 0 },
    metronome: { enabled: false, bpm: 120, currentBeat: 0, beatsPerMeasure: 4 },
    achievements: ACHIEVEMENT_DEFS.map((a) => ({ ...a, unlockedAt: null })),
    dailyChallenge: {
      date: '',
      keySignature: 'C major',
      bpm: 100,
      timeSignature: '4/4',
      genreId: 'pop',
      hint: 'Create a melody using notes from the C major scale.',
      bonusDescription: 'Complete today\'s challenge for bonus points!',
      completed: false,
    },
    stats: {
      songsComposed: 0,
      totalNotesPlayed: 0,
      favoriteGenre: '',
      practiceTimeSeconds: 0,
      achievementsUnlocked: 0,
      dailyStreak: 0,
      longestComposition: 0,
      mostUsedInstrument: 'piano',
    },
    practiceStartTime: null,
    completedDailyDates: [],
  }
}

function ensureInit(): void {
  if (_state) return
  _state = createDefaultState()
  _state.initialized = true
}

function generateId(): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `mu_${ts}_${rand}`
}

function todayString(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function seededPick<T>(arr: T[], seed: number): T {
  const idx = Math.abs(seed) % arr.length
  return arr[idx]
}

function parseKeyScale(keySignature: string): string[] {
  const keyMap: Record<string, string[]> = {
    'C major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    'G major': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
    'D major': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
    'A major': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
    'E major': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
    'B major': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
    'F major': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
    'Bb major': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
    'Eb major': ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
    'Ab major': ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
    'A minor': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    'E minor': ['E', 'F#', 'G', 'A', 'B', 'C', 'D'],
    'B minor': ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'],
    'D minor': ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'],
    'G minor': ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'],
    'C minor': ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
  }
  return keyMap[keySignature] ?? keyMap['C major']!
}

// ─── State Management ────────────────────────────────────────────────────────

export function muInit(): MuMusicStudioState {
  ensureInit()
  const s = _state!
  if (s.dailyChallenge.date !== todayString()) {
    const dayNum = new Date().getDate()
    const monthNum = new Date().getMonth()
    const seed = dayNum * 31 + monthNum
    const key = seededPick(KEY_SIGNATURES, seed)
    const genre = seededPick(GENRES, seed * 7)
    s.dailyChallenge = {
      date: todayString(),
      keySignature: key,
      bpm: 80 + (seed % 80),
      timeSignature: seededPick(TIME_SIGNATURES, seed * 3),
      genreId: genre.id,
      hint: `Compose a melody in ${key} at ${s.dailyChallenge.bpm} BPM.`,
      bonusDescription: 'Finish today\'s challenge for bonus points!',
      completed: s.completedDailyDates.includes(todayString()),
    }
  }
  return s
}

export function muGetState(): MuMusicStudioState {
  ensureInit()
  return _state!
}

export function muResetState(): MuMusicStudioState {
  _state = createDefaultState()
  _state.initialized = true
  return _state
}

// ─── Instrument Functions ────────────────────────────────────────────────────

export function muGetInstruments(): MuInstrument[] {
  ensureInit()
  return INSTRUMENTS.map((inst) => ({
    ...inst,
  }))
}

export function muSelectInstrument(id: string): MuInstrument | null {
  ensureInit()
  const inst = INSTRUMENTS.find((i) => i.id === id)
  if (!inst) return null
  _state!.selectedInstrument = inst.id as MuInstrumentId
  return inst
}

export function muGetNoteGrid(): MuNote[] {
  ensureInit()
  return [...ALL_NOTES]
}

// ─── Composition Functions ───────────────────────────────────────────────────

export function muStartComposition(): void {
  ensureInit()
  _state!.composition = []
}

export function muAddNote(noteName: string): MuCompositionNote | null {
  ensureInit()
  const s = _state!
  if (s.composition.length >= 32) return null

  const noteData = ALL_NOTES.find((n) => n.name === noteName)
  if (!noteData) return null

  const compNote: MuCompositionNote = {
    name: noteData.name,
    frequency: noteData.frequency,
    index: s.composition.length,
  }

  s.composition.push(compNote)
  s.stats.totalNotesPlayed++
  s.stats.longestComposition = Math.max(s.stats.longestComposition, s.composition.length)
  return compNote
}

export function muRemoveLastNote(): MuCompositionNote | null {
  ensureInit()
  const s = _state!
  if (s.composition.length === 0) return null
  return s.composition.pop() ?? null
}

export function muGetComposition(): MuCompositionNote[] {
  ensureInit()
  return [..._state!.composition]
}

export function muClearComposition(): void {
  ensureInit()
  _state!.composition = []
}

// ─── Song Library Functions ──────────────────────────────────────────────────

export function muSaveSong(name: string, options?: {
  genre?: string
  bpm?: number
  keySignature?: string
  timeSignature?: string
}): MuSong | null {
  ensureInit()
  const s = _state!
  if (s.composition.length === 0) return null
  if (s.songLibrary.length >= 20) return null

  const song: MuSong = {
    id: generateId(),
    name: name || 'Untitled',
    genre: options?.genre ?? s.selectedGenre,
    notes: [...s.composition],
    bpm: options?.bpm ?? s.bpm,
    keySignature: options?.keySignature ?? s.keySignature,
    timeSignature: options?.timeSignature ?? s.timeSignature,
    createdAt: Date.now(),
    instrument: s.selectedInstrument,
  }

  s.songLibrary.push(song)
  s.stats.songsComposed++

  // Update favorite genre
  const genreCounts: Record<string, number> = {}
  for (const sg of s.songLibrary) {
    genreCounts[sg.genre] = (genreCounts[sg.genre] ?? 0) + 1
  }
  let maxGenre = ''
  let maxCount = 0
  for (const [g, c] of Object.entries(genreCounts)) {
    if (c > maxCount) { maxCount = c; maxGenre = g }
  }
  s.stats.favoriteGenre = maxGenre

  return song
}

export function muGetSongLibrary(): MuSong[] {
  ensureInit()
  return [..._state!.songLibrary]
}

export function muDeleteSong(songId: string): boolean {
  ensureInit()
  const s = _state!
  const idx = s.songLibrary.findIndex((sg) => sg.id === songId)
  if (idx < 0) return false
  s.songLibrary.splice(idx, 1)
  return true
}

export function muLoadSong(songId: string): MuSong | null {
  ensureInit()
  const s = _state!
  const song = s.songLibrary.find((sg) => sg.id === songId)
  if (!song) return null
  s.composition = song.notes.map((n, i) => ({ ...n, index: i }))
  s.selectedInstrument = song.instrument
  s.bpm = song.bpm
  s.keySignature = song.keySignature
  s.timeSignature = song.timeSignature
  s.selectedGenre = song.genre
  return song
}

export function muGetSongById(songId: string): MuSong | null {
  ensureInit()
  return _state!.songLibrary.find((sg) => sg.id === songId) ?? null
}

// ─── Playback Functions ──────────────────────────────────────────────────────

export function muPlaySong(songId?: string): boolean {
  ensureInit()
  const s = _state!

  let notes: MuCompositionNote[] = []
  let targetSongId: string | null = songId ?? null

  if (songId) {
    const song = s.songLibrary.find((sg) => sg.id === songId)
    if (!song) return false
    notes = song.notes
    targetSongId = songId
  } else {
    notes = s.composition
  }

  if (notes.length === 0) return false

  s.playback = {
    isPlaying: true,
    currentNoteIndex: 0,
    totalNotes: notes.length,
    songId: targetSongId,
  }

  return true
}

export function muAdvancePlayback(): MuCompositionNote | null {
  ensureInit()
  const s = _state!
  if (!s.playback.isPlaying) return null

  s.playback.currentNoteIndex++

  if (s.playback.currentNoteIndex >= s.playback.totalNotes) {
    s.playback.isPlaying = false
    s.playback.currentNoteIndex = -1
    return null
  }

  const notes = s.playback.songId
    ? (s.songLibrary.find((sg) => sg.id === s.playback.songId)?.notes ?? [])
    : s.composition

  return notes[s.playback.currentNoteIndex] ?? null
}

export function muStopPlayback(): void {
  ensureInit()
  _state!.playback = { isPlaying: false, currentNoteIndex: -1, totalNotes: 0, songId: null }
}

export function muGetCurrentPlaybackNote(): { note: MuCompositionNote | null; index: number } {
  ensureInit()
  const p = _state!.playback
  if (!p.isPlaying || p.currentNoteIndex < 0) {
    return { note: null, index: -1 }
  }

  const notes = p.songId
    ? (_state!.songLibrary.find((sg) => sg.id === p.songId)?.notes ?? [])
    : _state!.composition

  const note = notes[p.currentNoteIndex] ?? null
  return { note, index: p.currentNoteIndex }
}

export function muIsPlaying(): boolean {
  ensureInit()
  return _state!.playback.isPlaying
}

// ─── Recording Functions ─────────────────────────────────────────────────────

export function muStartRecording(): boolean {
  ensureInit()
  const s = _state!
  if (s.recording.isRecording) return false
  s.recording = { isRecording: true, notes: [], startTime: Date.now() }
  return true
}

export function muStopRecording(): MuCompositionNote[] {
  ensureInit()
  const s = _state!
  if (!s.recording.isRecording) return []
  s.recording.isRecording = false

  // Copy recording notes into composition
  s.composition = s.recording.notes.map((n, i) => ({ ...n, index: i }))
  const result = [...s.recording.notes]
  s.recording.notes = []
  return result
}

export function muGetRecording(): { isRecording: boolean; notes: MuCompositionNote[] } {
  ensureInit()
  const r = _state!.recording
  return { isRecording: r.isRecording, notes: [...r.notes] }
}

export function muRecordNote(noteName: string): MuCompositionNote | null {
  ensureInit()
  const s = _state!
  if (!s.recording.isRecording) return null
  if (s.recording.notes.length >= 32) return null

  const noteData = ALL_NOTES.find((n) => n.name === noteName)
  if (!noteData) return null

  const compNote: MuCompositionNote = {
    name: noteData.name,
    frequency: noteData.frequency,
    index: s.recording.notes.length,
  }
  s.recording.notes.push(compNote)
  s.stats.totalNotesPlayed++
  return compNote
}

// ─── Genre Functions ─────────────────────────────────────────────────────────

export function muGetGenres(): MuGenre[] {
  ensureInit()
  return [...GENRES]
}

export function muApplyGenreTemplate(genreId: string): MuCompositionNote[] | null {
  ensureInit()
  const genre = GENRES.find((g) => g.id === genreId)
  if (!genre) return null

  const s = _state!
  s.selectedGenre = genre.id
  s.bpm = genre.defaultBpm
  s.keySignature = genre.defaultKey
  s.composition = []

  for (const noteName of genre.templateNotes) {
    const noteData = ALL_NOTES.find((n) => n.name === noteName)
    if (noteData) {
      s.composition.push({
        name: noteData.name,
        frequency: noteData.frequency,
        index: s.composition.length,
      })
    }
  }

  return [...s.composition]
}

export function muGetGenreById(genreId: string): MuGenre | null {
  ensureInit()
  return GENRES.find((g) => g.id === genreId) ?? null
}

// ─── Chord Functions ─────────────────────────────────────────────────────────

export function muGetChordTypes(): MuChordType[] {
  ensureInit()
  return [...CHORD_TYPES]
}

export function muBuildChord(rootNote: string, chordTypeId: string): MuChord | null {
  ensureInit()
  const chordType = CHORD_TYPES.find((ct) => ct.id === chordTypeId)
  if (!chordType) return null

  const root = ALL_NOTES.find((n) => n.name === rootNote)
  if (!root) return null

  const rootIndex = NOTE_NAMES.indexOf(root.label)
  if (rootIndex < 0) return null

  const chordNotes: string[] = []
  for (const interval of chordType.intervals) {
    const noteIdx = (rootIndex + Math.floor(interval / 12) + (interval % 12)) % 12
    const noteName = NOTE_NAMES[noteIdx]
    if (noteName) {
      // Prefer the octave of the root for the chord
      const fullNote = `${noteName}${root.octave}`
      if (NOTE_FREQUENCIES[fullNote]) {
        chordNotes.push(fullNote)
      } else {
        // Try next octave
        const fullNoteUp = `${noteName}${root.octave + 1}`
        if (NOTE_FREQUENCIES[fullNoteUp]) {
          chordNotes.push(fullNoteUp)
        }
      }
    }
  }

  return {
    root: rootNote,
    type: chordType.name,
    notes: chordNotes,
    name: `${root.label} ${chordType.name}`,
  }
}

export function muGetChordLibrary(): MuChord[] {
  ensureInit()
  const chords: MuChord[] = []
  const commonRoots = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']

  for (const root of commonRoots) {
    for (const ct of CHORD_TYPES) {
      const chord = muBuildChord(root, ct.id)
      if (chord) chords.push(chord)
    }
  }

  return chords
}

// ─── Rhythm & Metronome Functions ────────────────────────────────────────────

export function muGetRhythmPatterns(): MuRhythmPattern[] {
  ensureInit()
  return [...RHYTHM_PATTERNS]
}

export function muApplyRhythmPattern(patternId: string): MuRhythmPattern | null {
  ensureInit()
  const pattern = RHYTHM_PATTERNS.find((rp) => rp.id === patternId)
  if (!pattern) return null

  const s = _state!
  s.timeSignature = `${pattern.beatsPerMeasure}/${pattern.subdivision <= 4 ? 4 : 8}`
  return pattern
}

export function muGetMetronomeBPM(): number {
  ensureInit()
  return _state!.metronome.bpm
}

export function muSetMetronomeBPM(bpm: number): number {
  ensureInit()
  const clamped = Math.max(40, Math.min(300, bpm))
  _state!.metronome.bpm = clamped
  return clamped
}

export function muToggleMetronome(): boolean {
  ensureInit()
  const m = _state!.metronome
  m.enabled = !m.enabled
  if (m.enabled) {
    m.currentBeat = 0
  }
  return m.enabled
}

export function muGetMetronomeState(): MuMetronomeState {
  ensureInit()
  return { ..._state!.metronome }
}

export function muAdvanceMetronomeBeat(): number {
  ensureInit()
  const m = _state!.metronome
  if (!m.enabled) return -1
  m.currentBeat = (m.currentBeat + 1) % m.beatsPerMeasure
  return m.currentBeat
}

export function muGetTimeSignatures(): string[] {
  ensureInit()
  return [...TIME_SIGNATURES]
}

export function muGetKeySignatures(): string[] {
  ensureInit()
  return [...KEY_SIGNATURES]
}

export function muSetKeySignature(key: string): string {
  ensureInit()
  const valid = KEY_SIGNATURES.find((k) => k === key)
  if (valid) _state!.keySignature = valid
  return _state!.keySignature
}

export function muSetTimeSignature(ts: string): string {
  ensureInit()
  const valid = TIME_SIGNATURES.find((t) => t === ts)
  if (valid) _state!.timeSignature = valid
  return _state!.timeSignature
}

export function muSetBPM(bpm: number): number {
  ensureInit()
  _state!.bpm = Math.max(40, Math.min(300, bpm))
  return _state!.bpm
}

export function muGetBPM(): number {
  ensureInit()
  return _state!.bpm
}

// ─── Tempo & Music Theory Helpers ────────────────────────────────────────────

export function muGetScaleNotes(keySignature: string, octave?: number): string[] {
  ensureInit()
  const scale = parseKeyScale(keySignature)
  const oct = octave ?? 4
  return scale.map((n) => {
    const full = `${n}${oct}`
    return NOTE_FREQUENCIES[full] ? full : `${n}${oct + 1}`
  })
}

export function muIsNoteInKey(noteName: string, keySignature: string): boolean {
  ensureInit()
  const scale = parseKeyScale(keySignature)
  const label = noteName.replace(/\d+$/, '')
  return scale.includes(label)
}

export function muGetInterval(note1: string, note2: string): number {
  ensureInit()
  const idx1 = ALL_NOTES.findIndex((n) => n.name === note1)
  const idx2 = ALL_NOTES.findIndex((n) => n.name === note2)
  if (idx1 < 0 || idx2 < 0) return -1
  return Math.abs(idx2 - idx1)
}

// ─── Daily Challenge Functions ───────────────────────────────────────────────

export function muGetDailyChallenge(): MuDailyChallenge {
  ensureInit()
  const s = _state!
  if (s.dailyChallenge.date !== todayString()) {
    muInit()
  }
  return { ...s.dailyChallenge }
}

export function muCompleteDailyChallenge(): boolean {
  ensureInit()
  const s = _state!
  if (s.dailyChallenge.completed) return false
  s.dailyChallenge.completed = true

  if (!s.completedDailyDates.includes(todayString())) {
    s.completedDailyDates.push(todayString())
  }

  // Calculate streak
  const sorted = [...s.completedDailyDates].sort().reverse()
  let streak = 0
  const checkDate = new Date()
  for (const dateStr of sorted) {
    const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`
    if (dateStr === dStr) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (dateStr < dStr) {
      break
    }
  }
  s.stats.dailyStreak = streak

  return true
}

export function muIsDailyCompleted(): boolean {
  ensureInit()
  const s = _state!
  if (s.dailyChallenge.date !== todayString()) {
    muInit()
  }
  return _state!.dailyChallenge.completed
}

export function muGetDailyStreak(): number {
  ensureInit()
  return _state!.stats.dailyStreak
}

// ─── Practice Mode Functions ─────────────────────────────────────────────────

export function muStartPractice(): void {
  ensureInit()
  _state!.practiceStartTime = Date.now()
}

export function muStopPractice(): number {
  ensureInit()
  const s = _state!
  if (!s.practiceStartTime) return 0
  const elapsed = Math.floor((Date.now() - s.practiceStartTime) / 1000)
  s.stats.practiceTimeSeconds += elapsed
  s.practiceStartTime = null
  return s.stats.practiceTimeSeconds
}

export function muGetPracticeTime(): number {
  ensureInit()
  const s = _state!
  let total = s.stats.practiceTimeSeconds
  if (s.practiceStartTime) {
    total += Math.floor((Date.now() - s.practiceStartTime) / 1000)
  }
  return total
}

export function muIsPracticing(): boolean {
  ensureInit()
  return _state!.practiceStartTime !== null
}

// ─── Achievement Functions ───────────────────────────────────────────────────

export function muGetAchievements(): MuAchievement[] {
  ensureInit()
  return _state!.achievements.map((a) => ({ ...a }))
}

export function muCheckAchievements(): MuAchievement[] {
  ensureInit()
  const s = _state!
  const newlyUnlocked: MuAchievement[] = []

  for (const ach of s.achievements) {
    if (ach.unlockedAt !== null) continue

    let progress = 0
    switch (ach.id) {
      case 'first_song':
      case 'composer_5':
      case 'composer_10':
      case 'composer_20':
        progress = s.stats.songsComposed
        break
      case 'genre_master': {
        const genres = new Set(s.songLibrary.map((sg) => sg.genre))
        progress = genres.size
        break
      }
      case 'chord_builder':
        progress = Math.min(s.stats.totalNotesPlayed, ach.target)
        break
      case 'note_100':
      case 'note_500':
      case 'note_1000':
        progress = s.stats.totalNotesPlayed
        break
      case 'daily_3':
      case 'daily_7':
        progress = s.stats.dailyStreak
        break
      case 'long_composition':
        progress = s.stats.longestComposition
        break
      case 'multi_instrument': {
        const insts = new Set(s.songLibrary.map((sg) => sg.instrument))
        progress = insts.size
        break
      }
      case 'practice_30m':
        progress = s.stats.practiceTimeSeconds
        break
      case 'sharer':
        progress = 0 // Tracked externally when share code is generated
        break
    }

    if (progress >= ach.target) {
      ach.unlockedAt = Date.now()
      s.stats.achievementsUnlocked++
      newlyUnlocked.push({ ...ach })
    }
  }

  return newlyUnlocked
}

export function muUnlockAchievementById(achId: string): boolean {
  ensureInit()
  const ach = _state!.achievements.find((a) => a.id === achId)
  if (!ach || ach.unlockedAt !== null) return false
  ach.unlockedAt = Date.now()
  _state!.stats.achievementsUnlocked++
  return true
}

// ─── Song Sharing Functions ──────────────────────────────────────────────────

export function muGenerateShareCode(songId: string): string | null {
  ensureInit()
  const song = _state!.songLibrary.find((sg) => sg.id === songId)
  if (!song) return null

  try {
    const compact = {
      n: song.name,
      g: song.genre,
      b: song.bpm,
      k: song.keySignature,
      t: song.timeSignature,
      i: song.instrument,
      notes: song.notes.map((nt) => nt.name),
    }
    const json = JSON.stringify(compact)
    const encoded = Buffer.from(json).toString('base64')
    const code = `MUS:1:${encoded}`

    // Unlock sharer achievement
    muUnlockAchievementById('sharer')

    return code
  } catch {
    return null
  }
}

export function muImportFromCode(code: string): MuSong | null {
  ensureInit()
  if (!code.startsWith('MUS:1:')) return null
  const encoded = code.slice(6)

  try {
    const json = Buffer.from(encoded, 'base64').toString('utf-8')
    const compact = JSON.parse(json) as {
      n?: string
      g?: string
      b?: number
      k?: string
      t?: string
      i?: string
      notes?: string[]
    }

    if (!compact.notes || !Array.isArray(compact.notes)) return null

    const notes: MuCompositionNote[] = []
    for (const noteName of compact.notes) {
      const noteData = ALL_NOTES.find((n) => n.name === noteName)
      if (noteData) {
        notes.push({
          name: noteData.name,
          frequency: noteData.frequency,
          index: notes.length,
        })
      }
    }

    if (notes.length === 0) return null

    const song: MuSong = {
      id: generateId(),
      name: compact.n || 'Imported Song',
      genre: compact.g || 'pop',
      notes,
      bpm: compact.b || 120,
      keySignature: compact.k || 'C major',
      timeSignature: compact.t || '4/4',
      createdAt: Date.now(),
      instrument: (INSTRUMENTS.find((i) => i.id === compact.i)?.id ?? 'piano') as MuInstrumentId,
    }

    if (_state!.songLibrary.length >= 20) return null

    _state!.songLibrary.push(song)
    return song
  } catch {
    return null
  }
}

// ─── Stats Functions ─────────────────────────────────────────────────────────

export function muGetStats(): MuStats {
  ensureInit()
  return { ..._state!.stats }
}

export function muGetStatsSummary(): {
  label: string
  value: string | number
  emoji: string
}[] {
  ensureInit()
  const s = _state!.stats
  return [
    { label: 'Songs Composed', value: s.songsComposed, emoji: '🎵' },
    { label: 'Total Notes', value: s.totalNotesPlayed, emoji: '🎹' },
    { label: 'Favorite Genre', value: s.favoriteGenre || 'None yet', emoji: '🌟' },
    { label: 'Practice Time', value: `${Math.floor(s.practiceTimeSeconds / 60)}m`, emoji: '⏱️' },
    { label: 'Achievements', value: `${s.achievementsUnlocked}/${ACHIEVEMENT_DEFS.length}`, emoji: '🏆' },
    { label: 'Daily Streak', value: s.dailyStreak, emoji: '📅' },
    { label: 'Longest Song', value: `${s.longestComposition} notes`, emoji: '📜' },
    { label: 'Top Instrument', value: INSTRUMENTS.find((i) => i.id === s.mostUsedInstrument)?.name ?? 'Piano', emoji: '🎸' },
  ]
}

// ─── UI Helper Functions ─────────────────────────────────────────────────────

export function muGetOverview(): {
  instruments: MuInstrument[]
  currentInstrument: MuInstrument
  composition: MuCompositionNote[]
  compositionLength: number
  maxComposition: number
  songCount: number
  maxSongs: number
  bpm: number
  keySignature: string
  timeSignature: string
  genre: MuGenre | null
  isPlaying: boolean
  isRecording: boolean
  metronomeOn: boolean
  stats: MuStats
  dailyCompleted: boolean
} {
  ensureInit()
  const s = _state!
  return {
    instruments: muGetInstruments(),
    currentInstrument: INSTRUMENTS.find((i) => i.id === s.selectedInstrument) ?? INSTRUMENTS[0],
    composition: [...s.composition],
    compositionLength: s.composition.length,
    maxComposition: 32,
    songCount: s.songLibrary.length,
    maxSongs: 20,
    bpm: s.bpm,
    keySignature: s.keySignature,
    timeSignature: s.timeSignature,
    genre: GENRES.find((g) => g.id === s.selectedGenre) ?? null,
    isPlaying: s.playback.isPlaying,
    isRecording: s.recording.isRecording,
    metronomeOn: s.metronome.enabled,
    stats: { ...s.stats },
    dailyCompleted: s.dailyChallenge.completed,
  }
}

export function muGetStatsGrid(): {
  label: string
  value: string | number
  emoji: string
  color: string
}[] {
  ensureInit()
  const s = _state!.stats
  return [
    { label: 'Songs Composed', value: s.songsComposed, emoji: '🎵', color: '#4A90D9' },
    { label: 'Total Notes', value: s.totalNotesPlayed, emoji: '🎹', color: '#E67E22' },
    { label: 'Favorite Genre', value: s.favoriteGenre || '—', emoji: '🌟', color: '#9B59B6' },
    { label: 'Practice', value: formatTime(s.practiceTimeSeconds), emoji: '⏱️', color: '#1ABC9C' },
    { label: 'Achievements', value: `${s.achievementsUnlocked}/${ACHIEVEMENT_DEFS.length}`, emoji: '🏆', color: '#F39C12' },
    { label: 'Daily Streak', value: s.dailyStreak, emoji: '📅', color: '#E74C3C' },
  ]
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const sec = seconds % 60
  if (m < 60) return `${m}m ${sec}s`
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${h}h ${min}m`
}

export function muGetInstrumentGrid(): Array<{
  id: MuInstrumentId
  name: string
  emoji: string
  color: string
  description: string
  isActive: boolean
}> {
  ensureInit()
  const s = _state!
  return INSTRUMENTS.map((inst) => ({
    id: inst.id,
    name: inst.name,
    emoji: inst.emoji,
    color: inst.color,
    description: inst.description,
    isActive: s.selectedInstrument === inst.id,
  }))
}

export function muGetNoteGridUI(): {
  notes: Array<{
    name: string
    frequency: number
    isBlack: boolean
    octave: number
    label: string
    isInKey: boolean
    isHighlighted: boolean
  }>
  keySignature: string
  octaveRange: [number, number]
} {
  ensureInit()
  const s = _state!
  const scale = parseKeyScale(s.keySignature)
  const playbackNote = muGetCurrentPlaybackNote().note

  return {
    notes: ALL_NOTES.map((note) => ({
      ...note,
      isInKey: scale.includes(note.label),
      isHighlighted: playbackNote?.name === note.name,
    })),
    keySignature: s.keySignature,
    octaveRange: [3, 5],
  }
}

export function muGetSongCard(songId: string): {
  id: string
  name: string
  genre: string
  noteCount: number
  bpm: number
  key: string
  time: string
  instrument: MuInstrument
  createdAt: number
  canPlay: boolean
} | null {
  ensureInit()
  const song = _state!.songLibrary.find((sg) => sg.id === songId)
  if (!song) return null
  const inst = INSTRUMENTS.find((i) => i.id === song.instrument) ?? INSTRUMENTS[0]
  return {
    id: song.id,
    name: song.name,
    genre: song.genre,
    noteCount: song.notes.length,
    bpm: song.bpm,
    key: song.keySignature,
    time: song.timeSignature,
    instrument: inst,
    createdAt: song.createdAt,
    canPlay: song.notes.length > 0,
  }
}

export function muGetSongCards(): Array<{
  id: string
  name: string
  genre: string
  genreEmoji: string
  genreColor: string
  noteCount: number
  bpm: number
  instrumentEmoji: string
  createdAt: number
}> {
  ensureInit()
  return _state!.songLibrary.map((song) => {
    const genre = GENRES.find((g) => g.id === song.genre)
    const inst = INSTRUMENTS.find((i) => i.id === song.instrument)
    return {
      id: song.id,
      name: song.name,
      genre: song.genre,
      genreEmoji: genre?.emoji ?? '🎵',
      genreColor: genre?.color ?? '#888',
      noteCount: song.notes.length,
      bpm: song.bpm,
      instrumentEmoji: inst?.emoji ?? '🎹',
      createdAt: song.createdAt,
    }
  })
}

export function muGetGenreGrid(): Array<{
  id: string
  name: string
  emoji: string
  color: string
  description: string
  defaultBpm: number
  isActive: boolean
  songCount: number
}> {
  ensureInit()
  const s = _state!
  return GENRES.map((genre) => ({
    id: genre.id,
    name: genre.name,
    emoji: genre.emoji,
    color: genre.color,
    description: genre.description,
    defaultBpm: genre.defaultBpm,
    isActive: s.selectedGenre === genre.id,
    songCount: s.songLibrary.filter((sg) => sg.genre === genre.id).length,
  }))
}

export function muGetChordGrid(): Array<{
  root: string
  type: string
  name: string
  notes: string[]
  chordTypeColor: string
}> {
  ensureInit()
  const commonRoots = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']
  const colorMap: Record<string, string> = {
    Major: '#4A90D9',
    Minor: '#8E44AD',
    Seventh: '#E67E22',
    Diminished: '#E74C3C',
  }

  const grid: Array<{ root: string; type: string; name: string; notes: string[]; chordTypeColor: string }> = []
  for (const root of commonRoots) {
    for (const ct of CHORD_TYPES) {
      const chord = muBuildChord(root, ct.id)
      if (chord) {
        grid.push({
          root: chord.root,
          type: chord.type,
          name: chord.name,
          notes: chord.notes,
          chordTypeColor: colorMap[ct.name] ?? '#888',
        })
      }
    }
  }
  return grid
}

export function muGetRhythmGrid(): Array<{
  id: string
  name: string
  emoji: string
  pattern: number[]
  beatsPerMeasure: number
  description: string
  isActive: boolean
}> {
  ensureInit()
  const s = _state!
  const currentBeats = parseInt(s.timeSignature.split('/')[0]) || 4
  return RHYTHM_PATTERNS.map((rp) => ({
    id: rp.id,
    name: rp.name,
    emoji: rp.emoji,
    pattern: [...rp.pattern],
    beatsPerMeasure: rp.beatsPerMeasure,
    description: rp.description,
    isActive: rp.beatsPerMeasure === currentBeats,
  }))
}

export function muGetAchievementGrid(): Array<{
  id: string
  name: string
  emoji: string
  description: string
  unlocked: boolean
  unlockedAt: number | null
  category: string
  progress: number
  target: number
}> {
  ensureInit()
  const s = _state!
  return s.achievements.map((ach) => {
    let progress = 0
    switch (ach.id) {
      case 'first_song':
      case 'composer_5':
      case 'composer_10':
      case 'composer_20':
        progress = s.stats.songsComposed
        break
      case 'genre_master': {
        const genres = new Set(s.songLibrary.map((sg) => sg.genre))
        progress = genres.size
        break
      }
      case 'chord_builder':
      case 'note_100':
      case 'note_500':
      case 'note_1000':
        progress = s.stats.totalNotesPlayed
        break
      case 'daily_3':
      case 'daily_7':
        progress = s.stats.dailyStreak
        break
      case 'long_composition':
        progress = s.stats.longestComposition
        break
      case 'multi_instrument': {
        const insts = new Set(s.songLibrary.map((sg) => sg.instrument))
        progress = insts.size
        break
      }
      case 'practice_30m':
        progress = s.stats.practiceTimeSeconds
        break
      case 'sharer':
        progress = ach.unlockedAt !== null ? 1 : 0
        break
    }

    return {
      id: ach.id,
      name: ach.name,
      emoji: ach.emoji,
      description: ach.description,
      unlocked: ach.unlockedAt !== null,
      unlockedAt: ach.unlockedAt,
      category: ach.category,
      progress: Math.min(progress, ach.target),
      target: ach.target,
    }
  })
}

export function muGetDailyCard(): {
  date: string
  keySignature: string
  bpm: number
  timeSignature: string
  genre: MuGenre | null
  hint: string
  bonusDescription: string
  completed: boolean
  streak: number
  scaleNotes: string[]
  compositionProgress: number
} {
  ensureInit()
  const s = _state!
  if (s.dailyChallenge.date !== todayString()) {
    muInit()
  }
  const dc = _state!.dailyChallenge
  const genre = GENRES.find((g) => g.id === dc.genreId)
  const scaleNotes = muGetScaleNotes(dc.keySignature, 4)

  return {
    date: dc.date || todayString(),
    keySignature: dc.keySignature,
    bpm: dc.bpm,
    timeSignature: dc.timeSignature,
    genre: genre ?? null,
    hint: dc.hint,
    bonusDescription: dc.bonusDescription,
    completed: dc.completed,
    streak: s.stats.dailyStreak,
    scaleNotes,
    compositionProgress: s.composition.length,
  }
}

// ─── Composition Utility Functions ───────────────────────────────────────────

export function muInsertNote(noteName: string, index: number): MuCompositionNote | null {
  ensureInit()
  const s = _state!
  if (s.composition.length >= 32) return null
  if (index < 0 || index > s.composition.length) return null

  const noteData = ALL_NOTES.find((n) => n.name === noteName)
  if (!noteData) return null

  const compNote: MuCompositionNote = {
    name: noteData.name,
    frequency: noteData.frequency,
    index,
  }

  s.composition.splice(index, 0, compNote)
  // Re-index
  for (let i = 0; i < s.composition.length; i++) {
    s.composition[i].index = i
  }
  s.stats.totalNotesPlayed++
  return compNote
}

export function muRemoveNote(index: number): boolean {
  ensureInit()
  const s = _state!
  if (index < 0 || index >= s.composition.length) return false
  s.composition.splice(index, 1)
  for (let i = 0; i < s.composition.length; i++) {
    s.composition[i].index = i
  }
  return true
}

export function muDuplicateComposition(): MuCompositionNote[] | null {
  ensureInit()
  const s = _state!
  if (s.composition.length === 0) return null
  if (s.composition.length * 2 > 32) return null

  const original = [...s.composition]
  for (const note of original) {
    if (s.composition.length >= 32) break
    s.composition.push({ ...note, index: s.composition.length })
  }
  return [...s.composition]
}

export function muReverseComposition(): MuCompositionNote[] {
  ensureInit()
  const s = _state!
  s.composition.reverse()
  for (let i = 0; i < s.composition.length; i++) {
    s.composition[i].index = i
  }
  return [...s.composition]
}

export function muTransposeComposition(semitones: number): MuCompositionNote[] | null {
  ensureInit()
  const s = _state!
  if (s.composition.length === 0) return null

  const transposed: MuCompositionNote[] = []
  for (const note of s.composition) {
    const idx = ALL_NOTES.findIndex((n) => n.name === note.name)
    if (idx < 0) return null
    const newIdx = idx + semitones
    if (newIdx < 0 || newIdx >= ALL_NOTES.length) return null

    const newNote = ALL_NOTES[newIdx]
    transposed.push({
      name: newNote.name,
      frequency: newNote.frequency,
      index: transposed.length,
    })
  }

  s.composition = transposed
  return [...s.composition]
}

export function muGetCompositionAsNoteNames(): string[] {
  ensureInit()
  return _state!.composition.map((n) => n.name)
}

export function muLoadNotesFromNames(names: string[]): boolean {
  ensureInit()
  if (names.length > 32) return false

  const s = _state!
  s.composition = []

  for (const name of names) {
    const noteData = ALL_NOTES.find((n) => n.name === name)
    if (!noteData) continue
    s.composition.push({
      name: noteData.name,
      frequency: noteData.frequency,
      index: s.composition.length,
    })
  }

  return s.composition.length > 0
}

// ─── Advanced Chord Functions ────────────────────────────────────────────────

export function muGetChordProgression(key: string, type: string): MuChord[] {
  ensureInit()
  const scale = parseKeyScale(key)
  if (scale.length === 0) return []

  const progressionMap: Record<string, number[]> = {
    'pop': [0, 4, 5, 3],
    'classical': [0, 3, 4, 0],
    'jazz': [0, 2, 4, 6],
    'rock': [0, 3, 4, 4],
  }

  const indices = progressionMap[type] ?? [0, 3, 4, 0]
  const chords: MuChord[] = []

  for (const idx of indices) {
    const rootName = scale[idx % scale.length]
    if (!rootName) continue

    // Determine chord type from scale degree
    const degree = idx % 7
    let ctId = 'major'
    if (degree === 1 || degree === 2 || degree === 5) ctId = 'minor'
    if (degree === 6) ctId = 'diminished'

    const root = ALL_NOTES.find((n) => n.name === `${rootName}4`)
    if (root) {
      const chord = muBuildChord(root.name, ctId)
      if (chord) chords.push(chord)
    }
  }

  return chords
}

// ─── Exported Constants ──────────────────────────────────────────────────────

export const MU_MAX_COMPOSITION_LENGTH = 32
export const MU_MAX_SONGS = 20
export const MU_MIN_BPM = 40
export const MU_MAX_BPM = 300
export const MU_NOTE_COUNT = ALL_NOTES.length
export const MU_OCTAVE_MIN = 3
export const MU_OCTAVE_MAX = 5
export const MU_INSTRUMENT_COUNT = INSTRUMENTS.length
export const MU_GENRE_COUNT = GENRES.length
export const MU_RHYTHM_COUNT = RHYTHM_PATTERNS.length
export const MU_ACHIEVEMENT_COUNT = ACHIEVEMENT_DEFS.length
export const MU_CHORD_TYPE_COUNT = CHORD_TYPES.length
