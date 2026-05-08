/**
 * soundtrack-manager-wire.ts — Soundtrack & Music Management Wire
 *
 * Standalone module for the Word Snake game providing full management of
 * background music, playlists, ambient sounds, volume mixing, listening
 * history/stats, mood detection, auto-play, and UI dashboard helpers.
 *
 * Uses localStorage key `ws_soundtrack_manager` for persistence.
 * All exported functions are safe (try/catch) and return sensible defaults.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type Genre = 'ambient' | 'electronic' | 'acoustic' | 'orchestral' | 'chiptune' | 'lofi' | 'rock';
export type Mood = 'calm' | 'energetic' | 'focus' | 'epic' | 'playful' | 'mysterious';
export type RepeatMode = 'none' | 'one' | 'all';
export type GameContext = 'gameplay' | 'menu' | 'challenge' | 'zen';

export interface MusicTrack {
  id: string;
  name: string;
  genre: Genre;
  mood: Mood;
  bpm: number;
  duration: number;       // seconds
  unlockCondition: string;
  unlocked: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  trackIds: string[];
  createdAt: number;      // timestamp ms
}

export interface PlaybackState {
  playing: boolean;
  currentTrackId: string | null;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  elapsedTime: number;    // seconds
  playlistId: string | null;
}

export interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  active: boolean;
  volume: number;
}

export interface PlayHistoryEntry {
  trackId: string;
  timestamp: number;
  duration: number;       // seconds listened
}

export interface VolumePresetConfig {
  id: string;
  name: string;
  icon: string;
  master: number;
  music: number;
  ambient: number;
  genres: Partial<Record<Genre, number>>;
}

export interface AmbientMixPreset {
  id: string;
  name: string;
  icon: string;
  sounds: { id: string; volume: number }[];
}

export interface ListeningStats {
  totalPlays: number;
  totalMinutes: number;
  genreBreakdown: Record<Genre, number>;
  mostPlayed: { trackId: string; count: number }[];
  streak: number;
}

export interface PersistedSoundtrackState {
  unlockedTracks: string[];
  playlists: Playlist[];
  playback: PlaybackState;
  masterVolume: number;
  musicVolume: number;
  ambientVolume: number;
  genreVolumes: Record<string, number>;
  ambientSounds: Record<string, { active: boolean; volume: number }>;
  playHistory: PlayHistoryEntry[];
  activePlaylistId: string | null;
  shuffleQueue: string[];
  shuffleIndex: number;
  autoPlayEnabled: boolean;
  listeningDays: string[]; // ISO date strings
}

// ── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ws_soundtrack_manager';

const ALL_GENRES: Genre[] = ['ambient', 'electronic', 'acoustic', 'orchestral', 'chiptune', 'lofi', 'rock'];
const ALL_MOODS: Mood[] = ['calm', 'energetic', 'focus', 'epic', 'playful', 'mysterious'];

const BUILT_IN_TRACKS: MusicTrack[] = [
  { id: 'neon-dreams',    name: 'Neon Dreams',       genre: 'electronic',  mood: 'energetic',  bpm: 128, duration: 210, unlockCondition: 'none',         unlocked: true  },
  { id: 'pixel-rain',     name: 'Pixel Rain',         genre: 'chiptune',    mood: 'playful',    bpm: 140, duration: 185, unlockCondition: 'none',         unlocked: true  },
  { id: 'word-garden',    name: 'Word Garden',        genre: 'acoustic',    mood: 'calm',       bpm: 85,  duration: 240, unlockCondition: 'none',         unlocked: true  },
  { id: 'snake-highway',  name: 'Snake Highway',      genre: 'rock',        mood: 'energetic',  bpm: 150, duration: 195, unlockCondition: 'score_500',   unlocked: false },
  { id: 'midnight-code',  name: 'Midnight Code',      genre: 'electronic',  mood: 'mysterious', bpm: 110, duration: 225, unlockCondition: 'score_1000',  unlocked: false },
  { id: 'lofi-vocabulary',name: 'Lo-Fi Vocabulary',   genre: 'lofi',        mood: 'focus',      bpm: 78,  duration: 300, unlockCondition: 'none',         unlocked: true  },
  { id: 'epic-dictionary',name: 'Epic Dictionary',    genre: 'orchestral',  mood: 'epic',       bpm: 95,  duration: 270, unlockCondition: 'score_2000',  unlocked: false },
  { id: 'ambient-lexicon',name: 'Ambient Lexicon',    genre: 'ambient',     mood: 'calm',       bpm: 65,  duration: 360, unlockCondition: 'none',         unlocked: true  },
  { id: 'chiptune-blitz', name: 'Chiptune Blitz',     genre: 'chiptune',    mood: 'energetic',  bpm: 160, duration: 160, unlockCondition: 'combo_10',    unlocked: false },
  { id: 'acoustic-scroll',name: 'Acoustic Scroll',    genre: 'acoustic',    mood: 'focus',      bpm: 90,  duration: 250, unlockCondition: 'none',         unlocked: true  },
  { id: 'synth-serpent',  name: 'Synth Serpent',      genre: 'electronic',  mood: 'mysterious', bpm: 120, duration: 200, unlockCondition: 'level_5',     unlocked: false },
  { id: 'orchestral-odyssey', name: 'Orchestral Odyssey', genre: 'orchestral', mood: 'epic',    bpm: 100, duration: 280, unlockCondition: 'score_5000',  unlocked: false },
  { id: 'cafe-wordsmith', name: 'Cafe Wordsmith',     genre: 'lofi',        mood: 'calm',       bpm: 72,  duration: 320, unlockCondition: 'none',         unlocked: true  },
  { id: 'rock-thesaurus', name: 'Rock Thesaurus',     genre: 'rock',        mood: 'epic',       bpm: 135, duration: 190, unlockCondition: 'score_3000',  unlocked: false },
  { id: 'focus-flow',     name: 'Focus Flow',         genre: 'ambient',     mood: 'focus',      bpm: 70,  duration: 340, unlockCondition: 'none',         unlocked: true  },
  { id: 'playful-puzzle', name: 'Playful Puzzle',     genre: 'chiptune',    mood: 'playful',    bpm: 130, duration: 175, unlockCondition: 'words_100',   unlocked: false },
  { id: 'dawn-passage',   name: 'Dawn Passage',       genre: 'orchestral',  mood: 'calm',       bpm: 80,  duration: 290, unlockCondition: 'streak_7',    unlocked: false },
  { id: 'bass-cascade',   name: 'Bass Cascade',       genre: 'electronic',  mood: 'playful',    bpm: 125, duration: 215, unlockCondition: 'score_1500',  unlocked: false },
];

const DEFAULT_AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'rain',      name: 'Rain',      icon: '🌧️',  active: false, volume: 0.5 },
  { id: 'forest',    name: 'Forest',     icon: '🌲',  active: false, volume: 0.5 },
  { id: 'ocean',     name: 'Ocean',      icon: '🌊',  active: false, volume: 0.5 },
  { id: 'wind',      name: 'Wind',       icon: '💨',  active: false, volume: 0.4 },
  { id: 'cafe',      name: 'Cafe',       icon: '☕',   active: false, volume: 0.5 },
  { id: 'fireplace', name: 'Fireplace',  icon: '🔥',  active: false, volume: 0.5 },
  { id: 'space',     name: 'Space',      icon: '🌌',  active: false, volume: 0.3 },
];

const VOLUME_PRESETS: VolumePresetConfig[] = [
  { id: 'balanced',      name: 'Balanced',      icon: '🎵', master: 0.8, music: 0.7, ambient: 0.5, genres: {} },
  { id: 'music-focus',   name: 'Music Focus',    icon: '🎶', master: 0.85, music: 0.9, ambient: 0.25, genres: {} },
  { id: 'ambient-focus', name: 'Ambient Focus',  icon: '🎧', master: 0.75, music: 0.3, ambient: 0.85, genres: {} },
  { id: 'bass-boost',    name: 'Bass Boost',     icon: '🔊', master: 0.9, music: 0.8, ambient: 0.4, genres: { rock: 1.0, electronic: 0.9 } },
  { id: 'night-mode',    name: 'Night Mode',     icon: '🌙', master: 0.5, music: 0.5, ambient: 0.6, genres: { ambient: 0.8, lofi: 0.7 } },
];

const AMBIENT_MIX_PRESETS: AmbientMixPreset[] = [
  { id: 'focus',     name: 'Focus',     icon: '🎯', sounds: [{ id: 'rain', volume: 0.4 }, { id: 'cafe', volume: 0.35 }] },
  { id: 'relax',     name: 'Relax',     icon: '😌', sounds: [{ id: 'ocean', volume: 0.5 }, { id: 'wind', volume: 0.25 }] },
  { id: 'adventure', name: 'Adventure', icon: '🗺️', sounds: [{ id: 'forest', volume: 0.45 }, { id: 'wind', volume: 0.3 }] },
  { id: 'cozy',      name: 'Cozy',      icon: '🛋️', sounds: [{ id: 'fireplace', volume: 0.55 }, { id: 'rain', volume: 0.3 }] },
];

const DEFAULT_PLAYBACK: PlaybackState = {
  playing: false,
  currentTrackId: null,
  volume: 0.7,
  shuffle: false,
  repeat: 'none',
  elapsedTime: 0,
  playlistId: null,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function uid(): string {
  return `pl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadState(): PersistedSoundtrackState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedSoundtrackState>;
      return {
        unlockedTracks:    Array.isArray(parsed.unlockedTracks) ? parsed.unlockedTracks : [],
        playlists:         Array.isArray(parsed.playlists) ? parsed.playlists : [],
        playback:          { ...DEFAULT_PLAYBACK, ...(parsed.playback || {}) },
        masterVolume:      typeof parsed.masterVolume === 'number' ? parsed.masterVolume : 0.8,
        musicVolume:       typeof parsed.musicVolume === 'number' ? parsed.musicVolume : 0.7,
        ambientVolume:     typeof parsed.ambientVolume === 'number' ? parsed.ambientVolume : 0.5,
        genreVolumes:      parsed.genreVolumes ?? {},
        ambientSounds:     parsed.ambientSounds ?? {},
        playHistory:       Array.isArray(parsed.playHistory) ? parsed.playHistory : [],
        activePlaylistId:  parsed.activePlaylistId ?? null,
        shuffleQueue:      Array.isArray(parsed.shuffleQueue) ? parsed.shuffleQueue : [],
        shuffleIndex:      typeof parsed.shuffleIndex === 'number' ? parsed.shuffleIndex : 0,
        autoPlayEnabled:   !!parsed.autoPlayEnabled,
        listeningDays:     Array.isArray(parsed.listeningDays) ? parsed.listeningDays : [],
      };
    }
  } catch {
    // corrupt data — use defaults
  }
  return {
    unlockedTracks: [],
    playlists: [],
    playback: { ...DEFAULT_PLAYBACK },
    masterVolume: 0.8,
    musicVolume: 0.7,
    ambientVolume: 0.5,
    genreVolumes: {},
    ambientSounds: {},
    playHistory: [],
    activePlaylistId: null,
    shuffleQueue: [],
    shuffleIndex: 0,
    autoPlayEnabled: false,
    listeningDays: [],
  };
}

function saveState(state: PersistedSoundtrackState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable
  }
}

function getMutableState(): PersistedSoundtrackState {
  return loadState();
}

function withUnlockedTracks(tracks: MusicTrack[], state: PersistedSoundtrackState): MusicTrack[] {
  return tracks.map(t => ({
    ...t,
    unlocked: state.unlockedTracks.includes(t.id) ? true : t.unlockCondition === 'none',
  }));
}

function shuffleArray(arr: string[]): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── 1. Music Library & Tracks ───────────────────────────────────────────────

/** Returns the full music library with unlock status hydrated from storage. */
export function getMusicLibrary(): MusicTrack[] {
  try {
    const state = loadState();
    return withUnlockedTracks(BUILT_IN_TRACKS, state);
  } catch {
    return BUILT_IN_TRACKS.map(t => ({ ...t }));
  }
}

