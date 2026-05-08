'use client'

import { useState, useEffect, useRef } from 'react'
import { ACHIEVEMENTS, getUnlockedAchievements, type AchievementStats } from '@/lib/achievements'
import { getMilestones, getNextMilestone, MILESTONE_CONFIG, type MilestoneConfig } from '@/lib/achievement-milestones'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Check, Lock } from 'lucide-react'

interface AchievementGalleryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stats: AchievementStats
}

function getProgress(achievementId: string, stats: AchievementStats): { current: number; target: number; isBoolean: boolean } {
  switch (achievementId) {
    case 'first_bite':
      return { current: stats.totalWordsCollected >= 1 ? 1 : 0, target: 1, isBoolean: true }
    case 'word_collector':
      return { current: Math.min(stats.totalWordsCollected, 10), target: 10, isBoolean: false }
    case 'lexicon_builder':
      return { current: Math.min(stats.totalWordsCollected, 25), target: 25, isBoolean: false }
    case 'vocabulary_master':
      return { current: Math.min(stats.totalWordsCollected, 50), target: 50, isBoolean: false }
    case 'first_poem':
      return { current: stats.poemsCreated >= 1 ? 1 : 0, target: 1, isBoolean: true }
    case 'poet_laureate':
      return { current: Math.min(stats.poemsCreated, 5), target: 5, isBoolean: false }
    case 'century_score':
      return { current: Math.min(stats.highScore, 100), target: 100, isBoolean: false }
    case 'high_roller':
      return { current: Math.min(stats.highScore, 500), target: 500, isBoolean: false }
    case 'category_diver':
      return { current: Math.min(stats.categories.length, 3), target: 3, isBoolean: false }
    case 'full_spectrum':
      return { current: Math.min(stats.categories.length, 8), target: 8, isBoolean: false }
    case 'marathon':
      return { current: Math.min(stats.gamesPlayed, 10), target: 10, isBoolean: false }
    default:
      return { current: 0, target: 1, isBoolean: true }
  }
}

function getProgressLabel(achievementId: string, progress: { current: number; target: number }): string {
  switch (achievementId) {
    case 'first_bite':
    case 'word_collector':
    case 'lexicon_builder':
    case 'vocabulary_master':
      return `${progress.current}/${progress.target} words`
    case 'first_poem':
    case 'poet_laureate':
      return `${progress.current}/${progress.target} poems`
    case 'century_score':
    case 'high_roller':
      return `${progress.current}/${progress.target} pts`
    case 'category_diver':
    case 'full_spectrum':
      return `${progress.current}/${progress.target} categories`
    case 'marathon':
      return `${progress.current}/${progress.target} games`
    default:
      return `${progress.current}/${progress.target}`
  }
}

// Milestone tier badge component
function MilestoneTier({ milestone, unlocked, progress }: {
  milestone: MilestoneConfig
  unlocked: boolean
  progress: number
}) {
  const [justUnlocked, setJustUnlocked] = useState(false)
  const prevUnlockedRef = useRef(false)

  useEffect(() => {
    if (unlocked && !prevUnlockedRef.current) {
      setJustUnlocked(true)
      const timer = setTimeout(() => setJustUnlocked(false), 1000)
      return () => clearTimeout(timer)
    }
    prevUnlockedRef.current = unlocked
  }, [unlocked])

  return (
    <div
      className={`relative rounded-lg border p-3 transition-all duration-300 ${
        unlocked
          ? 'border-current shadow-lg achievement-unlock-glow milestone-tier-shimmer'
          : 'bg-slate-800/30 border-slate-700/30 opacity-60'
      } ${justUnlocked ? 'milestone-unlock-fanfare' : ''}`}
      style={unlocked ? {
        backgroundColor: `${milestone.color}10`,
        borderColor: `${milestone.color}50`,
        boxShadow: `0 0 16px ${milestone.glowColor}, inset 0 0 8px ${milestone.glowColor}`,
      } : undefined}
    >
      {/* Checkmark badge for unlocked */}
      {unlocked && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
          style={{ backgroundColor: milestone.color }}>
          <Check className="h-3 w-3 text-slate-900" />
        </div>
      )}

      {/* Lock icon for locked */}
      {!unlocked && (
        <div className="absolute top-2 right-2 opacity-30">
          <Lock className="h-3.5 w-3.5 text-slate-500" />
        </div>
      )}

      {/* Emoji */}
      <div className={`text-[28px] leading-none mb-1 ${!unlocked ? 'grayscale opacity-50' : ''}`}>
        {milestone.emoji}
      </div>

      {/* Name */}
      <div className={`text-xs font-bold mb-0.5 truncate ${unlocked ? '' : 'text-slate-500'}`}
        style={unlocked ? { color: milestone.color } : undefined}>
        {milestone.name}
      </div>

      {/* Threshold */}
      <div className="text-[10px] text-slate-500 mb-1">
        {milestone.threshold}/{ACHIEVEMENTS.length} achievements
      </div>

      {/* Bonus description */}
      <div className={`text-[10px] leading-snug mb-1.5 ${unlocked ? 'text-slate-300' : 'text-slate-600'}`}>
        {milestone.description}
      </div>

      {/* Progress bar */}
      {!unlocked && (
        <div className="space-y-0.5">
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-slate-500">{progress}%</span>
          </div>
          <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: milestone.color,
                opacity: 0.6,
              }}
            />
          </div>
        </div>
      )}

      {/* Unlocked label */}
      {unlocked && (
        <div className="flex items-center gap-1 text-[10px]" style={{ color: milestone.color }}>
          <Check className="h-3 w-3" />
          <span>Unlocked</span>
        </div>
      )}
    </div>
  )
}

