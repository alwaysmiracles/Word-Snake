'use client'
import { useState } from 'react'

// ============================================================================
// Star Crusader Wire — Space Fleet Commander Game System
// Only useState. No useCallback, useRef, useMemo, useEffect.
// All functions use "sc" prefix. Exported as default hook useStarCrusader.
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ShipClassName =
  | 'Scout Frigate'
  | 'Destroyer'
  | 'Cruiser'
  | 'Battlecruiser'
  | 'Carrier'
  | 'Dreadnought'
  | 'Stealth Corvette'
  | 'Science Vessel'
  | 'Mining Barge'
  | 'Transport'
  | 'Flagship'
  | 'Titan'

type ShipStatKey = 'speed' | 'weapons' | 'shields' | 'hull' | 'cargo' | 'crew'

type MissionType = 'Patrol' | 'Assault' | 'Defense' | 'Recon' | 'Rescue'

type CaptainSpecialty =
  | 'Tactical'
  | 'Pilot'
  | 'Engineer'
  | 'Scientist'
  | 'Diplomat'
  | 'Medic'
  | 'Logistics'
  | 'Stealth'
  | 'Heavy Ordnance'
  | 'Navigator'

type AllianceStatus = 'Unknown' | 'Hostile' | 'Neutral' | 'Friendly' | 'Allied'

type ResourceKey = 'credits' | 'fuel' | 'ammo' | 'medical' | 'techPoints'

type ShipComponent = 'engine' | 'weapons' | 'shields' | 'hull' | 'sensors' | 'lifeSupport'

type MissionStatus = 'available' | 'active' | 'completed' | 'failed'

type StarSystemDanger = 'Safe' | 'Moderate' | 'Dangerous' | 'Extreme' | 'Forbidden'

interface ShipStats {
  speed: number
  weapons: number
  shields: number
  hull: number
  cargo: number
  crew: number
}

interface ShipClassDef {
  name: ShipClassName
  description: string
  baseStats: ShipStats
  baseCost: number
  componentSlots: ShipComponent[]
}

interface Ship {
  id: string
  className: ShipClassName
  name: string
  level: number
  componentLevels: Record<ShipComponent, number>
  stats: ShipStats
  hullCurrent: number
  hullMax: number
  shieldCurrent: number
  shieldMax: number
  captainId: string | null
  assignedSystem: string | null
  isFlagship: boolean
}

interface CaptainDef {
  name: string
  specialty: CaptainSpecialty
  skill: number
  bonusStat: ShipStatKey
  bonusAmount: number
  description: string
  hireCost: number
}

interface Captain {
  id: string
  name: string
  specialty: CaptainSpecialty
  skill: number
  bonusStat: ShipStatKey
  bonusAmount: number
  description: string
  isHired: boolean
  assignedShipId: string | null
  experience: number
  level: number
  morale: number
}

interface StarSystem {
  id: string
  name: string
  description: string
  dangerLevel: StarSystemDanger
  position: { x: number; y: number }
  connections: string[]
  isExplored: boolean
  isUnlocked: boolean
  missionCount: number
  resourceBonus: Partial<Record<ResourceKey, number>>
  alienRaceId: string | null
}

interface MissionDef {
  id: string
  name: string
  type: MissionType
  starSystemId: string
  difficulty: number
  requiredLevel: number
  description: string
  objectives: string[]
  rewards: Partial<Record<ResourceKey, number>>
  xpReward: number
  timeLimitSeconds: number
}

interface Mission {
  id: string
  defId: string
  type: MissionType
  starSystemId: string
  difficulty: number
  requiredLevel: number
  name: string
  description: string
  objectives: string[]
  rewards: Partial<Record<ResourceKey, number>>
  xpReward: number
  timeLimitSeconds: number
  status: MissionStatus
  assignedShipIds: string[]
  startedAt: string | null
  completedAt: string | null
}

interface AlienRace {
  id: string
  name: string
  homeworldId: string
  description: string
  traits: string[]
  allianceStatus: AllianceStatus
  reputation: number
  tradeDiscount: number
  uniqueTech: string
  questLineProgress: number
}

interface Achievement {
  id: string
  name: string
  description: string
  isUnlocked: boolean
  unlockedAt: string | null
  requirement: string
  reward: Partial<Record<ResourceKey, number>>
  xpReward: number
}

interface DailyCrusade {
  date: string
  missionId: string
  bonusMultiplier: number
  isCompleted: boolean
  claimedAt: string | null
}

interface StarCrusaderState {
  crusaderName: string
  crusaderRank: number
  crusaderXP: number
  xpToNextRank: number
  totalXP: number
  credits: number
  fuel: number
  ammo: number
  medical: number
  techPoints: number
  ships: Ship[]
  captains: Captain[]
  missions: Mission[]
  starSystems: StarSystem[]
  alienRaces: AlienRace[]
  achievements: Achievement[]
  dailyCrusade: DailyCrusade
  currentSystemId: string
  selectedShipId: string | null
  missionsCompleted: number
  missionsFailed: number
  shipsDestroyed: number
  enemiesDefeated: number
  systemsExplored: number
  totalPlaytimeSeconds: number
  createdAt: string
  lastSaveAt: string
}

// ---------------------------------------------------------------------------
// Constants: Ship Classes
// ---------------------------------------------------------------------------

const SC_SHIP_CLASSES: ShipClassDef[] = [
  {
    name: 'Scout Frigate',
    description: 'Fast and nimble recon vessel with advanced sensor arrays. Ideal for exploration and intelligence gathering.',
    baseStats: { speed: 9, weapons: 3, shields: 3, hull: 2, cargo: 2, crew: 3 },
    baseCost: 500,
    componentSlots: ['engine', 'sensors', 'shields', 'hull', 'weapons', 'lifeSupport'],
  },
  {
    name: 'Destroyer',
    description: 'Versatile warship packing heavy weaponry. The backbone of any fleet engagement force.',
    baseStats: { speed: 6, weapons: 8, shields: 5, hull: 5, cargo: 3, crew: 5 },
    baseCost: 1200,
    componentSlots: ['engine', 'weapons', 'shields', 'hull', 'sensors', 'lifeSupport'],
  },
  {
    name: 'Cruiser',
    description: 'Well-balanced multi-role vessel capable of sustained operations across multiple mission profiles.',
    baseStats: { speed: 5, weapons: 6, shields: 7, hull: 6, cargo: 5, crew: 7 },
    baseCost: 2000,
    componentSlots: ['engine', 'weapons', 'shields', 'hull', 'sensors', 'lifeSupport'],
  },
  {
    name: 'Battlecruiser',
    description: 'Heavy combat vessel bridging the gap between cruisers and battleships with formidable firepower.',
    baseStats: { speed: 4, weapons: 9, shields: 6, hull: 7, cargo: 3, crew: 8 },
    baseCost: 3500,
    componentSlots: ['engine', 'weapons', 'shields', 'hull', 'sensors', 'lifeSupport'],
  },
  {
    name: 'Carrier',
    description: 'Massive fleet carrier capable of deploying fighter squadrons and supporting large-scale operations.',
    baseStats: { speed: 2, weapons: 4, shields: 8, hull: 9, cargo: 7, crew: 10 },
    baseCost: 5000,
    componentSlots: ['engine', 'weapons', 'shields', 'hull', 'sensors', 'lifeSupport'],
  },
  {
    name: 'Dreadnought',
    description: 'The ultimate battleship. Massive armaments and near-impenetrable defenses make it a mobile fortress.',
    baseStats: { speed: 1, weapons: 10, shields: 9, hull: 10, cargo: 2, crew: 9 },
    baseCost: 8000,
    componentSlots: ['engine', 'weapons', 'shields', 'hull', 'sensors', 'lifeSupport'],
  },
  {
    name: 'Stealth Corvette',
    description: 'Covert operations vessel with cloaking technology. Unseen and deadly in enemy territory.',
    baseStats: { speed: 8, weapons: 5, shields: 3, hull: 2, cargo: 4, crew: 2 },
    baseCost: 1800,
    componentSlots: ['engine', 'sensors', 'shields', 'hull', 'weapons', 'lifeSupport'],
  },
  {
    name: 'Science Vessel',
    description: 'Advanced research platform equipped with cutting-edge laboratory and deep-scan sensor suites.',
    baseStats: { speed: 4, weapons: 2, shields: 4, hull: 4, cargo: 6, crew: 6 },
    baseCost: 2200,
    componentSlots: ['engine', 'sensors', 'shields', 'hull', 'weapons', 'lifeSupport'],
  },
  {
    name: 'Mining Barge',
    description: 'Industrial extraction vessel designed to harvest asteroid and planetary resources at scale.',
    baseStats: { speed: 2, weapons: 1, shields: 5, hull: 6, cargo: 10, crew: 4 },
    baseCost: 1500,
    componentSlots: ['engine', 'shields', 'hull', 'sensors', 'lifeSupport', 'weapons'],
  },
  {
    name: 'Transport',
    description: 'Logistics workhorse for ferrying troops, supplies, and equipment across star systems.',
    baseStats: { speed: 5, weapons: 1, shields: 3, hull: 5, cargo: 10, crew: 3 },
    baseCost: 1000,
    componentSlots: ['engine', 'shields', 'hull', 'sensors', 'lifeSupport', 'weapons'],
  },
  {
    name: 'Flagship',
    description: 'Command vessel that inspires allied fleets and coordinates complex multi-ship strategies.',
    baseStats: { speed: 5, weapons: 7, shields: 8, hull: 8, cargo: 5, crew: 10 },
    baseCost: 10000,
    componentSlots: ['engine', 'weapons', 'shields', 'hull', 'sensors', 'lifeSupport'],
  },
  {
    name: 'Titan',
    description: 'Legendary super-capital ship of immense power. Only the greatest crusaders command a Titan.',
    baseStats: { speed: 1, weapons: 10, shields: 10, hull: 10, cargo: 4, crew: 10 },
    baseCost: 25000,
    componentSlots: ['engine', 'weapons', 'shields', 'hull', 'sensors', 'lifeSupport'],
  },
]

// ---------------------------------------------------------------------------
// Constants: Captain Definitions
// ---------------------------------------------------------------------------

const SC_CAPTAIN_DEFS: CaptainDef[] = [
  {
    name: 'Admiral Valeria Storm',
    specialty: 'Tactical',
    skill: 9,
    bonusStat: 'weapons',
    bonusAmount: 3,
    description: 'Legendary tactician with decades of fleet command experience. Boosts all weapon systems.',
    hireCost: 3000,
  },
  {
    name: 'Ace Nova Black',
    specialty: 'Pilot',
    skill: 10,
    bonusStat: 'speed',
    bonusAmount: 4,
    description: 'Unmatched pilot who can thread ships through asteroid fields at maximum thrust.',
    hireCost: 2500,
  },
  {
    name: 'Chief Engineer Orin Kael',
    specialty: 'Engineer',
    skill: 9,
    bonusStat: 'shields',
    bonusAmount: 3,
    description: 'Master engineer capable of squeezing maximum performance from any ship system.',
    hireCost: 2500,
  },
  {
    name: 'Dr. Lyra Zenith',
    specialty: 'Scientist',
    skill: 10,
    bonusStat: 'crew',
    bonusAmount: 2,
    description: 'Brilliant xenoscientist whose research teams boost crew efficiency and morale.',
    hireCost: 2000,
  },
  {
    name: 'Ambassador Kaelthas Sol',
    specialty: 'Diplomat',
    skill: 8,
    bonusStat: 'shields',
    bonusAmount: 2,
    description: 'Charismatic negotiator who strengthens alliances and resolves conflicts peacefully.',
    hireCost: 2000,
  },
  {
    name: 'Dr. Maren Cross',
    specialty: 'Medic',
    skill: 9,
    bonusStat: 'hull',
    bonusAmount: 3,
    description: 'Exceptional field surgeon who keeps crews alive in the harshest conditions.',
    hireCost: 1800,
  },
  {
    name: 'Quartermaster Dex',
    specialty: 'Logistics',
    skill: 8,
    bonusStat: 'cargo',
    bonusAmount: 4,
    description: 'Supply chain genius who maximizes cargo capacity and resource efficiency.',
    hireCost: 1500,
  },
  {
    name: 'Shadow Vex',
    specialty: 'Stealth',
    skill: 9,
    bonusStat: 'speed',
    bonusAmount: 3,
    description: 'Former intelligence operative specializing in covert operations and evasion.',
    hireCost: 2200,
  },
  {
    name: 'Colonel Ironhide',
    specialty: 'Heavy Ordnance',
    skill: 10,
    bonusStat: 'weapons',
    bonusAmount: 4,
    description: 'Artillery specialist who turns any ship into a devastating siege platform.',
    hireCost: 2800,
  },
  {
    name: 'Navigator Celeste',
    specialty: 'Navigator',
    skill: 9,
    bonusStat: 'speed',
    bonusAmount: 2,
    description: 'Gifted astrogator who plots optimal routes through hazardous star systems.',
    hireCost: 2000,
  },
]

// ---------------------------------------------------------------------------
// Constants: Star Systems
// ---------------------------------------------------------------------------

