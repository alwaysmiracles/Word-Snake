// =============================================================================
// guild-system-wire.ts — Guild System Wire Module for Word Snake
// =============================================================================
// SSR-safe: uses in-memory state via ensureInit().
// No localStorage, window, document, setInterval, or addEventListener.
// All public functions use the `gl` prefix.
// =============================================================================

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export type GuildRole = "leader" | "co_leader" | "officer" | "veteran" | "member";

export type JoinRequirement = "open" | "application" | "invite_only" | "level_requirement";

export type WarCategory = "total_score" | "words_eaten" | "longest_snake" | "combo_master";

export type QuestCategory = "word_collection" | "score_goals" | "challenge_completion" | "exploration";

export type WarStatus = "preparing" | "active" | "completed";

export type QuestStatus = "available" | "active" | "completed" | "expired" | "claimed";

export type ChatMessageType = "text" | "achievement" | "challenge" | "system";

export interface GuildMember {
  id: string;
  name: string;
  role: GuildRole;
  joinDate: number;
  lastOnline: number;
  contributionScore: number;
  wordsEaten: number;
  avatar: string;
}

export interface GuildSettings {
  isPublic: boolean;
  joinRequirement: JoinRequirement;
  levelRequirement: number;
  memberLimit: number;
  moto: string;
}

export interface Emblem {
  id: string;
  name: string;
  icon: string;
  colorVariants: string[];
}

export interface Guild {
  id: string;
  name: string;
  tag: string;
  description: string;
  emblemId: string;
  emblemColor: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  settings: GuildSettings;
  members: GuildMember[];
  createdAt: number;
  warWins: number;
  warLosses: number;
  totalWordsEaten: number;
  achievementIds: string[];
}

export interface WarRound {
  category: WarCategory;
  ourScore: number;
  theirScore: number;
  winner: "us" | "them" | "draw";
}

export interface GuildWar {
  id: string;
  opponentGuildId: string;
  opponentGuildName: string;
  opponentTag: string;
  status: WarStatus;
  rounds: WarRound[];
  ourWins: number;
  theirWins: number;
  startDate: number;
  endDate: number;
  xpReward: number;
  coinReward: number;
}

export interface QuestContributor {
  memberId: string;
  memberName: string;
  amount: number;
}

export interface GuildQuest {
  id: string;
  name: string;
  description: string;
  category: QuestCategory;
  progress: number;
  target: number;
  timeLimit: number;
  startTime: number | null;
  status: QuestStatus;
  xpReward: number;
  coinReward: number;
  contributors: QuestContributor[];
}

export interface ChatMessage {
  id: string;
  memberId: string;
  memberName: string;
  type: ChatMessageType;
  content: string;
  timestamp: number;
}

export interface GuildAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
  xpReward: number;
}

export interface GuildRanking {
  rank: number;
  guildId: string;
  name: string;
  tag: string;
  level: number;
  totalXp: number;
  memberCount: number;
  warWins: number;
  weeklyChange: number;
}

export interface GuildApplication {
  id: string;
  playerId: string;
  playerName: string;
  playerLevel: number;
  playerAvatar: string;
  guildId: string;
  message: string;
  timestamp: number;
}

export interface RolePermission {
  role: GuildRole;
  label: string;
  canManageMembers: boolean;
  canManageSettings: boolean;
  canManageApplications: boolean;
  canStartWars: boolean;
  canDisband: boolean;
  canKick: boolean;
  canPromote: boolean;
  canEditMoto: boolean;
}

export interface GuildCardData {
  id: string;
  name: string;
  tag: string;
  level: number;
  memberCount: number;
  maxMembers: number;
  emblemIcon: string;
  emblemColor: string;
  warWins: number;
  warLosses: number;
  isPublic: boolean;
}

export interface MemberCardData {
  id: string;
  name: string;
  avatar: string;
  role: GuildRole;
  roleLabel: string;
  contributionScore: number;
  contributionRank: number;
  wordsEaten: number;
  joinDate: number;
  lastOnline: number;
  isOnline: boolean;
}

export interface WarCardData {
  id: string;
  opponentName: string;
  opponentTag: string;
  status: WarStatus;
  ourWins: number;
  theirWins: number;
  rounds: WarRound[];
  xpReward: number;
  coinReward: number;
  startDate: number;
  endDate: number;
}

export interface GuildDashboardData {
  guild: GuildCardData | null;
  level: number;
  xp: number;
  xpToNext: number;
  memberCount: number;
  activeMembers: number;
  totalWordsEaten: number;
  warWins: number;
  warLosses: number;
  winRate: number;
  activeQuests: number;
  completedAchievements: number;
  totalAchievements: number;
  rankPosition: number;
  unreadMessages: number;
  weeklyXpGain: number;
}

export interface GuildOverviewData {
  guild: Guild | null;
  members: GuildMember[];
  recentWars: GuildWar[];
  activeQuests: GuildQuest[];
  achievements: GuildAchievement[];
  ranking: GuildRanking | null;
  chatPreview: ChatMessage[];
}

export interface GuildState {
  currentGuildId: string | null;
  currentMemberId: string;
  guilds: Guild[];
  wars: GuildWar[];
  quests: GuildQuest[];
  chatMessages: ChatMessage[];
  applications: GuildApplication[];
  rankings: GuildRanking[];
  achievements: GuildAchievement[];
  unreadCount: number;
  weeklyXpGain: number;
}

// ---------------------------------------------------------------------------
// Constants: Emblems
// ---------------------------------------------------------------------------

const EMBLEMS: Emblem[] = [
  { id: "snake_crown", name: "Snake Crown", icon: "🐍👑", colorVariants: ["#FFD700", "#FFA500", "#FF6347"] },
  { id: "word_flame", name: "Word Flame", icon: "🔥✨", colorVariants: ["#FF4500", "#FF8C00", "#DC143C"] },
  { id: "crystal_viper", name: "Crystal Viper", icon: "💎🐍", colorVariants: ["#00CED1", "#4169E1", "#9370DB"] },
  { id: "golden_scales", name: "Golden Scales", icon: "⭐🏆", colorVariants: ["#FFD700", "#DAA520", "#B8860B"] },
  { id: "shadow_cobra", name: "Shadow Cobra", icon: "🌑🐍", colorVariants: ["#2F4F4F", "#483D8B", "#191970"] },
  { id: "jade_serpent", name: "Jade Serpent", icon: "💚🐍", colorVariants: ["#2E8B57", "#3CB371", "#00A86B"] },
  { id: "lightning_tail", name: "Lightning Tail", icon: "⚡🐍", colorVariants: ["#FFFF00", "#FFD700", "#FFA500"] },
  { id: "cosmic_coil", name: "Cosmic Coil", icon: "🌌🌀", colorVariants: ["#8A2BE2", "#4B0082", "#9400D3"] },
];

// ---------------------------------------------------------------------------
// Constants: Roles
// ---------------------------------------------------------------------------

const ROLE_PERMISSIONS: RolePermission[] = [
  { role: "leader", label: "Leader", canManageMembers: true, canManageSettings: true, canManageApplications: true, canStartWars: true, canDisband: true, canKick: true, canPromote: true, canEditMoto: true },
  { role: "co_leader", label: "Co-Leader", canManageMembers: true, canManageSettings: true, canManageApplications: true, canStartWars: true, canDisband: false, canKick: true, canPromote: true, canEditMoto: true },
  { role: "officer", label: "Officer", canManageMembers: false, canManageSettings: false, canManageApplications: true, canStartWars: true, canDisband: false, canKick: true, canPromote: false, canEditMoto: false },
  { role: "veteran", label: "Veteran", canManageMembers: false, canManageSettings: false, canManageApplications: false, canStartWars: true, canDisband: false, canKick: false, canPromote: false, canEditMoto: false },
  { role: "member", label: "Member", canManageMembers: false, canManageSettings: false, canManageApplications: false, canStartWars: false, canDisband: false, canKick: false, canPromote: false, canEditMoto: false },
];