/** Get a single track by ID. */
export function getTrack(id: string): MusicTrack | null {
  try {
    const state = loadState();
    const library = withUnlockedTracks(BUILT_IN_TRACKS, state);
    return library.find(t => t.id === id) ?? null;
  } catch {
    return null;
  }
}

/** Check whether a track is currently unlocked. */
export function isTrackUnlocked(trackId: string): boolean {
  try {
    const track = BUILT_IN_TRACKS.find(t => t.id === trackId);
    if (!track) return false;
    if (track.unlockCondition === 'none') return true;
    const state = loadState();
    return state.unlockedTracks.includes(trackId);
  } catch {
    return false;
  }
}

/** Unlock a specific track. */
export function unlockTrack(trackId: string): boolean {
  try {
    const track = BUILT_IN_TRACKS.find(t => t.id === trackId);
    if (!track || track.unlockCondition === 'none') return false;
    const state = loadState();
    if (state.unlockedTracks.includes(trackId)) return false;
    state.unlockedTracks.push(trackId);
    saveState(state);
    return true;
  } catch {
    return false;
  }
}

// ── 2. Playlist Management ──────────────────────────────────────────────────

/** Get all user-created playlists. */
export function getPlaylists(): Playlist[] {
  try {
    const state = loadState();
    return state.playlists;
  } catch {
    return [];
  }
}

