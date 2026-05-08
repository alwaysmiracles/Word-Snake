// ============================================================================
// Word Connect Puzzle Wire — Word Snake Game
// Storage key: ws_word_connect_wire
// Standalone exported functions for word-connect puzzle mechanics
// ============================================================================

const STORAGE_KEY = 'ws_word_connect_wire';

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GridCell {
  row: number;
  col: number;
  letter: string;
  revealed: boolean;
}

export interface FoundWord {
  word: string;
  path: [number, number][];
  score: number;
  timestamp: number;
}

export interface ConnectGame {
  grid: string[][];
  size: number;
  difficulty: Difficulty;
  foundWords: FoundWord[];
  unfoundWords: string[];
  score: number;
  combo: number;
  startTime: number;
  hintsRemaining: number;
  completed: boolean;
  hintRevealedLetter: string | null;
  shuffleCount: number;
  targetWords: string[];
}

export interface ConnectStats {
  totalGamesPlayed: number;
  totalWordsFound: number;
  longestWordFound: string;
  bestScore: number;
  difficultyStats: Record<Difficulty, {
    gamesPlayed: number;
    bestScore: number;
    averageWords: number;
    totalWordsFound: number;
  }>;
  recentGames: GameResult[];
  wordFrequency: Record<string, number>;
  dailyStreak: number;
  lastDailyDate: string;
  dailyCompleted: string[];
}

export interface GameResult {
  date: string;
  difficulty: Difficulty;
  score: number;
  wordsFound: number;
  totalWords: number;
  timeElapsed: number;
  longestWord: string;
}

// ---------------------------------------------------------------------------
// Built-in Word List — 200+ common English words (3-6 letters)
// ---------------------------------------------------------------------------

const WORDS_3 = [
  'ACE','ACT','ADD','AGE','AIM','AIR','ALL','AND','ANT','ANY','APE','ARC','ARE','ARM',
  'ART','ASH','ATE','AWE','AXE','BAD','BAG','BAN','BAR','BAT','BAY','BED','BET','BIG',
  'BIT','BOW','BOX','BOY','BUD','BUG','BUN','BUS','BUT','BUY','CAB','CAN','CAP','CAR',
  'CAT','COP','COW','CRY','CUB','CUP','CUT','DAD','DAM','DAY','DEN','DEW','DID','DIG',
  'DIM','DIP','DOG','DOT','DRY','DUB','DUE','DUG','DYE','EAR','EAT','EEL','EGG','ELM',
  'EMU','END','ERA','EVE','EWE','EYE','FAN','FAR','FAT','FED','FEW','FIG','FIN','FIR',
  'FIT','FIX','FLY','FOE','FOG','FOR','FOX','FRY','FUN','FUR','GAP','GAS','GEM','GET',
  'GIN','GOD','GOT','GUM','GUN','GUT','GUY','GYM','HAD','HAM','HAS','HAT','HAY','HEN',
  'HER','HID','HIM','HIP','HIS','HIT','HOG','HOP','HOT','HOW','HUB','HUE','HUG','HUM',
  'HUT','ICE','ICY','ILL','INK','INN','ION','IRE','JAB','JAM','JAR','JAW','JAY','JET',
  'JIG','JOB','JOG','JOY','JUG','KEY','KID','KIN','KIT','LAB','LAD','LAY','LED','LEG',
  'LID','LIE','LIP','LIT','LOG','LOT','LOW','MAD','MAN','MAP','MAT','MAX','MAY','MEN',
  'MET','MID','MIX','MOB','MOP','MOW','MUD','MUG','NAP','NET','NEW','NIL','NIP','NOD',
  'NOR','NOT','NOW','NUN','NUT','OAK','OAR','OAT','ODD','ODE','OIL','OLD','ONE','OPT',
  'ORB','ORE','OUR','OUT','OWE','OWL','OWN','PAD','PAN','PAR','PAT','PAW','PAY','PEA',
  'PEN','PEG','PER','PET','PIE','PIG','PIN','PIT','PLY','POD','POP','POT','PUB','PUG',
  'PUN','PUP','PUT','RAG','RAM','RAN','RAP','RAT','RAW','RAY','RED','RIB','RID','RIG',
  'RIM','RIP','ROB','ROD','ROT','ROW','RUB','RUG','RUM','RUN','RUT','RYE','SAD','SAP',
  'SAT','SAW','SAY','SEA','SET','SHE','SHY','SIN','SIP','SIR','SIT','SIX','SKI','SKY',
  'SLY','SOB','SON','SOP','SOW','SOY','SPY','STY','SUB','SUM','SUN','TAB','TAG','TAN',
  'TAP','TAR','TAX','TEA','TEN','THE','TIE','TIN','TIP','TOE','TON','TOO','TOP','TOT',
  'TOW','TOY','TRY','TUB','TUG','TWO','URN','USE','VAN','VAT','VET','VIA','VIM','VOW',
  'WAD','WAR','WAS','WAX','WAY','WEB','WED','WET','WHO','WHY','WIG','WIN','WIT','WOE',
  'WOK','WON','WOW','YAK','YAM','YAP','YES','YET','YOU','ZAP','ZEN','ZIP','ZOO',
];

