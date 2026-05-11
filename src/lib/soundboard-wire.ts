// =============================================================================
// Musical Soundboard Wire — Word Snake Game
// =============================================================================
// Provides virtual instruments, note playing via Web Audio API, melody
// recording / playback, a preset library, game sound-effects, beat patterns,
// a full mixer, and melody sharing — all persisted to localStorage.
// =============================================================================

// ─── Storage Key ─────────────────────────────────────────────────────────────
const STORAGE_KEY = 'ws_soundboard_wire';

// ─── Type Exports ────────────────────────────────────────────────────────────

export type OscillatorType = 'sine' | 'square' | 'triangle' | 'sawtooth';

export interface Instrument {
  id: string;
  name: string;
  emoji: string;
  waveform: OscillatorType;
  octaveRange: [number, number];
  volume: number;
  color: string;
  description: string;
}

export interface NoteEvent {
  note: string;          // e.g. 'C4', 'F#5'
  frequency: number;
  timestamp: number;     // ms offset from start of recording
  duration: number;      // ms
  instrument: string;
}

export interface Melody {
  id: string;
  name: string;
  notes: NoteEvent[];
  createdAt: number;
  updatedAt: number;
  isPreset: boolean;
  playCount: number;
  totalPlayTime: number; // cumulative ms
}

export interface SoundEffect {
  id: string;
  name: string;
  emoji: string;
  category: string;
  waveform: OscillatorType;
  frequencyStart: number;
  frequencyEnd: number;
  duration: number;
  description: string;
}

export interface BeatHit {
  note: string;
  frequency: number;
  time: number; // offset in ms from beat start
  duration: number;
  instrument: string;
}

export interface BeatPattern {
  id: string;
  name: string;
  emoji: string;
  bpm: number;
  timeSignature: string;
  hits: BeatHit[];
  totalDuration: number; // ms for one full loop
  description: string;
}

export interface SoundBoardState {
  initialized: boolean;
  currentInstrument: string;
  mixer: Record<string, number>;
  masterVolume: number;
  tempo: number;
  savedMelodies: Melody[];
  recentMelodyIds: string[];
  totalNotesPlayed: number;
  totalPlayTime: number;
  favoriteInstrument: string;
  instrumentPlayCounts: Record<string, number>;
  lastAccessed: number;
}

// ─── Note Frequencies (C3 – B5, three octaves) ──────────────────────────────

export const NOTE_FREQUENCIES: Record<string, number> = {
  C3: 130.81, 'C#3': 138.59, D3: 146.83, 'D#3': 155.56, E3: 164.81,
  F3: 174.61, 'F#3': 185.00, G3: 196.00, 'G#3': 207.65, A3: 220.00,
  'A#3': 233.08, B3: 246.94,
  C4: 261.63, 'C#4': 277.18, D4: 293.66, 'D#4': 311.13, E4: 329.63,
  F4: 349.23, 'F#4': 369.99, G4: 392.00, 'G#4': 415.30, A4: 440.00,
  'A#4': 466.16, B4: 493.88,
  C5: 523.25, 'C#5': 554.37, D5: 587.33, 'D#5': 622.25, E5: 659.25,
  F5: 698.46, 'F#5': 739.99, G5: 783.99, 'G#5': 830.61, A5: 880.00,
  'A#5': 932.33, B5: 987.77,
};

// ─── Instrument Definitions ──────────────────────────────────────────────────

const INSTRUMENTS: Instrument[] = [
  {
    id: 'piano', name: 'Piano', emoji: '🎹', waveform: 'sine',
    octaveRange: [3, 5], volume: 0.8, color: '#4a90d9',
    description: 'Classic sine-wave piano sound',
  },
  {
    id: 'guitar', name: 'Guitar', emoji: '🎸', waveform: 'triangle',
    octaveRange: [3, 5], volume: 0.75, color: '#e67e22',
    description: 'Warm triangle-wave guitar tone',
  },
  {
    id: 'drums', name: 'Drums', emoji: '🥁', waveform: 'square',
    octaveRange: [3, 4], volume: 0.9, color: '#e74c3c',
    description: 'Percussive square-wave drum sounds',
  },
  {
    id: 'synth', name: 'Synth', emoji: '🎛️', waveform: 'sawtooth',
    octaveRange: [3, 5], volume: 0.7, color: '#9b59b6',
    description: 'Buzzy sawtooth synthesizer',
  },
  {
    id: 'flute', name: 'Flute', emoji: '🪈', waveform: 'sine',
    octaveRange: [4, 5], volume: 0.65, color: '#2ecc71',
    description: 'Pure sine flute — airy and light',
  },
  {
    id: 'xylophone', name: 'Xylophone', emoji: '🎵', waveform: 'triangle',
    octaveRange: [4, 5], volume: 0.85, color: '#f1c40f',
    description: 'Bright percussive bell-like tones',
  },
];

// ─── Sound Effect Definitions (20 effects) ───────────────────────────────────

