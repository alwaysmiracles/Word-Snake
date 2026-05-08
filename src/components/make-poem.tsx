'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useWordStore } from '@/lib/word-store'
import { getWordEntry, CATEGORY_COLORS, getCategoryInfo, type WordCategory } from '@/lib/word-pool'
import { playPoemSound } from '@/lib/sounds'
import { isSpeechSupported, pronounceWord } from '@/lib/word-pronunciation'
import { checkAchievements, getUnlockedAchievements, ACHIEVEMENTS, type AchievementStats } from '@/lib/achievements'
import { AchievementQueue, type AchievementNotification } from '@/lib/achievement-queue'
import AchievementGallery from '@/components/achievement-gallery'
import { getStreak, getActiveStreakBonus, type StreakInfo } from '@/lib/streak'
import { getLeaderboard, getBestScore, type Difficulty, type LeaderboardEntry } from '@/lib/leaderboard'
import { getActivePack, WORD_PACKS, getPackCategoryInfo, PACK_CATEGORY_INFO } from '@/lib/word-packs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { getWordDefinition } from '@/lib/word-definitions'
import { getFavoritePoems, addFavoritePoem, removeFavoritePoem, isFavoritePoem, type FavoritePoem } from '@/lib/poem-favorites'
import { generateShareImage, sharePoem } from '@/lib/poem-share'
import { downloadPoemCollage, getCollagePoemSources, COLLAGE_LAYOUTS, type PoemCollageItem, type CollageLayout } from '@/lib/poem-collage'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { trackPoemCreated } from '@/lib/game-stats'
import GameStatsDialog from '@/components/game-stats'
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
  Heart,
  Star,
  Share,
  Volume1,
  LayoutGrid,
  Camera,
  ImageIcon,
} from 'lucide-react'

type PoemStyle = 'free_verse' | 'haiku' | 'limerick' | 'sonnet'

const POEM_STYLES: Record<PoemStyle, { label: string; emoji: string; desc: string }> = {
  free_verse: { label: 'Free Verse', emoji: '🕊️', desc: 'Lyrical & evocative' },
  haiku: { label: 'Haiku', emoji: '🎋', desc: '5-7-5 syllables' },
  limerick: { label: 'Limerick', emoji: '🎭', desc: 'Witty & playful' },
  sonnet: { label: 'Sonnet', emoji: '🌹', desc: '14 lines, iambic' },
}

