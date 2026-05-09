// =============================================================================
// Crossword Master Wire — Word Snake Game Module
// =============================================================================
// SSR-safe crossword engine: generation, scoring, stats, hints, daily challenge.
// All functions use the `cm` prefix.  No browser globals.
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CmPuzzleSize = 'mini' | 'small' | 'medium' | 'large' | 'expert';
export type CmDirection = 'across' | 'down';
export type CmDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type CmClueCategory =
  | 'definition'
  | 'synonym'
  | 'antonym'
  | 'fill_blank'
  | 'trivia'
  | 'word_play';
export type CmGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface CmCell {
  letter: string;
  isBlack: boolean;
  number: number | null;
  revealed: boolean;
  correct: boolean;
  userLetter: string | null;
}

export interface CmClue {
  number: number;
  direction: CmDirection;
  clue: string;
  answer: string;
  row: number;
  col: number;
  length: number;
  difficulty: CmDifficulty;
  category: CmClueCategory;
}

export interface CmPlacedWord {
  word: string;
  row: number;
  col: number;
  direction: CmDirection;
  clueIndex: number;
}

export interface CmPuzzle {
  id: string;
  size: CmPuzzleSize;
  rows: number;
  cols: number;
  grid: CmCell[][];
  clues: CmClue[];
  placedWords: CmPlacedWord[];
  difficulty: CmDifficulty;
  createdAt: number;
  completedAt: number | null;
  hintsUsed: number;
  maxHints: number;
  score: number;
  grade: CmGrade | null;
  timeElapsed: number;
  startTime: number | null;
}

export interface CmStats {
  totalSolved: number;
  totalWordsFound: number;
  totalLettersPlaced: number;
  bestTimes: Record<CmPuzzleSize, number | null>;
  accuracy: number;
  totalHintsUsed: number;
  currentStreak: number;
  bestStreak: number;
  lastDailyDate: string | null;
  grades: Record<CmGrade, number>;
  puzzlesBySize: Record<CmPuzzleSize, number>;
}

export interface CmAchievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt: number | null;
  progress: number;
  target: number;
}

export interface CmSavedPuzzle {
  id: string;
  puzzle: CmPuzzle;
  savedAt: number;
  label: string;
}

export interface CmOverview {
  totalPuzzles: number;
  todayCompleted: boolean;
  currentStreak: number;
  bestStreak: number;
  averageGrade: string;
  totalScore: number;
  recentActivity: { date: string; puzzles: number; score: number }[];
}

export interface CmDashboard {
  stats: CmStats;
  activePuzzle: CmPuzzle | null;
  savedPuzzles: CmSavedPuzzle[];
  achievements: CmAchievement[];
  dailyAvailable: boolean;
}