/** Create a new empty playlist. */
export function createPlaylist(name: string, description: string = ''): Playlist {
  try {
    const state = loadState();
    const playlist: Playlist = {
      id: uid(),
      name: name.trim() || 'Untitled Playlist',
      description: description.trim(),
      trackIds: [],
      createdAt: Date.now(),
    };
    state.playlists.push(playlist);
    saveState(state);
    return playlist;
  } catch {
    return { id: uid(), name: name.trim() || 'Untitled Playlist', description: description.trim(), trackIds: [], createdAt: Date.now() };
  }
}

/** Delete a playlist by ID. */
export function deletePlaylist(id: string): boolean {
  try {
    const state = loadState();
    const before = state.playlists.length;
    state.playlists = state.playlists.filter(p => p.id !== id);
    if (state.activePlaylistId === id) {
      state.activePlaylistId = null;
    }
    saveState(state);
    return state.playlists.length < before;
  } catch {
    return false;
  }
}

/** Add a track to a playlist. */
export function addToPlaylist(playlistId: string, trackId: string): boolean {
  try {
    const state = loadState();
    const playlist = state.playlists.find(p => p.id === playlistId);
    if (!playlist) return false;
    if (playlist.trackIds.includes(trackId)) return false;
    playlist.trackIds.push(trackId);
    saveState(state);
    return true;
  } catch {
    return false;
  }
}

/** Remove a track from a playlist. */
export function removeFromPlaylist(playlistId: string, trackId: string): boolean {
  try {
    const state = loadState();
    const playlist = state.playlists.find(p => p.id === playlistId);
    if (!playlist) return false;
    const before = playlist.trackIds.length;
    playlist.trackIds = playlist.trackIds.filter(id => id !== trackId);
    saveState(state);
    return playlist.trackIds.length < before;
  } catch {
    return false;
  }
}

/** Rename a playlist. */
export function renamePlaylist(id: string, newName: string): boolean {
  try {
    const state = loadState();
    const playlist = state.playlists.find(p => p.id === id);
    if (!playlist) return false;
    const trimmed = newName.trim();
    if (!trimmed) return false;
    playlist.name = trimmed;
    saveState(state);
    return true;
  } catch {
    return false;
  }
}

/** Get a default auto-generated playlist of unlocked tracks. */
export function getDefaultPlaylist(): Playlist {
  try {
    const state = loadState();
    const unlocked = withUnlockedTracks(BUILT_IN_TRACKS, state).filter(t => t.unlocked);
    return {
      id: '__default__',
      name: 'All Unlocked',
      description: 'Auto-generated playlist of all unlocked tracks',
      trackIds: unlocked.map(t => t.id),
      createdAt: 0,
    };
  } catch {
    return { id: '__default__', name: 'All Unlocked', description: 'Auto-generated playlist of all unlocked tracks', trackIds: [], createdAt: 0 };
  }
}

