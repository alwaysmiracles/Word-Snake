// ============================================================================
// Space Mission Wire — Interstellar Exploration Game System
// SSR-safe: no localStorage, window, document, setInterval, setTimeout
// All exports use "sm" prefix. No functions starting with "use".
// ============================================================================

// ---------------------------------------------------------------------------
// Types (all inline)
// ---------------------------------------------------------------------------

type PlanetType = "Rocky" | "Gas Giant" | "Ice" | "Ocean" | "Desert" | "Volcanic" | "Forest" | "Crystal" | "Toxic" | "Magnetic" | "Hollow" | "Living";
type MissionType = "Exploration" | "Combat" | "Diplomacy" | "Science" | "Rescue";
type ShipClass = "Scout" | "Fighter" | "Cruiser" | "Carrier" | "Science Vessel" | "Mining Ship" | "Stealth" | "Flagship";
type CrewRole = "Captain" | "Pilot" | "Scientist" | "Engineer" | "Medic" | "Diplomat" | "Security";
type EquipmentSlot = "Engine" | "Shield" | "Weapon" | "Scanner" | "Cargo" | "Special";
type EquipmentTier = 1 | 2 | 3 | 4;

interface Planet {
  id: string;
  name: string;
  system: string;
  type: PlanetType;
  difficulty: number;
  resources: string[];
  atmosphere: string;
  gravity: string;
  inhabitants: string;
  description: string;
  discovered: boolean;
  explored: boolean;
  x: number;
  y: number;
}

interface MissionChain {
  id: string;
  name: string;
  missions: string[];
  bonusReward: { resource: string; amount: number };
}

interface Mission {
  id: string;
  name: string;
  planetId: string;
  type: MissionType;
  difficulty: number;
  description: string;
  objectives: string[];
  rewards: { xp: number; credits: number; resources: { resource: string; amount: number }[] };
  successThreshold: number;
  chainId: string | null;
  requiredLevel: number;
  completed: boolean;
  available: boolean;
  wordChallenge: string;
  timeLimit: number;
}

interface Encounter {
  id: string;
  name: string;
  type: string;
  description: string;
  difficulty: number;
  choices: { text: string; outcome: string; reward: { type: string; amount: number } }[];
}

interface ShipStats {
  speed: number;
  shields: number;
  weapons: number;
  cargo: number;
  science: number;
  stealth: number;
}

interface Ship {
  id: string;
  name: string;
  class: ShipClass;
  level: number;
  maxLevel: number;
  stats: ShipStats;
  baseStats: ShipStats;
  equipment: Record<EquipmentSlot, string | null>;
  fuel: number;
  maxFuel: number;
  hull: number;
  maxHull: number;
  owned: boolean;
  selected: boolean;
  upgradeCost: number;
}

interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  tier: EquipmentTier;
  stats: Partial<ShipStats>;
  description: string;
  cost: number;
}

interface CrewMember {
  id: string;
  name: string;
  role: CrewRole;
  skill: number;
  morale: number;
  health: number;
  experience: number;
  level: number;
  specialization: string;
  assigned: boolean;
  trait: string;
  bio: string;
}

interface Resource {
  id: string;
  name: string;
  description: string;
  icon: string;
  value: number;
  amount: number;
}

interface SpaceStation {
  id: string;
  name: string;
  system: string;
  services: string[];
  tradeRates: Record<string, number>;
}

interface AlienSpecies {
  id: string;
  name: string;
  homeworld: string;
  traits: string[];
  disposition: "Friendly" | "Neutral" | "Hostile" | "Mysterious";
  firstContact: boolean;
  relationship: number;
  technologyUnlocks: string[];
  description: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  unlocked: boolean;
  reward: { type: string; amount: number };
  icon: string;
}

interface DailyAnomaly {
  id: string;
  name: string;
  description: string;
  effect: string;
  bonusResource: string;
  bonusAmount: number;
  modifierType: string;
  modifierValue: number;
}

interface Commander {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  credits: number;
  reputation: number;
  totalMissions: number;
  successfulMissions: number;
  planetsDiscovered: number;
  aliensEncountered: number;
}

interface SpaceMissionState {
  commander: Commander;
  planets: Planet[];
  missions: Mission[];
  missionChains: MissionChain[];
  ships: Ship[];
  crew: CrewMember[];
  resources: Resource[];
  stations: SpaceStation[];
  aliens: AlienSpecies[];
  encounters: Encounter[];
  achievements: Achievement[];
  dailyAnomaly: DailyAnomaly;
  activeMission: string | null;
  missionLog: { missionId: string; result: "success" | "failure"; date: string; rewards: Record<string, number> }[];
  discoveredPlanets: string[];
  exploredPlanets: string[];
  assignedCrew: string[];
  selectedShipId: string;
  tradeHistory: { from: string; to: string; amount: number; date: string }[];
}

// ---------------------------------------------------------------------------
// Static Data
// ---------------------------------------------------------------------------

const PLANET_DATA: Omit<Planet, "discovered" | "explored">[] = [
  { id: "sol-mercury", name: "Mercury", system: "Sol", type: "Rocky", difficulty: 2, resources: ["Titanium", "Crystals"], atmosphere: "Thin, trace sodium", gravity: "0.38g", inhabitants: "None", description: "The scorched first planet of Sol, rich in crystalline deposits.", x: 10, y: 20 },
  { id: "sol-venus", name: "Venus", system: "Sol", type: "Volcanic", difficulty: 4, resources: ["Fuel", "Tech Parts"], atmosphere: "Dense CO₂, sulfuric clouds", gravity: "0.90g", inhabitants: "Automated drones", description: "A hellscape of volcanic fury beneath crushing atmosphere.", x: 30, y: 15 },
  { id: "sol-earth", name: "Earth", system: "Sol", type: "Ocean", difficulty: 1, resources: ["Food", "Tech Parts"], atmosphere: "Nitrogen-oxygen", gravity: "1.00g", inhabitants: "Humans", description: "Humanity's cradle, the blue marble of the Sol system.", x: 50, y: 25 },
  { id: "alpha-proxima", name: "Proxima b", system: "Alpha Centauri", type: "Desert", difficulty: 3, resources: ["Titanium", "Fuel"], atmosphere: "Thin CO₂, dust storms", gravity: "1.10g", inhabitants: "Burrowing tribes", description: "A tidally locked desert world with vast underground oases.", x: 150, y: 80 },
  { id: "alpha-kepler", name: "Kepler-7c", system: "Alpha Centauri", type: "Forest", difficulty: 5, resources: ["Food", "Crystals", "Alien Artifacts"], atmosphere: "Dense oxygen, bioluminescent spores", gravity: "0.85g", inhabitants: "Sentient flora", description: "A living forest world where trees communicate through light.", x: 170, y: 60 },
  { id: "alpha-nova", name: "Novaris", system: "Alpha Centauri", type: "Crystal", difficulty: 6, resources: ["Crystals", "Dark Matter"], atmosphere: "Argon-neon shimmer", gravity: "0.60g", inhabitants: "Crystal entities", description: "A world of sentient crystal formations pulsing with energy.", x: 160, y: 100 },
  { id: "sirius-glacius", name: "Glacius Prime", system: "Sirius", type: "Ice", difficulty: 5, resources: ["Plasma", "Dark Matter", "Crystals"], atmosphere: "Methane-nitrogen ice fog", gravity: "1.30g", inhabitants: "Ice walkers", description: "A frozen super-Earth hiding ancient structures beneath kilometers of ice.", x: 280, y: 40 },
  { id: "sirius-inferno", name: "Inferno IX", system: "Sirius", type: "Volcanic", difficulty: 7, resources: ["Fuel", "Titanium", "Tech Parts"], atmosphere: "Sulfur dioxide, ash clouds", gravity: "2.10g", inhabitants: "Magma beings", description: "A volcanic world orbiting close to Sirius A, home to beings of living magma.", x: 300, y: 70 },
  { id: "sirius-magnus", name: "Magnus", system: "Sirius", type: "Magnetic", difficulty: 8, resources: ["Tech Parts", "Plasma", "Alien Artifacts"], atmosphere: "Ionized hydrogen, aurora storms", gravity: "1.50g", inhabitants: "Electromagnetic entities", description: "A planet with a magnetic field 10,000x stronger than Earth's.", x: 290, y: 20 },
  { id: "andromeda-verdant", name: "Verdantia", system: "Andromeda", type: "Living", difficulty: 9, resources: ["Alien Artifacts", "Food", "Crystals"], atmosphere: "Symbiotic bio-network", gravity: "0.75g", inhabitants: "Planet-mind collective", description: "A sentient world that thinks, feels, and communicates through its ecosystem.", x: 420, y: 90 },
  { id: "andromeda-hollow", name: "Hollow Nexus", system: "Andromeda", type: "Hollow", difficulty: 9, resources: ["Dark Matter", "Alien Artifacts", "Tech Parts"], atmosphere: "Internal atmosphere, exotic matter", gravity: "Variable", inhabitants: "Inner sphere civilizations", description: "A Dyson sphere world with entire civilizations living inside its shell.", x: 450, y: 60 },
  { id: "andromeda-venenum", name: "Venenum", system: "Andromeda", type: "Toxic", difficulty: 10, resources: ["Plasma", "Dark Matter", "Fuel"], atmosphere: "Chlorine-fluorine acid mist", gravity: "1.80g", inhabitants: "Toxic-adapted sapients", description: "A deadly world whose inhabitants have evolved resistance to the most toxic compounds.", x: 440, y: 120 },
];

