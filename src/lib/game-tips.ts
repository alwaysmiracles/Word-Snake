// Word Snake — Contextual Tips System
// Client-side only lib — all storage access is wrapped in try/catch.

export type TipCategory =
  | 'gameplay' | 'scoring' | 'powerups' | 'words' | 'controls' | 'advanced' | 'fun';

export type TipPosition = 'top' | 'bottom' | 'sidebar';

export interface GameTip {
  id: string;
  category: TipCategory;
  title: string;
  content: string;
  priority: number; // 1 (low) – 10 (critical)
  condition: string;
  shown: boolean;
  shownCount: number;
  firstShownAt: number | null;
}

export interface TipConfig {
  enabled: boolean;
  showOnStart: boolean;
  intervalMs: number;
  maxPerSession: number;
  categories: Record<TipCategory, boolean>;
  dismissedTips: string[];
  tipPosition: TipPosition;
}

export interface TipContext {
  score: number;
  wordsCollected: number;
  comboCount: number;
  powerupsActive: string[];
  gameStarted: boolean;
  gameOver: boolean;
  isDailyChallenge: boolean;
  difficulty: string;
  practiceMode: boolean;
  timePlayed: number;
}

export interface TipStats {
  total: number;
  shown: number;
  dismissed: number;
  remaining: number;
}

// -- localStorage helpers --

const KEY_PREFIX = 'ws_tips_';

function lsGet(key: string): string | null {
  try { return localStorage.getItem(KEY_PREFIX + key); } catch { return null; }
}

function lsSet(key: string, value: string): void {
  try { localStorage.setItem(KEY_PREFIX + key, value); } catch { /* noop */ }
}

function lsRemove(key: string): void {
  try { localStorage.removeItem(KEY_PREFIX + key); } catch { /* noop */ }
}

// -- Tips Database (51 entries across 7 categories) --

