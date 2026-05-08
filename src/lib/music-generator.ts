'use client'

// ═══════════════════════════════════════════════════════════════════════════════
// Procedural Background Music Generator for Word Snake
// Uses Web Audio API oscillators to create ambient background music
// ═══════════════════════════════════════════════════════════════════════════════

// ── Types ─────────────────────────────────────────────────────────────────────

export type MusicStyle = 'ambient' | 'retro' | 'epic' | 'chill' | 'mystic'

export type MusicStatus = 'playing' | 'paused' | 'stopped'

export interface MusicConfig {
  style: MusicStyle
  volume: number   // 0-1
  tempo: number    // BPM
}

export interface MusicEngine {
  play(): void
  pause(): void
  resume(): void
  stop(): void
  setStyle(style: MusicStyle): void
  setVolume(vol: number): void
  setTempo(bpm: number): void
  getStatus(): MusicStatus
  getConfig(): MusicConfig
  destroy(): void
}

// ── Style Metadata ────────────────────────────────────────────────────────────

export const MUSIC_STYLES: Record<
  MusicStyle,
  { label: string; emoji: string; description: string; baseTempo: number; color: string }
> = {
  ambient: {
    label: 'Ambient',
    emoji: '🎵',
    description: 'Soft sine waves, slow arpeggios, peaceful pads',
    baseTempo: 60,
    color: '#4ade80',
  },
  retro: {
    label: 'Retro',
    emoji: '🕹️',
    description: 'Square wave melodies, 8-bit style, faster tempo',
    baseTempo: 120,
    color: '#facc15',
  },
  epic: {
    label: 'Epic',
    emoji: '⚔️',
    description: 'Powerful sawtooth bass, dramatic chord progressions',
    baseTempo: 80,
    color: '#ef4444',
  },
  chill: {
    label: 'Chill',
    emoji: '🌊',
    description: 'Gentle triangle waves, lo-fi feel, slow tempo',
    baseTempo: 70,
    color: '#60a5fa',
  },
  mystic: {
    label: 'Mystic',
    emoji: '✨',
    description: 'Ethereal pad sounds, pentatonic scales, reverb-like effects',
    baseTempo: 55,
    color: '#c084fc',
  },
}

// ── Musical Scales (frequencies in Hz) ────────────────────────────────────────

const SCALES = {
  pentatonic: [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    392.00, // G4
    440.00, // A4
    523.25, // C5
    587.33, // D5
    659.25, // E5
  ],
  minor: [
    261.63, // C4
    293.66, // D4
    311.13, // Eb4
    349.23, // F4
    392.00, // G4
    415.30, // Ab4
    466.16, // Bb4
    523.25, // C5
  ],
  major: [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    349.23, // F4
    392.00, // G4
    440.00, // A4
    493.88, // B4
    523.25, // C5
  ],
} as const

// ── Internal Style Sound Configs ──────────────────────────────────────────────

interface StyleSoundConfig {
  scale: readonly number[]
  bassWave: OscillatorType
  melodyWave: OscillatorType
  padWave: OscillatorType
  /** Index into scale; -1 = rest */
  bassPattern: number[]
  /** Index into scale; -1 = rest */
  melodyPattern: number[]
  /** Each chord is [rootScaleIdx, thirdOffset, fifthOffset] — offsets in semitones */
  chordProgression: number[][]
  padDetune: number
  /** Bass volume relative to master (0-1) */
  bassLevel: number
  /** Melody volume relative to master */
  melodyLevel: number
  /** Pad volume relative to master */
  padLevel: number
  /** Beats per loop cycle */
  loopLength: number
  /** Beats per chord change */
  chordsPerLoop: number
  /** Seconds for pad attack/release envelope */
  padEnvelope: number
  /** Seconds for bass envelope */
  bassEnvelope: number
  /** Seconds for melody note envelope */
  melodyEnvelope: number
}

