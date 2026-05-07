'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getCategoryInfo, CATEGORY_COLORS, type WordCategory } from '@/lib/word-pool'
import {
  getCustomWords,
  addCustomWord,
  removeCustomWord,
  clearCustomWords,
  getCustomWordCount,
  calculatePoints,
  validateWord,
} from '@/lib/custom-words'

interface CustomWordsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ALL_CATEGORIES: WordCategory[] = ['nature', 'emotion', 'element', 'time', 'creature', 'quality', 'object', 'action']

export default function CustomWordsDialog({ open, onOpenChange }: CustomWordsDialogProps) {
  const [wordInput, setWordInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<WordCategory>('nature')
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [confirmClear, setConfirmClear] = useState(false)

  const customWords = getCustomWords()
  const count = customWords.length

  // Auto-calculated points based on word length
  const previewPoints = wordInput.length >= 3 ? calculatePoints(wordInput) : 0

  const handleAddWord = useCallback(() => {
    const trimmed = wordInput.trim()
    if (!trimmed) {
      setError('Please enter a word')
      return
    }

    const validation = validateWord(trimmed)
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid word')
      return
    }

    const result = addCustomWord({
      word: trimmed.toLowerCase(),
      category: selectedCategory,
      points: calculatePoints(trimmed),
    })

    if (result) {
      setError(result)
    } else {
      setWordInput('')
      setError(null)
      setRefreshKey((k) => k + 1)
    }
  }, [wordInput, selectedCategory])

  const handleRemoveWord = useCallback((word: string) => {
    removeCustomWord(word)
    setRefreshKey((k) => k + 1)
  }, [])

  const handleClearAll = useCallback(() => {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    clearCustomWords()
    setConfirmClear(false)
    setRefreshKey((k) => k + 1)
  }, [confirmClear])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddWord()
    }
  }, [handleAddWord])

  // Reset confirm state when dialog closes
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setConfirmClear(false)
      setError(null)
    }
    onOpenChange(newOpen)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-200 sm:max-w-lg max-h-[85vh] overflow-y-auto scrollbar-fancy p-6 dialog-slide-up" overlayClassName="modal-backdrop-enhanced">
        <DialogHeader>
          <DialogTitle className="text-emerald-400 flex items-center gap-2 text-lg">
            <span className="text-2xl">✏️</span>
            Custom Words
            <Badge className="bg-emerald-900/60 text-emerald-300 border-emerald-700/50 text-xs ml-1">
              {count}/50
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Add your own words to expand the game&apos;s word pool
          </DialogDescription>
        </DialogHeader>

        {/* Add Word Form */}
        <div className="space-y-3">
          {/* Word input */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium">Word</label>
            <div className="flex gap-2">
              <Input
                value={wordInput}
                onChange={(e) => {
                  setWordInput(e.target.value)
                  setError(null)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter a word (3-15 letters)"
                maxLength={15}
                className="bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
              />
              <Button
                onClick={handleAddWord}
                disabled={!wordInput.trim() || wordInput.trim().length < 3}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 active:scale-95 transition-transform"
              >
                Add
              </Button>
            </div>
            {/* Inline error */}
            {error && (
              <p className="text-xs text-red-400 mt-1">{error}</p>
            )}
          </div>

          {/* Category selector - 8 small buttons */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CATEGORIES.map((cat) => {
                const info = getCategoryInfo(cat)
                const color = CATEGORY_COLORS[cat]
                const isActive = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-all duration-200 border active:scale-95 ${
                      isActive
                        ? 'border-current'
                        : 'bg-slate-800/40 border-slate-700/30 text-slate-500 hover:text-slate-300'
                    }`}
                    style={isActive ? {
                      backgroundColor: `${color}15`,
                      borderColor: `${color}50`,
                      color: color,
                    } : undefined}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 transition-all duration-200 ${isActive ? 'scale-100' : 'scale-75 opacity-50'}`}
                      style={{ backgroundColor: color }}
                    />
                    {info.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Points preview */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Points:</span>
            <span className="text-emerald-400 font-bold">
              {previewPoints > 0 ? previewPoints : '—'}
            </span>
            {previewPoints > 0 && (
              <span className="text-slate-600 text-[10px]">
                (auto-calculated by word length)
              </span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700/50 my-1" />

        {/* Custom Words List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Your Custom Words</span>
            {count > 0 && (
              <span className="text-[10px] text-slate-500">10% spawn chance</span>
            )}
          </div>

          {count === 0 ? (
            <div className="text-center py-6 text-slate-500">
              <p className="text-2xl mb-2 gentle-float">📝</p>
              <p className="text-sm">No custom words yet</p>
              <p className="text-xs mt-1">Add some to expand the word pool!</p>
            </div>
          ) : (
            <ScrollArea className="max-h-64">
              <div className="space-y-1 pr-2" key={refreshKey}>
                {customWords.map((cw) => {
                  const catInfo = getCategoryInfo(cw.category)
                  const catColor = CATEGORY_COLORS[cw.category]
                  return (
                    <div
                      key={cw.word}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-800/60 border border-slate-700/50 group hover:bg-slate-800 hover:border-emerald-700/50 transition-all duration-200"
                    >
                      <span className="text-amber-300 text-sm font-mono flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0 transition-all duration-200 group-hover:scale-125"
                          style={{ backgroundColor: catColor }}
                        />
                        {cw.word}
                        <span className="text-[10px] text-slate-500">
                          {catInfo.label}
                        </span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-emerald-400/70 font-medium">
                          {cw.points}pt{cw.points !== 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => handleRemoveWord(cw.word)}
                          className="text-slate-600 hover:text-red-400 transition-colors text-sm leading-none p-0.5 active:scale-95"
                          title={`Remove "${cw.word}"`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Clear All button */}
        {count > 0 && (
          <div className="pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className={`w-full transition-all duration-200 active:scale-95 ${
                confirmClear
                  ? 'border-red-600/50 text-red-400 hover:bg-red-900/20'
                  : 'border-slate-600/50 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
              }`}
            >
              {confirmClear ? '⚠️ Confirm: Remove all custom words?' : '🗑️ Clear All Words'}
            </Button>
            {confirmClear && (
              <button
                onClick={() => setConfirmClear(false)}
                className="text-xs text-slate-500 hover:text-slate-300 mt-1 w-full text-center transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
