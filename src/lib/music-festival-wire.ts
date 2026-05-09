// ============================================================================
// music-festival-wire.ts — Music Festival Wire Module for Word Snake
// ============================================================================
// SSR-safe state management. No localStorage, window, document, setInterval,
// setTimeout, requestAnimationFrame, or any browser API at module level.
// All exported functions use the `mf` prefix.
// ============================================================================

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

type MusicGenre =
  | "Rock"
  | "Pop"
  | "Jazz"
  | "Electronic"
  | "Classical"
  | "Hip-Hop"
  | "Country"
  | "Metal";

type RarityTier = "common" | "uncommon" | "rare" | "epic" | "legendary";

type ShowRating = "Amateur" | "Decent" | "Good" | "Great" | "Legendary";

type WeatherCondition = "clear" | "rain" | "wind" | "heat" | "storm";

type BandRole =
  | "Vocalist"
  | "Guitarist"
  | "Bassist"
  | "Drummer"
  | "Keyboardist";

type BandSkillName =
  | "Stage Presence"
  | "Harmony"
  | "Rhythm"
  | "Improvisation"
  | "Energy"
  | "Technique";

type MerchCategory = "tshirt" | "poster" | "vinyl" | "accessory" | "digital";

interface Song {
  id: string;
  title: string;
  genre: MusicGenre;
  lyrics: string[];
  difficulty: number; // 1-10
  tempo: number; // BPM
  lengthSeconds: number;
  energyLevel: number; // 1-10
  chordProgression: string[];
  isOriginal: boolean;
  xpReward: number;
}

interface Stage {
  id: string;
  name: string;
  capacity: number;
  reputationRequired: number;
  genrePreference: MusicGenre[];
  isOutdoor: boolean;
  timeSlot: string;
  baseReward: number;
}

interface BandMember {
  name: string;
  role: BandRole;
  skill: number; // 1-100
  morale: number; // 0-100
  fatigue: number; // 0-100
  instrument: string;
}

interface Band {
  name: string;
  members: BandMember[];
  formedTimestamp: number;
  totalPerformances: number;
  coins: number;
  genre: MusicGenre;
}

interface BandSkills {
  "Stage Presence": number;
  Harmony: number;
  Rhythm: number;
  Improvisation: number;
  Energy: number;
  Technique: number;
}

interface InstrumentDef {
  id: string;
  name: string;
  baseStats: { tone: number; volume: number; durability: number };
  rarity: RarityTier;
  cost: number;
  icon: string;
}

interface OwnedInstrument {
  defId: string;
  acquiredTimestamp: number;
  upgradeLevel: number; // 0-4
  equipped: boolean;
}

interface EquipmentDef {
  id: string;
  name: string;
  description: string;
  baseEffect: number;
  maxUpgradeLevel: number;
  upgradeCost: number;
  icon: string;
}

interface OwnedEquipment {
  defId: string;
  currentLevel: number;
  currentEffect: number;
}

interface PerformanceState {
  isActive: boolean;
  stageId: string;
  songIds: string[];
  currentSongIndex: number;
  currentLyricIndex: number;
  score: number;
  combo: number;
  maxCombo: number;
  wordsCorrect: number;
  wordsMissed: number;
  crowdEngagement: number;
  crowdSize: number;
  startTime: number;
  weather: WeatherCondition;
  reputationEarned: number;
  coinsEarned: number;
  xpEarned: number;
}

interface CrowdState {
  engagement: number; // 0-100
  size: number;
  mood: "bored" | "interested" | "excited" | "wild" | "ecstatic";
  chanting: boolean;
  lightersOut: boolean;
  moshPitActive: boolean;
  singalongActive: boolean;
}

interface MusicianLevel {
  level: number; // 1-40
  currentXP: number;
  xpToNext: number;
  totalXP: number;
  title: string;
}

interface FanMilestone {
  fansRequired: number;
  reward: { type: string; amount: number; label: string };
  claimed: boolean;
}

interface FanClub {
  totalFans: number;
  activeFans: number;
  milestones: FanMilestone[];
  recentActivity: string[];
}

interface TourStop {
  id: string;
  name: string;
  location: string;
  distance: number; // km
  challenge: string;
  reward: number;
  completed: boolean;
  completedTimestamp: number | null;
}

interface TourState {
  stops: TourStop[];
  currentStopIndex: number;
  isActive: boolean;
  startDate: number | null;
  completionDate: number | null;
}

interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  reward: { type: string; amount: number };
  unlocked: boolean;
  unlockedTimestamp: number | null;
  progress: number;
  maxProgress: number;
}

interface EncoreState {
  isAvailable: boolean;
  isActive: boolean;
  bonusMultiplier: number;
  bonusXP: number;
  bonusCoins: number;
  songId: string | null;
}

interface MerchItemDef {
  id: string;
  name: string;
  category: MerchCategory;
  basePrice: number;
  stock: number;
  sold: number;
  icon: string;
  description: string;
}

interface MerchBooth {
  items: { defId: string; price: number; stock: number; sold: number }[];
  totalRevenue: number;
  totalItemsSold: number;
}

interface CriticReview {
  criticName: string;
  publication: string;
  rating: number; // 1-5 stars
  headline: string;
  body: string;
  timestamp: number;
  reputationImpact: number;
}

interface FeaturedArtist {
  id: string;
  name: string;
  genre: MusicGenre;
  specialty: BandSkillName;
  bonusMultiplier: number;
  costToCollaborate: number;
  collaborationsRemaining: number;
  icon: string;
  description: string;
}

interface SongFragment {
  word: string;
  syllables: number;
  rhymesWith: string[];
  genre: MusicGenre[];
  mood: "upbeat" | "melancholic" | "intense" | "chill" | "romantic";
}

interface ComposedSong {
  title: string;
  fragments: string[];
  genre: MusicGenre;
  quality: number; // 1-100
  timestamp: number;
}

interface DailyGig {
  dateKey: string;
  stageId: string;
  songSuggestion: string;
  weather: WeatherCondition;
  bonusReward: number;
  completed: boolean;
  completedTimestamp: number | null;
}

interface SetlistEntry {
  songId: string;
  position: number;
  energyTransition: "rise" | "drop" | "sustain";
}

// ---------------------------------------------------------------------------
// Static Data — Music Genres
// ---------------------------------------------------------------------------

const MUSIC_GENRES: MusicGenre[] = [
  "Rock", "Pop", "Jazz", "Electronic",
  "Classical", "Hip-Hop", "Country", "Metal",
];

// ---------------------------------------------------------------------------
// Static Data — Stages
// ---------------------------------------------------------------------------

const STAGES: Stage[] = [
  {
    id: "busking_corner",
    name: "Busking Corner",
    capacity: 50,
    reputationRequired: 0,
    genrePreference: ["Pop", "Acoustic" as unknown as MusicGenre, "Country"],
    isOutdoor: true,
    timeSlot: "Morning",
    baseReward: 10,
  },
  {
    id: "acoustic_tent",
    name: "Acoustic Tent",
    capacity: 200,
    reputationRequired: 50,
    genrePreference: ["Pop", "Jazz", "Country"],
    isOutdoor: false,
    timeSlot: "Afternoon",
    baseReward: 25,
  },
  {
    id: "country_barn",
    name: "Country Barn",
    capacity: 300,
    reputationRequired: 100,
    genrePreference: ["Country", "Rock", "Pop"],
    isOutdoor: false,
    timeSlot: "Afternoon",
    baseReward: 40,
  },
  {
    id: "jazz_lounge",
    name: "Jazz Lounge",
    capacity: 150,
    reputationRequired: 150,
    genrePreference: ["Jazz", "Classical"],
    isOutdoor: false,
    timeSlot: "Evening",
    baseReward: 35,
  },
  {
    id: "classical_hall",
    name: "Classical Hall",
    capacity: 400,
    reputationRequired: 250,
    genrePreference: ["Classical", "Jazz"],
    isOutdoor: false,
    timeSlot: "Evening",
    baseReward: 60,
  },
  {
    id: "underground",
    name: "Underground",
    capacity: 250,
    reputationRequired: 200,
    genrePreference: ["Metal", "Hip-Hop", "Electronic"],
    isOutdoor: false,
    timeSlot: "Night",
    baseReward: 50,
  },
  {
    id: "edm_arena",
    name: "EDM Arena",
    capacity: 2000,
    reputationRequired: 400,
    genrePreference: ["Electronic", "Pop", "Hip-Hop"],
    isOutdoor: false,
    timeSlot: "Night",
    baseReward: 100,
  },
  {
    id: "main_stage",
    name: "Main Stage",
    capacity: 5000,
    reputationRequired: 600,
    genrePreference: MUSIC_GENRES,
    isOutdoor: true,
    timeSlot: "Prime Time",
    baseReward: 250,
  },
];

// ---------------------------------------------------------------------------
// Static Data — 40 Songs
// ---------------------------------------------------------------------------

