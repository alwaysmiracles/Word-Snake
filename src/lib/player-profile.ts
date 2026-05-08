/**
 * Player Profile system for Word Snake game.
 * Client-side only — all localStorage access is guarded by try/catch.
 */

export const XP_PER_LEVEL = 100;
const STORAGE_KEY = 'ws_profile_data';

// -- Interfaces --

export interface Avatar {
  id: string; emoji: string; name: string; unlocked: boolean;
  unlockCondition: string; category: 'animal' | 'food' | 'object' | 'symbol' | 'fantasy';
}

export interface PlayerProfile {
  id: string; name: string; avatar: Avatar; createdAt: number; lastPlayedAt: number;
  totalGamesPlayed: number; totalScore: number; bestScore: number;
  totalWordsCollected: number; totalPlayTime: number; favoriteMode: string;
  favoriteCategory: string; titles: string[]; activeTitle: string | null;
  bio: string | null; level: number; xp: number; xpToNextLevel: number;
}

export interface PlayerTitle {
  id: string; name: string; description: string; condition: string; icon: string;
}

// -- Avatar catalogue: 24 avatars across 5 categories --

export const AVATARS: Avatar[] = [
  // animal (6)
  { id: 'snake', emoji: '🐍', name: 'Slithery Snake', unlocked: true, unlockCondition: 'Default avatar', category: 'animal' },
  { id: 'cat', emoji: '🐱', name: 'Cool Cat', unlocked: true, unlockCondition: 'Default avatar', category: 'animal' },
  { id: 'dog', emoji: '🐶', name: 'Loyal Dog', unlocked: false, unlockCondition: 'Play 10 games', category: 'animal' },
  { id: 'fox', emoji: '🦊', name: 'Clever Fox', unlocked: false, unlockCondition: 'Collect 30 words', category: 'animal' },
  { id: 'bunny', emoji: '🐰', name: 'Quick Bunny', unlocked: false, unlockCondition: 'Score 1000 pts', category: 'animal' },
  { id: 'panda', emoji: '🐼', name: 'Chill Panda', unlocked: false, unlockCondition: 'Play 50 games', category: 'animal' },
  // food (5)
  { id: 'apple', emoji: '🍎', name: 'Apple', unlocked: false, unlockCondition: 'Play 5 games', category: 'food' },
  { id: 'pizza', emoji: '🍕', name: 'Pizza', unlocked: false, unlockCondition: 'Score 500 pts', category: 'food' },
  { id: 'donut', emoji: '🍩', name: 'Donut', unlocked: false, unlockCondition: 'Get a 5x combo', category: 'food' },
  { id: 'cake', emoji: '🍰', name: 'Cake', unlocked: false, unlockCondition: 'Reach level 5', category: 'food' },
  { id: 'sushi', emoji: '🍣', name: 'Sushi', unlocked: false, unlockCondition: 'Collect 100 words', category: 'food' },
  // object (5)
  { id: 'star', emoji: '⭐', name: 'Star', unlocked: false, unlockCondition: 'Win first game', category: 'object' },
  { id: 'target', emoji: '🎯', name: 'Target', unlocked: false, unlockCondition: 'Master 10 words', category: 'object' },
  { id: 'gamepad', emoji: '🎮', name: 'Gamepad', unlocked: false, unlockCondition: 'Play all modes', category: 'object' },
  { id: 'music', emoji: '🎵', name: 'Music Note', unlocked: false, unlockCondition: 'Play 25 games', category: 'object' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket', unlocked: false, unlockCondition: 'Score 3000 pts', category: 'object' },
  // symbol (4)
  { id: 'diamond', emoji: '💎', name: 'Diamond', unlocked: false, unlockCondition: 'Master 20 words', category: 'symbol' },
  { id: 'fire', emoji: '🔥', name: 'Fire', unlocked: false, unlockCondition: 'Get a 10x combo', category: 'symbol' },
  { id: 'lightning', emoji: '⚡', name: 'Lightning', unlocked: false, unlockCondition: 'Complete speed run', category: 'symbol' },
  { id: 'sparkle', emoji: '🌟', name: 'Sparkle', unlocked: false, unlockCondition: 'Reach level 10', category: 'symbol' },
  // fantasy (4)
  { id: 'wizard', emoji: '🧙', name: 'Wizard', unlocked: false, unlockCondition: 'Collect 200 words', category: 'fantasy' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn', unlocked: false, unlockCondition: 'Score 5000 pts', category: 'fantasy' },
  { id: 'dragon', emoji: '🐉', name: 'Dragon', unlocked: false, unlockCondition: 'Play 100 games', category: 'fantasy' },
  { id: 'elf', emoji: '🧝', name: 'Elf', unlocked: false, unlockCondition: 'Unlock 10 titles', category: 'fantasy' },
];

// -- Title catalogue: 12 unlockable titles --

export const PLAYER_TITLES: PlayerTitle[] = [
  { id: 'beginner', name: 'Beginner', description: 'Play your first game', condition: 'totalGamesPlayed >= 1', icon: '🌱' },
  { id: 'word_collector', name: 'Word Collector', description: 'Collect 50 words', condition: 'totalWordsCollected >= 50', icon: '📚' },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a speed run', condition: 'favoriteMode === "speed"', icon: '⚡' },
  { id: 'combo_king', name: 'Combo King', description: 'Get a 10x combo', condition: 'bestScore >= 800', icon: '🔥' },
  { id: 'achievement_hunter', name: 'Achievement Hunter', description: 'Unlock 10 achievements', condition: 'totalGamesPlayed >= 20', icon: '🏆' },
  { id: 'daily_player', name: 'Daily Player', description: 'Play 7 daily challenges', condition: 'totalGamesPlayed >= 7', icon: '📅' },
  { id: 'marathon_runner', name: 'Marathon Runner', description: 'Play a marathon mode game', condition: 'favoriteMode === "marathon"', icon: '🏃' },
  { id: 'night_owl', name: 'Night Owl', description: 'Play between 11pm-5am', condition: 'totalPlayTime >= 0', icon: '🌙' },
  { id: 'veteran', name: 'Veteran', description: 'Play 100 games', condition: 'totalGamesPlayed >= 100', icon: '🎖️' },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Master 20 words', condition: 'totalScore >= 4000', icon: '💎' },
  { id: 'legend', name: 'Legend', description: 'Score 5000+ in one game', condition: 'bestScore >= 5000', icon: '👑' },
  { id: 'word_master', name: 'Word Master', description: 'Collect 200 unique words', condition: 'totalWordsCollected >= 200', icon: '🎓' },
];

// -- Internal helpers --

function generateId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const avatarById = (id: string) => AVATARS.find((a) => a.id === id);
const titleById = (id: string) => PLAYER_TITLES.find((t) => t.id === id);

// -- Core profile CRUD --

export function createDefaultProfile(): PlayerProfile {
  return {
    id: generateId(), name: 'Player', avatar: { ...AVATARS[0] },
    createdAt: Date.now(), lastPlayedAt: Date.now(),
    totalGamesPlayed: 0, totalScore: 0, bestScore: 0,
    totalWordsCollected: 0, totalPlayTime: 0,
    favoriteMode: 'classic', favoriteCategory: 'general',
    titles: [], activeTitle: null, bio: null,
    level: 1, xp: 0, xpToNextLevel: XP_PER_LEVEL,
  };
}

export function loadProfile(): PlayerProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlayerProfile) : null;
  } catch { return null; }
}

