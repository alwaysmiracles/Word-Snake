/**
 * tournament-bracket-wire.ts
 * Tournament bracket & competitive mode wire for Word Snake.
 * Storage key: ws_tournament_bracket
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type TournamentStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';
export type MatchStatus = 'pending' | 'in_progress' | 'completed' | 'bye';
export type GameMode = 'classic' | 'speed' | 'blitz' | 'marathon' | 'survival';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type QuickMatchState = 'idle' | 'searching' | 'found' | 'playing';

export interface TournamentConfig {
  name: string;
  description?: string;
  maxPlayers: 8 | 16 | 32;
  gameMode: GameMode;
  difficulty: Difficulty;
  startTime: number;
  entryFee: number;
  prizePool: number;
  status?: TournamentStatus;
}

export interface Tournament {
  id: string; name: string; description: string;
  maxPlayers: 8 | 16 | 32; gameMode: GameMode; difficulty: Difficulty;
  startTime: number; entryFee: number; prizePool: number;
  status: TournamentStatus; createdAt: number;
  participants: TournamentParticipant[]; bracket: BracketMatch[];
  rounds: number; winnerId: string | null; finalStandings: StandingsEntry[];
}

export interface TournamentParticipant {
  id: string; name: string; eloRating: number; joinedAt: number; seed: number;
}

export interface BracketMatch {
  id: string; tournamentId: string; round: number; position: number;
  player1Id: string | null; player2Id: string | null;
  player1Name: string | null; player2Name: string | null;
  player1Score: number; player2Score: number;
  winnerId: string | null; status: MatchStatus;
  nextMatchId: string | null; events: MatchEvent[];
  prediction: MatchPrediction | null; startedAt: number | null; completedAt: number | null;
}

export interface MatchEvent {
  type: 'round_start' | 'word_scored' | 'powerup_used' | 'time_up' | 'match_end' | 'timeout';
  playerId: string | null; detail: string; timestamp: number; score: number;
}

export interface MatchPrediction {
  player1WinChance: number; player2WinChance: number; confidence: number;
}

export interface StandingsEntry {
  playerId: string; playerName: string; placement: number; prize: number; eloChange: number;
}

export interface RewardClaim {
  tournamentId: string; tournamentName: string; playerId: string;
  amount: number; placement: number; claimedAt: number;
}

export interface EloRecord {
  elo: number; timestamp: number; tournamentId: string; change: number;
}

export interface PlayerRanking {
  playerName: string; elo: number; wins: number; losses: number;
  winRate: number; bestStreak: number; currentStreak: number; earnings: number;
}

export interface QuickMatchData {
  state: QuickMatchState; mode: GameMode | null;
  tournamentId: string | null; startedSearchingAt: number | null; matchedAt: number | null;
}

export interface BracketCard {
  tournamentId: string; tournamentName: string; rounds: number;
  matchesByRound: Record<number, BracketMatch[]>; status: TournamentStatus;
  currentRound: number; totalParticipants: number;
}

export interface MatchCard {
  id: string; round: number;
  player1: { name: string | null; score: number } | null;
  player2: { name: string | null; score: number } | null;
  status: MatchStatus; winnerName: string | null;
  prediction: MatchPrediction | null; startedAt: number | null; completedAt: number | null;
}

export interface TournamentOverview {
  activeCount: number; completedCount: number; totalParticipants: number;
  totalPrizePool: number; recentWinners: StandingsEntry[];
  upcomingTournaments: Tournament[]; myActiveCount: number;
}

export interface PlayerStats {
  tournamentsPlayed: number; tournamentsWon: number; totalMatches: number;
  matchesWon: number; winRate: number; earnings: number; elo: number;
  bestStreak: number; avgScore: number; favoriteMode: GameMode | null;
}

export interface RecentResult {
  tournamentId: string; tournamentName: string; placement: number;
  prize: number; status: TournamentStatus; completedAt: number;
}

// ── Storage helpers ────────────────────────────────────────────────────────

const KEY = 'ws_tournament_bracket';
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

interface Store {
  tournaments: Record<string, Tournament>;
  rewards: RewardClaim[];
  eloHistory: EloRecord[];
  quickMatch: QuickMatchData;
  currentPlayer: string | null;
}

const defaultStore = (): Store => ({
  tournaments: {},
  rewards: [],
  eloHistory: [],
  quickMatch: { state: 'idle', mode: null, tournamentId: null, startedSearchingAt: null, matchedAt: null },
  currentPlayer: null,
});

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaultStore(), ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultStore();
}

function save(d: Store): void {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* quota */ }
}