const SOUND_EFFECTS: SoundEffect[] = [
  { id: 'sfx_powerup', name: 'Power-Up', emoji: '⚡', category: 'gameplay', waveform: 'square', frequencyStart: 300, frequencyEnd: 900, duration: 300, description: 'Collected a power-up item' },
  { id: 'sfx_combo', name: 'Combo Hit', emoji: '🔥', category: 'gameplay', waveform: 'sawtooth', frequencyStart: 400, frequencyEnd: 1200, duration: 200, description: 'Multi-word combo achieved' },
  { id: 'sfx_achievement', name: 'Achievement', emoji: '🏆', category: 'reward', waveform: 'sine', frequencyStart: 523, frequencyEnd: 1047, duration: 500, description: 'Achievement unlocked fanfare' },
  { id: 'sfx_death', name: 'Death', emoji: '💀', category: 'gameplay', waveform: 'sawtooth', frequencyStart: 400, frequencyEnd: 80, duration: 600, description: 'Snake died — descending tone' },
  { id: 'sfx_coin', name: 'Coin Collect', emoji: '🪙', category: 'reward', waveform: 'square', frequencyStart: 800, frequencyEnd: 1600, duration: 150, description: 'Coin collected ping' },
  { id: 'sfx_levelup', name: 'Level Up', emoji: '⬆️', category: 'reward', waveform: 'sine', frequencyStart: 440, frequencyEnd: 880, duration: 400, description: 'Level completed ascending arpeggio' },
  { id: 'sfx_miss', name: 'Miss', emoji: '❌', category: 'gameplay', waveform: 'square', frequencyStart: 200, frequencyEnd: 100, duration: 250, description: 'Wrong move buzzer' },
  { id: 'sfx_portal', name: 'Portal', emoji: '🌀', category: 'gameplay', waveform: 'sine', frequencyStart: 300, frequencyEnd: 1500, duration: 350, description: 'Entered a portal' },
  { id: 'sfx_shield', name: 'Shield', emoji: '🛡️', category: 'powerup', waveform: 'triangle', frequencyStart: 600, frequencyEnd: 600, duration: 300, description: 'Shield activated hum' },
  { id: 'sfx_freeze', name: 'Freeze', emoji: '🧊', category: 'powerup', waveform: 'sine', frequencyStart: 1200, frequencyEnd: 200, duration: 500, description: 'Freeze effect crystallize' },
  { id: 'sfx_speed', name: 'Speed Boost', emoji: '💨', category: 'powerup', waveform: 'sawtooth', frequencyStart: 200, frequencyEnd: 1400, duration: 250, description: 'Speed boost whoosh' },
  { id: 'sfx_bomb', name: 'Bomb', emoji: '💣', category: 'gameplay', waveform: 'sawtooth', frequencyStart: 150, frequencyEnd: 40, duration: 500, description: 'Explosion low rumble' },
  { id: 'sfx_star', name: 'Star', emoji: '⭐', category: 'reward', waveform: 'sine', frequencyStart: 800, frequencyEnd: 1200, duration: 300, description: 'Star collected sparkle' },
  { id: 'sfx_warning', name: 'Warning', emoji: '⚠️', category: 'gameplay', waveform: 'square', frequencyStart: 440, frequencyEnd: 440, duration: 200, description: 'Low-health warning beep' },
  { id: 'sfx_victory', name: 'Victory', emoji: '🎉', category: 'reward', waveform: 'sine', frequencyStart: 523, frequencyEnd: 1047, duration: 800, description: 'Round won triumphant chord' },
  { id: 'sfx_click', name: 'UI Click', emoji: '👆', category: 'ui', waveform: 'sine', frequencyStart: 1000, frequencyEnd: 800, duration: 50, description: 'Button / tap click' },
  { id: 'sfx_hover', name: 'UI Hover', emoji: '✨', category: 'ui', waveform: 'sine', frequencyStart: 600, frequencyEnd: 700, duration: 60, description: 'Subtle hover feedback' },
  { id: 'sfx_toggle', name: 'Toggle', emoji: '🔄', category: 'ui', waveform: 'triangle', frequencyStart: 500, frequencyEnd: 700, duration: 80, description: 'Switch / toggle click' },
  { id: 'sfx_magnet', name: 'Magnet', emoji: '🧲', category: 'powerup', waveform: 'triangle', frequencyStart: 200, frequencyEnd: 800, duration: 400, description: 'Magnet power-up attract' },
  { id: 'sfx_ghost', name: 'Ghost Mode', emoji: '👻', category: 'powerup', waveform: 'sine', frequencyStart: 300, frequencyEnd: 600, duration: 500, description: 'Ghost phase eerie tone' },
];

// ─── Beat Pattern Definitions (8 patterns) ───────────────────────────────────

