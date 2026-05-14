// ============================================================================
// Nuclear Lab Wire Module — SSR-safe nuclear research and power management
// No localStorage, window, document, setInterval, or addEventListener.
// All exported functions use the `nu` prefix. Constants use `NU_` prefix.
// ============================================================================

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export type ReactorType =
  | "research"
  | "pressurized_water"
  | "boiling_water"
  | "fast_breeder"
  | "molten_salt"
  | "fusion_tokamak"
  | "fusion_stellarator"
  | "antimatter_core";

export type DepartmentType =
  | "particle_physics"
  | "nuclear_chemistry"
  | "radiation_biology"
  | "materials_science"
  | "quantum_mechanics"
  | "plasma_physics";

export type SafetySystemId =
  | "control_rods"
  | "emergency_cooling"
  | "containment_dome"
  | "radiation_shielding"
  | "automated_shutdown"
  | "ventilation"
  | "fire_suppression"
  | "seismic_bracing";

export type ResourceType =
  | "uranium"
  | "plutonium"
  | "tritium"
  | "deuterium"
  | "helium3";

export type ExperimentType =
  | "fission"
  | "fusion"
  | "particle_acceleration"
  | "isotope_separation"
  | "neutron_scattering"
  | "radioactive_dating"
  | "radiation_therapy"
  | "nuclear_imaging";

export type DisasterType =
  | "meltdown"
  | "coolant_leak"
  | "criticality_accident"
  | "steam_explosion"
  | "fuel_fire"
  | "radiation_leak"
  | "containment_breach"
  | "hydrogen_explosion"
  | "power_surge"
  | "neutron_beam_escape"
  | "plasma_instability"
  | "antimatter_containment_failure";

export type WasteCategory = "low_level" | "intermediate" | "high_level" | "transuranic";
export type WasteAction = "store" | "recycle" | "dispose";

export type ChiefTitle =
  | "Lab Assistant"
  | "Junior Researcher"
  | "Senior Researcher"
  | "Lead Scientist"
  | "Chief Scientist"
  | "Distinguished Professor"
  | "National Fellow"
  | "Nobel Laureate";

export type IsotopeRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

// ---------------------------------------------------------------------------
// Definition Interfaces (static data)
// ---------------------------------------------------------------------------

export interface ReactorDef {
  id: ReactorType;
  name: string;
  description: string;
  basePowerOutput: number; // MW
  efficiency: number; // 0-1
  fuelType: ResourceType[];
  unlockLevel: number;
  cost: number;
  maxLevel: number;
  icon: string;
}

export interface IsotopeDef {
  id: string;
  name: string;
  symbol: string;
  massNumber: number;
  atomicNumber: number;
  halfLife: string;
  halfLifeSeconds: number;
  decayChain: string[];
  energyOutput: number; // MeV
  reactorType: ReactorType;
  rarity: IsotopeRarity;
  description: string;
  icon: string;
}

export interface DepartmentDef {
  id: DepartmentType;
  name: string;
  description: string;
  unlockLevel: number;
  researchCost: number;
  maxLevel: number;
  icon: string;
  xpPerLevel: number;
}

export interface SafetySystemDef {
  id: SafetySystemId;
  name: string;
  description: string;
  baseCost: number;
  upgradeCost: number;
  maxLevel: number;
  unlockLevel: number;
  icon: string;
  protectionBonus: number;
}

export interface ExperimentDef {
  id: ExperimentType;
  name: string;
  description: string;
  duration: number; // seconds
  resourceCost: Partial<Record<ResourceType, number>>;
  requiredDepartment: DepartmentType | null;
  requiredLevel: number;
  xpReward: number;
  coinReward: number;
  icon: string;
}

export interface DisasterDef {
  id: DisasterType;
  name: string;
  description: string;
  severity: "low" | "medium" | "high" | "catastrophic";
  preventionSteps: string[];
  requiredSafetySystems: SafetySystemId[];
  xpPenalty: number;
  coinPenalty: number;
  icon: string;
}

export interface DiscoveryDef {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  requiredDepartments: DepartmentType[];
  xpReward: number;
  coinReward: number;
  icon: string;
}

export interface ScientistDef {
  id: string;
  name: string;
  specialization: DepartmentType;
  skill: number;
  bonusDescription: string;
  hireCost: number;
  salaryPerRun: number;
  icon: string;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  reward: { xp: number; coins: number };
  icon: string;
}

// ---------------------------------------------------------------------------
// Runtime Interfaces (mutable state)
// ---------------------------------------------------------------------------

export interface ReactorState {
  id: ReactorType;
  unlocked: boolean;
  level: number;
  active: boolean;
  powerOutput: number;
  efficiency: number;
  fuelStored: Partial<Record<ResourceType, number>>;
  totalEnergyGenerated: number;
  runsCompleted: number;
}

export interface IsotopeState {
  id: string;
  discovered: boolean;
  discoveredAt: number | null;
  quantity: number;
  decayProgress: number;
}

export interface DepartmentState {
  id: DepartmentType;
  unlocked: boolean;
  level: number;
  researchProgress: number;
  researchComplete: boolean;
}

export interface SafetySystemState {
  id: SafetySystemId;
  unlocked: boolean;
  level: number;
  integrity: number;
  lastTriggered: number | null;
}

export interface ExperimentState {
  id: ExperimentType;
  available: boolean;
  running: boolean;
  completed: number;
  lastRunAt: number | null;
  bestResult: number;
}

export interface DisasterRecord {
  id: DisasterType;
  prevented: number;
  occurred: number;
  lastOccurrenceAt: number | null;
  lastPreventionAt: number | null;
}