export interface CmState {
  activePuzzle: CmPuzzle | null;
  stats: CmStats;
  achievements: CmAchievement[];
  savedPuzzles: CmSavedPuzzle[];
  dailyCompletedDate: string | null;
  initializedAt: number;
  completedPuzzleScores: number[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PUZZLE_SIZES: Record<CmPuzzleSize, { rows: number; cols: number }> = {
  mini: { rows: 5, cols: 5 },
  small: { rows: 7, cols: 7 },
  medium: { rows: 10, cols: 10 },
  large: { rows: 13, cols: 13 },
  expert: { rows: 15, cols: 15 },
};

const WORDS_PER_DIFFICULTY: Record<CmDifficulty, number[]> = {
  easy: [3, 4, 5],
  medium: [4, 5, 6, 7],
  hard: [5, 6, 7, 8, 9],
  expert: [6, 7, 8, 9, 10, 11, 12],
};

const MAX_HINTS_BY_SIZE: Record<CmPuzzleSize, number> = {
  mini: 5,
  small: 8,
  medium: 12,
  large: 18,
  expert: 25,
};

const MAX_SAVED_PUZZLES = 5;

const LETTERS_PER_SECOND_BONUS = 60;
const STREAK_BONUS_MULTIPLIER = 50;

// ---------------------------------------------------------------------------
// Word Bank (350 words, 3-12 letters)
// ---------------------------------------------------------------------------

const WORD_BANK: string[] = [
  // 3-letter
  'ACE','ADD','AGE','AID','AIM','AIR','ALE','ALL','AND','ANT','ANY','APE','ARC','ARE','ARK',
  'ARM','ART','ASH','ATE','AWE','AXE','BAD','BAG','BAN','BAR','BAT','BAY','BED','BET','BIG',
  'BIT','BOW','BOX','BOY','BUD','BUG','BUN','BUS','BUT','BUY','CAB','CAN','CAP','CAR','CAT',
  'COP','COT','COW','CRY','CUB','CUD','CUP','CUR','CUT','DAB','DAD','DAM','DAY','DEN','DEW',
  'DID','DIG','DIM','DIP','DOC','DOE','DOG','DOT','DRY','DUB','DUD','DUE','DUG','DUN','DUO',
  'DYE','EAR','EAT','EEL','EGG','ELF','ELK','ELM','EMU','END','ERA','EVE','EWE','EYE','FAN',
  'FAR','FAT','FAX','FED','FEW','FIG','FIN','FIR','FIT','FIX','FLY','FOB','FOE','FOG','FOP',
  'FOR','FOX','FRY','FUN','FUR','GAB','GAG','GAP','GAS','GAY','GEL','GEM','GET','GIG','GIN',
  'GNU','GOB','GOD','GOT','GUM','GUN','GUT','GUY','GYM','HAD','HAM','HAS','HAT','HAY','HEN',
  'HER','HEW','HID','HIM','HIP','HIS','HIT','HOB','HOG','HOP','HOT','HOW','HUB','HUE','HUG',
  'HUM','HUT','ICE','ICY','ILL','IMP','INK','INN','ION','IRE','IRK','ITS','IVY','JAB','JAG',
  'JAM','JAR','JAW','JAY','JET','JIG','JOB','JOG','JOT','JOY','JUG','JUT','KEG','KEN','KEY',
  'KID','KIN','KIT','LAB','LAD','LAG','LAP','LAW','LAX','LAY','LED','LEG','LET','LID','LIE',
  'LIP','LIT','LOG','LOT','LOW','LUG','MAD','MAN','MAP','MAR','MAT','MAW','MAX','MAY','MEN',
  // 4-letter
  'ABLE','ALSO','AREA','ARMY','AWAY','BABY','BACK','BALL','BAND','BANK','BASE','BATH','BEAM',
  'BEAR','BEAT','BEEN','BELL','BELT','BEND','BEST','BIKE','BILL','BIRD','BITE','BLOW','BLUE',
  'BOAT','BODY','BOLT','BOMB','BOND','BONE','BOOK','BOOT','BORN','BOSS','BOTH','BOWL','BULK',
  'BURN','BUSY','CAFE','CAGE','CAKE','CALM','CAMP','CARD','CARE','CART','CASE','CASH','CAST',
  'CAVE','CELL','CHAT','CHEF','CHIP','CITY','CLAM','CLAP','CLAY','CLIP','CLUB','CLUE','COAL',
  'COAT','CODE','COIN','COLD','COME','COOK','COOL','COPE','COPY','CORD','CORE','CORN','COST',
  'CREW','CROP','CROW','CUBE','CULT','CURE','CURL','CUTE','DALE','DAME','DAMP','DARE','DARK',
  'DART','DASH','DATA','DATE','DAWN','DEAD','DEAF','DEAL','DEAR','DEBT','DECK','DEED','DEEM',
  'DEEP','DEER','DEMO','DENT','DENY','DESK','DIAL','DICE','DIET','DIME','DIRT','DISC','DISH',
  'DISK','DOCK','DOES','DOLL','DOME','DONE','DOOM','DOOR','DOSE','DOWN','DRAW','DREW','DROP',
  'DRUM','DUAL','DUCK','DUEL','DUKE','DULL','DUMB','DUMP','DUNE','DUSK','DUST','DUTY','EACH',
  'EARN','EASE','EAST','EASY','EDGE','EDIT','ELSE','EMIT','ENVY','EPIC','EVEN','EVER','EVIL',
  'EXAM','EXEC','EXIT','FACE','FACT','FADE','FAIL','FAIR','FAKE','FALL','FAME','FANG','FARE',
  'FARM','FAST','FATE','FEAR','FEAT','FEED','FEEL','FELL','FELT','FERN','FILE','FILL','FILM',
  'FIND','FINE','FIRE','FIRM','FISH','FIST','FLAG','FLAP','FLAT','FLAW','FLEW','FLIP','FLOW',
  'FOAM','FOLD','FOLK','FOND','FONT','FOOD','FOOL','FOOT','FORD','FORE','FORK','FORM','FORT',
  'FOUL','FOUR','FREE','FROM','FUEL','FULL','FUND','FURY','FUSE','GAIN','GALE','GAME','GANG',
  'GATE','GAVE','GAZE','GEAR','GENE','GIFT','GIRL','GIVE','GLAD','GLOW','GLUE','GOAL','GOAT',
  // 5-letter
  'ABOVE','ABUSE','ADMIT','ADOPT','ADULT','AFTER','AGAIN','AGENT','AGREE','AHEAD','ALARM',
  'ALBUM','ALIEN','ALIGN','ALIVE','ALLOW','ALONE','ALTER','AMONG','ANGER','ANGLE','ANGRY',
  'ANIME','APART','APPLE','ARENA','ARGUE','ARISE','ASIDE','ATLAS','AUDIO','AVOID','AWAKE',
  'AWARD','AWARE','BADLY','BASED','BASIC','BEACH','BEGIN','BEING','BELOW','BENCH','BLACK',
  'BLADE','BLAME','BLANK','BLAST','BLEND','BLIND','BLOCK','BLOOD','BLOOM','BOARD','BOOST',
  'BOUND','BRAIN','BRAND','BRAVE','BREAD','BREAK','BREED','BRICK','BRIEF','BRING','BROAD',
  'BROWN','BRUSH','BUILD','BUNCH','BURST','BUYER','CABLE','CARRY','CATCH','CAUSE','CHAIN',
  'CHAIR','CHART','CHASE','CHEAP','CHECK','CHEST','CHIEF','CHILD','CHINA','CLAIM','CLASS',
  'CLEAN','CLEAR','CLIMB','CLOCK','CLONE','CLOSE','CLOUD','COACH','COAST','COLOR','COMET',
  'CORAL','COUNT','COURT','COVER','CRACK','CRAFT','CRANE','CRASH','CRAZY','CREAM','CRIME',
  'CROSS','CROWD','CROWN','CRUEL','CRUSH','CURVE','CYCLE','DAILY','DANCE','DEATH','DELAY',
  'DEPTH','DEVIL','DIRTY','DRAFT','DRAIN','DRAMA','DRAWN','DREAM','DRESS','DRIFT','DRILL',
  'DRINK','DRIVE','EAGER','EARLY','EARTH','EIGHT','ELDER','ELECT','ELITE','EMPTY','ENEMY',
  'ENJOY','ENTER','EQUAL','ERROR','EVENT','EVERY','EXACT','EXIST','EXTRA','FAINT','FAITH',
  // 6-letter
  'ABSORB','ACCEPT','ACCESS','ACTION','ACTIVE','ACTUAL','AFFORD','AGENCY','ALMOST','AMOUNT',
  'ANIMAL','ANNUAL','ANSWER','ANYWAY','APPEAL','APPEAR','ARCHER','AROUND','ARRIVE','ARTIST',
  'ASSERT','ASSESS','ASSIGN','ASSIST','ASSUME','ATTACH','ATTACK','ATTAIN','ATTEND','AUGUST',
  'BEAUTY','BEHIND','BELONG','BESIDE','BETTER','BEYOND','BISHOP','BLANKET','BORDER','BOUGHT',
  'BRANCH','BREATH','BRIDGE','BRIGHT','BRONZE','BUBBLE','BUCKET','BUDGET','BURDEN','BUREAU',
  'BUTTON','CAMPUS','CANCER','CARBON','CAREER','CASTLE','CAUGHT','CENTER','CHANCE','CHANGE',
  'CHARGE','CHOICE','CHOOSE','CHURCH','CIRCLE','CLAUSE','CLIENT','CLOSED','COFFEE','COLONY',
  'COLUMN','COMBAT','COMEDY','COMMIT','COMMON','COMPLY','CONFER','COOKIE','COPPER','CORNER',
  'COSTLY','COTTON','COUNTY','COUPLE','COURSE','COUSIN','CREATE','CREDIT','CRISIS','CUSTOM',
  'DAMAGE','DANGER','DEADLY','DEALER','DEBATE','DECADE','DECIDE','DEEPLY','DEFEAT','DEFEND',
  'DEFINE','DEGREE','DEMAND','DENIAL','DEPART','DEPLOY','DEPUTY','DESERT','DESIGN','DESIRE',
  'DETAIL','DETECT','DEVICE','DEVOTE','DIFFER','DINNER','DIRECT','DIVIDE','DOMAIN','DONATE',
  'DOUBLE','DRIVER','EASILY','EDITOR','EFFECT','EFFORT','EIGHTH','EMERGE','EMPIRE','EMPLOY',
  // 7-letter
  'ABILITY','ACADEMY','ACCOUNT','ACHIEVE','ACQUIRE','ADDRESS','ADVANCE','AGAINST','AIRPORT',
  'ALREADY','ANCIENT','ANOTHER','ANXIETY','ANYTIME','APPLIED','ARRANGE','ARTICLE','ATTEMPT',
  'ATTRACT','BALANCE','BARRIER','BATTERY','BECAUSE','BEDROOM','BELIEVE','BENEATH','BENEFIT',
  'BETWEEN','BISHOPS','BOMBING','BROTHER','CABINET','CALIBER','CAPABLE','CAPITAL','CAPTURE',
  'CARBON','CAREFUL','CARRIER','CENTRAL','CENTURY','CHAMBER','CHANNEL','CHAPTER','CHARITY',
  'CHICKEN','CHURCHY','CIRCUIT','CITIZEN','CLASSIC','CLIMATE','CLOSELY','CLOSING','CLUSTER',
  'COASTAL','COLLECT','COLLEGE','COMBINE','COMFORT','COMMAND','COMMENT','COMPANY','COMPARE',
  'COMPETE','COMPLEX','CONCERN','CONDUCT','CONFIRM','CONNECT','CONTACT','CONTAIN','CONTENT',
  'CONTEXT','CONTROL','CONVERT','COOKING','CORRECT','COUNCIL','COUNTER','COUNTRY','COURAGE',
  'CRADLE','CREATED','CREATOR','CRYSTAL','CURRENT','CURTAIN','CUSTOMS','DAMAGE','DECLINE',
  'DEFAULT','DEFENCE','DEFICIT','DELIVER','DENSITY','DEPOSIT','DESPITE','DESTINY','DEVELOP',
  // 8-letter
  'ABSOLUTELY','ABSTRACT','ACADEMIC','ACCIDENT','ACCURATE','ACHIEVED','ADDITION','ADEQUATE',
  'ADJUSTED','ADVANCED','ADVOCATE','AFFORDED','ALLIANCE','ALTHOUGH','ANALYSIS','ANNUALLY',
  'ANYTHING','ANYWHERE','APPARENT','APPLAUSE','APPROVAL','ARGUMENT','ARTISTRY','ASSISTED',
  'ASSURANCE','AUTHORED','BACKGROUD','BAKERY','BALANCED','BANKRUPT','BARGAINS','BASEBALL',
  'BATHROOM','BECOMING','BEHAVIOR','BETRAYAL','BIRTHDAY','BLEEDING','BLOCKING','BOUNDARY',
  'BREAKING','BRINGING','BUILDING','BURGLARY','CALENDAR','CAMPAIGN','CASUALTY','CATEGORY',
  'CEREMONY','CHAIRMAN','CHAMPION','CHAPTERS','CHEMICAL','CHILDREN','CHOOSING','CIRCULAR',
  'CIVILIAN','CLEANING','CLIMBING','CLINICAL','COACHING','COLLAPSE','COLONIAL','COMBINED',
  'COMEBACK','COMFORTS','COMING','COMMERCE','COMMUNITY','COMPLETE','COMPOSER','COMPUTER',
  'CONCLUDE','CONCRETE','CONDEMN','CONFLICT','CONGRESS','CONQUEST','CONSIDER','CONSIST',
  // 9-letter
  'ABANDONED','ABSTRACTS','ACCEPTING','ACCORDING','ACHIEVING','ACQUAINT','ADDRESSER','ADJOURN',
  'ADMITTED','ADVOCATED','AFFAIRS','AFFIRMED','AGREEMENT','AIRBORNE','ALIENATED','ALIGNING',
  'ALLIANCE','ALTHOUGH','AMBIENCE','AMENDMENT','AMOUNTING','ANALYTIC','ANCESTOR','ANIMATED',
  'ANNOUNCED','ANYTHING','APPROACHE','ARGUABLE','ARMAMENT','ARTIFICER','ASSAULTS','ASSIGNED',
  'ASSOCIATE','ATTACHED','ATTACKER','ATTENDED','ATTRACTED','BALLOON','BANKRUPTS','BARREL',
  'BARRIERS','BATTERED','BEAUTIFUL','BEGINNING','BEHAVIOUR','BELONGING','BIRTHPLAC','BLINDING',
  'BOASTFUL','BOOKSHLF','BORROWED','BOUNDLESS','BREAKFAST','BREATHTAK','BRILLIANT','BROADCAST',
  'BROKERAGE','BRUTALITY','BUILDERS','BUILDING','BURNISHED','CALENDAR','CAMPAIGN','CANDIDATE',
  'CARNIVORE','CATALYST','CAUTIONED','CELEBRATE','CERTAINTY','CHALLENGE','CHAMPIONS','CHARMING',
  'CHEMICAL','CHILDRENS','CHRISTMAS','CIRCULATE','CIVILIAN','CLASSMATE','CLEANLINE','CLEARANCE',
  // 10-letter
  'ACCEPTABLE','ACCURATELY','ACHIEVABLE','ACQUIRING','ADDRESSED','ADVENTURE','AFFORDABLE',
  'AGREEMENT','ALCOHOLIC','ALLOCATION','ALTERNATE','ALUMNUS','AMBASSADOR','AMENDMENT',
  'ANTICIPATE','APPEARING','APPLICABLE','APPOINTED','APPRECIATE','APPROPRIAT','ASCERTAIN',
  'ASSOCIATED','ASSUMPTION','ATTACHING','ATTENTION','ATTRACTED','AUDITORIU','BALANCE','BANKRUPTCY',
  'BEGINNINGS','BENEFICIAL','BILINGUAL','BOARDROOM','BOUNDARIES','BRILLIANT','CALENDAR',
  'CAPABILITY','CANDIDATES','CARPENTRY','CATHEDRAL','CELEBRATED','CERTAINTY','CHALLENGED',
  'CHAMPIONSH','CHRISTIAN','CIRCULATED','CLIMBING','COMMERCIAL','COMMITMENT','COMMUNICAT',
  'COMPARISON','COMPETENCE','COMPLETION','COMPOUNDED','COMPREHENS','CONCERNED','CONCERTED',
  // 11-letter
  'ACCELERATE','ACCESSIBLE','ACCOMPLICE','ACCURATELY','ACKNOWLEDG','ACQUAINTED','ADDRESSES',
  'ADJUSTMENT','ADVANTAGED','ALTERNATIVE','AMBASSADOR','AMENDMENTS','APPEARANCE','APPROPRIATE',
  'ATMOSPHERE','ATTACHMENT','BATTLESHIP','BLACKSMITH','BOTTLENECK','BRILLIANCE','CALCULATOR',
  'CAMERAMAN','CANDIDACY','CAPITALISM','CELEBRATED','CHAMPIONSH','CHRISTIANI','CIRCULATION',
  'CLIMACTICAL','COLLECTIBLE','COMMANDER','COMMERCIAL','COMMITMENT','COMMUNICAT','COMPLETION',
  'COMPOUNDED','COMPREHEND','CONCENTRIC','CONFERENCE','CONSEQUENT','CONSISTENT','CONSPICUOU',
  'CONSTRUCT','CONTRACTOR','CONTRIBUTE','CONVERSION','COOPERATION','CORPORATIO','CORRESPOND',
  // 12-letter
  'ACCELERATED','ACCESSIBLE','ACCOMPLICES','ACCUMULATED','ACKNOWLEDGE','ADMINISTER','ADVANTAGES',
  'ALTERNATIVE','AMPHIBIANS','ARCHITECT','BATTLESHIPS','BIOTECHNOLO','BLACKSMITH','CAMPAIGNING',
  'CAPITALIZED','CATASTROPHE','CELEBRATION','CERTIFICATE','CHAMPIONSHI','CIRCULATION','CLIMATOLOGY',
  'COLLECTIBLE','COMMEMORATE','COMPARATIVE','COMPILETIME','COMPLETENES','COMPREHENS','CONCENTRATE',
  'CONCERTEDNE','CONFECTIONA','CONFERENCE','CONFRONTING','CONGREGATIO','CONJECTURAL','CONJECTURES',
  'CONSECUTIVE','CONSIDERABLY','CONSISTENCY','CONSTELLAT','CONSTITUTED','CONSTRAINED','CONSTRUCTION',
  'CONSULTANT','CONSUMABLE','CONSUMPTION','CONTINUOUS','CONTRACTING','CONTRACTUAL','CONTRIBUTED',
];

// ---------------------------------------------------------------------------
// Clue Bank (220+ clues across 6 categories)
// ---------------------------------------------------------------------------

interface ClueEntry {
  word: string;
  clue: string;
  category: CmClueCategory;
  difficulty: CmDifficulty;
  direction: CmDirection;
}

const CLUE_BANK: ClueEntry[] = [
  // Definitions - Easy
  { word: 'ACE', clue: 'A playing card with a single pip', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'AGE', clue: 'Number of years one has lived', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'AIR', clue: 'The invisible gaseous mixture we breathe', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'ANT', clue: 'A small insect known for hard work', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'ARC', clue: 'A curve forming part of a circle', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'ARM', clue: 'Upper limb of the human body', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'ART', clue: 'Creative expression of human skill', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'BAT', clue: 'Flying mammal or baseball equipment', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'BED', clue: 'Piece of furniture for sleeping', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'BIG', clue: 'Of considerable size or extent', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'BOX', clue: 'Container with a flat base and sides', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'BUS', clue: 'Large motor vehicle for passengers', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'CUP', clue: 'Drinking vessel with a handle', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'DAY', clue: '24-hour period of light and dark', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'DOG', clue: 'Domesticated canine companion', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'EAR', clue: 'Organ used for hearing sounds', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'EGG', clue: 'An oval reproductive body laid by birds', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'EYE', clue: 'Organ of vision and sight', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'FAN', clue: 'Device for circulating air', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'FOG', clue: 'Thick cloud of tiny water droplets near ground', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'FOX', clue: 'Small carnivorous mammal with a bushy tail', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'GUN', clue: 'Weapon that fires projectiles', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'HAT', clue: 'Head covering worn for protection or style', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'HUT', clue: 'Small, simple dwelling or shelter', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'ICE', clue: 'Frozen water in solid form', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'JAM', clue: 'Fruit preserve spread on bread', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'KEY', clue: 'Small metal instrument for opening locks', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'LAW', clue: 'System of rules enforced by authority', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'MAP', clue: 'Diagram representing geographical features', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'NET', clue: 'Meshed fabric for catching things', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'OAK', clue: 'Strong hardwood tree producing acorns', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'PEN', clue: 'Writing instrument using ink', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'RAT', clue: 'Long-tailed rodent pest', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'SEA', clue: 'Large body of salt water', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'SUN', clue: 'Star at the center of our solar system', category: 'definition', difficulty: 'easy', direction: 'across' },
  { word: 'TAX', clue: 'Mandatory financial charge by government', category: 'definition', difficulty: 'easy', direction: 'across' },
  // Definitions - Medium
  { word: 'ABOVE', clue: 'Higher than or over something', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'ANGRY', clue: 'Feeling of strong displeasure', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'BEACH', clue: 'Sandy shore beside a body of water', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'BLACK', clue: 'Color of coal or night sky', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'BLADE', clue: 'The sharp cutting part of a knife', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'BRAIN', clue: 'Organ of thought inside the skull', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'BRICK', clue: 'Rectangular block used in building walls', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'BRUSH', clue: 'Tool with bristles for cleaning or painting', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'CHASE', clue: 'To pursue someone or something rapidly', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'CHESS', clue: 'Strategic board game with kings and queens', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'DEPTH', clue: 'Distance from the top to the bottom', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'DRAFT', clue: 'Preliminary version of a document', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'DREAM', clue: 'Series of images during sleep', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'EARTH', clue: 'Third planet from the Sun', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'FLAME', clue: 'Visible hot gas from combustion', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'FROST', clue: 'Thin layer of ice crystals on surfaces', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'GHOST', clue: 'Spirit of a dead person believed to appear', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'GRACE', clue: 'Simple elegance or refinement of movement', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'GRAIN', clue: 'Small hard seed of cereal plants', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'HARVEST', clue: 'Process of gathering mature crops', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'HEART', clue: 'Organ that pumps blood through the body', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'KNIGHT', clue: 'Medieval warrior mounted on horseback', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'LANTERN', clue: 'Portable lamp with a protective case', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'MARBLE', clue: 'Hard crystalline metamorphic rock', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'NEEDLE', clue: 'Thin sharp instrument for sewing', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'PALACE', clue: 'Grand official residence of royalty', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'PLANET', clue: 'Celestial body orbiting a star', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'RABBIT', clue: 'Small burrowing mammal with long ears', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'SCARLET', clue: 'Brilliant red color', category: 'definition', difficulty: 'medium', direction: 'down' },
  { word: 'TROPHY', clue: 'Award given for winning a competition', category: 'definition', difficulty: 'medium', direction: 'down' },
  // Definitions - Hard
  { word: 'BALANCE', clue: 'State of equal distribution of weight', category: 'definition', difficulty: 'hard', direction: 'across' },
  { word: 'BARRIER', clue: 'Obstacle that prevents movement', category: 'definition', difficulty: 'hard', direction: 'across' },
  { word: 'CIRCUIT', clue: 'Complete path for electric current flow', category: 'definition', difficulty: 'hard', direction: 'across' },
  { word: 'CONVERT', clue: 'To change from one form to another', category: 'definition', difficulty: 'hard', direction: 'across' },
  { word: 'CRYSTAL', clue: 'Solid material with atoms in ordered pattern', category: 'definition', difficulty: 'hard', direction: 'across' },
  { word: 'DENSITY', clue: 'Mass per unit volume of a substance', category: 'definition', difficulty: 'hard', direction: 'across' },
  { word: 'DEPOSIT', clue: 'Sum of money placed in a bank account', category: 'definition', difficulty: 'hard', direction: 'across' },
  { word: 'ESTIMATE', clue: 'Rough calculation of value or quantity', category: 'definition', difficulty: 'hard', direction: 'across' },
  { word: 'GRAVITY', clue: 'Force attracting objects toward Earth', category: 'definition', difficulty: 'hard', direction: 'across' },
  { word: 'INERTIA', clue: 'Tendency of objects to resist change in motion', category: 'definition', difficulty: 'hard', direction: 'across' },
  { word: 'KINGDOM', clue: 'Domain ruled by a monarch', category: 'definition', difficulty: 'hard', direction: 'across' },
  { word: 'LANDING', clue: 'Act of coming down to the ground', category: 'definition', difficulty: 'hard', direction: 'across' },
  { word: 'LEGACY', clue: 'Something handed down from the past', category: 'definition', difficulty: 'hard', direction: 'across' },
  { word: 'LUMINUS', clue: 'Emitting or reflecting light', category: 'definition', difficulty: 'hard', direction: 'across' },
  { word: 'MINERAL', clue: 'Naturally occurring inorganic solid substance', category: 'definition', difficulty: 'hard', direction: 'across' },
  { word: 'NUCLEUS', clue: 'Central part of an atom or cell', category: 'definition', difficulty: 'hard', direction: 'across' },
  { word: 'PHOENIX', clue: 'Mythical bird that rises from its own ashes', category: 'definition', difficulty: 'hard', direction: 'across' },
  { word: 'QUANTUM', clue: 'Minimum amount of any physical entity', category: 'definition', difficulty: 'hard', direction: 'across' },
  { word: 'RESOLVE', clue: 'To settle or find a solution', category: 'definition', difficulty: 'hard', direction: 'across' },
  { word: 'THERMAL', clue: 'Relating to heat or temperature', category: 'definition', difficulty: 'hard', direction: 'across' },
  // Definitions - Expert
  { word: 'ABSTRACT', clue: 'Existing in thought as an idea, not concrete', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'CALENDAR', clue: 'Systematic chart showing days and months', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'CAMPAIGN', clue: 'Organized series of operations for a goal', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'CEREMONY', clue: 'Formal religious or public occasion', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'CHAMPION', clue: 'Person who wins a competition or tournament', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'CLIMATIC', clue: 'Relating to the climate of an area', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'CONCLUDE', clue: 'To bring or come to an end', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'CONFLICT', clue: 'Serious disagreement or argument', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'COPULATE', clue: 'To engage in sexual intercourse', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'CORRIDOR', clue: 'Long passage in a building from which doors lead', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'CREATION', clue: 'The act of bringing something into existence', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'DISCOVERY', clue: 'Act of finding something previously unknown', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'EMBARGO', clue: 'Official ban on trade with a country', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'FRICTION', clue: 'Resistance encountered when one body moves over another', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'GRADIENT', clue: 'Rate of change of a quantity with respect to another', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'HYDROGEN', clue: 'Lightest chemical element, atomic number one', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'IMPURITY', clue: 'Presence of unwanted substance in another', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'LAUNCHER', clue: 'Device or structure used to propel something', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'MAGNETIC', clue: 'Having the properties of a magnet', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'OMNIVORE', clue: 'Animal that eats both plants and flesh', category: 'definition', difficulty: 'expert', direction: 'down' },
  { word: 'PLUTONIUM', clue: 'Radioactive element used in nuclear weapons', category: 'definition', difficulty: 'expert', direction: 'down' },
  // Synonyms - Easy
  { word: 'Glad', clue: 'Happy or pleased (synonym)', category: 'synonym', difficulty: 'easy', direction: 'across' },
  { word: 'HUGE', clue: 'Extremely large (synonym for enormous)', category: 'synonym', difficulty: 'easy', direction: 'across' },
  { word: 'FAST', clue: 'Moving at high speed (synonym for quick)', category: 'synonym', difficulty: 'easy', direction: 'across' },
  { word: 'SAD', clue: 'Feeling sorrow (synonym for unhappy)', category: 'synonym', difficulty: 'easy', direction: 'across' },
  { word: 'MAD', clue: 'Very angry (synonym for furious)', category: 'synonym', difficulty: 'easy', direction: 'across' },
  { word: 'RICH', clue: 'Having a lot of money (synonym for wealthy)', category: 'synonym', difficulty: 'easy', direction: 'across' },
  { word: 'WARM', clue: 'Moderately hot (synonym for tepid)', category: 'synonym', difficulty: 'easy', direction: 'across' },
  { word: 'BOLD', clue: 'Willing to take risks (synonym for brave)', category: 'synonym', difficulty: 'easy', direction: 'across' },
  { word: 'COOL', clue: 'Slightly cold (synonym for chilly)', category: 'synonym', difficulty: 'easy', direction: 'across' },
  { word: 'DARK', clue: 'With little or no light (synonym for dim)', category: 'synonym', difficulty: 'easy', direction: 'across' },
  // Synonyms - Medium
  { word: 'BRAVE', clue: 'Ready to face danger (synonym for courageous)', category: 'synonym', difficulty: 'medium', direction: 'down' },
  { word: 'CALM', clue: 'Not showing or feeling nervousness (synonym)', category: 'synonym', difficulty: 'medium', direction: 'down' },
  { word: 'SHARP', clue: 'Having a cutting edge (synonym for keen)', category: 'synonym', difficulty: 'medium', direction: 'down' },
  { word: 'CLOAK', clue: 'A sleeveless cloak-like garment (synonym for cape)', category: 'synonym', difficulty: 'medium', direction: 'down' },
  { word: 'FEAST', clue: 'An elaborate meal (synonym for banquet)', category: 'synonym', difficulty: 'medium', direction: 'down' },
  { word: 'LIVID', clue: 'Furiously angry (synonym for enraged)', category: 'synonym', difficulty: 'medium', direction: 'down' },
  { word: 'MIGHTY', clue: 'Having great power (synonym for powerful)', category: 'synonym', difficulty: 'medium', direction: 'down' },
  { word: 'PERIL', clue: 'Serious danger (synonym for jeopardy)', category: 'synonym', difficulty: 'medium', direction: 'down' },
  { word: 'STEALTH', clue: 'Cautious and surreptitious action', category: 'synonym', difficulty: 'medium', direction: 'down' },
  { word: 'THRIVE', clue: 'Grow or develop well (synonym for flourish)', category: 'synonym', difficulty: 'medium', direction: 'down' },
  // Synonyms - Hard/Expert
  { word: 'LUCENT', clue: 'Glowing with light (synonym for luminous)', category: 'synonym', difficulty: 'hard', direction: 'across' },
  { word: 'BENEVOLENT', clue: 'Well-meaning and kindly (synonym for charitable)', category: 'synonym', difficulty: 'hard', direction: 'across' },
  { word: 'EFFACE', clue: 'To erase or make unnoticeable (synonym)', category: 'synonym', difficulty: 'hard', direction: 'across' },
  { word: 'GARRULOUS', clue: 'Excessively talkative (synonym for loquacious)', category: 'synonym', difficulty: 'expert', direction: 'across' },
  { word: 'INEFFABLE', clue: 'Too great to be expressed in words', category: 'synonym', difficulty: 'expert', direction: 'across' },
  { word: 'MERCURIAL', clue: 'Subject to sudden unpredictable changes', category: 'synonym', difficulty: 'expert', direction: 'across' },
  { word: 'RECALCITRANT', clue: 'Stubbornly resistant to authority', category: 'synonym', difficulty: 'expert', direction: 'across' },
  { word: 'TRANSPARENT', clue: 'Allowing light to pass through clearly', category: 'synonym', difficulty: 'hard', direction: 'across' },
  { word: 'RAPPROCHEMENT', clue: 'Restoration of friendly relations', category: 'synonym', difficulty: 'expert', direction: 'across' },
  { word: 'VOCIFEROUS', clue: 'Vehement or clamorous in expressing opinions', category: 'synonym', difficulty: 'expert', direction: 'across' },
  // Antonyms - Easy
  { word: 'HOT', clue: 'Opposite of cold', category: 'antonym', difficulty: 'easy', direction: 'down' },
  { word: 'NEW', clue: 'Opposite of old', category: 'antonym', difficulty: 'easy', direction: 'down' },
  { word: 'BIG', clue: 'Opposite of small', category: 'antonym', difficulty: 'easy', direction: 'down' },
  { word: 'TOP', clue: 'Opposite of bottom', category: 'antonym', difficulty: 'easy', direction: 'down' },
  { word: 'WET', clue: 'Opposite of dry', category: 'antonym', difficulty: 'easy', direction: 'down' },
  { word: 'Loud', clue: 'Opposite of quiet', category: 'antonym', difficulty: 'easy', direction: 'down' },
  { word: 'FAST', clue: 'Opposite of slow', category: 'antonym', difficulty: 'easy', direction: 'down' },
  { word: 'RICH', clue: 'Opposite of poor', category: 'antonym', difficulty: 'easy', direction: 'down' },
  { word: 'OPEN', clue: 'Opposite of closed', category: 'antonym', difficulty: 'easy', direction: 'down' },
  { word: 'HIGH', clue: 'Opposite of low', category: 'antonym', difficulty: 'easy', direction: 'down' },
  // Antonyms - Medium
  { word: 'ABUNDANT', clue: 'Opposite of scarce', category: 'antonym', difficulty: 'medium', direction: 'across' },
  { word: 'GENUINE', clue: 'Opposite of fake', category: 'antonym', difficulty: 'medium', direction: 'across' },
  { word: 'HARMONY', clue: 'Opposite of discord', category: 'antonym', difficulty: 'medium', direction: 'across' },
  { word: 'INNOCENT', clue: 'Opposite of guilty', category: 'antonym', difficulty: 'medium', direction: 'across' },
  { word: 'SACRED', clue: 'Opposite of profane', category: 'antonym', difficulty: 'medium', direction: 'across' },
  { word: 'VALIANT', clue: 'Opposite of cowardly', category: 'antonym', difficulty: 'medium', direction: 'across' },
  // Antonyms - Hard
  { word: 'BENEVOLENT', clue: 'Opposite of malevolent', category: 'antonym', difficulty: 'hard', direction: 'down' },
  { word: 'COGENT', clue: 'Opposite of unconvincing', category: 'antonym', difficulty: 'hard', direction: 'down' },
  { word: 'DILIGENT', clue: 'Opposite of lazy or indolent', category: 'antonym', difficulty: 'hard', direction: 'down' },
  { word: 'MAGNANIMOUS', clue: 'Opposite of petty or vindictive', category: 'antonym', difficulty: 'expert', direction: 'down' },
  // Fill-in-Blank - Easy
  { word: 'RAIN', clue: '___ or shine, we will go', category: 'fill_blank', difficulty: 'easy', direction: 'across' },
  { word: 'EASY', clue: 'Take it ___', category: 'fill_blank', difficulty: 'easy', direction: 'across' },
  { word: 'LONG', clue: 'Live ___ and prosper', category: 'fill_blank', difficulty: 'easy', direction: 'across' },
  { word: 'FIRE', clue: 'Fight ___ with fire', category: 'fill_blank', difficulty: 'easy', direction: 'across' },
  { word: 'WIND', clue: 'Gone with the ___', category: 'fill_blank', difficulty: 'easy', direction: 'across' },
  { word: 'BLUE', clue: 'Out of the ___', category: 'fill_blank', difficulty: 'easy', direction: 'across' },
  { word: 'WELL', clue: 'All is ___ that ends well', category: 'fill_blank', difficulty: 'easy', direction: 'across' },
  { word: 'WORD', clue: 'Actions speak louder than ___', category: 'fill_blank', difficulty: 'easy', direction: 'across' },
  { word: 'TIME', clue: 'Only a matter of ___', category: 'fill_blank', difficulty: 'easy', direction: 'across' },
  { word: 'LOVE', clue: '___ makes the world go round', category: 'fill_blank', difficulty: 'easy', direction: 'across' },
  // Fill-in-Blank - Medium
  { word: 'HISTORY', clue: 'Making ___ today', category: 'fill_blank', difficulty: 'medium', direction: 'down' },
  { word: 'SILENCE', clue: 'The sound of ___', category: 'fill_blank', difficulty: 'medium', direction: 'down' },
  { word: 'CRYSTAL', clue: '___ clear', category: 'fill_blank', difficulty: 'medium', direction: 'down' },
  { word: 'PIRATE', clue: '___ of the Caribbean', category: 'fill_blank', difficulty: 'medium', direction: 'down' },
  { word: 'WELCOME', clue: 'You are always ___', category: 'fill_blank', difficulty: 'medium', direction: 'down' },
  { word: 'ROMANCE', clue: 'A summer ___', category: 'fill_blank', difficulty: 'medium', direction: 'down' },
  // Fill-in-Blank - Hard/Expert
  { word: 'GIRAFFE', clue: 'The ___ is the tallest land animal', category: 'fill_blank', difficulty: 'hard', direction: 'across' },
  { word: 'ALGORITHM', clue: 'Computer ___ used in sorting', category: 'fill_blank', difficulty: 'expert', direction: 'across' },
  { word: 'ARCHIPELAGO', clue: 'An ___ of islands in the Pacific', category: 'fill_blank', difficulty: 'expert', direction: 'across' },
  { word: 'PARADOXICAL', clue: 'A ___ situation that contradicts itself', category: 'fill_blank', difficulty: 'expert', direction: 'across' },
  // Trivia - Easy
  { word: 'ALPHA', clue: 'First letter of the Greek alphabet', category: 'trivia', difficulty: 'easy', direction: 'down' },
  { word: 'EIGHT', clue: 'Number of planets in our solar system', category: 'trivia', difficulty: 'easy', direction: 'down' },
  { word: 'DEUCE', clue: 'Tennis term for a 40-40 tie', category: 'trivia', difficulty: 'easy', direction: 'down' },
  { word: 'PIANO', clue: 'Instrument with 88 keys', category: 'trivia', difficulty: 'easy', direction: 'down' },
  { word: 'ACES', clue: 'Slang for getting perfect grades', category: 'trivia', difficulty: 'easy', direction: 'down' },
  { word: 'EPCOT', clue: 'Disney theme park focused on the future', category: 'trivia', difficulty: 'easy', direction: 'down' },
  { word: 'JUNE', clue: 'Month when summer begins in the Northern Hemisphere', category: 'trivia', difficulty: 'easy', direction: 'down' },
  { word: 'NOVA', clue: 'Sudden burst of brightness from a star', category: 'trivia', difficulty: 'easy', direction: 'down' },
  { word: 'POLO', clue: 'Sport played on horseback', category: 'trivia', difficulty: 'easy', direction: 'down' },
  { word: 'TITAN', clue: 'Largest moon of Saturn', category: 'trivia', difficulty: 'easy', direction: 'down' },
  // Trivia - Medium
  { word: 'ATLAS', clue: 'Greek Titan who held up the sky', category: 'trivia', difficulty: 'medium', direction: 'across' },
  { word: 'CASPIAN', clue: 'World\'s largest inland body of water', category: 'trivia', difficulty: 'medium', direction: 'across' },
  { word: 'DYNAMO', clue: 'Device that converts mechanical to electrical energy', category: 'trivia', difficulty: 'medium', direction: 'across' },
  { word: 'FIBER', clue: 'Dietary ___ promotes healthy digestion', category: 'trivia', difficulty: 'medium', direction: 'across' },
  { word: 'HYPNOS', clue: 'Greek god of sleep', category: 'trivia', difficulty: 'medium', direction: 'across' },
  { word: 'MARS', clue: 'The Red Planet', category: 'trivia', difficulty: 'medium', direction: 'across' },
  { word: 'OSLO', clue: 'Capital city of Norway', category: 'trivia', difficulty: 'medium', direction: 'across' },
  { word: 'ROE', clue: 'Fish eggs used as food delicacy', category: 'trivia', difficulty: 'medium', direction: 'across' },
  { word: 'TANGO', clue: 'Argentine ballroom dance', category: 'trivia', difficulty: 'medium', direction: 'across' },
  { word: 'VOLT', clue: 'Unit of electrical potential', category: 'trivia', difficulty: 'medium', direction: 'across' },
  // Trivia - Hard/Expert
  { word: 'PLATYPUS', clue: 'Mammal that lays eggs and has a bill', category: 'trivia', difficulty: 'hard', direction: 'down' },
  { word: 'BACH', clue: 'Composer of the Brandenburg Concertos', category: 'trivia', difficulty: 'hard', direction: 'down' },
  { word: 'EULER', clue: 'Swiss mathematician, father of graph theory', category: 'trivia', difficulty: 'expert', direction: 'down' },
  { word: 'KREMLIN', clue: 'Historic fortress in Moscow', category: 'trivia', difficulty: 'expert', direction: 'down' },
  { word: 'MAGELLAN', clue: 'Portuguese explorer who circumnavigated the globe', category: 'trivia', difficulty: 'expert', direction: 'down' },
  { word: 'TURING', clue: 'Father of computer science and AI', category: 'trivia', difficulty: 'expert', direction: 'down' },
  { word: 'GALILEO', clue: 'Italian astronomer who championed heliocentrism', category: 'trivia', difficulty: 'expert', direction: 'down' },
  { word: 'NAPOLEON', clue: 'French emperor crowned in 1804', category: 'trivia', difficulty: 'expert', direction: 'down' },
  // Word Play - Easy
  { word: 'FLOWER', clue: 'Something that flows (word play)', category: 'word_play', difficulty: 'easy', direction: 'across' },
  { word: 'CARET', clue: 'Not a carrot, but a proofreading mark', category: 'word_play', difficulty: 'easy', direction: 'across' },
  { word: 'HOARSE', clue: 'Sounds like a horse with a sore throat', category: 'word_play', difficulty: 'easy', direction: 'across' },
  { word: 'KNOT', clue: 'Not or ___?', category: 'word_play', difficulty: 'easy', direction: 'across' },
  { word: 'SOAR', clue: 'Anagram of "oars"', category: 'word_play', difficulty: 'easy', direction: 'across' },
  { word: 'LISTEN', clue: 'Anagram of "silent"', category: 'word_play', difficulty: 'medium', direction: 'across' },
  { word: 'BRAG', clue: 'Anagram of "grab" meaning to boast', category: 'word_play', difficulty: 'easy', direction: 'across' },
  { word: 'EARTH', clue: 'Anagram of "heart"', category: 'word_play', difficulty: 'medium', direction: 'across' },
  { word: 'CATS', clue: 'Anagram of "acts" (furry pets)', category: 'word_play', difficulty: 'easy', direction: 'across' },
  { word: 'STAR', clue: 'Anagram of "rats" or "arts"', category: 'word_play', difficulty: 'easy', direction: 'across' },
  // Word Play - Medium/Hard
  { word: 'ENGLISH', clue: 'Language spoken in England, hidden in "englishtm"', category: 'word_play', difficulty: 'medium', direction: 'down' },
  { word: 'CHAIR', clue: 'Anagram of "arch" meaning something you sit on', category: 'word_play', difficulty: 'medium', direction: 'down' },
  { word: 'EVIL', clue: 'Anagram of "vile" or "live" backwards', category: 'word_play', difficulty: 'easy', direction: 'down' },
  { word: 'THERE', clue: 'Anagram of "three" minus one letter', category: 'word_play', difficulty: 'medium', direction: 'down' },
  { word: 'DORMITORY', clue: 'Anagram: "dirty room" for college housing', category: 'word_play', difficulty: 'hard', direction: 'down' },
  { word: 'ASTRONOMER', clue: 'Anagram: "moon starer" profession', category: 'word_play', difficulty: 'expert', direction: 'down' },
  { word: 'LISTEN', clue: 'Anagram of "silent" — something you do with your ears', category: 'word_play', difficulty: 'medium', direction: 'down' },
  { word: 'SCHOOLMASTER', clue: 'Anagram: "the classroom" leader', category: 'word_play', difficulty: 'expert', direction: 'down' },
  { word: 'DIALOGUE', clue: 'Anagram: "a loud ego" in conversation', category: 'word_play', difficulty: 'hard', direction: 'down' },
  { word: 'PUN', clue: 'A play on words, like this clue', category: 'word_play', difficulty: 'easy', direction: 'down' },
];

// ---------------------------------------------------------------------------
// Seeded PRNG (Mulberry32 — fast, good distribution)
// ---------------------------------------------------------------------------

function cmSeedRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cmHashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return hash;
}

function cmDateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function cmDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Grid Helpers
// ---------------------------------------------------------------------------

function cmCreateEmptyGrid(rows: number, cols: number): CmCell[][] {
  const grid: CmCell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: CmCell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        letter: '',
        isBlack: true,
        number: null,
        revealed: false,
        correct: false,
        userLetter: null,
      });
    }
    grid.push(row);
  }
  return grid;
}