const SONGS: Song[] = [
  // Rock (5 songs)
  {
    id: "s01", title: "Thunder Road", genre: "Rock",
    lyrics: ["Thunder", "roaring", "down", "the", "highway", "lights", "blazing", "through", "the", "night"],
    difficulty: 4, tempo: 140, lengthSeconds: 240, energyLevel: 8,
    chordProgression: ["E", "A", "B", "E"], isOriginal: true, xpReward: 80,
  },
  {
    id: "s02", title: "Neon Rebellion", genre: "Rock",
    lyrics: ["Neon", "signs", "flicker", "in", "the", "alley", "we", "march", "to", "our", "own", "beat"],
    difficulty: 6, tempo: 160, lengthSeconds: 210, energyLevel: 9,
    chordProgression: ["Am", "F", "C", "G"], isOriginal: true, xpReward: 120,
  },
  {
    id: "s03", title: "Stone Cold Heart", genre: "Rock",
    lyrics: ["Stone", "cold", "heart", "beating", "like", "a", "drum", "in", "the", "dark"],
    difficulty: 5, tempo: 130, lengthSeconds: 200, energyLevel: 7,
    chordProgression: ["D", "G", "A", "D"], isOriginal: true, xpReward: 95,
  },
  {
    id: "s04", title: "Burning Bridges", genre: "Rock",
    lyrics: ["Burning", "all", "the", "bridges", "behind", "us", "there", "is", "no", "turning", "back"],
    difficulty: 7, tempo: 170, lengthSeconds: 250, energyLevel: 9,
    chordProgression: ["Em", "C", "G", "D"], isOriginal: true, xpReward: 140,
  },
  {
    id: "s05", title: "Wildfire", genre: "Rock",
    lyrics: ["Wildfire", "spreading", "cross", "the", "plain", "nothing", "stops", "the", "flame"],
    difficulty: 5, tempo: 145, lengthSeconds: 195, energyLevel: 8,
    chordProgression: ["A", "D", "E", "A"], isOriginal: true, xpReward: 90,
  },
  // Pop (5 songs)
  {
    id: "s06", title: "Sugar Rush", genre: "Pop",
    lyrics: ["Sugar", "rush", "dancing", "through", "the", "summer", "air", "feel", "the", "glow"],
    difficulty: 2, tempo: 120, lengthSeconds: 180, energyLevel: 7,
    chordProgression: ["C", "G", "Am", "F"], isOriginal: true, xpReward: 50,
  },
  {
    id: "s07", title: "Starlight Serenade", genre: "Pop",
    lyrics: ["Under", "the", "starlight", "singing", "a", "serenade", "just", "for", "you", "tonight"],
    difficulty: 3, tempo: 100, lengthSeconds: 220, energyLevel: 5,
    chordProgression: ["G", "Em", "C", "D"], isOriginal: true, xpReward: 60,
  },
  {
    id: "s08", title: "Electric Dreams", genre: "Pop",
    lyrics: ["Electric", "dreams", "flowing", "through", "my", "mind", "every", "single", "night"],
    difficulty: 4, tempo: 128, lengthSeconds: 200, energyLevel: 6,
    chordProgression: ["Am", "F", "C", "G"], isOriginal: true, xpReward: 70,
  },
  {
    id: "s09", title: "Bubblegum Sky", genre: "Pop",
    lyrics: ["Bubblegum", "colored", "sky", "floating", "on", "a", "cloud", "of", "pink", "delight"],
    difficulty: 2, tempo: 115, lengthSeconds: 170, energyLevel: 5,
    chordProgression: ["C", "F", "G", "C"], isOriginal: true, xpReward: 45,
  },
  {
    id: "s10", title: "Midnight Groove", genre: "Pop",
    lyrics: ["Midnight", "groove", "moving", "to", "the", "rhythm", "lose", "yourself", "in", "the", "beat"],
    difficulty: 4, tempo: 110, lengthSeconds: 210, energyLevel: 7,
    chordProgression: ["Dm", "Bb", "F", "C"], isOriginal: true, xpReward: 75,
  },
  // Jazz (5 songs)
  {
    id: "s11", title: "Blue Note Shuffle", genre: "Jazz",
    lyrics: ["Blue", "notes", "drifting", "through", "the", "smoky", "room", "smooth", "and", "mellow"],
    difficulty: 6, tempo: 95, lengthSeconds: 300, energyLevel: 4,
    chordProgression: ["Cm7", "F7", "Bbmaj7", "Ebmaj7"], isOriginal: true, xpReward: 110,
  },
  {
    id: "s12", title: "Swing Era", genre: "Jazz",
    lyrics: ["Swinging", "from", "the", "rafters", "brass", "section", "blazing", "hot"],
    difficulty: 7, tempo: 180, lengthSeconds: 260, energyLevel: 7,
    chordProgression: ["Dm7", "G7", "Cmaj7", "Am7"], isOriginal: true, xpReward: 130,
  },
  {
    id: "s13", title: "Velvet Touch", genre: "Jazz",
    lyrics: ["Velvet", "touch", "upon", "the", "ivory", "keys", "each", "note", "a", "whisper"],
    difficulty: 8, tempo: 72, lengthSeconds: 340, energyLevel: 3,
    chordProgression: ["Fm7", "Bb7", "Ebmaj7", "Abmaj7"], isOriginal: true, xpReward: 150,
  },
  {
    id: "s14", title: "Crescent City", genre: "Jazz",
    lyrics: ["Crescent", "moon", "over", "the", "city", "trumpet", "cries", "in", "the", "night"],
    difficulty: 5, tempo: 105, lengthSeconds: 280, energyLevel: 5,
    chordProgression: ["C7", "F7", "G7", "C7"], isOriginal: true, xpReward: 100,
  },
  {
    id: "s15", title: "After Hours", genre: "Jazz",
    lyrics: ["After", "hours", "the", "real", "music", "begins", "when", "the", "crowd", "goes", "home"],
    difficulty: 7, tempo: 85, lengthSeconds: 320, energyLevel: 4,
    chordProgression: ["Bbm7", "Eb7", "Abmaj7", "Dbmaj7"], isOriginal: true, xpReward: 135,
  },
  // Electronic (5 songs)
  {
    id: "s16", title: "Synthwave Voyager", genre: "Electronic",
    lyrics: ["Riding", "the", "synthwave", "through", "digital", "galaxies", "of", "sound"],
    difficulty: 5, tempo: 128, lengthSeconds: 240, energyLevel: 8,
    chordProgression: ["Am", "F", "C", "G"], isOriginal: true, xpReward: 90,
  },
  {
    id: "s17", title: "Pulse Protocol", genre: "Electronic",
    lyrics: ["Pulse", "racing", "protocol", "engaged", "drop", "the", "bass", "and", "let", "it", "ring"],
    difficulty: 6, tempo: 140, lengthSeconds: 210, energyLevel: 9,
    chordProgression: ["Em", "C", "G", "D"], isOriginal: true, xpReward: 115,
  },
  {
    id: "s18", title: "Digital Rain", genre: "Electronic",
    lyrics: ["Digital", "rain", "falling", "down", "pixels", "dance", "across", "the", "screen"],
    difficulty: 4, tempo: 135, lengthSeconds: 230, energyLevel: 7,
    chordProgression: ["Dm", "Am", "Gm", "C"], isOriginal: true, xpReward: 80,
  },
  {
    id: "s19", title: "Neon Circuit", genre: "Electronic",
    lyrics: ["Neon", "circuits", "firing", "in", "sequence", "binary", "code", "becomes", "a", "melody"],
    difficulty: 7, tempo: 150, lengthSeconds: 200, energyLevel: 8,
    chordProgression: ["Cm", "Ab", "Eb", "Bb"], isOriginal: true, xpReward: 125,
  },
  {
    id: "s20", title: "Laser Grid", genre: "Electronic",
    lyrics: ["Laser", "grid", "illuminates", "the", "dance", "floor", "lose", "control"],
    difficulty: 5, tempo: 145, lengthSeconds: 190, energyLevel: 9,
    chordProgression: ["Fm", "Db", "Ab", "Eb"], isOriginal: true, xpReward: 95,
  },
  // Classical (5 songs)
  {
    id: "s21", title: "Moonlight Sonata Reimagined", genre: "Classical",
    lyrics: ["Moonlight", "cascading", "upon", "still", "waters", "a", "sonata", "of", "pure", "light"],
    difficulty: 8, tempo: 60, lengthSeconds: 360, energyLevel: 3,
    chordProgression: ["C#m", "A", "F#m", "G#"], isOriginal: true, xpReward: 160,
  },
  {
    id: "s22", title: "Orchestral Dawn", genre: "Classical",
    lyrics: ["Dawn", "breaks", "as", "the", "orchestra", "rises", "strings", "and", "winds", "unite"],
    difficulty: 7, tempo: 80, lengthSeconds: 300, energyLevel: 5,
    chordProgression: ["D", "Bm", "G", "A"], isOriginal: true, xpReward: 140,
  },
  {
    id: "s23", title: "Waltz of Shadows", genre: "Classical",
    lyrics: ["Shadows", "waltzing", "through", "the", "grand", "hall", "elegant", "and", "dark"],
    difficulty: 9, tempo: 70, lengthSeconds: 380, energyLevel: 4,
    chordProgression: ["Am", "Dm", "E", "Am"], isOriginal: true, xpReward: 175,
  },
  {
    id: "s24", title: "String Theory", genre: "Classical",
    lyrics: ["Violins", "weave", "a", "tapestry", "of", "sound", "cellos", "ground", "the", "melody"],
    difficulty: 6, tempo: 90, lengthSeconds: 280, energyLevel: 5,
    chordProgression: ["G", "Em", "C", "D"], isOriginal: true, xpReward: 120,
  },
  {
    id: "s25", title: "Piano Forte", genre: "Classical",
    lyrics: ["Ivory", "and", "ebony", "dance", "together", "a", "forte", "of", "emotion"],
    difficulty: 8, tempo: 75, lengthSeconds: 320, energyLevel: 4,
    chordProgression: ["F", "Dm", "Bb", "C"], isOriginal: true, xpReward: 150,
  },
  // Hip-Hop (5 songs)
  {
    id: "s26", title: "Concrete Jungle", genre: "Hip-Hop",
    lyrics: ["Concrete", "jungle", "streets", "alive", "with", "the", "rhythm", "of", "the", "city"],
    difficulty: 6, tempo: 90, lengthSeconds: 200, energyLevel: 7,
    chordProgression: ["Cm", "Ab", "Eb", "G"], isOriginal: true, xpReward: 110,
  },
  {
    id: "s27", title: "Golden Mic", genre: "Hip-Hop",
    lyrics: ["Golden", "microphone", "in", "hand", "words", "cut", "like", "a", "diamond", "blade"],
    difficulty: 7, tempo: 95, lengthSeconds: 210, energyLevel: 8,
    chordProgression: ["Dm", "Bb", "F", "C"], isOriginal: true, xpReward: 130,
  },
  {
    id: "s28", title: "Flow State", genre: "Hip-Hop",
    lyrics: ["Flow", "state", "activated", "mind", "and", "body", "sync", "to", "the", "beat"],
    difficulty: 5, tempo: 85, lengthSeconds: 190, energyLevel: 7,
    chordProgression: ["Am", "Em", "Dm", "Am"], isOriginal: true, xpReward: 90,
  },
  {
    id: "s29", title: "Block Party", genre: "Hip-Hop",
    lyrics: ["Block", "party", "jumping", "speakers", "bumping", "everyone", "is", "moving"],
    difficulty: 4, tempo: 100, lengthSeconds: 180, energyLevel: 8,
    chordProgression: ["G", "C", "D", "Em"], isOriginal: true, xpReward: 75,
  },
  {
    id: "s30", title: "Rhyme Architect", genre: "Hip-Hop",
    lyrics: ["Architect", "of", "rhymes", "building", "verses", "brick", "by", "brick", "word", "by", "word"],
    difficulty: 8, tempo: 88, lengthSeconds: 220, energyLevel: 6,
    chordProgression: ["Fm", "Db", "Ab", "Eb"], isOriginal: true, xpReward: 145,
  },
  // Country (5 songs)
  {
    id: "s31", title: "Dusty Trail", genre: "Country",
    lyrics: ["Dusty", "trail", "winding", "through", "the", "countryside", "home", "is", "calling"],
    difficulty: 3, tempo: 100, lengthSeconds: 220, energyLevel: 4,
    chordProgression: ["G", "C", "D", "G"], isOriginal: true, xpReward: 60,
  },
  {
    id: "s32", title: "Pickup Lines", genre: "Country",
    lyrics: ["Sitting", "on", "the", "tailgate", "stars", "above", "the", "meadow", "bright"],
    difficulty: 2, tempo: 95, lengthSeconds: 200, energyLevel: 3,
    chordProgression: ["C", "F", "G", "C"], isOriginal: true, xpReward: 45,
  },
  {
    id: "s33", title: "Honky Tonk Heroes", genre: "Country",
    lyrics: ["Honky", "tonk", "heroes", "raising", "glasses", "to", "the", "good", "old", "days"],
    difficulty: 4, tempo: 130, lengthSeconds: 190, energyLevel: 6,
    chordProgression: ["E", "A", "B7", "E"], isOriginal: true, xpReward: 80,
  },
  {
    id: "s34", title: "Whiskey Sunset", genre: "Country",
    lyrics: ["Whiskey", "colored", "sunset", "fading", "slowly", "in", "the", "western", "sky"],
    difficulty: 3, tempo: 88, lengthSeconds: 240, energyLevel: 3,
    chordProgression: ["D", "G", "A", "D"], isOriginal: true, xpReward: 65,
  },
  {
    id: "s35", title: "Barn Dance", genre: "Country",
    lyrics: ["Barn", "dance", "tonight", "fiddles", "playing", "boots", "are", "stomping", "hard"],
    difficulty: 5, tempo: 140, lengthSeconds: 180, energyLevel: 8,
    chordProgression: ["G", "D", "Em", "C"], isOriginal: true, xpReward: 95,
  },
  // Metal (5 songs)
  {
    id: "s36", title: "Iron Fortress", genre: "Metal",
    lyrics: ["Iron", "fortress", "standing", "tall", "against", "the", "raging", "storm", "of", "time"],
    difficulty: 8, tempo: 180, lengthSeconds: 260, energyLevel: 10,
    chordProgression: ["Em", "C", "G", "D"], isOriginal: true, xpReward: 160,
  },
  {
    id: "s37", title: "Obsidian Blade", genre: "Metal",
    lyrics: ["Obsidian", "blade", "forged", "in", "darkness", "slicing", "through", "the", "void"],
    difficulty: 9, tempo: 200, lengthSeconds: 230, energyLevel: 10,
    chordProgression: ["Dm", "Bb", "Gm", "A"], isOriginal: true, xpReward: 180,
  },
  {
    id: "s38", title: "Thunderstrike", genre: "Metal",
    lyrics: ["Thunder", "strikes", "the", "earth", "trembles", "beneath", "our", "feet", "now"],
    difficulty: 7, tempo: 170, lengthSeconds: 240, energyLevel: 9,
    chordProgression: ["E", "C", "D", "E"], isOriginal: true, xpReward: 140,
  },
  {
    id: "s39", title: "Shadow Realm", genre: "Metal",
    lyrics: ["Descending", "into", "the", "shadow", "realm", "where", "demons", "dwell", "and", "scream"],
    difficulty: 9, tempo: 190, lengthSeconds: 270, energyLevel: 10,
    chordProgression: ["Am", "F", "Dm", "E"], isOriginal: true, xpReward: 185,
  },
  {
    id: "s40", title: "Steel Behemoth", genre: "Metal",
    lyrics: ["Steel", "behemoth", "crushing", "all", "who", "stand", "before", "its", "mighty", "path"],
    difficulty: 8, tempo: 175, lengthSeconds: 250, energyLevel: 9,
    chordProgression: ["Fm", "Db", "Ab", "Eb"], isOriginal: true, xpReward: 155,
  },
];

// ---------------------------------------------------------------------------
// Static Data — Instruments (8 instruments × 5 rarity tiers)
// ---------------------------------------------------------------------------

const INSTRUMENT_DEFS: InstrumentDef[] = [
  // Guitar
  { id: "guitar_common", name: "Beginner Guitar", baseStats: { tone: 30, volume: 40, durability: 50 }, rarity: "common", cost: 50, icon: "🎸" },
  { id: "guitar_uncommon", name: "Studio Guitar", baseStats: { tone: 50, volume: 55, durability: 60 }, rarity: "uncommon", cost: 200, icon: "🎸" },
  { id: "guitar_rare", name: "Vintage Stratocaster", baseStats: { tone: 70, volume: 70, durability: 70 }, rarity: "rare", cost: 500, icon: "🎸" },
  { id: "guitar_epic", name: "Custom Les Paul", baseStats: { tone: 85, volume: 85, durability: 80 }, rarity: "epic", cost: 1200, icon: "🎸" },
  { id: "guitar_legendary", name: "Fame's Edge", baseStats: { tone: 100, volume: 95, durability: 95 }, rarity: "legendary", cost: 3000, icon: "🎸" },
  // Bass
  { id: "bass_common", name: "Practice Bass", baseStats: { tone: 25, volume: 50, durability: 45 }, rarity: "common", cost: 40, icon: "🎸" },
  { id: "bass_uncommon", name: "Jazz Bass", baseStats: { tone: 45, volume: 60, durability: 55 }, rarity: "uncommon", cost: 180, icon: "🎸" },
  { id: "bass_rare", name: "Precision Bass", baseStats: { tone: 65, volume: 75, durability: 65 }, rarity: "rare", cost: 450, icon: "🎸" },
  { id: "bass_epic", name: "Thunder Bass", baseStats: { tone: 80, volume: 90, durability: 75 }, rarity: "epic", cost: 1100, icon: "🎸" },
  { id: "bass_legendary", name: "Gravity Well", baseStats: { tone: 95, volume: 100, durability: 90 }, rarity: "legendary", cost: 2800, icon: "🎸" },
  // Drums
  { id: "drums_common", name: "Starter Kit", baseStats: { tone: 20, volume: 60, durability: 40 }, rarity: "common", cost: 60, icon: "🥁" },
  { id: "drums_uncommon", name: "Rock Kit", baseStats: { tone: 40, volume: 70, durability: 55 }, rarity: "uncommon", cost: 220, icon: "🥁" },
  { id: "drums_rare", name: "Studio Pro Kit", baseStats: { tone: 60, volume: 80, durability: 70 }, rarity: "rare", cost: 550, icon: "🥁" },
  { id: "drums_epic", name: "Double Bass Kit", baseStats: { tone: 80, volume: 90, durability: 80 }, rarity: "epic", cost: 1300, icon: "🥁" },
  { id: "drums_legendary", name: "Tempest Drums", baseStats: { tone: 95, volume: 100, durability: 95 }, rarity: "legendary", cost: 3200, icon: "🥁" },
  // Keyboard
  { id: "keyboard_common", name: "Casio Keyboard", baseStats: { tone: 35, volume: 35, durability: 55 }, rarity: "common", cost: 45, icon: "🎹" },
  { id: "keyboard_uncommon", name: "Stage Piano", baseStats: { tone: 55, volume: 50, durability: 60 }, rarity: "uncommon", cost: 210, icon: "🎹" },
  { id: "keyboard_rare", name: "Nord Electro", baseStats: { tone: 75, volume: 65, durability: 70 }, rarity: "rare", cost: 520, icon: "🎹" },
  { id: "keyboard_epic", name: "Moog Synthesizer", baseStats: { tone: 88, volume: 75, durability: 78 }, rarity: "epic", cost: 1250, icon: "🎹" },
  { id: "keyboard_legendary", name: "Harmonic Prism", baseStats: { tone: 100, volume: 85, durability: 92 }, rarity: "legendary", cost: 3100, icon: "🎹" },
  // Violin
  { id: "violin_common", name: "Student Violin", baseStats: { tone: 30, volume: 30, durability: 50 }, rarity: "common", cost: 35, icon: "🎻" },
  { id: "violin_uncommon", name: "Concert Violin", baseStats: { tone: 55, volume: 45, durability: 60 }, rarity: "uncommon", cost: 190, icon: "🎻" },
  { id: "violin_rare", name: "Italian Master", baseStats: { tone: 75, volume: 60, durability: 70 }, rarity: "rare", cost: 480, icon: "🎻" },
  { id: "violin_epic", name: "Stradivarius Replica", baseStats: { tone: 90, volume: 70, durability: 80 }, rarity: "epic", cost: 1150, icon: "🎻" },
  { id: "violin_legendary", name: "Celestial Bow", baseStats: { tone: 100, volume: 80, durability: 93 }, rarity: "legendary", cost: 2900, icon: "🎻" },
  // Saxophone
  { id: "sax_common", name: "Student Sax", baseStats: { tone: 28, volume: 45, durability: 48 }, rarity: "common", cost: 50, icon: "🎷" },
  { id: "sax_uncommon", name: "Jazz Sax", baseStats: { tone: 50, volume: 55, durability: 58 }, rarity: "uncommon", cost: 200, icon: "🎷" },
  { id: "sax_rare", name: "Mark VI", baseStats: { tone: 72, volume: 68, durability: 68 }, rarity: "rare", cost: 530, icon: "🎷" },
  { id: "sax_epic", name: "Custom Gold Sax", baseStats: { tone: 88, volume: 78, durability: 78 }, rarity: "epic", cost: 1280, icon: "🎷" },
  { id: "sax_legendary", name: "Soul Horn", baseStats: { tone: 100, volume: 88, durability: 92 }, rarity: "legendary", cost: 3050, icon: "🎷" },
  // Trumpet
  { id: "trumpet_common", name: "Student Trumpet", baseStats: { tone: 25, volume: 55, durability: 52 }, rarity: "common", cost: 40, icon: "🎺" },
  { id: "trumpet_uncommon", name: "Pro Trumpet", baseStats: { tone: 48, volume: 62, durability: 58 }, rarity: "uncommon", cost: 185, icon: "🎺" },
  { id: "trumpet_rare", name: "Bach Stradivarius", baseStats: { tone: 70, volume: 72, durability: 70 }, rarity: "rare", cost: 500, icon: "🎺" },
  { id: "trumpet_epic", name: "Custom C Trumpet", baseStats: { tone: 85, volume: 80, durability: 78 }, rarity: "epic", cost: 1200, icon: "🎺" },
  { id: "trumpet_legendary", name: "Archangel Horn", baseStats: { tone: 100, volume: 92, durability: 94 }, rarity: "legendary", cost: 2950, icon: "🎺" },
  // DJ Deck
  { id: "dj_common", name: "Basic Deck", baseStats: { tone: 20, volume: 60, durability: 40 }, rarity: "common", cost: 55, icon: "🎧" },
  { id: "dj_uncommon", name: "Club Deck", baseStats: { tone: 42, volume: 70, durability: 55 }, rarity: "uncommon", cost: 215, icon: "🎧" },
  { id: "dj_rare", name: "Pioneer Set", baseStats: { tone: 62, volume: 80, durability: 68 }, rarity: "rare", cost: 540, icon: "🎧" },
  { id: "dj_epic", name: "Arena Controller", baseStats: { tone: 82, volume: 90, durability: 78 }, rarity: "epic", cost: 1300, icon: "🎧" },
  { id: "dj_legendary", name: "Neural Mix Station", baseStats: { tone: 100, volume: 100, durability: 93 }, rarity: "legendary", cost: 3300, icon: "🎧" },
];

