// ─── Battle Pass / Season Pass Progression System ───────────────────────────
// Tracks seasonal progression with tiered rewards for Word Snake.

// ─── Types ───────────────────────────────────────────────────────────────────

export type RewardType = 'coin' | 'skin' | 'powerup' | 'title' | 'avatar' | 'wordpack' | 'badge';
export type RewardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BattlePassReward {
  tier: number;
  type: RewardType;
  name: string;
  description: string;
  emoji: string;
  rarity: RewardRarity;
  isUnlocked: boolean;
  isClaimed: boolean;
  isPremium: boolean;
}

export interface BattlePassSeason {
  id: string;
  name: string;
  theme: string;
  emoji: string;
  startDate: string;
  endDate: string;
  totalTiers: number;
  currentTier: number;
  xpPerTier: number[];
  currentXP: number;
  isPremium: boolean;
  isCompleted: boolean;
  rewards: BattlePassReward[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const TIER_XP_CONFIG: number[] = [
  100, 120, 150, 180, 220, 270, 330, 400,
  480, 570, 670, 780, 900, 1050, 1200,
  1400, 1600, 1850, 2100, 2400, 2750,
  3100, 3500, 4000, 4500,
];

const STORAGE_KEY = 'ws_battle_pass';
const ARCHIVE_IDX_KEY = 'ws_bp_archive_idx';
const ARCHIVE_LIST_KEY = 'ws_season_archives';
const SEASON_DAYS = 30;

// ─── Season Templates (compact data-driven) ──────────────────────────────────

interface RewardDef { type: RewardType; name: string; desc: string; emoji: string; rarity: RewardRarity }
interface SeasonTemplate { name: string; theme: string; emoji: string; free: RewardDef[]; premium: RewardDef[] }

const SEASON_TEMPLATES: SeasonTemplate[] = [
  { name: 'Spring Blossom', theme: 'garden-nature', emoji: '🌸', free: [
    { type:'coin', name:'Seedling Stash', desc:'50 coins to start planting!', emoji:'🌱', rarity:'common' },
    { type:'badge', name:'Petal Collector', desc:'Collect 100 petals in games.', emoji:'🌷', rarity:'common' },
    { type:'coin', name:'Garden Fund', desc:'100 coins for your garden.', emoji:'💰', rarity:'common' },
    { type:'powerup', name:'Bloom Boost', desc:'+1 word multiplier for 30 s.', emoji:'🌼', rarity:'rare' },
    { type:'badge', name:'Budding Scholar', desc:'Spell 50 unique words.', emoji:'🌿', rarity:'rare' },
    { type:'coin', name:'Petal Purse', desc:'150 coins of blossom.', emoji:'🏵️', rarity:'common' },
    { type:'badge', name:'Cherry Bloom', desc:'Reach a 10× combo.', emoji:'🌸', rarity:'epic' },
    { type:'coin', name:'Orchard Hoard', desc:'200 orchard coins.', emoji:'🍎', rarity:'common' },
    { type:'powerup', name:'Root Shield', desc:'Block one obstacle hit.', emoji:'🛡️', rarity:'epic' },
    { type:'badge', name:'Meadow Master', desc:'Play 25 games this season.', emoji:'🌳', rarity:'rare' },
    { type:'coin', name:'Harvest Basket', desc:'300 harvest coins.', emoji:'🧺', rarity:'common' },
    { type:'badge', name:'Forest Sage', desc:'Score 5000+ in one game.', emoji:'🌲', rarity:'epic' },
    { type:'coin', name:'Spring Bounty', desc:'400 spring coins.', emoji:'💐', rarity:'common' },
  ], premium: [
    { type:'skin', name:'Blossom Serpent', desc:'Cherry-blossom wrapped snake.', emoji:'🌸', rarity:'rare' },
    { type:'title', name:'Garden Guardian', desc:'Title: Garden Guardian', emoji:'🌻', rarity:'rare' },
    { type:'avatar', name:'Petal Face', desc:'Falling-petal avatar frame.', emoji:'🌺', rarity:'epic' },
    { type:'wordpack', name:'Botanist Pack', desc:'50 nature & plant words.', emoji:'🌱', rarity:'rare' },
    { type:'skin', name:'Ivy Coils', desc:'Serpent made of living ivy.', emoji:'🍃', rarity:'epic' },
    { type:'powerup', name:'Photosynthesis', desc:'Auto-heal one obstacle hit.', emoji:'☀️', rarity:'epic' },
    { type:'title', name:'Verdant Viper', desc:'Title: Verdant Viper', emoji:'🐍', rarity:'epic' },
    { type:'avatar', name:'Moss Crown', desc:'Glowing moss crown avatar.', emoji:'👑', rarity:'legendary' },
    { type:'skin', name:'Rainbow Fern', desc:'Shimmering fern-patterned snake.', emoji:'🌈', rarity:'legendary' },
    { type:'wordpack', name:'Flora Master Pack', desc:'100 advanced botanical terms.', emoji:'🌺', rarity:'legendary' },
    { type:'title', name:'Petal Sovereign', desc:'Title: Petal Sovereign', emoji:'👑', rarity:'legendary' },
    { type:'avatar', name:'Enchanted Grove', desc:'Glowing grove avatar scene.', emoji:'✨', rarity:'legendary' },
    { type:'powerup', name:'Bloom Cascade', desc:'Chain 3 words at 2× XP.', emoji:'💫', rarity:'legendary' },
  ]},
  { name: 'Summer Blaze', theme: 'fire-beach', emoji: '☀️', free: [
    { type:'coin', name:'Sizzle Stash', desc:'50 coins warmed by the sun.', emoji:'🔥', rarity:'common' },
    { type:'badge', name:'Sun Seeker', desc:'Play 10 daytime games.', emoji:'🏖️', rarity:'common' },
    { type:'coin', name:'Beach Bucks', desc:'100 sandy coins.', emoji:'🐚', rarity:'common' },
    { type:'powerup', name:'Heat Wave', desc:'Speed boost for 20 s.', emoji:'🌡️', rarity:'rare' },
    { type:'badge', name:'Wave Rider', desc:'Survive 5 obstacle waves.', emoji:'🌊', rarity:'rare' },
    { type:'coin', name:'Tide Pool', desc:'150 tide coins.', emoji:'🪸', rarity:'common' },
    { type:'badge', name:'Blazing Scholar', desc:'Spell 75 unique words.', emoji:'🌋', rarity:'epic' },
    { type:'coin', name:'Lava Loot', desc:'200 lava coins.', emoji:'💎', rarity:'common' },
    { type:'powerup', name:'Solar Flare', desc:'Reveal 3 hidden words.', emoji:'💫', rarity:'epic' },
    { type:'badge', name:'Sunset Sage', desc:'Play 25 games this season.', emoji:'🌅', rarity:'rare' },
    { type:'coin', name:'Blaze Bag', desc:'300 fiery coins.', emoji:'🔥', rarity:'common' },
    { type:'badge', name:'Inferno Ace', desc:'Score 8000+ in one game.', emoji:'☄️', rarity:'epic' },
    { type:'coin', name:'Phoenix Fund', desc:'400 phoenix coins.', emoji:'🦅', rarity:'common' },
  ], premium: [
    { type:'skin', name:'Ember Serpent', desc:'Snake of living flame.', emoji:'🔥', rarity:'rare' },
    { type:'title', name:'Beach Baron', desc:'Title: Beach Baron', emoji:'🏖️', rarity:'rare' },
    { type:'avatar', name:'Sun Halo', desc:'Radiant sun halo avatar.', emoji:'☀️', rarity:'epic' },
    { type:'wordpack', name:'Summer Vocabulary', desc:'50 summer-themed words.', emoji:'🍉', rarity:'rare' },
    { type:'skin', name:'Lava Coil', desc:'Molten rock serpent.', emoji:'🌋', rarity:'epic' },
    { type:'powerup', name:'Heat Shield', desc:'Immune to obstacles for 15 s.', emoji:'🛡️', rarity:'epic' },
    { type:'title', name:'Inferno Lord', desc:'Title: Inferno Lord', emoji:'🐉', rarity:'epic' },
    { type:'avatar', name:'Solar Crown', desc:'Burning solar crown frame.', emoji:'👑', rarity:'legendary' },
    { type:'skin', name:'Phoenix Plume', desc:'Phoenix-feathered snake.', emoji:'🦅', rarity:'legendary' },
    { type:'wordpack', name:'Equinox Pack', desc:'100 advanced weather words.', emoji:'⛈️', rarity:'legendary' },
    { type:'title', name:'Blaze Sovereign', desc:'Title: Blaze Sovereign', emoji:'👑', rarity:'legendary' },
    { type:'avatar', name:'Volcanic Throne', desc:'Erupting volcano avatar.', emoji:'🌋', rarity:'legendary' },
    { type:'powerup', name:'Supernova', desc:'All XP doubled for 60 s.', emoji:'💫', rarity:'legendary' },
  ]},
  { name: 'Autumn Harvest', theme: 'harvest-amber', emoji: '🍂', free: [
    { type:'coin', name:'Acorn Purse', desc:'50 autumn coins.', emoji:'🌰', rarity:'common' },
    { type:'badge', name:'Leaf Peeper', desc:'Play 10 games in autumn.', emoji:'🍁', rarity:'common' },
    { type:'coin', name:'Harvest Hoard', desc:'100 harvest coins.', emoji:'🌾', rarity:'common' },
    { type:'powerup', name:'Harvest Moon', desc:'2× coin earnings for 60 s.', emoji:'🌙', rarity:'rare' },
    { type:'badge', name:'Haystack Hero', desc:'Find 20 hidden words.', emoji:'🥮', rarity:'rare' },
    { type:'coin', name:'Pumpkin Patch', desc:'150 pumpkin coins.', emoji:'🎃', rarity:'common' },
    { type:'badge', name:'Maple Master', desc:'Spell 50 unique words.', emoji:'🍁', rarity:'epic' },
    { type:'coin', name:'Cornucopia', desc:'200 bounty coins.', emoji:'🫙', rarity:'common' },
    { type:'powerup', name:'Autumn Wind', desc:'Slow obstacles for 20 s.', emoji:'💨', rarity:'epic' },
    { type:'badge', name:'Frost & Fire', desc:'Play 25 games this season.', emoji:'🌾', rarity:'rare' },
    { type:'coin', name:'Amber Trove', desc:'300 amber coins.', emoji:'🪨', rarity:'common' },
    { type:'badge', name:'Harvest Sage', desc:'Score 6000+ in one game.', emoji:'🍂', rarity:'epic' },
    { type:'coin', name:'Equinox Endow', desc:'400 equinox coins.', emoji:'🪙', rarity:'common' },
  ], premium: [
    { type:'skin', name:'Autumn Viper', desc:'Snake of falling leaves.', emoji:'🍂', rarity:'rare' },
    { type:'title', name:'Harvest King', desc:'Title: Harvest King', emoji:'🌾', rarity:'rare' },
    { type:'avatar', name:'Amber Frame', desc:'Amber-encrusted avatar frame.', emoji:'🪨', rarity:'epic' },
    { type:'wordpack', name:'Harvest Words', desc:'50 harvest & autumn words.', emoji:'🎃', rarity:'rare' },
    { type:'skin', name:'Maple Drift', desc:'Maple-leaf patterned snake.', emoji:'🍁', rarity:'epic' },
    { type:'powerup', name:'Bounty Rush', desc:'Triple coins for next 3 words.', emoji:'💰', rarity:'epic' },
    { type:'title', name:'Amber Archon', desc:'Title: Amber Archon', emoji:'👑', rarity:'epic' },
    { type:'avatar', name:'Crown of Leaves', desc:'Wreath-of-leaves crown.', emoji:'👑', rarity:'legendary' },
    { type:'skin', name:'Golden Stag', desc:'Golden-antler serpent.', emoji:'🦌', rarity:'legendary' },
    { type:'wordpack', name:'Folklore Pack', desc:'100 folklore & myth words.', emoji:'📖', rarity:'legendary' },
    { type:'title', name:'Harvest Sovereign', desc:'Title: Harvest Sovereign', emoji:'👑', rarity:'legendary' },
    { type:'avatar', name:'Twilight Hearth', desc:'Warm fireside avatar scene.', emoji:'🔥', rarity:'legendary' },
    { type:'powerup', name:'Full Moon', desc:'All bonuses active for 45 s.', emoji:'🌕', rarity:'legendary' },
  ]},
  { name: 'Winter Frost', theme: 'ice-snow', emoji: '❄️', free: [
    { type:'coin', name:'Snowflake Stash', desc:'50 frosty coins.', emoji:'❄️', rarity:'common' },
    { type:'badge', name:'Frost Walker', desc:'Play 10 winter games.', emoji:'🌨️', rarity:'common' },
    { type:'coin', name:'Ice Cache', desc:'100 ice coins.', emoji:'🧊', rarity:'common' },
    { type:'powerup', name:'Blizzard', desc:'Freeze all obstacles for 15 s.', emoji:'🌨️', rarity:'rare' },
    { type:'badge', name:'Snow Scholar', desc:'Spell 40 unique words.', emoji:'⛄', rarity:'rare' },
    { type:'coin', name:'Frost Fund', desc:'150 frost coins.', emoji:'❄️', rarity:'common' },
    { type:'badge', name:'Ice Crystal', desc:'Reach a 15× combo.', emoji:'💎', rarity:'epic' },
    { type:'coin', name:'Glacier Gold', desc:'200 glacier coins.', emoji:'🏔️', rarity:'common' },
    { type:'powerup', name:'Frost Nova', desc:'Clear surrounding obstacles.', emoji:'❄️', rarity:'epic' },
    { type:'badge', name:'Tundra Titan', desc:'Play 25 games this season.', emoji:'🦣', rarity:'rare' },
    { type:'coin', name:'Polar Purse', desc:'300 polar coins.', emoji:'🫧', rarity:'common' },
    { type:'badge', name:'Frostbite Ace', desc:'Score 7000+ in one game.', emoji:'🧊', rarity:'epic' },
    { type:'coin', name:'Solstice Stash', desc:'400 solstice coins.', emoji:'✨', rarity:'common' },
  ], premium: [
    { type:'skin', name:'Frost Serpent', desc:'Snake of crystalline ice.', emoji:'❄️', rarity:'rare' },
    { type:'title', name:'Ice Warden', desc:'Title: Ice Warden', emoji:'🧊', rarity:'rare' },
    { type:'avatar', name:'Frost Frame', desc:'Icicle-ringed avatar frame.', emoji:'🧊', rarity:'epic' },
    { type:'wordpack', name:'Winter Words', desc:'50 winter & ice words.', emoji:'⛄', rarity:'rare' },
    { type:'skin', name:'Glacier Worm', desc:'Translucent glacier serpent.', emoji:'🏔️', rarity:'epic' },
    { type:'powerup', name:'Aurora Shield', desc:'Invincibility for 10 s.', emoji:'🌌', rarity:'epic' },
    { type:'title', name:'Permafrost Lord', desc:'Title: Permafrost Lord', emoji:'👑', rarity:'epic' },
    { type:'avatar', name:'Crystal Crown', desc:'Ice crystal crown frame.', emoji:'👑', rarity:'legendary' },
    { type:'skin', name:'Northern Lights', desc:'Aurora-borealis-patterned snake.', emoji:'🌌', rarity:'legendary' },
    { type:'wordpack', name:'Aurora Pack', desc:'100 celestial & sky words.', emoji:'🌌', rarity:'legendary' },
    { type:'title', name:'Frost Sovereign', desc:'Title: Frost Sovereign', emoji:'👑', rarity:'legendary' },
    { type:'avatar', name:'Frozen Throne', desc:'Ice throne avatar scene.', emoji:'🪑', rarity:'legendary' },
    { type:'powerup', name:'Absolute Zero', desc:'Freeze time for 30 s.', emoji:'🧊', rarity:'legendary' },
  ]},
  { name: 'Mystic Legends', theme: 'magic-purple-gold', emoji: '✨', free: [
    { type:'coin', name:'Mystic Dust', desc:'50 enchanted coins.', emoji:'✨', rarity:'common' },
    { type:'badge', name:'Apprentice', desc:'Complete your first mystic game.', emoji:'🔮', rarity:'common' },
    { type:'coin', name:'Arcane Purse', desc:'100 arcane coins.', emoji:'💰', rarity:'common' },
    { type:'powerup', name:'Mana Surge', desc:'+2 word multiplier for 25 s.', emoji:'⚡', rarity:'rare' },
    { type:'badge', name:'Rune Reader', desc:'Spell 60 unique words.', emoji:'📜', rarity:'rare' },
    { type:'coin', name:'Spellgold', desc:'150 spell coins.', emoji:'🪙', rarity:'common' },
    { type:'badge', name:'Enchanter', desc:'Reach a 12× combo.', emoji:'🧙', rarity:'epic' },
    { type:'coin', name:'Oracle Hoard', desc:'200 oracle coins.', emoji:'🔮', rarity:'common' },
    { type:'powerup', name:'Arcane Blast', desc:'Destroy all nearby obstacles.', emoji:'💥', rarity:'epic' },
    { type:'badge', name:'Mystic Adept', desc:'Play 25 games this season.', emoji:'⭐', rarity:'rare' },
    { type:'coin', name:'Legend Loot', desc:'300 legend coins.', emoji:'💎', rarity:'common' },
    { type:'badge', name:'Archmage', desc:'Score 10000+ in one game.', emoji:'🧙‍♂️', rarity:'epic' },
    { type:'coin', name:'Mythic Stash', desc:'400 mythic coins.', emoji:'👑', rarity:'common' },
  ], premium: [
    { type:'skin', name:'Arcane Serpent', desc:'Snake woven from pure magic.', emoji:'🔮', rarity:'rare' },
    { type:'title', name:'Mystic Adept', desc:'Title: Mystic Adept', emoji:'✨', rarity:'rare' },
    { type:'avatar', name:'Crystal Orb', desc:'Floating orb avatar frame.', emoji:'🔮', rarity:'epic' },
    { type:'wordpack', name:'Arcane Lexicon', desc:'50 magic & fantasy words.', emoji:'📖', rarity:'rare' },
    { type:'skin', name:'Starweaver', desc:'Constellation-patterned serpent.', emoji:'🌌', rarity:'epic' },
    { type:'powerup', name:'Teleport', desc:'Teleport to any board position.', emoji:'⚡', rarity:'epic' },
    { type:'title', name:'Grand Sorcerer', desc:'Title: Grand Sorcerer', emoji:'🧙', rarity:'epic' },
    { type:'avatar', name:'Celestial Crown', desc:'Star-studded crown frame.', emoji:'👑', rarity:'legendary' },
    { type:'skin', name:'Void Serpent', desc:'Snake from between worlds.', emoji:'🕳️', rarity:'legendary' },
    { type:'wordpack', name:'Mythos Collection', desc:'100 mythology words.', emoji:'📜', rarity:'legendary' },
    { type:'title', name:'Legendary Sovereign', desc:'Title: Legendary Sovereign', emoji:'👑', rarity:'legendary' },
    { type:'avatar', name:'Cosmic Throne', desc:'Cosmic void throne avatar.', emoji:'🌌', rarity:'legendary' },
    { type:'powerup', name:'Omniscience', desc:'Reveal every word on the board.', emoji:'👁️', rarity:'legendary' },
  ]},
];

// ─── Storage Helpers ─────────────────────────────────────────────────────────

function loadPass(): BattlePassSeason | null {
  if (typeof window === 'undefined') return null;
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) as BattlePassSeason : null; }
  catch { return null; }
}

