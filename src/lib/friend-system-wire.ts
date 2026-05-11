/**
 * friend-system-wire.ts
 *
 * Comprehensive friend system management wire for the Word Snake game.
 * All data is persisted in localStorage with the `ws_friends_` prefix.
 * Every exported function is standalone (no classes) and wrapped in
 * try/catch with sensible defaults for a safe developer experience.
 *
 * @module friend-system-wire
 */

const STORAGE_PREFIX = "ws_friends_";

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

/** Online status for a friend. */
export type OnlineStatus = "online" | "offline" | "away" | "in_game" | "idle";

/** Friendship level — increases as you play more games together. */
export type FriendshipLevel = "new_pal" | "buddy" | "companion" | "rival" | "best_friend";

/** Status of a friend request. */
export type RequestStatus = "pending" | "accepted" | "rejected" | "expired";

/** Direction of the friend request relative to the current user. */
export type RequestDirection = "incoming" | "outgoing";

/** A single activity type in a friend's activity feed. */
export type ActivityType =
  | "played_game" | "won_game" | "new_high_score" | "unlocked_achievement"
  | "level_up" | "completed_daily" | "purchased_skin" | "sent_invite"
  | "joined_word_snake";

/** Represents a single friend stored in the system. */
export interface Friend {
  username: string;
  displayName: string;
  avatar: string;
  level: number;
  onlineStatus: OnlineStatus;
  lastActive: string;
  friendshipLevel: FriendshipLevel;
  gamesPlayedTogether: number;
  gamesWonTogether: number;
  addedAt: string;
  notes: string;
  favoriteWords: string[];
}

/** A friend request (incoming or outgoing). */
export interface FriendRequest {
  id: string; from: string; to: string; status: RequestStatus;
  direction: RequestDirection; sentAt: string; message: string;
}

/** A single chat message in a conversation. */
export interface ChatMessage {
  id: string; from: string; to: string; content: string;
  timestamp: string; read: boolean; type: "text" | "invite" | "system";
}

/** A conversation between two users. */
export interface Conversation {
  username: string; messages: ChatMessage[];
  lastMessageAt: string; unreadCount: number;
}

/** A game invitation sent to a friend. */
export interface GameInvite {
  id: string; from: string; to: string;
  mode: "classic" | "speed" | "challenge" | "pvp" | "story";
  status: "pending" | "accepted" | "declined" | "expired"; sentAt: string;
}

/** A single activity feed entry. */
export interface ActivityEntry {
  id: string; username: string; type: ActivityType;
  description: string; timestamp: string; metadata: Record<string, unknown>;
}

/** Summary card returned by UI helper functions. */
export interface FriendSummaryCard {
  totalFriends: number; onlineCount: number; pendingRequests: number;
  blockedCount: number; recentActivityCount: number; topFriend: string | null;
}

/** Comparison data when comparing stats with a friend. */
export interface FriendComparison {
  username: string; yourLevel: number; theirLevel: number;
  yourGamesWon: number; theirGamesWon: number;
  yourHighScore: number; theirHighScore: number;
  yourWordsFound: number; theirWordsFound: number;
  yourPlayTime: number; theirPlayTime: number;
}

/** Leaderboard entry for friends-only leaderboard. */
export interface FriendLeaderboardEntry {
  rank: number; username: string; avatar: string; level: number;
  totalScore: number; gamesWon: number; winRate: number;
}

/** Quick summary object returned by `getFriendSummary`. */
export interface FriendSystemSummary {
  totalFriends: number; onlineFriends: number; pendingIncoming: number;
  pendingOutgoing: number; blockedUsers: number; totalMessages: number;
  unreadMessages: number; topFriend: string | null;
}

/** Aggregate statistics about the entire friend network. */
export interface FriendNetworkStats {
  totalFriends: number; averageFriendLevel: number; highestLevelFriend: string;
  totalGamesTogether: number; totalWinsTogether: number;
  averageWinRateTogether: number; mostCommonFavoriteWord: string;
  totalConversations: number; longestConversationUser: string;
  totalInvitesSent: number; totalInvitesAccepted: number; networkAgeDays: number;
}

/** UI card data for displaying a single friend. */
export interface FriendCardData {
  username: string; displayName: string; avatar: string; level: number;
  onlineStatus: OnlineStatus; lastActive: string;
  friendshipLevel: FriendshipLevel; gamesPlayedTogether: number;
  statusBadge: string; statusColor: string;
}

/** Chat preview snippet for recent-chats UI. */
export interface ChatPreview {
  username: string; avatar: string; lastMessage: string;
  timestamp: string; unreadCount: number; onlineStatus: OnlineStatus;
}

/** Friend suggestion based on play style analysis. */
export interface FriendSuggestion {
  username: string; displayName: string; avatar: string;
  level: number; matchScore: number; reasons: string[];
}

/** Mock user record for the search database. */
export interface MockUserRecord {
  username: string; displayName: string; avatar: string; level: number;
  onlineStatus: OnlineStatus; favoriteWords: string[];
  gamesPlayed: number; winRate: number;
}

// ---------------------------------------------------------------------------
// Default / seed data
// ---------------------------------------------------------------------------