const MISSION_DATA: Omit<Mission, "completed" | "available">[] = [
  // Sol system missions (8)
  { id: "m-sol-01", name: "Mercury Survey", planetId: "sol-mercury", type: "Exploration", difficulty: 2, description: "Survey Mercury's crater fields for crystalline deposits.", objectives: ["Map 3 crater regions", "Collect crystal samples", "Return safely"], rewards: { xp: 50, credits: 100, resources: [{ resource: "Crystals", amount: 10 }] }, successThreshold: 3, chainId: null, requiredLevel: 1, wordChallenge: "explore", timeLimit: 120 },
  { id: "m-sol-02", name: "Venus Descent", planetId: "sol-venus", type: "Science", difficulty: 4, description: "Descend into Venus's atmosphere to study volcanic activity.", objectives: ["Deploy atmospheric probes", "Collect lava samples", "Analyze drone wreckage"], rewards: { xp: 80, credits: 200, resources: [{ resource: "Fuel", amount: 15 }] }, successThreshold: 4, chainId: "chain-sol", requiredLevel: 3, wordChallenge: "volcanic", timeLimit: 180 },
  { id: "m-sol-03", name: "Earth Defense", planetId: "sol-earth", type: "Combat", difficulty: 3, description: "Repel asteroid threat heading toward Earth.", objectives: ["Identify asteroid composition", "Destroy or redirect asteroid", "Protect orbital stations"], rewards: { xp: 70, credits: 150, resources: [{ resource: "Tech Parts", amount: 5 }] }, successThreshold: 3, chainId: "chain-earth-def", requiredLevel: 2, wordChallenge: "defense", timeLimit: 90 },
  { id: "m-sol-04", name: "Earth Diplomacy", planetId: "sol-earth", type: "Diplomacy", difficulty: 2, description: "Negotiate resource sharing agreement between Earth nations.", objectives: ["Meet with representatives", "Draft treaty terms", "Secure signatures"], rewards: { xp: 60, credits: 200, resources: [{ resource: "Food", amount: 20 }] }, successThreshold: 4, chainId: "chain-earth-def", requiredLevel: 1, wordChallenge: "treaty", timeLimit: 150 },
  { id: "m-sol-05", name: "Mercury Mining", planetId: "sol-mercury", type: "Exploration", difficulty: 3, description: "Establish mining operation on Mercury's polar craters.", objectives: ["Locate ice deposits", "Set up drill equipment", "Extract resources"], rewards: { xp: 60, credits: 180, resources: [{ resource: "Titanium", amount: 15 }, { resource: "Crystals", amount: 5 }] }, successThreshold: 3, chainId: "chain-sol", requiredLevel: 2, wordChallenge: "mining", timeLimit: 150 },
  { id: "m-sol-06", name: "Venus Rescue", planetId: "sol-venus", type: "Rescue", difficulty: 5, description: "Resue trapped scientists from a malfunctioning Venus station.", objectives: ["Locate the station", "Override safety locks", "Extract personnel"], rewards: { xp: 100, credits: 250, resources: [{ resource: "Tech Parts", amount: 10 }] }, successThreshold: 4, chainId: "chain-sol", requiredLevel: 4, wordChallenge: "rescue", timeLimit: 120 },
  { id: "m-sol-07", name: "Asteroid Belt Recon", planetId: "sol-earth", type: "Exploration", difficulty: 3, description: "Reconnoiter the asteroid belt between Mars and Jupiter.", objectives: ["Map asteroid density", "Identify valuable rocks", "Return navigation data"], rewards: { xp: 55, credits: 120, resources: [{ resource: "Titanium", amount: 8 }, { resource: "Fuel", amount: 5 }] }, successThreshold: 3, chainId: null, requiredLevel: 2, wordChallenge: "asteroid", timeLimit: 180 },
  { id: "m-sol-08", name: "Sol System Patrol", planetId: "sol-earth", type: "Combat", difficulty: 2, description: "Patrol inner system for pirate activity.", objectives: ["Scan 3 sectors", "Engage hostiles", "Report findings"], rewards: { xp: 45, credits: 100, resources: [{ resource: "Fuel", amount: 8 }] }, successThreshold: 3, chainId: null, requiredLevel: 1, wordChallenge: "patrol", timeLimit: 120 },
  // Alpha Centauri missions (8)
  { id: "m-alpha-01", name: "Proxima Landing", planetId: "alpha-proxima", type: "Exploration", difficulty: 4, description: "Land on Proxima b and survey the underground oases.", objectives: ["Find underground entrance", "Map water systems", "Document life forms"], rewards: { xp: 90, credits: 220, resources: [{ resource: "Food", amount: 15 }, { resource: "Alien Artifacts", amount: 2 }] }, successThreshold: 4, chainId: "chain-alpha", requiredLevel: 3, wordChallenge: "landing", timeLimit: 180 },
  { id: "m-alpha-02", name: "Forest Contact", planetId: "alpha-kepler", type: "Diplomacy", difficulty: 5, description: "Make first contact with the sentient flora of Kepler-7c.", objectives: ["Approach cautiously", "Learn communication method", "Establish dialogue"], rewards: { xp: 110, credits: 300, resources: [{ resource: "Alien Artifacts", amount: 5 }] }, successThreshold: 5, chainId: "chain-alpha", requiredLevel: 5, wordChallenge: "contact", timeLimit: 240 },
  { id: "m-alpha-03", name: "Crystal Extraction", planetId: "alpha-nova", type: "Science", difficulty: 6, description: "Study and extract energy crystals from Novaris.", objectives: ["Analyze crystal lattice", "Design extraction method", "Harvest safely"], rewards: { xp: 120, credits: 350, resources: [{ resource: "Crystals", amount: 25 }, { resource: "Dark Matter", amount: 3 }] }, successThreshold: 5, chainId: "chain-alpha", requiredLevel: 6, wordChallenge: "crystal", timeLimit: 240 },
  { id: "m-alpha-04", name: "Proxima Defense", planetId: "alpha-proxima", type: "Combat", difficulty: 5, description: "Defend Proxima b colony from raider attack.", objectives: ["Activate defense grid", "Repel 3 waves", "Secure perimeter"], rewards: { xp: 100, credits: 280, resources: [{ resource: "Titanium", amount: 10 }] }, successThreshold: 4, chainId: null, requiredLevel: 4, wordChallenge: "defend", timeLimit: 150 },
  { id: "m-alpha-05", name: "Flora Research", planetId: "alpha-kepler", type: "Science", difficulty: 6, description: "Research bioluminescent spore properties for medical use.", objectives: ["Collect spore samples", "Run lab analysis", "Develop application"], rewards: { xp: 130, credits: 320, resources: [{ resource: "Food", amount: 20 }, { resource: "Crystals", amount: 8 }] }, successThreshold: 5, chainId: null, requiredLevel: 5, wordChallenge: "research", timeLimit: 240 },
  { id: "m-alpha-06", name: "Desert Survivors", planetId: "alpha-proxima", type: "Rescue", difficulty: 4, description: "Locate and rescue lost colonists in Proxima's desert wastes.", objectives: ["Track distress signal", "Navigate sandstorm", "Evacuate survivors"], rewards: { xp: 95, credits: 250, resources: [{ resource: "Food", amount: 10 }, { resource: "Fuel", amount: 10 }] }, successThreshold: 4, chainId: null, requiredLevel: 3, wordChallenge: "survivors", timeLimit: 150 },
  { id: "m-alpha-07", name: "Crystal Entity Treaty", planetId: "alpha-nova", type: "Diplomacy", difficulty: 7, description: "Negotiate mining rights with the crystal entities of Novaris.", objectives: ["Present credentials", "Understand entity needs", "Draft agreement"], rewards: { xp: 140, credits: 400, resources: [{ resource: "Crystals", amount: 30 }, { resource: "Alien Artifacts", amount: 5 }] }, successThreshold: 5, chainId: null, requiredLevel: 7, wordChallenge: "negotiate", timeLimit: 240 },
  { id: "m-alpha-08", name: "Centauri Blockade Run", planetId: "alpha-proxima", type: "Combat", difficulty: 6, description: "Run a blockade to deliver supplies to Alpha Centauri colony.", objectives: ["Identify weak point", "Navigate through", "Deliver cargo"], rewards: { xp: 110, credits: 300, resources: [{ resource: "Fuel", amount: 15 }, { resource: "Tech Parts", amount: 8 }] }, successThreshold: 4, chainId: null, requiredLevel: 5, wordChallenge: "blockade", timeLimit: 120 },
  // Sirius missions (8)
  { id: "m-sirius-01", name: "Glacius Excavation", planetId: "sirius-glacius", type: "Science", difficulty: 6, description: "Excavate ancient structures beneath Glacius Prime's ice.", objectives: ["Drill through ice layer", "Access structure", "Translate inscriptions"], rewards: { xp: 130, credits: 350, resources: [{ resource: "Dark Matter", amount: 5 }, { resource: "Alien Artifacts", amount: 8 }] }, successThreshold: 5, chainId: "chain-sirius", requiredLevel: 6, wordChallenge: "excavate", timeLimit: 240 },
  { id: "m-sirius-02", name: "Inferno Assault", planetId: "sirius-inferno", type: "Combat", difficulty: 8, description: "Assault magma being fortress to retrieve stolen technology.", objectives: ["Breach outer defenses", "Navigate lava rivers", "Recover tech"], rewards: { xp: 160, credits: 450, resources: [{ resource: "Tech Parts", amount: 15 }, { resource: "Alien Artifacts", amount: 5 }] }, successThreshold: 5, chainId: "chain-sirius", requiredLevel: 8, wordChallenge: "assault", timeLimit: 180 },
  { id: "m-sirius-03", name: "Magnus Investigation", planetId: "sirius-magnus", type: "Exploration", difficulty: 7, description: "Investigate the electromagnetic anomalies of Magnus.", objectives: ["Calibrate sensors", "Map magnetic field", "Discover anomaly source"], rewards: { xp: 150, credits: 400, resources: [{ resource: "Tech Parts", amount: 12 }, { resource: "Plasma", amount: 10 }] }, successThreshold: 5, chainId: "chain-sirius", requiredLevel: 7, wordChallenge: "magnetic", timeLimit: 240 },
  { id: "m-sirius-04", name: "Ice Walker Summit", planetId: "sirius-glacius", type: "Diplomacy", difficulty: 7, description: "Attend summit with the Ice Walkers of Glacius Prime.", objectives: ["Reach summit location", "Present offerings", "Secure alliance"], rewards: { xp: 140, credits: 380, resources: [{ resource: "Plasma", amount: 12 }, { resource: "Alien Artifacts", amount: 6 }] }, successThreshold: 5, chainId: null, requiredLevel: 7, wordChallenge: "summit", timeLimit: 240 },
  { id: "m-sirius-05", name: "Magma Extraction", planetId: "sirius-inferno", type: "Science", difficulty: 8, description: "Extract exotic minerals from Inferno IX's magma flows.", objectives: ["Design heat-resistant container", "Collect magma sample", "Analyze composition"], rewards: { xp: 170, credits: 480, resources: [{ resource: "Fuel", amount: 20 }, { resource: "Titanium", amount: 15 }] }, successThreshold: 5, chainId: null, requiredLevel: 8, wordChallenge: "magma", timeLimit: 240 },
  { id: "m-sirius-06", name: "Magnus Rescue", planetId: "sirius-magnus", type: "Rescue", difficulty: 8, description: "Rescue research team stranded in Magnus's electromagnetic storms.", objectives: ["Locate team signal", "Shield from EM pulses", "Extract safely"], rewards: { xp: 160, credits: 420, resources: [{ resource: "Tech Parts", amount: 10 }, { resource: "Crystals", amount: 10 }] }, successThreshold: 5, chainId: null, requiredLevel: 7, wordChallenge: "electromagnetic", timeLimit: 150 },
  { id: "m-sirius-07", name: "Sirius Deep Scan", planetId: "sirius-glacius", type: "Exploration", difficulty: 6, description: "Perform deep scan of Glacius Prime's ocean beneath ice.", objectives: ["Deploy sub-ice drone", "Scan ocean floor", "Document findings"], rewards: { xp: 120, credits: 320, resources: [{ resource: "Dark Matter", amount: 4 }, { resource: "Plasma", amount: 8 }] }, successThreshold: 4, chainId: null, requiredLevel: 5, wordChallenge: "subsurface", timeLimit: 240 },
  { id: "m-sirius-08", name: "Magma Being Diplomacy", planetId: "sirius-inferno", type: "Diplomacy", difficulty: 9, description: "Negotiate peace with the magma beings after the fortress incident.", objectives: ["Survive audience", "Present reparations", "Sign ceasefire"], rewards: { xp: 180, credits: 500, resources: [{ resource: "Alien Artifacts", amount: 10 }, { resource: "Fuel", amount: 15 }] }, successThreshold: 6, chainId: null, requiredLevel: 9, wordChallenge: "ceasefire", timeLimit: 240 },
  // Andromeda missions (8)
  { id: "m-andro-01", name: "Verdantia Communion", planetId: "andromeda-verdant", type: "Diplomacy", difficulty: 9, description: "Achieve mental communion with the Verdantia planet-mind.", objectives: ["Prepare neural interface", "Sync with planet-mind", "Exchange knowledge"], rewards: { xp: 200, credits: 600, resources: [{ resource: "Alien Artifacts", amount: 15 }, { resource: "Crystals", amount: 20 }] }, successThreshold: 6, chainId: "chain-andromeda", requiredLevel: 9, wordChallenge: "communion", timeLimit: 300 },
  { id: "m-andro-02", name: "Hollow Infiltration", planetId: "andromeda-hollow", type: "Exploration", difficulty: 9, description: "Infiltrate the Hollow Nexus and discover its inner secrets.", objectives: ["Find entry point", "Navigate inner tunnels", "Reach the core"], rewards: { xp: 210, credits: 650, resources: [{ resource: "Dark Matter", amount: 12 }, { resource: "Tech Parts", amount: 15 }] }, successThreshold: 6, chainId: "chain-andromeda", requiredLevel: 10, wordChallenge: "infiltrate", timeLimit: 300 },
  { id: "m-andro-03", name: "Venenum Survival", planetId: "andromeda-venenum", type: "Rescue", difficulty: 10, description: "Survive Venenum's toxic atmosphere to rescue captured scientists.", objectives: ["Manufacture antidote", "Navigate acid plains", "Extract team"], rewards: { xp: 220, credits: 700, resources: [{ resource: "Plasma", amount: 20 }, { resource: "Alien Artifacts", amount: 10 }] }, successThreshold: 6, chainId: "chain-andromeda", requiredLevel: 10, wordChallenge: "antidote", timeLimit: 240 },
  { id: "m-andro-04", name: "Verdantia Harvest", planetId: "andromeda-verdant", type: "Science", difficulty: 9, description: "Harvest unique bio-compounds from Verdantia's living ecosystem.", objectives: ["Identify compounds", "Design harvest method", "Preserve viability"], rewards: { xp: 190, credits: 580, resources: [{ resource: "Food", amount: 30 }, { resource: "Crystals", amount: 15 }] }, successThreshold: 5, chainId: null, requiredLevel: 9, wordChallenge: "harvest", timeLimit: 300 },
  { id: "m-andro-05", name: "Hollow Defense", planetId: "andromeda-hollow", type: "Combat", difficulty: 10, description: "Defend the Hollow Nexus core from an external invasion.", objectives: ["Coordinate with inner defense", "Repel invaders", "Seal breaches"], rewards: { xp: 230, credits: 750, resources: [{ resource: "Tech Parts", amount: 20 }, { resource: "Dark Matter", amount: 10 }] }, successThreshold: 6, chainId: null, requiredLevel: 10, wordChallenge: "fortress", timeLimit: 180 },
  { id: "m-andro-06", name: "Venenum Research", planetId: "andromeda-venenum", type: "Science", difficulty: 10, description: "Research Venenum's toxic-adapted life for medical breakthroughs.", objectives: ["Capture specimen safely", "Analyze adaptation", "Synthesize applications"], rewards: { xp: 240, credits: 800, resources: [{ resource: "Plasma", amount: 25 }, { resource: "Food", amount: 15 }] }, successThreshold: 6, chainId: null, requiredLevel: 10, wordChallenge: "adaptation", timeLimit: 300 },
  { id: "m-andro-07", name: "Andromeda Alliance", planetId: "andromeda-verdant", type: "Diplomacy", difficulty: 10, description: "Forge an alliance between all Andromeda world civilizations.", objectives: ["Mediate disputes", "Draft constitution", "Sign alliance charter"], rewards: { xp: 250, credits: 900, resources: [{ resource: "Alien Artifacts", amount: 20 }, { resource: "Crystals", amount: 25 }] }, successThreshold: 7, chainId: null, requiredLevel: 12, wordChallenge: "alliance", timeLimit: 360 },
  { id: "m-andro-08", name: "Final Frontier", planetId: "andromeda-venenum", type: "Exploration", difficulty: 10, description: "The ultimate mission: chart the uncharted depths of Andromeda.", objectives: ["Cross the void", "Discover new worlds", "Return with data"], rewards: { xp: 300, credits: 1000, resources: [{ resource: "Dark Matter", amount: 20 }, { resource: "Alien Artifacts", amount: 15 }] }, successThreshold: 7, chainId: null, requiredLevel: 15, wordChallenge: "frontier", timeLimit: 360 },
  // Cross-system special missions (8)
  { id: "m-cross-01", name: "Supply Run Alpha", planetId: "alpha-proxima", type: "Rescue", difficulty: 3, description: "Emergency supply run to Alpha Centauri colony.", objectives: ["Load supplies", "Navigate warp corridor", "Deliver intact"], rewards: { xp: 75, credits: 180, resources: [{ resource: "Food", amount: 15 }, { resource: "Fuel", amount: 10 }] }, successThreshold: 3, chainId: "chain-supply", requiredLevel: 2, wordChallenge: "supplies", timeLimit: 120 },
  { id: "m-cross-02", name: "Warp Corridor Survey", planetId: "sirius-glacius", type: "Exploration", difficulty: 5, description: "Survey newly discovered warp corridor between Sol and Sirius.", objectives: ["Map corridor boundaries", "Test stability", "Report anomalies"], rewards: { xp: 100, credits: 260, resources: [{ resource: "Dark Matter", amount: 3 }, { resource: "Fuel", amount: 12 }] }, successThreshold: 4, chainId: "chain-supply", requiredLevel: 4, wordChallenge: "corridor", timeLimit: 180 },
  { id: "m-cross-03", name: "Deep Space Mining", planetId: "alpha-nova", type: "Science", difficulty: 5, description: "Mine rare dark matter deposits in deep space.", objectives: ["Locate deposit", "Extract safely", "Return cargo"], rewards: { xp: 110, credits: 280, resources: [{ resource: "Dark Matter", amount: 8 }, { resource: "Crystals", amount: 10 }] }, successThreshold: 4, chainId: "chain-supply", requiredLevel: 5, wordChallenge: "deposit", timeLimit: 240 },
  { id: "m-cross-04", name: "Pirate Hunt", planetId: "sol-earth", type: "Combat", difficulty: 4, description: "Track and eliminate notorious space pirate fleet.", objectives: ["Gather intel", "Locate pirate base", "Destroy fleet"], rewards: { xp: 90, credits: 250, resources: [{ resource: "Tech Parts", amount: 12 }, { resource: "Credits", amount: 500 }] }, successThreshold: 4, chainId: null, requiredLevel: 3, wordChallenge: "pirate", timeLimit: 180 },
  { id: "m-cross-05", name: "First Contact Protocol", planetId: "alpha-kepler", type: "Diplomacy", difficulty: 6, description: "Execute first contact protocol with unknown alien signal.", objectives: ["Decode signal", "Send response", "Establish communication"], rewards: { xp: 130, credits: 350, resources: [{ resource: "Alien Artifacts", amount: 8 }] }, successThreshold: 5, chainId: "chain-first-contact", requiredLevel: 6, wordChallenge: "signal", timeLimit: 240 },
  { id: "m-cross-06", name: "Ancient Artifact Hunt", planetId: "sirius-glacius", type: "Exploration", difficulty: 7, description: "Hunt for Precursor artifacts scattered across the galaxy.", objectives: ["Follow clues", "Navigate hazards", "Recover artifacts"], rewards: { xp: 150, credits: 400, resources: [{ resource: "Alien Artifacts", amount: 12 }, { resource: "Dark Matter", amount: 5 }] }, successThreshold: 5, chainId: "chain-first-contact", requiredLevel: 7, wordChallenge: "artifact", timeLimit: 300 },
  { id: "m-cross-07", name: "Galactic Crisis Response", planetId: "andromeda-hollow", type: "Rescue", difficulty: 9, description: "Respond to distress signal from Andromeda expedition.", objectives: ["Plot emergency course", "Survive hyperspace", "Reach stranded fleet"], rewards: { xp: 200, credits: 600, resources: [{ resource: "Fuel", amount: 25 }, { resource: "Tech Parts", amount: 15 }] }, successThreshold: 6, chainId: "chain-first-contact", requiredLevel: 9, wordChallenge: "crisis", timeLimit: 240 },
  { id: "m-cross-08", name: "Endgame: Convergence", planetId: "andromeda-verdant", type: "Science", difficulty: 10, description: "Unravel the mystery of the galactic convergence event.", objectives: ["Collect data from all systems", "Synthesize findings", "Prevent catastrophe"], rewards: { xp: 350, credits: 1200, resources: [{ resource: "Dark Matter", amount: 25 }, { resource: "Alien Artifacts", amount: 25 }, { resource: "Crystals", amount: 30 }] }, successThreshold: 7, chainId: "chain-first-contact", requiredLevel: 15, wordChallenge: "convergence", timeLimit: 360 },
];

