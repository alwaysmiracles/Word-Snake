// racing-circuit-wire.ts — SSR-safe wire module for Word Snake Racing Circuit
// Prefix: ra | NO React | NO localStorage/window | NO setInterval/setTimeout/requestAnimationFrame

// ─── Types ────────────────────────────────────────────────────────────────────

type TrackDifficulty = 'Tutorial' | 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Endurance'
type RaceType = 'QuickRace' | 'Championship' | 'TimeTrial' | 'RelayRace'
type Weather = 'Clear' | 'Rain' | 'Snow' | 'Fog'
type BoostLevel = 0 | 1 | 2 | 3
type ObstacleType = 'OilSlick' | 'SpeedBump' | 'Detour'
type ComponentName = 'Engine' | 'Tires' | 'Turbo' | 'Body' | 'Nitro'

interface TrackData {
  id: number
  name: string
  difficulty: TrackDifficulty
  wordPool: readonly string[]
  laps: number
  baseDistance: number
  description: string
  unlockLevel: number
  icon: string
  weatherPool: Weather[]
}

interface VehicleStats {
  speed: number
  acceleration: number
  handling: number
  boostPower: number
  weight: number
}

interface VehicleData {
  id: number
  name: string
  tier: number
  baseStats: VehicleStats
  price: number
  unlockLevel: number
  icon: string
  description: string
}

interface VehicleUpgrades {
  engine: number
  tires: number
  turbo: number
  body: number
  nitro: number
}

interface OpponentData {
  id: number
  name: string
  personality: string
  skillLevel: number
  preferredVehicle: number
  icon: string
}

interface ObstacleData {
  type: ObstacleType
  word: string
  distance: number
  resolved: boolean
  penalty: number
  hint: string
}

interface RaceSession {
  trackId: number
  raceType: RaceType
  weather: Weather
  distance: number
  totalDistance: number
  currentWord: string
  wordQueue: string[]
  typedWords: string[]
  correctWords: number
  wrongWords: number
  combo: number
  maxCombo: number
  boostMeter: number
  boostLevel: BoostLevel
  isBoosting: boolean
  boostDuration: number
  currentSpeed: number
  baseSpeed: number
  obstacles: ObstacleData[]
  startTime: number
  elapsedTime: number
  isPaused: boolean
  isFinished: boolean
  position: number
  opponents: RaceOpponentState[]
  wordsTyped: number
  coinsEarned: number
  xpEarned: number
}

interface RaceOpponentState {
  opponentId: number
  name: string
  distance: number
  speed: number
  position: number
}

interface ChampionshipData {
  isActive: boolean
  currentRace: number
  totalRaces: number
  trackIds: number[]
  points: number
  standings: ChampionshipStanding[]
  completed: boolean
  season: number
}

interface ChampionshipStanding {
  name: string
  points: number
  wins: number
}

interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  requirement: string
}

interface AchievementState {
  id: string
  unlocked: boolean
  unlockedAt: string | null
  progress: number
  target: number
}

interface DailyRaceData {
  date: string
  trackId: number
  weather: Weather
  modifiers: string[]
  targetPosition: number
  completed: boolean
  bestPosition: number | null
  bestTime: number | null
  coinBonus: number
}

interface RelayTeamMember {
  name: string
  vehicleId: number
  wordsCompleted: number
  distance: number
  isActive: boolean
}

interface RelaySession {
  team: RelayTeamMember[]
  currentMemberIndex: number
  totalDistance: number
  completedDistance: number
}

interface RacingCircuitState {
  level: number
  xp: number
  xpToNext: number
  coins: number
  activeVehicle: number
  ownedVehicles: VehicleData[]
  vehicleUpgrades: Record<number, VehicleUpgrades>
  unlockedTracks: number[]
  championshipProgress: ChampionshipData
  timeTrialRecords: Record<number, number>
  totalRaces: number
  totalWins: number
  totalPodiums: number
  totalWordsTyped: number
  bestCombo: number
  bestAvgSpeed: number
  dailyCompleted: boolean
  achievements: AchievementState[]
  currentRace: RaceSession | null
  currentRelay: RelaySession | null
  dailyRace: DailyRaceData
  driverName: string
  totalCoinsEarned: number
  totalXPEarned: number
  championshipsWon: number
}

// ─── Track Definitions ────────────────────────────────────────────────────────

const TRACKS: readonly TrackData[] = [
  {
    id: 0, name: 'Sprint Strip', difficulty: 'Easy', laps: 2, baseDistance: 500,
    description: 'A short, fast track perfect for beginners. Short words only.',
    unlockLevel: 1, icon: '🏁',
    weatherPool: ['Clear', 'Clear', 'Clear', 'Rain'],
    wordPool: [
      'go','run','fast','win','car','lap','gas','pit','red','top','ace','zen','fun','sun','map',
      'gap','tag','fog','dew','ice','jam','hot','big','dry','fit','fly','hit','joy','key','low',
      'net','oil','pro','set','van','wet','arc','bay','cup','dash','ego','fan','gym','hop',
      'ink','jet','kit','log','mob','nap','oak','pep','rim','ski','tip','urn','vow','wax',
      'yak','zap','box','cow','dip','elk','fin','gum','hat','ice','jar','keg','lip','mud',
    ],
  },
  {
    id: 1, name: 'Word Highway', difficulty: 'Medium', laps: 3, baseDistance: 800,
    description: 'A medium-length highway with mixed word lengths. The classic race.',
    unlockLevel: 3, icon: '🛣️',
    weatherPool: ['Clear', 'Clear', 'Rain', 'Rain', 'Fog'],
    wordPool: [
      'race','speed','track','brake','drift','turbo','boost','wheel','tire','pedal',
      'clutch','engine','steer','wheel','draft','overtake','corner','pitstop','chicane',
      'straight','finish','restart','leader','accelerate','momentum','velocity','throttle',
      'gearbox','suspension','aerodynamic','combustion','cylinder','horsepower','torque',
      'traction','friction','inertia','trajectory','braking','downforce',' spoilers',
      'asphalt','concrete','guardrail','windshield','headlight','exhaust','ignition',
      'carburetor','radiator','alternator','transmission','differential','camshaft',
      'crankshaft','flywheel','manifold','piston','gasket','caliper','rotor','hubcap',
      'sparkplug','milestone','checkered','bumpdraft','blueflag','greenflag','redflag',
      'yellowflag','blackflag','safeteycar','formationlap','standingstart','rollingstart',
    ],
  },
  {
    id: 2, name: 'Vowel Valley', difficulty: 'Easy', laps: 2, baseDistance: 600,
    description: 'Words rich in vowels glide through this lush valley.',
    unlockLevel: 1, icon: '🌿',
    weatherPool: ['Clear', 'Clear', 'Clear', 'Rain', 'Fog'],
    wordPool: [
      'aqua','aria','audio','auto','eagle','eager','early','earth','easel','eaten',
      'evoke','eye','idea','iron','island','oasis','ocean','offer','opera','orbit',
      'order','ounce','outer','outra','quick','quiet','quote','radio','raise','range',
      'reach','real','route','sauce','scale','scene','share','sound','space','stage',
      'trade','train','truth','union','unity','usage','value','voice','vague','cause',
      'curve','equity','nature','rare','eerie','ease','ozone','euphoria','iou','aerie',
    ],
  },
  {
    id: 3, name: 'Consonant Canyon', difficulty: 'Hard', laps: 4, baseDistance: 1000,
    description: 'Dense, consonant-heavy words make this the toughest canyon run.',
    unlockLevel: 10, icon: '🏜️',
    weatherPool: ['Clear', 'Rain', 'Snow', 'Fog'],
    wordPool: [
      'crypt','glyph','lynch','lynx','myth','nymph','psych','rhythm','sphinx','synth',
      'tryst','wraith','wrench','clutch','crunch','scratch','crisp','frost','grasp','blast',
      'blank','brisk','brunt','clasp','crest','crypt','flint','grind','gloom','plumb',
      'prism','scrub','shrug','sleek','slick','slosh','smelt','snare','spade','spelt',
      'splint','stomp','stray','strip','strut','stump','swamp','swarm','swirl','thump',
      'thwart','tramp','trawl','trick','trill','trout','twang','twice','twist','veldt',
      'whack','wheat','whirl','wield','wrack','wraith','wrest','wring','wrist','xerox',
      'jackdaw','cryptic','phlegm','syntax','sylph','tsktsk','glyphs','strength',
    ],
  },
  {
    id: 4, name: 'Alphabet Alley', difficulty: 'Tutorial', laps: 1, baseDistance: 300,
    description: 'A gentle tutorial track. Learn the ropes with simple words.',
    unlockLevel: 1, icon: '📖',
    weatherPool: ['Clear', 'Clear', 'Clear', 'Clear'],
    wordPool: [
      'a','be','cat','dog','ear','egg','fan','go','hat','ink',
      'jam','kit','leg','map','net','oar','pig','rug','sit','tap',
      'up','van','web','box','cow','dip','elk','fig','gum','hen',
      'ice','jar','keg','lip','mop','nap','oak','pan','rug','sip',
      'tap','urn','vet','wax','yam','zip','ace','age','ale','ape',
      'arc','ark','arm','art','axe','bay','bed','bet','bid','bin',
    ],
  },
  {
    id: 5, name: 'Grammar Grand Prix', difficulty: 'Expert', laps: 5, baseDistance: 1500,
    description: 'Only the finest words qualify. Expert-level vocabulary required.',
    unlockLevel: 20, icon: '🏆',
    weatherPool: ['Clear', 'Rain', 'Rain', 'Snow', 'Fog'],
    wordPool: [
      'ubiquitous','quintessential','serendipitous','magnanimous','ephemeral','gregarious',
      'cacophony','juxtapose','paradigm','conundrum','idiosyncratic','melancholy',
      'phenomenal','surreptitious','vicissitude','labyrinth','chrysanthemum',
      'onomatopoeia','bildungsroman','sesquipedalian','antediluvian','verisimilitude',
      'perspicacious','magniloquent','obsequious','loquacious','sycophant','mendacious',
      'prevaricate','recalcitrant','obstreperous','truculent','intransigent','egregious',
      'pulchritudinous','supercilious','equanimity','magnanimous','philanthropic',
      'pragmatic','stoicism','existential','metaphorical','hyperbole','allegory',
      'dichotomy','ambivalence','confluence','dissonance','euphemism','litotes',
      'syllogism','platitude','magnificent','transcendent','philosophical',
      'sophist','erudite','polymath','savant','virtuoso','maestro','connoisseur',
      'raconteur','luminary','visionary','prophet','pioneer','vanguard','paragon',
    ],
  },
  {
    id: 6, name: 'Syllable Speedway', difficulty: 'Medium', laps: 3, baseDistance: 900,
    description: 'Multi-syllable words speed you along this twisting speedway.',
    unlockLevel: 5, icon: '🔊',
    weatherPool: ['Clear', 'Clear', 'Rain', 'Rain', 'Snow'],
    wordPool: [
      'amazing','beautiful','calendar','database','elephant','family','generate','habitat',
      'imagine','journey','kangaroo','language','mountain','navigate','obstacle','parachute',
      'question','remember','standard','tomorrow','umbrella','vacation','workshop','yesterday',
      'absolute','boundary','callback','deliver','external','fragment','generate','historic',
      'identify','junkyard','keyboard','laser','midnight','notebook','optimize','pipeline',
      'quantity','register','solution','template','umbrella','variable','wireframe','business',
      'champion','decorator','eloquent','function','graphics','hardware','industry','junction',
      'keyboard','magnetic','notebook','overload','platform','research','scenario','terminal',
      'universe','vertical','whatever','yourself','abstract','callback','document','encrypt',
      'firmware','gradient','homepage','instance','jumpstart','keyboard','lifecycle',
    ],
  },
  {
    id: 7, name: 'Marathon Mile', difficulty: 'Endurance', laps: 8, baseDistance: 2000,
    description: 'An endurance test of stamina and consistency. Long race, steady pace.',
    unlockLevel: 15, icon: '🏃',
    weatherPool: ['Clear', 'Rain', 'Rain', 'Snow', 'Snow', 'Fog'],
    wordPool: [
      'run','jog','sprint','dash','race','endure','persist','steady','pace','grip',
      'breath','sweat','push','drive','climb','strive','focus','grit','power','force',
      'energy','vigor','stamina','muscle','courage','spirit','determination','discipline',
      'patience','resilience','tenacity','fortitude','willpower','endurance','dedication',
      'commitment','training','stretch','warmup','cool','hydrat','recover','fuel',
      'nutrition','protein','carbs','electrolyte','heart','pulse','rhythm','cadence',
      'mile','kilometer','marathon','triathlon','decathlon','ultra','ironman','finisher',
      'medal','trophy','champion','personal','record','lap','split','checkpoint','relay',
      'baton','anchor','leg','team','squad','coach','support','cheer','crowd','route',
      'trail','path','road','track','field','terrain','hill','slope','descent','ascent',
    ],
  },
]

