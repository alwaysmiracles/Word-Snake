// ─── Battle Pass Reward Grantor ──────────────────────────────────────────────
// Pure logic module bridging battle-pass reward claiming to actual game systems
// (coins, skins, titles, powerups, wordpacks, avatars, badges, XP boosts).
// Returns structured results — does NOT directly mutate game state.
// The caller (game loop / component) applies the results.

// ─── Exported Types ──────────────────────────────────────────────────────────

/** All supported reward types in the battle pass system. */
export type RewardType = 'coins' | 'skin' | 'title' | 'powerup' | 'wordpack' | 'avatar' | 'badge' | 'xp_boost'

/** Shape of a single reward entry coming from the battle-pass tier system. */
export interface RewardData {
  type: RewardType
  /** Unique identifier, e.g. `"blossom_serpent_skin"` or `"tier_5_coin"`. */
  id: string
  /** Battle-pass tier this reward belongs to (1-25). */
  tier: number
  isPremium: boolean
  name: string
  description: string
  /** For `coins`: the amount. For `xp_boost`: percentage bonus. */
  value?: number
  emoji?: string
}

/** Result returned after processing a single reward. */
export interface GrantResult {
  success: boolean
  rewardType: RewardType
  rewardName: string
  message: string
  /** True if the player has never received this *type* of reward before. */
  isNew: boolean
}

/** Result returned after batch-processing a list of rewards. */
export interface BatchGrantResult {
  results: GrantResult[]
  totalGranted: number
  totalFailed: number
  coinsGranted: number
  newUnlocks: string[]
}

/** Preview of a reward shown before the player claims it. */
export interface RewardPreview {
  type: RewardType
  name: string
  description: string
  status: 'available' | 'locked' | 'claimed'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  emoji: string
}

/** A single record in the grant history log. */
export interface GrantRecord {
  rewardId: string
  rewardType: RewardType
  rewardName: string
  tier: number
  grantedAt: number
  seasonName?: string
}

/** Aggregated summary of all grants for stats display. */
export interface GrantSummary {
  totalGranted: number
  byType: Record<RewardType, number>
  totalCoinsGranted: number
  totalUnlocks: number
}

/** Public API surface of the reward grantor. */
export interface BattlePassRewardGrantor {
  /** Process and grant a single reward. Returns a result the caller applies. */
  grantReward(reward: RewardData): GrantResult
  /** Batch-process an array of rewards, skipping already-granted ones. */
  claimMultipleRewards(rewards: RewardData[]): BatchGrantResult
  /** Get a rich preview showing status, rarity, and type-specific description. */
  getRewardPreview(reward: RewardData): RewardPreview
  /** Retrieve grant history (newest-first), capped at 200 entries. */
  getGrantHistory(limit?: number): GrantRecord[]
  /** Get an aggregated summary broken down by reward type. */
  getGrantSummary(): GrantSummary
  /** Check whether a specific reward ID has already been granted. */
  isRewardGranted(rewardId: string): boolean
  /** Clear all persisted state (useful for testing / debug reset). */
  resetAll(): void
}

// ─── Internal Persistence Shape ──────────────────────────────────────────────

interface GrantorState {
  grantedIds: string[]
  history: GrantRecord[]
  seenTypes: RewardType[]
  firstClaimBonusUsed: boolean
  seasonName: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ws_bp_reward_grantor'
const MAX_HISTORY = 200
const MILESTONE_TIERS = new Set([5, 10, 15, 20, 25])

/** Verb + noun for each reward type, used in grant messages. */
const TYPE_LABELS: Record<RewardType, { v: string; n: string }> = {
  coins: { v: 'Granted', n: 'coins' }, skin: { v: 'Unlocked', n: 'snake skin' },
  title: { v: 'Unlocked', n: 'player title' }, powerup: { v: 'Added', n: 'powerup' },
  wordpack: { v: 'Unlocked', n: 'word pack' }, avatar: { v: 'Unlocked', n: 'avatar frame' },
  badge: { v: 'Awarded', n: 'badge' }, xp_boost: { v: 'Activated', n: 'XP boost' },
}

/** Prefix appended to descriptions based on reward type in previews. */
const DESC_PREFIX: Partial<Record<RewardType, string>> = {
  coins: '', xp_boost: '', skin: 'New snake skin: ', title: 'New display title: ',
  powerup: 'Powerup added to inventory: ', wordpack: 'Word pack unlocked: ',
  avatar: 'Avatar frame unlocked: ', badge: 'Badge awarded: ',
}

/** Reward types that count as permanent unlocks (not additive). */
const UNLOCKABLE_TYPES: Set<RewardType> = new Set(['skin', 'title', 'avatar', 'wordpack', 'badge'] as RewardType[])

function defaultState(name?: string): GrantorState {
  return { grantedIds: [], history: [], seenTypes: [], firstClaimBonusUsed: false, seasonName: name ?? 'Unknown Season' }
}

// ─── Storage Helpers ─────────────────────────────────────────────────────────

function loadState(): GrantorState {
  if (typeof window === 'undefined') return defaultState()
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) as GrantorState : defaultState() }
  catch { return defaultState() }
}