// Module-level achievement queue for cascading toasts
const poemAchievementQueue = new AchievementQueue()

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

    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateSize()
    window.addEventListener('resize', updateSize)

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
      window.removeEventListener('resize', updateSize)
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
function AchievementToast({ achievement, queueSize, onClose }: { achievement: { title: string; description: string; emoji: string }; queueSize: number; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-20 right-4 z-[90] animate-in slide-in-from-right-5 fade-in duration-500">
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-900/90 border border-amber-600/50 shadow-xl shadow-amber-900/30 backdrop-blur-sm">
        <span className="text-2xl">{achievement.emoji}</span>
        <div>
          <p className="text-amber-300 text-sm font-bold">
            {achievement.title}
            {queueSize > 0 && (
              <span className="text-amber-400/70 text-xs font-normal ml-1.5">(+{queueSize} more)</span>
            )}
          </p>
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
  const [achievementQueueSize, setAchievementQueueSize] = useState(0)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [unlockedIds, setUnlockedIds] = useState<string[]>([])
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [leaderboardTab, setLeaderboardTab] = useState<Difficulty>('medium')
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())
  const [showAchievementGallery, setShowAchievementGallery] = useState(false)
  const [sharingId, setSharingId] = useState<number | null>(null)
  const [showGameStats, setShowGameStats] = useState(false)
  const [showCollageDialog, setShowCollageDialog] = useState(false)
  const [collageStep, setCollageStep] = useState<1 | 2 | 3>(1)
  const [selectedPoemKeys, setSelectedPoemKeys] = useState<Set<string>>(new Set())
  const [selectedLayout, setSelectedLayout] = useState<CollageLayout>(COLLAGE_LAYOUTS[0])
  const [collagePoems, setCollagePoems] = useState<PoemCollageItem[]>([])

  const wordList = getWordList()
  const totalCount = getTotalCount()
  const hasWords = wordList.length > 0

  // Load unlocked achievements and streak
  useEffect(() => {
    setUnlockedIds(getUnlockedAchievements())
    setStreakInfo(getStreak())
    // Load favorites
    const favs = getFavoritePoems()
    setFavoriteIds(new Set(favs.map(f => f.timestamp)))
  }, [])

  // Clean up achievement queue on unmount
  useEffect(() => {
    return () => {
      poemAchievementQueue.clear()
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const showNextPoemAchievement = useCallback(() => {
    const next = poemAchievementQueue.dequeue()
    if (next) {
      setAchievementToast(next)
      setAchievementQueueSize(poemAchievementQueue.size)
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => {
        setAchievementToast(null)
        setAchievementQueueSize(poemAchievementQueue.size)
        if (!poemAchievementQueue.isEmpty()) {
          toastTimerRef.current = setTimeout(() => {
            showNextPoemAchievement()
          }, 500)
        }
      }, 4000)
    }
  }, [])

  const enqueuePoemAchievements = useCallback((newlyUnlocked: AchievementNotification[]) => {
    const wasEmpty = poemAchievementQueue.isEmpty() && !achievementToast
    for (const a of newlyUnlocked) {
      poemAchievementQueue.enqueue(a)
    }
    setAchievementQueueSize(poemAchievementQueue.size)
    if (wasEmpty) {
      showNextPoemAchievement()
    }
  }, [achievementToast, showNextPoemAchievement])

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
      const notifications = newlyUnlocked.map(a => ({ title: a.title, description: a.description, emoji: a.emoji }))
      enqueuePoemAchievements(notifications)
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

      // Store recent poems for collage
      try {
        const stored = sessionStorage.getItem('word-snake-recent-poems')
        const recent = stored ? JSON.parse(stored) : []
        recent.unshift({ poem: result.poem, style: result.style, usedWords: result.usedWords, timestamp: result.timestamp })
        if (recent.length > 10) recent.length = 10
        sessionStorage.setItem('word-snake-recent-poems', JSON.stringify(recent))
      } catch { /* ignore */ }

      if (result.usedWords.length > 0) {
        removeWords(result.usedWords)
      }
      playPoemSound()
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)

      // Track poem stats
      trackPoemCreated(result.style, result.usedWords.length)

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

  const toggleFavorite = (poem: PoemResult) => {
    if (favoriteIds.has(poem.timestamp)) {
      removeFavoritePoem(poem.timestamp)
      setFavoriteIds(new Set([...favoriteIds].filter(id => id !== poem.timestamp)))
    } else {
      addFavoritePoem(poem)
      setFavoriteIds(new Set([...favoriteIds, poem.timestamp]))
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

  const handleSharePoem = async (poem: PoemResult) => {
    setSharingId(poem.timestamp)
    try {
      const styleLabel = POEM_STYLES[poem.style]?.label ?? 'Poem'
      const blob = await generateShareImage(poem.poem, styleLabel, poem.usedWords)
      await sharePoem(blob)
    } catch {
      // Silently handle share errors
    } finally {
      setSharingId(null)
    }
  }

  const downloadPoemAsImage = async (poem: PoemResult) => {
    const canvas = document.createElement('canvas')
    const width = 600
    const padding = 40
    const lineHeight = 24
    const maxWidth = width - padding * 2
    const rawLines = poem.poem.split('\n')
    const titleHeight = 50
    const styleLabel = POEM_STYLES[poem.style]?.label ?? 'Poem'

    // Word-wrap long lines
    const wrappedLines: string[] = []
    const measureCtx = document.createElement('canvas').getContext('2d')
    if (measureCtx) {
      measureCtx.font = 'italic 14px serif'
      for (const line of rawLines) {
        if (measureCtx.measureText(line).width <= maxWidth) {
          wrappedLines.push(line)
        } else {
          // Wrap by words
          const words = line.split(' ')
          let currentLine = ''
          for (const word of words) {
            const testLine = currentLine ? currentLine + ' ' + word : word
            if (measureCtx.measureText(testLine).width > maxWidth && currentLine) {
              wrappedLines.push(currentLine)
              currentLine = word
            } else {
              currentLine = testLine
            }
          }
          if (currentLine) wrappedLines.push(currentLine)
        }
      }
    } else {
      wrappedLines.push(...rawLines)
    }

    const wordsHeight = poem.usedWords.length > 0 ? 40 : 0
    const height = padding * 2 + titleHeight + wrappedLines.length * lineHeight + wordsHeight + 20

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
    for (const line of wrappedLines) {
      ctx.fillText(line, padding, y)
      y += lineHeight
    }

    if (poem.usedWords.length > 0) {
      y += 10
      ctx.fillStyle = '#64748b'
      ctx.font = '11px sans-serif'
      // Wrap used words display too
      const wordsStr = 'Words: ' + poem.usedWords.join(', ')
      if (ctx.measureText(wordsStr).width > maxWidth) {
        const line1 = 'Words: ' + poem.usedWords.slice(0, 5).join(', ')
        const rest = poem.usedWords.slice(5)
        if (rest.length > 0) {
          ctx.fillText(line1 + ',', padding, y)
          y += 16
          ctx.fillText(rest.join(', '), padding, y)
        } else {
          ctx.fillText(line1, padding, y)
        }
      } else {
        ctx.fillText(wordsStr, padding, y)
      }
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
          queueSize={achievementQueueSize}
          onClose={() => setAchievementToast(null)}
        />
      )}

      {/* Poem Generation Area */}
      <div className="flex-1 min-w-0">
        <Card className="border-slate-700 bg-slate-900 h-full card-shimmer-border">
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
                <div className="poem-card-ornate p-5 rounded-lg bg-gradient-to-br from-purple-900/20 via-slate-800/80 to-slate-800/40 border border-purple-700/30 relative overflow-hidden collage-card-float">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-500/5 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-amber-500/5 to-transparent" />
                  {/* Decorative corner lines */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-t border-l border-purple-500/30 rounded-tl" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-t border-r border-purple-500/30 rounded-tr" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b border-l border-purple-500/30 rounded-bl" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b border-r border-purple-500/30 rounded-br" />

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
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-400 hover:text-red-400 active:scale-95 transition-transform" onClick={() => toggleFavorite(poemResult)}>
                        <Heart className={`h-3.5 w-3.5 mr-1 ${favoriteIds.has(poemResult.timestamp) ? 'fill-red-400 text-red-400' : ''}`} />
                        <span className="text-xs">{favoriteIds.has(poemResult.timestamp) ? 'Saved' : 'Save'}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-400 hover:text-slate-200 active:scale-95 transition-transform" onClick={() => downloadPoemAsImage(poemResult)} title="Download as image">
                        <Download className="h-3.5 w-3.5 mr-1" /><span className="text-xs">Save</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-400 hover:text-purple-400 active:scale-95 transition-transform" onClick={() => handleSharePoem(poemResult)} disabled={sharingId === poemResult.timestamp} title="Share poem">
                        {sharingId === poemResult.timestamp ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Share className="h-3.5 w-3.5 mr-1" />}<span className="text-xs">Share</span>
                      </Button>
                    </div>
                  </div>
                  <div className="text-slate-200 leading-relaxed whitespace-pre-wrap font-serif italic text-base relative poem-typewriter">
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
                            const packCatInfo = !entry ? getPackCategoryInfo(word) : null
                            const displayColor = catColor !== '#94a3b8' ? catColor : packCatInfo?.color ?? '#94a3b8'
                            const displayCatInfo = catInfo ?? packCatInfo
                            return (
                              <Tooltip key={`${word}-${i}`}>
                                <TooltipTrigger asChild>
                                  <Badge variant="secondary" className="bg-purple-900/40 text-purple-300 text-xs border-purple-700/50 cursor-default hover:bg-purple-900/60 transition-colors">
                                    <span className="w-1.5 h-1.5 rounded-full mr-1 shrink-0" style={{ backgroundColor: displayColor }} />
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
                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: displayColor }} />
                                        <span className="font-bold text-sm text-white">{word}</span>
                                        {displayCatInfo && (
                                          <span className="text-[10px] text-slate-400 ml-0.5">{displayCatInfo.label}</span>
                                        )}
                                      </div>
                                      <p className="text-xs text-slate-300 leading-relaxed">{wordDef.definition}</p>
                                      <p className="text-xs text-slate-400 italic leading-relaxed">&ldquo;{wordDef.example}&rdquo;</p>
                                      {wordDef.etymology && (
                                        <p className="text-[10px] text-slate-500 mt-1 etymology-highlight">📖 {wordDef.etymology}</p>
                                      )}
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
                      <div key={poem.timestamp} className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-slate-600/50 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all duration-200 relative group card-hover-lift pack-card-enter">
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
                        <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-500 hover:text-red-400 active:scale-95" onClick={() => toggleFavorite(poem)}>
                            <Heart className={`h-3 w-3 ${favoriteIds.has(poem.timestamp) ? 'fill-red-400 text-red-400' : ''}`} />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-500 hover:text-slate-300 active:scale-95" onClick={() => copyToClipboard(poem.poem, poem.timestamp)}>
                            {copiedId === poem.timestamp ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-500 hover:text-purple-400 active:scale-95" onClick={() => handleSharePoem(poem)} disabled={sharingId === poem.timestamp} title="Share poem">
                            {sharingId === poem.timestamp ? <Loader2 className="h-3 w-3 animate-spin" /> : <Share className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Favorite Poems */}
            {(() => {
              const favPoems = getFavoritePoems()
              if (favPoems.length === 0) return null
              return (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-400" />
                    Favorite Poems
                    <Badge variant="secondary" className="bg-red-900/30 text-red-400 text-[10px] h-4 px-1.5 border-red-700/30">{favPoems.length}</Badge>
                  </h3>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-3 pr-2">
                      {favPoems.map((fav) => (
                        <div key={fav.timestamp} className="p-4 rounded-lg bg-gradient-to-br from-red-900/10 via-slate-800/40 to-slate-800/20 border border-red-700/20 hover:border-red-600/30 transition-all duration-200 relative group">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-purple-900/20 text-purple-400 text-[10px] border-purple-700/20 px-1.5 h-4">
                              {POEM_STYLES[fav.style as PoemStyle]?.label ?? 'Poem'}
                            </Badge>
                            <Badge variant="secondary" className="bg-red-900/20 text-red-400 text-[10px] border-red-700/20 px-1.5 h-4">
                              <Heart className="h-2.5 w-2.5 mr-0.5 fill-red-400" />
                              Favorite
                            </Badge>
                          </div>
                          <div className="text-slate-300 leading-relaxed whitespace-pre-wrap font-serif italic text-sm">{fav.poem}</div>
                          {fav.usedWords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {fav.usedWords.slice(0, 8).map((word, i) => (
                                <Badge key={`${word}-${i}`} variant="secondary" className="bg-slate-700/60 text-slate-400 text-xs">{word}</Badge>
                              ))}
                              {fav.usedWords.length > 8 && (
                                <Badge variant="secondary" className="bg-slate-700/40 text-slate-500 text-xs">+{fav.usedWords.length - 8}</Badge>
                              )}
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex items-center gap-0.5">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-400 hover:text-red-300 active:scale-95" onClick={() => {
                              removeFavoritePoem(fav.timestamp)
                              setFavoriteIds(new Set([...favoriteIds].filter(id => id !== fav.timestamp)))
                            }}>
                              <Heart className="h-3 w-3 fill-red-400" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity active:scale-95" onClick={() => copyToClipboard(fav.poem, fav.timestamp)}>
                              {copiedId === fav.timestamp ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )
            })()}

            {/* Poem Collage Button */}
            {(() => {
              const favCount = getFavoritePoems().length
              const totalAvailable = favCount + poemHistory.length
              if (totalAvailable < 2) return null
              return (
                <Button
                  onClick={() => {
                    const sources = getCollagePoemSources()
                    const allPoems: PoemCollageItem[] = []
                    const seen = new Set<string>()
                    for (const p of [...sources.favorites, ...sources.recent]) {
                      if (!seen.has(p.poem)) {
                        seen.add(p.poem)
                        allPoems.push(p)
                      }
                    }
                    setCollagePoems(allPoems.slice(0, 6))
                    setSelectedPoemKeys(new Set(allPoems.slice(0, Math.min(4, allPoems.length)).map((_, i) => String(i))))
                    setCollageStep(1)
                    setSelectedLayout(COLLAGE_LAYOUTS[0])
                    setShowCollageDialog(true)
                  }}
                  className="w-full mb-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium text-sm shadow-lg shadow-purple-900/20 transition-all duration-200 active:scale-[0.98]"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Create Collage
                </Button>
              )
            })()}

            {/* Empty State with pulsing sparkle */}
            {!poemResult && !loading && poemHistory.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <div className="relative inline-block">
                  <p className="text-5xl mb-4 gentle-float">✨</p>
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
                <Badge key={totalCount} variant="secondary" className="bg-amber-900/50 text-amber-400 border-amber-700 text-xs number-pop">{totalCount}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Active Word Pack badge */}
            {(() => {
              const packId = getActivePack()
              if (packId === 'default') return null
              const pack = WORD_PACKS.find(p => p.id === packId)
              if (!pack) return null
              return (
                <div className="mb-3 px-2.5 py-2 rounded-lg border" style={{ borderColor: `${pack.color}30`, backgroundColor: `${pack.color}08` }}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{pack.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium" style={{ color: pack.color }}>{pack.name}</span>
                        <Badge variant="secondary" className="text-[9px] h-4 px-1" style={{ backgroundColor: `${pack.color}15`, color: pack.color, borderColor: `${pack.color}30` }}>
                          {pack.words.length} words
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{pack.description}</p>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Category breakdown */}
            {Object.keys(categoryStats).length > 0 && (
              <div className="mb-3 p-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-medium">Categories</div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(categoryStats).map(([cat, count]) => {
                    const catInfo = getCategoryInfo(cat as WordCategory)
                    const catColor = CATEGORY_COLORS[cat as WordCategory] ?? PACK_CATEGORY_INFO[cat]?.color ?? '#94a3b8'
                    const packInfo = PACK_CATEGORY_INFO[cat]
                    return (
                      <div key={cat} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border" style={{ borderColor: `${catColor}30`, backgroundColor: `${catColor}10`, color: catColor }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                        {catInfo?.label ?? packInfo?.label ?? cat}: {count}
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
                      const packCatInfo = !entry ? getPackCategoryInfo(word) : null
                      const displayColor = catColor !== '#94a3b8' ? catColor : packCatInfo?.color ?? '#94a3b8'
                      const displayCatInfo = catInfo ?? packCatInfo
                      const wordDef = getWordDefinition(word)
                      return (
                        <Tooltip key={word}>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-800/60 border border-slate-700/50 group hover:bg-slate-800 hover:border-amber-700/50 transition-all duration-200 cursor-default word-item-highlight">
                              <span className="text-amber-300 text-sm font-mono flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-125" style={{ backgroundColor: displayColor }} />
                                {word}
                                {/* Category emoji on hover */}
                                {displayCatInfo && (
                                  <span className="text-[10px] opacity-0 group-hover:opacity-60 transition-opacity duration-200">
                                    {displayCatInfo.emoji}
                                  </span>
                                )}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {isSpeechSupported() && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); pronounceWord(word) }}
                                    className="opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity duration-200 text-slate-400 hover:text-cyan-400 pronounce-btn"
                                    title="Pronounce word"
                                  >
                                    <Volume1 className="h-3 w-3" />
                                  </button>
                                )}
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
                                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: displayColor }} />
                                  <span className="font-bold text-sm text-white">{word}</span>
                                  {displayCatInfo && (
                                    <span className="text-[10px] text-slate-400 ml-0.5">{displayCatInfo.label}</span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">{wordDef.definition}</p>
                                <p className="text-xs text-slate-400 italic leading-relaxed">&ldquo;{wordDef.example}&rdquo;</p>
                                {wordDef.etymology && (
                                  <p className="text-[10px] text-slate-500 mt-1 etymology-highlight">📖 {wordDef.etymology}</p>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="font-bold text-sm text-white">{word}</span>
                                {displayCatInfo && (
                                  <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: displayColor }} />
                                    <span className="text-[10px] text-slate-400">{displayCatInfo.label}</span>
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
              <Flame className="h-5 w-5 text-amber-400 shrink-0 streak-fire" />
              <div className="text-xs">
                <span className="text-amber-300 font-bold streak-fire">{streakInfo.currentStreak}-day streak</span>
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
                            ? 'bg-amber-900/20 border border-amber-700/30 shadow-sm shadow-amber-900/20 leaderboard-first'
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
            <button
              onClick={() => setShowAchievementGallery(true)}
              className="w-full mt-2 px-3 py-1.5 rounded-md bg-amber-900/20 border border-amber-700/30 text-amber-400 text-xs font-medium hover:bg-amber-900/30 hover:border-amber-600/40 transition-all duration-200 active:scale-[0.98]"
            >
              🏆 View All
            </button>
            <button
              onClick={() => setShowGameStats(true)}
              className="w-full mt-1.5 px-3 py-1.5 rounded-md bg-slate-800/40 border border-slate-700/30 text-slate-400 text-xs font-medium hover:bg-slate-800/60 hover:border-slate-600/40 hover:text-slate-300 transition-all duration-200 active:scale-[0.98]"
            >
              📊 Stats
            </button>
          </CardContent>
        </Card>

      {/* Poem Collage Dialog */}
      <Dialog open={showCollageDialog} onOpenChange={(open) => { setShowCollageDialog(open); if (!open) setCollageStep(1) }}>
        <DialogContent className="sm:max-w-[540px] max-h-[85vh] overflow-y-auto bg-slate-900 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-400">
              <ImageIcon className="h-5 w-5" />
              Poem Collage
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Combine your poems into a shareable image
            </DialogDescription>
          </DialogHeader>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-4">
            {([1, 2, 3] as const).map((step) => (
              <button
                key={step}
                onClick={() => setCollageStep(step)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  collageStep === step
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                    : step < collageStep
                      ? 'bg-purple-900/40 text-purple-400 hover:bg-purple-900/60'
                      : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                }`}
              >
                {step < collageStep ? <Check className="h-3 w-3" /> : <span className="w-4 h-4 flex items-center justify-center rounded-full bg-current/20 text-[10px]">{step}</span>}
                {step === 1 && 'Select'}
                {step === 2 && 'Layout'}
                {step === 3 && 'Generate'}
              </button>
            ))}
          </div>

          {/* Step 1: Select Poems */}
          {collageStep === 1 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Select poems (max 6):</span>
                <span className="text-xs text-slate-500">{selectedPoemKeys.size} selected</span>
              </div>
              <div className="flex gap-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 border-slate-600 text-slate-300 hover:bg-slate-800"
                  onClick={() => {
                    const favKeys = collagePoems.filter(p => p.isFavorite).map((_, i) => String(i))
                    setSelectedPoemKeys(new Set(favKeys))
                  }}
                >
                  <Heart className="h-3 w-3 mr-1" />
                  Select Favorites
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 border-slate-600 text-slate-300 hover:bg-slate-800"
                  onClick={() => {
                    setSelectedPoemKeys(new Set(collagePoems.map((_, i) => String(i)).slice(0, 6)))
                  }}
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  Select All
                </Button>
              </div>
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-2 pr-2">
                  {collagePoems.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-6">No poems available yet. Create and favorite some poems first!</p>
                  ) : (
                    collagePoems.map((poem, idx) => {
                      const key = String(idx)
                      const isSelected = selectedPoemKeys.has(key)
                      const preview = poem.poem.split('\n').slice(0, 2).join(' ')
                      return (
                        <label
                          key={key}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                            isSelected
                              ? 'bg-purple-900/20 border-purple-600/40'
                              : 'bg-slate-800/40 border-slate-700/40 hover:border-slate-600/60'
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const next = new Set(selectedPoemKeys)
                              if (checked && next.size < 6) {
                                next.add(key)
                              } else {
                                next.delete(key)
                              }
                              setSelectedPoemKeys(next)
                            }}
                            className="mt-0.5 border-slate-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Badge variant="secondary" className="bg-purple-900/30 text-purple-400 text-[10px] px-1.5 h-4">
                                {poem.style.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                              </Badge>
                              {poem.isFavorite && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
                              <span className="text-[10px] text-slate-500 ml-auto">{poem.date}</span>
                            </div>
                            <p className="text-xs text-slate-400 italic font-serif truncate">{preview}{poem.poem.length > 80 ? '…' : ''}</p>
                          </div>
                        </label>
                      )
                    })
                  )}
                </div>
              </ScrollArea>
              <Button
                onClick={() => { if (selectedPoemKeys.size >= 2) setCollageStep(2) }}
                disabled={selectedPoemKeys.size < 2}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white"
              >
                Continue to Layout
              </Button>
            </div>
          )}

          {/* Step 2: Choose Layout */}
          {collageStep === 2 && (
            <div className="space-y-3">
              <span className="text-sm text-slate-400">Choose a layout:</span>
              <div className="grid grid-cols-2 gap-3">
                {COLLAGE_LAYOUTS.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => setSelectedLayout(layout)}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                      selectedLayout.id === layout.id
                        ? 'bg-purple-900/30 border-purple-600/50 shadow-md shadow-purple-900/20'
                        : 'bg-slate-800/50 border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{layout.emoji}</span>
                      <div>
                        <p className={`text-sm font-medium ${selectedLayout.id === layout.id ? 'text-purple-300' : 'text-slate-300'}`}>
                          {layout.name}
                        </p>
                        <p className="text-[10px] text-slate-500">{layout.columns} col · {layout.maxWidth}×{layout.maxHeight}</p>
                      </div>
                    </div>
                    {/* Mini layout preview */}
                    <div className="h-12 rounded-lg overflow-hidden flex gap-0.5" style={{ background: `linear-gradient(135deg, ${layout.bgGradient[0]}, ${layout.bgGradient[1]})` }}>
                      {layout.columns === 1 && (
                        <div className="flex-1 flex flex-col gap-0.5 p-1">
                          <div className="h-2 bg-white/15 rounded-sm" />
                          <div className="h-2 bg-white/15 rounded-sm" />
                          <div className="h-2 bg-white/15 rounded-sm" />
                        </div>
                      )}
                      {layout.columns === 2 && (
                        <>
                          <div className="flex-1 flex flex-col gap-0.5 p-1">
                            <div className="h-3 bg-white/15 rounded-sm" />
                            <div className="h-2 bg-white/15 rounded-sm" />
                          </div>
                          <div className="flex-1 flex flex-col gap-0.5 p-1">
                            <div className="h-2 bg-white/15 rounded-sm" />
                            <div className="h-3 bg-white/15 rounded-sm" />
                          </div>
                        </>
                      )}
                      {layout.columns === 3 && (
                        <>
                          <div className="flex-1 flex flex-col gap-0.5 p-1">
                            <div className="h-2 bg-white/15 rounded-sm" />
                            <div className="h-2 bg-white/15 rounded-sm" />
                          </div>
                          <div className="flex-1 flex flex-col gap-0.5 p-1">
                            <div className="h-2 bg-white/15 rounded-sm" />
                            <div className="h-2 bg-white/15 rounded-sm" />
                          </div>
                          <div className="flex-1 flex flex-col gap-0.5 p-1">
                            <div className="h-2 bg-white/15 rounded-sm" />
                            <div className="h-2 bg-white/15 rounded-sm" />
                          </div>
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCollageStep(1)} className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800">
                  Back
                </Button>
                <Button onClick={() => setCollageStep(3)} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white">
                  Preview & Download
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Generate & Download */}
          {collageStep === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-1">
                  {selectedPoemKeys.size} poem{selectedPoemKeys.size !== 1 ? 's' : ''} · {selectedLayout.name} layout
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <LayoutGrid className="h-3.5 w-3.5" />
                Your collage will be {selectedLayout.maxWidth}×{selectedLayout.maxHeight}px
              </div>
              <Button
                onClick={() => {
                  const selectedPoems = Array.from(selectedPoemKeys)
                    .map(k => collagePoems[parseInt(k)])
                    .filter(Boolean)
                  if (selectedPoems.length < 2) return
                  downloadPoemCollage(selectedPoems, selectedLayout)
                  setShowCollageDialog(false)
                }}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-purple-900/30"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Collage PNG
              </Button>
              <Button
                variant="outline"
                onClick={() => setCollageStep(2)}
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Back to Layout
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Game Stats Modal */}
      <GameStatsDialog
        open={showGameStats}
        onOpenChange={setShowGameStats}
      />

      {/* Achievement Gallery Modal */}
      <AchievementGallery
        open={showAchievementGallery}
        onOpenChange={setShowAchievementGallery}
        stats={{
          totalWordsCollected: totalCount,
          totalWordsEaten: totalCount,
          poemsCreated: poemHistory.length + (poemResult ? 1 : 0),
          highScore: parseInt(localStorage.getItem('word-snake-highscore') ?? '0', 10),
          categories: [...new Set(wordList.map(({ word }) => {
            const entry = getWordEntry(word)
            return entry?.category
          }).filter(Boolean))] as string[],
          gamesPlayed: parseInt(localStorage.getItem('word-snake-games') ?? '0', 10),
        }}
      />
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
