// World Map Explorer Wire — Interactive world map visualization for story mode
// chapters and levels. Standalone module with all state persisted via localStorage.
// Storage key: ws_world_map_explorer

// ─── Types ──────────────────────────────────────────────────────────────────

export type RegionId =
  | 'green_meadows'
  | 'crystal_caves'
  | 'storm_peaks'
  | 'shadow_forest'
  | 'ember_volcano'
  | 'sky_islands'
  | 'ocean_depths'
  | 'final_frontier'

export type NodeStatus = 'locked' | 'unlocked' | 'inProgress' | 'completed' | 'mastered'
export type EventType = 'double_xp' | 'bonus_coins' | 'special_word' | 'boss_rush' | 'time_trial'

export interface Region {
  id: RegionId
  name: string
  description: string
  theme: string
  bgGradient: string
  requiredLevel: number
  unlocked: boolean
}

export interface Chapter {
  id: string
  regionId: RegionId
  name: string
  description: string
  difficulty: string
  levels: string[]
  unlockCondition: string
}

export interface Level {
  id: string
  chapterId: string
  regionId: RegionId
  name: string
  description: string
  difficulty: number
  objective: string
  targetScore: number
  timeLimit: number
  rewards: { coins: number; xp: number; unlockItem: string | null }
  bestScore: number
  stars: number
  attempts: number
  completed: boolean
}

export interface ChapterProgress {
  completedLevels: number
  totalLevels: number
  stars: number
  bestScore: number
  completionPercent: number
}

export interface OverallProgress {
  completedLevels: number
  totalLevels: number
  totalStars: number
  maxStars: number
  completionPercent: number
  regionsExplored: number
}

export interface MapNode {
  id: string
  x: number
  y: number
  type: 'region' | 'chapter' | 'level'
  status: NodeStatus
  connections: string[]
}

export interface Connection {
  from: string
  to: string
  type: 'region' | 'chapter' | 'level'
  active: boolean
}

export interface MapBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

export interface ExplorationBonus {
  regionId: RegionId
  coins: number
  xp: number
  title: string
  description: string
  claimed: boolean
}

export interface WorldEvent {
  id: string
  name: string
  description: string
  regionId: RegionId | null
  type: EventType
  bonus: number
  startTime: number
  endTime: number
}

export interface RegionLore {
  regionId: RegionId
  title: string
  paragraphs: string[]
}

export interface ChapterLore {
  chapterId: string
  title: string
  narrative: string[]
}

export interface RecommendedPath {
  levelId: string
  reason: string
  priority: number
}

export interface CompletionEstimate {
  levelsRemaining: number
  estimatedMinutes: number
  paceLabel: string
}

export interface RegionCard {
  region: Region
  chapterCount: number
  completedLevels: number
  totalLevels: number
  progressPercent: number
  totalStars: number
  unlocked: boolean
}

export interface WorldMapOverview {
  regions: Region[]
  currentRegion: Region | null
  overallProgress: OverallProgress
  activeEvents: WorldEvent[]
  explorationStreak: number
  recommendedLevel: RecommendedPath | null
}

export interface ProgressSummary {
  totalLevelsCompleted: number
  totalStarsEarned: number
  regionsUnlocked: number
  regionsCompleted: number
  loreDiscovered: number
  loreTotal: number
  hiddenPathsFound: number
  playtimeEstimate: string
}

export interface WorldMapStats {
  completionPercent: number
  totalPlaytime: number
  regionsExplored: number
  regionsTotal: number
  chaptersCompleted: number
  chaptersTotal: number
  levelsMastered: number
  currentStreak: number
  bestStreak: number
}

export interface LevelDifficultyInfo {
  label: string
  color: string
  number: number
}

// ─── Storage Helpers ────────────────────────────────────────────────────────

const STORAGE_KEY = 'ws_world_map_explorer'

interface LevelAttempt {
  score: number
  stars: number
  completed: boolean
  attempts: number
  timestamp: number
}

interface EventProgress {
  eventId: string
  progress: number
  goal: number
  claimed: boolean
}

interface PersistedData {
  unlockedRegions: RegionId[]
  currentRegion: RegionId
  levelAttempts: Record<string, LevelAttempt>
  unlockedLore: string[]
  hiddenPaths: string[]
  mapScroll: { x: number; y: number }
  zoomLevel: number
  eventProgress: Record<string, EventProgress>
  explorationBonusesClaimed: string[]
}

function getDefaultData(): PersistedData {
  return {
    unlockedRegions: ['green_meadows'],
    currentRegion: 'green_meadows',
    levelAttempts: {},
    unlockedLore: ['lore_green_meadows'],
    hiddenPaths: [],
    mapScroll: { x: 0, y: 0 },
    zoomLevel: 1.0,
    eventProgress: {},
    explorationBonusesClaimed: [],
  }
}

function safeGet(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch {
    /* quota or private browsing */
  }
}

function loadData(): PersistedData {
  const raw = safeGet(STORAGE_KEY)
  if (!raw) return getDefaultData()
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedData>
    const defaults = getDefaultData()
    return {
      unlockedRegions: Array.isArray(parsed.unlockedRegions)
        ? parsed.unlockedRegions
        : defaults.unlockedRegions,
      currentRegion: parsed.currentRegion ?? defaults.currentRegion,
      levelAttempts: parsed.levelAttempts ?? {},
      unlockedLore: Array.isArray(parsed.unlockedLore)
        ? parsed.unlockedLore
        : defaults.unlockedLore,
      hiddenPaths: Array.isArray(parsed.hiddenPaths)
        ? parsed.hiddenPaths
        : defaults.hiddenPaths,
      mapScroll: parsed.mapScroll ?? defaults.mapScroll,
      zoomLevel: parsed.zoomLevel ?? defaults.zoomLevel,
      eventProgress: parsed.eventProgress ?? {},
      explorationBonusesClaimed: Array.isArray(parsed.explorationBonusesClaimed)
        ? parsed.explorationBonusesClaimed
        : defaults.explorationBonusesClaimed,
    }
  } catch {
    return getDefaultData()
  }
}

function persistData(data: PersistedData): void {
  safeSet(STORAGE_KEY, JSON.stringify(data))
}

// ─── Static Data ────────────────────────────────────────────────────────────