// ─── Vehicle Definitions ──────────────────────────────────────────────────────

const VEHICLES: readonly VehicleData[] = [
  {
    id: 0, name: 'Go-Kart', tier: 1, price: 0, unlockLevel: 1, icon: '🏎️',
    description: 'The starter kart. Lightweight and nimble.',
    baseStats: { speed: 30, acceleration: 50, handling: 60, boostPower: 20, weight: 10 },
  },
  {
    id: 1, name: 'Buggy', tier: 2, price: 500, unlockLevel: 3, icon: '🚙',
    description: 'A rugged off-road buggy with decent all-around stats.',
    baseStats: { speed: 40, acceleration: 45, handling: 50, boostPower: 30, weight: 25 },
  },
  {
    id: 2, name: 'Sedan', tier: 3, price: 1200, unlockLevel: 6, icon: '🚗',
    description: 'A reliable sedan with balanced performance.',
    baseStats: { speed: 50, acceleration: 40, handling: 45, boostPower: 35, weight: 40 },
  },
  {
    id: 3, name: 'Coupe', tier: 3, price: 1500, unlockLevel: 8, icon: '🚘',
    description: 'Sporty two-door with impressive acceleration.',
    baseStats: { speed: 55, acceleration: 55, handling: 40, boostPower: 40, weight: 35 },
  },
  {
    id: 4, name: 'Muscle Car', tier: 4, price: 2500, unlockLevel: 12, icon: '💪',
    description: 'Raw power under the hood. Poor handling, massive speed.',
    baseStats: { speed: 70, acceleration: 50, handling: 25, boostPower: 55, weight: 60 },
  },
  {
    id: 5, name: 'Sports Car', tier: 4, price: 3000, unlockLevel: 15, icon: '🏎️',
    description: 'Track-tuned precision machine. Great handling and speed.',
    baseStats: { speed: 65, acceleration: 60, handling: 55, boostPower: 50, weight: 45 },
  },
  {
    id: 6, name: 'GT Racer', tier: 5, price: 5000, unlockLevel: 20, icon: '🏁',
    description: 'Grand touring excellence. Built for long races.',
    baseStats: { speed: 75, acceleration: 55, handling: 60, boostPower: 55, weight: 50 },
  },
  {
    id: 7, name: 'Formula', tier: 5, price: 7000, unlockLevel: 25, icon: '🏎️',
    description: 'Open-wheel formula racer. Ultimate track performance.',
    baseStats: { speed: 85, acceleration: 70, handling: 75, boostPower: 60, weight: 30 },
  },
  {
    id: 8, name: 'Supercar', tier: 6, price: 10000, unlockLevel: 30, icon: '⭐',
    description: 'Exotic supercar. Blistering speed and beautiful design.',
    baseStats: { speed: 90, acceleration: 75, handling: 65, boostPower: 70, weight: 40 },
  },
  {
    id: 9, name: 'Rally Car', tier: 6, price: 12000, unlockLevel: 32, icon: '🌍',
    description: 'All-terrain rally machine. Excels in any weather.',
    baseStats: { speed: 70, acceleration: 65, handling: 80, boostPower: 55, weight: 45 },
  },
  {
    id: 10, name: 'Prototype', tier: 7, price: 18000, unlockLevel: 36, icon: '🔬',
    description: 'Experimental prototype. Cutting-edge technology.',
    baseStats: { speed: 95, acceleration: 80, handling: 70, boostPower: 80, weight: 35 },
  },
  {
    id: 11, name: 'Hypercar', tier: 8, price: 30000, unlockLevel: 40, icon: '💎',
    description: 'The pinnacle of automotive engineering. Untouchable performance.',
    baseStats: { speed: 100, acceleration: 90, handling: 80, boostPower: 95, weight: 42 },
  },
]

// ─── Opponent Definitions ─────────────────────────────────────────────────────

const OPPONENTS: readonly OpponentData[] = [
  { id: 0, name: 'Turbo Tina', personality: 'Aggressive overtaker, relies on speed', skillLevel: 3, preferredVehicle: 3, icon: '👩‍✈️' },
  { id: 1, name: 'Steady Eddie', personality: 'Consistent and reliable, never makes mistakes', skillLevel: 5, preferredVehicle: 2, icon: '👨‍🔧' },
  { id: 2, name: 'Drift King Dan', personality: 'Loves corners, loses speed on straights', skillLevel: 4, preferredVehicle: 5, icon: '🛞' },
  { id: 3, name: 'Nitro Nick', personality: 'Boost-happy, burns through boost early', skillLevel: 2, preferredVehicle: 4, icon: '🚀' },
  { id: 4, name: 'Precision Pam', personality: 'Perfect accuracy, slow but flawless', skillLevel: 6, preferredVehicle: 6, icon: '🎯' },
  { id: 5, name: 'Rookie Ray', personality: 'Inexperienced but enthusiastic, erratic', skillLevel: 1, preferredVehicle: 0, icon: '🆕' },
  { id: 6, name: 'Veteran Val', personality: 'Years of experience, smart race management', skillLevel: 7, preferredVehicle: 7, icon: '🎖️' },
  { id: 7, name: 'Flash Fiona', personality: 'Lightning-fast starts, fades at the end', skillLevel: 3, preferredVehicle: 8, icon: '⚡' },
  { id: 8, name: 'Weather Will', personality: 'Thrives in bad conditions, struggles in clear', skillLevel: 5, preferredVehicle: 9, icon: '🌧️' },
  { id: 9, name: 'Techno Tom', personality: 'Data-driven, calculates every move', skillLevel: 6, preferredVehicle: 10, icon: '🤖' },
  { id: 10, name: 'Champion Chloe', personality: 'The one to beat. All-round excellence.', skillLevel: 9, preferredVehicle: 11, icon: '👑' },
  { id: 11, name: 'Cruiser Carl', personality: 'Endurance specialist, gets stronger over time', skillLevel: 4, preferredVehicle: 6, icon: '🛣️' },
]

// ─── Achievement Definitions ──────────────────────────────────────────────────

const ACHIEVEMENT_DEFS: readonly AchievementDef[] = [
  { id: 'first_victory', name: 'First Victory', description: 'Win your first race', icon: '🏆', requirement: 'win 1 race' },
  { id: 'champion', name: 'Champion', description: 'Win a full Championship series', icon: '🥇', requirement: 'win championship' },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Reach 200 km/h in a race', icon: '⚡', requirement: 'reach 200 speed' },
  { id: 'perfect_run', name: 'Perfect Run', description: 'Complete a race with 0 wrong words', icon: '💎', requirement: '0 wrong words' },
  { id: 'collector', name: 'Collector', description: 'Own 6 or more vehicles', icon: '🚗', requirement: 'own 6 vehicles' },
  { id: 'garage_full', name: 'Garage Full', description: 'Own all 12 vehicles', icon: '🏪', requirement: 'own 12 vehicles' },
  { id: 'combo_king', name: 'Combo King', description: 'Achieve a 25-word combo streak', icon: '🔥', requirement: '25 combo' },
  { id: 'combo_legend', name: 'Combo Legend', description: 'Achieve a 50-word combo streak', icon: '💫', requirement: '50 combo' },
  { id: 'word_master', name: 'Word Master', description: 'Type 1,000 words total', icon: '📝', requirement: 'type 1000 words' },
  { id: 'endurance_runner', name: 'Endurance Runner', description: 'Complete Marathon Mile', icon: '🏃', requirement: 'finish marathon' },
  { id: 'trial_blazer', name: 'Trial Blazer', description: 'Set a time trial record on any track', icon: '⏱️', requirement: 'set time trial record' },
  { id: 'upgraded', name: 'Fully Upgraded', description: 'Max out all upgrades on one vehicle', icon: '🔧', requirement: 'max all upgrades' },
  { id: 'daily_streak_3', name: 'Hat Trick', description: 'Complete 3 daily races', icon: '🎩', requirement: '3 daily streak' },
  { id: 'daily_streak_7', name: 'Week Warrior', description: 'Complete 7 daily races', icon: '📅', requirement: '7 daily streak' },
  { id: 'podium_regular', name: 'Podium Regular', description: 'Finish on the podium 10 times', icon: '🥉', requirement: '10 podiums' },
]

