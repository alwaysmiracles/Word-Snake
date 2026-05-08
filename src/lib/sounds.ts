// Web Audio API sound effects for the game
// Uses oscillators and noise for synthesized sounds (no audio files needed)
// Supports sound theme customization

import { getSoundTheme, type SoundThemeId } from '@/lib/sound-themes'

let audioCtx: AudioContext | null = null

// ── Visualizer pulse intensity (used by sound-visualizer.ts) ───────────
export let visualizerPulseIntensity = 0

export function getVisualizerPulseIntensity(): number {
  return visualizerPulseIntensity
}

export function decayVisualizerPulse(dt: number): void {
  if (visualizerPulseIntensity > 0) {
    visualizerPulseIntensity = Math.max(0, visualizerPulseIntensity - 2.0 * dt)
  }
}

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

// Current active sound theme (default)
let currentSoundTheme: SoundThemeId = 'default'

export function setSoundTheme(themeId: SoundThemeId): void {
  currentSoundTheme = themeId
}

export function getActiveSoundTheme(): SoundThemeId {
  return currentSoundTheme
}

export function playEatSound() {
  try {
    const ctx = getAudioContext()
    const theme = getSoundTheme(currentSoundTheme)
    const now = ctx.currentTime
    const vol = theme.volumeScale

    // Bright ascending chime
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = theme.eatWave
    osc1.frequency.setValueAtTime(523 + theme.eatDetune * 0.5, now) // C5
    osc1.frequency.linearRampToValueAtTime(784 + theme.eatDetune * 0.5, now + 0.08) // G5
    osc1.frequency.linearRampToValueAtTime(1047 + theme.eatDetune * 0.5, now + 0.15) // C6
    gain1.gain.setValueAtTime(0.15 * vol, now)
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.25)

    // Shimmer overlay
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = theme.eatOverlayWave
    osc2.frequency.setValueAtTime(1047, now + 0.05)
    osc2.frequency.linearRampToValueAtTime(1568, now + 0.15)
    gain2.gain.setValueAtTime(0.08 * vol, now + 0.05)
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.05)
    osc2.stop(now + 0.3)
  } catch {
    // Audio not available
  }
  visualizerPulseIntensity = 1.0
}

export function playGameOverSound() {
  try {
    const ctx = getAudioContext()
    const theme = getSoundTheme(currentSoundTheme)
    const now = ctx.currentTime
    const vol = theme.volumeScale

    // Descending sad tone
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = theme.gameOverWave
    osc1.frequency.setValueAtTime(440, now)
    osc1.frequency.linearRampToValueAtTime(220, now + 0.3)
    osc1.frequency.linearRampToValueAtTime(110, now + 0.6)
    gain1.gain.setValueAtTime(0.1 * vol, now)
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.7)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.7)

    // Low rumble
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = theme.gameOverRumbleWave
    osc2.frequency.setValueAtTime(80, now)
    osc2.frequency.linearRampToValueAtTime(40, now + 0.5)
    gain2.gain.setValueAtTime(0.15 * vol, now)
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.6)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now)
    osc2.stop(now + 0.6)
  } catch {
    // Audio not available
  }
  visualizerPulseIntensity = 1.0
}

export function playStartSound() {
  try {
    const ctx = getAudioContext()
    const theme = getSoundTheme(currentSoundTheme)
    const now = ctx.currentTime
    const vol = theme.volumeScale

    // Quick ascending trio
    const notes = [392, 523, 659] // G4, C5, E5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = theme.startWave
      const startTime = now + i * 0.08
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(0.12 * vol, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.15)
    })
  } catch {
    // Audio not available
  }
  visualizerPulseIntensity = 1.0
}

export function playPauseSound() {
  try {
    const ctx = getAudioContext()
    const theme = getSoundTheme(currentSoundTheme)
    const now = ctx.currentTime
    const vol = theme.volumeScale

    // Soft blip
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = theme.pauseWave
    osc.frequency.setValueAtTime(660, now)
    gain.gain.setValueAtTime(0.08 * vol, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.1)
  } catch {
    // Audio not available
  }
  visualizerPulseIntensity = 1.0
}

