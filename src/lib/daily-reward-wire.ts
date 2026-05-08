// =============================================================================
// Daily Reward System Wire — Word Snake Game
// =============================================================================
// Complete standalone daily-reward module with login streaks, daily quests,
// weekly chests, monthly milestones, reward inventory, and UI helpers.
// Persistence via localStorage under key "ws_daily_reward_wire".
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  rewardType: "coins" | "gems" | "xp" | "powerup";
  completed: boolean;
  claimed: boolean;
}

export interface WeeklyChest {
  day: number; // 1-7
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  reward: number;
  rewardType: string;
  claimed: boolean;
}

export interface MonthlyTier {
  tier: number;
  name: string;
  target: number;
  reward: number;
  rewardType: string;
  current: number;
  claimed: boolean;
}

export interface RewardItem {
  id: string;
  type: string;
  amount: number;
  source: string;
  claimedAt: string;
}

export interface DailyRewardState {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string;
  streakMilestonesClaimed: number[];
  questsDate: string;
  quests: DailyQuest[];
  weeklyStartDate: string;
  weeklyChests: WeeklyChest[];
  month: string;
  monthlyProgress: number;
  monthlyTiersClaimed: number[];
  unclaimedRewards: RewardItem[];
  rewardHistory: RewardItem[];
  hasNotification: boolean;
  totalQuestsCompleted: number;
  totalRewardsClaimed: number;
  bestQuestDay: string;
  bestQuestCount: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "ws_daily_reward_wire";

const STREAK_MILESTONES: Record<number, { reward: number; rewardType: string; label: string }> = {
  3:  { reward: 100, rewardType: "coins",   label: "Day 3 Streak Bonus" },
  7:  { reward: 50,  rewardType: "gems",    label: "Day 7 Streak Bonus" },
  14: { reward: 200, rewardType: "xp",      label: "Day 14 Streak Bonus" },
  21: { reward: 100, rewardType: "gems",    label: "Day 21 Streak Bonus" },
  30: { reward: 500, rewardType: "coins",   label: "Day 30 Mega Bonus" },
};

const WEEKLY_CHEST_TEMPLATES: WeeklyChest[] = [
  { day: 1, rarity: "Common",    reward: 50,  rewardType: "coins",   claimed: false },
  { day: 2, rarity: "Common",    reward: 75,  rewardType: "coins",   claimed: false },
  { day: 3, rarity: "Uncommon",  reward: 100, rewardType: "coins",   claimed: false },
  { day: 4, rarity: "Uncommon",  reward: 25,  rewardType: "gems",    claimed: false },
  { day: 5, rarity: "Rare",      reward: 50,  rewardType: "gems",    claimed: false },
  { day: 6, rarity: "Epic",      reward: 100, rewardType: "gems",    claimed: false },
  { day: 7, rarity: "Legendary", reward: 200, rewardType: "gems",    claimed: false },
];

const MONTHLY_TIER_DEFS: { tier: number; name: string; target: number; reward: number; rewardType: string }[] = [
  { tier: 1, name: "Bronze",   target: 500,  reward: 200, rewardType: "coins" },
  { tier: 2, name: "Silver",   target: 1000, reward: 100, rewardType: "gems" },
  { tier: 3, name: "Gold",     target: 2500, reward: 300, rewardType: "coins" },
  { tier: 4, name: "Platinum", target: 5000, reward: 200, rewardType: "gems" },
];

const QUEST_TEMPLATES = [
  {
    id: "play_games",
    title: "Play Games",
    description: "Play {n} games today",
    minTarget: 3,
    maxTarget: 5,
    reward: 50,
    rewardType: "coins" as const,
  },
  {
    id: "eat_words",
    title: "Word Eater",
    description: "Eat {n} words today",
    minTarget: 10,
    maxTarget: 30,
    reward: 60,
    rewardType: "coins" as const,
  },
  {
    id: "score_points",
    title: "High Scorer",
    description: "Score {n} points today",
    minTarget: 500,
    maxTarget: 2000,
    reward: 75,
    rewardType: "xp" as const,
  },
  {
    id: "use_powerups",
    title: "Power User",
    description: "Use {n} powerups today",
    minTarget: 2,
    maxTarget: 5,
    reward: 40,
    rewardType: "gems" as const,
  },
  {
    id: "play_minutes",
    title: "Dedicated Player",
    description: "Play for {n} minutes today",
    minTarget: 10,
    maxTarget: 30,
    reward: 55,
    rewardType: "coins" as const,
  },
  {
    id: "long_words",
    title: "Word Master",
    description: "Eat {n} words with 5+ letters",
    minTarget: 5,
    maxTarget: 15,
    reward: 80,
    rewardType: "xp" as const,
  },
  {
    id: "combo_hits",
    title: "Combo King",
    description: "Achieve {n} combos in a single game",
    minTarget: 3,
    maxTarget: 10,
    reward: 65,
    rewardType: "gems" as const,
  },
  {
    id: "survive_minutes",
    title: "Survivor",
    description: "Survive {n} minutes in a single game",
    minTarget: 3,
    maxTarget: 8,
    reward: 70,
    rewardType: "xp" as const,
  },
];

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isBrowser(): boolean {
  return typeof globalThis.window !== "undefined";
}

function loadState(): DailyRewardState {
  if (!isBrowser()) {
    return getDefaultState();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DailyRewardState>;
      return { ...getDefaultState(), ...parsed };
    }
  } catch {
    // Corrupted data — fall back to defaults
  }
  return getDefaultState();
}

