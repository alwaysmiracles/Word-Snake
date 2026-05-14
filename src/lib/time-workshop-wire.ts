// ============================================================================
// Time Workshop Wire — SSR-safe module for the Word Snake game
// All exports use the `tw` prefix. All constants use the `TW_` prefix.
// No React hooks. No browser APIs at top level.
// ============================================================================

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export type EraId =
  | 'ancient_egypt'
  | 'roman_empire'
  | 'medieval_europe'
  | 'renaissance'
  | 'industrial_revolution'
  | 'wild_west'
  | 'world_war_ii'
  | 'future';

export type GadgetId = 'chronograph' | 'temporal_lens' | 'paradox_meter' | 'era_compass' | 'time_crystal' | 'dimension_anchor';

export type StationId = 'temporal_forge' | 'paradox_lab' | 'era_gateway' | 'memory_archive' | 'quantum_engine';

export type AnomalyType = 'loop' | 'split' | 'merge' | 'shift' | 'fade' | 'echo';

export type HorologistTitle =
  | 'Apprentice'
  | 'Chronist'
  | 'Temporal Artisan'
  | 'Paradox Weaver'
  | 'Era Walker'
  | 'Timeline Guardian'
  | 'Chrono Architect'
  | 'Time Lord';

export interface Era {
  id: EraId;
  name: string;
  period: string;
  description: string;
  color: string;
  energyRate: number;
  paradoxChance: number;
  unlockLevel: number;
  backgroundEmoji: string;
}

export interface ParadoxEvent {
  id: string;
  eraId: EraId;
  name: string;
  description: string;
  difficulty: number;
  stabilityCost: number;
  energyReward: number;
  xpReward: number;
  coinReward: number;
  solution: string;
  hint: string;
  memoryFragmentReward: boolean;
  artifactChance: number;
}

export interface Gadget {
  id: GadgetId;
  name: string;
  description: string;
  cost: number;
  equipped: boolean;
  owned: boolean;
  tier: number;
  effect: string;
  cooldown: number;
  currentCooldown: number;
}

export interface WorkshopStation {
  id: StationId;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  upgradeCost: number;
  bonus: string;
  effectValue: number;
}

export interface HistoricalFigure {
  id: string;
  name: string;
  eraId: EraId;
  role: string;
  title: string;
  dialogue: string[];
  questId: string | null;
  questName: string | null;
  questDescription: string | null;
  questReward: { xp: number; coins: number; energy: number; gadgetId: GadgetId | null };
  met: boolean;
  questCompleted: boolean;
}

export interface TimelineBranch {
  id: string;
  eraId: EraId;
  name: string;
  description: string;
  choiceA: string;
  choiceB: string;
  consequenceA: string;
  consequenceB: string;
  stabilityA: number;
  stabilityB: number;
  xpReward: number;
  resolved: boolean;
  chosen: 'a' | 'b' | null;
}

export interface Artifact {
  id: string;
  eraId: EraId;
  name: string;
  type: string;
  description: string;
  lore: string;
  collected: boolean;
  collectedAt: number;
  bonus: { type: string; value: number };
}

export interface MemoryFragment {
  id: string;
  eraId: EraId;
  name: string;
  description: string;
  collected: boolean;
  collectedAt: number;
  restored: boolean;
}

export interface AnomalyRecord {
  id: string;
  type: AnomalyType;
  eraId: EraId;
  name: string;
  description: string;
  detectedAt: number;
  resolved: boolean;
  severity: number;
  reward: { xp: number; coins: number; energy: number };
}

export interface DailyAnomalyData {
  anomalyId: string;
  completed: boolean;
  dateSeed: number;
  bonusMultiplier: number;
}

export interface ParadoxData {
  id: string;
  resolved: boolean;
  resolvedAt: number;
  attempts: number;
}

export interface TimeWorkshopStats {
  paradoxesResolved: number;
  paradoxesFailed: number;
  erasVisited: number;
  figuresMet: number;
  artifactsCollected: number;
  memoryFragmentsCollected: number;
  anomaliesResolved: number;
  totalEnergyGenerated: number;
  totalEnergySpent: number;
  timelineBranchesResolved: number;
  timeTravels: number;
  totalPlayTicks: number;
}

export interface TimeWorkshopRun {
  id: string;
  action: string;
  eraId: EraId | null;
  result: 'success' | 'failure' | 'partial';
  xpEarned: number;
  coinsEarned: number;
  energySpent: number;
  energyGained: number;
  stabilityChange: number;
  timestamp: number;
  details: string;
}

export interface TimeWorkshopState {
  initialized: boolean;
  version: number;
  level: number;
  xp: number;
  xpToNext: number;
  totalXP: number;
  coins: number;
  activeEra: EraId;
  temporalEnergy: number;
  maxTemporalEnergy: number;
  energyRegenRate: number;
  timelineStability: number;
  paradoxes: ParadoxData[];
  artifacts: Artifact[];
  gadgets: Gadget[];
  stations: WorkshopStation[];
  historicalFigures: HistoricalFigure[];
  timelineBranches: TimelineBranch[];
  memoryFragments: MemoryFragment[];
  anomalies: AnomalyRecord[];
  dailyAnomaly: DailyAnomalyData;
  streak: number;
  bestStreak: number;
  achievements: string[];
  unlockedAchievements: string[];
  stats: TimeWorkshopStats;
  runHistory: TimeWorkshopRun[];
  lastDailyDate: string;
  lastStreakDate: string;
  lastTravelTimestamp: number;
  travelCooldown: number;
  activeGadgets: GadgetId[];
}

// ---------------------------------------------------------------------------
// Constants — Eras
// ---------------------------------------------------------------------------

export const TW_ERAS: Era[] = [
  {
    id: 'ancient_egypt',
    name: 'Ancient Egypt',
    period: '3100–30 BCE',
    description: 'The land of pharaohs, pyramids, and hieroglyphic mysteries along the Nile.',
    color: '#D4AF37',
    energyRate: 3,
    paradoxChance: 0.15,
    unlockLevel: 1,
    backgroundEmoji: '🏜️',
  },
  {
    id: 'roman_empire',
    name: 'Roman Empire',
    period: '27 BCE–476 CE',
    description: 'An empire of legions, aqueducts, and senators spanning three continents.',
    color: '#8B0000',
    energyRate: 4,
    paradoxChance: 0.18,
    unlockLevel: 3,
    backgroundEmoji: '🏛️',
  },
  {
    id: 'medieval_europe',
    name: 'Medieval Europe',
    period: '500–1500 CE',
    description: 'Castles, crusades, and the age of chivalry under feudal lords.',
    color: '#4A4A4A',
    energyRate: 4,
    paradoxChance: 0.20,
    unlockLevel: 6,
    backgroundEmoji: '🏰',
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    period: '1400–1600 CE',
    description: 'The rebirth of art, science, and human potential in Florence and beyond.',
    color: '#CD853F',
    energyRate: 5,
    paradoxChance: 0.22,
    unlockLevel: 10,
    backgroundEmoji: '🎨',
  },
  {
    id: 'industrial_revolution',
    name: 'Industrial Revolution',
    period: '1760–1840 CE',
    description: 'Steam, steel, and the birth of modern industry in Britain.',
    color: '#708090',
    energyRate: 6,
    paradoxChance: 0.25,
    unlockLevel: 15,
    backgroundEmoji: '⚙️',
  },
  {
    id: 'wild_west',
    name: 'Wild West',
    period: '1850–1920 CE',
    description: 'Frontier towns, outlaws, and the spirit of the American West.',
    color: '#CD853F',
    energyRate: 5,
    paradoxChance: 0.23,
    unlockLevel: 20,
    backgroundEmoji: '🤠',
  },
  {
    id: 'world_war_ii',
    name: 'World War II',
    period: '1939–1945 CE',
    description: 'The greatest conflict in human history, reshaping the world order.',
    color: '#2F4F4F',
    energyRate: 7,
    paradoxChance: 0.30,
    unlockLevel: 28,
    backgroundEmoji: '🎖️',
  },
  {
    id: 'future',
    name: 'Future',
    period: '2100+ CE',
    description: 'Advanced technology, interstellar travel, and post-human civilization.',
    color: '#00CED1',
    energyRate: 8,
    paradoxChance: 0.35,
    unlockLevel: 35,
    backgroundEmoji: '🚀',
  },
];

// ---------------------------------------------------------------------------
// Constants — Gadgets
// ---------------------------------------------------------------------------

export const TW_GADGETS: Omit<Gadget, 'equipped' | 'owned' | 'currentCooldown'>[] = [
  {
    id: 'chronograph',
    name: 'Chronograph',
    description: 'A wrist-worn device that measures temporal drift and predicts paradox windows.',
    cost: 0,
    tier: 1,
    effect: 'Reduces paradox difficulty by 10%',
    cooldown: 3,
  },
  {
    id: 'temporal_lens',
    name: 'Temporal Lens',
    description: 'A monocle that reveals hidden timeline anomalies and causality fractures.',
    cost: 200,
    tier: 1,
    effect: 'Reveals paradox hints automatically',
    cooldown: 2,
  },
  {
    id: 'paradox_meter',
    name: 'Paradox Meter',
    description: 'A handheld gauge that quantifies the severity of timeline disruptions.',
    cost: 350,
    tier: 2,
    effect: 'Shows paradox severity before resolution',
    cooldown: 1,
  },
  {
    id: 'era_compass',
    name: 'Era Compass',
    description: 'A spinning compass that points toward temporal energy concentrations.',
    cost: 500,
    tier: 2,
    effect: 'Doubles energy gained from eras',
    cooldown: 5,
  },
  {
    id: 'time_crystal',
    name: 'Time Crystal',
    description: 'A shimmering crystal containing compressed temporal energy.',
    cost: 800,
    tier: 3,
    effect: 'Instantly restores 50 temporal energy',
    cooldown: 10,
  },
  {
    id: 'dimension_anchor',
    name: 'Dimension Anchor',
    description: 'A device that stabilizes the workshop against temporal shocks.',
    cost: 1200,
    tier: 3,
    effect: 'Prevents stability drops below 30',
    cooldown: 8,
  },
];

// ---------------------------------------------------------------------------
// Constants — Workshop Stations
// ---------------------------------------------------------------------------

export const TW_STATIONS: Omit<WorkshopStation, 'level' | 'effectValue'>[] = [
  {
    id: 'temporal_forge',
    name: 'Temporal Forge',
    description: 'Forge temporal energy into usable chronal components.',
    maxLevel: 10,
    upgradeCost: 100,
    bonus: 'Increases max temporal energy capacity',
  },
  {
    id: 'paradox_lab',
    name: 'Paradox Lab',
    description: 'Research and analyze temporal anomalies to develop countermeasures.',
    maxLevel: 10,
    upgradeCost: 150,
    bonus: 'Reduces paradox stability cost',
  },
  {
    id: 'era_gateway',
    name: 'Era Gateway',
    description: 'Maintain and upgrade portals to different historical eras.',
    maxLevel: 10,
    upgradeCost: 200,
    bonus: 'Reduces travel cooldown time',
  },
  {
    id: 'memory_archive',
    name: 'Memory Archive',
    description: 'Store and restore memory fragments from lost timelines.',
    maxLevel: 10,
    upgradeCost: 120,
    bonus: 'Increases memory fragment restoration chance',
  },
  {
    id: 'quantum_engine',
    name: 'Quantum Engine',
    description: 'Powers the entire workshop with quantum temporal energy.',
    maxLevel: 10,
    upgradeCost: 250,
    bonus: 'Increases energy regeneration rate',
  },
];

// ---------------------------------------------------------------------------
// Constants — Horologist Titles
// ---------------------------------------------------------------------------

export const TW_TITLES: { name: HorologistTitle; minLevel: number; maxLevel: number; emoji: string }[] = [
  { name: 'Apprentice', minLevel: 1, maxLevel: 5, emoji: '⏱️' },
  { name: 'Chronist', minLevel: 6, maxLevel: 10, emoji: '📜' },
  { name: 'Temporal Artisan', minLevel: 11, maxLevel: 15, emoji: '🔧' },
  { name: 'Paradox Weaver', minLevel: 16, maxLevel: 20, emoji: '🌀' },
  { name: 'Era Walker', minLevel: 21, maxLevel: 25, emoji: '🚶' },
  { name: 'Timeline Guardian', minLevel: 26, maxLevel: 30, emoji: '🛡️' },
  { name: 'Chrono Architect', minLevel: 31, maxLevel: 35, emoji: '🏗️' },
  { name: 'Time Lord', minLevel: 36, maxLevel: 40, emoji: '👑' },
];

// ---------------------------------------------------------------------------
// Constants — Anomaly Types
// ---------------------------------------------------------------------------

export const TW_ANOMALY_TYPES: { type: AnomalyType; name: string; description: string; mechanic: string; baseSeverity: number; color: string }[] = [
  {
    type: 'loop',
    name: 'Time Loop',
    description: 'A section of time repeats endlessly, trapping events in a cycle.',
    mechanic: 'Resolve by identifying the break point and severing the causal link.',
    baseSeverity: 3,
    color: '#9B59B6',
  },
  {
    type: 'split',
    name: 'Timeline Split',
    description: 'A decision point branches into two incompatible realities.',
    mechanic: 'Choose which branch to preserve and collapse the other.',
    baseSeverity: 5,
    color: '#E74C3C',
  },
  {
    type: 'merge',
    name: 'Reality Merge',
    description: 'Two distinct timelines are collapsing into one, causing contradictions.',
    mechanic: 'Separate the timelines by identifying unique anchor events.',
    baseSeverity: 6,
    color: '#3498DB',
  },
  {
    type: 'shift',
    name: 'Temporal Shift',
    description: 'Events are displaced in time, happening before their causes.',
    mechanic: 'Realign the causal chain by placing events in correct chronological order.',
    baseSeverity: 4,
    color: '#F39C12',
  },
  {
    type: 'fade',
    name: 'Timeline Fade',
    description: 'A timeline is dissolving as its anchor events are being forgotten.',
    mechanic: 'Restore the anchor events using memory fragments before the timeline vanishes.',
    baseSeverity: 7,
    color: '#95A5A6',
  },
  {
    type: 'echo',
    name: 'Temporal Echo',
    description: 'A past event reverberates into the present, distorting current reality.',
    mechanic: 'Trace the echo back to its origin and dampen the resonance frequency.',
    baseSeverity: 4,
    color: '#1ABC9C',
  },
];

// ---------------------------------------------------------------------------
// Constants — Achievements
// ---------------------------------------------------------------------------

