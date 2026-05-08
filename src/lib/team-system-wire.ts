// ============================================================================
// Team System Wire — Word Snake Game
// Storage key: ws_team_system_wire
// 35 exported standalone functions · localStorage persistence
// ============================================================================

// ---- TypeScript Types -----------------------------------------------------

export type TeamRole = 'Captain' | 'Co-Captain' | 'Member';

export interface TeamMember {
  username: string;
  displayName: string;
  avatar: string;
  role: TeamRole;
  joinedAt: string;
  lastActive: string;
  wordsContributed: number;
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
}

export interface TeamChat {
  id: string;
  from: string;
  fromAvatar: string;
  content: string;
  timestamp: string;
  type: 'text' | 'system' | 'achievement';
}

export interface TeamAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  progress: number;
  target: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface TeamGoal {
  id: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface TeamMilestone {
  id: string;
  title: string;
  description: string;
  threshold: number;
  achieved: boolean;
  achievedAt: string | null;
  icon: string;
}

export interface Team {
  id: string;
  name: string;
  avatar: string;
  tag: string;
  description: string;
  isPublic: boolean;
  banner: string;
  members: TeamMember[];
  chat: TeamChat[];
  achievements: TeamAchievement[];
  goals: TeamGoal[];
  milestones: TeamMilestone[];
  createdAt: string;
  totalScore: number;
  totalGamesPlayed: number;
  totalGamesWon: number;
  totalWordsContributed: number;
}

export interface TeamInvite {
  id: string;
  teamId: string;
  teamName: string;
  from: string;
  to: string;
  sentAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface TeamActivity {
  id: string;
  username: string;
  action: string;
  description: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface TeamState {
  teams: Team[];
  myTeamId: string | null;
  invites: TeamInvite[];
  activity: TeamActivity[];
  initialized: boolean;
}

export interface TeamOverview {
  teamId: string;
  name: string;
  avatar: string;
  tag: string;
  memberCount: number;
  maxMembers: number;
  totalScore: number;
  totalGamesPlayed: number;
  totalGamesWon: number;
  winRate: number;
  achievementsUnlocked: number;
  achievementsTotal: number;
  myRole: TeamRole | null;
  createdAt: string;
  description: string;
  banner: string;
}

export interface TeamCard {
  teamId: string;
  name: string;
  avatar: string;
  tag: string;
  memberCount: number;
  totalScore: number;
  rank: number;
  winRate: number;
  description: string;
  isPublic: boolean;
  banner: string;
}

export interface TeamLeaderboardEntry {
  rank: number;
  teamId: string;
  name: string;
  avatar: string;
  tag: string;
  memberCount: number;
  totalScore: number;
  totalGamesWon: number;
  winRate: number;
}

export interface TeamStats {
  totalScore: number;
  totalGamesPlayed: number;
  totalGamesWon: number;
  totalWordsContributed: number;
  winRate: number;
  averageMemberScore: number;
  averageMemberWords: number;
  topScorer: string | null;
  topContributor: string | null;
  mostActiveMember: string | null;
}

export interface MemberGridEntry {
  username: string;
  displayName: string;
  avatar: string;
  role: TeamRole;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  wordsContributed: number;
  lastActive: string;
  winRate: number;
}

export interface TeamComparison {
  team1: {
    teamId: string;
    name: string;
    avatar: string;
    totalScore: number;
    totalGamesWon: number;
    totalWordsContributed: number;
    winRate: number;
    memberCount: number;
    achievementsUnlocked: number;
  };
  team2: {
    teamId: string;
    name: string;
    avatar: string;
    totalScore: number;
    totalGamesWon: number;
    totalWordsContributed: number;
    winRate: number;
    memberCount: number;
    achievementsUnlocked: number;
  };
  scoreDiff: number;
  winDiff: number;
  wordsDiff: number;
  leader: string;
}

export interface TeamPerformance {
  recentGamesWon: number;
  recentGamesPlayed: number;
  recentWinRate: number;
  scoreTrend: 'rising' | 'stable' | 'declining';
  wordsPerGame: number;
  bestStreak: number;
  currentStreak: number;
}

export interface TeamRoster {
  captain: TeamMember | null;
  coCaptains: TeamMember[];
  members: TeamMember[];
  totalMembers: number;
}

export interface TeamSettings {
  name: string;
  avatar: string;
  tag: string;
  description: string;
  isPublic: boolean;
  banner: string;
}

export interface RecommendedTeam {
  teamId: string;
  name: string;
  avatar: string;
  tag: string;
  memberCount: number;
  totalScore: number;
  matchScore: number;
  reasons: string[];
}

// ---- Constants -------------------------------------------------------------

const STORAGE_KEY = 'ws_team_system_wire';
const MAX_TEAM_MEMBERS = 8;
const MAX_CHAT_MESSAGES = 200;
const MAX_ACTIVITY_ENTRIES = 100;
const MAX_INVITES = 50;

const BANNER_OPTIONS = [
  '🐉',
  '🐍',
  '🏆',
  '⚡',
  '🔥',
  '💎',
  '🌟',
  '🎯',
  '🛡️',
  '⚜️',
  '🌊',
  '🌸',
  '🦅',
  '🐺',
  '🦁',
];

const AVATAR_OPTIONS = [
  '🐲',
  '🐉',
  '🐍',
  '🦎',
  '🐊',
  '🐢',
  '🐸',
  '🦈',
  '🐋',
  '🐬',
  '🦅',
  '🐺',
  '🦁',
  '🐻',
  '🦊',
  '🐼',
  '🦄',
  '🦋',
  '🌟',
  '⚡',
];

const DEFAULT_ACHIEVEMENTS: TeamAchievement[] = [
  {
    id: 'ach_first_win',
    title: 'First Victory',
    description: 'Win your first team game',
    icon: '🏆',
    unlockedAt: null,
    progress: 0,
    target: 1,
    rarity: 'common',
  },
  {
    id: 'ach_10_wins',
    title: 'Rising Champions',
    description: 'Win 10 team games together',
    icon: '⭐',
    unlockedAt: null,
    progress: 0,
    target: 10,
    rarity: 'rare',
  },
  {
    id: 'ach_50_wins',
    title: 'Veteran Squad',
    description: 'Win 50 team games together',
    icon: '🎖️',
    unlockedAt: null,
    progress: 0,
    target: 50,
    rarity: 'epic',
  },
  {
    id: 'ach_100_words',
    title: 'Word Collectors',
    description: 'Contribute 100 words total as a team',
    icon: '📖',
    unlockedAt: null,
    progress: 0,
    target: 100,
    rarity: 'common',
  },
  {
    id: 'ach_1000_words',
    title: 'Lexicon Legion',
    description: 'Contribute 1,000 words total as a team',
    icon: '📚',
    unlockedAt: null,
    progress: 0,
    target: 1000,
    rarity: 'rare',
  },
  {
    id: 'ach_full_roster',
    title: 'Full House',
    description: 'Reach the maximum team size of 8 members',
    icon: '👥',
    unlockedAt: null,
    progress: 0,
    target: MAX_TEAM_MEMBERS,
    rarity: 'rare',
  },
  {
    id: 'ach_score_10k',
    title: 'Score Masters',
    description: 'Accumulate 10,000 team points',
    icon: '💰',
    unlockedAt: null,
    progress: 0,
    target: 10000,
    rarity: 'epic',
  },
  {
    id: 'ach_score_100k',
    title: 'Legends of the Board',
    description: 'Accumulate 100,000 team points',
    icon: '👑',
    unlockedAt: null,
    progress: 0,
    target: 100000,
    rarity: 'legendary',
  },
  {
    id: 'ach_5_game_streak',
    title: 'Hot Streak',
    description: 'Win 5 team games in a row',
    icon: '🔥',
    unlockedAt: null,
    progress: 0,
    target: 5,
    rarity: 'rare',
  },
  {
    id: 'ach_all_rare_words',
    title: 'Rare Word Finders',
    description: 'Find 50 rare words as a team',
    icon: '💎',
    unlockedAt: null,
    progress: 0,
    target: 50,
    rarity: 'epic',
  },
];

const DEFAULT_MILESTONES: TeamMilestone[] = [
  {
    id: 'ms_100_score',
    title: 'Getting Started',
    description: 'Reach 100 total team score',
    threshold: 100,
    achieved: false,
    achievedAt: null,
    icon: '🌱',
  },
  {
    id: 'ms_1000_score',
    title: 'Established Team',
    description: 'Reach 1,000 total team score',
    threshold: 1000,
    achieved: false,
    achievedAt: null,
    icon: '🌿',
  },
  {
    id: 'ms_5000_score',
    title: 'Power Players',
    description: 'Reach 5,000 total team score',
    threshold: 5000,
    achieved: false,
    achievedAt: null,
    icon: '🌳',
  },
  {
    id: 'ms_10000_score',
    title: 'Elite Force',
    description: 'Reach 10,000 total team score',
    threshold: 10000,
    achieved: false,
    achievedAt: null,
    icon: '🏔️',
  },
  {
    id: 'ms_50000_score',
    title: 'Unstoppable',
    description: 'Reach 50,000 total team score',
    threshold: 50000,
    achieved: false,
    achievedAt: null,
    icon: '🌋',
  },
  {
    id: 'ms_100000_score',
    title: 'Hall of Fame',
    description: 'Reach 100,000 total team score',
    threshold: 100000,
    achieved: false,
    achievedAt: null,
    icon: '🏛️',
  },
];

// ---- Helpers: localStorage ------------------------------------------------

function isBrowser(): boolean {
  return typeof globalThis.window !== 'undefined';
}

function loadState(): TeamState {
  if (!isBrowser()) return createDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TeamState;
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.teams)) {
        return parsed;
      }
    }
  } catch {
    /* ignore parse errors */
  }
  return createDefaultState();
}

