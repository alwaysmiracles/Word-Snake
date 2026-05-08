// word-typing-race-wire.ts — SSR-safe wire module
// Prefix: tr | NO React | NO localStorage/window | NO setInterval

// ─── Types ────────────────────────────────────────────────────────────────────

type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert'
type RaceType = 'Sprint30' | 'Sprint60' | 'Sprint120' | 'Marathon200' | 'Survival' | 'Zen'

interface WordEntry {
  word: string
  category: string
  difficulty: Difficulty
  isPowerWord: boolean
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt: string | null
  condition: string
}

interface LeaderboardEntry {
  rank: number
  name: string
  wpm: number
  accuracy: number
  isPlayer: boolean
}

interface RaceHistoryEntry {
  id: string
  difficulty: Difficulty
  raceType: RaceType
  wpm: number
  accuracy: number
  score: number
  wordsCompleted: number
  combo: number
  date: string
}

interface KeyboardHeatmapKey {
  key: string
  correct: number
  incorrect: number
  total: number
}

interface DailyChallenge {
  date: string
  difficulty: Difficulty
  raceType: RaceType
  targetWPM: number
  targetAccuracy: number
  completed: boolean
  bestWPM: number | null
  bestAccuracy: number | null
}

interface TRState {
  initialized: boolean
  difficulty: Difficulty
  raceType: RaceType
  isRacing: boolean
  isPaused: boolean
  currentWordIndex: number
  currentInput: string
  words: WordEntry[]
  typedWords: string[]
  correctWords: number
  incorrectWords: number
  totalKeystrokes: number
  correctKeystrokes: number
  combo: number
  maxCombo: number
  score: number
  wpm: number
  accuracy: number
  startTime: number | null
  elapsedTime: number
  lives: number
  powerWordsHit: number
  timeLimit: number
  wordLimit: number
  totalRaces: number
  totalWordsTyped: number
  bestWPM: number
  bestAccuracy: number
  bestScore: number
  bestCombo: number
  achievements: Achievement[]
  leaderboard: LeaderboardEntry[]
  raceHistory: RaceHistoryEntry[]
  keyboardHeatmap: Record<string, KeyboardHeatmapKey>
  dailyChallenge: DailyChallenge
  dailyStreak: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WORDS_ANIMALS: readonly string[] = [
  'cat','dog','bird','fish','lion','tiger','bear','wolf','fox','deer',
  'rabbit','elephant','giraffe','monkey','zebra','horse','cow','pig','sheep','goat',
  'chicken','duck','eagle','hawk','owl','parrot','penguin','dolphin','whale','shark',
  'octopus','squid','crab','lobster','turtle','snake','lizard','frog','toad','salamander',
  'butterfly','dragonfly','bee','ant','spider','scorpion','beetle','mosquito','fly','wasp',
  'bear','moose','elk','bison','buffalo','leopard','cheetah','jaguar','panther','hyena',
  'rhinoceros','hippopotamus','gorilla','orangutan','chimpanzee','lemur','koala','kangaroo','wombat','platypus',
  'panda','sloth','armadillo','raccoon','squirrel','hamster','gerbil','ferret','otter','beaver',
  'mongoose','hedgehog','porcupine','skunk','opossum','crocodile','alligator','chameleon','iguana','gecko',
  'parakeet','canary','finch','sparrow','robin','cardinal','bluebird','crow','raven','magpie',
  'pelican','flamingo','stork','heron','crane','swan','goose','pigeon','dove','seagull',
  'albatross','puffin','woodpecker','hummingbird','kingfisher','nightingale','lark','swallow','martin','vulture',
  'condor','osprey','falcon','kite','bobcat','lynx','cougar','wildcat','coyote','dingo',
  'dhole','jackal','foxhound','greyhound','mastiff','terrier','collie','poodle','beagle','corgi',
  'reindeer','caribou','muskox','antelope','gazelle','impala','springbok','waterbuck','nyala','kudu',
  'baboon','macaque','mandrill','capuchin','tamarin','marmoset','siamang','gibbon','orangutan','gorilla',
  'seahorse','starfish','jellyfish','anemone','coral','urchin','mollusk','clam','oyster','abalone',
  'squid','cuttlefish','nautilus','ray','stingray','manta','manatee','dugong','narwhal','beluga',
  'platypus','echidna','numbat','quoll','dunnart','bandicoot','bilby','glider','possum','wallaby',
]

const WORDS_FOOD: readonly string[] = [
  'apple','banana','orange','grape','mango','peach','pear','plum','cherry','berry',
  'strawberry','blueberry','raspberry','blackberry','cranberry','watermelon','cantaloupe','honeydew','pineapple','papaya',
  'coconut','lemon','lime','grapefruit','tangerine','apricot','fig','date','pomegranate','kiwi',
  'avocado','tomato','potato','carrot','onion','garlic','pepper','lettuce','celery','cucumber',
  'broccoli','cauliflower','spinach','kale','cabbage','mushroom','zucchini','eggplant','pumpkin','squash',
  'sweet potato','turnip','radish','beet','artichoke','asparagus','okra','ginger','turmeric','cinnamon',
  'bread','toast','bagel','muffin','croissant','scone','biscuit','pancake','waffle','crepe',
  'pasta','spaghetti','macaroni','lasagna','ravioli','tortellini','fettuccine','linguine','penne','rigatoni',
  'rice','quinoa','oats','barley','corn','wheat','flour','sugar','salt','pepper',
  'chicken','beef','pork','lamb','veal','turkey','duck','salmon','tuna','cod',
  'shrimp','lobster','crab','clam','oyster','scallop','squid','anchovy','sardine','trout',
  'cheese','butter','cream','yogurt','milk','eggs','bacon','sausage','ham','steak',
  'pizza','burger','sandwich','taco','burrito','quesadilla','enchilada','tamale','empanada','spring roll',
  'sushi','ramen','curry','stir fry','pad thai','dim sum','dumpling','spring roll','tempura','teriyaki',
  'cake','cookie','brownie','muffin','cupcake','donut','eclair','tart','pie','cheesecake',
  'ice cream','sorbet','gelato','frozen yogurt','pudding','custard','mousse','parfait','smoothie','milkshake',
  'chocolate','vanilla','caramel','butterscotch','honey','maple syrup','jam','jelly','peanut butter','nutella',
  'coffee','tea','juice','water','soda','lemonade','hot chocolate','espresso','cappuccino','latte',
  'soup','salad','stew','chili','casserole','roast','grill','bake','fry','saute',
  'almond','walnut','pecan','cashew','pistachio','hazelnut','macadamia','peanut','chestnut','brazil nut',
  'olive','capers','sun dried tomato','pesto','tahini','hummus','guacamole','salsa','relish','chutney',
]

const WORDS_NATURE: readonly string[] = [
  'tree','flower','river','mountain','ocean','lake','forest','desert','island','valley',
  'canyon','cliff','cave','waterfall','volcano','glacier','meadow','prairie','swamp','marsh',
  'jungle','rainforest','tundra','plateau','ridge','gorge','ravine','basin','delta','estuary',
  'fjord','atoll','reef','lagoon','bayou','moor','heath','steppe','savanna','badlands',
  'sun','moon','star','cloud','rain','snow','wind','storm','thunder','lightning',
  'rainbow','aurora','eclipse','tide','wave','current','breeze','gale','hurricane','tornado',
  'earthquake','avalanche','flood','drought','wildfire','erosion','sediment','crystal','mineral','fossil',
  'granite','marble','quartz','obsidian','limestone','sandstone','slate','basalt','pumice','chalk',
  'gold','silver','copper','iron','diamond','ruby','emerald','sapphire','opal','topaz',
  'oak','pine','cedar','maple','birch','willow','elm','ash','redwood','sequoia',
  'rose','lily','daisy','tulip','orchid','sunflower','daffodil','violet','poppy','iris',
  'lavender','jasmine','peon y','chrysanthemum','dahlia','carnation','begonia','azalea','hydrangea','magnolia',
  'fern','moss','lichen','ivy','vine','cactus','aloe','bamboo','palm','bonsai',
  'eagle','hawk','owl','sparrow','robin','cardinal','crow','raven','bluebird','finch',
  'butterfly','dragonfly','ladybug','caterpillar','firefly','grasshopper','cricket','beetle','ant','bee',
  'wolf','bear','deer','elk','moose','fox','rabbit','squirrel','chipmunk','beaver',
  'whale','dolphin','seal','otter','manatee','sea turtle','penguin','puffin','albatross','pelican',
  'coral','seaweed','kelp','plankton','jellyfish','starfish','urchin','anemone','shell','sand dollar',
  'moss','lichen','mushroom','toadstool','fern','horsetail','clubmoss',' liverwort','hornwort','moss',
  'dawn','dusk','twilight','midnight','sunrise','sunset','horizon','zenith','nadir','equinox',
  'solstice','season','spring','summer','autumn','winter','equator','tropic','meridian','compass',
]

const WORDS_TECHNOLOGY: readonly string[] = [
  'computer','phone','tablet','laptop','desktop','monitor','keyboard','mouse','printer','scanner',
  'software','hardware','program','code','algorithm','database','network','server','cloud','internet',
  'website','browser','email','password','username','login','logout','register','account','profile',
  'application','download','upload','install','update','delete','backup','restore','cache','cookie',
  'pixel','resolution','display','screen','touch','scroll','click','drag','drop','swipe',
  'button','icon','menu','toolbar','sidebar','header','footer','modal','dialog','notification',
  'search','filter','sort','query','result','index','page','link','bookmark','history',
  'video','audio','image','photo','camera','microphone','speaker','headphone','battery','charger',
  'bluetooth','wireless','ethernet','router','modem','bandwidth','latency','throughput','protocol','encryption',
  'security','firewall','antivirus','malware','phishing','spam','virus','worm','trojan','ransomware',
  'artificial','intelligence','machine','learning','neural','network','deep','model','training','prediction',
  'blockchain','cryptocurrency','bitcoin','ethereum','wallet','mining','token','contract','decentralized','ledger',
  'virtual','reality','augmented','metaverse','avatar','simulation','rendering','graphics','texture','shader',
  'python','javascript','typescript','rust','golang','java','swift','kotlin','ruby','php',
  'react','angular','vue','svelte','next','node','express','django','flask','rails',
  'git','github','repository','branch','commit','merge','pull','push','deploy','release',
  'container','docker','kubernetes','microservice','api','rest','graphql','websocket','json','xml',
  'agile','scrum','sprint','kanban','standup','retrospective','planning','backlog','story','epic',
  'terminal','command','script','shell','bash','powershell','linux','ubuntu','centos','debian',
  'binary','hexadecimal','decimal','integer','string','boolean','array','object','class','function',
  'variable','constant','parameter','argument','return','loop','condition','switch','try','catch',
  'debug','error','exception','warning','log','trace','profile','benchmark','optimize','refactor',
  'frontend','backend','fullstack','devops','testing','unit','integration','coverage','quality','review',
  'design','prototype','wireframe','mockup','layout','component','library','framework','pattern','architecture',
  'mobile','responsive','accessibility','performance','scalability','reliability','availability','maintenance','monitoring','logging',
  'data','analytics','metric','dashboard','report','chart','graph','visualization','insight','trend',
  'automation','pipeline','workflow','scheduler','trigger','event','listener','handler','callback','promise',
  'async','await','thread','process','memory','storage','file','directory','path','environment',
  'compiler','interpreter','assembler','linker','loader','debugger','profiler','linter','formatter','generator',
  'typescript','interface','generic','enum','tuple','union','intersection','decorator','namespace','module',
  'middleware','plugin','extension','addon','theme','template','engine','compiler','runtime','virtual machine',
]

const WORDS_SPORTS: readonly string[] = [
  'soccer','basketball','football','baseball','tennis','golf','hockey','volleyball','cricket','rugby',
  'swimming','running','cycling','boxing','wrestling','skiing','snowboard','skating','surfing','diving',
  'archery','fencing','gymnastics','judo','karate','taekwondo','weightlifting','rowing','canoeing','kayaking',
  'badminton','table tennis','squash','racquetball','handball','lacrosse','field hockey','softball','kickball','dodgeball',
  'track','field','marathon','sprint','hurdle','discus','javelin','shot put','high jump','long jump',
  'triple jump','pole vault','relay','decathlon','heptathlon','pentathlon','triathlon','biathlon','duathlon','aquathlon',
  'goal','score','point','assist','rebound','steal','block','foul','penalty','free throw',
  'dribble','pass','shoot','save','tackle','header','volley','smash','serve','return',
  'coach','captain','referee','umpire','official','player','team','squad','roster','lineup',
  'stadium','arena','court','field','pitch','track','pool','rink','course','ring',
  'championship','tournament','league','division','conference','playoff','final','semifinal','quarterfinal','round',
  'medal','trophy','award','record','victory','defeat','draw','tiebreaker','overtime','shootout',
  'endurance','strength','speed','agility','flexibility','balance','coordination','stamina','power','precision',
  'warmup','cooldown','stretch','exercise','workout','training','practice','drill','routine','regimen',
  'jersey','helmet','gloves','pads','cleats','shin guards','mouth guard','racquet','bat','club',
  'ball','puck','shuttlecock','disc','arrow','sword','mat','ring','belt','rope',
  'offense','defense','midfield','goalkeeper','striker','defender','midfielder','winger','fullback','sweeper',
  'pitcher','catcher','batter','base runner','outfielder','infielder','shortstop','designated hitter','reliever','closer',
  'quarterback','running back','wide receiver','tight end','offensive line','defensive line','linebacker','cornerback','safety','kicker',
  'point guard','shooting guard','small forward','power forward','center','sixth man','bench','starter','rookie','veteran',
  'mvp','rookie of the year','defensive player','most improved','sixth man award','sportsmanship','fair play','team spirit','dedication','perseverance',
]

const WORDS_MUSIC: readonly string[] = [
  'piano','guitar','violin','cello','flute','drums','trumpet','saxophone','clarinet','harp',
  'organ','accordion','tuba','trombone','banjo','ukulele','mandolin','harmonica','xylophone','marimba',
  'melody','harmony','rhythm','tempo','beat','measure','bar','note','chord','scale',
  'sharp','flat','natural','key','signature','clef','staff','treble','bass','alto',
  'soprano','tenor','baritone','bass','alto','contralto','mezzo','coloratura','falsetto','vibrato',
  'symphony','orchestra','band','choir','ensemble','quartet','trio','duet','solo','concerto',
  'sonata','nocturne','etude','prelude','fugue','suite','overture','intermezzo','rhapsody','fantasia',
  'rock','pop','jazz','blues','country','folk','classical','electronic','hip hop','reggae',
  'punk','metal','indie','alternative','soul','funk','disco','ska','grunge','emo',
  'verse','chorus','bridge','intro','outro','refrain','hook','riff','lick','solo',
  'album','single','ep','lp','track','song','piece','composition','arrangement','remix',
  'studio','stage','microphone','amplifier','speaker','headphones','mixer','console','turntable','vinyl',
  'producer','composer','songwriter','lyricist','arranger','conductor','musician','singer','vocalist','instrumentalist',
  'tempo','adagio','andante','moderato','allegro','presto','vivace','largo','grave','lento',
  'forte','piano','mezzo','crescendo','decrescendo','diminuendo','sforzando','staccato','legato','fermata',
  'pitch','frequency','wavelength','amplitude','waveform','spectrum','resonance','overtone','timbre','tone',
  'reverb','delay','chorus','flanger','phaser','compressor','equalizer','limiter','gate','expander',
  'record','release','master','mix','edit','produce','perform','rehearse','practice','jam',
  'festival','concert','gig','tour','venue','auditorium','theater','arena','club','lounge',
  'playlist','queue','shuffle','repeat','random','stream','download','upload','share','like',
  'acoustic','electric','digital','analog','synthesizer','sampler','drum machine','loop','sample','patch',
  'riff','groove','swing','syncopation','polyrhythm','counterpoint','harmony','dissonance','consonance','modulation',
  'inspiration','creativity','expression','emotion','passion','dedication','talent','craft','artistry','mastery',
  'ovation','encore','applause','standing','curtain','spotlight','backstage','dressing room','green room','soundcheck',
  'staff','quarter note','half note','whole note','eighth note','sixteenth note','rest','tie','dot','triplet',
]

const POWER_WORDS: readonly string[] = [
  'supercalifragilistic','serendipity','magnificent','extraordinary','phenomenal','spectacular','marvelous',
  'breathtaking','astonishing','thunderstruck','revolution','imagination','brilliant','masterpiece',
  'kaleidoscope','quintessential','sophisticated','entrepreneurial','constellation','transcendental',
  'onomatopoeia','synesthesia','chiaroscuro','trompe loeil','je ne sais quoi','wanderlust','fernweh',
  'schadenfreude','zeitgeist','doppelganger','bildungsroman','sturm und drang','joie de vivre',
]

const ALL_WORD_LISTS: readonly (readonly string[])[] = [
  WORDS_ANIMALS, WORDS_FOOD, WORDS_NATURE, WORDS_TECHNOLOGY, WORDS_SPORTS, WORDS_MUSIC,
]

const CATEGORY_NAMES: readonly string[] = ['Animals', 'Food', 'Nature', 'Technology', 'Sports', 'Music']

const DIFFICULTY_WORD_LENGTHS: Record<Difficulty, [number, number]> = {
  Easy: [2, 5],
  Medium: [4, 8],
  Hard: [6, 12],
  Expert: [8, 20],
}

const RACE_TYPE_CONFIG: Record<RaceType, { timeLimit: number; wordLimit: number; lives: number; label: string }> = {
  Sprint30: { timeLimit: 30, wordLimit: 0, lives: 0, label: 'Sprint 30s' },
  Sprint60: { timeLimit: 60, wordLimit: 0, lives: 0, label: 'Sprint 60s' },
  Sprint120: { timeLimit: 120, wordLimit: 0, lives: 0, label: 'Sprint 120s' },
  Marathon200: { timeLimit: 0, wordLimit: 200, lives: 0, label: 'Marathon 200' },
  Survival: { timeLimit: 0, wordLimit: 0, lives: 3, label: 'Survival' },
  Zen: { timeLimit: 0, wordLimit: 0, lives: 0, label: 'Zen' },
}

const ACHIEVEMENT_DEFS: readonly { id: string; name: string; description: string; icon: string; condition: string }[] = [
  { id: 'first_race', name: 'First Steps', description: 'Complete your first race', icon: '🏁', condition: 'complete 1 race' },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Reach 100 WPM', icon: '⚡', condition: 'reach 100 WPM' },
  { id: 'lightning', name: 'Lightning Fingers', description: 'Reach 150 WPM', icon: '🌩️', condition: 'reach 150 WPM' },
  { id: 'perfectionist', name: 'Perfectionist', description: '100% accuracy in a race', icon: '💎', condition: '100% accuracy' },
  { id: 'combo_master', name: 'Combo Master', description: '20 word combo', icon: '🔥', condition: '20 word combo' },
  { id: 'combo_legend', name: 'Combo Legend', description: '50 word combo', icon: '💫', condition: '50 word combo' },
  { id: 'marathoner', name: 'Marathoner', description: 'Complete a Marathon 200', icon: '🏃', condition: 'complete marathon' },
  { id: 'survivor', name: 'Survivor', description: 'Complete Survival mode', icon: '🛡️', condition: 'complete survival' },
  { id: 'zen_master', name: 'Zen Master', description: 'Type 500 words in Zen', icon: '🧘', condition: '500 zen words' },
  { id: 'power_hunter', name: 'Power Hunter', description: 'Hit 10 power words', icon: '⭐', condition: '10 power words' },
  { id: 'centurion', name: 'Centurion', description: 'Complete 100 races', icon: '💯', condition: 'complete 100 races' },
  { id: 'streak_3', name: 'Hat Trick', description: '3 day daily streak', icon: '🎩', condition: '3 day streak' },
  { id: 'streak_7', name: 'Week Warrior', description: '7 day daily streak', icon: '📅', condition: '7 day streak' },
  { id: 'all_difficulty', name: 'All Rounder', description: 'Race in all 4 difficulties', icon: '🎯', condition: 'all difficulties' },
  { id: 'million_keys', name: 'Million Keys', description: '1,000,000 total keystrokes', icon: '🔑', condition: '1M keystrokes' },
]

const AI_PLAYERS: readonly string[] = [
  'SpeedTyper99', 'KeyboardKing', 'TypeNinja', 'WordWizard', 'SwiftFingers',
  'AlphaTyper', 'ByteStorm', 'QuickKeys', 'RocketType', 'TurboWord',
]

// ─── PRNG ─────────────────────────────────────────────────────────────────────

function seededRandom(seed: string): () => number {
  let h = 0
  for (let i = 0; i < seed.length; i++) { h = Math.imul(31, h) + seed.charCodeAt(i) | 0; }
  return () => { h = h ^ (h << 13); h = h ^ (h >> 17); h = h ^ (h << 5); return (h >>> 0) / 4294967296; }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function wordDifficulty(word: string): Difficulty {
  const len = word.length
  if (len <= 5) return 'Easy'
  if (len <= 8) return 'Medium'
  if (len <= 12) return 'Hard'
  return 'Expert'
}

function shuffleArray<T>(arr: T[], rng?: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = rng ? Math.floor(rng() * (i + 1)) : Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildWordPool(): WordEntry[] {
  const pool: WordEntry[] = []
  const seen = new Set<string>()
  for (let ci = 0; ci < ALL_WORD_LISTS.length; ci++) {
    const list = ALL_WORD_LISTS[ci]
    const cat = CATEGORY_NAMES[ci]
    for (const w of list) {
      const lower = w.toLowerCase().trim()
      if (lower && !seen.has(lower)) {
        seen.add(lower)
        pool.push({
          word: lower,
          category: cat,
          difficulty: wordDifficulty(lower),
          isPowerWord: POWER_WORDS.includes(lower),
        })
      }
    }
  }
  return pool
}

const DEFAULT_WORD_POOL: WordEntry[] = buildWordPool()

function filterWords(pool: WordEntry[], diff: Difficulty, count: number, rng?: () => number): WordEntry[] {
  const [minLen, maxLen] = DIFFICULTY_WORD_LENGTHS[diff]
  let filtered = pool.filter(w => w.word.length >= minLen && w.word.length <= maxLen)
  if (filtered.length < count) filtered = [...pool]
  return shuffleArray(filtered, rng).slice(0, count)
}

function buildLeaderboard(playerWPM: number, playerAcc: number): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = []
  const rng = seededRandom('leaderboard-' + getDateString())
  const usedNames = new Set<string>()
  const shuffled = shuffleArray([...AI_PLAYERS], rng)
  for (let i = 0; i < 10; i++) {
    const name = shuffled[i % shuffled.length]
    const wpm = Math.floor(60 + rng() * 140)
    const acc = Math.floor(70 + rng() * 30)
    entries.push({ rank: i + 1, name, wpm, accuracy: acc, isPlayer: false })
  }
  entries.push({ rank: 0, name: 'You', wpm: playerWPM, accuracy: playerAcc, isPlayer: true })
  entries.sort((a, b) => b.wpm - a.wpm)
  entries.forEach((e, i) => { e.rank = i + 1 })
  return entries
}

function buildDailyChallenge(): DailyChallenge {
  const today = getDateString()
  const rng = seededRandom('daily-' + today)
  const diffs: Difficulty[] = ['Easy', 'Medium', 'Hard', 'Expert']
  const types: RaceType[] = ['Sprint30', 'Sprint60', 'Sprint120', 'Marathon200', 'Survival', 'Zen']
  return {
    date: today,
    difficulty: diffs[Math.floor(rng() * diffs.length)],
    raceType: types[Math.floor(rng() * types.length)],
    targetWPM: Math.floor(40 + rng() * 60),
    targetAccuracy: Math.floor(80 + rng() * 20),
    completed: false,
    bestWPM: null,
    bestAccuracy: null,
  }
}

function buildDefaultHeatmap(): Record<string, KeyboardHeatmapKey> {
  const keys = 'qwertyuiopasdfghjklzxcvbnm'.split('')
  const map: Record<string, KeyboardHeatmapKey> = {}
  for (const k of keys) {
    map[k] = { key: k, correct: 0, incorrect: 0, total: 0 }
  }
  return map
}

function buildDefaultAchievements(): Achievement[] {
  return ACHIEVEMENT_DEFS.map(a => ({
    id: a.id, name: a.name, description: a.description, icon: a.icon,
    unlocked: false, unlockedAt: null, condition: a.condition,
  }))
}

// ─── Module State ─────────────────────────────────────────────────────────────

let state: TRState | null = null

// ─── Init ─────────────────────────────────────────────────────────────────────

function createDefaultState(): TRState {
  return {
    initialized: false,
    difficulty: 'Medium',
    raceType: 'Sprint60',
    isRacing: false,
    isPaused: false,
    currentWordIndex: 0,
    currentInput: '',
    words: [],
    typedWords: [],
    correctWords: 0,
    incorrectWords: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    combo: 0,
    maxCombo: 0,
    score: 0,
    wpm: 0,
    accuracy: 0,
    startTime: null,
    elapsedTime: 0,
    lives: 3,
    powerWordsHit: 0,
    timeLimit: 60,
    wordLimit: 0,
    totalRaces: 0,
    totalWordsTyped: 0,
    bestWPM: 0,
    bestAccuracy: 0,
    bestScore: 0,
    bestCombo: 0,
    achievements: buildDefaultAchievements(),
    leaderboard: buildLeaderboard(0, 0),
    raceHistory: [],
    keyboardHeatmap: buildDefaultHeatmap(),
    dailyChallenge: buildDailyChallenge(),
    dailyStreak: 0,
  }
}

function ensureInit(): void {
  if (!state) state = createDefaultState()
}

// ─── Exported Functions ───────────────────────────────────────────────────────

export function trInit(): void {
  ensureInit()
  if (state && !state.initialized) {
    state.initialized = true
  }
}

export function trGetState(): TRState {
  ensureInit()
  return state!
}

export function trResetState(): void {
  state = null
}

export function trStartRace(difficulty: Difficulty, raceType: RaceType): void {
  ensureInit()
  if (!state) return
  const config = RACE_TYPE_CONFIG[raceType]
  const rng = seededRandom(`race-${Date.now()}`)
  const wordCount = raceType === 'Zen' ? 200 : (raceType === 'Marathon200' ? 200 : 300)
  const words = filterWords(DEFAULT_WORD_POOL, difficulty, wordCount, rng)
  state.difficulty = difficulty
  state.raceType = raceType
  state.isRacing = true
  state.isPaused = false
  state.currentWordIndex = 0
  state.currentInput = ''
  state.words = words
  state.typedWords = []
  state.correctWords = 0
  state.incorrectWords = 0
  state.totalKeystrokes = 0
  state.correctKeystrokes = 0
  state.combo = 0
  state.maxCombo = 0
  state.score = 0
  state.wpm = 0
  state.accuracy = 0
  state.startTime = Date.now()
  state.elapsedTime = 0
  state.lives = config.lives || 3
  state.powerWordsHit = 0
  state.timeLimit = config.timeLimit
  state.wordLimit = config.wordLimit
}

export function trEndRace(): void {
  ensureInit()
  if (!state || !state.isRacing) return
  state.isRacing = false
  state.elapsedTime = state.startTime ? (Date.now() - state.startTime) / 1000 : 0
  const minutes = state.elapsedTime / 60
  state.wpm = minutes > 0 ? Math.round(state.correctWords / minutes) : 0
  const total = state.totalKeystrokes
  state.accuracy = total > 0 ? Math.round((state.correctKeystrokes / total) * 100) : 0
  if (state.wpm > state.bestWPM) state.bestWPM = state.wpm
  if (state.accuracy > state.bestAccuracy) state.bestAccuracy = state.accuracy
  if (state.score > state.bestScore) state.bestScore = state.score
  if (state.maxCombo > state.bestCombo) state.bestCombo = state.maxCombo
  state.totalRaces++
  state.totalWordsTyped += state.correctWords
  const entry: RaceHistoryEntry = {
    id: `race-${Date.now()}`,
    difficulty: state.difficulty,
    raceType: state.raceType,
    wpm: state.wpm,
    accuracy: state.accuracy,
    score: state.score,
    wordsCompleted: state.correctWords,
    combo: state.maxCombo,
    date: new Date().toISOString(),
  }
  state.raceHistory.unshift(entry)
  if (state.raceHistory.length > 20) state.raceHistory = state.raceHistory.slice(0, 20)
  state.leaderboard = buildLeaderboard(state.wpm, state.accuracy)
  checkAchievements()
  checkDailyChallenge()
}

export function trSubmitWord(input: string): { correct: boolean; word: string; gameOver: boolean } {
  ensureInit()
  if (!state || !state.isRacing) return { correct: false, word: '', gameOver: false }
  const currentWord = state.words[state.currentWordIndex]
  if (!currentWord) return { correct: false, word: '', gameOver: true }
  const normalized = input.toLowerCase().trim()
  state.totalKeystrokes += input.length
  state.typedWords.push(normalized)
  const isCorrect = normalized === currentWord.word
  if (isCorrect) {
    state.correctWords++
    state.correctKeystrokes += input.length
    state.combo++
    if (state.combo > state.maxCombo) state.maxCombo = state.combo
    const comboMult = getComboMultiplier(state.combo)
    let points = 10
    if (currentWord.isPowerWord) { points *= 3; state.powerWordsHit++ }
    points = Math.round(points * comboMult)
    state.score += points
    state.currentWordIndex++
    state.currentInput = ''
    updateWPM()
    trackHeatmap(currentWord.word, true)
    if (state.raceType === 'Survival') checkSurvivalEnd()
  } else {
    state.incorrectWords++
    state.combo = 0
    state.lives = Math.max(0, state.lives - (state.raceType === 'Survival' ? 1 : 0))
    trackHeatmap(currentWord.word, false)
  }
  const gameOver = checkRaceEnd()
  if (gameOver) trEndRace()
  return { correct: isCorrect, word: currentWord.word, gameOver }
}

export function trGetTypingOverview() {
  ensureInit()
  if (!state) return { wordCount: 0, categoryBreakdown: {} }
  const s = state
  const categoryBreakdown: Record<string, number> = {}
  for (const w of DEFAULT_WORD_POOL) {
    categoryBreakdown[w.category] = (categoryBreakdown[w.category] || 0) + 1
  }
  return {
    wordCount: DEFAULT_WORD_POOL.length,
    categories: CATEGORY_NAMES,
    categoryBreakdown,
    difficulties: DIFFICULTY_WORD_LENGTHS,
    powerWordCount: DEFAULT_WORD_POOL.filter(w => w.isPowerWord).length,
  }
}

export function trGetStatsGrid() {
  ensureInit()
  if (!state) return getDefaultStatsGrid()
  return {
    totalRaces: state.totalRaces,
    bestWPM: state.bestWPM,
    bestAccuracy: state.bestAccuracy,
    bestScore: state.bestScore,
    bestCombo: state.bestCombo,
    totalWordsTyped: state.totalWordsTyped,
    totalKeystrokes: state.totalKeystrokes,
    avgWPM: state.totalRaces > 0 ? Math.round(state.totalWordsTyped / (state.totalRaces || 1)) : 0,
    avgAccuracy: state.totalRaces > 0 ? Math.round(state.bestAccuracy / 2) : 0,
    dailyStreak: state.dailyStreak,
    powerWordsHit: state.powerWordsHit,
    achievementsUnlocked: state.achievements.filter(a => a.unlocked).length,
    achievementsTotal: state.achievements.length,
  }
}

function getDefaultStatsGrid() {
  return {
    totalRaces: 0, bestWPM: 0, bestAccuracy: 0, bestScore: 0, bestCombo: 0,
    totalWordsTyped: 0, totalKeystrokes: 0, avgWPM: 0, avgAccuracy: 0,
    dailyStreak: 0, powerWordsHit: 0, achievementsUnlocked: 0, achievementsTotal: 15,
  }
}

export function trGetAllRaceTypeCards() {
  const types: RaceType[] = ['Sprint30', 'Sprint60', 'Sprint120', 'Marathon200', 'Survival', 'Zen']
  return types.map(t => {
    const config = RACE_TYPE_CONFIG[t]
    return {
      type: t,
      label: config.label,
      timeLimit: config.timeLimit,
      wordLimit: config.wordLimit,
      lives: config.lives,
      icon: getRaceTypeIcon(t),
      description: getRaceTypeDescription(t),
    }
  })
}

function getRaceTypeIcon(type: RaceType): string {
  switch (type) {
    case 'Sprint30': return '⚡'
    case 'Sprint60': return '🏃'
    case 'Sprint120': return '🏃‍♂️'
    case 'Marathon200': return '🏅'
    case 'Survival': return '🛡️'
    case 'Zen': return '🧘'
  }
}

function getRaceTypeDescription(type: RaceType): string {
  switch (type) {
    case 'Sprint30': return 'Type as many words as possible in 30 seconds'
    case 'Sprint60': return 'Type as many words as possible in 60 seconds'
    case 'Sprint120': return 'Type as many words as possible in 2 minutes'
    case 'Marathon200': return 'Complete 200 words as fast as possible'
    case 'Survival': return 'Type correctly or lose a life. 3 lives total'
    case 'Zen': return 'Relaxed typing with no time or word limit'
  }
}

export function trGetDailyCard() {
  ensureInit()
  if (!state) return { date: getDateString(), difficulty: 'Medium' as Difficulty, raceType: 'Sprint60' as RaceType, targetWPM: 50, targetAccuracy: 90, completed: false, bestWPM: null, bestAccuracy: null }
  const dc = state.dailyChallenge
  return {
    date: dc.date,
    difficulty: dc.difficulty,
    raceType: dc.raceType,
    targetWPM: dc.targetWPM,
    targetAccuracy: dc.targetAccuracy,
    completed: dc.completed,
    bestWPM: dc.bestWPM,
    bestAccuracy: dc.bestAccuracy,
    streak: state.dailyStreak,
  }
}

export function trGetRaceStatus(): { isRacing: boolean; isPaused: boolean; difficulty: Difficulty; raceType: RaceType } {
  ensureInit()
  if (!state) return { isRacing: false, isPaused: false, difficulty: 'Medium', raceType: 'Sprint60' }
  return { isRacing: state.isRacing, isPaused: state.isPaused, difficulty: state.difficulty, raceType: state.raceType }
}

export function trGetCurrentWord(): string {
  ensureInit()
  if (!state || !state.words[state.currentWordIndex]) return ''
  return state.words[state.currentWordIndex].word
}

export function trGetWPM(): number {
  ensureInit()
  if (!state) return 0
  updateWPM()
  return state.wpm
}

export function trGetAccuracy(): number {
  ensureInit()
  if (!state) return 0
  if (state.totalKeystrokes === 0) return 100
  return Math.round((state.correctKeystrokes / state.totalKeystrokes) * 100)
}

export function trGetComboMultiplier(): number {
  ensureInit()
  if (!state) return 1
  return getComboMultiplier(state.combo)
}

export function trGetScore(): number {
  ensureInit()
  if (!state) return 0
  return state.score
}

export function trGetLives(): number {
  ensureInit()
  if (!state) return 3
  return state.lives
}

export function trGetRemainingTime(): number {
  ensureInit()
  if (!state || !state.isRacing || state.timeLimit === 0) return -1
  const elapsed = state.startTime ? (Date.now() - state.startTime) / 1000 : 0
  return Math.max(0, Math.ceil(state.timeLimit - elapsed))
}

export function trGetRaceProgress(): { completed: number; total: number; percent: number } {
  ensureInit()
  if (!state) return { completed: 0, total: 0, percent: 0 }
  const total = state.raceType === 'Marathon200' ? 200 : state.words.length
  return {
    completed: state.correctWords,
    total,
    percent: total > 0 ? Math.round((state.correctWords / total) * 100) : 0,
  }
}

export function trGetRecentRaces(): RaceHistoryEntry[] {
  ensureInit()
  if (!state) return []
  return state.raceHistory
}

export function trGetLeaderboard(): LeaderboardEntry[] {
  ensureInit()
  if (!state) return []
  return state.leaderboard
}

export function trGetAchievements(): Achievement[] {
  ensureInit()
  if (!state) return buildDefaultAchievements()
  return state.achievements
}

export function trGetKeyboardHeatmap(): Record<string, KeyboardHeatmapKey> {
  ensureInit()
  if (!state) return buildDefaultHeatmap()
  return state.keyboardHeatmap
}

export function trGetDailyStreak(): number {
  ensureInit()
  if (!state) return 0
  return state.dailyStreak
}

export function trIsDailyCompleted(): boolean {
  ensureInit()
  if (!state) return false
  return state.dailyChallenge.completed
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function getComboMultiplier(combo: number): number {
  if (combo >= 50) return 3.0
  if (combo >= 30) return 2.5
  if (combo >= 20) return 2.0
  if (combo >= 10) return 1.5
  if (combo >= 5) return 1.2
  return 1.0
}

function updateWPM(): void {
  if (!state || !state.startTime) return
  const elapsed = (Date.now() - state.startTime) / 60000
  if (elapsed > 0) state.wpm = Math.round(state.correctWords / elapsed)
}

function trackHeatmap(word: string, correct: boolean): void {
  if (!state) return
  for (const ch of word) {
    const key = ch.toLowerCase()
    if (state.keyboardHeatmap[key]) {
      state.keyboardHeatmap[key].total++
      if (correct) state.keyboardHeatmap[key].correct++
      else state.keyboardHeatmap[key].incorrect++
    }
  }
}

function checkSurvivalEnd(): void {
  if (!state) return
  if (state.lives <= 0) trEndRace()
}

function checkRaceEnd(): boolean {
  if (!state) return true
  if (!state.isRacing) return true
  if (state.raceType === 'Survival' && state.lives <= 0) return true
  if (state.timeLimit > 0 && state.startTime) {
    const elapsed = (Date.now() - state.startTime) / 1000
    if (elapsed >= state.timeLimit) return true
  }
  if (state.raceType === 'Marathon200' && state.correctWords >= 200) return true
  if (state.currentWordIndex >= state.words.length) return true
  return false
}

function checkAchievements(): void {
  if (!state) return
  const s = state
  const check = (id: string, cond: boolean) => {
    const a = s.achievements.find(x => x.id === id)
    if (a && !a.unlocked && cond) { a.unlocked = true; a.unlockedAt = new Date().toISOString() }
  }
  check('first_race', s.totalRaces >= 1)
  check('speed_demon', s.wpm >= 100)
  check('lightning', s.wpm >= 150)
  check('perfectionist', s.accuracy >= 100)
  check('combo_master', s.maxCombo >= 20)
  check('combo_legend', s.maxCombo >= 50)
  check('marathoner', s.raceType === 'Marathon200' && s.correctWords >= 200)
  check('survivor', s.raceType === 'Survival' && s.correctWords > 0)
  check('zen_master', s.raceType === 'Zen' && s.correctWords >= 500)
  check('power_hunter', s.powerWordsHit >= 10)
  check('centurion', s.totalRaces >= 100)
  check('streak_3', s.dailyStreak >= 3)
  check('streak_7', s.dailyStreak >= 7)
  check('million_keys', s.totalKeystrokes >= 1000000)
}

function checkDailyChallenge(): void {
  if (!state) return
  const dc = state.dailyChallenge
  if (dc.date !== getDateString()) return
  if (state.wpm >= dc.targetWPM && state.accuracy >= dc.targetAccuracy) {
    dc.completed = true
    if (!dc.bestWPM || state.wpm > dc.bestWPM) dc.bestWPM = state.wpm
    if (!dc.bestAccuracy || state.accuracy > dc.bestAccuracy) dc.bestAccuracy = state.accuracy
    if (!dc.completed) state.dailyStreak++
  }
}
