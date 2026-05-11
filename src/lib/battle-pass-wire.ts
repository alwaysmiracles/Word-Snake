'use client';

// ─── Battle Pass Wire ──────────────────────────────────────────────────────────
// Connects battle-pass progression to the game UI.
// Thin client-side orchestration layer over `battle-pass.ts`.
// Persists its own wire state to `ws_battle_pass_wire`.

import type {
  BattlePassSeason,
  BattlePassReward,
} from '@/lib/battle-pass';
import {
  createBattlePass,
  addBattlePassXP,
  claimReward as bpClaimReward,
  getTierProgress,
  getSeasonTimeRemaining,
  getPassSummary,
  isActive,
  advanceSeason,
  unlockPremium,
  getRewardPreview as bpRewardPreview,
} from '@/lib/battle-pass';

// ─── Wire-Level Types ──────────────────────────────────────────────────────────

/** Categorised XP source labels used for the breakdown view. */
export type XPSource =
  | 'gameplay'
  | 'daily_login'
  | 'challenge'
  | 'social'
  | 'bonus'
  | 'streak'
  | 'milestone'
  | 'other';

/** A single XP-earning event, persisted for the breakdown view. */
export interface XPEntry {
  amount: number;
  source: XPSource;
  label: string;
  timestamp: number;
}

/** One row of the XP-sources breakdown returned by `getXPSources()`. */
export interface XPSourceRow {
  source: XPSource;
  label: string;
  totalXP: number;
  count: number;
  percentOfTotal: number;
}

/** Rich tier card used by the UI to render a single tier row. */
export interface TierCard {
  tier: number;
  isCurrent: boolean;
  isUnlocked: boolean;
  isCompleted: boolean;
  freeReward: BattlePassReward | null;
  premiumReward: BattlePassReward | null;
  xpRequired: number;
  percentInTier: number;
}

/** Result of the season-overview call. */
export interface SeasonOverview {
  seasonId: string;
  seasonName: string;
  theme: string;
  emoji: string;
  currentTier: number;
  totalTiers: number;
  completionPercent: number;
  timeRemaining: { days: number; hours: number; minutes: number; formatted: string; expired: boolean };
  isActive: boolean;
  isPremium: boolean;
  isCompleted: boolean;
  unclaimedCount: number;
}

/** Result of a reward claim through the wire. */
export interface WireClaimResult {
  success: boolean;
  reward: BattlePassReward | null;
  reason: string;
}

/** Result of adding XP through the wire. */
export interface WireXPResult {
  totalXPAdded: number;
  tiersGained: number;
  newUnlocks: number;
  tierUp: boolean;
  newTier: number;
  xpInCurrentTier: number;
  xpNeededForNext: number;
}

/** New tier notifications returned by `checkTierUpgrades()`. */
export interface TierUpgradeNotification {
  tier: number;
  freeReward: BattlePassReward | null;
  premiumReward: BattlePassReward | null;
}

/** Result of the daily login bonus check. */
export interface DailyBonusResult {
  granted: boolean;
  xpAmount: number;
  message: string;
}

/** Premium status summary. */
export interface PremiumStatus {
  isPremium: boolean;
  totalPremiumRewards: number;
  claimedPremiumRewards: number;
  unclaimedPremiumRewards: number;
  nextPremiumRewardTier: number;
  nextPremiumReward: BattlePassReward | null;
  premiumBenefits: string[];
}

/** Past season summary entry. */
export interface SeasonHistoryEntry {
  name: string;
  emoji: string;
  theme: string;
  maxTier: number;
  totalTiers: number;
  rewardsClaimed: number;
  completionPercent: number;
  completedAt: string;
}

/** Full season history result. */
export interface SeasonHistoryResult {
  seasons: SeasonHistoryEntry[];
  totalSeasonsPlayed: number;
  bestSeason: SeasonHistoryEntry | null;
  averageCompletion: number;
}