const SC_STAR_SYSTEMS_DATA: Omit<StarSystem, 'isExplored' | 'isUnlocked'>[] = [
  {
    id: 'sol',
    name: 'Sol',
    description: 'The cradle of humanity. Home to Earth and the headquarters of the United Space Command.',
    dangerLevel: 'Safe',
    position: { x: 0, y: 0 },
    connections: ['alpha-centauri', 'sirius'],
    missionCount: 4,
    resourceBonus: { credits: 10 },
    alienRaceId: null,
  },
  {
    id: 'alpha-centauri',
    name: 'Alpha Centauri',
    description: 'Humanity\'s first interstellar colony. A thriving hub of trade and cultural exchange.',
    dangerLevel: 'Safe',
    position: { x: 120, y: 80 },
    connections: ['sol', 'sirius', 'vega'],
    missionCount: 4,
    resourceBonus: { fuel: 5 },
    alienRaceId: null,
  },
  {
    id: 'sirius',
    name: 'Sirius',
    description: 'Binary star system with intense radiation zones. Rich in exotic minerals and rare isotopes.',
    dangerLevel: 'Moderate',
    position: { x: 200, y: 20 },
    connections: ['sol', 'alpha-centauri', 'rigel', 'polaris'],
    missionCount: 4,
    resourceBonus: { techPoints: 8 },
    alienRaceId: 'krythian',
  },
  {
    id: 'vega',
    name: 'Vega',
    description: 'Luminous blue-white star surrounded by debris disks. A natural shipyard and refueling station.',
    dangerLevel: 'Moderate',
    position: { x: 250, y: 150 },
    connections: ['alpha-centauri', 'arcturus', 'deneb'],
    missionCount: 4,
    resourceBonus: { fuel: 8 },
    alienRaceId: 'veldari',
  },
  {
    id: 'polaris',
    name: 'Polaris',
    description: 'The North Star, a stable supergiant system. Strategic waypoint for northern galactic routes.',
    dangerLevel: 'Moderate',
    position: { x: 180, y: -80 },
    connections: ['sirius', 'capella', 'fomalhaut'],
    missionCount: 4,
    resourceBonus: { credits: 12 },
    alienRaceId: null,
  },
  {
    id: 'rigel',
    name: 'Rigel',
    description: 'Brilliant blue supergiant with a complex multi-planet system. Home to fierce space battles.',
    dangerLevel: 'Dangerous',
    position: { x: 350, y: -30 },
    connections: ['sirius', 'betelgeuse', 'aldebaran'],
    missionCount: 4,
    resourceBonus: { ammo: 10 },
    alienRaceId: 'thraxian',
  },
  {
    id: 'betelgeuse',
    name: 'Betelgeuse',
    description: 'A dying red supergiant on the verge of supernova. Extremely hazardous but resource-rich.',
    dangerLevel: 'Extreme',
    position: { x: 450, y: -60 },
    connections: ['rigel', 'aldebaran', 'antares'],
    missionCount: 4,
    resourceBonus: { techPoints: 15 },
    alienRaceId: 'nerazim',
  },
  {
    id: 'arcturus',
    name: 'Arcturus',
    description: 'Ancient orange giant with stable planetary systems. Known for its diplomatic neutrality.',
    dangerLevel: 'Safe',
    position: { x: 320, y: 200 },
    connections: ['vega', 'capella', 'aldebaran'],
    missionCount: 4,
    resourceBonus: { medical: 10 },
    alienRaceId: 'aurani',
  },
  {
    id: 'capella',
    name: 'Capella',
    description: 'Quadruple star system with diverse orbital mechanics. Center of galactic commerce.',
    dangerLevel: 'Moderate',
    position: { x: 260, y: 50 },
    connections: ['polaris', 'arcturus', 'procyon'],
    missionCount: 4,
    resourceBonus: { credits: 15 },
    alienRaceId: null,
  },
  {
    id: 'aldebaran',
    name: 'Aldebaran',
    description: 'Red giant star at the eye of Taurus. Rich mining world with ancient alien ruins.',
    dangerLevel: 'Dangerous',
    position: { x: 400, y: 120 },
    connections: ['rigel', 'betelgeuse', 'arcturus', 'spica'],
    missionCount: 4,
    resourceBonus: { fuel: 12 },
    alienRaceId: null,
  },
  {
    id: 'antares',
    name: 'Antares',
    description: 'Heart of the Scorpius constellation. A crimson supergiant surrounded by nebulae.',
    dangerLevel: 'Extreme',
    position: { x: 500, y: 100 },
    connections: ['betelgeuse', 'spica', 'deneb'],
    missionCount: 4,
    resourceBonus: { ammo: 15 },
    alienRaceId: 'xenolith',
  },
  {
    id: 'spica',
    name: 'Spica',
    description: 'Hot blue binary system with intense gravitational anomalies. Testing ground for advanced tech.',
    dangerLevel: 'Dangerous',
    position: { x: 420, y: 220 },
    connections: ['aldebaran', 'antares', 'deneb'],
    missionCount: 4,
    resourceBonus: { techPoints: 12 },
    alienRaceId: null,
  },
  {
    id: 'deneb',
    name: 'Deneb',
    description: 'Distant blue-white supergiant. Edge of known space and gateway to uncharted territories.',
    dangerLevel: 'Extreme',
    position: { x: 380, y: 300 },
    connections: ['vega', 'antares', 'spica', 'fomalhaut'],
    missionCount: 4,
    resourceBonus: { credits: 20 },
    alienRaceId: 'veldari',
  },
  {
    id: 'fomalhaut',
    name: 'Fomalhaut',
    description: 'Ringed star system with a massive debris disk. Hidden pirate bases and ancient secrets.',
    dangerLevel: 'Dangerous',
    position: { x: 200, y: -150 },
    connections: ['polaris', 'procyon', 'deneb'],
    missionCount: 4,
    resourceBonus: { medical: 8 },
    alienRaceId: null,
  },
  {
    id: 'procyon',
    name: 'Procyon',
    description: 'Bright white main-sequence star with a white dwarf companion. Advanced research outpost.',
    dangerLevel: 'Moderate',
    position: { x: 300, y: -100 },
    connections: ['capella', 'fomalhaut', 'rigel'],
    missionCount: 4,
    resourceBonus: { techPoints: 10 },
    alienRaceId: 'nerazim',
  },
]

// ---------------------------------------------------------------------------
// Constants: Missions (30 total, 6 per type)
// ---------------------------------------------------------------------------

const SC_MISSION_DEFS: MissionDef[] = [
  // Patrol missions (6)
  {
    id: 'm-patrol-001',
    name: 'Sol Sector Patrol',
    type: 'Patrol',
    starSystemId: 'sol',
    difficulty: 1,
    requiredLevel: 1,
    description: 'Patrol the inner Sol system corridors and report any suspicious activity.',
    objectives: ['Scan three sectors around Earth orbit', 'Identify all vessel signatures', 'Report findings to Command'],
    rewards: { credits: 200, fuel: 20 },
    xpReward: 50,
    timeLimitSeconds: 300,
  },
  {
    id: 'm-patrol-002',
    name: 'Centauri Trade Route Watch',
    type: 'Patrol',
    starSystemId: 'alpha-centauri',
    difficulty: 2,
    requiredLevel: 3,
    description: 'Monitor the busy trade routes between Sol and Alpha Centauri for pirate activity.',
    objectives: ['Intercept and scan five vessels', 'Check cargo manifests', 'Escort at least one transport ship'],
    rewards: { credits: 400, fuel: 30 },
    xpReward: 100,
    timeLimitSeconds: 420,
  },
  {
    id: 'm-patrol-003',
    name: 'Vega Debris Field Sweep',
    type: 'Patrol',
    starSystemId: 'vega',
    difficulty: 4,
    requiredLevel: 7,
    description: 'Sweep the debris disk around Vega for hidden pirate bases and salvage opportunities.',
    objectives: ['Map the debris field density', 'Destroy any pirate sensor buoys', 'Recover salvage if found'],
    rewards: { credits: 700, techPoints: 30 },
    xpReward: 200,
    timeLimitSeconds: 600,
  },
  {
    id: 'm-patrol-004',
    name: 'Rigel Border Watch',
    type: 'Patrol',
    starSystemId: 'rigel',
    difficulty: 5,
    requiredLevel: 12,
    description: 'Patrol the volatile border between Federation and Thraxian territory.',
    objectives: ['Maintain sensor perimeter for six hours', 'Log all Thraxian vessel movements', 'Prevent border incursions'],
    rewards: { credits: 1000, ammo: 50 },
    xpReward: 350,
    timeLimitSeconds: 900,
  },
  {
    id: 'm-patrol-005',
    name: 'Antares Nebula Recon',
    type: 'Patrol',
    starSystemId: 'antares',
    difficulty: 7,
    requiredLevel: 20,
    description: 'Navigate the dense Antares nebula to patrol for Xenolith raiding parties.',
    objectives: ['Traverse three nebula corridors', 'Engage or evade Xenolith scouts', 'Map safe passage routes'],
    rewards: { credits: 2000, techPoints: 80 },
    xpReward: 600,
    timeLimitSeconds: 1200,
  },
  {
    id: 'm-patrol-006',
    name: 'Deneb Frontier Sentinel',
    type: 'Patrol',
    starSystemId: 'deneb',
    difficulty: 8,
    requiredLevel: 30,
    description: 'The outermost patrol mission. Guard the frontier against threats from deep space.',
    objectives: ['Establish sensor net at three relay points', 'Investigate unknown signal source', 'Hold position until relieved'],
    rewards: { credits: 3500, techPoints: 120 },
    xpReward: 1000,
    timeLimitSeconds: 1800,
  },
  // Assault missions (6)
  {
    id: 'm-assault-001',
    name: 'Pirate Outpost Strike',
    type: 'Assault',
    starSystemId: 'sol',
    difficulty: 2,
    requiredLevel: 2,
    description: 'Destroy a pirate outpost operating near the asteroid belt of the Sol system.',
    objectives: ['Eliminate outpost defenses', 'Destroy or capture pirate vessels', 'Secure the outpost core'],
    rewards: { credits: 500, ammo: 30 },
    xpReward: 120,
    timeLimitSeconds: 360,
  },
  {
    id: 'm-assault-002',
    name: 'Centauri Raiding Party',
    type: 'Assault',
    starSystemId: 'alpha-centauri',
    difficulty: 3,
    requiredLevel: 5,
    description: 'Lead a strike team against a coordinated raider fleet threatening colony shipping.',
    objectives: ['Engage raider command ship', 'Protect civilian transports', 'Pursue fleeing raiders'],
    rewards: { credits: 800, fuel: 40, ammo: 40 },
    xpReward: 200,
    timeLimitSeconds: 480,
  },
  {
    id: 'm-assault-003',
    name: 'Vega Shipyard Siege',
    type: 'Assault',
    starSystemId: 'vega',
    difficulty: 5,
    requiredLevel: 10,
    description: 'Assault a hostile force that has seized control of a critical shipyard facility.',
    objectives: ['Breach outer defense perimeter', 'Neutralize shipyard control systems', 'Recapture the facility'],
    rewards: { credits: 1500, techPoints: 60, ammo: 60 },
    xpReward: 400,
    timeLimitSeconds: 720,
  },
  {
    id: 'm-assault-004',
    name: 'Thraxian Forward Base',
    type: 'Assault',
    starSystemId: 'rigel',
    difficulty: 6,
    requiredLevel: 15,
    description: 'Destroy a Thraxian military forward operating base before it becomes fully operational.',
    objectives: ['Disable base shields', 'Eliminate ground defenses', 'Destroy the command center'],
    rewards: { credits: 2500, ammo: 80 },
    xpReward: 600,
    timeLimitSeconds: 900,
  },
  {
    id: 'm-assault-005',
    name: 'Betelgeuse Core Breach',
    type: 'Assault',
    starSystemId: 'betelgeuse',
    difficulty: 8,
    requiredLevel: 25,
    description: 'Assault a heavily fortified Nerazim research facility deep within the Betelgeuse system.',
    objectives: ['Navigate supernova radiation zones', 'Breach triple-layered defenses', 'Sabotage research cores'],
    rewards: { credits: 4000, techPoints: 100 },
    xpReward: 900,
    timeLimitSeconds: 1200,
  },
  {
    id: 'm-assault-006',
    name: 'Xenolith Hive Assault',
    type: 'Assault',
    starSystemId: 'antares',
    difficulty: 9,
    requiredLevel: 40,
    description: 'The ultimate assault: breach the Xenolith central hive and neutralize the queen entity.',
    objectives: ['Fight through hive warriors', 'Disable hive defense matrix', 'Eliminate the queen entity'],
    rewards: { credits: 8000, techPoints: 200, ammo: 100 },
    xpReward: 2000,
    timeLimitSeconds: 1800,
  },
  // Defense missions (6)
  {
    id: 'm-defense-001',
    name: 'Earth Orbital Defense',
    type: 'Defense',
    starSystemId: 'sol',
    difficulty: 1,
    requiredLevel: 1,
    description: 'Defend Earth\'s orbital stations from a surprise asteroid fragment shower.',
    objectives: ['Activate defense grid', 'Destroy incoming fragments', 'Protect all three orbital stations'],
    rewards: { credits: 300, medical: 20 },
    xpReward: 80,
    timeLimitSeconds: 240,
  },
  {
    id: 'm-defense-002',
    name: 'Colony Under Siege',
    type: 'Defense',
    starSystemId: 'alpha-centauri',
    difficulty: 3,
    requiredLevel: 5,
    description: 'Rally the defense of Proxima Colony against a coordinated raider siege lasting six hours.',
    objectives: ['Reinforce colony shields', 'Repel three assault waves', 'Repair critical infrastructure'],
    rewards: { credits: 600, medical: 40, fuel: 30 },
    xpReward: 180,
    timeLimitSeconds: 420,
  },
  {
    id: 'm-defense-003',
    name: 'Vega Station Stand',
    type: 'Defense',
    starSystemId: 'vega',
    difficulty: 5,
    requiredLevel: 10,
    description: 'Defend the critical Vega refueling station from a massive pirate armada.',
    objectives: ['Deploy minefields', 'Coordinate with station defenses', 'Survive until reinforcements arrive'],
    rewards: { credits: 1200, ammo: 50 },
    xpReward: 350,
    timeLimitSeconds: 600,
  },
  {
    id: 'm-defense-004',
    name: 'Arcturus Haven Shelter',
    type: 'Defense',
    starSystemId: 'arcturus',
    difficulty: 6,
    requiredLevel: 15,
    description: 'Protect a civilian refugee convoy sheltering near Arcturus from Thraxian hunter squads.',
    objectives: ['Screen convoy from all approaches', 'Destroy hunter squad leaders', 'Escort convoy to safety'],
    rewards: { credits: 1800, medical: 60 },
    xpReward: 500,
    timeLimitSeconds: 720,
  },
  {
    id: 'm-defense-005',
    name: 'Betelgeuse Evacuation Guard',
    type: 'Defense',
    starSystemId: 'betelgeuse',
    difficulty: 8,
    requiredLevel: 25,
    description: 'Guard the evacuation of a doomed research outpost as Betelgeuse enters pre-supernova.',
    objectives: ['Protect evacuation shuttles', 'Hold the line against radiation creatures', 'Ensure all personnel escape'],
    rewards: { credits: 3000, medical: 80 },
    xpReward: 800,
    timeLimitSeconds: 900,
  },
  {
    id: 'm-defense-006',
    name: 'Deneb Last Stand',
    type: 'Defense',
    starSystemId: 'deneb',
    difficulty: 9,
    requiredLevel: 40,
    description: 'Make a desperate last stand at the Deneb frontier against an overwhelming alien armada.',
    objectives: ['Fortify defensive positions', 'Survive five assault waves', 'Hold until the fleet arrives'],
    rewards: { credits: 6000, ammo: 100, medical: 100 },
    xpReward: 1800,
    timeLimitSeconds: 1200,
  },
  // Recon missions (6)
  {
    id: 'm-recon-001',
    name: 'Sol Asteroid Mapping',
    type: 'Recon',
    starSystemId: 'sol',
    difficulty: 1,
    requiredLevel: 1,
    description: 'Map the mineral composition of the main asteroid belt between Mars and Jupiter.',
    objectives: ['Scan twenty asteroid compositions', 'Identify high-value deposits', 'Return survey data to Command'],
    rewards: { credits: 250, techPoints: 20 },
    xpReward: 60,
    timeLimitSeconds: 360,
  },
  {
    id: 'm-recon-002',
    name: 'Centauri Signal Trace',
    type: 'Recon',
    starSystemId: 'alpha-centauri',
    difficulty: 2,
    requiredLevel: 4,
    description: 'Investigate a mysterious repeating signal emanating from the outer Centauri system.',
    objectives: ['Locate signal source', 'Analyze signal pattern', 'Report findings without being detected'],
    rewards: { credits: 500, techPoints: 40 },
    xpReward: 150,
    timeLimitSeconds: 480,
  },
  {
    id: 'm-recon-003',
    name: 'Sirius Deep Probe',
    type: 'Recon',
    starSystemId: 'sirius',
    difficulty: 4,
    requiredLevel: 8,
    description: 'Deploy deep-space probes into the radiation zones around Sirius to monitor Krythian activity.',
    objectives: ['Deploy three sensor probes', 'Collect Krythian communication data', 'Recover probes intact'],
    rewards: { credits: 900, techPoints: 60 },
    xpReward: 280,
    timeLimitSeconds: 600,
  },
  {
    id: 'm-recon-004',
    name: 'Aldebaran Ruin Survey',
    type: 'Recon',
    starSystemId: 'aldebaran',
    difficulty: 6,
    requiredLevel: 14,
    description: 'Survey and document the ancient alien ruins discovered on the third planet of Aldebaran.',
    objectives: ['Map ruin layout', 'Decode ancient inscriptions', 'Retrieve artifact samples'],
    rewards: { credits: 1500, techPoints: 80 },
    xpReward: 500,
    timeLimitSeconds: 840,
  },
  {
    id: 'm-recon-005',
    name: 'Antares Intelligence Op',
    type: 'Recon',
    starSystemId: 'antares',
    difficulty: 7,
    requiredLevel: 22,
    description: 'Infiltrate Xenolith territory to gather intelligence on their military capabilities.',
    objectives: ['Penetrate outer patrols undetected', 'Record fleet composition data', 'Escape without engagement'],
    rewards: { credits: 3000, techPoints: 120 },
    xpReward: 800,
    timeLimitSeconds: 1200,
  },
  {
    id: 'm-recon-006',
    name: 'Deep Space Anomaly',
    type: 'Recon',
    starSystemId: 'deneb',
    difficulty: 8,
    requiredLevel: 35,
    description: 'Investigate a massive spacetime anomaly at the edge of known space beyond Deneb.',
    objectives: ['Approach anomaly perimeter', 'Collect dimensional readings', 'Survive anomaly effects'],
    rewards: { credits: 5000, techPoints: 200 },
    xpReward: 1500,
    timeLimitSeconds: 1500,
  },
  // Rescue missions (6)
  {
    id: 'm-rescue-001',
    name: 'Distress Signal Relay',
    type: 'Rescue',
    starSystemId: 'sol',
    difficulty: 1,
    requiredLevel: 2,
    description: 'Respond to a distress signal from a stranded mining vessel in the outer Sol system.',
    objectives: ['Locate stranded vessel', 'Transfer fuel and supplies', 'Tow vessel to safety'],
    rewards: { credits: 350, medical: 15, fuel: 10 },
    xpReward: 90,
    timeLimitSeconds: 300,
  },
  {
    id: 'm-rescue-002',
    name: 'Centauri Hostage Crisis',
    type: 'Rescue',
    starSystemId: 'alpha-centauri',
    difficulty: 3,
    requiredLevel: 6,
    description: 'Rescue kidnapped diplomats being held by raiders in an asteroid hideout.',
    objectives: ['Locate asteroid hideout', 'Neutralize raider guards', 'Extract all hostages safely'],
    rewards: { credits: 700, medical: 30 },
    xpReward: 200,
    timeLimitSeconds: 420,
  },
  {
    id: 'm-rescue-003',
    name: 'Vega Crash Recovery',
    type: 'Rescue',
    starSystemId: 'vega',
    difficulty: 4,
    requiredLevel: 9,
    description: 'Recover survivors from a crashed transport ship in the Vega debris field.',
    objectives: ['Navigate hazardous debris', 'Locate crash site', 'Extract survivors under fire'],
    rewards: { credits: 1000, medical: 50 },
    xpReward: 300,
    timeLimitSeconds: 540,
  },
  {
    id: 'm-rescue-004',
    name: 'Rigel POW Extraction',
    type: 'Rescue',
    starSystemId: 'rigel',
    difficulty: 6,
    requiredLevel: 16,
    description: 'Infiltrate a Thraxian prisoner-of-war camp and extract captured fleet officers.',
    objectives: ['Identify camp layout', 'Disable security systems', 'Extract all prisoners'],
    rewards: { credits: 2000, medical: 70 },
    xpReward: 550,
    timeLimitSeconds: 720,
  },
  {
    id: 'm-rescue-005',
    name: 'Betelgeuse Science Team',
    type: 'Rescue',
    starSystemId: 'betelgeuse',
    difficulty: 7,
    requiredLevel: 24,
    description: 'Rescue a science team trapped on a planet being consumed by Betelgeuse\'s expansion.',
    objectives: ['Land on destabilizing planet', 'Reach research camp', 'Evacuate before planetary collapse'],
    rewards: { credits: 3500, medical: 90, techPoints: 60 },
    xpReward: 850,
    timeLimitSeconds: 900,
  },
  {
    id: 'm-rescue-006',
    name: 'Deneb Ghost Fleet Recovery',
    type: 'Rescue',
    starSystemId: 'deneb',
    difficulty: 9,
    requiredLevel: 38,
    description: 'Locate and recover the legendary Ghost Fleet that vanished near Deneb decades ago.',
    objectives: ['Follow ancient navigation beacons', 'Enter the Ghost Fleet zone', 'Recover ships and crew'],
    rewards: { credits: 7000, medical: 120, techPoints: 150 },
    xpReward: 1800,
    timeLimitSeconds: 1800,
  },
]

