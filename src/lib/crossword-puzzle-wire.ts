/**
 * crossword-puzzle-wire.ts
 *
 * Standalone Crossword Puzzle wire for the Word Snake game.
 * Generates programmatic crossword grids with intersecting words,
 * clue system, hint mechanics, scoring, daily puzzles, stats,
 * achievements, and UI helper functions.
 *
 * NO React imports — pure TypeScript logic.
 * NO localStorage / window / document / setInterval / setTimeout.
 * All exports use `cw` prefix.
 */

// ── Types ────────────────────────────────────────────────────────────────────

type CellState = 'empty' | 'letter' | 'black' | 'revealed' | 'correct' | 'wrong';
type Direction = 'across' | 'down';
type GridMode = 'small' | 'medium' | 'large';
type Category = 'animals' | 'food' | 'nature' | 'tech' | 'sports' | 'music' | 'science' | 'colors';

interface Cell {
  letter: string;
  state: CellState;
  number: number;
  wordIds: string[];
  playerLetter: string;
}

interface PlacedWord {
  id: string;
  word: string;
  row: number;
  col: number;
  direction: Direction;
  clue: string;
  category: Category;
  number: number;
  solved: boolean;
  lettersCorrect: number;
  lettersTotal: number;
}

interface ActiveGame {
  id: string;
  grid: Cell[][];
  words: PlacedWord[];
  mode: GridMode;
  gridSize: number;
  timerTotal: number;
  timerRemaining: number;
  score: number;
  combo: number;
  maxCombo: number;
  hintsRemaining: number;
  wrongAnswers: number;
  correctAnswers: number;
  totalCells: number;
  completedCells: number;
  completed: boolean;
  dateSeed: string;
  wordsSolvedCount: number;
  hintsUsed: number;
  startTime: number;
}

interface Stats {
  puzzlesCompleted: number;
  totalWordsSolved: number;
  bestTime: number;
  totalTimePlayed: number;
  currentStreak: number;
  dailyStreak: number;
  lastCompletedDate: string;
  perfectPuzzles: number;
  hintFreePuzzles: number;
  totalWrongAnswers: number;
  totalCorrectAnswers: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedDate: string | null;
  icon: string;
}

interface CwState {
  activeGame: ActiveGame | null;
  stats: Stats;
  achievements: Achievement[];
  completedPuzzles: string[];
  dailyCompletedDates: string[];
}

interface CheckResult {
  success: boolean;
  correct: boolean;
  state: CellState;
  combo: number;
  score: number;
  message: string;
  wordSolved: boolean;
  solvedWord?: string;
  puzzleComplete: boolean;
  finalScore: number;
}

interface HintResult {
  success: boolean;
  row: number;
  col: number;
  letter: string;
  hintsRemaining: number;
  message: string;
}

interface UIField {
  label: string;
  value: string;
  color: string;
}

interface UICard {
  title: string;
  icon: string;
  fields: UIField[];
  items: UIField[];
  color: string;
}

// ── Category Constants ───────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  'animals', 'food', 'nature', 'tech', 'sports', 'music', 'science', 'colors',
];

const CATEGORY_ICONS: Record<Category, string> = {
  animals: '🐾', food: '🍕', nature: '🌿', tech: '💻',
  sports: '⚽', music: '🎵', science: '🔬', colors: '🎨',
};

// ── Grid Configuration ───────────────────────────────────────────────────────

const GRID_CONFIGS: Record<GridMode, { size: number; words: number; timer: number; hints: number }> = {
  small:  { size: 10, words: 15, timer: 300, hints: 3 },
  medium: { size: 13, words: 25, timer: 600, hints: 3 },
  large:  { size: 15, words: 35, timer: 900, hints: 3 },
};

// ── Word Bank (500+ words across 8 categories with clues) ────────────────────