export interface DiscoveryState {
  id: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface ScientistState {
  id: string;
  hired: boolean;
  hiredAt: number | null;
  currentAssignment: ExperimentType | null;
  bonusApplied: number;
}

export interface WasteRecord {
  category: WasteCategory;
  stored: number;
  recycled: number;
  disposed: number;
}

export interface DailyExperimentChallenge {
  dateKey: string;
  experimentType: ExperimentType;
  targetResult: number;
  rewardBonus: number;
  completed: boolean;
  completedAt: number | null;
}

export interface AchievementState {
  id: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface LabStats {
  totalEnergyGenerated: number;
  totalExperimentsRun: number;
  totalDisastersPrevented: number;
  totalDisastersOccurred: number;
  totalIsotopesDiscovered: number;
  totalDiscoveriesUnlocked: number;
  totalWasteRecycled: number;
  totalWasteDisposed: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalXPEarned: number;
  totalRadiationExposure: number;
  peakPowerOutput: number;
  longestSafeRun: number;
}

export interface NuclearLabState {
  level: number;
  xp: number;
  xpToNext: number;
  coins: number;
  title: ChiefTitle;
  activeReactor: ReactorType | null;
  reactors: ReactorState[];
  isotopes: IsotopeState[];
  departments: DepartmentState[];
  safetySystems: SafetySystemState[];
  resources: Record<ResourceType, number>;
  powerOutput: number;
  gridDemand: number;
  experiments: ExperimentState[];
  discoveries: DiscoveryState[];
  disasters: DisasterRecord[];
  waste: WasteRecord[];
  scientists: ScientistState[];
  dailyExperiment: DailyExperimentChallenge | null;
  streak: number;
  bestStreak: number;
  lastActiveDate: string;
  achievements: AchievementState[];
  unlockedAchievements: string[];
  radiationExposure: number;
  maxSafeExposure: number;
  stats: LabStats;
  createdAt: number;
  lastUpdated: number;
}

// ---------------------------------------------------------------------------
// Constants — Reactors (8)
// ---------------------------------------------------------------------------

export const NU_REACTORS: ReactorDef[] = [
  {
    id: "research",
    name: "Research Reactor",
    description: "A small low-power reactor used primarily for neutron scattering experiments, radioisotope production, and education. Operates at thermal power levels up to 20 MW and provides a versatile neutron source for materials characterization.",
    basePowerOutput: 20,
    efficiency: 0.35,
    fuelType: ["uranium"],
    unlockLevel: 1,
    cost: 0,
    maxLevel: 10,
    icon: "🔬",
  },
  {
    id: "pressurized_water",
    name: "Pressurized Water Reactor",
    description: "The most common type of nuclear power reactor worldwide. Uses pressurized water as both coolant and moderator. Primary coolant loop reaches 155 bar and 315°C, transferring heat to a secondary loop that drives steam turbines for large-scale electricity generation.",
    basePowerOutput: 1000,
    efficiency: 0.33,
    fuelType: ["uranium"],
    unlockLevel: 3,
    cost: 2000,
    maxLevel: 15,
    icon: "💧",
  },
  {
    id: "boiling_water",
    name: "Boiling Water Reactor",
    description: "A simpler design where water boils directly in the reactor core to produce steam for turbines. Operating at 70 bar and 285°C, BWRs eliminate the need for a secondary loop but require more complex fuel assemblies and a larger pressure vessel.",
    basePowerOutput: 800,
    efficiency: 0.32,
    fuelType: ["uranium"],
    unlockLevel: 5,
    cost: 1500,
    maxLevel: 12,
    icon: "♨️",
  },
  {
    id: "fast_breeder",
    name: "Fast Breeder Reactor",
    description: "Uses fast neutrons instead of thermal neutrons to breed more fissile material than it consumes. Can produce plutonium-239 from uranium-238, effectively extending uranium fuel supplies by a factor of 60. Uses liquid sodium as coolant at 500°C.",
    basePowerOutput: 1200,
    efficiency: 0.40,
    fuelType: ["uranium", "plutonium"],
    unlockLevel: 10,
    cost: 5000,
    maxLevel: 15,
    icon: "⚡",
  },
  {
    id: "molten_salt",
    name: "Molten Salt Reactor",
    description: "A Generation IV reactor using liquid fluoride salt as both fuel carrier and coolant at atmospheric pressure. Operates at 700°C with superior passive safety, walk-away stability, and the ability to use thorium fuel cycles for minimal long-lived waste.",
    basePowerOutput: 500,
    efficiency: 0.44,
    fuelType: ["uranium", "plutonium"],
    unlockLevel: 15,
    cost: 8000,
    maxLevel: 20,
    icon: "🧂",
  },
  {
    id: "fusion_tokamak",
    name: "Fusion Tokamak",
    description: "A toroidal magnetic confinement device that heats deuterium-tritium plasma to 150 million degrees Celsius, 10 times hotter than the Sun's core. Achieves net energy gain through controlled thermonuclear fusion, producing helium and energetic neutrons with no long-lived radioactive waste.",
    basePowerOutput: 3000,
    efficiency: 0.55,
    fuelType: ["deuterium", "tritium"],
    unlockLevel: 25,
    cost: 20000,
    maxLevel: 20,
    icon: "🌀",
  },
  {
    id: "fusion_stellarator",
    name: "Fusion Stellarator",
    description: "A more complex fusion reactor that uses twisted magnetic coils to confine plasma without requiring a large plasma current. Wendelstein 7-X demonstrated steady-state operation for 30 minutes. More stable than tokamaks but harder to engineer.",
    basePowerOutput: 2500,
    efficiency: 0.52,
    fuelType: ["deuterium", "tritium"],
    unlockLevel: 30,
    cost: 25000,
    maxLevel: 20,
    icon: "💫",
  },
  {
    id: "antimatter_core",
    name: "Antimatter Core",
    description: "Theoretical reactor using matter-antimatter annihilation for 100% mass-to-energy conversion, yielding 9 × 10¹⁶ J/kg. Antiprotons are confined in Penning traps and combined with hydrogen to release energy far exceeding nuclear fission or fusion.",
    basePowerOutput: 10000,
    efficiency: 0.95,
    fuelType: ["helium3"],
    unlockLevel: 40,
    cost: 100000,
    maxLevel: 10,
    icon: "🌌",
  },
];

// ---------------------------------------------------------------------------
// Constants — Isotopes (40 total, 5 per reactor)
// ---------------------------------------------------------------------------

export const NU_ISOTOPES: IsotopeDef[] = [
  // ---- Research Reactor (5) ----
  {
    id: "u235_research",
    name: "Uranium-235",
    symbol: "²³⁵U",
    massNumber: 235,
    atomicNumber: 92,
    halfLife: "703.8 million years",
    halfLifeSeconds: 2.22e16,
    decayChain: ["²³⁵U", "²³¹Th", "²³¹Pa", "²²⁷Ac", "²²³Fr"],
    energyOutput: 200.4,
    reactorType: "research",
    rarity: "common",
    description: "The only naturally occurring fissile isotope, comprising 0.72% of natural uranium. Its thermal neutron fission cross-section of 584 barns makes it ideal for research reactor fuel and neutron source applications.",
    icon: "⚛️",
  },
  {
    id: "co60_research",
    name: "Cobalt-60",
    symbol: "⁶⁰Co",
    massNumber: 60,
    atomicNumber: 27,
    halfLife: "5.2714 years",
    halfLifeSeconds: 1.663e8,
    decayChain: ["⁶⁰Co", "⁶⁰Ni", "⁶⁰Cu (stable)"],
    energyOutput: 2.824,
    reactorType: "research",
    rarity: "common",
    description: "A synthetic radioactive isotope produced by neutron activation of cobalt-59. Emits two gamma rays at 1.17 and 1.33 MeV, making it invaluable for radiation therapy, food irradiation, and industrial radiography.",
    icon: "🔵",
  },
  {
    id: "ir192_research",
    name: "Iridium-192",
    symbol: "¹⁹²Ir",
    massNumber: 192,
    atomicNumber: 77,
    halfLife: "73.83 days",
    halfLifeSeconds: 6.38e6,
    decayChain: ["¹⁹²Ir", "¹⁹²Os (stable)"],
    energyOutput: 0.66,
    reactorType: "research",
    rarity: "uncommon",
    description: "A high-specific-activity gamma emitter used in industrial gamma radiography for non-destructive testing of welds and metal structures. Its short half-life requires frequent replenishment but provides excellent image contrast.",
    icon: "📸",
  },
  {
    id: "mo99_research",
    name: "Molybdenum-99",
    symbol: "⁹⁹Mo",
    massNumber: 99,
    atomicNumber: 42,
    halfLife: "65.94 hours",
    halfLifeSeconds: 2.374e5,
    decayChain: ["⁹⁹Mo", "⁹⁹ᵐTc", "⁹⁹Tc (stable)"],
    energyOutput: 0.74,
    reactorType: "research",
    rarity: "rare",
    description: "The parent isotope of technetium-99m, the world's most widely used medical diagnostic radioisotope. Over 40 million procedures annually use Tc-99m for organ imaging, cardiac stress tests, and bone scans.",
    icon: "🏥",
  },
  {
    id: "cf252_research",
    name: "Californium-252",
    symbol: "²⁵²Cf",
    massNumber: 252,
    atomicNumber: 98,
    halfLife: "2.645 years",
    halfLifeSeconds: 8.347e7,
    decayChain: ["²⁵²Cf", "²⁴⁸Cm", "²⁴⁴Pu", "²⁴⁰U"],
    energyOutput: 6.12,
    reactorType: "research",
    rarity: "epic",
    description: "A powerful spontaneous fission neutron source emitting 2.31 × 10¹² neutrons per second per gram. Used in reactor startup sources, neutron activation analysis, oil well logging, and cancer treatment through brachytherapy.",
    icon: "🌟",
  },

  // ---- Pressurized Water Reactor (5) ----
  {
    id: "u238_pwr",
    name: "Uranium-238",
    symbol: "²³⁸U",
    massNumber: 238,
    atomicNumber: 92,
    halfLife: "4.468 billion years",
    halfLifeSeconds: 1.41e17,
    decayChain: ["²³⁸U", "²³⁴Th", "²³⁴Pa", "²³⁴U", "²³⁰Th", "²²⁶Ra"],
    energyOutput: 4.27,
    reactorType: "pressurized_water",
    rarity: "common",
    description: "The most abundant uranium isotope at 99.274% of natural uranium. While not directly fissile, it is fertile and captures neutrons to become plutonium-239. Also the parent of the entire uranium-238 decay series.",
    icon: "🪨",
  },
  {
    id: "pu239_pwr",
    name: "Plutonium-239",
    symbol: "²³⁹Pu",
    massNumber: 239,
    atomicNumber: 94,
    halfLife: "24,110 years",
    halfLifeSeconds: 7.604e11,
    decayChain: ["²³⁹Pu", "²³⁵U", "²³¹Th", "²³¹Pa", "²²⁷Ac"],
    energyOutput: 210.0,
    reactorType: "pressurized_water",
    rarity: "uncommon",
    description: "A primary fissile isotope produced in reactors by neutron capture on U-238. Used in mixed-oxide (MOX) fuel and nuclear weapons. Its thermal fission cross-section of 748 barns exceeds that of U-235.",
    icon: "🔥",
  },
  {
    id: "xenon135_pwr",
    name: "Xenon-135",
    symbol: "¹³⁵Xe",
    massNumber: 135,
    atomicNumber: 54,
    halfLife: "9.14 hours",
    halfLifeSeconds: 3.29e4,
    decayChain: ["¹³⁵Xe", "¹³⁵Cs", "¹³⁵Ba (stable)"],
    energyOutput: 0.916,
    reactorType: "pressurized_water",
    rarity: "uncommon",
    description: "The most powerful known neutron poison with a thermal absorption cross-section of 2.65 × 10⁶ barns. Xenon poisoning causes the iodine pit effect that can prevent reactor restart after emergency shutdown.",
    icon: "☁️",
  },
  {
    id: "np237_pwr",
    name: "Neptunium-237",
    symbol: "²³⁷Np",
    massNumber: 237,
    atomicNumber: 93,
    halfLife: "2.144 million years",
    halfLifeSeconds: 6.766e13,
    decayChain: ["²³⁷Np", "²³³Pa", "²³³U", "²²⁹Th", "²²⁵Ra"],
    energyOutput: 4.96,
    reactorType: "pressurized_water",
    rarity: "rare",
    description: "A transuranic element produced in nuclear reactors as a byproduct of U-235 fission. A long-lived component of nuclear waste and a potential material for future nuclear weapons. Alpha emitter requiring careful handling.",
    icon: "☢️",
  },
  {
    id: "am241_pwr",
    name: "Americium-241",
    symbol: "²⁴¹Am",
    massNumber: 241,
    atomicNumber: 95,
    halfLife: "432.2 years",
    halfLifeSeconds: 1.363e10,
    decayChain: ["²⁴¹Am", "²³⁷Np", "²³³Pa", "²³³U"],
    energyOutput: 5.64,
    reactorType: "pressurized_water",
    rarity: "epic",
    description: "Widely used in household smoke detectors as an alpha-particle ionization source. Also used in thickness gauges, fluid level detectors, and as a neutron source when combined with beryllium in well-logging tools.",
    icon: "🧯",
  },

  // ---- Boiling Water Reactor (5) ----
  {
    id: "sr90_bwr",
    name: "Strontium-90",
    symbol: "⁹⁰Sr",
    massNumber: 90,
    atomicNumber: 38,
    halfLife: "28.8 years",
    halfLifeSeconds: 9.084e8,
    decayChain: ["⁹⁰Sr", "⁹⁰Y", "⁹⁰Zr (stable)"],
    energyOutput: 2.28,
    reactorType: "boiling_water",
    rarity: "common",
    description: "A hazardous beta emitter chemically similar to calcium, leading to bone incorporation and long-term internal exposure. A major concern in nuclear fallout and a useful radioisotope thermoelectric generator heat source.",
    icon: "💀",
  },
  {
    id: "cs137_bwr",
    name: "Cesium-137",
    symbol: "¹³⁷Cs",
    massNumber: 137,
    atomicNumber: 55,
    halfLife: "30.17 years",
    halfLifeSeconds: 9.516e8,
    decayChain: ["¹³⁷Cs", "¹³⁷ᵐBa", "¹³⁷Ba (stable)"],
    energyOutput: 1.176,
    reactorType: "boiling_water",
    rarity: "common",
    description: "The dominant long-lived fission product in nuclear waste, responsible for the majority of radiation hazard for decades after reactor operation. Its gamma ray at 662 keV is a standard calibration reference.",
    icon: "📡",
  },
  {
    id: "i131_bwr",
    name: "Iodine-131",
    symbol: "¹³¹I",
    massNumber: 131,
    atomicNumber: 53,
    halfLife: "8.0197 days",
    halfLifeSeconds: 6.93e5,
    decayChain: ["¹³¹I", "¹³¹Xe (stable)"],
    energyOutput: 0.606,
    reactorType: "boiling_water",
    rarity: "uncommon",
    description: "A volatile fission product that accumulates in the thyroid gland, requiring potassium iodide prophylaxis during nuclear accidents. Also a crucial medical isotope used to treat hyperthyroidism and thyroid cancer.",
    icon: "💊",
  },
  {
    id: "ru106_bwr",
    name: "Ruthenium-106",
    symbol: "¹⁰⁶Ru",
    massNumber: 106,
    atomicNumber: 44,
    halfLife: "373.6 days",
    halfLifeSeconds: 3.229e7,
    decayChain: ["¹⁰⁶Ru", "¹⁰⁶Rh", "¹⁰⁶Pd (stable)"],
    energyOutput: 0.0394,
    reactorType: "boiling_water",
    rarity: "rare",
    description: "A fission product of concern in spent fuel reprocessing due to its volatility and ability to form airborne particles. Used in ophthalmic brachytherapy for treatment of eye tumors at close range.",
    icon: "👁️",
  },
  {
    id: "tc99_bwr",
    name: "Technetium-99",
    symbol: "⁹⁹Tc",
    massNumber: 99,
    atomicNumber: 43,
    halfLife: "211,000 years",
    halfLifeSeconds: 6.656e12,
    decayChain: ["⁹⁹Tc", "⁹⁹Ru (stable)"],
    energyOutput: 0.294,
    reactorType: "boiling_water",
    rarity: "epic",
    description: "The longest-lived fission product and a significant long-term waste concern. Technetium is the lightest element with no stable isotopes. Its environmental mobility in oxidizing conditions complicates geological disposal.",
    icon: "⚗️",
  },

  // ---- Fast Breeder Reactor (5) ----
  {
    id: "pu240_fbr",
    name: "Plutonium-240",
    symbol: "²⁴⁰Pu",
    massNumber: 240,
    atomicNumber: 94,
    halfLife: "6,561 years",
    halfLifeSeconds: 2.069e11,
    decayChain: ["²⁴⁰Pu", "²³⁶U", "²³²Th", "²²⁸Ra"],
    energyOutput: 5.26,
    reactorType: "fast_breeder",
    rarity: "common",
    description: "A non-fissile but fertile isotope produced by neutron capture on Pu-239. Its high spontaneous fission rate (1,150 fissions/s/g) generates a significant neutron background, complicating weapons design but enabling reactor-grade plutonium use.",
    icon: "🔥",
  },
  {
    id: "u233_fbr",
    name: "Uranium-233",
    symbol: "²³³U",
    massNumber: 233,
    atomicNumber: 92,
    halfLife: "159,200 years",
    halfLifeSeconds: 5.022e12,
    decayChain: ["²³³U", "²²⁹Th", "²²⁵Ra", "²²⁵Ac"],
    energyOutput: 199.0,
    reactorType: "fast_breeder",
    rarity: "uncommon",
    description: "A fissile isotope bred from thorium-232 via neutron capture, offering a superior thermal neutron fission cross-section compared to U-235. The cornerstone of the thorium fuel cycle with lower long-lived waste production.",
    icon: "⚡",
  },
  {
    id: "cf249_fbr",
    name: "Californium-249",
    symbol: "²⁴⁹Cf",
    massNumber: 249,
    atomicNumber: 98,
    halfLife: "351 years",
    halfLifeSeconds: 1.107e10,
    decayChain: ["²⁴⁹Cf", "²⁴⁵Cm", "²⁴¹Pu", "²³⁷Np"],
    energyOutput: 5.82,
    reactorType: "fast_breeder",
    rarity: "rare",
    description: "Produced in high-flux reactors through successive neutron captures. Used as a neutron source and target material for synthesizing heavier transuranic elements. Under investigation as a potential power source for space missions.",
    icon: "☄️",
  },
  {
    id: "am242m_fbr",
    name: "Americium-242m",
    symbol: "²⁴²ᵐAm",
    massNumber: 242,
    atomicNumber: 95,
    halfLife: "141 years",
    halfLifeSeconds: 4.449e9,
    decayChain: ["²⁴²ᵐAm", "²⁴²Cm", "²³⁸Pu"],
    energyOutput: 6.37,
    reactorType: "fast_breeder",
    rarity: "epic",
    description: "A metastable nuclear isomer with one of the highest thermal fission cross-sections known at 6,200 barns. Its unique properties make it a candidate for compact nuclear reactor designs and future space propulsion systems.",
    icon: "💎",
  },
  {
    id: "cm244_fbr",
    name: "Curium-244",
    symbol: "²⁴⁴Cm",
    massNumber: 244,
    atomicNumber: 96,
    halfLife: "18.1 years",
    halfLifeSeconds: 5.713e8,
    decayChain: ["²⁴⁴Cm", "²⁴⁰Pu", "²³⁶U", "²³²Th"],
    energyOutput: 5.81,
    reactorType: "fast_breeder",
    rarity: "legendary",
    description: "An intensely radioactive alpha emitter that generates 2.8 watts per gram of heat, making it a powerful radioisotope thermoelectric generator fuel. The primary heat source in the Soviet Lunokhod lunar rovers that operated on the Moon.",
    icon: "🌙",
  },

  // ---- Molten Salt Reactor (5) ----
  {
    id: "th232_msr",
    name: "Thorium-232",
    symbol: "²³²Th",
    massNumber: 232,
    atomicNumber: 90,
    halfLife: "14.05 billion years",
    halfLifeSeconds: 4.434e17,
    decayChain: ["²³²Th", "²²⁸Ra", "²²⁸Ac", "²²⁸Th", "²²⁴Ra"],
    energyOutput: 4.08,
    reactorType: "molten_salt",
    rarity: "common",
    description: "Three to four times more abundant in Earth's crust than uranium. The fertile starting material of the thorium fuel cycle, breedable to U-233. Produces 2,000 times less long-lived transuranic waste than uranium-plutonium cycles.",
    icon: "🏔️",
  },
  {
    id: "pa231_msr",
    name: "Protactinium-231",
    symbol: "²³¹Pa",
    massNumber: 231,
    atomicNumber: 91,
    halfLife: "32,760 years",
    halfLifeSeconds: 1.034e12,
    decayChain: ["²³¹Pa", "²²⁷Ac", "²²³Fr", "²²³Ra"],
    energyOutput: 2.27,
    reactorType: "molten_salt",
    rarity: "uncommon",
    description: "A rare intermediate in the thorium decay chain with significant neutron absorption, causing fuel cycle delays if allowed to accumulate in molten salt reactors. Named after the Greek god Proteus for its many oxidation states.",
    icon: "🌊",
  },
  {
    id: "u232_msr",
    name: "Uranium-232",
    symbol: "²³²U",
    massNumber: 232,
    atomicNumber: 92,
    halfLife: "68.9 years",
    halfLifeSeconds: 2.174e9,
    decayChain: ["²³²U", "²²⁸Th", "²²⁴Ra", "²²⁰Rn"],
    energyOutput: 5.41,
    reactorType: "molten_salt",
    rarity: "rare",
    description: "A contaminant in U-233 bred from thorium that emits strong gamma radiation from its daughter thallium-208. This built-in proliferation resistance makes thorium fuel more difficult to weaponize but complicates fuel handling.",
    icon: "🛡️",
  },
  {
    id: "bi209_msr",
    name: "Bismuth-209",
    symbol: "²⁰⁹Bi",
    massNumber: 209,
    atomicNumber: 83,
    halfLife: "1.9 × 10¹⁹ years",
    halfLifeSeconds: 5.99e26,
    decayChain: ["²⁰⁹Bi", "²⁰⁵Tl (stable)"],
    energyOutput: 3.14,
    reactorType: "molten_salt",
    rarity: "epic",
    description: "Once considered the heaviest stable isotope until its alpha decay was discovered in 2003. Used as a neutron reflector and coolant in some liquid metal reactor designs. Its extremely long half-life means one gram decays roughly once per hour.",
    icon: "🧊",
  },
  {
    id: "th229_msr",
    name: "Thorium-229",
    symbol: "²²⁹Th",
    massNumber: 229,
    atomicNumber: 90,
    halfLife: "7,340 years",
    halfLifeSeconds: 2.314e11,
    decayChain: ["²²⁹Th", "²²⁵Ra", "²²⁵Ac", "²²¹Fr"],
    energyOutput: 5.52,
    reactorType: "molten_salt",
    rarity: "legendary",
    description: "Contains the unique nuclear isomer Th-229m with the world's lowest known nuclear excitation energy at 8.28 ± 0.17 eV, potentially enabling a nuclear clock 100,000 times more precise than current atomic clocks.",
    icon: "⏱️",
  },

  // ---- Fusion Tokamak (5) ----
  {
    id: "t_tokamak",
    name: "Tritium",
    symbol: "³H",
    massNumber: 3,
    atomicNumber: 1,
    halfLife: "12.32 years",
    halfLifeSeconds: 3.885e8,
    decayChain: ["³H", "³He (stable)"],
    energyOutput: 18.6,
    reactorType: "fusion_tokamak",
    rarity: "common",
    description: "A rare hydrogen isotope essential for D-T fusion, producing 17.6 MeV per reaction. Naturally occurs at only 10⁻¹⁵ of hydrogen. Breeded in lithium blankets surrounding the fusion plasma through neutron capture.",
    icon: "💧",
  },
  {
    id: "d_tokamak",
    name: "Deuterium",
    symbol: "²H",
    massNumber: 2,
    atomicNumber: 1,
    halfLife: "Stable",
    halfLifeSeconds: Infinity,
    decayChain: ["²H (stable)"],
    energyOutput: 3.27,
    reactorType: "fusion_tokamak",
    rarity: "common",
    description: "A stable hydrogen isotope comprising 0.0156% of all hydrogen in seawater, providing an essentially limitless fusion fuel supply. One liter of seawater contains enough deuterium to produce energy equivalent to 300 liters of gasoline.",
    icon: "🌊",
  },
  {
    id: "he3_tokamak",
    name: "Helium-3",
    symbol: "³He",
    massNumber: 3,
    atomicNumber: 2,
    halfLife: "Stable",
    halfLifeSeconds: Infinity,
    decayChain: ["³He (stable)"],
    energyOutput: 18.3,
    reactorType: "fusion_tokamak",
    rarity: "rare",
    description: "An extraordinarily rare stable isotope on Earth but abundant on the lunar surface deposited by solar wind. D-³He fusion produces no neutrons, enabling radiation-free fusion power. Estimated 1 million tonnes in lunar regolith.",
    icon: "🌙",
  },
  {
    id: "he4_tokamak",
    name: "Helium-4",
    symbol: "⁴He",
    massNumber: 4,
    atomicNumber: 2,
    halfLife: "Stable",
    halfLifeSeconds: Infinity,
    decayChain: ["⁴He (stable)"],
    energyOutput: 0.0,
    reactorType: "fusion_tokamak",
    rarity: "common",
    description: "The primary product of D-T fusion reactions, carrying 3.5 MeV of kinetic energy per event. A noble gas that must be continuously removed from the plasma to prevent dilution and maintain fusion conditions.",
    icon: "🎈",
  },
  {
    id: "b11_tokamak",
    name: "Boron-11",
    symbol: "¹¹B",
    massNumber: 11,
    atomicNumber: 5,
    halfLife: "Stable",
    halfLifeSeconds: Infinity,
    decayChain: ["¹¹B (stable)"],
    energyOutput: 8.68,
    reactorType: "fusion_tokamak",
    rarity: "legendary",
    description: "The fuel for aneutronic proton-boron fusion, the ultimate clean energy reaction producing only charged alpha particles with zero neutron radiation. Requires plasma temperatures of 1 billion degrees — 10 times hotter than D-T fusion.",
    icon: "🌟",
  },

  // ---- Fusion Stellarator (5) ----
  {
    id: "li6_stellarator",
    name: "Lithium-6",
    symbol: "⁶Li",
    massNumber: 6,
    atomicNumber: 3,
    halfLife: "Stable",
    halfLifeSeconds: Infinity,
    decayChain: ["⁶Li (stable)"],
    energyOutput: 4.78,
    reactorType: "fusion_stellarator",
    rarity: "common",
    description: "Critical for tritium breeding in stellarator blankets via the reaction ⁶Li(n,α)³H. Also useful as a neutron shield due to its enormous thermal neutron absorption cross-section of 940 barns.",
    icon: "🔋",
  },
  {
    id: "li7_stellarator",
    name: "Lithium-7",
    symbol: "⁷Li",
    massNumber: 7,
    atomicNumber: 3,
    halfLife: "Stable",
    halfLifeSeconds: Infinity,
    decayChain: ["⁷Li (stable)"],
    energyOutput: 2.47,
    reactorType: "fusion_stellarator",
    rarity: "common",
    description: "The most abundant lithium isotope at 92.5% natural occurrence. Reacts with high-energy fusion neutrons via ⁷Li(n,n'α)³H to produce additional tritium. Used as a liquid coolant and breeder material in advanced blanket designs.",
    icon: "🧪",
  },
  {
    id: "be9_stellarator",
    name: "Beryllium-9",
    symbol: "⁹Be",
    massNumber: 9,
    atomicNumber: 4,
    halfLife: "Stable",
    halfLifeSeconds: Infinity,
    decayChain: ["⁹Be (stable)"],
    energyOutput: 6.81,
    reactorType: "fusion_stellarator",
    rarity: "uncommon",
    description: "A neutron multiplier material used in fusion reactor blankets to amplify the neutron flux and increase tritium breeding ratio. The strongest solid material per unit weight, also serving as the ITER first wall armor.",
    icon: "🛡️",
  },
  {
    id: "n15_stellarator",
    name: "Nitrogen-15",
    symbol: "¹⁵N",
    massNumber: 15,
    atomicNumber: 7,
    halfLife: "Stable",
    halfLifeSeconds: Infinity,
    decayChain: ["¹⁵N (stable)"],
    energyOutput: 10.2,
    reactorType: "fusion_stellarator",
    rarity: "epic",
    description: "Used in beam emission spectroscopy diagnostics to measure plasma density, temperature, and flow velocity in stellarators. Its stable beam emission lines allow non-invasive real-time plasma characterization.",
    icon: "📊",
  },
  {
    id: "ne20_stellarator",
    name: "Neon-20",
    symbol: "²⁰Ne",
    massNumber: 20,
    atomicNumber: 10,
    halfLife: "Stable",
    halfLifeSeconds: Infinity,
    decayChain: ["²⁰Ne (stable)"],
    energyOutput: 12.7,
    reactorType: "fusion_stellarator",
    rarity: "legendary",
    description: "A plasma radiator gas injected into the stellarator edge region to protect divertor surfaces from excessive heat loads. Neon radiates strongly in the UV, converting plasma thermal energy to radiation safely exhausted from the vessel.",
    icon: "💡",
  },

  // ---- Antimatter Core (5) ----
  {
    id: "antiproton_am",
    name: "Antiproton",
    symbol: "p̄",
    massNumber: 1,
    atomicNumber: -1,
    halfLife: "Stable (in vacuum)",
    halfLifeSeconds: Infinity,
    decayChain: ["p̄ + p → γγ + π⁰"],
    energyOutput: 1876.5,
    reactorType: "antimatter_core",
    rarity: "epic",
    description: "Produced at CERN's Antiproton Decelerator at 26 GeV/c. When annihilated with protons, releases 938 MeV per particle pair. Stored in Penning traps at ultra-low temperatures and high vacuum for eventual energy extraction.",
    icon: "🔮",
  },
  {
    id: "positron_am",
    name: "Positron",
    symbol: "e⁺",
    massNumber: 0,
    atomicNumber: -1,
    halfLife: "Stable (in vacuum)",
    halfLifeSeconds: Infinity,
    decayChain: ["e⁺ + e⁻ → 2γ"],
    energyOutput: 1.022,
    reactorType: "antimatter_core",
    rarity: "common",
    description: "The antimatter counterpart of the electron. Positron emission tomography (PET) exploits its annihilation with electrons to produce paired 511 keV gamma rays for medical imaging of metabolic activity in the body.",
    icon: "💡",
  },
  {
    id: "antihydrogen_am",
    name: "Antihydrogen",
    symbol: "H̄",
    massNumber: 1,
    atomicNumber: -1,
    halfLife: "Stable (in vacuum)",
    halfLifeSeconds: Infinity,
    decayChain: ["H̄ + H → γ + π"],
    energyOutput: 1876.0,
    reactorType: "antimatter_core",
    rarity: "legendary",
    description: "First produced at CERN in 1995 and trapped at ALPHA in 2010. Composed of an antiproton and a positron. CERN's BASE experiment has confirmed antihydrogen properties match hydrogen to 1 part in 10¹², testing CPT symmetry.",
    icon: "🌌",
  },
  {
    id: "antideuteron_am",
    name: "Antideuteron",
    symbol: "d̄",
    massNumber: 2,
    atomicNumber: -1,
    halfLife: "Stable (in vacuum)",
    halfLifeSeconds: Infinity,
    decayChain: ["d̄ + d → γ + π + n"],
    energyOutput: 3752.0,
    reactorType: "antimatter_core",
    rarity: "legendary",
    description: "An antiproton-antineutron bound state first observed at Brookhaven in 1965. Extremely rare in cosmic rays; its detection would provide evidence for dark matter annihilation. A candidate fuel for next-generation antimatter drives.",
    icon: "💫",
  },
  {
    id: "antihelium3_am",
    name: "Antihelium-3",
    symbol: "³H̄e",
    massNumber: 3,
    atomicNumber: -2,
    halfLife: "Stable (in vacuum)",
    halfLifeSeconds: Infinity,
    decayChain: ["³H̄e + ³He → γ + π"],
    energyOutput: 5628.0,
    reactorType: "antimatter_core",
    rarity: "legendary",
    description: "A theoretical antimatter nucleus never yet produced in a laboratory. The ALPHA-g experiment at CERN aims to measure gravitational effects on antihydrogen as a stepping stone toward heavier anti-nuclei production and antimatter containment.",
    icon: "✨",
  },
];

// ---------------------------------------------------------------------------
// Constants — Departments (6)
// ---------------------------------------------------------------------------

export const NU_DEPARTMENTS: DepartmentDef[] = [
  {
    id: "particle_physics",
    name: "Particle Physics",
    description: "Investigates subatomic particles and fundamental forces using particle accelerators and detectors. Research spans the Standard Model, Higgs boson properties, neutrino oscillations, and searches for physics beyond the Standard Model.",
    unlockLevel: 1,
    researchCost: 100,
    maxLevel: 10,
    icon: "⚛️",
    xpPerLevel: 50,
  },
  {
    id: "nuclear_chemistry",
    name: "Nuclear Chemistry",
    description: "Studies the chemical properties of radioactive elements, nuclear reactions, and radiochemical separation techniques. Essential for spent fuel reprocessing, transmutation research, and the synthesis of superheavy elements.",
    unlockLevel: 3,
    researchCost: 150,
    maxLevel: 10,
    icon: "🧪",
    xpPerLevel: 60,
  },
  {
    id: "radiation_biology",
    name: "Radiation Biology",
    description: "Examines the biological effects of ionizing radiation on living organisms at the molecular, cellular, and tissue levels. Research informs radiation protection standards, cancer therapy protocols, and space radiation risk assessment.",
    unlockLevel: 6,
    researchCost: 200,
    maxLevel: 10,
    icon: "🧬",
    xpPerLevel: 70,
  },
  {
    id: "materials_science",
    name: "Materials Science",
    description: "Develops radiation-resistant materials for reactor components, fuel claddings, and containment structures. Research focuses on displacement damage, helium embrittlement, and advanced ceramics and composites for extreme environments.",
    unlockLevel: 10,
    researchCost: 300,
    maxLevel: 10,
    icon: "🔩",
    xpPerLevel: 80,
  },
  {
    id: "quantum_mechanics",
    name: "Quantum Mechanics",
    description: "Applies quantum theory to nuclear structure, decay processes, and reaction dynamics. Advanced research includes quantum computing applications for reactor simulation, quantum entanglement in nuclear spin systems, and tunneling phenomena.",
    unlockLevel: 18,
    researchCost: 500,
    maxLevel: 10,
    icon: "📐",
    xpPerLevel: 100,
  },
  {
    id: "plasma_physics",
    name: "Plasma Physics",
    description: "Studies the fourth state of matter in the context of magnetic and inertial confinement fusion. Research covers plasma turbulence, MHD instabilities, transport barriers, and advanced divertor configurations for next-step fusion reactors.",
    unlockLevel: 22,
    researchCost: 600,
    maxLevel: 10,
    icon: "🌀",
    xpPerLevel: 120,
  },
];

// ---------------------------------------------------------------------------
// Constants — Safety Systems (8)
// ---------------------------------------------------------------------------

export const NU_SAFETY_SYSTEMS: SafetySystemDef[] = [
  {
    id: "control_rods",
    name: "Control Rods",
    description: "Neutron-absorbing rods (boron carbide, hafnium, or silver-indium-cadmium) that can be inserted into the reactor core to rapidly reduce fission rate and shut down the chain reaction within seconds.",
    baseCost: 300,
    upgradeCost: 200,
    maxLevel: 5,
    unlockLevel: 1,
    icon: "📊",
    protectionBonus: 15,
  },
  {
    id: "emergency_cooling",
    name: "Emergency Core Cooling",
    description: "Multi-stage safety injection system that pumps borated water into the reactor vessel during a loss-of-coolant accident. Includes high-pressure, low-pressure, and containment spray subsystems for defense-in-depth.",
    baseCost: 400,
    upgradeCost: 250,
    maxLevel: 5,
    unlockLevel: 2,
    icon: "💧",
    protectionBonus: 20,
  },
  {
    id: "containment_dome",
    name: "Containment Dome",
    description: "A reinforced concrete and steel structure designed to withstand internal pressures from a loss-of-coolant accident and external impacts including aircraft crashes. Prevents radioactive release to the environment.",
    baseCost: 600,
    upgradeCost: 400,
    maxLevel: 5,
    unlockLevel: 4,
    icon: "🏛️",
    protectionBonus: 25,
  },
  {
    id: "radiation_shielding",
    name: "Radiation Shielding",
    description: "Multi-layered biological shielding using concrete, steel, lead, and polyethylene to attenuate gamma rays, neutrons, and beta particles. Reduces occupational radiation exposure to as-low-as-reasonably-achievable (ALARA) levels.",
    baseCost: 350,
    upgradeCost: 200,
    maxLevel: 5,
    unlockLevel: 3,
    icon: "🛡️",
    protectionBonus: 18,
  },
  {
    id: "automated_shutdown",
    name: "Automated Shutdown (SCRAM)",
    description: "Reactor protection system with redundant sensors monitoring neutron flux, temperature, pressure, and flow rate. Automatically triggers full core scram within 2 seconds if parameters exceed safety setpoints.",
    baseCost: 500,
    upgradeCost: 300,
    maxLevel: 5,
    unlockLevel: 5,
    icon: "🚨",
    protectionBonus: 22,
  },
  {
    id: "ventilation",
    name: "Filtered Ventilation",
    description: "HVAC and filtration system with HEPA and charcoal filters to control airborne radioactivity within facility zones. Maintains negative pressure gradient from high-radiation to low-radiation areas.",
    baseCost: 250,
    upgradeCost: 150,
    maxLevel: 5,
    unlockLevel: 2,
    icon: "🌬️",
    protectionBonus: 12,
  },
  {
    id: "fire_suppression",
    name: "Fire Suppression",
    description: "Multi-zone fire detection and suppression system using water spray, CO2, and clean agent systems. Critical for preventing secondary fires in cable trays and electrical equipment that could disable safety systems.",
    baseCost: 300,
    upgradeCost: 200,
    maxLevel: 5,
    unlockLevel: 3,
    icon: "🧯",
    protectionBonus: 15,
  },
  {
    id: "seismic_bracing",
    name: "Seismic Bracing",
    description: "Structural reinforcement and base isolation systems to protect reactor components and safety systems during earthquakes. Designed for SSE (Safe Shutdown Earthquake) with 10,000-year return period for each site.",
    baseCost: 450,
    upgradeCost: 300,
    maxLevel: 5,
    unlockLevel: 6,
    icon: "🏜️",
    protectionBonus: 20,
  },
];

// ---------------------------------------------------------------------------
// Constants — Experiments (8)
// ---------------------------------------------------------------------------

export const NU_EXPERIMENTS: ExperimentDef[] = [
  {
    id: "fission",
    name: "Nuclear Fission Experiment",
    description: "Induce and measure controlled fission reactions, analyzing fragment mass distributions, neutron emission spectra, and energy release characteristics of various fissile isotopes.",
    duration: 60,
    resourceCost: { uranium: 10 },
    requiredDepartment: "particle_physics",
    requiredLevel: 1,
    xpReward: 30,
    coinReward: 50,
    icon: "💥",
  },
  {
    id: "fusion",
    name: "Fusion Plasma Experiment",
    description: "Heat and confine deuterium-tritium plasma to fusion temperatures, measuring Lawson criterion parameters, plasma confinement time, and triple product for breakeven analysis.",
    duration: 120,
    resourceCost: { deuterium: 20, tritium: 10 },
    requiredDepartment: "plasma_physics",
    requiredLevel: 22,
    xpReward: 100,
    coinReward: 200,
    icon: "☀️",
  },
  {
    id: "particle_acceleration",
    name: "Particle Acceleration",
    description: "Accelerate protons, deuterons, or heavy ions to relativistic energies and collide them with target nuclei to study nuclear reactions, produce exotic isotopes, and probe nuclear structure.",
    duration: 90,
    resourceCost: { uranium: 5 },
    requiredDepartment: "particle_physics",
    requiredLevel: 1,
    xpReward: 50,
    coinReward: 80,
    icon: "⚡",
  },
  {
    id: "isotope_separation",
    name: "Isotope Separation",
    description: "Separate isotopes using centrifuge cascades, laser isotope separation, or electromagnetic methods. Optimize separation factors to enrich uranium or purify specialized isotopes for research.",
    duration: 45,
    resourceCost: { uranium: 15 },
    requiredDepartment: "nuclear_chemistry",
    requiredLevel: 3,
    xpReward: 40,
    coinReward: 70,
    icon: "🔄",
  },
  {
    id: "neutron_scattering",
    name: "Neutron Scattering",
    description: "Use reactor neutrons to probe material structures through elastic and inelastic scattering. Characterize crystal structures, magnetic excitations, and hydrogen positions in complex materials.",
    duration: 75,
    resourceCost: { uranium: 8 },
    requiredDepartment: "materials_science",
    requiredLevel: 10,
    xpReward: 60,
    coinReward: 100,
    icon: "🔬",
  },
  {
    id: "radioactive_dating",
    name: "Radioactive Dating",
    description: "Apply radiometric dating techniques (carbon-14, uranium-lead, potassium-argon) to determine the age of geological and archaeological samples with high precision.",
    duration: 30,
    resourceCost: { uranium: 3 },
    requiredDepartment: "nuclear_chemistry",
    requiredLevel: 3,
    xpReward: 35,
    coinReward: 60,
    icon: "📅",
  },
  {
    id: "radiation_therapy",
    name: "Radiation Therapy Simulation",
    description: "Simulate and optimize radiation dose distributions for cancer treatment using external beam, brachytherapy, and targeted radionuclide therapy approaches.",
    duration: 50,
    resourceCost: { plutonium: 5 },
    requiredDepartment: "radiation_biology",
    requiredLevel: 6,
    xpReward: 55,
    coinReward: 90,
    icon: "🏥",
  },
  {
    id: "nuclear_imaging",
    name: "Nuclear Imaging Research",
    description: "Develop and test new radioisotopes and radiopharmaceuticals for PET, SPECT, and emerging nuclear imaging modalities with improved resolution and sensitivity.",
    duration: 40,
    resourceCost: { tritium: 5 },
    requiredDepartment: "radiation_biology",
    requiredLevel: 6,
    xpReward: 45,
    coinReward: 75,
    icon: "📷",
  },
];

// ---------------------------------------------------------------------------
// Constants — Disasters (12)
// ---------------------------------------------------------------------------

export const NU_DISASTERS: DisasterDef[] = [
  {
    id: "meltdown",
    name: "Reactor Meltdown",
    description: "Loss of coolant causes fuel rods to overheat and melt through the reactor vessel, releasing molten corium that can breach containment and contaminate groundwater.",
    severity: "catastrophic",
    preventionSteps: [
      "Insert all control rods immediately",
      "Activate emergency core cooling system",
      "Engage secondary coolant loop",
      "Seal containment ventilation",
    ],
    requiredSafetySystems: ["control_rods", "emergency_cooling", "containment_dome"],
    xpPenalty: 500,
    coinPenalty: 2000,
    icon: "🌋",
  },
  {
    id: "coolant_leak",
    name: "Primary Coolant Leak",
    description: "A rupture in the primary coolant piping causes loss of coolant pressure, reducing heat removal capacity and potentially exposing fuel assemblies.",
    severity: "high",
    preventionSteps: [
      "Isolate leak section with isolation valves",
      "Activate emergency coolant injection",
      "Reduce reactor power to minimum",
      "Deploy leak detection monitoring",
    ],
    requiredSafetySystems: ["emergency_cooling", "automated_shutdown"],
    xpPenalty: 300,
    coinPenalty: 1000,
    icon: "💧",
  },
  {
    id: "criticality_accident",
    name: "Criticality Accident",
    description: "An unintended self-sustaining nuclear chain reaction occurs in fuel handling or processing areas, producing intense bursts of neutron and gamma radiation.",
    severity: "catastrophic",
    preventionSteps: [
      "Evacuate all personnel immediately",
      "Flood the area with borated water",
      "Deploy neutron shielding barriers",
      "Activate criticality alarm system",
    ],
    requiredSafetySystems: ["control_rods", "radiation_shielding", "automated_shutdown"],
    xpPenalty: 600,
    coinPenalty: 2500,
    icon: "☢️",
  },
  {
    id: "steam_explosion",
    name: "Steam Explosion",
    description: "Rapid vaporization of coolant water upon contact with molten fuel generates a destructive shockwave capable of destroying reactor internals and dispersing radioactive debris.",
    severity: "high",
    preventionSteps: [
      "Maintain coolant inventory above minimum",
      "Control pressure relief valve operation",
      "Activate containment spray system",
      "Monitor hydrogen concentration",
    ],
    requiredSafetySystems: ["emergency_cooling", "containment_dome", "ventilation"],
    xpPenalty: 350,
    coinPenalty: 1200,
    icon: "💨",
  },
  {
    id: "fuel_fire",
    name: "Spent Fuel Pool Fire",
    description: "Loss of cooling in the spent fuel pool allows zirconium cladding to ignite, releasing large quantities of cesium-137 and other volatile fission products into the atmosphere.",
    severity: "high",
    preventionSteps: [
      "Restore pool cooling immediately",
      "Deploy supplemental water delivery",
      "Activate fire suppression system",
      "Seal building ventilation",
    ],
    requiredSafetySystems: ["fire_suppression", "ventilation", "emergency_cooling"],
    xpPenalty: 400,
    coinPenalty: 1500,
    icon: "🔥",
  },
  {
    id: "radiation_leak",
    name: "Radiation Leak",
    description: "A breach in shielding or containment allows radioactive material to escape into the environment, exposing personnel and the public to ionizing radiation.",
    severity: "medium",
    preventionSteps: [
      "Identify and isolate leak source",
      "Activate ventilation filtration",
      "Deploy portable shielding",
      "Begin personnel decontamination",
    ],
    requiredSafetySystems: ["radiation_shielding", "ventilation"],
    xpPenalty: 200,
    coinPenalty: 500,
    icon: "☢️",
  },
  {
    id: "containment_breach",
    name: "Containment Breach",
    description: "Structural failure of the containment building due to overpressure, missile impact, or aging degradation allows direct release of radioactive material to the environment.",
    severity: "catastrophic",
    preventionSteps: [
      "Reduce containment pressure via filtered venting",
      "Deploy sealant materials at breach point",
      "Activate emergency evacuation procedures",
      "Distribute potassium iodide to public",
    ],
    requiredSafetySystems: ["containment_dome", "ventilation", "automated_shutdown"],
    xpPenalty: 800,
    coinPenalty: 5000,
    icon: "💥",
  },
  {
    id: "hydrogen_explosion",
    name: "Hydrogen Explosion",
    description: "Zirconium-water reaction during a loss-of-coolant accident produces hydrogen gas that accumulates and detonates inside the containment building, as occurred at Fukushima Daiichi.",
    severity: "high",
    preventionSteps: [
      "Activate hydrogen recombiners",
      "Vent hydrogen to safe area",
      "Inert containment atmosphere with nitrogen",
      "Monitor hydrogen concentration continuously",
    ],
    requiredSafetySystems: ["ventilation", "containment_dome", "fire_suppression"],
    xpPenalty: 450,
    coinPenalty: 1800,
    icon: "💣",
  },
  {
    id: "power_surge",
    name: "Reactivity Power Surge",
    description: "An uncontrolled reactivity insertion causes rapid power escalation beyond safe limits, potentially damaging fuel assemblies and challenging the cooling system capacity.",
    severity: "medium",
    preventionSteps: [
      "Insert control rods for rapid shutdown",
      "Activate automated power trip",
      "Reduce moderator temperature",
      "Check all safety instrument channels",
    ],
    requiredSafetySystems: ["control_rods", "automated_shutdown"],
    xpPenalty: 250,
    coinPenalty: 800,
    icon: "📈",
  },
  {
    id: "neutron_beam_escape",
    name: "Neutron Beam Escape",
    description: "A research beam port fails to properly attenuate neutrons, creating a prompt radiation hazard in occupied areas near the reactor hall.",
    severity: "medium",
    preventionSteps: [
      "Shut down beam extraction",
      "Close beam port shutters",
      "Evacuate affected areas",
      "Survey with neutron detectors",
    ],
    requiredSafetySystems: ["radiation_shielding", "automated_shutdown"],
    xpPenalty: 200,
    coinPenalty: 600,
    icon: "📡",
  },
  {
    id: "plasma_instability",
    name: "Plasma Disruption",
    description: "Magnetohydrodynamic instability causes sudden loss of plasma confinement in a fusion reactor, depositing thermal energy on plasma-facing components and inducing electromagnetic forces.",
    severity: "high",
    preventionSteps: [
      "Inject impurity gas for radiative shutdown",
      "Activate disruption mitigation system",
      "Protect divertor with increased gas puffing",
      "Lock plasma position control",
    ],
    requiredSafetySystems: ["automated_shutdown", "emergency_cooling"],
    xpPenalty: 350,
    coinPenalty: 1200,
    icon: "🌀",
  },
  {
    id: "antimatter_containment_failure",
    name: "Antimatter Containment Failure",
    description: "Loss of magnetic confinement in the Penning trap allows antimatter to contact matter, resulting in explosive annihilation releasing intense gamma radiation and particle debris.",
    severity: "catastrophic",
    preventionSteps: [
      "Activate backup magnetic confinement",
      "Engage emergency vacuum seal",
      "Trigger rapid antimatter ejection",
      "Evacuate entire facility immediately",
    ],
    requiredSafetySystems: ["automated_shutdown", "containment_dome", "radiation_shielding"],
    xpPenalty: 1000,
    coinPenalty: 8000,
    icon: "🌌",
  },
];

// ---------------------------------------------------------------------------
// Constants — Discoveries (10)
// ---------------------------------------------------------------------------

export const NU_DISCOVERIES: DiscoveryDef[] = [
  {
    id: "neutron_discovery",
    name: "The Neutron Enigma",
    description: "Chadwick's 1932 discovery that the neutron is not a proton-electron pair but a fundamental particle, unlocking the understanding of nuclear structure and enabling chain reactions.",
    requiredLevel: 5,
    requiredDepartments: ["particle_physics"],
    xpReward: 200,
    coinReward: 500,
    icon: "🔬",
  },
  {
    id: "fission_discovery",
    name: "Fission Fragmentation",
    description: "Hahn and Strassmann's 1938 discovery of nuclear fission, when bombarding uranium with neutrons produced barium — an element far too light to be explained by any known process.",
    requiredLevel: 8,
    requiredDepartments: ["particle_physics", "nuclear_chemistry"],
    xpReward: 300,
    coinReward: 800,
    icon: "💥",
  },
  {
    id: "fusion_ignition",
    name: "Controlled Fusion Ignition",
    description: "Achieving scientific breakeven where fusion energy output exceeds the energy input to the plasma. A milestone that unlocks virtually unlimited clean energy from abundant hydrogen isotopes.",
    requiredLevel: 15,
    requiredDepartments: ["plasma_physics", "particle_physics"],
    xpReward: 500,
    coinReward: 1500,
    icon: "☀️",
  },
  {
    id: "transuranic_synthesis",
    name: "Island of Stability",
    description: "Synthesizing superheavy elements near the predicted island of stability at Z=114–126, where nuclei with magic proton and neutron numbers exhibit dramatically increased half-lives.",
    requiredLevel: 18,
    requiredDepartments: ["nuclear_chemistry", "particle_physics"],
    xpReward: 600,
    coinReward: 2000,
    icon: "🏝️",
  },
  {
    id: "radiation_cure",
    name: "Targeted Alpha Therapy",
    description: "Developing monoclonal antibodies labeled with alpha emitters (Ac-225, Bi-213) that deliver lethal radiation doses directly to individual cancer cells while sparing healthy tissue.",
    requiredLevel: 12,
    requiredDepartments: ["radiation_biology", "nuclear_chemistry"],
    xpReward: 400,
    coinReward: 1200,
    icon: "💊",
  },
  {
    id: "dark_matter_nuclear",
    name: "Nuclear Dark Matter Detection",
    description: "Using ultra-pure nuclear materials in deep underground detectors to directly observe WIMP-nucleus scattering events, probing the particle nature of dark matter.",
    requiredLevel: 22,
    requiredDepartments: ["quantum_mechanics", "particle_physics"],
    xpReward: 700,
    coinReward: 2500,
    icon: "🌑",
  },
  {
    id: "quantum_nuclear_clock",
    name: "Nuclear Clock Breakthrough",
    description: "Building the first nuclear optical clock based on the 8.28 eV isomeric transition in Th-229, achieving 10⁻¹⁹ fractional accuracy for tests of fundamental physics.",
    requiredLevel: 28,
    requiredDepartments: ["quantum_mechanics"],
    xpReward: 800,
    coinReward: 3000,
    icon: "⏱️",
  },
  {
    id: "antimatter_factory",
    name: "Antimatter Production at Scale",
    description: "Scaling antimatter production to gram quantities using next-generation decelerators and storage rings, enabling practical antimatter-catalyzed fusion drives for deep space propulsion.",
    requiredLevel: 35,
    requiredDepartments: ["particle_physics", "plasma_physics", "quantum_mechanics"],
    xpReward: 1000,
    coinReward: 5000,
    icon: "🌌",
  },
  {
    id: "radiation_resistant_material",
    name: "Self-Healing Nuclear Materials",
    description: "Engineering nano-structured materials with embedded mobile defect sinks that autonomously repair radiation damage, enabling reactors with 100-year component lifetimes.",
    requiredLevel: 20,
    requiredDepartments: ["materials_science", "radiation_biology"],
    xpReward: 600,
    coinReward: 2000,
    icon: "🔩",
  },
  {
    id: "stellar_nucleosynthesis",
    name: "Stellar Nucleosynthesis Code",
    description: "Cracking the complete code of how stars create elements from carbon to uranium, including the r-process, s-process, and p-process pathways in supernovae and neutron star mergers.",
    requiredLevel: 30,
    requiredDepartments: ["particle_physics", "nuclear_chemistry", "quantum_mechanics"],
    xpReward: 900,
    coinReward: 4000,
    icon: "⭐",
  },
];

// ---------------------------------------------------------------------------
// Constants — Scientists (8)
// ---------------------------------------------------------------------------

export const NU_SCIENTISTS: ScientistDef[] = [
  {
    id: "dr_curie",
    name: "Dr. Elena Curie",
    specialization: "radiation_biology",
    skill: 85,
    bonusDescription: "+20% radiation therapy experiment results, -15% radiation exposure per run",
    hireCost: 500,
    salaryPerRun: 25,
    icon: "👩‍🔬",
  },
  {
    id: "dr_fermi",
    name: "Dr. Marco Fermi",
    specialization: "particle_physics",
    skill: 92,
    bonusDescription: "+25% fission experiment energy output, +10% isotope discovery rate",
    hireCost: 800,
    salaryPerRun: 40,
    icon: "👨‍🔬",
  },
  {
    id: "dr_teller",
    name: "Dr. Anya Teller",
    specialization: "plasma_physics",
    skill: 88,
    bonusDescription: "+30% fusion experiment success rate, +15% power output for fusion reactors",
    hireCost: 1000,
    salaryPerRun: 50,
    icon: "👩‍🔬",
  },
  {
    id: "dr_seaborg",
    name: "Dr. James Seaborg",
    specialization: "nuclear_chemistry",
    skill: 90,
    bonusDescription: "+20% isotope separation efficiency, can discover rare isotopes 10% faster",
    hireCost: 700,
    salaryPerRun: 35,
    icon: "🧑‍🔬",
  },
  {
    id: "dr_mead",
    name: "Dr. Yuki Mead",
    specialization: "materials_science",
    skill: 80,
    bonusDescription: "+25% reactor durability, safety system integrity degrades 20% slower",
    hireCost: 600,
    salaryPerRun: 30,
    icon: "👩‍🔬",
  },
  {
    id: "dr_feynman",
    name: "Dr. Leo Feynman",
    specialization: "quantum_mechanics",
    skill: 95,
    bonusDescription: "+15% all experiment XP rewards, unlocks bonus discovery chance on experiments",
    hireCost: 1500,
    salaryPerRun: 60,
    icon: "👨‍🔬",
  },
  {
    id: "dr_olkhov",
    name: "Dr. Nadia Olkhov",
    specialization: "particle_physics",
    skill: 82,
    bonusDescription: "+20% particle acceleration results, bonus neutron scattering data quality",
    hireCost: 550,
    salaryPerRun: 28,
    icon: "👩‍🔬",
  },
  {
    id: "dr_chen",
    name: "Dr. Wei Chen",
    specialization: "plasma_physics",
    skill: 87,
    bonusDescription: "-25% plasma disruption probability, +10% stellarator efficiency bonus",
    hireCost: 900,
    salaryPerRun: 45,
    icon: "🧑‍🔬",
  },
];

// ---------------------------------------------------------------------------
// Constants — Resources (5)
// ---------------------------------------------------------------------------

export const NU_RESOURCES: { id: ResourceType; name: string; icon: string; baseCost: number; description: string }[] = [
  {
    id: "uranium",
    name: "Uranium",
    icon: "⛏️",
    baseCost: 5,
    description: "Primary fission fuel, enriched to various levels for different reactor types. Mined from ore deposits containing uraninite and carnotite.",
  },
  {
    id: "plutonium",
    name: "Plutonium",
    icon: "☢️",
    baseCost: 15,
    description: "Produced by neutron capture on U-238 in breeder reactors. Used in MOX fuel and fast reactor programs for greater fuel utilization.",
  },
  {
    id: "tritium",
    name: "Tritium",
    icon: "💧",
    baseCost: 25,
    description: "Essential fusion fuel produced in lithium blankets. Extremely rare in nature, requiring nuclear production for supply.",
  },
  {
    id: "deuterium",
    name: "Deuterium",
    icon: "🌊",
    baseCost: 8,
    description: "Heavy hydrogen extracted from seawater by distillation or electrolysis. Essentially unlimited supply for fusion reactors.",
  },
  {
    id: "helium3",
    name: "Helium-3",
    icon: "🌙",
    baseCost: 100,
    description: "Ultra-rare isotope prized for aneutronic fusion. Present in trace amounts on Earth but abundant in lunar regolith from solar wind deposition.",
  },
];

// ---------------------------------------------------------------------------
// Constants — Achievements (15)
// ---------------------------------------------------------------------------

export const NU_ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_experiment", name: "First Experiment", description: "Complete your very first experiment.", reward: { xp: 50, coins: 100 }, icon: "🧪" },
  { id: "power_pioneer", name: "Power Pioneer", description: "Generate 10,000 MW total energy.", reward: { xp: 100, coins: 300 }, icon: "⚡" },
  { id: "isotope_collector", name: "Isotope Collector", description: "Discover 20 different isotopes.", reward: { xp: 150, coins: 400 }, icon: "⚛️" },
  { id: "disaster_averted", name: "Disaster Averted", description: "Prevent 10 nuclear disasters.", reward: { xp: 120, coins: 350 }, icon: "🛡️" },
  { id: "all_reactors", name: "Reactor Fleet", description: "Unlock all 8 reactor types.", reward: { xp: 300, coins: 1000 }, icon: "🏗️" },
  { id: "max_safety", name: "Fortress", description: "Upgrade all safety systems to max level.", reward: { xp: 200, coins: 800 }, icon: "🏰" },
  { id: "noble_mind", name: "Noble Mind", description: "Unlock 5 Nobel-worthy discoveries.", reward: { xp: 500, coins: 2000 }, icon: "🏅" },
  { id: "grid_master", name: "Grid Master", description: "Meet grid demand for 7 consecutive days.", reward: { xp: 250, coins: 1200 }, icon: "📈" },
  { id: "green_lab", name: "Green Lab", description: "Recycle 1,000 units of nuclear waste.", reward: { xp: 150, coins: 500 }, icon: "♻️" },
  { id: "radiation_safe", name: "Radiation Safe", description: "Maintain radiation exposure below 50% of max for 30 experiments.", reward: { xp: 200, coins: 600 }, icon: "✅" },
  { id: "antimatter_pioneer", name: "Antimatter Pioneer", description: "Build and operate the Antimatter Core reactor.", reward: { xp: 400, coins: 3000 }, icon: "🌌" },
  { id: "research_legend", name: "Research Legend", description: "Complete 100 experiments total.", reward: { xp: 300, coins: 1500 }, icon: "📊" },
  { id: "scientist_team", name: "Brain Trust", description: "Hire all 8 scientists.", reward: { xp: 200, coins: 800 }, icon: "🧠" },
  { id: "streak_master", name: "Consistent Chief", description: "Maintain a 14-day experiment streak.", reward: { xp: 250, coins: 1000 }, icon: "🔥" },
  { id: "level_45", name: "Nobel Laureate", description: "Reach Chief Scientist Level 45.", reward: { xp: 500, coins: 5000 }, icon: "🏆" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `nu_${ts}_${rand}`;
}

function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.2, level - 1));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const NU_TITLE_THRESHOLDS: { minLevel: number; title: ChiefTitle }[] = [
  { minLevel: 1, title: "Lab Assistant" },
  { minLevel: 5, title: "Junior Researcher" },
  { minLevel: 10, title: "Senior Researcher" },
  { minLevel: 18, title: "Lead Scientist" },
  { minLevel: 25, title: "Chief Scientist" },
  { minLevel: 32, title: "Distinguished Professor" },
  { minLevel: 38, title: "National Fellow" },
  { minLevel: 43, title: "Nobel Laureate" },
];

