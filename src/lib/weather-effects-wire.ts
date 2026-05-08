/**
 * weather-effects-wire.ts
 * Dynamic weather system for the Word Snake game.
 *
 * Provides 35 standalone exported functions managing weather state, seasons,
 * day/night cycles, visual/overlay configs, particles, gameplay modifiers,
 * achievements, events, leaderboards, and UI dashboard helpers.
 *
 * All persistent data is stored in localStorage with the prefix `ws_weather_`.
 * Every function uses try/catch for safety and returns sensible defaults
 * when no stored data is available.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Supported weather type identifiers. */
export type WeatherType =
  | "sunny"
  | "rainy"
  | "snowy"
  | "foggy"
  | "stormy"
  | "windy"
  | "aurora"
  | "sandstorm"
  | "blizzard"
  | "rainbow"
  | "eclipse"
  | "meteor_shower";

/** In-game season. */
export type Season = "spring" | "summer" | "fall" | "winter";

/** Time-of-day period. */
export type TimeOfDay = "dawn" | "day" | "dusk" | "night";

/** Gameplay modifier values applied by the current weather. */
export interface WeatherModifiers {
  /** Snake speed adjustment, e.g. 0.8 = 20 % slower, 1.2 = 20 % faster. */
  speedMultiplier: number;
  /** Grid visibility multiplier, e.g. 0.7 means 30 % reduced visibility. */
  visibilityMultiplier: number;
  /** Score multiplier applied to all points earned. */
  scoreMultiplier: number;
  /** Word-collect time bonus or penalty in milliseconds. */
  timeAdjustmentMs: number;
}

/** Visual configuration for the current weather (canvas / DOM). */
export interface WeatherVisualConfig {
  backgroundColor: string;
  particleType: string;
  particleColor: string;
  particleCount: number;
  overlayOpacity: number;
  overlayColor: string;
  animationSpeed: number;
}

/** Complete weather state persisted in localStorage. */
export interface WeatherState {
  type: WeatherType;
  intensity: number; // 0–1
  startedAt: number; // unix ms
  durationMs: number;
  modifiers: WeatherModifiers;
}

/** Single forecast entry. */
export interface ForecastEntry {
  type: WeatherType;
  estimatedStart: number; // unix ms
  durationMs: number;
  intensity: number;
}

/** A weather change recorded in history. */
export interface WeatherHistoryEntry {
  type: WeatherType;
  timestamp: number;
  durationMs: number;
}

/** Per-weather statistics. */
export interface WeatherStatEntry {
  totalTimeMs: number;
  gamesPlayed: number;
  bestScore: number;
  totalScore: number;
}

/** A weather-specific achievement. */
export interface WeatherAchievement {
  id: string;
  label: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: number | null;
  requirement: string;
}

/** Special weather event definition. */
export interface WeatherEvent {
  id: string;
  label: string;
  description: string;
  weather: WeatherType;
  durationMs: number;
  scoreBonus: number;
  isRare: boolean;
  active: boolean;
  startedAt: number | null;
}

/** Seasonal weather probabilities. */
export interface SeasonalWeather {
  season: Season;
  probabilities: Partial<Record<WeatherType, number>>;
}

/** Season bonus applied to gameplay. */
export interface SeasonBonus {
  season: Season;
  scoreMultiplier: number;
  description: string;
  specialEffect: string;
}

/** Ambient sound suggestion for a weather type. */
export interface AmbientSound {
  type: WeatherType;
  sounds: string[];
  volume: number;
  loop: boolean;
  fadeInMs: number;
  fadeOutMs: number;
}

/** Particle effect configuration. */
export interface ParticleConfig {
  type: string;
  color: string;
  count: number;
  sizeRange: [number, number];
  speedRange: [number, number];
  direction: string;
  opacity: number;
  lifetimeMs: number;
}

/** CSS overlay configuration for the weather. */
export interface WeatherOverlay {
  backgroundColor: string;
  blur: number;
  opacity: number;
  gradientDirection: string;
  animationName: string;
  zIndex: number;
}

/** UI card for weather display. */
export interface WeatherCard {
  type: WeatherType;
  label: string;
  icon: string;
  modifiers: WeatherModifiers;
  remainingMs: number;
  intensity: number;
  tips: string[];
}

/** UI card for season display. */
export interface SeasonCard {
  season: Season;
  label: string;
  icon: string;
  bonus: SeasonBonus;
  weatherProbabilities: Partial<Record<WeatherType, number>>;
  nextSeasonAt: number;
}

