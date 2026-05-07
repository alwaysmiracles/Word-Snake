'use client'

import { useState, useSyncExternalStore } from 'react'
import SnakeGame from '@/components/snake-game'
import MakePoem from '@/components/make-poem'
import { useWordStore } from '@/lib/word-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Gamepad2, BookOpen } from 'lucide-react'

type Page = 'game' | 'poem'

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('game')
  const { getTotalCount } = useWordStore()

  // Handle hydration by using useSyncExternalStore
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const totalCount = mounted ? getTotalCount() : 0

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-[1100px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐍</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent">
              Word Snake
            </h1>
          </div>

          <nav className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentPage('game')}
              variant={currentPage === 'game' ? 'default' : 'ghost'}
              className={
                currentPage === 'game'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }
            >
              <Gamepad2 className="h-4 w-4 mr-1.5" />
              Game
            </Button>
            <Button
              onClick={() => setCurrentPage('poem')}
              variant={currentPage === 'poem' ? 'default' : 'ghost'}
              className={
                currentPage === 'poem'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }
            >
              <BookOpen className="h-4 w-4 mr-1.5" />
              Make Poem
            </Button>
            {mounted && totalCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-amber-900/50 text-amber-400 border-amber-700 ml-2"
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
          <span>Word Snake — Collect words, create poetry</span>
          <span>Arrow Keys / WASD to move • Space to pause</span>
        </div>
      </footer>
    </div>
  )
}