/** Wire-level persistent state shape. */
interface WireState {
  /** The tier at which `checkTierUpgrades()` was last called. */
  lastCheckedTier: number;
  /** Categorised XP log (newest-first). */
  xpEntries: XPEntry[];
  /** Date string (YYYY-MM-DD) of the last daily login bonus claim. */
  lastDailyBonusDate: string;
  /** Archived past-season summaries. */
  seasonHistory: SeasonHistoryEntry[];
  /** Total gameplay XP earned this season (denormalised for speed). */
  totalSeasonXP: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WIRE_STORAGE_KEY = 'ws_battle_pass_wire';
const MAX_XP_ENTRIES = 200;
const MAX_HISTORY = 30;
const DEFAULT_DAILY_XP = 50;

const SOURCE_LABELS: Record<XPSource, string> = {
  gameplay: 'Gameplay',
  daily_login: 'Daily Login',
  challenge: 'Challenges',
  social: 'Social',
  bonus: 'Bonus',
  streak: 'Streak',
  milestone: 'Milestone',
  other: 'Other',
};

const PREMIUM_BENEFITS = [
  'Unlock exclusive premium reward track',
  'Access premium skins, avatars, and titles',
  'Earn bonus XP rewards at milestone tiers',
  'Exclusive word packs for each season',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function createDefaultWireState(): WireState {
  return {
    lastCheckedTier: 1,
    xpEntries: [],
    lastDailyBonusDate: '',
    seasonHistory: [],
    totalSeasonXP: 0,
  };
}

function loadWireState(): WireState {
  if (typeof window === 'undefined') return createDefaultWireState();
  try {
    const raw = localStorage.getItem(WIRE_STORAGE_KEY);
    if (!raw) return createDefaultWireState();
    const parsed = JSON.parse(raw) as Partial<WireState>;
    return {
      lastCheckedTier: typeof parsed.lastCheckedTier === 'number' ? parsed.lastCheckedTier : 1,
      xpEntries: Array.isArray(parsed.xpEntries) ? parsed.xpEntries : [],
      lastDailyBonusDate: typeof parsed.lastDailyBonusDate === 'string' ? parsed.lastDailyBonusDate : '',
      seasonHistory: Array.isArray(parsed.seasonHistory) ? parsed.seasonHistory : [],
      totalSeasonXP: typeof parsed.totalSeasonXP === 'number' ? parsed.totalSeasonXP : 0,
    };
  } catch {
    return createDefaultWireState();
  }
}

function saveWireState(state: WireState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WIRE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota or private-browsing */
  }
}

/** Get or create the current battle pass season. */
function getOrCreateSeason(): BattlePassSeason {
  return createBattlePass();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * 1. Season Overview
 *
 * Returns a snapshot of the current season: name, theme, time remaining,
 * total tiers, current tier, completion percentage.
 */
export function getSeasonOverview(): SeasonOverview {
  const pass = getOrCreateSeason();
  const summary = getPassSummary(pass);
  const time = getSeasonTimeRemaining(pass);
  const progress = getTierProgress(pass);
  const diff = Math.max(new Date(pass.endDate).getTime() - Date.now(), 0);
  const minutes = Math.floor((diff % 3600000) / 60000);

  return {
    seasonId: pass.id,
    seasonName: summary.season,
    theme: pass.theme,
    emoji: summary.emoji,
    currentTier: summary.currentTier,
    totalTiers: summary.totalTiers,
    completionPercent: progress.totalPercent,
    timeRemaining: {
      days: time.days,
      hours: time.hours,
      minutes,
      formatted: time.formatted,
      expired: time.expired,
    },
    isActive: isActive(pass),
    isPremium: summary.isPremium,
    isCompleted: pass.isCompleted,
    unclaimedCount: summary.unclaimedRewards,
  };
}

/**
 * 2. Tier Display
 *
 * Returns tier cards from `fromTier` to `fromTier + count - 1`.
 * Each card includes reward info (free + premium tracks), unlock status,
 * claim status, and XP progress.
 */
export function getTierDisplayData(fromTier: number, count: number): TierCard[] {
  const pass = getOrCreateSeason();
  const cards: TierCard[] = [];
  const progress = getTierProgress(pass);
  const start = Math.max(1, Math.min(fromTier, pass.totalTiers));
  const end = Math.min(start + count - 1, pass.totalTiers);

  for (let t = start; t <= end; t++) {
    const freeReward = pass.rewards.find(
      (r) => r.tier === t && !r.isPremium
    ) ?? null;
    const premiumReward = pass.rewards.find(
      (r) => r.tier === t && r.isPremium
    ) ?? null;

    const isCurrent = t === pass.currentTier;
    const isUnlocked = freeReward?.isUnlocked ?? false;
    const isCompleted = (freeReward?.isClaimed ?? false) && (premiumReward?.isClaimed ?? true);
    const xpRequired = pass.xpPerTier[Math.min(t - 1, 24)] ?? 0;
    const percentInTier = isCurrent ? progress.percentToNext : isUnlocked ? 100 : 0;

    cards.push({
      tier: t,
      isCurrent,
      isUnlocked,
      isCompleted,
      freeReward,
      premiumReward,
      xpRequired,
      percentInTier,
    });
  }

  return cards;
}

/**
 * 3. Claim Reward
 *
 * Claims an unlocked but unclaimed reward at the given tier.
 * Respects premium gating — returns a reason if the claim cannot proceed.
 */
export function claimReward(tier: number): WireClaimResult {
  const pass = getOrCreateSeason();
  const result = bpClaimReward(pass, tier);

  if (result.success && result.reward) {
    return {
      success: true,
      reward: result.reward,
      reason: '',
    };
  }

  return {
    success: false,
    reward: null,
    reason: result.reason ?? 'Unable to claim reward.',
  };
}

/**
 * 4. Season XP
 *
 * Adds XP to the battle pass from a specified source, handles tier-ups
 * automatically, and logs the XP entry for the breakdown view.
 * Returns detailed progress information.
 */
export function addSeasonXP(amount: number, source: XPSource, label?: string): WireXPResult {
  const pass = getOrCreateSeason();
  const state = loadWireState();
  const sourceLabel = label ?? SOURCE_LABELS[source] ?? source;

  // Apply XP
  const result = addBattlePassXP(pass, amount);

  // Log entry (newest-first, capped)
  state.xpEntries.unshift({
    amount,
    source,
    label: sourceLabel,
    timestamp: Date.now(),
  });
  if (state.xpEntries.length > MAX_XP_ENTRIES) {
    state.xpEntries.length = MAX_XP_ENTRIES;
  }
  state.totalSeasonXP += amount;

  // If season just completed, archive it
  if (pass.isCompleted && state.lastCheckedTier < pass.totalTiers) {
    archiveCurrentSeason(pass, state);
  }

  // Update last checked tier
  state.lastCheckedTier = pass.currentTier;
  saveWireState(state);

  const progress = getTierProgress(pass);

  return {
    totalXPAdded: amount,
    tiersGained: result.tiersGained,
    newUnlocks: result.newUnlocks,
    tierUp: result.tierUp,
    newTier: pass.currentTier,
    xpInCurrentTier: progress.xpInTier,
    xpNeededForNext: progress.xpNeeded,
  };
}

/**
 * 5. Tier Upgrades
 *
 * Returns any new tiers unlocked since the last check.
 * Useful for showing pop-up notifications after a game.
 */
export function checkTierUpgrades(): TierUpgradeNotification[] {
  const pass = getOrCreateSeason();
  const state = loadWireState();
  const notifications: TierUpgradeNotification[] = [];

  const from = state.lastCheckedTier + 1;
  const to = pass.currentTier;

  for (let t = from; t <= to; t++) {
    if (t < 1 || t > pass.totalTiers) continue;
    const freeReward = pass.rewards.find(
      (r) => r.tier === t && !r.isPremium
    ) ?? null;
    const premiumReward = pass.rewards.find(
      (r) => r.tier === t && r.isPremium
    ) ?? null;

    notifications.push({
      tier: t,
      freeReward,
      premiumReward,
    });
  }

  // Mark as checked
  state.lastCheckedTier = pass.currentTier;
  saveWireState(state);

  return notifications;
}

/**
 * 6. Reward Preview
 *
 * Returns the next `count` unclaimed, unlocked rewards across both tracks.
 * Ordered by tier ascending. Useful for a "coming up" or "ready to claim" section.
 */
export function getUpcomingRewards(count: number): BattlePassReward[] {
  const pass = getOrCreateSeason();
  const upcoming = pass.rewards
    .filter((r) => r.isUnlocked && !r.isClaimed)
    .sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      // Free track first
      return a.isPremium === b.isPremium ? 0 : a.isPremium ? 1 : -1;
    });