function savePass(p: BattlePassSeason): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* full */ }
}

function loadIdx(): number {
  if (typeof window === 'undefined') return 0;
  try { const r = localStorage.getItem(ARCHIVE_IDX_KEY); return r ? JSON.parse(r) as number : 0; } catch { return 0; }
}

function saveIdx(i: number): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(ARCHIVE_IDX_KEY, JSON.stringify(i)); } catch { /* full */ }
}

function seasonDates(): { start: string; end: string } {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const end = new Date(now); end.setDate(end.getDate() + SEASON_DAYS);
  return { start: now.toISOString(), end: end.toISOString() };
}

// ─── Core Functions ──────────────────────────────────────────────────────────

/** Generate 25 tiers × 2 tracks of rewards from a season template. */
export function generateRewards(template: SeasonTemplate): BattlePassReward[] {
  const out: BattlePassReward[] = [];
  for (let i = 0; i < 25; i++) {
    const tier = i + 1;
    const fd = template.free[i % template.free.length];
    const pd = template.premium[i % template.premium.length];
    out.push({ tier, type: fd.type, name: fd.name, description: fd.desc, emoji: fd.emoji, rarity: fd.rarity, isUnlocked: false, isClaimed: false, isPremium: false });
    out.push({ tier, type: pd.type, name: pd.name, description: pd.desc, emoji: pd.emoji, rarity: pd.rarity, isUnlocked: false, isClaimed: false, isPremium: true });
  }
  return out;
}