export function playPoemSound() {
  try {
    const ctx = getAudioContext()
    const theme = getSoundTheme(currentSoundTheme)
    const now = ctx.currentTime
    const vol = theme.volumeScale

    // Magical ascending arpeggio
    const notes = [523, 659, 784, 1047, 1319] // C5, E5, G5, C6, E6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = theme.poemWave
      const startTime = now + i * 0.1
      osc.frequency.setValueAtTime(freq + theme.poemDetune * 0.3, startTime)
      gain.gain.setValueAtTime(0.1 * vol, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.3)
    })

    // Shimmer
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = theme.poemOverlayWave
    osc2.frequency.setValueAtTime(2093, now + 0.3) // C7
    gain2.gain.setValueAtTime(0.05 * vol, now + 0.3)
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.8)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.3)
    osc2.stop(now + 0.8)
  } catch {
    // Audio not available
  }
  visualizerPulseIntensity = 1.0
}

export function playPowerUpSound() {
  try {
    const ctx = getAudioContext()
    const theme = getSoundTheme(currentSoundTheme)
    const now = ctx.currentTime
    const vol = theme.volumeScale

    // Bright, magical ascending sound (shorter than poem sound)
    const notes = [659, 880, 1047, 1319] // E5, A5, C6, E6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = theme.powerUpWave
      const startTime = now + i * 0.06
      osc.frequency.setValueAtTime(freq + theme.powerUpDetune * 0.3, startTime)
      gain.gain.setValueAtTime(0.12 * vol, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.2)
    })

    // Sparkle overlay
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = theme.powerUpOverlayWave
    osc2.frequency.setValueAtTime(1760, now + 0.15) // A6
    osc2.frequency.linearRampToValueAtTime(2093, now + 0.25) // C7
    gain2.gain.setValueAtTime(0.06 * vol, now + 0.15)
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.15)
    osc2.stop(now + 0.4)
  } catch {
    // Audio not available
  }
  visualizerPulseIntensity = 1.0
}

export function playClickSound() {
  try {
    const ctx = getAudioContext()
    const theme = getSoundTheme(currentSoundTheme)
    const now = ctx.currentTime
    const vol = theme.volumeScale

    // Tiny tick
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = theme.clickWave
    osc.frequency.setValueAtTime(800, now)
    gain.gain.setValueAtTime(0.06 * vol, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.04)
  } catch {
    // Audio not available
  }
}

// Preview sound for theme switching — a short chime using the theme's parameters
export function playThemePreviewSound(themeId: SoundThemeId) {
  try {
    const ctx = getAudioContext()
    const theme = getSoundTheme(themeId)
    const now = ctx.currentTime
    const vol = theme.volumeScale

    // Short 3-note arpeggio to showcase the theme
    const notes = [523, 659, 784] // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = theme.eatWave
      const startTime = now + i * 0.06
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(0.1 * vol, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.15)
    })
  } catch {
    // Audio not available
  }
  visualizerPulseIntensity = 1.0
}

// Easter egg discovery sound — a magical rising arpeggio with shimmer
export function playEasterEggSound() {
  try {
    const ctx = getAudioContext()
    const theme = getSoundTheme(currentSoundTheme)
    const now = ctx.currentTime
    const vol = theme.volumeScale

    // Magical 5-note ascending arpeggio (wider range than power-up)
    const notes = [523, 659, 784, 1047, 1568] // C5, E5, G5, C6, G6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = theme.powerUpWave
      const startTime = now + i * 0.07
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(0.12 * vol, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.35)
    })

    // High shimmer overlay (delayed)
    const shimmerNotes = [2093, 2637] // C7, E7
    shimmerNotes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      const startTime = now + 0.3 + i * 0.08
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(0.06 * vol, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.6)
    })

    // Warm pad underneath
    const pad = ctx.createOscillator()
    const padGain = ctx.createGain()
    pad.type = 'sine'
    pad.frequency.setValueAtTime(262, now) // C4
    pad.frequency.linearRampToValueAtTime(523, now + 0.5) // C5
    padGain.gain.setValueAtTime(0.06 * vol, now)
    padGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8)
    pad.connect(padGain)
    padGain.connect(ctx.destination)
    pad.start(now)
    pad.stop(now + 0.8)
  } catch {
    // Audio not available
  }
  visualizerPulseIntensity = 1.0
}