const CHAIN_DATA: MissionChain[] = [
  { id: "chain-sol", name: "Sol System Initiative", missions: ["m-sol-02", "m-sol-05", "m-sol-06"], bonusReward: { resource: "Tech Parts", amount: 20 } },
  { id: "chain-earth-def", name: "Earth Defense Campaign", missions: ["m-sol-03", "m-sol-04"], bonusReward: { resource: "Crystals", amount: 15 } },
  { id: "chain-alpha", name: "Alpha Centauri Expedition", missions: ["m-alpha-01", "m-alpha-02", "m-alpha-03"], bonusReward: { resource: "Alien Artifacts", amount: 10 } },
  { id: "chain-sirius", name: "Sirius Deep Operations", missions: ["m-sirius-01", "m-sirius-02", "m-sirius-03"], bonusReward: { resource: "Dark Matter", amount: 10 } },
  { id: "chain-andromeda", name: "Andromeda Genesis", missions: ["m-andro-01", "m-andro-02", "m-andro-03"], bonusReward: { resource: "Alien Artifacts", amount: 20 } },
  { id: "chain-supply", name: "Interstellar Supply Lines", missions: ["m-cross-01", "m-cross-02", "m-cross-03"], bonusReward: { resource: "Fuel", amount: 30 } },
  { id: "chain-first-contact", name: "First Contact Initiative", missions: ["m-cross-05", "m-cross-06", "m-cross-07", "m-cross-08"], bonusReward: { resource: "Dark Matter", amount: 20 } },
];

const SHIP_DATA: Omit<Ship, "level" | "stats" | "equipment" | "fuel" | "hull" | "owned" | "selected" | "upgradeCost">[] = [
  { id: "ship-scout", name: "Nebula Scout", class: "Scout", maxLevel: 10, baseStats: { speed: 9, shields: 3, weapons: 2, cargo: 4, science: 5, stealth: 8 }, maxFuel: 100, maxHull: 80 },
  { id: "ship-fighter", name: "Viper MK-III", class: "Fighter", maxLevel: 10, baseStats: { speed: 7, shields: 5, weapons: 9, cargo: 2, science: 2, stealth: 4 }, maxFuel: 80, maxHull: 60 },
  { id: "ship-cruiser", name: "Titan's Hammer", class: "Cruiser", maxLevel: 10, baseStats: { speed: 5, shields: 8, weapons: 7, cargo: 6, science: 4, stealth: 2 }, maxFuel: 150, maxHull: 150 },
  { id: "ship-carrier", name: "Odyssey Carrier", class: "Carrier", maxLevel: 10, baseStats: { speed: 3, shields: 9, weapons: 6, cargo: 9, science: 5, stealth: 1 }, maxFuel: 200, maxHull: 200 },
  { id: "ship-science", name: "Discovery One", class: "Science Vessel", maxLevel: 10, baseStats: { speed: 5, shields: 4, weapons: 2, cargo: 5, science: 10, stealth: 3 }, maxFuel: 120, maxHull: 100 },
  { id: "ship-mining", name: "Asteroid Eater", class: "Mining Ship", maxLevel: 10, baseStats: { speed: 4, shields: 6, weapons: 3, cargo: 10, science: 4, stealth: 2 }, maxFuel: 130, maxHull: 120 },
  { id: "ship-stealth", name: "Phantom Cloaker", class: "Stealth", maxLevel: 10, baseStats: { speed: 7, shields: 3, weapons: 4, cargo: 3, science: 6, stealth: 10 }, maxFuel: 90, maxHull: 70 },
  { id: "ship-flagship", name: "Enterprise Nova", class: "Flagship", maxLevel: 10, baseStats: { speed: 6, shields: 8, weapons: 8, cargo: 7, science: 7, stealth: 5 }, maxFuel: 250, maxHull: 250 },
];

const EQUIPMENT_DATA: Equipment[] = [
  // Tier 1 - Basic
  { id: "eq-eng-1", name: "Ion Thruster", slot: "Engine", tier: 1, stats: { speed: 2 }, description: "Basic ion propulsion engine.", cost: 100 },
  { id: "eq-shd-1", name: "Deflector Grid", slot: "Shield", tier: 1, stats: { shields: 2 }, description: "Entry-level energy deflector.", cost: 100 },
  { id: "eq-wpn-1", name: "Pulse Cannon", slot: "Weapon", tier: 1, stats: { weapons: 2 }, description: "Standard pulse-based weapon.", cost: 100 },
  { id: "eq-scn-1", name: "Basic Scanner", slot: "Scanner", tier: 1, stats: { science: 2 }, description: "Short-range electromagnetic scanner.", cost: 100 },
  { id: "eq-crg-1", name: "Cargo Expander", slot: "Cargo", tier: 1, stats: { cargo: 2 }, description: "Modular cargo bay extension.", cost: 100 },
  { id: "eq-spc-1", name: "Repair Drone", slot: "Special", tier: 1, stats: { shields: 1, speed: 0 }, description: "Automated hull repair drone.", cost: 150 },
  // Tier 2 - Advanced
  { id: "eq-eng-2", name: "Warp Drive MK-II", slot: "Engine", tier: 2, stats: { speed: 4 }, description: "Second-generation warp propulsion.", cost: 300 },
  { id: "eq-shd-2", name: "Plasma Barrier", slot: "Shield", tier: 2, stats: { shields: 4 }, description: "Plasma-based energy barrier.", cost: 300 },
  { id: "eq-wpn-2", name: "Laser Array", slot: "Weapon", tier: 2, stats: { weapons: 4 }, description: "Multi-barrel laser weapon system.", cost: 300 },
  { id: "eq-scn-2", name: "Deep Scanner", slot: "Scanner", tier: 2, stats: { science: 4 }, description: "Long-range deep space scanner.", cost: 300 },
  { id: "eq-crg-2", name: "Quantum Bay", slot: "Cargo", tier: 2, stats: { cargo: 4 }, description: "Quantum-compressed cargo storage.", cost: 300 },
  { id: "eq-spc-2", name: "Cloaking Device", slot: "Special", tier: 2, stats: { stealth: 3 }, description: "Light-bending cloaking field.", cost: 400 },
  // Tier 3 - Elite
  { id: "eq-eng-3", name: "Hyperdrive", slot: "Engine", tier: 3, stats: { speed: 6 }, description: "Hyperdimensional propulsion system.", cost: 800 },
  { id: "eq-shd-3", name: "Quantum Shield", slot: "Shield", tier: 3, stats: { shields: 6 }, description: "Quantum probability-based shielding.", cost: 800 },
  { id: "eq-wpn-3", name: "Plasma Torpedo", slot: "Weapon", tier: 3, stats: { weapons: 6 }, description: "Devastating plasma-based torpedo launcher.", cost: 800 },
  { id: "eq-scn-3", name: "Psi Scanner", slot: "Scanner", tier: 3, stats: { science: 6 }, description: "Psionically-enhanced scanning array.", cost: 800 },
  { id: "eq-crg-3", name: "Void Container", slot: "Cargo", tier: 3, stats: { cargo: 6 }, description: "Dimensional void storage system.", cost: 800 },
  { id: "eq-spc-3", name: "Teleporter", slot: "Special", tier: 3, stats: { stealth: 2, speed: 2 }, description: "Short-range teleportation module.", cost: 1000 },
  // Tier 4 - Legendary
  { id: "eq-eng-4", name: "Precursor Engine", slot: "Engine", tier: 4, stats: { speed: 10 }, description: "Ancient Precursor propulsion technology.", cost: 2000 },
  { id: "eq-shd-4", name: "Dark Matter Shield", slot: "Shield", tier: 4, stats: { shields: 10 }, description: "Dark matter-powered invulnerability field.", cost: 2000 },
  { id: "eq-wpn-4", name: "Singularity Gun", slot: "Weapon", tier: 4, stats: { weapons: 10 }, description: "Micro-singularity projection weapon.", cost: 2000 },
  { id: "eq-scn-4", name: "Omniscience Array", slot: "Scanner", tier: 4, stats: { science: 10 }, description: "Near-omniscient scanning capability.", cost: 2000 },
  { id: "eq-crg-4", name: "Infinity Vault", slot: "Cargo", tier: 4, stats: { cargo: 10 }, description: "Infinite-dimensional storage vault.", cost: 2000 },
  { id: "eq-spc-4", name: "Time Distorion Field", slot: "Special", tier: 4, stats: { speed: 3, stealth: 3, shields: 3 }, description: "Local time distortion generator.", cost: 3000 },
];

