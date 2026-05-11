// Detective Case Wire - dc prefix
// SSR-safe: lazy init pattern, no browser APIs

interface Suspect {
  id: string; name: string; role: string; alibi: string;
  motive: string; personality: string; suspicious: boolean;
  relationship: string; nervousness: number; honesty: number;
}

interface Evidence {
  id: string; name: string; type: 'physical' | 'digital' | 'testimonial' | 'document' | 'circumstantial';
  description: string; caseId: string; pointsTo: string; strength: number;
}

interface CaseData {
  id: string; title: string; category: string; difficulty: number;
  description: string; location: string; suspects: string[];
  evidences: string[]; culpritId: string; reward: number; xpReward: number;
  timeLimit: number; solved: boolean; starred: boolean;
}

interface Partner {
  id: string; name: string; role: string; ability: string;
  abilityDesc: string; bonus: number; unlocked: boolean;
}

interface ClueJournal {
  caseId: string; clueIds: string[]; connections: string[][];
  deductions: string[]; eliminatedSuspects: string[];
}

interface ColdCase {
  caseId: string; revisitCost: number; newEvidenceChance: number;
  lastAttempted: number; bonusMultiplier: number;
}

interface DailyCase {
  caseId: string; completed: boolean; bonusMultiplier: number;
  timeBonus: number;
}

interface DetectiveState {
  level: number; xp: number; xpToNext: number;
  rank: number; reputation: number;
  casesSolved: number; casesFailed: number; currentStreak: number; bestStreak: number;
  totalCluesFound: number; correctAccusations: number;
  activeCase: CaseData | null; investigationPhase: number;
  collectedEvidence: Evidence[]; interrogatedSuspects: string[];
  currentClues: string[]; eliminatedSuspects: string[];
  availableCases: CaseData[]; solvedCases: string[];
  partners: Partner[]; activePartner: string | null;
  clueJournal: ClueJournal[];
  coldCases: ColdCase[]; dailyCase: DailyCase;
  achievements: string[]; runHistory: CaseRun[];
  totalEarned: number; coins: number;
}

interface CaseRun {
  caseId: string; result: 'solved' | 'failed' | 'abandoned';
  timeTaken: number; cluesFound: number; correctAccusation: boolean;
  timestamp: number; xpEarned: number;
}

const RANKS = [
  { name: 'Rookie', minRep: 0, emoji: '🔍' },
  { name: 'Private Eye', minRep: 50, emoji: '🕵️' },
  { name: 'Inspector', minRep: 120, emoji: '🔎' },
  { name: 'Detective', minRep: 220, emoji: '🏛️' },
  { name: 'Sergeant', minRep: 350, emoji: '⭐' },
  { name: 'Lieutenant', minRep: 500, emoji: '🎖️' },
  { name: 'Captain', minRep: 700, emoji: '🏆' },
  { name: 'Chief', minRep: 1000, emoji: '👑' },
]

const CATEGORIES = ['Murder Mystery', 'Theft', 'Fraud', 'Missing Person', 'Espionage', 'Cybercrime', 'Arson', 'Kidnapping', 'Blackmail', 'Conspiracy']