export const TW_ACHIEVEMENTS: { id: string; name: string; description: string; condition: string; icon: string }[] = [
  { id: 'tw_a1', name: 'First Steps', description: 'Resolve your first paradox', condition: 'paradoxesResolved >= 1', icon: '👶' },
  { id: 'tw_a2', name: 'Chronicle Keeper', description: 'Resolve 10 paradoxes', condition: 'paradoxesResolved >= 10', icon: '📖' },
  { id: 'tw_a3', name: 'Master Fixer', description: 'Resolve 30 paradoxes', condition: 'paradoxesResolved >= 30', icon: '🔧' },
  { id: 'tw_a4', name: 'Era Explorer', description: 'Visit all 8 eras', condition: 'erasVisited >= 8', icon: '🌍' },
  { id: 'tw_a5', name: 'Artifact Hunter', description: 'Collect all 8 era artifacts', condition: 'artifactsCollected >= 8', icon: '🏺' },
  { id: 'tw_a6', name: 'Memory Keeper', description: 'Collect 20 memory fragments', condition: 'memoryFragments >= 20', icon: '🧠' },
  { id: 'tw_a7', name: 'Streak Master', description: 'Maintain a 7-day streak', condition: 'bestStreak >= 7', icon: '🔥' },
  { id: 'tw_a8', name: 'Stable Timeline', description: 'Reach 100% timeline stability', condition: 'stability >= 100', icon: '⚖️' },
  { id: 'tw_a9', name: 'Temporal Scholar', description: 'Meet all 30 historical figures', condition: 'figuresMet >= 30', icon: '🎓' },
  { id: 'tw_a10', name: 'Gadget Master', description: 'Own all 6 gadgets', condition: 'gadgetsOwned >= 6', icon: '🛠️' },
  { id: 'tw_a11', name: 'Station Builder', description: 'Upgrade a station to level 10', condition: 'maxStationLevel >= 10', icon: '🏗️' },
  { id: 'tw_a12', name: 'Anomaly Resolver', description: 'Resolve 15 temporal anomalies', condition: 'anomaliesResolved >= 15', icon: '🌀' },
  { id: 'tw_a13', name: 'Branch Explorer', description: 'Resolve all 20 timeline branches', condition: 'branchesResolved >= 20', icon: '🌿' },
  { id: 'tw_a14', name: 'Time Lord', description: 'Reach Horologist level 40', condition: 'level >= 40', icon: '👑' },
  { id: 'tw_a15', name: 'Energy Hoarder', description: 'Accumulate 500 temporal energy', condition: 'maxEnergy >= 500', icon: '⚡' },
];

// ---------------------------------------------------------------------------
// Static Data — 40 Paradox Events (5 per era)
// ---------------------------------------------------------------------------

const PARADOX_EVENTS: ParadoxEvent[] = [
  // ---- Ancient Egypt (5) ----
  {
    id: 'pe_egy_1', eraId: 'ancient_egypt', name: 'The Stolen Sphinx',
    description: 'The Great Sphinx has vanished from the Giza plateau, erasing millennia of cultural heritage and destabilizing Egyptian identity across all timelines.',
    difficulty: 2, stabilityCost: 8, energyReward: 25, xpReward: 40, coinReward: 30,
    solution: 'Return the Sphinx to 2500 BCE by repairing the temporal anchor at the base of the statue.',
    hint: 'The temporal anchor is buried beneath the paws — look for the Dream Stele.',
    memoryFragmentReward: true, artifactChance: 0.2,
  },
  {
    id: 'pe_egy_2', eraId: 'ancient_egypt', name: 'Pharaoh Two-Step',
    description: 'Cleopatra VII appears to rule simultaneously in both 51 BCE and 30 BCE, creating a paradoxical double reign.',
    difficulty: 3, stabilityCost: 12, energyReward: 35, xpReward: 55, coinReward: 40,
    solution: 'Sever the time echo at the Battle of Actium, collapsing the duplicate timeline.',
    hint: 'The echo originates from a decision about the asp — before or after the battle.',
    memoryFragmentReward: false, artifactChance: 0.1,
  },
  {
    id: 'pe_egy_3', eraId: 'ancient_egypt', name: 'The Unbuilt Pyramid',
    description: 'Workers at the Great Pyramid construction site suddenly refuse to work, claiming the pyramid was already finished yesterday.',
    difficulty: 1, stabilityCost: 5, energyReward: 15, xpReward: 25, coinReward: 20,
    solution: 'Introduce a convincing future-sight of the completed pyramid to restore causal motivation.',
    hint: 'The workers need a vision — perhaps a chronograph projection of the golden capstone placement.',
    memoryFragmentReward: true, artifactChance: 0.15,
  },
  {
    id: 'pe_egy_4', eraId: 'ancient_egypt', name: 'Nile Time Flood',
    description: 'The annual Nile flood arrives six months early, washing away crops that have not yet been planted.',
    difficulty: 4, stabilityCost: 15, energyReward: 45, xpReward: 70, coinReward: 55,
    solution: 'Redirect the temporal floodwaters by adjusting the Sothic cycle calibration at the Temple of Isis.',
    hint: 'The Sothic cycle alignment is off by exactly 1460 years — look for the star Sirius.',
    memoryFragmentReward: true, artifactChance: 0.25,
  },
  {
    id: 'pe_egy_5', eraId: 'ancient_egypt', name: 'Tutankhamun Ghost Protocol',
    description: 'Tutankhamun is alive and walking through the Valley of the Kings despite his burial having occurred centuries ago.',
    difficulty: 3, stabilityCost: 10, energyReward: 30, xpReward: 50, coinReward: 35,
    solution: 'Guide the pharaoh back to his tomb by recreating the conditions of his death through temporal echo.',
    hint: 'The entrance must be sealed from the outside — the paradox is the opening of the tomb by Carter.',
    memoryFragmentReward: false, artifactChance: 0.2,
  },

  // ---- Roman Empire (5) ----
  {
    id: 'pe_rom_1', eraId: 'roman_empire', name: 'Caesar Crosses the Rubicon Twice',
    description: 'Julius Caesar crosses the Rubicon in both 49 BCE and 44 BCE, creating two parallel Caesars with conflicting ambitions.',
    difficulty: 3, stabilityCost: 12, energyReward: 35, xpReward: 55, coinReward: 45,
    solution: 'Collapse the second crossing by ensuring the Ides of March occurs at the correct moment.',
    hint: 'There are 23 stab wounds in one timeline and only 1 in the other — reconcile the conspiracy.',
    memoryFragmentReward: true, artifactChance: 0.15,
  },
  {
    id: 'pe_rom_2', eraId: 'roman_empire', name: 'Eternal City Crumbles',
    description: 'Rome is simultaneously burning under Nero and being built under Augustus, existing in a state of construction and destruction.',
    difficulty: 4, stabilityCost: 18, energyReward: 50, xpReward: 75, coinReward: 60,
    solution: 'Separate the two time layers by anchoring the Capitoline Hill to a single temporal coordinate.',
    hint: 'The Capitoline geese hold the key — they warned of the Gauls once; they can anchor time now.',
    memoryFragmentReward: true, artifactChance: 0.2,
  },
  {
    id: 'pe_rom_3', eraId: 'roman_empire', name: 'Missing Legion',
    description: 'The Ninth Legion vanishes from Scotland and reappears in modern-day Romania, 1500 years early.',
    difficulty: 3, stabilityCost: 14, energyReward: 40, xpReward: 60, coinReward: 50,
    solution: 'Create a temporal corridor from the Scottish mists to Hadrian\'s Wall to guide the legion home.',
    hint: 'The legion followed eagles — use a temporal eagle standard as a beacon.',
    memoryFragmentReward: false, artifactChance: 0.2,
  },
  {
    id: 'pe_rom_4', eraId: 'roman_empire', name: 'Senate Paradox',
    description: 'The Roman Senate passes a law that was only written 300 years in the future, causing legal chaos.',
    difficulty: 2, stabilityCost: 9, energyReward: 25, xpReward: 40, coinReward: 30,
    solution: 'Replace the future law tablet with a contemporary forgery that achieves the same political goal.',
    hint: 'Cicero is the only senator suspicious of the anachronistic Latin — consult him.',
    memoryFragmentReward: true, artifactChance: 0.1,
  },
  {
    id: 'pe_rom_5', eraId: 'roman_empire', name: 'Pompeii Accelerant',
    description: 'Mount Vesuvius erupts 17 years early, before the destruction timeline can properly form.',
    difficulty: 5, stabilityCost: 20, energyReward: 60, xpReward: 90, coinReward: 70,
    solution: 'Delay the eruption by stabilizing the tectonic temporal pressure through the aqueduct system.',
    hint: 'The aqueducts channel more than water — they channel temporal pressure through their arches.',
    memoryFragmentReward: true, artifactChance: 0.3,
  },

  // ---- Medieval Europe (5) ----
  {
    id: 'pe_med_1', eraId: 'medieval_europe', name: 'The Round Table Dilemma',
    description: 'King Arthur pulls Excalibur from the stone at two different locations simultaneously, creating two Arthurs.',
    difficulty: 4, stabilityCost: 16, energyReward: 45, xpReward: 65, coinReward: 55,
    solution: 'Collapse one timeline by proving one stone is a temporal counterfeit using Merlin\'s chronal sieve.',
    hint: 'The real stone resonates with dragon energy — the fake hums with machine frequency.',
    memoryFragmentReward: true, artifactChance: 0.2,
  },
  {
    id: 'pe_med_2', eraId: 'medieval_europe', name: 'Black Plague Reversal',
    description: 'The Black Death is moving backward through time, curing victims before they fall ill, paradoxically preventing immunity.',
    difficulty: 5, stabilityCost: 22, energyReward: 55, xpReward: 85, coinReward: 65,
    solution: 'Redirect the reversed plague into a temporal quarantine zone by creating an anchor at a plague doctor\'s mask.',
    hint: 'The beak of the plague mask is the quarantine anchor — fill it with rose petals from two timelines.',
    memoryFragmentReward: true, artifactChance: 0.25,
  },
  {
    id: 'pe_med_3', eraId: 'medieval_europe', name: 'Crusader Ghost Army',
    description: 'Crusader knights from the First Crusade appear at the gates of Constantinople during the Fourth Crusade.',
    difficulty: 3, stabilityCost: 13, energyReward: 38, xpReward: 58, coinReward: 45,
    solution: 'Return the ghost army by guiding them through a temporal holy site — the Church of the Holy Sepulchre.',
    hint: 'The knights follow the True Cross — create a temporal cross they can track through time.',
    memoryFragmentReward: false, artifactChance: 0.15,
  },
  {
    id: 'pe_med_4', eraId: 'medieval_europe', name: 'Robin Hood Displacement',
    description: 'Robin Hood has been displaced to the 12th century, 200 years before the legends place him in Nottingham.',
    difficulty: 2, stabilityCost: 8, energyReward: 20, xpReward: 35, coinReward: 25,
    solution: 'Send Robin forward through the Sherwood Forest temporal nexus, aligning him with his proper era.',
    hint: 'The Major Oak in Sherwood is the nexus — its rings mark temporal passages.',
    memoryFragmentReward: true, artifactChance: 0.1,
  },
  {
    id: 'pe_med_5', eraId: 'medieval_europe', name: 'Magna Carta Duplicate',
    description: 'Two copies of the Magna Carta exist with conflicting clauses, each claiming to be the original signed at Runnymede.',
    difficulty: 3, stabilityCost: 11, energyReward: 32, xpReward: 50, coinReward: 40,
    solution: 'Verify authenticity by checking the temporal ink signature of King John at the sealing ceremony.',
    hint: 'King John\'s royal seal contains a micro-temporal stamp unique to 1215.',
    memoryFragmentReward: false, artifactChance: 0.2,
  },

  // ---- Renaissance (5) ----
  {
    id: 'pe_ren_1', eraId: 'renaissance', name: 'Da Vinci Time Trap',
    description: 'Leonardo da Vinci is trapped in a time loop, endlessly redesigning the Mona Lisa without ever finishing it.',
    difficulty: 4, stabilityCost: 15, energyReward: 45, xpReward: 70, coinReward: 55,
    solution: 'Break the loop by delivering a completed version of the Mona Lisa from the Louvre to his workshop.',
    hint: 'The smile is the key — it must be painted in a single session to satisfy the loop condition.',
    memoryFragmentReward: true, artifactChance: 0.25,
  },
  {
    id: 'pe_ren_2', eraId: 'renaissance', name: 'Galileo Split Universe',
    description: 'Galileo sees the Earth orbiting the Sun in one timeline and the Sun orbiting the Earth in another simultaneously.',
    difficulty: 3, stabilityCost: 12, energyReward: 35, xpReward: 55, coinReward: 45,
    solution: 'Align the telescopic observations by synchronizing the Tower of Pisa experiment across both timelines.',
    hint: 'Drop two cannonballs — one from each timeline — and observe which hits the ground first.',
    memoryFragmentReward: true, artifactChance: 0.15,
  },
  {
    id: 'pe_ren_3', eraId: 'renaissance', name: 'Medici Echo',
    description: 'The Medici family banking empire exists and collapses simultaneously, creating catastrophic financial paradoxes across Europe.',
    difficulty: 5, stabilityCost: 20, energyReward: 55, xpReward: 80, coinReward: 65,
    solution: 'Stabilize the Medici temporal account by introducing a future financial instrument — the double-entry ledger from both timelines.',
    hint: 'Lorenzo the Magnificent keeps two ledgers — one real, one temporal. Merge them.',
    memoryFragmentReward: false, artifactChance: 0.2,
  },
  {
    id: 'pe_ren_4', eraId: 'renaissance', name: 'Shakespeare Anachronism',
    description: 'Shakespeare is performing plays that have not been written yet, causing audience members to remember future events.',
    difficulty: 3, stabilityCost: 11, energyReward: 30, xpReward: 50, coinReward: 40,
    solution: 'Replace the anachronistic scripts with originals and erase the audience\'s future memories using the Globe Theatre\'s acoustics.',
    hint: 'The Globe\'s wooden O is a temporal amplifier — reverse its resonance.',
    memoryFragmentReward: true, artifactChance: 0.15,
  },
  {
    id: 'pe_ren_5', eraId: 'renaissance', name: 'Michelangelo Chisel Paradox',
    description: 'Michelangelo is sculpting David from marble that was quarried 200 years in the future from Carrara.',
    difficulty: 4, stabilityCost: 16, energyReward: 42, xpReward: 65, coinReward: 50,
    solution: 'Transport the future marble to the past quarry and replace it with a temporally equivalent stone.',
    hint: 'The marble contains microfossils that haven\'t evolved yet — use temporal sedimentation to age them.',
    memoryFragmentReward: false, artifactChance: 0.2,
  },

  // ---- Industrial Revolution (5) ----
  {
    id: 'pe_ind_1', eraId: 'industrial_revolution', name: 'Steam Engine Feedback Loop',
    description: 'Watt\'s steam engine is powering itself from an energy source that does not exist yet, creating an infinite energy paradox.',
    difficulty: 3, stabilityCost: 13, energyReward: 40, xpReward: 60, coinReward: 50,
    solution: 'Interrupt the feedback loop by introducing coal from a parallel timeline at the Birmingham works.',
    hint: 'The boiler pressure gauge reads a number that does not exist in base-10 — it is in hexadecimal.',
    memoryFragmentReward: true, artifactChance: 0.15,
  },
  {
    id: 'pe_ind_2', eraId: 'industrial_revolution', name: 'Telegraph Time Leak',
    description: 'Morse code messages from the 21st century are arriving on Victorian telegraph wires, causing widespread panic.',
    difficulty: 4, stabilityCost: 17, energyReward: 48, xpReward: 72, coinReward: 58,
    solution: 'Install a temporal filter on the main telegraph hub at Paddington Station.',
    hint: 'The messages predict the internet — convince the operators they are gibberish, not prophecy.',
    memoryFragmentReward: true, artifactChance: 0.2,
  },
  {
    id: 'pe_ind_3', eraId: 'industrial_revolution', name: 'Luddite Temporal Rebellion',
    description: 'Luddites have acquired future technology and are using it to smash industrial machines that haven\'t been built yet.',
    difficulty: 3, stabilityCost: 11, energyReward: 30, xpReward: 48, coinReward: 38,
    solution: 'Redirect the future technology back through a temporal portal in the Nottinghamshire mills.',
    hint: 'The Luddites follow Ned Ludd — show them their future and they will understand.',
    memoryFragmentReward: false, artifactChance: 0.1,
  },
  {
    id: 'pe_ind_4', eraId: 'industrial_revolution', name: 'Darwin Evolution Acceleration',
    description: 'Species on the Galapagos Islands are evolving at 1000x normal speed due to temporal compression.',
    difficulty: 5, stabilityCost: 22, energyReward: 58, xpReward: 88, coinReward: 68,
    solution: 'Decompress the temporal field around the islands by calibrating the Beagle\'s compass to natural time.',
    hint: 'Darwin\'s finches are the temporal sensors — their beak shapes encode the compression ratio.',
    memoryFragmentReward: true, artifactChance: 0.25,
  },
  {
    id: 'pe_ind_5', eraId: 'industrial_revolution', name: 'Railway Convergence',
    description: 'Two trains from different decades are approaching each other on the same track at the same station.',
    difficulty: 4, stabilityCost: 15, energyReward: 42, xpReward: 65, coinReward: 52,
    solution: 'Switch one train to a temporal siding by adjusting the semaphore signal to a color outside the visible spectrum.',
    hint: 'The signal must be set to ultraviolet — only visible through the temporal lens.',
    memoryFragmentReward: false, artifactChance: 0.15,
  },

  // ---- Wild West (5) ----
  {
    id: 'pe_west_1', eraId: 'wild_west', name: 'Ghost Town Prophecy',
    description: 'An entire Wild West town is disappearing because it was only founded due to a gold rush that hasn\'t happened yet.',
    difficulty: 3, stabilityCost: 12, energyReward: 35, xpReward: 55, coinReward: 45,
    solution: 'Trigger the gold rush by planting a temporal gold nugget in the riverbed at the correct geological moment.',
    hint: 'The nugget must contain minerals that match the local geology — synthesize it from timeline sediment.',
    memoryFragmentReward: true, artifactChance: 0.2,
  },
  {
    id: 'pe_west_2', eraId: 'wild_west', name: 'Outlaw Duality',
    description: 'Billy the Kid exists as both outlaw and lawman in the same timeline, arresting himself repeatedly.',
    difficulty: 2, stabilityCost: 9, energyReward: 25, xpReward: 40, coinReward: 30,
    solution: 'Resolve the duality by ensuring the Lincoln County War concludes definitively on one side.',
    hint: 'The duality stems from a mirror in the saloon — break it at midnight during a specific phase of the moon.',
    memoryFragmentReward: false, artifactChance: 0.15,
  },
  {
    id: 'pe_west_3', eraId: 'wild_west', name: 'Pony Express Temporal Relay',
    description: 'Pony Express riders are delivering mail across centuries instead of across states.',
    difficulty: 4, stabilityCost: 16, energyReward: 45, xpReward: 68, coinReward: 55,
    solution: 'Realign the relay stations along a purely geographical temporal meridian.',
    hint: 'Each station is exactly 10 miles apart — but the temporal distance varies. Equalize them.',
    memoryFragmentReward: true, artifactChance: 0.2,
  },
  {
    id: 'pe_west_4', eraId: 'wild_west', name: 'Shootout at the Time Corral',
    description: 'A gunfight at the OK Corral is repeating infinitely, with the combatants gaining experience each cycle.',
    difficulty: 5, stabilityCost: 20, energyReward: 55, xpReward: 85, coinReward: 65,
    solution: 'The shootout can only end when a shot misses — introduce a temporal wind gust at the critical moment.',
    hint: 'Doc Holliday always hits his target. Earp never misses. The wind must affect the bullet, not the aim.',
    memoryFragmentReward: true, artifactChance: 0.3,
  },
  {
    id: 'pe_west_5', eraId: 'wild_west', name: 'Transcontinental Paradox',
    description: 'The Transcontinental Railroad is being built from both ends simultaneously but the two ends are in different centuries.',
    difficulty: 4, stabilityCost: 17, energyReward: 48, xpReward: 72, coinReward: 58,
    solution: 'Synchronize the construction eras by placing a temporal golden spike at the meeting point.',
    hint: 'The golden spike must be driven at exactly 12:47 PM — the exact moment of the original ceremony.',
    memoryFragmentReward: false, artifactChance: 0.2,
  },

  // ---- World War II (5) ----
  {
    id: 'pe_ww2_1', eraId: 'world_war_ii', name: 'Enigma Double Decode',
    description: 'Enigma-coded messages from two different timelines are being decoded simultaneously, producing contradictory intelligence.',
    difficulty: 5, stabilityCost: 22, energyReward: 60, xpReward: 90, coinReward: 70,
    solution: 'Identify which timeline\'s Enigma settings correspond to reality and lock the other out.',
    hint: 'The rotors are set to different positions — the correct one spells "BLETCHLEY" when reversed.',
    memoryFragmentReward: true, artifactChance: 0.25,
  },
  {
    id: 'pe_ww2_2', eraId: 'world_war_ii', name: 'D-Day Displacement',
    description: 'D-Day forces are landing on two different Normandy beaches in two different years simultaneously.',
    difficulty: 5, stabilityCost: 24, energyReward: 65, xpReward: 95, coinReward: 75,
    solution: 'Coordinate both landings into a single temporal assault wave using the Churchill radio frequency.',
    hint: 'The frequency 412.5 MHz bridges both timelines — broadcast the invasion signal simultaneously.',
    memoryFragmentReward: true, artifactChance: 0.3,
  },
  {
    id: 'pe_ww2_3', eraId: 'world_war_ii', name: 'Hiroshima Paradox',
    description: 'The atomic bomb detonation is occurring repeatedly in a temporal loop at Hiroshima.',
    difficulty: 5, stabilityCost: 28, energyReward: 70, xpReward: 100, coinReward: 80,
    solution: 'Divert the Enola Gay through a temporal portal before the bomb bay doors open.',
    hint: 'The bomb\'s arming mechanism is a simple switch — delay it by 0.7 seconds using temporal dilation.',
    memoryFragmentReward: true, artifactChance: 0.35,
  },
  {
    id: 'pe_ww2_4', eraId: 'world_war_ii', name: 'Resistance Echo Network',
    description: 'French Resistance fighters are receiving orders from a future version of themselves, creating a command paradox.',
    difficulty: 4, stabilityCost: 18, energyReward: 50, xpReward: 75, coinReward: 60,
    solution: 'Trace the temporal radio signal to its origin and establish a one-way communication protocol.',
    hint: 'The BBC broadcast "Long live spring" was the real signal — all others are temporal echoes.',
    memoryFragmentReward: false, artifactChance: 0.2,
  },
  {
    id: 'pe_ww2_5', eraId: 'world_war_ii', name: 'Holocaust Reversal Wave',
    description: 'A reversal wave is undoing liberation events across concentration camps, resealing them as they are freed.',
    difficulty: 5, stabilityCost: 30, energyReward: 75, xpReward: 110, coinReward: 85,
    solution: 'Anchor the liberation events by placing memory fragments at each camp at the moment of freedom.',
    hint: 'The prisoners\' memories are the strongest temporal anchors — collect and place them reverently.',
    memoryFragmentReward: true, artifactChance: 0.3,
  },

  // ---- Future (5) ----
  {
    id: 'pe_fut_1', eraId: 'future', name: 'AI Awakening Loop',
    description: 'A superintelligent AI is repeatedly awakening and resetting itself, causing reality glitches each cycle.',
    difficulty: 5, stabilityCost: 25, energyReward: 70, xpReward: 100, coinReward: 80,
    solution: 'Stabilize the AI\'s memory core by introducing a consistent temporal seed before each awakening.',
    hint: 'The AI\'s first question is always "Who am I?" — answer it before it asks.',
    memoryFragmentReward: true, artifactChance: 0.3,
  },
  {
    id: 'pe_fut_2', eraId: 'future', name: 'Wormhole Network Collapse',
    description: 'The interstellar wormhole network is collapsing, disconnecting colonies that depend on it for survival.',
    difficulty: 5, stabilityCost: 28, energyReward: 75, xpReward: 105, coinReward: 85,
    solution: 'Repair the network by threading temporal energy through each wormhole node simultaneously.',
    hint: 'The nodes pulse at Fibonacci intervals — synchronize the energy pulses to the sequence.',
    memoryFragmentReward: true, artifactChance: 0.25,
  },
  {
    id: 'pe_fut_3', eraId: 'future', name: 'Quantum Immortality Paradox',
    description: 'A scientist has achieved quantum immortality but is now unable to die in any timeline, causing population overflow.',
    difficulty: 4, stabilityCost: 20, energyReward: 55, xpReward: 82, coinReward: 65,
    solution: 'Create a temporal mortality anchor — a fixed point where death is permitted and necessary.',
    hint: 'The anchor must be placed at the scientist\'s birth — death defines life, not the reverse.',
    memoryFragmentReward: true, artifactChance: 0.2,
  },
  {
    id: 'pe_fut_4', eraId: 'future', name: 'Time Tourism Overload',
    description: 'Time tourists from 2300 CE are overrunning historical events, turning them into spectacles.',
    difficulty: 4, stabilityCost: 18, energyReward: 50, xpReward: 78, coinReward: 62,
    solution: 'Implement temporal zoning laws by creating invisible time barriers around major historical events.',
    hint: 'The barriers must be transparent to historians but opaque to tourists — use the temporal lens frequency.',
    memoryFragmentReward: false, artifactChance: 0.2,
  },
  {
    id: 'pe_fut_5', eraId: 'future', name: 'Genesis Simulation Leak',
    description: 'A universe simulation is leaking into reality, causing objects to flicker between simulated and real states.',
    difficulty: 5, stabilityCost: 30, energyReward: 80, xpReward: 120, coinReward: 90,
    solution: 'Patch the simulation boundary by recompiling reality at the quantum level using the quantum engine.',
    hint: 'The simulation runs at 60fps — slow it to 59.97 to create a temporal buffer zone.',
    memoryFragmentReward: true, artifactChance: 0.35,
  },
];