const REGIONS: Omit<Region, 'unlocked'>[] = [
  {
    id: 'green_meadows',
    name: 'Green Meadows',
    description: 'A peaceful starting land where words grow like flowers in gentle fields.',
    theme: 'nature',
    bgGradient: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)',
    requiredLevel: 0,
  },
  {
    id: 'crystal_caves',
    name: 'Crystal Caves',
    description: 'Underground caverns shimmering with crystalline word formations.',
    theme: 'crystal',
    bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    requiredLevel: 5,
  },
  {
    id: 'storm_peaks',
    name: 'Storm Peaks',
    description: 'Lightning-struck mountaintops where only the bravest word snakes dare to climb.',
    theme: 'storm',
    bgGradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
    requiredLevel: 12,
  },
  {
    id: 'shadow_forest',
    name: 'Shadow Forest',
    description: 'A mysterious dark woodland where words whisper from the ancient trees.',
    theme: 'dark',
    bgGradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    requiredLevel: 20,
  },
  {
    id: 'ember_volcano',
    name: 'Ember Volcano',
    description: 'A fiery volcanic landscape where words are forged in molten lava.',
    theme: 'fire',
    bgGradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
    requiredLevel: 30,
  },
  {
    id: 'sky_islands',
    name: 'Sky Islands',
    description: 'Floating islands above the clouds, home to the most eloquent words.',
    theme: 'sky',
    bgGradient: 'linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)',
    requiredLevel: 40,
  },
  {
    id: 'ocean_depths',
    name: 'Ocean Depths',
    description: 'The deepest seas where forgotten words lie buried in ancient ruins.',
    theme: 'ocean',
    bgGradient: 'linear-gradient(135deg, #1a2980 0%, #26d0ce 100%)',
    requiredLevel: 52,
  },
  {
    id: 'final_frontier',
    name: 'Final Frontier',
    description: 'The ultimate challenge — a realm where the word snake must prove its mastery.',
    theme: 'cosmic',
    bgGradient: 'linear-gradient(135deg, #0c0c1d 0%, #4a00e0 50%, #8e2de2 100%)',
    requiredLevel: 65,
  },
]

interface ChapterDef {
  id: string
  regionId: RegionId
  name: string
  description: string
  difficulty: string
  levelCount: number
  unlockCondition: string
}

const CHAPTERS: ChapterDef[] = [
  // Green Meadows
  { id: 'gm_ch1', regionId: 'green_meadows', name: 'First Steps', description: 'Learn the basics of word catching.', difficulty: 'Beginner', levelCount: 3, unlockCondition: 'none' },
  { id: 'gm_ch2', regionId: 'green_meadows', name: 'Garden Path', description: 'Navigate through the flower garden of words.', difficulty: 'Beginner', levelCount: 3, unlockCondition: 'complete gm_ch1' },
  { id: 'gm_ch3', regionId: 'green_meadows', name: 'Meadow Dash', description: 'Race across the meadows collecting words.', difficulty: 'Easy', levelCount: 4, unlockCondition: 'complete gm_ch2' },
  { id: 'gm_ch4', regionId: 'green_meadows', name: 'Green Guardian', description: 'Face the guardian of the meadows.', difficulty: 'Easy', levelCount: 3, unlockCondition: 'complete gm_ch3' },
  // Crystal Caves
  { id: 'cc_ch1', regionId: 'crystal_caves', name: 'Cave Entrance', description: 'Enter the shimmering crystal caves.', difficulty: 'Easy', levelCount: 3, unlockCondition: 'none' },
  { id: 'cc_ch2', regionId: 'crystal_caves', name: 'Gem Gallery', description: 'Collect precious word gems.', difficulty: 'Medium', levelCount: 4, unlockCondition: 'complete cc_ch1' },
  { id: 'cc_ch3', regionId: 'crystal_caves', name: 'Crystal Maze', description: 'Navigate through crystal corridors.', difficulty: 'Medium', levelCount: 3, unlockCondition: 'complete cc_ch2' },
  // Storm Peaks
  { id: 'sp_ch1', regionId: 'storm_peaks', name: 'Base Camp', description: 'Establish your mountain base.', difficulty: 'Medium', levelCount: 3, unlockCondition: 'none' },
  { id: 'sp_ch2', regionId: 'storm_peaks', name: 'Lightning Ridge', description: 'Brave the electric storms.', difficulty: 'Hard', levelCount: 4, unlockCondition: 'complete sp_ch1' },
  { id: 'sp_ch3', regionId: 'storm_peaks', name: 'Summit Climb', description: 'Scale the treacherous peaks.', difficulty: 'Hard', levelCount: 3, unlockCondition: 'complete sp_ch2' },
  // Shadow Forest
  { id: 'sf_ch1', regionId: 'shadow_forest', name: 'Forest Edge', description: 'Enter the mysterious shadow forest.', difficulty: 'Hard', levelCount: 3, unlockCondition: 'none' },
  { id: 'sf_ch2', regionId: 'shadow_forest', name: 'Dark Thicket', description: 'Navigate through dense darkness.', difficulty: 'Hard', levelCount: 4, unlockCondition: 'complete sf_ch1' },
  { id: 'sf_ch3', regionId: 'shadow_forest', name: 'Ancient Grove', description: 'Discover the secrets of ancient trees.', difficulty: 'Expert', levelCount: 3, unlockCondition: 'complete sf_ch2' },
  { id: 'sf_ch4', regionId: 'shadow_forest', name: 'Shadow King', description: 'Confront the ruler of darkness.', difficulty: 'Expert', levelCount: 3, unlockCondition: 'complete sf_ch3' },
  // Ember Volcano
  { id: 'ev_ch1', regionId: 'ember_volcano', name: 'Lava Fields', description: 'Cross the flowing rivers of lava.', difficulty: 'Expert', levelCount: 3, unlockCondition: 'none' },
  { id: 'ev_ch2', regionId: 'ember_volcano', name: 'Magma Core', description: 'Descend into the volcanic core.', difficulty: 'Expert', levelCount: 4, unlockCondition: 'complete ev_ch1' },
  { id: 'ev_ch3', regionId: 'ember_volcano', name: 'Dragon Forge', description: 'Face the dragon in its forge.', difficulty: 'Master', levelCount: 3, unlockCondition: 'complete ev_ch2' },
  // Sky Islands
  { id: 'si_ch1', regionId: 'sky_islands', name: 'Cloud Bridge', description: 'Walk among the clouds.', difficulty: 'Expert', levelCount: 3, unlockCondition: 'none' },
  { id: 'si_ch2', regionId: 'sky_islands', name: 'Wind Temple', description: 'Channel the power of winds.', difficulty: 'Master', levelCount: 4, unlockCondition: 'complete si_ch1' },
  { id: 'si_ch3', regionId: 'sky_islands', name: 'Sky Citadel', description: 'Storm the citadel in the sky.', difficulty: 'Master', levelCount: 3, unlockCondition: 'complete si_ch2' },
  // Ocean Depths
  { id: 'od_ch1', regionId: 'ocean_depths', name: 'Coral Reef', description: 'Dive into the colorful coral reef.', difficulty: 'Master', levelCount: 3, unlockCondition: 'none' },
  { id: 'od_ch2', regionId: 'ocean_depths', name: 'Abyssal Trench', description: 'Explore the deepest trenches.', difficulty: 'Master', levelCount: 4, unlockCondition: 'complete od_ch1' },
  { id: 'od_ch3', regionId: 'ocean_depths', name: 'Leviathan Lair', description: 'Face the ancient sea leviathan.', difficulty: 'Master', levelCount: 3, unlockCondition: 'complete od_ch2' },
  // Final Frontier
  { id: 'ff_ch1', regionId: 'final_frontier', name: 'Star Gate', description: 'Pass through the cosmic gateway.', difficulty: 'Master', levelCount: 4, unlockCondition: 'none' },
  { id: 'ff_ch2', regionId: 'final_frontier', name: 'Nebula Run', description: 'Race through the nebula.', difficulty: 'Master', levelCount: 4, unlockCondition: 'complete ff_ch1' },
  { id: 'ff_ch3', regionId: 'final_frontier', name: 'Word Nexus', description: 'The final confrontation with word chaos.', difficulty: 'Master', levelCount: 4, unlockCondition: 'complete ff_ch2' },
]