const SUSPECTS: Suspect[] = [
  { id: 's1', name: 'Victor Blackwood', role: 'CEO', alibi: 'At office until 9 PM', motive: 'Insurance fraud', personality: 'Cold, calculating', suspicious: false, relationship: 'Employer of victim', nervousness: 30, honesty: 60 },
  { id: 's2', name: 'Elena Vasquez', role: 'Secretary', alibi: 'Left at 6 PM', motive: 'Blackmail victim', personality: 'Anxious, secretive', suspicious: false, relationship: 'Coworker', nervousness: 70, honesty: 40 },
  { id: 's3', name: 'Marcus Chen', role: 'Security Guard', alibi: 'On patrol all night', motive: 'Bribed to look away', personality: 'Quiet, observant', suspicious: true, relationship: 'Hired security', nervousness: 50, honesty: 55 },
  { id: 's4', name: 'Isabella Rossi', role: 'Chef', alibi: 'Cooking in kitchen', motive: 'Revenge for firing', personality: 'Passionate, temperamental', suspicious: false, relationship: 'Ex-employee', nervousness: 45, honesty: 70 },
  { id: 's5', name: 'Dr. James Patel', role: 'Physician', alibi: 'At hospital until 10 PM', motive: 'Inheritance', personality: 'Professional, composed', suspicious: true, relationship: 'Family friend', nervousness: 20, honesty: 65 },
  { id: 's6', name: 'Sophie Laurent', role: 'Artist', alibi: 'Painting in studio alone', motive: 'Stolen artwork', personality: 'Creative, dramatic', suspicious: false, relationship: 'Neighbor', nervousness: 60, honesty: 50 },
  { id: 's7', name: 'Hiroshi Tanaka', role: 'Accountant', alibi: 'Working from home', motive: 'Embezzlement cover-up', personality: 'Meticulous, nervous', suspicious: true, relationship: 'Financial advisor', nervousness: 80, honesty: 35 },
  { id: 's8', name: 'Olivia Hart', role: 'Journalist', alibi: 'Researching at library', motive: 'Breaking news story', personality: 'Curious, persistent', suspicious: false, relationship: 'Investigative reporter', nervousness: 25, honesty: 75 },
  { id: 's9', name: 'Dimitri Volkov', role: 'Businessman', alibi: 'Dinner meeting with clients', motive: 'Business rivalry', personality: 'Intimidating, charming', suspicious: true, relationship: 'Competitor', nervousness: 35, honesty: 30 },
  { id: 's10', name: 'Amara Osei', role: 'Lawyer', alibi: 'Reviewing case files', motive: 'Hidden evidence', personality: 'Sharp, analytical', suspicious: false, relationship: 'Legal counsel', nervousness: 40, honesty: 60 },
  { id: 's11', name: 'Liam O\'Brien', role: 'Mechanic', alibi: 'Working late at garage', motive: 'Debt repayment', personality: 'Rough, honest', suspicious: false, relationship: 'Service provider', nervousness: 55, honesty: 70 },
  { id: 's12', name: 'Yuki Sato', role: 'Programmer', alibi: 'Coding remotely', motive: 'Data theft', personality: 'Quiet, brilliant', suspicious: true, relationship: 'IT contractor', nervousness: 30, honesty: 45 },
  { id: 's13', name: 'Rafael Mendez', role: 'Bartender', alibi: 'Working at the club', motive: 'Witness elimination', personality: 'Friendly, observant', suspicious: false, relationship: 'Acquaintance', nervousness: 50, honesty: 65 },
  { id: 's14', name: 'Clara Beaumont', role: 'Socialite', alibi: 'At charity gala', motive: 'Social scandal', personality: 'Elegant, cunning', suspicious: true, relationship: 'Rival', nervousness: 35, honesty: 25 },
  { id: 's15', name: 'Nikolai Petrov', role: 'Professor', alibi: 'Giving lecture at university', motive: 'Academic fraud', personality: 'Intellectual, arrogant', suspicious: false, relationship: 'Mentor', nervousness: 20, honesty: 55 },
  { id: 's16', name: 'Mei Lin Wu', role: 'Pharmacist', alibi: 'Closed shop at 8 PM', motive: 'Poison access', personality: 'Calm, precise', suspicious: true, relationship: 'Supplier', nervousness: 25, honesty: 40 },
  { id: 's17', name: 'Antonio Costa', role: 'Construction Worker', alibi: 'On night shift', motive: 'Property dispute', personality: 'Strong, loud', suspicious: false, relationship: 'Neighbor', nervousness: 40, honesty: 80 },
  { id: 's18', name: 'Freya Lindqvist', role: 'Librarian', alibi: 'Locking up library', motive: 'Hidden information', personality: 'Reserved, knowledgeable', suspicious: false, relationship: 'Information source', nervousness: 30, honesty: 85 },
  { id: 's19', name: 'Jin Park', role: 'Photographer', alibi: 'On photo assignment', motive: 'Incriminating photos', personality: 'Artistic, discreet', suspicious: true, relationship: 'Observer', nervousness: 45, honesty: 50 },
  { id: 's20', name: 'Rose Thornfield', role: 'Gardener', alibi: 'Tending greenhouse', motive: 'Land inheritance', personality: 'Patient, methodical', suspicious: false, relationship: 'Employee', nervousness: 35, honesty: 75 },
]