const DEFAULT_FRIENDS: Friend[] = [
  { username: "lexicon_lizard", displayName: "Lexicon Lizard", avatar: "🦎", level: 42, onlineStatus: "online", lastActive: new Date().toISOString(), friendshipLevel: "best_friend", gamesPlayedTogether: 187, gamesWonTogether: 94, addedAt: "2024-01-15T10:30:00Z", notes: "Met during the Spring tournament", favoriteWords: ["serendipity", "ephemeral", "cascade"] },
  { username: "word_wizard_99", displayName: "Word Wizard", avatar: "🧙", level: 38, onlineStatus: "in_game", lastActive: new Date(Date.now() - 300_000).toISOString(), friendshipLevel: "rival", gamesPlayedTogether: 124, gamesWonTogether: 58, addedAt: "2024-02-20T14:00:00Z", notes: "Tough competitor in speed mode", favoriteWords: ["quixotic", "juxtapose", "labyrinth"] },
  { username: "snake_charmer", displayName: "Snake Charmer", avatar: "🐍", level: 31, onlineStatus: "away", lastActive: new Date(Date.now() - 1800_000).toISOString(), friendshipLevel: "companion", gamesPlayedTogether: 76, gamesWonTogether: 41, addedAt: "2024-03-05T09:15:00Z", notes: "", favoriteWords: ["enigma", "whimsical", "velocity"] },
  { username: "vowel_viking", displayName: "Vowel Viking", avatar: "⚔️", level: 27, onlineStatus: "offline", lastActive: new Date(Date.now() - 86_400_000).toISOString(), friendshipLevel: "buddy", gamesPlayedTogether: 45, gamesWonTogether: 20, addedAt: "2024-04-12T18:45:00Z", notes: "Prefers classic mode", favoriteWords: ["fortitude", "avalanche", "nostalgia"] },
  { username: "letter_lark", displayName: "Letter Lark", avatar: "🐦", level: 19, onlineStatus: "idle", lastActive: new Date(Date.now() - 3600_000).toISOString(), friendshipLevel: "new_pal", gamesPlayedTogether: 12, gamesWonTogether: 5, addedAt: "2024-06-01T12:00:00Z", notes: "Just started playing competitively", favoriteWords: ["blossom", "drift", "sparkle"] },
];

const DEFAULT_BLOCKED: string[] = [];

const DEFAULT_REQUESTS: FriendRequest[] = [
  { id: "req_001", from: "alpha_anagram", to: "me", status: "pending", direction: "incoming", sentAt: new Date(Date.now() - 7200_000).toISOString(), message: "Hey, I saw you on the leaderboard! Want to be friends?" },
  { id: "req_002", from: "beta_boggle", to: "me", status: "pending", direction: "incoming", sentAt: new Date(Date.now() - 14_400_000).toISOString(), message: "Great game earlier! Add me?" },
  { id: "req_003", from: "me", to: "gamma_glyph", status: "pending", direction: "outgoing", sentAt: new Date(Date.now() - 21_600_000).toISOString(), message: "Would love to practice together!" },
];

const DEFAULT_CONVERSATIONS: Conversation[] = [
  { username: "lexicon_lizard", messages: [
    { id: "msg_001", from: "lexicon_lizard", to: "me", content: "Ready for tonight's tournament?", timestamp: new Date(Date.now() - 600_000).toISOString(), read: true, type: "text" },
    { id: "msg_002", from: "me", to: "lexicon_lizard", content: "Absolutely! I've been practicing speed mode all day.", timestamp: new Date(Date.now() - 500_000).toISOString(), read: true, type: "text" },
    { id: "msg_003", from: "lexicon_lizard", to: "me", content: "Nice! I found a new strategy for 7-letter words. Want me to share?", timestamp: new Date(Date.now() - 400_000).toISOString(), read: false, type: "text" },
  ], lastMessageAt: new Date(Date.now() - 400_000).toISOString(), unreadCount: 1 },
  { username: "word_wizard_99", messages: [
    { id: "msg_004", from: "word_wizard_99", to: "me", content: "gg! That last round was intense 🔥", timestamp: new Date(Date.now() - 3600_000).toISOString(), read: true, type: "text" },
  ], lastMessageAt: new Date(Date.now() - 3600_000).toISOString(), unreadCount: 0 },
  { username: "snake_charmer", messages: [
    { id: "msg_005", from: "snake_charmer", to: "me", content: "Have you tried the new daily challenge? The theme is animals!", timestamp: new Date(Date.now() - 7200_000).toISOString(), read: false, type: "text" },
    { id: "msg_006", from: "snake_charmer", to: "me", content: "I got 94 words! Can you beat that?", timestamp: new Date(Date.now() - 7100_000).toISOString(), read: false, type: "text" },
  ], lastMessageAt: new Date(Date.now() - 7100_000).toISOString(), unreadCount: 2 },
];

const DEFAULT_INVITES: GameInvite[] = [
  { id: "inv_001", from: "me", to: "lexicon_lizard", mode: "pvp", status: "pending", sentAt: new Date(Date.now() - 120_000).toISOString() },
];

const DEFAULT_ACTIVITY: ActivityEntry[] = [
  { id: "act_001", username: "lexicon_lizard", type: "won_game", description: "won a Speed mode match with a score of 12,450", timestamp: new Date(Date.now() - 900_000).toISOString(), metadata: { mode: "speed", score: 12450, wordsFound: 87 } },
  { id: "act_002", username: "word_wizard_99", type: "new_high_score", description: "set a new personal best: 15,200 in Classic mode", timestamp: new Date(Date.now() - 2700_000).toISOString(), metadata: { mode: "classic", previousBest: 14800, newBest: 15200 } },
  { id: "act_003", username: "snake_charmer", type: "unlocked_achievement", description: 'unlocked the "Word Scholar" achievement', timestamp: new Date(Date.now() - 5400_000).toISOString(), metadata: { achievementId: "word_scholar", rarity: "legendary" } },
  { id: "act_004", username: "vowel_viking", type: "level_up", description: "reached level 27", timestamp: new Date(Date.now() - 43_200_000).toISOString(), metadata: { previousLevel: 26, newLevel: 27 } },
  { id: "act_005", username: "letter_lark", type: "completed_daily", description: "completed today's Daily Challenge", timestamp: new Date(Date.now() - 18_000_000).toISOString(), metadata: { challengeDay: 142, score: 8900 } },
  { id: "act_006", username: "lexicon_lizard", type: "purchased_skin", description: 'purchased the "Crystal Serpent" snake skin', timestamp: new Date(Date.now() - 72_000_000).toISOString(), metadata: { skinId: "crystal_serpent", price: 2500 } },
  { id: "act_007", username: "word_wizard_99", type: "played_game", description: "played 3 Challenge mode rounds", timestamp: new Date(Date.now() - 108_000_000).toISOString(), metadata: { mode: "challenge", rounds: 3, bestScore: 9800 } },
];