function me(): string {
  const d = load();
  if (!d.currentPlayer) { d.currentPlayer = `player_${uid()}`; save(d); }
  return d.currentPlayer!;
}

function findMatch(data: Store, matchId: string): BracketMatch | null {
  for (const t of Object.values(data.tournaments)) {
    const m = t.bracket.find((b) => b.id === matchId);
    if (m) return m;
  }
  return null;
}

function makeTournament(config: TournamentConfig): Tournament {
  return {
    id: `t_${uid()}`, name: config.name, description: config.description ?? '',
    maxPlayers: config.maxPlayers, gameMode: config.gameMode, difficulty: config.difficulty,
    startTime: config.startTime, entryFee: config.entryFee, prizePool: config.prizePool,
    status: config.status ?? 'waiting', createdAt: Date.now(),
    participants: [], bracket: [], rounds: 0, winnerId: null, finalStandings: [],
  };
}

function eloPrediction(p1: TournamentParticipant | undefined, p2: TournamentParticipant | undefined): MatchPrediction {
  const e1 = p1?.eloRating ?? 1200, e2 = p2?.eloRating ?? 1200;
  const exp = 1 / (1 + 10 ** ((e2 - e1) / 400));
  return {
    player1WinChance: Math.round(exp * 100),
    player2WinChance: Math.round((1 - exp) * 100),
    confidence: Math.min(Math.abs(e1 - e2) / 800, 1),
  };
}

function seededOrder(n: number): number[] {
  const rounds = Math.log2(n);
  let order = [1, 2];
  for (let r = 1; r < rounds; r++) {
    const next: number[] = [];
    const s = 2 ** (r + 1) + 1;
    for (const v of order) { next.push(v, s - v); }
    order = next;
  }
  return order;
}

function slotRound(slot: number, first: number, total: number): number {
  let off = 0;
  for (let r = 1; r <= total; r++) {
    const cnt = first / 2 ** (r - 1);
    if (slot < off + cnt) return r;
    off += cnt;
  }
  return total;
}

function slotOffset(round: number, first: number): number {
  let off = 0;
  for (let r = 1; r < round; r++) off += first / 2 ** (r - 1);
  return off;
}

function prizeDist(max: number, pool: number): Record<number, number> {
  const pct: Record<number, number[]> = {
    8: [.5, .3, .15, .05],
    16: [.4, .25, .15, .1, .05, .03, .02],
    32: [.35, .2, .12, .08, .06, .05, .04, .04, .03, .03],
  };
  const p = pct[max] ?? pct[8];
  const r: Record<number, number> = {};
  p.forEach((v, i) => (r[i + 1] = Math.round(pool * v)));
  return r;
}

// ── 1. Tournament Creation ────────────────────────────────────────────────

export function createTournament(config: TournamentConfig): Tournament | null {
  try {
    const data = load();
    const t = makeTournament(config);
    data.tournaments[t.id] = t;
    save(data);
    return t;
  } catch { return null; }
}

export function getTournament(id: string): Tournament | null {
  try { return load().tournaments[id] ?? null; } catch { return null; }
}

export function getActiveTournaments(): Tournament[] {
  try {
    return Object.values(load().tournaments).filter(
      (t) => t.status === 'waiting' || t.status === 'in_progress',
    );
  } catch { return []; }
}

export function getMyTournaments(): Tournament[] {
  try {
    const pid = me();
    return Object.values(load().tournaments).filter((t) =>
      t.participants.some((p) => p.id === pid),
    );
  } catch { return []; }
}

export function cancelTournament(id: string): boolean {
  try {
    const data = load();
    const t = data.tournaments[id];
    if (!t || t.status !== 'waiting') return false;
    t.status = 'cancelled';
    save(data);
    return true;
  } catch { return false; }
}

// ── 2. Bracket Generation ────────────────────────────────────────────────