function saveState(state: TeamState): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

// ---- Helpers: utilities ---------------------------------------------------

function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function calcWinRate(wins: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((wins / total) * 1000) / 10;
}

function generateTag(): string {
  const adjectives = ['Swift', 'Clever', 'Brave', 'Bold', 'Keen', 'Wise', 'Fierce', 'Noble'];
  const nouns = ['Snakes', 'Words', 'Lexicon', 'Vipers', 'Mambas', 'Pythons', 'Cobras', 'Adders'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}${noun}${num}`;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

// ---- Default state --------------------------------------------------------

function createDefaultState(): TeamState {
  const state: TeamState = {
    teams: [],
    myTeamId: null,
    invites: [],
    activity: [],
    initialized: true,
  };
  return state;
}

// ---- Create a fresh team object -------------------------------------------

function createTeamObject(
  name: string,
  captainUsername: string,
  captainDisplayName: string,
  captainAvatar: string,
): Team {
  const captain: TeamMember = {
    username: captainUsername,
    displayName: captainDisplayName,
    avatar: captainAvatar,
    role: 'Captain',
    joinedAt: nowISO(),
    lastActive: nowISO(),
    wordsContributed: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    totalScore: 0,
  };

  return {
    id: generateId('team'),
    name,
    avatar: '🐲',
    tag: generateTag(),
    description: `Welcome to ${name}! Let's conquer Word Snake together.`,
    isPublic: true,
    banner: BANNER_OPTIONS[Math.floor(Math.random() * BANNER_OPTIONS.length)],
    members: [captain],
    chat: [],
    achievements: deepClone(DEFAULT_ACHIEVEMENTS),
    goals: [],
    milestones: deepClone(DEFAULT_MILESTONES),
    createdAt: nowISO(),
    totalScore: 0,
    totalGamesPlayed: 0,
    totalGamesWon: 0,
    totalWordsContributed: 0,
  };
}

// ---- Add activity entry ---------------------------------------------------

function pushActivity(
  state: TeamState,
  username: string,
  action: string,
  description: string,
  metadata: Record<string, unknown> = {},
): void {
  state.activity.unshift({
    id: generateId('tact'),
    username,
    action,
    description,
    timestamp: nowISO(),
    metadata,
  });
  if (state.activity.length > MAX_ACTIVITY_ENTRIES) {
    state.activity = state.activity.slice(0, MAX_ACTIVITY_ENTRIES);
  }
}

// ---- Recalculate team aggregates ------------------------------------------

function recalcTeamAggregates(team: Team): void {
  team.totalScore = team.members.reduce((s, m) => s + m.totalScore, 0);
  team.totalGamesPlayed = team.members.reduce((s, m) => s + m.gamesPlayed, 0);
  team.totalGamesWon = team.members.reduce((s, m) => s + m.gamesWon, 0);
  team.totalWordsContributed = team.members.reduce((s, m) => s + m.wordsContributed, 0);
}

// ---- Check and update achievements ----------------------------------------