const DEFAULT_MOCK_USERS: MockUserRecord[] = [
  { username: "alpha_anagram", displayName: "Alpha Anagram", avatar: "🔤", level: 35, onlineStatus: "online", favoriteWords: ["anagram", "palindrome", "synonym"], gamesPlayed: 540, winRate: 0.62 },
  { username: "beta_boggle", displayName: "Beta Boggle", avatar: "🎲", level: 29, onlineStatus: "offline", favoriteWords: ["boggle", "scramble", "puzzle"], gamesPlayed: 312, winRate: 0.55 },
  { username: "gamma_glyph", displayName: "Gamma Glyph", avatar: "🔣", level: 44, onlineStatus: "in_game", favoriteWords: ["hieroglyph", "calligraphy", "typography"], gamesPlayed: 890, winRate: 0.71 },
  { username: "delta_diction", displayName: "Delta Diction", avatar: "📖", level: 22, onlineStatus: "idle", favoriteWords: ["dictionary", "lexicon", "thesaurus"], gamesPlayed: 180, winRate: 0.48 },
  { username: "epsilon_emoji", displayName: "Epsilon Emoji", avatar: "😎", level: 17, onlineStatus: "online", favoriteWords: ["smile", "happy", "joy"], gamesPlayed: 95, winRate: 0.41 },
  { username: "zeta_zigzag", displayName: "Zeta Zigzag", avatar: "⚡", level: 51, onlineStatus: "away", favoriteWords: ["zigzag", "zealous", "zenith"], gamesPlayed: 1200, winRate: 0.68 },
  { username: "eta_enigma", displayName: "Eta Enigma", avatar: "❓", level: 33, onlineStatus: "offline", favoriteWords: ["enigma", "mystery", "riddle"], gamesPlayed: 420, winRate: 0.58 },
  { username: "theta_thesaurus", displayName: "Theta Thesaurus", avatar: "📚", level: 40, onlineStatus: "online", favoriteWords: ["verbose", "eloquent", "articulate"], gamesPlayed: 710, winRate: 0.65 },
  { username: "iota_infinity", displayName: "Iota Infinity", avatar: "♾️", level: 15, onlineStatus: "offline", favoriteWords: ["infinite", "eternal", "boundless"], gamesPlayed: 68, winRate: 0.37 },
  { username: "kappa_kaleidoscope", displayName: "Kappa Kaleidoscope", avatar: "🔮", level: 28, onlineStatus: "idle", favoriteWords: ["kaleidoscope", "prismatic", "chromatic"], gamesPlayed: 290, winRate: 0.53 },
];

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Safely read a JSON value from localStorage, returning a fallback on error. */
function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch { return fallback; }
}

/** Safely write a JSON value to localStorage. Returns true on success. */
function writeJSON<T>(key: string, value: T): boolean {
  try { localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value)); return true; }
  catch { return false; }
}