const CREW_DATA: Omit<CrewMember, "assigned">[] = [
  { id: "crew-01", name: "Cmdr. Elara Vance", role: "Captain", skill: 8, morale: 90, health: 100, experience: 0, level: 1, specialization: "Leadership", trait: "Inspiring Presence", bio: "A decorated fleet commander with uncanny tactical intuition." },
  { id: "crew-02", name: "Lt. Kael Torres", role: "Pilot", skill: 9, morale: 85, health: 95, experience: 0, level: 1, specialization: "Evasion", trait: "Lightning Reflexes", bio: "The best pilot in three star systems, known for impossible maneuvers." },
  { id: "crew-03", name: "Dr. Zara Chen", role: "Scientist", skill: 10, morale: 80, health: 90, experience: 0, level: 1, specialization: "Xenobiology", trait: "Brilliant Mind", bio: "Genius xenobiologist who has catalogued hundreds of alien species." },
  { id: "crew-04", name: "Sgt. Marcus Webb", role: "Security", skill: 8, morale: 95, health: 100, experience: 0, level: 1, specialization: "Combat", trait: "Iron Will", bio: "Battle-hardened marine who never backs down from a fight." },
  { id: "crew-05", name: "Eng. Rin Nakamura", role: "Engineer", skill: 9, morale: 88, health: 92, experience: 0, level: 1, specialization: "Systems", trait: "Mechanical Genius", bio: "Can repair anything with a wrench and determination." },
  { id: "crew-06", name: "Dr. Lena Okafor", role: "Medic", skill: 8, morale: 82, health: 98, experience: 0, level: 1, specialization: "Emergency", trait: "Healing Touch", bio: "Gifted surgeon who has saved thousands across the galaxy." },
  { id: "crew-07", name: "Ambassador Thijs", role: "Diplomat", skill: 9, morale: 75, health: 88, experience: 0, level: 1, specialization: "Negotiation", trait: "Silver Tongue", bio: "Charismatic diplomat who has brokered peace in a dozen conflicts." },
  { id: "crew-08", name: "Pvt. Jax Rivera", role: "Security", skill: 7, morale: 90, health: 100, experience: 0, level: 1, specialization: "Tactics", trait: "Loyal Shield", bio: "Fiercely loyal soldier who protects his team at all costs." },
  { id: "crew-09", name: "Eng. Priya Singh", role: "Engineer", skill: 8, morale: 86, health: 90, experience: 0, level: 1, specialization: "Propulsion", trait: "Speed Demon", bio: "Warp drive specialist who pushes engines beyond their limits." },
  { id: "crew-10", name: "Dr. Oleg Petrov", role: "Scientist", skill: 9, morale: 78, health: 85, experience: 0, level: 1, specialization: "Physics", trait: "Theoretical Master", bio: "Theoretical physicist obsessed with understanding dark matter." },
  { id: "crew-11", name: "Cpt. Aisha Kwame", role: "Captain", skill: 7, morale: 92, health: 96, experience: 0, level: 1, specialization: "Exploration", trait: "Bold Explorer", bio: "Fearless explorer who thrives in the unknown." },
  { id: "crew-12", name: "Pilot Yuki Tanaka", role: "Pilot", skill: 8, morale: 84, health: 93, experience: 0, level: 1, specialization: "Stealth", trait: "Ghost Pilot", bio: "Silent pilot who can fly through enemy defenses undetected." },
  { id: "crew-13", name: "Dr. Amir Hassan", role: "Medic", skill: 9, morale: 80, health: 88, experience: 0, level: 1, specialization: "Toxicology", trait: "Poison Expert", bio: "Expert in treating exotic toxins and alien pathogens." },
  { id: "crew-14", name: "Lt. Valeria cruz", role: "Security", skill: 8, morale: 88, health: 95, experience: 0, level: 1, specialization: "Heavy Weapons", trait: "Firepower", bio: "Heavy weapons specialist with devastating accuracy." },
  { id: "crew-15", name: "Eng. Dmitri Volkov", role: "Engineer", skill: 7, morale: 82, health: 90, experience: 0, level: 1, specialization: "Weapons", trait: "Tinkerer", bio: "Creative engineer who modifies weapons in unconventional ways." },
  { id: "crew-16", name: "Dr. Mei Lin", role: "Scientist", skill: 10, morale: 76, health: 82, experience: 0, level: 1, specialization: "Archaeology", trait: "Ancient Lore", bio: "Expert in Precursor civilization artifacts and ruins." },
  { id: "crew-17", name: "Amb. Zara Khoury", role: "Diplomat", skill: 8, morale: 90, health: 94, experience: 0, level: 1, specialization: "Trade", trait: "Shrewd Dealer", bio: "Master negotiator who always gets the best deals." },
  { id: "crew-18", name: "Pilot Rex Blackwood", role: "Pilot", skill: 7, morale: 92, health: 98, experience: 0, level: 1, specialization: "Combat Flying", trait: "Ace", bio: "Fighter ace with dozens of confirmed space engagements." },
  { id: "crew-19", name: "Dr. Freya Nilsen", role: "Medic", skill: 8, morale: 84, health: 90, experience: 0, level: 1, specialization: "Psychology", trait: "Mind Healer", bio: "Ship's counselor who keeps crew morale high in deep space." },
  { id: "crew-20", name: "Cpt. Hiroshi Yamamoto", role: "Captain", skill: 9, morale: 88, health: 94, experience: 0, level: 1, specialization: "Strategy", trait: "Grand Admiral", bio: "Strategic genius who sees the chessboard of galactic politics." },
];

const RESOURCE_DATA: Omit<Resource, "amount">[] = [
  { id: "res-titanium", name: "Titanium", description: "Lightweight structural metal used in ship construction.", icon: "🔩", value: 10 },
  { id: "res-plasma", name: "Plasma", description: "Superheated ionized gas powering advanced systems.", icon: "⚡", value: 15 },
  { id: "res-dark-matter", name: "Dark Matter", description: "Mysterious substance with reality-bending properties.", icon: "🌑", value: 50 },
  { id: "res-crystals", name: "Crystals", description: "Energy-storing mineral formations.", icon: "💎", value: 20 },
  { id: "res-fuel", name: "Fuel", description: "Standard starship propulsion fuel.", icon: "🛢️", value: 5 },
  { id: "res-food", name: "Food", description: "Crew sustenance rations.", icon: "🍎", value: 3 },
  { id: "res-tech-parts", name: "Tech Parts", description: "Advanced technological components.", icon: "⚙️", value: 25 },
  { id: "res-alien-artifacts", name: "Alien Artifacts", description: "Mysterious objects of alien origin.", icon: "🔍", value: 100 },
];

const STATION_DATA: SpaceStation[] = [
  { id: "sta-earth-orbit", name: "Earth Orbital Station", system: "Sol", services: ["Repair", "Refuel", "Trade", "Recruit"], tradeRates: { "res-titanium": 1.0, "res-plasma": 1.0, "res-fuel": 0.8, "res-food": 0.9 } },
  { id: "sta-luna-base", name: "Luna Base Alpha", system: "Sol", services: ["Mining", "Trade"], tradeRates: { "res-titanium": 0.7, "res-crystals": 0.8, "res-fuel": 1.0 } },
  { id: "sta-mars-dock", name: "Mars Dockyard", system: "Sol", services: ["Repair", "Upgrade", "Trade"], tradeRates: { "res-tech-parts": 0.8, "res-titanium": 0.9, "res-fuel": 0.9 } },
  { id: "sta-proxima-colony", name: "Proxima Colony Hub", system: "Alpha Centauri", services: ["Trade", "Refuel", "Repair", "Diplomacy"], tradeRates: { "res-food": 0.7, "res-fuel": 1.1, "res-alien-artifacts": 0.9 } },
  { id: "sta-kepler-station", name: "Kepler Research Post", system: "Alpha Centauri", services: ["Research", "Trade", "Recruit"], tradeRates: { "res-crystals": 0.7, "res-plasma": 0.8, "res-tech-parts": 0.9 } },
  { id: "sta-nova-outpost", name: "Nova Mining Outpost", system: "Alpha Centauri", services: ["Mining", "Trade", "Refuel"], tradeRates: { "res-crystals": 0.5, "res-dark-matter": 0.9, "res-titanium": 0.8 } },
  { id: "sta-glacius-port", name: "Glacius Ice Port", system: "Sirius", services: ["Trade", "Research", "Repair"], tradeRates: { "res-plasma": 0.6, "res-dark-matter": 0.8, "res-crystals": 0.7 } },
  { id: "sta-magnus-lab", name: "Magnus Research Lab", system: "Sirius", services: ["Research", "Trade", "Upgrade"], tradeRates: { "res-tech-parts": 0.6, "res-plasma": 0.7, "res-dark-matter": 0.7 } },
  { id: "sta-verdantia-embassy", name: "Verdantia Embassy", system: "Andromeda", services: ["Diplomacy", "Trade", "Research"], tradeRates: { "res-alien-artifacts": 0.5, "res-food": 0.5, "res-crystals": 0.6 } },
  { id: "sta-hollow-nexus", name: "Hollow Nexus Hub", system: "Andromeda", services: ["Trade", "Upgrade", "Research", "Diplomacy"], tradeRates: { "res-dark-matter": 0.5, "res-tech-parts": 0.6, "res-alien-artifacts": 0.6 } },
];

const ALIEN_DATA: Omit<AlienSpecies, "firstContact" | "relationship">[] = [
  { id: "alien-thorian", name: "Thorians", homeworld: "alpha-kepler", traits: ["Plant-based", "Bioluminescent", "Telepathic"], disposition: "Friendly", technologyUnlocks: ["Bio-luminescence Shield", "Spore Communication"], description: "Sentient plant beings who communicate through light patterns." },
  { id: "alien-crystalis", name: "Crystalis Collective", homeworld: "alpha-nova", traits: ["Crystalline", "Hive Mind", "Energy Beings"], disposition: "Neutral", technologyUnlocks: ["Crystal Energy Core", "Hive Network Scanner"], description: "A collective consciousness of sentient crystal formations." },
  { id: "alien-icewalk", name: "Glacians", homeworld: "sirius-glacius", traits: ["Ice-adapted", "Ancient", "Philosophical"], disposition: "Friendly", technologyUnlocks: ["Cryo-preservation", "Ancient Navigation Charts"], description: "Ancient beings who have survived beneath the ice for eons." },
  { id: "alien-magma", name: "Pyroclasts", homeworld: "sirius-inferno", traits: ["Magma beings", "Aggressive", "Forge Masters"], disposition: "Hostile", technologyUnlocks: ["Magma Resistant Hull", "Plasma Forge"], description: "Warlike beings of living magma who revere the forge." },
  { id: "alien-magneto", name: "Magnetics", homeworld: "sirius-magnus", traits: ["Electromagnetic", "Fragmented", "Data-driven"], disposition: "Mysterious", technologyUnlocks: ["EM Shield", "Data Compression Array"], description: "Beings of pure electromagnetic energy organized into data clusters." },
  { id: "alien-verdant", name: "Verdanti", homeworld: "andromeda-verdant", traits: ["Planet-mind", "Symbiotic", "Vast Intelligence"], disposition: "Friendly", technologyUnlocks: ["Bio-ship Hull", "Planetary Network Interface"], description: "An entire planet that exists as a single sentient organism." },
  { id: "alien-hollow", name: "Nexari", homeworld: "andromeda-hollow", traits: ["Shell dwellers", "Multi-species", "Engineers"], disposition: "Neutral", technologyUnlocks: ["Dyson Construction", "Habitat Generator"], description: "An alliance of species living inside their hollow world." },
  { id: "alien-toxic", name: "Venari", homeworld: "andromeda-venenum", traits: ["Toxic-adapted", "Resilient", "Isolationist"], disposition: "Hostile", technologyUnlocks: ["Toxin Filter", "Acid Resistance Plating"], description: "Hardy beings who thrive in the most toxic environments." },
  { id: "alien-burrow", name: "Proximans", homeworld: "alpha-proxima", traits: ["Subterranean", "Communal", "Resourceful"], disposition: "Friendly", technologyUnlocks: ["Tunneling System", "Underwater Habitat"], description: "Burrowing beings who build vast underground cities." },
  { id: "alien-drone", name: "Automata", homeworld: "sol-venus", traits: ["Robotic", "Self-replicating", "Evolving"], disposition: "Mysterious", technologyUnlocks: ["Self-Repair System", "Swarm Intelligence Module"], description: "Ancient automated drones that have evolved beyond their original programming." },
];