const REGION_LORE: Omit<RegionLore, 'regionId'>[] = [
  { title: 'The Awakening', paragraphs: ['In a world where words hold magical power, a tiny snake discovered it could devour letters and grow wiser.', 'The Green Meadows, bathed in eternal sunshine, were the perfect place to begin this extraordinary journey.'] },
  { title: 'Echoes Below', paragraphs: ['Deep beneath the surface, crystalline formations hum with ancient vocabulary.', 'The Crystal Caves were formed millennia ago when the first words were spoken into the earth.'] },
  { title: 'The Tempest Awaits', paragraphs: ['Storm Peaks crackle with electric energy — here words are forged in lightning strikes.', 'Only those who have mastered the gentle arts dare to climb these jagged summits.'] },
  { title: 'Whispers in the Dark', paragraphs: ['The Shadow Forest holds secrets older than language itself.', 'Tread carefully — some words here have been waiting centuries to be spoken again.'] },
  { title: 'Trial by Fire', paragraphs: ['Volcanic rivers carve paths through the Ember Volcano, each lava flow spelling forgotten words.', 'The dragon that guards these depths demands linguistic perfection.'] },
  { title: 'Above the World', paragraphs: ['The Sky Islands float on cushions of compressed poetry.', 'Here the air is thin but the words are weightier than anywhere else in the world.'] },
  { title: 'The Sunken Library', paragraphs: ['Long ago, the greatest library in existence sank beneath the waves.', 'Its words still glow in the deep, guarded by creatures of ancient vocabulary.'] },
  { title: 'The End of Words', paragraphs: ['The Final Frontier is where all words converge — the nexus of language itself.', 'Only the most dedicated word snake can unravel the mystery of the Word Nexus.'] },
]

const CHAPTER_LORE: Record<string, Omit<ChapterLore, 'chapterId'>> = {
  gm_ch1: { title: 'A New Beginning', narrative: ['You open your eyes for the first time. Letters float gently around you like seeds on the wind.', '"Eat the words," whispers a gentle breeze. "Grow stronger with every letter."'] },
  gm_ch2: { title: 'The Garden of Letters', narrative: ['The meadow opens into a vast garden where flowers bloom in the shapes of words.', 'Each petal is a letter — pluck them in the right order to form something beautiful.'] },
  gm_ch3: { title: 'The Great Meadow Run', narrative: ['Words scatter across the field like startled rabbits. Can you catch them all?', 'The meadow stretches endlessly, but your snake grows longer with every word consumed.'] },
  gm_ch4: { title: 'Guardian of the Green', narrative: ['A great serpent blocks your path, its scales spelling out ancient riddles.', '"To pass, you must speak the words I have guarded for a thousand years."'] },
  cc_ch1: { title: 'Descent Into Crystal', narrative: ['The cave mouth opens like a word being spoken — wide and resonant.', 'Crystal formations spell out welcome in a hundred languages.'] },
  cc_ch2: { title: 'The Gem Collector', narrative: ['Each gem in this cavern contains a frozen word, waiting to be thawed by your serpent tongue.', 'Collect them all and the cave will reveal its deepest secrets.'] },
  cc_ch3: { title: 'Mirror Maze', narrative: ['Crystal walls reflect your serpent form, but the reflections speak different words.', 'Find the true path through the maze of mirrored meanings.'] },
  sp_ch1: { title: 'Camp Under Storms', narrative: ['Lightning illuminates the camp in stroboscopic bursts, each flash revealing a new word.', 'Set up your base — the climb will be treacherous.'] },
  sp_ch2: { title: 'Electric Vocabulary', narrative: ['Words crackle and spark along the ridge, charged with electric energy.', 'Catch the electrified words before they ground themselves into the rock.'] },
  sp_ch3: { title: 'The Final Ascent', narrative: ['The peak is shrouded in perpetual storm. Only the strongest words can cut through.', 'With each step upward, the air grows thinner and the words grow more powerful.'] },
  sf_ch1: { title: 'Edge of Shadow', narrative: ['The trees here grow so thick that sunlight barely penetrates. Words glow faintly in the dark.', 'Step carefully — some shadows have teeth.'] },
  sf_ch2: { title: 'Words in the Dark', narrative: ['In absolute darkness, you must navigate by sound alone. Words whisper from all directions.', 'Trust your instincts, little snake.'] },
  sf_ch3: { title: 'The Ancient Trees', narrative: ['Trees older than civilization stand sentinel here. Their bark is covered in runic words.', 'Read them correctly and the forest will open its heart to you.'] },
  sf_ch4: { title: 'The Shadow King', narrative: ['"You dare enter MY forest?" The voice echoes from every direction at once.', 'The Shadow King materializes from pure darkness, his form composed of forgotten words.'] },
  ev_ch1: { title: 'River of Fire', narrative: ['Molten rock flows between word-shaped banks, spelling warnings in ancient tongues.', 'Cross quickly — the lava does not wait for slow readers.'] },
  ev_ch2: { title: 'Heart of the Volcano', narrative: ['At the core, the heat is unbearable. Words here are forged in pure fire.', 'Only the most resilient serpent can survive this deep.'] },
  ev_ch3: { title: 'The Dragon Speaks', narrative: ['"So you have come," rumbles the Dragon, each syllable causing the mountain to tremble.', 'Its challenge is simple: spell the unspellable.'] },
  si_ch1: { title: 'Walking on Clouds', narrative: ['The clouds are solid beneath your scales, each one shaped like a different letter.', 'Above you, the sky is an endless page waiting to be filled.'] },
  si_ch2: { title: 'Temple of the Four Winds', narrative: ['Four winds blow from cardinal directions, each carrying words from a different era.', 'Catch words from all four to unlock the temple gates.'] },
  si_ch3: { title: 'Siege of the Citadel', narrative: ['The Sky Citadel stands impossibly tall, its walls inscribed with every word ever spoken.', 'Break through its defenses with the power of your vocabulary.'] },
  od_ch1: { title: 'Into the Deep Blue', narrative: ['The ocean embraces you like a library of liquid knowledge.', 'Bioluminescent words drift past like deep-sea jellyfish.'] },
  od_ch2: { title: 'The Bottomless Trench', narrative: ['The pressure increases with every fathom. Words compress into denser, more powerful forms.', 'At the bottom, something ancient stirs.'] },
  od_ch3: { title: 'Wake of the Leviathan', narrative: ['The Leviathan has slept for eons, dreaming in forgotten languages.', 'Your arrival has awakened it. Prepare for the vocabulary battle of the ages.'] },
  ff_ch1: { title: 'Beyond the Stars', narrative: ['The Star Gate pulses with the accumulated energy of every word ever spoken.', 'Step through and leave the mortal realm of language behind.'] },
  ff_ch2: { title: 'Riding the Nebula', narrative: ['Colors beyond description swirl around you. Words here exist in dimensions you cannot perceive.', 'Hold on tight — the cosmic currents are unpredictable.'] },
  ff_ch3: { title: 'The Word Nexus', narrative: ['At the center of everything, all words converge into a single point of infinite meaning.', 'This is where your journey ends — or begins anew.'] },
}

