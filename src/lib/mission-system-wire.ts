// ============================================================================
// Mission / Quest System Wire — Word Snake Game
// Storage key: ws_mission_system_wire
// 35 exported standalone functions · localStorage persistence
// ============================================================================

// ---- TypeScript Types -----------------------------------------------------

export type MissionCategory =
  | 'exploration'
  | 'combat'
  | 'collection'
  | 'social'
  | 'mastery';

export type MissionDifficulty =
  | 'easy'
  | 'medium'
  | 'hard'
  | 'epic'
  | 'legendary';

export type MissionStatus =
  | 'available'
  | 'active'
  | 'completed'
  | 'claimed'
  | 'expired';

export type RewardType =
  | 'coins'
  | 'gems'
  | 'xp'
  | 'title'
  | 'skin'
  | 'powerup';

export interface MissionReward {
  type: RewardType;
  amount: number;
  label: string;
  rarity: MissionDifficulty;
}

export interface BonusObjective {
  id: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  reward: MissionReward;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  status: MissionStatus;
  target: number;
  progress: number;
  rewards: MissionReward[];
  bonusObjectives: BonusObjective[];
  chainId: string | null;
  orderInChain: number;
  refreshCycle: 'none' | 'daily' | 'weekly' | 'seasonal';
  expiresAt: number | null;
  acceptedAt: number | null;
  completedAt: number | null;
  claimedAt: number | null;
  icon: string;
  color: string;
}

export interface MissionProgress {
  missionId: string;
  current: number;
  target: number;
  percentage: number;
  isComplete: boolean;
  bonusObjectives: BonusObjective[];
}

export interface MissionChain {
  id: string;
  title: string;
  description: string;
  missions: string[];
  totalMissions: number;
  completedMissions: number;
  finalBonusReward: MissionReward;
  category: MissionCategory;
}

export interface MissionState {
  missions: Record<string, Mission>;
  chains: Record<string, MissionChain>;
  dailySeed: number;
  weeklySeed: number;
  seasonSeed: number;
  lastDailyRefresh: number;
  lastWeeklyRefresh: number;
  lastSeasonRefresh: number;
  totalCompleted: number;
  totalClaimed: number;
  totalActive: number;
  history: Array<{
    missionId: string;
    title: string;
    category: MissionCategory;
    completedAt: number;
    rewards: MissionReward[];
  }>;
  streakData: {
    currentStreak: number;
    bestStreak: number;
    lastCompletionDate: string;
  };
  categoryCompletions: Record<MissionCategory, number>;
  rewardsEarned: Record<RewardType, number>;
  totalGamesPlayed: number;
  totalWordsEaten: number;
  totalScoreEarned: number;
  bestCombo: number;
  dailyChallengesBeaten: number;
  achievementsUnlocked: number;
  friendsInvited: number;
  rareWordsFound: number;
  powerupsCollected: number;
  puzzlesCompleted: number;
  wordsMastered5: number;
  initialized: boolean;
}

// ---- Constants -------------------------------------------------------------

const STORAGE_KEY = 'ws_mission_system_wire';
const MAX_ACTIVE_MISSIONS = 5;
const DAY_MS = 86_400_000;
const WEEK_MS = 604_800_000;
const SEASON_MS = DAY_MS * 90;

const CATEGORY_CONFIG: Record<
  MissionCategory,
  { icon: string; color: string; label: string }
> = {
  exploration: { icon: '🧭', color: '#4fc3f7', label: 'Exploration' },
  combat: { icon: '⚔️', color: '#ef5350', label: 'Combat' },
  collection: { icon: '💎', color: '#ab47bc', label: 'Collection' },
  social: { icon: '👥', color: '#66bb6a', label: 'Social' },
  mastery: { icon: '🏆', color: '#ffa726', label: 'Mastery' },
};

const DIFFICULTY_CONFIG: Record<
  MissionDifficulty,
  { multiplier: number; label: string }
> = {
  easy: { multiplier: 1, label: 'Easy' },
  medium: { multiplier: 1.5, label: 'Medium' },
  hard: { multiplier: 2.5, label: 'Hard' },
  epic: { multiplier: 4, label: 'Epic' },
  legendary: { multiplier: 6, label: 'Legendary' },
};

// ---- Helpers: reward generation -------------------------------------------

function makeReward(
  type: RewardType,
  baseAmount: number,
  difficulty: MissionDifficulty,
  label?: string,
): MissionReward {
  const mult = DIFFICULTY_CONFIG[difficulty].multiplier;
  return {
    type,
    amount: Math.round(baseAmount * mult),
    label: label ?? `${type} x${Math.round(baseAmount * mult)}`,
    rarity: difficulty,
  };
}

function generateRewards(difficulty: MissionDifficulty): MissionReward[] {
  const rewards: MissionReward[] = [
    makeReward('coins', 100, difficulty),
    makeReward('xp', 50, difficulty),
  ];
  if (difficulty === 'medium' || difficulty === 'hard') {
    rewards.push(makeReward('gems', 5, difficulty));
  }
  if (difficulty === 'epic') {
    rewards.push(makeReward('gems', 15, difficulty));
    rewards.push(makeReward('powerup', 3, difficulty, 'Rare Powerup x3'));
  }
  if (difficulty === 'legendary') {
    rewards.push(makeReward('gems', 30, difficulty));
    rewards.push(makeReward('title', 1, difficulty, 'Exclusive Title'));
    rewards.push(makeReward('skin', 1, difficulty, 'Legendary Skin'));
  }
  return rewards;
}

function makeBonus(
  id: string,
  description: string,
  target: number,
  difficulty: MissionDifficulty,
): BonusObjective {
  return {
    id,
    description,
    target,
    progress: 0,
    completed: false,
    reward: makeReward('gems', 10, difficulty, 'Bonus Gems'),
  };
}

// ---- Helpers: seeding / deterministic IDs ----------------------------------

function dayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function weekKey(): string {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((d.getTime() - jan1.getTime()) / DAY_MS + jan1.getDay() + 1) / 7,
  );
  return `${d.getFullYear()}-W${week}`;
}

function seasonKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-S${Math.floor(d.getMonth() / 3) + 1}`;
}

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededPick<T>(arr: T[], seed: number, index: number): T {
  return arr[(seed + index) % arr.length];
}

// ---- Helpers: localStorage ------------------------------------------------

function isBrowser(): boolean {
  return typeof globalThis.window !== 'undefined';
}

function loadState(): MissionState {
  if (!isBrowser()) return createDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MissionState;
  } catch {
    /* ignore parse errors */
  }
  return createDefaultState();
}

function saveState(state: MissionState): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

// ---- Default state & mission definitions ----------------------------------

function createDefaultState(): MissionState {
  const state: MissionState = {
    missions: {},
    chains: {},
    dailySeed: simpleHash(dayKey()),
    weeklySeed: simpleHash(weekKey()),
    seasonSeed: simpleHash(seasonKey()),
    lastDailyRefresh: startOfDay(),
    lastWeeklyRefresh: startOfWeek(),
    lastSeasonRefresh: startOfSeason(),
    totalCompleted: 0,
    totalClaimed: 0,
    totalActive: 0,
    history: [],
    streakData: {
      currentStreak: 0,
      bestStreak: 0,
      lastCompletionDate: '',
    },
    categoryCompletions: {
      exploration: 0,
      combat: 0,
      collection: 0,
      social: 0,
      mastery: 0,
    },
    rewardsEarned: {
      coins: 0,
      gems: 0,
      xp: 0,
      title: 0,
      skin: 0,
      powerup: 0,
    },
    totalGamesPlayed: 0,
    totalWordsEaten: 0,
    totalScoreEarned: 0,
    bestCombo: 0,
    dailyChallengesBeaten: 0,
    achievementsUnlocked: 0,
    friendsInvited: 0,
    rareWordsFound: 0,
    powerupsCollected: 0,
    puzzlesCompleted: 0,
    wordsMastered5: 0,
    initialized: false,
  };

  populateMissions(state);
  populateChains(state);
  state.initialized = true;
  return state;
}

function startOfDay(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfWeek(): number {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfSeason(): number {
  const d = new Date();
  const seasonStart = Math.floor(d.getMonth() / 3) * 3;
  d.setMonth(seasonStart, 1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function baseMission(
  id: string,
  title: string,
  description: string,
  category: MissionCategory,
  difficulty: MissionDifficulty,
  target: number,
  refreshCycle: 'none' | 'daily' | 'weekly' | 'seasonal',
  chainId: string | null = null,
  orderInChain = 0,
): Mission {
  const cfg = CATEGORY_CONFIG[category];
  const bonusId = `${id}_b1`;
  const bonusDesc = buildBonusDesc(description, target);
  const bonusTarget = Math.round(target * 1.5);
  return {
    id,
    title,
    description,
    category,
    difficulty,
    status: 'available',
    target,
    progress: 0,
    rewards: generateRewards(difficulty),
    bonusObjectives: [makeBonus(bonusId, bonusDesc, bonusTarget, difficulty)],
    chainId,
    orderInChain,
    refreshCycle,
    expiresAt: null,
    acceptedAt: null,
    completedAt: null,
    claimedAt: null,
    icon: cfg.icon,
    color: cfg.color,
  };
}

function buildBonusDesc(desc: string, target: number): string {
  return `${desc} (1.5× bonus: ${Math.round(target * 1.5)})`;
}

// ---- Populate 28 diverse missions ------------------------------------------

function populateMissions(state: MissionState): void {
  const missions: Mission[] = [
    // ---- Exploration (5) ----
    baseMission(
      'exp_play_5',
      'Play 5 Games',
      'Complete 5 games in any mode',
      'exploration', 'easy', 5, 'none',
    ),
    baseMission(
      'exp_play_25',
      'Play 25 Games',
      'Complete 25 games in any mode',
      'exploration', 'medium', 25, 'none',
    ),
    baseMission(
      'exp_play_100',
      'Play 100 Games',
      'Complete 100 games total',
      'exploration', 'hard', 100, 'weekly',
    ),
    baseMission(
      'exp_rare_10',
      'Find 10 Rare Words',
      'Discover and eat 10 rare words',
      'exploration', 'epic', 10, 'none',
    ),
    baseMission(
      'exp_explore_all_modes',
      'Explorer of Modes',
      'Play at least 3 games in each game mode',
      'exploration', 'legendary', 15, 'seasonal',
    ),

    // ---- Combat (6) ----
    baseMission(
      'cmb_score_500',
      'Score 500 Points',
      'Achieve a score of 500 in a single game',
      'combat', 'easy', 500, 'none',
    ),
    baseMission(
      'cmb_score_2000',
      'Score 2000 Points',
      'Achieve a score of 2000 in a single game',
      'combat', 'medium', 2000, 'none',
    ),
    baseMission(
      'cmb_score_5000',
      'Score 5000 Points',
      'Achieve a score of 5000 in a single game',
      'combat', 'hard', 5000, 'none',
    ),
    baseMission(
      'cmb_combo_10',
      '10x Combo',
      'Achieve a 10-word combo in a single game',
      'combat', 'medium', 10, 'none',
    ),
    baseMission(
      'cmb_combo_25',
      '25x Combo Master',
      'Achieve a 25-word combo in a single game',
      'combat', 'epic', 25, 'weekly',
    ),
    baseMission(
      'cmb_daily_7',
      'Daily Warrior',
      'Beat the daily challenge 7 times',
      'combat', 'hard', 7, 'none',
    ),

    // ---- Collection (6) ----
    baseMission(
      'col_eat_3letter',
      'Short & Sweet',
      'Eat 20 words of 3 letters or fewer',
      'collection', 'easy', 20, 'none',
    ),
    baseMission(
      'col_eat_7letter',
      'Long Words Hunter',
      'Eat 15 words of 7+ letters',
      'collection', 'medium', 15, 'none',
    ),
    baseMission(
      'col_eat_10letter',
      'Lexicon Legend',
      'Eat 5 words of 10+ letters',
      'collection', 'hard', 5, 'weekly',
    ),
    baseMission(
      'col_powerups_20',
      'Powerup Collector',
      'Collect 20 powerups across all games',
      'collection', 'medium', 20, 'none',
    ),
    baseMission(
      'col_puzzles_10',
      'Puzzle Solver',
      'Complete 10 word puzzles',
      'collection', 'medium', 10, 'none',
    ),
    baseMission(
      'col_total_500',
      'Word Glutton',
      'Eat a total of 500 words',
      'collection', 'epic', 500, 'seasonal',
    ),

    // ---- Social (4) ----
    baseMission(
      'soc_invite_3',
      'Spread the Word',
      'Invite 3 friends to play Word Snake',
      'social', 'easy', 3, 'none',
    ),
    baseMission(
      'soc_invite_10',
      'Social Butterfly',
      'Invite 10 friends to play Word Snake',
      'social', 'medium', 10, 'none',
    ),
    baseMission(
      'soc_streak_3',
      'Consistent Player',
      'Maintain a 3-day login streak',
      'social', 'easy', 3, 'daily',
    ),
    baseMission(
      'soc_streak_14',
      'Dedicated Player',
      'Maintain a 14-day login streak',
      'social', 'hard', 14, 'weekly',
    ),

    // ---- Mastery (7) ----
    baseMission(
      'mst_achieve_5',
      'Achievement Hunter',
      'Unlock 5 achievements',
      'mastery', 'easy', 5, 'none',
    ),
    baseMission(
      'mst_achieve_20',
      'Achievement Master',
      'Unlock 20 achievements',
      'mastery', 'medium', 20, 'none',
    ),
    baseMission(
      'mst_master_5',
      'Word Scholar',
      'Master 5 words to level 5',
      'mastery', 'medium', 5, 'none',
    ),
    baseMission(
      'mst_master_25',
      'Virtuoso',
      'Master 25 words to level 5',
      'mastery', 'epic', 25, 'seasonal',
    ),
    baseMission(
      'mst_all_easy',
      'Completionist I',
      'Complete all easy missions',
      'mastery', 'hard', 7, 'none',
    ),
    baseMission(
      'mst_all_categories',
      'Renaissance Snake',
      'Complete at least 3 missions in each category',
      'mastery', 'legendary', 15, 'seasonal',
    ),
    baseMission(
      'mst_chain_finisher',
      'Chain Breaker',
      'Complete 3 full mission chains',
      'mastery', 'legendary', 3, 'seasonal',
    ),
  ];

  for (const m of missions) {
    state.missions[m.id] = m;
  }
}

// ---- Populate 5 mission chains ---------------------------------------------

function populateChains(state: MissionState): void {
  const chains: MissionChain[] = [
    {
      id: 'chain_explorer',
      title: 'Explorer\'s Journey',
      description: 'Follow the path of discovery through increasingly difficult explorations.',
      missions: ['chain_exp_1', 'chain_exp_2', 'chain_exp_3', 'chain_exp_4'],
      totalMissions: 4,
      completedMissions: 0,
      finalBonusReward: {
        type: 'skin',
        amount: 1,
        label: 'Explorer Skin',
        rarity: 'legendary',
      },
      category: 'exploration',
    },
    {
      id: 'chain_warrior',
      title: 'Warrior\'s Trial',
      description: 'Prove your combat prowess through escalating score challenges.',
      missions: ['chain_war_1', 'chain_war_2', 'chain_war_3'],
      totalMissions: 3,
      completedMissions: 0,
      finalBonusReward: {
        type: 'title',
        amount: 1,
        label: 'Title: Battle-Hardened',
        rarity: 'legendary',
      },
      category: 'combat',
    },
    {
      id: 'chain_collector',
      title: 'Collector\'s Quest',
      description: 'Amass words and powerups to build the ultimate collection.',
      missions: ['chain_col_1', 'chain_col_2', 'chain_col_3', 'chain_col_4', 'chain_col_5'],
      totalMissions: 5,
      completedMissions: 0,
      finalBonusReward: {
        type: 'skin',
        amount: 1,
        label: 'Collector\'s Aura Skin',
        rarity: 'legendary',
      },
      category: 'collection',
    },
    {
      id: 'chain_socialite',
      title: 'Social Butterfly Path',
      description: 'Build your social circle and keep consistent activity.',
      missions: ['chain_soc_1', 'chain_soc_2', 'chain_soc_3', 'chain_soc_4'],
      totalMissions: 4,
      completedMissions: 0,
      finalBonusReward: {
        type: 'title',
        amount: 1,
        label: 'Title: Community Leader',
        rarity: 'legendary',
      },
      category: 'social',
    },
    {
      id: 'chain_scholar',
      title: 'Scholar\'s Ascent',
      description: 'Master the words, achieve greatness, and claim your scholarly throne.',
      missions: ['chain_sch_1', 'chain_sch_2', 'chain_sch_3', 'chain_sch_4', 'chain_sch_5'],
      totalMissions: 5,
      completedMissions: 0,
      finalBonusReward: {
        type: 'skin',
        amount: 1,
        label: 'Golden Scholar Skin',
        rarity: 'legendary',
      },
      category: 'mastery',
    },
  ];

  // Explorer chain missions
  const explorerChain: Mission[] = [
    baseMission('chain_exp_1', 'First Steps', 'Play 3 games', 'exploration', 'easy', 3, 'none', 'chain_explorer', 0),
    baseMission('chain_exp_2', 'Getting Warmer', 'Play 10 games', 'exploration', 'easy', 10, 'none', 'chain_explorer', 1),
    baseMission('chain_exp_3', 'Seasoned Explorer', 'Play 50 games', 'exploration', 'medium', 50, 'none', 'chain_explorer', 2),
    baseMission('chain_exp_4', 'World Wanderer', 'Play 200 games', 'exploration', 'hard', 200, 'none', 'chain_explorer', 3),
  ];

  // Warrior chain missions
  const warriorChain: Mission[] = [
    baseMission('chain_war_1', 'First Blood', 'Score 300 in one game', 'combat', 'easy', 300, 'none', 'chain_warrior', 0),
    baseMission('chain_war_2', 'Rising Warrior', 'Score 1500 in one game', 'combat', 'medium', 1500, 'none', 'chain_warrior', 1),
    baseMission('chain_war_3', 'Untouchable', 'Score 4000 in one game', 'combat', 'hard', 4000, 'none', 'chain_warrior', 2),
  ];

  // Collector chain missions
  const collectorChain: Mission[] = [
    baseMission('chain_col_1', 'Gatherer', 'Eat 50 words total', 'collection', 'easy', 50, 'none', 'chain_collector', 0),
    baseMission('chain_col_2', 'Hoarder', 'Eat 200 words total', 'collection', 'medium', 200, 'none', 'chain_collector', 1),
    baseMission('chain_col_3', 'Powerup Enthusiast', 'Collect 30 powerups', 'collection', 'medium', 30, 'none', 'chain_collector', 2),
    baseMission('chain_col_4', 'Rare Finder', 'Find 15 rare words', 'collection', 'hard', 15, 'none', 'chain_collector', 3),
    baseMission('chain_col_5', 'Ultimate Collector', 'Eat 1000 words total', 'collection', 'epic', 1000, 'none', 'chain_collector', 4),
  ];

  // Socialite chain missions
  const socialChain: Mission[] = [
    baseMission('chain_soc_1', 'Friendly Face', 'Invite 1 friend', 'social', 'easy', 1, 'none', 'chain_socialite', 0),
    baseMission('chain_soc_2', 'Group Builder', 'Invite 5 friends', 'social', 'medium', 5, 'none', 'chain_socialite', 1),
    baseMission('chain_soc_3', 'Streak Starter', 'Maintain a 3-day streak', 'social', 'easy', 3, 'none', 'chain_socialite', 2),
    baseMission('chain_soc_4', 'Social Legend', 'Invite 15 friends & maintain a 7-day streak', 'social', 'hard', 22, 'none', 'chain_socialite', 3),
  ];

  // Scholar chain missions
  const scholarChain: Mission[] = [
    baseMission('chain_sch_1', 'Novice Learner', 'Unlock 3 achievements', 'mastery', 'easy', 3, 'none', 'chain_scholar', 0),
    baseMission('chain_sch_2', 'Apprentice', 'Master 3 words to level 5', 'mastery', 'medium', 3, 'none', 'chain_scholar', 1),
    baseMission('chain_sch_3', 'Adept Scholar', 'Unlock 15 achievements', 'mastery', 'medium', 15, 'none', 'chain_scholar', 2),
    baseMission('chain_sch_4', 'Expert Wordsmith', 'Master 15 words to level 5', 'mastery', 'hard', 15, 'none', 'chain_scholar', 3),
    baseMission('chain_sch_5', 'Grandmaster', 'Unlock 50 achievements and master 30 words to level 5', 'mastery', 'legendary', 80, 'none', 'chain_scholar', 4),
  ];

  const allChainMissions = [
    ...explorerChain,
    ...warriorChain,
    ...collectorChain,
    ...socialChain,
    ...scholarChain,
  ];

  for (const m of allChainMissions) {
    state.missions[m.id] = m;
  }

  for (const chain of chains) {
    state.chains[chain.id] = chain;
  }
}

// ---- Ensure refresh cycles are respected -----------------------------------

function checkAndRefresh(state: MissionState): MissionState {
  const now = Date.now();

  // Daily refresh
  if (now - state.lastDailyRefresh >= DAY_MS) {
    refreshDailyMissionsInternal(state);
    state.lastDailyRefresh = startOfDay();
    state.dailySeed = simpleHash(dayKey());
  }

  // Weekly refresh
  if (now - state.lastWeeklyRefresh >= WEEK_MS) {
    refreshWeeklyMissionsInternal(state);
    state.lastWeeklyRefresh = startOfWeek();
    state.weeklySeed = simpleHash(weekKey());
  }

  // Seasonal refresh
  if (now - state.lastSeasonRefresh >= SEASON_MS) {
    refreshSeasonalMissionsInternal(state);
    state.lastSeasonRefresh = startOfSeason();
    state.seasonSeed = simpleHash(seasonKey());
  }

  return state;
}

function refreshDailyMissionsInternal(state: MissionState): void {
  for (const m of Object.values(state.missions)) {
    if (m.refreshCycle === 'daily' && m.status !== 'active') {
      m.status = 'available';
      m.progress = 0;
      m.completedAt = null;
      m.claimedAt = null;
      m.acceptedAt = null;
      m.bonusObjectives = m.bonusObjectives.map((b) => ({
        ...b,
        progress: 0,
        completed: false,
      }));
    }
  }
}

function refreshWeeklyMissionsInternal(state: MissionState): void {
  for (const m of Object.values(state.missions)) {
    if (m.refreshCycle === 'weekly' && m.status !== 'active') {
      m.status = 'available';
      m.progress = 0;
      m.completedAt = null;
      m.claimedAt = null;
      m.acceptedAt = null;
      m.bonusObjectives = m.bonusObjectives.map((b) => ({
        ...b,
        progress: 0,
        completed: false,
      }));
    }
  }
}

function refreshSeasonalMissionsInternal(state: MissionState): void {
  for (const m of Object.values(state.missions)) {
    if (m.refreshCycle === 'seasonal' && m.status !== 'active') {
      m.status = 'available';
      m.progress = 0;
      m.completedAt = null;
      m.claimedAt = null;
      m.acceptedAt = null;
      m.bonusObjectives = m.bonusObjectives.map((b) => ({
        ...b,
        progress: 0,
        completed: false,
      }));
    }
  }
}

// ---- Streak helpers --------------------------------------------------------

function updateStreak(state: MissionState): void {
  const today = dayKey();
  if (state.streakData.lastCompletionDate === today) return;

  const yesterday = new Date(Date.now() - DAY_MS);
  const yKey = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;

  if (state.streakData.lastCompletionDate === yKey) {
    state.streakData.currentStreak += 1;
  } else {
    state.streakData.currentStreak = 1;
  }

  state.streakData.lastCompletionDate = today;
  if (state.streakData.currentStreak > state.streakData.bestStreak) {
    state.streakData.bestStreak = state.streakData.currentStreak;
  }
}

// ---- Recalculate chain progress --------------------------------------------

function recalcChainProgress(state: MissionState, chainId: string): void {
  const chain = state.chains[chainId];
  if (!chain) return;
  let completed = 0;
  for (const mid of chain.missions) {
    const m = state.missions[mid];
    if (m && m.status === 'claimed') {
      completed++;
    }
  }
  chain.completedMissions = completed;
}

// ============================================================================
// EXPORTED FUNCTIONS
// ============================================================================

// 1. Initialize default state with available missions
export function initMissionSystem(): MissionState {
  const state = loadState();
  if (!state.initialized) {
    const fresh = createDefaultState();
    saveState(fresh);
    return fresh;
  }
  const refreshed = checkAndRefresh(state);
  saveState(refreshed);
  return refreshed;
}

// 2. Get all available missions with status
export function getMissions(): Mission[] {
  const state = initMissionSystem();
  return Object.values(state.missions).map((m) => ({ ...m }));
}

// 3. Currently accepted missions
export function getActiveMissions(): Mission[] {
  const state = initMissionSystem();
  return Object.values(state.missions)
    .filter((m) => m.status === 'active')
    .map((m) => ({ ...m }));
}

// 4. Missions not yet accepted
export function getAvailableMissions(): Mission[] {
  const state = initMissionSystem();
  return Object.values(state.missions)
    .filter((m) => m.status === 'available')
    .map((m) => ({ ...m }));
}

// 5. All completed missions history
export function getCompletedMissions(): Mission[] {
  const state = initMissionSystem();
  return Object.values(state.missions)
    .filter((m) => m.status === 'completed' || m.status === 'claimed')
    .map((m) => ({ ...m }));
}

// 6. Accept a mission into active slot
export function acceptMission(missionId: string): Mission | null {
  const state = initMissionSystem();
  const mission = state.missions[missionId];
  if (!mission) return null;
  if (mission.status !== 'available') return null;

  // Check active slot limit
  const activeCount = Object.values(state.missions).filter(
    (m) => m.status === 'active',
  ).length;
  if (activeCount >= MAX_ACTIVE_MISSIONS) return null;

  // Check chain prerequisite
  if (mission.chainId) {
    const chain = state.chains[mission.chainId];
    if (chain && mission.orderInChain > 0) {
      const prevId = chain.missions[mission.orderInChain - 1];
      const prev = state.missions[prevId];
      if (!prev || prev.status !== 'claimed') return null;
    }
  }

  mission.status = 'active';
  mission.acceptedAt = Date.now();
  state.totalActive++;
  saveState(state);
  return { ...mission };
}

// 7. Cancel an active mission
export function cancelMission(missionId: string): Mission | null {
  const state = initMissionSystem();
  const mission = state.missions[missionId];
  if (!mission) return null;
  if (mission.status !== 'active') return null;

  // Don't allow cancelling chain missions that are already in-progress at order > 0
  mission.status = 'available';
  mission.acceptedAt = null;
  mission.progress = 0;
  state.totalActive = Math.max(0, state.totalActive - 1);

  // Reset bonus objectives
  mission.bonusObjectives = mission.bonusObjectives.map((b) => ({
    ...b,
    progress: 0,
    completed: false,
  }));

  saveState(state);
  return { ...mission };
}

// 8. Update progress
export function updateMissionProgress(
  missionId: string,
  amount: number,
): MissionProgress | null {
  const state = initMissionSystem();
  const mission = state.missions[missionId];
  if (!mission) return null;
  if (mission.status !== 'active') return null;

  mission.progress = Math.min(mission.progress + amount, mission.target);

  // Check bonus objectives — bonus progress mirrors a fraction
  for (const bonus of mission.bonusObjectives) {
    if (!bonus.completed) {
      bonus.progress = Math.min(bonus.progress + amount, bonus.target);
      if (bonus.progress >= bonus.target) {
        bonus.completed = true;
      }
    }
  }

  if (mission.progress >= mission.target) {
    mission.status = 'completed';
    mission.completedAt = Date.now();
    state.totalCompleted++;
    state.categoryCompletions[mission.category]++;
    updateStreak(state);
    recalcChainProgress(state, mission.chainId ?? '');

    // Add to history
    state.history.unshift({
      missionId: mission.id,
      title: mission.title,
      category: mission.category,
      completedAt: Date.now(),
      rewards: mission.rewards,
    });

    // Trim history to last 200 entries
    if (state.history.length > 200) {
      state.history = state.history.slice(0, 200);
    }
  }

  saveState(state);
  return {
    missionId: mission.id,
    current: mission.progress,
    target: mission.target,
    percentage:
      mission.target > 0
        ? Math.round((mission.progress / mission.target) * 10000) / 100
        : 0,
    isComplete: mission.status === 'completed',
    bonusObjectives: mission.bonusObjectives.map((b) => ({ ...b })),
  };
}

// 9. Mark mission complete
export function completeMission(missionId: string): Mission | null {
  const state = initMissionSystem();
  const mission = state.missions[missionId];
  if (!mission) return null;

  // Can complete if progress met
  if (mission.progress < mission.target) {
    mission.progress = mission.target;
  }

  if (mission.status !== 'completed') {
    if (mission.status === 'active') {
      mission.status = 'completed';
      mission.completedAt = Date.now();
      state.totalCompleted++;
      state.categoryCompletions[mission.category]++;
      updateStreak(state);
      recalcChainProgress(state, mission.chainId ?? '');

      state.history.unshift({
        missionId: mission.id,
        title: mission.title,
        category: mission.category,
        completedAt: Date.now(),
        rewards: mission.rewards,
      });
    }
  }

  saveState(state);
  return { ...mission };
}

// 10. Claim reward for completed mission
export function claimMissionReward(missionId: string): MissionReward[] | null {
  const state = initMissionSystem();
  const mission = state.missions[missionId];
  if (!mission) return null;
  if (mission.status !== 'completed') return null;

  mission.status = 'claimed';
  mission.claimedAt = Date.now();
  state.totalClaimed++;
  state.totalActive = Math.max(0, state.totalActive - 1);

  // Accumulate rewards
  for (const r of mission.rewards) {
    state.rewardsEarned[r.type] =
      (state.rewardsEarned[r.type] || 0) + r.amount;
  }

  // Also claim bonus objective rewards
  const allRewards = [...mission.rewards];
  for (const bonus of mission.bonusObjectives) {
    if (bonus.completed) {
      state.rewardsEarned[bonus.reward.type] =
        (state.rewardsEarned[bonus.reward.type] || 0) + bonus.reward.amount;
      allRewards.push(bonus.reward);
    }
  }

  // Check if chain is fully complete for bonus
  if (mission.chainId) {
    recalcChainProgress(state, mission.chainId);
    const chain = state.chains[mission.chainId];
    if (chain && chain.completedMissions === chain.totalMissions) {
      state.rewardsEarned[chain.finalBonusReward.type] =
        (state.rewardsEarned[chain.finalBonusReward.type] || 0) +
        chain.finalBonusReward.amount;
    }
  }

  saveState(state);
  return allRewards;
}

// 11. Get progress data for a mission
export function getMissionProgress(missionId: string): MissionProgress | null {
  const state = initMissionSystem();
  const mission = state.missions[missionId];
  if (!mission) return null;

  return {
    missionId: mission.id,
    current: mission.progress,
    target: mission.target,
    percentage:
      mission.target > 0
        ? Math.round((mission.progress / mission.target) * 10000) / 100
        : 0,
    isComplete: mission.status === 'completed' || mission.status === 'claimed',
    bonusObjectives: mission.bonusObjectives.map((b) => ({ ...b })),
  };
}

// 12. Preview rewards for a mission
export function getMissionRewards(missionId: string): MissionReward[] | null {
  const state = initMissionSystem();
  const mission = state.missions[missionId];
  if (!mission) return null;
  return [...mission.rewards];
}

// 13. Filter missions by category
export function getMissionsByCategory(
  category: MissionCategory,
): Mission[] {
  const state = initMissionSystem();
  return Object.values(state.missions)
    .filter((m) => m.category === category)
    .map((m) => ({ ...m }));
}

// 14. Filter by difficulty
export function getMissionsByDifficulty(
  difficulty: MissionDifficulty,
): Mission[] {
  const state = initMissionSystem();
  return Object.values(state.missions)
    .filter((m) => m.difficulty === difficulty)
    .map((m) => ({ ...m }));
}

// 15. Get all mission chains
export function getMissionChains(): MissionChain[] {
  const state = initMissionSystem();
  // Recalculate all chain progress
  for (const chainId of Object.keys(state.chains)) {
    recalcChainProgress(state, chainId);
  }
  return Object.values(state.chains).map((c) => ({ ...c }));
}

// 16. Progress in a chain
export function getChainProgress(
  chainId: string,
): MissionChain | null {
  const state = initMissionSystem();
  const chain = state.chains[chainId];
  if (!chain) return null;
  recalcChainProgress(state, chainId);
  saveState(state);
  return { ...chain };
}

// 17. Next mission in chain
export function getNextInChain(
  chainId: string,
): Mission | null {
  const state = initMissionSystem();
  const chain = state.chains[chainId];
  if (!chain) return null;

  for (let i = 0; i < chain.missions.length; i++) {
    const m = state.missions[chain.missions[i]];
    if (!m) continue;
    if (m.status === 'available' || m.status === 'active') {
      return { ...m };
    }
  }

  return null;
}

// 18. Stats: completed, active, success rate
export function getMissionStats(): {
  totalMissions: number;
  completed: number;
  claimed: number;
  active: number;
  available: number;
  successRate: number;
} {
  const state = initMissionSystem();
  const all = Object.values(state.missions);
  const completed = all.filter(
    (m) => m.status === 'completed' || m.status === 'claimed',
  ).length;
  const claimed = all.filter((m) => m.status === 'claimed').length;
  const active = all.filter((m) => m.status === 'active').length;
  const available = all.filter((m) => m.status === 'available').length;
  const everAccepted = completed + active;
  const successRate =
    everAccepted > 0
      ? Math.round((completed / everAccepted) * 10000) / 100
      : 0;

  return {
    totalMissions: all.length,
    completed,
    claimed,
    active,
    available,
    successRate,
  };
}

// 19. Today's daily missions
export function getDailyMissions(): Mission[] {
  const state = initMissionSystem();
  const todaySeed = simpleHash(dayKey());
  const dailyMissionIds = Object.keys(state.missions).filter(
    (id) => state.missions[id].refreshCycle === 'daily',
  );

  // Deterministically pick up to 3 daily missions
  const picked: Mission[] = [];
  const used = new Set<string>();
  for (let i = 0; i < 3 && picked.length < dailyMissionIds.length; i++) {
    const idx = (todaySeed + i * 7) % dailyMissionIds.length;
    const mid = dailyMissionIds[idx];
    if (!used.has(mid)) {
      used.add(mid);
      picked.push({ ...state.missions[mid] });
    }
  }
  return picked;
}

// 20. This week's missions
export function getWeeklyMissions(): Mission[] {
  const state = initMissionSystem();
  const wkSeed = simpleHash(weekKey());
  const weeklyIds = Object.keys(state.missions).filter(
    (id) => state.missions[id].refreshCycle === 'weekly',
  );

  const picked: Mission[] = [];
  const used = new Set<string>();
  for (let i = 0; i < 5 && picked.length < weeklyIds.length; i++) {
    const idx = (wkSeed + i * 13) % weeklyIds.length;
    const mid = weeklyIds[idx];
    if (!used.has(mid)) {
      used.add(mid);
      picked.push({ ...state.missions[mid] });
    }
  }
  return picked;
}

// 21. Get bonus objectives for mission
export function getBonusObjectives(
  missionId: string,
): BonusObjective[] {
  const state = initMissionSystem();
  const mission = state.missions[missionId];
  if (!mission) return [];
  return mission.bonusObjectives.map((b) => ({ ...b }));
}

// 22. Complete bonus
export function completeBonusObjective(
  missionId: string,
  objectiveId: string,
): BonusObjective | null {
  const state = initMissionSystem();
  const mission = state.missions[missionId];
  if (!mission) return null;

  const bonus = mission.bonusObjectives.find((b) => b.id === objectiveId);
  if (!bonus) return null;

  bonus.completed = true;
  bonus.progress = bonus.target;
  saveState(state);
  return { ...bonus };
}

// 23. Cumulative rewards across all missions
export function getTotalRewardsEarned(): Record<RewardType, number> {
  const state = initMissionSystem();
  return { ...state.rewardsEarned };
}

// 24. Percentage of accepted missions completed
export function getMissionSuccessRate(): number {
  const state = initMissionSystem();
  const all = Object.values(state.missions);
  const completed = all.filter(
    (m) => m.status === 'completed' || m.status === 'claimed',
  ).length;
  const claimed = all.filter((m) => m.status === 'claimed').length;
  const active = all.filter((m) => m.status === 'active').length;
  const everAccepted = completed + active;
  if (everAccepted === 0) return 0;
  return Math.round((completed / everAccepted) * 10000) / 100;
}

// 25. Category with most completions
export function getMostCompletedCategory(): {
  category: MissionCategory;
  count: number;
  icon: string;
  color: string;
  label: string;
} | null {
  const state = initMissionSystem();
  let best: MissionCategory = 'exploration';
  let bestCount = 0;

  for (const cat of Object.keys(state.categoryCompletions) as MissionCategory[]) {
    const cnt = state.categoryCompletions[cat];
    if (cnt > bestCount) {
      bestCount = cnt;
      best = cat;
    }
  }

  if (bestCount === 0) return null;

  const cfg = CATEGORY_CONFIG[best];
  return {
    category: best,
    count: bestCount,
    icon: cfg.icon,
    color: cfg.color,
    label: cfg.label,
  };
}

// 26. Consecutive days completing at least 1 mission
export function getStreakData(): {
  currentStreak: number;
  bestStreak: number;
  lastCompletionDate: string;
  isActive: boolean;
} {
  const state = initMissionSystem();
  const today = dayKey();
  const yesterday = new Date(Date.now() - DAY_MS);
  const yKey = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
  const isActive =
    state.streakData.lastCompletionDate === today ||
    state.streakData.lastCompletionDate === yKey;

  return {
    currentStreak: state.streakData.currentStreak,
    bestStreak: state.streakData.bestStreak,
    lastCompletionDate: state.streakData.lastCompletionDate,
    isActive,
  };
}

// 27. Recent mission completions
export function getMissionHistory(
  count: number = 10,
): Array<{
  missionId: string;
  title: string;
  category: MissionCategory;
  completedAt: number;
  rewards: MissionReward[];
}> {
  const state = initMissionSystem();
  return state.history.slice(0, Math.max(1, count)).map((h) => ({ ...h }));
}

// 28. Regenerate today's daily missions
export function refreshDailyMissions(): Mission[] {
  const state = initMissionSystem();
  refreshDailyMissionsInternal(state);
  state.lastDailyRefresh = startOfDay();
  state.dailySeed = simpleHash(dayKey());
  saveState(state);
  return getDailyMissions();
}

// 29. Suggest missions based on play style
export function getRecommendedMissions(count: number = 3): Mission[] {
  const state = initMissionSystem();
  const available = Object.values(state.missions).filter(
    (m) => m.status === 'available',
  );

  if (available.length === 0) return [];

  // Score missions based on player's implicit play style from global counters
  const scored = available.map((m) => {
    let score = 0;

    // Players with many games → prefer exploration/combat missions
    if (state.totalGamesPlayed > 20) {
      if (m.category === 'combat' || m.category === 'exploration') score += 2;
    }

    // Players who eat many words → collection missions
    if (state.totalWordsEaten > 100) {
      if (m.category === 'collection') score += 2;
    }

    // Players with high scores → harder combat missions
    if (state.totalScoreEarned > 5000) {
      if (m.category === 'combat') score += 1;
    }

    // Players with achievements → mastery missions
    if (state.achievementsUnlocked > 5) {
      if (m.category === 'mastery') score += 2;
    }

    // Players who invite friends → social missions
    if (state.friendsInvited > 0) {
      if (m.category === 'social') score += 1;
    }

    // Prefer easier missions for new players
    if (state.totalGamesPlayed < 10) {
      if (m.difficulty === 'easy') score += 3;
      if (m.difficulty === 'legendary') score -= 2;
    }

    // Slight randomness for variety
    score += Math.random() * 2;

    return { mission: m, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.max(1, count)).map((s) => ({ ...s.mission }));
}

// 30. Single-call payload for panel
export function getMissionOverview(): {
  stats: ReturnType<typeof getMissionStats>;
  activeMissions: Mission[];
  dailyMissions: Mission[];
  weeklyMissions: Mission[];
  chains: MissionChain[];
  streak: ReturnType<typeof getStreakData>;
  categoryProgress: ReturnType<typeof getCategoryProgress>;
  rewardSummary: ReturnType<typeof getRewardSummary>;
  activeSlots: ReturnType<typeof getActiveMissionSlots>;
} {
  return {
    stats: getMissionStats(),
    activeMissions: getActiveMissions(),
    dailyMissions: getDailyMissions(),
    weeklyMissions: getWeeklyMissions(),
    chains: getMissionChains(),
    streak: getStreakData(),
    categoryProgress: getCategoryProgress(),
    rewardSummary: getRewardSummary(),
    activeSlots: getActiveMissionSlots(),
  };
}

// 31. Single mission card data
export function getMissionCard(missionId: string): {
  mission: Mission | null;
  progress: MissionProgress | null;
  rewards: MissionReward[];
  chainInfo: { chainId: string; order: number; total: number } | null;
} {
  const state = initMissionSystem();
  const mission = state.missions[missionId];
  if (!mission) {
    return { mission: null, progress: null, rewards: [], chainInfo: null };
  }

  const progress: MissionProgress = {
    missionId: mission.id,
    current: mission.progress,
    target: mission.target,
    percentage:
      mission.target > 0
        ? Math.round((mission.progress / mission.target) * 10000) / 100
        : 0,
    isComplete: mission.status === 'completed' || mission.status === 'claimed',
    bonusObjectives: mission.bonusObjectives.map((b) => ({ ...b })),
  };

  let chainInfo: { chainId: string; order: number; total: number } | null = null;
  if (mission.chainId) {
    const chain = state.chains[mission.chainId];
    if (chain) {
      chainInfo = {
        chainId: chain.id,
        order: mission.orderInChain + 1,
        total: chain.totalMissions,
      };
    }
  }

  return {
    mission: { ...mission },
    progress,
    rewards: [...mission.rewards],
    chainInfo,
  };
}

// 32. Completion progress per category
export function getCategoryProgress(): Array<{
  category: MissionCategory;
  icon: string;
  color: string;
  label: string;
  total: number;
  completed: number;
  percentage: number;
}> {
  const state = initMissionSystem();
  const result: Array<{
    category: MissionCategory;
    icon: string;
    color: string;
    label: string;
    total: number;
    completed: number;
    percentage: number;
  }> = [];

  for (const cat of Object.keys(CATEGORY_CONFIG) as MissionCategory[]) {
    const cfg = CATEGORY_CONFIG[cat];
    const total = Object.values(state.missions).filter(
      (m) => m.category === cat,
    ).length;
    const completed = state.categoryCompletions[cat] || 0;
    result.push({
      category: cat,
      icon: cfg.icon,
      color: cfg.color,
      label: cfg.label,
      total,
      completed: Math.min(completed, total),
      percentage:
        total > 0
          ? Math.round((Math.min(completed, total) / total) * 10000) / 100
          : 0,
    });
  }

  return result;
}

// 33. Active slot usage info
export function getActiveMissionSlots(): {
  used: number;
  max: number;
  available: number;
  missions: Array<{ missionId: string; title: string; percentage: number }>;
} {
  const active = getActiveMissions();
  return {
    used: active.length,
    max: MAX_ACTIVE_MISSIONS,
    available: MAX_ACTIVE_MISSIONS - active.length,
    missions: active.map((m) => ({
      missionId: m.id,
      title: m.title,
      percentage:
        m.target > 0
          ? Math.round((m.progress / m.target) * 10000) / 100
          : 0,
    })),
  };
}

// 34. All earned rewards summary
export function getRewardSummary(): {
  totalCoins: number;
  totalGems: number;
  totalXP: number;
  titles: number;
  skins: number;
  powerups: number;
  formatted: Array<{ type: RewardType; amount: number; label: string }>;
} {
  const earned = getTotalRewardsEarned();
  const formatted: Array<{ type: RewardType; amount: number; label: string }> = [
    { type: 'coins', amount: earned.coins, label: `${earned.coins} Coins` },
    { type: 'gems', amount: earned.gems, label: `${earned.gems} Gems` },
    { type: 'xp', amount: earned.xp, label: `${earned.xp} XP` },
    { type: 'title', amount: earned.title, label: `${earned.title} Titles` },
    { type: 'skin', amount: earned.skin, label: `${earned.skin} Skins` },
    { type: 'powerup', amount: earned.powerup, label: `${earned.powerup} Powerups` },
  ];

  return {
    totalCoins: earned.coins,
    totalGems: earned.gems,
    totalXP: earned.xp,
    titles: earned.title,
    skins: earned.skin,
    powerups: earned.powerup,
    formatted,
  };
}

// 35. Mission activity timeline
export function getMissionTimeline(): Array<{
  timestamp: number;
  type: 'accepted' | 'completed' | 'claimed' | 'cancelled';
  missionId: string;
  title: string;
  category: MissionCategory;
  icon: string;
  color: string;
}> {
  const state = initMissionSystem();
  const timeline: Array<{
    timestamp: number;
    type: 'accepted' | 'completed' | 'claimed' | 'cancelled';
    missionId: string;
    title: string;
    category: MissionCategory;
    icon: string;
    color: string;
  }> = [];

  for (const m of Object.values(state.missions)) {
    if (m.acceptedAt && m.status !== 'available') {
      timeline.push({
        timestamp: m.acceptedAt,
        type: 'accepted',
        missionId: m.id,
        title: m.title,
        category: m.category,
        icon: m.icon,
        color: m.color,
      });
    }
    if (m.completedAt) {
      timeline.push({
        timestamp: m.completedAt,
        type: 'completed',
        missionId: m.id,
        title: m.title,
        category: m.category,
        icon: m.icon,
        color: m.color,
      });
    }
    if (m.claimedAt) {
      timeline.push({
        timestamp: m.claimedAt,
        type: 'claimed',
        missionId: m.id,
        title: m.title,
        category: m.category,
        icon: m.icon,
        color: m.color,
      });
    }
  }

  // Sort by timestamp descending (most recent first)
  timeline.sort((a, b) => b.timestamp - a.timestamp);
  return timeline.slice(0, 50);
}