function saveState(s: GrantorState): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* full */ }
}

// ─── Rarity Helper ───────────────────────────────────────────────────────────

/**
 * Determine rarity from tier and premium status.
 * Premium milestone → legendary, premium non-milestone → epic,
 * free milestone → epic, free odd → rare, free even → common.
 */
export function rewardRarity(tier: number, isPremium: boolean): RewardPreview['rarity'] {
  if (isPremium && MILESTONE_TIERS.has(tier)) return 'legendary'
  if (isPremium) return 'epic'
  if (MILESTONE_TIERS.has(tier)) return 'epic'
  return tier % 2 === 1 ? 'rare' : 'common'
}

// ─── 25-Tier Reward Generation ───────────────────────────────────────────────

/** Check whether a tier is a premium milestone (every 5th tier). */
export function isPremiumMilestone(tier: number): boolean {
  return MILESTONE_TIERS.has(tier)
}

/** Filter a list of rewards to those belonging to a specific tier. */
export function filterRewardsByTier(rewards: RewardData[], tier: number): RewardData[] {
  return rewards.filter((r) => r.tier === tier)
}

/** Filter a list of rewards to those on the free track (or premium track). */
export function filterRewardsByTrack(rewards: RewardData[], premium: boolean): RewardData[] {
  return rewards.filter((r) => r.isPremium === premium)
}

/**
 * Compact block definition: [prefix, coinVals, [badge1Name, badge1Desc, badge1Emoji, badge2Name, badge2Desc, badge2Emoji],
 *   powerupName, powerupDesc, powerupEmoji, skinName, skinDesc, skinEmoji,
 *   titleName, titleDesc, avatarName, avatarDesc, avatarEmoji,
 *   wordpackName, wordpackDesc, wordpackEmoji, premiumSkinName, premiumSkinDesc, premiumSkinEmoji]
 */
type BlockTuple = [
  string, [number, number, number],
  [string, string, string, string, string, string],
  [string, string, string], [string, string, string], [string, string],
  [string, string, string], [string, string, string], [string, string, string],
]

