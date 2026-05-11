// ============================================================================
// Archaeology Dig Wire — SSR-safe module for the Word Snake game
// All exports use the `ad` prefix. No React hooks. No browser APIs at top level.
// ============================================================================

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export type DigLayer = 'topsoil' | 'clay' | 'sandstone' | 'limestone' | 'bedrock' | 'artifact_layer';

export type ArtifactType = 'pottery' | 'jewelry' | 'weapons' | 'tablets' | 'statues';

export type RarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type ToolType = 'trowel' | 'brush' | 'shovel' | 'pickaxe' | 'metal_detector' | 'ground_radar';

export type WeatherType = 'clear' | 'sandstorm' | 'rain' | 'heat' | 'fog';

export type RestorationPhase = 'none' | 'cleaning' | 'repairing' | 'assembling';

export type FundingSourceType = 'university_grant' | 'private_donor' | 'museum_purchase' | 'government_fund';

export interface DigTile {
  row: number;
  col: number;
  revealed: boolean;
  layer: DigLayer;
  artifactId: string | null;
  fragility: number; // 0–100, lower = safer to dig
}

export interface Artifact {
  id: string;
  name: string;
  type: ArtifactType;
  rarity: RarityTier;
  description: string;
  civilization: string;
  estimatedAge: string;
  carbonDateRange: [number, number]; // BCE year range
  baseValue: number;
  restorationPhase: RestorationPhase;
  restorationProgress: number; // 0–100 per phase
  preservationScore: number; // 0–100
  discoveredAt: string; // site id
  discoveredDate: number; // timestamp
  journalEntry: string;
  isExhibited: boolean;
  exhibitId: string | null;
}

export interface Tool {
  type: ToolType;
  name: string;
  level: number;
  maxLevel: number;
  efficiency: number; // 0–1
  precision: number; // 0–1
  costPerUse: number;
  upgradeCost: number;
  description: string;
}

export interface ExcavationSite {
  id: string;
  name: string;
  description: string;
  region: string;
  era: string;
  difficulty: number; // 1–5
  layerDistribution: Record<DigLayer, number>; // weight
  artifactPool: string[];
  gridSize: number;
  unlocked: boolean;
  unlockCost: number;
  maxDepth: number;
  imageURL: string;
}

export interface Rival {
  id: string;
  name: string;
  specialty: string;
  aggression: number; // 0–1
  preferredSites: string[];
  currentSite: string | null;
  artifactsFound: number;
  reputation: number;
  portrait: string;
  catchphrase: string;
}

export interface ResearchTopic {
  id: string;
  name: string;
  description: string;
  cost: number;
  duration: number; // in-game days
  prerequisite: string | null;
  unlocks: string;
  completed: boolean;
  progress: number; // 0–100
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  unlocked: boolean;
  unlockedDate: number | null;
  reward: { coins: number; xp: number; badge: string };
}

export interface Exhibit {
  id: string;
  artifactId: string;
  startDate: number;
  visitors: number;
  ticketsEarned: number;
  prestige: number;
  isActive: boolean;
}

export interface TradeOffer {
  id: string;
  sellerName: string;
  artifactName: string;
  askingPrice: number;
  rarity: RarityTier;
  expiresInDays: number;
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  siteName: string;
  artifactName: string | null;
  entry: string;
  tags: string[];
}

export interface ExpeditionState {
  siteId: string;
  day: number;
  maxDays: number;
  energy: number;
  maxEnergy: number;
  supplies: number;
  maxSupplies: number;
  funding: number;
  tilesDug: number;
  artifactsFound: string[];
  completed: boolean;
  reward: { coins: number; xp: number; artifacts: string[] };
}

export interface ArchaeologyDigState {
  initialized: boolean;
  version: number;
  // Player
  archaeologistName: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXP: number;
  coins: number;
  // Digging
  currentSiteId: string | null;
  grid: DigTile[][];
  selectedTool: ToolType;
  digsRemaining: number;
  maxDigsPerSession: number;
  preservationScore: number;
  // Inventory
  artifacts: Artifact[];
  tools: Tool[];
  // Sites
  sites: ExcavationSite[];
  // Museum
  exhibits: Exhibit[];
  museumPrestige: number;
  totalVisitors: number;
  totalTickets: number;
  // Research
  researchTopics: ResearchTopic[];
  researchPoints: number;
  // Rivals
  rivals: Rival[];
  // Trading
  tradeOffers: TradeOffer[];
  playerMarketListings: TradeOffer[];
  // Expedition
  currentExpedition: ExpeditionState | null;
  completedExpeditions: number;
  // Daily
  lastDailyDate: string;
  dailyDigsCompleted: number;
  dailyBonusClaimed: boolean;
  // Weather
  currentWeather: WeatherType;
  weatherDuration: number;
  // Achievements
  achievements: Achievement[];
  achievementsUnlocked: number;
  // Journal
  journal: JournalEntry[];
  // Stats
  totalArtifactsFound: number;
  totalTilesDug: number;
  totalSitesVisited: number;
  legendaryCount: number;
  rarePlusCount: number;
  perfectDigsCount: number;
  // Funding
  pendingGrants: FundingSourceType[];
  grantCooldowns: Record<FundingSourceType, number>;
  donorCooldown: number;
  // Abilities
  abilityCharges: Record<string, number>;
  abilitiesUnlocked: string[];
}

// ---------------------------------------------------------------------------
// Static Data — Excavation Sites
// ---------------------------------------------------------------------------

const EXCAVATION_SITES: ExcavationSite[] = [
  {
    id: 'egyptian_pyramid',
    name: 'Egyptian Pyramid',
    description: 'The Great Pyramid of Giza, the last standing wonder of the ancient world, holds secrets spanning over 4,500 years of pharaonic civilization.',
    region: 'North Africa',
    era: 'c. 2580–2560 BCE',
    difficulty: 2,
    layerDistribution: { topsoil: 15, clay: 20, sandstone: 30, limestone: 20, bedrock: 10, artifact_layer: 5 },
    artifactPool: ['pot_001','pot_002','jew_001','jew_002','tab_001','tab_002','tab_003','stat_001','wea_001','wea_002'],
    gridSize: 6,
    unlocked: true,
    unlockCost: 0,
    maxDepth: 6,
    imageURL: '/sites/egyptian-pyramid.png',
  },
  {
    id: 'roman_colosseum',
    name: 'Roman Colosseum',
    description: 'Beneath the arena floor lies a network of underground passages and chambers where gladiators once prepared for battle.',
    region: 'Southern Europe',
    era: 'c. 70–80 CE',
    difficulty: 3,
    layerDistribution: { topsoil: 20, clay: 15, sandstone: 10, limestone: 25, bedrock: 20, artifact_layer: 10 },
    artifactPool: ['pot_003','pot_004','jew_003','wea_003','wea_004','tab_004','stat_002','stat_003','pot_005','jew_004'],
    gridSize: 6,
    unlocked: true,
    unlockCost: 0,
    maxDepth: 6,
    imageURL: '/sites/roman-colosseum.png',
  },
  {
    id: 'greek_acropolis',
    name: 'Greek Acropolis',
    description: 'The sacred rock of Athens reveals layers of classical Greek art, philosophy, and democratic governance from the 5th century BCE.',
    region: 'Southeastern Europe',
    era: 'c. 447–432 BCE',
    difficulty: 3,
    layerDistribution: { topsoil: 10, clay: 20, sandstone: 15, limestone: 30, bedrock: 15, artifact_layer: 10 },
    artifactPool: ['pot_006','pot_007','jew_005','tab_005','tab_006','stat_004','stat_005','wea_005','tab_007','pot_008'],
    gridSize: 6,
    unlocked: true,
    unlockCost: 0,
    maxDepth: 6,
    imageURL: '/sites/greek-acropolis.png',
  },
  {
    id: 'mayan_temple',
    name: 'Mayan Temple',
    description: 'Deep in the Yucatan jungle, ancient stepped pyramids conceal jade artifacts and cryptic calendrical inscriptions of the Maya.',
    region: 'Central America',
    era: 'c. 250–900 CE',
    difficulty: 4,
    layerDistribution: { topsoil: 25, clay: 15, sandstone: 10, limestone: 20, bedrock: 15, artifact_layer: 15 },
    artifactPool: ['pot_009','pot_010','jew_006','jew_007','tab_008','tab_009','stat_006','wea_006','jew_008','tab_010'],
    gridSize: 6,
    unlocked: false,
    unlockCost: 5000,
    maxDepth: 6,
    imageURL: '/sites/mayan-temple.png',
  },
  {
    id: 'viking_burial',
    name: 'Viking Burial Ground',
    description: 'Scandinavian burial mounds contain ship burials, rune stones, and weapons of legendary Norse warriors from the Viking Age.',
    region: 'Northern Europe',
    era: 'c. 793–1066 CE',
    difficulty: 4,
    layerDistribution: { topsoil: 20, clay: 25, sandstone: 5, limestone: 15, bedrock: 25, artifact_layer: 10 },
    artifactPool: ['wea_007','wea_008','jew_009','jew_010','tab_011','tab_012','stat_007','stat_008','pot_x01','wea_x01'],
    gridSize: 6,
    unlocked: false,
    unlockCost: 8000,
    maxDepth: 6,
    imageURL: '/sites/viking-burial.png',
  },
  {
    id: 'chinese_terracotta',
    name: 'Chinese Terracotta Army',
    description: 'The underground tomb complex of Emperor Qin Shi Huang protects an army of 8,000+ life-sized terracotta warriors and horses.',
    region: 'East Asia',
    era: 'c. 210 BCE',
    difficulty: 5,
    layerDistribution: { topsoil: 10, clay: 30, sandstone: 10, limestone: 20, bedrock: 15, artifact_layer: 15 },
    artifactPool: ['stat_009','stat_010','tab_x01','wea_x02','pot_x02','jew_x01','tab_x02','pot_x03','stat_x01','tab_x03'],
    gridSize: 6,
    unlocked: false,
    unlockCost: 12000,
    maxDepth: 6,
    imageURL: '/sites/chinese-terracotta.png',
  },
  {
    id: 'medieval_castle',
    name: 'Medieval Castle Ruins',
    description: 'Crusader-era fortifications in the Levant conceal arms, illuminated manuscripts, and treasure from the age of chivalry.',
    region: 'Middle East',
    era: 'c. 1099–1291 CE',
    difficulty: 4,
    layerDistribution: { topsoil: 15, clay: 20, sandstone: 15, limestone: 25, bedrock: 15, artifact_layer: 10 },
    artifactPool: ['wea_x03','wea_x04','tab_x04','tab_x05','pot_x04','pot_x05','jew_x02','jew_x03','stat_x02','tab_x06'],
    gridSize: 6,
    unlocked: false,
    unlockCost: 10000,
    maxDepth: 6,
    imageURL: '/sites/medieval-castle.png',
  },
  {
    id: 'atlantis_ruins',
    name: 'Atlantis Ruins',
    description: 'Submerged ruins matching Plato\'s description of Atlantis, with advanced crystalline artifacts of an unknown prehistoric civilization.',
    region: 'Mediterranean Sea',
    era: 'c. 9600 BCE (estimated)',
    difficulty: 5,
    layerDistribution: { topsoil: 5, clay: 10, sandstone: 15, limestone: 20, bedrock: 20, artifact_layer: 30 },
    artifactPool: ['jew_x04','jew_x05','stat_x03','stat_x04','tab_x07','tab_x08','pot_x06','wea_x05','stat_x05','tab_x09'],
    gridSize: 6,
    unlocked: false,
    unlockCost: 25000,
    maxDepth: 6,
    imageURL: '/sites/atlantis-ruins.png',
  },
];

// ---------------------------------------------------------------------------
// Static Data — 50 Artifacts
// ---------------------------------------------------------------------------

interface ArtifactTemplate {
  id: string;
  name: string;
  type: ArtifactType;
  rarity: RarityTier;
  description: string;
  civilization: string;
  estimatedAge: string;
  carbonDateRange: [number, number];
  baseValue: number;
}