export function saveProfile(profile: PlayerProfile): boolean {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); return true; } catch { return false; }
}

export function resetProfile(): PlayerProfile {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  return createDefaultProfile();
}

// -- Mutators --

export function setPlayerName(profile: PlayerProfile, name: string): PlayerProfile {
  return { ...profile, name: name.trim().slice(0, 24) || profile.name };
}

export function setAvatar(profile: PlayerProfile, avatarId: string): PlayerProfile {
  const av = avatarById(avatarId);
  if (!av || !av.unlocked) return profile;
  return { ...profile, avatar: { ...av } };
}

export function unlockAvatar(profile: PlayerProfile, avatarId: string): PlayerProfile {
  const src = avatarById(avatarId);
  if (!src || src.unlocked) return profile;
  if (profile.avatar.id === avatarId) {
    return { ...profile, avatar: { ...src, unlocked: true } };
  }
  return profile;
}

export function setActiveTitle(profile: PlayerProfile, titleId: string): PlayerProfile {
  if (!profile.titles.includes(titleId)) return profile;
  return { ...profile, activeTitle: titleId };
}

// -- XP & levelling --

export function calculateLevel(xp: number): {
  level: number; currentXp: number; xpToNext: number; progress: number;
} {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const currentXp = xp % XP_PER_LEVEL;
  return { level, currentXp, xpToNext: XP_PER_LEVEL, progress: currentXp / XP_PER_LEVEL };
}