export default function AchievementGallery({ open, onOpenChange, stats }: AchievementGalleryProps) {
  const unlockedIds = getUnlockedAchievements()
  const unlockedCount = unlockedIds.length
  const totalCount = ACHIEVEMENTS.length
  const overallProgress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0

  // Milestone data
  const milestones = getMilestones(unlockedCount)
  const nextMilestone = getNextMilestone(unlockedCount)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-200 sm:max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-fancy p-6" overlayClassName="modal-backdrop-enhanced">
        <DialogHeader>
          <DialogTitle className="text-amber-400 flex items-center gap-2 text-lg">
            <span className="text-2xl">🏆</span>
            Achievement Gallery
            <span className="text-sm font-normal text-amber-500 ml-1">
              {unlockedCount}/{totalCount} Unlocked
            </span>
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Track your progress towards unlocking all achievements
          </DialogDescription>
        </DialogHeader>

        {/* Overall progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Overall Progress</span>
            <span className="text-amber-400 font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-800 overflow-hidden progress-bar-shine">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Milestone Tiers Section */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-300">Milestone Rewards</span>
            <span className="text-[10px] text-slate-500">— Unlock bonuses at achievement thresholds</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {milestones.map(({ milestone, unlocked, progress }) => (
              <MilestoneTier
                key={milestone.id}
                milestone={milestone}
                unlocked={unlocked}
                progress={progress}
              />
            ))}
          </div>
          {/* Next milestone progress indicator */}
          {nextMilestone ? (
            <div className="text-center text-[11px] text-slate-500 py-1">
              <span className="text-slate-400 font-medium">{nextMilestone.remaining}</span> more achievement{nextMilestone.remaining !== 1 ? 's' : ''} to unlock{' '}
              <span style={{ color: nextMilestone.milestone.color }}>{nextMilestone.milestone.emoji} {nextMilestone.milestone.name}</span>
            </div>
          ) : (
            <div className="text-center text-[11px] py-1" style={{ color: MILESTONE_CONFIG[MILESTONE_CONFIG.length - 1].color }}>
              ✨ All milestones unlocked! You are legendary! ✨
            </div>
          )}
        </div>

        {/* Achievement grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = unlockedIds.includes(achievement.id)
            const progress = getProgress(achievement.id, stats)
            const progressPercent = progress.target > 0 ? Math.min((progress.current / progress.target) * 100, 100) : 0

            return (
              <div
                key={achievement.id}
                className={`relative rounded-lg border p-3 transition-all duration-200 ${
                  isUnlocked
                    ? 'bg-green-950/30 border-green-700/40 shadow-[0_0_12px_rgba(34,197,94,0.1)] achievement-unlock-glow'
                    : 'bg-slate-800/30 border-slate-700/30'
                }`}
              >
                {/* Checkmark badge in corner for unlocked */}
                {isUnlocked && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-600 flex items-center justify-center shadow-md">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}

                {/* Lock overlay for locked */}
                {!isUnlocked && (
                  <div className="absolute top-2 right-2 opacity-30">
                    <Lock className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                )}

                {/* Emoji */}
                <div className={`text-[32px] leading-none mb-1.5 ${!isUnlocked ? 'grayscale opacity-50' : ''}`}>
                  {achievement.emoji}
                </div>

                {/* Title */}
                <div className={`text-sm font-bold mb-0.5 truncate ${isUnlocked ? 'text-green-300' : 'text-slate-500'}`}>
                  {achievement.title}
                </div>

                {/* Description */}
                <div className="text-[11px] text-slate-500 mb-2 leading-snug">
                  {achievement.description}
                </div>

                {/* Progress bar */}
                {progress.isBoolean ? (
                  isUnlocked ? (
                    <div className="flex items-center gap-1 text-[10px] text-green-400">
                      <Check className="h-3 w-3" />
                      <span>Completed</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <span>Not yet earned</span>
                    </div>
                  )
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={isUnlocked ? 'text-green-400' : 'text-slate-500'}>
                        {getProgressLabel(achievement.id, progress)}
                      </span>
                      <span className={isUnlocked ? 'text-green-400' : 'text-slate-600'}>
                        {Math.round(progressPercent)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          isUnlocked
                            ? 'bg-gradient-to-r from-green-600 to-emerald-400'
                            : 'bg-gradient-to-r from-slate-600 to-slate-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
