'use client'

import { useState } from 'react'
import { useWordStore } from '@/lib/word-store'
import { getWordEntry, CATEGORY_COLORS, getCategoryInfo, type WordCategory } from '@/lib/word-pool'
import { playPoemSound } from '@/lib/sounds'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Sparkles,
  Loader2,
  BookOpen,
  ChevronRight,
  AlertCircle,
  Copy,
  Check,
  Trash2,
  Download,
} from 'lucide-react'

interface PoemResult {
  poem: string
  usedWords: string[]
  timestamp: number
}

export default function MakePoem() {
  const { removeWords, getWordList, getTotalCount, clearAll } = useWordStore()
  const [loading, setLoading] = useState(false)
  const [poemResult, setPoemResult] = useState<PoemResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [poemHistory, setPoemHistory] = useState<PoemResult[]>([])
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const wordList = getWordList()
  const totalCount = getTotalCount()
  const hasWords = wordList.length > 0

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
        body: JSON.stringify({ words: wordsToSend }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate poem')
      }

      const result: PoemResult = {
        poem: data.poem,
        usedWords: data.usedWords || [],
        timestamp: Date.now(),
      }

      setPoemResult(result)
      setPoemHistory((prev) => [result, ...prev])

      if (result.usedWords.length > 0) {
        removeWords(result.usedWords)
      }
      playPoemSound()
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
    const titleHeight = 40
    const wordsHeight = poem.usedWords.length > 0 ? 40 : 0
    const height = padding * 2 + titleHeight + lines.length * lineHeight + wordsHeight + 20

    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height)
    grad.addColorStop(0, '#1e1b4b')
    grad.addColorStop(0.5, '#0f172a')
    grad.addColorStop(1, '#1a0533')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    // Border
    ctx.strokeStyle = '#7c3aed40'
    ctx.lineWidth = 2
    ctx.roundRect(8, 8, width - 16, height - 16, 12)
    ctx.stroke()

    // Title
    ctx.fillStyle = '#c084fc'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('✨ Word Snake Poem', width / 2, padding + 20)

    // Poem text
    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'italic 14px serif'
    ctx.textAlign = 'left'
    let y = padding + titleHeight + 10
    for (const line of lines) {
      ctx.fillText(line, padding, y)
      y += lineHeight
    }

    // Used words
    if (poem.usedWords.length > 0) {
      y += 10
      ctx.fillStyle = '#64748b'
      ctx.font = '11px sans-serif'
      ctx.fillText('Words: ' + poem.usedWords.join(', '), padding, y)
    }

    // Download
    const link = document.createElement('a')
    link.download = `word-snake-poem-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-[1100px] mx-auto">
      {/* Poem Generation Area */}
      <div className="flex-1 min-w-0">
        <Card className="border-slate-700 bg-slate-900 h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Poetry Workshop
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-purple-900/50 text-purple-400 border-purple-700"
              >
                {poemHistory.length} poem{poemHistory.length !== 1 ? 's' : ''} crafted
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Generate Button */}
            <div className="mb-6">
              <Button
                onClick={handleMakePoem}
                disabled={!hasWords || loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30 transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Crafting your poem...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    {hasWords
                      ? `Compose Poem with ${totalCount} Word${totalCount !== 1 ? 's' : ''}`
                      : 'Collect Words in the Game First'}
                  </>
                )}
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-700/50 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 text-sm font-medium">Generation Failed</p>
                  <p className="text-red-300/80 text-xs mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Current Poem Result */}
            {poemResult && (
              <div className="mb-6">
                <div className="p-5 rounded-lg bg-gradient-to-br from-purple-900/20 via-slate-800/80 to-slate-800/40 border border-purple-700/30 relative overflow-hidden">
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-500/5 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-amber-500/5 to-transparent" />

                  <div className="flex items-center justify-between mb-3 relative">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span className="text-purple-300 text-sm font-medium">
                        Your Poem
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-slate-400 hover:text-slate-200"
                        onClick={() => copyToClipboard(poemResult.poem, poemResult.timestamp)}
                      >
                        {copiedId === poemResult.timestamp ? (
                          <><Check className="h-3.5 w-3.5 mr-1 text-green-400" /><span className="text-xs text-green-400">Copied!</span></>
                        ) : (
                          <><Copy className="h-3.5 w-3.5 mr-1" /><span className="text-xs">Copy</span></>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-slate-400 hover:text-slate-200"
                        onClick={() => downloadPoemAsImage(poemResult)}
                        title="Download as image"
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">Save</span>
                      </Button>
                    </div>
                  </div>
                  <div className="text-slate-200 leading-relaxed whitespace-pre-wrap font-serif italic text-base relative">
                    {poemResult.poem}
                  </div>
                  {poemResult.usedWords.length > 0 && (
                    <>
                      <Separator className="my-3 bg-slate-700/50" />
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-slate-500 text-xs">Words woven in:</span>
                        {poemResult.usedWords.map((word, i) => (
                          <Badge
                            key={`${word}-${i}`}
                            variant="secondary"
                            className="bg-purple-900/40 text-purple-300 text-xs border-purple-700/50 hover:bg-purple-800/50 transition-colors"
                          >
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Poem History */}
            {poemHistory.length > 1 && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Previous Poems
                  <Badge variant="secondary" className="bg-slate-800 text-slate-500 text-[10px] h-4 px-1.5 ml-1">
                    {poemHistory.length - 1}
                  </Badge>
                </h3>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3 pr-2">
                    {poemHistory.slice(1).map((poem) => (
                      <div
                        key={poem.timestamp}
                        className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-slate-600/50 transition-colors relative group"
                      >
                        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap font-serif italic text-sm">
                          {poem.poem}
                        </div>
                        {poem.usedWords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {poem.usedWords.map((word, i) => (
                              <Badge
                                key={`${word}-${i}`}
                                variant="secondary"
                                className="bg-slate-700/60 text-slate-400 text-xs"
                              >
                                {word}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-300"
                          onClick={() => copyToClipboard(poem.poem, poem.timestamp)}
                        >
                          {copiedId === poem.timestamp ? (
                            <Check className="h-3 w-3 text-green-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Empty State */}
            {!poemResult && !loading && poemHistory.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <div className="relative inline-block">
                  <p className="text-5xl mb-4">✨</p>
                  <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-xl" />
                </div>
                <p className="text-lg font-medium text-slate-400">
                  Your poems will appear here
                </p>
                <p className="text-sm mt-2 max-w-sm mx-auto leading-relaxed">
                  Collect words by playing the Snake game, then come back here to
                  weave them into poetry
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Collect
                  </div>
                  <span className="text-slate-700">→</span>
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Compose
                  </div>
                  <span className="text-slate-700">→</span>
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Create
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Word Collection Sidebar */}
      <div className="w-full lg:w-72 shrink-0">
        <Card className="border-slate-700 bg-slate-900 h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-amber-400 text-base flex items-center gap-2">
                📚 Word Bank
              </CardTitle>
              <div className="flex items-center gap-2">
                {hasWords && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
                    onClick={clearAll}
                    title="Clear all words"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
                <Badge
                  variant="secondary"
                  className="bg-amber-900/50 text-amber-400 border-amber-700 text-xs"
                >
                  {totalCount}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {wordList.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="text-3xl mb-2">📝</p>
                <p className="text-sm">Word bank is empty</p>
                <p className="text-xs mt-1">
                  Play the Snake game to fill it up!
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] lg:h-[520px]">
                <div className="space-y-1 pr-2">
                  {wordList.map(({ word, count }) => {
                    const entry = getWordEntry(word)
                    const catColor = entry ? CATEGORY_COLORS[entry.category] : '#94a3b8'
                    const catInfo = entry ? getCategoryInfo(entry.category) : null
                    return (
                      <div
                        key={word}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-800/60 border border-slate-700/50 group hover:bg-slate-800 hover:border-amber-700/50 transition-all duration-200"
                      >
                        <span className="text-amber-300 text-sm font-mono flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: catColor }}
                            title={catInfo?.label ?? ''}
                          />
                          {word}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {entry && (
                            <span className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">
                              {entry.points}pt{entry.points !== 1 ? 's' : ''}
                            </span>
                          )}
                          {count > 1 && (
                            <Badge
                              variant="secondary"
                              className="bg-amber-800/40 text-amber-300 text-xs h-5 min-w-[20px] flex items-center justify-center"
                            >
                              ×{count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