const PARTNERS: Partner[] = [
  { id: 'p1', name: 'Dr. Sarah Chen', role: 'Forensics Expert', ability: 'Auto-reveal hidden evidence', abilityDesc: 'Can analyze physical evidence instantly', bonus: 20, unlocked: true },
  { id: 'p2', name: 'Jake Morrison', role: 'Interrogator', ability: 'Detect lies during questioning', abilityDesc: 'Reads body language and speech patterns', bonus: 15, unlocked: true },
  { id: 'p3', name: 'Zoe Nakamura', role: 'Tech Specialist', ability: 'Recover deleted digital evidence', abilityDesc: 'Hacks and recovers digital traces', bonus: 18, unlocked: false },
  { id: 'p4', name: 'Prof. Alex Drummond', role: 'Profiler', ability: 'Predict suspect behavior', abilityDesc: 'Builds psychological profiles', bonus: 22, unlocked: false },
]

function generateCases(): CaseData[] {
  const cases: CaseData[] = [];
  const titles = [
    'The Midnight Burglary', 'Silent Witness', 'The Vanishing Act', 'Code Red',
    'The Last Letter', 'Broken Trust', 'Shadow Game', 'The Forgotten Room',
    'Paper Trail', 'Night Shift', 'Cold Coffee', 'Hidden Agenda',
    'The Red Envelope', 'Double Cross', 'Whispers in the Dark', 'The Key',
    'Smoke and Mirrors', 'Final Chapter', 'The Collector', 'Inside Job',
    'Lost and Found', 'The Informant', 'Dark Mirror', 'Under Pressure',
    'The Package', 'Ghost Writer', 'Point of No Return', 'The Alibi',
    'Burning Bridges', 'The Witness', 'False Pretenses', 'The Setup',
    'After Hours', 'The Confession', 'Deep Cover', 'The Missing Link',
    'Red Herring', 'The Verdict', 'Closing Time', 'The Untold Story'
  ];
  const locations = ['Mansion', 'Office Tower', 'Warehouse', 'Library', 'Museum', 'Restaurant', 'Hotel', 'Laboratory', 'Park', 'Bank'];
  for (let i = 0; i < 40; i++) {
    const diff = (i % 5) + 1;
    const suspectStart = (i % 20);
    const suspectIds: string[] = [];
    for (let j = 0; j < Math.min(3 + diff, 8); j++) {
      suspectIds.push(SUSPECTS[(suspectStart + j) % 20].id);
    }
    cases.push({
      id: `case-${i + 1}`, title: titles[i] || `Case ${i + 1}`, category: CATEGORIES[i % 10],
      difficulty: diff, description: `A complex ${CATEGORIES[i % 10].toLowerCase()} case at the ${locations[i % 10]}. Investigate thoroughly.`,
      location: locations[i % 10], suspects: suspectIds,
      evidences: [`ev-${i * 3 + 1}`, `ev-${i * 3 + 2}`, `ev-${i * 3 + 3}`],
      culpritId: SUSPECTS[(suspectStart + diff) % 20].id,
      reward: diff * 50 + 100, xpReward: diff * 30 + 50,
      timeLimit: 600 + diff * 120, solved: false, starred: false,
    });
  }
  return cases;
}

function generateEvidence(): Evidence[] {
  const evidences: Evidence[] = [];
  const physicalItems = ['Bloody fingerprint', 'Broken glass shard', 'Torn fabric', 'Muddy footprint', 'Weapon fragment', 'Hair sample', 'Paint chip', 'Missing button', 'Scratched surface', 'Burned paper scrap'];
  const digitalItems = ['Deleted email', 'GPS location log', 'Encrypted message', 'Browser history', 'Phone call record', 'Security camera footage', 'Social media post', 'Bank transaction', 'Text message thread', 'Access log entry'];
  const testimonialItems = ['Witness saw suspicious figure', 'Neighbor heard argument', 'Staff member noticed odd behavior', 'Taxi driver remembers passenger', 'Delivery person confirms timing', 'Night guard heard noise', 'Receptionist saw visitor', 'Cleaner found item', 'Bartender overheard conversation', 'Jogger noticed car'];
  const documentItems = ['Signed contract', 'Insurance policy', 'Medical record', 'Financial statement', 'Property deed', 'Employment record', 'Receipt', 'Photograph', 'Letter', 'Diary page'];
  const circumstantialItems = ['Victim had enemies', 'Suspect was nearby', 'Motive established', 'Opportunity confirmed', 'Behavior change noted', 'Prior conflict', 'Financial gain', 'Jealous relationship', 'Secret meeting held', 'Unexplained absence'];
  const allItems = [physicalItems, digitalItems, testimonialItems, documentItems, circumstantialItems];
  const types: Array<'physical' | 'digital' | 'testimonial' | 'document' | 'circumstantial'> = ['physical', 'digital', 'testimonial', 'document', 'circumstantial'];
  for (let i = 0; i < 120; i++) {
    const typeIdx = i % 5;
    const itemIdx = Math.floor(i / 5) % 10;
    evidences.push({
      id: `ev-${i + 1}`, name: allItems[typeIdx][itemIdx], type: types[typeIdx],
      description: `Evidence item #${i + 1}: ${allItems[typeIdx][itemIdx]}`,
      caseId: `case-${Math.floor(i / 3) + 1}`, pointsTo: SUSPECTS[(i * 7 + 3) % 20].id,
      strength: (i % 3) + 1,
    });
  }
  return evidences;
}