/** Create or load the current battle pass from localStorage. */
export function createBattlePass(seasonId?: number): BattlePassSeason {
  const existing = loadPass();
  if (existing && !existing.isCompleted) return existing;

  const idx = seasonId ?? loadIdx() % SEASON_TEMPLATES.length;
  const tpl = SEASON_TEMPLATES[idx];
  const { start, end } = seasonDates();

  const pass: BattlePassSeason = {
    id: `season_${Date.now()}`,
    name: tpl.name, theme: tpl.theme, emoji: tpl.emoji,
    startDate: start, endDate: end,
    totalTiers: 25, currentTier: 1, xpPerTier: [...TIER_XP_CONFIG],
    currentXP: 0, isPremium: false, isCompleted: false,
    rewards: generateRewards(tpl),
  };
  savePass(pass);
  return pass;
}

/** Add XP, auto-advance tiers, unlock rewards. */
export function addBattlePassXP(pass: BattlePassSeason, xp: number): {
  tiersGained: number; newUnlocks: number; tierUp: boolean;
} {
  pass.currentXP += xp;
  let tiersGained = 0, newUnlocks = 0, tierUp = false;

  while (pass.currentTier <= pass.totalTiers && pass.currentXP >= pass.xpPerTier[pass.currentTier - 1]) {
    pass.currentXP -= pass.xpPerTier[pass.currentTier - 1];
    pass.currentTier++;
    tiersGained++; tierUp = true;
  }

  if (pass.currentTier > pass.totalTiers) {
    pass.currentTier = pass.totalTiers; pass.currentXP = 0; pass.isCompleted = true;
  }

  for (const r of pass.rewards) {
    if (!r.isUnlocked && r.tier <= pass.currentTier) { r.isUnlocked = true; newUnlocks++; }
  }

  savePass(pass);
  return { tiersGained, newUnlocks, tierUp };
}