  return upcoming.slice(0, Math.max(1, count));
}

/**
 * 7. Season Countdown
 *
 * Returns days, hours, and minutes remaining until the season ends.
 */
export function getSeasonCountdown(): {
  days: number;
  hours: number;
  minutes: number;
  formatted: string;
  expired: boolean;
  endDate: string;
} {
  const pass = getOrCreateSeason();
  const time = getSeasonTimeRemaining(pass);
  const diff = Math.max(new Date(pass.endDate).getTime() - Date.now(), 0);
  const minutes = Math.floor((diff % 3600000) / 60000);

  const parts: string[] = [];
  if (time.days > 0) parts.push(`${time.days}d`);
  if (time.hours > 0 || time.days > 0) parts.push(`${time.hours}h`);
  parts.push(`${minutes}m`);

  return {
    days: time.days,
    hours: time.hours,
    minutes,
    formatted: parts.join(' '),
    expired: time.expired,
    endDate: pass.endDate,
  };
}

/**
 * 8. Premium Status
 *
 * Returns the premium tier status and benefits summary.
 * Includes next upcoming premium reward.
 */
export function getPremiumStatus(): PremiumStatus {
  const pass = getOrCreateSeason();
  const premiumRewards = pass.rewards.filter((r) => r.isPremium);
  const claimed = premiumRewards.filter((r) => r.isClaimed);
  const unclaimed = premiumRewards.filter((r) => !r.isClaimed);
  const nextPremium = premiumRewards.find((r) => !r.isClaimed) ?? null;

  return {
    isPremium: pass.isPremium,
    totalPremiumRewards: premiumRewards.length,
    claimedPremiumRewards: claimed.length,
    unclaimedPremiumRewards: unclaimed.length,
    nextPremiumRewardTier: nextPremium?.tier ?? 0,
    nextPremiumReward: nextPremium,
    premiumBenefits: [...PREMIUM_BENEFITS],
  };
}