const ACHIEVEMENTS = [
  { id: 'dc_a1', name: 'First Solve', desc: 'Solve your first case', condition: (s: DetectiveState) => s.casesSolved >= 1 },
  { id: 'dc_a2', name: 'Perfect Deduction', desc: 'Accuse correctly on first try 5 times', condition: (s: DetectiveState) => s.correctAccusations >= 5 },
  { id: 'dc_a3', name: 'Speed Detective', desc: 'Solve a case in under 2 minutes', condition: (s: DetectiveState) => s.runHistory.some(r => r.timeTaken < 120 && r.correctAccusation) },
  { id: 'dc_a4', name: 'Cold Case Cracker', desc: 'Solve a cold case', condition: (s: DetectiveState) => s.coldCases.some(c => c.bonusMultiplier > 1) },
  { id: 'dc_a5', name: 'Streak Master', desc: 'Achieve 10 win streak', condition: (s: DetectiveState) => s.bestStreak >= 10 },
  { id: 'dc_a6', name: 'Evidence Hoarder', desc: 'Collect 50 clues total', condition: (s: DetectiveState) => s.totalCluesFound >= 50 },
  { id: 'dc_a7', name: 'Rising Star', desc: 'Reach Detective rank', condition: (s: DetectiveState) => s.rank >= 3 },
  { id: 'dc_a8', name: 'Reputation Builder', desc: 'Reach 300 reputation', condition: (s: DetectiveState) => s.reputation >= 300 },
  { id: 'dc_a9', name: 'Partner System', desc: 'Unlock all 4 partners', condition: (s: DetectiveState) => s.partners.filter(p => p.unlocked).length >= 4 },
  { id: 'dc_a10', name: 'Case Collector', desc: 'Solve 25 cases', condition: (s: DetectiveState) => s.casesSolved >= 25 },
  { id: 'dc_a11', name: 'Master Interrogator', desc: 'Interrogate 30 suspects', condition: (s: DetectiveState) => s.interrogatedSuspects.length >= 30 },
  { id: 'dc_a12', name: 'Daily Dedicator', desc: 'Complete 7 daily cases', condition: (s: DetectiveState) => s.runHistory.filter(r => r.xpEarned > 0).length >= 7 },
  { id: 'dc_a13', name: 'Sharp Eye', desc: 'Find 100 clues', condition: (s: DetectiveState) => s.totalCluesFound >= 100 },
  { id: 'dc_a14', name: 'Chief Inspector', desc: 'Reach Captain rank', condition: (s: DetectiveState) => s.rank >= 6 },
  { id: 'dc_a15', name: 'Legend', desc: 'Reach Chief rank', condition: (s: DetectiveState) => s.rank >= 7 },
]

let state: DetectiveState | null = null;

function ensureInit(): DetectiveState {
  if (state) return state;
  state = {
    level: 1, xp: 0, xpToNext: 100, rank: 0, reputation: 0,
    casesSolved: 0, casesFailed: 0, currentStreak: 0, bestStreak: 0,
    totalCluesFound: 0, correctAccusations: 0,
    activeCase: null, investigationPhase: 0,
    collectedEvidence: [], interrogatedSuspects: [], currentClues: [],
    eliminatedSuspects: [], availableCases: generateCases(),
    solvedCases: [], partners: JSON.parse(JSON.stringify(PARTNERS)),
    activePartner: 'p1', clueJournal: [],
    coldCases: Array.from({ length: 10 }, (_, i) => ({
      caseId: `case-${i * 4 + 1}`, revisitCost: 100 + i * 50,
      newEvidenceChance: 0.3 + i * 0.05, lastAttempted: 0, bonusMultiplier: 1,
    })),
    dailyCase: { caseId: '', completed: false, bonusMultiplier: 1, timeBonus: 0 },
    achievements: [], runHistory: [], totalEarned: 0, coins: 0,
  };
  return state;
}