const WORLD_EVENTS: WorldEvent[] = [
  { id: 'evt_double_xp_weekend', name: 'Double XP Weekend', description: 'All levels earn double XP this weekend!', regionId: null, type: 'double_xp', bonus: 2, startTime: 0, endTime: 0 },
  { id: 'evt_crystal_bonanza', name: 'Crystal Bonanza', description: 'Extra rewards in Crystal Caves.', regionId: 'crystal_caves', type: 'bonus_coins', bonus: 1.5, startTime: 0, endTime: 0 },
  { id: 'evt_storm_challenge', name: 'Storm Challenge', description: 'Complete Storm Peaks levels for bonus stars.', regionId: 'storm_peaks', type: 'boss_rush', bonus: 3, startTime: 0, endTime: 0 },
]

const HIDDEN_PATHS = [
  { id: 'hidden_ancient_ruins', name: 'Ancient Ruins', requiredRegion: 'shadow_forest', requiredStars: 15, levels: 3 },
  { id: 'hidden_dragon_treasure', name: 'Dragon Treasure', requiredRegion: 'ember_volcano', requiredStars: 25, levels: 2 },
  { id: 'hidden_star_library', name: 'Star Library', requiredRegion: 'final_frontier', requiredStars: 40, levels: 4 },
]

// ─── Level ID Generation ────────────────────────────────────────────────────

function buildLevelId(chapterId: string, index: number): string {
  return `${chapterId}_lv${index + 1}`
}

function generateLevelIds(chapterId: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => buildLevelId(chapterId, i))
}

function getDifficultyForChapter(chapterId: string): number {
  const regionOrder: RegionId[] = [
    'green_meadows', 'crystal_caves', 'storm_peaks', 'shadow_forest',
    'ember_volcano', 'sky_islands', 'ocean_depths', 'final_frontier',
  ]
  const chapter = CHAPTERS.find((c) => c.id === chapterId)
  if (!chapter) return 1
  const regionIdx = regionOrder.indexOf(chapter.regionId)
  const chaptersInRegion = CHAPTERS.filter((c) => c.regionId === chapter.regionId)
  const chapterIdx = chaptersInRegion.findIndex((c) => c.id === chapterId)
  return regionIdx * 4 + chapterIdx + 1
}

function buildLevel(chapterId: string, index: number): Level {
  const chapter = CHAPTERS.find((c) => c.id === chapterId)
  const id = buildLevelId(chapterId, index)
  const diff = getDifficultyForChapter(chapterId)
  const data = loadData()
  const attempt = data.levelAttempts[id]

  return {
    id,
    chapterId,
    regionId: chapter?.regionId ?? 'green_meadows',
    name: `Level ${index + 1}`,
    description: chapter?.description ?? 'Complete this level to progress.',
    difficulty: diff,
    objective: 'Collect target words to complete the level.',
    targetScore: 100 + diff * 50 + index * 25,
    timeLimit: 60 + (10 - Math.min(diff, 8)) * 10,
    rewards: {
      coins: 50 + diff * 20 + index * 10,
      xp: 30 + diff * 15 + index * 5,
      unlockItem: index === 0 && chapter ? `skin_${chapter.regionId}` : null,
    },
    bestScore: attempt?.score ?? 0,
    stars: attempt?.stars ?? 0,
    attempts: attempt?.attempts ?? 0,
    completed: attempt?.completed ?? false,
  }
}

// ─── 1. World Map Data ───────────────────────────────────────────────────────

export function getWorldMap(): { regions: Region[]; chapters: Chapter[]; connections: Connection[] } {
  try {
    const data = loadData()
    const regions = getRegions()
    const chapters = CHAPTERS.map((ch) => ({
      ...ch,
      levels: generateLevelIds(ch.id, ch.levelCount),
    }))
    const connections = buildConnections()
    return { regions, chapters, connections }
  } catch {
    return { regions: [], chapters: [], connections: [] }
  }
}

export function getRegions(): Region[] {
  try {
    const data = loadData()
    return REGIONS.map((r) => ({
      ...r,
      unlocked: data.unlockedRegions.includes(r.id),
    }))
  } catch {
    return REGIONS.map((r) => ({ ...r, unlocked: r.id === 'green_meadows' }))
  }
}

export function getRegion(id: RegionId): Region | null {
  try {
    const data = loadData()
    const base = REGIONS.find((r) => r.id === id)
    if (!base) return null
    return { ...base, unlocked: data.unlockedRegions.includes(id) }
  } catch {
    return null
  }
}

export function isRegionUnlocked(regionId: RegionId): boolean {
  try {
    const data = loadData()
    return data.unlockedRegions.includes(regionId)
  } catch {
    return false
  }
}

export function unlockRegion(regionId: RegionId): boolean {
  try {
    const data = loadData()
    if (data.unlockedRegions.includes(regionId)) return false
    data.unlockedRegions.push(regionId)
    const loreKey = `lore_${regionId}`
    if (!data.unlockedLore.includes(loreKey)) {
      data.unlockedLore.push(loreKey)
    }
    persistData(data)
    return true
  } catch {
    return false
  }
}

// ─── 2. Chapter Navigation ───────────────────────────────────────────────────

export function getChapters(regionId: RegionId): Chapter[] {
  try {
    return CHAPTERS.filter((ch) => ch.regionId === regionId).map((ch) => ({
      ...ch,
      levels: generateLevelIds(ch.id, ch.levelCount),
    }))
  } catch {
    return []
  }
}

export function getChapter(id: string): Chapter | null {
  try {
    const ch = CHAPTERS.find((c) => c.id === id)
    if (!ch) return null
    return { ...ch, levels: generateLevelIds(ch.id, ch.levelCount) }
  } catch {
    return null
  }
}

export function getChapterProgress(chapterId: string): ChapterProgress {
  try {
    const data = loadData()
    const chapter = CHAPTERS.find((c) => c.id === chapterId)
    if (!chapter) return { completedLevels: 0, totalLevels: 0, stars: 0, bestScore: 0, completionPercent: 0 }

    const levelIds = generateLevelIds(chapterId, chapter.levelCount)
    let completedLevels = 0
    let stars = 0
    let bestScore = 0

    for (const lid of levelIds) {
      const attempt = data.levelAttempts[lid]
      if (attempt) {
        if (attempt.completed) completedLevels++
        stars += attempt.stars
        bestScore = Math.max(bestScore, attempt.score)
      }
    }

    const completionPercent = levelIds.length > 0
      ? Math.round((completedLevels / levelIds.length) * 10000) / 100
      : 0

    return { completedLevels, totalLevels: levelIds.length, stars, bestScore, completionPercent }
  } catch {
    return { completedLevels: 0, totalLevels: 0, stars: 0, bestScore: 0, completionPercent: 0 }
  }
}