const ARTIFACT_TEMPLATES: ArtifactTemplate[] = [
  // ---- Pottery (10) ----
  { id:'pot_001', name:'Narmer Palette Shard', type:'pottery', rarity:'uncommon', description:'A fragment of the ceremonial palette of Pharaoh Narmer depicting the unification of Upper and Lower Egypt.', civilization:'Ancient Egyptian', estimatedAge:'~3100 BCE', carbonDateRange:[-3150,-3050], baseValue:800 },
  { id:'pot_002', name:'Canopic Jar Fragment', type:'pottery', rarity:'common', description:'A limestone canopic jar lid shaped like the falcon-headed god Qebehsenuef, used to store intestines during mummification.', civilization:'Ancient Egyptian', estimatedAge:'~1250 BCE', carbonDateRange:[-1300,-1200], baseValue:450 },
  { id:'pot_003', name:'Samian Ware Bowl', type:'pottery', rarity:'common', description:'A fine red-gloss terra sigillata bowl produced in Gaul, decorated with a hunting scene in relief.', civilization:'Roman', estimatedAge:'~50 CE', carbonDateRange:[20,80], baseValue:320 },
  { id:'pot_004', name:'Amphora Handle', type:'pottery', rarity:'common', description:'A stamped amphora handle from a wine shipment, bearing the merchant\'s mark "M. FABIVS".', civilization:'Roman', estimatedAge:'~30 BCE', carbonDateRange:[-45,-15], baseValue:280 },
  { id:'pot_005', name:'Red-Figure Kylix', type:'pottery', rarity:'rare', description:'An Attic red-figure drinking cup depicting Dionysus with satyrs, attributed to the Berlin Painter school.', civilization:'Ancient Greek', estimatedAge:'~480 BCE', carbonDateRange:[-500,-460], baseValue:1500 },
  { id:'pot_006', name:'Black-Figure Amphora', type:'pottery', rarity:'uncommon', description:'A storage vessel showing Heracles wrestling the Nemean Lion in the black-figure technique.', civilization:'Ancient Greek', estimatedAge:'~540 BCE', carbonDateRange:[-560,-520], baseValue:900 },
  { id:'pot_007', name:'Protogeometric Krater', type:'pottery', rarity:'uncommon', description:'An early Geometric period mixing vessel with concentric semicircle decoration, marking the rebirth of Greek pottery after the Dark Ages.', civilization:'Ancient Greek', estimatedAge:'~900 BCE', carbonDateRange:[-950,-850], baseValue:1100 },
  { id:'pot_008', name:'Corinthian Oinochoe', type:'pottery', rarity:'common', description:'A Corinthian pottery jug with animal frieze decoration — goats, lions, and the mythical chimera.', civilization:'Ancient Greek', estimatedAge:'~620 BCE', carbonDateRange:[-650,-590], baseValue:500 },
  { id:'pot_009', name:'Mayan Polychrome Vase', type:'pottery', rarity:'rare', description:'A finely painted cylinder vase depicting the Maize God\'s resurrection from a turtle shell, with hieroglyphic text.', civilization:'Maya', estimatedAge:'~750 CE', carbonDateRange:[700,800], baseValue:2200 },
  { id:'pot_010', name:'Codex-Style Plate', type:'pottery', rarity:'epic', description:'A ceremonial plate with calligraphic line painting of a Maya lord receiving tribute, masterwork of codex style.', civilization:'Maya', estimatedAge:'~800 CE', carbonDateRange:[780,820], baseValue:4500 },
  // ---- Jewelry (10) ----
  { id:'jew_001', name:'Scarab Amulet', type:'jewelry', rarity:'common', description:'A carved steatite scarab beetle amulet with the throne name of Thutmose III on the base.', civilization:'Ancient Egyptian', estimatedAge:'~1450 BCE', carbonDateRange:[-1500,-1400], baseValue:600 },
  { id:'jew_002', name:'Usekh Collar Bead', type:'jewelry', rarity:'uncommon', description:'A single faience bead from a princess\'s broad collar necklace, bright blue with gold leaf.', civilization:'Ancient Egyptian', estimatedAge:'~1350 BCE', carbonDateRange:[-1380,-1320], baseValue:950 },
  { id:'jew_003', name:'Roman Bronze Ring', type:'jewelry', rarity:'common', description:'A legionary\'s bronze signet ring with an engraved eagle (aquila) symbol.', civilization:'Roman', estimatedAge:'~100 CE', carbonDateRange:[60,140], baseValue:350 },
  { id:'jew_004', name:'Bulla Pendant', type:'jewelry', rarity:'uncommon', description:'A gold amulet worn by a Roman child for protection, engraved with a phallic symbol for warding off evil.', civilization:'Roman', estimatedAge:'~50 CE', carbonDateRange:[10,90], baseValue:780 },
  { id:'jew_005', name:'Gold Mycenaean Diadem', type:'jewelry', rarity:'rare', description:'A thin gold leaf diadem from a Mycenaean shaft grave, repoussé decorated with running spirals.', civilization:'Mycenaean Greek', estimatedAge:'~1550 BCE', carbonDateRange:[-1600,-1500], baseValue:3200 },
  { id:'jew_006', name:'Jade Pectoral', type:'jewelry', rarity:'rare', description:'A translucent jadeite pectoral carved with the Maize God, found in a royal tomb at Copán.', civilization:'Maya', estimatedAge:'~700 CE', carbonDateRange:[680,720], baseValue:2800 },
  { id:'jew_007', name:'Jade Ear Flare', type:'jewelry', rarity:'uncommon', description:'A jade ear spool with a carved jaguar head, once worn by a Maya noble.', civilization:'Maya', estimatedAge:'~600 CE', carbonDateRange:[550,650], baseValue:1100 },
  { id:'jew_008', name:'Obsidian Mirror', type:'jewelry', rarity:'epic', description:'A perfectly polished obsidian disk mounted in a carved wooden frame, used by Maya priests for divination.', civilization:'Maya', estimatedAge:'~750 CE', carbonDateRange:[720,780], baseValue:5000 },
  { id:'jew_009', name:'Viking Arm Ring', type:'jewelry', rarity:'uncommon', description:'A twisted silver arm ring (armrìng) with stamped geometric patterns, used as currency in the Viking Age.', civilization:'Norse', estimatedAge:'~900 CE', carbonDateRange:[870,930], baseValue:1050 },
  { id:'jew_010', name:'Thor\'s Hammer Pendant', type:'jewelry', rarity:'rare', description:'A silver Mjölnir pendant with intricate filigree, a symbol of the thunder god Thor worn as a protective amulet.', civilization:'Norse', estimatedAge:'~1000 CE', carbonDateRange:[950,1050], baseValue:2100 },
  // ---- Weapons (8) ----
  { id:'wea_001', name:'Khopesh Blade Fragment', type:'weapons', rarity:'rare', description:'A bronze sickle-sword blade of the iconic Egyptian khopesh, bearing the cartouche of Ramesses II.', civilization:'Ancient Egyptian', estimatedAge:'~1250 BCE', carbonDateRange:[-1300,-1200], baseValue:2400 },
  { id:'wea_002', name:'Throwing Stick', type:'weapons', rarity:'common', description:'A curved wooden boomerang-like weapon used for hunting waterfowl in the Nile marshes.', civilization:'Ancient Egyptian', estimatedAge:'~1400 BCE', carbonDateRange:[-1450,-1350], baseValue:280 },
  { id:'wea_003', name:'Gladius Short Sword', type:'weapons', rarity:'uncommon', description:'A well-preserved Roman gladius with a bone grip and triangular blade point, standard legionary issue.', civilization:'Roman', estimatedAge:'~80 CE', carbonDateRange:[50,110], baseValue:950 },
  { id:'wea_004', name:'Pilum Spearhead', type:'weapons', rarity:'common', description:'A ferrous pilum head designed to bend on impact, making it unusable by the enemy.', civilization:'Roman', estimatedAge:'~100 CE', carbonDateRange:[60,140], baseValue:400 },
  { id:'wea_005', name:'Dory Spearhead', type:'weapons', rarity:'uncommon', description:'A hoplite\'s ash wood dory spearhead, leaf-shaped and well-balanced for the phalanx formation.', civilization:'Ancient Greek', estimatedAge:'~480 BCE', carbonDateRange:[-500,-460], baseValue:850 },
  { id:'wea_006', name:'Macuahuitl Fragment', type:'weapons', rarity:'rare', description:'A section of an obsidian-edged wooden club embedded with razor-sharp prismatic blades.', civilization:'Maya', estimatedAge:'~700 CE', carbonDateRange:[650,750], baseValue:2600 },
  { id:'wea_007', name:'Viking Battle Axe', type:'weapons', rarity:'rare', description:'A bearded axe head with a Norse rune inscription reading "HÆRJAR" (warriors).', civilization:'Norse', estimatedAge:'~950 CE', carbonDateRange:[920,980], baseValue:2900 },
  { id:'wea_008', name:'Ulfberht Sword Blade', type:'weapons', rarity:'legendary', description:'A crucible steel blade with the "+VLFBERHT+" inscription, extremely rare Viking-age advanced metallurgy.', civilization:'Norse', estimatedAge:'~900 CE', carbonDateRange:[850,950], baseValue:12000 },
  // ---- Tablets (12) ----
  { id:'tab_001', name:'Book of the Dead Papyrus', type:'tablets', rarity:'epic', description:'A scroll fragment containing Spell 125 — the "Weighing of the Heart" judgment before Osiris.', civilization:'Ancient Egyptian', estimatedAge:'~1070 BCE', carbonDateRange:[-1100,-1040], baseValue:5500 },
  { id:'tab_002', name:'Rosetta Stone Fragment', type:'tablets', rarity:'legendary', description:'A stone fragment bearing parallel inscriptions in hieroglyphic, Demotic, and Greek scripts — key to deciphering Egyptian writing.', civilization:'Ptolemaic Egyptian', estimatedAge:'~196 BCE', carbonDateRange:[-210,-180], baseValue:15000 },
  { id:'tab_003', name:'Wax Tablet (Practica)', type:'tablets', rarity:'common', description:'A wooden wax tablet with student exercises in Egyptian hieratic script, a schoolboy\'s homework.', civilization:'Ancient Egyptian', estimatedAge:'~1200 BCE', carbonDateRange:[-1250,-1150], baseValue:320 },
  { id:'tab_004', name:'Vindolanda Writing Tablet', type:'tablets', rarity:'uncommon', description:'A thin wooden leaf tablet with ink writing requesting more beer from a Roman fort near Hadrian\'s Wall.', civilization:'Roman Britain', estimatedAge:'~100 CE', carbonDateRange:[80,120], baseValue:720 },
  { id:'tab_005', name:'Parthenon Inventory Stele', type:'tablets', rarity:'rare', description:'An inscribed marble slab listing treasures dedicated to Athena, providing invaluable economic data of classical Athens.', civilization:'Ancient Greek', estimatedAge:'~434 BCE', carbonDateRange:[-445,-423], baseValue:2000 },
  { id:'tab_006', name:'Oracle Bone Fragment', type:'tablets', rarity:'uncommon', description:'A heated ox scapula with Shang dynasty divination inscriptions concerning the harvest.', civilization:'Ancient Chinese', estimatedAge:'~1200 BCE', carbonDateRange:[-1250,-1150], baseValue:850 },
  { id:'tab_007', name:'Dipylon Vase Inscription', type:'tablets', rarity:'uncommon', description:'A pottery shard bearing one of the earliest known Greek alphabetic inscriptions: "Whoever dances most frivolously."', civilization:'Ancient Greek', estimatedAge:'~740 BCE', carbonDateRange:[-760,-720], baseValue:980 },
  { id:'tab_008', name:'Dresden Codex Page', type:'tablets', rarity:'legendary', description:'A bark-paper page from the oldest surviving book from the Americas, containing Venus cycle astronomical tables.', civilization:'Maya', estimatedAge:'~1200 CE', carbonDateRange:[1100,1300], baseValue:14000 },
  { id:'tab_009', name:'Jade Plaque Glyphs', type:'tablets', rarity:'rare', description:'A carved jade plaque bearing the glyph sequence for a dynastic accession rite at Palenque.', civilization:'Maya', estimatedAge:'~683 CE', carbonDateRange:[670,696], baseValue:3100 },
  { id:'tab_010', name:'Popol Vuh Fragment', type:'tablets', rarity:'epic', description:'A painted codex fragment recounting the Hero Twins\' descent into Xibalba, the Maya underworld.', civilization:'Maya', estimatedAge:'~1100 CE', carbonDateRange:[1050,1150], baseValue:6200 },
  { id:'tab_011', name:'Rune Stone Fragment', type:'tablets', rarity:'uncommon', description:'A portion of a raised granite stone with Elder Futhark runes memorializing a warrior who died in England.', civilization:'Norse', estimatedAge:'~1000 CE', carbonDateRange:[970,1030], baseValue:750 },
  { id:'tab_012', name:'Rök Runestone Excerpt', type:'tablets', rarity:'rare', description:'A cast of the longest runic inscription in existence, containing allusions to Theodoric, the Goths, and Norse mythology.', civilization:'Norse', estimatedAge:'~850 CE', carbonDateRange:[800,900], baseValue:2800 },
  // ---- Statues (10) ----
  { id:'stat_001', name:'Shabti Figure', type:'statues', rarity:'common', description:'A small faience servant figure inscribed with Spell 6 of the Book of the Dead, to work for the deceased in the afterlife.', civilization:'Ancient Egyptian', estimatedAge:'~1000 BCE', carbonDateRange:[-1050,-950], baseValue:380 },
  { id:'stat_002', name:'Bust of Augustus', type:'statues', rarity:'epic', description:'A marble portrait bust of Emperor Augustus with the distinctive Prima Porta hairstyle, found in a Roman villa.', civilization:'Roman', estimatedAge:'~20 CE', carbonDateRange:[-5,45], baseValue:6000 },
  { id:'stat_003', name:'Bronze Gladiator', type:'statues', rarity:'rare', description:'A small bronze statuette of a murmillo-class gladiator in full armor with visored helmet.', civilization:'Roman', estimatedAge:'~100 CE', carbonDateRange:[70,130], baseValue:2500 },
  { id:'stat_004', name:'Kore Statue Fragment', type:'statues', rarity:'rare', description:'An Archaic period marble maiden torso with traces of red and blue paint, wearing a peplos.', civilization:'Ancient Greek', estimatedAge:'~530 BCE', carbonDateRange:[-550,-510], baseValue:2200 },
  { id:'stat_005', name:'Bronze Poseidon', type:'statues', rarity:'legendary', description:'A heavily patinated bronze arm holding a trident, believed to be part of a life-sized Poseidon statue by a classical master.', civilization:'Ancient Greek', estimatedAge:'~460 BCE', carbonDateRange:[-480,-440], baseValue:18000 },
  { id:'stat_006', name:'Jade Death Mask', type:'statues', rarity:'legendary', description:'A mosaic jade death mask from a royal Maya tomb at Calakmul, with shell and obsidian inlaid eyes.', civilization:'Maya', estimatedAge:'~650 CE', carbonDateRange:[630,670], baseValue:16000 },
  { id:'stat_007', name:'Oseberg Cart Figure', type:'statues', rarity:'rare', description:'A carved wooden figure from the Oseberg ship burial, depicting a cat-like creature gripping a serpent.', civilization:'Norse', estimatedAge:'~834 CE', carbonDateRange:[820,848], baseValue:2300 },
  { id:'stat_008', name:'Rune-Engraved Thor Statue', type:'statues', rarity:'uncommon', description:'A small wooden idol of Thor carved with runic inscriptions for protection on voyages.', civilization:'Norse', estimatedAge:'~1000 CE', carbonDateRange:[960,1040], baseValue:900 },
  { id:'stat_009', name:'Terracotta Warrior Head', type:'statues', rarity:'epic', description:'The head of a terracotta soldier with individually sculpted features, each face unique in the emperor\'s army.', civilization:'Qin Dynasty Chinese', estimatedAge:'~210 BCE', carbonDateRange:[-230,-190], baseValue:7000 },
  { id:'stat_010', name:'Terracotta Horse', type:'statues', rarity:'rare', description:'A life-sized terracotta war horse with painted saddle and harness remnants, from Qin Shi Huang\'s necropolis.', civilization:'Qin Dynasty Chinese', estimatedAge:'~210 BCE', carbonDateRange:[-230,-190], baseValue:3500 },
  // ---- Extra artifacts (cross-pool) ----
  { id:'pot_x01', name:'Viking Urnes-Style Bowl', type:'pottery', rarity:'uncommon', description:'A wooden bowl carved with interwoven animal motifs in the distinctive Urnes style of late Viking art.', civilization:'Norse', estimatedAge:'~1100 CE', carbonDateRange:[1060,1140], baseValue:820 },
  { id:'pot_x02', name:'Terracotta Water Jar', type:'pottery', rarity:'uncommon', description:'A gray clay water storage jar stamped with Qin dynasty seal script characters meaning "Palace of the West".', civilization:'Qin Dynasty Chinese', estimatedAge:'~210 BCE', carbonDateRange:[-230,-190], baseValue:780 },
  { id:'pot_x03', name:'Sancai Glazed Amphora', type:'pottery', rarity:'rare', description:'A Tang dynasty three-color (sancai) glazed amphora with a Mediterranean-inspired shape showing Silk Road influence.', civilization:'Tang Dynasty Chinese', estimatedAge:'~700 CE', carbonDateRange:[680,720], baseValue:2100 },
  { id:'pot_x04', name:'Crusader Olive Jar', type:'pottery', rarity:'common', description:'A medieval storage jar found in a Crusader castle, used for transporting olive oil from the Levant.', civilization:'Crusader', estimatedAge:'~1180 CE', carbonDateRange:[1150,1210], baseValue:350 },
  { id:'pot_x05', name:'Illuminated Manuscript Page', type:'pottery', rarity:'rare', description:'A vellum page from a Book of Hours with gold leaf illumination depicting the Annunciation.', civilization:'Medieval European', estimatedAge:'~1400 CE', carbonDateRange:[1380,1420], baseValue:2800 },
  { id:'pot_x06', name:'Atlantean Crystal Shard', type:'pottery', rarity:'legendary', description:'A luminescent crystal fragment with geometric patterns that match no known mineral structure on Earth.', civilization:'Atlantean (unknown)', estimatedAge:'~9600 BCE', carbonDateRange:[-9800,-9400], baseValue:20000 },
  { id:'jew_x01', name:'Qin Jade Bi Disc', type:'jewelry', rarity:'uncommon', description:'A perforated jade disc (bi) symbolizing heaven, found near the Terracotta Army pits.', civilization:'Qin Dynasty Chinese', estimatedAge:'~210 BCE', carbonDateRange:[-230,-190], baseValue:1050 },
  { id:'jew_x02', name:'Crusader Signet Ring', type:'jewelry', rarity:'uncommon', description:'A gold signet ring bearing the cross of the Knights Templar, used to seal documents.', civilization:'Crusader', estimatedAge:'~1180 CE', carbonDateRange:[1150,1210], baseValue:920 },
  { id:'jew_x03', name:'Medieval Pilgrim Badge', type:'jewelry', rarity:'common', description:'A pewter scallop-shell badge worn by pilgrims to Santiago de Compostela.', civilization:'Medieval European', estimatedAge:'~1250 CE', carbonDateRange:[1200,1300], baseValue:280 },
  { id:'jew_x04', name:'Atlantean Pendant', type:'jewelry', rarity:'epic', description:'An orichalcum pendant emitting a faint hum, with embedded crystal that refracts light into rainbow spectra.', civilization:'Atlantean (unknown)', estimatedAge:'~9600 BCE', carbonDateRange:[-9800,-9400], baseValue:8500 },
  { id:'jew_x05', name:'Star-Metal Tiara', type:'jewelry', rarity:'legendary', description:'A crown-like tiara made of an iridescent metal not found in the periodic table, inscribed with celestial coordinates.', civilization:'Atlantean (unknown)', estimatedAge:'~9600 BCE', carbonDateRange:[-9800,-9400], baseValue:22000 },
  { id:'wea_x01', name:'Runic Spearhead', type:'weapons', rarity:'uncommon', description:'A Viking spearhead etched with bind-runes combining the names of Odin and Thor for battle protection.', civilization:'Norse', estimatedAge:'~950 CE', carbonDateRange:[920,980], baseValue:920 },
  { id:'wea_x02', name:'Qin Bronze Halberd', type:'weapons', rarity:'uncommon', description:'A standardized Qin military bronze halberd (ge) blade with inscribed serial number showing mass production.', civilization:'Qin Dynasty Chinese', estimatedAge:'~210 BCE', carbonDateRange:[-230,-190], baseValue:880 },
  { id:'wea_x03', name:'Crusader Sword', type:'weapons', rarity:'rare', description:'A steel arming sword with a cross-shaped pommel and a blade inscription in Latin: "In hoc signo vinces."', civilization:'Crusader', estimatedAge:'~1200 CE', carbonDateRange:[1180,1220], baseValue:2600 },
  { id:'wea_x04', name:'Byzantine Mace', type:'weapons', rarity:'uncommon', description:'An iron flanged mace with silver inlay showing Byzantine double-headed eagle motifs.', civilization:'Byzantine', estimatedAge:'~1100 CE', carbonDateRange:[1070,1130], baseValue:760 },
  { id:'wea_x05', name:'Atlantean Resonance Blade', type:'weapons', rarity:'legendary', description:'A crystalline blade that vibrates at a precise frequency, capable of cutting stone. Its edge never dulls.', civilization:'Atlantean (unknown)', estimatedAge:'~9600 BCE', carbonDateRange:[-9800,-9400], baseValue:25000 },
  { id:'tab_x01', name:'Oracle Bone King List', type:'tablets', rarity:'rare', description:'A tortoise plastron listing Shang dynasty kings with oracle divination records about royal succession.', civilization:'Ancient Chinese', estimatedAge:'~1100 BCE', carbonDateRange:[-1150,-1050], baseValue:2400 },
  { id:'tab_x02', name:'Terracotta Inscription Slab', type:'tablets', rarity:'uncommon', description:'A clay slab bearing records of workshop production quotas for the Terracotta Army.', civilization:'Qin Dynasty Chinese', estimatedAge:'~210 BCE', carbonDateRange:[-230,-190], baseValue:700 },
  { id:'tab_x03', name:'Bamboo Slip Manuscript', type:'tablets', rarity:'rare', description:'A set of bamboo slips tied with cord containing legal statutes from the Qin dynasty penal code.', civilization:'Qin Dynasty Chinese', estimatedAge:'~217 BCE', carbonDateRange:[-240,-194], baseValue:1900 },
  { id:'tab_x04', name:'Crusader Map Fragment', type:'tablets', rarity:'rare', description:'A vellum map fragment showing the layout of Jerusalem during the First Crusade, annotated in Old French.', civilization:'Crusader', estimatedAge:'~1100 CE', carbonDateRange:[1080,1120], baseValue:2100 },
  { id:'tab_x05', name:'Templar Cipher Letter', type:'tablets', rarity:'epic', description:'A coded letter between Knights Templar commanders using an unknown cipher that references hidden treasure locations.', civilization:'Crusader', estimatedAge:'~1250 CE', carbonDateRange:[1230,1270], baseValue:5800 },
  { id:'tab_x06', name:'Crusader Medical Text', type:'tablets', rarity:'uncommon', description:'An Arabic-Latin bilingual medical treatise on wound treatment translated from Ibn Sina (Avicenna).', civilization:'Crusader', estimatedAge:'~1200 CE', carbonDateRange:[1180,1220], baseValue:680 },
  { id:'tab_x07', name:'Atlantean Energy Tablet', type:'tablets', rarity:'epic', description:'A crystalline tablet with etched circuit-like patterns that conduct energy when exposed to sunlight.', civilization:'Atlantean (unknown)', estimatedAge:'~9600 BCE', carbonDateRange:[-9800,-9400], baseValue:9000 },
  { id:'tab_x08', name:'Atlantean Star Chart', type:'tablets', rarity:'legendary', description:'A large crystal plate etched with star positions matching a precession cycle 12,000 years old, impossible for any known civilization.', civilization:'Atlantean (unknown)', estimatedAge:'~9600 BCE', carbonDateRange:[-9800,-9400], baseValue:28000 },
  { id:'tab_x09', name:'Atlantean Language Key', type:'tablets', rarity:'epic', description:'A trilingual inscription plate matching Atlantean glyphs with phonetic transliterations and images — a Rosetta Stone for Atlantis.', civilization:'Atlantean (unknown)', estimatedAge:'~9600 BCE', carbonDateRange:[-9800,-9400], baseValue:11000 },
  { id:'stat_x01', name:'Qin General Figure', type:'statues', rarity:'epic', description:'A terracotta figure of a high-ranking general with painted armor and a commanding pose, taller than common soldiers.', civilization:'Qin Dynasty Chinese', estimatedAge:'~210 BCE', carbonDateRange:[-230,-190], baseValue:6500 },
  { id:'stat_x02', name:'Crusader Effigy', type:'statues', rarity:'uncommon', description:'A limestone funerary effigy of a Crusader knight lying in repose, with crossed legs indicating participation in multiple crusades.', civilization:'Crusader', estimatedAge:'~1220 CE', carbonDateRange:[1200,1240], baseValue:880 },
  { id:'stat_x03', name:'Atlantean Sentinel', type:'statues', rarity:'legendary', description:'A life-sized crystalline humanoid figure with glowing ore deposits in its chest, possibly an ancient guardian automaton.', civilization:'Atlantean (unknown)', estimatedAge:'~9600 BCE', carbonDateRange:[-9800,-9400], baseValue:30000 },
  { id:'stat_x04', name:'Atlantean Cherubim', type:'statues', rarity:'epic', description:'A small winged figure carved from a single piece of luminous blue stone, its eyes following the viewer.', civilization:'Atlantean (unknown)', estimatedAge:'~9600 BCE', carbonDateRange:[-9800,-9400], baseValue:8000 },
  { id:'stat_x05', name:'Sea-God Bust', type:'statues', rarity:'rare', description:'A basalt bust of Poseidon-like deity with bioluminescent inclusions in the stone that glow under ultraviolet light.', civilization:'Atlantean (unknown)', estimatedAge:'~9600 BCE', carbonDateRange:[-9800,-9400], baseValue:3200 },
];