const WB: readonly (readonly [string, Category, string])[] = [
  // ── Animals (65) ──
  ['CAT', 'animals', 'Small furry pet that purrs'],
  ['DOG', 'animals', 'Loyal four-legged companion'],
  ['BIRD', 'animals', 'Feathered creature that flies'],
  ['FISH', 'animals', 'Aquatic creature with fins'],
  ['HORSE', 'animals', 'Large animal used for riding'],
  ['MOUSE', 'animals', 'Tiny rodent that squeaks'],
  ['SNAKE', 'animals', 'Legless reptile that slithers'],
  ['TIGER', 'animals', 'Large striped wild cat'],
  ['LION', 'animals', 'King of the jungle with a mane'],
  ['BEAR', 'animals', 'Large omnivorous forest mammal'],
  ['ELEPHANT', 'animals', 'Largest land animal with a trunk'],
  ['GIRAFFE', 'animals', 'Tallest living animal with a long neck'],
  ['DOLPHIN', 'animals', 'Intelligent marine mammal'],
  ['PENGUIN', 'animals', 'Flightless bird that loves ice'],
  ['EAGLE', 'animals', 'Majestic bird of prey'],
  ['FALCON', 'animals', 'Swift diving bird of prey'],
  ['PARROT', 'animals', 'Colorful bird that can mimic speech'],
  ['RABBIT', 'animals', 'Fluffy long-eared hopper'],
  ['TURTLE', 'animals', 'Slow reptile with a shell'],
  ['FROG', 'animals', 'Amphibian that croaks and leaps'],
  ['WHALE', 'animals', 'Enormous ocean-dwelling mammal'],
  ['SHARK', 'animals', 'Cartilaginous ocean predator'],
  ['MONKEY', 'animals', 'Primate that swings through trees'],
  ['ZEBRA', 'animals', 'African equine with black and white stripes'],
  ['DEER', 'animals', 'Graceful antlered woodland animal'],
  ['WOLF', 'animals', 'Wild canine that howls at the moon'],
  ['FOX', 'animals', 'Cunning reddish wild canine'],
  ['OTTER', 'animals', 'Playful water-loving mammal'],
  ['SEAL', 'animals', 'Marine mammal that barks'],
  ['CRAB', 'animals', 'Shell-clad crustacean with pincers'],
  ['SPIDER', 'animals', 'Eight-legged arachnid that spins silk'],
  ['ANT', 'animals', 'Tiny insect that lives in colonies'],
  ['BEE', 'animals', 'Buzzing insect that makes honey'],
  ['BUTTERFLY', 'animals', 'Winged insect with colorful patterns'],
  ['HEDGEHOG', 'animals', 'Small spiny mammal'],
  ['KOALA', 'animals', 'Australian marsupial that eats eucalyptus'],
  ['LEMUR', 'animals', 'Primate endemic to Madagascar'],
  ['PANDA', 'animals', 'Black and white bear from China'],
  ['RHINO', 'animals', 'Heavy herbivore with a horn'],
  ['SQUID', 'animals', 'Tentacled marine creature'],
  ['SWAN', 'animals', 'Elegant long-necked waterfowl'],
  ['CROW', 'animals', 'Black bird known for intelligence'],
  ['DOVE', 'animals', 'White bird symbolizing peace'],
  ['HAWK', 'animals', 'Sharp-eyed bird of prey'],
  ['OWL', 'animals', 'Nocturnal bird with large eyes'],
  ['PIG', 'animals', 'Pink farm animal that oinks'],
  ['COW', 'animals', 'Farm animal that produces milk'],
  ['SHEEP', 'animals', 'Woolly farm animal that bleats'],
  ['GOAT', 'animals', 'Bearded farm animal that climbs'],
  ['LAMB', 'animals', 'Young sheep with soft wool'],
  ['HERON', 'animals', 'Long-legged wading bird'],
  ['JAGUAR', 'animals', 'Spotted big cat of the Americas'],
  ['LIZARD', 'animals', 'Scaled reptile with a long tail'],
  ['MOTH', 'animals', 'Nocturnal winged insect drawn to light'],
  ['NEWT', 'animals', 'Small aquatic salamander'],
  ['ORCA', 'animals', 'Black and white ocean predator aka killer whale'],
  ['VULTURE', 'animals', 'Scavenging bird of prey'],
  ['WASP', 'animals', 'Stinging flying insect'],
  ['YAK', 'animals', 'Long-haired bovine of the Himalayas'],
  ['MANTIS', 'animals', 'Praying insect with powerful front legs'],
  ['IGUANA', 'animals', 'Large tropical lizard'],
  // ── Food (65) ──
  ['BREAD', 'food', 'Baked staple made from flour'],
  ['CAKE', 'food', 'Sweet baked dessert often with frosting'],
  ['RICE', 'food', 'Staple grain eaten worldwide'],
  ['PASTA', 'food', 'Italian wheat-based noodle'],
  ['PIZZA', 'food', 'Round baked dish with toppings and cheese'],
  ['BURGER', 'food', 'Grilled patty in a bun'],
  ['SALAD', 'food', 'Cold dish of mixed vegetables'],
  ['SOUP', 'food', 'Liquid savory meal in a bowl'],
  ['STEAK', 'food', 'Grilled or seared cut of beef'],
  ['CHEESE', 'food', 'Dairy product made from curdled milk'],
  ['BUTTER', 'food', 'Yellow spread made from cream'],
  ['SUGAR', 'food', 'Sweet crystalline substance'],
  ['FLOUR', 'food', 'Milled grain used in baking'],
  ['PEPPER', 'food', 'Spicy or sweet garden vegetable'],
  ['ONION', 'food', 'Layered bulb that makes you cry'],
  ['GARLIC', 'food', 'Pungent bulb used to flavor dishes'],
  ['TOMATO', 'food', 'Red fruit used as a vegetable'],
  ['POTATO', 'food', 'Starchy underground tuber'],
  ['CARROT', 'food', 'Orange root vegetable'],
  ['PEACH', 'food', 'Fuzzy stone fruit with sweet flesh'],
  ['APPLE', 'food', 'Crisp round fruit with many varieties'],
  ['GRAPE', 'food', 'Small round fruit that grows in clusters'],
  ['MANGO', 'food', 'Tropical stone fruit with golden flesh'],
  ['LEMON', 'food', 'Sour yellow citrus fruit'],
  ['LIME', 'food', 'Small green citrus fruit'],
  ['BANANA', 'food', 'Curved yellow tropical fruit'],
  ['ORANGE', 'food', 'Round citrus fruit with segments'],
  ['CHERRY', 'food', 'Small round red or dark fruit'],
  ['MELON', 'food', 'Large sweet fruit with thick rind'],
  ['BERRY', 'food', 'Small juicy fruit without a stone'],
  ['PLUM', 'food', 'Purple stone fruit'],
  ['PEAR', 'food', 'Bell-shaped sweet fruit'],
  ['OLIVE', 'food', 'Small oval fruit pressed for oil'],
  ['CORN', 'food', 'Yellow kernel grain on a cob'],
  ['BEAN', 'food', 'Edible seed from a pod'],
  ['PEA', 'food', 'Small round green vegetable'],
  ['LENTIL', 'food', 'Small lens-shaped legume'],
  ['GRAVY', 'food', 'Savory sauce made from meat drippings'],
  ['SAUCE', 'food', 'Liquid condiment or topping'],
  ['SUSHI', 'food', 'Japanese dish of vinegared rice and fish'],
  ['TACO', 'food', 'Mexican folded tortilla dish'],
  ['CURRY', 'food', 'Spiced stew from South Asia'],
  ['STEW', 'food', 'Slow-cooked thick soup with meat and veg'],
  ['PASTRY', 'food', 'Baked dough shell for pies and tarts'],
  ['COOKIE', 'food', 'Small flat sweet baked treat'],
  ['BISCUIT', 'food', 'Small fluffy baked bread'],
  ['WAFFLE', 'food', 'Grid-patterned breakfast item'],
  ['PANCAKE', 'food', 'Flat circular breakfast item cooked on a griddle'],
  ['YOGURT', 'food', 'Fermented creamy dairy product'],
  ['PUDDING', 'food', 'Creamy sweet dessert'],
  ['TRUFFLE', 'food', 'Rare prized fungal delicacy'],
  ['CUSTARD', 'food', 'Creamy egg-based dessert'],
  ['CREAM', 'food', 'Rich dairy topping'],
  ['HONEY', 'food', 'Golden sweet substance made by bees'],
  ['SYRUP', 'food', 'Thick sweet liquid from sap or sugar'],
  ['VINEGAR', 'food', 'Sour acidic liquid used in cooking'],
  ['MUSTARD', 'food', 'Pungent yellow condiment'],
  ['CINNAMON', 'food', 'Warm spice from tree bark'],
  ['VANILLA', 'food', 'Sweet aromatic flavoring from orchids'],
  ['GINGER', 'food', 'Spicy aromatic root used in cooking'],
  ['ALMOND', 'food', 'Edible oval nut'],
  ['WALNUT', 'food', 'Wrinkled brain-shaped nut'],
  ['PECAN', 'food', 'Smooth brown nut used in pies'],
  ['OAT', 'food', 'Whole grain used in porridge'],
  // ── Nature (65) ──
  ['RIVER', 'nature', 'Flowing body of fresh water'],
  ['OCEAN', 'nature', 'Vast body of salt water'],
  ['LAKE', 'nature', 'Inland body of standing water'],
  ['MOUNTAIN', 'nature', 'Large natural elevation of earth'],
  ['FOREST', 'nature', 'Dense area covered with trees'],
  ['DESERT', 'nature', 'Arid sandy landscape with little rain'],
  ['ISLAND', 'nature', 'Land mass surrounded by water'],
  ['VALLEY', 'nature', 'Low area between hills or mountains'],
  ['CAVE', 'nature', 'Natural underground hollow space'],
  ['CLIFF', 'nature', 'Steep vertical rock face'],
  ['STORM', 'nature', 'Violent weather disturbance'],
  ['RAIN', 'nature', 'Water droplets falling from clouds'],
  ['SNOW', 'nature', 'Frozen white precipitation'],
  ['WIND', 'nature', 'Moving air current'],
  ['THUNDER', 'nature', 'Loud rumbling sound after lightning'],
  ['CLOUD', 'nature', 'Visible mass of water vapor in the sky'],
  ['SUNSET', 'nature', 'The sun disappearing below the horizon'],
  ['SUNRISE', 'nature', 'First appearance of the sun in the morning'],
  ['RAINBOW', 'nature', 'Multicolored arc after rain'],
  ['FLOWER', 'nature', 'Colorful blooming part of a plant'],
  ['TREE', 'nature', 'Tall woody perennial plant'],
  ['LEAF', 'nature', 'Flat green blade on a branch'],
  ['ROOT', 'nature', 'Underground part of a plant'],
  ['BRANCH', 'nature', 'Arm of a tree extending from the trunk'],
  ['SEED', 'nature', 'Embryo of a plant enclosed in a covering'],
  ['PETAL', 'nature', 'Individual colorful segment of a flower'],
  ['VINE', 'nature', 'Climbing or trailing stem of a plant'],
  ['MOSS', 'nature', 'Small green plant growing in dense mats'],
  ['FERN', 'nature', 'Feather-leaved green plant'],
  ['CACTUS', 'nature', 'Spiny desert plant'],
  ['PALM', 'nature', 'Tropical tree with fan-shaped leaves'],
  ['PINE', 'nature', 'Evergreen coniferous tree'],
  ['OAK', 'nature', 'Strong hardwood tree with acorns'],
  ['ELM', 'nature', 'Large shade tree with serrated leaves'],
  ['MAPLE', 'nature', 'Tree known for its syrup and autumn color'],
  ['CEDAR', 'nature', 'Aromatic evergreen tree'],
  ['BIRCH', 'nature', 'White-barked deciduous tree'],
  ['WILLOW', 'nature', 'Weeping tree with slender drooping branches'],
  ['CANYON', 'nature', 'Deep narrow gorge with steep sides'],
  ['GLACIER', 'nature', 'Massive slow-moving body of ice'],
  ['WATERFALL', 'nature', 'Cascade of water falling from a height'],
  ['MEADOW', 'nature', 'Open field of grass and wildflowers'],
  ['PRAIRIE', 'nature', 'Vast flat grassland of North America'],
  ['SWAMP', 'nature', 'Wetland with trees and standing water'],
  ['MARSH', 'nature', 'Waterlogged grassy area'],
  ['REEF', 'nature', 'Underwater ridge of rock coral or sand'],
  ['VOLCANO', 'nature', 'Mountain that erupts with lava and ash'],
  ['EARTHQUAKE', 'nature', 'Sudden shaking of the ground'],
  ['TSUNAMI', 'nature', 'Massive ocean wave from seismic activity'],
  ['HURRICANE', 'nature', 'Powerful rotating tropical storm'],
  ['TORNADO', 'nature', 'Violently rotating column of air'],
  ['BLIZZARD', 'nature', 'Severe snowstorm with high winds'],
  ['DROUGHT', 'nature', 'Prolonged period of abnormally low rainfall'],
  ['AVALANCHE', 'nature', 'Mass of snow sliding down a mountain'],
  ['ECLIPSE', 'nature', 'Celestial body obscuring another'],
  ['TIDE', 'nature', 'Rise and fall of sea level'],
  ['COMET', 'nature', 'Icy body that orbits the sun with a tail'],
  ['METEOR', 'nature', 'Streak of light from space debris'],
  ['NEBULA', 'nature', 'Vast cloud of gas and dust in space'],
  ['GALAXY', 'nature', 'Massive system of stars held by gravity'],
  ['AURORA', 'nature', 'Natural light display near the poles'],
  ['CORAL', 'nature', 'Marine organism that forms reefs'],
  ['STREAM', 'nature', 'Small narrow flowing body of water'],
  ['GEYSER', 'nature', 'Hot spring that erupts periodically'],
  // ── Tech (60) ──
  ['CODE', 'tech', 'Instructions written for a computer'],
  ['DATA', 'tech', 'Information processed or stored by a computer'],
  ['BYTE', 'tech', 'Unit of digital information equal to eight bits'],
  ['PIXEL', 'tech', 'Smallest addressable element on a display'],
  ['CLOUD', 'tech', 'Remote servers for storage and computing'],
  ['WIFI', 'tech', 'Wireless network connection'],
  ['LINUX', 'tech', 'Open source operating system kernel'],
  ['MACRO', 'tech', 'Automated sequence of commands'],
  ['VIRUS', 'tech', 'Malicious software that replicates'],
  ['CACHE', 'tech', 'High-speed temporary data storage'],
  ['DEBUG', 'tech', 'Process of finding and fixing errors'],
  ['STACK', 'tech', 'LIFO data structure in programming'],
  ['ARRAY', 'tech', 'Ordered collection of elements'],
  ['QUEUE', 'tech', 'FIFO data structure in programming'],
  ['ROBOT', 'tech', 'Automated mechanical machine'],
  ['DRONE', 'tech', 'Unmanned aerial vehicle'],
  ['CYBER', 'tech', 'Prefix relating to computers and networks'],
  ['BINARY', 'tech', 'Base-two number system using zeros and ones'],
  ['MODEM', 'tech', 'Device that modulates signals for transmission'],
  ['ROUTER', 'tech', 'Device that forwards data packets between networks'],
  ['SERVER', 'tech', 'Computer that provides data to other computers'],
  ['CABLE', 'tech', 'Wire used to transmit data or power'],
  ['LASER', 'tech', 'Focused beam of coherent light'],
  ['CAMERA', 'tech', 'Device for capturing images'],
  ['SENSOR', 'tech', 'Device that detects physical input'],
  ['CHIP', 'tech', 'Integrated circuit on semiconductor material'],
  ['CIRCUIT', 'tech', 'Closed path through which electric current flows'],
  ['BATTERY', 'tech', 'Device storing chemical energy as electricity'],
  ['SCREEN', 'tech', 'Electronic visual display surface'],
  ['KEYBOARD', 'tech', 'Panel of keys for typing input'],
  ['MONITOR', 'tech', 'Screen that displays computer output'],
  ['LAPTOP', 'tech', 'Portable personal computer'],
  ['TABLET', 'tech', 'Touchscreen mobile computing device'],
  ['PHONE', 'tech', 'Mobile communication device'],
  ['NEURAL', 'tech', 'Relating to nerves or artificial brain networks'],
  ['ALGORITHM', 'tech', 'Step-by-step procedure for calculations'],
  ['NETWORK', 'tech', 'Interconnected group of computers'],
  ['BROWSER', 'tech', 'Software for accessing the internet'],
  ['SEARCH', 'tech', 'To look for information online or in data'],
  ['ENGINE', 'tech', 'Program that powers a core function'],
  ['SOFTWARE', 'tech', 'Programs and operating systems for computers'],
  ['HARDWARE', 'tech', 'Physical components of a computer system'],
  ['MEMORY', 'tech', 'Where a computer stores data temporarily'],
  ['STORAGE', 'tech', 'Long-term data retention on a device'],
  ['DISPLAY', 'tech', 'Visual output device or screen'],
  ['WIDGET', 'tech', 'Small interactive UI component'],
  ['PLUGIN', 'tech', 'Software add-on that extends functionality'],
  ['FIRMWARE', 'tech', 'Permanent software on a hardware device'],
  ['PYTHON', 'tech', 'Popular high-level programming language'],
  ['JAVA', 'tech', 'Class-based object-oriented programming language'],
  ['SWIFT', 'tech', 'Apple programming language for iOS apps'],
  ['RUST', 'tech', 'Systems programming language focused on safety'],
  ['SCRIPT', 'tech', 'Written set of instructions for automation'],
  ['STYLE', 'tech', 'Visual appearance rules in web development'],
  ['TOKEN', 'tech', 'Unit of data used in authentication'],
  ['PROXY', 'tech', 'Server that acts as intermediary'],
  ['SHELL', 'tech', 'Command-line interface to an operating system'],
  ['CRON', 'tech', 'Unix utility for scheduling tasks'],
  ['PING', 'tech', 'Network utility to test connectivity'],
  ['PORT', 'tech', 'Numbered endpoint for network communication'],
  ['CODEC', 'tech', 'Encoder-decoder for audio or video data'],
  ['GRAPH', 'tech', 'Data structure of nodes connected by edges'],
  // ── Sports (60) ──
  ['SOCCER', 'sports', 'Global sport where teams kick a ball into a goal'],
  ['TENNIS', 'sports', 'Racquet sport played over a net'],
  ['GOLF', 'sports', 'Sport of hitting a ball into a hole'],
  ['RUGBY', 'sports', 'Full-contact team sport with an oval ball'],
  ['BOXING', 'sports', 'Combat sport using gloved fists'],
  ['HOCKEY', 'sports', 'Team sport played with sticks and a puck'],
  ['CRICKET', 'sports', 'Bat-and-ball game popular in England and India'],
  ['SWIM', 'sports', 'To propel through water using limbs'],
  ['DIVE', 'sports', 'To jump headfirst into water'],
  ['SURF', 'sports', 'To ride ocean waves on a board'],
  ['ROW', 'sports', 'To propel a boat using oars'],
  ['RUN', 'sports', 'To move swiftly on foot'],
  ['JUMP', 'sports', 'To spring off the ground'],
  ['THROW', 'sports', 'To propel something through the air'],
  ['CATCH', 'sports', 'To grab a moving object mid-air'],
  ['KICK', 'sports', 'To strike with the foot'],
  ['SCORE', 'sports', 'To earn points in a game'],
  ['MATCH', 'sports', 'A competitive sporting contest'],
  ['TEAM', 'sports', 'Group of players competing together'],
  ['COACH', 'sports', 'Person who trains athletes'],
  ['REFEREE', 'sports', 'Official who enforces game rules'],
  ['STADIUM', 'sports', 'Large venue for sporting events'],
  ['COURT', 'sports', 'Playing surface for tennis or basketball'],
  ['FIELD', 'sports', 'Open grassy area for outdoor sports'],
  ['TRACK', 'sports', 'Oval running path for athletics'],
  ['BALL', 'sports', 'Spherical object used in many games'],
  ['RACQUET', 'sports', 'Handled frame with strings for hitting'],
  ['PADDLE', 'sports', 'Short-handled blade used in table tennis'],
  ['HELMET', 'sports', 'Protective headgear for athletes'],
  ['GOAL', 'sports', 'Target or point-scoring structure'],
  ['MEDAL', 'sports', 'Prize awarded for athletic achievement'],
  ['TROPHY', 'sports', 'Cup or ornament awarded as a prize'],
  ['RINGS', 'sports', 'Gymnastics apparatus or boxing competition'],
  ['VAULT', 'sports', 'Gymnastics jumping apparatus'],
  ['BEAM', 'sports', 'Narrow gymnastics balance bar'],
  ['LUGE', 'sports', 'Winter sliding sport on a small sled'],
  ['SLALOM', 'sports', 'Skiing event with gates to navigate'],
  ['JAVELIN', 'sports', 'Athletic spear-throwing event'],
  ['ARCHERY', 'sports', 'Sport of shooting arrows at a target'],
  ['FENCING', 'sports', 'Combat sport with swords'],
  ['KARATE', 'sports', 'Japanese martial art using strikes'],
  ['JUDO', 'sports', 'Japanese martial art focused on throws'],
  ['SUMO', 'sports', 'Japanese wrestling with large competitors'],
  ['YOGA', 'sports', 'Practice of physical poses and meditation'],
  ['POLO', 'sports', 'Team sport played on horseback'],
  ['CLIMB', 'sports', 'To ascend a wall or rock face'],
  ['SKATE', 'sports', 'To glide on ice or wheels'],
  ['SKI', 'sports', 'To glide over snow on long runners'],
  ['KAYAK', 'sports', 'Small narrow watercraft paddled with a double blade'],
  ['REGATTA', 'sports', 'Series of boat races'],
  ['SPRINT', 'sports', 'Short fast race over a set distance'],
  ['RELAY', 'sports', 'Race where team members take turns'],
  ['MARATHON', 'sports', 'Long-distance running race of 26.2 miles'],
  ['GYMNAST', 'sports', 'Athlete who performs acrobatic exercises'],
  ['ATHLETE', 'sports', 'Person trained to compete in physical sports'],
  ['CAPTAIN', 'sports', 'Leader of a sports team'],
  ['DEFENSE', 'sports', 'Action of preventing the opponent from scoring'],
  ['OFFENSE', 'sports', 'Action of trying to score points'],
  ['STRIKER', 'sports', 'Forward player whose main role is to score goals'],
  ['CENTER', 'sports', 'Middle position in basketball or ice hockey'],
  // ── Music (60) ──
  ['SONG', 'music', 'Musical composition with vocals or instruments'],
  ['BEAT', 'music', 'Regular rhythmic unit in music'],
  ['NOTE', 'music', 'Single musical pitch or symbol'],
  ['TUNE', 'music', 'Catchy memorable melody'],
  ['RHYTHM', 'music', 'Pattern of sounds and silences in time'],
  ['MELODY', 'music', 'Sequence of musical notes perceived as a single entity'],
  ['HARMONY', 'music', 'Combination of simultaneously sounded notes'],
  ['CHORD', 'music', 'Group of notes sounded together'],
  ['TEMPO', 'music', 'Speed at which a piece of music is played'],
  ['PITCH', 'music', 'How high or low a musical note sounds'],
  ['VOLUME', 'music', 'Loudness or softness of sound'],
  ['LYRIC', 'music', 'Words of a song'],
  ['VERSE', 'music', 'Section of a song with different lyrics each time'],
  ['CHORUS', 'music', 'Repeated section of a song with the main theme'],
  ['BRIDGE', 'music', 'Contrasting section connecting song parts'],
  ['SOLO', 'music', 'Performance by a single musician'],
  ['DUET', 'music', 'Musical piece performed by two people'],
  ['BAND', 'music', 'Group of musicians performing together'],
  ['CHOIR', 'music', 'Organized group of singers'],
  ['ORCHESTRA', 'music', 'Large ensemble of instrumentalists'],
  ['GUITAR', 'music', 'Six-stringed plucked instrument'],
  ['PIANO', 'music', 'Large keyboard instrument with hammers and strings'],
  ['DRUM', 'music', 'Percussion instrument hit with sticks'],
  ['VIOLIN', 'music', 'Bowed string instrument played on the shoulder'],
  ['FLUTE', 'music', 'Woodwind instrument played by blowing across a hole'],
  ['TRUMPET', 'music', 'Brass instrument with a bright piercing sound'],
  ['HARP', 'music', 'Large triangular stringed instrument'],
  ['BANJO', 'music', 'Stringed instrument with a round body'],
  ['CELLO', 'music', 'Large bowed string instrument between the knees'],
  ['TUBA', 'music', 'Large low-pitched brass instrument'],
  ['ORGAN', 'music', 'Keyboard instrument producing sound via pipes'],
  ['BASS', 'music', 'Low-pitched instrument or voice'],
  ['ROCK', 'music', 'Popular genre with electric guitars and strong beats'],
  ['JAZZ', 'music', 'Genre originating from African American communities'],
  ['BLUES', 'music', 'Genre rooted in deep emotion and expression'],
  ['FUNK', 'music', 'Danceable genre with strong bass grooves'],
  ['SOUL', 'music', 'Music genre combining gospel and rhythm'],
  ['PUNK', 'music', 'Fast aggressive rock genre'],
  ['METAL', 'music', 'Heavy loud rock subgenre'],
  ['REGGAE', 'music', 'Jamaican genre with offbeat rhythms'],
  ['OPERA', 'music', 'Dramatic theatrical singing performance'],
  ['OPUS', 'music', 'A musical composition or set of compositions'],
  ['ALBUM', 'music', 'Collection of songs released together'],
  ['RECORD', 'music', 'Vinyl disc containing recorded music'],
  ['SINGER', 'music', 'Person who uses their voice to make music'],
  ['COMPOSER', 'music', 'Person who writes musical pieces'],
  ['MAESTRO', 'music', 'Distinguished conductor or performer'],
  ['CANTATA', 'music', 'Vocal composition with instrumental accompaniment'],
  ['SONATA', 'music', 'Classical composition for one or two instruments'],
  ['STAFF', 'music', 'Set of five horizontal lines for writing music'],
  ['TREBLE', 'music', 'Highest of the main voice ranges in music'],
  ['KEY', 'music', 'Group of pitches with a specific tonal center'],
  ['SCALE', 'music', 'Ordered sequence of musical notes'],
  ['BAR', 'music', 'Segment of time containing a specific number of beats'],
  ['REED', 'music', 'Thin strip used in woodwind instruments'],
  ['MUTE', 'music', 'Device to dampen an instrument sound'],
  ['TANGO', 'music', 'Passionate Argentine partner dance and music'],
  ['WALTZ', 'music', 'Ballroom dance in triple time'],
  ['ANTHEM', 'music', 'Uplifting song identified with a group or cause'],
  ['HYMN', 'music', 'Religious or patriotic song of praise'],
  // ── Science (60) ──
  ['ATOM', 'science', 'Smallest unit of a chemical element'],
  ['CELL', 'science', 'Basic structural unit of all living organisms'],
  ['GENE', 'science', 'Unit of heredity in a living organism'],
  ['PROTEIN', 'science', 'Large biomolecule made of amino acids'],
  ['ENZYME', 'science', 'Biological catalyst that speeds up reactions'],
  ['VIRUS', 'science', 'Microscopic infectious agent'],
  ['BACTERIA', 'science', 'Single-celled microorganisms found everywhere'],
  ['FUNGI', 'science', 'Group of spore-producing organisms'],
  ['PLASMA', 'science', 'Fourth state of matter beyond gas'],
  ['PHOTON', 'science', 'Quantum particle of light'],
  ['NEUTRON', 'science', 'Subatomic particle with no electric charge'],
  ['PROTON', 'science', 'Positively charged subatomic particle'],
  ['ELECTRON', 'science', 'Negatively charged subatomic particle'],
  ['QUARK', 'science', 'Elementary particle and fundamental constituent of matter'],
  ['GRAVITY', 'science', 'Force that attracts objects toward each other'],
  ['MAGNET', 'science', 'Object that produces a magnetic field'],
  ['PRISM', 'science', 'Transparent optical element that refracts light'],
  ['LENS', 'science', 'Curved glass that focuses light'],
  ['LASER', 'science', 'Device emitting a concentrated beam of light'],
  ['MASS', 'science', 'Amount of matter in an object'],
  ['FORCE', 'science', 'Push or pull acting on an object'],
  ['ENERGY', 'science', 'Capacity to do work or cause change'],
  ['POWER', 'science', 'Rate at which work is done or energy transferred'],
  ['HEAT', 'science', 'Form of energy transferred between systems'],
  ['LIGHT', 'science', 'Electromagnetic radiation visible to the eye'],
  ['SOUND', 'science', 'Vibration that travels as an audible wave'],
  ['WAVE', 'science', 'Disturbance that transfers energy through matter'],
  ['QUANTUM', 'science', 'Minimum discrete amount of a physical property'],
  ['THEORY', 'science', 'Well-substantiated explanation of phenomena'],
  ['LAB', 'science', 'Room or building for scientific experiments'],
  ['ELEMENT', 'science', 'Pure substance made of one type of atom'],
  ['COMPOUND', 'science', 'Substance formed by chemically combining elements'],
  ['MOLECULE', 'science', 'Group of atoms bonded together'],
  ['REACTOR', 'science', 'Device for controlled nuclear reactions'],
  ['CRYSTAL', 'science', 'Solid with atoms arranged in ordered pattern'],
  ['MINERAL', 'science', 'Naturally occurring inorganic solid substance'],
  ['FOSSIL', 'science', 'Preserved remains of ancient organisms'],
  ['DINOSAUR', 'science', 'Extinct reptile from the Mesozoic era'],
  ['METEOR', 'science', 'Space rock that burns entering the atmosphere'],
  ['PLANET', 'science', 'Celestial body orbiting a star'],
  ['ORBIT', 'science', 'Curved path of an object around a star or planet'],
  ['SOLAR', 'science', 'Relating to or determined by the sun'],
  ['LUNAR', 'science', 'Relating to the moon'],
  ['CARBON', 'science', 'Element essential to all known life'],
  ['OXYGEN', 'science', 'Gas essential for breathing and combustion'],
  ['HYDROGEN', 'science', 'Lightest and most abundant element'],
  ['NITROGEN', 'science', 'Gas making up most of the atmosphere'],
  ['COPPER', 'science', 'Reddish metal and excellent conductor'],
  ['IRON', 'science', 'Common metal extracted from ore'],
  ['GOLD', 'science', 'Precious yellow metal element'],
  ['SILVER', 'science', 'Shiny precious metal element'],
  ['ACID', 'science', 'Substance with a pH below seven'],
  ['BASE', 'science', 'Substance with a pH above seven'],
  ['PH', 'science', 'Scale measuring acidity or alkalinity'],
  ['DNA', 'science', 'Double helix carrying genetic instructions'],
  ['RNA', 'science', 'Single-stranded molecule that helps decode DNA'],
  ['MUTATION', 'science', 'Change in the DNA sequence of an organism'],
  ['SPECIES', 'science', 'Group of organisms sharing common characteristics'],
  ['EVOLUTION', 'science', 'Process of change in species over generations'],
  ['VACCINE', 'science', 'Biological preparation providing immunity'],
  // ── Colors (60) ──
  ['RED', 'colors', 'Color of blood and roses'],
  ['BLUE', 'colors', 'Color of the clear sky and deep ocean'],
  ['GREEN', 'colors', 'Color of grass and emeralds'],
  ['YELLOW', 'colors', 'Color of sunshine and lemons'],
  ['ORANGE', 'colors', 'Color of carrots and sunset'],
  ['PURPLE', 'colors', 'Color of lavender and royalty'],
  ['PINK', 'colors', 'Color of cherry blossoms'],
  ['BLACK', 'colors', 'Color of night and coal'],
  ['WHITE', 'colors', 'Color of snow and purity'],
  ['BROWN', 'colors', 'Color of earth and chocolate'],
  ['GRAY', 'colors', 'Color between black and white'],
  ['SILVER', 'colors', 'Color of the precious metal'],
  ['GOLD', 'colors', 'Color of the precious metal and wealth'],
  ['VIOLET', 'colors', 'Color at the end of the visible spectrum'],
  ['INDIGO', 'colors', 'Deep blue-purple color'],
  ['CYAN', 'colors', 'Greenish-blue color'],
  ['MAGENTA', 'colors', 'Purplish-red color'],
  ['CRIMSON', 'colors', 'Strong red color inclining toward purple'],
  ['SCARLET', 'colors', 'Brilliant red color'],
  ['AMBER', 'colors', 'Fossilized yellow-orange resin color'],
  ['TURQUOISE', 'colors', 'Blue-green gemstone color'],
  ['CORAL', 'colors', 'Pinkish-orange marine color'],
  ['IVORY', 'colors', 'Off-white creamy color'],
  ['LAVENDER', 'colors', 'Pale purple flower color'],
  ['MAROON', 'colors', 'Dark brownish-red color'],
  ['NAVY', 'colors', 'Very dark blue color'],
  ['OLIVE', 'colors', 'Dark yellowish-green color'],
  ['PEACH', 'colors', 'Soft light orange color'],
  ['PLUM', 'colors', 'Dark reddish-purple color'],
  ['RUBY', 'colors', 'Deep red gemstone color'],
  ['TEAL', 'colors', 'Dark cyan green-blue color'],
  ['AMETHYST', 'colors', 'Purple quartz gemstone color'],
  ['AQUA', 'colors', 'Light blue-green water color'],
  ['AZURE', 'colors', 'Bright clear blue color'],
  ['BEIGE', 'colors', 'Pale sandy fawn color'],
  ['BURGUNDY', 'colors', 'Dark red wine color'],
  ['CHARTREUSE', 'colors', 'Bright yellow-green color'],
  ['CERULEAN', 'colors', 'Blue between azure and darker blue'],
  ['COBALT', 'colors', 'Strong deep blue color'],
  ['CREAM', 'colors', 'Pale yellowish-white color'],
  ['EMERALD', 'colors', 'Rich green gemstone color'],
  ['FUCHSIA', 'colors', 'Vivid purplish-red color'],
  ['GARNET', 'colors', 'Dark red semi-precious gemstone color'],
  ['HONEY', 'colors', 'Golden amber yellow color'],
  ['JADE', 'colors', 'Green gemstone color'],
  ['LILAC', 'colors', 'Pale violet flower color'],
  ['LIME', 'colors', 'Bright yellow-green citrus color'],
  ['MINT', 'colors', 'Cool pale green color'],
  ['ONYX', 'colors', 'Black gemstone color'],
  ['ORCHID', 'colors', 'Bright pinkish-purple flower color'],
  ['RUST', 'colors', 'Reddish-brown oxidized iron color'],
  ['SALMON', 'colors', 'Pale pinkish-orange color'],
  ['TAN', 'colors', 'Light brownish-yellow color'],
  ['TAUPE', 'colors', 'Dark grayish-brown color'],
  ['WISTERIA', 'colors', 'Pale climbing flower purple color'],
  ['RUBY', 'colors', 'Precious red gemstone color'],
  ['SIENNA', 'colors', 'Earthy reddish-brown pigment color'],
  ['COPPER', 'colors', 'Reddish metallic color'],
  ['SLATE', 'colors', 'Dark bluish-gray color'],
];

