// ============================================================================
// Horror Escape Wire — Word Snake Game Module
// A spine-tingling escape room puzzle engine with survival mechanics,
// 8 themed rooms, 6 clue types, and 30+ built-in word/letter puzzles.
// ============================================================================
// SSR-SAFE: No browser APIs at module level. Uses lazy init pattern.
// PREFIX: All public exports use the `he` prefix.
// NO HOOKS: No React hooks exported.
// ============================================================================

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export type ClueType =
  | 'word-riddle'
  | 'anagram-lock'
  | 'symbol-match'
  | 'pattern-sequence'
  | 'morse-code'
  | 'cipher-decode';

export type DifficultyTier = 'creepy' | 'frightening' | 'terrifying' | 'nightmare';

export type RoomStatus = 'locked' | 'available' | 'in-progress' | 'completed' | 'failed';

export type HintLevel = 'subtle' | 'moderate' | 'direct';

export type ArtifactRarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'cursed';

export type GhostEventType =
  | 'whisper'
  | 'shadow-figure'
  | 'cold-breeze'
  | 'objects-move'
  | 'flickering-lights'
  | 'blood-writing'
  | 'sudden-sound'
  | 'mirror-haunting';

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface RoomDefinition {
  id: number;
  name: string;
  description: string;
  theme: string;
  difficulty: DifficultyTier;
  timeLimit: number; // seconds
  puzzlesPerRoom: number;
  unlockRequirement: number; // room index or -1
  loreIntro: string;
  atmosphereColor: string;
  ambientSound: string;
}

export interface PuzzleData {
  id: string;
  clueType: ClueType;
  difficulty: DifficultyTier;
  question: string;
  answer: string;
  hintSubtle: string;
  hintModerate: string;
  hintDirect: string;
  timeBonus: number;
  sanityCost: number;
  lore: string;
  requiredArtifact?: string;
  optionalArtifact?: string; // makes puzzle easier
}

export interface Artifact {
  id: string;
  name: string;
  description: string;
  lore: string;
  rarity: ArtifactRarity;
  effect: string;
  sanityBonus: number;
  foundInRoom: number;
}

export interface RoomState {
  roomId: number;
  status: RoomStatus;
  puzzlesSolved: number;
  totalPuzzles: number;
  startTime: number | null;
  endTime: number | null;
  artifactsFound: string[];
  sanitySpent: number;
  hintsUsedInRoom: number;
  ghostEventsInRoom: number;
  bestTime: number | null;
  completionCount: number;
}

export interface GhostEvent {
  type: GhostEventType;
  description: string;
  sanityImpact: number;
  duration: number; // ms
  isPositive: boolean;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  maxProgress: number;
}