// ─── Weather Effect Modifiers ─────────────────────────────────────────────────

const WEATHER_EFFECTS: Record<Weather, { handlingMod: number; speedMod: number; visibilityMod: number; description: string }> = {
  Clear: { handlingMod: 1.0, speedMod: 1.0, visibilityMod: 1.0, description: 'Perfect racing conditions.' },
  Rain: { handlingMod: 0.75, speedMod: 0.85, visibilityMod: 0.7, description: 'Wet track reduces grip and visibility.' },
  Snow: { handlingMod: 0.6, speedMod: 0.7, visibilityMod: 0.6, description: 'Snow and ice make for treacherous driving.' },
  Fog: { handlingMod: 0.85, speedMod: 0.9, visibilityMod: 0.4, description: 'Thick fog severely limits visibility.' },
}

// ─── Obstacle Definitions ─────────────────────────────────────────────────────

const OBSTACLE_TYPES: readonly ObstacleType[] = ['OilSlick', 'SpeedBump', 'Detour']

const OBSTACLE_WORDS: Record<ObstacleType, string[]> = {
  OilSlick: ['slip','slide','swerve','brake','grip','recover','steady','avoid','skid','caution'],
  SpeedBump: ['slow','crawl','bounce','jolt','absorb','resume','careful','gentle','patrol','navigate'],
  Detour: ['left','right','merge','yield','signal','lane','turn','divert','reroute','bypass'],
}

const OBSTACLE_PENALTIES: Record<ObstacleType, number> = {
  OilSlick: 15,
  SpeedBump: 10,
  Detour: 20,
}

const OBSTACLE_HINTS: Record<ObstacleType, string> = {
  OilSlick: 'Type the word to regain control!',
  SpeedBump: 'Slow down by typing the word!',
  Detour: 'Navigate the detour with the right word!',
}

// ─── Component Upgrade Definitions ────────────────────────────────────────────

const COMPONENT_NAMES: readonly ComponentName[] = ['Engine', 'Tires', 'Turbo', 'Body', 'Nitro']

const COMPONENT_EFFECTS: Record<ComponentName, keyof VehicleStats> = {
  Engine: 'speed',
  Tires: 'handling',
  Turbo: 'boostPower',
  Body: 'weight',
  Nitro: 'acceleration',
}

const UPGRADE_COSTS: number[] = [
  100, 200, 400, 700, 1100, 1600, 2200, 3000, 4000, 5500,
]

const UPGRADE_EFFECTS_PER_LEVEL: number = 3

const MAX_UPGRADE_LEVEL = 10

// ─── Championship Point System ────────────────────────────────────────────────

const CHAMPIONSHIP_POINTS = [10, 8, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0]

// ─── XP Level System ──────────────────────────────────────────────────────────

const BASE_XP_TO_NEXT = 100
const XP_GROWTH_FACTOR = 1.25
const MAX_LEVEL = 40

// ─── Daily Race Modifiers ─────────────────────────────────────────────────────

const DAILY_MODIFIERS = [
  'Double Coins', 'Extra Boost', 'Harder Words', 'More Obstacles',
  'Faster Opponents', 'Relaxed Pace', 'No Boost', 'Bonus XP',
]

// ─── PRNG ─────────────────────────────────────────────────────────────────────