function saveState(state: DailyRewardState): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

function getDefaultState(): DailyRewardState {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastLoginDate: "",
    streakMilestonesClaimed: [],
    questsDate: "",
    quests: [],
    weeklyStartDate: "",
    weeklyChests: [],
    month: "",
    monthlyProgress: 0,
    monthlyTiersClaimed: [],
    unclaimedRewards: [],
    rewardHistory: [],
    hasNotification: false,
    totalQuestsCompleted: 0,
    totalRewardsClaimed: 0,
    bestQuestDay: "",
    bestQuestCount: 0,
  };
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function weekStartISO(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  return monday.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  const ms = db.getTime() - da.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/** Simple seeded pseudo-random number generator based on a string seed. */
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  let s = h >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function monthISO(): string {
  return new Date().toISOString().slice(0, 7);
}

// ---------------------------------------------------------------------------
// 1. initDailyRewards
// ---------------------------------------------------------------------------

export function initDailyRewards(): DailyRewardState {
  const existing = loadState();
  const state = { ...getDefaultState(), ...existing };

  // Ensure weekly chests are initialized for the current week
  if (state.weeklyStartDate !== weekStartISO()) {
    state.weeklyStartDate = weekStartISO();
    state.weeklyChests = WEEKLY_CHEST_TEMPLATES.map((c) => ({ ...c }));
  }

  // Ensure monthly progress is tracked for the current month
  if (state.month !== monthISO()) {
    state.month = monthISO();
    state.monthlyProgress = 0;
    state.monthlyTiersClaimed = [];
  }

  saveState(state);
  return state;
}

// ---------------------------------------------------------------------------
// 2. checkDailyLogin
// ---------------------------------------------------------------------------

export function checkDailyLogin(): { streakExtended: boolean; newRewards: RewardItem[] } {
  const state = loadState();
  const today = todayISO();
  const newRewards: RewardItem[] = [];

  // Already logged in today
  if (state.lastLoginDate === today) {
    return { streakExtended: false, newRewards };
  }

  const diff = state.lastLoginDate ? daysBetween(state.lastLoginDate, today) : 999;

  if (diff === 1) {
    // Consecutive day — extend streak
    state.currentStreak += 1;
  } else if (diff > 1) {
    // Streak broken
    state.currentStreak = 1;
  } else {
    // First login ever
    state.currentStreak = 1;
  }

  if (state.currentStreak > state.longestStreak) {
    state.longestStreak = state.currentStreak;
  }

  state.lastLoginDate = today;

  // Generate daily login reward
  const loginReward = 20 + Math.min(state.currentStreak * 5, 100);
  const rewardItem: RewardItem = {
    id: generateId(),
    type: "coins",
    amount: loginReward,
    source: `Daily Login (Day ${state.currentStreak})`,
    claimedAt: today,
  };
  state.unclaimedRewards.push(rewardItem);
  state.rewardHistory.push(rewardItem);
  newRewards.push(rewardItem);

  // Check for streak milestone eligibility
  for (const day of Object.keys(STREAK_MILESTONES)) {
    const milestoneDay = Number(day);
    if (state.currentStreak >= milestoneDay && !state.streakMilestonesClaimed.includes(milestoneDay)) {
      const milestone = STREAK_MILESTONES[milestoneDay];
      const milestoneReward: RewardItem = {
        id: generateId(),
        type: milestone.rewardType,
        amount: milestone.reward,
        source: milestone.label,
        claimedAt: today,
      };
      state.unclaimedRewards.push(milestoneReward);
      state.rewardHistory.push(milestoneReward);
      newRewards.push(milestoneReward);
    }
  }

  // Reset quests if the day changed
  if (state.questsDate !== today) {
    state.quests = generateDailyQuests();
    state.questsDate = today;
  }

  // Refresh weekly chests for the new week
  if (state.weeklyStartDate !== weekStartISO()) {
    state.weeklyStartDate = weekStartISO();
    state.weeklyChests = WEEKLY_CHEST_TEMPLATES.map((c) => ({ ...c }));
  }

  // Reset monthly progress if month changed
  if (state.month !== monthISO()) {
    state.month = monthISO();
    state.monthlyProgress = 0;
    state.monthlyTiersClaimed = [];
  }

  state.hasNotification = state.unclaimedRewards.length > 0;
  saveState(state);
  return { streakExtended: diff === 1, newRewards };
}

// ---------------------------------------------------------------------------
// 3. getLoginStreak
// ---------------------------------------------------------------------------

export function getLoginStreak(): number {
  return loadState().currentStreak;
}

// ---------------------------------------------------------------------------
// 4. getLongestStreak
// ---------------------------------------------------------------------------

export function getLongestStreak(): number {
  return loadState().longestStreak;
}

// ---------------------------------------------------------------------------
// 5. getStreakRewards
// ---------------------------------------------------------------------------

export function getStreakRewards(): { day: number; reward: number; rewardType: string; label: string; claimed: boolean }[] {
  const state = loadState();
  return Object.entries(STREAK_MILESTONES).map(([day, info]) => ({
    day: Number(day),
    reward: info.reward,
    rewardType: info.rewardType,
    label: info.label,
    claimed: state.streakMilestonesClaimed.includes(Number(day)),
  }));
}

// ---------------------------------------------------------------------------
// 6. claimStreakReward
// ---------------------------------------------------------------------------

export function claimStreakReward(day: number): { success: boolean; reward?: RewardItem } {
  const milestone = STREAK_MILESTONES[day];
  if (!milestone) return { success: false };

  const state = loadState();
  if (state.streakMilestonesClaimed.includes(day)) return { success: false };
  if (state.currentStreak < day) return { success: false };

  state.streakMilestonesClaimed.push(day);

  const reward: RewardItem = {
    id: generateId(),
    type: milestone.rewardType,
    amount: milestone.reward,
    source: milestone.label,
    claimedAt: new Date().toISOString(),
  };

  state.unclaimedRewards.push(reward);
  state.rewardHistory.push(reward);
  state.totalRewardsClaimed += 1;
  state.hasNotification = true;
  saveState(state);

  return { success: true, reward };
}

// ---------------------------------------------------------------------------
// 7. getDailyQuests
// ---------------------------------------------------------------------------

export function getDailyQuests(): DailyQuest[] {
  const state = loadState();
  const today = todayISO();

  if (state.questsDate !== today) {
    const quests = generateDailyQuests();
    const updated = { ...state, quests, questsDate: today };
    saveState(updated);
    return quests;
  }

  return state.quests;
}

// ---------------------------------------------------------------------------
// 8. updateQuestProgress
// ---------------------------------------------------------------------------

export function updateQuestProgress(questId: string, amount: number): DailyQuest | null {
  const state = loadState();
  const today = todayISO();

  // Ensure quests are fresh
  if (state.questsDate !== today) {
    state.quests = generateDailyQuests();
    state.questsDate = today;
  }

  const quest = state.quests.find((q) => q.id === questId);
  if (!quest) return null;
  if (quest.completed) return quest;

  quest.current = Math.min(quest.current + amount, quest.target);

  if (quest.current >= quest.target) {
    quest.completed = true;
  }

  saveState(state);
  return quest;
}

// ---------------------------------------------------------------------------
// 9. completeQuest
// ---------------------------------------------------------------------------

export function completeQuest(questId: string): { success: boolean; quest?: DailyQuest } {
  const state = loadState();
  const quest = state.quests.find((q) => q.id === questId);
  if (!quest) return { success: false };

  quest.completed = true;
  quest.current = quest.target;

  const reward: RewardItem = {
    id: generateId(),
    type: quest.rewardType,
    amount: quest.reward,
    source: `Quest: ${quest.title}`,
    claimedAt: new Date().toISOString(),
  };

  state.unclaimedRewards.push(reward);
  state.rewardHistory.push(reward);
  state.hasNotification = true;

  saveState(state);
  return { success: true, quest };
}

// ---------------------------------------------------------------------------
// 10. claimQuestReward
// ---------------------------------------------------------------------------

export function claimQuestReward(questId: string): { success: boolean; reward?: RewardItem } {
  const state = loadState();
  const quest = state.quests.find((q) => q.id === questId);
  if (!quest) return { success: false };
  if (!quest.completed) return { success: false };
  if (quest.claimed) return { success: false };

  quest.claimed = true;
  state.totalRewardsClaimed += 1;

  // Track quest completion stats
  state.totalQuestsCompleted += 1;
  const today = todayISO();
  const todaysCompleted = state.quests.filter((q) => q.claimed).length;
  if (todaysCompleted > state.bestQuestCount) {
    state.bestQuestCount = todaysCompleted;
    state.bestQuestDay = today;
  }

  // Remove corresponding unclaimed reward
  const rewardIdx = state.unclaimedRewards.findIndex(
    (r) => r.source === `Quest: ${quest.title}` && r.type === quest.rewardType
  );
  if (rewardIdx !== -1) {
    const claimed = state.unclaimedRewards.splice(rewardIdx, 1)[0];
    saveState(state);
    return { success: true, reward: claimed };
  }

  saveState(state);
  return { success: true, reward: { id: generateId(), type: quest.rewardType, amount: quest.reward, source: `Quest: ${quest.title}`, claimedAt: new Date().toISOString() } };
}

// ---------------------------------------------------------------------------
// 11. getWeeklyCalendar
// ---------------------------------------------------------------------------

export function getWeeklyCalendar(): WeeklyChest[] {
  const state = loadState();
  const currentWeekStart = weekStartISO();

  if (state.weeklyStartDate !== currentWeekStart) {
    const chests = WEEKLY_CHEST_TEMPLATES.map((c) => ({ ...c }));
    const updated = { ...state, weeklyStartDate: currentWeekStart, weeklyChests: chests };
    saveState(updated);
    return chests;
  }

  return state.weeklyChests;
}

// ---------------------------------------------------------------------------
// 12. claimWeeklyChest
// ---------------------------------------------------------------------------

export function claimWeeklyChest(day: number): { success: boolean; reward?: RewardItem } {
  if (day < 1 || day > 7) return { success: false };

  const state = loadState();
  const currentWeekStart = weekStartISO();

  if (state.weeklyStartDate !== currentWeekStart) {
    state.weeklyStartDate = currentWeekStart;
    state.weeklyChests = WEEKLY_CHEST_TEMPLATES.map((c) => ({ ...c }));
  }

  const chestIdx = day - 1;
  if (chestIdx < 0 || chestIdx >= state.weeklyChests.length) return { success: false };
  const chest = state.weeklyChests[chestIdx];
  if (chest.claimed) return { success: false };

  // Can only claim today's chest or any prior unclaimed chest (allow catch-up)
  const dayOfWeek = new Date().getDay();
  const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday=0
  if (day - 1 > todayIndex) return { success: false };

  chest.claimed = true;

  const reward: RewardItem = {
    id: generateId(),
    type: chest.rewardType,
    amount: chest.reward,
    source: `Weekly Chest Day ${day} (${chest.rarity})`,
    claimedAt: new Date().toISOString(),
  };

  state.unclaimedRewards.push(reward);
  state.rewardHistory.push(reward);
  state.totalRewardsClaimed += 1;
  state.hasNotification = true;
  saveState(state);

  return { success: true, reward };
}

// ---------------------------------------------------------------------------
// 13. getWeeklyProgress
// ---------------------------------------------------------------------------

export function getWeeklyProgress(): { claimed: number; total: number; percentage: number } {
  const calendar = getWeeklyCalendar();
  const claimed = calendar.filter((c) => c.claimed).length;
  return {
    claimed,
    total: 7,
    percentage: Math.round((claimed / 7) * 100),
  };
}

// ---------------------------------------------------------------------------
// 14. getMonthlyMilestone
// ---------------------------------------------------------------------------

export function getMonthlyMilestone(): MonthlyTier[] {
  const state = loadState();
  const currentMonth = monthISO();

  if (state.month !== currentMonth) {
    const updated = { ...state, month: currentMonth, monthlyProgress: 0, monthlyTiersClaimed: [] };
    saveState(updated);
  }

  return MONTHLY_TIER_DEFS.map((def) => ({
    tier: def.tier,
    name: def.name,
    target: def.target,
    reward: def.reward,
    rewardType: def.rewardType,
    current: state.monthlyProgress,
    claimed: state.monthlyTiersClaimed.includes(def.tier),
  }));
}

// ---------------------------------------------------------------------------
// 15. addMonthlyProgress
// ---------------------------------------------------------------------------

export function addMonthlyProgress(amount: number): { newTotal: number; newTiersUnlocked: number[] } {
  const state = loadState();
  const currentMonth = monthISO();

  if (state.month !== currentMonth) {
    state.month = currentMonth;
    state.monthlyProgress = 0;
    state.monthlyTiersClaimed = [];
  }

  state.monthlyProgress += amount;
  const newTiersUnlocked: number[] = [];

  for (const def of MONTHLY_TIER_DEFS) {
    if (
      state.monthlyProgress >= def.target &&
      !state.monthlyTiersClaimed.includes(def.tier)
    ) {
      state.monthlyTiersClaimed.push(def.tier);
      newTiersUnlocked.push(def.tier);

      const reward: RewardItem = {
        id: generateId(),
        type: def.rewardType,
        amount: def.reward,
        source: `Monthly Milestone: ${def.name}`,
        claimedAt: new Date().toISOString(),
      };
      state.unclaimedRewards.push(reward);
      state.rewardHistory.push(reward);
      state.hasNotification = true;
    }
  }

  saveState(state);
  return { newTotal: state.monthlyProgress, newTiersUnlocked };
}

// ---------------------------------------------------------------------------
// 16. claimMonthlyReward
// ---------------------------------------------------------------------------

export function claimMonthlyReward(tier: number): { success: boolean; reward?: RewardItem } {
  const def = MONTHLY_TIER_DEFS.find((d) => d.tier === tier);
  if (!def) return { success: false };

  const state = loadState();
  if (!state.monthlyTiersClaimed.includes(tier)) return { success: false };

  // Find and remove from unclaimed
  const idx = state.unclaimedRewards.findIndex(
    (r) => r.source === `Monthly Milestone: ${def.name}` && r.type === def.rewardType
  );
  if (idx === -1) return { success: false };

  const reward = state.unclaimedRewards.splice(idx, 1)[0];
  state.totalRewardsClaimed += 1;
  saveState(state);

  return { success: true, reward };
}

// ---------------------------------------------------------------------------
// 17. getUnclaimedRewards
// ---------------------------------------------------------------------------

export function getUnclaimedRewards(): RewardItem[] {
  return loadState().unclaimedRewards;
}

// ---------------------------------------------------------------------------
// 18. claimAllRewards
// ---------------------------------------------------------------------------

export function claimAllRewards(): { claimed: RewardItem[]; total: number } {
  const state = loadState();
  const claimed = [...state.unclaimedRewards];
  const total = claimed.reduce((sum, r) => sum + r.amount, 0);

  state.totalRewardsClaimed += claimed.length;
  state.unclaimedRewards = [];
  state.hasNotification = false;
  saveState(state);

  return { claimed, total };
}

// ---------------------------------------------------------------------------
// 19. getRewardHistory
// ---------------------------------------------------------------------------

export function getRewardHistory(limit?: number): RewardItem[] {
  const history = loadState().rewardHistory;
  if (limit !== undefined && limit > 0) {
    return history.slice(-limit).reverse();
  }
  return [...history].reverse();
}

// ---------------------------------------------------------------------------
// 20. getRewardStats
// ---------------------------------------------------------------------------

export function getRewardStats(): {
  totalClaimed: number;
  currentStreak: number;
  longestStreak: number;
  totalQuestsCompleted: number;
  questCompletionRate: number;
  unclaimedCount: number;
  weeklyProgress: { claimed: number; total: number };
  monthlyProgress: number;
  bestQuestDay: string;
  bestQuestCount: number;
} {
  const state = loadState();
  const quests = getDailyQuests();
  const completedQuests = quests.filter((q) => q.completed).length;
  const totalQuests = quests.length;
  const wp = getWeeklyProgress();

  return {
    totalClaimed: state.totalRewardsClaimed,
    currentStreak: state.currentStreak,
    longestStreak: state.longestStreak,
    totalQuestsCompleted: state.totalQuestsCompleted,
    questCompletionRate: totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0,
    unclaimedCount: state.unclaimedRewards.length,
    weeklyProgress: { claimed: wp.claimed, total: wp.total },
    monthlyProgress: state.monthlyProgress,
    bestQuestDay: state.bestQuestDay,
    bestQuestCount: state.bestQuestCount,
  };
}

// ---------------------------------------------------------------------------
// 21. getNotification
// ---------------------------------------------------------------------------

export function getNotification(): { hasNotification: boolean; count: number } {
  const state = loadState();
  // Dynamically check for claimable rewards (even if hasNotification is stale)
  const count = state.unclaimedRewards.length;
  const hasNotification = count > 0;
  return { hasNotification, count };
}

// ---------------------------------------------------------------------------
// 22. dismissNotification
// ---------------------------------------------------------------------------

export function dismissNotification(): void {
  const state = loadState();
  state.hasNotification = false;
  saveState(state);
}

// ---------------------------------------------------------------------------
// 23. getStreakBonus
// ---------------------------------------------------------------------------

export function getStreakBonus(): { multiplier: number; description: string } {
  const streak = getLoginStreak();

  let multiplier = 1.0;
  let description = "No streak bonus";

  if (streak >= 30) {
    multiplier = 2.0;
    description = "🔥🔥🔥 Legendary 2x Streak Bonus";
  } else if (streak >= 21) {
    multiplier = 1.75;
    description = "🔥🔥 Epic 1.75x Streak Bonus";
  } else if (streak >= 14) {
    multiplier = 1.5;
    description = "🔥🔥 Rare 1.5x Streak Bonus";
  } else if (streak >= 7) {
    multiplier = 1.3;
    description = "🔥 Uncommon 1.3x Streak Bonus";
  } else if (streak >= 3) {
    multiplier = 1.15;
    description = "🔥 Common 1.15x Streak Bonus";
  }

  return { multiplier, description };
}

// ---------------------------------------------------------------------------
// 24. isStreakActive
// ---------------------------------------------------------------------------

export function isStreakActive(): boolean {
  const state = loadState();
  return state.lastLoginDate === todayISO();
}

// ---------------------------------------------------------------------------
// 25. getQuestCompletionRate
// ---------------------------------------------------------------------------

export function getQuestCompletionRate(): { completed: number; total: number; percentage: number } {
  const quests = getDailyQuests();
  const completed = quests.filter((q) => q.completed).length;
  return {
    completed,
    total: quests.length,
    percentage: quests.length > 0 ? Math.round((completed / quests.length) * 100) : 0,
  };
}

// ---------------------------------------------------------------------------
// 26. getBestQuestDay
// ---------------------------------------------------------------------------

export function getBestQuestDay(): { date: string; count: number } {
  const state = loadState();
  return {
    date: state.bestQuestDay || "N/A",
    count: state.bestQuestCount,
  };
}

// ---------------------------------------------------------------------------
// 27. getRewardCalendar
// ---------------------------------------------------------------------------

export function getRewardCalendar(): { date: string; count: number; details: string }[] {
  const state = loadState();
  const calendar: { date: string; count: number; details: string }[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayRewards = state.rewardHistory.filter((r) => r.claimedAt.startsWith(dateStr));
    const count = dayRewards.length;
    const typesSet = new Set(dayRewards.map((r) => r.type));
    const types = Array.from(typesSet).join(", ");
    const totalAmount = dayRewards.reduce((s, r) => s + r.amount, 0);

    calendar.push({
      date: dateStr,
      count,
      details: count > 0 ? `${totalAmount} ${types}` : "No rewards",
    });
  }

  return calendar;
}

// ---------------------------------------------------------------------------
// 28. getDailyRewardSummary
// ---------------------------------------------------------------------------

export function getDailyRewardSummary(): {
  streakBonus: { multiplier: number; description: string; streak: number };
  activeQuests: { total: number; completed: number; unclaimed: number };
  availableChest: { available: boolean; day: number; rarity: string };
  unclaimedCount: number;
} {
  const streak = getLoginStreak();
  const bonus = getStreakBonus();
  const quests = getDailyQuests();
  const completedQuests = quests.filter((q) => q.completed).length;
  const unclaimedQuests = quests.filter((q) => q.completed && !q.claimed).length;
  const calendar = getWeeklyCalendar();

  const dayOfWeek = new Date().getDay();
  const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const todaysChest = calendar[todayIdx] || null;
  const availableChest = {
    available: todaysChest !== null && !todaysChest.claimed,
    day: todayIdx + 1,
    rarity: todaysChest?.rarity || "None",
  };

  return {
    streakBonus: { multiplier: bonus.multiplier, description: bonus.description, streak },
    activeQuests: { total: quests.length, completed: completedQuests, unclaimed: unclaimedQuests },
    availableChest,
    unclaimedCount: loadState().unclaimedRewards.length,
  };
}

// ---------------------------------------------------------------------------
// 29. getWeeklySummary
// ---------------------------------------------------------------------------

export function getWeeklySummary(): {
  weekStart: string;
  chestsClaimed: number;
  totalChests: number;
  weeklyProgress: number;
  nextChest: { day: number; rarity: string; canClaim: boolean };
  totalRewardsEarned: number;
} {
  const state = loadState();
  const calendar = getWeeklyCalendar();
  const claimed = calendar.filter((c) => c.claimed).length;

  // Find next unclaimed chest
  const dayOfWeek = new Date().getDay();
  const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  let nextChest = { day: 0, rarity: "None", canClaim: false };

  for (let i = 0; i <= todayIdx && i < calendar.length; i++) {
    if (!calendar[i].claimed) {
      nextChest = { day: calendar[i].day, rarity: calendar[i].rarity, canClaim: true };
      break;
    }
  }

  // Calculate total rewards earned this week from chests
  const weekStart = weekStartISO();
  const weekRewards = state.rewardHistory.filter(
    (r) => r.source.includes("Weekly Chest") && r.claimedAt >= weekStart
  );
  const totalRewardsEarned = weekRewards.reduce((sum, r) => sum + r.amount, 0);

  return {
    weekStart,
    chestsClaimed: claimed,
    totalChests: 7,
    weeklyProgress: Math.round((claimed / 7) * 100),
    nextChest,
    totalRewardsEarned,
  };
}

// ---------------------------------------------------------------------------
// 30. getMonthlySummary
// ---------------------------------------------------------------------------

export function getMonthlySummary(): {
  month: string;
  progress: number;
  tiers: { tier: number; name: string; target: number; current: number; claimed: boolean; progress: number }[];
  nextTier: { tier: number; name: string; remaining: number } | null;
  totalClaimed: number;
} {
  const state = loadState();
  const currentMonth = monthISO();
  const milestones = getMonthlyMilestone();

  const tiers = milestones.map((m) => ({
    tier: m.tier,
    name: m.name,
    target: m.target,
    current: state.monthlyProgress,
    claimed: m.claimed,
    progress: Math.min(100, Math.round((state.monthlyProgress / m.target) * 100)),
  }));

  const nextTierDef = MONTHLY_TIER_DEFS.find(
    (d) => !state.monthlyTiersClaimed.includes(d.tier)
  );

  const nextTier = nextTierDef
    ? {
        tier: nextTierDef.tier,
        name: nextTierDef.name,
        remaining: Math.max(0, nextTierDef.target - state.monthlyProgress),
      }
    : null;

  return {
    month: currentMonth,
    progress: state.monthlyProgress,
    tiers,
    nextTier,
    totalClaimed: state.monthlyTiersClaimed.length,
  };
}

// ---------------------------------------------------------------------------
// 31. generateDailyQuests
// ---------------------------------------------------------------------------

export function generateDailyQuests(): DailyQuest[] {
  const today = todayISO();
  const rng = seededRandom(today);

  // Pick 5 unique quests from templates, shuffling each day
  const shuffled = [...QUEST_TEMPLATES];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selected = shuffled.slice(0, 5);

  return selected.map((tpl, index) => {
    const range = tpl.maxTarget - tpl.minTarget;
    const target = tpl.minTarget + Math.floor(rng() * (range + 1));
    // Scale reward slightly based on target difficulty
    const difficultyScale = 1 + (target - tpl.minTarget) / (range || 1) * 0.5;
    const reward = Math.round(tpl.reward * difficultyScale);

    return {
      id: `${today}-${tpl.id}-${index}`,
      title: tpl.title,
      description: tpl.description.replace("{n}", String(target)),
      target,
      current: 0,
      reward,
      rewardType: tpl.rewardType,
      completed: false,
      claimed: false,
    };
  });
}

// ---------------------------------------------------------------------------
// UI Helper Functions
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 32. getRewardOverview
// ---------------------------------------------------------------------------

export function getRewardOverview(): {
  streak: {
    current: number;
    longest: number;
    isActive: boolean;
    bonus: { multiplier: number; description: string };
    nextMilestone: { day: number; label: string; reward: number; rewardType: string } | null;
  };
  quests: {
    total: number;
    completed: number;
    claimable: number;
    items: DailyQuest[];
  };
  weekly: {
    chestsClaimed: number;
    total: number;
    items: WeeklyChest[];
  };
  monthly: {
    progress: number;
    tiers: MonthlyTier[];
  };
  unclaimedCount: number;
  hasNotification: boolean;
} {
  const state = loadState();
  const streak = getLoginStreak();
  const bonus = getStreakBonus();
  const quests = getDailyQuests();
  const calendar = getWeeklyCalendar();
  const monthly = getMonthlyMilestone();
  const notification = getNotification();

  // Find next streak milestone
  const milestoneDays = [3, 7, 14, 21, 30];
  const nextMilestoneDay = milestoneDays.find(
    (d) => !state.streakMilestonesClaimed.includes(d) && d >= streak
  );
  const nextMilestone = nextMilestoneDay
    ? {
        day: nextMilestoneDay,
        label: STREAK_MILESTONES[nextMilestoneDay].label,
        reward: STREAK_MILESTONES[nextMilestoneDay].reward,
        rewardType: STREAK_MILESTONES[nextMilestoneDay].rewardType,
      }
    : null;

  return {
    streak: {
      current: streak,
      longest: state.longestStreak,
      isActive: isStreakActive(),
      bonus,
      nextMilestone,
    },
    quests: {
      total: quests.length,
      completed: quests.filter((q) => q.completed).length,
      claimable: quests.filter((q) => q.completed && !q.claimed).length,
      items: quests,
    },
    weekly: {
      chestsClaimed: calendar.filter((c) => c.claimed).length,
      total: 7,
      items: calendar,
    },
    monthly: {
      progress: state.monthlyProgress,
      tiers: monthly,
    },
    unclaimedCount: notification.count,
    hasNotification: notification.hasNotification,
  };
}

// ---------------------------------------------------------------------------
// 33. getStreakCard
// ---------------------------------------------------------------------------

export function getStreakCard(): {
  emoji: string;
  streak: number;
  longestStreak: number;
  isActive: boolean;
  multiplier: number;
  description: string;
  nextMilestone: { day: number; reward: number; rewardType: string; progress: number } | null;
  daysUntilMilestone: number | null;
} {
  const streak = getLoginStreak();
  const longest = getLongestStreak();
  const active = isStreakActive();
  const bonus = getStreakBonus();
  const state = loadState();

  const milestoneDays = [3, 7, 14, 21, 30];
  const nextDay = milestoneDays.find(
    (d) => !state.streakMilestonesClaimed.includes(d) && d >= streak
  );

  let emoji = "💤";
  if (streak >= 30) emoji = "🔥🔥🔥";
  else if (streak >= 14) emoji = "🔥🔥";
  else if (streak >= 7) emoji = "🔥";
  else if (streak >= 3) emoji = "✨";
  else if (streak >= 1 && active) emoji = "⭐";

  const nextMilestone = nextDay
    ? {
        day: nextDay,
        reward: STREAK_MILESTONES[nextDay].reward,
        rewardType: STREAK_MILESTONES[nextDay].rewardType,
        progress: Math.min(100, Math.round((streak / nextDay) * 100)),
      }
    : null;

  return {
    emoji,
    streak,
    longestStreak: longest,
    isActive: active,
    multiplier: bonus.multiplier,
    description: bonus.description,
    nextMilestone,
    daysUntilMilestone: nextDay ? nextDay - streak : null,
  };
}

// ---------------------------------------------------------------------------
// 34. getQuestList
// ---------------------------------------------------------------------------

export function getQuestList(): {
  quests: {
    id: string;
    title: string;
    description: string;
    progress: number;
    progressPercent: number;
    target: number;
    current: number;
    reward: number;
    rewardType: string;
    rewardLabel: string;
    completed: boolean;
    claimed: boolean;
    claimable: boolean;
  }[];
  totalCompleted: number;
  totalClaimable: number;
} {
  const quests = getDailyQuests();

  const formatted = quests.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    progress: q.current,
    progressPercent: q.target > 0 ? Math.min(100, Math.round((q.current / q.target) * 100)) : 0,
    target: q.target,
    current: q.current,
    reward: q.reward,
    rewardType: q.rewardType,
    rewardLabel: `${q.reward} ${q.rewardType}`,
    completed: q.completed,
    claimed: q.claimed,
    claimable: q.completed && !q.claimed,
  }));

  return {
    quests: formatted,
    totalCompleted: formatted.filter((q) => q.completed).length,
    totalClaimable: formatted.filter((q) => q.claimable).length,
  };
}