export interface AchievementProgress {
  id: string;
  current: number;
  max: number;
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface EscapeRun {
  runId: string;
  roomId: number;
  roomName: string;
  completed: boolean;
  startTime: number;
  endTime: number | null;
  duration: number;
  score: number;
  grade: Grade;
  puzzlesSolved: number;
  totalPuzzles: number;
  hintsUsed: number;
  sanityRemaining: number;
  artifactsFound: string[];
  isNightmare: boolean;
  ghostEncounters: number;
}

export interface DailyChallenge {
  date: string;
  roomId: number;
  puzzleId: string;
  completed: boolean;
  score: number;
  bestScore: number;
}

export interface HintResult {
  level: HintLevel;
  text: string;
  sanityCost: number;
  remainingSanity: number;
}

export interface SolveResult {
  correct: boolean;
  message: string;
  scoreGained: number;
  sanityChange: number;
  timeBonus: number;
  puzzleCompleted: boolean;
  roomCompleted: boolean;
}

export interface GhostEncounterResult {
  event: GhostEvent;
  newSanity: number;
  message: string;
  artifactFound: string | null;
}

export interface RoomProgress {
  roomId: number;
  roomName: string;
  status: RoomStatus;
  puzzlesSolved: number;
  totalPuzzles: number;
  bestTime: number | null;
  completionCount: number;
  stars: number; // 0-3
}

export interface OverallStats {
  totalEscapes: number;
  totalRoomsCompleted: number;
  totalPuzzlesSolved: number;
  totalScore: number;
  bestTime: number;
  bestGrade: Grade;
  totalHintsUsed: number;
  totalGhostEncounters: number;
  nightmareCompletions: number;
  perfectRuns: number;
  averageSanityRemaining: number;
  currentStreak: number;
  bestStreak: number;
  totalPlaytime: number;
}

export interface SanitySnapshot {
  current: number;
  max: number;
  level: string;
  color: string;
  effects: string[];
  isHallucinating: boolean;
}

export interface NightmareConfig {
  enabled: boolean;
  sanityMultiplier: number;
  timeReduction: number;
  hintPenalty: number;
  puzzleDifficulty: DifficultyTier;
  ghostFrequency: number;
}

export interface EscapeGradeResult {
  grade: Grade;
  score: number;
  breakdown: {
    baseScore: number;
    timeBonus: number;
    sanityBonus: number;
    hintPenalty: number;
    ghostPenalty: number;
    nightmareMultiplier: number;
  };
}

export interface InventoryItem {
  artifact: Artifact;
  quantity: number;
  usedInPuzzles: string[];
}

export interface CombinedItem {
  id: string;
  name: string;
  description: string;
  components: string[];
  effect: string;
}

// ---------------------------------------------------------------------------
// Full State Interface
// ---------------------------------------------------------------------------

export interface HorrorEscapeState {
  currentRoom: number;
  roomStates: RoomState[];
  sanity: number;
  maxSanity: number;
  inventory: Artifact[];
  totalEscapes: number;
  bestTime: number;
  bestGrade: Grade;
  totalScore: number;
  totalPuzzlesSolved: number;
  activePuzzle: PuzzleData | null;
  activePuzzleIndex: number;
  hintsUsed: number;
  isNightmareMode: boolean;
  nightmareConfig: NightmareConfig;
  dailyChallenge: DailyChallenge | null;
  dailyCompleted: boolean;
  achievements: AchievementProgress[];
  runHistory: EscapeRun[];
  ghostEncounters: number;
  ghostLog: GhostEvent[];
  combinedItems: CombinedItem[];
  currentStreak: number;
  bestStreak: number;
  totalPlaytime: number;
  isPaused: boolean;
  pauseTime: number | null;
  sessionStartTime: number | null;
  activeGhostEffects: GhostEvent[];
  lastGhostTime: number;
  totalHintCost: number;
  perfectRunRoomIds: number[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SANITY_MAX = 100;
const SANITY_HALLUCINATION_THRESHOLD = 20;
const SANITY_CRITICAL_THRESHOLD = 10;
const MAX_RUN_HISTORY = 20;
const GHOST_MIN_INTERVAL = 45000; // 45 seconds minimum between ghost events
const HINT_COST_SUBTLE = 3;
const HINT_COST_MODERATE = 7;
const HINT_COST_DIRECT = 15;
const NIGHTMARE_SANITY_MULTIPLIER = 0.6;
const NIGHTMARE_TIME_REDUCTION = 0.7;
const NIGHTMARE_HINT_PENALTY = 1.5;
const NIGHTMARE_GHOST_FREQUENCY = 20000;
const ROOM_COUNT = 8;
const PUZZLES_PER_ROOM = 4;

// ---------------------------------------------------------------------------
// Room Definitions — 8 themed escape rooms
// ---------------------------------------------------------------------------

const ROOMS: RoomDefinition[] = [
  {
    id: 0,
    name: 'Abandoned Asylum',
    description:
      'A crumbling psychiatric hospital where the walls whisper the names of former patients. Rusty wheelchairs line the corridors, and medical files are scattered across the floor like fallen leaves.',
    theme: 'asylum',
    difficulty: 'creepy',
    timeLimit: 600,
    puzzlesPerRoom: PUZZLES_PER_ROOM,
    unlockRequirement: -1,
    loreIntro:
      'Built in 1923, the Blackwood Asylum was shut down after 47 patients vanished in a single night. The iron doors sealed themselves from the outside. You must solve the word puzzles carved into the walls to find the exit key.',
    atmosphereColor: '#2a1a1a',
    ambientSound: 'distant-whispers',
  },
  {
    id: 1,
    name: 'Haunted Mansion',
    description:
      'A Victorian estate shrouded in perpetual twilight. Portraits with moving eyes line the grand staircase, and chandeliers swing without any breeze.',
    theme: 'mansion',
    difficulty: 'creepy',
    timeLimit: 660,
    puzzlesPerRoom: PUZZLES_PER_ROOM,
    unlockRequirement: 0,
    loreIntro:
      'The Harrington family built this mansion in 1887. Every heir who lived here went mad by their fortieth year. The last butler left a journal: "The words in these walls are alive. Decode them or join the family forever."',
    atmosphereColor: '#1a1a2e',
    ambientSound: 'creaking-wood',
  },
  {
    id: 2,
    name: 'Underground Catacombs',
    description:
      'Endless tunnels beneath an ancient city, lined with skulls arranged in cryptic patterns. Water drips from unseen ceilings, and the air tastes of centuries.',
    theme: 'catacombs',
    difficulty: 'frightening',
    timeLimit: 720,
    puzzlesPerRoom: PUZZLES_PER_ROOM,
    unlockRequirement: 1,
    loreIntro:
      'Beneath the old quarter lies a labyrinth older than the city itself. The bones here spell out passwords in forgotten alphabets. The catacomb builders left warnings: "Only those who read the dead may leave."',
    atmosphereColor: '#0d1117',
    ambientSound: 'dripping-water',
  },
  {
    id: 3,
    name: 'Cursed Ship',
    description:
      'A ghost vessel adrift in fog. The cargo hold is filled with letters written in blood. The compass spins wildly, and the ship rocks even on calm seas.',
    theme: 'ship',
    difficulty: 'frightening',
    timeLimit: 720,
    puzzlesPerRoom: PUZZLES_PER_ROOM,
    unlockRequirement: 2,
    loreIntro:
      'The SS Nevermore set sail in 1902 and was found adrift in 1903 with every soul vanished. The captain\'s log ends with: "The letters rearranged themselves. They spelled our doom. Decode them before they decode you."',
    atmosphereColor: '#0a192f',
    ambientSound: 'ocean-waves',
  },
  {
    id: 4,
    name: 'Dark Forest Cabin',
    description:
      'A ramshackle cabin deep in woods where the trees have no leaves and the animals are silent. Scratch marks cover every surface inside and out.',
    theme: 'forest',
    difficulty: 'terrifying',
    timeLimit: 540,
    puzzlesPerRoom: PUZZLES_PER_ROOM,
    unlockRequirement: 3,
    loreIntro:
      'The hermit who lived here carved puzzles into every wooden surface. Local legends say he was trying to keep something out—or in. His final note reads: "The words are the only shelter. Solve them or freeze."',
    atmosphereColor: '#1b2d1b',
    ambientSound: 'howling-wind',
  },
  {
    id: 5,
    name: 'Egyptian Tomb',
    description:
      'A burial chamber filled with hieroglyphic word puzzles. The sarcophagus in the center radiates cold, and the air is thick with the scent of ancient incense.',
    theme: 'tomb',
    difficulty: 'terrifying',
    timeLimit: 600,
    puzzlesPerRoom: PUZZLES_PER_ROOM,
    unlockRequirement: 4,
    loreIntro:
      'The tomb of Scribe Amenhotep, keeper of sacred words. He believed language was the key to the afterlife. His final inscription: "Only those who master the word may pass through the gates of death."',
    atmosphereColor: '#2d1f0e',
    ambientSound: 'sand-shifting',
  },
  {
    id: 6,
    name: 'Frozen Laboratory',
    description:
      'A cryogenics lab locked in permanent deep freeze. Specimen jars line the shelves, and frozen monitors display half-completed word experiments.',
    theme: 'laboratory',
    difficulty: 'terrifying',
    timeLimit: 480,
    puzzlesPerRoom: PUZZLES_PER_ROOM,
    unlockRequirement: 5,
    loreIntro:
      'Dr. Elena Voss was attempting to encode human consciousness into language itself. When the lab froze over, her final experiment was mid-sentence. The ice preserves her screams as visible sound waves shaped like letters.',
    atmosphereColor: '#0e2a3a',
    ambientSound: 'ice-cracking',
  },
  {
    id: 7,
    name: 'Infernal Tower',
    description:
      'A spiraling obsidian tower that descends into the earth. Each floor grows hotter and the puzzles more infernal. At the bottom, something ancient waits.',
    theme: 'tower',
    difficulty: 'nightmare',
    timeLimit: 420,
    puzzlesPerRoom: PUZZLES_PER_ROOM,
    unlockRequirement: 6,
    loreIntro:
      'The Tower of Babel, rebuilt in reverse. It was constructed by a cult that believed the original Babel fell because humanity solved language too easily. Here, language is the prison. Solve every cipher or descend forever.',
    atmosphereColor: '#3d0c02',
    ambientSound: 'distant-roar',
  },
];

// ---------------------------------------------------------------------------
// Puzzle Definitions — 30+ built-in puzzles across 6 clue types
// ---------------------------------------------------------------------------

const PUZZLES: PuzzleData[] = [
  // === Room 0: Abandoned Asylum (4 puzzles) ===
  {
    id: 'asm-riddle-1',
    clueType: 'word-riddle',
    difficulty: 'creepy',
    question: 'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?',
    answer: 'MAP',
    hintSubtle: 'Think about something you use for navigation.',
    hintModerate: 'It shows you places without actually being any of them.',
    hintDirect: 'A cartographic representation — starts with M.',
    timeBonus: 50,
    sanityCost: 2,
    lore: 'Carved into the wall of the isolation ward. Patient #47 wrote: "The map leads out, but it only shows madness."',
    requiredArtifact: 'rusty-key',
  },
  {
    id: 'asm-anagram-1',
    clueType: 'anagram-lock',
    difficulty: 'creepy',
    question: 'Unscramble the letters to find the asylum director\'s password: TEAR',
    answer: 'RATE',
    hintSubtle: 'It relates to measurement or assessment.',
    hintModerate: 'Think about how you might evaluate something.',
    hintDirect: 'The speed at which something happens, reversed from TEAR.',
    timeBonus: 40,
    sanityCost: 2,
    lore: 'The director\'s password was found scratched into his desk. He rated every patient on a scale of madness.',
  },
  {
    id: 'asm-symbol-1',
    clueType: 'symbol-match',
    difficulty: 'creepy',
    question: 'Match each symbol to its meaning: ☽ = NIGHT, ☀ = DAY, ☠ = DEATH, ⚕ = ?. What does the staff of Asclepius represent?',
    answer: 'HEAL',
    hintSubtle: 'It relates to medicine and wellness.',
    hintModerate: 'What do doctors and hospitals provide?',
    hintDirect: 'The opposite of harm — four letters.',
    timeBonus: 45,
    sanityCost: 3,
    lore: 'The medical symbol on the asylum\'s entrance. Healing was not what happened here.',
  },
  {
    id: 'asm-morse-1',
    clueType: 'morse-code',
    difficulty: 'creepy',
    question: 'Decode this Morse message found on a patient bracelet: .... . .-.. .--.',
    answer: 'HELP',
    hintSubtle: 'It\'s a common cry for assistance.',
    hintModerate: 'Four letters, the most basic request when in danger.',
    hintDirect: 'H-E-L-P.',
    timeBonus: 55,
    sanityCost: 2,
    lore: 'Patient #12\'s bracelet. She was found still whispering this word decades after the asylum closed.',
  },
  // === Room 1: Haunted Mansion (4 puzzles) ===
  {
    id: 'mns-riddle-1',
    clueType: 'word-riddle',
    difficulty: 'creepy',
    question: 'The more you take, the more you leave behind. What am I?',
    answer: 'STEPS',
    hintSubtle: 'Think about moving forward.',
    hintModerate: 'Every journey is made of these.',
    hintDirect: 'Foot___ — what you make while walking.',
    timeBonus: 45,
    sanityCost: 2,
    lore: 'Written in the guest book of the mansion. Every visitor left more of these than they took.',
  },
  {
    id: 'mns-cipher-1',
    clueType: 'cipher-decode',
    difficulty: 'creepy',
    question: 'Decode this Caesar cipher (shift +1): "BDDFTT" → what word is hidden?',
    answer: 'ACCUSE',
    hintSubtle: 'Each letter has been shifted forward by one in the alphabet.',
    hintModerate: 'Shift each letter backward by one: B→A, D→C, etc.',
    hintDirect: 'A six-letter word meaning to charge with wrongdoing.',
    timeBonus: 50,
    sanityCost: 3,
    lore: 'Found in the butler\'s diary. He was trying to accuse the house itself of murder.',
  },
  {
    id: 'mns-pattern-1',
    clueType: 'pattern-sequence',
    difficulty: 'creepy',
    question: 'Complete the sequence: H, E, L, P, M, E → what are the next two letters?',
    answer: 'ME',
    hintSubtle: 'Read the letters as words.',
    hintModerate: 'HELP ME — what comes after?',
    hintDirect: 'The word "ME" completes the phrase HELP ME.',
    timeBonus: 35,
    sanityCost: 2,
    lore: 'The sequence appears on every mirror in the mansion. Looking into them, you see yourself mouthing these words.',
  },
  {
    id: 'mns-anagram-1',
    clueType: 'anagram-lock',
    difficulty: 'creepy',
    question: 'Rearrange "SPINE" to form a word the ghost whispers at midnight.',
    answer: 'PENIS',
    hintSubtle: 'The ghost whispers something essential to the human body.',
    hintModerate: 'It\'s a five-letter body part, reading SPINE differently.',
    hintDirect: 'S-P-I-N-E rearranged gives P-E-N-I-S.',
    timeBonus: 40,
    sanityCost: 4,
    lore: 'The most inappropriate ghost in the mansion. The family buried this secret for generations.',
  },
  // === Room 2: Underground Catacombs (4 puzzles) ===
  {
    id: 'cat-morse-1',
    clueType: 'morse-code',
    difficulty: 'frightening',
    question: 'A skeleton clutches a note with Morse code: - .... . / -.. . .- - .... → decode both words.',
    answer: 'THEDEATH',
    hintSubtle: 'Translate the Morse: - is dash, . is dot.',
    hintModerate: 'First word is T-H-E, second starts with D.',
    hintDirect: 'THE DEATH — combined as THEDEATH.',
    timeBonus: 60,
    sanityCost: 4,
    lore: 'The skeleton was one of the original catacomb builders. His final message: THE DEATH comes for all.',
  },
  {
    id: 'cat-riddle-1',
    clueType: 'word-riddle',
    difficulty: 'frightening',
    question: 'I speak without a mouth and hear without ears. I have no body, but come alive with the wind. What am I?',
    answer: 'ECHO',
    hintSubtle: 'Sound is involved.',
    hintModerate: 'It repeats what you say in empty spaces.',
    hintDirect: 'E-C-H-O — a repeated sound.',
    timeBonus: 50,
    sanityCost: 3,
    lore: 'The catacombs amplify this phenomenon. The dead seem to answer when you call.',
  },
  {
    id: 'cat-cipher-1',
    clueType: 'cipher-decode',
    difficulty: 'frightening',
    question: 'Atbash cipher decode: "GSVIV" (A↔Z, B↔Y, C↔X, ...)',
    answer: 'THEER',
    hintSubtle: 'Atbash reverses the alphabet: A becomes Z, B becomes Y.',
    hintModerate: 'G→T, S→H, V→E, I→R, V→E.',
    hintDirect: 'THEER — "THE ER" or a phonetic spelling.',
    timeBonus: 55,
    sanityCost: 5,
    lore: 'Ancient tomb robbers used this cipher to mark safe passages. "THEER" pointed to the way out.',
  },
  {
    id: 'cat-symbol-1',
    clueType: 'symbol-match',
    difficulty: 'frightening',
    question: 'Skulls arranged in shapes: ○○ = 2, △△△ = 3, □□□□ = 4, ⬡ = ?',
    answer: 'ONE',
    hintSubtle: 'Count the shapes.',
    hintModerate: 'There is one hexagon.',
    hintDirect: 'ONE — the word for 1.',
    timeBonus: 40,
    sanityCost: 3,
    lore: 'The skulls taught numbers to the dead. One skull, one life. Simple and final.',
  },
  // === Room 3: Cursed Ship (4 puzzles) ===
  {
    id: 'shp-anagram-1',
    clueType: 'anagram-lock',
    difficulty: 'frightening',
    question: 'The ship\'s log shows scrambled coordinates: REDOW. Unscramble to find the port name.',
    answer: 'DOWER',
    hintSubtle: 'It sounds like a word related to inheritance or power.',
    hintModerate: 'Rearrange REDOW to form a five-letter word.',
    hintDirect: 'D-O-W-E-R — a widow\'s share or endowment.',
    timeBonus: 45,
    sanityCost: 4,
    lore: 'Port Dower was the ship\'s last stop. No ship that docked there ever sailed again.',
  },
  {
    id: 'shp-riddle-1',
    clueType: 'word-riddle',
    difficulty: 'frightening',
    question: 'I have keys but no locks. I have space but no room. You can enter but can\'t go inside. What am I?',
    answer: 'KEYBOARD',
    hintSubtle: 'You\'re probably using one right now.',
    hintModerate: 'It\'s a computer input device with an arrangement of buttons.',
    hintDirect: 'K-E-Y-B-O-A-R-D.',
    timeBonus: 40,
    sanityCost: 3,
    lore: 'The ship\'s telegraph operator typed this riddle before the ship went dark. His last transmission.',
  },
  {
    id: 'shp-morse-1',
    clueType: 'morse-code',
    difficulty: 'frightening',
    question: 'SOS signal corrupted. Decode: ... --- ... / ... .. -. -.-',
    answer: 'SOSSINK',
    hintSubtle: 'The first part is the universal distress signal.',
    hintModerate: 'SOS + SINK — the ship is going down.',
    hintDirect: 'SOSSINK — SOS SINK.',
    timeBonus: 55,
    sanityCost: 4,
    lore: 'The final SOS from the SS Nevermore. They knew they were sinking, but not why.',
  },
  {
    id: 'shp-pattern-1',
    clueType: 'pattern-sequence',
    difficulty: 'frightening',
    question: 'Cargo manifest pattern: DOOM, ROOM, BOOM, ZOOM → what comes next?',
    answer: 'TOMB',
    hintSubtle: 'Each word ends in OOM and changes the first letter.',
    hintModerate: 'D, R, B, Z... look at the alphabetical progression.',
    hintDirect: 'The pattern circles through: DOOM → ROOM → BOOM → ZOOM → back to TOMB.',
    timeBonus: 50,
    sanityCost: 5,
    lore: 'The cargo manifest was a prophecy. TOMB was the final entry, written before the ship sailed.',
  },
  // === Room 4: Dark Forest Cabin (4 puzzles) ===
  {
    id: 'for-riddle-1',
    clueType: 'word-riddle',
    difficulty: 'terrifying',
    question: 'I am not alive, but I grow. I don\'t have lungs, but I need air. I don\'t have a mouth, but water kills me. What am I?',
    answer: 'FIRE',
    hintSubtle: 'It provides warmth but also destruction.',
    hintModerate: 'Campers need this in the woods, but too much is dangerous.',
    hintDirect: 'F-I-R-E.',
    timeBonus: 50,
    sanityCost: 5,
    lore: 'The hermit carved this into the cabin\'s fireplace. Fire was both his salvation and his prison.',
  },
  {
    id: 'for-anagram-1',
    clueType: 'anagram-lock',
    difficulty: 'terrifying',
    question: 'The cabin door has a word lock: "NOWEL" — unscramble to open it.',
    answer: 'OWNER',
    hintSubtle: 'It refers to someone who possesses something.',
    hintModerate: 'The one who belongs to this place.',
    hintDirect: 'O-W-N-E-R — the person who owns the cabin.',
    timeBonus: 45,
    sanityCost: 5,
    lore: 'Only the true owner can open the cabin. But the hermit is long dead, and the cabin wants a new one.',
  },
  {
    id: 'for-symbol-1',
    clueType: 'symbol-match',
    difficulty: 'terrifying',
    question: 'Tree bark symbols: 🌲 = TREE, 🦉 = OWL, 🌙 = MOON, 🩸 = ?. What word does blood represent in the hermit\'s code?',
    answer: 'LIFE',
    hintSubtle: 'What flows through your veins?',
    hintModerate: 'Blood is often equated with vitality.',
    hintDirect: 'L-I-F-E — blood is the essence of life.',
    timeBonus: 50,
    sanityCost: 6,
    lore: 'The hermit believed blood was the only true language. Everything else was deception.',
  },
  {
    id: 'for-cipher-1',
    clueType: 'cipher-decode',
    difficulty: 'terrifying',
    question: 'The hermit\'s diary uses a reverse alphabet cipher. Decode: "KIL" → read it backward.',
    answer: 'LIK',
    hintSubtle: 'Read the entire string from right to left.',
    hintModerate: 'K-I-L reversed spells L-I-K.',
    hintDirect: 'LIK — a Scandinavian name meaning "light" or what you feel about something.',
    timeBonus: 40,
    sanityCost: 5,
    lore: '"LIK" was the hermit\'s name. Swedish for "body." He was trying to escape his own flesh.',
  },
  // === Room 5: Egyptian Tomb (4 puzzles) ===
  {
    id: 'tmb-riddle-1',
    clueType: 'word-riddle',
    difficulty: 'terrifying',
    question: 'I am always in front of you but can\'t be seen. What am I?',
    answer: 'FUTURE',
    hintSubtle: 'It\'s a concept of time.',
    hintModerate: 'What lies ahead of you?',
    hintDirect: 'F-U-T-U-R-E.',
    timeBonus: 45,
    sanityCost: 5,
    lore: 'Amenhotep\'s riddle for the pharaohs. The future was the only thing they could not take to the afterlife.',
  },
  {
    id: 'tmb-anagram-1',
    clueType: 'anagram-lock',
    difficulty: 'terrifying',
    question: 'Hieroglyphic anagram on the sarcophagus: "RAPT" → unscramble.',
    answer: 'TRAP',
    hintSubtle: 'It\'s something that catches you.',
    hintModerate: 'A four-letter word meaning a device for catching.',
    hintDirect: 'T-R-A-P — and this tomb is one.',
    timeBonus: 50,
    sanityCost: 6,
    lore: 'The sarcophagus itself is the answer. It\'s both a resting place and a trap.',
  },
  {
    id: 'tmb-pattern-1',
    clueType: 'pattern-sequence',
    difficulty: 'terrifying',
    question: 'Tomb wall inscription sequence: ANKH, KA, BA, AKH → what is the Egyptian concept that follows?',
    answer: 'SHADOW',
    hintSubtle: 'Think about what follows the soul\'s journey.',
    hintModerate: 'After the spiritual components come... what lingers?',
    hintDirect: 'S-H-A-D-O-W — the dark thing that follows you after death.',
    timeBonus: 55,
    sanityCost: 6,
    lore: 'The five parts of the Egyptian soul. The shadow (SHADOW) was the part that could escape the tomb.',
  },
  {
    id: 'tmb-morse-1',
    clueType: 'morse-code',
    difficulty: 'terrifying',
    question: 'Modern Morse found in the tomb (anachronism!): .-.. .. ..-. .',
    answer: 'LIFE',
    hintSubtle: 'Translate dot-dash: . is E, - is T.',
    hintModerate: '.- = L, .. = I, ..- = ?, .- = F.',
    hintDirect: 'L-I-F-E — the word Amenhotep was trying to preserve.',
    timeBonus: 50,
    sanityCost: 5,
    lore: 'The Morse code was a paradox. Someone from the future had been here before. The word LIFE transcends time.',
  },
  // === Room 6: Frozen Laboratory (4 puzzles) ===
  {
    id: 'lab-cipher-1',
    clueType: 'cipher-decode',
    difficulty: 'terrifying',
    question: 'Dr. Voss\'s frozen notes: ROT13 cipher → "GUR JBEQ". Decode to find her breakthrough word.',
    answer: 'THEWORD',
    hintSubtle: 'ROT13 shifts each letter by 13 positions.',
    hintModerate: 'G→T, U→H, R→E, J→W, B→O, E→R, Q→D.',
    hintDirect: 'THE WORD — the key to encoding consciousness.',
    timeBonus: 60,
    sanityCost: 7,
    lore: 'Dr. Voss discovered that "THE WORD" was the quantum key to encoding the human mind into language.',
  },
  {
    id: 'lab-riddle-1',
    clueType: 'word-riddle',
    difficulty: 'terrifying',
    question: 'I can be cracked, made, told, and played. What am I?',
    answer: 'JOKE',
    hintSubtle: 'It\'s something meant to be funny.',
    hintModerate: 'Comedians perform these.',
    hintDirect: 'J-O-K-E.',
    timeBonus: 40,
    sanityCost: 6,
    lore: 'The last thing Dr. Voss wrote before the freeze. A joke in a frozen tomb. The universe\'s punchline.',
  },
  {
    id: 'lab-anagram-1',
    clueType: 'anagram-lock',
    difficulty: 'terrifying',
    question: 'Frozen screen displays: "CEILD". Unscramble to access the lab\'s exit protocol.',
    answer: 'DICEL',
    hintSubtle: 'It relates to chance and randomness.',
    hintModerate: 'You roll these in games.',
    hintDirect: 'D-I-C-E-L — close to DICE with an extra letter. (DICEL → a variant spelling of die/dice)',
    timeBonus: 45,
    sanityCost: 6,
    lore: 'The experiment was a gamble. Life encoded into language was like rolling dice with the universe.',
  },
  {
    id: 'lab-symbol-1',
    clueType: 'symbol-match',
    difficulty: 'terrifying',
    question: 'Lab hazard symbols: ☢ = RADIATION, ⚡ = ELECTRIC, ❄ = FROZEN, 🔬 = ?. What word represents the microscope?',
    answer: 'SCIENCE',
    hintSubtle: 'What field uses microscopes?',
    hintModerate: 'The systematic study of the natural world.',
    hintDirect: 'S-C-I-E-N-C-E.',
    timeBonus: 50,
    sanityCost: 7,
    lore: 'Science was both Dr. Voss\'s tool and her god. It freed her, and then it trapped her forever.',
  },
  // === Room 7: Infernal Tower (4 puzzles) ===
  {
    id: 'twr-riddle-1',
    clueType: 'word-riddle',
    difficulty: 'nightmare',
    question: 'I have no voice, yet I tell you everything. I have no body, yet I live everywhere. What am I?',
    answer: 'TEXT',
    hintSubtle: 'You\'re reading me right now.',
    hintModerate: 'Written words that convey information.',
    hintDirect: 'T-E-X-T.',
    timeBonus: 60,
    sanityCost: 8,
    lore: 'The Tower\'s final truth: TEXT is the prison. Language itself is what traps humanity.',
  },
  {
    id: 'twr-morse-1',
    clueType: 'morse-code',
    difficulty: 'nightmare',
    question: 'The deepest floor hums with Morse: - . -..- - → four characters.',
    answer: 'TEXT',
    hintSubtle: 'The most fundamental unit of written communication.',
    hintModerate: '- is T, . is E, -..- is X, - is T.',
    hintDirect: 'TEXT — the word that built and broke the Tower of Babel.',
    timeBonus: 65,
    sanityCost: 9,
    lore: 'The cult\'s central belief: TEXT is the original sin. Language divided humanity from godhood.',
  },
  {
    id: 'twr-cipher-1',
    clueType: 'cipher-decode',
    difficulty: 'nightmare',
    question: 'Triple-layered cipher. Step 1: Atbash. Step 2: ROT13. Step 3: Reverse. Decode: "ZULKR"',
    answer: 'BRAIN',
    hintSubtle: 'Work backwards through the layers.',
    hintModerate: 'Step 3 undo (reverse): RLKUZ → Step 2 undo (ROT13): EYXHM → Step 1 undo (Atbash): BRAIN.',
    hintDirect: 'B-R-A-I-N — the organ that creates language.',
    timeBonus: 70,
    sanityCost: 10,
    lore: 'The ultimate puzzle. The cult wanted to destroy the BRAIN to free humanity from the prison of words.',
  },
  {
    id: 'twr-pattern-1',
    clueType: 'pattern-sequence',
    difficulty: 'nightmare',
    question: 'The tower floors spell a word. Floor 7: B, Floor 6: A, Floor 5: B, Floor 4: E, Floor 3: L → spell the full word by continuing: Floor 2 = ?, Floor 1 = ?',
    answer: 'BA',
    hintSubtle: 'Think about the Tower of Babel.',
    hintModerate: 'B-A-B-E-L-? — what completes the word?',
    hintDirect: 'B-A — BABEL backwards from the top. BA completes it.',
    timeBonus: 55,
    sanityCost: 8,
    lore: 'B-A-B-E-L. The word that caused the first fall. The tower descends into the original word of division.',
  },
  // === Bonus Puzzles for Daily / Random Selection ===
  {
    id: 'bonus-riddle-1',
    clueType: 'word-riddle',
    difficulty: 'frightening',
    question: 'What word becomes shorter when you add two letters to it?',
    answer: 'SHORT',
    hintSubtle: 'The answer is self-referential.',
    hintModerate: 'Think about the word "short" and its meaning.',
    hintDirect: 'SHORT — add "ER" to make it SHORTER.',
    timeBonus: 50,
    sanityCost: 4,
    lore: 'A ghost\'s riddle. The shortest path to madness is adding to what should be left alone.',
  },
  {
    id: 'bonus-anagram-1',
    clueType: 'anagram-lock',
    difficulty: 'frightening',
    question: 'Unscramble the haunted word: "LISTEN"',
    answer: 'SILENT',
    hintSubtle: 'It\'s a word about absence of sound.',
    hintModerate: 'Rearrange LISTEN to form a synonym of quiet.',
    hintDirect: 'S-I-L-E-N-T.',
    timeBonus: 45,
    sanityCost: 4,
    lore: 'In the haunted rooms, LISTEN and SILENT are the same word. The ghosts make no sound, but you must listen.',
  },
  {
    id: 'bonus-cipher-1',
    clueType: 'cipher-decode',
    difficulty: 'terrifying',
    question: 'Vigenère cipher with key "GHOST". Decode: "KQOKXK" → what word?',
    answer: 'DARKNE',
    hintSubtle: 'Use GHOST as the repeating key.',
    hintModerate: 'K-G=D, Q-H=D, O-O=A, K-S=S, X-T=X, K-H=D → DARKNE.',
    hintDirect: 'D-A-R-K-N-E — the beginning of DARKNESS.',
    timeBonus: 65,
    sanityCost: 7,
    lore: 'Darkness is not the absence of light, but the presence of something ancient. DARKNE — incomplete, like the soul.',
  },
  {
    id: 'bonus-morse-1',
    clueType: 'morse-code',
    difficulty: 'terrifying',
    question: 'Tapping from inside a wall: ..-. . .- .-.',
    answer: 'FEAR',
    hintSubtle: 'It\'s the most primal emotion.',
    hintModerate: 'What keeps you awake at night?',
    hintDirect: 'F-E-A-R.',
    timeBonus: 50,
    sanityCost: 6,
    lore: 'Someone — or something — is trapped inside the wall, tapping in Morse: FEAR, FEAR, FEAR.',
  },
  {
    id: 'bonus-symbol-1',
    clueType: 'symbol-match',
    difficulty: 'nightmare',
    question: 'The cult\'s symbol wheel: ✝ = FAITH, ☪ = ISLAM, ✡ = JUDAISM, ☿ = ?. What does the Mercury symbol represent?',
    answer: 'WORD',
    hintSubtle: 'Mercury is the messenger god.',
    hintModerate: 'What does a messenger carry?',
    hintDirect: 'W-O-R-D — the message itself.',
    timeBonus: 55,
    sanityCost: 8,
    lore: 'The cult worshipped the Word above all gods. Mercury was merely its messenger.',
  },
  {
    id: 'bonus-pattern-1',
    clueType: 'pattern-sequence',
    difficulty: 'nightmare',
    question: 'Complete the infernal sequence: W, O, R, D → D, R, O, W → W, R, O, D → what comes next?',
    answer: 'DROW',
    hintSubtle: 'Each iteration swaps one pair of letters.',
    hintModerate: 'WORD reversed is DROW. The pattern alternates between reversal and swapping.',
    hintDirect: 'D-R-O-W — WORD backwards.',
    timeBonus: 60,
    sanityCost: 9,
    lore: 'The cult believed reversing words could reverse reality. DROW was the key to un-creation.',
  },
];

// ---------------------------------------------------------------------------
// Artifact Definitions — 20 scary artifacts with lore
// ---------------------------------------------------------------------------

const ARTIFACTS: Artifact[] = [
  {
    id: 'rusty-key',
    name: 'Rusty Asylum Key',
    description: 'An iron key stained with decades of rust and something darker.',
    lore: 'This key opened the isolation ward. The scratches on it match marks found on patients\' fingernails.',
    rarity: 'common',
    effect: 'Unlocks the first puzzle in the Abandoned Asylum.',
    sanityBonus: 0,
    foundInRoom: 0,
  },
  {
    id: 'torn-diary',
    name: 'Torn Patient Diary',
    description: 'Water-damaged pages filled with frantic handwriting.',
    lore: '"Day 47: The words are moving. Day 48: The words are alive. Day 49: I am the words."',
    rarity: 'common',
    effect: 'Provides a subtle hint for any word puzzle.',
    sanityBonus: 2,
    foundInRoom: 0,
  },
  {
    id: 'silver-candle',
    name: 'Silver Candle',
    description: 'A candle that burns with pale blue flame. Never melts.',
    lore: 'Crafted from the tallow of a saint who spoke only in riddles. Its light reveals hidden text.',
    rarity: 'uncommon',
    effect: 'Reveals hidden letters in cipher puzzles.',
    sanityBonus: 3,
    foundInRoom: 1,
  },
  {
    id: 'portrait-eyes',
    name: 'Portrait with Moving Eyes',
    description: 'A miniature oil painting. The subject\'s eyes track your movement.',
    lore: 'Lady Harrington\'s portrait. She was buried alive in the mansion walls. Her eyes still search for an exit.',
    rarity: 'uncommon',
    effect: 'Watches for ghost events, giving early warning.',
    sanityBonus: -2,
    foundInRoom: 1,
  },
  {
    id: 'skull-lantern',
    name: 'Skull Lantern',
    description: 'A human skull that glows from within when held.',
    lore: 'The catacomb builders used these to light their way. The skull whispers directions if you listen closely.',
    rarity: 'uncommon',
    effect: 'Illuminates Morse code patterns on walls.',
    sanityBonus: -3,
    foundInRoom: 2,
  },
  {
    id: 'bone-flute',
    name: 'Bone Flute',
    description: 'A flute carved from a femur. Playing it makes the walls vibrate.',
    lore: 'The bone flute could calm the dead. Its last player was buried with it, still playing a lullaby.',
    rarity: 'rare',
    effect: 'Calms ghost encounters, reducing sanity loss.',
    sanityBonus: 5,
    foundInRoom: 2,
  },
  {
    id: 'captain-log',
    name: 'Captain\'s Waterlogged Log',
    description: 'A leather-bound book swollen with seawater. Words swim on the pages.',
    lore: '"The letters are alive in the water. They rearrange when you blink. God help us, the ocean is literate."',
    rarity: 'common',
    effect: 'Contains hints for anagram puzzles.',
    sanityBonus: 1,
    foundInRoom: 3,
  },
  {
    id: 'compass-of-souls',
    name: 'Compass of Lost Souls',
    description: 'A brass compass that points toward the nearest unsolved puzzle.',
    lore: 'The compass doesn\'t point north. It points toward whatever is most unresolved. On the ship, it pointed down.',
    rarity: 'rare',
    effect: 'Highlights the easiest unsolved puzzle in a room.',
    sanityBonus: 3,
    foundInRoom: 3,
  },
  {
    id: 'herb-bundle',
    name: 'Warding Herb Bundle',
    description: 'Dried sage, rosemary, and something that smells like burnt hair.',
    lore: 'The hermit gathered these from the forest edge where reality grows thin. Burning them keeps the whispers at bay.',
    rarity: 'common',
    effect: 'Restores 5 sanity when used.',
    sanityBonus: 5,
    foundInRoom: 4,
  },
  {
    id: 'carved-totem',
    name: 'Whispering Totem',
    description: 'A wooden totem carved with letters from an unknown alphabet.',
    lore: 'The toem speaks in dead languages. Hold it to your ear and you\'ll hear every word ever screamed in these woods.',
    rarity: 'uncommon',
    effect: 'Translates symbol-match puzzles automatically.',
    sanityBonus: -2,
    foundInRoom: 4,
  },
  {
    id: 'scarab-amulet',
    name: 'Golden Scarab Amulet',
    description: 'A scarab beetle cast in gold. It feels warm to the touch.',
    lore: 'Sacred to Thoth, god of writing. The scarab carries words between the living and the dead.',
    rarity: 'rare',
    effect: 'Provides a free moderate hint for any puzzle.',
    sanityBonus: 4,
    foundInRoom: 5,
  },
  {
    id: 'papyrus-scroll',
    name: 'Ancient Papyrus Scroll',
    description: 'Fragile scroll covered in hieroglyphic word puzzles.',
    lore: 'Amenhotep\'s practice scroll. He solved a thousand puzzles to prepare for death. He still wasn\'t ready.',
    rarity: 'uncommon',
    effect: 'Contains the answer key to one puzzle.',
    sanityBonus: 2,
    foundInRoom: 5,
  },
  {
    id: 'frozen-syringe',
    name: 'Frozen Syringe',
    description: 'A medical syringe filled with glowing blue liquid. The liquid moves even when frozen.',
    lore: 'Dr. Voss\'s sanity serum. It freezes the fear center of the brain. Side effects include: speaking in anagrams.',
    rarity: 'uncommon',
    effect: 'Restores 10 sanity but makes the next puzzle harder.',
    sanityBonus: 10,
    foundInRoom: 6,
  },
  {
    id: 'ice-key',
    name: 'Cryogenic Key',
    description: 'A key made of unmelting ice. Cold enough to burn your skin.',
    lore: 'The key to Dr. Voss\'s final experiment. She locked herself in to protect the world from what she discovered.',
    rarity: 'rare',
    effect: 'Unlocks bonus puzzles in the Frozen Laboratory.',
    sanityBonus: -1,
    foundInRoom: 6,
  },
  {
    id: 'obsidian-shard',
    name: 'Obsidian Shard',
    description: 'A piece of the tower itself. Looking into it shows a different world.',
    lore: 'The Tower was built from a single piece of obsidian. This shard contains the memory of the first word ever spoken.',
    rarity: 'legendary',
    effect: 'Reduces all puzzle difficulty by one tier.',
    sanityBonus: -5,
    foundInRoom: 7,
  },
  {
    id: 'infernal-ink',
    name: 'Ink of the Damned',
    description: 'A vial of black ink that writes on its own. Messages appear unbidden.',
    lore: 'Brewed from the tears of those who could not solve the final puzzle. The ink knows the answers but writes them too late.',
    rarity: 'legendary',
    effect: 'Auto-solves one puzzle but costs 20 sanity.',
    sanityBonus: -20,
    foundInRoom: 7,
  },
  {
    id: 'withered-crown',
    name: 'Crown of the First Scribe',
    description: 'A crown of twisted thorns and ancient papyrus strips.',
    lore: 'Worn by the inventor of writing. The weight of every word ever written presses down on its wearer.',
    rarity: 'cursed',
    effect: 'Doubles score but sanity drains twice as fast.',
    sanityBonus: -10,
    foundInRoom: 7,
  },
  {
    id: 'ghost-jar',
    name: 'Jar Containing a Ghost',
    description: 'A glass jar with a faint luminescent figure trapped inside.',
    lore: 'The ghost of a former escapee who almost made it out. It whispers encouragement and warnings.',
    rarity: 'rare',
    effect: 'Provides one direct hint per room for free.',
    sanityBonus: 3,
    foundInRoom: 2,
  },
  {
    id: 'blood-quill',
    name: 'Blood Quill Pen',
    description: 'A feather quill that writes in your own blood when you hold it.',
    lore: 'The asylum director used this to write prescriptions. The quill chose its own ink.',
    rarity: 'uncommon',
    effect: 'Allows you to write your own cipher answers.',
    sanityBonus: -3,
    foundInRoom: 0,
  },
  {
    id: 'mirror-shard',
    name: 'Mirror Shard of Truth',
    description: 'A piece of a mirror that shows your true fear when you look into it.',
    lore: 'Shattered during a ghost encounter. Each shard shows a different fear. This one shows fear of failure.',
    rarity: 'cursed',
    effect: 'Reveals the hardest puzzle first. Cannot be unlooked at.',
    sanityBonus: -8,
    foundInRoom: 1,
  },
];

// ---------------------------------------------------------------------------
// Achievement Definitions — 15 achievements
// ---------------------------------------------------------------------------

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: 'first-escape', name: 'First Escape', description: 'Complete your first escape room.', icon: '🚪', condition: 'complete_room', maxProgress: 1 },
  { id: 'speed-demon', name: 'Speed Demon', description: 'Complete any room in under 60 seconds.', icon: '⚡', condition: 'fast_completion', maxProgress: 1 },
  { id: 'sanity-master', name: 'Sanity Master', description: 'Complete a room with 90%+ sanity remaining.', icon: '🧠', condition: 'high_sanity', maxProgress: 1 },
  { id: 'no-hint-run', name: 'No Hint Run', description: 'Complete a room without using any hints.', icon: '🤫', condition: 'no_hints', maxProgress: 1 },
  { id: 'full-house', name: 'Full House', description: 'Complete all 8 escape rooms.', icon: '🏰', condition: 'all_rooms', maxProgress: 8 },
  { id: 'nightmare-survivor', name: 'Nightmare Survivor', description: 'Complete a room in Nightmare mode.', icon: '👹', condition: 'nightmare_complete', maxProgress: 1 },
  { id: 'nightmare-conqueror', name: 'Nightmare Conqueror', description: 'Complete all rooms in Nightmare mode.', icon: '💀', condition: 'all_nightmare', maxProgress: 8 },
  { id: 'ghost-whisperer', name: 'Ghost Whisperer', description: 'Survive 10 ghost encounters.', icon: '👻', condition: 'ghost_encounters', maxProgress: 10 },
  { id: 'artifact-collector', name: 'Artifact Collector', description: 'Collect 15 unique artifacts.', icon: '🏺', condition: 'artifacts_collected', maxProgress: 15 },
  { id: 'puzzle-master', name: 'Puzzle Master', description: 'Solve 30 puzzles total.', icon: '🧩', condition: 'puzzles_solved', maxProgress: 30 },
  { id: 'daily-devotee', name: 'Daily Devotee', description: 'Complete 7 daily challenges.', icon: '📅', condition: 'dailies_completed', maxProgress: 7 },
  { id: 'streak-keeper', name: 'Streak Keeper', description: 'Achieve a 5-room completion streak.', icon: '🔥', condition: 'streak', maxProgress: 5 },
  { id: 'perfect-score', name: 'Perfect Score', description: 'Earn an S grade on any room.', icon: '⭐', condition: 's_grade', maxProgress: 1 },
  { id: 'sanity-saver', name: 'Sanity Saver', description: 'Restore sanity 20 times using artifacts.', icon: '💚', condition: 'sanity_restored', maxProgress: 20 },
  { id: 'word-weaver', name: 'Word Weaver', description: 'Solve 5 puzzles of each clue type.', icon: '✨', condition: 'all_clue_types', maxProgress: 30 },
];

// ---------------------------------------------------------------------------
// Ghost Event Definitions
// ---------------------------------------------------------------------------

const GHOST_EVENTS: GhostEvent[] = [
  { type: 'whisper', description: 'A faint whisper echoes: "You\'ll never leave..."', sanityImpact: -5, duration: 3000, isPositive: false },
  { type: 'shadow-figure', description: 'A shadowy figure darts across the corner of your vision.', sanityImpact: -8, duration: 2000, isPositive: false },
  { type: 'cold-breeze', description: 'An icy breeze brushes past your neck from nowhere.', sanityImpact: -3, duration: 4000, isPositive: false },
  { type: 'objects-move', description: 'Objects on the shelf rearrange themselves when you blink.', sanityImpact: -6, duration: 2500, isPositive: false },
  { type: 'flickering-lights', description: 'The lights flicker wildly, casting dancing shadows.', sanityImpact: -4, duration: 3000, isPositive: false },
  { type: 'blood-writing', description: 'Words appear on the wall in what looks like blood: "SOLVE ME."', sanityImpact: -10, duration: 5000, isPositive: false },
  { type: 'sudden-sound', description: 'A deafening BANG from behind the wall makes you jump!', sanityImpact: -7, duration: 1500, isPositive: false },
  { type: 'mirror-haunting', description: 'Your reflection in the mirror smiles when you don\'t.', sanityImpact: -12, duration: 4000, isPositive: false },
];

// ---------------------------------------------------------------------------
// Combined Items Recipes
// ---------------------------------------------------------------------------

const COMBINATION_RECIPES: { a: string; b: string; result: CombinedItem }[] = [
  {
    a: 'rusty-key',
    b: 'silver-candle',
    result: { id: 'ward-key', name: 'Warded Key', description: 'A key wreathed in holy flame.', components: ['rusty-key', 'silver-candle'], effect: 'Unlocks any single puzzle without solving it.' },
  },
  {
    a: 'herb-bundle',
    b: 'bone-flute',
    result: { id: 'spirit-soother', name: 'Spirit Soother', description: 'Burn the herbs while playing the flute.', components: ['herb-bundle', 'bone-flute'], effect: 'Prevents ghost encounters for one room.' },
  },
  {
    a: 'frozen-syringe',
    b: 'scarab-amulet',
    result: { id: 'elixir-of-clarity', name: 'Elixir of Clarity', description: 'Ancient Egyptian cryogenics. Somehow it works.', components: ['frozen-syringe', 'scarab-amulet'], effect: 'Restores full sanity and provides one free hint.' },
  },
  {
    a: 'obsidian-shard',
    b: 'infernal-ink',
    result: { id: 'dark-lexicon', name: 'Dark Lexicon', description: 'A book that writes itself in blood and shadow.', components: ['obsidian-shard', 'infernal-ink'], effect: 'Reveals all answers in the current room.' },
  },
  {
    a: 'ghost-jar',
    b: 'mirror-shard',
    result: { id: 'spectral-lens', name: 'Spectral Lens', description: 'The ghost shows you what the mirror hides.', components: ['ghost-jar', 'mirror-shard'], effect: 'See ghost events before they happen.' },
  },
];

// ---------------------------------------------------------------------------
// SSR-safe state — lazy initialization
// ---------------------------------------------------------------------------

let state: HorrorEscapeState | null = null;

function generateRunId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function getDateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function createDefaultRoomStates(): RoomState[] {
  return ROOMS.map((room, index) => ({
    roomId: index,
    status: index === 0 ? 'available' : 'locked',
    puzzlesSolved: 0,
    totalPuzzles: room.puzzlesPerRoom,
    startTime: null,
    endTime: null,
    artifactsFound: [],
    sanitySpent: 0,
    hintsUsedInRoom: 0,
    ghostEventsInRoom: 0,
    bestTime: null,
    completionCount: 0,
  }));
}

function createDefaultAchievements(): AchievementProgress[] {
  return ACHIEVEMENT_DEFS.map((def) => ({
    id: def.id,
    current: 0,
    max: def.maxProgress,
    unlocked: false,
    unlockedAt: null,
  }));
}

function createDefaultState(): HorrorEscapeState {
  return {
    currentRoom: -1,
    roomStates: createDefaultRoomStates(),
    sanity: SANITY_MAX,
    maxSanity: SANITY_MAX,
    inventory: [],
    totalEscapes: 0,
    bestTime: Infinity,
    bestGrade: 'F',
    totalScore: 0,
    totalPuzzlesSolved: 0,
    activePuzzle: null,
    activePuzzleIndex: -1,
    hintsUsed: 0,
    isNightmareMode: false,
    nightmareConfig: {
      enabled: false,
      sanityMultiplier: NIGHTMARE_SANITY_MULTIPLIER,
      timeReduction: NIGHTMARE_TIME_REDUCTION,
      hintPenalty: NIGHTMARE_HINT_PENALTY,
      puzzleDifficulty: 'nightmare',
      ghostFrequency: NIGHTMARE_GHOST_FREQUENCY,
    },
    dailyChallenge: null,
    dailyCompleted: false,
    achievements: createDefaultAchievements(),
    runHistory: [],
    ghostEncounters: 0,
    ghostLog: [],
    combinedItems: [],
    currentStreak: 0,
    bestStreak: 0,
    totalPlaytime: 0,
    isPaused: false,
    pauseTime: null,
    sessionStartTime: null,
    activeGhostEffects: [],
    lastGhostTime: 0,
    totalHintCost: 0,
    perfectRunRoomIds: [],
  };
}

function ensureInit(): HorrorEscapeState {
  if (!state) {
    state = createDefaultState();
  }
  return state;
}

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

function getPuzzlesForRoom(roomId: number): PuzzleData[] {
  const start = roomId * PUZZLES_PER_ROOM;
  return PUZZLES.slice(start, start + PUZZLES_PER_ROOM);
}

function getDifficultyTier(difficulty: DifficultyTier): number {
  switch (difficulty) {
    case 'creepy': return 0;
    case 'frightening': return 1;
    case 'terrifying': return 2;
    case 'nightmare': return 3;
  }
}

function getGradeRank(grade: Grade): number {
  switch (grade) {
    case 'S': return 5;
    case 'A': return 4;
    case 'B': return 3;
    case 'C': return 2;
    case 'D': return 1;
    case 'F': return 0;
  }
}

function getGradeFromScore(score: number): Grade {
  if (score >= 900) return 'S';
  if (score >= 750) return 'A';
  if (score >= 600) return 'B';
  if (score >= 450) return 'C';
  if (score >= 300) return 'D';
  return 'F';
}

function getSanityLevel(sanity: number): string {
  if (sanity >= 80) return 'Calm';
  if (sanity >= 60) return 'Uneasy';
  if (sanity >= 40) return 'Anxious';
  if (sanity >= 20) return 'Terrified';
  if (sanity >= 10) return 'Breaking';
  return 'Lost';
}

function getSanityColor(sanity: number): string {
  if (sanity >= 80) return '#4ade80';
  if (sanity >= 60) return '#facc15';
  if (sanity >= 40) return '#f97316';
  if (sanity >= 20) return '#ef4444';
  return '#7c1d1d';
}

function getSanityEffects(sanity: number): string[] {
  const effects: string[] = [];
  if (sanity <= 20) effects.push('Hallucinations: Text appears distorted');
  if (sanity <= 30) effects.push('Paranoia: Ghost events more frequent');
  if (sanity <= 40) effects.push('Trembling: Puzzle timers feel faster');
  if (sanity <= 50) effects.push('Anxiety: Hint costs are higher');
  if (sanity <= 60) effects.push('Discomfort: Room atmosphere darkens');
  if (sanity <= 70) effects.push('Restlessness: Background sounds intensify');
  return effects;
}

function isSanityZero(s: HorrorEscapeState): boolean {
  return s.sanity <= 0;
}

function clampSanity(s: HorrorEscapeState, value: number): number {
  const max = s.isNightmareMode ? Math.floor(s.maxSanity * NIGHTMARE_SANITY_MULTIPLIER) : s.maxSanity;
  return Math.max(0, Math.min(max, value));
}

function recordRun(s: HorrorEscapeState, roomId: number, completed: boolean, score: number, grade: Grade, duration: number, puzzlesSolved: number, totalPuzzles: number): EscapeRun {
  const run: EscapeRun = {
    runId: generateRunId(),
    roomId,
    roomName: ROOMS[roomId].name,
    completed,
    startTime: s.sessionStartTime ?? Date.now() - duration,
    endTime: Date.now(),
    duration,
    score,
    grade,
    puzzlesSolved,
    totalPuzzles,
    hintsUsed: s.hintsUsed,
    sanityRemaining: s.sanity,
    artifactsFound: s.inventory.map((a) => a.id),
    isNightmare: s.isNightmareMode,
    ghostEncounters: s.ghostLog.length,
  };
  s.runHistory.unshift(run);
  if (s.runHistory.length > MAX_RUN_HISTORY) {
    s.runHistory = s.runHistory.slice(0, MAX_RUN_HISTORY);
  }
  return run;
}

function findArtifactInInventory(s: HorrorEscapeState, artifactId: string): Artifact | null {
  return s.inventory.find((a) => a.id === artifactId) ?? null;
}

function updateAchievement(s: HorrorEscapeState, id: string, increment: number): void {
  const ach = s.achievements.find((a) => a.id === id);
  if (!ach) return;
  ach.current = Math.min(ach.max, ach.current + increment);
  if (!ach.unlocked && ach.current >= ach.max) {
    ach.unlocked = true;
    ach.unlockedAt = Date.now();
  }
}

function checkAllAchievements(s: HorrorEscapeState): AchievementProgress[] {
  const completedRooms = s.roomStates.filter((r) => r.status === 'completed').length;
  const NightmareRooms = s.roomStates.filter((r) => r.status === 'completed' && ROOMS[r.roomId].difficulty === 'nightmare').length;

  updateAchievement(s, 'full-house', 0); // set directly
  if (completedRooms >= 8) {
    const ach = s.achievements.find((a) => a.id === 'full-house');
    if (ach) { ach.current = 8; ach.unlocked = true; ach.unlockedAt = ach.unlockedAt ?? Date.now(); }
  }

  if (NightmareRooms >= 8) {
    const ach = s.achievements.find((a) => a.id === 'all-nightmare');
    if (ach) { ach.current = 8; ach.unlocked = true; ach.unlockedAt = ach.unlockedAt ?? Date.now(); }
  }

  updateAchievement(s, 'ghost_encounters', 0);
  updateAchievement(s, 'puzzles_solved', 0);
  updateAchievement(s, 'streak', 0);

  if (s.bestStreak >= 5) {
    const ach = s.achievements.find((a) => a.id === 'streak-keeper');
    if (ach) { ach.current = s.bestStreak; if (ach.current >= ach.max) { ach.unlocked = true; ach.unlockedAt = ach.unlockedAt ?? Date.now(); } }
  }

  // Clue type tracking
  const clueTypeCounts: Record<string, number> = {};
  for (const run of s.runHistory) {
    // approximate: each room has 4 puzzles of varied types
    const roomPuzzles = getPuzzlesForRoom(run.roomId);
    for (let i = 0; i < run.puzzlesSolved; i++) {
      const p = roomPuzzles[i];
      if (p) {
        clueTypeCounts[p.clueType] = (clueTypeCounts[p.clueType] ?? 0) + 1;
      }
    }
  }
  const allTypesAtLeastFive = Object.values(clueTypeCounts).every((c) => c >= 5);
  if (allTypesAtLeastFive && Object.keys(clueTypeCounts).length >= 6) {
    const ach = s.achievements.find((a) => a.id === 'word-weaver');
    if (ach) { ach.current = 30; ach.unlocked = true; ach.unlockedAt = ach.unlockedAt ?? Date.now(); }
  }

  return s.achievements;
}

function applySanityImpact(s: HorrorEscapeState, impact: number): number {
  const multiplier = s.isNightmareMode ? 1.3 : 1.0;
  const effective = impact * multiplier;
  s.sanity = clampSanity(s, s.sanity + effective);
  return s.sanity;
}

// ---------------------------------------------------------------------------
// EXPORTED: State Management
// ---------------------------------------------------------------------------

export function heGetState(): HorrorEscapeState {
  return ensureInit();
}

export function heResetState(): void {
  state = createDefaultState();
}

export function heInitNewRoom(roomId: number): RoomState | null {
  const s = ensureInit();
  if (roomId < 0 || roomId >= ROOM_COUNT) return null;
  const rs = s.roomStates[roomId];
  if (!rs || rs.status === 'locked') return null;
  rs.status = 'in-progress';
  rs.puzzlesSolved = 0;
  rs.startTime = Date.now();
  rs.endTime = null;
  rs.artifactsFound = [];
  rs.sanitySpent = 0;
  rs.hintsUsedInRoom = 0;
  rs.ghostEventsInRoom = 0;
  s.currentRoom = roomId;
  s.sessionStartTime = Date.now();
  s.activePuzzle = null;
  s.activePuzzleIndex = -1;
  s.isPaused = false;
  s.pauseTime = null;
  // Restore sanity for new room
  s.sanity = s.isNightmareMode ? Math.floor(SANITY_MAX * NIGHTMARE_SANITY_MULTIPLIER) : SANITY_MAX;
  return rs;
}

export function heExportState(): string {
  const s = ensureInit();
  return JSON.stringify(s);
}

export function heImportState(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as HorrorEscapeState;
    if (parsed && typeof parsed.currentRoom === 'number' && Array.isArray(parsed.roomStates)) {
      state = parsed;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// EXPORTED: Room Management
// ---------------------------------------------------------------------------

export function heGetCurrentRoom(): RoomDefinition | null {
  const s = ensureInit();
  if (s.currentRoom < 0 || s.currentRoom >= ROOM_COUNT) return null;
  return ROOMS[s.currentRoom];
}

export function heGetRoom(index: number): RoomDefinition | null {
  if (index < 0 || index >= ROOM_COUNT) return null;
  return ROOMS[index];
}

export function heGetAllRooms(): RoomDefinition[] {
  return [...ROOMS];
}

export function heGetRoomState(roomId: number): RoomState | null {
  const s = ensureInit();
  if (roomId < 0 || roomId >= ROOM_COUNT) return null;
  return s.roomStates[roomId];
}

export function heStartRoom(roomId: number): boolean {
  const s = ensureInit();
  const rs = s.roomStates[roomId];
  if (!rs || rs.status === 'locked') return false;
  return heInitNewRoom(roomId) !== null;
}

export function heUnlockRoom(roomId: number): boolean {
  const s = ensureInit();
  if (roomId <= 0 || roomId >= ROOM_COUNT) return false;
  const prevRoom = s.roomStates[roomId - 1];
  if (prevRoom.status !== 'completed') return false;
  s.roomStates[roomId].status = 'available';
  return true;
}

export function heGetRoomProgress(): RoomProgress[] {
  const s = ensureInit();
  return s.roomStates.map((rs) => {
    const room = ROOMS[rs.roomId];
    let stars = 0;
    if (rs.status === 'completed') {
      stars = 1;
      if (rs.bestTime !== null && rs.bestTime < room.timeLimit * 0.5) stars = 3;
      else if (rs.bestTime !== null && rs.bestTime < room.timeLimit * 0.75) stars = 2;
    }
    return {
      roomId: rs.roomId,
      roomName: room.name,
      status: rs.status,
      puzzlesSolved: rs.puzzlesSolved,
      totalPuzzles: rs.totalPuzzles,
      bestTime: rs.bestTime,
      completionCount: rs.completionCount,
      stars,
    };
  });
}

export function heGetNextAvailableRoom(): number {
  const s = ensureInit();
  for (let i = 0; i < ROOM_COUNT; i++) {
    if (s.roomStates[i].status === 'available' || s.roomStates[i].status === 'in-progress') {
      return i;
    }
  }
  return -1;
}

export function heCompleteCurrentRoom(): boolean {
  const s = ensureInit();
  if (s.currentRoom < 0) return false;
  const rs = s.roomStates[s.currentRoom];
  if (!rs || rs.status !== 'in-progress') return false;

  const duration = rs.startTime ? (Date.now() - rs.startTime) / 1000 : 0;
  rs.status = 'completed';
  rs.endTime = Date.now();
  rs.completionCount++;

  if (rs.bestTime === null || duration < rs.bestTime) {
    rs.bestTime = duration;
  }

  const grade = heCalculateGrade();
  const score = heGetScore();
  recordRun(s, s.currentRoom, true, score, grade, duration, rs.puzzlesSolved, rs.totalPuzzles);

  // Update global stats
  s.totalEscapes++;
  s.totalScore += score;
  if (duration < s.bestTime) s.bestTime = duration;
  if (getGradeRank(grade) > getGradeRank(s.bestGrade)) {
    s.bestGrade = grade;
  }

  // Achievement checks
  updateAchievement(s, 'first-escape', 1);
  if (duration < 60) updateAchievement(s, 'speed-demon', 1);
  if (s.sanity >= 90) updateAchievement(s, 'sanity-master', 1);
  if (s.hintsUsed === 0) {
    updateAchievement(s, 'no-hint-run', 1);
    s.perfectRunRoomIds.push(s.currentRoom);
  }
  if (s.isNightmareMode) updateAchievement(s, 'nightmare-survivor', 1);
  if (grade === 'S') updateAchievement(s, 'perfect-score', 1);

  updateAchievement(s, 'puzzles_solved', rs.puzzlesSolved);

  // Streak
  s.currentStreak++;
  if (s.currentStreak > s.bestStreak) s.bestStreak = s.currentStreak;
  updateAchievement(s, 'streak', 0);

  checkAllAchievements(s);

  // Unlock next room
  if (s.currentRoom + 1 < ROOM_COUNT) {
    s.roomStates[s.currentRoom + 1].status = 'available';
  }

  s.currentRoom = -1;
  s.activePuzzle = null;
  s.sessionStartTime = null;
  return true;
}

export function heFailCurrentRoom(): boolean {
  const s = ensureInit();
  if (s.currentRoom < 0) return false;
  const rs = s.roomStates[s.currentRoom];
  if (!rs || rs.status !== 'in-progress') return false;

  const duration = rs.startTime ? (Date.now() - rs.startTime) / 1000 : 0;
  rs.status = 'failed';
  rs.endTime = Date.now();

  recordRun(s, s.currentRoom, false, 0, 'F', duration, rs.puzzlesSolved, rs.totalPuzzles);

  s.currentStreak = 0;
  s.currentRoom = -1;
  s.activePuzzle = null;
  s.sessionStartTime = null;
  return true;
}

// ---------------------------------------------------------------------------
// EXPORTED: Puzzle Management
// ---------------------------------------------------------------------------

export function heGetPuzzle(roomId: number, puzzleIndex: number): PuzzleData | null {
  const s = ensureInit();
  const rs = s.roomStates[roomId];
  if (!rs || rs.status !== 'in-progress') return null;
  const puzzles = getPuzzlesForRoom(roomId);
  if (puzzleIndex < 0 || puzzleIndex >= puzzles.length) return null;
  return puzzles[puzzleIndex];
}

export function heStartNextPuzzle(): PuzzleData | null {
  const s = ensureInit();
  if (s.currentRoom < 0) return null;
  const rs = s.roomStates[s.currentRoom];
  if (!rs || rs.status !== 'in-progress') return null;

  const puzzles = getPuzzlesForRoom(s.currentRoom);
  const nextIndex = rs.puzzlesSolved;
  if (nextIndex >= puzzles.length) return null;

  const puzzle = puzzles[nextIndex];
  s.activePuzzle = puzzle;
  s.activePuzzleIndex = nextIndex;
  return puzzle;
}

export function heGetActivePuzzle(): PuzzleData | null {
  const s = ensureInit();
  return s.activePuzzle;
}

export function heCheckAnswer(answer: string): SolveResult {
  const s = ensureInit();
  if (!s.activePuzzle) {
    return { correct: false, message: 'No active puzzle.', scoreGained: 0, sanityChange: 0, timeBonus: 0, puzzleCompleted: false, roomCompleted: false };
  }

  const normalizedAnswer = answer.trim().toUpperCase().replace(/\s+/g, '');
  const correctAnswer = s.activePuzzle.answer.toUpperCase().replace(/\s+/g, '');
  const correct = normalizedAnswer === correctAnswer;

  if (correct) {
    const rs = s.roomStates[s.currentRoom];
    rs.puzzlesSolved++;
    s.totalPuzzlesSolved++;

    // Calculate score
    const baseScore = 100 * (getDifficultyTier(s.activePuzzle.difficulty) + 1);
    const timeBonus = s.activePuzzle.timeBonus;
    const sanityChange = s.activePuzzle.sanityCost * -1; // correct answers restore some sanity
    applySanityImpact(s, -s.activePuzzle.sanityCost * 0.5); // small sanity gain

    const puzzleCompleted = true;
    const roomCompleted = rs.puzzlesSolved >= rs.totalPuzzles;

    s.activePuzzle = null;
    s.activePuzzleIndex = -1;

    if (roomCompleted) {
      heCompleteCurrentRoom();
    }

    return {
      correct: true,
      message: `Correct! ${roomCompleted ? 'Room completed!' : 'Next puzzle unlocked.'}`,
      scoreGained: baseScore + timeBonus,
      sanityChange,
      timeBonus,
      puzzleCompleted,
      roomCompleted,
    };
  }

  // Wrong answer
  const sanityPenalty = s.activePuzzle.sanityCost;
  applySanityImpact(s, -sanityPenalty);

  if (isSanityZero(s)) {
    heFailCurrentRoom();
    return {
      correct: false,
      message: 'Wrong answer. Your sanity has been consumed by the darkness...',
      scoreGained: 0,
      sanityChange: -sanityPenalty,
      timeBonus: 0,
      puzzleCompleted: false,
      roomCompleted: false,
    };
  }

  return {
    correct: false,
    message: 'Wrong answer. The shadows grow thicker...',
    scoreGained: 0,
    sanityChange: -sanityPenalty,
    timeBonus: 0,
    puzzleCompleted: false,
    roomCompleted: false,
  };
}

export function heSolvePuzzle(answer: string): SolveResult {
  return heCheckAnswer(answer);
}

export function heSkipPuzzle(): boolean {
  const s = ensureInit();
  if (!s.activePuzzle || s.currentRoom < 0) return false;

  const rs = s.roomStates[s.currentRoom];
  rs.puzzlesSolved++;
  applySanityImpact(s, -10); // penalty for skipping

  s.activePuzzle = null;
  s.activePuzzleIndex = -1;

  if (rs.puzzlesSolved >= rs.totalPuzzles) {
    heCompleteCurrentRoom();
  }
  return true;
}

export function heGetRemainingPuzzles(): number {
  const s = ensureInit();
  if (s.currentRoom < 0) return 0;
  const rs = s.roomStates[s.currentRoom];
  if (!rs) return 0;
  return rs.totalPuzzles - rs.puzzlesSolved;
}

// ---------------------------------------------------------------------------
// EXPORTED: Hint System
// ---------------------------------------------------------------------------

export function heGetHint(level: HintLevel): HintResult | null {
  const s = ensureInit();
  if (!s.activePuzzle) return null;

  let text = '';
  let sanityCost = 0;

  switch (level) {
    case 'subtle':
      text = s.activePuzzle.hintSubtle;
      sanityCost = HINT_COST_SUBTLE;
      break;
    case 'moderate':
      text = s.activePuzzle.hintModerate;
      sanityCost = HINT_COST_MODERATE;
      break;
    case 'direct':
      text = s.activePuzzle.hintDirect;
      sanityCost = HINT_COST_DIRECT;
      break;
  }

  // Nightmare penalty
  if (s.isNightmareMode) {
    sanityCost = Math.ceil(sanityCost * NIGHTMARE_HINT_PENALTY);
  }

  // Low sanity penalty
  if (s.sanity < 30) {
    sanityCost = Math.ceil(sanityCost * 1.3);
  }

  applySanityImpact(s, -sanityCost);

  s.hintsUsed++;
  s.totalHintCost += sanityCost;
  if (s.currentRoom >= 0) {
    s.roomStates[s.currentRoom].hintsUsedInRoom++;
  }

  if (isSanityZero(s)) {
    heFailCurrentRoom();
  }

  return {
    level,
    text,
    sanityCost,
    remainingSanity: s.sanity,
  };
}

export function heGetHintsUsed(): number {
  return ensureInit().hintsUsed;
}

export function heGetHintCost(level: HintLevel): number {
  const s = ensureInit();
  let base: number;
  switch (level) {
    case 'subtle': base = HINT_COST_SUBTLE; break;
    case 'moderate': base = HINT_COST_MODERATE; break;
    case 'direct': base = HINT_COST_DIRECT; break;
  }
  if (s.isNightmareMode) base = Math.ceil(base * NIGHTMARE_HINT_PENALTY);
  if (s.sanity < 30) base = Math.ceil(base * 1.3);
  return base;
}

// ---------------------------------------------------------------------------
// EXPORTED: Inventory System
// ---------------------------------------------------------------------------

export function heGetInventory(): Artifact[] {
  return [...ensureInit().inventory];
}

export function heAddArtifact(artifactId: string): Artifact | null {
  const s = ensureInit();
  const artifact = ARTIFACTS.find((a) => a.id === artifactId);
  if (!artifact) return null;
  if (s.inventory.find((a) => a.id === artifactId)) return null; // already owned
  s.inventory.push({ ...artifact });
  if (s.currentRoom >= 0) {
    s.roomStates[s.currentRoom].artifactsFound.push(artifactId);
  }
  updateAchievement(s, 'artifact-collector', 1);
  return artifact;
}

export function heUseItem(artifactId: string): { success: boolean; effect: string } {
  const s = ensureInit();
  const artifact = findArtifactInInventory(s, artifactId);
  if (!artifact) return { success: false, effect: 'Item not in inventory.' };

  // Apply artifact effects
  if (artifact.sanityBonus > 0) {
    applySanityImpact(s, artifact.sanityBonus);
    updateAchievement(s, 'sanity-saver', 1);
  } else if (artifact.sanityBonus < 0) {
    applySanityImpact(s, artifact.sanityBonus);
  }

  return { success: true, effect: artifact.effect };
}

export function heExamineItem(artifactId: string): { name: string; description: string; lore: string; rarity: ArtifactRarity } | null {
  const s = ensureInit();
  const artifact = findArtifactInInventory(s, artifactId);
  if (!artifact) return null;
  return {
    name: artifact.name,
    description: artifact.description,
    lore: artifact.lore,
    rarity: artifact.rarity,
  };
}

export function heCombineItems(artifactA: string, artifactB: string): CombinedItem | null {
  const s = ensureInit();
  const recipe = COMBINATION_RECIPES.find(
    (r) => (r.a === artifactA && r.b === artifactB) || (r.a === artifactB && r.b === artifactA)
  );
  if (!recipe) return null;

  const hasA = !!findArtifactInInventory(s, artifactA);
  const hasB = !!findArtifactInInventory(s, artifactB);
  if (!hasA || !hasB) return null;

  // Remove components from inventory
  s.inventory = s.inventory.filter((a) => a.id !== artifactA && a.id !== artifactB);
  s.combinedItems.push(recipe.result);

  return recipe.result;
}

export function heGetCombinedItems(): CombinedItem[] {
  return [...ensureInit().combinedItems];
}

export function heGetAllArtifactDefs(): Artifact[] {
  return ARTIFACTS.map((a) => ({ ...a }));
}

export function heGetArtifactsForRoom(roomId: number): Artifact[] {
  return ARTIFACTS.filter((a) => a.foundInRoom === roomId);
}

// ---------------------------------------------------------------------------
// EXPORTED: Sanity System
// ---------------------------------------------------------------------------

export function heGetSanity(): SanitySnapshot {
  const s = ensureInit();
  return {
    current: s.sanity,
    max: s.isNightmareMode ? Math.floor(s.maxSanity * NIGHTMARE_SANITY_MULTIPLIER) : s.maxSanity,
    level: getSanityLevel(s.sanity),
    color: getSanityColor(s.sanity),
    effects: getSanityEffects(s.sanity),
    isHallucinating: s.sanity <= SANITY_HALLUCINATION_THRESHOLD,
  };
}

export function heAffectSanity(amount: number): number {
  const s = ensureInit();
  return applySanityImpact(s, amount);
}

export function heRestoreSanity(amount: number): number {
  return heAffectSanity(Math.abs(amount));
}

export function heDrainSanity(amount: number): number {
  return heAffectSanity(-Math.abs(amount));
}

export function heIsSanityCritical(): boolean {
  return ensureInit().sanity <= SANITY_CRITICAL_THRESHOLD;
}

export function heIsHallucinating(): boolean {
  return ensureInit().sanity <= SANITY_HALLUCINATION_THRESHOLD;
}

// ---------------------------------------------------------------------------
// EXPORTED: Scoring System
// ---------------------------------------------------------------------------

export function heGetScore(): number {
  const s = ensureInit();
  if (s.currentRoom < 0) return s.totalScore;
  const rs = s.roomStates[s.currentRoom];
  const room = ROOMS[s.currentRoom];
  const duration = rs.startTime ? (Date.now() - rs.startTime) / 1000 : 0;

  // Base score from puzzles solved
  let score = 0;
  const puzzles = getPuzzlesForRoom(s.currentRoom);
  for (let i = 0; i < rs.puzzlesSolved && i < puzzles.length; i++) {
    score += 100 * (getDifficultyTier(puzzles[i].difficulty) + 1);
    score += puzzles[i].timeBonus;
  }

  // Time bonus
  const timeRemaining = Math.max(0, room.timeLimit - duration);
  const timeBonus = Math.floor((timeRemaining / room.timeLimit) * 200);
  score += timeBonus;

  // Sanity bonus
  const maxS = s.isNightmareMode ? Math.floor(SANITY_MAX * NIGHTMARE_SANITY_MULTIPLIER) : SANITY_MAX;
  const sanityBonus = Math.floor((s.sanity / maxS) * 150);
  score += sanityBonus;

  // Hint penalty
  const hintPenalty = rs.hintsUsedInRoom * 15;
  score -= hintPenalty;

  // Ghost penalty
  const ghostPenalty = rs.ghostEventsInRoom * 10;
  score -= ghostPenalty;

  // Nightmare multiplier
  if (s.isNightmareMode) score = Math.floor(score * 1.5);

  return Math.max(0, score);
}

export function heCalculateGrade(): Grade {
  return getGradeFromScore(heGetScore());
}

export function heCalculateTimeBonus(): number {
  const s = ensureInit();
  if (s.currentRoom < 0) return 0;
  const rs = s.roomStates[s.currentRoom];
  const room = ROOMS[s.currentRoom];
  if (!rs.startTime) return 0;
  const duration = (Date.now() - rs.startTime) / 1000;
  const timeRemaining = Math.max(0, room.timeLimit - duration);
  return Math.floor((timeRemaining / room.timeLimit) * 200);
}

export function heGetTimeRemaining(): number {
  const s = ensureInit();
  if (s.currentRoom < 0) return 0;
  const rs = s.roomStates[s.currentRoom];
  const room = ROOMS[s.currentRoom];
  if (!rs.startTime) return room.timeLimit;
  const elapsed = (Date.now() - rs.startTime) / 1000;
  const timeLimit = s.isNightmareMode ? room.timeLimit * NIGHTMARE_TIME_REDUCTION : room.timeLimit;
  return Math.max(0, timeLimit - elapsed);
}

export function heIsTimeUp(): boolean {
  return heGetTimeRemaining() <= 0;
}

export function heGetGrade(score: number): Grade {
  return getGradeFromScore(score);
}

export function heGetScoreBreakdown(): EscapeGradeResult {
  const s = ensureInit();
  const rs = s.currentRoom >= 0 ? s.roomStates[s.currentRoom] : null;
  const room = s.currentRoom >= 0 ? ROOMS[s.currentRoom] : null;
  const duration = rs?.startTime ? (Date.now() - rs.startTime) / 1000 : 0;
  const timeRemaining = room ? Math.max(0, room.timeLimit - duration) : 0;

  let baseScore = 0;
  if (rs && room) {
    const puzzles = getPuzzlesForRoom(s.currentRoom);
    for (let i = 0; i < rs.puzzlesSolved && i < puzzles.length; i++) {
      baseScore += 100 * (getDifficultyTier(puzzles[i].difficulty) + 1);
    }
  }

  const timeBonus = room ? Math.floor((timeRemaining / room.timeLimit) * 200) : 0;
  const maxS = s.isNightmareMode ? Math.floor(SANITY_MAX * NIGHTMARE_SANITY_MULTIPLIER) : SANITY_MAX;
  const sanityBonus = Math.floor((s.sanity / maxS) * 150);
  const hintPenalty = (rs?.hintsUsedInRoom ?? 0) * 15;
  const ghostPenalty = (rs?.ghostEventsInRoom ?? 0) * 10;
  const nightmareMultiplier = s.isNightmareMode ? 1.5 : 1.0;

  let total = (baseScore + timeBonus + sanityBonus - hintPenalty - ghostPenalty) * nightmareMultiplier;
  total = Math.max(0, Math.floor(total));

  return {
    grade: getGradeFromScore(total),
    score: total,
    breakdown: {
      baseScore,
      timeBonus,
      sanityBonus,
      hintPenalty,
      ghostPenalty,
      nightmareMultiplier,
    },
  };
}

// ---------------------------------------------------------------------------
// EXPORTED: Daily Challenge
// ---------------------------------------------------------------------------

export function heGetDailyRoom(): { room: RoomDefinition; puzzle: PuzzleData; seed: number } | null {
  const s = ensureInit();
  const seed = getDateSeed();
  const rng = seededRandom(seed);

  // Pick a random room (excluding locked ones)
  const availableRooms = s.roomStates.filter((r) => r.status !== 'locked');
  if (availableRooms.length === 0) return null;

  const roomIndex = Math.floor(rng() * availableRooms.length);
  const chosenRoom = availableRooms[roomIndex];
  const room = ROOMS[chosenRoom.roomId];
  const puzzles = getPuzzlesForRoom(chosenRoom.roomId);
  if (puzzles.length === 0) return null;

  const puzzleIndex = Math.floor(rng() * puzzles.length);
  const puzzle = puzzles[puzzleIndex];

  s.dailyChallenge = {
    date: new Date().toISOString().split('T')[0],
    roomId: chosenRoom.roomId,
    puzzleId: puzzle.id,
    completed: false,
    score: 0,
    bestScore: s.dailyChallenge?.bestScore ?? 0,
  };

  return { room, puzzle, seed };
}

export function heCompleteDaily(score: number): boolean {
  const s = ensureInit();
  if (!s.dailyChallenge || s.dailyChallenge.completed) return false;

  const today = new Date().toISOString().split('T')[0];
  if (s.dailyChallenge.date !== today) return false;

  s.dailyChallenge.completed = true;
  s.dailyChallenge.score = score;
  if (score > s.dailyChallenge.bestScore) {
    s.dailyChallenge.bestScore = score;
  }

  updateAchievement(s, 'daily-devotee', 1);
  return true;
}

export function heCheckDailyReset(): boolean {
  const s = ensureInit();
  if (!s.dailyChallenge) return true;
  const today = new Date().toISOString().split('T')[0];
  if (s.dailyChallenge.date !== today) {
    s.dailyChallenge = null;
    s.dailyCompleted = false;
    return true;
  }
  return false;
}

export function heGetDailyStatus(): DailyChallenge | null {
  const s = ensureInit();
  heCheckDailyReset();
  return s.dailyChallenge;
}

// ---------------------------------------------------------------------------
// EXPORTED: Nightmare Mode
// ---------------------------------------------------------------------------

export function heToggleNightmare(): boolean {
  const s = ensureInit();
  s.isNightmareMode = !s.isNightmareMode;
  s.nightmareConfig.enabled = s.isNightmareMode;
  if (s.isNightmareMode) {
    s.sanity = Math.floor(s.maxSanity * NIGHTMARE_SANITY_MULTIPLIER);
  }
  return s.isNightmareMode;
}

export function heSetNightmare(enabled: boolean): void {
  const s = ensureInit();
  s.isNightmareMode = enabled;
  s.nightmareConfig.enabled = enabled;
  if (enabled) {
    s.sanity = Math.floor(s.maxSanity * NIGHTMARE_SANITY_MULTIPLIER);
  }
}

export function heGetNightmareBonus(): { scoreMultiplier: number; sanityCap: number; timeReduction: number } {
  return {
    scoreMultiplier: 1.5,
    sanityCap: Math.floor(SANITY_MAX * NIGHTMARE_SANITY_MULTIPLIER),
    timeReduction: NIGHTMARE_TIME_REDUCTION,
  };
}

export function heIsNightmareMode(): boolean {
  return ensureInit().isNightmareMode;
}

export function heGetNightmareConfig(): NightmareConfig {
  return { ...ensureInit().nightmareConfig };
}

// ---------------------------------------------------------------------------
// EXPORTED: Ghost Encounters
// ---------------------------------------------------------------------------

export function heTriggerGhostEvent(): GhostEncounterResult | null {
  const s = ensureInit();
  if (s.currentRoom < 0) return null;

  const now = Date.now();
  const minInterval = s.isNightmareMode ? NIGHTMARE_GHOST_FREQUENCY : GHOST_MIN_INTERVAL;
  if (now - s.lastGhostTime < minInterval) return null;

  // Pick a random ghost event
  const eventIndex = Math.floor(Math.random() * GHOST_EVENTS.length);
  const event = GHOST_EVENTS[eventIndex];

  // Scale sanity impact by difficulty
  const room = ROOMS[s.currentRoom];
  const diffMultiplier = 1 + getDifficultyTier(room.difficulty) * 0.3;
  const finalImpact = Math.round(event.sanityImpact * diffMultiplier);
  const newSanity = applySanityImpact(s, finalImpact);

  s.ghostEncounters++;
  s.ghostLog.push(event);
  s.lastGhostTime = now;
  if (s.currentRoom >= 0) {
    s.roomStates[s.currentRoom].ghostEventsInRoom++;
  }
  s.activeGhostEffects.push(event);

  // Remove from active effects after duration (stored for reference)
  updateAchievement(s, 'ghost_encounters', 1);

  // Random artifact drop chance (15%)
  let artifactFound: string | null = null;
  if (Math.random() < 0.15) {
    const roomArtifacts = ARTIFACTS.filter((a) => a.foundInRoom === s.currentRoom && !s.inventory.find((inv) => inv.id === a.id));
    if (roomArtifacts.length > 0) {
      const drop = roomArtifacts[Math.floor(Math.random() * roomArtifacts.length)];
      s.inventory.push({ ...drop });
      artifactFound = drop.id;
      if (s.currentRoom >= 0) {
        s.roomStates[s.currentRoom].artifactsFound.push(drop.id);
      }
    }
  }

  if (isSanityZero(s)) {
    heFailCurrentRoom();
    return {
      event,
      newSanity,
      message: `${event.description} Your mind shatters...`,
      artifactFound,
    };
  }

  return {
    event,
    newSanity,
    message: event.description,
    artifactFound,
  };
}

export function heGetGhostEncounter(): GhostEvent | null {
  const result = heTriggerGhostEvent();
  return result?.event ?? null;
}

export function heGetGhostLog(): GhostEvent[] {
  return [...ensureInit().ghostLog];
}

export function heGetGhostEncounterCount(): number {
  return ensureInit().ghostEncounters;
}

export function heClearActiveGhostEffects(): void {
  ensureInit().activeGhostEffects = [];
}

// ---------------------------------------------------------------------------
// EXPORTED: Achievements
// ---------------------------------------------------------------------------

export function heCheckAchievements(): AchievementProgress[] {
  const s = ensureInit();
  return checkAllAchievements(s);
}

export function heGetAchievements(): AchievementProgress[] {
  return [...ensureInit().achievements];
}

export function heGetAchievementDefs(): AchievementDef[] {
  return ACHIEVEMENT_DEFS.map((a) => ({ ...a }));
}

export function heGetAchievementProgress(achievementId: string): AchievementProgress | null {
  return ensureInit().achievements.find((a) => a.id === achievementId) ?? null;
}

export function heIsAchievementUnlocked(achievementId: string): boolean {
  return ensureInit().achievements.find((a) => a.id === achievementId)?.unlocked ?? false;
}

export function heGetUnlockedAchievements(): AchievementProgress[] {
  return ensureInit().achievements.filter((a) => a.unlocked);
}

export function heGetLockedAchievements(): AchievementProgress[] {
  return ensureInit().achievements.filter((a) => !a.unlocked);
}

// ---------------------------------------------------------------------------
// EXPORTED: Run History & Stats
// ---------------------------------------------------------------------------

export function heGetRunHistory(): EscapeRun[] {
  return [...ensureInit().runHistory];
}

export function heGetBestRun(): EscapeRun | null {
  const s = ensureInit();
  if (s.runHistory.length === 0) return null;
  return s.runHistory.reduce((best, run) => (run.score > best.score ? run : best));
}

export function heGetBestRunForRoom(roomId: number): EscapeRun | null {
  const s = ensureInit();
  const roomRuns = s.runHistory.filter((r) => r.roomId === roomId && r.completed);
  if (roomRuns.length === 0) return null;
  return roomRuns.reduce((best, run) => (run.score > best.score ? run : best));
}

export function heGetStats(): OverallStats {
  const s = ensureInit();
  const completedRuns = s.runHistory.filter((r) => r.completed);
  const totalSanity = completedRuns.reduce((sum, r) => sum + r.sanityRemaining, 0);
  const avgSanity = completedRuns.length > 0 ? Math.floor(totalSanity / completedRuns.length) : 0;

  return {
    totalEscapes: s.totalEscapes,
    totalRoomsCompleted: s.roomStates.filter((r) => r.status === 'completed').length,
    totalPuzzlesSolved: s.totalPuzzlesSolved,
    totalScore: s.totalScore,
    bestTime: s.bestTime === Infinity ? 0 : s.bestTime,
    bestGrade: s.bestGrade,
    totalHintsUsed: s.totalHintCost > 0 ? s.hintsUsed : 0,
    totalGhostEncounters: s.ghostEncounters,
    nightmareCompletions: completedRuns.filter((r) => r.isNightmare).length,
    perfectRuns: s.perfectRunRoomIds.length,
    averageSanityRemaining: avgSanity,
    currentStreak: s.currentStreak,
    bestStreak: s.bestStreak,
    totalPlaytime: s.runHistory.reduce((sum, r) => sum + r.duration, 0),
  };
}

export function heGetRecentRuns(count: number): EscapeRun[] {
  return ensureInit().runHistory.slice(0, Math.min(count, MAX_RUN_HISTORY));
}

// ---------------------------------------------------------------------------
// EXPORTED: Pause / Resume
// ---------------------------------------------------------------------------

export function hePause(): boolean {
  const s = ensureInit();
  if (s.currentRoom < 0 || s.isPaused) return false;
  s.isPaused = true;
  s.pauseTime = Date.now();
  return true;
}

export function heResume(): boolean {
  const s = ensureInit();
  if (!s.isPaused || s.currentRoom < 0 || !s.pauseTime) return false;
  const pauseDuration = Date.now() - s.pauseTime;
  if (s.roomStates[s.currentRoom].startTime) {
    // We don't adjust startTime to preserve time pressure, but we track total pause time
    s.totalPlaytime += pauseDuration / 1000;
  }
  s.isPaused = false;
  s.pauseTime = null;
  return true;
}

export function heIsPaused(): boolean {
  return ensureInit().isPaused;
}

// ---------------------------------------------------------------------------
// EXPORTED: Utility & Info
// ---------------------------------------------------------------------------

export function heGetAllPuzzleDefs(): PuzzleData[] {
  return PUZZLES.map((p) => ({ ...p }));
}

export function heGetPuzzlesForRoom(roomId: number): PuzzleData[] {
  return getPuzzlesForRoom(roomId).map((p) => ({ ...p }));
}

export function heGetClueTypes(): { type: ClueType; label: string; description: string }[] {
  return [
    { type: 'word-riddle', label: 'Word Riddles', description: 'Solve cryptic word puzzles to progress.' },
    { type: 'anagram-lock', label: 'Anagram Locks', description: 'Unscramble letters to find the password.' },
    { type: 'symbol-match', label: 'Symbol Matching', description: 'Match ancient symbols to their meanings.' },
    { type: 'pattern-sequence', label: 'Pattern Sequences', description: 'Complete sequences of letters and words.' },
    { type: 'morse-code', label: 'Morse Code', description: 'Decode messages in dots and dashes.' },
    { type: 'cipher-decode', label: 'Cipher Decode', description: 'Decrypt encoded messages using various ciphers.' },
  ];
}

export function heGetDifficultyTiers(): { tier: DifficultyTier; label: string; multiplier: number; color: string }[] {
  return [
    { tier: 'creepy', label: 'Creepy', multiplier: 1.0, color: '#4ade80' },
    { tier: 'frightening', label: 'Frightening', multiplier: 1.5, color: '#facc15' },
    { tier: 'terrifying', label: 'Terrifying', multiplier: 2.0, color: '#f97316' },
    { tier: 'nightmare', label: 'Nightmare', multiplier: 3.0, color: '#ef4444' },
  ];
}

export function heGetGhostEventTypes(): GhostEventType[] {
  return ['whisper', 'shadow-figure', 'cold-breeze', 'objects-move', 'flickering-lights', 'blood-writing', 'sudden-sound', 'mirror-haunting'];
}

export function heGetCurrentDifficulty(): DifficultyTier {
  const s = ensureInit();
  if (s.currentRoom < 0) return 'creepy';
  return ROOMS[s.currentRoom].difficulty;
}

export function heGetRoomLore(roomId: number): string | null {
  if (roomId < 0 || roomId >= ROOM_COUNT) return null;
  return ROOMS[roomId].loreIntro;
}

export function heGetPuzzleLore(puzzleId: string): string | null {
  const puzzle = PUZZLES.find((p) => p.id === puzzleId);
  return puzzle?.lore ?? null;
}

export function heGetActiveGhostEffects(): GhostEvent[] {
  return [...ensureInit().activeGhostEffects];
}

export function heGetStreak(): { current: number; best: number } {
  const s = ensureInit();
  return { current: s.currentStreak, best: s.bestStreak };
}

export function heGetCombinationRecipes(): { a: string; b: string; result: CombinedItem }[] {
  return COMBINATION_RECIPES.map((r) => ({ ...r, result: { ...r.result } }));
}

export function heCanCombine(artifactA: string, artifactB: string): boolean {
  return COMBINATION_RECIPES.some(
    (r) => (r.a === artifactA && r.b === artifactB) || (r.a === artifactB && r.b === artifactA)
  );
}

export function heGetTotalPlaytime(): number {
  return ensureInit().totalPlaytime;
}

export function heGetGameVersion(): string {
  return '1.0.0-horror-escape';
}