export function isChapterUnlocked(chapterId: string): boolean {
  try {
    const chapter = CHAPTERS.find((c) => c.id === chapterId)
    if (!chapter) return false

    const data = loadData()
    if (!data.unlockedRegions.includes(chapter.regionId)) return false

    if (chapter.unlockCondition === 'none') return true

    // Parse "complete <chapterId>" condition
    const match = chapter.unlockCondition.match(/^complete (.+)$/)
    if (!match) return true

    const prereqChapterId = match[1]
    const prereq = CHAPTERS.find((c) => c.id === prereqChapterId)
    if (!prereq) return true

    const prereqLevels = generateLevelIds(prereqChapterId, prereq.levelCount)
    return prereqLevels.every((lid) => data.levelAttempts[lid]?.completed === true)
  } catch {
    return false
  }
}

export function getChapterStarRating(chapterId: string): number {
  try {
    return getChapterProgress(chapterId).stars
  } catch {
    return 0
  }
}

// ─── 3. Level Detail View ───────────────────────────────────────────────────

export function getLevel(id: string): Level | null {
  try {
    // Parse level ID: {chapterId}_lv{N}
    const match = id.match(/^(.+)_lv(\d+)$/)
    if (!match) return null
    const chapterId = match[1]
    const index = parseInt(match[2], 10) - 1
    return buildLevel(chapterId, index)
  } catch {
    return null
  }
}

export function getLevelReward(id: string): { coins: number; xp: number; unlockItem: string | null } {
  try {
    const level = getLevel(id)
    if (!level) return { coins: 0, xp: 0, unlockItem: null }
    return { ...level.rewards }
  } catch {
    return { coins: 0, xp: 0, unlockItem: null }
  }
}

export function getLevelDifficulty(levelId: string): LevelDifficultyInfo {
  try {
    const level = getLevel(levelId)
    const num = level?.difficulty ?? 1
    if (num <= 2) return { label: 'Beginner', color: '#4CAF50', number: num }
    if (num <= 4) return { label: 'Easy', color: '#8BC34A', number: num }
    if (num <= 8) return { label: 'Medium', color: '#FFC107', number: num }
    if (num <= 12) return { label: 'Hard', color: '#FF9800', number: num }
    if (num <= 20) return { label: 'Expert', color: '#F44336', number: num }
    return { label: 'Master', color: '#9C27B0', number: num }
  } catch {
    return { label: 'Unknown', color: '#9E9E9E', number: 0 }
  }
}

export function getLevelStatus(levelId: string): NodeStatus {
  try {
    const level = getLevel(levelId)
    if (!level) return 'locked'

    const chapterId = level.chapterId
    if (!isChapterUnlocked(chapterId)) return 'locked'

    if (level.completed && level.stars >= 3) return 'mastered'
    if (level.completed) return 'completed'
    if (level.attempts > 0) return 'inProgress'
    return 'unlocked'
  } catch {
    return 'locked'
  }
}

export function recordLevelAttempt(levelId: string, score: number, stars: number): boolean {
  try {
    const data = loadData()
    const prev = data.levelAttempts[levelId]
    const completed = stars > 0

    data.levelAttempts[levelId] = {
      score: Math.max(score, prev?.score ?? 0),
      stars: Math.max(stars, prev?.stars ?? 0),
      completed: completed || prev?.completed === true,
      attempts: (prev?.attempts ?? 0) + 1,
      timestamp: Date.now(),
    }

    persistData(data)
    return true
  } catch {
    return false
  }
}

// ─── 4. Progress Tracking ───────────────────────────────────────────────────

export function getOverallProgress(): OverallProgress {
  try {
    const data = loadData()
    let completedLevels = 0
    let totalLevels = 0
    let totalStars = 0
    let regionsExplored = 0

    for (const chapter of CHAPTERS) {
      if (!data.unlockedRegions.includes(chapter.regionId)) continue
      const levelIds = generateLevelIds(chapter.id, chapter.levelCount)
      totalLevels += levelIds.length
      for (const lid of levelIds) {
        const attempt = data.levelAttempts[lid]
        if (attempt?.completed) completedLevels++
        totalStars += attempt?.stars ?? 0
      }
    }

    const maxStars = totalLevels * 3
    const completionPercent = totalLevels > 0
      ? Math.round((completedLevels / totalLevels) * 10000) / 100
      : 0

    for (const regionId of data.unlockedRegions) {
      if (hasExploredFully(regionId)) regionsExplored++
    }

    return { completedLevels, totalLevels, totalStars, maxStars, completionPercent, regionsExplored }
  } catch {
    return { completedLevels: 0, totalLevels: 0, totalStars: 0, maxStars: 0, completionPercent: 0, regionsExplored: 0 }
  }
}

export function getRegionProgress(regionId: RegionId): { completed: number; total: number; percent: number; stars: number } {
  try {
    const data = loadData()
    const chapters = CHAPTERS.filter((ch) => ch.regionId === regionId)
    let completed = 0
    let total = 0
    let stars = 0

    for (const ch of chapters) {
      const levelIds = generateLevelIds(ch.id, ch.levelCount)
      total += levelIds.length
      for (const lid of levelIds) {
        const attempt = data.levelAttempts[lid]
        if (attempt?.completed) completed++
        stars += attempt?.stars ?? 0
      }
    }

    return {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 10000) / 100 : 0,
      stars,
    }
  } catch {
    return { completed: 0, total: 0, percent: 0, stars: 0 }
  }
}

export function getCurrentRegion(): Region | null {
  try {
    const data = loadData()
    return getRegion(data.currentRegion)
  } catch {
    return null
  }
}

export function setCurrentRegion(regionId: RegionId): boolean {
  try {
    const data = loadData()
    if (!data.unlockedRegions.includes(regionId)) return false
    data.currentRegion = regionId
    persistData(data)
    return true
  } catch {
    return false
  }
}

export function getCompletionEstimate(): CompletionEstimate {
  try {
    const progress = getOverallProgress()
    const remaining = progress.totalLevels - progress.completedLevels
    if (remaining === 0) return { levelsRemaining: 0, estimatedMinutes: 0, paceLabel: 'All complete!' }

    const data = loadData()
    const completedAttempts = Object.values(data.levelAttempts).filter((a) => a.completed)
    if (completedAttempts.length === 0) {
      return { levelsRemaining: remaining, estimatedMinutes: remaining * 5, paceLabel: 'New adventurer' }
    }

    const avgAttempts = completedAttempts.reduce((s, a) => s + a.attempts, 0) / completedAttempts.length
    const estimatedMinutes = Math.round(remaining * avgAttempts * 3)

    let paceLabel = 'Steady explorer'
    if (avgAttempts < 1.5) paceLabel = 'Speed runner!'
    else if (avgAttempts < 2.5) paceLabel = 'Skilled adventurer'
    else if (avgAttempts > 4) paceLabel = 'Persistent learner'

    return { levelsRemaining: remaining, estimatedMinutes, paceLabel }
  } catch {
    return { levelsRemaining: 0, estimatedMinutes: 0, paceLabel: 'Unknown' }
  }
}