export function dcGetState(): DetectiveState { return ensureInit(); }

export function dcResetState(): void { state = null; }

export function dcGetLevel(): number { return ensureInit().level; }

export function dcAddXP(amount: number): { leveledUp: boolean; newLevel: number } {
  const s = ensureInit();
  s.xp += amount;
  let leveledUp = false;
  while (s.xp >= s.xpToNext) {
    s.xp -= s.xpToNext;
    s.level++;
    s.xpToNext = Math.floor(s.xpToNext * 1.3);
    leveledUp = true;
  }
  return { leveledUp, newLevel: s.level };
}

export function dcGetXPProgress(): { current: number; needed: number; percentage: number } {
  const s = ensureInit();
  return { current: s.xp, needed: s.xpToNext, percentage: Math.floor((s.xp / s.xpToNext) * 100) };
}

export function dcGetRank(): { name: string; emoji: string; index: number } {
  const s = ensureInit();
  let rank = RANKS[0];
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (s.reputation >= RANKS[i].minRep) { rank = RANKS[i]; break; }
  }
  const idx = RANKS.indexOf(rank);
  return { name: rank.name, emoji: rank.emoji, index: idx };
}

export function dcAddReputation(amount: number): void { ensureInit().reputation = Math.max(0, ensureInit().reputation + amount); }

export function dcGetReputation(): number { return ensureInit().reputation; }

export function dcGetCategories(): string[] { return [...CATEGORIES]; }

export function dcGetRanks(): typeof RANKS { return [...RANKS]; }

export function dcGetSuspects(): Suspect[] { return [...SUSPECTS]; }

export function dcGetSuspect(id: string): Suspect | undefined { return SUSPECTS.find(s => s.id === id); }

export function dcGetAvailableCases(): CaseData[] {
  const s = ensureInit();
  return s.availableCases.filter(c => !s.solvedCases.includes(c.id));
}

export function dcGetSolvedCases(): CaseData[] {
  const s = ensureInit();
  return s.availableCases.filter(c => s.solvedCases.includes(c.id));
}

export function dcGetCase(id: string): CaseData | undefined { return ensureInit().availableCases.find(c => c.id === id); }

export function dcGetCasesByCategory(category: string): CaseData[] {
  return ensureInit().availableCases.filter(c => c.category === category && !ensureInit().solvedCases.includes(c.id));
}

export function dcGetCasesByDifficulty(difficulty: number): CaseData[] {
  return ensureInit().availableCases.filter(c => c.difficulty === difficulty && !ensureInit().solvedCases.includes(c.id));
}

export function dcStartCase(caseId: string): CaseData | null {
  const s = ensureInit();
  const c = s.availableCases.find(x => x.id === caseId);
  if (!c || s.solvedCases.includes(c.id)) return null;
  s.activeCase = c;
  s.investigationPhase = 0;
  s.collectedEvidence = [];
  s.interrogatedSuspects = [];
  s.currentClues = [];
  s.eliminatedSuspects = [];
  s.clueJournal.push({ caseId, clueIds: [], connections: [], deductions: [], eliminatedSuspects: [] });
  return c;
}

export function dcGetActiveCase(): CaseData | null { return ensureInit().activeCase; }

export function dcGetInvestigationPhase(): number { return ensureInit().investigationPhase; }

export function dcAdvancePhase(): number {
  const s = ensureInit();
  if (s.investigationPhase < 4) s.investigationPhase++;
  return s.investigationPhase;
}

export function dcGetPhaseName(): string {
  const phases = ['Crime Scene', 'Collect Evidence', 'Interrogate', 'Analyze Clues', 'Make Accusation'];
  return phases[ensureInit().investigationPhase] || 'Complete';
}

export function dcAbandonCase(): void {
  const s = ensureInit();
  if (s.activeCase) {
    s.runHistory.push({ caseId: s.activeCase.id, result: 'abandoned', timeTaken: 0, cluesFound: s.collectedEvidence.length, correctAccusation: false, timestamp: Date.now(), xpEarned: 0 });
    s.casesFailed++;
    s.currentStreak = 0;
    s.activeCase = null;
  }
}