const ROLE_ORDER: GuildRole[] = ["leader", "co_leader", "officer", "veteran", "member"];

// ---------------------------------------------------------------------------
// Constants: Achievements (12)
// ---------------------------------------------------------------------------

const GUILD_ACHIEVEMENTS: GuildAchievement[] = [
  { id: "first_blood", name: "First Blood", description: "Win your first guild war", icon: "⚔️", unlockedAt: null, xpReward: 500 },
  { id: "word_masters", name: "Word Masters", description: "Guild members collectively eat 100,000 words", icon: "📚", unlockedAt: null, xpReward: 1000 },
  { id: "war_veterans", name: "War Veterans", description: "Participate in 10 guild wars", icon: "🛡️", unlockedAt: null, xpReward: 750 },
  { id: "recruitment_drive", name: "Recruitment Drive", description: "Reach 25 members in the guild", icon: "👥", unlockedAt: null, xpReward: 600 },
  { id: "quest_masters", name: "Quest Masters", description: "Complete 20 guild quests", icon: "📜", unlockedAt: null, xpReward: 800 },
  { id: "domination", name: "Domination", description: "Win 5 guild wars in a row", icon: "👑", unlockedAt: null, xpReward: 2000 },
  { id: "community_builder", name: "Community Builder", description: "All members contribute to a quest", icon: "🤝", unlockedAt: null, xpReward: 500 },
  { id: "high_society", name: "High Society", description: "Reach guild level 30", icon: "🏰", unlockedAt: null, xpReward: 1500 },
  { id: "xp_hoarders", name: "XP Hoarders", description: "Accumulate 1,000,000 total guild XP", icon: "💎", unlockedAt: null, xpReward: 2000 },
  { id: "unstoppable", name: "Unstoppable", description: "Win 25 guild wars total", icon: "🔥", unlockedAt: null, xpReward: 1500 },
  { id: "diverse_talents", name: "Diverse Talents", description: "Have at least one member of every role", icon: "🎭", unlockedAt: null, xpReward: 400 },
  { id: "centurion", name: "Centurion", description: "Guild exists for 100 days", icon: "🏛️", unlockedAt: null, xpReward: 1000 },
];

// ---------------------------------------------------------------------------
// Constants: Quests (8)
// ---------------------------------------------------------------------------

const GUILD_QUESTS: GuildQuest[] = [
  { id: "q_wordcollector_1", name: "Word Collector", description: "Members collectively eat 5,000 words", category: "word_collection", progress: 0, target: 5000, timeLimit: 86400000, startTime: null, status: "available", xpReward: 500, coinReward: 200, contributors: [] },
  { id: "q_scoregoal_1", name: "Score Surge", description: "Reach a combined score of 500,000 points", category: "score_goals", progress: 0, target: 500000, timeLimit: 172800000, startTime: null, status: "available", xpReward: 800, coinReward: 350, contributors: [] },
  { id: "q_challenge_1", name: "Challenge Champions", description: "Complete 100 challenge mode runs", category: "challenge_completion", progress: 0, target: 100, timeLimit: 604800000, startTime: null, status: "available", xpReward: 600, coinReward: 250, contributors: [] },
  { id: "q_exploration_1", name: "Word Explorers", description: "Discover 200 unique words", category: "exploration", progress: 0, target: 200, timeLimit: 86400000, startTime: null, status: "available", xpReward: 400, coinReward: 150, contributors: [] },
  { id: "q_wordcollector_2", name: "Lexicon Legends", description: "Members eat 25,000 words in one week", category: "word_collection", progress: 0, target: 25000, timeLimit: 604800000, startTime: null, status: "available", xpReward: 1200, coinReward: 500, contributors: [] },
  { id: "q_scoregoal_2", name: "Million Point Club", description: "Reach a combined score of 2,000,000", category: "score_goals", progress: 0, target: 2000000, timeLimit: 604800000, startTime: null, status: "available", xpReward: 1500, coinReward: 700, contributors: [] },
  { id: "q_challenge_2", name: "Endurance Trial", description: "Complete 500 challenge mode runs", category: "challenge_completion", progress: 0, target: 500, timeLimit: 604800000, startTime: null, status: "available", xpReward: 1000, coinReward: 450, contributors: [] },
  { id: "q_exploration_2", name: "Language Masters", description: "Discover 1,000 unique words", category: "exploration", progress: 0, target: 1000, timeLimit: 604800000, startTime: null, status: "available", xpReward: 900, coinReward: 400, contributors: [] },
];

// ---------------------------------------------------------------------------
// Constants: Mock chat messages
// ---------------------------------------------------------------------------

const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { id: "cm_001", memberId: "m_02", memberName: "WordSmith", type: "text", content: "Hey everyone! Ready for the war this weekend?", timestamp: Date.now() - 3600000 },
  { id: "cm_002", memberId: "m_03", memberName: "SnakeCharmer", type: "achievement", content: "just unlocked the 'Speed Demon' achievement!", timestamp: Date.now() - 3200000 },
  { id: "cm_003", memberId: "m_04", memberName: "VowelViking", type: "text", content: "I've been practicing combo chains all day. Got up to 15x!", timestamp: Date.now() - 2800000 },
  { id: "cm_004", memberId: "m_01", memberName: "LeaderLiz", type: "system", content: "Guild war against Iron Serpents starts in 2 hours!", timestamp: Date.now() - 2400000 },
  { id: "cm_005", memberId: "m_05", memberName: "LetterLark", type: "text", content: "Can someone help me with the daily challenge? I'm stuck on round 7.", timestamp: Date.now() - 2000000 },
  { id: "cm_006", memberId: "m_06", memberName: "AlphaAnagram", type: "challenge", content: "started the 'Marathon Mode' challenge. Who's joining?", timestamp: Date.now() - 1500000 },
  { id: "cm_007", memberId: "m_07", memberName: "BetaBoggle", type: "text", content: "We're at 3,200/5,000 for the Word Collector quest! Keep eating!", timestamp: Date.now() - 1000000 },
  { id: "cm_008", memberId: "m_08", memberName: "GammaGlyph", type: "achievement", content: "just ate the word 'pneumonoultramicroscopicsilicovolcanoconiosis'!", timestamp: Date.now() - 600000 },
  { id: "cm_009", memberId: "m_02", memberName: "WordSmith", type: "text", content: "GammaGlyph that's insane! How many points was that?", timestamp: Date.now() - 300000 },
  { id: "cm_010", memberId: "m_08", memberName: "GammaGlyph", type: "text", content: "12,400 points! New personal record!", timestamp: Date.now() - 120000 },
];

// ---------------------------------------------------------------------------
// Constants: Mock members for 4 default guilds
// ---------------------------------------------------------------------------

function glMockMember(id: string, name: string, role: GuildRole, contribution: number, words: number, avatar: string, daysAgo: number): GuildMember {
  return {
    id, name, role, joinDate: Date.now() - daysAgo * 86400000,
    lastOnline: Date.now() - Math.floor(Math.random() * daysAgo * 86400000),
    contributionScore: contribution, wordsEaten: words, avatar,
  };
}