// ─── 5. Map Visual Data ─────────────────────────────────────────────────────

export function getMapNodes(): MapNode[] {
  try {
    const data = loadData()
    const nodes: MapNode[] = []
    const regionOrder: RegionId[] = [
      'green_meadows', 'crystal_caves', 'storm_peaks', 'shadow_forest',
      'ember_volcano', 'sky_islands', 'ocean_depths', 'final_frontier',
    ]

    for (let ri = 0; ri < regionOrder.length; ri++) {
      const regionId = regionOrder[ri]
      const unlocked = data.unlockedRegions.includes(regionId)
      const regionProgress = unlocked ? getRegionProgress(regionId) : null

      const rx = 100 + (ri % 4) * 250
      const ry = 100 + Math.floor(ri / 4) * 300

      let regionStatus: NodeStatus = 'locked'
      if (unlocked) {
        if (regionProgress && regionProgress.completed === regionProgress.total) {
          regionStatus = 'completed'
        } else if (regionProgress && regionProgress.completed > 0) {
          regionStatus = 'inProgress'
        } else {
          regionStatus = 'unlocked'
        }
      }

      const regionConnections: string[] = []
      if (ri > 0) regionConnections.push(`region_${regionOrder[ri - 1]}`)
      if (ri < regionOrder.length - 1) regionConnections.push(`region_${regionOrder[ri + 1]}`)

      nodes.push({
        id: `region_${regionId}`,
        x: rx,
        y: ry,
        type: 'region',
        status: regionStatus,
        connections: regionConnections,
      })

      if (!unlocked) continue

      const chapters = CHAPTERS.filter((ch) => ch.regionId === regionId)
      for (let ci = 0; ci < chapters.length; ci++) {
        const ch = chapters[ci]
        const cx = rx - 60 + ci * 60
        const cy = ry + 80
        const chStatus: NodeStatus = isChapterUnlocked(ch.id)
          ? (getChapterProgress(ch.id).completionPercent === 100 ? 'completed' : 'inProgress')
          : 'locked'

        nodes.push({
          id: `chapter_${ch.id}`,
          x: cx,
          y: cy,
          type: 'chapter',
          status: chStatus,
          connections: [`region_${regionId}`],
        })

        if (!isChapterUnlocked(ch.id)) continue

        const levelIds = generateLevelIds(ch.id, ch.levelCount)
        for (let li = 0; li < levelIds.length; li++) {
          const lid = levelIds[li]
          const lx = cx - 15 + li * 15
          const ly = cy + 40
          nodes.push({
            id: lid,
            x: lx,
            y: ly,
            type: 'level',
            status: getLevelStatus(lid),
            connections: [`chapter_${ch.id}`],
          })
        }
      }
    }

    return nodes
  } catch {
    return []
  }
}

function buildConnections(): Connection[] {
  try {
    const data = loadData()
    const connections: Connection[] = []
    const regionOrder: RegionId[] = [
      'green_meadows', 'crystal_caves', 'storm_peaks', 'shadow_forest',
      'ember_volcano', 'sky_islands', 'ocean_depths', 'final_frontier',
    ]

    for (let i = 0; i < regionOrder.length - 1; i++) {
      const fromUnlocked = data.unlockedRegions.includes(regionOrder[i])
      const toUnlocked = data.unlockedRegions.includes(regionOrder[i + 1])
      connections.push({
        from: `region_${regionOrder[i]}`,
        to: `region_${regionOrder[i + 1]}`,
        type: 'region',
        active: fromUnlocked && toUnlocked,
      })
    }

    for (const chapter of CHAPTERS) {
      if (!data.unlockedRegions.includes(chapter.regionId)) continue
      connections.push({
        from: `region_${chapter.regionId}`,
        to: `chapter_${chapter.id}`,
        type: 'chapter',
        active: true,
      })

      if (isChapterUnlocked(chapter.id)) {
        const levelIds = generateLevelIds(chapter.id, chapter.levelCount)
        for (const lid of levelIds) {
          connections.push({
            from: `chapter_${chapter.id}`,
            to: lid,
            type: 'level',
            active: true,
          })
        }
      }
    }

    return connections
  } catch {
    return []
  }
}

export function getConnections(): Connection[] {
  try {
    return buildConnections()
  } catch {
    return []
  }
}

export function getMapBounds(): MapBounds {
  try {
    const nodes = getMapNodes()
    if (nodes.length === 0) return { minX: 0, minY: 0, maxX: 1000, maxY: 600, width: 1000, height: 600 }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const node of nodes) {
      minX = Math.min(minX, node.x)
      minY = Math.min(minY, node.y)
      maxX = Math.max(maxX, node.x)
      maxY = Math.max(maxY, node.y)
    }

    const padding = 80
    minX -= padding
    minY -= padding
    maxX += padding
    maxY += padding

    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
  } catch {
    return { minX: 0, minY: 0, maxX: 1000, maxY: 600, width: 1000, height: 600 }
  }
}

export function getMapScrollPosition(): { x: number; y: number } {
  try {
    return loadData().mapScroll
  } catch {
    return { x: 0, y: 0 }
  }
}

export function setMapScrollPosition(x: number, y: number): void {
  try {
    const data = loadData()
    data.mapScroll = { x, y }
    persistData(data)
  } catch {
    /* silent */
  }
}

export function getZoomLevel(): number {
  try {
    const zoom = loadData().zoomLevel
    return Math.max(0.5, Math.min(2.0, zoom))
  } catch {
    return 1.0
  }
}

export function setZoomLevel(zoom: number): void {
  try {
    const data = loadData()
    data.zoomLevel = Math.max(0.5, Math.min(2.0, zoom))
    persistData(data)
  } catch {
    /* silent */
  }
}

// ─── 6. Exploration Rewards ─────────────────────────────────────────────────

export function getExplorationBonus(regionId: RegionId): ExplorationBonus {
  try {
    const data = loadData()
    const regionIdx = REGIONS.findIndex((r) => r.id === regionId)
    const baseCoins = 200 + regionIdx * 150
    const baseXp = 100 + regionIdx * 100

    return {
      regionId,
      coins: baseCoins,
      xp: baseXp,
      title: `${REGIONS[regionIdx]?.name ?? 'Region'} Explorer`,
      description: 'Complete all levels in this region to earn the exploration bonus.',
      claimed: data.explorationBonusesClaimed.includes(regionId),
    }
  } catch {
    return { regionId, coins: 0, xp: 0, title: '', description: '', claimed: false }
  }
}

export function hasExploredFully(regionId: RegionId): boolean {
  try {
    const data = loadData()
    if (!data.unlockedRegions.includes(regionId)) return false
    const chapters = CHAPTERS.filter((ch) => ch.regionId === regionId)
    for (const ch of chapters) {
      const levelIds = generateLevelIds(ch.id, ch.levelCount)
      for (const lid of levelIds) {
        if (!data.levelAttempts[lid]?.completed) return false
      }
    }
    return true
  } catch {
    return false
  }
}