/**
 * 9. Season History
 *
 * Returns past season summaries including tiers reached, rewards claimed,
 * and overall completion stats.
 */
export function getSeasonHistory(): SeasonHistoryResult {
  const state = loadWireState();
  const history = state.seasonHistory;

  let bestSeason: SeasonHistoryEntry | null = null;
  let avgSum = 0;

  for (const s of history) {
    if (!bestSeason || s.completionPercent > bestSeason.completionPercent) {
      bestSeason = s;
    }
    avgSum += s.completionPercent;
  }

  return {
    seasons: history,
    totalSeasonsPlayed: history.length,
    bestSeason,
    averageCompletion: history.length > 0
      ? Math.round((avgSum / history.length) * 10) / 10
      : 0,
  };
}

/**
 * 10. XP Sources Breakdown
 *
 * Returns XP earned this season, categorised by source
 * (gameplay, daily, challenges, social, bonus, streak, milestone, other).
 */
export function getXPSources(): XPSourceRow[] {
  const state = loadWireState();
  const entries = state.xpEntries;

  // Aggregate by source
  const totals = new Map<XPSource, { total: number; count: number }>();

  for (const entry of entries) {
    const existing = totals.get(entry.source) ?? { total: 0, count: 0 };
    existing.total += entry.amount;
    existing.count += 1;
    totals.set(entry.source, existing);
  }

  const grandTotal = entries.reduce((sum, e) => sum + e.amount, 0);

  // Build rows in canonical order
  const orderedSources: XPSource[] = [
    'gameplay',
    'daily_login',
    'challenge',
    'social',
    'streak',
    'bonus',
    'milestone',
    'other',
  ];

  return orderedSources.map((source) => {
    const data = totals.get(source);
    return {
      source,
      label: SOURCE_LABELS[source],
      totalXP: data?.total ?? 0,
      count: data?.count ?? 0,
      percentOfTotal: grandTotal > 0
        ? Math.round(((data?.total ?? 0) / grandTotal) * 1000) / 10
        : 0,
    };
  });
}