// ── Achievement Definitions ──────────────────────────────────────────────────

const ACHIEVEMENT_DEFS: readonly (readonly [string, string, string, string])[] = [
  ['first_solve',   'First Solve',       'Complete your first crossword puzzle',           '🏆'],
  ['speed_demon',   'Speed Demon',       'Complete a puzzle in under 2 minutes',          '⚡'],
  ['perfect_puzzle','Perfect Puzzle',    'Complete a puzzle with zero wrong answers',      '✨'],
  ['streak_7',      'Streak Master',     'Maintain a 7-day daily puzzle streak',         '🔥'],
  ['streak_30',     'Unstoppable',       'Maintain a 30-day daily puzzle streak',        '🌟'],
  ['word_hunter',   'Word Hunter',       'Solve 100 total words across all puzzles',     '🎯'],
  ['cw_master',     'Crossword Master',  'Complete 50 puzzles total',                     '👑'],
  ['hint_free',     'No Hints Needed',   'Complete a puzzle without using any hints',    '🧠'],
  ['lightning',     'Lightning Fast',    'Complete a puzzle in under 60 seconds',         '💨'],
  ['daily_devotee', 'Daily Devotee',     'Complete 10 daily puzzles',                     '📅'],
  ['large_boss',    'Large & In Charge', 'Complete a large (15x15) puzzle',              '🦖'],
  ['combo_king',    'Combo King',        'Reach a 15x combo in a single puzzle',          '🔥'],
  ['accuracy_ace',  'Accuracy Ace',      'Complete 10 puzzles with 100% accuracy',       '🎯'],
  ['marathon',      'Marathon Runner',   'Spend over 60 total minutes playing',          '🏃'],
  ['completionist', 'Completionist',     'Unlock all other achievements',                 '🏅'],
];