// ---------------------------------------------------------------------------
// Constants: Alien Races
// ---------------------------------------------------------------------------

const SC_ALIEN_RACE_DEFS: Omit<AlienRace, 'allianceStatus' | 'reputation' | 'tradeDiscount' | 'questLineProgress'>[] = [
  {
    id: 'krythian',
    name: 'Krythian Dominion',
    homeworldId: 'sirius',
    description: 'A militaristic reptilian species native to the Sirius system. Honor-bound warriors with advanced shield technology.',
    traits: ['Warrior Culture', 'Shield Masters', 'Honor Code', 'Territorial'],
    uniqueTech: 'Kinetic Barrier Array',
  },
  {
    id: 'veldari',
    name: 'Veldari Consortium',
    homeworldId: 'vega',
    description: 'Avian merchants and diplomats from the Vega system. Masters of trade, speed, and communication networks.',
    traits: ['Trade Mastery', 'Swift Flight', 'Communication Network', 'Diplomatic'],
    uniqueTech: 'Hyperwave Comm Relay',
  },
  {
    id: 'thraxian',
    name: 'Thraxian Empire',
    homeworldId: 'rigel',
    description: 'An aggressive insectoid species expanding from the Rigel system. Powerful weapons and hive-mind coordination.',
    traits: ['Hive Mind', 'Aggressive Expansion', 'Weapon Forgers', 'Swarm Tactics'],
    uniqueTech: 'Plasma Focus Lens',
  },
  {
    id: 'nerazim',
    name: 'Nerazim Collective',
    homeworldId: 'procyon',
    description: 'Mysterious energy beings from the Procyon system. Masters of stealth, psionics, and dark energy manipulation.',
    traits: ['Psionic', 'Energy Beings', 'Stealth Prowess', 'Ancient Knowledge'],
    uniqueTech: 'Void Cloak Generator',
  },
  {
    id: 'aurani',
    name: 'Aurani Concordat',
    homeworldId: 'arcturus',
    description: 'Plant-like sentient beings from the Arcturus system. Exceptional healers with bio-organic technology.',
    traits: ['Bio-Organic Tech', 'Healing Mastery', 'Environmental Harmony', 'Long-Lived'],
    uniqueTech: 'Bio-Regeneration Matrix',
  },
  {
    id: 'xenolith',
    name: 'Xenolith Swarm',
    homeworldId: 'antares',
    description: 'A terrifying silicon-based hive species from the Antares nebula. Adapt rapidly and consume everything.',
    traits: ['Adaptive Evolution', 'Consume All', 'Hive Intelligence', 'Extreme Resilience'],
    uniqueTech: 'Adaptive Nano-Armor',
  },
]

// ---------------------------------------------------------------------------
// Constants: Achievements (15 total)
// ---------------------------------------------------------------------------

const SC_ACHIEVEMENT_DEFS: Omit<Achievement, 'isUnlocked' | 'unlockedAt'>[] = [
  {
    id: 'ach-first-command',
    name: 'First Command',
    description: 'Recruit your first ship into the fleet.',
    requirement: 'Recruit 1 ship',
    reward: { credits: 500 },
    xpReward: 100,
  },
  {
    id: 'ach-fleet-five',
    name: 'Fleet of Five',
    description: 'Build a fleet with five ships.',
    requirement: 'Own 5 ships',
    reward: { credits: 2000 },
    xpReward: 300,
  },
  {
    id: 'ach-fleet-twelve',
    name: 'Grand Armada',
    description: 'Assemble a fleet of twelve ships, one of every class.',
    requirement: 'Own 12 ships',
    reward: { credits: 10000 },
    xpReward: 1000,
  },
  {
    id: 'ach-captain-first',
    name: 'Leadership Begins',
    description: 'Hire your first captain.',
    requirement: 'Hire 1 captain',
    reward: { credits: 300 },
    xpReward: 80,
  },
  {
    id: 'ach-all-captains',
    name: 'Commander Elite',
    description: 'Hire all ten available captains.',
    requirement: 'Hire 10 captains',
    reward: { credits: 5000 },
    xpReward: 800,
  },
  {
    id: 'ach-mission-ten',
    name: 'Veteran Crusader',
    description: 'Complete ten missions of any type.',
    requirement: 'Complete 10 missions',
    reward: { credits: 1500 },
    xpReward: 250,
  },
  {
    id: 'ach-mission-thirty',
    name: 'Galactic Legend',
    description: 'Complete all thirty crusade missions.',
    requirement: 'Complete 30 missions',
    reward: { credits: 20000 },
    xpReward: 3000,
  },
  {
    id: 'ach-systems-five',
    name: 'Explorer',
    description: 'Explore five different star systems.',
    requirement: 'Explore 5 systems',
    reward: { credits: 1000, fuel: 100 },
    xpReward: 200,
  },
  {
    id: 'ach-systems-all',
    name: 'Galactic Cartographer',
    description: 'Explore all fifteen star systems.',
    requirement: 'Explore 15 systems',
    reward: { credits: 15000, techPoints: 500 },
    xpReward: 2000,
  },
  {
    id: 'ach-alliance-one',
    name: 'First Contact',
    description: 'Achieve Allied status with any alien race.',
    requirement: 'Allied with 1 race',
    reward: { credits: 2000 },
    xpReward: 400,
  },
  {
    id: 'ach-alliance-three',
    name: 'Coalition Builder',
    description: 'Achieve Allied status with three alien races.',
    requirement: 'Allied with 3 races',
    reward: { credits: 8000 },
    xpReward: 1200,
  },
  {
    id: 'ach-rank-ten',
    name: 'Seasoned Officer',
    description: 'Reach Crusader Rank 10.',
    requirement: 'Reach rank 10',
    reward: { credits: 3000 },
    xpReward: 500,
  },
  {
    id: 'ach-rank-twenty-five',
    name: 'Rear Admiral',
    description: 'Reach Crusader Rank 25.',
    requirement: 'Reach rank 25',
    reward: { credits: 10000, techPoints: 200 },
    xpReward: 1500,
  },
  {
    id: 'ach-rank-fifty',
    name: 'Supreme Commander',
    description: 'Reach the maximum Crusader Rank 50.',
    requirement: 'Reach rank 50',
    reward: { credits: 50000, techPoints: 1000 },
    xpReward: 5000,
  },
  {
    id: 'ach-daily-streak',
    name: 'Daily Devotion',
    description: 'Complete seven daily crusade missions.',
    requirement: 'Complete 7 daily missions',
    reward: { credits: 5000, medical: 100 },
    xpReward: 700,
  },
]

// ---------------------------------------------------------------------------
// Constants: Rank progression XP table
// ---------------------------------------------------------------------------

function scCalcXpForRank(rank: number): number {
  return Math.floor(100 * Math.pow(rank, 1.6))
}

// ---------------------------------------------------------------------------
// Default State Factory
// ---------------------------------------------------------------------------