const MOCK_GUILD_1_MEMBERS: GuildMember[] = [
  glMockMember("m_01", "LeaderLiz", "leader", 15400, 8900, "🦎", 120),
  glMockMember("m_02", "WordSmith", "co_leader", 12300, 7200, "📚", 110),
  glMockMember("m_03", "SnakeCharmer", "officer", 9800, 5800, "🐍", 95),
  glMockMember("m_04", "VowelViking", "veteran", 7600, 4300, "⚔️", 80),
  glMockMember("m_05", "LetterLark", "member", 5400, 3100, "🐦", 60),
  glMockMember("m_06", "AlphaAnagram", "member", 4300, 2600, "🔤", 45),
  glMockMember("m_07", "BetaBoggle", "member", 3200, 1800, "🎲", 30),
  glMockMember("m_08", "GammaGlyph", "member", 2800, 1500, "🔣", 20),
];

const MOCK_GUILD_2_MEMBERS: GuildMember[] = [
  glMockMember("m_10", "IronScales", "leader", 14200, 8200, "🐉", 100),
  glMockMember("m_11", "CoilMaster", "co_leader", 11500, 6700, "🌀", 90),
  glMockMember("m_12", "ByteSnake", "officer", 8900, 5100, "💻", 75),
  glMockMember("m_13", "ZigzagZeta", "veteran", 6800, 3900, "⚡", 65),
  glMockMember("m_14", "PrefixPanda", "member", 4700, 2800, "🐼", 50),
  glMockMember("m_15", "SuffixStar", "member", 3600, 2000, "⭐", 35),
];

const MOCK_GUILD_3_MEMBERS: GuildMember[] = [
  glMockMember("m_20", "NightOwl", "leader", 13100, 7600, "🦉", 115),
  glMockMember("m_21", "PhantomFang", "co_leader", 10800, 6200, "👻", 100),
  glMockMember("m_22", "DuskViper", "officer", 8200, 4700, "🌙", 85),
  glMockMember("m_23", "ShadowStriker", "member", 5900, 3400, "🌑", 55),
  glMockMember("m_24", "EclipseEagle", "member", 4100, 2400, "🦅", 40),
];

const MOCK_GUILD_4_MEMBERS: GuildMember[] = [
  glMockMember("m_30", "WordSage", "leader", 16000, 9500, "🧙", 130),
  glMockMember("m_31", "ThesaurusThief", "co_leader", 12900, 7400, "📖", 115),
  glMockMember("m_32", "SynonymSamurai", "officer", 9400, 5500, "⚔️", 95),
  glMockMember("m_33", "EtymologyElf", "veteran", 7100, 4100, "🧝", 80),
  glMockMember("m_34", "PalindromePrince", "member", 5200, 3000, "👑", 65),
  glMockMember("m_35", "AcronymAce", "member", 4000, 2300, "🃏", 50),
  glMockMember("m_36", "RhymeRider", "member", 3100, 1700, "🎵", 35),
];

// ---------------------------------------------------------------------------
// Constants: 4 Default guilds
// ---------------------------------------------------------------------------

function glMockGuild(id: string, name: string, tag: string, desc: string, emblemId: string, color: string, level: number, xp: number, members: GuildMember[], warW: number, warL: number, daysAgo: number): Guild {
  return {
    id, name, tag, description: desc, emblemId, emblemColor: color,
    level, xp, xpToNextLevel: level * 1200 + 500,
    settings: { isPublic: true, joinRequirement: "application", levelRequirement: 10, memberLimit: 30, moto: "Words unite us!" },
    members, createdAt: Date.now() - daysAgo * 86400000, warWins: warW, warLosses: warL,
    totalWordsEaten: members.reduce((s, m) => s + m.wordsEaten, 0), achievementIds: ["first_blood"],
  };
}

const DEFAULT_GUILDS: Guild[] = [
  glMockGuild("guild_001", "Serpent Scholars", "SSHR", "Ancient order of word-obsessed serpents", "snake_crown", "#FFD700", 28, 33600, MOCK_GUILD_1_MEMBERS, 12, 4, 120),
  glMockGuild("guild_002", "Iron Serpents", "IRON", "Forged in competition, tempered by words", "crystal_viper", "#00CED1", 24, 28800, MOCK_GUILD_2_MEMBERS, 9, 6, 100),
  glMockGuild("guild_003", "Night Stalkers", "NITE", "We hunt words when the sun goes down", "shadow_cobra", "#2F4F4F", 22, 26400, MOCK_GUILD_3_MEMBERS, 7, 5, 115),
  glMockGuild("guild_004", "Lexicon Legends", "LEXL", "Masters of the written word", "golden_scales", "#FFD700", 30, 36000, MOCK_GUILD_4_MEMBERS, 15, 3, 130),
];

// ---------------------------------------------------------------------------
// Constants: Mock wars
// ---------------------------------------------------------------------------

const DEFAULT_WARS: GuildWar[] = [
  {
    id: "war_001", opponentGuildId: "guild_002", opponentGuildName: "Iron Serpents", opponentTag: "IRON",
    status: "completed",
    rounds: [
      { category: "total_score", ourScore: 45200, theirScore: 42100, winner: "us" },
      { category: "words_eaten", ourScore: 890, theirScore: 920, winner: "them" },
      { category: "longest_snake", ourScore: 156, theirScore: 142, winner: "us" },
      { category: "combo_master", ourScore: 28, theirScore: 31, winner: "them" },
      { category: "total_score", ourScore: 48700, theirScore: 41500, winner: "us" },
    ],
    ourWins: 3, theirWins: 2, startDate: Date.now() - 604800000, endDate: Date.now() - 518400000, xpReward: 1200, coinReward: 500,
  },
  {
    id: "war_002", opponentGuildId: "guild_003", opponentGuildName: "Night Stalkers", opponentTag: "NITE",
    status: "completed",
    rounds: [
      { category: "total_score", ourScore: 38500, theirScore: 39200, winner: "them" },
      { category: "words_eaten", ourScore: 780, theirScore: 750, winner: "us" },
      { category: "longest_snake", ourScore: 134, theirScore: 148, winner: "them" },
      { category: "combo_master", ourScore: 24, theirScore: 22, winner: "us" },
      { category: "total_score", ourScore: 41200, theirScore: 40100, winner: "us" },
    ],
    ourWins: 3, theirWins: 2, startDate: Date.now() - 1209600000, endDate: Date.now() - 1123200000, xpReward: 1000, coinReward: 400,
  },
  {
    id: "war_003", opponentGuildId: "guild_004", opponentGuildName: "Lexicon Legends", opponentTag: "LEXL",
    status: "active",
    rounds: [
      { category: "total_score", ourScore: 41000, theirScore: 44200, winner: "them" },
      { category: "words_eaten", ourScore: 820, theirScore: 790, winner: "us" },
    ],
    ourWins: 1, theirWins: 1, startDate: Date.now() - 3600000, endDate: 0, xpReward: 0, coinReward: 0,
  },
];

// ---------------------------------------------------------------------------
// Constants: Mock rankings (20 guilds)
// ---------------------------------------------------------------------------

function glMockRanking(rank: number, gId: string, name: string, tag: string, level: number, xp: number, members: number, warW: number, change: number): GuildRanking {
  return { rank, guildId: gId, name, tag, level, totalXp: xp, memberCount: members, warWins: warW, weeklyChange: change };
}