/** Claim a specific tier reward (premium gating enforced). */
export function claimReward(pass: BattlePassSeason, tier: number): {
  success: boolean; reward?: BattlePassReward; reason?: string;
} {
  const r = pass.rewards.find(w => w.tier === tier && w.isUnlocked && !w.isClaimed);
  if (!r) return { success: false, reason: 'No claimable reward at this tier.' };
  if (r.isPremium && !pass.isPremium) return { success: false, reason: 'Premium pass required.' };
  r.isClaimed = true; savePass(pass);
  return { success: true, reward: r };
}

/** Claim all currently unlockable rewards (respects premium). */
export function claimAllRewards(pass: BattlePassSeason): {
  claimed: BattlePassReward[]; skipped: BattlePassReward[];
} {
  const claimed: BattlePassReward[] = [], skipped: BattlePassReward[] = [];
  for (const r of pass.rewards) {
    if (!r.isUnlocked || r.isClaimed) continue;
    if (r.isPremium && !pass.isPremium) { skipped.push(r); continue; }
    r.isClaimed = true; claimed.push(r);
  }
  savePass(pass);
  return { claimed, skipped };
}

/** Detailed tier progress info. */
export function getTierProgress(pass: BattlePassSeason): {
  currentTier: number; xpInTier: number; xpNeeded: number;
  percentToNext: number; totalXP: number; totalPercent: number;
} {
  const ct = pass.currentTier;
  const xpIn = pass.isCompleted ? 0 : pass.currentXP;
  const xpNeed = pass.isCompleted ? 0 : pass.xpPerTier[Math.min(ct - 1, 24)];
  const pct = pass.isCompleted ? 100 : (xpNeed > 0 ? Math.min(xpIn / xpNeed * 100, 100) : 100);
  const earned = pass.xpPerTier.slice(0, ct - 1).reduce((a, b) => a + b, 0);
  const totalMax = pass.xpPerTier.reduce((a, b) => a + b, 0);
  return {
    currentTier: ct, xpInTier: xpIn, xpNeeded: xpNeed,
    percentToNext: pct, totalXP: earned + xpIn,
    totalPercent: totalMax > 0 ? Math.min((earned + xpIn) / totalMax * 100, 100) : 100,
  };
}