// ---------------------------------------------------------------------------
// Static Data — Tools
// ---------------------------------------------------------------------------

const DEFAULT_TOOLS: Tool[] = [
  { type:'trowel', name:'Archaeologist\'s Trowel', level:1, maxLevel:5, efficiency:0.6, precision:0.8, costPerUse:1, upgradeCost:200, description:'The essential hand tool for careful soil removal. Good precision, moderate speed.' },
  { type:'brush', name:'Soft-Bristle Brush', level:1, maxLevel:5, efficiency:0.3, precision:1.0, costPerUse:0, upgradeCost:150, description:'For delicate cleaning of exposed artifacts. Maximum preservation, minimal disturbance.' },
  { type:'shovel', name:'Expedition Shovel', level:1, maxLevel:5, efficiency:0.8, precision:0.3, costPerUse:2, upgradeCost:250, description:'Move large volumes of earth quickly. Low precision — risk of damaging artifacts.' },
  { type:'pickaxe', name:'Geologist\'s Pickaxe', level:1, maxLevel:5, efficiency:0.9, precision:0.2, costPerUse:3, upgradeCost:300, description:'Break through hard rock layers. Fast but hazardous for artifact preservation.' },
  { type:'metal_detector', name:'Electromagnetic Scanner', level:1, maxLevel:5, efficiency:0.5, precision:0.7, costPerUse:5, upgradeCost:500, description:'Detect metallic artifacts within a 3-tile radius before digging. Reduces guesswork.' },
  { type:'ground_radar', name:'Ground-Penetrating Radar', level:1, maxLevel:5, efficiency:0.4, precision:0.9, costPerUse:8, upgradeCost:800, description:'Reveal underground structures and artifact concentrations across a wide area.' },
];

// ---------------------------------------------------------------------------
// Static Data — Rivals
// ---------------------------------------------------------------------------

const DEFAULT_RIVALS: Rival[] = [
  { id:'rival_01', name:'Dr. Helena Croft', specialty:'Egyptology', aggression:0.7, preferredSites:['egyptian_pyramid','roman_colosseum'], currentSite:null, artifactsFound:42, reputation:85, portrait:'/rivals/helena.png', catchphrase:'The sand reveals all to those who wait.' },
  { id:'rival_02', name:'Prof. Viktor Petrov', specialty:'Classical Archaeology', aggression:0.5, preferredSites:['greek_acropolis','roman_colosseum'], currentSite:null, artifactsFound:38, reputation:80, portrait:'/rivals/viktor.png', catchphrase:'Every stone tells the story of empire.' },
  { id:'rival_03', name:'Dr. Amara Osei', specialty:'Sub-Saharan Civilizations', aggression:0.3, preferredSites:['medieval_castle','atlantis_ruins'], currentSite:null, artifactsFound:55, reputation:92, portrait:'/rivals/amara.png', catchphrase:'History belongs to no single narrative.' },
  { id:'rival_04', name:'Jasper Blackwood', specialty:'Treasure Hunting', aggression:0.9, preferredSites:['atlantis_ruins','mayan_temple'], currentSite:null, artifactsFound:28, reputation:45, portrait:'/rivals/jasper.png', catchphrase:'Finders keepers, professors weepers.' },
  { id:'rival_05', name:'Dr. Mei-Lin Chen', specialty:'East Asian Studies', aggression:0.4, preferredSites:['chinese_terracotta','viking_burial'], currentSite:null, artifactsFound:61, reputation:95, portrait:'/rivals/mei-lin.png', catchphrase:'The earth remembers what empires forget.' },
  { id:'rival_06', name:'Erik Bloodaxe Jr.', specialty:'Viking Archaeology', aggression:0.8, preferredSites:['viking_burial','medieval_castle'], currentSite:null, artifactsFound:33, reputation:65, portrait:'/rivals/erik.png', catchphrase:'My ancestors left more than runestones!' },
  { id:'rival_07', name:'Dr. Sofia Garcia', specialty:'Mesoamerican Studies', aggression:0.5, preferredSites:['mayan_temple','atlantis_ruins'], currentSite:null, artifactsFound:47, reputation:88, portrait:'/rivals/sofia.png', catchphrase:'The jungle grows over secrets, but never erases them.' },
  { id:'rival_08', name:'Sir Reginald Foss', specialty:'Medieval Studies', aggression:0.6, preferredSites:['medieval_castle','greek_acropolis'], currentSite:null, artifactsFound:36, reputation:72, portrait:'/rivals/reginald.png', catchphrase:'Chivalry is not dead — it\'s just buried.' },
];

// ---------------------------------------------------------------------------
// Static Data — Research Topics
// ---------------------------------------------------------------------------