export function generateBracket(tournamentId: string): boolean {
  try {
    const data = load();
    const t = data.tournaments[tournamentId];
    if (!t || t.status !== 'waiting') return false;

    const n = t.maxPlayers;
    const rounds = Math.log2(n);
    t.rounds = rounds;

    const sorted = [...t.participants].sort((a, b) => b.eloRating - a.eloRating);
    sorted.forEach((p, i) => (p.seed = i + 1));
    const seeds = seededOrder(n);
    const first = n / 2;
    const matches: BracketMatch[] = [];

    for (let i = 0; i < n - 1; i++) {
      const r = slotRound(i, first, rounds);
      const pos = i - slotOffset(r, first);
      const mid = `m_${tournamentId}_r${r}_p${pos}`;
      const nid = r < rounds ? `m_${tournamentId}_r${r + 1}_p${Math.floor(pos / 2)}` : null;
      matches.push({
        id: mid, tournamentId, round: r, position: pos,
        player1Id: null, player2Id: null, player1Name: null, player2Name: null,
        player1Score: 0, player2Score: 0, winnerId: null, status: 'pending',
        nextMatchId: nid, events: [], prediction: null, startedAt: null, completedAt: null,
      });
    }

    for (let i = 0; i < first; i++) {
      const m = matches[i];
      if (!m) continue;
      const assign = (seed: number, slot: 1 | 2) => {
        const p = sorted.find((x) => x.seed === seed);
        if (p) {
          if (slot === 1) { m.player1Id = p.id; m.player1Name = p.name; }
          else { m.player2Id = p.id; m.player2Name = p.name; }
        } else if (slot === 2 && m.player1Id) {
          m.status = 'bye'; m.winnerId = m.player1Id; m.completedAt = Date.now();
        }
      };
      assign(seeds[i * 2], 1);
      assign(seeds[i * 2 + 1], 2);
      if (m.player1Id && m.player2Id)
        m.prediction = eloPrediction(sorted.find((p) => p.id === m.player1Id), sorted.find((p) => p.id === m.player2Id));
    }

    t.bracket = matches;
    t.status = 'in_progress';
    save(data);
    return true;
  } catch { return false; }
}

export function getBracket(tournamentId: string): BracketMatch[] {
  try { return load().tournaments[tournamentId]?.bracket ?? []; } catch { return []; }
}

export function getRound(tournamentId: string, roundNum: number): BracketMatch[] {
  try {
    const t = load().tournaments[tournamentId];
    return t ? t.bracket.filter((m) => m.round === roundNum) : [];
  } catch { return []; }
}

export function getTotalRounds(tournamentId: string): number {
  try { return load().tournaments[tournamentId]?.rounds ?? 0; } catch { return 0; }
}

export function getMatch(matchId: string): BracketMatch | null {
  try { return findMatch(load(), matchId); } catch { return null; }
}

export function getUpcomingMatch(userId: string): BracketMatch | null {
  try {
    for (const t of Object.values(load().tournaments)) {
      if (t.status !== 'in_progress') continue;
      const m = t.bracket.find(
        (m) => m.status === 'pending' && (m.player1Id === userId || m.player2Id === userId),
      );
      if (m) return m;
    }
    return null;
  } catch { return null; }
}

export function getMatchPredictions(matchId: string): MatchPrediction | null {
  try {
    const m = getMatch(matchId);
    if (!m) return null;
    if (m.prediction) return m.prediction;
    const t = load().tournaments[m.tournamentId];
    if (!t) return null;
    const p1 = t.participants.find((p) => p.id === m.player1Id);
    const p2 = t.participants.find((p) => p.id === m.player2Id);
    return p1 && p2 ? eloPrediction(p1, p2) : null;
  } catch { return null; }
}

// ── 3. Match Management ──────────────────────────────────────────────────

export function reportMatchResult(
  matchId: string, winnerId: string, scores: { player1Score?: number; player2Score?: number },
): boolean {
  try {
    const data = load();
    const m = findMatch(data, matchId);
    if (!m || m.status === 'completed' || m.status === 'bye') return false;
    m.status = 'completed';
    m.winnerId = winnerId;
    m.player1Score = scores.player1Score ?? m.player1Score;
    m.player2Score = scores.player2Score ?? m.player2Score;
    m.completedAt = Date.now();
    m.events.push({ type: 'match_end', playerId: winnerId, detail: `${winnerId} wins`, timestamp: Date.now(), score: 0 });
    save(data);
    return true;
  } catch { return false; }
}

