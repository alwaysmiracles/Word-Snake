'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useWordStore } from '@/lib/word-store'
import { toast } from '@/hooks/use-toast'
import { getRandomWordWithCategories, getWordCountByCategory, getWordEntry, getWordEntryIncludingCustom, getCategoryInfo, CATEGORY_COLORS, getAllWords, type WordCategory, WORD_ENTRIES, WordRarity, RARITY_CONFIG, getRarityForPoints, getRandomRarity } from '@/lib/word-pool'
import { playEatSound, playGameOverSound, playStartSound, playPauseSound, playClickSound, playPowerUpSound, setSoundTheme, playThemePreviewSound, playEasterEggSound, decayVisualizerPulse } from '@/lib/sounds'
import { checkAchievements, type AchievementStats } from '@/lib/achievements'
import { AchievementQueue, type AchievementNotification } from '@/lib/achievement-queue'
import { checkMilestones, getActiveMilestoneBonuses, MILESTONE_CONFIG, type MilestoneConfig } from '@/lib/achievement-milestones'
import AchievementGallery from '@/components/achievement-gallery'
import GameStatsDialog from '@/components/game-stats'
import CustomWordsDialog from '@/components/custom-words-dialog'
import { getCustomWordCount } from '@/lib/custom-words'
import { getDailyChallenge, getDailyChallengeResult, saveDailyChallengeResult, isDailyChallengePlayed, type DailyChallenge } from '@/lib/daily-challenge'
import { getStreak, updateStreak, getStreakMultiplier, getActiveStreakBonus, applyStreakBonus, STREAK_BONUSES, type StreakInfo } from '@/lib/streak'
import { addLeaderboardEntry, getBestScore, getEntryCount, type Difficulty } from '@/lib/leaderboard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { getWordDefinition } from '@/lib/word-definitions'
import { POWERUP_CONFIG, getRandomPowerUpType, POWERUP_SPAWN_CHANCE, POWERUP_DESPAWN_TIME, type PowerUpType, type PowerUpConfig } from '@/lib/powerups'
import { trackGameEnd, trackWordEaten, trackPowerUpCollected, trackCombo, trackDailyPlayed } from '@/lib/game-stats'
import { getSnakeSkin, getAllSkins, getSavedSkin, saveSnakeSkin, isSkinUnlocked, getSkinUnlockMap, type SnakeSkin } from '@/lib/snake-skins'
import { checkEasterEggs, hasActiveEffect, expireEasterEggEffects, resetEasterEggForNewGame, type EasterEgg, type EasterEggEffect } from '@/lib/easter-eggs'
import { getGridTheme, getAllGridThemes, getSavedGridTheme, saveGridTheme, type GridThemeId } from '@/lib/grid-themes'
import { getSavedSoundTheme, getAllSoundThemes, saveSoundTheme, type SoundThemeId } from '@/lib/sound-themes'
import { getSavedTrail, getAllTrails, saveTrail, type SnakeTrailType, spawnTrailParticles, drawTrail, updateTrailParticles, type TrailParticle } from '@/lib/snake-trails'
import KeyboardShortcutsDialog from '@/components/keyboard-shortcuts-dialog'
import { updateVisualizer, drawVisualizer, resetVisualizer, getVisualizerConfig, isVisualizerActive, type VisualizerBar } from '@/lib/sound-visualizer'
import SettingsPanel from '@/components/settings-panel'
import GameOverStats from '@/components/game-over-stats'
import { isSpeechSupported, pronounceWord } from '@/lib/word-pronunciation'
import { getSpeedRunDuration, getSpeedRunBest, saveSpeedRunResult, type SpeedRunResult } from '@/lib/speed-run'
import { getNightModeConfig, saveNightModeConfig, shouldAutoEnableNightMode, getNightModeFilter, type NightModeConfig } from '@/lib/night-mode'
import { getPlayerLevel, getDifficultyAdjustment, recordGamePerformance, type DifficultyAdjustment } from '@/lib/dynamic-difficulty'
import { calculateInGameDifficulty, getSpeedMultiplier, type InGameDifficulty } from '@/lib/in-game-difficulty'
import { downloadShareCard, type ShareCardData } from '@/lib/share-card'
import { WORD_PACKS, getActivePack, setActivePack, isPackUnlocked, getWordsFromPack, getPackWordEntry, getPackCategoryInfo, checkPackUnlocks, type WordPack, PACK_CATEGORY_INFO } from '@/lib/word-packs'
import { isTutorialCompleted, markTutorialCompleted, saveTutorialProgress, resetTutorial as resetTutorialData, createTutorialState, type TutorialState } from '@/lib/tutorial'
import { createPvPState, P2_COLORS, type PvPState } from '@/lib/pvp-mode'
import { createAiBot, calculateAiBotMove, updateAiBot, checkAiBotCollision, getAiBotDrawInfo, type AiBotState } from '@/lib/ai-bot'
import WordBook from '@/components/word-book'
import StoryModePrologue from '@/components/story-mode'
import StatsComparison from '@/components/stats-comparison'
import { getHighContrastConfig, saveHighContrastConfig, getHighContrastClasses, shouldAnimate, type HighContrastConfig } from '@/lib/high-contrast'
import { startRecording, recordFrame, stopRecording, isRecording, getReplays, deleteReplay, getReplay, startPlayback, stopPlayback, isPlaybackActive, getPlaybackState, advancePlayback, setPlaybackSpeed, setPlaybackPlaying, getPlaybackProgress, seekPlayback, formatDuration, formatDate, clearAllReplays, type GameReplay, type ReplayFrame } from '@/lib/game-replay'
import { shouldSpawnObstacle, getMaxObstacles, generateObstacles, checkObstacleCollision, getObstacleDrawInfo, OBSTACLE_CONFIG, MIN_WORDS_FOR_OBSTACLES, type Obstacle, type ObstacleType } from '@/lib/obstacles'
import { shouldSpawnPortal, getMaxPortalPairs, generatePortalPair, checkPortalTeleport, getPortalDrawInfo, type PortalPair } from '@/lib/portals'
import { shouldSpawnQuiz, generateQuiz, checkAnswer, saveQuizResult, formatQuizBonus, QUIZ_DURATION, type WordQuiz, type QuizResult } from '@/lib/word-quiz'
import { shouldSpawnBoss, generateBoss, checkBossHit, getBossDrawInfo, getBossTierInfo, isBossExpired, BOSS_DESPAWN_TIME, BOSS_POOL, type BossWord } from '@/lib/boss-mode'
import { getBotSkin, getDefaultBotSkin, isBotSkinUnlocked, getUnlockedBotSkins, getSavedBotSkin, saveBotSkin, AI_BOT_SKINS, type AiBotSkin } from '@/lib/ai-bot-skins'
import { getActiveSeasonalPacks, SEASONAL_CATEGORY_INFO, type SeasonalPack } from '@/lib/seasonal-packs'
import { canStealPowerUp, executeSteal, createPvpPowerUpState, getStealDrawInfo, STEAL_INDICATOR_DURATION, type PvpPowerUpState, type StolenPowerUpEvent } from '@/lib/pvp-powerups'
import { createEventFeed, addEvent, getRecentEvents, clearEvents, type GameEventFeed, type GameEvent, EVENT_STYLES } from '@/lib/game-event-feed'
import { spawnEffect, updateParticles, drawParticles as drawPresetParticles, type ParticleEffect as PresetParticle, PRESET_EFFECTS } from '@/lib/particle-effects'
import { spawnMovingObstacles, updateMovingObstacles, checkMovingObstacleCollision, drawMovingObstacles, serializeMovingObstacles, deserializeMovingObstacles, resetMovingObstacleIds, type MovingObstacle } from '@/lib/moving-obstacles'
import { spawnDestructibleWalls, hitDestructibleWall, drawDestructibleWalls, serializeDestructibleWalls, deserializeDestructibleWalls, resetDestructibleWallIds, getDestructibleWallAt, DESTRUCTIBLE_WALL_CONFIG, type DestructibleWall, type WallType } from '@/lib/destructible-walls'
import { createDefaultCustomization, getSavedParticleCustomization, saveParticleCustomization, getParticlePresetForEvent, PRESET_CATEGORIES, DEFAULT_EVENT_PRESETS, type ParticleCustomization, type ParticleEventType, type ParticlePresetName } from '@/lib/particle-customization'
import { createAiDifficultySlider, getDifficultyColor, getDifficultyLabel, AI_DIFFICULTY_LEVELS, type AiDifficultySlider, type AiDifficultyLevel } from '@/lib/ai-difficulty-slider'
import { useResponsiveConfig, hapticFeedback, canHaptic, preventPinchZoom, type ResponsiveConfig, type DeviceInfo, useDeviceInfo } from '@/lib/responsive-ux'
import { getMusicEngine, MUSIC_STYLES, type MusicEngine, type MusicStyle, type MusicStatus, getSavedMusicConfig, saveMusicConfig } from '@/lib/music-generator'
import { shouldSpawnScramble, generateScramble, checkScrambleAnswer, getScrambleResult, isScrambleExpired, SCRAMBLE_TIME_LIMIT, type WordScramble } from '@/lib/word-scramble'
import { getCoinBalance, addCoins, getShopItems, purchaseItem, hasItem, consumeItem, formatCoins, SHOP_ITEMS, COIN_REWARD, type CoinBalance, type ShopItem } from '@/lib/coin-shop'
import { checkExtraAchievements, getExtraAchievementProgress, getExtraAchievementsUnlocked, EXTRA_ACHIEVEMENTS, type ExtraAchievement } from '@/lib/achievements-extra'
import { getComboVfx, spawnComboParticles, updateComboParticles, getComboScreenShake, getComboTextConfig, getComboTrailConfig, shouldShowComboAnnouncement, resetComboAnnouncement, type ComboVfxConfig, type ComboParticle } from '@/lib/combo-vfx'
import { HAMMER_CONFIG, shouldSpawnHammer, createHammerPowerUp, createInitialHammerState, activateHammer, isHammerActive, applyHammerOnWall, updateHammerState, drawHammerIndicator, type HammerPowerUp, type HammerState } from '@/lib/hammer-powerup'
import { MULTILINGUAL_PACKS, getMultilingualPack, getAllMultilingualPacks, isMultilingualPackUnlocked, unlockMultilingualPack, getTotalMultilingualWords, type LanguagePack } from '@/lib/multilingual-packs'
import { getObstacleScaling, shouldSpawnScaledObstacle, getObstacleSpeedMultiplier, getMaxScaledObstacles, getProgressTier, OBSTACLE_SCALING_PRESETS, SCALING_DESCRIPTIONS, type ObstacleScalingConfig, type GameDifficulty } from '@/lib/obstacle-difficulty-scaling'
import { saveEventToHistory, getEventHistory, mergeWithLiveEvents, getEventFeedSettings, getEventHistoryCount, clearEventHistory, type PersistentEvent, type EventFeedSettings } from '@/lib/event-feed-persistence'
import { createInitialVolumeConfig, saveVolumeConfig, loadVolumeConfig, getVolumeIcon, getVolumeLabel, formatVolumePercent, VOLUME_PRESETS, getClosestPreset, toggleMute, snapToPreset, type VolumeSliderConfig } from '@/lib/volume-slider'
import { getRandomMultilingualWord, getMultilingualPackProgress, getTotalMultilingualCollection, hasAnyUnlockedMultilingualPack, getUnlockedMultilingualPackIds, MULTILINGUAL_PACK_ICONS, LANGUAGE_LABELS, type MultilingualGameWord } from '@/lib/multilingual-integration'
import { calculateLayout, getCanvasScaleFactor, shouldUseCompactUI, getSidebarStyle, getCanvasStyle, getGameContainerStyle, ANIMATED_LAYOUT_TRANSITIONS, LAYOUT_BREAKPOINTS, type LayoutMetrics } from '@/lib/responsive-layout'
import { MULTILINGUAL_ACHIEVEMENTS, getAllMultilingualAchievementIds, checkMultilingualAchievements as checkMultiAchievements, createMultilingualStats, type MultilingualAchievementStats } from '@/lib/multilingual-achievements'
import { createInitialSfxConfig, saveSfxConfig, loadSfxConfig, getSfxVolume, setSfxMasterVolume, toggleSfxMute, resetSfxCategories, getSfxIcon, formatSfxPercent, SFX_MIXER_PRESETS, applySfxPreset, type SfxVolumeConfig, type SfxCategory, SFX_CATEGORY_DEFAULTS } from '@/lib/sfx-volume-control'
import { generateWordBookCanvas, downloadWordBookImage, exportWordBook, calculateExportStats, DEFAULT_EXPORT_CONFIG, type WordBookExportConfig } from '@/lib/word-book-export'
import { generateAchievementShowcaseCanvas, downloadAchievementShowcase, shareAchievementShowcase, calculateShowcaseStats, DEFAULT_SHOWCASE_CONFIG, type AchievementShowcaseConfig } from '@/lib/achievement-showcase'
import { saveSession, getSessions, getLastNSessions, calculateTrends, compareSessions, generateComparisonText, getPerformanceColor, type GameSession, type ComparisonSummary, STATS_STORAGE_KEY } from '@/lib/stats-compare-enhanced'
import { generateShareCode, parseShareCode, copyShareCodeToClipboard, downloadReplayFile, readReplayFile, formatReplaySummary, type SharedReplayData } from '@/lib/replay-sharing'
import { createWordPack, addWordToPack, removeWordFromPack, saveWordPack, loadWordPacks, deleteWordPack, exportPackAsJSON, importPackFromJSON, validateWord, PACK_COLORS, PACK_EMOJIS, type CustomWordPack, type CustomWord, MAX_WORDS_PER_PACK, MAX_PACKS } from '@/lib/word-pack-creator'
import { generateStatsCharts, downloadChartImage, drawLineChart, drawBarChart, drawPieChart, DEFAULT_CHART_CONFIG, CHART_COLORS, type ChartDataPoint } from '@/lib/stats-charts'
import { formatPowerUpTime, getPowerUpUrgency, getPowerUpProgressBarWidth, calculateOverlayPosition, drawPowerUpOverlay, POWERUP_OVERLAY_THEMES, OVERLAY_HEIGHT, OVERLAY_MIN_WIDTH, type ActivePowerUpOverlay, type PowerUpOverlayLayout } from '@/lib/powerup-overlay'
import { getFullAchievementProgress, getMotivationalMessage, ACHIEVEMENT_CATEGORY_CONFIG, type AchievementProgressSummary, type AchievementProgressItem } from '@/lib/achievement-progress'
import { generateWordPackFromLLM, THEME_SUGGESTIONS, LANGUAGE_OPTIONS, getGeneratedPacks, saveGeneratedPack, validateWordPack, MAX_GENERATED_PACKS, type GeneratedWordPack, type GenerateRequest } from '@/lib/ai-word-generator'
import { playGameEventSound, getEventCategory, getEventDescription, ALL_GAME_EVENT_TYPES, type GameEventType } from '@/lib/sfx-event-mapper'
import { useResponsiveLayout, useBreakpoint, useOrientation, getFontScaleClasses, getSpacingClasses, getButtonSizeClasses, type ResponsiveLayoutState } from '@/lib/responsive-layout-hooks'
import { triggerGameEvent, createEventTriggerer, batchTriggerEvents, GAME_EVENT_TRIGGERS, getEventStats, type SfxIntegrationConfig } from '@/lib/sfx-event-integrator'
import { getSaveSlots, saveToSlot, loadFromSlot, deleteSaveSlot, getAutoSave, setAutoSave, clearAutoSave, getSlotSummary, exportSaveData, importSaveData, formatSaveAge, SAVE_VERSION, DEFAULT_SLOT_CONFIG, SAVE_STORAGE_KEY, AUTOSAVE_KEY, type SaveSlot, type SerializableGameState, type SaveSlotConfig } from '@/lib/game-state-manager'
import { loadAccessibilityConfig, saveAccessibilityConfig, updateConfig, announceToScreenReader, applyAccessibilityStyles, shouldReduceMotion, getHighContrastTheme, speakText, stopSpeaking, isSpeaking, COLOR_BLIND_FILTERS, DEFAULT_ACCESSIBILITY_CONFIG, type AccessibilityConfig } from '@/lib/accessibility-manager'
import { gameEvents, emitGameEvent, getEventHistory as getHookEventHistory, onGameStart, onGameEnd, onWordEat, onScoreChange, onComboChange, onPowerUp, onAchievement, onAnyEvent, createEventCounter, createEventTimer, type GameHookEvent, type GameEventPayload, type SubscriptionHandle } from '@/lib/game-event-hooks'
import { initAutoSfx, isSfxWired, HOOK_TO_SFX_MAP, getUnmappedEvents } from '@/lib/sfx-auto-trigger'
import { ColorBlindFilterSVG, getFilterCSS, getColorBlindOverlayStyle, COLOR_BLIND_FILTER_CONFIGS, type ColorBlindMode } from '@/lib/color-blind-filters'
import { createKeyboardNav, createSidebarNavItems, useKeyboardNav, isKeyboardUser, type NavItem } from '@/lib/keyboard-navigation'
import { calculateAnalytics, getAnalyticsSummary, getActivityLevel, getEventTimeline, createAnalyticsSnapshot, EVENT_CATEGORIES, getCategoryEmoji, formatEventTimeline, type EventAnalytics, type AnalyticsSnapshot, type EventCategory } from '@/lib/event-analytics'
import { createPracticeConfig, loadPracticeConfig, savePracticeConfig, startPracticeSession, recordPracticeWord, endPracticeSession, getPracticeHistory, getPracticeStats, getPracticeWordOfTheDay, exportPracticeData, importPracticeData, formatPracticeDuration, getWordDifficulty, isRecentWord, type PracticeModeConfig, type PracticeWordEntry, type PracticeStats, type PracticeSessionSummary, type PracticeSession } from '@/lib/practice-mode'
import { createSpeedConfig, loadSpeedConfig, saveSpeedConfig, setSpeed, adjustSpeed, getFrameInterval, getFPS, applySpeedProfile, calculateCustomCurve, getSpeedForScore, formatSpeed, getSpeedColor, getSpeedLabel, getSpeedProgress, SPEED_PROFILES, DEFAULT_SPEED_CONFIG, type SpeedConfig, type SpeedProfile } from '@/lib/game-speed-config'
import { getCalendarForMonth, recordCalendarEntry, getCalendarEntry, getCalendarStats, getCurrentStreak, getBestStreak, calculateStars, getMonthName, getDayName, generateCalendarGrid, getCompletionRateByMonth, getHeatmapData, exportCalendarData, importCalendarData, type CalendarEntry, type CalendarMonth, type CalendarStats } from '@/lib/daily-calendar'
import { getWordSentences, getRandomSentence, getCategorySentences, searchSentences, getSentenceOfTheDay, getSentenceStats, hasSentenceFor, formatSentence, batchGetSentences, generateFillerSentence, type WordSentence } from '@/lib/word-sentences'
import { createTipConfig, getRelevantTips, getTipOfTheDay, markTipShown, dismissTip, getUnshownTips, getNextTip, getTipStats, formatTipContent, getCategoryEmoji as getTipCategoryEmoji, shouldShowTip, TIPS_DATABASE, type GameTip, type TipConfig } from '@/lib/game-tips'
import { recordEncounter, getMastery, getMasteryLevel, getAllMasteries, getMasteryStats, getWordsByLevel, getWeakestWords, getStrongestWords, getMasteryProgress, getLevelName, getLevelColor, getLevelEmoji, MASTERY_THRESHOLDS, MASTERY_COLORS, MASTERY_EMOJIS, type MasteryLevel, type WordMastery, type MasteryStats as MasteryStatsType } from '@/lib/word-mastery'
import { collectExportData, exportAsJSON, exportAsCSV, exportAsMarkdown, exportToClipboard, triggerDownload, createDefaultExportConfig, getExportSizeEstimate, getSectionLabel, getFormatIcon, quickExport, buildShareText, EXPORT_VERSION, type ExportFormat, type ExportSection, type ExportConfig, type ExportResult, type GameExportData } from '@/lib/stats-export'
import { createPanelConfig, loadPanelConfig, savePanelConfig, toggleSection, selectTab, applyPreset, getAllPresets, getActivePreset, createVisualizerConfig, getVisualizerStyles, getVolumeSummary, formatVolume, getSfxCategories, resetAllAudio, SOUND_PRESETS, type SoundThemePanelConfig, type SoundPreset, type AudioVisualizerConfig } from '@/lib/sound-theme-panel'
import { createScoreBreakdown, loadBreakdown, getTopScoringWords, getCategoryContribution, getScoreRating, formatPoints, getTimeEfficiency, getComboAnalysis, getBreakdownSummary, type ScoreEntry, type ScoreBreakdown } from '@/lib/score-breakdown'
import { createNotificationQueue, pushQuick, dismissActive, getActive, getNotificationStats, getTypeConfig, createAchievementNotification, createComboNotification, type NotificationType, type NotificationQueue, type Notification } from '@/lib/notification-manager'
import { GAME_MODES, getMode, getAllModes, getUnlockedModes, getModeStats, getModeProgress, getTimeDisplay, getScoreDisplay, getDifficultyColor as getModeDifficultyColor, getRecommendedMode, type GameMode, type GameModeConfig } from '@/lib/game-mode-selector'
import { createDefaultProfile, loadProfile, saveProfile, setPlayerName, setAvatar, addXP, calculateLevel, getProfileCard, getUnlockedAvatars, getUnlockedTitles, checkTitleUnlocks, AVATARS, PLAYER_TITLES, XP_PER_LEVEL, type PlayerProfile, type Avatar, type PlayerTitle } from '@/lib/player-profile'
import { createGameModeEngine, applyModeRules, updateModeTimer, handleCollisionForMode, getScoreMultiplier as getModeScoreMultiplier, getFrameIntervalModifier, getSpawnRateModifier, getObstacleModifier, shouldEndGame, getModeDisplayInfo, activateMode, recordModeSession, getModeSummary, type GameModeEngine, type MutableGameState, type ModeDisplayInfo } from '@/lib/game-mode-engine'
import { createXPScoringWire, awardXP, addMultiplier, removeMultiplier, updateMultipliers as updateXPMultipliers, getSessionStats, resetSessionStats, getXPProgress, formatXP, getXPBreakdown, activateDoubleXP, activateStreakBonus, activateDifficultyBonus, type XPScoringWire, type XPProgress } from '@/lib/xp-scoring-wire'
import { createScoreLiveWire, recordWordEaten, recordPowerUpBonus, recordComboEvent, updateTimeEfficiency, getMiniSummary, resetForNewGame, getChartJSData, type ScoreLiveWire } from '@/lib/score-live-wire'
import { createNotifEventWire, onAchievementUnlocked, onComboMilestone, onPowerUpCollected, onLevelUp, onStreakMilestone, onDailyChallengeComplete, onNewWordDiscovered, onBossDefeated, onXPBonus, onGameComplete, getActiveNotifications, dismissAll, updateCooldowns, toggleSetting as toggleNotifSetting, getSettings, getNotifStats, type NotifEventWire } from '@/lib/notif-event-wire'
import { syncDailyChallengeResult, isTodaySynced, getSyncState, getWeeklySummary, getStreakWithSync, type DailyChallengeSync } from '@/lib/daily-challenge-sync'
import { getDashboardOverview, getQuickStats, getDashboardExportData, getWordStats, getScoreStats, getAchievementSummary, getPersonalBests, getComparisonWithAverage, formatDashboardNumber, type DashboardPeriod, type OverviewStats, type QuickStat } from '@/lib/game-stats-dashboard'
import { createAlbum, updateAlbum, getCollectionCompletion, getRarestWords, getMostPlayedWords, checkAlbumAchievements, getAlbumShareData, type CollectionAlbum } from '@/lib/word-collection-album'
import { createBattlePass, addBattlePassXP, claimReward, getTierProgress, getSeasonTimeRemaining, getPassSummary, unlockPremium, advanceSeason, isActive as isBattlePassActive, TIER_XP_CONFIG, SEASON_TEMPLATES, type BattlePassSeason, type BattlePassReward } from '@/lib/battle-pass'
import { createTimingController, type TimingController } from '@/lib/game-loop-timing-wire'
import { createEventBusWire, wireOnPowerUpExpire, wireOnPowerUpCollect, type EventBusWire } from '@/lib/game-event-bus-wire'
import { createPowerUpEffectWire, EFFECT_CONFIG, type PowerUpEffectWire, type EffectResult } from '@/lib/powerup-effect-wire'
import { createSocialShare, type SocialShare, type ShareType } from '@/lib/social-share'
import { createGameWiringHub, type GameWiringHub } from '@/lib/game-wiring-hub'
import { createCanvasShareRenderer, type CanvasShareRenderer } from '@/lib/canvas-share-renderer'
import { createMinigameLauncher, type MinigameLauncher, type MinigameType } from '@/lib/minigame-launcher'
import { createEventLogPanel, createGameStartEntries, createWordEatEntries, createPowerUpEntries, createDeathEntries, createAchievementEntries, createComboEntries, createModeStartEntries, type EventLogPanel } from '@/lib/event-log-panel'
// Round 41: Power-up canvas effects, Mode timer wire, Canvas share connector, SFX completion wire
import { createPowerUpVisualState, updatePowerUpVisuals, drawPowerUpEffects, drawFreezeOnObstacle, getGhostSnakeAlpha, drawGhostHeadGlow, recordGhostPosition, triggerBombExplosion, type PowerUpVisualState } from '@/lib/powerup-canvas-effects'
import { createModeTimerWire, shouldTick as shouldModeTick, type ModeTimerWire, type TimerDisplayData } from '@/lib/mode-timer-wire'
import { createCanvasShareConnector, buildGameResultData, buildStreakData, buildCollectionData, buildBattlePassData, type CanvasShareConnector } from '@/lib/canvas-share-connector'
import { createSfxCompletionWire, type SfxCompletionWire } from '@/lib/sfx-completion-wire'
// Round 42: Ghost collision wire, Word bomb wire, Word mastery live tracker, Real-time dashboard wire
import { createGhostCollisionWire, type GhostCollisionWire } from '@/lib/ghost-collision-wire'
import { createWordBombWire, classifyDetonation, type WordBombWire } from '@/lib/word-bomb-wire'
import { createWordMasteryLiveTracker, type WordMasteryLiveTracker } from '@/lib/word-mastery-live-tracker'
import { createRealtimeDashboardWire, type RealtimeDashboardWire } from '@/lib/realtime-dashboard-wire'
// Round 43: Notification completion wire, Battle pass reward grantor, SFX volume category wire, Mastery tracker panel
import { createNotificationCompletionWire, type NotificationCompletionWire } from '@/lib/notification-completion-wire'
import { createBattlePassRewardGrantor, generateTierRewards, type BattlePassRewardGrantor } from '@/lib/battle-pass-reward-grantor'
import { createSfxVolumeCategoryWire, type SfxVolumeCategoryWire } from '@/lib/sfx-volume-category-wire'
import { createMasteryTrackerPanel, type MasteryTrackerPanel } from '@/lib/mastery-tracker-panel'
import { createStoryModeWire, type StoryModeWire } from '@/lib/story-mode-level-wire'
import { createWiringHubCompletionWire, type WiringHubCompletionWire } from '@/lib/wiring-hub-completion-wire'
import { createMinigamePlayWire, type MinigamePlayWire } from '@/lib/minigame-play-wire'
import { createMasteryPanelWire, type MasteryPanelWire } from '@/lib/mastery-panel-wire'
import { getXPBarData, getXPBreakdown as getXPBarBreakdown, getXPSessionVelocity, getTitleProgress, getLevelMilestoneReward, logXPEvent, resetSession as xpResetSession } from '@/lib/xp-progression-wire'
import { generateHeatmap, analyzeDeath, calculateEfficiency, getSessionTrends, findBestMoments, generateWeaknessReport, assignPerformanceGrade, getQuickSummary } from '@/lib/replay-analyzer-wire'
import { getSeasonOverview, getTierDisplayData, claimReward as bpClaimReward, addSeasonXP, checkTierUpgrades, getSeasonCountdown, getPremiumStatus, getSeasonHistory, getXPSources, checkDailyLoginBonus } from '@/lib/battle-pass-wire'
import { getAchievementGallery, getRecentUnlocks, getUnlockedStats, getNextClosest, getCategorySummary, getRarityDistribution, getSessionUnlocks, getShowcaseData, getUnlockStreak, getCompletionForecast } from '@/lib/achievement-showcase-wire'
import { lookupWord, getWordOfTheDay, discoverRandomWord, searchDictionary, getDictionaryStats, speakWord as dictSpeakWord, getRecentLookups, getFavorites as getDictFavorites, toggleFavorite as dictToggleFavorite, generateDefinitionQuiz } from '@/lib/word-dictionary-wire'
import { quickExport as wireQuickExport, getExportHistory as wireGetExportHistory, previewExport, generateShareableText as wireGenShareText, generateSessionReport, generateAchievementReport, getExportSummary } from '@/lib/stats-export-wire'
import { getShareableReplays, getReplayLeaderboard, generateShareText, getShareHistory, validateShareCode } from '@/lib/replay-sharing-wire'
import { createPoem, getPoemHistory, getFavorites as getPoemFavorites, getPoemStats, getWordCloud, getStyleTemplates, getDailyPoemChallenge, isFavorite as isPoemFavorite } from '@/lib/poem-studio-wire'
import { getMatchHistory as pvpGetHistory, getWinStats, getPlayerProfileSummary, calculateEloRating, setupPvPMatch, getHeadToHead, getPvPLeaderboard, getRematchOption, getPvPTips } from '@/lib/pvp-enhancement-wire'
import { getSeasonCalendar, getActiveSeason, browseAllSeasons, activateSeason, getInstalledPacks, getSeasonProgress, getSeasonRewards, getSeasonCountdown as scGetSeasonCountdown } from '@/lib/seasonal-content-wire'
import { getCustomWordStats, quickAddWord as cwQuickAdd, getCustomCategories, validateWordList, exportAsWordPack as cwExportPack, getWordQueue, getModificationHistory, getRecommendations } from '@/lib/custom-words-manager-wire'
import { getActiveTheme, toggleTheme, getAccessibilityProfile, getColorBlindSettings, getHighContrastStatus, getGridTheme as atGetGridTheme, getFontSize, getMotionPreference, applyQuickPreset, getAccessibilityScore } from '@/lib/accessibility-theme-wire'
// Round 51: Friend System Wire, Pet Companion Wire, Weather Effects Wire, Trade Market Wire
import { getFriends, addFriend, removeFriend, acceptFriend, rejectFriend, blockUser, unblockUser, getBlockedUsers, isFriend, getFriendRequests, getSentRequests, searchUsers, getOnlineFriends, getFriendActivity, sendMessage, getConversation, getUnreadCount, markAsRead, getRecentChats, compareWithFriend, getMutualFriends, getFriendLeaderboard, inviteToGame, getInviteStatus, getFriendSummary, getTopFriend, generateMockUsers, getFriendSuggestion, getFriendsOverview, getFriendCard, getChatPreview, getActivityFeed as frGetActivityFeed, getFriendStats } from '@/lib/friend-system-wire'
import { getPet, getAvailablePets, adoptPet, switchPet, releasePet, getOwnedPets, feedPet, playWithPet, restPet, getPetLevel, getPetXP, addPetXP, getPetStats, getPetMood, getPetHunger, getPetEnergy, getPetAppearance, setPetAppearance, getPetAccessories, equipAccessory, getPetAbilities, usePetAbility as petUseAbility, getPetEvolution, canEvolve, evolvePet, getPetBonds, addBond, getPetPersonality, getPetQuote, getPetMoodIcon, getPetDashboard, getPetCard, getAbilityCard, getAccessoryGrid, getEvolutionPreview } from '@/lib/pet-companion-wire'
import { getWeatherState, setWeather, getAvailableWeathers, getWeatherForecast, advanceWeather, getWeatherDuration, getWeatherModifiers, getWeatherVisualConfig, isWeatherActive, getWeatherHistory, getWeatherStats, getWeatherAchievements, checkWeatherAchievements, getWeatherEvents, getActiveEvent, startEvent, getWeatherSeason, getSeasonalWeather, getSeasonBonus, getDayNightCycle, getTimeOfDay, getAmbientSounds as wxGetAmbientSounds, getWeatherParticles, getWeatherOverlay, getWeatherMultiplier, getWeatherStreak, getWeatherRecords, recordWeatherGame, getWeatherLeaderboard, getWeatherDashboard, getWeatherCard, getForecastTimeline, getSeasonCard, getWeatherComparison, getRareWeatherChance } from '@/lib/weather-effects-wire'
import { getMarketListings, createListing, cancelListing, buyListing, placeBid, getMyListings, getTransactionHistory as mkGetTransactionHistory, getMarketCategories, filterListings, searchMarket, getPriceHistory, getItemValue, getMarketStats, getTrendingItems, getDailyDeals, getLimitedOffers, redeemCode, getRedeemedCodes, getGifts, sendGift, mkGetWishlist, addToWishlist as mkAddToWishlist, removeFromWishlist as mkRemoveFromWishlist, getPriceAlerts, setPriceAlert, checkPriceAlerts, getAuctionHouse, getBidHistory, getMyBids, getMarketOverview, getListingCard, getTransactionCard, getMarketGraph, getBundleDeals, getVendorSpecials } from '@/lib/trade-market-wire'
// Round 49: Tournament Bracket Wire, Word Puzzle Wire, Progress Dashboard Wire, Controller Config Wire
import { createTournament, getTournament, getActiveTournaments, generateBracket, getBracket, getMatch, reportMatchResult, advanceBracket, getTournamentStandings, joinTournament, getParticipants, getMyMatchups, getTournamentLeaderboard, getPlayerRanking, getWinRate, getBestStreak as tbbGetBestStreak, claimTournamentReward, getTournamentOverview, getBracketCard, getMatchCard, getMyStats as tbGetMyStats, getRecentResults, startQuickMatch, getQuickMatchStatus } from '@/lib/tournament-bracket-wire'
import { generateCrossword, getCrosswordClues, checkCrosswordAnswer, getCrosswordProgress, generateAnagram, checkAnagram, generateWordSearch, getWordSearchWords, getWordSearchProgress, generateScramble as pzGenerateScramble, checkScrambleAnswer as pzCheckScrambleAnswer, getScrambleStats, startWordChain, isValidChainWord, getChainLength, getPuzzleStats, getPuzzleStreak, getBestScores, getDailyPuzzle as pzGetDailyPuzzle, getDailyPuzzleStreak, getPuzzleOverview, getAvailablePuzzles, getPuzzleCard, getQuickPuzzle, getDailyChallenge as pzGetDailyChallenge, getDifficultyDistribution, claimPuzzleReward, completeDailyPuzzle } from '@/lib/word-puzzle-wire'
import { getOverallProgressScore, getProgressGrade, getProgressPercent, getGameplayProgress, getCollectionProgress, getMasteryProgress as pdGetMasteryProgress, getAchievementProgress, getSocialProgress, getExplorationProgress, getEconomyProgress, getBattlePassProgress, getWeeklyProgress, getProgressTrend, getGoalsAndTargets, getMilestones, getStrengthsAndWeaknesses, getImprovementSuggestions, getAvailableWidgets, getWidgetData, getProgressDashboardOverview, getProgressRingData, getProgressBarData, getSummaryCard } from '@/lib/progress-dashboard-wire'
import { getDefaultKeybinds, getKeybinds, setKeybind, resetAllKeybinds, getKeybindForAction, getActionForKey, getProfiles, createProfile, deleteProfile, loadProfile as ctrlLoadProfile, getDefaultProfiles, getSensitivity, setSensitivity as ctrlSetSensitivity, getSensitivityPresets, getTouchConfig, setTouchConfig, getGesturesEnabled, toggleGesture, getControllerConfig, getControllerMappings, setControllerMapping, getInputHeatmap, getAPM, getMostUsedKeys, getControllerOverview, getKeybindGrid, getQuickSettings, getRecommendedSettings, getAccessibilityInput, setAccessibilityInput, getInputAssistLevel, setInputAssistLevel } from '@/lib/controller-config-wire'
// Round 48: Soundtrack Manager Wire, Social Activity Feed Wire, Inventory System Wire, World Map Explorer Wire
import { getMusicLibrary, getTrack, getPlaylists, createPlaylist, getCurrentTrack, getPlaybackState as stGetPlaybackState, play as stPlay, pause as stPause, resume as stResume, next as stNext, previous as stPrev, getMasterVolume, setMasterVolume, getMusicVolume, setMusicVolume, getAmbientSounds, toggleAmbient, getActiveAmbients, getAmbientMix, applyAmbientMix, getVolumePreset, applyVolumePreset, getAudioMixerState, getMostPlayed, getListeningTime, getGenreBreakdown, getDetectedMood, enableAutoPlay, isAutoPlayEnabled, getSoundtrackOverview, getNowPlayingCard, getQuickControls, getGenreDistribution, recordPlay, shuffle as stShuffle, repeat as stRepeat, seek as stSeek } from '@/lib/soundtrack-manager-wire'
import { postActivity, getActivityFeed, formatActivity, getActivityIcon, getActivityColor, addReaction, getReactions, getHighlights, getActivityStats, getActivityFrequency, postStatus, getCurrentStatus, setMood, getMood, generateWeeklyDigest, getFeedOverview, getFeedTimeline, getActivitySummary, getTrendingActivity, muteActivityType, unmuteActivityType, getMutedTypes, deleteActivity, clearFeed } from '@/lib/social-activity-feed-wire'
import { getInventory, getInventorySummary, addItem as invAddItem, removeItem as invRemoveItem, useItem, hasItem as invHasItem, getItemCount, getCosmetics, equipCosmetic, unequipCosmetic, getEquippedCosmetics, getConsumables, useConsumable as invUseConsumable, getBoostStatus, getMaterials, canCraft, craft, getBalances, addCurrency, spendCurrency, canAfford, getTransactionHistory, getShopItems as invGetShopItems, purchaseItem as invPurchaseItem, getDailyShopDeals, getWishlist, addToWishlist, removeFromWishlist, getRarityColor, getRarityLabel, getItemsByRarity, getRarityDistribution as invGetRarityDistribution, getInventoryOverview, getInventoryGrid, getNewItemNotification, getInventoryWorth, getQuickAccess } from '@/lib/inventory-system-wire'
import { getWorldMap, getRegions, getRegion, isRegionUnlocked, unlockRegion, getChapters, getChapter, getChapterProgress, getLevel, getLevelReward, getLevelStatus, recordLevelAttempt, getOverallProgress, getRegionProgress, getCurrentRegion, setCurrentRegion, getMapNodes, getConnections, getMapBounds, getZoomLevel, setZoomLevel, getExplorationBonus, hasExploredFully, getHiddenPaths, discoverHiddenPath, getActiveEvents, getRegionLore, getChapterLore, getUnlockedLore, getLoreCompletion, getWorldSummary, getRecommendedPath, getStuckHelper, getWorldMapOverview, getRegionCard, getProgressSummary, getWorldMapStats } from '@/lib/world-map-explorer-wire'
// Round 47: Game Settings Wire, Player Stats Compare Wire, Challenge Mode Wire, Word Art Gallery Wire
import { getSettings as gsGetSettings, updateSetting as gsUpdateSetting, getPresets, applyPreset as gsApplyPreset, getSettingsOverview, getActivePresetName, getSettingsCompletion, getGameplaySettings, getAudioSettings, getVisualSettings, getControlSettings, updateSettingsGroup, validateSettings, getSettingConstraints, exportSettings as gsExportSettings, importSettings as gsImportSettings, getMostChangedSettings, getOptimalSettings, getPerformanceBasedRecommendation, getBeginnerFriendlySettings, createCustomPreset, deleteCustomPreset, resetAllSettings } from '@/lib/game-settings-wire'
import { getPeriodStats, comparePeriods, getTrend, getTrendSummary, getCurrentStreak as pscGetCurrentStreak, getLongestStreak as pscGetLongestStreak, getConsistencyScore, getSkillRating, getSkillTier, getSkillProgress, getWeakMetrics, getImprovementAreas, getStrengths, getDailyScores, getScoreDistribution, getCategoryPerformance, getComparisonOverview, getInsights, getWeeklyReport, getPeakHours, getPersonalBests as pscGetPersonalBests } from '@/lib/player-stats-compare-wire'
import { getChallengeTemplates, startChallenge, getActiveChallenge, cancelChallenge, completeChallenge, getProgress as getChallengeProgress, isChallengeActive, getChallengeModifier, getChallengeHistory, getChallengeStats, getDailyChallenge as cmGetDailyChallenge, getDailyChallengeProgress, getDailyChallengeStreak, getDailyRewardBonus, getChallengeOverview, getAvailableChallenges, getRecommendedChallenges, getChallengeCard, calculateReward, createCustomChallenge, getChallengeLeaderboard } from '@/lib/challenge-mode-wire'
import { generateWordArt, getGallery, getRecentArt, getGalleryStats, toggleFavorite as artToggleFavorite, getFavorites as artGetFavorites, getTopRated, getArtByStyle, generateWordCloud, generateTypoArt, getGalleryOverview, getArtCard, getArtThemes, getFrameStyles, createAlbum as artCreateAlbum, getAlbums, deleteGalleryItem, rateArt, getGalleryCount, checkMilestones as artCheckMilestones, getAutoArtSuggestion, getShareableArt } from '@/lib/word-art-gallery-wire'
import { initDailyRewards, checkDailyLogin, getLoginStreak, getLongestStreak, getStreakRewards, claimStreakReward, getDailyQuests, updateQuestProgress, completeQuest, claimQuestReward, getWeeklyCalendar, claimWeeklyChest, getWeeklyProgress as drGetWeeklyProgress, getMonthlyMilestone, addMonthlyProgress, claimMonthlyReward, getUnclaimedRewards, claimAllRewards, getRewardHistory, getRewardStats, getNotification as drGetNotification, dismissNotification, getStreakBonus, isStreakActive, getQuestCompletionRate, getBestQuestDay, getRewardCalendar, getDailyRewardSummary, getWeeklySummary as drGetWeeklySummary, generateDailyQuests, getRewardOverview, getStreakCard, getQuestList, getWeeklyChestGrid, getMonthlyTierBar } from '@/lib/daily-reward-wire'
import { initWordConnect, generateGrid, findPossibleWords, isValidPath, submitWord, getGameStats, startNewGame, getCurrentGame, getHint as wcGetHint, getHintsRemaining, useHint, shuffleGrid, getDailyPuzzle as wcGetDailyPuzzle, getDailyStreak as wcGetDailyStreak, isDailyCompleted, getFoundWords, getUnfoundWords, getWordScore, getComboMultiplier, getTimeBonus, getHighScores as wcGetHighScores, getTotalGamesPlayed, getTotalWordsFound, getLongestWordFound, getAverageWordsPerGame, getBestScore as wcGetBestScore, getDifficultyStats, saveGameResult, getRecentGames, getWordFrequency, getConnectOverview, getGameCard, getFoundWordsList, getUnfoundWordsPreview, getDailyConnectCard, getStatsGrid as wcGetStatsGrid, getDifficultyButtons, getHighScoreList } from '@/lib/word-connect-wire'
import { initProfileCard, getAvatarOptions, getCurrentAvatar, selectAvatar, unlockAvatar, getTitles, getCurrentTitle, selectTitle, earnTitle, getFrames, getCurrentFrame, selectFrame, unlockFrame, getBio as pcGetBio, setBio as pcSetBio, getMood as pcGetMood, setMood as pcSetMood, getStatus as pcGetStatus, setStatus as pcSetStatus, getFeaturedAchievements, setFeaturedAchievement, getProfileCompletion, getProfileCard as pcGetProfileCard, generateShareCode as pcGenShareCode, parseShareCode as pcParseShareCode, getProfileStats, getCollectionProgress as pcGetCollectionProgress, getRecentActivity, getLevelBadge, getJoinDate, getPlayTime, getRankBadge, getProfileOverview, getAvatarGrid, getTitleList, getFrameGallery, getProfileShareCard } from '@/lib/profile-card-wire'
import { initSkillTree, getSkillTree, getBranches, getBranchSkills, getSkill, getSkillStatus, canUnlock, unlockSkill, upgradeSkill, getSkillPoints, addSkillPoints, spendSkillPoints, getTotalSpent, getActiveSkills, toggleActiveSkill, getActiveSlots, getActiveSlotsUsed, refundAll, refundBranch, getRespecCost, canRespec, getBuildPresets, saveBuildPreset, loadBuildPreset, deleteBuildPreset, getSkillEffects, getBonusScoreMultiplier, getBonusSpeed, getBonusLives, getSkillTreeStats, getSkillTreeOverview, getBranchCard, getSkillNode, getActiveBuildSummary, getRecommendations as stGetRecommendations, getMasteryProgress as stGetMasteryProgress } from '@/lib/skill-tree-wire'
import { initLeaderboard, getLeaderboardData, getGlobalRankings, getPlayerRank, getPlayerBestRank, getTopPlayers, submitScore as lbSubmitScore, getRankChange, getLeaderboardStats, getCategories as lbGetCategories, searchPlayers as lbSearchPlayers, getPlayerProfile, getRankHistory, getRankTrend, getLeaderboardSummary, getLeaderboardCard, getLeaderboardRow, getLeaderboardTable, getMedalCount, getPercentile, getAverageRank, getDominantCategory, getNearbyPlayers, compareWithTarget, getWeeklyResetCountdown, getMonthlyResetCountdown, getActiveSeason as lbGetActiveSeason, getSeasonHistory as lbGetSeasonHistory, refreshMockData, getTopMovers, getLongestRanks, getLeaderboardOverview, getCategoryGrid, getPodiumData } from '@/lib/leaderboard-wire'
import { initSoundBoard, playNote, getAvailableInstruments, getCurrentInstrument, selectInstrument, startRecording as sbStartRecording, stopRecording as sbStopRecording, playRecording, saveMelody, deleteMelody, getMelodyLibrary, getPresetMelodies, getMelodyStats, playSoundEffect, getSoundEffects, getSoundBoardStats, getMixerState, setChannelVolume, setMasterVolume as sbSetMasterVolume, getTempo, setTempo, getBeatPatterns, playBeat, stopAllSounds, getRecentMelodies, generateShareCode as sbGenShareCode, importMelody as sbImportMelody, getSoundBoardOverview, getInstrumentGrid, getPianoKeys, getEffectsGrid, getMelodyCard } from '@/lib/soundboard-wire'
import { initMissionSystem, getMissions, getActiveMissions, getAvailableMissions, getCompletedMissions, acceptMission, cancelMission, updateMissionProgress, completeMission, claimMissionReward, getMissionProgress, getMissionRewards, getMissionsByCategory, getMissionsByDifficulty, getMissionChains, getChainProgress, getNextInChain, getMissionStats, getDailyMissions, getWeeklyMissions, getBonusObjectives, completeBonusObjective, getTotalRewardsEarned, getMissionSuccessRate, getMostCompletedCategory, getStreakData, getMissionHistory, refreshDailyMissions, getRecommendedMissions, getMissionOverview, getMissionCard, getCategoryProgress, getActiveMissionSlots, getRewardSummary, getMissionTimeline } from '@/lib/mission-system-wire'
import { initEmoteSystem, getEmotes, getUnlockedEmotes, getLockedEmotes, unlockEmote, getEmote, getEmotesByCategory, getCategories as emoteGetCategories, playEmote, getQuickEmotes, setQuickEmote, getRecentEmotes, getEmoteHistory, getEmoteStats, getMostUsedEmotes, getLeastUsedEmotes, getFavoriteEmote, getEmoteAnimation, getEmotePack, getEmotePacks, getPackProgress, unlockPack, checkEmoteCombo, getActiveComboEffect, getEmoteUnlockProgress, getEmoteSystemOverview, getEmoteGrid, getEmoteCard, getEmoteStatsGrid, getQuickEmoteBar, suggestEmote } from '@/lib/emote-system-wire'
import { initWordAnalytics, getWordPerformanceData, waGetWordStats, getWordFrequency as waGetWordFrequency, getWordLengthDistribution, getDifficultyBreakdown, getCategoryPerformance as waGetCategoryPerformance, getTimeBasedTrends, getLearningCurve, getVocabularyGrowth, getWordPatterns, getWeakWords, getStrongWords, getWordInsights, getAverageWordLength, getLongestStreak as waGetLongestStreak, getWordAccuracy, getCommonMistakes, getImprovementAreas as waGetImprovementAreas, getWordTimeline, getWeeklyReport as waGetWeeklyReport, getMonthlyReport, getAnalyticsOverview, getPerformanceCard, getGrowthChart, getWordCloud as waGetWordCloud, getDistributionGrid, getInsightCard, getTrendChart, getWeaknessCard, getSummaryCard as waGetSummaryCard } from '@/lib/word-analytics-wire'
import { initColorStudio, getPalettes, getCurrentPalette, selectPalette, createPalette, deletePalette, exportPalette, importPalette, getPaletteHistory, getRandomPalette, getSimilarPalettes, getColorStats, getMostUsedPalette, getPalettePreview, getActiveColorMode, setColorMode, getGradients, createGradient, getGradientPreview, getThemeColors, applyPalette as csApplyPalette, getColorOverview, getPaletteGrid, getPaletteCard, getGradientCard, getColorStatsGrid, getMoodPalettes, suggestPalette, saveCustomColor, getCustomColors, getComplementaryColor, getShade, getTint, hexToRgb as csHexToRgb, rgbToHex as csRgbToHex } from '@/lib/color-studio-wire'
import { initAvatarCustomizer, getParts, getPartOptions, getCurrentAvatarData, setPart, getRandomizeAvatar, getPresetAvatars, applyPreset as avApplyPreset, saveOutfit, loadOutfit, deleteOutfit, getOutfits, generateShareCode as avGenShareCode, importAvatarCode, getAvatarStats, getMostUsedPart, getAvatarHistory, getAvatarOverview, getAvatarCard, getPartGrid, getActiveSlot, getAvatarPreview, getColorForPart, setColorForPart, getColors, unlockPart, isPartUnlocked, getUnlockProgress, getFullAvatar, resetAvatar, getPartCounts, getRarityForPart, getAvatarGallery, getCollectionProgress as avGetCollectionProgress, suggestAvatar, getAvatarBanner } from '@/lib/avatar-customizer-wire'
import { initTeamSystem, getTeams, createTeam, joinTeam, leaveTeam, disbandTeam, getMyTeam, getTeamMembers, addMember, removeMember, setMemberRole, getTeamStats, getTeamLeaderboard, getTeamRank, getTeamChat, sendTeamMessage, getTeamActivity, getTeamAchievements, getTeamAchievementProgress, getTeamOverview, getTeamCard, getMemberGrid, getTeamComparison, getTeamInvites, acceptInvite, declineInvite, getTeamSettings, updateTeamName, updateTeamAvatar, getTeamBanner as tmGetTeamBanner, getTeamRoster, getTeamPerformance, getTeamGoals, getTeamMilestones, getRecommendedTeams } from '@/lib/team-system-wire'
import { doInitBingoSystem as initBingoSystem, doGenerateCard as generateCard, doShuffleCard as shuffleCard, doMarkWord as markWord, doCheckBingo as checkBingo, doUnmarkWord as unmarkWord, doGetAutoMarkHint as autoMarkHint, doStartGame as startGame, doEndGame as endGame, doResetGame as resetGame, getBingoOverview, getBingoCard, getPatternGrid, getActiveGameCard, getDailyBingoCard, getStatsGrid as bgGetStatsGrid, getHistoryList, getAchievementGrid as bgGetAchievementGrid, getSuggestedWords, getWordFrequency as bgGetWordFrequency, getDifficultyLabel as bgGetDifficultyLabel, calculateScore, formatGameTime, isGameActive, getPatternProgressMap, getRemainingCellCount } from '@/lib/word-bingo-wire'
import { getMapData, getViewportBounds, getZoomLevels, setZoom, zoomIn, zoomOut, pan, centerOn, centerOnSnake, fitToContent, addMarker, removeMarker, updateMarker, getMarkerCount, addWaypoint, removeWaypoint, getNextWaypoint, getWaypointRoute, clearWaypoints, updateSnakePosition, getSnakeTrail, getSnakeHeatmap, revealCell, getRevealedPercentage, setRevealRadius, addBookmark, removeBookmark, getVisitedHeatmap, getOptimalPath, getMiniMapOverview, getMapGrid, getStatsGrid as mmGetStatsGrid, getZoneOverlay, getMinimapSettings } from '@/lib/mini-map-wire'
import { gatherMaterial, spendMaterial, getMaterialById, getMaterialsByRarity, unlockRecipe, getAvailableRecipes, canCraft as pfCanCraft, queueCraft, removeFromQueue, reorderQueue, processQueue, getQueueStatus, getEstimatedCompletion, combinePowerUp, usePowerUp as pfActivatePowerUp, equipPowerUp, unequipPowerUp, getEquippedEffects, getActiveBuffs, generateDailyDeals, purchaseDeal, getDealTimer, activateBlueprint, getBlueprintProgress, getFactoryOverview, getMaterialGrid, getRecipeGrid, getProductionQueueUI, getEquippedSlots, getCombinePreview, getBlueprintGallery, getRarityDistribution as pfGetRarityDistribution, getFactoryLevelCard, getXPToNextLevel } from '@/lib/powerup-factory-wire'
import { initDailyFortune, crackCookie, getFortuneEffect, generateLuckyNumbers, generateLuckyWords, getLuckyBonus, selectZodiacSign, getTodayReading, getHoroscopeCompatibility, getWisdomInsight, shareWisdom, drawDailyTarot, castRunes, checkFortuneStreak, getAllZodiacSigns, getAllTarotCards, getAllRunes, getFortuneHistory, getFortuneOverview, getFortuneCookieCard, getLuckyDisplay, getHoroscopeCard, getWisdomCard, getTarotSpread, getRuneCasting, getFortuneScoreCard, getStreakCard as dfGetStreakCard, getAchievementGrid as dfGetAchievementGrid, getHistoryTimeline, getCollectionProgress as dfGetCollectionProgress, getMoodIndicator, getShareCode, resetFortuneData } from '@/lib/daily-fortune-wire'
import { trInit, trStartRace, trEndRace, trResumeRace, trSubmitWord, trGetCurrentWord, trGetWPM, trGetAccuracy, trGetCurrentStreak, trGetBestStreak, trGetRecentRaces, trGetLeaderboard, trGetDailyChallenge, trIsDailyCompleted, trGetDailyStreak, trGetAchievements, trCheckAchievements, trGetTypingOverview, trGetStatsGrid, trGetKeyboardHeatmap, trGetAllRaceTypeCards, trGetDailyCard, trGetRaceStatus, trGetRaceConfig, trGetLives, trGetComboMultiplier, trGetScore, trGetRemainingTime, trGetElapsedTime, trGetRaceProgress } from '@/lib/word-typing-race-wire'
import { thInit, thStartHunt, thAbandonHunt, thGetClue, thUseHint, thCheckAnswer, thGetRegions, thGetMapOverview, thGetStatsGrid, thGetCollectionGrid, thGetAchievementGrid, thGetDailyCard, thGetCompassHint, thGetHuntOverview, thGetStreak, thIsDailyCompleted, thGetDailyStreak, thGetAchievements, thCheckAchievements } from '@/lib/treasure-hunt-wire'
import { msInit, msGetMuseumOverview, msGetHalls, msGetHallExhibits, msGetHallCompletion, msGetMuseumScore, msGetRecentExhibits, msCollectExhibit, msGetTours, msStartTour, msGetTourProgress, msCompleteTour, msRecordVisit, msGetVisitStats, msGetSouvenirs, msBuySouvenir, msGetMuseumCoins, msGetPhotoSpots, msCapturePhoto, msGetPhotoGallery, msGetFeaturedExhibit, msGetAudioGuide, msGetAchievements, msCheckAchievements, msGetMuseumLevel, msGetOverviewCard, msGetHallCard, msGetExhibitCard, msGetExhibitGrid, msGetTourCard, msGetStatsGrid, msGetShopCard, msGetPhotoSpotCard, msGetLevelCard } from '@/lib/achievement-museum-wire'
import { arInit, arStartGame, arEndGame, arPauseGame, arResumeGame, arGetActiveGame, arIsGameActive, arFlipCard, arDestroyWord, arSortWord, arSubmitChainWord, arCatchLetter, arFindWord, arSolveAnagram, arSolveMath, arGetScore, arGetHighScores, arGetGameGrade, arGetAllHighScores, arGetTokens, arEarnTokens, arSpendTokens, arGetDailyChallenge, arStartDaily, arGetDailyProgress, arIsDailyCompleted, arGetAchievements, arCheckAchievements, arGetArcadeStats, arGetArcadeOverview, arGetGameCard, arGetGameGrid, arGetStatsGrid, arGetAchievementGrid, arGetLeaderboardCard, arGetDailyCard, arGetTokenCard, arGetGamesPlayed, arGetTotalTime, arGetWinRate } from '@/lib/mini-arcade-wire'
import { evGetState, evResetState, evGetEvolutionPaths, evGetCurrentPath, evSetCurrentPath, evGetStageProgress, evAddXP, evEvolve, evGetAbilities, evUnlockAbility, evActivateAbility, evGetMutations, evRollMutation, evApplyMutation, evRemoveMutation, evGetMutationSynergy, evGetDNA, evCollectDNA, evCombineDNA, evGetEvolutionHistory, evGetEvolutionOverview, evGetEvolutionTree, evGetEvolutionDashboard, evGetPathStats, evResetPath, evGetActiveEffects, evGetPathCard, evGetAbilityCard, evGetMutationCard, evGetDNACard, evGetStageUpgrades, evGetTotalMutationsApplied, evGetRarestMutation, evHasSynergy, evGetSynergyDescription } from '@/lib/snake-evolution-wire'
import { alGetState, alResetState, alGetLabLevel, alGetLab, alAddLabXP, alGetRooms, alUnlockRoom, alGetLetterTiers, alGetSuccessRate, alGetTransmutationCost, alTransmuteLetters, alGetRecipes, alGetDiscoveredRecipes, alDiscoverRecipe, alGetPotions, alBrewPotion, alUsePotion, alGetElements, alGetElementMastery, alAddElementXP, alGetElementCombos, alCombineElements, alGetElixirs, alBrewElixir, alCollectElixir, alGetDailyChallenge as alGetDailyChallenge, alCompleteDailyChallenge, alGetAlchemyOverview, alGetLabDashboard, alGetRecipeCard, alGetElementCard, alGetElixirCard, alGetTransmutationHistory, alGetMaterials, alGetMaterialsCount, alSpendMaterial, alGetPotionEffects, alGetActiveBuffs, alGetAlchemyScore, alGetElementComboResults } from '@/lib/word-alchemy-wire'
import { dgGetState, dgResetState, dgGetDungeons, dgGetDungeon, dgStartRun, dgEndRun, dgGetCurrentRun, dgGetCurrentFloor, dgEnterFloor, dgClearFloor, dgGetFloorType, dgGetFloorPuzzle, dgGetNextFloor, dgGetFloorMap, dgAttackMonster, dgTakeDamage, dgHeal, dgGetMonster, dgGetBoss, dgGetLoot, dgPickupLoot, dgEquipItem, dgGetInventory, dgDropItem, dgUsePotion as dgUsePotion, dgGetUpgrades, dgGetUpgradeCost, dgBuyUpgrade, dgGetPlayerStats, dgGetRunStats, dgGetDungeonStats, dgGetBestRun, dgGetTotalGoldEarned, dgGetRunHistory, dgGetDailyDungeon, dgCompleteDailyDungeon, dgGetDungeonOverview, dgGetDungeonDashboard, dgGetDungeonCard, dgGetFloorCard, dgGetMonsterCard } from '@/lib/puzzle-dungeon-wire'
import { glGetState, glResetState, glGetGuild, glCreateGuild, glJoinGuild, glLeaveGuild, glDisbandGuild, glGetMembers, glGetMember, glKickMember, glPromoteMember, glDemoteMember, glGetRoles, glGetRolePermissions, glGetEmblems, glSetEmblem, glGetSettings, glUpdateSetting, glGetGuildLevel, glAddGuildXP, glGetWars, glStartWar, glGetWarResults, glGetWarHistory, glGetWarTrophies, glGetQuests, glStartQuest, glContributeToQuest, glGetChatMessages, glSendMessage, glGetUnreadCount, glGetRankings, glGetGuildRank, glGetAchievements, glUnlockAchievement, glGetApplications, glApplyToGuild, glAcceptApplication, glGetTopContributors, glGetContributionRank, glGetGuildStats, glGetWeeklyProgress, glGetAvailableGuilds, glSearchGuilds, glGetGuildCard, glGetMemberCard, glGetWarCard, glGetGuildOverview, glGetGuildDashboard, glGetGuildEmblem, glGetGuildMotto } from '@/lib/guild-system-wire'
import { gnGetState, gnResetState, gnGetLab, gnGetLabLevel, gnAddLabXP, gnGetStations, gnIsStationUnlocked, gnGetGenes, gnGetGene, gnExtractGene, gnExtractRandom, gnSpliceGenes, gnGetSpliceResult, gnGetHybridRecipes, gnGetDiscoveredHybrids, gnGetMutations, gnInduceMutation, gnGetMutationRisk, gnGetVault, gnGetVaultCapacity, gnTradeGenes, gnGetDailyResearch, gnCompleteDailyResearch, gnGetResearchStreak, gnGetAchievements, gnCheckAchievements, gnGetGeneLabOverview, gnGetLabDashboard, gnGetGeneCard, gnGetStationCard, gnGetHybridCard, gnGetGeneStats, gnGetPurity, gnGetStability, gnGetActiveEffects, gnGetEquippedGenes, gnEquipGene, gnUnequipGene, gnPurifyGene, gnGetPurificationCost, gnGetTotalExtractions, gnGetTotalSplices, gnGetRarestGene, gnGetDNAPoints, gnGetGenePortfolio, gnGetExtractionRate, gnGetGeneByType, gnStashGene, gnUnstashGene, gnDestroyGene } from '@/lib/gene-lab-wire'
import { lcGetState, lcResetState, lcGetChapters, lcGetChapter, lcGetEntries, lcGetEntry, lcGetEntriesByChapter, lcReadEntry, lcIsRead, lcGetReadEntries, lcDiscoverEntry, lcUnlockSecret, lcGetCharacters, lcGetCharacter, lcGetCharacterRelationships, lcGetTimeline, lcGetEvent, lcGetSecrets, lcGetTriviaQuestions, lcAnswerTrivia, lcGetDailyLore, lcGetDailyTrivia, lcGetReadingStreak, lcGetCodexOverview, lcGetCodexDashboard, lcGetChapterCard, lcGetEntryCard, lcGetCharacterCard, lcGetCompletionPercentage, lcGetLorePoints, lcGetMasteryRank, lcGetTotalWordsRead, lcGetReadingTime, lcGetFavoriteChapter, lcSearchLore, lcGetRelatedEntries, lcGetLoreRank, lcGetNextUnlock, lcGetAchievements, lcCheckAchievements } from '@/lib/lore-codex-wire'
import { tpGetState, tpResetState, tpGetRange, tpGetRangeLevel, tpAddRangeXP, tpGetModes, tpStartSession, tpEndSession, tpShoot, tpMiss, tpGetCombo, tpResetCombo, tpGetTargets, tpSpawnTarget, tpGetTargetTypes, tpGetWeapons, tpGetWeapon, tpEquipWeapon, tpGetEquippedWeapon, tpGetScore, tpGetAccuracy, tpGetGrade, tpGetStats, tpGetBestScore, tpGetTotalShots, tpGetAchievements, tpCheckAchievements, tpGetDailyChallenge, tpCompleteDailyChallenge, tpGetDailyStreak, tpGetTargetPracticeOverview, tpGetRangeDashboard, tpGetModeCard, tpGetWeaponCard, tpGetTargetCard, tpGetLeaderboard, tpGetRank, tpGetReactionTime, tpGetShotsPerMinute, tpGetWeaponMastery, tpGetSessionHistory, tpGetRecentSessions, tpGetActiveSession, tpIsSessionActive, tpGetSessionTimer, tpDefeatBoss, tpGetBossWord, tpGetBossProgress, tpUpdateTargets } from '@/lib/target-practice-wire'
import { cvGetState, cvResetState, cvGetCarnival, cvGetCarnivalLevel, cvAddTickets, cvGetAttractions, cvGetAttraction, cvPlayAttraction, cvSpinWheel, cvGetWheelResult, cvGetFreeSpins, cvGetSpinHistory, cvTossRing, cvGetRingTossState, cvGetPegs, cvWhackWord, cvWhackMiss, cvGetWhackAWordState, cvGetMoles, cvPopBalloon, cvGetBalloonPopState, cvGetBalloons, cvGetFortune, cvGetFortuneHistory, cvGetPrizes, cvRedeemPrize, cvGetPrizeCollection, cvGetTickets, cvGetTokens, cvSpendTickets, cvSpendTokens, cvGetEvent, cvGetEventLeaderboard, cvGetEventAchievements, cvGetAchievements, cvCheckAchievements, cvGetCarnivalOverview, cvGetCarnivalDashboard, cvGetAttractionCard, cvGetPrizeCard, cvGetWheelCard, cvGetStats, cvGetTotalGamesPlayed, cvGetBestScore as cvGetBestScore, cvGetCarnivalRank, cvGetNextPrizeUnlock, cvGetDailyBonus, cvClaimDailyBonus, cvGetSeasonProgress, cvGetSeasonPrizes, cvGetJackpot, cvUseFreeSpin } from '@/lib/carnival-wire'
import { rbGetState, rbResetState, rbGetFactory, rbGetFactoryLevel, rbAddFactoryXP, rbGetWorkshopUpgrades, rbUpgradeWorkshop, rbGetAssemblySpeed, rbGetQualityBonus, rbGetAllParts, rbGetPart, rbGetPartsByType, rbGetPartsByRarity, rbGetPartStats, rbGetInventory, rbAddPart, rbRemovePart, rbGetInventoryCount, rbBuildRobot, rbSetName, rbGetRobot, rbGetRobots, rbGetRobotStats, rbGetClassBonus, rbSetPart, rbGetOpponents, rbStartBattle, rbAttack, rbDefend, rbUseAbility, rbGetBattleState, rbGetBattleLog, rbEndBattle, rbGetBattleHistory, rbGetWinStreak, rbGetDailyBlueprint, rbGetDailyChallenge, rbCompleteDailyChallenge, rbGetTournament, rbGetTournamentProgress, rbDismantlePart, rbGetScrapCount, rbSpendScrap, rbForgeCost, rbForgePart, rbEnhanceCost, rbEnhancePart, rbFuseCost, rbFuseParts, rbGetStatsGrid, rbGetPartCard, rbGetRobotCard, rbGetOpponentCard, rbGetBattleCard, rbGetDailyCard, rbGetAchievements, rbCheckAchievements, rbGetFactoryOverview, rbGetFactoryDashboard } from '@/lib/robot-factory-wire'
import { djGetState, djResetState, djGetDreams, djGetDream, djRecordDream, djDeleteDream, djGetDreamsByCategory, djGetDreamsByMood, djSearchDreams, djGetDreamCount, djGetSymbols, djGetSymbolMeaning, djInterpretDream, djGetDreamMeaningScore, djGetDailyInterpretation, djGetRealms, djGetRealm, djDiscoverRealm, djVisitRealm, djGetRealmProgress, djExploreRealm, djGetDiscoveredRealms, djGetLucidLevel, djAddLucidXP, djGetLucidAbilities, djUnlockAbility, djPerformRealityCheck, djGetRealityChecks, djGetSleepQuality, djGetSleepChart, djGetSleepPatterns, djGetRecommendations, djGetDreamFrequency, djGetDailyPrompt, djGetDailyChallenge, djCompleteDailyChallenge, djGetStreak, djCheckStreakMilestone, djGetJournalOverview, djGetDreamCard, djGetRealmCard, djGetInterpretationCard, djGetSleepCard, djGetDailyCard, djGetStatsGrid, djGetAchievements, djCheckAchievements, djGetMasteryRank, djGetCategories, djGetMoods, djGetRealmDefinitions, djGetRealityCheckTypes, djGetAllTags } from '@/lib/dream-journal-wire'
import { pxGetState, pxResetState, pxCreateCanvas, pxGetCanvas, pxGetActiveCanvas, pxDeleteCanvas, pxResizeCanvas, pxSetPixel, pxGetPixel, pxFillArea, pxDrawLine, pxDrawRect, pxDrawCircle, pxApplyBrush, pxUndo, pxRedo, pxGetHistory, pxClearCanvas, pxGetCanvasSize, pxGetCanvasGrid, pxToggleGrid, pxSetTool, pxGetTool, pxSetZoom, pxGetZoom, pxAddLayer, pxRemoveLayer, pxSetActiveLayer, pxToggleLayerVisibility, pxSetLayerOpacity, pxGetLayers, pxGetPalette, pxSetPalette, pxGetAllPaletteColors, pxGetRecentColors, pxAddRecentColor, pxGetCustomColors, pxSetCustomColor, pxPickColor, pxSetActiveColor, pxGetActiveColor, pxExportPalette, pxImportPalette, pxSaveToGallery, pxGetGallery, pxGetArtwork, pxDeleteArtwork, pxLikeArtwork, pxToggleFavorite, pxGetFavorites, pxSearchGallery, pxFilterByTag, pxGenerateShareCode, pxCreateAnimation, pxGetAnimation, pxGetActiveAnimation, pxGetAnimations, pxAddFrame, pxRemoveFrame, pxDuplicateFrame, pxSetFrameData, pxSetFramePixel, pxGetFramePixel, pxReorderFrame, pxSetPlaybackSpeed, pxGetPlaybackSpeed, pxToggleOnionSkin, pxGetOnionSkinData, pxDeleteAnimation, pxSaveAnimationToGallery, pxGetArtistLevel, pxAddArtistXP, pxGetTitle, pxGetTitleProgress, pxGetStudioCoins, pxSpendCoins, pxEarnCoins, pxGetUnlocks, pxPurchaseUnlock, pxGetXPProgress, pxGetDailyChallenge, pxCompleteDailyChallenge, pxGetWeeklyContest, pxParticipateWeeklyContest, pxGetStreak, pxGetTemplates, pxGetTemplate, pxGetTemplateCategories, pxLoadTemplate, pxGetAchievements, pxCheckAchievements, pxGetAchievementProgress, pxGetStudioOverview, pxGetStatsGrid, pxGetCanvasCard, pxGetArtworkCard, pxGetAnimationCard, pxGetDailyCard, pxGetGalleryGrid, pxGetToolGrid, pxGetPaletteGrid, pxGetCanvasSizeOptions, pxGetWeeklyCard, pxGetAllCanvasCards, pxGetAllAnimationCards, pxGetTemplateGrid, pxGetUnlockGrid, pxGetFrameData, pxGetFrameList } from '@/lib/pixel-art-studio-wire'
import { ibGetState, ibResetState, ibGetIsland, ibGetName, ibSetName, ibGetGrid, ibGetTile, ibSetTerrain, ibImproveTile, ibGetIslandLevel, ibAddIslandXP, ibGetBuildings, ibGetBuilding, ibBuildStructure, ibDemolishStructure, ibUpgradeBuilding, ibGetBuildableBuildings, ibGetBuildingCost, ibCanAfford, ibGetBuildingsOnIsland, ibGetResources, ibGetResource, ibAddResource, ibSpendResource, ibGetProduction, ibGetStorage, ibTradeResources, ibGetTradeRate, ibGetResourceBonus, ibGetPopulation, ibGetHappiness, ibAssignWorker, ibGetWorkerAssignment, ibGetPopulationCapacity, ibGetVisitors, ibGetActiveVisitors, ibGetVisitorSatisfaction, ibGetIslandRating, ibGetVisitorGifts, ibGetActiveEvent, ibProcessEvent, ibGetWeather, ibGetSeason, ibGetSeasonModifier, ibGetDailyTask, ibCompleteDailyTask, ibGetDailyBonus, ibGetWeeklyCompetition, ibGetStreak, ibTick, ibGetIslandOverview, ibGetIslandDashboard, ibGetStatsGrid, ibGetBuildingCard, ibGetResourceCard, ibGetTileCard, ibGetVisitorCard, ibGetEventCard, ibGetDailyCard, ibGetAchievements, ibCheckAchievements, ibGetProductionChart, ibGetGridOverview, ibGetTerrainTypes, ibGetTerrainIcon, ibGetResourceTypes, ibGetResourceIcon, ibGetBuildingCategories, ibGetBuildingsByCategory, ibGetCompatibleBuildings, ibGetWeatherTypes, ibGetSeasons, ibGetEventsList, ibGetImprovementCost, ibCanImproveTile, ibGetTotalWorkers, ibGetAvailableWorkers, ibGetTotalMilitaryPower, ibGetBuildingsCount, ibGetTotalBuildingsEverBuilt, ibGetTotalVisitorsEver, ibGetCategoryIcon } from '@/lib/island-builder-wire'
import {
  Play,
  RotateCcw,
  Pause,
  Trophy,
  Zap,
  Timer,
  Volume2,
  VolumeX,
  Clock,
  Calendar,
  Flame,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Settings,
  Gauge,
  Volume1,
  Moon,
  Share2,
  GraduationCap,
  ChevronRight,
  Lock,
  Package,
  Film,
  Trash2,
  Bot,
  SkipForward,
  SkipBack,
  X,
  Eye,
  BarChart3,
  Music,
  Music4,
  SlidersHorizontal,
  Hammer,
  Globe,
  Target,
  Palette,
  TrendingUp,
} from 'lucide-react'

// Game constants
const CELL_SIZE = 20
const GRID_WIDTH = 30
const GRID_HEIGHT = 25
const CANVAS_WIDTH = GRID_WIDTH * CELL_SIZE
const CANVAS_HEIGHT = GRID_HEIGHT * CELL_SIZE

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type Position = { x: number; y: number }

interface WordFood {
  word: string
  position: Position
  spawnTime: number
  category: WordCategory
  rarity: WordRarity
}

interface FloatingText {
  text: string
  x: number
  y: number
  opacity: number
  vy: number
  color: string
  scale: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

interface PowerUp {
  type: PowerUpType
  position: Position
  spawnTime: number
}

interface ActivePowerUp {
  type: PowerUpType
  expiresAt: number // Date.now() when it expires, 0 for instant
}

interface GameState {
  snake: Position[]
  direction: Direction
  wordFood: WordFood | null
  gameStarted: boolean
  gameOver: boolean
  paused: boolean
  score: number
  speed: number
  wordsEaten: number
  difficulty: 'easy' | 'medium' | 'hard'
  startTime: number
  elapsedTime: number
  soundEnabled: boolean
  activeCategories: Set<WordCategory>
  lastAchievement: { title: string; description: string; emoji: string } | null
  isDailyChallenge: boolean
  dailyChallengeWords: string[]
  dailyWordsCollected: string[]
  dailyTargetScore: number
  streakMultiplier: number
  powerUp: PowerUp | null
  activePowerUps: ActivePowerUp[]
  comboCount: number
  lastEatenCategory: WordCategory | null
  comboMultiplier: number
  weather: 'clear' | 'rain' | 'snow' | 'stars'
  activeSkin: SnakeSkin
  showMiniMap: boolean
  gridTheme: GridThemeId
  extraLifeAvailable: boolean
  lastMilestone: { name: string; emoji: string; description: string } | null
  isSpeedRun: boolean
  speedRunTimeLeft: number // seconds remaining
  speedRunMaxCombo: number
  speedRunPowerUpsCollected: number
  speedRunLongestSnake: number
  wordsByCategory: Record<string, number>
  inGameDifficulty: InGameDifficulty | null
  obstacles: Obstacle[]
  portalPairs: PortalPair[]
  activeQuiz: WordQuiz | null
  quizStreak: number
  iceSlideQueued: boolean
  boss: BossWord | null
  bossDefeats: number
  activeBotSkin: AiBotSkin
  pvpPowerUpState: PvpPowerUpState | null
  activeScramble: WordScramble | null
  coinBalance: number
  comboVfxParticles: ComboParticle[]
  shopItems: ShopItem[]
}

const DIFFICULTY_SETTINGS = {
  easy: { speed: 180, speedInc: 1, minSpeed: 90, label: 'Easy', dotColor: 'bg-green-400' },
  medium: { speed: 140, speedInc: 2, minSpeed: 65, label: 'Medium', dotColor: 'bg-amber-400' },
  hard: { speed: 100, speedInc: 3, minSpeed: 45, label: 'Hard', dotColor: 'bg-red-400' },
}

const DIFFICULTY_THRESHOLDS = { easy: 0, medium: 50, hard: 150 }

const ALL_CATEGORIES: WordCategory[] = ['nature', 'emotion', 'element', 'time', 'creature', 'quality', 'object', 'action']

// Weather gameplay configuration
const WEATHER_CONFIG: Record<GameState['weather'], {
  emoji: string
  label: string
  effect: string
  speedMultiplier: number // 1.0 = normal, higher = slower tick
  pointMultiplier: number // 1.0 = normal, higher = more points
  badgeBg: string
}> = {
  clear: { emoji: '☀️', label: 'Clear', effect: '', speedMultiplier: 1.0, pointMultiplier: 1.0, badgeBg: 'bg-slate-700' },
  rain: { emoji: '🌧️', label: 'Rain', effect: '-10% speed', speedMultiplier: 1.1, pointMultiplier: 1.0, badgeBg: 'bg-blue-900/50' },
  snow: { emoji: '❄️', label: 'Snow', effect: 'Fog & -5% speed', speedMultiplier: 1.05, pointMultiplier: 1.0, badgeBg: 'bg-cyan-900/50' },
  stars: { emoji: '⭐', label: 'Stars', effect: '+20% points', speedMultiplier: 1.0, pointMultiplier: 1.2, badgeBg: 'bg-amber-900/50' },
}

// Module-level achievement queue for cascading toasts
const achievementQueue = new AchievementQueue()

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 }
}

function loadActiveCategories(): Set<WordCategory> {
  if (typeof window === 'undefined') return new Set(ALL_CATEGORIES)
  try {
    const stored = localStorage.getItem('word-snake-categories')
    if (stored) {
      const parsed = JSON.parse(stored) as string[]
      const valid = parsed.filter((c): c is WordCategory => ALL_CATEGORIES.includes(c as WordCategory))
      if (valid.length > 0) return new Set(valid)
    }
  } catch { /* ignore */ }
  return new Set(ALL_CATEGORIES)
}

function saveActiveCategories(categories: Set<WordCategory>) {
  try {
    localStorage.setItem('word-snake-categories', JSON.stringify([...categories]))
  } catch { /* ignore */ }
}

// Draw a tiny preview of a grid theme on a small canvas
function drawThemePreview(canvas: HTMLCanvasElement, theme: { bgColor: string; gridColor: string; gridType: string; scanlines?: boolean; borderColor: string }) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height

  ctx.fillStyle = theme.bgColor
  ctx.fillRect(0, 0, w, h)

  // Draw simplified grid pattern
  const step = 4
  ctx.fillStyle = theme.gridColor

  if (theme.gridType === 'dots') {
    for (let x = 0; x < w; x += step) {
      for (let y = 0; y < h; y += step) {
        ctx.globalAlpha = 0.4
        ctx.beginPath()
        ctx.arc(x, y, 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  } else if (theme.gridType === 'lines') {
    ctx.strokeStyle = theme.gridColor
    ctx.globalAlpha = 0.2
    ctx.lineWidth = 0.5
    for (let x = 0; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }
  } else if (theme.gridType === 'crosshatch') {
    ctx.strokeStyle = theme.gridColor
    ctx.globalAlpha = 0.12
    ctx.lineWidth = 0.5
    for (let x = 0; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }
    ctx.globalAlpha = 0.06
    for (let d = -h; d < w + h; d += 4) {
      ctx.beginPath(); ctx.moveTo(d, 0); ctx.lineTo(d - h, h); ctx.stroke()
    }
  } else if (theme.gridType === 'organic') {
    for (let x = 0; x < w; x += step) {
      for (let y = 0; y < h; y += step) {
        const hash = ((x * 7919 + y * 104729 + 42) % 100) / 100
        ctx.globalAlpha = 0.2 + hash * 0.3
        ctx.beginPath()
        ctx.arc(x, y, 0.5 + hash, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
  ctx.globalAlpha = 1

  // Border
  ctx.strokeStyle = theme.borderColor
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.5
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1)
  ctx.globalAlpha = 1

  // Scanlines for retro theme
  if (theme.scanlines) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
    for (let y = 0; y < h; y += 2) {
      ctx.fillRect(0, y, w, 1)
    }
  }
}


export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { addWord, getWordList, getTotalCount } = useWordStore()
  const [highScore, setHighScore] = useState(0)
  const [leaderboardRank, setLeaderboardRank] = useState(0)

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Achievement gallery
  const [showAchievementGallery, setShowAchievementGallery] = useState(false)

  // Game stats dialog
  const [showGameStats, setShowGameStats] = useState(false)

  // Custom words dialog
  const [showCustomWords, setShowCustomWords] = useState(false)

  // Keyboard shortcuts dialog
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Replay dialog
  const [showReplayDialog, setShowReplayDialog] = useState(false)
  const [replayList, setReplayList] = useState<GameReplay[]>([])
  const [replayMode, setReplayMode] = useState(false)
  const [replaySpeed, setReplaySpeed] = useState(1)
  const [replayPaused, setReplayPaused] = useState(false)
  const [replayProgress, setReplayProgress] = useState(0)
  const [replayFrame, setReplayFrame] = useState<ReplayFrame | null>(null)

  // Sound theme state
  const [activeSoundTheme, setActiveSoundTheme] = useState<SoundThemeId>('default')
  const [soundWavePulse, setSoundWavePulse] = useState(false)

  // Trail state
  const [activeTrail, setActiveTrail] = useState<SnakeTrailType>('none')
  const trailParticlesRef = useRef<TrailParticle[]>([])
  const visualizerBarsRef = useRef<VisualizerBar[]>([])
  const lastFrameTimeRef = useRef(0)

  // Daily challenge state (lazy init to avoid hydration mismatch)
  const [dailyInfo, setDailyInfo] = useState<{
    challenge: DailyChallenge | null
    played: boolean
    result: { completed: boolean; score: number } | null
  }>({ challenge: null, played: false, result: null })

  // Streak state (lazy init to avoid hydration mismatch)
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null)

  // Active word pack state
  const [activeWordPack, setActiveWordPack] = useState<string>('default')
  const [unlockedPackIds, setUnlockedPackIds] = useState<string[]>([])
  const [wordPackToast, setWordPackToast] = useState<{ name: string; emoji: string; description: string } | null>(null)
  const wordPackToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track if mounted (client-side only data loading)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Load client-only state after mount using microtask to avoid cascading render lint
  useEffect(() => {
    if (!mounted) return
    const loadData = () => {
      const stored = localStorage.getItem('word-snake-highscore')
      if (stored) setHighScore(parseInt(stored, 10))
      // Load difficulty-specific best score
      const gs = gameStateRef.current
      const diffBest = getBestScore(gs.difficulty)
      if (diffBest > 0) setHighScore(diffBest)
      setDailyInfo({
        challenge: getDailyChallenge(),
        played: isDailyChallengePlayed(),
        result: getDailyChallengeResult(),
      })
      setStreakInfo(getStreak())
      // Load saved skin (fallback to classic if locked)
      const savedSkin = getSavedSkin()
      const resolvedSkin = isSkinUnlocked(savedSkin) ? savedSkin : 'classic'
      gameStateRef.current.activeSkin = resolvedSkin
      setActiveSkin(resolvedSkin)
      // Load saved grid theme
      const savedTheme = getSavedGridTheme()
      gameStateRef.current.gridTheme = savedTheme
      setActiveGridTheme(savedTheme)
      // Load mini-map visibility
      try {
        const mapPref = localStorage.getItem('word-snake-minimap')
        if (mapPref !== null) {
          const showMap = mapPref === 'true'
          gameStateRef.current.showMiniMap = showMap
          updateUI()
        }
      } catch { /* ignore */ }
      // Load saved sound theme
      const savedSoundTheme = getSavedSoundTheme()
      setSoundTheme(savedSoundTheme)
      setActiveSoundTheme(savedSoundTheme)
      // Load saved trail
      const savedTrail = getSavedTrail()
      setActiveTrail(savedTrail)
      // Load speed run best
      const srBest = getSpeedRunBest()
      setSpeedRunBest({ bestScore: srBest.bestScore, totalRuns: srBest.totalRuns })
      // Load night mode config
      const nmConfig = getNightModeConfig()
      if (nmConfig.autoEnabled && typeof window !== 'undefined') {
        nmConfig.enabled = isNightTime()
      }
      setNightMode(nmConfig)
      // Load dynamic difficulty
      setDynDiff(getDifficultyAdjustment())
      // Load tutorial state
      setTutorialCompleted(isTutorialCompleted())
      // Load active word pack and unlocked packs
      const savedPack = getActivePack()
      setActiveWordPack(savedPack)
      const unlocked = WORD_PACKS.filter(p => isPackUnlocked(p)).map(p => p.id)
      setUnlockedPackIds(unlocked)
      // Load high contrast accessibility config
      setHighContrast(getHighContrastConfig())
      // Load particle customization
      particleCustomRef.current = getSavedParticleCustomization()
      // Initialize music engine
      if (!musicEngineRef.current) {
        musicEngineRef.current = getMusicEngine()
      }
      const mConfig = musicEngineRef.current.getConfig()
      setMusicStyle(mConfig.style)
      setMusicVolume(mConfig.volume)
      // Initialize AI difficulty slider
      if (!aiDiffSliderRef.current) {
        aiDiffSliderRef.current = createAiDifficultySlider(5, 4)
      }
      setAiDiffLevel(aiDiffSliderRef.current.getLevel())
      // Load multilingual packs
      setMultilingualPacks(getAllMultilingualPacks())
      // Load persistent event count
      setPersistentEventCount(getEventHistoryCount())
      // Load volume slider config
      setVolumeConfig(loadVolumeConfig())
      // Load active multilingual pack (if any was previously selected)
      const savedMultiPack = localStorage.getItem('wordsnake_active_multilingual_pack')
      if (savedMultiPack && hasAnyUnlockedMultilingualPack()) {
        setActiveMultilingualPack(savedMultiPack)
      }
      // Load multilingual achievement state
      const savedMultiAch = localStorage.getItem('wordsnake_multilingual_achievements')
      if (savedMultiAch) {
        try { setMultilingualAchievementsUnlocked(JSON.parse(savedMultiAch)) } catch { /* ignore */ }
      }
      // Calculate responsive layout
      layoutMetricsRef.current = calculateLayout(deviceInfo, responsiveConfig)
      // Load SFX volume config
      setSfxConfig(loadSfxConfig())
      // Load custom word packs
      setCustomWordPacks(loadWordPacks())
      // Load stats comparison from recent sessions
      const recentSessions = getLastNSessions(10)
      if (recentSessions.length >= 2) {
        const sessions = getSessions()
        if (sessions.length >= 1) {
          const currentSession = sessions[0]
          setComparisonSummary(compareSessions(currentSession, sessions.slice(1)))
        }
      }
      // Load achievement progress
      const totalWords = parseInt(localStorage.getItem('word-snake-total') ?? '0', 10)
      const gamesPlayed = parseInt(localStorage.getItem('word-snake-games') ?? '0', 10)
      const poemsCreated = parseInt(localStorage.getItem('word-snake-poems-count') ?? '0', 10)
      const multiStats = createMultilingualStats(getTotalMultilingualCollection())
      setAchievementProgress(getFullAchievementProgress(
        { totalWordsCollected: totalWords, totalWordsEaten: totalWords, poemsCreated, highScore: diffBest || parseInt(localStorage.getItem('word-snake-highscore') ?? '0', 10), categories: [], gamesPlayed },
        { bossDefeats: 0, legendaryBossDefeats: 0, portalTeleports: 0, obstacleSurvivals: 0, spikeWordsEaten: 0, totalWordsCollected: totalWords, seasonalSeasonsPlayed: [], unlockedBotSkins: getUnlockedBotSkins().length, maxComboMultiplier: 0, quizCorrectAnswers: 0, quizFastestTime: 0, scramblesSolved: 0, pvpSteals: 0, pvpWins: 0, totalCoins: parseInt(localStorage.getItem('word-snake-coins') ?? '0', 10) },
        multiStats,
      ))
      // Load AI generated packs
      setAiGeneratedPacks(getGeneratedPacks())
      // Load SFX events enabled preference
      const sfxEventsPref = localStorage.getItem('wordsnake_sfx_events_enabled')
      if (sfxEventsPref) setSfxEventsEnabled(sfxEventsPref === 'true')
      // Load save slots
      setSaveSlots(getSaveSlots())
      // Load accessibility config
      setA11yConfig(loadAccessibilityConfig())
      // Initialize SFX event triggerer
      saveTriggerRef.current = createEventTriggerer({ enabled: sfxEventsEnabled === 'true', masterVolume: 0.7, sfxConfig: loadSfxConfig() })
      // Initialize game event hooks — wire SFX sounds to events
      eventCounterRef.current = createEventCounter(['word:eat', 'game:start', 'achievement:unlock', 'combo:increase', 'powerup:collect'])
      // Initialize auto SFX wiring for ALL 38 events
      autoSfxCleanupRef.current = initAutoSfx(sfxEventsPref === 'true', loadSfxConfig())
      // Initialize event analytics
      setEventAnalytics(calculateAnalytics())
      analyticsTimerRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') setEventAnalytics(calculateAnalytics())
      }, 5000)
      // Load accessibility color blind config
      const savedA11y = loadAccessibilityConfig()
      setA11yConfig(savedA11y)
      // Load practice mode config
      setPracticeConfig(loadPracticeConfig())
      setPracticeHistory(getPracticeHistory())
      // Load speed config
      setSpeedConfig(loadSpeedConfig())
      // Load calendar data
      const now = new Date()
      setCalendarMonth(getCalendarForMonth(now.getFullYear(), now.getMonth()))
      setCalendarStats(getCalendarStats())
      // Load sentence of the day
      setSentenceOfTheDay(getSentenceOfTheDay())
      // Load tips
      setTipStats(getTipStats())
      setCurrentTip(getTipOfTheDay())
      // Load mastery stats
      setMasteryStats(getMasteryStats())
      // Load sound panel config
      setSoundPanelConfig(loadPanelConfig())
      // Load score breakdown
      setScoreBreakdown(loadBreakdown())
      // Load player profile
      setPlayerProfile(loadProfile())
    }
    const id = requestAnimationFrame(loadData)
    return () => {
      cancelAnimationFrame(id)
      if (autoSfxCleanupRef.current) autoSfxCleanupRef.current()
      if (analyticsTimerRef.current) clearInterval(analyticsTimerRef.current)
    }
  }, [mounted])

  const gameStateRef = useRef<GameState>({
    snake: [
      { x: 5, y: 12 },
      { x: 4, y: 12 },
      { x: 3, y: 12 },
    ],
    direction: 'RIGHT',
    wordFood: null,
    gameStarted: false,
    gameOver: false,
    paused: false,
    score: 0,
    speed: DIFFICULTY_SETTINGS.medium.speed,
    wordsEaten: 0,
    difficulty: 'medium',
    startTime: 0,
    elapsedTime: 0,
    soundEnabled: true,
    activeCategories: loadActiveCategories(),
    lastAchievement: null,
    isDailyChallenge: false,
    dailyChallengeWords: [],
    dailyWordsCollected: [],
    dailyTargetScore: 0,
    streakMultiplier: 1,
    powerUp: null,
    activePowerUps: [],
    comboCount: 0,
    lastEatenCategory: null,
    comboMultiplier: 1,
    weather: 'clear' as const,
    activeSkin: 'classic' as SnakeSkin,
    showMiniMap: true,
    gridTheme: 'classic' as GridThemeId,
    extraLifeAvailable: false,
    lastMilestone: null,
    isSpeedRun: false,
    speedRunTimeLeft: 60,
    speedRunMaxCombo: 0,
    speedRunPowerUpsCollected: 0,
    speedRunLongestSnake: 0,
    wordsByCategory: {},
    inGameDifficulty: null,
  })

  const lastRenderRef = useRef(0)
  const animFrameRef = useRef<number>(0)
  const directionQueueRef = useRef<Direction[]>([])
  const p2DirectionQueueRef = useRef<Direction[]>([])
  const collectedWordsRef = useRef<Set<string>>(new Set())
  const pvpRef = useRef<PvPState | null>(null)
  const aiBotRef = useRef<AiBotState | null>(null)
  const [showWordBook, setShowWordBook] = useState(false)
  const [showStoryMode, setShowStoryMode] = useState(false)
  const [showStoryLevelSelect, setShowStoryLevelSelect] = useState(false)
  const [showStatsComparison, setShowStatsComparison] = useState(false)
  const [highContrast, setHighContrast] = useState<HighContrastConfig>({ enabled: false, intensity: 'medium', reduceMotion: false, largeText: false })
  const [aiBotActive, setAiBotActive] = useState(false)
  const floatingTextsRef = useRef<FloatingText[]>([])
  const particlesRef = useRef<Particle[]>([])
  const presetParticlesRef = useRef<PresetParticle[]>([])
  const eventFeedRef = useRef<GameEventFeed>(createEventFeed(50))
  const [eventFeedUpdate, setEventFeedUpdate] = useState(0) // trigger re-renders for event feed
  const movingObstaclesRef = useRef<MovingObstacle[]>([])
  const destructibleWallsRef = useRef<DestructibleWall[]>([])
  const [showEventFeed, setShowEventFeed] = useState(true)
  // Particle customization state
  const particleCustomRef = useRef<ParticleCustomization>(createDefaultCustomization())
  // AI difficulty slider
  const aiDiffSliderRef = useRef<AiDifficultySlider | null>(null)
  const [aiDiffLevel, setAiDiffLevel] = useState(5)
  // Music engine state
  const musicEngineRef = useRef<MusicEngine | null>(null)
  const [musicStatus, setMusicStatus] = useState<MusicStatus>('stopped')
  const [musicStyle, setMusicStyle] = useState<MusicStyle>('ambient')
  const [musicVolume, setMusicVolume] = useState(0.15)
  // Responsive UX
  const responsiveConfig = useResponsiveConfig()
  const deviceInfo = useDeviceInfo()
  // Show particle customization panel
  const [showParticlePanel, setShowParticlePanel] = useState(false)
  // Hammer power-up state
  const hammerStateRef = useRef<HammerState>(createInitialHammerState())
  const hammerPowerUpRef = useRef<HammerPowerUp | null>(null)
  const [hammerActive, setHammerActive] = useState(false)
  // Multilingual packs state
  const [multilingualPacks, setMultilingualPacks] = useState<ReturnType<typeof getAllMultilingualPacks>>([])
  const [showMultilingualPanel, setShowMultilingualPanel] = useState(false)
  // Volume slider state
  const [volumeConfig, setVolumeConfig] = useState<VolumeSliderConfig>(createInitialVolumeConfig())
  const [showVolumePanel, setShowVolumePanel] = useState(false)
  // Active multilingual word source
  const [activeMultilingualPack, setActiveMultilingualPack] = useState<string | null>(null)
  const multilingualProgressRef = useRef<Record<string, { total: number; collected: number; percent: number }>>({})
  // Responsive layout metrics
  const layoutMetricsRef = useRef<LayoutMetrics | null>(null)
  // Multilingual achievement tracking
  const [multilingualAchievementsUnlocked, setMultilingualAchievementsUnlocked] = useState<string[]>([])
  // SFX volume control state
  const [sfxConfig, setSfxConfig] = useState<SfxVolumeConfig>(createInitialSfxConfig())
  const [showSfxPanel, setShowSfxPanel] = useState(false)
  // Custom word packs
  const [customWordPacks, setCustomWordPacks] = useState<CustomWordPack[]>([])
  const [showPackCreator, setShowPackCreator] = useState(false)
  const [editingPack, setEditingPack] = useState<CustomWordPack | null>(null)
  // Power-up overlay layout
  const powerUpOverlayLayout = useRef<PowerUpOverlayLayout>('horizontal')
  // Stats comparison state
  const [comparisonSummary, setComparisonSummary] = useState<ComparisonSummary | null>(null)
  // Event feed persistence
  const gameIdRef = useRef<string>(`game-${Date.now()}`)
  const [persistentEventCount, setPersistentEventCount] = useState(0)
  // Achievement progress tracker state
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgressSummary | null>(null)
  const [showAchievementProgress, setShowAchievementProgress] = useState(false)
  // AI word pack generator state
  const [aiGeneratedPacks, setAiGeneratedPacks] = useState<GeneratedWordPack[]>([])
  const [showAiGenerator, setShowAiGenerator] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState(THEME_SUGGESTIONS[0].name)
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [aiWordCount, setAiWordCount] = useState(15)
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  // SFX event sounds state
  const [sfxEventsEnabled, setSfxEventsEnabled] = useState(false)
  // Responsive layout hook
  const responsiveLayout = useResponsiveLayout()
  const currentBreakpoint = useBreakpoint()
  const orientation = useOrientation()
  // Game save/load state
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([])
  const [showSavePanel, setShowSavePanel] = useState(false)
  const saveTriggerRef = useRef<((action: string) => void) | null>(null)
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Accessibility state
  const [a11yConfig, setA11yConfig] = useState<AccessibilityConfig>(DEFAULT_ACCESSIBILITY_CONFIG)
  const [showA11yPanel, setShowA11yPanel] = useState(false)
  // Game event hook system
  const eventCounterRef = useRef<(() => Record<string, number>) | null>(null)
  // Auto SFX wiring cleanup
  const autoSfxCleanupRef = useRef<(() => void) | null>(null)
  // Event analytics
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics | null>(null)
  const [showEventAnalytics, setShowEventAnalytics] = useState(false)
  const analyticsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Practice Mode
  const [showPracticeMode, setShowPracticeMode] = useState(false)
  const [practiceConfig, setPracticeConfig] = useState<PracticeModeConfig>(createPracticeConfig())
  const [practiceSession, setPracticeSession] = useState<PracticeSession | null>(null)
  const [practiceStats, setPracticeStats] = useState<PracticeStats | null>(null)
  const [practiceHistory, setPracticeHistory] = useState<PracticeSessionSummary[]>([])
  // Game Speed Config
  const [speedConfig, setSpeedConfig] = useState<SpeedConfig>(createSpeedConfig())
  const [showSpeedConfig, setShowSpeedConfig] = useState(false)
  // Daily Challenge Calendar
  const [showCalendarPanel, setShowCalendarPanel] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState<CalendarMonth | null>(null)
  const [calendarStats, setCalendarStats] = useState<CalendarStats | null>(null)
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear())
  const [calendarMonthIdx, setCalendarMonthIdx] = useState(new Date().getMonth())
  // Word Sentences
  const [showWordSentences, setShowWordSentences] = useState(false)
  const [currentWordSentence, setCurrentWordSentence] = useState<WordSentence | null>(null)
  const [sentenceOfTheDay, setSentenceOfTheDay] = useState<WordSentence | null>(null)
  // Game Tips
  const [showTipsPanel, setShowTipsPanel] = useState(false)
  const [currentTip, setCurrentTip] = useState<GameTip | null>(null)
  const [tipConfig, setTipConfig] = useState<TipConfig>(createTipConfig())
  const [tipStats, setTipStats] = useState({ total: 0, shown: 0, dismissed: 0, remaining: 0 })
  const tipTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Word Mastery
  const [showMasteryPanel, setShowMasteryPanel] = useState(false)
  const [masteryStats, setMasteryStats] = useState<MasteryStatsType | null>(null)
  // Stats Export
  const [showExportPanel, setShowExportPanel] = useState(false)
  const [exportConfig, setExportConfig] = useState<ExportConfig>(createDefaultExportConfig())
  // Sound Theme Panel
  const [showSoundPanel, setShowSoundPanel] = useState(false)
  const [soundPanelConfig, setSoundPanelConfig] = useState<SoundThemePanelConfig>(createPanelConfig())
  const [activePresetName, setActivePresetName] = useState('default')
  // Score Breakdown
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown>(createScoreBreakdown())
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false)
  // Notification Manager
  const [notifQueue] = useState<NotificationQueue>(() => createNotificationQueue())
  const [activeNotif, setActiveNotif] = useState<Notification | null>(null)
  // Game Mode Selector
  const [showModeSelector, setShowModeSelector] = useState(false)
  const [currentGameMode, setCurrentGameMode] = useState<GameMode>('classic')
  // Player Profile
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(createDefaultProfile())
  const [showPlayerProfile, setShowPlayerProfile] = useState(false)
  // Game Mode Engine (Round 37)
  const modeEngineRef = useRef<GameModeEngine>(createGameModeEngine())
  const [modeDisplayInfo, setModeDisplayInfo] = useState<ModeDisplayInfo>(getModeDisplayInfo(modeEngineRef.current))
  // XP Scoring Wire (Round 37)
  const xpWireRef = useRef<XPScoringWire>(createXPScoringWire())
  const [xpProgress, setXPProgress] = useState<XPProgress>(getXPProgress(xpWireRef.current))
  // Score Live Wire (Round 37)
  const scoreLiveWireRef = useRef<ScoreLiveWire>(createScoreLiveWire())
  // Notification Event Wire (Round 37)
  const notifEventWireRef = useRef<NotifEventWire>(createNotifEventWire())
  const [showModeEngine, setShowModeEngine] = useState(false)
  const [showXPPanel, setShowXPPanel] = useState(false)
  const [showNotifSettings, setShowNotifSettings] = useState(false)
  // Round 41: Mode timer wire
  const [modeTimerDisplay, setModeTimerDisplay] = useState<TimerDisplayData>({ remaining: 0, formatted: '00:00', progress: 0, warningLevel: 'none', isActive: false, isPaused: false, timeLimit: null })
  // Round 38: New feature states
  const battlePassRef = useRef<BattlePassSeason>(createBattlePass())
  const [battlePassSummary, setBattlePassSummary] = useState(() => getPassSummary(battlePassRef.current))
  const [showBattlePass, setShowBattlePass] = useState(false)
  const [showStatsDashboard, setShowStatsDashboard] = useState(false)
  const [dashboardPeriod, setDashboardPeriod] = useState<DashboardPeriod>('all')
  const [showCollectionAlbum, setShowCollectionAlbum] = useState(false)
  const collectionAlbumRef = useRef<CollectionAlbum>(createAlbum())
  // Round 39: Timing controller, Event bus wire, Power-up effect wire, Social share
  const timingControllerRef = useRef<TimingController>(createTimingController())
  const eventBusWireRef = useRef<EventBusWire>(createEventBusWire())
  const powerUpEffectWireRef = useRef<PowerUpEffectWire>(createPowerUpEffectWire())
  const socialShareRef = useRef<SocialShare>(createSocialShare())
  const [showSocialShare, setShowSocialShare] = useState(false)
  const [shareCardText, setShareCardText] = useState('')
  // Round 40: Wiring hub, Canvas share renderer, Minigame launcher, Event log panel
  const wiringHubRef = useRef<GameWiringHub>(createGameWiringHub())
  const canvasShareRef = useRef<CanvasShareRenderer>(createCanvasShareRenderer())
  const minigameLauncherRef = useRef<MinigameLauncher>(createMinigameLauncher())
  const eventLogPanelRef = useRef<EventLogPanel>(createEventLogPanel())
  // Round 41: Power-up canvas effects, Mode timer wire, Canvas share connector, SFX completion wire
  const powerUpVisualsRef = useRef<PowerUpVisualState>(createPowerUpVisualState())
  const modeTimerWireRef = useRef<ModeTimerWire>(createModeTimerWire(modeEngineRef.current))
  const canvasShareConnectorRef = useRef<CanvasShareConnector>(createCanvasShareConnector())
  const sfxCompletionWireRef = useRef<SfxCompletionWire>(createSfxCompletionWire())
  // Round 42: Ghost collision wire, Word bomb wire, Word mastery live tracker, Real-time dashboard wire
  const ghostCollisionWireRef = useRef<GhostCollisionWire>(createGhostCollisionWire())
  const wordBombWireRef = useRef<WordBombWire>(createWordBombWire())
  const masteryTrackerRef = useRef<WordMasteryLiveTracker>(createWordMasteryLiveTracker())
  const realtimeDashboardRef = useRef<RealtimeDashboardWire>(createRealtimeDashboardWire())
  // Round 43: Notification completion wire, Battle pass reward grantor, SFX volume category wire, Mastery tracker panel
  const notifCompletionRef = useRef<NotificationCompletionWire>(createNotificationCompletionWire())
  const bpRewardGrantorRef = useRef<BattlePassRewardGrantor>(createBattlePassRewardGrantor())
  const sfxVolumeCatRef = useRef<SfxVolumeCategoryWire>(createSfxVolumeCategoryWire())
  const masteryPanelRef = useRef<MasteryTrackerPanel>(createMasteryTrackerPanel())
  // Round 43b: Story mode level wire, Wiring hub completion, Minigame play wire, Mastery panel wire
  const storyModeWireRef = useRef<StoryModeWire>(createStoryModeWire())
  const wiringHubCompletionRef = useRef<WiringHubCompletionWire>(createWiringHubCompletionWire())
  const minigamePlayWireRef = useRef<MinigamePlayWire>(createMinigamePlayWire(minigameLauncherRef.current))
  const masteryPanelWireRef = useRef<MasteryPanelWire>(createMasteryPanelWire(masteryPanelRef.current, masteryTrackerRef.current))
  // Round 45: XP Progression is standalone functions (no ref needed)
  // Round 47: PvP, Seasonal, Custom Words, Accessibility panel states
  const [showPvPPanel, setShowPvPPanel] = useState(false)
  const [showSeasonalPanel, setShowSeasonalPanel] = useState(false)
  const [showCustomWordsPanel, setShowCustomWordsPanel] = useState(false)
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false)
  // Round 46: Dictionary, Stats Export, Replay Sharing, Poem Studio panel states
  const [showDictionaryPanel, setShowDictionaryPanel] = useState(false)
  const [showStatsExportPanel, setShowStatsExportPanel] = useState(false)
  const [showReplaySharePanel, setShowReplaySharePanel] = useState(false)
  const [showPoemStudioPanel, setShowPoemStudioPanel] = useState(false)
  // Round 47: Game Settings, Player Stats Compare, Challenge Mode, Word Art Gallery panel states
  const [showGameSettingsPanel, setShowGameSettingsPanel] = useState(false)
  const [showStatsComparePanel, setShowStatsComparePanel] = useState(false)
  const [showChallengePanel, setShowChallengePanel] = useState(false)
  const [showArtGalleryPanel, setShowArtGalleryPanel] = useState(false)
  // Round 48: Soundtrack Manager, Social Activity Feed, Inventory, World Map Explorer panel states
  const [showSoundtrackPanel, setShowSoundtrackPanel] = useState(false)
  const [showSocialFeedPanel, setShowSocialFeedPanel] = useState(false)
  const [showInventoryPanel, setShowInventoryPanel] = useState(false)
  const [showWorldMapPanel, setShowWorldMapPanel] = useState(false)
  // Round 51: Friend System, Pet Companion, Weather Effects, Trade Market panel states
  const [showFriendsPanel, setShowFriendsPanel] = useState(false)
  const [showPetPanel, setShowPetPanel] = useState(false)
  const [showWeatherPanel, setShowWeatherPanel] = useState(false)
  const [showMarketPanel, setShowMarketPanel] = useState(false)
  // Round 52: Daily Rewards, Word Connect, Profile Card, Skill Tree panel states
  const [showDailyRewardPanel, setShowDailyRewardPanel] = useState(false)
  const [showWordConnectPanel, setShowWordConnectPanel] = useState(false)
  const [showProfileCardPanel, setShowProfileCardPanel] = useState(false)
  const [showSkillTreePanel, setShowSkillTreePanel] = useState(false)
  // Round 53: Leaderboard, Soundboard, Mission System, Emote System panel states
  const [showLeaderboardPanel, setShowLeaderboardPanel] = useState(false)
  const [showSoundboardPanel, setShowSoundboardPanel] = useState(false)
  const [showMissionPanel, setShowMissionPanel] = useState(false)
  const [showEmotePanel, setShowEmotePanel] = useState(false)
  // Round 54: Word Analytics, Color Studio, Avatar Customizer, Team System panel states
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false)
  const [showColorStudioPanel, setShowColorStudioPanel] = useState(false)
  const [showAvatarCustomPanel, setShowAvatarCustomPanel] = useState(false)
  const [showTeamPanel, setShowTeamPanel] = useState(false)
  // Round 56: Typing Race, Treasure Hunt, Achievement Museum, Mini Arcade panel states
  const [showTypingRacePanel, setShowTypingRacePanel] = useState(false)
  const [showTreasureHuntPanel, setShowTreasureHuntPanel] = useState(false)
  const [showMuseumPanel, setShowMuseumPanel] = useState(false)
  const [showArcadePanel, setShowArcadePanel] = useState(false)
  // Round 57: Snake Evolution, Word Alchemy, Puzzle Dungeon, Guild System panel states
  const [showEvolutionPanel, setShowEvolutionPanel] = useState(false)
  const [showAlchemyPanel, setShowAlchemyPanel] = useState(false)
  const [showDungeonPanel, setShowDungeonPanel] = useState(false)
  const [showGuildPanel, setShowGuildPanel] = useState(false)
  // Round 58: Gene Lab, Lore Codex, Target Practice, Carnival panel states
  const [showGeneLabPanel, setShowGeneLabPanel] = useState(false)
  const [showLoreCodexPanel, setShowLoreCodexPanel] = useState(false)
  const [showTargetPracticePanel, setShowTargetPracticePanel] = useState(false)
  const [showCarnivalPanel, setShowCarnivalPanel] = useState(false)
  // Round 59: Robot Factory, Dream Journal, Pixel Art Studio, Island Builder panel states
  const [showRobotFactoryPanel, setShowRobotFactoryPanel] = useState(false)
  const [showDreamJournalPanel, setShowDreamJournalPanel] = useState(false)
  const [showPixelArtPanel, setShowPixelArtPanel] = useState(false)
  const [showIslandBuilderPanel, setShowIslandBuilderPanel] = useState(false)
  // Round 55: Bingo, Mini Map, Power-Up Factory, Daily Fortune panel states
  const [showBingoPanel, setShowBingoPanel] = useState(false)
  const [showMiniMapPanel, setShowMiniMapPanel] = useState(false)
  const [showFactoryPanel, setShowFactoryPanel] = useState(false)
  const [showFortunePanel, setShowFortunePanel] = useState(false)
  // Round 49: Tournament Bracket, Word Puzzle, Progress Dashboard, Controller Config panel states
  const [showTournamentPanel, setShowTournamentPanel] = useState(false)
  const [showPuzzlePanel, setShowPuzzlePanel] = useState(false)
  const [showProgressDashPanel, setShowProgressDashPanel] = useState(false)
  const [showControllerPanel, setShowControllerPanel] = useState(false)
  // Round 45: XP Progression, Replay Analyzer, Battle Pass, Achievement Showcase panel states
  const [showXPDetailPanel, setShowXPDetailPanel] = useState(false)
  const [showReplayPanel, setShowReplayPanel] = useState(false)
  const [showBPPremium, setShowBPPremium] = useState(false)
  const [showAchShowcase, setShowAchShowcase] = useState(false)
  const [showEventLog, setShowEventLog] = useState(false)
  const [showMinigames, setShowMinigames] = useState(false)
  const [eventLogEntries, setEventLogEntries] = useState<Array<{id:string;type:string;level:string;message:string;emoji:string;color:string;timestamp:number}>>([])
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const weatherParticlesRef = useRef<{x: number; y: number; vx: number; vy: number; size: number; alpha: number}[]>([])
  // Easter egg confetti particles (separate from game particles)
  const easterEggParticlesRef = useRef<{x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; rotation: number; rotSpeed: number}[]>([])
  const prevInGameDiffLevelRef = useRef<number>(0)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const milestoneToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const obstaclesRef = useRef<Obstacle[]>([])
  const portalPairsRef = useRef<PortalPair[]>([])
  const portalNextIdRef = useRef(0)
  const quizStreakRef = useRef(0)
  const iceSlideQueuedRef = useRef(false)

  // Boss mode refs
  const bossRef = useRef<BossWord | null>(null)
  const bossDefeatsRef = useRef(0)
  const activeBotSkinRef = useRef<AiBotSkin>(getDefaultBotSkin())
  const pvpPowerUpStateRef = useRef<PvpPowerUpState | null>(null)

  // Scramble & combo VFX refs
  const activeScrambleRef = useRef<WordScramble | null>(null)
  const comboVfxParticlesRef = useRef<ComboParticle[]>([])

  // Tutorial state
  const [tutorialCompleted, setTutorialCompleted] = useState(false)
  const [tutorialActive, setTutorialActive] = useState(false)
  const tutorialStateRef = useRef<TutorialState | null>(null)
  const tutorialTutorialGameRef = useRef(false) // Whether the current game is a tutorial game
  const tutorialEatWordPendingRef = useRef(false) // Whether we're waiting for the player to eat a word
  const tutorialConfettiRef = useRef<{x: number; y: number; vx: number; vy: number; color: string; size: number; rotation: number; rotSpeed: number; life: number}[]>([])
  const tutorialConfettiActiveRef = useRef(false)
  const [tutorialJustCompleted, setTutorialJustCompleted] = useState(false)

  const [uiState, setUiState] = useState({
    score: 0,
    gameStarted: false,
    gameOver: false,
    paused: false,
    wordFood: null as WordFood | null,
    wordsEaten: 0,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    elapsedTime: 0,
    soundEnabled: true,
    activeCategories: loadActiveCategories(),
    lastAchievement: null as { title: string; description: string; emoji: string } | null,
    achievementQueueSize: 0,
    isDailyChallenge: false,
    dailyChallengeWords: [] as string[],
    dailyWordsCollected: [] as string[],
    dailyTargetScore: 0,
    streakMultiplier: 1,
    powerUp: null as PowerUp | null,
    activePowerUps: [] as ActivePowerUp[],
    comboCount: 0,
    lastEatenCategory: null as WordCategory | null,
    comboMultiplier: 1,
    weather: 'clear' as GameState['weather'],
    activeSkin: 'classic' as SnakeSkin,
    showMiniMap: true,
    gridTheme: 'classic' as GridThemeId,
    extraLifeAvailable: false,
    lastMilestone: null as { name: string; emoji: string; description: string } | null,
    isSpeedRun: false,
    speedRunTimeLeft: 60,
    speedRunMaxCombo: 0,
    speedRunPowerUpsCollected: 0,
    speedRunLongestSnake: 0,
    wordsByCategory: {} as Record<string, number>,
    inGameDifficulty: null as InGameDifficulty | null,
    activeQuiz: null as WordQuiz | null,
    quizStreak: 0,
    obstacleCount: 0,
    portalCount: 0,
    bossActive: false,
    bossTier: null as string | null,
    bossProgress: 0,
    coinBalance: 0,
    activeScramble: null as WordScramble | null,
    comboLevel: '',
  })

  // Skin state
  const [activeSkin, setActiveSkin] = useState<SnakeSkin>('classic')

  // Grid theme state
  const [activeGridTheme, setActiveGridTheme] = useState<GridThemeId>('classic')

  // Settings dialog
  const [showSettings, setShowSettings] = useState(false)

  // Bot skin selector
  const [showBotSkinSelector, setShowBotSkinSelector] = useState(false)

  // Shop modal
  const [showShop, setShowShop] = useState(false)

  // Speed run state
  const [speedRunBest, setSpeedRunBest] = useState<{ bestScore: number; totalRuns: number }>({ bestScore: 0, totalRuns: 0 })

  // Night mode state
  const [nightMode, setNightMode] = useState<NightModeConfig>({ enabled: false, warmth: 40, dimLevel: 20, autoEnabled: false })

  // Dynamic difficulty state
  const [dynDiff, setDynDiff] = useState<DifficultyAdjustment>(getDifficultyAdjustment(5))

  // Track word additions for entrance animation - key increments trigger re-render with animation
  const [newWordKey, setNewWordKey] = useState(0)

  // Skin bounce state for temporary class
  const [skinBounce, setSkinBounce] = useState(false)

  // Grid theme switch ripple state for temporary class
  const [themeSwitchRipple, setThemeSwitchRipple] = useState(false)

  // Easter egg active effects display state
  const [activeEasterEggs, setActiveEasterEggs] = useState<Array<{ id: string; name: string; emoji: string; effect: EasterEggEffect; expiresAt: number }>>([])
  const easterEggCheckTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const updateUI = useCallback(() => {
    const gs = gameStateRef.current
    setUiState({
      score: gs.score,
      gameStarted: gs.gameStarted,
      gameOver: gs.gameOver,
      paused: gs.paused,
      wordFood: gs.wordFood,
      wordsEaten: gs.wordsEaten,
      difficulty: gs.difficulty,
      elapsedTime: gs.elapsedTime,
      soundEnabled: gs.soundEnabled,
      activeCategories: gs.activeCategories,
      lastAchievement: gs.lastAchievement ?? null,
      achievementQueueSize: achievementQueue.size,
      isDailyChallenge: gs.isDailyChallenge,
      dailyChallengeWords: gs.dailyChallengeWords,
      dailyWordsCollected: gs.dailyWordsCollected,
      dailyTargetScore: gs.dailyTargetScore,
      streakMultiplier: gs.streakMultiplier,
      powerUp: gs.powerUp,
      activePowerUps: gs.activePowerUps,
      comboCount: gs.comboCount,
      lastEatenCategory: gs.lastEatenCategory,
      comboMultiplier: gs.comboMultiplier,
      weather: gs.weather,
      activeSkin: gs.activeSkin,
      showMiniMap: gs.showMiniMap,
      gridTheme: gs.gridTheme,
      extraLifeAvailable: gs.extraLifeAvailable,
      lastMilestone: gs.lastMilestone,
      isSpeedRun: gs.isSpeedRun,
      speedRunTimeLeft: gs.speedRunTimeLeft,
      speedRunMaxCombo: gs.speedRunMaxCombo,
      speedRunPowerUpsCollected: gs.speedRunPowerUpsCollected,
      speedRunLongestSnake: gs.speedRunLongestSnake,
      wordsByCategory: gs.wordsByCategory,
      inGameDifficulty: gs.inGameDifficulty,
      activeQuiz: gs.activeQuiz,
      quizStreak: gs.quizStreak,
      obstacleCount: gs.obstacles.length,
      portalCount: gs.portalPairs.length,
      bossActive: !!gs.boss && gs.boss.phase !== 'defeated',
      bossTier: gs.boss ? (BOSS_POOL.find(b => b.word === gs.boss.word)?.tier ?? null) : null,
      bossProgress: gs.boss ? gs.boss.currentPasses / gs.boss.requiredPasses : 0,
      coinBalance: gs.coinBalance,
      activeScramble: gs.activeScramble,
      comboLevel: gs.comboMultiplier >= 1.5 ? getComboTextConfig(gs.comboMultiplier).emoji + ' ' + getComboTextConfig(gs.comboMultiplier).text : '',
    })
  }, [])

  const showNextAchievement = useCallback(() => {
    const next = achievementQueue.dequeue()
    if (next) {
      gameStateRef.current.lastAchievement = next
      updateUI()
      // Auto-dismiss after 4 seconds
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => {
        gameStateRef.current.lastAchievement = null
        updateUI()
        // If more in queue, show next after 500ms delay
        if (!achievementQueue.isEmpty()) {
          toastTimerRef.current = setTimeout(() => {
            showNextAchievement()
          }, 500)
        }
      }, 4000)
    }
  }, [updateUI])

  const enqueueAchievements = useCallback((newlyUnlocked: AchievementNotification[]) => {
    const wasEmpty = achievementQueue.isEmpty() && !gameStateRef.current.lastAchievement
    for (const a of newlyUnlocked) {
      achievementQueue.enqueue(a)
      emitEvent('achievement', `${a.emoji} ${a.title}`, '🏆', '#eab308')
      emitPresetParticles(CANVAS_WIDTH / 2, 50, 'achievement_unlock')
    }
    if (wasEmpty) {
      showNextAchievement()
    }
    updateUI()
  }, [showNextAchievement, updateUI])

  const playSound = useCallback((soundFn: () => void) => {
    if (gameStateRef.current.soundEnabled) {
      soundFn()
    }
  }, [])

  // Emit event to the game event feed
  const emitEvent = useCallback((type: string, message: string, emoji?: string, color?: string) => {
    const event = addEvent(eventFeedRef.current, { type, message, emoji, color })
    setEventFeedUpdate(n => n + 1)
    // Persist event to history
    try {
      saveEventToHistory({ type, message, emoji, color, timestamp: Date.now(), gameId: gameIdRef.current })
    } catch { /* ignore */ }
    return event
  }, [])

  // Spawn preset-based particle effects
  const emitPresetParticles = useCallback((x: number, y: number, presetName: string) => {
    const newParticles = spawnEffect(x, y, presetName)
    presetParticlesRef.current.push(...newParticles)
  }, [])

  const spawnFloatingText = useCallback((text: string, x: number, y: number, color: string) => {
    floatingTextsRef.current.push({
      text,
      x,
      y,
      opacity: 1,
      vy: -1.5,
      color,
      scale: 1,
    })
  }, [])

  const spawnParticles = useCallback((x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = 1 + Math.random() * 2
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        color,
        size: 2 + Math.random() * 3,
      })
    }
  }, [])

  // Spawn confetti particles for easter egg celebrations
  const spawnEasterEggConfetti = useCallback((x: number, y: number, count: number) => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 1.5
      const speed = 2 + Math.random() * 5
      easterEggParticlesRef.current.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
      })
    }
  }, [])

  const spawnWord = useCallback(() => {
    const gs = gameStateRef.current
    const occupiedPositions = new Set(gs.snake.map((s) => `${s.x},${s.y}`))
    // Include Player 2 positions in PvP mode
    const pvpSpawn = pvpRef.current
    if (pvpSpawn) {
      for (const seg of pvpSpawn.player2Snake) {
        occupiedPositions.add(`${seg.x},${seg.y}`)
      }
    }

    let word: string
    let category: WordCategory

    if (gs.isDailyChallenge && gs.dailyChallengeWords.length > 0) {
      const remaining = gs.dailyChallengeWords.filter(
        (w) => !gs.dailyWordsCollected.includes(w)
      )
      const pool = remaining.length > 0 ? remaining : gs.dailyChallengeWords
      word = pool[Math.floor(Math.random() * pool.length)]
      const entry = getWordEntry(word)
      category = entry?.category ?? 'nature'
    } else if (activeMultilingualPack) {
      // Multilingual word source takes priority if active
      const collected = Array.from(collectedWordsRef.current)
      const multiWord = getRandomMultilingualWord(activeMultilingualPack, collected)
      if (multiWord) {
        word = multiWord.word
        category = multiWord.category
      } else {
        // Multilingual pack exhausted — fall back to default
        const collected2 = Array.from(collectedWordsRef.current)
        const pick = getRandomWordWithCategories(collected2, gs.activeCategories)
        word = pick.word
        category = pick.category
      }
    } else {
      // Check if a word pack is active
      const packId = getActivePack()
      if (packId !== 'default') {
        const packWords = getWordsFromPack(packId)
        const collected = Array.from(collectedWordsRef.current)
        const available = packWords.filter((w) => !collected.includes(w.word))
        if (available.length > 0) {
          const pick = available[Math.floor(Math.random() * available.length)]
          word = pick.word
          category = pick.category as WordCategory
        } else {
          // Pack exhausted — fall back to default pool
          const pick = getRandomWordWithCategories(collected, gs.activeCategories)
          word = pick.word
          category = pick.category
        }
      } else {
        const collected = Array.from(collectedWordsRef.current)
        const pick = getRandomWordWithCategories(collected, gs.activeCategories)
        word = pick.word
        category = pick.category
      }
    }

    const margin = 3
    let pos: Position
    let attempts = 0
    do {
      pos = {
        x: Math.floor(Math.random() * (GRID_WIDTH - margin * 2)) + margin,
        y: Math.floor(Math.random() * (GRID_HEIGHT - margin * 2)) + margin,
      }
      attempts++
    } while (occupiedPositions.has(`${pos.x},${pos.y}`) && attempts < 100)

    const rarity = getRandomRarity()
    gs.wordFood = { word, position: pos, spawnTime: Date.now(), category, rarity }
  }, [])

  const startPvP = useCallback(() => {
    const gs = gameStateRef.current
    const diff = gs.difficulty
    const settings = DIFFICULTY_SETTINGS[diff]
    gs.snake = [
      { x: 5, y: 12 },
      { x: 4, y: 12 },
      { x: 3, y: 12 },
    ]
    gs.direction = 'RIGHT'
    gs.gameOver = false
    gs.paused = false
    gs.score = 0
    gs.speed = settings.speed
    gs.wordsEaten = 0
    gs.gameStarted = true
    gs.wordFood = null
    gs.startTime = Date.now()
    gs.elapsedTime = 0
    directionQueueRef.current = []
    p2DirectionQueueRef.current = []
    floatingTextsRef.current = []
    particlesRef.current = []
    presetParticlesRef.current = []
    clearEvents(eventFeedRef.current)
    resetMovingObstacleIds()
    movingObstaclesRef.current = []
    resetDestructibleWallIds()
    destructibleWallsRef.current = []
    hammerStateRef.current = createInitialHammerState()
    hammerPowerUpRef.current = null
    setHammerActive(false)
    gameIdRef.current = `game-${Date.now()}`
    collectedWordsRef.current = new Set()
    easterEggParticlesRef.current = []
    setActiveEasterEggs([])
    resetEasterEggForNewGame()
    setLeaderboardRank(0)
    gs.isDailyChallenge = false
    gs.dailyChallengeWords = []
    gs.dailyWordsCollected = []
    gs.dailyTargetScore = 0
    gs.streakMultiplier = 1
    gs.powerUp = null
    gs.activePowerUps = []
    gs.comboCount = 0
    gs.lastEatenCategory = null
    gs.comboMultiplier = 1
    achievementQueue.clear()
    // Start replay recording
    try { startRecording() } catch { /* ignore */ }
    gs.lastAchievement = null
    if (toastTimerRef.current) { clearTimeout(toastTimerRef.current); toastTimerRef.current = null }
    if (milestoneToastTimerRef.current) { clearTimeout(milestoneToastTimerRef.current); milestoneToastTimerRef.current = null }
    gs.lastMilestone = null
    gs.extraLifeAvailable = false
    gs.weather = 'clear' // PvP always clear weather for fairness
    weatherParticlesRef.current = []
    gs.isSpeedRun = false
    gs.speedRunTimeLeft = getSpeedRunDuration()
    gs.speedRunMaxCombo = 0
    gs.speedRunPowerUpsCollected = 0
    gs.speedRunLongestSnake = gs.snake.length
    gs.wordsByCategory = {}
    gs.inGameDifficulty = null
    prevInGameDiffLevelRef.current = 0
    // Initialize PvP state
    pvpRef.current = createPvPState()
    spawnWord()
    playSound(playStartSound)
    try {
      const games = parseInt(localStorage.getItem('word-snake-games') ?? '0', 10) + 1
      localStorage.setItem('word-snake-games', String(games))
    } catch { /* ignore */ }
    updateUI()
  }, [spawnWord, updateUI, playSound])

  const startAiBot = useCallback(() => {
    const gs = gameStateRef.current
    const diff = gs.difficulty
    const settings = DIFFICULTY_SETTINGS[diff]
    gs.snake = [
      { x: 5, y: 12 },
      { x: 4, y: 12 },
      { x: 3, y: 12 },
    ]
    gs.direction = 'RIGHT'
    gs.gameOver = false
    gs.paused = false
    gs.score = 0
    gs.speed = settings.speed
    gs.wordsEaten = 0
    gs.gameStarted = true
    gs.wordFood = null
    gs.startTime = Date.now()
    gs.elapsedTime = 0
    directionQueueRef.current = []
    p2DirectionQueueRef.current = []
    floatingTextsRef.current = []
    particlesRef.current = []
    presetParticlesRef.current = []
    clearEvents(eventFeedRef.current)
    resetMovingObstacleIds()
    movingObstaclesRef.current = []
    resetDestructibleWallIds()
    destructibleWallsRef.current = []
    hammerStateRef.current = createInitialHammerState()
    hammerPowerUpRef.current = null
    setHammerActive(false)
    gameIdRef.current = `game-${Date.now()}`
    collectedWordsRef.current = new Set()
    easterEggParticlesRef.current = []
    setActiveEasterEggs([])
    resetEasterEggForNewGame()
    setLeaderboardRank(0)
    gs.isDailyChallenge = false
    gs.dailyChallengeWords = []
    gs.dailyWordsCollected = []
    gs.dailyTargetScore = 0
    gs.streakMultiplier = 1
    gs.powerUp = null
    gs.activePowerUps = []
    gs.comboCount = 0
    gs.lastEatenCategory = null
    gs.comboMultiplier = 1
    achievementQueue.clear()
    try { startRecording() } catch { /* ignore */ }
    gs.lastAchievement = null
    if (toastTimerRef.current) { clearTimeout(toastTimerRef.current); toastTimerRef.current = null }
    if (milestoneToastTimerRef.current) { clearTimeout(milestoneToastTimerRef.current); milestoneToastTimerRef.current = null }
    gs.lastMilestone = null
    gs.extraLifeAvailable = false
    weatherParticlesRef.current = []
    gs.isSpeedRun = false
    gs.speedRunTimeLeft = getSpeedRunDuration()
    gs.speedRunMaxCombo = 0
    gs.speedRunPowerUpsCollected = 0
    gs.speedRunLongestSnake = gs.snake.length
    gs.wordsByCategory = {}
    gs.inGameDifficulty = null
    prevInGameDiffLevelRef.current = 0
    // Clear PvP state
    pvpRef.current = null
    // Initialize AI bot state
    aiBotRef.current = createAiBot(diff)
    setAiBotActive(true)
    spawnWord()
    playSound(playStartSound)
    try {
      const games = parseInt(localStorage.getItem('word-snake-games') ?? '0', 10) + 1
      localStorage.setItem('word-snake-games', String(games))
    } catch { /* ignore */ }
    updateUI()
  }, [spawnWord, updateUI, playSound])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Helper to push direction with reverse controls support (easter egg)
  const pushDirection = useCallback((dir: Direction) => {
    if (hasActiveEffect('reverse_controls')) {
      const reverseMap: Record<Direction, Direction> = {
        UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT',
      }
      dir = reverseMap[dir]
    }
    directionQueueRef.current.push(dir)
    if (directionQueueRef.current.length > 2) {
      directionQueueRef.current = directionQueueRef.current.slice(-2)
    }
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gs = gameStateRef.current
    const { snake, direction, wordFood, gameStarted, gameOver, paused } = gs

    // Get grid theme
    const gridTheme = getGridTheme(gs.gridTheme)

    // Clear canvas with theme background
    ctx.fillStyle = gridTheme.bgColor
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw grid based on theme gridType
    ctx.fillStyle = gridTheme.gridColor
    if (gridTheme.gridType === 'dots') {
      for (let x = 0; x <= GRID_WIDTH; x++) {
        for (let y = 0; y <= GRID_HEIGHT; y++) {
          ctx.beginPath()
          ctx.arc(x * CELL_SIZE, y * CELL_SIZE, 0.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    } else if (gridTheme.gridType === 'lines') {
      ctx.strokeStyle = gridTheme.gridColor
      ctx.globalAlpha = 0.15
      ctx.lineWidth = 0.5
      for (let x = 0; x <= GRID_WIDTH; x++) {
        ctx.beginPath()
        ctx.moveTo(x * CELL_SIZE, 0)
        ctx.lineTo(x * CELL_SIZE, CANVAS_HEIGHT)
        ctx.stroke()
      }
      for (let y = 0; y <= GRID_HEIGHT; y++) {
        ctx.beginPath()
        ctx.moveTo(0, y * CELL_SIZE)
        ctx.lineTo(CANVAS_WIDTH, y * CELL_SIZE)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    } else if (gridTheme.gridType === 'crosshatch') {
      ctx.strokeStyle = gridTheme.gridColor
      ctx.globalAlpha = 0.08
      ctx.lineWidth = 0.5
      // Vertical lines
      for (let x = 0; x <= GRID_WIDTH; x++) {
        ctx.beginPath()
        ctx.moveTo(x * CELL_SIZE, 0)
        ctx.lineTo(x * CELL_SIZE, CANVAS_HEIGHT)
        ctx.stroke()
      }
      // Horizontal lines
      for (let y = 0; y <= GRID_HEIGHT; y++) {
        ctx.beginPath()
        ctx.moveTo(0, y * CELL_SIZE)
        ctx.lineTo(CANVAS_WIDTH, y * CELL_SIZE)
        ctx.stroke()
      }
      // Diagonal lines for crosshatch
      ctx.globalAlpha = 0.04
      for (let d = -GRID_HEIGHT; d <= GRID_WIDTH + GRID_HEIGHT; d += 2) {
        ctx.beginPath()
        ctx.moveTo(d * CELL_SIZE, 0)
        ctx.lineTo((d - GRID_HEIGHT) * CELL_SIZE, CANVAS_HEIGHT)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    } else if (gridTheme.gridType === 'organic') {
      // Organic moss-like dot pattern with varied sizes and opacity
      const seed = 42
      for (let x = 0; x <= GRID_WIDTH; x++) {
        for (let y = 0; y <= GRID_HEIGHT; y++) {
          const hash = ((x * 7919 + y * 104729 + seed) % 100) / 100
          const radius = 0.5 + hash * 1.5
          ctx.globalAlpha = 0.15 + hash * 0.25
          ctx.beginPath()
          ctx.arc(x * CELL_SIZE, y * CELL_SIZE, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    }

    // Sound visualizer (background effect behind game elements)
    if (isVisualizerActive()) {
      drawVisualizer(ctx, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }, visualizerBarsRef.current)
    }

    // Weather effects
    if (gs.weather !== 'clear' && gameStarted && !gameOver) {
      const wp = weatherParticlesRef.current
      
      // Initialize weather particles if empty
      if (wp.length === 0) {
        const count = gs.weather === 'rain' ? 80 : gs.weather === 'snow' ? 50 : 30
        for (let i = 0; i < count; i++) {
          wp.push({
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * CANVAS_HEIGHT,
            vx: gs.weather === 'rain' ? -1 : gs.weather === 'snow' ? (Math.random() - 0.5) * 0.5 : 0,
            vy: gs.weather === 'rain' ? 4 + Math.random() * 3 : gs.weather === 'snow' ? 0.5 + Math.random() * 1 : 0,
            size: gs.weather === 'rain' ? 1 : gs.weather === 'snow' ? 2 + Math.random() * 2 : 1 + Math.random(),
            alpha: gs.weather === 'stars' ? Math.random() : 0.3 + Math.random() * 0.4,
          })
        }
      }
      
      // Update and draw weather particles
      for (const p of wp) {
        p.x += p.vx
        p.y += p.vy
        
        if (gs.weather === 'rain') {
          if (p.y > CANVAS_HEIGHT) { p.y = -5; p.x = Math.random() * CANVAS_WIDTH }
          ctx.globalAlpha = p.alpha
          ctx.strokeStyle = '#94a3b8'
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x + p.vx * 2, p.y + p.vy * 2)
          ctx.stroke()
        } else if (gs.weather === 'snow') {
          if (p.y > CANVAS_HEIGHT) { p.y = -5; p.x = Math.random() * CANVAS_WIDTH }
          p.vx = Math.sin(Date.now() / 1000 + p.x) * 0.3
          ctx.globalAlpha = p.alpha
          ctx.fillStyle = '#e2e8f0'
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        } else if (gs.weather === 'stars') {
          p.alpha = 0.3 + Math.sin(Date.now() / 500 + p.x + p.y) * 0.3
          if (p.alpha > 0) {
            ctx.globalAlpha = p.alpha
            ctx.fillStyle = '#fbbf24'
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
      ctx.globalAlpha = 1
    }

    // Snow fog overlay (blizzard effect)
    if (gs.weather === 'snow' && gameStarted && !gameOver) {
      ctx.fillStyle = 'rgba(200, 220, 240, 0.12)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    }

    // Draw border glow
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, 0)
    if (gs.isDailyChallenge && gameStarted) {
      gradient.addColorStop(0, 'rgba(245, 158, 11, 0.15)')
      gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.15)')
      gradient.addColorStop(1, 'rgba(245, 158, 11, 0.15)')
    } else {
      gradient.addColorStop(0, gridTheme.borderColor)
      gradient.addColorStop(0.5, gridTheme.borderGlowColor)
      gradient.addColorStop(1, gridTheme.borderColor)
    }
    ctx.strokeStyle = gradient
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, CANVAS_WIDTH - 2, CANVAS_HEIGHT - 2)

    // Daily challenge banner during gameplay
    if (gs.isDailyChallenge && gameStarted && !gameOver && !paused) {
      const remaining = gs.dailyChallengeWords.filter(
        (w) => !gs.dailyWordsCollected.includes(w)
      ).length
      const total = gs.dailyChallengeWords.length

      ctx.fillStyle = 'rgba(245, 158, 11, 0.12)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, 28)
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        `📅 Daily Challenge  •  ${gs.dailyTargetScore} pts target  •  ${remaining}/${total} words remaining`,
        CANVAS_WIDTH / 2,
        14
      )
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }

    // Draw snake body trail (faint glow behind snake)
    if (snake.length > 1) {
      ctx.globalAlpha = 0.04
      const skin = getSnakeSkin(gs.activeSkin)
      ctx.fillStyle = gs.isDailyChallenge ? '#f59e0b' : skin.glowColor
      for (const seg of snake) {
        ctx.beginPath()
        ctx.arc(
          seg.x * CELL_SIZE + CELL_SIZE / 2,
          seg.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE * 0.8,
          0,
          Math.PI * 2
        )
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    // Draw custom trail effects
    drawTrail(ctx, activeTrail, snake, trailParticlesRef.current, CELL_SIZE, gs.isDailyChallenge ? '#f59e0b' : getSnakeSkin(gs.activeSkin).headColor, Date.now())

    // Draw snake
    const skin = getSnakeSkin(gs.activeSkin)
    const isRainbowEgg = hasActiveEffect('rainbow_snake')
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Snake head
        const headColor = isRainbowEgg
          ? `hsl(${(Date.now() / 10) % 360}, 80%, 60%)`
          : (gs.isDailyChallenge ? '#fbbf24' : skin.headColor)
        const glowColor = isRainbowEgg
          ? headColor
          : (gs.isDailyChallenge ? '#f59e0b' : skin.glowColor)
        ctx.shadowColor = glowColor
        ctx.shadowBlur = isRainbowEgg ? 18 : 12
        ctx.fillStyle = headColor
        ctx.beginPath()
        ctx.roundRect(
          segment.x * CELL_SIZE + 1,
          segment.y * CELL_SIZE + 1,
          CELL_SIZE - 2,
          CELL_SIZE - 2,
          5
        )
        ctx.fill()
        ctx.shadowBlur = 0

        // Eyes
        const eyeSize = 2.5
        const cx = segment.x * CELL_SIZE + CELL_SIZE / 2
        const cy = segment.y * CELL_SIZE + CELL_SIZE / 2
        let eye1x: number, eye1y: number, eye2x: number, eye2y: number

        if (direction === 'RIGHT') {
          eye1x = cx + 4; eye1y = cy - 3.5; eye2x = cx + 4; eye2y = cy + 3.5
        } else if (direction === 'LEFT') {
          eye1x = cx - 4; eye1y = cy - 3.5; eye2x = cx - 4; eye2y = cy + 3.5
        } else if (direction === 'UP') {
          eye1x = cx - 3.5; eye1y = cy - 4; eye2x = cx + 3.5; eye2y = cy - 4
        } else {
          eye1x = cx - 3.5; eye1y = cy + 4; eye2x = cx + 3.5; eye2y = cy + 4
        }
        ctx.fillStyle = gs.isDailyChallenge ? '#ffffff' : skin.eyeColor
        ctx.beginPath(); ctx.arc(eye1x, eye1y, eyeSize + 1, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(eye2x, eye2y, eyeSize + 1, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = gridTheme.bgColor
        ctx.beginPath(); ctx.arc(eye1x, eye1y, eyeSize, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(eye2x, eye2y, eyeSize, 0, Math.PI * 2); ctx.fill()
      } else {
        // Body
        const ratio = 1 - index / snake.length

        // Determine fill color based on pattern
        if (isRainbowEgg) {
          // Easter egg rainbow: faster cycling than rainbow skin
          const hue = (index * 360 / snake.length + Date.now() / 30) % 360
          ctx.fillStyle = `hsl(${hue}, 85%, 60%)`
        } else if (gs.isDailyChallenge) {
          const red = Math.floor(160 + ratio * 95)
          const alpha = 0.6 + ratio * 0.4
          ctx.fillStyle = `rgba(${red}, 158, 34, ${alpha})`
        } else if (skin.pattern === 'rainbow') {
          const hue = (index * 360 / snake.length + Date.now() / 50) % 360
          ctx.fillStyle = `hsl(${hue}, 70%, 55%)`
        } else if (skin.pattern === 'gradient') {
          // Interpolate from bodyGradient[0] to bodyGradient[1]
          const c0 = hexToRgb(skin.bodyGradient[0])
          const c1 = hexToRgb(skin.bodyGradient[1])
          const alpha = 0.6 + ratio * 0.4
          const r = Math.floor(c0.r + (c1.r - c0.r) * ratio)
          const g = Math.floor(c0.g + (c1.g - c0.g) * ratio)
          const b = Math.floor(c0.b + (c1.b - c0.b) * ratio)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        } else if (skin.pattern === 'striped') {
          const c0 = hexToRgb(skin.bodyGradient[0])
          const c1 = hexToRgb(skin.bodyGradient[1])
          const alpha = (0.6 + ratio * 0.4) * (index % 2 === 0 ? 1 : 0.55)
          const r = Math.floor(c0.r + (c1.r - c0.r) * ratio)
          const g = Math.floor(c0.g + (c1.g - c0.g) * ratio)
          const b = Math.floor(c0.b + (c1.b - c0.b) * ratio)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        } else if (skin.pattern === 'dotted') {
          const c0 = hexToRgb(skin.bodyGradient[0])
          const c1 = hexToRgb(skin.bodyGradient[1])
          const alpha = 0.6 + ratio * 0.4
          const r = Math.floor(c0.r + (c1.r - c0.r) * ratio)
          const g = Math.floor(c0.g + (c1.g - c0.g) * ratio)
          const b = Math.floor(c0.b + (c1.b - c0.b) * ratio)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        } else {
          // solid pattern (classic + shadow)
          const c0 = hexToRgb(skin.bodyGradient[0])
          const c1 = hexToRgb(skin.bodyGradient[1])
          const alpha = 0.6 + ratio * 0.4
          const r = Math.floor(c0.r + (c1.r - c0.r) * ratio)
          const g = Math.floor(c0.g + (c1.g - c0.g) * ratio)
          const b = Math.floor(c0.b + (c1.b - c0.b) * ratio)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        }

        // Draw connector between adjacent segments (for all patterns)
        if (skin.pattern !== 'dotted') {
          const prev = snake[index - 1]
          const dx = prev.x - segment.x
          const dy = prev.y - segment.y
          if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
            ctx.fillRect(
              Math.min(prev.x, segment.x) * CELL_SIZE + 2,
              Math.min(prev.y, segment.y) * CELL_SIZE + 2,
              (Math.abs(dx) + 1) * CELL_SIZE - 4,
              (Math.abs(dy) + 1) * CELL_SIZE - 4
            )
          }
        }

        // Draw segment shape based on pattern
        if (skin.pattern === 'dotted') {
          // Small circles instead of rectangles
          ctx.beginPath()
          ctx.arc(
            segment.x * CELL_SIZE + CELL_SIZE / 2,
            segment.y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 2 - 3,
            0,
            Math.PI * 2
          )
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.roundRect(
            segment.x * CELL_SIZE + 2,
            segment.y * CELL_SIZE + 2,
            CELL_SIZE - 4,
            CELL_SIZE - 4,
            3
          )
          ctx.fill()
        }
      }
    })

    // ===== PvP: Draw Player 2 Snake =====
    const pvpDraw = pvpRef.current
    if (pvpDraw && pvpDraw.player2Snake.length > 0) {
      // P2 body trail glow
      ctx.globalAlpha = 0.04
      ctx.fillStyle = P2_COLORS.glow
      for (const seg of pvpDraw.player2Snake) {
        ctx.beginPath()
        ctx.arc(seg.x * CELL_SIZE + CELL_SIZE / 2, seg.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE * 0.8, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      pvpDraw.player2Snake.forEach((segment, index) => {
        const ratio = 1 - index / pvpDraw.player2Snake.length
        if (index === 0) {
          // P2 Head
          ctx.shadowColor = P2_COLORS.glow
          ctx.shadowBlur = 12
          ctx.fillStyle = P2_COLORS.head
          ctx.beginPath()
          ctx.roundRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2, 5)
          ctx.fill()
          ctx.shadowBlur = 0

          // P2 Eyes
          const eyeSize = 2.5
          const cx = segment.x * CELL_SIZE + CELL_SIZE / 2
          const cy = segment.y * CELL_SIZE + CELL_SIZE / 2
          let eye1x: number, eye1y: number, eye2x: number, eye2y: number
          if (pvpDraw.player2Direction === 'RIGHT') { eye1x = cx + 4; eye1y = cy - 3.5; eye2x = cx + 4; eye2y = cy + 3.5 }
          else if (pvpDraw.player2Direction === 'LEFT') { eye1x = cx - 4; eye1y = cy - 3.5; eye2x = cx - 4; eye2y = cy + 3.5 }
          else if (pvpDraw.player2Direction === 'UP') { eye1x = cx - 3.5; eye1y = cy - 4; eye2x = cx + 3.5; eye2y = cy - 4 }
          else { eye1x = cx - 3.5; eye1y = cy + 4; eye2x = cx + 3.5; eye2y = cy + 4 }
          ctx.fillStyle = P2_COLORS.eyeOuter
          ctx.beginPath(); ctx.arc(eye1x, eye1y, eyeSize + 1, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(eye2x, eye2y, eyeSize + 1, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = gridTheme.bgColor
          ctx.beginPath(); ctx.arc(eye1x, eye1y, eyeSize, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(eye2x, eye2y, eyeSize, 0, Math.PI * 2); ctx.fill()

          // P2 label near head
          ctx.globalAlpha = 0.5
          ctx.fillStyle = '#06b6d4'
          ctx.font = 'bold 8px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText('P2', cx, segment.y * CELL_SIZE - 2)
          ctx.textAlign = 'start'
          ctx.textBaseline = 'alphabetic'
          ctx.globalAlpha = 1
        } else {
          // P2 Body - gradient from cyan to teal
          const startRgb = hexToRgb(P2_COLORS.bodyStart)
          const endRgb = hexToRgb(P2_COLORS.bodyEnd)
          const alpha = 0.6 + ratio * 0.4
          const r = Math.floor(startRgb.r + (endRgb.r - startRgb.r) * ratio)
          const g = Math.floor(startRgb.g + (endRgb.g - startRgb.g) * ratio)
          const b = Math.floor(startRgb.b + (endRgb.b - startRgb.b) * ratio)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
          ctx.beginPath()
          ctx.roundRect(segment.x * CELL_SIZE + 2, segment.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4, 3)
          ctx.fill()
        }
      })
    }

    // ===== AI Bot: Draw Bot Snake =====
    const aiBotDraw = aiBotRef.current
    if (aiBotDraw && aiBotDraw.snake.length > 0) {
      const skin = activeBotSkinRef.current
      const botColors = {
        headColor: skin.headColor,
        bodyStartColor: skin.bodyColor,
        bodyEndColor: skin.bodyColorEnd,
        glowColor: skin.glowColor,
        eyeWhiteColor: '#ffffff',
        eyePupilColor: '#1c1917',
      }
      // Bot body trail glow
      ctx.globalAlpha = 0.04
      ctx.fillStyle = botColors.glowColor
      for (const seg of aiBotDraw.snake) {
        ctx.beginPath()
        ctx.arc(seg.x * CELL_SIZE + CELL_SIZE / 2, seg.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE * 0.8, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      aiBotDraw.snake.forEach((segment, index) => {
        const ratio = 1 - index / aiBotDraw.snake.length
        if (index === 0) {
          // Bot Head
          ctx.shadowColor = botColors.glowColor
          ctx.shadowBlur = 12
          ctx.fillStyle = botColors.headColor
          ctx.beginPath()
          ctx.roundRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2, 5)
          ctx.fill()
          ctx.shadowBlur = 0

          // Bot Eyes
          const eyeSize = 2.5
          const cx = segment.x * CELL_SIZE + CELL_SIZE / 2
          const cy = segment.y * CELL_SIZE + CELL_SIZE / 2
          let eye1x: number, eye1y: number, eye2x: number, eye2y: number
          if (aiBotDraw.direction === 'RIGHT') { eye1x = cx + 4; eye1y = cy - 3.5; eye2x = cx + 4; eye2y = cy + 3.5 }
          else if (aiBotDraw.direction === 'LEFT') { eye1x = cx - 4; eye1y = cy - 3.5; eye2x = cx - 4; eye2y = cy + 3.5 }
          else if (aiBotDraw.direction === 'UP') { eye1x = cx - 3.5; eye1y = cy - 4; eye2x = cx + 3.5; eye2y = cy - 4 }
          else { eye1x = cx - 3.5; eye1y = cy + 4; eye2x = cx + 3.5; eye2y = cy + 4 }
          ctx.fillStyle = botColors.eyeWhiteColor
          ctx.beginPath(); ctx.arc(eye1x, eye1y, eyeSize + 1, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(eye2x, eye2y, eyeSize + 1, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = botColors.eyePupilColor
          ctx.beginPath(); ctx.arc(eye1x, eye1y, eyeSize, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(eye2x, eye2y, eyeSize, 0, Math.PI * 2); ctx.fill()

          // Bot label near head
          ctx.globalAlpha = 0.5
          ctx.fillStyle = skin.glowColor
          ctx.font = 'bold 8px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText(skin.headEmoji, cx, segment.y * CELL_SIZE - 2)
          ctx.textAlign = 'start'
          ctx.textBaseline = 'alphabetic'
          ctx.globalAlpha = 1
        } else {
          // Bot Body - gradient from orange-400 to orange-700
          const startRgb = hexToRgb(botColors.bodyStartColor)
          const endRgb = hexToRgb(botColors.bodyEndColor)
          const alpha = 0.6 + ratio * 0.4
          const r = Math.floor(startRgb.r + (endRgb.r - startRgb.r) * ratio)
          const g = Math.floor(startRgb.g + (endRgb.g - startRgb.g) * ratio)
          const b = Math.floor(startRgb.b + (endRgb.b - startRgb.b) * ratio)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
          ctx.beginPath()
          ctx.roundRect(segment.x * CELL_SIZE + 2, segment.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4, 3)
          ctx.fill()
        }
      })
    }
    // ===== END AI Bot Drawing =====

    // PvP Power-up steal indicators
    if (pvpDraw && gs.pvpPowerUpState && snake.length > 0 && pvpDraw.player2Snake.length > 0) {
      const p1Head = snake[0]
      const p2Head = pvpDraw.player2Snake[0]
      const nowPvp = Date.now()
      // Check if player 1 can steal from player 2
      const p1Steal = canStealPowerUp(1, 2, p1Head, p2Head,
        gs.pvpPowerUpState.player2ActivePowerUps, gs.pvpPowerUpState, nowPvp)
      if (p1Steal.canSteal && p1Steal.targetType) {
        const ix = p1Head.x * CELL_SIZE + CELL_SIZE / 2
        const iy = p1Head.y * CELL_SIZE - 12
        const pulse = 0.7 + Math.sin(nowPvp / 200) * 0.3
        ctx.globalAlpha = pulse
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText('\u{1FAE3}', ix, iy)
        ctx.globalAlpha = 1
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      }
      // Check if player 2 can steal from player 1
      const p2Steal = canStealPowerUp(2, 1, p2Head, p1Head,
        gs.pvpPowerUpState.player1ActivePowerUps, gs.pvpPowerUpState, nowPvp)
      if (p2Steal.canSteal && p2Steal.targetType) {
        const ix = p2Head.x * CELL_SIZE + CELL_SIZE / 2
        const iy = p2Head.y * CELL_SIZE - 12
        const pulse = 0.7 + Math.sin(nowPvp / 200) * 0.3
        ctx.globalAlpha = pulse
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText('\u{1FAE3}', ix, iy)
        ctx.globalAlpha = 1
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      }
      // Draw steal event notifications
      for (const event of gs.pvpPowerUpState.recentSteals) {
        const sdi = getStealDrawInfo(event, nowPvp)
        if (sdi.opacity > 0) {
          ctx.globalAlpha = sdi.opacity
          ctx.fillStyle = sdi.color
          ctx.font = 'bold 11px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(sdi.text, CANVAS_WIDTH / 2 + sdi.x, 50 + sdi.y)
          ctx.globalAlpha = 1
          ctx.textAlign = 'start'
          ctx.textBaseline = 'alphabetic'
        }
      }
    }

    // Platinum milestone: golden sparkle particle trail behind snake head
    if (gameStarted && !gameOver && !paused && snake.length > 0) {
      try {
        const bonuses = getActiveMilestoneBonuses()
        if (bonuses.hasGoldenTrail) {
          const headSeg = snake[0]
          const hx = headSeg.x * CELL_SIZE + CELL_SIZE / 2
          const hy = headSeg.y * CELL_SIZE + CELL_SIZE / 2
          // Spawn 1-2 golden sparkle particles each frame
          for (let i = 0; i < 2; i++) {
            const angle = Math.random() * Math.PI * 2
            const speed = 0.3 + Math.random() * 0.8
            particlesRef.current.push({
              x: hx + (Math.random() - 0.5) * 8,
              y: hy + (Math.random() - 0.5) * 8,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 0.6 + Math.random() * 0.4,
              maxLife: 1,
              color: Math.random() > 0.5 ? '#ffd700' : '#fff8dc',
              size: 1.5 + Math.random() * 2,
            })
          }
        }
      } catch { /* ignore */ }

      // Spawn trail particles
      const skin = getSnakeSkin(gs.activeSkin)
      spawnTrailParticles(activeTrail, trailParticlesRef.current, snake, CELL_SIZE, gs.isDailyChallenge ? '#f59e0b' : skin.headColor, Date.now())
      // Update trail particles
      updateTrailParticles(trailParticlesRef.current, 0.016)
    }

    // Draw word food with category-based coloring
    const isGiantFood = hasActiveEffect('giant_food')
    if (wordFood) {
      const { word, position, spawnTime, category } = wordFood
      const elapsed = Date.now() - spawnTime
      const giantScale = isGiantFood ? 1.6 : 1
      const pulse = (1 + Math.sin(elapsed / 300) * 0.08) * giantScale
      const catColor = CATEGORY_COLORS[category] ?? PACK_CATEGORY_INFO[category]?.color ?? '#f59e0b'

      const fontSize = isGiantFood ? 14 : 11
      ctx.font = `bold ${fontSize}px monospace`
      const wordWidth = ctx.measureText(word).width
      const padding = isGiantFood ? 12 : 8
      const boxWidth = (wordWidth + padding * 2) * pulse
      const boxHeight = (CELL_SIZE + padding) * pulse
      const boxX = position.x * CELL_SIZE + CELL_SIZE / 2 - boxWidth / 2
      const boxY = position.y * CELL_SIZE + CELL_SIZE / 2 - boxHeight / 2

      // Glow
      ctx.shadowColor = isGiantFood ? '#fbbf24' : catColor
      ctx.shadowBlur = (isGiantFood ? 28 : 16) + Math.sin(elapsed / 200) * 6

      // Background
      const bgGrad = ctx.createLinearGradient(boxX, boxY, boxX + boxWidth, boxY + boxHeight)
      bgGrad.addColorStop(0, '#1a1a2e')
      bgGrad.addColorStop(1, '#2d2d44')
      ctx.fillStyle = bgGrad
      ctx.beginPath()
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8)
      ctx.fill()
      ctx.shadowBlur = 0

      // Category-colored border
      ctx.strokeStyle = catColor
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.6 + Math.sin(elapsed / 250) * 0.3
      ctx.beginPath()
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8)
      ctx.stroke()
      ctx.globalAlpha = 1

      // Inner highlight
      ctx.strokeStyle = `${catColor}26`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(boxX + 2, boxY + 2, boxWidth - 4, boxHeight - 4, 6)
      ctx.stroke()

      // Category indicator dot
      ctx.fillStyle = catColor
      ctx.beginPath()
      ctx.arc(boxX + 8, boxY + boxHeight / 2, 2.5, 0, Math.PI * 2)
      ctx.fill()

      // Rarity effects
      const rarity = wordFood.rarity
      const rarityConf = RARITY_CONFIG[rarity]
      if (rarity !== 'common' && rarityConf) {
        // Extra glow for uncommon/rare/legendary
        ctx.shadowColor = rarityConf.color
        ctx.shadowBlur = rarity === 'legendary' ? 30 : rarity === 'rare' ? 22 : 14
        
        // Legendary: rotating rays
        if (rarity === 'legendary') {
          const rayAngle = elapsed / 1000
          ctx.save()
          ctx.translate(boxX + boxWidth / 2, boxY + boxHeight / 2)
          for (let r = 0; r < 8; r++) {
            const angle = rayAngle + (r * Math.PI) / 4
            ctx.strokeStyle = `rgba(245, 158, 11, ${0.15 + Math.sin(elapsed / 200 + r) * 0.1})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(Math.cos(angle) * 10, Math.sin(angle) * 10)
            ctx.lineTo(Math.cos(angle) * (boxWidth / 2 + 8), Math.sin(angle) * (boxHeight / 2 + 8))
            ctx.stroke()
          }
          ctx.restore()
        }
        
        // Rare: sparkle particles around the word
        if (rarity === 'rare') {
          for (let s = 0; s < 4; s++) {
            const sparkleAngle = elapsed / 500 + s * Math.PI / 2
            const sparkleX = boxX + boxWidth / 2 + Math.cos(sparkleAngle) * (boxWidth / 2 + 4)
            const sparkleY = boxY + boxHeight / 2 + Math.sin(sparkleAngle) * (boxHeight / 2 + 4)
            const sparkleAlpha = 0.4 + Math.sin(elapsed / 200 + s) * 0.3
            ctx.globalAlpha = sparkleAlpha
            ctx.fillStyle = rarityConf.color
            ctx.beginPath()
            ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.globalAlpha = 1
        }
        
        // Rarity indicator badge (small colored diamond in top-right of word box)
        ctx.fillStyle = rarityConf.color
        ctx.font = `bold 8px sans-serif`
        ctx.textAlign = 'right'
        ctx.fillText(rarityConf.emoji || '◆', boxX + boxWidth - 4, boxY + 10)
        ctx.textAlign = 'start'
        
        ctx.shadowBlur = 0
      }

      // Text
      ctx.fillStyle = catColor
      ctx.font = `bold ${11 * pulse}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(word, boxX + boxWidth / 2 + 3, boxY + boxHeight / 2)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }

    // Draw power-up
    if (gs.powerUp) {
      const pu = gs.powerUp
      const config = POWERUP_CONFIG[pu.type]
      const elapsed = Date.now() - pu.spawnTime
      const pulse = 1 + Math.sin(elapsed / 250) * 0.12

      const cx = pu.position.x * CELL_SIZE + CELL_SIZE / 2
      const cy = pu.position.y * CELL_SIZE + CELL_SIZE / 2

      // Outer glow
      ctx.shadowColor = config.color
      ctx.shadowBlur = 20 + Math.sin(elapsed / 200) * 8

      // Background circle
      ctx.fillStyle = `${config.color}25`
      ctx.beginPath()
      ctx.arc(cx, cy, CELL_SIZE * pulse, 0, Math.PI * 2)
      ctx.fill()

      // Border ring
      ctx.strokeStyle = config.color
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.5 + Math.sin(elapsed / 200) * 0.3
      ctx.beginPath()
      ctx.arc(cx, cy, CELL_SIZE * pulse, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1

      // Emoji
      ctx.font = `${14 * pulse}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(config.emoji, cx, cy)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
      ctx.shadowBlur = 0
    }

    // Draw obstacles
    const obsNow = Date.now()
    for (const obs of gs.obstacles) {
      const drawInfo = getObstacleDrawInfo(obs, obsNow)
      ctx.globalAlpha = drawInfo.opacity
      const ox = obs.position.x * CELL_SIZE + CELL_SIZE / 2
      const oy = obs.position.y * CELL_SIZE + CELL_SIZE / 2
      ctx.font = `${CELL_SIZE * drawInfo.pulseScale}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(drawInfo.emoji, ox, oy)
    }
    ctx.globalAlpha = 1
    ctx.textAlign = 'start'
    ctx.textBaseline = 'alphabetic'

    // Draw portal pairs
    for (const pair of gs.portalPairs) {
      for (const portal of [pair.portalA, pair.portalB]) {
        const pdi = getPortalDrawInfo(portal, obsNow)
        const px = portal.position.x * CELL_SIZE + CELL_SIZE / 2
        const py = portal.position.y * CELL_SIZE + CELL_SIZE / 2
        // Glow ring
        ctx.beginPath()
        ctx.arc(px, py, CELL_SIZE * pdi.pulseScale, 0, Math.PI * 2)
        ctx.fillStyle = pdi.glowColor
        ctx.fill()
        // Inner circle
        ctx.beginPath()
        ctx.arc(px, py, CELL_SIZE * 0.5 * pdi.pulseScale, 0, Math.PI * 2)
        ctx.fillStyle = pdi.color + '80'
        ctx.fill()
        // Rotation lines
        for (let i = 0; i < 4; i++) {
          const angle = pdi.rotation + (i * Math.PI / 2)
          const x1 = px + Math.cos(angle) * CELL_SIZE * 0.3
          const y1 = py + Math.sin(angle) * CELL_SIZE * 0.3
          const x2 = px + Math.cos(angle) * CELL_SIZE * 0.6 * pdi.pulseScale
          const y2 = py + Math.sin(angle) * CELL_SIZE * 0.6 * pdi.pulseScale
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.strokeStyle = pdi.color
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }
    }

    // Draw boss
    if (gs.boss && gs.boss.phase !== 'defeated' || (gs.boss && gs.boss.phase === 'defeated' && Date.now() - gs.boss.defeatedEffect < 1500)) {
      const bdi = getBossDrawInfo(gs.boss, now)
      const bx = gs.boss.position.x * CELL_SIZE + CELL_SIZE / 2
      const by = gs.boss.position.y * CELL_SIZE + CELL_SIZE / 2

      if (gs.boss.phase === 'defeated') {
        // Defeated explosion
        ctx.globalAlpha = bdi.opacity
        ctx.beginPath()
        ctx.arc(bx + bdi.shakeX, by, CELL_SIZE * bdi.size, 0, Math.PI * 2)
        ctx.fillStyle = bdi.glow
        ctx.fill()
      } else {
        // Progress ring
        ctx.beginPath()
        ctx.arc(bx, by, CELL_SIZE * 1.1, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * bdi.progress))
        ctx.strokeStyle = bdi.glow
        ctx.lineWidth = 2
        ctx.stroke()

        // Glow
        ctx.globalAlpha = 0.3
        ctx.beginPath()
        ctx.arc(bx, by, CELL_SIZE * bdi.size * 1.2, 0, Math.PI * 2)
        ctx.fillStyle = bdi.glow
        ctx.fill()
        ctx.globalAlpha = 1

        // Boss word
        ctx.font = `bold ${CELL_SIZE * bdi.size * 0.7}px monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(bdi.emoji + ' ' + gs.boss.word, bx + bdi.shakeX, by)

        // Progress text
        ctx.font = `bold ${CELL_SIZE * 0.5}px monospace`
        ctx.fillStyle = bdi.glow
        ctx.fillText(`${gs.boss.currentPasses}/${gs.boss.requiredPasses}`, bx, by + CELL_SIZE * 1.3)
      }
      ctx.globalAlpha = 1
    }

    // Combo indicator (enhanced with VFX)
    if (gs.comboCount > 1 && gameStarted && !gameOver && !paused) {
      const comboVfx = getComboVfx(gs.comboMultiplier)
      const comboText = getComboTextConfig(gs.comboMultiplier)
      const comboAlpha = Math.min(1, 0.5 + Math.sin(Date.now() / 300) * 0.3)
      ctx.globalAlpha = comboAlpha
      ctx.fillStyle = comboText.color
      ctx.font = `bold ${14 * comboText.scale}px sans-serif`
      ctx.textAlign = 'right'
      ctx.fillText(`${comboText.emoji} ×${gs.comboMultiplier.toFixed(1)} ${comboText.text}`, CANVAS_WIDTH - 12, 22)
      // Screen shake for high combos
      const shake = getComboScreenShake(gs.comboMultiplier, Date.now())
      if (shake.dx !== 0 || shake.dy !== 0) {
        // Applied via canvas translate in draw caller for subtlety
      }
      if (gs.lastEatenCategory) {
        ctx.fillStyle = CATEGORY_COLORS[gs.lastEatenCategory] ?? PACK_CATEGORY_INFO[gs.lastEatenCategory]?.color ?? '#f59e0b'
        ctx.font = '10px sans-serif'
        const catLabel = getCategoryInfo(gs.lastEatenCategory)?.label ?? PACK_CATEGORY_INFO[gs.lastEatenCategory]?.label ?? gs.lastEatenCategory
        ctx.fillText(`${gs.comboCount}× ${catLabel}`, CANVAS_WIDTH - 12, 36)
      }
      ctx.textAlign = 'start'
      ctx.globalAlpha = 1
    }

    // In-game progressive difficulty indicator (top-left badge)
    if (gs.inGameDifficulty && gameStarted && !gameOver && !paused) {
      const igd = gs.inGameDifficulty
      const badgePulse = igd.level >= 8 ? (0.7 + Math.sin(Date.now() / 200) * 0.3) : 1
      ctx.globalAlpha = badgePulse

      // Badge background
      const badgeX = 8
      const badgeY = 6
      ctx.font = 'bold 10px sans-serif'
      const labelWidth = ctx.measureText(`${igd.emoji} ${igd.label}`).width
      const badgeW = labelWidth + 20
      const badgeH = 18

      // Glow for legendary
      if (igd.level >= 10) {
        ctx.shadowColor = igd.glowColor
        ctx.shadowBlur = 12 + Math.sin(Date.now() / 150) * 6
      } else if (igd.level >= 7) {
        ctx.shadowColor = igd.color
        ctx.shadowBlur = 6
      }

      ctx.fillStyle = `${igd.color}18`
      ctx.beginPath()
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4)
      ctx.fill()

      // Border
      ctx.strokeStyle = `${igd.color}60`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4)
      ctx.stroke()

      ctx.shadowBlur = 0

      // Text
      ctx.fillStyle = igd.color
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${igd.emoji} ${igd.label}`, badgeX + 6, badgeY + badgeH / 2)

      // Speed indicator
      ctx.fillStyle = `${igd.color}99`
      ctx.font = '8px monospace'
      ctx.fillText(`×${igd.speedMultiplier.toFixed(2)}`, badgeX + badgeW - 4, badgeY + badgeH / 2 - 7)

      // Level number
      ctx.fillStyle = igd.glowColor
      ctx.font = 'bold 8px sans-serif'
      ctx.fillText(`Lv.${igd.level}`, badgeX + badgeW - 4, badgeY + badgeH / 2 + 5)

      ctx.textBaseline = 'alphabetic'
      ctx.globalAlpha = 1
    }

    // Active power-ups HUD at bottom
    if (gs.activePowerUps.length > 0 && gameStarted && !gameOver) {
      const hudY = CANVAS_HEIGHT - 24
      gs.activePowerUps.forEach((apu, i) => {
        const config = POWERUP_CONFIG[apu.type]
        const remaining = apu.expiresAt > 0 ? Math.max(0, Math.ceil((apu.expiresAt - Date.now()) / 1000)) : 0
        const x = 12 + i * 70

        ctx.fillStyle = `${config.color}30`
        ctx.beginPath()
        ctx.roundRect(x, hudY - 8, 60, 18, 4)
        ctx.fill()

        ctx.fillStyle = config.color
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(`${config.emoji} ${remaining > 0 ? remaining + 's' : '✓'}`, x + 4, hudY + 4)
      })
      ctx.textAlign = 'start'
    }

    // Speed Run Timer on canvas
    if (gs.isSpeedRun && gameStarted && !gameOver) {
      const timerColor = gs.speedRunTimeLeft <= 10 ? '#ef4444' : '#fb7185'
      const pulse = gs.speedRunTimeLeft <= 10 ? 0.7 + Math.sin(Date.now() / 200) * 0.3 : 1
      ctx.globalAlpha = pulse
      ctx.fillStyle = timerColor
      ctx.font = 'bold 16px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`⏱ ${gs.speedRunTimeLeft}s`, CANVAS_WIDTH / 2, 18)
      ctx.textAlign = 'start'
      ctx.globalAlpha = 1
    }

    // Mini-map (only during active gameplay)
    if (gs.showMiniMap && gameStarted && !gameOver) {
      const MAP_W = 120
      const MAP_H = 100
      const MAP_PAD = 10
      // Position above active power-ups HUD if present
      const mapBottomOffset = gs.activePowerUps.length > 0 ? 44 : MAP_PAD
      const mapX = CANVAS_WIDTH - MAP_W - MAP_PAD
      const mapY = CANVAS_HEIGHT - MAP_H - mapBottomOffset

      // Dim during pause
      if (paused) {
        ctx.globalAlpha = 0.4
      }

      // Background
      const mmBg = hexToRgb(gridTheme.bgColor)
      ctx.fillStyle = `rgba(${mmBg.r}, ${mmBg.g}, ${mmBg.b}, 0.85)`
      ctx.beginPath()
      ctx.roundRect(mapX, mapY, MAP_W, MAP_H, 6)
      ctx.fill()

      // Border
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(mapX, mapY, MAP_W, MAP_H, 6)
      ctx.stroke()

      // "MAP" label
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)'
      ctx.font = '8px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText('MAP', mapX + 4, mapY + 3)

      // Scale: grid (30×25) → map (120×100), so cellW = 4, cellH = 4
      const cellW = MAP_W / GRID_WIDTH
      const cellH = MAP_H / GRID_HEIGHT

      // Draw word food as a small colored dot
      if (wordFood) {
        const wfCatColor = CATEGORY_COLORS[wordFood.category] ?? '#f59e0b'
        ctx.fillStyle = wfCatColor
        ctx.beginPath()
        ctx.arc(
          mapX + wordFood.position.x * cellW + cellW / 2,
          mapY + wordFood.position.y * cellH + cellH / 2,
          3, 0, Math.PI * 2
        )
        ctx.fill()
      }

      // Draw power-up as a small colored dot
      if (gs.powerUp) {
        const puConfig = POWERUP_CONFIG[gs.powerUp.type]
        ctx.fillStyle = puConfig.color
        ctx.beginPath()
        ctx.arc(
          mapX + gs.powerUp.position.x * cellW + cellW / 2,
          mapY + gs.powerUp.position.y * cellH + cellH / 2,
          3, 0, Math.PI * 2
        )
        ctx.fill()
      }

      // Draw snake as small dots — head in headColor, body in bodyGradient[1]
      const mapSkin = getSnakeSkin(gs.activeSkin)
      snake.forEach((segment, index) => {
        if (index === 0) {
          ctx.fillStyle = gs.isDailyChallenge ? '#fbbf24' : mapSkin.headColor
        } else {
          ctx.fillStyle = gs.isDailyChallenge ? '#f59e0b' : mapSkin.bodyGradient[1]
        }
        ctx.beginPath()
        ctx.arc(
          mapX + segment.x * cellW + cellW / 2,
          mapY + segment.y * cellH + cellH / 2,
          index === 0 ? 3 : 2,
          0, Math.PI * 2
        )
        ctx.fill()
      })

      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'

      if (paused) {
        ctx.globalAlpha = 1
      }
    }

    // Draw floating texts
    const ft = floatingTextsRef.current
    for (let i = ft.length - 1; i >= 0; i--) {
      const f = ft[i]
      f.y += f.vy
      f.opacity -= 0.012
      f.scale = Math.min(1, f.scale + 0.05)
      if (f.opacity <= 0) { ft.splice(i, 1); continue }
      ctx.globalAlpha = f.opacity
      ctx.fillStyle = f.color
      ctx.font = `bold ${14 * f.scale}px sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(f.text, f.x, f.y)
      ctx.textAlign = 'start'
      ctx.globalAlpha = 1
    }

    // Draw particles
    const pts = particlesRef.current
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i]
      p.x += p.vx; p.y += p.vy; p.life -= 0.025; p.vy += 0.03
      if (p.life <= 0) { pts.splice(i, 1); continue }
      ctx.globalAlpha = p.life
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    // Draw preset-based particle effects (from particle-effects.ts)
    if (presetParticlesRef.current.length > 0) {
      const dt = 1 / 60
      presetParticlesRef.current = updateParticles(presetParticlesRef.current, dt)
      drawPresetParticles(ctx, presetParticlesRef.current)
    }

    // Draw moving obstacles
    if (movingObstaclesRef.current.length > 0) {
      drawMovingObstacles(ctx, movingObstaclesRef.current, CELL_SIZE, Date.now() / 1000)
    }

    // Draw destructible walls
    if (destructibleWallsRef.current.length > 0) {
      drawDestructibleWalls(ctx, destructibleWallsRef.current, CELL_SIZE, Date.now() / 1000)
      // Round 41: Draw freeze effect on destructible walls when freeze active
      const effectResult = powerUpEffectWireRef.current.applyEffects({} as any, 0.016)
      if (effectResult.freezeObstacles) {
        for (const wall of destructibleWallsRef.current) {
          drawFreezeOnObstacle(ctx, wall.position.x * CELL_SIZE, wall.position.y * CELL_SIZE, CELL_SIZE, Date.now())
        }
      }
    }

    // Round 41: Draw power-up canvas effects (ghost, magnet, bomb, shield, speed boost, score multiplier)
    {
      const pvs = powerUpVisualsRef.current
      const effectResult = powerUpEffectWireRef.current.applyEffects({} as any, 0.016)
      pvs.ghostMode = effectResult.ghostMode
      pvs.magnetRange = effectResult.magnetRange
      pvs.freezeActive = effectResult.freezeObstacles
      pvs.speedBoostActive = effectResult.movementSpeedMod < 1
      pvs.shieldActive = effectResult.shouldSkipCollision
      pvs.scoreMultiplierActive = effectResult.scoreMod > 1
      pvs.scoreMultiplierValue = effectResult.scoreMod
      updatePowerUpVisuals(pvs, 0.016, snake.length > 0 ? snake[0] : { x: 0, y: 0 })
      // Ghost trail: record current head position
      if (pvs.ghostMode && snake.length > 0) {
        recordGhostPosition(pvs, snake[0].x, snake[0].y)
      }
      drawPowerUpEffects(ctx, pvs, CELL_SIZE)
      // Ghost head glow
      if (pvs.ghostMode && snake.length > 0) {
        drawGhostHeadGlow(ctx, snake[0].x * CELL_SIZE + CELL_SIZE / 2, snake[0].y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE)
      }
    }

    // Draw hammer power-up pickup on grid
    if (hammerPowerUpRef.current) {
      const hp = hammerPowerUpRef.current.position
      const pulse = 0.8 + Math.sin(Date.now() / 200) * 0.2
      ctx.save()
      ctx.font = `${16 * pulse}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = HAMMER_CONFIG.color
      ctx.shadowBlur = 8 * pulse
      ctx.fillText(HAMMER_CONFIG.emoji, hp.x * CELL_SIZE + CELL_SIZE / 2, hp.y * CELL_SIZE + CELL_SIZE / 2)
      ctx.shadowBlur = 0
      ctx.restore()
    }

    // Draw hammer HUD indicator when active
    drawHammerIndicator(ctx, hammerStateRef.current, CANVAS_WIDTH, Date.now() / 1000)

    // Draw easter egg confetti particles
    const eeParticles = easterEggParticlesRef.current
    for (let i = eeParticles.length - 1; i >= 0; i--) {
      const p = eeParticles[i]
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.1 // gravity
      p.vx *= 0.99 // air resistance
      p.life -= 0.008
      p.rotation += p.rotSpeed
      if (p.life <= 0) { eeParticles.splice(i, 1); continue }

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.globalAlpha = Math.min(1, p.life * 2)
      ctx.fillStyle = p.color
      // Draw rectangle confetti
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
      ctx.restore()
      ctx.globalAlpha = 1
    }

    // PvP Score HUD (top center)
    if (pvpDraw && gameStarted) {
      const hudY = gameOver ? 10 : 10
      const barW = 200
      const barH = 22
      const barX = (CANVAS_WIDTH - barW) / 2

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.beginPath()
      ctx.roundRect(barX, hudY, barW, barH, 6)
      ctx.fill()

      // P1 score (green)
      ctx.fillStyle = '#4ade80'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(`P1: ${gs.score}`, barX + 10, hudY + barH / 2)

      // Divider
      ctx.fillStyle = '#475569'
      ctx.fillText('|', CANVAS_WIDTH / 2 - 4, hudY + barH / 2)

      // P2 score (cyan)
      ctx.fillStyle = '#22d3ee'
      ctx.textAlign = 'right'
      ctx.fillText(`P2: ${pvpDraw.player2Score}`, barX + barW - 10, hudY + barH / 2)

      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'

      // P2 words collected list (right side of canvas)
      if (!gameOver) {
        const wordsListX = CANVAS_WIDTH - 8
        const wordsListY = 40
        ctx.fillStyle = 'rgba(6, 182, 212, 0.12)'
        ctx.beginPath()
        ctx.roundRect(wordsListX - 100, wordsListY - 12, 108, Math.min(pvpDraw.player2WordsEaten.length * 14 + 18, 120), 4)
        ctx.fill()
        ctx.fillStyle = '#22d3ee'
        ctx.font = 'bold 8px sans-serif'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'top'
        ctx.fillText('P2 Words', wordsListX, wordsListY - 10)
        const maxShow = 7
        const recentWords = pvpDraw.player2WordsEaten.slice(-maxShow)
        ctx.font = '9px monospace'
        ctx.fillStyle = '#94a3b8'
        recentWords.forEach((w, i) => {
          ctx.fillText(w, wordsListX, wordsListY + 4 + i * 14)
        })
        if (pvpDraw.player2WordsEaten.length > maxShow) {
          ctx.fillStyle = '#475569'
          ctx.fillText(`+${pvpDraw.player2WordsEaten.length - maxShow} more`, wordsListX, wordsListY + 4 + maxShow * 14)
        }
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      }
    }

    // AI Bot Score HUD (top center)
    if (aiBotDraw && gameStarted) {
      const hudY = gameOver ? 10 : 10
      const barW = 220
      const barH = 22
      const barX = (CANVAS_WIDTH - barW) / 2

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.beginPath()
      ctx.roundRect(barX, hudY, barW, barH, 6)
      ctx.fill()

      // Player score (green)
      ctx.fillStyle = '#4ade80'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(`You: ${gs.score}`, barX + 10, hudY + barH / 2)

      // Divider
      ctx.fillStyle = '#475569'
      ctx.fillText('|', CANVAS_WIDTH / 2 - 4, hudY + barH / 2)

      // Bot score (orange)
      ctx.fillStyle = aiBotDraw.alive ? '#f97316' : '#64748b'
      ctx.textAlign = 'right'
      ctx.fillText(`🤖 Bot: ${aiBotDraw.score}`, barX + barW - 10, hudY + barH / 2)

      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'

      // Bot words collected list (right side of canvas)
      if (!gameOver) {
        const wordsListX = CANVAS_WIDTH - 8
        const wordsListY = 40
        ctx.fillStyle = 'rgba(249, 115, 22, 0.12)'
        ctx.beginPath()
        ctx.roundRect(wordsListX - 100, wordsListY - 12, 108, Math.min(aiBotDraw.wordsEaten.length * 14 + 18, 120), 4)
        ctx.fill()
        ctx.fillStyle = '#f97316'
        ctx.font = 'bold 8px sans-serif'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'top'
        ctx.fillText('🤖 Bot Words', wordsListX, wordsListY - 10)
        const maxShow = 7
        const recentWords = aiBotDraw.wordsEaten.slice(-maxShow)
        ctx.font = '9px monospace'
        ctx.fillStyle = '#94a3b8'
        recentWords.forEach((w, i) => {
          ctx.fillText(w, wordsListX, wordsListY + 4 + i * 14)
        })
        if (aiBotDraw.wordsEaten.length > maxShow) {
          ctx.fillStyle = '#475569'
          ctx.fillText(`+${aiBotDraw.wordsEaten.length - maxShow} more`, wordsListX, wordsListY + 4 + maxShow * 14)
        }
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      }
    }

    // Scanlines overlay (retro CRT effect)
    if (gridTheme.scanlines) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'
      for (let y = 0; y < CANVAS_HEIGHT; y += 3) {
        ctx.fillRect(0, y, CANVAS_WIDTH, 1)
      }
    }

    // Tutorial canvas overlay
    if (tutorialTutorialGameRef.current && gameStarted && !gameOver) {
      const ts = tutorialStateRef.current
      if (ts && ts.active) {
        const step = ts.steps[ts.currentStep]
        if (step) {
          // Dim overlay
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

          // Spotlight highlight
          const pulse = 0.6 + Math.sin(Date.now() / 400) * 0.4
          let spotlightX = CANVAS_WIDTH / 2
          let spotlightY = CANVAS_HEIGHT / 2
          let spotlightRadius = 60

          if (step.highlight === 'snake' && snake.length > 0) {
            const head = snake[0]
            spotlightX = head.x * CELL_SIZE + CELL_SIZE / 2
            spotlightY = head.y * CELL_SIZE + CELL_SIZE / 2
            spotlightRadius = 70
          } else if (step.highlight === 'food' && wordFood) {
            spotlightX = wordFood.position.x * CELL_SIZE + CELL_SIZE / 2
            spotlightY = wordFood.position.y * CELL_SIZE + CELL_SIZE / 2
            spotlightRadius = 65
          } else if (step.highlight === 'score') {
            spotlightX = CANVAS_WIDTH / 2
            spotlightY = 16
            spotlightRadius = 50
          } else if (step.highlight === 'controls') {
            spotlightX = CANVAS_WIDTH / 2
            spotlightY = CANVAS_HEIGHT - 20
            spotlightRadius = 55
          }

          if (step.highlight !== 'none') {
            // Pulsing circle
            ctx.beginPath()
            ctx.arc(spotlightX, spotlightY, spotlightRadius * (0.9 + pulse * 0.1), 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(96, 165, 250, ${pulse * 0.8})`
            ctx.lineWidth = 2.5
            ctx.stroke()

            // Inner glow
            const grad = ctx.createRadialGradient(spotlightX, spotlightY, 0, spotlightX, spotlightY, spotlightRadius)
            grad.addColorStop(0, `rgba(96, 165, 250, ${pulse * 0.15})`)
            grad.addColorStop(1, 'rgba(96, 165, 250, 0)')
            ctx.fillStyle = grad
            ctx.beginPath()
            ctx.arc(spotlightX, spotlightY, spotlightRadius, 0, Math.PI * 2)
            ctx.fill()

            // Animated ring
            const ringRadius = spotlightRadius + 5 + pulse * 8
            ctx.beginPath()
            ctx.arc(spotlightX, spotlightY, ringRadius, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(96, 165, 250, ${0.3 * (1 - pulse)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }

          // "TUTORIAL" label in top-left corner of canvas
          ctx.fillStyle = 'rgba(59, 130, 246, 0.7)'
          ctx.font = 'bold 10px sans-serif'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'top'
          ctx.fillText(`🎓 Tutorial  ${ts.currentStep + 1}/${ts.steps.length}`, 8, 6)
          ctx.textAlign = 'start'
          ctx.textBaseline = 'alphabetic'
        }
      }
    }

    // Game over overlay
    if (gameOver) {
      // PvP game over overlay
      if (pvpDraw && pvpDraw.winner) {
        const goBg = hexToRgb(gridTheme.bgColor)
        ctx.fillStyle = `rgba(${goBg.r}, ${goBg.g}, ${goBg.b}, 0.88)`
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

        let titleText: string
        let titleColor: string
        let subtitleEmoji: string
        if (pvpDraw.winner === 'player1') {
          titleText = 'Player 1 Wins!'
          titleColor = '#4ade80'
          subtitleEmoji = '🏆'
        } else if (pvpDraw.winner === 'player2') {
          titleText = 'Player 2 Wins!'
          titleColor = '#22d3ee'
          subtitleEmoji = '🏆'
        } else {
          titleText = "It's a Tie!"
          titleColor = '#fbbf24'
          subtitleEmoji = '🤝'
        }

        // Decorative line
        const lineGrad = ctx.createLinearGradient(CANVAS_WIDTH * 0.2, 0, CANVAS_WIDTH * 0.8, 0)
        lineGrad.addColorStop(0, 'rgba(148, 163, 184, 0)')
        lineGrad.addColorStop(0.5, titleColor + '99')
        lineGrad.addColorStop(1, 'rgba(148, 163, 184, 0)')
        ctx.strokeStyle = lineGrad; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH * 0.15, CANVAS_HEIGHT / 2 - 90); ctx.lineTo(CANVAS_WIDTH * 0.85, CANVAS_HEIGHT / 2 - 90); ctx.stroke()

        // Title
        ctx.fillStyle = titleColor
        ctx.font = 'bold 36px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${subtitleEmoji} ${titleText} ${subtitleEmoji}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50)

        // Score summary
        ctx.font = '18px sans-serif'
        ctx.fillStyle = '#4ade80'
        ctx.fillText(`P1: ${gs.score} pts`, CANVAS_WIDTH / 2 - 90, CANVAS_HEIGHT / 2)
        ctx.fillStyle = '#22d3ee'
        ctx.fillText(`P2: ${pvpDraw.player2Score} pts`, CANVAS_WIDTH / 2 + 90, CANVAS_HEIGHT / 2)

        // Words eaten
        ctx.fillStyle = '#64748b'
        ctx.font = '14px sans-serif'
        ctx.fillText(`P1 ate ${gs.wordsEaten} words  •  P2 ate ${pvpDraw.player2WordsEaten.length} words  •  ${formatTime(gs.elapsedTime)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30)

        // Bottom line
        ctx.strokeStyle = lineGrad
        ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH * 0.15, CANVAS_HEIGHT / 2 + 60); ctx.lineTo(CANVAS_WIDTH * 0.85, CANVAS_HEIGHT / 2 + 60); ctx.stroke()

        const alpha = 0.5 + Math.sin(Date.now() / 500) * 0.3
        ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`; ctx.font = '14px sans-serif'
        ctx.fillText('Press Space or click to return to menu', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 85)
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      } else if (aiBotDraw) {
        // AI Bot game over overlay — compare scores
        const goBg = hexToRgb(gridTheme.bgColor)
        ctx.fillStyle = `rgba(${goBg.r}, ${goBg.g}, ${goBg.b}, 0.88)`
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

        let titleText: string
        let titleColor: string
        let subtitleEmoji: string
        if (gs.score > aiBotDraw.score) {
          titleText = 'You Win!'
          titleColor = '#4ade80'
          subtitleEmoji = '🏆'
        } else if (gs.score < aiBotDraw.score) {
          titleText = 'AI Bot Wins!'
          titleColor = '#f97316'
          subtitleEmoji = '🤖'
        } else {
          titleText = "It's a Tie!"
          titleColor = '#fbbf24'
          subtitleEmoji = '🤝'
        }

        // Decorative line
        const lineGrad = ctx.createLinearGradient(CANVAS_WIDTH * 0.2, 0, CANVAS_WIDTH * 0.8, 0)
        lineGrad.addColorStop(0, 'rgba(148, 163, 184, 0)')
        lineGrad.addColorStop(0.5, titleColor + '99')
        lineGrad.addColorStop(1, 'rgba(148, 163, 184, 0)')
        ctx.strokeStyle = lineGrad; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH * 0.15, CANVAS_HEIGHT / 2 - 90); ctx.lineTo(CANVAS_WIDTH * 0.85, CANVAS_HEIGHT / 2 - 90); ctx.stroke()

        // Title
        ctx.fillStyle = titleColor
        ctx.font = 'bold 36px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${subtitleEmoji} ${titleText} ${subtitleEmoji}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50)

        // Score summary
        ctx.font = '18px sans-serif'
        ctx.fillStyle = '#4ade80'
        ctx.fillText(`You: ${gs.score} pts`, CANVAS_WIDTH / 2 - 90, CANVAS_HEIGHT / 2)
        ctx.fillStyle = '#f97316'
        ctx.fillText(`🤖 Bot: ${aiBotDraw.score} pts`, CANVAS_WIDTH / 2 + 90, CANVAS_HEIGHT / 2)

        // Words eaten
        ctx.fillStyle = '#64748b'
        ctx.font = '14px sans-serif'
        ctx.fillText(`You ate ${gs.wordsEaten} words  •  Bot ate ${aiBotDraw.wordsEaten.length} words  •  ${formatTime(gs.elapsedTime)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30)

        // Bottom line
        ctx.strokeStyle = lineGrad
        ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH * 0.15, CANVAS_HEIGHT / 2 + 60); ctx.lineTo(CANVAS_WIDTH * 0.85, CANVAS_HEIGHT / 2 + 60); ctx.stroke()

        const alpha = 0.5 + Math.sin(Date.now() / 500) * 0.3
        ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`; ctx.font = '14px sans-serif'
        ctx.fillText('Press Space or click to return to menu', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 85)
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      } else {
        // Original single-player game over overlay
      const goBg = hexToRgb(gridTheme.bgColor)
      ctx.fillStyle = `rgba(${goBg.r}, ${goBg.g}, ${goBg.b}, 0.88)`
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      const lineGrad = ctx.createLinearGradient(CANVAS_WIDTH * 0.2, 0, CANVAS_WIDTH * 0.8, 0)
      lineGrad.addColorStop(0, 'rgba(239, 68, 68, 0)')
      lineGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.8)')
      lineGrad.addColorStop(1, 'rgba(239, 68, 68, 0)')

      ctx.strokeStyle = lineGrad; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH * 0.15, CANVAS_HEIGHT / 2 - 80); ctx.lineTo(CANVAS_WIDTH * 0.85, CANVAS_HEIGHT / 2 - 80); ctx.stroke()

      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 40px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40)

      // Score with streak bonus
      const bonusInfo = applyStreakBonus(gs.score, streakInfo?.currentStreak ?? 0)
      ctx.fillStyle = '#94a3b8'; ctx.font = '18px sans-serif'
      if (bonusInfo.multiplier > 1) {
        ctx.fillText(`Score: ${gs.score} (×${bonusInfo.multiplier} streak bonus)`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
      } else {
        ctx.fillText(`Score: ${gs.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
      }

      ctx.fillStyle = '#64748b'; ctx.font = '14px sans-serif'
      ctx.fillText(`${gs.wordsEaten} words collected  •  ${formatTime(gs.elapsedTime)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25)

      // In-game difficulty reached
      if (gs.inGameDifficulty && gs.inGameDifficulty.level >= 3) {
        ctx.fillStyle = gs.inGameDifficulty.color
        ctx.font = '12px sans-serif'
        ctx.fillText(`${gs.inGameDifficulty.emoji} Peak: ${gs.inGameDifficulty.label} (Lv.${gs.inGameDifficulty.level})`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 43)
      }

      // Daily challenge result
      if (gs.isDailyChallenge) {
        const dailyCompleted = gs.score >= gs.dailyTargetScore
        ctx.fillStyle = dailyCompleted ? '#4ade80' : '#f87171'
        ctx.font = 'bold 16px sans-serif'
        ctx.fillText(
          dailyCompleted
            ? 'Daily Complete! 🎉'
            : `Target missed (${gs.dailyTargetScore} pts needed)`,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2 + 55
        )
      }

      // Leaderboard rank
      if (leaderboardRank > 0) {
        const rankY = gs.isDailyChallenge ? CANVAS_HEIGHT / 2 + 75 : CANVAS_HEIGHT / 2 + 55
        const totalEntries = getEntryCount(gs.difficulty)
        if (leaderboardRank === 1) {
          ctx.fillStyle = '#fbbf24'
          ctx.font = 'bold 16px sans-serif'
          ctx.fillText('New High Score! 🏆', CANVAS_WIDTH / 2, rankY)
        } else {
          ctx.fillStyle = '#94a3b8'
          ctx.font = '14px sans-serif'
          ctx.fillText(`Rank #${leaderboardRank} of ${totalEntries}`, CANVAS_WIDTH / 2, rankY)
        }
      }

      ctx.strokeStyle = lineGrad
      ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH * 0.15, CANVAS_HEIGHT / 2 + 90); ctx.lineTo(CANVAS_WIDTH * 0.85, CANVAS_HEIGHT / 2 + 90); ctx.stroke()

      const alpha = 0.5 + Math.sin(Date.now() / 500) * 0.3
      ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`; ctx.font = '14px sans-serif'
      ctx.fillText('Press Space or click to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 115)
      ctx.textAlign = 'start'
      } // end else single-player game over
    }

    // Start screen
    if (!gameStarted) {
      const ssBg = hexToRgb(gridTheme.bgColor)
      ctx.fillStyle = `rgba(${ssBg.r}, ${ssBg.g}, ${ssBg.b}, 0.92)`
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Tutorial completion confetti
      if (tutorialConfettiActiveRef.current) {
        const confetti = tutorialConfettiRef.current
        for (let i = confetti.length - 1; i >= 0; i--) {
          const c = confetti[i]
          c.x += c.vx
          c.y += c.vy
          c.vy += 0.12
          c.rotation += c.rotSpeed
          c.life -= 0.008
          if (c.life <= 0) { confetti.splice(i, 1); continue }
          ctx.save()
          ctx.translate(c.x, c.y)
          ctx.rotate(c.rotation)
          ctx.globalAlpha = Math.min(1, c.life * 2)
          ctx.fillStyle = c.color
          ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2)
          ctx.restore()
          ctx.globalAlpha = 1
        }
      }

      const startSkin = getSnakeSkin(gs.activeSkin)

      // === LEFT COLUMN: Title, legends, info ===
      const leftCenterX = CANVAS_WIDTH * 0.33

      // Title
      ctx.shadowColor = startSkin.glowColor; ctx.shadowBlur = 20
      ctx.fillStyle = startSkin.headColor; ctx.font = 'bold 36px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('WORD SNAKE', leftCenterX, 68)
      ctx.shadowBlur = 0

      ctx.fillStyle = '#94a3b8'; ctx.font = '13px sans-serif'
      ctx.fillText('Eat words, collect them, make poetry', leftCenterX, 92)

      // Category legend (2 columns on left side)
      const categories: WordCategory[] = ['nature', 'emotion', 'element', 'time', 'creature', 'quality', 'object', 'action']
      const catCols = 2
      const catStartY = 116
      const catRowH = 18
      const catColW = 130
      categories.forEach((cat, i) => {
        const info = getCategoryInfo(cat) ?? { label: cat, color: '#94a3b8', emoji: '📝' }
        const col = i % catCols
        const row = Math.floor(i / catCols)
        const x = leftCenterX - (catCols * catColW) / 2 + col * catColW + 10
        const y = catStartY + row * catRowH
        ctx.fillStyle = CATEGORY_COLORS[cat] ?? PACK_CATEGORY_INFO[cat]?.color ?? '#94a3b8'
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(info.label, x + 8, y + 4)
      })

      // Rarity legend
      const rarityY = catStartY + (Math.ceil(categories.length / catCols)) * catRowH + 8
      ctx.textAlign = 'center'
      ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'
      ctx.fillText('Rarity:', leftCenterX - 70, rarityY)
      const rarities: WordRarity[] = ['common', 'uncommon', 'rare', 'legendary']
      let rx = leftCenterX - 42
      rarities.forEach((r) => {
        const rc = RARITY_CONFIG[r]
        ctx.fillStyle = rc.color
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(`${rc.emoji || '•'} ${rc.label}`, rx, rarityY)
        rx += 60
      })
      ctx.textAlign = 'start'

      // Weather info note
      ctx.textAlign = 'center'
      ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'
      ctx.fillText('Weather changes each game', leftCenterX, rarityY + 16)
      ctx.fillText('Rain slows · Snow fogs · Stars boost', leftCenterX, rarityY + 30)
      ctx.textAlign = 'start'

      // Streak bonus legend
      if (streakInfo && streakInfo.currentStreak > 0) {
        const activeBonus = getActiveStreakBonus(streakInfo.currentStreak)
        const bonusY = rarityY + 48
        ctx.textAlign = 'center'
        ctx.fillStyle = '#f59e0b'; ctx.font = '11px sans-serif'
        if (activeBonus) {
          ctx.fillText(`🔥 ${streakInfo.currentStreak}-day streak: ${activeBonus.name}`, leftCenterX, bonusY)
          ctx.fillStyle = '#d97706'; ctx.font = '10px sans-serif'
          ctx.fillText(`×${activeBonus.multiplier} bonus`, leftCenterX, bonusY + 14)
        } else {
          const next = STREAK_BONUSES.find((b) => b.days > streakInfo.currentStreak)
          if (next) {
            ctx.fillText(`🔥 ${streakInfo.currentStreak}-day streak`, leftCenterX, bonusY)
            ctx.fillStyle = '#d97706'; ctx.font = '10px sans-serif'
            ctx.fillText(`${next.days - streakInfo.currentStreak} days to ${next.name}`, leftCenterX, bonusY + 14)
          }
        }
        ctx.textAlign = 'start'
      }

      // === RIGHT COLUMN: Animated Snake Skin Preview ===
      const previewCenterX = CANVAS_WIDTH * 0.72
      const previewCenterY = 195
      const previewSegments = 10
      const segSize = 18
      const segGap = 22
      const time = Date.now()

      // Generate S-curve positions with gentle wave animation
      const previewPositions: { x: number; y: number }[] = []
      for (let i = 0; i < previewSegments; i++) {
        const t = i / (previewSegments - 1) // 0 to 1
        const baseX = previewCenterX - (previewSegments / 2 - i) * segGap * 0.6
        // S-curve: sine wave offset, animated gently
        const waveOffset = Math.sin(t * Math.PI * 2 + time / 1200) * 28
        const microWave = Math.sin(t * Math.PI * 3 + time / 800 + i * 0.3) * 4
        previewPositions.push({
          x: baseX + Math.sin(t * Math.PI * 1.2) * 15,
          y: previewCenterY + waveOffset + microWave,
        })
      }

      // Draw glow behind preview snake
      ctx.globalAlpha = 0.06
      ctx.fillStyle = startSkin.glowColor
      for (const seg of previewPositions) {
        ctx.beginPath()
        ctx.arc(seg.x, seg.y, segSize * 0.9, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // Draw preview snake segments (body first, then head on top)
      for (let i = previewSegments - 1; i >= 0; i--) {
        const seg = previewPositions[i]

        if (i === 0) {
          // Head
          ctx.shadowColor = startSkin.glowColor
          ctx.shadowBlur = 10
          ctx.fillStyle = startSkin.headColor
          ctx.beginPath()
          ctx.roundRect(seg.x - segSize / 2 + 1, seg.y - segSize / 2 + 1, segSize - 2, segSize - 2, 5)
          ctx.fill()
          ctx.shadowBlur = 0

          // Eyes - facing right-ish (toward next segment direction)
          const nextSeg = previewPositions[1]
          const dx = nextSeg.x - seg.x
          const dy = nextSeg.y - seg.y
          const eyeAngle = Math.atan2(dy, dx)
          const eyeOffset = 4
          const eyePerpOffset = 3.5

          const eye1x = seg.x + Math.cos(eyeAngle) * eyeOffset + Math.cos(eyeAngle + Math.PI / 2) * eyePerpOffset
          const eye1y = seg.y + Math.sin(eyeAngle) * eyeOffset + Math.sin(eyeAngle + Math.PI / 2) * eyePerpOffset
          const eye2x = seg.x + Math.cos(eyeAngle) * eyeOffset + Math.cos(eyeAngle - Math.PI / 2) * eyePerpOffset
          const eye2y = seg.y + Math.sin(eyeAngle) * eyeOffset + Math.sin(eyeAngle - Math.PI / 2) * eyePerpOffset

          ctx.fillStyle = startSkin.eyeColor
          ctx.beginPath(); ctx.arc(eye1x, eye1y, 3, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(eye2x, eye2y, 3, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = gridTheme.bgColor
          ctx.beginPath(); ctx.arc(eye1x, eye1y, 1.8, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(eye2x, eye2y, 1.8, 0, Math.PI * 2); ctx.fill()
        } else {
          // Body segment
          const ratio = 1 - i / previewSegments

          // Determine fill color based on pattern (same logic as gameplay snake)
          if (startSkin.pattern === 'rainbow') {
            const hue = (i * 360 / previewSegments + time / 50) % 360
            ctx.fillStyle = `hsl(${hue}, 70%, 55%)`
          } else if (startSkin.pattern === 'gradient') {
            const c0 = hexToRgb(startSkin.bodyGradient[0])
            const c1 = hexToRgb(startSkin.bodyGradient[1])
            const alpha = 0.6 + ratio * 0.4
            const r = Math.floor(c0.r + (c1.r - c0.r) * ratio)
            const g = Math.floor(c0.g + (c1.g - c0.g) * ratio)
            const b = Math.floor(c0.b + (c1.b - c0.b) * ratio)
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
          } else if (startSkin.pattern === 'striped') {
            const c0 = hexToRgb(startSkin.bodyGradient[0])
            const c1 = hexToRgb(startSkin.bodyGradient[1])
            const alpha = (0.6 + ratio * 0.4) * (i % 2 === 0 ? 1 : 0.55)
            const r = Math.floor(c0.r + (c1.r - c0.r) * ratio)
            const g = Math.floor(c0.g + (c1.g - c0.g) * ratio)
            const b = Math.floor(c0.b + (c1.b - c0.b) * ratio)
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
          } else if (startSkin.pattern === 'dotted') {
            const c0 = hexToRgb(startSkin.bodyGradient[0])
            const c1 = hexToRgb(startSkin.bodyGradient[1])
            const alpha = 0.6 + ratio * 0.4
            const r = Math.floor(c0.r + (c1.r - c0.r) * ratio)
            const g = Math.floor(c0.g + (c1.g - c0.g) * ratio)
            const b = Math.floor(c0.b + (c1.b - c0.b) * ratio)
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
          } else {
            // solid pattern
            const c0 = hexToRgb(startSkin.bodyGradient[0])
            const c1 = hexToRgb(startSkin.bodyGradient[1])
            const alpha = 0.6 + ratio * 0.4
            const r = Math.floor(c0.r + (c1.r - c0.r) * ratio)
            const g = Math.floor(c0.g + (c1.g - c0.g) * ratio)
            const b = Math.floor(c0.b + (c1.b - c0.b) * ratio)
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
          }

          // Draw connector between adjacent segments (except dotted)
          if (startSkin.pattern !== 'dotted' && i > 0) {
            const prev = previewPositions[i - 1]
            ctx.fillRect(
              Math.min(prev.x, seg.x) - segSize / 2 + 3,
              Math.min(prev.y, seg.y) - segSize / 2 + 3,
              Math.abs(prev.x - seg.x) + segSize - 6,
              Math.abs(prev.y - seg.y) + segSize - 6
            )
          }

          // Draw segment shape
          if (startSkin.pattern === 'dotted') {
            ctx.beginPath()
            ctx.arc(seg.x, seg.y, segSize / 2 - 3, 0, Math.PI * 2)
            ctx.fill()
          } else {
            ctx.beginPath()
            ctx.roundRect(seg.x - segSize / 2 + 2, seg.y - segSize / 2 + 2, segSize - 4, segSize - 4, 3)
            ctx.fill()
          }
        }
      }

      // Skin name below the preview snake
      ctx.textAlign = 'center'
      ctx.fillStyle = startSkin.headColor; ctx.font = 'bold 14px sans-serif'
      ctx.fillText(startSkin.name, previewCenterX, previewCenterY + 85)
      ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'
      ctx.fillText(startSkin.description, previewCenterX, previewCenterY + 100)
      ctx.textAlign = 'start'

      // === BOTTOM: Controls and start prompt ===
      ctx.textAlign = 'center'
      ctx.fillStyle = '#64748b'; ctx.font = '12px sans-serif'
      ctx.fillText('Arrow Keys / WASD  •  Space to start  •  Swipe on mobile', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50)

      const alpha = 0.5 + Math.sin(Date.now() / 500) * 0.3
      ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`; ctx.font = 'bold 16px sans-serif'
      ctx.fillText('Press Space or click to start', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 25)
      ctx.textAlign = 'start'
    }

    // Pause overlay
    if (paused && gameStarted && !gameOver) {
      const poBg = hexToRgb(gridTheme.bgColor)
      ctx.fillStyle = `rgba(${poBg.r}, ${poBg.g}, ${poBg.b}, 0.78)`
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 15
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 32px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10)
      ctx.shadowBlur = 0

      ctx.fillStyle = '#94a3b8'; ctx.font = '14px sans-serif'
      ctx.fillText(`${formatTime(gs.elapsedTime)}  •  ${gs.wordsEaten} words  •  ${gs.score} pts`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15)

      const alpha = 0.5 + Math.sin(Date.now() / 500) * 0.3
      ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`; ctx.font = '14px sans-serif'
      ctx.fillText('Press Space or Esc to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 45)
      ctx.textAlign = 'start'
    }
  }, [streakInfo, leaderboardRank])

  const resetGame = useCallback((isDaily: boolean = false, isSpeedRun: boolean = false) => {
    const gs = gameStateRef.current
    const diff = gs.difficulty
    const settings = DIFFICULTY_SETTINGS[diff]
    gs.snake = [
      { x: 5, y: 12 },
      { x: 4, y: 12 },
      { x: 3, y: 12 },
    ]
    gs.direction = 'RIGHT'
    gs.gameOver = false
    gs.paused = false
    gs.score = 0
    gs.speed = settings.speed
    gs.wordsEaten = 0
    gs.gameStarted = true
    // Round 43: Game start — dashboard + SFX context
    realtimeDashboardRef.current.pushGameStartEvent(gs.isDailyChallenge ? 'daily' : 'classic', gs.difficulty || 'medium')
    sfxVolumeCatRef.current.setGameContext('playing')
    // Round 43b: Mastery panel wire — game start
    masteryPanelWireRef.current.onGameStart()
    // Round 45: XP progression — reset session on game start
    xpResetSession()
    gs.wordFood = null
    gs.startTime = Date.now()
    gs.elapsedTime = 0
    directionQueueRef.current = []
    p2DirectionQueueRef.current = []
    floatingTextsRef.current = []
    particlesRef.current = []
    presetParticlesRef.current = []
    clearEvents(eventFeedRef.current)
    resetMovingObstacleIds()
    movingObstaclesRef.current = []
    resetDestructibleWallIds()
    destructibleWallsRef.current = []
    hammerStateRef.current = createInitialHammerState()
    hammerPowerUpRef.current = null
    setHammerActive(false)
    gameIdRef.current = `game-${Date.now()}`
    resetDestructibleWallIds()
    destructibleWallsRef.current = []
    hammerStateRef.current = createInitialHammerState()
    hammerPowerUpRef.current = null
    setHammerActive(false)
    gameIdRef.current = `game-${Date.now()}`
    collectedWordsRef.current = new Set()
    easterEggParticlesRef.current = []
    resetVisualizer()
    setActiveEasterEggs([])
    resetEasterEggForNewGame()
    setLeaderboardRank(0)
    // Clear PvP state (PvP mode is session-only, not persisted)
    pvpRef.current = null
    // Clear AI bot state
    aiBotRef.current = null
    setAiBotActive(false)

    // Daily challenge setup
    if (isDaily) {
      const challenge = getDailyChallenge()
      gs.isDailyChallenge = true
      gs.dailyChallengeWords = challenge.words
      gs.dailyWordsCollected = []
      gs.dailyTargetScore = challenge.targetScore
    } else {
      gs.isDailyChallenge = false
      gs.dailyChallengeWords = []
      gs.dailyWordsCollected = []
      gs.dailyTargetScore = 0
    }

    // Streak multiplier
    const streak = getStreak()
    gs.streakMultiplier = getStreakMultiplier(streak.currentStreak)

    // Reset power-ups and combo
    gs.powerUp = null
    gs.activePowerUps = []
    gs.comboCount = 0
    gs.lastEatenCategory = null
    gs.comboMultiplier = 1

    // Reset obstacles, portals, quiz
    gs.obstacles = []
    gs.portalPairs = []
    gs.activeQuiz = null
    gs.quizStreak = 0
    gs.iceSlideQueued = false
    obstaclesRef.current = []
    portalPairsRef.current = []
    portalNextIdRef.current = 0
    quizStreakRef.current = 0
    iceSlideQueuedRef.current = false

    // Reset boss
    gs.boss = null
    bossRef.current = null
    // Load boss defeats count
    try { bossDefeatsRef.current = parseInt(localStorage.getItem('word-snake-boss-defeats') || '0') } catch { bossDefeatsRef.current = 0 }
    gs.bossDefeats = bossDefeatsRef.current
    // Load bot skin
    activeBotSkinRef.current = getBotSkin(getSavedBotSkin()) || getDefaultBotSkin()
    gs.activeBotSkin = activeBotSkinRef.current
    // Reset PvP power-up state
    pvpPowerUpStateRef.current = null
    gs.pvpPowerUpState = null

    // Reset scramble
    gs.activeScramble = null
    activeScrambleRef.current = null
    // Load coin balance & shop items
    gs.coinBalance = getCoinBalance().coins
    gs.shopItems = getShopItems()
    // Reset combo VFX
    gs.comboVfxParticles = []
    comboVfxParticlesRef.current = []
    resetComboAnnouncement()

    // Clear achievement queue and toast
    achievementQueue.clear()
    // Start replay recording (not for PvP or replay mode)
    if (!pvpRef.current && !isPlaybackActive()) {
      try { startRecording() } catch { /* ignore */ }
    }
    gs.lastAchievement = null
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
      toastTimerRef.current = null
    }

    // Reset milestone state and set extra life from Silver milestone
    gs.lastMilestone = null
    if (milestoneToastTimerRef.current) {
      clearTimeout(milestoneToastTimerRef.current)
      milestoneToastTimerRef.current = null
    }
    const milestoneBonuses = getActiveMilestoneBonuses()
    gs.extraLifeAvailable = milestoneBonuses.extraLife > 0

    // Random weather
    const weathers: GameState['weather'][] = ['clear', 'rain', 'snow', 'stars']
    gs.weather = weathers[Math.floor(Math.random() * weathers.length)]
    weatherParticlesRef.current = []

    // Speed run and words-by-category reset
    gs.speedRunMaxCombo = 0
    gs.speedRunPowerUpsCollected = 0
    gs.speedRunLongestSnake = gs.snake.length
    gs.wordsByCategory = {}

    // Reset in-game progressive difficulty
    gs.inGameDifficulty = null
    prevInGameDiffLevelRef.current = 0

    // If speed run, set timer
    if (isSpeedRun) {
      gs.isSpeedRun = true
      gs.speedRunTimeLeft = getSpeedRunDuration()
    } else {
      gs.isSpeedRun = false
      gs.speedRunTimeLeft = getSpeedRunDuration()
    }

    spawnWord()
    playSound(playStartSound)

    // Round 39: Event bus — game start
    eventBusWireRef.current.onGameStart({ mode: isSpeedRun ? 'speed_run' : isDaily ? 'daily_challenge' : 'classic', difficulty: gs.difficulty })
    if (isDaily) eventBusWireRef.current.onDailyChallengeStart(gs.dailyChallengeWords, gs.dailyTargetScore)
    // Round 40: Event log — game start
    eventLogPanelRef.current.addEntries(createGameStartEntries({ mode: isSpeedRun ? 'speed_run' : isDaily ? 'daily_challenge' : 'classic', difficulty: gs.difficulty }))
    setEventLogEntries(eventLogPanelRef.current.getRecentEntries(20))

    // Track games played & update streak
    try {
      const games = parseInt(localStorage.getItem('word-snake-games') ?? '0', 10) + 1
      localStorage.setItem('word-snake-games', String(games))
    } catch { /* ignore */ }

    // Update streak
    const updatedStreak = updateStreak()
    setStreakInfo(updatedStreak)

    updateUI()
  }, [spawnWord, updateUI, playSound])

  // Timer interval
  useEffect(() => {
    const tick = () => {
      const gs = gameStateRef.current
      if (gs.gameStarted && !gs.gameOver && !gs.paused) {
        gs.elapsedTime = Date.now() - gs.startTime
        // Speed run countdown (decrement every second using elapsed time)
        if (gs.isSpeedRun) {
          const elapsed = Math.floor(gs.elapsedTime / 1000)
          gs.speedRunTimeLeft = Math.max(0, getSpeedRunDuration() - elapsed)
          if (gs.speedRunTimeLeft <= 0) {
            // Time's up — trigger game over
            gs.gameOver = true
            // Save speed run result
            const result: SpeedRunResult = {
              score: gs.score,
              wordsEaten: gs.wordsEaten,
              maxCombo: gs.speedRunMaxCombo,
              powerUpsCollected: gs.speedRunPowerUpsCollected,
              longestSnake: gs.speedRunLongestSnake,
              difficulty: gs.difficulty,
              date: new Date().toISOString(),
              survived: true,
            }
            const best = saveSpeedRunResult(result)
            setSpeedRunBest({ bestScore: best.bestScore, totalRuns: best.totalRuns })
            playSound(playGameOverSound)
            trackGameEnd(gs.score, gs.wordsEaten, gs.difficulty, gs.elapsedTime, false)
            // Record for dynamic difficulty adjustment
            recordGamePerformance(gs.score, gs.wordsEaten, gs.elapsedTime, gs.difficulty)
            // Update dynamic difficulty level display
            setDynDiff(getDifficultyAdjustment())
          }
        }
        updateUI()
      }
    }
    timerIntervalRef.current = setInterval(tick, 200)
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [updateUI, playSound])

  // Game loop
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      const gs = gameStateRef.current

      // Compute deltaTime for visualizer
      const dt = lastFrameTimeRef.current > 0
        ? Math.min((timestamp - lastFrameTimeRef.current) / 1000, 0.1)
        : 0.016
      lastFrameTimeRef.current = timestamp

      // Decay visualizer pulse and update bars
      if (isVisualizerActive()) {
        decayVisualizerPulse(dt)
        visualizerBarsRef.current = updateVisualizer(dt)
      }

      if (!gs.gameStarted || gs.gameOver || gs.paused || gs.activeQuiz || gs.activeScramble) {
        // Check scramble expiry even while paused
        if (gs.activeScramble && isScrambleExpired(gs.activeScramble, Date.now())) {
          getScrambleResult(gs.activeScramble, false)
          spawnFloatingText('⏰ Time up!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#ef4444')
          gs.activeScramble = null
          activeScrambleRef.current = null
          updateUI()
        }
        draw()
        animFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }

      // Expire active power-ups
      const now = Date.now()
      const expiredBefore = gs.activePowerUps.length
      gs.activePowerUps = gs.activePowerUps.filter(pu => pu.expiresAt === 0 || pu.expiresAt > now)
      // Round 39: Event bus — power-up expired
      if (gs.activePowerUps.length < expiredBefore) {
        wireOnPowerUpExpire('expired')
      }

      // Expire easter egg effects
      expireEasterEggEffects()

      // Expire uncollected power-up on the grid after 15 seconds
      if (gs.powerUp && (now - gs.powerUp.spawnTime) > POWERUP_DESPAWN_TIME) {
        gs.powerUp = null
      }

      // Speed modifiers: Round 39 timing controller integration
      // Combines speedConfig + game mode frame interval + weather + power-ups + difficulty
      let effectiveSpeed = gs.speed
      const weatherConf = WEATHER_CONFIG[gs.weather]
      if (weatherConf.speedMultiplier > 1) {
        effectiveSpeed = Math.floor(effectiveSpeed * weatherConf.speedMultiplier)
      }
      if (gs.activePowerUps.some(pu => pu.type === 'slow_mo')) {
        effectiveSpeed = Math.floor(effectiveSpeed * 1.6) // 60% slower = speed value 1.6x higher
      }
      // Easter egg slow_mo effect (Time Lord)
      if (hasActiveEffect('slow_mo')) {
        effectiveSpeed = Math.floor(effectiveSpeed * 1.6)
      }
      // Easter egg speed_boost effect
      if (hasActiveEffect('speed_boost')) {
        effectiveSpeed = Math.floor(effectiveSpeed * 0.75) // 25% faster
      }
      // In-game progressive difficulty: divide by speed multiplier to make game faster
      if (gs.inGameDifficulty) {
        effectiveSpeed = Math.floor(effectiveSpeed / gs.inGameDifficulty.speedMultiplier)
      }
      // Round 40: Apply power-up effect wire modifiers to speed
      const effectSpeed = wiringHubRef.current.applyPowerUpEffectsToSpeed(effectiveSpeed, powerUpEffectWireRef.current)
      // Round 39: Apply speed config slider + mode engine frame interval modifier
      const tc = timingControllerRef.current
      tc.updateTiming(speedConfig, modeEngineRef.current)
      const timingMod = tc.shouldTick(effectSpeed)
      // Also track metrics for the timing display
      const timingMetrics = tc.getMetrics()

      // Round 41: Mode timer wire — tick timed mode countdown
      if (shouldModeTick(modeEngineRef.current)) {
        const modeTimerResult = modeTimerWireRef.current.tick(200) // tick interval matches timerIntervalRef
        setModeTimerDisplay(modeTimerResult.display)
        // SFX timer warning
        if (modeTimerResult.display.warningLevel === 'critical') {
          sfxCompletionWireRef.current.onTimerWarning(modeTimerResult.display.remaining)
        } else if (modeTimerResult.display.warningLevel === 'warning' && Math.floor(modeTimerResult.display.remaining) === 10) {
          sfxCompletionWireRef.current.onTimerWarning(modeTimerResult.display.remaining)
        }
        if (modeTimerResult.expired) {
          // Time's up — end game with bonus
          const completionResult = modeTimerWireRef.current.getCompletionResult(gs.score)
          if (completionResult) {
            gs.score += completionResult.timeBonus
            spawnFloatingText(`⏰ +${completionResult.timeBonus} Time Bonus!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40, '#fbbf24')
          }
          handleDeath()
          draw()
          animFrameRef.current = requestAnimationFrame(gameLoop)
          return
        }
      }

      if (!timingMod) {
        draw()
        animFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }

      lastRenderRef.current = timestamp

      // ===== PvP GAME LOOP =====
      const pvp = pvpRef.current
      if (pvp) {
        // Expire P2 power-ups
        const pvpNow = Date.now()
        pvp.player2ActivePowerUps = pvp.player2ActivePowerUps.filter(pu => pu.expiresAt === 0 || pu.expiresAt > pvpNow)

        // Process P1 direction
        if (directionQueueRef.current.length > 0) {
          const newDir = directionQueueRef.current.shift()!
          const opp: Record<Direction, Direction> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }
          if (opp[newDir] !== gs.direction) gs.direction = newDir
        }

        // Process P2 direction
        if (p2DirectionQueueRef.current.length > 0 && pvp.player2Alive) {
          const p2Dir = p2DirectionQueueRef.current.shift()!
          const opp2: Record<Direction, Direction> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }
          if (opp2[p2Dir] !== pvp.player2Direction) pvp.player2Direction = p2Dir
        }

        // Compute new head positions
        const p1Head = { ...gs.snake[0] }
        switch (gs.direction) {
          case 'UP': p1Head.y -= 1; break
          case 'DOWN': p1Head.y += 1; break
          case 'LEFT': p1Head.x -= 1; break
          case 'RIGHT': p1Head.x += 1; break
        }

        const p2Head = { ...pvp.player2Snake[0] }
        if (pvp.player2Alive) {
          switch (pvp.player2Direction) {
            case 'UP': p2Head.y -= 1; break
            case 'DOWN': p2Head.y += 1; break
            case 'LEFT': p2Head.x -= 1; break
            case 'RIGHT': p2Head.x += 1; break
          }
        }

        let p1Died = false
        let p2Died = false

        // P1 wall collision
        if (p1Head.x < 0 || p1Head.x >= GRID_WIDTH || p1Head.y < 0 || p1Head.y >= GRID_HEIGHT) {
          const hasShield = gs.activePowerUps.some(pu => pu.type === 'shield')
          if (hasShield) {
            gs.activePowerUps = gs.activePowerUps.filter(pu => pu.type !== 'shield')
            if (p1Head.x < 0) p1Head.x = GRID_WIDTH - 1
            else if (p1Head.x >= GRID_WIDTH) p1Head.x = 0
            else if (p1Head.y < 0) p1Head.y = GRID_HEIGHT - 1
            else if (p1Head.y >= GRID_HEIGHT) p1Head.y = 0
            spawnFloatingText('🛡️', p1Head.x * CELL_SIZE + CELL_SIZE / 2, p1Head.y * CELL_SIZE - 10, '#60a5fa')
          } else {
            p1Died = true
          }
        }

        // P2 wall collision
        if (pvp.player2Alive && !p2Died) {
          if (p2Head.x < 0 || p2Head.x >= GRID_WIDTH || p2Head.y < 0 || p2Head.y >= GRID_HEIGHT) {
            const hasP2Shield = pvp.player2ActivePowerUps.some(pu => pu.type === 'shield')
            if (hasP2Shield) {
              pvp.player2ActivePowerUps = pvp.player2ActivePowerUps.filter(pu => pu.type !== 'shield')
              if (p2Head.x < 0) p2Head.x = GRID_WIDTH - 1
              else if (p2Head.x >= GRID_WIDTH) p2Head.x = 0
              else if (p2Head.y < 0) p2Head.y = GRID_HEIGHT - 1
              else if (p2Head.y >= GRID_HEIGHT) p2Head.y = 0
              spawnFloatingText('🛡️', p2Head.x * CELL_SIZE + CELL_SIZE / 2, p2Head.y * CELL_SIZE - 10, '#60a5fa')
            } else {
              p2Died = true
            }
          }
        }

        // P1 self collision
        if (!p1Died && gs.snake.some((s) => s.x === p1Head.x && s.y === p1Head.y)) {
          p1Died = true
        }

        // P2 self collision
        if (pvp.player2Alive && !p2Died && pvp.player2Snake.some((s) => s.x === p2Head.x && s.y === p2Head.y)) {
          p2Died = true
        }

        // Tentatively update snakes for cross-collision checks
        if (!p1Died) gs.snake = [p1Head, ...gs.snake]
        if (pvp.player2Alive && !p2Died) pvp.player2Snake = [p2Head, ...pvp.player2Snake]

        // Cross collision: P1 head on P2 body (exclude P2 head at index 0)
        if (!p1Died && !p2Died) {
          const p1OnP2Body = pvp.player2Snake.some((s, i) => i > 0 && s.x === p1Head.x && s.y === p1Head.y)
          if (p1OnP2Body) p1Died = true

          const p2OnP1Body = gs.snake.some((s, i) => i > 0 && s.x === p2Head.x && s.y === p2Head.y)
          if (p2OnP1Body) p2Died = true

          // Head-to-head
          if (p1Head.x === p2Head.x && p1Head.y === p2Head.y) {
            p1Died = true
            p2Died = true
          }
        }

        // Handle deaths
        if (p1Died || p2Died) {
          gs.gameOver = true
          if (p1Died && p2Died) pvp.winner = 'tie'
          else if (p1Died) pvp.winner = 'player2'
          else pvp.winner = 'player1'

          // Spawn death particles
          if (p1Died) {
            const hx = gs.snake[0].x * CELL_SIZE + CELL_SIZE / 2
            const hy = gs.snake[0].y * CELL_SIZE + CELL_SIZE / 2
            spawnParticles(hx, hy, '#ef4444', 20)
            emitPresetParticles(hx, hy, 'death')
          }
          if (p2Died) {
            const hx = pvp.player2Snake[0].x * CELL_SIZE + CELL_SIZE / 2
            const hy = pvp.player2Snake[0].y * CELL_SIZE + CELL_SIZE / 2
            spawnParticles(hx, hy, '#06b6d4', 20)
            emitPresetParticles(hx, hy, 'death')
          }
          emitEvent('pvp', `PvP ${pvp.winner === 'tie' ? 'Tie!' : `${pvp.winner === 'player1' ? 'P1' : 'P2'} wins!`}`, '⚔️', '#fb923c')
          playSound(playGameOverSound)
          updateUI()
          draw()
          animFrameRef.current = requestAnimationFrame(gameLoop)
          return
        }

        // --- Food eating ---
        let whoAte: 'p1' | 'p2' | null = null
        const { snake, direction, wordFood } = gs

        if (wordFood) {
          const fx = wordFood.position.x
          const fy = wordFood.position.y

          // Check proximity helper
          const isNear = (hx: number, hy: number) =>
            (hx === fx && hy === fy) ||
            (hx === fx + 1 && hy === fy) ||
            (hx === fx - 1 && hy === fy) ||
            (hx === fx && hy === fy + 1) ||
            (hx === fx && hy === fy - 1)

          // P1 eats food?
          if (isNear(p1Head.x, p1Head.y)) {
            const entry = getWordEntryIncludingCustom(wordFood.word)
            let points = entry ? entry.points : wordFood.word.length * 10
            const rarityConfig = RARITY_CONFIG[wordFood.rarity]
            if (rarityConfig && rarityConfig.pointMultiplier > 1) {
              points += Math.floor(points * (rarityConfig.pointMultiplier - 1))
            }
            if (gs.activePowerUps.some(pu => pu.type === 'double_points')) points *= 2
            const catColor = CATEGORY_COLORS[wordFood.category] ?? '#f59e0b'
            addWord(wordFood.word)
            collectedWordsRef.current.add(wordFood.word)
            // Update multilingual progress if active
            if (activeMultilingualPack) {
              multilingualProgressRef.current[activeMultilingualPack] = getMultilingualPackProgress(activeMultilingualPack, collectedWordsRef.current)
            }
            // Apply mode score multiplier (Round 37)
            const modeMult = getModeScoreMultiplier(modeEngineRef.current)
            points = Math.floor(points * modeMult)
            // Round 40: Apply power-up effect wire score modifier
            points = wiringHubRef.current.applyPowerUpEffectsToScore(points, powerUpEffectWireRef.current)
            gs.score += points
            gs.wordsEaten += 1
            whoAte = 'p1'
            const wx = wordFood.position.x * CELL_SIZE + CELL_SIZE / 2
            const wy = wordFood.position.y * CELL_SIZE
            spawnFloatingText(`+${points}`, wx, wy, '#4ade80')
            spawnFloatingText(wordFood.word, wx, wy - 22, catColor)
            spawnParticles(wx, wy + CELL_SIZE / 2, catColor, 10)
            playSound(playEatSound)
            // Round 41: SFX — word eat (context-aware by combo)
            sfxCompletionWireRef.current.onWordEat(gs.comboCount || 0)
            // Round 42: Word mastery live tracking
            const masteryNotif = masteryTrackerRef.current.recordWordEncounter(wordFood.word, wordFood.category || 'general', gs.difficulty || 'medium')
            if (masteryNotif) {
              spawnFloatingText(`${masteryNotif.emoji} ${wordFood.word} → ${masteryNotif.newLevel}!`, wx, wy - 40, masteryNotif.color)
              // Round 43: Notification completion wire — mastery level up
              notifCompletionRef.current.notifyMasteryLevelUp(wordFood.word, masteryNotif.oldLevel, masteryNotif.newLevel, masteryNotif.emoji)
            }
            // Round 42: Real-time dashboard — word eat event
            realtimeDashboardRef.current.pushWordEatEvent(wordFood.word, wordFood.category || 'general', points)
            // Round 45: XP progression — log XP on word eat
            try { logXPEvent('wordEat', points) } catch { /* no-op */ }
            // Round 43b: Mastery panel wire — refresh on word eat
            const masteryPanelNotif = masteryPanelWireRef.current.onWordEaten(wordFood.word, wordFood.category || 'general', gs.difficulty || 'medium')
            // Round 42: Word bomb detonation on word eat
            if (wordBombWireRef.current.shouldDetonateOnEat()) {
              const bombResult = wordBombWireRef.current.detonateBomb(wordFood.position.x, wordFood.position.y, GRID_WIDTH, GRID_HEIGHT)
              const classified = classifyDetonation(bombResult, gs.obstacles, [], [])
              gs.score += classified.scoreBonus
              // Clear obstacles in affected area
              gs.obstacles = gs.obstacles.filter(obs => !bombResult.affectedCells.some(c => c.x === obs.x && c.y === obs.y))
              wordBombWireRef.current.consumeBomb()
              // Visual: trigger bomb explosion on canvas
              triggerBombExplosion(powerUpVisualsRef.current, wordFood.position.x, wordFood.position.y, bombResult.affectedCells)
              spawnFloatingText(`💣 +${classified.scoreBonus}`, wx, wy - 55, '#f97316')
              if (classified.obstaclesCleared > 0) {
                spawnFloatingText(`💥 ${classified.obstaclesCleared} obstacles cleared!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#ef4444')
              }
            }
            // Round 37: Score Live Wire
            recordWordEaten(scoreLiveWireRef.current, {
              word: wordFood.word,
              basePoints: entry ? entry.points : wordFood.word.length * 10,
              combo: gs.comboCount || 0,
              activePowerUps: gs.activePowerUps.map(p => p.type),
              difficulty: gs.difficulty || 'medium',
              rarity: wordFood.rarity || 'common',
              category: wordFood.category || 'general',
              timeElapsed: gs.elapsedTime || 0,
            })
            // Round 37: XP Scoring Wire
            const isNewWord = !collectedWordsRef.current.has(wordFood.word)
            const xpResult = awardXP(xpWireRef.current, isNewWord ? 'newWordCollected' : 'wordEat', {
              word: wordFood.word,
              points,
              combo: gs.comboCount || 0,
              difficulty: gs.difficulty || 'medium',
            })
            if (xpResult.levelUp) {
              setXPProgress(getXPProgress(xpWireRef.current))
              onLevelUp(notifEventWireRef.current, xpResult.newLevel || calculateLevel(loadProfile().xp).level)
              // Round 41: SFX — level up
              sfxCompletionWireRef.current.onLevelUp(xpResult.newLevel || calculateLevel(loadProfile().xp).level)
            }
            if (isNewWord) {
              onNewWordDiscovered(notifEventWireRef.current, wordFood.word)
            }
            // Round 37: Combo notification
            if (gs.comboCount > 1 && gs.comboCount % 5 === 0) {
              onComboMilestone(notifEventWireRef.current, gs.comboCount)
              recordComboEvent(scoreLiveWireRef.current, gs.comboCount)
              // Round 41: SFX — combo milestone
              sfxCompletionWireRef.current.onComboMilestone(gs.comboCount)
              // Round 42: Real-time dashboard — combo event
              realtimeDashboardRef.current.pushComboEvent(gs.comboCount)
            }
            // Round 39: Event bus — word eat + score change + snake grow
            eventBusWireRef.current.onWordEat(wordFood.word, points, gs.comboCount || 0, { mode: gs.isDailyChallenge ? 'daily' : 'classic' })
            eventBusWireRef.current.onScoreChange(gs.score - points, gs.score, 'word_eat')
            eventBusWireRef.current.onSnakeGrow(gs.snake.length)
            // Round 40: Event log — word eat
            eventLogPanelRef.current.addEntries(createWordEatEntries(wordFood.word, points, gs.comboCount || 0))
            if (gs.comboCount > 2 && gs.comboCount % 3 === 0) {
              eventLogPanelRef.current.addEntries(createComboEntries(gs.comboCount))
            }
          } else if (isNear(p2Head.x, p2Head.y)) {
            // P2 eats food?
            const entry = getWordEntryIncludingCustom(wordFood.word)
            let points = entry ? entry.points : wordFood.word.length * 10
            const rarityConfig = RARITY_CONFIG[wordFood.rarity]
            if (rarityConfig && rarityConfig.pointMultiplier > 1) {
              points += Math.floor(points * (rarityConfig.pointMultiplier - 1))
            }
            if (pvp.player2ActivePowerUps.some(pu => pu.type === 'double_points')) points *= 2
            pvp.player2Score += points
            pvp.player2WordsEaten.push(wordFood.word)
            addWord(wordFood.word)
            whoAte = 'p2'
            const wx = wordFood.position.x * CELL_SIZE + CELL_SIZE / 2
            const wy = wordFood.position.y * CELL_SIZE
            const catColor = CATEGORY_COLORS[wordFood.category] ?? '#f59e0b'
            spawnFloatingText(`P2 +${points}`, wx, wy, '#06b6d4')
            spawnFloatingText(wordFood.word, wx, wy - 22, '#22d3ee')
            spawnParticles(wx, wy + CELL_SIZE / 2, '#06b6d4', 10)
            playSound(playEatSound)
            // Round 40: Wire P2 score live wire
            wiringHubRef.current.wireP2ScoreLive({
              word: wordFood.word,
              basePoints: entry ? entry.points : wordFood.word.length * 10,
              combo: 0,
              activePowerUps: pvp.player2ActivePowerUps.map(p => p.type),
              difficulty: gs.difficulty || 'medium',
              rarity: wordFood.rarity || 'common',
              category: wordFood.category || 'general',
              timeElapsed: gs.elapsedTime || 0,
            }, scoreLiveWireRef.current)
          }

          // Remove tail for non-eaters; eater keeps tail (grows)
          if (whoAte === 'p1') {
            pvp.player2Snake.pop()
          } else if (whoAte === 'p2') {
            gs.snake.pop()
          } else {
            gs.snake.pop()
            pvp.player2Snake.pop()
          }
          gs.wordFood = null
          // Spawn new word (food was eaten)
          spawnWord()
        } else {
          gs.snake.pop()
          pvp.player2Snake.pop()
        }

        // Chance to spawn power-up after food eaten
        if (whoAte && !gs.powerUp) {
          if (Math.random() < POWERUP_SPAWN_CHANCE) {
            const puType = getRandomPowerUpType()
            const occupied = new Set([
              ...gs.snake.map(s => `${s.x},${s.y}`),
              ...pvp.player2Snake.map(s => `${s.x},${s.y}`),
            ])
            let puPos: Position
            let attempts = 0
            do {
              puPos = {
                x: Math.floor(Math.random() * (GRID_WIDTH - 6)) + 3,
                y: Math.floor(Math.random() * (GRID_HEIGHT - 6)) + 3,
              }
              attempts++
            } while (occupied.has(`${puPos.x},${puPos.y}`) && attempts < 50)
            gs.powerUp = { type: puType, position: puPos, spawnTime: Date.now() }
          }
        }

        // Power-up collection for P1
        if (gs.powerUp && !p1Died) {
          const pu = gs.powerUp
          if (p1Head.x === pu.position.x && p1Head.y === pu.position.y) {
            const config = POWERUP_CONFIG[pu.type]
            if (pu.type === 'shrink') {
              const removeCount = Math.min(3, gs.snake.length - 1)
              gs.snake = gs.snake.slice(0, gs.snake.length - removeCount)
            } else {
              gs.activePowerUps.push({ type: pu.type, expiresAt: config.duration > 0 ? Date.now() + config.duration * 1000 : 0 })
            }
            const px = pu.position.x * CELL_SIZE + CELL_SIZE / 2
            const py = pu.position.y * CELL_SIZE + CELL_SIZE / 2
            spawnFloatingText(config.emoji, px, py - 10, config.color)
            spawnParticles(px, py, config.color, 12)
            playSound(playPowerUpSound)
            // Round 39: Event bus + power-up effect wire
            wireOnPowerUpCollect(pu.type, config.emoji)
            powerUpEffectWireRef.current.onPowerUpCollected(pu.type, gs)
            // Round 41: SFX — power-up collect (context-aware by type)
            sfxCompletionWireRef.current.onPowerUpCollect(pu.type)
            // Round 42: Word bomb — arm bomb on collect if word_bomb type
            if (pu.type === 'word_bomb') {
              wordBombWireRef.current.armBomb()
              spawnFloatingText('💣 Armed!', px, py - 25, '#f97316')
            }
            // Round 42: Ghost mode — notify ghost collision wire
            const puEffect = powerUpEffectWireRef.current.applyEffects({} as any, 0.016)
            if (puEffect.ghostMode) {
              ghostCollisionWireRef.current.onGhostActivated()
            }
            // Round 42: Real-time dashboard — power-up event
            realtimeDashboardRef.current.pushPowerUpEvent(pu.type)
            // Round 40: Event log — power-up collected
            eventLogPanelRef.current.addEntries(createPowerUpEntries(pu.type, config.emoji))
            gs.powerUp = null
          }
        }

        // Power-up collection for P2
        if (gs.powerUp && pvp.player2Alive && !p2Died) {
          const pu = gs.powerUp
          if (p2Head.x === pu.position.x && p2Head.y === pu.position.y) {
            const config = POWERUP_CONFIG[pu.type]
            if (pu.type === 'shrink') {
              const removeCount = Math.min(3, pvp.player2Snake.length - 1)
              pvp.player2Snake = pvp.player2Snake.slice(0, pvp.player2Snake.length - removeCount)
            } else {
              pvp.player2ActivePowerUps.push({ type: pu.type, expiresAt: config.duration > 0 ? Date.now() + config.duration * 1000 : 0 })
            }
            const px = pu.position.x * CELL_SIZE + CELL_SIZE / 2
            const py = pu.position.y * CELL_SIZE + CELL_SIZE / 2
            spawnFloatingText(`P2 ${config.emoji}`, px, py - 10, config.color)
            spawnParticles(px, py, '#06b6d4', 12)
            playSound(playPowerUpSound)
            gs.powerUp = null
          }
        }

        // Magnet effect — attract food toward the collecting player's head
        if (gs.wordFood) {
          if (gs.activePowerUps.some(pu => pu.type === 'magnet')) {
            const headPos = gs.snake[0]
            const foodPos = gs.wordFood.position
            if (Math.abs(headPos.x - foodPos.x) > 0) foodPos.x += Math.sign(headPos.x - foodPos.x)
            if (Math.abs(headPos.y - foodPos.y) > 0) foodPos.y += Math.sign(headPos.y - foodPos.y)
          } else if (pvp.player2ActivePowerUps.some(pu => pu.type === 'magnet')) {
            const headPos = pvp.player2Snake[0]
            const foodPos = gs.wordFood.position
            if (Math.abs(headPos.x - foodPos.x) > 0) foodPos.x += Math.sign(headPos.x - foodPos.x)
            if (Math.abs(headPos.y - foodPos.y) > 0) foodPos.y += Math.sign(headPos.y - foodPos.y)
          }
        }

        // Speed up over time (shared)
        const settings = DIFFICULTY_SETTINGS[gs.difficulty]
        gs.speed = Math.max(settings.minSpeed, gs.speed - 0.02)

        updateUI()
        draw()
        animFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }
      // ===== END PvP GAME LOOP =====

      if (directionQueueRef.current.length > 0) {
        const newDir = directionQueueRef.current.shift()!
        const opposites: Record<Direction, Direction> = {
          UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT',
        }
        if (opposites[newDir] !== gs.direction) {
          gs.direction = newDir
        }
      }

      const { snake, direction, wordFood } = gs
      const head = { ...snake[0] }
      switch (direction) {
        case 'UP': head.y -= 1; break
        case 'DOWN': head.y += 1; break
        case 'LEFT': head.x -= 1; break
        case 'RIGHT': head.x += 1; break
      }

      // ===== AI BOT MOVEMENT =====
      const aiBot = aiBotRef.current
      if (aiBot && aiBot.alive && gs.gameStarted && !gs.gameOver) {
        // Build obstacles set from player snake + bot snake
        const obstacles = new Set<string>()
        for (const seg of gs.snake) obstacles.add(`${seg.x},${seg.y}`)
        for (const seg of aiBot.snake) obstacles.add(`${seg.x},${seg.y}`)

        // Calculate AI bot direction
        const botDir = calculateAiBotMove(
          aiBot,
          gs.wordFood?.position ?? null,
          gs.snake,
          obstacles,
        )

        // Update AI bot position
        const botResult = updateAiBot(
          aiBot,
          botDir,
          gs.wordFood?.position ?? null,
          gs.wordFood?.word,
        )

        // Check AI bot collision (wall, self, player body)
        const botAlive = checkAiBotCollision(aiBot, gs.snake)

        if (!botAlive) {
          // Bot died — show floating text and particles
          const bhx = aiBot.snake[0].x * CELL_SIZE + CELL_SIZE / 2
          const bhy = aiBot.snake[0].y * CELL_SIZE + CELL_SIZE / 2
          spawnParticles(bhx, bhy, '#f97316', 20)
          spawnFloatingText('🤖 Bot Down!', bhx, bhy - 20, '#f97316')
          // Round 43: Notification — bot defeated
          bossDefeatsRef.current += 1
          notifCompletionRef.current.notifyBossDefeated('AI Bot', Math.min(bossDefeatsRef.current, 6))
          sfxCompletionWireRef.current.onCollision('bot')
        } else if (botResult.ateFood) {
          // Bot ate the food — clear it so player can't eat it too
          const bwx = aiBot.snake[0].x * CELL_SIZE + CELL_SIZE / 2
          const bwy = aiBot.snake[0].y * CELL_SIZE
          spawnFloatingText('🤖 +10', bwx, bwy, '#f97316')
          if (botResult.word) {
            spawnFloatingText(botResult.word, bwx, bwy - 22, '#fdba74')
            addWord(botResult.word)
            collectedWordsRef.current.add(botResult.word)
          }
          spawnParticles(bwx, bwy + CELL_SIZE / 2, '#f97316', 10)
          gs.wordFood = null
          spawnWord()
        }
      }
      // ===== END AI BOT MOVEMENT =====

      const handleDeath = () => {
        gs.gameOver = true
        // Round 41: Reset mode timer wire on death
        modeTimerWireRef.current.reset()
        setModeTimerDisplay({ remaining: 0, formatted: '00:00', progress: 0, warningLevel: 'none', isActive: false, isPaused: false, timeLimit: null })
        // Stop replay recording and save
        if (isRecording()) {
          try {
            const savedReplay = stopRecording({
              difficulty: gs.difficulty,
              isDailyChallenge: gs.isDailyChallenge,
              weather: gs.weather,
              wordPack: activeWordPack !== 'default' ? activeWordPack : 'classic',
            })
            if (savedReplay) {
              toast({ title: 'Replay Saved', description: `Game recorded (${formatDuration(savedReplay.duration)})`, variant: 'default' })
            }
          } catch { /* ignore */ }
        }
        const stored = typeof window !== 'undefined' ? parseInt(localStorage.getItem('word-snake-highscore') ?? '0', 10) : 0
        if (gs.score > stored) {
          localStorage.setItem('word-snake-highscore', String(gs.score))
        }

        // Save to leaderboard
        const rank = addLeaderboardEntry({
          score: gs.score,
          wordsEaten: gs.wordsEaten,
          difficulty: gs.difficulty,
          date: new Date().toISOString(),
          isDailyChallenge: gs.isDailyChallenge,
        })
        setLeaderboardRank(rank)

        // Update high score to difficulty-specific best
        const diffBest = getBestScore(gs.difficulty)
        setHighScore(Math.max(diffBest, gs.score))
        const hx = snake[0].x * CELL_SIZE + CELL_SIZE / 2
        const hy = snake[0].y * CELL_SIZE + CELL_SIZE / 2
        spawnParticles(hx, hy, '#ef4444', 20)
        emitPresetParticles(hx, hy, 'death')
        emitEvent('death', `Game Over! Score: ${gs.score}, Words: ${gs.wordsEaten}`, '💀', '#ef4444')
        // Round 42: Real-time dashboard — game end + mastery session save
        realtimeDashboardRef.current.pushGameEndEvent(gs.score, gs.elapsedTime, gs.wordsEaten)
        masteryTrackerRef.current.saveSessionData()
        // Round 43b: Mastery panel wire — game end
        masteryPanelWireRef.current.onGameEnd()
        // Round 45: XP progression — log game complete XP
        try { logXPEvent('gameComplete', gs.score) } catch { /* no-op */ }
        // Round 45: Battle pass — add season XP on game end
        try { addSeasonXP(Math.floor(gs.score / 10), 'gameplay' as any) } catch { /* no-op */ }
        // Round 45: Daily login bonus check
        try { checkDailyLoginBonus() } catch { /* no-op */ }
        playSound(playGameOverSound)

        // Save daily challenge result if applicable
        if (gs.isDailyChallenge) {
          const completed = gs.score >= gs.dailyTargetScore
          saveDailyChallengeResult(completed, gs.score)
          setDailyInfo((prev) => ({
            ...prev,
            played: true,
            result: { completed, score: gs.score },
          }))
          // Round 43: Notification — daily challenge completion
          const stars = completed ? (gs.score >= gs.dailyTargetScore * 1.5 ? 3 : gs.score >= gs.dailyTargetScore * 1.2 ? 2 : 1) : 0
          notifCompletionRef.current.notifyDailyChallengeComplete(gs.score, gs.dailyTargetScore, stars)
        }

        // Track game end stats
        trackGameEnd(gs.score, gs.wordsEaten, gs.difficulty, gs.elapsedTime, gs.isDailyChallenge)
        // Record for dynamic difficulty
        recordGamePerformance(gs.score, gs.wordsEaten, gs.elapsedTime, gs.difficulty)
        setDynDiff(getDifficultyAdjustment())

        // Round 39: Event bus — game end
        eventBusWireRef.current.onGameEnd({ score: gs.score, wordsEaten: gs.wordsEaten, time: gs.elapsedTime, mode: gs.isDailyChallenge ? 'daily' : 'classic', difficulty: gs.difficulty })
        if (gs.isDailyChallenge) eventBusWireRef.current.onDailyChallengeEnd({ completed: gs.score >= gs.dailyTargetScore, score: gs.score })
        // Round 40: Event log — game end + death
        eventLogPanelRef.current.addEntries(createDeathEntries(gs.score, gs.wordsEaten))
        setEventLogEntries(eventLogPanelRef.current.getRecentEntries(20))

        // Round 37: Game end wires
        const gameEndXP = awardXP(xpWireRef.current, 'gameComplete', { score: gs.score, wordsEaten: gs.wordsEaten, timeElapsed: gs.elapsedTime })
        if (gameEndXP.levelUp) {
          setXPProgress(getXPProgress(xpWireRef.current))
        }
        updateTimeEfficiency(scoreLiveWireRef.current, gs.elapsedTime)
        onGameComplete(notifEventWireRef.current, gs.score, Math.floor(gs.elapsedTime / 1000))
        recordModeSession(modeEngineRef.current, gs.score, gs.elapsedTime)
        setModeDisplayInfo(getModeDisplayInfo(modeEngineRef.current))

        // Round 38: Daily challenge sync + Battle Pass XP
        if (gs.isDailyChallenge) {
          syncDailyChallengeResult(gs.score, gs.wordsEaten, gs.elapsedTime, !gs.gameOver || gs.isDailyChallenge)
          onDailyChallengeComplete(notifEventWireRef.current, gs.score)
        }
        const bpResult = addBattlePassXP(battlePassRef.current, gameEndXP.xpAwarded)
        if (bpResult.tierUp) {
          setBattlePassSummary(getPassSummary(battlePassRef.current))
          // Round 43: Notification — battle pass tier up + reward granting
          notifCompletionRef.current.notifyBattlePassTierUp(bpResult.oldTier || 0, bpResult.newTier || 1, `Tier ${bpResult.newTier}`)
          // Grant reward via battle pass reward grantor
          const tierRewards = generateTierRewards()
          const tierReward = tierRewards.find(r => r.tier === bpResult.newTier && !bpRewardGrantorRef.current.isRewardGranted(`${bpResult.newTier}-free`))
          const tierPremiumReward = tierRewards.find(r => r.tier === bpResult.newTier && !bpRewardGrantorRef.current.isRewardGranted(`${bpResult.newTier}-premium`))
          if (tierReward) {
            bpRewardGrantorRef.current.grantReward(tierReward)
          }
        }

        // Check achievements
        try {
          const wordList = Object.entries(useWordStore.getState().collectedWords)
          const categories = [...new Set(wordList.map(([w]) => { const e = getWordEntry(w); return e?.category }).filter(Boolean))] as string[]
          const stats: AchievementStats = {
            totalWordsCollected: wordList.reduce((s, [, c]) => s + c, 0),
            totalWordsEaten: gs.wordsEaten,
            poemsCreated: 0,
            highScore: Math.max(gs.score, stored),
            categories,
            gamesPlayed: parseInt(localStorage.getItem('word-snake-games') ?? '0', 10),
          }
          const newlyUnlocked = checkAchievements(stats)
          if (newlyUnlocked.length > 0) {
            const notifications = newlyUnlocked.map(a => ({ title: a.title, description: a.description, emoji: a.emoji }))
            enqueueAchievements(notifications)
            // Round 37: Notification wire for achievements
            for (const a of newlyUnlocked) {
              onAchievementUnlocked(notifEventWireRef.current, a.title, a.description, a.emoji)
              awardXP(xpWireRef.current, 'achievementUnlocked', { achievementTitle: a.title })
            }
            // Check if any newly unlocked achievement unlocks a skin
            const skinMap = getSkinUnlockMap()
            for (const a of newlyUnlocked) {
              const skinUnlock = skinMap[a.id]
              if (skinUnlock && isSkinUnlocked(skinUnlock.skinId)) {
                enqueueAchievements([{ title: `New Skin Unlocked: ${skinUnlock.skinName}!`, description: `Select it in Settings`, emoji: skinUnlock.skinEmoji }])
              }
            }
          }
          // Check multilingual achievements
          const allCollected = new Set(wordList.map(([w]) => w))
          const multiCollection = getTotalMultilingualCollection(allCollected)
          const multiStats: MultilingualAchievementStats = createMultilingualStats(stats, {
            ko: multiCollection.korean,
            fr: multiCollection.french,
            es: multiCollection.spanish,
            languagesUsed: [multiCollection.korean > 0, multiCollection.french > 0, multiCollection.spanish > 0].filter(Boolean).length,
            packsUnlocked: getUnlockedMultilingualPackIds().length,
            totalMultilingual: multiCollection.total,
          })
          const newMultiAch = checkMultiAchievements(multiStats)
          if (newMultiAch.length > 0) {
            const multiNotifs = newMultiAch.map(a => ({ title: a.title, description: a.description, emoji: a.emoji }))
            enqueueAchievements(multiNotifs)
            setMultilingualAchievementsUnlocked(prev => {
              const updated = [...new Set([...prev, ...newMultiAch.map(a => a.id)])]
              if (typeof window !== 'undefined') {
                try { localStorage.setItem('wordsnake_multilingual_achievements', JSON.stringify(updated)) } catch { /* ignore */ }
              }
              return updated
            })
          }
          // Save game session for stats comparison
          if (typeof window !== 'undefined') {
            const session: GameSession = {
              id: `session-${Date.now()}`,
              timestamp: Date.now(),
              score: gs.score,
              wordsEaten: gs.wordsEaten,
              duration: uiState.elapsedTime,
              difficulty: gs.difficulty,
              wordsPerMinute: uiState.elapsedTime > 0 ? Math.round((gs.wordsEaten / uiState.elapsedTime) * 60) : 0,
              longestCombo: gs.maxCombo || 0,
              bossDefeated: gs.bossDefeatedCount || 0,
              quizzesCorrect: gs.quizCorrectCount || 0,
            }
            saveSession(session)
            const allSessions = getSessions()
            if (allSessions.length >= 2) {
              setComparisonSummary(compareSessions(allSessions[0], allSessions.slice(1)))
            }
          }
          // Also check milestones on game over
          const newlyUnlockedMilestones = checkMilestones()
          if (newlyUnlockedMilestones.length > 0) {
            for (const ms of newlyUnlockedMilestones) {
              gs.lastMilestone = { name: ms.name, emoji: ms.emoji, description: ms.description }
              if (milestoneToastTimerRef.current) clearTimeout(milestoneToastTimerRef.current)
              milestoneToastTimerRef.current = setTimeout(() => {
                gameStateRef.current.lastMilestone = null
                updateUI()
              }, 5000)
            }
            // Check if any milestone unlocks a skin
            const skinMap = getSkinUnlockMap()
            for (const ms of newlyUnlockedMilestones) {
              const milestoneKey = `milestone:${ms.threshold}`
              const skinUnlock = skinMap[milestoneKey]
              if (skinUnlock && isSkinUnlocked(skinUnlock.skinId)) {
                enqueueAchievements([{ title: `New Skin Unlocked: ${skinUnlock.skinName}!`, description: `Select it in Settings`, emoji: skinUnlock.skinEmoji }])
              }
            }
            updateUI()
          }
          // Check word pack unlocks on game over
          try {
            const newPacks = checkPackUnlocks()
            if (newPacks.length > 0) {
              setUnlockedPackIds(WORD_PACKS.filter(p => isPackUnlocked(p)).map(p => p.id))
              for (const packId of newPacks) {
                const pack = WORD_PACKS.find(p => p.id === packId)
                if (pack) {
                  setWordPackToast({ name: pack.name, emoji: pack.emoji, description: pack.description })
                  if (wordPackToastTimerRef.current) clearTimeout(wordPackToastTimerRef.current)
                  wordPackToastTimerRef.current = setTimeout(() => setWordPackToast(null), 5000)
                }
              }
            }
          } catch { /* ignore */ }
          // Check extra achievements on game over
          try {
            const extraGameOverStats = {
              bossDefeats: bossDefeatsRef.current,
              legendaryBossDefeats: parseInt(localStorage.getItem('word-snake-legendary-boss-defeats') || '0'),
              portalTeleports: gs.portalPairs.length * 2,
              obstacleSurvivals: 0,
              spikeWordsEaten: 0,
              totalWordsCollected: collectedWordsRef.current.size,
              seasonalSeasonsPlayed: [],
              unlockedBotSkins: 0,
              maxComboMultiplier: Math.max(gs.comboMultiplier, gs.speedRunMaxCombo),
              quizCorrectAnswers: gs.quizStreak,
              quizFastestTime: 0,
              scramblesSolved: 0,
              pvpSteals: 0,
              pvpWins: 0,
              totalCoins: getCoinBalance().totalEarned,
            }
            const gameOverExtraAch = checkExtraAchievements(extraGameOverStats)
            if (gameOverExtraAch.length > 0) {
              for (const ea of gameOverExtraAch) {
                const rewardText = ea.reward ? (ea.reward.type === 'coins' ? `+${ea.reward.value} 🪙` : `Title: ${ea.reward.value}`) : ''
                toast({ title: `${ea.emoji} Extra Achievement: ${ea.title}`, description: ea.description + (rewardText ? ` (${rewardText})` : '') })
                if (ea.reward && ea.reward.type === 'coins') {
                  addCoins(ea.reward.value as number, 'extra_achievement_gameover')
                }
              }
            }
          } catch { /* ignore */ }
        } catch { /* ignore */ }
      }

      if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
        const hasShield = gs.activePowerUps.some(pu => pu.type === 'shield')
        // Round 42: Ghost mode — bypass wall collision and wrap
        const effectResult = powerUpEffectWireRef.current.applyEffects({} as any, 0.016)
        if (ghostCollisionWireRef.current.shouldBypassWallCollision(effectResult.ghostMode)) {
          const wrapped = ghostCollisionWireRef.current.wrapPosition(head.x, head.y, GRID_WIDTH, GRID_HEIGHT)
          head.x = wrapped.x
          head.y = wrapped.y
          ghostCollisionWireRef.current.onWallPass()
          spawnFloatingText('👻', head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 10, '#22d3ee')
        } else if (hasShield) {
          gs.activePowerUps = gs.activePowerUps.filter(pu => pu.type !== 'shield')
          // Wrap to opposite side
          if (head.x < 0) head.x = GRID_WIDTH - 1
          else if (head.x >= GRID_WIDTH) head.x = 0
          else if (head.y < 0) head.y = GRID_HEIGHT - 1
          else if (head.y >= GRID_HEIGHT) head.y = 0
          spawnFloatingText('🛡️', head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 10, '#60a5fa')
          // Round 41: SFX — shield break on wall
          sfxCompletionWireRef.current.onShieldBreak()
        } else {
          // Round 41: SFX — wall collision
          sfxCompletionWireRef.current.onCollision('wall')
          handleDeath()
          sfxCompletionWireRef.current.onGameOver()
          draw()
          animFrameRef.current = requestAnimationFrame(gameLoop)
          return
        }
      }

      if (snake.some((s) => s.x === head.x && s.y === head.y)) {
        const hasShield = gs.activePowerUps.some(pu => pu.type === 'shield')
        // Round 42: Ghost mode — bypass self collision
        const ghostEffect = powerUpEffectWireRef.current.applyEffects({} as any, 0.016)
        if (ghostCollisionWireRef.current.shouldBypassSelfCollision(ghostEffect.ghostMode)) {
          ghostCollisionWireRef.current.onSelfPass()
          // Pass through body — no death, no shield consumed
        } else if (hasShield) {
          gs.activePowerUps = gs.activePowerUps.filter(pu => pu.type !== 'shield')
          spawnFloatingText('🛡️', head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 10, '#60a5fa')
          // Let it pass through — the head overlaps one body segment for one frame
          // Round 41: SFX — shield break on self
          sfxCompletionWireRef.current.onShieldBreak()
        } else if (gs.extraLifeAvailable) {
          // Silver milestone: extra life — remove 3 tail segments instead of dying
          gs.extraLifeAvailable = false
          const removeCount = Math.min(3, snake.length - 1)
          if (removeCount > 0) {
            snake.splice(snake.length - removeCount, removeCount)
          }
          spawnFloatingText('EXTRA LIFE!', head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 30, '#fbbf24')
          spawnParticles(head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE + CELL_SIZE / 2, '#fbbf24', 20)
          // Let it pass through — the head overlaps one body segment for one frame
        } else {
          // Round 40: Practice mode collision bypass
          const practiceResult = wiringHubRef.current.handlePracticeCollision(gs, modeEngineRef.current)
          if (practiceResult.survived) {
            spawnFloatingText('🔄 Practice Reset', head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 20, '#a78bfa')
            // Round 41: SFX — practice mode collision (soft)
            sfxCompletionWireRef.current.onCollision('self')
            // Reset snake position but don't end game
          } else {
            // Round 41: SFX — self collision death
            sfxCompletionWireRef.current.onCollision('self')
            handleDeath()
            sfxCompletionWireRef.current.onGameOver()
            draw()
            animFrameRef.current = requestAnimationFrame(gameLoop)
            return
          }
        }
      }

      // Player collides with AI bot body
      if (aiBot && aiBot.alive && aiBot.snake.some((s) => s.x === head.x && s.y === head.y)) {
        const hasShield = gs.activePowerUps.some(pu => pu.type === 'shield')
        if (!hasShield) {
          // Round 40: Practice mode also applies to bot collision
          const practiceResult2 = wiringHubRef.current.handlePracticeCollision(gs, modeEngineRef.current)
          if (!practiceResult2.survived) {
            handleDeath()
            draw()
            animFrameRef.current = requestAnimationFrame(gameLoop)
            return
          }
        }
      }

      // Check obstacle collision
      if (!gs.isDailyChallenge) {
        const obsCollision = checkObstacleCollision(head, gs.obstacles, Date.now())
        if (obsCollision.collision) {
          if (obsCollision.damage === -1) {
            // Wall or active lava = death
            const hasShield = gs.activePowerUps.some(pu => pu.type === 'shield')
            if (hasShield) {
              const shieldIdx = gs.activePowerUps.findIndex(p => p.type === 'shield')
              if (shieldIdx >= 0) gs.activePowerUps.splice(shieldIdx, 1)
              spawnFloatingText('\u{1F6E1}\uFE0F', head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 10, '#60a5fa')
              spawnParticles(head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE + CELL_SIZE / 2, '#60a5fa', 8)
            } else {
              // Round 41: SFX — obstacle collision death
              sfxCompletionWireRef.current.onCollision('obstacle')
              handleDeath()
              sfxCompletionWireRef.current.onGameOver()
              draw()
              animFrameRef.current = requestAnimationFrame(gameLoop)
              return
            }
          } else if (obsCollision.damage > 0) {
            // Spike damage - remove segments
            const segmentsToRemove = Math.min(obsCollision.damage, gs.snake.length - 1)
            gs.snake.splice(gs.snake.length - segmentsToRemove)
            spawnFloatingText('\u{1F53A} -' + segmentsToRemove, head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 10, '#ef4444')
            spawnParticles(head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE + CELL_SIZE / 2, '#ef4444', 8)
            // Round 41: SFX — spike damage
            sfxCompletionWireRef.current.onCollision('obstacle')
            if (gs.snake.length <= 1) { handleDeath(); sfxCompletionWireRef.current.onGameOver(); draw(); animFrameRef.current = requestAnimationFrame(gameLoop); return }
          } else if (obsCollision.type === 'ice') {
            // Ice = slide one extra cell
            iceSlideQueuedRef.current = true
            spawnFloatingText('\u{1F9CA} Slide!', head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 10, '#7dd3fc')
          }
        }
      }

      // Check moving obstacle collision
      if (movingObstaclesRef.current.length > 0) {
        const movCollision = checkMovingObstacleCollision(head, movingObstaclesRef.current)
        if (movCollision.collided) {
          const hasShield = gs.activePowerUps.some(pu => pu.type === 'shield')
          if (hasShield) {
            const shieldIdx = gs.activePowerUps.findIndex(p => p.type === 'shield')
            if (shieldIdx >= 0) gs.activePowerUps.splice(shieldIdx, 1)
            spawnFloatingText('Shield blocked!', head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 10, '#60a5fa')
            emitPresetParticles(head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE + CELL_SIZE / 2, 'shield_block')
          } else {
            handleDeath()
            draw()
            animFrameRef.current = requestAnimationFrame(gameLoop)
            return
          }
        }
      }

      // Check destructible wall collision
      if (destructibleWallsRef.current.length > 0) {
        const hitWall = getDestructibleWallAt(head.x, head.y, destructibleWallsRef.current)
        if (hitWall) {
          const hasHammer = isHammerActive(hammerStateRef.current)
          const hasShield = gs.activePowerUps.some(pu => pu.type === 'shield')
          if (hasHammer) {
            // Hammer breaks walls with bonus points, no bounce-back
            const result = applyHammerOnWall(hammerStateRef.current, hitWall)
            if (result.destroyed) {
              destructibleWallsRef.current = destructibleWallsRef.current.filter(w => w.id !== hitWall.id)
              gs.score += result.bonusPoints
              addCoins(2)
              spawnFloatingText(`${HAMMER_CONFIG.emoji} +${result.bonusPoints}`, head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 10, HAMMER_CONFIG.color)
              emitPresetParticles(head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE + CELL_SIZE / 2, 'star')
              emitEvent('obstacle_hit', `${HAMMER_CONFIG.emoji} Smashed ${DESTRUCTIBLE_WALL_CONFIG[hitWall.type].label}! +${result.bonusPoints}`, HAMMER_CONFIG.emoji, HAMMER_CONFIG.color)
              if (canHaptic()) hapticFeedback('success')
            } else {
              spawnFloatingText(`${HAMMER_CONFIG.emoji} Hit!`, head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 10, HAMMER_CONFIG.color)
              if (canHaptic()) hapticFeedback('medium')
            }
          } else if (hasShield) {
            // Shield breaks through destructible walls
            const destroyed = hitDestructibleWall(hitWall)
            if (destroyed) {
              destructibleWallsRef.current = destructibleWallsRef.current.filter(w => w.id !== hitWall.id)
              const pts = DESTRUCTIBLE_WALL_CONFIG[hitWall.type].points
              gs.score += pts
              addCoins(1)
              spawnFloatingText(`${DESTRUCTIBLE_WALL_CONFIG[hitWall.type].emoji} +${pts}`, head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 10, DESTRUCTIBLE_WALL_CONFIG[hitWall.type].glowColor)
              emitPresetParticles(head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE + CELL_SIZE / 2, 'burst')
              emitEvent('obstacle_hit', `Destroyed ${DESTRUCTIBLE_WALL_CONFIG[hitWall.type].label}! +${pts}`, DESTRUCTIBLE_WALL_CONFIG[hitWall.type].emoji, DESTRUCTIBLE_WALL_CONFIG[hitWall.type].glowColor)
              if (canHaptic()) hapticFeedback('medium')
            } else {
              spawnFloatingText(`${DESTRUCTIBLE_WALL_CONFIG[hitWall.type].emoji} Hit!`, head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 10, '#f59e0b')
              if (canHaptic()) hapticFeedback('light')
            }
            // Shield absorbs the hit, remove it
            const shieldIdx = gs.activePowerUps.findIndex(p => p.type === 'shield')
            if (shieldIdx >= 0) gs.activePowerUps.splice(shieldIdx, 1)
          } else {
            // No shield — wall damages but doesn't kill; snake bounces back
            const destroyed = hitDestructibleWall(hitWall)
            if (destroyed) {
              destructibleWallsRef.current = destructibleWallsRef.current.filter(w => w.id !== hitWall.id)
              const pts = DESTRUCTIBLE_WALL_CONFIG[hitWall.type].points
              gs.score += pts
              addCoins(1)
              spawnFloatingText(`${DESTRUCTIBLE_WALL_CONFIG[hitWall.type].emoji} Smashed! +${pts}`, head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 10, DESTRUCTIBLE_WALL_CONFIG[hitWall.type].glowColor)
              emitPresetParticles(head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE + CELL_SIZE / 2, 'burst')
              emitEvent('obstacle_hit', `Smashed ${DESTRUCTIBLE_WALL_CONFIG[hitWall.type].label}! +${pts}`, DESTRUCTIBLE_WALL_CONFIG[hitWall.type].emoji, DESTRUCTIBLE_WALL_CONFIG[hitWall.type].glowColor)
              if (canHaptic()) hapticFeedback('success')
            } else {
              // Bounce back — undo the move
              gs.snake.shift()
              const prev = gs.direction
              const opposite: Record<Direction, Direction> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }
              gs.direction = opposite[prev]
              spawnFloatingText(`${DESTRUCTIBLE_WALL_CONFIG[hitWall.type].emoji} Blocked!`, head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 10, '#ef4444')
              if (canHaptic()) hapticFeedback('warning')
              gs.score = Math.max(0, gs.score - 2)
            }
          }
        }
      }

      // Check portal teleport
      if (!gs.isDailyChallenge && gs.portalPairs.length > 0) {
        const teleportResult = checkPortalTeleport(head, gs.portalPairs, Date.now())
        if (teleportResult.teleport && teleportResult.destination) {
          head.x = teleportResult.destination.x
          head.y = teleportResult.destination.y
          spawnFloatingText('\u{1F300} Teleport!', head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 10, '#a855f7')
          spawnParticles(head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE + CELL_SIZE / 2, '#a855f7', 15)
          emitPresetParticles(head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE + CELL_SIZE / 2, 'portal_enter')
          emitEvent('portal_teleport', 'Teleported through portal!', '🌀', '#06b6d4')
        }
      }

      // Check boss hit
      if (!gs.isDailyChallenge && gs.boss && gs.boss.phase !== 'defeated') {
        const bossHit = checkBossHit(head, gs.boss)
        if (bossHit.hit) {
          gs.boss.hitEffect = Date.now()
          if (bossHit.defeated) {
            gs.boss.phase = 'defeated'
            gs.boss.defeatedEffect = Date.now()
            const bossConfig = BOSS_POOL.find(b => b.word === gs.boss!.word)
            const reward = bossConfig ? Math.round(gs.boss.word.length * bossConfig.rewardMultiplier * 10) : 50
            gs.score += reward
            // Coin reward for boss defeat
            const bossTier = bossConfig?.tier ?? 'minor'
            const bossCoinReward = bossTier === 'legendary' ? COIN_REWARD.BOSS_LEGENDARY : bossTier === 'major' ? COIN_REWARD.BOSS_MAJOR : COIN_REWARD.BOSS_MINOR
            addCoins(bossCoinReward, 'boss_defeat')
            gs.coinBalance = getCoinBalance().coins
            bossDefeatsRef.current++
            gs.bossDefeats = bossDefeatsRef.current
            try { localStorage.setItem('word-snake-boss-defeats', String(bossDefeatsRef.current)) } catch {}
            spawnFloatingText('\u{1F480} BOSS DEFEATED! +' + reward, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40, '#f59e0b')
            spawnParticles(head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE + CELL_SIZE / 2, '#f59e0b', 30)
            emitPresetParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'boss_defeat')
            emitEvent('boss_hit', `Boss "${gs.boss.word}" defeated! +${reward} pts, +${bossCoinReward} coins`, '💥', '#ef4444')
            // Remove boss after animation
            setTimeout(() => { gs.boss = null; bossRef.current = null; updateUI() }, 1500)
          } else {
            const progress = `${gs.boss.currentPasses}/${gs.boss.requiredPasses}`
            spawnFloatingText('\u{1F4A4} Hit! ' + progress, head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 15, '#fb923c')
            spawnParticles(head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE + CELL_SIZE / 2, '#fb923c', 8)
          }
        }
        // Check boss expiry
        if (gs.boss && isBossExpired(gs.boss, Date.now())) {
          gs.boss = null
          bossRef.current = null
          spawnFloatingText('\u{1F480} Boss escaped!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#ef4444')
        }
      }

      const newSnake = [head, ...snake]

      if (wordFood) {
        const fx = wordFood.position.x
        const fy = wordFood.position.y
        const ate = (
          (head.x === fx && head.y === fy) ||
          (head.x === fx + 1 && head.y === fy) ||
          (head.x === fx - 1 && head.y === fy) ||
          (head.x === fx && head.y === fy + 1) ||
          (head.x === fx && head.y === fy - 1)
        )

        if (ate) {
          const diff = gs.difficulty
          const settings = DIFFICULTY_SETTINGS[diff]
          const entry = getWordEntryIncludingCustom(wordFood.word)
          const packEntry = getPackWordEntry(wordFood.word)
          let points = packEntry ? packEntry.points : entry ? entry.points : wordFood.word.length * 10

          // Bronze milestone bonus: +5 points per word before multipliers
          const mBonuses = getActiveMilestoneBonuses()
          points += mBonuses.pointsPerWord

          // Double Points power-up
          if (gs.activePowerUps.some(pu => pu.type === 'double_points')) {
            points *= 2
          }

          // Rarity multiplier
          const rarityConfig = RARITY_CONFIG[wordFood.rarity]
          if (rarityConfig && rarityConfig.pointMultiplier > 1) {
            const rarityBonus = Math.floor(points * (rarityConfig.pointMultiplier - 1))
            points += rarityBonus
          }

          // Weather point multiplier (e.g. Stars gives +20%)
          const weatherPtConf = WEATHER_CONFIG[gs.weather]
          if (weatherPtConf.pointMultiplier > 1) {
            points = Math.floor(points * weatherPtConf.pointMultiplier)
          }

          // Combo chain logic
          if (wordFood.category === gs.lastEatenCategory) {
            gs.comboCount += 1
            gs.comboMultiplier = 1 + 0.5 * (gs.comboCount - 1)
          } else {
            gs.comboCount = 1
            gs.comboMultiplier = 1
            gs.lastEatenCategory = wordFood.category
          }
          // Apply combo multiplier to points
          const comboPoints = Math.floor(points * gs.comboMultiplier)

          const catColor = CATEGORY_COLORS[wordFood.category] ?? '#f59e0b'

          addWord(wordFood.word)
          collectedWordsRef.current.add(wordFood.word)
          gs.score += comboPoints
          // Coin reward for eating word
          const coinReward = wordFood.rarity === 'legendary' ? COIN_REWARD.RARE_WORD_LEGENDARY : wordFood.rarity === 'rare' ? COIN_REWARD.RARE_WORD_RARE : wordFood.rarity === 'uncommon' ? COIN_REWARD.RARE_WORD_UNCOMMON : COIN_REWARD.EAT_WORD
          addCoins(coinReward, 'ate_word')
          gs.coinBalance = getCoinBalance().coins
          gs.speed = Math.max(settings.minSpeed, gs.speed - settings.speedInc)
          gs.wordsEaten += 1
          gs.wordFood = null

          // Track words by category
          if (!gs.wordsByCategory[wordFood.category]) gs.wordsByCategory[wordFood.category] = 0
          gs.wordsByCategory[wordFood.category] += 1

          // Track speed run stats
          if (gs.isSpeedRun) {
            gs.speedRunMaxCombo = Math.max(gs.speedRunMaxCombo, gs.comboMultiplier)
            gs.speedRunLongestSnake = Math.max(gs.speedRunLongestSnake, gs.snake.length)
          }

          // Track word eaten for stats
          trackWordEaten(wordFood.category, wordFood.rarity)
          trackCombo(gs.comboCount)

          // Track daily challenge words
          if (gs.isDailyChallenge && !gs.dailyWordsCollected.includes(wordFood.word)) {
            gs.dailyWordsCollected.push(wordFood.word)
          }

          // Trigger word entrance animation
          setNewWordKey((k) => k + 1)

          const wx = wordFood.position.x * CELL_SIZE + CELL_SIZE / 2
          const wy = wordFood.position.y * CELL_SIZE
          spawnFloatingText(`+${comboPoints}${gs.weather === 'stars' ? ' ⭐' : ''}`, wx, wy, '#4ade80')
          if (rarityConfig && rarityConfig.pointMultiplier > 1) {
            spawnFloatingText(`${rarityConfig.emoji} ${rarityConfig.label}!`, wx, wy - 66, rarityConfig.color)
          }
          spawnFloatingText(wordFood.word, wx, wy - 22, catColor)
          if (gs.comboCount > 1) {
            spawnFloatingText(`🔥 ×${gs.comboMultiplier.toFixed(1)}`, wx, wy - 44, '#f59e0b')
          }
          spawnParticles(wx, wy + CELL_SIZE / 2, catColor, 12)
          spawnParticles(wx, wy + CELL_SIZE / 2, '#4ade80', 8)
          // Emit preset particle effect for word eating
          emitPresetParticles(wx, wy + CELL_SIZE / 2, 'word_eat')
          // Emit event to feed
          emitEvent('word_eaten', `Ate "${wordFood.word}" +${comboPoints}`, '📝', catColor)
          // Spawn combo VFX particles on combo increase
          const comboVfxConfig = getComboVfx(gs.comboMultiplier)
          if (comboVfxConfig.particleCount > 0) {
            const newParticles = spawnComboParticles(wx, wy + CELL_SIZE / 2, gs.comboMultiplier, Date.now())
            comboVfxParticlesRef.current.push(...newParticles)
          }
          // Check for combo level announcement
          if (shouldShowComboAnnouncement(gs.comboMultiplier)) {
            const ct = getComboTextConfig(gs.comboMultiplier)
            spawnFloatingText(`${ct.emoji} ${ct.text}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80, ct.color)
            spawnParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, ct.color, comboVfxConfig.particleCount)
            emitPresetParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'combo_fire')
            emitEvent('combo', `${ct.emoji} ${ct.text}! (×${gs.comboMultiplier.toFixed(1)})`, '🔥', '#f97316')
          }
          playSound(playEatSound)

          // ---- Easter egg checking ----
          const eatenWord = wordFood.word
          const triggeredEggs = checkEasterEggs(eatenWord, collectedWordsRef.current)
          if (triggeredEggs.length > 0) {
            for (const egg of triggeredEggs) {
              playSound(playEasterEggSound)

              // Show floating text on canvas
              spawnFloatingText(`🥚 ${egg.message}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, '#fbbf24')
              emitPresetParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'easter_egg')
              emitEvent('easter_egg', `${egg.emoji} ${egg.name}: ${egg.description}`, '🥚', '#c084fc')

              // Show toast notification
              toast({
                title: `${egg.emoji} Easter Egg Discovered!`,
                description: `${egg.name}: ${egg.description}`,
              })

              // Apply effects
              if (egg.effect === 'rainbow_snake' || egg.effect === 'slow_mo' || egg.effect === 'reverse_controls') {
                const expiresAt = egg.duration ? Date.now() + egg.duration : 0
                setActiveEasterEggs(prev => {
                  const filtered = prev.filter(e => e.effect !== egg.effect)
                  return [...filtered, { id: egg.id, name: egg.name, emoji: egg.emoji, effect: egg.effect, expiresAt }]
                })
                // Clean up display after duration
                if (egg.duration) {
                  setTimeout(() => {
                    setActiveEasterEggs(prev => prev.filter(e => e.id !== egg.id))
                  }, egg.duration)
                }
              }

              if (egg.effect === 'confetti_burst') {
                spawnEasterEggConfetti(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3, 80)
              }

              if (egg.effect === 'color_explosion') {
                spawnEasterEggConfetti(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 120)
                // Also spawn color bursts across the grid
                for (let i = 0; i < 6; i++) {
                  const rx = Math.random() * CANVAS_WIDTH
                  const ry = Math.random() * CANVAS_HEIGHT
                  spawnParticles(rx, ry, `hsl(${Math.random() * 360}, 80%, 60%)`, 10)
                }
              }

              if (egg.effect === 'extra_life') {
                gs.extraLifeAvailable = true
                updateUI()
              }

              if (egg.effect === 'giant_food') {
                // Giant food is handled purely in rendering - set a timed display
                const expiresAt = Date.now() + 10000
                setActiveEasterEggs(prev => {
                  const filtered = prev.filter(e => e.effect !== 'giant_food')
                  return [...filtered, { id: egg.id, name: egg.name, emoji: egg.emoji, effect: 'giant_food' as EasterEggEffect, expiresAt }]
                })
                setTimeout(() => {
                  setActiveEasterEggs(prev => prev.filter(e => e.id !== egg.id))
                }, 10000)
              }

              if (egg.effect === 'speed_boost') {
                // Temporarily make the snake faster (reduce speed by 20% for duration)
                const expiresAt = Date.now() + (egg.duration ?? 5000)
                setActiveEasterEggs(prev => {
                  const filtered = prev.filter(e => e.effect !== 'speed_boost')
                  return [...filtered, { id: egg.id, name: egg.name, emoji: egg.emoji, effect: 'speed_boost' as EasterEggEffect, expiresAt }]
                })
                setTimeout(() => {
                  setActiveEasterEggs(prev => prev.filter(e => e.id !== egg.id))
                }, egg.duration ?? 5000)
              }
            }
          }

          // Update in-game progressive difficulty
          const prevLevel = prevInGameDiffLevelRef.current
          const newDifficulty = calculateInGameDifficulty(gs.score, gs.wordsEaten, gs.snake.length, gs.elapsedTime)
          gs.inGameDifficulty = newDifficulty
          if (newDifficulty.level > prevLevel && prevLevel > 0) {
            // Level up! Show notification
            prevInGameDiffLevelRef.current = newDifficulty.level
            spawnFloatingText(`${newDifficulty.emoji} DIFFICULTY UP!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60, newDifficulty.color)
            spawnFloatingText(`${newDifficulty.label}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40, newDifficulty.glowColor)
            spawnParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, newDifficulty.color, 20)
            spawnParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, newDifficulty.glowColor, 15)
            emitPresetParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'level_up')
            emitEvent('level_up', `Level ${newDifficulty.level}: ${newDifficulty.label}`, '📈', '#8b5cf6')
          } else if (prevLevel === 0) {
            prevInGameDiffLevelRef.current = newDifficulty.level
          }

          // Check achievements after eating a word
          try {
            const wl = Object.entries(useWordStore.getState().collectedWords)
            const cats = [...new Set(wl.map(([w]) => { const e = getWordEntry(w); return e?.category }).filter(Boolean))] as string[]
            const stats: AchievementStats = {
              totalWordsCollected: wl.reduce((s, [, c]) => s + c, 0),
              totalWordsEaten: gs.wordsEaten,
              poemsCreated: 0,
              highScore: Math.max(gs.score, parseInt(localStorage.getItem('word-snake-highscore') ?? '0', 10)),
              categories: cats,
              gamesPlayed: parseInt(localStorage.getItem('word-snake-games') ?? '0', 10),
            }
            const newlyUnlocked = checkAchievements(stats)
            if (newlyUnlocked.length > 0) {
              const notifications = newlyUnlocked.map(a => ({ title: a.title, description: a.description, emoji: a.emoji }))
              enqueueAchievements(notifications)
              spawnFloatingText(`🏆 ${newlyUnlocked[0].title}`, wx, wy - 44, '#fbbf24')
              // Check if any newly unlocked achievement unlocks a skin
              const skinMap = getSkinUnlockMap()
              for (const a of newlyUnlocked) {
                const skinUnlock = skinMap[a.id]
                if (skinUnlock && isSkinUnlocked(skinUnlock.skinId)) {
                  enqueueAchievements([{ title: `New Skin Unlocked: ${skinUnlock.skinName}!`, description: `Select it in Settings`, emoji: skinUnlock.skinEmoji }])
                }
              }
            }
            // Check word pack unlocks
            try {
              const newPacks = checkPackUnlocks()
              if (newPacks.length > 0) {
                setUnlockedPackIds(WORD_PACKS.filter(p => isPackUnlocked(p)).map(p => p.id))
                for (const packId of newPacks) {
                  const pack = WORD_PACKS.find(p => p.id === packId)
                  if (pack) {
                    spawnFloatingText(`📦 ${pack.emoji} ${pack.name} Pack Unlocked!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80, pack.color)
                    setWordPackToast({ name: pack.name, emoji: pack.emoji, description: pack.description })
                    if (wordPackToastTimerRef.current) clearTimeout(wordPackToastTimerRef.current)
                    wordPackToastTimerRef.current = setTimeout(() => setWordPackToast(null), 5000)
                  }
                }
              }
            } catch { /* ignore */ }
          } catch { /* ignore */ }

          // Check extra achievements
          try {
            const bossTier = wordFood.rarity === 'legendary' ? 1 : 0
            const extraStats = {
              bossDefeats: bossDefeatsRef.current,
              legendaryBossDefeats: parseInt(localStorage.getItem('word-snake-legendary-boss-defeats') || '0'),
              portalTeleports: gs.portalPairs.length * 2,
              obstacleSurvivals: 0,
              spikeWordsEaten: 0,
              totalWordsCollected: collectedWordsRef.current.size,
              seasonalSeasonsPlayed: [],
              unlockedBotSkins: 0,
              maxComboMultiplier: Math.max(gs.comboMultiplier, gs.speedRunMaxCombo),
              quizCorrectAnswers: gs.quizStreak,
              quizFastestTime: 0,
              scramblesSolved: 0,
              pvpSteals: 0,
              pvpWins: 0,
              totalCoins: getCoinBalance().totalEarned,
            }
            const newExtraAchievements = checkExtraAchievements(extraStats)
            if (newExtraAchievements.length > 0) {
              for (const ea of newExtraAchievements) {
                const rewardText = ea.reward ? (ea.reward.type === 'coins' ? `+${ea.reward.value} 🪙` : `Title: ${ea.reward.value}`) : ''
                toast({ title: `${ea.emoji} Extra Achievement: ${ea.title}`, description: ea.description + (rewardText ? ` (${rewardText})` : '') })
                if (ea.reward && ea.reward.type === 'coins') {
                  addCoins(ea.reward.value as number, 'extra_achievement')
                  gs.coinBalance = getCoinBalance().coins
                }
              }
            }
          } catch { /* ignore */ }
          // Check streak milestones
          const currentStreak = streakInfo?.currentStreak ?? 0
          for (const bonus of STREAK_BONUSES) {
            if (currentStreak === bonus.days) {
              spawnFloatingText(`🔥 ${bonus.name}!`, wx, wy - 66, '#f59e0b')
              break
            }
          }

          // Check achievement milestones
          try {
            const newlyUnlockedMilestones = checkMilestones()
            if (newlyUnlockedMilestones.length > 0) {
              for (const ms of newlyUnlockedMilestones) {
                spawnFloatingText(`${ms.emoji} ${ms.name}!`, wx, wy - 88, ms.color)
                // Show milestone toast
                gs.lastMilestone = { name: ms.name, emoji: ms.emoji, description: ms.description }
                if (milestoneToastTimerRef.current) clearTimeout(milestoneToastTimerRef.current)
                milestoneToastTimerRef.current = setTimeout(() => {
                  gameStateRef.current.lastMilestone = null
                  updateUI()
                }, 5000)
                // Apply Silver milestone extra life if just unlocked
                if (ms.bonusType === 'extra_life') {
                  gs.extraLifeAvailable = true
                }
              }
              updateUI()
            }
          } catch { /* ignore */ }

          spawnWord()

          // Chance to spawn power-up — Gold milestone doubles spawn rate
          const effectiveSpawnChance = POWERUP_SPAWN_CHANCE * mBonuses.spawnRateMultiplier
          if (Math.random() < effectiveSpawnChance && !gs.powerUp) {
            const puType = getRandomPowerUpType()
            // Find empty position (not on snake, not on word food)
            const occupied = new Set([
              ...gs.snake.map(s => `${s.x},${s.y}`),
              gs.wordFood ? `${gs.wordFood.position.x},${gs.wordFood.position.y}` : '',
            ])
            let puPos: Position
            let attempts = 0
            do {
              puPos = {
                x: Math.floor(Math.random() * (GRID_WIDTH - 6)) + 3,
                y: Math.floor(Math.random() * (GRID_HEIGHT - 6)) + 3,
              }
              attempts++
            } while (occupied.has(`${puPos.x},${puPos.y}`) && attempts < 50)
            gs.powerUp = { type: puType, position: puPos, spawnTime: Date.now() }
          }

          // Spawn obstacles
          if (shouldSpawnObstacle(gs.wordsEaten, gs.difficulty)) {
            const maxObs = getMaxObstacles(gs.wordsEaten, gs.difficulty)
            if (gs.obstacles.length < maxObs) {
              const newObs = generateObstacles(1, gs.snake, gs.wordFood?.position || null, gs.obstacles, { width: GRID_WIDTH, height: GRID_HEIGHT }, gs.difficulty)
              gs.obstacles.push(...newObs)
            }
          }
          // Spawn moving obstacles (after eating 8 words, max 3 moving obstacles)
          if (gs.wordsEaten >= 8 && movingObstaclesRef.current.length < 3 && Math.random() < 0.003) {
            const newMovingObs = spawnMovingObstacles(1, GRID_WIDTH, GRID_HEIGHT, gs.snake, gs.obstacles)
            movingObstaclesRef.current.push(...newMovingObs)
            if (newMovingObs.length > 0) {
              emitEvent('obstacle_hit', `Moving obstacle appeared! (${movingObstaclesRef.current.length} active)`, '🧱', '#94a3b8')
            }
          }
          // Spawn destructible walls (after eating 12 words, max 5 walls)
          if (gs.wordsEaten >= 12 && destructibleWallsRef.current.length < 5 && Math.random() < 0.002) {
            const existing = [...gs.obstacles, ...movingObstaclesRef.current.map(m => ({ x: Math.round(m.cx), y: Math.round(m.cy) })), ...destructibleWallsRef.current]
            const newWalls = spawnDestructibleWalls(1, GRID_WIDTH, GRID_HEIGHT, gs.snake, existing)
            destructibleWallsRef.current.push(...newWalls)
            if (newWalls.length > 0) {
              const wType = newWalls[0].type
              emitEvent('obstacle_hit', `${DESTRUCTIBLE_WALL_CONFIG[wType].label} appeared!`, DESTRUCTIBLE_WALL_CONFIG[wType].emoji, DESTRUCTIBLE_WALL_CONFIG[wType].glowColor)
            }
          }
          // Spawn hammer power-up (after 15 words, no active hammer, no existing hammer pickup)
          if (!isHammerActive(hammerStateRef.current) && !hammerPowerUpRef.current && shouldSpawnHammer(gs.wordsEaten, gs.wordsEaten > 30 ? 3 : gs.wordsEaten > 20 ? 2 : 1)) {
            const occupied = new Set(gs.snake.map(s => `${s.x},${s.y}`))
            if (gs.wordFood) occupied.add(`${gs.wordFood.position.x},${gs.wordFood.position.y}`)
            let pos: Position | null = null
            let attempts = 0
            while (!pos && attempts < 50) {
              const px = 2 + Math.floor(Math.random() * (GRID_WIDTH - 4))
              const py = 2 + Math.floor(Math.random() * (GRID_HEIGHT - 4))
              if (!occupied.has(`${px},${py}`)) pos = { x: px, y: py }
              attempts++
            }
            if (pos) {
              hammerPowerUpRef.current = createHammerPowerUp(pos)
              emitEvent('powerup_spawn', `${HAMMER_CONFIG.emoji} Hammer appeared!`, HAMMER_CONFIG.emoji, HAMMER_CONFIG.color)
            }
          }
          // Check hammer pickup (snake head on hammer position)
          if (hammerPowerUpRef.current) {
            const hp = hammerPowerUpRef.current.position
            if (head.x === hp.x && head.y === hp.y) {
              activateHammer(hammerStateRef.current)
              setHammerActive(true)
              hammerPowerUpRef.current = null
              emitEvent('powerup_collect', `${HAMMER_CONFIG.emoji} Hammer activated! ${HAMMER_CONFIG.duration / 1000}s`, HAMMER_CONFIG.emoji, HAMMER_CONFIG.color)
              emitPresetParticles(head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE + CELL_SIZE / 2, 'burst')
              if (canHaptic()) hapticFeedback('success')
            }
          }
          // Update hammer state (check expiry)
          updateHammerState(hammerStateRef.current)
          if (!isHammerActive(hammerStateRef.current) && hammerActive) {
            setHammerActive(false)
          }
          // Update moving obstacles with difficulty scaling
          if (movingObstaclesRef.current.length > 0) {
            const speedMult = getObstacleSpeedMultiplier(gs.difficulty as GameDifficulty, gs.wordsEaten)
            movingObstaclesRef.current = updateMovingObstacles(movingObstaclesRef.current, speedMult / 60, Date.now() / 1000)
          }
          if (shouldSpawnPortal(gs.wordsEaten)) {
            const maxPairs = getMaxPortalPairs(gs.wordsEaten)
            if (gs.portalPairs.length < maxPairs) {
              const newPair = generatePortalPair(gs.snake, gs.wordFood?.position || null, gs.obstacles, { width: GRID_WIDTH, height: GRID_HEIGHT }, portalNextIdRef.current)
              if (newPair) {
                gs.portalPairs.push(newPair)
                portalNextIdRef.current++
              }
            }
          }
          // Spawn word quiz
          if (shouldSpawnQuiz() && !gs.activeQuiz) {
            const allWords = getAllWords()
            const quiz = generateQuiz(wordFood.word, wordFood.category, comboPoints, allWords)
            if (quiz) {
              gs.activeQuiz = quiz
              updateUI()
            }
          }
          // Spawn word scramble
          if (shouldSpawnScramble(gs.wordsEaten) && !gs.activeQuiz && !gs.activeScramble) {
            const scramble = generateScramble(wordFood.word, wordFood.category, comboPoints)
            if (scramble) {
              gs.activeScramble = scramble
              activeScrambleRef.current = scramble
              updateUI()
            }
          }
          // Spawn boss
          if (!gs.isDailyChallenge && !gs.boss && shouldSpawnBoss(gs.wordsEaten)) {
            const boss = generateBoss(gs.snake, gs.wordFood?.position || null, gs.obstacles, { width: GRID_WIDTH, height: GRID_HEIGHT })
            if (boss) {
              gs.boss = boss
              bossRef.current = boss
              const tierInfo = getBossTierInfo(BOSS_POOL.find(b => b.word === boss.word)?.tier || 'minor')
              spawnFloatingText(tierInfo.emoji + ' BOSS: ' + boss.word + '!', CANVAS_WIDTH / 2, 60, tierInfo.color)
            }
          }
        } else {
          newSnake.pop()
        }
      } else {
        newSnake.pop()
      }

      gs.snake = newSnake

      // Power-up collection check
      if (gs.powerUp) {
        const pu = gs.powerUp
        const puAte = (
          head.x === pu.position.x && head.y === pu.position.y
        )
        if (puAte) {
          const config = POWERUP_CONFIG[pu.type]
          // Apply instant effects
          if (pu.type === 'shrink') {
            const removeCount = Math.min(3, gs.snake.length - 1)
            gs.snake = gs.snake.slice(0, gs.snake.length - removeCount)
          } else {
            // Add timed effect
            gs.activePowerUps.push({
              type: pu.type,
              expiresAt: config.duration > 0 ? Date.now() + config.duration * 1000 : 0,
            })
          }
          // Effects
          const px = pu.position.x * CELL_SIZE + CELL_SIZE / 2
          const py = pu.position.y * CELL_SIZE + CELL_SIZE / 2
          spawnFloatingText(config.emoji, px, py - 10, config.color)
          spawnFloatingText(config.label, px, py - 30, config.color)
          spawnParticles(px, py, config.color, 15)
          emitPresetParticles(px, py, 'powerup_collect')
          emitEvent('powerup', `${config.emoji} ${config.label} activated!`, '⚡', config.color)
          playSound(playPowerUpSound)
          gs.powerUp = null
          trackPowerUpCollected()
          if (gs.isSpeedRun) gs.speedRunPowerUpsCollected += 1
        }
      }

      // Magnet: move word food closer to snake head
      if (gs.activePowerUps.some(pu => pu.type === 'magnet') && gs.wordFood) {
        const headPos = gs.snake[0]
        const foodPos = gs.wordFood.position
        const dx = headPos.x - foodPos.x
        const dy = headPos.y - foodPos.y
        if (Math.abs(dx) > 0) foodPos.x += Math.sign(dx)
        if (Math.abs(dy) > 0) foodPos.y += Math.sign(dy)
      }

      // Record replay frame (throttled inside recordFrame)
      if (isRecording() && !pvpRef.current) {
        try {
          recordFrame({
            snake: gs.snake.map(s => ({ x: s.x, y: s.y })),
            direction: gs.direction,
            food: gs.wordFood ? { x: gs.wordFood.position.x, y: gs.wordFood.position.y, word: gs.wordFood.word } : null,
            powerUp: gs.powerUp ? { x: gs.powerUp.position.x, y: gs.powerUp.position.y, type: gs.powerUp.type, emoji: POWERUP_CONFIG[gs.powerUp.type].emoji } : null,
            score: gs.score,
            wordsEaten: [...collectedWordsRef.current],
            comboCount: gs.comboCount,
          })
        } catch { /* ignore */ }
      }

      // Round 43b: Wiring hub completion — wire all remaining events each tick
      try {
        wiringHubCompletionRef.current.wireAllRemainingSystems({
          eventBusWire: eventBusWireRef.current,
          gameState: {
            direction: gs.direction,
            difficulty: gs.difficulty,
            difficultyLabel: gs.difficulty,
            isTimedMode: modeEngineRef.current.isTimedMode,
            isSpeedRun: gs.isSpeedRun,
            timeRemaining: modeEngineRef.current.timeRemaining,
            weather: gs.weather || 'clear',
            activeSkin: gs.activeSkin || 'default',
            collisionThisFrame: gs._collisionThisFrame,
            collisionType: gs._collisionType,
            collisionFatal: gs._collisionFatal,
            collisionPosition: gs._collisionPosition,
          },
          modeEngine: modeEngineRef.current,
        })
      } catch { /* wiring completion is non-critical */ }

      updateUI()
      draw()
      animFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animFrameRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [draw, addWord, spawnWord, updateUI, spawnFloatingText, spawnParticles, playSound, streakInfo])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const gs = gameStateRef.current
      const isPvPActive = !!pvpRef.current
      if (e.key === ' ') {
        e.preventDefault()
        if (gs.gameOver) { resetGame(gs.isDailyChallenge) }
        else if (!gs.gameStarted) { resetGame() }
        else { gs.paused = !gs.paused; playSound(playPauseSound); updateUI() }
        return
      }
      if (e.key === 'Escape') { gs.paused = !gs.paused; playSound(playPauseSound); updateUI(); return }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        if (gs.gameOver) resetGame(gs.isDailyChallenge)
        else if (!gs.gameStarted) resetGame()
        return
      }
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        gs.soundEnabled = !gs.soundEnabled
        updateUI()
        return
      }
      // In PvP mode, skip the s/d special shortcuts (they're direction controls for P1)
      if (!isPvPActive) {
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault()
          if (!gs.gameStarted) resetGame()
          return
        }
        if (e.key === 'd' || e.key === 'D') {
          e.preventDefault()
          if (!gs.gameStarted) { resetGame(true) }
          return
        }
      }
      if (e.key === 'Tab') {
        e.preventDefault()
        gs.showMiniMap = !gs.showMiniMap
        try { localStorage.setItem('word-snake-minimap', String(gs.showMiniMap)) } catch { /* ignore */ }
        updateUI()
        return
      }
      if (e.key === '?' || e.key === '/') {
        e.preventDefault()
        setShowShortcuts(prev => !prev)
        return
      }
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault()
        const themes = getAllGridThemes()
        const currentIdx = themes.findIndex(t => t.id === gs.gridTheme)
        const nextIdx = (currentIdx + 1) % themes.length
        const nextTheme = themes[nextIdx]
        gs.gridTheme = nextTheme.id
        saveGridTheme(nextTheme.id)
        setActiveGridTheme(nextTheme.id)
        setThemeSwitchRipple(true)
        setTimeout(() => setThemeSwitchRipple(false), 500)
        updateUI()
        return
      }
      if (e.key === '1') { e.preventDefault(); if (!gs.gameStarted || gs.gameOver) changeDifficulty('easy'); return }
      if (e.key === '2') { e.preventDefault(); if (!gs.gameStarted || gs.gameOver) changeDifficulty('medium'); return }
      if (e.key === '3') { e.preventDefault(); if (!gs.gameStarted || gs.gameOver) changeDifficulty('hard'); return }
      if (!gs.gameStarted || gs.gameOver || gs.paused) return

      // Direction controls
      if (isPvPActive) {
        // PvP: WASD -> Player 1, Arrow Keys -> Player 2
        const p1KeyToDir: Record<string, Direction> = {
          w: 'UP', W: 'UP', s: 'DOWN', S: 'DOWN',
          a: 'LEFT', A: 'LEFT', d: 'RIGHT', D: 'RIGHT',
        }
        const p2KeyToDir: Record<string, Direction> = {
          ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
        }
        const p1Dir = p1KeyToDir[e.key]
        if (p1Dir) {
          e.preventDefault()
          directionQueueRef.current.push(p1Dir)
          if (directionQueueRef.current.length > 2) directionQueueRef.current = directionQueueRef.current.slice(-2)
          return
        }
        const p2Dir = p2KeyToDir[e.key]
        if (p2Dir) {
          e.preventDefault()
          p2DirectionQueueRef.current.push(p2Dir)
          if (p2DirectionQueueRef.current.length > 2) p2DirectionQueueRef.current = p2DirectionQueueRef.current.slice(-2)
          return
        }
      } else {
        // Single-player: both WASD and Arrow keys control the same snake
        const keyToDir: Record<string, Direction> = {
          ArrowUp: 'UP', w: 'UP', W: 'UP',
          ArrowDown: 'DOWN', s: 'DOWN', S: 'DOWN',
          ArrowLeft: 'LEFT', a: 'LEFT', A: 'LEFT',
          ArrowRight: 'RIGHT', d: 'RIGHT', D: 'RIGHT',
        }

        // Easter egg: reverse controls (Chaos Mode)
        const reverseMap: Record<Direction, Direction> = {
          UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT',
        }
        const isReversed = hasActiveEffect('reverse_controls')

        let newDir = keyToDir[e.key]
        if (newDir && isReversed) {
          newDir = reverseMap[newDir]
        }
        if (newDir) {
          e.preventDefault()
          directionQueueRef.current.push(newDir)
          if (directionQueueRef.current.length > 2) {
            directionQueueRef.current = directionQueueRef.current.slice(-2)
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [resetGame, updateUI, playSound, startPvP, startAiBot])

  // Touch controls - also prevent page scroll
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      if (!touchStartRef.current) return
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y
      const minSwipe = 20
      if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) {
        const gs = gameStateRef.current
        if (!gs.gameStarted || gs.gameOver) { resetGame(gs.isDailyChallenge) }
        else { gs.paused = !gs.paused; playSound(playPauseSound); updateUI() }
        touchStartRef.current = null
        return
      }
      const gs = gameStateRef.current
      if (!gs.gameStarted || gs.gameOver || gs.paused) return
      const newDir: Direction = Math.abs(dx) > Math.abs(dy)
        ? (dx > 0 ? 'RIGHT' : 'LEFT')
        : (dy > 0 ? 'DOWN' : 'UP')
      directionQueueRef.current.push(newDir)
      if (directionQueueRef.current.length > 2) directionQueueRef.current = directionQueueRef.current.slice(-2)
      touchStartRef.current = null
    }
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [resetGame, updateUI, playSound])

  // Prevent page scroll when touching D-pad
  useEffect(() => {
    const dpadContainer = document.getElementById('mobile-dpad')
    if (!dpadContainer) return
    const prevent = (e: TouchEvent) => e.preventDefault()
    dpadContainer.addEventListener('touchmove', prevent, { passive: false })
    return () => dpadContainer.removeEventListener('touchmove', prevent)
  }, [])

  // Canvas click to start
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handleClick = () => {
      const gs = gameStateRef.current
      if (!gs.gameStarted || gs.gameOver) resetGame(gs.isDailyChallenge)
    }
    canvas.addEventListener('click', handleClick)
    return () => canvas.removeEventListener('click', handleClick)
  }, [resetGame])

  // Clean up achievement queue on unmount
  useEffect(() => {
    return () => {
      achievementQueue.clear()
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  // === Tutorial Functions ===
  const startTutorial = useCallback(() => {
    // Create tutorial state (don't resume — always start fresh for clarity)
    const state = createTutorialState(false)
    tutorialStateRef.current = state
    tutorialTutorialGameRef.current = true
    tutorialEatWordPendingRef.current = false
    setTutorialActive(true)

    // Start a special slow-paced game (easy difficulty, slow speed)
    const gs = gameStateRef.current
    gs.snake = [
      { x: 5, y: 12 },
      { x: 4, y: 12 },
      { x: 3, y: 12 },
    ]
    gs.direction = 'RIGHT'
    gs.gameOver = false
    gs.paused = false
    gs.score = 0
    gs.speed = 220 // Slow speed for tutorial
    gs.wordsEaten = 0
    gs.gameStarted = true
    gs.wordFood = null
    gs.startTime = Date.now()
    gs.elapsedTime = 0
    gs.difficulty = 'easy'
    directionQueueRef.current = []
    floatingTextsRef.current = []
    particlesRef.current = []
    presetParticlesRef.current = []
    clearEvents(eventFeedRef.current)
    resetMovingObstacleIds()
    movingObstaclesRef.current = []
    resetDestructibleWallIds()
    destructibleWallsRef.current = []
    hammerStateRef.current = createInitialHammerState()
    hammerPowerUpRef.current = null
    setHammerActive(false)
    gameIdRef.current = `game-${Date.now()}`
    collectedWordsRef.current = new Set()
    setLeaderboardRank(0)
    gs.isDailyChallenge = false
    gs.dailyChallengeWords = []
    gs.dailyWordsCollected = []
    gs.dailyTargetScore = 0
    gs.streakMultiplier = 1
    gs.powerUp = null
    gs.activePowerUps = []
    gs.comboCount = 0
    gs.lastEatenCategory = null
    gs.comboMultiplier = 1
    achievementQueue.clear()
    gs.lastAchievement = null
    gs.lastMilestone = null
    gs.weather = 'clear'
    weatherParticlesRef.current = []
    gs.isSpeedRun = false
    gs.speedRunTimeLeft = 60
    gs.speedRunMaxCombo = 0
    gs.speedRunPowerUpsCollected = 0
    gs.speedRunLongestSnake = gs.snake.length
    gs.wordsByCategory = {}
    gs.inGameDifficulty = null
    prevInGameDiffLevelRef.current = 0

    spawnWord()
    playSound(playStartSound)
    updateUI()
  }, [updateUI, playSound, spawnWord])

  const advanceTutorial = useCallback(() => {
    const ts = tutorialStateRef.current
    if (!ts) return
    const nextStep = ts.currentStep + 1
    if (nextStep >= ts.steps.length) {
      // Tutorial complete
      markTutorialCompleted()
      setTutorialCompleted(true)
      setTutorialActive(false)
      tutorialStateRef.current = null
      tutorialTutorialGameRef.current = false

      // Spawn confetti!
      const confettiColors = ['#60a5fa', '#f59e0b', '#4ade80', '#f472b6', '#a78bfa', '#34d399', '#fbbf24']
      const confetti = tutorialConfettiRef.current
      for (let i = 0; i < 80; i++) {
        confetti.push({
          x: CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 200,
          y: CANVAS_HEIGHT / 2 + (Math.random() - 0.5) * 100,
          vx: (Math.random() - 0.5) * 8,
          vy: -Math.random() * 6 - 2,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          size: 3 + Math.random() * 5,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.3,
          life: 1,
        })
      }
      tutorialConfettiActiveRef.current = true
      setTutorialJustCompleted(true)

      // Clear confetti after 3 seconds
      setTimeout(() => {
        tutorialConfettiActiveRef.current = false
        tutorialConfettiRef.current = []
        setTutorialJustCompleted(false)
      }, 3000)

      // End the tutorial game and return to start screen
      const gs = gameStateRef.current
      gs.gameStarted = false
      gs.gameOver = false
      updateUI()
    } else {
      ts.currentStep = nextStep
      saveTutorialProgress(nextStep)

      // If the next step requires eating a word, set pending flag
      const step = ts.steps[nextStep]
      if (step.action === 'eat_word') {
        tutorialEatWordPendingRef.current = true
      } else {
        tutorialEatWordPendingRef.current = false
      }

      // Force game to be unpaused during tutorial
      const gs = gameStateRef.current
      if (gs.paused) {
        gs.paused = false
        updateUI()
      }
    }
  }, [updateUI])

  const endTutorial = useCallback(() => {
    const gs = gameStateRef.current
    gs.gameStarted = false
    gs.gameOver = false
    tutorialStateRef.current = null
    tutorialTutorialGameRef.current = false
    tutorialEatWordPendingRef.current = false
    setTutorialActive(false)
    updateUI()
  }, [updateUI])

  const handleTutorialReset = useCallback(() => {
    resetTutorialData()
    setTutorialCompleted(false)
  }, [])

  // Tutorial keyboard handler
  const handleTutorialKey = useCallback((e: KeyboardEvent) => {
    const ts = tutorialStateRef.current
    if (!ts || !ts.active) return
    const step = ts.steps[ts.currentStep]

    if (e.key === 'Enter') {
      // Advance non-action steps with Enter
      if (!step.action || step.id === 'complete') {
        advanceTutorial()
      }
      return
    }

    if (step.action === 'move_up' && (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W')) {
      // The normal game key handler will process the direction. Just advance after a tick.
      setTimeout(() => advanceTutorial(), 300)
    }
  }, [advanceTutorial])

  // Tutorial key listener
  useEffect(() => {
    if (!tutorialActive) return
    window.addEventListener('keydown', handleTutorialKey)
    return () => window.removeEventListener('keydown', handleTutorialKey)
  }, [tutorialActive, handleTutorialKey])

  // Watch for word eating during tutorial
  const prevWordsEatenRef = useRef(0)
  useEffect(() => {
    if (!tutorialActive) {
      prevWordsEatenRef.current = 0
      return
    }
    const gs = gameStateRef.current
    if (tutorialEatWordPendingRef.current && gs.wordsEaten > prevWordsEatenRef.current) {
      tutorialEatWordPendingRef.current = false
      setTimeout(() => advanceTutorial(), 500)
    }
    prevWordsEatenRef.current = gs.wordsEaten
  }, [uiState.wordsEaten, tutorialActive, advanceTutorial])

  const wordList = getWordList()
  const totalCount = getTotalCount()

  const changeDifficulty = (diff: 'easy' | 'medium' | 'hard') => {
    const gs = gameStateRef.current
    if (gs.gameStarted && !gs.gameOver) return
    gs.difficulty = diff
    // Update best score for the new difficulty
    const diffBest = getBestScore(diff)
    setHighScore(diffBest)
    playSound(playClickSound)
    updateUI()
  }

  const toggleSound = () => {
    const gs = gameStateRef.current
    gs.soundEnabled = !gs.soundEnabled
    updateUI()
  }

  const toggleMiniMap = () => {
    const gs = gameStateRef.current
    gs.showMiniMap = !gs.showMiniMap
    try {
      localStorage.setItem('word-snake-minimap', String(gs.showMiniMap))
    } catch { /* ignore */ }
    updateUI()
  }

  const toggleCategory = (cat: WordCategory) => {
    const gs = gameStateRef.current
    if (gs.gameStarted && !gs.gameOver) return
    const current = gs.activeCategories
    if (current.size <= 1 && current.has(cat)) return
    if (current.has(cat)) {
      current.delete(cat)
    } else {
      current.add(cat)
    }
    saveActiveCategories(current)
    playSound(playClickSound)
    updateUI()
  }

  const toggleAllCategories = () => {
    const gs = gameStateRef.current
    if (gs.gameStarted && !gs.gameOver) return
    const current = gs.activeCategories
    if (current.size === ALL_CATEGORIES.length) {
      gs.activeCategories = new Set([ALL_CATEGORIES[0]])
    } else {
      gs.activeCategories = new Set(ALL_CATEGORIES)
    }
    saveActiveCategories(gs.activeCategories)
    playSound(playClickSound)
    updateUI()
  }

  const handleDailyChallenge = () => {
    playSound(playClickSound)
    resetGame(true)
  }

  // Replay playback functions
  const loadAndPlayReplay = useCallback((replay: GameReplay) => {
    const gs = gameStateRef.current
    // Set up game state for replay
    gs.snake = replay.frames[0]?.snake.map(s => ({ x: s.x, y: s.y })) ?? [{ x: 5, y: 12 }, { x: 4, y: 12 }, { x: 3, y: 12 }]
    gs.direction = replay.frames[0]?.direction ?? 'RIGHT'
    gs.gameStarted = true
    gs.gameOver = false
    gs.paused = false
    gs.score = 0
    gs.wordsEaten = 0
    gs.wordFood = null
    gs.powerUp = null
    gs.activePowerUps = []
    gs.comboCount = 0
    gs.comboMultiplier = 1
    gs.weather = replay.weather as GameState['weather']
    weatherParticlesRef.current = []
    pvpRef.current = null
    // Clear tutorial, speed run
    gs.isSpeedRun = false
    gs.isDailyChallenge = false

    setReplayMode(true)
    setReplaySpeed(1)
    setReplayPaused(false)
    setReplayProgress(0)
    setReplayFrame(replay.frames[0] ?? null)
    startPlayback(replay, 1)
    updateUI()
    toast({ title: 'Replay Started', description: `Watching ${replay.difficulty} game — ${replay.finalScore} pts`, variant: 'default' })
  }, [updateUI])

  const exitReplayMode = useCallback(() => {
    stopPlayback()
    setReplayMode(false)
    setReplayPaused(false)
    setReplayProgress(0)
    setReplayFrame(null)
    const gs = gameStateRef.current
    gs.gameStarted = false
    gs.gameOver = false
    gs.paused = false
    updateUI()
  }, [updateUI])

  // Replay playback loop - advance frames
  useEffect(() => {
    if (!replayMode || replayPaused) return
    const interval = setInterval(() => {
      const frame = advancePlayback()
      if (!frame) {
        setReplayMode(false)
        stopPlayback()
        const gs = gameStateRef.current
        gs.gameStarted = false
        updateUI()
        return
      }
      const gs = gameStateRef.current
      gs.snake = frame.snake.map(s => ({ x: s.x, y: s.y }))
      gs.direction = frame.direction as Direction
      gs.score = frame.score
      gs.comboCount = frame.comboCount
      gs.wordsEaten = frame.wordsEaten.length
      if (frame.food) {
        gs.wordFood = { word: frame.food.word, position: { x: frame.food.x, y: frame.food.y }, category: 'nature', rarity: 'common' }
      } else {
        gs.wordFood = null
      }
      if (frame.powerUp) {
        gs.powerUp = { type: frame.powerUp.type as PowerUpType, position: { x: frame.powerUp.x, y: frame.powerUp.y }, spawnTime: Date.now() }
      } else {
        gs.powerUp = null
      }
      setReplayFrame(frame)
      setReplayProgress(getPlaybackProgress())
      updateUI()
    }, 60 / replaySpeed) // Base 60ms per frame, adjusted by speed
    return () => clearInterval(interval)
  }, [replayMode, replayPaused, replaySpeed, updateUI])

  // Streak display data
  const streakDisplay = streakInfo && streakInfo.currentStreak > 0
    ? getActiveStreakBonus(streakInfo.currentStreak)
    : null

  // Score progress to next difficulty threshold
  const scoreProgress = (() => {
    const thresholds = [
      { score: DIFFICULTY_THRESHOLDS.hard, label: 'Hard' },
      { score: DIFFICULTY_THRESHOLDS.medium, label: 'Medium' },
      { score: DIFFICULTY_THRESHOLDS.easy, label: 'Easy' },
    ]
    const next = thresholds.find((t) => uiState.score < t.score)
    if (!next) return { percent: 100, label: 'Max' }
    const prev = thresholds.find((t) => t.score < next.score)
    const base = prev ? prev.score : 0
    const range = next.score - base
    const current = uiState.score - base
    return { percent: Math.min(100, Math.round((current / range) * 100)), label: next.label }
  })()

  // Round 44: Live HUD Overlay — WPM, efficiency, score trend
  const LiveHudOverlay = () => {
    try {
      const hud = realtimeDashboardRef.current.getLiveHudData()
      const trend = realtimeDashboardRef.current.getScoreTrend()
      const trendArrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'
      const trendColor = trend === 'up' ? '#4ade80' : trend === 'down' ? '#f87171' : '#94a3b8'
      return (
        <div className="flex items-center gap-2 text-[8px] text-slate-400">
          <span title="Words per minute">⚡{hud.wordsPerMinute.toFixed(1)}/min</span>
          <span className="text-slate-700">|</span>
          <span title="Points efficiency">💎{hud.efficiency.toFixed(0)}/min</span>
          <span className="text-slate-700">|</span>
          <span title="Score trend" style={{ color: trendColor }}>{trendArrow}</span>
        </div>
      )
    } catch {
      return null
    }
  }

  // Round 44: Enhanced Mastery Section — closest to level-up, weak categories, session summary
  const MasteryEnhancedSection = () => {
    try {
      const closest = masteryPanelWireRef.current.getWordsClosestToLevelUp(3)
      const weakCats = masteryPanelWireRef.current.getWeakCategories()
      const sessionSummary = masteryPanelWireRef.current.getSessionSummary()
      return (
        <div className="mt-2 border-t border-orange-800/20 pt-2">
          {/* Closest to Level-Up */}
          {closest.length > 0 && (
            <div className="mb-2">
              <div className="text-[7px] text-slate-500 mb-1">📈 Closest to Level-Up</div>
              {closest.map((w, i) => (
                <div key={i} className="flex items-center gap-1 mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-[7px] text-slate-300 truncate max-w-[80px]">{w.word}</span>
                      <span className="text-[6px] text-slate-500">{w.currentLevel}→{w.nextLevel}</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${w.progress}%`, backgroundColor: '#f59e0b' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Weak Categories */}
          {weakCats.length > 0 && (
            <div className="mb-2">
              <div className="text-[7px] text-slate-500 mb-1">⚠️ Weak Categories</div>
              {weakCats.slice(0, 2).map((wc, i) => (
                <div key={i} className="text-[7px] text-amber-400/80 mb-0.5">
                  {wc.category}: {Math.round(wc.avgProgress)}% — {wc.suggestion}
                </div>
              ))}
            </div>
          )}
          {/* Session Stats */}
          <div className="grid grid-cols-3 gap-1">
            <div className="text-center p-0.5 rounded bg-orange-900/15">
              <div className="text-[6px] text-slate-600">Velocity</div>
              <div className="text-[8px] text-orange-300">{sessionSummary.masteryVelocity.toFixed(1)}/min</div>
            </div>
            <div className="text-center p-0.5 rounded bg-orange-900/15">
              <div className="text-[6px] text-slate-600">Level-Ups</div>
              <div className="text-[8px] text-emerald-400">{sessionSummary.levelUps}</div>
            </div>
            <div className="text-center p-0.5 rounded bg-orange-900/15">
              <div className="text-[6px] text-slate-600">WPM</div>
              <div className="text-[8px] text-sky-300">{sessionSummary.wordsPerMinute.toFixed(1)}</div>
            </div>
          </div>
        </div>
      )
    } catch {
      return null
    }
  }

  // Round 44: Enhanced Score Breakdown — category contribution, combo analysis
  const ScoreBreakdownEnhancedSection = () => {
    try {
      const catContrib = getCategoryContribution(scoreBreakdown)
      const comboAnalysis = getComboAnalysis(scoreBreakdown)
      return (
        <div className="mt-2 border-t border-rose-800/20 pt-2">
          {/* Category contribution bars */}
          <div className="text-[7px] text-slate-500 mb-1">📊 By Category</div>
          {catContrib.slice(0, 4).map((cc, i) => (
            <div key={i} className="flex items-center gap-1 mb-0.5">
              <span className="text-[6px] text-slate-400 w-14 truncate">{cc.category}</span>
              <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-rose-500 to-pink-500" style={{ width: `${Math.min(100, cc.percentage * 2)}%` }} />
              </div>
              <span className="text-[6px] text-rose-400 w-8 text-right">{Math.round(cc.percentage)}%</span>
            </div>
          ))}
          {/* Combo analysis */}
          {comboAnalysis && (
            <div className="mt-1.5 grid grid-cols-3 gap-1">
              <div className="text-center p-0.5 rounded bg-rose-900/15">
                <div className="text-[6px] text-slate-600">Avg Combo</div>
                <div className="text-[8px] text-rose-300">{comboAnalysis.avgComboSize?.toFixed(1) ?? '-'}</div>
              </div>
              <div className="text-center p-0.5 rounded bg-rose-900/15">
                <div className="text-[6px] text-slate-600">Max Combo</div>
                <div className="text-[8px] text-amber-400">{comboAnalysis.maxCombo ?? '-'}</div>
              </div>
              <div className="text-center p-0.5 rounded bg-rose-900/15">
                <div className="text-[6px] text-slate-600">Words</div>
                <div className="text-[8px] text-sky-300">{comboAnalysis.totalCombos ?? scoreBreakdown.entries.length}</div>
              </div>
            </div>
          )}
        </div>
      )
    } catch {
      return null
    }
  }

  // Round 44: Calendar Heatmap + Monthly Trends
  const CalendarEnhancedSection = () => {
    try {
      const heatmap = getHeatmapData()
      const monthlyRates = getCompletionRateByMonth(new Date().getFullYear())
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      const currentMonth = new Date().getMonth()
      return (
        <div className="mt-2 border-t border-sky-800/20 pt-2">
          {/* Heatmap */}
          <div className="text-[7px] text-slate-500 mb-1">🔥 90-Day Activity</div>
          <div className="grid grid-cols-15 gap-px">
            {heatmap.map((entry, i) => (
              <div
                key={i}
                title={`${entry.date}: ${entry.intensity > 0 ? entry.intensity + '★' : 'No play'}`}
                className="w-1 h-1.5 rounded-sm"
                style={{
                  backgroundColor: entry.intensity === 0 ? 'rgba(51,65,85,0.3)' : entry.intensity === 1 ? 'rgba(14,165,233,0.4)' : entry.intensity === 2 ? 'rgba(14,165,233,0.6)' : entry.intensity === 3 ? 'rgba(14,165,233,0.8)' : 'rgba(251,191,36,0.9)',
                }}
              />
            ))}
          </div>
          {/* Monthly Trends */}
          <div className="text-[7px] text-slate-500 mt-1.5 mb-1">📈 Monthly Completion ({new Date().getFullYear()})</div>
          <div className="flex items-end gap-0.5 h-6">
            {months.map((m, i) => {
              const rate = monthlyRates[i] ?? 0
              const isCurrentMonth = i === currentMonth
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className="w-full rounded-t-sm transition-all duration-300"
                    style={{
                      height: `${Math.max(2, rate * 24)}px`,
                      backgroundColor: isCurrentMonth ? '#0ea5e9' : rate > 0 ? 'rgba(14,165,233,0.5)' : 'rgba(51,65,85,0.3)',
                    }}
                    title={`${m}: ${Math.round(rate * 100)}%`}
                  />
                  {i % 3 === 0 && <span className="text-[4px] text-slate-600">{m}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )
    } catch {
      return null
    }
  }

  // Round 44: Real-time Quick Stats bar in sidebar header area
  const RealtimeQuickStatsBar = () => {
    try {
      const stats = realtimeDashboardRef.current.getRealtimeQuickStats()
      return (
        <div className="flex items-center justify-center gap-3 text-[7px] text-slate-500 py-1">
          <span title="Games played">🎮 {stats.gamesPlayed}</span>
          <span title="Total score">⭐ {stats.totalScore > 999 ? `${(stats.totalScore / 1000).toFixed(1)}k` : stats.totalScore}</span>
          <span title="Best score" className="text-amber-400">🏆 {stats.bestScore}</span>
          <span title="Streak">🔥 {stats.currentStreak}d</span>
        </div>
      )
    } catch {
      return null
    }
  }

  // Round 43b: Story Level Select inline content
  // ── Round 46: Word Dictionary Panel ──
  const DictionaryPanelContent = () => {
    try {
      const wotd = getWordOfTheDay()
      const stats = getDictionaryStats()
      const recent = getRecentLookups(5)
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-800/50 rounded-lg p-2 text-center dict-stat-cell">
              <div className="text-sm font-bold text-indigo-400">{stats.totalWords}</div>
              <div className="text-[9px] text-slate-500">Words</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center dict-stat-cell">
              <div className="text-sm font-bold text-emerald-400">{stats.totalCategories}</div>
              <div className="text-[9px] text-slate-500">Categories</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center dict-stat-cell">
              <div className="text-sm font-bold text-pink-400">{stats.totalFavorites}</div>
              <div className="text-[9px] text-slate-500">Favorites</div>
            </div>
          </div>
          {wotd && (
            <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg p-3 border border-indigo-700/30">
              <div className="text-[9px] text-indigo-400 mb-1">Word of the Day</div>
              <div className="text-lg font-bold text-white">{wotd.word}</div>
              {wotd.definition && <div className="text-[10px] text-slate-400 mt-1">{wotd.definition}</div>}
              <div className="flex gap-2 mt-2">
                <button onClick={() => dictSpeakWord(wotd.word)} className="text-[9px] px-2 py-0.5 rounded bg-indigo-800/50 text-indigo-300 hover:bg-indigo-700/50">🔊 Speak</button>
                <button onClick={() => dictToggleFavorite(wotd.word)} className="text-[9px] px-2 py-0.5 rounded bg-pink-800/50 text-pink-300 hover:bg-pink-700/50">{wotd.isFavorite ? '💛 Favorited' : '🤍 Favorite'}</button>
              </div>
            </div>
          )}
          {recent.length > 0 && (
            <div className="bg-slate-800/40 rounded-lg p-2.5">
              <div className="text-[9px] text-slate-500 mb-2">Recent Lookups</div>
              <div className="space-y-1">
                {recent.map((r: { word: string; timestamp: number }, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] text-slate-400 dict-recent-item">
                    <span className="text-indigo-400">{r.word}</span>
                    <span className="text-[8px] text-slate-600 ml-auto">{new Date(r.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    } catch { return <div className="text-xs text-slate-500">Unable to load dictionary</div> }
  }

  // ── Round 46: Stats Export Panel ──
  const StatsExportPanelContent = () => {
    try {
      const summary = getExportSummary()
      const shareResult = wireGenShareText()
      const sessionReport = generateSessionReport()
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800/50 rounded-lg p-2 text-center export-stat-cell">
              <div className="text-sm font-bold text-emerald-400">{summary.data?.totalExports ?? 0}</div>
              <div className="text-[9px] text-slate-500">Exports</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center export-stat-cell">
              <div className="text-sm font-bold text-cyan-400">{summary.data?.mostCommonFormat ?? 'N/A'}</div>
              <div className="text-[9px] text-slate-500">Top Format</div>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="text-[9px] text-slate-500 mb-1">Quick Export</div>
            {(['json','csv','markdown','clipboard'] as const).map(fmt => (
              <button key={fmt} onClick={() => wireQuickExport(fmt)} className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-700/50 text-[10px] text-slate-300 transition-colors export-format-btn">
                {fmt === 'json' && '📊 JSON'}{fmt === 'csv' && '📋 CSV'}{fmt === 'markdown' && '📝 Markdown'}{fmt === 'clipboard' && '📋 Copy to Clipboard'}
              </button>
            ))}
          </div>
          {shareResult.success && shareResult.data && (
            <div className="bg-slate-800/40 rounded-lg p-2.5 border border-emerald-700/20">
              <div className="text-[9px] text-slate-500 mb-1">Shareable Summary</div>
              <div className="text-[10px] text-slate-300 whitespace-pre-line">{shareResult.data.substring(0, 200)}...</div>
            </div>
          )}
        </div>
      )
    } catch { return <div className="text-xs text-slate-500">Unable to load export data</div> }
  }

  // ── Round 46: Replay Sharing Panel ──
  const ReplaySharePanelContent = () => {
    try {
      const replays = getShareableReplays().slice(0, 5)
      const leaderboard = getReplayLeaderboard()
      const history = getShareHistory()
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-800/50 rounded-lg p-2 text-center share-stat-cell">
              <div className="text-sm font-bold text-violet-400">{replays.length}</div>
              <div className="text-[9px] text-slate-500">Replays</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center share-stat-cell">
              <div className="text-sm font-bold text-amber-400">{leaderboard.length > 0 ? leaderboard[0].score : 0}</div>
              <div className="text-[9px] text-slate-500">Best</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center share-stat-cell">
              <div className="text-sm font-bold text-cyan-400">{history.length}</div>
              <div className="text-[9px] text-slate-500">Shared</div>
            </div>
          </div>
          {leaderboard.length > 0 && (
            <div className="bg-slate-800/40 rounded-lg p-2.5">
              <div className="text-[9px] text-slate-500 mb-2">Replay Leaderboard</div>
              <div className="space-y-1">
                {leaderboard.slice(0, 3).map((r: { score: number; wordsEaten: number; difficulty: string; date: string }, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] share-leaderboard-item">
                    <span className={`font-bold w-4 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : 'text-orange-400'}`}>#{i+1}</span>
                    <span className="text-slate-300 flex-1">{r.score} pts</span>
                    <span className="text-slate-500">{r.wordsEaten} words</span>
                    <span className="text-[8px] text-slate-600">{r.difficulty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {replays.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[9px] text-slate-500 mb-1">Share Replays</div>
              {replays.slice(0, 3).map((r: { id: string; finalScore: number; duration: number }, i: number) => (
                <div key={r.id} className="flex items-center gap-2 bg-slate-800/30 rounded p-2 share-replay-item">
                  <span className="text-[10px] text-slate-300 flex-1">{r.finalScore} pts • {Math.round(r.duration/1000)}s</span>
                  <button onClick={() => generateShareText(r.id)} className="text-[9px] px-2 py-0.5 rounded bg-violet-800/50 text-violet-300 hover:bg-violet-700/50">Share</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    } catch { return <div className="text-xs text-slate-500">Unable to load replay data</div> }
  }

  // ── Round 46: Poem Studio Panel ──
  const PoemStudioPanelContent = () => {
    try {
      const poemStats = getPoemStats()
      const wordCloud = getWordCloud(8)
      const templates = getStyleTemplates()
      const dailyChallenge = getDailyPoemChallenge()
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-800/50 rounded-lg p-2 text-center poem-stat-cell">
              <div className="text-sm font-bold text-pink-400">{poemStats.totalPoems}</div>
              <div className="text-[9px] text-slate-500">Poems</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center poem-stat-cell">
              <div className="text-sm font-bold text-amber-400">{poemStats.totalFavorites}</div>
              <div className="text-[9px] text-slate-500">Favorites</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center poem-stat-cell">
              <div className="text-sm font-bold text-cyan-400">{poemStats.mostUsedStyle}</div>
              <div className="text-[9px] text-slate-500">Top Style</div>
            </div>
          </div>
          {dailyChallenge && (
            <div className="bg-gradient-to-r from-pink-900/20 to-violet-900/20 rounded-lg p-2.5 border border-pink-700/30">
              <div className="text-[9px] text-pink-400 mb-1">Daily Challenge: {dailyChallenge.theme}</div>
              <div className="text-[10px] text-slate-300">{dailyChallenge.hint}</div>
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {dailyChallenge.words.map((w: string, i: number) => (
                  <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-pink-900/30 text-pink-300">{w}</span>
                ))}
              </div>
            </div>
          )}
          {wordCloud.length > 0 && (
            <div className="bg-slate-800/40 rounded-lg p-2.5">
              <div className="text-[9px] text-slate-500 mb-2">Word Cloud</div>
              <div className="flex flex-wrap gap-1">
                {wordCloud.map((w: { word: string; count: number; tier: string }, i: number) => (
                  <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded poem-cloud-word ${w.tier === 'rare' ? 'bg-pink-900/40 text-pink-300' : w.tier === 'uncommon' ? 'bg-violet-900/40 text-violet-300' : 'bg-slate-700/40 text-slate-400'}`} style={{fontSize: `${Math.min(14, 8 + w.count)}px`}}>{w.word}</span>
                ))}
              </div>
            </div>
          )}
          <div className="bg-slate-800/40 rounded-lg p-2.5">
            <div className="text-[9px] text-slate-500 mb-2">Poem Styles</div>
            <div className="space-y-1">
              {templates.slice(0, 4).map((t: { id: string; name: string; description: string; emoji: string }, i: number) => (
                <div key={t.id} className="flex items-center gap-2 text-[10px] text-slate-400 poem-style-item">
                  <span>{t.emoji}</span>
                  <span className="flex-1">{t.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    } catch { return <div className="text-xs text-slate-500">Unable to load poem data</div> }
  }

  // ── Round 45: XP Progression Panel ──
  const XPProgressionPanelContent = () => {
    try {
      const barData = getXPBarData()
      const breakdown = getXPBarBreakdown()
      const velocity = getXPSessionVelocity()
      const titleProg = getTitleProgress()
      const milestone = getLevelMilestoneReward(barData.level + 1)
      return (
        <div className="space-y-3">
          {/* XP Bar */}
          <div className="bg-slate-800/60 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-cyan-300">Level {barData.level}</span>
              <span className="text-[10px] text-slate-400">{barData.currentXP} / {barData.xpToNextLevel} XP</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700 xp-bar-fill" style={{ width: `${barData.percentage}%` }} />
            </div>
            <div className="text-[10px] text-cyan-400/70 mt-1">{barData.percentage.toFixed(1)}% to next level</div>
          </div>
          {/* Title progress */}
          {titleProg && (
            <div className="bg-slate-800/40 rounded-lg p-2.5 border border-fuchsia-700/30">
              <div className="text-[9px] text-slate-500 mb-1">Next Title</div>
              <div className="text-xs text-fuchsia-300">{titleProg.icon} {titleProg.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{titleProg.progress}</div>
            </div>
          )}
          {/* Milestone reward */}
          {milestone && (
            <div className="bg-slate-800/40 rounded-lg p-2.5 border border-amber-700/30">
              <div className="text-[9px] text-slate-500 mb-1">Level {milestone.level} Milestone</div>
              <div className="text-xs text-amber-300">{milestone.emoji} {milestone.name}</div>
              <div className="text-[10px] text-slate-400">{milestone.description}</div>
            </div>
          )}
          {/* Velocity */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800/40 rounded-lg p-2 text-center xp-velocity-cell">
              <div className="text-sm font-bold text-cyan-400">{velocity.xpPerMinute.toFixed(1)}</div>
              <div className="text-[9px] text-slate-500">XP/min</div>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-2 text-center xp-event-cell">
              <div className="text-sm font-bold text-emerald-400">{velocity.eventCount}</div>
              <div className="text-[9px] text-slate-500">Events</div>
            </div>
          </div>
          {/* XP breakdown */}
          <div className="bg-slate-800/40 rounded-lg p-2.5">
            <div className="text-[9px] text-slate-500 mb-2">XP Breakdown</div>
            {breakdown.categories.map((cat: { category: string; xp: number; percentage: number }) => (
              <div key={cat.category} className="flex items-center gap-2 mb-1.5">
                <div className="flex-1">
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500/60 rounded-full xp-cat-bar" style={{ width: `${cat.percentage}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 min-w-[100px]">
                  <span className="text-[9px] text-slate-400">{cat.category}</span>
                  <span className="text-[9px] text-cyan-300 font-medium">{cat.xp}xp</span>
                </div>
              </div>
            ))}
          </div>
          {/* Est time to next level */}
          <div className="text-center text-[10px] text-slate-500">
            Est. time to next level: {velocity.estimatedMinutesToNextLevel > 0 ? `${Math.ceil(velocity.estimatedMinutesToNextLevel)} min` : 'N/A'}
          </div>
        </div>
      )
    } catch { return <div className="text-xs text-slate-500">Unable to load XP data</div> }
  }

  // ── Round 45: Replay Analyzer Panel ──
  const ReplayAnalyzerPanelContent = () => {
    try {
      const trends = getSessionTrends()
      const weakness = generateWeaknessReport()
      return (
        <div className="space-y-3">
          {/* Session Trends */}
          <div className="bg-slate-800/60 rounded-lg p-3">
            <div className="text-[9px] text-slate-500 mb-2">Session Trends</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-700/40 rounded p-2 text-center replay-trend-cell">
                <div className="text-sm font-bold text-rose-400">{trends.avgScore.toFixed(0)}</div>
                <div className="text-[9px] text-slate-500">Avg Score</div>
              </div>
              <div className="bg-slate-700/40 rounded p-2 text-center replay-trend-cell">
                <div className="text-sm font-bold text-emerald-400">{trends.bestScore}</div>
                <div className="text-[9px] text-slate-500">Best Score</div>
              </div>
              <div className="bg-slate-700/40 rounded p-2 text-center replay-trend-cell">
                <div className="text-sm font-bold text-amber-400">{trends.trendDirection === 'improving' ? '↑' : trends.trendDirection === 'declining' ? '↓' : '→'}</div>
                <div className="text-[9px] text-slate-500">Trend</div>
              </div>
              <div className="bg-slate-700/40 rounded p-2 text-center replay-trend-cell">
                <div className="text-sm font-bold text-cyan-400">{trends.consistencyScore.toFixed(0)}%</div>
                <div className="text-[9px] text-slate-500">Consistency</div>
              </div>
            </div>
          </div>
          {/* Improvement Rate */}
          {trends.improvementRate !== 0 && (
            <div className={`rounded-lg p-2.5 text-center ${trends.improvementRate > 0 ? 'bg-emerald-900/30 border border-emerald-700/30' : 'bg-red-900/30 border border-red-700/30'}`}>
              <span className="text-xs">{trends.improvementRate > 0 ? '📈' : '📉'} Score changing by {Math.abs(trends.improvementRate).toFixed(1)}/game</span>
            </div>
          )}
          {/* Weakness Report */}
          <div className="bg-slate-800/40 rounded-lg p-2.5">
            <div className="text-[9px] text-slate-500 mb-2">Weakness Report</div>
            {weakness.weaknesses.length > 0 ? (
              <div className="space-y-2">
                {weakness.weaknesses.slice(0, 4).map((w: { category: string; severity: string; suggestion: string; evidence: string }, i: number) => (
                  <div key={i} className="bg-slate-700/30 rounded p-2 replay-weakness-card">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-2 h-2 rounded-full ${w.severity === 'high' ? 'bg-red-500' : w.severity === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`} />
                      <span className="text-[10px] font-medium text-slate-300">{w.category}</span>
                    </div>
                    <div className="text-[9px] text-slate-400">{w.suggestion}</div>
                    <div className="text-[8px] text-slate-500 mt-0.5 italic">{w.evidence}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-slate-500 text-center">Play more games to generate analysis</div>
            )}
          </div>
          {/* Replay Count */}
          <div className="text-center text-[10px] text-slate-500">
            Total replays analyzed: {trends.totalGames}
            {trends.currentStreak > 0 && <span className="ml-2 text-emerald-400">Current streak: {trends.currentStreak} games</span>}
          </div>
        </div>
      )
    } catch { return <div className="text-xs text-slate-500">Unable to load replay data</div> }
  }

  // ── Round 45: Achievement Showcase Panel ──
  const AchievementShowcasePanelContent = () => {
    try {
      const showcase = getShowcaseData()
      const stats = getUnlockedStats()
      const recent = getRecentUnlocks(5)
      const closest = getNextClosest(3)
      const categories = getCategorySummary()
      const streak = getUnlockStreak()
      return (
        <div className="space-y-3">
          {/* Stats overview */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-800/50 rounded-lg p-2 text-center ach-stat-cell">
              <div className="text-lg font-bold text-fuchsia-400">{stats.unlocked}</div>
              <div className="text-[9px] text-slate-500">Unlocked</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center ach-stat-cell">
              <div className="text-lg font-bold text-amber-400">{stats.percentage.toFixed(0)}%</div>
              <div className="text-[9px] text-slate-500">Complete</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center ach-stat-cell">
              <div className="text-lg font-bold text-cyan-400">{streak.currentStreak}</div>
              <div className="text-[9px] text-slate-500">Day Streak</div>
            </div>
          </div>
          {/* Recent Unlocks */}
          {recent.length > 0 && (
            <div className="bg-slate-800/40 rounded-lg p-2.5">
              <div className="text-[9px] text-slate-500 mb-2">Recent Unlocks</div>
              <div className="space-y-1.5">
                {recent.map((a: { id: string; emoji: string; name: string; timeAgo: string }, i: number) => (
                  <div key={a.id} className="flex items-center gap-2 bg-slate-700/30 rounded p-1.5 ach-recent-card">
                    <span className="text-base">{a.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-medium text-slate-300 truncate">{a.name}</div>
                      <div className="text-[8px] text-slate-500">{a.timeAgo}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Closest to Unlock */}
          {closest.length > 0 && (
            <div className="bg-slate-800/40 rounded-lg p-2.5">
              <div className="text-[9px] text-slate-500 mb-2">Closest to Unlock</div>
              <div className="space-y-1.5">
                {closest.map((a: { id: string; emoji: string; name: string; rarity: string }, i: number) => (
                  <div key={a.id} className="flex items-center gap-2 bg-slate-700/30 rounded p-1.5 ach-closest-card">
                    <span className="text-base opacity-50">{a.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-slate-400 truncate">{a.name}</div>
                    </div>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded ${a.rarity === 'common' ? 'bg-slate-700 text-slate-400' : a.rarity === 'rare' ? 'bg-blue-900/40 text-blue-300' : a.rarity === 'epic' ? 'bg-purple-900/40 text-purple-300' : 'bg-amber-900/40 text-amber-300'}`}>{a.rarity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Category Summary */}
          <div className="bg-slate-800/40 rounded-lg p-2.5">
            <div className="text-[9px] text-slate-500 mb-2">Categories</div>
            <div className="space-y-1.5">
              {categories.slice(0, 5).map((cat: { category: string; unlocked: number; total: number; percentage: number }, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-400 w-16 truncate">{cat.category}</span>
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-fuchsia-500/60 rounded-full ach-cat-bar" style={{ width: `${cat.percentage}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500">{cat.unlocked}/{cat.total}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Completion forecast */}
          {showcase.forecast && (
            <div className="text-center text-[10px] text-slate-500">
              {showcase.forecast}
            </div>
          )}
        </div>
      )
    } catch { return <div className="text-xs text-slate-500">Unable to load achievement data</div> }
  }

  const StoryLevelSelectContent = () => {
    try {
      const chapters = storyModeWireRef.current.getChapterList()
      const progress = storyModeWireRef.current.getProgress()
      return (
        <div>
          {/* Progress overview */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-amber-400">{progress.totalCoins}</div>
              <div className="text-[9px] text-slate-500">Coins</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-emerald-400">{progress.completedLevels}/{progress.totalLevels}</div>
              <div className="text-[9px] text-slate-500">Levels</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-violet-400">{Math.round(progress.overallProgress)}%</div>
              <div className="text-[9px] text-slate-500">Progress</div>
            </div>
          </div>
          {/* Overall progress bar */}
          <div className="h-2 bg-slate-800 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${progress.overallProgress}%` }} />
          </div>
          {/* Chapters */}
          {chapters.map((ch) => (
            <div key={ch.chapter} className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-300">{ch.emoji} Chapter {ch.chapter}: {ch.title}</h4>
                <span className="text-[9px] text-slate-500">{ch.completedLevels}/{ch.totalLevels}</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full mb-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-300" style={{ width: `${ch.progressPercent}%` }} />
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {ch.levels.map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      if (!lvl.isUnlocked) return
                      const result = storyModeWireRef.current.startLevel(lvl.id)
                      if (result) {
                        setShowStoryLevelSelect(false)
                        resetGame()
                        // Apply level modifiers to game state
                        const gs = gameStateRef.current
                        if (result.gameStateOverrides.speedMultiplier) gs.speed = Math.max(30, gs.speed * (1 / (result.gameStateOverrides.speedMultiplier as number)))
                        if (result.gameStateOverrides.disableObstacles) gs.obstacles = []
                        spawnFloatingText(`🗺️ ${result.level.title}`, CANVAS_WIDTH / 2, 80, '#fbbf24')
                        spawnFloatingText(result.objectiveDescription, CANVAS_WIDTH / 2, 110, '#a3e635')
                      }
                    }}
                    className={`relative p-1.5 rounded-lg border text-center transition-all active:scale-95 ${
                      lvl.isCompleted
                        ? 'border-emerald-600/50 bg-emerald-900/20'
                        : lvl.isUnlocked
                          ? 'border-amber-600/50 bg-amber-900/20 hover:bg-amber-900/40 cursor-pointer'
                          : 'border-slate-700/30 bg-slate-800/20 opacity-50 cursor-not-allowed'
                    }`}
                    title={lvl.subtitle}
                  >
                    <div className="text-[10px] font-bold text-slate-300 truncate">{lvl.title}</div>
                    <div className="flex justify-center gap-0.5 mt-0.5">
                      {[1, 2, 3].map(s => (
                        <span key={s} className={`text-[8px] ${s <= lvl.stars ? 'text-yellow-400' : 'text-slate-700'}`}>★</span>
                      ))}
                    </div>
                    <div className="text-[8px] text-slate-500 mt-0.5 truncate">{lvl.objectivePreview}</div>
                    {!lvl.isUnlocked && <div className="absolute inset-0 flex items-center justify-center text-lg">🔒</div>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    } catch {
      return <div className="text-slate-400 text-xs text-center py-4">Story mode data unavailable</div>
    }
  }

  return (
    <div className={`flex flex-col lg:flex-row gap-4 w-full max-w-[1100px] mx-auto transition-all duration-700 ${nightMode.enabled ? 'night-mode-active' : ''}`}
      style={nightMode.enabled ? { filter: getNightModeFilter(nightMode) } : undefined}
    >
      {/* Color Blind SVG Filter Definitions */}
      <ColorBlindFilterSVG />
      {/* Game Area */}
      <div className="flex-1 min-w-0">
        {/* Aurora background behind card */}
        <div className="relative">
          <div className="absolute -inset-2 aurora-bg rounded-xl pointer-events-none" />
          <Card className="overflow-hidden border-slate-700 bg-slate-900 relative card-shimmer-border card-hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <span className="text-2xl">🐍</span> Word Snake
                  {uiState.isDailyChallenge && uiState.gameStarted && (
                    <Badge className="bg-amber-900/60 text-amber-300 border-amber-700/50 text-xs ml-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      Daily
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Streak indicator */}
                  {streakInfo && streakInfo.currentStreak > 0 && (
                    <div className={`flex items-center gap-1 text-sm float-badge ${streakDisplay ? 'text-amber-400' : 'text-slate-500'} streak-fire`}>
                      <Flame className="h-4 w-4" />
                      <span className="font-bold">{streakInfo.currentStreak}</span>
                    </div>
                  )}
                  {uiState.gameStarted && !uiState.gameOver && (
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <Clock className="h-3 w-3" />
                      <span className="font-mono">{formatTime(uiState.elapsedTime)}</span>
                    </div>
                  )}
                  {/* Speed Run Timer */}
                  {uiState.gameStarted && !uiState.gameOver && uiState.isSpeedRun && (
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${uiState.speedRunTimeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-rose-400'}`}>
                      <Gauge className="h-3 w-3" />
                      <span className="font-mono">{uiState.speedRunTimeLeft}s</span>
                    </div>
                  )}
                  {/* Weather badge pill */}
                  {uiState.gameStarted && !uiState.gameOver && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${WEATHER_CONFIG[uiState.weather].badgeBg} text-slate-300 border border-slate-600/30 ${uiState.weather === 'rain' ? 'weather-badge-rain' : uiState.weather === 'snow' ? 'weather-badge-snow' : uiState.weather === 'stars' ? 'weather-badge-stars' : ''}`}>
                      <span>{WEATHER_CONFIG[uiState.weather].emoji}</span>
                      <span>{WEATHER_CONFIG[uiState.weather].label}</span>
                      {WEATHER_CONFIG[uiState.weather].effect && (
                        <span className="text-slate-400">: {WEATHER_CONFIG[uiState.weather].effect}</span>
                      )}
                    </span>
                  )}
                  {highScore > 0 && (
                    <div className="flex items-center gap-1 text-amber-400 text-sm">
                      <Trophy className="h-4 w-4" />
                      <span>Best ({DIFFICULTY_SETTINGS[uiState.difficulty].label}): {highScore}</span>
                    </div>
                  )}
                  <div className="relative">
                    <Badge key={uiState.score} variant="secondary" className="bg-green-900/50 text-green-400 border-green-700 stat-counter-flash score-milestone-glow">
                      <Zap className="h-3 w-3 mr-1" />
                      {uiState.score}
                    </Badge>
                    {/* Mini progress bar under score badge */}
                    {uiState.gameStarted && !uiState.gameOver && (
                      <div className="absolute -bottom-1.5 left-1 right-1 h-0.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
                          style={{ width: `${scoreProgress.percent}%` }}
                        />
                      </div>
                    )}
                  </div>
                  {/* Coin display */}
                  <span className="text-sm text-amber-400 font-medium">🪙 {uiState.coinBalance}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 header-btn-press"
                    onClick={() => setShowShortcuts(true)}
                    title="Keyboard shortcuts"
                  >
                    <span className="text-sm font-bold">?</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 header-btn-press"
                    onClick={toggleSound}
                    title={uiState.soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
                  >
                    {uiState.soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 w-7 p-0 header-btn-press ${uiState.showMiniMap ? 'text-slate-200' : 'text-slate-500'}`}
                    onClick={toggleMiniMap}
                    title={uiState.showMiniMap ? 'Hide mini-map' : 'Show mini-map'}
                  >
                    <span className="text-sm">🗺️</span>
                  </Button>
                  {/* Night Mode toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 w-7 p-0 header-btn-press ${nightMode.enabled ? 'text-amber-300' : 'text-slate-500'}`}
                    onClick={() => {
                      const updated = { ...nightMode, enabled: !nightMode.enabled }
                      setNightMode(updated)
                      saveNightModeConfig(updated)
                    }}
                    title={nightMode.enabled ? 'Disable Night Mode' : 'Enable Night Mode'}
                  >
                    <Moon className="h-3.5 w-3.5" />
                  </Button>
                  {/* Music control */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 w-7 p-0 header-btn-press music-btn-glow ${musicStatus !== 'stopped' ? 'text-green-400' : 'text-slate-500'}`}
                    onClick={() => {
                      const engine = musicEngineRef.current || getMusicEngine()
                      musicEngineRef.current = engine
                      if (musicStatus === 'playing') {
                        engine.pause()
                        setMusicStatus('paused')
                      } else {
                        engine.play()
                        setMusicStatus('playing')
                      }
                    }}
                    title={musicStatus === 'playing' ? 'Pause music' : musicStatus === 'paused' ? 'Resume music' : 'Play music'}
                  >
                    {musicStatus === 'playing' ? <Music className="h-3.5 w-3.5" /> : <Music4 className="h-3.5 w-3.5" />}
                  </Button>
                  {/* Music style selector */}
                  <select
                    className="h-7 bg-slate-800/80 border border-slate-700/50 rounded text-[10px] text-slate-300 px-1 cursor-pointer header-btn-press focus:outline-none focus:ring-1 focus:ring-green-500/50 music-style-select"
                    value={musicStyle}
                    onChange={(e) => {
                      const style = e.target.value as MusicStyle
                      setMusicStyle(style)
                      const engine = musicEngineRef.current || getMusicEngine()
                      musicEngineRef.current = engine
                      engine.setStyle(style)
                    }}
                    title="Music style"
                  >
                    {Object.entries(MUSIC_STYLES).map(([key, val]) => (
                      <option key={key} value={key}>{val.emoji} {val.label}</option>
                    ))}
                  </select>
                  {/* Volume slider */}
                  <div className="relative flex items-center gap-1">
                    <button
                      onClick={() => {
                        const newConfig = toggleMute(volumeConfig)
                        setVolumeConfig(newConfig)
                        saveVolumeConfig(newConfig)
                        const engine = musicEngineRef.current || getMusicEngine()
                        musicEngineRef.current = engine
                        engine.setVolume(newConfig.muted ? 0 : newConfig.volume)
                      }}
                      className="h-7 w-7 flex items-center justify-center text-sm cursor-pointer hover:bg-slate-700/40 rounded transition-colors volume-mute-btn"
                      title={volumeConfig.muted ? 'Unmute' : 'Mute'}
                    >
                      {volumeConfig.icon}
                    </button>
                    <div
                      className="relative group"
                      onMouseEnter={() => setShowVolumePanel(true)}
                      onMouseLeave={() => setShowVolumePanel(false)}
                    >
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden cursor-pointer volume-slider-track">
                        <div
                          className="h-full rounded-full transition-all duration-150 volume-slider-fill"
                          style={{
                            width: `${(volumeConfig.muted ? 0 : volumeConfig.volume) * 100}%`,
                            background: volumeConfig.muted ? '#64748b' : volumeConfig.volume < 0.3 ? '#22c55e' : volumeConfig.volume < 0.7 ? '#eab308' : '#ef4444',
                          }}
                        />
                      </div>
                      {showVolumePanel && mounted && (
                        <div className="absolute top-full mt-2 right-0 w-52 p-2.5 rounded-lg bg-slate-900/95 border border-slate-700/50 shadow-xl backdrop-blur-sm z-50 volume-panel-popup">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-slate-400 font-medium">Volume Control</span>
                            <span className="text-[10px] text-slate-500">{formatVolumePercent(volumeConfig.muted ? 0 : volumeConfig.volume)}</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={volumeConfig.muted ? 0 : volumeConfig.volume}
                            onChange={(e) => {
                              const vol = parseFloat(e.target.value)
                              const newConfig = { ...volumeConfig, volume: vol, muted: vol === 0, icon: getVolumeIcon(vol, false), label: getVolumeLabel(vol) }
                              setVolumeConfig(newConfig)
                              saveVolumeConfig(newConfig)
                              const engine = musicEngineRef.current || getMusicEngine()
                              musicEngineRef.current = engine
                              engine.setVolume(vol)
                            }}
                            className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer volume-range-input"
                          />
                          <div className="text-[9px] text-slate-500 mt-1">{volumeConfig.label}</div>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {VOLUME_PRESETS.map((preset, i) => (
                              <button
                                key={preset.name}
                                onClick={() => {
                                  const newConfig = snapToPreset(volumeConfig, i)
                                  setVolumeConfig(newConfig)
                                  saveVolumeConfig(newConfig)
                                  const engine = musicEngineRef.current || getMusicEngine()
                                  musicEngineRef.current = engine
                                  engine.setVolume(newConfig.volume)
                                }}
                                className={`px-2 py-0.5 text-[8px] rounded-full border transition-all duration-150 active:scale-90 volume-preset-btn ${
                                  Math.abs((volumeConfig.muted ? 0 : volumeConfig.volume) - preset.volume) < 0.08
                                    ? 'bg-slate-600/60 text-slate-100 border-slate-400/50'
                                    : 'bg-slate-800/60 text-slate-400 border-slate-700/30 hover:text-slate-200 hover:border-slate-600/50'
                                }`}
                              >
                                {preset.emoji} {preset.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* SFX volume button */}
                <div className="relative">
                  <button
                    onClick={() => setShowSfxPanel(!showSfxPanel)}
                    className="h-7 w-7 flex items-center justify-center text-sm cursor-pointer hover:bg-slate-700/40 rounded transition-colors sfx-mixer-btn"
                    title="Sound Effects Mixer"
                  >
                    {sfxConfig.muted ? '🔇' : getSfxIcon(sfxConfig.volume, false)}
                  </button>
                  {showSfxPanel && mounted && (
                    <div className="absolute top-full mt-2 right-0 w-56 p-2.5 rounded-lg bg-slate-900/95 border border-slate-700/50 shadow-xl backdrop-blur-sm z-50 sfx-mixer-popup">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-slate-400 font-medium">SFX Mixer</span>
                        <span className="text-[10px] text-slate-500">{formatSfxPercent(sfxConfig.muted ? 0 : sfxConfig.volume)}</span>
                      </div>
                      {/* Master SFX volume */}
                      <div className="mb-2">
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={sfxConfig.muted ? 0 : sfxConfig.volume}
                          onChange={(e) => {
                            const vol = parseFloat(e.target.value)
                            const newConfig = setSfxMasterVolume(sfxConfig, vol)
                            setSfxConfig(newConfig)
                            saveSfxConfig(newConfig)
                          }}
                          className="w-full h-1 bg-slate-700 rounded-full appearance-none cursor-pointer sfx-master-range"
                        />
                      </div>
                      {/* Category volumes */}
                      <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
                        {(Object.entries(SFX_CATEGORY_DEFAULTS) as [SfxCategory, typeof SFX_CATEGORY_DEFAULTS[SfxCategory]][]).map(([cat, def]) => (
                          <div key={cat} className="flex items-center gap-1.5">
                            <span className="text-[9px] w-4 text-center">{def.emoji}</span>
                            <span className="text-[8px] text-slate-500 w-14 truncate">{def.label}</span>
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.05}
                              value={sfxConfig.categories[cat] ?? def.defaultVolume}
                              onChange={(e) => {
                                const vol = parseFloat(e.target.value)
                                const newConfig = setSfxCategoryVolume(sfxConfig, cat, vol)
                                setSfxConfig(newConfig)
                                saveSfxConfig(newConfig)
                              }}
                              className="flex-1 h-0.5 bg-slate-700 rounded-full appearance-none cursor-pointer sfx-category-range"
                            />
                          </div>
                        ))}
                      </div>
                      {/* Presets */}
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {SFX_MIXER_PRESETS.map((preset, i) => (
                          <button
                            key={preset.name}
                            onClick={() => {
                              const newConfig = applySfxPreset(sfxConfig, i)
                              setSfxConfig(newConfig)
                              saveSfxConfig(newConfig)
                            }}
                            className="px-1.5 py-0.5 text-[7px] rounded-full border border-slate-700/30 bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-all active:scale-90 sfx-preset-btn"
                          >
                            {preset.emoji} {preset.name}
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            const newConfig = toggleSfxMute(sfxConfig)
                            setSfxConfig(newConfig)
                            saveSfxConfig(newConfig)
                          }}
                          className="px-1.5 py-0.5 text-[7px] rounded-full border border-red-700/30 bg-red-900/30 text-red-400 hover:text-red-300 transition-all active:scale-90 sfx-mute-all-btn"
                        >
                          🔇 Mute All
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              {/* Dynamic Difficulty indicator */}
              {mounted && (
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[10px] text-slate-500">AI Difficulty:</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                    dynDiff.level >= 8 ? 'bg-red-900/40 text-red-400 border border-red-700/40' :
                    dynDiff.level >= 6 ? 'bg-orange-900/40 text-orange-400 border border-orange-700/40' :
                    dynDiff.level >= 4 ? 'bg-amber-900/30 text-amber-300 border border-amber-700/30' :
                    dynDiff.level <= 2 ? 'bg-green-900/40 text-green-400 border border-green-700/40' :
                    'bg-slate-800/40 text-slate-300 border border-slate-700/30'
                  }`}>
                    {dynDiff.emoji} {dynDiff.description}
                  </span>
                  <span className="text-[9px] text-slate-600">Lv.{dynDiff.level}</span>
                </div>
              )}
              {/* AI Difficulty Slider (when AI bot is active) */}
              {aiBotActive && mounted && (
                <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-slate-800/50 to-slate-800/30 border border-slate-600/30 ai-difficulty-panel">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <SlidersHorizontal className="h-3 w-3 text-slate-400" />
                    <span className="text-[10px] text-slate-400 font-medium">Bot Intelligence</span>
                    <span className="text-[9px] font-bold ml-auto" style={{ color: getDifficultyColor(aiDiffLevel) }}>
                      {getDifficultyLabel(aiDiffLevel)} ({Math.round(aiDiffLevel)})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1" max="10" step="0.5"
                    value={aiDiffLevel}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      setAiDiffLevel(val)
                      if (aiDiffSliderRef.current) aiDiffSliderRef.current.setLevel(val)
                    }}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer ai-diff-slider"
                    style={{
                      background: `linear-gradient(to right, ${getDifficultyColor(1)}, ${getDifficultyColor(5)}, ${getDifficultyColor(10)})`,
                    }}
                  />
                  <div className="flex justify-between mt-1 text-[8px] text-slate-600">
                    <span>Beginner</span><span>Grandmaster</span>
                  </div>
                </div>
              )}
              {/* Difficulty selector with colored dots */}
              {(!uiState.gameStarted || uiState.gameOver) && (
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Timer className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs text-slate-500">Difficulty:</span>
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => changeDifficulty(diff)}
                      className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium transition-all duration-200 active:scale-95 ${
                        uiState.difficulty === diff
                          ? diff === 'easy'
                            ? 'bg-green-900/60 text-green-400 border border-green-700/50'
                            : diff === 'medium'
                            ? 'bg-amber-900/60 text-amber-400 border border-amber-700/50'
                            : 'bg-red-900/60 text-red-400 border border-red-700/50'
                          : 'bg-slate-800/60 text-slate-500 border border-slate-700/30 hover:text-slate-300'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_SETTINGS[diff].dotColor} ${uiState.difficulty === diff ? 'opacity-100' : 'opacity-40'}`} />
                      {DIFFICULTY_SETTINGS[diff].label}
                    </button>
                  ))}

                  {/* Daily challenge status */}
                  {dailyInfo.played && dailyInfo.result && (
                    <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
                      ✅ Today&apos;s challenge: {dailyInfo.result.score} pts
                    </span>
                  )}
                </div>
              )}

              {/* Word Pack Selector - horizontal scrollable pills */}
              {(!uiState.gameStarted || uiState.gameOver) && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Package className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-xs text-slate-500 font-medium">Word Pack:</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {/* Default pack */}
                    <button
                      onClick={() => {
                        setActivePack('default')
                        setActiveWordPack('default')
                        playSound(playClickSound)
                      }}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border active:scale-95 ${
                        activeWordPack === 'default'
                          ? 'bg-slate-600/60 text-slate-100 border-slate-400/50 shadow-sm shadow-slate-500/20'
                          : 'bg-slate-800/60 text-slate-400 border-slate-700/30 hover:text-slate-200 hover:border-slate-600/50'
                      }`}
                    >
                      <span>🐍</span>
                      <span>Classic</span>
                      <span className="text-[9px] opacity-60">{WORD_ENTRIES.length}</span>
                    </button>
                    {WORD_PACKS.map((pack) => {
                      const unlocked = unlockedPackIds.includes(pack.id)
                      const isActive = activeWordPack === pack.id
                      return (
                        <button
                          key={pack.id}
                          onClick={() => {
                            if (!unlocked) return
                            setActivePack(pack.id)
                            setActiveWordPack(pack.id)
                            playSound(playClickSound)
                          }}
                          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border active:scale-95 ${
                            isActive && unlocked
                              ? 'text-white shadow-sm word-pack-glow'
                              : unlocked
                                ? 'text-slate-300 border-slate-700/30 hover:border-slate-600/50 hover:text-slate-100'
                                : 'text-slate-600 border-slate-700/20 cursor-not-allowed opacity-60'
                          }`}
                          style={isActive && unlocked ? {
                            backgroundColor: `${pack.color}30`,
                            borderColor: `${pack.color}60`,
                            '--pack-glow': `${pack.color}40`,
                            boxShadow: `0 0 12px ${pack.color}20`,
                          } : unlocked ? {
                            backgroundColor: `${pack.color}10`,
                          } : undefined}
                          title={!unlocked ? pack.unlockLabel : `${pack.name}: ${pack.description} (${pack.words.length} words)`}
                        >
                          <span>{pack.emoji}</span>
                          <span>{pack.name}</span>
                          <span className="text-[9px] opacity-60">{pack.words.length}</span>
                          {!unlocked && <Lock className="h-3 w-3 ml-0.5" />}
                        </button>
                      )
                    })}
                    {/* Seasonal packs */}
                    {getActiveSeasonalPacks().map((spack) => {
                      const isActive = activeWordPack === spack.id
                      return (
                        <button
                          key={spack.id}
                          onClick={() => {
                            setActivePack(spack.id)
                            setActiveWordPack(spack.id)
                            playSound(playClickSound)
                          }}
                          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border active:scale-95 ${
                            isActive
                              ? 'text-white shadow-sm word-pack-glow'
                              : 'text-slate-300 border-slate-700/30 hover:border-slate-600/50 hover:text-slate-100'
                          }`}
                          style={isActive ? {
                            backgroundColor: `${spack.color}30`,
                            borderColor: `${spack.color}60`,
                            '--pack-glow': `${spack.color}40`,
                            boxShadow: `0 0 12px ${spack.color}20`,
                          } : {
                            backgroundColor: `${spack.color}10`,
                          }}
                          title={`${spack.name}: ${spack.description} (${spack.words.length} words)`}
                        >
                          <span>{spack.emoji}</span>
                          <span>{spack.name}</span>
                          <span className="text-[9px] opacity-60">{spack.words.length}</span>
                        </button>
                      )
                    })}
                    {/* Multilingual word source selector */}
                    {mounted && multilingualPacks.filter(p => p.isUnlocked).length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Globe className="h-3 w-3 text-blue-400" />
                          <span className="text-[10px] text-slate-500 font-medium">Language Source:</span>
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {/* None (use default pack) */}
                          <button
                            onClick={() => {
                              setActiveMultilingualPack(null)
                              setActiveWordPack('default')
                              setActivePack('default')
                              if (typeof window !== 'undefined') localStorage.removeItem('wordsnake_active_multilingual_pack')
                              playSound(playClickSound)
                            }}
                            className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all duration-200 border active:scale-95 multi-source-btn ${
                              !activeMultilingualPack
                                ? 'bg-slate-600/60 text-slate-100 border-slate-400/50 shadow-sm'
                                : 'bg-slate-800/60 text-slate-400 border-slate-700/30 hover:text-slate-200'
                            }`}
                          >
                            <span>🐍</span>
                            <span>Default</span>
                          </button>
                          {multilingualPacks.filter(p => p.isUnlocked).map(pack => {
                            const progress = multilingualProgressRef.current[pack.id]
                            const isActive = activeMultilingualPack === pack.id
                            return (
                              <button
                                key={`multi-${pack.id}`}
                                onClick={() => {
                                  setActiveMultilingualPack(pack.id)
                                  setActiveWordPack('default')
                                  setActivePack('default')
                                  if (typeof window !== 'undefined') localStorage.setItem('wordsnake_active_multilingual_pack', pack.id)
                                  playSound(playClickSound)
                                }}
                                className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all duration-200 border active:scale-95 multi-source-btn ${
                                  isActive
                                    ? 'text-white shadow-sm'
                                    : 'border-slate-700/30 hover:border-slate-600/50 hover:text-slate-100'
                                }`}
                                style={isActive ? {
                                  backgroundColor: `${pack.color}30`,
                                  borderColor: `${pack.color}60`,
                                  boxShadow: `0 0 10px ${pack.color}25`,
                                } : {
                                  backgroundColor: `${pack.color}08`,
                                  color: '#94a3b8',
                                }}
                                title={`${pack.flag} ${pack.nativeName}: ${pack.words.length} words${progress ? ` (${progress.collected}/${progress.total})` : ''}`}
                              >
                                <span>{pack.flag}</span>
                                <span>{pack.nativeName}</span>
                                {progress && progress.percent > 0 && (
                                  <span className="text-[8px] opacity-60">{progress.percent}%</span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  {activeWordPack !== 'default' && (() => {
                    const activePack = WORD_PACKS.find(p => p.id === activeWordPack)
                    if (!activePack) return null
                    return (
                      <div className="mt-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r border border-slate-700/30" style={{ backgroundImage: `linear-gradient(to right, ${activePack.color}08, transparent)` }}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{activePack.emoji}</span>
                          <span className="text-xs text-slate-300 font-medium">{activePack.name}</span>
                          <span className="text-[10px] text-slate-500">{activePack.description}</span>
                        </div>
                      </div>
                    )
                  })()}
                  {/* Active multilingual pack indicator */}
                  {activeMultilingualPack && mounted && (() => {
                    const mPack = MULTILINGUAL_PACKS.find(p => p.id === activeMultilingualPack)
                    if (!mPack) return null
                    const progress = multilingualProgressRef.current[activeMultilingualPack]
                    return (
                      <div className="mt-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r border multi-source-indicator" style={{ backgroundImage: `linear-gradient(to right, ${mPack.color}12, transparent)`, borderColor: `${mPack.color}30` }}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{mPack.flag}</span>
                          <span className="text-xs text-slate-300 font-medium">{mPack.nativeName} Mode</span>
                          <span className="text-[10px] text-slate-500">{mPack.words.length} words</span>
                          {progress && (
                            <div className="ml-auto flex items-center gap-1.5">
                              <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full rounded-full multi-source-progress-fill" style={{ width: `${progress.percent}%`, background: mPack.color }} />
                              </div>
                              <span className="text-[9px] text-slate-500">{progress.collected}/{progress.total}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Category Filter - wraps on small screens */}
              {(!uiState.gameStarted || uiState.gameOver) && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <svg className="h-3.5 w-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                    <span className="text-xs text-slate-500 font-medium">Categories:</span>
                    <button
                      onClick={toggleAllCategories}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all duration-200 active:scale-95 ${
                        uiState.activeCategories.size === ALL_CATEGORIES.length
                          ? 'bg-slate-600/60 text-slate-200 border border-slate-500/50'
                          : 'bg-slate-800/40 text-slate-500 border border-slate-700/30 hover:text-slate-300'
                      }`}
                    >
                      All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_CATEGORIES.map((cat) => {
                      const info = getCategoryInfo(cat)
                      const color = CATEGORY_COLORS[cat]
                      const active = uiState.activeCategories.has(cat)
                      const count = getWordCountByCategory(cat)
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`category-bounce flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-all duration-200 border active:scale-95 ${
                            active
                              ? `border-current`
                              : 'bg-slate-800/40 border-slate-700/30 text-slate-500 hover:text-slate-300'
                          }`}
                          style={active ? {
                            backgroundColor: `${color}15`,
                            borderColor: `${color}50`,
                            color: color,
                          } : undefined}
                        >
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 transition-all duration-200 ${active ? 'scale-100' : 'scale-75 opacity-50'}`}
                            style={{ backgroundColor: color }}
                          />
                          {info.label}
                          <span className="text-[9px] opacity-60">({count})</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Trail Selector */}
              {(!uiState.gameStarted || uiState.gameOver) && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-slate-500 font-medium">✨ Trail</span>
                    <span className="text-[10px] text-slate-600">— {getAllTrails().find(t => t.id === activeTrail)?.description ?? 'No trail'}</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {getAllTrails().map((tr) => (
                      <button
                        key={tr.id}
                        onClick={() => {
                          setActiveTrail(tr.id)
                          saveTrail(tr.id)
                          trailParticlesRef.current = []
                          playSound(playClickSound)
                        }}
                        className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200 border-2 active:scale-95 ${
                          activeTrail === tr.id
                            ? 'border-white scale-110 shadow-lg trail-option-glow'
                            : 'border-slate-700/50 hover:border-slate-500/60'
                        }`}
                        style={
                          activeTrail === tr.id
                            ? { '--trail-glow-color': tr.glowColor } as React.CSSProperties
                            : undefined
                        }
                        title={`${tr.name}: ${tr.description}`}
                      >
                        {tr.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Skin Selector */}
              {(!uiState.gameStarted || uiState.gameOver) && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-slate-500 font-medium">🎨 Skins</span>
                    <span className="text-[10px] text-slate-600">— {getSnakeSkin(activeSkin).name}: {getSnakeSkin(activeSkin).description}</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {getAllSkins().map((s) => {
                      const locked = !isSkinUnlocked(s.id)
                      return (
                        <button
                          key={s.id}
                          onClick={() => {
                            if (locked) return
                            setActiveSkin(s.id)
                            gameStateRef.current.activeSkin = s.id
                            saveSnakeSkin(s.id)
                            setSkinBounce(true)
                            setTimeout(() => setSkinBounce(false), 400)
                            updateUI()
                          }}
                          className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200 border-2 ${
                            locked
                              ? 'opacity-40 pointer-events-none border-slate-700/30'
                              : activeSkin === s.id
                                ? 'border-white scale-110 shadow-lg active:scale-95'
                                : 'border-slate-700/50 hover:border-slate-500/60 active:scale-95'
                          } ${!locked && skinBounce && activeSkin === s.id ? 'skin-select-bounce' : ''}`}
                          style={{
                            backgroundColor: s.headColor + '30',
                            boxShadow: !locked && activeSkin === s.id ? `0 0 12px ${s.glowColor}40` : undefined,
                          }}
                          title={locked ? s.unlockLabel ?? 'Locked' : `${s.name}: ${s.description}`}
                        >
                          {s.emoji}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Grid Theme Selector with Preview Canvases */}
              {(!uiState.gameStarted || uiState.gameOver) && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-slate-500 font-medium">🖥️ Theme</span>
                    <span className="text-[10px] text-slate-600">— {getGridTheme(activeGridTheme).name}: {getGridTheme(activeGridTheme).description}</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {getAllGridThemes().map((t) => (
                      <div key={t.id} className="shrink-0">
                        <button
                          onClick={() => {
                            setActiveGridTheme(t.id)
                            gameStateRef.current.gridTheme = t.id
                            saveGridTheme(t.id)
                            setThemeSwitchRipple(true)
                            setTimeout(() => setThemeSwitchRipple(false), 500)
                            updateUI()
                          }}
                          className={`w-[72px] rounded-lg flex flex-col items-center p-1.5 gap-1 transition-all duration-200 border-2 active:scale-95 ${
                            activeGridTheme === t.id
                              ? 'border-white scale-105 shadow-lg grid-theme-badge-glow'
                              : 'border-slate-700/50 hover:border-slate-500/60'
                          } ${themeSwitchRipple && activeGridTheme === t.id ? 'theme-switch-ripple' : ''}`}
                          style={{
                            backgroundColor: t.bgColor + 'cc',
                          }}
                          title={`${t.name}: ${t.description}`}
                        >
                          <span className="text-lg">{t.emoji}</span>
                          <canvas
                            ref={(el) => {
                              if (el) drawThemePreview(el, t)
                            }}
                            width={56}
                            height={28}
                            className="rounded theme-preview-shine"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sound Theme Selector */}
              {(!uiState.gameStarted || uiState.gameOver) && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-slate-500 font-medium">🔊 Sound</span>
                    <span className="text-[10px] text-slate-600">— {getAllSoundThemes().find(s => s.id === activeSoundTheme)?.description ?? 'Default'}</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {getAllSoundThemes().map((st) => (
                      <button
                        key={st.id}
                        onClick={() => {
                          setActiveSoundTheme(st.id)
                          setSoundTheme(st.id)
                          saveSoundTheme(st.id)
                          playThemePreviewSound(st.id)
                          setSoundWavePulse(true)
                          setTimeout(() => setSoundWavePulse(false), 600)
                        }}
                        className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200 border-2 active:scale-95 ${
                          activeSoundTheme === st.id
                            ? 'border-white scale-110 shadow-lg'
                            : 'border-slate-700/50 hover:border-slate-500/60'
                        } ${soundWavePulse && activeSoundTheme === st.id ? 'sound-wave-pulse' : ''}`}
                        style={{
                          backgroundColor: 'rgba(30, 41, 59, 0.6)',
                        }}
                        title={`${st.name}: ${st.description}`}
                      >
                        {st.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Canvas with dramatic border and inner glow */}
              <div className={`relative rounded-lg overflow-hidden ring-1 ring-slate-600/50 ring-offset-1 ring-offset-slate-900 shadow-lg shadow-slate-950/50 canvas-glow-ring ${uiState.gameOver ? 'game-over-shake' : ''} ${(!uiState.gameStarted || uiState.gameOver) ? 'preview-snake-glow' : ''} ${hasActiveEffect('reverse_controls') && uiState.gameStarted && !uiState.gameOver ? 'reverse-controls-indicator ring-2' : ''}`}>
                <div className="absolute inset-0 rounded-lg ring-2 ring-inset ring-green-500/10 pointer-events-none" />
                <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="block w-full h-auto" />

                {/* Word Quiz overlay */}
                {uiState.activeQuiz && !uiState.gameOver && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="quiz-overlay glass-morphism-card rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl shadow-purple-900/30">
                      <div className="text-center mb-4">
                        <span className="text-2xl">🎯</span>
                        <p className="text-purple-300 text-sm mt-1 font-medium shimmer-text">Word Quiz Bonus!</p>
                      </div>
                      {/* Timer bar */}
                      <div className="w-full bg-slate-800 rounded-full overflow-hidden mb-4">
                        <div className="quiz-timer-bar" key={uiState.activeQuiz.expiresAt} />
                      </div>
                      <p className="text-white text-center text-lg mb-5 font-medium leading-relaxed">&quot;{uiState.activeQuiz.definition}&quot;</p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {uiState.activeQuiz.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              const gs = gameStateRef.current
                              const quiz = gs.activeQuiz
                              if (!quiz) return
                              const result = checkAnswer(quiz, opt, quizStreakRef.current)
                              if (result.correct) {
                                quizStreakRef.current++
                                gs.score += result.bonusPoints
                                gs.quizStreak = quizStreakRef.current
                                // Coin reward for quiz correct
                                addCoins(COIN_REWARD.QUIZ_CORRECT, 'quiz_correct')
                                gs.coinBalance = getCoinBalance().coins
                                spawnFloatingText(formatQuizBonus(result.bonusPoints), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#a855f7')
                                spawnParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#a855f7', 20)
                                emitPresetParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'quiz_correct')
                                emitEvent('quiz_correct', `Quiz correct! +${result.bonusPoints} bonus (streak: ${quizStreakRef.current})`, '🎯', '#a855f7')
                              } else {
                                quizStreakRef.current = 0
                                gs.quizStreak = 0
                                spawnFloatingText('✗ Wrong', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#ef4444')
                              }
                              saveQuizResult(result)
                              gs.activeQuiz = null
                              updateUI()
                            }}
                            className="quiz-option bg-slate-800/80 hover:bg-purple-900/60 border border-slate-700 hover:border-purple-500 text-white rounded-xl py-3 px-4 text-center transition-all duration-200 active:scale-95 font-medium"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-5 text-sm">
                        <span className={`${uiState.quizStreak > 0 ? 'streak-fire text-amber-400' : 'text-slate-400'}`}>🔥 Quiz Streak: {uiState.quizStreak}</span>
                        <span className="badge-glow-purple text-purple-300 font-medium">+{uiState.activeQuiz.bonusPoints} pts</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Word Scramble overlay */}
                {uiState.activeScramble && !uiState.gameOver && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="quiz-overlay glass-morphism-card rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl shadow-cyan-900/30">
                      <div className="text-center mb-3">
                        <span className="text-2xl">🔤</span>
                        <p className="text-cyan-300 text-sm mt-1 font-medium shimmer-text">Unscramble the Word!</p>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full overflow-hidden mb-4">
                        <div className="quiz-timer-bar" key={uiState.activeScramble.startedAt} />
                      </div>
                      <p className="text-3xl font-bold text-center text-white tracking-[0.3em] mb-2 font-mono">{uiState.activeScramble.scrambledWord}</p>
                      <p className="text-sm text-slate-400 text-center mb-4">Hint: starts with &quot;{uiState.activeScramble.hint}&quot; · {uiState.activeScramble.maxAttempts - uiState.activeScramble.attempts} attempts left</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={20}
                          placeholder="Type your answer..."
                          className="flex-1 bg-slate-800/80 border border-slate-600 text-white rounded-lg px-4 py-2 text-center font-mono text-lg focus:outline-none focus:border-cyan-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.currentTarget.value.trim()
                              if (!input) return
                              const gs = gameStateRef.current
                              const scramble = gs.activeScramble
                              if (!scramble) return
                              scramble.attempts++
                              if (checkScrambleAnswer(scramble, input)) {
                                const result = getScrambleResult(scramble, true)
                                gs.score += result.bonusPoints
                                addCoins(Math.round(result.bonusPoints / 2), 'scramble_solved')
                                gs.coinBalance = getCoinBalance().coins
                                spawnFloatingText('🔤 +' + result.bonusPoints + ' pts!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#22d3ee')
                                spawnParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#22d3ee', 15)
                                gs.activeScramble = null
                                activeScrambleRef.current = null
                              } else if (scramble.attempts >= scramble.maxAttempts) {
                                getScrambleResult(scramble, false)
                                spawnFloatingText('✗ No attempts left', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#ef4444')
                                gs.activeScramble = null
                                activeScrambleRef.current = null
                              } else {
                                spawnFloatingText('✗ Try again!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#f59e0b')
                              }
                              e.currentTarget.value = ''
                              updateUI()
                            }
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-3 text-sm">
                        <span className="text-slate-400">+{uiState.activeScramble.points * 3} pts bonus</span>
                        <span className="text-cyan-300">{formatCoins(Math.round(uiState.activeScramble.points * 1.5))}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Tutorial overlay panel */}
              {tutorialActive && tutorialStateRef.current && (() => {
                const step = tutorialStateRef.current.steps[tutorialStateRef.current.currentStep]
                if (!step) return null
                return (
                  <div className="mt-3 rounded-lg border border-blue-500/40 bg-gradient-to-r from-blue-950/80 to-slate-900/90 backdrop-blur-sm p-4 shadow-lg shadow-blue-900/20 animate-in fade-in slide-in-from-bottom-2 duration-300 tutorial-spotlight">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 text-2xl">{step.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="text-sm font-bold text-blue-300">{step.title}</h3>
                          <span className="text-[10px] text-blue-400/50 font-mono shrink-0">
                            {tutorialStateRef.current.currentStep + 1}/{tutorialStateRef.current.steps.length}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
                        {step.action && (
                          <p className="text-[10px] text-blue-400/70 mt-1.5 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                            {step.action === 'move_up' && 'Press ↑ or W to try it!'}
                            {step.action === 'eat_word' && 'Move your snake to the glowing word!'}
                          </p>
                        )}
                        {!step.action && (
                          <button
                            onClick={advanceTutorial}
                            className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white active:scale-95 transition-all"
                          >
                            Next <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Step progress dots */}
                    <div className="flex items-center gap-1.5 mt-3">
                      {tutorialStateRef.current.steps.map((s, i) => (
                        <div
                          key={s.id}
                          className={`h-1 rounded-full transition-all duration-300 tutorial-step-progress ${
                            i < tutorialStateRef.current.currentStep
                              ? 'w-4 bg-blue-500'
                              : i === tutorialStateRef.current.currentStep
                              ? 'w-4 bg-blue-400 animate-pulse'
                              : 'w-2 bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Start / Daily buttons - side by side on larger screens */}
              <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                {!uiState.gameStarted && (
                  <>
                    <Button onClick={() => resetGame()} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/30 active:scale-95 transition-transform">
                      <Play className="h-4 w-4 mr-1" /> Start Game
                    </Button>
                    <Button
                      onClick={() => { playSound(playClickSound); startPvP() }}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-900/30 active:scale-95 transition-transform"
                      title="Two snakes, one arena. Keyboard-only (WASD + Arrows)"
                    >
                      ⚔️ PvP Battle
                    </Button>
                    <Button
                      onClick={() => { playSound(playClickSound); startAiBot() }}
                      className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-900/30 active:scale-95 transition-transform"
                      title="Challenge an AI-controlled bot opponent"
                    >
                      <Bot className="h-4 w-4 mr-1" /> vs AI Bot 🤖
                    </Button>
                    <Button
                      onClick={() => { setShowBotSkinSelector(true); playSound(playClickSound) }}
                      variant="outline"
                      className="border-pink-700/50 text-pink-400 hover:bg-pink-900/20 active:scale-95 transition-transform"
                      title="Choose your AI Bot opponent's appearance"
                    >
                      🎨 Bot Skin
                    </Button>
                    {!tutorialCompleted && (
                      <Button
                        onClick={startTutorial}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/30 active:scale-95 transition-transform"
                      >
                        <GraduationCap className="h-4 w-4 mr-1" /> Tutorial
                      </Button>
                    )}
                    <Button
                      onClick={handleDailyChallenge}
                      className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/30 active:scale-95 transition-transform"
                      title={mounted && dailyInfo.challenge ? `${dailyInfo.challenge.category} — ${dailyInfo.challenge.targetScore} pts target` : 'Daily Challenge'}
                    >
                      <Calendar className="h-4 w-4 mr-1" /> Daily Challenge
                    </Button>
                    <Button
                      onClick={() => setShowAchievementGallery(true)}
                      variant="outline"
                      className="border-amber-700/50 text-amber-400 hover:bg-amber-900/20 active:scale-95 transition-transform"
                    >
                      🏆 Achievements
                    </Button>
                    <Button
                      onClick={() => { setShowShop(true); playSound(playClickSound) }}
                      variant="outline"
                      className="border-amber-700/50 text-amber-400 hover:bg-amber-900/20 active:scale-95 transition-transform"
                    >
                      🛒 Shop
                    </Button>
                    <Button
                      onClick={() => setShowGameStats(true)}
                      variant="outline"
                      className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 active:scale-95 transition-transform"
                    >
                      📊 Stats
                    </Button>
                    <Button
                      onClick={() => setShowCustomWords(true)}
                      variant="outline"
                      className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/20 active:scale-95 transition-transform"
                    >
                      ✏️ Words{getCustomWordCount() > 0 && <span className="ml-1 text-[10px] opacity-70">({getCustomWordCount()})</span>}
                    </Button>
                    <Button
                      onClick={() => setShowWordBook(true)}
                      variant="outline"
                      className="border-amber-700/50 text-amber-400 hover:bg-amber-900/20 active:scale-95 transition-transform"
                      title="View your word collection"
                    >
                      📖 Word Book
                    </Button>
                    <Button
                      onClick={() => setShowAchievementProgress(!showAchievementProgress)}
                      variant="outline"
                      className="border-purple-700/50 text-purple-400 hover:bg-purple-900/20 active:scale-95 transition-transform achievement-progress-btn"
                      title="Track achievement progress"
                    >
                      📈 Achievement Progress
                    </Button>
                    <Button
                      onClick={() => setShowAiGenerator(!showAiGenerator)}
                      variant="outline"
                      className="border-cyan-700/50 text-cyan-400 hover:bg-cyan-900/20 active:scale-95 transition-transform ai-generator-btn"
                      title="AI Word Pack Generator"
                    >
                      🤖 AI Word Packs
                    </Button>
                    <Button
                      onClick={() => setShowSavePanel(!showSavePanel)}
                      variant="outline"
                      className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/20 active:scale-95 transition-transform save-panel-btn"
                      title="Save & Load Game State"
                    >
                      💾 Save/Load
                    </Button>
                    <Button
                      onClick={() => setShowA11yPanel(!showA11yPanel)}
                      variant="outline"
                      className="border-blue-700/50 text-blue-400 hover:bg-blue-900/20 active:scale-95 transition-transform a11y-panel-btn"
                      title="Accessibility Settings"
                    >
                      ♿ Accessibility
                    </Button>
                    <Button
                      onClick={() => setShowEventAnalytics(!showEventAnalytics)}
                      variant="outline"
                      className="border-violet-700/50 text-violet-400 hover:bg-violet-900/20 active:scale-95 transition-transform analytics-panel-btn"
                      title="Event Analytics"
                    >
                      📊 Analytics
                    </Button>
                    <Button
                      onClick={() => {
                        setShowPracticeMode(!showPracticeMode)
                        if (!showPracticeMode) { setPracticeHistory(getPracticeHistory()); setPracticeStats(getPracticeStats()) }
                      }}
                      variant="outline"
                      className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/20 active:scale-95 transition-transform practice-btn"
                      title="Practice Mode"
                    >
                      🎓 Practice
                    </Button>
                    <Button
                      onClick={() => setShowSpeedConfig(!showSpeedConfig)}
                      variant="outline"
                      className="border-amber-700/50 text-amber-400 hover:bg-amber-900/20 active:scale-95 transition-transform speed-config-btn"
                      title="Game Speed Configuration"
                    >
                      ⚡ Speed
                    </Button>
                    <Button
                      onClick={() => {
                        setShowCalendarPanel(!showCalendarPanel)
                        if (!showCalendarPanel) { setCalendarMonth(getCalendarForMonth(calendarYear, calendarMonthIdx)); setCalendarStats(getCalendarStats()) }
                      }}
                      variant="outline"
                      className="border-sky-700/50 text-sky-400 hover:bg-sky-900/20 active:scale-95 transition-transform calendar-btn"
                      title="Daily Challenge Calendar"
                    >
                      📅 Calendar
                    </Button>
                    <Button
                      onClick={() => {
                        setShowWordSentences(!showWordSentences)
                        if (!showWordSentences) {
                          const s = getSentenceOfTheDay()
                          setSentenceOfTheDay(s)
                          if (uiStateRef.current.wordFood) setCurrentWordSentence(getRandomSentence(uiStateRef.current.wordFood.word))
                        }
                      }}
                      variant="outline"
                      className="border-pink-700/50 text-pink-400 hover:bg-pink-900/20 active:scale-95 transition-transform sentences-btn"
                      title="Word Context Sentences"
                    >
                      💬 Sentences
                    </Button>
                    <Button
                      onClick={() => {
                        setShowTipsPanel(!showTipsPanel)
                        if (!showTipsPanel) { setTipStats(getTipStats()); setCurrentTip(getNextTip({ score: 0, wordsCollected: 0, comboCount: 0, powerupsActive: [], gameStarted: true, gameOver: false, isDailyChallenge: false, difficulty: 'medium', practiceMode: false, timePlayed: 0 }, tipConfig)) }
                      }}
                      variant="outline"
                      className="border-lime-700/50 text-lime-400 hover:bg-lime-900/20 active:scale-95 transition-transform tips-btn"
                      title="Game Tips"
                    >
                      💡 Tips
                    </Button>
                    {/* Round 45: XP Progression panel button */}
                    <Button
                      onClick={() => setShowXPDetailPanel(!showXPDetailPanel)}
                      variant="outline"
                      className="border-cyan-700/50 text-cyan-400 hover:bg-cyan-900/20 active:scale-95 transition-transform xp-progression-btn"
                      title="XP & Level Progression"
                    >
                      🆙 XP Progress
                    </Button>
                    {/* Round 45: Replay Analyzer panel button */}
                    <Button
                      onClick={() => setShowReplayPanel(!showReplayPanel)}
                      variant="outline"
                      className="border-rose-700/50 text-rose-400 hover:bg-rose-900/20 active:scale-95 transition-transform replay-analyzer-btn"
                      title="Replay Analyzer"
                    >
                      📼 Replay
                    </Button>
                    {/* Round 45: Achievement Showcase panel button */}
                    <Button
                      onClick={() => setShowAchShowcase(!showAchShowcase)}
                      variant="outline"
                      className="border-fuchsia-700/50 text-fuchsia-400 hover:bg-fuchsia-900/20 active:scale-95 transition-transform ach-showcase-btn"
                      title="Achievement Showcase"
                    >
                      🏅 Showcase
                    </Button>
                    {/* Round 46: Dictionary panel button */}
                    <Button
                      onClick={() => setShowDictionaryPanel(!showDictionaryPanel)}
                      variant="outline"
                      className="border-indigo-700/50 text-indigo-400 hover:bg-indigo-900/20 active:scale-95 transition-transform dictionary-btn"
                      title="Word Dictionary"
                    >
                      📖 Dictionary
                    </Button>
                    {/* Round 46: Poem Studio panel button */}
                    <Button
                      onClick={() => setShowPoemStudioPanel(!showPoemStudioPanel)}
                      variant="outline"
                      className="border-pink-700/50 text-pink-400 hover:bg-pink-900/20 active:scale-95 transition-transform poem-studio-btn"
                      title="Poem Studio"
                    >
                      ✨ Poems
                    </Button>
                    {/* Round 46: Stats Export panel button */}
                    <Button
                      onClick={() => setShowStatsExportPanel(!showStatsExportPanel)}
                      variant="outline"
                      className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/20 active:scale-95 transition-transform stats-export-btn"
                      title="Export Stats"
                    >
                      📤 Export
                    </Button>
                    {/* Round 46: Replay Share panel button */}
                    <Button
                      onClick={() => setShowReplaySharePanel(!showReplaySharePanel)}
                      variant="outline"
                      className="border-violet-700/50 text-violet-400 hover:bg-violet-900/20 active:scale-95 transition-transform replay-share-btn"
                      title="Share Replay"
                    >
                      🔗 Share Replay
                    </Button>
                    <Button
                      onClick={() => {
                        setShowMasteryPanel(!showMasteryPanel)
                        if (!showMasteryPanel) setMasteryStats(getMasteryStats())
                      }}
                      variant="outline"
                      className="border-orange-700/50 text-orange-400 hover:bg-orange-900/20 active:scale-95 transition-transform mastery-btn"
                      title="Word Mastery"
                    >
                      🏆 Mastery
                    </Button>
                    <Button
                      onClick={() => setShowExportPanel(!showExportPanel)}
                      variant="outline"
                      className="border-cyan-700/50 text-cyan-400 hover:bg-cyan-900/20 active:scale-95 transition-transform export-btn"
                      title="Export Stats"
                    >
                      📤 Export
                    </Button>
                    <Button
                      onClick={() => {
                        setShowSoundPanel(!showSoundPanel)
                        if (!showSoundPanel) { setSoundPanelConfig(loadPanelConfig()) }
                      }}
                      variant="outline"
                      className="border-fuchsia-700/50 text-fuchsia-400 hover:bg-fuchsia-900/20 active:scale-95 transition-transform sound-panel-btn"
                      title="Sound Settings"
                    >
                      🎵 Sound
                    </Button>
                    <Button
                      onClick={() => { setShowScoreBreakdown(!showScoreBreakdown) }}
                      variant="outline"
                      className="border-rose-700/50 text-rose-400 hover:bg-rose-900/20 active:scale-95 transition-transform breakdown-btn"
                      title="Score Breakdown"
                    >
                      📊 Scores
                    </Button>
                    <Button
                      onClick={() => { setShowModeSelector(!showModeSelector) }}
                      variant="outline"
                      className="border-indigo-700/50 text-indigo-400 hover:bg-indigo-900/20 active:scale-95 transition-transform mode-btn"
                      title="Game Mode Selector"
                    >
                      🎮 Modes
                    </Button>
                    <Button
                      onClick={() => { setShowPlayerProfile(!showPlayerProfile) }}
                      variant="outline"
                      className="border-violet-700/50 text-violet-400 hover:bg-violet-900/20 active:scale-95 transition-transform profile-btn"
                      title="Player Profile"
                    >
                      👤 Profile
                    </Button>
                    {/* Round 37: Mode Engine Button */}
                    <Button
                      onClick={() => { setShowModeEngine(!showModeEngine); setModeDisplayInfo(getModeDisplayInfo(modeEngineRef.current)) }}
                      variant="outline"
                      className="border-cyan-700/50 text-cyan-400 hover:bg-cyan-900/20 active:scale-95 transition-transform mode-engine-btn"
                      title="Mode Engine"
                    >
                      ⚙️ Engine
                    </Button>
                    {/* Round 37: XP Panel Button */}
                    <Button
                      onClick={() => { setShowXPPanel(!showXPPanel); setXPProgress(getXPProgress(xpWireRef.current)) }}
                      variant="outline"
                      className="border-amber-700/50 text-amber-400 hover:bg-amber-900/20 active:scale-95 transition-transform xp-panel-btn"
                      title="XP & Progress"
                    >
                      ✨ XP
                    </Button>
                    {/* Round 37: Notification Settings Button */}
                    <Button
                      onClick={() => { setShowNotifSettings(!showNotifSettings) }}
                      variant="outline"
                      className="border-pink-700/50 text-pink-400 hover:bg-pink-900/20 active:scale-95 transition-transform notif-settings-btn"
                      title="Notification Settings"
                    >
                      🔔 Alerts
                    </Button>
                    {/* Round 38: Battle Pass Button */}
                    <Button
                      onClick={() => { setShowBattlePass(!showBattlePass); setBattlePassSummary(getPassSummary(battlePassRef.current)) }}
                      variant="outline"
                      className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/20 active:scale-95 transition-transform bp-btn"
                      title="Battle Pass"
                    >
                      🏆 Battle Pass
                    </Button>
                    {/* Round 38: Stats Dashboard Button */}
                    <Button
                      onClick={() => { setShowStatsDashboard(!showStatsDashboard) }}
                      variant="outline"
                      className="border-sky-700/50 text-sky-400 hover:bg-sky-900/20 active:scale-95 transition-transform dashboard-btn"
                      title="Stats Dashboard"
                    >
                      📈 Dashboard
                    </Button>
                    {/* Round 38: Collection Album Button */}
                    <Button
                      onClick={() => { setShowCollectionAlbum(!showCollectionAlbum); collectionAlbumRef.current = updateAlbum(collectionAlbumRef.current) }}
                      variant="outline"
                      className="border-orange-700/50 text-orange-400 hover:bg-orange-900/20 active:scale-95 transition-transform album-btn"
                      title="Word Collection Album"
                    >
                      📖 Album
                    </Button>
                    {/* Round 39: Social Share Button */}
                    <Button
                      onClick={() => {
                        const gs = gameStateRef.current
                        const ss = socialShareRef.current
                        const card = ss.generateShareCard('game_result' as ShareType, {
                          score: gs.score,
                          wordsEaten: gs.wordsEaten,
                          combo: gs.comboCount,
                          mode: gs.isDailyChallenge ? 'Daily Challenge' : gs.isSpeedRun ? 'Speed Run' : 'Classic',
                          rating: gs.score >= 10000 ? 'SS' : gs.score >= 5000 ? 'S' : gs.score >= 2500 ? 'A' : gs.score >= 1000 ? 'B' : gs.score >= 500 ? 'C' : 'D',
                          time: gs.elapsedTime,
                        })
                        setShareCardText(card)
                        setShowSocialShare(!showSocialShare)
                      }}
                      variant="outline"
                      className="border-pink-700/50 text-pink-400 hover:bg-pink-900/20 active:scale-95 transition-transform share-btn"
                      title="Social Share"
                    >
                      📤 Share
                    </Button>
                    {/* Round 40: Event Log Button */}
                    <Button
                      onClick={() => { setShowEventLog(!showEventLog); setEventLogEntries(eventLogPanelRef.current.getRecentEntries(20)) }}
                      variant="outline"
                      className="border-indigo-700/50 text-indigo-400 hover:bg-indigo-900/20 active:scale-95 transition-transform event-log-btn"
                      title="Event Log"
                    >
                      📋 Event Log
                    </Button>
                    {/* Round 40: Minigames Button */}
                    <Button
                      onClick={() => setShowMinigames(!showMinigames)}
                      variant="outline"
                      className="border-yellow-700/50 text-yellow-400 hover:bg-yellow-900/20 active:scale-95 transition-transform minigames-btn"
                      title="Mini-Games"
                    >
                      🎮 Mini-Games
                    </Button>
                    {/* Round 47: Game Settings Button */}
                    <Button
                      onClick={() => setShowGameSettingsPanel(!showGameSettingsPanel)}
                      variant="outline"
                      className="border-slate-500/50 text-slate-300 hover:bg-slate-800/40 active:scale-95 transition-transform game-settings-btn"
                      title="Game Settings"
                    >
                      ⚙️ Settings
                    </Button>
                    {/* Round 47: Player Stats Compare Button */}
                    <Button
                      onClick={() => setShowStatsComparePanel(!showStatsComparePanel)}
                      variant="outline"
                      className="border-cyan-600/50 text-cyan-400 hover:bg-cyan-900/20 active:scale-95 transition-transform stats-compare-btn"
                      title="Stats Compare"
                    >
                      📊 Stats Compare
                    </Button>
                    {/* Round 47: Challenge Mode Button */}
                    <Button
                      onClick={() => setShowChallengePanel(!showChallengePanel)}
                      variant="outline"
                      className="border-rose-600/50 text-rose-400 hover:bg-rose-900/20 active:scale-95 transition-transform challenge-mode-btn"
                      title="Challenge Mode"
                    >
                      🎯 Challenges
                    </Button>
                    {/* Round 47: Word Art Gallery Button */}
                    <Button
                      onClick={() => setShowArtGalleryPanel(!showArtGalleryPanel)}
                      variant="outline"
                      className="border-fuchsia-600/50 text-fuchsia-400 hover:bg-fuchsia-900/20 active:scale-95 transition-transform art-gallery-btn"
                      title="Word Art Gallery"
                    >
                      🖼️ Art Gallery
                    </Button>
                    {/* Round 48: Soundtrack Manager Button */}
                    <Button
                      onClick={() => setShowSoundtrackPanel(!showSoundtrackPanel)}
                      variant="outline"
                      className="border-violet-500/50 text-violet-400 hover:bg-violet-900/20 active:scale-95 transition-transform soundtrack-btn"
                      title="Soundtrack Manager"
                    >
                      🎵 Soundtrack
                    </Button>
                    {/* Round 48: Social Feed Button */}
                    <Button
                      onClick={() => setShowSocialFeedPanel(!showSocialFeedPanel)}
                      variant="outline"
                      className="border-sky-500/50 text-sky-400 hover:bg-sky-900/20 active:scale-95 transition-transform social-feed-btn"
                      title="Social Activity Feed"
                    >
                      👥 Social Feed
                    </Button>
                    {/* Round 48: Inventory Button */}
                    <Button
                      onClick={() => setShowInventoryPanel(!showInventoryPanel)}
                      variant="outline"
                      className="border-amber-500/50 text-amber-400 hover:bg-amber-900/20 active:scale-95 transition-transform inventory-btn"
                      title="Inventory"
                    >
                      🎒 Inventory
                    </Button>
                    {/* Round 48: World Map Button */}
                    <Button
                      onClick={() => setShowWorldMapPanel(!showWorldMapPanel)}
                      variant="outline"
                      className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/20 active:scale-95 transition-transform world-map-btn"
                      title="World Map Explorer"
                    >
                      🗺️ World Map
                    </Button>
                    {/* Round 49: Tournament Bracket Button */}
                    <Button
                      onClick={() => setShowTournamentPanel(!showTournamentPanel)}
                      variant="outline"
                      className="border-orange-500/50 text-orange-400 hover:bg-orange-900/20 active:scale-95 transition-transform tournament-btn"
                      title="Tournament Bracket"
                    >
                      🏆 Tournament
                    </Button>
                    {/* Round 49: Word Puzzle Button */}
                    <Button
                      onClick={() => setShowPuzzlePanel(!showPuzzlePanel)}
                      variant="outline"
                      className="border-pink-500/50 text-pink-400 hover:bg-pink-900/20 active:scale-95 transition-transform puzzle-btn"
                      title="Word Puzzles"
                    >
                      🧩 Puzzles
                    </Button>
                    {/* Round 49: Progress Dashboard Button */}
                    <Button
                      onClick={() => setShowProgressDashPanel(!showProgressDashPanel)}
                      variant="outline"
                      className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-900/20 active:scale-95 transition-transform progress-dash-btn"
                      title="Progress Dashboard"
                    >
                      📊 Progress
                    </Button>
                    {/* Round 51: Friend System Button */}
                    <Button
                      onClick={() => setShowFriendsPanel(!showFriendsPanel)}
                      variant="outline"
                      className="border-sky-500/50 text-sky-400 hover:bg-sky-900/20 active:scale-95 transition-transform friends-btn"
                      title="Friends"
                    >
                      👥 Friends
                    </Button>
                    {/* Round 51: Pet Companion Button */}
                    <Button
                      onClick={() => setShowPetPanel(!showPetPanel)}
                      variant="outline"
                      className="border-rose-500/50 text-rose-400 hover:bg-rose-900/20 active:scale-95 transition-transform pet-btn"
                      title="Pet Companion"
                    >
                      🐾 Pet
                    </Button>
                    {/* Round 51: Weather Effects Button */}
                    <Button
                      onClick={() => setShowWeatherPanel(!showWeatherPanel)}
                      variant="outline"
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/20 active:scale-95 transition-transform weather-btn"
                      title="Weather Effects"
                    >
                      🌦️ Weather
                    </Button>
                    {/* Round 51: Trade Market Button */}
                    <Button
                      onClick={() => setShowMarketPanel(!showMarketPanel)}
                      variant="outline"
                      className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-900/20 active:scale-95 transition-transform market-btn"
                      title="Trade Market"
                    >
                      🏪 Market
                    </Button>
                    {/* Round 54: Word Analytics Button */}
                    <Button
                      onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
                      variant="outline"
                      className="border-sky-500/50 text-sky-400 hover:bg-sky-900/20 active:scale-95 transition-transform analytics-btn"
                      title="Word Analytics"
                    >
                      📊 Analytics
                    </Button>
                    {/* Round 54: Color Studio Button */}
                    <Button
                      onClick={() => setShowColorStudioPanel(!showColorStudioPanel)}
                      variant="outline"
                      className="border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-900/20 active:scale-95 transition-transform colorstudio-btn"
                      title="Color Studio"
                    >
                      🎨 Colors
                    </Button>
                    {/* Round 54: Avatar Customizer Button */}
                    <Button
                      onClick={() => setShowAvatarCustomPanel(!showAvatarCustomPanel)}
                      variant="outline"
                      className="border-lime-500/50 text-lime-400 hover:bg-lime-900/20 active:scale-95 transition-transform avatar-btn"
                      title="Avatar Customizer"
                    >
                      🧑‍🎨 Avatar
                    </Button>
                    {/* Round 54: Team System Button */}
                    <Button
                      onClick={() => setShowTeamPanel(!showTeamPanel)}
                      variant="outline"
                      className="border-teal-500/50 text-teal-400 hover:bg-teal-900/20 active:scale-95 transition-transform team-btn"
                      title="Team System"
                    >
                      👥 Team
                    </Button>
                    {/* Round 55: Word Bingo Button */}
                    <Button
                      onClick={() => setShowBingoPanel(!showBingoPanel)}
                      variant="outline"
                      className="border-amber-500/50 text-amber-400 hover:bg-amber-900/20 active:scale-95 transition-transform bingo-btn"
                      title="Word Bingo"
                    >
                      🎲 Bingo
                    </Button>
                    {/* Round 55: Mini Map Button */}
                    <Button
                      onClick={() => setShowMiniMapPanel(!showMiniMapPanel)}
                      variant="outline"
                      className="border-lime-500/50 text-lime-400 hover:bg-lime-900/20 active:scale-95 transition-transform minimap-btn"
                      title="Mini Map"
                    >
                      🗺️ Map
                    </Button>
                    {/* Round 55: Power-Up Factory Button */}
                    <Button
                      onClick={() => setShowFactoryPanel(!showFactoryPanel)}
                      variant="outline"
                      className="border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-900/20 active:scale-95 transition-transform factory-btn"
                      title="Power-Up Factory"
                    >
                      ⚡ Factory
                    </Button>
                    {/* Round 55: Daily Fortune Button */}
                    <Button
                      onClick={() => setShowFortunePanel(!showFortunePanel)}
                      variant="outline"
                      className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-900/20 active:scale-95 transition-transform fortune-btn"
                      title="Daily Fortune"
                    >
                      🔮 Fortune
                    </Button>
                    {/* Round 56: Word Typing Race Button */}
                    <Button
                      onClick={() => { trInit(); setShowTypingRacePanel(!showTypingRacePanel) }}
                      variant="outline"
                      className="border-sky-500/50 text-sky-400 hover:bg-sky-900/20 active:scale-95 transition-transform typingrace-btn"
                      title="Word Typing Race"
                    >
                      ⌨️ Typing
                    </Button>
                    {/* Round 56: Treasure Hunt Button */}
                    <Button
                      onClick={() => { thInit(); setShowTreasureHuntPanel(!showTreasureHuntPanel) }}
                      variant="outline"
                      className="border-orange-500/50 text-orange-400 hover:bg-orange-900/20 active:scale-95 transition-transform treasure-btn"
                      title="Treasure Hunt"
                    >
                      🗿 Treasure
                    </Button>
                    {/* Round 56: Achievement Museum Button */}
                    <Button
                      onClick={() => { msInit(); msRecordVisit(); setShowMuseumPanel(!showMuseumPanel) }}
                      variant="outline"
                      className="border-violet-500/50 text-violet-400 hover:bg-violet-900/20 active:scale-95 transition-transform museum-btn"
                      title="Achievement Museum"
                    >
                      🏛️ Museum
                    </Button>
                    {/* Round 56: Mini Arcade Button */}
                    <Button
                      onClick={() => { arInit(); setShowArcadePanel(!showArcadePanel) }}
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:bg-red-900/20 active:scale-95 transition-transform arcade-btn"
                      title="Mini Arcade"
                    >
                      🎮 Arcade
                    </Button>
                    {/* Round 57: Snake Evolution Button */}
                    <Button
                      onClick={() => setShowEvolutionPanel(!showEvolutionPanel)}
                      variant="outline"
                      className="border-lime-500/50 text-lime-400 hover:bg-lime-900/20 active:scale-95 transition-transform evolution-btn"
                      title="Snake Evolution"
                    >
                      🐍 Evolution
                    </Button>
                    {/* Round 57: Word Alchemy Button */}
                    <Button
                      onClick={() => setShowAlchemyPanel(!showAlchemyPanel)}
                      variant="outline"
                      className="border-amber-500/50 text-amber-400 hover:bg-amber-900/20 active:scale-95 transition-transform alchemy-btn"
                      title="Word Alchemy"
                    >
                      ⚗️ Alchemy
                    </Button>
                    {/* Round 57: Puzzle Dungeon Button */}
                    <Button
                      onClick={() => setShowDungeonPanel(!showDungeonPanel)}
                      variant="outline"
                      className="border-violet-500/50 text-violet-400 hover:bg-violet-900/20 active:scale-95 transition-transform dungeon-btn"
                      title="Puzzle Dungeon"
                    >
                      🏰 Dungeon
                    </Button>
                    {/* Round 57: Guild System Button */}
                    <Button
                      onClick={() => setShowGuildPanel(!showGuildPanel)}
                      variant="outline"
                      className="border-sky-500/50 text-sky-400 hover:bg-sky-900/20 active:scale-95 transition-transform guild-btn"
                      title="Guild System"
                    >
                      🏛️ Guild
                    </Button>
                    {/* Round 58: Gene Lab Button */}
                    <Button
                      onClick={() => setShowGeneLabPanel(!showGeneLabPanel)}
                      variant="outline"
                      className="border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-900/20 active:scale-95 transition-transform genelab-btn"
                      title="Gene Lab"
                    >
                      🧬 Gene Lab
                    </Button>
                    {/* Round 58: Lore Codex Button */}
                    <Button
                      onClick={() => setShowLoreCodexPanel(!showLoreCodexPanel)}
                      variant="outline"
                      className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-900/20 active:scale-95 transition-transform lore-btn"
                      title="Lore Codex"
                    >
                      📜 Lore
                    </Button>
                    {/* Round 58: Target Practice Button */}
                    <Button
                      onClick={() => setShowTargetPracticePanel(!showTargetPracticePanel)}
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:bg-red-900/20 active:scale-95 transition-transform target-btn"
                      title="Target Practice"
                    >
                      🎯 Target
                    </Button>
                    {/* Round 58: Carnival Button */}
                    <Button
                      onClick={() => setShowCarnivalPanel(!showCarnivalPanel)}
                      variant="outline"
                      className="border-pink-500/50 text-pink-400 hover:bg-pink-900/20 active:scale-95 transition-transform carnival-btn"
                      title="Carnival"
                    >
                      🎪 Carnival
                    </Button>
                    {/* Round 59: Robot Factory Button */}
                    <Button
                      onClick={() => setShowRobotFactoryPanel(!showRobotFactoryPanel)}
                      variant="outline"
                      className="border-slate-500/50 text-slate-300 hover:bg-slate-900/20 active:scale-95 transition-transform robot-factory-btn"
                      title="Robot Factory"
                    >
                      🤖 Robots
                    </Button>
                    {/* Round 59: Dream Journal Button */}
                    <Button
                      onClick={() => setShowDreamJournalPanel(!showDreamJournalPanel)}
                      variant="outline"
                      className="border-indigo-500/50 text-indigo-300 hover:bg-indigo-900/20 active:scale-95 transition-transform dream-journal-btn"
                      title="Dream Journal"
                    >
                      💭 Dreams
                    </Button>
                    {/* Round 59: Pixel Art Studio Button */}
                    <Button
                      onClick={() => setShowPixelArtPanel(!showPixelArtPanel)}
                      variant="outline"
                      className="border-fuchsia-500/50 text-fuchsia-300 hover:bg-fuchsia-900/20 active:scale-95 transition-transform pixel-art-btn"
                      title="Pixel Art Studio"
                    >
                      🎨 Pixel Art
                    </Button>
                    {/* Round 59: Island Builder Button */}
                    <Button
                      onClick={() => setShowIslandBuilderPanel(!showIslandBuilderPanel)}
                      variant="outline"
                      className="border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/20 active:scale-95 transition-transform island-builder-btn"
                      title="Island Builder"
                    >
                      🏝️ Island
                    </Button>
                    {/* Round 53: Leaderboard Button */}
                    <Button
                      onClick={() => setShowLeaderboardPanel(!showLeaderboardPanel)}
                      variant="outline"
                      className="border-rose-500/50 text-rose-400 hover:bg-rose-900/20 active:scale-95 transition-transform leaderboard-btn"
                      title="Global Leaderboard"
                    >
                      🏆 Ranks
                    </Button>
                    {/* Round 53: Soundboard Button */}
                    <Button
                      onClick={() => setShowSoundboardPanel(!showSoundboardPanel)}
                      variant="outline"
                      className="border-pink-500/50 text-pink-400 hover:bg-pink-900/20 active:scale-95 transition-transform soundboard-btn"
                      title="Musical Soundboard"
                    >
                      🎵 Sound
                    </Button>
                    {/* Round 53: Mission System Button */}
                    <Button
                      onClick={() => setShowMissionPanel(!showMissionPanel)}
                      variant="outline"
                      className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/20 active:scale-95 transition-transform mission-btn"
                      title="Mission System"
                    >
                      📋 Missions
                    </Button>
                    {/* Round 53: Emote System Button */}
                    <Button
                      onClick={() => setShowEmotePanel(!showEmotePanel)}
                      variant="outline"
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/20 active:scale-95 transition-transform emote-btn"
                      title="Emote System"
                    >
                      😀 Emotes
                    </Button>
                    {/* Round 52: Daily Rewards Button */}
                    <Button
                      onClick={() => setShowDailyRewardPanel(!showDailyRewardPanel)}
                      variant="outline"
                      className="border-orange-500/50 text-orange-400 hover:bg-orange-900/20 active:scale-95 transition-transform reward-btn"
                      title="Daily Rewards"
                    >
                      🎁 Rewards
                    </Button>
                    {/* Round 52: Word Connect Button */}
                    <Button
                      onClick={() => setShowWordConnectPanel(!showWordConnectPanel)}
                      variant="outline"
                      className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-900/20 active:scale-95 transition-transform connect-btn"
                      title="Word Connect"
                    >
                      🔗 Connect
                    </Button>
                    {/* Round 52: Profile Card Button */}
                    <Button
                      onClick={() => setShowProfileCardPanel(!showProfileCardPanel)}
                      variant="outline"
                      className="border-violet-500/50 text-violet-400 hover:bg-violet-900/20 active:scale-95 transition-transform profile-btn"
                      title="Profile Card"
                    >
                      👤 Profile
                    </Button>
                    {/* Round 52: Skill Tree Button */}
                    <Button
                      onClick={() => setShowSkillTreePanel(!showSkillTreePanel)}
                      variant="outline"
                      className="border-amber-500/50 text-amber-400 hover:bg-amber-900/20 active:scale-95 transition-transform skilltree-btn"
                      title="Skill Tree"
                    >
                      🌳 Skills
                    </Button>
                    {/* Round 49: Controller Config Button */}
                    <Button
                      onClick={() => setShowControllerPanel(!showControllerPanel)}
                      variant="outline"
                      className="border-teal-500/50 text-teal-400 hover:bg-teal-900/20 active:scale-95 transition-transform controller-btn"
                      title="Controller Config"
                    >
                      🎮 Controls
                    </Button>
                    <Button
                      onClick={() => resetGame(false, true)}
                      className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/30 active:scale-95 transition-transform"
                      title="60-second timed challenge"
                    >
                      <Gauge className="h-4 w-4 mr-1" /> Speed Run
                    </Button>
                    <Button
                      onClick={() => { setReplayList(getReplays()); setShowReplayDialog(true) }}
                      variant="outline"
                      className="border-purple-700/50 text-purple-400 hover:bg-purple-900/20 active:scale-95 transition-transform"
                    >
                      <Film className="h-4 w-4 mr-1" /> Replays
                    </Button>
                    <Button
                      onClick={() => setShowSettings(true)}
                      variant="outline"
                      className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 active:scale-95 transition-transform"
                    >
                      <Settings className="h-4 w-4 mr-1" /> Settings
                    </Button>
                    <Button
                      onClick={() => { setShowStoryMode(true); playSound(playClickSound) }}
                      variant="outline"
                      className="border-violet-700/50 text-violet-400 hover:bg-violet-900/20 active:scale-95 transition-transform"
                      title="Story Mode Prologue"
                    >
                      📖 Story
                    </Button>
                    {/* Round 43b: Story Level Select Button */}
                    <Button
                      onClick={() => setShowStoryLevelSelect(!showStoryLevelSelect)}
                      variant="outline"
                      className="border-amber-700/50 text-amber-400 hover:bg-amber-900/20 active:scale-95 transition-transform story-level-btn"
                      title="Story Mode — Level Select"
                    >
                      🗺️ Levels
                    </Button>
                    <Button
                      onClick={() => { setShowStatsComparison(true); playSound(playClickSound) }}
                      variant="outline"
                      className="border-teal-700/50 text-teal-400 hover:bg-teal-900/20 active:scale-95 transition-transform"
                      title="Performance Dashboard"
                    >
                      <BarChart3 className="h-4 w-4 mr-1" /> Dashboard
                    </Button>
                    <button
                      onClick={() => {
                        const newConfig = { ...highContrast, enabled: !highContrast.enabled }
                        setHighContrast(newConfig)
                        saveHighContrastConfig(newConfig)
                        playSound(playClickSound)
                      }}
                      className={`p-2 rounded-lg border transition-all active:scale-95 ${highContrast.enabled
                        ? 'border-yellow-500/60 text-yellow-400 bg-yellow-900/30 shadow-lg shadow-yellow-900/20'
                        : 'border-slate-600/50 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                      }`}
                      title="Toggle High Contrast Accessibility"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {tutorialCompleted && (
                      <button
                        onClick={() => { handleTutorialReset(); startTutorial() }}
                        className="text-[10px] text-blue-400/70 hover:text-blue-400 transition-colors underline underline-offset-2"
                      >
                        Replay Tutorial
                      </button>
                    )}
                  </>
                )}
                {uiState.gameStarted && !uiState.gameOver && (
                  <Button onClick={() => { const gs = gameStateRef.current; gs.paused = !gs.paused; playSound(playPauseSound); updateUI() }} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 active:scale-95 transition-transform">
                    {uiState.paused ? <><Play className="h-4 w-4 mr-1" /> Resume</> : <><Pause className="h-4 w-4 mr-1" /> Pause</>}
                  </Button>
                )}
                {uiState.gameOver && (
                  <>
                    <Button onClick={() => resetGame(uiState.isDailyChallenge)} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/30 active:scale-95 transition-transform">
                      <RotateCcw className="h-4 w-4 mr-1" /> Play Again
                    </Button>
                    <Button
                      onClick={() => setShowAchievementGallery(true)}
                      variant="outline"
                      className="border-amber-700/50 text-amber-400 hover:bg-amber-900/20 active:scale-95 transition-transform"
                    >
                      🏆 Achievements
                    </Button>
                    <Button
                      onClick={() => setShowGameStats(true)}
                      variant="outline"
                      className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 active:scale-95 transition-transform"
                    >
                      📊 Stats
                    </Button>
                    <Button
                      onClick={() => setShowCustomWords(true)}
                      variant="outline"
                      className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/20 active:scale-95 transition-transform"
                    >
                      ✏️ Words{getCustomWordCount() > 0 && <span className="ml-1 text-[10px] opacity-70">({getCustomWordCount()})</span>}
                    </Button>
                    <Button
                      onClick={() => {
                        const shareData: ShareCardData = {
                          score: uiState.score,
                          wordsEaten: uiState.wordsEaten,
                          timeElapsed: uiState.elapsedTime,
                          difficulty: uiState.difficulty,
                          maxCombo: dynDiff.level >= 6 ? uiState.comboMultiplier : 1,
                          longestSnake: uiState.isSpeedRun ? dynDiff.level : 0,
                          powerUpsCollected: 0,
                          weather: uiState.weather,
                          isDailyChallenge: uiState.isDailyChallenge,
                          dailyCompleted: false,
                          isSpeedRun: uiState.isSpeedRun,
                          speedRunTimeLeft: uiState.speedRunTimeLeft,
                          wordsByCategory: uiState.wordsByCategory,
                          date: new Date().toISOString(),
                        }
                        downloadShareCard(shareData)
                      }}
                      variant="outline"
                      className="border-purple-600/50 text-purple-400 hover:bg-purple-900/20 active:scale-95 transition-transform"
                      title="Download share card image"
                    >
                      <Share2 className="h-4 w-4 mr-1" /> Share Card
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">↑↓←→</kbd>
                  / WASD
                </span>
                <span>Space - Start/Pause</span>
                <span className="hidden sm:inline">Swipe on mobile</span>
              </div>

              {/* PvP controls legend */}
              {!uiState.gameStarted && (
                <div className="flex items-center justify-center gap-4 mt-1 text-[11px] text-slate-600">
                  <span className="text-cyan-500">⚔️ PvP:</span>
                  <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-green-400 text-[10px] font-mono">WASD</kbd> P1</span>
                  <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-cyan-400 text-[10px] font-mono">↑↓←→</kbd> P2</span>
                  <span className="hidden sm:inline text-slate-700">Keyboard only</span>
                </div>
              )}

              {/* On-screen D-pad for mobile - glass-morphism style */}
              <div id="mobile-dpad" className="flex justify-center mt-3 lg:hidden">
                <div className="grid grid-cols-3 gap-1.5 w-36">
                  <div />
                  <button
                    onTouchStart={(e) => { e.preventDefault(); pushDirection('UP') }}
                    className="glass-dpad h-12 rounded-xl flex items-center justify-center text-slate-300 text-lg select-none transition-transform"
                  >↑</button>
                  <div />
                  <button
                    onTouchStart={(e) => { e.preventDefault(); pushDirection('LEFT') }}
                    className="glass-dpad h-12 rounded-xl flex items-center justify-center text-slate-300 text-lg select-none transition-transform"
                  >←</button>
                  <button
                    onTouchStart={(e) => { e.preventDefault(); const gs = gameStateRef.current; if (!gs.gameStarted || gs.gameOver) { resetGame(gs.isDailyChallenge) } else { gs.paused = !gs.paused; playSound(playPauseSound); updateUI() } }}
                    className="glass-dpad h-12 rounded-xl flex items-center justify-center text-slate-400 text-[10px] select-none transition-transform"
                  >⏸</button>
                  <button
                    onTouchStart={(e) => { e.preventDefault(); pushDirection('RIGHT') }}
                    className="glass-dpad h-12 rounded-xl flex items-center justify-center text-slate-300 text-lg select-none transition-transform"
                  >→</button>
                  <div />
                  <button
                    onTouchStart={(e) => { e.preventDefault(); pushDirection('DOWN') }}
                    className="glass-dpad h-12 rounded-xl flex items-center justify-center text-slate-300 text-lg select-none transition-transform"
                  >↓</button>
                  <div />
                </div>
              </div>

              {/* Mobile sidebar toggle */}
              <div className="flex justify-center mt-2 lg:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-slate-400 hover:text-slate-200 text-xs gap-1 active:scale-95 transition-transform"
                >
                  {sidebarOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {sidebarOpen ? 'Hide Words' : `Show Words (${totalCount})`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Word Collection Sidebar - collapsible on mobile */}
      <div className={`w-full lg:w-72 shrink-0 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
        <Card className="border-slate-700 bg-slate-900 h-full ring-1 ring-slate-700/50">
          {/* Game Event Feed */}
          <div className="border-b border-slate-700/50">
            <div className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors" onClick={() => setShowEventFeed(!showEventFeed)}>
              <div className="flex items-center gap-2">
                <span className="text-sm">📋</span>
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Live Feed</span>
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="bg-slate-800/60 text-slate-400 border-slate-600/30 text-[10px] px-1.5">
                  {eventFeedRef.current.events.length}
                </Badge>
                <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${showEventFeed ? 'rotate-180' : ''}`} />
              </div>
            </div>
            {showEventFeed && (
              <div className="px-3 pb-2 max-h-48 overflow-y-auto scrollbar-thin space-y-0.5">
                {getRecentEvents(eventFeedRef.current, 15).reverse().map((ev, i) => (
                  <div
                    key={ev.id}
                    className={`flex items-start gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-300 ${i === 0 ? 'event-feed-slide bg-slate-800/60' : 'opacity-70'} ${ev.priority === 'critical' ? 'event-feed-critical feed-priority-critical' : ev.priority === 'high' ? 'event-feed-high feed-priority-high' : ''}`}
                  >
                    <span className="text-sm shrink-0 mt-0.5">{ev.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-300 leading-tight truncate" style={{ color: ev.color }}>{ev.message}</p>
                    </div>
                  </div>
                ))}
                {eventFeedRef.current.events.length === 0 && (
                  <p className="text-xs text-slate-600 text-center py-2">No events yet...</p>
                )}
              </div>
            )}
          </div>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-amber-400 text-base flex items-center gap-2">
                📚 Collected Words
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* Round 44: Live HUD Overlay */}
                <LiveHudOverlay />
                <Badge variant="secondary" className="bg-amber-900/50 text-amber-400 border-amber-700 text-xs">
                  {totalCount}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Stats row with gradient backgrounds */}
            {uiState.gameStarted && (
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <div className="px-2 py-1.5 rounded-md bg-gradient-to-br from-green-900/30 to-green-950/20 border border-green-800/30 text-center shadow-inner shadow-green-950/20">
                  <div className="text-green-400 text-xs font-bold">{uiState.wordsEaten}</div>
                  <div className="text-green-600 text-[9px] uppercase tracking-wider">Words</div>
                </div>
                <div className="px-2 py-1.5 rounded-md bg-gradient-to-br from-purple-900/30 to-purple-950/20 border border-purple-800/30 text-center shadow-inner shadow-purple-950/20">
                  <div className="text-purple-400 text-xs font-bold">{uiState.score}</div>
                  <div className="text-purple-600 text-[9px] uppercase tracking-wider">Score</div>
                </div>
                <div className="px-2 py-1.5 rounded-md bg-gradient-to-br from-cyan-900/30 to-cyan-950/20 border border-cyan-800/30 text-center shadow-inner shadow-cyan-950/20">
                  <div className="text-cyan-400 text-xs font-bold">{formatTime(uiState.elapsedTime)}</div>
                  <div className="text-cyan-600 text-[9px] uppercase tracking-wider">Time</div>
                </div>
              </div>
            )}

            {/* Streak bonus indicator */}
            {streakInfo && streakInfo.currentStreak > 0 && (
              <div className="mb-3 px-2.5 py-1.5 rounded-md bg-gradient-to-r from-amber-900/20 to-orange-900/10 border border-amber-800/30 flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-400 shrink-0 streak-fire" />
                <div className="text-xs">
                  <span className="text-amber-300 font-bold streak-fire">{streakInfo.currentStreak}-day streak</span>
                  {streakDisplay && (
                    <span className="text-amber-400/80"> — {streakDisplay.name} (×{streakDisplay.multiplier})</span>
                  )}
                </div>
              </div>
            )}

            {/* Extra life indicator (Silver milestone) */}
            {uiState.extraLifeAvailable && uiState.gameStarted && (
              <div className="mb-3 px-2.5 py-1.5 rounded-md bg-gradient-to-r from-slate-800/40 to-slate-800/20 border border-slate-600/30 flex items-center gap-2">
                <span className="extra-life-shield inline-block text-base">🛡️</span>
                <div className="text-xs">
                  <span className="text-slate-300 font-bold">Extra Life</span>
                  <span className="text-slate-500 ml-1">— Silver milestone</span>
                </div>
              </div>
            )}

            {/* Combo indicator */}
            {uiState.comboCount > 1 && uiState.gameStarted && (
              <div className="mb-2 px-2 py-1.5 rounded-md bg-gradient-to-r from-orange-900/20 to-amber-900/10 border border-amber-700/30 flex items-center gap-2">
                <span className="text-sm">🔥</span>
                <div className="text-xs">
                  <span className="text-amber-300 font-bold">×{uiState.comboMultiplier.toFixed(1)} Combo</span>
                  {uiState.lastEatenCategory && (
                    <span className="text-amber-400/60 ml-1">({uiState.comboCount}× {getCategoryInfo(uiState.lastEatenCategory)?.label ?? PACK_CATEGORY_INFO[uiState.lastEatenCategory]?.label ?? uiState.lastEatenCategory})</span>
                  )}
                </div>
              </div>
            )}

            {/* Active power-ups indicator */}
            {uiState.activePowerUps.length > 0 && uiState.gameStarted && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {uiState.activePowerUps.map((apu, i) => {
                  const config = POWERUP_CONFIG[apu.type]
                  const remaining = apu.expiresAt > 0 ? Math.max(0, Math.ceil((apu.expiresAt - Date.now()) / 1000)) : 0
                  return (
                    <div key={`${apu.type}-${i}`} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs border"
                      style={{ borderColor: `${config.color}40`, backgroundColor: `${config.color}15`, color: config.color }}>
                      <span>{config.emoji}</span>
                      <span className="font-medium">{config.label}</span>
                      {remaining > 0 && <span className="opacity-70">{remaining}s</span>}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Obstacles & Portals indicator */}
            {!uiState.isDailyChallenge && uiState.gameStarted && (uiState.obstacleCount > 0 || uiState.portalCount > 0) && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {uiState.obstacleCount > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md text-xs border"
                    style={{ borderColor: 'rgba(120,113,108,0.4)', backgroundColor: 'rgba(120,113,108,0.15)', color: '#a8a29e' }}>
                    <span>🧱</span>
                    <span className="font-medium">{uiState.obstacleCount} Obstacle{uiState.obstacleCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {uiState.portalCount > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md text-xs border"
                    style={{ borderColor: 'rgba(168,85,247,0.4)', backgroundColor: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>
                    <span>🌀</span>
                    <span className="font-medium">{uiState.portalCount} Portal{uiState.portalCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            )}

            {/* Particle Customization Panel */}
            {mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-purple-900/20 to-slate-800/20 border border-purple-700/20 particle-custom-panel">
                <div className="flex items-center justify-between mb-1.5 cursor-pointer" onClick={() => setShowParticlePanel(!showParticlePanel)}>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-purple-400" />
                    <span className="text-[10px] text-slate-400 font-medium">Particle FX</span>
                  </div>
                  <span className="text-[9px] text-purple-400">{showParticlePanel ? '▲' : '▼'}</span>
                </div>
                {showParticlePanel && (
                  <div className="space-y-2 mt-2 particle-panel-expanded">
                    {/* Size multiplier */}
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-500 w-10">Size</span>
                      <input type="range" min="0.5" max="2" step="0.1" value={particleCustomRef.current.sizeMultiplier}
                        onChange={(e) => {
                          particleCustomRef.current.sizeMultiplier = parseFloat(e.target.value)
                          saveParticleCustomization(particleCustomRef.current)
                        }}
                        className="flex-1 h-1 rounded-full appearance-none cursor-pointer particle-size-slider"
                      />
                      <span className="text-[9px] text-slate-400 w-6 text-right">{particleCustomRef.current.sizeMultiplier.toFixed(1)}x</span>
                    </div>
                    {/* Opacity */}
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-500 w-10">Opacity</span>
                      <input type="range" min="0.3" max="1" step="0.1" value={particleCustomRef.current.opacity}
                        onChange={(e) => {
                          particleCustomRef.current.opacity = parseFloat(e.target.value)
                          saveParticleCustomization(particleCustomRef.current)
                        }}
                        className="flex-1 h-1 rounded-full appearance-none cursor-pointer particle-opacity-slider"
                      />
                      <span className="text-[9px] text-slate-400 w-6 text-right">{Math.round(particleCustomRef.current.opacity * 100)}%</span>
                    </div>
                    {/* Per-event toggles */}
                    <div className="flex flex-wrap gap-1">
                      {(Object.entries(DEFAULT_EVENT_PRESETS) as [ParticleEventType, ParticlePresetName][]).map(([evt, preset]) => (
                        <button key={evt}
                          className={`text-[8px] px-1.5 py-0.5 rounded border transition-colors particle-event-toggle ${
                            particleCustomRef.current.enabledEvents[evt] !== false
                              ? 'bg-purple-900/30 border-purple-700/40 text-purple-300'
                              : 'bg-slate-800/30 border-slate-700/30 text-slate-600'
                          }`}
                          onClick={() => {
                            const newVal = particleCustomRef.current.enabledEvents[evt] === false
                            particleCustomRef.current.enabledEvents[evt] = newVal
                            saveParticleCustomization(particleCustomRef.current)
                          }}
                        >
                          {evt.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Multilingual Word Packs */}
            {mounted && multilingualPacks.length > 0 && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-blue-900/15 to-purple-900/10 border border-blue-700/20 multilingual-panel">
                <div className="flex items-center justify-between mb-1.5 cursor-pointer" onClick={() => setShowMultilingualPanel(!showMultilingualPanel)}>
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3 w-3 text-blue-400" />
                    <span className="text-[10px] text-slate-400 font-medium">Language Packs</span>
                    <span className="text-[8px] text-blue-400/60">{getTotalMultilingualWords()} words</span>
                  </div>
                  <span className="text-[9px] text-blue-400">{showMultilingualPanel ? '▲' : '▼'}</span>
                </div>
                {showMultilingualPanel && (
                  <div className="space-y-1.5 mt-2 multilingual-panel-expanded">
                    {multilingualPacks.map(pack => (
                      <div key={pack.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-slate-700/30 bg-slate-800/20">
                        <span className="text-sm">{pack.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-slate-300 font-medium">{pack.nativeName}</div>
                          <div className="text-[8px] text-slate-500">{pack.words.length} words · {pack.unlockRequirement.type === 'coins' ? `🪙 ${pack.unlockRequirement.value}` : ''}</div>
                        </div>
                        {pack.isUnlocked ? (
                          <span className="text-[8px] text-green-400 font-bold">✓</span>
                        ) : (
                          <button
                            className="text-[8px] px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/30 hover:bg-blue-800/50 transition-colors multilingual-unlock-btn"
                            onClick={() => {
                              const success = unlockMultilingualPack(pack.id)
                              if (success) {
                                setMultilingualPacks(getAllMultilingualPacks())
                                const newCoinBal = getCoinBalance()
                                gs.coinBalance = newCoinBal
                                updateUI()
                                emitEvent('achievement', `Unlocked ${pack.flag} ${pack.nativeName} pack!`, pack.emoji, pack.color)
                                if (canHaptic()) hapticFeedback('success')
                              }
                            }}
                          >Unlock</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Multilingual Achievements */}
            {mounted && multilingualPacks.filter(p => p.isUnlocked).length > 0 && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-emerald-900/15 to-teal-900/10 border border-emerald-700/20 multi-achieve-panel">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-xs">🏆</span>
                  <span className="text-[10px] text-slate-400 font-medium">Language Achievements</span>
                  {multilingualAchievementsUnlocked.length > 0 && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-900/50 text-emerald-400 border border-emerald-700/30 multi-achieve-badge">
                      {multilingualAchievementsUnlocked.length}/{MULTILINGUAL_ACHIEVEMENTS.length}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {MULTILINGUAL_ACHIEVEMENTS.map(ach => {
                    const isUnlocked = multilingualAchievementsUnlocked.includes(ach.id)
                    return (
                      <div key={ach.id} className={`flex items-center gap-2 px-2 py-1 rounded-md border transition-all duration-300 multi-achieve-item ${isUnlocked ? 'bg-emerald-900/20 border-emerald-700/30' : 'bg-slate-800/10 border-slate-700/20 opacity-50'}`}>
                        <span className={`text-xs ${isUnlocked ? 'multi-achieve-unlocked-emoji' : ''}`}>{ach.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[10px] font-medium ${isUnlocked ? 'text-emerald-300' : 'text-slate-500'}`}>{ach.title}</div>
                          <div className="text-[8px] text-slate-600">{ach.description}</div>
                        </div>
                        {isUnlocked && <span className="text-[8px] text-emerald-400">✓</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Enhanced Stats Comparison */}
            {mounted && comparisonSummary && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-cyan-900/15 to-blue-900/10 border border-cyan-700/20 stats-compare-panel">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <BarChart3 className="h-3 w-3 text-cyan-400" />
                  <span className="text-[10px] text-slate-400 font-medium">Performance</span>
                  <span className="text-[9px] ml-auto font-bold" style={{ color: getPerformanceColor(comparisonSummary.performanceRating) }}>
                    {comparisonSummary.ratingEmoji} {comparisonSummary.performanceRating.replace('_', ' ')}
                  </span>
                </div>
                <div className="space-y-1">
                  {comparisonSummary.trends.slice(0, 4).map(trend => (
                    <div key={trend.metric} className="flex items-center justify-between text-[9px]">
                      <span className="text-slate-500 capitalize">{trend.metric.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-300">{trend.values[trend.values.length - 1]?.toLocaleString() ?? '—'}</span>
                        <span className={trend.direction === 'up' ? 'text-green-400' : trend.direction === 'down' ? 'text-red-400' : 'text-slate-500'}>
                          {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}{Math.abs(trend.percentChange)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export Actions */}
            {mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-violet-900/15 to-fuchsia-900/10 border border-violet-700/20 export-actions-panel">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Share2 className="h-3 w-3 text-violet-400" />
                  <span className="text-[10px] text-slate-400 font-medium">Export & Share</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={async () => {
                      const words = getWordList().map(([w]) => w)
                      if (words.length === 0) return
                      await exportWordBook(words)
                      if (canHaptic()) hapticFeedback('success')
                    }}
                    className="px-2 py-1 text-[8px] rounded-full border border-violet-700/30 bg-violet-900/30 text-violet-300 hover:bg-violet-800/40 transition-all active:scale-90 export-wordbook-btn"
                  >
                    📖 Word Book
                  </button>
                  <button
                    onClick={async () => {
                      await shareAchievementShowcase()
                      if (canHaptic()) hapticFeedback('success')
                    }}
                    className="px-2 py-1 text-[8px] rounded-full border border-amber-700/30 bg-amber-900/30 text-amber-300 hover:bg-amber-800/40 transition-all active:scale-90 export-achieve-btn"
                  >
                    🏆 Achievements
                  </button>
                  <button
                    onClick={() => {
                      const text = comparisonSummary ? generateComparisonText(comparisonSummary) : 'No comparison data yet. Play more games!'
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(text)
                      }
                      if (canHaptic()) hapticFeedback('selection')
                    }}
                    className="px-2 py-1 text-[8px] rounded-full border border-cyan-700/30 bg-cyan-900/30 text-cyan-300 hover:bg-cyan-800/40 transition-all active:scale-90 export-stats-btn"
                  >
                    📊 Copy Stats
                  </button>
                </div>
              </div>
            )}

            {/* Custom Word Pack Creator */}
            {mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-rose-900/15 to-pink-900/10 border border-rose-700/20 pack-creator-panel">
                <div className="flex items-center justify-between mb-1.5 cursor-pointer" onClick={() => setShowPackCreator(!showPackCreator)}>
                  <div className="flex items-center gap-1.5">
                    <Package className="h-3 w-3 text-rose-400" />
                    <span className="text-[10px] text-slate-400 font-medium">Custom Packs</span>
                    {customWordPacks.length > 0 && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-rose-900/50 text-rose-400 border border-rose-700/30 pack-count-badge">
                        {customWordPacks.length}/{MAX_PACKS}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-rose-400">{showPackCreator ? '▲' : '▼'}</span>
                </div>
                {showPackCreator && (
                  <div className="space-y-2 mt-2 pack-creator-expanded">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          const newPack = createWordPack('My Pack', PACK_EMOJIS[customWordPacks.length % PACK_EMOJIS.length], 'A custom word collection')
                          saveWordPack(newPack)
                          setCustomWordPacks(loadWordPacks())
                          setEditingPack(newPack)
                          if (canHaptic()) hapticFeedback('selection')
                        }}
                        className="px-2 py-1 text-[8px] rounded-full border border-rose-700/30 bg-rose-900/30 text-rose-300 hover:bg-rose-800/40 transition-all active:scale-90 pack-create-btn"
                        disabled={customWordPacks.length >= MAX_PACKS}
                      >
                        + New Pack
                      </button>
                      <button
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = '.json'
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (!file) return
                            const text = await file.text()
                            const imported = importPackFromJSON(text)
                            if (imported) {
                              saveWordPack(imported)
                              setCustomWordPacks(loadWordPacks())
                              if (canHaptic()) hapticFeedback('success')
                            }
                          }
                          input.click()
                        }}
                        className="px-2 py-1 text-[8px] rounded-full border border-slate-700/30 bg-slate-800/40 text-slate-400 hover:text-slate-200 transition-all active:scale-90 pack-import-btn"
                      >
                        📥 Import
                      </button>
                    </div>
                    {customWordPacks.map(pack => (
                      <div key={pack.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-slate-700/30 bg-slate-800/20 pack-item">
                        <span className="text-xs">{pack.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-slate-300 font-medium truncate">{pack.name}</div>
                          <div className="text-[8px] text-slate-500">{pack.words.length} words · played {pack.playCount}x</div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              const json = exportPackAsJSON(pack)
                              if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                navigator.clipboard.writeText(json)
                              }
                              if (canHaptic()) hapticFeedback('selection')
                            }}
                            className="text-[8px] px-1 py-0.5 rounded bg-slate-700/40 text-slate-400 hover:text-slate-200 transition-colors"
                            title="Export as JSON"
                          >📤</button>
                          <button
                            onClick={() => {
                              deleteWordPack(pack.id)
                              setCustomWordPacks(loadWordPacks())
                              if (editingPack?.id === pack.id) setEditingPack(null)
                              if (canHaptic()) hapticFeedback('warning')
                            }}
                            className="text-[8px] px-1 py-0.5 rounded bg-red-900/40 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete pack"
                          >🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stats Charts */}
            {mounted && comparisonSummary && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-indigo-900/15 to-violet-900/10 border border-indigo-700/20 stats-charts-panel">
                <div className="flex items-center justify-between mb-1.5 cursor-pointer">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="h-3 w-3 text-indigo-400" />
                    <span className="text-[10px] text-slate-400 font-medium">Charts</span>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const charts = generateStatsCharts()
                        downloadChartImage(charts.scoreChart, 'word-snake-score-trend.png')
                        await new Promise(r => setTimeout(r, 200))
                        downloadChartImage(charts.wordsChart, 'word-snake-words-per-game.png')
                        await new Promise(r => setTimeout(r, 200))
                        downloadChartImage(charts.categoryChart, 'word-snake-category-dist.png')
                        if (canHaptic()) hapticFeedback('success')
                      } catch { /* ignore if no data */ }
                    }}
                    className="text-[8px] px-2 py-0.5 rounded-full border border-indigo-700/30 bg-indigo-900/30 text-indigo-300 hover:bg-indigo-800/40 transition-all active:scale-90 charts-download-btn"
                  >
                    📥 Download Charts
                  </button>
                </div>
                <div className="text-[8px] text-slate-500 text-center">
                  {comparisonSummary.overallStats.totalGames} games tracked · Score trend, Words/game, Category distribution
                </div>
              </div>
            )}

            {/* Replay Share */}
            {mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-teal-900/15 to-emerald-900/10 border border-teal-700/20 replay-share-panel">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Film className="h-3 w-3 text-teal-400" />
                    <span className="text-[10px] text-slate-400 font-medium">Replay Share</span>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={async () => {
                      const replays = getReplays()
                      if (replays.length === 0) return
                      const latest = replays[0]
                      const code = generateShareCode(latest)
                      const ok = await copyShareCodeToClipboard(code)
                      if (ok && canHaptic()) hapticFeedback('success')
                    }}
                    className="px-2 py-1 text-[8px] rounded-full border border-teal-700/30 bg-teal-900/30 text-teal-300 hover:bg-teal-800/40 transition-all active:scale-90 replay-copy-btn"
                  >
                    📋 Copy Replay Code
                  </button>
                  <button
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'text'
                      input.placeholder = 'Paste WSNAKE-1-... code'
                      input.className = 'sr-only'
                      const code = prompt('Paste replay code:')
                      if (!code) return
                      const parsed = parseShareCode(code)
                      if (parsed) {
                        // Could start playback - for now just show summary
                        if (canHaptic()) hapticFeedback('success')
                      } else {
                        if (canHaptic()) hapticFeedback('error')
                      }
                    }}
                    className="px-2 py-1 text-[8px] rounded-full border border-teal-700/30 bg-teal-900/30 text-teal-300 hover:bg-teal-800/40 transition-all active:scale-90 replay-import-btn"
                  >
                    📥 Import Code
                  </button>
                </div>
              </div>
            )}

            {/* Achievement Progress Tracker */}
            {showAchievementProgress && mounted && achievementProgress && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-purple-900/20 to-indigo-900/15 border border-purple-700/25 achievement-progress-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">📈</span>
                    <span className="text-[10px] text-purple-300 font-bold">Achievement Progress</span>
                  </div>
                  <span className="text-[9px] text-purple-400/70">{achievementProgress.unlockedCount}/{achievementProgress.totalAchievements} ({achievementProgress.overallPercent}%)</span>
                </div>
                {/* Overall progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 mb-2 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500 progress-bar-fill transition-all duration-500" style={{ width: `${achievementProgress.overallPercent}%` }} />
                </div>
                <p className="text-[9px] text-slate-400 mb-2 italic">{getMotivationalMessage(achievementProgress.overallPercent)}</p>
                {/* Category groups */}
                {achievementProgress.groups.slice(0, 4).map((group) => {
                  const catCfg = ACHIEVEMENT_CATEGORY_CONFIG[group.category as keyof typeof ACHIEVEMENT_CATEGORY_CONFIG]
                  return (
                    <div key={group.category} className="mb-2">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9px] text-slate-300">{catCfg?.emoji ?? ''} {catCfg?.label ?? group.category}</span>
                        <span className="text-[8px] text-slate-500">{Math.round(group.totalPercent)}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(group.totalPercent, 100)}%`, backgroundColor: catCfg?.color ?? '#8b5cf6' }} />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {group.items.slice(0, 3).map((item) => (
                          <span key={item.id} className={`text-[7px] px-1.5 py-0.5 rounded-full border ${item.unlocked ? 'border-green-700/40 bg-green-900/30 text-green-400' : 'border-slate-700/40 bg-slate-800/40 text-slate-500'}`}>
                            {item.emoji} {item.title}
                          </span>
                        ))}
                        {group.items.length > 3 && (
                          <span className="text-[7px] text-slate-600">+{group.items.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )
                })}
                {/* Near completion */}
                {achievementProgress.nearCompletion.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-purple-800/20">
                    <span className="text-[8px] text-amber-400 font-medium">Almost there!</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {achievementProgress.nearCompletion.slice(0, 3).map((item) => (
                        <span key={item.id} className="text-[7px] px-1.5 py-0.5 rounded-full border border-amber-700/30 bg-amber-900/20 text-amber-300">
                          {item.emoji} {item.title} ({item.percent}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Word Pack Generator */}
            {showAiGenerator && mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-cyan-900/20 to-blue-900/15 border border-cyan-700/25 ai-generator-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🤖</span>
                    <span className="text-[10px] text-cyan-300 font-bold">AI Word Pack Generator</span>
                  </div>
                  <span className="text-[9px] text-cyan-400/70">{aiGeneratedPacks.length}/{MAX_GENERATED_PACKS}</span>
                </div>
                {/* Theme selection */}
                <div className="mb-2">
                  <span className="text-[8px] text-slate-400 block mb-1">Theme</span>
                  <div className="grid grid-cols-4 gap-1">
                    {THEME_SUGGESTIONS.slice(0, 8).map((t) => (
                      <button
                        key={t.name}
                        onClick={() => setSelectedTheme(t.name)}
                        className={`text-[8px] px-1 py-0.5 rounded border transition-all active:scale-90 ${selectedTheme === t.name ? 'border-cyan-500/50 bg-cyan-900/40 text-cyan-300' : 'border-slate-700/30 bg-slate-800/30 text-slate-400 hover:border-cyan-700/30'}`}
                      >
                        {t.emoji}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Language and difficulty */}
                <div className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <span className="text-[8px] text-slate-400 block mb-0.5">Words</span>
                    <select
                      value={aiWordCount}
                      onChange={(e) => setAiWordCount(parseInt(e.target.value))}
                      className="w-full text-[9px] bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-slate-300"
                    >
                      {[5, 10, 15, 20, 25, 30].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <span className="text-[8px] text-slate-400 block mb-0.5">Difficulty</span>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                      className="w-full text-[9px] bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-slate-300"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                {/* Generate button */}
                <button
                  onClick={() => {
                    if (aiGenerating || aiGeneratedPacks.length >= MAX_GENERATED_PACKS) return
                    setAiGenerating(true)
                    setTimeout(() => {
                      const pack = generateWordPackFromLLM({ theme: selectedTheme, language: selectedLanguage, count: aiWordCount, difficulty: aiDifficulty })
                      saveGeneratedPack(pack)
                      setAiGeneratedPacks(getGeneratedPacks())
                      setAiGenerating(false)
                      toast({ title: `Generated "${pack.name}"!`, description: `${pack.words.length} words about ${selectedTheme}` })
                      if (canHaptic()) hapticFeedback('success')
                    }, 800)
                  }}
                  disabled={aiGenerating || aiGeneratedPacks.length >= MAX_GENERATED_PACKS}
                  className="w-full py-1.5 rounded-md text-[10px] font-medium bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 ai-generate-btn"
                >
                  {aiGenerating ? '⏳ Generating...' : '✨ Generate Word Pack'}
                </button>
                {/* Generated packs list */}
                {aiGeneratedPacks.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                    {aiGeneratedPacks.slice(-5).reverse().map((pack) => (
                      <div key={pack.createdAt} className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/50 border border-slate-700/20 ai-pack-item">
                        <span className="text-xs">{pack.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] text-slate-300 block truncate">{pack.name}</span>
                          <span className="text-[7px] text-slate-500">{pack.words.length} words · {pack.difficulty}</span>
                        </div>
                        <span className="text-[8px] text-cyan-400/60">{pack.language}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Round 44: Real-time Quick Stats Bar */}
            <RealtimeQuickStatsBar />

            {/* SFX Event Sounds Toggle */}
            {mounted && (
              <div className="mb-3 px-2.5 py-1.5 rounded-md bg-gradient-to-r from-orange-900/15 to-amber-900/10 border border-orange-700/20 sfx-events-panel">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🔊</span>
                    <span className="text-[10px] text-orange-300 font-medium">Event Sounds</span>
                  </div>
                  <button
                    onClick={() => {
                      const newVal = !sfxEventsEnabled
                      setSfxEventsEnabled(newVal)
                      try { localStorage.setItem('wordsnake_sfx_events_enabled', String(newVal)) } catch { /* ignore */ }
                      if (newVal) playGameEventSound('ui_click')
                      if (canHaptic()) hapticFeedback('light')
                    }}
                    className={`relative w-8 h-4 rounded-full transition-colors ${sfxEventsEnabled ? 'bg-orange-500' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${sfxEventsEnabled ? 'left-4.5 translate-x-0.5' : 'left-0.5'}`} />
                  </button>
                </div>
                <p className="text-[7px] text-slate-500 mt-0.5">{sfxEventsEnabled ? 'Playing synthesized sounds for 37 game events' : 'Event sounds disabled'}</p>
              </div>
            )}

            {/* Responsive Layout Info */}
            {mounted && currentBreakpoint && (
              <div className="mb-3 px-2.5 py-1.5 rounded-md bg-slate-800/30 border border-slate-700/15 responsive-info-panel">
                <div className="flex items-center gap-2 text-[8px] text-slate-500">
                  <span>{currentBreakpoint === 'mobile' ? '📱' : currentBreakpoint === 'tablet' ? '📱' : '🖥️'}</span>
                  <span>{currentBreakpoint}</span>
                  <span>·</span>
                  <span>{orientation.isLandscape ? '↔️' : orientation.isPortrait ? '↕️' : '⬜'} {orientation.orientation}</span>
                  {responsiveLayout.scaleFactor < 1 && <span>· {Math.round(responsiveLayout.scaleFactor * 100)}%</span>}
                </div>
              </div>
            )}

            {/* Game Save/Load Panel */}
            {showSavePanel && mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-emerald-900/20 to-teal-900/15 border border-emerald-700/25 save-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">💾</span>
                    <span className="text-[10px] text-emerald-300 font-bold">Save & Load</span>
                  </div>
                  <span className="text-[9px] text-emerald-400/70">{saveSlots.length}/8 slots</span>
                </div>
                {/* Quick save button */}
                <button
                  onClick={() => {
                    const gs = gameStateRef.current
                    const state = serializeGameState({ score: gs.score, wordsEaten: gs.wordsEaten, difficulty: gs.difficulty, elapsedTime: gs.elapsedTime, snake: gs.snake, direction: gs.direction, comboCount: gs.comboCount, comboMultiplier: gs.comboMultiplier, coinBalance: gs.coinBalance, weather: gs.weather, isDailyChallenge: gs.isDailyChallenge, dailyWordsCollected: gs.dailyWordsCollected, isSpeedRun: gs.isSpeedRun, speedRunTimeLeft: gs.speedRunTimeLeft, wordsByCategory: gs.wordsByCategory, activeCategories: [...gs.activeCategories], gridTheme: gs.gridTheme, activeSkin: gs.activeSkin, soundEnabled: gs.soundEnabled, activePowerUps: gs.activePowerUps.map(p => ({ type: p.type, expiresAt: p.expiresAt })) })
                    const nextSlot = saveSlots.length > 0 ? Math.max(...saveSlots.map(s => s.id)) + 1 : 1
                    if (nextSlot > 8) { toast({ title: 'All slots full', description: 'Delete a save first', variant: 'destructive' }); return }
                    const slot = saveToSlot(nextSlot, state, `Save ${nextSlot}`, canvasRef.current)
                    setSaveSlots(getSaveSlots())
                    toast({ title: `Saved to Slot ${nextSlot}!`, description: `Score: ${gs.score} · Words: ${gs.wordsEaten}` })
                    if (canHaptic()) hapticFeedback('success')
                  }}
                  disabled={!uiState.gameStarted || uiState.gameOver}
                  className="w-full py-1.5 rounded-md text-[10px] font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 save-btn"
                >
                  💾 Quick Save
                </button>
                {/* Save slots list */}
                {saveSlots.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-28 overflow-y-auto custom-scrollbar">
                    {saveSlots.map((slot) => (
                      <div key={slot.id} className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/50 border border-slate-700/20 save-slot-item">
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] text-slate-300 block">{slot.name}</span>
                          <span className="text-[7px] text-slate-500">{slot.score}pts · {slot.wordsEaten}words · {formatSaveAge(slot.savedAt)}</span>
                        </div>
                        <button onClick={() => { deleteSaveSlot(slot.id); setSaveSlots(getSaveSlots()); if (canHaptic()) hapticFeedback('light') }} className="text-[9px] text-red-400 hover:text-red-300 px-1">✕</button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Export/Import */}
                <div className="flex gap-1.5 mt-2">
                  <button onClick={() => { const data = exportSaveData(); navigator.clipboard.writeText(data); toast({ title: 'Saves exported!', description: 'Copied to clipboard' }) }} className="flex-1 py-1 rounded text-[8px] border border-emerald-700/30 bg-emerald-900/30 text-emerald-300 hover:bg-emerald-800/40 transition-all active:scale-90">📤 Export</button>
                  <button onClick={() => { const json = prompt('Paste save data:'); if (!json) return; const result = importSaveData(json); setSaveSlots(getSaveSlots()); toast({ title: `Imported ${result.slotsImported} saves`, description: result.errors.length ? `${result.errors.length} errors` : 'Success' }) }} className="flex-1 py-1 rounded text-[8px] border border-emerald-700/30 bg-emerald-900/30 text-emerald-300 hover:bg-emerald-800/40 transition-all active:scale-90">📥 Import</button>
                </div>
              </div>
            )}

            {/* Accessibility Panel */}
            {showA11yPanel && mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-blue-900/20 to-indigo-900/15 border border-blue-700/25 a11y-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">♿</span>
                    <span className="text-[10px] text-blue-300 font-bold">Accessibility</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {[
                    { key: 'reducedMotion' as const, label: 'Reduce Motion', desc: 'Disable animations' },
                    { key: 'highContrast' as const, label: 'High Contrast', desc: 'Enhanced visibility' },
                    { key: 'largeText' as const, label: 'Large Text', desc: 'Increase font size' },
                    { key: 'focusIndicators' as const, label: 'Focus Indicators', desc: 'Show focus rings' },
                    { key: 'textToSpeech' as const, label: 'Text to Speech', desc: 'Read text aloud' },
                    { key: 'screenReader' as const, label: 'Screen Reader', desc: 'ARIA announcements' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-0.5">
                      <div>
                        <span className="text-[9px] text-slate-300 block">{label}</span>
                        <span className="text-[7px] text-slate-500">{desc}</span>
                      </div>
                      <button
                        onClick={() => {
                          const newConfig = updateConfig({ [key]: !a11yConfig[key] })
                          setA11yConfig(newConfig)
                          if (key === 'reducedMotion' && newConfig.reducedMotion) announceToScreenReader('Reduced motion enabled')
                          if (key === 'textToSpeech' && !newConfig.textToSpeech) stopSpeaking()
                          if (canHaptic()) hapticFeedback('light')
                        }}
                        className={`relative w-7 h-3.5 rounded-full transition-colors ${a11yConfig[key] ? 'bg-blue-500' : 'bg-slate-700'}`}
                      >
                        <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow transition-transform ${a11yConfig[key] ? 'left-4' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                {/* Color blind mode */}
                <div className="mt-2">
                  <span className="text-[8px] text-slate-400 block mb-0.5">Color Blind Mode</span>
                  <div className="flex gap-1">
                    {(['none', 'protanopia', 'deuteranopia', 'tritanopia'] as const).map((mode) => (
                      <button key={mode} onClick={() => { const c = updateConfig({ colorBlindMode: mode }); setA11yConfig(c) }}
                        className={`text-[7px] px-1.5 py-0.5 rounded border transition-all ${a11yConfig.colorBlindMode === mode ? 'border-blue-500/50 bg-blue-900/40 text-blue-300' : 'border-slate-700/30 bg-slate-800/30 text-slate-400'}`}>
                        {mode === 'none' ? 'Off' : mode.slice(0, 4)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Game Event Stats */}
            {mounted && eventCounterRef.current && (
              <div className="mb-3 px-2.5 py-1.5 rounded-md bg-slate-800/30 border border-slate-700/15 event-stats-panel">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] text-slate-400">📊</span>
                  <span className="text-[9px] text-slate-500 font-medium">Session Events</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(eventCounterRef.current()).map(([event, count]) => (
                    <span key={event} className="text-[7px] px-1.5 py-0.5 rounded-full bg-slate-800/60 text-slate-400 border border-slate-700/20">
                      {event.split(':')[1]}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Event Analytics Dashboard */}
            {showEventAnalytics && mounted && eventAnalytics && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-violet-900/20 to-purple-900/15 border border-violet-700/25 analytics-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">📊</span>
                    <span className="text-[10px] text-violet-300 font-bold">Event Analytics</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-violet-900/40 text-violet-300">{eventAnalytics.recentActivity}</span>
                </div>
                <p className="text-[8px] text-slate-400 mb-2">{getAnalyticsSummary()}</p>
                {/* Category breakdown */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {Object.entries(eventAnalytics.categoryBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, count]) => (
                    <span key={cat} className="text-[7px] px-1.5 py-0.5 rounded-full border border-slate-700/20 bg-slate-800/40 text-slate-400">
                      {getCategoryEmoji(cat as EventCategory)} {cat}: {count}
                    </span>
                  ))}
                </div>
                {/* Sparkline timeline */}
                {eventAnalytics.eventTimeline.length > 1 && (
                  <div className="text-[7px] text-slate-500 mb-1">Activity: <span className="font-mono tracking-wider">{formatEventTimeline(eventAnalytics.eventTimeline)}</span></div>
                )}
                {/* Top events */}
                <div className="space-y-0.5">
                  {eventAnalytics.topEvents.slice(0, 3).map((e, i) => (
                    <div key={e.event} className="flex items-center justify-between">
                      <span className="text-[7px] text-slate-400 truncate max-w-[120px]">{e.event}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-1 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${e.percent}%` }} />
                        </div>
                        <span className="text-[7px] text-slate-500">{e.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Practice Mode Panel */}
            {showPracticeMode && mounted && (
              <div className={`mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-emerald-900/20 to-green-900/15 border border-emerald-700/25 practice-panel ${practiceSession ? 'practice-panel-active' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🎓</span>
                    <span className="text-[10px] text-emerald-300 font-bold">Practice Mode</span>
                  </div>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${practiceSession ? 'bg-emerald-800/60 text-emerald-200' : 'bg-slate-800/60 text-slate-400'}`}>
                    {practiceSession ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-[8px] text-slate-400 mb-2">Learn vocabulary without game over risk</p>
                <div className="flex gap-1.5 mb-2">
                  <button
                    onClick={() => {
                      const session = startPracticeSession(practiceConfig)
                      setPracticeSession(session)
                      emitGameEvent('practice:start', { sessionId: session.sessionId })
                    }}
                    className="text-[8px] px-2 py-1 rounded bg-emerald-700/40 text-emerald-300 hover:bg-emerald-700/60 transition-colors practice-start-btn"
                  >Start Session</button>
                  <button
                    onClick={() => {
                      if (practiceSession) {
                        const summary = endPracticeSession(practiceSession, practiceStats)
                        setPracticeSession(null)
                        setPracticeHistory(getPracticeHistory())
                        setPracticeStats(getPracticeStats())
                        emitGameEvent('practice:end', { sessionId: practiceSession.sessionId })
                      }
                    }}
                    className="text-[8px] px-2 py-1 rounded bg-slate-700/40 text-slate-300 hover:bg-slate-700/60 transition-colors"
                  >End Session</button>
                </div>
                {practiceStats && (
                  <div className="grid grid-cols-3 gap-1 mb-2">
                    <div className="text-center p-1 rounded bg-emerald-900/20">
                      <div className="text-[7px] text-slate-500">Words</div>
                      <div className="text-[10px] text-emerald-300 font-bold">{practiceStats.totalWords}</div>
                    </div>
                    <div className="text-center p-1 rounded bg-emerald-900/20">
                      <div className="text-[7px] text-slate-500">Accuracy</div>
                      <div className="text-[10px] text-emerald-300 font-bold">{practiceStats.totalWords > 0 ? Math.round(practiceStats.correctFirst / practiceStats.totalWords * 100) : 0}%</div>
                    </div>
                    <div className="text-center p-1 rounded bg-emerald-900/20">
                      <div className="text-[7px] text-slate-500">Streak</div>
                      <div className="text-[10px] text-emerald-300 font-bold">{practiceStats.streak}</div>
                    </div>
                  </div>
                )}
                <div className="text-[7px] text-slate-500">Sessions: {practiceHistory.length} | Best streak: {practiceStats?.bestStreak ?? 0}</div>
              </div>
            )}

            {/* Game Speed Configuration Panel */}
            {showSpeedConfig && mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-amber-900/20 to-yellow-900/15 border border-amber-700/25 speed-config-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">⚡</span>
                    <span className="text-[10px] text-amber-300 font-bold">Speed Control</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-900/40 text-amber-300">{formatSpeed(getFrameInterval(speedConfig))}</span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-[7px] text-slate-500 mb-1">
                    <span>{getSpeedLabel(speedConfig.currentSpeed)}</span>
                    <span>{getFPS(speedConfig)} FPS</span>
                  </div>
                  <input
                    type="range"
                    min={speedConfig.minSpeed}
                    max={speedConfig.maxSpeed}
                    value={speedConfig.currentSpeed}
                    onChange={(e) => {
                      const newConfig = setSpeed(speedConfig, parseInt(e.target.value))
                      setSpeedConfig(newConfig)
                      saveSpeedConfig(newConfig)
                    }}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer speed-slider"
                    style={{ background: `linear-gradient(to right, ${getSpeedColor(speedConfig.minSpeed)}, ${getSpeedColor(speedConfig.maxSpeed)})` }}
                  />
                  <div className="flex justify-between text-[6px] text-slate-600 mt-0.5">
                    <span>Slow</span><span>Fast</span>
                  </div>
                </div>
                {/* Speed Profiles */}
                <div className="flex flex-wrap gap-1">
                  {SPEED_PROFILES.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        const newConfig = applySpeedProfile(speedConfig, p.id)
                        setSpeedConfig(newConfig)
                        saveSpeedConfig(newConfig)
                      }}
                      className={`text-[7px] px-1.5 py-0.5 rounded border transition-colors ${
                        speedConfig.speedProfile === p.id
                          ? 'border-amber-500/60 bg-amber-900/30 text-amber-200'
                          : 'border-slate-700/30 bg-slate-800/30 text-slate-500 hover:text-slate-300'
                      }`}
                      title={p.description}
                    >{p.icon} {p.name}</button>
                  ))}
                </div>
                <div className="mt-2 text-[7px] text-slate-500">
                  Progress: <span className="text-amber-400">{getSpeedProgress(speedConfig.currentSpeed, speedConfig.minSpeed, speedConfig.maxSpeed)}%</span>
                </div>
              </div>
            )}

            {/* Daily Challenge Calendar Panel */}
            {showCalendarPanel && mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-sky-900/20 to-blue-900/15 border border-sky-700/25 calendar-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">📅</span>
                    <span className="text-[10px] text-sky-300 font-bold">Daily Calendar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { const m = calendarMonthIdx === 0 ? 11 : calendarMonthIdx - 1; const y = calendarMonthIdx === 0 ? calendarYear - 1 : calendarYear; setCalendarMonthIdx(m); setCalendarYear(y); setCalendarMonth(getCalendarForMonth(y, m)) }} className="text-[8px] px-1 py-0.5 rounded bg-sky-900/40 text-sky-300 hover:bg-sky-900/60">◀</button>
                    <span className="text-[8px] text-sky-200">{getMonthName(calendarMonthIdx)} {calendarYear}</span>
                    <button onClick={() => { const m = calendarMonthIdx === 11 ? 0 : calendarMonthIdx + 1; const y = calendarMonthIdx === 11 ? calendarYear + 1 : calendarYear; setCalendarMonthIdx(m); setCalendarYear(y); setCalendarMonth(getCalendarForMonth(y, m)) }} className="text-[8px] px-1 py-0.5 rounded bg-sky-900/40 text-sky-300 hover:bg-sky-900/60">▶</button>
                  </div>
                </div>
                {calendarStats && (
                  <div className="grid grid-cols-3 gap-1 mb-2">
                    <div className="text-center p-1 rounded bg-sky-900/20">
                      <div className="text-[7px] text-slate-500">Completed</div>
                      <div className="text-[10px] text-sky-300 font-bold">{calendarStats.totalCompleted}</div>
                    </div>
                    <div className="text-center p-1 rounded bg-sky-900/20">
                      <div className="text-[7px] text-slate-500">Streak</div>
                      <div className="text-[10px] text-sky-300 font-bold">{calendarStats.currentStreak}d</div>
                    </div>
                    <div className="text-center p-1 rounded bg-sky-900/20">
                      <div className="text-[7px] text-slate-500">Stars</div>
                      <div className="text-[10px] text-amber-300 font-bold">{calendarStats.totalStars}</div>
                    </div>
                  </div>
                )}
                {/* Mini calendar grid */}
                {calendarMonth && (
                  <div className="grid grid-cols-7 gap-0.5">
                    {['M','T','W','T','F','S','S'].map((d, i) => (
                      <div key={i} className="text-[6px] text-center text-slate-600 py-0.5">{d}</div>
                    ))}
                    {generateCalendarGrid(calendarYear, calendarMonthIdx).map((cell, i) => {
                      const entry = calendarMonth.days.find(d => d.date === cell?.date)
                      const stars = entry?.stars ?? 0
                      return (
                        <div key={i} className={`text-[6px] text-center py-0.5 rounded ${
                          cell ? (entry?.completed ? 'bg-sky-800/40 text-sky-200 calendar-day-completed' : 'text-slate-600') : 'text-transparent'
                        }`}>
                          {cell?.day ?? '.'}
                          {stars > 0 && <span className="text-[5px] text-amber-400">{'★'.repeat(stars)}</span>}
                        </div>
                      )
                    })}
                  </div>
                )}
                {calendarStats && <div className="mt-1 text-[7px] text-slate-500">Rate: {Math.round(calendarStats.completionRate)}% | Best streak: <span className="text-amber-400">{getBestStreak()}d</span></div>}
                {/* Round 44: Calendar Heatmap + Monthly Trends */}
                <CalendarEnhancedSection />
              </div>
            )}

            {/* Word Sentences Panel */}
            {showWordSentences && mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-pink-900/20 to-rose-900/15 border border-pink-700/25 sentences-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">💬</span>
                    <span className="text-[10px] text-pink-300 font-bold">Word Sentences</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-pink-900/40 text-pink-300">{getSentenceStats().totalWords} words</span>
                </div>
                {sentenceOfTheDay && (
                  <div className="mb-2 p-1.5 rounded bg-pink-900/15 border border-pink-800/20 sentence-sotd-card">
                    <div className="text-[7px] text-pink-400 font-bold mb-0.5">Sentence of the Day</div>
                    <div className="text-[8px] text-slate-300 italic">"{sentenceOfTheDay.sentence}"</div>
                    <div className="text-[7px] text-slate-500">— {sentenceOfTheDay.word} ({sentenceOfTheDay.category})</div>
                  </div>
                )}
                {currentWordSentence && (
                  <div className="mb-2 p-1.5 rounded bg-slate-900/20 border border-slate-800/20">
                    <div className="text-[7px] text-slate-400 font-bold mb-0.5">Current Word: {uiStateRef.current.wordFood?.word ?? ''}</div>
                    <div className="text-[8px] text-slate-300">"{currentWordSentence.sentence}"</div>
                    <div className="flex gap-1 mt-1">
                      <span className="text-[6px] px-1 py-0.5 rounded bg-pink-900/30 text-pink-300">{currentWordSentence.category}</span>
                      <span className="text-[6px] px-1 py-0.5 rounded bg-slate-800/40 text-slate-400">{currentWordSentence.difficulty}</span>
                    </div>
                  </div>
                )}
                <div className="text-[7px] text-slate-500">{getSentenceStats().totalSentences} example sentences in database</div>
              </div>
            )}

            {/* Game Tips Panel */}
            {showTipsPanel && mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-lime-900/20 to-green-900/15 border border-lime-700/25 tips-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">💡</span>
                    <span className="text-[10px] text-lime-300 font-bold">Game Tips</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-lime-900/40 text-lime-300">{tipStats.remaining} new</span>
                </div>
                {currentTip && (
                  <div className="mb-2 p-1.5 rounded bg-lime-900/15 border border-lime-800/20">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[8px]">{getTipCategoryEmoji(currentTip.category)}</span>
                      <span className="text-[9px] text-lime-300 font-bold">{currentTip.title}</span>
                    </div>
                    <p className="text-[8px] text-slate-300">{currentTip.content}</p>
                    <div className="flex gap-1 mt-1.5">
                      <button onClick={() => { markTipShown(currentTip.id); const next = getNextTip({ score: 0, wordsCollected: 0, comboCount: 0, powerupsActive: [], gameStarted: true, gameOver: false, isDailyChallenge: false, difficulty: 'medium', practiceMode: false, timePlayed: 0 }, tipConfig); setCurrentTip(next); setTipStats(getTipStats()) }} className="text-[7px] px-1.5 py-0.5 rounded bg-lime-700/30 text-lime-300 hover:bg-lime-700/50">Next Tip</button>
                      <button onClick={() => { dismissTip(currentTip.id); const next = getNextTip({ score: 0, wordsCollected: 0, comboCount: 0, powerupsActive: [], gameStarted: true, gameOver: false, isDailyChallenge: false, difficulty: 'medium', practiceMode: false, timePlayed: 0 }, tipConfig); setCurrentTip(next); setTipStats(getTipStats()) }} className="text-[7px] px-1.5 py-0.5 rounded bg-slate-700/30 text-slate-400 hover:bg-slate-700/50">Dismiss</button>
                    </div>
                  </div>
                )}
                <div className="text-[7px] text-slate-500">Tips: {tipStats.shown}/{tipStats.total} | Dismissed: {tipStats.dismissed}</div>
              </div>
            )}

            {/* Word Mastery Panel */}
            {showMasteryPanel && mounted && masteryStats && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-orange-900/20 to-amber-900/15 border border-orange-700/25 mastery-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🏆</span>
                    <span className="text-[10px] text-orange-300 font-bold">Word Mastery</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-orange-900/40 text-orange-300">{masteryStats.totalWords} words</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  <div className="text-center p-1 rounded bg-orange-900/20">
                    <div className="text-[7px] text-slate-500">Mastered</div>
                    <div className="text-[10px] text-green-400 font-bold">{masteryStats.masteredCount}</div>
                  </div>
                  <div className="text-center p-1 rounded bg-orange-900/20">
                    <div className="text-[7px] text-slate-500">Legendary</div>
                    <div className="text-[10px] text-orange-400 font-bold">{masteryStats.legendaryCount}</div>
                  </div>
                  <div className="text-center p-1 rounded bg-orange-900/20">
                    <div className="text-[7px] text-slate-500">Avg</div>
                    <div className="text-[10px] text-orange-300 font-bold">{Math.round(masteryStats.averageMastery)}%</div>
                  </div>
                </div>
                {/* Level distribution */}
                <div className="flex gap-0.5 mb-2">
                  {(['new','seen','learning','familiar','mastered','legendary'] as MasteryLevel[]).map(level => {
                    const words = getWordsByLevel(level)
                    return (
                      <div key={level} className="flex-1 text-center">
                        <div className="text-[5px] text-slate-600">{getLevelEmoji(level)}</div>
                        <div className="text-[7px]" style={{ color: getLevelColor(level) }}>{words.length}</div>
                      </div>
                    )
                  })}
                </div>
                <div className="text-[7px] text-slate-500">Collection rate: {Math.round(masteryStats.collectionRate)}% | Encounters: {masteryStats.totalEncounters}</div>
                {/* Round 44: Enhanced Mastery — Closest to Level-Up + Session Stats */}
                <MasteryEnhancedSection />
              </div>
            )}

            {/* Stats Export Panel */}
            {showExportPanel && mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-cyan-900/20 to-teal-900/15 border border-cyan-700/25 export-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">📤</span>
                    <span className="text-[10px] text-cyan-300 font-bold">Export Stats</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-cyan-900/40 text-cyan-300">v{EXPORT_VERSION}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {(['json','csv','markdown','clipboard'] as ExportFormat[]).map(fmt => (
                    <button
                      key={fmt}
                      onClick={async () => {
                        const data = collectExportData()
                        if (fmt === 'clipboard') { exportToClipboard(data, exportConfig) }
                        else { triggerDownload(data, `word-snake-stats.${fmt === 'markdown' ? 'md' : fmt}`, fmt) }
                      }}
                      className={`text-[7px] px-1.5 py-0.5 rounded border transition-colors ${
                        exportConfig.format === fmt ? 'border-cyan-500/60 bg-cyan-900/30 text-cyan-200' : 'border-slate-700/30 bg-slate-800/30 text-slate-500 hover:text-slate-300'
                      }`}
                    >{getFormatIcon(fmt)} {fmt.toUpperCase()}</button>
                  ))}
                </div>
                <div className="text-[7px] text-slate-500">
                  Export all game data including scores, achievements, word collection, and session history
                </div>
                <button
                  onClick={async () => {
                    const text = buildShareText(collectExportData())
                    if (text) await exportToClipboard(collectExportData(), { ...exportConfig, format: 'json' })
                  }}
                  className="mt-1.5 text-[7px] px-1.5 py-0.5 rounded bg-cyan-700/30 text-cyan-300 hover:bg-cyan-700/50"
                >📋 Copy Share Summary</button>
              </div>
            )}

            {/* Sound Theme Panel */}
            {showSoundPanel && mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-fuchsia-900/20 to-purple-900/15 border border-fuchsia-700/25 sound-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🎵</span>
                    <span className="text-[10px] text-fuchsia-300 font-bold">Sound Presets</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-fuchsia-900/40 text-fuchsia-300">{activePresetName}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {getAllPresets().map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        const result = applyPreset(p.id)
                        if (result) {
                          setMusicVolume(result.musicVolume)
                          setActivePresetName(p.name)
                          savePanelConfig(soundPanelConfig)
                        }
                      }}
                      className={`text-[7px] px-1.5 py-0.5 rounded border transition-colors ${
                        activePresetName === p.name ? 'border-fuchsia-500/60 bg-fuchsia-900/30 text-fuchsia-200' : 'border-slate-700/30 bg-slate-800/30 text-slate-500 hover:text-slate-300'
                      }`}
                      title={p.description}
                    >{p.emoji} {p.name}</button>
                  ))}
                </div>
                <div className="text-[7px] text-slate-500 mb-1">{getVolumeSummary(Math.round(musicVolume * 100), Math.round(volumeConfig.sfxVolume * 100), Math.round(volumeConfig.masterVolume * 100))}</div>
                <div className="text-[7px] text-slate-600">Visualizer styles: {getVisualizerStyles().length} available</div>
              </div>
            )}

            {/* Score Breakdown Panel */}
            {showScoreBreakdown && mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-rose-900/20 to-pink-900/15 border border-rose-700/25 breakdown-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">📊</span>
                    <span className="text-[10px] text-rose-300 font-bold">Score Breakdown</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-rose-900/40 text-rose-300 breakdown-rating">{getScoreRating(scoreBreakdown.grandTotal)}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  <div className="text-center p-1 rounded bg-rose-900/20">
                    <div className="text-[7px] text-slate-500">Total</div>
                    <div className="text-[10px] text-rose-300 font-bold">{formatPoints(scoreBreakdown.grandTotal)}</div>
                  </div>
                  <div className="text-center p-1 rounded bg-rose-900/20">
                    <div className="text-[7px] text-slate-500">Rate</div>
                    <div className="text-[10px] text-rose-300 font-bold">{Math.round(getTimeEfficiency(scoreBreakdown))}/s</div>
                  </div>
                  <div className="text-center p-1 rounded bg-rose-900/20">
                    <div className="text-[7px] text-slate-500">Words</div>
                    <div className="text-[10px] text-rose-300 font-bold">{scoreBreakdown.entries.length}</div>
                  </div>
                </div>
                {getTopScoringWords(scoreBreakdown, 3).map((e, i) => (
                  <div key={i} className="flex justify-between text-[7px] py-0.5 border-b border-slate-800/30">
                    <span className="text-slate-400 truncate max-w-[100px]">{e.word}</span>
                    <span className="text-rose-400">+{formatPoints(e.totalPoints)}</span>
                  </div>
                ))}
                {/* Round 44: Enhanced Score Breakdown — Category + Rarity + Combo */}
                <ScoreBreakdownEnhancedSection />
              </div>
            )}

            {/* Game Mode Selector Panel */}
            {showModeSelector && mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-indigo-900/20 to-blue-900/15 border border-indigo-700/25 mode-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🎮</span>
                    <span className="text-[10px] text-indigo-300 font-bold">Game Modes</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-indigo-900/40 text-indigo-300">{getUnlockedModes().length} unlocked</span>
                </div>
                <div className="space-y-1 max-h-[160px] overflow-y-auto">
                  {getAllModes().map(mode => (
                    <div key={mode.id} className={`flex items-center gap-1.5 p-1 rounded cursor-pointer transition-colors mode-card-item ${mode.isLocked ? 'opacity-40' : 'hover:bg-indigo-900/20'} ${currentGameMode === mode.id ? 'bg-indigo-900/30 border border-indigo-700/30' : ''}`}
                      onClick={() => { if (!mode.isLocked) setCurrentGameMode(mode.id) }}>
                      <span className="text-[9px]">{mode.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[8px] text-indigo-200 font-bold truncate">{mode.name}</div>
                        <div className="text-[6px] text-slate-500">{getTimeDisplay(mode.timeLimit)} | {getScoreDisplay(mode.scoreMultiplier)} | {mode.isLocked ? '🔒 ' + mode.unlockCondition : 'Played: ' + mode.playCount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Player Profile Panel */}
            {showPlayerProfile && mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-violet-900/20 to-purple-900/15 border border-violet-700/25 profile-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">👤</span>
                    <span className="text-[10px] text-violet-300 font-bold">Player Profile</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-violet-900/40 text-violet-300">Lv.{calculateLevel(playerProfile.xp).level}</span>
                </div>
                <div className="flex items-center gap-2 mb-2 p-1.5 rounded bg-violet-900/15">
                  <span className="text-2xl">{playerProfile.avatar.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] text-violet-200 font-bold truncate">{playerProfile.name}{playerProfile.activeTitle ? ` [${playerProfile.activeTitle}]` : ''}</div>
                    <div className="w-full h-1 rounded-full bg-slate-800 mt-0.5">
                      <div className="h-full rounded-full bg-violet-500 transition-all xp-bar-fill" style={{ width: `${calculateLevel(playerProfile.xp).progress}%` }} />
                    </div>
                    <div className="text-[6px] text-slate-500">{calculateLevel(playerProfile.xp).currentXp}/{calculateLevel(playerProfile.xp).xpToNext} XP</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  <div className="text-center p-1 rounded bg-violet-900/20 profile-stat-cell">
                    <div className="text-[7px] text-slate-500">Games</div>
                    <div className="text-[10px] text-violet-300 font-bold">{playerProfile.totalGamesPlayed}</div>
                  </div>
                  <div className="text-center p-1 rounded bg-violet-900/20 profile-stat-cell">
                    <div className="text-[7px] text-slate-500">Best</div>
                    <div className="text-[10px] text-violet-300 font-bold">{playerProfile.bestScore}</div>
                  </div>
                  <div className="text-center p-1 rounded bg-violet-900/20 profile-stat-cell">
                    <div className="text-[7px] text-slate-500">Words</div>
                    <div className="text-[10px] text-violet-300 font-bold">{playerProfile.totalWordsCollected}</div>
                  </div>
                </div>
                <div className="text-[7px] text-slate-500">Titles: {getUnlockedTitles(playerProfile).length}/{PLAYER_TITLES.length} | Avatars: {getUnlockedAvatars(playerProfile).length}/{AVATARS.length}</div>
              </div>
            )}

            {/* Round 37: Mode Engine Panel */}
            {showModeEngine && mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-cyan-900/20 to-teal-900/15 border border-cyan-700/25 mode-engine-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">⚙️</span>
                    <span className="text-[10px] text-cyan-300 font-bold">Mode Engine</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-cyan-900/40 text-cyan-300">{modeDisplayInfo.modeEmoji} {modeDisplayInfo.modeName}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  <div className="text-center p-1 rounded bg-cyan-900/20 engine-stat-cell">
                    <div className="text-[7px] text-slate-500">Score ×</div>
                    <div className="text-[10px] text-cyan-300 font-bold">{modeDisplayInfo.multiplierDisplay || getModeScoreMultiplier(modeEngineRef.current).toFixed(1)}</div>
                  </div>
                  <div className="text-center p-1 rounded bg-cyan-900/20 engine-stat-cell">
                    <div className="text-[7px] text-slate-500">Speed</div>
                    <div className="text-[10px] text-cyan-300 font-bold">{getFrameIntervalModifier(modeEngineRef.current).toFixed(2)}x</div>
                  </div>
                  <div className="text-center p-1 rounded bg-cyan-900/20 engine-stat-cell">
                    <div className="text-[7px] text-slate-500">Obstacles</div>
                    <div className="text-[10px] text-cyan-300 font-bold">{getObstacleModifier(modeEngineRef.current).toFixed(1)}x</div>
                  </div>
                </div>
                {modeDisplayInfo.timeDisplay && (
                  <div className="text-center py-1 rounded bg-cyan-900/15 mb-2">
                    <div className="text-[7px] text-slate-500">Time Remaining</div>
                    <div className="text-sm text-cyan-300 font-bold font-mono">{modeDisplayInfo.timeDisplay}</div>
                  </div>
                )}
                {modeDisplayInfo.livesDisplay && (
                  <div className="text-center py-1 rounded bg-cyan-900/15 mb-2">
                    <div className="text-[7px] text-slate-500">Lives</div>
                    <div className="text-sm text-cyan-300 font-bold">{modeDisplayInfo.livesDisplay}</div>
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  <div className="text-[7px] px-1.5 py-0.5 rounded bg-cyan-900/30 text-cyan-400">Spawn: {getSpawnRateModifier(modeEngineRef.current).toFixed(1)}x</div>
                  <div className="text-[7px] px-1.5 py-0.5 rounded bg-cyan-900/30 text-cyan-400">Frame: {getFrameIntervalModifier(modeEngineRef.current).toFixed(2)}x</div>
                </div>
              </div>
            )}

            {/* Round 37: XP Panel */}
            {showXPPanel && mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-amber-900/20 to-orange-900/15 border border-amber-700/25 xp-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">✨</span>
                    <span className="text-[10px] text-amber-300 font-bold">XP Progress</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-900/40 text-amber-300">Lv.{xpProgress.level}</span>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[7px] text-slate-500">Level Progress</span>
                    <span className="text-[7px] text-amber-400 font-bold">{formatXP(xpProgress.currentXp)}/{formatXP(xpProgress.xpToNext)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500 xp-progress-fill" style={{ width: `${xpProgress.progressPercent}%` }}>
                      <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent xp-shimmer" />
                    </div>
                  </div>
                  <div className="text-[6px] text-slate-500 text-right mt-0.5">{xpProgress.progressPercent.toFixed(1)}%</div>
                </div>
                {xpProgress.activeMultipliers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {xpProgress.activeMultipliers.map((m, i) => (
                      <div key={i} className="text-[7px] px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-400 animate-pulse">
                        {m.source}: ×{m.multiplier.toFixed(1)}
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-1 mb-1">
                  <div className="text-center p-1 rounded bg-amber-900/20 xp-stat-cell">
                    <div className="text-[7px] text-slate-500">Session XP</div>
                    <div className="text-[10px] text-amber-300 font-bold">{formatXP(getSessionStats(xpWireRef.current).totalXPEarned)}</div>
                  </div>
                  <div className="text-center p-1 rounded bg-amber-900/20 xp-stat-cell">
                    <div className="text-[7px] text-slate-500">Total XP</div>
                    <div className="text-[10px] text-amber-300 font-bold">{formatXP(xpProgress.currentXp)}</div>
                  </div>
                </div>
                <div className="text-[7px] text-slate-500 mt-1">
                  Breakdown: {Object.entries(getXPBreakdown(xpWireRef.current)).map(([k, v]) => `${k}:${formatXP(v)}`).join(' | ')}
                </div>
              </div>
            )}

            {/* Round 37: Notification Settings Panel */}
            {showNotifSettings && mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-pink-900/20 to-rose-900/15 border border-pink-700/25 notif-settings-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🔔</span>
                    <span className="text-[10px] text-pink-300 font-bold">Alert Settings</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-pink-900/40 text-pink-300">{getNotifStats(notifEventWireRef.current).totalShown} shown</span>
                </div>
                <div className="grid grid-cols-2 gap-1 mb-2">
                  {[
                    { key: 'showAchievements' as const, label: 'Achievements', emoji: '🏆' },
                    { key: 'showCombos' as const, label: 'Combos', emoji: '🔥' },
                    { key: 'showPowerUps' as const, label: 'Power-ups', emoji: '⚡' },
                    { key: 'showChallenges' as const, label: 'Challenges', emoji: '🎯' },
                    { key: 'showLevelUps' as const, label: 'Level Ups', emoji: '📈' },
                    { key: 'showStreaks' as const, label: 'Streaks', emoji: '🔥' },
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => { toggleNotifSetting(notifEventWireRef.current, item.key); setShowNotifSettings(true) }}
                      className={`flex items-center gap-1 p-1 rounded text-[7px] transition-all notif-toggle-btn ${getSettings(notifEventWireRef.current)[item.key] ? 'bg-pink-900/30 text-pink-300 border border-pink-700/30' : 'bg-slate-800/30 text-slate-500 border border-slate-700/20'}`}
                    >
                      <span>{item.emoji}</span>
                      <span className="truncate">{item.label}</span>
                      <span className="ml-auto">{getSettings(notifEventWireRef.current)[item.key] ? '✓' : '✗'}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[7px] text-slate-500">Max Visible</span>
                  <span className="text-[8px] text-pink-300 font-bold">{getSettings(notifEventWireRef.current).maxVisible}</span>
                </div>
              </div>
            )}

            {/* Round 37: Live Notification Toasts */}
            {(() => {
              const activeNotifs = getActiveNotifications(notifEventWireRef.current)
              if (activeNotifs.length === 0) return null
              return (
                <div className="mb-3 space-y-1.5">
                  {activeNotifs.slice(0, 3).map((notif, i) => (
                    <div key={notif.id || i} className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-slate-600/30 backdrop-blur-sm live-notif-toast" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{notif.icon || '📌'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[8px] text-white font-bold truncate">{notif.title}</div>
                          {notif.message && <div className="text-[7px] text-slate-400 truncate">{notif.message}</div>}
                        </div>
                        <button onClick={() => dismissNotification(notifEventWireRef.current, notif.id || '')} className="text-slate-500 hover:text-white transition-colors">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* Round 38: Battle Pass Panel */}
            {showBattlePass && mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-emerald-900/20 to-green-900/15 border border-emerald-700/25 bp-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{battlePassSummary.emoji}</span>
                    <span className="text-[10px] text-emerald-300 font-bold">{battlePassSummary.season}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-900/40 text-emerald-300">Tier {battlePassSummary.currentTier}/{battlePassSummary.totalTiers}</span>
                    {!battlePassSummary.isPremium && (
                      <button onClick={() => { unlockPremium(battlePassRef.current); setBattlePassSummary(getPassSummary(battlePassRef.current)) }} className="text-[7px] px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-300 hover:bg-amber-900/60 transition-colors">⭐ Premium</button>
                    )}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[7px] text-slate-500">Tier Progress</span>
                    <span className="text-[7px] text-emerald-400 font-bold">{battlePassSummary.completionPercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all bp-tier-fill" style={{ width: `${battlePassSummary.completionPercent}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  <div className="text-center p-1 rounded bg-emerald-900/20 bp-stat-cell">
                    <div className="text-[7px] text-slate-500">Tier</div>
                    <div className="text-[10px] text-emerald-300 font-bold">{battlePassSummary.currentTier}</div>
                  </div>
                  <div className="text-center p-1 rounded bg-emerald-900/20 bp-stat-cell">
                    <div className="text-[7px] text-slate-500">Rewards</div>
                    <div className="text-[10px] text-emerald-300 font-bold">{battlePassSummary.unclaimedRewards}</div>
                  </div>
                  <div className="text-center p-1 rounded bg-emerald-900/20 bp-stat-cell">
                    <div className="text-[7px] text-slate-500">Time Left</div>
                    <div className="text-[10px] text-emerald-300 font-bold">{getSeasonTimeRemaining(battlePassRef.current).days}d</div>
                  </div>
                </div>
                {/* Next 5 reward tiers */}
                <div className="flex gap-0.5 mb-1">
                  {Array.from({ length: Math.min(5, battlePassSummary.totalTiers - battlePassSummary.currentTier) }, (_, i) => {
                    const tier = battlePassSummary.currentTier + i + 1
                    const preview = battlePassRef.current.isPremium ? getRewardPreview(battlePassRef.current, tier, true) : getRewardPreview(battlePassRef.current, tier, false)
                    return (
                      <div key={tier} className="flex-1 text-center py-0.5 rounded bg-emerald-900/15 bp-reward-cell">
                        <div className="text-[8px]">{preview?.emoji || '?'}</div>
                        <div className="text-[6px] text-slate-500">T{tier}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Round 38: Stats Dashboard Panel */}
            {showStatsDashboard && mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-sky-900/20 to-blue-900/15 border border-sky-700/25 dashboard-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">📈</span>
                    <span className="text-[10px] text-sky-300 font-bold">Stats Dashboard</span>
                  </div>
                  <div className="flex gap-0.5">
                    {(['all', 'week', 'month'] as DashboardPeriod[]).map(p => (
                      <button key={p} onClick={() => setDashboardPeriod(p)} className={`text-[7px] px-1 py-0.5 rounded transition-colors ${dashboardPeriod === p ? 'bg-sky-900/40 text-sky-300' : 'text-slate-500 hover:text-slate-300'}`}>
                        {p === 'all' ? 'All' : p === 'week' ? '7d' : '30d'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {getQuickStats().map((stat, i) => (
                    <div key={i} className="text-center p-1 rounded bg-sky-900/20 dashboard-stat-cell">
                      <div className="text-[8px]">{stat.icon}</div>
                      <div className="text-[10px] text-sky-300 font-bold">{stat.value}</div>
                      <div className="text-[6px] text-slate-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="text-[7px] text-slate-500">{dashboardPeriod === 'all' ? 'Lifetime' : dashboardPeriod === 'week' ? 'Last 7 days' : 'Last 30 days'} statistics</div>
              </div>
            )}

            {/* Round 38: Collection Album Panel */}
            {showCollectionAlbum && mounted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-gradient-to-r from-orange-900/20 to-amber-900/15 border border-orange-700/25 album-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">📖</span>
                    <span className="text-[10px] text-orange-300 font-bold">Word Album</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-orange-900/40 text-orange-300">{collectionAlbumRef.current.totalCollected}/{collectionAlbumRef.current.totalAvailable}</span>
                </div>
                <div className="mb-2">
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all album-progress-fill" style={{ width: `${collectionAlbumRef.current.completionPercent}%` }} />
                  </div>
                  <div className="text-[6px] text-slate-500 text-right mt-0.5">{collectionAlbumRef.current.completionPercent.toFixed(1)}% collected</div>
                </div>
                <div className="grid grid-cols-4 gap-1 mb-2">
                  {(() => {
                    const comp = getCollectionCompletion(collectionAlbumRef.current)
                    return [
                      { label: 'Complete', value: comp.completed, color: 'text-green-400' },
                      { label: 'Near 80%', value: comp.nearlyComplete, color: 'text-yellow-400' },
                      { label: 'In Progress', value: comp.inProgress, color: 'text-orange-400' },
                      { label: 'Not Started', value: comp.notStarted, color: 'text-slate-500' },
                    ].map((item, i) => (
                      <div key={i} className="text-center p-1 rounded bg-orange-900/20 album-stat-cell">
                        <div className="text-[7px] text-slate-500">{item.label}</div>
                        <div className={`text-[10px] font-bold ${item.color}`}>{item.value}</div>
                      </div>
                    ))
                  })()}
                </div>
                {/* Rarest words */}
                {(() => {
                  const rarest = getRarestWords(collectionAlbumRef.current, 3)
                  return rarest.length > 0 ? (
                    <div className="flex gap-1 mb-1">
                      {rarest.map((w, i) => (
                        <div key={i} className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-purple-900/20 album-rare-word">
                          <span className="text-[8px]">{i === 0 ? '💎' : i === 1 ? '🔮' : '⭐'}</span>
                          <span className="text-[7px] text-purple-300">{w.word}</span>
                        </div>
                      ))}
                    </div>
                  ) : null
                })()}
                {/* Album achievements */}
                {(() => {
                  const achievements = checkAlbumAchievements(collectionAlbumRef.current)
                  const unlocked = achievements.filter(a => a.isUnlocked)
                  return (
                    <div className="text-[7px] text-slate-500">Album Achievements: {unlocked.length}/{achievements.length}</div>
                  )
                })()}
              </div>
            )}
            {/* Round 39: Social Share Panel */}
            {showSocialShare && mounted && (
              <div className="mb-3 px-3 py-2.5 rounded-lg bg-gradient-to-br from-pink-950/30 to-purple-950/20 border border-pink-700/30 share-panel-in">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-base">📤</span>
                  <span className="text-pink-300 text-xs font-bold">Share Results</span>
                  <button onClick={() => setShowSocialShare(false)} className="ml-auto text-pink-500 hover:text-pink-300 text-xs">✕</button>
                </div>
                <pre className="text-[7px] text-pink-200/80 bg-black/30 rounded-md p-2 overflow-x-auto whitespace-pre mb-2 font-mono leading-relaxed max-h-40 share-card-display">
                  {shareCardText || 'Play a game to generate a share card!'}
                </pre>
                <div className="grid grid-cols-3 gap-1.5">
                  <button onClick={async () => {
                    const ok = await socialShareRef.current.copyToClipboard(shareCardText)
                    if (ok) toast({ title: 'Copied!', description: 'Share card copied to clipboard', variant: 'default' })
                  }} className="text-[9px] px-2 py-1.5 rounded-md bg-pink-700/30 border border-pink-600/40 text-pink-300 hover:bg-pink-600/30 active:scale-95 transition-all share-copy-btn">
                    📋 Copy
                  </button>
                  <button onClick={() => {
                    const gs = gameStateRef.current
                    const text = socialShareRef.current.generateShareText('game_result', {
                      score: gs.score, wordsEaten: gs.wordsEaten, combo: gs.comboCount,
                      mode: gs.isDailyChallenge ? 'Daily' : 'Classic',
                      rating: gs.score >= 10000 ? 'SS' : gs.score >= 5000 ? 'S' : 'A',
                      time: gs.elapsedTime,
                    })
                    socialShareRef.current.shareToTwitter(text)
                  }} className="text-[9px] px-2 py-1.5 rounded-md bg-sky-700/30 border border-sky-600/40 text-sky-300 hover:bg-sky-600/30 active:scale-95 transition-all share-twitter-btn">
                    🐦 Tweet
                  </button>
                  <button onClick={async () => {
                    await socialShareRef.current.shareToGeneric(shareCardText)
                  }} className="text-[9px] px-2 py-1.5 rounded-md bg-emerald-700/30 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-600/30 active:scale-95 transition-all share-generic-btn">
                    📤 Share
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  <button onClick={() => {
                    const streak = getStreak()
                    const card = socialShareRef.current.generateShareCard('streak' as ShareType, { currentStreak: streak.currentStreak, bestStreak: streak.bestStreak, totalDays: streak.totalDays })
                    setShareCardText(card)
                  }} className="text-[9px] px-2 py-1.5 rounded-md bg-amber-700/30 border border-amber-600/40 text-amber-300 hover:bg-amber-600/30 active:scale-95 transition-all share-streak-btn">
                    🔥 Streak
                  </button>
                  <button onClick={() => {
                    const completion = getCollectionCompletion(collectionAlbumRef.current)
                    const card = socialShareRef.current.generateShareCard('collection' as ShareType, { completed: completion.completed, total: completion.completed + completion.nearlyComplete + completion.inProgress + completion.notStarted, rarestWord: getRarestWords(collectionAlbumRef.current, 1)[0]?.word || 'N/A' })
                    setShareCardText(card)
                  }} className="text-[9px] px-2 py-1.5 rounded-md bg-orange-700/30 border border-orange-600/40 text-orange-300 hover:bg-orange-600/30 active:scale-95 transition-all share-collection-btn">
                    📖 Album
                  </button>
                  <button onClick={() => {
                    const summary = eventBusWireRef.current.getEventSummary()
                    const card = `╔════════════════════╗\n║  📊 EVENT STATS    ║\n╠════════════════════╣\n║  Total: ${summary.totalEmitted.toString().padStart(6)}     ║\n║  Types: ${Object.keys(summary.byType).length.toString().padStart(5)}      ║\n╚════════════════════╝`
                    setShareCardText(card)
                  }} className="text-[9px] px-2 py-1.5 rounded-md bg-violet-700/30 border border-violet-600/40 text-violet-300 hover:bg-violet-600/30 active:scale-95 transition-all share-stats-btn">
                    📊 Events
                  </button>
                </div>
                {/* Round 41: Canvas Share — Download Image buttons */}
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <button onClick={() => {
                    const gs = gameStateRef.current
                    const data = buildGameResultData({ score: gs.score, wordsEaten: gs.wordsEaten, combo: gs.comboCount, mode: gs.isDailyChallenge ? 'Daily Challenge' : 'Classic', rating: gs.score >= 10000 ? 'SS' : gs.score >= 5000 ? 'S' : gs.score >= 2000 ? 'A' : gs.score >= 800 ? 'B' : 'C', time: Math.floor(gs.elapsedTime / 1000) })
                    canvasShareConnectorRef.current.generateAndDownloadGameResult(canvasShareRef.current, data)
                    toast({ title: 'Image Downloaded!', description: 'Game result card saved as PNG', variant: 'default' })
                  }} className="text-[9px] px-2 py-1.5 rounded-md bg-rose-700/30 border border-rose-600/40 text-rose-300 hover:bg-rose-600/30 active:scale-95 transition-all download-img-btn">
                    🎴 Result PNG
                  </button>
                  <button onClick={() => {
                    const streak = getStreak()
                    const data = buildStreakData({ currentStreak: streak.currentStreak, bestStreak: streak.bestStreak, totalDays: streak.totalDays })
                    canvasShareConnectorRef.current.generateAndDownloadStreak(canvasShareRef.current, data)
                    toast({ title: 'Image Downloaded!', description: 'Streak card saved as PNG', variant: 'default' })
                  }} className="text-[9px] px-2 py-1.5 rounded-md bg-amber-700/30 border border-amber-600/40 text-amber-300 hover:bg-amber-600/30 active:scale-95 transition-all download-img-btn">
                    🔥 Streak PNG
                  </button>
                  <button onClick={() => {
                    const completion = getCollectionCompletion(collectionAlbumRef.current)
                    const data = buildCollectionData({ completed: completion.completed, total: completion.completed + completion.nearlyComplete + completion.inProgress + completion.notStarted, rarestWord: getRarestWords(collectionAlbumRef.current, 1)[0]?.word || 'N/A', categories: ['general'] })
                    canvasShareConnectorRef.current.generateAndDownloadCollection(canvasShareRef.current, data)
                    toast({ title: 'Image Downloaded!', description: 'Collection card saved as PNG', variant: 'default' })
                  }} className="text-[9px] px-2 py-1.5 rounded-md bg-teal-700/30 border border-teal-600/40 text-teal-300 hover:bg-teal-600/30 active:scale-95 transition-all download-img-btn">
                    📖 Album PNG
                  </button>
                  <button onClick={() => {
                    const summary = getPassSummary(battlePassRef.current)
                    const data = buildBattlePassData({ seasonName: summary.seasonName || 'Spring Blossom', currentTier: summary.currentTier || 1, maxTier: summary.maxTier || 25, xpProgress: summary.xpProgress || 0 })
                    canvasShareConnectorRef.current.generateAndDownloadBattlePass(canvasShareRef.current, data)
                    toast({ title: 'Image Downloaded!', description: 'Battle Pass card saved as PNG', variant: 'default' })
                  }} className="text-[9px] px-2 py-1.5 rounded-md bg-indigo-700/30 border border-indigo-600/40 text-indigo-300 hover:bg-indigo-600/30 active:scale-95 transition-all download-img-btn">
                    🏆 BP PNG
                  </button>
                </div>
              </div>
            )}
            {/* Round 40: Event Log Panel */}
            {showEventLog && mounted && (
              <div className="mb-3 px-3 py-2.5 rounded-lg bg-gradient-to-br from-indigo-950/30 to-slate-950/20 border border-indigo-700/30 event-log-panel-in">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-base">📋</span>
                  <span className="text-indigo-300 text-xs font-bold">Event Log</span>
                  <button onClick={() => { eventLogPanelRef.current.clearEntries(); setEventLogEntries([]) }} className="ml-auto text-indigo-500 hover:text-indigo-300 text-[9px]">Clear</button>
                  <button onClick={() => setShowEventLog(false)} className="text-indigo-500 hover:text-indigo-300 text-xs">✕</button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-0.5 scrollbar-thin">
                  {eventLogEntries.length === 0 ? (
                    <div className="text-[8px] text-slate-500 text-center py-2">No events yet — start a game!</div>
                  ) : (
                    eventLogEntries.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-1.5 px-2 py-1 rounded text-[7px] event-log-entry" style={{ backgroundColor: `${entry.color}15`, borderLeft: `2px solid ${entry.color}40` }}>
                        <span className="shrink-0 mt-px">{entry.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <span style={{ color: entry.color }} className="font-medium">{entry.message}</span>
                        </div>
                        <span className="text-slate-600 shrink-0 tabular-nums">{new Date(entry.timestamp).toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-1.5 text-[7px] text-slate-600 text-right">{eventLogEntries.length} events</div>
              </div>
            )}
            {/* Round 40: Minigames Panel */}
            {showMinigames && mounted && (
              <div className="mb-3 px-3 py-2.5 rounded-lg bg-gradient-to-br from-yellow-950/30 to-orange-950/20 border border-yellow-700/30 minigames-panel-in">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-base">🎮</span>
                  <span className="text-yellow-300 text-xs font-bold">Mini-Games</span>
                  <button onClick={() => setShowMinigames(false)} className="ml-auto text-yellow-500 hover:text-yellow-300 text-xs">✕</button>
                </div>
                <div className="space-y-1.5">
                  {(() => {
                    const games = minigameLauncherRef.current.getAllMinigames()
                    return games.map((mg) => (
                      <div key={mg.type} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-black/20 border border-yellow-800/20 minigame-card">
                        <div className="text-lg minigame-icon">{mg.type === 'scramble_blitz' ? '🔤' : mg.type === 'boss_rush' ? '👹' : '🧠'}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] text-yellow-200 font-bold">{mg.config.name}</div>
                          <div className="text-[7px] text-slate-400 truncate">{mg.config.description}</div>
                          <div className="flex gap-2 mt-0.5">
                            <span className="text-[7px] text-emerald-400">Best: {mg.bestScore}</span>
                            <span className="text-[7px] text-slate-500">Played: {mg.timesPlayed}</span>
                          </div>
                        </div>
                        <div className="text-[7px] px-1.5 py-0.5 rounded bg-yellow-800/30 text-yellow-400 border border-yellow-700/30 minigame-time-badge">
                          {mg.config.timeLimit}s
                        </div>
                      </div>
                    ))
                  })()}
                </div>
                <div className="mt-2 text-[7px] text-slate-600 text-center">
                  Daily: <span className="text-yellow-500">{minigameLauncherRef.current.getDailyChallenge().type.replace('_', ' ')}</span>
                </div>
              </div>
            )}
            {activeEasterEggs.length > 0 && uiState.gameStarted && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {activeEasterEggs.map((ee) => {
                  const effectColors: Record<string, { bg: string; border: string; text: string }> = {
                    rainbow_snake: { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)', text: '#a855f7' },
                    giant_food: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#f59e0b' },
                    reverse_controls: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#ef4444' },
                    slow_mo: { bg: 'rgba(56,189,248,0.15)', border: 'rgba(56,189,248,0.4)', text: '#38bdf8' },
                    speed_boost: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', text: '#22c55e' },
                    confetti_burst: { bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.4)', text: '#ec4899' },
                    extra_life: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.4)', text: '#fbbf24' },
                    color_explosion: { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)', text: '#a855f7' },
                  }
                  const colors = effectColors[ee.effect] ?? effectColors.rainbow_snake
                  const remaining = ee.expiresAt > 0 ? Math.max(0, Math.ceil((ee.expiresAt - Date.now()) / 1000)) : 0
                  return (
                    <div key={ee.id} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs border animate-pulse easter-egg-reveal"
                      style={{ borderColor: colors.border, backgroundColor: colors.bg, color: colors.text }}>
                      <span>🥚</span>
                      <span className="font-medium">{ee.name}</span>
                      {remaining > 0 && <span className="opacity-70">{remaining}s</span>}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Daily challenge words */}
            {uiState.isDailyChallenge && uiState.gameStarted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-amber-900/15 border border-amber-700/30">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-amber-300 text-xs font-bold">Daily Challenge Words</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {uiState.dailyChallengeWords.map((w) => {
                    const collected = uiState.dailyWordsCollected.includes(w)
                    const entry = getWordEntry(w)
                    const catColor = entry ? CATEGORY_COLORS[entry.category] : '#94a3b8'
                    return (
                      <span
                        key={w}
                        className={`text-[11px] px-1.5 py-0.5 rounded border transition-all ${
                          collected
                            ? 'bg-amber-900/30 text-amber-300 border-amber-600/30'
                            : 'bg-slate-800/50 text-slate-500 border-slate-700/30'
                        }`}
                      >
                        {collected && '✓ '}{w}
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full ml-1"
                          style={{ backgroundColor: catColor }}
                        />
                      </span>
                    )
                  })}
                </div>
                <div className="text-[10px] text-amber-500/60 mt-1.5">
                  Target: {uiState.dailyTargetScore} pts
                </div>
              </div>
            )}

            {wordList.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="text-3xl mb-2 gentle-float">🎯</p>
                <p className="text-sm">No words collected yet</p>
                <p className="text-xs mt-1">Play the game to collect words!</p>
              </div>
            ) : (
              <TooltipProvider delayDuration={250}>
                <ScrollArea className="h-[340px] lg:h-[400px]">
                  <div className="space-y-1 pr-2 custom-scrollbar">
                    {wordList.map(({ word, count }, idx) => {
                      const entry = getWordEntry(word)
                      const packWord = getPackWordEntry(word)
                      const catColor = entry ? CATEGORY_COLORS[entry.category] : packWord ? (PACK_CATEGORY_INFO[packWord.category]?.color ?? '#94a3b8') : '#94a3b8'
                      const catInfo = entry ? getCategoryInfo(entry.category) : packWord ? getPackCategoryInfo(packWord.category) : null
                      const wordDef = getWordDefinition(word)
                      const isNew = idx === 0 && newWordKey > 0
                      return (
                        <Tooltip key={`${word}-${newWordKey}`}>
                          <TooltipTrigger asChild>
                            <div
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-800/60 border border-slate-700/50 group hover:bg-slate-800 hover:border-amber-700/50 transition-all duration-200 cursor-default word-item-highlight ${isNew ? 'word-entrance' : ''}`}
                            >
                              <span className="text-amber-300 text-sm font-mono flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0 transition-all duration-200 group-hover:scale-125"
                                  style={{ backgroundColor: catColor }}
                                />
                                {word}
                                {/* Category emoji on hover */}
                                {catInfo && (
                                  <span className="text-[10px] opacity-0 group-hover:opacity-60 transition-opacity duration-200">
                                    {catInfo.emoji}
                                  </span>
                                )}
                                {/* Rarity indicator */}
                                {(() => {
                                  const rarity = entry ? getRarityForPoints(entry.points) : 'common'
                                  const rConf = RARITY_CONFIG[rarity]
                                  return rarity !== 'common' ? (
                                    <span className={`text-[8px] ${rarity === 'legendary' ? 'rainbow-text-flow font-bold opacity-100' : 'opacity-70'}`} style={{ color: rarity !== 'legendary' ? rConf.color : undefined }}>{rConf.emoji} {rarity === 'legendary' ? 'LEGENDARY' : ''}</span>
                                  ) : null
                                })()}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {/* Pronunciation button */}
                                {isSpeechSupported() && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); pronounceWord(word) }}
                                    className="opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity duration-200 text-slate-400 hover:text-cyan-400"
                                    title="Pronounce word"
                                  >
                                    <Volume1 className="h-3 w-3" />
                                  </button>
                                )}
                                {entry && (
                                  <span className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">
                                    {entry.points}pt{entry.points !== 1 ? 's' : ''}
                                  </span>
                                )}
                                {count > 1 && (
                                  <Badge variant="secondary" className="bg-amber-800/40 text-amber-300 text-xs h-5 min-w-[20px] flex items-center justify-center">
                                    ×{count}
                                  </Badge>
                                )}
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
                                {wordDef.etymology && (
                                  <p className="text-[10px] text-slate-500 mt-1 etymology-highlight">📖 {wordDef.etymology}</p>
                                )}
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
      </div>

      {/* Game Stats Modal */}
      <GameStatsDialog
        open={showGameStats}
        onOpenChange={setShowGameStats}
      />

      {/* Custom Words Modal */}
      <CustomWordsDialog
        open={showCustomWords}
        onOpenChange={setShowCustomWords}
      />

      {/* Achievement Gallery Modal */}
      <AchievementGallery
        open={showAchievementGallery}
        onOpenChange={setShowAchievementGallery}
        stats={{
          totalWordsCollected: getTotalCount(),
          totalWordsEaten: getTotalCount(),
          poemsCreated: typeof window !== 'undefined' ? parseInt(localStorage.getItem('word-snake-poems-count') ?? '0', 10) : 0,
          highScore,
          categories: [...new Set(getWordList().map(({ word }) => {
            const entry = getWordEntry(word)
            return entry?.category
          }).filter(Boolean))] as string[],
          gamesPlayed: typeof window !== 'undefined' ? parseInt(localStorage.getItem('word-snake-games') ?? '0', 10) : 0,
        }}
      />

      {/* Achievement toast with rotating sparkle */}
      {uiState.lastAchievement && (
        <div className="fixed top-20 right-4 z-[90] animate-in slide-in-from-right-5 fade-in duration-500">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-900/90 border border-amber-600/50 shadow-xl shadow-amber-900/30 backdrop-blur-sm egg-badge-shimmer">
            <span className="text-2xl">{uiState.lastAchievement.emoji}</span>
            <div>
              <p className="text-amber-300 text-sm font-bold">
                {uiState.lastAchievement.title}
                {uiState.achievementQueueSize > 0 && (
                  <span className="text-amber-400/70 text-xs font-normal ml-1.5">(+{uiState.achievementQueueSize} more)</span>
                )}
              </p>
              <p className="text-amber-400/80 text-xs">{uiState.lastAchievement.description}</p>
            </div>
            <Sparkles className="h-4 w-4 text-amber-500 sparkle-spin" />
          </div>
        </div>
      )}

      {/* Milestone celebration toast */}
      {uiState.lastMilestone && (
        <div className="fixed top-36 right-4 z-[91] animate-in slide-in-from-right-5 fade-in duration-500">
          <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-gradient-to-r from-yellow-900/95 via-amber-900/95 to-yellow-900/95 border-2 border-yellow-500/60 shadow-2xl shadow-yellow-600/30 backdrop-blur-sm">
            <span className="text-3xl">{uiState.lastMilestone.emoji}</span>
            <div>
              <p className="text-yellow-300 text-[10px] font-black uppercase tracking-widest mb-0.5">
                Milestone Unlocked!
              </p>
              <p className="text-yellow-200 text-sm font-bold">
                {uiState.lastMilestone.name}
              </p>
              <p className="text-yellow-400/80 text-xs">{uiState.lastMilestone.description}</p>
            </div>
            <Sparkles className="h-5 w-5 text-yellow-400 sparkle-spin" />
          </div>
        </div>
      )}

      {/* Word Pack Unlocked toast */}
      {wordPackToast && (
        <div className="fixed top-52 right-4 z-[92] animate-in slide-in-from-right-5 fade-in duration-500">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-900/90 border border-emerald-600/50 shadow-xl shadow-emerald-900/30 backdrop-blur-sm pack-unlock-burst">
            <span className="text-2xl">{wordPackToast.emoji}</span>
            <div>
              <p className="text-emerald-300 text-sm font-bold">
                New Word Pack Unlocked!
              </p>
              <p className="text-emerald-400/80 text-xs">{wordPackToast.name} — {wordPackToast.description}</p>
            </div>
            <Package className="h-4 w-4 text-emerald-500 sparkle-spin" />
          </div>
        </div>
      )}

      {/* Settings Panel Modal */}
      <SettingsPanel
        open={showSettings}
        onOpenChange={setShowSettings}
        currentSkin={activeSkin}
        onSkinChange={(skin) => { if (!isSkinUnlocked(skin.id)) return; gameStateRef.current.activeSkin = skin.id; setActiveSkin(skin); saveSnakeSkin(skin.id) }}
        currentGridTheme={activeGridTheme}
        onGridThemeChange={(theme) => { gameStateRef.current.gridTheme = theme; setActiveGridTheme(theme); saveGridTheme(theme) }}
        currentSoundTheme={activeSoundTheme}
        onSoundThemeChange={(theme) => { setSoundTheme(theme); setActiveSoundTheme(theme); saveSoundTheme(theme) }}
        currentTrail={activeTrail}
        onTrailChange={(trail) => { setActiveTrail(trail); saveTrail(trail) }}
      />

      {/* Bot Skin Selector Modal */}
      {showBotSkinSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowBotSkinSelector(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-100">🎨 Bot Skins</h3>
              <button onClick={() => setShowBotSkinSelector(false)} className="text-slate-400 hover:text-slate-200 text-xl leading-none">&times;</button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Choose the appearance of your AI Bot opponent. Some skins unlock via score milestones, achievements, or boss defeats.</p>
            <div className="grid gap-2">
              {AI_BOT_SKINS.map((skin) => {
                const unlocked = isBotSkinUnlocked(skin.id)
                const isActive = activeBotSkinRef.current.id === skin.id
                return (
                  <button
                    key={skin.id}
                    onClick={() => {
                      if (!unlocked) return
                      activeBotSkinRef.current = skin
                      saveBotSkin(skin.id)
                      setShowBotSkinSelector(false)
                    }}
                    disabled={!unlocked}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left ${
                      isActive
                        ? 'border-pink-500/60 bg-pink-500/10 shadow-sm'
                        : unlocked
                          ? 'border-slate-700/40 bg-slate-800/40 hover:border-slate-600/60 hover:bg-slate-800/60'
                          : 'border-slate-800/40 bg-slate-900/40 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: skin.headColor + '20' }}>
                      {skin.headEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isActive ? 'text-pink-300' : unlocked ? 'text-slate-200' : 'text-slate-500'}`}>{skin.name}</span>
                        {isActive && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">Active</span>}
                        {!unlocked && <Lock className="h-3 w-3 text-slate-600" />}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{skin.description}</p>
                      {!unlocked && skin.unlockRequirement && (
                        <p className="text-[9px] text-slate-600 mt-0.5">
                          Unlock: {skin.unlockType === 'score' ? `Best score ≥ ${skin.unlockRequirement}` : skin.unlockType === 'achievement' ? `Achievement: ${skin.unlockRequirement}` : skin.unlockType === 'boss' ? `Defeat ${skin.unlockRequirement} bosses` : 'Free'}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: skin.headColor }} title="Head" />
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: skin.bodyColor }} title="Body" />
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: skin.bodyColorEnd }} title="Body End" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Speed Run best score display */}
      {mounted && speedRunBest.totalRuns > 0 && !uiState.gameStarted && (
        <div className="text-center mt-1">
          <span className="text-[10px] text-rose-400/60">
            Speed Run Best: {speedRunBest.bestScore} pts ({speedRunBest.totalRuns} runs)
          </span>
        </div>
      )}

      {/* Replay Dialog */}
      {showReplayDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-purple-700/40 rounded-xl p-5 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-2xl shadow-purple-900/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
                <Film className="h-5 w-5" /> Game Replays
              </h3>
              <button onClick={() => setShowReplayDialog(false)} className="text-slate-400 hover:text-white transition-colors p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            {replayList.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2 animate-float">🎬</div>
                <p className="text-slate-400 text-sm">No replays yet</p>
                <p className="text-slate-500 text-xs mt-1">Play a game to record it automatically!</p>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 -mx-1">
                  <div className="space-y-2 px-1">
                    {replayList.map((replay) => (
                      <div key={replay.id} className="replay-card-enter bg-slate-800/60 border border-slate-700/40 rounded-lg p-3 hover:border-purple-600/40 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-400">{formatDate(replay.date)}</span>
                          <div className="flex items-center gap-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              replay.difficulty === 'easy' ? 'bg-green-900/50 text-green-400' :
                              replay.difficulty === 'hard' ? 'bg-red-900/50 text-red-400' :
                              'bg-amber-900/50 text-amber-400'
                            }`}>{replay.difficulty}</span>
                            {replay.isDailyChallenge && <span className="text-[10px] text-amber-400">📅</span>}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-white font-bold text-lg">{replay.finalScore}</span>
                            <span className="text-slate-400 text-xs ml-2">pts</span>
                            <span className="text-slate-500 text-xs ml-2">{replay.wordsCollected.length}w</span>
                            <span className="text-slate-500 text-xs ml-1">{formatDuration(replay.duration)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setShowReplayDialog(false)
                                loadAndPlayReplay(replay)
                              }}
                              className="p-1.5 bg-purple-600/80 hover:bg-purple-500 rounded-md transition-colors"
                              title="Watch replay"
                            >
                              <Play className="h-3.5 w-3.5 text-white" />
                            </button>
                            <button
                              onClick={() => {
                                deleteReplay(replay.id)
                                setReplayList(getReplays())
                              }}
                              className="p-1.5 bg-slate-700/80 hover:bg-red-900/60 rounded-md transition-colors"
                              title="Delete replay"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-slate-400" />
                            </button>
                          </div>
                        </div>
                        {replay.maxCombo > 1 && (
                          <span className="text-[10px] text-orange-400/70">🔥 Max combo: ×{replay.maxCombo}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">{replayList.length}/10 slots</span>
                  {replayList.length > 0 && (
                    <button
                      onClick={() => { clearAllReplays(); setReplayList([]) }}
                      className="text-[10px] text-slate-500 hover:text-red-400 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Round 37: Mode Engine HUD Overlay */}
      {!replayMode && uiState.gameStarted && !uiState.gameOver && modeDisplayInfo.modeName !== 'Classic' && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <div className="bg-slate-900/85 backdrop-blur-sm border border-cyan-600/40 rounded-lg px-3 py-1.5 flex items-center gap-3 shadow-lg mode-hud-badge">
            <span className="text-cyan-300 font-bold text-xs flex items-center gap-1">
              <span>{modeDisplayInfo.modeEmoji}</span>
              <span>{modeDisplayInfo.modeName}</span>
            </span>
            {/* Round 41: Mode timer wire display */}
            {modeTimerDisplay.isActive && (
              <>
                <div className="w-px h-4 bg-slate-700/50" />
                <span className={`text-xs font-mono font-bold ${modeTimerDisplay.warningLevel === 'critical' ? 'text-red-400 animate-pulse' : modeTimerDisplay.warningLevel === 'warning' ? 'text-amber-400' : 'text-white'}`}>
                  {modeTimerDisplay.formatted}
                </span>
                <div className="w-16 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${modeTimerDisplay.warningLevel === 'critical' ? 'bg-red-500' : modeTimerDisplay.warningLevel === 'warning' ? 'bg-amber-500' : 'bg-cyan-400'}`}
                    style={{ width: `${modeTimerDisplay.progress}%` }}
                  />
                </div>
              </>
            )}
            {!modeTimerDisplay.isActive && modeDisplayInfo.timeDisplay && (
              <>
                <div className="w-px h-4 bg-slate-700/50" />
                <span className="text-white text-xs font-mono">{modeDisplayInfo.timeDisplay}</span>
              </>
            )}
            {modeDisplayInfo.livesDisplay && (
              <>
                <div className="w-px h-4 bg-slate-700/50" />
                <span className="text-rose-300 text-xs">{modeDisplayInfo.livesDisplay}</span>
              </>
            )}
            <div className="w-px h-4 bg-slate-700/50" />
            <span className="text-amber-300 text-[10px] font-bold">{modeDisplayInfo.multiplierDisplay || '×1.0'}</span>
          </div>
        </div>
      )}

      {/* Replay Mode Overlay */}
      {replayMode && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <div className="bg-red-900/90 border border-red-600/60 rounded-lg px-3 py-1.5 flex items-center gap-3 shadow-lg replay-badge-glow">
            <span className="text-red-300 font-bold text-xs tracking-wider">REPLAY</span>
            <div className="w-px h-4 bg-red-700/50" />
            <button onClick={() => setReplaySpeed(s => Math.max(0.5, s - 0.5))} className="text-white/70 hover:text-white transition-colors p-0.5">
              <SkipBack className="h-3 w-3" />
            </button>
            <span className="text-white text-xs font-mono w-10 text-center">{replaySpeed}x</span>
            <button onClick={() => setReplaySpeed(s => Math.min(4, s + 0.5))} className="text-white/70 hover:text-white transition-colors p-0.5">
              <SkipForward className="h-3 w-3" />
            </button>
            <div className="w-px h-4 bg-red-700/50" />
            <button onClick={() => setReplayPaused(p => !p)} className="text-white/70 hover:text-white transition-colors p-0.5">
              {replayPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </button>
            <button
              onClick={exitReplayMode}
              className="text-red-400 hover:text-red-300 transition-colors text-xs font-medium ml-1"
            >
              Exit
            </button>
          </div>
        </div>
      )}

      {/* Replay Progress Bar */}
      {replayMode && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-sm">
          <div className="h-1 bg-slate-700 w-full">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-200 relative overflow-hidden"
              style={{ width: `${replayProgress * 100}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent replay-progress-shine" />
            </div>
          </div>
        </div>
      )}

      {/* Word Book Overlay */}
      <WordBook isOpen={showWordBook} onClose={() => setShowWordBook(false)} />
      <StoryModePrologue isOpen={showStoryMode} onClose={() => setShowStoryMode(false)} onStartGame={() => { setShowStoryMode(false); resetGame() }} />

      {/* Round 43b: Story Mode Level Select Panel */}
      {showStoryLevelSelect && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowStoryLevelSelect(false)}>
          <div className="bg-slate-900/95 border border-slate-700/50 rounded-xl p-4 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl story-level-panel" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-amber-400">🗺️ Story Mode — Level Select</h3>
              <button onClick={() => setShowStoryLevelSelect(false)} className="text-slate-500 hover:text-slate-300 text-lg">✕</button>
            </div>
            <StoryLevelSelectContent />
          </div>
        </div>
      )}

      {/* Round 46: Word Dictionary Panel */}
      {showDictionaryPanel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowDictionaryPanel(false)}>
          <div className="bg-slate-900/95 border border-indigo-700/50 rounded-xl p-4 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl dictionary-panel" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-indigo-400">📖 Word Dictionary</h3>
              <button onClick={() => setShowDictionaryPanel(false)} className="text-slate-500 hover:text-slate-300 text-lg">✕</button>
            </div>
            <DictionaryPanelContent />
          </div>
        </div>
      )}

      {/* Round 46: Stats Export Panel */}
      {showStatsExportPanel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowStatsExportPanel(false)}>
          <div className="bg-slate-900/95 border border-emerald-700/50 rounded-xl p-4 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl stats-export-panel" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-emerald-400">📤 Export Stats</h3>
              <button onClick={() => setShowStatsExportPanel(false)} className="text-slate-500 hover:text-slate-300 text-lg">✕</button>
            </div>
            <StatsExportPanelContent />
          </div>
        </div>
      )}

      {/* Round 46: Replay Sharing Panel */}
      {showReplaySharePanel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowReplaySharePanel(false)}>
          <div className="bg-slate-900/95 border border-violet-700/50 rounded-xl p-4 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl replay-share-panel" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-violet-400">🔗 Share Replay</h3>
              <button onClick={() => setShowReplaySharePanel(false)} className="text-slate-500 hover:text-slate-300 text-lg">✕</button>
            </div>
            <ReplaySharePanelContent />
          </div>
        </div>
      )}

      {/* Round 46: Poem Studio Panel */}
      {showPoemStudioPanel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowPoemStudioPanel(false)}>
          <div className="bg-slate-900/95 border border-pink-700/50 rounded-xl p-4 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl poem-studio-panel" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-pink-400">✨ Poem Studio</h3>
              <button onClick={() => setShowPoemStudioPanel(false)} className="text-slate-500 hover:text-slate-300 text-lg">✕</button>
            </div>
            <PoemStudioPanelContent />
          </div>
        </div>
      )}

      {/* Round 45: XP Progression Panel */}
      {showXPDetailPanel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowXPDetailPanel(false)}>
          <div className="bg-slate-900/95 border border-cyan-700/50 rounded-xl p-4 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl xp-progression-panel" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-cyan-400">🆙 XP & Level Progression</h3>
              <button onClick={() => setShowXPDetailPanel(false)} className="text-slate-500 hover:text-slate-300 text-lg">✕</button>
            </div>
            <XPProgressionPanelContent />
          </div>
        </div>
      )}

      {/* Round 45: Replay Analyzer Panel */}
      {showReplayPanel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowReplayPanel(false)}>
          <div className="bg-slate-900/95 border border-rose-700/50 rounded-xl p-4 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl replay-analyzer-panel" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-rose-400">📼 Replay Analyzer</h3>
              <button onClick={() => setShowReplayPanel(false)} className="text-slate-500 hover:text-slate-300 text-lg">✕</button>
            </div>
            <ReplayAnalyzerPanelContent />
          </div>
        </div>
      )}

      {/* Round 45: Achievement Showcase Panel */}
      {showAchShowcase && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowAchShowcase(false)}>
          <div className="bg-slate-900/95 border border-fuchsia-700/50 rounded-xl p-4 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl ach-showcase-panel" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-fuchsia-400">🏅 Achievement Showcase</h3>
              <button onClick={() => setShowAchShowcase(false)} className="text-slate-500 hover:text-slate-300 text-lg">✕</button>
            </div>
            <AchievementShowcasePanelContent />
          </div>
        </div>
      )}

      <StatsComparison isOpen={showStatsComparison} onClose={() => setShowStatsComparison(false)} />

      {/* Shop Modal */}
      {showShop && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowShop(false)}>
          <div className="glass-morphism-card rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl shadow-amber-900/30 max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">🛒 Coin Shop <span className="text-sm font-normal text-amber-300/70">{formatCoins(getCoinBalance().coins)}</span></h2>
              <button onClick={() => setShowShop(false)} className="text-slate-400 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {getShopItems().map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/30 hover:border-amber-600/40 transition-colors">
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{item.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${item.category === 'cosmetic' ? 'bg-pink-900/40 text-pink-300' : item.category === 'perk' ? 'bg-green-900/40 text-green-300' : 'bg-purple-900/40 text-purple-300'}`}>{item.category}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{item.description}</p>
                    {item.maxPurchases > 0 && (
                      <p className="text-[10px] text-slate-500">{item.consumable ? `Uses: ${item.purchasedCount}/${item.maxPurchases}` : item.purchasedCount > 0 ? '✓ Owned' : `Limited: ${item.maxPurchases}`}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const result = purchaseItem(item.id)
                      if (result.success) {
                        gameStateRef.current.coinBalance = result.newBalance
                        gameStateRef.current.shopItems = getShopItems()
                        updateUI()
                        toast({ title: `Purchased ${item.name}!`, description: item.emoji + ' ' + item.description })
                      } else {
                        toast({ title: 'Purchase failed', description: result.reason === 'insufficient_coins' ? 'Not enough coins!' : result.reason === 'max_purchased' ? 'Already maxed out!' : 'Unknown error', variant: 'destructive' })
                      }
                    }}
                    disabled={item.maxPurchases !== -1 && item.purchasedCount >= item.maxPurchases}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${item.maxPurchases !== -1 && item.purchasedCount >= item.maxPurchases ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/30'}`}
                  >
                    {formatCoins(item.cost)}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Round 47: Game Settings Panel */}
      {showGameSettingsPanel && mounted && (() => {
        const overview = getSettingsOverview()
        const completion = getSettingsCompletion()
        const activePreset = getActivePresetName()
        const presets = getPresets()
        const mostChanged = getMostChangedSettings()
        const gameplay = getGameplaySettings()
        const audio = getAudioSettings()
        const visual = getVisualSettings()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowGameSettingsPanel(false)}>
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-[520px] max-h-[85vh] overflow-y-auto p-5 game-settings-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-200 text-lg font-bold">⚙️ Game Settings</span>
                <button onClick={() => setShowGameSettingsPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Settings Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-slate-800 rounded-lg p-2.5 text-center r47-settings-stat">
                  <div className="text-emerald-400 text-lg font-bold">{completion.modifiedCount}</div>
                  <div className="text-slate-500 text-[10px]">Modified</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2.5 text-center r47-settings-stat">
                  <div className="text-cyan-400 text-lg font-bold">{activePreset || 'Custom'}</div>
                  <div className="text-slate-500 text-[10px]">Active Preset</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2.5 text-center r47-settings-stat">
                  <div className="text-amber-400 text-lg font-bold">{completion.percentage}%</div>
                  <div className="text-slate-500 text-[10px]">Customized</div>
                </div>
              </div>
              {/* Presets */}
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Presets</span>
                <div className="grid grid-cols-3 gap-1.5 mt-2">
                  {presets.slice(0, 6).map(p => (
                    <button key={p.name} onClick={() => { gsApplyPreset(p.name); toast({ title: `Applied ${p.name}`, description: p.description || '' }) }}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all active:scale-95 r47-preset-item ${activePreset === p.name ? 'bg-emerald-700 text-emerald-100 ring-1 ring-emerald-500' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Gameplay Settings */}
              <div className="mb-3">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🎮 Gameplay</span>
                <div className="space-y-1.5 mt-1.5">
                  {Object.entries(gameplay as Record<string, unknown>).slice(0, 5).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center bg-slate-800/60 rounded-lg px-2.5 py-1.5 r47-setting-row">
                      <span className="text-slate-400 text-[11px]">{String(k).replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-slate-200 text-[11px] font-mono">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Audio Settings */}
              <div className="mb-3">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🔊 Audio</span>
                <div className="space-y-1.5 mt-1.5">
                  {Object.entries(audio as Record<string, unknown>).slice(0, 4).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center bg-slate-800/60 rounded-lg px-2.5 py-1.5 r47-setting-row">
                      <span className="text-slate-400 text-[11px]">{String(k).replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-slate-200 text-[11px] font-mono">{typeof v === 'number' ? `${Math.round(v * 100)}%` : String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Visual Settings */}
              <div className="mb-3">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🎨 Visual</span>
                <div className="space-y-1.5 mt-1.5">
                  {Object.entries(visual as Record<string, unknown>).slice(0, 5).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center bg-slate-800/60 rounded-lg px-2.5 py-1.5 r47-setting-row">
                      <span className="text-slate-400 text-[11px]">{String(k).replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-slate-200 text-[11px] font-mono">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Most Changed */}
              {mostChanged.length > 0 && (
                <div className="mb-3">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">📊 Most Changed</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {mostChanged.slice(0, 5).map(m => (
                      <span key={m.key} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded-full r47-changed-badge">{String(m.key).replace(/([A-Z])/g, ' $1').trim()} <span className="text-amber-400">({m.count}x)</span></span>
                    ))}
                  </div>
                </div>
              )}
              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button onClick={() => { const data = gsExportSettings('json'); navigator.clipboard.writeText(data); toast({ title: 'Settings exported!', description: 'Copied to clipboard' }) }}
                  className="flex-1 bg-cyan-700 hover:bg-cyan-600 text-white text-xs py-2 rounded-lg transition-all active:scale-95 r47-action-btn">
                  📋 Export
                </button>
                <button onClick={() => { resetAllSettings(); toast({ title: 'Settings reset!', description: 'All settings restored to defaults' }) }}
                  className="flex-1 bg-rose-700 hover:bg-rose-600 text-white text-xs py-2 rounded-lg transition-all active:scale-95 r47-action-btn">
                  🔄 Reset All
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Round 47: Player Stats Compare Panel */}
      {showStatsComparePanel && mounted && (() => {
        const overview = getComparisonOverview()
        const thisWeek = getPeriodStats('thisWeek')
        const lastWeek = getPeriodStats('lastWeek')
        const comparison = comparePeriods('thisWeek', 'lastWeek')
        const skillRating = calculateSkillRating()
        const skillTier = getSkillTier()
        const skillProgress = getSkillProgress()
        const insights = getInsights(5)
        const strengths = getStrengths()
        const weaknesses = getWeakMetrics()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowStatsComparePanel(false)}>
            <div className="bg-slate-900 border border-cyan-800/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 stats-compare-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-cyan-300 text-lg font-bold">📊 Stats Compare</span>
                <button onClick={() => setShowStatsComparePanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Skill Tier */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-xl p-3 mb-4 r47-skill-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider">Skill Rating</div>
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{skillRating}</div>
                    <div className="text-slate-300 text-xs">{skillTier}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-500 text-[10px]">Next: {skillTier.nextTier || 'MAX'}</div>
                    <div className="text-emerald-400 text-sm font-bold">{skillProgress.progress}%</div>
                    <div className="w-24 h-1.5 bg-slate-700 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all r47-skill-bar" style={{ width: `${skillProgress.progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              {/* This Week vs Last Week */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-800 rounded-lg p-2.5 r47-period-card">
                  <div className="text-cyan-400 text-[10px] uppercase font-semibold">This Week</div>
                  <div className="text-white text-lg font-bold">{thisWeek.gamesPlayed}</div>
                  <div className="text-slate-400 text-[10px]">games • avg {thisWeek.avgScore}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2.5 r47-period-card">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Last Week</div>
                  <div className="text-white text-lg font-bold">{lastWeek.gamesPlayed}</div>
                  <div className="text-slate-400 text-[10px]">games • avg {lastWeek.avgScore}</div>
                </div>
              </div>
              {/* Comparison Changes */}
              {comparison.changes && comparison.changes.length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Weekly Changes</span>
                  <div className="space-y-1 mt-1.5">
                    {comparison.changes.slice(0, 6).map((c: { metric: string; change: number; label: string }, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-slate-800/60 rounded-lg px-2.5 py-1.5 r47-compare-row">
                        <span className="text-slate-400 text-[11px]">{c.metric}</span>
                        <span className={`text-[11px] font-bold ${c.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {c.change >= 0 ? '↑' : '↓'} {Math.abs(c.change).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <span className="text-emerald-400 text-[10px] uppercase font-semibold">💪 Strengths</span>
                  <div className="space-y-1 mt-1">
                    {strengths.slice(0, 3).map((s: string, i: number) => (
                      <div key={i} className="bg-emerald-900/20 text-emerald-300 text-[10px] px-2 py-1 rounded r47-strength-item">{s}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-rose-400 text-[10px] uppercase font-semibold">⚠️ Weaknesses</span>
                  <div className="space-y-1 mt-1">
                    {weaknesses.slice(0, 3).map((w: string, i: number) => (
                      <div key={i} className="bg-rose-900/20 text-rose-300 text-[10px] px-2 py-1 rounded r47-weakness-item">{w}</div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Insights */}
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">💡 Insights</span>
                <div className="space-y-1.5 mt-1.5">
                  {insights.slice(0, 4).map((insight: string, i: number) => (
                    <div key={i} className="bg-slate-800/60 text-slate-300 text-[11px] px-2.5 py-1.5 rounded-lg r47-insight-item">{insight}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Round 47: Challenge Mode Panel */}
      {showChallengePanel && mounted && (() => {
        const overview = getChallengeOverview()
        const templates = getChallengeTemplates()
        const daily = cmGetDailyChallenge()
        const dailyProgress = getDailyChallengeProgress()
        const dailyStreak = getDailyChallengeStreak()
        const dailyBonus = getDailyRewardBonus()
        const stats = getChallengeStats()
        const recommended = getRecommendedChallenges()
        const active = getActiveChallenge()
        const available = getAvailableChallenges()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowChallengePanel(false)}>
            <div className="bg-slate-900 border border-rose-800/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 challenge-mode-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-rose-300 text-lg font-bold">🎯 Challenges</span>
                <button onClick={() => setShowChallengePanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Active Challenge */}
              {active && (
                <div className="bg-gradient-to-r from-rose-900/40 to-amber-900/30 rounded-xl p-3 mb-4 border border-rose-700/30 r47-active-challenge">
                  <div className="text-amber-400 text-[10px] uppercase tracking-wider font-bold">⚡ Active Challenge</div>
                  <div className="text-white font-bold text-sm mt-1">{active.name}</div>
                  <div className="text-slate-300 text-[11px] mt-0.5">{active.description}</div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all r47-challenge-progress-bar" style={{ width: `${Math.min(100, getChallengeProgress(active.id).percentage)}%` }} />
                    </div>
                    <span className="text-rose-300 text-[11px] font-bold">{getChallengeProgress(active.id).percentage}%</span>
                  </div>
                </div>
              )}
              {/* Daily Challenge */}
              <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl p-3 mb-4 border border-purple-700/30 r47-daily-challenge">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-purple-400 text-[10px] uppercase tracking-wider font-bold">📅 Daily Challenge</div>
                    <div className="text-white font-bold text-sm mt-1">{daily.name}</div>
                    <div className="text-slate-300 text-[11px]">{daily.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 text-xs font-bold">{dailyBonus}x bonus</div>
                    <div className="text-slate-400 text-[10px]">🔥 {dailyStreak} day streak</div>
                  </div>
                </div>
                <button onClick={() => { if (!active) { startChallenge(daily.id); toast({ title: `Started: ${daily.name}`, description: daily.description }) } else { toast({ title: 'Challenge already active', description: 'Complete or cancel the current challenge first' }) } }}
                  className={`w-full mt-2 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${active ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500'} r47-start-btn`}>
                  {active ? 'Challenge in Progress' : 'Start Daily Challenge'}
                </button>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-slate-800 rounded-lg p-2 text-center r47-challenge-stat">
                  <div className="text-rose-400 text-lg font-bold">{stats.totalAttempted}</div>
                  <div className="text-slate-500 text-[9px]">Attempted</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r47-challenge-stat">
                  <div className="text-emerald-400 text-lg font-bold">{stats.totalCompleted}</div>
                  <div className="text-slate-500 text-[9px]">Completed</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r47-challenge-stat">
                  <div className="text-amber-400 text-lg font-bold">{stats.completionRate}%</div>
                  <div className="text-slate-500 text-[9px]">Rate</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r47-challenge-stat">
                  <div className="text-purple-400 text-lg font-bold">{stats.challengeStreak || 0}</div>
                  <div className="text-slate-500 text-[9px]">Streak</div>
                </div>
              </div>
              {/* Challenge List */}
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Available Challenges</span>
                <div className="space-y-1.5 mt-2 max-h-[240px] overflow-y-auto">
                  {available.slice(0, 8).map(t => {
                    const card = getChallengeCard(t.id)
                    return (
                      <div key={t.id} className="bg-slate-800/60 rounded-lg px-3 py-2 flex items-center justify-between r47-challenge-card">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{t.icon}</span>
                            <span className="text-slate-200 text-[12px] font-semibold">{t.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${t.difficulty === 'easy' ? 'bg-emerald-900/50 text-emerald-300' : t.difficulty === 'medium' ? 'bg-amber-900/50 text-amber-300' : t.difficulty === 'hard' ? 'bg-rose-900/50 text-rose-300' : 'bg-purple-900/50 text-purple-300'}`}>{t.difficulty}</span>
                          </div>
                          <div className="text-slate-500 text-[10px] mt-0.5">{t.description}</div>
                        </div>
                        <button onClick={() => { if (!active) { startChallenge(t.id); toast({ title: `Started: ${t.name}` }) } }}
                          className={`ml-2 px-2 py-1 rounded text-[10px] font-bold transition-all active:scale-95 ${card.completed ? 'bg-emerald-800 text-emerald-300' : 'bg-rose-700 text-white hover:bg-rose-600'} r47-challenge-start`}>
                          {card.completed ? '✓ Done' : 'Start'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Round 47: Word Art Gallery Panel */}
      {showArtGalleryPanel && mounted && (() => {
        const overview = getGalleryOverview()
        const recent = getRecentArt(8)
        const stats = getGalleryStats()
        const favorites = artGetFavorites()
        const themes = getArtThemes()
        const frames = getFrameStyles()
        const suggestion = getAutoArtSuggestion()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowArtGalleryPanel(false)}>
            <div className="bg-slate-900 border border-fuchsia-800/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 art-gallery-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-fuchsia-300 text-lg font-bold">🖼️ Word Art Gallery</span>
                <button onClick={() => setShowArtGalleryPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Gallery Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-slate-800 rounded-lg p-2 text-center r47-art-stat">
                  <div className="text-fuchsia-400 text-lg font-bold">{stats.totalItems}</div>
                  <div className="text-slate-500 text-[9px]">Art Pieces</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r47-art-stat">
                  <div className="text-amber-400 text-lg font-bold">{favorites.length}</div>
                  <div className="text-slate-500 text-[9px]">Favorites</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r47-art-stat">
                  <div className="text-cyan-400 text-lg font-bold">{Object.keys(stats.byStyle || {}).length}</div>
                  <div className="text-slate-500 text-[9px]">Styles</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r47-art-stat">
                  <div className="text-emerald-400 text-lg font-bold">{Object.keys(stats.byCategory || {}).length}</div>
                  <div className="text-slate-500 text-[9px]">Categories</div>
                </div>
              </div>
              {/* Quick Generate */}
              <div className="bg-gradient-to-r from-fuchsia-900/20 to-purple-900/20 rounded-xl p-3 mb-4 border border-fuchsia-700/20 r47-quick-gen">
                <div className="text-fuchsia-400 text-[10px] uppercase tracking-wider font-bold">✨ Quick Generate</div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['wave', 'grid', 'rainbow', 'neon', 'banner', 'tower', 'pixel', 'minimal'].map(style => (
                    <button key={style} onClick={() => {
                      const words = ['snake', 'word', 'game', 'score', 'combo', 'speed', 'level', 'power']
                      const art = generateWordArt(words, style)
                      if (art) toast({ title: `${style} art generated!`, description: 'Check the gallery' })
                    }}
                      className="px-2 py-1 bg-slate-800 hover:bg-fuchsia-800/40 text-fuchsia-300 text-[10px] rounded-lg transition-all active:scale-95 r47-gen-style">
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              {/* Auto Suggestion */}
              {suggestion && (
                <div className="bg-slate-800/50 rounded-lg p-2.5 mb-4 r47-suggestion">
                  <div className="text-amber-400 text-[10px] uppercase font-bold">💡 Suggestion</div>
                  <div className="text-slate-300 text-[11px] mt-0.5">{suggestion.suggestion || suggestion}</div>
                </div>
              )}
              {/* Recent Art */}
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Recent Art</span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {recent.slice(0, 6).map((item: { id: string; title?: string; style: string; content: string; createdAt: number }, i: number) => (
                    <div key={item.id || i} className="bg-slate-800 rounded-lg p-2.5 r47-art-item">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-200 text-[11px] font-semibold truncate">{item.title || item.style}</span>
                        <span className="text-fuchsia-400 text-[9px] bg-fuchsia-900/30 px-1.5 py-0.5 rounded">{item.style}</span>
                      </div>
                      <pre className="text-[8px] text-slate-400 font-mono whitespace-pre-wrap break-all max-h-20 overflow-hidden bg-black/30 rounded p-1.5">{(item.content || '').substring(0, 120)}</pre>
                      <div className="flex gap-1 mt-1.5">
                        <button onClick={() => artToggleFavorite(item.id)}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 hover:bg-amber-700/30 hover:text-amber-300 transition-all r47-art-fav">
                          ♡ Favorite
                        </button>
                        <button onClick={() => { deleteGalleryItem(item.id); toast({ title: 'Art deleted' }) }}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 hover:bg-rose-700/30 hover:text-rose-300 transition-all r47-art-del">
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {recent.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-slate-500 text-sm r47-empty-gallery">
                      No art yet. Generate your first piece above!
                    </div>
                  )}
                </div>
              </div>
              {/* Themes & Frames */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">🎨 Themes</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {themes.slice(0, 6).map(t => (
                      <span key={t.id} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 r47-theme-badge">{t.name}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">🖼️ Frames</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {frames.slice(0, 5).map(f => (
                      <span key={f.id} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 r47-frame-badge">{f.name}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Round 48: Soundtrack Manager Panel */}
      {showSoundtrackPanel && mounted && (() => {
        const overview = getSoundtrackOverview()
        const library = getMusicLibrary()
        const nowPlaying = getCurrentTrack()
        const playback = stGetPlaybackState()
        const ambients = getAmbientSounds()
        const activeAmbients = getActiveAmbients()
        const mostPlayed = getMostPlayed()
        const genres = getGenreDistribution()
        const listeningTime = getListeningTime()
        const playlists = getPlaylists()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowSoundtrackPanel(false)}>
            <div className="bg-slate-900 border border-violet-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 soundtrack-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-violet-300 text-lg font-bold">🎵 Soundtrack Manager</span>
                <button onClick={() => setShowSoundtrackPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Now Playing */}
              {nowPlaying && (
                <div className="bg-gradient-to-r from-violet-900/30 to-indigo-900/30 rounded-xl p-3 mb-4 border border-violet-700/30 r48-now-playing">
                  <div className="text-violet-400 text-[10px] uppercase tracking-wider font-bold">♪ Now Playing</div>
                  <div className="text-white font-bold text-sm mt-1">{nowPlaying.name}</div>
                  <div className="text-slate-400 text-[11px]">{nowPlaying.genre} • {nowPlaying.mood} • {nowPlaying.bpm} BPM</div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => stPause()} className="px-3 py-1 bg-violet-700 hover:bg-violet-600 text-white text-[10px] rounded-lg transition-all active:scale-95 r48-play-btn">⏸ Pause</button>
                    <button onClick={() => stNext()} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] rounded-lg transition-all active:scale-95 r48-play-btn">⏭ Next</button>
                    <button onClick={() => stPrev()} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] rounded-lg transition-all active:scale-95 r48-play-btn">⏮ Prev</button>
                  </div>
                </div>
              )}
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-slate-800 rounded-lg p-2 text-center r48-sound-stat">
                  <div className="text-violet-400 text-lg font-bold">{library.length}</div>
                  <div className="text-slate-500 text-[9px]">Tracks</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r48-sound-stat">
                  <div className="text-amber-400 text-lg font-bold">{Math.round(listeningTime)}m</div>
                  <div className="text-slate-500 text-[9px]">Listened</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r48-sound-stat">
                  <div className="text-cyan-400 text-lg font-bold">{playlists.length}</div>
                  <div className="text-slate-500 text-[9px]">Playlists</div>
                </div>
              </div>
              {/* Music Library */}
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🎶 Music Library</span>
                <div className="space-y-1 mt-1.5 max-h-[150px] overflow-y-auto">
                  {library.slice(0, 8).map(t => (
                    <div key={t.id} className="flex items-center justify-between bg-slate-800/60 rounded-lg px-2.5 py-1.5 r48-track-item">
                      <div className="flex-1">
                        <span className="text-slate-200 text-[11px] font-medium">{t.name}</span>
                        <span className="text-slate-500 text-[9px] ml-1.5">{t.genre}</span>
                      </div>
                      <button onClick={() => { stPlay(t.id); toast({ title: `Playing: ${t.name}` }) }}
                        className="text-[10px] px-2 py-0.5 bg-violet-700 hover:bg-violet-600 text-white rounded transition-all active:scale-95 r48-play-btn">
                        ▶
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {/* Ambient Sounds */}
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🌊 Ambient Sounds</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {ambients.slice(0, 7).map(s => (
                    <button key={s.id} onClick={() => toggleAmbient(s.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all active:scale-95 r48-ambient-btn ${activeAmbients.some((a: { id: string }) => a.id === s.id) ? 'bg-cyan-700 text-cyan-100 ring-1 ring-cyan-500' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                      {s.icon} {s.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Genre Distribution */}
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">📊 Genre Distribution</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {Object.entries(genres).slice(0, 7).map(([g, c]) => (
                    <span key={g} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded-full r48-genre-badge">{g} <span className="text-violet-400">{c as number}</span></span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Round 48: Social Activity Feed Panel */}
      {showSocialFeedPanel && mounted && (() => {
        const feed = getActivityFeed(20)
        const stats = getActivityStats()
        const highlights = getHighlights('week')
        const trending = getTrendingActivity()
        const currentStatus = getCurrentStatus()
        const mood = getMood()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowSocialFeedPanel(false)}>
            <div className="bg-slate-900 border border-sky-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 social-feed-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sky-300 text-lg font-bold">👥 Social Activity Feed</span>
                <button onClick={() => setShowSocialFeedPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Status + Mood */}
              <div className="bg-slate-800/50 rounded-lg p-2.5 mb-4 r48-status-bar">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-slate-400 text-[10px] uppercase">Status</div>
                    <div className="text-slate-200 text-[11px]">{currentStatus || 'No status set'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 text-[10px]">Mood</div>
                    <div className="text-lg">{mood || '😊'}</div>
                  </div>
                </div>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-slate-800 rounded-lg p-2 text-center r48-feed-stat">
                  <div className="text-sky-400 text-lg font-bold">{stats.totalPosts}</div>
                  <div className="text-slate-500 text-[9px]">Posts</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r48-feed-stat">
                  <div className="text-emerald-400 text-lg font-bold">{Object.keys(stats.byType || {}).length}</div>
                  <div className="text-slate-500 text-[9px]">Types</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r48-feed-stat">
                  <div className="text-amber-400 text-lg font-bold">{stats.averagePerDay}</div>
                  <div className="text-slate-500 text-[9px]">Avg/Day</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r48-feed-stat">
                  <div className="text-violet-400 text-lg font-bold">{stats.streakDays || 0}</div>
                  <div className="text-slate-500 text-[9px]">Streak</div>
                </div>
              </div>
              {/* Highlights */}
              {highlights.length > 0 && (
                <div className="mb-4">
                  <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">🌟 This Week Highlights</span>
                  <div className="space-y-1 mt-1.5">
                    {highlights.slice(0, 3).map((h: { id: string; type: string; data: Record<string, unknown> }, i: number) => (
                      <div key={h.id || i} className="bg-amber-900/10 border border-amber-800/20 rounded-lg px-2.5 py-1.5 r48-highlight">
                        <span className="text-amber-400 text-sm">{getActivityIcon(h.type)}</span>
                        <span className="text-slate-300 text-[11px] ml-1">{formatActivity(h)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Activity Feed */}
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">📋 Recent Activity</span>
                <div className="space-y-1.5 mt-1.5 max-h-[200px] overflow-y-auto">
                  {feed.slice(0, 10).map((a: { id: string; type: string; timestamp: number }, i: number) => (
                    <div key={a.id || i} className="flex items-start gap-2 bg-slate-800/60 rounded-lg px-2.5 py-1.5 r48-feed-item">
                      <span className="text-sm mt-0.5">{getActivityIcon(a.type)}</span>
                      <div className="flex-1">
                        <div className="text-slate-300 text-[11px]">{formatActivity(a)}</div>
                        <div className="text-slate-500 text-[9px] mt-0.5">{new Date(a.timestamp).toLocaleDateString()}</div>
                      </div>
                      <button onClick={() => { addReaction(a.id, '👍'); toast({ title: 'Reacted!', description: '👍' }) }}
                        className="text-[10px] px-1.5 py-0.5 bg-slate-700 hover:bg-sky-700/30 text-slate-300 rounded transition-all r48-react-btn">
                        👍
                      </button>
                    </div>
                  ))}
                  {feed.length === 0 && (
                    <div className="text-center py-4 text-slate-500 text-sm r48-empty-feed">No activity yet. Play some games!</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Round 48: Inventory System Panel */}
      {showInventoryPanel && mounted && (() => {
        const summary = getInventorySummary()
        const balances = getBalances()
        const cosmetics = getCosmetics()
        const consumables = getConsumables()
        const equipped = getEquippedCosmetics()
        const materials = getMaterials()
        const deals = getDailyShopDeals()
        const wishlist = getWishlist()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowInventoryPanel(false)}>
            <div className="bg-slate-900 border border-amber-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 inventory-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-amber-300 text-lg font-bold">🎒 Inventory</span>
                <button onClick={() => setShowInventoryPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Currency Balances */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-slate-800 rounded-lg p-2 text-center r48-currency">
                  <div className="text-amber-400 text-lg font-bold">{balances.coins}</div>
                  <div className="text-slate-500 text-[9px]">🪙 Coins</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r48-currency">
                  <div className="text-violet-400 text-lg font-bold">{balances.gems}</div>
                  <div className="text-slate-500 text-[9px]">💎 Gems</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r48-currency">
                  <div className="text-sky-400 text-lg font-bold">{balances.stars}</div>
                  <div className="text-slate-500 text-[9px]">⭐ Stars</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r48-currency">
                  <div className="text-emerald-400 text-lg font-bold">{summary.totalItems}</div>
                  <div className="text-slate-500 text-[9px]">Items</div>
                </div>
              </div>
              {/* Equipped Cosmetics */}
              {Object.keys(equipped).length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">✨ Equipped</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {Object.entries(equipped).map(([slot, item]: [string, { name: string; rarity: string }]) => (
                      <span key={slot} className="bg-slate-800 text-[10px] px-2 py-1 rounded-lg r48-equipped" style={{ borderColor: getRarityColor(item.rarity), borderWidth: 1 }}>
                        {item.name} <span className="text-slate-500">({slot})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Consumables */}
              {consumables.length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🧪 Consumables</span>
                  <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                    {consumables.slice(0, 4).map((c: { id: string; name: string; quantity: number }, i: number) => (
                      <div key={c.id || i} className="bg-slate-800/60 rounded-lg px-2.5 py-1.5 flex justify-between items-center r48-consumable">
                        <span className="text-slate-200 text-[11px]">{c.name}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-amber-400 text-[10px]">×{c.quantity}</span>
                          <button onClick={() => { invUseConsumable(c.id); toast({ title: `Used ${c.name}` }) }}
                            className="text-[9px] px-1.5 py-0.5 bg-emerald-700 text-white rounded transition-all active:scale-95">Use</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Materials */}
              {materials.length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">⚙️ Materials</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {materials.slice(0, 6).map((m: { id: string; name: string; quantity: number }, i: number) => (
                      <span key={m.id || i} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded-lg r48-material">{m.name} ×{m.quantity}</span>
                    ))}
                  </div>
                </div>
              )}
              {/* Daily Deals */}
              {deals.length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🏪 Daily Deals</span>
                  <div className="space-y-1 mt-1.5">
                    {deals.slice(0, 3).map((d: { id: string; name: string; cost: number; discount: number }, i: number) => (
                      <div key={d.id || i} className="flex items-center justify-between bg-slate-800/60 rounded-lg px-2.5 py-1.5 r48-deal">
                        <span className="text-slate-200 text-[11px]">{d.name}</span>
                        <button onClick={() => { invPurchaseItem(d.id, 'coins', d.cost); toast({ title: `Bought ${d.name}` }) }}
                          className="text-[10px] px-2 py-0.5 bg-amber-700 hover:bg-amber-600 text-white rounded transition-all active:scale-95">
                          {d.discount ? `🛒 ${Math.round(d.cost * (1 - d.discount))} (-${Math.round(d.discount * 100)}%)` : `🛒 ${d.cost}`}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Wishlist */}
              {wishlist.length > 0 && (
                <div>
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">💜 Wishlist ({wishlist.length})</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {wishlist.slice(0, 5).map((w: string, i: number) => (
                      <span key={i} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded-full r48-wishlist">{w}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* Round 48: World Map Explorer Panel */}
      {showWorldMapPanel && mounted && (() => {
        const overview = getWorldMapOverview()
        const regions = getRegions()
        const progress = getOverallProgress()
        const currentReg = getCurrentRegion()
        const events = getActiveEvents()
        const loreCompletion = getLoreCompletion()
        const recommended = getRecommendedPath()
        const worldSummary = getWorldSummary()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowWorldMapPanel(false)}>
            <div className="bg-slate-900 border border-emerald-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 world-map-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-emerald-300 text-lg font-bold">🗺️ World Map Explorer</span>
                <button onClick={() => setShowWorldMapPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* World Summary */}
              {worldSummary && (
                <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 rounded-xl p-2.5 mb-4 border border-emerald-700/20 r48-world-summary">
                  <div className="text-emerald-400 text-[10px] uppercase tracking-wider font-bold">📜 World Lore</div>
                  <div className="text-slate-300 text-[11px] mt-1">{worldSummary.substring(0, 150)}{worldSummary.length > 150 ? '...' : ''}</div>
                </div>
              )}
              {/* Progress */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-slate-800 rounded-lg p-2 text-center r48-map-stat">
                  <div className="text-emerald-400 text-lg font-bold">{progress.completedLevels}/{progress.totalLevels}</div>
                  <div className="text-slate-500 text-[9px]">Levels</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r48-map-stat">
                  <div className="text-amber-400 text-lg font-bold">{progress.totalStars}</div>
                  <div className="text-slate-500 text-[9px]">Stars</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r48-map-stat">
                  <div className="text-cyan-400 text-lg font-bold">{progress.regionsExplored}</div>
                  <div className="text-slate-500 text-[9px]">Regions</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r48-map-stat">
                  <div className="text-violet-400 text-lg font-bold">{loreCompletion}%</div>
                  <div className="text-slate-500 text-[9px]">Lore</div>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-400">Overall Progress</span>
                  <span className="text-emerald-400 font-bold">{progress.completionPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all r48-progress-fill" style={{ width: `${Math.min(100, progress.completionPercent)}%` }} />
                </div>
              </div>
              {/* Regions */}
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🌍 Regions</span>
                <div className="space-y-1.5 mt-1.5">
                  {regions.slice(0, 8).map(r => {
                    const regProgress = getRegionProgress(r.id)
                    return (
                      <div key={r.id} className={`rounded-lg px-3 py-2 flex items-center justify-between r48-region-card ${currentReg === r.id ? 'bg-emerald-900/20 border border-emerald-700/30' : 'bg-slate-800/60'} ${!isRegionUnlocked(r.id) ? 'opacity-50' : ''}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{r.icon}</span>
                            <span className="text-slate-200 text-[12px] font-semibold">{r.name}</span>
                            {!isRegionUnlocked(r.id) && <span className="text-slate-500 text-[9px]">🔒</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-slate-500 text-[10px]">{regProgress.completedLevels}/{regProgress.totalLevels}</span>
                            <div className="flex-1 max-w-[80px] h-1 bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, regProgress.completionPercent)}%` }} />
                            </div>
                            <span className="text-amber-400 text-[9px]">⭐ {regProgress.totalStars || 0}</span>
                          </div>
                        </div>
                        {isRegionUnlocked(r.id) && (
                          <button onClick={() => { setCurrentRegion(r.id); toast({ title: `Exploring: ${r.name}` }) }}
                            className="ml-2 px-2 py-1 rounded text-[10px] font-bold transition-all active:scale-95 bg-emerald-700 hover:bg-emerald-600 text-white r48-explore-btn">
                            Explore
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* Active Events */}
              {events.length > 0 && (
                <div className="mb-4">
                  <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">⚡ Active Events</span>
                  <div className="space-y-1 mt-1.5">
                    {events.slice(0, 3).map((e: { id: string; name: string; type: string, bonus: string }, i: number) => (
                      <div key={e.id || i} className="bg-amber-900/10 border border-amber-800/20 rounded-lg px-2.5 py-1.5 r48-event">
                        <span className="text-amber-300 text-[11px] font-semibold">{e.name}</span>
                        <span className="text-slate-400 text-[10px] ml-2">{e.bonus}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Recommended Path */}
              {recommended.length > 0 && (
                <div>
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🎯 Recommended Next</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {recommended.slice(0, 4).map((r: { name: string; difficulty: string }, i: number) => (
                      <span key={i} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded-lg r48-recommended">{r.name} <span className="text-slate-500">({r.difficulty})</span></span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* Round 49: Tournament Bracket Panel */}
      {showTournamentPanel && mounted && (() => {
        const overview = getTournamentOverview()
        const active = getActiveTournaments()
        const myStats = tbGetMyStats()
        const leaderboard = getTournamentLeaderboard()
        const upcoming = getUpcomingMatch()
        const recentResults = getRecentResults()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowTournamentPanel(false)}>
            <div className="bg-slate-900 border border-orange-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 tournament-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-orange-300 text-lg font-bold">🏆 Tournament Bracket</span>
                <button onClick={() => setShowTournamentPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-slate-800 rounded-lg p-2 text-center r49-tournament-stat">
                  <div className="text-orange-400 text-lg font-bold">{overview.totalTournaments}</div>
                  <div className="text-slate-500 text-[9px]">Total</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r49-tournament-stat">
                  <div className="text-emerald-400 text-lg font-bold">{myStats.wins || 0}</div>
                  <div className="text-slate-500 text-[9px]">Wins</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r49-tournament-stat">
                  <div className="text-amber-400 text-lg font-bold">{Math.round(getWinRate() * 100)}%</div>
                  <div className="text-slate-500 text-[9px]">Win Rate</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r49-tournament-stat">
                  <div className="text-rose-400 text-lg font-bold">{tbbGetBestStreak()}</div>
                  <div className="text-slate-500 text-[9px]">Best Streak</div>
                </div>
              </div>
              {/* Active Tournaments */}
              {active.length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🔥 Active Tournaments</span>
                  <div className="space-y-1.5 mt-1.5">
                    {active.slice(0, 3).map((t: { id: string; name: string; status: string; participants: number }, i: number) => (
                      <div key={t.id || i} className="bg-orange-900/10 border border-orange-800/20 rounded-lg px-3 py-2 r49-active-tournament">
                        <div className="flex items-center justify-between">
                          <span className="text-orange-300 text-[11px] font-semibold">{t.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-800/50 text-emerald-300">{t.status}</span>
                        </div>
                        <div className="text-slate-400 text-[10px] mt-0.5">{t.participants || 0} participants</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Upcoming Match */}
              {upcoming && (
                <div className="bg-gradient-to-r from-orange-900/20 to-amber-900/20 border border-orange-700/20 rounded-xl p-3 mb-4 r49-upcoming-match">
                  <div className="text-orange-400 text-[10px] uppercase tracking-wider font-bold">⚔️ Next Match</div>
                  <div className="text-white font-bold text-sm mt-1">{(upcoming as { player1?: string; player2?: string }).player1 || 'You'} vs {(upcoming as { player1?: string; player2?: string }).player2 || 'Opponent'}</div>
                  <div className="text-slate-400 text-[11px]">Round {(upcoming as { round?: number }).round || 1}</div>
                </div>
              )}
              {/* Recent Results */}
              {recentResults.length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">📋 Recent Results</span>
                  <div className="space-y-1 mt-1.5 max-h-[120px] overflow-y-auto">
                    {recentResults.slice(0, 5).map((r: { tournament: string; result: string; score: number }, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-slate-800/60 rounded-lg px-2.5 py-1.5 r49-result-item">
                        <span className="text-slate-200 text-[11px]">{r.tournament}</span>
                        <span className={`text-[10px] font-semibold ${r.result === 'win' ? 'text-emerald-400' : r.result === 'loss' ? 'text-rose-400' : 'text-amber-400'}`}>{r.result.toUpperCase()} ({r.score})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Leaderboard */}
              {leaderboard.length > 0 && (
                <div>
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🏅 Leaderboard</span>
                  <div className="space-y-1 mt-1.5">
                    {leaderboard.slice(0, 5).map((p: { name: string; wins: number; score: number }, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-slate-800/40 rounded-lg px-2.5 py-1.5 r49-leaderboard-item">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 text-[11px] font-bold">#{i + 1}</span>
                          <span className="text-slate-200 text-[11px]">{p.name}</span>
                        </div>
                        <span className="text-orange-400 text-[10px] font-semibold">{p.wins}W / {p.score}pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Quick Actions */}
              <div className="flex gap-2 mt-4">
                <button onClick={() => { createTournament('Quick Arena', 8, 'single'); toast({ title: 'Tournament created!' }) }}
                  className="flex-1 px-3 py-2 bg-orange-700 hover:bg-orange-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r49-action-btn">
                  🆕 Create Tournament
                </button>
                <button onClick={() => { startQuickMatch(); toast({ title: 'Finding match...' }) }}
                  className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r49-action-btn">
                  ⚡ Quick Match
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Round 49: Word Puzzle Panel */}
      {showPuzzlePanel && mounted && (() => {
        const puzzleOverview = getPuzzleOverview()
        const puzzleStats = getPuzzleStats()
        const available = getAvailablePuzzles()
        const dailyPuzzle = pzGetDailyPuzzle()
        const dailyChallenge = pzGetDailyChallenge()
        const bestScores = getBestScores()
        const difficultyDist = getDifficultyDistribution()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowPuzzlePanel(false)}>
            <div className="bg-slate-900 border border-pink-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 puzzle-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-pink-300 text-lg font-bold">🧩 Word Puzzles</span>
                <button onClick={() => setShowPuzzlePanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-slate-800 rounded-lg p-2 text-center r49-puzzle-stat">
                  <div className="text-pink-400 text-lg font-bold">{puzzleStats.totalPlayed}</div>
                  <div className="text-slate-500 text-[9px]">Played</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r49-puzzle-stat">
                  <div className="text-emerald-400 text-lg font-bold">{puzzleStats.solved || 0}</div>
                  <div className="text-slate-500 text-[9px]">Solved</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r49-puzzle-stat">
                  <div className="text-amber-400 text-lg font-bold">{getPuzzleStreak()}</div>
                  <div className="text-slate-500 text-[9px]">Streak</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r49-puzzle-stat">
                  <div className="text-violet-400 text-lg font-bold">{pzGetDailyPuzzleStreak()}</div>
                  <div className="text-slate-500 text-[9px]">Daily Streak</div>
                </div>
              </div>
              {/* Daily Puzzle */}
              {dailyPuzzle && (
                <div className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 border border-pink-700/20 rounded-xl p-3 mb-4 r49-daily-puzzle">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-pink-400 text-[10px] uppercase tracking-wider font-bold">📝 Daily Puzzle</div>
                      <div className="text-white font-bold text-sm mt-1">{(dailyPuzzle as { type?: string; difficulty?: string }).type || 'Crossword'}</div>
                      <div className="text-slate-400 text-[11px]">Difficulty: {(dailyPuzzle as { difficulty?: string }).difficulty || 'Medium'}</div>
                    </div>
                    <button onClick={() => { toast({ title: 'Starting daily puzzle!' }) }}
                      className="px-3 py-1.5 bg-pink-700 hover:bg-pink-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r49-action-btn">
                      Play
                    </button>
                  </div>
                </div>
              )}
              {/* Daily Challenge */}
              {dailyChallenge && (
                <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-700/20 rounded-xl p-3 mb-4 r49-daily-challenge">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-amber-400 text-[10px] uppercase tracking-wider font-bold">🎯 Daily Challenge</div>
                      <div className="text-white font-bold text-sm mt-1">{(dailyChallenge as { type?: string }).type || 'Mixed'}</div>
                    </div>
                    <button onClick={() => { toast({ title: 'Starting daily challenge!' }) }}
                      className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r49-action-btn">
                      Start
                    </button>
                  </div>
                </div>
              )}
              {/* Puzzle Types */}
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🧠 Puzzle Types</span>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {[
                    { name: 'Crossword', icon: '📝', color: 'pink', action: () => { generateCrossword(); toast({ title: 'New crossword!' }) } },
                    { name: 'Anagram', icon: '🔤', color: 'purple', action: () => { generateAnagram(); toast({ title: 'New anagram!' }) } },
                    { name: 'Word Search', icon: '🔍', color: 'cyan', action: () => { generateWordSearch(); toast({ title: 'New word search!' }) } },
                    { name: 'Scramble', icon: '🔀', color: 'amber', action: () => { pzGenerateScramble('snake'); toast({ title: 'New scramble!' }) } },
                    { name: 'Word Chain', icon: '⛓️', color: 'emerald', action: () => { startWordChain(); toast({ title: 'Word chain started!' }) } },
                    { name: 'Quick Play', icon: '⚡', color: 'orange', action: () => { getQuickPuzzle(); toast({ title: 'Quick puzzle!' }) } },
                  ].map(p => (
                    <button key={p.name} onClick={p.action}
                      className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/30 rounded-lg px-3 py-2 text-left transition-all active:scale-95 r49-puzzle-type-btn">
                      <span className="text-base">{p.icon}</span>
                      <span className={`text-${p.color}-300 text-[11px] font-medium`}>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Best Scores */}
              {bestScores.length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">📊 Best Scores</span>
                  <div className="space-y-1 mt-1.5">
                    {bestScores.slice(0, 4).map((s: { type: string; score: number; date: string }, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-slate-800/60 rounded-lg px-2.5 py-1.5 r49-score-item">
                        <span className="text-slate-200 text-[11px]">{s.type}</span>
                        <span className="text-pink-400 text-[11px] font-bold">{s.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Difficulty Distribution */}
              {difficultyDist && Object.keys(difficultyDist).length > 0 && (
                <div>
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">📈 Difficulty Stats</span>
                  <div className="flex gap-2 mt-1.5">
                    {Object.entries(difficultyDist).slice(0, 4).map(([diff, count]) => (
                      <div key={diff} className="flex-1 bg-slate-800 rounded-lg p-2 text-center r49-diff-badge">
                        <div className="text-white text-[11px] font-medium capitalize">{diff}</div>
                        <div className="text-slate-400 text-[10px]">{count as number} played</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* Round 49: Progress Dashboard Panel */}
      {showProgressDashPanel && mounted && (() => {
        const overview = getProgressDashboardOverview()
        const overallScore = getOverallProgressScore()
        const grade = getProgressGrade()
        const summary = getSummaryCard()
        const strengths = getStrengthsAndWeaknesses()
        const suggestions = getImprovementSuggestions()
        const weekly = getWeeklyProgress()
        const milestones = getMilestones()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowProgressDashPanel(false)}>
            <div className="bg-slate-900 border border-indigo-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 progress-dash-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-indigo-300 text-lg font-bold">📊 Progress Dashboard</span>
                <button onClick={() => setShowProgressDashPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Overall Score + Grade */}
              <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-700/20 rounded-xl p-3 mb-4 r49-overall-score">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-indigo-400 text-[10px] uppercase tracking-wider font-bold">Overall Progress</div>
                    <div className="text-white font-bold text-2xl mt-1">{overallScore}</div>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-indigo-900/40 border-2 border-indigo-500 flex items-center justify-center r49-grade-ring">
                    <span className="text-indigo-300 text-xl font-bold">{grade}</span>
                  </div>
                </div>
                <div className="mt-2 bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 r49-progress-fill" style={{ width: `${Math.min(overallScore, 100)}%` }}></div>
                </div>
              </div>
              {/* Category Progress */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { name: 'Gameplay', value: getGameplayProgress(), color: 'emerald' },
                  { name: 'Collection', value: getCollectionProgress(), color: 'cyan' },
                  { name: 'Mastery', value: pdGetMasteryProgress(), color: 'amber' },
                  { name: 'Achievements', value: getAchievementProgress(), color: 'violet' },
                  { name: 'Social', value: getSocialProgress(), color: 'sky' },
                  { name: 'Exploration', value: getExplorationProgress(), color: 'lime' },
                  { name: 'Economy', value: getEconomyProgress(), color: 'yellow' },
                  { name: 'Battle Pass', value: getBattlePassProgress(), color: 'rose' },
                ].map(cat => (
                  <div key={cat.name} className="bg-slate-800 rounded-lg p-2.5 r49-category-progress">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300 text-[10px] font-medium">{cat.name}</span>
                      <span className={`text-${cat.color}-400 text-[10px] font-bold`}>{Math.round(cat.value)}%</span>
                    </div>
                    <div className="bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full bg-${cat.color}-500 r49-category-bar-fill`} style={{ width: `${cat.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Strengths & Weaknesses */}
              {strengths && (strengths.strengths?.length || strengths.weaknesses?.length) && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">💪 Strengths & Weaknesses</span>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {(strengths.strengths || []).slice(0, 3).map((s: string, i: number) => (
                      <div key={i} className="bg-emerald-900/10 border border-emerald-800/20 rounded-lg px-2.5 py-1.5 r49-strength-item">
                        <span className="text-emerald-400 text-[11px]">✓ {s}</span>
                      </div>
                    ))}
                    {(strengths.weaknesses || []).slice(0, 3).map((w: string, i: number) => (
                      <div key={i} className="bg-rose-900/10 border border-rose-800/20 rounded-lg px-2.5 py-1.5 r49-weakness-item">
                        <span className="text-rose-400 text-[11px]">✗ {w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Weekly Progress */}
              {weekly && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">📅 This Week</span>
                  <div className="bg-slate-800/60 rounded-lg p-3 mt-1.5 r49-weekly-card">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-indigo-400 text-lg font-bold">{weekly.gamesPlayed || 0}</div>
                        <div className="text-slate-500 text-[9px]">Games</div>
                      </div>
                      <div className="text-center">
                        <div className="text-emerald-400 text-lg font-bold">{weekly.totalScore || 0}</div>
                        <div className="text-slate-500 text-[9px]">Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-amber-400 text-lg font-bold">{weekly.avgScore || 0}</div>
                        <div className="text-slate-500 text-[9px]">Avg</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Improvement Suggestions */}
              {suggestions && suggestions.length > 0 && (
                <div>
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">💡 Suggestions</span>
                  <div className="space-y-1 mt-1.5">
                    {suggestions.slice(0, 4).map((s: string, i: number) => (
                      <div key={i} className="bg-indigo-900/10 border border-indigo-800/20 rounded-lg px-2.5 py-1.5 r49-suggestion-item">
                        <span className="text-indigo-300 text-[11px]">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* Round 49: Controller Config Panel */}
      {showControllerPanel && mounted && (() => {
        const overview = getControllerOverview()
        const keybinds = getKeybinds()
        const profiles = getProfiles()
        const sensitivity = getSensitivity()
        const apm = getAPM()
        const heatmap = getInputHeatmap()
        const mostUsed = getMostUsedKeys()
        const quickSettings = getQuickSettings()
        const recommended = getRecommendedSettings()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowControllerPanel(false)}>
            <div className="bg-slate-900 border border-teal-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 controller-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-teal-300 text-lg font-bold">🎮 Controller Config</span>
                <button onClick={() => setShowControllerPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-slate-800 rounded-lg p-2 text-center r49-controller-stat">
                  <div className="text-teal-400 text-lg font-bold">{Math.round(apm)}</div>
                  <div className="text-slate-500 text-[9px]">APM</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r49-controller-stat">
                  <div className="text-cyan-400 text-lg font-bold">{profiles.length}</div>
                  <div className="text-slate-500 text-[9px]">Profiles</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r49-controller-stat">
                  <div className="text-amber-400 text-lg font-bold">{Math.round(sensitivity * 100)}%</div>
                  <div className="text-slate-500 text-[9px]">Sensitivity</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r49-controller-stat">
                  <div className="text-violet-400 text-lg font-bold">{Object.keys(keybinds).length}</div>
                  <div className="text-slate-500 text-[9px]">Keybinds</div>
                </div>
              </div>
              {/* Sensitivity Control */}
              <div className="bg-slate-800/50 rounded-lg p-3 mb-4 r49-sensitivity-panel">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🎯 Sensitivity</span>
                  <span className="text-teal-400 text-[11px] font-bold">{Math.round(sensitivity * 100)}%</span>
                </div>
                <input type="range" min="10" max="200" value={Math.round(sensitivity * 100)}
                  onChange={e => ctrlSetSensitivity(Number(e.target.value) / 100)}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500" />
                <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                  <span>Low</span><span>Medium</span><span>High</span>
                </div>
              </div>
              {/* Key Bindings */}
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">⌨️ Key Bindings</span>
                <div className="space-y-1 mt-1.5 max-h-[160px] overflow-y-auto">
                  {Object.entries(keybinds).slice(0, 8).map(([action, key]) => (
                    <div key={action} className="flex items-center justify-between bg-slate-800/60 rounded-lg px-2.5 py-1.5 r49-keybind-item">
                      <span className="text-slate-200 text-[11px] font-medium capitalize">{(action as string).replace(/([A-Z])/g, ' $1')}</span>
                      <kbd className="bg-slate-700 text-teal-300 text-[10px] px-2 py-0.5 rounded font-mono">{key as string}</kbd>
                    </div>
                  ))}
                </div>
              </div>
              {/* Profiles */}
              {profiles.length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">👤 Profiles</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {profiles.slice(0, 5).map((p: { name: string; isDefault?: boolean }, i: number) => (
                      <button key={i} onClick={() => { ctrlLoadProfile(p.name); toast({ title: `Loaded: ${p.name}` }) }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all active:scale-95 r49-profile-btn ${p.isDefault ? 'bg-teal-700 text-teal-100 ring-1 ring-teal-500' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                        {p.name}
                      </button>
                    ))}
                    <button onClick={() => { createProfile('Custom ' + (profiles.length + 1)); toast({ title: 'Profile created!' }) }}
                      className="px-2 py-1 rounded-lg text-[10px] bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-dashed border-slate-600 r49-profile-btn">
                      + New
                    </button>
                  </div>
                </div>
              )}
              {/* Most Used Keys */}
              {mostUsed.length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🔥 Most Used Keys</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {mostUsed.slice(0, 8).map((k: { key: string; count: number }, i: number) => (
                      <kbd key={i} className="bg-slate-800 text-slate-200 text-[10px] px-2 py-1 rounded-lg font-mono r49-key-badge">
                        {k.key} <span className="text-teal-400 ml-1">{k.count}</span>
                      </kbd>
                    ))}
                  </div>
                </div>
              )}
              {/* Quick Settings */}
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">⚡ Quick Settings</span>
                <div className="space-y-1 mt-1.5">
                  {quickSettings.slice(0, 4).map((s: { name: string; value: boolean | string | number, type: string }, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-slate-800/60 rounded-lg px-2.5 py-1.5 r49-setting-row">
                      <span className="text-slate-200 text-[11px]">{s.name}</span>
                      <span className={`text-[10px] font-semibold ${typeof s.value === 'boolean' ? (s.value ? 'text-emerald-400' : 'text-slate-500') : 'text-teal-400'}`}>
                        {typeof s.value === 'boolean' ? (s.value ? 'ON' : 'OFF') : String(s.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Recommended Settings */}
              {recommended && recommended.length > 0 && (
                <div>
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">💡 Recommended</span>
                  <div className="space-y-1 mt-1.5">
                    {recommended.slice(0, 3).map((r: string, i: number) => (
                      <div key={i} className="bg-teal-900/10 border border-teal-800/20 rounded-lg px-2.5 py-1.5 r49-suggestion-badge">
                        <span className="text-teal-300 text-[11px]">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* Round 51: Friend System Panel */}
      {showFriendsPanel && mounted && (() => {
        const summary = getFriendSummary()
        const friends = getFriends()
        const online = getOnlineFriends()
        const requests = getFriendRequests()
        const recentChats = getRecentChats()
        const leaderboard = getFriendLeaderboard()
        const suggestion = getFriendSuggestion()
        const unread = getUnreadCount()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowFriendsPanel(false)}>
            <div className="bg-slate-900 border border-sky-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 friends-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sky-300 text-lg font-bold">👥 Friends</span>
                <button onClick={() => setShowFriendsPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-slate-800 rounded-lg p-2 text-center r51-friend-stat">
                  <div className="text-sky-400 text-lg font-bold">{summary.totalFriends}</div>
                  <div className="text-slate-500 text-[9px]">Friends</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r51-friend-stat">
                  <div className="text-emerald-400 text-lg font-bold">{online.length}</div>
                  <div className="text-slate-500 text-[9px]">Online</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r51-friend-stat">
                  <div className="text-amber-400 text-lg font-bold">{requests.length}</div>
                  <div className="text-slate-500 text-[9px]">Requests</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r51-friend-stat">
                  <div className="text-rose-400 text-lg font-bold">{unread}</div>
                  <div className="text-slate-500 text-[9px]">Unread</div>
                </div>
              </div>
              {/* Friend Requests */}
              {requests.length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">📨 Pending Requests</span>
                  <div className="space-y-1.5 mt-1.5">
                    {requests.slice(0, 3).map((r: { username: string; level: number }, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-sky-900/10 border border-sky-800/20 rounded-lg px-3 py-2 r51-request-item">
                        <div>
                          <span className="text-sky-300 text-[11px] font-semibold">{r.username}</span>
                          <span className="text-slate-500 text-[10px] ml-1.5">Lv.{r.level}</span>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => { acceptFriend(r.username); toast({ title: `Accepted: ${r.username}` }) }}
                            className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] rounded transition-all active:scale-95">✓</button>
                          <button onClick={() => { rejectFriend(r.username); toast({ title: `Rejected: ${r.username}` }) }}
                            className="px-2 py-0.5 bg-rose-700 hover:bg-rose-600 text-white text-[10px] rounded transition-all active:scale-95">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Online Friends */}
              {online.length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🟢 Online</span>
                  <div className="space-y-1 mt-1.5">
                    {online.slice(0, 4).map((f: { username: string; status: string; level: number }, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-slate-800/60 rounded-lg px-3 py-1.5 r51-online-friend">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                          <span className="text-slate-200 text-[11px]">{f.username}</span>
                          <span className="text-slate-500 text-[10px]">Lv.{f.level}</span>
                        </div>
                        <button onClick={() => { inviteToGame(f.username); toast({ title: `Invited ${f.username}!` }) }}
                          className="text-[10px] px-2 py-0.5 bg-sky-700 hover:bg-sky-600 text-white rounded transition-all active:scale-95 r51-action-btn">
                          Invite
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Recent Chats */}
              {recentChats.length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">💬 Recent Chats</span>
                  <div className="space-y-1 mt-1.5">
                    {recentChats.slice(0, 4).map((c: { username: string; lastMessage: string; unread: number }, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-slate-800/60 rounded-lg px-3 py-1.5 r51-chat-item">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-200 text-[11px] font-medium">{c.username}</span>
                            {c.unread > 0 && <span className="bg-rose-600 text-white text-[9px] px-1.5 rounded-full">{c.unread}</span>}
                          </div>
                          <div className="text-slate-500 text-[10px] truncate">{c.lastMessage}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Leaderboard */}
              {leaderboard.length > 0 && (
                <div>
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🏅 Friends Leaderboard</span>
                  <div className="space-y-1 mt-1.5">
                    {leaderboard.slice(0, 5).map((p: { username: string; score: number; wins: number }, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-slate-800/40 rounded-lg px-2.5 py-1.5 r51-leaderboard-item">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 text-[11px] font-bold">#{i + 1}</span>
                          <span className="text-slate-200 text-[11px]">{p.username}</span>
                        </div>
                        <span className="text-sky-400 text-[10px] font-semibold">{p.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* Round 51: Pet Companion Panel */}
      {showPetPanel && mounted && (() => {
        const pet = getPet()
        const ownedPets = getOwnedPets()
        const available = getAvailablePets()
        const abilities = getPetAbilities()
        const accessories = getPetAccessories()
        const dashboard = getPetDashboard()
        const moodIcon = getPetMoodIcon()
        const personality = getPetPersonality()
        const quote = getPetQuote()
        const evolution = getPetEvolution()
        const canEvo = canEvolve()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowPetPanel(false)}>
            <div className="bg-slate-900 border border-rose-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 pet-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-rose-300 text-lg font-bold">🐾 Pet Companion</span>
                <button onClick={() => setShowPetPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Active Pet */}
              {pet && (
                <div className="bg-gradient-to-r from-rose-900/20 to-pink-900/20 border border-rose-700/20 rounded-xl p-3 mb-4 r51-pet-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{moodIcon}</div>
                      <div>
                        <div className="text-white font-bold text-sm">{pet.name || 'No Pet'}</div>
                        <div className="text-slate-400 text-[11px]">{pet.type} • Lv.{getPetLevel()} • {evolution}</div>
                        <div className="text-slate-500 text-[10px] italic mt-0.5">"{quote}"</div>
                      </div>
                    </div>
                    {canEvo && (
                      <button onClick={() => { evolvePet(); toast({ title: 'Pet evolved!' }) }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r51-action-btn">
                        ⬆️ Evolve
                      </button>
                    )}
                  </div>
                  <div className="mt-2 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rose-500 to-pink-400" style={{ width: `${(getPetXP() % 100)}%` }}></div>
                  </div>
                </div>
              )}
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-slate-800 rounded-lg p-2 text-center r51-pet-stat">
                  <div className="text-emerald-400 text-lg font-bold">{Math.round(getPetMood())}%</div>
                  <div className="text-slate-500 text-[9px]">Mood</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r51-pet-stat">
                  <div className="text-amber-400 text-lg font-bold">{Math.round(getPetHunger())}%</div>
                  <div className="text-slate-500 text-[9px]">Hunger</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r51-pet-stat">
                  <div className="text-sky-400 text-lg font-bold">{Math.round(getPetEnergy())}%</div>
                  <div className="text-slate-500 text-[9px]">Energy</div>
                </div>
              </div>
              {/* Care Actions */}
              <div className="flex gap-2 mb-4">
                <button onClick={() => { feedPet(); toast({ title: 'Pet fed! 🍖' }) }}
                  className="flex-1 px-3 py-2 bg-amber-700 hover:bg-amber-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r51-care-btn">
                  🍖 Feed
                </button>
                <button onClick={() => { playWithPet(); toast({ title: 'Playing with pet! 🎾' }) }}
                  className="flex-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r51-care-btn">
                  🎾 Play
                </button>
                <button onClick={() => { restPet(); toast({ title: 'Pet is resting... 💤' }) }}
                  className="flex-1 px-3 py-2 bg-sky-700 hover:bg-sky-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r51-care-btn">
                  💤 Rest
                </button>
              </div>
              {/* Abilities */}
              {abilities.length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">⚡ Abilities</span>
                  <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                    {abilities.slice(0, 6).map((a: { id: string; name: string; icon: string, cooldown: number, unlocked: boolean }, i: number) => (
                      <button key={a.id || i} onClick={() => { if (a.unlocked) { petUseAbility(a.id); toast({ title: `${a.icon} ${a.name}!` }) } }}
                        className={`flex items-center gap-2 bg-slate-800/60 rounded-lg px-2.5 py-2 text-left transition-all active:scale-95 r51-ability-btn ${a.unlocked ? 'hover:bg-slate-700/60' : 'opacity-50'}`}>
                        <span className="text-base">{a.icon}</span>
                        <div>
                          <div className="text-white text-[10px] font-medium">{a.name}</div>
                          <div className="text-slate-500 text-[9px]">{a.unlocked ? 'Ready' : `Lv.${a.cooldown}`}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Owned Pets */}
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🐾 My Pets ({ownedPets.length})</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {ownedPets.slice(0, 6).map((p: { name: string; type: string, active: boolean }, i: number) => (
                    <button key={i} onClick={() => { switchPet(p.name); toast({ title: `Switched to ${p.name}` }) }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all active:scale-95 r51-pet-badge ${p.active ? 'bg-rose-700 text-rose-100 ring-1 ring-rose-500' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Round 51: Weather Effects Panel */}
      {showWeatherPanel && mounted && (() => {
        const state = getWeatherState()
        const forecast = getWeatherForecast()
        const season = getWeatherSeason()
        const stats = getWeatherStats()
        const modifiers = getWeatherModifiers()
        const leaderboard = getWeatherLeaderboard()
        const dayNight = getDayNightCycle()
        const multiplier = getWeatherMultiplier()
        const comparison = getWeatherComparison()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowWeatherPanel(false)}>
            <div className="bg-slate-900 border border-cyan-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 weather-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-cyan-300 text-lg font-bold">🌦️ Weather System</span>
                <button onClick={() => setShowWeatherPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Current Weather */}
              <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-700/20 rounded-xl p-3 mb-4 r51-weather-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-cyan-400 text-[10px] uppercase tracking-wider font-bold">Current Weather</div>
                    <div className="text-white font-bold text-lg mt-1">{state.type}</div>
                    <div className="text-slate-400 text-[11px]">{season} • {dayNight.timeOfDay} • ×{multiplier.toFixed(1)} score</div>
                  </div>
                  <div className="text-3xl">{state.type === 'Rainy' ? '🌧️' : state.type === 'Snowy' ? '❄️' : state.type === 'Sunny' ? '☀️' : state.type === 'Stormy' ? '⛈️' : state.type === 'Foggy' ? '🌫️' : state.type === 'Aurora' ? '🌌' : state.type === 'Rainbow' ? '🌈' : '⛅'}</div>
                </div>
                <div className="flex gap-3 mt-2">
                  <span className="text-[10px] px-2 py-0.5 bg-slate-700 rounded-full text-slate-300">Speed: {modifiers.speed > 0 ? '+' : ''}{Math.round(modifiers.speed * 100)}%</span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-700 rounded-full text-slate-300">Visibility: {modifiers.visibility > 0 ? '+' : ''}{Math.round(modifiers.visibility * 100)}%</span>
                  <span className="text-[10px] px-2 py-0.5 bg-cyan-800 rounded-full text-cyan-200">Score ×{multiplier.toFixed(1)}</span>
                </div>
              </div>
              {/* Forecast */}
              {forecast.length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">📅 Forecast</span>
                  <div className="flex gap-2 mt-1.5 overflow-x-auto">
                    {forecast.slice(0, 5).map((w: { type: string; duration: number }, i: number) => (
                      <div key={i} className="flex-shrink-0 bg-slate-800/60 rounded-lg px-3 py-2 text-center r51-forecast-item min-w-[80px]">
                        <div className="text-slate-400 text-[9px]">+{w.duration}m</div>
                        <div className="text-white text-[11px] font-medium mt-0.5">{w.type}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { advanceWeather(); toast({ title: 'Weather changed!' }) }}
                    className="mt-2 w-full px-3 py-1.5 bg-cyan-800 hover:bg-cyan-700 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r51-action-btn">
                    ⏩ Advance Weather
                  </button>
                </div>
              )}
              {/* Weather Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-slate-800 rounded-lg p-2 text-center r51-weather-stat">
                  <div className="text-cyan-400 text-lg font-bold">{stats.gamesPlayed}</div>
                  <div className="text-slate-500 text-[9px]">Games in Weather</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r51-weather-stat">
                  <div className="text-amber-400 text-lg font-bold">{Object.keys(stats.timePerWeather || {}).length}</div>
                  <div className="text-slate-500 text-[9px]">Weather Types</div>
                </div>
              </div>
              {/* Weather Leaderboard */}
              {leaderboard.length > 0 && (
                <div>
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🏅 Weather Records</span>
                  <div className="space-y-1 mt-1.5">
                    {leaderboard.slice(0, 4).map((r: { weather: string; score: number }, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-slate-800/60 rounded-lg px-2.5 py-1.5 r51-record-item">
                        <span className="text-slate-200 text-[11px]">{r.weather}</span>
                        <span className="text-cyan-400 text-[11px] font-bold">{r.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* Round 51: Trade Market Panel */}
      {showMarketPanel && mounted && (() => {
        const listings = getMarketListings()
        const overview = getMarketOverview()
        const trending = getTrendingItems()
        const deals = getDailyDeals()
        const auctionItems = getAuctionHouse()
        const categories = getMarketCategories()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowMarketPanel(false)}>
            <div className="bg-slate-900 border border-yellow-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 market-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-yellow-300 text-lg font-bold">🏪 Trade Market</span>
                <button onClick={() => setShowMarketPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-slate-800 rounded-lg p-2 text-center r51-market-stat">
                  <div className="text-yellow-400 text-lg font-bold">{listings.length}</div>
                  <div className="text-slate-500 text-[9px]">Listings</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r51-market-stat">
                  <div className="text-emerald-400 text-lg font-bold">{overview.totalVolume || 0}</div>
                  <div className="text-slate-500 text-[9px]">Volume</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r51-market-stat">
                  <div className="text-amber-400 text-lg font-bold">{trending.length}</div>
                  <div className="text-slate-500 text-[9px]">Trending</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center r51-market-stat">
                  <div className="text-rose-400 text-lg font-bold">{auctionItems.length}</div>
                  <div className="text-slate-500 text-[9px]">Auctions</div>
                </div>
              </div>
              {/* Daily Deals */}
              {deals.length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🔥 Daily Deals</span>
                  <div className="grid grid-cols-3 gap-2 mt-1.5">
                    {deals.slice(0, 3).map((d: { name: string; originalPrice: number, salePrice: number, rarity: string }, i: number) => (
                      <div key={i} className="bg-amber-900/10 border border-amber-800/20 rounded-lg p-2.5 r51-deal-card">
                        <div className="text-white text-[11px] font-semibold truncate">{d.name}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-slate-500 text-[10px] line-through">{d.originalPrice}</span>
                          <span className="text-amber-400 text-[11px] font-bold">{d.salePrice}</span>
                        </div>
                        <div className="text-[9px] mt-0.5 text-amber-500/70">{d.rarity}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Market Listings */}
              {listings.length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">📋 Listings</span>
                  <div className="space-y-1 mt-1.5 max-h-[150px] overflow-y-auto">
                    {listings.slice(0, 5).map((l: { id: string; itemName: string, price: number, seller: string, rarity: string, type: string }, i: number) => (
                      <div key={l.id || i} className="flex items-center justify-between bg-slate-800/60 rounded-lg px-2.5 py-1.5 r51-listing-item">
                        <div className="flex-1 min-w-0">
                          <div className="text-slate-200 text-[11px] font-medium truncate">{l.itemName}</div>
                          <div className="text-slate-500 text-[9px]">{l.seller} • {l.type} • {l.rarity}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 text-[11px] font-bold">{l.price} 🪙</span>
                          <button onClick={() => { buyListing(l.id); toast({ title: `Bought ${l.itemName}!` }) }}
                            className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] rounded transition-all active:scale-95 r51-action-btn">Buy</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Trending Items */}
              {trending.length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">📈 Trending</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {trending.slice(0, 6).map((t: { name: string; change: number }, i: number) => (
                      <span key={i} className={`bg-slate-800 text-[10px] px-2.5 py-1 rounded-lg r51-trend-badge ${t.change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.name} {t.change > 0 ? '↑' : '↓'}{Math.abs(t.change)}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => { createListing('item', 100, 'sell'); toast({ title: 'Listing created!' }) }}
                  className="flex-1 px-3 py-2 bg-yellow-700 hover:bg-yellow-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r51-action-btn">
                  📤 Sell Item
                </button>
                <button onClick={() => { const code = 'WSNK-' + Math.random().toString(36).slice(2, 8).toUpperCase(); redeemCode(code); toast({ title: `Code: ${code}` }) }}
                  className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r51-action-btn">
                  🎁 Redeem Code
                </button>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 52: Daily Rewards Panel */}
      {showDailyRewardPanel && mounted && (() => {
        const overview = getRewardOverview()
        const streak = getStreakCard()
        const quests = getQuestList()
        const chests = getWeeklyChestGrid()
        const monthly = getMonthlyTierBar()
        const notification = drGetNotification()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowDailyRewardPanel(false)}>
            <div className="bg-slate-900 border border-orange-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 reward-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-orange-300 text-lg font-bold">🎁 Daily Rewards</span>
                <button onClick={() => setShowDailyRewardPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {notification.show && (
                <div className="mb-3 px-3 py-2 bg-orange-900/40 border border-orange-500/30 rounded-lg text-orange-300 text-[10px] font-semibold animate-pulse">
                  {notification.message || `${notification.count} rewards available!`}
                </div>
              )}
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Streak', value: `${getLoginStreak()}🔥`, color: 'text-orange-400' },
                  { label: 'Quests', value: `${getQuestCompletionRate()}%`, color: 'text-emerald-400' },
                  { label: 'Weekly', value: `${getWeeklyProgress()}/7`, color: 'text-blue-400' },
                  { label: 'Unclaimed', value: `${getUnclaimedRewards().length}`, color: 'text-yellow-400' },
                ].map((s, i) => (
                  <div key={i} className={`bg-slate-800 rounded-lg p-2 text-center r52-reward-stat`} style={{ animationDelay: `${i * 80}ms` }}>
                    <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Streak Card */}
              <div className="mb-4 p-3 bg-gradient-to-r from-orange-900/30 to-amber-900/30 border border-orange-700/30 rounded-lg r52-streak-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-300 text-xs font-semibold">{streak.fire} Login Streak: {streak.count} days</span>
                  <span className="text-[9px] text-orange-400/60">×{getStreakBonus()} bonus</span>
                </div>
                <div className="flex gap-1">
                  {getStreakRewards().slice(0, 7).map((r: { day: number; reward: number; type: string; claimed: boolean }, i: number) => (
                    <div key={i} className={`flex-1 text-center py-1.5 rounded text-[8px] ${r.claimed ? 'bg-orange-700/50 text-orange-300' : r.day <= getLoginStreak() ? 'bg-emerald-800/50 text-emerald-300 cursor-pointer hover:bg-emerald-700/60' : 'bg-slate-800 text-slate-600'}`}
                      onClick={() => { if (r.day <= getLoginStreak() && !r.claimed) { claimStreakReward(r.day); toast({ title: `Day ${r.day} reward claimed!` }) } }}>
                      Day {r.day}<br />{r.reward} {r.type}
                    </div>
                  ))}
                </div>
              </div>
              {/* Daily Quests */}
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">📋 Daily Quests</span>
                <div className="mt-1.5 space-y-1.5">
                  {quests.slice(0, 5).map((q: { id: string; title: string; current: number; target: number; reward: number; completed: boolean; claimed: boolean }, i: number) => (
                    <div key={i} className="bg-slate-800 rounded-lg p-2.5 r52-quest-item" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-300">{q.title}</span>
                        <span className={`text-[9px] font-semibold ${q.claimed ? 'text-slate-600' : q.completed ? 'text-emerald-400' : 'text-orange-400'}`}>
                          {q.claimed ? '✓ Claimed' : q.completed ? 'Claim!' : `${q.current}/${q.target}`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-1.5 rounded-full transition-all r52-quest-fill" style={{ width: `${Math.min(100, (q.current / q.target) * 100)}%` }}></div>
                      </div>
                      <div className="text-right text-[8px] text-slate-500 mt-0.5">+{q.reward} coins</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Weekly Chests */}
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">📦 Weekly Chests</span>
                <div className="grid grid-cols-7 gap-1.5 mt-1.5">
                  {chests.map((c: { day: number; rarity: string; reward: number; claimed: boolean }, i: number) => {
                    const rarityColors: Record<string, string> = { Common: 'border-slate-600 bg-slate-800', Uncommon: 'border-green-600 bg-green-900/20', Rare: 'border-blue-500 bg-blue-900/20', Epic: 'border-purple-500 bg-purple-900/20', Legendary: 'border-yellow-500 bg-yellow-900/20' }
                    const rarityText: Record<string, string> = { Common: 'text-slate-400', Uncommon: 'text-green-400', Rare: 'text-blue-400', Epic: 'text-purple-400', Legendary: 'text-yellow-400' }
                    return (
                      <div key={i} className={`rounded-lg border p-1.5 text-center r52-chest-item ${c.claimed ? rarityColors[c.rarity] : 'border-slate-700 bg-slate-900'}`}
                        style={{ animationDelay: `${i * 60}ms` }}>
                        <div className={`text-sm ${c.claimed ? '' : 'opacity-30'}`}>{c.claimed ? '📦' : '🔒'}</div>
                        <div className={`text-[7px] mt-0.5 ${rarityText[c.rarity] || 'text-slate-500'}`}>{c.rarity}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* Monthly Progress */}
              <div className="mb-3">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🏅 Monthly Milestone</span>
                <div className="mt-1.5 bg-slate-800 rounded-lg p-2.5">
                  <div className="flex justify-between text-[9px] mb-1">
                    <span className="text-slate-400">{monthly.current}/{monthly.target}</span>
                    <span className="text-amber-400">{monthly.percent}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-amber-600 to-yellow-400 h-2 rounded-full r52-monthly-fill" style={{ width: `${monthly.percent}%` }}></div>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {monthly.tiers.map((t: { tier: string; target: number; claimed: boolean }, i: number) => (
                      <div key={i} className={`text-[7px] px-1.5 py-0.5 rounded ${t.claimed ? 'bg-amber-700/50 text-amber-300' : 'bg-slate-700 text-slate-500'}`}>{t.tier}: {t.target}</div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => { checkDailyLogin(); toast({ title: 'Login checked!' }) }}
                  className="flex-1 px-3 py-2 bg-orange-700 hover:bg-orange-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r52-action-btn">
                  🔥 Check In
                </button>
                <button onClick={() => { const n = getUnclaimedRewards().length; if (n > 0) { claimAllRewards(); toast({ title: `${n} rewards claimed!` }) } else { toast({ title: 'Nothing to claim' }) } }}
                  className="flex-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r52-action-btn">
                  💰 Claim All
                </button>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 52: Word Connect Panel */}
      {showWordConnectPanel && mounted && (() => {
        const overview = getConnectOverview()
        const stats = wcGetStatsGrid()
        const daily = wcGetDailyPuzzle()
        const game = getCurrentGame()
        const buttons = getDifficultyButtons()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowWordConnectPanel(false)}>
            <div className="bg-slate-900 border border-indigo-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 connect-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-indigo-300 text-lg font-bold">🔗 Word Connect</span>
                <button onClick={() => setShowWordConnectPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Games', value: getTotalGamesPlayed(), color: 'text-indigo-400' },
                  { label: 'Words', value: getTotalWordsFound(), color: 'text-emerald-400' },
                  { label: 'Best', value: wcGetBestScore(), color: 'text-yellow-400' },
                  { label: 'Streak', value: `${wcGetDailyStreak()}🔥`, color: 'text-orange-400' },
                ].map((s, i) => (
                  <div key={i} className={`bg-slate-800 rounded-lg p-2 text-center r52-connect-stat`} style={{ animationDelay: `${i * 80}ms` }}>
                    <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Daily Puzzle Card */}
              <div className="mb-4 p-3 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700/30 rounded-lg r52-daily-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-indigo-300 text-xs font-semibold">📅 Daily Puzzle</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full ${isDailyCompleted() ? 'bg-emerald-800/50 text-emerald-400' : 'bg-indigo-800/50 text-indigo-400'}`}>
                    {isDailyCompleted() ? '✓ Complete' : 'Play Now'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {daily ? `${daily.difficulty} · ${daily.totalWords || '?'} words · Score: ${daily.score || 0}` : 'Start a new daily puzzle!'}
                </div>
                {!isDailyCompleted() && (
                  <button onClick={() => { startNewGame('medium'); toast({ title: 'New game started!' }) }}
                    className="mt-2 w-full px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r52-play-btn">
                    ▶ Play Daily
                  </button>
                )}
              </div>
              {/* Current Game */}
              {game && (
                <div className="mb-4 p-3 bg-slate-800 rounded-lg r52-game-grid">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-indigo-300 text-xs font-semibold">🎮 Active Game</span>
                    <span className="text-[10px] text-yellow-400">{game.score} pts</span>
                  </div>
                  {game.grid && (
                    <div className="grid gap-0.5 mb-2" style={{ gridTemplateColumns: `repeat(${game.size || 4}, 1fr)` }}>
                      {game.grid.flat().map((letter: string, i: number) => (
                        <div key={i} className="w-full aspect-square flex items-center justify-center bg-slate-700 hover:bg-indigo-800/50 text-white text-sm font-bold rounded r52-grid-cell cursor-pointer select-none transition-colors">
                          {letter}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-[9px] text-slate-400">
                    Found: {game.foundWords?.length || 0} · Hints: {getHintsRemaining()} · Combo: ×{getComboMultiplier()}
                  </div>
                </div>
              )}
              {/* Found Words */}
              {game && game.foundWords && game.foundWords.length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">✅ Found Words</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {game.foundWords.slice(0, 12).map((w: { word: string; score: number }, i: number) => (
                      <span key={i} className="bg-indigo-900/30 text-indigo-300 text-[9px] px-2 py-0.5 rounded r52-found-word" style={{ animationDelay: `${i * 50}ms` }}>
                        {w.word} +{w.score}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Difficulty Buttons */}
              <div className="mb-3">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🎯 Difficulty</span>
                <div className="flex gap-2 mt-1.5">
                  {buttons.map((b: { difficulty: string; label: string; color: string }, i: number) => (
                    <button key={i} onClick={() => { startNewGame(b.difficulty); toast({ title: `${b.label} game started!` }) }}
                      className={`flex-1 px-3 py-2 ${b.color} text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r52-diff-btn`}>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => { if (getHintsRemaining() > 0) { wcGetHint(); toast({ title: 'Hint used!' }) } else { toast({ title: 'No hints left' }) } }}
                  className="flex-1 px-3 py-2 bg-purple-700 hover:bg-purple-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r52-action-btn">
                  💡 Hint ({getHintsRemaining()})
                </button>
                <button onClick={() => { shuffleGrid(); toast({ title: 'Grid shuffled!' }) }}
                  className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r52-action-btn">
                  🔀 Shuffle
                </button>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 52: Profile Card Panel */}
      {showProfileCardPanel && mounted && (() => {
        const overview = getProfileOverview()
        const avatar = getCurrentAvatar()
        const title = getCurrentTitle()
        const frame = getCurrentFrame()
        const completion = getProfileCompletion()
        const badge = getRankBadge()
        const level = getLevelBadge()
        const avatars = getAvatarGrid()
        const titles = getTitleList()
        const frames = getFrameGallery()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowProfileCardPanel(false)}>
            <div className="bg-slate-900 border border-violet-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 profile-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-violet-300 text-lg font-bold">👤 Profile Card</span>
                <button onClick={() => setShowProfileCardPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Profile Card Display */}
              <div className="mb-4 p-4 bg-gradient-to-br from-violet-900/30 to-indigo-900/30 border-2 rounded-xl r52-profile-card" style={{ borderColor: frame?.color || '#7c3aed' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl border-2 r52-avatar-display" style={{ borderColor: frame?.color || '#7c3aed' }}>
                    {avatar?.emoji || '🐍'}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-bold">{title?.name || 'New Player'}</div>
                    <div className="text-[10px] text-violet-400">{badge?.name || 'Bronze'} · Level {level?.level || 1}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{pcGetBio() || 'No bio set'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl">{pcGetMood() || '😊'}</div>
                    <div className={`text-[8px] px-1.5 py-0.5 rounded-full ${pcGetStatus() === 'online' ? 'bg-emerald-800/50 text-emerald-400' : pcGetStatus() === 'away' ? 'bg-yellow-800/50 text-yellow-400' : pcGetStatus() === 'dnd' ? 'bg-rose-800/50 text-rose-400' : 'bg-slate-700 text-slate-400'}`}>
                      {pcGetStatus() || 'online'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <span className="text-[8px] bg-violet-800/50 text-violet-300 px-2 py-0.5 rounded-full">🎮 Joined {getJoinDate()}</span>
                  <span className="text-[8px] bg-indigo-800/50 text-indigo-300 px-2 py-0.5 rounded-full">⏱ {getPlayTime()}h played</span>
                  <span className="text-[8px] bg-purple-800/50 text-purple-300 px-2 py-0.5 rounded-full">✨ {completion}% complete</span>
                </div>
              </div>
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Avatars', value: `${avatars.filter((a: { unlocked: boolean }) => a.unlocked).length}/${avatars.length}`, color: 'text-violet-400' },
                  { label: 'Titles', value: `${titles.filter((t: { earned: boolean }) => t.earned).length}/${titles.length}`, color: 'text-blue-400' },
                  { label: 'Frames', value: `${frames.filter((f: { unlocked: boolean }) => f.unlocked).length}/${frames.length}`, color: 'text-amber-400' },
                  { label: 'Rank', value: badge?.icon || '🥉', color: 'text-yellow-400' },
                ].map((s, i) => (
                  <div key={i} className={`bg-slate-800 rounded-lg p-2 text-center r52-profile-stat`} style={{ animationDelay: `${i * 80}ms` }}>
                    <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Avatar Grid */}
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🎭 Avatars</span>
                <div className="grid grid-cols-8 gap-1.5 mt-1.5">
                  {avatars.slice(0, 24).map((a: { id: string; emoji: string; unlocked: boolean; selected: boolean }, i: number) => (
                    <div key={i} onClick={() => { if (a.unlocked && !a.selected) { selectAvatar(a.id); toast({ title: `Avatar equipped!` }) } }}
                      className={`w-full aspect-square rounded-lg flex items-center justify-center text-lg cursor-pointer transition-all r52-avatar-item ${a.selected ? 'bg-violet-700/50 ring-2 ring-violet-400' : a.unlocked ? 'bg-slate-800 hover:bg-violet-900/30' : 'bg-slate-900 opacity-30'}`}
                      style={{ animationDelay: `${i * 40}ms` }}>
                      {a.unlocked ? a.emoji : '🔒'}
                    </div>
                  ))}
                </div>
              </div>
              {/* Titles */}
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🏷️ Titles</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {titles.slice(0, 16).map((t: { id: string; name: string; earned: boolean; isNew: boolean }, i: number) => (
                    <span key={i} onClick={() => { if (t.earned) { selectTitle(t.id); toast({ title: `Title: ${t.name}` }) } }}
                      className={`text-[9px] px-2 py-0.5 rounded-full cursor-pointer transition-all r52-title-item ${t.isNew ? 'bg-emerald-800/50 text-emerald-300' : t.earned ? 'bg-violet-900/30 text-violet-300 hover:bg-violet-800/40' : 'bg-slate-800 text-slate-600'}`}
                      style={{ animationDelay: `${i * 50}ms` }}>
                      {t.earned ? t.name : '🔒'}
                    </span>
                  ))}
                </div>
              </div>
              {/* Frames */}
              <div className="mb-3">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🖼️ Frames</span>
                <div className="grid grid-cols-6 gap-1.5 mt-1.5">
                  {frames.slice(0, 12).map((f: { id: string; name: string; color: string; unlocked: boolean; selected: boolean }, i: number) => (
                    <div key={i} onClick={() => { if (f.unlocked && !f.selected) { selectFrame(f.id); toast({ title: `Frame: ${f.name}` }) } }}
                      className={`aspect-[2/1] rounded-lg border-2 flex items-center justify-center text-[8px] cursor-pointer transition-all r52-frame-item ${f.selected ? 'ring-2 ring-white' : f.unlocked ? 'hover:brightness-125' : 'opacity-30'}`}
                      style={{ borderColor: f.color, background: f.unlocked ? f.color : '#1e293b', animationDelay: `${i * 60}ms` }}>
                      {f.unlocked ? f.name : '🔒'}
                    </div>
                  ))}
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => { const code = pcGenShareCode(); navigator.clipboard?.writeText(code); toast({ title: 'Profile code copied!' }) }}
                  className="flex-1 px-3 py-2 bg-violet-700 hover:bg-violet-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r52-action-btn">
                  📤 Share Profile
                </button>
                <button onClick={() => { unlockAvatar('random'); unlockFrame('random'); earnTitle('word_master'); toast({ title: 'Unlocked rewards!' }) }}
                  className="flex-1 px-3 py-2 bg-amber-700 hover:bg-amber-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r52-action-btn">
                  🎲 Random Unlock
                </button>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 52: Skill Tree Panel */}
      {showSkillTreePanel && mounted && (() => {
        const tree = getSkillTreeOverview()
        const branches = getBranches()
        const stats = getSkillTreeStats()
        const effects = getActiveBuildSummary()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowSkillTreePanel(false)}>
            <div className="bg-slate-900 border border-amber-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 skilltree-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-amber-300 text-lg font-bold">🌳 Skill Tree</span>
                <button onClick={() => setShowSkillTreePanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Points', value: getSkillPoints(), color: 'text-amber-400' },
                  { label: 'Spent', value: getTotalSpent(), color: 'text-rose-400' },
                  { label: 'Active', value: `${getActiveSlotsUsed()}/${getActiveSlots()}`, color: 'text-emerald-400' },
                  { label: 'Mastery', value: `${stats.mastery}%`, color: 'text-violet-400' },
                ].map((s, i) => (
                  <div key={i} className={`bg-slate-800 rounded-lg p-2 text-center r52-skill-stat`} style={{ animationDelay: `${i * 80}ms` }}>
                    <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Active Build Summary */}
              <div className="mb-4 p-3 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-amber-700/30 rounded-lg r52-build-card">
                <span className="text-amber-300 text-xs font-semibold">⚡ Active Build Effects</span>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="text-center">
                    <div className="text-emerald-400 text-sm font-bold">×{getBonusScoreMultiplier()}</div>
                    <div className="text-[8px] text-slate-500">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 text-sm font-bold">{getBonusSpeed() > 0 ? '+' : ''}{getBonusSpeed()}</div>
                    <div className="text-[8px] text-slate-500">Speed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-rose-400 text-sm font-bold">+{getBonusLives()}</div>
                    <div className="text-[8px] text-slate-500">Lives</div>
                  </div>
                </div>
              </div>
              {/* Skill Branches */}
              {branches.map((branch: { id: string; name: string; icon: string; color: string; description: string; progress: number; skills: Array<{ id: string; name: string; icon: string; unlocked: boolean; level: number; maxLevel: number; active: boolean }> }, bi: number) => (
                <div key={bi} className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold" style={{ color: branch.color }}>{branch.icon} {branch.name}</span>
                    <span className="text-[9px] text-slate-500">{branch.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1 mb-2">
                    <div className="h-1 rounded-full transition-all r52-branch-fill" style={{ width: `${branch.progress}%`, backgroundColor: branch.color }}></div>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {branch.skills.map((skill: { id: string; name: string; icon: string; unlocked: boolean; level: number; maxLevel: number; active: boolean }, si: number) => (
                      <div key={si} onClick={() => {
                        if (skill.unlocked && !skill.active && getActiveSlotsUsed() < getActiveSlots()) { toggleActiveSkill(skill.id); toast({ title: `${skill.name} activated!` }) }
                        else if (skill.active) { toggleActiveSkill(skill.id); toast({ title: `${skill.name} deactivated` }) }
                        else if (canUnlock(skill.id) && getSkillPoints() > 0) { unlockSkill(skill.id); toast({ title: `${skill.name} unlocked!` }) }
                      }}
                        className={`p-2 rounded-lg text-center cursor-pointer transition-all r52-skill-node ${skill.active ? 'ring-2 ring-amber-400 bg-amber-900/30' : skill.unlocked ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-900 opacity-50'}`}
                        style={{ animationDelay: `${si * 50}ms` }}>
                        <div className="text-lg">{skill.unlocked ? skill.icon : '🔒'}</div>
                        <div className={`text-[7px] mt-0.5 ${skill.unlocked ? 'text-slate-300' : 'text-slate-600'}`}>{skill.name}</div>
                        <div className="text-[7px] text-slate-500">Lv {skill.level}/{skill.maxLevel}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => { addSkillPoints(1); toast({ title: '+1 Skill Point!' }) }}
                  className="flex-1 px-3 py-2 bg-amber-700 hover:bg-amber-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r52-action-btn">
                  + Add Point (debug)
                </button>
                <button onClick={() => { if (canRespec()) { refundAll(); toast({ title: 'All points refunded!' }) } else { toast({ title: 'Cannot afford respec' }) } }}
                  className="flex-1 px-3 py-2 bg-rose-700 hover:bg-rose-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r52-action-btn">
                  🔄 Respec All
                </button>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 53: Leaderboard Panel */}
      {showLeaderboardPanel && mounted && (() => {
        const overview = getLeaderboardOverview()
        const categories = lbGetCategories()
        const podium = getPodiumData('overall_score')
        const medals = getMedalCount()
        const topMovers = getTopMovers('overall_score', 3)
        const activeMissions = getActiveMissions()
        const resetInfo = getWeeklyResetCountdown()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowLeaderboardPanel(false)}>
            <div className="bg-slate-900 border border-rose-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 leaderboard-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-rose-300 text-lg font-bold">🏆 Global Leaderboard</span>
                <button onClick={() => setShowLeaderboardPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Rank', value: `#${getPlayerRank('overall_score')}`, color: 'text-rose-400' },
                  { label: 'Gold', value: `${medals.gold}`, color: 'text-yellow-400' },
                  { label: 'Silver', value: `${medals.silver}`, color: 'text-slate-300' },
                  { label: 'Bronze', value: `${medals.bronze}`, color: 'text-amber-600' },
                ].map((s, i) => (
                  <div key={i} className={`bg-slate-800 rounded-lg p-2 text-center r53-lb-stat`} style={{ animationDelay: `${i * 80}ms` }}>
                    <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Podium */}
              <div className="mb-4 p-3 bg-gradient-to-r from-rose-900/30 to-amber-900/30 border border-rose-700/30 rounded-lg r53-podium-card">
                <span className="text-rose-300 text-xs font-semibold">🏅 Overall Score — Top 3</span>
                <div className="flex items-end justify-center gap-3 mt-2">
                  {podium && podium.map((p: { rank: number; name: string; avatar: string; score: number }, i: number) => (
                    <div key={i} className="text-center r53-podium-item" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className={`text-lg ${p.rank === 1 ? 'text-3xl' : p.rank === 2 ? 'text-2xl' : 'text-xl'}`}>
                        {p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : '🥉'}
                      </div>
                      <div className="text-2xl mt-1">{p.avatar}</div>
                      <div className="text-[10px] text-white font-semibold mt-1">{p.name}</div>
                      <div className="text-[9px] text-rose-400">{p.score.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Category Grid */}
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">📊 Categories</span>
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  {categories.slice(0, 10).map((c: { id: string; name: string; icon: string }, i: number) => {
                    const rank = getPlayerRank(c.id)
                    return (
                      <div key={i} className="bg-slate-800 rounded-lg px-2.5 py-2 flex items-center justify-between r53-category-item cursor-pointer hover:bg-slate-700 transition-colors" style={{ animationDelay: `${i * 40}ms` }}>
                        <span className="text-[10px] text-slate-300">{c.icon} {c.name}</span>
                        <span className={`text-[9px] font-bold ${rank <= 3 ? 'text-yellow-400' : rank <= 10 ? 'text-emerald-400' : 'text-slate-500'}`}>#{rank}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* Top Movers */}
              {topMovers.length > 0 && (
                <div className="mb-3">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🔥 Top Movers</span>
                  <div className="flex gap-1.5 mt-1.5">
                    {topMovers.map((m: { name: string; change: number }, i: number) => (
                      <span key={i} className={`text-[9px] px-2 py-0.5 rounded-full r53-mover-badge ${m.change > 0 ? 'bg-emerald-800/50 text-emerald-300' : 'bg-rose-800/50 text-rose-300'}`}>
                        {m.name} {m.change > 0 ? '↑' : '↓'}{Math.abs(m.change)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Reset Info */}
              <div className="mb-3 text-center">
                <span className="text-[9px] text-slate-500">Weekly reset in {resetInfo} · Monthly in {getMonthlyResetCountdown()}</span>
              </div>
              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => { refreshMockData(); toast({ title: 'Leaderboard refreshed!' }) }}
                  className="flex-1 px-3 py-2 bg-rose-700 hover:bg-rose-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r53-action-btn">
                  🔄 Refresh
                </button>
                <button onClick={() => { lbSubmitScore('overall_score', Math.floor(Math.random() * 50000) + 10000); toast({ title: 'Score submitted!' }) }}
                  className="flex-1 px-3 py-2 bg-amber-700 hover:bg-amber-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r53-action-btn">
                  📤 Submit Score
                </button>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 53: Soundboard Panel */}
      {showSoundboardPanel && mounted && (() => {
        const overview = getSoundBoardOverview()
        const instruments = getInstrumentGrid()
        const effects = getEffectsGrid()
        const pianoKeys = getPianoKeys()
        const beats = getBeatPatterns()
        const recentMelodies = getRecentMelodies(3)
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowSoundboardPanel(false)}>
            <div className="bg-slate-900 border border-pink-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 soundboard-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-pink-300 text-lg font-bold">🎵 Musical Soundboard</span>
                <button onClick={() => setShowSoundboardPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Saved', value: getMelodyLibrary().length, color: 'text-pink-400' },
                  { label: 'Effects', value: getSoundEffects().length, color: 'text-blue-400' },
                  { label: 'Tempo', value: `${getTempo()}bpm`, color: 'text-emerald-400' },
                  { label: 'Volume', value: `${Math.round((getMixerState().master || 0.7) * 100)}%`, color: 'text-amber-400' },
                ].map((s, i) => (
                  <div key={i} className={`bg-slate-800 rounded-lg p-2 text-center r53-sound-stat`} style={{ animationDelay: `${i * 80}ms` }}>
                    <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Instruments */}
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🎸 Instruments</span>
                <div className="grid grid-cols-6 gap-1.5 mt-1.5">
                  {instruments.map((inst: { id: string; name: string; emoji: string; color: string }, i: number) => (
                    <div key={i} onClick={() => { selectInstrument(inst.id); toast({ title: `${inst.emoji} ${inst.name}` }) }}
                      className={`p-2 rounded-lg text-center cursor-pointer transition-all r53-instrument-item ${inst.id === getCurrentInstrument()?.id ? 'ring-2 ring-pink-400 bg-pink-900/30' : 'bg-slate-800 hover:bg-slate-700'}`}
                      style={{ animationDelay: `${i * 40}ms` }}>
                      <div className="text-lg">{inst.emoji}</div>
                      <div className="text-[7px] text-slate-400 mt-0.5">{inst.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Piano Keys */}
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🎹 Keys</span>
                <div className="flex gap-0.5 mt-1.5 overflow-x-auto">
                  {pianoKeys.slice(0, 14).map((k: { note: string; freq: number; isBlack: boolean }, i: number) => (
                    <button key={i} onClick={() => { try { playNote(getCurrentInstrument()?.id || 'piano', k.note, 0.3) } catch(e) {} }}
                      className={`flex-shrink-0 w-8 rounded-b-lg transition-all active:scale-95 r53-piano-key ${k.isBlack ? 'bg-slate-900 h-12 text-slate-400 border border-slate-700 z-10' : 'bg-white h-16 text-slate-800 border border-slate-300'}`}
                      style={{ animationDelay: `${i * 20}ms` }}>
                      <span className="text-[7px] font-mono">{k.note}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Sound Effects */}
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🔊 Effects</span>
                <div className="grid grid-cols-5 gap-1 mt-1.5">
                  {effects.slice(0, 10).map((e: { id: string; name: string; icon: string }, i: number) => (
                    <button key={i} onClick={() => { try { playSoundEffect(e.id) } catch(err) {} toast({ title: `${e.icon} ${e.name}` }) }}
                      className="bg-slate-800 hover:bg-slate-700 rounded-lg p-1.5 text-center transition-all active:scale-90 r53-effect-btn" style={{ animationDelay: `${i * 30}ms` }}>
                      <div className="text-sm">{e.icon}</div>
                      <div className="text-[6px] text-slate-500 mt-0.5">{e.name}</div>
                    </button>
                  ))}
                </div>
              </div>
              {/* Beat Patterns */}
              <div className="mb-3">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🥁 Beats</span>
                <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                  {beats.slice(0, 4).map((b: { id: string; name: string; icon: string }, i: number) => (
                    <button key={i} onClick={() => { try { playBeat(b.id) } catch(err) {} toast({ title: `${b.icon} ${b.name}` }) }}
                      className="bg-slate-800 hover:bg-slate-700 rounded-lg px-2 py-1.5 text-center transition-all active:scale-95 r53-beat-btn" style={{ animationDelay: `${i * 60}ms` }}>
                      <span className="text-sm">{b.icon}</span>
                      <span className="text-[8px] text-slate-400 ml-1">{b.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => { try { stopAllSounds() } catch(e) {} toast({ title: 'All sounds stopped' }) }}
                  className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r53-action-btn">
                  ⏹ Stop All
                </button>
                <button onClick={() => { const v = getMixerState().master || 0.7; sbSetMasterVolume(v < 0.5 ? 1 : 0.3); toast({ title: 'Volume toggled' }) }}
                  className="flex-1 px-3 py-2 bg-pink-700 hover:bg-pink-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r53-action-btn">
                  🔊 Toggle Vol
                </button>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 53: Mission System Panel */}
      {showMissionPanel && mounted && (() => {
        const overview = getMissionOverview()
        const active = getActiveMissions()
        const available = getAvailableMissions().slice(0, 6)
        const chains = getMissionChains()
        const catProgress = getCategoryProgress()
        const streak = getStreakData()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowMissionPanel(false)}>
            <div className="bg-slate-900 border border-emerald-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 mission-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-emerald-300 text-lg font-bold">📋 Mission System</span>
                <button onClick={() => setShowMissionPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Active', value: `${active.length}/5`, color: 'text-emerald-400' },
                  { label: 'Done', value: getMissionStats().completed, color: 'text-blue-400' },
                  { label: 'Streak', value: `${streak.current}🔥`, color: 'text-orange-400' },
                  { label: 'Rate', value: `${Math.round(getMissionSuccessRate() * 100)}%`, color: 'text-violet-400' },
                ].map((s, i) => (
                  <div key={i} className={`bg-slate-800 rounded-lg p-2 text-center r53-mission-stat`} style={{ animationDelay: `${i * 80}ms` }}>
                    <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Active Missions */}
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">⚡ Active Missions</span>
                <div className="mt-1.5 space-y-1.5">
                  {active.slice(0, 5).map((m: { id: string; title: string; description: string; progress: number; target: number; difficulty: string; category: string; rewards: Array<{ type: string; amount: number }> }, i: number) => {
                    const pct = Math.min(100, Math.round((m.progress / m.target) * 100))
                    const diffColors: Record<string, string> = { Easy: 'text-slate-400', Medium: 'text-emerald-400', Hard: 'text-amber-400', Epic: 'text-violet-400', Legendary: 'text-yellow-400' }
                    return (
                      <div key={i} className="bg-slate-800 rounded-lg p-2.5 r53-active-mission" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-white">{m.title}</span>
                          <span className={`text-[8px] font-bold ${diffColors[m.difficulty] || 'text-slate-500'}`}>{m.difficulty}</span>
                        </div>
                        <div className="text-[8px] text-slate-500 mb-1.5">{m.description}</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full r53-mission-fill" style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="text-[8px] text-slate-400">{pct}%</span>
                        </div>
                        <div className="flex gap-1 mt-1">
                          {m.rewards?.slice(0, 3).map((r: { type: string; amount: number }, ri: number) => (
                            <span key={ri} className="text-[7px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">+{r.amount} {r.type}</span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  {active.length === 0 && <div className="text-[10px] text-slate-600 text-center py-2">No active missions</div>}
                </div>
              </div>
              {/* Available Missions */}
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">📥 Available</span>
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  {available.slice(0, 6).map((m: { id: string; title: string; difficulty: string; rewards: Array<{ amount: number }> }, i: number) => (
                    <button key={i} onClick={() => { acceptMission(m.id); toast({ title: `Mission accepted!` }) }}
                      className="bg-slate-800 hover:bg-slate-700 rounded-lg px-2 py-1.5 text-left transition-all active:scale-95 r53-available-mission" style={{ animationDelay: `${i * 40}ms` }}>
                      <div className="text-[9px] text-slate-300">{m.title}</div>
                      <div className="text-[7px] text-slate-500">{m.difficulty} · +{m.rewards?.[0]?.amount || 0} coins</div>
                    </button>
                  ))}
                </div>
              </div>
              {/* Mission Chains */}
              <div className="mb-3">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🔗 Chains</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {chains.slice(0, 5).map((c: { id: string; name: string; icon: string; progress: number }, i: number) => (
                    <span key={i} className="text-[9px] bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg r53-chain-item" style={{ animationDelay: `${i * 60}ms` }}>
                      {c.icon} {c.name} <span className="text-emerald-400">{c.progress}%</span>
                    </span>
                  ))}
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => { refreshDailyMissions(); toast({ title: 'Daily missions refreshed!' }) }}
                  className="flex-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r53-action-btn">
                  🔄 Refresh Daily
                </button>
                <button onClick={() => { const recs = getRecommendedMissions(3); toast({ title: `${recs.length} missions recommended` }) }}
                  className="flex-1 px-3 py-2 bg-violet-700 hover:bg-violet-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r53-action-btn">
                  💡 Suggest
                </button>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 53: Emote System Panel */}
      {showEmotePanel && mounted && (() => {
        const overview = getEmoteSystemOverview()
        const categories = emoteGetCategories()
        const quickEmotes = getQuickEmotes()
        const packs = getEmotePacks()
        const mostUsed = getMostUsedEmotes(5)
        const recent = getRecentEmotes(8)
        const unlockPct = getEmoteUnlockProgress()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowEmotePanel(false)}>
            <div className="bg-slate-900 border border-cyan-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 emote-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-cyan-300 text-lg font-bold">😀 Emote System</span>
                <button onClick={() => setShowEmotePanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Unlocked', value: `${unlockPct}%`, color: 'text-cyan-400' },
                  { label: 'Total', value: getEmotes().length, color: 'text-violet-400' },
                  { label: 'Packs', value: packs.length, color: 'text-amber-400' },
                  { label: 'Combos', value: '3', color: 'text-emerald-400' },
                ].map((s, i) => (
                  <div key={i} className={`bg-slate-800 rounded-lg p-2 text-center r53-emote-stat`} style={{ animationDelay: `${i * 80}ms` }}>
                    <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Quick Emote Bar */}
              <div className="mb-4 p-2.5 bg-slate-800 rounded-lg">
                <span className="text-slate-400 text-[9px] font-semibold uppercase tracking-wider">⚡ Quick Bar</span>
                <div className="flex gap-2 mt-1.5">
                  {quickEmotes.map((e: { id: string; emoji: string; name: string }, i: number) => (
                    <div key={i} onClick={() => { playEmote(e.id); toast({ title: `${e.emoji} ${e.name}` }) }}
                      className="flex-1 aspect-square bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center text-2xl cursor-pointer transition-all active:scale-90 r53-quick-emote" style={{ animationDelay: `${i * 50}ms` }}>
                      {e.emoji}
                    </div>
                  ))}
                </div>
              </div>
              {/* Category Emotes */}
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🎭 Emotes by Category</span>
                <div className="space-y-2 mt-1.5">
                  {categories.slice(0, 6).map((cat: { id: string; name: string; icon: string; color: string }, ci: number) => {
                    const emotesInCat = getEmotesByCategory(cat.id).slice(0, 8)
                    return (
                      <div key={ci}>
                        <div className="text-[9px] font-semibold mb-1" style={{ color: cat.color }}>{cat.icon} {cat.name}</div>
                        <div className="flex gap-1">
                          {emotesInCat.map((e: { id: string; emoji: string; unlocked: boolean }, ei: number) => (
                            <div key={ei} onClick={() => { if (e.unlocked) { playEmote(e.id); toast({ title: e.emoji }) } }}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-base cursor-pointer transition-all r53-emote-item ${e.unlocked ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-900 opacity-30'}`}
                              style={{ animationDelay: `${(ci * 8 + ei) * 20}ms` }}>
                              {e.unlocked ? e.emoji : '🔒'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* Emote Packs */}
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">📦 Packs</span>
                <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                  {packs.map((p: { id: string; name: string; icon: string; progress: number; price: number }, i: number) => (
                    <div key={i} className="bg-slate-800 rounded-lg p-2 text-center r53-pack-item" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="text-lg">{p.icon}</div>
                      <div className="text-[8px] text-slate-400">{p.name}</div>
                      <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                        <div className="bg-cyan-500 h-1 rounded-full r53-pack-fill" style={{ width: `${p.progress}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Most Used */}
              <div className="mb-3">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">📊 Most Used</span>
                <div className="flex gap-1.5 mt-1.5">
                  {mostUsed.map((e: { id: string; emoji: string; count: number }, i: number) => (
                    <span key={i} className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full r53-used-item" style={{ animationDelay: `${i * 40}ms` }}>
                      {e.emoji} ×{e.count}
                    </span>
                  ))}
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => { unlockEmote('random'); toast({ title: 'Random emote unlocked!' }) }}
                  className="flex-1 px-3 py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r53-action-btn">
                  🎲 Random Unlock
                </button>
                <button onClick={() => { const combo = getActiveComboEffect(); toast({ title: combo ? `Combo: ${combo.name}` : 'No active combo' }) }}
                  className="flex-1 px-3 py-2 bg-violet-700 hover:bg-violet-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r53-action-btn">
                  ✨ Check Combo
                </button>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 54: Word Analytics Panel */}
      {showAnalyticsPanel && mounted && (() => {
        const overview = getAnalyticsOverview()
        const stats = waGetWordStats()
        const perf = getPerformanceCard()
        const weak = getWeakWords(5)
        const strong = getStrongWords(5)
        const growth = getGrowthChart()
        const dist = getWordLengthDistribution()
        const insights = waGetImprovementAreas().slice(0, 3)
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowAnalyticsPanel(false)}>
            <div className="bg-slate-900 border border-sky-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 analytics-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sky-300 text-lg font-bold">📊 Word Analytics</span>
                <button onClick={() => setShowAnalyticsPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Words', value: stats.uniqueWords, color: 'text-sky-400' },
                  { label: 'Accuracy', value: `${stats.avgAccuracy}%`, color: 'text-emerald-400' },
                  { label: 'Avg Len', value: getAverageWordLength(), color: 'text-amber-400' },
                  { label: 'Streak', value: waGetLongestStreak(), color: 'text-rose-400' },
                ].map((s, i) => (
                  <div key={i} className={`bg-slate-800 rounded-lg p-2 text-center r54-stat`} style={{ animationDelay: `${i*80}ms` }}>
                    <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mb-4 p-3 bg-gradient-to-r from-sky-900/30 to-blue-900/30 border border-sky-700/30 rounded-lg r54-perf-card">
                <span className="text-sky-300 text-xs font-semibold">🎯 Performance Grade</span>
                <div className="flex items-center gap-3 mt-2">
                  <div className="text-3xl">{perf.gradeEmoji || '📊'}</div>
                  <div>
                    <div className="text-white text-sm font-bold">{perf.grade || 'B'}</div>
                    <div className="text-[9px] text-slate-400">{perf.totalWords} words analyzed</div>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">📏 Word Length Distribution</span>
                <div className="flex gap-1.5 mt-1.5">
                  {Object.entries(dist).slice(0, 6).map(([len, count]: [string, number], i: number) => (
                    <div key={i} className="flex-1 text-center r54-dist-bar">
                      <div className="text-[8px] text-slate-500">{len}L</div>
                      <div className="w-full bg-slate-700 rounded-full h-16 mt-0.5 relative overflow-hidden">
                        <div className="absolute bottom-0 w-full bg-gradient-to-t from-sky-500 to-blue-400 rounded-full r54-dist-fill" style={{ height: `${Math.min(100, count / Math.max(...Object.values(dist)) * 100)}%` }}></div>
                      </div>
                      <div className="text-[7px] text-slate-400 mt-0.5">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
              {insights.length > 0 && (
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">💡 Insights</span>
                  <div className="space-y-1 mt-1.5">{insights.map((ins: { area: string; description: string; priority: string }, i: number) => (
                    <div key={i} className={`text-[9px] px-2.5 py-1.5 rounded-lg ${ins.priority === 'high' ? 'bg-rose-900/30 text-rose-300 border border-rose-700/30' : 'bg-slate-800 text-slate-400'}`}>
                      <span className="font-semibold">{ins.area}</span> — {ins.description}
                    </div>
                  ))}</div>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => toast({ title: 'Report generated!' })} className="flex-1 px-3 py-2 bg-sky-700 hover:bg-sky-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r54-action-btn">📊 Weekly Report</button>
                <button onClick={() => toast({ title: 'Report generated!' })} className="flex-1 px-3 py-2 bg-violet-700 hover:bg-violet-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r54-action-btn">📈 Monthly Report</button>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 54: Color Studio Panel */}
      {showColorStudioPanel && mounted && (() => {
        const palettes = getPalettes()
        const current = getCurrentPalette()
        const stats = getColorStats()
        const grids = getPaletteGrid()
        const moods = getMoodPalettes('calm')
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowColorStudioPanel(false)}>
            <div className="bg-slate-900 border border-fuchsia-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 colorstudio-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-fuchsia-300 text-lg font-bold">🎨 Color Studio</span>
                <button onClick={() => setShowColorStudioPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Palettes', value: stats.totalPalettes, color: 'text-fuchsia-400' },
                  { label: 'Custom', value: stats.customPalettes, color: 'text-amber-400' },
                  { label: 'Switches', value: stats.totalSwitches, color: 'text-sky-400' },
                  { label: 'Mode', value: getActiveColorMode(), color: 'text-emerald-400' },
                ].map((s, i) => (
                  <div key={i} className={`bg-slate-800 rounded-lg p-2 text-center r54-stat`} style={{ animationDelay: `${i*80}ms` }}>
                    <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🎭 Palettes</span>
                <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                  {palettes.slice(0, 15).map((p: { id: string; name: string; mood: string; colors: string[] }, i: number) => (
                    <div key={i} onClick={() => { selectPalette(p.id); toast({ title: `${p.name} applied!` }) }}
                      className={`p-2 rounded-lg cursor-pointer transition-all r54-palette-item ${current?.id === p.id ? 'ring-2 ring-fuchsia-400' : 'bg-slate-800 hover:bg-slate-700'}`} style={{ animationDelay: `${i*40}ms` }}>
                      <div className="flex gap-0.5 mb-1">{p.colors.slice(0, 5).map((c: string, ci: number) => (
                        <div key={ci} className="flex-1 h-4 rounded" style={{ background: c }}></div>
                      ))}</div>
                      <div className="text-[8px] text-slate-400 text-center truncate">{p.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">😌 Mood Palettes</span>
                <div className="flex gap-1.5 mt-1.5 overflow-x-auto">
                  {moods.slice(0, 5).map((p: { id: string; name: string; colors: string[] }, i: number) => (
                    <div key={i} className="flex-shrink-0 cursor-pointer r54-mood-item" onClick={() => { selectPalette(p.id); toast({ title: p.name }) }}>
                      <div className="flex gap-0.5">{p.colors.slice(0, 5).map((c: string, ci: number) => (
                        <div key={ci} className="w-8 h-8 rounded-lg" style={{ background: c }}></div>
                      ))}</div>
                      <div className="text-[7px] text-slate-500 text-center mt-0.5">{p.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { const p = getRandomPalette(); if (p) { selectPalette(p.id); toast({ title: p.name }) } }} className="flex-1 px-3 py-2 bg-fuchsia-700 hover:bg-fuchsia-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r54-action-btn">🎲 Random</button>
                <button onClick={() => { createPalette('Custom-' + Date.now(), ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6bff']); toast({ title: 'Custom palette created!' }) }} className="flex-1 px-3 py-2 bg-amber-700 hover:bg-amber-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r54-action-btn">➕ Create</button>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 54: Avatar Customizer Panel */}
      {showAvatarCustomPanel && mounted && (() => {
        const overview = getAvatarOverview()
        const current = getCurrentAvatarData()
        const parts = getParts()
        const presets = getPresetAvatars()
        const collection = avGetCollectionProgress()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowAvatarCustomPanel(false)}>
            <div className="bg-slate-900 border border-lime-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 avatar-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lime-300 text-lg font-bold">🧑‍🎨 Avatar Customizer</span>
                <button onClick={() => setShowAvatarCustomPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Unlocked', value: `${collection.percent}%`, color: 'text-lime-400' },
                  { label: 'Parts', value: parts.length, color: 'text-sky-400' },
                  { label: 'Outfits', value: getOutfits().length, color: 'text-amber-400' },
                  { label: 'History', value: getAvatarHistory(1).length, color: 'text-violet-400' },
                ].map((s, i) => (
                  <div key={i} className={`bg-slate-800 rounded-lg p-2 text-center r54-stat`} style={{ animationDelay: `${i*80}ms` }}>
                    <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🎨 Body Parts</span>
                <div className="space-y-2 mt-1.5">
                  {parts.slice(0, 8).map((part: { id: string; name: string; emoji: string, options: Array<{ id: string; emoji: string }> }, i: number) => (
                    <div key={i}>
                      <div className="text-[9px] text-slate-400 font-semibold mb-1">{part.emoji} {part.name}</div>
                      <div className="flex gap-1 overflow-x-auto">
                        {part.options.slice(0, 8).map((opt: { id: string; emoji: string }, oi: number) => (
                          <div key={oi} onClick={() => { setPart(part.id, opt.id); toast({ title: `${part.name}: ${opt.emoji}` }) }}
                            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl cursor-pointer transition-all r54-part-option ${current[part.id] === opt.id ? 'ring-2 ring-lime-400 bg-lime-900/30' : 'bg-slate-800 hover:bg-slate-700'}`}
                            style={{ animationDelay: `${(i*8+oi)*30}ms` }}>
                            {opt.emoji}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">⭐ Presets</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {presets.slice(0, 8).map((p: { id: string; name: string; emoji: string }, i: number) => (
                    <button key={i} onClick={() => { avApplyPreset(p.id); toast({ title: `${p.emoji} ${p.name}` }) }}
                      className="text-[9px] bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-full transition-all active:scale-95 r54-preset-btn" style={{ animationDelay: `${i*50}ms` }}>
                      {p.emoji} {p.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { getRandomizeAvatar(); toast({ title: 'Avatar randomized!' }) }} className="flex-1 px-3 py-2 bg-lime-700 hover:bg-lime-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r54-action-btn">🎲 Randomize</button>
                <button onClick={() => { saveOutfit('Outfit-' + Date.now()); toast({ title: 'Outfit saved!' }) }} className="flex-1 px-3 py-2 bg-amber-700 hover:bg-amber-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r54-action-btn">💾 Save Outfit</button>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 54: Team System Panel */}
      {showTeamPanel && mounted && (() => {
        const myTeam = getMyTeam()
        const members = myTeam ? getTeamMembers(myTeam.id) : []
        const lb = getTeamLeaderboard()
        const invites = getTeamInvites()
        const stats = myTeam ? getTeamStats(myTeam.id) : null
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowTeamPanel(false)}>
            <div className="bg-slate-900 border border-teal-700/50 rounded-xl shadow-2xl w-[540px] max-h-[85vh] overflow-y-auto p-5 team-panel" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-teal-300 text-lg font-bold">👥 Team System</span>
                <button onClick={() => setShowTeamPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              {myTeam ? (<>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: 'Members', value: members.length, color: 'text-teal-400' },
                    { label: 'Rank', value: `#${getTeamRank(myTeam.id)}`, color: 'text-amber-400' },
                    { label: 'Score', value: stats?.totalScore || 0, color: 'text-sky-400' },
                    { label: 'Goals', value: getTeamGoals(myTeam.id).length, color: 'text-violet-400' },
                  ].map((s, i) => (
                    <div key={i} className={`bg-slate-800 rounded-lg p-2 text-center r54-stat`} style={{ animationDelay: `${i*80}ms` }}>
                      <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mb-4 p-3 bg-gradient-to-r from-teal-900/30 to-emerald-900/30 border border-teal-700/30 rounded-lg r54-team-card">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{myTeam.avatar || '👥'}</div>
                    <div>
                      <div className="text-white text-sm font-bold">{myTeam.name}</div>
                      <div className="text-[9px] text-slate-400">{myTeam.description || 'No description'}</div>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">🧑‍🤝‍🧑 Members</span>
                  <div className="space-y-1.5 mt-1.5">
                    {members.slice(0, 8).map((m: { name: string; role: string; score: number }, i: number) => (
                      <div key={i} className="bg-slate-800 rounded-lg p-2 flex items-center justify-between r54-member-item" style={{ animationDelay: `${i*60}ms` }}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{m.role === 'Captain' ? '👑' : m.role === 'Co-Captain' ? '🛡️' : '👤'}</span>
                          <span className="text-[10px] text-white">{m.name}</span>
                        </div>
                        <span className="text-[9px] text-teal-400">{m.score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>) : (<>
                <div className="mb-4 text-center py-6">
                  <div className="text-4xl mb-2">🚫</div>
                  <div className="text-slate-400 text-xs">No team yet. Create or join one!</div>
                </div>
              </>)}
              {invites.length > 0 && (
                <div className="mb-3">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">📨 Invites</span>
                  <div className="flex gap-1.5 mt-1.5">
                    {invites.slice(0, 3).map((inv: { teamName: string; teamId: string }, i: number) => (
                      <div key={i} className="flex-1 bg-slate-800 rounded-lg px-2 py-1.5 text-center r54-invite-item">
                        <div className="text-[9px] text-slate-300">{inv.teamName}</div>
                        <div className="flex gap-1 mt-1 justify-center">
                          <button onClick={() => { acceptInvite(inv.teamId); toast({ title: 'Joined!' }) }} className="text-[8px] bg-emerald-700 hover:bg-emerald-600 text-white px-2 py-0.5 rounded">Accept</button>
                          <button onClick={() => { declineInvite(inv.teamId); toast({ title: 'Declined' }) }} className="text-[8px] bg-rose-700 hover:bg-rose-600 text-white px-2 py-0.5 rounded">Decline</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                {!myTeam && <button onClick={() => { createTeam('Team-' + Math.random().toString(36).slice(2, 8)); toast({ title: 'Team created!' }) }} className="flex-1 px-3 py-2 bg-teal-700 hover:bg-teal-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r54-action-btn">➕ Create Team</button>}
                <button onClick={() => { const teams = getTeams(); if (teams.length > 0) { joinTeam(teams[0].id); toast({ title: 'Joined!' }) } else { toast({ title: 'No teams available' }) }}} className="flex-1 px-3 py-2 bg-sky-700 hover:bg-sky-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r54-action-btn">🔍 Find Team</button>
                {myTeam && <button onClick={() => { sendTeamMessage('Go team! 💪'); toast({ title: 'Message sent!' }) }} className="flex-1 px-3 py-2 bg-violet-700 hover:bg-violet-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r54-action-btn">💬 Chat</button>}
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 55: Word Bingo Panel */}
      {showBingoPanel && mounted && (() => {
        const overview = getBingoOverview()
        const activeGame = isGameActive()
        const stats = bgGetStatsGrid()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowBingoPanel(false)}>
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl shadow-amber-500/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-amber-400 font-bold text-sm flex items-center gap-2">🎲 Word Bingo</h2>
                <button onClick={() => setShowBingoPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {stats.map((s: { label: string; value: string; color: string }, i: number) => (
                  <div key={i} className="bg-slate-800/80 rounded-lg p-2 text-center r55-bingo-stat" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider">{s.label}</div>
                    <div className="text-sm font-bold" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              {!activeGame && (
                <div className="mb-3 p-3 bg-slate-800 rounded-lg text-center">
                  <div className="text-2xl mb-1">🎰</div>
                  <div className="text-slate-300 text-xs mb-2">Start a new Bingo game!</div>
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => { generateCard('Easy'); startGame(); toast({ title: 'Easy Bingo started!' }) }} className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r55-action-btn">Easy</button>
                    <button onClick={() => { generateCard('Medium'); startGame(); toast({ title: 'Medium Bingo started!' }) }} className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r55-action-btn">Medium</button>
                    <button onClick={() => { generateCard('Hard'); startGame(); toast({ title: 'Hard Bingo started!' }) }} className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r55-action-btn">Hard</button>
                  </div>
                </div>
              )}
              {activeGame && (() => {
                const card = getActiveGameCard()
                const patterns = getPatternGrid()
                const remaining = getRemainingCellCount()
                return (
                  <>
                    <div className="mb-3 text-center">
                      <span className="text-[10px] text-amber-300 bg-amber-900/40 px-2 py-0.5 rounded-full">{remaining} cells remaining</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 mb-3">
                      {card.cells.map((cell: { word: string; marked: boolean; isFree: boolean }, i: number) => (
                        <button key={i} onClick={() => { if (!cell.marked && !cell.isFree) { markWord(cell.word); toast({ title: `Marked: ${cell.word}` }) } }} className={`aspect-square rounded-lg text-[8px] font-bold flex items-center justify-center transition-all r55-bingo-cell ${cell.isFree ? 'bg-amber-600 text-white' : cell.marked ? 'bg-amber-700/80 text-amber-100 scale-95' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`} style={{ animationDelay: `${i * 30}ms` }}>
                          {cell.isFree ? '⭐' : cell.word}
                        </button>
                      ))}
                    </div>
                    <div className="mb-3">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Bingo Patterns</div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {patterns.slice(0, 6).map((p: { name: string; completed: boolean; progress: number; reward: string }, i: number) => (
                          <div key={i} className={`rounded-lg p-1.5 text-center r55-pattern-item ${p.completed ? 'bg-amber-700/60 border border-amber-500/50' : 'bg-slate-800'}`} style={{ animationDelay: `${i * 50}ms` }}>
                            <div className="text-[8px] text-slate-300">{p.name}</div>
                            <div className="text-[7px] text-amber-400">{p.progress}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { const hint = autoMarkHint(); if (hint) toast({ title: `Try: ${hint}` }) }} className="flex-1 px-3 py-2 bg-sky-700 hover:bg-sky-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r55-action-btn">💡 Hint</button>
                      <button onClick={() => { endGame(); toast({ title: 'Game ended!' }) }} className="flex-1 px-3 py-2 bg-rose-700 hover:bg-rose-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r55-action-btn">🛑 End</button>
                    </div>
                  </>
                )
              })()}
              <div className="mt-3 p-2 bg-slate-800/60 rounded-lg">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Recent Games</div>
                {getHistoryList().slice(0, 3).map((h: { score: string; pattern: string; time: string }, i: number) => (
                  <div key={i} className="flex justify-between items-center py-1 border-b border-slate-700/50 last:border-0 r55-history-item" style={{ animationDelay: `${i * 40}ms` }}>
                    <span className="text-[9px] text-slate-300">{h.pattern}</span>
                    <span className="text-[9px] text-amber-400 font-semibold">{h.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 55: Mini Map Panel */}
      {showMiniMapPanel && mounted && (() => {
        const overview = getMiniMapOverview()
        const mapData = getMapData()
        const zoneData = getZoneOverlay()
        const stats = mmGetStatsGrid()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowMiniMapPanel(false)}>
            <div className="bg-slate-900 border border-lime-500/30 rounded-2xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl shadow-lime-500/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lime-400 font-bold text-sm flex items-center gap-2">🗺️ Mini Map</h2>
                <button onClick={() => setShowMiniMapPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {stats.map((s: { label: string; value: string; color: string }, i: number) => (
                  <div key={i} className="bg-slate-800/80 rounded-lg p-2 text-center r55-map-stat" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider">{s.label}</div>
                    <div className="text-sm font-bold" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="mb-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Map View</div>
                <div className="bg-slate-800 rounded-lg p-2 relative" style={{ minHeight: 140 }}>
                  <div className="grid grid-cols-10 gap-px">
                    {getMapGrid().slice(0, 100).map((cell: { x: number; y: number; zone: string; visited: boolean; revealed: boolean }, i: number) => (
                      <div key={i} className={`aspect-square rounded-sm text-[5px] flex items-center justify-center r55-map-cell ${cell.revealed ? (cell.visited ? 'bg-lime-700/60' : 'bg-slate-600/60') : 'bg-slate-900/80'}`} style={{ animationDelay: `${i * 8}ms`, backgroundColor: cell.revealed && !cell.visited ? zoneData.find((z: { name: string }) => z.name === cell.zone)?.color || '#334155' : undefined }}>
                        {cell.visited ? '●' : cell.revealed ? '○' : ''}
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-1 right-1 text-[8px] text-slate-500">Zoom: {mapData.zoomLevel}×</div>
                </div>
              </div>
              <div className="mb-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Zones</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {zoneData.slice(0, 8).map((z: { name: string; emoji: string; color: string; multiplier: number; explored: number }, i: number) => (
                    <div key={i} className="bg-slate-800 rounded-lg p-2 flex items-center gap-2 r55-zone-item" style={{ animationDelay: `${i * 50}ms` }}>
                      <span className="text-sm">{z.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] text-slate-300 truncate">{z.name}</div>
                        <div className="text-[8px] text-lime-400">×{z.multiplier} · {z.explored}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Controls</div>
                <div className="grid grid-cols-4 gap-1.5">
                  <button onClick={() => { zoomIn(); toast({ title: `Zoom: ${getMapData().zoomLevel}×` }) }} className="px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-[9px] font-semibold rounded-lg transition-all active:scale-95 r55-action-btn">🔍+</button>
                  <button onClick={() => { zoomOut(); toast({ title: `Zoom: ${getMapData().zoomLevel}×` }) }} className="px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-[9px] font-semibold rounded-lg transition-all active:scale-95 r55-action-btn">🔍−</button>
                  <button onClick={() => { centerOnSnake(); toast({ title: 'Centered on snake!' }) }} className="px-2 py-1.5 bg-lime-700 hover:bg-lime-600 text-white text-[9px] font-semibold rounded-lg transition-all active:scale-95 r55-action-btn">🎯</button>
                  <button onClick={() => { fitToContent(); toast({ title: 'Fit to content!' }) }} className="px-2 py-1.5 bg-lime-700 hover:bg-lime-600 text-white text-[9px] font-semibold rounded-lg transition-all active:scale-95 r55-action-btn">📐</button>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { addBookmark(Math.round(mapData.panX), Math.round(mapData.panY), 'Bookmark-' + Date.now().toString(36).slice(-4), '📍'); toast({ title: 'Bookmark added!' }) }} className="flex-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r55-action-btn">📍 Mark</button>
                <button onClick={() => { clearWaypoints(); toast({ title: 'Waypoints cleared!' }) }} className="flex-1 px-3 py-2 bg-rose-700 hover:bg-rose-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r55-action-btn">🗑️ Clear</button>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 55: Power-Up Factory Panel */}
      {showFactoryPanel && mounted && (() => {
        const overview = getFactoryOverview()
        const materials = getMaterialGrid()
        const recipes = getRecipeGrid()
        const queue = getProductionQueueUI()
        const levelCard = getFactoryLevelCard()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowFactoryPanel(false)}>
            <div className="bg-slate-900 border border-fuchsia-500/30 rounded-2xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl shadow-fuchsia-500/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-fuchsia-400 font-bold text-sm flex items-center gap-2">⚡ Power-Up Factory</h2>
                <button onClick={() => setShowFactoryPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="bg-slate-800/80 rounded-lg p-2 text-center r55-factory-stat">
                  <div className="text-[8px] text-slate-400">Level</div>
                  <div className="text-sm font-bold text-fuchsia-400">{levelCard.level}</div>
                  <div className="w-full h-1 bg-slate-700 rounded-full mt-1"><div className="h-full bg-fuchsia-500 rounded-full" style={{ width: `${levelCard.xpPercent}%` }} /></div>
                </div>
                <div className="bg-slate-800/80 rounded-lg p-2 text-center r55-factory-stat">
                  <div className="text-[8px] text-slate-400">Materials</div>
                  <div className="text-sm font-bold text-emerald-400">{materials.length}</div>
                </div>
                <div className="bg-slate-800/80 rounded-lg p-2 text-center r55-factory-stat">
                  <div className="text-[8px] text-slate-400">Recipes</div>
                  <div className="text-sm font-bold text-amber-400">{recipes.filter((r: { unlocked: boolean }) => r.unlocked).length}</div>
                </div>
                <div className="bg-slate-800/80 rounded-lg p-2 text-center r55-factory-stat">
                  <div className="text-[8px] text-slate-400">Queue</div>
                  <div className="text-sm font-bold text-sky-400">{queue.length}</div>
                </div>
              </div>
              <div className="mb-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Materials</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {materials.slice(0, 8).map((m: { name: string; icon: string; quantity: number; rarity: string; color: string }, i: number) => (
                    <div key={i} className="bg-slate-800 rounded-lg p-1.5 text-center r55-material-item" style={{ animationDelay: `${i * 40}ms` }}>
                      <div className="text-base">{m.icon}</div>
                      <div className="text-[7px] text-slate-300 truncate">{m.name}</div>
                      <div className="text-[8px] font-bold" style={{ color: m.color }}>{m.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Recipes</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {recipes.slice(0, 6).map((r: { name: string; icon: string; rarity: string; color: string; unlocked: boolean; canCraft: boolean }, i: number) => (
                    <button key={i} onClick={() => { if (r.unlocked && r.canCraft) { queueCraft(r.name); toast({ title: `Crafting: ${r.name}!` }) } else if (!r.unlocked) { toast({ title: 'Recipe locked!' }) } else { toast({ title: 'Not enough materials!' }) } }} className={`rounded-lg p-2 text-left transition-all r55-recipe-item ${r.unlocked && r.canCraft ? 'bg-fuchsia-900/30 hover:bg-fuchsia-800/40 border border-fuchsia-500/30' : 'bg-slate-800 opacity-60'}`} style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{r.icon}</span>
                        <div className="min-w-0">
                          <div className="text-[9px] font-semibold truncate" style={{ color: r.color }}>{r.name}</div>
                          <div className="text-[7px] text-slate-400">{r.rarity}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {queue.length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Production Queue</div>
                  {queue.slice(0, 3).map((q: { name: string; icon: string; progress: number; eta: string }, i: number) => (
                    <div key={i} className="mb-1.5 bg-slate-800 rounded-lg p-2 r55-queue-item" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] text-slate-300">{q.icon} {q.name}</span>
                        <span className="text-[8px] text-fuchsia-400">{q.eta}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-700 rounded-full"><div className="h-full bg-fuchsia-500 rounded-full transition-all r55-queue-fill" style={{ width: `${q.progress}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => { generateDailyDeals(); toast({ title: 'Daily deals refreshed!' }) }} className="flex-1 px-3 py-2 bg-fuchsia-700 hover:bg-fuchsia-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r55-action-btn">🛒 Deals</button>
                <button onClick={() => { processQueue(); toast({ title: 'Queue processed!' }) }} className="flex-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-semibold rounded-lg transition-all active:scale-95 r55-action-btn">⚙️ Process</button>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 55: Daily Fortune Panel */}
      {showFortunePanel && mounted && (() => {
        const overview = getFortuneOverview()
        const mood = getMoodIndicator()
        const lucky = getLuckyDisplay()
        const scoreCard = getFortuneScoreCard()
        const streak = dfGetStreakCard()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowFortunePanel(false)}>
            <div className="bg-slate-900 border border-yellow-500/30 rounded-2xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl shadow-yellow-500/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-yellow-400 font-bold text-sm flex items-center gap-2">🔮 Daily Fortune</h2>
                <button onClick={() => setShowFortunePanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-800/80 rounded-lg p-2 text-center r55-fortune-stat">
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider">Mood</div>
                  <div className="text-lg">{mood.emoji}</div>
                  <div className="text-[9px] font-semibold" style={{ color: mood.color }}>{mood.label}</div>
                </div>
                <div className="bg-slate-800/80 rounded-lg p-2 text-center r55-fortune-stat">
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider">Luck Score</div>
                  <div className="text-sm font-bold text-yellow-400">{scoreCard.score}/100</div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full mt-1"><div className="h-full rounded-full transition-all r55-score-fill" style={{ width: `${scoreCard.score}%`, backgroundColor: scoreCard.color }} /></div>
                </div>
              </div>
              <div className="mb-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Fortune Cookie</div>
                <button onClick={() => { crackCookie(); toast({ title: 'Cookie cracked!' }) }} className="w-full p-3 bg-gradient-to-r from-yellow-900/40 to-amber-900/40 border border-yellow-500/30 rounded-xl text-center hover:border-yellow-400/50 transition-all r55-cookie-card">
                  <div className="text-2xl mb-1">🍪</div>
                  <div className="text-[10px] text-yellow-300 font-medium">Tap to crack your fortune cookie!</div>
                </button>
              </div>
              {(() => {
                const cookie = getFortuneCookieCard()
                if (!cookie) return null
                return (
                  <div className="mb-3 p-3 bg-slate-800/80 rounded-xl border border-yellow-500/20 r55-fortune-reveal">
                    <div className="text-[10px] font-semibold mb-1" style={{ color: cookie.color }}>{cookie.rarity}</div>
                    <div className="text-xs text-slate-200 italic">"{cookie.message}"</div>
                    {cookie.effect && <div className="text-[9px] text-yellow-400 mt-1">{cookie.effect}</div>}
                  </div>
                )
              })()}
              <div className="mb-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Lucky Numbers & Words</div>
                <div className="flex gap-1.5 mb-1.5 flex-wrap">
                  {lucky.numbers.map((n: number, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-yellow-900/40 text-yellow-300 text-[10px] font-bold rounded-full r55-lucky-num" style={{ animationDelay: `${i * 60}ms` }}>{n}</span>
                  ))}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {lucky.words.map((w: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-amber-900/40 text-amber-300 text-[9px] font-medium rounded-full r55-lucky-word" style={{ animationDelay: `${i * 60}ms` }}>{w}</span>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Streak</div>
                <div className="bg-slate-800 rounded-lg p-2 flex items-center justify-between r55-streak-card">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔥</span>
                    <div>
                      <div className="text-[10px] font-bold text-yellow-400">{streak.current} days</div>
                      <div className="text-[8px] text-slate-400">Next milestone: {streak.nextMilestone}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] text-slate-400">Record</div>
                    <div className="text-[10px] font-bold text-amber-400">{streak.record}</div>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Quick Actions</div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button onClick={() => { drawDailyTarot(); toast({ title: 'Tarot drawn!' }) }} className="px-2 py-2 bg-purple-900/40 hover:bg-purple-800/50 text-purple-300 text-[9px] font-semibold rounded-lg transition-all active:scale-95 r55-action-btn">🃏 Tarot</button>
                  <button onClick={() => { castRunes(); toast({ title: 'Runes cast!' }) }} className="px-2 py-2 bg-indigo-900/40 hover:bg-indigo-800/50 text-indigo-300 text-[9px] font-semibold rounded-lg transition-all active:scale-95 r55-action-btn">🔮 Runes</button>
                  <button onClick={() => { selectZodiacSign('Aries'); getTodayReading(); toast({ title: 'Reading ready!' }) }} className="px-2 py-2 bg-sky-900/40 hover:bg-sky-800/50 text-sky-300 text-[9px] font-semibold rounded-lg transition-all active:scale-95 r55-action-btn">⭐ Zodiac</button>
                </div>
              </div>
              {(() => {
                const horoscope = getHoroscopeCard()
                if (!horoscope) return null
                return (
                  <div className="p-2 bg-slate-800/60 rounded-lg r55-horoscope-card">
                    <div className="text-[10px] text-slate-400 font-semibold mb-1">{horoscope.sign} {horoscope.emoji}</div>
                    <div className="grid grid-cols-4 gap-1 text-center">
                      <div><div className="text-[7px] text-slate-400">Overall</div><div className="text-[10px]">{'⭐'.repeat(horoscope.overall)}</div></div>
                      <div><div className="text-[7px] text-slate-400">Game</div><div className="text-[10px]">{'⭐'.repeat(horoscope.game)}</div></div>
                      <div><div className="text-[7px] text-slate-400">Words</div><div className="text-[10px]">{'⭐'.repeat(horoscope.words)}</div></div>
                      <div><div className="text-[7px] text-slate-400">Luck</div><div className="text-[10px]">{'⭐'.repeat(horoscope.luck)}</div></div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        )
      })()}
      {/* Round 56: Word Typing Race Panel */}
      {showTypingRacePanel && mounted && (() => {
        const overview = trGetTypingOverview()
        const stats = trGetStatsGrid()
        const raceTypes = trGetAllRaceTypeCards()
        const daily = trGetDailyCard()
        const isRacing = trGetRaceStatus() === 'active'
        const currentWord = isRacing ? trGetCurrentWord() : null
        const wpm = isRacing ? trGetWPM() : 0
        const accuracy = isRacing ? trGetAccuracy() : 100
        const combo = isRacing ? trGetComboMultiplier() : 1
        const score = isRacing ? trGetScore() : 0
        const progress = isRacing ? trGetRaceProgress() : 0
        const lives = isRacing ? trGetLives() : 0
        const history = trGetRecentRaces()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowTypingRacePanel(false)}>
            <div className="bg-slate-900 border border-sky-500/30 rounded-2xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl shadow-sky-500/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sky-400 font-bold text-sm flex items-center gap-2">⌨️ Word Typing Race</h2>
                <button onClick={() => setShowTypingRacePanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {stats.slice(0, 4).map((s: { label: string; value: string; color: string }, i: number) => (
                  <div key={i} className="bg-slate-800/80 rounded-lg p-1.5 text-center r56-type-stat" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="text-[7px] text-slate-400 uppercase tracking-wider">{s.label}</div>
                    <div className="text-[10px] font-bold" style={{ color: s.color || '#7dd3fc' }}>{s.value}</div>
                  </div>
                ))}
              </div>
              {isRacing && (
                <div className="mb-3 p-3 bg-gradient-to-br from-sky-900/30 to-cyan-900/30 rounded-xl border border-sky-500/20 r56-race-active">
                  <div className="grid grid-cols-4 gap-2 mb-2 text-center">
                    <div><div className="text-[7px] text-slate-400">WPM</div><div className="text-sm font-bold text-sky-400">{wpm}</div></div>
                    <div><div className="text-[7px] text-slate-400">Accuracy</div><div className="text-sm font-bold text-green-400">{accuracy}%</div></div>
                    <div><div className="text-[7px] text-slate-400">Combo</div><div className="text-sm font-bold text-amber-400">{combo.toFixed(1)}x</div></div>
                    <div><div className="text-[7px] text-slate-400">Score</div><div className="text-sm font-bold text-violet-400">{score}</div></div>
                  </div>
                  {lives > 0 && <div className="text-[8px] text-slate-400 mb-1">Lives: {'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</div>}
                  <div className="w-full h-1.5 bg-slate-700 rounded-full mb-2"><div className="h-full bg-sky-500 rounded-full transition-all r56-progress-fill" style={{ width: `${progress}%` }} /></div>
                  {currentWord && (
                    <div className="text-center">
                      <div className="text-[8px] text-slate-400 mb-1">Type this word:</div>
                      <div className="text-xl font-bold text-white tracking-widest r56-word-display">{currentWord}</div>
                      <input className="mt-2 w-full bg-slate-800 border border-sky-500/30 rounded-lg px-3 py-1.5 text-sm text-white text-center focus:outline-none focus:border-sky-400" placeholder="Type here..." autoFocus onKeyDown={e => {
                        if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                          trSubmitWord((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''
                        }
                      }} />
                    </div>
                  )}
                  <div className="flex gap-1.5 mt-2">
                    <button onClick={() => { trEndRace(); toast({ title: 'Race ended!' }) }} className="flex-1 px-2 py-1.5 bg-red-900/40 hover:bg-red-800/50 text-red-300 text-[9px] font-semibold rounded-lg transition-all active:scale-95 r56-action-btn">⏹ End</button>
                    <button onClick={() => { toast({ title: 'Skipped!' }) }} className="flex-1 px-2 py-1.5 bg-amber-900/40 hover:bg-amber-800/50 text-amber-300 text-[9px] font-semibold rounded-lg transition-all active:scale-95 r56-action-btn">⏭ Skip</button>
                  </div>
                </div>
              )}
              {!isRacing && (
                <div className="mb-3">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Race Types</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {raceTypes.map((rt: { id: string; name: string; emoji: string; desc: string; color: string }, i: number) => (
                      <button key={rt.id} onClick={() => { trStartRace(rt.id); toast({ title: `${rt.emoji} ${rt.name} started!` }) }} className="p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg text-left transition-all active:scale-95 r56-race-type-btn" style={{ animationDelay: `${i * 60}ms`, borderColor: rt.color + '40', borderWidth: 1 }}>
                        <div className="text-sm mb-0.5">{rt.emoji}</div>
                        <div className="text-[9px] font-semibold" style={{ color: rt.color }}>{rt.name}</div>
                        <div className="text-[7px] text-slate-400">{rt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="mb-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Daily Challenge</div>
                <div className="p-2 bg-gradient-to-r from-sky-900/30 to-indigo-900/30 rounded-lg border border-sky-500/20 r56-daily-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-bold text-sky-400">Daily Typing Challenge</div>
                      <div className="text-[8px] text-slate-400">Streak: {daily.streak || 0} days</div>
                    </div>
                    <button onClick={() => { trStartRace({difficulty:'medium',raceType:'sprint',duration:60}); toast({ title: 'Daily challenge started!' }) }} className="px-2 py-1 bg-sky-800/60 hover:bg-sky-700/60 text-sky-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r56-action-btn">Start</button>
                  </div>
                </div>
              </div>
              {history.length > 0 && (
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Recent Races</div>
                  <div className="space-y-1">
                    {history.slice(0, 5).map((h: { wpm: number; accuracy: number; score: number; type: string; duration: number }, i: number) => (
                      <div key={i} className="flex items-center justify-between p-1.5 bg-slate-800/60 rounded-lg text-[8px] r56-history-item" style={{ animationDelay: `${i * 40}ms` }}>
                        <span className="text-sky-300 font-semibold">{h.type}</span>
                        <span className="text-slate-400">{h.wpm} WPM</span>
                        <span className="text-green-400">{h.accuracy}%</span>
                        <span className="text-amber-400">{h.score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })()}
      {/* Round 56: Treasure Hunt Panel */}
      {showTreasureHuntPanel && mounted && (() => {
        const overview = thGetHuntOverview()
        const stats = thGetStatsGrid()
        const regions = thGetRegions()
        const streak = thGetStreak()
        const daily = thGetDailyCard()
        const achievements = thGetAchievements().filter((a: { unlocked: boolean }) => a.unlocked)
        const compass = thGetCompassHint(5)
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowTreasureHuntPanel(false)}>
            <div className="bg-slate-900 border border-orange-500/30 rounded-2xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl shadow-orange-500/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-orange-400 font-bold text-sm flex items-center gap-2">🗿 Treasure Hunt</h2>
                <button onClick={() => setShowTreasureHuntPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {stats.slice(0, 4).map((s: { label: string; value: string; color: string }, i: number) => (
                  <div key={i} className="bg-slate-800/80 rounded-lg p-1.5 text-center r56-th-stat" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="text-[7px] text-slate-400 uppercase tracking-wider">{s.label}</div>
                    <div className="text-[10px] font-bold" style={{ color: s.color || '#fb923c' }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="mb-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Explore Regions</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {regions.map((r: { id: string; name: string; emoji: string; theme: string; completion: number; color: string }, i: number) => (
                    <div key={r.id} className="p-2 bg-slate-800/80 rounded-lg r56-region-item" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">{r.emoji}</span>
                        <div className="text-[9px] font-semibold" style={{ color: r.color || '#fb923c' }}>{r.name}</div>
                      </div>
                      <div className="w-full h-1 bg-slate-700 rounded-full"><div className="h-full rounded-full transition-all r56-region-fill" style={{ width: `${r.completion}%`, backgroundColor: r.color || '#fb923c' }} /></div>
                      <div className="text-[7px] text-slate-400 mt-0.5">{r.completion}% explored</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Compass</div>
                <div className="p-2 bg-gradient-to-r from-orange-900/30 to-amber-900/30 rounded-lg border border-orange-500/20 r56-compass-card">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🧭</div>
                    <div className="text-[10px] font-semibold text-orange-400">{typeof compass === 'string' ? compass : 'Start a hunt!'}</div>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Actions</div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button onClick={() => { thStartHunt('Enchanted Forest'); toast({ title: 'Hunt started!' }) }} className="px-2 py-2 bg-orange-900/40 hover:bg-orange-800/50 text-orange-300 text-[9px] font-semibold rounded-lg transition-all active:scale-95 r56-action-btn">🗡️ Hunt</button>
                  <button onClick={() => { thUseHint(); toast({ title: 'Hint used!' }) }} className="px-2 py-2 bg-amber-900/40 hover:bg-amber-800/50 text-amber-300 text-[9px] font-semibold rounded-lg transition-all active:scale-95 r56-action-btn">💡 Hint</button>
                  <button onClick={() => { thAbandonHunt(); toast({ title: 'Hunt abandoned' }) }} className="px-2 py-2 bg-red-900/40 hover:bg-red-800/50 text-red-300 text-[9px] font-semibold rounded-lg transition-all active:scale-95 r56-action-btn">🚪 Quit</button>
                </div>
              </div>
              <div className="mb-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Daily Expedition</div>
                <div className="p-2 bg-gradient-to-r from-orange-900/30 to-yellow-900/30 rounded-lg border border-orange-500/20 r56-daily-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-bold text-orange-400">Daily Expedition</div>
                      <div className="text-[8px] text-slate-400">Streak: {(daily && daily.streak) || streak.current} days</div>
                    </div>
                    <button onClick={() => { thInit(); toast({ title: 'Expedition started!' }) }} className="px-2 py-1 bg-orange-800/60 hover:bg-orange-700/60 text-orange-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r56-action-btn">Go!</button>
                  </div>
                </div>
              </div>
              {achievements.length > 0 && (
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Unlocked ({achievements.length})</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {achievements.slice(0, 8).map((a: { emoji: string; name: string }, i: number) => (
                      <span key={i} className="px-2 py-1 bg-amber-900/30 text-amber-300 text-[8px] font-medium rounded-full r56-achievement-badge" title={a.name}>{a.emoji}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })()}
      {/* Round 56: Achievement Museum Panel */}
      {showMuseumPanel && mounted && (() => {
        const overview = msGetOverviewCard()
        const halls = msGetHalls()
        const level = msGetLevelCard()
        const featured = msGetFeaturedExhibit()
        const recentExhibits = msGetRecentExhibits()
        const visitStats = msGetVisitStats()
        const coins = msGetMuseumCoins()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowMuseumPanel(false)}>
            <div className="bg-slate-900 border border-violet-500/30 rounded-2xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl shadow-violet-500/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-violet-400 font-bold text-sm flex items-center gap-2">🏛️ Achievement Museum</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-amber-400 font-bold">🪙 {coins}</span>
                  <button onClick={() => setShowMuseumPanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <div className="bg-slate-800/80 rounded-lg p-2 text-center r56-museum-stat" style={{ animationDelay: '0ms' }}>
                  <div className="text-[7px] text-slate-400 uppercase tracking-wider">Level</div>
                  <div className="text-sm font-bold text-violet-400">{level.level || 1}</div>
                  <div className="text-[7px] text-slate-400">{level.title || 'Novice'}</div>
                </div>
                <div className="bg-slate-800/80 rounded-lg p-2 text-center r56-museum-stat" style={{ animationDelay: '50ms' }}>
                  <div className="text-[7px] text-slate-400 uppercase tracking-wider">Score</div>
                  <div className="text-sm font-bold text-amber-400">{msGetMuseumScore()}</div>
                  <div className="text-[7px] text-slate-400">/ 100</div>
                </div>
                <div className="bg-slate-800/80 rounded-lg p-2 text-center r56-museum-stat" style={{ animationDelay: '100ms' }}>
                  <div className="text-[7px] text-slate-400 uppercase tracking-wider">Visits</div>
                  <div className="text-sm font-bold text-sky-400">{visitStats.total || 0}</div>
                  <div className="text-[7px] text-slate-400">total</div>
                </div>
              </div>
              {featured && (
                <div className="mb-3 p-3 bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-xl border border-violet-500/20 r56-featured-card">
                  <div className="text-[9px] text-violet-300 font-semibold mb-1">Featured Exhibit</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{featured.emoji || '🏆'}</span>
                    <div>
                      <div className="text-[10px] font-bold text-white">{featured.name || 'Unknown'}</div>
                      <div className="text-[8px] text-slate-400">{featured.description || ''}</div>
                    </div>
                  </div>
                </div>
              )}
              <div className="mb-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Exhibition Halls</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {halls.map((hall: { id: string; name: string; emoji: string; color: string; completion: number }, i: number) => (
                    <div key={hall.id} className="p-2 bg-slate-800/80 rounded-lg r56-hall-item" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">{hall.emoji}</span>
                        <div className="text-[9px] font-semibold" style={{ color: hall.color || '#a78bfa' }}>{hall.name}</div>
                      </div>
                      <div className="w-full h-1 bg-slate-700 rounded-full"><div className="h-full rounded-full transition-all r56-hall-fill" style={{ width: `${hall.completion}%`, backgroundColor: hall.color || '#a78bfa' }} /></div>
                      <div className="text-[7px] text-slate-400 mt-0.5">{hall.completion}% complete</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Tours</div>
                <div className="flex gap-1.5">
                  <button onClick={() => { msStartTour(0); toast({ title: 'Tour started!' }) }} className="flex-1 px-2 py-1.5 bg-violet-900/40 hover:bg-violet-800/50 text-violet-300 text-[9px] font-semibold rounded-lg transition-all active:scale-95 r56-action-btn">🎯 Guided Tour</button>
                  <button onClick={() => { msCapturePhoto(); toast({ title: 'Photo captured!' }) }} className="flex-1 px-2 py-1.5 bg-pink-900/40 hover:bg-pink-800/50 text-pink-300 text-[9px] font-semibold rounded-lg transition-all active:scale-95 r56-action-btn">📸 Photo</button>
                </div>
              </div>
              {recentExhibits.length > 0 && (
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Recent Exhibits</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {recentExhibits.slice(0, 10).map((e: { emoji: string; name: string; rarity: string; color: string }, i: number) => (
                      <span key={i} className="px-2 py-1 bg-slate-800/80 rounded-lg text-[8px] font-medium r56-exhibit-badge" style={{ color: e.color || '#a78bfa', animationDelay: `${i * 30}ms` }} title={`${e.name} (${e.rarity})`}>{e.emoji}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })()}
      {/* Round 56: Mini Arcade Panel */}
      {showArcadePanel && mounted && (() => {
        const overview = arGetArcadeOverview()
        const stats = arGetStatsGrid()
        const games = overview.games || []
        const tokens = arGetTokens()
        const daily = arGetDailyCard()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowArcadePanel(false)}>
            <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl shadow-red-500/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-red-400 font-bold text-sm flex items-center gap-2">🎮 Mini Arcade</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-amber-400 font-bold">🪙 {tokens}</span>
                  <button onClick={() => setShowArcadePanel(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {stats.slice(0, 4).map((s: { label: string; value: string; color: string }, i: number) => (
                  <div key={i} className="bg-slate-800/80 rounded-lg p-1.5 text-center r56-arcade-stat" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="text-[7px] text-slate-400 uppercase tracking-wider">{s.label}</div>
                    <div className="text-[10px] font-bold" style={{ color: s.color || '#f87171' }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="mb-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Mini Games</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {games.map((g: { id: string; name: string; emoji: string; desc: string; color: string; highScore: number; grade: string; unlocked: boolean; playCount: number }, i: number) => (
                    <button key={g.id} onClick={() => { if (g.unlocked) { arStartGame(g.id); toast({ title: `${g.emoji} ${g.name}!` }) } else { toast({ title: 'Locked!', description: `Play ${g.playCount || 0} more games to unlock` }) }}} className={`p-2 rounded-lg text-left transition-all active:scale-95 r56-game-item ${g.unlocked ? 'bg-slate-800/80 hover:bg-slate-700/80 cursor-pointer' : 'bg-slate-800/40 opacity-50 cursor-not-allowed'}`} style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">{g.emoji}</span>
                        <div>
                          <div className="text-[9px] font-semibold" style={{ color: g.color || '#f87171' }}>{g.name}</div>
                          {!g.unlocked && <div className="text-[7px] text-slate-500">🔒 Locked</div>}
                        </div>
                        {g.grade && g.unlocked && <span className="ml-auto text-[9px] font-bold text-amber-400">{g.grade}</span>}
                      </div>
                      <div className="text-[7px] text-slate-400 mb-0.5">{g.desc}</div>
                      {g.highScore > 0 && <div className="text-[7px] text-sky-400">Best: {g.highScore}</div>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Daily Arcade Challenge</div>
                <div className="p-2 bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-lg border border-red-500/20 r56-daily-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-bold text-red-400">Play All 8 Games</div>
                      <div className="text-[8px] text-slate-400">Bonus: +100 tokens</div>
                    </div>
                    <button onClick={() => { arStartDaily(); toast({ title: 'Daily challenge started!' }) }} className="px-2 py-1 bg-red-800/60 hover:bg-red-700/60 text-red-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r56-action-btn">Start</button>
                  </div>
                </div>
              </div>
              {arIsGameActive() && (
                <div className="mb-3 p-2 bg-slate-800/60 rounded-lg">
                  <div className="text-[9px] text-green-400 font-semibold mb-1">Game Active</div>
                  <div className="flex gap-1.5">
                    <button onClick={() => { arEndGame(); toast({ title: 'Game ended!' }) }} className="flex-1 px-2 py-1.5 bg-red-900/40 hover:bg-red-800/50 text-red-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r56-action-btn">End Game</button>
                    <button onClick={() => { arPauseGame(); toast({ title: 'Paused' }) }} className="flex-1 px-2 py-1.5 bg-slate-700/60 hover:bg-slate-600/60 text-slate-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r56-action-btn">Pause</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })()}
      {/* Round 57: Snake Evolution Panel */}
      {showEvolutionPanel && mounted && (() => {
        const dashboard = evGetEvolutionDashboard()
        const paths = evGetEvolutionPaths()
        const currentPath = evGetCurrentPath()
        const overview = evGetEvolutionOverview()
        const mutations = evGetMutations()
        const dna = evGetDNA()
        const history = evGetEvolutionHistory()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowEvolutionPanel(false)}>
            <div className="bg-slate-900 border border-lime-500/30 rounded-2xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl shadow-lime-500/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🐍</span>
                  <span className="text-sm font-bold text-lime-400">Snake Evolution</span>
                </div>
                <span className="text-[10px] text-slate-500">{overview.totalAbilities || 0} abilities</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                <div className="p-2 bg-gradient-to-br from-lime-900/30 to-emerald-900/30 rounded-lg border border-lime-500/20 r57-evolution-stat"><div className="text-[9px] text-slate-400">Current Path</div><div className="text-xs font-bold text-lime-400">{currentPath || 'None'}</div></div>
                <div className="p-2 bg-gradient-to-br from-lime-900/30 to-emerald-900/30 rounded-lg border border-lime-500/20 r57-evolution-stat"><div className="text-[9px] text-slate-400">Stage</div><div className="text-xs font-bold text-emerald-400">{overview.stageName || 'Embryo'}</div></div>
                <div className="p-2 bg-gradient-to-br from-lime-900/30 to-emerald-900/30 rounded-lg border border-lime-500/20 r57-evolution-stat"><div className="text-[9px] text-slate-400">Mutations</div><div className="text-xs font-bold text-yellow-400">{overview.activeMutations || 0}/{overview.maxMutations || 3}</div></div>
                <div className="p-2 bg-gradient-to-br from-lime-900/30 to-emerald-900/30 rounded-lg border border-lime-500/20 r57-evolution-stat"><div className="text-[9px] text-slate-400">DNA Collected</div><div className="text-xs font-bold text-cyan-400">{overview.dnaCollected || 0}/10</div></div>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Evolution Paths</div>
              <div className="grid grid-cols-5 gap-1 mb-3">
                {paths.slice(0, 5).map((p: any) => (
                  <button key={p.id || p.name} onClick={() => { evSetCurrentPath(p.id || p.name); toast({ title: `Path: ${p.name || p.id}` }) }} className={`p-1.5 rounded-lg border text-center transition-all active:scale-95 r57-path-item ${currentPath === (p.id || p.name) ? 'border-lime-400 bg-lime-900/40' : 'border-slate-700 bg-slate-800/40 hover:border-lime-600/50'}`}>
                    <div className="text-sm">{p.icon || '🐍'}</div>
                    <div className="text-[7px] text-slate-400 truncate">{p.name || p.id}</div>
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Active Mutations</div>
              <div className="grid grid-cols-3 gap-1 mb-3">
                {mutations.filter((m: any) => m.active).slice(0, 3).map((m: any, i: number) => (
                  <div key={m.id || i} className="p-1.5 bg-slate-800/60 rounded-lg border border-purple-500/20 r57-mutation-item">
                    <div className="text-[8px] font-bold text-purple-400">{m.name || m.id}</div>
                    <div className="text-[7px] text-slate-500">{m.effect || m.description || ''}</div>
                  </div>
                ))}
                {mutations.filter((m: any) => m.active).length < 3 && (
                  <button onClick={() => { const mut = evRollMutation(); if (mut) { evApplyMutation(mut.id || mut.name); toast({ title: 'New mutation!' }) } }} className="p-1.5 bg-slate-800/40 rounded-lg border border-dashed border-purple-500/30 text-[8px] text-purple-400 hover:bg-purple-900/20 transition-all active:scale-95 r57-action-btn">Roll Mutation</button>
                )}
              </div>
              <div className="flex gap-1.5 mb-3">
                <button onClick={() => { evAddXP(50); toast({ title: '+50 XP!' }) }} className="flex-1 px-2 py-1.5 bg-lime-900/40 hover:bg-lime-800/50 text-lime-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r57-action-btn">Add XP</button>
                <button onClick={() => { evEvolve(); toast({ title: 'Evolution triggered!' }) }} className="flex-1 px-2 py-1.5 bg-emerald-900/40 hover:bg-emerald-800/50 text-emerald-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r57-action-btn">Evolve</button>
                <button onClick={() => { evResetPath(); toast({ title: 'Path reset!' }) }} className="flex-1 px-2 py-1.5 bg-red-900/40 hover:bg-red-800/50 text-red-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r57-action-btn">Reset</button>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">DNA Strands</div>
              <div className="grid grid-cols-5 gap-1 mb-3">
                {dna.slice(0, 5).map((d: any, i: number) => (
                  <div key={d.id || i} className={`p-1.5 rounded-lg border text-center r57-dna-item ${d.collected ? 'border-cyan-400 bg-cyan-900/30' : 'border-slate-700 bg-slate-800/30'}`}>
                    <div className="text-xs">{d.icon || '🧬'}</div>
                    <div className="text-[6px] text-slate-500">{d.name || `DNA${i + 1}`}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 57: Word Alchemy Panel */}
      {showAlchemyPanel && mounted && (() => {
        const lab = alGetLab()
        const overview = alGetAlchemyOverview()
        const rooms = alGetRooms()
        const elements = alGetElements()
        const recipes = alGetRecipes()
        const elixirs = alGetElixirs()
        const daily = alGetDailyChallenge()
        const materials = alGetMaterials()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowAlchemyPanel(false)}>
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl shadow-amber-500/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚗️</span>
                  <span className="text-sm font-bold text-amber-400">Word Alchemy</span>
                </div>
                <span className="text-[10px] text-slate-500">Lv.{lab.level || 1}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                <div className="p-2 bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-lg border border-amber-500/20 r57-alchemy-stat"><div className="text-[9px] text-slate-400">Lab Level</div><div className="text-xs font-bold text-amber-400">{lab.level || 1}</div></div>
                <div className="p-2 bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-lg border border-amber-500/20 r57-alchemy-stat"><div className="text-[9px] text-slate-400">Recipes Found</div><div className="text-xs font-bold text-orange-400">{overview.discoveredCount || 0}/{overview.totalRecipes || 30}</div></div>
                <div className="p-2 bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-lg border border-amber-500/20 r57-alchemy-stat"><div className="text-[9px] text-slate-400">Potions</div><div className="text-xs font-bold text-purple-400">{overview.potionCount || 0}</div></div>
                <div className="p-2 bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-lg border border-amber-500/20 r57-alchemy-stat"><div className="text-[9px] text-slate-400">Elixirs</div><div className="text-xs font-bold text-cyan-400">{overview.elixirCount || 0}/15</div></div>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Elements</div>
              <div className="grid grid-cols-6 gap-1 mb-3">
                {elements.slice(0, 6).map((el: any, i: number) => (
                  <div key={el.id || i} className="p-1.5 bg-slate-800/60 rounded-lg border border-amber-500/20 text-center r57-element-item">
                    <div className="text-sm">{el.icon || ['🔥','💧','🌿','💨','⚡','🌀'][i]}</div>
                    <div className="text-[7px] text-slate-400 truncate">{el.name || `El${i + 1}`}</div>
                    <div className="text-[6px] text-amber-500">Lv.{el.mastery || 0}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Lab Rooms</div>
              <div className="grid grid-cols-5 gap-1 mb-3">
                {rooms.slice(0, 5).map((r: any, i: number) => (
                  <div key={r.id || i} className={`p-1 rounded-lg border text-center r57-room-item ${r.unlocked ? 'border-amber-400 bg-amber-900/30' : 'border-slate-700 bg-slate-800/30'}`}>
                    <div className="text-[7px] font-bold text-amber-400">{r.name || `Room${i + 1}`}</div>
                    <div className="text-[6px] text-slate-500">{r.unlocked ? 'Open' : 'Locked'}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Recipes ({overview.discoveredCount || 0}/{overview.totalRecipes || 30})</div>
              <div className="grid grid-cols-3 gap-1 mb-3">
                {recipes.slice(0, 6).map((r: any, i: number) => (
                  <div key={r.id || i} className={`p-1.5 rounded-lg border text-center r57-recipe-item ${r.discovered ? 'border-purple-400 bg-purple-900/20' : 'border-slate-700 bg-slate-800/20'}`}>
                    <div className="text-[8px] font-bold text-purple-300">{r.name || `Recipe${i + 1}`}</div>
                    <div className="text-[6px] text-slate-500">{r.discovered ? (r.potion || 'Known') : '???'}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 mb-3">
                <button onClick={() => { alTransmuteLetters(['A', 'B']); alAddLabXP(10); toast({ title: 'Transmuted!' }) }} className="flex-1 px-2 py-1.5 bg-amber-900/40 hover:bg-amber-800/50 text-amber-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r57-action-btn">Transmute</button>
                <button onClick={() => { alDiscoverRecipe('r1'); toast({ title: 'Recipe discovered!' }) }} className="flex-1 px-2 py-1.5 bg-purple-900/40 hover:bg-purple-800/50 text-purple-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r57-action-btn">Discover</button>
                <button onClick={() => { alBrewPotion('p1'); toast({ title: 'Brewing!' }) }} className="flex-1 px-2 py-1.5 bg-orange-900/40 hover:bg-orange-800/50 text-orange-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r57-action-btn">Brew</button>
              </div>
              <div className="p-2 bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-lg border border-amber-500/20 r57-daily-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-bold text-amber-400">Daily Challenge</div>
                    <div className="text-[8px] text-slate-400">{daily.name || 'Transmute Quest'}</div>
                  </div>
                  <button onClick={() => { alCompleteDailyChallenge(); toast({ title: 'Challenge done!' }) }} className="px-2 py-1 bg-amber-800/60 hover:bg-amber-700/60 text-amber-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r57-action-btn">Complete</button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 57: Puzzle Dungeon Panel */}
      {showDungeonPanel && mounted && (() => {
        const overview = dgGetDungeonOverview()
        const dungeons = dgGetDungeons()
        const stats = dgGetRunStats()
        const upgrades = dgGetUpgrades()
        const daily = dgGetDailyDungeon()
        const currentRun = dgGetCurrentRun()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowDungeonPanel(false)}>
            <div className="bg-slate-900 border border-violet-500/30 rounded-2xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl shadow-violet-500/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏰</span>
                  <span className="text-sm font-bold text-violet-400">Puzzle Dungeon</span>
                </div>
                <span className="text-[10px] text-slate-500">{stats.totalRuns || 0} runs</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                <div className="p-2 bg-gradient-to-br from-violet-900/30 to-purple-900/30 rounded-lg border border-violet-500/20 r57-dungeon-stat"><div className="text-[9px] text-slate-400">Best Floor</div><div className="text-xs font-bold text-violet-400">{stats.bestFloor || 0}</div></div>
                <div className="p-2 bg-gradient-to-br from-violet-900/30 to-purple-900/30 rounded-lg border border-violet-500/20 r57-dungeon-stat"><div className="text-[9px] text-slate-400">Total Gold</div><div className="text-xs font-bold text-yellow-400">{dgGetTotalGoldEarned() || 0}</div></div>
                <div className="p-2 bg-gradient-to-br from-violet-900/30 to-purple-900/30 rounded-lg border border-violet-500/20 r57-dungeon-stat"><div className="text-[9px] text-slate-400">Monsters Slain</div><div className="text-xs font-bold text-red-400">{stats.monstersDefeated || 0}</div></div>
                <div className="p-2 bg-gradient-to-br from-violet-900/30 to-purple-900/30 rounded-lg border border-violet-500/20 r57-dungeon-stat"><div className="text-[9px] text-slate-400">Floors Cleared</div><div className="text-xs font-bold text-emerald-400">{stats.floorsCleared || 0}</div></div>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Dungeons</div>
              <div className="grid grid-cols-5 gap-1 mb-3">
                {dungeons.slice(0, 5).map((d: any, i: number) => (
                  <div key={d.id || i} className="p-1.5 bg-slate-800/60 rounded-lg border border-violet-500/20 text-center r57-dungeon-item">
                    <div className="text-sm">{d.icon || ['💎','🌑','🐉','☁️','🌀'][i]}</div>
                    <div className="text-[7px] text-slate-400 truncate">{d.name || `D${i + 1}`}</div>
                    <div className="text-[6px] text-violet-400">{d.floors || 10}F</div>
                  </div>
                ))}
              </div>
              {currentRun && (
                <div className="mb-3 p-2 bg-violet-900/30 rounded-lg border border-violet-500/30">
                  <div className="text-[9px] text-violet-400 font-semibold mb-1">Active Run</div>
                  <div className="flex gap-1.5">
                    <button onClick={() => { dgAttackMonster('word'); toast({ title: 'Attacked!' }) }} className="flex-1 px-2 py-1 bg-red-900/40 hover:bg-red-800/50 text-red-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r57-action-btn">Attack</button>
                    <button onClick={() => { dgClearFloor(); toast({ title: 'Floor cleared!' }) }} className="flex-1 px-2 py-1.5 bg-emerald-900/40 hover:bg-emerald-800/50 text-emerald-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r57-action-btn">Clear</button>
                    <button onClick={() => { dgEndRun(); toast({ title: 'Run ended!' }) }} className="flex-1 px-2 py-1.5 bg-slate-700/60 hover:bg-slate-600/60 text-slate-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r57-action-btn">Flee</button>
                  </div>
                </div>
              )}
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Meta Upgrades</div>
              <div className="grid grid-cols-4 gap-1 mb-3">
                {upgrades.slice(0, 8).map((u: any, i: number) => (
                  <div key={u.id || i} className="p-1.5 bg-slate-800/40 rounded-lg border border-slate-700/50 text-center r57-upgrade-item">
                    <div className="text-[8px] font-bold text-violet-300">{u.name || `Up${i + 1}`}</div>
                    <div className="text-[6px] text-slate-500">Lv.{u.level || 0}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 mb-3">
                <button onClick={() => { dgStartRun(dungeons[0]?.id || 'crystal'); toast({ title: 'Dungeon entered!' }) }} className="flex-1 px-2 py-1.5 bg-violet-900/40 hover:bg-violet-800/50 text-violet-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r57-action-btn">Enter Dungeon</button>
                <button onClick={() => { dgBuyUpgrade(upgrades[0]?.id || 'hp'); toast({ title: 'Upgraded!' }) }} className="flex-1 px-2 py-1.5 bg-yellow-900/40 hover:bg-yellow-800/50 text-yellow-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r57-action-btn">Upgrade</button>
              </div>
              <div className="p-2 bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-lg border border-violet-500/20 r57-daily-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-bold text-violet-400">Daily Dungeon</div>
                    <div className="text-[8px] text-slate-400">{daily.name || 'Special Run'}</div>
                  </div>
                  <button onClick={() => { dgCompleteDailyDungeon(); toast({ title: 'Daily complete!' }) }} className="px-2 py-1 bg-violet-800/60 hover:bg-violet-700/60 text-violet-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r57-action-btn">Play</button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 57: Guild System Panel */}
      {showGuildPanel && mounted && (() => {
        const guild = glGetGuild()
        const members = glGetMembers()
        const overview = glGetGuildOverview()
        const wars = glGetWars()
        const quests = glGetQuests()
        const rankings = glGetRankings()
        const chat = glGetChatMessages()
        const achievements = glGetAchievements()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowGuildPanel(false)}>
            <div className="bg-slate-900 border border-sky-500/30 rounded-2xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl shadow-sky-500/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏛️</span>
                  <span className="text-sm font-bold text-sky-400">{guild?.name || 'My Guild'}</span>
                  {guild?.tag && <span className="text-[8px] px-1.5 py-0.5 bg-sky-900/40 text-sky-300 rounded font-mono">[{guild.tag}]</span>}
                </div>
                <span className="text-[10px] text-slate-500">Lv.{glGetGuildLevel() || 1}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                <div className="p-2 bg-gradient-to-br from-sky-900/30 to-blue-900/30 rounded-lg border border-sky-500/20 r57-guild-stat"><div className="text-[9px] text-slate-400">Members</div><div className="text-xs font-bold text-sky-400">{members.length || 0}/30</div></div>
                <div className="p-2 bg-gradient-to-br from-sky-900/30 to-blue-900/30 rounded-lg border border-sky-500/20 r57-guild-stat"><div className="text-[9px] text-slate-400">Guild Rank</div><div className="text-xs font-bold text-blue-400">#{glGetGuildRank() || '--'}</div></div>
                <div className="p-2 bg-gradient-to-br from-sky-900/30 to-blue-900/30 rounded-lg border border-sky-500/20 r57-guild-stat"><div className="text-[9px] text-slate-400">War Wins</div><div className="text-xs font-bold text-red-400">{overview.warWins || 0}</div></div>
                <div className="p-2 bg-gradient-to-br from-sky-900/30 to-blue-900/30 rounded-lg border border-sky-500/20 r57-guild-stat"><div className="text-[9px] text-slate-400">Achievements</div><div className="text-xs font-bold text-yellow-400">{achievements.filter((a: any) => a.unlocked).length || 0}/12</div></div>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Members ({members.length || 0})</div>
              <div className="grid grid-cols-2 gap-1 mb-3 max-h-32 overflow-y-auto">
                {members.slice(0, 8).map((m: any, i: number) => (
                  <div key={m.id || i} className="p-1.5 bg-slate-800/60 rounded-lg border border-sky-500/20 r57-member-item">
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] font-bold text-sky-300">{m.name || `Player${i + 1}`}</span>
                      <span className="text-[6px] px-1 py-0.5 bg-slate-700 rounded text-slate-400">{m.role || 'Member'}</span>
                    </div>
                    <div className="text-[7px] text-slate-500">Contrib: {m.contribution || 0}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Guild Wars</div>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {wars.slice(0, 4).map((w: any, i: number) => (
                  <div key={w.id || i} className="p-1.5 bg-slate-800/40 rounded-lg border border-red-500/20 r57-war-item">
                    <div className="text-[8px] font-bold text-red-300">{w.opponent || 'Enemy'}</div>
                    <div className="text-[6px] text-slate-500">{w.status || w.result || 'Pending'}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Guild Quests</div>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {quests.slice(0, 4).map((q: any, i: number) => (
                  <div key={q.id || i} className="p-1.5 bg-slate-800/40 rounded-lg border border-emerald-500/20 r57-quest-item">
                    <div className="text-[8px] font-bold text-emerald-300">{q.name || `Quest${i + 1}`}</div>
                    <div className="w-full h-1 bg-slate-700 rounded mt-1"><div className="h-full bg-emerald-500 rounded r57-quest-fill" style={{ width: `${q.progress || 0}%` }}></div></div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Recent Chat</div>
              <div className="mb-3 max-h-24 overflow-y-auto">
                {chat.slice(-5).map((c: any, i: number) => (
                  <div key={c.id || i} className="mb-1 p-1 bg-slate-800/30 rounded r57-chat-item">
                    <span className="text-[8px] font-bold text-sky-300">{c.author || 'Anon'}: </span>
                    <span className="text-[8px] text-slate-400">{c.text || c.content || ''}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => { glSendMessage('Hello!'); toast({ title: 'Message sent!' }) }} className="flex-1 px-2 py-1.5 bg-sky-900/40 hover:bg-sky-800/50 text-sky-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r57-action-btn">Send Message</button>
                <button onClick={() => { glStartWar(rankings[1]?.id || 'guild2'); toast({ title: 'War declared!' }) }} className="flex-1 px-2 py-1.5 bg-red-900/40 hover:bg-red-800/50 text-red-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r57-action-btn">Start War</button>
                <button onClick={() => { glStartQuest(quests[0]?.id || 'q1'); toast({ title: 'Quest started!' }) }} className="flex-1 px-2 py-1.5 bg-emerald-900/40 hover:bg-emerald-800/50 text-emerald-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r57-action-btn">Start Quest</button>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 58: Gene Lab Panel */}
      {showGeneLabPanel && mounted && (() => {
        const lab = gnGetLab()
        const overview = gnGetGeneLabOverview()
        const genes = gnGetGenes()
        const stations = gnGetStations()
        const hybrids = gnGetHybridRecipes()
        const daily = gnGetDailyResearch()
        const equipped = gnGetEquippedGenes()
        const mutations = gnGetMutations()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowGeneLabPanel(false)}>
            <div className="bg-slate-900 border border-fuchsia-500/30 rounded-2xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl shadow-fuchsia-500/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><span className="text-lg">🧬</span><span className="text-sm font-bold text-fuchsia-400">Gene Lab</span></div>
                <span className="text-[10px] text-slate-500">Lv.{lab.level || 1}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                <div className="p-2 bg-gradient-to-br from-fuchsia-900/30 to-purple-900/30 rounded-lg border border-fuchsia-500/20 r58-gene-stat"><div className="text-[9px] text-slate-400">Lab Level</div><div className="text-xs font-bold text-fuchsia-400">{lab.level || 1}</div></div>
                <div className="p-2 bg-gradient-to-br from-fuchsia-900/30 to-purple-900/30 rounded-lg border border-fuchsia-500/20 r58-gene-stat"><div className="text-[9px] text-slate-400">Genes</div><div className="text-xs font-bold text-green-400">{genes.length || 0}/50</div></div>
                <div className="p-2 bg-gradient-to-br from-fuchsia-900/30 to-purple-900/30 rounded-lg border border-fuchsia-500/20 r58-gene-stat"><div className="text-[9px] text-slate-400">Hybrids</div><div className="text-xs font-bold text-yellow-400">{gnGetDiscoveredHybrids().length || 0}/{hybrids.length || 20}</div></div>
                <div className="p-2 bg-gradient-to-br from-fuchsia-900/30 to-purple-900/30 rounded-lg border border-fuchsia-500/20 r58-gene-stat"><div className="text-[9px] text-slate-400">DNA Points</div><div className="text-xs font-bold text-cyan-400">{gnGetDNAPoints() || 0}</div></div>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Lab Stations</div>
              <div className="grid grid-cols-4 gap-1 mb-3">
                {stations.slice(0, 8).map((s: any, i: number) => (
                  <div key={s.id || i} className={`p-1 rounded-lg border text-center r58-station-item ${s.unlocked ? 'border-fuchsia-400 bg-fuchsia-900/30' : 'border-slate-700 bg-slate-800/30'}`}>
                    <div className="text-[7px] font-bold text-fuchsia-300">{s.name || `S${i + 1}`}</div>
                    <div className="text-[6px] text-slate-500">{s.unlocked ? 'Open' : `Lv.${s.unlockLevel || '?'}`}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Gene Vault ({gnGetVaultCapacity() - genes.length} slots)</div>
              <div className="grid grid-cols-5 gap-1 mb-3">
                {genes.slice(0, 10).map((g: any, i: number) => (
                  <div key={g.id || i} className="p-1 bg-slate-800/60 rounded-lg border border-fuchsia-500/20 text-center r58-gene-item">
                    <div className="text-[8px] font-bold text-fuchsia-300">{g.name || `G${i + 1}`}</div>
                    <div className="text-[6px] text-slate-500">{g.tier || 'Frag'}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Equipped ({equipped.length}/3)</div>
              <div className="grid grid-cols-3 gap-1 mb-3">
                {equipped.slice(0, 3).map((g: any, i: number) => (
                  <div key={g.id || i} className="p-1.5 bg-fuchsia-900/20 rounded-lg border border-fuchsia-400/30 r58-equipped-item">
                    <div className="text-[8px] font-bold text-fuchsia-300">{g.name || `Slot${i + 1}`}</div>
                    <div className="text-[6px] text-slate-500">{g.effect || ''}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 mb-3">
                <button onClick={() => { gnExtractRandom(); gnAddLabXP(10); toast({ title: 'Gene extracted!' }) }} className="flex-1 px-2 py-1.5 bg-fuchsia-900/40 hover:bg-fuchsia-800/50 text-fuchsia-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r58-action-btn">Extract</button>
                <button onClick={() => { gnSpliceGenes('speed', 'venom'); toast({ title: 'Splicing!' }) }} className="flex-1 px-2 py-1.5 bg-purple-900/40 hover:bg-purple-800/50 text-purple-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r58-action-btn">Splice</button>
                <button onClick={() => { gnInduceMutation('m1', 5); toast({ title: 'Mutation induced!' }) }} className="flex-1 px-2 py-1.5 bg-green-900/40 hover:bg-green-800/50 text-green-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r58-action-btn">Mutate</button>
              </div>
              <div className="p-2 bg-gradient-to-r from-fuchsia-900/30 to-purple-900/30 rounded-lg border border-fuchsia-500/20 r58-daily-card">
                <div className="flex items-center justify-between">
                  <div><div className="text-[9px] font-bold text-fuchsia-400">Daily Research</div><div className="text-[8px] text-slate-400">{daily.name || 'Gene Study'}</div></div>
                  <button onClick={() => { gnCompleteDailyResearch(); toast({ title: 'Research done!' }) }} className="px-2 py-1 bg-fuchsia-800/60 hover:bg-fuchsia-700/60 text-fuchsia-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r58-action-btn">Complete</button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 58: Lore Codex Panel */}
      {showLoreCodexPanel && mounted && (() => {
        const overview = lcGetCodexOverview()
        const chapters = lcGetChapters()
        const characters = lcGetCharacters()
        const daily = lcGetDailyLore()
        const completion = lcGetCompletionPercentage()
        const rank = lcGetMasteryRank()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowLoreCodexPanel(false)}>
            <div className="bg-slate-900 border border-yellow-500/30 rounded-2xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl shadow-yellow-500/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><span className="text-lg">📜</span><span className="text-sm font-bold text-yellow-400">Lore Codex</span></div>
                <span className="text-[10px] text-slate-500">{rank || 'Novice'}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                <div className="p-2 bg-gradient-to-br from-yellow-900/30 to-amber-900/30 rounded-lg border border-yellow-500/20 r58-lore-stat"><div className="text-[9px] text-slate-400">Completion</div><div className="text-xs font-bold text-yellow-400">{completion || 0}%</div></div>
                <div className="p-2 bg-gradient-to-br from-yellow-900/30 to-amber-900/30 rounded-lg border border-yellow-500/20 r58-lore-stat"><div className="text-[9px] text-slate-400">Lore Points</div><div className="text-xs font-bold text-amber-400">{lcGetLorePoints() || 0}</div></div>
                <div className="p-2 bg-gradient-to-br from-yellow-900/30 to-amber-900/30 rounded-lg border border-yellow-500/20 r58-lore-stat"><div className="text-[9px] text-slate-400">Read</div><div className="text-xs font-bold text-green-400">{lcGetTotalWordsRead() || 0} words</div></div>
                <div className="p-2 bg-gradient-to-br from-yellow-900/30 to-amber-900/30 rounded-lg border border-yellow-500/20 r58-lore-stat"><div className="text-[9px] text-slate-400">Streak</div><div className="text-xs font-bold text-orange-400">{lcGetReadingStreak() || 0} days</div></div>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Chapters</div>
              <div className="grid grid-cols-4 gap-1 mb-3">
                {chapters.slice(0, 8).map((ch: any, i: number) => (
                  <div key={ch.id || i} className="p-1.5 bg-slate-800/60 rounded-lg border border-yellow-500/20 text-center r58-chapter-item">
                    <div className="text-sm">{ch.icon || '📖'}</div>
                    <div className="text-[6px] text-slate-400 truncate">{ch.title || `Ch${i + 1}`}</div>
                    <div className="w-full h-1 bg-slate-700 rounded mt-0.5"><div className="h-full bg-yellow-500 rounded r58-chapter-fill" style={{ width: `${ch._readCount && ch._totalEntries ? (ch._readCount / ch._totalEntries * 100) : 0}%` }}></div></div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Characters ({characters.length})</div>
              <div className="grid grid-cols-4 gap-1 mb-3">
                {characters.slice(0, 8).map((c: any, i: number) => (
                  <div key={c.id || i} className="p-1 bg-slate-800/60 rounded-lg border border-yellow-500/20 text-center r58-char-item">
                    <div className="text-sm">{c.portrait || '🎭'}</div>
                    <div className="text-[6px] text-slate-400 truncate">{c.name || `Char${i + 1}`}</div>
                  </div>
                ))}
              </div>
              <div className="p-2 bg-gradient-to-r from-yellow-900/30 to-amber-900/30 rounded-lg border border-yellow-500/20 r58-daily-card">
                <div className="flex items-center justify-between">
                  <div><div className="text-[9px] font-bold text-yellow-400">Daily Lore</div><div className="text-[8px] text-slate-400">{daily?.title || 'Featured Entry'}</div></div>
                  <button onClick={() => { if (daily) { lcReadEntry(daily.id || daily.entryId); toast({ title: 'Reading!' }) } }} className="px-2 py-1 bg-yellow-800/60 hover:bg-yellow-700/60 text-yellow-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r58-action-btn">Read</button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 58: Target Practice Panel */}
      {showTargetPracticePanel && mounted && (() => {
        const overview = tpGetTargetPracticeOverview()
        const modes = tpGetModes()
        const weapons = tpGetWeapons()
        const stats = tpGetStats()
        const daily = tpGetDailyChallenge()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowTargetPracticePanel(false)}>
            <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl shadow-red-500/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><span className="text-lg">🎯</span><span className="text-sm font-bold text-red-400">Target Practice</span></div>
                <span className="text-[10px] text-slate-500">Lv.{tpGetRangeLevel() || 1}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                <div className="p-2 bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-lg border border-red-500/20 r58-target-stat"><div className="text-[9px] text-slate-400">Accuracy</div><div className="text-xs font-bold text-red-400">{tpGetAccuracy() || 0}%</div></div>
                <div className="p-2 bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-lg border border-red-500/20 r58-target-stat"><div className="text-[9px] text-slate-400">Total Shots</div><div className="text-xs font-bold text-orange-400">{tpGetTotalShots() || 0}</div></div>
                <div className="p-2 bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-lg border border-red-500/20 r58-target-stat"><div className="text-[9px] text-slate-400">Best Grade</div><div className="text-xs font-bold text-yellow-400">{stats?.bestGrade || 'F'}</div></div>
                <div className="p-2 bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-lg border border-red-500/20 r58-target-stat"><div className="text-[9px] text-slate-400">Combo</div><div className="text-xs font-bold text-purple-400">{tpGetCombo() || 0}x</div></div>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Training Modes</div>
              <div className="grid grid-cols-5 gap-1 mb-3">
                {modes.slice(0, 5).map((m: any, i: number) => (
                  <button key={m.id || i} onClick={() => { tpStartSession(m.id || i); toast({ title: `${m.name || 'Mode'} started!` }) }} className="p-1.5 bg-slate-800/60 rounded-lg border border-red-500/20 text-center hover:border-red-400/50 transition-all active:scale-95 r58-mode-item">
                    <div className="text-sm">{m.icon || ['🎯','🔤','⚡','🔍','👹'][i]}</div>
                    <div className="text-[6px] text-slate-400 truncate">{m.name || `M${i + 1}`}</div>
                  </button>
                ))}
              </div>
              {tpIsSessionActive() && (
                <div className="mb-3 p-2 bg-red-900/30 rounded-lg border border-red-500/30">
                  <div className="text-[9px] text-red-400 font-semibold mb-1">Session Active — Score: {tpGetScore() || 0}</div>
                  <div className="flex gap-1.5">
                    <button onClick={() => { tpShoot('t1'); toast({ title: 'Hit!' }) }} className="flex-1 px-2 py-1 bg-green-900/40 hover:bg-green-800/50 text-green-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r58-action-btn">Shoot</button>
                    <button onClick={() => { tpMiss(); toast({ title: 'Miss!' }) }} className="flex-1 px-2 py-1 bg-red-900/40 hover:bg-red-800/50 text-red-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r58-action-btn">Miss</button>
                    <button onClick={() => { tpEndSession(); toast({ title: 'Session ended!' }) }} className="flex-1 px-2 py-1 bg-slate-700/60 hover:bg-slate-600/60 text-slate-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r58-action-btn">End</button>
                  </div>
                </div>
              )}
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Weapons</div>
              <div className="grid grid-cols-4 gap-1 mb-3">
                {weapons.slice(0, 8).map((w: any, i: number) => (
                  <div key={w.id || i} className={`p-1 rounded-lg border text-center r58-weapon-item ${w.unlocked ? 'border-red-400 bg-red-900/30' : 'border-slate-700 bg-slate-800/30'}`}>
                    <div className="text-[7px] font-bold text-red-300">{w.name || `W${i + 1}`}</div>
                    <div className="text-[6px] text-slate-500">{w.unlocked ? 'Unlocked' : `Lv.${w.unlockLevel || '?'}`}</div>
                  </div>
                ))}
              </div>
              <div className="p-2 bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-lg border border-red-500/20 r58-daily-card">
                <div className="flex items-center justify-between">
                  <div><div className="text-[9px] font-bold text-red-400">Daily Challenge</div><div className="text-[8px] text-slate-400">{daily?.name || 'Score Attack'}</div></div>
                  <button onClick={() => { tpCompleteDailyChallenge(); toast({ title: 'Challenge done!' }) }} className="px-2 py-1 bg-red-800/60 hover:bg-red-700/60 text-red-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r58-action-btn">Play</button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 58: Carnival Panel */}
      {showCarnivalPanel && mounted && (() => {
        const carnival = cvGetCarnival()
        const overview = cvGetCarnivalOverview()
        const attractions = cvGetAttractions()
        const prizes = cvGetPrizes()
        const daily = cvGetDailyBonus()
        const jackpot = cvGetJackpot()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowCarnivalPanel(false)}>
            <div className="bg-slate-900 border border-pink-500/30 rounded-2xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl shadow-pink-500/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><span className="text-lg">🎪</span><span className="text-sm font-bold text-pink-400">Carnival</span></div>
                <span className="text-[10px] text-slate-500">Lv.{carnival.level || 1}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                <div className="p-2 bg-gradient-to-br from-pink-900/30 to-rose-900/30 rounded-lg border border-pink-500/20 r58-carnival-stat"><div className="text-[9px] text-slate-400">Tickets</div><div className="text-xs font-bold text-pink-400">{cvGetTickets() || 0}</div></div>
                <div className="p-2 bg-gradient-to-br from-pink-900/30 to-rose-900/30 rounded-lg border border-pink-500/20 r58-carnival-stat"><div className="text-[9px] text-slate-400">Jackpot</div><div className="text-xs font-bold text-yellow-400">{jackpot || 500}</div></div>
                <div className="p-2 bg-gradient-to-br from-pink-900/30 to-rose-900/30 rounded-lg border border-pink-500/20 r58-carnival-stat"><div className="text-[9px] text-slate-400">Prizes</div><div className="text-xs font-bold text-purple-400">{cvGetPrizeCollection().length || 0}/20</div></div>
                <div className="p-2 bg-gradient-to-br from-pink-900/30 to-rose-900/30 rounded-lg border border-pink-500/20 r58-carnival-stat"><div className="text-[9px] text-slate-400">Games</div><div className="text-xs font-bold text-green-400">{cvGetTotalGamesPlayed() || 0}</div></div>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Attractions</div>
              <div className="grid grid-cols-4 gap-1 mb-3">
                {attractions.slice(0, 8).map((a: any, i: number) => (
                  <button key={a.id || i} onClick={() => { cvPlayAttraction(a.id || i); cvAddTickets(10); toast({ title: `${a.name || 'Game'}!` }) }} className="p-1.5 bg-slate-800/60 rounded-lg border border-pink-500/20 text-center hover:border-pink-400/50 transition-all active:scale-95 r58-attraction-item">
                    <div className="text-sm">{a.icon || ['🎡','🎪','🔨','🎈','🔮','🦆','💪','🏃'][i]}</div>
                    <div className="text-[6px] text-slate-400 truncate">{a.name || `A${i + 1}`}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5 mb-3">
                <button onClick={() => { cvSpinWheel(); toast({ title: 'Spinning!' }) }} className="flex-1 px-2 py-1.5 bg-pink-900/40 hover:bg-pink-800/50 text-pink-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r58-action-btn">Spin Wheel</button>
                <button onClick={() => { const f = cvGetFortune(); toast({ title: f?.text || 'Fortune told!' }) }} className="flex-1 px-2 py-1.5 bg-purple-900/40 hover:bg-purple-800/50 text-purple-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r58-action-btn">Fortune</button>
                <button onClick={() => { cvClaimDailyBonus(); toast({ title: 'Bonus claimed!' }) }} className="flex-1 px-2 py-1.5 bg-yellow-900/40 hover:bg-yellow-800/50 text-yellow-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r58-action-btn">Daily</button>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Prize Collection ({cvGetPrizeCollection().length}/20)</div>
              <div className="grid grid-cols-5 gap-1 mb-3">
                {prizes.slice(0, 10).map((p: any, i: number) => (
                  <div key={p.id || i} className={`p-1 rounded-lg border text-center r58-prize-item ${p.owned ? 'border-pink-400 bg-pink-900/30' : 'border-slate-700 bg-slate-800/30'}`}>
                    <div className="text-[7px] font-bold text-pink-300">{p.name || `P${i + 1}`}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 59: Robot Factory Panel */}
      {showRobotFactoryPanel && mounted && (() => {
        const factory = rbGetFactory()
        const stats = rbGetStatsGrid()
        const robots = rbGetRobots()
        const opponents = rbGetOpponents()
        const inventory = rbGetInventory()
        const daily = rbGetDailyCard()
        const achievements = rbGetAchievements()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowRobotFactoryPanel(false)}>
            <div className="bg-slate-900/95 border border-slate-600/50 rounded-xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">🤖 Robot Factory</h3>
                <button onClick={() => setShowRobotFactoryPanel(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {stats.map((s: any, i: number) => (
                  <div key={i} className="p-2 bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-lg border border-slate-600/20 r59-robot-stat">
                    <div className="text-[9px] text-slate-400">{s.label}</div>
                    <div className="text-xs font-bold text-slate-200">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">My Robots ({robots.length})</div>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {robots.slice(0, 6).map((r: any, i: number) => (
                  <div key={r.id || i} className="p-2 bg-gradient-to-br from-slate-800/30 to-zinc-900/30 rounded-lg border border-slate-600/20 r59-robot-item">
                    <div className="text-[9px] font-bold text-slate-200">{r.name || `Bot-${i + 1}`}</div>
                    <div className="text-[7px] text-slate-400">{r.class || 'Scout'} · Lv.{r.level || 1}</div>
                    <div className="flex gap-1 mt-1">
                      <span className="text-[7px] text-red-400">ATK {r.stats?.attack || 0}</span>
                      <span className="text-[7px] text-blue-400">DEF {r.stats?.defense || 0}</span>
                      <span className="text-[7px] text-green-400">HP {r.stats?.hp || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Arena Opponents</div>
              <div className="grid grid-cols-4 gap-1 mb-3">
                {opponents.slice(0, 8).map((o: any, i: number) => (
                  <div key={o.id || i} className="p-1.5 rounded-lg border text-center r59-opponent-item" style={{ borderColor: o.defeated ? '#22c55e40' : '#ef444440' }}>
                    <div className="text-[8px] font-bold text-slate-300">{o.name || `Enemy-${i + 1}`}</div>
                    <div className="text-[7px] text-slate-500">Lv.{o.level || i + 1}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Parts Inventory ({inventory.length})</div>
              <div className="grid grid-cols-4 gap-1 mb-3">
                {inventory.slice(0, 8).map((p: any, i: number) => (
                  <div key={p.id || i} className="p-1.5 rounded-lg border text-center r59-part-item" style={{ borderColor: p.rarity === 'Legendary' ? '#f97316' : p.rarity === 'Epic' ? '#a855f7' : p.rarity === 'Rare' ? '#3b82f6' : p.rarity === 'Uncommon' ? '#22c55e' : '#64748b' }}>
                    <div className="text-[8px] font-bold text-slate-200">{p.name || `P${i + 1}`}</div>
                    <div className="text-[6px] text-slate-500">{p.type || 'Head'}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 mb-3">
                <button onClick={() => { rbBuildRobot(); toast({ title: 'Robot built!' }) }} className="flex-1 px-2 py-1.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r59-action-btn">Build Robot</button>
                <button onClick={() => { rbStartBattle(); toast({ title: 'Battle started!' }) }} className="flex-1 px-2 py-1.5 bg-red-900/40 hover:bg-red-800/50 text-red-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r59-action-btn">Arena Fight</button>
                <button onClick={() => { rbForgePart(''); toast({ title: 'Forging!' }) }} className="flex-1 px-2 py-1.5 bg-orange-900/40 hover:bg-orange-800/50 text-orange-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r59-action-btn">Forge</button>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Daily Blueprint</div>
              <div className="p-2 bg-gradient-to-br from-slate-800/30 to-zinc-900/30 rounded-lg border border-slate-600/20 mb-3 r59-daily-card">
                <div className="text-[9px] text-slate-300">{daily?.title || 'Daily Blueprint'}</div>
                <div className="text-[7px] text-slate-500">{daily?.description || 'Check back tomorrow'}</div>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Achievements ({achievements.filter((a: any) => a.unlocked).length}/{achievements.length})</div>
              <div className="grid grid-cols-5 gap-1">
                {achievements.slice(0, 10).map((a: any, i: number) => (
                  <div key={a.id || i} className={`p-1 rounded-lg border text-center r59-achievement-item ${a.unlocked ? 'border-yellow-400 bg-yellow-900/20' : 'border-slate-700 bg-slate-800/20'}`}>
                    <div className="text-[7px] font-bold text-slate-400">{a.name || `A${i + 1}`}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 59: Dream Journal Panel */}
      {showDreamJournalPanel && mounted && (() => {
        const dreams = djGetDreams()
        const stats = djGetStatsGrid()
        const realms = djGetRealms()
        const sleepCard = djGetSleepCard()
        const daily = djGetDailyCard()
        const symbols = djGetSymbols()
        const achievements = djGetAchievements()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowDreamJournalPanel(false)}>
            <div className="bg-indigo-950/95 border border-indigo-500/30 rounded-xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-indigo-200 flex items-center gap-1.5">💭 Dream Journal</h3>
                <button onClick={() => setShowDreamJournalPanel(false)} className="text-indigo-400 hover:text-white text-xs">✕</button>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {stats.map((s: any, i: number) => (
                  <div key={i} className="p-2 bg-gradient-to-br from-indigo-900/30 to-violet-900/30 rounded-lg border border-indigo-500/20 r59-dream-stat">
                    <div className="text-[9px] text-indigo-300">{s.label}</div>
                    <div className="text-xs font-bold text-indigo-200">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider mb-1.5">Recent Dreams ({dreams.length})</div>
              <div className="space-y-1.5 mb-3">
                {dreams.slice(0, 5).map((d: any, i: number) => (
                  <div key={d.id || i} className="p-2 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-lg border border-indigo-500/10 r59-dream-item">
                    <div className="text-[9px] font-bold text-indigo-200">{d.title || `Dream ${i + 1}`}</div>
                    <div className="text-[7px] text-indigo-400/70 truncate">{d.content || 'No content'}</div>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-[7px] text-purple-400">{d.mood || 'Neutral'}</span>
                      <span className="text-[7px] text-violet-400">{d.category || 'Adventure'}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider mb-1.5">Dream Realms ({realms.filter((r: any) => r.discovered).length}/{realms.length})</div>
              <div className="grid grid-cols-4 gap-1 mb-3">
                {realms.slice(0, 8).map((r: any, i: number) => (
                  <div key={r.id || i} className={`p-1.5 rounded-lg border text-center r59-realm-item ${r.discovered ? 'border-indigo-400/40 bg-indigo-900/30' : 'border-slate-700/40 bg-slate-800/20'}`}>
                    <div className="text-[9px]">{r.icon || '🌙'}</div>
                    <div className="text-[7px] font-bold text-indigo-300">{r.name || `Realm ${i + 1}`}</div>
                    <div className="text-[6px] text-indigo-400/50">Lv.{r.level || 0}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider mb-1.5">Dream Symbols</div>
              <div className="grid grid-cols-6 gap-1 mb-3">
                {symbols.slice(0, 12).map((s: any, i: number) => (
                  <div key={s.id || i} className="p-1 rounded-lg border border-violet-500/20 bg-violet-900/20 text-center r59-symbol-item">
                    <div className="text-[8px]">{s.icon || '🔮'}</div>
                    <div className="text-[6px] text-violet-300 truncate">{s.name || 'S'}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider mb-1.5">Sleep Quality</div>
              <div className="p-2 bg-gradient-to-br from-indigo-900/30 to-violet-900/30 rounded-lg border border-indigo-500/20 mb-3">
                <div className="flex items-center gap-2">
                  <div className="text-lg">{sleepCard?.quality >= 80 ? '😴' : sleepCard?.quality >= 50 ? '😪' : '😰'}</div>
                  <div>
                    <div className="text-[10px] font-bold text-indigo-200">Quality: {sleepCard?.quality || 0}/100</div>
                    <div className="text-[7px] text-indigo-400">{sleepCard?.pattern || 'Normal pattern'}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5 mb-3">
                <button onClick={() => { djRecordDream({ title: 'New Dream', content: 'A mysterious dream...', mood: 'Neutral', category: 'Adventure' }); toast({ title: 'Dream recorded!' }) }} className="flex-1 px-2 py-1.5 bg-indigo-900/40 hover:bg-indigo-800/50 text-indigo-200 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r59-action-btn">Record</button>
                <button onClick={() => { djPerformRealityCheck(); toast({ title: 'Reality checked!' }) }} className="flex-1 px-2 py-1.5 bg-purple-900/40 hover:bg-purple-800/50 text-purple-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r59-action-btn">Check</button>
                <button onClick={() => { const r = djGetDiscoveredRealms()[0]; if (r) { djExploreRealm(r.id); toast({ title: 'Exploring!' }) } }} className="flex-1 px-2 py-1.5 bg-violet-900/40 hover:bg-violet-800/50 text-violet-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r59-action-btn">Explore</button>
              </div>
              <div className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider mb-1.5">Achievements ({achievements.filter((a: any) => a.unlocked).length}/{achievements.length})</div>
              <div className="grid grid-cols-5 gap-1">
                {achievements.slice(0, 10).map((a: any, i: number) => (
                  <div key={a.id || i} className={`p-1 rounded-lg border text-center r59-achievement-item ${a.unlocked ? 'border-indigo-400 bg-indigo-900/20' : 'border-slate-700 bg-slate-800/20'}`}>
                    <div className="text-[7px] font-bold text-indigo-400">{a.name || `A${i + 1}`}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 59: Pixel Art Studio Panel */}
      {showPixelArtPanel && mounted && (() => {
        const stats = pxGetStatsGrid()
        const gallery = pxGetGallery()
        const tools = pxGetToolGrid()
        const palette = pxGetPaletteGrid()
        const daily = pxGetDailyCard()
        const templates = pxGetTemplates()
        const achievements = pxGetAchievements()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowPixelArtPanel(false)}>
            <div className="bg-fuchsia-950/95 border border-fuchsia-500/30 rounded-xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-fuchsia-200 flex items-center gap-1.5">🎨 Pixel Art Studio</h3>
                <button onClick={() => setShowPixelArtPanel(false)} className="text-fuchsia-400 hover:text-white text-xs">✕</button>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {stats.map((s: any, i: number) => (
                  <div key={i} className="p-2 bg-gradient-to-br from-fuchsia-900/30 to-pink-900/30 rounded-lg border border-fuchsia-500/20 r59-pixel-stat">
                    <div className="text-[9px] text-fuchsia-300">{s.label}</div>
                    <div className="text-xs font-bold text-fuchsia-200">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-fuchsia-300 font-semibold uppercase tracking-wider mb-1.5">Drawing Tools</div>
              <div className="grid grid-cols-4 gap-1 mb-3">
                {tools.slice(0, 8).map((t: any, i: number) => (
                  <div key={t.id || i} className={`p-1.5 rounded-lg border text-center cursor-pointer r59-tool-item ${t.active ? 'border-fuchsia-400 bg-fuchsia-900/40' : 'border-slate-700 bg-slate-800/20'}`} onClick={() => { pxSetTool(t.id); toast({ title: `${t.name} selected` }) }}>
                    <div className="text-[10px]">{t.icon || '✏️'}</div>
                    <div className="text-[6px] text-fuchsia-300">{t.name || 'Tool'}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-fuchsia-300 font-semibold uppercase tracking-wider mb-1.5">Color Palette</div>
              <div className="grid grid-cols-8 gap-1 mb-3">
                {palette.slice(0, 32).map((c: any, i: number) => (
                  <div key={c.id || i} className="w-5 h-5 rounded border border-fuchsia-500/20 cursor-pointer hover:scale-110 transition-transform r59-color-item" style={{ backgroundColor: c.color || c.hex || '#888' }} title={c.name || `Color ${i + 1}`} onClick={() => { pxSetActiveColor(c.color || c.hex); toast({ title: 'Color set!' }) }} />
                ))}
              </div>
              <div className="text-[10px] text-fuchsia-300 font-semibold uppercase tracking-wider mb-1.5">Gallery ({gallery.length})</div>
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {gallery.slice(0, 6).map((a: any, i: number) => (
                  <div key={a.id || i} className="p-2 bg-gradient-to-br from-fuchsia-900/20 to-pink-900/20 rounded-lg border border-fuchsia-500/10 r59-gallery-item">
                    <div className="text-[9px] font-bold text-fuchsia-200">{a.name || `Art ${i + 1}`}</div>
                    <div className="text-[7px] text-fuchsia-400/60">{a.size || '16×16'}</div>
                    <div className="flex gap-1 mt-0.5">
                      <span className="text-[6px] text-pink-400">♥ {a.likes || 0}</span>
                      {a.favorite && <span className="text-[6px] text-yellow-400">⭐</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-fuchsia-300 font-semibold uppercase tracking-wider mb-1.5">Templates ({templates.length})</div>
              <div className="grid grid-cols-5 gap-1 mb-3">
                {templates.slice(0, 10).map((t: any, i: number) => (
                  <div key={t.id || i} className="p-1.5 rounded-lg border border-fuchsia-500/15 bg-fuchsia-900/10 text-center r59-template-item">
                    <div className="text-[9px]">{t.icon || '🖼️'}</div>
                    <div className="text-[6px] text-fuchsia-300 truncate">{t.name || `T${i + 1}`}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 mb-3">
                <button onClick={() => { pxCreateCanvas(16); toast({ title: 'Canvas created!' }) }} className="flex-1 px-2 py-1.5 bg-fuchsia-900/40 hover:bg-fuchsia-800/50 text-fuchsia-200 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r59-action-btn">New Canvas</button>
                <button onClick={() => { pxSaveToGallery(); toast({ title: 'Saved!' }) }} className="flex-1 px-2 py-1.5 bg-pink-900/40 hover:bg-pink-800/50 text-pink-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r59-action-btn">Save</button>
                <button onClick={() => { pxCreateAnimation(); toast({ title: 'Animation created!' }) }} className="flex-1 px-2 py-1.5 bg-violet-900/40 hover:bg-violet-800/50 text-violet-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r59-action-btn">Animate</button>
              </div>
              <div className="text-[10px] text-fuchsia-300 font-semibold uppercase tracking-wider mb-1.5">Achievements ({achievements.filter((a: any) => a.unlocked).length}/{achievements.length})</div>
              <div className="grid grid-cols-5 gap-1">
                {achievements.slice(0, 10).map((a: any, i: number) => (
                  <div key={a.id || i} className={`p-1 rounded-lg border text-center r59-achievement-item ${a.unlocked ? 'border-fuchsia-400 bg-fuchsia-900/20' : 'border-slate-700 bg-slate-800/20'}`}>
                    <div className="text-[7px] font-bold text-fuchsia-400">{a.name || `A${i + 1}`}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}
      {/* Round 59: Island Builder Panel */}
      {showIslandBuilderPanel && mounted && (() => {
        const island = ibGetIsland()
        const stats = ibGetStatsGrid()
        const grid = ibGetGridOverview()
        const resources = ibGetResources()
        const daily = ibGetDailyCard()
        const visitors = ibGetActiveVisitors()
        const event = ibGetActiveEvent()
        const achievements = ibGetAchievements()
        const weather = ibGetWeather()
        const season = ibGetSeason()
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowIslandBuilderPanel(false)}>
            <div className="bg-emerald-950/95 border border-emerald-500/30 rounded-xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-emerald-200 flex items-center gap-1.5">🏝️ Island Builder</h3>
                <button onClick={() => setShowIslandBuilderPanel(false)} className="text-emerald-400 hover:text-white text-xs">✕</button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] text-emerald-400/70">{island?.name || 'My Island'}</span>
                <span className="text-[8px] text-slate-500">|</span>
                <span className="text-[8px] text-blue-300">{weather?.icon || '☀️'} {weather?.name || 'Sunny'}</span>
                <span className="text-[8px] text-green-300">{season?.icon || '🌸'} {season?.name || 'Spring'}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {stats.map((s: any, i: number) => (
                  <div key={i} className="p-2 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-lg border border-emerald-500/20 r59-island-stat">
                    <div className="text-[9px] text-emerald-300">{s.label}</div>
                    <div className="text-xs font-bold text-emerald-200">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider mb-1.5">Island Grid</div>
              <div className="grid grid-cols-8 gap-0.5 mb-3">
                {grid && grid.grid ? grid.grid.slice(0, 64).map((tile: any, i: number) => (
                  <div key={i} className="w-full aspect-square rounded-sm border border-emerald-600/10 flex items-center justify-center text-[7px] r59-tile-item" style={{ backgroundColor: tile.bgColor || '#1a3a2a' }} title={tile.building || tile.terrain || 'Empty'}>
                    {tile.icon || '·'}
                  </div>
                )) : Array.from({ length: 16 }, (_, i) => (
                  <div key={i} className="w-full aspect-square rounded-sm border border-emerald-600/10 bg-emerald-900/20 flex items-center justify-center text-[7px] text-emerald-600/40">·</div>
                ))}
              </div>
              <div className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider mb-1.5">Resources</div>
              <div className="grid grid-cols-4 gap-1 mb-3">
                {resources && Object.keys(resources).length > 0 ? Object.entries(resources).slice(0, 8).map(([key, val]: [string, any]) => (
                  <div key={key} className="p-1.5 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-lg border border-emerald-500/10 r59-resource-item">
                    <div className="text-[8px] text-emerald-400">{(val as any).icon || '📦'}</div>
                    <div className="text-[8px] font-bold text-emerald-200">{(val as any).amount || val || 0}</div>
                  </div>
                )) : Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="p-1.5 bg-emerald-900/20 rounded-lg border border-emerald-500/10 r59-resource-item">
                    <div className="text-[8px] text-emerald-400">📦</div>
                    <div className="text-[8px] font-bold text-emerald-200">0</div>
                  </div>
                ))}
              </div>
              {event && <div className="p-2 bg-gradient-to-br from-amber-900/30 to-yellow-900/30 rounded-lg border border-amber-500/20 mb-3 r59-event-card">
                <div className="text-[9px] font-bold text-amber-200">{event.icon || '⚡'} {event.name || 'Event'}</div>
                <div className="text-[7px] text-amber-300/70">{event.description || 'Something is happening...'}</div>
              </div>}
              <div className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider mb-1.5">Visitors ({visitors?.length || 0})</div>
              <div className="grid grid-cols-4 gap-1 mb-3">
                {(visitors || []).slice(0, 4).map((v: any, i: number) => (
                  <div key={v.id || i} className="p-1.5 rounded-lg border border-emerald-500/15 bg-emerald-900/10 text-center r59-visitor-item">
                    <div className="text-[8px]">{v.icon || '👤'}</div>
                    <div className="text-[6px] text-emerald-300">{v.name || `Visitor ${i + 1}`}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 mb-3">
                <button onClick={() => { ibTick(); toast({ title: 'Resources collected!' }) }} className="flex-1 px-2 py-1.5 bg-emerald-900/40 hover:bg-emerald-800/50 text-emerald-200 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r59-action-btn">Collect</button>
                <button onClick={() => { ibBuildStructure('lumber_mill', 0, 0); toast({ title: 'Building placed!' }) }} className="flex-1 px-2 py-1.5 bg-teal-900/40 hover:bg-teal-800/50 text-teal-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r59-action-btn">Build</button>
                <button onClick={() => { ibUpgradeBuilding(''); toast({ title: 'Upgraded!' }) }} className="flex-1 px-2 py-1.5 bg-lime-900/40 hover:bg-lime-800/50 text-lime-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r59-action-btn">Upgrade</button>
                <button onClick={() => { ibTradeResources('wood', 'stone', 10); toast({ title: 'Traded!' }) }} className="flex-1 px-2 py-1.5 bg-amber-900/40 hover:bg-amber-800/50 text-amber-300 text-[8px] font-semibold rounded-lg transition-all active:scale-95 r59-action-btn">Trade</button>
              </div>
              <div className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider mb-1.5">Achievements ({achievements.filter((a: any) => a.unlocked).length}/{achievements.length})</div>
              <div className="grid grid-cols-5 gap-1">
                {achievements.slice(0, 10).map((a: any, i: number) => (
                  <div key={a.id || i} className={`p-1 rounded-lg border text-center r59-achievement-item ${a.unlocked ? 'border-emerald-400 bg-emerald-900/20' : 'border-slate-700 bg-slate-800/20'}`}>
                    <div className="text-[7px] font-bold text-emerald-400">{a.name || `A${i + 1}`}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
