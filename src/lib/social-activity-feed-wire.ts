// =============================================================================
// Social Activity Feed Wire — Word Snake Game
// Standalone module: social timeline of game activities, achievements, milestones,
// reactions, and shareable content. localStorage key: ws_social_activity_feed
// =============================================================================

const STORAGE_KEY = 'ws_social_activity_feed';
const SETTINGS_KEY = 'ws_social_activity_settings';
const MOOD_KEY = 'ws_social_activity_mood';
const MAX_FEED_SIZE = 500;

// --- Types --------------------------------------------------------------------

export type ActivityType =
  | 'game_complete' | 'achievement_unlocked' | 'challenge_complete'
  | 'streak_milestone' | 'level_up' | 'new_word_discovered'
  | 'high_score' | 'battle_pass_tier' | 'collection_milestone' | 'custom_status';

export type Period = 'today' | 'week' | 'month' | 'all';
export type ExportFormat = 'json' | 'markdown';

export interface ReactionMap { [emoji: string]: number }

export interface Comment { id: string; text: string; timestamp: number }

export interface Activity {
  id: string; type: ActivityType; data: Record<string, unknown>;
  timestamp: number; reactions: ReactionMap; comments: Comment[];
}

export interface FeedSettings {
  showTypes: ActivityType[]; maxItems: number;
  sortBy: 'newest' | 'oldest' | 'priority'; filterMuted: boolean;
}

export interface ActivityStats {
  totalPosts: number; byType: Record<string, number>;
  averagePerDay: number; mostActiveDay: string; streakDays: number;
}

export interface DayFrequency { date: string; count: number }

export interface FeedOverview {
  totalActivities: number; recentCount: number; topType: ActivityType;
  moodEmoji: string; streakDays: number; highlights: Activity[];
  trendingReaction: string;
}

export interface TimelinePoint { date: string; count: number; types: Record<string, number> }

// --- Internal helpers ---------------------------------------------------------

const ALL_TYPES: ActivityType[] = [
  'game_complete', 'achievement_unlocked', 'challenge_complete', 'streak_milestone',
  'level_up', 'new_word_discovered', 'high_score', 'battle_pass_tier',
  'collection_milestone', 'custom_status',
];

const DEFAULT_SETTINGS: FeedSettings = {
  showTypes: [...ALL_TYPES], maxItems: 50, sortBy: 'newest', filterMuted: true,
};