export function advanceBracket(tournamentId: string): boolean {
  try {
    const data = load();
    const t = data.tournaments[tournamentId];
    if (!t || t.status !== 'in_progress') return false;
    let advanced = false;

    for (let r = 1; r < t.rounds; r++) {
      for (const m of t.bracket.filter((m) => m.round === r)) {
        if (m.status !== 'completed' && m.status !== 'bye' || !m.nextMatchId || !m.winnerId) continue;
        const nx = t.bracket.find((x) => x.id === m.nextMatchId);
        if (!nx || nx.round !== r + 1) continue;
        const wName = m.player1Id === m.winnerId ? m.player1Name : m.player2Name;
        if (!nx.player1Id) { nx.player1Id = m.winnerId; nx.player1Name = wName; }
        else if (!nx.player2Id) { nx.player2Id = m.winnerId; nx.player2Name = wName; }
        if (nx.player1Id && nx.player2Id) {
          nx.prediction = eloPrediction(
            t.participants.find((p) => p.id === nx.player1Id),
            t.participants.find((p) => p.id === nx.player2Id),
          );
        }
        advanced = true;
      }
    }

    const final = t.bracket.find((m) => m.round === t.rounds);
    if (final?.status === 'completed') {
      t.status = 'completed';
      t.winnerId = final.winnerId;
      t.finalStandings = buildStandings(t);
      const recordElo = (pid: string | null, delta: number) => {
        const p = t.participants.find((x) => x.id === pid);
        if (p) { p.eloRating += delta; data.eloHistory.push({ elo: p.eloRating, timestamp: Date.now(), tournamentId: t.id, change: delta }); }
      };
      recordElo(final.winnerId, 32);
      const loser = final.player1Id === final.winnerId ? final.player2Id : final.player1Id;
      recordElo(loser, 16);
    }

    save(data);
    return advanced;
  } catch { return false; }
}

function buildStandings(t: Tournament): StandingsEntry[] {
  const out: StandingsEntry[] = [];
  const pd = prizeDist(t.maxPlayers, t.prizePool);
  const add = (pid: string | null, place: number, elo: number) => {
    if (!pid) return;
    const p = t.participants.find((x) => x.id === pid);
    out.push({ playerId: pid, playerName: p?.name ?? '?', placement: place, prize: pd[place] ?? 0, eloChange: elo });
  };

  if (t.winnerId) add(t.winnerId, 1, 32);
  const final = t.bracket.find((m) => m.round === t.rounds);
  if (final) add(final.player1Id === final.winnerId ? final.player2Id : final.player1Id, 2, 16);

  if (t.rounds >= 3) {
    for (const s of t.bracket.filter((m) => m.round === t.rounds - 1)) {
      if (s.status !== 'completed' && s.status !== 'bye') continue;
      const lid = s.player1Id === s.winnerId ? s.player2Id : s.player1Id;
      if (lid && !out.some((x) => x.playerId === lid)) { add(lid, 3, 8); break; }
    }
  }

  const placed = new Set(out.map((s) => s.playerId));
  let place = out.length + 1;
  for (let r = t.rounds - 2; r >= 1; r--) {
    for (const m of t.bracket.filter((m) => m.round === r)) {
      const lid = m.player1Id === m.winnerId ? m.player2Id : m.player1Id;
      if (lid && !placed.has(lid)) { placed.add(lid); add(lid, place++, Math.max(0, 4 - place)); }
    }
  }
  return out;
}

export function getMatchHistory(matchId: string): MatchEvent[] {
  try { return getMatch(matchId)?.events ?? []; } catch { return []; }
}

export function getTournamentStandings(tournamentId: string): StandingsEntry[] {
  try {
    const t = load().tournaments[tournamentId];
    if (!t) return [];
    if (t.finalStandings.length > 0) return t.finalStandings;

    const active: string[] = [], eliminated: string[] = [];
    for (const m of t.bracket) {
      if (m.status !== 'completed' && m.status !== 'bye') continue;
      if (m.winnerId && !active.includes(m.winnerId)) active.push(m.winnerId);
      const lid = m.player1Id === m.winnerId ? m.player2Id : m.player1Id;
      if (lid && !eliminated.includes(lid)) eliminated.push(lid);
    }

    const live: StandingsEntry[] = [];
    for (const pid of active) {
      const p = t.participants.find((x) => x.id === pid);
      live.push({ playerId: pid, playerName: p?.name ?? '?', placement: 0, prize: 0, eloChange: 0 });
    }
    for (const pid of eliminated) {
      const p = t.participants.find((x) => x.id === pid);
      live.push({ playerId: pid, playerName: p?.name ?? '?', placement: live.length + 1, prize: 0, eloChange: 0 });
    }
    return live;
  } catch { return []; }
}