function cmInBounds(row: number, col: number, rows: number, cols: number): boolean {
  return row >= 0 && row < rows && col >= 0 && col < cols;
}

function cmCanPlaceWord(
  grid: CmCell[][],
  word: string,
  row: number,
  col: number,
  direction: CmDirection,
  rows: number,
  cols: number,
): boolean {
  const len = word.length;
  const dr = direction === 'across' ? 0 : 1;
  const dc = direction === 'across' ? 1 : 0;

  // Check bounds
  const endR = row + dr * (len - 1);
  const endC = col + dc * (len - 1);
  if (!cmInBounds(endR, endC, rows, cols)) return false;

  // Cell before word must be black or out-of-bounds
  const beforeR = row - dr;
  const beforeC = col - dc;
  if (cmInBounds(beforeR, beforeC, rows, cols) && !grid[beforeR][beforeC].isBlack) {
    return false;
  }

  // Cell after word must be black or out-of-bounds
  const afterR = row + dr * len;
  const afterC = col + dc * len;
  if (cmInBounds(afterR, afterC, rows, cols) && !grid[afterR][afterC].isBlack) {
    return false;
  }

  let crossings = 0;

  for (let i = 0; i < len; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    const cell = grid[r][c];

    if (cell.isBlack) continue; // We can place over black cells

    if (cell.letter !== '' && cell.letter !== word[i]) {
      return false; // Conflict with existing letter
    }

    if (cell.letter === word[i]) {
      crossings++;
      // Make sure perpendicular neighbors are black (no parallel adjacency)
      const perpDr = dc;
      const perpDc = dr;
      const adjR1 = r + perpDr;
      const adjC1 = c + perpDc;
      const adjR2 = r - perpDr;
      const adjC2 = c - perpDc;
      // If the crossing cell already has perpendicular word parts, allow it
      // But if both adjacent perpendicular cells have letters, it's a problem
      const hasAdj1 = cmInBounds(adjR1, adjC1, rows, cols) && !grid[adjR1][adjC1].isBlack;
      const hasAdj2 = cmInBounds(adjR2, adjC2, rows, cols) && !grid[adjR2][adjC2].isBlack;
      if (hasAdj1 && hasAdj2) {
        // Too much adjacency
        return false;
      }
    }
  }

  // If not crossing anything, check that parallel neighbors are all black
  if (crossings === 0) {
    for (let i = 0; i < len; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      const perpDr = dc;
      const perpDc = dr;
      const adjR1 = r + perpDr;
      const adjC1 = c + perpDc;
      const adjR2 = r - perpDr;
      const adjC2 = c - perpDc;
      const hasAdj1 = cmInBounds(adjR1, adjC1, rows, cols) && !grid[adjR1][adjC1].isBlack;
      const hasAdj2 = cmInBounds(adjR2, adjC2, rows, cols) && !grid[adjR2][adjC2].isBlack;
      if (hasAdj1 || hasAdj2) {
        return false; // Adjacent parallel word
      }
    }
  }

  return true;
}