const WORDS_4 = [
  'ABLE','ARCH','ARMY','AUNT','BACK','BAKE','BAND','BANK','BARE','BARK','BARN','BASE',
  'BATH','BEAD','BEAM','BEAN','BEAR','BEAT','BEEF','BEEN','BEER','BELL','BELT','BEND',
  'BEST','BIKE','BILL','BIND','BIRD','BITE','BLOW','BLUE','BOAT','BODY','BOLD','BOLT',
  'BOMB','BOND','BONE','BOOK','BOOT','BORE','BORN','BOSS','BOTH','BOWL','BULK','BURN',
  'BUSY','CAFE','CAGE','CAKE','CALF','CALL','CALM','CAME','CAMP','CAPE','CARD','CARE',
  'CART','CASE','CASH','CAST','CAVE','CELL','CHAT','CHIP','CHOP','CITY','CLAD','CLAM',
  'CLAN','CLAP','CLAY','CLIP','CLOCK','CLUB','CLUE','COAL','COAT','CODE','COIL','COIN',
  'COLD','COLE','COLT','COMB','COME','CONE','COOK','COOL','COPE','COPY','CORD','CORE',
  'CORN','COST','CREW','CROP','CROW','CUBE','CULT','CURB','CURE','CURL','CUTE','DALE',
  'DAME','DAMP','DARE','DARK','DARN','DART','DASH','DATA','DAWN','DEAL','DEAR','DEBT',
  'DECK','DEED','DEEM','DEEP','DEER','DEMO','DENY','DESK','DIAL','DICE','DIET','DIME',
  'DIRT','DISC','DISH','DISK','DOCK','DOES','DOLL','DOME','DONE','DOOM','DOOR','DOSE',
  'DOWN','DRAG','DRAW','DREW','DROP','DRUM','DUAL','DUCK','DUEL','DUKE','DULL','DUMP',
  'DUNE','DUST','DUTY','EACH','EARN','EASE','EAST','EASY','EDGE','EDIT','ELSE','EMIT',
  'EPIC','EURO','EVEN','EVER','EVIL','EXAM','EXEC','EXIT','FACE','FACT','FADE','FAIL',
  'FAIR','FAKE','FALL','FAME','FANG','FARE','FARM','FAST','FATE','FAWN','FEAR','FEAT',
  'FEED','FEEL','FELL','FELT','FERN','FILE','FILL','FILM','FIND','FINE','FIRE','FIRM',
  'FISH','FIST','FLAG','FLAP','FLAT','FLAW','FLEA','FLED','FLEW','FLEX','FLIP','FLOW',
  'FOAM','FOLD','FOLK','FOND','FONT','FOOD','FOOL','FOOT','FORD','FORE','FORK','FORM',
  'FORT','FOUL','FOUR','FREE','FROG','FROM','FUEL','FULL','FUME','FUND','FURY','FUSE',
  'GAIN','GALE','GAME','GANG','GAPE','GARB','GATE','GAVE','GAZE','GEAR','GENE','GIFT',
  'GIRL','GIVE','GLAD','GLOW','GLUE','GOAT','GOES','GOLD','GOLF','GONE','GOOD','GORE',
  'GRAB','GRAY','GREW','GRID','GRIM','GRIN','GRIP','GRIT','GROW','GULF','GUST','HACK',
  'HAIL','HAIR','HALE','HALF','HALL','HALT','HAND','HANG','HARD','HARE','HARM','HARP',
  'HATE','HAUL','HAVE','HAWK','HAZE','HAZY','HEAD','HEAL','HEAP','HEAR','HEAT','HEED',
  'HEEL','HELD','HELL','HELM','HELP','HERD','HERE','HERO','HIGH','HIKE','HILL','HILT',
  'HIND','HINT','HIRE','HOLD','HOLE','HOME','HOOK','HOPE','HORN','HOST','HOUR','HOWL',
  'HUGE','HULL','HUMP','HUNG','HUNT','HURL','HURT','HUSK','HYMN','ICON','IDEA','IDLE',
  'INTO','IRON','ISLE','ITEM','JACK','JADE','JAIL','JAZZ','JEAN','JOKE','JOLT','JUMP',
  'JUNE','JURY','JUST','KEEN','KEEP','KELP','KEPT','KICK','KILL','KIND','KING','KISS',
  'KNEE','KNEW','KNIT','KNOB','KNOT','KNOW','LACE','LACK','LAID','LAKE','LAMB','LAME',
  'LAMP','LAND','LANE','LAST','LATE','LAWN','LEAD','LEAF','LEAK','LEAN','LEAP','LEFT',
  'LEND','LENS','LESS','LIAR','LICK','LIFE','LIFT','LIKE','LIMB','LIME','LIMP','LINE',
  'LINK','LION','LIST','LIVE','LOAD','LOAN','LOCK','LOFT','LONE','LONG','LOOK','LOOP',
  'LORD','LORE','LOSE','LOSS','LOST','LOUD','LOVE','LUCK','LUMP','LUNG','LURE','LURK',
  'MADE','MAID','MAIL','MAIN','MAKE','MALE','MALL','MALT','MANE','MANY','MARE','MARK',
  'MASK','MASS','MAST','MATE','MAZE','MEAL','MEAN','MEAT','MEET','MELD','MELT','MEMO',
  'MEND','MENU','MERE','MESH','MILD','MILE','MILK','MILL','MIME','MIND','MINE','MINT',
  'MISS','MOAT','MOCK','MODE','MOLD','MOLE','MOOD','MOON','MORE','MOSS','MOST','MOTH',
  'MOVE','MUCH','MULE','MUSE','MUSH','MUST','MYTH','NAIL','NAME','NAVY','NEAR','NEAT',
  'NECK','NEED','NEST','NEWS','NEXT','NICE','NINE','NODE','NONE','NOON','NORM','NOSE',
  'NOTE','NOUN','NUDE','NULL','NUMB','NUTS','OATH','OBEY','ODDS','OGRE','OINK','OKAY',
  'ONCE','ONLY','ONTO','OPEN','ORAL','OURS','OVAL','OVEN','OVER','PACE','PACK','PAGE',
  'PAID','PAIL','PAIN','PAIR','PALE','PALM','PANE','PARK','PART','PASS','PAST','PATH',
  'PAVE','PEAK','PEAR','PEAT','PEEL','PEER','PERK','PEST','PICK','PIER','PIKE','PILE',
  'PILL','PINE','PINK','PIPE','PLAN','PLAY','PLEA','PLOD','PLOT','PLOW','PLOY','PLUG',
  'PLUM','PLUS','POCK','POEM','POET','POLE','POLL','POLO','POMP','POND','PONY','POOL',
  'POOR','POPE','PORE','PORK','PORT','POSE','POST','POUR','PRAY','PREY','PROP','PROW',
  'PULL','PULP','PUMP','PURE','PUSH','RACE','RACK','RAFT','RAGE','RAID','RAIL','RAIN',
  'RAKE','RAMP','RANG','RANK','RARE','RASH','RATE','RAVE','READ','REAL','REAM','REAP',
  'REAR','REEF','REEL','REIN','RELY','RENT','REST','RICH','RIDE','RIFE','RIFT','RILE',
  'RILL','RIND','RING','RIOT','RISE','RISK','RITE','ROAD','ROAM','ROAR','ROBE','ROCK',
  'RODE','ROLE','ROLL','ROOF','ROOM','ROOT','ROPE','ROSE','ROSY','ROUT','ROVE','RUDE',
  'RUIN','RULE','RUMP','RUNG','RUSH','RUST','SACK','SAFE','SAGE','SAID','SAIL','SAKE',
  'SALE','SALT','SAME','SAND','SANE','SANG','SANK','SASH','SAVE','SCAM','SCAN','SCAR',
  'SEAL','SEAM','SEAR','SEAT','SECT','SEED','SEEK','SEEM','SEEN','SELF','SELL','SEMI',
  'SEND','SENT','SEPT','SHED','SHIN','SHIP','SHOE','SHOO','SHOP','SHOT','SHOW','SHUT',
  'SICK','SIDE','SIFT','SIGH','SIGN','SILK','SILL','SILT','SING','SINK','SIRE','SITE',
  'SIZE','SKIP','SLAB','SLAM','SLAP','SLAT','SLAW','SLAY','SLED','SLEW','SLID','SLIM',
  'SLIP','SLIT','SLOB','SLOP','SLOT','SLOW','SLUG','SLUM','SLUR','SMOG','SNAP','SNAG',
  'SNIP','SNOB','SNOW','SNUB','SNUG','SOAK','SOAP','SOAR','SOCK','SODA','SOFA','SOFT',
  'SOIL','SOLD','SOLE','SOME','SONG','SOON','SOOT','SORE','SORT','SOUL','SOUR','SPAN',
  'SPAR','SPEC','SPED','SPIN','SPIT','SPOT','SPRY','SPUD','SPUR','STAB','STAG','STAR',
  'STAY','STEM','STEP','STEW','STIR','STOP','STUB','STUD','STUN','SUCH','SUIT','SULK',
  'SUNG','SUNK','SURE','SURF','SWAP','SWIM','TAIL','TAKE','TALE','TALK','TALL','TAME',
  'TANG','TANK','TAPE','TASK','TAXI','TEAM','TEAR','TEEN','TELL','TEMP','TEND','TENT',
  'TERM','TEST','TEXT','THAN','THAT','THEM','THEN','THEY','THIN','THIS','THUS','TICK',
  'TIDE','TIDY','TIED','TIER','TILE','TILL','TILT','TIME','TINY','TIRE','TOAD','TOIL',
  'TOLD','TOLL','TOMB','TONE','TOOK','TOOL','TOPS','TORE','TORN','TOUR','TOWN','TRAP',
  'TRAY','TREE','TREK','TRIM','TRIO','TRIP','TROD','TROT','TRUE','TUBE','TUCK','TUFT',
  'TUNA','TUNE','TURN','TUSK','TWIN','TYPE','UGLY','UNDO','UNIT','UPON','URGE','USED',
  'USER','VAIN','VALE','VANE','VARY','VASE','VAST','VEIL','VEIN','VENT','VERB','VERY',
  'VEST','VETO','VIAL','VICE','VIEW','VINE','VOID','VOLT','VOTE','WADE','WAGE','WAIT',
  'WAKE','WALK','WALL','WAND','WANT','WARD','WARM','WARN','WARP','WART','WARY','WASH',
  'WASP','WAVE','WAVY','WAXY','WEAK','WEAN','WEAR','WEED','WEEK','WEEP','WELD','WELL',
  'WENT','WEPT','WERE','WEST','WHAT','WHEN','WHIG','WHIM','WHIP','WHOM','WICK','WIDE',
  'WIFE','WILD','WILL','WILT','WILY','WIMP','WIND','WINE','WING','WINK','WIPE','WIRE',
  'WISE','WISH','WISP','WITH','WOKE','WOLF','WOMB','WOOD','WOOL','WORD','WORE','WORK',
  'WORM','WORN','WOVE','WRAP','WREN','WRIT','YANK','YARD','YARN','YEAR','YELL','ZERO',
  'ZONE','ZOOM',
];