// ── 4. Tournament Participation ──────────────────────────────────────────

export function joinTournament(tournamentId: string, playerName: string): boolean {
  try {
    const data = load();
    const t = data.tournaments[tournamentId];
    if (!t || t.status !== 'waiting' || t.participants.length >= t.maxPlayers) return false;
    const pid = me();
    if (t.participants.some((p) => p.id === pid)) return false;
    const elo = data.eloHistory.length ? data.eloHistory[data.eloHistory.length - 1].elo : 1200;
    t.participants.push({ id: pid, name: playerName, eloRating: elo, joinedAt: Date.now(), seed: 0 });
    save(data);
    return true;
  } catch { return false; }
}

export function leaveTournament(tournamentId: string): boolean {
  try {
    const data = load();
    const t = data.tournaments[tournamentId];
    if (!t || t.status !== 'waiting') return false;
    const idx = t.participants.findIndex((p) => p.id === me());
    if (idx === -1) return false;
    t.participants.splice(idx, 1);
    save(data);
    return true;
  } catch { return false; }
}

export function getParticipants(tournamentId: string): TournamentParticipant[] {
  try { return load().tournaments[tournamentId]?.participants ?? []; } catch { return []; }
}

export function getMyMatchups(tournamentId: string): BracketMatch[] {
  try {
    const pid = me();
    const t = load().tournaments[tournamentId];
    return t ? t.bracket.filter((m) => m.player1Id === pid || m.player2Id === pid) : [];
  } catch { return []; }
}

// ── 5. Leaderboard & Rankings ────────────────────────────────────────────

interface Accum { name: string; elo: number; w: number; l: number; bs: number; cs: number; earn: number; }

export function getTournamentLeaderboard(): PlayerRanking[] {
  try {
    const data = load();
    const completed = Object.values(data.tournaments).filter((t) => t.status === 'completed');
    const map = new Map<string, Accum>();

    const get = (pid: string, name: string, elo: number): Accum => {
      let a = map.get(pid);
      if (!a) { a = { name, elo, w: 0, l: 0, bs: 0, cs: 0, earn: 0 }; map.set(pid, a); }
      return a;
    };

    for (const t of completed) {
      const placed = new Set<string>();
      for (const s of t.finalStandings) {
        placed.add(s.playerId);
        const a = get(s.playerId, s.playerName, t.participants.find((p) => p.id === s.playerId)?.eloRating ?? 1200);
        a.earn += s.prize;
        if (s.placement === 1) { a.w++; a.cs++; a.bs = Math.max(a.bs, a.cs); }
        else { a.l++; a.cs = 0; }
      }
      for (const p of t.participants) {
        if (!placed.has(p.id)) { const a = get(p.id, p.name, p.eloRating); a.l++; a.cs = 0; }
      }
    }

    return Array.from(map.values()).map((a) => ({
      playerName: a.name, elo: a.elo, wins: a.w, losses: a.l,
      winRate: a.w + a.l > 0 ? a.w / (a.w + a.l) : 0,
      bestStreak: a.bs, currentStreak: a.cs, earnings: a.earn,
    })).sort((a, b) => b.elo - a.elo);
  } catch { return []; }
}

export function getPlayerRanking(playerName: string): PlayerRanking | null {
  try { return getTournamentLeaderboard().find((r) => r.playerName === playerName) ?? null; }
  catch { return null; }
}

export function getWinRate(playerName: string): number {
  try {
    let w = 0, tot = 0;
    for (const t of Object.values(load().tournaments).filter((t) => t.status === 'completed')) {
      const e = t.finalStandings.find((s) => s.playerName === playerName);
      if (e) { tot++; if (e.placement === 1) w++; }
    }
    return tot > 0 ? w / tot : 0;
  } catch { return 0; }
}

export function getBestStreak(): number {
  try {
    const lb = getTournamentLeaderboard();
    return lb.length ? Math.max(...lb.map((r) => r.bestStreak)) : 0;
  } catch { return 0; }
}