const DEFAULT_RANKINGS: GuildRanking[] = [
  glMockRanking(1, "guild_004", "Lexicon Legends", "LEXL", 30, 36000, 28, 15, 1),
  glMockRanking(2, "guild_001", "Serpent Scholars", "SSHR", 28, 33600, 26, 12, 1),
  glMockRanking(3, "guild_002", "Iron Serpents", "IRON", 24, 28800, 24, 9, -1),
  glMockRanking(4, "guild_003", "Night Stalkers", "NITE", 22, 26400, 22, 7, 2),
  glMockRanking(5, "guild_mock_05", "Word Warriors", "WRWR", 21, 25200, 20, 8, 0),
  glMockRanking(6, "guild_mock_06", "Alphabet Avengers", "ALPH", 20, 24000, 25, 6, -1),
  glMockRanking(7, "guild_mock_07", "Syntax Squad", "SYNT", 19, 22800, 18, 7, 3),
  glMockRanking(8, "guild_mock_08", "Vowel Vanguard", "VOWL", 18, 21600, 22, 5, -2),
  glMockRanking(9, "guild_mock_09", "Consonant Crew", "CONS", 17, 20400, 19, 4, 0),
  glMockRanking(10, "guild_mock_10", "Palindrome Posse", "PALN", 16, 19200, 16, 5, 1),
  glMockRanking(11, "guild_mock_11", "Anagram Alliance", "ANAG", 15, 18000, 21, 3, -1),
  glMockRanking(12, "guild_mock_12", "Rhyme Riders", "RHYM", 14, 16800, 17, 4, 2),
  glMockRanking(13, "guild_mock_13", "Thesaurus Thugs", "THES", 14, 16800, 15, 3, -3),
  glMockRanking(14, "guild_mock_14", "Dictionary Defenders", "DICT", 13, 15600, 20, 2, 0),
  glMockRanking(15, "guild_mock_15", "Grammar Guild", "GRAM", 12, 14400, 14, 3, 1),
  glMockRanking(16, "guild_mock_16", "Phrase Phantoms", "PHRS", 11, 13200, 18, 2, -2),
  glMockRanking(17, "guild_mock_17", "Syllable Snakes", "SYLL", 10, 12000, 13, 1, 0),
  glMockRanking(18, "guild_mock_18", "Letter Legends", "LTR", 9, 10800, 16, 2, 1),
  glMockRanking(19, "guild_mock_19", "Word Wanderers", "WNDR", 8, 9600, 12, 1, -1),
  glMockRanking(20, "guild_mock_20", "Newbie Nest", "NWBN", 5, 6000, 8, 0, 0),
];

// ---------------------------------------------------------------------------
// Constants: Mock applications
// ---------------------------------------------------------------------------

const DEFAULT_APPLICATIONS: GuildApplication[] = [
  { id: "app_001", playerId: "p_100", playerName: "WordWanderer", playerLevel: 15, playerAvatar: "🗺️", guildId: "guild_001", message: "I love words and snakes! Please let me join!", timestamp: Date.now() - 7200000 },
  { id: "app_002", playerId: "p_101", playerName: "TypoTerminator", playerLevel: 22, playerAvatar: "🔫", guildId: "guild_001", message: "I can contribute 500+ words per week!", timestamp: Date.now() - 14400000 },
  { id: "app_003", playerId: "p_102", playerName: "NoviceNoodle", playerLevel: 8, playerAvatar: "🍜", guildId: "guild_001", message: "I'm new but very eager to learn!", timestamp: Date.now() - 28800000 },
];

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

let state: GuildState | null = null;

function generateId(prefix: string = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function ensureInit(): GuildState {
  if (!state) {
    state = {
      currentGuildId: "guild_001",
      currentMemberId: "m_01",
      guilds: JSON.parse(JSON.stringify(DEFAULT_GUILDS)),
      wars: JSON.parse(JSON.stringify(DEFAULT_WARS)),
      quests: JSON.parse(JSON.stringify(GUILD_QUESTS)),
      chatMessages: JSON.parse(JSON.stringify(MOCK_CHAT_MESSAGES)),
      applications: JSON.parse(JSON.stringify(DEFAULT_APPLICATIONS)),
      rankings: JSON.parse(JSON.stringify(DEFAULT_RANKINGS)),
      achievements: JSON.parse(JSON.stringify(GUILD_ACHIEVEMENTS)),
      unreadCount: 3,
      weeklyXpGain: 4800,
    };
  }
  return state;
}

function findCurrentGuild(s: GuildState): Guild | null {
  if (!s.currentGuildId) return null;
  return s.guilds.find((g) => g.id === s.currentGuildId) ?? null;
}

function findCurrentMember(s: GuildState): GuildMember | null {
  const guild = findCurrentGuild(s);
  if (!guild) return null;
  return guild.members.find((m) => m.id === s.currentMemberId) ?? null;
}

function xpForLevel(level: number): number {
  return level * 1200 + 500;
}

function canAct(s: GuildState, permission: keyof RolePermission): boolean {
  const member = findCurrentMember(s);
  if (!member) return false;
  const rp = ROLE_PERMISSIONS.find((r) => r.role === member.role);
  if (!rp) return false;
  return rp[permission] === true;
}

// ---------------------------------------------------------------------------
// 1. State management
// ---------------------------------------------------------------------------

/**
 * glGetState — Returns the full guild state object.
 * Initializes on first call (SSR-safe).
 */
export function glGetState(): GuildState {
  return ensureInit();
}

/**
 * glResetState — Resets all guild data to defaults.
 * Useful for testing or starting fresh.
 */
export function glResetState(): void {
  state = null;
  ensureInit();
}

// ---------------------------------------------------------------------------
// 2. Guild creation & management
// ---------------------------------------------------------------------------

/**
 * glGetGuild — Returns the current guild or null if not in one.
 */
export function glGetGuild(): Guild | null {
  return findCurrentGuild(ensureInit());
}

/**
 * glCreateGuild — Create a new guild with given name and tag.
 * Validates name (3-20 chars), tag (2-4 chars, uppercase).
 * The creator becomes the leader.
 */
export function glCreateGuild(name: string, tag: string): Guild | null {
  const s = ensureInit();
  if (!name || !tag) return null;
  name = name.trim();
  tag = tag.trim().toUpperCase();
  if (name.length < 3 || name.length > 20) return null;
  if (tag.length < 2 || tag.length > 4) return null;
  if (s.currentGuildId) return null; // already in a guild

  const newGuild: Guild = {
    id: generateId("guild"),
    name,
    tag,
    description: "",
    emblemId: "snake_crown",
    emblemColor: "#FFD700",
    level: 1,
    xp: 0,
    xpToNextLevel: xpForLevel(1),
    settings: { isPublic: true, joinRequirement: "application", levelRequirement: 5, memberLimit: 30, moto: "" },
    members: [{
      id: s.currentMemberId, name: "You", role: "leader",
      joinDate: Date.now(), lastOnline: Date.now(),
      contributionScore: 0, wordsEaten: 0, avatar: "🎮",
    }],
    createdAt: Date.now(),
    warWins: 0,
    warLosses: 0,
    totalWordsEaten: 0,
    achievementIds: [],
  };

  s.guilds.push(newGuild);
  s.currentGuildId = newGuild.id;
  return newGuild;
}

/**
 * glJoinGuild — Join a guild by ID.
 * Checks member limit and join requirements.
 */
export function glJoinGuild(guildId: string): boolean {
  const s = ensureInit();
  if (!guildId || s.currentGuildId) return false;

  const guild = s.guilds.find((g) => g.id === guildId);
  if (!guild) return false;
  if (!guild.settings.isPublic && guild.settings.joinRequirement !== "open") return false;
  if (guild.members.length >= guild.settings.memberLimit) return false;

  guild.members.push({
    id: s.currentMemberId, name: "You", role: "member",
    joinDate: Date.now(), lastOnline: Date.now(),
    contributionScore: 0, wordsEaten: 0, avatar: "🎮",
  });
  s.currentGuildId = guildId;
  return true;
}

/**
 * glLeaveGuild — Leave the current guild.
 * Leaders must transfer or disband first.
 */
export function glLeaveGuild(): boolean {
  const s = ensureInit();
  const member = findCurrentMember(s);
  if (!member) return false;
  if (member.role === "leader") return false; // must transfer or disband

  const guild = findCurrentGuild(s);
  if (!guild) return false;
  guild.members = guild.members.filter((m) => m.id !== s.currentMemberId);
  s.currentGuildId = null;
  return true;
}

/**
 * glDisbandGuild — Disband the current guild (leader only).
 * Removes guild from all lists.
 */
export function glDisbandGuild(): boolean {
  const s = ensureInit();
  if (!canAct(s, "canDisband")) return false;

  const guild = findCurrentGuild(s);
  if (!guild) return false;

  s.guilds = s.guilds.filter((g) => g.id !== guild.id);
  s.wars = s.wars.filter((w) => w.opponentGuildId !== guild.id);
  s.applications = s.applications.filter((a) => a.guildId !== guild.id);
  s.rankings = s.rankings.filter((r) => r.guildId !== guild.id);
  s.currentGuildId = null;
  return true;
}

/**
 * glGetAvailableGuilds — Returns all public guilds (excludes current).
 */
export function glGetAvailableGuilds(): Guild[] {
  const s = ensureInit();
  return s.guilds.filter((g) => g.id !== s.currentGuildId && g.settings.isPublic);
}

/**
 * glSearchGuilds — Search guilds by name or tag (case-insensitive).
 */
export function glSearchGuilds(query: string): Guild[] {
  const s = ensureInit();
  if (!query?.trim()) return [];
  const q = query.trim().toLowerCase();
  return s.guilds.filter(
    (g) => g.id !== s.currentGuildId && (g.name.toLowerCase().includes(q) || g.tag.toLowerCase().includes(q))
  );
}

// ---------------------------------------------------------------------------
// 3. Member management
// ---------------------------------------------------------------------------

/**
 * glGetMembers — Returns all members of the current guild, sorted by role hierarchy.
 */
export function glGetMembers(): GuildMember[] {
  const s = ensureInit();
  const guild = findCurrentGuild(s);
  if (!guild) return [];
  return [...guild.members].sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));
}