// ---------------------------------------------------------------------------
// Static Data — Equipment (10 pieces)
// ---------------------------------------------------------------------------

const EQUIPMENT_DEFS: EquipmentDef[] = [
  { id: "pa_system", name: "PA System", description: "Public address system for vocal clarity.", baseEffect: 10, maxUpgradeLevel: 5, upgradeCost: 150, icon: "🔊" },
  { id: "guitar_amp", name: "Guitar Amplifier", description: "Crystal clear guitar amplification.", baseEffect: 8, maxUpgradeLevel: 5, upgradeCost: 120, icon: "🔔" },
  { id: "pedal_board", name: "Effects Pedal Board", description: "Reverb, delay, distortion and more.", baseEffect: 6, maxUpgradeLevel: 5, upgradeCost: 100, icon: "🎛️" },
  { id: "mixing_console", name: "Mixing Console", description: "Professional 32-channel mixing desk.", baseEffect: 12, maxUpgradeLevel: 5, upgradeCost: 200, icon: "🎛️" },
  { id: "microphone", name: "Studio Microphone", description: "Condenser mic for pristine vocals.", baseEffect: 9, maxUpgradeLevel: 5, upgradeCost: 130, icon: "🎤" },
  { id: "monitors", name: "Stage Monitors", description: "Wedge monitors for on-stage audio.", baseEffect: 7, maxUpgradeLevel: 5, upgradeCost: 110, icon: "🔈" },
  { id: "lighting_rig", name: "Lighting Rig", description: "Dynamic stage lighting system.", baseEffect: 5, maxUpgradeLevel: 5, upgradeCost: 90, icon: "💡" },
  { id: "backline", name: "Backline Setup", description: "Drum riser, amps, and keyboard stands.", baseEffect: 8, maxUpgradeLevel: 5, upgradeCost: 140, icon: "🪑" },
  { id: "fog_machine", name: "Fog Machine", description: "Atmospheric haze and fog effects.", baseEffect: 4, maxUpgradeLevel: 5, upgradeCost: 80, icon: "🌫️" },
  { id: "pyrotechnics", name: "Pyrotechnics System", description: "Safe indoor fireworks and sparklers.", baseEffect: 10, maxUpgradeLevel: 5, upgradeCost: 250, icon: "🎆" },
];

// ---------------------------------------------------------------------------
// Static Data — Featured Artists (10)
// ---------------------------------------------------------------------------

const FEATURED_ARTISTS: FeaturedArtist[] = [
  { id: "fa01", name: "Axel Rivers", genre: "Rock", specialty: "Stage Presence", bonusMultiplier: 1.3, costToCollaborate: 200, collaborationsRemaining: 3, icon: "🎤", description: "Legendary frontman with unmatched charisma." },
  { id: "fa02", name: "Luna Chen", genre: "Pop", specialty: "Harmony", bonusMultiplier: 1.25, costToCollaborate: 180, collaborationsRemaining: 3, icon: "🎵", description: "Vocal powerhouse with perfect pitch." },
  { id: "fa03", name: "Miles Darkwood", genre: "Jazz", specialty: "Improvisation", bonusMultiplier: 1.35, costToCollaborate: 250, collaborationsRemaining: 2, icon: "🎷", description: "Jazz virtuoso who lives in the moment." },
  { id: "fa04", name: "Synthia", genre: "Electronic", specialty: "Energy", bonusMultiplier: 1.3, costToCollaborate: 220, collaborationsRemaining: 3, icon: "🎧", description: "DJ and producer who controls the dancefloor." },
  { id: "fa05", name: "Viktor Sterling", genre: "Classical", specialty: "Technique", bonusMultiplier: 1.4, costToCollaborate: 300, collaborationsRemaining: 2, icon: "🎻", description: "Concert pianist with flawless execution." },
  { id: "fa06", name: "MC Prophet", genre: "Hip-Hop", specialty: "Rhythm", bonusMultiplier: 1.3, costToCollaborate: 200, collaborationsRemaining: 3, icon: "🎙️", description: "Lyricist with an unbreakable flow." },
  { id: "fa07", name: "Dixie Rose", genre: "Country", specialty: "Stage Presence", bonusMultiplier: 1.2, costToCollaborate: 160, collaborationsRemaining: 3, icon: "🤠", description: "Country sweetheart with a golden voice." },
  { id: "fa08", name: "Grim Ironhart", genre: "Metal", specialty: "Energy", bonusMultiplier: 1.35, costToCollaborate: 240, collaborationsRemaining: 2, icon: "🤘", description: "Vocalist who screams like thunder." },
  { id: "fa09", name: "Professor Funk", genre: "Jazz", specialty: "Rhythm", bonusMultiplier: 1.25, costToCollaborate: 190, collaborationsRemaining: 3, icon: "🎹", description: "Keyboard wizard with infectious grooves." },
  { id: "fa10", name: "Nova Blaze", genre: "Electronic", specialty: "Technique", bonusMultiplier: 1.3, costToCollaborate: 210, collaborationsRemaining: 3, icon: "🎹", description: "Synth prodigy who redefines sound." },
];

// ---------------------------------------------------------------------------
// Static Data — Tour Locations (8)
// ---------------------------------------------------------------------------

const TOUR_LOCATIONS: Omit<TourStop, "completed" | "completedTimestamp">[] = [
  { id: "tour01", name: "Local Pub Crawl", location: "Hometown", distance: 10, challenge: "Win over a skeptical crowd at a small pub.", reward: 100 },
  { id: "tour02", name: "College Circuit", location: "University Town", distance: 120, challenge: "Connect with the energy of a college crowd.", reward: 250 },
  { id: "tour03", name: "Beach Festival", location: "Coastal City", distance: 350, challenge: "Play an outdoor beach gig in scorching heat.", reward: 400 },
  { id: "tour04", name: "Mountain Retreat", location: "Highland Valley", distance: 500, challenge: "Acoustic performance in an intimate mountain lodge.", reward: 550 },
  { id: "tour05", name: "International Showcase", location: "London", distance: 5000, challenge: "Perform at a prestigious venue overseas.", reward: 800 },
  { id: "tour06", name: "Desert Burn", location: "Nevada Desert", distance: 3000, challenge: "Survive a multi-day outdoor festival in the desert.", reward: 1000 },
  { id: "tour07", name: "Winter Solstice", location: "Reykjavik", distance: 4500, challenge: "Play in freezing conditions at a Nordic arena.", reward: 1200 },
  { id: "tour08", name: "World Tour Finale", location: "Tokyo Dome", distance: 9000, challenge: "Headline the legendary Tokyo Dome.", reward: 2000 },
];

// ---------------------------------------------------------------------------
// Static Data — Achievements (15)
// ---------------------------------------------------------------------------

const ACHIEVEMENT_DEFS: Omit<AchievementDef, "unlocked" | "unlockedTimestamp" | "progress">[] = [
  { id: "mf_ach_01", name: "First Gig", description: "Complete your first performance.", icon: "🎪", condition: "performances >= 1", reward: { type: "coins", amount: 50 }, maxProgress: 1 },
  { id: "mf_ach_02", name: "Standing Ovation", description: "Achieve 95+ crowd engagement.", icon: "👏", condition: "max_engagement >= 95", reward: { type: "reputation", amount: 50 }, maxProgress: 100 },
  { id: "mf_ach_03", name: "Sold Out", description: "Fill a stage to maximum capacity.", icon: "🎫", condition: "max_crowd >= stage_capacity", reward: { type: "coins", amount: 200 }, maxProgress: 5000 },
  { id: "mf_ach_04", name: "Tour Complete", description: "Complete all 8 tour stops.", icon: "🌍", condition: "tour_stops_completed >= 8", reward: { type: "reputation", amount: 100 }, maxProgress: 8 },
  { id: "mf_ach_05", name: "Hit Single", description: "Compose a song with quality 90+.", icon: "🎶", condition: "best_song_quality >= 90", reward: { type: "xp", amount: 500 }, maxProgress: 100 },
  { id: "mf_ach_06", name: "Gearhead", description: "Collect 10 different instruments.", icon: "🎸", condition: "instruments_collected >= 10", reward: { type: "coins", amount: 150 }, maxProgress: 40 },
  { id: "mf_ach_07", name: "Five-Star Show", description: "Receive a 5-star critic review.", icon: "⭐", condition: "five_star_reviews >= 1", reward: { type: "reputation", amount: 75 }, maxProgress: 10 },
  { id: "mf_ach_08", name: "Crowd Favorite", description: "Accumulate 500 total fans.", icon: "❤️", condition: "total_fans >= 500", reward: { type: "coins", amount: 300 }, maxProgress: 10000 },
  { id: "mf_ach_09", name: "Encore King", description: "Trigger an encore 5 times.", icon: "🎶", condition: "encores_triggered >= 5", reward: { type: "xp", amount: 400 }, maxProgress: 50 },
  { id: "mf_ach_10", name: "Lyricist", description: "Compose 10 original songs.", icon: "✍️", condition: "songs_composed >= 10", reward: { type: "xp", amount: 600 }, maxProgress: 50 },
  { id: "mf_ach_11", name: "Weathered Storm", description: "Perform successfully during a storm.", icon: "⛈️", condition: "storm_performances >= 1", reward: { type: "reputation", amount: 40 }, maxProgress: 10 },
  { id: "mf_ach_12", name: "Full Band", description: "Have all 5 band members at morale 90+.", icon: "👥", condition: "full_band_morale >= 90", reward: { type: "coins", amount: 250 }, maxProgress: 5 },
  { id: "mf_ach_13", name: "Merch Mogul", description: "Sell 100 merchandise items total.", icon: "💰", condition: "total_merch_sold >= 100", reward: { type: "coins", amount: 500 }, maxProgress: 1000 },
  { id: "mf_ach_14", name: "Collab Star", description: "Collaborate with 5 different artists.", icon: "🤝", condition: "collaborations_done >= 5", reward: { type: "reputation", amount: 60 }, maxProgress: 10 },
  { id: "mf_ach_15", name: "Legendary Status", description: "Reach musician level 40.", icon: "🏆", condition: "musician_level >= 40", reward: { type: "reputation", amount: 200 }, maxProgress: 40 },

];

// ---------------------------------------------------------------------------
// Static Data — Merch Items
// ---------------------------------------------------------------------------

const MERCH_DEFS: MerchItemDef[] = [
  { id: "merch_01", name: "Band Logo Tee", category: "tshirt", basePrice: 15, stock: 100, sold: 0, icon: "👕", description: "Classic cotton tee with the band logo." },
  { id: "merch_02", name: "Tour Poster", category: "poster", basePrice: 10, stock: 200, sold: 0, icon: "🖼️", description: "Full-color tour poster with dates." },
  { id: "merch_03", name: "Debut Vinyl", category: "vinyl", basePrice: 25, stock: 50, sold: 0, icon: "💿", description: "Limited edition vinyl pressing." },
  { id: "merch_04", name: "Guitar Pick Set", category: "accessory", basePrice: 8, stock: 300, sold: 0, icon: "🎸", description: "Set of 5 custom guitar picks." },
  { id: "merch_05", name: "Digital Album", category: "digital", basePrice: 5, stock: 9999, sold: 0, icon: "🎧", description: "High-quality digital download." },
  { id: "merch_06", name: "Hoodie", category: "tshirt", basePrice: 35, stock: 60, sold: 0, icon: "🧥", description: "Warm hoodie with embroidered logo." },
  { id: "merch_07", name: "Signed Photo", category: "poster", basePrice: 20, stock: 150, sold: 0, icon: "📸", description: "Autographed 8x10 band photo." },
  { id: "merch_08", name: "Deluxe Vinyl Box", category: "vinyl", basePrice: 50, stock: 25, sold: 0, icon: "📦", description: "Deluxe vinyl with bonus tracks and booklet." },
];

// ---------------------------------------------------------------------------
// Static Data — Song Fragments for Songwriting
// ---------------------------------------------------------------------------