function cmPlaceWordOnGrid(
  grid: CmCell[][],
  word: string,
  row: number,
  col: number,
  direction: CmDirection,
): void {
  const dr = direction === 'across' ? 0 : 1;
  const dc = direction === 'across' ? 1 : 0;
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    grid[r][c] = {
      ...grid[r][c],
      letter: word[i].toUpperCase(),
      isBlack: false,
      userLetter: null,
      revealed: false,
      correct: false,
    };
  }
}

// ---------------------------------------------------------------------------
// Number Grid Cells
// ---------------------------------------------------------------------------

function cmNumberGrid(grid: CmCell[][], rows: number, cols: number): void {
  let num = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].isBlack) continue;
      const needsNumber =
        (c === 0 || grid[r][c - 1].isBlack) ||
        (r === 0 || grid[r - 1][c].isBlack);
      if (needsNumber) {
        grid[r][c].number = num;
        num++;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Black Cell Placement Algorithm
// ---------------------------------------------------------------------------

function cmPlaceBlackCells(
  grid: CmCell[][],
  rows: number,
  cols: number,
  placedWords: CmPlacedWord[],
  rng: () => number,
): void {
  // Start with all cells black, words will carve out letters
  // After placing words, add strategic black cells for aesthetic patterns
  const fillPattern = Math.floor(rng() * 4);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].letter !== '') continue;
      // Symmetric-ish black cell placement
      const symR = rows - 1 - r;
      const symC = cols - 1 - c;

      let shouldBlack = false;
      switch (fillPattern) {
        case 0: // Checkerboard-ish
          shouldBlack = (r + c) % 3 === 0;
          break;
        case 1: // Diagonal bands
          shouldBlack = Math.abs(r - c) % 4 === 0;
          break;
        case 2: // Scattered
          shouldBlack = rng() > 0.5;
          break;
        case 3: // Block pattern
          shouldBlack = (r % 3 === 0 && c % 2 === 0) || (c % 3 === 0 && r % 2 === 0);
          break;
      }

      if (shouldBlack) {
        grid[r][c].isBlack = true;
        // Symmetric counterpart
        if (cmInBounds(symR, symC, rows, cols) && grid[symR][symC].letter === '') {
          grid[symR][symC].isBlack = true;
        }
      }
    }
  }

  // Ensure no isolated single white cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].isBlack) continue;
      const neighbors = [
        [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1],
      ].filter(([nr, nc]) => cmInBounds(nr, nc, rows, cols) && !grid[nr][nc].isBlack);
      if (neighbors.length === 0) {
        grid[r][c].isBlack = true;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Crossword Generator
// ---------------------------------------------------------------------------

function cmSelectWords(
  rng: () => number,
  difficulty: CmDifficulty,
  rows: number,
  cols: number,
): string[] {
  const allowedLengths = WORDS_PER_DIFFICULTY[difficulty];
  const maxLen = Math.min(Math.max(...allowedLengths), Math.max(rows, cols));
  const minLen = Math.min(...allowedLengths);

  let candidates = WORD_BANK.filter(w => {
    const len = w.length;
    return len >= minLen && len <= maxLen;
  });

  // Shuffle
  candidates = candidates.sort(() => rng() - 0.5);

  // Pick a diverse set
  const selected: string[] = [];
  const usedLetters = new Set<string>();
  const targetCount = Math.floor((rows * cols) / 6);

  for (const word of candidates) {
    if (selected.length >= targetCount + 5) break;
    if (selected.some(s => s === word)) continue;
    const uniqueLetters = word.split('').filter(l => !usedLetters.has(l)).length;
    if (selected.length < 3 || uniqueLetters > 0) {
      selected.push(word);
      word.split('').forEach(l => usedLetters.add(l));
    }
  }

  return selected;
}

function cmBuildClueList(
  placedWords: CmPlacedWord[],
  grid: CmCell[][],
  rows: number,
  cols: number,
  rng: () => number,
): CmClue[] {
  // Number the grid first
  cmNumberGrid(grid, rows, cols);

  const clues: CmClue[] = [];

  for (const pw of placedWords) {
    const startCell = grid[pw.row][pw.col];
    const num = startCell.number ?? clues.length + 1;
    const dr = pw.direction === 'across' ? 0 : 1;
    const dc = pw.direction === 'across' ? 1 : 0;

    // Find matching clues from the bank
    const matchingClues = CLUE_BANK.filter(
      cb => cb.word.toUpperCase() === pw.word.toUpperCase(),
    );

    let clueEntry: ClueEntry | undefined;
    if (matchingClues.length > 0) {
      // Filter by preferred direction
      const dirMatch = matchingClues.filter(cb => cb.direction === pw.direction);
      if (dirMatch.length > 0) {
        clueEntry = dirMatch[Math.floor(rng() * dirMatch.length)];
      } else {
        clueEntry = matchingClues[Math.floor(rng() * matchingClues.length)];
      }
    }

    // Fallback: generate a generic clue
    const clueText = clueEntry
      ? clueEntry.clue
      : `${pw.word.length}-letter word starting with "${pw.word[0]}"`;

    clues.push({
      number: num,
      direction: pw.direction,
      clue: clueText,
      answer: pw.word,
      row: pw.row,
      col: pw.col,
      length: pw.word.length,
      difficulty: clueEntry?.difficulty ?? 'medium',
      category: clueEntry?.category ?? 'definition',
    });
  }

  // Sort clues by direction then number
  clues.sort((a, b) => {
    if (a.direction !== b.direction) return a.direction === 'across' ? -1 : 1;
    return a.number - b.number;
  });

  return clues;
}

function cmGenerateCrossword(
  size: CmPuzzleSize,
  difficulty: CmDifficulty,
  rng: () => number,
): CmPuzzle {
  const { rows, cols } = PUZZLE_SIZES[size];
  const grid = cmCreateEmptyGrid(rows, cols);
  const placedWords: CmPlacedWord[] = [];

  const words = cmSelectWords(rng, difficulty, rows, cols);
  // Sort: longest first for better placement
  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  // Place first word in the center
  if (sortedWords.length > 0) {
    const firstWord = sortedWords[0];
    const startRow = Math.floor(rows / 2);
    const startCol = Math.max(0, Math.floor((cols - firstWord.length) / 2));

    cmPlaceWordOnGrid(grid, firstWord, startRow, startCol, 'across');
    placedWords.push({
      word: firstWord,
      row: startRow,
      col: startCol,
      direction: 'across',
      clueIndex: 0,
    });
  }

  // Place remaining words
  for (let wi = 1; wi < sortedWords.length; wi++) {
    const word = sortedWords[wi];
    let bestPlacement: { row: number; col: number; dir: CmDirection; crossings: number } | null = null;

    // Try to find a crossing with existing letters
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c].isBlack || grid[r][c].letter !== letter) continue;

          // Try across
          const acrossCol = c - i;
          if (cmCanPlaceWord(grid, word, r, acrossCol, 'across', rows, cols)) {
            let crossings = 0;
            for (let k = 0; k < word.length; k++) {
              const cr = r;
              const cc = acrossCol + k;
              if (cmInBounds(cr, cc, rows, cols) && !grid[cr][cc].isBlack && grid[cr][cc].letter === word[k]) {
                crossings++;
              }
            }
            if (!bestPlacement || crossings > bestPlacement.crossings) {
              bestPlacement = { row: r, col: acrossCol, dir: 'across', crossings };
            }
          }

          // Try down
          const downRow = r - i;
          if (cmCanPlaceWord(grid, word, downRow, c, 'down', rows, cols)) {
            let crossings = 0;
            for (let k = 0; k < word.length; k++) {
              const cr = downRow + k;
              const cc = c;
              if (cmInBounds(cr, cc, rows, cols) && !grid[cr][cc].isBlack && grid[cr][cc].letter === word[k]) {
                crossings++;
              }
            }
            if (!bestPlacement || crossings > bestPlacement.crossings) {
              bestPlacement = { row: downRow, col: c, dir: 'down', crossings };
            }
          }
        }
      }
    }

    if (bestPlacement && bestPlacement.crossings >= 1) {
      cmPlaceWordOnGrid(grid, word, bestPlacement.row, bestPlacement.col, bestPlacement.dir);
      placedWords.push({
        word,
        row: bestPlacement.row,
        col: bestPlacement.col,
        direction: bestPlacement.dir,
        clueIndex: placedWords.length,
      });
    }
  }

  // Place black cells
  cmPlaceBlackCells(grid, rows, cols, placedWords, rng);

  // Build clue list
  const clues = cmBuildClueList(placedWords, grid, rows, cols, rng);

  const now = Date.now();

  return {
    id: `cm_${size}_${now}_${Math.floor(rng() * 9999)}`,
    size,
    rows,
    cols,
    grid,
    clues,
    placedWords,
    difficulty,
    createdAt: now,
    completedAt: null,
    hintsUsed: 0,
    maxHints: MAX_HINTS_BY_SIZE[size],
    score: 0,
    grade: null,
    timeElapsed: 0,
    startTime: null,
  };
}

