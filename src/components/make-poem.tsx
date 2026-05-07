'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useWordStore } from '@/lib/word-store'
import { getWordEntry, CATEGORY_COLORS, getCategoryInfo, type WordCategory } from '@/lib/word-pool'
import { playPoemSound } from '@/lib/sounds'
import { checkAchievements, getUnlockedAchievements, ACHIEVEMENTS, type AchievementStats } from '@/lib/achievements'
import { getStreak, getActiveStreakBonus, type StreakInfo } from '@/lib/streak'
import { getLeaderboard, getBestScore, type Difficulty, type LeaderboardEntry } from '@/lib/leaderboard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { getWordDefinition } from '@/lib/word-definitions'
import {
  Sparkles,
  Loader2,
  BookOpen,
  AlertCircle,
  Copy,
  Check,
  Trash2,
  Download,
  Trophy,
  Palette,
  Flame,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

type PoemStyle = 'free_verse' | 'haiku' | 'limerick' | 'sonnet'

const POEM_STYLES: Record<PoemStyle, { label: string; emoji: string; desc: string }> = {
  free_verse: { label: 'Free Verse', emoji: '🕊️', desc: 'Lyrical & evocative' },
  haiku: { label: 'Haiku', emoji: '🎋', desc: '5-7-5 syllables' },
  limerick: { label: 'Limerick', emoji: '🎭', desc: 'Witty & playful' },
  sonnet: { label: 'Sonnet', emoji: '🌹', desc: '14 lines, iambic' },
}

interface PoemResult {
  poem: string
  usedWords: string[]
  timestamp: number
  style: PoemStyle
}

// Confetti component
function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number; rotation: number; rotationSpeed: number; life: number }[] = []
    const colors = ['#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#06b6d4']

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        life: 1,
      })
    }

    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.1
        p.vx *= 0.99
        p.rotation += p.rotationSpeed
        p.life -= 0.005
        if (p.life <= 0) continue
        alive = true
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        ctx.restore()
      }
      if (alive) {
        animId = requestAnimationFrame(animate)
      } else {
        canvas.remove()
      }
    }
    animId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animId)
      canvas?.remove()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}

// Achievement toast
function AchievementToast({ achievement, onClose }: { achievement: { title: string; description: string; emoji: string }; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-20 right-4 z-[90] animate-in slide-in-from-right-5 fade-in duration-500">
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-900/90 border border-amber-600/50 shadow-xl shadow-amber-900/30 backdrop-blur-sm">
        <span className="text-2xl">{achievement.emoji}</span>
        <div>
          <p className="text-amber-300 text-sm font-bold">{achievement.title}</p>
          <p className="text-amber-400/80 text-xs">{achievement.description}</p>
        </div>
        <Sparkles className="h-4 w-4 text-amber-500 sparkle-spin" />
      </div>
    </div>
  )
}