const BEAT_PATTERNS: BeatPattern[] = [
  {
    id: 'rock_44', name: '4/4 Rock', emoji: '🪨', bpm: 120, timeSignature: '4/4',
    description: 'Classic four-on-the-floor rock beat',
    hits: [
      { note: 'C3', frequency: 130.81, time: 0, duration: 100, instrument: 'drums' },
      { note: 'C3', frequency: 130.81, time: 500, duration: 100, instrument: 'drums' },
      { note: 'G3', frequency: 196.00, time: 250, duration: 80, instrument: 'drums' },
      { note: 'G3', frequency: 196.00, time: 750, duration: 80, instrument: 'drums' },
      { note: 'E4', frequency: 329.63, time: 0, duration: 60, instrument: 'drums' },
      { note: 'E4', frequency: 329.63, time: 500, duration: 60, instrument: 'drums' },
    ],
    totalDuration: 1000,
  },
  {
    id: 'waltz_34', name: '3/4 Waltz', emoji: '💃', bpm: 90, timeSignature: '3/4',
    description: 'Elegant three-beat waltz pattern',
    hits: [
      { note: 'C3', frequency: 130.81, time: 0, duration: 150, instrument: 'drums' },
      { note: 'G3', frequency: 196.00, time: 333, duration: 80, instrument: 'drums' },
      { note: 'G3', frequency: 196.00, time: 666, duration: 80, instrument: 'drums' },
    ],
    totalDuration: 1000,
  },
  {
    id: 'funk', name: 'Funk Groove', emoji: '🎸', bpm: 110, timeSignature: '4/4',
    description: 'Syncopated funky rhythm',
    hits: [
      { note: 'C3', frequency: 130.81, time: 0, duration: 80, instrument: 'drums' },
      { note: 'C3', frequency: 130.81, time: 600, duration: 60, instrument: 'drums' },
      { note: 'G3', frequency: 196.00, time: 150, duration: 50, instrument: 'drums' },
      { note: 'G3', frequency: 196.00, time: 500, duration: 50, instrument: 'drums' },
      { note: 'G3', frequency: 196.00, time: 800, duration: 40, instrument: 'drums' },
      { note: 'E4', frequency: 329.63, time: 300, duration: 30, instrument: 'drums' },
      { note: 'E4', frequency: 329.63, time: 700, duration: 30, instrument: 'drums' },
    ],
    totalDuration: 1000,
  },
  {
    id: 'jazz', name: 'Jazz Swing', emoji: '🎷', bpm: 100, timeSignature: '4/4',
    description: 'Laid-back jazz swing feel',
    hits: [
      { note: 'C3', frequency: 130.81, time: 0, duration: 120, instrument: 'drums' },
      { note: 'C3', frequency: 130.81, time: 667, duration: 100, instrument: 'drums' },
      { note: 'G3', frequency: 196.00, time: 333, duration: 60, instrument: 'drums' },
      { note: 'G3', frequency: 196.00, time: 500, duration: 60, instrument: 'drums' },
      { note: 'E4', frequency: 329.63, time: 167, duration: 40, instrument: 'drums' },
    ],
    totalDuration: 1000,
  },
  {
    id: 'hiphop', name: 'Hip-Hop', emoji: '🎤', bpm: 85, timeSignature: '4/4',
    description: 'Boom-bap hip-hop drum pattern',
    hits: [
      { note: 'C3', frequency: 130.81, time: 0, duration: 150, instrument: 'drums' },
      { note: 'C3', frequency: 130.81, time: 500, duration: 100, instrument: 'drums' },
      { note: 'G3', frequency: 196.00, time: 250, duration: 80, instrument: 'drums' },
      { note: 'G3', frequency: 196.00, time: 750, duration: 60, instrument: 'drums' },
    ],
    totalDuration: 1000,
  },
  {
    id: 'edm', name: 'EDM Drop', emoji: '🔊', bpm: 128, timeSignature: '4/4',
    description: 'Electronic dance music four-on-the-floor',
    hits: [
      { note: 'C3', frequency: 130.81, time: 0, duration: 60, instrument: 'drums' },
      { note: 'C3', frequency: 130.81, time: 250, duration: 60, instrument: 'drums' },
      { note: 'C3', frequency: 130.81, time: 500, duration: 60, instrument: 'drums' },
      { note: 'C3', frequency: 130.81, time: 750, duration: 60, instrument: 'drums' },
      { note: 'G3', frequency: 196.00, time: 0, duration: 40, instrument: 'drums' },
      { note: 'G3', frequency: 196.00, time: 500, duration: 40, instrument: 'drums' },
      { note: 'E4', frequency: 329.63, time: 250, duration: 30, instrument: 'drums' },
      { note: 'E4', frequency: 329.63, time: 750, duration: 30, instrument: 'drums' },
    ],
    totalDuration: 1000,
  },
  {
    id: 'reggae', name: 'Reggae', emoji: '🌴', bpm: 80, timeSignature: '4/4',
    description: 'Off-beat reggae skank rhythm',
    hits: [
      { note: 'C3', frequency: 130.81, time: 0, duration: 80, instrument: 'drums' },
      { note: 'G3', frequency: 196.00, time: 500, duration: 60, instrument: 'drums' },
      { note: 'E4', frequency: 329.63, time: 250, duration: 40, instrument: 'drums' },
      { note: 'E4', frequency: 329.63, time: 750, duration: 40, instrument: 'drums' },
    ],
    totalDuration: 1000,
  },
  {
    id: 'latin', name: 'Latin Clave', emoji: '🥁', bpm: 100, timeSignature: '4/4',
    description: 'Son clave Latin rhythm pattern',
    hits: [
      { note: 'C3', frequency: 130.81, time: 0, duration: 80, instrument: 'drums' },
      { note: 'C3', frequency: 130.81, time: 375, duration: 60, instrument: 'drums' },
      { note: 'G3', frequency: 196.00, time: 500, duration: 80, instrument: 'drums' },
      { note: 'G3', frequency: 196.00, time: 875, duration: 60, instrument: 'drums' },
      { note: 'E4', frequency: 329.63, time: 250, duration: 50, instrument: 'drums' },
      { note: 'E4', frequency: 329.63, time: 750, duration: 50, instrument: 'drums' },
    ],
    totalDuration: 1000,
  },
];

// ─── Preset Melodies (10 melodies) ───────────────────────────────────────────

function makeNote(note: string, timestamp: number, duration: number, instrument = 'piano'): NoteEvent {
  return { note, frequency: NOTE_FREQUENCIES[note] ?? 440, timestamp, duration, instrument };
}