const SONG_FRAGMENTS: SongFragment[] = [
  { word: "fire", syllables: 1, rhymesWith: ["desire", "higher", "wire", "inspire"], genre: ["Rock", "Metal"], mood: "intense" },
  { word: "dream", syllables: 1, rhymesWith: ["stream", "gleam", "beam", "seem"], genre: ["Pop", "Jazz"], mood: "chill" },
  { word: "shadow", syllables: 2, rhymesWith: ["meadow", "echo", "window"], genre: ["Metal", "Classical"], mood: "melancholic" },
  { word: "dance", syllables: 1, rhymesWith: ["chance", "romance", "glance", "advance"], genre: ["Pop", "Electronic"], mood: "upbeat" },
  { word: "heart", syllables: 1, rhymesWith: ["start", "apart", "art", "dart"], genre: ["Rock", "Country", "Pop"], mood: "romantic" },
  { word: "night", syllables: 1, rhymesWith: ["light", "fight", "sight", "flight"], genre: ["Rock", "Jazz", "Electronic"], mood: "intense" },
  { word: "rhythm", syllables: 2, rhymesWith: ["with 'em"], genre: ["Hip-Hop", "Electronic", "Jazz"], mood: "upbeat" },
  { word: "storm", syllables: 1, rhymesWith: ["warm", "form", "swarm"], genre: ["Metal", "Rock"], mood: "intense" },
  { word: "moon", syllables: 1, rhymesWith: ["tune", "soon", "bloom", "noon"], genre: ["Jazz", "Classical"], mood: "romantic" },
  { word: "beat", syllables: 1, rhymesWith: ["street", "heat", "seat", "treat"], genre: ["Hip-Hop", "Electronic"], mood: "upbeat" },
  { word: "stars", syllables: 1, rhymesWith: ["cars", "scars", "bars", "guitars"], genre: ["Pop", "Country"], mood: "romantic" },
  { word: "free", syllables: 1, rhymesWith: ["me", "see", "be", "tree"], genre: ["Rock", "Country", "Pop"], mood: "upbeat" },
  { word: "cry", syllables: 1, rhymesWith: ["sky", "fly", "die", "eye"], genre: ["Rock", "Country"], mood: "melancholic" },
  { word: "groove", syllables: 1, rhymesWith: ["move", "smooth", "prove", "approve"], genre: ["Jazz", "Electronic", "Hip-Hop"], mood: "chill" },
  { word: "flame", syllables: 1, rhymesWith: ["game", "name", "fame", "claim"], genre: ["Rock", "Metal"], mood: "intense" },
  { word: "river", syllables: 2, rhymesWith: ["deliver", "forever", "shiver"], genre: ["Country", "Folk" as unknown as MusicGenre], mood: "chill" },
  { word: "gold", syllables: 1, rhymesWith: ["old", "bold", "cold", "told"], genre: ["Country", "Pop"], mood: "romantic" },
  { word: "silence", syllables: 2, rhymesWith: ["violence", "alliance"], genre: ["Classical", "Metal"], mood: "melancholic" },
  { word: "neon", syllables: 2, rhymesWith: ["freon", "demon"], genre: ["Electronic", "Pop"], mood: "upbeat" },
  { word: "brave", syllables: 1, rhymesWith: ["wave", "save", "cave", "grave"], genre: ["Rock", "Country"], mood: "intense" },
];

// ---------------------------------------------------------------------------
// Static Data — Critic Names & Publications
// ---------------------------------------------------------------------------

const CRITIC_NAMES = [
  "Vincent Sharpe", "Melody Fontaine", "Richter Scale", "HarmonyBlake",
  "Tess Tempo", "Nick Noise", "Clara Clef", "DJ Reviews",
];

const PUBLICATIONS = [
  "The Daily Chord", "Sound Check Weekly", "Stage Right Magazine",
  "Bassline Times", "Melody Maker", "Underground Frequency",
  "Festival Herald", "The Vinyl Press",
];

const REVIEW_HEADLINES_POSITIVE = [
  "A Triumphant Performance That Left Us Breathless",
  "The Sound of Tomorrow, Today",
  "Absolutely Mesmerizing From Start to Finish",
  "A Masterclass in Live Music",
  "Pure Genius on Stage",
];

const REVIEW_HEADLINES_NEGATIVE = [
  "A Performance That Needed More Rehearsal",
  "Promising but Ultimately Lacking",
  "Not Ready for the Big Stage",
  "A Forgettable Evening of Music",
  "Room for Improvement Across the Board",
];

const REVIEW_HEADLINES_NEUTRAL = [
  "A Decent Showing With Room to Grow",
  "Solid Fundamentals, Needs Polish",
  "An Adequate Performance for the Venue",
  "Good Energy, Inconsistent Execution",
];

const REVIEW_BODIES_POSITIVE = [
  "The band delivered an electrifying set that had the entire crowd on their feet. Every note was perfectly placed, and the energy was infectious from the opening chord to the final bow.",
  "From the moment they took the stage, it was clear this was going to be special. The musicianship was top-notch and the vocals soared effortlessly above the instrumentation.",
  "A tour de force performance that showcased the band's remarkable range. They seamlessly shifted between soft ballads and thunderous anthems, keeping the audience captivated throughout.",
];

const REVIEW_BODIES_NEGATIVE = [
  "Despite moments of promise, the performance fell flat overall. Timing issues plagued the set, and the band seemed to struggle with their own material at several key moments.",
  "The energy was there, but the execution was lacking. Several songs dragged on too long and the transitions between numbers felt awkward and unplanned.",
  "An uneven performance that left much to be desired. While individual talent was evident, the band failed to gel as a cohesive unit on stage.",
];

const REVIEW_BODIES_NEUTRAL = [
  "A competent performance that showed clear potential. The band has the raw talent but needs to work on their stage presence and song arrangements to truly stand out.",
  "Not bad, but not memorable either. The set list was safe and predictable. A few risks here and there could elevate this band from good to great.",
];

// ---------------------------------------------------------------------------
// Static Data — Weather Effects
// ---------------------------------------------------------------------------

const WEATHER_EFFECTS: Record<WeatherCondition, { crowdMod: number; skillMod: number; coinMod: number; description: string }> = {
  clear: { crowdMod: 1.0, skillMod: 1.0, coinMod: 1.0, description: "Perfect weather for an outdoor gig." },
  rain: { crowdMod: -15, skillMod: -5, coinMod: 0.8, description: "Rain dampens the crowd but adds atmosphere." },
  wind: { crowdMod: -10, skillMod: -10, coinMod: 0.85, description: "Wind affects sound quality and crowd mood." },
  heat: { crowdMod: -5, skillMod: -8, coinMod: 0.9, description: "Scorching heat drains energy fast." },
  storm: { crowdMod: -25, skillMod: -15, coinMod: 0.7, description: "Storm conditions - only the dedicated remain." },
};

// ---------------------------------------------------------------------------
// Static Data — Level Progression
// ---------------------------------------------------------------------------

const LEVEL_XP_THRESHOLDS: number[] = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
  4000, 5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000,
  26000, 30500, 36000, 42000, 49000, 57000, 66000, 76000, 88000, 102000,
  118000, 136000, 157000, 181000, 208000, 239000, 274000, 314000, 360000, 412000,
];

const LEVEL_TITLES: string[] = [
  "Tuning Up", "Open Mic", "Garage Band", "Local Talent", "Rising Star",
  "Club Regular", "Stage Veteran", "Festival Act", "Headliner", "Arena Performer",
  "Chart Climber", "Gold Record", "Platinum Artist", "Festival Favorite", "Tour Headliner",
  "Crossover Star", "Genre Pioneer", "Award Nominee", "Award Winner", "Icon Status",
  "Hall of Famer", "Living Legend", "Music Royalty", "Sound Architect", "Sonic Visionary",
  "Rhythm Master", "Melody Sovereign", "Harmonics Oracle", "Frequency Lord", "Amplitude King",
  "Resonance Sage", "Chord Emperor", "Tempo Titan", "Acoustics Deity", "Vibration Archmage",
  "Sonic Overlord", "Melodic Primus", "Harmonic Apex", "Aural Zenith", "The Maestro",
];

// ---------------------------------------------------------------------------
// Static Data — Fan Milestones
// ---------------------------------------------------------------------------

const FAN_MILESTONES_DEF: Omit<FanMilestone, "claimed">[] = [
  { fansRequired: 10, reward: { type: "coins", amount: 25, label: "25 Coins" } },
  { fansRequired: 50, reward: { type: "xp", amount: 100, label: "100 XP" } },
  { fansRequired: 100, reward: { type: "reputation", amount: 20, label: "+20 Reputation" } },
  { fansRequired: 250, reward: { type: "coins", amount: 100, label: "100 Coins" } },
  { fansRequired: 500, reward: { type: "xp", amount: 500, label: "500 XP" } },
  { fansRequired: 1000, reward: { type: "reputation", amount: 50, label: "+50 Reputation" } },
  { fansRequired: 2500, reward: { type: "coins", amount: 500, label: "500 Coins" } },
  { fansRequired: 5000, reward: { type: "xp", amount: 2000, label: "2000 XP" } },
  { fansRequired: 10000, reward: { type: "reputation", amount: 100, label: "+100 Reputation" } },
];

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getDayKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function computeLevel(totalXP: number): number {
  for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

function computeXPToNext(level: number): number {
  if (level >= LEVEL_XP_THRESHOLDS.length) return 999999;
  return LEVEL_XP_THRESHOLDS[level] - LEVEL_XP_THRESHOLDS[level - 1];
}

function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] ?? "Unknown";
}

function calculateCrowdMood(engagement: number): CrowdState["mood"] {
  if (engagement >= 90) return "ecstatic";
  if (engagement >= 75) return "wild";
  if (engagement >= 55) return "excited";
  if (engagement >= 35) return "interested";
  return "bored";
}

