'use client'

import { useState } from 'react'
import { useWordStore } from '@/lib/word-store'
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
  Trash2,
  AlertCircle,
} from 'lucide-react'

interface PoemResult {
  poem: string
  usedWords: string[]
}

export default function MakePoem() {
  const { collectedWords, removeWords, getWordList, getTotalCount } =
    useWordStore()
  const [loading, setLoading] = useState(false)
  const [poemResult, setPoemResult] = useState<PoemResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [poemHistory, setPoemHistory] = useState<PoemResult[]>([])

  const wordList = getWordList()
  const totalCount = getTotalCount()
  const hasWords = wordList.length > 0

  const handleMakePoem = async () => {
    if (!hasWords) return

    setLoading(true)
    setError(null)
    setPoemResult(null)

    try {
      // Send all collected words (with their counts as repeated entries)
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
      }

      setPoemResult(result)
      setPoemHistory((prev) => [result, ...prev])

      // Remove used words from collection
      if (result.usedWords.length > 0) {
        removeWords(result.usedWords)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      )
    } finally {
      setLoading(false)
    }
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
                {poemHistory.length} poem{poemHistory.length !== 1 ? 's' : ''} created
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Generate Button */}
            <div className="mb-6">
              <Button
                onClick={handleMakePoem}
                disabled={!hasWords || loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
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
                      ? `Make Poem with ${totalCount} Word${totalCount !== 1 ? 's' : ''}`
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
                <div className="p-5 rounded-lg bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-purple-700/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span className="text-purple-300 text-sm font-medium">
                      Your Poem
                    </span>
                  </div>
                  <div className="text-slate-200 leading-relaxed whitespace-pre-wrap font-serif italic text-base">
                    {poemResult.poem}
                  </div>
                  {poemResult.usedWords.length > 0 && (
                    <>
                      <Separator className="my-3 bg-slate-700" />
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-slate-500 text-xs">Words used:</span>
                        {poemResult.usedWords.map((word, i) => (
                          <Badge
                            key={`${word}-${i}`}
                            variant="secondary"
                            className="bg-purple-900/40 text-purple-300 text-xs border-purple-700/50"
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
                </h3>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3 pr-2">
                    {poemHistory.slice(1).map((poem, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50"
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
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Empty State */}
            {!poemResult && !loading && poemHistory.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p className="text-5xl mb-4">✨</p>
                <p className="text-lg font-medium text-slate-400">
                  Your poems will appear here
                </p>
                <p className="text-sm mt-2 max-w-sm mx-auto">
                  Collect words by playing the Snake game, then come back here to
                  weave them into poetry
                </p>
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
              <CardTitle className="text-amber-400 text-base">
                📚 Word Bank
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-amber-900/50 text-amber-400 border-amber-700 text-xs"
              >
                {totalCount} words
              </Badge>
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
                <div className="space-y-1.5 pr-2">
                  {wordList.map(({ word, count }) => (
                    <div
                      key={word}
                      className="flex items-center justify-between px-3 py-1.5 rounded-md bg-slate-800/60 border border-slate-700/50 group hover:bg-slate-800 hover:border-amber-700/50 transition-colors"
                    >
                      <span className="text-amber-300 text-sm font-mono flex items-center gap-1.5">
                        <ChevronRight className="h-3 w-3 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {word}
                      </span>
                      {count > 1 && (
                        <Badge
                          variant="secondary"
                          className="bg-amber-800/40 text-amber-300 text-xs h-5 min-w-[20px] flex items-center justify-center"
                        >
                          ×{count}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