function genId(): string {
  return `act_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function safeParse<T>(j: string | null, fb: T): T {
  try { return j ? (JSON.parse(j) as T) : fb; } catch { return fb; }
}

function load(): Activity[] {
  try { return safeParse(localStorage.getItem(STORAGE_KEY), [] as Activity[]); } catch { return []; }
}

function save(a: Activity[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(a.length > MAX_FEED_SIZE ? a.slice(0, MAX_FEED_SIZE) : a));
  } catch { /* storage full */ }
}

function loadSettings(): FeedSettings {
  try {
    return safeParse(localStorage.getItem(SETTINGS_KEY), {
      showTypes: ALL_TYPES, maxItems: 50, sortBy: 'newest' as const, filterMuted: true,
    });
  } catch { return { ...DEFAULT_SETTINGS }; }
}

function saveSettings(s: FeedSettings): void {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* ok */ }
}

function loadMuted(): ActivityType[] {
  try { return safeParse(localStorage.getItem('ws_social_muted_types'), [] as ActivityType[]); } catch { return []; }
}

function saveMuted(t: ActivityType[]): void {
  try { localStorage.setItem('ws_social_muted_types', JSON.stringify(t)); } catch { /* ok */ }
}

function loadMood(): string {
  try { return localStorage.getItem(MOOD_KEY) || '🎮'; } catch { return '🎮'; }
}

function saveMood(m: string): void {
  try { localStorage.setItem(MOOD_KEY, m); } catch { /* ok */ }
}

function isValidType(t: string): t is ActivityType {
  return (ALL_TYPES as readonly string[]).includes(t);
}

function dayStr(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysAgo(n: number): number { return Date.now() - n * 86400000; }

function emptyStats(): ActivityStats {
  return { totalPosts: 0, byType: {}, averagePerDay: 0, mostActiveDay: '', streakDays: 0 };
}

// =============================================================================
// 1. ACTIVITY FEED
// =============================================================================

/** Create a new activity entry and prepend it to the feed. */
export function postActivity(type: ActivityType, data: Record<string, unknown>): Activity | null {
  try {
    if (!isValidType(type)) return null;
    const activity: Activity = { id: genId(), type, data, timestamp: Date.now(), reactions: {}, comments: [] };
    const feed = load();
    feed.unshift(activity);
    save(feed);
    return activity;
  } catch { return null; }
}

/** Get recent activities sorted by configured sort order. Respects muted types. */
export function getActivityFeed(limit: number = 50): Activity[] {
  try {
    const feed = load();
    const settings = loadSettings();
    let filtered = settings.filterMuted ? (() => {
      const m = loadMuted();
      return m.length > 0 ? feed.filter((a) => !m.includes(a.type)) : feed;
    })() : feed;

    if (settings.sortBy === 'oldest') filtered.sort((a, b) => a.timestamp - b.timestamp);
    else if (settings.sortBy === 'priority') filtered.sort((a, b) => getActivityPriority(b.type) - getActivityPriority(a.type));
    else filtered.sort((a, b) => b.timestamp - a.timestamp);

    return filtered.slice(0, Math.max(1, limit));
  } catch { return []; }
}

/** Remove an activity from the feed by its ID. */
export function deleteActivity(id: string): boolean {
  try {
    const feed = load();
    const idx = feed.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    feed.splice(idx, 1);
    save(feed);
    return true;
  } catch { return false; }
}

/** Remove all activities from the feed. */
export function clearFeed(): boolean {
  try { localStorage.removeItem(STORAGE_KEY); return true; } catch { return false; }
}

// =============================================================================
// 2. ACTIVITY FORMATTING
// =============================================================================

const ICONS: Record<ActivityType, string> = {
  game_complete: '🏁', achievement_unlocked: '🏆', challenge_complete: '⚔️',
  streak_milestone: '🔥', level_up: '📈', new_word_discovered: '📖',
  high_score: '👑', battle_pass_tier: '🎖️', collection_milestone: '🧩',
  custom_status: '💬',
};

const COLORS: Record<ActivityType, string> = {
  game_complete: '#4ade80', achievement_unlocked: '#facc15', challenge_complete: '#f87171',
  streak_milestone: '#fb923c', level_up: '#60a5fa', new_word_discovered: '#a78bfa',
  high_score: '#f472b6', battle_pass_tier: '#2dd4bf', collection_milestone: '#c084fc',
  custom_status: '#94a3b8',
};

const PRIORITIES: Record<ActivityType, number> = {
  achievement_unlocked: 100, high_score: 90, streak_milestone: 80, level_up: 70,
  battle_pass_tier: 60, challenge_complete: 55, collection_milestone: 50,
  new_word_discovered: 40, game_complete: 30, custom_status: 10,
};

export function getActivityIcon(type: ActivityType): string { return ICONS[type] || '📌'; }
export function getActivityColor(type: ActivityType): string { return COLORS[type] || '#94a3b8'; }
export function getActivityPriority(type: ActivityType): number { return PRIORITIES[type] ?? 0; }

/** Convert an activity into a human-readable display string with emoji context. */
export function formatActivity(activity: Activity): string {
  try {
    const ic = getActivityIcon(activity.type);
    const d = activity.data;
    switch (activity.type) {
      case 'game_complete':
        return `${ic} Completed a game — Score: ${d.score ?? '?'}, Words: ${d.words ?? '?'}`;
      case 'achievement_unlocked':
        return `${ic} Achievement unlocked: "${d.name ?? 'Unknown'}" — ${d.description ?? ''}`;
      case 'challenge_complete':
        return `${ic} Challenge beaten: "${d.challenge ?? '?'}" — Difficulty: ${d.difficulty ?? '?'}`;
      case 'streak_milestone':
        return `${ic} Streak milestone: ${d.streak ?? '?'} days in a row!`;
      case 'level_up':
        return `${ic} Leveled up to Level ${d.level ?? '?'} — XP: ${d.xp ?? '?'}`;
      case 'new_word_discovered':
        return `${ic} New word discovered: "${d.word ?? '?'}" (${d.letters ?? '?'} letters)`;
      case 'high_score':
        return `${ic} New high score: ${d.score ?? '?'}` + (d.mode ? ` in ${d.mode}` : '') + '!';
      case 'battle_pass_tier':
        return `${ic} Battle Pass Tier ${d.tier ?? '?'}` + (d.reward ? ` — Reward: ${d.reward}` : '');
      case 'collection_milestone':
        return `${ic} Collection: ${d.count ?? '?'} of ${d.total ?? '?'}` + (d.category ? ` ${d.category}` : '') + ' collected';
      case 'custom_status':
        return `${ic} Status: ${d.text ?? ''}`;
      default: return `${ic} Activity at ${new Date(activity.timestamp).toLocaleString()}`;
    }
  } catch { return '📝 Unknown activity'; }
}

// =============================================================================
// 3. REACTIONS & INTERACTIONS
// =============================================================================

const VALID_REACTIONS = new Set(['👍', '❤️', '🔥', '🎉', '💪', '🏆']);

/** Add a reaction emoji to an activity. Only specific emojis are allowed. */
export function addReaction(activityId: string, emoji: string): boolean {
  try {
    if (!VALID_REACTIONS.has(emoji)) return false;
    const feed = load();
    const act = feed.find((a) => a.id === activityId);
    if (!act) return false;
    act.reactions[emoji] = (act.reactions[emoji] || 0) + 1;
    save(feed);
    return true;
  } catch { return false; }
}

/** Remove one instance of a reaction emoji from an activity. */
export function removeReaction(activityId: string, emoji: string): boolean {
  try {
    const feed = load();
    const act = feed.find((a) => a.id === activityId);
    if (!act || !act.reactions[emoji]) return false;
    act.reactions[emoji]--;
    if (act.reactions[emoji] <= 0) delete act.reactions[emoji];
    save(feed);
    return true;
  } catch { return false; }
}

export function getReactions(activityId: string): ReactionMap {
  try {
    const act = load().find((a) => a.id === activityId);
    return act ? { ...act.reactions } : {};
  } catch { return {}; }
}

export function getTopReactions(): { emoji: string; count: number }[] {
  try {
    const totals: ReactionMap = {};
    for (const a of load()) {
      for (const [e, c] of Object.entries(a.reactions)) totals[e] = (totals[e] || 0) + c;
    }
    return Object.entries(totals).map(([emoji, count]) => ({ emoji, count })).sort((a, b) => b.count - a.count);
  } catch { return []; }
}

// =============================================================================
// 4. MILESTONES & HIGHLIGHTS
// =============================================================================

const HIGHLIGHT_TYPES: ActivityType[] = [
  'achievement_unlocked', 'high_score', 'streak_milestone', 'level_up',
  'battle_pass_tier', 'collection_milestone', 'challenge_complete',
];

function periodCutoff(p: Period): number {
  switch (p) { case 'today': return daysAgo(1); case 'week': return daysAgo(7); case 'month': return daysAgo(30); default: return 0; }
}

/** Return high-priority activities within a given time period. */
export function getHighlights(period: Period = 'week'): Activity[] {
  try {
    const cutoff = periodCutoff(period);
    return load()
      .filter((a) => a.timestamp >= cutoff && HIGHLIGHT_TYPES.includes(a.type))
      .sort((a, b) => getActivityPriority(b.type) - getActivityPriority(a.type));
  } catch { return []; }
}

export function getFirstAchievement(): Activity | null {
  try {
    const ach = load().filter((a) => a.type === 'achievement_unlocked').sort((a, b) => a.timestamp - b.timestamp);
    return ach[0] ?? null;
  } catch { return null; }
}

export function getBestScoreActivity(): Activity | null {
  try {
    const scores = load().filter((a) => a.type === 'high_score' || a.type === 'game_complete');
    if (!scores.length) return null;
    return scores.reduce((best, a) => (Number(a.data.score) || 0) > (Number(best.data.score) || 0) ? a : best, scores[0]);
  } catch { return null; }
}

export function getLongestStreakActivity(): Activity | null {
  try {
    const streaks = load().filter((a) => a.type === 'streak_milestone');
    if (!streaks.length) return null;
    return streaks.reduce((longest, a) => (Number(a.data.streak) || 0) > (Number(longest.data.streak) || 0) ? a : longest, streaks[0]);
  } catch { return null; }
}

export function getLevelMilestones(): Activity[] {
  try {
    return load().filter((a) => a.type === 'level_up').sort((a, b) => a.timestamp - b.timestamp);
  } catch { return []; }
}

// =============================================================================
// 5. ACTIVITY STATS
// =============================================================================

/** Compute aggregate statistics across the entire activity feed. */
export function getActivityStats(): ActivityStats {
  try {
    const feed = load();
    if (!feed.length) return emptyStats();

    const byType: Record<string, number> = {};
    const dayCounts: Record<string, number> = {};
    for (const a of feed) {
      byType[a.type] = (byType[a.type] || 0) + 1;
      dayCounts[dayStr(a.timestamp)] = (dayCounts[dayStr(a.timestamp)] || 0) + 1;
    }

    const uniqueDays = Object.keys(dayCounts).length;
    const averagePerDay = uniqueDays ? Math.round(feed.length / uniqueDays) : 0;
    const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

    // Streak: consecutive days ending today/yesterday
    const sortedDays = Object.keys(dayCounts).sort().reverse();
    const today = dayStr(Date.now());
    const yesterday = dayStr(daysAgo(1));
    let streakDays = 0;
    const start = sortedDays.includes(today) ? today : sortedDays.includes(yesterday) ? yesterday : '';
    if (start) {
      let cur = new Date(start + 'T00:00:00');
      while (dayCounts[dayStr(cur.getTime())]) { streakDays++; cur = new Date(cur.getTime() - 86400000); }
    }

    return { totalPosts: feed.length, byType, averagePerDay, mostActiveDay, streakDays };
  } catch { return emptyStats(); }
}

export function getActivityFrequency(): DayFrequency[] {
  try {
    const feed = load();
    const map: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) map[dayStr(daysAgo(i))] = 0;
    for (const a of feed) { const d = dayStr(a.timestamp); if (d in map) map[d]++; }
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  } catch { return []; }
}

export function getActivityByType(type: ActivityType): Activity[] {
  try { return load().filter((a) => a.type === type).sort((a, b) => b.timestamp - a.timestamp); }
  catch { return []; }
}

export function getRecentAchievements(count: number = 10): Activity[] {
  try { return getActivityByType('achievement_unlocked').slice(0, Math.max(1, count)); } catch { return []; }
}

// =============================================================================
// 6. STATUS UPDATES
// =============================================================================

/** Post a custom status update as a special activity type. */
export function postStatus(text: string): Activity | null {
  try {
    if (!text?.trim()) return null;
    return postActivity('custom_status', { text: text.trim() });
  } catch { return null; }
}

export function getStatusHistory(): Activity[] {
  try { return getActivityByType('custom_status'); } catch { return []; }
}

export function getCurrentStatus(): string {
  try {
    const h = getStatusHistory();
    return h.length ? (h[0].data.text as string) || '' : '';
  } catch { return ''; }
}

export function setMood(mood: string): boolean {
  try { if (!mood) return false; saveMood(mood); return true; } catch { return false; }
}

export function getMood(): string {
  try { return loadMood(); } catch { return '🎮'; }
}

// =============================================================================
// 7. SOCIAL SHARING
// =============================================================================

/** Generate a text-based card suitable for sharing a single activity. */
export function generateShareCard(activityId: string): string {
  try {
    const act = load().find((a) => a.id === activityId);
    if (!act) return 'Activity not found.';
    const fmt = formatActivity(act);
    const time = new Date(act.timestamp).toLocaleString();
    const rxn = Object.entries(act.reactions).map(([e, c]) => `${e} ${c}`).join('  ');
    const lines = [
      '┌────────────────────────────────────┐',
      '│  🐍 Word Snake — Activity Card     │',
      '├────────────────────────────────────┤',
      `│  ${fmt.padEnd(35)}│`,
      `│  🕐 ${time.padEnd(34)}│`,
    ];
    if (rxn) lines.push(`│  ${rxn.padEnd(35)}│`);
    lines.push('├────────────────────────────────────┤', '│  Play Word Snake today! 🐍        │', '└────────────────────────────────────┘');
    return lines.join('\n');
  } catch { return 'Failed to generate share card.'; }
}

/** Generate a formatted weekly digest of activities and stats. */
export function generateWeeklyDigest(): string {
  try {
    const hl = getHighlights('week');
    const st = getActivityStats();
    const tr = getTopReactions();
    const mood = loadMood();
    const lines = [
      `🐍 *Word Snake Weekly Digest*`, '═══════════════════════════════',
      `  ${mood} This week's highlights:`, '',
    ];
    if (!hl.length) { lines.push('  No major highlights this week.'); }
    else {
      hl.slice(0, 10).forEach((h) => lines.push(`  ${formatActivity(h)}`));
      if (hl.length > 10) lines.push(`  ... and ${hl.length - 10} more.`);
    }
    lines.push('', `  📊 Total activities: ${st.totalPosts}`, `  📈 Avg per day: ${st.averagePerDay}`,
      `  🔥 Current streak: ${st.streakDays} days`);
    if (tr.length) lines.push(`  💬 Top reaction: ${tr[0].emoji} (${tr[0].count}x)`);
    lines.push('═══════════════════════════════');
    return lines.join('\n');
  } catch { return 'Failed to generate weekly digest.'; }
}