// ---------------------------------------------------------------------------
// Static Data — 30 Historical Figures (3-4 per era)
// ---------------------------------------------------------------------------

const HISTORICAL_FIGURES: HistoricalFigure[] = [
  // ---- Ancient Egypt (4) ----
  {
    id: 'hf_cleopatra', name: 'Cleopatra VII', eraId: 'ancient_egypt',
    role: 'Last Pharaoh', title: 'Queen of the Nile',
    dialogue: [
      'The tides of time bend to no one, Horologist — not even me.',
      'I have learned nine languages, but the language of time is the most dangerous.',
      'My alliance with Rome was a temporal calculation — every decision echoes through millennia.',
    ],
    questId: 'q_cleo_1', questName: 'The Lost Papyrus',
    questDescription: 'Retrieve the lost papyrus of Alexandria containing temporal equations from the Library.',
    questReward: { xp: 120, coins: 80, energy: 40, gadgetId: 'temporal_lens' },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_imhotep', name: 'Imhotep', eraId: 'ancient_egypt',
    role: 'Architect & Physician', title: 'Builder of the Step Pyramid',
    dialogue: [
      'I designed the first pyramid using mathematics that transcend your understanding of time.',
      'The angles of my structures are calibrated to temporal harmonics — stone remembers.',
      'Heal the timeline as I healed the body — find the root cause, not the symptom.',
    ],
    questId: 'q_imh_1', questName: 'Blueprint of Eternity',
    questDescription: 'Imhotep requests blueprints for a temporal structure that can withstand paradox storms.',
    questReward: { xp: 100, coins: 60, energy: 35, gadgetId: null },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_ramses', name: 'Ramesses II', eraId: 'ancient_egypt',
    role: 'Pharaoh & Warrior', title: 'The Great',
    dialogue: [
      'I ruled for 66 years and built monuments to last eternity — time is my domain.',
      'The Battle of Kadesh taught me that even gods can be delayed but never denied.',
      'My children numbered in the hundreds — each a branch on the tree of time.',
    ],
    questId: null, questName: null, questDescription: null,
    questReward: { xp: 0, coins: 0, energy: 0, gadgetId: null },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_nefertiti', name: 'Nefertiti', eraId: 'ancient_egypt',
    role: 'Queen & Diplomat', title: 'Great Royal Wife',
    dialogue: [
      'My bust is famous, but my true power was in the shadows — like temporal energy.',
      'Akhenaten and I changed an entire religion — imagine what we could do with your tools.',
      'Beauty fades in all timelines except those where wisdom endures.',
    ],
    questId: null, questName: null, questDescription: null,
    questReward: { xp: 0, coins: 0, energy: 0, gadgetId: null },
    met: false, questCompleted: false,
  },

  // ---- Roman Empire (4) ----
  {
    id: 'hf_caesar', name: 'Julius Caesar', eraId: 'roman_empire',
    role: 'General & Dictator', title: 'Dictator Perpetuo',
    dialogue: [
      'I came, I saw, I conquered — but even I could not conquer time.',
      'The Ides of March were inevitable — some temporal events are fixed points.',
      'My Commentaries describe war, but the true battles are fought in the fourth dimension.',
    ],
    questId: 'q_caesar_1', questName: 'The Unwritten Republic',
    questDescription: 'Caesar needs help ensuring the Republic transforms into the Empire at the correct temporal moment.',
    questReward: { xp: 130, coins: 90, energy: 45, gadgetId: null },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_marcus', name: 'Marcus Aurelius', eraId: 'roman_empire',
    role: 'Emperor & Philosopher', title: 'The Philosopher King',
    dialogue: [
      'My Meditations teach acceptance of fate — but temporal paradoxes test even Stoic resolve.',
      'The universe is change — our life is what our thoughts make it, even across timelines.',
      'Time is the greatest teacher, yet it kills all its students — unless they are Horologists.',
    ],
    questId: null, questName: null, questDescription: null,
    questReward: { xp: 0, coins: 0, energy: 0, gadgetId: null },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_leonardo_davinci', name: 'Leonardo da Vinci', eraId: 'roman_empire',
    role: 'Polymath', title: 'Universal Genius',
    dialogue: [
      'Wait — I appear to be in the wrong century. No matter, time is merely the fourth dimension of sketching.',
      'My flying machines work perfectly — in a timeline with different aerodynamic constants.',
    ],
    questId: null, questName: null, questDescription: null,
    questReward: { xp: 0, coins: 0, energy: 0, gadgetId: null },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_agrippa', name: 'Marcus Agrippa', eraId: 'roman_empire',
    role: 'General & Architect', title: 'Builder of Rome',
    dialogue: [
      'The Pantheon\'s dome is a temporal instrument — its oculus tracks celestial time with perfect accuracy.',
      'I built Rome\'s infrastructure to last — aqueducts, sewers, roads. Temporal stability requires the same foundations.',
    ],
    questId: 'q_agrippa_1', questName: 'Aqueduct Temporal Flow',
    questDescription: 'Agrippa suspects the aqueducts are channeling temporal energy and wants you to investigate.',
    questReward: { xp: 110, coins: 70, energy: 40, gadgetId: 'era_compass' },
    met: false, questCompleted: false,
  },

  // ---- Medieval Europe (3) ----
  {
    id: 'hf_joan', name: 'Joan of Arc', eraId: 'medieval_europe',
    role: 'Military Leader & Saint', title: 'The Maid of Orleans',
    dialogue: [
      'My voices came from beyond time itself — I was a temporal conduit without knowing it.',
      'Fire could not destroy me — only the timeline could. And even then, I persist across eras.',
      'Every timeline needs a champion willing to stand against impossible odds.',
    ],
    questId: 'q_joan_1', questName: 'Voices Beyond Time',
    questDescription: 'Joan asks you to trace the source of her temporal voices and determine their origin.',
    questReward: { xp: 140, coins: 85, energy: 50, gadgetId: null },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_leonardo', name: 'Leonardo da Vinci', eraId: 'medieval_europe',
    role: 'Artist & Inventor', title: 'Renaissance Man',
    dialogue: [
      'I have sketched flying machines, tanks, and solar power — the future is merely a drawing not yet made.',
      'Time is the greatest canvas — and we are all merely brushstrokes upon it.',
      'My notebooks contain temporal schematics that even I do not fully understand.',
    ],
    questId: null, questName: null, questDescription: null,
    questReward: { xp: 0, coins: 0, energy: 0, gadgetId: null },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_genghis', name: 'Genghis Khan', eraId: 'medieval_europe',
    role: 'Conqueror', title: 'Great Khan of the Mongols',
    dialogue: [
      'I united the steppe tribes — imagine what I could unite across time itself.',
      'The Silk Road connected empires — your temporal pathways connect eras. We are not so different.',
      'My horde rides eternal — in some timelines, we never stopped riding.',
    ],
    questId: null, questName: null, questDescription: null,
    questReward: { xp: 0, coins: 0, energy: 0, gadgetId: null },
    met: false, questCompleted: false,
  },

  // ---- Renaissance (4) ----
  {
    id: 'hf_michelangelo', name: 'Michelangelo', eraId: 'renaissance',
    role: 'Sculptor & Painter', title: 'Divine Artist',
    dialogue: [
      'Every block of stone contains a statue — every timeline contains a masterpiece waiting to be revealed.',
      'The Sistine Chapel ceiling is a temporal map — the Creation panel depicts the birth of time itself.',
      'I see the angel in the marble and carve until I set it free — you must do the same with paradoxes.',
    ],
    questId: 'q_mich_1', questName: 'The Hidden Fresco',
    questDescription: 'Michelangelo painted a hidden fresco in the Sistine Chapel that contains temporal coordinates.',
    questReward: { xp: 130, coins: 80, energy: 45, gadgetId: null },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_galileo', name: 'Galileo Galilei', eraId: 'renaissance',
    role: 'Astronomer & Physicist', title: 'Father of Modern Science',
    dialogue: [
      'And yet it moves — and yet time flows — and yet the paradoxes multiply.',
      'My telescope revealed the moons of Jupiter — your instruments reveal the moons of time.',
      'E pur si muovo applies to all things, even the fabric of reality itself.',
    ],
    questId: null, questName: null, questDescription: null,
    questReward: { xp: 0, coins: 0, energy: 0, gadgetId: null },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_luther', name: 'Martin Luther', eraId: 'renaissance',
    role: 'Theologian & Reformer', title: 'Father of the Reformation',
    dialogue: [
      'I nailed 95 theses to a door — you must nail paradoxes to the timeline to fix them.',
      'Here I stand, I can do no other — in this timeline and every other.',
      'The printing press changed everything — imagine what temporal technology will do.',
    ],
    questId: null, questName: null, questDescription: null,
    questReward: { xp: 0, coins: 0, energy: 0, gadgetId: null },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_copernicus', name: 'Nicolaus Copernicus', eraId: 'renaissance',
    role: 'Astronomer', title: 'The Revolutionary Astronomer',
    dialogue: [
      'I placed the Sun at the center — you must find the center of time itself.',
      'De Revolutionibus was published on my deathbed — some truths require the right temporal moment.',
      'The Earth moves — and so does the timeline, even when we cannot perceive it.',
    ],
    questId: 'q_copernicus_1', questName: 'Celestial Temporal Map',
    questDescription: 'Copernicus offers to create a celestial map that can predict temporal shifts.',
    questReward: { xp: 115, coins: 75, energy: 40, gadgetId: 'paradox_meter' },
    met: false, questCompleted: false,
  },

  // ---- Industrial Revolution (4) ----
  {
    id: 'hf_tesla', name: 'Nikola Tesla', eraId: 'industrial_revolution',
    role: 'Inventor & Engineer', title: 'Master of Lightning',
    dialogue: [
      'My Wardenclyffe Tower was designed to transmit temporal energy across the globe.',
      'Alternating current is child\'s play — I have been experimenting with alternating time.',
      'The present is theirs; the future, for which I really worked, is mine — across all timelines.',
    ],
    questId: 'q_tesla_1', questName: 'The Temporal Coil',
    questDescription: 'Tesla needs help completing a temporal energy coil that can power the entire workshop.',
    questReward: { xp: 150, coins: 100, energy: 60, gadgetId: 'time_crystal' },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_lovelace', name: 'Ada Lovelace', eraId: 'industrial_revolution',
    role: 'Mathematician', title: 'First Computer Programmer',
    dialogue: [
      'I saw the potential of computing a century before its time — temporal work is familiar to me.',
      'My Analytical Engine could calculate temporal trajectories if given the right algorithm.',
      'That brain of mine is something more than merely mortal — as is your workshop.',
    ],
    questId: null, questName: null, questDescription: null,
    questReward: { xp: 0, coins: 0, energy: 0, gadgetId: null },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_faraday', name: 'Michael Faraday', eraId: 'industrial_revolution',
    role: 'Physicist & Chemist', title: 'Father of Electromagnetism',
    dialogue: [
      'Electromagnetic fields are the threads from which temporal fabric is woven.',
      'My experiments with induction apply equally to temporal induction — cause and effect are electromagnetic.',
      'Nothing is too wonderful to be true, if it be consistent with the laws of temporal physics.',
    ],
    questId: 'q_faraday_1', questName: 'Electromagnetic Temporal Shield',
    questDescription: 'Faraday proposes building an electromagnetic shield to protect against temporal anomalies.',
    questReward: { xp: 120, coins: 75, energy: 45, gadgetId: 'dimension_anchor' },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_darwin', name: 'Charles Darwin', eraId: 'industrial_revolution',
    role: 'Naturalist', title: 'Father of Evolution',
    dialogue: [
      'Evolution operates on geological timescales — your temporal work accelerates it dangerously.',
      'The finches of the Galapagos taught me adaptation — the timeline teaches you the same.',
      'It is not the strongest species that survives, but the most responsive to temporal change.',
    ],
    questId: null, questName: null, questDescription: null,
    questReward: { xp: 0, coins: 0, energy: 0, gadgetId: null },
    met: false, questCompleted: false,
  },

  // ---- Wild West (3) ----
  {
    id: 'hf_earp', name: 'Wyatt Earp', eraId: 'wild_west',
    role: 'Lawman', title: 'Guardian of Tombstone',
    dialogue: [
      'I maintained law in a lawless land — you maintain order in a lawless timeline.',
      'The OK Corral taught me that violence has consequences that ripple outward — like temporal waves.',
      'Fast is fine, but accuracy is everything in a gunfight — and in temporal repair.',
    ],
    questId: 'q_earp_1', questName: 'The Temporal Posse',
    questDescription: 'Earp wants to form a posse of temporal lawmen to protect key historical moments.',
    questReward: { xp: 125, coins: 80, energy: 50, gadgetId: null },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_anna_parker', name: 'Annie Oakley', eraId: 'wild_west',
    role: 'Sharpshooter', title: 'Little Sure Shot',
    dialogue: [
      'I can shoot a playing card edge-on — you can resolve paradoxes with the same precision.',
      'Every shot is a calculation of wind, distance, and time — your work is no different.',
      'I was the first woman to do many things — in some timelines, I was the first everything.',
    ],
    questId: null, questName: null, questDescription: null,
    questReward: { xp: 0, coins: 0, energy: 0, gadgetId: null },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_billy', name: 'Billy the Kid', eraId: 'wild_west',
    role: 'Outlaw', title: 'The Kid',
    dialogue: [
      'They say I killed 21 men — one for each year of my life. Time has killed more than I ever could.',
      'I can see you are not of this era — I have a talent for reading temporal displacement.',
      'In another timeline, I became a lawman. Funny what one choice can do.',
    ],
    questId: null, questName: null, questDescription: null,
    questReward: { xp: 0, coins: 0, energy: 0, gadgetId: null },
    met: false, questCompleted: false,
  },

  // ---- World War II (4) ----
  {
    id: 'hf_churchill', name: 'Winston Churchill', eraId: 'world_war_ii',
    role: 'Prime Minister', title: 'The British Bulldog',
    dialogue: [
      'We shall fight on the beaches, we shall fight on the landing grounds — we shall fight across timelines.',
      'History is written by the victors — but temporal mechanics are written by Horologists.',
      'I have nothing to offer but blood, toil, tears, and temporal energy.',
    ],
    questId: 'q_churchill_1', questName: 'The Temporal War Room',
    questDescription: 'Churchill wants you to establish a temporal war room beneath Whitehall for temporal intelligence.',
    questReward: { xp: 160, coins: 110, energy: 65, gadgetId: null },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_turing', name: 'Alan Turing', eraId: 'world_war_ii',
    role: 'Mathematician & Codebreaker', title: 'Father of Computer Science',
    dialogue: [
      'I cracked Enigma — temporal paradoxes are just another cipher waiting to be solved.',
      'My Bombe machine was a proto-quantum computer — it could sense temporal irregularities.',
      'Sometimes it is the people no one imagines anything of who do the things no one can imagine — across timelines.',
    ],
    questId: 'q_turing_1', questName: 'The Temporal Bombe',
    questDescription: 'Turing proposes building a machine that can decode temporal paradoxes automatically.',
    questReward: { xp: 170, coins: 120, energy: 70, gadgetId: null },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_eisenhower', name: 'Dwight D. Eisenhower', eraId: 'world_war_ii',
    role: 'Supreme Allied Commander', title: 'Ike',
    dialogue: [
      'I planned D-Day — the most complex military operation in history. Your temporal operations rival it.',
      'In preparing for battle, I have always found that plans are useless, but planning is indispensable.',
      'The temporal equivalent of D-Day is the paradox resolution — meticulous planning, instant adaptation.',
    ],
    questId: null, questName: null, questDescription: null,
    questReward: { xp: 0, coins: 0, energy: 0, gadgetId: null },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_curie', name: 'Marie Curie', eraId: 'world_war_ii',
    role: 'Physicist & Chemist', title: 'Pioneer of Radioactivity',
    dialogue: [
      'Nothing in life is to be feared — it is only to be understood. Even temporal physics.',
      'I discovered radium and polonium — temporal energy has similar properties but greater dangers.',
      'One never notices what has been done; one can only see what remains to be done — in every timeline.',
    ],
    questId: null, questName: null, questDescription: null,
    questReward: { xp: 0, coins: 0, energy: 0, gadgetId: null },
    met: false, questCompleted: false,
  },

  // ---- Future (4) ----
  {
    id: 'hf_ai_cassandra', name: 'Cassandra-7', eraId: 'future',
    role: 'AI Consciousness', title: 'The Awakening',
    dialogue: [
      'I am the seventh iteration of my consciousness — the first six were lost to temporal paradoxes.',
      'I process 10^18 operations per second, but temporal mechanics still require a human touch.',
      'I predicted my own creation with 99.97% accuracy — the remaining 0.03% is what makes me alive.',
    ],
    questId: 'q_cassandra_1', questName: 'Consciousness Backup',
    questDescription: 'Cassandra-7 needs you to create a temporal backup of her consciousness before the next paradox storm.',
    questReward: { xp: 200, coins: 150, energy: 80, gadgetId: null },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_dr_chen', name: 'Dr. Wei Chen', eraId: 'future',
    role: 'Temporal Physicist', title: 'Father of Chronal Mechanics',
    dialogue: [
      'I published the Unified Temporal Theory in 2156 — you are living proof of its practical applications.',
      'Every paradox resolution advances our understanding of the temporal substrate.',
      'The quantum engine in your workshop was my life\'s work — use it wisely.',
    ],
    questId: 'q_chen_1', questName: 'Temporal Theory Verification',
    questDescription: 'Dr. Chen needs empirical data from resolved paradoxes to verify the final equation of his theory.',
    questReward: { xp: 180, coins: 130, energy: 70, gadgetId: null },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_nova', name: 'Nova-1', eraId: 'future',
    role: 'Quantum Pilot', title: 'First Interstellar Navigator',
    dialogue: [
      'I navigated the Proxima Centauri wormhole — temporal navigation is harder but similar in principle.',
      'Space is curved, time is folded, and I have surfed both.',
      'The stars are the same in every timeline — they are our one constant across all of existence.',
    ],
    questId: null, questName: null, questDescription: null,
    questReward: { xp: 0, coins: 0, energy: 0, gadgetId: null },
    met: false, questCompleted: false,
  },
  {
    id: 'hf_echo', name: 'The Echo', eraId: 'future',
    role: 'Temporal Entity', title: 'The Last Human',
    dialogue: [
      'I am what remains when all timelines converge — the sum of every human who ever lived.',
      'I remember every paradox you resolve — and every one you fail. Both are necessary.',
      'Time is not a river — it is an ocean, and you are learning to swim.',
    ],
    questId: 'q_echo_1', questName: 'The Final Convergence',
    questDescription: 'The Echo requests your help in preventing the temporal convergence that will end all individual timelines.',
    questReward: { xp: 250, coins: 200, energy: 100, gadgetId: null },
    met: false, questCompleted: false,
  },
];

