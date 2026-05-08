'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, BookOpen, Sparkles, Play } from 'lucide-react'

/* ─────────────────────────────── types ─────────────────────────────── */

interface StoryModePrologueProps {
  isOpen: boolean
  onClose: () => void
  onStartGame: () => void
}

/* ─────────────────────────────── data ─────────────────────────────── */

const FLOATING_WORDS = ['wonder', 'dream', 'courage', 'wisdom', 'magic', 'ancient', 'serpent', 'quest']

const REALMS = [
  { label: 'Nature', color: 'from-emerald-500 to-green-600', emoji: '🌿' },
  { label: 'Emotion', color: 'from-rose-500 to-pink-600', emoji: '💫' },
  { label: 'Element', color: 'from-cyan-500 to-blue-600', emoji: '🔥' },
  { label: 'Time', color: 'from-amber-500 to-orange-600', emoji: '⏳' },
  { label: 'Creature', color: 'from-violet-500 to-purple-600', emoji: '🐉' },
  { label: 'Quality', color: 'from-teal-500 to-emerald-600', emoji: '✨' },
  { label: 'Object', color: 'from-slate-500 to-zinc-600', emoji: '🗝️' },
  { label: 'Action', color: 'from-red-500 to-rose-600', emoji: '⚔️' },
]

const POWER_UPS = [
  { label: 'Slow Time', desc: 'Freeze the clock', emoji: '⏱️' },
  { label: 'Double Knowledge', desc: '2× word power', emoji: '📖' },
  { label: 'Shrink', desc: 'Slip through gaps', emoji: '🔴' },
  { label: 'Magnet', desc: 'Attract nearby words', emoji: '🧲' },
  { label: 'Shield', desc: 'Guard against danger', emoji: '🛡️' },
]

const STORAGE_KEY = 'word-snake-story-progress'

/* ──────────────────────── helpers ──────────────────────── */

function getSavedProgress(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const val = JSON.parse(raw) as number
      return typeof val === 'number' ? val : 0
    }
  } catch { /* ignore */ }
  return 0
}

function saveProgress(page: number) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(page))
  } catch { /* ignore */ }
}

/* ──────────────────── floating words sub-component ──────────────────── */

function FloatingWords() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {FLOATING_WORDS.map((word, i) => {
        const duration = 8 + i * 2.5
        const delay = i * 1.8
        const topStart = 10 + (i * 11) % 80
        const leftStart = (i * 23 + 5) % 90
        return (
          <span
            key={word}
            className="floating-word absolute text-lg font-semibold tracking-widest text-white/15 select-none md:text-2xl"
            style={{
              top: `${topStart}%`,
              left: `${leftStart}%`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          >
            {word}
          </span>
        )
      })}
    </div>
  )
}

/* ──────────────────── dot indicator ──────────────────── */

function DotIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => {
            /* dots are non-interactive visually but present */
          }}
          aria-label={`Page ${i + 1}`}
          className={`h-2.5 rounded-full transition-all duration-500 ${
            i === current
              ? 'w-8 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
              : 'w-2.5 bg-white/25 hover:bg-white/40'
          }`}
        />
      ))}
    </div>
  )
}

/* ──────────────────── page 1 — the awakening ──────────────────── */

function PageAwakening() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
      {/* gradient bg */}
      <div className="page-gradient-bg absolute inset-0 bg-gradient-to-br from-purple-950 via-violet-950 to-slate-950" />

      {/* shimmer overlay */}
      <div className="shimmer-overlay pointer-events-none absolute inset-0" />

      <FloatingWords />

      <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center gap-8 text-center">
        {/* book icon */}
        <div className="glow-icon flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600/40 to-violet-700/30 backdrop-blur-sm ring-1 ring-white/10">
          <BookOpen className="h-10 w-10 text-amber-400" />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-400/80">
            Chapter I
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            The Word Serpent
          </h2>
        </div>

        <p className="text-lg leading-relaxed text-slate-300/90 md:text-xl">
          In a realm where words hold ancient power, a serpent awakens beneath the library of
          forgotten languages. Each word it consumes grants wisdom — but the library grows more
          treacherous with every page turned&hellip;
        </p>
      </div>
    </div>
  )
}

/* ──────────────────── page 2 — your quest ──────────────────── */

