'use client'

import { useState, useEffect } from 'react'
import SnakeGame from '@/components/snake-game'
import MakePoem from '@/components/make-poem'
import { useWordStore } from '@/lib/word-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Gamepad2, BookOpen, Sparkles } from 'lucide-react'

type Page = 'game' | 'poem'

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('game')
  const [mounted, setMounted] = useState(false)
  const { getTotalCount } = useWordStore()

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true) }, [])
  const totalCount = mounted ? getTotalCount() : 0

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-[1100px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-2xl">🐍</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">
                Word Snake
              </h1>
              <p className="text-[10px] text-slate-500 -mt-0.5 tracking-wider uppercase">Collect &bull; Create &bull; Compose</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentPage('game')}
              variant={currentPage === 'game' ? 'default' : 'ghost'}
              size="sm"
              className={
                currentPage === 'game'
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }
            >
              <Gamepad2 className="h-4 w-4 mr-1.5" />
              Game
            </Button>
            <Button
              onClick={() => setCurrentPage('poem')}
              variant={currentPage === 'poem' ? 'default' : 'ghost'}
              size="sm"
              className={
                currentPage === 'poem'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              Make Poem
            </Button>
            {mounted && totalCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-amber-900/50 text-amber-400 border border-amber-700/50 ml-2 animate-in fade-in slide-in-from-right-2 duration-300"
              >
                {totalCount} word{totalCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {currentPage === 'game' ? <SnakeGame /> : <MakePoem />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-3">
        <div className="max-w-[1100px] mx-auto px-4 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            Word Snake — Collect words, create poetry
          </span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">↑↓←→</kbd>
              Move
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">Space</kbd>
              Start / Pause
            </span>
          </span>
        </div>
      </footer>
    </div>
  )
}