/**
 * glGetMember — Get a specific member by ID from the current guild.
 */
export function glGetMember(id: string): GuildMember | null {
  const s = ensureInit();
  const guild = findCurrentGuild(s);
  if (!guild || !id) return null;
  return guild.members.find((m) => m.id === id) ?? null;
}

/**
 * glKickMember — Kick a member from the guild (requires kick permission).
 * Cannot kick the leader.
 */
export function glKickMember(id: string): boolean {
  const s = ensureInit();
  if (!id || !canAct(s, "canKick")) return false;

  const guild = findCurrentGuild(s);
  if (!guild) return false;

  const target = guild.members.find((m) => m.id === id);
  if (!target || target.role === "leader") return false;

  // co-leader can't kick another co-leader unless they are leader
  const actor = findCurrentMember(s);
  if (actor && actor.role === "co_leader" && target.role === "co_leader") return false;

  guild.members = guild.members.filter((m) => m.id !== id);

  // add system chat message
  s.chatMessages.push({
    id: generateId("cm"), memberId: "system", memberName: "System",
    type: "system", content: `${target.name} has been kicked from the guild.`,
    timestamp: Date.now(),
  });
  s.unreadCount += 1;
  return true;
}

/**
 * glPromoteMember — Promote a member to the next higher role.
 */
export function glPromoteMember(id: string): boolean {
  const s = ensureInit();
  if (!id || !canAct(s, "canPromote")) return false;

  const guild = findCurrentGuild(s);
  if (!guild) return false;

  const target = guild.members.find((m) => m.id === id);
  if (!target) return false;

  const currentIdx = ROLE_ORDER.indexOf(target.role);
  if (currentIdx <= 0) return false; // already leader or invalid

  // co-leader can't promote to co-leader or above
  const actor = findCurrentMember(s);
  if (actor && actor.role !== "leader" && currentIdx <= 1) return false;

  const newRole = ROLE_ORDER[currentIdx - 1];

  // Only one leader allowed — this is a transfer
  if (newRole === "leader" && actor) {
    actor.role = "co_leader";
  }

  target.role = newRole;
  s.chatMessages.push({
    id: generateId("cm"), memberId: "system", memberName: "System",
    type: "system", content: `${target.name} has been promoted to ${ROLE_PERMISSIONS.find((r) => r.role === newRole)?.label ?? newRole}.`,
    timestamp: Date.now(),
  });
  return true;
}

/**
 * glDemoteMember — Demote a member to the next lower role.
 */
export function glDemoteMember(id: string): boolean {
  const s = ensureInit();
  if (!id || !canAct(s, "canPromote")) return false;

  const guild = findCurrentGuild(s);
  if (!guild) return false;

  const target = guild.members.find((m) => m.id === id);
  if (!target) return false;

  const currentIdx = ROLE_ORDER.indexOf(target.role);
  if (currentIdx < 0 || currentIdx >= ROLE_ORDER.length - 1) return false;

  target.role = ROLE_ORDER[currentIdx + 1];
  s.chatMessages.push({
    id: generateId("cm"), memberId: "system", memberName: "System",
    type: "system", content: `${target.name} has been demoted to ${ROLE_PERMISSIONS.find((r) => r.role === target.role)?.label ?? target.role}.`,
    timestamp: Date.now(),
  });
  return true;
}

// ---------------------------------------------------------------------------
// 4. Roles & permissions
// ---------------------------------------------------------------------------

/**
 * glGetRoles — Returns all role definitions with permissions.
 */
export function glGetRoles(): RolePermission[] {
  return [...ROLE_PERMISSIONS];
}

/**
 * glGetRolePermissions — Returns permissions for a specific role.
 */
export function glGetRolePermissions(role: GuildRole): RolePermission | null {
  return ROLE_PERMISSIONS.find((r) => r.role === role) ?? null;
}

// ---------------------------------------------------------------------------
// 5. Emblems
// ---------------------------------------------------------------------------

/**
 * glGetEmblems — Returns all available emblem options.
 */
export function glGetEmblems(): Emblem[] {
  return [...EMBLEMS];
}

/**
 * glSetEmblem — Set the guild's emblem (leader/co-leader).
 */
export function glSetEmblem(emblemId: string, colorVariant?: string): boolean {
  const s = ensureInit();
  if (!emblemId || !canAct(s, "canManageSettings")) return false;

  const guild = findCurrentGuild(s);
  if (!guild) return false;

  const emblem = EMBLEMS.find((e) => e.id === emblemId);
  if (!emblem) return false;

  guild.emblemId = emblemId;
  if (colorVariant) {
    guild.emblemColor = emblem.colorVariants.includes(colorVariant) ? colorVariant : emblem.colorVariants[0];
  }
  return true;
}

/**
 * glGetGuildEmblem — Returns the current guild's emblem data with chosen color.
 */
export function glGetGuildEmblem(): { emblem: Emblem | null; color: string } {
  const guild = findCurrentGuild(ensureInit());
  if (!guild) return { emblem: null, color: "#000" };
  const emblem = EMBLEMS.find((e) => e.id === guild.emblemId) ?? null;
  return { emblem, color: guild.emblemColor };
}

// ---------------------------------------------------------------------------
// 6. Settings
// ---------------------------------------------------------------------------

/**
 * glGetSettings — Returns current guild settings.
 */
export function glGetSettings(): GuildSettings | null {
  const guild = findCurrentGuild(ensureInit());
  return guild ? { ...guild.settings } : null;
}

/**
 * glUpdateSetting — Update a guild setting (leader/co-leader only).
 */
export function glUpdateSetting(key: keyof GuildSettings, value: unknown): boolean {
  const s = ensureInit();
  if (!canAct(s, "canManageSettings")) return false;

  const guild = findCurrentGuild(s);
  if (!guild) return false;

  const validKeys: (keyof GuildSettings)[] = ["isPublic", "joinRequirement", "levelRequirement", "memberLimit", "moto"];
  if (!validKeys.includes(key)) return false;

  (guild.settings as Record<string, unknown>)[key] = value;

  if (key === "memberLimit") {
    guild.settings.memberLimit = clamp(guild.settings.memberLimit, 5, 30);
  }
  if (key === "levelRequirement") {
    guild.settings.levelRequirement = clamp(guild.settings.levelRequirement, 1, 50);
  }
  return true;
}