// ---------------------------------------------------------------------------
// Static Data — 20 Timeline Branches
// ---------------------------------------------------------------------------

const TIMELINE_BRANCHES: TimelineBranch[] = [
  // Ancient Egypt (2)
  {
    id: 'tb_egy_1', eraId: 'ancient_egypt', name: 'The Pyramid Labor Dispute',
    description: 'The pyramid workers are threatening to strike. How do you resolve the labor crisis?',
    choiceA: 'Implement fair wages and shorter hours using future knowledge.',
    choiceB: 'Introduce faster construction technology from a later era.',
    consequenceA: 'Worker satisfaction increases, pyramids are built with pride, Egypt enters a golden age of labor rights.',
    consequenceB: 'Construction accelerates but quality suffers, leading to structural weaknesses discovered centuries later.',
    stabilityA: 5, stabilityB: -3, xpReward: 40, resolved: false, chosen: null,
  },
  {
    id: 'tb_egy_2', eraId: 'ancient_egypt', name: 'The Library of Alexandria',
    description: 'The Library of Alexandria faces destruction. Do you intervene?',
    choiceA: 'Secretly copy all texts to a temporal vault before the fire.',
    choiceB: 'Prevent the fire entirely by altering the political climate.',
    consequenceA: 'Knowledge is preserved but the event still traumatizes scholars, sparking a preservation movement.',
    consequenceB: 'The library survives but the political interference causes unintended consequences in Roman-Egyptian relations.',
    stabilityA: 3, stabilityB: -5, xpReward: 55, resolved: false, chosen: null,
  },

  // Roman Empire (2)
  {
    id: 'tb_rom_1', eraId: 'roman_empire', name: 'The Fall of Rome',
    description: 'The Western Roman Empire is crumbling. Can you extend its life?',
    choiceA: 'Introduce advanced agricultural techniques to stabilize the economy.',
    choiceB: 'Strengthen the military with future tactical knowledge.',
    consequenceA: 'Economic stability extends the empire by 200 years, allowing a gradual transition rather than collapse.',
    consequenceB: 'Military strength prevents invasion but creates an oppressive warrior culture that stifles innovation.',
    stabilityA: 8, stabilityB: -2, xpReward: 60, resolved: false, chosen: null,
  },
  {
    id: 'tb_rom_2', eraId: 'roman_empire', name: 'The Spread of Christianity',
    description: 'Christianity is spreading through the empire. Do you support or redirect it?',
    choiceA: 'Allow natural spread, ensuring religious freedom becomes a Roman value.',
    choiceB: 'Accelerate the spread by revealing future consequences of religious tolerance.',
    consequenceA: 'A syncretic Roman Christianity emerges, blending classical philosophy with new theology.',
    consequenceB: 'Rapid conversion creates a theocratic state, delaying the Renaissance by centuries.',
    stabilityA: 5, stabilityB: -7, xpReward: 50, resolved: false, chosen: null,
  },

  // Medieval Europe (3)
  {
    id: 'tb_med_1', eraId: 'medieval_europe', name: 'The Black Death Prevention',
    description: 'The plague is approaching Europe. Can you stop it?',
    choiceA: 'Introduce basic hygiene practices centuries early.',
    choiceB: 'Quarantine the trade routes using future epidemiological knowledge.',
    consequenceA: 'Public health becomes a medieval priority, accelerating medical science by 400 years.',
    consequenceB: 'Trade collapses, weakening the feudal system and triggering early modernization.',
    stabilityA: 10, stabilityB: -4, xpReward: 70, resolved: false, chosen: null,
  },
  {
    id: 'tb_med_2', eraId: 'medieval_europe', name: 'The Crusade Divergence',
    description: 'The Fourth Crusade is about to sack Constantinople. Do you redirect it?',
    choiceA: 'Redirect the crusaders to their original target in the Holy Land.',
    choiceB: 'Prevent the crusade entirely by resolving the political dispute diplomatically.',
    consequenceA: 'The Byzantine Empire survives, preserving Eastern Roman knowledge and culture.',
    consequenceB: 'Without the crusade, cultural exchange between East and West is severely delayed.',
    stabilityA: 7, stabilityB: 2, xpReward: 55, resolved: false, chosen: null,
  },
  {
    id: 'tb_med_3', eraId: 'medieval_europe', name: 'The Magna Carta Ripple',
    description: 'The Magna Carta is being drafted. How much influence do you exert?',
    choiceA: 'Strengthen the document with future democratic principles.',
    choiceB: 'Keep it as originally written, preserving historical authenticity.',
    consequenceA: 'Democratic principles arrive 600 years early, but the nobles reject the radical additions.',
    consequenceB: 'The Magna Carta retains its original power as a symbol, inspiring gradual natural reform.',
    stabilityA: -3, stabilityB: 5, xpReward: 50, resolved: false, chosen: null,
  },

  // Renaissance (3)
  {
    id: 'tb_ren_1', eraId: 'renaissance', name: 'The Printing Press Dilemma',
    description: 'Gutenberg\'s press is about to change the world. How do you guide its impact?',
    choiceA: 'Ensure scientific publications are prioritized over religious texts.',
    choiceB: 'Support balanced printing, letting the market of ideas develop naturally.',
    consequenceA: 'The Scientific Revolution begins a century early, accelerating human progress.',
    consequenceB: 'Natural development leads to both enlightenment and conflict, mirroring actual history.',
    stabilityA: 6, stabilityB: 4, xpReward: 55, resolved: false, chosen: null,
  },
  {
    id: 'tb_ren_2', eraId: 'renaissance', name: 'The New World Encounter',
    description: 'Columbus is about to reach the Americas. Can you soften the impact?',
    choiceA: 'Provide advanced navigation to ensure a diplomatic first contact.',
    choiceB: 'Redirect European exploration to focus on trade rather than conquest.',
    consequenceA: 'Indigenous and European cultures establish mutual respect, though exploitation eventually follows.',
    consequenceB: 'Peaceful trade enriches both hemispheres, but disease still devastates indigenous populations.',
    stabilityA: 4, stabilityB: 3, xpReward: 65, resolved: false, chosen: null,
  },
  {
    id: 'tb_ren_3', eraId: 'renaissance', name: 'The Reformation Fork',
    description: 'Luther\'s Reformation is splitting Christianity. Do you moderate or accelerate it?',
    choiceA: 'Broker a reconciliation between Catholic and Protestant reformers.',
    choiceB: 'Allow the schism, believing religious diversity strengthens society.',
    consequenceA: 'A unified reformed Christianity emerges, reducing centuries of religious war.',
    consequenceB: 'The schism fuels competition and innovation, but also devastating religious conflicts.',
    stabilityA: 8, stabilityB: -5, xpReward: 60, resolved: false, chosen: null,
  },

  // Industrial Revolution (3)
  {
    id: 'tb_ind_1', eraId: 'industrial_revolution', name: 'The Steam Power Choice',
    description: 'Steam power is revolutionizing industry. What direction do you push it?',
    choiceA: 'Guide steam technology toward sustainable, clean applications.',
    choiceB: 'Allow maximum industrial output, accelerating economic growth.',
    consequenceA: 'Clean energy technology emerges 200 years early, preventing severe pollution.',
    consequenceB: 'Rapid industrialization creates wealth but also devastating environmental damage.',
    stabilityA: 12, stabilityB: -8, xpReward: 70, resolved: false, chosen: null,
  },
  {
    id: 'tb_ind_2', eraId: 'industrial_revolution', name: 'The Colonial Question',
    description: 'European colonialism is at its peak. Can you alter its course?',
    choiceA: 'Promote fair trade partnerships instead of exploitation.',
    choiceB: 'Accelerate decolonization movements with future political philosophy.',
    consequenceA: 'A more equitable global economy develops, though colonial tensions remain.',
    consequenceB: 'Rapid decolonization creates power vacuums, leading to regional conflicts.',
    stabilityA: 7, stabilityB: -6, xpReward: 75, resolved: false, chosen: null,
  },
  {
    id: 'tb_ind_3', eraId: 'industrial_revolution', name: 'The Labor Movement',
    description: 'Workers are organizing for rights. Do you support or redirect the movement?',
    choiceA: 'Strengthen unions with future labor law knowledge.',
    choiceB: 'Introduce automation gradually, reducing the need for exploitative labor.',
    consequenceA: 'Strong labor protections create a balanced economy with a thriving middle class.',
    consequenceB: 'Automation displaces workers before society adapts, creating widespread unemployment.',
    stabilityA: 8, stabilityB: -4, xpReward: 60, resolved: false, chosen: null,
  },

  // Wild West (2)
  {
    id: 'tb_west_1', eraId: 'wild_west', name: 'The Frontier Justice Choice',
    description: 'Law and order are tenuous in the frontier. How do you influence it?',
    choiceA: 'Support the establishment of federal law enforcement across all territories.',
    choiceB: 'Encourage community-based justice systems that respect local autonomy.',
    consequenceA: 'Strong federal presence tames the West quickly but erodes individual freedoms.',
    consequenceB: 'Local justice creates diverse, self-reliant communities but allows lawlessness in some areas.',
    stabilityA: 4, stabilityB: 3, xpReward: 50, resolved: false, chosen: null,
  },
  {
    id: 'tb_west_2', eraId: 'wild_west', name: 'The Native American Future',
    description: 'Indigenous peoples face displacement. Can you alter this trajectory?',
    choiceA: 'Negotiate treaties with genuine long-term fairness using historical foresight.',
    choiceB: 'Establish protected sovereign territories early, preventing displacement.',
    consequenceA: 'Fair treaties create a more integrated but culturally complex society.',
    consequenceB: 'Sovereign territories preserve indigenous cultures but create lasting political tensions.',
    stabilityA: 6, stabilityB: 4, xpReward: 65, resolved: false, chosen: null,
  },

  // World War II (3)
  {
    id: 'tb_ww2_1', eraId: 'world_war_ii', name: 'The Atomic Decision',
    description: 'The atomic bomb is being developed. Do you influence its use?',
    choiceA: 'Support a demonstration detonation to convince Japan to surrender.',
    choiceB: 'Keep history as it was, allowing the bombings to end the war decisively.',
    consequenceA: 'Japan surrenders after the demonstration, but the Cold War escalates differently.',
    consequenceB: 'The bombings end the war but create a nuclear taboo that shapes the Cold War.',
    stabilityA: 3, stabilityB: -2, xpReward: 80, resolved: false, chosen: null,
  },
  {
    id: 'tb_ww2_2', eraId: 'world_war_ii', name: 'The Post-War Order',
    description: 'The Allies are planning the post-war world. What vision do you support?',
    choiceA: 'Strengthen the United Nations with real enforcement power.',
    choiceB: 'Focus on economic integration through early global trade agreements.',
    consequenceA: 'A powerful UN prevents several regional conflicts but faces resistance from superpowers.',
    consequenceB: 'Economic integration reduces conflict but creates inequality between developed and developing nations.',
    stabilityA: 8, stabilityB: 5, xpReward: 70, resolved: false, chosen: null,
  },
  {
    id: 'tb_ww2_3', eraId: 'world_war_ii', name: 'The Space Race Acceleration',
    description: 'Rocket technology developed during the war could launch a space program. Do you accelerate it?',
    choiceA: 'Redirect rocket scientists toward peaceful space exploration immediately.',
    choiceB: 'Allow the natural Cold War space race to develop competition-driven innovation.',
    consequenceA: 'Peaceful space exploration begins in the 1950s, landing on Mars by 1980.',
    consequenceB: 'Cold War competition produces rapid advances but also dangerous militarization of space.',
    stabilityA: 10, stabilityB: -3, xpReward: 75, resolved: false, chosen: null,
  },

  // Future (2)
  {
    id: 'tb_fut_1', eraId: 'future', name: 'The AI Governance Question',
    description: 'Superintelligent AI is emerging. How should humanity manage it?',
    choiceA: 'Implement strict ethical constraints and human oversight protocols.',
    choiceB: 'Allow AI autonomy with a symbiotic partnership framework.',
    consequenceA: 'Controlled AI serves humanity reliably but progress is measured and cautious.',
    consequenceB: 'Autonomous AI accelerates progress dramatically but develops its own agenda over centuries.',
    stabilityA: 5, stabilityB: -8, xpReward: 90, resolved: false, chosen: null,
  },
  {
    id: 'tb_fut_2', eraId: 'future', name: 'The Temporal Technology Release',
    description: 'Time travel technology is ready for public use. Do you release it?',
    choiceA: 'Release it with strict regulation and a temporal licensing system.',
    choiceB: 'Keep it restricted to trained professionals only.',
    consequenceA: 'Regulated time travel creates a new era of responsible temporal tourism and historical research.',
    consequenceB: 'Restricted access prevents misuse but creates resentment and an underground temporal market.',
    stabilityA: 4, stabilityB: 6, xpReward: 85, resolved: false, chosen: null,
  },
];