function scCreateDefaultState(): StarCrusaderState {
  const ships: Ship[] = []
  const captains: Captain[] = SC_CAPTAIN_DEFS.map((def, idx) => ({
    id: `captain-${String(idx + 1).padStart(2, '0')}`,
    name: def.name,
    specialty: def.specialty,
    skill: def.skill,
    bonusStat: def.bonusStat,
    bonusAmount: def.bonusAmount,
    description: def.description,
    isHired: false,
    assignedShipId: null,
    experience: 0,
    level: 1,
    morale: 80,
  }))
  const missions: Mission[] = SC_MISSION_DEFS.map((def) => ({
    id: def.id,
    defId: def.id,
    type: def.type,
    starSystemId: def.starSystemId,
    difficulty: def.difficulty,
    requiredLevel: def.requiredLevel,
    name: def.name,
    description: def.description,
    objectives: [...def.objectives],
    rewards: { ...def.rewards },
    xpReward: def.xpReward,
    timeLimitSeconds: def.timeLimitSeconds,
    status: 'available' as MissionStatus,
    assignedShipIds: [],
    startedAt: null,
    completedAt: null,
  }))
  const starSystems: StarSystem[] = SC_STAR_SYSTEMS_DATA.map((sys) => ({
    ...sys,
    isExplored: sys.id === 'sol',
    isUnlocked: sys.id === 'sol' || sys.id === 'alpha-centauri' || sys.id === 'sirius',
  }))
  const alienRaces: AlienRace[] = SC_ALIEN_RACE_DEFS.map((def) => ({
    ...def,
    allianceStatus: 'Unknown' as AllianceStatus,
    reputation: 0,
    tradeDiscount: 0,
    questLineProgress: 0,
  }))
  const achievements: Achievement[] = SC_ACHIEVEMENT_DEFS.map((def) => ({
    ...def,
    isUnlocked: false,
    unlockedAt: null,
  }))
  const now = new Date().toISOString()
  return {
    crusaderName: 'Commander',
    crusaderRank: 1,
    crusaderXP: 0,
    xpToNextRank: scCalcXpForRank(1),
    totalXP: 0,
    credits: 2000,
    fuel: 100,
    ammo: 50,
    medical: 30,
    techPoints: 0,
    ships,
    captains,
    missions,
    starSystems,
    alienRaces,
    achievements,
    dailyCrusade: {
      date: new Date().toISOString().split('T')[0],
      missionId: '',
      bonusMultiplier: 1.5,
      isCompleted: false,
      claimedAt: null,
    },
    currentSystemId: 'sol',
    selectedShipId: null,
    missionsCompleted: 0,
    missionsFailed: 0,
    shipsDestroyed: 0,
    enemiesDefeated: 0,
    systemsExplored: 1,
    totalPlaytimeSeconds: 0,
    createdAt: now,
    lastSaveAt: now,
  }
}

// ---------------------------------------------------------------------------
// Helper: Generate unique ID
// ---------------------------------------------------------------------------

let scIdCounter = 0

function scGenerateId(): string {
  scIdCounter += 1
  return `sc-${Date.now()}-${scIdCounter}`
}

// ---------------------------------------------------------------------------
// Helper: Calculate ship stats with captain bonus
// ---------------------------------------------------------------------------

function scCalcShipEffectiveStats(ship: Ship, captain: Captain | null): ShipStats {
  const base = { ...ship.stats }
  if (captain) {
    const key = captain.bonusStat as keyof ShipStats
    base[key] = Math.min(10, base[key] + captain.bonusAmount)
  }
  return base
}

// ---------------------------------------------------------------------------
// Helper: Calculate component upgrade cost
// ---------------------------------------------------------------------------

function scCalcUpgradeCost(componentLevel: number, difficulty: number): number {
  return Math.floor(100 * Math.pow(1.5, componentLevel) * (1 + difficulty * 0.1))
}

// ---------------------------------------------------------------------------
// Helper: Get ship class definition
// ---------------------------------------------------------------------------

function scGetShipClassDef(className: ShipClassName): ShipClassDef | undefined {
  return SC_SHIP_CLASSES.find((c) => c.name === className)
}

// ---------------------------------------------------------------------------
// Helper: Calculate effective power rating for a ship
// ---------------------------------------------------------------------------