const ENCOUNTER_DATA: Encounter[] = [
  { id: "enc-asteroid", name: "Asteroid Field", type: "Hazard", description: "Navigate through a dense asteroid field!", difficulty: 2, choices: [{ text: "Fly through carefully", outcome: "success", reward: { type: "crystals", amount: 5 } }, { text: "Blast a path", outcome: "risky", reward: { type: "fuel", amount: -5 } }] },
  { id: "enc-pirates", name: "Pirate Ambush", type: "Combat", description: "Space pirates demand your cargo!", difficulty: 4, choices: [{ text: "Fight them off", outcome: "success", reward: { type: "credits", amount: 100 } }, { text: "Pay tribute", outcome: "loss", reward: { type: "credits", amount: -50 } }, { text: "Outrun them", outcome: "risky", reward: { type: "fuel", amount: -10 } }] },
  { id: "enc-distress", name: "Distress Signal", type: "Event", description: "A faint distress signal emanates from a derelict ship.", difficulty: 3, choices: [{ text: "Investigate", outcome: "success", reward: { type: "tech-parts", amount: 8 } }, { text: "Ignore and continue", outcome: "neutral", reward: { type: "xp", amount: 10 } }] },
  { id: "enc-nebula", name: "Nebula Passage", type: "Hazard", description: "A beautiful but dangerous nebula blocks your path.", difficulty: 3, choices: [{ text: "Scan and navigate", outcome: "success", reward: { type: "plasma", amount: 5 } }, { text: "Push through at full speed", outcome: "risky", reward: { type: "hull", amount: -10 } }] },
  { id: "enc-trader", name: "Space Trader", type: "Event", description: "A lone trader offers exotic goods at suspicious prices.", difficulty: 1, choices: [{ text: "Trade fairly", outcome: "success", reward: { type: "food", amount: 10 } }, { text: "Haggle aggressively", outcome: "risky", reward: { type: "credits", amount: 50 } }] },
  { id: "enc-anomaly", name: "Space Anomaly", type: "Mystery", description: "A strange distortion in spacetime appears ahead!", difficulty: 5, choices: [{ text: "Study the anomaly", outcome: "success", reward: { type: "dark-matter", amount: 3 } }, { text: "Fly around it", outcome: "neutral", reward: { type: "xp", amount: 20 } }, { text: "Enter the anomaly", outcome: "risky", reward: { type: "alien-artifacts", amount: 5 } }] },
  { id: "enc-derelict", name: "Derelict Station", type: "Event", description: "An abandoned space station drifts in the void.", difficulty: 3, choices: [{ text: "Board and salvage", outcome: "success", reward: { type: "tech-parts", amount: 5 } }, { text: "Scan from distance", outcome: "neutral", reward: { type: "xp", amount: 15 } }] },
  { id: "enc-solar-flare", name: "Solar Flare", type: "Hazard", description: "A nearby star erupts with a massive solar flare!", difficulty: 6, choices: [{ text: "Raise shields", outcome: "success", reward: { type: "xp", amount: 25 } }, { text: "Hide behind asteroid", outcome: "risky", reward: { type: "hull", amount: -15 } }] },
  { id: "enc-aliens", name: "Alien Vessel", type: "Diplomacy", description: "An unknown alien ship hails you on all frequencies.", difficulty: 5, choices: [{ text: "Respond peacefully", outcome: "success", reward: { type: "alien-artifacts", amount: 3 } }, { text: "Attempt communication", outcome: "risky", reward: { type: "xp", amount: 30 } }, { text: "Flee immediately", outcome: "neutral", reward: { type: "fuel", amount: -5 } }] },
  { id: "enc-wormhole", name: "Wormhole", type: "Mystery", description: "A stable wormhole opens, offering a shortcut.", difficulty: 4, choices: [{ text: "Enter the wormhole", outcome: "success", reward: { type: "dark-matter", amount: 5 } }, { text: "Mark coordinates and pass", outcome: "neutral", reward: { type: "xp", amount: 20 } }] },
];

const ACHIEVEMENT_DATA: Omit<Achievement, "unlocked">[] = [
  { id: "ach-first-flight", name: "First Flight", description: "Complete your first mission.", condition: "complete_1_mission", reward: { type: "credits", amount: 200 }, icon: "🚀" },
  { id: "ach-explorer", name: "Pathfinder", description: "Discover 5 planets.", condition: "discover_5_planets", reward: { type: "credits", amount: 500 }, icon: "🗺️" },
  { id: "ach-cartographer", name: "Master Cartographer", description: "Discover all 12 planets.", condition: "discover_all_planets", reward: { type: "credits", amount: 2000 }, icon: "🌐" },
  { id: "ach-explorer-elite", name: "Elite Explorer", description: "Fully explore 5 planets.", condition: "explore_5_planets", reward: { type: "credits", amount: 800 }, icon: "🔭" },
  { id: "ach-10-missions", name: "Veteran Commander", description: "Complete 10 missions.", condition: "complete_10_missions", reward: { type: "credits", amount: 600 }, icon: "⭐" },
  { id: "ach-25-missions", name: "Galaxy Legend", description: "Complete 25 missions.", condition: "complete_25_missions", reward: { type: "credits", amount: 1500 }, icon: "🌟" },
  { id: "ach-all-chains", name: "Chain Master", description: "Complete all mission chains.", condition: "complete_all_chains", reward: { type: "credits", amount: 3000 }, icon: "🔗" },
  { id: "ach-first-contact", name: "First Contact", description: "Make first contact with an alien species.", condition: "first_contact_1", reward: { type: "credits", amount: 300 }, icon: "👽" },
  { id: "ach-diplomat", name: "Galactic Diplomat", description: "Establish relations with 5 alien species.", condition: "contact_5_aliens", reward: { type: "credits", amount: 1000 }, icon: "🤝" },
  { id: "ach-all-aliens", name: "Xeno-Ambassador", description: "Contact all 10 alien species.", condition: "contact_all_aliens", reward: { type: "credits", amount: 2500 }, icon: "🌍" },
  { id: "ach-fleet", name: "Fleet Commander", description: "Own 4 different ship classes.", condition: "own_4_ships", reward: { type: "credits", amount: 800 }, icon: "🚢" },
  { id: "ach-full-fleet", name: "Armada", description: "Own all 8 ship classes.", condition: "own_all_ships", reward: { type: "credits", amount: 3000 }, icon: "⚓" },
  { id: "ach-level-10", name: "Seasoned Officer", description: "Reach Commander level 10.", condition: "reach_level_10", reward: { type: "credits", amount: 500 }, icon: "🎖️" },
  { id: "ach-level-25", name: "Admiral", description: "Reach Commander level 25.", condition: "reach_level_25", reward: { type: "credits", amount: 2000 }, icon: "🏅" },
  { id: "ach-level-40", name: "Grand Admiral", description: "Reach Commander level 40.", condition: "reach_level_40", reward: { type: "credits", amount: 5000 }, icon: "👑" },
  { id: "ach-rich", name: "Space Tycoon", description: "Accumulate 5000 credits.", condition: "earn_5000_credits", reward: { type: "dark-matter", amount: 5 }, icon: "💰" },
  { id: "ach-collector", name: "Artifact Collector", description: "Collect 50 alien artifacts.", condition: "collect_50_artifacts", reward: { type: "credits", amount: 1500 }, icon: "🏺" },
  { id: "ach-max-crew", name: "Elite Crew", description: "Get 4 crew members to level 5.", condition: "crew_level_5_x4", reward: { type: "credits", amount: 1000 }, icon: "👥" },
  { id: "ach-rep-high", name: "Galactic Hero", description: "Reach reputation score of 500.", condition: "rep_500", reward: { type: "alien-artifacts", amount: 10 }, icon: "🏆" },
  { id: "ach-endgame", name: "Convergence", description: "Complete the Endgame: Convergence mission.", condition: "complete_endgame", reward: { type: "credits", amount: 5000 }, icon: "✨" },
];

// ---------------------------------------------------------------------------
// State Management
// ---------------------------------------------------------------------------

let state: SpaceMissionState | null = null;

function ensureInit(): SpaceMissionState {
  if (state) return state;
  state = createInitialState();
  return state;
}

function createInitialState(): SpaceMissionState {
  const planets: Planet[] = PLANET_DATA.map((p) => ({ ...p, discovered: false, explored: false }));
  planets[2].discovered = true; // Earth is known

  const missions: Mission[] = MISSION_DATA.map((m) => ({ ...m, completed: false, available: m.requiredLevel <= 1 }));

  const ships: Ship[] = SHIP_DATA.map((s, i) => ({
    ...s,
    level: 1,
    stats: { ...s.baseStats },
    equipment: { Engine: null, Shield: null, Weapon: null, Scanner: null, Cargo: null, Special: null },
    fuel: s.maxFuel,
    hull: s.maxHull,
    owned: i === 0,
    selected: i === 0,
    upgradeCost: 200,
  }));

  const crew: CrewMember[] = CREW_DATA.map((c) => ({ ...c, assigned: false }));

  const resources: Resource[] = RESOURCE_DATA.map((r) => ({ ...r, amount: r.id === "res-fuel" ? 50 : r.id === "res-food" ? 30 : 10 }));

  const aliens: AlienSpecies[] = ALIEN_DATA.map((a) => ({ ...a, firstContact: false, relationship: 0 }));

  const achievements: Achievement[] = ACHIEVEMENT_DATA.map((a) => ({ ...a, unlocked: false }));

  const dailyAnomaly = generateDailyAnomaly();

  return {
    commander: { name: "Commander", level: 1, xp: 0, xpToNext: 100, credits: 500, reputation: 0, totalMissions: 0, successfulMissions: 0, planetsDiscovered: 1, aliensEncountered: 0 },
    planets,
    missions,
    missionChains: CHAIN_DATA,
    ships,
    crew,
    resources,
    stations: STATION_DATA,
    aliens,
    encounters: ENCOUNTER_DATA,
    achievements,
    dailyAnomaly,
    activeMission: null,
    missionLog: [],
    discoveredPlanets: ["sol-earth"],
    exploredPlanets: [],
    assignedCrew: [],
    selectedShipId: "ship-scout",
    tradeHistory: [],
  };
}

function generateDailyAnomaly(): DailyAnomaly {
  const anomalies: Omit<DailyAnomaly, "id">[] = [
    { name: "Ion Storm Surge", description: "Ion storms sweep through the sector, disrupting communications.", effect: "Shield systems operate at 80% efficiency.", bonusResource: "res-plasma", bonusAmount: 10, modifierType: "shields", modifierValue: -0.2 },
    { name: "Dark Matter Ripple", description: "A ripple in dark matter flow reveals hidden deposits.", effect: "Dark matter collection rate doubled.", bonusResource: "res-dark-matter", bonusAmount: 8, modifierType: "dark-matter", modifierValue: 0.5 },
    { name: "Crystal Resonance", description: "Crystal formations across the galaxy begin resonating.", effect: "Crystal mining yield increased by 50%.", bonusResource: "res-crystals", bonusAmount: 12, modifierType: "crystals", modifierValue: 0.5 },
    { name: "Trade Route Disruption", description: "Pirate activity disrupts major trade routes.", effect: "Trading costs increased by 30%.", bonusResource: "res-titanium", bonusAmount: 5, modifierType: "trade", modifierValue: -0.3 },
    { name: "Bioluminescent Bloom", description: "Bioluminescent organisms bloom across ocean worlds.", effect: "Food production boosted on ocean planets.", bonusResource: "res-food", bonusAmount: 15, modifierType: "food", modifierValue: 0.5 },
    { name: "Solar Flare Season", description: "Nearby stars enter an active flare cycle.", effect: "Fuel consumption increased by 25%.", bonusResource: "res-fuel", bonusAmount: 8, modifierType: "fuel", modifierValue: -0.25 },
    { name: "Ancient Signal", description: "An ancient Precursor signal pulses from deep space.", effect: "Science missions grant 50% more XP.", bonusResource: "res-tech-parts", bonusAmount: 8, modifierType: "science-xp", modifierValue: 0.5 },
    { name: "Wormhole Network", description: "A network of stable wormholes temporarily appears.", effect: "Travel time reduced, fuel costs halved.", bonusResource: "res-alien-artifacts", bonusAmount: 3, modifierType: "fuel-cost", modifierValue: -0.5 },
    { name: "Gravitational Anomaly", description: "Strange gravitational effects alter ship handling.", effect: "Speed stats temporarily reduced by 15%.", bonusResource: "res-dark-matter", bonusAmount: 5, modifierType: "speed", modifierValue: -0.15 },
    { name: "Diplomatic Summit", description: "A galactic diplomatic summit is in session.", effect: "Diplomacy missions grant double rewards.", bonusResource: "res-tech-parts", bonusAmount: 6, modifierType: "diplomacy-reward", modifierValue: 1.0 },
  ];

  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const index = seed % anomalies.length;
  const anomaly = anomalies[index];
  return { ...anomaly, id: `daily-${seed}` };
}

// ---------------------------------------------------------------------------
// XP and Leveling Helpers
// ---------------------------------------------------------------------------

function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.3, level - 1));
}

function checkLevelUp(): void {
  const s = ensureInit();
  while (s.commander.xp >= s.commander.xpToNext && s.commander.level < 40) {
    s.commander.xp -= s.commander.xpToNext;
    s.commander.level += 1;
    s.commander.xpToNext = xpForLevel(s.commander.level);
    s.commander.credits += s.commander.level * 50;
  }
}

function checkAchievements(): void {
  const s = ensureInit();
  const checks: Record<string, () => boolean> = {
    complete_1_mission: () => s.commander.totalMissions >= 1,
    discover_5_planets: () => s.commander.planetsDiscovered >= 5,
    discover_all_planets: () => s.commander.planetsDiscovered >= 12,
    explore_5_planets: () => s.exploredPlanets.length >= 5,
    complete_10_missions: () => s.commander.totalMissions >= 10,
    complete_25_missions: () => s.commander.totalMissions >= 25,
    complete_all_chains: () => s.missionChains.every((c) => c.missions.every((mid) => s.missions.find((m) => m.id === mid)?.completed)),
    first_contact_1: () => s.commander.aliensEncountered >= 1,
    contact_5_aliens: () => s.commander.aliensEncountered >= 5,
    contact_all_aliens: () => s.commander.aliensEncountered >= 10,
    own_4_ships: () => s.ships.filter((sh) => sh.owned).length >= 4,
    own_all_ships: () => s.ships.filter((sh) => sh.owned).length >= 8,
    reach_level_10: () => s.commander.level >= 10,
    reach_level_25: () => s.commander.level >= 25,
    reach_level_40: () => s.commander.level >= 40,
    earn_5000_credits: () => s.commander.credits >= 5000,
    collect_50_artifacts: () => smGetResourceAmount("res-alien-artifacts") >= 50,
    crew_level_5_x4: () => s.crew.filter((c) => c.level >= 5).length >= 4,
    rep_500: () => s.commander.reputation >= 500,
    complete_endgame: () => s.missions.find((m) => m.id === "m-cross-08")?.completed === true,
  };

  for (const ach of s.achievements) {
    if (!ach.unlocked && checks[ach.condition]?.()) {
      ach.unlocked = true;
      if (ach.reward.type === "credits") s.commander.credits += ach.reward.amount;
    }
  }
}