const TIPS_DATABASE: Omit<GameTip, 'shown' | 'shownCount' | 'firstShownAt'>[] = [
  // gameplay
  { id: 'gp-01', category: 'gameplay', title: 'Steering', content: 'Use the arrow keys or WASD to control the snake direction.', priority: 9, condition: 'gameStarted && wordsCollected === 0' },
  { id: 'gp-02', category: 'gameplay', title: 'Collecting Words', content: 'Collect words to grow your snake and earn points.', priority: 8, condition: 'gameStarted && wordsCollected < 3' },
  { id: 'gp-03', category: 'gameplay', title: 'Avoid Collisions', content: 'Avoid hitting walls and your own tail — one hit ends the game!', priority: 9, condition: 'gameStarted && score < 50' },
  { id: 'gp-04', category: 'gameplay', title: 'Pause & Plan', content: 'Press Space to pause the game and plan your next move.', priority: 7, condition: 'gameStarted && timePlayed > 15000 && score < 30' },
  { id: 'gp-05', category: 'gameplay', title: 'Speed Increases', content: 'The snake moves faster as your score increases — stay sharp!', priority: 6, condition: 'gameStarted && score > 100' },
  { id: 'gp-06', category: 'gameplay', title: 'Plan Your Path', content: 'Look ahead on the grid and avoid boxing yourself into corners.', priority: 7, condition: 'gameStarted && timePlayed > 30000' },
  { id: 'gp-07', category: 'gameplay', title: 'Word Highlighting', content: 'Glowing words are about to disappear — grab them quickly!', priority: 6, condition: 'gameStarted' },
  { id: 'gp-08', category: 'gameplay', title: 'Border Safety', content: 'The snake wraps around in some modes — check your settings!', priority: 5, condition: 'gameStarted && score > 200' },
  // scoring
  { id: 'sc-01', category: 'scoring', title: 'Word Length Bonus', content: 'Longer words give more points. Aim for 5+ letter words when possible!', priority: 7, condition: 'wordsCollected >= 3' },
  { id: 'sc-02', category: 'scoring', title: 'Combo Multipliers', content: 'Combo multipliers stack — keep collecting words quickly for huge scores!', priority: 8, condition: 'comboCount >= 2' },
  { id: 'sc-03', category: 'scoring', title: 'Rare Words', content: 'Rare words (★★★) give 3× bonus points. Watch for the golden glow!', priority: 7, condition: 'score > 50' },
  { id: 'sc-04', category: 'scoring', title: 'Daily Bonus', content: 'Daily challenges have bonus score multipliers — don\'t miss them!', priority: 6, condition: '!isDailyChallenge && timePlayed > 60000' },
  { id: 'sc-05', category: 'scoring', title: 'Milestone Rewards', content: 'Hitting score milestones unlocks coin rewards and achievements.', priority: 5, condition: 'score > 150' },
  { id: 'sc-06', category: 'scoring', title: 'Streak Bonus', content: 'Collecting words without pausing builds a streak for extra points.', priority: 6, condition: 'comboCount >= 3' },
  { id: 'sc-07', category: 'scoring', title: 'Speed Score', content: 'Clearing words faster earns a time bonus on top of word points.', priority: 5, condition: 'comboCount >= 4' },
  // powerups
  { id: 'pw-01', category: 'powerups', title: 'Shield', content: 'Shield protects you from one collision — a real lifesaver!', priority: 8, condition: 'score > 30 && !powerupsActive.includes("shield")' },
  { id: 'pw-02', category: 'powerups', title: 'Slow-Mo', content: 'Slow-Mo gives you time to navigate tight spaces at half speed.', priority: 7, condition: 'score > 60' },
  { id: 'pw-03', category: 'powerups', title: 'Magnet', content: 'Magnet pulls nearby words toward your snake — effortless collecting!', priority: 7, condition: 'score > 40' },
  { id: 'pw-04', category: 'powerups', title: 'Double Points', content: 'Double Points doubles your score for 10 seconds — collect fast!', priority: 8, condition: 'score > 50' },
  { id: 'pw-05', category: 'powerups', title: 'Shrink', content: 'Shrink reduces your tail by 5 segments, making navigation easier.', priority: 6, condition: 'wordsCollected > 10' },
  { id: 'pw-06', category: 'powerups', title: 'Powerup Combos', content: 'Stacking powerups can create powerful synergies — experiment!', priority: 5, condition: 'powerupsActive.length >= 1' },
  { id: 'pw-07', category: 'powerups', title: 'Ghost Mode', content: 'Ghost Mode lets you pass through walls for a few seconds.', priority: 7, condition: 'score > 80' },
  // words
  { id: 'wd-01', category: 'words', title: 'Word Packs', content: 'Unlock new word packs from the coin shop to expand vocabulary.', priority: 6, condition: 'wordsCollected >= 5' },
  { id: 'wd-02', category: 'words', title: 'Custom Words', content: 'Custom word packs let you add your own vocabulary to practice.', priority: 5, condition: 'wordsCollected >= 10' },
  { id: 'wd-03', category: 'words', title: 'Word Collection Book', content: 'The Word Collection Book tracks every word you\'ve ever collected.', priority: 5, condition: 'wordsCollected >= 3' },
  { id: 'wd-04', category: 'words', title: 'Pronunciation', content: 'Tap the speaker icon to hear words pronounced — great for learners!', priority: 6, condition: 'wordsCollected >= 1' },
  { id: 'wd-05', category: 'words', title: 'Word Definitions', content: 'Long-press a collected word to see its definition and usage.', priority: 5, condition: 'wordsCollected >= 4' },
  { id: 'wd-06', category: 'words', title: 'Themed Packs', content: 'Themed word packs cover science, geography, food, and more.', priority: 4, condition: 'timePlayed > 120000' },
  { id: 'wd-07', category: 'words', title: 'Multilingual Words', content: 'Switch to multilingual packs to practice foreign vocabulary.', priority: 4, condition: 'timePlayed > 180000' },
  { id: 'wd-08', category: 'words', title: 'Word Rarity', content: 'Words have rarity tiers: common, uncommon, rare, and legendary.', priority: 5, condition: 'score > 40' },
  // controls
  { id: 'ct-01', category: 'controls', title: 'Pause / Resume', content: 'Press Space to pause or resume the game at any time.', priority: 8, condition: 'gameStarted && timePlayed < 10000' },
  { id: 'ct-02', category: 'controls', title: 'Quick Restart', content: 'Press R to restart immediately after game over.', priority: 7, condition: 'gameOver' },
  { id: 'ct-03', category: 'controls', title: 'Toggle Music', content: 'Press M to toggle music on or off.', priority: 4, condition: 'timePlayed > 5000' },
  { id: 'ct-04', category: 'controls', title: 'Keyboard Shortcuts', content: 'Press ? to see all available keyboard shortcuts.', priority: 6, condition: 'timePlayed > 20000' },
  { id: 'ct-05', category: 'controls', title: 'Swipe Controls', content: 'On mobile, swipe in any direction to steer the snake.', priority: 7, condition: 'gameStarted && timePlayed < 5000' },
  { id: 'ct-06', category: 'controls', title: 'Sound Effects', content: 'Press S to toggle sound effects without affecting music.', priority: 4, condition: 'timePlayed > 30000' },
  // advanced
  { id: 'ad-01', category: 'advanced', title: 'PvP Mode', content: 'Enable PvP mode to compete head-to-head against a friend!', priority: 5, condition: 'score > 200 && timePlayed > 120000' },
  { id: 'ad-02', category: 'advanced', title: 'AI Opponent', content: 'The AI Bot opponent adapts to your skill level for balanced matches.', priority: 5, condition: 'score > 150' },
  { id: 'ad-03', category: 'advanced', title: 'Practice Mode', content: 'Practice Mode lets you learn and explore without game over pressure.', priority: 6, condition: '!practiceMode && gameOver' },
  { id: 'ad-04', category: 'advanced', title: 'Speed Profiles', content: 'Speed profiles change game pace — try Blitz mode for a real challenge!', priority: 4, condition: 'difficulty !== "blitz" && score > 100' },
  { id: 'ad-05', category: 'advanced', title: 'Obstacle Courses', content: 'Enable destructible walls for an extra layer of strategy.', priority: 4, condition: 'score > 250' },
  { id: 'ad-06', category: 'advanced', title: 'Portal System', content: 'Portals teleport your snake across the grid — use them strategically!', priority: 5, condition: 'score > 180' },
  { id: 'ad-07', category: 'advanced', title: 'Boss Mode', content: 'Boss Mode spawns timed word-collection challenges for extra rewards.', priority: 4, condition: 'timePlayed > 240000' },
  { id: 'ad-08', category: 'advanced', title: 'Replay System', content: 'Save and replay your best runs to study your strategies.', priority: 4, condition: 'score > 300' },
  // fun
  { id: 'fn-01', category: 'fun', title: 'Category Completion', content: 'Try collecting every word in a single category for a bonus reward!', priority: 5, condition: 'wordsCollected >= 8' },
  { id: 'fn-02', category: 'fun', title: 'Celebration!', content: 'Every 10 words collected triggers a celebration animation.', priority: 4, condition: 'wordsCollected >= 8 && wordsCollected % 10 >= 8' },
  { id: 'fn-03', category: 'fun', title: 'Easter Eggs', content: 'Easter eggs are hidden in the game — try special word combinations!', priority: 3, condition: 'wordsCollected >= 15' },
  { id: 'fn-04', category: 'fun', title: 'Snake Skins', content: 'Unlock fun snake skins in the coin shop — try the Galaxy skin!', priority: 4, condition: 'score > 100' },
  { id: 'fn-05', category: 'fun', title: 'Poetry Mode', content: 'Collect words that form a poem for a special achievement.', priority: 3, condition: 'wordsCollected >= 20' },
  { id: 'fn-06', category: 'fun', title: 'Particle Trails', content: 'Customize your snake\'s particle trail for a unique look.', priority: 3, condition: 'score > 150' },
  { id: 'fn-07', category: 'fun', title: 'Share Scores', content: 'Share your high scores as beautiful cards with friends!', priority: 4, condition: 'score > 200' },
  { id: 'fn-08', category: 'fun', title: 'Leaderboards', content: 'Climb the global leaderboard — can you reach the top 100?', priority: 5, condition: 'score > 250' },
];