/** Leaderboard entry. */
export interface WeatherLeaderboardEntry {
  score: number;
  weather: WeatherType;
  date: string;
  wordsCollected: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_PREFIX = "ws_weather_";

const WEATHER_LABELS: Record<WeatherType, string> = {
  sunny: "Sunny",
  rainy: "Rainy",
  snowy: "Snowy",
  foggy: "Foggy",
  stormy: "Stormy",
  windy: "Windy",
  aurora: "Aurora",
  sandstorm: "Sandstorm",
  blizzard: "Blizzard",
  rainbow: "Rainbow",
  eclipse: "Eclipse",
  meteor_shower: "Meteor Shower",
};

const WEATHER_ICONS: Record<WeatherType, string> = {
  sunny: "☀️",
  rainy: "🌧️",
  snowy: "❄️",
  foggy: "🌫️",
  stormy: "⛈️",
  windy: "💨",
  aurora: "🌌",
  sandstorm: "🏜️",
  blizzard: "🌨️",
  rainbow: "🌈",
  eclipse: "🌑",
  meteor_shower: "☄️",
};

const ALL_WEATHER_TYPES: WeatherType[] = [
  "sunny",
  "rainy",
  "snowy",
  "foggy",
  "stormy",
  "windy",
  "aurora",
  "sandstorm",
  "blizzard",
  "rainbow",
  "eclipse",
  "meteor_shower",
];

const DEFAULT_MODIFIERS: WeatherModifiers = {
  speedMultiplier: 1,
  visibilityMultiplier: 1,
  scoreMultiplier: 1,
  timeAdjustmentMs: 0,
};

/** Default gameplay modifiers for every weather type. */
const WEATHER_MODIFIERS: Record<WeatherType, WeatherModifiers> = {
  sunny: { speedMultiplier: 1.0, visibilityMultiplier: 1.0, scoreMultiplier: 1.0, timeAdjustmentMs: 0 },
  rainy: { speedMultiplier: 0.9, visibilityMultiplier: 0.85, scoreMultiplier: 1.1, timeAdjustmentMs: 200 },
  snowy: { speedMultiplier: 0.8, visibilityMultiplier: 0.75, scoreMultiplier: 1.2, timeAdjustmentMs: 500 },
  foggy: { speedMultiplier: 0.95, visibilityMultiplier: 0.6, scoreMultiplier: 1.15, timeAdjustmentMs: 300 },
  stormy: { speedMultiplier: 1.15, visibilityMultiplier: 0.7, scoreMultiplier: 1.3, timeAdjustmentMs: -200 },
  windy: { speedMultiplier: 1.1, visibilityMultiplier: 0.9, scoreMultiplier: 1.05, timeAdjustmentMs: -100 },
  aurora: { speedMultiplier: 1.0, visibilityMultiplier: 1.1, scoreMultiplier: 1.4, timeAdjustmentMs: 0 },
  sandstorm: { speedMultiplier: 0.85, visibilityMultiplier: 0.5, scoreMultiplier: 1.25, timeAdjustmentMs: 400 },
  blizzard: { speedMultiplier: 0.7, visibilityMultiplier: 0.45, scoreMultiplier: 1.5, timeAdjustmentMs: 600 },
  rainbow: { speedMultiplier: 1.0, visibilityMultiplier: 1.0, scoreMultiplier: 1.2, timeAdjustmentMs: 0 },
  eclipse: { speedMultiplier: 1.2, visibilityMultiplier: 0.55, scoreMultiplier: 1.35, timeAdjustmentMs: -300 },
  meteor_shower: { speedMultiplier: 1.1, visibilityMultiplier: 0.8, scoreMultiplier: 1.5, timeAdjustmentMs: -150 },
};

/** Visual configs keyed by weather type. */
const WEATHER_VISUALS: Record<WeatherType, WeatherVisualConfig> = {
  sunny:         { backgroundColor: "#fef9c3", particleType: "sparkle",       particleColor: "#fbbf24", particleCount: 12,  overlayOpacity: 0.05, overlayColor: "#fde68a", animationSpeed: 1.0 },
  rainy:         { backgroundColor: "#1e293b", particleType: "raindrop",       particleColor: "#7dd3fc", particleCount: 80,  overlayOpacity: 0.2,  overlayColor: "#1e3a5f", animationSpeed: 1.5 },
  snowy:         { backgroundColor: "#f1f5f9", particleType: "snowflake",      particleColor: "#e2e8f0", particleCount: 60,  overlayOpacity: 0.15, overlayColor: "#cbd5e1", animationSpeed: 0.6 },
  foggy:         { backgroundColor: "#94a3b8", particleType: "fog",            particleColor: "#cbd5e1", particleCount: 20,  overlayOpacity: 0.45, overlayColor: "#64748b", animationSpeed: 0.3 },
  stormy:        { backgroundColor: "#0f172a", particleType: "lightning",      particleColor: "#facc15", particleCount: 6,   overlayOpacity: 0.35, overlayColor: "#1e293b", animationSpeed: 2.0 },
  windy:         { backgroundColor: "#dbeafe", particleType: "leaf",           particleColor: "#4ade80", particleCount: 30,  overlayOpacity: 0.08, overlayColor: "#bfdbfe", animationSpeed: 1.8 },
  aurora:        { backgroundColor: "#0c0a1a", particleType: "aurora",         particleColor: "#a78bfa", particleCount: 40,  overlayOpacity: 0.25, overlayColor: "#4c1d95", animationSpeed: 0.4 },
  sandstorm:     { backgroundColor: "#d97706", particleType: "sand",           particleColor: "#fbbf24", particleCount: 100, overlayOpacity: 0.5,  overlayColor: "#92400e", animationSpeed: 2.2 },
  blizzard:      { backgroundColor: "#e0f2fe", particleType: "blizzard_snow",  particleColor: "#ffffff", particleCount: 120, overlayOpacity: 0.55, overlayColor: "#bfdbfe", animationSpeed: 2.5 },
  rainbow:       { backgroundColor: "#fdf2f8", particleType: "rainbow_arc",    particleColor: "#f472b6", particleCount: 25,  overlayOpacity: 0.1,  overlayColor: "#fce7f3", animationSpeed: 0.7 },
  eclipse:       { backgroundColor: "#0a0a0f", particleType: "shadow",         particleColor: "#1e1b4b", particleCount: 15,  overlayOpacity: 0.6,  overlayColor: "#000000", animationSpeed: 0.5 },
  meteor_shower: { backgroundColor: "#020617", particleType: "meteor",         particleColor: "#fb923c", particleCount: 18,  overlayOpacity: 0.3,  overlayColor: "#1c1917", animationSpeed: 1.6 },
};

/** Seasonal weather probability weights. */
const SEASONAL_WEATHERS: Record<Season, Partial<Record<WeatherType, number>>> = {
  spring: { sunny: 30, rainy: 25, windy: 20, rainbow: 10, foggy: 10, stormy: 5 },
  summer: { sunny: 40, stormy: 15, sandstorm: 10, rainbow: 10, windy: 10, meteor_shower: 5, aurora: 5, foggy: 5 },
  fall: { foggy: 25, rainy: 20, windy: 25, sunny: 15, stormy: 10, aurora: 5 },
  winter: { snowy: 35, blizzard: 15, foggy: 15, aurora: 15, sunny: 10, windy: 5, eclipse: 5 },
};

/** Season bonus definitions. */
const SEASON_BONUSES: Record<Season, SeasonBonus> = {
  spring: { season: "spring", scoreMultiplier: 1.05, description: "Words bloom faster", specialEffect: "bonus_words" },
  summer: { season: "summer", scoreMultiplier: 1.1, description: "Solar energy boost", specialEffect: "speed_boost" },
  fall: { season: "fall", scoreMultiplier: 1.08, description: "Harvest word rewards", specialEffect: "double_collect" },
  winter: { season: "winter", scoreMultiplier: 1.15, description: "Frozen score preservation", specialEffect: "shield_words" },
};

/** Ambient sound configurations. */
const AMBIENT_SOUNDS: Record<WeatherType, AmbientSound> = {
  sunny:         { type: "sunny",         sounds: ["birds_chirping", "gentle_breeze"],          volume: 0.3,  loop: true, fadeInMs: 1000,  fadeOutMs: 800 },
  rainy:         { type: "rainy",         sounds: ["rain_on_roof", "distant_thunder"],          volume: 0.5,  loop: true, fadeInMs: 1500,  fadeOutMs: 1000 },
  snowy:         { type: "snowy",         sounds: ["wind_howl_soft", "crunch_snow"],            volume: 0.25, loop: true, fadeInMs: 1200,  fadeOutMs: 900 },
  foggy:         { type: "foggy",         sounds: ["muffled_ambient", "distant_horn"],          volume: 0.2,  loop: true, fadeInMs: 2000,  fadeOutMs: 1500 },
  stormy:        { type: "stormy",        sounds: ["heavy_rain", "thunder_crack", "wind_gust"], volume: 0.7,  loop: true, fadeInMs: 500,   fadeOutMs: 800 },
  windy:         { type: "windy",         sounds: ["strong_wind", "leaves_rustling"],          volume: 0.45, loop: true, fadeInMs: 1000,  fadeOutMs: 700 },
  aurora:        { type: "aurora",        sounds: ["ethereal_hum", "crystal_chime"],           volume: 0.2,  loop: true, fadeInMs: 3000,  fadeOutMs: 2000 },
  sandstorm:     { type: "sandstorm",     sounds: ["sand_blasting", "distant_wind"],            volume: 0.6,  loop: true, fadeInMs: 800,   fadeOutMs: 600 },
  blizzard:      { type: "blizzard",      sounds: ["howling_wind", "ice_crackle"],              volume: 0.65, loop: true, fadeInMs: 600,   fadeOutMs: 800 },
  rainbow:       { type: "rainbow",       sounds: ["light_rain_ceasing", "bird_song"],          volume: 0.25, loop: true, fadeInMs: 2000,  fadeOutMs: 1500 },
  eclipse:       { type: "eclipse",       sounds: ["eerie_silence", "deep_rumble"],            volume: 0.3,  loop: true, fadeInMs: 3000,  fadeOutMs: 2000 },
  meteor_shower: { type: "meteor_shower", sounds: ["whoosh_streak", "distant_impact"],          volume: 0.5,  loop: true, fadeInMs: 1000,  fadeOutMs: 1200 },
};

/** Achievement definitions. */
const ACHIEVEMENT_DEFS: WeatherAchievement[] = [
  { id: "w_sunny_10", label: "Sun Worshipper",    description: "Play 10 games in sunny weather",             icon: "☀️", unlocked: false, unlockedAt: null, requirement: "10 sunny games" },
  { id: "w_storm_5",  label: "Storm Chaser",       description: "Play 5 games during a storm",                icon: "⛈️", unlocked: false, unlockedAt: null, requirement: "5 stormy games" },
  { id: "w_aurora_3", label: "Aurora Witness",     description: "Play 3 games under the aurora",              icon: "🌌", unlocked: false, unlockedAt: null, requirement: "3 aurora games" },
  { id: "w_blizzard", label: "Blizzard Master",    description: "Score 500+ in a blizzard",                   icon: "🌨️", unlocked: false, unlockedAt: null, requirement: "500+ in blizzard" },
  { id: "w_all_weather", label: "Weather Explorer", description: "Play at least one game in every weather type", icon: "🌍", unlocked: false, unlockedAt: null, requirement: "all weather types played" },
  { id: "w_rare_3",  label: "Rare Phenomenon",    description: "Experience 3 rare weather events",            icon: "✨", unlocked: false, unlockedAt: null, requirement: "3 rare events" },
  { id: "w_streak_7", label: "Persistent Player",  description: "Maintain a 7-game weather streak",            icon: "🔥", unlocked: false, unlockedAt: null, requirement: "7-game streak" },
  { id: "w_eclipse_500", label: "Darkness Conqueror", description: "Score 500+ during an eclipse",            icon: "🌑", unlocked: false, unlockedAt: null, requirement: "500+ in eclipse" },
  { id: "w_meteor_1000", label: "Meteor Surge",    description: "Score 1000+ during a meteor shower",         icon: "☄️", unlocked: false, unlockedAt: null, requirement: "1000+ in meteor_shower" },
  { id: "w_seasonal_4", label: "Full Year",         description: "Play during all four seasons",               icon: "📅", unlocked: false, unlockedAt: null, requirement: "all 4 seasons played" },
];

/** Weather event definitions. */
const WEATHER_EVENTS: WeatherEvent[] = [
  { id: "golden_hour",     label: "Golden Hour",          description: "A rare sunny boost with +50% score",       weather: "sunny",         durationMs: 120000, scoreBonus: 1.5, isRare: true,  active: false, startedAt: null },
  { id: "monsoon",         label: "Monsoon Surge",          description: "Extreme rain with doubled word spawns",   weather: "rainy",         durationMs: 90000,  scoreBonus: 1.3, isRare: false, active: false, startedAt: null },
  { id: "whiteout",        label: "Whiteout",               description: "Near-zero visibility, triple score",       weather: "blizzard",      durationMs: 60000,  scoreBonus: 2.0, isRare: true,  active: false, startedAt: null },
  { id: "northern_lights", label: "Northern Lights Gala",   description: "Aurora intensifies with collectibles",     weather: "aurora",        durationMs: 150000, scoreBonus: 1.8, isRare: true,  active: false, startedAt: null },
  { id: "dust_devil",       label: "Dust Devil",             description: "Speed wind event with teleporting words", weather: "sandstorm",     durationMs: 75000,  scoreBonus: 1.4, isRare: false, active: false, startedAt: null },
  { id: "blood_moon",      label: "Blood Moon Eclipse",     description: "Eclipse with red overlay and +100% score",weather: "eclipse",       durationMs: 100000, scoreBonus: 2.0, isRare: true,  active: false, startedAt: null },
  { id: "shower_storm",    label: "Meteor Festival",        description: "Intense meteor shower with bonus words",  weather: "meteor_shower", durationMs: 110000, scoreBonus: 1.6, isRare: true,  active: false, startedAt: null },
  { id: "spring_bloom",    label: "Spring Bloom",           description: "Extra word spawns in sunny spring weather",weather: "sunny",         durationMs: 130000, scoreBonus: 1.2, isRare: false, active: false, startedAt: null },
];

/** Recommended strategies per weather type. */
const WEATHER_TIPS: Record<WeatherType, string[]> = {
  sunny: ["Clear visibility — focus on speed", "No penalties, great for learning", "Ideal for combo chains"],
  rainy: ["Visibility slightly reduced", "Score boosted 10% — capitalize", "Slightly slower pace benefits planning"],
  snowy: ["Significant speed reduction", "Plan your path further ahead", "High score multiplier rewards patience"],
  foggy: ["Visibility heavily reduced", "Use sound cues to locate words", "High score multiplier compensates difficulty"],
  stormy: ["Lightning may reveal hidden words", "Increased speed requires quick reflexes", "Best for experienced players"],
  windy: ["Words may drift sideways", "Anticipate movement direction", "Mild score bonus for adaptation"],
  aurora: ["Rare weather — enjoy the visuals", "Highest base score multiplier", "Visibility slightly enhanced"],
  sandstorm: ["Very low visibility", "Navigate by memory", "Excellent score rewards for skilled players"],
  blizzard: ["Extreme conditions", "Speed greatly reduced", "Maximum score multiplier for survivors"],
  rainbow: ["Celebratory weather", "Balanced modifiers with bonus", "Great for relaxed high-score runs"],
  eclipse: ["Dark atmosphere", "Speed slightly increased", "Rare — high score potential"],
  meteor_shower: ["Unique particle effects", "Words may flash briefly", "Rare with top-tier score multiplier"],
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function storageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(storageKey(key));
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSetJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(storageKey(key), JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently ignore.
  }
}

function generateDefaultState(): WeatherState {
  return {
    type: "sunny",
    intensity: 0.7,
    startedAt: Date.now(),
    durationMs: 180_000,
    modifiers: { ...WEATHER_MODIFIERS.sunny },
  };
}

function generateForecast(state: WeatherState, count: number): ForecastEntry[] {
  const season = getWeatherSeason();
  const probs = SEASONAL_WEATHERS[season] ?? {};
  const entries: ForecastEntry[] = [];
  let cursor = state.startedAt + state.durationMs;

  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    let cumulative = 0;
    let chosen: WeatherType = "sunny";
    for (const w of ALL_WEATHER_TYPES) {
      cumulative += (probs[w] ?? 2) / 100;
      if (roll <= cumulative) {
        chosen = w;
        break;
      }
    }
    const dur = 90_000 + Math.floor(Math.random() * 180_000);
    entries.push({
      type: chosen,
      estimatedStart: cursor,
      durationMs: dur,
      intensity: 0.3 + Math.random() * 0.7,
    });
    cursor += dur;
  }

