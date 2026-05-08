'use client'

import type { MultilingualWord, LanguagePack, MultilingualLanguage } from '@/lib/multilingual-packs'
import type { WordCategory } from '@/lib/word-pool'
import { MULTILINGUAL_PACKS, isMultilingualPackUnlocked } from '@/lib/multilingual-packs'

// ─── Types & Constants ────────────────────────────────────────

/** A multilingual word formatted for active gameplay in Word Snake */
export type MultilingualGameWord = {
  word: string
  translation: string
  category: WordCategory
  language: MultilingualLanguage
  pronunciation?: string
  points: number
}

/** Points awarded per difficulty tier */
const DIFFICULTY_POINTS: Record<string, number> = {
  beginner: 10,
  intermediate: 15,
  advanced: 22,
}

/** Visual identifiers for each multilingual language */
export const MULTILINGUAL_PACK_ICONS: Record<MultilingualLanguage, { flag: string; emoji: string; color: string }> = {
  ko: { flag: '🇰🇷', emoji: '🎌', color: '#3b82f6' },
  fr: { flag: '🇫🇷', emoji: '🗼', color: '#8b5cf6' },
  es: { flag: '🇪🇸', emoji: '💃', color: '#ef4444' },
}

/** English and native labels for each supported language */
export const LANGUAGE_LABELS: Record<MultilingualLanguage, { english: string; native: string }> = {
  ko: { english: 'Korean', native: '한국어' },
  fr: { english: 'French', native: 'Français' },
  es: { english: 'Spanish', native: 'Español' },
}

/** Achievement IDs tied to multilingual collection milestones */
export const MULTILINGUAL_ACHIEVEMENT_IDS: string[] = [
  'polyglot_beginner',
  'polyglot_intermediate',
  'polyglot_master',
]

// ─── Helpers ───────────────────────────────────────────────────

/** Convert a raw MultilingualWord into game-ready format with difficulty-based points */
function toGameWord(w: MultilingualWord): MultilingualGameWord {
  return {
    word: w.word,
    translation: w.translation,
    category: w.category,
    language: w.language,
    pronunciation: w.pronunciation,
    points: DIFFICULTY_POINTS[w.difficulty] ?? 10,
  }
}

/** Resolve a pack by ID, or undefined if not found */
function findPack(packId: string): LanguagePack | undefined {
  return MULTILINGUAL_PACKS.find((p) => p.id === packId)
}

// ─── Core Functions ────────────────────────────────────────────

/** Convert every word in a pack into game format (empty array if pack missing) */
export function getActiveMultilingualWords(packId: string): MultilingualGameWord[] {
  const pack = findPack(packId)
  if (!pack) return []
  return pack.words.map(toGameWord)
}

/** Pick a random word from the pack, excluding already-eaten words; null if exhausted */
export function getRandomMultilingualWord(
  packId: string,
  excludeWords: Set<string>,
): MultilingualGameWord | null {
  const pack = findPack(packId)
  if (!pack) return null

  const available = pack.words.filter((w) => !excludeWords.has(w.word))
  if (available.length === 0) return null

  const pick = available[Math.floor(Math.random() * available.length)]
  return toGameWord(pick)
}

/** Compute collection progress for a pack (total, collected count, percent) */
export function getMultilingualPackProgress(
  packId: string,
  collectedWords: Set<string>,
): { total: number; collected: number; percent: number } {
  const pack = findPack(packId)
  const total = pack?.words.length ?? 0
  const collected = pack
    ? pack.words.filter((w) => collectedWords.has(w.word)).length
    : 0
  const percent = total > 0 ? Math.round((collected / total) * 100) : 0
  return { total, collected, percent }
}

/** Count collected words per language across all packs */
export function getTotalMultilingualCollection(
  allCollected: Set<string>,
): { korean: number; french: number; spanish: number; total: number } {
  let korean = 0, french = 0, spanish = 0

  for (const pack of MULTILINGUAL_PACKS) {
    for (const w of pack.words) {
      if (!allCollected.has(w.word)) continue
      if (w.language === 'ko') korean++
      else if (w.language === 'fr') french++
      else if (w.language === 'es') spanish++
    }
  }

  return { korean, french, spanish, total: korean + french + spanish }
}

// ─── Unlock / Pack Discovery ──────────────────────────────────

/** Check if at least one multilingual pack is unlocked in localStorage */
export function hasAnyUnlockedMultilingualPack(): boolean {
  return MULTILINGUAL_PACKS.some((pack) => isMultilingualPackUnlocked(pack.id))
}

/** Return IDs of all currently unlocked packs */
export function getUnlockedMultilingualPackIds(): string[] {
  return MULTILINGUAL_PACKS
    .filter((pack) => isMultilingualPackUnlocked(pack.id))
    .map((pack) => pack.id)
}

// ─── Achievements ──────────────────────────────────────────────

/**
 * Return IDs of newly earned achievements based on multilingual collection.
 *   beginner:      collected from 3+ languages
 *   intermediate:  10+ words in any single language
 *   master:        20+ words in any single language
 */
export function checkMultilingualAchievements(collected: Set<string>): string[] {
  const earned: string[] = []
  const stats = getTotalMultilingualCollection(collected)
  const langCounts = [stats.korean, stats.french, stats.spanish]
  const languagesActive = langCounts.filter((c) => c > 0).length

  if (languagesActive >= 3) earned.push('polyglot_beginner')
  if (langCounts.some((c) => c >= 10)) earned.push('polyglot_intermediate')
  if (langCounts.some((c) => c >= 20)) earned.push('polyglot_master')

  return earned
}