export const NU_MAX_LEVEL = 45;
export const NU_MAX_SAFE_EXPOSURE = 1000;
export const NU_GRID_BASE_DEMAND = 500;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let state: NuclearLabState | null = null;

function ensureInit(): NuclearLabState {
  if (state) return state;

  const now = Date.now();

  const reactors: ReactorState[] = NU_REACTORS.map((r) => ({
    id: r.id,
    unlocked: r.id === "research",
    level: r.id === "research" ? 1 : 0,
    active: false,
    powerOutput: 0,
    efficiency: 0,
    fuelStored: {},
    totalEnergyGenerated: 0,
    runsCompleted: 0,
  }));

  const isotopes: IsotopeState[] = NU_ISOTOPES.map((iso) => ({
    id: iso.id,
    discovered: false,
    discoveredAt: null,
    quantity: 0,
    decayProgress: 0,
  }));

  const departments: DepartmentState[] = NU_DEPARTMENTS.map((d) => ({
    id: d.id,
    unlocked: d.id === "particle_physics",
    level: d.id === "particle_physics" ? 1 : 0,
    researchProgress: 0,
    researchComplete: false,
  }));

  const safetySystems: SafetySystemState[] = NU_SAFETY_SYSTEMS.map((s) => ({
    id: s.id,
    unlocked: s.unlockLevel <= 1,
    level: s.unlockLevel <= 1 ? 1 : 0,
    integrity: 100,
    lastTriggered: null,
  }));

  const experiments: ExperimentState[] = NU_EXPERIMENTS.map((e) => ({
    id: e.id,
    available: e.requiredLevel <= 1 && (e.requiredDepartment === null || e.requiredDepartment === "particle_physics"),
    running: false,
    completed: 0,
    lastRunAt: null,
    bestResult: 0,
  }));

  const disasters: DisasterRecord[] = NU_DISASTERS.map((d) => ({
    id: d.id,
    prevented: 0,
    occurred: 0,
    lastOccurrenceAt: null,
    lastPreventionAt: null,
  }));

  const discoveries: DiscoveryState[] = NU_DISCOVERIES.map((d) => ({
    id: d.id,
    unlocked: false,
    unlockedAt: null,
  }));

  const scientists: ScientistState[] = NU_SCIENTISTS.map((s) => ({
    id: s.id,
    hired: false,
    hiredAt: null,
    currentAssignment: null,
    bonusApplied: 0,
  }));

  const achievements: AchievementState[] = NU_ACHIEVEMENTS.map((a) => ({
    id: a.id,
    unlocked: false,
    unlockedAt: null,
  }));

  const waste: WasteRecord[] = [
    { category: "low_level", stored: 0, recycled: 0, disposed: 0 },
    { category: "intermediate", stored: 0, recycled: 0, disposed: 0 },
    { category: "high_level", stored: 0, recycled: 0, disposed: 0 },
    { category: "transuranic", stored: 0, recycled: 0, disposed: 0 },
  ];

  state = {
    level: 1,
    xp: 0,
    xpToNext: xpForLevel(1),
    coins: 500,
    title: "Lab Assistant",
    activeReactor: null,
    reactors,
    isotopes,
    departments,
    safetySystems,
    resources: { uranium: 50, plutonium: 0, tritium: 0, deuterium: 20, helium3: 0 },
    powerOutput: 0,
    gridDemand: NU_GRID_BASE_DEMAND,
    experiments,
    discoveries,
    disasters,
    waste,
    scientists,
    dailyExperiment: null,
    streak: 0,
    bestStreak: 0,
    lastActiveDate: "",
    achievements,
    unlockedAchievements: [],
    radiationExposure: 0,
    maxSafeExposure: NU_MAX_SAFE_EXPOSURE,
    stats: {
      totalEnergyGenerated: 0,
      totalExperimentsRun: 0,
      totalDisastersPrevented: 0,
      totalDisastersOccurred: 0,
      totalIsotopesDiscovered: 0,
      totalDiscoveriesUnlocked: 0,
      totalWasteRecycled: 0,
      totalWasteDisposed: 0,
      totalCoinsEarned: 500,
      totalCoinsSpent: 0,
      totalXPEarned: 0,
      totalRadiationExposure: 0,
      peakPowerOutput: 0,
      longestSafeRun: 0,
    },
    createdAt: now,
    lastUpdated: now,
  };

  return state;
}