/** Generate a comprehensive monthly activity report with highlights. */
export function generateMonthlyReport(): string {
  try {
    const hl = getHighlights('month');
    const st = getActivityStats();
    const freq = getActivityFrequency();
    const tr = getTopReactions();
    const mood = loadMood();
    const totalMonth = freq.reduce((s, f) => s + f.count, 0);
    const topType = Object.entries(st.byType).sort((a, b) => b[1] - a[1])[0];
    const lines = [
      '🐍 *Word Snake Monthly Report*', '═══════════════════════════════════',
      `  ${mood} Monthly Summary`, '',
      `  📊 Activities this month: ${totalMonth}`, `  📈 Average per day: ${st.averagePerDay}`,
      `  🔥 Longest streak: ${st.streakDays} days`,
      `  🏆 Top activity type: ${topType?.[0] ?? 'N/A'} (${topType?.[1] ?? 0})`,
    ];
    if (tr.length) lines.push(`  💬 Reactions: ${tr.slice(0, 3).map((r) => `${r.emoji}${r.count}`).join('  ')}`);
    lines.push('', '  ── Key Highlights ──');
    if (!hl.length) { lines.push('  No highlights this month.'); }
    else {
      hl.slice(0, 15).forEach((h) => lines.push(`  ${formatActivity(h)}`));
      if (hl.length > 15) lines.push(`  ... and ${hl.length - 15} more.`);
    }
    const best = getBestScoreActivity();
    if (best?.timestamp >= daysAgo(30)) lines.push('', `  👑 Best Score: ${best.data.score ?? '?'}`);
    const streak = getLongestStreakActivity();
    if (streak?.timestamp >= daysAgo(30)) lines.push(`  🔥 Longest Streak: ${streak.data.streak ?? '?'} days`);
    lines.push('═══════════════════════════════════');
    return lines.join('\n');
  } catch { return 'Failed to generate monthly report.'; }
}