const WORDS_5 = [
  'ABOUT','ABOVE','ABUSE','ACUTE','ADMIT','ADOPT','ADULT','AFTER','AGAIN','AGENT',
  'AGREE','AHEAD','ALARM','ALBUM','ALIEN','ALIGN','ALIKE','ALIVE','ALLEY','ALLOW',
  'ALONE','ALONG','ALTER','AMONG','AMPLE','ANGEL','ANGER','ANGLE','ANGRY','ANIME',
  'ANKLE','APART','APPLE','APPLY','ARENA','ARGUE','ARISE','ARMOR','ARRAY','ASIDE',
  'ASSET','ATLAS','ATTIC','AUDIO','AUDIT','AVOID','AWAKE','AWARD','AWARE','BADGE',
  'BASIC','BASIN','BASIS','BEACH','BEARD','BEAST','BEGIN','BEING','BELOW','BENCH',
  'BERRY','BLACK','BLADE','BLAME','BLAND','BLANK','BLAST','BLAZE','BLEED','BLEND',
  'BLIND','BLISS','BLOCK','BLOOD','BLOOM','BLOWN','BLUES','BLUFF','BLUNT','BOARD',
  'BOAST','BONUS','BOOST','BOOTH','BOUND','BOXER','BRAIN','BRAND','BRAVE','BREAD',
  'BREAK','BREED','BRICK','BRIDE','BRIEF','BRING','BROAD','BROKE','BROOK','BROWN',
  'BRUSH','BUILD','BUNCH','BURST','BUYER','CABIN','CABLE','CAMEL','CANDY','CARGO',
  'CARRY','CATCH','CAUSE','CEDAR','CHAIN','CHAIR','CHALK','CHARM','CHART','CHASE',
  'CHEAP','CHECK','CHEEK','CHEER','CHESS','CHEST','CHIEF','CHILD','CHILL','CHINA',
  'CHUNK','CIVIC','CIVIL','CLAIM','CLASS','CLEAN','CLEAR','CLERK','CLICK','CLIFF',
  'CLIMB','CLING','CLOCK','CLONE','CLOSE','CLOTH','CLOUD','CLOWN','COACH','COAST',
  'COLOR','COMET','COMIC','CORAL','COUNT','COURT','COVER','CRACK','CRAFT','CRANE',
  'CRASH','CRAZY','CREAM','CREEK','CREST','CRIME','CROSS','CROWD','CROWN','CRUDE',
  'CRUSH','CURVE','CYCLE','DAILY','DANCE','DEATH','DEBUT','DECAY','DECOR','DELAY',
  'DELTA','DEMON','DENSE','DEPTH','DERBY','DEVIL','DIARY','DIGIT','DIRTY','DITCH',
  'DOZEN','DRAMA','DRANK','DRAPE','DRAWN','DREAM','DRESS','DRIED','DRIFT','DRILL',
  'DRINK','DRIVE','DROPS','DROVE','DRUNK','DWELL','EAGER','EARLY','EARTH','EIGHT',
  'ELDER','ELECT','ELITE','EMBER','EMPTY','ENEMY','ENJOY','ENTER','ENTRY','EQUAL',
  'ERROR','EVENT','EVERY','EXACT','EXILE','EXIST','EXTRA','FAINT','FAITH','FALSE',
  'FANCY','FATAL','FAULT','FEAST','FERRY','FEVER','FIBER','FIELD','FIFTH','FIFTY',
  'FIGHT','FINAL','FLAME','FLASH','FLESH','FLOAT','FLOCK','FLOOD','FLOOR','FLORA',
  'FLOUR','FLUID','FLUSH','FLUTE','FOCAL','FOCUS','FORCE','FORGE','FORTH','FORUM',
  'FOUND','FRAME','FRANK','FRAUD','FRESH','FRONT','FROST','FROZE','FRUIT','FUNGI',
  'GHOST','GIANT','GIVEN','GLARE','GLASS','GLEAM','GLOBE','GLOOM','GLORY','GLOSS',
  'GLOVE','GOING','GRACE','GRADE','GRAIN','GRAND','GRANT','GRAPE','GRASP','GRASS',
  'GRAVE','GREAT','GREEN','GREET','GRIEF','GRILL','GRIND','GROAN','GROOM','GROSS',
  'GROUP','GROVE','GROWL','GUARD','GUESS','GUEST','GUIDE','GUILD','GUILT','HABIT',
  'HAPPY','HARDY','HARSH','HASTE','HAUNT','HAVEN','HEART','HEAVY','HEDGE','HELLO',
  'HENCE','HOBBY','HONOR','HORSE','HOTEL','HOUSE','HUMAN','HUMOR','HURRY','IDEAL',
  'IMAGE','IMPLY','INDEX','INNER','INPUT','IRONY','ISSUE','IVORY','JEWEL','JOINT',
  'JUDGE','JUICE','KARMA','KNIFE','KNOCK','KNOWN','LABEL','LARGE','LASER','LATCH',
  'LATER','LAUGH','LAYER','LEARN','LEASE','LEAST','LEAVE','LEGAL','LEVEL','LIGHT',
  'LIMIT','LINEN','LIVER','LOCAL','LODGE','LOGIC','LONELY','LOOSE','LOVER','LOWER',
  'LOYAL','LUCKY','LUNAR','LUNCH','MAGIC','MAJOR','MAKER','MANOR','MAPLE','MARCH',
  'MARSH','MATCH','MAYOR','MEDIA','MERCY','MERGE','MERIT','METAL','METER','MIGHT',
  'MINOR','MINUS','MIXER','MODAL','MODEL','MONEY','MONTH','MORAL','MOUNT','MOUSE',
  'MOUTH','MOVIE','MUSIC','NAIVE','NERVE','NEVER','NIGHT','NOBLE','NOISE','NORTH',
  'NOTED','NOVEL','NURSE','OCEAN','OFFER','OFTEN','OLIVE','ONSET','OPERA','ORBIT',
  'ORDER','OTHER','OUTER','OWNER','OXIDE','OZONE','PAINT','PANEL','PANIC','PAPER',
  'PATCH','PAUSE','PEACE','PENNY','PHASE','PHONE','PHOTO','PIANO','PIECE','PILOT',
  'PITCH','PIXEL','PLACE','PLAIN','PLANE','PLANT','PLATE','PLAZA','PLEAD','PLUMB',
  'PLUME','PLUMP','PLUNGE','POINT','POUND','POWER','PRESS','PRICE','PRIDE','PRIME',
  'PRINT','PRIOR','PRIZE','PROBE','PRONE','PROOF','PROSE','PROUD','PROVE','PRUNE',
  'PSALM','PULSE','PUPIL','PURSE','QUEEN','QUERY','QUEST','QUEUE','QUICK','QUIET',
  'QUITE','QUOTA','QUOTE','RADAR','RADIO','RALLY','RANCH','RANGE','RAPID','RATIO',
  'REACH','REACT','READY','REALM','REBEL','REIGN','RELAX','REPLY','RIDER','RIDGE',
  'RIFLE','RIGHT','RIGID','RISKY','RIVAL','RIVER','ROBIN','ROBOT','ROCKY','ROMAN',
  'ROUGE','ROUGH','ROUND','ROUTE','ROYAL','RULER','RURAL','SAINT','SALAD','SALON',
  'SANDY','SAUCE','SAVOR','SCALE','SCARE','SCENE','SCENT','SCOPE','SCORE','SCOUT',
  'SCREW','SEDAN','SENSE','SERVE','SETUP','SEVEN','SHADE','SHAFT','SHAKE','SHALL',
  'SHAME','SHAPE','SHARE','SHARK','SHARP','SHEER','SHELL','SHIFT','SHINE','SHIRT',
  'SHOCK','SHORE','SHORT','SHOUT','SIGHT','SINCE','SIXTH','SIXTY','SKATE','SKULL',
  'SLATE','SLAVE','SLEEP','SLICE','SLIDE','SLOPE','SMALL','SMART','SMELL','SMILE',
  'SMOKE','SNAKE','SOLAR','SOLID','SOLVE','SORRY','SOUND','SOUTH','SPACE','SPARE',
  'SPARK','SPEAK','SPEAR','SPEED','SPELL','SPEND','SPENT','SPICE','SPINE','SPOKE',
  'SPOON','SPORT','SPRAY','SQUAD','STACK','STAFF','STAGE','STAIN','STAIR','STAKE',
  'STALE','STALL','STAMP','STAND','STARE','STARK','START','STATE','STAYS','STEAK',
  'STEAL','STEAM','STEEL','STEEP','STEER','STERN','STICK','STIFF','STILL','STOCK',
  'STOKE','STOLE','STONE','STOOD','STOOL','STORE','STORM','STORY','STOUT','STOVE',
  'STRAP','STRAW','STRAY','STRIP','STUCK','STUDY','STUFF','STUMP','STYLE','SUGAR',
  'SUITE','SUPER','SURGE','SWAMP','SWEAR','SWEEP','SWEET','SWEPT','SWIFT','SWING',
  'SWORD','SWORE','SWORN','SWUNG','TABLE','TASTE','TEACH','TEETH','TEMPO','THEME',
  'THICK','THIEF','THING','THINK','THIRD','THORN','THOSE','THREE','THREW','THROW',
  'THUMB','TIGER','TIGHT','TIMER','TIRED','TITLE','TODAY','TOKEN','TOPIC','TOTAL',
  'TOUCH','TOUGH','TOWEL','TOWER','TOXIC','TRACE','TRACK','TRADE','TRAIL','TRAIN',
  'TRAIT','TRASH','TREAT','TREND','TRIAL','TRIBE','TRICK','TROOP','TRUCK','TRULY',
  'TRUMP','TRUNK','TRUST','TRUTH','TUMOR','TUNED','TWICE','TWIST','ULTRA','UNCLE',
  'UNDER','UNION','UNITE','UNITY','UNTIL','UPPER','UPSET','URBAN','USAGE','USUAL',
  'UTTER','VALID','VALUE','VAPOR','VAULT','VERSE','VIDEO','VIGOR','VIRAL','VIRUS',
  'VISIT','VISTA','VITAL','VIVID','VOCAL','VOICE','VOTER','WASTE','WATCH','WATER',
  'WEARY','WEAVE','WEDGE','WEIGH','WEIRD','WHEAT','WHEEL','WHERE','WHICH','WHILE',
  'WHITE','WHOLE','WHOSE','WIDER','WOMAN','WORLD','WORRY','WORSE','WORST','WORTH',
  'WOULD','WOUND','WRIST','WRITE','WRONG','WROTE','YACHT','YIELD','YOUNG','YOUTH',
  'ZEALOT',
];