export default function MakePoem() {
  const { removeWords, getWordList, getTotalCount, clearAll } = useWordStore()
  const [loading, setLoading] = useState(false)
  const [poemResult, setPoemResult] = useState<PoemResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [poemHistory, setPoemHistory] = useState<PoemResult[]>([])
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [poemStyle, setPoemStyle] = useState<PoemStyle>('free_verse')
  const [showConfetti, setShowConfetti] = useState(false)
  const [achievementToast, setAchievementToast] = useState<{ title: string; description: string; emoji: string } | null>(null)
  const [unlockedIds, setUnlockedIds] = useState<string[]>([])
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [leaderboardTab, setLeaderboardTab] = useState<Difficulty>('medium')

  const wordList = getWordList()
  const totalCount = getTotalCount()
  const hasWords = wordList.length > 0

  // Load unlocked achievements and streak
  useEffect(() => {
    setUnlockedIds(getUnlockedAchievements())
    setStreakInfo(getStreak())
  }, [])

  const handleAchievementCheck = useCallback((extraStats?: Partial<AchievementStats>) => {
    const categories = [...new Set(wordList.map(({ word }) => {
      const entry = getWordEntry(word)
      return entry?.category
    }).filter(Boolean))] as string[]

    const stats: AchievementStats = {
      totalWordsCollected: totalCount,
      totalWordsEaten: totalCount,
      poemsCreated: poemHistory.length + (poemResult ? 1 : 0),
      highScore: parseInt(localStorage.getItem('word-snake-highscore') ?? '0', 10),
      categories,
      gamesPlayed: parseInt(localStorage.getItem('word-snake-games') ?? '0', 10),
      ...extraStats,
    }

    const newlyUnlocked = checkAchievements(stats)
    if (newlyUnlocked.length > 0) {
      setUnlockedIds(getUnlockedAchievements())
      const first = newlyUnlocked[0]
      setAchievementToast({ title: first.title, description: first.description, emoji: first.emoji })
    }
  }, [wordList, totalCount, poemHistory, poemResult])

  const handleMakePoem = async () => {
    if (!hasWords) return

    setLoading(true)
    setError(null)
    setPoemResult(null)

    try {
      const wordsToSend: string[] = []
      for (const { word, count } of wordList) {
        for (let i = 0; i < count; i++) {
          wordsToSend.push(word)
        }
      }

      const response = await fetch('/api/poem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words: wordsToSend, style: poemStyle }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate poem')
      }

      const result: PoemResult = {
        poem: data.poem,
        usedWords: data.usedWords || [],
        timestamp: Date.now(),
        style: (data.style as PoemStyle) || poemStyle,
      }

      setPoemResult(result)
      setPoemHistory((prev) => [result, ...prev])

      if (result.usedWords.length > 0) {
        removeWords(result.usedWords)
      }
      playPoemSound()
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)

      // Check achievements after a short delay so state updates
      setTimeout(() => {
        handleAchievementCheck({ poemsCreated: poemHistory.length + 1 })
      }, 100)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      )
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const downloadPoemAsImage = async (poem: PoemResult) => {
    const canvas = document.createElement('canvas')
    const width = 600
    const padding = 40
    const lineHeight = 24
    const lines = poem.poem.split('\n')
    const titleHeight = 50
    const styleLabel = POEM_STYLES[poem.style]?.label ?? 'Poem'
    const wordsHeight = poem.usedWords.length > 0 ? 40 : 0
    const height = padding * 2 + titleHeight + lines.length * lineHeight + wordsHeight + 20

    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const grad = ctx.createLinearGradient(0, 0, width, height)
    grad.addColorStop(0, '#1e1b4b')
    grad.addColorStop(0.5, '#0f172a')
    grad.addColorStop(1, '#1a0533')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = '#7c3aed40'
    ctx.lineWidth = 2
    ctx.roundRect(8, 8, width - 16, height - 16, 12)
    ctx.stroke()

    ctx.fillStyle = '#c084fc'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('✨ Word Snake Poem', width / 2, padding + 20)

    ctx.fillStyle = '#7c3aed'
    ctx.font = '11px sans-serif'
    ctx.fillText(styleLabel, width / 2, padding + 38)

    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'italic 14px serif'
    ctx.textAlign = 'left'
    let y = padding + titleHeight + 10
    for (const line of lines) {
      ctx.fillText(line, padding, y)
      y += lineHeight
    }

    if (poem.usedWords.length > 0) {
      y += 10
      ctx.fillStyle = '#64748b'
      ctx.font = '11px sans-serif'
      ctx.fillText('Words: ' + poem.usedWords.join(', '), padding, y)
    }

    const link = document.createElement('a')
    link.download = `word-snake-poem-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  // Category stats
  const categoryStats = wordList.reduce<Record<string, number>>((acc, { word, count }) => {
    const entry = getWordEntry(word)
    const cat = entry?.category ?? 'unknown'
    acc[cat] = (acc[cat] || 0) + count
    return acc
  }, {})

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-[1100px] mx-auto">
      {showConfetti && <Confetti />}
      {achievementToast && (
        <AchievementToast
          achievement={achievementToast}
          onClose={() => setAchievementToast(null)}
        />
      )}

      {/* Poem Generation Area */}
      <div className="flex-1 min-w-0">
        <Card className="border-slate-700 bg-slate-900 h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Poetry Workshop
              </CardTitle>
              <Badge variant="secondary" className="bg-purple-900/50 text-purple-400 border-purple-700">
                {poemHistory.length} poem{poemHistory.length !== 1 ? 's' : ''} crafted
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Poem Style Selector with glow on selected */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs text-slate-500 font-medium">Poem Style</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.entries(POEM_STYLES) as [PoemStyle, typeof POEM_STYLES.free_verse][]).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setPoemStyle(key)}
                    className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border transition-all duration-200 text-center active:scale-95 ${
                      poemStyle === key
                        ? 'bg-purple-900/40 border-purple-600/50 text-purple-300 style-glow'
                        : 'bg-slate-800/40 border-slate-700/30 text-slate-500 hover:text-slate-300 hover:border-slate-600/50 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="text-base">{val.emoji}</span>
                    <span className="text-xs font-medium">{val.label}</span>
                    <span className="text-[10px] opacity-60">{val.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button with shimmer when active */}
            <div className="mb-6">
              <Button
                onClick={handleMakePoem}
                disabled={!hasWords || loading}
                className={`w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30 transition-all duration-200 active:scale-[0.98] relative overflow-hidden ${
                  hasWords && !loading ? 'btn-shimmer' : ''
                }`}
              >
                {loading ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Crafting your {POEM_STYLES[poemStyle].label.toLowerCase()}...</>
                ) : (
                  <><Sparkles className="h-5 w-5 mr-2" />{hasWords ? `Compose ${POEM_STYLES[poemStyle].label} with ${totalCount} Word${totalCount !== 1 ? 's' : ''}` : 'Collect Words in the Game First'}</>
                )}
              </Button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-700/50 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 text-sm font-medium">Generation Failed</p>
                  <p className="text-red-300/80 text-xs mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Current Poem Result with decorative border pattern */}
            {poemResult && (
              <div className="mb-6">
                <div className="poem-card-ornate p-5 rounded-lg bg-gradient-to-br from-purple-900/20 via-slate-800/80 to-slate-800/40 border border-purple-700/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-500/5 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-amber-500/5 to-transparent" />
                  {/* Decorative corner lines */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-t border-l border-purple-600/20 rounded-tl" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-t border-r border-purple-600/20 rounded-tr" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b border-l border-purple-600/20 rounded-bl" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b border-r border-purple-600/20 rounded-br" />

                  <div className="flex items-center justify-between mb-3 relative">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span className="text-purple-300 text-sm font-medium">Your Poem</span>
                      <Badge variant="secondary" className="bg-purple-900/30 text-purple-400 text-[10px] border-purple-700/30 px-1.5 h-4">
                        {POEM_STYLES[poemResult.style]?.label ?? 'Free Verse'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-400 hover:text-slate-200 active:scale-95 transition-transform" onClick={() => copyToClipboard(poemResult.poem, poemResult.timestamp)}>
                        {copiedId === poemResult.timestamp ? <><Check className="h-3.5 w-3.5 mr-1 text-green-400" /><span className="text-xs text-green-400">Copied!</span></> : <><Copy className="h-3.5 w-3.5 mr-1" /><span className="text-xs">Copy</span></>}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-400 hover:text-slate-200 active:scale-95 transition-transform" onClick={() => downloadPoemAsImage(poemResult)} title="Download as image">
                        <Download className="h-3.5 w-3.5 mr-1" /><span className="text-xs">Save</span>
                      </Button>
                    </div>
                  </div>
                  <div className="text-slate-200 leading-relaxed whitespace-pre-wrap font-serif italic text-base relative">
                    {poemResult.poem}
                  </div>
                  {poemResult.usedWords.length > 0 && (
                    <>
                      <Separator className="my-3 bg-slate-700/50" />
                      <TooltipProvider delayDuration={250}>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-slate-500 text-xs">Words woven in:</span>
                          {poemResult.usedWords.map((word, i) => {
                            const wordDef = getWordDefinition(word)
                            const entry = getWordEntry(word)
                            const catColor = entry ? CATEGORY_COLORS[entry.category] : '#94a3b8'
                            const catInfo = entry ? getCategoryInfo(entry.category) : null
                            return (
                              <Tooltip key={`${word}-${i}`}>
                                <TooltipTrigger asChild>
                                  <Badge variant="secondary" className="bg-purple-900/40 text-purple-300 text-xs border-purple-700/50 cursor-default hover:bg-purple-900/60 transition-colors">
                                    <span className="w-1.5 h-1.5 rounded-full mr-1 shrink-0" style={{ backgroundColor: catColor }} />
                                    {word}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="bottom"
                                  align="center"
                                  className="bg-slate-900 border border-slate-700 text-slate-200 shadow-xl shadow-slate-900/50 rounded-lg px-3 py-2.5 max-w-[240px]"
                                >
                                  {wordDef ? (
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: catColor }} />
                                        <span className="font-bold text-sm text-white">{word}</span>
                                        {catInfo && (
                                          <span className="text-[10px] text-slate-400 ml-0.5">{catInfo.label}</span>
                                        )}
                                      </div>
                                      <p className="text-xs text-slate-300 leading-relaxed">{wordDef.definition}</p>
                                      <p className="text-xs text-slate-400 italic leading-relaxed">&ldquo;{wordDef.example}&rdquo;</p>
                                    </div>
                                  ) : (
                                    <span className="font-bold text-sm text-white">{word}</span>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            )
                          })}
                        </div>
                      </TooltipProvider>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Poem History with hover elevation */}
            {poemHistory.length > 1 && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Previous Poems
                  <Badge variant="secondary" className="bg-slate-800 text-slate-500 text-[10px] h-4 px-1.5 ml-1">{poemHistory.length - 1}</Badge>
                </h3>
                <ScrollArea className="h-[250px]">
                  <div className="space-y-3 pr-2">
                    {poemHistory.slice(1).map((poem) => (
                      <div key={poem.timestamp} className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-slate-600/50 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all duration-200 relative group">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-purple-900/20 text-purple-400 text-[10px] border-purple-700/20 px-1.5 h-4">
                            {POEM_STYLES[poem.style]?.label ?? 'Free Verse'}
                          </Badge>
                        </div>
                        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap font-serif italic text-sm">{poem.poem}</div>
                        {poem.usedWords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {poem.usedWords.map((word, i) => (
                              <Badge key={`${word}-${i}`} variant="secondary" className="bg-slate-700/60 text-slate-400 text-xs">{word}</Badge>
                            ))}
                          </div>
                        )}
                        <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-300 active:scale-95" onClick={() => copyToClipboard(poem.poem, poem.timestamp)}>
                          {copiedId === poem.timestamp ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Empty State with pulsing sparkle */}
            {!poemResult && !loading && poemHistory.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <div className="relative inline-block">
                  <p className="text-5xl mb-4 sparkle-pulse">✨</p>
                  <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-xl" />
                </div>
                <p className="text-lg font-medium text-slate-400">Your poems will appear here</p>
                <p className="text-sm mt-2 max-w-sm mx-auto leading-relaxed">
                  Collect words by playing the Snake game, then come back here to weave them into poetry
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="flex items-center gap-1 text-xs text-slate-600"><span className="w-2 h-2 rounded-full bg-green-500" />Collect</div>
                  <span className="text-slate-700">→</span>
                  <div className="flex items-center gap-1 text-xs text-slate-600"><span className="w-2 h-2 rounded-full bg-purple-500" />Compose</div>
                  <span className="text-slate-700">→</span>
                  <div className="flex items-center gap-1 text-xs text-slate-600"><span className="w-2 h-2 rounded-full bg-amber-500" />Create</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Word Collection Sidebar */}
      <div className={`w-full lg:w-72 shrink-0 flex flex-col gap-4 ${sidebarOpen ? 'block' : 'hidden lg:flex'}`}>
        <Card className="border-slate-700 bg-slate-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-amber-400 text-base flex items-center gap-2">📚 Word Bank</CardTitle>
              <div className="flex items-center gap-2">
                {hasWords && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-500 hover:text-red-400 active:scale-95 transition-transform" onClick={clearAll} title="Clear all words">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
                <Badge variant="secondary" className="bg-amber-900/50 text-amber-400 border-amber-700 text-xs">{totalCount}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Category breakdown */}
            {Object.keys(categoryStats).length > 0 && (
              <div className="mb-3 p-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-medium">Categories</div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(categoryStats).map(([cat, count]) => {
                    const catInfo = getCategoryInfo(cat as WordCategory)
                    const catColor = CATEGORY_COLORS[cat as WordCategory] ?? '#94a3b8'
                    return (
                      <div key={cat} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border" style={{ borderColor: `${catColor}30`, backgroundColor: `${catColor}10`, color: catColor }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                        {catInfo?.label ?? cat}: {count}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {wordList.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <p className="text-2xl mb-1">📝</p>
                <p className="text-sm">Word bank is empty</p>
                <p className="text-xs mt-1">Play the Snake game to fill it up!</p>
              </div>
            ) : (
              <TooltipProvider delayDuration={250}>
                <ScrollArea className="h-[300px] lg:h-[360px]">
                  <div className="space-y-1 pr-2 custom-scrollbar">
                    {wordList.map(({ word, count }) => {
                      const entry = getWordEntry(word)
                      const catColor = entry ? CATEGORY_COLORS[entry.category] : '#94a3b8'
                      const catInfo = entry ? getCategoryInfo(entry.category) : null
                      const wordDef = getWordDefinition(word)
                      return (
                        <Tooltip key={word}>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-800/60 border border-slate-700/50 group hover:bg-slate-800 hover:border-amber-700/50 transition-all duration-200 cursor-default">
                              <span className="text-amber-300 text-sm font-mono flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-125" style={{ backgroundColor: catColor }} />
                                {word}
                                {/* Category emoji on hover */}
                                {catInfo && (
                                  <span className="text-[10px] opacity-0 group-hover:opacity-60 transition-opacity duration-200">
                                    {catInfo.emoji}
                                  </span>
                                )}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {entry && <span className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">{entry.points}pt{entry.points !== 1 ? 's' : ''}</span>}
                                {count > 1 && <Badge variant="secondary" className="bg-amber-800/40 text-amber-300 text-xs h-5 min-w-[20px] flex items-center justify-center">×{count}</Badge>}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="left"
                            align="center"
                            className="bg-slate-900 border border-slate-700 text-slate-200 shadow-xl shadow-slate-900/50 rounded-lg px-3 py-2.5 max-w-[240px]"
                          >
                            {wordDef ? (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: catColor }} />
                                  <span className="font-bold text-sm text-white">{word}</span>
                                  {catInfo && (
                                    <span className="text-[10px] text-slate-400 ml-0.5">{catInfo.label}</span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">{wordDef.definition}</p>
                                <p className="text-xs text-slate-400 italic leading-relaxed">&ldquo;{wordDef.example}&rdquo;</p>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="font-bold text-sm text-white">{word}</span>
                                {catInfo && (
                                  <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                                    <span className="text-[10px] text-slate-400">{catInfo.label}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                </ScrollArea>
              </TooltipProvider>
            )}
          </CardContent>
        </Card>

        {/* Streak Badge */}
        {streakInfo && streakInfo.currentStreak > 0 && (() => {
          const activeBonus = getActiveStreakBonus(streakInfo.currentStreak)
          return (
            <div className="px-3 py-2.5 rounded-lg bg-gradient-to-r from-amber-900/15 to-orange-900/10 border border-amber-700/30 flex items-center gap-2.5">
              <Flame className="h-5 w-5 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="text-amber-300 font-bold">{streakInfo.currentStreak}-day streak</span>
                {activeBonus && (
                  <span className="text-amber-400/80"> — {activeBonus.name} ({activeBonus.multiplier}× bonus)</span>
                )}
                {!activeBonus && (
                  <span className="text-amber-500/60 block text-[10px] mt-0.5">Keep going for rewards!</span>
                )}
              </div>
            </div>
          )
        })()}

        {/* Leaderboard Section */}
        <Card className="border-slate-700 bg-slate-900">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
                🏆 Leaderboard
              </CardTitle>
              <div className="flex items-center gap-1">
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setLeaderboardTab(diff)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all duration-200 ${
                      leaderboardTab === diff
                        ? diff === 'easy'
                          ? 'bg-green-900/60 text-green-400 border border-green-700/50'
                          : diff === 'medium'
                          ? 'bg-amber-900/60 text-amber-400 border border-amber-700/50'
                          : 'bg-red-900/60 text-red-400 border border-red-700/50'
                        : 'bg-slate-800/40 text-slate-500 border border-slate-700/30 hover:text-slate-300'
                    }`}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {(() => {
              const entries = getLeaderboard(leaderboardTab).slice(0, 5)
              const bestScore = getBestScore(leaderboardTab)
              if (entries.length === 0) {
                return (
                  <div className="text-center py-4 text-slate-500">
                    <p className="text-sm">No scores yet</p>
                    <p className="text-[10px] mt-1">Play to set a record!</p>
                  </div>
                )
              }
              return (
                <div className="space-y-0.5">
                  {entries.map((entry, i) => {
                    const rank = i + 1
                    const rankEmoji = rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : ''
                    const isBest = entry.score === bestScore && rank === 1
                    const dateStr = (() => {
                      try {
                        const d = new Date(entry.date)
                        return `${d.getMonth() + 1}/${d.getDate()}`
                      } catch { return '' }
                    })()
                    return (
                      <div
                        key={`${entry.date}-${i}`}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] transition-all ${
                          isBest
                            ? 'bg-amber-900/20 border border-amber-700/30 shadow-sm shadow-amber-900/20'
                            : 'bg-slate-800/30 border border-transparent'
                        }`}
                      >
                        <span className="w-4 text-center shrink-0">
                          {rankEmoji || <span className="text-slate-500">{rank}</span>}
                        </span>
                        <span className={`font-mono font-bold ${isBest ? 'text-amber-300' : 'text-slate-300'}`}>
                          {entry.score}
                        </span>
                        <span className="text-slate-500 text-[10px]">
                          {entry.wordsEaten}w
                        </span>
                        {dateStr && (
                          <span className="text-slate-600 text-[10px] ml-auto">
                            {dateStr}
                          </span>
                        )}
                        {entry.isDailyChallenge && (
                          <span className="text-[9px] text-amber-500/70">📅</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </CardContent>
        </Card>

        {/* Achievements Card */}
        <Card className="border-slate-700 bg-slate-900">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Achievements
              </CardTitle>
              <Badge variant="secondary" className="bg-amber-900/30 text-amber-500 text-[10px] border-amber-700/30">
                {unlockedIds.length}/{ACHIEVEMENTS.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[140px]">
              <div className="space-y-1 pr-2 custom-scrollbar">
                {ACHIEVEMENTS.map((a) => {
                  const unlocked = unlockedIds.includes(a.id)
                  return (
                    <div key={a.id} className={`flex items-center gap-2 px-2 py-1 rounded text-xs transition-all ${unlocked ? 'bg-amber-900/20 border border-amber-700/20' : 'bg-slate-800/30 border border-slate-700/20 opacity-40'}`}>
                      <span className={unlocked ? '' : 'grayscale'}>{a.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${unlocked ? 'text-amber-300' : 'text-slate-500'}`}>{a.title}</div>
                        <div className="text-[10px] text-slate-500 truncate">{a.description}</div>
                      </div>
                      {unlocked && <Check className="h-3 w-3 text-amber-500 shrink-0" />}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Mobile sidebar toggle */}
      <div className="flex justify-center lg:hidden mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-slate-400 hover:text-slate-200 text-xs gap-1 active:scale-95 transition-transform"
        >
          {sidebarOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {sidebarOpen ? 'Hide Sidebar' : `Word Bank (${totalCount})`}
        </Button>
      </div>
    </div>
  )
}