function seededRandom(seed: string): () => number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  }
  return () => {
    h = h ^ (h << 13)
    h = h ^ (h >> 17)
    h = h ^ (h << 5)
    return (h >>> 0) / 4294967296
  }
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function getDateString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function shuffleArray<T>(arr: readonly T[], rng?: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = rng ? Math.floor(rng() * (i + 1)) : Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function xpRequiredForLevel(level: number): number {
  return Math.floor(BASE_XP_TO_NEXT * Math.pow(XP_GROWTH_FACTOR, level - 1))
}

function createDefaultUpgrades(): VehicleUpgrades {
  return { engine: 0, tires: 0, turbo: 0, body: 0, nitro: 0 }
}

function createDefaultAchievements(): AchievementState[] {
  return ACHIEVEMENT_DEFS.map(a => ({
    id: a.id,
    unlocked: false,
    unlockedAt: null,
    progress: 0,
    target: getAchievementTarget(a.id),
  }))
}

function getAchievementTarget(id: string): number {
  switch (id) {
    case 'first_victory': return 1
    case 'champion': return 1
    case 'speed_demon': return 200
    case 'perfect_run': return 1
    case 'collector': return 6
    case 'garage_full': return 12
    case 'combo_king': return 25
    case 'combo_legend': return 50
    case 'word_master': return 1000
    case 'endurance_runner': return 1
    case 'trial_blazer': return 1
    case 'upgraded': return 1
    case 'daily_streak_3': return 3
    case 'daily_streak_7': return 7
    case 'podium_regular': return 10
    default: return 1
  }
}

function buildDailyRace(): DailyRaceData {
  const today = getDateString()
  const rng = seededRandom('daily-race-' + today)
  const trackIds = TRACKS.filter(t => t.unlockLevel <= 15).map(t => t.id)
  const trackId = trackIds[Math.floor(rng() * trackIds.length)]
  const weathers: Weather[] = ['Clear', 'Rain', 'Snow', 'Fog']
  const weather = weathers[Math.floor(rng() * weathers.length)]
  const modifierCount = 1 + Math.floor(rng() * 3)
  const modifiers = shuffleArray(DAILY_MODIFIERS, rng).slice(0, modifierCount)
  return {
    date: today,
    trackId,
    weather,
    modifiers,
    targetPosition: 3,
    completed: false,
    bestPosition: null,
    bestTime: null,
    coinBonus: 200 + Math.floor(rng() * 300),
  }
}

function buildChampionshipStandings(): ChampionshipStanding[] {
  return OPPONENTS.slice(0, 7).map(o => ({
    name: o.name,
    points: 0,
    wins: 0,
  }))
}

function generateWordQueue(track: TrackData, count: number, rng?: () => number): string[] {
  const pool = [...track.wordPool]
  const queue: string[] = []
  while (queue.length < count) {
    const shuffled = shuffleArray(pool, rng)
    for (const w of shuffled) {
      if (queue.length >= count) break
      queue.push(w)
    }
  }
  return queue
}

function generateObstacles(trackDistance: number, rng: () => number): ObstacleData[] {
  const obstacles: ObstacleData[] = []
  const count = 3 + Math.floor(rng() * 5)
  for (let i = 0; i < count; i++) {
    const type = OBSTACLE_TYPES[Math.floor(rng() * OBSTACLE_TYPES.length)]
    const words = OBSTACLE_WORDS[type]
    const word = words[Math.floor(rng() * words.length)]
    const distance = Math.floor((trackDistance / (count + 1)) * (i + 1)) + Math.floor(rng() * 50 - 25)
    obstacles.push({
      type,
      word,
      distance: Math.max(50, distance),
      resolved: false,
      penalty: OBSTACLE_PENALTIES[type],
      hint: OBSTACLE_HINTS[type],
    })
  }
  return obstacles
}

function generateOpponentStates(trackId: number, weather: Weather, rng: () => number): RaceOpponentState[] {
  const numOpponents = 5 + Math.floor(rng() * 4)
  const shuffled = shuffleArray(OPPONENTS, rng)
  const selected = shuffled.slice(0, numOpponents)
  const weatherMod = WEATHER_EFFECTS[weather]
  return selected.map(o => {
    const skillMod = 0.5 + (o.skillLevel / 10) * 0.5
    const baseSpeed = 20 + o.skillLevel * 8
    const weatherSkill = o.name === 'Weather Will' && weather !== 'Clear' ? 1.2 : 1.0
    const speed = Math.floor(baseSpeed * weatherMod.speedMod * skillMod * weatherSkill)
    return {
      opponentId: o.id,
      name: o.name,
      distance: 0,
      speed: Math.max(10, speed),
      position: 0,
    }
  })
}

function advanceOpponents(opponents: RaceOpponentState[], rng: () => number): void {
  for (const opp of opponents) {
    const variance = 0.8 + rng() * 0.4
    const advance = Math.floor(opp.speed * variance)
    opp.distance += Math.max(1, advance)
  }
  // Recalculate positions
  const sorted = [...opponents].sort((a, b) => b.distance - a.distance)
  sorted.forEach((opp, idx) => { opp.position = idx + 1 })
}

function calculatePlayerPosition(playerDistance: number, opponents: RaceOpponentState[]): number {
  let pos = 1
  for (const opp of opponents) {
    if (opp.distance > playerDistance) pos++
  }
  return pos
}

function getPlayerSpeed(baseStats: VehicleStats, upgrades: VehicleUpgrades, weather: Weather): number {
  const weatherMod = WEATHER_EFFECTS[weather]
  const upgradedSpeed = baseStats.speed + (upgrades.engine * UPGRADE_EFFECTS_PER_LEVEL)
  const upgradedAccel = baseStats.acceleration + (upgrades.nitro * UPGRADE_EFFECTS_PER_LEVEL)
  const effectiveSpeed = (upgradedSpeed * 0.6 + upgradedAccel * 0.4)
  return Math.floor(effectiveSpeed * weatherMod.speedMod)
}

function getPlayerHandling(baseStats: VehicleStats, upgrades: VehicleUpgrades, weather: Weather): number {
  const weatherMod = WEATHER_EFFECTS[weather]
  const baseHandling = baseStats.handling + (upgrades.tires * UPGRADE_EFFECTS_PER_LEVEL)
  return Math.floor(baseHandling * weatherMod.handlingMod)
}

function getEffectiveVehicleStats(vehicleId: number, upgrades: VehicleUpgrades): VehicleStats {
  const vehicle = VEHICLES.find(v => v.id === vehicleId)
  if (!vehicle) return VEHICLES[0].baseStats
  const base = vehicle.baseStats
  return {
    speed: base.speed + (upgrades.engine * UPGRADE_EFFECTS_PER_LEVEL),
    acceleration: base.acceleration + (upgrades.nitro * UPGRADE_EFFECTS_PER_LEVEL),
    handling: base.handling + (upgrades.tires * UPGRADE_EFFECTS_PER_LEVEL),
    boostPower: base.boostPower + (upgrades.turbo * UPGRADE_EFFECTS_PER_LEVEL),
    weight: Math.max(5, base.weight - (upgrades.body * 2)),
  }
}

function calculateRaceRewards(
  position: number,
  trackDifficulty: TrackDifficulty,
  correctWords: number,
  wrongWords: number,
  maxCombo: number,
  elapsedTime: number,
  raceType: RaceType,
): { coins: number; xp: number } {
  const positionMultiplier = Math.max(0.2, 1.5 - (position - 1) * 0.15)
  const difficultyMultiplier = { Tutorial: 0.8, Easy: 1.0, Medium: 1.3, Hard: 1.6, Expert: 2.0, Endurance: 1.8 }[trackDifficulty]
  const baseCoins = 50 + Math.floor(correctWords * 3 * difficultyMultiplier * positionMultiplier)
  const comboBonus = Math.floor(maxCombo * 5)
  const noMistakesBonus = wrongWords === 0 ? 100 : 0
  const coins = baseCoins + comboBonus + noMistakesBonus

  const baseXP = 30 + Math.floor(correctWords * 2 * difficultyMultiplier * positionMultiplier)
  const winBonus = position === 1 ? 50 : 0
  const xp = baseXP + winBonus + comboBonus

  return { coins, xp }
}

function checkAndUnlockAchievements(s: RacingCircuitState): void {
  const check = (id: string, progress: number) => {
    const ach = s.achievements.find(a => a.id === id)
    if (ach && !ach.unlocked && progress >= ach.target) {
      ach.unlocked = true
      ach.unlockedAt = new Date().toISOString()
    }
    if (ach && !ach.unlocked) {
      ach.progress = progress
    }
  }

  check('first_victory', s.totalWins)
  check('champion', s.championshipsWon)
  check('speed_demon', s.bestAvgSpeed)
  check('perfect_run', s.currentRace && s.currentRace.wrongWords === 0 && s.currentRace.isFinished ? 1 : 0)
  check('collector', s.ownedVehicles.length)
  check('garage_full', s.ownedVehicles.length)
  check('combo_king', s.bestCombo)
  check('combo_legend', s.bestCombo)
  check('word_master', s.totalWordsTyped)
  check('endurance_runner', 1) // Handled externally
  check('trial_blazer', Object.keys(s.timeTrialRecords).length)
  check('upgraded', s.ownedVehicles.filter(v => {
    const up = s.vehicleUpgrades[v.id]
    return up && up.engine >= MAX_UPGRADE_LEVEL && up.tires >= MAX_UPGRADE_LEVEL &&
      up.turbo >= MAX_UPGRADE_LEVEL && up.body >= MAX_UPGRADE_LEVEL && up.nitro >= MAX_UPGRADE_LEVEL
  }).length)
  check('daily_streak_3', 0) // Handled externally
  check('daily_streak_7', 0)
  check('podium_regular', s.totalPodiums)
}

// ─── Module State ─────────────────────────────────────────────────────────────

let state: RacingCircuitState | null = null

// ─── Init ─────────────────────────────────────────────────────────────────────

function createDefaultState(): RacingCircuitState {
  return {
    level: 1,
    xp: 0,
    xpToNext: xpRequiredForLevel(1),
    coins: 500,
    activeVehicle: 0,
    ownedVehicles: [VEHICLES[0]],
    vehicleUpgrades: { 0: createDefaultUpgrades() },
    unlockedTracks: [0, 2, 4],
    championshipProgress: {
      isActive: false,
      currentRace: 0,
      totalRaces: 5,
      trackIds: [],
      points: 0,
      standings: buildChampionshipStandings(),
      completed: false,
      season: 1,
    },
    timeTrialRecords: {},
    totalRaces: 0,
    totalWins: 0,
    totalPodiums: 0,
    totalWordsTyped: 0,
    bestCombo: 0,
    bestAvgSpeed: 0,
    dailyCompleted: false,
    achievements: createDefaultAchievements(),
    currentRace: null,
    currentRelay: null,
    dailyRace: buildDailyRace(),
    driverName: 'Racer',
    totalCoinsEarned: 0,
    totalXPEarned: 0,
    championshipsWon: 0,
  }
}

function ensureInit(): void {
  if (!state) state = createDefaultState()
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── EXPORTED FUNCTIONS ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─── State Management ─────────────────────────────────────────────────────────

export function raGetState(): RacingCircuitState {
  ensureInit()
  return state!
}

export function raResetState(): void {
  state = null
}

export function raInit(): void {
  ensureInit()
}

export function raSetDriverName(name: string): void {
  ensureInit()
  if (state) state.driverName = name.slice(0, 20)
}

export function raGetDriverName(): string {
  ensureInit()
  return state?.driverName ?? 'Racer'
}

// ─── Vehicle Management ───────────────────────────────────────────────────────

export function raGetVehicles(): { all: VehicleData[]; owned: VehicleData[]; active: VehicleData } {
  ensureInit()
  if (!state) {
    const starter = VEHICLES[0]
    return { all: [...VEHICLES], owned: [starter], active: starter }
  }
  return {
    all: [...VEHICLES],
    owned: [...state.ownedVehicles],
    active: state.ownedVehicles.find(v => v.id === state.activeVehicle) ?? state.ownedVehicles[0],
  }
}

export function raBuyVehicle(vehicleId: number): { success: boolean; message: string } {
  ensureInit()
  if (!state) return { success: false, message: 'State not initialized' }
  const vehicle = VEHICLES.find(v => v.id === vehicleId)
  if (!vehicle) return { success: false, message: 'Vehicle not found' }
  if (state.ownedVehicles.some(v => v.id === vehicleId)) return { success: false, message: 'Already owned' }
  if (state.level < vehicle.unlockLevel) return { success: false, message: `Requires level ${vehicle.unlockLevel}` }
  if (state.coins < vehicle.price) return { success: false, message: `Need ${vehicle.price} coins` }

  state.coins -= vehicle.price
  state.ownedVehicles.push(vehicle)
  state.vehicleUpgrades[vehicleId] = createDefaultUpgrades()
  checkAndUnlockAchievements(state)
  return { success: true, message: `Purchased ${vehicle.name}!` }
}

export function raSetActiveVehicle(vehicleId: number): boolean {
  ensureInit()
  if (!state) return false
  if (state.ownedVehicles.some(v => v.id === vehicleId)) {
    state.activeVehicle = vehicleId
    return true
  }
  return false
}

export function raGetVehicleStats(vehicleId: number): VehicleStats {
  ensureInit()
  if (!state) return VEHICLES[0].baseStats
  const upgrades = state.vehicleUpgrades[vehicleId] ?? createDefaultUpgrades()
  return getEffectiveVehicleStats(vehicleId, upgrades)
}

export function raGetVehicleDetails(vehicleId: number): VehicleData | null {
  return VEHICLES.find(v => v.id === vehicleId) ?? null
}

// ─── Upgrade Management ───────────────────────────────────────────────────────

export function raGetUpgrades(vehicleId: number): VehicleUpgrades {
  ensureInit()
  if (!state) return createDefaultUpgrades()
  return state.vehicleUpgrades[vehicleId] ?? createDefaultUpgrades()
}

export function raUpgradeComponent(vehicleId: number, component: ComponentName): { success: boolean; message: string; cost: number } {
  ensureInit()
  if (!state) return { success: false, message: 'State not initialized', cost: 0 }
  if (!state.ownedVehicles.some(v => v.id === vehicleId)) return { success: false, message: 'Vehicle not owned', cost: 0 }
  const upgrades = state.vehicleUpgrades[vehicleId]
  if (!upgrades) return { success: false, message: 'No upgrade data', cost: 0 }

  const currentLevel = upgrades[component]
  if (currentLevel >= MAX_UPGRADE_LEVEL) return { success: false, message: 'Already maxed', cost: 0 }
  if (state.level < 5 + currentLevel * 3) return { success: false, message: `Requires level ${5 + currentLevel * 3}`, cost: 0 }

  const cost = UPGRADE_COSTS[currentLevel]
  if (state.coins < cost) return { success: false, message: `Need ${cost} coins`, cost }

  state.coins -= cost
  upgrades[component] = currentLevel + 1
  checkAndUnlockAchievements(state)
  return { success: true, message: `${component} upgraded to level ${currentLevel + 1}!`, cost }
}

export function raGetUpgradeCost(currentLevel: number): number {
  if (currentLevel >= MAX_UPGRADE_LEVEL) return 0
  return UPGRADE_COSTS[currentLevel] ?? 0
}

export function raGetUpgradeEffect(vehicleId: number, component: ComponentName): { current: number; next: number; maxed: boolean } {
  ensureInit()
  if (!state) return { current: 0, next: UPGRADE_EFFECTS_PER_LEVEL, maxed: false }
  const upgrades = state.vehicleUpgrades[vehicleId] ?? createDefaultUpgrades()
  const currentLevel = upgrades[component]
  const statKey = COMPONENT_EFFECTS[component]
  const vehicle = VEHICLES.find(v => v.id === vehicleId)
  const baseStat = vehicle ? vehicle.baseStats[statKey] : 0
  const current = baseStat + currentLevel * UPGRADE_EFFECTS_PER_LEVEL
  const next = currentLevel < MAX_UPGRADE_LEVEL ? UPGRADE_EFFECTS_PER_LEVEL : 0
  return { current, next, maxed: currentLevel >= MAX_UPGRADE_LEVEL }
}

export function raGetMaxUpgradeLevel(): number {
  return MAX_UPGRADE_LEVEL
}

export function raGetComponentNames(): readonly ComponentName[] {
  return COMPONENT_NAMES
}

// ─── Track Management ─────────────────────────────────────────────────────────

export function raGetTracks(): TrackData[] {
  return [...TRACKS]
}

export function raUnlockTrack(trackId: number): boolean {
  ensureInit()
  if (!state) return false
  const track = TRACKS.find(t => t.id === trackId)
  if (!track) return false
  if (state.level < track.unlockLevel) return false
  if (state.unlockedTracks.includes(trackId)) return false
  state.unlockedTracks.push(trackId)
  return true
}

export function raGetTrackInfo(trackId: number): TrackData | null {
  return TRACKS.find(t => t.id === trackId) ?? null
}

export function raGetTrackWords(trackId: number, count?: number): string[] {
  const track = TRACKS.find(t => t.id === trackId)
  if (!track) return []
  const rng = seededRandom('track-words-' + trackId + '-' + getDateString())
  return generateWordQueue(track, count ?? 30, rng)
}

export function raGetUnlockedTracks(): TrackData[] {
  ensureInit()
  if (!state) return TRACKS.filter(t => t.unlockLevel <= 1)
  return TRACKS.filter(t => state.unlockedTracks.includes(t.id))
}

export function raIsTrackUnlocked(trackId: number): boolean {
  ensureInit()
  if (!state) return false
  return state.unlockedTracks.includes(trackId)
}

// ─── Racing Core ──────────────────────────────────────────────────────────────

export function raStartRace(trackId: number, raceType: RaceType, weatherOverride?: Weather): { success: boolean; message: string } {
  ensureInit()
  if (!state) return { success: false, message: 'Not initialized' }
  if (state.currentRace && !state.currentRace.isFinished) return { success: false, message: 'Race already in progress' }

  const track = TRACKS.find(t => t.id === trackId)
  if (!track) return { success: false, message: 'Track not found' }
  if (!state.unlockedTracks.includes(trackId)) return { success: false, message: 'Track locked' }

  const rng = seededRandom('race-' + trackId + '-' + Date.now())
  const weather = weatherOverride ?? track.weatherPool[Math.floor(rng() * track.weatherPool.length)]
  const vehicle = state.ownedVehicles.find(v => v.id === state.activeVehicle) ?? state.ownedVehicles[0]
  const upgrades = state.vehicleUpgrades[vehicle.id] ?? createDefaultUpgrades()
  const baseSpeed = getPlayerSpeed(vehicle.baseStats, upgrades, weather)
  const totalDistance = track.baseDistance * track.laps
  const wordCount = raceType === 'RelayRace' ? Math.floor(totalDistance / 5) : Math.max(20, Math.floor(totalDistance / 8))

  const wordQueue = generateWordQueue(track, wordCount, rng)
  const obstacles = generateObstacles(totalDistance, rng)
  const opponents = generateOpponentStates(trackId, weather, rng)

  state.currentRace = {
    trackId,
    raceType,
    weather,
    distance: 0,
    totalDistance,
    currentWord: wordQueue[0] ?? '',
    wordQueue,
    typedWords: [],
    correctWords: 0,
    wrongWords: 0,
    combo: 0,
    maxCombo: 0,
    boostMeter: 0,
    boostLevel: 0,
    isBoosting: false,
    boostDuration: 0,
    currentSpeed: baseSpeed,
    baseSpeed,
    obstacles,
    startTime: Date.now(),
    elapsedTime: 0,
    isPaused: false,
    isFinished: false,
    position: opponents.length + 1,
    opponents,
    wordsTyped: 0,
    coinsEarned: 0,
    xpEarned: 0,
  }

  if (raceType === 'RelayRace') {
    state.currentRelay = {
      team: [
        { name: state.driverName, vehicleId: vehicle.id, wordsCompleted: 0, distance: 0, isActive: true },
        { name: 'Teammate Ace', vehicleId: state.ownedVehicles[0]?.id ?? 0, wordsCompleted: 0, distance: 0, isActive: false },
        { name: 'Teammate Bolt', vehicleId: state.ownedVehicles[0]?.id ?? 0, wordsCompleted: 0, distance: 0, isActive: false },
      ],
      currentMemberIndex: 0,
      totalDistance,
      completedDistance: 0,
    }
  }

  return { success: true, message: `Race started on ${track.name}!` }
}

export function raTypeWord(input: string): {
  correct: boolean
  word: string
  distanceGained: number
  newCombo: number
  boostGained: number
  obstacleHit: ObstacleData | null
} {
  ensureInit()
  if (!state?.currentRace || state.currentRace.isFinished) {
    return { correct: false, word: '', distanceGained: 0, newCombo: 0, boostGained: 0, obstacleHit: null }
  }

  const race = state.currentRace
  const normalized = input.toLowerCase().trim()
  const expected = race.currentWord.toLowerCase()
  race.typedWords.push(normalized)
  race.wordsTyped++

  // Check for active obstacle
  const activeObstacle = race.obstacles.find(o => !o.resolved && Math.abs(race.distance - o.distance) < 30)
  if (activeObstacle) {
    if (normalized === activeObstacle.word) {
      activeObstacle.resolved = true
      race.combo++
      race.boostMeter = clamp(race.boostMeter + 5, 0, 100)
      nextWord(race)
      return { correct: true, word: activeObstacle.word, distanceGained: 15, newCombo: race.combo, boostGained: 5, obstacleHit: activeObstacle }
    } else {
      race.distance = Math.max(0, race.distance - activeObstacle.penalty)
      race.combo = 0
      race.currentSpeed = Math.max(5, race.currentSpeed - 10)
      nextWord(race)
      return { correct: false, word: activeObstacle.word, distanceGained: -activeObstacle.penalty, newCombo: 0, boostGained: 0, obstacleHit: activeObstacle }
    }
  }

  const isCorrect = normalized === expected
  if (isCorrect) {
    race.correctWords++
    race.combo++
    if (race.combo > race.maxCombo) race.maxCombo = race.combo

    // Distance gained based on word length and speed
    const wordBonus = Math.floor(normalized.length * 1.5)
    const comboBonus = race.combo >= 10 ? Math.floor(race.combo * 0.5) : 0
    const distanceGained = race.currentSpeed + wordBonus + comboBonus
    race.distance += distanceGained

    // Boost meter
    const boostGain = 3 + Math.floor(normalized.length * 0.5) + (race.combo >= 5 ? 2 : 0)
    race.boostMeter = clamp(race.boostMeter + boostGain, 0, 100)
    updateBoostLevel(race)

    // Speed adjustment
    race.currentSpeed = race.baseSpeed + Math.floor(race.combo * 0.3)
    if (race.isBoosting) {
      const vehicle = VEHICLES.find(v => v.id === state.activeVehicle) ?? VEHICLES[0]
      const upgrades = state.vehicleUpgrades[state.activeVehicle] ?? createDefaultUpgrades()
      const boostPower = vehicle.baseStats.boostPower + upgrades.turbo * UPGRADE_EFFECTS_PER_LEVEL
      race.currentSpeed += Math.floor(boostPower * 0.3)
    }

    state.totalWordsTyped++
    nextWord(race)
    return { correct: true, word: expected, distanceGained, newCombo: race.combo, boostGained: boostGain, obstacleHit: null }
  } else {
    race.wrongWords++
    race.combo = 0
    race.distance = Math.max(0, race.distance - 5)
    race.currentSpeed = Math.max(5, race.baseSpeed - 5)
    race.boostMeter = clamp(race.boostMeter - 5, 0, 100)
    updateBoostLevel(race)
    nextWord(race)
    return { correct: false, word: expected, distanceGained: -5, newCombo: 0, boostGained: 0, obstacleHit: null }
  }
}

function nextWord(race: RaceSession): void {
  if (race.wordQueue.length > 0) {
    race.currentWord = race.wordQueue.shift() ?? ''
  } else {
    // Regenerate words if needed
    race.currentWord = 'race'
  }
}

function updateBoostLevel(race: RaceSession): void {
  if (race.boostMeter >= 80) race.boostLevel = 3
  else if (race.boostMeter >= 50) race.boostLevel = 2
  else if (race.boostMeter >= 25) race.boostLevel = 1
  else race.boostLevel = 0
}

export function raUseBoost(): { success: boolean; duration: number; speedIncrease: number } {
  ensureInit()
  if (!state?.currentRace || state.currentRace.isFinished) return { success: false, duration: 0, speedIncrease: 0 }

  const race = state.currentRace
  if (race.boostLevel === 0) return { success: false, duration: 0, speedIncrease: 0 }

  const boostCosts: Record<BoostLevel, number> = { 0: 0, 1: 25, 2: 50, 3: 75 }
  const boostDurations: Record<BoostLevel, number> = { 0: 0, 1: 3, 2: 5, 3: 8 }
  const boostSpeedMult: Record<BoostLevel, number> = { 0: 1, 1: 1.3, 2: 1.6, 3: 2.0 }

  const cost = boostCosts[race.boostLevel]
  if (race.boostMeter < cost) return { success: false, duration: 0, speedIncrease: 0 }

  race.boostMeter -= cost
  race.isBoosting = true
  race.boostDuration = boostDurations[race.boostLevel]
  const vehicle = VEHICLES.find(v => v.id === state.activeVehicle) ?? VEHICLES[0]
  const upgrades = state.vehicleUpgrades[state.activeVehicle] ?? createDefaultUpgrades()
  const boostPower = vehicle.baseStats.boostPower + upgrades.turbo * UPGRADE_EFFECTS_PER_LEVEL
  const speedIncrease = Math.floor(boostPower * boostSpeedMult[race.boostLevel])

  return { success: true, duration: race.boostDuration, speedIncrease }
}

export function raHitObstacle(obstacleIndex: number): { resolved: boolean; penalty: number } {
  ensureInit()
  if (!state?.currentRace) return { resolved: false, penalty: 0 }

  const race = state.currentRace
  if (obstacleIndex < 0 || obstacleIndex >= race.obstacles.length) return { resolved: false, penalty: 0 }

  const obstacle = race.obstacles[obstacleIndex]
  if (obstacle.resolved) return { resolved: false, penalty: 0 }

  obstacle.resolved = true
  race.distance = Math.max(0, race.distance - obstacle.penalty)
  race.currentSpeed = Math.max(5, race.currentSpeed - 10)
  race.combo = 0
  return { resolved: true, penalty: obstacle.penalty }
}

export function raAdvanceRace(tickMs: number): { finished: boolean; position: number; percentComplete: number } {
  ensureInit()
  if (!state?.currentRace || state.currentRace.isFinished) {
    return { finished: true, position: 1, percentComplete: 100 }
  }

  const race = state.currentRace
  if (race.isPaused) return { finished: false, position: race.position, percentComplete: Math.floor((race.distance / race.totalDistance) * 100) }

  race.elapsedTime += tickMs

  // Advance opponents
  const rng = seededRandom('opp-tick-' + race.startTime + '-' + race.elapsedTime)
  advanceOpponents(race.opponents, rng)

  // Apply boost decay
  if (race.isBoosting) {
    race.boostDuration -= tickMs / 1000
    if (race.boostDuration <= 0) {
      race.isBoosting = false
      race.boostDuration = 0
    }
  }

  // Passive distance from speed (small tick-based)
  const passiveAdvance = Math.floor(race.currentSpeed * (tickMs / 1000) * 0.2)
  race.distance += passiveAdvance

  // Check for obstacle proximity
  const nearbyObstacle = race.obstacles.find(o => !o.resolved && Math.abs(race.distance - o.distance) < 5)
  if (nearbyObstacle) {
    race.distance = Math.max(0, race.distance - Math.floor(nearbyObstacle.penalty * 0.5))
    race.currentSpeed = Math.max(5, race.currentSpeed - 5)
  }

  // Update position
  race.position = calculatePlayerPosition(race.distance, race.opponents)

  // Check finish
  const percent = Math.floor((race.distance / race.totalDistance) * 100)
  if (race.distance >= race.totalDistance) {
    raEndRace()
    return { finished: true, position: race.position, percentComplete: 100 }
  }

  return { finished: false, position: race.position, percentComplete: Math.min(99, percent) }
}

export function raPauseRace(): void {
  ensureInit()
  if (state?.currentRace && !state.currentRace.isFinished) {
    state.currentRace.isPaused = true
  }
}

export function raResumeRace(): void {
  ensureInit()
  if (state?.currentRace && !state.currentRace.isFinished) {
    state.currentRace.isPaused = false
  }
}

export function raEndRace(): { position: number; coins: number; xp: number; stats: { correct: number; wrong: number; combo: number; words: number; time: number } } | null {
  ensureInit()
  if (!state?.currentRace || state.currentRace.isFinished) return null

  const race = state.currentRace
  race.isFinished = true
  race.elapsedTime = race.startTime ? Date.now() - race.startTime : 0

  const track = TRACKS.find(t => t.id === race.trackId)
  const trackDifficulty = track?.difficulty ?? 'Medium'

  const { coins, xp } = calculateRaceRewards(
    race.position, trackDifficulty, race.correctWords, race.wrongWords,
    race.maxCombo, race.elapsedTime, race.raceType,
  )

  race.coinsEarned = coins
  race.xpEarned = xp
  state.coins += coins
  state.totalCoinsEarned += coins
  state.totalRaces++
  state.totalWordsTyped += race.correctWords
  if (race.combo > state.bestCombo) state.bestCombo = race.combo

  const avgSpeed = race.elapsedTime > 0 ? Math.floor((race.distance / race.elapsedTime) * 3600000 / 1000) : 0
  if (avgSpeed > state.bestAvgSpeed) state.bestAvgSpeed = avgSpeed

  if (race.position === 1) state.totalWins++
  if (race.position <= 3) state.totalPodiums++

  raAddXP(xp)

  // Check achievements
  checkAndUnlockAchievements(state)

  // Endurance runner check
  if (race.trackId === 7 && race.position <= 3) {
    const ach = state.achievements.find(a => a.id === 'endurance_runner')
    if (ach && !ach.unlocked) { ach.unlocked = true; ach.unlockedAt = new Date().toISOString(); ach.progress = 1 }
  }

  return {
    position: race.position,
    coins,
    xp,
    stats: {
      correct: race.correctWords,
      wrong: race.wrongWords,
      combo: race.maxCombo,
      words: race.wordsTyped,
      time: Math.floor(race.elapsedTime / 1000),
    },
  }
}

export function raGetRaceStatus(): {
  isRacing: boolean
  isPaused: boolean
  isFinished: boolean
  distance: number
  totalDistance: number
  percent: number
  position: number
  currentWord: string
  speed: number
  combo: number
  boostLevel: BoostLevel
  boostMeter: number
  weather: Weather
  trackName: string
  raceType: RaceType
  elapsedTime: number
  opponents: RaceOpponentState[]
} {
  ensureInit()
  if (!state?.currentRace) {
    return {
      isRacing: false, isPaused: false, isFinished: false,
      distance: 0, totalDistance: 0, percent: 0, position: 0,
      currentWord: '', speed: 0, combo: 0, boostLevel: 0, boostMeter: 0,
      weather: 'Clear', trackName: '', raceType: 'QuickRace',
      elapsedTime: 0, opponents: [],
    }
  }
  const race = state.currentRace
  const track = TRACKS.find(t => t.id === race.trackId)
  return {
    isRacing: !race.isFinished,
    isPaused: race.isPaused,
    isFinished: race.isFinished,
    distance: race.distance,
    totalDistance: race.totalDistance,
    percent: Math.floor((race.distance / race.totalDistance) * 100),
    position: race.position,
    currentWord: race.currentWord,
    speed: race.currentSpeed,
    combo: race.combo,
    boostLevel: race.boostLevel,
    boostMeter: race.boostMeter,
    weather: race.weather,
    trackName: track?.name ?? '',
    raceType: race.raceType,
    elapsedTime: Math.floor(race.elapsedTime / 1000),
    opponents: race.opponents,
  }
}

export function raGetCurrentWord(): string {
  ensureInit()
  return state?.currentRace?.currentWord ?? ''
}

export function raGetBoostStatus(): { level: BoostLevel; meter: number; isBoosting: boolean; duration: number } {
  ensureInit()
  if (!state?.currentRace) return { level: 0, meter: 0, isBoosting: false, duration: 0 }
  return {
    level: state.currentRace.boostLevel,
    meter: state.currentRace.boostMeter,
    isBoosting: state.currentRace.isBoosting,
    duration: state.currentRace.boostDuration,
  }
}

// ─── Opponents ────────────────────────────────────────────────────────────────

export function raGetOpponents(): OpponentData[] {
  return [...OPPONENTS]
}

export function raGenerateOpponents(trackId: number, weather: Weather, count?: number): RaceOpponentState[] {
  const rng = seededRandom('gen-opp-' + trackId + '-' + weather + '-' + getDateString())
  return generateOpponentStates(trackId, weather, rng).slice(0, count ?? 8)
}

export function raGetOpponentPerformance(opponentId: number): { name: string; skillLevel: number; personality: string; preferredVehicle: string } | null {
  const opp = OPPONENTS.find(o => o.id === opponentId)
  if (!opp) return null
  const vehicle = VEHICLES.find(v => v.id === opp.preferredVehicle)
  return {
    name: opp.name,
    skillLevel: opp.skillLevel,
    personality: opp.personality,
    preferredVehicle: vehicle?.name ?? 'Unknown',
  }
}

// ─── Championship ─────────────────────────────────────────────────────────────

export function raStartChampionship(season?: number): { success: boolean; message: string; tracks: TrackData[] } {
  ensureInit()
  if (!state) return { success: false, message: 'Not initialized', tracks: [] }
  if (state.championshipProgress.isActive) return { success: false, message: 'Championship already in progress', tracks: [] }
  if (state.currentRace && !state.currentRace.isFinished) return { success: false, message: 'Finish current race first', tracks: [] }

  const rng = seededRandom('champ-' + (season ?? state.championshipProgress.season) + '-' + getDateString())
  const availableTracks = state.unlockedTracks.filter(id => TRACKS.find(t => t.id === id && t.unlockLevel >= 3))
  if (availableTracks.length < 5) {
    // Use default tracks for championship
    const defaultTracks = [0, 1, 2, 6, 7]
    state.championshipProgress.trackIds = shuffleArray(defaultTracks, rng).slice(0, 5)
  } else {
    state.championshipProgress.trackIds = shuffleArray(availableTracks, rng).slice(0, 5)
  }

  state.championshipProgress.isActive = true
  state.championshipProgress.currentRace = 0
  state.championshipProgress.points = 0
  state.championshipProgress.standings = buildChampionshipStandings()
  state.championshipProgress.completed = false
  state.championshipProgress.season = season ?? state.championshipProgress.season

  const tracks = state.championshipProgress.trackIds.map(id => TRACKS.find(t => t.id === id)).filter(Boolean) as TrackData[]
  return { success: true, message: `Championship Season ${state.championshipProgress.season} started!`, tracks }
}

export function raGetChampionshipStandings(): { standings: ChampionshipStanding[]; currentRace: number; totalRaces: number; playerPoints: number; isActive: boolean; season: number } {
  ensureInit()
  if (!state) return { standings: [], currentRace: 0, totalRaces: 5, playerPoints: 0, isActive: false, season: 1 }

  const cp = state.championshipProgress
  return {
    standings: cp.standings,
    currentRace: cp.currentRace,
    totalRaces: cp.totalRaces,
    playerPoints: cp.points,
    isActive: cp.isActive,
    season: cp.season,
  }
}

export function raCompleteRaceInChampionship(position: number): { pointsAwarded: number; standings: ChampionshipStanding[]; championshipComplete: boolean; playerWon: boolean } {
  ensureInit()
  if (!state) return { pointsAwarded: 0, standings: [], championshipComplete: false, playerWon: false }
  const cp = state.championshipProgress
  if (!cp.isActive) return { pointsAwarded: 0, standings: [], championshipComplete: false, playerWon: false }

  const pointsIdx = clamp(position - 1, 0, CHAMPIONSHIP_POINTS.length - 1)
  const pointsAwarded = CHAMPIONSHIP_POINTS[pointsIdx]
  cp.points += pointsAwarded

  // Update opponent points
  const rng = seededRandom('champ-opp-' + cp.currentRace + '-' + getDateString())
  for (const standing of cp.standings) {
    const opp = OPPONENTS.find(o => o.name === standing.name)
    if (opp) {
      const skillMod = 0.3 + (opp.skillLevel / 10) * 0.7
      const oppPosition = Math.max(1, Math.floor(rng() * 8 * (1 - skillMod) + 1))
      const oppPoints = CHAMPIONSHIP_POINTS[clamp(oppPosition - 1, 0, CHAMPIONSHIP_POINTS.length - 1)]
      standing.points += oppPoints
      if (oppPosition === 1) standing.wins++
    }
  }

  // Add player to standings for ranking
  const playerEntry: ChampionshipStanding = { name: state.driverName, points: cp.points, wins: 0 }
  const allStandings = [...cp.standings, playerEntry].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    return b.wins - a.wins
  })

  cp.currentRace++

  if (cp.currentRace >= cp.totalRaces) {
    cp.isActive = false
    cp.completed = true
    const finalStandings = allStandings
    const playerRank = finalStandings.findIndex(s => s.name === state.driverName)
    const playerWon = playerRank === 0
    if (playerWon) {
      state.championshipsWon++
      const ach = state.achievements.find(a => a.id === 'champion')
      if (ach && !ach.unlocked) { ach.unlocked = true; ach.unlockedAt = new Date().toISOString(); ach.progress = 1 }
    }
    return { pointsAwarded, standings: finalStandings, championshipComplete: true, playerWon }
  }

  return { pointsAwarded, standings: allStandings, championshipComplete: false, playerWon: false }
}