function checkTeamAchievements(team: Team): void {
  for (const ach of team.achievements) {
    if (ach.unlockedAt !== null) continue;

    let progress = 0;
    switch (ach.id) {
      case 'ach_first_win':
        progress = team.totalGamesWon >= 1 ? 1 : 0;
        break;
      case 'ach_10_wins':
        progress = Math.min(team.totalGamesWon, ach.target);
        break;
      case 'ach_50_wins':
        progress = Math.min(team.totalGamesWon, ach.target);
        break;
      case 'ach_100_words':
        progress = Math.min(team.totalWordsContributed, ach.target);
        break;
      case 'ach_1000_words':
        progress = Math.min(team.totalWordsContributed, ach.target);
        break;
      case 'ach_full_roster':
        progress = Math.min(team.members.length, ach.target);
        break;
      case 'ach_score_10k':
        progress = Math.min(team.totalScore, ach.target);
        break;
      case 'ach_score_100k':
        progress = Math.min(team.totalScore, ach.target);
        break;
      case 'ach_5_game_streak':
        progress = Math.min(team.totalGamesWon, ach.target);
        break;
      case 'ach_all_rare_words':
        progress = Math.min(Math.floor(team.totalWordsContributed * 0.1), ach.target);
        break;
      default:
        progress = 0;
    }

    ach.progress = progress;

    if (progress >= ach.target) {
      ach.unlockedAt = nowISO();
      ach.progress = ach.target;
    }
  }
}

// ---- Check and update milestones ------------------------------------------

function checkTeamMilestones(team: Team): void {
  for (const ms of team.milestones) {
    if (ms.achieved) continue;
    if (team.totalScore >= ms.threshold) {
      ms.achieved = true;
      ms.achievedAt = nowISO();
    }
  }
}

// ---- Check and complete goals ---------------------------------------------

function checkTeamGoals(team: Team): void {
  for (const goal of team.goals) {
    if (goal.completed) continue;
    if (goal.progress >= goal.target) {
      goal.completed = true;
      goal.completedAt = nowISO();
    }
  }
}

// ---- Get current player info (safe fallback) ------------------------------

function getCurrentPlayer(): {
  username: string;
  displayName: string;
  avatar: string;
} {
  try {
    const raw = localStorage.getItem('ws_player_profile');
    if (raw) {
      const p = JSON.parse(raw);
      return {
        username: p.username ?? 'player',
        displayName: p.displayName ?? 'Player',
        avatar: p.avatar ?? '🎮',
      };
    }
  } catch {
    /* fall through */
  }
  return { username: 'player', displayName: 'Player', avatar: '🎮' };
}

// ---- Seed some mock teams for leaderboard / recommendations ----------------

function seedMockTeams(state: TeamState): void {
  if (state.teams.length > 0) return;

  const mockTeamData = [
    {
      name: 'Lexicon Legends',
      avatar: '🐲',
      tag: 'LexLeg421',
      description: 'Masters of the word board since day one.',
      banner: '🏆',
      members: [
        { username: 'lexicon_lizard', displayName: 'Lexicon Lizard', avatar: '🦎', role: 'Captain' as TeamRole, wordsContributed: 420, gamesPlayed: 180, gamesWon: 94, totalScore: 12500 },
        { username: 'word_wizard_99', displayName: 'Word Wizard', avatar: '🧙', role: 'Co-Captain' as TeamRole, wordsContributed: 380, gamesPlayed: 150, gamesWon: 72, totalScore: 10800 },
        { username: 'snake_charmer', displayName: 'Snake Charmer', avatar: '🐍', role: 'Member' as TeamRole, wordsContributed: 290, gamesPlayed: 120, gamesWon: 55, totalScore: 8900 },
        { username: 'vowel_viking', displayName: 'Vowel Viking', avatar: '⚔️', role: 'Member' as TeamRole, wordsContributed: 210, gamesPlayed: 90, gamesWon: 38, totalScore: 6200 },
      ],
    },
    {
      name: 'Snake Squad',
      avatar: '🐍',
      tag: 'SnkSqd783',
      description: 'Slithering to victory, one word at a time.',
      banner: '⚡',
      members: [
        { username: 'alpha_anagram', displayName: 'Alpha Anagram', avatar: '🔤', role: 'Captain' as TeamRole, wordsContributed: 350, gamesPlayed: 160, gamesWon: 82, totalScore: 11200 },
        { username: 'beta_boggle', displayName: 'Beta Boggle', avatar: '🎲', role: 'Member' as TeamRole, wordsContributed: 260, gamesPlayed: 110, gamesWon: 48, totalScore: 7600 },
        { username: 'gamma_glyph', displayName: 'Gamma Glyph', avatar: '🔣', role: 'Member' as TeamRole, wordsContributed: 310, gamesPlayed: 140, gamesWon: 68, totalScore: 9500 },
      ],
    },
    {
      name: 'Word Warriors',
      avatar: '⚔️',
      tag: 'WrWr556',
      description: 'Words are our weapons.',
      banner: '🔥',
      members: [
        { username: 'delta_diction', displayName: 'Delta Diction', avatar: '📖', role: 'Captain' as TeamRole, wordsContributed: 280, gamesPlayed: 130, gamesWon: 60, totalScore: 8800 },
        { username: 'epsilon_emoji', displayName: 'Epsilon Emoji', avatar: '😎', role: 'Co-Captain' as TeamRole, wordsContributed: 190, gamesPlayed: 85, gamesWon: 35, totalScore: 5400 },
      ],
    },
    {
      name: 'Vowel Vanguard',
      avatar: '🛡️',
      tag: 'VwlVgd912',
      description: 'Guardians of grammar and vocabulary.',
      banner: '💎',
      members: [
        { username: 'zeta_zigzag', displayName: 'Zeta Zigzag', avatar: '⚡', role: 'Captain' as TeamRole, wordsContributed: 450, gamesPlayed: 200, gamesWon: 105, totalScore: 14200 },
        { username: 'eta_enigma', displayName: 'Eta Enigma', avatar: '❓', role: 'Co-Captain' as TeamRole, wordsContributed: 370, gamesPlayed: 170, gamesWon: 88, totalScore: 12100 },
        { username: 'theta_thesaurus', displayName: 'Theta Thesaurus', avatar: '📚', role: 'Member' as TeamRole, wordsContributed: 320, gamesPlayed: 145, gamesWon: 70, totalScore: 9800 },
        { username: 'iota_infinity', displayName: 'Iota Infinity', avatar: '♾️', role: 'Member' as TeamRole, wordsContributed: 150, gamesPlayed: 60, gamesWon: 22, totalScore: 3800 },
        { username: 'kappa_kaleidoscope', displayName: 'Kappa Kaleidoscope', avatar: '🔮', role: 'Member' as TeamRole, wordsContributed: 240, gamesPlayed: 100, gamesWon: 45, totalScore: 6900 },
      ],
    },
    {
      name: 'Alphabet Assassins',
      avatar: '🎯',
      tag: 'AlphAss147',
      description: 'Precision word hunting at its finest.',
      banner: '🌟',
      members: [
        { username: 'mu_mystic', displayName: 'Mu Mystic', avatar: '🔮', role: 'Captain' as TeamRole, wordsContributed: 300, gamesPlayed: 135, gamesWon: 65, totalScore: 9100 },
        { username: 'nu_nexus', displayName: 'Nu Nexus', avatar: '🌌', role: 'Member' as TeamRole, wordsContributed: 220, gamesPlayed: 95, gamesWon: 42, totalScore: 6400 },
      ],
    },
  ];

  for (const data of mockTeamData) {
    const team: Team = {
      id: generateId('team'),
      name: data.name,
      avatar: data.avatar,
      tag: data.tag,
      description: data.description,
      isPublic: true,
      banner: data.banner,
      members: data.members.map((m, i) => ({
        ...m,
        joinedAt: new Date(Date.now() - (data.members.length - i) * 86400000 * 7).toISOString(),
        lastActive: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
      })),
      chat: [],
      achievements: deepClone(DEFAULT_ACHIEVEMENTS),
      goals: [],
      milestones: deepClone(DEFAULT_MILESTONES),
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 86400000)).toISOString(),
      totalScore: 0,
      totalGamesPlayed: 0,
      totalGamesWon: 0,
      totalWordsContributed: 0,
    };

    recalcTeamAggregates(team);
    checkTeamAchievements(team);
    checkTeamMilestones(team);

    state.teams.push(team);
  }
}