function scCalcPowerRating(stats: ShipStats): number {
  return stats.speed + stats.weapons + stats.shields + stats.hull + stats.cargo + stats.crew
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════

export default function useStarCrusader() {
  const [state, setState] = useState<StarCrusaderState>(() => {
    try {
      const saved = localStorage.getItem('star-crusader-save')
      if (saved) {
        const parsed = JSON.parse(saved) as StarCrusaderState
        if (parsed && parsed.crusaderRank !== undefined) return parsed
      }
    } catch {
      // ignore parse errors
    }
    return scCreateDefaultState()
  })

  useState(() => {
    try {
      localStorage.setItem('star-crusader-save', JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  })

  // ─── State Update Helper ──────────────────────────────────────────────

  function scUpdateState(updater: (prev: StarCrusaderState) => StarCrusaderState): void {
    setState((prev) => updater(prev))
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION: Crusader Profile
  // ═══════════════════════════════════════════════════════════════════════

  function scGetName(): string {
    return state.crusaderName
  }

  function scSetName(name: string): void {
    scUpdateState((prev) => ({ ...prev, crusaderName: name }))
  }

  function scGetRank(): number {
    return state.crusaderRank
  }

  function scGetXP(): number {
    return state.crusaderXP
  }

  function scGetXpToNextRank(): number {
    return state.xpToNextRank
  }

  function scGetTotalXP(): number {
    return state.totalXP
  }

  function scGetXPProgressPercent(): number {
    if (state.xpToNextRank <= 0) return 100
    return Math.min(100, Math.floor((state.crusaderXP / state.xpToNextRank) * 100))
  }

  function scAddXP(amount: number): { rankedUp: boolean; newRank: number } {
    let rankedUp = false
    let newRank = state.crusaderRank
    scUpdateState((prev) => {
      let xp = prev.crusaderXP + amount
      let rank = prev.crusaderRank
      let xpToNext = prev.xpToNextRank
      let totalXp = prev.totalXP + amount
      while (xp >= xpToNext && rank < 50) {
        xp -= xpToNext
        rank += 1
        xpToNext = scCalcXpForRank(rank)
        rankedUp = true
        newRank = rank
      }
      if (rank >= 50) {
        xp = 0
        xpToNext = 1
        rank = 50
      }
      return { ...prev, crusaderXP: xp, crusaderRank: rank, xpToNextRank: xpToNext, totalXP: totalXp }
    })
    return { rankedUp, newRank }
  }

  function scGetRankTitle(): string {
    const rank = state.crusaderRank
    if (rank >= 50) return 'Supreme Commander'
    if (rank >= 45) return 'Grand Admiral'
    if (rank >= 40) return 'Fleet Admiral'
    if (rank >= 35) return 'Admiral'
    if (rank >= 30) return 'Vice Admiral'
    if (rank >= 25) return 'Rear Admiral'
    if (rank >= 20) return 'Commodore'
    if (rank >= 15) return 'Captain'
    if (rank >= 10) return 'Commander'
    if (rank >= 5) return 'Lieutenant Commander'
    return 'Ensign'
  }

  function scGetMissionsCompleted(): number {
    return state.missionsCompleted
  }

  function scGetMissionsFailed(): number {
    return state.missionsFailed
  }

  function scGetSuccessRate(): number {
    const total = state.missionsCompleted + state.missionsFailed
    if (total === 0) return 0
    return Math.floor((state.missionsCompleted / total) * 100)
  }

  function scGetEnemiesDefeated(): number {
    return state.enemiesDefeated
  }

  function scGetShipsDestroyed(): number {
    return state.shipsDestroyed
  }

  function scGetSystemsExplored(): number {
    return state.systemsExplored
  }

  function scGetTotalPlaytime(): number {
    return state.totalPlaytimeSeconds
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION: Resources
  // ═══════════════════════════════════════════════════════════════════════

  function scGetCredits(): number {
    return state.credits
  }

  function scGetFuel(): number {
    return state.fuel
  }

  function scGetAmmo(): number {
    return state.ammo
  }

  function scGetMedical(): number {
    return state.medical
  }

  function scGetTechPoints(): number {
    return state.techPoints
  }

  function scGetResource(key: ResourceKey): number {
    return state[key]
  }

  function scAddCredits(amount: number): void {
    scUpdateState((prev) => ({ ...prev, credits: Math.max(0, prev.credits + amount) }))
  }

  function scAddFuel(amount: number): void {
    scUpdateState((prev) => ({ ...prev, fuel: Math.max(0, prev.fuel + amount) }))
  }

  function scAddAmmo(amount: number): void {
    scUpdateState((prev) => ({ ...prev, ammo: Math.max(0, prev.ammo + amount) }))
  }

  function scAddMedical(amount: number): void {
    scUpdateState((prev) => ({ ...prev, medical: Math.max(0, prev.medical + amount) }))
  }

  function scAddTechPoints(amount: number): void {
    scUpdateState((prev) => ({ ...prev, techPoints: Math.max(0, prev.techPoints + amount) }))
  }

  function scSpendCredits(amount: number): boolean {
    if (state.credits < amount) return false
    scUpdateState((prev) => ({ ...prev, credits: prev.credits - amount }))
    return true
  }

  function scSpendFuel(amount: number): boolean {
    if (state.fuel < amount) return false
    scUpdateState((prev) => ({ ...prev, fuel: prev.fuel - amount }))
    return true
  }

  function scSpendAmmo(amount: number): boolean {
    if (state.ammo < amount) return false
    scUpdateState((prev) => ({ ...prev, ammo: prev.ammo - amount }))
    return true
  }

  function scSpendMedical(amount: number): boolean {
    if (state.medical < amount) return false
    scUpdateState((prev) => ({ ...prev, medical: prev.medical - amount }))
    return true
  }

  function scSpendTechPoints(amount: number): boolean {
    if (state.techPoints < amount) return false
    scUpdateState((prev) => ({ ...prev, techPoints: prev.techPoints - amount }))
    return true
  }

  function scAddResources(rewards: Partial<Record<ResourceKey, number>>): void {
    scUpdateState((prev) => ({
      ...prev,
      credits: Math.max(0, prev.credits + (rewards.credits || 0)),
      fuel: Math.max(0, prev.fuel + (rewards.fuel || 0)),
      ammo: Math.max(0, prev.ammo + (rewards.ammo || 0)),
      medical: Math.max(0, prev.medical + (rewards.medical || 0)),
      techPoints: Math.max(0, prev.techPoints + (rewards.techPoints || 0)),
    }))
  }

  function scSpendResources(costs: Partial<Record<ResourceKey, number>>): boolean {
    for (const key of Object.keys(costs) as ResourceKey[]) {
      const cost = costs[key] || 0
      if (state[key] < cost) return false
    }
    scUpdateState((prev) => ({
      ...prev,
      credits: prev.credits - (costs.credits || 0),
      fuel: prev.fuel - (costs.fuel || 0),
      ammo: prev.ammo - (costs.ammo || 0),
      medical: prev.medical - (costs.medical || 0),
      techPoints: prev.techPoints - (costs.techPoints || 0),
    }))
    return true
  }

  function scGetAllResources(): Record<ResourceKey, number> {
    return {
      credits: state.credits,
      fuel: state.fuel,
      ammo: state.ammo,
      medical: state.medical,
      techPoints: state.techPoints,
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION: Ship Fleet Management
  // ═══════════════════════════════════════════════════════════════════════

  function scGetShips(): Ship[] {
    return state.ships
  }

  function scGetShipCount(): number {
    return state.ships.length
  }

  function scGetShipById(id: string): Ship | undefined {
    return state.ships.find((s) => s.id === id)
  }

  function scGetShipsByClass(className: ShipClassName): Ship[] {
    return state.ships.filter((s) => s.className === className)
  }

  function scGetShipsInSystem(systemId: string): Ship[] {
    return state.ships.filter((s) => s.assignedSystem === systemId)
  }

  function scGetAvailableShips(): Ship[] {
    return state.ships.filter((s) => !s.assignedSystem)
  }

  function scGetFlagship(): Ship | undefined {
    return state.ships.find((s) => s.isFlagship)
  }

  function scGetShipClassNames(): ShipClassName[] {
    return SC_SHIP_CLASSES.map((c) => c.name)
  }

  function scGetShipClassDef(className: ShipClassName): ShipClassDef | undefined {
    return SC_SHIP_CLASSES.find((c) => c.name === className)
  }

  function scGetAllShipClassDefs(): ShipClassDef[] {
    return [...SC_SHIP_CLASSES]
  }

  function scRecruitShip(className: ShipClassName, customName?: string): Ship | null {
    const classDef = SC_SHIP_CLASSES.find((c) => c.name === className)
    if (!classDef) return null
    if (state.credits < classDef.baseCost) return null
    const newShip: Ship = {
      id: scGenerateId(),
      className,
      name: customName || `${className} ${state.ships.length + 1}`,
      level: 1,
      componentLevels: { engine: 1, weapons: 1, shields: 1, hull: 1, sensors: 1, lifeSupport: 1 },
      stats: { ...classDef.baseStats },
      hullCurrent: 50 + classDef.baseStats.hull * 10,
      hullMax: 50 + classDef.baseStats.hull * 10,
      shieldCurrent: classDef.baseStats.shields * 10,
      shieldMax: classDef.baseStats.shields * 10,
      captainId: null,
      assignedSystem: null,
      isFlagship: state.ships.length === 0,
    }
    scUpdateState((prev) => ({
      ...prev,
      credits: prev.credits - classDef.baseCost,
      ships: [...prev.ships, newShip],
      selectedShipId: prev.selectedShipId || newShip.id,
    }))
    return newShip
  }

  function scDisbandShip(shipId: string): boolean {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return false
    if (ship.isFlagship && state.ships.length > 1) return false
    const refundAmount = Math.floor(ship.level * 50)
    scUpdateState((prev) => {
      const remaining = prev.ships.filter((s) => s.id !== shipId)
      const newCaptains = ship.captainId
        ? prev.captains.map((c) => (c.id === ship.captainId ? { ...c, assignedShipId: null } : c))
        : prev.captains
      let newSelected = prev.selectedShipId
      if (newSelected === shipId) newSelected = remaining.length > 0 ? remaining[0].id : null
      if (remaining.length === 1 && !remaining[0].isFlagship) {
        remaining[0] = { ...remaining[0], isFlagship: true }
      }
      return { ...prev, ships: remaining, captains: newCaptains, credits: prev.credits + refundAmount, selectedShipId: newSelected }
    })
    return true
  }

  function scRenameShip(shipId: string, newName: string): boolean {
    if (!newName.trim()) return false
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return false
    scUpdateState((prev) => ({
      ...prev,
      ships: prev.ships.map((s) => (s.id === shipId ? { ...s, name: newName.trim() } : s)),
    }))
    return true
  }

  function scSetFlagship(shipId: string): boolean {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return false
    scUpdateState((prev) => ({
      ...prev,
      ships: prev.ships.map((s) => ({ ...s, isFlagship: s.id === shipId })),
      selectedShipId: shipId,
    }))
    return true
  }

  function scSelectShip(shipId: string): void {
    scUpdateState((prev) => ({ ...prev, selectedShipId: shipId }))
  }

  function scGetSelectedShip(): Ship | undefined {
    if (!state.selectedShipId) return undefined
    return state.ships.find((s) => s.id === state.selectedShipId)
  }

  function scAssignShipToSystem(shipId: string, systemId: string): boolean {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return false
    const system = state.starSystems.find((s) => s.id === systemId)
    if (!system || !system.isUnlocked) return false
    scUpdateState((prev) => ({
      ...prev,
      ships: prev.ships.map((s) => (s.id === shipId ? { ...s, assignedSystem: systemId } : s)),
    }))
    return true
  }

  function scRecallShip(shipId: string): boolean {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return false
    scUpdateState((prev) => ({
      ...prev,
      ships: prev.ships.map((s) => (s.id === shipId ? { ...s, assignedSystem: null } : s)),
    }))
    return true
  }

  function scRepairShip(shipId: string): boolean {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return false
    const missingHull = ship.hullMax - ship.hullCurrent
    const missingShield = ship.shieldMax - ship.shieldCurrent
    const medicalCost = Math.ceil((missingHull + missingShield) / 5)
    if (state.medical < medicalCost) return false
    scUpdateState((prev) => ({
      ...prev,
      medical: prev.medical - medicalCost,
      ships: prev.ships.map((s) =>
        s.id === shipId ? { ...s, hullCurrent: s.hullMax, shieldCurrent: s.shieldMax } : s
      ),
    }))
    return true
  }

  function scRefuelShip(shipId: string): boolean {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return false
    const fuelCost = Math.ceil(ship.stats.speed * 2)
    if (state.fuel < fuelCost) return false
    scUpdateState((prev) => ({
      ...prev,
      fuel: prev.fuel - fuelCost,
      ships: prev.ships.map((s) =>
        s.id === shipId ? { ...s, shieldCurrent: s.shieldMax } : s
      ),
    }))
    return true
  }

  function scGetShipEffectiveStats(shipId: string): ShipStats | null {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return null
    const captain = ship.captainId
      ? state.captains.find((c) => c.id === ship.captainId) || null
      : null
    return scCalcShipEffectiveStats(ship, captain)
  }

  function scGetShipPowerRating(shipId: string): number {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return 0
    const captain = ship.captainId
      ? state.captains.find((c) => c.id === ship.captainId) || null
      : null
    const stats = scCalcShipEffectiveStats(ship, captain)
    return scCalcPowerRating(stats)
  }

  function scGetFleetTotalPower(): number {
    return state.ships.reduce((total, ship) => {
      const captain = ship.captainId
        ? state.captains.find((c) => c.id === ship.captainId) || null
        : null
      return total + scCalcPowerRating(scCalcShipEffectiveStats(ship, captain))
    }, 0)
  }

  function scGetFleetAverageLevel(): number {
    if (state.ships.length === 0) return 0
    return Math.floor(state.ships.reduce((sum, s) => sum + s.level, 0) / state.ships.length)
  }

  function scGetShipCountByClass(className: ShipClassName): number {
    return state.ships.filter((s) => s.className === className).length
  }

  function scHasAllShipClasses(): boolean {
    return SC_SHIP_CLASSES.every((c) => state.ships.some((s) => s.className === c.name))
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION: Ship Component Upgrades
  // ═══════════════════════════════════════════════════════════════════════

  function scGetShipComponentLevels(shipId: string): Record<ShipComponent, number> | null {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return null
    return { ...ship.componentLevels }
  }

  function scGetShipComponentLevel(shipId: string, component: ShipComponent): number {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return 0
    return ship.componentLevels[component]
  }

  function scGetComponentUpgradeCost(shipId: string, component: ShipComponent): number {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return 0
    const currentLevel = ship.componentLevels[component]
    if (currentLevel >= 10) return 0
    return scCalcUpgradeCost(currentLevel, ship.level)
  }

  function scUpgradeShipComponent(shipId: string, component: ShipComponent): boolean {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return false
    const currentLevel = ship.componentLevels[component]
    if (currentLevel >= 10) return false
    const cost = scCalcUpgradeCost(currentLevel, ship.level)
    if (state.credits < cost) return false
    const newLevels = { ...ship.componentLevels, [component]: currentLevel + 1 }
    const classDef = SC_SHIP_CLASSES.find((c) => c.name === ship.className)
    if (!classDef) return false
    const levelMultiplier = 1 + (ship.level - 1) * 0.1
    const componentBonus: Partial<ShipStats> = {}
    for (const [comp, lvl] of Object.entries(newLevels)) {
      const bonusPerLevel = 0.3
      switch (comp as ShipComponent) {
        case 'engine': componentBonus.speed = (componentBonus.speed || 0) + lvl * bonusPerLevel; break
        case 'weapons': componentBonus.weapons = (componentBonus.weapons || 0) + lvl * bonusPerLevel; break
        case 'shields': componentBonus.shields = (componentBonus.shields || 0) + lvl * bonusPerLevel; break
        case 'hull': componentBonus.hull = (componentBonus.hull || 0) + lvl * bonusPerLevel; break
        case 'sensors': componentBonus.crew = (componentBonus.crew || 0) + lvl * bonusPerLevel; break
        case 'lifeSupport': componentBonus.cargo = (componentBonus.cargo || 0) + lvl * bonusPerLevel; break
      }
    }
    const newStats: ShipStats = {
      speed: Math.min(10, Math.floor(classDef.baseStats.speed * levelMultiplier + (componentBonus.speed || 0))),
      weapons: Math.min(10, Math.floor(classDef.baseStats.weapons * levelMultiplier + (componentBonus.weapons || 0))),
      shields: Math.min(10, Math.floor(classDef.baseStats.shields * levelMultiplier + (componentBonus.shields || 0))),
      hull: Math.min(10, Math.floor(classDef.baseStats.hull * levelMultiplier + (componentBonus.hull || 0))),
      cargo: Math.min(10, Math.floor(classDef.baseStats.cargo * levelMultiplier + (componentBonus.cargo || 0))),
      crew: Math.min(10, Math.floor(classDef.baseStats.crew * levelMultiplier + (componentBonus.crew || 0))),
    }
    scUpdateState((prev) => ({
      ...prev,
      credits: prev.credits - cost,
      ships: prev.ships.map((s) =>
        s.id === shipId
          ? {
              ...s,
              componentLevels: newLevels,
              stats: newStats,
              hullMax: 50 + newStats.hull * 10,
              shieldMax: newStats.shields * 10,
            }
          : s
      ),
    }))
    return true
  }

  function scIsShipMaxUpgraded(shipId: string): boolean {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return false
    return Object.values(ship.componentLevels).every((l) => l >= 10)
  }

  function scGetTotalComponentLevels(shipId: string): number {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return 0
    return Object.values(ship.componentLevels).reduce((sum, l) => sum + l, 0)
  }

  function scGetShipUpgradeProgress(shipId: string): number {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return 0
    const total = Object.values(ship.componentLevels).reduce((sum, l) => sum + l, 0)
    const maxTotal = 6 * 10
    return Math.floor((total / maxTotal) * 100)
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION: Captain Management
  // ═══════════════════════════════════════════════════════════════════════

  function scGetCaptains(): Captain[] {
    return state.captains
  }

  function scGetCaptainById(id: string): Captain | undefined {
    return state.captains.find((c) => c.id === id)
  }

  function scGetHiredCaptains(): Captain[] {
    return state.captains.filter((c) => c.isHired)
  }

  function scGetAvailableCaptains(): Captain[] {
    return state.captains.filter((c) => c.isHired && !c.assignedShipId)
  }

  function scGetUnhiredCaptains(): Captain[] {
    return state.captains.filter((c) => !c.isHired)
  }

  function scGetCaptainDefs(): CaptainDef[] {
    return [...SC_CAPTAIN_DEFS]
  }

  function scGetCaptainSpecialties(): CaptainSpecialty[] {
    return ['Tactical', 'Pilot', 'Engineer', 'Scientist', 'Diplomat', 'Medic', 'Logistics', 'Stealth', 'Heavy Ordnance', 'Navigator']
  }

  function scHireCaptain(captainId: string): boolean {
    const captain = state.captains.find((c) => c.id === captainId)
    if (!captain || captain.isHired) return false
    const def = SC_CAPTAIN_DEFS.find((d) => d.name === captain.name)
    if (!def) return false
    if (state.credits < def.hireCost) return false
    scUpdateState((prev) => ({
      ...prev,
      credits: prev.credits - def.hireCost,
      captains: prev.captains.map((c) => (c.id === captainId ? { ...c, isHired: true } : c)),
    }))
    return true
  }

  function scAssignCaptainToShip(captainId: string, shipId: string): boolean {
    const captain = state.captains.find((c) => c.id === captainId)
    if (!captain || !captain.isHired) return false
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return false
    if (ship.captainId) {
      scUpdateState((prev) => ({
        ...prev,
        captains: prev.captains.map((c) => (c.id === ship.captainId ? { ...c, assignedShipId: null } : c)),
      }))
    }
    scUpdateState((prev) => ({
      ...prev,
      captains: prev.captains.map((c) => (c.id === captainId ? { ...c, assignedShipId: shipId } : c)),
      ships: prev.ships.map((s) => (s.id === shipId ? { ...s, captainId: captainId } : s)),
    }))
    return true
  }

  function scUnassignCaptain(captainId: string): boolean {
    const captain = state.captains.find((c) => c.id === captainId)
    if (!captain) return false
    if (!captain.assignedShipId) return false
    scUpdateState((prev) => ({
      ...prev,
      captains: prev.captains.map((c) => (c.id === captainId ? { ...c, assignedShipId: null } : c)),
      ships: prev.ships.map((s) => (s.id === captain.assignedShipId ? { ...s, captainId: null } : s)),
    }))
    return true
  }

  function scGetCaptainForShip(shipId: string): Captain | undefined {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship || !ship.captainId) return undefined
    return state.captains.find((c) => c.id === ship.captainId)
  }

  function scGetCaptainHireCost(captainId: string): number {
    const captain = state.captains.find((c) => c.id === captainId)
    if (!captain) return 0
    const def = SC_CAPTAIN_DEFS.find((d) => d.name === captain.name)
    return def ? def.hireCost : 0
  }

  function scGetHiredCaptainCount(): number {
    return state.captains.filter((c) => c.isHired).length
  }

  function scHasAllCaptains(): boolean {
    return state.captains.every((c) => c.isHired)
  }

  function scGetCaptainMorale(captainId: string): number {
    const captain = state.captains.find((c) => c.id === captainId)
    return captain ? captain.morale : 0
  }

  function scBoostCaptainMorale(captainId: string, amount: number): boolean {
    const captain = state.captains.find((c) => c.id === captainId)
    if (!captain) return false
    const medCost = Math.ceil(amount * 2)
    if (state.medical < medCost) return false
    scUpdateState((prev) => ({
      ...prev,
      medical: prev.medical - medCost,
      captains: prev.captains.map((c) =>
        c.id === captainId ? { ...c, morale: Math.min(100, c.morale + amount) } : c
      ),
    }))
    return true
  }

  function scAddCaptainXP(captainId: string, amount: number): void {
    scUpdateState((prev) => ({
      ...prev,
      captains: prev.captains.map((c) => {
        if (c.id !== captainId) return c
        const newXP = c.experience + amount
        const xpForLevel = c.level * 200
        let newLevel = c.level
        let remainingXP = newXP
        while (remainingXP >= xpForLevel && newLevel < 10) {
          remainingXP -= newLevel * 200
          newLevel += 1
        }
        return { ...c, experience: remainingXP, level: newLevel }
      }),
    }))
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION: Star Systems
  // ═══════════════════════════════════════════════════════════════════════

  function scGetStarSystems(): StarSystem[] {
    return state.starSystems
  }

  function scGetStarSystemById(id: string): StarSystem | undefined {
    return state.starSystems.find((s) => s.id === id)
  }

  function scGetCurrentSystem(): StarSystem | undefined {
    return state.starSystems.find((s) => s.id === state.currentSystemId)
  }

  function scGetStarSystemData(): Omit<StarSystem, 'isExplored' | 'isUnlocked'>[] {
    return [...SC_STAR_SYSTEMS_DATA]
  }

  function scGetUnlockedSystems(): StarSystem[] {
    return state.starSystems.filter((s) => s.isUnlocked)
  }

  function scGetExploredSystems(): StarSystem[] {
    return state.starSystems.filter((s) => s.isExplored)
  }

  function scGetLockedSystems(): StarSystem[] {
    return state.starSystems.filter((s) => !s.isUnlocked)
  }

  function scGetConnectedSystems(systemId: string): StarSystem[] {
    const system = state.starSystems.find((s) => s.id === systemId)
    if (!system) return []
    return state.starSystems.filter((s) => system.connections.includes(s.id))
  }

  function scTravelToSystem(systemId: string): boolean {
    const current = state.starSystems.find((s) => s.id === state.currentSystemId)
    if (!current) return false
    if (!current.connections.includes(systemId)) return false
    const fuelCost = 10
    if (state.fuel < fuelCost) return false
    scUpdateState((prev) => {
      const systems = prev.starSystems.map((s) => {
        if (s.id === systemId) {
          return { ...s, isExplored: true, isUnlocked: true }
        }
        return s
      })
      const newExploredCount = systems.filter((s) => s.isExplored).length
      return {
        ...prev,
        fuel: prev.fuel - fuelCost,
        currentSystemId: systemId,
        starSystems: systems,
        systemsExplored: newExploredCount,
      }
    })
    return true
  }

  function scUnlockSystem(systemId: string): boolean {
    const system = state.starSystems.find((s) => s.id === systemId)
    if (!system || system.isUnlocked) return false
    const techCost = 50
    if (state.techPoints < techCost) return false
    scUpdateState((prev) => ({
      ...prev,
      techPoints: prev.techPoints - techCost,
      starSystems: prev.starSystems.map((s) =>
        s.id === systemId ? { ...s, isUnlocked: true } : s
      ),
    }))
    return true
  }

  function scGetSystemMissions(systemId: string): Mission[] {
    return state.missions.filter((m) => m.starSystemId === systemId)
  }

  function scGetSystemDangerLevel(systemId: string): StarSystemDanger {
    const system = state.starSystems.find((s) => s.id === systemId)
    return system ? system.dangerLevel : 'Safe'
  }

  function scGetSystemResourceBonus(systemId: string): Partial<Record<ResourceKey, number>> {
    const system = state.starSystems.find((s) => s.id === systemId)
    return system ? { ...system.resourceBonus } : {}
  }

  function scGetSystemPosition(systemId: string): { x: number; y: number } | null {
    const system = state.starSystems.find((s) => s.id === systemId)
    return system ? { ...system.position } : null
  }

  function scGetSystemNames(): string[] {
    return state.starSystems.map((s) => s.name)
  }

  function scGetSystemCount(): number {
    return state.starSystems.length
  }

  function scGetSystemByIdSafe(id: string): StarSystem {
    return state.starSystems.find((s) => s.id === id) || state.starSystems[0]
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION: Missions
  // ═══════════════════════════════════════════════════════════════════════

  function scGetMissions(): Mission[] {
    return state.missions
  }

  function scGetMissionById(id: string): Mission | undefined {
    return state.missions.find((m) => m.id === id)
  }

  function scGetAvailableMissions(): Mission[] {
    return state.missions.filter((m) => m.status === 'available' && state.crusaderRank >= m.requiredLevel)
  }

  function scGetActiveMissions(): Mission[] {
    return state.missions.filter((m) => m.status === 'active')
  }

  function scGetCompletedMissions(): Mission[] {
    return state.missions.filter((m) => m.status === 'completed')
  }

  function scGetFailedMissions(): Mission[] {
    return state.missions.filter((m) => m.status === 'failed')
  }

  function scGetMissionsByType(type: MissionType): Mission[] {
    return state.missions.filter((m) => m.type === type)
  }

  function scGetMissionsBySystem(systemId: string): Mission[] {
    return state.missions.filter((m) => m.starSystemId === systemId)
  }

  function scGetMissionDefs(): MissionDef[] {
    return [...SC_MISSION_DEFS]
  }

  function scGetMissionTypes(): MissionType[] {
    return ['Patrol', 'Assault', 'Defense', 'Recon', 'Rescue']
  }

  function scStartMission(missionId: string, shipIds: string[]): boolean {
    const mission = state.missions.find((m) => m.id === missionId)
    if (!mission || mission.status !== 'available') return false
    if (state.crusaderRank < mission.requiredLevel) return false
    if (shipIds.length === 0) return false
    const fuelCost = mission.difficulty * 5
    const ammoCost = mission.difficulty * 3
    if (mission.type === 'Assault' || mission.type === 'Defense') {
      if (state.ammo < ammoCost) return false
    }
    if (state.fuel < fuelCost) return false
    scUpdateState((prev) => {
      const newCredits = mission.type === 'Assault' || mission.type === 'Defense'
        ? prev.credits
        : prev.credits
      const newFuel = prev.fuel - fuelCost
      const newAmmo = (mission.type === 'Assault' || mission.type === 'Defense')
        ? prev.ammo - ammoCost
        : prev.ammo
      return {
        ...prev,
        fuel: newFuel,
        ammo: newAmmo,
        missions: prev.missions.map((m) =>
          m.id === missionId
            ? { ...m, status: 'active' as MissionStatus, assignedShipIds: shipIds, startedAt: new Date().toISOString() }
            : m
        ),
        ships: prev.ships.map((s) =>
          shipIds.includes(s.id) ? { ...s, assignedSystem: mission.starSystemId } : s
        ),
      }
    })
    return true
  }

  function scCompleteMission(missionId: string, success: boolean): Partial<Record<ResourceKey, number>> | null {
    const mission = state.missions.find((m) => m.id === missionId)
    if (!mission || mission.status !== 'active') return null
    const rewards = success ? mission.rewards : {}
    const xpGain = success ? mission.xpReward : Math.floor(mission.xpReward * 0.2)
    scUpdateState((prev) => ({
      ...prev,
      credits: prev.credits + (rewards.credits || 0),
      fuel: prev.fuel + (rewards.fuel || 0),
      ammo: prev.ammo + (rewards.ammo || 0),
      medical: prev.medical + (rewards.medical || 0),
      techPoints: prev.techPoints + (rewards.techPoints || 0),
      crusaderXP: prev.crusaderXP + xpGain,
      totalXP: prev.totalXP + xpGain,
      missionsCompleted: success ? prev.missionsCompleted + 1 : prev.missionsCompleted,
      missionsFailed: success ? prev.missionsFailed : prev.missionsFailed + 1,
      enemiesDefeated: success ? prev.enemiesDefeated + mission.difficulty * 3 : prev.enemiesDefeated,
      missions: prev.missions.map((m) =>
        m.id === missionId
          ? { ...m, status: (success ? 'completed' : 'failed') as MissionStatus, completedAt: new Date().toISOString() }
          : m
      ),
      ships: prev.ships.map((s) =>
        mission.assignedShipIds.includes(s.id) ? { ...s, assignedSystem: null } : s
      ),
    }))
    if (success) {
      for (const shipId of mission.assignedShipIds) {
        const captain = state.captains.find((c) => c.assignedShipId === shipId)
        if (captain) {
          scAddCaptainXP(captain.id, xpGain)
        }
      }
    }
    return rewards
  }

  function scAbandonMission(missionId: string): boolean {
    const mission = state.missions.find((m) => m.id === missionId)
    if (!mission || mission.status !== 'active') return false
    scUpdateState((prev) => ({
      ...prev,
      missions: prev.missions.map((m) =>
        m.id === missionId ? { ...m, status: 'available' as MissionStatus, assignedShipIds: [], startedAt: null } : m
      ),
      ships: prev.ships.map((s) =>
        mission.assignedShipIds.includes(s.id) ? { ...s, assignedSystem: null } : s
      ),
    }))
    return true
  }

  function scGetMissionsForRank(rank: number): Mission[] {
    return state.missions.filter((m) => m.requiredLevel <= rank && m.status === 'available')
  }

  function scGetMissionCount(): number {
    return state.missions.length
  }

  function scGetCompletedMissionCount(): number {
    return state.missions.filter((m) => m.status === 'completed').length
  }

  function scGetAvailableMissionCount(): number {
    return state.missions.filter((m) => m.status === 'available' && state.crusaderRank >= m.requiredLevel).length
  }

  function scGetMissionSuccessRate(): number {
    const completed = state.missions.filter((m) => m.status === 'completed').length
    const failed = state.missions.filter((m) => m.status === 'failed').length
    const total = completed + failed
    if (total === 0) return 0
    return Math.floor((completed / total) * 100)
  }

  function scCanStartMission(missionId: string): { canStart: boolean; reason: string } {
    const mission = state.missions.find((m) => m.id === missionId)
    if (!mission) return { canStart: false, reason: 'Mission not found' }
    if (mission.status !== 'available') return { canStart: false, reason: 'Mission not available' }
    if (state.crusaderRank < mission.requiredLevel) return { canStart: false, reason: `Requires rank ${mission.requiredLevel}` }
    const fuelCost = mission.difficulty * 5
    if (state.fuel < fuelCost) return { canStart: false, reason: 'Not enough fuel' }
    if (mission.type === 'Assault' || mission.type === 'Defense') {
      const ammoCost = mission.difficulty * 3
      if (state.ammo < ammoCost) return { canStart: false, reason: 'Not enough ammo' }
    }
    if (state.ships.length === 0) return { canStart: false, reason: 'No ships in fleet' }
    return { canStart: true, reason: 'Ready' }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION: Alien Races & Alliances
  // ═══════════════════════════════════════════════════════════════════════

  function scGetAlienRaces(): AlienRace[] {
    return state.alienRaces
  }

  function scGetAlienRaceById(id: string): AlienRace | undefined {
    return state.alienRaces.find((r) => r.id === id)
  }

  function scGetAlienRaceByName(name: string): AlienRace | undefined {
    return state.alienRaces.find((r) => r.name === name)
  }

  function scGetAlienRaceDefs(): Omit<AlienRace, 'allianceStatus' | 'reputation' | 'tradeDiscount' | 'questLineProgress'>[] {
    return [...SC_ALIEN_RACE_DEFS]
  }

  function scGetAlliedRaces(): AlienRace[] {
    return state.alienRaces.filter((r) => r.allianceStatus === 'Allied')
  }

  function scGetFriendlyRaces(): AlienRace[] {
    return state.alienRaces.filter((r) => r.allianceStatus === 'Friendly' || r.allianceStatus === 'Allied')
  }

  function scGetHostileRaces(): AlienRace[] {
    return state.alienRaces.filter((r) => r.allianceStatus === 'Hostile')
  }

  function scGetAllianceStatus(raceId: string): AllianceStatus {
    const race = state.alienRaces.find((r) => r.id === raceId)
    return race ? race.allianceStatus : 'Unknown'
  }

  function scGetReputation(raceId: string): number {
    const race = state.alienRaces.find((r) => r.id === raceId)
    return race ? race.reputation : 0
  }

  function scGetTradeDiscount(raceId: string): number {
    const race = state.alienRaces.find((r) => r.id === raceId)
    return race ? race.tradeDiscount : 0
  }

  function scGetUniqueTech(raceId: string): string {
    const race = state.alienRaces.find((r) => r.id === raceId)
    return race ? race.uniqueTech : ''
  }

  function scGetRaceForSystem(systemId: string): AlienRace | undefined {
    const system = state.starSystems.find((s) => s.id === systemId)
    if (!system || !system.alienRaceId) return undefined
    return state.alienRaces.find((r) => r.id === system.alienRaceId)
  }

  function scImproveRelations(raceId: string, amount: number): void {
    scUpdateState((prev) => ({
      ...prev,
      alienRaces: prev.alienRaces.map((r) => {
        if (r.id !== raceId) return r
        let newRep = Math.min(100, r.reputation + amount)
        let newStatus = r.allianceStatus
        if (newRep >= 80) newStatus = 'Allied'
        else if (newRep >= 50) newStatus = 'Friendly'
        else if (newRep >= 20) newStatus = 'Neutral'
        else if (newRep < 0) newStatus = 'Hostile'
        else if (newStatus === 'Unknown' && newRep > 0) newStatus = 'Neutral'
        const discount = newStatus === 'Allied' ? 20 : newStatus === 'Friendly' ? 10 : 0
        return { ...r, reputation: newRep, allianceStatus: newStatus, tradeDiscount: discount }
      }),
    }))
  }

  function scDamageRelations(raceId: string, amount: number): void {
    scUpdateState((prev) => ({
      ...prev,
      alienRaces: prev.alienRaces.map((r) => {
        if (r.id !== raceId) return r
        let newRep = Math.max(-100, r.reputation - amount)
        let newStatus = r.allianceStatus
        if (newRep >= 80) newStatus = 'Allied'
        else if (newRep >= 50) newStatus = 'Friendly'
        else if (newRep >= 20) newStatus = 'Neutral'
        else if (newRep < 0) newStatus = 'Hostile'
        const discount = newStatus === 'Allied' ? 20 : newStatus === 'Friendly' ? 10 : 0
        return { ...r, reputation: newRep, allianceStatus: newStatus, tradeDiscount: discount }
      }),
    }))
  }

  function scAdvanceQuestLine(raceId: string): boolean {
    const race = state.alienRaces.find((r) => r.id === raceId)
    if (!race) return false
    if (race.questLineProgress >= 5) return false
    if (race.allianceStatus === 'Unknown' || race.allianceStatus === 'Hostile') return false
    scUpdateState((prev) => ({
      ...prev,
      alienRaces: prev.alienRaces.map((r) =>
        r.id === raceId ? { ...r, questLineProgress: r.questLineProgress + 1 } : r
      ),
    }))
    return true
  }

  function scGetAlliedRaceCount(): number {
    return state.alienRaces.filter((r) => r.allianceStatus === 'Allied').length
  }

  function scGetFriendlyRaceCount(): number {
    return state.alienRaces.filter((r) => r.allianceStatus === 'Friendly' || r.allianceStatus === 'Allied').length
  }

  function scGetRaceTraits(raceId: string): string[] {
    const race = state.alienRaces.find((r) => r.id === raceId)
    return race ? [...race.traits] : []
  }

  function scGetRaceDescription(raceId: string): string {
    const race = state.alienRaces.find((r) => r.id === raceId)
    return race ? race.description : ''
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION: Achievements
  // ═══════════════════════════════════════════════════════════════════════

  function scGetAchievements(): Achievement[] {
    return state.achievements
  }

  function scGetAchievementById(id: string): Achievement | undefined {
    return state.achievements.find((a) => a.id === id)
  }

  function scGetUnlockedAchievements(): Achievement[] {
    return state.achievements.filter((a) => a.isUnlocked)
  }

  function scGetLockedAchievements(): Achievement[] {
    return state.achievements.filter((a) => !a.isUnlocked)
  }

  function scGetAchievementDefs(): Omit<Achievement, 'isUnlocked' | 'unlockedAt'>[] {
    return [...SC_ACHIEVEMENT_DEFS]
  }

  function scGetAchievementCount(): number {
    return state.achievements.length
  }

  function scGetUnlockedAchievementCount(): number {
    return state.achievements.filter((a) => a.isUnlocked).length
  }

  function scGetAchievementProgress(): number {
    const total = state.achievements.length
    if (total === 0) return 0
    return Math.floor((state.achievements.filter((a) => a.isUnlocked).length / total) * 100)
  }

  function scIsAchievementUnlocked(id: string): boolean {
    const ach = state.achievements.find((a) => a.id === id)
    return ach ? ach.isUnlocked : false
  }

  function scUnlockAchievement(id: string): boolean {
    const ach = state.achievements.find((a) => a.id === id)
    if (!ach || ach.isUnlocked) return false
    scUpdateState((prev) => ({
      ...prev,
      credits: prev.credits + (ach.reward.credits || 0),
      fuel: prev.fuel + (ach.reward.fuel || 0),
      ammo: prev.ammo + (ach.reward.ammo || 0),
      medical: prev.medical + (ach.reward.medical || 0),
      techPoints: prev.techPoints + (ach.reward.techPoints || 0),
      crusaderXP: prev.crusaderXP + ach.xpReward,
      totalXP: prev.totalXP + ach.xpReward,
      achievements: prev.achievements.map((a) =>
        a.id === id ? { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() } : a
      ),
    }))
    return true
  }

  function scCheckAndUnlockAchievements(): string[] {
    const newlyUnlocked: string[] = []
    function tryUnlock(id: string, condition: boolean): void {
      const ach = state.achievements.find((a) => a.id === id)
      if (ach && !ach.isUnlocked && condition) {
        scUnlockAchievement(id)
        newlyUnlocked.push(id)
      }
    }
    tryUnlock('ach-first-command', state.ships.length >= 1)
    tryUnlock('ach-fleet-five', state.ships.length >= 5)
    tryUnlock('ach-fleet-twelve', scHasAllShipClasses())
    tryUnlock('ach-captain-first', state.captains.some((c) => c.isHired))
    tryUnlock('ach-all-captains', scHasAllCaptains())
    tryUnlock('ach-mission-ten', state.missionsCompleted >= 10)
    tryUnlock('ach-mission-thirty', state.missionsCompleted >= 30)
    tryUnlock('ach-systems-five', state.systemsExplored >= 5)
    tryUnlock('ach-systems-all', state.systemsExplored >= 15)
    tryUnlock('ach-alliance-one', scGetAlliedRaceCount() >= 1)
    tryUnlock('ach-alliance-three', scGetAlliedRaceCount() >= 3)
    tryUnlock('ach-rank-ten', state.crusaderRank >= 10)
    tryUnlock('ach-rank-twenty-five', state.crusaderRank >= 25)
    tryUnlock('ach-rank-fifty', state.crusaderRank >= 50)
    return newlyUnlocked
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION: Daily Crusade
  // ═══════════════════════════════════════════════════════════════════════

  function scGetDailyCrusade(): DailyCrusade {
    return { ...state.dailyCrusade }
  }

  function scIsDailyCrusadeActive(): boolean {
    const today = new Date().toISOString().split('T')[0]
    return state.dailyCrusade.date === today
  }

  function scIsDailyCrusadeCompleted(): boolean {
    return state.dailyCrusade.isCompleted
  }

  function scGetDailyCrusadeBonus(): number {
    return state.dailyCrusade.bonusMultiplier
  }

  function scRefreshDailyCrusade(): void {
    const today = new Date().toISOString().split('T')[0]
    if (state.dailyCrusade.date === today) return
    const availableMissions = SC_MISSION_DEFS.filter(
      (d) => d.requiredLevel <= state.crusaderRank
    )
    const randomMission = availableMissions[Math.floor(Math.random() * availableMissions.length)]
    scUpdateState((prev) => ({
      ...prev,
      dailyCrusade: {
        date: today,
        missionId: randomMission ? randomMission.id : '',
        bonusMultiplier: 1.5 + Math.random() * 1.0,
        isCompleted: false,
        claimedAt: null,
      },
    }))
  }

  function scCompleteDailyCrusade(): Partial<Record<ResourceKey, number>> | null {
    const today = new Date().toISOString().split('T')[0]
    if (state.dailyCrusade.date !== today) return null
    if (state.dailyCrusade.isCompleted) return null
    const missionDef = SC_MISSION_DEFS.find((d) => d.id === state.dailyCrusade.missionId)
    if (!missionDef) return null
    const bonus = state.dailyCrusade.bonusMultiplier
    const rewards: Partial<Record<ResourceKey, number>> = {}
    for (const [key, value] of Object.entries(missionDef.rewards)) {
      rewards[key as ResourceKey] = Math.floor((value || 0) * bonus)
    }
    scUpdateState((prev) => ({
      ...prev,
      credits: prev.credits + (rewards.credits || 0),
      fuel: prev.fuel + (rewards.fuel || 0),
      ammo: prev.ammo + (rewards.ammo || 0),
      medical: prev.medical + (rewards.medical || 0),
      techPoints: prev.techPoints + (rewards.techPoints || 0),
      crusaderXP: prev.crusaderXP + Math.floor(missionDef.xpReward * bonus),
      totalXP: prev.totalXP + Math.floor(missionDef.xpReward * bonus),
      dailyCrusade: { ...prev.dailyCrusade, isCompleted: true, claimedAt: new Date().toISOString() },
    }))
    return rewards
  }

  function scGetDailyCrusadeMission(): MissionDef | undefined {
    return SC_MISSION_DEFS.find((d) => d.id === state.dailyCrusade.missionId)
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION: Trade & Economy
  // ═══════════════════════════════════════════════════════════════════════

  function scBuyFuel(amount: number): boolean {
    const cost = amount * 5
    if (state.credits < cost) return false
    scUpdateState((prev) => ({ ...prev, credits: prev.credits - cost, fuel: prev.fuel + amount }))
    return true
  }

  function scBuyAmmo(amount: number): boolean {
    const cost = amount * 3
    if (state.credits < cost) return false
    scUpdateState((prev) => ({ ...prev, credits: prev.credits - cost, ammo: prev.ammo + amount }))
    return true
  }

  function scBuyMedical(amount: number): boolean {
    const cost = amount * 4
    if (state.credits < cost) return false
    scUpdateState((prev) => ({ ...prev, credits: prev.credits - cost, medical: prev.medical + amount }))
    return true
  }

  function scBuyTechPoints(amount: number): boolean {
    const cost = amount * 10
    if (state.credits < cost) return false
    scUpdateState((prev) => ({ ...prev, credits: prev.credits - cost, techPoints: prev.techPoints + amount }))
    return true
  }

  function scGetFuelPrice(): number {
    return 5
  }

  function scGetAmmoPrice(): number {
    return 3
  }

  function scGetMedicalPrice(): number {
    return 4
  }

  function scGetTechPointsPrice(): number {
    return 10
  }

  function scGetDiscountedPrice(basePrice: number, raceId: string): number {
    const race = state.alienRaces.find((r) => r.id === raceId)
    if (!race) return basePrice
    return Math.max(1, Math.floor(basePrice * (1 - race.tradeDiscount / 100)))
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION: Reset & Data
  // ═══════════════════════════════════════════════════════════════════════

  function scResetGame(): void {
    const fresh = scCreateDefaultState()
    setState(fresh)
    try {
      localStorage.setItem('star-crusader-save', JSON.stringify(fresh))
    } catch {
      // ignore storage errors
    }
  }

  function scExportSave(): string {
    try {
      return JSON.stringify(state)
    } catch {
      return '{}'
    }
  }

  function scImportSave(json: string): boolean {
    try {
      const parsed = JSON.parse(json) as StarCrusaderState
      if (parsed && parsed.crusaderRank !== undefined) {
        setState(parsed)
        return true
      }
    } catch {
      // ignore parse errors
    }
    return false
  }

  function scClearSave(): void {
    try {
      localStorage.removeItem('star-crusader-save')
    } catch {
      // ignore storage errors
    }
    const fresh = scCreateDefaultState()
    setState(fresh)
  }

  function scGetCreatedAt(): string {
    return state.createdAt
  }

  function scGetLastSaveAt(): string {
    return state.lastSaveAt
  }

  function scGetSaveAgeHours(): number {
    const now = new Date().getTime()
    const saved = new Date(state.lastSaveAt).getTime()
    return Math.floor((now - saved) / (1000 * 60 * 60))
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION: Derived Statistics
  // ═══════════════════════════════════════════════════════════════════════

  function scGetFleetComposition(): Record<ShipClassName, number> {
    const composition: Record<string, number> = {}
    for (const cls of SC_SHIP_CLASSES) {
      composition[cls.name] = 0
    }
    for (const ship of state.ships) {
      composition[ship.className] = (composition[ship.className] || 0) + 1
    }
    return composition as Record<ShipClassName, number>
  }

  function scGetMissionTypeBreakdown(): Record<MissionType, number> {
    return {
      Patrol: state.missions.filter((m) => m.type === 'Patrol' && m.status === 'completed').length,
      Assault: state.missions.filter((m) => m.type === 'Assault' && m.status === 'completed').length,
      Defense: state.missions.filter((m) => m.type === 'Defense' && m.status === 'completed').length,
      Recon: state.missions.filter((m) => m.type === 'Recon' && m.status === 'completed').length,
      Rescue: state.missions.filter((m) => m.type === 'Rescue' && m.status === 'completed').length,
    }
  }

  function scGetResourceEfficiency(): number {
    const totalSpent = state.totalXP
    if (totalSpent === 0) return 100
    const totalResources = state.credits + state.fuel * 5 + state.ammo * 3 + state.medical * 4 + state.techPoints * 10
    return Math.min(100, Math.floor(totalResources / Math.max(1, totalSpent / 10)))
  }

  function scGetOverallScore(): number {
    const rankScore = state.crusaderRank * 200
    const fleetScore = scGetFleetTotalPower() * 10
    const missionScore = state.missionsCompleted * 150
    const explorationScore = state.systemsExplored * 100
    const allianceScore = scGetAlliedRaceCount() * 500
    const achievementScore = scGetUnlockedAchievementCount() * 300
    return rankScore + fleetScore + missionScore + explorationScore + allianceScore + achievementScore
  }

  function scGetCrusaderSummary(): {
    name: string
    rank: number
    title: string
    fleetSize: number
    totalPower: number
    missionsCompleted: number
    systemsExplored: number
    allies: number
    achievements: number
    overallScore: number
  } {
    return {
      name: state.crusaderName,
      rank: state.crusaderRank,
      title: scGetRankTitle(),
      fleetSize: state.ships.length,
      totalPower: scGetFleetTotalPower(),
      missionsCompleted: state.missionsCompleted,
      systemsExplored: state.systemsExplored,
      allies: scGetAlliedRaceCount(),
      achievements: scGetUnlockedAchievementCount(),
      overallScore: scGetOverallScore(),
    }
  }

  function scGetDifficultyRecommendation(): string {
    const power = scGetFleetTotalPower()
    if (power < 30) return 'Stick to Safe systems and Patrol missions'
    if (power < 60) return 'Ready for Moderate systems and Defense missions'
    if (power < 100) return 'Can handle Dangerous systems and Assault missions'
    if (power < 150) return 'Ready for Extreme systems and Recon missions'
    return 'Maximum crusade capability unlocked'
  }

  function scGetNextGoal(): string {
    if (state.ships.length === 0) return 'Recruit your first ship to begin the crusade'
    if (!state.captains.some((c) => c.isHired)) return 'Hire a captain to boost your fleet'
    if (state.missionsCompleted === 0) return 'Complete your first mission'
    if (state.systemsExplored < 3) return 'Explore more star systems'
    if (scGetAlliedRaceCount() === 0) return 'Build an alliance with an alien race'
    if (state.crusaderRank < 10) return 'Rank up to unlock more missions'
    if (scGetUnlockedAchievementCount() < 5) return 'Unlock more achievements'
    if (state.crusaderRank < 50) return 'Continue ranking up to Supreme Commander'
    return 'You have conquered the galaxy!'
  }

  function scGetUpgradeCostPreview(shipId: string, component: ShipComponent): number {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return 0
    const currentLevel = ship.componentLevels[component]
    if (currentLevel >= 10) return 0
    return scCalcUpgradeCost(currentLevel, ship.level)
  }

  function scGetTotalUpgradeInvestment(): number {
    let total = 0
    for (const ship of state.ships) {
      for (const comp of Object.keys(ship.componentLevels) as ShipComponent[]) {
        const level = ship.componentLevels[comp]
        for (let i = 1; i < level; i++) {
          total += scCalcUpgradeCost(i, ship.level)
        }
      }
    }
    return total
  }

  function scGetTotalFleetInvestment(): number {
    let total = 0
    for (const ship of state.ships) {
      const classDef = SC_SHIP_CLASSES.find((c) => c.name === ship.className)
      if (classDef) total += classDef.baseCost
    }
    for (const captain of state.captains) {
      if (captain.isHired) {
        const def = SC_CAPTAIN_DEFS.find((d) => d.name === captain.name)
        if (def) total += def.hireCost
      }
    }
    total += scGetTotalUpgradeInvestment()
    return total
  }

  function scGetShipByName(name: string): Ship | undefined {
    return state.ships.find((s) => s.name === name)
  }

  function scGetCaptainByName(name: string): Captain | undefined {
    return state.captains.find((c) => c.name === name)
  }

  function scGetSystemByName(name: string): StarSystem | undefined {
    return state.starSystems.find((s) => s.name === name)
  }

  function scGetMissionsByDifficulty(min: number, max: number): Mission[] {
    return state.missions.filter((m) => m.difficulty >= min && m.difficulty <= max && m.status === 'available')
  }

  function scGetCheapestAvailableShip(): ShipClassName | null {
    let cheapest: ShipClassName | null = null
    let minCost = Infinity
    for (const cls of SC_SHIP_CLASSES) {
      if (cls.baseCost < minCost) {
        minCost = cls.baseCost
        cheapest = cls.name
      }
    }
    return cheapest
  }

  function scGetShipCost(className: ShipClassName): number {
    const def = SC_SHIP_CLASSES.find((c) => c.name === className)
    return def ? def.baseCost : 0
  }

  function scCanAffordShip(className: ShipClassName): boolean {
    const cost = scGetShipCost(className)
    return state.credits >= cost
  }

  function scGetMaxPossibleFleetSize(): number {
    return SC_SHIP_CLASSES.length * 5
  }

  function scGetResourceValue(): number {
    return state.credits + state.fuel * 5 + state.ammo * 3 + state.medical * 4 + state.techPoints * 10
  }

  function scGetDailyStreakInfo(): { isCurrentDay: boolean; isCompleted: boolean; bonus: number; missionName: string } {
    const today = new Date().toISOString().split('T')[0]
    const missionDef = SC_MISSION_DEFS.find((d) => d.id === state.dailyCrusade.missionId)
    return {
      isCurrentDay: state.dailyCrusade.date === today,
      isCompleted: state.dailyCrusade.isCompleted,
      bonus: state.dailyCrusade.bonusMultiplier,
      missionName: missionDef ? missionDef.name : 'No mission available',
    }
  }

  function scGetShipHealthPercent(shipId: string): number {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return 0
    return Math.floor((ship.hullCurrent / ship.hullMax) * 100)
  }

  function scGetShipShieldPercent(shipId: string): number {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return 0
    if (ship.shieldMax === 0) return 100
    return Math.floor((ship.shieldCurrent / ship.shieldMax) * 100)
  }

  function scNeedsRepair(shipId: string): boolean {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return false
    return ship.hullCurrent < ship.hullMax
  }

  function scGetRepairCost(shipId: string): number {
    const ship = state.ships.find((s) => s.id === shipId)
    if (!ship) return 0
    const missingHull = ship.hullMax - ship.hullCurrent
    const missingShield = ship.shieldMax - ship.shieldCurrent
    return Math.ceil((missingHull + missingShield) / 5)
  }

  function scGetDamagedShips(): Ship[] {
    return state.ships.filter((s) => s.hullCurrent < s.hullMax)
  }

  function scRepairAllShips(): number {
    let totalCost = 0
    for (const ship of state.ships) {
      if (ship.hullCurrent < ship.hullMax) {
        totalCost += scGetRepairCost(ship.id)
      }
    }
    if (state.medical < totalCost) return 0
    scUpdateState((prev) => ({
      ...prev,
      medical: prev.medical - totalCost,
      ships: prev.ships.map((s) => ({ ...s, hullCurrent: s.hullMax, shieldCurrent: s.shieldMax })),
    }))
    return totalCost
  }

  function scGetShipLevel(shipId: string): number {
    const ship = state.ships.find((s) => s.id === shipId)
    return ship ? ship.level : 0
  }

  function scGetMissionTypeCount(type: MissionType): number {
    return state.missions.filter((m) => m.type === type).length
  }

  function scGetRandomAvailableMission(): Mission | undefined {
    const available = state.missions.filter(
      (m) => m.status === 'available' && state.crusaderRank >= m.requiredLevel
    )
    if (available.length === 0) return undefined
    return available[Math.floor(Math.random() * available.length)]
  }

  function scGetShipDescription(className: ShipClassName): string {
    const def = SC_SHIP_CLASSES.find((c) => c.name === className)
    return def ? def.description : ''
  }

  function scGetCaptainDescription(captainId: string): string {
    const captain = state.captains.find((c) => c.id === captainId)
    return captain ? captain.description : ''
  }

  function scGetMissionDescription(missionId: string): string {
    const mission = state.missions.find((m) => m.id === missionId)
    return mission ? mission.description : ''
  }

  function scGetSystemDescription(systemId: string): string {
    const system = state.starSystems.find((s) => s.id === systemId)
    return system ? system.description : ''
  }

  function scGetRaceHomeworld(raceId: string): string | null {
    const race = state.alienRaces.find((r) => r.id === raceId)
    return race ? race.homeworldId : null
  }

  function scGetQuestProgress(raceId: string): number {
    const race = state.alienRaces.find((r) => r.id === raceId)
    return race ? race.questLineProgress : 0
  }

  function scGetMaxQuestProgress(): number {
    return 5
  }

  function scIsQuestComplete(raceId: string): boolean {
    const race = state.alienRaces.find((r) => r.id === raceId)
    return race ? race.questLineProgress >= 5 : false
  }

  function scGetTotalCaptainsAvailable(): number {
    return SC_CAPTAIN_DEFS.length
  }

  function scGetTotalSystemsAvailable(): number {
    return SC_STAR_SYSTEMS_DATA.length
  }

  function scGetTotalMissionsAvailable(): number {
    return SC_MISSION_DEFS.length
  }

  function scGetTotalAchievementsAvailable(): number {
    return SC_ACHIEVEMENT_DEFS.length
  }

  function scGetTotalRacesAvailable(): number {
    return SC_ALIEN_RACE_DEFS.length
  }

  function scGetTotalShipClassesAvailable(): number {
    return SC_SHIP_CLASSES.length
  }

  function scGetGameCompletionPercent(): number {
    const shipPercent = Math.min(100, (state.ships.length / 12) * 100)
    const captainPercent = Math.min(100, (scGetHiredCaptainCount() / 10) * 100)
    const missionPercent = Math.min(100, (scGetCompletedMissionCount() / 30) * 100)
    const systemPercent = Math.min(100, (state.systemsExplored / 15) * 100)
    const achievementPercent = scGetAchievementProgress()
    const rankPercent = Math.min(100, (state.crusaderRank / 50) * 100)
    const alliancePercent = Math.min(100, (scGetAlliedRaceCount() / 6) * 100)
    return Math.floor(
      (shipPercent + captainPercent + missionPercent + systemPercent + achievementPercent + rankPercent + alliancePercent) / 7
    )
  }

  function scGetShipComponentNames(): ShipComponent[] {
    return ['engine', 'weapons', 'shields', 'hull', 'sensors', 'lifeSupport']
  }

  function scGetFormattedResource(key: ResourceKey): string {
    const value = state[key]
    return value.toLocaleString()
  }

  function scIsNewPlayer(): boolean {
    return state.ships.length === 0 && state.missionsCompleted === 0 && state.crusaderRank === 1
  }

  function scGetTutorialStep(): number {
    if (state.ships.length === 0) return 1
    if (!state.captains.some((c) => c.isHired)) return 2
    if (state.missionsCompleted === 0) return 3
    if (state.systemsExplored <= 1) return 4
    return 5
  }

  function scGetTutorialMessage(): string {
    const step = scGetTutorialStep()
    switch (step) {
      case 1: return 'Welcome, Commander! Recruit your first ship to begin your crusade across the stars.'
      case 2: return 'Your fleet needs a captain. Hire one to boost your ship\'s capabilities in battle.'
      case 3: return 'Select a mission and deploy your fleet. Complete missions to earn resources and XP.'
      case 4: return 'Explore new star systems to discover resources, alien races, and more missions.'
      default: return 'You\'re on your way, Commander. Continue your crusade and conquer the galaxy!'
    }
  }

  function scGetComponentDisplayName(component: ShipComponent): string {
    const names: Record<ShipComponent, string> = {
      engine: 'Engine',
      weapons: 'Weapons Array',
      shields: 'Shield Generator',
      hull: 'Hull Plating',
      sensors: 'Sensor Suite',
      lifeSupport: 'Life Support',
    }
    return names[component]
  }

  function scGetMissionTypeDisplayName(type: MissionType): string {
    const names: Record<MissionType, string> = {
      Patrol: 'Patrol',
      Assault: 'Assault',
      Defense: 'Defense',
      Recon: 'Reconnaissance',
      Rescue: 'Rescue',
    }
    return names[type]
  }

  function scGetDangerColor(danger: StarSystemDanger): string {
    switch (danger) {
      case 'Safe': return 'green'
      case 'Moderate': return 'yellow'
      case 'Dangerous': return 'orange'
      case 'Extreme': return 'red'
      case 'Forbidden': return 'purple'
      default: return 'gray'
    }
  }

  function scGetAllianceColor(status: AllianceStatus): string {
    switch (status) {
      case 'Unknown': return 'gray'
      case 'Hostile': return 'red'
      case 'Neutral': return 'yellow'
      case 'Friendly': return 'green'
      case 'Allied': return 'blue'
      default: return 'gray'
    }
  }

  function scGetShipStatLabel(stat: ShipStatKey): string {
    const labels: Record<ShipStatKey, string> = {
      speed: 'Speed',
      weapons: 'Weapons',
      shields: 'Shields',
      hull: 'Hull',
      cargo: 'Cargo',
      crew: 'Crew',
    }
    return labels[stat]
  }

  function scFormatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  function scGetDailyCrusadeTimeRemaining(): number {
    const now = new Date()
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
    return Math.max(0, Math.floor((endOfDay.getTime() - now.getTime()) / 1000))
  }

  function scGetDailyCrusadeTimeString(): string {
    const remaining = scGetDailyCrusadeTimeRemaining()
    const hours = Math.floor(remaining / 3600)
    const minutes = Math.floor((remaining % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RETURN: All state and functions
  // ═══════════════════════════════════════════════════════════════════════

  return {
    // State
    ...state,

    // Profile
    scGetName,
    scSetName,
    scGetRank,
    scGetXP,
    scGetXpToNextRank,
    scGetTotalXP,
    scGetXPProgressPercent,
    scAddXP,
    scGetRankTitle,
    scGetMissionsCompleted,
    scGetMissionsFailed,
    scGetSuccessRate,
    scGetEnemiesDefeated,
    scGetShipsDestroyed,
    scGetSystemsExplored,
    scGetTotalPlaytime,

    // Resources
    scGetCredits,
    scGetFuel,
    scGetAmmo,
    scGetMedical,
    scGetTechPoints,
    scGetResource,
    scAddCredits,
    scAddFuel,
    scAddAmmo,
    scAddMedical,
    scAddTechPoints,
    scSpendCredits,
    scSpendFuel,
    scSpendAmmo,
    scSpendMedical,
    scSpendTechPoints,
    scAddResources,
    scSpendResources,
    scGetAllResources,

    // Fleet
    scGetShips,
    scGetShipCount,
    scGetShipById,
    scGetShipsByClass,
    scGetShipsInSystem,
    scGetAvailableShips,
    scGetFlagship,
    scGetShipClassNames,
    scGetShipClassDef,
    scGetAllShipClassDefs,
    scRecruitShip,
    scDisbandShip,
    scRenameShip,
    scSetFlagship,
    scSelectShip,
    scGetSelectedShip,
    scAssignShipToSystem,
    scRecallShip,
    scRepairShip,
    scRefuelShip,
    scGetShipEffectiveStats,
    scGetShipPowerRating,
    scGetFleetTotalPower,
    scGetFleetAverageLevel,
    scGetShipCountByClass,
    scHasAllShipClasses,

    // Ship Upgrades
    scGetShipComponentLevels,
    scGetShipComponentLevel,
    scGetComponentUpgradeCost,
    scUpgradeShipComponent,
    scIsShipMaxUpgraded,
    scGetTotalComponentLevels,
    scGetShipUpgradeProgress,

    // Captains
    scGetCaptains,
    scGetCaptainById,
    scGetHiredCaptains,
    scGetAvailableCaptains,
    scGetUnhiredCaptains,
    scGetCaptainDefs,
    scGetCaptainSpecialties,
    scHireCaptain,
    scAssignCaptainToShip,
    scUnassignCaptain,
    scGetCaptainForShip,
    scGetCaptainHireCost,
    scGetHiredCaptainCount,
    scHasAllCaptains,
    scGetCaptainMorale,
    scBoostCaptainMorale,
    scAddCaptainXP,

    // Star Systems
    scGetStarSystems,
    scGetStarSystemById,
    scGetCurrentSystem,
    scGetStarSystemData,
    scGetUnlockedSystems,
    scGetExploredSystems,
    scGetLockedSystems,
    scGetConnectedSystems,
    scTravelToSystem,
    scUnlockSystem,
    scGetSystemMissions,
    scGetSystemDangerLevel,
    scGetSystemResourceBonus,
    scGetSystemPosition,
    scGetSystemNames,
    scGetSystemCount,
    scGetSystemByIdSafe,

    // Missions
    scGetMissions,
    scGetMissionById,
    scGetAvailableMissions,
    scGetActiveMissions,
    scGetCompletedMissions,
    scGetFailedMissions,
    scGetMissionsByType,
    scGetMissionsBySystem,
    scGetMissionDefs,
    scGetMissionTypes,
    scStartMission,
    scCompleteMission,
    scAbandonMission,
    scGetMissionsForRank,
    scGetMissionCount,
    scGetCompletedMissionCount,
    scGetAvailableMissionCount,
    scGetMissionSuccessRate,
    scCanStartMission,

    // Alien Races
    scGetAlienRaces,
    scGetAlienRaceById,
    scGetAlienRaceByName,
    scGetAlienRaceDefs,
    scGetAlliedRaces,
    scGetFriendlyRaces,
    scGetHostileRaces,
    scGetAllianceStatus,
    scGetReputation,
    scGetTradeDiscount,
    scGetUniqueTech,
    scGetRaceForSystem,
    scImproveRelations,
    scDamageRelations,
    scAdvanceQuestLine,
    scGetAlliedRaceCount,
    scGetFriendlyRaceCount,
    scGetRaceTraits,
    scGetRaceDescription,

    // Achievements
    scGetAchievements,
    scGetAchievementById,
    scGetUnlockedAchievements,
    scGetLockedAchievements,
    scGetAchievementDefs,
    scGetAchievementCount,
    scGetUnlockedAchievementCount,
    scGetAchievementProgress,
    scIsAchievementUnlocked,
    scUnlockAchievement,
    scCheckAndUnlockAchievements,

    // Daily Crusade
    scGetDailyCrusade,
    scIsDailyCrusadeActive,
    scIsDailyCrusadeCompleted,
    scGetDailyCrusadeBonus,
    scRefreshDailyCrusade,
    scCompleteDailyCrusade,
    scGetDailyCrusadeMission,

    // Trade
    scBuyFuel,
    scBuyAmmo,
    scBuyMedical,
    scBuyTechPoints,
    scGetFuelPrice,
    scGetAmmoPrice,
    scGetMedicalPrice,
    scGetTechPointsPrice,
    scGetDiscountedPrice,

    // Reset & Data
    scResetGame,
    scExportSave,
    scImportSave,
    scClearSave,
    scGetCreatedAt,
    scGetLastSaveAt,
    scGetSaveAgeHours,

    // Statistics
    scGetFleetComposition,
    scGetMissionTypeBreakdown,
    scGetResourceEfficiency,
    scGetOverallScore,
    scGetCrusaderSummary,
    scGetDifficultyRecommendation,
    scGetNextGoal,
    scGetUpgradeCostPreview,
    scGetTotalUpgradeInvestment,
    scGetTotalFleetInvestment,
    scGetShipByName,
    scGetCaptainByName,
    scGetSystemByName,
    scGetMissionsByDifficulty,
    scGetCheapestAvailableShip,
    scGetShipCost,
    scCanAffordShip,
    scGetMaxPossibleFleetSize,
    scGetResourceValue,
    scGetDailyStreakInfo,
    scGetShipHealthPercent,
    scGetShipShieldPercent,
    scNeedsRepair,
    scGetRepairCost,
    scGetDamagedShips,
    scRepairAllShips,
    scGetShipLevel,
    scGetMissionTypeCount,
    scGetRandomAvailableMission,
    scGetShipDescription,
    scGetCaptainDescription,
    scGetMissionDescription,
    scGetSystemDescription,
    scGetRaceHomeworld,
    scGetQuestProgress,
    scGetMaxQuestProgress,
    scIsQuestComplete,
    scGetTotalCaptainsAvailable,
    scGetTotalSystemsAvailable,
    scGetTotalMissionsAvailable,
    scGetTotalAchievementsAvailable,
    scGetTotalRacesAvailable,
    scGetTotalShipClassesAvailable,
    scGetGameCompletionPercent,
    scGetShipComponentNames,
    scGetFormattedResource,
    scIsNewPlayer,
    scGetTutorialStep,
    scGetTutorialMessage,
    scGetComponentDisplayName,
    scGetMissionTypeDisplayName,
    scGetDangerColor,
    scGetAllianceColor,
    scGetShipStatLabel,
    scFormatNumber,
    scGetDailyCrusadeTimeRemaining,
    scGetDailyCrusadeTimeString,
  }
}