const PRESET_MELODIES: Melody[] = [
  {
    id: 'preset_twinkle', name: 'Twinkle Twinkle Little Star', isPreset: true,
    createdAt: 0, updatedAt: 0, playCount: 0, totalPlayTime: 0,
    notes: [
      makeNote('C4', 0, 400), makeNote('C4', 500, 400), makeNote('G4', 1000, 400),
      makeNote('G4', 1500, 400), makeNote('A4', 2000, 400), makeNote('A4', 2500, 400),
      makeNote('G4', 3000, 800), makeNote('F4', 4000, 400), makeNote('F4', 4500, 400),
      makeNote('E4', 5000, 400), makeNote('E4', 5500, 400), makeNote('D4', 6000, 400),
      makeNote('D4', 6500, 400), makeNote('C4', 7000, 800),
    ],
  },
  {
    id: 'preset_happy_birthday', name: 'Happy Birthday', isPreset: true,
    createdAt: 0, updatedAt: 0, playCount: 0, totalPlayTime: 0,
    notes: [
      makeNote('C4', 0, 250), makeNote('C4', 300, 150), makeNote('D4', 500, 500),
      makeNote('C4', 1050, 500), makeNote('F4', 1600, 500), makeNote('E4', 2150, 900),
      makeNote('C4', 3200, 250), makeNote('C4', 3500, 150), makeNote('D4', 3700, 500),
      makeNote('C4', 4250, 500), makeNote('G4', 4800, 500), makeNote('F4', 5350, 900),
    ],
  },
  {
    id: 'preset_ode_to_joy', name: 'Ode to Joy', isPreset: true,
    createdAt: 0, updatedAt: 0, playCount: 0, totalPlayTime: 0,
    notes: [
      makeNote('E4', 0, 400), makeNote('E4', 450, 400), makeNote('F4', 900, 400),
      makeNote('G4', 1350, 400), makeNote('G4', 1800, 400), makeNote('F4', 2250, 400),
      makeNote('E4', 2700, 400), makeNote('D4', 3150, 400), makeNote('C4', 3600, 400),
      makeNote('C4', 4050, 400), makeNote('D4', 4500, 400), makeNote('E4', 4950, 400),
      makeNote('E4', 5500, 350), makeNote('D4', 5900, 200), makeNote('D4', 6150, 600),
    ],
  },
  {
    id: 'preset_fur_elise', name: 'Für Elise', isPreset: true,
    createdAt: 0, updatedAt: 0, playCount: 0, totalPlayTime: 0,
    notes: [
      makeNote('E5', 0, 200), makeNote('D#5', 250, 200), makeNote('E5', 500, 200),
      makeNote('D#5', 750, 200), makeNote('E5', 1000, 200), makeNote('B4', 1250, 200),
      makeNote('D5', 1500, 200), makeNote('C5', 1750, 200), makeNote('A4', 2000, 400),
      makeNote('C4', 2500, 200), makeNote('E4', 2750, 200), makeNote('A4', 3000, 200),
      makeNote('B4', 3250, 400), makeNote('E4', 3750, 200), makeNote('G#4', 4000, 200),
      makeNote('B4', 4250, 200), makeNote('C5', 4500, 400),
    ],
  },
  {
    id: 'preset_mary_had_lamb', name: 'Mary Had a Little Lamb', isPreset: true,
    createdAt: 0, updatedAt: 0, playCount: 0, totalPlayTime: 0,
    notes: [
      makeNote('E4', 0, 400), makeNote('D4', 500, 400), makeNote('C4', 1000, 400),
      makeNote('D4', 1500, 400), makeNote('E4', 2000, 400), makeNote('E4', 2500, 400),
      makeNote('E4', 3000, 600), makeNote('D4', 3700, 400), makeNote('D4', 4200, 400),
      makeNote('D4', 4700, 600), makeNote('E4', 5400, 400), makeNote('G4', 5900, 400),
      makeNote('G4', 6400, 600),
    ],
  },
  {
    id: 'preset_jingle_bells', name: 'Jingle Bells', isPreset: true,
    createdAt: 0, updatedAt: 0, playCount: 0, totalPlayTime: 0,
    notes: [
      makeNote('E4', 0, 300), makeNote('E4', 350, 300), makeNote('E4', 700, 600),
      makeNote('E4', 1400, 300), makeNote('E4', 1750, 300), makeNote('E4', 2100, 600),
      makeNote('E4', 2800, 300), makeNote('G4', 3150, 300), makeNote('C4', 3500, 300),
      makeNote('D4', 3850, 300), makeNote('E4', 4200, 900),
    ],
  },
  {
    id: 'preset_scale', name: 'C Major Scale', isPreset: true,
    createdAt: 0, updatedAt: 0, playCount: 0, totalPlayTime: 0,
    notes: [
      makeNote('C4', 0, 300), makeNote('D4', 350, 300), makeNote('E4', 700, 300),
      makeNote('F4', 1050, 300), makeNote('G4', 1400, 300), makeNote('A4', 1750, 300),
      makeNote('B4', 2100, 300), makeNote('C5', 2450, 500),
    ],
  },
  {
    id: 'preset_canon', name: 'Canon in D (Snippet)', isPreset: true,
    createdAt: 0, updatedAt: 0, playCount: 0, totalPlayTime: 0,
    notes: [
      makeNote('F#4', 0, 500), makeNote('E4', 550, 500), makeNote('D4', 1100, 500),
      makeNote('C#4', 1650, 500), makeNote('B3', 2200, 500), makeNote('A3', 2750, 500),
      makeNote('B3', 3300, 500), makeNote('C#4', 3850, 500),
    ],
  },
  {
    id: 'preset_tetris', name: 'Tetris Theme', isPreset: true,
    createdAt: 0, updatedAt: 0, playCount: 0, totalPlayTime: 0,
    notes: [
      makeNote('E4', 0, 250), makeNote('B4', 280, 250), makeNote('C5', 560, 350),
      makeNote('D5', 940, 250), makeNote('C5', 1220, 250), makeNote('B4', 1500, 350),
      makeNote('A4', 1900, 350), makeNote('A4', 2290, 250), makeNote('C5', 2570, 250),
      makeNote('E4', 2850, 350), makeNote('D5', 3240, 250), makeNote('C5', 3520, 250),
      makeNote('B4', 3800, 400),
    ],
  },
  {
    id: 'preset_entertainer', name: 'The Entertainer', isPreset: true,
    createdAt: 0, updatedAt: 0, playCount: 0, totalPlayTime: 0,
    notes: [
      makeNote('D4', 0, 200), makeNote('D#4', 230, 100), makeNote('E4', 370, 200),
      makeNote('C4', 610, 200), makeNote('E4', 850, 200), makeNote('C4', 1090, 200),
      makeNote('E4', 1330, 200), makeNote('C4', 1570, 150), makeNote('D4', 1770, 150),
      makeNote('D4', 1970, 200), makeNote('D#4', 2200, 100), makeNote('E4', 2340, 200),
      makeNote('C4', 2580, 200), makeNote('E4', 2820, 200), makeNote('C4', 3060, 200),
      makeNote('E4', 3300, 200), makeNote('C4', 3540, 150), makeNote('D4', 3740, 150),
      makeNote('D4', 3940, 200), makeNote('D#4', 4170, 100), makeNote('E4', 4310, 200),
      makeNote('C4', 4550, 200), makeNote('E4', 4790, 200), makeNote('G4', 5030, 400),
    ],
  },
];