/** Get a context-aware recommended playlist. */
export function getRecommendedPlaylist(context: GameContext): Playlist {
  try {
    const state = loadState();
    const library = withUnlockedTracks(BUILT_IN_TRACKS, state).filter(t => t.unlocked);

    const moodMap: Record<GameContext, Mood[]> = {
      gameplay:  ['energetic', 'playful', 'focus'],
      menu:      ['calm', 'playful'],
      challenge: ['epic', 'energetic', 'mysterious'],
      zen:       ['calm', 'focus', 'mysterious'],
    };

    const allowed = moodMap[context] ?? ['calm', 'focus'];
    const filtered = library.filter(t => allowed.includes(t.mood));

    const contextNames: Record<GameContext, string> = {
      gameplay: 'Gameplay Mix',
      menu: 'Menu Vibes',
      challenge: 'Challenge Mode',
      zen: 'Zen Flow',
    };

    const contextDescs: Record<GameContext, string> = {
      gameplay: 'Upbeat tracks to keep the momentum going',
      menu: 'Relaxing tunes while you browse',
      challenge: 'Intense music for serious sessions',
      zen: 'Peaceful sounds for a meditative experience',
    };

    return {
      id: `__rec_${context}__`,
      name: contextNames[context],
      description: contextDescs[context],
      trackIds: filtered.map(t => t.id),
      createdAt: 0,
    };
  } catch {
    return { id: `__rec_${context}__`, name: 'Recommended', description: 'Context-aware playlist', trackIds: [], createdAt: 0 };
  }
}

// ── 3. Playback Control ─────────────────────────────────────────────────────

/** Start playing a track by ID. */
export function play(trackId: string): PlaybackState {
  try {
    const state = loadState();
    const track = BUILT_IN_TRACKS.find(t => t.id === trackId);
    if (!track) return state.playback;

    state.playback.playing = true;
    state.playback.currentTrackId = trackId;
    state.playback.elapsedTime = 0;

    // Build shuffle queue from the active playlist or default
    const playlist = state.activePlaylistId
      ? state.playlists.find(p => p.id === state.activePlaylistId)
      : null;

    const trackPool = playlist?.trackIds.length
      ? playlist.trackIds
      : BUILT_IN_TRACKS.filter(t => t.unlocked || state.unlockedTracks.includes(t.id) || t.unlockCondition === 'none').map(t => t.id);

    if (state.playback.shuffle && trackPool.length > 0) {
      state.shuffleQueue = shuffleArray(trackPool.filter(id => id !== trackId));
      state.shuffleQueue.unshift(trackId);
      state.shuffleIndex = 0;
    }

    saveState(state);
    return { ...state.playback };
  } catch {
    return DEFAULT_PLAYBACK;
  }
}

/** Pause playback. */
export function pause(): PlaybackState {
  try {
    const state = loadState();
    state.playback.playing = false;
    saveState(state);
    return { ...state.playback };
  } catch {
    return DEFAULT_PLAYBACK;
  }
}

/** Resume playback. */
export function resume(): PlaybackState {
  try {
    const state = loadState();
    if (state.playback.currentTrackId) {
      state.playback.playing = true;
      saveState(state);
    }
    return { ...state.playback };
  } catch {
    return DEFAULT_PLAYBACK;
  }
}

/** Stop playback and reset. */
export function stop(): PlaybackState {
  try {
    const state = loadState();
    state.playback.playing = false;
    state.playback.currentTrackId = null;
    state.playback.elapsedTime = 0;
    saveState(state);
    return { ...state.playback };
  } catch {
    return DEFAULT_PLAYBACK;
  }
}

/** Play next track in current playlist / shuffle queue. */
export function next(): PlaybackState {
  try {
    const state = loadState();
    if (!state.playback.currentTrackId) return state.playback;

    const playlist = state.activePlaylistId
      ? state.playlists.find(p => p.id === state.activePlaylistId)
      : null;

    const trackPool = playlist?.trackIds.length
      ? playlist.trackIds
      : BUILT_IN_TRACKS.filter(t => t.unlocked || state.unlockedTracks.includes(t.id) || t.unlockCondition === 'none').map(t => t.id);

    if (trackPool.length === 0) return state.playback;

    if (state.playback.shuffle && state.shuffleQueue.length > 0) {
      state.shuffleIndex = (state.shuffleIndex + 1) % state.shuffleQueue.length;
      state.playback.currentTrackId = state.shuffleQueue[state.shuffleIndex];
    } else {
      const currentIdx = trackPool.indexOf(state.playback.currentTrackId);
      if (state.playback.repeat === 'one') {
        // stay on same track
      } else if (currentIdx < trackPool.length - 1) {
        state.playback.currentTrackId = trackPool[currentIdx + 1];
      } else if (state.playback.repeat === 'all') {
        state.playback.currentTrackId = trackPool[0];
      } else {
        state.playback.playing = false;
        state.playback.elapsedTime = 0;
        saveState(state);
        return { ...state.playback };
      }
    }

    state.playback.elapsedTime = 0;
    saveState(state);
    return { ...state.playback };
  } catch {
    return DEFAULT_PLAYBACK;
  }
}