// ---------------------------------------------------------------------------
// Difficulty Mapping from Size
// ---------------------------------------------------------------------------

function cmDifficultyForSize(size: CmPuzzleSize): CmDifficulty {
  const map: Record<CmPuzzleSize, CmDifficulty> = {
    mini: 'easy',
    small: 'easy',
    medium: 'medium',
    large: 'hard',
    expert: 'expert',
  };
  return map[size];
}

// ---------------------------------------------------------------------------
// Scoring & Grading
// ---------------------------------------------------------------------------

function cmCalculateScore(puzzle: CmPuzzle, streak: number): number {
  const totalLetters = puzzle.placedWords.reduce((s, w) => s + w.word.length, 0);
  let baseScore = totalLetters * 10;

  // Hint penalty
  const hintPenalty = puzzle.hintsUsed * 15;
  baseScore -= hintPenalty;

  // No-hint bonus (2x)
  if (puzzle.hintsUsed === 0) {
    baseScore *= 2;
  }

  // Speed bonus: base time per letter, faster = higher multiplier
  const elapsed = puzzle.timeElapsed;
  const lettersPerSecond = totalLetters / Math.max(elapsed, 1);
  const speedMultiplier = 1 + Math.min(lettersPerSecond / LETTERS_PER_SECOND_BONUS, 2);
  baseScore = Math.floor(baseScore * speedMultiplier);

  // Streak bonus
  const streakBonus = streak * STREAK_BONUS_MULTIPLIER;
  baseScore += streakBonus;

  return Math.max(0, baseScore);
}