const DEFAULT_RESEARCH: ResearchTopic[] = [
  { id:'res_01', name:'Stratigraphic Analysis', description:'Advanced layer identification techniques to predict artifact depth from surface surveys.', cost:500, duration:2, prerequisite:null, unlocks:'Improved depth scanning on dig grid', completed:false, progress:0 },
  { id:'res_02', name:'Ceramic Typology', description:'Systematic classification of pottery sherds to narrow dating windows and identify cultural origins.', cost:800, duration:3, prerequisite:'res_01', unlocks:'+15% pottery identification accuracy', completed:false, progress:0 },
  { id:'res_03', name:'Ground-Penetrating Radar v2', description:'Next-generation radar with 2x penetration depth and automatic anomaly classification.', cost:1500, duration:4, prerequisite:'res_01', unlocks:'Ground radar reveals 2-tile-deep structures', completed:false, progress:0 },
  { id:'res_04', name:'Carbon Dating Calibration', description:'Calibrate radiocarbon dates using dendrochronological cross-references for improved precision.', cost:1000, duration:3, prerequisite:'res_01', unlocks:'Carbon dating range narrowed by 40%', completed:false, progress:0 },
  { id:'res_05', name:'Metallurgical Analysis', description:'Portable XRF analysis of metal artifacts to determine composition and forge techniques.', cost:1200, duration:3, prerequisite:null, unlocks:'Weapon and jewelry bonuses during restoration', completed:false, progress:0 },
  { id:'res_06', name:'Epigraphy Deciphering', description:'Advanced techniques for reading faded inscriptions and reconstructing damaged text.', cost:1200, duration:4, prerequisite:'res_01', unlocks:'Tablet restoration speed doubled', completed:false, progress:0 },
  { id:'res_07', name:'Underwater Archaeology', description:'Specialized techniques for excavating submerged sites with silt removal and corrosion prevention.', cost:2000, duration:5, prerequisite:'res_03', unlocks:'Access to Atlantis deep layers', completed:false, progress:0 },
  { id:'res_08', name:'Remote Sensing Drones', description:'Deploy aerial drones for large-area surface surveys before selecting dig sites.', cost:2500, duration:4, prerequisite:'res_03', unlocks:'Daily dig site reveals bonus tiles', completed:false, progress:0 },
  { id:'res_09', name:'DNA Artifact Analysis', description:'Extract ancient DNA from organic artifacts to identify species, individuals, and trade routes.', cost:3000, duration:6, prerequisite:'res_04', unlocks:'Artifact lore reveals trade connection data', completed:false, progress:0 },
  { id:'res_10', name:'Quantum Dating Method', description:'Experimental quantum entanglement dating for unprecedented temporal precision on artifacts.', cost:5000, duration:8, prerequisite:'res_09', unlocks:'Legendary artifact dating pinpoints exact year', completed:false, progress:0 },
];

// ---------------------------------------------------------------------------
// Static Data — Achievements
// ---------------------------------------------------------------------------

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id:'ach_01', name:'First Find', description:'Discover your very first artifact.', condition:'totalArtifactsFound >= 1', unlocked:false, unlockedDate:null, reward:{ coins:100, xp:50, badge:'first-find' } },
  { id:'ach_02', name:'Hoarder', description:'Collect 10 artifacts in your inventory.', condition:'artifacts.length >= 10', unlocked:false, unlockedDate:null, reward:{ coins:500, xp:200, badge:'hoarder' } },
  { id:'ach_03', name:'Museum Curator', description:'Exhibit 5 artifacts in your museum.', condition:'exhibits.length >= 5', unlocked:false, unlockedDate:null, reward:{ coins:1000, xp:500, badge:'curator' } },
  { id:'ach_04', name:'Legendary Discovery', description:'Find a Legendary-rarity artifact.', condition:'legendaryCount >= 1', unlocked:false, unlockedDate:null, reward:{ coins:2000, xp:1000, badge:'legendary' } },
  { id:'ach_05', name:'Gentle Touch', description:'Achieve a preservation score of 100 in a single dig.', condition:'perfectDigsCount >= 1', unlocked:false, unlockedDate:null, reward:{ coins:300, xp:150, badge:'gentle-touch' } },
  { id:'ach_06', name:'World Traveler', description:'Visit all 8 excavation sites at least once.', condition:'totalSitesVisited >= 8', unlocked:false, unlockedDate:null, reward:{ coins:2000, xp:800, badge:'traveler' } },
  { id:'ach_07', name:'Research Pioneer', description:'Complete your first research topic.', condition:'researchCompleted >= 1', unlocked:false, unlockedDate:null, reward:{ coins:400, xp:300, badge:'pioneer' } },
  { id:'ach_08', name:'Tool Master', description:'Upgrade any tool to its maximum level.', condition:'anyToolMaxed === true', unlocked:false, unlockedDate:null, reward:{ coins:800, xp:400, badge:'tool-master' } },
  { id:'ach_09', name:'Deep Digger', description:'Reach the artifact layer in any site.', condition:'deepDigReached === true', unlocked:false, unlockedDate:null, reward:{ coins:600, xp:350, badge:'deep-digger' } },
  { id:'ach_10', name:'Expedition Expert', description:'Complete 5 expeditions successfully.', condition:'completedExpeditions >= 5', unlocked:false, unlockedDate:null, reward:{ coins:1500, xp:600, badge:'expeditioneer' } },
  { id:'ach_11', name:'Fossil Scholar', description:'Find artifacts from 5 different civilizations.', condition:'uniqueCivs >= 5', unlocked:false, unlockedDate:null, reward:{ coins:700, xp:400, badge:'scholar' } },
  { id:'ach_12', name:'Restoration Artist', description:'Fully restore 10 artifacts through all 3 phases.', condition:'fullyRestored >= 10', unlocked:false, unlockedDate:null, reward:{ coins:2000, xp:1000, badge:'restorer' } },
  { id:'ach_13', name:'Rival Conqueror', description:'Find more artifacts than any single rival.', condition:'beatARival === true', unlocked:false, unlockedDate:null, reward:{ coins:1000, xp:500, badge:'conqueror' } },
  { id:'ach_14', name:'Daily Devotee', description:'Complete the daily dig site 7 days in a row.', condition:'dailyStreak >= 7', unlocked:false, unlockedDate:null, reward:{ coins:500, xp:300, badge:'devotee' } },
  { id:'ach_15', name:'Master Archaeologist', description:'Reach archaeologist level 45.', condition:'level >= 45', unlocked:false, unlockedDate:null, reward:{ coins:10000, xp:5000, badge:'master-arch' } },
];

// ---------------------------------------------------------------------------
// Rarity multipliers
// ---------------------------------------------------------------------------

const RARITY_MULTIPLIER: Record<RarityTier, number> = {
  common: 1.0,
  uncommon: 1.5,
  rare: 2.5,
  epic: 5.0,
  legendary: 12.0,
};

const RARITY_WEIGHTS: Record<RarityTier, number> = {
  common: 50,
  uncommon: 28,
  rare: 14,
  epic: 6,
  legendary: 2,
};

const LAYER_HARDNESS: Record<DigLayer, number> = {
  topsoil: 1,
  clay: 2,
  sandstone: 3,
  limestone: 4,
  bedrock: 5,
  artifact_layer: 3,
};

const WEATHER_DIG_MODIFIER: Record<WeatherType, number> = {
  clear: 1.0,
  sandstorm: 0.5,
  rain: 0.7,
  heat: 0.6,
  fog: 0.85,
};

const WEATHER_PRESERVATION_PENALTY: Record<WeatherType, number> = {
  clear: 0,
  sandstorm: 15,
  rain: 10,
  heat: 8,
  fog: 3,
};

const TOOL_PRECISION_MAP: Record<ToolType, number> = {
  trowel: 0.8,
  brush: 1.0,
  shovel: 0.3,
  pickaxe: 0.2,
  metal_detector: 0.7,
  ground_radar: 0.9,
};

const XP_PER_LEVEL: number[] = [];
for (let i = 1; i <= 45; i++) {
  XP_PER_LEVEL.push(Math.floor(100 * Math.pow(1.12, i - 1)));
}

// ---------------------------------------------------------------------------
// Seeded PRNG (for reproducible daily / grid generation)
// ---------------------------------------------------------------------------

function createSeededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) / 4294967296);
  };
}

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