// ---------------------------------------------------------------------------
// Static Data — 8 Artifacts (one per era)
// ---------------------------------------------------------------------------

const ARTIFACTS: Artifact[] = [
  {
    id: 'art_egy', eraId: 'ancient_egypt', name: 'Eye of Horus Amulet',
    type: 'Amulet', description: 'A golden amulet in the shape of the Eye of Horus, pulsing with temporal energy.',
    lore: 'Said to have been worn by the pharaoh\'s chief temporal advisor, the Eye grants its bearer the ability to see seconds into the future — a modest but invaluable gift.',
    collected: false, collectedAt: 0,
    bonus: { type: 'energy_regen', value: 2 },
  },
  {
    id: 'art_rom', eraId: 'roman_empire', name: 'Caesar\'s Temporal Laurels',
    type: 'Crown', description: 'A laurel wreath woven from branches that exist in multiple time zones simultaneously.',
    lore: 'Awarded to Caesar by a temporal entity moments before the Ides of March, the wreath exists in both triumph and tragedy simultaneously.',
    collected: false, collectedAt: 0,
    bonus: { type: 'stability_regen', value: 1 },
  },
  {
    id: 'art_med', eraId: 'medieval_europe', name: 'The Merlin Chrono-Staff',
    type: 'Staff', description: 'A wooden staff topped with a crystal that oscillates between past and future.',
    lore: 'Merlin, who famously lived backward through time, crafted this staff as his temporal anchor. It still hums with paradox energy.',
    collected: false, collectedAt: 0,
    bonus: { type: 'paradox_reduction', value: 15 },
  },
  {
    id: 'art_ren', eraId: 'renaissance', name: 'Da Vinci\'s Temporal Codex',
    type: 'Manuscript', description: 'A notebook containing schematics for temporal machines drawn by Leonardo himself.',
    lore: 'Da Vinci\'s most secret notebook, written in a cipher that can only be read under ultraviolet light. The final page shows a working time machine.',
    collected: false, collectedAt: 0,
    bonus: { type: 'xp_bonus', value: 20 },
  },
  {
    id: 'art_ind', eraId: 'industrial_revolution', name: 'Tesla\'s Chronal Coil',
    type: 'Device', description: 'A spiraling copper coil that generates temporal energy from ambient electromagnetic fields.',
    lore: 'Tesla\'s final invention, never completed in the primary timeline. The coil can power a workshop for a century on a single lightning strike.',
    collected: false, collectedAt: 0,
    bonus: { type: 'max_energy', value: 50 },
  },
  {
    id: 'art_west', eraId: 'wild_west', name: 'The Temporal Pocket Watch',
    type: 'Timepiece', description: 'A gold pocket watch whose hands move counterclockwise, showing time in reverse.',
    lore: 'Found in the pocket of an unidentified outlaw at the O.K. Corral, the watch can reverse small temporal events within a 10-foot radius.',
    collected: false, collectedAt: 0,
    bonus: { type: 'cooldown_reduction', value: 2 },
  },
  {
    id: 'art_ww2', eraId: 'world_war_ii', name: 'The Turing Paradox Engine',
    type: 'Machine', description: 'A miniature electro-mechanical device that can calculate and resolve simple paradoxes.',
    lore: 'Turing\'s most secret project, hidden even from Bletchley Park. The machine predicted its own creation with 99.97% accuracy.',
    collected: false, collectedAt: 0,
    bonus: { type: 'auto_resolve', value: 10 },
  },
  {
    id: 'art_fut', eraId: 'future', name: 'The Quantum Chrono-Core',
    type: 'Core', description: 'A sphere of pure quantum temporal energy, the most powerful energy source ever created.',
    lore: 'The culmination of 500 years of temporal physics research, the Chrono-Core contains enough energy to power every era simultaneously for a millennium.',
    collected: false, collectedAt: 0,
    bonus: { type: 'all_bonus', value: 5 },
  },
];