export function dcCollectEvidence(evidenceId: string): Evidence | null {
  const s = ensureInit();
  if (!s.activeCase) return null;
  const allEv = generateEvidence();
  const ev = allEv.find(e => e.id === evidenceId && e.caseId === s.activeCase!.id);
  if (!ev || s.collectedEvidence.some(e => e.id === evidenceId)) return null;
  s.collectedEvidence.push(ev);
  s.currentClues.push(evidenceId);
  s.totalCluesFound++;
  const journal = s.clueJournal.find(j => j.caseId === s.activeCase!.id);
  if (journal) journal.clueIds.push(evidenceId);
  return ev;
}

export function dcGetCollectedEvidence(): Evidence[] { return [...ensureInit().collectedEvidence]; }

export function dcGetEvidenceForCase(caseId: string): Evidence[] {
  return generateEvidence().filter(e => e.caseId === caseId);
}

export function dcInterrogateSuspect(suspectId: string): { response: string; isLying: boolean; nervousness: number } | null {
  const s = ensureInit();
  if (!s.activeCase || s.interrogatedSuspects.includes(suspectId)) return null;
  const suspect = SUSPECTS.find(x => x.id === suspectId);
  if (!suspect) return null;
  s.interrogatedSuspects.push(suspectId);
  const isLying = suspectId === s.activeCase.culpritId;
  const partner = s.partners.find(p => p.id === s.activePartner);
  const detected = isLying && partner && partner.id === 'p2';
  const responses = [
    `I was at ${suspect.alibi.toLowerCase()} all evening.`,
    `I have nothing to do with this. Check my records.`,
    `I saw someone suspicious near the ${s.activeCase.location} that night.`,
    `The victim and I had a professional relationship, nothing more.`,
    `I noticed ${SUSPECTS[(SUSPECTS.indexOf(suspect) + 3) % 20].name} acting strangely lately.`,
  ];
  return {
    response: responses[Math.floor(suspectId.charCodeAt(1) % responses.length)],
    isLying: detected ? true : false,
    nervousness: suspect.nervousness + (isLying ? 15 : 0),
  };
}

export function dcGetInterrogatedSuspects(): string[] { return [...ensureInit().interrogatedSuspects]; }

export function dcEliminateSuspect(suspectId: string): boolean {
  const s = ensureInit();
  if (!s.activeCase || s.eliminatedSuspects.includes(suspectId)) return false;
  s.eliminatedSuspects.push(suspectId);
  const journal = s.clueJournal.find(j => j.caseId === s.activeCase!.id);
  if (journal) journal.eliminatedSuspects.push(suspectId);
  return true;
}

export function dcGetEliminatedSuspects(): string[] { return [...ensureInit().eliminatedSuspects]; }

export function dcAnalyzeClues(): { connections: string[][]; deductions: string[] } | null {
  const s = ensureInit();
  if (!s.activeCase || s.collectedEvidence.length < 2) return null;
  const connections: string[][] = [];
  const deductions: string[] = [];
  for (let i = 0; i < s.collectedEvidence.length; i++) {
    for (let j = i + 1; j < s.collectedEvidence.length; j++) {
      if (s.collectedEvidence[i].pointsTo === s.collectedEvidence[j].pointsTo) {
        connections.push([s.collectedEvidence[i].id, s.collectedEvidence[j].id]);
        deductions.push(`Evidence connects to ${dcGetSuspect(s.collectedEvidence[i].pointsTo)?.name || 'Unknown'}`);
      }
    }
  }
  if (connections.length === 0) {
    deductions.push('No direct connections found between collected evidence.');
  }
  const journal = s.clueJournal.find(j => j.caseId === s.activeCase!.id);
  if (journal) { journal.connections = connections; journal.deductions = deductions; }
  return { connections, deductions };
}

export function dcAccuseSuspect(suspectId: string): { correct: boolean; xpEarned: number; coinsEarned: number; reputationChange: number } {
  const s = ensureInit();
  if (!s.activeCase) return { correct: false, xpEarned: 0, coinsEarned: 0, reputationChange: 0 };
  const correct = suspectId === s.activeCase.culpritId;
  let xpEarned = 0;
  let coinsEarned = 0;
  let reputationChange = 0;
  if (correct) {
    xpEarned = s.activeCase.xpReward + s.collectedEvidence.length * 10;
    coinsEarned = s.activeCase.reward;
    reputationChange = s.activeCase.difficulty * 10 + 5;
    s.casesSolved++;
    s.currentStreak++;
    s.correctAccusations++;
    if (s.currentStreak > s.bestStreak) s.bestStreak = s.currentStreak;
    if (s.activeCase.difficulty >= 4) s.activeCase.starred = true;
    s.solvedCases.push(s.activeCase.id);
    if (s.partners.find(p => p.id === s.activePartner)) s.partners.find(p => p.id === s.activePartner)!.bonus += 2;
  } else {
    reputationChange = -s.activeCase.difficulty * 5;
    s.casesFailed++;
    s.currentStreak = 0;
  }
  const xpResult = dcAddXP(xpEarned);
  dcAddReputation(reputationChange);
  s.coins += coinsEarned;
  s.totalEarned += coinsEarned;
  s.runHistory.push({
    caseId: s.activeCase.id, result: correct ? 'solved' : 'failed', timeTaken: 0,
    cluesFound: s.collectedEvidence.length, correctAccusation: correct,
    timestamp: Date.now(), xpEarned,
  });
  s.activeCase = null;
  return { correct, xpEarned, coinsEarned, reputationChange };
}