function dateSeed(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// ---------------------------------------------------------------------------
// State management
// ---------------------------------------------------------------------------

let state: ArchaeologyDigState | null = null;

function ensureInit(): ArchaeologyDigState {
  if (state) return state;
  state = createInitialState();
  return state;
}

function createInitialState(): ArchaeologyDigState {
  return {
    initialized: true,
    version: 1,
    archaeologistName: 'Dr. Anonymous',
    level: 1,
    xp: 0,
    xpToNextLevel: XP_PER_LEVEL[0] || 100,
    totalXP: 0,
    coins: 1000,
    currentSiteId: null,
    grid: [],
    selectedTool: 'trowel',
    digsRemaining: 0,
    maxDigsPerSession: 30,
    preservationScore: 100,
    artifacts: [],
    tools: DEFAULT_TOOLS.map(t => ({ ...t })),
    sites: EXCAVATION_SITES.map(s => ({ ...s })),
    exhibits: [],
    museumPrestige: 0,
    totalVisitors: 0,
    totalTickets: 0,
    researchTopics: DEFAULT_RESEARCH.map(r => ({ ...r })),
    researchPoints: 0,
    rivals: DEFAULT_RIVALS.map(r => ({ ...r })),
    tradeOffers: [],
    playerMarketListings: [],
    currentExpedition: null,
    completedExpeditions: 0,
    lastDailyDate: '',
    dailyDigsCompleted: 0,
    dailyBonusClaimed: false,
    currentWeather: 'clear',
    weatherDuration: 0,
    achievements: DEFAULT_ACHIEVEMENTS.map(a => ({ ...a })),
    achievementsUnlocked: 0,
    journal: [],
    totalArtifactsFound: 0,
    totalTilesDug: 0,
    totalSitesVisited: 0,
    legendaryCount: 0,
    rarePlusCount: 0,
    perfectDigsCount: 0,
    pendingGrants: [],
    grantCooldowns: { university_grant: 0, private_donor: 0, museum_purchase: 0, government_fund: 0 },
    donorCooldown: 0,
    abilityCharges: { 'keen_eye': 3, 'slow_dig': 2, 'preserve_burst': 1, 'lucky_strike': 1 },
    abilitiesUnlocked: ['keen_eye'],
  };
}

// ---------------------------------------------------------------------------
// Helper: weighted random pick
// ---------------------------------------------------------------------------

function weightedRandom<T>(items: T[], weights: number[], rng: () => number): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function pickRarity(rng: () => number): RarityTier {
  const tiers: RarityTier[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const weights = tiers.map(t => RARITY_WEIGHTS[t]);
  return weightedRandom(tiers, weights, rng);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function generateId(): string {
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Grid generation
// ---------------------------------------------------------------------------

function generateGrid(site: ExcavationSite, seed: number): DigTile[][] {
  const rng = createSeededRandom(seed);
  const grid: DigTile[][] = [];
  const layers: DigLayer[] = ['topsoil', 'clay', 'sandstone', 'limestone', 'bedrock', 'artifact_layer'];
  const dist = site.layerDistribution;

  // Normalize weights
  const totalWeight = layers.reduce((s, l) => s + dist[l], 0);
  const weights = layers.map(l => dist[l] / totalWeight);

  // Generate cumulative layer distribution per column
  for (let row = 0; row < site.gridSize; row++) {
    grid[row] = [];
    for (let col = 0; col < site.gridSize; col++) {
      let r = rng();
      let layer: DigLayer = 'topsoil';
      let cumulative = 0;
      for (let i = 0; i < layers.length; i++) {
        cumulative += weights[i];
        if (r <= cumulative) { layer = layers[i]; break; }
      }

      grid[row][col] = {
        row,
        col,
        revealed: false,
        layer,
        artifactId: null,
        fragility: layer === 'artifact_layer' ? 20 + rng() * 30 : 50 + rng() * 50,
      };
    }
  }

  // Place artifacts in artifact_layer tiles
  const artifactTiles = grid.flat().filter(t => t.layer === 'artifact_layer');
  const numArtifacts = Math.min(artifactTiles.length, 2 + Math.floor(rng() * 3));
  const shuffled = [...artifactTiles].sort(() => rng() - 0.5);
  for (let i = 0; i < numArtifacts; i++) {
    const tile = shuffled[i];
    const rarity = pickRarity(rng);
    const candidates = ARTIFACT_TEMPLATES.filter(
      a => a.rarity === rarity && site.artifactPool.includes(a.id)
    );
    const fallback = ARTIFACT_TEMPLATES.filter(a => site.artifactPool.includes(a.id));
    const pool = candidates.length > 0 ? candidates : fallback;
    if (pool.length > 0) {
      const template = pool[Math.floor(rng() * pool.length)];
      tile.artifactId = template.id;
      tile.fragility = 10 + rng() * 25;
    }
  }

  return grid;
}

// ---------------------------------------------------------------------------
// Artifact instantiation
// ---------------------------------------------------------------------------

function instantiateArtifact(template: ArtifactTemplate, siteId: string, preservation: number): Artifact {
  return {
    id: generateId(),
    name: template.name,
    type: template.type,
    rarity: template.rarity,
    description: template.description,
    civilization: template.civilization,
    estimatedAge: template.estimatedAge,
    carbonDateRange: [...template.carbonDateRange] as [number, number],
    baseValue: template.baseValue,
    restorationPhase: 'none',
    restorationProgress: 0,
    preservationScore: clamp(preservation, 0, 100),
    discoveredAt: siteId,
    discoveredDate: Date.now(),
    journalEntry: '',
    isExhibited: false,
    exhibitId: null,
  };
}

// ---------------------------------------------------------------------------
// Exported: State & Init
// ---------------------------------------------------------------------------

export function adGetState(): ArchaeologyDigState {
  return ensureInit();
}

export function adResetState(): void {
  state = null;
}

export function adLoadState(loaded: ArchaeologyDigState): void {
  state = loaded;
}

export function adExportState(): ArchaeologyDigState {
  return JSON.parse(JSON.stringify(ensureInit()));
}

export function adSetName(name: string): void {
  const s = ensureInit();
  s.archaeologistName = name;
}

// ---------------------------------------------------------------------------
// Exported: Level & XP
// ---------------------------------------------------------------------------

export function adGetLevel(): number {
  return ensureInit().level;
}

export function adGetXp(): number {
  return ensureInit().xp;
}

export function adGetXpToNext(): number {
  return ensureInit().xpToNextLevel;
}

export function adAddXP(amount: number): { leveledUp: boolean; newLevel: number } {
  const s = ensureInit();
  let leveledUp = false;
  s.xp += amount;
  s.totalXP += amount;
  while (s.level < 45 && s.xp >= s.xpToNextLevel) {
    s.xp -= s.xpToNextLevel;
    s.level++;
    s.xpToNextLevel = XP_PER_LEVEL[s.level - 1] || 999999;
    leveledUp = true;
    // Unlock abilities at certain levels
    if (s.level === 5 && !s.abilitiesUnlocked.includes('slow_dig')) s.abilitiesUnlocked.push('slow_dig');
    if (s.level === 10 && !s.abilitiesUnlocked.includes('preserve_burst')) s.abilitiesUnlocked.push('preserve_burst');
    if (s.level === 20 && !s.abilitiesUnlocked.includes('lucky_strike')) s.abilitiesUnlocked.push('lucky_strike');
    if (s.level === 30) s.maxDigsPerSession = 45;
    if (s.level === 40) s.maxDigsPerSession = 60;
  }
  return { leveledUp, newLevel: s.level };
}

export function adGetCoins(): number {
  return ensureInit().coins;
}

export function adAddCoins(amount: number): void {
  ensureInit().coins += amount;
}

export function adSpendCoins(amount: number): boolean {
  const s = ensureInit();
  if (s.coins < amount) return false;
  s.coins -= amount;
  return true;
}

// ---------------------------------------------------------------------------
// Exported: Sites
// ---------------------------------------------------------------------------

export function adGetSites(): ExcavationSite[] {
  return ensureInit().sites;
}

export function adGetSite(siteId: string): ExcavationSite | null {
  return ensureInit().sites.find(s => s.id === siteId) ?? null;
}

export function adUnlockSite(siteId: string): boolean {
  const s = ensureInit();
  const site = s.sites.find(x => x.id === siteId);
  if (!site || site.unlocked || s.coins < site.unlockCost) return false;
  s.coins -= site.unlockCost;
  site.unlocked = true;
  return true;
}

// ---------------------------------------------------------------------------
// Exported: Dig mechanics
// ---------------------------------------------------------------------------

export function adStartDig(siteId: string): boolean {
  const s = ensureInit();
  const site = s.sites.find(x => x.id === siteId);
  if (!site || !site.unlocked) return false;

  s.currentSiteId = siteId;
  s.digsRemaining = s.maxDigsPerSession;
  s.preservationScore = 100;
  s.grid = generateGrid(site, Date.now());

  // Track site visits using the journal as marker
  const visitKey = `_visited_${siteId}`;
  if (!(s as any)[visitKey]) {
    s.totalSitesVisited++;
    (s as any)[visitKey] = true;
  }

  return true;
}

export function adGetGrid(): DigTile[][] {
  return ensureInit().grid;
}

export function adSelectTool(tool: ToolType): void {
  const s = ensureInit();
  if (s.tools.find(t => t.type === tool)) {
    s.selectedTool = tool;
  }
}

export function adGetSelectedTool(): ToolType {
  return ensureInit().selectedTool;
}

export function adDig(row: number, col: number): DigResult {
  const s = ensureInit();
  if (!s.currentSiteId || s.digsRemaining <= 0) {
    return { success: false, reason: s.digsRemaining <= 0 ? 'no_digs' : 'no_site' };
  }
  if (row < 0 || row >= s.grid.length || col < 0 || col >= (s.grid[0]?.length ?? 0)) {
    return { success: false, reason: 'out_of_bounds' };
  }
  const tile = s.grid[row][col];
  if (tile.revealed) {
    return { success: false, reason: 'already_revealed' };
  }

  const tool = s.tools.find(t => t.type === s.selectedTool)!;
  const hardness = LAYER_HARDNESS[tile.layer];
  const weatherMod = WEATHER_DIG_MODIFIER[s.currentWeather];

  // Energy cost: harder layers cost more
  const baseCost = hardness;
  const toolEfficiency = tool.efficiency;
  const effectiveCost = Math.ceil(baseCost / Math.max(toolEfficiency, 0.1));

  if (effectiveCost > s.digsRemaining) {
    return { success: false, reason: 'insufficient_digs' };
  }

  s.digsRemaining -= effectiveCost;
  s.totalTilesDug++;
  tile.revealed = true;

  // Preservation calculation
  const precision = tool.precision * weatherMod;
  const fragilityFactor = tile.fragility / 100;
  const preservationLoss = (1 - precision) * fragilityFactor * 40;
  const weatherPenalty = WEATHER_PRESERVATION_PENALTY[s.currentWeather] / 100 * 10;
  s.preservationScore = clamp(s.preservationScore - preservationLoss - weatherPenalty, 0, 100);

  // XP for digging
  adAddXP(Math.floor(5 + hardness * 3));

  // Check if artifact found
  let foundArtifact: Artifact | null = null;
  if (tile.artifactId) {
    const template = ARTIFACT_TEMPLATES.find(a => a.id === tile.artifactId);
    if (template) {
      foundArtifact = instantiateArtifact(template, s.currentSiteId, s.preservationScore);
      s.artifacts.push(foundArtifact);
      s.totalArtifactsFound++;

      if (foundArtifact.rarity === 'legendary') s.legendaryCount++;
      if (['rare', 'epic', 'legendary'].includes(foundArtifact.rarity)) s.rarePlusCount++;

      const xpBonus = Math.floor(template.baseValue / 10) * RARITY_MULTIPLIER[template.rarity];
      adAddXP(xpBonus);
      adAddCoins(Math.floor(template.baseValue * 0.3));

      // Auto journal entry
      adAddJournalEntry(
        'Discovery',
        `Uncovered "${foundArtifact.name}" (${foundArtifact.rarity}) at the dig site. Preservation: ${Math.round(s.preservationScore)}%.`,
        [foundArtifact.type, foundArtifact.rarity, foundArtifact.civilization]
      );
    }
  }

  if (s.preservationScore === 100 && tile.layer !== 'topsoil') {
    // Track perfect digs (no loss after non-topsoil)
  }

  return {
    success: true,
    tile,
    artifact: foundArtifact,
    preservationScore: s.preservationScore,
    digsRemaining: s.digsRemaining,
    layerRevealed: tile.layer,
  };
}

export function adEndDig(): DigSessionSummary {
  const s = ensureInit();
  const summary: DigSessionSummary = {
    siteId: s.currentSiteId ?? '',
    tilesDug: s.totalTilesDug,
    preservationScore: s.preservationScore,
    coinsEarned: 0,
    xpEarned: 0,
    artifactsFound: [],
    wasPerfect: s.preservationScore === 100,
  };

  if (s.preservationScore === 100 && s.totalTilesDug > 0) {
    s.perfectDigsCount++;
    s.coins += 500;
    summary.coinsEarned += 500;
  }

  // Bonus for completing a dig
  const sessionArtifacts = s.artifacts.filter(a => a.discoveredAt === s.currentSiteId && a.discoveredDate > Date.now() - 3600000);
  summary.artifactsFound = sessionArtifacts;

  s.currentSiteId = null;
  s.grid = [];

  return summary;
}

export function adGetDigsRemaining(): number {
  return ensureInit().digsRemaining;
}

export function adGetPreservationScore(): number {
  return ensureInit().preservationScore;
}

// ---------------------------------------------------------------------------
// Exported: Tools
// ---------------------------------------------------------------------------

export function adGetTools(): Tool[] {
  return ensureInit().tools;
}

export function adUpgradeTool(toolType: ToolType): boolean {
  const s = ensureInit();
  const tool = s.tools.find(t => t.type === toolType);
  if (!tool || tool.level >= tool.maxLevel || s.coins < tool.upgradeCost) return false;
  s.coins -= tool.upgradeCost;
  tool.level++;
  tool.efficiency = clamp(tool.efficiency + 0.08, 0, 1);
  tool.precision = clamp(tool.precision + 0.06, 0, 1);
  tool.upgradeCost = Math.floor(tool.upgradeCost * 1.8);
  return true;
}

// ---------------------------------------------------------------------------
// Exported: Artifacts
// ---------------------------------------------------------------------------

export function adGetArtifacts(): Artifact[] {
  return ensureInit().artifacts;
}

export function adGetArtifact(artifactId: string): Artifact | null {
  return ensureInit().artifacts.find(a => a.id === artifactId) ?? null;
}

export function adGetArtifactsByType(type: ArtifactType): Artifact[] {
  return ensureInit().artifacts.filter(a => a.type === type);
}

export function adGetArtifactsByRarity(rarity: RarityTier): Artifact[] {
  return ensureInit().artifacts.filter(a => a.rarity === rarity);
}

export function adGetArtifactValue(artifactId: string): number {
  const a = ensureInit().artifacts.find(x => x.id === artifactId);
  if (!a) return 0;
  const restBonus = a.restorationPhase === 'none' ? 1 :
    a.restorationPhase === 'cleaning' ? 1.2 :
    a.restorationPhase === 'repairing' ? 1.5 :
    2.0;
  const presBonus = a.preservationScore / 100;
  return Math.floor(a.baseValue * RARITY_MULTIPLIER[a.rarity] * restBonus * presBonus);
}

export function adRemoveArtifact(artifactId: string): boolean {
  const s = ensureInit();
  const idx = s.artifacts.findIndex(a => a.id === artifactId);
  if (idx === -1) return false;
  s.artifacts.splice(idx, 1);
  return true;
}

// ---------------------------------------------------------------------------
// Exported: Carbon Dating
// ---------------------------------------------------------------------------

export function adCarbonDate(artifactId: string): CarbonDateResult {
  const s = ensureInit();
  const artifact = s.artifacts.find(a => a.id === artifactId);
  if (!artifact) return { error: 'Artifact not found' };

  const hasResearch = s.researchTopics.find(r => r.id === 'res_04')?.completed;
  const hasQuantum = s.researchTopics.find(r => r.id === 'res_10')?.completed;

  const [start, end] = artifact.carbonDateRange;
  const range = end - start;

  let precision: 'low' | 'medium' | 'high' | 'exact';
  let estimatedYear: number;
  let margin: number;

  if (hasQuantum && artifact.rarity === 'legendary') {
    precision = 'exact';
    estimatedYear = Math.round((start + end) / 2);
    margin = 1;
  } else if (hasResearch) {
    precision = 'high';
    estimatedYear = Math.round((start + end) / 2);
    margin = Math.max(1, Math.floor(range * 0.3));
  } else {
    precision = 'medium';
    estimatedYear = Math.round((start + end) / 2);
    margin = Math.max(1, Math.floor(range * 0.5));
  }

  return {
    artifactId,
    artifactName: artifact.name,
    civilization: artifact.civilization,
    estimatedYear,
    marginOfError: margin,
    precision,
    bceRange: [start, end] as [number, number],
    confidence: precision === 'exact' ? 99 : precision === 'high' ? 90 : precision === 'medium' ? 75 : 55,
    valueAdjustment: precision === 'exact' ? 1.5 : precision === 'high' ? 1.2 : 1.0,
  };
}

// ---------------------------------------------------------------------------
// Exported: Restoration
// ---------------------------------------------------------------------------

export function adGetRestorationPhase(artifactId: string): RestorationPhase {
  return ensureInit().artifacts.find(a => a.id === artifactId)?.restorationPhase ?? 'none';
}

export function adStartRestoration(artifactId: string): boolean {
  const s = ensureInit();
  const artifact = s.artifacts.find(a => a.id === artifactId);
  if (!artifact || artifact.restorationPhase !== 'none') return false;
  artifact.restorationPhase = 'cleaning';
  artifact.restorationProgress = 0;
  return true;
}

export function adAdvanceRestoration(artifactId: string, puzzleScore: number): RestorationResult {
  const s = ensureInit();
  const artifact = s.artifacts.find(a => a.id === artifactId);
  if (!artifact || artifact.restorationPhase === 'none') {
    return { success: false, message: 'No restoration in progress.' };
  }

  const phaseProgress = clamp(puzzleScore, 0, 100);
  artifact.restorationProgress += phaseProgress * 0.4;

  const hasTabletResearch = s.researchTopics.find(r => r.id === 'res_06')?.completed;
  if (hasTabletResearch && artifact.type === 'tablets') {
    artifact.restorationProgress += phaseProgress * 0.2;
  }

  if (artifact.restorationProgress >= 100) {
    artifact.restorationProgress = 100;
    if (artifact.restorationPhase === 'cleaning') {
      artifact.restorationPhase = 'repairing';
      artifact.restorationProgress = 0;
      adAddXP(50);
      return { success: true, phase: 'repairing', message: 'Cleaning complete! Artifact is ready for repair.' };
    } else if (artifact.restorationPhase === 'repairing') {
      artifact.restorationPhase = 'assembling';
      artifact.restorationProgress = 0;
      adAddXP(100);
      return { success: true, phase: 'assembling', message: 'Repairs complete! Final assembly phase begins.' };
    } else if (artifact.restorationPhase === 'assembling') {
      artifact.restorationPhase = 'none';
      artifact.restorationProgress = 100;
      adAddXP(200);
      adAddCoins(Math.floor(artifact.baseValue * 0.5));
      adAddJournalEntry(
        'Restoration',
        `"${artifact.name}" has been fully restored and is ready for exhibition.`,
        ['restoration', 'complete']
      );
      return { success: true, phase: 'complete', message: `${artifact.name} is fully restored!` };
    }
  }

  return {
    success: true,
    phase: artifact.restorationPhase,
    progress: artifact.restorationProgress,
    message: `Restoration progress: ${Math.floor(artifact.restorationProgress)}%`,
  };
}

export function adIsFullyRestored(artifactId: string): boolean {
  const a = ensureInit().artifacts.find(x => x.id === artifactId);
  return a !== undefined && a.restorationPhase === 'none' && a.restorationProgress === 100;
}

// ---------------------------------------------------------------------------
// Exported: Museum
// ---------------------------------------------------------------------------

export function adExhibitArtifact(artifactId: string): boolean {
  const s = ensureInit();
  const artifact = s.artifacts.find(a => a.id === artifactId);
  if (!artifact || artifact.isExhibited || artifact.restorationProgress < 100) return false;

  const exhibit: Exhibit = {
    id: generateId(),
    artifactId,
    startDate: Date.now(),
    visitors: 0,
    ticketsEarned: 0,
    prestige: 0,
    isActive: true,
  };

  artifact.isExhibited = true;
  artifact.exhibitId = exhibit.id;
  s.exhibits.push(exhibit);

  // Calculate prestige based on rarity and preservation
  const rarityPrestige = { common: 5, uncommon: 10, rare: 25, epic: 50, legendary: 100 };
  exhibit.prestige = rarityPrestige[artifact.rarity] * (artifact.preservationScore / 100);
  s.museumPrestige += exhibit.prestige;

  adAddJournalEntry(
    'Museum',
    `"${artifact.name}" (${artifact.rarity}) is now on display in the museum. Prestige: +${Math.round(exhibit.prestige)}`,
    ['museum', 'exhibition', artifact.rarity]
  );

  return true;
}

export function adRemoveExhibit(exhibitId: string): boolean {
  const s = ensureInit();
  const exhibit = s.exhibits.find(e => e.id === exhibitId);
  if (!exhibit) return false;
  const artifact = s.artifacts.find(a => a.id === exhibit.artifactId);
  if (artifact) {
    artifact.isExhibited = false;
    artifact.exhibitId = null;
  }
  s.museumPrestige = Math.max(0, s.museumPrestige - exhibit.prestige);
  s.exhibits = s.exhibits.filter(e => e.id !== exhibitId);
  return true;
}

export function adGetExhibits(): Exhibit[] {
  return ensureInit().exhibits;
}

export function adGetMuseumStats(): MuseumStats {
  const s = ensureInit();
  return {
    totalExhibits: s.exhibits.length,
    prestige: s.museumPrestige,
    totalVisitors: s.totalVisitors,
    totalTickets: s.totalTickets,
  };
}

export function adSimulateMuseumDay(): MuseumDayResult {
  const s = ensureInit();
  const activeExhibits = s.exhibits.filter(e => e.isActive);
  const baseVisitors = 10 + Math.floor(s.museumPrestige * 0.5);
  let dayVisitors = 0;
  let dayTickets = 0;

  for (const exhibit of activeExhibits) {
    const artifact = s.artifacts.find(a => a.id === exhibit.artifactId);
    if (!artifact) continue;
    const rarityMultiplier = RARITY_MULTIPLIER[artifact.rarity];
    const visitors = Math.floor(baseVisitors * rarityMultiplier * 0.1 * (Math.random() * 0.5 + 0.75));
    exhibit.visitors += visitors;
    dayVisitors += visitors;
    const tickets = Math.floor(visitors * 0.3);
    exhibit.ticketsEarned += tickets;
    dayTickets += tickets;
  }

  s.totalVisitors += dayVisitors;
  s.totalTickets += dayTickets;
  const coinIncome = dayTickets * 5;
  s.coins += coinIncome;

  return { dayVisitors, dayTickets, coinIncome };
}

// ---------------------------------------------------------------------------
// Exported: Research
// ---------------------------------------------------------------------------

export function adGetResearchTopics(): ResearchTopic[] {
  return ensureInit().researchTopics;
}

export function adStartResearch(topicId: string): boolean {
  const s = ensureInit();
  const topic = s.researchTopics.find(r => r.id === topicId);
  if (!topic || topic.completed || topic.progress > 0) return false;
  if (topic.prerequisite) {
    const prereq = s.researchTopics.find(r => r.id === topic.prerequisite);
    if (!prereq || !prereq.completed) return false;
  }
  if (s.researchPoints < topic.cost) return false;
  s.researchPoints -= topic.cost;
  topic.progress = 1;
  return true;
}

export function adAdvanceResearch(topicId: string): ResearchAdvanceResult {
  const s = ensureInit();
  const topic = s.researchTopics.find(r => r.id === topicId);
  if (!topic || topic.completed) return { success: false, message: 'Research not available.' };

  topic.progress = Math.min(100, topic.progress + Math.floor(100 / topic.duration));
  if (topic.progress >= 100) {
    topic.completed = true;
    topic.progress = 100;
    adAddXP(200);
    adAddJournalEntry(
      'Research',
      `Research completed: "${topic.name}" — ${topic.unlocks}`,
      ['research', 'completed']
    );
    return { success: true, completed: true, message: topic.unlocks };
  }

  return { success: true, completed: false, progress: topic.progress, message: `Research progress: ${topic.progress}%` };
}

export function adAddResearchPoints(points: number): void {
  ensureInit().researchPoints += points;
}

export function adGetResearchPoints(): number {
  return ensureInit().researchPoints;
}

// ---------------------------------------------------------------------------
// Exported: Expeditions
// ---------------------------------------------------------------------------

export function adStartExpedition(siteId: string): boolean {
  const s = ensureInit();
  if (s.currentExpedition) return false;
  const site = s.sites.find(x => x.id === siteId);
  if (!site || !site.unlocked) return false;

  s.currentExpedition = {
    siteId,
    day: 1,
    maxDays: 5 + site.difficulty * 2,
    energy: 100,
    maxEnergy: 100,
    supplies: 50,
    maxSupplies: 100,
    funding: 500,
    tilesDug: 0,
    artifactsFound: [],
    completed: false,
    reward: { coins: 0, xp: 0, artifacts: [] },
  };

  // Generate expedition grid
  s.grid = generateGrid(site, Date.now() + 12345);
  s.currentSiteId = siteId;

  return true;
}

export function adAdvanceExpedition(): ExpeditionDayResult {
  const s = ensureInit();
  const exp = s.currentExpedition;
  if (!exp || exp.completed) return { success: false, message: 'No active expedition.' };

  // Daily costs
  exp.energy = Math.max(0, exp.energy - 20);
  exp.supplies = Math.max(0, exp.supplies - 15);
  exp.funding = Math.max(0, exp.funding - 50);

  if (exp.energy <= 0 || exp.supplies <= 0 || exp.funding <= 0) {
    exp.completed = true;
    const coinsEarned = Math.floor(exp.tilesDug * 10 + exp.artifactsFound.length * 200);
    exp.reward.coins = coinsEarned;
    exp.reward.xp = exp.tilesDug * 5 + exp.artifactsFound.length * 100;
    adAddXP(exp.reward.xp);
    adAddCoins(coinsEarned);
    s.completedExpeditions++;
    s.currentExpedition = null;
    s.currentSiteId = null;
    s.grid = [];
    return { success: true, completed: true, reason: 'resources_depleted', reward: exp.reward };
  }

  exp.day++;

  if (exp.day > exp.maxDays) {
    exp.completed = true;
    const coinsEarned = Math.floor(exp.tilesDug * 15 + exp.artifactsFound.length * 300 + exp.funding);
    const xpEarned = exp.tilesDug * 8 + exp.artifactsFound.length * 150 + 200;
    exp.reward = { coins: coinsEarned, xp: xpEarned, artifacts: [...exp.artifactsFound] };
    adAddXP(xpEarned);
    adAddCoins(coinsEarned);
    s.completedExpeditions++;
    s.currentExpedition = null;
    s.currentSiteId = null;
    s.grid = [];
    return { success: true, completed: true, reason: 'time_complete', reward: exp.reward };
  }

  // Random events during expedition
  const rng = createSeededRandom(Date.now());
  let event: string | null = null;
  if (rng() < 0.2) {
    exp.supplies = Math.min(exp.maxSupplies, exp.supplies + 10);
    event = 'supply_cache';
  } else if (rng() < 0.15) {
    exp.energy = Math.min(exp.maxEnergy, exp.energy + 15);
    event = 'rest_camp';
  } else if (rng() < 0.1) {
    exp.energy = Math.max(0, exp.energy - 10);
    event = 'sandstorm_hit';
  }

  return {
    success: true,
    completed: false,
    day: exp.day,
    energy: exp.energy,
    supplies: exp.supplies,
    funding: exp.funding,
    event,
    tilesDug: exp.tilesDug,
    artifactsFound: exp.artifactsFound.length,
  };
}

export function adExpeditionDig(row: number, col: number): DigResult {
  const s = ensureInit();
  if (!s.currentExpedition) return { success: false, reason: 'no_expedition' };

  const result = adDig(row, col);
  if (result.success && s.currentExpedition) {
    s.currentExpedition.tilesDug++;
    if (result.artifact) {
      s.currentExpedition.artifactsFound.push(result.artifact.id);
    }
  }
  return result;
}

export function adGetExpedition(): ExpeditionState | null {
  return ensureInit().currentExpedition;
}

export function adRestockExpedition(): boolean {
  const s = ensureInit();
  if (!s.currentExpedition || s.coins < 200) return false;
  s.coins -= 200;
  s.currentExpedition.supplies = Math.min(s.currentExpedition.maxSupplies, s.currentExpedition.supplies + 30);
  s.currentExpedition.energy = Math.min(s.currentExpedition.maxEnergy, s.currentExpedition.energy + 20);
  return true;
}

// ---------------------------------------------------------------------------
// Exported: Funding
// ---------------------------------------------------------------------------

export function adApplyForGrant(source: FundingSourceType): GrantResult {
  const s = ensureInit();
  const now = Date.now();
  const cooldown = s.grantCooldowns[source] || 0;
  if (now < cooldown) {
    return { success: false, message: `Grant cooldown active. Retry in ${Math.ceil((cooldown - now) / 86400000)} days.`, cooldownEnd: cooldown };
  }

  const amounts: Record<FundingSourceType, [number, number]> = {
    university_grant: [500, 2000],
    private_donor: [1000, 5000],
    museum_purchase: [2000, 8000],
    government_fund: [3000, 10000],
  };

  const rng = createSeededRandom(now);
  const [min, max] = amounts[source];
  const amount = Math.floor(rng() * (max - min) + min);

  const successChance = source === 'university_grant' ? 0.8 :
    source === 'private_donor' ? 0.6 :
    source === 'museum_purchase' ? 0.4 : 0.3;

  if (rng() > successChance) {
    s.grantCooldowns[source] = now + 86400000;
    return { success: false, message: 'Application denied. Try again tomorrow.', cooldownEnd: now + 86400000 };
  }

  s.coins += amount;
  s.grantCooldowns[source] = now + 86400000 * 3;

  adAddJournalEntry('Funding', `Received ${amount} coins from ${source.replace(/_/g, ' ')}.`, ['funding', 'income']);

  return { success: true, message: `Grant of ${amount} coins approved from ${source.replace(/_/g, ' ')}.`, amount, source, cooldownEnd: now + 86400000 * 3 };
}

export function adGetGrantCooldowns(): Record<FundingSourceType, number> {
  return ensureInit().grantCooldowns;
}

// ---------------------------------------------------------------------------
// Exported: Rivals
// ---------------------------------------------------------------------------

export function adGetRivals(): Rival[] {
  return ensureInit().rivals;
}

export function adCheckRivalActivity(): RivalActivity[] {
  const s = ensureInit();
  const rng = createSeededRandom(Date.now());
  const activities: RivalActivity[] = [];

  for (const rival of s.rivals) {
    if (rng() < rival.aggression * 0.3) {
      const site = rival.preferredSites[Math.floor(rng() * rival.preferredSites.length)];
      rival.currentSite = site;

      const foundArtifact = rng() < 0.3;
      if (foundArtifact) rival.artifactsFound++;

      activities.push({
        rivalId: rival.id,
        rivalName: rival.name,
        action: foundArtifact ? 'found_artifact' : 'excavating',
        siteId: site,
        catchphrase: foundArtifact ? rival.catchphrase : null,
      });
    }
  }

  return activities;
}

export function adCompareWithRivals(): RivalComparison[] {
  const s = ensureInit();
  return s.rivals.map(r => ({
    rivalId: r.id,
    rivalName: r.name,
    rivalArtifacts: r.artifactsFound,
    rivalReputation: r.reputation,
    playerArtifacts: s.totalArtifactsFound,
    playerAhead: s.totalArtifactsFound > r.artifactsFound,
  }));
}

// ---------------------------------------------------------------------------
// Exported: Trading
// ---------------------------------------------------------------------------

export function adGenerateTradeOffers(): TradeOffer[] {
  const s = ensureInit();
  const rng = createSeededRandom(Date.now());
  const offers: TradeOffer[] = [];

  const collectors = ['Antiquities Inc.', 'Private Collector Liu', 'The British Collection', 'Museum of Natural History', 'Dr. Blackwood\'s Vault'];
  const rarityPool: RarityTier[] = ['common', 'uncommon', 'rare', 'epic'];

  for (let i = 0; i < 5; i++) {
    const rarity = rarityPool[Math.floor(rng() * rarityPool.length)];
    const candidates = ARTIFACT_TEMPLATES.filter(a => a.rarity === rarity);
    if (candidates.length === 0) continue;
    const template = candidates[Math.floor(rng() * candidates.length)];

    offers.push({
      id: generateId(),
      sellerName: collectors[Math.floor(rng() * collectors.length)],
      artifactName: template.name,
      askingPrice: Math.floor(template.baseValue * RARITY_MULTIPLIER[rarity] * (0.8 + rng() * 0.6)),
      rarity,
      expiresInDays: 3 + Math.floor(rng() * 5),
    });
  }

  s.tradeOffers = offers;
  return offers;
}

export function adGetTradeOffers(): TradeOffer[] {
  return ensureInit().tradeOffers;
}

export function adBuyTradeOffer(offerId: string): TradeResult {
  const s = ensureInit();
  const offer = s.tradeOffers.find(o => o.id === offerId);
  if (!offer) return { success: false, message: 'Offer not found.' };
  if (s.coins < offer.askingPrice) return { success: false, message: 'Insufficient coins.' };

  s.coins -= offer.askingPrice;
  const template = ARTIFACT_TEMPLATES.find(t => t.name === offer.artifactName);
  if (template) {
    const artifact = instantiateArtifact(template, 'trade', 70 + Math.random() * 20);
    artifact.journalEntry = `Purchased from ${offer.sellerName} for ${offer.askingPrice} coins.`;
    s.artifacts.push(artifact);
    s.totalArtifactsFound++;
  }

  s.tradeOffers = s.tradeOffers.filter(o => o.id !== offerId);
  return { success: true, message: `Purchased ${offer.artifactName} for ${offer.askingPrice} coins.` };
}

export function adCreateListing(artifactId: string, price: number): boolean {
  const s = ensureInit();
  const artifact = s.artifacts.find(a => a.id === artifactId);
  if (!artifact || artifact.isExhibited) return false;

  s.playerMarketListings.push({
    id: generateId(),
    sellerName: s.archaeologistName,
    artifactName: artifact.name,
    askingPrice: price,
    rarity: artifact.rarity,
    expiresInDays: 7,
  });

  return true;
}

export function adGetPlayerListings(): TradeOffer[] {
  return ensureInit().playerMarketListings;
}

// ---------------------------------------------------------------------------
// Exported: Daily Dig
// ---------------------------------------------------------------------------

export function adGetDailyDigSite(): DailyDigResult {
  const s = ensureInit();
  const today = dateSeed();

  if (s.lastDailyDate !== today) {
    s.lastDailyDate = today;
    s.dailyDigsCompleted = 0;
    s.dailyBonusClaimed = false;
  }

  const seed = hashString(today);
  const rng = createSeededRandom(seed);
  const unlockedSites = s.sites.filter(site => site.unlocked);
  const dailySite = unlockedSites[Math.floor(rng() * unlockedSites.length)];
  const bonusRarityChance = rng() < 0.2 ? 'rare' : rng() < 0.4 ? 'uncommon' : 'common';
  const bonusReward = Math.floor(200 + rng() * 800);

  return {
    siteId: dailySite.id,
    siteName: dailySite.name,
    digsRemaining: 15 - s.dailyDigsCompleted,
    bonusRarityChance,
    bonusReward,
    date: today,
    completed: s.dailyDigsCompleted >= 15,
    bonusClaimed: s.dailyBonusClaimed,
  };
}

export function adDigDaily(row: number, col: number): DigResult {
  const s = ensureInit();
  const daily = adGetDailyDigSite();
  if (daily.completed) return { success: false, reason: 'daily_complete' };

  if (!s.currentSiteId || s.currentSiteId !== daily.siteId) {
    adStartDig(daily.siteId);
    s.maxDigsPerSession = 15 - s.dailyDigsCompleted;
  }

  const result = adDig(row, col);
  if (result.success) {
    s.dailyDigsCompleted++;
    s.maxDigsPerSession = 15 - s.dailyDigsCompleted;
    s.digsRemaining = s.maxDigsPerSession - (s.maxDigsPerSession - s.digsRemaining);
  }

  return result;
}

export function adClaimDailyBonus(): DailyBonusResult {
  const s = ensureInit();
  const daily = adGetDailyDigSite();
  if (s.dailyBonusClaimed || s.dailyDigsCompleted < 10) {
    return { success: false, message: s.dailyBonusClaimed ? 'Bonus already claimed.' : 'Complete at least 10 daily digs first.' };
  }

  s.dailyBonusClaimed = true;
  const bonusXP = 300;
  const bonusCoins = daily.bonusReward;
  adAddXP(bonusXP);
  adAddCoins(bonusCoins);

  return { success: true, xp: bonusXP, coins: bonusCoins };
}

// ---------------------------------------------------------------------------
// Exported: Weather
// ---------------------------------------------------------------------------

export function adGetWeather(): WeatherType {
  return ensureInit().currentWeather;
}

export function adSetWeather(weather: WeatherType): void {
  const s = ensureInit();
  s.currentWeather = weather;
  s.weatherDuration = 3;
}

export function adAdvanceWeather(): WeatherTransition {
  const s = ensureInit();
  const oldWeather = s.currentWeather;
  s.weatherDuration--;

  if (s.weatherDuration <= 0) {
    const weathers: WeatherType[] = ['clear', 'clear', 'clear', 'sandstorm', 'rain', 'heat', 'fog'];
    const rng = createSeededRandom(Date.now());
    s.currentWeather = weathers[Math.floor(rng() * weathers.length)];
    s.weatherDuration = 2 + Math.floor(rng() * 3);
  }

  return {
    previous: oldWeather,
    current: s.currentWeather,
    duration: s.weatherDuration,
    digModifier: WEATHER_DIG_MODIFIER[s.currentWeather],
    preservationPenalty: WEATHER_PRESERVATION_PENALTY[s.currentWeather],
  };
}

export function adGetWeatherEffects(): WeatherEffectInfo {
  const s = ensureInit();
  return {
    weather: s.currentWeather,
    duration: s.weatherDuration,
    digSpeedModifier: WEATHER_DIG_MODIFIER[s.currentWeather],
    preservationPenalty: WEATHER_PRESERVATION_PENALTY[s.currentWeather],
  };
}

// ---------------------------------------------------------------------------
// Exported: Achievements
// ---------------------------------------------------------------------------

export function adGetAchievements(): Achievement[] {
  return ensureInit().achievements;
}

export function adCheckAchievements(): Achievement[] {
  const s = ensureInit();
  const newlyUnlocked: Achievement[] = [];

  const check = (ach: Achievement): boolean => {
    if (ach.unlocked) return false;
    switch (ach.id) {
      case 'ach_01': return s.totalArtifactsFound >= 1;
      case 'ach_02': return s.artifacts.length >= 10;
      case 'ach_03': return s.exhibits.length >= 5;
      case 'ach_04': return s.legendaryCount >= 1;
      case 'ach_05': return s.perfectDigsCount >= 1;
      case 'ach_06': return s.totalSitesVisited >= 8;
      case 'ach_07': return s.researchTopics.filter(r => r.completed).length >= 1;
      case 'ach_08': return s.tools.some(t => t.level >= t.maxLevel);
      case 'ach_09': {
        const hasDeep = s.grid.flat().some(t => t.revealed && t.layer === 'artifact_layer');
        return hasDeep || s.legendaryCount >= 1;
      }
      case 'ach_10': return s.completedExpeditions >= 5;
      case 'ach_11': {
        const civs = new Set(s.artifacts.map(a => a.civilization));
        return civs.size >= 5;
      }
      case 'ach_12': return s.artifacts.filter(a => a.restorationProgress === 100 && a.restorationPhase === 'none').length >= 10;
      case 'ach_13': return s.rivals.some(r => s.totalArtifactsFound > r.artifactsFound);
      case 'ach_14': return s.dailyDigsCompleted >= 15 && s.dailyBonusClaimed;
      case 'ach_15': return s.level >= 45;
      default: return false;
    }
  };

  for (const ach of s.achievements) {
    if (check(ach)) {
      ach.unlocked = true;
      ach.unlockedDate = Date.now();
      s.achievementsUnlocked++;
      adAddXP(ach.reward.xp);
      adAddCoins(ach.reward.coins);
      newlyUnlocked.push(ach);
      adAddJournalEntry('Achievement', `Unlocked: "${ach.name}" — ${ach.description}`, ['achievement']);
    }
  }

  return newlyUnlocked;
}

export function adGetAchievementCount(): number {
  return ensureInit().achievementsUnlocked;
}

// ---------------------------------------------------------------------------
// Exported: Journal
// ---------------------------------------------------------------------------

export function adGetJournal(): JournalEntry[] {
  return ensureInit().journal;
}

export function adAddJournalEntry(category: string, entry: string, tags: string[]): JournalEntry {
  const s = ensureInit();
  const journalEntry: JournalEntry = {
    id: generateId(),
    timestamp: Date.now(),
    siteName: s.currentSiteId ?? 'Base Camp',
    artifactName: null,
    entry,
    tags,
  };
  s.journal.unshift(journalEntry);
  // Keep last 200 entries
  if (s.journal.length > 200) s.journal.length = 200;
  return journalEntry;
}

export function adSearchJournal(query: string): JournalEntry[] {
  const s = ensureInit();
  const lower = query.toLowerCase();
  return s.journal.filter(j =>
    j.entry.toLowerCase().includes(lower) ||
    j.tags.some(t => t.toLowerCase().includes(lower)) ||
    j.siteName.toLowerCase().includes(lower) ||
    (j.artifactName && j.artifactName.toLowerCase().includes(lower))
  );
}

// ---------------------------------------------------------------------------
// Exported: Stats
// ---------------------------------------------------------------------------

export function adGetStats(): PlayerStats {
  const s = ensureInit();
  return {
    name: s.archaeologistName,
    level: s.level,
    totalXP: s.totalXP,
    coins: s.coins,
    totalArtifactsFound: s.totalArtifactsFound,
    totalTilesDug: s.totalTilesDug,
    totalSitesVisited: s.totalSitesVisited,
    legendaryCount: s.legendaryCount,
    rarePlusCount: s.rarePlusCount,
    perfectDigsCount: s.perfectDigsCount,
    museumPrestige: s.museumPrestige,
    completedExpeditions: s.completedExpeditions,
    achievementsUnlocked: s.achievementsUnlocked,
    researchCompleted: s.researchTopics.filter(r => r.completed).length,
  };
}

// ---------------------------------------------------------------------------
// Exported: Hints
// ---------------------------------------------------------------------------

export function adGetHint(context: string): HintResult {
  const s = ensureInit();

  if (context === 'dig') {
    const unrevealed = s.grid.flat().filter(t => !t.revealed && t.artifactId);
    if (unrevealed.length > 0) {
      const tile = unrevealed[0];
      return { hint: `Use a high-precision tool near row ${tile.row + 1}, column ${tile.col + 1} for the best chance of preserving artifacts.`, type: 'location' };
    }
    return { hint: 'Select your tool carefully. Brushes preserve artifacts best, while pickaxes reveal deeper layers faster.', type: 'general' };
  }

  if (context === 'restoration') {
    const unrestored = s.artifacts.filter(a => a.restorationPhase !== 'none' && a.restorationProgress < 100);
    if (unrestored.length > 0) {
      return { hint: `Focus on "${unrestored[0].name}" — it's in the ${unrestored[0].restorationPhase} phase at ${Math.floor(unrestored[0].restorationProgress)}%.`, type: 'artifact' };
    }
    return { hint: 'Fully restored artifacts are worth 2x their base value and can be exhibited for ongoing income.', type: 'general' };
  }

  if (context === 'research') {
    const available = s.researchTopics.filter(r => !r.completed && r.progress === 0);
    if (available.length > 0) {
      return { hint: `Consider researching "${available[0].name}" — it costs ${available[0].cost} research points and unlocks: ${available[0].unlocks}`, type: 'research' };
    }
    return { hint: 'Research points are earned by excavating and completing expeditions. Focus on unlocking Ground-Penetrating Radar v2 for better artifact detection.', type: 'general' };
  }

  return { hint: 'Explore all 8 excavation sites to unlock the World Traveler achievement. Higher-difficulty sites yield rarer artifacts.', type: 'general' };
}

// ---------------------------------------------------------------------------
// Exported: Abilities
// ---------------------------------------------------------------------------

export function adActivateAbility(abilityId: string): AbilityResult {
  const s = ensureInit();
  if (!s.abilitiesUnlocked.includes(abilityId)) {
    return { success: false, message: 'Ability not unlocked yet.' };
  }
  const charges = s.abilityCharges[abilityId] ?? 0;
  if (charges <= 0) {
    return { success: false, message: 'No charges remaining. Complete more digs to recharge.' };
  }

  s.abilityCharges[abilityId] = charges - 1;

  switch (abilityId) {
    case 'keen_eye':
      // Reveal artifacts within radius 2 on current grid
      for (const tile of s.grid.flat()) {
        if (!tile.revealed && tile.artifactId) {
          return { success: true, message: `Keen Eye: An artifact is nearby! Check your surroundings carefully.`, ability: abilityId };
        }
      }
      return { success: true, message: 'Keen Eye: No artifacts detected in the current dig site.', ability: abilityId };

    case 'slow_dig':
      s.preservationScore = clamp(s.preservationScore + 20, 0, 100);
      return { success: true, message: `Slow Dig: Preservation score boosted to ${Math.round(s.preservationScore)}%.`, ability: abilityId };

    case 'preserve_burst':
      s.preservationScore = 100;
      s.maxDigsPerSession += 5;
      return { success: true, message: 'Preserve Burst: Perfect preservation guaranteed! +5 bonus digs.', ability: abilityId };

    case 'lucky_strike':
      // Next dig has increased legendary chance — flag stored on state
      (s as any)._luckyStrikeActive = true;
      return { success: true, message: 'Lucky Strike: Your next artifact discovery has a much higher chance of being Epic or Legendary!', ability: abilityId };

    default:
      s.abilityCharges[abilityId] = charges; // refund
      return { success: false, message: 'Unknown ability.' };
  }
}

export function adGetAbilityCharges(abilityId: string): number {
  return ensureInit().abilityCharges[abilityId] ?? 0;
}

export function adGetAllAbilities(): AbilityInfo[] {
  const s = ensureInit();
  return Object.entries(s.abilityCharges).map(([id, charges]) => ({
    id,
    charges,
    unlocked: s.abilitiesUnlocked.includes(id),
  }));
}

export function adRechargeAbility(abilityId: string, amount: number): void {
  const s = ensureInit();
  if (s.abilitiesUnlocked.includes(abilityId)) {
    s.abilityCharges[abilityId] = (s.abilityCharges[abilityId] ?? 0) + amount;
  }
}

// ---------------------------------------------------------------------------
// Exported: Collections & Catalogs
// ---------------------------------------------------------------------------

export function adGetArtifactCatalog(): ArtifactCatalogEntry[] {
  return ARTIFACT_TEMPLATES.map(t => ({
    id: t.id,
    name: t.name,
    type: t.type,
    rarity: t.rarity,
    civilization: t.civilization,
    discovered: ensureInit().artifacts.some(a => a.name === t.name),
  }));
}

export function adGetCollectionProgress(): CollectionProgress {
  const s = ensureInit();
  const discovered = new Set(s.artifacts.map(a => a.name));
  const total = ARTIFACT_TEMPLATES.length;
  return {
    discovered: discovered.size,
    total,
    percentage: Math.floor((discovered.size / total) * 100),
    byType: {
      pottery: { discovered: s.artifacts.filter(a => a.type === 'pottery').length, total: ARTIFACT_TEMPLATES.filter(a => a.type === 'pottery').length },
      jewelry: { discovered: s.artifacts.filter(a => a.type === 'jewelry').length, total: ARTIFACT_TEMPLATES.filter(a => a.type === 'jewelry').length },
      weapons: { discovered: s.artifacts.filter(a => a.type === 'weapons').length, total: ARTIFACT_TEMPLATES.filter(a => a.type === 'weapons').length },
      tablets: { discovered: s.artifacts.filter(a => a.type === 'tablets').length, total: ARTIFACT_TEMPLATES.filter(a => a.type === 'tablets').length },
      statues: { discovered: s.artifacts.filter(a => a.type === 'statues').length, total: ARTIFACT_TEMPLATES.filter(a => a.type === 'statues').length },
    },
  };
}

// ---------------------------------------------------------------------------
// Exported: Utility
// ---------------------------------------------------------------------------

export function adGetLayerInfo(layer: DigLayer): LayerInfo {
  return {
    name: layer.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    hardness: LAYER_HARDNESS[layer],
    artifactChance: layer === 'artifact_layer' ? 0.4 : layer === 'bedrock' ? 0.05 : 0.01,
    description: LAYER_DESCRIPTIONS[layer],
  };
}

const LAYER_DESCRIPTIONS: Record<DigLayer, string> = {
  topsoil: 'Surface soil with modern debris. Easy to dig through but rarely contains artifacts.',
  clay: 'Dense clay layer, common in river valleys. May contain pottery sherds and small finds.',
  sandstone: 'Compacted sedimentary rock. Requires stronger tools. Often seals artifact layers below.',
  limestone: 'Hard calcium carbonate rock. Common building material in ancient structures. May contain fossils.',
  bedrock: 'The solid rock base. Extremely hard to excavate but can contain deep-buried treasures.',
  artifact_layer: 'The cultural deposit! This layer contains the highest concentration of artifacts. Handle with care.',
};

export function adGetRarityInfo(rarity: RarityTier): RarityInfo {
  return {
    name: rarity.replace(/\b\w/g, c => c.toUpperCase()),
    multiplier: RARITY_MULTIPLIER[rarity],
    weight: RARITY_WEIGHTS[rarity],
    color: RARITY_COLORS[rarity],
    description: RARITY_DESCRIPTIONS[rarity],
  };
}

const RARITY_COLORS: Record<RarityTier, string> = {
  common: '#9CA3AF',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
};

const RARITY_DESCRIPTIONS: Record<RarityTier, string> = {
  common: 'Everyday archaeological finds. Still valuable for historical research and museum collections.',
  uncommon: 'Notable finds with significant historical value. Often represent important cultural artifacts.',
  rare: 'Exceptional discoveries that attract international attention. High museum and collector demand.',
  epic: 'Extraordinary artifacts of immense historical and cultural significance. Museum centerpieces.',
  legendary: 'One-of-a-kind masterpieces that rewrite history. Priceless beyond conventional valuation.',
};

export function adGetToolInfo(toolType: ToolType): ToolInfo {
  const s = ensureInit();
  const tool = s.tools.find(t => t.type === toolType);
  if (!tool) return { type: toolType, name: 'Unknown', level: 0, maxLevel: 0, efficiency: 0, precision: 0, costPerUse: 0, upgradeCost: 0, description: '' };
  return { ...tool };
}

// ---------------------------------------------------------------------------
// Exported: Complete artifact lore
// ---------------------------------------------------------------------------

export function adGetArtifactLore(artifactId: string): ArtifactLore | null {
  const s = ensureInit();
  const artifact = s.artifacts.find(a => a.id === artifactId);
  if (!artifact) return null;

  const hasDNA = s.researchTopics.find(r => r.id === 'res_09')?.completed;
  const hasEpigraphy = s.researchTopics.find(r => r.id === 'res_06')?.completed;

  return {
    artifactId: artifact.id,
    name: artifact.name,
    description: artifact.description,
    civilization: artifact.civilization,
    estimatedAge: artifact.estimatedAge,
    carbonDateRange: artifact.carbonDateRange,
    preservationScore: artifact.preservationScore,
    restorationPhase: artifact.restorationPhase,
    restorationProgress: artifact.restorationProgress,
    currentValue: adGetArtifactValue(artifactId),
    isExhibited: artifact.isExhibited,
    historicalContext: generateHistoricalContext(artifact),
    tradeConnections: hasDNA ? generateTradeConnections(artifact) : null,
    inscriptions: hasEpigraphy && artifact.type === 'tablets' ? generateInscriptions(artifact) : null,
  };
}

function generateHistoricalContext(artifact: Artifact): string {
  const contexts: Record<string, string> = {
    'Ancient Egyptian': 'The Nile Valley civilization produced some of humanity\'s greatest architectural and artistic achievements over 3,000 years of pharaonic rule.',
    'Roman': 'Rome\'s vast empire left an indelible mark on law, engineering, language, and culture across three continents.',
    'Ancient Greek': 'Greek civilization pioneered philosophy, democracy, theater, and the Olympic Games during its classical golden age.',
    'Mycenaean Greek': 'The Mycenaean civilization dominated the Aegean during the Late Bronze Age, a precursor to classical Greece.',
    'Maya': 'The Maya built sophisticated city-states in the rainforest, developed advanced mathematics including the concept of zero, and created remarkably accurate astronomical calendars.',
    'Norse': 'Viking Age Scandinavians were skilled navigators, traders, and craftsmen who reached North America, the Mediterranean, and the Middle East.',
    'Qin Dynasty Chinese': 'The Qin Dynasty unified China for the first time, standardized writing, currency, and measurements, and began construction of the Great Wall.',
    'Crusader': 'The Crusader states in the Levant created a unique fusion of European, Byzantine, and Islamic cultures during the medieval period.',
    'Medieval European': 'Medieval Europe saw the rise of universities, Gothic architecture, and a complex feudal social system.',
    'Byzantine': 'The Byzantine Empire preserved Roman knowledge and Orthodox Christianity for over a thousand years after Rome\'s fall.',
    'Tang Dynasty Chinese': 'The Tang Dynasty was China\'s golden age of poetry, cosmopolitan culture, and Silk Road trade.',
    'Ptolemaic Egyptian': 'The Ptolemaic dynasty ruled Egypt after Alexander\'s conquest, blending Greek and Egyptian cultures for 300 years.',
    'Atlantean (unknown)': 'This artifact originates from a civilization that defies all known archaeological timelines, suggesting a previously unrecorded chapter of human — or non-human — history.',
    'Ancient Chinese': 'Ancient Chinese civilization independently developed writing, bronze casting, silk production, and papermaking.',
    'Roman Britain': 'Roman Britain was the northwestern frontier of the empire for nearly 400 years, leaving roads, walls, and towns across the island.',
  };
  return contexts[artifact.civilization] ?? 'An artifact of uncertain cultural origin requiring further study.';
}

function generateTradeConnections(artifact: Artifact): string[] {
  const connections: string[] = [];
  if (artifact.civilization === 'Roman') {
    connections.push('Silk Road imports from China', 'Grain trade from Egypt', 'Tin from Britannia');
  } else if (artifact.civilization === 'Maya') {
    connections.push('Obsidian trade from Guatemala highlands', 'Cacao trade with Olmec descendants', 'Jade from Motagua River valley');
  } else if (artifact.civilization === 'Norse') {
    connections.push('Amber trade across the Baltic', 'Silver from Abbasid Caliphate', 'Fur trade with Sami peoples');
  } else {
    connections.push('Regional trade network', 'Possible long-distance exchange', 'Local resource procurement');
  }
  return connections;
}

function generateInscriptions(artifact: Artifact): string[] {
  const inscriptionData: Record<string, string[]> = {
    tablets: [
      'The text appears to be a legal document concerning land ownership...',
      'Fragmentary religious hymn invoking a deity associated with the underworld...',
      'Administrative record listing tribute payments from surrounding territories...',
      'Mathematical calculation suggesting advanced astronomical knowledge...',
      'Personal letter describing daily life and seasonal festivals...',
      'Royal decree establishing a new temple construction calendar...',
    ],
  };
  return inscriptionData[artifact.type] ?? ['No decipherable inscriptions detected.'];
}

// ---------------------------------------------------------------------------
// Exported: Rival interaction
// ---------------------------------------------------------------------------

export function adChallengeRival(rivalId: string): RivalChallengeResult {
  const s = ensureInit();
  const rival = s.rivals.find(r => r.id === rivalId);
  if (!rival) return { success: false, message: 'Rival not found.' };

  const playerScore = s.totalArtifactsFound * 10 + s.museumPrestige + s.level * 5;
  const rivalScore = rival.artifactsFound * 10 + rival.reputation * 2;

  if (playerScore > rivalScore) {
    rival.reputation = Math.max(0, rival.reputation - 5);
    adAddCoins(500);
    adAddXP(300);
    return {
      success: true,
      won: true,
      message: `You outshone ${rival.name}! Their reputation diminishes. +500 coins, +300 XP.`,
      playerScore,
      rivalScore,
    };
  }

  return {
    success: true,
    won: false,
    message: `${rival.name} holds their ground. Keep digging to surpass them!`,
    playerScore,
    rivalScore,
  };
}

// ---------------------------------------------------------------------------
// Exported: Layer map for current grid
// ---------------------------------------------------------------------------

export function adGetGridLayerMap(): GridLayerMap {
  const s = ensureInit();
  const layerMap: Record<DigLayer, number> = { topsoil: 0, clay: 0, sandstone: 0, limestone: 0, bedrock: 0, artifact_layer: 0 };
  const revealedMap: Record<DigLayer, number> = { topsoil: 0, clay: 0, sandstone: 0, limestone: 0, bedrock: 0, artifact_layer: 0 };

  for (const tile of s.grid.flat()) {
    layerMap[tile.layer]++;
    if (tile.revealed) revealedMap[tile.layer]++;
  }

  return { total: layerMap, revealed: revealedMap, totalTiles: s.grid.flat().length };
}

// ---------------------------------------------------------------------------
// Type declarations for return types
// ---------------------------------------------------------------------------

export interface DigResult {
  success: boolean;
  reason?: string;
  tile?: DigTile;
  artifact?: Artifact | null;
  preservationScore?: number;
  digsRemaining?: number;
  layerRevealed?: DigLayer;
}

export interface DigSessionSummary {
  siteId: string;
  tilesDug: number;
  preservationScore: number;
  coinsEarned: number;
  xpEarned: number;
  artifactsFound: Artifact[];
  wasPerfect: boolean;
}

export interface CarbonDateResult {
  error?: string;
  artifactId?: string;
  artifactName?: string;
  civilization?: string;
  estimatedYear?: number;
  marginOfError?: number;
  precision?: 'low' | 'medium' | 'high' | 'exact';
  bceRange?: [number, number];
  confidence?: number;
  valueAdjustment?: number;
}

export interface RestorationResult {
  success: boolean;
  message: string;
  phase?: RestorationPhase | 'complete';
  progress?: number;
}

export interface MuseumStats {
  totalExhibits: number;
  prestige: number;
  totalVisitors: number;
  totalTickets: number;
}

export interface MuseumDayResult {
  dayVisitors: number;
  dayTickets: number;
  coinIncome: number;
}

export interface ResearchAdvanceResult {
  success: boolean;
  message: string;
  completed?: boolean;
  progress?: number;
}

export interface ExpeditionDayResult {
  success: boolean;
 message?: string;
  completed?: boolean;
  reason?: string;
  reward?: { coins: number; xp: number; artifacts: string[] };
  day?: number;
  energy?: number;
  supplies?: number;
  funding?: number;
  event?: string | null;
  tilesDug?: number;
  artifactsFound?: number;
}

export interface GrantResult {
  success: boolean;
  message: string;
  amount?: number;
  source?: FundingSourceType;
  cooldownEnd?: number;
}

export interface RivalActivity {
  rivalId: string;
  rivalName: string;
  action: 'found_artifact' | 'excavating';
  siteId: string;
  catchphrase: string | null;
}

export interface RivalComparison {
  rivalId: string;
  rivalName: string;
  rivalArtifacts: number;
  rivalReputation: number;
  playerArtifacts: number;
  playerAhead: boolean;
}

export interface TradeResult {
  success: boolean;
  message: string;
}

export interface DailyDigResult {
  siteId: string;
  siteName: string;
  digsRemaining: number;
  bonusRarityChance: string;
  bonusReward: number;
  date: string;
  completed: boolean;
  bonusClaimed: boolean;
}

export interface DailyBonusResult {
  success: boolean;
  message?: string;
  xp?: number;
  coins?: number;
}

export interface WeatherTransition {
  previous: WeatherType;
  current: WeatherType;
  duration: number;
  digModifier: number;
  preservationPenalty: number;
}

export interface WeatherEffectInfo {
  weather: WeatherType;
  duration: number;
  digSpeedModifier: number;
  preservationPenalty: number;
}

export interface HintResult {
  hint: string;
  type: 'location' | 'artifact' | 'research' | 'general';
}

export interface AbilityResult {
  success: boolean;
  message: string;
  ability?: string;
}

export interface AbilityInfo {
  id: string;
  charges: number;
  unlocked: boolean;
}

export interface ArtifactCatalogEntry {
  id: string;
  name: string;
  type: ArtifactType;
  rarity: RarityTier;
  civilization: string;
  discovered: boolean;
}

export interface CollectionProgress {
  discovered: number;
  total: number;
  percentage: number;
  byType: Record<ArtifactType, { discovered: number; total: number }>;
}

export interface LayerInfo {
  name: string;
  hardness: number;
  artifactChance: number;
  description: string;
}

export interface RarityInfo {
  name: string;
  multiplier: number;
  weight: number;
  color: string;
  description: string;
}

export interface ToolInfo {
  type: ToolType;
  name: string;
  level: number;
  maxLevel: number;
  efficiency: number;
  precision: number;
  costPerUse: number;
  upgradeCost: number;
  description: string;
}

export interface ArtifactLore {
  artifactId: string;
  name: string;
  description: string;
  civilization: string;
  estimatedAge: string;
  carbonDateRange: [number, number];
  preservationScore: number;
  restorationPhase: RestorationPhase;
  restorationProgress: number;
  currentValue: number;
  isExhibited: boolean;
  historicalContext: string;
  tradeConnections: string[] | null;
  inscriptions: string[] | null;
}

export interface RivalChallengeResult {
  success: boolean;
  message: string;
  won?: boolean;
  playerScore?: number;
  rivalScore?: number;
}

export interface GridLayerMap {
  total: Record<DigLayer, number>;
  revealed: Record<DigLayer, number>;
  totalTiles: number;
}

export interface PlayerStats {
  name: string;
  level: number;
  totalXP: number;
  coins: number;
  totalArtifactsFound: number;
  totalTilesDug: number;
  totalSitesVisited: number;
  legendaryCount: number;
  rarePlusCount: number;
  perfectDigsCount: number;
  museumPrestige: number;
  completedExpeditions: number;
  achievementsUnlocked: number;
  researchCompleted: number;
}

// ---------------------------------------------------------------------------
// Exported: Version & Metadata
// ---------------------------------------------------------------------------

export const AD_VERSION = '1.0.0';
export const AD_SITE_COUNT = 8;
export const AD_ARTIFACT_COUNT = 50;
export const AD_TOOL_COUNT = 6;
export const AD_RIVAL_COUNT = 8;
export const AD_RESEARCH_COUNT = 10;
export const AD_ACHIEVEMENT_COUNT = 15;
export const AD_MAX_LEVEL = 45;
export const AD_GRID_SIZE = 6;