function PageQuest() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="page-gradient-bg absolute inset-0 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950" />
      <div className="shimmer-overlay pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-10 text-center">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
            Chapter II
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            The Quest
          </h2>
        </div>

        <p className="text-lg leading-relaxed text-slate-300/90 md:text-xl">
          You are the Word Serpent&apos;s guide. Collect words from across{' '}
          <span className="font-semibold text-emerald-400">eight realms</span> — Nature, Emotion,
          Element, Time, Creature, Quality, Object, and Action. Each word carries a story, a
          definition, an origin. Master them all to unlock the secrets of the Library.
        </p>

        {/* circular realm badges */}
        <div className="realm-ring relative mx-auto h-[280px] w-[280px] md:h-[320px] md:w-[320px]">
          {REALMS.map((realm, i) => {
            const angle = (i / REALMS.length) * 2 * Math.PI - Math.PI / 2
            const radius = 42 // percent from center
            const x = 50 + radius * Math.cos(angle)
            const y = 50 + radius * Math.sin(angle)
            return (
              <div
                key={realm.label}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${realm.color} shadow-lg ring-1 ring-white/10 transition-transform hover:scale-110 md:h-14 md:w-14`}
                >
                  <span className="text-xl md:text-2xl">{realm.emoji}</span>
                </div>
                <span className="text-[10px] font-semibold tracking-wide text-white/70 md:text-xs">
                  {realm.label}
                </span>
              </div>
            )
          })}

          {/* center icon */}
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-600/20 ring-2 ring-emerald-400/30">
              <Sparkles className="h-7 w-7 text-emerald-300" />
            </div>
            <span className="text-[10px] font-semibold text-emerald-300/60">8 Realms</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────── page 3 — power awaits ──────────────────── */

function PagePower() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="page-gradient-bg absolute inset-0 bg-gradient-to-br from-amber-950 via-orange-950 to-slate-950" />
      <div className="shimmer-overlay pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-10 text-center">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-400/80">
            Chapter III
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Power Awaits
          </h2>
        </div>

        <p className="text-lg leading-relaxed text-slate-300/90 md:text-xl">
          Along your journey, you&apos;ll discover rare and legendary words worth greater power.
          Power-ups will aid you — and building combos by collecting words from the same realm in
          sequence multiplies your might.
        </p>

        {/* power-up cards */}
        <div className="grid w-full max-w-lg grid-cols-3 gap-3 md:grid-cols-5 md:gap-4">
          {POWER_UPS.map((pu) => (
            <div
              key={pu.label}
              className="group flex flex-col items-center gap-2 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur-sm transition-all hover:bg-white/10 hover:ring-amber-400/30 hover:shadow-lg hover:shadow-amber-500/10"
            >
              <span className="text-3xl transition-transform group-hover:scale-125 md:text-4xl">
                {pu.emoji}
              </span>
              <span className="text-[10px] font-semibold leading-tight text-white/80 md:text-xs">
                {pu.label}
              </span>
              <span className="hidden text-[9px] text-white/40 md:block">{pu.desc}</span>
            </div>
          ))}
        </div>

        {/* combo chain indicator */}
        <div className="flex items-center gap-3 rounded-full bg-white/5 px-6 py-3 ring-1 ring-white/10">
          <span className="text-lg">🔗</span>
          <div className="flex items-center gap-1.5">
            {['🌿', '🌿', '🌿', '🌿'].map((e, i) => (
              <span
                key={i}
                className="text-xl transition-all"
                style={{ opacity: 0.4 + i * 0.2, transform: `scale(${0.85 + i * 0.05})` }}
              >
                {e}
              </span>
            ))}
            <span className="ml-1 text-2xl">🌿</span>
          </div>
          <span className="ml-2 text-sm font-bold text-amber-400">×5 COMBO</span>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────── page 4 — begin your journey ──────────────────── */

function PageBegin({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="page-gradient-bg absolute inset-0 bg-gradient-to-br from-rose-950 via-fuchsia-950 to-slate-950" />
      <div className="shimmer-overlay pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center gap-8 text-center">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-400/80">
            Epilogue
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">Ready?</h2>
        </div>

        <p className="text-lg leading-relaxed text-slate-300/90 md:text-xl">
          The Library awaits, brave guide. How far will your serpent travel? What words will you
          discover? The story begins with your first move&hellip;
        </p>

        {/* pulsing begin button */}
        <button
          onClick={onStart}
          className="begin-btn group relative mt-4 flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 px-10 py-4 text-lg font-bold text-slate-950 shadow-2xl shadow-amber-500/30 transition-all hover:scale-105 hover:shadow-amber-500/50 active:scale-95"
        >
          {/* glow ring */}
          <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-amber-300/50 animate-pulse" />

          {/* inner shimmer */}
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

          <Play className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          <span>Begin Adventure</span>
        </button>

        <p className="text-xs text-white/30">Press Enter to begin</p>
      </div>
    </div>
  )
}

/* ════════════════════════════ MAIN COMPONENT ════════════════════════════ */

export default function StoryModePrologue({
  isOpen,
  onClose,
  onStartGame,
}: StoryModePrologueProps) {
  const savedProgress = getSavedProgress()
  const [currentPage, setCurrentPage] = useState(savedProgress)
  const [hasStarted, setHasStarted] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const totalPages = 4

  /* persist progress */
  useEffect(() => {
    saveProgress(currentPage)
  }, [currentPage])

  /* reset page when closed */
  useEffect(() => {
    if (isOpen) {
      const saved = getSavedProgress()
      setCurrentPage(saved)
      setHasStarted(false)
    }
  }, [isOpen])

  /* keyboard navigation */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        goBack()
      } else if (e.key === 'Enter' && currentPage === totalPages - 1) {
        e.preventDefault()
        handleStart()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [isOpen, currentPage, totalPages],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const goNext = () => {
    if (currentPage < totalPages - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentPage((p) => Math.min(p + 1, totalPages - 1))
        setIsTransitioning(false)
      }, 200)
    }
  }

  const goBack = () => {
    if (currentPage > 0) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentPage((p) => Math.max(p - 1, 0))
        setIsTransitioning(false)
      }, 200)
    }
  }

  const handleStart = () => {
    setHasStarted(true)
    saveProgress(0) // reset progress after completing story
    onStartGame()
  }

  if (!isOpen) return null

  return (
    <div className="story-overlay fixed inset-0 z-50 flex flex-col overflow-hidden">
      {/* global CSS for animations */}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes floatWord{0%{opacity:0;transform:translateY(0) translateX(0)}15%{opacity:1}85%{opacity:1}100%{opacity:0;transform:translateY(-120px) translateX(40px)}}.floating-word{animation:floatWord linear infinite}@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}.animate-shimmer{animation:shimmer 2.5s ease-in-out infinite}.shimmer-overlay{background:linear-gradient(135deg,transparent 30%,rgba(255,255,255,0.02) 50%,transparent 70%);animation:shimmer 6s ease-in-out infinite}.glow-icon{animation:glowPulse 3s ease-in-out infinite}@keyframes glowPulse{0%,100%{box-shadow:0 0 20px rgba(168,85,247,0.2),0 0 40px rgba(168,85,247,0.1)}50%{box-shadow:0 0 30px rgba(168,85,247,0.35),0 0 60px rgba(168,85,247,0.15)}}.realm-ring>div:nth-child(1){animation:realmFloat 4s ease-in-out infinite 0s}.realm-ring>div:nth-child(2){animation:realmFloat 4s ease-in-out infinite .4s}.realm-ring>div:nth-child(3){animation:realmFloat 4s ease-in-out infinite .8s}.realm-ring>div:nth-child(4){animation:realmFloat 4s ease-in-out infinite 1.2s}.realm-ring>div:nth-child(5){animation:realmFloat 4s ease-in-out infinite 1.6s}.realm-ring>div:nth-child(6){animation:realmFloat 4s ease-in-out infinite 2s}.realm-ring>div:nth-child(7){animation:realmFloat 4s ease-in-out infinite 2.4s}.realm-ring>div:nth-child(8){animation:realmFloat 4s ease-in-out infinite 2.8s}@keyframes realmFloat{0%,100%{transform:translate(-50%,-50%) translateY(0)}50%{transform:translate(-50%,-50%) translateY(-6px)}}` }} />

      {/* close button */}
      <div className="relative z-30 flex justify-end p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white/50 hover:bg-white/10 hover:text-white/80"
        >
          {savedProgress > 0 && !hasStarted ? 'Skip' : 'Close'}
        </Button>
      </div>

      {/* page content area */}
      <div
        className={`relative z-10 flex flex-1 flex-col transition-all duration-300 ${
          isTransitioning
            ? 'scale-[0.97] opacity-0'
            : 'scale-100 opacity-100'
        }`}
      >
        {/* continue badge */}
        {savedProgress > 0 && currentPage > 0 && !hasStarted && (
          <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2">
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/60 ring-1 ring-white/10 backdrop-blur-sm">
              <BookOpen className="h-3 w-3" />
              Continuing story
            </span>
          </div>
        )}

        {currentPage === 0 && <PageAwakening />}
        {currentPage === 1 && <PageQuest />}
        {currentPage === 2 && <PagePower />}
        {currentPage === 3 && <PageBegin onStart={handleStart} />}
      </div>

      {/* bottom navigation */}
      <div className="relative z-30 flex items-center justify-between px-6 pb-6 pt-4">
        {/* back */}
        <div className="w-32 flex justify-start">
          {currentPage > 0 && (
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/70 ring-1 ring-white/10 backdrop-blur-sm transition-all hover:bg-white/15 hover:text-white active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          )}
        </div>

        {/* dots */}
        <DotIndicator current={currentPage} total={totalPages} />

        {/* next / begin */}
        <div className="w-32 flex justify-end">
          {currentPage < totalPages - 1 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-white/15 to-white/10 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/10 backdrop-blur-sm transition-all hover:from-white/20 hover:to-white/15 hover:shadow-lg active:scale-95"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40 active:scale-95"
            >
              Begin
              <Play className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