// Multiplicative frequency ratios for chord intervals
const MINOR_THIRD = 6 / 5     // ~1.2
const MAJOR_THIRD = 5 / 4     // 1.25
const PERFECT_FIFTH = 3 / 2   // 1.5

const STYLE_CONFIGS: Record<MusicStyle, StyleSoundConfig> = {
  ambient: {
    scale: SCALES.pentatonic,
    bassWave: 'sine',
    melodyWave: 'sine',
    padWave: 'sine',
    bassPattern: [0, -1, 0, -1, 3, -1, 2, -1],
    melodyPattern: [4, 3, 2, 0, 2, 3, 4, -1, 3, 2, 0, -1, 2, 4, 3, -1],
    chordProgression: [
      [0, MINOR_THIRD, PERFECT_FIFTH], // Cm-ish (works in pentatonic context)
      [3, MINOR_THIRD, PERFECT_FIFTH], // G
      [2, MAJOR_THIRD, PERFECT_FIFTH], // E
      [0, MINOR_THIRD, PERFECT_FIFTH], // Cm
    ],
    padDetune: 5,
    bassLevel: 0.35,
    melodyLevel: 0.20,
    padLevel: 0.15,
    loopLength: 16,
    chordsPerLoop: 4,
    padEnvelope: 1.2,
    bassEnvelope: 0.4,
    melodyEnvelope: 0.25,
  },
  retro: {
    scale: SCALES.minor,
    bassWave: 'square',
    melodyWave: 'square',
    padWave: 'triangle',
    bassPattern: [0, -1, 0, -1, 3, -1, 4, -1],
    melodyPattern: [0, 2, 4, 5, 4, 3, 2, 0, 5, 4, 3, 2, 0, 2, 4, -1],
    chordProgression: [
      [0, MINOR_THIRD, PERFECT_FIFTH],  // Cm
      [3, MINOR_THIRD, PERFECT_FIFTH],  // Gm (Fm in minor scale: index 3=F)
      [4, MINOR_THIRD, PERFECT_FIFTH],  // Ab
      [0, MINOR_THIRD, PERFECT_FIFTH],  // Cm
    ],
    padDetune: 0,
    bassLevel: 0.18,
    melodyLevel: 0.12,
    padLevel: 0.08,
    loopLength: 16,
    chordsPerLoop: 4,
    padEnvelope: 0.15,
    bassEnvelope: 0.05,
    melodyEnvelope: 0.04,
  },
  epic: {
    scale: SCALES.minor,
    bassWave: 'sawtooth',
    melodyWave: 'sawtooth',
    padWave: 'sawtooth',
    bassPattern: [0, 0, -1, 0, -1, 3, 3, -1, 4, -1, 4, 4, -1, 0, -1, -1],
    melodyPattern: [4, -1, 5, -1, 6, -1, 5, 4, -1, 3, -1, 4, -1, 2, 0, -1],
    chordProgression: [
      [0, MINOR_THIRD, PERFECT_FIFTH],   // Cm
      [5, MINOR_THIRD, PERFECT_FIFTH],   // Ab
      [2, MINOR_THIRD, PERFECT_FIFTH],   // Eb (Fm in context)
      [4, MAJOR_THIRD, PERFECT_FIFTH],   // Ab (augmented-ish)
    ],
    padDetune: 8,
    bassLevel: 0.28,
    melodyLevel: 0.15,
    padLevel: 0.12,
    loopLength: 16,
    chordsPerLoop: 4,
    padEnvelope: 0.8,
    bassEnvelope: 0.2,
    melodyEnvelope: 0.15,
  },
  chill: {
    scale: SCALES.pentatonic,
    bassWave: 'triangle',
    melodyWave: 'triangle',
    padWave: 'sine',
    bassPattern: [0, -1, -1, -1, 2, -1, -1, -1, 3, -1, -1, -1, 0, -1, -1, -1],
    melodyPattern: [2, -1, -1, 4, -1, -1, 3, -1, -1, -1, 2, -1, 4, -1, -1, -1],
    chordProgression: [
      [0, MAJOR_THIRD, PERFECT_FIFTH],  // C
      [3, MAJOR_THIRD, PERFECT_FIFTH],  // G
      [2, MAJOR_THIRD, PERFECT_FIFTH],  // E
      [4, MINOR_THIRD, PERFECT_FIFTH],  // Am-ish
    ],
    padDetune: 3,
    bassLevel: 0.30,
    melodyLevel: 0.18,
    padLevel: 0.14,
    loopLength: 16,
    chordsPerLoop: 4,
    padEnvelope: 1.5,
    bassEnvelope: 0.6,
    melodyEnvelope: 0.4,
  },
  mystic: {
    scale: SCALES.pentatonic,
    bassWave: 'sine',
    melodyWave: 'sine',
    padWave: 'sine',
    bassPattern: [0, -1, -1, -1, -1, -1, -1, -1, 3, -1, -1, -1, -1, -1, -1, -1],
    melodyPattern: [4, -1, -1, -1, 3, -1, -1, 2, -1, -1, -1, -1, 0, -1, -1, -1],
    chordProgression: [
      [0, MINOR_THIRD, PERFECT_FIFTH],   // ethereal minor on C
      [2, MAJOR_THIRD, PERFECT_FIFTH],   // E
      [4, MINOR_THIRD, PERFECT_FIFTH],   // Am
      [3, MINOR_THIRD, PERFECT_FIFTH],   // Gm
    ],
    padDetune: 12,
    bassLevel: 0.25,
    melodyLevel: 0.14,
    padLevel: 0.18,
    loopLength: 16,
    chordsPerLoop: 4,
    padEnvelope: 2.0,
    bassEnvelope: 0.8,
    melodyEnvelope: 0.6,
  },
}