export function raGetCurrentChampionshipTrack(): TrackData | null {
  ensureInit()
  if (!state) return null
  const cp = state.championshipProgress
  if (!cp.isActive || cp.currentRace >= cp.trackIds.length) return null
  return TRACKS.find(t => t.id === cp.trackIds[cp.currentRace]) ?? null
}

// ─── Time Trial ───────────────────────────────────────────────────────────────

export function raStartTimeTrial(trackId: number): { success: boolean; message: string; ghostTime: number | null } {
  ensureInit()
  if (!state) return { success: false, message: 'Not initialized', ghostTime: null }
  const track = TRACKS.find(t => t.id === trackId)
  if (!track) return { success: false, message: 'Track not found', ghostTime: null }

  const result = raStartRace(trackId, 'TimeTrial')
  if (!result.success) return { success: false, message: result.message, ghostTime: null }

  const ghostTime = state.timeTrialRecords[trackId] ?? null
  return { success: true, message: `Time Trial on ${track.name}!`, ghostTime }
}

export function raUpdateTimeTrial(): { currentTime: number; bestTime: number | null; isNewRecord: boolean } {
  ensureInit()
  if (!state?.currentRace || state.currentRace.raceType !== 'TimeTrial') {
    return { currentTime: 0, bestTime: null, isNewRecord: false }
  }

  const race = state.currentRace
  const currentTime = race.elapsedTime / 1000
  const trackId = race.trackId

  if (race.isFinished) {
    const previousBest = state.timeTrialRecords[trackId] ?? null
    const isNewRecord = previousBest === null || currentTime < previousBest
    if (isNewRecord) {
      state.timeTrialRecords[trackId] = currentTime
      const ach = state.achievements.find(a => a.id === 'trial_blazer')
      if (ach && !ach.unlocked) { ach.unlocked = true; ach.unlockedAt = new Date().toISOString(); ach.progress = Object.keys(state.timeTrialRecords).length }
    }
    return { currentTime: Math.floor(currentTime), bestTime: state.timeTrialRecords[trackId], isNewRecord }
  }

  return { currentTime: Math.floor(currentTime), bestTime: state.timeTrialRecords[trackId] ?? null, isNewRecord: false }
}