function unlockMissionsByLevel(): void {
  const s = ensureInit();
  for (const m of s.missions) {
    if (!m.completed && !m.available && s.commander.level >= m.requiredLevel) {
      m.available = true;
    }
  }
}

// ---------------------------------------------------------------------------
// State Accessors
// ---------------------------------------------------------------------------

export function smGetState(): SpaceMissionState {
  return ensureInit();
}

export function smResetState(): SpaceMissionState {
  state = null;
  return ensureInit();
}

export function smGetCommander(): Commander {
  return ensureInit().commander;
}

export function smGetCommanderLevel(): number {
  return ensureInit().commander.level;
}

export function smAddXP(amount: number): number {
  const s = ensureInit();
  s.commander.xp += amount;
  checkLevelUp();
  unlockMissionsByLevel();
  checkAchievements();
  return s.commander.xp;
}

export function smGetReputation(): number {
  return ensureInit().commander.reputation;
}

// ---------------------------------------------------------------------------
// Planet Functions
// ---------------------------------------------------------------------------

export function smGetPlanets(): Planet[] {
  return ensureInit().planets;
}

export function smGetPlanetById(id: string): Planet | undefined {
  return ensureInit().planets.find((p) => p.id === id);
}

export function smGetStarSystems(): string[] {
  return ["Sol", "Alpha Centauri", "Sirius", "Andromeda"];
}

export function smGetPlanetsBySystem(system: string): Planet[] {
  return ensureInit().planets.filter((p) => p.system === system);
}

export function smGetDiscoveredPlanets(): Planet[] {
  return ensureInit().planets.filter((p) => p.discovered);
}

export function smDiscoverPlanet(id: string): Planet | undefined {
  const s = ensureInit();
  const planet = s.planets.find((p) => p.id === id);
  if (planet && !planet.discovered) {
    planet.discovered = true;
    if (!s.discoveredPlanets.includes(id)) s.discoveredPlanets.push(id);
    s.commander.planetsDiscovered = s.discoveredPlanets.length;
    s.commander.xp += 20;
    checkLevelUp();
    checkAchievements();
  }
  return planet;
}

export function smExplorePlanet(id: string): Planet | undefined {
  const s = ensureInit();
  const planet = s.planets.find((p) => p.id === id);
  if (planet && planet.discovered && !planet.explored) {
    planet.explored = true;
    if (!s.exploredPlanets.includes(id)) s.exploredPlanets.push(id);
    s.commander.xp += 50;
    s.commander.credits += 100;
    checkLevelUp();
    checkAchievements();
  }
  return planet;
}

export function smGetStarChart(): number {
  const s = ensureInit();
  const total = s.planets.length;
  const discovered = s.discoveredPlanets.length;
  return total > 0 ? Math.round((discovered / total) * 100) : 0;
}

// ---------------------------------------------------------------------------
// Mission Functions
// ---------------------------------------------------------------------------

export function smGetMissions(): Mission[] {
  return ensureInit().missions;
}

export function smGetAvailableMissions(): Mission[] {
  const s = ensureInit();
  return s.missions.filter((m) => m.available && !m.completed);
}

export function smGetMissionsByType(type: MissionType): Mission[] {
  return ensureInit().missions.filter((m) => m.type === type && m.available && !m.completed);
}

export function smGetMissionsByPlanet(planetId: string): Mission[] {
  return ensureInit().missions.filter((m) => m.planetId === planetId && m.available && !m.completed);
}

export function smGetMissionById(id: string): Mission | undefined {
  return ensureInit().missions.find((m) => m.id === id);
}

export function smGetActiveMission(): Mission | undefined {
  const s = ensureInit();
  if (!s.activeMission) return undefined;
  return s.missions.find((m) => m.id === s.activeMission);
}

export function smLaunchMission(missionId: string): Mission | undefined {
  const s = ensureInit();
  const mission = s.missions.find((m) => m.id === missionId);
  if (!mission || !mission.available || mission.completed) return undefined;
  s.activeMission = missionId;
  return mission;
}

export function smCompleteMission(missionId: string, score: number): { success: boolean; rewards: Record<string, number> } {
  const s = ensureInit();
  const mission = s.missions.find((m) => m.id === missionId);
  if (!mission) return { success: false, rewards: {} };

  const success = score >= mission.successThreshold;
  const rewards: Record<string, number> = {};

  if (success) {
    mission.completed = true;
    s.commander.totalMissions += 1;
    s.commander.successfulMissions += 1;
    rewards.xp = mission.rewards.xp;
    rewards.credits = mission.rewards.credits;
    for (const r of mission.rewards.resources) {
      smAddResource(r.resource, r.amount);
      rewards[r.resource] = r.amount;
    }
    s.commander.xp += mission.rewards.xp;
    s.commander.credits += mission.rewards.credits;
    s.commander.reputation += Math.floor(mission.difficulty * 5);

    // Discover the mission's planet
    smDiscoverPlanet(mission.planetId);

    // Check chain completion
    for (const chain of s.missionChains) {
      if (chain.missions.includes(missionId)) {
        const allDone = chain.missions.every((mid) => s.missions.find((m) => m.id === mid)?.completed);
        if (allDone) {
          smAddResource(chain.bonusReward.resource, chain.bonusReward.amount);
          rewards[`chain-bonus-${chain.bonusReward.resource}`] = chain.bonusReward.amount;
          s.commander.credits += 200;
          rewards["chain-bonus-credits"] = 200;
        }
      }
    }
  } else {
    s.commander.totalMissions += 1;
    rewards.xp = Math.floor(mission.rewards.xp * 0.3);
    s.commander.xp += rewards.xp;
  }

  // Damage crew morale slightly on failure
  if (!success) {
    for (const cid of s.assignedCrew) {
      const crew = s.crew.find((c) => c.id === cid);
      if (crew) crew.morale = Math.max(0, crew.morale - 5);
    }
  } else {
    // Boost crew experience
    for (const cid of s.assignedCrew) {
      const crew = s.crew.find((c) => c.id === cid);
      if (crew) {
        crew.experience += mission.difficulty * 10;
        crew.morale = Math.min(100, crew.morale + 5);
        if (crew.experience >= crew.level * 100) {
          crew.level += 1;
          crew.experience = 0;
          crew.skill = Math.min(10, crew.skill + 1);
        }
      }
    }
  }

  s.activeMission = null;
  s.missionLog.push({ missionId, result: success ? "success" : "failure", date: new Date().toISOString(), rewards });
  checkLevelUp();
  unlockMissionsByLevel();
  checkAchievements();
  return { success, rewards };
}

export function smAbortMission(): void {
  const s = ensureInit();
  s.activeMission = null;
}

export function smGetMissionChains(): MissionChain[] {
  return ensureInit().missionChains;
}

export function smGetMissionLog(): SpaceMissionState["missionLog"] {
  return ensureInit().missionLog;
}

export function smGetMissionsCompleted(): number {
  return ensureInit().missions.filter((m) => m.completed).length;
}

// ---------------------------------------------------------------------------
// Ship Functions
// ---------------------------------------------------------------------------

export function smGetShips(): Ship[] {
  return ensureInit().ships;
}

export function smGetShipById(id: string): Ship | undefined {
  return ensureInit().ships.find((s) => s.id === id);
}

export function smGetSelectedShip(): Ship | undefined {
  const s = ensureInit();
  return s.ships.find((sh) => sh.id === s.selectedShipId);
}

export function smSelectShip(id: string): Ship | undefined {
  const s = ensureInit();
  const ship = s.ships.find((sh) => sh.id === id);
  if (ship && ship.owned) {
    s.ships.forEach((sh) => (sh.selected = false));
    ship.selected = true;
    s.selectedShipId = id;
  }
  return ship;
}

export function smBuyShip(id: string): Ship | undefined {
  const s = ensureInit();
  const ship = s.ships.find((sh) => sh.id === id);
  if (!ship || ship.owned) return undefined;
  const costs: Record<string, number> = { "ship-fighter": 800, "ship-cruiser": 1500, "ship-carrier": 3000, "ship-science": 1200, "ship-mining": 1000, "ship-stealth": 2000, "ship-flagship": 5000 };
  const cost = costs[id] ?? 1000;
  if (s.commander.credits < cost) return undefined;
  s.commander.credits -= cost;
  ship.owned = true;
  checkAchievements();
  return ship;
}

export function smUpgradeShip(id: string): Ship | undefined {
  const s = ensureInit();
  const ship = s.ships.find((sh) => sh.id === id);
  if (!ship || !ship.owned || ship.level >= ship.maxLevel) return undefined;
  if (s.commander.credits < ship.upgradeCost) return undefined;
  s.commander.credits -= ship.upgradeCost;
  ship.level += 1;
  ship.upgradeCost = Math.floor(ship.upgradeCost * 1.5);
  // Each level adds +1 to all stats
  ship.stats = {
    speed: ship.baseStats.speed + ship.level,
    shields: ship.baseStats.shields + ship.level,
    weapons: ship.baseStats.weapons + ship.level,
    cargo: ship.baseStats.cargo + ship.level,
    science: ship.baseStats.science + ship.level,
    stealth: ship.baseStats.stealth + ship.level,
  };
  ship.maxHull += 20;
  ship.hull = ship.maxHull;
  ship.maxFuel += 10;
  ship.fuel = ship.maxFuel;
  return ship;
}

export function smGetEquipment(): Equipment[] {
  return EQUIPMENT_DATA;
}

export function smGetEquipmentByTier(tier: EquipmentTier): Equipment[] {
  return EQUIPMENT_DATA.filter((e) => e.tier === tier);
}

export function smGetEquipmentBySlot(slot: EquipmentSlot): Equipment[] {
  return EQUIPMENT_DATA.filter((e) => e.slot === slot);
}

export function smEquipItem(shipId: string, equipmentId: string): boolean {
  const s = ensureInit();
  const ship = s.ships.find((sh) => sh.id === shipId);
  const equip = EQUIPMENT_DATA.find((e) => e.id === equipmentId);
  if (!ship || !equip) return false;
  ship.equipment[equip.slot] = equip.id;
  // Recalculate stats
  smRecalculateShipStats(ship);
  return true;
}

export function smUnequipItem(shipId: string, slot: EquipmentSlot): boolean {
  const s = ensureInit();
  const ship = s.ships.find((sh) => sh.id === shipId);
  if (!ship) return false;
  ship.equipment[slot] = null;
  smRecalculateShipStats(ship);
  return true;
}

function smRecalculateShipStats(ship: Ship): void {
  const base: ShipStats = {
    speed: ship.baseStats.speed + ship.level,
    shields: ship.baseStats.shields + ship.level,
    weapons: ship.baseStats.weapons + ship.level,
    cargo: ship.baseStats.cargo + ship.level,
    science: ship.baseStats.science + ship.level,
    stealth: ship.baseStats.stealth + ship.level,
  };
  for (const slot of Object.keys(ship.equipment) as EquipmentSlot[]) {
    const eqId = ship.equipment[slot];
    if (eqId) {
      const eq = EQUIPMENT_DATA.find((e) => e.id === eqId);
      if (eq && eq.stats) {
        if (eq.stats.speed) base.speed += eq.stats.speed;
        if (eq.stats.shields) base.shields += eq.stats.shields;
        if (eq.stats.weapons) base.weapons += eq.stats.weapons;
        if (eq.stats.cargo) base.cargo += eq.stats.cargo;
        if (eq.stats.science) base.science += eq.stats.science;
        if (eq.stats.stealth) base.stealth += eq.stats.stealth;
      }
    }
  }
  ship.stats = base;
}

export function smGetEquippedItems(shipId: string): Record<EquipmentSlot, Equipment | null> {
  const s = ensureInit();
  const ship = s.ships.find((sh) => sh.id === shipId);
  if (!ship) return { Engine: null, Shield: null, Weapon: null, Scanner: null, Cargo: null, Special: null };
  const result = {} as Record<EquipmentSlot, Equipment | null>;
  for (const slot of Object.keys(ship.equipment) as EquipmentSlot[]) {
    const eqId = ship.equipment[slot];
    result[slot] = eqId ? EQUIPMENT_DATA.find((e) => e.id === eqId) ?? null : null;
  }
  return result;
}

export function smRefuelShip(shipId: string, amount?: number): number {
  const s = ensureInit();
  const ship = s.ships.find((sh) => sh.id === shipId);
  if (!ship) return 0;
  const fuelNeeded = ship.maxFuel - ship.fuel;
  const fuelToUse = amount ?? fuelNeeded;
  const actualAmount = Math.min(fuelToUse, fuelNeeded);
  const fuelResource = s.resources.find((r) => r.id === "res-fuel");
  if (!fuelResource || fuelResource.amount < actualAmount) return 0;
  fuelResource.amount -= actualAmount;
  ship.fuel += actualAmount;
  return actualAmount;
}

export function smGetShipFuel(shipId: string): { current: number; max: number } {
  const ship = ensureInit().ships.find((sh) => sh.id === shipId);
  if (!ship) return { current: 0, max: 0 };
  return { current: ship.fuel, max: ship.maxFuel };
}