// ============================================================================
// EXPORTED FUNCTIONS
// ============================================================================

// 1. Initialize the team system, seed mock teams if empty
export function initTeamSystem(): TeamState {
  const state = loadState();
  if (!state.initialized) {
    state.initialized = true;
  }
  seedMockTeams(state);
  saveState(state);
  return state;
}

// 2. Get all teams (public teams for browsing)
export function getTeams(): Team[] {
  const state = initTeamSystem();
  return state.teams
    .filter((t) => t.isPublic)
    .map((t) => deepClone(t));
}

// 3. Create a new team — the current player becomes Captain
export function createTeam(name: string, description?: string, isPublic?: boolean): Team | null {
  try {
    if (!name?.trim()) return null;

    const state = loadState();
    const player = getCurrentPlayer();

    if (state.myTeamId !== null) return null;

    const teamName = name.trim().slice(0, 40);
    const team = createTeamObject(teamName, player.username, player.displayName, player.avatar);

    if (description?.trim()) {
      team.description = description.trim().slice(0, 200);
    }
    if (typeof isPublic === 'boolean') {
      team.isPublic = isPublic;
    }

    state.teams.push(team);
    state.myTeamId = team.id;

    pushActivity(state, player.username, 'created_team', `created the team "${teamName}"`, { teamId: team.id });
    saveState(state);
    return deepClone(team);
  } catch {
    return null;
  }
}

// 4. Join a team by team ID
export function joinTeam(teamId: string): Team | null {
  try {
    if (!teamId?.trim()) return null;

    const state = loadState();
    const player = getCurrentPlayer();

    if (state.myTeamId !== null) return null;

    const team = state.teams.find((t) => t.id === teamId);
    if (!team) return null;
    if (!team.isPublic) return null;
    if (team.members.length >= MAX_TEAM_MEMBERS) return null;
    if (team.members.some((m) => m.username === player.username)) return null;

    const member: TeamMember = {
      username: player.username,
      displayName: player.displayName,
      avatar: player.avatar,
      role: 'Member',
      joinedAt: nowISO(),
      lastActive: nowISO(),
      wordsContributed: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      totalScore: 0,
    };

    team.members.push(member);
    state.myTeamId = team.id;

    team.chat.push({
      id: generateId('sys'),
      from: 'system',
      fromAvatar: '⚙️',
      content: `${player.displayName} joined the team!`,
      timestamp: nowISO(),
      type: 'system',
    });
    if (team.chat.length > MAX_CHAT_MESSAGES) {
      team.chat = team.chat.slice(-MAX_CHAT_MESSAGES);
    }

    recalcTeamAggregates(team);
    checkTeamAchievements(team);
    checkTeamMilestones(team);

    pushActivity(state, player.username, 'joined_team', `joined the team "${team.name}"`, { teamId: team.id });
    saveState(state);
    return deepClone(team);
  } catch {
    return null;
  }
}

// 5. Leave the current team
export function leaveTeam(): boolean {
  try {
    const state = loadState();
    const player = getCurrentPlayer();

    if (state.myTeamId === null) return false;

    const team = state.teams.find((t) => t.id === state.myTeamId);
    if (!team) {
      state.myTeamId = null;
      saveState(state);
      return true;
    }

    const member = team.members.find((m) => m.username === player.username);
    if (!member) {
      state.myTeamId = null;
      saveState(state);
      return true;
    }

    if (member.role === 'Captain') {
      const hasCoCaptain = team.members.some((m) => m.role === 'Co-Captain');
      if (!hasCoCaptain) {
        const nextMember = team.members.find((m) => m.role === 'Member');
        if (nextMember) {
          nextMember.role = 'Captain';
        }
      } else {
        const coCaptain = team.members.find((m) => m.role === 'Co-Captain');
        if (coCaptain) {
          coCaptain.role = 'Captain';
        }
      }
    }

    team.members = team.members.filter((m) => m.username !== player.username);
    state.myTeamId = null;

    team.chat.push({
      id: generateId('sys'),
      from: 'system',
      fromAvatar: '⚙️',
      content: `${player.displayName} left the team.`,
      timestamp: nowISO(),
      type: 'system',
    });

    recalcTeamAggregates(team);
    pushActivity(state, player.username, 'left_team', `left the team "${team.name}"`, { teamId: team.id });
    saveState(state);
    return true;
  } catch {
    return false;
  }
}

// 6. Disband the team (Captain only)
export function disbandTeam(): boolean {
  try {
    const state = loadState();
    const player = getCurrentPlayer();

    if (state.myTeamId === null) return false;

    const team = state.teams.find((t) => t.id === state.myTeamId);
    if (!team) return false;

    const captain = team.members.find((m) => m.username === player.username && m.role === 'Captain');
    if (!captain) return false;

    state.teams = state.teams.filter((t) => t.id !== team.id);
    state.myTeamId = null;

    pushActivity(state, player.username, 'disbanded_team', `disbanded the team "${team.name}"`, { teamId: team.id });
    saveState(state);
    return true;
  } catch {
    return false;
  }
}

// 7. Get the player's current team
export function getMyTeam(): Team | null {
  try {
    const state = loadState();
    if (state.myTeamId === null) return null;
    const team = state.teams.find((t) => t.id === state.myTeamId);
    return team ? deepClone(team) : null;
  } catch {
    return null;
  }
}

// 8. Get members of a specific team
export function getTeamMembers(teamId: string): TeamMember[] {
  try {
    if (!teamId?.trim()) return [];
    const state = loadState();
    const team = state.teams.find((t) => t.id === teamId);
    if (!team) return [];
    return deepClone(team.members);
  } catch {
    return [];
  }
}