export function getEloHistory(): EloRecord[] {
  try { return load().eloHistory; } catch { return []; }
}

// ── 6. Rewards & Prizes ─────────────────────────────────────────────────

export function claimTournamentReward(tournamentId: string): RewardClaim | null {
  try {
    const data = load();
    const t = data.tournaments[tournamentId];
    if (!t || t.status !== 'completed') return null;
    const pid = me();
    const s = t.finalStandings.find((x) => x.playerId === pid);
    if (!s || s.prize <= 0) return null;
    if (data.rewards.some((r) => r.tournamentId === tournamentId && r.playerId === pid)) return null;
    const claim: RewardClaim = { tournamentId, tournamentName: t.name, playerId: pid, amount: s.prize, placement: s.placement, claimedAt: Date.now() };
    data.rewards.push(claim);
    save(data);
    return claim;
  } catch { return null; }
}

export function getRewardHistory(): RewardClaim[] {
  try { return load().rewards; } catch { return []; }
}

export function getTournamentEarnings(): number {
  try {
    const pid = me();
    return load().rewards.filter((r) => r.playerId === pid).reduce((s, r) => s + r.amount, 0);
  } catch { return 0; }
}

export function getPrizeDistribution(tournamentId: string): Record<number, number> {
  try {
    const t = load().tournaments[tournamentId];
    return t ? prizeDist(t.maxPlayers, t.prizePool) : {};
  } catch { return {}; }
}

// ── 7. Quick Match ───────────────────────────────────────────────────────

export function startQuickMatch(mode: GameMode): boolean {
  try {
    const data = load();
    if (data.quickMatch.state === 'searching' || data.quickMatch.state === 'playing') return false;

    const found = Object.values(data.tournaments).find(
      (t) => t.status === 'waiting' && t.gameMode === mode && t.participants.length < t.maxPlayers,
    );

    if (!found) {
      const t = makeTournament({
        name: `Quick ${mode} — ${new Date().toLocaleTimeString()}`, maxPlayers: 8,
        gameMode: mode, difficulty: 'medium', startTime: Date.now() + 60_000,
        entryFee: 0, prizePool: 100,
      });
      data.tournaments[t.id] = t;
      data.quickMatch = { state: 'searching', mode, tournamentId: t.id, startedSearchingAt: Date.now(), matchedAt: null };
    } else {
      data.quickMatch = { state: 'found', mode, tournamentId: found.id, startedSearchingAt: Date.now(), matchedAt: Date.now() };
    }

    save(data);
    return true;
  } catch { return false; }
}

export function getQuickMatchStatus(): QuickMatchData {
  try { return load().quickMatch; }
  catch { return { state: 'idle', mode: null, tournamentId: null, startedSearchingAt: null, matchedAt: null }; }
}

export function leaveQuickMatch(): boolean {
  try {
    const data = load();
    if (data.quickMatch.state === 'playing') return false;
    data.quickMatch = { state: 'idle', mode: null, tournamentId: null, startedSearchingAt: null, matchedAt: null };
    save(data);
    return true;
  } catch { return false; }
}

// ── 8. UI Helpers ────────────────────────────────────────────────────────

export function getTournamentOverview(): TournamentOverview {
  try {
    const data = load();
    const all = Object.values(data.tournaments);
    const active = all.filter((t) => t.status === 'waiting' || t.status === 'in_progress');
    const completed = all.filter((t) => t.status === 'completed');
    const pid = me();
    return {
      activeCount: active.length,
      completedCount: completed.length,
      totalParticipants: all.reduce((s, t) => s + t.participants.length, 0),
      totalPrizePool: active.reduce((s, t) => s + t.prizePool, 0),
      recentWinners: completed.flatMap((t) => t.finalStandings.filter((s) => s.placement === 1)).slice(-5),
      upcomingTournaments: active.filter((t) => t.status === 'waiting' && t.startTime > Date.now()).sort((a, b) => a.startTime - b.startTime).slice(0, 5),
      myActiveCount: active.filter((t) => t.participants.some((p) => p.id === pid)).length,
    };
  } catch {
    return { activeCount: 0, completedCount: 0, totalParticipants: 0, totalPrizePool: 0, recentWinners: [], upcomingTournaments: [], myActiveCount: 0 };
  }
}