/** Play previous track in current playlist / shuffle queue. */
export function previous(): PlaybackState {
  try {
    const state = loadState();
    if (!state.playback.currentTrackId) return state.playback;

    // If more than 3 seconds in, restart current track
    if (state.playback.elapsedTime > 3) {
      state.playback.elapsedTime = 0;
      saveState(state);
      return { ...state.playback };
    }

    const playlist = state.activePlaylistId
      ? state.playlists.find(p => p.id === state.activePlaylistId)
      : null;

    const trackPool = playlist?.trackIds.length
      ? playlist.trackIds
      : BUILT_IN_TRACKS.filter(t => t.unlocked || state.unlockedTracks.includes(t.id) || t.unlockCondition === 'none').map(t => t.id);

    if (trackPool.length === 0) return state.playback;

    if (state.playback.shuffle && state.shuffleQueue.length > 0) {
      state.shuffleIndex = (state.shuffleIndex - 1 + state.shuffleQueue.length) % state.shuffleQueue.length;
      state.playback.currentTrackId = state.shuffleQueue[state.shuffleIndex];
    } else {
      const currentIdx = trackPool.indexOf(state.playback.currentTrackId);
      if (currentIdx > 0) {
        state.playback.currentTrackId = trackPool[currentIdx - 1];
      } else if (state.playback.repeat === 'all') {
        state.playback.currentTrackId = trackPool[trackPool.length - 1];
      }
    }

    state.playback.elapsedTime = 0;
    saveState(state);
    return { ...state.playback };
  } catch {
    return DEFAULT_PLAYBACK;
  }
}

/** Toggle shuffle mode. */
export function shuffle(mode: boolean): PlaybackState {
  try {
    const state = loadState();
    state.playback.shuffle = mode;
    if (mode) {
      const trackPool = BUILT_IN_TRACKS
        .filter(t => t.unlocked || state.unlockedTracks.includes(t.id) || t.unlockCondition === 'none')
        .map(t => t.id);
      state.shuffleQueue = shuffleArray(trackPool);
      state.shuffleIndex = 0;
    }
    saveState(state);
    return { ...state.playback };
  } catch {
    return DEFAULT_PLAYBACK;
  }
}

/** Set repeat mode. */
export function repeat(mode: RepeatMode): PlaybackState {
  try {
    const state = loadState();
    state.playback.repeat = mode;
    saveState(state);
    return { ...state.playback };
  } catch {
    return DEFAULT_PLAYBACK;
  }
}

/** Get the currently playing track's full info. */
export function getCurrentTrack(): MusicTrack | null {
  try {
    const state = loadState();
    if (!state.playback.currentTrackId) return null;
    return getTrack(state.playback.currentTrackId);
  } catch {
    return null;
  }
}

/** Get the full playback state snapshot. */
export function getPlaybackState(): PlaybackState {
  try {
    const state = loadState();
    return { ...state.playback };
  } catch {
    return { ...DEFAULT_PLAYBACK };
  }
}

/** Seek to a position (0-100%). */
export function seek(position: number): PlaybackState {
  try {
    const state = loadState();
    const track = BUILT_IN_TRACKS.find(t => t.id === state.playback.currentTrackId);
    const pct = clamp01(position / 100);
    state.playback.elapsedTime = track ? Math.round(pct * track.duration) : 0;
    saveState(state);
    return { ...state.playback };
  } catch {
    return DEFAULT_PLAYBACK;
  }
}

/** Set the active playlist for next/prev navigation. */
export function setActivePlaylist(playlistId: string | null): void {
  try {
    const state = loadState();
    state.activePlaylistId = playlistId;
    saveState(state);
  } catch {
    // noop
  }
}

// ── 4. Volume & Mixing ─────────────────────────────────────────────────────

/** Get master volume (0-1). */
export function getMasterVolume(): number {
  try {
    return loadState().masterVolume;
  } catch {
    return 0.8;
  }
}

/** Set master volume (0-1). */
export function setMasterVolume(vol: number): number {
  try {
    const state = loadState();
    state.masterVolume = clamp01(vol);
    saveState(state);
    return state.masterVolume;
  } catch {
    return 0.8;
  }
}

/** Get music volume (0-1). */
export function getMusicVolume(): number {
  try {
    return loadState().musicVolume;
  } catch {
    return 0.7;
  }
}

/** Set music volume (0-1). */
export function setMusicVolume(vol: number): number {
  try {
    const state = loadState();
    state.musicVolume = clamp01(vol);
    saveState(state);
    return state.musicVolume;
  } catch {
    return 0.7;
  }
}

/** Get ambient volume (0-1). */
export function getAmbientVolume(): number {
  try {
    return loadState().ambientVolume;
  } catch {
    return 0.5;
  }
}

/** Set ambient volume (0-1). */
export function setAmbientVolume(vol: number): number {
  try {
    const state = loadState();
    state.ambientVolume = clamp01(vol);
    saveState(state);
    return state.ambientVolume;
  } catch {
    return 0.5;
  }
}

/** Get per-genre volume (0-1). Returns 1.0 if not set. */
export function getGenreVolume(genre: string): number {
  try {
    const state = loadState();
    return typeof state.genreVolumes[genre] === 'number'
      ? state.genreVolumes[genre]
      : 1.0;
  } catch {
    return 1.0;
  }
}

/** Set per-genre volume (0-1). */
export function setGenreVolume(genre: string, vol: number): void {
  try {
    const state = loadState();
    state.genreVolumes[genre] = clamp01(vol);
    saveState(state);
  } catch {
    // noop
  }
}