export function dcGetPartners(): Partner[] { return [...ensureInit().partners]; }

export function dcGetActivePartner(): Partner | undefined { return ensureInit().partners.find(p => p.id === ensureInit().activePartner); }

export function dcSetActivePartner(partnerId: string): boolean {
  const s = ensureInit();
  const partner = s.partners.find(p => p.id === partnerId);
  if (!partner || !partner.unlocked) return false;
  s.activePartner = partnerId;
  return true;
}

export function dcUnlockPartner(partnerId: string): boolean {
  const s = ensureInit();
  const partner = s.partners.find(p => p.id === partnerId);
  if (!partner || partner.unlocked) return false;
  const costs: Record<string, number> = { p3: 200, p4: 400 };
  const cost = costs[partnerId] || 300;
  if (s.coins < cost) return false;
  s.coins -= cost;
  partner.unlocked = true;
  return true;
}

export function dcGetClueJournal(caseId?: string): ClueJournal[] {
  const s = ensureInit();
  return caseId ? s.clueJournal.filter(j => j.caseId === caseId) : [...s.clueJournal];
}

export function dcGetColdCases(): ColdCase[] { return [...ensureInit().coldCases]; }

export function dcRevisitColdCase(caseId: string): { newEvidence: boolean; evidence: Evidence | null } {
  const s = ensureInit();
  const cc = s.coldCases.find(c => c.caseId === caseId);
  if (!cc) return { newEvidence: false, evidence: null };
  if (s.coins < cc.revisitCost) return { newEvidence: false, evidence: null };
  s.coins -= cc.revisitCost;
  cc.lastAttempted = Date.now();
  const hasNew = Math.random() < cc.newEvidenceChance;
  if (hasNew) {
    cc.bonusMultiplier = 2;
    const ev: Evidence = { id: `cold-ev-${Date.now()}`, name: 'Newly discovered evidence', type: 'document', description: 'Fresh evidence found during re-investigation', caseId, pointsTo: '', strength: 3 };
    return { newEvidence: true, evidence: ev };
  }
  return { newEvidence: false, evidence: null };
}

export function dcGetDailyCase(): { caseId: string; completed: boolean; bonusMultiplier: number } | null {
  const s = ensureInit();
  const today = new Date().toDateString();
  const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const caseIdx = seed % s.availableCases.length;
  if (s.dailyCase.caseId !== s.availableCases[caseIdx].id) {
    s.dailyCase = { caseId: s.availableCases[caseIdx].id, completed: false, bonusMultiplier: 1.5, timeBonus: 0 };
  }
  return { ...s.dailyCase };
}

export function dcCompleteDaily(): { bonus: number } {
  const s = ensureInit();
  const daily = dcGetDailyCase();
  if (!daily || daily.completed) return { bonus: 0 };
  s.dailyCase.completed = true;
  const bonus = Math.floor(50 * s.dailyCase.bonusMultiplier);
  s.coins += bonus;
  dcAddXP(30);
  dcAddReputation(5);
  return { bonus };
}

export function dcGetStreak(): number { return ensureInit().currentStreak; }

export function dcGetBestStreak(): number { return ensureInit().bestStreak; }

export function dcGetCoins(): number { return ensureInit().coins; }

export function dcSpendCoins(amount: number): boolean {
  const s = ensureInit();
  if (s.coins < amount) return false;
  s.coins -= amount;
  return true;
}

export function dcGetRunHistory(): CaseRun[] { return [...ensureInit().runHistory].slice(-20); }