// ── Persistence ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'word-snake-music'

export function getSavedMusicConfig(): MusicConfig | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<MusicConfig>
    if (
      typeof parsed.style === 'string' &&
      parsed.style in MUSIC_STYLES &&
      typeof parsed.volume === 'number' &&
      typeof parsed.tempo === 'number'
    ) {
      return {
        style: parsed.style as MusicStyle,
        volume: Math.max(0, Math.min(1, parsed.volume)),
        tempo: Math.max(30, Math.min(200, parsed.tempo)),
      }
    }
  } catch {
    // localStorage unavailable or corrupt data
  }
  return null
}

export function saveMusicConfig(config: MusicConfig): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // localStorage unavailable
  }
}

// ── Default Config ────────────────────────────────────────────────────────────

const DEFAULT_VOLUME = 0.15

function getDefaultConfig(): MusicConfig {
  const saved = getSavedMusicConfig()
  if (saved) return saved
  return {
    style: 'ambient',
    volume: DEFAULT_VOLUME,
    tempo: MUSIC_STYLES.ambient.baseTempo,
  }
}

// ── Scheduler Helpers ─────────────────────────────────────────────────────────

/** How far ahead to schedule (seconds) */
const SCHEDULE_AHEAD = 0.12
/** How often the scheduler runs (ms) */
const SCHEDULER_INTERVAL = 30

// ── Music Engine Factory ──────────────────────────────────────────────────────