export function addXP(profile: PlayerProfile, amount: number): {
  profile: PlayerProfile; leveledUp: boolean; newLevel: number;
} {
  const newXp = profile.xp + amount;
  const { level: newLevel } = calculateLevel(newXp);
  const leveledUp = newLevel > profile.level;
  return {
    profile: { ...profile, xp: newXp, level: newLevel, xpToNextLevel: XP_PER_LEVEL },
    leveledUp, newLevel,
  };
}

// -- Title unlock checks --

export function checkTitleUnlocks(profile: PlayerProfile): PlayerTitle[] {
  const hour = new Date().getHours();
  const isNightOwl = hour >= 23 || hour < 5;

  const checks: Record<string, boolean> = {
    beginner: profile.totalGamesPlayed >= 1,
    word_collector: profile.totalWordsCollected >= 50,
    speed_demon: profile.favoriteMode === 'speed',
    combo_king: profile.bestScore >= 800,
    achievement_hunter: profile.totalGamesPlayed >= 20,
    daily_player: profile.totalGamesPlayed >= 7,
    marathon_runner: profile.favoriteMode === 'marathon',
    night_owl: isNightOwl,
    veteran: profile.totalGamesPlayed >= 100,
    perfectionist: profile.totalScore >= 4000,
    legend: profile.bestScore >= 5000,
    word_master: profile.totalWordsCollected >= 200,
  };

  return PLAYER_TITLES.filter((t) => !profile.titles.includes(t.id) && checks[t.id]);
}

// -- Queries --

export function getUnlockedAvatars(profile: PlayerProfile): Avatar[] {
  return AVATARS.filter((a) => a.unlocked || profile.avatar.id === a.id);
}

export function getUnlockedTitles(profile: PlayerProfile): PlayerTitle[] {
  return PLAYER_TITLES.filter((t) => profile.titles.includes(t.id));
}

export function getProfileSummary(profile: PlayerProfile): string {
  const t = profile.activeTitle ? titleById(profile.activeTitle) : null;
  const tag = t ? ` ${t.icon} ${t.name}` : '';
  return [
    `${profile.avatar.emoji} ${profile.name}${tag}`,
    `Level ${profile.level}  ·  ${profile.xp} / ${profile.xpToNextLevel} XP`, '',
    `Games Played:     ${profile.totalGamesPlayed}`,
    `Total Score:      ${profile.totalScore.toLocaleString()}`,
    `Best Score:       ${profile.bestScore.toLocaleString()}`,
    `Words Collected:  ${profile.totalWordsCollected}`,
    `Play Time:        ${Math.floor(profile.totalPlayTime / 60)}m ${profile.totalPlayTime % 60}s`,
    `Titles Unlocked:  ${profile.titles.length} / ${PLAYER_TITLES.length}`,
    `Avatars Unlocked: ${getUnlockedAvatars(profile).length} / ${AVATARS.length}`,
  ].join('\n');
}

// -- Profile card data for UI rendering --

export interface ProfileCardData {
  name: string; avatar: Avatar; title: string | null; titleIcon: string | null;
  level: number; xpProgress: number;
  stats: { gamesPlayed: number; totalScore: number; bestScore: number; wordsCollected: number; titlesCount: number; avatarsCount: number };
}

export function getProfileCard(profile: PlayerProfile): ProfileCardData {
  const active = profile.activeTitle ? titleById(profile.activeTitle) : null;
  return {
    name: profile.name, avatar: profile.avatar,
    title: active?.name ?? null, titleIcon: active?.icon ?? null,
    level: profile.level, xpProgress: calculateLevel(profile.xp).progress,
    stats: {
      gamesPlayed: profile.totalGamesPlayed, totalScore: profile.totalScore,
      bestScore: profile.bestScore, wordsCollected: profile.totalWordsCollected,
      titlesCount: profile.titles.length, avatarsCount: getUnlockedAvatars(profile).length,
    },
  };
}

// -- Import / Export --

export function exportProfile(profile: PlayerProfile): string {
  return JSON.stringify(profile, null, 2);
}

export function importProfile(json: string): PlayerProfile | null {
  try {
    const p = JSON.parse(json);
    if (!p || typeof p.id !== 'string') return null;
    const defaults = createDefaultProfile();
    return {
      ...defaults, ...p,
      avatar: p.avatar?.id ? { ...defaults.avatar, ...p.avatar } : defaults.avatar,
    } as PlayerProfile;
  } catch { return null; }
}