/** Time remaining until the season ends. */
export function getSeasonTimeRemaining(pass: BattlePassSeason): {
  days: number; hours: number; formatted: string; expired: boolean;
} {
  const diff = Math.max(new Date(pass.endDate).getTime() - Date.now(), 0);
  const expired = diff === 0;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  parts.push(`${hours}h`);
  return { days, hours, formatted: parts.join(' '), expired };
}

/** Summary snapshot of current battle pass state. */
export function getPassSummary(pass: BattlePassSeason): {
  season: string; emoji: string; currentTier: number; totalTiers: number;
  completionPercent: number; unclaimedRewards: number;
  premiumBenefits: number; isPremium: boolean;
} {
  const unclaimed = pass.rewards.filter(r => r.isUnlocked && !r.isClaimed).length;
  const premBenefits = pass.rewards.filter(r => r.isPremium && r.isUnlocked).length;
  return {
    season: pass.name, emoji: pass.emoji,
    currentTier: pass.currentTier, totalTiers: pass.totalTiers,
    completionPercent: Math.round((pass.currentTier - 1) / pass.totalTiers * 1000) / 10,
    unclaimedRewards: unclaimed, premiumBenefits: premBenefits,
    isPremium: pass.isPremium,
  };
}

/** Toggle premium status (free for this game). */
export function unlockPremium(pass: BattlePassSeason): BattlePassSeason {
  pass.isPremium = !pass.isPremium; savePass(pass); return pass;
}