export function getExplorationStreak(): number {
  try {
    const data = loadData()
    const regionOrder: RegionId[] = [
      'green_meadows', 'crystal_caves', 'storm_peaks', 'shadow_forest',
      'ember_volcano', 'sky_islands', 'ocean_depths', 'final_frontier',
    ]
    let streak = 0
    for (const regionId of regionOrder) {
      if (hasExploredFully(regionId)) {
        streak++
      } else {
        break
      }
    }
    return streak
  } catch {
    return 0
  }
}

export function getHiddenPaths(): Array<{ id: string; name: string; discovered: boolean; levels: number }> {
  try {
    const data = loadData()
    return HIDDEN_PATHS.map((hp) => ({
      id: hp.id,
      name: hp.name,
      discovered: data.hiddenPaths.includes(hp.id),
      levels: hp.levels,
    }))
  } catch {
    return []
  }
}

export function discoverHiddenPath(pathId: string): boolean {
  try {
    const data = loadData()
    const hp = HIDDEN_PATHS.find((p) => p.id === pathId)
    if (!hp) return false
    if (data.hiddenPaths.includes(pathId)) return false

    const regionProgress = getRegionProgress(hp.requiredRegion as RegionId)
    if (regionProgress.stars < hp.requiredStars) return false

    data.hiddenPaths.push(pathId)
    persistData(data)
    return true
  } catch {
    return false
  }
}

// ─── 7. World Events ────────────────────────────────────────────────────────

export function getWorldEvents(): WorldEvent[] {
  try {
    return WORLD_EVENTS.map((e) => ({ ...e }))
  } catch {
    return []
  }
}

export function getActiveEvents(): WorldEvent[] {
  try {
    const now = Date.now()
    return WORLD_EVENTS.filter((e) => {
      if (e.startTime === 0 && e.endTime === 0) return false
      return now >= e.startTime && now <= e.endTime
    })
  } catch {
    return []
  }
}

export function getEventReward(eventId: string): { coins: number; xp: number; bonusType: string } {
  try {
    const event = WORLD_EVENTS.find((e) => e.id === eventId)
    if (!event) return { coins: 0, xp: 0, bonusType: 'none' }
    return {
      coins: Math.round(100 * event.bonus),
      xp: Math.round(50 * event.bonus),
      bonusType: event.type,
    }
  } catch {
    return { coins: 0, xp: 0, bonusType: 'none' }
  }
}

export function getEventProgress(eventId: string): { progress: number; goal: number; percent: number } {
  try {
    const data = loadData()
    const ep = data.eventProgress[eventId]
    if (!ep) return { progress: 0, goal: 5, percent: 0 }
    return {
      progress: ep.progress,
      goal: ep.goal,
      percent: ep.goal > 0 ? Math.round((ep.progress / ep.goal) * 100) : 0,
    }
  } catch {
    return { progress: 0, goal: 5, percent: 0 }
  }
}

// ─── 8. Lore & Narrative ────────────────────────────────────────────────────

export function getRegionLore(regionId: RegionId): RegionLore | null {
  try {
    const regionIdx = REGIONS.findIndex((r) => r.id === regionId)
    if (regionIdx < 0) return null
    const lore = REGION_LORE[regionIdx]
    if (!lore) return null
    return { regionId, ...lore }
  } catch {
    return null
  }
}

export function getChapterLore(chapterId: string): ChapterLore | null {
  try {
    const lore = CHAPTER_LORE[chapterId]
    if (!lore) return null
    return { chapterId, ...lore }
  } catch {
    return null
  }
}

export function getUnlockedLore(): Array<{ id: string; title: string; text: string }> {
  try {
    const data = loadData()
    const lore: Array<{ id: string; title: string; text: string }> = []

    for (const loreId of data.unlockedLore) {
      const match = loreId.match(/^lore_(.+)$/)
      if (!match) continue
      const regionId = match[1] as RegionId
      const regionLore = getRegionLore(regionId)
      if (regionLore) {
        lore.push({
          id: loreId,
          title: regionLore.title,
          text: regionLore.paragraphs.join(' '),
        })
      }
    }

    return lore
  } catch {
    return []
  }
}

export function getLoreCompletion(): number {
  try {
    const data = loadData()
    const totalLorePieces = REGIONS.length + CHAPTERS.length
    const unlockedRegionLore = data.unlockedLore.filter((l) => l.startsWith('lore_')).length
    return totalLorePieces > 0
      ? Math.round((unlockedRegionLore / totalLorePieces) * 100)
      : 0
  } catch {
    return 0
  }
}

export function getWorldSummary(): { title: string; description: string; regionCount: number; totalLevels: number } {
  try {
    let totalLevels = 0
    for (const ch of CHAPTERS) {
      totalLevels += ch.levelCount
    }
    return {
      title: 'The World of Word Snake',
      description: 'Eight extraordinary regions await, each filled with words to discover and challenges to overcome. From the gentle Green Meadows to the cosmic Final Frontier, your serpent must grow wiser and stronger with every word consumed.',
      regionCount: REGIONS.length,
      totalLevels,
    }
  } catch {
    return { title: 'The World of Word Snake', description: '', regionCount: 8, totalLevels: 0 }
  }
}

// ─── 9. Pathfinding & Navigation ────────────────────────────────────────────

export function getRecommendedPath(): RecommendedPath | null {
  try {
    const data = loadData()
    const regionOrder: RegionId[] = [
      'green_meadows', 'crystal_caves', 'storm_peaks', 'shadow_forest',
      'ember_volcano', 'sky_islands', 'ocean_depths', 'final_frontier',
    ]

    for (const regionId of regionOrder) {
      if (!data.unlockedRegions.includes(regionId)) continue
      const chapters = CHAPTERS.filter((ch) => ch.regionId === regionId)

      for (const ch of chapters) {
        if (!isChapterUnlocked(ch.id)) continue
        const levelIds = generateLevelIds(ch.id, ch.levelCount)

        for (const lid of levelIds) {
          const status = getLevelStatus(lid)
          if (status === 'unlocked' || status === 'inProgress') {
            return {
              levelId: lid,
              reason: status === 'inProgress' ? 'Continue your current challenge' : 'A new level awaits you',
              priority: 10 - (getLevel(lid)?.difficulty ?? 0),
            }
          }
        }
      }
    }

    return null
  } catch {
    return null
  }
}

