export interface FavoritePoem {
  poem: string
  usedWords: string[]
  timestamp: number
  style: string
  favoritedAt: number
}

const STORAGE_KEY = 'word-snake-poem-favorites'

export function getFavoritePoems(): FavoritePoem[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

export function addFavoritePoem(poem: { poem: string; usedWords: string[]; timestamp: number; style: string }): FavoritePoem {
  const fav: FavoritePoem = {
    ...poem,
    favoritedAt: Date.now(),
  }
  const favorites = getFavoritePoems()
  // Don't add duplicate
  if (favorites.some(f => f.timestamp === poem.timestamp)) return fav
  favorites.unshift(fav)
  // Keep max 20 favorites
  if (favorites.length > 20) favorites.length = 20
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  return fav
}

export function removeFavoritePoem(timestamp: number): void {
  const favorites = getFavoritePoems().filter(f => f.timestamp !== timestamp)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
}

export function isFavoritePoem(timestamp: number): boolean {
  return getFavoritePoems().some(f => f.timestamp === timestamp)
}