/** Generate a pseudo-random unique ID string with a given prefix. */
function generateId(prefix: string = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Return the current time as an ISO 8601 string. */
const nowISO = () => new Date().toISOString();

/** Clamp a number between min and max. */
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Calculate a win-rate percentage (one decimal place). */
const calcWinRate = (wins: number, total: number) => (total <= 0 ? 0 : Math.round((wins / total) * 1000) / 10);

/** Determine friendship level based on games played together. */
function friendshipLevelForGames(g: number): FriendshipLevel {
  if (g >= 150) return "best_friend"; if (g >= 80) return "rival";
  if (g >= 40) return "companion"; if (g >= 15) return "buddy"; return "new_pal";
}

/** Return a hex color string based on online status. */
function statusColor(s: OnlineStatus): string {
  return ({ online: "#22c55e", in_game: "#3b82f6", away: "#f59e0b", idle: "#94a3b8", offline: "#6b7280" } as const)[s] ?? "#6b7280";
}

/** Return a badge label based on online status. */
function statusBadge(s: OnlineStatus): string {
  return ({ online: "Online", in_game: "In Game", away: "Away", idle: "Idle", offline: "Offline" } as const)[s] ?? "Unknown";
}

/** Return days elapsed between two ISO date strings. */
function daysBetween(a: string, b: string): number {
  try { return Math.floor(Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 86_400_000); }
  catch { return 0; }
}

/** Fetch current player stats with safe fallbacks. */
function getCurrentPlayerStats() {
  try {
    const raw = localStorage.getItem("ws_player_stats");
    if (raw) { const p = JSON.parse(raw); return { level: p.level ?? 25, gamesWon: p.gamesWon ?? 150, highScore: p.highScore ?? 14200, wordsFound: p.wordsFound ?? 8400, playTimeMinutes: p.playTimeMinutes ?? 3840 }; }
  } catch { /* fall through */ }
  return { level: 25, gamesWon: 150, highScore: 14200, wordsFound: 8400, playTimeMinutes: 3840 };
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * 1. getFriends — Returns the full list of friends with online status,
 * last-active timestamp, level, and avatar. Friends who were "offline"
 * but active within the last 5 min are promoted to "idle".
 *
 * @returns An array of {@link Friend} objects. Empty array when no data.
 */
export function getFriends(): Friend[] {
  try {
    return readJSON<Friend[]>("friends", []).map((f) => {
      if ((f.onlineStatus === "offline" || f.onlineStatus === "idle") && Date.now() - new Date(f.lastActive).getTime() < 300_000) {
        return { ...f, onlineStatus: "idle" as OnlineStatus };
      }
      return f;
    });
  } catch { return []; }
}

/**
 * 2. addFriend — Send a friend request. Returns false if already a
 * friend, blocked, or a pending request exists. An activity entry is
 * recorded on success.
 *
 * @param username - The target user's unique username.
 * @returns `true` if the request was created.
 */
export function addFriend(username: string): boolean {
  try {
    if (!username?.trim()) return false;
    username = username.trim().toLowerCase();
    const friends = readJSON<Friend[]>("friends", []);
    if (friends.some((f) => f.username === username)) return false;
    const blocked = readJSON<string[]>("blocked", []);
    if (blocked.includes(username)) return false;
    const requests = readJSON<FriendRequest[]>("requests", []);
    if (requests.some((r) => r.status === "pending" && ((r.from === "me" && r.to === username) || (r.from === username && r.to === "me")))) return false;
    requests.push({ id: generateId("req"), from: "me", to: username, status: "pending", direction: "outgoing", sentAt: nowISO(), message: "Let's be Word Snake friends!" });
    writeJSON("requests", requests);
    const activity = readJSON<ActivityEntry[]>("activity", []);
    activity.unshift({ id: generateId("act"), username: "me", type: "sent_invite", description: `sent a friend request to ${username}`, timestamp: nowISO(), metadata: { targetUser: username } });
    writeJSON("activity", activity.slice(0, 100));
    return true;
  } catch { return false; }
}

/**
 * 3. removeFriend — Remove a user from the friends list. Also deletes
 * any associated conversation history and pending invites.
 *
 * @param username - The friend's unique username.
 * @returns `true` if the friend was successfully removed.
 */
export function removeFriend(username: string): boolean {
  try {
    if (!username) return false;
    username = username.trim().toLowerCase();
    const friends = readJSON<Friend[]>("friends", []);
    const filtered = friends.filter((f) => f.username !== username);
    if (filtered.length === friends.length) return false;
    writeJSON("friends", filtered);
    writeJSON("conversations", readJSON<Conversation[]>("conversations", []).filter((c) => c.username !== username));
    writeJSON("invites", readJSON<GameInvite[]>("invites", []).filter((i) => i.from !== username && i.to !== username));
    return true;
  } catch { return false; }
}

/**
 * 4. acceptFriend — Accept a pending incoming friend request. The user
 * is added to the friends list using mock-user data for display fields.
 *
 * @param username - The username whose request to accept.
 * @returns `true` if found and accepted.
 */
export function acceptFriend(username: string): boolean {
  try {
    if (!username) return false;
    username = username.trim().toLowerCase();
    const requests = readJSON<FriendRequest[]>("requests", []);
    const req = requests.find((r) => r.from === username && r.to === "me" && r.status === "pending" && r.direction === "incoming");
    if (!req) return false;
    req.status = "accepted";
    writeJSON("requests", requests);
    const friends = readJSON<Friend[]>("friends", []);
    if (!friends.some((f) => f.username === username)) {
      const mu = readJSON<MockUserRecord[]>("mock_users", DEFAULT_MOCK_USERS).find((u) => u.username === username);
      friends.push({ username, displayName: mu?.displayName ?? username, avatar: mu?.avatar ?? "👤", level: mu?.level ?? 1, onlineStatus: mu?.onlineStatus ?? "offline", lastActive: nowISO(), friendshipLevel: "new_pal", gamesPlayedTogether: 0, gamesWonTogether: 0, addedAt: nowISO(), notes: "", favoriteWords: mu?.favoriteWords ?? [] });
      writeJSON("friends", friends);
    }
    return true;
  } catch { return false; }
}

/**
 * 5. rejectFriend — Reject a pending incoming friend request. The
 * record is kept for history with status set to "rejected".
 *
 * @param username - The username whose request to reject.
 * @returns `true` if found and rejected.
 */
export function rejectFriend(username: string): boolean {
  try {
    if (!username) return false;
    const requests = readJSON<FriendRequest[]>("requests", []);
    const req = requests.find((r) => r.from === username.trim().toLowerCase() && r.to === "me" && r.status === "pending" && r.direction === "incoming");
    if (!req) return false;
    req.status = "rejected";
    writeJSON("requests", requests);
    return true;
  } catch { return false; }
}

/**
 * 6. blockUser — Block a user. They are removed from friends and any
 * pending requests from them are auto-rejected.
 *
 * @param username - The username to block.
 * @returns `true` if successfully blocked.
 */
export function blockUser(username: string): boolean {
  try {
    if (!username) return false;
    username = username.trim().toLowerCase();
    const blocked = readJSON<string[]>("blocked", []);
    if (blocked.includes(username)) return false;
    blocked.push(username);
    writeJSON("blocked", blocked);
    removeFriend(username);
    const requests = readJSON<FriendRequest[]>("requests", []);
    requests.forEach((r) => { if (r.from === username && r.status === "pending") r.status = "rejected"; });
    writeJSON("requests", requests);
    return true;
  } catch { return false; }
}

/**
 * 7. unblockUser — Unblock a previously blocked user.
 *
 * @param username - The username to unblock.
 * @returns `true` if successfully unblocked.
 */
export function unblockUser(username: string): boolean {
  try {
    if (!username) return false;
    const blocked = readJSON<string[]>("blocked", []);
    const filtered = blocked.filter((u) => u !== username.trim().toLowerCase());
    if (filtered.length === blocked.length) return false;
    writeJSON("blocked", filtered);
    return true;
  } catch { return false; }
}

/**
 * 8. getBlockedUsers — Returns all currently blocked usernames.
 *
 * @returns An array of blocked username strings.
 */
export function getBlockedUsers(): string[] {
  try { return readJSON<string[]>("blocked", []); } catch { return []; }
}

/**
 * 9. isFriend — Check if a username is on the current friend list.
 *
 * @param username - The username to check.
 * @returns `true` if the user is a confirmed friend.
 */
export function isFriend(username: string): boolean {
  try {
    if (!username) return false;
    return readJSON<Friend[]>("friends", []).some((f) => f.username === username.trim().toLowerCase());
  } catch { return false; }
}

/**
 * 10. getFriendRequests — Returns all pending **incoming** friend
 * requests awaiting the user's action.
 *
 * @returns An array of {@link FriendRequest} objects.
 */
export function getFriendRequests(): FriendRequest[] {
  try {
    return readJSON<FriendRequest[]>("requests", []).filter((r) => r.direction === "incoming" && r.status === "pending");
  } catch { return []; }
}

/**
 * 11. getSentRequests — Returns all pending **outgoing** friend
 * requests sent by the current user.
 *
 * @returns An array of {@link FriendRequest} objects.
 */
export function getSentRequests(): FriendRequest[] {
  try {
    return readJSON<FriendRequest[]>("requests", []).filter((r) => r.direction === "outgoing" && r.status === "pending");
  } catch { return []; }
}

/**
 * 12. searchUsers — Search the mock user database by username or
 * display name (case-insensitive, partial match). Friends and blocked
 * users are excluded.
 *
 * @param query - The search string (min 1 character).
 * @returns Matching {@link MockUserRecord} entries.
 */
export function searchUsers(query: string): MockUserRecord[] {
  try {
    if (!query?.trim()) return [];
    const q = query.trim().toLowerCase();
    const exclude = new Set([...readJSON<Friend[]>("friends", []).map((f) => f.username), ...readJSON<string[]>("blocked", [])]);
    return readJSON<MockUserRecord[]>("mock_users", DEFAULT_MOCK_USERS).filter(
      (u) => !exclude.has(u.username) && (u.username.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q))
    );
  } catch { return []; }
}

/**
 * 13. getOnlineFriends — Returns friends with any non-"offline" status
 * (online, in_game, away, idle).
 *
 * @returns An array of online {@link Friend} objects.
 */
export function getOnlineFriends(): Friend[] {
  try { return readJSON<Friend[]>("friends", []).filter((f) => f.onlineStatus !== "offline"); }
  catch { return []; }
}

/**
 * 14. getFriendActivity — Returns recent activity entries for a friend.
 *
 * @param username - The friend's username.
 * @param limit - Max entries to return (default 10).
 * @returns An array of {@link ActivityEntry} objects.
 */
export function getFriendActivity(username: string, limit: number = 10): ActivityEntry[] {
  try {
    if (!username) return [];
    return readJSON<ActivityEntry[]>("activity", []).filter((a) => a.username === username.trim().toLowerCase()).slice(0, Math.max(1, limit));
  } catch { return []; }
}

/**
 * 15. sendMessage — Send a chat message. Creates a new conversation
 * if one doesn't exist.
 *
 * @param to - The recipient's username.
 * @param content - The message body.
 * @returns `true` if stored successfully.
 */
export function sendMessage(to: string, content: string): boolean {
  try {
    if (!to || !content?.trim()) return false;
    to = to.trim().toLowerCase();
    const conversations = readJSON<Conversation[]>("conversations", []);
    let conv = conversations.find((c) => c.username === to);
    const msg: ChatMessage = { id: generateId("msg"), from: "me", to, content: content.trim(), timestamp: nowISO(), read: false, type: "text" };
    if (!conv) { conversations.push({ username: to, messages: [msg], lastMessageAt: nowISO(), unreadCount: 0 }); }
    else { conv.messages.push(msg); conv.lastMessageAt = nowISO(); }
    writeJSON("conversations", conversations);
    return true;
  } catch { return false; }
}

/**
 * 16. getConversation — Retrieve chat history with a user, newest first.
 *
 * @param username - The other user's username.
 * @param limit - Max messages (default 50).
 * @returns An array of {@link ChatMessage} objects.
 */
export function getConversation(username: string, limit: number = 50): ChatMessage[] {
  try {
    if (!username) return [];
    const conv = readJSON<Conversation[]>("conversations", []).find((c) => c.username === username.trim().toLowerCase());
    return conv ? conv.messages.slice(-Math.max(1, limit)).reverse() : [];
  } catch { return []; }
}

/**
 * 17. getUnreadCount — Total unread messages across all conversations.
 *
 * @returns The sum of all unread counts.
 */
export function getUnreadCount(): number {
  try { return readJSON<Conversation[]>("conversations", []).reduce((s, c) => s + c.unreadCount, 0); }
  catch { return 0; }
}

/**
 * 18. markAsRead — Mark all messages in a conversation as read.
 *
 * @param username - The other user's username.
 * @returns `true` if found and updated.
 */
export function markAsRead(username: string): boolean {
  try {
    if (!username) return false;
    const conversations = readJSON<Conversation[]>("conversations", []);
    const conv = conversations.find((c) => c.username === username.trim().toLowerCase());
    if (!conv) return false;
    conv.unreadCount = 0;
    conv.messages.forEach((m) => { if (m.to === "me") m.read = true; });
    writeJSON("conversations", conversations);
    return true;
  } catch { return false; }
}

/**
 * 19. getRecentChats — Conversations sorted by most recent message.
 *
 * @param limit - Max conversations (default 10).
 * @returns An array of {@link Conversation} objects.
 */
export function getRecentChats(limit: number = 10): Conversation[] {
  try {
    return [...readJSON<Conversation[]>("conversations", [])]
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
      .slice(0, Math.max(1, limit));
  } catch { return []; }
}

/**
 * 20. compareWithFriend — Compare player stats against a friend.
 * Returns level, wins, high score, words found, and play time.
 *
 * @param username - The friend's username.
 * @returns A {@link FriendComparison} or `null`.
 */
export function compareWithFriend(username: string): FriendComparison | null {
  try {
    if (!username) return null;
    const friend = readJSON<Friend[]>("friends", []).find((f) => f.username === username.trim().toLowerCase());
    if (!friend) return null;
    const p = getCurrentPlayerStats();
    return {
      username: friend.username,
      yourLevel: p.level, theirLevel: friend.level,
      yourGamesWon: p.gamesWon, theirGamesWon: friend.gamesWonTogether,
      yourHighScore: p.highScore, theirHighScore: friend.level * 350 + Math.round(Math.random() * 5000),
      yourWordsFound: p.wordsFound, theirWordsFound: friend.gamesPlayedTogether * 45 + friend.level * 20,
      yourPlayTime: p.playTimeMinutes, theirPlayTime: friend.gamesPlayedTogether * 12,
    };
  } catch { return null; }
}

/**
 * 21. getMutualFriends — Mutual friends between the current user and
 * another. Simulated via a hardcoded social graph.
 *
 * @param username - The other user's username.
 * @returns Array of mutual-friend usernames.
 */
export function getMutualFriends(username: string): string[] {
  try {
    if (!username) return [];
    const fn = new Set(readJSON<Friend[]>("friends", []).map((f) => f.username));
    const graph: Record<string, string[]> = {
      lexicon_lizard: ["word_wizard_99", "snake_charmer"], word_wizard_99: ["lexicon_lizard", "vowel_viking"],
      snake_charmer: ["lexicon_lizard", "letter_lark"], vowel_viking: ["word_wizard_99", "letter_lark"],
      letter_lark: ["snake_charmer", "vowel_viking"], gamma_glyph: ["lexicon_lizard", "theta_thesaurus"],
      alpha_anagram: ["beta_boggle", "theta_thesaurus"], zeta_zigzag: ["gamma_glyph", "theta_thesaurus"],
    };
    return (graph[username.trim().toLowerCase()] ?? []).filter((u) => fn.has(u));
  } catch { return []; }
}

/**
 * 22. getFriendLeaderboard — Friends-only leaderboard ranked by
 * estimated total score (level×500 + wins×100 + games×25). Includes
 * the current player in rankings.
 *
 * @returns An array of {@link FriendLeaderboardEntry} objects.
 */
export function getFriendLeaderboard(): FriendLeaderboardEntry[] {
  try {
    const friends = readJSON<Friend[]>("friends", []);
    const p = getCurrentPlayerStats();
    const entries: FriendLeaderboardEntry[] = friends.map((f) => ({
      rank: 0, username: f.username, avatar: f.avatar, level: f.level,
      totalScore: f.level * 500 + f.gamesWonTogether * 100 + f.gamesPlayedTogether * 25,
      gamesWon: f.gamesWonTogether, winRate: calcWinRate(f.gamesWonTogether, f.gamesPlayedTogether),
    }));
    entries.push({ rank: 0, username: "you", avatar: "🎮", level: p.level, totalScore: p.level * 500 + p.gamesWon * 100, gamesWon: p.gamesWon, winRate: 0 });
    entries.sort((a, b) => b.totalScore - a.totalScore);
    entries.forEach((e, i) => { e.rank = i + 1; });
    return entries;
  } catch { return []; }
}

/**
 * 23. inviteToGame — Invite a friend to a specific game mode. If a
 * pending invite already exists, returns its ID instead of duplicating.
 *
 * @param username - The friend's username.
 * @param mode - Game mode (default "classic").
 * @returns The invite ID or `null` on failure.
 */
export function inviteToGame(username: string, mode: GameInvite["mode"] = "classic"): string | null {
  try {
    if (!username) return null;
    username = username.trim().toLowerCase();
    if (!isFriend(username)) return null;
    const invites = readJSON<GameInvite[]>("invites", []);
    const existing = invites.find((i) => i.from === "me" && i.to === username && i.status === "pending");
    if (existing) return existing.id;
    const invite: GameInvite = { id: generateId("inv"), from: "me", to: username, mode, status: "pending", sentAt: nowISO() };
    invites.push(invite);
    writeJSON("invites", invites);
    return invite.id;
  } catch { return null; }
}

/**
 * 24. getInviteStatus — All pending game invites (sent and received).
 *
 * @returns An array of pending {@link GameInvite} objects.
 */
export function getInviteStatus(): GameInvite[] {
  try { return readJSON<GameInvite[]>("invites", []).filter((i) => i.status === "pending"); }
  catch { return []; }
}

/**
 * 25. getFriendSummary — Quick numeric summary of the friend system:
 * total friends, online count, pending requests, blocked users, message
 * totals, and top friend identity.
 *
 * @returns A {@link FriendSystemSummary} object.
 */
export function getFriendSummary(): FriendSystemSummary {
  try {
    const friends = readJSON<Friend[]>("friends", []);
    const requests = readJSON<FriendRequest[]>("requests", []);
    const convos = readJSON<Conversation[]>("conversations", []);
    const onlineCount = friends.filter((f) => f.onlineStatus !== "offline").length;
    const pi = requests.filter((r) => r.direction === "incoming" && r.status === "pending").length;
    const po = requests.filter((r) => r.direction === "outgoing" && r.status === "pending").length;
    const unread = convos.reduce((s, c) => s + c.unreadCount, 0);
    let topFriend: string | null = null;
    if (friends.length > 0) { topFriend = [...friends].sort((a, b) => b.gamesPlayedTogether - a.gamesPlayedTogether)[0].username; }
    return { totalFriends: friends.length, onlineFriends: onlineCount, pendingIncoming: pi, pendingOutgoing: po, blockedUsers: readJSON<string[]>("blocked", []).length, totalMessages: convos.reduce((s, c) => s + c.messages.length, 0), unreadMessages: unread, topFriend };
  } catch {
    return { totalFriends: 0, onlineFriends: 0, pendingIncoming: 0, pendingOutgoing: 0, blockedUsers: 0, totalMessages: 0, unreadMessages: 0, topFriend: null };
  }
}

/**
 * 26. getTopFriend — Username of the friend with the most games
 * played together. Useful for a "best buddy" badge.
 *
 * @param _username - Optional unused param for API consistency.
 * @returns The top friend's username or `null`.
 */
export function getTopFriend(_username?: string): string | null {
  try {
    const friends = readJSON<Friend[]>("friends", []);
    return friends.length === 0 ? null : [...friends].sort((a, b) => b.gamesPlayedTogether - a.gamesPlayedTogether)[0].username;
  } catch { return null; }
}

/**
 * 27. generateMockUsers — Generate random mock users and merge into the
 * database. Usernames are adjective + animal noun combinations. Existing
 * entries and duplicates are preserved/skipped.
 *
 * @param count - New users to generate (default 5, max 50).
 * @returns Total mock users now in the database.
 */
export function generateMockUsers(count: number = 5): number {
  try {
    count = clamp(Math.round(count), 1, 50);
    const existing = readJSON<MockUserRecord[]>("mock_users", DEFAULT_MOCK_USERS);
    const names = new Set(existing.map((u) => u.username));
    const adjs = ["brave","clever","daring","eager","fierce","gentle","happy","jolly","keen","lively","mighty","noble","proud","quick","rapid","smart","swift","tidy","vivid","witty","bold","calm","dark","epic"];
    const nouns = ["adder","cobra","mamba","python","viper","raven","falcon","tiger","panther","dragon","phoenix","griffin","wizard","knight","scholar","sage","pioneer","seeker","hunter","strider","wanderer","explorer","champion","hero"];
    const avs = ["🐲","🐉","🦅","🐺","🦁","🐯","🦊","🐻","🦉","🐼","🦄","🐳","🦈","🐸","🦎","🐢","🐒","🦋","🐝","🐌"];
    const words = ["serendipity","ephemeral","cascade","enigma","whimsical","labyrinth","velocity","fortitude","avalanche","nostalgia","radiance","twilight","mystique","horizon","symphony","paradox","zenith","vortex","cipher","prism"];
    const sts: OnlineStatus[] = ["online","offline","in_game","away","idle"];
    let created = 0, attempts = 0;
    while (created < count && attempts < count * 5) {
      attempts++;
      const a = adjs[Math.floor(Math.random() * adjs.length)];
      const n = nouns[Math.floor(Math.random() * nouns.length)];
      const uname = `${a}_${n}`;
      if (names.has(uname)) continue;
      existing.push({
        username: uname, displayName: `${a[0].toUpperCase()}${a.slice(1)} ${n[0].toUpperCase()}${n.slice(1)}`,
        avatar: avs[Math.floor(Math.random() * avs.length)], level: Math.floor(Math.random() * 55) + 1,
        onlineStatus: sts[Math.floor(Math.random() * sts.length)],
        favoriteWords: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => words[Math.floor(Math.random() * words.length)]),
        gamesPlayed: Math.floor(Math.random() * 1500) + 10, winRate: Math.round((Math.random() * 0.5 + 0.25) * 100) / 100,
      });
      names.add(uname); created++;
    }
    writeJSON("mock_users", existing);
    return existing.length;
  } catch { return readJSON<MockUserRecord[]>("mock_users", DEFAULT_MOCK_USERS).length; }
}