/**
 * glGetGuildMotto — Returns the current guild motto.
 */
export function glGetGuildMotto(): string {
  const guild = findCurrentGuild(ensureInit());
  return guild?.settings.moto ?? "";
}

// ---------------------------------------------------------------------------
// 7. Guild XP & Level
// ---------------------------------------------------------------------------

/**
 * glGetGuildLevel — Returns the current guild level and XP info.
 */
export function glGetGuildLevel(): { level: number; xp: number; xpToNext: number; progress: number } {
  const guild = findCurrentGuild(ensureInit());
  if (!guild) return { level: 1, xp: 0, xpToNext: xpForLevel(1), progress: 0 };
  const progress = guild.xpToNextLevel > 0 ? Math.round((guild.xp / guild.xpToNextLevel) * 100) : 0;
  return { level: guild.level, xp: guild.xp, xpToNext: guild.xpToNextLevel, progress };
}

/**
 * glAddGuildXP — Add XP to the current guild. Handles level-ups up to level 50.
 */
export function glAddGuildXP(amount: number): { leveledUp: boolean; newLevel: number; totalXp: number } {
  const s = ensureInit();
  const guild = findCurrentGuild(s);
  if (!guild || amount <= 0) return { leveledUp: false, newLevel: guild?.level ?? 1, totalXp: guild?.xp ?? 0 };

  let leveledUp = false;
  guild.xp += amount;
  s.weeklyXpGain += amount;

  while (guild.level < 50 && guild.xp >= guild.xpToNextLevel) {
    guild.xp -= guild.xpToNextLevel;
    guild.level += 1;
    guild.xpToNextLevel = xpForLevel(guild.level);
    leveledUp = true;

    s.chatMessages.push({
      id: generateId("cm"), memberId: "system", memberName: "System",
      type: "achievement", content: `🎉 Guild leveled up to level ${guild.level}!`,
      timestamp: Date.now(),
    });
  }

  // update ranking xp
  const ranking = s.rankings.find((r) => r.guildId === guild.id);
  if (ranking) {
    ranking.totalXp = guild.level * 1200 + guild.xp;
    ranking.level = guild.level;
  }

  return { leveledUp, newLevel: guild.level, totalXp: guild.xp };
}

// ---------------------------------------------------------------------------
// 8. Guild Wars
// ---------------------------------------------------------------------------

/**
 * glGetWars — Returns all wars for the current guild.
 */
export function glGetWars(): GuildWar[] {
  const s = ensureInit();
  return [...s.wars];
}

/**
 * glStartWar — Start a new guild war against another guild.
 * Validates war eligibility (one active war at a time).
 */
export function glStartWar(opponentGuildId: string): GuildWar | null {
  const s = ensureInit();
  if (!canAct(s, "canStartWars")) return null;
  if (!opponentGuildId) return null;

  // Only one active war at a time
  const activeWar = s.wars.find((w) => w.status === "active");
  if (activeWar) return null;

  // Can't war against yourself
  if (opponentGuildId === s.currentGuildId) return null;

  const opponent = s.guilds.find((g) => g.id === opponentGuildId);
  if (!opponent) return null;

  const war: GuildWar = {
    id: generateId("war"),
    opponentGuildId: opponent.id,
    opponentGuildName: opponent.name,
    opponentTag: opponent.tag,
    status: "preparing",
    rounds: [],
    ourWins: 0,
    theirWins: 0,
    startDate: Date.now(),
    endDate: 0,
    xpReward: 0,
    coinReward: 0,
  };

  s.wars.unshift(war);
  s.chatMessages.push({
    id: generateId("cm"), memberId: "system", memberName: "System",
    type: "challenge", content: `⚔️ War declared against [${opponent.tag}] ${opponent.name}! Prepare yourselves!`,
    timestamp: Date.now(),
  });
  return war;
}

/**
 * glGetWarResults — Returns results of the most recent completed war.
 */
export function glGetWarResults(): GuildWar | null {
  const s = ensureInit();
  return s.wars.find((w) => w.status === "completed") ?? null;
}

/**
 * glGetWarHistory — Returns all past (completed) wars with trophy info.
 */
export function glGetWarHistory(): { wars: GuildWar[]; trophies: { wins: number; losses: number; draws: number; streak: number; bestStreak: number } } {
  const s = ensureInit();
  const completed = s.wars.filter((w) => w.status === "completed");
  const wins = completed.filter((w) => w.ourWins > w.theirWins).length;
  const losses = completed.filter((w) => w.ourWins < w.theirWins).length;
  const draws = completed.filter((w) => w.ourWins === w.theirWins).length;

  // Calculate current and best win streak
  let streak = 0;
  let bestStreak = 0;
  for (const w of completed) {
    if (w.ourWins > w.theirWins) {
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }
  }

  return { wars: completed, trophies: { wins, losses, draws, streak, bestStreak } };
}

/**
 * glGetWarTrophies — Returns aggregated war trophy statistics.
 */
export function glGetWarTrophies(): { totalWars: number; wins: number; losses: number; draws: number; totalXpEarned: number; totalCoinsEarned: number; bestVictory: WarRound[] | null } {
  const s = ensureInit();
  const completed = s.wars.filter((w) => w.status === "completed");
  const wins = completed.filter((w) => w.ourWins > w.theirWins).length;
  const losses = completed.filter((w) => w.ourWins < w.theirWins).length;
  const draws = completed.filter((w) => w.ourWins === w.theirWins).length;
  const totalXp = completed.reduce((s, w) => s + w.xpReward, 0);
  const totalCoins = completed.reduce((s, w) => s + w.coinReward, 0);

  let bestVictory: WarRound[] | null = null;
  let bestDiff = -1;
  for (const w of completed) {
    if (w.ourWins > w.theirWins) {
      const diff = w.ourWins - w.theirWins;
      if (diff > bestDiff) {
        bestDiff = diff;
        bestVictory = w.rounds;
      }
    }
  }

  return { totalWars: completed.length, wins, losses, draws, totalXpEarned: totalXp, totalCoinsEarned: totalCoins, bestVictory };
}

// ---------------------------------------------------------------------------
// 9. Guild Quests
// ---------------------------------------------------------------------------

/**
 * glGetQuests — Returns all available and active quests.
 */
export function glGetQuests(): GuildQuest[] {
  const s = ensureInit();
  return [...s.quests];
}

/**
 * glStartQuest — Activate a quest for the guild.
 */
export function glStartQuest(questId: string): GuildQuest | null {
  const s = ensureInit();
  if (!questId) return null;

  const quest = s.quests.find((q) => q.id === questId);
  if (!quest || quest.status !== "available") return null;

  // Max 3 active quests at a time
  const activeCount = s.quests.filter((q) => q.status === "active").length;
  if (activeCount >= 3) return null;

  quest.status = "active";
  quest.startTime = Date.now();
  quest.progress = 0;
  quest.contributors = [];

  s.chatMessages.push({
    id: generateId("cm"), memberId: "system", memberName: "System",
    type: "challenge", content: `📋 New guild quest started: "${quest.name}"! Let's work together!`,
    timestamp: Date.now(),
  });

  return quest;
}

/**
 * glContributeToQuest — Add progress to an active quest.
 */
