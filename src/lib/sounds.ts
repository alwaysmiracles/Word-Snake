// Web Audio API sound effects for the game
// Uses oscillators and noise for synthesized sounds (no audio files needed)

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function playEatSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Bright ascending chime
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(523, now) // C5
    osc1.frequency.linearRampToValueAtTime(784, now + 0.08) // G5
    osc1.frequency.linearRampToValueAtTime(1047, now + 0.15) // C6
    gain1.gain.setValueAtTime(0.15, now)
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.25)

    // Shimmer overlay
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(1047, now + 0.05)
    osc2.frequency.linearRampToValueAtTime(1568, now + 0.15)
    gain2.gain.setValueAtTime(0.08, now + 0.05)
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.05)
    osc2.stop(now + 0.3)
  } catch {
    // Audio not available
  }
}

export function playGameOverSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Descending sad tone
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sawtooth'
    osc1.frequency.setValueAtTime(440, now)
    osc1.frequency.linearRampToValueAtTime(220, now + 0.3)
    osc1.frequency.linearRampToValueAtTime(110, now + 0.6)
    gain1.gain.setValueAtTime(0.1, now)
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.7)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.7)

    // Low rumble
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(80, now)
    osc2.frequency.linearRampToValueAtTime(40, now + 0.5)
    gain2.gain.setValueAtTime(0.15, now)
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.6)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now)
    osc2.stop(now + 0.6)
  } catch {
    // Audio not available
  }
}

export function playStartSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Quick ascending trio
    const notes = [392, 523, 659] // G4, C5, E5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      const startTime = now + i * 0.08
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(0.12, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.15)
    })
  } catch {
    // Audio not available
  }
}

export function playPauseSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Soft blip
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(660, now)
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.1)
  } catch {
    // Audio not available
  }
}

export function playPoemSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Magical ascending arpeggio
    const notes = [523, 659, 784, 1047, 1319] // C5, E5, G5, C6, E6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      const startTime = now + i * 0.1
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(0.1, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.3)
    })

    // Shimmer
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(2093, now + 0.3) // C7
    gain2.gain.setValueAtTime(0.05, now + 0.3)
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.8)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.3)
    osc2.stop(now + 0.8)
  } catch {
    // Audio not available
  }
}

export function playClickSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Tiny tick
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, now)
    gain.gain.setValueAtTime(0.06, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.04)
  } catch {
    // Audio not available
  }
}