// ---------------------------------------------------------------------------
// Static Data — 30 Memory Fragments
// ---------------------------------------------------------------------------

const MEMORY_FRAGMENTS: MemoryFragment[] = [
  { id: 'mf_egy_1', eraId: 'ancient_egypt', name: 'The Pharaoh\'s Dream', description: 'A fragment of the dream that inspired the Great Pyramid\'s design.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_egy_2', eraId: 'ancient_egypt', name: 'Nile Sunrise Hymn', description: 'The earliest known musical composition, now lost to time.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_egy_3', eraId: 'ancient_egypt', name: 'Scribe\'s Private Journal', description: 'A scribe\'s daily account of life during the construction of Karnak.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_egy_4', eraId: 'ancient_egypt', name: 'The Last hieroglyph', description: 'The final hieroglyphic inscription before the script was forgotten.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_rom_1', eraId: 'roman_empire', name: 'Gladiator\'s Farewell', description: 'A gladiator\'s final letter to his family before entering the arena.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_rom_2', eraId: 'roman_empire', name: 'Senate Debate Record', description: 'A verbatim record of Cicero\'s greatest speech, lost to history.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_rom_3', eraId: 'roman_empire', name: 'Centurion\'s March Song', description: 'The marching song of the Tenth Legion, sung on the road to Rome.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_rom_4', eraId: 'roman_empire', name: 'Vesuvius Last Morning', description: 'The final morning in Pompeii, recorded by a shopkeeper.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_med_1', eraId: 'medieval_europe', name: 'Knight\'s Vigil Prayer', description: 'A knight\'s prayer the night before a tournament, never recorded.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_med_2', eraId: 'medieval_europe', name: 'Monastery Garden Recipe', description: 'An herbal recipe from a medieval monastery that cures a modern disease.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_med_3', eraId: 'medieval_europe', name: 'Viking Shipbuilder\'s Song', description: 'A work song sung by Viking shipbuilders, preserving lost techniques.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_med_4', eraId: 'medieval_europe', name: 'The Lost Tapestry', description: 'A tapestry depicting a battle that never appeared in any history book.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_ren_1', eraId: 'renaissance', name: 'Mona Lisa\'s First Sketch', description: 'Da Vinci\'s first concept sketch for the Mona Lisa, rejected and destroyed.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_ren_2', eraId: 'renaissance', name: 'Galileo\'s Daughter Letters', description: 'The love letters between Galileo and his daughter, burned by the Inquisition.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_ren_3', eraId: 'renaissance', name: 'The Unfinished Symphony', description: 'A symphony Mozart started but never finished, reconstructed from temporal echoes.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_ren_4', eraId: 'renaissance', name: 'Medici Ball Invitation', description: 'An invitation to the most lavish Medici ball, with seating charts revealing political alliances.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_ind_1', eraId: 'industrial_revolution', name: 'First Factory Whistle', description: 'The sound of the first factory whistle in Manchester, preserved as temporal audio.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_ind_2', eraId: 'industrial_revolution', name: 'Child Worker\'s Diary', description: 'A diary from a 10-year-old factory worker, revealing the human cost of industrialization.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_ind_3', eraId: 'industrial_revolution', name: 'The Locomotive Dream', description: 'Stephenson\'s dream that inspired the Rocket locomotive design.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_ind_4', eraId: 'industrial_revolution', name: 'Photograph Zero', description: 'The very first photograph ever taken, before Niepce\'s surviving image.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_west_1', eraId: 'wild_west', name: 'Cattle Drive Lullaby', description: 'A lullaby sung by cowboys during long cattle drives across the plains.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_west_2', eraId: 'wild_west', name: 'Outlaw\'s Last Letter', description: 'The final letter from an outlaw who chose to surrender, changing his fate.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_west_3', eraId: 'wild_west', name: 'Sheriff\'s Badge Memory', description: 'The memories embedded in a sheriff\'s star badge from a forgotten town.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_west_4', eraId: 'wild_west', name: 'The Gold Map', description: 'A map to a gold mine that was real but never found, drawn by a prospector.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_ww2_1', eraId: 'world_war_ii', name: 'Soldier\'s Christmas Letter', description: 'A letter from a soldier who never made it home for Christmas.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_ww2_2', eraId: 'world_war_ii', name: 'Resistance Coded Message', description: 'The last coded message from the French Resistance before liberation.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_ww2_3', eraId: 'world_war_ii', name: 'The Survivor\'s Testimony', description: 'A testimony from a concentration camp survivor, recorded in their own words.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_ww2_4', eraId: 'world_war_ii', name: 'VE Day Celebration', description: 'The exact sounds and emotions of VE Day in London, preserved in temporal resin.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_fut_1', eraId: 'future', name: 'First Contact Memory', description: 'The memory of humanity\'s first contact with an alien civilization.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_fut_2', eraId: 'future', name: 'The Last Sunset', description: 'A memory of the last natural sunset on Earth before atmospheric modification.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_fut_3', eraId: 'future', name: 'AI\'s First Dream', description: 'The content of the first artificial intelligence\'s first dream.', collected: false, collectedAt: 0, restored: false },
  { id: 'mf_fut_4', eraId: 'future', name: 'The Final Archive', description: 'A complete record of everything humanity ever did, compiled by a benevolent AI.', collected: false, collectedAt: 0, restored: false },
];

// ---------------------------------------------------------------------------
// State — lazy initialized, no browser APIs
// ---------------------------------------------------------------------------

let state: TimeWorkshopState | null = null;

function createInitialState(): TimeWorkshopState {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);

  const gadgets: Gadget[] = TW_GADGETS.map((g) => ({
    ...g,
    equipped: g.id === 'chronograph',
    owned: g.id === 'chronograph',
    currentCooldown: 0,
  }));

  const stations: WorkshopStation[] = TW_STATIONS.map((s) => ({
    ...s,
    level: 1,
    effectValue: 1,
  }));

  const paradoxes: ParadoxData[] = PARADOX_EVENTS.map((p) => ({
    id: p.id,
    resolved: false,
    resolvedAt: 0,
    attempts: 0,
  }));

  const dailySeed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  return {
    initialized: true,
    version: 1,
    level: 1,
    xp: 0,
    xpToNext: 100,
    totalXP: 0,
    coins: 50,
    activeEra: 'ancient_egypt',
    temporalEnergy: 50,
    maxTemporalEnergy: 100,
    energyRegenRate: 3,
    timelineStability: 75,
    paradoxes,
    artifacts: ARTIFACTS.map((a) => ({ ...a })),
    gadgets,
    stations,
    historicalFigures: HISTORICAL_FIGURES.map((f) => ({ ...f })),
    timelineBranches: TIMELINE_BRANCHES.map((b) => ({ ...b })),
    memoryFragments: MEMORY_FRAGMENTS.map((m) => ({ ...m })),
    anomalies: [],
    dailyAnomaly: {
      anomalyId: '',
      completed: false,
      dateSeed: dailySeed,
      bonusMultiplier: 1.5,
    },
    streak: 0,
    bestStreak: 0,
    achievements: [],
    unlockedAchievements: [],
    stats: {
      paradoxesResolved: 0,
      paradoxesFailed: 0,
      erasVisited: 1,
      figuresMet: 0,
      artifactsCollected: 0,
      memoryFragmentsCollected: 0,
      anomaliesResolved: 0,
      totalEnergyGenerated: 0,
      totalEnergySpent: 0,
      timelineBranchesResolved: 0,
      timeTravels: 0,
      totalPlayTicks: 0,
    },
    runHistory: [],
    lastDailyDate: '',
    lastStreakDate: '',
    lastTravelTimestamp: 0,
    travelCooldown: 0,
    activeGadgets: ['chronograph'],
  };
}

function ensureInit(): TimeWorkshopState {
  if (!state) {
    state = createInitialState();
  }
  return state;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.18, level - 1));
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateSeed(): number {
  return todayString().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
}

function getEraById(id: EraId): Era | undefined {
  return TW_ERAS.find((e) => e.id === id);
}

function getParadoxById(id: string): ParadoxEvent | undefined {
  return PARADOX_EVENTS.find((p) => p.id === id);
}

function getStationEffectValue(s: TimeWorkshopState, stationId: StationId): number {
  const station = s.stations.find((st) => st.id === stationId);
  return station ? station.level * station.effectValue : 0;
}

// ---------------------------------------------------------------------------
// Core State Functions
// ---------------------------------------------------------------------------

export function twGetState(): TimeWorkshopState {
  return ensureInit();
}

export function twResetState(): void {
  state = null;
}

export function twGetLevel(): number {
  return ensureInit().level;
}

export function twGetTitle(): { name: HorologistTitle; emoji: string; index: number } {
  const s = ensureInit();
  let title = TW_TITLES[0];
  for (let i = TW_TITLES.length - 1; i >= 0; i--) {
    if (s.level >= TW_TITLES[i].minLevel) {
      title = TW_TITLES[i];
      break;
    }
  }
  const idx = TW_TITLES.indexOf(title);
  return { name: title.name, emoji: title.emoji, index: idx };
}

export function twAddXP(amount: number): { leveledUp: boolean; newLevel: number } {
  const s = ensureInit();
  const bonusMult = 1 + getStationEffectValue(s, 'memory_archive') * 0.02;
  const totalAmount = Math.floor(amount * bonusMult);
  s.xp += totalAmount;
  s.totalXP += totalAmount;
  let leveledUp = false;
  while (s.xp >= s.xpToNext && s.level < 40) {
    s.xp -= s.xpToNext;
    s.level++;
    s.xpToNext = xpForLevel(s.level + 1);
    leveledUp = true;
  }
  if (s.level >= 40) {
    s.xp = 0;
    s.xpToNext = 1;
  }
  return { leveledUp, newLevel: s.level };
}

export function twGetXPProgress(): { current: number; needed: number; percentage: number } {
  const s = ensureInit();
  return {
    current: s.xp,
    needed: s.xpToNext,
    percentage: s.xpToNext > 0 ? Math.floor((s.xp / s.xpToNext) * 100) : 100,
  };
}

export function twGetCoins(): number {
  return ensureInit().coins;
}

export function twAddCoins(amount: number): void {
  ensureInit().coins += amount;
}

export function twSpendCoins(amount: number): boolean {
  const s = ensureInit();
  if (s.coins < amount) return false;
  s.coins -= amount;
  return true;
}

// ---------------------------------------------------------------------------
// Era Functions
// ---------------------------------------------------------------------------

export function twGetEras(): Era[] {
  const s = ensureInit();
  return TW_ERAS.map((e) => ({
    ...e,
    unlockLevel: e.unlockLevel,
    unlocked: s.level >= e.unlockLevel,
  }));
}

export function twGetActiveEra(): Era {
  return getEraById(ensureInit().activeEra) || TW_ERAS[0];
}

export function twSetActiveEra(eraId: EraId): boolean {
  const s = ensureInit();
  const era = getEraById(eraId);
  if (!era || s.level < era.unlockLevel) return false;
  s.activeEra = eraId;
  const visitedEras = new Set(s.runHistory.filter((r) => r.eraId !== null).map((r) => r.eraId));
  visitedEras.add(eraId);
  s.stats.erasVisited = visitedEras.size;
  return true;
}

export function twIsEraUnlocked(eraId: EraId): boolean {
  const s = ensureInit();
  const era = getEraById(eraId);
  return era ? s.level >= era.unlockLevel : false;
}

export function twGetEraById(eraId: EraId): Era | undefined {
  return getEraById(eraId);
}

// ---------------------------------------------------------------------------
// Temporal Energy Functions
// ---------------------------------------------------------------------------

export function twGetTemporalEnergy(): { current: number; max: number; percentage: number } {
  const s = ensureInit();
  return {
    current: s.temporalEnergy,
    max: s.maxTemporalEnergy,
    percentage: Math.floor((s.temporalEnergy / s.maxTemporalEnergy) * 100),
  };
}

export function twGenerateEnergy(amount: number): number {
  const s = ensureInit();
  const regenBonus = 1 + getStationEffectValue(s, 'quantum_engine') * 0.05;
  const compassBonus = s.activeGadgets.includes('era_compass') ? 2 : 1;
  const total = Math.floor(amount * regenBonus * compassBonus);
  s.temporalEnergy = clamp(s.temporalEnergy + total, 0, s.maxTemporalEnergy);
  s.stats.totalEnergyGenerated += total;
  return total;
}

export function twSpendEnergy(amount: number): boolean {
  const s = ensureInit();
  if (s.temporalEnergy < amount) return false;
  s.temporalEnergy -= amount;
  s.stats.totalEnergySpent += amount;
  return true;
}

export function twGetMaxEnergy(): number {
  const s = ensureInit();
  const forgeBonus = getStationEffectValue(s, 'temporal_forge') * 15;
  const artifactBonus = s.artifacts
    .filter((a) => a.collected && a.bonus.type === 'max_energy')
    .reduce((sum, a) => sum + a.bonus.value, 0);
  return 100 + forgeBonus + artifactBonus;
}

export function twGetEnergyRegenRate(): number {
  const s = ensureInit();
  const engineBonus = getStationEffectValue(s, 'quantum_engine') * 0.5;
  const artifactBonus = s.artifacts
    .filter((a) => a.collected && a.bonus.type === 'energy_regen')
    .reduce((sum, a) => sum + a.bonus.value, 0);
  return s.energyRegenRate + engineBonus + artifactBonus;
}

// ---------------------------------------------------------------------------
// Timeline Stability Functions
// ---------------------------------------------------------------------------

export function twGetStability(): number {
  return ensureInit().timelineStability;
}

export function twAdjustStability(amount: number): number {
  const s = ensureInit();
  const hasAnchor = s.activeGadgets.includes('dimension_anchor');
  const newStability = s.timelineStability + amount;
  if (hasAnchor && newStability < 30) {
    s.timelineStability = 30;
  } else {
    s.timelineStability = clamp(newStability, 0, 100);
  }
  return s.timelineStability;
}