// 9. Add a member to the current team (Captain/Co-Captain only)
export function addMember(username: string, displayName?: string, avatar?: string): boolean {
  try {
    if (!username?.trim()) return false;

    const state = loadState();
    const player = getCurrentPlayer();

    if (state.myTeamId === null) return false;

    const team = state.teams.find((t) => t.id === state.myTeamId);
    if (!team) return false;

    const caller = team.members.find((m) => m.username === player.username);
    if (!caller || (caller.role !== 'Captain' && caller.role !== 'Co-Captain')) return false;

    if (team.members.length >= MAX_TEAM_MEMBERS) return false;
    if (team.members.some((m) => m.username === username.trim())) return false;

    const member: TeamMember = {
      username: username.trim(),
      displayName: displayName?.trim() ?? username.trim(),
      avatar: avatar ?? '🎮',
      role: 'Member',
      joinedAt: nowISO(),
      lastActive: nowISO(),
      wordsContributed: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      totalScore: 0,
    };

    team.members.push(member);

    team.chat.push({
      id: generateId('sys'),
      from: 'system',
      fromAvatar: '⚙️',
      content: `${member.displayName} was added to the team!`,
      timestamp: nowISO(),
      type: 'system',
    });
    if (team.chat.length > MAX_CHAT_MESSAGES) {
      team.chat = team.chat.slice(-MAX_CHAT_MESSAGES);
    }

    recalcTeamAggregates(team);
    checkTeamAchievements(team);
    checkTeamMilestones(team);

    pushActivity(state, player.username, 'added_member', `added ${member.displayName} to "${team.name}"`, { teamId: team.id, addedUser: member.username });
    saveState(state);
    return true;
  } catch {
    return false;
  }
}

// 10. Remove a member from the current team (Captain/Co-Captain only)
export function removeMember(username: string): boolean {
  try {
    if (!username?.trim()) return false;

    const state = loadState();
    const player = getCurrentPlayer();

    if (state.myTeamId === null) return false;

    const team = state.teams.find((t) => t.id === state.myTeamId);
    if (!team) return false;

    const caller = team.members.find((m) => m.username === player.username);
    if (!caller || (caller.role !== 'Captain' && caller.role !== 'Co-Captain')) return false;

    const target = team.members.find((m) => m.username === username.trim());
    if (!target) return false;

    if (target.role === 'Captain') return false;

    if (caller.role === 'Co-Captain' && target.role === 'Co-Captain') return false;

    team.members = team.members.filter((m) => m.username !== target.username);

    team.chat.push({
      id: generateId('sys'),
      from: 'system',
      fromAvatar: '⚙️',
      content: `${target.displayName} was removed from the team.`,
      timestamp: nowISO(),
      type: 'system',
    });

    recalcTeamAggregates(team);

    pushActivity(state, player.username, 'removed_member', `removed ${target.displayName} from "${team.name}"`, { teamId: team.id, removedUser: target.username });
    saveState(state);
    return true;
  } catch {
    return false;
  }
}

// 11. Set a member's role (Captain only)
export function setMemberRole(username: string, role: TeamRole): boolean {
  try {
    if (!username?.trim()) return false;
    if (role !== 'Captain' && role !== 'Co-Captain' && role !== 'Member') return false;

    const state = loadState();
    const player = getCurrentPlayer();

    if (state.myTeamId === null) return false;

    const team = state.teams.find((t) => t.id === state.myTeamId);
    if (!team) return false;

    const caller = team.members.find((m) => m.username === player.username);
    if (!caller || caller.role !== 'Captain') return false;

    const target = team.members.find((m) => m.username === username.trim());
    if (!target) return false;
    if (target.username === player.username) return false;

    if (role === 'Captain') {
      caller.role = 'Co-Captain';
      target.role = 'Captain';
    } else {
      target.role = role;
    }

    team.chat.push({
      id: generateId('sys'),
      from: 'system',
      fromAvatar: '⚙️',
      content: `${target.displayName} is now ${target.role}.`,
      timestamp: nowISO(),
      type: 'system',
    });

    pushActivity(state, player.username, 'changed_role', `changed ${target.displayName}'s role to ${role}`, { teamId: team.id, targetUser: target.username, newRole: role });
    saveState(state);
    return true;
  } catch {
    return false;
  }
}

// 12. Get detailed team stats
export function getTeamStats(teamId?: string): TeamStats | null {
  try {
    const state = loadState();
    const tid = teamId?.trim() ?? state.myTeamId;
    if (!tid) return null;

    const team = state.teams.find((t) => t.id === tid);
    if (!team) return null;

    const totalMembers = team.members.length;
    if (totalMembers === 0) {
      return {
        totalScore: 0,
        totalGamesPlayed: 0,
        totalGamesWon: 0,
        totalWordsContributed: 0,
        winRate: 0,
        averageMemberScore: 0,
        averageMemberWords: 0,
        topScorer: null,
        topContributor: null,
        mostActiveMember: null,
      };
    }

    const avgScore = Math.round(team.totalScore / totalMembers);
    const avgWords = Math.round(team.totalWordsContributed / totalMembers);

    const sortedByScore = [...team.members].sort((a, b) => b.totalScore - a.totalScore);
    const sortedByWords = [...team.members].sort((a, b) => b.wordsContributed - a.wordsContributed);
    const sortedByGames = [...team.members].sort((a, b) => b.gamesPlayed - a.gamesPlayed);

    return {
      totalScore: team.totalScore,
      totalGamesPlayed: team.totalGamesPlayed,
      totalGamesWon: team.totalGamesWon,
      totalWordsContributed: team.totalWordsContributed,
      winRate: calcWinRate(team.totalGamesWon, team.totalGamesPlayed),
      averageMemberScore: avgScore,
      averageMemberWords: avgWords,
      topScorer: sortedByScore[0]?.displayName ?? null,
      topContributor: sortedByWords[0]?.displayName ?? null,
      mostActiveMember: sortedByGames[0]?.displayName ?? null,
    };
  } catch {
    return null;
  }
}

// 13. Get team leaderboard across all teams
export function getTeamLeaderboard(): TeamLeaderboardEntry[] {
  try {
    const state = initTeamSystem();
    const entries: TeamLeaderboardEntry[] = state.teams.map((t) => ({
      rank: 0,
      teamId: t.id,
      name: t.name,
      avatar: t.avatar,
      tag: t.tag,
      memberCount: t.members.length,
      totalScore: t.totalScore,
      totalGamesWon: t.totalGamesWon,
      winRate: calcWinRate(t.totalGamesWon, t.totalGamesPlayed),
    }));

    entries.sort((a, b) => b.totalScore - a.totalScore);
    entries.forEach((e, i) => {
      e.rank = i + 1;
    });

    return entries;
  } catch {
    return [];
  }
}