  return entries;
}

function getRareTypes(): WeatherType[] {
  return ["aurora", "eclipse", "meteor_shower", "blizzard", "sandstorm"];
}

// ---------------------------------------------------------------------------
// Exported functions (35)
// ---------------------------------------------------------------------------

/** 1. getWeatherState — Current weather state with type, intensity, timing, and modifiers. */
export function getWeatherState(): WeatherState {
  return safeGetJSON<WeatherState>("current", generateDefaultState());
}

/** 2. setWeather — Manually set weather type. Resets duration/timestamp, persists to localStorage. @param type */
export function setWeather(type: WeatherType): WeatherState {
  const state: WeatherState = {
    type,
    intensity: 0.5 + Math.random() * 0.5,
    startedAt: Date.now(),
    durationMs: 90_000 + Math.floor(Math.random() * 180_000),
    modifiers: { ...WEATHER_MODIFIERS[type] },
  };
  safeSetJSON("current", state);
  appendHistory(type, state.durationMs);
  return state;
}

/** 3. getAvailableWeathers — All 12 weather types with labels and icons. */
export function getAvailableWeathers(): { type: WeatherType; label: string; icon: string }[] {
  return ALL_WEATHER_TYPES.map((t) => ({
    type: t,
    label: WEATHER_LABELS[t],
    icon: WEATHER_ICONS[t],
  }));
}