export function smGetShipHull(shipId: string): { current: number; max: number } {
  const ship = ensureInit().ships.find((sh) => sh.id === shipId);
  if (!ship) return { current: 0, max: 0 };
  return { current: ship.hull, max: ship.maxHull };
}

export function smRepairShip(shipId: string): number {
  const s = ensureInit();
  const ship = s.ships.find((sh) => sh.id === shipId);
  if (!ship) return 0;
  const repairCost = (ship.maxHull - ship.hull) * 2;
  if (s.commander.credits < repairCost) return 0;
  s.commander.credits -= repairCost;
  ship.hull = ship.maxHull;
  return repairCost;
}

export function smGetTotalShipStats(): ShipStats {
  const ship = smGetSelectedShip();
  return ship ? { ...ship.stats } : { speed: 0, shields: 0, weapons: 0, cargo: 0, science: 0, stealth: 0 };
}

// ---------------------------------------------------------------------------
// Crew Functions
// ---------------------------------------------------------------------------

export function smGetCrew(): CrewMember[] {
  return ensureInit().crew;
}

export function smGetCrewById(id: string): CrewMember | undefined {
  return ensureInit().crew.find((c) => c.id === id);
}

export function smGetCrewByRole(role: CrewRole): CrewMember[] {
  return ensureInit().crew.filter((c) => c.role === role);
}

export function smAssignCrew(id: string): boolean {
  const s = ensureInit();
  if (s.assignedCrew.length >= 4) return false;
  const crew = s.crew.find((c) => c.id === id);
  if (!crew || crew.assigned) return false;
  crew.assigned = true;
  s.assignedCrew.push(id);
  return true;
}

export function smUnassignCrew(id: string): boolean {
  const s = ensureInit();
  const idx = s.assignedCrew.indexOf(id);
  if (idx === -1) return false;
  s.assignedCrew.splice(idx, 1);
  const crew = s.crew.find((c) => c.id === id);
  if (crew) crew.assigned = false;
  return true;
}

export function smGetAssignedCrew(): CrewMember[] {
  const s = ensureInit();
  return s.assignedCrew.map((id) => s.crew.find((c) => c.id === id)).filter((c): c is CrewMember => c !== undefined);
}

export function smTrainCrew(id: string): boolean {
  const s = ensureInit();
  const crew = s.crew.find((c) => c.id === id);
  if (!crew || s.commander.credits < 50) return false;
  s.commander.credits -= 50;
  crew.experience += 30;
  if (crew.experience >= crew.level * 100) {
    crew.level += 1;
    crew.experience = 0;
    crew.skill = Math.min(10, crew.skill + 1);
  }
  checkAchievements();
  return true;
}

export function smHealCrew(id: string): boolean {
  const s = ensureInit();
  const crew = s.crew.find((c) => c.id === id);
  if (!crew || crew.health >= 100 || s.commander.credits < 30) return false;
  s.commander.credits -= 30;
  crew.health = Math.min(100, crew.health + 25);
  return true;
}

export function smBoostMorale(id: string): boolean {
  const s = ensureInit();
  const crew = s.crew.find((c) => c.id === id);
  if (!crew || crew.morale >= 100) return false;
  const cost = 20;
  if (s.commander.credits < cost) return false;
  s.commander.credits -= cost;
  crew.morale = Math.min(100, crew.morale + 15);
  return true;
}

export function smBoostAllMorale(): number {
  const s = ensureInit();
  let boosted = 0;
  for (const crew of s.crew) {
    if (crew.morale < 100) {
      crew.morale = Math.min(100, crew.morale + 10);
      boosted++;
    }
  }
  return boosted;
}

export function smGetCrewAverageMorale(): number {
  const crew = ensureInit().crew;
  if (crew.length === 0) return 0;
  return Math.round(crew.reduce((sum, c) => sum + c.morale, 0) / crew.length);
}

// ---------------------------------------------------------------------------
// Resource Functions
// ---------------------------------------------------------------------------

export function smGetResources(): Resource[] {
  return ensureInit().resources;
}

export function smGetResourceById(id: string): Resource | undefined {
  return ensureInit().resources.find((r) => r.id === id);
}

export function smGetResourceAmount(id: string): number {
  const r = ensureInit().resources.find((res) => res.id === id);
  return r ? r.amount : 0;
}

export function smAddResource(id: string, amount: number): boolean {
  const s = ensureInit();
  const resource = s.resources.find((r) => r.id === id);
  if (!resource) return false;
  resource.amount = Math.max(0, resource.amount + amount);
  return true;
}

export function smRemoveResource(id: string, amount: number): boolean {
  return smAddResource(id, -amount);
}

export function smGetCargoUsed(): number {
  const s = ensureInit();
  return s.resources.filter((r) => r.amount > 0).reduce((sum, r) => sum + r.amount, 0);
}

export function smGetCargoCapacity(): number {
  const ship = smGetSelectedShip();
  return ship ? ship.stats.cargo * 10 : 40;
}

export function smGetCargo(): { id: string; name: string; amount: number; icon: string }[] {
  return ensureInit().resources.filter((r) => r.amount > 0).map((r) => ({ id: r.id, name: r.name, amount: r.amount, icon: r.icon }));
}

export function smMineResource(resourceId: string): { success: boolean; amount: number } {
  const s = ensureInit();
  const ship = smGetSelectedShip();
  if (!ship || ship.fuel < 10) return { success: false, amount: 0 };
  ship.fuel -= 10;
  const baseAmount = 3 + Math.floor(ship.stats.science / 3);
  const bonus = smGetDailyAnomaly().bonusResource === resourceId ? smGetDailyAnomaly().bonusAmount : 0;
  const amount = baseAmount + bonus;
  smAddResource(resourceId, amount);
  s.commander.xp += 10;
  checkLevelUp();
  return { success: true, amount };
}

// ---------------------------------------------------------------------------
// Station Functions
// ---------------------------------------------------------------------------

export function smGetStations(): SpaceStation[] {
  return ensureInit().stations;
}

export function smGetStationById(id: string): SpaceStation | undefined {
  return ensureInit().stations.find((st) => st.id === id);
}

export function smGetStationsBySystem(system: string): SpaceStation[] {
  return ensureInit().stations.filter((st) => st.system === system);
}

export function smTradeResource(stationId: string, fromResourceId: string, toResourceId: string, amount: number): boolean {
  const s = ensureInit();
  const station = s.stations.find((st) => st.id === stationId);
  if (!station) return false;
  const fromResource = s.resources.find((r) => r.id === fromResourceId);
  const toResource = s.resources.find((r) => r.id === toResourceId);
  if (!fromResource || !toResource) return false;
  if (fromResource.amount < amount) return false;

  const fromRate = station.tradeRates[fromResourceId] ?? 1;
  const toRate = station.tradeRates[toResourceId] ?? 1;
  const received = Math.floor((amount * fromRate) / toRate);

  fromResource.amount -= amount;
  toResource.amount += received;

  s.tradeHistory.push({ from: fromResourceId, to: toResourceId, amount: received, date: new Date().toISOString() });
  return true;
}

export function smGetTradeHistory(): SpaceMissionState["tradeHistory"] {
  return ensureInit().tradeHistory;
}

// ---------------------------------------------------------------------------
// Alien Functions
// ---------------------------------------------------------------------------

export function smGetAliens(): AlienSpecies[] {
  return ensureInit().aliens;
}

export function smGetAlienById(id: string): AlienSpecies | undefined {
  return ensureInit().aliens.find((a) => a.id === id);
}

export function smGetAliensByDisposition(disposition: AlienSpecies["disposition"]): AlienSpecies[] {
  return ensureInit().aliens.filter((a) => a.disposition === disposition);
}

export function smFirstContact(alienId: string): AlienSpecies | undefined {
  const s = ensureInit();
  const alien = s.aliens.find((a) => a.id === alienId);
  if (!alien || alien.firstContact) return undefined;
  alien.firstContact = true;
  alien.relationship = 10;
  if (s.commander.aliensEncountered === 0) s.commander.aliensEncountered = 1;
  else s.commander.aliensEncountered += 1;
  s.commander.xp += 50;
  s.commander.reputation += 15;
  checkLevelUp();
  checkAchievements();
  return alien;
}

export function smNegotiateTrade(alienId: string): { success: boolean; reward: { resource: string; amount: number } } {
  const s = ensureInit();
  const alien = s.aliens.find((a) => a.id === alienId);
  if (!alien || !alien.firstContact) return { success: false, reward: { resource: "", amount: 0 } };

  const crewBonus = s.assignedCrew.filter((cid) => {
    const c = s.crew.find((cr) => cr.id === cid);
    return c?.role === "Diplomat";
  }).length;

  const roll = Math.floor(Math.random() * 10) + alien.relationship + crewBonus * 3;
  const success = roll >= 8;

  if (success) {
    alien.relationship = Math.min(100, alien.relationship + 10);
    const rewards: { resource: string; amount: number }[] = [
      { resource: "res-alien-artifacts", amount: 3 },
      { resource: "res-crystals", amount: 8 },
      { resource: "res-dark-matter", amount: 2 },
      { resource: "res-tech-parts", amount: 5 },
    ];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    smAddResource(reward.resource, reward.amount);
    s.commander.xp += 30;
    s.commander.reputation += 10;
    checkLevelUp();
    return { success: true, reward };
  }

  alien.relationship = Math.max(0, alien.relationship - 5);
  return { success: false, reward: { resource: "", amount: 0 } };
}

export function smFormAlliance(alienId: string): boolean {
  const s = ensureInit();
  const alien = s.aliens.find((a) => a.id === alienId);
  if (!alien || !alien.firstContact || alien.relationship < 50) return false;
  alien.relationship = 100;
  s.commander.reputation += 25;
  s.commander.credits += 500;
  // Unlock alien technology
  for (const tech of alien.technologyUnlocks) {
    s.commander.xp += 20;
  }
  checkLevelUp();
  checkAchievements();
  return true;
}

export function smGetAlienRelationship(alienId: string): number {
  const alien = ensureInit().aliens.find((a) => a.id === alienId);
  return alien ? alien.relationship : 0;
}

// ---------------------------------------------------------------------------
// Encounter Functions
// ---------------------------------------------------------------------------

export function smGetEncounters(): Encounter[] {
  return ensureInit().encounters;
}

export function smGetRandomEncounter(): Encounter | undefined {
  const encounters = ensureInit().encounters;
  const index = Math.floor(Math.random() * encounters.length);
  return encounters[index];
}

export function smResolveEncounter(encounterId: string, choiceIndex: number): { outcome: string; reward: { type: string; amount: number } } {
  const s = ensureInit();
  const encounter = s.encounters.find((e) => e.id === encounterId);
  if (!encounter) return { outcome: "none", reward: { type: "", amount: 0 } };
  const choice = encounter.choices[choiceIndex];
  if (!choice) return { outcome: "none", reward: { type: "", amount: 0 } };

  let reward = { ...choice.reward };

  // Apply crew bonuses
  if (choice.outcome === "success" || choice.outcome === "risky") {
    const pilotBonus = s.assignedCrew.filter((cid) => s.crew.find((c) => c.id === cid)?.role === "Pilot").length;
    const securityBonus = s.assignedCrew.filter((cid) => s.crew.find((c) => c.id === cid)?.role === "Security").length;
    if (reward.amount > 0) reward.amount += pilotBonus * 2 + securityBonus;
  }

  // Apply rewards
  if (reward.type === "credits" && reward.amount > 0) s.commander.credits += reward.amount;
  else if (reward.type === "credits" && reward.amount < 0) s.commander.credits = Math.max(0, s.commander.credits + reward.amount);
  else if (reward.type === "xp") s.commander.xp += reward.amount;
  else if (reward.type === "hull" && reward.amount < 0) {
    const ship = smGetSelectedShip();
    if (ship) ship.hull = Math.max(0, ship.hull + reward.amount);
  } else if (reward.type && reward.amount > 0) {
    const resId = `res-${reward.type.replace(/-/g, "")}`;
    smAddResource(resId, reward.amount);
  }

  checkLevelUp();
  return { outcome: choice.outcome, reward };
}

// ---------------------------------------------------------------------------
// Daily Anomaly
// ---------------------------------------------------------------------------

export function smGetDailyAnomaly(): DailyAnomaly {
  return ensureInit().dailyAnomaly;
}

export function smGetDailyAnomalyEffect(): { modifierType: string; modifierValue: number } {
  const anomaly = ensureInit().dailyAnomaly;
  return { modifierType: anomaly.modifierType, modifierValue: anomaly.modifierValue };
}

// ---------------------------------------------------------------------------
// Achievement Functions
// ---------------------------------------------------------------------------

export function smGetAchievements(): Achievement[] {
  return ensureInit().achievements;
}

export function smGetUnlockedAchievements(): Achievement[] {
  return ensureInit().achievements.filter((a) => a.unlocked);
}

export function smGetLockedAchievements(): Achievement[] {
  return ensureInit().achievements.filter((a) => !a.unlocked);
}

export function smGetAchievementProgress(): { unlocked: number; total: number; percentage: number } {
  const s = ensureInit();
  const unlocked = s.achievements.filter((a) => a.unlocked).length;
  return { unlocked, total: s.achievements.length, percentage: s.achievements.length > 0 ? Math.round((unlocked / s.achievements.length) * 100) : 0 };
}

// ---------------------------------------------------------------------------
// UI Helper Functions
// ---------------------------------------------------------------------------