// 14. Get the rank of a specific team (or your team)
export function getTeamRank(teamId?: string): number {
  try {
    const leaderboard = getTeamLeaderboard();
    const tid = teamId?.trim();

    if (tid) {
      const entry = leaderboard.find((e) => e.teamId === tid);
      return entry?.rank ?? 0;
    }

    const state = loadState();
    if (state.myTeamId === null) return 0;
    const entry = leaderboard.find((e) => e.teamId === state.myTeamId);
    return entry?.rank ?? 0;
  } catch {
    return 0;
  }
}

// 15. Get team chat messages (newest last by default)
export function getTeamChat(teamId?: string, limit: number = 50): TeamChat[] {
  try {
    limit = clamp(limit, 1, 200);
    const state = loadState();
    const tid = teamId?.trim() ?? state.myTeamId;
    if (!tid) return [];

    const team = state.teams.find((t) => t.id === tid);
    if (!team) return [];

    return deepClone(team.chat.slice(-limit));
  } catch {
    return [];
  }
}

// 16. Send a message to team chat
export function sendTeamMessage(content: string): boolean {
  try {
    if (!content?.trim()) return false;

    const state = loadState();
    const player = getCurrentPlayer();

    if (state.myTeamId === null) return false;

    const team = state.teams.find((t) => t.id === state.myTeamId);
    if (!team) return false;

    const caller = team.members.find((m) => m.username === player.username);
    if (!caller) return false;

    caller.lastActive = nowISO();

    team.chat.push({
      id: generateId('chat'),
      from: player.username,
      fromAvatar: player.avatar,
      content: content.trim().slice(0, 500),
      timestamp: nowISO(),
      type: 'text',
    });

    if (team.chat.length > MAX_CHAT_MESSAGES) {
      team.chat = team.chat.slice(-MAX_CHAT_MESSAGES);
    }

    saveState(state);
    return true;
  } catch {
    return false;
  }
}

// 17. Get team activity feed
export function getTeamActivity(teamId?: string, limit: number = 20): TeamActivity[] {
  try {
    limit = clamp(limit, 1, MAX_ACTIVITY_ENTRIES);
    const state = loadState();
    const tid = teamId?.trim() ?? state.myTeamId;
    if (!tid) return [];

    return deepClone(state.activity.slice(0, limit));
  } catch {
    return [];
  }
}

// 18. Get team achievements for a team
export function getTeamAchievements(teamId?: string): TeamAchievement[] {
  try {
    const state = loadState();
    const tid = teamId?.trim() ?? state.myTeamId;
    if (!tid) return [];

    const team = state.teams.find((t) => t.id === tid);
    if (!team) return [];

    return deepClone(team.achievements);
  } catch {
    return [];
  }
}

// 19. Get achievement progress summary for a team
export function getTeamAchievementProgress(
  teamId?: string,
): {
  total: number;
  unlocked: number;
  progressByRarity: Record<string, { total: number; unlocked: number }>;
  nextClosest: TeamAchievement | null;
  overallPercentage: number;
} {
  try {
    const achievements = getTeamAchievements(teamId);
    if (achievements.length === 0) {
      return { total: 0, unlocked: 0, progressByRarity: {}, nextClosest: null, overallPercentage: 0 };
    }

    const total = achievements.length;
    const unlocked = achievements.filter((a) => a.unlockedAt !== null).length;

    const progressByRarity: Record<string, { total: number; unlocked: number }> = {};
    for (const a of achievements) {
      if (!progressByRarity[a.rarity]) {
        progressByRarity[a.rarity] = { total: 0, unlocked: 0 };
      }
      progressByRarity[a.rarity].total++;
      if (a.unlockedAt !== null) {
        progressByRarity[a.rarity].unlocked++;
      }
    }

    const inProgress = achievements
      .filter((a) => a.unlockedAt === null && a.progress > 0)
      .sort((a, b) => {
        const pctA = a.target > 0 ? a.progress / a.target : 0;
        const pctB = b.target > 0 ? b.progress / b.target : 0;
        return pctB - pctA;
      });

    const nextClosest = inProgress[0] ?? null;
    const overallPercentage = total > 0 ? Math.round((unlocked / total) * 1000) / 10 : 0;

    return { total, unlocked, progressByRarity, nextClosest, overallPercentage };
  } catch {
    return { total: 0, unlocked: 0, progressByRarity: {}, nextClosest: null, overallPercentage: 0 };
  }
}

// 20. Get team overview card data
export function getTeamOverview(teamId?: string): TeamOverview | null {
  try {
    const state = loadState();
    const player = getCurrentPlayer();
    const tid = teamId?.trim() ?? state.myTeamId;
    if (!tid) return null;

    const team = state.teams.find((t) => t.id === tid);
    if (!team) return null;

    const myMember = team.members.find((m) => m.username === player.username);
    const achUnlocked = team.achievements.filter((a) => a.unlockedAt !== null).length;

    return {
      teamId: team.id,
      name: team.name,
      avatar: team.avatar,
      tag: team.tag,
      memberCount: team.members.length,
      maxMembers: MAX_TEAM_MEMBERS,
      totalScore: team.totalScore,
      totalGamesPlayed: team.totalGamesPlayed,
      totalGamesWon: team.totalGamesWon,
      winRate: calcWinRate(team.totalGamesWon, team.totalGamesPlayed),
      achievementsUnlocked: achUnlocked,
      achievementsTotal: team.achievements.length,
      myRole: myMember?.role ?? null,
      createdAt: team.createdAt,
      description: team.description,
      banner: team.banner,
    };
  } catch {
    return null;
  }
}

// 21. Get a compact team card for listing views
export function getTeamCard(teamId?: string): TeamCard | null {
  try {
    const state = initTeamSystem();
    const tid = teamId?.trim() ?? state.myTeamId;
    if (!tid) return null;

    const leaderboard = getTeamLeaderboard();
    const team = state.teams.find((t) => t.id === tid);
    if (!team) return null;

    const rankEntry = leaderboard.find((e) => e.teamId === tid);

    return {
      teamId: team.id,
      name: team.name,
      avatar: team.avatar,
      tag: team.tag,
      memberCount: team.members.length,
      totalScore: team.totalScore,
      rank: rankEntry?.rank ?? 0,
      winRate: calcWinRate(team.totalGamesWon, team.totalGamesPlayed),
      description: team.description,
      isPublic: team.isPublic,
      banner: team.banner,
    };
  } catch {
    return null;
  }
}