/** 4. getWeatherForecast — Next 5 upcoming weather changes based on seasonal probabilities. */
export function getWeatherForecast(): ForecastEntry[] {
  const state = getWeatherState();
  return generateForecast(state, 5);
}

/** 5. advanceWeather — Advance to the next weather in the forecast. */
export function advanceWeather(): WeatherState {
  const forecast = getWeatherForecast();
  if (forecast.length === 0) {
    return setWeather("sunny");
  }
  const next = forecast[0];
  const state: WeatherState = {
    type: next.type,
    intensity: next.intensity,
    startedAt: Date.now(),
    durationMs: next.durationMs,
    modifiers: { ...WEATHER_MODIFIERS[next.type] },
  };
  safeSetJSON("current", state);
  safeSetJSON("forecast", forecast.slice(1));
  appendHistory(next.type, next.durationMs);
  return state;
}

/** 6. getWeatherDuration — Remaining ms before current weather transitions. */
export function getWeatherDuration(): number {
  const state = getWeatherState();
  const elapsed = Date.now() - state.startedAt;
  return Math.max(0, state.durationMs - elapsed);
}

/** 7. getWeatherModifiers — Speed, visibility, and score multipliers for current weather + season. */
export function getWeatherModifiers(): WeatherModifiers {
  const state = getWeatherState();
  const seasonBonus = getSeasonBonus();
  const base = { ...state.modifiers };
  base.scoreMultiplier *= seasonBonus.scoreMultiplier;
  return base;
}