export function raGetBestTime(trackId: number): number | null {
  ensureInit()
  if (!state) return null
  return state.timeTrialRecords[trackId] ?? null
}

export function raGetTimeTrialRankings(trackId: number): { trackId: number; bestTime: number | null; rankings: { name: string; time: number; rank: number }[] } {
  ensureInit()
  const rng = seededRandom('tt-rank-' + trackId + '-' + getDateString())
  const playerBest = state?.timeTrialRecords[trackId] ?? null

  const rankings: { name: string; time: number; rank: number }[] = []
  const selectedOpps = shuffleArray(OPPONENTS, rng).slice(0, 5)
  for (const opp of selectedOpps) {
    const baseTime = 30 + (10 - opp.skillLevel) * 5
    const time = Math.floor(baseTime + rng() * 15)
    rankings.push({ name: opp.name, time, rank: 0 })
  }
  if (playerBest !== null) rankings.push({ name: state?.driverName ?? 'Racer', time: Math.floor(playerBest), rank: 0 })
  rankings.sort((a, b) => a.time - b.time)
  rankings.forEach((r, i) => { r.rank = i + 1 })

  return { trackId, bestTime: playerBest, rankings }
}

export function raGetAllTimeTrialRecords(): Record<number, number> {
  ensureInit()
  if (!state) return {}
  return { ...state.timeTrialRecords }
}

