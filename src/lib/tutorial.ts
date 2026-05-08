export type TutorialHighlight = 'snake' | 'food' | 'score' | 'controls' | 'none'

export type TutorialAction = 'move_up' | 'move_down' | 'move_left' | 'move_right' | 'eat_word' | 'pause'

export interface TutorialStep {
  id: string
  title: string
  description: string
  emoji: string
  highlight: TutorialHighlight
  action?: TutorialAction
}

export interface TutorialState {
  active: boolean
  currentStep: number
  steps: TutorialStep[]
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Word Snake!',
    description:
      'Guide your snake to eat words and collect them for poems. Let\'s learn the basics!',
    emoji: '👋',
    highlight: 'snake',
  },
  {
    id: 'movement',
    title: 'Moving Around',
    description: 'Use Arrow Keys or WASD to control the snake. Try moving UP now!',
    emoji: '⬆️',
    highlight: 'snake',
    action: 'move_up',
  },
  {
    id: 'food',
    title: 'Eating Words',
    description:
      'See the glowing word on the grid? Move your snake to eat it and earn points!',
    emoji: '🍽️',
    highlight: 'food',
    action: 'eat_word',
  },
  {
    id: 'score',
    title: 'Scoring Points',
    description:
      'Each word has a point value based on its rarity. Watch your score go up!',
    emoji: '⭐',
    highlight: 'score',
  },
  {
    id: 'categories',
    title: 'Word Categories',
    description:
      'Words come in 8 categories with different colors. Eating same-category words builds combos!',
    emoji: '🌈',
    highlight: 'none',
  },
  {
    id: 'powerups',
    title: 'Power-ups',
    description:
      'Special items appear on the grid — Slow-Mo, Double Points, Shield, and more!',
    emoji: '💎',
    highlight: 'none',
  },
  {
    id: 'controls',
    title: 'Controls',
    description:
      'Press SPACE or P to pause. Press M to mute sounds. Press ? for all shortcuts.',
    emoji: '🎮',
    highlight: 'controls',
  },
  {
    id: 'poems',
    title: 'Make Poems',
    description:
      'Switch to the Poem page to turn your collected words into AI-generated poems!',
    emoji: '✍️',
    highlight: 'none',
  },
  {
    id: 'complete',
    title: "You're Ready!",
    description:
      "That's everything you need to know. Have fun playing Word Snake!",
    emoji: '🎉',
    highlight: 'none',
  },
]

const TUTORIAL_DONE_KEY = 'word-snake-tutorial-done'
const TUTORIAL_STEP_KEY = 'word-snake-tutorial-step'

export function isTutorialCompleted(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(TUTORIAL_DONE_KEY) === 'true'
  } catch {
    return false
  }
}

export function markTutorialCompleted(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(TUTORIAL_DONE_KEY, 'true')
    localStorage.removeItem(TUTORIAL_STEP_KEY)
  } catch {
    // ignore
  }
}

export function getTutorialProgress(): { completed: boolean; stepIndex: number } {
  if (typeof window === 'undefined') return { completed: false, stepIndex: 0 }
  try {
    const completed = localStorage.getItem(TUTORIAL_DONE_KEY) === 'true'
    const stepStr = localStorage.getItem(TUTORIAL_STEP_KEY)
    const stepIndex = stepStr ? Math.min(parseInt(stepStr, 10), TUTORIAL_STEPS.length - 1) : 0
    return { completed, stepIndex: isNaN(stepIndex) ? 0 : stepIndex }
  } catch {
    return { completed: false, stepIndex: 0 }
  }
}

export function saveTutorialProgress(stepIndex: number): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(TUTORIAL_STEP_KEY, String(stepIndex))
  } catch {
    // ignore
  }
}

export function resetTutorial(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(TUTORIAL_DONE_KEY)
    localStorage.removeItem(TUTORIAL_STEP_KEY)
  } catch {
    // ignore
  }
}

/** Create a fresh tutorial state (optionally resuming from saved progress) */
export function createTutorialState(resume = false): TutorialState {
  if (resume) {
    const progress = getTutorialProgress()
    if (!progress.completed) {
      return {
        active: true,
        currentStep: progress.stepIndex,
        steps: TUTORIAL_STEPS,
      }
    }
  }
  return {
    active: true,
    currentStep: 0,
    steps: TUTORIAL_STEPS,
  }
}