/** Preview a reward at a given tier / track. */
export function getRewardPreview(pass: BattlePassSeason, tier: number, isPremium: boolean): BattlePassReward | null {
  return pass.rewards.find(r => r.tier === tier && r.isPremium === isPremium) ?? null;
}

/** Check if the season is currently active. */
export function isActive(pass: BattlePassSeason): boolean {
  const now = Date.now();
  return now >= new Date(pass.startDate).getTime() && now < new Date(pass.endDate).getTime();
}

/** Advance to the next season, archiving current progress. */
export function advanceSeason(): BattlePassSeason {
  const cur = loadPass();
  if (cur) {
    try {
      const raw = localStorage.getItem(ARCHIVE_LIST_KEY) ?? '[]';
      const arcs = JSON.parse(raw) as Array<{ name: string; tier: number; completedAt: string }>;
      arcs.push({ name: cur.name, tier: cur.currentTier, completedAt: new Date().toISOString() });
      if (arcs.length > 20) arcs.splice(0, arcs.length - 20);
      localStorage.setItem(ARCHIVE_LIST_KEY, JSON.stringify(arcs));
    } catch { /* archive fail */ }
  }
  const next = (loadIdx() + 1) % SEASON_TEMPLATES.length;
  saveIdx(next);
  localStorage.removeItem(STORAGE_KEY);
  return createBattlePass(next);
}