/** Export the full feed as JSON or Markdown. */
export function exportFeed(format: ExportFormat = 'json'): string {
  try {
    const feed = load();
    if (format === 'markdown') {
      const lines = ['# 🐍 Word Snake — Activity Feed Export', ''];
      if (!feed.length) { lines.push('_No activities yet._'); }
      else {
        lines.push(`*Total: ${feed.length} activities*`, `*Exported: ${new Date().toLocaleString()}*`, '', '---');
        for (const a of feed) {
          const ic = getActivityIcon(a.type);
          const time = new Date(a.timestamp).toLocaleString();
          const rxn = Object.entries(a.reactions).map(([e, c]) => `${e}${c}`).join(' ');
          lines.push(`### ${ic} ${a.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`,
            `- **Time:** ${time}`, `- **ID:** \`${a.id}\``, `- **Details:** ${formatActivity(a)}`);
          if (rxn) lines.push(`- **Reactions:** ${rxn}`);
          lines.push('');
        }
      }
      return lines.join('\n');
    }
    return JSON.stringify({ exportedAt: new Date().toISOString(), totalActivities: feed.length, activities: feed }, null, 2);
  } catch { return format === 'json' ? '{}' : '_Export failed._'; }
}

// =============================================================================
// 8. FEED CONFIGURATION
// =============================================================================