function calculateShowRating(score: number, combo: number, engagement: number): ShowRating {
  const composite = (score * 0.4) + (combo * 5 * 0.3) + (engagement * 0.3);
  if (composite >= 85) return "Legendary";
  if (composite >= 65) return "Great";
  if (composite >= 45) return "Good";
  if (composite >= 25) return "Decent";
  return "Amateur";
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function getWeatherForDay(dateKey: string): WeatherCondition {
  const hash = dateKey.split("-").reduce((a, b) => a + parseInt(b, 10), 0);
  const rng = seededRandom(hash);
  const roll = rng();
  if (roll < 0.55) return "clear";
  if (roll < 0.72) return "rain";
  if (roll < 0.85) return "wind";
  if (roll < 0.95) return "heat";
  return "storm";
}

function generateDailyGig(dateKey: string): DailyGig {
  const weather = getWeatherForDay(dateKey);
  const hash = dateKey.split("-").reduce((a, b) => a + parseInt(b, 10), 0);
  const rng = seededRandom(hash + 42);
  const songIndex = Math.floor(rng() * SONGS.length);
  const stageIndex = Math.floor(rng() * Math.min(3, STAGES.length));
  const bonusReward = Math.floor(rng() * 150) + 50;
  return {
    dateKey,
    stageId: STAGES[stageIndex].id,
    songSuggestion: SONGS[songIndex].id,
    weather,
    bonusReward,
    completed: false,
    completedTimestamp: null,
  };
}

function generateCriticReview(rating: number): CriticReview {
  const criticName = pickRandom(CRITIC_NAMES);
  const publication = pickRandom(PUBLICATIONS);
  const now = Date.now();

  let headline: string;
  let body: string;

  if (rating >= 4) {
    headline = pickRandom(REVIEW_HEADLINES_POSITIVE);
    body = pickRandom(REVIEW_BODIES_POSITIVE);
  } else if (rating <= 2) {
    headline = pickRandom(REVIEW_HEADLINES_NEGATIVE);
    body = pickRandom(REVIEW_BODIES_NEGATIVE);
  } else {
    headline = pickRandom(REVIEW_HEADLINES_NEUTRAL);
    body = pickRandom(REVIEW_BODIES_NEUTRAL);
  }

  const reputationImpact = (rating - 3) * 10;
  return { criticName, publication, rating, headline, body, timestamp: now, reputationImpact };
}

function checkRhyme(word1: string, word2: string): boolean {
  const normalize = (w: string) => w.toLowerCase().trim();
  const w1 = normalize(word1);
  const w2 = normalize(word2);
  if (w1 === w2) return false;

  for (const frag of SONG_FRAGMENTS) {
    if (normalize(frag.word) === w1 && frag.rhymesWith.map(normalize).includes(w2)) return true;
    if (normalize(frag.word) === w2 && frag.rhymesWith.map(normalize).includes(w1)) return true;
    if (frag.rhymesWith.map(normalize).includes(w1) && frag.rhymesWith.map(normalize).includes(w2)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// State (SSR-safe)
// ---------------------------------------------------------------------------

interface MusicFestivalState {
  band: Band | null;
  bandSkills: BandSkills;
  musicianLevel: MusicianLevel;
  performance: PerformanceState | null;
  crowd: CrowdState;
  ownedInstruments: OwnedInstrument[];
  ownedEquipment: Record<string, OwnedEquipment>;
  setlist: SetlistEntry[];
  reputation: number;
  fanClub: FanClub;
  tour: TourState;
  achievements: AchievementDef[];
  encore: EncoreState;
  merchBooth: MerchBooth;
  reviews: CriticReview[];
  composedSongs: ComposedSong[];
  dailyGig: DailyGig | null;
  lastDailyKey: string;
  collaborationsDone: number;
  collaboratedArtistIds: string[];
  stormPerformances: number;
  maxEngagement: number;
  maxCrowdSize: number;
  fiveStarReviews: number;
  totalPerformances: number;
  bestSongQuality: number;
  totalMerchSold: number;
  encoresTriggered: number;
  lastPerformanceTimestamp: number;
  activeCollaboratorId: string | null;
}

const DEFAULT_BAND_SKILLS: BandSkills = {
  "Stage Presence": 10,
  Harmony: 10,
  Rhythm: 10,
  Improvisation: 10,
  Energy: 10,
  Technique: 10,
};

const DEFAULT_CROWD: CrowdState = {
  engagement: 0,
  size: 0,
  mood: "bored",
  chanting: false,
  lightersOut: false,
  moshPitActive: false,
  singalongActive: false,
};

const DEFAULT_MUSICIAN_LEVEL: MusicianLevel = {
  level: 1,
  currentXP: 0,
  xpToNext: LEVEL_XP_THRESHOLDS[1],
  totalXP: 0,
  title: LEVEL_TITLES[0],
};

let state: MusicFestivalState | null = null;

function ensureInit(): MusicFestivalState {
  if (state) return state;
  const now = Date.now();
  const todayKey = getDayKey(now);

  state = {
    band: null,
    bandSkills: { ...DEFAULT_BAND_SKILLS },
    musicianLevel: { ...DEFAULT_MUSICIAN_LEVEL },
    performance: null,
    crowd: { ...DEFAULT_CROWD },
    ownedInstruments: [],
    ownedEquipment: {},
    setlist: [],
    reputation: 0,
    fanClub: {
      totalFans: 0,
      activeFans: 0,
      milestones: FAN_MILESTONES_DEF.map(m => ({ ...m, claimed: false })),
      recentActivity: [],
    },
    tour: {
      stops: TOUR_LOCATIONS.map(loc => ({
        ...loc,
        completed: false,
        completedTimestamp: null,
      })),
      currentStopIndex: 0,
      isActive: false,
      startDate: null,
      completionDate: null,
    },
    achievements: ACHIEVEMENT_DEFS.map(a => ({
      ...a,
      unlocked: false,
      unlockedTimestamp: null,
      progress: 0,
      maxProgress: 1,
    })),
    encore: {
      isAvailable: false,
      isActive: false,
      bonusMultiplier: 1.0,
      bonusXP: 0,
      bonusCoins: 0,
      songId: null,
    },
    merchBooth: {
      items: MERCH_DEFS.map(m => ({
        defId: m.id,
        price: m.basePrice,
        stock: m.stock,
        sold: 0,
      })),
      totalRevenue: 0,
      totalItemsSold: 0,
    },
    reviews: [],
    composedSongs: [],
    dailyGig: generateDailyGig(todayKey),
    lastDailyKey: todayKey,
    collaborationsDone: 0,
    collaboratedArtistIds: [],
    stormPerformances: 0,
    maxEngagement: 0,
    maxCrowdSize: 0,
    fiveStarReviews: 0,
    totalPerformances: 0,
    bestSongQuality: 0,
    totalMerchSold: 0,
    encoresTriggered: 0,
    lastPerformanceTimestamp: 0,
    activeCollaboratorId: null,
  };

  return state;
}

function ensureDailyReset(s: MusicFestivalState): void {
  const todayKey = getDayKey(Date.now());
  if (s.lastDailyKey !== todayKey) {
    s.lastDailyKey = todayKey;
    s.dailyGig = generateDailyGig(todayKey);
  }
}

// ---------------------------------------------------------------------------
// State Management
// ---------------------------------------------------------------------------

export function mfGetState(): MusicFestivalState {
  return ensureInit();
}

export function mfResetState(): void {
  state = null;
  ensureInit();
}

// ---------------------------------------------------------------------------
// Band Management
// ---------------------------------------------------------------------------

export function mfCreateBand(
  bandName: string,
  genre: MusicGenre,
  memberNames: string[]
): { success: boolean; message: string } {
  const s = ensureInit();
  if (s.band) {
    return { success: false, message: "Band already exists. Reset to create a new one." };
  }
  if (memberNames.length !== 5) {
    return { success: false, message: "A band needs exactly 5 members." };
  }

  const roles: BandRole[] = ["Vocalist", "Guitarist", "Bassist", "Drummer", "Keyboardist"];
  const defaultInstruments: Record<BandRole, string> = {
    Vocalist: "Microphone",
    Guitarist: "Beginner Guitar",
    Bassist: "Practice Bass",
    Drummer: "Starter Kit",
    Keyboardist: "Casio Keyboard",
  };

  const members: BandMember[] = memberNames.map((name, idx) => ({
    name: name.trim(),
    role: roles[idx],
    skill: 20 + Math.floor(Math.random() * 20),
    morale: 70 + Math.floor(Math.random() * 20),
    fatigue: 0,
    instrument: defaultInstruments[roles[idx]],
  }));

  s.band = {
    name: bandName.trim(),
    members,
    formedTimestamp: Date.now(),
    totalPerformances: 0,
    coins: 100,
    genre,
  };

  mfCheckAchievements();
  return { success: true, message: `Band "${bandName}" formed! Genre: ${genre}.` };
}

export function mfGetBand(): Band | null {
  return ensureInit().band;
}

export function mfGetBandName(): string | null {
  return ensureInit().band?.name ?? null;
}

export function mfGetBandMembers(): BandMember[] {
  const s = ensureInit();
  return s.band ? [...s.band.members] : [];
}

export function mfGetBandGenre(): MusicGenre | null {
  return ensureInit().band?.genre ?? null;
}

export function mfSetBandGenre(genre: MusicGenre): boolean {
  const s = ensureInit();
  if (!s.band) return false;
  s.band.genre = genre;
  return true;
}

export function mfGetBandCoins(): number {
  return ensureInit().band?.coins ?? 0;
}

export function mfAddBandCoins(amount: number): number {
  const s = ensureInit();
  if (!s.band) return 0;
  s.band.coins += amount;
  return s.band.coins;
}

export function mfSpendBandCoins(amount: number): boolean {
  const s = ensureInit();
  if (!s.band || s.band.coins < amount) return false;
  s.band.coins -= amount;
  return true;
}

export function mfGetMemberMorale(role: BandRole): number {
  const s = ensureInit();
  if (!s.band) return 0;
  const member = s.band.members.find(m => m.role === role);
  return member?.morale ?? 0;
}

export function mfRestBand(): { message: string; fatigueRecovered: number } {
  const s = ensureInit();
  if (!s.band) return { message: "No band exists.", fatigueRecovered: 0 };
  let totalRecovered = 0;
  for (const member of s.band.members) {
    const recovery = clamp(member.fatigue, 0, 30);
    member.fatigue -= recovery;
    totalRecovered += recovery;
    member.morale = clamp(member.morale + 5, 0, 100);
  }
  return { message: "The band rests and recovers.", fatigueRecovered: totalRecovered };
}

// ---------------------------------------------------------------------------
// Band Skills
// ---------------------------------------------------------------------------

export function mfGetBandSkills(): BandSkills {
  const s = ensureInit();
  return { ...s.bandSkills };
}

export function mfGetBandSkill(skill: BandSkillName): number {
  return ensureInit().bandSkills[skill];
}

export function mfTrainSkill(skill: BandSkillName, points: number): { success: boolean; newLevel: number; message: string } {
  const s = ensureInit();
  if (!s.band) return { success: false, newLevel: 0, message: "Create a band first." };
  if (points <= 0) return { success: false, newLevel: s.bandSkills[skill], message: "Points must be positive." };

  const oldLevel = s.bandSkills[skill];
  s.bandSkills[skill] = clamp(oldLevel + points, 1, 100);
  const newLevel = s.bandSkills[skill];

  const gained = newLevel - oldLevel;
  return {
    success: true,
    newLevel,
    message: gained > 0
      ? `${skill} improved from ${oldLevel} to ${newLevel} (+${gained})!`
      : `${skill} is already at max level (100).`,
  };
}

export function mfGetAverageSkill(): number {
  const s = ensureInit();
  const skills = Object.values(s.bandSkills);
  return Math.round(skills.reduce((a, b) => a + b, 0) / skills.length);
}

// ---------------------------------------------------------------------------
// Song Management
// ---------------------------------------------------------------------------

export function mfGetAllSongs(): Song[] {
  return [...SONGS];
}

export function mfGetSong(songId: string): Song | null {
  return SONGS.find(s => s.id === songId) ?? null;
}

export function mfGetSongsByGenre(genre: MusicGenre): Song[] {
  return SONGS.filter(s => s.genre === genre);
}

export function mfGetSongLyrics(songId: string): string[] {
  const song = SONGS.find(s => s.id === songId);
  return song ? [...song.lyrics] : [];
}

export function mfGetSongChords(songId: string): string[] {
  const song = SONGS.find(s => s.id === songId);
  return song ? [...song.chordProgression] : [];
}

export function mfGetSongDifficulty(songId: string): number {
  const song = SONGS.find(s => s.id === songId);
  return song?.difficulty ?? 0;
}

export function mfGetSongTempo(songId: string): number {
  const song = SONGS.find(s => s.id === songId);
  return song?.tempo ?? 0;
}

// ---------------------------------------------------------------------------
// Stage Management
// ---------------------------------------------------------------------------

export function mfGetAllStages(): Stage[] {
  return [...STAGES];
}

export function mfGetStage(stageId: string): Stage | null {
  return STAGES.find(s => s.id === stageId) ?? null;
}

export function mfGetAvailableStages(reputation: number): Stage[] {
  return STAGES.filter(s => reputation >= s.reputationRequired);
}

export function mfGetBestAvailableStage(): Stage | null {
  const s = ensureInit();
  const available = mfGetAvailableStages(s.reputation);
  return available.length > 0 ? available[available.length - 1] : null;
}

// ---------------------------------------------------------------------------
// Setlist Builder
// ---------------------------------------------------------------------------

export function mfGetSetlist(): SetlistEntry[] {
  return [...ensureInit().setlist];
}

export function mfAddToSetlist(songId: string, energyTransition: SetlistEntry["energyTransition"] = "sustain"): { success: boolean; message: string } {
  const s = ensureInit();
  const song = SONGS.find(song => song.id === songId);
  if (!song) return { success: false, message: "Song not found." };
  if (s.setlist.length >= 8) return { success: false, message: "Setlist is full (max 8 songs)." };
  if (s.setlist.some(e => e.songId === songId)) return { success: false, message: "Song already in setlist." };

  s.setlist.push({ songId, position: s.setlist.length, energyTransition });
  return { success: true, message: `"${song.title}" added to setlist at position ${s.setlist.length}.` };
}

export function mfRemoveFromSetlist(songId: string): boolean {
  const s = ensureInit();
  const idx = s.setlist.findIndex(e => e.songId === songId);
  if (idx === -1) return false;
  s.setlist.splice(idx, 1);
  s.setlist.forEach((entry, i) => { entry.position = i; });
  return true;
}

export function mfClearSetlist(): void {
  ensureInit().setlist = [];
}

export function mfGetSetlistEnergyFlow(): number[] {
  const s = ensureInit();
  return s.setlist.map(entry => {
    const song = SONGS.find(song => song.id === entry.songId);
    return song?.energyLevel ?? 5;
  });
}

export function mfGetSetlistDuration(): number {
  const s = ensureInit();
  return s.setlist.reduce((total, entry) => {
    const song = SONGS.find(song => song.id === entry.songId);
    return total + (song?.lengthSeconds ?? 0);
  }, 0);
}

// ---------------------------------------------------------------------------
// Performance Mechanics
// ---------------------------------------------------------------------------

export function mfStartPerformance(
  stageId: string,
  songIds?: string[]
): { success: boolean; message: string; weather?: WeatherCondition } {
  const s = ensureInit();
  if (!s.band) return { success: false, message: "Create a band first." };
  if (s.performance?.isActive) return { success: false, message: "A performance is already in progress." };

  const stage = STAGES.find(st => st.id === stageId);
  if (!stage) return { success: false, message: "Stage not found." };
  if (s.reputation < stage.reputationRequired) return { success: false, message: `Need ${stage.reputationRequired} reputation to play here.` };

  const songs = songIds ?? s.setlist.map(e => e.songId);
  if (songs.length === 0) return { success: false, message: "Add songs to your setlist first." };

  for (const sid of songs) {
    if (!SONGS.find(song => song.id === sid)) return { success: false, message: `Song ${sid} not found.` };
  }

  const weather = stage.isOutdoor ? getWeatherForDay(getDayKey(Date.now())) : "clear" as WeatherCondition;
  const weatherEffect = WEATHER_EFFECTS[weather];
  const baseCrowdSize = Math.floor(stage.capacity * (0.3 + (s.reputation / 2000)));

  s.performance = {
    isActive: true,
    stageId,
    songIds: songs,
    currentSongIndex: 0,
    currentLyricIndex: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    wordsCorrect: 0,
    wordsMissed: 0,
    crowdEngagement: 20 + Math.floor(Math.random() * 15),
    crowdSize: Math.max(1, Math.floor(baseCrowdSize * (1 + weatherEffect.crowdMod / 100))),
    startTime: Date.now(),
    weather,
    reputationEarned: 0,
    coinsEarned: 0,
    xpEarned: 0,
  };

  s.crowd = {
    engagement: s.performance.crowdEngagement,
    size: s.performance.crowdSize,
    mood: calculateCrowdMood(s.performance.crowdEngagement),
    chanting: false,
    lightersOut: false,
    moshPitActive: false,
    singalongActive: false,
  };

  if (s.band) s.band.totalPerformances++;
  return { success: true, message: `Performance started at ${stage.name}! Weather: ${weather}.`, weather };
}

export function mfPerform(inputWord: string): { success: boolean; correct: boolean; score: number; combo: number; engagement: number; message: string; songComplete: boolean; performanceComplete: boolean } {
  const s = ensureInit();
  if (!s.performance?.isActive) {
    return { success: false, correct: false, score: 0, combo: 0, engagement: 0, message: "No active performance.", songComplete: false, performanceComplete: false };
  }

  const song = SONGS.find(song => song.id === s.performance!.songIds[s.performance!.currentSongIndex]);
  if (!song) {
    return { success: false, correct: false, score: 0, combo: 0, engagement: 0, message: "Song not found.", songComplete: false, performanceComplete: false };
  }

  const expectedWord = song.lyrics[s.performance.currentLyricIndex];
  const normalizedInput = inputWord.toLowerCase().trim();
  const normalizedExpected = expectedWord.toLowerCase().trim();
  const correct = normalizedInput === normalizedExpected;

  if (correct) {
    s.performance.combo++;
    if (s.performance.combo > s.performance.maxCombo) s.performance.maxCombo = s.performance.combo;
    s.performance.wordsCorrect++;

    const comboMultiplier = 1 + (s.performance.combo - 1) * 0.1;
    const skillBonus = 1 + mfGetAverageSkill() / 200;
    const difficultyMultiplier = song.difficulty / 5;
    const collaboratorMultiplier = s.activeCollaboratorId
      ? (FEATURED_ARTISTS.find(a => a.id === s.activeCollaboratorId)?.bonusMultiplier ?? 1)
      : 1;
    const points = Math.floor(10 * comboMultiplier * skillBonus * difficultyMultiplier * collaboratorMultiplier);
    s.performance.score += points;

    const engagementGain = clamp(2 + (s.performance.combo > 5 ? 2 : 0) + (s.bandSkills["Energy"] / 50), 1, 8);
    s.performance.crowdEngagement = clamp(s.performance.crowdEngagement + engagementGain, 0, 100);
  } else {
    s.performance.combo = 0;
    s.performance.wordsMissed++;
    s.performance.crowdEngagement = clamp(s.performance.crowdEngagement - 3, 0, 100);
  }

  // Update crowd state
  s.crowd.engagement = s.performance.crowdEngagement;
  s.crowd.mood = calculateCrowdMood(s.crowd.engagement);
  s.crowd.chanting = s.crowd.engagement >= 70;
  s.crowd.lightersOut = s.crowd.engagement >= 80 && song.genre !== "Electronic";
  s.crowd.moshPitActive = s.crowd.engagement >= 85 && (song.genre === "Rock" || song.genre === "Metal");
  s.crowd.singalongActive = s.crowd.engagement >= 60 && s.performance.combo >= 5;

  // Advance lyric index
  s.performance.currentLyricIndex++;
  const songComplete = s.performance.currentLyricIndex >= song.lyrics.length;
  let performanceComplete = false;

  if (songComplete) {
    s.performance.currentSongIndex++;
    s.performance.currentLyricIndex = 0;
    if (s.performance.currentSongIndex >= s.performance.songIds.length) {
      performanceComplete = true;
    }
  }

  if (performanceComplete) {
    const result = mfEndPerformance();
    return {
      success: true, correct, score: s.performance.score, combo: s.performance.combo,
      engagement: s.performance.crowdEngagement,
      message: `Performance complete! ${result.message}`,
      songComplete: true, performanceComplete: true,
    };
  }

  return {
    success: true, correct, score: s.performance.score, combo: s.performance.combo,
    engagement: s.performance.crowdEngagement,
    message: correct
      ? `"${expectedWord}" correct! +${Math.floor(10 * (1 + (s.performance.combo - 1) * 0.1))} pts (Combo: ${s.performance.combo})`
      : `Wrong! Expected "${expectedWord}". Combo reset.`,
    songComplete, performanceComplete,
  };
}

export function mfEndPerformance(): { success: boolean; message: string; rating: ShowRating; rewards: { coins: number; xp: number; reputation: number; fans: number } } {
  const s = ensureInit();
  if (!s.performance?.isActive) {
    return { success: false, message: "No active performance.", rating: "Amateur", rewards: { coins: 0, xp: 0, reputation: 0, fans: 0 } };
  }

  s.performance.isActive = false;

  const stage = STAGES.find(st => st.id === s.performance!.stageId);
  const rating = calculateShowRating(s.performance.score, s.performance.maxCombo, s.performance.crowdEngagement);
  const weatherEffect = WEATHER_EFFECTS[s.performance.weather];

  // Calculate rewards
  const ratingMultiplier: Record<ShowRating, number> = {
    Amateur: 0.5, Decent: 1.0, Good: 1.5, Great: 2.5, Legendary: 4.0,
  };

  const baseCoins = stage ? stage.baseReward * s.performance.songIds.length : 10;
  const coins = Math.floor(baseCoins * ratingMultiplier[rating] * weatherEffect.coinMod);
  const xp = Math.floor(s.performance.score * 0.5 * ratingMultiplier[rating]);
  const reputationGain = Math.floor((s.performance.crowdEngagement / 10) * ratingMultiplier[rating]);
  const fansGained = Math.floor(s.performance.crowdEngagement * ratingMultiplier[rating] * 0.5);

  s.performance.coinsEarned = coins;
  s.performance.xpEarned = xp;
  s.performance.reputationEarned = reputationGain;

  // Apply rewards
  if (s.band) s.band.coins += coins;
  mfAddXP(xp);
  s.reputation = clamp(s.reputation + reputationGain, 0, 1000);
  s.fanClub.totalFans += fansGained;
  s.fanClub.activeFans = Math.min(s.fanClub.totalFans, Math.floor(s.fanClub.totalFans * 0.8));
  s.lastPerformanceTimestamp = Date.now();
  s.totalPerformances++;

  // Update tracking stats
  s.maxEngagement = Math.max(s.maxEngagement, s.performance.crowdEngagement);
  s.maxCrowdSize = Math.max(s.maxCrowdSize, s.performance.crowdSize);

  if (s.performance.weather === "storm") s.stormPerformances++;

  // Crowd size bonus
  if (stage && s.performance.crowdSize >= stage.capacity * 0.9) {
    s.reputation = clamp(s.reputation + 10, 0, 1000);
  }

  // Apply fatigue
  if (s.band) {
    for (const member of s.band.members) {
      member.fatigue = clamp(member.fatigue + 15, 0, 100);
      member.morale = clamp(member.morale - 5, 0, 100);
    }
  }

  // Add fan activity
  s.fanClub.recentActivity.unshift(`${fansGained} new fans from performance at ${stage?.name ?? "Unknown"}`);
  if (s.fanClub.recentActivity.length > 10) s.fanClub.recentActivity = s.fanClub.recentActivity.slice(0, 10);

  // Generate review
  const reviewRating = rating === "Legendary" ? 5 : rating === "Great" ? 4 : rating === "Good" ? 3 : rating === "Decent" ? 2 : 1;
  if (Math.random() < 0.7) {
    const review = generateCriticReview(reviewRating);
    s.reviews.unshift(review);
    if (s.reviews.length > 20) s.reviews = s.reviews.slice(0, 20);
    s.reputation = clamp(s.reputation + review.reputationImpact, 0, 1000);
    if (reviewRating >= 5) s.fiveStarReviews++;
  }

  // Check encore
  if (s.performance.crowdEngagement >= 75 && rating !== "Amateur") {
    s.encore.isAvailable = true;
    s.encore.bonusMultiplier = 1 + (s.performance.crowdEngagement - 75) / 25;
  }

  // Check achievements
  mfCheckAchievements();

  s.encore.bonusXP = Math.floor(xp * 0.5);
  s.encore.bonusCoins = Math.floor(coins * 0.5);

  return {
    success: true,
    message: `Rating: ${rating}! Earned ${coins} coins, ${xp} XP, +${reputationGain} reputation, +${fansGained} fans.`,
    rating,
    rewards: { coins, xp, reputation: reputationGain, fans: fansGained },
  };
}

export function mfGetPerformanceState(): PerformanceState | null {
  const s = ensureInit();
  if (!s.performance) return null;
  return { ...s.performance, songIds: [...s.performance.songIds] };
}

export function mfIsPerforming(): boolean {
  return ensureInit().performance?.isActive ?? false;
}

// ---------------------------------------------------------------------------
// Crowd System
// ---------------------------------------------------------------------------

export function mfGetCrowdState(): CrowdState {
  const s = ensureInit();
  return { ...s.crowd };
}

export function mfGetCrowdEngagement(): number {
  return ensureInit().crowd.engagement;
}

export function mfGetCrowdMood(): string {
  return ensureInit().crowd.mood;
}

export function mfGetCrowdSize(): number {
  return ensureInit().crowd.size;
}

export function mfIsCrowdChanting(): boolean {
  return ensureInit().crowd.chanting;
}

export function mfIsMoshPitActive(): boolean {
  return ensureInit().crowd.moshPitActive;
}

export function mfIsSingalongActive(): boolean {
  return ensureInit().crowd.singalongActive;
}

// ---------------------------------------------------------------------------
// Musician Level & XP
// ---------------------------------------------------------------------------

export function mfGetLevel(): MusicianLevel {
  const s = ensureInit();
  return { ...s.musicianLevel };
}

export function mfGetLevelNumber(): number {
  return ensureInit().musicianLevel.level;
}

export function mfGetLevelTitle(): string {
  return ensureInit().musicianLevel.title;
}

export function mfGetTotalXP(): number {
  return ensureInit().musicianLevel.totalXP;
}

export function mfGetXPProgress(): { current: number; needed: number; percentage: number } {
  const s = ensureInit();
  const current = s.musicianLevel.totalXP - LEVEL_XP_THRESHOLDS[s.musicianLevel.level - 1];
  const needed = s.musicianLevel.xpToNext;
  const percentage = needed > 0 ? Math.floor((current / needed) * 100) : 100;
  return { current, needed, percentage };
}

export function mfAddXP(amount: number): { newLevel: number; levelUp: boolean } {
  const s = ensureInit();
  const oldLevel = s.musicianLevel.level;
  s.musicianLevel.totalXP += amount;
  s.musicianLevel.level = clamp(computeLevel(s.musicianLevel.totalXP), 1, 40);
  s.musicianLevel.currentXP = s.musicianLevel.totalXP - LEVEL_XP_THRESHOLDS[s.musicianLevel.level - 1];
  s.musicianLevel.xpToNext = computeXPToNext(s.musicianLevel.level);
  s.musicianLevel.title = getLevelTitle(s.musicianLevel.level);
  const levelUp = s.musicianLevel.level > oldLevel;
  if (levelUp) mfCheckAchievements();
  return { newLevel: s.musicianLevel.level, levelUp };
}

// ---------------------------------------------------------------------------
// Instrument Collection
// ---------------------------------------------------------------------------

export function mfGetAllInstruments(): InstrumentDef[] {
  return [...INSTRUMENT_DEFS];
}

export function mfGetInstrument(defId: string): InstrumentDef | null {
  return INSTRUMENT_DEFS.find(i => i.id === defId) ?? null;
}

export function mfGetInstrumentsByRarity(rarity: RarityTier): InstrumentDef[] {
  return INSTRUMENT_DEFS.filter(i => i.rarity === rarity);
}

export function mfAcquireInstrument(defId: string): { success: boolean; message: string } {
  const s = ensureInit();
  const def = INSTRUMENT_DEFS.find(i => i.id === defId);
  if (!def) return { success: false, message: "Instrument not found." };
  if (s.band && s.band.coins < def.cost) return { success: false, message: `Not enough coins. Need ${def.cost}.` };
  if (s.ownedInstruments.some(i => i.defId === defId)) return { success: false, message: "Already owned." };

  if (s.band) s.band.coins -= def.cost;
  s.ownedInstruments.push({
    defId,
    acquiredTimestamp: Date.now(),
    upgradeLevel: 0,
    equipped: false,
  });

  mfCheckAchievements();
  return { success: true, message: `Acquired "${def.name}" (${def.rarity})!` };
}

export function mfGetOwnedInstruments(): OwnedInstrument[] {
  return [...ensureInit().ownedInstruments];
}

export function mfEquipInstrument(defId: string): boolean {
  const s = ensureInit();
  const owned = s.ownedInstruments.find(i => i.defId === defId);
  if (!owned) return false;
  owned.equipped = true;
  return true;
}

export function mfUnequipInstrument(defId: string): boolean {
  const s = ensureInit();
  const owned = s.ownedInstruments.find(i => i.defId === defId);
  if (!owned) return false;
  owned.equipped = false;
  return true;
}

export function mfUpgradeInstrument(defId: string): { success: boolean; newLevel: number; message: string } {
  const s = ensureInit();
  const owned = s.ownedInstruments.find(i => i.defId === defId);
  if (!owned) return { success: false, newLevel: 0, message: "Instrument not owned." };
  if (owned.upgradeLevel >= 4) return { success: false, newLevel: 4, message: "Already at max upgrade level." };

  const upgradeCost = Math.floor(50 * (owned.upgradeLevel + 1));
  if (s.band && s.band.coins < upgradeCost) return { success: false, newLevel: owned.upgradeLevel, message: `Not enough coins. Need ${upgradeCost}.` };
  if (s.band) s.band.coins -= upgradeCost;

  owned.upgradeLevel++;
  return { success: true, newLevel: owned.upgradeLevel, message: `Upgraded to level ${owned.upgradeLevel}!` };
}

export function mfGetInstrumentStats(defId: string): { tone: number; volume: number; durability: number } | null {
  const s = ensureInit();
  const owned = s.ownedInstruments.find(i => i.defId === defId);
  const def = INSTRUMENT_DEFS.find(i => i.id === defId);
  if (!def || !owned) return null;

  const upgradeBonus = owned.upgradeLevel * 5;
  return {
    tone: Math.min(100, def.baseStats.tone + upgradeBonus),
    volume: Math.min(100, def.baseStats.volume + upgradeBonus),
    durability: Math.min(100, def.baseStats.durability + upgradeBonus),
  };
}

// ---------------------------------------------------------------------------
// Sound Equipment
// ---------------------------------------------------------------------------

export function mfGetAllEquipment(): EquipmentDef[] {
  return [...EQUIPMENT_DEFS];
}

export function mfGetEquipmentDef(equipmentId: string): EquipmentDef | null {
  return EQUIPMENT_DEFS.find(e => e.id === equipmentId) ?? null;
}

export function mfGetOwnedEquipment(): Record<string, OwnedEquipment> {
  const s = ensureInit();
  const result: Record<string, OwnedEquipment> = {};
  for (const [id, eq] of Object.entries(s.ownedEquipment)) {
    result[id] = { ...eq };
  }
  return result;
}

export function mfPurchaseEquipment(equipmentId: string): { success: boolean; message: string } {
  const s = ensureInit();
  const def = EQUIPMENT_DEFS.find(e => e.id === equipmentId);
  if (!def) return { success: false, message: "Equipment not found." };
  if (s.ownedEquipment[equipmentId]) return { success: false, message: "Already owned." };
  if (s.band && s.band.coins < def.upgradeCost) return { success: false, message: `Not enough coins. Need ${def.upgradeCost}.` };
  if (s.band) s.band.coins -= def.upgradeCost;

  s.ownedEquipment[equipmentId] = {
    defId: equipmentId,
    currentLevel: 1,
    currentEffect: def.baseEffect,
  };
  return { success: true, message: `Purchased "${def.name}"!` };
}

export function mfUpgradeEquipment(equipmentId: string): { success: boolean; newLevel: number; message: string } {
  const s = ensureInit();
  const def = EQUIPMENT_DEFS.find(e => e.id === equipmentId);
  if (!def) return { success: false, newLevel: 0, message: "Equipment not found." };
  const owned = s.ownedEquipment[equipmentId];
  if (!owned) return { success: false, newLevel: 0, message: "Not owned." };
  if (owned.currentLevel >= def.maxUpgradeLevel) return { success: false, newLevel: owned.currentLevel, message: "Already at max level." };

  const cost = Math.floor(def.upgradeCost * (owned.currentLevel + 1) * 0.8);
  if (s.band && s.band.coins < cost) return { success: false, newLevel: owned.currentLevel, message: `Not enough coins. Need ${cost}.` };
  if (s.band) s.band.coins -= cost;

  owned.currentLevel++;
  owned.currentEffect = Math.floor(def.baseEffect * (1 + (owned.currentLevel - 1) * 0.3));
  return { success: true, newLevel: owned.currentLevel, message: `Upgraded "${def.name}" to level ${owned.currentLevel}!` };
}

// ---------------------------------------------------------------------------
// Festival Reputation
// ---------------------------------------------------------------------------

export function mfGetReputation(): number {
  return ensureInit().reputation;
}

export function mfGetReputationRank(): string {
  const rep = ensureInit().reputation;
  if (rep >= 800) return "Festival Legend";
  if (rep >= 600) return "Headliner";
  if (rep >= 400) return "Main Attraction";
  if (rep >= 250) return "Rising Star";
  if (rep >= 100) return "Local Favorite";
  if (rep >= 50) return "Newcomer";
  return "Unknown";
}

export function mfAddReputation(amount: number): number {
  const s = ensureInit();
  s.reputation = clamp(s.reputation + amount, 0, 1000);
  return s.reputation;
}

// ---------------------------------------------------------------------------
// Fan Club
// ---------------------------------------------------------------------------

export function mfGetFanClub(): FanClub {
  const s = ensureInit();
  return {
    totalFans: s.fanClub.totalFans,
    activeFans: s.fanClub.activeFans,
    milestones: [...s.fanClub.milestones],
    recentActivity: [...s.fanClub.recentActivity],
  };
}

export function mfGetFanCount(): number {
  return ensureInit().fanClub.totalFans;
}

export function mfGetActiveFanCount(): number {
  return ensureInit().fanClub.activeFans;
}

export function mfGetFanMilestones(): FanMilestone[] {
  return [...ensureInit().fanClub.milestones];
}

export function mfClaimFanReward(milestoneIndex: number): { success: boolean; message: string; reward?: { type: string; amount: number; label: string } } {
  const s = ensureInit();
  const milestone = s.fanClub.milestones[milestoneIndex];
  if (!milestone) return { success: false, message: "Milestone not found." };
  if (milestone.claimed) return { success: false, message: "Already claimed." };
  if (s.fanClub.totalFans < milestone.fansRequired) return { success: false, message: `Need ${milestone.fansRequired} fans. Have ${s.fanClub.totalFans}.` };

  milestone.claimed = true;
  const reward = milestone.reward;
  switch (reward.type) {
    case "coins":
      if (s.band) s.band.coins += reward.amount;
      break;
    case "xp":
      mfAddXP(reward.amount);
      break;
    case "reputation":
      mfAddReputation(reward.amount);
      break;
  }

  mfCheckAchievements();
  return { success: true, message: `Claimed "${reward.label}"!`, reward };
}

// ---------------------------------------------------------------------------
// Tour System
// ---------------------------------------------------------------------------

export function mfGetTourState(): TourState {
  const s = ensureInit();
  return {
    stops: s.tour.stops.map(stop => ({ ...stop })),
    currentStopIndex: s.tour.currentStopIndex,
    isActive: s.tour.isActive,
    startDate: s.tour.startDate,
    completionDate: s.tour.completionDate,
  };
}

export function mfStartTour(): { success: boolean; message: string } {
  const s = ensureInit();
  if (s.tour.isActive) return { success: false, message: "Tour is already in progress." };
  if (s.band === null) return { success: false, message: "Create a band first." };

  s.tour.isActive = true;
  s.tour.startDate = Date.now();
  s.tour.currentStopIndex = 0;
  s.tour.completionDate = null;
  s.tour.stops.forEach(stop => {
    stop.completed = false;
    stop.completedTimestamp = null;
  });

  return { success: true, message: "Tour started! First stop: " + s.tour.stops[0].name + "." };
}

export function mfGetCurrentTourStop(): TourStop | null {
  const s = ensureInit();
  if (!s.tour.isActive) return null;
  return s.tour.stops[s.tour.currentStopIndex] ?? null;
}

export function mfCompleteTourStop(performanceScore: number): { success: boolean; message: string; reward: number } {
  const s = ensureInit();
  if (!s.tour.isActive) return { success: false, message: "No active tour.", reward: 0 };

  const stop = s.tour.stops[s.tour.currentStopIndex];
  if (!stop) return { success: false, message: "No current tour stop.", reward: 0 };
  if (stop.completed) return { success: false, message: "This stop is already completed.", reward: 0 };

  const scoreBonus = Math.floor(performanceScore * 0.2);
  const totalReward = stop.reward + scoreBonus;
  stop.completed = true;
  stop.completedTimestamp = Date.now();

  if (s.band) s.band.coins += totalReward;
  mfAddReputation(5);

  // Advance to next stop
  s.tour.currentStopIndex++;
  if (s.tour.currentStopIndex >= s.tour.stops.length) {
    s.tour.isActive = false;
    s.tour.completionDate = Date.now();
    mfCheckAchievements();
    return { success: true, message: "Tour complete! All stops finished! Bonus: reputation boost!", reward: totalReward };
  }

  const nextStop = s.tour.stops[s.tour.currentStopIndex];
  mfCheckAchievements();
  return {
    success: true,
    message: `Completed "${stop.name}"! Earned ${totalReward} coins. Next: "${nextStop.name}" in ${nextStop.location}.`,
    reward: totalReward,
  };
}

export function mfGetCompletedTourStops(): number {
  return ensureInit().tour.stops.filter(s => s.completed).length;
}

// ---------------------------------------------------------------------------
// Songwriting Studio
// ---------------------------------------------------------------------------

export function mfGetWordFragments(): SongFragment[] {
  return [...SONG_FRAGMENTS];
}

export function mfGetFragmentsByGenre(genre: MusicGenre): SongFragment[] {
  return SONG_FRAGMENTS.filter(f => f.genre.includes(genre));
}

export function mfGetFragmentsByMood(mood: SongFragment["mood"]): SongFragment[] {
  return SONG_FRAGMENTS.filter(f => f.mood === mood);
}

export function mfCheckRhyme(word1: string, word2: string): boolean {
  return checkRhyme(word1, word2);
}

export function mfGetRhymingWords(word: string): string[] {
  const normalized = word.toLowerCase().trim();
  const results: string[] = [];
  for (const frag of SONG_FRAGMENTS) {
    if (frag.word.toLowerCase() === normalized) {
      results.push(...frag.rhymesWith);
    }
    if (frag.rhymesWith.map(r => r.toLowerCase()).includes(normalized)) {
      results.push(frag.word);
    }
  }
  return results.filter((v, i, a) => a.indexOf(v) === i);
}

export function mfComposeSong(
  title: string,
  fragments: string[],
  genre: MusicGenre
): { success: boolean; message: string; quality: number } {
  const s = ensureInit();
  if (fragments.length < 4) return { success: false, message: "Need at least 4 word fragments.", quality: 0 };
  if (fragments.length > 20) return { success: false, message: "Maximum 20 fragments per song.", quality: 0 };

  // Calculate quality based on rhyme matching, genre alignment, and length
  let rhymeScore = 0;
  let rhymePairs = 0;
  for (let i = 0; i < fragments.length - 1; i++) {
    if (checkRhyme(fragments[i], fragments[i + 1])) {
      rhymeScore += 15;
      rhymePairs++;
    }
  }

  // Also check alternating rhymes (AABB or ABAB pattern)
  for (let i = 0; i < fragments.length - 2; i += 2) {
    if (checkRhyme(fragments[i], fragments[i + 2])) {
      rhymeScore += 10;
    }
  }

  const genreMatchScore = fragments.filter(f => {
    const frag = SONG_FRAGMENTS.find(sf => sf.word.toLowerCase() === f.toLowerCase());
    return frag && frag.genre.includes(genre);
  }).length * 5;

  const lengthScore = Math.min(fragments.length * 2, 20);
  const bandSkillBonus = mfGetAverageSkill() / 10;

  const rawQuality = rhymeScore + genreMatchScore + lengthScore + bandSkillBonus;
  const quality = clamp(Math.floor(rawQuality), 1, 100);

  const composedSong: ComposedSong = {
    title: title.trim() || "Untitled",
    fragments: [...fragments],
    genre,
    quality,
    timestamp: Date.now(),
  };

  s.composedSongs.push(composedSong);
  s.bestSongQuality = Math.max(s.bestSongQuality, quality);

  const xpGain = Math.floor(quality * 2);
  mfAddXP(xpGain);

  mfCheckAchievements();
  const qualityLabel = quality >= 90 ? "Masterpiece!" : quality >= 70 ? "Great song!" : quality >= 50 ? "Decent composition." : "Keep practicing!";

  return { success: true, message: `Composed "${composedSong.title}" - Quality: ${quality}/100. ${qualityLabel} +${xpGain} XP.`, quality };
}

export function mfGetComposedSongs(): ComposedSong[] {
  return [...ensureInit().composedSongs];
}

export function mfGetBestSongQuality(): number {
  return ensureInit().bestSongQuality;
}

// ---------------------------------------------------------------------------
// Weather System
// ---------------------------------------------------------------------------

export function mfGetWeather(): WeatherCondition {
  return getWeatherForDay(getDayKey(Date.now()));
}

export function mfGetWeatherEffects(weather: WeatherCondition): { crowdMod: number; skillMod: number; coinMod: number; description: string } {
  return WEATHER_EFFECTS[weather];
}

export function mfGetAllWeatherTypes(): WeatherCondition[] {
  return ["clear", "rain", "wind", "heat", "storm"];
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

export function mfGetAllAchievements(): AchievementDef[] {
  return [...ensureInit().achievements];
}

export function mfGetUnlockedAchievements(): AchievementDef[] {
  return ensureInit().achievements.filter(a => a.unlocked);
}

export function mfGetAchievement(achievementId: string): AchievementDef | null {
  return ensureInit().achievements.find(a => a.id === achievementId) ?? null;
}

export function mfCheckAchievement(achievementId: string): boolean {
  return ensureInit().achievements.find(a => a.id === achievementId)?.unlocked ?? false;
}

export function mfGetAchievementCount(): { unlocked: number; total: number } {
  const s = ensureInit();
  const unlocked = s.achievements.filter(a => a.unlocked).length;
  return { unlocked, total: s.achievements.length };
}

function mfCheckAchievements(): void {
  const s = ensureInit();

  // First Gig
  if (!s.achievements[0].unlocked && s.totalPerformances >= 1) {
    s.achievements[0].unlocked = true;
    s.achievements[0].unlockedTimestamp = Date.now();
    s.achievements[0].progress = 1;
    if (s.band) s.band.coins += 50;
  }

  // Standing Ovation
  if (!s.achievements[1].unlocked && s.maxEngagement >= 95) {
    s.achievements[1].unlocked = true;
    s.achievements[1].unlockedTimestamp = Date.now();
    s.achievements[1].progress = s.maxEngagement;
    mfAddReputation(50);
  }

  // Sold Out
  if (!s.achievements[2].unlocked && s.performance && s.maxCrowdSize > 0) {
    const stage = STAGES.find(st => st.id === s.performance!.stageId);
    if (stage && s.maxCrowdSize >= stage.capacity * 0.9) {
      s.achievements[2].unlocked = true;
      s.achievements[2].unlockedTimestamp = Date.now();
      s.achievements[2].progress = s.maxCrowdSize;
      if (s.band) s.band.coins += 200;
    }
  }

  // Tour Complete
  if (!s.achievements[3].unlocked && s.tour.stops.every(stop => stop.completed)) {
    s.achievements[3].unlocked = true;
    s.achievements[3].unlockedTimestamp = Date.now();
    s.achievements[3].progress = 8;
    mfAddReputation(100);
  }

  // Hit Single
  if (!s.achievements[4].unlocked && s.bestSongQuality >= 90) {
    s.achievements[4].unlocked = true;
    s.achievements[4].unlockedTimestamp = Date.now();
    s.achievements[4].progress = s.bestSongQuality;
    mfAddXP(500);
  }

  // Gearhead
  if (!s.achievements[5].unlocked && s.ownedInstruments.length >= 10) {
    s.achievements[5].unlocked = true;
    s.achievements[5].unlockedTimestamp = Date.now();
    s.achievements[5].progress = s.ownedInstruments.length;
    if (s.band) s.band.coins += 150;
  }

  // Five-Star Show
  if (!s.achievements[6].unlocked && s.fiveStarReviews >= 1) {
    s.achievements[6].unlocked = true;
    s.achievements[6].unlockedTimestamp = Date.now();
    s.achievements[6].progress = s.fiveStarReviews;
    mfAddReputation(75);
  }

  // Crowd Favorite
  if (!s.achievements[7].unlocked && s.fanClub.totalFans >= 500) {
    s.achievements[7].unlocked = true;
    s.achievements[7].unlockedTimestamp = Date.now();
    s.achievements[7].progress = s.fanClub.totalFans;
    if (s.band) s.band.coins += 300;
  }

  // Encore King
  if (!s.achievements[8].unlocked && s.encoresTriggered >= 5) {
    s.achievements[8].unlocked = true;
    s.achievements[8].unlockedTimestamp = Date.now();
    s.achievements[8].progress = s.encoresTriggered;
    mfAddXP(400);
  }

  // Lyricist
  if (!s.achievements[9].unlocked && s.composedSongs.length >= 10) {
    s.achievements[9].unlocked = true;
    s.achievements[9].unlockedTimestamp = Date.now();
    s.achievements[9].progress = s.composedSongs.length;
    mfAddXP(600);
  }

  // Weathered Storm
  if (!s.achievements[10].unlocked && s.stormPerformances >= 1) {
    s.achievements[10].unlocked = true;
    s.achievements[10].unlockedTimestamp = Date.now();
    s.achievements[10].progress = s.stormPerformances;
    mfAddReputation(40);
  }

  // Full Band
  if (!s.achievements[11].unlocked && s.band && s.band.members.every(m => m.morale >= 90)) {
    s.achievements[11].unlocked = true;
    s.achievements[11].unlockedTimestamp = Date.now();
    s.achievements[11].progress = s.band.members.length;
    if (s.band) s.band.coins += 250;
  }

  // Merch Mogul
  if (!s.achievements[12].unlocked && s.totalMerchSold >= 100) {
    s.achievements[12].unlocked = true;
    s.achievements[12].unlockedTimestamp = Date.now();
    s.achievements[12].progress = s.totalMerchSold;
    if (s.band) s.band.coins += 500;
  }

  // Collab Star
  if (!s.achievements[13].unlocked && s.collaborationsDone >= 5) {
    s.achievements[13].unlocked = true;
    s.achievements[13].unlockedTimestamp = Date.now();
    s.achievements[13].progress = s.collaborationsDone;
    mfAddReputation(60);
  }

  // Legendary Status
  if (!s.achievements[14].unlocked && s.musicianLevel.level >= 40) {
    s.achievements[14].unlocked = true;
    s.achievements[14].unlockedTimestamp = Date.now();
    s.achievements[14].progress = s.musicianLevel.level;
    mfAddReputation(200);
  }
}

// ---------------------------------------------------------------------------
// Encore System
// ---------------------------------------------------------------------------

export function mfGetEncoreState(): EncoreState {
  return { ...ensureInit().encore };
}

export function mfIsEncoreAvailable(): boolean {
  return ensureInit().encore.isAvailable;
}

export function mfStartEncore(songId: string): { success: boolean; message: string; bonusXP: number; bonusCoins: number } {
  const s = ensureInit();
  if (!s.encore.isAvailable) return { success: false, message: "No encore available. Perform better first!", bonusXP: 0, bonusCoins: 0 };

  const song = SONGS.find(song => song.id === songId);
  if (!song) return { success: false, message: "Song not found.", bonusXP: 0, bonusCoins: 0 };

  s.encore.isActive = true;
  s.encore.songId = songId;
  s.encoresTriggered++;

  const bonusXP = Math.floor(s.encore.bonusXP * s.encore.bonusMultiplier);
  const bonusCoins = Math.floor(s.encore.bonusCoins * s.encore.bonusMultiplier);

  mfAddXP(bonusXP);
  if (s.band) s.band.coins += bonusCoins;
  s.reputation = clamp(s.reputation + 5, 0, 1000);

  const fansGained = Math.floor(s.crowd.engagement * 0.3);
  s.fanClub.totalFans += fansGained;
  s.fanClub.activeFans = Math.min(s.fanClub.totalFans, Math.floor(s.fanClub.totalFans * 0.8));

  s.encore.isActive = false;
  s.encore.isAvailable = false;
  s.fanClub.recentActivity.unshift(`Encore performance of "${song.title}"! +${fansGained} fans.`);
  if (s.fanClub.recentActivity.length > 10) s.fanClub.recentActivity = s.fanClub.recentActivity.slice(0, 10);

  mfCheckAchievements();
  return { success: true, message: `Encore! "${song.title}" rocks the house! +${bonusXP} XP, +${bonusCoins} coins, +${fansGained} fans!`, bonusXP, bonusCoins };
}

export function mfGetEncoreBonusMultiplier(): number {
  return ensureInit().encore.bonusMultiplier;
}

// ---------------------------------------------------------------------------
// Merch Booth
// ---------------------------------------------------------------------------

export function mfGetMerchBooth(): MerchBooth {
  const s = ensureInit();
  return {
    items: s.merchBooth.items.map(i => ({ ...i })),
    totalRevenue: s.merchBooth.totalRevenue,
    totalItemsSold: s.merchBooth.totalItemsSold,
  };
}

export function mfGetMerchItem(merchId: string): MerchItemDef | null {
  return MERCH_DEFS.find(m => m.id === merchId) ?? null;
}

export function mfGetAllMerchDefs(): MerchItemDef[] {
  return [...MERCH_DEFS];
}

export function mfSellMerch(merchDefId: string, quantity: number): { success: boolean; message: string; revenue: number } {
  const s = ensureInit();
  const item = s.merchBooth.items.find(i => i.defId === merchDefId);
  if (!item) return { success: false, message: "Merch item not found.", revenue: 0 };
  if (item.stock < quantity) return { success: false, message: `Not enough stock. Have ${item.stock}, need ${quantity}.`, revenue: 0 };

  const reputationMultiplier = 1 + s.reputation / 500;
  const revenue = Math.floor(item.price * quantity * reputationMultiplier);

  item.stock -= quantity;
  item.sold += quantity;
  s.merchBooth.totalRevenue += revenue;
  s.merchBooth.totalItemsSold += quantity;
  s.totalMerchSold += quantity;

  if (s.band) s.band.coins += revenue;

  mfCheckAchievements();
  return { success: true, message: `Sold ${quantity} "${MERCH_DEFS.find(m => m.id === merchDefId)?.name ?? merchDefId}" for ${revenue} coins!`, revenue };
}

export function mfRestockMerch(merchDefId: string, quantity: number): { success: boolean; cost: number; message: string } {
  const s = ensureInit();
  const item = s.merchBooth.items.find(i => i.defId === merchDefId);
  const def = MERCH_DEFS.find(m => m.id === merchDefId);
  if (!item || !def) return { success: false, cost: 0, message: "Merch item not found." };

  const restockCost = Math.floor(def.basePrice * 0.3 * quantity);
  if (s.band && s.band.coins < restockCost) return { success: false, cost: restockCost, message: `Not enough coins. Need ${restockCost}.` };
  if (s.band) s.band.coins -= restockCost;

  item.stock += quantity;
  return { success: true, cost: restockCost, message: `Restocked ${quantity} items for ${restockCost} coins.` };
}

export function mfGetTotalMerchRevenue(): number {
  return ensureInit().merchBooth.totalRevenue;
}

export function mfGetTotalMerchSold(): number {
  return ensureInit().merchBooth.totalItemsSold;
}

// ---------------------------------------------------------------------------
// Review System
// ---------------------------------------------------------------------------

export function mfGetReviews(): CriticReview[] {
  return [...ensureInit().reviews];
}

export function mfGetLatestReview(): CriticReview | null {
  return ensureInit().reviews[0] ?? null;
}

export function mfGetFiveStarReviewCount(): number {
  return ensureInit().fiveStarReviews;
}

export function mfGetAverageReviewRating(): number {
  const s = ensureInit();
  if (s.reviews.length === 0) return 0;
  return Math.round((s.reviews.reduce((sum, r) => sum + r.rating, 0) / s.reviews.length) * 10) / 10;
}

export function mfGetReviewCount(): number {
  return ensureInit().reviews.length;
}

// ---------------------------------------------------------------------------
// Collaborations
// ---------------------------------------------------------------------------

export function mfGetAllArtists(): FeaturedArtist[] {
  return FEATURED_ARTISTS.map(a => ({ ...a }));
}

export function mfGetArtist(artistId: string): FeaturedArtist | null {
  return FEATURED_ARTISTS.find(a => a.id === artistId) ?? null;
}

export function mfGetArtistsByGenre(genre: MusicGenre): FeaturedArtist[] {
  return FEATURED_ARTISTS.filter(a => a.genre === genre);
}

export function mfCollaborateWith(artistId: string): { success: boolean; message: string; bonusMultiplier: number; bonusSkill: string } {
  const s = ensureInit();
  const artist = FEATURED_ARTISTS.find(a => a.id === artistId);
  if (!artist) return { success: false, message: "Artist not found.", bonusMultiplier: 0, bonusSkill: "" };
  if (artist.collaborationsRemaining <= 0) return { success: false, message: `No collaborations remaining with ${artist.name}.`, bonusMultiplier: 0, bonusSkill: "" };
  if (s.band && s.band.coins < artist.costToCollaborate) return { success: false, message: `Not enough coins. Need ${artist.costToCollaborate}.`, bonusMultiplier: 0, bonusSkill: "" };

  if (s.band) s.band.coins -= artist.costToCollaborate;
  artist.collaborationsRemaining--;
  s.activeCollaboratorId = artistId;
  s.collaborationsDone++;
  if (!s.collaboratedArtistIds.includes(artistId)) s.collaboratedArtistIds.push(artistId);

  // Boost the relevant band skill
  const skillGain = Math.floor(Math.random() * 5) + 3;
  s.bandSkills[artist.specialty] = clamp(s.bandSkills[artist.specialty] + skillGain, 1, 100);

  mfCheckAchievements();
  return {
    success: true,
    message: `Collaborating with ${artist.name}! ${artist.specialty} +${skillGain}. Bonus: ${artist.bonusMultiplier}x for next performance!`,
    bonusMultiplier: artist.bonusMultiplier,
    bonusSkill: artist.specialty,
  };
}

export function mfGetCollaborationCount(): number {
  return ensureInit().collaborationsDone;
}

export function mfGetActiveCollaborator(): FeaturedArtist | null {
  const s = ensureInit();
  if (!s.activeCollaboratorId) return null;
  return FEATURED_ARTISTS.find(a => a.id === s.activeCollaboratorId) ?? null;
}

// ---------------------------------------------------------------------------
// Daily Gig
// ---------------------------------------------------------------------------

export function mfGetDailyGig(): DailyGig | null {
  const s = ensureInit();
  ensureDailyReset(s);
  return s.dailyGig;
}

export function mfCompleteDailyGig(score: number): { success: boolean; message: string; bonusReward: number } {
  const s = ensureInit();
  ensureDailyReset(s);
  if (!s.dailyGig) return { success: false, message: "No daily gig available.", bonusReward: 0 };
  if (s.dailyGig.completed) return { success: false, message: "Daily gig already completed today.", bonusReward: 0 };

  s.dailyGig.completed = true;
  s.dailyGig.completedTimestamp = Date.now();

  const bonusMultiplier = clamp(score / 50, 0.5, 2.0);
  const bonusReward = Math.floor(s.dailyGig.bonusReward * bonusMultiplier);

  if (s.band) s.band.coins += bonusReward;
  mfAddXP(Math.floor(bonusReward * 0.5));

  return { success: true, message: `Daily gig complete! Earned ${bonusReward} bonus coins!`, bonusReward };
}

export function mfIsDailyGigCompleted(): boolean {
  const s = ensureInit();
  ensureDailyReset(s);
  return s.dailyGig?.completed ?? false;
}

// ---------------------------------------------------------------------------
// Show Ratings
// ---------------------------------------------------------------------------

export function mfCalculateShowRating(score: number, combo: number, engagement: number): ShowRating {
  return calculateShowRating(score, combo, engagement);
}

export function mfGetRatingMultiplier(rating: ShowRating): number {
  const map: Record<ShowRating, number> = { Amateur: 0.5, Decent: 1.0, Good: 1.5, Great: 2.5, Legendary: 4.0 };
  return map[rating];
}

export function mfGetAllRatings(): ShowRating[] {
  return ["Amateur", "Decent", "Good", "Great", "Legendary"];
}

// ---------------------------------------------------------------------------
// Genre Utilities
// ---------------------------------------------------------------------------

export function mfGetAllGenres(): MusicGenre[] {
  return [...MUSIC_GENRES];
}

export function mfGetGenreSongCount(genre: MusicGenre): number {
  return SONGS.filter(s => s.genre === genre).length;
}

// ---------------------------------------------------------------------------
// Stats & Summary
// ---------------------------------------------------------------------------

export function mfGetCareerStats(): {
  totalPerformances: number;
  totalFans: number;
  reputation: number;
  musicianLevel: number;
  coins: number;
  totalXP: number;
  achievementsUnlocked: number;
  songsComposed: number;
  merchSold: number;
  tourProgress: string;
  averageReviewRating: number;
} {
  const s = ensureInit();
  const completedStops = s.tour.stops.filter(stop => stop.completed).length;
  return {
    totalPerformances: s.totalPerformances,
    totalFans: s.fanClub.totalFans,
    reputation: s.reputation,
    musicianLevel: s.musicianLevel.level,
    coins: s.band?.coins ?? 0,
    totalXP: s.musicianLevel.totalXP,
    achievementsUnlocked: s.achievements.filter(a => a.unlocked).length,
    songsComposed: s.composedSongs.length,
    merchSold: s.totalMerchSold,
    tourProgress: `${completedStops}/${s.tour.stops.length}`,
    averageReviewRating: mfGetAverageReviewRating(),
  };
}

export function mfGetHint(context: string): string {
  const hints: Record<string, string[]> = {
    performance: [
      "Keep your combo going for higher scores!",
      "Match lyrics accurately to boost crowd engagement.",
      "Use your band skills to your advantage — high Energy keeps the crowd pumped.",
      "Outdoor stages are affected by weather — check the forecast!",
      "Collaborate with featured artists for bonus multipliers.",
    ],
    songwriting: [
      "Rhyming words boost your song quality significantly.",
      "Choose fragments that match your song's genre.",
      "Longer songs with consistent rhyming score higher.",
      "Check the rhyme database — some words have many rhyme partners.",
    ],
    touring: [
      "Complete tour stops in order for the best rewards.",
      "Higher performance scores give bigger bonuses at each stop.",
      "Rest your band between performances to manage fatigue.",
      "The World Tour Finale requires strong reputation — keep performing!",
    ],
    merch: [
      "Higher reputation means better merch prices.",
      "Restock popular items before big performances.",
      "Digital merch never runs out of stock!",
    ],
  };

  const contextHints = hints[context] ?? hints.performance;
  return pickRandom(contextHints);
}

export function mfActivateAbility(ability: string): { success: boolean; message: string; effect?: number } {
  const s = ensureInit();
  if (!s.performance?.isActive) return { success: false, message: "No active performance to use abilities." };
  if (!s.band) return { success: false, message: "No band exists." };

  switch (ability) {
    case "hype_crowd": {
      const gain = clamp(5 + Math.floor(s.bandSkills["Stage Presence"] / 20), 5, 15);
      s.performance.crowdEngagement = clamp(s.performance.crowdEngagement + gain, 0, 100);
      s.crowd.engagement = s.performance.crowdEngagement;
      s.crowd.mood = calculateCrowdMood(s.crowd.engagement);
      return { success: true, message: `Hyped the crowd! Engagement +${gain}.`, effect: gain };
    }
    case "solo": {
      const skillAvg = mfGetAverageSkill();
      const bonus = Math.floor(skillAvg * 0.5);
      s.performance.score += bonus;
      return { success: true, message: `Band solo! +${bonus} bonus points.`, effect: bonus };
    }
    case "cool_down": {
      const fatigueReduction = 10;
      for (const member of s.band.members) {
        member.fatigue = clamp(member.fatigue - fatigueReduction, 0, 100);
      }
      return { success: true, message: `Band cooled down! Fatigue -${fatigueReduction} for all members.`, effect: fatigueReduction };
    }
    case "revive_morale": {
      const moraleGain = 8;
      for (const member of s.band.members) {
        member.morale = clamp(member.morale + moraleGain, 0, 100);
      }
      return { success: true, message: `Morale boosted! +${moraleGain} for all members.`, effect: moraleGain };
    }
    default:
      return { success: false, message: `Unknown ability: ${ability}.` };
  }
}

export function mfGetCurrentSongTitle(): string | null {
  const s = ensureInit();
  if (!s.performance?.isActive) return null;
  const song = SONGS.find(song => song.id === s.performance!.songIds[s.performance!.currentSongIndex]);
  return song?.title ?? null;
}

export function mfGetCurrentLyricWord(): string | null {
  const s = ensureInit();
  if (!s.performance?.isActive) return null;
  const song = SONGS.find(song => song.id === s.performance!.songIds[s.performance!.currentSongIndex]);
  if (!song) return null;
  return song.lyrics[s.performance.currentLyricIndex] ?? null;
}

export function mfGetPerformanceProgress(): { currentSong: number; totalSongs: number; currentLyric: number; totalLyrics: number; percentage: number } {
  const s = ensureInit();
  if (!s.performance) return { currentSong: 0, totalSongs: 0, currentLyric: 0, totalLyrics: 0, percentage: 0 };

  let totalLyrics = 0;
  let completedLyrics = 0;

  for (let i = 0; i < s.performance.songIds.length; i++) {
    const song = SONGS.find(song => song.id === s.performance!.songIds[i]);
    if (!song) continue;
    totalLyrics += song.lyrics.length;
    if (i < s.performance.currentSongIndex) {
      completedLyrics += song.lyrics.length;
    } else if (i === s.performance.currentSongIndex) {
      completedLyrics += s.performance.currentLyricIndex;
    }
  }

  const percentage = totalLyrics > 0 ? Math.floor((completedLyrics / totalLyrics) * 100) : 0;

  return {
    currentSong: s.performance.currentSongIndex + 1,
    totalSongs: s.performance.songIds.length,
    currentLyric: s.performance.currentLyricIndex,
    totalLyrics: SONGS.find(song => song.id === s.performance.songIds[s.performance.currentSongIndex])?.lyrics.length ?? 0,
    percentage,
  };
}

export function mfGetTimeSinceLastPerformance(): number {
  const s = ensureInit();
  if (s.lastPerformanceTimestamp === 0) return -1;
  return Date.now() - s.lastPerformanceTimestamp;
}

export function mfGetStageName(stageId: string): string | null {
  return STAGES.find(s => s.id === stageId)?.name ?? null;
}

export function mfGetSongTitle(songId: string): string | null {
  return SONGS.find(s => s.id === songId)?.title ?? null;
}

export function mfGetSongEnergy(songId: string): number {
  return SONGS.find(s => s.id === songId)?.energyLevel ?? 0;
}