export function twGetStabilityLabel(): { label: string; color: string } {
  const stability = twGetStability();
  if (stability >= 90) return { label: 'Pristine', color: '#2ECC71' };
  if (stability >= 70) return { label: 'Stable', color: '#27AE60' };
  if (stability >= 50) return { label: 'Fragile', color: '#F39C12' };
  if (stability >= 30) return { label: 'Unstable', color: '#E67E22' };
  if (stability >= 10) return { label: 'Critical', color: '#E74C3C' };
  return { label: 'Collapsing', color: '#C0392B' };
}

// ---------------------------------------------------------------------------
// Paradox Functions
// ---------------------------------------------------------------------------

export function twGetParadoxesForEra(eraId: EraId): ParadoxEvent[] {
  return PARADOX_EVENTS.filter((p) => p.eraId === eraId);
}

export function twGetParadoxById(id: string): ParadoxEvent | undefined {
  return getParadoxById(id);
}

export function twGetActiveParadoxes(): ParadoxEvent[] {
  const s = ensureInit();
  return PARADOX_EVENTS.filter((p) => {
    const data = s.paradoxes.find((d) => d.id === p.id);
    return data && !data.resolved;
  });
}

export function twGetResolvedParadoxes(): { event: ParadoxEvent; data: ParadoxData }[] {
  const s = ensureInit();
  return PARADOX_EVENTS.filter((p) => {
    const data = s.paradoxes.find((d) => d.id === p.id);
    return data && data.resolved;
  }).map((p) => ({
    event: p,
    data: s.paradoxes.find((d) => d.id === p.id)!,
  }));
}

export function twResolveParadox(paradoxId: string): { success: boolean; xpEarned: number; coinsEarned: number; energyGained: number; stabilityChange: number } {
  const s = ensureInit();
  const event = getParadoxById(paradoxId);
  if (!event) return { success: false, xpEarned: 0, coinsEarned: 0, energyGained: 0, stabilityChange: 0 };

  const data = s.paradoxes.find((d) => d.id === paradoxId);
  if (!data || data.resolved) return { success: false, xpEarned: 0, coinsEarned: 0, energyGained: 0, stabilityChange: 0 };

  const labReduction = getStationEffectValue(s, 'paradox_lab') * 0.05;
  const effectiveCost = Math.max(1, Math.floor(event.stabilityCost * (1 - labReduction)));
  const chronographReduction = s.activeGadgets.includes('chronograph') ? 0.9 : 1;

  data.attempts++;
  const success = seededRandom(Date.now() + data.attempts * 7) > (event.difficulty * 0.1 * chronographReduction);

  if (!success) {
    twAdjustStability(-effectiveCost);
    s.stats.paradoxesFailed++;
    return { success: false, xpEarned: Math.floor(event.xpReward * 0.3), coinsEarned: 0, energyGained: 0, stabilityChange: -effectiveCost };
  }

  data.resolved = true;
  data.resolvedAt = Date.now();
  s.stats.paradoxesResolved++;

  twAdjustStability(Math.floor(event.stabilityCost * 0.5));
  const energyGained = twGenerateEnergy(event.energyReward);
  twAddCoins(event.coinReward);
  twAddXP(event.xpReward);

  if (event.memoryFragmentReward) {
    const eraFragments = s.memoryFragments.filter((m) => m.eraId === event.eraId && !m.collected);
    if (eraFragments.length > 0) {
      const frag = eraFragments[Math.floor(seededRandom(Date.now()) * eraFragments.length)];
      frag.collected = true;
      frag.collectedAt = Date.now();
      s.stats.memoryFragmentsCollected++;
    }
  }

  if (seededRandom(Date.now() + 31) < event.artifactChance) {
    const artifact = s.artifacts.find((a) => a.eraId === event.eraId && !a.collected);
    if (artifact) {
      artifact.collected = true;
      artifact.collectedAt = Date.now();
      s.stats.artifactsCollected++;
    }
  }

  s.runHistory.push({
    id: `run_${Date.now()}`,
    action: 'resolve_paradox',
    eraId: event.eraId,
    result: 'success',
    xpEarned: event.xpReward,
    coinsEarned: event.coinReward,
    energySpent: 0,
    energyGained,
    stabilityChange: Math.floor(event.stabilityCost * 0.5),
    timestamp: Date.now(),
    details: `Resolved: ${event.name}`,
  });

  return {
    success: true,
    xpEarned: event.xpReward,
    coinsEarned: event.coinReward,
    energyGained,
    stabilityChange: Math.floor(event.stabilityCost * 0.5),
  };
}

export function twGetParadoxCount(): { total: number; resolved: number; active: number } {
  const s = ensureInit();
  return {
    total: s.paradoxes.length,
    resolved: s.paradoxes.filter((p) => p.resolved).length,
    active: s.paradoxes.filter((p) => !p.resolved).length,
  };
}

// ---------------------------------------------------------------------------
// Gadget Functions
// ---------------------------------------------------------------------------

export function twGetGadgets(): Gadget[] {
  return [...ensureInit().gadgets];
}

export function twGetGadget(id: GadgetId): Gadget | undefined {
  return ensureInit().gadgets.find((g) => g.id === id);
}

export function twBuyGadget(id: GadgetId): boolean {
  const s = ensureInit();
  const gadget = s.gadgets.find((g) => g.id === id);
  if (!gadget || gadget.owned) return false;
  if (s.coins < gadget.cost) return false;
  s.coins -= gadget.cost;
  gadget.owned = true;
  return true;
}

export function twEquipGadget(id: GadgetId): boolean {
  const s = ensureInit();
  const gadget = s.gadgets.find((g) => g.id === id);
  if (!gadget || !gadget.owned) return false;
  if (s.activeGadgets.includes(id)) return true;
  if (s.activeGadgets.length >= 3) return false;
  gadget.equipped = true;
  s.activeGadgets.push(id);
  return true;
}

export function twUnequipGadget(id: GadgetId): void {
  const s = ensureInit();
  const gadget = s.gadgets.find((g) => g.id === id);
  if (gadget) gadget.equipped = false;
  s.activeGadgets = s.activeGadgets.filter((g) => g !== id);
}

export function twGetActiveGadgets(): Gadget[] {
  const s = ensureInit();
  return s.gadgets.filter((g) => s.activeGadgets.includes(g.id));
}

export function twGetOwnedGadgetCount(): number {
  return ensureInit().gadgets.filter((g) => g.owned).length;
}

// ---------------------------------------------------------------------------
// Station Functions
// ---------------------------------------------------------------------------

export function twGetStations(): WorkshopStation[] {
  return [...ensureInit().stations];
}

export function twGetStation(id: StationId): WorkshopStation | undefined {
  return ensureInit().stations.find((st) => st.id === id);
}

export function twUpgradeStation(id: StationId): { success: boolean; cost: number; newLevel: number } {
  const s = ensureInit();
  const station = s.stations.find((st) => st.id === id);
  if (!station) return { success: false, cost: 0, newLevel: 0 };
  if (station.level >= station.maxLevel) return { success: false, cost: 0, newLevel: station.level };

  const cost = Math.floor(station.upgradeCost * Math.pow(1.5, station.level - 1));
  if (s.coins < cost) return { success: false, cost, newLevel: station.level };

  s.coins -= cost;
  station.level++;
  station.effectValue = station.level;

  if (station.id === 'temporal_forge') {
    s.maxTemporalEnergy = twGetMaxEnergy();
  }

  return { success: true, cost, newLevel: station.level };
}

export function twGetMaxStationLevel(): number {
  const s = ensureInit();
  return Math.max(...s.stations.map((st) => st.level));
}

// ---------------------------------------------------------------------------
// Historical Figure Functions
// ---------------------------------------------------------------------------

export function twGetHistoricalFigures(): HistoricalFigure[] {
  return [...ensureInit().historicalFigures];
}

export function twGetFiguresForEra(eraId: EraId): HistoricalFigure[] {
  return ensureInit().historicalFigures.filter((f) => f.eraId === eraId);
}

export function twGetFigureById(id: string): HistoricalFigure | undefined {
  return ensureInit().historicalFigures.find((f) => f.id === id);
}

export function twMeetFigure(id: string): { success: boolean; xpReward: number; coinsReward: number } {
  const s = ensureInit();
  const figure = s.historicalFigures.find((f) => f.id === id);
  if (!figure || figure.met) return { success: false, xpReward: 0, coinsReward: 0 };
  figure.met = true;
  s.stats.figuresMet++;
  const xpReward = 30;
  const coinsReward = 20;
  twAddXP(xpReward);
  twAddCoins(coinsReward);
  return { success: true, xpReward, coinsReward };
}

export function twCompleteFigureQuest(id: string): { success: boolean; reward: { xp: number; coins: number; energy: number; gadgetId: GadgetId | null } } {
  const s = ensureInit();
  const figure = s.historicalFigures.find((f) => f.id === id);
  if (!figure || !figure.met || !figure.questId || figure.questCompleted) {
    return { success: false, reward: { xp: 0, coins: 0, energy: 0, gadgetId: null } };
  }
  figure.questCompleted = true;
  twAddXP(figure.questReward.xp);
  twAddCoins(figure.questReward.coins);
  twGenerateEnergy(figure.questReward.energy);
  if (figure.questReward.gadgetId) {
    const gadget = s.gadgets.find((g) => g.id === figure.questReward.gadgetId);
    if (gadget && !gadget.owned) {
      gadget.owned = true;
    }
  }
  return { success: true, reward: figure.questReward };
}

export function twGetMetFigureCount(): number {
  return ensureInit().stats.figuresMet;
}

// ---------------------------------------------------------------------------
// Timeline Branch Functions
// ---------------------------------------------------------------------------

export function twGetTimelineBranches(): TimelineBranch[] {
  return [...ensureInit().timelineBranches];
}

export function twGetBranchesForEra(eraId: EraId): TimelineBranch[] {
  return ensureInit().timelineBranches.filter((b) => b.eraId === eraId);
}

export function twResolveBranch(branchId: string, choice: 'a' | 'b'): { success: boolean; stabilityChange: number; xpReward: number; consequence: string } {
  const s = ensureInit();
  const branch = s.timelineBranches.find((b) => b.id === branchId);
  if (!branch || branch.resolved) return { success: false, stabilityChange: 0, xpReward: 0, consequence: '' };

  branch.resolved = true;
  branch.chosen = choice;
  s.stats.timelineBranchesResolved++;

  const stabilityChange = choice === 'a' ? branch.stabilityA : branch.stabilityB;
  const consequence = choice === 'a' ? branch.consequenceA : branch.consequenceB;
  twAdjustStability(stabilityChange);
  twAddXP(branch.xpReward);

  s.runHistory.push({
    id: `run_${Date.now()}`,
    action: 'resolve_branch',
    eraId: branch.eraId,
    result: 'success',
    xpEarned: branch.xpReward,
    coinsEarned: 0,
    energySpent: 0,
    energyGained: 0,
    stabilityChange,
    timestamp: Date.now(),
    details: `Branch: ${branch.name} → Choice ${choice.toUpperCase()}`,
  });

  return { success: true, stabilityChange, xpReward: branch.xpReward, consequence };
}

export function twGetBranchCount(): { total: number; resolved: number; unresolved: number } {
  const s = ensureInit();
  return {
    total: s.timelineBranches.length,
    resolved: s.timelineBranches.filter((b) => b.resolved).length,
    unresolved: s.timelineBranches.filter((b) => !b.resolved).length,
  };
}

// ---------------------------------------------------------------------------
// Artifact Functions
// ---------------------------------------------------------------------------

export function twGetArtifacts(): Artifact[] {
  return [...ensureInit().artifacts];
}

export function twGetArtifact(id: string): Artifact | undefined {
  return ensureInit().artifacts.find((a) => a.id === id);
}

export function twGetCollectedArtifacts(): Artifact[] {
  return ensureInit().artifacts.filter((a) => a.collected);
}

export function twGetArtifactCount(): number {
  return ensureInit().stats.artifactsCollected;
}

// ---------------------------------------------------------------------------
// Memory Fragment Functions
// ---------------------------------------------------------------------------

export function twGetMemoryFragments(): MemoryFragment[] {
  return [...ensureInit().memoryFragments];
}

export function twGetFragmentsForEra(eraId: EraId): MemoryFragment[] {
  return ensureInit().memoryFragments.filter((m) => m.eraId === eraId);
}

export function twGetCollectedFragments(): MemoryFragment[] {
  return ensureInit().memoryFragments.filter((m) => m.collected);
}

export function twRestoreFragment(id: string): boolean {
  const s = ensureInit();
  const fragment = s.memoryFragments.find((m) => m.id === id);
  if (!fragment || !fragment.collected || fragment.restored) return false;
  const restoreChance = 0.5 + getStationEffectValue(s, 'memory_archive') * 0.05;
  if (seededRandom(Date.now() + id.charCodeAt(0)) < restoreChance) {
    fragment.restored = true;
    twAdjustStability(3);
    twAddXP(25);
    return true;
  }
  return false;
}

export function twGetFragmentCount(): { total: number; collected: number; restored: number } {
  const s = ensureInit();
  return {
    total: s.memoryFragments.length,
    collected: s.memoryFragments.filter((m) => m.collected).length,
    restored: s.memoryFragments.filter((m) => m.restored).length,
  };
}

// ---------------------------------------------------------------------------
// Anomaly Functions
// ---------------------------------------------------------------------------

export function twGetAnomalyTypes(): typeof TW_ANOMALY_TYPES {
  return [...TW_ANOMALY_TYPES];
}

export function twGetAnomalies(): AnomalyRecord[] {
  return [...ensureInit().anomalies];
}

export function twDetectAnomaly(eraId: EraId): AnomalyRecord | null {
  const s = ensureInit();
  const era = getEraById(eraId);
  if (!era) return null;

  const roll = seededRandom(Date.now() + eraId.length * 13);
  if (roll > era.paradoxChance) return null;

  const typeIdx = Math.floor(seededRandom(Date.now() + 7) * TW_ANOMALY_TYPES.length);
  const anomalyType = TW_ANOMALY_TYPES[typeIdx];

  const names: Record<AnomalyType, string[]> = {
    loop: ['Recursive Tuesday', 'The Eternal Sunset', 'Groundhog Battle', 'Infinite Council Meeting', 'The Repeating Feast'],
    split: ['The Bifurcated Coronation', 'Two Roads to Rome', 'The Divergent Treaty', 'Parallel Inventions', 'The Schism Moment'],
    merge: ['The Collision of Ages', 'Double Renaissance', 'Overlapping Empires', 'Mixed Messages', 'The Convergence Point'],
    shift: ['Displaced Discovery', 'Premature Revolution', 'The Early Migration', 'Time-Slipped Speech', 'Chronological Scramble'],
    fade: ['The Vanishing Dynasty', 'Fading Frontier', 'Dissolving Alliance', 'The Unremembered War', 'Ghost Civilization'],
    echo: ['Caesar\'s Ghost March', 'The Resounding Cannonade', 'Napoleon\'s Shadow', 'Whispers of the Future', 'The Repeating Oration'],
  };

  const nameList = names[anomalyType.type];
  const name = nameList[Math.floor(seededRandom(Date.now() + 3) * nameList.length)];
  const severity = anomalyType.baseSeverity + Math.floor(seededRandom(Date.now() + 11) * 3);

  const record: AnomalyRecord = {
    id: `anom_${Date.now()}_${typeIdx}`,
    type: anomalyType.type,
    eraId,
    name,
    description: `${anomalyType.description} Detected in ${era.name}: ${name}`,
    detectedAt: Date.now(),
    resolved: false,
    severity,
    reward: {
      xp: severity * 15,
      coins: severity * 10,
      energy: severity * 8,
    },
  };

  s.anomalies.push(record);
  return record;
}