export function getBracketCard(tournamentId: string): BracketCard | null {
  try {
    const t = load().tournaments[tournamentId];
    if (!t) return null;
    const byRound: Record<number, BracketMatch[]> = {};
    for (let r = 1; r <= t.rounds; r++) byRound[r] = t.bracket.filter((m) => m.round === r);
    let cur = t.rounds;
    for (let r = 1; r <= t.rounds; r++) {
      if (t.bracket.some((m) => m.round === r && (m.status === 'pending' || m.status === 'in_progress'))) { cur = r; break; }
    }
    return { tournamentId: t.id, tournamentName: t.name, rounds: t.rounds, matchesByRound: byRound, status: t.status, currentRound: cur, totalParticipants: t.participants.length };
  } catch { return null; }
}

export function getMatchCard(matchId: string): MatchCard | null {
  try {
    const m = getMatch(matchId);
    if (!m) return null;
    return {
      id: m.id, round: m.round,
      player1: m.player1Id ? { name: m.player1Name, score: m.player1Score } : null,
      player2: m.player2Id ? { name: m.player2Name, score: m.player2Score } : null,
      status: m.status,
      winnerName: m.winnerId ? (m.player1Id === m.winnerId ? m.player1Name : m.player2Name) : null,
      prediction: m.prediction, startedAt: m.startedAt, completedAt: m.completedAt,
    };
  } catch { return null; }
}

export function getMyStats(): PlayerStats {
  try {
    const pid = me(), data = load();
    const mine = Object.values(data.tournaments).filter((t) => t.participants.some((p) => p.id === pid));
    let tWins = 0, tMatch = 0, mWins = 0, tScore = 0, sCnt = 0;
    const modes: Record<string, number> = {};

    for (const t of mine) {
      if (t.status === 'completed' && t.winnerId === pid) tWins++;
      modes[t.gameMode] = (modes[t.gameMode] ?? 0) + 1;
      for (const m of t.bracket.filter((m) => m.player1Id === pid || m.player2Id === pid)) {
        tMatch++;
        if (m.status === 'completed' || m.status === 'bye') {
          if (m.winnerId === pid) mWins++;
          const sc = m.player1Id === pid ? m.player1Score : m.player2Score;
          if (sc > 0) { tScore += sc; sCnt++; }
        }
      }
    }

    let fav: GameMode | null = null, maxC = 0;
    for (const [k, v] of Object.entries(modes)) if (v > maxC) { maxC = v; fav = k as GameMode; }

    const pname = mine.flatMap((t) => t.participants).find((p) => p.id === pid)?.name ?? '';
    const streak = calcStreak(pname, data);
    const elo = data.eloHistory.length ? data.eloHistory[data.eloHistory.length - 1].elo : 1200;

    return {
      tournamentsPlayed: mine.length, tournamentsWon: tWins, totalMatches: tMatch,
      matchesWon: mWins, winRate: tMatch > 0 ? mWins / tMatch : 0, earnings: getTournamentEarnings(),
      elo, bestStreak: streak, avgScore: sCnt > 0 ? tScore / sCnt : 0, favoriteMode: fav,
    };
  } catch {
    return { tournamentsPlayed: 0, tournamentsWon: 0, totalMatches: 0, matchesWon: 0, winRate: 0, earnings: 0, elo: 1200, bestStreak: 0, avgScore: 0, favoriteMode: null };
  }
}

function calcStreak(name: string, data: Store): number {
  const completed = Object.values(data.tournaments).filter((t) => t.status === 'completed').sort((a, b) => a.createdAt - b.createdAt);
  let best = 0, cur = 0;
  for (const t of completed) {
    const w = t.finalStandings.find((s) => s.placement === 1);
    if (w?.playerName === name) { cur++; best = Math.max(best, cur); }
    else if (t.finalStandings.some((s) => s.playerName === name)) cur = 0;
  }
  return best;
}

export function getRecentResults(count: number = 10): RecentResult[] {
  try {
    const pid = me();
    return Object.values(load().tournaments)
      .filter((t) => t.participants.some((p) => p.id === pid))
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((t) => {
        const s = t.finalStandings.find((x) => x.playerId === pid);
        return {
          tournamentId: t.id, tournamentName: t.name, placement: s?.placement ?? (t.participants.length + 1),
          prize: s?.prize ?? 0, status: t.status, completedAt: s ? t.createdAt + 1 : 0,
        };
      })
      .slice(0, count);
  } catch { return []; }
}