// ─── Internal State ──────────────────────────────────────────────────────────

let audioContext: AudioContext | null = null;
let activeOscillators: OscillatorNode[] = [];
let activeGainNodes: GainNode[] = [];
let recordingStartTime: number = 0;
let recordingNotes: NoteEvent[] = [];
let isRecording: boolean = false;
let beatTimers: ReturnType<typeof setTimeout>[] = [];
let playbackTimers: ReturnType<typeof setTimeout>[] = [];

// ─── Storage Helpers ─────────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof globalThis.window !== 'undefined';
}

function loadState(): SoundBoardState {
  if (!isBrowser()) {
    return createDefaultState();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SoundBoardState;
      return { ...createDefaultState(), ...parsed };
    }
  } catch {
    // corrupted data — reset
  }
  return createDefaultState();
}

function saveState(state: SoundBoardState): void {
  if (!isBrowser()) return;
  try {
    state.lastAccessed = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full — silently ignore
  }
}

function createDefaultState(): SoundBoardState {
  const mixer: Record<string, number> = {};
  for (const inst of INSTRUMENTS) {
    mixer[inst.id] = inst.volume;
  }
  return {
    initialized: false,
    currentInstrument: 'piano',
    mixer,
    masterVolume: 0.8,
    tempo: 120,
    savedMelodies: [],
    recentMelodyIds: [],
    totalNotesPlayed: 0,
    totalPlayTime: 0,
    favoriteInstrument: 'piano',
    instrumentPlayCounts: {},
    lastAccessed: Date.now(),
  };
}

function generateId(): string {
  return 'mel_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function getInstrumentById(id: string): Instrument | undefined {
  return INSTRUMENTS.find((i) => i.id === id);
}

// ─── Audio Context Management ────────────────────────────────────────────────