/**
 * 11. Daily Bonus Check
 *
 * Grants daily login XP if not already claimed today.
 * Returns whether the bonus was granted, the XP amount, and a message.
 */
export function checkDailyLoginBonus(): DailyBonusResult {
  const state = loadWireState();
  const today = todayDateString();

  // Already claimed today
  if (state.lastDailyBonusDate === today) {
    return {
      granted: false,
      xpAmount: 0,
      message: 'Daily login bonus already claimed today!',
    };
  }

  // Grant bonus — add XP via the wire function
  const result = addSeasonXP(DEFAULT_DAILY_XP, 'daily_login', 'Daily Login Bonus');
  state.lastDailyBonusDate = today;
  saveWireState(state);

  const tierMsg = result.tierUp
    ? ` Tier up! You're now Tier ${result.newTier}.`
    : '';

  return {
    granted: true,
    xpAmount: DEFAULT_DAILY_XP,
    message: `Claimed ${DEFAULT_DAILY_XP} XP daily login bonus!${tierMsg}`,
  };
}

// ─── Bonus Public Helpers ─────────────────────────────────────────────────────

/**
 * Toggle premium status for the current season.
 * Returns the updated premium status.
 */
export function togglePremium(): PremiumStatus {
  const pass = getOrCreateSeason();
  unlockPremium(pass);
  return getPremiumStatus();
}

/**
 * Get the raw BattlePassSeason object (for advanced consumers).
 */
export function getRawSeason(): BattlePassSeason {
  return getOrCreateSeason();
}

/**
 * Get tier progress details for the current season.
 */
export function getCurrentTierProgress(): {
  currentTier: number;
  xpInTier: number;
  xpNeeded: number;
  percentToNext: number;
  totalXP: number;
  totalPercent: number;
} {
  const pass = getOrCreateSeason();
  return getTierProgress(pass);
}

/**
 * Get a preview of a specific tier's rewards.
 */
export function getTierPreview(
  tier: number,
  isPremium: boolean
): BattlePassReward | null {
  const pass = getOrCreateSeason();
  return bpRewardPreview(pass, tier, isPremium);
}

/**
 * Manually advance to the next season (for dev/debug or player action).
 * Archives the current season first.
 */
export function startNextSeason(): SeasonOverview {
  const state = loadWireState();
  const currentPass = getOrCreateSeason();

  // Archive the current season before advancing
  archiveCurrentSeason(currentPass, state);

  // Reset wire-level season state
  state.lastCheckedTier = 1;
  state.xpEntries = [];
  state.totalSeasonXP = 0;
  state.lastDailyBonusDate = '';
  saveWireState(state);

  advanceSeason();
  return getSeasonOverview();
}

/**
 * Get total XP earned this season across all sources.
 */
export function getTotalSeasonXP(): number {
  const state = loadWireState();
  return state.totalSeasonXP;
}

/**
 * Get the last N XP entries (for recent-activity display).
 */
export function getRecentXPEntries(count: number): XPEntry[] {
  const state = loadWireState();
  return state.xpEntries.slice(0, Math.max(1, count));
}

/**
 * Reset all wire state (for testing / debug).
 */
export function resetWireState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(WIRE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

// ─── Internal Helpers ──────────────────────────────────────────────────────────

/**
 * Archive the current season into wire state before advancing.
 */
function archiveCurrentSeason(
  pass: BattlePassSeason,
  state: WireState
): void {
  const claimedRewards = pass.rewards.filter((r) => r.isClaimed).length;
  const completionPercent =
    pass.totalTiers > 0
      ? Math.round(((pass.currentTier - 1) / pass.totalTiers) * 1000) / 10
      : 0;

  const entry: SeasonHistoryEntry = {
    name: pass.name,
    emoji: pass.emoji,
    theme: pass.theme,
    maxTier: pass.currentTier,
    totalTiers: pass.totalTiers,
    rewardsClaimed: claimedRewards,
    completionPercent,
    completedAt: new Date().toISOString(),
  };

  state.seasonHistory.unshift(entry);
  if (state.seasonHistory.length > MAX_HISTORY) {
    state.seasonHistory.length = MAX_HISTORY;
  }
}