function cmCalculateGrade(score: number, totalLetters: number): CmGrade {
  const maxPossible = totalLetters * 10 * 2 * 3 + 500; // No hints + speed + streak
  const ratio = score / Math.max(maxPossible, 1);

  if (ratio >= 0.9) return 'S';
  if (ratio >= 0.75) return 'A';
  if (ratio >= 0.6) return 'B';
  if (ratio >= 0.45) return 'C';
  if (ratio >= 0.3) return 'D';
  return 'F';
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

function cmCreateAchievements(): CmAchievement[] {
  return [
    { id: 'first_puzzle', name: 'First Steps', description: 'Complete your first crossword', unlocked: false, unlockedAt: null, progress: 0, target: 1 },
    { id: 'five_puzzles', name: 'Getting Warmed Up', description: 'Complete 5 crosswords', unlocked: false, unlockedAt: null, progress: 0, target: 5 },
    { id: 'ten_puzzles', name: 'Crossword Devotee', description: 'Complete 10 crosswords', unlocked: false, unlockedAt: null, progress: 0, target: 10 },
    { id: 'twenty_five', name: 'Crossword Master', description: 'Complete 25 crosswords', unlocked: false, unlockedAt: null, progress: 0, target: 25 },
    { id: 'fifty_puzzles', name: 'Legend', description: 'Complete 50 crosswords', unlocked: false, unlockedAt: null, progress: 0, target: 50 },
    { id: 'no_hints', name: 'Purist', description: 'Complete a puzzle without any hints', unlocked: false, unlockedAt: null, progress: 0, target: 1 },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a medium puzzle under 3 minutes', unlocked: false, unlockedAt: null, progress: 0, target: 1 },
    { id: 'streak_3', name: 'Hat Trick', description: 'Achieve a 3-day daily streak', unlocked: false, unlockedAt: null, progress: 0, target: 3 },
    { id: 'streak_7', name: 'Weekly Warrior', description: 'Achieve a 7-day daily streak', unlocked: false, unlockedAt: null, progress: 0, target: 7 },
    { id: 'streak_30', name: 'Monthly Master', description: 'Achieve a 30-day daily streak', unlocked: false, unlockedAt: null, progress: 0, target: 30 },
    { id: 'grade_s', name: 'Perfect Score', description: 'Get an S grade on any puzzle', unlocked: false, unlockedAt: null, progress: 0, target: 1 },
    { id: 'all_sizes', name: 'Size Explorer', description: 'Complete at least one puzzle of each size', unlocked: false, unlockedAt: null, progress: 0, target: 5 },
    { id: 'hundred_words', name: 'Wordsmith', description: 'Find 100 words total', unlocked: false, unlockedAt: null, progress: 0, target: 100 },
    { id: 'expert_done', name: 'Big Brain', description: 'Complete an expert-size puzzle', unlocked: false, unlockedAt: null, progress: 0, target: 1 },
    { id: 'daily_first', name: 'Daily Devotee', description: 'Complete your first daily challenge', unlocked: false, unlockedAt: null, progress: 0, target: 1 },
  ];
}

function cmUpdateAchievement(
  achievement: CmAchievement,
  progress: number,
): CmAchievement {
  const updated = { ...achievement, progress: Math.max(achievement.progress, progress) };
  if (!updated.unlocked && updated.progress >= updated.target) {
    updated.unlocked = true;
    updated.unlockedAt = Date.now();
  }
  return updated;
}

// ---------------------------------------------------------------------------
// Default Stats
// ---------------------------------------------------------------------------

function cmCreateDefaultStats(): CmStats {
  return {
    totalSolved: 0,
    totalWordsFound: 0,
    totalLettersPlaced: 0,
    bestTimes: {
      mini: null,
      small: null,
      medium: null,
      large: null,
      expert: null,
    },
    accuracy: 100,
    totalHintsUsed: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastDailyDate: null,
    grades: { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 },
    puzzlesBySize: { mini: 0, small: 0, medium: 0, large: 0, expert: 0 },
  };
}

// ---------------------------------------------------------------------------
// State (SSR-safe singleton)
// ---------------------------------------------------------------------------

let state: CmState | null = null;

function cmEnsureInit(): CmState {
  if (!state) {
    state = {
      activePuzzle: null,
      stats: cmCreateDefaultStats(),
      achievements: cmCreateAchievements(),
      savedPuzzles: [],
      dailyCompletedDate: null,
      initializedAt: Date.now(),
      completedPuzzleScores: [],
    };
  }
  return state;
}

// ---------------------------------------------------------------------------
// Exported Functions
// ---------------------------------------------------------------------------

/** Get the full module state (for hydration / debugging). */
export function cmGetState(): CmState {
  return cmEnsureInit();
}

/** Reset all state to defaults. */
export function cmResetState(): void {
  state = null;
  cmEnsureInit();
}

// ---- Puzzle Generation ----

/** Get a puzzle of the given size (randomly seeded). */
export function cmGetPuzzle(size: CmPuzzleSize = 'medium'): CmPuzzle {
  return cmGenerateRandom(size);
}

/** Get today's daily puzzle (date-seeded). */
export function cmGetDailyPuzzle(): CmPuzzle {
  const s = cmEnsureInit();
  const seed = cmDateSeed();
  const rng = cmSeedRandom(seed);

  // Rotate through sizes each day of the week
  const sizes: CmPuzzleSize[] = ['mini', 'small', 'medium', 'large', 'expert', 'medium', 'small'];
  const dayIndex = new Date().getDay();
  const size = sizes[dayIndex % sizes.length];

  return cmGenerateCrossword(size, cmDifficultyForSize(size), rng);
}

/** Generate a random puzzle of the given size. */
export function cmGenerateRandom(size: CmPuzzleSize = 'medium'): CmPuzzle {
  const seed = Date.now() ^ (Math.random() * 0xffffff | 0);
  const rng = cmSeedRandom(seed);
  return cmGenerateCrossword(size, cmDifficultyForSize(size), rng);
}

// ---- Puzzle Lifecycle ----

/** Start a new puzzle of the given size and set it as active. */
export function cmStartPuzzle(size: CmPuzzleSize = 'medium'): CmPuzzle {
  const puzzle = cmGetPuzzle(size);
  puzzle.startTime = Date.now();
  const s = cmEnsureInit();
  s.activePuzzle = puzzle;
  return puzzle;
}

/** Complete the active puzzle: compute score, grade, update stats. */
export function cmCompletePuzzle(): { score: number; grade: CmGrade } | null {
  const s = cmEnsureInit();
  const puzzle = s.activePuzzle;
  if (!puzzle || puzzle.completedAt) return null;

  // Finalize timer
  if (puzzle.startTime) {
    puzzle.timeElapsed = Math.floor((Date.now() - puzzle.startTime) / 1000);
  }

  puzzle.completedAt = Date.now();

  const totalLetters = puzzle.placedWords.reduce((sum, w) => sum + w.word.length, 0);
  const score = cmCalculateScore(puzzle, s.stats.currentStreak);
  const grade = cmCalculateGrade(score, totalLetters);

  puzzle.score = score;
  puzzle.grade = grade;

  // Update stats
  s.stats.totalSolved++;
  s.stats.totalWordsFound += puzzle.placedWords.length;
  s.stats.totalLettersPlaced += totalLetters;
  s.stats.totalHintsUsed += puzzle.hintsUsed;
  s.stats.puzzlesBySize[puzzle.size]++;
  s.stats.grades[grade]++;

  // Best time
  const currentBest = s.stats.bestTimes[puzzle.size];
  if (currentBest === null || puzzle.timeElapsed < currentBest) {
    s.stats.bestTimes[puzzle.size] = puzzle.timeElapsed;
  }

  // Accuracy: ratio of correct first-time placements
  let correct = 0;
  let total = 0;
  for (let r = 0; r < puzzle.rows; r++) {
    for (let c = 0; c < puzzle.cols; c++) {
      const cell = puzzle.grid[r][c];
      if (!cell.isBlack) {
        total++;
        if (cell.userLetter === cell.letter) correct++;
      }
    }
  }
  s.stats.accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;

  // Streak
  const today = cmDateStr();
  if (s.stats.lastDailyDate === today) {
    s.stats.currentStreak++;
  }
  s.stats.bestStreak = Math.max(s.stats.bestStreak, s.stats.currentStreak);

  s.completedPuzzleScores.push(score);

  // Check achievements
  s.achievements = s.achievements.map(a => {
    switch (a.id) {
      case 'first_puzzle':
      case 'five_puzzles':
      case 'ten_puzzles':
      case 'twenty_five':
      case 'fifty_puzzles':
        return cmUpdateAchievement(a, s.stats.totalSolved);
      case 'no_hints':
        return puzzle.hintsUsed === 0 ? cmUpdateAchievement(a, 1) : a;
      case 'speed_demon':
        return (puzzle.size === 'medium' || puzzle.size === 'small') && puzzle.timeElapsed < 180
          ? cmUpdateAchievement(a, 1)
          : a;
      case 'streak_3':
        return cmUpdateAchievement(a, s.stats.currentStreak);
      case 'streak_7':
        return cmUpdateAchievement(a, s.stats.currentStreak);
      case 'streak_30':
        return cmUpdateAchievement(a, s.stats.currentStreak);
      case 'grade_s':
        return grade === 'S' ? cmUpdateAchievement(a, 1) : a;
      case 'all_sizes': {
        const sizesSolved = (Object.keys(s.stats.puzzlesBySize) as CmPuzzleSize[]).filter(
          sz => s.stats.puzzlesBySize[sz] > 0,
        ).length;
        return cmUpdateAchievement(a, sizesSolved);
      }
      case 'hundred_words':
        return cmUpdateAchievement(a, s.stats.totalWordsFound);
      case 'expert_done':
        return puzzle.size === 'expert' ? cmUpdateAchievement(a, 1) : a;
      case 'daily_first':
        return s.dailyCompletedDate === today ? cmUpdateAchievement(a, 1) : a;
      default:
        return a;
    }
  });

  return { score, grade };
}

/** Check whether a puzzle is currently active (in progress). */
export function cmIsPuzzleActive(): boolean {
  const s = cmEnsureInit();
  return s.activePuzzle !== null && s.activePuzzle.completedAt === null;
}

/** Get the size of the active puzzle, or null. */
export function cmGetActivePuzzleSize(): CmPuzzleSize | null {
  const s = cmEnsureInit();
  return s.activePuzzle?.size ?? null;
}

// ---- Word Checking & Placement ----

/** Check if a word at the given position matches the answer. */
export function cmCheckWord(row: number, col: number, word: string, direction: CmDirection): boolean {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return false;
  const grid = s.activePuzzle.grid;

  const dr = direction === 'across' ? 0 : 1;
  const dc = direction === 'across' ? 1 : 0;

  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    if (!cmInBounds(r, c, s.activePuzzle.rows, s.activePuzzle.cols)) return false;
    if (grid[r][c].isBlack) return false;
    if (grid[r][c].letter !== word[i].toUpperCase()) return false;
    if (grid[r][c].userLetter !== word[i].toUpperCase()) return false;
  }
  return true;
}