/** Get a named volume preset configuration. */
export function getVolumePreset(id: string): VolumePresetConfig | null {
  try {
    return VOLUME_PRESETS.find(p => p.id === id) ?? null;
  } catch {
    return null;
  }
}

/** Apply a named volume preset. Returns the applied config or null. */
export function applyVolumePreset(id: string): VolumePresetConfig | null {
  try {
    const preset = VOLUME_PRESETS.find(p => p.id === id);
    if (!preset) return null;
    const state = loadState();
    state.masterVolume = preset.master;
    state.musicVolume = preset.music;
    state.ambientVolume = preset.ambient;
    for (const genre of ALL_GENRES) {
      if (preset.genres[genre] !== undefined) {
        state.genreVolumes[genre] = preset.genres[genre]!;
      }
    }
    saveState(state);
    return preset;
  } catch {
    return null;
  }
}

/** Get the complete audio mixer state. */
export function getAudioMixerState(): {
  master: number;
  music: number;
  ambient: number;
  genres: Record<string, number>;
} {
  try {
    const state = loadState();
    return {
      master: state.masterVolume,
      music: state.musicVolume,
      ambient: state.ambientVolume,
      genres: { ...state.genreVolumes },
    };
  } catch {
    return { master: 0.8, music: 0.7, ambient: 0.5, genres: {} };
  }
}

// ── 5. Ambient Sound Management ────────────────────────────────────────────

/** Get all available ambient sounds with their current state. */
export function getAmbientSounds(): AmbientSound[] {
  try {
    const state = loadState();
    return DEFAULT_AMBIENT_SOUNDS.map(s => ({
      ...s,
      active: state.ambientSounds[s.id]?.active ?? s.active,
      volume: state.ambientSounds[s.id]?.volume ?? s.volume,
    }));
  } catch {
    return DEFAULT_AMBIENT_SOUNDS.map(s => ({ ...s }));
  }
}

/** Toggle an ambient sound on/off. Returns the new active state. */
export function toggleAmbient(soundId: string): boolean {
  try {
    const state = loadState();
    const existing = state.ambientSounds[soundId] ?? { active: false, volume: 0.5 };
    existing.active = !existing.active;
    state.ambientSounds[soundId] = existing;
    saveState(state);
    return existing.active;
  } catch {
    return false;
  }
}

/** Set volume for a specific ambient sound by its ID (0-1). */
export function setAmbientSoundVolume(soundId: string, vol: number): void {
  try {
    const state = loadState();
    const existing = state.ambientSounds[soundId] ?? { active: false, volume: 0.5 };
    existing.volume = clamp01(vol);
    state.ambientSounds[soundId] = existing;
    saveState(state);
  } catch {
    // noop
  }
}

/** Get currently active ambient sounds. */
export function getActiveAmbients(): AmbientSound[] {
  try {
    return getAmbientSounds().filter(s => s.active);
  } catch {
    return [];
  }
}

/** Get available ambient mix presets. */
export function getAmbientMix(): AmbientMixPreset[] {
  try {
    return AMBIENT_MIX_PRESETS.map(p => ({ ...p }));
  } catch {
    return [];
  }
}

/** Apply an ambient mix preset. */
export function applyAmbientMix(mixId: string): AmbientMixPreset | null {
  try {
    const mix = AMBIENT_MIX_PRESETS.find(m => m.id === mixId);
    if (!mix) return null;
    const state = loadState();

    // First deactivate all ambients
    for (const def of DEFAULT_AMBIENT_SOUNDS) {
      if (!state.ambientSounds[def.id]) {
        state.ambientSounds[def.id] = { active: false, volume: def.volume };
      }
      state.ambientSounds[def.id].active = false;
    }

    // Activate preset sounds
    for (const sound of mix.sounds) {
      state.ambientSounds[sound.id] = {
        active: true,
        volume: clamp01(sound.volume),
      };
    }

    saveState(state);
    return mix;
  } catch {
    return null;
  }
}

// ── 6. Listening History & Stats ────────────────────────────────────────────

/** Record a play event for a track. */
export function recordPlay(trackId: string, duration: number = 0): void {
  try {
    const state = loadState();
    state.playHistory.push({
      trackId,
      timestamp: Date.now(),
      duration: Math.max(0, duration),
    });

    // Keep last 500 entries
    if (state.playHistory.length > 500) {
      state.playHistory = state.playHistory.slice(-500);
    }

    // Track listening day
    const today = todayISO();
    if (!state.listeningDays.includes(today)) {
      state.listeningDays.push(today);
    }

    saveState(state);
  } catch {
    // noop
  }
}

/** Get recent play history (newest first). */
export function getPlayHistory(limit: number = 50): PlayHistoryEntry[] {
  try {
    const state = loadState();
    return [...state.playHistory].reverse().slice(0, limit);
  } catch {
    return [];
  }
}

