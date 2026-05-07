'use client'

import { useState, useEffect, useRef } from 'react'
import SnakeGame from '@/components/snake-game'
import MakePoem from '@/components/make-poem'
import { useWordStore } from '@/lib/word-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Gamepad2, Sparkles, Trophy, Flame, Zap } from 'lucide-react'

type Page = 'game' | 'poem'

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('game')
  const [mounted, setMounted] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const { getTotalCount } = useWordStore()
  useEffect(() => { setMounted(true) }, [])
  const totalCount = mounted ? getTotalCount() : 0

  const navigateTo = (page: Page) => {
    if (page === currentPage) return
    setTransitioning(true)
    setTimeout(() => {
      setCurrentPage(page)
      setTimeout(() => setTransitioning(false), 50)
    }, 200)
  }

  // Footer data
  const highScore = mounted ? parseInt(localStorage.getItem('word-snake-highscore') ?? '0', 10) : 0
  const streakInfo = mounted ? (() => {
    try {
      const stored = localStorage.getItem('word-snake-streak')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })() : null

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm">
        <div className="max-w-[1100px] mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo area with subtle background glow */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/15 rounded-full blur-md scale-150" />
              <span className="text-2xl relative z-10">🐍</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">
                Word Snake
              </h1>
              <p className="text-[10px] text-slate-500 -mt-0.5 tracking-wider uppercase">Collect &bull; Create &bull; Compose</p>
            </div>
          </div>

          {/* Navigation with pill indicator */}
          <nav className="flex items-center gap-1.5">
            <div className="relative flex items-center bg-slate-800/60 rounded-full p-0.5 border border-slate-700/40">
              {/* Sliding pill indicator */}
              <div
                className={`absolute top-0.5 bottom-0.5 rounded-full transition-all duration-300 ease-out ${
                  currentPage === 'game'
                    ? 'bg-green-600 shadow-lg shadow-green-900/30 left-0.5 w-[calc(50%-2px)]'
                    : 'bg-purple-600 shadow-lg shadow-purple-900/30 left-[calc(50%+1px)] w-[calc(50%-2px)]'
                }`}
              />
              <Button
                onClick={() => navigateTo('game')}
                variant="ghost"
                size="sm"
                className={`relative z-10 rounded-full px-3 py-1 h-7 text-xs font-medium transition-colors duration-200 ${
                  currentPage === 'game'
                    ? 'text-white hover:text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Gamepad2 className="h-3.5 w-3.5 mr-1" />
                Game
              </Button>
              <Button
                onClick={() => navigateTo('poem')}
                variant="ghost"
                size="sm"
                className={`relative z-10 rounded-full px-3 py-1 h-7 text-xs font-medium transition-colors duration-200 ${
                  currentPage === 'poem'
                    ? 'text-white hover:text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Make Poem
              </Button>
            </div>

            {/* Word count badge with pulse animation on change */}
            {mounted && totalCount > 0 && (
              <Badge
                key={totalCount}
                variant="secondary"
                className="bg-amber-900/50 text-amber-400 border border-amber-700/50 ml-1 badge-pulse"
              >
                <Zap className="h-3 w-3 mr-1" />
                {totalCount} word{totalCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </nav>
        </div>

        {/* Animated gradient line below header */}
        <div className="animate-gradient-line h-[2px] w-full opacity-60" />
      </header>

      {/* Main Content with transition */}
      <main className="flex-1 p-2 sm:p-4">
        <div
          className={`transition-all duration-200 ${
            transitioning
              ? 'opacity-0 translate-y-2'
              : 'opacity-100 translate-y-0'
          }`}
        >
          {currentPage === 'game' ? <SnakeGame /> : <MakePoem />}
        </div>
      </main>

      {/* Footer with gradient line and more info */}
      <footer className="relative">
        {/* Animated gradient line above footer */}
        <div className="animate-gradient-line h-[1px] w-full opacity-40" />
        <div className="bg-slate-900/80 py-3">
          <div className="max-w-[1100px] mx-auto px-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                Word Snake — Collect words, create poetry
              </span>
              <span className="text-slate-800">|</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-500 text-[10px] font-mono border border-slate-700/30">
                v1.0
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {streakInfo && streakInfo.currentStreak > 0 && (
                <span className="flex items-center gap-1 text-amber-500">
                  <Flame className="h-3 w-3" />
                  {streakInfo.currentStreak}-day streak
                </span>
              )}
              {mounted && totalCount > 0 && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Zap className="h-3 w-3" />
                  {totalCount} words
                </span>
              )}
              {highScore > 0 && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Trophy className="h-3 w-3" />
                  Best: {highScore}
                </span>
              )}
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">↑↓←→</kbd>
                Move
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">Space</kbd>
                Start / Pause
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