/** Place a user-entered word at the given grid position. */
export function cmPlaceWord(word: string, row: number, col: number, direction: CmDirection): boolean {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return false;
  const grid = s.activePuzzle.grid;

  const dr = direction === 'across' ? 0 : 1;
  const dc = direction === 'across' ? 1 : 0;
  const upper = word.toUpperCase();

  for (let i = 0; i < upper.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    if (!cmInBounds(r, c, s.activePuzzle.rows, s.activePuzzle.cols)) return false;
    if (grid[r][c].isBlack) return false;

    grid[r][c] = {
      ...grid[r][c],
      userLetter: upper[i],
      correct: upper[i] === grid[r][c].letter,
    };
  }
  return true;
}

// ---- Hints ----

/** Reveal the correct letter at (row, col). Uses a hint. */
export function cmRevealCell(row: number, col: number): string | null {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return null;
  const grid = s.activePuzzle.grid;
  if (!cmInBounds(row, col, s.activePuzzle.rows, s.activePuzzle.cols)) return null;
  if (grid[row][col].isBlack) return null;
  if (s.activePuzzle.hintsUsed >= s.activePuzzle.maxHints) return null;

  const cell = grid[row][col];
  grid[row][col] = {
    ...cell,
    revealed: true,
    userLetter: cell.letter,
    correct: true,
  };
  s.activePuzzle.hintsUsed++;
  s.stats.totalHintsUsed++;
  return cell.letter;
}

/** Reveal all letters of a specific word. Uses hints equal to word length. */
export function cmRevealWord(word: string): number {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return 0;
  const grid = s.activePuzzle.grid;
  let revealed = 0;
  const upper = word.toUpperCase();

  for (let r = 0; r < s.activePuzzle.rows; r++) {
    for (let c = 0; c < s.activePuzzle.cols; c++) {
      if (grid[r][c].isBlack) continue;
      if (grid[r][c].letter === upper[revealed] && !grid[r][c].revealed) {
        // Try to find the full word
        const result = cmFindWordInGrid(grid, upper, s.activePuzzle.rows, s.activePuzzle.cols);
        if (result) {
          const dr = result.direction === 'across' ? 0 : 1;
          const dc = result.direction === 'across' ? 1 : 0;
          let count = 0;
          for (let i = 0; i < upper.length; i++) {
            const wr = result.row + dr * i;
            const wc = result.col + dc * i;
            if (
              cmInBounds(wr, wc, s.activePuzzle.rows, s.activePuzzle.cols) &&
              !grid[wr][wc].isBlack &&
              !grid[wr][wc].revealed
            ) {
              grid[wr][wc] = {
                ...grid[wr][wc],
                revealed: true,
                userLetter: grid[wr][wc].letter,
                correct: true,
              };
              s.activePuzzle.hintsUsed++;
              s.stats.totalHintsUsed++;
              count++;
            }
          }
          revealed = count;
        }
        break;
      }
    }
    if (revealed > 0) break;
  }

  return revealed;
}

/** Check all placed letters for errors and return the count of incorrect cells. */
export function cmCheckErrors(): number {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return 0;
  const grid = s.activePuzzle.grid;
  let errors = 0;

  for (let r = 0; r < s.activePuzzle.rows; r++) {
    for (let c = 0; c < s.activePuzzle.cols; c++) {
      const cell = grid[r][c];
      if (cell.isBlack || cell.revealed) continue;
      if (cell.userLetter && cell.userLetter !== cell.letter) {
        errors++;
        // Mark as incorrect
        grid[r][c] = { ...cell, correct: false };
      }
    }
  }
  return errors;
}

/** Get a hint: reveals one random unrevealed incorrect cell. */
export function cmGetHint(): { row: number; col: number; letter: string } | null {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return null;
  const grid = s.activePuzzle.grid;
  const candidates: { row: number; col: number }[] = [];

  for (let r = 0; r < s.activePuzzle.rows; r++) {
    for (let c = 0; c < s.activePuzzle.cols; c++) {
      const cell = grid[r][c];
      if (!cell.isBlack && !cell.revealed && (cell.userLetter !== cell.letter || cell.userLetter === null)) {
        candidates.push({ row: r, col: c });
      }
    }
  }

  if (candidates.length === 0) return null;
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  const letter = cmRevealCell(pick.row, pick.col);
  return letter ? { ...pick, letter } : null;
}

/** Get the number of hints used in the active puzzle. */
export function cmGetHintsUsed(): number {
  const s = cmEnsureInit();
  return s.activePuzzle?.hintsUsed ?? 0;
}

/** Get the maximum hints available for the active puzzle. */
export function cmGetMaxHints(): number {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return 0;
  return s.activePuzzle.maxHints;
}

// ---- Scoring & Timer ----

/** Get the current computed score for the active puzzle. */
export function cmGetScore(): number {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return 0;
  const totalLetters = s.activePuzzle.placedWords.reduce((sum, w) => sum + w.word.length, 0);
  return cmCalculateScore(s.activePuzzle, s.stats.currentStreak);
}

/** Get the current grade for the active puzzle (may change until completion). */
export function cmGetGrade(): CmGrade | null {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return null;
  if (s.activePuzzle.grade) return s.activePuzzle.grade;
  const totalLetters = s.activePuzzle.placedWords.reduce((sum, w) => sum + w.word.length, 0);
  const score = cmGetScore();
  return cmCalculateGrade(score, totalLetters);
}

/** Get elapsed time in seconds for the active puzzle. */
export function cmGetTimer(): number {
  const s = cmEnsureInit();
  if (!s.activePuzzle || !s.activePuzzle.startTime) return 0;
  if (s.activePuzzle.completedAt) return s.activePuzzle.timeElapsed;
  return Math.floor((Date.now() - s.activePuzzle.startTime) / 1000);
}

/** Format seconds into MM:SS string. */
export function cmFormatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// ---- Clues ----

/** Get all clues for a given direction, or all if omitted. */
export function cmGetClues(direction?: CmDirection): CmClue[] {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return [];
  if (direction) {
    return s.activePuzzle.clues.filter(c => c.direction === direction);
  }
  return [...s.activePuzzle.clues];
}

/** Get a specific clue by number and direction. */
export function cmGetClue(number: number, direction: CmDirection): CmClue | null {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return null;
  return s.activePuzzle.clues.find(c => c.number === number && c.direction === direction) ?? null;
}

/** Count clues by direction. */
export function cmGetClueCount(direction?: CmDirection): { across: number; down: number } {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return { across: 0, down: 0 };
  const across = s.activePuzzle.clues.filter(c => c.direction === 'across').length;
  const down = s.activePuzzle.clues.filter(c => c.direction === 'down').length;
  return { across, down };
}

// ---- Grid ----

/** Get a deep copy of the current puzzle grid. */
export function cmGetGrid(): CmCell[][] {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return [];
  return s.activePuzzle.grid.map(row => row.map(cell => ({ ...cell })));
}

/** Get the grid dimensions { rows, cols }. */
export function cmGetGridSize(): { rows: number; cols: number } | null {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return null;
  return { rows: s.activePuzzle.rows, cols: s.activePuzzle.cols };
}

/** Get the coordinates of all black cells in the current puzzle. */
export function cmGetBlackCells(): { row: number; col: number }[] {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return [];
  const cells: { row: number; col: number }[] = [];
  for (let r = 0; r < s.activePuzzle.rows; r++) {
    for (let c = 0; c < s.activePuzzle.cols; c++) {
      if (s.activePuzzle.grid[r][c].isBlack) {
        cells.push({ row: r, col: c });
      }
    }
  }
  return cells;
}

/** Get the total number of white (letter) cells. */
export function cmGetWhiteCellCount(): number {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return 0;
  const { rows, cols, grid } = s.activePuzzle;
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r][c].isBlack) count++;
    }
  }
  return count;
}

// ---- Statistics ----

/** Get a copy of the current stats object. */
export function cmGetStats(): CmStats {
  const s = cmEnsureInit();
  return { ...s.stats };
}

/** Get best completion time for a given puzzle size (seconds). */
export function cmGetBestTime(size: CmPuzzleSize): number | null {
  const s = cmEnsureInit();
  return s.stats.bestTimes[size];
}

/** Get the current daily streak count. */
export function cmGetStreak(): number {
  const s = cmEnsureInit();
  return s.stats.currentStreak;
}

/** Get total puzzles solved. */
export function cmGetTotalSolved(): number {
  const s = cmEnsureInit();
  return s.stats.totalSolved;
}

/** Get total words found across all puzzles. */
export function cmGetTotalWordsFound(): number {
  const s = cmEnsureInit();
  return s.stats.totalWordsFound;
}

/** Get the overall accuracy percentage. */
export function cmGetAccuracy(): number {
  const s = cmEnsureInit();
  return s.stats.accuracy;
}

/** Get the best streak ever achieved. */
export function cmGetBestStreak(): number {
  const s = cmEnsureInit();
  return s.stats.bestStreak;
}

/** Get total hints used across all puzzles. */
export function cmGetTotalHintsUsed(): number {
  const s = cmEnsureInit();
  return s.stats.totalHintsUsed;
}

// ---- Achievements ----

/** Get the list of all achievements with progress. */
export function cmGetAchievements(): CmAchievement[] {
  const s = cmEnsureInit();
  return s.achievements.map(a => ({ ...a }));
}

/** Force a re-check of all achievements and return updated list. */
export function cmCheckAchievements(): CmAchievement[] {
  const s = cmEnsureInit();
  // Already checked during completion, but re-check in case of manual invocation
  s.achievements = s.achievements.map(a => {
    switch (a.id) {
      case 'first_puzzle':
      case 'five_puzzles':
      case 'ten_puzzles':
      case 'twenty_five':
      case 'fifty_puzzles':
        return cmUpdateAchievement(a, s.stats.totalSolved);
      case 'hundred_words':
        return cmUpdateAchievement(a, s.stats.totalWordsFound);
      case 'streak_3':
      case 'streak_7':
      case 'streak_30':
        return cmUpdateAchievement(a, s.stats.currentStreak);
      case 'all_sizes': {
        const sizesSolved = (Object.keys(s.stats.puzzlesBySize) as CmPuzzleSize[]).filter(
          sz => s.stats.puzzlesBySize[sz] > 0,
        ).length;
        return cmUpdateAchievement(a, sizesSolved);
      }
      default:
        return a;
    }
  });
  return s.achievements.map(a => ({ ...a }));
}

/** Count unlocked achievements. */
export function cmGetUnlockedAchievementCount(): number {
  const s = cmEnsureInit();
  return s.achievements.filter(a => a.unlocked).length;
}

// ---- Save / Load ----

/** Get all saved puzzles. */
export function cmGetSavedPuzzles(): CmSavedPuzzle[] {
  const s = cmEnsureInit();
  return s.savedPuzzles.map(sp => ({ ...sp }));
}

/** Save the current active puzzle. Overwrites oldest if at capacity. */
export function cmSavePuzzle(label?: string): CmSavedPuzzle | null {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return null;

  const saved: CmSavedPuzzle = {
    id: s.activePuzzle.id,
    puzzle: JSON.parse(JSON.stringify(s.activePuzzle)) as CmPuzzle,
    savedAt: Date.now(),
    label: label ?? `Puzzle ${s.savedPuzzles.length + 1}`,
  };

  // Check if same ID already saved
  const existingIdx = s.savedPuzzles.findIndex(sp => sp.id === saved.id);
  if (existingIdx >= 0) {
    s.savedPuzzles[existingIdx] = saved;
    return saved;
  }

  // Evict oldest if at max capacity
  if (s.savedPuzzles.length >= MAX_SAVED_PUZZLES) {
    s.savedPuzzles.sort((a, b) => a.savedAt - b.savedAt);
    s.savedPuzzles.shift();
  }

  s.savedPuzzles.push(saved);
  return saved;
}