// ---------------------------------------------------------------------------
// 35. getWeeklyChestGrid
// ---------------------------------------------------------------------------

export function getWeeklyChestGrid(): {
  chests: {
    day: number;
    dayLabel: string;
    rarity: string;
    rarityEmoji: string;
    rarityColor: string;
    reward: number;
    rewardType: string;
    rewardLabel: string;
    claimed: boolean;
    available: boolean;
    locked: boolean;
    isToday: boolean;
  }[];
  claimedCount: number;
  progressPercent: number;
} {
  const calendar = getWeeklyCalendar();
  const dayOfWeek = new Date().getDay();
  const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const rarityEmojis: Record<string, string> = {
    Common: "📦",
    Uncommon: "🎁",
    Rare: "💎",
    Epic: "👑",
    Legendary: "🌟",
  };
  const rarityColors: Record<string, string> = {
    Common: "#8B9DAF",
    Uncommon: "#2ECC71",
    Rare: "#3498DB",
    Epic: "#9B59B6",
    Legendary: "#F39C12",
  };

  const chests = calendar.map((c, idx) => ({
    day: c.day,
    dayLabel: dayLabels[idx] || `Day ${c.day}`,
    rarity: c.rarity,
    rarityEmoji: rarityEmojis[c.rarity] || "📦",
    rarityColor: rarityColors[c.rarity] || "#8B9DAF",
    reward: c.reward,
    rewardType: c.rewardType,
    rewardLabel: `${c.reward} ${c.rewardType}`,
    claimed: c.claimed,
    available: !c.claimed && idx <= todayIdx,
    locked: idx > todayIdx,
    isToday: idx === todayIdx,
  }));

  const claimedCount = chests.filter((c) => c.claimed).length;

  return {
    chests,
    claimedCount,
    progressPercent: Math.round((claimedCount / 7) * 100),
  };
}