const WORDS_6 = [
  'ABSORB','ACCENT','ACCESS','ACCORD','ACTION','ACTIVE','ADJUST','ADMIRE','ADVENT','ADVISE',
  'AFFIRM','AFFORD','AGENCY','AGENDA','ALUMNI','AMOUNT','ANCHOR','ANNUAL','ANYONE','ANYWAY',
  'APPEAL','ARCADE','ARRIVE','ARTIST','ASSERT','ASSESS','ASSIGN','ASSIST','ASSUME','ATTACH',
  'ATTACK','ATTEND','AUGUST','BEHALF','BEYOND','BISHOP','BORDER','BOTTLE','BOUNCE','BREATH',
  'BRIDGE','BRIGHT','BROKEN','BRONZE','BUDGET','BURDEN','BUREAU','CAMERA','CANCEL','CARBON',
  'CARPET','CASTLE','CASUAL','CAUGHT','CENTER','CHANGE','CHAOS','CHOICE','CHOOSE','CHURCH',
  'CIRCLE','CLAUSE','CLIENT','CLOSED','CLOSET','COFFEE','COLONY','COLUMN','COMBAT','COMEDY',
  'COMMIT','COMMON','COMPLY','CONVEY','COOKIE','COPPER','CORNER','COSTLY','COTTON','COUNTY',
  'COUPLE','COURSE','COUSIN','CREATE','CREDIT','CRISIS','CUSTOM','DAMAGE','DANGER','DEADLY',
  'DEBATE','DECADE','DECENT','DEFECT','DEMAND','DENIAL','DEPART','DEPEND','DEPLOY','DEPUTY',
  'DESERT','DESIGN','DESIRE','DETAIL','DETECT','DEVICE','DEVOTE','DIFFER','DIGEST','DINNER',
  'DIRECT','DIVIDE','DOMAIN','DONATE','DOUBLE','DRIVER','DURING','EASILY','EDITOR','EFFORT',
  'ELEVEN','EMERGE','EMPIRE','EMPLOY','ENABLE','ENDING','ENERGY','ENGAGE','ENGINE','ENOUGH',
  'ENSURE','ENTIRE','ENTITY','EQUITY','ESCAPE','ESTATE','ETHNIC','EVOLVE','EXCEED','EXCEPT',
  'EXCITE','EXCUSE','EXEMPT','EXHALE','EXPAND','EXPECT','EXPERT','EXPORT','EXPOSE','EXTEND',
  'EXTENT','FABRIC','FACIAL','FACTOR','FAMILY','FAMOUS','FARMER','FATHER','FAUCET','FELLOW',
  'FERRET','FIERCE','FIGURE','FILTER','FINALE','FINGER','FINISH','FISCAL','FLAVOR','FLIGHT',
  'FLOWER','FLYING','FOLLOW','FORBID','FORCED','FOREST','FORGET','FORMAL','FORMAT','FORMER',
  'FOSSIL','FOSTER','FREEZE','FRENCH','FRENZY','FRIEND','FROZEN','FULFIL','FUTURE','GALAXY',
  'GARDEN','GARLIC','GATHER','GENDER','GENTLE','GERMAN','GIFTED','GLOBAL','GOLDEN','GOVERN',
  'GRAVEL','GROWTH','GUILTY','GUITAR','HANDLE','HAPPEN','HARBOR','HARDLY','HEALTH','HEAVEN',
  'HEIGHT','HIDDEN','HIGHLY','HONEST','HORROR','HOSTED','HUNGER','HUNTER','IGNORE','IMMUNE',
  'IMPACT','IMPORT','IMPOSE','INCHES','INCOME','INDEED','INDOOR','INFANT','INFORM','INJURY',
  'INLAND','INSECT','INSERT','INSIDE','INSIST','INSULT','INTACT','INTEND','INTENT','INVEST',
  'INVITE','INWARD','ISLAND','ITSELF','JACKET','JERSEY','JUNGLE','JUNIOR','KERNEL','KIDNEY',
  'KNIGHT','LADDER','LANDED','LATELY','LAUNCH','LAWYER','LAYOUT','LEADER','LEAGUE','LEGEND',
  'LENDER','LENGTH','LESSON','LETTER','LIFTED','LIKELY','LINEAR','LINGER','LIQUID','LISTEN',
  'LITTLE','LIVELY','LIVING','LOCKER','LONELY','LOOSEN','LOVELY','LUMBER','LUXURY','MAINLY',
  'MANAGE','MANNER','MANUAL','MARBLE','MARGIN','MARINE','MARKET','MASTER','MATTER','MEADOW',
  'MEDIUM','MEMBER','MEMOIR','MEMORY','MENTAL','MENTOR','METHOD','MIDDLE','MIGHTY','MILLER',
  'MIRROR','MOBILE','MODERN','MODEST','MODULE','MOMENT','MONKEY','MORTAL','MOSTLY','MOTHER',
  'MOTION','MUSEUM','MUTUAL','MYRIAD','NATION','NATURE','NEARBY','NEARLY','NEATLY','NEEDLE',
  'NETHER','NICKEL','NOBODY','NORMAL','NOTICE','NOTION','NOVICE','NUMBER','OBJECT','OBTAIN',
  'OCCUPY','OFFEND','OFFICE','ONLINE','OPPOSE','OPTION','ORANGE','ORIGIN','OUTPUT','PALACE',
  'PARENT','PATROL','PATRON','PATTER','PENCIL','PEOPLE','PERIOD','PERMIT','PERSON','PHRASE',
  'PILLAR','PIRATE','PLANET','PLAYER','PLEASE','PLEDGE','PLENTY','PLUNGE','POCKET','POETRY',
  'POISON','POLICE','POLICY','POLISH','POLITE','PONDER','PORTAL','POSTER','POTATO','POWDER',
  'PRAYER','PREFER','PRISON','PROFIT','PROMPT','PROPER','PROVEN','PUBLIC','PURSUE','PUZZLE',
  'RABBIT','RACIAL','RANDOM','RARELY','RATHER','RATING','READER','REALLY','REASON','RECALL',
  'RECENT','RECORD','REDUCE','REFORM','REGARD','REGIME','REGION','REJECT','RELATE','RELIEF',
  'REMAIN','REMEDY','REMOTE','REMOVE','RENDER','RENOWN','RENTAL','REPAIR','REPEAT','REPLAY',
  'REPORT','RESCUE','RESIGN','RESIST','RESORT','RESULT','RETAIL','RETAIN','RETIRE','RETURN',
  'REVEAL','REVIEW','REVOLT','REWARD','RIBBON','RISING','RITUAL','ROBUST','ROCKET','ROLLER',
  'ROSTER','RUBBER','RULING','RUMBLE','RUNNER','RUSTIC','SACRED','SAFETY','SAILOR','SAMPLE',
  'SCARCE','SCENIC','SCHEME','SCHOOL','SCREEN','SCRIPT','SCROLL','SEARCH','SEASON','SECOND',
  'SECRET','SECTOR','SECURE','SELECT','SENIOR','SEQUIN','SERIES','SERVED','SETTLE','SEVERE',
  'SHADOW','SHAPED','SHELVE','SHIELD','SIGNAL','SIGNED','SILENT','SILVER','SIMPLE','SINGER',
  'SINGLE','SISTER','SKETCH','SLIGHT','SLOWLY','SMOOTH','SOCIAL','SOCKET','SOFTWARE','SOLDIER',
  'SOURCE','SPIRIT','SPLASH','SPONGE','SPREAD','SPRING','SQUARE','STABLE','STANCE','STANZA',
  'STATUE','STATUS','STEADY','STEREO','STICKY','STRAIN','STRAND','STREAK','STREAM','STREET',
  'STRICT','STRIDE','STRIKE','STRING','STRIPE','STROKE','STRONG','STRUCK','STUDIO','STUPID',
  'SUBMIT','SUBTLE','SUDDEN','SUFFER','SUMMER','SUMMIT','SUNDAY','SUNSET','SUPERB','SUPPLY',
  'SURELY','SURVEY','SWITCH','SYMBOL','SYNTAX','SYSTEM','TABLET','TACKLE','TALENT','TARGET',
  'TEMPLE','TENANT','TENDER','TERROR','THRONE','TIMBER','TISSUE','TOWARD','TRAVEL','TREATY',
  'TRIBAL','TRICKY','TRIPLE','TROPHY','TUNNEL','TURTLE','TWELVE','UNFAIR','UNIQUE','UNLESS',
  'UNLIKE','UPDATE','UPHOLD','UPWARD','URGENT','USEFUL','VALLEY','VARIED','VENDOR','VESSEL',
  'VIEWER','VIRTUE','VISION','VISUAL','VOLUME','VOYAGE','WALKER','WALLET','WANDER','WARMTH',
  'WEALTH','WEAPON','WEEKLY','WEIGHT','WHOLLY','WICKED','WINDOW','WINNER','WINTER','WISDOM',
  'WITHIN','WONDER','WOODEN','WORKER','WORTHY','WRITER','YEARLY','ZOMBIE',
];