// -- Category emojis & formatting --

const CATEGORY_EMOJI: Record<TipCategory, string> = {
  gameplay: '🎮', scoring: '⭐', powerups: '⚡', words: '📖', controls: '🕹️', advanced: '🧠', fun: '🎉',
};

export function getCategoryEmoji(category: TipCategory): string {
  return CATEGORY_EMOJI[category] ?? '💡';
}

export function formatTipContent(tip: GameTip): string {
  return `${getCategoryEmoji(tip.category)} ${tip.content}`;
}

// -- Config --

export function createTipConfig(): TipConfig {
  return {
    enabled: true,
    showOnStart: true,
    intervalMs: 30_000,
    maxPerSession: 8,
    categories: { gameplay: true, scoring: true, powerups: true, words: true, controls: true, advanced: true, fun: true },
    dismissedTips: loadDismissed(),
    tipPosition: 'top',
  };
}

// -- Persistence --

type ShownEntry = { count: number; first: number };

function loadDismissed(): string[] {
  try { return JSON.parse(lsGet('dismissed') ?? '[]') as string[]; } catch { return []; }
}

function saveDismissed(ids: string[]): void { lsSet('dismissed', JSON.stringify(ids)); }

function loadShownMap(): Record<string, ShownEntry> {
  try { return JSON.parse(lsGet('shown') ?? '{}') as Record<string, ShownEntry>; } catch { return {}; }
}