const BLOCKS: BlockTuple[] = [
  ['founder', [50, 100, 150],
    ['First Steps', 'Claim your first battle-pass reward.', '👣', 'Quick Learner', 'Reach tier 3.', '📗'],
    ['Starter Shield', 'One-time shield for next hit.', '🛡️'],
    ['Ember Scale', 'Warm orange-red skin.', '🔥'],
    ['Rising Star', 'Title: Rising Star'],
    ['Bronze Frame', 'Simple bronze border avatar.', '🥉'],
    ['Beginner Pack', '20 easy starter words.', '📝'],
    ['Phoenix Plume', 'Fiery phoenix-feathered snake.', '🦅']],
  ['explorer', [200, 250, 300],
    ['Trailblazer', 'Unlock 5 battle-pass tiers.', '🧭', 'Word Wanderer', 'Collect 3 reward types.', '🗺️'],
    ['Explorer Boost', 'Double points for 15 s.', '⚡'],
    ['Ocean Tide', 'Deep-blue wave-patterned snake.', '🌊'],
    ['Pathfinder', 'Title: Pathfinder'],
    ['Silver Frame', 'Polished silver border avatar.', '🥈'],
    ['Explorer Pack', '30 intermediate words.', '🗺️'],
    ['Starweaver', 'Constellation-patterned serpent.', '🌌']],
  ['champion', [350, 400, 450],
    ['Combo King', 'Reach a 10× word combo.', '👑', 'Streak Master', 'Maintain 5-day play streak.', '🔥'],
    ['Champion Aura', 'Slow obstacles for 20 s.', '✨'],
    ['Royal Purple', 'Regal purple-gold snake.', '👑'],
    ['Champion', 'Title: Champion'],
    ['Gold Frame', 'Ornate gold-plated avatar.', '🥇'],
    ['Champion Pack', '40 advanced words.', '🏆'],
    ['Void Serpent', 'Snake from between worlds.', '🕳️']],
  ['legend', [500, 600, 700],
    ['Mythic Scholar', 'Spell 100 unique words.', '📜', 'Score Titan', 'Score 8000+ in one game.', '💎'],
    ['Legend Boost', 'Triple XP for 30 s.', '💫'],
    ['Shadow Viper', 'Dark smoke-wrapped snake.', '🌑'],
    ['Legend', 'Title: Legend'],
    ['Diamond Frame', 'Brilliant diamond avatar.', '💎'],
    ['Legend Pack', '50 expert words.', '📖'],
    ['Aurora Serpent', 'Shimmering aurora-borealis snake.', '🌈']],
  ['sovereign', [800, 900, 1000],
    ['Grandmaster', 'Complete 25 tiers in one season.', '🎓', 'Season Sage', 'Play 50 games this season.', '🌟'],
    ['Sovereign Power', 'All bonuses active for 45 s.', '⚡'],
    ['Golden Dragon', 'Resplendent golden dragon skin.', '🐉'],
    ['Sovereign', 'Title: Sovereign'],
    ['Crown Frame', 'Majestic crown avatar frame.', '👑'],
    ['Sovereign Pack', '60 master-level words.', '👑'],
    ['Celestial Wyrm', 'Cosmic dragon of the stars.', '✨']],
]

/** Helper to slugify a reward name for use in IDs. */
function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_')
}

/** Push a reward into the array with a computed ID. */
function pushReward(
  out: RewardData[], type: RewardType, prefix: string, tier: number,
  premium: boolean, name: string, desc: string, emoji: string, value?: number,
): void {
  out.push({ type, id: `${prefix}_tier${tier}_${slugify(name)}`, tier, isPremium: premium, name, description: desc, emoji, value })
}

/**
 * Generate all 25 tiers of battle-pass rewards (free + premium tracks).
 * 5 blocks of 5 tiers. Free: coins/badge/powerup rotation. Premium: skin/title/avatar/wordpack/skin.
 * Every 5th tier (milestone) gets bonus items on both tracks.
 */
export function generateTierRewards(): RewardData[] {
  const rewards: RewardData[] = []

  for (let b = 0; b < BLOCKS.length; b++) {
    const [prefix, coinVals, badges, powerup, skin, title, avatar, wordpack, premiumSkin] = BLOCKS[b]
    const base = b * 5

    for (let t = 0; t < 5; t++) {
      const tier = base + t + 1
      const isMilestone = tier % 5 === 0

      // ── Free track ──
      if (t === 0) {
        pushReward(rewards, 'coins', prefix, tier, false, `${coinVals[0]} Coins`, `${coinVals[0]} coins added to balance.`, '💰', coinVals[0])
      } else if (t === 1) {
        pushReward(rewards, 'badge', prefix, tier, false, badges[0], badges[1], badges[2])
      } else if (t === 2) {
        pushReward(rewards, 'coins', prefix, tier, false, `${coinVals[1]} Coins`, `${coinVals[1]} coins added to balance.`, '💰', coinVals[1])
      } else if (t === 3) {
        pushReward(rewards, 'powerup', prefix, tier, false, powerup[0], powerup[1], powerup[2])
      } else if (t === 4) {
        pushReward(rewards, 'badge', prefix, tier, false, badges[3], badges[4], badges[5])
      }

      // Free milestone bonus coins
      if (isMilestone) {
        pushReward(rewards, 'coins', prefix, tier, false, `Milestone Bonus: ${coinVals[2]} Coins`,
          `Extra ${coinVals[2]} coins for reaching tier ${tier}!`, '🎁', coinVals[2])
      }

      // ── Premium track ──
      if (t === 0) {
        pushReward(rewards, 'skin', prefix, tier, true, skin[0], skin[1], skin[2])
      } else if (t === 1) {
        pushReward(rewards, 'title', prefix, tier, true, title[0], title[1], '🏷️')
      } else if (t === 2) {
        pushReward(rewards, 'avatar', prefix, tier, true, avatar[0], avatar[1], avatar[2])
      } else if (t === 3) {
        pushReward(rewards, 'wordpack', prefix, tier, true, wordpack[0], wordpack[1], wordpack[2])
      } else if (t === 4) {
        pushReward(rewards, 'skin', prefix, tier, true, premiumSkin[0], premiumSkin[1], premiumSkin[2])
      }

      // Premium milestone: XP boost (5%, 10%, 15%, 20%, 25%)
      if (isMilestone) {
        const pct = 5 + b * 5
        pushReward(rewards, 'xp_boost', prefix, tier, true, `XP Boost: +${pct}%`,
          `Permanent +${pct}% XP bonus for all games.`, '🚀', pct)
      }
    }
  }

  // Season completion reward at tier 25 (free track)
  rewards.push({
    type: 'xp_boost', id: 'season_completion_xp_boost', tier: 25, isPremium: false,
    name: 'Season Completion: +25% XP',
    description: 'You completed the entire season! Permanent +25% XP bonus.',
    value: 25, emoji: '🎊',
  })

  return rewards
}