export function getFeedSettings(): FeedSettings {
  try { return loadSettings(); } catch { return { ...DEFAULT_SETTINGS }; }
}

export function updateFeedSettings(settings: Partial<FeedSettings>): FeedSettings {
  try {
    const cur = loadSettings();
    const updated: FeedSettings = {
      showTypes: settings.showTypes ?? cur.showTypes,
      maxItems: Math.max(1, settings.maxItems ?? cur.maxItems),
      sortBy: settings.sortBy ?? cur.sortBy,
      filterMuted: settings.filterMuted ?? cur.filterMuted,
    };
    saveSettings(updated);
    return updated;
  } catch { return { ...DEFAULT_SETTINGS }; }
}

export function muteActivityType(type: ActivityType): boolean {
  try {
    if (!isValidType(type)) return false;
    const muted = loadMuted();
    if (muted.includes(type)) return true;
    muted.push(type);
    saveMuted(muted);
    return true;
  } catch { return false; }
}

export function unmuteActivityType(type: ActivityType): boolean {
  try {
    if (!isValidType(type)) return false;
    const muted = loadMuted();
    const idx = muted.indexOf(type);
    if (idx === -1) return true;
    muted.splice(idx, 1);
    saveMuted(muted);
    return true;
  } catch { return false; }
}