/** 8. getWeatherVisualConfig — Visual config: bg color, particles, overlay, animation speed. */
export function getWeatherVisualConfig(): WeatherVisualConfig {
  const state = getWeatherState();
  return WEATHER_VISUALS[state.type] ?? WEATHER_VISUALS.sunny;
}

/** 9. isWeatherActive — Check if a specific weather type is currently active. @param type */
export function isWeatherActive(type: WeatherType): boolean {
  const state = getWeatherState();
  return state.type === type;
}

/** 10. getWeatherHistory — Recorded weather changes, most recent first (max 100). */
export function getWeatherHistory(): WeatherHistoryEntry[] {
  return safeGetJSON<WeatherHistoryEntry[]>("history", []);
}

/**
 * Internal: append a weather change to the history log.
 */
function appendHistory(type: WeatherType, durationMs: number): void {
  const history = getWeatherHistory();
  history.unshift({ type, timestamp: Date.now(), durationMs });
  if (history.length > 100) history.length = 100;
  safeSetJSON("history", history);
}

/** 11. getWeatherStats — Per-weather aggregate stats (time, games, scores). */
export function getWeatherStats(): Record<WeatherType, WeatherStatEntry> {
  const base: Record<string, WeatherStatEntry> = {};
  for (const w of ALL_WEATHER_TYPES) {
    base[w] = { totalTimeMs: 0, gamesPlayed: 0, bestScore: 0, totalScore: 0 };
  }
  return safeGetJSON<Record<WeatherType, WeatherStatEntry>>("stats", base as Record<WeatherType, WeatherStatEntry>);
}

/** 12. getWeatherAchievements — All weather achievements with unlock status. */
export function getWeatherAchievements(): WeatherAchievement[] {
  const saved = safeGetJSON<WeatherAchievement[]>("achievements", ACHIEVEMENT_DEFS);
  // Merge in any new achievement definitions not yet in storage.
  const ids = new Set(saved.map((a) => a.id));
  for (const def of ACHIEVEMENT_DEFS) {
    if (!ids.has(def.id)) {
      saved.push({ ...def });
    }
  }
  return saved;
}

/** 13. checkWeatherAchievements — Evaluate and unlock any completed weather achievements. */
export function checkWeatherAchievements(): WeatherAchievement[] {
  const achievements = getWeatherAchievements();
  const stats = getWeatherStats();
  const seasonsPlayed = safeGetJSON<Season[]>("seasons_played", []);

  for (const ach of achievements) {
    if (ach.unlocked) continue;
    let met = false;

    switch (ach.id) {
      case "w_sunny_10":
        met = (stats.sunny?.gamesPlayed ?? 0) >= 10;
        break;
      case "w_storm_5":
        met = (stats.stormy?.gamesPlayed ?? 0) >= 5;
        break;
      case "w_aurora_3":
        met = (stats.aurora?.gamesPlayed ?? 0) >= 3;
        break;
      case "w_blizzard":
        met = (stats.blizzard?.bestScore ?? 0) >= 500;
        break;
      case "w_all_weather":
        met = ALL_WEATHER_TYPES.every((w) => (stats[w]?.gamesPlayed ?? 0) >= 1);
        break;
      case "w_rare_3": {
        const rareCount = getRareTypes().reduce((sum, w) => sum + (stats[w]?.gamesPlayed ?? 0), 0);
        met = rareCount >= 3;
        break;
      }
      case "w_streak_7":
        met = getWeatherStreak().streak >= 7;
        break;
      case "w_eclipse_500":
        met = (stats.eclipse?.bestScore ?? 0) >= 500;
        break;
      case "w_meteor_1000":
        met = (stats.meteor_shower?.bestScore ?? 0) >= 1000;
        break;
      case "w_seasonal_4":
        met = ["spring", "summer", "fall", "winter"].every((s) => seasonsPlayed.includes(s as Season));
        break;
    }

    if (met) {
      ach.unlocked = true;
      ach.unlockedAt = Date.now();
    }
  }

  safeSetJSON("achievements", achievements);
  return achievements;
}

/** 14. getWeatherEvents — All special weather events with active status. */
export function getWeatherEvents(): WeatherEvent[] {
  const saved = safeGetJSON<WeatherEvent[]>("events", WEATHER_EVENTS);
  // Ensure all definitions are present.
  const ids = new Set(saved.map((e) => e.id));
  for (const def of WEATHER_EVENTS) {
    if (!ids.has(def.id)) saved.push({ ...def });
  }
  return saved;
}