// ─── Relay Race ───────────────────────────────────────────────────────────────

export function raGetRelayStatus(): { team: RelayTeamMember[]; currentMember: number; totalDistance: number; completedDistance: number } | null {
  ensureInit()
  if (!state?.currentRelay) return null
  return { team: state.currentRelay.team, currentMember: state.currentRelay.currentMemberIndex, totalDistance: state.currentRelay.totalDistance, completedDistance: state.currentRelay.completedDistance }
}

export function raSwitchRelayMember(): { success: boolean; memberName: string; message: string } {
  ensureInit()
  if (!state?.currentRelay || !state.currentRace) return { success: false, memberName: '', message: 'No relay in progress' }

  const relay = state.currentRelay
  const race = state.currentRace
  const currentIndex = relay.currentMemberIndex

  // Current member logs their distance
  relay.team[currentIndex].distance = race.distance - relay.completedDistance
  relay.team[currentIndex].isActive = false
  relay.completedDistance = race.distance

  // Switch to next member
  const nextIndex = (currentIndex + 1) % relay.team.length
  relay.currentMemberIndex = nextIndex
  relay.team[nextIndex].isActive = true

  // Reset some race state for the new driver
  race.combo = 0
  race.currentSpeed = race.baseSpeed

  return {
    success: true,
    memberName: relay.team[nextIndex].name,
    message: `Switched to ${relay.team[nextIndex].name}!`,
  }
}

// ─── Daily Race ───────────────────────────────────────────────────────────────

export function raGetDailyRace(): DailyRaceData {
  ensureInit()
  if (!state) return buildDailyRace()

  // Check if date changed
  const today = getDateString()
  if (state.dailyRace.date !== today) {
    state.dailyRace = buildDailyRace()
    state.dailyCompleted = false
  }
  return state.dailyRace
}

export function raStartDailyRace(): { success: boolean; message: string; daily: DailyRaceData } {
  ensureInit()
  if (!state) return { success: false, message: 'Not initialized', daily: buildDailyRace() }

  const daily = raGetDailyRace()
  if (daily.completed) return { success: false, message: 'Daily race already completed today!', daily }

  const result = raStartRace(daily.trackId, 'QuickRace', daily.weather)
  if (!result.success) return { success: false, message: result.message, daily }

  return { success: true, message: `Daily race on ${TRACKS.find(t => t.id === daily.trackId)?.name}!`, daily }
}

export function raCompleteDaily(position: number, time: number): { success: boolean; coinBonus: number; modifiers: string[] } {
  ensureInit()
  if (!state) return { success: false, coinBonus: 0, modifiers: [] }

  const daily = state.dailyRace
  if (daily.completed) return { success: false, coinBonus: 0, modifiers: [] }

  daily.completed = true
  daily.bestPosition = daily.bestPosition === null || position < daily.bestPosition ? position : daily.bestPosition
  daily.bestTime = daily.bestTime === null || time < daily.bestTime ? time : daily.bestTime

  const success = position <= daily.targetPosition
  const coinBonus = success ? daily.coinBonus : Math.floor(daily.coinBonus * 0.3)

  if (success) {
    state.coins += coinBonus
    state.totalCoinsEarned += coinBonus
    state.dailyCompleted = true
  }

  return { success, coinBonus, modifiers: daily.modifiers }
}

export function raCheckDailyReset(): { resetNeeded: boolean; currentDate: string; storedDate: string } {
  ensureInit()
  if (!state) return { resetNeeded: true, currentDate: getDateString(), storedDate: '' }

  const today = getDateString()
  return {
    resetNeeded: state.dailyRace.date !== today,
    currentDate: today,
    storedDate: state.dailyRace.date,
  }
}

// ─── Level / XP System ────────────────────────────────────────────────────────

export function raGetLevel(): { level: number; xp: number; xpToNext: number; percent: number } {
  ensureInit()
  if (!state) return { level: 1, xp: 0, xpToNext: BASE_XP_TO_NEXT, percent: 0 }
  return {
    level: state.level,
    xp: state.xp,
    xpToNext: state.xpToNext,
    percent: Math.floor((state.xp / state.xpToNext) * 100),
  }
}

export function raAddXP(amount: number): { leveledUp: boolean; newLevel: number; rewards: string[] } {
  ensureInit()
  if (!state) return { leveledUp: false, newLevel: state?.level ?? 1, rewards: [] }

  state.xp += amount
  state.totalXPEarned += amount
  const rewards: string[] = []
  let leveledUp = false

  while (state.xp >= state.xpToNext && state.level < MAX_LEVEL) {
    state.xp -= state.xpToNext
    state.level++
    state.xpToNext = xpRequiredForLevel(state.level)
    leveledUp = true

    // Level up rewards
    const coinReward = 50 + state.level * 20
    state.coins += coinReward
    rewards.push(`${coinReward} coins`)

    // Check for vehicle unlocks
    const unlockedVehicle = VEHICLES.find(v => v.unlockLevel === state.level)
    if (unlockedVehicle) {
      rewards.push(`Unlocked: ${unlockedVehicle.name}`)
    }

    // Check for track unlocks
    const unlockedTrack = TRACKS.find(t => t.unlockLevel === state.level)
    if (unlockedTrack && !state.unlockedTracks.includes(unlockedTrack.id)) {
      state.unlockedTracks.push(unlockedTrack.id)
      rewards.push(`Unlocked track: ${unlockedTrack.name}`)
    }
  }

  return { leveledUp, newLevel: state.level, rewards }
}

