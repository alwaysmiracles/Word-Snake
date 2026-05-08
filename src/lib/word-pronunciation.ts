// Word pronunciation using Web Speech API

let speechSupported: boolean | null = null

export function isSpeechSupported(): boolean {
  if (speechSupported !== null) return speechSupported
  if (typeof window === 'undefined') {
    speechSupported = false
    return false
  }
  speechSupported = 'speechSynthesis' in window
  return speechSupported
}

export function pronounceWord(word: string, rate: number = 1.0): void {
  if (!isSpeechSupported()) return

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = rate
    utterance.pitch = 1.0
    utterance.volume = 0.8

    // Try to use a preferred English voice
    const voices = window.speechSynthesis.getVoices()
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')
    ) ?? voices.find(
      (v) => v.lang.startsWith('en-US')
    ) ?? voices.find(
      (v) => v.lang.startsWith('en')
    )
    if (englishVoice) {
      utterance.voice = englishVoice
    }

    window.speechSynthesis.speak(utterance)
  } catch {
    // Speech not available
  }
}

// Pronounce a word slowly (for learning)
export function pronounceWordSlow(word: string): void {
  pronounceWord(word, 0.6)
}

// Stop all speech
export function stopSpeech(): void {
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      // ignore
    }
  }
}