// 22. Get member grid data for team display
export function getMemberGrid(teamId?: string): MemberGridEntry[] {
  try {
    const state = loadState();
    const tid = teamId?.trim() ?? state.myTeamId;
    if (!tid) return [];

    const team = state.teams.find((t) => t.id === tid);
    if (!team) return [];

    return team.members.map((m) => ({
      username: m.username,
      displayName: m.displayName,
      avatar: m.avatar,
      role: m.role,
      totalScore: m.totalScore,
      gamesPlayed: m.gamesPlayed,
      gamesWon: m.gamesWon,
      wordsContributed: m.wordsContributed,
      lastActive: m.lastActive,
      winRate: calcWinRate(m.gamesWon, m.gamesPlayed),
    })).sort((a, b) => {
      const roleOrder: Record<TeamRole, number> = { Captain: 0, 'Co-Captain': 1, Member: 2 };
      return (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99) || b.totalScore - a.totalScore;
    });
  } catch {
    return [];
  }
}

// 23. Compare two teams side by side
export function getTeamComparison(team1Id: string, team2Id: string): TeamComparison | null {
  try {
    if (!team1Id?.trim() || !team2Id?.trim()) return null;
    if (team1Id === team2Id) return null;

    const state = loadState();
    const t1 = state.teams.find((t) => t.id === team1Id);
    const t2 = state.teams.find((t) => t.id === team2Id);
    if (!t1 || !t2) return null;

    const t1AchUnlocked = t1.achievements.filter((a) => a.unlockedAt !== null).length;
    const t2AchUnlocked = t2.achievements.filter((a) => a.unlockedAt !== null).length;

    const data1 = {
      teamId: t1.id,
      name: t1.name,
      avatar: t1.avatar,
      totalScore: t1.totalScore,
      totalGamesWon: t1.totalGamesWon,
      totalWordsContributed: t1.totalWordsContributed,
      winRate: calcWinRate(t1.totalGamesWon, t1.totalGamesPlayed),
      memberCount: t1.members.length,
      achievementsUnlocked: t1AchUnlocked,
    };

    const data2 = {
      teamId: t2.id,
      name: t2.name,
      avatar: t2.avatar,
      totalScore: t2.totalScore,
      totalGamesWon: t2.totalGamesWon,
      totalWordsContributed: t2.totalWordsContributed,
      winRate: calcWinRate(t2.totalGamesWon, t2.totalGamesPlayed),
      memberCount: t2.members.length,
      achievementsUnlocked: t2AchUnlocked,
    };

    const scoreDiff = data1.totalScore - data2.totalScore;
    const winDiff = data1.totalGamesWon - data2.totalGamesWon;
    const wordsDiff = data1.totalWordsContributed - data2.totalWordsContributed;

    const positive = scoreDiff + winDiff * 100 + wordsDiff;
    const leader = positive >= 0 ? data1.name : data2.name;

    return { team1: data1, team2: data2, scoreDiff, winDiff, wordsDiff, leader };
  } catch {
    return null;
  }
}

// 24. Get pending team invites for the current player
export function getTeamInvites(): TeamInvite[] {
  try {
    const state = loadState();
    const player = getCurrentPlayer();
    return state.invites
      .filter((i) => i.to === player.username && i.status === 'pending')
      .map((i) => deepClone(i));
  } catch {
    return [];
  }
}

// 25. Accept a pending team invite
export function acceptInvite(inviteId: string): boolean {
  try {
    if (!inviteId?.trim()) return false;

    const state = loadState();
    const player = getCurrentPlayer();

    const invite = state.invites.find((i) => i.id === inviteId && i.to === player.username && i.status === 'pending');
    if (!invite) return false;

    if (state.myTeamId !== null) return false;

    invite.status = 'accepted';

    const team = state.teams.find((t) => t.id === invite.teamId);
    if (!team) return false;

    if (team.members.length >= MAX_TEAM_MEMBERS) return false;
    if (team.members.some((m) => m.username === player.username)) return false;

    const member: TeamMember = {
      username: player.username,
      displayName: player.displayName,
      avatar: player.avatar,
      role: 'Member',
      joinedAt: nowISO(),
      lastActive: nowISO(),
      wordsContributed: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      totalScore: 0,
    };

    team.members.push(member);
    state.myTeamId = team.id;

    team.chat.push({
      id: generateId('sys'),
      from: 'system',
      fromAvatar: '⚙️',
      content: `${player.displayName} accepted an invite and joined the team!`,
      timestamp: nowISO(),
      type: 'system',
    });
    if (team.chat.length > MAX_CHAT_MESSAGES) {
      team.chat = team.chat.slice(-MAX_CHAT_MESSAGES);
    }

    recalcTeamAggregates(team);
    checkTeamAchievements(team);
    checkTeamMilestones(team);

    pushActivity(state, player.username, 'accepted_invite', `accepted invite to "${team.name}"`, { teamId: team.id, inviteId });
    saveState(state);
    return true;
  } catch {
    return false;
  }
}

// 26. Decline a pending team invite
export function declineInvite(inviteId: string): boolean {
  try {
    if (!inviteId?.trim()) return false;

    const state = loadState();
    const player = getCurrentPlayer();

    const invite = state.invites.find((i) => i.id === inviteId && i.to === player.username && i.status === 'pending');
    if (!invite) return false;

    invite.status = 'declined';
    saveState(state);
    return true;
  } catch {
    return false;
  }
}

// 27. Get team settings (Captain/Co-Captain)
export function getTeamSettings(): TeamSettings | null {
  try {
    const state = loadState();
    if (state.myTeamId === null) return null;

    const team = state.teams.find((t) => t.id === state.myTeamId);
    if (!team) return null;

    return {
      name: team.name,
      avatar: team.avatar,
      tag: team.tag,
      description: team.description,
      isPublic: team.isPublic,
      banner: team.banner,
    };
  } catch {
    return null;
  }
}

// 28. Update team name (Captain only)
export function updateTeamName(newName: string): boolean {
  try {
    if (!newName?.trim()) return false;

    const state = loadState();
    const player = getCurrentPlayer();

    if (state.myTeamId === null) return false;

    const team = state.teams.find((t) => t.id === state.myTeamId);
    if (!team) return false;

    const captain = team.members.find((m) => m.username === player.username && m.role === 'Captain');
    if (!captain) return false;

    const oldName = team.name;
    team.name = newName.trim().slice(0, 40);

    team.chat.push({
      id: generateId('sys'),
      from: 'system',
      fromAvatar: '⚙️',
      content: `Team renamed from "${oldName}" to "${team.name}".`,
      timestamp: nowISO(),
      type: 'system',
    });

    pushActivity(state, player.username, 'renamed_team', `renamed team from "${oldName}" to "${team.name}"`, { teamId: team.id });
    saveState(state);
    return true;
  } catch {
    return false;
  }
}