/**
 * 28. getFriendSuggestion — Suggest friends based on play-style
 * similarity (level proximity, shared favorite words, activity).
 * Each candidate gets a 0–100 match score with human-readable reasons.
 *
 * @param limit - Max suggestions (default 3, max 10).
 * @returns An array of {@link FriendSuggestion} objects sorted by score.
 */
export function getFriendSuggestion(limit: number = 3): FriendSuggestion[] {
  try {
    limit = clamp(limit, 1, 10);
    const exclude = new Set([...readJSON<Friend[]>("friends", []).map((f) => f.username), ...readJSON<string[]>("blocked", [])]);
    const mockUsers = readJSON<MockUserRecord[]>("mock_users", DEFAULT_MOCK_USERS);
    const pLevel = getCurrentPlayerStats().level;
    const pWords: string[] = ["serendipity", "cascade", "enigma", "velocity"];
    return mockUsers.filter((u) => !exclude.has(u.username)).map((u) => {
      const reasons: string[] = []; let score = 50;
      const ld = Math.abs(u.level - pLevel);
      if (ld <= 5) { score += 20; reasons.push("Similar skill level"); } else if (ld <= 10) { score += 10; }
      const shared = u.favoriteWords.filter((w) => pWords.some((pw) => pw === w.toLowerCase()));
      if (shared.length) { score += shared.length * 8; reasons.push(`Shares interest in: ${shared.join(", ")}`); }
      if (u.onlineStatus === "online" || u.onlineStatus === "in_game") { score += 5; reasons.push("Currently active"); }
      if (u.gamesPlayed > 500) { score += 5; reasons.push("Experienced player"); }
      return { username: u.username, displayName: u.displayName, avatar: u.avatar, level: u.level, matchScore: clamp(score, 0, 100), reasons };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
  } catch { return []; }
}

/**
 * 29. getFriendsOverview — UI summary-card data for the friends panel:
 * total friends, online count, pending requests, blocked count, and
 * the top friend by games-played-together.
 *
 * @returns A {@link FriendSummaryCard} object.
 */
export function getFriendsOverview(): FriendSummaryCard {
  try {
    const friends = readJSON<Friend[]>("friends", []);
    const pending = readJSON<FriendRequest[]>("requests", []).filter((r) => r.status === "pending").length;
    const onlineCount = friends.filter((f) => f.onlineStatus !== "offline").length;
    let topFriend: string | null = null;
    if (friends.length > 0) { topFriend = [...friends].sort((a, b) => b.gamesPlayedTogether - a.gamesPlayedTogether)[0].username; }
    return { totalFriends: friends.length, onlineCount, pendingRequests: pending, blockedCount: readJSON<string[]>("blocked", []).length, recentActivityCount: Math.min(readJSON<ActivityEntry[]>("activity", []).length, 20), topFriend };
  } catch {
    return { totalFriends: 0, onlineCount: 0, pendingRequests: 0, blockedCount: 0, recentActivityCount: 0, topFriend: null };
  }
}

/**
 * 30. getFriendCard — Build a UI card for a single friend with
 * computed status badge text and color hex.
 *
 * @param username - The friend's username.
 * @returns A {@link FriendCardData} object, or `null` if not found.
 */
export function getFriendCard(username: string): FriendCardData | null {
  try {
    if (!username) return null;
    const f = readJSON<Friend[]>("friends", []).find((fr) => fr.username === username.trim().toLowerCase());
    if (!f) return null;
    return { username: f.username, displayName: f.displayName, avatar: f.avatar, level: f.level, onlineStatus: f.onlineStatus, lastActive: f.lastActive, friendshipLevel: f.friendshipLevel, gamesPlayedTogether: f.gamesPlayedTogether, statusBadge: statusBadge(f.onlineStatus), statusColor: statusColor(f.onlineStatus) };
  } catch { return null; }
}

/**
 * 31. getChatPreview — Short preview snippet for a conversation.
 * Last message truncated to 60 chars, with avatar and online status
 * resolved from the friends list.
 *
 * @param username - The other user's username.
 * @returns A {@link ChatPreview} object, or `null`.
 */
export function getChatPreview(username: string): ChatPreview | null {
  try {
    if (!username) return null;
    const conv = readJSON<Conversation[]>("conversations", []).find((c) => c.username === username.trim().toLowerCase());
    if (!conv?.messages.length) return null;
    const last = conv.messages[conv.messages.length - 1];
    const friend = readJSON<Friend[]>("friends", []).find((f) => f.username === username.trim().toLowerCase());
    return { username: username.trim().toLowerCase(), avatar: friend?.avatar ?? "👤", lastMessage: last.content.length > 60 ? last.content.slice(0, 57) + "..." : last.content, timestamp: last.timestamp, unreadCount: conv.unreadCount, onlineStatus: friend?.onlineStatus ?? "offline" };
  } catch { return null; }
}

/**
 * 32. getActivityFeed — Combined activity feed from all friends and
 * the current user, most-recent-first. Only entries belonging to
 * confirmed friends or "me" are included.
 *
 * @param limit - Max entries (default 20, max 100).
 * @returns An array of {@link ActivityEntry} objects.
 */
export function getActivityFeed(limit: number = 20): ActivityEntry[] {
  try {
    limit = clamp(limit, 1, 100);
    const fn = new Set(readJSON<Friend[]>("friends", []).map((f) => f.username));
    return readJSON<ActivityEntry[]>("activity", []).filter((a) => a.username === "me" || fn.has(a.username)).slice(0, limit);
  } catch { return []; }
}

/**
 * 33. getFriendStats — Aggregate friend-network statistics: average
 * level, highest-level friend, total games/wins together, average win
 * rate, most common favorite word, conversation counts, invite stats,
 * and network age in days.
 *
 * @returns A {@link FriendNetworkStats} object.
 */
export function getFriendStats(): FriendNetworkStats {
  try {
    const friends = readJSON<Friend[]>("friends", []);
    const convos = readJSON<Conversation[]>("conversations", []);
    const invites = readJSON<GameInvite[]>("invites", []);
    const empty: FriendNetworkStats = { totalFriends: 0, averageFriendLevel: 0, highestLevelFriend: "", totalGamesTogether: 0, totalWinsTogether: 0, averageWinRateTogether: 0, mostCommonFavoriteWord: "", totalConversations: 0, longestConversationUser: "", totalInvitesSent: 0, totalInvitesAccepted: 0, networkAgeDays: 0 };
    if (!friends.length) return empty;
    const avgLvl = friends.reduce((s, f) => s + f.level, 0) / friends.length;
    const highest = [...friends].sort((a, b) => b.level - a.level)[0];
    const tGames = friends.reduce((s, f) => s + f.gamesPlayedTogether, 0);
    const tWins = friends.reduce((s, f) => s + f.gamesWonTogether, 0);
    const wf: Record<string, number> = {};
    friends.forEach((f) => f.favoriteWords.forEach((w) => { const lw = w.toLowerCase(); wf[lw] = (wf[lw] ?? 0) + 1; }));
    const topWord = Object.entries(wf).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
    let longUser = "", longCount = 0;
    convos.forEach((c) => { if (c.messages.length > longCount) { longCount = c.messages.length; longUser = c.username; } });
    const sent = invites.filter((i) => i.from === "me").length;
    const accepted = invites.filter((i) => i.from === "me" && i.status === "accepted").length;
    const oldest = [...friends].sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime())[0];
    return { totalFriends: friends.length, averageFriendLevel: Math.round(avgLvl * 10) / 10, highestLevelFriend: highest.username, totalGamesTogether: tGames, totalWinsTogether: tWins, averageWinRateTogether: calcWinRate(tWins, tGames), mostCommonFavoriteWord: topWord, totalConversations: convos.length, longestConversationUser: longUser, totalInvitesSent: sent, totalInvitesAccepted: accepted, networkAgeDays: oldest ? daysBetween(oldest.addedAt, nowISO()) : 0 };
  } catch {
    return { totalFriends: 0, averageFriendLevel: 0, highestLevelFriend: "", totalGamesTogether: 0, totalWinsTogether: 0, averageWinRateTogether: 0, mostCommonFavoriteWord: "", totalConversations: 0, longestConversationUser: "", totalInvitesSent: 0, totalInvitesAccepted: 0, networkAgeDays: 0 };
  }
}

// ---------------------------------------------------------------------------
// Initialization helpers
// ---------------------------------------------------------------------------

/**
 * initializeFriendSystemDefaults — Seed localStorage with default data
 * (friends, blocked, requests, conversations, invites, activity, mock
 * users). Safe to call repeatedly — existing data is never overwritten.
 *
 * @returns `true` if defaults were written (first-time init).
 */
export function initializeFriendSystemDefaults(): boolean {
  try {
    if (localStorage.getItem(`${STORAGE_PREFIX}_initialized`)) return false;
    writeJSON("friends", DEFAULT_FRIENDS);
    writeJSON("blocked", DEFAULT_BLOCKED);
    writeJSON("requests", DEFAULT_REQUESTS);
    writeJSON("conversations", DEFAULT_CONVERSATIONS);
    writeJSON("invites", DEFAULT_INVITES);
    writeJSON("activity", DEFAULT_ACTIVITY);
    writeJSON("mock_users", DEFAULT_MOCK_USERS);
    localStorage.setItem(`${STORAGE_PREFIX}_initialized`, "true");
    return true;
  } catch { return false; }
}

/**
 * resetFriendSystem — Clear all `ws_friends_` data from localStorage.
 * Useful for testing or resetting the system.
 *
 * @returns `true` if any keys were removed.
 */
export function resetFriendSystem(): boolean {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k?.startsWith(STORAGE_PREFIX)) keys.push(k); }
    keys.forEach((k) => localStorage.removeItem(k));
    return keys.length > 0;
  } catch { return false; }
}
