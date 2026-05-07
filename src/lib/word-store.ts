import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WordState {
  collectedWords: Record<string, number>
  addWord: (word: string) => void
  removeWords: (words: string[]) => void
  clearAll: () => void
  getTotalCount: () => number
  getWordList: () => { word: string; count: number }[]
}

export const useWordStore = create<WordState>()(
  persist(
    (set, get) => ({
      collectedWords: {},

      addWord: (word: string) => {
        set((state) => ({
          collectedWords: {
            ...state.collectedWords,
            [word]: (state.collectedWords[word] || 0) + 1,
          },
        }))
      },

      removeWords: (words: string[]) => {
        set((state) => {
          const newWords = { ...state.collectedWords }
          for (const word of words) {
            if (newWords[word]) {
              newWords[word] -= 1
              if (newWords[word] <= 0) {
                delete newWords[word]
              }
            }
          }
          return { collectedWords: newWords }
        })
      },

      clearAll: () => {
        set({ collectedWords: {} })
      },

      getTotalCount: () => {
        return Object.values(get().collectedWords).reduce(
          (sum, count) => sum + count,
          0
        )
      },

      getWordList: () => {
        return Object.entries(get().collectedWords).map(([word, count]) => ({
          word,
          count,
        }))
      },
    }),
    {
      name: 'snake-word-storage',
    }
  )
)