// ---------------------------------------------------------------------------
// State Access
// ---------------------------------------------------------------------------

/** Returns the full nuclear lab state object. */
export function nuGetState(): NuclearLabState {
  return ensureInit();
}

/** Resets all nuclear lab state to defaults. */
export function nuResetState(): void {
  state = null;
  ensureInit();
}

// ---------------------------------------------------------------------------
// Level & XP
// ---------------------------------------------------------------------------

/** Returns Chief Scientist level (1–45). */
export function nuGetLevel(): number {
  return ensureInit().level;
}

/** Returns the Chief Scientist title. */
export function nuGetTitle(): ChiefTitle {
  return ensureInit().title;
}

/** Returns level, XP, XP to next, and progress percent. */
export function nuGetProgress(): { level: number; xp: number; xpToNext: number; percent: number; title: ChiefTitle } {
  const s = ensureInit();
  return {
    level: s.level,
    xp: s.xp,
    xpToNext: s.xpToNext,
    percent: s.xpToNext > 0 ? Math.min(100, (s.xp / s.xpToNext) * 100) : 100,
    title: s.title,
  };
}

/** Adds XP and handles level-ups up to max level 45. */
export function nuAddXP(amount: number): { leveledUp: boolean; newLevel: number; xpGained: number; newTitle: ChiefTitle } {
  const s = ensureInit();
  let gained = amount;
  let leveledUp = false;
  s.xp += gained;

  while (s.xp >= s.xpToNext && s.level < NU_MAX_LEVEL) {
    s.xp -= s.xpToNext;
    s.level += 1;
    s.xpToNext = xpForLevel(s.level);
    leveledUp = true;
    nuUpdateTitle();
    nuUpdateAvailability();
  }

  if (s.level >= NU_MAX_LEVEL) {
    s.xp = 0;
    s.xpToNext = 0;
  }

  s.stats.totalXPEarned += gained;
  s.lastUpdated = Date.now();
  nuCheckAchievements();
  return { leveledUp, newLevel: s.level, xpGained: gained, newTitle: s.title };
}