function saveShownMap(map: Record<string, ShownEntry>): void { lsSet('shown', JSON.stringify(map)); }

// -- Core operations --

export function markTipShown(tipId: string): void {
  const map = loadShownMap();
  const entry = map[tipId] ?? { count: 0, first: 0 };
  entry.count += 1;
  if (!entry.first) entry.first = Date.now();
  map[tipId] = entry;
  saveShownMap(map);
}

export function dismissTip(tipId: string): void {
  const dismissed = loadDismissed();
  if (!dismissed.includes(tipId)) { dismissed.push(tipId); saveDismissed(dismissed); }
}

export function resetTipHistory(): void { lsRemove('dismissed'); lsRemove('shown'); }

// -- Queries --

/** Rehydrate a database tip definition with persistence info. */
function hydrateTip(def: (typeof TIPS_DATABASE)[number]): GameTip {
  const dismissed = loadDismissed().includes(def.id);
  const map = loadShownMap();
  const entry = map[def.id];
  return {
    ...def,
    shown: !!entry || dismissed,
    shownCount: entry?.count ?? 0,
    firstShownAt: entry?.first ?? null,
  };
}

export function getUnshownTips(): GameTip[] {
  return TIPS_DATABASE.filter((d) => !hydrateTip(d).shown).map(hydrateTip);
}

export function getDismissedTips(): string[] {
  return loadDismissed();
}

export function getTipStats(): TipStats {
  const dismissed = loadDismissed();
  const shownMap = loadShownMap();
  const total = TIPS_DATABASE.length;
  const shown = Object.keys(shownMap).length;
  return { total, shown, dismissed: dismissed.length, remaining: total - shown - dismissed.length };
}

// -- Contextual selection --

function matchesCondition(condition: string, ctx: TipContext): boolean {
  try {
    const keys = Object.keys(ctx) as (keyof TipContext)[];
    const vals = keys.map((k) => ctx[k]);
    return !!new Function(...keys, `"use strict"; return (${condition});`)(...vals);
  } catch { return false; }
}

export function getRelevantTips(context: TipContext): GameTip[] {
  const dismissed = loadDismissed();
  return TIPS_DATABASE.filter((def) => {
    if (dismissed.includes(def.id)) return false;
    return matchesCondition(def.condition, context);
  }).map(hydrateTip);
}

export function shouldShowTip(config: TipConfig, lastShownTime: number): boolean {
  if (!config.enabled) return false;
  return Date.now() - lastShownTime >= config.intervalMs;
}

export function getNextTip(context: TipContext, config: TipConfig): GameTip | null {
  if (!config.enabled) return null;

  // Enforce per-session cap via sessionStorage
  let sessionCount = 0;
  try {
    sessionCount = parseInt(sessionStorage.getItem(KEY_PREFIX + 'session_count') ?? '0', 10);
    if (sessionCount >= config.maxPerSession) return null;
  } catch { /* noop */ }

  const candidates = getRelevantTips(context)
    .filter((tip) => config.categories[tip.category])
    .sort((a, b) => b.priority - a.priority || a.shownCount - b.shownCount);

  if (candidates.length === 0) return null;

  const best = candidates[0];
  markTipShown(best.id);
  try { sessionStorage.setItem(KEY_PREFIX + 'session_count', String(sessionCount + 1)); } catch { /* noop */ }
  return best;
}

// -- Tip of the Day (deterministic based on date) --

export function getTipOfTheDay(): GameTip {
  const today = new Date();
  const dayIndex = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return hydrateTip(TIPS_DATABASE[dayIndex % TIPS_DATABASE.length]);
}