/** Load a saved puzzle by its id and set it as active. */
export function cmLoadPuzzle(id: string): CmPuzzle | null {
  const s = cmEnsureInit();
  const found = s.savedPuzzles.find(sp => sp.id === id);
  if (!found) return null;

  const puzzle = JSON.parse(JSON.stringify(found.puzzle)) as CmPuzzle;
  // If the puzzle was in-progress and had a startTime, restart timer
  if (!puzzle.completedAt && puzzle.startTime) {
    puzzle.startTime = Date.now();
    puzzle.timeElapsed = 0;
  }
  s.activePuzzle = puzzle;
  return puzzle;
}

/** Delete a saved puzzle by id. */
export function cmDeleteSavedPuzzle(id: string): boolean {
  const s = cmEnsureInit();
  const idx = s.savedPuzzles.findIndex(sp => sp.id === id);
  if (idx < 0) return false;
  s.savedPuzzles.splice(idx, 1);
  return true;
}

// ---- Overview & Dashboard Cards ----

/** Get the crossword overview summary. */
export function cmGetCrosswordOverview(): CmOverview {
  const s = cmEnsureInit();
  const today = cmDateStr();

  const gradeCounts = s.stats.grades;
  const totalGraded = gradeCounts.S + gradeCounts.A + gradeCounts.B + gradeCounts.C + gradeCounts.D + gradeCounts.F;
  const gradeWeights: Record<CmGrade, number> = { S: 5, A: 4, B: 3, C: 2, D: 1, F: 0 };
  const weightedSum = (Object.entries(gradeCounts) as [CmGrade, number][])
    .reduce((sum, [g, count]) => sum + count * gradeWeights[g], 0);
  const averageGrade = totalGraded > 0
    ? weightedSum / totalGraded >= 4.5 ? 'S'
    : weightedSum / totalGraded >= 3.5 ? 'A'
    : weightedSum / totalGraded >= 2.5 ? 'B'
    : weightedSum / totalGraded >= 1.5 ? 'C'
    : weightedSum / totalGraded >= 0.5 ? 'D' : 'F'
    : '-';

  const recentActivity: { date: string; puzzles: number; score: number }[] = [];
  // Simulate recent 7 days of activity from completed scores
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const scoreIdx = s.completedPuzzleScores.length - 1 - (6 - i);
    recentActivity.push({
      date: dateStr,
      puzzles: scoreIdx >= 0 ? 1 : 0,
      score: scoreIdx >= 0 ? s.completedPuzzleScores[scoreIdx] : 0,
    });
  }

  return {
    totalPuzzles: s.stats.totalSolved,
    todayCompleted: s.dailyCompletedDate === today,
    currentStreak: s.stats.currentStreak,
    bestStreak: s.stats.bestStreak,
    averageGrade,
    totalScore: s.completedPuzzleScores.reduce((a, b) => a + b, 0),
    recentActivity,
  };
}

/** Get the full dashboard data. */
export function cmGetCrosswordDashboard(): CmDashboard {
  const s = cmEnsureInit();
  const today = cmDateStr();
  return {
    stats: { ...s.stats },
    activePuzzle: s.activePuzzle ? JSON.parse(JSON.stringify(s.activePuzzle)) : null,
    savedPuzzles: s.savedPuzzles.map(sp => ({ ...sp })),
    achievements: s.achievements.map(a => ({ ...a })),
    dailyAvailable: s.dailyCompletedDate !== today,
  };
}

/** Get a puzzle card summary for a given size (for selection UI). */
export function cmGetPuzzleCard(size: CmPuzzleSize): {
  size: CmPuzzleSize;
  label: string;
  rows: number;
  cols: number;
  difficulty: CmDifficulty;
  completed: number;
  bestTime: string | null;
  maxHints: number;
} {
  const s = cmEnsureInit();
  const { rows, cols } = PUZZLE_SIZES[size];
  const labels: Record<CmPuzzleSize, string> = {
    mini: 'Mini 5×5',
    small: 'Small 7×7',
    medium: 'Medium 10×10',
    large: 'Large 13×13',
    expert: 'Expert 15×15',
  };
  const best = s.stats.bestTimes[size];
  return {
    size,
    label: labels[size],
    rows,
    cols,
    difficulty: cmDifficultyForSize(size),
    completed: s.stats.puzzlesBySize[size],
    bestTime: best !== null ? cmFormatTime(best) : null,
    maxHints: MAX_HINTS_BY_SIZE[size],
  };
}

/** Get all puzzle cards. */
export function cmGetAllPuzzleCards(): ReturnType<typeof cmGetPuzzleCard>[] {
  return (Object.keys(PUZZLE_SIZES) as CmPuzzleSize[]).map(cmGetPuzzleCard);
}

/** Get a clue card for display (clue text with metadata). */
export function cmGetClueCard(
  number: number,
  direction: CmDirection,
): {
  number: number;
  direction: CmDirection;
  clue: string;
  length: number;
  difficulty: CmDifficulty;
  category: CmClueCategory;
  solved: boolean;
  row: number;
  col: number;
} | null {
  const clue = cmGetClue(number, direction);
  if (!clue) return null;

  const s = cmEnsureInit();
  let solved = false;
  if (s.activePuzzle) {
    const dr = direction === 'across' ? 0 : 1;
    const dc = direction === 'across' ? 1 : 0;
    solved = clue.answer.split('').every((ch, i) => {
      const r = clue.row + dr * i;
      const c = clue.col + dc * i;
      return cmInBounds(r, c, s.activePuzzle!.rows, s.activePuzzle!.cols) &&
        s.activePuzzle!.grid[r][c].userLetter === ch;
    });
  }

  return {
    number: clue.number,
    direction: clue.direction,
    clue: clue.clue,
    length: clue.length,
    difficulty: clue.difficulty,
    category: clue.category,
    solved,
    row: clue.row,
    col: clue.col,
  };
}

// ---- Daily Challenge Helpers ----

/** Mark today's daily puzzle as completed. */
export function cmMarkDailyComplete(): void {
  const s = cmEnsureInit();
  const today = cmDateStr();
  s.dailyCompletedDate = today;
  s.stats.lastDailyDate = today;
  // Streak logic: if last daily was yesterday, increment streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (s.stats.lastDailyDate === yesterdayStr || s.stats.currentStreak === 0) {
    s.stats.currentStreak++;
  } else if (s.stats.lastDailyDate !== today) {
    // Missed a day — reset streak
    s.stats.currentStreak = 1;
  }

  s.stats.bestStreak = Math.max(s.stats.bestStreak, s.stats.currentStreak);
}

/** Check if today's daily puzzle has been completed. */
export function cmIsDailyCompleted(): boolean {
  const s = cmEnsureInit();
  return s.dailyCompletedDate === cmDateStr();
}

/** Check if the daily challenge is available (not yet completed today). */
export function cmIsDailyAvailable(): boolean {
  return !cmIsDailyCompleted();
}

// ---- Utility / Validation ----

/** Find a word's placement in the grid. */
function cmFindWordInGrid(
  grid: CmCell[][],
  word: string,
  rows: number,
  cols: number,
): { row: number; col: number; direction: CmDirection } | null {
  const upper = word.toUpperCase();
  const len = upper.length;

  // Try across
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= cols - len; c++) {
      let match = true;
      for (let i = 0; i < len; i++) {
        if (grid[r][c + i].isBlack || grid[r][c + i].letter !== upper[i]) {
          match = false;
          break;
        }
      }
      if (match) return { row: r, col: c, direction: 'across' };
    }
  }

  // Try down
  for (let r = 0; r <= rows - len; r++) {
    for (let c = 0; c < cols; c++) {
      let match = true;
      for (let i = 0; i < len; i++) {
        if (grid[r + i][c].isBlack || grid[r + i][c].letter !== upper[i]) {
          match = false;
          break;
        }
      }
      if (match) return { row: r, col: c, direction: 'down' };
    }
  }

  return null;
}

/** Validate that the puzzle is fully and correctly filled. */
export function cmIsPuzzleComplete(): boolean {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return false;
  const grid = s.activePuzzle.grid;

  for (let r = 0; r < s.activePuzzle.rows; r++) {
    for (let c = 0; c < s.activePuzzle.cols; c++) {
      const cell = grid[r][c];
      if (cell.isBlack) continue;
      if (cell.userLetter !== cell.letter) return false;
    }
  }
  return true;
}

/** Get progress percentage (0–100) for the active puzzle. */
export function cmGetProgress(): number {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return 0;
  const grid = s.activePuzzle.grid;
  let total = 0;
  let filled = 0;

  for (let r = 0; r < s.activePuzzle.rows; r++) {
    for (let c = 0; c < s.activePuzzle.cols; c++) {
      if (grid[r][c].isBlack) continue;
      total++;
      if (grid[r][c].userLetter === grid[r][c].letter) filled++;
    }
  }

  return total > 0 ? Math.round((filled / total) * 100) : 0;
}

/** Get completion percentage for a specific clue. */
export function cmGetClueProgress(number: number, direction: CmDirection): number {
  const clue = cmGetClue(number, direction);
  if (!clue) return 0;
  const s = cmEnsureInit();
  if (!s.activePuzzle) return 0;
  const grid = s.activePuzzle.grid;
  const dr = direction === 'across' ? 0 : 1;
  const dc = direction === 'across' ? 1 : 0;

  let correct = 0;
  for (let i = 0; i < clue.length; i++) {
    const r = clue.row + dr * i;
    const c = clue.col + dc * i;
    if (
      cmInBounds(r, c, s.activePuzzle.rows, s.activePuzzle.cols) &&
      grid[r][c].userLetter === grid[r][c].letter
    ) {
      correct++;
    }
  }
  return Math.round((correct / clue.length) * 100);
}

/** Get the number of empty cells remaining in the active puzzle. */
export function cmGetRemainingCells(): number {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return 0;
  const grid = s.activePuzzle.grid;
  let remaining = 0;

  for (let r = 0; r < s.activePuzzle.rows; r++) {
    for (let c = 0; c < s.activePuzzle.cols; c++) {
      if (grid[r][c].isBlack) continue;
      if (grid[r][c].userLetter !== grid[r][c].letter) remaining++;
    }
  }
  return remaining;
}

/** Get all words that are fully solved (correctly filled) in the active puzzle. */
export function cmGetSolvedWords(): string[] {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return [];
  const solved: string[] = [];
  const grid = s.activePuzzle.grid;

  for (const pw of s.activePuzzle.placedWords) {
    const dr = pw.direction === 'across' ? 0 : 1;
    const dc = pw.direction === 'across' ? 1 : 0;
    let wordSolved = true;

    for (let i = 0; i < pw.word.length; i++) {
      const r = pw.row + dr * i;
      const c = pw.col + dc * i;
      if (grid[r][c].userLetter !== pw.word[i]) {
        wordSolved = false;
        break;
      }
    }
    if (wordSolved) solved.push(pw.word);
  }
  return solved;
}

/** Get the count of correctly placed letters vs total letters. */
export function cmGetLetterAccuracy(): { correct: number; total: number; percentage: number } {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return { correct: 0, total: 0, percentage: 0 };
  const grid = s.activePuzzle.grid;
  let correct = 0;
  let total = 0;

  for (let r = 0; r < s.activePuzzle.rows; r++) {
    for (let c = 0; c < s.activePuzzle.cols; c++) {
      if (grid[r][c].isBlack) continue;
      total++;
      if (grid[r][c].userLetter === grid[r][c].letter) correct++;
    }
  }
  return {
    correct,
    total,
    percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
  };
}

/** Get the grid as a printable string (for debugging). */
export function cmGridToString(): string {
  const s = cmEnsureInit();
  if (!s.activePuzzle) return '';
  const grid = s.activePuzzle.grid;
  const lines: string[] = [];

  for (let r = 0; r < s.activePuzzle.rows; r++) {
    let line = '';
    for (let c = 0; c < s.activePuzzle.cols; c++) {
      const cell = grid[r][c];
      if (cell.isBlack) {
        line += '## ';
      } else {
        const ch = cell.userLetter ?? '_';
        line += `${ch}  `;
      }
    }
    lines.push(line.trimEnd());
  }
  return lines.join('\n');
}