// ── Module-Level State (null-initialized for SSR) ────────────────────────────

let cwState: CwState | null = null;

// ── PRNG for Daily Puzzles ───────────────────────────────────────────────────

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = h ^ (h << 13);
    h = h ^ (h >> 17);
    h = h ^ (h << 5);
    return (h >>> 0) / 4294967296;
  };
}

function basicRandom(): () => number {
  return () => Math.random();
}

// ── Utility Functions ────────────────────────────────────────────────────────

function shuffleWithRng<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getWordsByCategory(cat: Category): string[] {
  return WB.filter(e => e[1] === cat).map(e => e[0]);
}

function getClueForWord(word: string): string {
  const entry = WB.find(e => e[0] === word);
  if (entry) return entry[2];
  return `A ${word.length}-letter word`;
}

function getCategoryForWord(word: string): Category {
  const entry = WB.find(e => e[0] === word);
  return entry ? entry[1] : 'animals';
}

function generateWordId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function generatePuzzleId(): string {
  return `cw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function todaysDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function createEmptyGrid(size: number): Cell[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      letter: '',
      state: 'empty' as CellState,
      number: 0,
      wordIds: [],
      playerLetter: '',
    }))
  );
}

// ── Crossword Grid Generation ────────────────────────────────────────────────

interface Placement {
  row: number;
  col: number;
  direction: Direction;
  intersections: number;
  centerDist: number;
}

function tryPlaceWord(
  grid: Cell[][],
  word: string,
  row: number,
  col: number,
  direction: Direction,
  gridSize: number,
  isFirst: boolean,
): Placement | null {
  const len = word.length;
  const dr = direction === 'down' ? 1 : 0;
  const dc = direction === 'across' ? 1 : 0;
  const endR = row + dr * (len - 1);
  const endC = col + dc * (len - 1);

  if (row < 0 || col < 0 || endR >= gridSize || endC >= gridSize) return null;

  const beforeR = row - dr;
  const beforeC = col - dc;
  if (beforeR >= 0 && beforeC >= 0 && grid[beforeR][beforeC].letter !== '') return null;

  const afterR = row + dr * len;
  const afterC = col + dc * len;
  if (afterR < gridSize && afterC < gridSize && grid[afterR][afterC].letter !== '') return null;

  let intersections = 0;

  for (let i = 0; i < len; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    const cell = grid[r][c];

    if (cell.letter !== '') {
      if (cell.letter !== word[i]) return null;
      intersections++;
    } else {
      if (direction === 'across') {
        if (r > 0 && grid[r - 1][c].letter !== '') return null;
        if (r < gridSize - 1 && grid[r + 1][c].letter !== '') return null;
      } else {
        if (c > 0 && grid[r][c - 1].letter !== '') return null;
        if (c < gridSize - 1 && grid[r][c + 1].letter !== '') return null;
      }
    }
  }

  if (!isFirst && intersections === 0) return null;

  const midR = row + dr * Math.floor(len / 2);
  const midC = col + dc * Math.floor(len / 2);
  const centerDist = Math.abs(midR - gridSize / 2) + Math.abs(midC - gridSize / 2);

  return { row, col, direction, intersections, centerDist };
}

function findBestPlacement(
  grid: Cell[][],
  word: string,
  placed: PlacedWord[],
  gridSize: number,
): Placement | null {
  let best: Placement | null = null;
  let bestScore = -1;

  for (const pw of placed) {
    const existingDir = pw.direction;
    const newDir: Direction = existingDir === 'across' ? 'down' : 'across';

    for (let wi = 0; wi < word.length; wi++) {
      for (let ei = 0; ei < pw.word.length; ei++) {
        if (word[wi] !== pw.word[ei]) continue;

        let r: number, c: number;
        if (newDir === 'down') {
          r = pw.row - wi;
          c = pw.col + ei;
        } else {
          r = pw.row + ei;
          c = pw.col - wi;
        }

        const result = tryPlaceWord(grid, word, r, c, newDir, gridSize, false);
        if (result) {
          const score = result.intersections * 100 - result.centerDist * 2;
          if (score > bestScore) {
            bestScore = score;
            best = result;
          }
        }
      }
    }
  }

  return best;
}

function placeWordOnGrid(
  grid: Cell[][],
  word: string,
  row: number,
  col: number,
  direction: Direction,
  wordId: string,
): void {
  const dr = direction === 'down' ? 1 : 0;
  const dc = direction === 'across' ? 1 : 0;

  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    grid[r][c].letter = word[i];
    grid[r][c].state = 'letter';
    if (!grid[r][c].wordIds.includes(wordId)) {
      grid[r][c].wordIds.push(wordId);
    }
  }
}

function assignClueNumbers(words: PlacedWord[]): void {
  const starts = new Map<string, number>();

  const uniqueStarts: { row: number; col: number }[] = [];
  for (const pw of words) {
    const key = `${pw.row},${pw.col}`;
    if (!starts.has(key)) {
      uniqueStarts.push({ row: pw.row, col: pw.col });
    }
  }

  uniqueStarts.sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col);

  for (let i = 0; i < uniqueStarts.length; i++) {
    starts.set(`${uniqueStarts[i].row},${uniqueStarts[i].col}`, i + 1);
  }

  for (const pw of words) {
    const key = `${pw.row},${pw.col}`;
    pw.number = starts.get(key) ?? 0;
  }
}

function generateCrosswordInternal(
  mode: GridMode,
  rng: () => number,
  dateSeed: string,
): { grid: Cell[][]; words: PlacedWord[] } {
  const config = GRID_CONFIGS[mode];
  const gridSize = config.size;
  const targetWords = config.words;

  const allWords = shuffleWithRng([...WB], rng);
  const maxLen = gridSize - 1;
  const candidates = allWords
    .filter(e => e[0].length >= 3 && e[0].length <= maxLen)
    .map(e => e[0]);

  const usedSet = new Set<string>();
  const selected: string[] = [];
  for (const w of candidates) {
    if (selected.length >= targetWords * 3) break;
    const upper = w.toUpperCase();
    if (!usedSet.has(upper)) {
      usedSet.add(upper);
      selected.push(upper);
    }
  }

  selected.sort((a, b) => b.length - a.length);

  const grid = createEmptyGrid(gridSize);
  const placed: PlacedWord[] = [];

  if (selected.length === 0) return { grid, words: placed };

  const firstWord = selected[0];
  const startCol = Math.floor((gridSize - firstWord.length) / 2);
  const centerRow = Math.floor(gridSize / 2);
  const firstId = generateWordId();

  placeWordOnGrid(grid, firstWord, centerRow, startCol, 'across', firstId);
  placed.push({
    id: firstId,
    word: firstWord,
    row: centerRow,
    col: startCol,
    direction: 'across',
    clue: getClueForWord(firstWord),
    category: getCategoryForWord(firstWord),
    number: 0,
    solved: false,
    lettersCorrect: 0,
    lettersTotal: firstWord.length,
  });

  for (let i = 1; i < selected.length; i++) {
    if (placed.length >= targetWords) break;

    const word = selected[i];
    const placement = findBestPlacement(grid, word, placed, gridSize);

    if (placement) {
      const wid = generateWordId();
      placeWordOnGrid(grid, word, placement.row, placement.col, placement.direction, wid);
      placed.push({
        id: wid,
        word,
        row: placement.row,
        col: placement.col,
        direction: placement.direction,
        clue: getClueForWord(word),
        category: getCategoryForWord(word),
        number: 0,
        solved: false,
        lettersCorrect: 0,
        lettersTotal: word.length,
      });
    }
  }

  assignClueNumbers(placed);

  for (const pw of placed) {
    const key = `${pw.row},${pw.col}`;
    const cell = grid[pw.row][pw.col];
    if (cell.number === 0 || pw.number < cell.number || cell.number === 0) {
      cell.number = pw.number;
    }
  }

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c].letter === '') {
        grid[r][c].state = 'black';
      }
    }
  }

  return { grid, words: placed };
}

function countTotalCells(grid: Cell[][]): number {
  let count = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c].letter !== '') count++;
    }
  }
  return count;
}

function checkPuzzleComplete(game: ActiveGame): boolean {
  for (let r = 0; r < game.grid.length; r++) {
    for (let c = 0; c < game.grid[0].length; c++) {
      const cell = game.grid[r][c];
      if (cell.letter !== '' && cell.state !== 'correct' && cell.state !== 'revealed') {
        return false;
      }
    }
  }
  return true;
}

function updateWordSolvedStates(game: ActiveGame): string[] {
  const newlySolved: string[] = [];
  for (const pw of game.words) {
    if (pw.solved) continue;
    const dr = pw.direction === 'down' ? 1 : 0;
    const dc = pw.direction === 'across' ? 1 : 0;
    let allCorrect = true;
    let correctCount = 0;
    for (let i = 0; i < pw.word.length; i++) {
      const r = pw.row + dr * i;
      const c = pw.col + dc * i;
      const cell = game.grid[r][c];
      if (cell.state === 'correct' || cell.state === 'revealed') {
        correctCount++;
      } else {
        allCorrect = false;
      }
    }
    pw.lettersCorrect = correctCount;
    if (allCorrect) {
      pw.solved = true;
      newlySolved.push(pw.word);
    }
  }
  return newlySolved;
}

function calculateFinalScore(game: ActiveGame): number {
  const config = GRID_CONFIGS[game.mode];
  let score = game.score;

  const timeRatio = game.timerRemaining / config.timer;
  score += Math.round(timeRatio * 500);

  const total = game.correctAnswers + game.wrongAnswers;
  const accuracy = total > 0 ? game.correctAnswers / total : 1;
  if (accuracy >= 1.0) score = Math.round(score * 2);

  return score;
}

// ── State Management ─────────────────────────────────────────────────────────

function createDefaultState(): CwState {
  return {
    activeGame: null,
    stats: {
      puzzlesCompleted: 0,
      totalWordsSolved: 0,
      bestTime: 0,
      totalTimePlayed: 0,
      currentStreak: 0,
      dailyStreak: 0,
      lastCompletedDate: '',
      perfectPuzzles: 0,
      hintFreePuzzles: 0,
      totalWrongAnswers: 0,
      totalCorrectAnswers: 0,
    },
    achievements: ACHIEVEMENT_DEFS.map(([id, name, description, icon]) => ({
      id, name, description, icon,
      unlocked: false,
      unlockedDate: null,
    })),
    completedPuzzles: [],
    dailyCompletedDates: [],
  };
}

function ensureInit(): CwState {
  if (!cwState) {
    cwState = createDefaultState();
  }
  return cwState;
}

function completeGame(state: CwState): void {
  const game = state.activeGame;
  if (!game) return;

  game.completed = true;
  game.score = calculateFinalScore(game);

  const timeTaken = GRID_CONFIGS[game.mode].timer - game.timerRemaining;
  const wordsSolved = game.words.filter(w => w.solved).length;

  state.stats.puzzlesCompleted++;
  state.stats.totalWordsSolved += wordsSolved;
  state.stats.totalTimePlayed += timeTaken;
  state.stats.totalWrongAnswers += game.wrongAnswers;
  state.stats.totalCorrectAnswers += game.correctAnswers;

  if (state.stats.bestTime === 0 || timeTaken < state.stats.bestTime) {
    state.stats.bestTime = timeTaken;
  }

  if (game.wrongAnswers === 0) {
    state.stats.perfectPuzzles++;
  }
  if (game.hintsUsed === 0) {
    state.stats.hintFreePuzzles++;
  }

  state.completedPuzzles.push(game.id);

  if (game.dateSeed !== '') {
    const today = todaysDateString();
    if (!state.dailyCompletedDates.includes(game.dateSeed)) {
      state.dailyCompletedDates.push(game.dateSeed);
    }
    if (!state.dailyCompletedDates.includes(today)) {
      state.dailyCompletedDates.push(today);
    }
    updateDailyStreak(state);
  }

  cwCheckAchievements();
}

function updateDailyStreak(state: CwState): void {
  const sorted = [...state.dailyCompletedDates].sort().reverse();
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = `${expected.getFullYear()}-${String(expected.getMonth() + 1).padStart(2, '0')}-${String(expected.getDate()).padStart(2, '0')}`;
    if (sorted.includes(expectedStr)) {
      streak++;
    } else {
      break;
    }
  }

  state.stats.dailyStreak = streak;
  state.stats.currentStreak = streak;
}

// ── Exported State Functions ─────────────────────────────────────────────────

export function cwInit(): void {
  ensureInit();
}

export function cwGetState(): CwState {
  return ensureInit();
}

export function cwResetState(): void {
  cwState = createDefaultState();
}

// ── Exported Puzzle Functions ────────────────────────────────────────────────

export function cwGeneratePuzzle(mode: GridMode = 'small'): ActiveGame {
  const state = ensureInit();
  const rng = basicRandom();
  const dateSeed = '';

  const { grid, words } = generateCrosswordInternal(mode, rng, dateSeed);
  const totalCells = countTotalCells(grid);
  const config = GRID_CONFIGS[mode];

  const game: ActiveGame = {
    id: generatePuzzleId(),
    grid,
    words,
    mode,
    gridSize: config.size,
    timerTotal: config.timer,
    timerRemaining: config.timer,
    score: 0,
    combo: 0,
    maxCombo: 0,
    hintsRemaining: config.hints,
    wrongAnswers: 0,
    correctAnswers: 0,
    totalCells,
    completedCells: 0,
    completed: false,
    dateSeed,
    wordsSolvedCount: 0,
    hintsUsed: 0,
    startTime: Date.now(),
  };

  state.activeGame = game;
  return game;
}

export function cwGetPuzzleGrid(): (CellState | string)[][] {
  const state = ensureInit();
  const game = state.activeGame;
  if (!game) return [];

  return game.grid.map(row =>
    row.map(cell => {
      if (cell.state === 'black' || cell.state === 'empty') return 'black';
      if (cell.state === 'revealed') return cell.letter;
      if (cell.state === 'correct') return cell.playerLetter || cell.letter;
      if (cell.state === 'wrong') return cell.playerLetter || '?';
      return '';
    })
  );
}

export function cwGetClue(wordId: string): { clue: string; direction: Direction; number: number; word: string } | null {
  const state = ensureInit();
  const game = state.activeGame;
  if (!game) return null;

  const pw = game.words.find(w => w.id === wordId);
  if (!pw) return null;

  return {
    clue: pw.clue,
    direction: pw.direction,
    number: pw.number,
    word: pw.word,
  };
}

export function cwGetCluesByDirection(direction: Direction): Array<{ number: number; clue: string; word: string; solved: boolean }> {
  const state = ensureInit();
  const game = state.activeGame;
  if (!game) return [];

  return game.words
    .filter(w => w.direction === direction)
    .sort((a, b) => a.number - b.number)
    .map(w => ({ number: w.number, clue: w.clue, word: w.word, solved: w.solved }));
}

export function cwCheckCell(row: number, col: number, letter: string): CheckResult {
  const state = ensureInit();
  const game = state.activeGame;

  if (!game) {
    return { success: false, correct: false, state: 'empty', combo: 0, score: 0, message: 'No active game', wordSolved: false, puzzleComplete: false, finalScore: 0 };
  }
  if (game.completed) {
    return { success: false, correct: false, state: 'empty', combo: 0, score: 0, message: 'Puzzle already completed', wordSolved: false, puzzleComplete: false, finalScore: 0 };
  }
  if (row < 0 || row >= game.gridSize || col < 0 || col >= game.gridSize) {
    return { success: false, correct: false, state: 'empty', combo: 0, score: 0, message: 'Invalid cell position', wordSolved: false, puzzleComplete: false, finalScore: 0 };
  }

  const cell = game.grid[row][col];
  if (cell.state === 'black' || cell.state === 'empty') {
    return { success: false, correct: false, state: cell.state, combo: 0, score: 0, message: 'Cannot enter a letter here', wordSolved: false, puzzleComplete: false, finalScore: 0 };
  }
  if (cell.state === 'correct' || cell.state === 'revealed') {
    return { success: false, correct: true, state: cell.state, combo: game.combo, score: game.score, message: 'Cell already solved', wordSolved: false, puzzleComplete: false, finalScore: 0 };
  }

  const input = letter.toUpperCase().charAt(0);
  const expected = cell.letter;
  let isCorrect: boolean;

  if (input === expected) {
    cell.state = 'correct';
    cell.playerLetter = input;
    isCorrect = true;
    game.combo++;
    game.correctAnswers++;
    if (game.combo > game.maxCombo) game.maxCombo = game.combo;
    const basePoints = 10;
    const comboBonus = Math.min(game.combo - 1, 20) * 5;
    game.score += basePoints + comboBonus;
  } else {
    cell.state = 'wrong';
    cell.playerLetter = input;
    isCorrect = false;
    game.combo = 0;
    game.wrongAnswers++;
  }

  const newlySolved = updateWordSolvedStates(game);

  let completedCells = 0;
  for (let r = 0; r < game.gridSize; r++) {
    for (let c = 0; c < game.gridSize; c++) {
      const gc = game.grid[r][c];
      if (gc.state === 'correct' || gc.state === 'revealed') completedCells++;
    }
  }
  game.completedCells = completedCells;
  game.wordsSolvedCount = game.words.filter(w => w.solved).length;

  let puzzleComplete = false;
  let finalScore = 0;
  let solvedWord: string | undefined;

  if (newlySolved.length > 0) {
    solvedWord = newlySolved[newlySolved.length - 1];
  }

  if (checkPuzzleComplete(game)) {
    puzzleComplete = true;
    finalScore = calculateFinalScore(game);
    completeGame(state);
  }

  return {
    success: true,
    correct: isCorrect,
    state: cell.state,
    combo: game.combo,
    score: game.score,
    message: isCorrect ? 'Correct!' : 'Wrong answer!',
    wordSolved: newlySolved.length > 0,
    solvedWord,
    puzzleComplete,
    finalScore,
  };
}

export function cwRevealHint(): HintResult {
  const state = ensureInit();
  const game = state.activeGame;

  if (!game) return { success: false, row: 0, col: 0, letter: '', hintsRemaining: 0, message: 'No active game' };
  if (game.completed) return { success: false, row: 0, col: 0, letter: '', hintsRemaining: 0, message: 'Puzzle already completed' };
  if (game.hintsRemaining <= 0) return { success: false, row: 0, col: 0, letter: '', hintsRemaining: 0, message: 'No hints remaining' };

  const candidates: [number, number][] = [];
  for (let r = 0; r < game.gridSize; r++) {
    for (let c = 0; c < game.gridSize; c++) {
      const cell = game.grid[r][c];
      if (cell.letter !== '' && cell.state === 'letter') {
        candidates.push([r, c]);
      }
    }
  }

  if (candidates.length === 0) return { success: false, row: 0, col: 0, letter: '', hintsRemaining: game.hintsRemaining, message: 'No cells to reveal' };

  const idx = Math.floor(Math.random() * candidates.length);
  const [r, c] = candidates[idx];
  game.grid[r][c].state = 'revealed';
  game.grid[r][c].playerLetter = game.grid[r][c].letter;
  game.hintsRemaining--;
  game.hintsUsed++;

  let completedCells = 0;
  for (let row = 0; row < game.gridSize; row++) {
    for (let col = 0; col < game.gridSize; col++) {
      const gc = game.grid[row][col];
      if (gc.state === 'correct' || gc.state === 'revealed') completedCells++;
    }
  }
  game.completedCells = completedCells;
  game.wordsSolvedCount = game.words.filter(w => w.solved).length;

  const newlySolved = updateWordSolvedStates(game);

  let puzzleComplete = false;
  if (checkPuzzleComplete(game)) {
    puzzleComplete = true;
    completeGame(state);
  }

  return {
    success: true,
    row: r,
    col: c,
    letter: game.grid[r][c].letter,
    hintsRemaining: game.hintsRemaining,
    message: puzzleComplete
      ? `Revealed "${game.grid[r][c].letter}" at (${r},${c}). Puzzle complete!`
      : `Revealed "${game.grid[r][c].letter}" at (${r},${c}). ${newlySolved.length > 0 ? `Word "${newlySolved[0]}" solved!` : ''}`,
  };
}

export function cwGetActiveGame(): ActiveGame | null {
  return ensureInit().activeGame;
}

export function cwGetProgress(): { solved: number; total: number; percent: number; wordsCompleted: number; wordsTotal: number } {
  const state = ensureInit();
  const game = state.activeGame;
  if (!game) return { solved: 0, total: 0, percent: 0, wordsCompleted: 0, wordsTotal: 0 };

  const wordsCompleted = game.words.filter(w => w.solved).length;
  const wordsTotal = game.words.length;
  const percent = game.totalCells > 0 ? Math.round((game.completedCells / game.totalCells) * 100) : 0;

  return {
    solved: game.completedCells,
    total: game.totalCells,
    percent,
    wordsCompleted,
    wordsTotal,
  };
}

export function cwUpdateTimer(secondsElapsed: number): { remaining: number; expired: boolean } {
  const state = ensureInit();
  const game = state.activeGame;
  if (!game || game.completed) return { remaining: 0, expired: false };

  game.timerRemaining = Math.max(0, game.timerRemaining - secondsElapsed);

  if (game.timerRemaining <= 0) {
    game.completed = true;
    const wordsSolved = game.words.filter(w => w.solved).length;
    state.stats.puzzlesCompleted++;
    state.stats.totalWordsSolved += wordsSolved;
    state.stats.totalTimePlayed += game.timerTotal;
    state.stats.totalWrongAnswers += game.wrongAnswers;
    state.stats.totalCorrectAnswers += game.correctAnswers;
    state.completedPuzzles.push(game.id);
    if (game.dateSeed !== '') {
      if (!state.dailyCompletedDates.includes(game.dateSeed)) {
        state.dailyCompletedDates.push(game.dateSeed);
      }
      updateDailyStreak(state);
    }
    cwCheckAchievements();
    return { remaining: 0, expired: true };
  }

  return { remaining: game.timerRemaining, expired: false };
}

// ── Exported Stats Functions ─────────────────────────────────────────────────

export function cwGetStatsGrid(): UIField[] {
  const state = ensureInit();
  const s = state.stats;
  const accuracy = (s.totalCorrectAnswers + s.totalWrongAnswers) > 0
    ? Math.round((s.totalCorrectAnswers / (s.totalCorrectAnswers + s.totalWrongAnswers)) * 100)
    : 0;

  return [
    { label: 'Puzzles Completed', value: String(s.puzzlesCompleted), color: '#10b981' },
    { label: 'Words Solved', value: String(s.totalWordsSolved), color: '#3b82f6' },
    { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 90 ? '#10b981' : accuracy >= 70 ? '#f59e0b' : '#ef4444' },
    { label: 'Best Time', value: s.bestTime > 0 ? `${Math.floor(s.bestTime / 60)}m ${s.bestTime % 60}s` : '--', color: '#8b5cf6' },
    { label: 'Current Streak', value: `${s.currentStreak} days`, color: '#f97316' },
    { label: 'Total Time Played', value: `${Math.floor(s.totalTimePlayed / 60)}m`, color: '#06b6d4' },
    { label: 'Perfect Puzzles', value: String(s.perfectPuzzles), color: '#eab308' },
    { label: 'Hint-Free Puzzles', value: String(s.hintFreePuzzles), color: '#ec4899' },
  ];
}

export function cwGetAccuracy(): number {
  const state = ensureInit();
  const s = state.stats;
  const total = s.totalCorrectAnswers + s.totalWrongAnswers;
  return total > 0 ? Math.round((s.totalCorrectAnswers / total) * 100) : 0;
}

export function cwGetCurrentStreak(): number {
  return ensureInit().stats.currentStreak;
}

export function cwGetBestTime(): number {
  return ensureInit().stats.bestTime;
}

export function cwGetWordsFound(): number {
  return ensureInit().stats.totalWordsSolved;
}

// ── Exported Daily Functions ─────────────────────────────────────────────────

export function cwGetDailyPuzzle(): ActiveGame {
  const state = ensureInit();
  const today = todaysDateString();
  const rng = seededRandom(today);

  const { grid, words } = generateCrosswordInternal('medium', rng, today);
  const totalCells = countTotalCells(grid);
  const config = GRID_CONFIGS.medium;

  const game: ActiveGame = {
    id: `daily_${today}`,
    grid,
    words,
    mode: 'medium',
    gridSize: config.size,
    timerTotal: config.timer,
    timerRemaining: config.timer,
    score: 0,
    combo: 0,
    maxCombo: 0,
    hintsRemaining: config.hints,
    wrongAnswers: 0,
    correctAnswers: 0,
    totalCells,
    completedCells: 0,
    completed: false,
    dateSeed: today,
    wordsSolvedCount: 0,
    hintsUsed: 0,
    startTime: Date.now(),
  };

  state.activeGame = game;
  return game;
}

export function cwIsDailyCompleted(date?: string): boolean {
  const state = ensureInit();
  const target = date || todaysDateString();
  return state.dailyCompletedDates.includes(target);
}

export function cwGetDailyStreak(): number {
  return ensureInit().stats.dailyStreak;
}

// ── Exported Achievement Functions ───────────────────────────────────────────

export function cwGetAchievements(): Achievement[] {
  return ensureInit().achievements;
}

export function cwCheckAchievements(): Achievement[] {
  const state = ensureInit();
  const s = state.stats;
  const game = state.activeGame;
  const newlyUnlocked: Achievement[] = [];

  const check = (id: string, condition: boolean): void => {
    const ach = state.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked && condition) {
      ach.unlocked = true;
      ach.unlockedDate = todaysDateString();
      newlyUnlocked.push(ach);
    }
  };

  check('first_solve', s.puzzlesCompleted >= 1);
  check('speed_demon', s.bestTime > 0 && s.bestTime <= 120);
  check('perfect_puzzle', s.perfectPuzzles >= 1);
  check('streak_7', s.dailyStreak >= 7);
  check('streak_30', s.dailyStreak >= 30);
  check('word_hunter', s.totalWordsSolved >= 100);
  check('cw_master', s.puzzlesCompleted >= 50);
  check('hint_free', s.hintFreePuzzles >= 1);
  check('lightning', s.bestTime > 0 && s.bestTime <= 60);
  check('daily_devotee', state.dailyCompletedDates.length >= 10);
  check('large_boss', state.completedPuzzles.length > 0 &&
    (() => { const last = state.completedPuzzles[state.completedPuzzles.length - 1]; return true; })());
  check('combo_king', game ? game.maxCombo >= 15 : false);
  check('accuracy_ace', s.perfectPuzzles >= 10);
  check('marathon', s.totalTimePlayed >= 3600);

  const othersUnlocked = state.achievements.filter(a => a.id !== 'completionist' && a.unlocked).length;
  check('completionist', othersUnlocked >= 14);

  return newlyUnlocked;
}

// ── Exported UI Helper Functions ─────────────────────────────────────────────

export function cwGetOverview(): UICard {
  const state = ensureInit();
  const game = state.activeGame;
  const s = state.stats;
  const totalAch = state.achievements.filter(a => a.unlocked).length;
  const accuracy = (s.totalCorrectAnswers + s.totalWrongAnswers) > 0
    ? Math.round((s.totalCorrectAnswers / (s.totalCorrectAnswers + s.totalWrongAnswers)) * 100)
    : 0;

  return {
    title: 'Crossword Puzzle',
    icon: '📝',
    fields: [
      { label: 'Status', value: game ? (game.completed ? 'Completed' : 'In Progress') : 'No Active Game', color: game ? (game.completed ? '#10b981' : '#3b82f6') : '#6b7280' },
      { label: 'Puzzles Completed', value: String(s.puzzlesCompleted), color: '#10b981' },
      { label: 'Words Solved', value: String(s.totalWordsSolved), color: '#3b82f6' },
      { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 90 ? '#10b981' : '#f59e0b' },
      { label: 'Streak', value: `${s.currentStreak} days`, color: s.currentStreak > 0 ? '#f97316' : '#6b7280' },
      { label: 'Achievements', value: `${totalAch}/${ACHIEVEMENT_DEFS.length}`, color: totalAch > 10 ? '#eab308' : '#6b7280' },
    ],
    items: [],
    color: '#3b82f6',
  };
}

export function cwGetStatsCard(): UICard {
  const state = ensureInit();
  const s = state.stats;
  const accuracy = (s.totalCorrectAnswers + s.totalWrongAnswers) > 0
    ? Math.round((s.totalCorrectAnswers / (s.totalCorrectAnswers + s.totalWrongAnswers)) * 100)
    : 0;
  const avgTime = s.puzzlesCompleted > 0 ? Math.round(s.totalTimePlayed / s.puzzlesCompleted) : 0;

  return {
    title: 'Crossword Statistics',
    icon: '📊',
    fields: [
      { label: 'Total Puzzles', value: String(s.puzzlesCompleted), color: '#10b981' },
      { label: 'Words Solved', value: String(s.totalWordsSolved), color: '#3b82f6' },
      { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 90 ? '#10b981' : accuracy >= 70 ? '#f59e0b' : '#ef4444' },
      { label: 'Best Time', value: s.bestTime > 0 ? formatTime(s.bestTime) : '--', color: '#8b5cf6' },
      { label: 'Avg Time', value: avgTime > 0 ? formatTime(avgTime) : '--', color: '#06b6d4' },
      { label: 'Current Streak', value: `${s.currentStreak} days`, color: '#f97316' },
      { label: 'Perfect Puzzles', value: String(s.perfectPuzzles), color: '#eab308' },
      { label: 'Hint-Free Puzzles', value: String(s.hintFreePuzzles), color: '#ec4899' },
      { label: 'Total Time', value: `${Math.floor(s.totalTimePlayed / 60)}m ${s.totalTimePlayed % 60}s`, color: '#14b8a6' },
      { label: 'Total Correct', value: String(s.totalCorrectAnswers), color: '#22c55e' },
      { label: 'Total Wrong', value: String(s.totalWrongAnswers), color: '#ef4444' },
      { label: 'Completion Rate', value: s.totalWordsSolved > 0 ? `${Math.round(s.totalWordsSolved / (s.totalWordsSolved + s.totalWrongAnswers) * 100)}%` : '0%', color: '#6366f1' },
    ],
    items: [],
    color: '#10b981',
  };
}

export function cwGetClueCard(direction: Direction | null): UICard {
  const state = ensureInit();
  const game = state.activeGame;

  if (!game) {
    return { title: 'Clues', icon: '💡', fields: [{ label: 'Message', value: 'Start a game to see clues', color: '#6b7280' }], items: [], color: '#6b7280' };
  }

  const dir = direction || 'across';
  const clues = cwGetCluesByDirection(dir);

  return {
    title: `${dir === 'across' ? 'Across' : 'Down'} Clues`,
    icon: dir === 'across' ? '↔️' : '↕️',
    fields: [],
    items: clues.map(c => ({
      label: `${c.number}. ${c.clue}`,
      value: c.solved ? '✅' : '',
      color: c.solved ? '#10b981' : '#d1d5db',
    })),
    color: dir === 'across' ? '#3b82f6' : '#8b5cf6',
  };
}

export function cwGetAchievementGrid(): UICard {
  const state = ensureInit();
  const achievements = state.achievements;
  const unlocked = achievements.filter(a => a.unlocked).length;

  return {
    title: `Achievements (${unlocked}/${achievements.length})`,
    icon: '🏆',
    fields: [
      { label: 'Unlocked', value: `${unlocked} of ${achievements.length}`, color: unlocked > 10 ? '#10b981' : '#6b7280' },
      { label: 'Locked', value: String(achievements.length - unlocked), color: '#ef4444' },
    ],
    items: achievements.map(a => ({
      label: a.unlocked ? `${a.icon} ${a.name}` : `🔒 ${a.name}`,
      value: a.unlocked ? (a.unlockedDate ?? 'Unlocked') : a.description,
      color: a.unlocked ? '#10b981' : '#9ca3af',
    })),
    color: '#eab308',
  };
}

export function cwGetDailyCard(): UICard {
  const state = ensureInit();
  const today = todaysDateString();
  const completed = cwIsDailyCompleted(today);
  const streak = state.stats.dailyStreak;
  const totalDailies = state.dailyCompletedDates.length;

  return {
    title: `Daily Puzzle — ${today}`,
    icon: '📅',
    fields: [
      { label: 'Status', value: completed ? '✅ Completed' : '🔲 Not Started', color: completed ? '#10b981' : '#f59e0b' },
      { label: 'Current Streak', value: `${streak} days`, color: streak >= 7 ? '#f97316' : '#6b7280' },
      { label: 'Total Dailies', value: String(totalDailies), color: '#3b82f6' },
      { label: 'Next Milestone', value: streak < 7 ? '7-day streak' : streak < 30 ? '30-day streak' : 'Max streak!', color: '#8b5cf6' },
    ],
    items: [],
    color: completed ? '#10b981' : '#f59e0b',
  };
}

export function cwGetGameCard(): UICard {
  const state = ensureInit();
  const game = state.activeGame;

  if (!game) {
    return { title: 'No Active Game', icon: '📝', fields: [{ label: 'Action', value: 'Generate a puzzle to begin', color: '#6b7280' }], items: [], color: '#6b7280' };
  }

  const progress = cwGetProgress();
  const timerStr = formatTime(game.timerRemaining);
  const accuracy = (game.correctAnswers + game.wrongAnswers) > 0
    ? Math.round((game.correctAnswers / (game.correctAnswers + game.wrongAnswers)) * 100)
    : 100;

  return {
    title: `${game.mode.charAt(0).toUpperCase() + game.mode.slice(1)} Crossword ${game.completed ? '(Complete)' : ''}`,
    icon: game.completed ? '🎉' : '📝',
    fields: [
      { label: 'Mode', value: `${game.gridSize}x${game.gridSize} Grid`, color: '#3b82f6' },
      { label: 'Score', value: String(game.score), color: '#10b981' },
      { label: 'Timer', value: timerStr, color: game.timerRemaining < 60 ? '#ef4444' : '#f59e0b' },
      { label: 'Progress', value: `${progress.percent}% (${progress.solved}/${progress.total})`, color: '#8b5cf6' },
      { label: 'Words', value: `${progress.wordsCompleted}/${progress.wordsTotal}`, color: '#06b6d4' },
      { label: 'Combo', value: `x${game.combo}`, color: game.combo >= 10 ? '#f97316' : '#6b7280' },
      { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 90 ? '#10b981' : accuracy >= 70 ? '#f59e0b' : '#ef4444' },
      { label: 'Hints Left', value: String(game.hintsRemaining), color: game.hintsRemaining > 0 ? '#3b82f6' : '#ef4444' },
      { label: 'Max Combo', value: `x${game.maxCombo}`, color: '#ec4899' },
    ],
    items: [],
    color: game.completed ? '#10b981' : '#3b82f6',
  };
}

export function cwGetCellInfo(row: number, col: number): {
  letter: string;
  state: CellState;
  number: number;
  playerLetter: string;
  isPlayable: boolean;
  wordIds: string[];
  clues: Array<{ number: number; direction: Direction; clue: string; word: string }>;
} | null {
  const state = ensureInit();
  const game = state.activeGame;
  if (!game) return null;
  if (row < 0 || row >= game.gridSize || col < 0 || col >= game.gridSize) return null;

  const cell = game.grid[row][col];
  const clues = cell.wordIds.map(wid => {
    const pw = game.words.find(w => w.id === wid);
    if (!pw) return null;
    return { number: pw.number, direction: pw.direction, clue: pw.clue, word: pw.word };
  }).filter(Boolean) as Array<{ number: number; direction: Direction; clue: string; word: string }>;

  return {
    letter: cell.letter,
    state: cell.state,
    number: cell.number,
    playerLetter: cell.playerLetter,
    isPlayable: cell.letter !== '' && cell.state !== 'correct' && cell.state !== 'revealed' && cell.state !== 'black',
    wordIds: cell.wordIds,
    clues,
  };
}

export function cwGetWordsByCategory(cat: Category): string[] {
  return getWordsByCategory(cat);
}

export function cwGetCategories(): Array<{ name: Category; icon: string; count: number }> {
  return CATEGORIES.map(c => ({
    name: c,
    icon: CATEGORY_ICONS[c],
    count: getWordsByCategory(c).length,
  }));
}

export function cwGetWordBankSize(): number {
  return WB.length;
}

export function cwGetGridConfig(mode: GridMode): { size: number; words: number; timer: number; hints: number } {
  return { ...GRID_CONFIGS[mode] };
}

export function cwIsPuzzleComplete(): boolean {
  const state = ensureInit();
  return state.activeGame?.completed ?? false;
}

export function cwGetScoreBreakdown(): { base: number; timeBonus: number; accuracyMultiplier: number; final: number } | null {
  const state = ensureInit();
  const game = state.activeGame;
  if (!game) return null;

  const config = GRID_CONFIGS[game.mode];
  const timeRatio = game.timerRemaining / config.timer;
  const timeBonus = Math.round(timeRatio * 500);
  const total = game.correctAnswers + game.wrongAnswers;
  const accuracy = total > 0 ? game.correctAnswers / total : 1;
  const accuracyMultiplier = accuracy >= 1.0 ? 2 : 1;

  return {
    base: game.score,
    timeBonus,
    accuracyMultiplier,
    final: (game.score + timeBonus) * accuracyMultiplier,
  };
}

export function cwGetWordProgress(wordId: string): { word: string; solved: boolean; correct: number; total: number; percent: number } | null {
  const state = ensureInit();
  const game = state.activeGame;
  if (!game) return null;

  const pw = game.words.find(w => w.id === wordId);
  if (!pw) return null;

  return {
    word: pw.word,
    solved: pw.solved,
    correct: pw.lettersCorrect,
    total: pw.lettersTotal,
    percent: pw.lettersTotal > 0 ? Math.round((pw.lettersCorrect / pw.lettersTotal) * 100) : 0,
  };
}

export function cwGetAllWordsProgress(): Array<{ word: string; direction: Direction; number: number; solved: boolean; correct: number; total: number; percent: number }> {
  const state = ensureInit();
  const game = state.activeGame;
  if (!game) return [];

  return game.words.map(pw => ({
    word: pw.word,
    direction: pw.direction,
    number: pw.number,
    solved: pw.solved,
    correct: pw.lettersCorrect,
    total: pw.lettersTotal,
    percent: pw.lettersTotal > 0 ? Math.round((pw.lettersCorrect / pw.lettersTotal) * 100) : 0,
  })).sort((a, b) => {
    if (a.direction !== b.direction) return a.direction === 'across' ? -1 : 1;
    return a.number - b.number;
  });
}

export function cwGetHintCandidates(): Array<{ row: number; col: number; letter: string }> {
  const state = ensureInit();
  const game = state.activeGame;
  if (!game) return [];

  const candidates: Array<{ row: number; col: number; letter: string }> = [];
  for (let r = 0; r < game.gridSize; r++) {
    for (let c = 0; c < game.gridSize; c++) {
      const cell = game.grid[r][c];
      if (cell.letter !== '' && cell.state === 'letter') {
        candidates.push({ row: r, col: c, letter: cell.letter });
      }
    }
  }
  return candidates;
}

// ── Helper: Format Time ─────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