export function smGetStatsGrid(): { label: string; value: string | number; sub?: string }[] {
  const s = ensureInit();
  const ship = smGetSelectedShip();
  return [
    { label: "Commander Level", value: s.commander.level, sub: `${s.commander.xp}/${s.commander.xpToNext} XP` },
    { label: "Credits", value: s.commander.credits },
    { label: "Reputation", value: s.commander.reputation },
    { label: "Missions Done", value: `${s.commander.successfulMissions}/${s.commander.totalMissions}` },
    { label: "Planets Found", value: `${s.commander.planetsDiscovered}/12` },
    { label: "Species Contacted", value: `${s.commander.aliensEncountered}/10` },
    { label: "Star Chart", value: `${smGetStarChart()}%` },
    { label: "Active Ship", value: ship?.name ?? "None" },
    { label: "Ship Level", value: ship?.level ?? 0 },
    { label: "Crew Assigned", value: `${s.assignedCrew.length}/4` },
    { label: "Avg Morale", value: `${smGetCrewAverageMorale()}%` },
    { label: "Achievements", value: `${smGetAchievementProgress().unlocked}/${smGetAchievementProgress().total}` },
  ];
}

export function smGetPlanetCard(planetId: string): {
  name: string; system: string; type: PlanetType; difficulty: number;
  resources: string[]; atmosphere: string; gravity: string; inhabitants: string;
  description: string; discovered: boolean; explored: boolean;
  x: number; y: number;
} | null {
  const planet = smGetPlanetById(planetId);
  if (!planet) return null;
  const { discovered, explored } = planet;
  if (!discovered) {
    return { name: "Unknown Planet", system: planet.system, type: planet.type, difficulty: 0, resources: [], atmosphere: "???", gravity: "???", inhabitants: "???", description: "This planet has not been discovered yet.", discovered: false, explored: false, x: planet.x, y: planet.y };
  }
  if (!explored) {
    return { name: planet.name, system: planet.system, type: planet.type, difficulty: planet.difficulty, resources: ["???"], atmosphere: "Scanning...", gravity: "Scanning...", inhabitants: "Scanning...", description: planet.description, discovered: true, explored: false, x: planet.x, y: planet.y };
  }
  return planet;
}

export function smGetMissionCard(missionId: string): {
  name: string; type: MissionType; difficulty: number; planet: string;
  description: string; objectives: string[]; rewards: Mission["rewards"];
  completed: boolean; available: boolean; wordChallenge: string;
  chainId: string | null; requiredLevel: number; timeLimit: number;
} | null {
  const mission = smGetMissionById(missionId);
  if (!mission) return null;
  const planet = smGetPlanetById(mission.planetId);
  return {
    ...mission,
    planet: planet?.name ?? "Unknown",
  };
}

export function smGetShipCard(shipId: string): {
  name: string; class: ShipClass; level: number; maxLevel: number;
  stats: ShipStats; owned: boolean; selected: boolean;
  fuel: { current: number; max: number }; hull: { current: number; max: number };
  equipment: Record<EquipmentSlot, Equipment | null>;
  upgradeCost: number;
} | null {
  const ship = smGetShipById(shipId);
  if (!ship) return null;
  return {
    name: ship.name,
    class: ship.class,
    level: ship.level,
    maxLevel: ship.maxLevel,
    stats: { ...ship.stats },
    owned: ship.owned,
    selected: ship.selected,
    fuel: { current: ship.fuel, max: ship.maxFuel },
    hull: { current: ship.hull, max: ship.maxHull },
    equipment: smGetEquippedItems(shipId),
    upgradeCost: ship.upgradeCost,
  };
}

export function smGetCrewCard(crewId: string): {
  name: string; role: CrewRole; skill: number; morale: number;
  health: number; experience: number; level: number; specialization: string;
  assigned: boolean; trait: string; bio: string;
} | null {
  const crew = smGetCrewById(crewId);
  if (!crew) return null;
  return { ...crew };
}

export function smGetResourceCard(resourceId: string): {
  name: string; description: string; icon: string; value: number;
  amount: number; id: string;
} | null {
  const resource = smGetResourceById(resourceId);
  if (!resource) return null;
  return { ...resource };
}

export function smGetDailyCard(): {
  name: string; description: string; effect: string;
  bonusResource: string; bonusAmount: number;
  modifierType: string; modifierValue: number;
  bonusResourceName: string; bonusResourceIcon: string;
} {
  const anomaly = ensureInit().dailyAnomaly;
  const bonusRes = ensureInit().resources.find((r) => r.id === anomaly.bonusResource);
  return {
    ...anomaly,
    bonusResourceName: bonusRes?.name ?? "Unknown",
    bonusResourceIcon: bonusRes?.icon ?? "❓",
  };
}

export function smGetStarMap(): {
  systems: { name: string; planets: { id: string; name: string; type: PlanetType; x: number; y: number; discovered: boolean; explored: boolean; difficulty: number }[] }[];
  completionPercent: number;
  totalPlanets: number;
  discoveredCount: number;
} {
  const s = ensureInit();
  const systems = smGetStarSystems().map((sysName) => ({
    name: sysName,
    planets: s.planets
      .filter((p) => p.system === sysName)
      .map((p) => ({
        id: p.id,
        name: p.discovered ? p.name : "???",
        type: p.type,
        x: p.x,
        y: p.y,
        discovered: p.discovered,
        explored: p.explored,
        difficulty: p.discovered ? p.difficulty : 0,
      })),
  }));
  return {
    systems,
    completionPercent: smGetStarChart(),
    totalPlanets: s.planets.length,
    discoveredCount: s.discoveredPlanets.length,
  };
}

export function smGetSpaceOverview(): {
  commander: Commander;
  selectedShip: Ship | null;
  assignedCrew: CrewMember[];
  activeMission: Mission | null;
  dailyAnomaly: DailyAnomaly;
  quickStats: {
    missionsAvailable: number;
    missionsCompleted: number;
    planetsDiscovered: number;
    planetsExplored: number;
    crewMorale: number;
    fuelPercent: number;
    hullPercent: number;
    cargoUsed: number;
    cargoCapacity: number;
    achievementsUnlocked: number;
    achievementsTotal: number;
    reputation: number;
  };
} {
  const s = ensureInit();
  const ship = smGetSelectedShip() ?? null;
  const mission = smGetActiveMission() ?? null;
  return {
    commander: { ...s.commander },
    selectedShip: ship,
    assignedCrew: smGetAssignedCrew(),
    activeMission: mission,
    dailyAnomaly: s.dailyAnomaly,
    quickStats: {
      missionsAvailable: s.missions.filter((m) => m.available && !m.completed).length,
      missionsCompleted: s.missions.filter((m) => m.completed).length,
      planetsDiscovered: s.discoveredPlanets.length,
      planetsExplored: s.exploredPlanets.length,
      crewMorale: smGetCrewAverageMorale(),
      fuelPercent: ship ? Math.round((ship.fuel / ship.maxFuel) * 100) : 0,
      hullPercent: ship ? Math.round((ship.hull / ship.maxHull) * 100) : 0,
      cargoUsed: smGetCargoUsed(),
      cargoCapacity: smGetCargoCapacity(),
      achievementsUnlocked: s.achievements.filter((a) => a.unlocked).length,
      achievementsTotal: s.achievements.length,
      reputation: s.commander.reputation,
    },
  };
}

// ---------------------------------------------------------------------------
// Credits & Economy Helpers
// ---------------------------------------------------------------------------

export function smSpendCredits(amount: number): boolean {
  const s = ensureInit();
  if (s.commander.credits < amount) return false;
  s.commander.credits -= amount;
  return true;
}

export function smEarnCredits(amount: number): number {
  const s = ensureInit();
  s.commander.credits += amount;
  checkAchievements();
  return s.commander.credits;
}

export function smGetCredits(): number {
  return ensureInit().commander.credits;
}

// ---------------------------------------------------------------------------
// Mission Word Challenge Helpers
// ---------------------------------------------------------------------------

export function smGetMissionWordChallenge(missionId: string): string {
  const mission = smGetMissionById(missionId);
  return mission?.wordChallenge ?? "";
}

export function smValidateWordChallenge(missionId: string, input: string): { correct: boolean; score: number } {
  const mission = smGetMissionById(missionId);
  if (!mission) return { correct: false, score: 0 };
  const correct = input.toLowerCase().trim() === mission.wordChallenge.toLowerCase();
  const score = correct ? mission.successThreshold : Math.max(0, mission.successThreshold - 2);
  return { correct, score };
}

// ---------------------------------------------------------------------------
// Mission Chain Helpers
// ---------------------------------------------------------------------------

export function smIsChainComplete(chainId: string): boolean {
  const s = ensureInit();
  const chain = s.missionChains.find((c) => c.id === chainId);
  if (!chain) return false;
  return chain.missions.every((mid) => s.missions.find((m) => m.id === mid)?.completed);
}

export function smGetChainProgress(chainId: string): { completed: number; total: number; percentage: number; missions: string[] } {
  const s = ensureInit();
  const chain = s.missionChains.find((c) => c.id === chainId);
  if (!chain) return { completed: 0, total: 0, percentage: 0, missions: [] };
  const completed = chain.missions.filter((mid) => s.missions.find((m) => m.id === mid)?.completed).length;
  return {
    completed,
    total: chain.missions.length,
    percentage: chain.missions.length > 0 ? Math.round((completed / chain.missions.length) * 100) : 0,
    missions: chain.missions,
  };
}

// ---------------------------------------------------------------------------
// Utility Helpers
// ---------------------------------------------------------------------------

export function smGetMissionCountByType(): Record<MissionType, { available: number; completed: number; total: number }> {
  const s = ensureInit();
  const types: MissionType[] = ["Exploration", "Combat", "Diplomacy", "Science", "Rescue"];
  const result = {} as Record<MissionType, { available: number; completed: number; total: number }>;
  for (const type of types) {
    const ofType = s.missions.filter((m) => m.type === type);
    result[type] = {
      available: ofType.filter((m) => m.available && !m.completed).length,
      completed: ofType.filter((m) => m.completed).length,
      total: ofType.length,
    };
  }
  return result;
}

export function smGetPlanetResourceSummary(planetId: string): { resources: string[]; planetName: string } | null {
  const planet = smGetPlanetById(planetId);
  if (!planet) return null;
  return { resources: planet.resources, planetName: planet.name };
}

export function smGetCrewComposition(): Record<CrewRole, number> {
  const s = ensureInit();
  const result = {} as Record<CrewRole, number>;
  const roles: CrewRole[] = ["Captain", "Pilot", "Scientist", "Engineer", "Medic", "Diplomat", "Security"];
  for (const role of roles) {
    result[role] = s.crew.filter((c) => c.role === role).length;
  }
  return result;
}

export function smGetShipComposition(): Record<ShipClass, number> {
  const s = ensureInit();
  const result = {} as Record<ShipClass, number>;
  const classes: ShipClass[] = ["Scout", "Fighter", "Cruiser", "Carrier", "Science Vessel", "Mining Ship", "Stealth", "Flagship"];
  for (const cls of classes) {
    result[cls] = s.ships.filter((sh) => sh.class === cls && sh.owned).length;
  }
  return result;
}

export function smGetTopCrewBySkill(limit: number): CrewMember[] {
  return [...ensureInit().crew].sort((a, b) => b.skill - a.skill).slice(0, limit);
}

export function smGetTopCrewByMorale(limit: number): CrewMember[] {
  return [...ensureInit().crew].sort((a, b) => b.morale - a.morale).slice(0, limit);
}

export function smCanLaunchMission(missionId: string): { canLaunch: boolean; reason: string } {
  const s = ensureInit();
  const mission = s.missions.find((m) => m.id === missionId);
  if (!mission) return { canLaunch: false, reason: "Mission not found." };
  if (mission.completed) return { canLaunch: false, reason: "Mission already completed." };
  if (!mission.available) return { canLaunch: false, reason: `Requires Commander level ${mission.requiredLevel}.` };
  if (s.activeMission) return { canLaunch: false, reason: "Another mission is already active." };
  const ship = smGetSelectedShip();
  if (!ship) return { canLaunch: false, reason: "No ship selected." };
  if (ship.fuel < 15) return { canLaunch: false, reason: "Not enough fuel. Refuel your ship first." };
  if (ship.hull < 20) return { canLaunch: false, reason: "Ship hull critically damaged. Repair first." };
  if (s.assignedCrew.length === 0) return { canLaunch: false, reason: "Assign at least one crew member." };
  return { canLaunch: true, reason: "Ready to launch!" };
}

export function smGetResourceValueTotal(): number {
  return ensureInit().resources.reduce((sum, r) => sum + r.amount * r.value, 0);
}

export function smGetMissionsByDifficulty(min: number, max: number): Mission[] {
  return ensureInit().missions.filter((m) => m.difficulty >= min && m.difficulty <= max && m.available && !m.completed);
}

export function smGetAlienTechnology(alienId: string): string[] {
  const alien = ensureInit().aliens.find((a) => a.id === alienId);
  if (!alien || !alien.firstContact) return [];
  return alien.relationship >= 50 ? alien.technologyUnlocks : ["??? (Need relationship 50+)"];
}

export function smGetResourceTradingRates(stationId: string): Record<string, number> {
  const station = ensureInit().stations.find((st) => st.id === stationId);
  return station ? { ...station.tradeRates } : {};
}

export function smGetOwnedShips(): Ship[] {
  return ensureInit().ships.filter((s) => s.owned);
}

export function smGetStationServices(stationId: string): string[] {
  const station = ensureInit().stations.find((st) => st.id === stationId);
  return station ? [...station.services] : [];
}