// 29. Update team avatar (Captain only)
export function updateTeamAvatar(newAvatar: string): boolean {
  try {
    if (!newAvatar?.trim()) return false;

    const state = loadState();
    const player = getCurrentPlayer();

    if (state.myTeamId === null) return false;

    const team = state.teams.find((t) => t.id === state.myTeamId);
    if (!team) return false;

    const captain = team.members.find((m) => m.username === player.username && m.role === 'Captain');
    if (!captain) return false;

    team.avatar = newAvatar.trim().slice(0, 4);

    pushActivity(state, player.username, 'changed_avatar', `changed team avatar`, { teamId: team.id });
    saveState(state);
    return true;
  } catch {
    return false;
  }
}

// 30. Get the team banner
export function getTeamBanner(teamId?: string): string {
  try {
    const state = loadState();
    const tid = teamId?.trim() ?? state.myTeamId;
    if (!tid) return '🏆';

    const team = state.teams.find((t) => t.id === tid);
    return team?.banner ?? '🏆';
  } catch {
    return '🏆';
  }
}

// 31. Get team roster organized by role
export function getTeamRoster(teamId?: string): TeamRoster {
  try {
    const state = loadState();
    const tid = teamId?.trim() ?? state.myTeamId;

    const emptyRoster: TeamRoster = {
      captain: null,
      coCaptains: [],
      members: [],
      totalMembers: 0,
    };

    if (!tid) return emptyRoster;

    const team = state.teams.find((t) => t.id === tid);
    if (!team) return emptyRoster;

    const captain = team.members.find((m) => m.role === 'Captain') ?? null;
    const coCaptains = team.members.filter((m) => m.role === 'Co-Captain').map((m) => deepClone(m));
    const members = team.members.filter((m) => m.role === 'Member').map((m) => deepClone(m));

    return {
      captain: captain ? deepClone(captain) : null,
      coCaptains,
      members,
      totalMembers: team.members.length,
    };
  } catch {
    return { captain: null, coCaptains: [], members: [], totalMembers: 0 };
  }
}

// 32. Get team performance metrics
export function getTeamPerformance(teamId?: string): TeamPerformance | null {
  try {
    const state = loadState();
    const tid = teamId?.trim() ?? state.myTeamId;
    if (!tid) return null;

    const team = state.teams.find((t) => t.id === tid);
    if (!team) return null;

    const recentGamesPlayed = Math.min(team.totalGamesPlayed, 20);
    const recentGamesWon = Math.min(team.totalGamesWon, Math.floor(recentGamesPlayed * (team.totalGamesPlayed > 0 ? team.totalGamesWon / team.totalGamesPlayed : 0)));
    const recentWinRate = calcWinRate(recentGamesWon, recentGamesPlayed);

    const wordsPerGame = team.totalGamesPlayed > 0
      ? Math.round((team.totalWordsContributed / team.totalGamesPlayed) * 10) / 10
      : 0;

    const winPct = calcWinRate(team.totalGamesWon, team.totalGamesPlayed);
    let scoreTrend: 'rising' | 'stable' | 'declining' = 'stable';
    if (winPct > 55) scoreTrend = 'rising';
    else if (winPct < 40) scoreTrend = 'declining';

    const bestStreak = team.totalGamesWon > 0 ? Math.floor(team.totalGamesWon / 3) : 0;
    const currentStreak = Math.min(bestStreak, Math.floor(team.totalGamesWon * 0.3));

    return {
      recentGamesWon,
      recentGamesPlayed,
      recentWinRate,
      scoreTrend,
      wordsPerGame,
      bestStreak,
      currentStreak,
    };
  } catch {
    return null;
  }
}

// 33. Get team goals
export function getTeamGoals(teamId?: string): TeamGoal[] {
  try {
    const state = loadState();
    const tid = teamId?.trim() ?? state.myTeamId;
    if (!tid) return [];

    const team = state.teams.find((t) => t.id === tid);
    if (!team) return [];

    return deepClone(team.goals);
  } catch {
    return [];
  }
}

// 34. Get team milestones
export function getTeamMilestones(teamId?: string): TeamMilestone[] {
  try {
    const state = loadState();
    const tid = teamId?.trim() ?? state.myTeamId;
    if (!tid) return [];

    const team = state.teams.find((t) => t.id === tid);
    if (!team) return [];

    return deepClone(team.milestones);
  } catch {
    return [];
  }
}

// 35. Get recommended teams for the player to join
export function getRecommendedTeams(limit: number = 5): RecommendedTeam[] {
  try {
    limit = clamp(limit, 1, 20);
    const state = initTeamSystem();
    const player = getCurrentPlayer();

    if (state.myTeamId !== null) return [];

    const existingInvites = new Set(
      state.invites.filter((i) => i.to === player.username && i.status === 'pending').map((i) => i.teamId),
    );

    const playerLevel = 25;
    const candidateTeams = state.teams.filter(
      (t) => t.isPublic && t.members.length < MAX_TEAM_MEMBERS && !existingInvites.has(t.id),
    );

    return candidateTeams.map((t) => {
      const reasons: string[] = [];
      let matchScore = 40;

      const avgMemberScore = t.members.length > 0 ? t.totalScore / t.members.length : 0;

      if (t.members.length >= 3 && t.members.length <= 6) {
        matchScore += 15;
        reasons.push('Active team with solid roster');
      } else if (t.members.length < 3) {
        matchScore += 5;
        reasons.push('Small team — great opportunity to grow together');
      }

      if (avgMemberScore > 0 && Math.abs(avgMemberScore - playerLevel * 400) < 2000) {
        matchScore += 15;
        reasons.push('Similar skill level to your own');
      }

      if (calcWinRate(t.totalGamesWon, t.totalGamesPlayed) > 50) {
        matchScore += 10;
        reasons.push('Strong winning record');
      }

      const achUnlocked = t.achievements.filter((a) => a.unlockedAt !== null).length;
      if (achUnlocked >= 3) {
        matchScore += 5;
        reasons.push('Achievement-driven team');
      }

      if (t.members.length === MAX_TEAM_MEMBERS - 1) {
        matchScore += 10;
        reasons.push('Only one spot left — join now!');
      }

      if (t.chat.length > 10) {
        matchScore += 5;
        reasons.push('Active team chat');
      }

      return {
        teamId: t.id,
        name: t.name,
        avatar: t.avatar,
        tag: t.tag,
        memberCount: t.members.length,
        totalScore: t.totalScore,
        matchScore: clamp(matchScore, 0, 100),
        reasons,
      };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
  } catch {
    return [];
  }
}