// ─── Reward Data Utilities ──────────────────────────────────────────────────

/** Count how many rewards of a given type appear in a list. */
export function countRewardsByType(rewards: RewardData[], type: RewardType): number {
  return rewards.filter((r) => r.type === type).length
}

/** Sum the total coin value across all coin-type rewards in a list. */
export function sumCoinRewards(rewards: RewardData[]): number {
  return rewards.reduce((sum, r) => r.type === 'coins' ? sum + (r.value ?? 0) : sum, 0)
}

/** Get the maximum XP boost percentage from all xp_boost rewards in a list. */
export function maxXpBoost(rewards: RewardData[]): number {
  return rewards.reduce((max, r) => r.type === 'xp_boost' ? Math.max(max, r.value ?? 0) : max, 0)
}

// ─── Factory: createBattlePassRewardGrantor ───────────────────────────────────

/**
 * Create a new `BattlePassRewardGrantor` instance.
 * Stateful (persists to localStorage) but purely logical — returns structured
 * results that the caller applies to actual game systems.
 *
 * @param seasonName  Optional label attached to grant history records.
 */
export function createBattlePassRewardGrantor(seasonName?: string): BattlePassRewardGrantor {
  let state = loadState()

  // New season → update label, reset first-claim bonus
  if (seasonName && state.seasonName !== seasonName) {
    state.seasonName = seasonName
    state.firstClaimBonusUsed = false
    saveState(state)
  }

  /** Append a grant record, respecting the 200-entry cap. */
  function pushHistory(record: GrantRecord): void {
    state.history.unshift(record)
    if (state.history.length > MAX_HISTORY) state.history.length = MAX_HISTORY
  }

  /** Build user-facing message for a granted reward. */
  function buildMessage(reward: RewardData, isNewType: boolean): string {
    const lbl = TYPE_LABELS[reward.type]
    if (reward.type === 'coins') return `${lbl.v} ${reward.value ?? 0} ${lbl.n}!`
    if (reward.type === 'xp_boost') return `${lbl.v} +${reward.value ?? 0}% ${lbl.n}!`
    return `${lbl.v} "${reward.name}" (${lbl.n})${isNewType ? ' — first of its kind!' : ''}`
  }

  // ── Public API ─────────────────────────────────────────────────────────

  const grantor: BattlePassRewardGrantor = {

    /**
     * Process a single reward.
     *
     * - Guards against double-grants (returns `success: false` if already claimed).
     * - Records the grant in persistent history.
     * - Marks the reward type as "seen" for first-of-type tracking.
     * - On the very first grant of a season, awards a +25 bonus coins message.
     *
     * **Important:** does NOT directly add coins, unlock skins, etc.
     * The caller reads the `GrantResult` and applies side-effects.
     */
    grantReward(reward: RewardData): GrantResult {
      if (state.grantedIds.includes(reward.id)) {
        return { success: false, rewardType: reward.type, rewardName: reward.name,
          message: `Reward "${reward.name}" has already been claimed.`, isNew: false }
      }

      state.grantedIds.push(reward.id)

      const isNew = !state.seenTypes.includes(reward.type)
      if (isNew) state.seenTypes.push(reward.type)

      // First-claim-of-season bonus: +25 bonus coins
      let bonusCoins = 0
      if (!state.firstClaimBonusUsed) { state.firstClaimBonusUsed = true; bonusCoins = 25 }

      pushHistory({
        rewardId: reward.id, rewardType: reward.type, rewardName: reward.name,
        tier: reward.tier, grantedAt: Date.now(), seasonName: state.seasonName,
      })
      saveState(state)

      const bonusMsg = bonusCoins > 0 ? ` (First-claim bonus: +${bonusCoins} coins!)` : ''
      return { success: true, rewardType: reward.type, rewardName: reward.name,
        message: `${buildMessage(reward, isNew)}${bonusMsg}`, isNew }
    },

    /**
     * Batch-process an array of rewards in order.
     *
     * Already-granted rewards are silently skipped (counted as `totalFailed`).
     * Coins are summed across all successful coin-type grants.
     * First-of-type unlocks are collected into `newUnlocks`.
     *
     * The caller should iterate `results` and apply each successful grant.
     */
    claimMultipleRewards(rewards: RewardData[]): BatchGrantResult {
      const results: GrantResult[] = []
      let totalGranted = 0, totalFailed = 0, coinsGranted = 0
      const newUnlocks: string[] = []

      for (const reward of rewards) {
        const result = grantor.grantReward(reward)
        results.push(result)
        if (result.success) {
          totalGranted++
          if (reward.type === 'coins') coinsGranted += reward.value ?? 0
          if (result.isNew && UNLOCKABLE_TYPES.has(reward.type)) newUnlocks.push(reward.id)
        } else { totalFailed++ }
      }

      return { results, totalGranted, totalFailed, coinsGranted, newUnlocks }
    },

    /**
     * Build a rich preview for a reward, showing its status, rarity, and
     * a type-specific descriptive prefix (e.g. "New snake skin: …").
     *
     * The `locked` status is **not** set by the grantor itself —
     * the caller should override it to `'locked'` when the player lacks
     * premium access for a premium-track reward.
     */
    getRewardPreview(reward: RewardData): RewardPreview {
      const granted = state.grantedIds.includes(reward.id)
      const rarity = rewardRarity(reward.tier, reward.isPremium)

      let desc = reward.description
      if (reward.type === 'coins') desc = `${reward.value ?? 0} coins will be added to your balance.`
      else if (reward.type === 'xp_boost') desc = `Permanent +${reward.value ?? 0}% XP bonus for all future games.`
      else if (DESC_PREFIX[reward.type]) desc = `${DESC_PREFIX[reward.type]}${reward.description}`

      return { type: reward.type, name: reward.name, description: desc,
        status: granted ? 'claimed' : 'available', rarity, emoji: reward.emoji ?? '🎁' }
    },

    /** Grant history, newest-first. */
    getGrantHistory(limit?: number): GrantRecord[] {
      return limit != null ? state.history.slice(0, limit) : [...state.history]
    },

    /** Aggregated summary of all grants. */
    getGrantSummary(): GrantSummary {
      const byType: Record<RewardType, number> =
        { coins: 0, skin: 0, title: 0, powerup: 0, wordpack: 0, avatar: 0, badge: 0, xp_boost: 0 }
      let totalCoinsGranted = 0, totalUnlocks = 0

      for (const rec of state.history) {
        byType[rec.rewardType]++
        if (rec.rewardType === 'coins') totalCoinsGranted += 0 // caller resolves from RewardData
        if (UNLOCKABLE_TYPES.has(rec.rewardType)) totalUnlocks++
      }

      return { totalGranted: state.history.length, byType, totalCoinsGranted, totalUnlocks }
    },

    /** Check if a specific reward ID has already been granted. */
    isRewardGranted(rewardId: string): boolean {
      return state.grantedIds.includes(rewardId)
    },

    /** Wipe all persisted state. */
    resetAll(): void {
      state = defaultState()
      if (typeof window !== 'undefined') {
        try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
      }
    },
  }

  return grantor
}