// ---------------------------------------------------------------------------
// 36. getMonthlyTierBar
// ---------------------------------------------------------------------------

export function getMonthlyTierBar(): {
  progress: number;
  tiers: {
    tier: number;
    name: string;
    target: number;
    reward: number;
    rewardType: string;
    rewardLabel: string;
    current: number;
    claimed: boolean;
    unlocked: boolean;
    progress: number;
    markerPosition: number; // percentage position along the bar (0-100)
  }[];
  maxTarget: number;
  nextTier: { tier: number; name: string; remaining: number } | null;
  allClaimed: boolean;
  overallPercent: number;
} {
  const state = loadState();
  const currentMonth = monthISO();

  // Reset if month changed
  let monthlyProgress = state.monthlyProgress;
  let monthlyTiersClaimed = state.monthlyTiersClaimed;
  if (state.month !== currentMonth) {
    monthlyProgress = 0;
    monthlyTiersClaimed = [];
  }

  const maxTarget = MONTHLY_TIER_DEFS[MONTHLY_TIER_DEFS.length - 1].target;

  const tiers = MONTHLY_TIER_DEFS.map((def) => {
    const unlocked = monthlyProgress >= def.target;
    const claimed = monthlyTiersClaimed.includes(def.tier);
    return {
      tier: def.tier,
      name: def.name,
      target: def.target,
      reward: def.reward,
      rewardType: def.rewardType,
      rewardLabel: `${def.reward} ${def.rewardType}`,
      current: monthlyProgress,
      claimed,
      unlocked,
      progress: Math.min(100, Math.round((monthlyProgress / def.target) * 100)),
      markerPosition: Math.round((def.target / maxTarget) * 100),
    };
  });

  const nextTierDef = MONTHLY_TIER_DEFS.find(
    (d) => !monthlyTiersClaimed.includes(d.tier)
  );
  const nextTier = nextTierDef
    ? {
        tier: nextTierDef.tier,
        name: nextTierDef.name,
        remaining: Math.max(0, nextTierDef.target - monthlyProgress),
      }
    : null;

  return {
    progress: monthlyProgress,
    tiers,
    maxTarget,
    nextTier,
    allClaimed: monthlyTiersClaimed.length === MONTHLY_TIER_DEFS.length,
    overallPercent: Math.min(100, Math.round((monthlyProgress / maxTarget) * 100)),
  };
}