// ---------------------------------------------------------------------------
// Title Management
// ---------------------------------------------------------------------------

function nuUpdateTitle(): void {
  const s = ensureInit();
  let title: ChiefTitle = "Lab Assistant";
  for (const t of NU_TITLE_THRESHOLDS) {
    if (s.level >= t.minLevel) {
      title = t.title;
    }
  }
  s.title = title;
}

// ---------------------------------------------------------------------------
// Availability Updates
// ---------------------------------------------------------------------------

function nuUpdateAvailability(): void {
  const s = ensureInit();

  for (const r of s.reactors) {
    const def = NU_REACTORS.find((d) => d.id === r.id);
    if (def && s.level >= def.unlockLevel && !r.unlocked) {
      r.unlocked = true;
    }
  }

  for (const d of s.departments) {
    const def = NU_DEPARTMENTS.find((dd) => dd.id === d.id);
    if (def && s.level >= def.unlockLevel && !d.unlocked) {
      d.unlocked = true;
    }
  }

  for (const ss of s.safetySystems) {
    const def = NU_SAFETY_SYSTEMS.find((sd) => sd.id === ss.id);
    if (def && s.level >= def.unlockLevel && !ss.unlocked) {
      ss.unlocked = true;
    }
  }

  for (const e of s.experiments) {
    const def = NU_EXPERIMENTS.find((ed) => ed.id === e.id);
    if (def && s.level >= def.requiredLevel) {
      if (def.requiredDepartment === null) {
        e.available = true;
      } else {
        const dept = s.departments.find((dd) => dd.id === def.requiredDepartment);
        if (dept && dept.unlocked) {
          e.available = true;
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Coins
// ---------------------------------------------------------------------------

/** Returns current coin balance. */
export function nuGetCoins(): number {
  return ensureInit().coins;
}

/** Adds coins to balance. */
export function nuAddCoins(amount: number): number {
  const s = ensureInit();
  s.coins += amount;
  s.stats.totalCoinsEarned += amount;
  s.lastUpdated = Date.now();
  return s.coins;
}

/** Spends coins if affordable. Returns success. */
export function nuSpendCoins(amount: number): boolean {
  const s = ensureInit();
  if (s.coins < amount) return false;
  s.coins -= amount;
  s.stats.totalCoinsSpent += amount;
  s.lastUpdated = Date.now();
  return true;
}

// ---------------------------------------------------------------------------
// Reactors
// ---------------------------------------------------------------------------

/** Returns all reactor states. */
export function nuGetReactors(): ReactorState[] {
  return ensureInit().reactors;
}

/** Returns state for a specific reactor. */
export function nuGetReactor(id: ReactorType): ReactorState | null {
  return ensureInit().reactors.find((r) => r.id === id) ?? null;
}

/** Returns the currently active reactor. */
export function nuGetActiveReactor(): ReactorType | null {
  return ensureInit().activeReactor;
}

/** Activates a reactor. Returns success. */
export function nuActivateReactor(id: ReactorType): boolean {
  const s = ensureInit();
  const reactor = s.reactors.find((r) => r.id === id);
  if (!reactor || !reactor.unlocked || reactor.level === 0) return false;
  s.activeReactor = id;
  reactor.active = true;
  const def = NU_REACTORS.find((d) => d.id === id);
  if (def) {
    reactor.powerOutput = Math.round(def.basePowerOutput * (1 + reactor.level * 0.1) * def.efficiency);
    reactor.efficiency = Math.min(0.99, def.efficiency + reactor.level * 0.02);
    s.powerOutput = reactor.powerOutput;
  }
  s.lastUpdated = Date.now();
  return true;
}

/** Shuts down the active reactor. */
export function nuShutdownReactor(): boolean {
  const s = ensureInit();
  if (!s.activeReactor) return false;
  const reactor = s.reactors.find((r) => r.id === s.activeReactor);
  if (reactor) {
    reactor.active = false;
    reactor.powerOutput = 0;
  }
  s.activeReactor = null;
  s.powerOutput = 0;
  s.lastUpdated = Date.now();
  return true;
}

/** Upgrades a reactor by one level. */
export function nuUpgradeReactor(id: ReactorType): boolean {
  const s = ensureInit();
  const reactor = s.reactors.find((r) => r.id === id);
  const def = NU_REACTORS.find((d) => d.id === id);
  if (!reactor || !def) return false;
  if (!reactor.unlocked || reactor.level >= def.maxLevel) return false;
  const cost = Math.round(def.cost * 0.3 * (reactor.level + 1));
  if (!nuSpendCoins(cost)) return false;
  reactor.level += 1;
  if (reactor.active) {
    reactor.powerOutput = Math.round(def.basePowerOutput * (1 + reactor.level * 0.1) * def.efficiency);
    reactor.efficiency = Math.min(0.99, def.efficiency + reactor.level * 0.02);
    s.powerOutput = reactor.powerOutput;
  }
  s.lastUpdated = Date.now();
  nuCheckAchievements();
  return true;
}

/** Run the active reactor for one cycle. Returns energy generated. */
export function nuRunReactorCycle(): { energyGenerated: number; fuelUsed: Record<string, number>; wasteProduced: number } {
  const s = ensureInit();
  if (!s.activeReactor) return { energyGenerated: 0, fuelUsed: {}, wasteProduced: 0 };
  const reactor = s.reactors.find((r) => r.id === s.activeReactor);
  const def = NU_REACTORS.find((d) => d.id === s.activeReactor);
  if (!reactor || !def) return { energyGenerated: 0, fuelUsed: {}, wasteProduced: 0 };

  const fuelUsed: Record<string, number> = {};
  for (const ft of def.fuelType) {
    const consumed = Math.ceil(2 + reactor.level * 0.5);
    const available = s.resources[ft] ?? 0;
    if (available < consumed) {
      nuShutdownReactor();
      return { energyGenerated: 0, fuelUsed: {}, wasteProduced: 0 };
    }
    s.resources[ft] = available - consumed;
    fuelUsed[ft] = consumed;
  }

  const energy = reactor.powerOutput;
  reactor.totalEnergyGenerated += energy;
  reactor.runsCompleted += 1;
  s.stats.totalEnergyGenerated += energy;
  s.stats.peakPowerOutput = Math.max(s.stats.peakPowerOutput, energy);
  s.stats.longestSafeRun += 1;

  const wasteProduced = Math.ceil(energy / 100);
  s.waste[0].stored += wasteProduced;
  s.radiationExposure += Math.ceil(energy / 50);
  s.stats.totalRadiationExposure = s.radiationExposure;

  nuAddXP(Math.floor(energy / 100));
  s.lastUpdated = Date.now();
  nuCheckAchievements();
  return { energyGenerated: energy, fuelUsed, wasteProduced };
}

// ---------------------------------------------------------------------------
// Grid Demand
// ---------------------------------------------------------------------------

/** Returns current grid demand. */
export function nuGetGridDemand(): number {
  const s = ensureInit();
  return s.gridDemand;
}

/** Updates grid demand based on level and time. */
export function nuUpdateGridDemand(): number {
  const s = ensureInit();
  const base = NU_GRID_BASE_DEMAND;
  const levelMod = Math.floor(s.level * 50);
  const variation = Math.floor(Math.random() * 200) - 100;
  s.gridDemand = Math.max(100, base + levelMod + variation);
  s.lastUpdated = Date.now();
  return s.gridDemand;
}

/** Returns whether power output meets or exceeds grid demand. */
export function nuMeetsGridDemand(): boolean {
  const s = ensureInit();
  return s.powerOutput >= s.gridDemand;
}

// ---------------------------------------------------------------------------
// Isotopes
// ---------------------------------------------------------------------------

/** Returns all isotope states. */
export function nuGetIsotopes(): IsotopeState[] {
  return ensureInit().isotopes;
}

/** Returns state for a specific isotope. */
export function nuGetIsotope(id: string): IsotopeState | null {
  return ensureInit().isotopes.find((i) => i.id === id) ?? null;
}

/** Discovers an isotope, marking it as found. Returns success. */
export function nuDiscoverIsotope(id: string): boolean {
  const s = ensureInit();
  const isotope = s.isotopes.find((i) => i.id === id);
  if (!isotope || isotope.discovered) return false;
  isotope.discovered = true;
  isotope.discoveredAt = Date.now();
  isotope.quantity = 1;
  s.stats.totalIsotopesDiscovered += 1;
  const def = NU_ISOTOPES.find((d) => d.id === id);
  if (def) {
    const xpBonus = def.rarity === "legendary" ? 200 : def.rarity === "epic" ? 100 : def.rarity === "rare" ? 50 : 20;
    nuAddXP(xpBonus);
    nuAddCoins(xpBonus * 2);
  }
  s.lastUpdated = Date.now();
  nuCheckAchievements();
  return true;
}

/** Returns count of discovered isotopes. */
export function nuGetDiscoveredIsotopeCount(): number {
  const s = ensureInit();
  return s.isotopes.filter((i) => i.discovered).length;
}

/** Returns isotopes associated with a specific reactor type. */
export function nuGetIsotopesByReactor(reactorType: ReactorType): IsotopeState[] {
  const s = ensureInit();
  return s.isotopes.filter((i) => {
    const def = NU_ISOTOPES.find((d) => d.id === i.id);
    return def?.reactorType === reactorType;
  });
}

// ---------------------------------------------------------------------------
// Departments
// ---------------------------------------------------------------------------

/** Returns all department states. */
export function nuGetDepartments(): DepartmentState[] {
  return ensureInit().departments;
}

/** Returns state for a specific department. */
export function nuGetDepartment(id: DepartmentType): DepartmentState | null {
  return ensureInit().departments.find((d) => d.id === id) ?? null;
}

/** Researches a department, adding progress. Returns progress info. */
export function nuResearchDepartment(id: DepartmentType): { success: boolean; levelUp: boolean; newLevel: number; coinsSpent: number } {
  const s = ensureInit();
  const dept = s.departments.find((d) => d.id === id);
  const def = NU_DEPARTMENTS.find((d) => d.id === id);
  if (!dept || !def || !dept.unlocked || dept.researchComplete) {
    return { success: false, levelUp: false, newLevel: dept?.level ?? 0, coinsSpent: 0 };
  }
  const cost = def.researchCost * (dept.level + 1);
  if (!nuSpendCoins(cost)) return { success: false, levelUp: false, newLevel: dept.level, coinsSpent: 0 };

  dept.researchProgress += 100;
  let levelUp = false;
  const threshold = def.xpPerLevel * (dept.level + 1);
  if (dept.researchProgress >= threshold) {
    dept.level += 1;
    dept.researchProgress = 0;
    levelUp = true;
    if (dept.level >= def.maxLevel) {
      dept.researchComplete = true;
    }
    nuUpdateAvailability();
    nuAddXP(def.xpPerLevel);
  }

  s.lastUpdated = Date.now();
  nuCheckAchievements();
  return { success: true, levelUp, newLevel: dept.level, coinsSpent: cost };
}

// ---------------------------------------------------------------------------
// Safety Systems
// ---------------------------------------------------------------------------

/** Returns all safety system states. */
export function nuGetSafetySystems(): SafetySystemState[] {
  return ensureInit().safetySystems;
}

/** Returns state for a specific safety system. */
export function nuGetSafetySystem(id: SafetySystemId): SafetySystemState | null {
  return ensureInit().safetySystems.find((ss) => ss.id === id) ?? null;
}

/** Upgrades a safety system. Returns success. */
export function nuUpgradeSafetySystem(id: SafetySystemId): boolean {
  const s = ensureInit();
  const sys = s.safetySystems.find((ss) => ss.id === id);
  const def = NU_SAFETY_SYSTEMS.find((d) => d.id === id);
  if (!sys || !def || !sys.unlocked || sys.level >= def.maxLevel) return false;
  const cost = def.baseCost + def.upgradeCost * sys.level;
  if (!nuSpendCoins(cost)) return false;
  sys.level += 1;
  sys.integrity = Math.min(100, 80 + sys.level * 4);
  s.lastUpdated = Date.now();
  nuCheckAchievements();
  return true;
}

/** Returns overall safety score based on all systems. */
export function nuGetSafetyScore(): number {
  const s = ensureInit();
  let total = 0;
  let maxTotal = 0;
  for (const sys of s.safetySystems) {
    const def = NU_SAFETY_SYSTEMS.find((d) => d.id === sys.id);
    if (def) {
      total += sys.level * def.protectionBonus;
      maxTotal += def.maxLevel * def.protectionBonus;
    }
  }
  return maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
}

/** Calculates overall protection multiplier (0-1). */
export function nuGetProtectionMultiplier(): number {
  return Math.min(1, nuGetSafetyScore() / 100);
}

// ---------------------------------------------------------------------------
// Experiments
// ---------------------------------------------------------------------------

/** Returns all experiment states. */
export function nuGetExperiments(): ExperimentState[] {
  return ensureInit().experiments;
}

/** Returns state for a specific experiment. */
export function nuGetExperiment(id: ExperimentType): ExperimentState | null {
  return ensureInit().experiments.find((e) => e.id === id) ?? null;
}

/** Runs an experiment. Returns results. */
export function nuRunExperiment(id: ExperimentType): {
  success: boolean;
  result: number;
  xpGained: number;
  coinsGained: number;
  isotopesFound: string[];
  wasteGenerated: number;
  message: string;
} {
  const s = ensureInit();
  const exp = s.experiments.find((e) => e.id === id);
  const def = NU_EXPERIMENTS.find((d) => d.id === id);
  if (!exp || !def || !exp.available) {
    return { success: false, result: 0, xpGained: 0, coinsGained: 0, isotopesFound: [], wasteGenerated: 0, message: "Experiment not available." };
  }

  for (const [res, cost] of Object.entries(def.resourceCost)) {
    if ((s.resources[res as ResourceType] ?? 0) < cost) {
      return { success: false, result: 0, xpGained: 0, coinsGained: 0, isotopesFound: [], wasteGenerated: 0, message: `Insufficient ${res}.` };
    }
  }

  for (const [res, cost] of Object.entries(def.resourceCost)) {
    s.resources[res as ResourceType] -= cost;
  }

  exp.running = true;
  const baseResult = 50 + Math.floor(Math.random() * 50);
  const scientistBonus = nuGetScientistBonus(id);
  const deptBonus = nuGetDepartmentBonus(def.requiredDepartment);
  const result = Math.min(100, Math.round(baseResult * (1 + scientistBonus + deptBonus)));

  exp.completed += 1;
  exp.lastRunAt = Date.now();
  exp.bestResult = Math.max(exp.bestResult, result);
  exp.running = false;
  s.stats.totalExperimentsRun += 1;

  const xpGained = Math.round(def.xpReward * (result / 100));
  const coinsGained = Math.round(def.coinReward * (result / 100));
  nuAddXP(xpGained);
  nuAddCoins(coinsGained);

  const isotopesFound: string[] = [];
  const reactorIsotopes = id === "fusion"
    ? NU_ISOTOPES.filter((i) => i.reactorType === "fusion_tokamak" || i.reactorType === "fusion_stellarator")
    : id === "fission"
    ? NU_ISOTOPES.filter((i) => i.reactorType === "research" || i.reactorType === "pressurized_water" || i.reactorType === "boiling_water" || i.reactorType === "fast_breeder" || i.reactorType === "molten_salt")
    : NU_ISOTOPES.filter((i) => i.reactorType === "research");

  const undiscovered = reactorIsotopes.filter((i) => !s.isotopes.find((si) => si.id === i.id)?.discovered);
  if (undiscovered.length > 0 && Math.random() < 0.3 + result / 200) {
    const found = pickRandom(undiscovered);
    nuDiscoverIsotope(found.id);
    isotopesFound.push(found.name);
  }

  const wasteGenerated = Math.ceil(5 + result / 10);
  const catIdx = Math.floor(Math.random() * 4);
  s.waste[catIdx].stored += wasteGenerated;

  s.radiationExposure += Math.ceil(10 + result / 5);
  s.stats.totalRadiationExposure = s.radiationExposure;
  s.stats.longestSafeRun = s.radiationExposure < s.maxSafeExposure * 0.5 ? s.stats.longestSafeRun + 1 : 0;

  s.lastUpdated = Date.now();
  nuCheckAchievements();
  const message = result >= 90 ? "Outstanding results!" : result >= 70 ? "Good results." : result >= 50 ? "Acceptable results." : "Poor results. Try again.";
  return { success: true, result, xpGained, coinsGained, isotopesFound, wasteGenerated, message };
}

// ---------------------------------------------------------------------------
// Disasters
// ---------------------------------------------------------------------------

/** Returns all disaster records. */
export function nuGetDisasters(): DisasterRecord[] {
  return ensureInit().disasters;
}

/** Returns a random disaster that could strike. Returns null if none. */
export function nuGetPendingDisaster(): DisasterDef | null {
  const s = ensureInit();
  if (!s.activeReactor) return null;
  const roll = Math.random();
  const threshold = 0.08 * (1 - nuGetProtectionMultiplier() * 0.7);
  if (roll > threshold) return null;

  const candidate = pickRandom(NU_DISASTERS);
  return candidate;
}

/** Attempts to prevent a disaster. Returns outcome. */
export function nuAttemptPrevention(disasterId: DisasterType): {
  prevented: boolean;
  damage: number;
  xpLost: number;
  coinsLost: number;
  message: string;
} {
  const s = ensureInit();
  const record = s.disasters.find((d) => d.id === disasterId);
  const def = NU_DISASTERS.find((d) => d.id === disasterId);
  if (!record || !def) return { prevented: false, damage: 0, xpLost: 0, coinsLost: 0, message: "Unknown disaster." };

  const safetyMultiplier = nuGetProtectionMultiplier();
  const requiredSystems = def.requiredSafetySystems;
  const availableLevels = requiredSystems.map((sysId) => {
    const sys = s.safetySystems.find((ss) => ss.id === sysId);
    return sys ? sys.level : 0;
  });
  const avgLevel = availableLevels.reduce((a, b) => a + b, 0) / requiredSystems.length;
  const preventChance = Math.min(0.95, safetyMultiplier * 0.6 + avgLevel * 0.08);
  const roll = Math.random();

  for (const sysId of requiredSystems) {
    const sys = s.safetySystems.find((ss) => ss.id === sysId);
    if (sys) {
      sys.integrity = Math.max(0, sys.integrity - (5 + Math.floor(Math.random() * 10)));
      sys.lastTriggered = Date.now();
    }
  }

  if (roll < preventChance) {
    record.prevented += 1;
    record.lastPreventionAt = Date.now();
    s.stats.totalDisastersPrevented += 1;
    const xpGained = Math.round(def.xpPenalty * 0.3);
    nuAddXP(xpGained);
    s.lastUpdated = Date.now();
    nuCheckAchievements();
    return { prevented: true, damage: 0, xpLost: 0, coinsLost: 0, message: `Successfully prevented ${def.name}!` };
  }

  record.occurred += 1;
  record.lastOccurrenceAt = Date.now();
  s.stats.totalDisastersOccurred += 1;
  s.radiationExposure += def.xpPenalty;
  s.stats.totalRadiationExposure = s.radiationExposure;

  const coinsLost = Math.round(def.coinPenalty * (1 - safetyMultiplier * 0.5));
  nuSpendCoins(coinsLost);

  s.lastUpdated = Date.now();
  nuCheckAchievements();
  return {
    prevented: false,
    damage: def.severity === "catastrophic" ? 100 : def.severity === "high" ? 60 : def.severity === "medium" ? 30 : 10,
    xpLost: def.xpPenalty,
    coinsLost,
    message: `${def.name} occurred! Severity: ${def.severity}. Radiation exposure increased.`,
  };
}

// ---------------------------------------------------------------------------
// Discoveries
// ---------------------------------------------------------------------------

/** Returns all discovery states. */
export function nuGetDiscoveries(): DiscoveryState[] {
  return ensureInit().discoveries;
}

/** Attempts to unlock a discovery. Returns success. */
export function nuAttemptDiscovery(id: string): boolean {
  const s = ensureInit();
  const discovery = s.discoveries.find((d) => d.id === id);
  const def = NU_DISCOVERIES.find((d) => d.id === id);
  if (!discovery || !def || discovery.unlocked) return false;
  if (s.level < def.requiredLevel) return false;

  for (const deptId of def.requiredDepartments) {
    const dept = s.departments.find((d) => d.id === deptId);
    if (!dept || !dept.unlocked || dept.level < 3) return false;
  }

  discovery.unlocked = true;
  discovery.unlockedAt = Date.now();
  s.stats.totalDiscoveriesUnlocked += 1;
  nuAddXP(def.xpReward);
  nuAddCoins(def.coinReward);
  s.lastUpdated = Date.now();
  nuCheckAchievements();
  return true;
}

// ---------------------------------------------------------------------------
// Scientists
// ---------------------------------------------------------------------------

/** Returns all scientist states. */
export function nuGetScientists(): ScientistState[] {
  return ensureInit().scientists;
}

/** Hires a scientist. Returns success. */
export function nuHireScientist(id: string): boolean {
  const s = ensureInit();
  const scientist = s.scientists.find((sc) => sc.id === id);
  const def = NU_SCIENTISTS.find((d) => d.id === id);
  if (!scientist || !def || scientist.hired) return false;
  if (!nuSpendCoins(def.hireCost)) return false;
  scientist.hired = true;
  scientist.hiredAt = Date.now();
  s.lastUpdated = Date.now();
  nuCheckAchievements();
  return true;
}

/** Assigns a scientist to an experiment. Returns success. */
export function nuAssignScientist(scientistId: string, experimentId: ExperimentType): boolean {
  const s = ensureInit();
  const scientist = s.scientists.find((sc) => sc.id === scientistId);
  const def = NU_SCIENTISTS.find((d) => d.id === scientistId);
  if (!scientist || !def || !scientist.hired) return false;
  const expDef = NU_EXPERIMENTS.find((e) => e.id === experimentId);
  if (!expDef) return false;
  scientist.currentAssignment = experimentId;
  scientist.bonusApplied = def.skill;
  s.lastUpdated = Date.now();
  return true;
}

/** Unassigns a scientist from their experiment. */
export function nuUnassignScientist(id: string): boolean {
  const s = ensureInit();
  const scientist = s.scientists.find((sc) => sc.id === id);
  if (!scientist) return false;
  scientist.currentAssignment = null;
  scientist.bonusApplied = 0;
  s.lastUpdated = Date.now();
  return true;
}

/** Calculates scientist bonus for a given experiment type. */
function nuGetScientistBonus(experimentId: ExperimentType): number {
  const s = ensureInit();
  let totalBonus = 0;
  for (const scientist of s.scientists) {
    if (scientist.hired && scientist.currentAssignment === experimentId) {
      totalBonus += scientist.bonusApplied / 500;
    }
  }
  return totalBonus;
}

/** Calculates department level bonus for experiment. */
function nuGetDepartmentBonus(departmentId: DepartmentType | null): number {
  if (!departmentId) return 0;
  const s = ensureInit();
  const dept = s.departments.find((d) => d.id === departmentId);
  return dept ? dept.level * 0.03 : 0;
}

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

/** Returns all resource quantities. */
export function nuGetResources(): Record<ResourceType, number> {
  return ensureInit().resources;
}

/** Adds a quantity of a specific resource. */
export function nuAddResource(type: ResourceType, amount: number): number {
  const s = ensureInit();
  s.resources[type] = (s.resources[type] ?? 0) + amount;
  s.lastUpdated = Date.now();
  return s.resources[type];
}

/** Purchases a resource with coins. Returns success. */
export function nuBuyResource(type: ResourceType, amount: number): boolean {
  const def = NU_RESOURCES.find((r) => r.id === type);
  if (!def) return false;
  const cost = Math.round(def.baseCost * amount);
  if (!nuSpendCoins(cost)) return false;
  nuAddResource(type, amount);
  return true;
}

// ---------------------------------------------------------------------------
// Waste Management
// ---------------------------------------------------------------------------

/** Returns all waste records. */
export function nuGetWaste(): WasteRecord[] {
  return ensureInit().waste;
}

/** Processes waste: store, recycle, or dispose. Returns success. */
export function nuProcessWaste(category: WasteCategory, action: WasteAction, amount: number): boolean {
  const s = ensureInit();
  const record = s.waste.find((w) => w.category === category);
  if (!record || record.stored < amount) return false;

  switch (action) {
    case "store":
      return true;
    case "recycle": {
      const recycleRate = 0.6 + nuGetDepartmentBonus("nuclear_chemistry");
      const recovered = Math.floor(amount * recycleRate);
      record.stored -= amount;
      record.recycled += recovered;
      s.stats.totalWasteRecycled += recovered;
      nuAddResource("uranium", Math.ceil(recovered / 10));
      break;
    }
    case "dispose": {
      record.stored -= amount;
      record.disposed += amount;
      s.stats.totalWasteDisposed += amount;
      break;
    }
  }

  s.lastUpdated = Date.now();
  nuCheckAchievements();
  return true;
}

// ---------------------------------------------------------------------------
// Radiation Exposure
// ---------------------------------------------------------------------------

/** Returns current radiation exposure level. */
export function nuGetRadiationExposure(): number {
  return ensureInit().radiationExposure;
}

/** Returns whether exposure is within safe limits. */
export function nuIsExposureSafe(): boolean {
  const s = ensureInit();
  return s.radiationExposure < s.maxSafeExposure;
}

/** Returns exposure as percentage of max safe. */
export function nuGetExposurePercent(): number {
  const s = ensureInit();
  return Math.min(100, Math.round((s.radiationExposure / s.maxSafeExposure) * 100));
}

/** Reduces radiation exposure (e.g., by decontamination). Returns new level. */
export function nuDecontaminate(amount: number): number {
  const s = ensureInit();
  const reduction = Math.min(s.radiationExposure, amount);
  s.radiationExposure -= reduction;
  s.lastUpdated = Date.now();
  return s.radiationExposure;
}

// ---------------------------------------------------------------------------
// Daily Experiment Challenge
// ---------------------------------------------------------------------------

/** Returns the daily experiment challenge. */
export function nuGetDailyChallenge(): DailyExperimentChallenge {
  const s = ensureInit();
  const today = dateKey();

  if (s.dailyExperiment && s.dailyExperiment.dateKey === today) {
    return s.dailyExperiment;
  }

  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed = (seed * 31 + today.charCodeAt(i)) | 0;
  }
  seed = Math.abs(seed);
  const rng = seededRandom(seed);

  const availableExperiments = NU_EXPERIMENTS.filter((e) => {
    const expState = s.experiments.find((ex) => ex.id === e.id);
    return expState?.available;
  });

  if (availableExperiments.length === 0) {
    s.dailyExperiment = {
      dateKey: today,
      experimentType: "fission",
      targetResult: 70,
      rewardBonus: 100,
      completed: false,
      completedAt: null,
    };
    return s.dailyExperiment;
  }

  const selectedExp = availableExperiments[Math.floor(rng() * availableExperiments.length)];
  const targetResult = 60 + Math.floor(rng() * 30);
  const rewardBonus = 50 + Math.floor(rng() * 150);

  if (s.lastActiveDate !== "") {
    const yesterday = new Date(Date.now() - 86400000);
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    if (s.lastActiveDate === yKey) {
      s.streak += 1;
    } else if (s.lastActiveDate !== today) {
      s.streak = 0;
    }
  }

  s.bestStreak = Math.max(s.bestStreak, s.streak);

  s.dailyExperiment = {
    dateKey: today,
    experimentType: selectedExp.id,
    targetResult,
    rewardBonus,
    completed: false,
    completedAt: null,
  };

  s.lastUpdated = Date.now();
  return s.dailyExperiment;
}

/** Completes the daily challenge with an experiment result. */
export function nuCompleteDailyChallenge(result: number): {
  completed: boolean;
  success: boolean;
  bonusReward: number;
  streak: number;
} {
  const s = ensureInit();
  const challenge = nuGetDailyChallenge();
  if (challenge.completed) {
    return { completed: false, success: false, bonusReward: 0, streak: s.streak };
  }

  challenge.completed = true;
  challenge.completedAt = Date.now();
  s.lastActiveDate = challenge.dateKey;

  const success = result >= challenge.targetResult;
  const streakBonus = s.streak >= 14 ? 100 : s.streak >= 7 ? 50 : s.streak >= 3 ? 20 : 0;
  const bonusReward = success ? challenge.rewardBonus + streakBonus : Math.floor(challenge.rewardBonus * 0.3);

  nuAddCoins(bonusReward);
  nuAddXP(success ? 50 + streakBonus : 20);

  if (success) {
    s.lastActiveDate = challenge.dateKey;
    nuCheckAchievements();
  }

  return { completed: true, success, bonusReward, streak: s.streak };
}

/** Returns current streak and best streak. */
export function nuGetStreak(): { current: number; best: number } {
  const s = ensureInit();
  return { current: s.streak, best: s.bestStreak };
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

/** Returns all achievements with unlock status. */
export function nuGetAchievements(): AchievementState[] {
  return ensureInit().achievements;
}

/** Returns IDs of all unlocked achievements. */
export function nuGetUnlockedAchievementIds(): string[] {
  return ensureInit().unlockedAchievements;
}

/** Checks and unlocks earned achievements. Returns newly unlocked IDs. */
export function nuCheckAchievements(): string[] {
  const s = ensureInit();
  const newlyUnlocked: string[] = [];
  const now = Date.now();

  const check = (id: string, condition: boolean) => {
    if (condition) {
      const ach = s.achievements.find((a) => a.id === id);
      if (ach && !ach.unlocked) {
        ach.unlocked = true;
        ach.unlockedAt = now;
        s.unlockedAchievements.push(id);
        newlyUnlocked.push(id);
        const def = NU_ACHIEVEMENTS.find((d) => d.id === id);
        if (def) {
          nuAddXP(def.reward.xp);
          nuAddCoins(def.reward.coins);
        }
      }
    }
  };

  check("first_experiment", s.stats.totalExperimentsRun >= 1);
  check("power_pioneer", s.stats.totalEnergyGenerated >= 10000);
  check("isotope_collector", s.stats.totalIsotopesDiscovered >= 20);
  check("disaster_averted", s.stats.totalDisastersPrevented >= 10);
  check("all_reactors", s.reactors.every((r) => r.unlocked));
  check("max_safety", s.safetySystems.every((ss) => ss.level >= (NU_SAFETY_SYSTEMS.find((d) => d.id === ss.id)?.maxLevel ?? 99)));
  check("noble_mind", s.stats.totalDiscoveriesUnlocked >= 5);
  check("grid_master", s.streak >= 7);
  check("green_lab", s.stats.totalWasteRecycled >= 1000);
  check("radiation_safe", s.stats.longestSafeRun >= 30);
  check("antimatter_pioneer", (s.reactors.find((r) => r.id === "antimatter_core")?.level ?? 0) > 0);
  check("research_legend", s.stats.totalExperimentsRun >= 100);
  check("scientist_team", s.scientists.every((sc) => sc.hired));
  check("streak_master", s.bestStreak >= 14);
  check("level_45", s.level >= NU_MAX_LEVEL);

  if (newlyUnlocked.length > 0) {
    s.lastUpdated = now;
  }

  return newlyUnlocked;
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

/** Returns full lab stats summary. */
export function nuGetStats(): LabStats {
  return ensureInit().stats;
}

/** Returns a condensed overview. */
export function nuGetOverview(): {
  level: number;
  title: ChiefTitle;
  coins: number;
  powerOutput: number;
  gridDemand: number;
  meetingDemand: boolean;
  reactorsActive: number;
  isotopesDiscovered: number;
  experimentsRun: number;
  disastersPrevented: number;
  safetyScore: number;
  exposurePercent: number;
  streak: number;
} {
  const s = ensureInit();
  return {
    level: s.level,
    title: s.title,
    coins: s.coins,
    powerOutput: s.powerOutput,
    gridDemand: s.gridDemand,
    meetingDemand: s.powerOutput >= s.gridDemand,
    reactorsActive: s.reactors.filter((r) => r.active).length,
    isotopesDiscovered: s.stats.totalIsotopesDiscovered,
    experimentsRun: s.stats.totalExperimentsRun,
    disastersPrevented: s.stats.totalDisastersPrevented,
    safetyScore: nuGetSafetyScore(),
    exposurePercent: nuGetExposurePercent(),
    streak: s.streak,
  };
}

// ---------------------------------------------------------------------------
// Power Output Management
// ---------------------------------------------------------------------------

/** Returns current total power output in MW. */
export function nuGetPowerOutput(): number {
  return ensureInit().powerOutput;
}

/** Returns peak power output ever achieved. */
export function nuGetPeakPowerOutput(): number {
  return ensureInit().stats.peakPowerOutput;
}

/** Returns total energy generated across all reactor runs. */
export function nuGetTotalEnergyGenerated(): number {
  return ensureInit().stats.totalEnergyGenerated;
}