export function getStuckHelper(): { message: string; suggestedLevel: string | null; tips: string[] } {
  try {
    const data = loadData()
    const tips = [
      'Try replaying earlier levels to earn more stars and improve your skills.',
      'Focus on word categories you are comfortable with first.',
      'Take breaks between attempts — fresh eyes help spot words faster.',
      'Pay attention to the timer and prioritize shorter words when time is low.',
    ]

    // Find the level with most failed attempts
    let maxAttempts = 0
    let stuckLevelId: string | null = null
    let stuckCompleted = false

    for (const [lid, attempt] of Object.entries(data.levelAttempts)) {
      if (attempt.attempts > maxAttempts && !attempt.completed) {
        maxAttempts = attempt.attempts
        stuckLevelId = lid
      }
    }

    if (stuckLevelId && maxAttempts >= 3) {
      // Suggest an easier, already-completed level for practice
      const completedLevel = Object.entries(data.levelAttempts)
        .find(([, a]) => a.completed && a.stars < 3)
        ?.[0]

      return {
        message: `It looks like you've tried "${stuckLevelId}" ${maxAttempts} times. Keep going!`,
        suggestedLevel: completedLevel ?? stuckLevelId,
        tips,
      }
    }

    return {
      message: 'You are making great progress! Keep exploring new levels.',
      suggestedLevel: null,
      tips: tips.slice(0, 2),
    }
  } catch {
    return { message: 'Keep playing to improve!', suggestedLevel: null, tips: [] }
  }
}

export function getCompletionPath(): string[] {
  try {
    const path: string[] = []
    const regionOrder: RegionId[] = [
      'green_meadows', 'crystal_caves', 'storm_peaks', 'shadow_forest',
      'ember_volcano', 'sky_islands', 'ocean_depths', 'final_frontier',
    ]

    for (const regionId of regionOrder) {
      const chapters = CHAPTERS.filter((ch) => ch.regionId === regionId)
      for (const ch of chapters) {
        const levelIds = generateLevelIds(ch.id, ch.levelCount)
        for (const lid of levelIds) {
          path.push(lid)
        }
      }
    }

    return path
  } catch {
    return []
  }
}

export function getNearestIncomplete(currentRegionId: RegionId): string | null {
  try {
    const regionOrder: RegionId[] = [
      'green_meadows', 'crystal_caves', 'storm_peaks', 'shadow_forest',
      'ember_volcano', 'sky_islands', 'ocean_depths', 'final_frontier',
    ]
    const currentIdx = regionOrder.indexOf(currentRegionId)

    // Search current region first, then adjacent
    const searchOrder: RegionId[] = []
    if (currentIdx >= 0) searchOrder.push(currentRegionId)
    if (currentIdx > 0) searchOrder.push(regionOrder[currentIdx - 1])
    if (currentIdx < regionOrder.length - 1) searchOrder.push(regionOrder[currentIdx + 1])
    for (const rid of regionOrder) {
      if (!searchOrder.includes(rid)) searchOrder.push(rid)
    }

    const data = loadData()
    for (const regionId of searchOrder) {
      if (!data.unlockedRegions.includes(regionId)) continue
      const chapters = CHAPTERS.filter((ch) => ch.regionId === regionId)
      for (const ch of chapters) {
        if (!isChapterUnlocked(ch.id)) continue
        const levelIds = generateLevelIds(ch.id, ch.levelCount)
        for (const lid of levelIds) {
          const attempt = data.levelAttempts[lid]
          if (!attempt?.completed) return lid
        }
      }
    }

    return null
  } catch {
    return null
  }
}

// ─── 10. UI Helpers ─────────────────────────────────────────────────────────

export function getWorldMapOverview(): WorldMapOverview {
  try {
    const data = loadData()
    return {
      regions: getRegions(),
      currentRegion: getRegion(data.currentRegion),
      overallProgress: getOverallProgress(),
      activeEvents: getActiveEvents(),
      explorationStreak: getExplorationStreak(),
      recommendedLevel: getRecommendedPath(),
    }
  } catch {
    return {
      regions: [],
      currentRegion: null,
      overallProgress: { completedLevels: 0, totalLevels: 0, totalStars: 0, maxStars: 0, completionPercent: 0, regionsExplored: 0 },
      activeEvents: [],
      explorationStreak: 0,
      recommendedLevel: null,
    }
  }
}

export function getRegionCard(regionId: RegionId): RegionCard | null {
  try {
    const region = getRegion(regionId)
    if (!region) return null

    const chapters = getChapters(regionId)
    const regionProgress = getRegionProgress(regionId)
    const chapterCount = chapters.length

    return {
      region,
      chapterCount,
      completedLevels: regionProgress.completed,
      totalLevels: regionProgress.total,
      progressPercent: regionProgress.percent,
      totalStars: regionProgress.stars,
      unlocked: region.unlocked,
    }
  } catch {
    return null
  }
}

export function getProgressSummary(): ProgressSummary {
  try {
    const overall = getOverallProgress()
    const data = loadData()
    const loreCompletion = getLoreCompletion()
    const loreTotal = REGIONS.length + CHAPTERS.length

    let regionsCompleted = 0
    for (const regionId of data.unlockedRegions) {
      if (hasExploredFully(regionId)) regionsCompleted++
    }

    const estimate = getCompletionEstimate()
    const hours = Math.floor(estimate.estimatedMinutes / 60)
    const minutes = estimate.estimatedMinutes % 60
    const playtimeEstimate = hours > 0 ? `~${hours}h ${minutes}m` : `~${minutes}m`

    return {
      totalLevelsCompleted: overall.completedLevels,
      totalStarsEarned: overall.totalStars,
      regionsUnlocked: data.unlockedRegions.length,
      regionsCompleted,
      loreDiscovered: Math.round((loreCompletion / 100) * loreTotal),
      loreTotal,
      hiddenPathsFound: data.hiddenPaths.length,
      playtimeEstimate,
    }
  } catch {
    return {
      totalLevelsCompleted: 0,
      totalStarsEarned: 0,
      regionsUnlocked: 1,
      regionsCompleted: 0,
      loreDiscovered: 0,
      loreTotal: REGIONS.length + CHAPTERS.length,
      hiddenPathsFound: 0,
      playtimeEstimate: '~0m',
    }
  }
}

export function getWorldMapStats(): WorldMapStats {
  try {
    const overall = getOverallProgress()
    const data = loadData()
    let chaptersCompleted = 0
    let levelsMastered = 0
    let chaptersTotal = 0

    for (const chapter of CHAPTERS) {
      chaptersTotal++
      if (!data.unlockedRegions.includes(chapter.regionId)) continue
      const progress = getChapterProgress(chapter.id)
      if (progress.completionPercent === 100) chaptersCompleted++
      const levelIds = generateLevelIds(chapter.id, chapter.levelCount)
      for (const lid of levelIds) {
        if (data.levelAttempts[lid]?.stars === 3) levelsMastered++
      }
    }

    return {
      completionPercent: overall.completionPercent,
      totalPlaytime: 0,
      regionsExplored: data.unlockedRegions.length,
      regionsTotal: REGIONS.length,
      chaptersCompleted,
      chaptersTotal,
      levelsMastered,
      currentStreak: getExplorationStreak(),
      bestStreak: getExplorationStreak(),
    }
  } catch {
    return {
      completionPercent: 0,
      totalPlaytime: 0,
      regionsExplored: 0,
      regionsTotal: REGIONS.length,
      chaptersCompleted: 0,
      chaptersTotal: CHAPTERS.length,
      levelsMastered: 0,
      currentStreak: 0,
      bestStreak: 0,
    }
  }
}