export function createMusicEngine(initialConfig?: Partial<MusicConfig>): MusicEngine {
  const config: MusicConfig = {
    ...getDefaultConfig(),
    ...initialConfig,
  }

  let status: MusicStatus = 'stopped'
  let ctx: AudioContext | null = null
  let masterGain: GainNode | null = null

  // Layer gain nodes
  let bassGain: GainNode | null = null
  let melodyGain: GainNode | null = null
  let padGain: GainNode | null = null

  // Active oscillators
  let bassOsc: OscillatorNode | null = null
  let melodyOsc: OscillatorNode | null = null
  const padOscs: OscillatorNode[] = []
  const padGainNodes: GainNode[] = [] // individual pad oscillator gains

  // Scheduling state
  let schedulerTimer: ReturnType<typeof setInterval> | null = null
  let currentBeat = 0
  let nextBeatTime = 0
  let currentChordIndex = 0

  // ── Helpers ───────────────────────────────────────────────────────────────

  function isAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof AudioContext !== 'undefined'
    )
  }

  function getStyleConfig(): StyleSoundConfig {
    return STYLE_CONFIGS[config.style]
  }

  function secondsPerBeat(): number {
    return 60 / config.tempo
  }

  function ensureContext(): boolean {
    if (!isAvailable()) return false
    try {
      if (!ctx) {
        ctx = new AudioContext()
      }
      if (ctx.state === 'suspended') {
        ctx.resume()
      }
      return true
    } catch {
      return false
    }
  }

  // ── Audio Graph Setup ────────────────────────────────────────────────────

  function buildAudioGraph(): boolean {
    if (!ctx) return false
    try {
      // Master gain
      if (!masterGain) {
        masterGain = ctx.createGain()
        masterGain.gain.setValueAtTime(config.volume, ctx.currentTime)
        masterGain.connect(ctx.destination)
      }

      const sc = getStyleConfig()

      // Bass layer
      if (!bassGain) {
        bassGain = ctx.createGain()
        bassGain.gain.setValueAtTime(0, ctx.currentTime)
        bassGain.connect(masterGain)
      }
      bassGain.gain.setValueAtTime(sc.bassLevel, ctx.currentTime)

      // Melody layer
      if (!melodyGain) {
        melodyGain = ctx.createGain()
        melodyGain.gain.setValueAtTime(0, ctx.currentTime)
        melodyGain.connect(masterGain)
      }
      melodyGain.gain.setValueAtTime(sc.melodyLevel, ctx.currentTime)

      // Pad layer
      if (!padGain) {
        padGain = ctx.createGain()
        padGain.gain.setValueAtTime(0, ctx.currentTime)
        padGain.connect(masterGain)
      }
      padGain.gain.setValueAtTime(sc.padLevel, ctx.currentTime)

      return true
    } catch {
      return false
    }
  }

  // ── Oscillator Management ────────────────────────────────────────────────

  function createBassOsc(): boolean {
    if (!ctx || !bassGain) return false
    try {
      stopBassOsc()
      bassOsc = ctx.createOscillator()
      bassOsc.type = getStyleConfig().bassWave
      bassOsc.frequency.setValueAtTime(60, ctx.currentTime) // will be set by scheduler
      bassOsc.connect(bassGain)
      bassOsc.start()
      return true
    } catch {
      return false
    }
  }

  function stopBassOsc(): void {
    try {
      if (bassOsc) {
        bassOsc.stop()
        bassOsc.disconnect()
        bassOsc = null
      }
    } catch {
      bassOsc = null
    }
  }

  function createMelodyOsc(): boolean {
    if (!ctx || !melodyGain) return false
    try {
      stopMelodyOsc()
      melodyOsc = ctx.createOscillator()
      melodyOsc.type = getStyleConfig().melodyWave
      melodyOsc.frequency.setValueAtTime(200, ctx.currentTime)
      melodyOsc.connect(melodyGain)
      melodyOsc.start()
      return true
    } catch {
      return false
    }
  }

  function stopMelodyOsc(): void {
    try {
      if (melodyOsc) {
        melodyOsc.stop()
        melodyOsc.disconnect()
        melodyOsc = null
      }
    } catch {
      melodyOsc = null
    }
  }

  function createPadOscs(): boolean {
    if (!ctx || !padGain) return false
    try {
      stopPadOscs()
      const sc = getStyleConfig()
      // 3 oscillators for the pad, slightly detuned
      const detunes = [-sc.padDetune, 0, sc.padDetune]
      for (const detune of detunes) {
        const osc = ctx.createOscillator()
        osc.type = sc.padWave
        osc.frequency.setValueAtTime(200, ctx.currentTime)
        osc.detune.setValueAtTime(detune, ctx.currentTime)
        const g = ctx.createGain()
        g.gain.setValueAtTime(0.33, ctx.currentTime) // each pad osc gets 1/3
        osc.connect(g)
        g.connect(padGain)
        osc.start()
        padOscs.push(osc)
        padGainNodes.push(g)
      }
      return true
    } catch {
      return false
    }
  }

  function stopPadOscs(): void {
    for (let i = 0; i < padOscs.length; i++) {
      try {
        padOscs[i].stop()
        padOscs[i].disconnect()
        padGainNodes[i].disconnect()
      } catch {
        // already stopped
      }
    }
    padOscs.length = 0
    padGainNodes.length = 0
  }

  // ── Note Scheduling ──────────────────────────────────────────────────────

  /**
   * Schedule a frequency change with a smooth envelope on a gain node.
   * If idx === -1, the note is a rest (gain drops to 0).
   */
  function scheduleNote(
    osc: OscillatorNode | null,
    layerGain: GainNode | null,
    frequency: number,
    time: number,
    envelopeSeconds: number,
    velocity: number,
  ): void {
    if (!ctx || !osc || !layerGain) return
    try {
      const attackTime = Math.min(envelopeSeconds * 0.4, 0.15)
      const releaseTime = Math.min(envelopeSeconds * 0.6, 0.3)

      // Ramp frequency smoothly
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(frequency, 20), // clamp to avoid 0
        time + attackTime,
      )

      // Gain envelope: quick attack, sustain, release
      layerGain.gain.cancelScheduledValues(time)
      layerGain.gain.setValueAtTime(layerGain.gain.value, time)
      layerGain.gain.linearRampToValueAtTime(velocity, time + attackTime)
      layerGain.gain.setValueAtTime(velocity, time + secondsPerBeat() - releaseTime)
      layerGain.gain.exponentialRampToValueAtTime(0.0001, time + secondsPerBeat())
    } catch {
      // scheduling error — skip
    }
  }

  function scheduleRest(
    layerGain: GainNode | null,
    time: number,
    envelopeSeconds: number,
  ): void {
    if (!ctx || !layerGain) return
    try {
      const releaseTime = Math.min(envelopeSeconds * 0.4, 0.15)
      layerGain.gain.cancelScheduledValues(time)
      layerGain.gain.setValueAtTime(layerGain.gain.value, time)
      layerGain.gain.exponentialRampToValueAtTime(0.0001, time + releaseTime)
    } catch {
      // ignore
    }
  }

  function scheduleChordChange(chordDef: number[], time: number): void {
    if (!ctx || padOscs.length !== 3) return
    const sc = getStyleConfig()
    const scale = sc.scale
    const [rootIdx, thirdRatio, fifthRatio] = chordDef
    const rootFreq = scale[rootIdx] * 0.5 // one octave lower for warmth
    const frequencies = [rootFreq, rootFreq * thirdRatio, rootFreq * fifthRatio]

    try {
      for (let i = 0; i < 3; i++) {
        const osc = padOscs[i]
        const g = padGainNodes[i]
        if (!osc || !g) continue

        const attack = sc.padEnvelope * 0.5
        osc.frequency.cancelScheduledValues(time)
        osc.frequency.setValueAtTime(osc.frequency.value, time)
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(frequencies[i], 20),
          time + attack,
        )

        // Smooth gain swell
        g.gain.cancelScheduledValues(time)
        g.gain.setValueAtTime(g.gain.value, time)
        g.gain.linearRampToValueAtTime(0.33, time + attack)
      }
    } catch {
      // ignore
    }
  }

  // ── Scheduler Loop ───────────────────────────────────────────────────────

  function scheduler(): void {
    if (!ctx || status !== 'playing') return
    try {
      const sc = getStyleConfig()
      const spb = secondsPerBeat()

      while (nextBeatTime < ctx.currentTime + SCHEDULE_AHEAD) {
        const beatInLoop = currentBeat % sc.loopLength

        // ── Bass ─────────────────────────────────────────────────────────
        const bassIdx = sc.bassPattern[beatInLoop]
        if (bassIdx >= 0 && bassIdx < sc.scale.length) {
          // Bass plays one octave lower
          const bassFreq = sc.scale[bassIdx] * 0.5
          scheduleNote(bassOsc, bassGain, bassFreq, nextBeatTime, sc.bassEnvelope, sc.bassLevel)
        } else {
          scheduleRest(bassGain, nextBeatTime, sc.bassEnvelope)
        }

        // ── Melody ───────────────────────────────────────────────────────
        const melodyIdx = sc.melodyPattern[beatInLoop]
        if (melodyIdx >= 0 && melodyIdx < sc.scale.length) {
          scheduleNote(melodyOsc, melodyGain, sc.scale[melodyIdx], nextBeatTime, sc.melodyEnvelope, sc.melodyLevel)
        } else {
          scheduleRest(melodyGain, nextBeatTime, sc.melodyEnvelope)
        }

        // ── Pad chord change ─────────────────────────────────────────────
        const beatsPerChord = sc.loopLength / sc.chordsPerLoop
        if (beatInLoop % beatsPerChord === 0) {
          const chordIdx = Math.floor(beatInLoop / beatsPerChord) % sc.chordProgression.length
          currentChordIndex = chordIdx
          scheduleChordChange(sc.chordProgression[chordIdx], nextBeatTime)
        }

        // Advance
        nextBeatTime += spb
        currentBeat++
      }
    } catch {
      // scheduler error — silently continue
    }
  }

  function startScheduler(): void {
    stopScheduler()
    schedulerTimer = setInterval(scheduler, SCHEDULER_INTERVAL)
  }

  function stopScheduler(): void {
    if (schedulerTimer !== null) {
      clearInterval(schedulerTimer)
      schedulerTimer = null
    }
  }

  // ── Style Change (rebuild oscillators) ───────────────────────────────────

  function rebuildForStyle(): void {
    const wasPlaying = status === 'playing'
    if (wasPlaying) {
      stopScheduler()
    }

    // Stop all oscillators
    stopBassOsc()
    stopMelodyOsc()
    stopPadOscs()

    // Reset beat tracking
    currentBeat = 0
    currentChordIndex = 0
    nextBeatTime = 0

    if (!ctx || !buildAudioGraph()) return

    // Create new oscillators with the new style's wave types
    createBassOsc()
    createMelodyOsc()
    createPadOscs()

    if (wasPlaying) {
      nextBeatTime = ctx.currentTime
      startScheduler()
    }
  }

  // ── Engine API ───────────────────────────────────────────────────────────

  const engine: MusicEngine = {
    play(): void {
      if (!isAvailable()) return
      try {
        if (!ensureContext()) return
        if (!buildAudioGraph()) return

        if (status === 'playing') return

        // If paused, just resume
        if (status === 'paused') {
          engine.resume()
          return
        }

        // Starting fresh
        status = 'playing'

        // Ensure oscillators exist
        if (!bassOsc) createBassOsc()
        if (!melodyOsc) createMelodyOsc()
        if (padOscs.length === 0) createPadOscs()

        // Reset timing
        currentBeat = 0
        currentChordIndex = 0
        nextBeatTime = ctx!.currentTime

        // Fade in master
        if (masterGain && ctx) {
          masterGain.gain.setValueAtTime(0.0001, ctx.currentTime)
          masterGain.gain.linearRampToValueAtTime(config.volume, ctx.currentTime + 0.5)
        }

        startScheduler()
      } catch {
        // Audio not available
      }
    },

    pause(): void {
      if (status !== 'playing' || !ctx || !masterGain) return
      try {
        status = 'paused'
        stopScheduler()

        // Fade out gently
        const now = ctx.currentTime
        masterGain.gain.setValueAtTime(masterGain.gain.value, now)
        masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.3)

        // Suspend context after fade
        setTimeout(() => {
          try {
            if (ctx && status === 'paused') {
              ctx.suspend()
            }
          } catch {
            // ignore
          }
        }, 350)
      } catch {
        // ignore
      }
    },

    resume(): void {
      if (status !== 'paused') return
      if (!ensureContext()) return

      try {
        status = 'playing'

        // Recalculate nextBeatTime relative to now
        if (ctx) {
          nextBeatTime = ctx.currentTime
        }

        // Fade in
        if (masterGain && ctx) {
          masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime)
          masterGain.gain.linearRampToValueAtTime(config.volume, ctx.currentTime + 0.3)
        }

        startScheduler()
      } catch {
        // Audio not available
      }
    },

    stop(): void {
      try {
        status = 'stopped'
        stopScheduler()

        const now = ctx ? ctx.currentTime : 0

        // Fade out and clean up
        if (masterGain && ctx) {
          masterGain.gain.setValueAtTime(masterGain.gain.value, now)
          masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.2)
        }

        const cleanupDelay = 250
        setTimeout(() => {
          try {
            stopBassOsc()
            stopMelodyOsc()
            stopPadOscs()
          } catch {
            // ignore
          }
        }, cleanupDelay)

        // Reset beat tracking
        currentBeat = 0
        currentChordIndex = 0
        nextBeatTime = 0
      } catch {
        // ignore
      }
    },

    setStyle(style: MusicStyle): void {
      if (style === config.style && status !== 'stopped') return
      config.style = style
      config.tempo = MUSIC_STYLES[style].baseTempo
      rebuildForStyle()
      saveMusicConfig(config)
    },

    setVolume(vol: number): void {
      config.volume = Math.max(0, Math.min(1, vol))
      try {
        if (masterGain && ctx && status === 'playing') {
          masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime)
          masterGain.gain.linearRampToValueAtTime(config.volume, ctx.currentTime + 0.1)
        } else if (masterGain && ctx) {
          masterGain.gain.setValueAtTime(config.volume, ctx.currentTime)
        }
      } catch {
        // ignore
      }
      saveMusicConfig(config)
    },

    setTempo(bpm: number): void {
      config.tempo = Math.max(30, Math.min(200, bpm))
      // Tempo takes effect on next scheduled beat — no rebuild needed
      saveMusicConfig(config)
    },

    getStatus(): MusicStatus {
      return status
    },

    getConfig(): MusicConfig {
      return { ...config }
    },

    destroy(): void {
      try {
        engine.stop()
        stopBassOsc()
        stopMelodyOsc()
        stopPadOscs()

        if (masterGain) {
          try { masterGain.disconnect() } catch { /* ok */ }
          masterGain = null
        }
        if (bassGain) {
          try { bassGain.disconnect() } catch { /* ok */ }
          bassGain = null
        }
        if (melodyGain) {
          try { melodyGain.disconnect() } catch { /* ok */ }
          melodyGain = null
        }
        if (padGain) {
          try { padGain.disconnect() } catch { /* ok */ }
          padGain = null
        }
        if (ctx) {
          try { ctx.close() } catch { /* ok */ }
          ctx = null
        }
      } catch {
        // cleanup best-effort
      }
    },
  }

  return engine
}

// ── Convenience: Singleton (lazy) ─────────────────────────────────────────────

let _singleton: MusicEngine | null = null

export function getMusicEngine(): MusicEngine {
  if (!_singleton) {
    _singleton = createMusicEngine()
  }
  return _singleton
}

export function destroyMusicEngine(): void {
  if (_singleton) {
    _singleton.destroy()
    _singleton = null
  }
}