export function dcGetStats(): { label: string; value: string | number }[] {
  const s = ensureInit();
  const rank = dcGetRank();
  return [
    { label: 'Rank', value: `${rank.emoji} ${rank.name}` },
    { label: 'Level', value: s.level },
    { label: 'Reputation', value: s.reputation },
    { label: 'Solved', value: s.casesSolved },
    { label: 'Failed', value: s.casesFailed },
    { label: 'Streak', value: `${s.currentStreak} (Best: ${s.bestStreak})` },
    { label: 'Clues', value: s.totalCluesFound },
    { label: 'Accuracy', value: s.casesSolved + s.casesFailed > 0 ? `${Math.round((s.correctAccusations / (s.casesSolved + s.casesFailed)) * 100)}%` : 'N/A' },
    { label: 'Coins', value: s.coins },
    { label: 'Partners', value: `${s.partners.filter(p => p.unlocked).length}/4` },
  ];
}

export function dcGetAchievements(): { id: string; name: string; desc: string; unlocked: boolean }[] {
  const s = ensureInit();
  return ACHIEVEMENTS.map(a => ({ ...a, unlocked: s.achievements.includes(a.id) }));
}

export function dcCheckAchievements(): string[] {
  const s = ensureInit();
  const newlyUnlocked: string[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (!s.achievements.includes(ach.id) && ach.condition(s)) {
      s.achievements.push(ach.id);
      newlyUnlocked.push(ach.id);
      s.coins += 25;
    }
  }
  return newlyUnlocked;
}

export function dcIsAchievementUnlocked(id: string): boolean { return ensureInit().achievements.includes(id); }

export function dcGetUnlockedAchievements(): typeof ACHIEVEMENTS {
  const s = ensureInit();
  return ACHIEVEMENTS.filter(a => s.achievements.includes(a.id));
}

export function dcGetAchievementProgress(): { id: string; name: string; progress: number; max: number }[] {
  const s = ensureInit();
  return [
    { id: 'dc_a1', name: 'First Solve', progress: Math.min(s.casesSolved, 1), max: 1 },
    { id: 'dc_a2', name: 'Perfect Deduction', progress: Math.min(s.correctAccusations, 5), max: 5 },
    { id: 'dc_a6', name: 'Evidence Hoarder', progress: Math.min(s.totalCluesFound, 50), max: 50 },
    { id: 'dc_a10', name: 'Case Collector', progress: Math.min(s.casesSolved, 25), max: 25 },
    { id: 'dc_a13', name: 'Sharp Eye', progress: Math.min(s.totalCluesFound, 100), max: 100 },
  ];
}

export function dcGetHint(): string {
  const s = ensureInit();
  if (!s.activeCase) return 'Start a case first!';
  const hints = [
    `Focus on ${SUSPECTS.find(x => x.id === s.activeCase.culpritId)?.name || 'the suspect with the most to gain'}.`,
    'Check the evidence types — physical evidence rarely lies.',
    `The culprit is among the ${s.activeCase.suspects.length} suspects. Eliminate those with solid alibis.`,
    'Digital evidence often reveals the truth when testimonies conflict.',
    'Look for inconsistencies between alibis and evidence timelines.',
  ];
  return hints[Math.floor(Date.now() / 60000) % hints.length];
}

export function dcGetCaseBoard(): { suspects: { id: string; name: string; eliminated: boolean; evidenceCount: number }[]; evidence: { id: string; name: string; type: string; pointsTo: string }[] } | null {
  const s = ensureInit();
  if (!s.activeCase) return null;
  return {
    suspects: s.activeCase.suspects.map(sid => {
      const suspect = SUSPECTS.find(x => x.id === sid);
      return { id: sid, name: suspect?.name || 'Unknown', eliminated: s.eliminatedSuspects.includes(sid), evidenceCount: s.collectedEvidence.filter(e => e.pointsTo === sid).length };
    }),
    evidence: s.collectedEvidence.map(e => ({ id: e.id, name: e.name, type: e.type, pointsTo: SUSPECTS.find(x => x.id === e.pointsTo)?.name || 'Unknown' })),
  };
}

export function dcGetTotalCases(): number { return ensureInit().availableCases.length; }

export function dcGetSolveRate(): number {
  const s = ensureInit();
  const total = s.casesSolved + s.casesFailed;
  return total > 0 ? s.casesSolved / total : 0;
}

export function dcGetCoinsEarned(): number { return ensureInit().totalEarned; }

export function dcGetDifficultyLabel(diff: number): string {
  return ['', 'Easy', 'Medium', 'Hard', 'Expert', 'Legendary'][diff] || 'Unknown';
}