export function raGetXPProgress(): { current: number; needed: number; percent: number; level: number } {
  ensureInit()
  if (!state) return { current: 0, needed: BASE_XP_TO_NEXT, percent: 0, level: 1 }
  return {
    current: state.xp,
    needed: state.xpToNext,
    percent: Math.floor((state.xp / state.xpToNext) * 100),
    level: state.level,
  }
}

// ─── Weather System ───────────────────────────────────────────────────────────

export function raGetWeather(trackId: number): Weather {
  const track = TRACKS.find(t => t.id === trackId)
  if (!track) return 'Clear'
  const rng = seededRandom('weather-' + trackId + '-' + getDateString())
  return track.weatherPool[Math.floor(rng() * track.weatherPool.length)]
}

export function raApplyWeatherEffect(baseHandling: number, baseSpeed: number, weather: Weather): { handling: number; speed: number; description: string } {
  const effects = WEATHER_EFFECTS[weather]
  return {
    handling: Math.floor(baseHandling * effects.handlingMod),
    speed: Math.floor(baseSpeed * effects.speedMod),
    description: effects.description,
  }
}

export function raGetAllWeathers(): { weather: Weather; handlingMod: number; speedMod: number; description: string }[] {
  return (Object.entries(WEATHER_EFFECTS) as [Weather, typeof WEATHER_EFFECTS[Weather]][]).map(([w, e]) => ({
    weather: w,
    handlingMod: e.handlingMod,
    speedMod: e.speedMod,
    description: e.description,
  }))
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export function raGetAchievements(): AchievementState[] {
  ensureInit()
  if (!state) return createDefaultAchievements()
  return [...state.achievements]
}

export function raCheckAchievements(): AchievementState[] {
  ensureInit()
  if (!state) return []
  checkAndUnlockAchievements(state)
  return [...state.achievements]
}

export function raIsAchievementUnlocked(achievementId: string): boolean {
  ensureInit()
  if (!state) return false
  const ach = state.achievements.find(a => a.id === achievementId)
  return ach?.unlocked ?? false
}

export function raGetAchievementProgress(achievementId: string): { progress: number; target: number; unlocked: boolean } {
  ensureInit()
  if (!state) return { progress: 0, target: 1, unlocked: false }
  const ach = state.achievements.find(a => a.id === achievementId)
  if (!ach) return { progress: 0, target: 1, unlocked: false }
  return { progress: ach.progress, target: ach.target, unlocked: ach.unlocked }
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export function raGetRaceStats(): {
  totalRaces: number
  totalWins: number
  totalPodiums: number
  totalWordsTyped: number
  bestCombo: number
  bestAvgSpeed: number
  totalCoinsEarned: number
  totalXPEarned: number
  championshipsWon: number
  winRate: number
  podiumRate: number
} {
  ensureInit()
  if (!state) {
    return {
      totalRaces: 0, totalWins: 0, totalPodiums: 0, totalWordsTyped: 0,
      bestCombo: 0, bestAvgSpeed: 0, totalCoinsEarned: 0, totalXPEarned: 0,
      championshipsWon: 0, winRate: 0, podiumRate: 0,
    }
  }
  return {
    totalRaces: state.totalRaces,
    totalWins: state.totalWins,
    totalPodiums: state.totalPodiums,
    totalWordsTyped: state.totalWordsTyped,
    bestCombo: state.bestCombo,
    bestAvgSpeed: state.bestAvgSpeed,
    totalCoinsEarned: state.totalCoinsEarned,
    totalXPEarned: state.totalXPEarned,
    championshipsWon: state.championshipsWon,
    winRate: state.totalRaces > 0 ? Math.round((state.totalWins / state.totalRaces) * 100) : 0,
    podiumRate: state.totalRaces > 0 ? Math.round((state.totalPodiums / state.totalRaces) * 100) : 0,
  }
}

export function raGetWinRate(): number {
  ensureInit()
  if (!state || state.totalRaces === 0) return 0
  return Math.round((state.totalWins / state.totalRaces) * 100)
}

export function raGetBestCombo(): number {
  ensureInit()
  return state?.bestCombo ?? 0
}

export function raGetTotalWordsTyped(): number {
  ensureInit()
  return state?.totalWordsTyped ?? 0
}

export function raGetCoins(): number {
  ensureInit()
  return state?.coins ?? 0
}

export function raSpendCoins(amount: number): { success: boolean; remaining: number } {
  ensureInit()
  if (!state) return { success: false, remaining: 0 }
  if (state.coins < amount) return { success: false, remaining: state.coins }
  state.coins -= amount
  return { success: true, remaining: state.coins }
}

// ─── Obstacle Info ────────────────────────────────────────────────────────────

export function raGetActiveObstacles(): ObstacleData[] {
  ensureInit()
  if (!state?.currentRace) return []
  return state.currentRace.obstacles.filter(o => !o.resolved)
}

export function raGetAllObstacleTypes(): { type: ObstacleType; penalty: number; hint: string; words: string[] }[] {
  return OBSTACLE_TYPES.map(type => ({
    type,
    penalty: OBSTACLE_PENALTIES[type],
    hint: OBSTACLE_HINTS[type],
    words: OBSTACLE_WORDS[type],
  }))
}

// ─── Garage View ──────────────────────────────────────────────────────────────

export function raGetGarage(): {
  activeVehicle: VehicleData
  ownedVehicles: VehicleData[]
  vehicleUpgrades: Record<number, VehicleUpgrades>
  garageSlots: number
  totalVehicles: number
} {
  ensureInit()
  if (!state) {
    const starter = VEHICLES[0]
    return {
      activeVehicle: starter,
      ownedVehicles: [starter],
      vehicleUpgrades: { 0: createDefaultUpgrades() },
      garageSlots: 12,
      totalVehicles: 12,
    }
  }
  const active = state.ownedVehicles.find(v => v.id === state.activeVehicle) ?? state.ownedVehicles[0]
  return {
    activeVehicle: active,
    ownedVehicles: [...state.ownedVehicles],
    vehicleUpgrades: { ...state.vehicleUpgrades },
    garageSlots: 12,
    totalVehicles: VEHICLES.length,
  }
}

// ─── Hint System ──────────────────────────────────────────────────────────────

export function raGetHint(): { word: string; hint: string; type: 'word' | 'obstacle' } {
  ensureInit()
  if (!state?.currentRace) return { word: '', hint: 'No race in progress', type: 'word' }

  const race = state.currentRace

  // Check for nearby obstacle first
  const nearbyObstacle = race.obstacles.find(o => !o.resolved && Math.abs(race.distance - o.distance) < 50)
  if (nearbyObstacle) {
    const typeHint = nearbyObstacle.type === 'OilSlick' ? 'Watch for oil!' :
      nearbyObstacle.type === 'SpeedBump' ? 'Slow down ahead!' :
        'Detour coming up!'
    return { word: nearbyObstacle.word, hint: `${typeHint} ${nearbyObstacle.hint}`, type: 'obstacle' }
  }

  const word = race.currentWord
  const hint = `Type: "${word[0]}${'_'.repeat(word.length - 1)}" (${word.length} letters)`
  return { word, hint, type: 'word' }
}

// ─── Ability / Power Activation ───────────────────────────────────────────────

export function raActivateAbility(ability: 'boost' | 'shield' | 'shortcut'): { success: boolean; message: string; effect: string } {
  ensureInit()
  if (!state?.currentRace || state.currentRace.isFinished) {
    return { success: false, message: 'No active race', effect: '' }
  }

  const race = state.currentRace

  switch (ability) {
    case 'boost': {
      const result = raUseBoost()
      if (result.success) {
        return { success: true, message: 'Boost activated!', effect: `+${result.speedIncrease} speed for ${result.duration}s` }
      }
      return { success: false, message: 'Not enough boost meter', effect: '' }
    }
    case 'shield': {
      if (race.boostMeter < 20) return { success: false, message: 'Need 20% boost meter', effect: '' }
      race.boostMeter -= 20
      // Clear next obstacle
      const nextObs = race.obstacles.find(o => !o.resolved)
      if (nextObs) {
        nextObs.resolved = true
        return { success: true, message: 'Shield activated!', effect: 'Cleared next obstacle' }
      }
      return { success: false, message: 'No obstacles to shield against', effect: '' }
    }
    case 'shortcut': {
      if (race.boostMeter < 30) return { success: false, message: 'Need 30% boost meter', effect: '' }
      race.boostMeter -= 30
      const shortcutDistance = 50 + Math.floor(Math.random() * 30)
      race.distance = Math.min(race.totalDistance, race.distance + shortcutDistance)
      return { success: true, message: 'Shortcut found!', effect: `+${shortcutDistance} distance` }
    }
    default:
      return { success: false, message: 'Unknown ability', effect: '' }
  }
}

// ─── Reward System ────────────────────────────────────────────────────────────

export function raGetRewardsSummary(): {
  coins: number
  vehiclesOwned: number
  tracksUnlocked: number
  achievementsUnlocked: number
  level: number
  championshipsWon: number
  timeTrialRecords: number
} {
  ensureInit()
  if (!state) {
    return { coins: 0, vehiclesOwned: 1, tracksUnlocked: 3, achievementsUnlocked: 0, level: 1, championshipsWon: 0, timeTrialRecords: 0 }
  }
  return {
    coins: state.coins,
    vehiclesOwned: state.ownedVehicles.length,
    tracksUnlocked: state.unlockedTracks.length,
    achievementsUnlocked: state.achievements.filter(a => a.unlocked).length,
    level: state.level,
    championshipsWon: state.championshipsWon,
    timeTrialRecords: Object.keys(state.timeTrialRecords).length,
  }
}

export function raClaimVictoryReward(position: number, trackDifficulty: TrackDifficulty): { coins: number; xp: number; bonusItems: string[] } {
  ensureInit()
  if (!state) return { coins: 0, xp: 0, bonusItems: [] }

  const { coins, xp } = calculateRaceRewards(position, trackDifficulty, 10, 0, 0, 60000, 'QuickRace')
  const bonusItems: string[] = []

  if (position === 1) bonusItems.push('🏆 Victory Trophy')
  if (position <= 3) bonusItems.push('🥈 Podium Finish')

  state.coins += coins
  state.totalCoinsEarned += coins
  raAddXP(xp)

  return { coins, xp, bonusItems }
}