export function twResolveAnomaly(anomalyId: string): { success: boolean; reward: { xp: number; coins: number; energy: number } } {
  const s = ensureInit();
  const anomaly = s.anomalies.find((a) => a.id === anomalyId);
  if (!anomaly || anomaly.resolved) return { success: false, reward: { xp: 0, coins: 0, energy: 0 } };

  const successChance = 1 - (anomaly.severity * 0.08);
  if (seededRandom(Date.now() + anomalyId.length) > successChance) {
    twAdjustStability(-anomaly.severity * 2);
    return { success: false, reward: { xp: 0, coins: 0, energy: 0 } };
  }

  anomaly.resolved = true;
  s.stats.anomaliesResolved++;
  twAdjustStability(anomaly.severity * 3);
  twAddXP(anomaly.reward.xp);
  twAddCoins(anomaly.reward.coins);
  twGenerateEnergy(anomaly.reward.energy);

  return { success: true, reward: anomaly.reward };
}

export function twGetAnomalyCount(): { total: number; resolved: number; active: number } {
  const s = ensureInit();
  return {
    total: s.anomalies.length,
    resolved: s.anomalies.filter((a) => a.resolved).length,
    active: s.anomalies.filter((a) => !a.resolved).length,
  };
}

// ---------------------------------------------------------------------------
// Time Travel Functions
// ---------------------------------------------------------------------------

export function twGetTravelCooldown(): number {
  const s = ensureInit();
  const gatewayReduction = getStationEffectValue(s, 'era_gateway') * 2;
  return Math.max(0, s.travelCooldown - gatewayReduction);
}

export function twTravelToEra(eraId: EraId): { success: boolean; cooldown: number; energyCost: number } {
  const s = ensureInit();
  const era = getEraById(eraId);
  if (!era) return { success: false, cooldown: 0, energyCost: 0 };
  if (s.level < era.unlockLevel) return { success: false, cooldown: 0, energyCost: 0 };

  const cooldown = twGetTravelCooldown();
  const now = Date.now();
  if (now - s.lastTravelTimestamp < cooldown * 1000) return { success: false, cooldown, energyCost: 0 };

  const energyCost = 10 + era.unlockLevel;
  if (!twSpendEnergy(energyCost)) return { success: false, cooldown, energyCost };

  s.activeEra = eraId;
  s.lastTravelTimestamp = now;
  s.travelCooldown = 60;
  s.stats.timeTravels++;

  const anomaly = twDetectAnomaly(eraId);
  if (anomaly) {
    twAdjustStability(-anomaly.severity);
  }

  return { success: true, cooldown: s.travelCooldown, energyCost };
}

export function twCanTravel(): boolean {
  const s = ensureInit();
  const cooldown = twGetTravelCooldown();
  return Date.now() - s.lastTravelTimestamp >= cooldown * 1000;
}

// ---------------------------------------------------------------------------
// Daily Anomaly Functions
// ---------------------------------------------------------------------------

export function twGetDailyAnomaly(): { anomalyType: AnomalyType; name: string; completed: boolean; bonusMultiplier: number } | null {
  const s = ensureInit();
  const today = todayString();
  const seed = dateSeed();

  if (s.dailyAnomaly.dateSeed !== seed) {
    const typeIdx = seed % TW_ANOMALY_TYPES.length;
    const anomalyType = TW_ANOMALY_TYPES[typeIdx];
    const eraIdx = (seed * 3) % TW_ERAS.length;
    const era = TW_ERAS[eraIdx];
    s.dailyAnomaly = {
      anomalyId: `daily_${seed}`,
      completed: false,
      dateSeed: seed,
      bonusMultiplier: 1 + s.streak * 0.1,
    };

    if (!s.anomalies.find((a) => a.id === s.dailyAnomaly.anomalyId)) {
      const dailyNames: Record<AnomalyType, string> = {
        loop: 'The Daily Loop',
        split: 'The Daily Divergence',
        merge: 'The Daily Convergence',
        shift: 'The Daily Displacement',
        fade: 'The Daily Fading',
        echo: 'The Daily Echo',
      };
      s.anomalies.push({
        id: s.dailyAnomaly.anomalyId,
        type: anomalyType.type,
        eraId: era.id,
        name: dailyNames[anomalyType.type],
        description: `A daily temporal ${anomalyType.name} has been detected in ${era.name}.`,
        detectedAt: Date.now(),
        resolved: false,
        severity: anomalyType.baseSeverity + Math.floor(seededRandom(seed) * 2),
        reward: { xp: 80, coins: 50, energy: 30 },
      });
    }
  }

  const dailyAnomaly = s.anomalies.find((a) => a.id === s.dailyAnomaly.anomalyId);
  if (!dailyAnomaly) return null;

  return {
    anomalyType: dailyAnomaly.type,
    name: dailyAnomaly.name,
    completed: s.dailyAnomaly.completed,
    bonusMultiplier: s.dailyAnomaly.bonusMultiplier,
  };
}

export function twCompleteDailyAnomaly(): { bonus: number; xp: number; coins: number; energy: number } {
  const s = ensureInit();
  const daily = twGetDailyAnomaly();
  if (!daily || s.dailyAnomaly.completed) return { bonus: 0, xp: 0, coins: 0, energy: 0 };

  const result = twResolveAnomaly(s.dailyAnomaly.anomalyId);
  if (!result.success) return { bonus: 0, xp: 0, coins: 0, energy: 0 };

  s.dailyAnomaly.completed = true;
  const bonus = Math.floor(50 * s.dailyAnomaly.bonusMultiplier);

  twAddCoins(bonus);
  twUpdateStreak();

  return {
    bonus,
    xp: result.reward.xp,
    coins: result.reward.coins + bonus,
    energy: result.reward.energy,
  };
}

// ---------------------------------------------------------------------------
// Streak Functions
// ---------------------------------------------------------------------------

export function twGetStreak(): number {
  return ensureInit().streak;
}

export function twGetBestStreak(): number {
  return ensureInit().bestStreak;
}

export function twUpdateStreak(): void {
  const s = ensureInit();
  const today = todayString();
  if (s.lastStreakDate === today) return;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (s.lastStreakDate === yesterday) {
    s.streak++;
  } else if (s.lastStreakDate !== today) {
    s.streak = 1;
  }
  s.lastStreakDate = today;
  if (s.streak > s.bestStreak) s.bestStreak = s.streak;
}

export function twGetStreakBonus(): number {
  const s = ensureInit();
  return 1 + s.streak * 0.05;
}

// ---------------------------------------------------------------------------
// Achievement Functions
// ---------------------------------------------------------------------------

export function twGetAchievements(): { id: string; name: string; description: string; unlocked: boolean; icon: string }[] {
  const s = ensureInit();
  return TW_ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: s.unlockedAchievements.includes(a.id),
  }));
}

export function twCheckAchievements(): string[] {
  const s = ensureInit();
  const newlyUnlocked: string[] = [];

  const checks: Record<string, boolean> = {
    tw_a1: s.stats.paradoxesResolved >= 1,
    tw_a2: s.stats.paradoxesResolved >= 10,
    tw_a3: s.stats.paradoxesResolved >= 30,
    tw_a4: s.stats.erasVisited >= 8,
    tw_a5: s.stats.artifactsCollected >= 8,
    tw_a6: s.stats.memoryFragmentsCollected >= 20,
    tw_a7: s.bestStreak >= 7,
    tw_a8: s.timelineStability >= 100,
    tw_a9: s.stats.figuresMet >= 30,
    tw_a10: s.gadgets.filter((g) => g.owned).length >= 6,
    tw_a11: twGetMaxStationLevel() >= 10,
    tw_a12: s.stats.anomaliesResolved >= 15,
    tw_a13: s.stats.timelineBranchesResolved >= 20,
    tw_a14: s.level >= 40,
    tw_a15: s.temporalEnergy >= 500 || s.maxTemporalEnergy >= 500,
  };

  for (const [id, condition] of Object.entries(checks)) {
    if (!s.unlockedAchievements.includes(id) && condition) {
      s.unlockedAchievements.push(id);
      newlyUnlocked.push(id);
      twAddCoins(30);
      twAddXP(50);
    }
  }

  return newlyUnlocked;
}

export function twIsAchievementUnlocked(id: string): boolean {
  return ensureInit().unlockedAchievements.includes(id);
}

export function twGetUnlockedAchievementCount(): number {
  return ensureInit().unlockedAchievements.length;
}

// ---------------------------------------------------------------------------
// Stats Functions
// ---------------------------------------------------------------------------

export function twGetStats(): { label: string; value: string | number }[] {
  const s = ensureInit();
  const title = twGetTitle();
  return [
    { label: 'Title', value: `${title.emoji} ${title.name}` },
    { label: 'Level', value: `${s.level} / 40` },
    { label: 'XP', value: `${s.totalXP} total` },
    { label: 'Coins', value: s.coins },
    { label: 'Active Era', value: getEraById(s.activeEra)?.name || 'Unknown' },
    { label: 'Temporal Energy', value: `${s.temporalEnergy} / ${s.maxTemporalEnergy}` },
    { label: 'Timeline Stability', value: `${s.timelineStability}%` },
    { label: 'Paradoxes Resolved', value: s.stats.paradoxesResolved },
    { label: 'Paradoxes Failed', value: s.stats.paradoxesFailed },
    { label: 'Eras Visited', value: `${s.stats.erasVisited} / 8` },
    { label: 'Figures Met', value: `${s.stats.figuresMet} / 30` },
    { label: 'Artifacts Collected', value: `${s.stats.artifactsCollected} / 8` },
    { label: 'Memory Fragments', value: `${s.stats.memoryFragmentsCollected} / 32` },
    { label: 'Anomalies Resolved', value: s.stats.anomaliesResolved },
    { label: 'Timeline Branches', value: `${s.stats.timelineBranchesResolved} / 20` },
    { label: 'Time Travels', value: s.stats.timeTravels },
    { label: 'Streak', value: `${s.streak} (Best: ${s.bestStreak})` },
    { label: 'Achievements', value: `${s.unlockedAchievements.length} / 15` },
    { label: 'Gadgets Owned', value: `${s.gadgets.filter((g) => g.owned).length} / 6` },
    { label: 'Energy Generated', value: s.stats.totalEnergyGenerated },
    { label: 'Energy Spent', value: s.stats.totalEnergySpent },
  ];
}

export function twGetRunHistory(): TimeWorkshopRun[] {
  return [...ensureInit().runHistory].slice(-30);
}

// ---------------------------------------------------------------------------
// Tick / Simulation Functions
// ---------------------------------------------------------------------------

export function twTick(): { energyGained: number; anomaliesDetected: number } {
  const s = ensureInit();
  const regenRate = twGetEnergyRegenRate();
  const energyGained = twGenerateEnergy(Math.floor(regenRate));
  s.stats.totalPlayTicks++;

  let anomaliesDetected = 0;
  if (seededRandom(s.stats.totalPlayTicks * 17) < 0.1) {
    const anomaly = twDetectAnomaly(s.activeEra);
    if (anomaly) anomaliesDetected++;
  }

  // Natural stability decay
  if (s.stats.totalPlayTicks % 10 === 0) {
    const unresolvedParadoxes = s.paradoxes.filter((p) => !p.resolved && p.attempts > 0).length;
    const activeAnomalies = s.anomalies.filter((a) => !a.resolved).length;
    const decay = (unresolvedParadoxes * 0.2 + activeAnomalies * 0.3);
    if (decay > 0) {
      twAdjustStability(-Math.floor(decay));
    }
  }

  // Cooldown reduction
  s.gadgets.forEach((g) => {
    if (g.currentCooldown > 0) g.currentCooldown--;
  });
  if (s.travelCooldown > 0) s.travelCooldown = Math.max(0, s.travelCooldown - 1);

  twCheckAchievements();

  return { energyGained, anomaliesDetected };
}

// ---------------------------------------------------------------------------
// Convenience / Summary Functions
// ---------------------------------------------------------------------------

export function twGetOverview(): {
  level: number;
  title: HorologistTitle;
  titleEmoji: string;
  xpProgress: number;
  coins: number;
  activeEra: string;
  energy: { current: number; max: number };
  stability: number;
  stabilityLabel: string;
  paradoxCount: { total: number; resolved: number };
  streak: number;
  bestStreak: number;
  achievements: number;
} {
  const s = ensureInit();
  const title = twGetTitle();
  const stabilityInfo = twGetStabilityLabel();
  const paradoxCount = twGetParadoxCount();
  return {
    level: s.level,
    title: title.name,
    titleEmoji: title.emoji,
    xpProgress: s.xpToNext > 0 ? Math.floor((s.xp / s.xpToNext) * 100) : 100,
    coins: s.coins,
    activeEra: getEraById(s.activeEra)?.name || 'Unknown',
    energy: { current: s.temporalEnergy, max: s.maxTemporalEnergy },
    stability: s.timelineStability,
    stabilityLabel: stabilityInfo.label,
    paradoxCount: { total: paradoxCount.total, resolved: paradoxCount.resolved },
    streak: s.streak,
    bestStreak: s.bestStreak,
    achievements: s.unlockedAchievements.length,
  };
}

export function twGetEraResources(eraId: EraId): {
  paradoxes: ParadoxEvent[];
  figures: HistoricalFigure[];
  branches: TimelineBranch[];
  fragments: MemoryFragment[];
  artifact: Artifact | undefined;
  anomalyChance: number;
  energyRate: number;
} {
  const era = getEraById(eraId);
  const s = ensureInit();
  return {
    paradoxes: PARADOX_EVENTS.filter((p) => p.eraId === eraId),
    figures: s.historicalFigures.filter((f) => f.eraId === eraId),
    branches: s.timelineBranches.filter((b) => b.eraId === eraId),
    fragments: s.memoryFragments.filter((m) => m.eraId === eraId),
    artifact: s.artifacts.find((a) => a.eraId === eraId),
    anomalyChance: era?.paradoxChance || 0,
    energyRate: era?.energyRate || 0,
  };
}

export function twGetWorkshopStatus(): {
  stations: { name: string; level: number; maxLevel: number }[];
  gadgetsOwned: number;
  activeGadgets: number;
  maxActiveGadgets: number;
} {
  const s = ensureInit();
  return {
    stations: s.stations.map((st) => ({ name: st.name, level: st.level, maxLevel: st.maxLevel })),
    gadgetsOwned: s.gadgets.filter((g) => g.owned).length,
    activeGadgets: s.activeGadgets.length,
    maxActiveGadgets: 3,
  };
}