export function glContributeToQuest(questId: string, amount: number): { completed: boolean; newProgress: number; target: number } {
  const s = ensureInit();
  if (!questId || amount <= 0) return { completed: false, newProgress: 0, target: 0 };

  const quest = s.quests.find((q) => q.id === questId);
  if (!quest || quest.status !== "active") return { completed: false, newProgress: quest?.progress ?? 0, target: quest?.target ?? 0 };

  // Check time limit
  if (quest.startTime && Date.now() - quest.startTime > quest.timeLimit) {
    quest.status = "expired";
    return { completed: false, newProgress: quest.progress, target: quest.target };
  }

  quest.progress = Math.min(quest.progress + amount, quest.target);

  // Track contributor
  const existing = quest.contributors.find((c) => c.memberId === s.currentMemberId);
  if (existing) {
    existing.amount += amount;
  } else {
    quest.contributors.push({
      memberId: s.currentMemberId,
      memberName: "You",
      amount,
    });
  }

  if (quest.progress >= quest.target) {
    quest.status = "completed";
    glAddGuildXP(quest.xpReward);
    s.chatMessages.push({
      id: generateId("cm"), memberId: "system", memberName: "System",
      type: "achievement", content: `🎉 Quest "${quest.name}" completed! Guild earned ${quest.xpReward} XP!`,
      timestamp: Date.now(),
    });
    return { completed: true, newProgress: quest.progress, target: quest.target };
  }

  return { completed: false, newProgress: quest.progress, target: quest.target };
}

// ---------------------------------------------------------------------------
// 10. Guild Chat (simulated)
// ---------------------------------------------------------------------------

/**
 * glGetChatMessages — Returns the last N chat messages (default 50).
 */
export function glGetChatMessages(limit: number = 50): ChatMessage[] {
  const s = ensureInit();
  const clampedLimit = clamp(limit, 1, 50);
  return [...s.chatMessages].sort((a, b) => b.timestamp - a.timestamp).slice(0, clampedLimit);
}

/**
 * glSendMessage — Send a text message to guild chat.
 */
export function glSendMessage(text: string): ChatMessage | null {
  const s = ensureInit();
  if (!text?.trim()) return null;
  if (!s.currentGuildId) return null;

  const member = findCurrentMember(s);
  const msg: ChatMessage = {
    id: generateId("cm"),
    memberId: s.currentMemberId,
    memberName: member?.name ?? "You",
    type: "text",
    content: text.trim().slice(0, 500),
    timestamp: Date.now(),
  };

  s.chatMessages.push(msg);

  // Keep only last 50 messages
  if (s.chatMessages.length > 50) {
    s.chatMessages = s.chatMessages.slice(-50);
  }

  return msg;
}

/**
 * glGetUnreadCount — Returns the number of unread guild chat messages.
 */
export function glGetUnreadCount(): number {
  return ensureInit().unreadCount;
}

// ---------------------------------------------------------------------------
// 11. Rankings
// ---------------------------------------------------------------------------

/**
 * glGetRankings — Returns the global guild leaderboard (20 entries).
 */
export function glGetRankings(): GuildRanking[] {
  return [...ensureInit().rankings];
}

/**
 * glGetGuildRank — Returns the rank entry for the current guild.
 */
export function glGetGuildRank(): GuildRanking | null {
  const s = ensureInit();
  if (!s.currentGuildId) return null;
  return s.rankings.find((r) => r.guildId === s.currentGuildId) ?? null;
}

// ---------------------------------------------------------------------------
// 12. Achievements
// ---------------------------------------------------------------------------

/**
 * glGetAchievements — Returns all guild achievements with unlock status.
 */
export function glGetAchievements(): GuildAchievement[] {
  const s = ensureInit();
  const guild = findCurrentGuild(s);

  return s.achievements.map((a) => ({
    ...a,
    unlockedAt: guild?.achievementIds.includes(a.id) ? (a.unlockedAt ?? Date.now()) : null,
  }));
}

/**
 * glUnlockAchievement — Unlock a guild achievement.
 */
export function glUnlockAchievement(achievementId: string): boolean {
  const s = ensureInit();
  if (!achievementId) return false;

  const guild = findCurrentGuild(s);
  if (!guild) return false;

  const achievement = s.achievements.find((a) => a.id === achievementId);
  if (!achievement || guild.achievementIds.includes(achievementId)) return false;

  guild.achievementIds.push(achievementId);
  achievement.unlockedAt = Date.now();
  glAddGuildXP(achievement.xpReward);

  s.chatMessages.push({
    id: generateId("cm"), memberId: "system", memberName: "System",
    type: "achievement", content: `🏆 Guild achievement unlocked: "${achievement.name}"! +${achievement.xpReward} XP`,
    timestamp: Date.now(),
  });

  return true;
}

// ---------------------------------------------------------------------------
// 13. Applications
// ---------------------------------------------------------------------------

/**
 * glGetApplications — Returns pending applications to the current guild.
 */
export function glGetApplications(): GuildApplication[] {
  const s = ensureInit();
  if (!s.currentGuildId) return [];
  return s.applications.filter((a) => a.guildId === s.currentGuildId);
}

/**
 * glApplyToGuild — Submit an application to join a guild.
 */
export function glApplyToGuild(guildId: string): boolean {
  const s = ensureInit();
  if (!guildId || s.currentGuildId) return false;

  const guild = s.guilds.find((g) => g.id === guildId);
  if (!guild) return false;
  if (guild.settings.joinRequirement !== "application") return false;
  if (guild.members.length >= guild.settings.memberLimit) return false;

  // Already applied?
  if (s.applications.some((a) => a.guildId === guildId && a.playerId === s.currentMemberId)) return false;

  s.applications.push({
    id: generateId("app"),
    playerId: s.currentMemberId,
    playerName: "You",
    playerLevel: 25,
    playerAvatar: "🎮",
    guildId,
    message: "I'd like to join your guild!",
    timestamp: Date.now(),
  });

  return true;
}

/**
 * glAcceptApplication — Accept a pending guild application.
 */
export function glAcceptApplication(applicationId: string): boolean {
  const s = ensureInit();
  if (!applicationId || !canAct(s, "canManageApplications")) return false;

  const appIndex = s.applications.findIndex((a) => a.id === applicationId);
  if (appIndex === -1) return false;

  const app = s.applications[appIndex];
  const guild = s.guilds.find((g) => g.id === app.guildId);
  if (!guild || guild.members.length >= guild.settings.memberLimit) return false;

  guild.members.push({
    id: app.playerId, name: app.playerName, role: "member",
    joinDate: Date.now(), lastOnline: Date.now(),
    contributionScore: 0, wordsEaten: 0, avatar: app.playerAvatar,
  });

  s.applications.splice(appIndex, 1);
  return true;
}

// ---------------------------------------------------------------------------
// 14. Contribution & Statistics
// ---------------------------------------------------------------------------

/**
 * glGetTopContributors — Returns members sorted by contribution score (top N).
 */
export function glGetTopContributors(limit: number = 10): { member: GuildMember; rank: number }[] {
  const s = ensureInit();
  const guild = findCurrentGuild(s);
  if (!guild) return [];

  const clampedLimit = clamp(limit, 1, 30);
  return [...guild.members]
    .sort((a, b) => b.contributionScore - a.contributionScore)
    .slice(0, clampedLimit)
    .map((m, i) => ({ member: m, rank: i + 1 }));
}

/**
 * glGetContributionRank — Returns the current player's contribution rank.
 */
export function glGetContributionRank(): { rank: number; total: number; score: number } {
  const s = ensureInit();
  const guild = findCurrentGuild(s);
  if (!guild) return { rank: 0, total: 0, score: 0 };

  const sorted = [...guild.members].sort((a, b) => b.contributionScore - a.contributionScore);
  const idx = sorted.findIndex((m) => m.id === s.currentMemberId);
  const member = sorted[idx];

  return {
    rank: idx >= 0 ? idx + 1 : 0,
    total: sorted.length,
    score: member?.contributionScore ?? 0,
  };
}