/** Get tracks sorted by play count (most played first). */
export function getMostPlayed(limit: number = 10): { trackId: string; count: number }[] {
  try {
    const state = loadState();
    const counts: Record<string, number> = {};
    for (const entry of state.playHistory) {
      counts[entry.trackId] = (counts[entry.trackId] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([trackId, count]) => ({ trackId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch {
    return [];
  }
}

/** Get total listening time in minutes. */
export function getListeningTime(): number {
  try {
    const state = loadState();
    const totalSeconds = state.playHistory.reduce((sum, e) => sum + (e.duration || 0), 0);
    return Math.round(totalSeconds / 60);
  } catch {
    return 0;
  }
}

/** Get play count broken down by genre. */
export function getGenreBreakdown(): Record<Genre, number> {
  try {
    const state = loadState();
    const breakdown: Record<string, number> = {};
    for (const genre of ALL_GENRES) breakdown[genre] = 0;

    for (const entry of state.playHistory) {
      const track = BUILT_IN_TRACKS.find(t => t.id === entry.trackId);
      if (track) {
        breakdown[track.genre] = (breakdown[track.genre] || 0) + 1;
      }
    }

    return breakdown as Record<Genre, number>;
  } catch {
    const empty: Record<string, number> = {};
    for (const genre of ALL_GENRES) empty[genre] = 0;
    return empty as Record<Genre, number>;
  }
}

/** Get consecutive days with music listened. */
export function getListeningStreak(): number {
  try {
    const state = loadState();
    if (state.listeningDays.length === 0) return 0;

    const uniqueDays = Array.from(new Set(state.listeningDays)).sort().reverse();
    const today = todayISO();

    let streak = 0;
    let checkDate = new Date(today);

    // If today is not in the list, start from yesterday
    if (!uniqueDays.includes(today)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (let i = 0; i < 365; i++) {
      const iso = checkDate.toISOString().slice(0, 10);
      if (uniqueDays.includes(iso)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  } catch {
    return 0;
  }
}

/** Get comprehensive listening statistics. */
export function getListeningStats(): ListeningStats {
  try {
    const state = loadState();
    const totalPlays = state.playHistory.length;
    const totalSeconds = state.playHistory.reduce((sum, e) => sum + (e.duration || 0), 0);

    const genreBreakdown = getGenreBreakdown();
    const mostPlayed = getMostPlayed(10);
    const streak = getListeningStreak();

    return {
      totalPlays,
      totalMinutes: Math.round(totalSeconds / 60),
      genreBreakdown,
      mostPlayed,
      streak,
    };
  } catch {
    return { totalPlays: 0, totalMinutes: 0, genreBreakdown: {} as Record<Genre, number>, mostPlayed: [], streak: 0 };
  }
}

// ── 7. Mood Detection & Auto-Play ──────────────────────────────────────────

export interface GameStateForMood {
  score: number;
  speed: number;     // 0-1 normalized
  combo: number;
  timeElapsed: number; // seconds
}

/** Detect the appropriate mood based on current game state. */
export function getDetectedMood(gameState?: Partial<GameStateForMood>): Mood {
  try {
    const gs = {
      score: gameState?.score ?? 0,
      speed: gameState?.speed ?? 0.3,
      combo: gameState?.combo ?? 0,
      timeElapsed: gameState?.timeElapsed ?? 0,
    };

    let energy = 0;

    // Score-based energy (logarithmic scale up to 10000)
    energy += Math.min(Math.log10(Math.max(1, gs.score)) / 4, 1) * 0.3;

    // Speed-based energy
    energy += gs.speed * 0.3;

    // Combo-based energy
    energy += Math.min(gs.combo / 20, 1) * 0.25;

    // Time-based: longer sessions trend calm
    const timeFactor = Math.min(gs.timeElapsed / 300, 1); // 5 min plateau
    energy -= timeFactor * 0.15;

    energy = clamp01(energy);

    if (energy > 0.75) return 'epic';
    if (energy > 0.55) return 'energetic';
    if (energy > 0.35) return 'playful';
    if (energy > 0.15) return 'focus';
    if (energy > 0.05) return 'mysterious';
    return 'calm';
  } catch {
    return 'calm';
  }
}

/** Suggest a track matching the given mood. */
export function getAutoTrack(mood: Mood): MusicTrack | null {
  try {
    const state = loadState();
    const library = withUnlockedTracks(BUILT_IN_TRACKS, state).filter(t => t.unlocked);

    // Exact mood match first
    const matches = library.filter(t => t.mood === mood);
    if (matches.length > 0) {
      return matches[Math.floor(Math.random() * matches.length)];
    }

    // Fallback to any track
    if (library.length > 0) {
      return library[Math.floor(Math.random() * library.length)];
    }

    return null;
  } catch {
    return null;
  }
}

/** Enable or disable mood-based auto-play. */
export function enableAutoPlay(enabled: boolean): void {
  try {
    const state = loadState();
    state.autoPlayEnabled = enabled;
    saveState(state);
  } catch {
    // noop
  }
}

/** Check whether mood-based auto-play is enabled. */
export function isAutoPlayEnabled(): boolean {
  try {
    return loadState().autoPlayEnabled;
  } catch {
    return false;
  }
}

/** Run auto-play: detect mood and play matching track. Returns the track or null. */
export function runAutoPlay(gameState?: Partial<GameStateForMood>): MusicTrack | null {
  try {
    const state = loadState();
    if (!state.autoPlayEnabled) return null;
    const mood = getDetectedMood(gameState);
    const track = getAutoTrack(mood);
    if (track) {
      play(track.id);
    }
    return track;
  } catch {
    return null;
  }
}

// ── 8. UI Helpers ───────────────────────────────────────────────────────────

export interface SoundtrackOverview {
  totalTracks: number;
  unlockedCount: number;
  lockedCount: number;
  totalPlaylists: number;
  totalListeningMinutes: number;
  listeningStreak: number;
  currentMood: Mood;
  nowPlaying: MusicTrack | null;
  topGenre: string;
  recentPlayCount: number;
}

/** Pre-computed dashboard data for the soundtrack panel. */
export function getSoundtrackOverview(gameState?: Partial<GameStateForMood>): SoundtrackOverview {
  try {
    const library = getMusicLibrary();
    const playlists = getPlaylists();
    const stats = getListeningStats();
    const currentTrack = getCurrentTrack();
    const breakdown = stats.genreBreakdown;

    const topGenre = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'ambient';
    const mood = getDetectedMood(gameState);

    return {
      totalTracks: library.length,
      unlockedCount: library.filter(t => t.unlocked).length,
      lockedCount: library.filter(t => !t.unlocked).length,
      totalPlaylists: playlists.length,
      totalListeningMinutes: stats.totalMinutes,
      listeningStreak: stats.streak,
      currentMood: mood,
      nowPlaying: currentTrack,
      topGenre,
      recentPlayCount: getPlayHistory(20).length,
    };
  } catch {
    return {
      totalTracks: BUILT_IN_TRACKS.length,
      unlockedCount: 0,
      lockedCount: 0,
      totalPlaylists: 0,
      totalListeningMinutes: 0,
      listeningStreak: 0,
      currentMood: 'calm',
      nowPlaying: null,
      topGenre: 'ambient',
      recentPlayCount: 0,
    };
  }
}

export interface NowPlayingCard {
  track: MusicTrack | null;
  progress: number;       // 0-100
  isPlaying: boolean;
  playlistName: string | null;
  shuffleOn: boolean;
  repeatMode: RepeatMode;
  elapsedFormatted: string;
  durationFormatted: string;
}

/** Get now playing card data with progress info. */
export function getNowPlayingCard(): NowPlayingCard {
  try {
    const state = loadState();
    const pb = state.playback;
    const track = pb.currentTrackId ? getTrack(pb.currentTrackId) : null;
    const progress = track && track.duration > 0
      ? clamp01(pb.elapsedTime / track.duration) * 100
      : 0;

    const playlistName = pb.playlistId
      ? state.playlists.find(p => p.id === pb.playlistId)?.name ?? null
      : null;

    const fmt = (s: number): string => {
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    return {
      track,
      progress: Math.round(progress),
      isPlaying: pb.playing,
      playlistName,
      shuffleOn: pb.shuffle,
      repeatMode: pb.repeat,
      elapsedFormatted: fmt(pb.elapsedTime),
      durationFormatted: track ? fmt(track.duration) : '0:00',
    };
  } catch {
    return {
      track: null,
      progress: 0,
      isPlaying: false,
      playlistName: null,
      shuffleOn: false,
      repeatMode: 'none',
      elapsedFormatted: '0:00',
      durationFormatted: '0:00',
    };
  }
}

export interface QuickControls {
  playing: boolean;
  canNext: boolean;
  canPrev: boolean;
  masterVolume: number;
  muted: boolean;
  shuffleOn: boolean;
  repeatMode: RepeatMode;
}

/** Get quick control state for the mini player. */
export function getQuickControls(): QuickControls {
  try {
    const state = loadState();
    const pb = state.playback;
    return {
      playing: pb.playing,
      canNext: pb.currentTrackId !== null,
      canPrev: pb.currentTrackId !== null,
      masterVolume: state.masterVolume,
      muted: state.masterVolume === 0,
      shuffleOn: pb.shuffle,
      repeatMode: pb.repeat,
    };
  } catch {
    return {
      playing: false,
      canNext: false,
      canPrev: false,
      masterVolume: 0.8,
      muted: false,
      shuffleOn: false,
      repeatMode: 'none',
    };
  }
}

/** Get genre distribution data suitable for chart display. */
export function getGenreDistribution(): { genre: string; count: number; color: string; percentage: number }[] {
  try {
    const breakdown = getGenreBreakdown();
    const total = Object.values(breakdown).reduce((s, v) => s + v, 0);

    const genreColors: Record<string, string> = {
      ambient: '#4ade80',
      electronic: '#818cf8',
      acoustic: '#fbbf24',
      orchestral: '#f87171',
      chiptune: '#38bdf8',
      lofi: '#c084fc',
      rock: '#fb923c',
    };

    return ALL_GENRES
      .map(genre => ({
        genre,
        count: breakdown[genre] || 0,
        color: genreColors[genre] ?? '#94a3b8',
        percentage: total > 0 ? Math.round(((breakdown[genre] || 0) / total) * 100) : 0,
      }))
      .filter(g => g.count > 0)
      .sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}

export interface RecentActivityItem {
  type: 'play' | 'unlock' | 'playlist_create';
  trackId?: string;
  trackName?: string;
  playlistId?: string;
  playlistName?: string;
  timestamp: number;
}

/** Get recent listening events for an activity feed. */
export function getRecentActivity(limit: number = 20): RecentActivityItem[] {
  try {
    const state = loadState();
    const activities: RecentActivityItem[] = [];

    // Recent plays
    const recentPlays = [...state.playHistory].reverse().slice(0, limit);
    for (const entry of recentPlays) {
      const track = BUILT_IN_TRACKS.find(t => t.id === entry.trackId);
      activities.push({
        type: 'play',
        trackId: entry.trackId,
        trackName: track?.name ?? entry.trackId,
        timestamp: entry.timestamp,
      });
    }

    return activities.slice(0, limit);
  } catch {
    return [];
  }
}

// ── Reset / Debug ───────────────────────────────────────────────────────────

/** Reset all soundtrack manager state to defaults. */
export function resetSoundtrackManager(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}