export function getMutedTypes(): ActivityType[] {
  try { return loadMuted(); } catch { return []; }
}

// =============================================================================
// 9. UI HELPERS
// =============================================================================

/** Pre-computed overview data for rendering a main feed panel. */
export function getFeedOverview(): FeedOverview {
  try {
    const stats = getActivityStats();
    const tr = getTopReactions();
    const mood = loadMood();
    const recent = load().slice(0, 10);
    const topType: ActivityType = (Object.entries(stats.byType)
      .sort((a, b) => b[1] - a[1])
      .find(([t]) => isValidType(t))?.[0] ?? 'game_complete') as ActivityType;
    return {
      totalActivities: stats.totalPosts, recentCount: recent.length, topType,
      moodEmoji: mood, streakDays: stats.streakDays, highlights: getHighlights('week').slice(0, 5),
      trendingReaction: tr.length ? tr[0].emoji : '👍',
    };
  } catch {
    return { totalActivities: 0, recentCount: 0, topType: 'game_complete', moodEmoji: '🎮', streakDays: 0, highlights: [], trendingReaction: '👍' };
  }
}

/** Timeline data broken into daily buckets for chart display. */
export function getFeedTimeline(days: number = 14): TimelinePoint[] {
  try {
    const feed = load();
    const result: TimelinePoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const start = daysAgo(i + 1), end = daysAgo(i);
      const dayActs = feed.filter((a) => a.timestamp >= start && a.timestamp < end);
      const types: Record<string, number> = {};
      for (const a of dayActs) types[a.type] = (types[a.type] || 0) + 1;
      result.push({ date: dayStr(start), count: dayActs.length, types });
    }
    return result;
  } catch { return []; }
}

export function getActivitySummary(count: number = 5): string {
  try {
    const recent = getActivityFeed(count);
    if (!recent.length) return 'No recent activity. Start playing to see your feed! 🐍';
    return ['📋 Recent Activity (last ' + recent.length + '):', ...recent.map((a, i) => `${i + 1}. ${formatActivity(a)}`)].join('\n');
  } catch { return 'Unable to load activity summary.'; }
}

/** Return the top 10 trending activities from the last 3 days, scored by reactions + priority + recency. */
export function getTrendingActivity(): Activity[] {
  try {
    const now = Date.now();
    return load()
      .filter((a) => a.timestamp >= daysAgo(3))
      .map((a) => {
        const rxn = Object.values(a.reactions).reduce((s, c) => s + c, 0);
        const recency = (now - a.timestamp) / 259200000; // 3 days in ms
        const priority = getActivityPriority(a.type) / 100;
        return { activity: a, score: rxn * 3 + priority * 2 + (1 - recency) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((s) => s.activity);
  } catch { return []; }
}
