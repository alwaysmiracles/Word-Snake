'use client'

import { useState, useMemo } from 'react'
import { useWordStore } from '@/lib/word-store'
import { getWordDefinition } from '@/lib/word-definitions'
import {
  CATEGORY_COLORS,
  WORD_ENTRIES,
  getRarityForPoints,
  type WordCategory,
  type WordRarity,
  RARITY_CONFIG,
} from '@/lib/word-pool'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, BookOpen, Lock, Star, X } from 'lucide-react'

// ─── Constants ───────────────────────────────────────────────────────────────

const ALL_CATEGORIES: WordCategory[] = [
  'nature',
  'emotion',
  'element',
  'time',
  'creature',
  'quality',
  'object',
  'action',
]

const CATEGORY_LABELS: Record<WordCategory, string> = {
  nature: 'Nature',
  emotion: 'Emotion',
  element: 'Element',
  time: 'Time',
  creature: 'Creature',
  quality: 'Quality',
  object: 'Object',
  action: 'Action',
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface WordBookProps {
  isOpen: boolean
  onClose: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function WordBook({ isOpen, onClose }: WordBookProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | WordCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const collectedWords = useWordStore((s) => s.collectedWords)

  // ── Derived data ─────────────────────────────────────────────────────────

  const discoveredSet = useMemo(
    () => new Set(Object.keys(collectedWords)),
    [collectedWords],
  )

  const totalWords = WORD_ENTRIES.length
  const discoveredCount = discoveredSet.size
  const progressPercent = totalWords > 0 ? (discoveredCount / totalWords) * 100 : 0

  const categoryStats = useMemo(() => {
    const stats = {} as Record<WordCategory, { total: number; discovered: number }>
    for (const cat of ALL_CATEGORIES) {
      const wordsInCat = WORD_ENTRIES.filter((e) => e.category === cat)
      stats[cat] = {
        total: wordsInCat.length,
        discovered: wordsInCat.filter((e) => discoveredSet.has(e.word)).length,
      }
    }
    return stats
  }, [discoveredSet])

  const rarityStats = useMemo(() => {
    const stats: Record<WordRarity, { discovered: number; total: number }> = {
      common: { discovered: 0, total: 0 },
      uncommon: { discovered: 0, total: 0 },
      rare: { discovered: 0, total: 0 },
      legendary: { discovered: 0, total: 0 },
    }
    for (const entry of WORD_ENTRIES) {
      const rarity = getRarityForPoints(entry.points)
      stats[rarity].total++
      if (discoveredSet.has(entry.word)) {
        stats[rarity].discovered++
      }
    }
    return stats
  }, [discoveredSet])

  const filteredWords = useMemo(() => {
    let words = WORD_ENTRIES
    if (activeCategory !== 'all') {
      words = words.filter((e) => e.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      words = words.filter((e) => e.word.toLowerCase().includes(q))
    }
    return words
  }, [activeCategory, searchQuery])

  const getCount = (cat: 'all' | WordCategory) =>
    cat === 'all' ? discoveredCount : categoryStats[cat].discovered

  const getTotal = (cat: 'all' | WordCategory) =>
    cat === 'all' ? totalWords : categoryStats[cat].total

  // ── Render ───────────────────────────────────────────────────────────────

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Main Card */}
      <Card
        className="relative z-10 flex w-full max-w-[900px] flex-col overflow-hidden border-slate-800 bg-slate-950/95 text-slate-100 shadow-2xl"
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-b border-slate-800 px-5 py-4 sm:px-6 sm:py-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                <BookOpen className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-slate-100">
                  Word Collection
                </CardTitle>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Overall Progress</span>
              <span className="font-medium text-slate-300">
                {discoveredCount} / {totalWords} words discovered
                {progressPercent > 0 && (
                  <span className="ml-1.5 text-xs text-slate-500">
                    ({progressPercent.toFixed(1)}%)
                  </span>
                )}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Category Tabs ─────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-b border-slate-800 px-3 py-2 sm:px-4">
          <div className="scrollbar-none flex gap-1 overflow-x-auto pb-0.5">
            {/* "All" tab */}
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                activeCategory === 'all'
                  ? 'bg-slate-700 text-slate-100'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              All
              <span className="ml-0.5 text-xs opacity-60">
                {getCount('all')}/{getTotal('all')}
              </span>
            </button>

            {/* Per-category tabs */}
            {ALL_CATEGORIES.map((cat) => {
              const color = CATEGORY_COLORS[cat]
              const isActive = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    isActive ? 'text-slate-100' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: `${color}20`, boxShadow: `0 0 12px ${color}15` }
                      : undefined
                  }
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {CATEGORY_LABELS[cat]}
                  <span className="ml-0.5 text-xs opacity-60">
                    {getCount(cat)}/{getTotal(cat)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Search Bar ────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-b border-slate-800 px-5 py-3 sm:px-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search words..."
              className="border-slate-700 bg-slate-900/80 pl-9 pr-16 text-sm text-slate-200 placeholder:text-slate-500 focus-visible:ring-slate-600"
            />
            {searchQuery.trim() && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums text-slate-500">
                {filteredWords.length} found
              </span>
            )}
          </div>
        </div>

        {/* ── Scrollable Content ────────────────────────────────────────── */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-5 sm:p-6 space-y-6">
            {/* ── Stats Summary ────────────────────────────────────────── */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Collection Stats
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Category Progress */}
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                  <p className="mb-2 text-xs font-medium text-slate-400">
                    Category Progress
                  </p>
                  <div className="space-y-1.5">
                    {ALL_CATEGORIES.map((cat) => {
                      const st = categoryStats[cat]
                      const pct = st.total > 0 ? (st.discovered / st.total) * 100 : 0
                      const color = CATEGORY_COLORS[cat]
                      return (
                        <div key={cat} className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="w-14 shrink-0 text-[11px] text-slate-400 sm:w-16">
                            {CATEGORY_LABELS[cat]}
                          </span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: color }}
                            />
                          </div>
                          <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-slate-500">
                            {st.discovered}/{st.total}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Rarity Breakdown */}
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                  <p className="mb-2 text-xs font-medium text-slate-400">
                    Rarity Breakdown
                  </p>
                  <div className="space-y-2.5">
                    {(Object.keys(RARITY_CONFIG) as WordRarity[]).map((rarity) => {
                      const cfg = RARITY_CONFIG[rarity]
                      const st = rarityStats[rarity]
                      const pct = st.total > 0 ? (st.discovered / st.total) * 100 : 0
                      return (
                        <div key={rarity} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: cfg.color }}
                              />
                              <span className="text-xs text-slate-300">
                                {cfg.label}
                              </span>
                            </div>
                            <span className="text-xs tabular-nums text-slate-500">
                              {st.discovered} / {st.total}
                            </span>
                          </div>
                          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: cfg.color }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Word Grid ────────────────────────────────────────────── */}
            <section>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredWords.map((entry) => {
                  const isDiscovered = discoveredSet.has(entry.word)
                  const def = isDiscovered ? getWordDefinition(entry.word) : undefined
                  const rarity = getRarityForPoints(entry.points)
                  const rarityCfg = RARITY_CONFIG[rarity]
                  const catColor = CATEGORY_COLORS[entry.category]

                  return (
                    <Card
                      key={entry.word}
                      className={`group relative overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
                        isDiscovered
                          ? 'border-slate-700 bg-slate-900 hover:border-slate-600'
                          : 'border-slate-800 bg-slate-900/30 opacity-50 grayscale-[30%]'
                      }`}
                      style={
                        isDiscovered
                          ? {
                              boxShadow: `0 0 20px ${catColor}12, 0 0 40px ${catColor}06`,
                              borderLeftColor: `${catColor}40`,
                            }
                          : undefined
                      }
                    >
                      {/* Category accent bar for discovered cards */}
                      {isDiscovered && (
                        <div
                          className="absolute left-0 top-0 h-full w-0.5"
                          style={{ backgroundColor: catColor }}
                        />
                      )}

                      <CardContent className="p-4">
                        {/* Word Header */}
                        <div className="mb-2.5 flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            {isDiscovered ? (
                              <h4
                                className="text-lg font-bold capitalize tracking-wide"
                                style={{ color: catColor }}
                              >
                                {entry.word}
                              </h4>
                            ) : (
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <Lock className="h-3.5 w-3.5" />
                                <span className="text-lg font-bold tracking-[0.2em]">
                                  ???
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-1 rounded-md bg-slate-800/60 px-1.5 py-0.5">
                            <Star className="h-3 w-3 text-amber-400" />
                            <span className="text-xs font-semibold text-amber-400">
                              {entry.points}
                            </span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="mb-3 flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="gap-1 border-slate-700 text-[11px] text-slate-400"
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: catColor }}
                            />
                            {CATEGORY_LABELS[entry.category]}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[11px]"
                            style={{
                              borderColor: `${rarityCfg.color}35`,
                              color: rarityCfg.color,
                            }}
                          >
                            {rarityCfg.emoji && (
                              <span className="mr-0.5">{rarityCfg.emoji}</span>
                            )}
                            {rarityCfg.label}
                          </Badge>
                        </div>

                        {/* Definition Area */}
                        {isDiscovered && def ? (
                          <div className="space-y-2">
                            <p className="text-[13px] leading-relaxed text-slate-300">
                              {def.definition}
                            </p>
                            {def.example && (
                              <p className="text-xs italic text-slate-500">
                                &ldquo;{def.example}&rdquo;
                              </p>
                            )}
                            {def.etymology && (
                              <p className="flex items-start gap-1 text-[11px] text-slate-600">
                                <BookOpen className="mt-0.5 h-3 w-3 shrink-0" />
                                {def.etymology}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 rounded-md border border-dashed border-slate-700/50 bg-slate-800/20 px-3 py-2.5">
                            <Lock className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                            <p className="text-xs text-slate-600">
                              Not yet discovered &mdash; play to find this word!
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Empty state */}
              {filteredWords.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <Search className="mb-3 h-8 w-8 opacity-40" />
                  <p className="text-sm">No words found matching your search.</p>
                </div>
              )}
            </section>
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}