/** 15. getActiveEvent — Currently active weather event, or null if none. */
export function getActiveEvent(): WeatherEvent | null {
  const events = getWeatherEvents();
  const active = events.find((e) => e.active && e.startedAt !== null);
  if (!active || active.startedAt === null) return null;

  const elapsed = Date.now() - active.startedAt;
  if (elapsed > active.durationMs) {
    // Event has expired — deactivate.
    active.active = false;
    active.startedAt = null;
    safeSetJSON("events", events);
    return null;
  }

  return active;
}

/** 16. startEvent — Trigger a weather event by ID. @param eventId */
export function startEvent(eventId: string): WeatherEvent | null {
  const events = getWeatherEvents();
  const ev = events.find((e) => e.id === eventId);
  if (!ev) return null;

  ev.active = true;
  ev.startedAt = Date.now();
  safeSetJSON("events", events);
  setWeather(ev.weather);
  return ev;
}

/** 17. getWeatherSeason — Current in-game season (Spring/Summer/Fall/Winter). */
export function getWeatherSeason(): Season {
  const override = safeGetJSON<Season | null>("season_override", null);
  if (override) return override;

  const month = new Date().getMonth(); // 0-indexed
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

/** 18. getSeasonalWeather — Weather probability distribution for current season. */
export function getSeasonalWeather(): SeasonalWeather {
  const season = getWeatherSeason();
  return { season, probabilities: SEASONAL_WEATHERS[season] ?? {} };
}

/** 19. getSeasonBonus — Season-specific score multiplier and special effect. */
export function getSeasonBonus(): SeasonBonus {
  const season = getWeatherSeason();
  return SEASON_BONUSES[season];
}

/** 20. getDayNightCycle — Day/night cycle config with current period and next transition ms. */
export function getDayNightCycle(): {
  current: TimeOfDay;
  next: TimeOfDay;
  nextTransitionMs: number;
} {
  const current = getTimeOfDay();
  const order: TimeOfDay[] = ["dawn", "day", "dusk", "night"];
  const idx = order.indexOf(current);
  const next = order[(idx + 1) % 4];

  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  let transitionMs = 0;

  // Approximate remaining ms to next transition.
  switch (current) {
    case "dawn":
      transitionMs = ((8 - hour) * 60 + (0 - minute)) * 60_000;
      break;
    case "day":
      transitionMs = ((17 - hour) * 60 + (0 - minute)) * 60_000;
      break;
    case "dusk":
      transitionMs = ((20 - hour) * 60 + (0 - minute)) * 60_000;
      break;
    case "night":
      transitionMs = ((28 - hour) * 60 + (0 - minute)) * 60_000; // wraps past midnight
      break;
  }

  return { current, next, nextTransitionMs: Math.max(0, transitionMs) };
}

/** 21. getTimeOfDay — Current time period (dawn/day/dusk/night). */
export function getTimeOfDay(): TimeOfDay {
  const override = safeGetJSON<TimeOfDay | null>("timeofday_override", null);
  if (override) return override;

  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

/** 22. getAmbientSounds — Ambient sound config for a weather type. @param type */
export function getAmbientSounds(type: WeatherType): AmbientSound {
  return AMBIENT_SOUNDS[type] ?? AMBIENT_SOUNDS.sunny;
}

/** 23. getWeatherParticles — Particle effect config for current weather. */
export function getWeatherParticles(): ParticleConfig {
  const state = getWeatherState();
  const vis = WEATHER_VISUALS[state.type];

  const c = vis.particleColor;
  const n = vis.particleCount;
  const configs: Record<string, ParticleConfig> = {
    sparkle:       { type: "sparkle",       color: c, count: n, sizeRange: [2, 5],   speedRange: [0.2, 0.6],  direction: "random",        opacity: 0.7, lifetimeMs: 3000 },
    raindrop:      { type: "raindrop",      color: c, count: n, sizeRange: [1, 3],   speedRange: [4, 8],     direction: "down",           opacity: 0.5, lifetimeMs: 1500 },
    snowflake:     { type: "snowflake",     color: c, count: n, sizeRange: [2, 6],   speedRange: [0.5, 1.5], direction: "down-sway",      opacity: 0.8, lifetimeMs: 5000 },
    fog:           { type: "fog",           color: c, count: n, sizeRange: [30, 60], speedRange: [0.1, 0.3], direction: "horizontal",    opacity: 0.3, lifetimeMs: 8000 },
    lightning:     { type: "lightning",     color: c, count: n, sizeRange: [1, 2],   speedRange: [10, 20],   direction: "down",           opacity: 1.0, lifetimeMs: 200 },
    leaf:          { type: "leaf",          color: c, count: n, sizeRange: [4, 8],   speedRange: [1, 3],     direction: "right-sway",     opacity: 0.9, lifetimeMs: 4000 },
    aurora:        { type: "aurora",        color: c, count: n, sizeRange: [10, 30], speedRange: [0.05, 0.2], direction: "wave",           opacity: 0.4, lifetimeMs: 10000 },
    sand:          { type: "sand",          color: c, count: n, sizeRange: [1, 4],   speedRange: [3, 7],     direction: "right",          opacity: 0.6, lifetimeMs: 2500 },
    blizzard_snow: { type: "blizzard_snow", color: c, count: n, sizeRange: [1, 4],   speedRange: [5, 10],    direction: "diagonal-right", opacity: 0.7, lifetimeMs: 2000 },
    rainbow_arc:   { type: "rainbow_arc",   color: c, count: n, sizeRange: [3, 6],   speedRange: [0.1, 0.3], direction: "arc",            opacity: 0.5, lifetimeMs: 6000 },
    shadow:        { type: "shadow",        color: c, count: n, sizeRange: [20, 40], speedRange: [0.1, 0.4], direction: "expand",         opacity: 0.3, lifetimeMs: 7000 },
    meteor:        { type: "meteor",        color: c, count: n, sizeRange: [2, 5],   speedRange: [6, 12],    direction: "diagonal-down",  opacity: 0.9, lifetimeMs: 1200 },
  };

  return configs[vis.particleType] ?? configs.sparkle;
}

/** 24. getWeatherOverlay — CSS overlay config (color, blur, opacity, gradient, z-index). */
export function getWeatherOverlay(): WeatherOverlay {
  const vis = getWeatherVisualConfig();
  const tod = getTimeOfDay();

  const bg = vis.overlayColor;
  const op = vis.overlayOpacity;
  const overlays: Record<string, WeatherOverlay> = {
    sparkle:       { backgroundColor: bg, blur: 0,  opacity: op, gradientDirection: "radial",          animationName: "sparkle-pulse",   zIndex: 10 },
    raindrop:      { backgroundColor: bg, blur: 2,  opacity: op, gradientDirection: "to bottom",        animationName: "rain-streak",     zIndex: 10 },
    snowflake:     { backgroundColor: bg, blur: 1,  opacity: op, gradientDirection: "to bottom",        animationName: "snow-fall",       zIndex: 10 },
    fog:           { backgroundColor: bg, blur: 8,  opacity: op, gradientDirection: "radial",          animationName: "fog-drift",       zIndex: 15 },
    lightning:     { backgroundColor: bg, blur: 0,  opacity: op, gradientDirection: "radial",          animationName: "lightning-flash", zIndex: 20 },
    leaf:          { backgroundColor: bg, blur: 0,  opacity: op, gradientDirection: "to right",         animationName: "leaf-blow",       zIndex: 5 },
    aurora:        { backgroundColor: bg, blur: 4,  opacity: op, gradientDirection: "to bottom",        animationName: "aurora-wave",      zIndex: 12 },
    sand:          { backgroundColor: bg, blur: 3,  opacity: op, gradientDirection: "to right",         animationName: "sand-blast",      zIndex: 15 },
    blizzard_snow: { backgroundColor: bg, blur: 6,  opacity: op, gradientDirection: "diagonal",         animationName: "blizzard-swirl",  zIndex: 18 },
    rainbow_arc:   { backgroundColor: bg, blur: 1,  opacity: op, gradientDirection: "diagonal",         animationName: "rainbow-shimmer", zIndex: 8 },
    shadow:        { backgroundColor: bg, blur: 10, opacity: op, gradientDirection: "radial",          animationName: "shadow-pulse",    zIndex: 20 },
    meteor:        { backgroundColor: bg, blur: 2,  opacity: op, gradientDirection: "to bottom-right",  animationName: "meteor-trail",    zIndex: 10 },
  };

  const overlay = overlays[vis.particleType] ?? overlays.sparkle;

  // Adjust opacity for nighttime.
  if (tod === "night") {
    overlay.opacity = Math.min(1, overlay.opacity + 0.1);
  }

  return overlay;
}

/** 25. getWeatherMultiplier — Effective score multiplier (weather + season + event). */
export function getWeatherMultiplier(): number {
  const modifiers = getWeatherModifiers();
  const event = getActiveEvent();
  let mult = modifiers.scoreMultiplier;
  if (event) {
    mult *= event.scoreBonus;
  }
  return Math.round(mult * 100) / 100;
}

/** 26. getWeatherStreak — Consecutive-game streak in same weather. */
export function getWeatherStreak(): { weather: WeatherType; streak: number } {
  return safeGetJSON<{ weather: WeatherType; streak: number }>("streak", { weather: "sunny", streak: 0 });
}

/** 27. getWeatherRecords — Best scores per weather type. */
export function getWeatherRecords(): Record<WeatherType, number> {
  return safeGetJSON<Record<WeatherType, number>>("records", {} as Record<WeatherType, number>);
}

/** 28. recordWeatherGame — Record a game result. Updates stats, streaks, records, leaderboard. @param weather @param score */
export function recordWeatherGame(weather: WeatherType, score: number): void {
  // Update stats.
  const stats = getWeatherStats();
  if (!stats[weather]) {
    stats[weather] = { totalTimeMs: 0, gamesPlayed: 0, bestScore: 0, totalScore: 0 };
  }
  stats[weather].gamesPlayed += 1;
  stats[weather].totalScore += score;
  if (score > stats[weather].bestScore) {
    stats[weather].bestScore = score;
  }
  stats[weather].totalTimeMs += getWeatherDuration();
  safeSetJSON("stats", stats);

  // Update streak.
  const streak = getWeatherStreak();
  if (streak.weather === weather) {
    streak.streak += 1;
  } else {
    streak.weather = weather;
    streak.streak = 1;
  }
  safeSetJSON("streak", streak);

  // Update records.
  const records = getWeatherRecords();
  if ((records[weather] ?? 0) < score) {
    records[weather] = score;
  }
  safeSetJSON("records", records);

  // Update leaderboard.
  const lb = getWeatherLeaderboard();
  lb.push({
    score,
    weather,
    date: new Date().toISOString(),
    wordsCollected: 0,
  });
  lb.sort((a, b) => b.score - a.score);
  if (lb.length > 200) lb.length = 200;
  safeSetJSON("leaderboard", lb);

  // Track season.
  const season = getWeatherSeason();
  const played = safeGetJSON<Season[]>("seasons_played", []);
  if (!played.includes(season)) {
    played.push(season);
    safeSetJSON("seasons_played", played);
  }

  // Check achievements.
  checkWeatherAchievements();
}

/** 29. getWeatherLeaderboard — Top scores sorted descending with weather and date. */
export function getWeatherLeaderboard(): WeatherLeaderboardEntry[] {
  return safeGetJSON<WeatherLeaderboardEntry[]>("leaderboard", []);
}

/** 30. getWeatherDashboard — Comprehensive UI dashboard with weather state, forecast, season, modifiers, and more. */
export function getWeatherDashboard() {
  const state = getWeatherState();
  return {
    currentWeather: state,
    forecast: getWeatherForecast(),
    season: getWeatherSeason(),
    seasonBonus: getSeasonBonus(),
    timeOfDay: getTimeOfDay(),
    dayNightCycle: getDayNightCycle(),
    activeEvent: getActiveEvent(),
    modifiers: getWeatherModifiers(),
    visualConfig: getWeatherVisualConfig(),
    multiplier: getWeatherMultiplier(),
    streak: getWeatherStreak(),
    achievements: getWeatherAchievements(),
  };
}

/** 31. getWeatherCard — UI card with current weather label, icon, modifiers, remaining time, and tips. */
export function getWeatherCard(): WeatherCard {
  const state = getWeatherState();
  return {
    type: state.type,
    label: WEATHER_LABELS[state.type],
    icon: WEATHER_ICONS[state.type],
    modifiers: state.modifiers,
    remainingMs: getWeatherDuration(),
    intensity: state.intensity,
    tips: WEATHER_TIPS[state.type] ?? [],
  };
}

/** 32. getForecastTimeline — UI-friendly timeline of upcoming weather with relative time labels. */
export function getForecastTimeline() {
  const forecast = getWeatherForecast();
  const now = Date.now();

  return {
    entries: forecast.map((f) => {
      const diff = f.estimatedStart - now;
      const mins = Math.max(0, Math.round(diff / 60_000));
      const durMins = Math.round(f.durationMs / 60_000);
      let relativeTime: string;
      if (mins < 1) relativeTime = "Now";
      else if (mins < 60) relativeTime = `In ${mins}m`;
      else relativeTime = `In ${Math.round(mins / 60)}h ${mins % 60}m`;

      return {
        type: f.type,
        label: WEATHER_LABELS[f.type],
        icon: WEATHER_ICONS[f.type],
        relativeTime,
        durationLabel: `${durMins}m`,
      };
    }),
  };
}

/** 33. getSeasonCard — UI card with season label, icon, bonus, weather probabilities, and next season time. */
export function getSeasonCard(): SeasonCard {
  const season = getWeatherSeason();
  const seasonIcons: Record<Season, string> = {
    spring: "🌸",
    summer: "🌞",
    fall: "🍂",
    winter: "❄️",
  };
  const seasonLabels: Record<Season, string> = {
    spring: "Spring",
    summer: "Summer",
    fall: "Fall",
    winter: "Winter",
  };

  // Estimate next season change based on current month.
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const seasonBoundaries = [
    { month: 2, day: 20 }, // Spring ~Mar 20
    { month: 5, day: 21 }, // Summer ~Jun 21
    { month: 8, day: 22 }, // Fall ~Sep 22
    { month: 11, day: 21 }, // Winter ~Dec 21
    { month: 14, day: 20 }, // Next Spring (for wrapping)
  ];
  const currentIdx =
    season === "spring" ? 0 : season === "summer" ? 1 : season === "fall" ? 2 : 3;
  const nextBoundary = seasonBoundaries[currentIdx + 1];
  const nextSeasonDate = new Date(
    year + (nextBoundary.month >= 12 ? 1 : 0),
    nextBoundary.month >= 12 ? nextBoundary.month - 12 : nextBoundary.month,
    nextBoundary.day
  );
  const nextSeasonAt = nextSeasonDate.getTime();

  return {
    season,
    label: seasonLabels[season],
    icon: seasonIcons[season],
    bonus: SEASON_BONUSES[season],
    weatherProbabilities: SEASONAL_WEATHERS[season] ?? {},
    nextSeasonAt,
  };
}

/** 34. getWeatherComparison — Comparative performance across all weather types. */
export function getWeatherComparison() {
  const stats = getWeatherStats();
  let maxGames = 0;
  let favWeather: WeatherType = "sunny";
  let maxAvg = 0;
  let highestAvgWeather: WeatherType = "sunny";

  const weathers = ALL_WEATHER_TYPES.map((w) => {
    const s = stats[w] ?? { totalTimeMs: 0, gamesPlayed: 0, bestScore: 0, totalScore: 0 };
    const avgScore = s.gamesPlayed > 0 ? Math.round(s.totalScore / s.gamesPlayed) : 0;
    const totalMins = Math.round(s.totalTimeMs / 60_000);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const totalTimeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    if (s.gamesPlayed > maxGames) {
      maxGames = s.gamesPlayed;
      favWeather = w;
    }
    if (avgScore > maxAvg) {
      maxAvg = avgScore;
      highestAvgWeather = w;
    }

    return {
      type: w,
      label: WEATHER_LABELS[w],
      icon: WEATHER_ICONS[w],
      gamesPlayed: s.gamesPlayed,
      avgScore,
      bestScore: s.bestScore,
      totalTimeLabel,
    };
  });

  return { weathers, favoriteWeather: favWeather, highestAvgWeather };
}

/** 35. getRareWeatherChance — Probability of rare weather based on current season. */
export function getRareWeatherChance() {
  const season = getWeatherSeason();
  const probs = SEASONAL_WEATHERS[season] ?? {};
  const rareTypes = getRareTypes();

  const breakdown: Partial<Record<WeatherType, number>> = {};
  let totalRare = 0;
  let totalAll = 0;

  for (const [w, p] of Object.entries(probs)) {
    const weight = p ?? 0;
    totalAll += weight;
    if (rareTypes.includes(w as WeatherType)) {
      totalRare += weight;
      breakdown[w as WeatherType] = weight / 100;
    }
  }

  const chance = totalAll > 0 ? totalRare / totalAll : 0;

  return {
    chance: Math.round(chance * 1000) / 1000,
    season,
    rareTypes,
    breakdown,
  };
}