function ensureAudioContext(): AudioContext | null {
  if (!isBrowser()) return null;
  if (!audioContext || audioContext.state === 'closed') {
    try {
      audioContext = new (window.AudioContext || (window as unknown as Record<string, typeof AudioContext>).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

function computeVolume(instrumentId: string, state: SoundBoardState): number {
  const channelVol = state.mixer[instrumentId] ?? 0.8;
  return channelVol * state.masterVolume;
}

function createOscillator(
  ctx: AudioContext,
  frequency: number,
  waveform: OscillatorType,
  durationMs: number,
  volume: number,
): { osc: OscillatorNode; gain: GainNode } {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = waveform;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  // Simple ADSR envelope for smoother sound
  const attackTime = 0.01;
  const decayTime = 0.05;
  const sustainLevel = volume * 0.7;
  const releaseTime = Math.min(0.1, durationMs / 1000 * 0.3);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + attackTime);
  gain.gain.linearRampToValueAtTime(sustainLevel, ctx.currentTime + attackTime + decayTime);
  gain.gain.setValueAtTime(sustainLevel, ctx.currentTime + (durationMs / 1000) - releaseTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + durationMs / 1000);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + durationMs / 1000 + 0.05);
  osc.onended = () => {
    const oi = activeOscillators.indexOf(osc);
    if (oi >= 0) activeOscillators.splice(oi, 1);
    const gi = activeGainNodes.indexOf(gain);
    if (gi >= 0) activeGainNodes.splice(gi, 1);
  };
  activeOscillators.push(osc);
  activeGainNodes.push(gain);
  return { osc, gain };
}

// ─── Exported Functions ──────────────────────────────────────────────────────

export function initSoundBoard(): SoundBoardState {
  const state = loadState();
  state.initialized = true;
  // Ensure all instrument channels exist
  for (const inst of INSTRUMENTS) {
    if (state.mixer[inst.id] === undefined) {
      state.mixer[inst.id] = inst.volume;
    }
    if (!state.instrumentPlayCounts[inst.id]) {
      state.instrumentPlayCounts[inst.id] = 0;
    }
  }
  saveState(state);
  return state;
}

export function playNote(
  instrument: string,
  note: string,
  duration: number = 300,
): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;

  const inst = getInstrumentById(instrument);
  if (!inst) return;

  const frequency = NOTE_FREQUENCIES[note];
  if (!frequency) return;

  const state = loadState();
  const volume = computeVolume(instrument, state);
  if (volume <= 0) return;

  createOscillator(ctx, frequency, inst.waveform, duration, volume);

  // Track stats
  state.totalNotesPlayed++;
  state.instrumentPlayCounts[instrument] = (state.instrumentPlayCounts[instrument] || 0) + 1;
  // Update favorite instrument
  let maxCount = 0;
  for (const [id, count] of Object.entries(state.instrumentPlayCounts)) {
    if (count > maxCount) {
      maxCount = count;
      state.favoriteInstrument = id;
    }
  }
  state.totalPlayTime += duration;
  saveState(state);

  // If recording, capture the note
  if (isRecording) {
    const elapsed = Date.now() - recordingStartTime;
    recordingNotes.push({
      note,
      frequency,
      timestamp: elapsed,
      duration,
      instrument,
    });
  }
}

export function getAvailableInstruments(): Instrument[] {
  return INSTRUMENTS.map((inst) => {
    const state = loadState();
    return { ...inst, volume: state.mixer[inst.id] ?? inst.volume };
  });
}

export function getCurrentInstrument(): Instrument {
  const state = loadState();
  const inst = getInstrumentById(state.currentInstrument) ?? INSTRUMENTS[0];
  return { ...inst, volume: state.mixer[inst.id] ?? inst.volume };
}

export function selectInstrument(id: string): Instrument {
  const state = loadState();
  const inst = getInstrumentById(id);
  if (!inst) {
    return getCurrentInstrument();
  }
  state.currentInstrument = id;
  saveState(state);
  return { ...inst, volume: state.mixer[id] ?? inst.volume };
}

export function startRecording(): boolean {
  if (isRecording) return false;
  const ctx = ensureAudioContext();
  if (!ctx) return false;
  recordingStartTime = Date.now();
  recordingNotes = [];
  isRecording = true;
  return true;
}

export function stopRecording(): Melody | null {
  if (!isRecording) return null;
  isRecording = false;
  if (recordingNotes.length === 0) return null;
  const melody: Melody = {
    id: generateId(),
    name: 'Untitled Recording',
    notes: [...recordingNotes],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isPreset: false,
    playCount: 0,
    totalPlayTime: 0,
  };
  recordingNotes = [];
  return melody;
}

export function playRecording(melody: Melody): void {
  if (!melody.notes || melody.notes.length === 0) return;
  stopAllSounds();
  const ctx = ensureAudioContext();
  if (!ctx) return;

  const state = loadState();
  const maxTime = Math.max(...melody.notes.map((n) => n.timestamp + n.duration));
  const scaledDuration = (maxTime * 120) / state.tempo;

  for (const noteEvt of melody.notes) {
    const scaledTimestamp = (noteEvt.timestamp * 120) / state.tempo;
    const scaledNoteDuration = (noteEvt.duration * 120) / state.tempo;
    const timer = setTimeout(() => {
      const inst = getInstrumentById(noteEvt.instrument) ?? INSTRUMENTS[0];
      const volume = computeVolume(inst.id, state);
      if (volume > 0) {
        createOscillator(ctx, noteEvt.frequency, inst.waveform, scaledNoteDuration, volume);
      }
    }, scaledTimestamp);
    playbackTimers.push(timer);
  }

  // Update stats
  if (!melody.isPreset) {
    melody.playCount++;
    melody.totalPlayTime += scaledDuration;
    const idx = state.savedMelodies.findIndex((m) => m.id === melody.id);
    if (idx >= 0) {
      state.savedMelodies[idx] = melody;
      // Add to recents
      state.recentMelodyIds = [
        melody.id,
        ...state.recentMelodyIds.filter((id) => id !== melody.id),
      ].slice(0, 20);
      saveState(state);
    }
  }
}

export function saveMelody(name: string, melody: Melody): Melody {
  const state = loadState();
  const now = Date.now();
  const saved: Melody = {
    ...melody,
    id: melody.id || generateId(),
    name,
    createdAt: melody.createdAt || now,
    updatedAt: now,
    isPreset: false,
    playCount: melody.playCount || 0,
    totalPlayTime: melody.totalPlayTime || 0,
  };
  const existingIdx = state.savedMelodies.findIndex((m) => m.id === saved.id);
  if (existingIdx >= 0) {
    state.savedMelodies[existingIdx] = saved;
  } else {
    state.savedMelodies.push(saved);
  }
  state.recentMelodyIds = [
    saved.id,
    ...state.recentMelodyIds.filter((id) => id !== saved.id),
  ].slice(0, 20);
  saveState(state);
  return saved;
}

export function deleteMelody(id: string): boolean {
  const state = loadState();
  const idx = state.savedMelodies.findIndex((m) => m.id === id);
  if (idx < 0) return false;
  state.savedMelodies.splice(idx, 1);
  state.recentMelodyIds = state.recentMelodyIds.filter((mid) => mid !== id);
  saveState(state);
  return true;
}

export function getMelodyLibrary(): Melody[] {
  const state = loadState();
  return [...PRESET_MELODIES, ...state.savedMelodies];
}

export function getPresetMelodies(): Melody[] {
  return PRESET_MELODIES.map((m) => ({ ...m }));
}

export function getMelodyStats(): {
  totalSaved: number;
  totalPlayTime: number;
  favoriteInstrument: string;
  mostPlayedMelody: string;
  averageNotesPerMelody: number;
} {
  const state = loadState();
  const totalSaved = state.savedMelodies.length;
  let mostPlayedMelody = 'N/A';
  let maxPlays = 0;
  let totalNotes = 0;
  for (const melody of state.savedMelodies) {
    if (melody.playCount > maxPlays) {
      maxPlays = melody.playCount;
      mostPlayedMelody = melody.name;
    }
    totalNotes += melody.notes.length;
  }
  const averageNotesPerMelody = totalSaved > 0 ? Math.round(totalNotes / totalSaved) : 0;
  return {
    totalSaved,
    totalPlayTime: state.totalPlayTime,
    favoriteInstrument: state.favoriteInstrument,
    mostPlayedMelody,
    averageNotesPerMelody,
  };
}

export function playSoundEffect(effectId: string): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;

  const effect = SOUND_EFFECTS.find((e) => e.id === effectId);
  if (!effect) return;

  const state = loadState();
  const volume = state.masterVolume * 0.7;
  if (volume <= 0) return;

  const duration = effect.duration / 1000;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = effect.waveform;
  osc.frequency.setValueAtTime(effect.frequencyStart, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(effect.frequencyEnd, ctx.currentTime + duration);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration + 0.05);
  osc.onended = () => {
    const oi = activeOscillators.indexOf(osc);
    if (oi >= 0) activeOscillators.splice(oi, 1);
    const gi = activeGainNodes.indexOf(gain);
    if (gi >= 0) activeGainNodes.splice(gi, 1);
  };
  activeOscillators.push(osc);
  activeGainNodes.push(gain);
}