const ALL_WORDS: string[] = [
  ...WORDS_3,
  ...WORDS_4,
  ...WORDS_5,
  ...WORDS_6,
];

const WORD_SET = new Set(ALL_WORDS);

// Rare words get a bonus multiplier — these are longer, less common words
const RARE_WORD_SET = new Set([
  ...WORDS_6,
  'ABACUS','BEHALF','BEQUEATH','CACTUS','EPOCH','FJORD','GUILE','HYMNS','KNACK',
  'MYRRH','NEXUS','OXYGEN','PRISM','QUAY','SWIVEL','TWANG','VELVET','WRAITH','XENON',
  'YEARN','ZEPHYR','WHISKY','MOSAIC','PLAQUE','AURA','LEMUR','VIOLA','GAZEBO','MIRTH',
]);

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

function isBrowser(): boolean {
  return typeof globalThis.window !== 'undefined';
}

function loadState(): ConnectStats {
  if (!isBrowser()) {
    return createDefaultStats();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as ConnectStats;
    }
  } catch {
    // ignore parse errors
  }
  return createDefaultStats();
}

function saveState(stats: ConnectStats): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore storage errors
  }
}

function loadCurrentGame(): ConnectGame | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_current`);
    if (raw) return JSON.parse(raw) as ConnectGame;
  } catch {
    // ignore
  }
  return null;
}

function saveCurrentGame(game: ConnectGame): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(`${STORAGE_KEY}_current`, JSON.stringify(game));
  } catch {
    // ignore
  }
}

function clearCurrentGame(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(`${STORAGE_KEY}_current`);
  } catch {
    // ignore
  }
}

function createDefaultStats(): ConnectStats {
  return {
    totalGamesPlayed: 0,
    totalWordsFound: 0,
    longestWordFound: '',
    bestScore: 0,
    difficultyStats: {
      easy: { gamesPlayed: 0, bestScore: 0, averageWords: 0, totalWordsFound: 0 },
      medium: { gamesPlayed: 0, bestScore: 0, averageWords: 0, totalWordsFound: 0 },
      hard: { gamesPlayed: 0, bestScore: 0, averageWords: 0, totalWordsFound: 0 },
    },
    recentGames: [],
    wordFrequency: {},
    dailyStreak: 0,
    lastDailyDate: '',
    dailyCompleted: [],
  };
}

function createDefaultGame(size: number, difficulty: Difficulty): ConnectGame {
  return {
    grid: [],
    size,
    difficulty,
    foundWords: [],
    unfoundWords: [],
    score: 0,
    combo: 1,
    startTime: Date.now(),
    hintsRemaining: 3,
    completed: false,
    hintRevealedLetter: null,
    shuffleCount: 0,
    targetWords: [],
  };
}

// Seeded PRNG for deterministic daily puzzles
function seededRandom(seed: number): () => number {
  let s = seed & 0x7fffffff;
  if (s === 0) s = 1;
  return () => {
    s = (s * 48271) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const ch = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return Math.abs(hash);
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// English letter frequency weights for natural-feeling grids
const LETTER_WEIGHTS: Record<string, number> = {
  A: 82, B: 15, C: 28, D: 43, E: 127, F: 22, G: 20, H: 61,
  I: 70, J: 2, K: 8, L: 40, M: 24, N: 67, O: 75, P: 19,
  Q: 1, R: 60, S: 63, T: 91, U: 28, V: 10, W: 24, X: 2,
  Y: 20, Z: 1,
};

const WEIGHTED_ALPHABET: string[] = [];
{
  const entries = Object.entries(LETTER_WEIGHTS);
  const totalWeight = entries.reduce((s, [, w]) => s + w, 0);
  for (const [letter, weight] of entries) {
    const count = Math.round((weight / totalWeight) * 1000);
    for (let i = 0; i < count; i++) {
      WEIGHTED_ALPHABET.push(letter);
    }
  }
}

function randomLetter(rng: () => number): string {
  return WEIGHTED_ALPHABET[Math.floor(rng() * WEIGHTED_ALPHABET.length)];
}

// 8-directional adjacency offsets
const DIRECTIONS: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

function isInBounds(size: number, row: number, col: number): boolean {
  return row >= 0 && row < size && col >= 0 && col < size;
}

// DFS word finder — explores all adjacent paths up to maxLength
function findWordsDFS(
  grid: string[][],
  row: number,
  col: number,
  visited: boolean[][],
  current: string,
  results: Set<string>,
  maxLength: number,
): void {
  const letter = grid[row][col];
  const word = current + letter;

  if (word.length > maxLength) return;

  if (word.length >= 3 && WORD_SET.has(word)) {
    results.add(word);
  }

  for (const [dr, dc] of DIRECTIONS) {
    const nr = row + dr;
    const nc = col + dc;
    if (isInBounds(grid.length, nr, nc) && !visited[nr][nc]) {
      visited[nr][nc] = true;
      findWordsDFS(grid, nr, nc, visited, word, results, maxLength);
      visited[nr][nc] = false;
    }
  }
}

// Try to place a word along a random adjacent path in the grid
function placeWordInGrid(
  grid: string[][],
  word: string,
  rng: () => number,
): boolean {
  const size = grid.length;
  const maxAttempts = 30;

  for (let a = 0; a < maxAttempts; a++) {
    const startR = Math.floor(rng() * size);
    const startC = Math.floor(rng() * size);

    const path: [number, number][] = [[startR, startC]];
    const used = new Set<string>([`${startR},${startC}`]);
    let placed = true;

    for (let i = 1; i < word.length; i++) {
      const [lr, lc] = path[path.length - 1];
      const neighbors: [number, number][] = [];

      for (const [dr, dc] of DIRECTIONS) {
        const nr = lr + dr;
        const nc = lc + dc;
        if (isInBounds(size, nr, nc) && !used.has(`${nr},${nc}`)) {
          neighbors.push([nr, nc]);
        }
      }

      if (neighbors.length === 0) {
        placed = false;
        break;
      }

      const pick = neighbors[Math.floor(rng() * neighbors.length)];
      path.push(pick);
      used.add(`${pick[0]},${pick[1]}`);
    }

    if (placed) {
      for (let i = 0; i < word.length; i++) {
        grid[path[i][0]][path[i][1]] = word[i];
      }
      return true;
    }
  }

  return false;
}

// Minimum word thresholds by difficulty
function getMinWordCount(difficulty: Difficulty, size: number): number {
  const base: Record<Difficulty, number> = { easy: 8, medium: 12, hard: 18 };
  const sizeMultiplier = size / 4;
  return Math.ceil(base[difficulty] * sizeMultiplier);
}

// Max word length by difficulty
function getMaxWordLength(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy': return 4;
    case 'medium': return 5;
    case 'hard': return 6;
    default: return 4;
  }
}

// Word pools filtered by max length
function getWordPool(maxLen: number): string[] {
  return ALL_WORDS.filter(w => w.length >= 3 && w.length <= maxLen);
}

// Shuffle an array in place
function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Extract the word from a path on the grid
function extractWordFromPath(grid: string[][], path: [number, number][]): string {
  return path.map(([r, c]) => grid[r][c]).join('').toUpperCase();
}

// Check that a path forms contiguous adjacent cells
function isContiguousPath(path: [number, number][]): boolean {
  if (path.length === 0) return false;
  for (let i = 1; i < path.length; i++) {
    const [pr, pc] = path[i - 1];
    const [cr, cc] = path[i];
    const dr = Math.abs(cr - pr);
    const dc = Math.abs(cc - pc);
    if (dr > 1 || dc > 1 || (dr === 0 && dc === 0)) return false;
  }
  return true;
}

// Check no duplicate cells in path
function hasNoDuplicateCells(path: [number, number][]): boolean {
  const seen = new Set<string>();
  for (const [r, c] of path) {
    const key = `${r},${c}`;
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return true;
}

// ---------------------------------------------------------------------------
// Exported Functions — Core
// ---------------------------------------------------------------------------

/** Initialize default state for word connect puzzle */
export function initWordConnect(): ConnectStats {
  const defaults = createDefaultStats();
  saveState(defaults);
  clearCurrentGame();
  return defaults;
}

/** Generate a letter grid of the given size, seeded with findable words */
export function generateGrid(size: number, difficulty: Difficulty): string[][] {
  const rng = seededRandom(Date.now() + Math.floor(Math.random() * 100000));
  return generateGridWithRng(size, difficulty, rng);
}

function generateGridWithRng(size: number, difficulty: Difficulty, rng: () => number): string[][] {
  const maxLen = getMaxWordLength(difficulty);
  const pool = getWordPool(maxLen);
  const minWords = getMinWordCount(difficulty, size);
  const grid: string[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => randomLetter(rng)),
  );

  // Try to place a few target words to guarantee findability
  const shuffled = shuffleArray(pool, rng);
  let placed = 0;
  const targetCount = Math.min(Math.ceil(minWords * 0.6), 8);

  for (let i = 0; i < shuffled.length && placed < targetCount; i++) {
    if (shuffled[i].length <= size) {
      const gridCopy = grid.map(row => [...row]);
      if (placeWordInGrid(gridCopy, shuffled[i], rng)) {
        // Copy placed letters back
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            grid[r][c] = gridCopy[r][c];
          }
        }
        placed++;
      }
    }
  }

  // Verify we have enough words; regenerate if not (up to 20 attempts)
  const found = findAllPossibleWords(grid, maxLen);
  if (found.length < minWords) {
    // Regenerate from scratch with a fresh rng seed
    const freshRng = seededRandom(Date.now() + Math.floor(rng() * 999999) + 1);
    return generateGridWithRng(size, difficulty, freshRng);
  }

  return grid;
}

/** Find all valid words in the grid using adjacency connections */
export function findPossibleWords(grid: string[][]): string[] {
  return findAllPossibleWords(grid, 6);
}

function findAllPossibleWords(grid: string[][], maxLength: number): string[] {
  const size = grid.length;
  const results = new Set<string>();
  const visited: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false),
  );

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      visited[r][c] = true;
      findWordsDFS(grid, r, c, visited, '', results, maxLength);
      visited[r][c] = false;
    }
  }

  return Array.from(results).sort((a, b) => b.length - a.length || a.localeCompare(b));
}

/** Validate that a word path consists of contiguous adjacent cells */
export function isValidPath(grid: string[][], path: [number, number][]): boolean {
  if (!path || path.length < 3) return false;
  const size = grid.length;

  for (const [r, c] of path) {
    if (!isInBounds(size, r, c)) return false;
  }

  if (!isContiguousPath(path)) return false;
  if (!hasNoDuplicateCells(path)) return false;

  const word = extractWordFromPath(grid, path);
  return WORD_SET.has(word);
}

/** Submit a found word; returns score earned (0 if invalid or already found) */
export function submitWord(grid: string[][], path: [number, number][]): number {
  const game = loadCurrentGame();
  if (!game || game.completed) return 0;

  if (!isValidPath(grid, path)) return 0;

  const word = extractWordFromPath(grid, path);

  // Check if already found
  const alreadyFound = game.foundWords.some(fw => fw.word === word);
  if (alreadyFound) return 0;

  // Check if word is in unfound list
  const isUnfound = game.unfoundWords.includes(word);
  if (!isUnfound) return 0;

  // Calculate score
  const baseScore = getWordScore(word);
  const comboMult = getComboMultiplier();
  const finalScore = Math.round(baseScore * comboMult);

  // Register the find
  const foundWord: FoundWord = {
    word,
    path: [...path],
    score: finalScore,
    timestamp: Date.now(),
  };

  game.foundWords.push(foundWord);
  game.unfoundWords = game.unfoundWords.filter(w => w !== word);
  game.score += finalScore;
  game.combo = Math.min(game.combo + 0.5, 5);

  // Update hint state
  if (game.hintRevealedLetter) {
    game.hintRevealedLetter = null;
  }

  // Check completion
  if (game.unfoundWords.length === 0) {
    game.completed = true;
  }

  saveCurrentGame(game);

  // Update global stats
  const stats = loadState();
  stats.totalWordsFound++;
  if (word.length > stats.longestWordFound.length) {
    stats.longestWordFound = word;
  }
  stats.wordFrequency[word] = (stats.wordFrequency[word] || 0) + 1;
  saveState(stats);

  return finalScore;
}

/** Get overall connect game statistics */
export function getGameStats(): ConnectStats {
  return loadState();
}

/** Start a new connect game with a fresh grid for the given difficulty */
export function startNewGame(difficulty: Difficulty): ConnectGame {
  const sizeMap: Record<Difficulty, number> = {
    easy: 4,
    medium: 5,
    hard: 6,
  };

  const size = sizeMap[difficulty];
  const grid = generateGrid(size, difficulty);
  const maxLen = getMaxWordLength(difficulty);
  const allWords = findAllPossibleWords(grid, maxLen);

  const game = createDefaultGame(size, difficulty);
  game.grid = grid;
  game.targetWords = [...allWords];
  game.unfoundWords = [...allWords];
  game.startTime = Date.now();

  saveCurrentGame(game);

  // Update stats
  const stats = loadState();
  stats.totalGamesPlayed++;
  stats.difficultyStats[difficulty].gamesPlayed++;
  saveState(stats);

  return game;
}

/** Get the current active game state */
export function getCurrentGame(): ConnectGame | null {
  return loadCurrentGame();
}

/** Get a hint: reveals the first letter of the first unfound word */
export function getHint(): string | null {
  const game = loadCurrentGame();
  if (!game || game.completed || game.unfoundWords.length === 0) return null;

  // If already have a hint revealed, return it
  if (game.hintRevealedLetter) {
    return `Hint: the next word starts with "${game.hintRevealedLetter}"`;
  }

  // Find the shortest unfound word (easiest hint)
  const sorted = [...game.unfoundWords].sort((a, b) => a.length - b.length);
  const firstLetter = sorted[0][0];

  game.hintRevealedLetter = firstLetter;
  saveCurrentGame(game);

  return `Hint: look for a word starting with "${firstLetter}" (${sorted[0].length} letters)`;
}

/** Get the number of hints remaining for the current game */
export function getHintsRemaining(): number {
  const game = loadCurrentGame();
  return game ? game.hintsRemaining : 3;
}

/** Consume one hint from the current game's allowance */
export function useHint(): string | null {
  const game = loadCurrentGame();
  if (!game || game.completed || game.hintsRemaining <= 0) return null;

  game.hintsRemaining--;
  saveCurrentGame(game);

  return getHint();
}

/** Shuffle the current grid letters (resets combo) */
export function shuffleGrid(): string[][] | null {
  const game = loadCurrentGame();
  if (!game || game.completed) return null;

  const size = game.size;
  const rng = seededRandom(Date.now() + Math.floor(Math.random() * 100000));

  // Collect all letters, shuffle, redistribute
  const letters: string[] = [];
  for (const row of game.grid) {
    for (const cell of row) {
      letters.push(cell);
    }
  }

  const shuffled = shuffleArray(letters, rng);
  let idx = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      game.grid[r][c] = shuffled[idx++];
    }
  }

  game.shuffleCount++;
  game.combo = 1; // Reset combo on shuffle

  // Recalculate words for the new grid
  const maxLen = getMaxWordLength(game.difficulty);
  const newWords = findAllPossibleWords(game.grid, maxLen);
  const newFound = new Set(game.foundWords.map(fw => fw.word));

  game.unfoundWords = newWords.filter(w => !newFound.has(w));
  game.targetWords = newWords;

  // Remove found words that no longer exist in the grid
  game.foundWords = game.foundWords.filter(fw => newWords.includes(fw.word));

  // Recalculate score
  game.score = game.foundWords.reduce((sum, fw) => sum + fw.score, 0);

  saveCurrentGame(game);
  return game.grid;
}

/** Get today's seeded daily puzzle (deterministic, same for everyone today) */
export function getDailyPuzzle(): ConnectGame {
  const today = getTodayString();
  const seed = dateToSeed(today);
  const rng = seededRandom(seed);

  const stats = loadState();

  // Alternate difficulty based on day-of-week for variety
  const dayOfWeek = new Date().getDay();
  const difficulty: Difficulty = dayOfWeek % 3 === 0 ? 'hard' : dayOfWeek % 3 === 1 ? 'medium' : 'easy';
  const sizeMap: Record<Difficulty, number> = { easy: 4, medium: 5, hard: 6 };
  const size = sizeMap[difficulty];

  const grid = generateGridWithRng(size, difficulty, rng);
  const maxLen = getMaxWordLength(difficulty);
  const allWords = findAllPossibleWords(grid, maxLen);

  const game = createDefaultGame(size, difficulty);
  game.grid = grid;
  game.targetWords = [...allWords];
  game.unfoundWords = [...allWords];
  game.startTime = Date.now();

  saveCurrentGame(game);
  return game;
}

/** Get consecutive days with daily puzzle completed */
export function getDailyStreak(): number {
  const stats = loadState();
  return stats.dailyStreak;
}

/** Whether today's daily puzzle has been completed */
export function isDailyCompleted(): boolean {
  const stats = loadState();
  const today = getTodayString();
  return stats.dailyCompleted.includes(today);
}

/** Get currently found words in the active game */
export function getFoundWords(): FoundWord[] {
  const game = loadCurrentGame();
  return game ? game.foundWords : [];
}

/** Get words still to find in the active game */
export function getUnfoundWords(): string[] {
  const game = loadCurrentGame();
  return game ? game.unfoundWords : [];
}

/** Calculate score for a word based on its length */
export function getWordScore(word: string): number {
  const len = word.length;
  let base: number;
  switch (true) {
    case len <= 3:
      base = 100;
      break;
    case len === 4:
      base = 200;
      break;
    case len === 5:
      base = 400;
      break;
    default:
      base = 800;
      break;
  }

  // Rare word bonus
  if (RARE_WORD_SET.has(word.toUpperCase())) {
    base = Math.round(base * 1.5);
  }

  return base;
}

/** Get the current combo multiplier for consecutive word finds */
export function getComboMultiplier(): number {
  const game = loadCurrentGame();
  return game ? game.combo : 1;
}

/** Calculate time-based bonus (higher for faster completion) */
export function getTimeBonus(elapsed: number): number {
  // elapsed in seconds; bonus decays over time
  const baseBonus = 500;
  const decay = 2;
  return Math.max(0, Math.round(baseBonus - elapsed * decay));
}

/** Get top scores for a specific difficulty level */
export function getHighScores(difficulty: Difficulty): GameResult[] {
  const stats = loadState();
  return stats.recentGames
    .filter(g => g.difficulty === difficulty)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

/** Get the total number of games played */
export function getTotalGamesPlayed(): number {
  const stats = loadState();
  return stats.totalGamesPlayed;
}

/** Get the total number of words found across all games */
export function getTotalWordsFound(): number {
  const stats = loadState();
  return stats.totalWordsFound;
}

/** Get the longest word ever found */
export function getLongestWordFound(): string {
  const stats = loadState();
  return stats.longestWordFound;
}

/** Get the average words found per game */
export function getAverageWordsPerGame(): number {
  const stats = loadState();
  if (stats.totalGamesPlayed === 0) return 0;
  return Math.round((stats.totalWordsFound / stats.totalGamesPlayed) * 10) / 10;
}

/** Get the all-time best score */
export function getBestScore(): number {
  const stats = loadState();
  return stats.bestScore;
}

/** Get stats breakdown by difficulty */
export function getDifficultyStats(): ConnectStats['difficultyStats'] {
  const stats = loadState();
  return stats.difficultyStats;
}

/** Save the completed game result to persistent stats */
export function saveGameResult(): GameResult | null {
  const game = loadCurrentGame();
  if (!game) return null;

  const elapsed = Math.floor((Date.now() - game.startTime) / 1000);
  const longestFound = game.foundWords.reduce(
    (longest, fw) => fw.word.length > longest.length ? fw.word : longest,
    '',
  );

  const result: GameResult = {
    date: getTodayString(),
    difficulty: game.difficulty,
    score: game.score,
    wordsFound: game.foundWords.length,
    totalWords: game.targetWords.length,
    timeElapsed: elapsed,
    longestWord: longestFound,
  };

  const stats = loadState();

  // Update high score
  if (game.score > stats.bestScore) {
    stats.bestScore = game.score;
  }

  // Update difficulty-specific stats
  const dStats = stats.difficultyStats[game.difficulty];
  if (game.score > dStats.bestScore) {
    dStats.bestScore = game.score;
  }
  dStats.totalWordsFound += game.foundWords.length;
  dStats.averageWords = Math.round((dStats.totalWordsFound / dStats.gamesPlayed) * 10) / 10;

  // Add to recent games (keep last 50)
  stats.recentGames.unshift(result);
  if (stats.recentGames.length > 50) {
    stats.recentGames = stats.recentGames.slice(0, 50);
  }

  // Check if this is a daily game — update streak if all words found
  if (game.unfoundWords.length === 0) {
    const today = getTodayString();
    if (!stats.dailyCompleted.includes(today)) {
      stats.dailyCompleted.push(today);
      // Keep only last 365 entries
      if (stats.dailyCompleted.length > 365) {
        stats.dailyCompleted = stats.dailyCompleted.slice(-365);
      }
    }

    const yesterday = getYesterdayString();
    if (stats.lastDailyDate === yesterday) {
      stats.dailyStreak++;
    } else if (stats.lastDailyDate === today) {
      // Already counted today
    } else {
      stats.dailyStreak = 1;
    }
    stats.lastDailyDate = today;
  }

  saveState(stats);
  clearCurrentGame();

  return result;
}

/** Get the last N completed game results */
export function getRecentGames(count: number): GameResult[] {
  const stats = loadState();
  return stats.recentGames.slice(0, count);
}

/** Get the most commonly found words across all games */
export function getWordFrequency(): { word: string; count: number }[] {
  const stats = loadState();
  const entries = Object.entries(stats.wordFrequency);
  return entries
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);
}

// ---------------------------------------------------------------------------
// Exported Functions — UI Helpers
// ---------------------------------------------------------------------------

/** Single-call payload for the connect panel overview */
export function getConnectOverview(): {
  currentGame: ConnectGame | null;
  stats: ConnectStats;
  dailyStreak: number;
  dailyCompleted: boolean;
  bestScore: number;
  totalGames: number;
  totalWords: number;
} {
  const game = loadCurrentGame();
  const stats = loadState();
  const today = getTodayString();

  return {
    currentGame: game,
    stats,
    dailyStreak: stats.dailyStreak,
    dailyCompleted: stats.dailyCompleted.includes(today),
    bestScore: stats.bestScore,
    totalGames: stats.totalGamesPlayed,
    totalWords: stats.totalWordsFound,
  };
}

/** Current game card with grid, score, timer, and hint info */
export function getGameCard(): {
  grid: string[][];
  size: number;
  difficulty: Difficulty;
  score: number;
  combo: number;
  elapsed: number;
  hintsRemaining: number;
  hintRevealedLetter: string | null;
  foundCount: number;
  totalCount: number;
  completed: boolean;
  progress: number;
} | null {
  const game = loadCurrentGame();
  if (!game) return null;

  const elapsed = Math.floor((Date.now() - game.startTime) / 1000);
  const foundCount = game.foundWords.length;
  const totalCount = game.targetWords.length;
  const progress = totalCount > 0 ? Math.round((foundCount / totalCount) * 100) : 0;

  return {
    grid: game.grid,
    size: game.size,
    difficulty: game.difficulty,
    score: game.score,
    combo: game.combo,
    elapsed,
    hintsRemaining: game.hintsRemaining,
    hintRevealedLetter: game.hintRevealedLetter,
    foundCount,
    totalCount,
    completed: game.completed,
    progress,
  };
}

/** Found words list with individual scores */
export function getFoundWordsList(): { word: string; score: number; length: number; time: string }[] {
  const game = loadCurrentGame();
  if (!game) return [];

  return game.foundWords.map(fw => ({
    word: fw.word,
    score: fw.score,
    length: fw.word.length,
    time: new Date(fw.timestamp).toLocaleTimeString(),
  }));
}

/** First N unfound words with first letter blurred if hint was used */
export function getUnfoundWordsPreview(count: number): { word: string; display: string; length: number }[] {
  const game = loadCurrentGame();
  if (!game || game.unfoundWords.length === 0) return [];

  const sorted = [...game.unfoundWords].sort((a, b) => a.length - b.length);
  const preview = sorted.slice(0, count);
  const hintUsed = game.hintRevealedLetter !== null;
  const hintLetter = game.hintRevealedLetter;

  return preview.map(word => {
    let display: string;
    if (hintUsed && hintLetter && word[0] === hintLetter) {
      // Show first letter, blur the rest
      display = word[0] + '\u2022'.repeat(word.length - 1);
    } else if (hintUsed && hintLetter) {
      // Blur the first letter for non-matching words
      display = '\u2022'.repeat(word.length);
    } else {
      display = '\u2022'.repeat(word.length);
    }
    return { word, display, length: word.length };
  });
}

/** Daily puzzle card with streak info and play status */
export function getDailyConnectCard(): {
  streak: number;
  completed: boolean;
  difficulty: Difficulty;
  dayOfWeek: string;
  todayFormatted: string;
  lastPlayedDate: string;
  hasActiveGame: boolean;
} {
  const stats = loadState();
  const today = getTodayString();
  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const dayIdx = new Date().getDay();
  const difficulty: Difficulty = dayIdx % 3 === 0 ? 'hard' : dayIdx % 3 === 1 ? 'medium' : 'easy';

  const game = loadCurrentGame();
  const hasActiveGame = game !== null && !game.completed;

  return {
    streak: stats.dailyStreak,
    completed: stats.dailyCompleted.includes(today),
    difficulty,
    dayOfWeek,
    todayFormatted,
    lastPlayedDate: stats.lastDailyDate || 'Never',
    hasActiveGame,
  };
}

/** Stats grid for the overview panel */
export function getStatsGrid(): {
  totalGames: number;
  totalWords: number;
  longestWord: string;
  bestScore: number;
  averagePerGame: number;
  dailyStreak: number;
  easyGames: number;
  mediumGames: number;
  hardGames: number;
  easyBest: number;
  mediumBest: number;
  hardBest: number;
} {
  const stats = loadState();

  return {
    totalGames: stats.totalGamesPlayed,
    totalWords: stats.totalWordsFound,
    longestWord: stats.longestWordFound || '—',
    bestScore: stats.bestScore,
    averagePerGame: getAverageWordsPerGame(),
    dailyStreak: stats.dailyStreak,
    easyGames: stats.difficultyStats.easy.gamesPlayed,
    mediumGames: stats.difficultyStats.medium.gamesPlayed,
    hardGames: stats.difficultyStats.hard.gamesPlayed,
    easyBest: stats.difficultyStats.easy.bestScore,
    mediumBest: stats.difficultyStats.medium.bestScore,
    hardBest: stats.difficultyStats.hard.bestScore,
  };
}

/** Difficulty selection buttons with completion stats */
export function getDifficultyButtons(): {
  easy: { label: string; size: number; gamesPlayed: number; bestScore: number; description: string };
  medium: { label: string; size: number; gamesPlayed: number; bestScore: number; description: string };
  hard: { label: string; size: number; gamesPlayed: number; bestScore: number; description: string };
} {
  const stats = loadState();

  return {
    easy: {
      label: 'Easy',
      size: 4,
      gamesPlayed: stats.difficultyStats.easy.gamesPlayed,
      bestScore: stats.difficultyStats.easy.bestScore,
      description: '4\u00d74 grid \u2022 Common words up to 4 letters',
    },
    medium: {
      label: 'Medium',
      size: 5,
      gamesPlayed: stats.difficultyStats.medium.gamesPlayed,
      bestScore: stats.difficultyStats.medium.bestScore,
      description: '5\u00d75 grid \u2022 Words up to 5 letters',
    },
    hard: {
      label: 'Hard',
      size: 6,
      gamesPlayed: stats.difficultyStats.hard.gamesPlayed,
      bestScore: stats.difficultyStats.hard.bestScore,
      description: '6\u00d76 grid \u2022 Words up to 6 letters including rare words',
    },
  };
}

/** Top 5 scores for a given difficulty */
export function getHighScoreList(difficulty: Difficulty): {
  rank: number;
  score: number;
  wordsFound: number;
  totalWords: number;
  date: string;
  timeElapsed: number;
}[] {
  const games = getHighScores(difficulty).slice(0, 5);

  return games.map((g, i) => ({
    rank: i + 1,
    score: g.score,
    wordsFound: g.wordsFound,
    totalWords: g.totalWords,
    date: g.date,
    timeElapsed: g.timeElapsed,
  }));
}