/**
 * glGetGuildStats — Returns aggregate guild statistics.
 */
export function glGetGuildStats(): {
  totalMembers: number; activeMembers: number; totalWordsEaten: number;
  totalContribution: number; avgContribution: number; guildAge: number;
  warRecord: string; topContributor: string; questCompletionRate: number;
} {
  const s = ensureInit();
  const guild = findCurrentGuild(s);
  if (!guild) {
    return {
      totalMembers: 0, activeMembers: 0, totalWordsEaten: 0,
      totalContribution: 0, avgContribution: 0, guildAge: 0,
      warRecord: "0-0", topContributor: "N/A", questCompletionRate: 0,
    };
  }

  const now = Date.now();
  const activeMembers = guild.members.filter((m) => now - m.lastOnline < 86400000 * 7).length;
  const totalContribution = guild.members.reduce((s, m) => s + m.contributionScore, 0);
  const avgContribution = guild.members.length > 0 ? Math.round(totalContribution / guild.members.length) : 0;
  const guildAge = Math.floor((now - guild.createdAt) / 86400000);
  const topContributor = [...guild.members].sort((a, b) => b.contributionScore - a.contributionScore)[0];
  const completedQuests = s.quests.filter((q) => q.status === "completed").length;
  const totalQuests = s.quests.length;

  return {
    totalMembers: guild.members.length,
    activeMembers,
    totalWordsEaten: guild.totalWordsEaten,
    totalContribution,
    avgContribution,
    guildAge,
    warRecord: `${guild.warWins}-${guild.warLosses}`,
    topContributor: topContributor?.name ?? "N/A",
    questCompletionRate: totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0,
  };
}

/**
 * glGetWeeklyProgress — Returns this week's guild progress metrics.
 */
export function glGetWeeklyProgress(): {
  xpGain: number; wordsEaten: number; questsCompleted: number;
  warsFought: number; warsWon: number; membersJoined: number;
  newAchievements: number;
} {
  const s = ensureInit();
  const oneWeekAgo = Date.now() - 604800000;

  const recentWars = s.wars.filter((w) => w.startDate >= oneWeekAgo);
  const recentCompletedQuests = s.quests.filter((q) => q.status === "completed" && q.startTime && q.startTime >= oneWeekAgo);

  return {
    xpGain: s.weeklyXpGain,
    wordsEaten: Math.floor(Math.random() * 5000) + 2000, // simulated
    questsCompleted: recentCompletedQuests.length,
    warsFought: recentWars.length,
    warsWon: recentWars.filter((w) => w.ourWins > w.theirWins).length,
    membersJoined: Math.floor(Math.random() * 3), // simulated
    newAchievements: Math.floor(Math.random() * 2), // simulated
  };
}

// ---------------------------------------------------------------------------
// 15. UI Cards
// ---------------------------------------------------------------------------

/**
 * glGetGuildCard — Returns a UI-ready card for the current guild.
 */
export function glGetGuildCard(): GuildCardData | null {
  const guild = findCurrentGuild(ensureInit());
  if (!guild) return null;

  const emblem = EMBLEMS.find((e) => e.id === guild.emblemId);

  return {
    id: guild.id,
    name: guild.name,
    tag: guild.tag,
    level: guild.level,
    memberCount: guild.members.length,
    maxMembers: guild.settings.memberLimit,
    emblemIcon: emblem?.icon ?? "🐍",
    emblemColor: guild.emblemColor,
    warWins: guild.warWins,
    warLosses: guild.warLosses,
    isPublic: guild.settings.isPublic,
  };
}

/**
 * glGetMemberCard — Returns a UI-ready card for a specific member.
 */
export function glGetMemberCard(memberId: string): MemberCardData | null {
  const s = ensureInit();
  const guild = findCurrentGuild(s);
  if (!guild || !memberId) return null;

  const member = guild.members.find((m) => m.id === memberId);
  if (!member) return null;

  const sorted = [...guild.members].sort((a, b) => b.contributionScore - a.contributionScore);
  const rank = sorted.findIndex((m) => m.id === memberId) + 1;
  const rolePerm = ROLE_PERMISSIONS.find((r) => r.role === member.role);

  return {
    id: member.id,
    name: member.name,
    avatar: member.avatar,
    role: member.role,
    roleLabel: rolePerm?.label ?? member.role,
    contributionScore: member.contributionScore,
    contributionRank: rank > 0 ? rank : guild.members.length,
    wordsEaten: member.wordsEaten,
    joinDate: member.joinDate,
    lastOnline: member.lastOnline,
    isOnline: Date.now() - member.lastOnline < 300000,
  };
}

/**
 * glGetWarCard — Returns a UI-ready card for a specific war.
 */
export function glGetWarCard(warId: string): WarCardData | null {
  const s = ensureInit();
  const war = s.wars.find((w) => w.id === warId);
  if (!war) return null;

  return {
    id: war.id,
    opponentName: war.opponentGuildName,
    opponentTag: war.opponentTag,
    status: war.status,
    ourWins: war.ourWins,
    theirWins: war.theirWins,
    rounds: [...war.rounds],
    xpReward: war.xpReward,
    coinReward: war.coinReward,
    startDate: war.startDate,
    endDate: war.endDate,
  };
}

// ---------------------------------------------------------------------------
// 16. UI Overview & Dashboard
// ---------------------------------------------------------------------------

/**
 * glGetGuildOverview — Returns a comprehensive overview of the current guild.
 */
export function glGetGuildOverview(): GuildOverviewData {
  const s = ensureInit();
  const guild = findCurrentGuild(s);

  return {
    guild: guild ? { ...guild, members: [...guild.members] } : null,
    members: guild?.members ?? [],
    recentWars: s.wars.filter((w) => w.status === "completed" || w.status === "active").slice(0, 5),
    activeQuests: s.quests.filter((q) => q.status === "active" || q.status === "available"),
    achievements: s.achievements.map((a) => ({
      ...a,
      unlockedAt: guild?.achievementIds.includes(a.id) ? (a.unlockedAt ?? Date.now()) : null,
    })),
    ranking: s.rankings.find((r) => r.guildId === s.currentGuildId) ?? null,
    chatPreview: [...s.chatMessages].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5),
  };
}

/**
 * glGetGuildDashboard — Returns a UI-ready dashboard with all key metrics.
 */
export function glGetGuildDashboard(): GuildDashboardData {
  const s = ensureInit();
  const guild = findCurrentGuild(s);
  const card = guild ? glGetGuildCard() : null;
  const levelInfo = glGetGuildLevel();
  const completedAchievements = guild?.achievementIds.length ?? 0;
  const activeQuests = s.quests.filter((q) => q.status === "active").length;
  const totalWars = guild ? guild.warWins + guild.warLosses : 0;
  const winRate = totalWars > 0 ? Math.round((guild!.warWins / totalWars) * 100) : 0;
  const activeMembers = guild ? guild.members.filter((m) => Date.now() - m.lastOnline < 86400000 * 7).length : 0;
  const rankEntry = s.rankings.find((r) => r.guildId === s.currentGuildId);

  return {
    guild: card,
    level: levelInfo.level,
    xp: levelInfo.xp,
    xpToNext: levelInfo.xpToNext,
    memberCount: guild?.members.length ?? 0,
    activeMembers,
    totalWordsEaten: guild?.totalWordsEaten ?? 0,
    warWins: guild?.warWins ?? 0,
    warLosses: guild?.warLosses ?? 0,
    winRate,
    activeQuests,
    completedAchievements,
    totalAchievements: s.achievements.length,
    rankPosition: rankEntry?.rank ?? 0,
    unreadMessages: s.unreadCount,
    weeklyXpGain: s.weeklyXpGain,
  };
}