export function getSoundEffects(): SoundEffect[] {
  return SOUND_EFFECTS.map((e) => ({ ...e }));
}

export function getSoundBoardStats(): {
  totalNotesPlayed: number;
  totalPlayTime: number;
  favoriteInstrument: string;
  instrumentsPlayed: Record<string, number>;
  savedMelodyCount: number;
  totalSoundEffectsPlayed: number;
  lastAccessed: number;
} {
  const state = loadState();
  return {
    totalNotesPlayed: state.totalNotesPlayed,
    totalPlayTime: state.totalPlayTime,
    favoriteInstrument: state.favoriteInstrument,
    instrumentsPlayed: { ...state.instrumentPlayCounts },
    savedMelodyCount: state.savedMelodies.length,
    totalSoundEffectsPlayed: Object.values(state.instrumentPlayCounts).reduce((a, b) => a + b, 0),
    lastAccessed: state.lastAccessed,
  };
}

export function getMixerState(): Record<string, number> {
  const state = loadState();
  return { ...state.mixer, master: state.masterVolume };
}

export function setChannelVolume(channel: string, level: number): Record<string, number> {
  const clamped = Math.max(0, Math.min(1, level));
  const state = loadState();
  if (state.mixer[channel] !== undefined) {
    state.mixer[channel] = clamped;
    saveState(state);
  }
  return { ...state.mixer, master: state.masterVolume };
}

export function setMasterVolume(level: number): number {
  const clamped = Math.max(0, Math.min(1, level));
  const state = loadState();
  state.masterVolume = clamped;
  saveState(state);
  return clamped;
}

export function getTempo(): number {
  const state = loadState();
  return state.tempo;
}

export function setTempo(bpm: number): number {
  const clamped = Math.max(40, Math.min(300, bpm));
  const state = loadState();
  state.tempo = clamped;
  saveState(state);
  return clamped;
}

export function getBeatPatterns(): BeatPattern[] {
  return BEAT_PATTERNS.map((bp) => ({ ...bp, hits: bp.hits.map((h) => ({ ...h })) }));
}

export function playBeat(patternId: string): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;

  const pattern = BEAT_PATTERNS.find((bp) => bp.id === patternId);
  if (!pattern) return;

  stopBeat();
  const state = loadState();
  const tempoScale = 120 / pattern.bpm;
  const loopDuration = pattern.totalDuration * tempoScale;

  function scheduleLoop(): void {
    for (const hit of pattern.hits) {
      const scaledTime = hit.time * tempoScale;
      const scaledDuration = hit.duration * tempoScale;
      const timer = setTimeout(() => {
        const inst = getInstrumentById(hit.instrument) ?? INSTRUMENTS[0];
        const volume = computeVolume(inst.id, state);
        if (volume > 0) {
          createOscillator(ctx, hit.frequency, inst.waveform, scaledDuration, volume * 0.8);
        }
      }, scaledTime);
      beatTimers.push(timer);
    }
    const loopTimer = setTimeout(scheduleLoop, loopDuration);
    beatTimers.push(loopTimer);
  }

  scheduleLoop();
}

export function stopBeat(): void {
  for (const t of beatTimers) {
    clearTimeout(t);
  }
  beatTimers = [];
}

export function stopAllSounds(): void {
  stopBeat();
  for (const t of playbackTimers) {
    clearTimeout(t);
  }
  playbackTimers = [];
  for (const osc of activeOscillators) {
    try {
      osc.stop();
    } catch {
      // already stopped
    }
  }
  activeOscillators = [];
  activeGainNodes = [];
}

export function getRecentMelodies(count: number = 10): Melody[] {
  const state = loadState();
  const allMelodies = [...PRESET_MELODIES, ...state.savedMelodies];
  const recent: Melody[] = [];
  for (const id of state.recentMelodyIds.slice(0, count)) {
    const found = allMelodies.find((m) => m.id === id);
    if (found) recent.push(found);
  }
  return recent;
}

export function generateShareCode(melodyId: string): string | null {
  const state = loadState();
  const melody = state.savedMelodies.find((m) => m.id === melodyId);
  if (!melody) return null;

  const compact = {
    n: melody.name,
    notes: melody.notes.map((ne) => ({
      no: ne.note,
      t: ne.timestamp,
      d: ne.duration,
      i: ne.instrument,
    })),
    c: melody.createdAt,
  };

  try {
    const json = JSON.stringify(compact);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    return `WSMB:1:${encoded}`;
  } catch {
    return null;
  }
}

export function importMelody(code: string): Melody | null {
  if (!code.startsWith('WSMB:1:')) return null;
  const encoded = code.slice(7);
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    const compact = JSON.parse(json) as {
      n: string;
      notes: Array<{ no: string; t: number; d: number; i: string }>;
      c: number;
    };

    const notes: NoteEvent[] = compact.notes.map((ne) => ({
      note: ne.no,
      frequency: NOTE_FREQUENCIES[ne.no] ?? 440,
      timestamp: ne.t,
      duration: ne.d,
      instrument: ne.i,
    }));

    const melody: Melody = {
      id: generateId(),
      name: compact.n || 'Imported Melody',
      notes,
      createdAt: compact.c || Date.now(),
      updatedAt: Date.now(),
      isPreset: false,
      playCount: 0,
      totalPlayTime: 0,
    };

    const state = loadState();
    state.savedMelodies.push(melody);
    state.recentMelodyIds = [melody.id, ...state.recentMelodyIds.filter((id) => id !== melody.id)].slice(0, 20);
    saveState(state);

    return melody;
  } catch {
    return null;
  }
}

// ─── Panel / UI Data Functions ───────────────────────────────────────────────

export function getSoundBoardOverview(): {
  instruments: Instrument[];
  currentInstrument: Instrument;
  mixer: Record<string, number>;
  masterVolume: number;
  tempo: number;
  stats: ReturnType<typeof getSoundBoardStats>;
  recentMelodies: Melody[];
  presetCount: number;
  savedCount: number;
} {
  const state = loadState();
  return {
    instruments: getAvailableInstruments(),
    currentInstrument: getCurrentInstrument(),
    mixer: { ...state.mixer },
    masterVolume: state.masterVolume,
    tempo: state.tempo,
    stats: getSoundBoardStats(),
    recentMelodies: getRecentMelodies(5),
    presetCount: PRESET_MELODIES.length,
    savedCount: state.savedMelodies.length,
  };
}

export function getInstrumentGrid(): Array<{
  id: string;
  name: string;
  emoji: string;
  color: string;
  isActive: boolean;
  volume: number;
  description: string;
}> {
  const state = loadState();
  return INSTRUMENTS.map((inst) => ({
    id: inst.id,
    name: inst.name,
    emoji: inst.emoji,
    color: inst.color,
    isActive: state.currentInstrument === inst.id,
    volume: state.mixer[inst.id] ?? inst.volume,
    description: inst.description,
  }));
}

export function getPianoKeys(): Array<{
  note: string;
  frequency: number;
  isBlack: boolean;
  octave: number;
  label: string;
}> {
  const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackNotes: Record<string, boolean> = { C: true, D: true, F: true, G: true, A: true };
  const keys: Array<{
    note: string;
    frequency: number;
    isBlack: boolean;
    octave: number;
    label: string;
  }> = [];

  for (let octave = 3; octave <= 5; octave++) {
    for (const natural of whiteNotes) {
      const noteName = `${natural}${octave}`;
      const freq = NOTE_FREQUENCIES[noteName];
      if (freq) {
        keys.push({
          note: noteName,
          frequency: freq,
          isBlack: false,
          octave,
          label: natural,
        });
      }
      // Add the sharp if it exists
      if (blackNotes[natural]) {
        const sharpName = `${natural}#${octave}`;
        const sharpFreq = NOTE_FREQUENCIES[sharpName];
        if (sharpFreq) {
          keys.push({
            note: sharpName,
            frequency: sharpFreq,
            isBlack: true,
            octave,
            label: `${natural}#`,
          });
        }
      }
    }
  }
  return keys;
}

export function getEffectsGrid(): Array<{
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
}> {
  return SOUND_EFFECTS.map((e) => ({
    id: e.id,
    name: e.name,
    emoji: e.emoji,
    category: e.category,
    description: e.description,
  }));
}

export function getMelodyCard(melodyId: string): {
  id: string;
  name: string;
  noteCount: number;
  duration: number;
  isPreset: boolean;
  playCount: number;
  createdAt: number;
  updatedAt: number;
  instrumentBreakdown: Record<string, number>;
} | null {
  const allMelodies = getMelodyLibrary();
  const melody = allMelodies.find((m) => m.id === melodyId);
  if (!melody) return null;

  const instrumentBreakdown: Record<string, number> = {};
  for (const ne of melody.notes) {
    instrumentBreakdown[ne.instrument] = (instrumentBreakdown[ne.instrument] || 0) + 1;
  }
  const maxTimestamp = melody.notes.length > 0
    ? Math.max(...melody.notes.map((n) => n.timestamp + n.duration))
    : 0;

  return {
    id: melody.id,
    name: melody.name,
    noteCount: melody.notes.length,
    duration: maxTimestamp,
    isPreset: melody.isPreset,
    playCount: melody.playCount,
    createdAt: melody.createdAt,
    updatedAt: melody.updatedAt,
    instrumentBreakdown,
  };
}
