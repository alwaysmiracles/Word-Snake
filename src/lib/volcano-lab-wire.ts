// ============================================================================
// Volcano Lab Wire Module — SSR-safe volcanic research and exploration system
// No localStorage, window, document, setInterval, or addEventListener.
// All exported functions use the `vl` prefix. Constants use `VL_` prefix.
// ============================================================================

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export type MineralRarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export type EruptionPhase = "dormant" | "unrest" | "active" | "erupting" | "cooling";

export type RockType = "basalt" | "andesite" | "rhyolite" | "obsidian" | "pumice" | "granite";

export type VolcanoType = "stratovolcano" | "shield" | "caldera" | "dome" | "complex";

export type GasType = "SO2" | "CO2" | "H2S" | "HCl" | "HF";

export type StationId =
  | "seismograph"
  | "gas_analyzer"
  | "lava_sample"
  | "thermal_imaging"
  | "core_drill"
  | "crystal_growth";

export type EquipmentId =
  | "heat_suit"
  | "diamond_drill"
  | "spectrometer"
  | "seismic_sensor"
  | "gas_mask"
  | "cooling_pack"
  | "lava_boat"
  | "shield_generator";

// ---------------------------------------------------------------------------
// Definition Interfaces (static data)
// ---------------------------------------------------------------------------

export interface VolcanoDef {
  id: string;
  name: string;
  location: string;
  country: string;
  type: VolcanoType;
  elevation: number;
  lastEruption: string;
  description: string;
  dangerLevel: number;
  mineralIds: string[];
  primaryRock: RockType;
  icon: string;
}

export interface MineralDef {
  id: string;
  name: string;
  chemicalFormula: string;
  rarity: MineralRarity;
  volcanoId: string;
  description: string;
  hardness: number;
  meltingPoint: number;
  baseValue: number;
  color: string;
  crystalSystem: string;
}

export interface EquipmentDef {
  id: EquipmentId;
  name: string;
  description: string;
  cost: number;
  heatResistance: number;
  analysisBonus: number;
  collectionBonus: number;
  maxLevel: number;
  icon: string;
}

export interface StationDef {
  id: StationId;
  name: string;
  description: string;
  baseCost: number;
  upgradeCost: number;
  maxLevel: number;
  unlockLevel: number;
  icon: string;
  analysisType: string;
}

export interface RockTypeDef {
  type: RockType;
  name: string;
  description: string;
  silicaContent: number;
  viscosity: "low" | "medium" | "high";
  color: string;
  commonIn: string[];
}

// ---------------------------------------------------------------------------
// Runtime Interfaces (mutable state)
// ---------------------------------------------------------------------------

export interface Volcano extends VolcanoDef {
  visited: boolean;
  visitCount: number;
  currentPhase: EruptionPhase;
  temperature: number;
  seismicActivity: number;
  explorationProgress: number;
}

export interface Mineral extends MineralDef {
  collected: boolean;
  collectedAt: number | null;
  quantity: number;
  purity: number;
}

export interface CollectedMineral extends MineralDef {
  instanceId: string;
  collectedAt: number;
  purity: number;
  quantity: number;
}

export interface MineralCombination {
  id: string;
  name: string;
  input1Id: string;
  input2Id: string;
  input3Id: string | null;
  resultName: string;
  resultDescription: string;
  resultRarity: MineralRarity;
  value: number;
  createdAt: number;
}

export interface ResearchStation {
  stationId: StationId;
  unlocked: boolean;
  level: number;
  totalAnalyses: number;
  lastAnalysisAt: number | null;
}

export interface Equipment {
  equipmentId: EquipmentId;
  owned: boolean;
  equipped: boolean;
  level: number;
  durability: number;
  maxDurability: number;
}

export interface EruptionPrediction {
  id: string;
  volcanoId: string;
  predictedPhase: EruptionPhase;
  actualPhase: EruptionPhase | null;
  correct: boolean | null;
  predictedAt: number;
  resolved: boolean;
}

export interface Earthquake {
  id: string;
  volcanoId: string;
  magnitude: number;
  depth: number;
  timestamp: number;
  classification: string;
  feltByPopulation: string;
}

export interface GasReading {
  id: string;
  volcanoId: string;
  timestamp: number;
  so2: number;
  co2: number;
  h2s: number;
  hcl: number;
  hf: number;
  alertLevel: "normal" | "elevated" | "high" | "extreme";
}

export interface TemperaturePoint {
  id: string;
  x: number;
  y: number;
  temperature: number;
  depth: number;
  volcanoId: string;
  timestamp: number;
}

export interface Publication {
  id: string;
  title: string;
  topicId: string;
  volcanoId: string;
  quality: number;
  citations: number;
  xpReward: number;
  coinReward: number;
  publishedAt: number;
}

export interface DailySeismic {
  dateKey: string;
  volcanoId: string;
  eventDescription: string;
  correctPrediction: string;
  userPrediction: string | null;
  completed: boolean;
  reward: number;
  xpReward: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt: number | null;
  reward: { xp: number; coins: number };
}

export interface Expedition {
  id: string;
  volcanoId: string;
  difficulty: number;
  riskLevel: number;
  completed: boolean;
  success: boolean;
  mineralsFound: string[];
  xpReward: number;
  coinReward: number;
  startedAt: number;
  completedAt: number | null;
}

export interface LabStats {
  totalMineralsCollected: number;
  uniqueMineralsCollected: number;
  totalCombinations: number;
  totalAnalysesRun: number;
  totalPredictions: number;
  correctPredictions: number;
  totalEarthquakes: number;
  totalGasSamples: number;
  totalThermalScans: number;
  totalPublications: number;
  totalCitations: number;
  totalExpeditions: number;
  totalExpeditionsSuccess: number;
  volcanoesVisited: number;
  volcanoesFullyExplored: number;
  coinsEarned: number;
  coinsSpent: number;
  totalXP: number;
  playTime: number;
}

export interface VolcanoLabState {
  level: number;
  xp: number;
  coins: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalXP: number;
  activeVolcano: string | null;
  volcanoes: Volcano[];
  minerals: Mineral[];
  mineralCombinations: MineralCombination[];
  researchStations: ResearchStation[];
  equipment: Equipment[];
  eruptionPredictions: EruptionPrediction[];
  earthquakes: Earthquake[];
  gasReadings: GasReading[];
  temperatureMap: TemperaturePoint[];
  publications: Publication[];
  dailySeismicEvent: DailySeismic | null;
  achievements: Achievement[];
  unlockedAchievements: string[];
  streak: number;
  bestStreak: number;
  lastActiveDate: string;
  stats: LabStats;
  expeditions: Expedition[];
  createdAt: number;
  lastUpdated: number;
}

// ---------------------------------------------------------------------------
// Constants — Volcanoes
// ---------------------------------------------------------------------------

export const VL_VOLCANOES: VolcanoDef[] = [
  {
    id: "mount_st_helens",
    name: "Mount St. Helens",
    location: "Skamania County, Washington",
    country: "United States",
    type: "stratovolcano",
    elevation: 2549,
    lastEruption: "2008",
    description:
      "An active stratovolcano in the Cascade Range, famous for its catastrophic 1980 eruption that removed the entire north face and triggered the largest landslide in recorded history. The lateral blast devastated 600 square kilometers of forest and spawned a massive ash column that reached 24 km into the atmosphere.",
    dangerLevel: 7,
    mineralIds: [
      "msh_olivine",
      "msh_pyroxene",
      "msh_magnetite",
      "msh_hypersthene",
      "msh_volcanic_glass_shard",
    ],
    primaryRock: "andesite",
    icon: "🌋",
  },
  {
    id: "kilauea",
    name: "Kilauea",
    location: "Hawaii",
    country: "United States",
    type: "shield",
    elevation: 1247,
    lastEruption: "2023",
    description:
      "The most active of the five volcanoes that form the island of Hawaii. A low-profile shield volcano with a summit caldera called Halemaʻumaʻu, Kilauea has been erupting nearly continuously since 1983. The 2018 eruption destroyed over 700 homes and added over 3.5 square kilometers of new land to the Big Island.",
    dangerLevel: 6,
    mineralIds: [
      "kil_peridot",
      "kil_sulfur_crystal",
      "kil_gabbro",
      "kil_hawaiianite",
      "kil_peles_hair",
    ],
    primaryRock: "basalt",
    icon: "🌋",
  },
  {
    id: "eyjafjallajokull",
    name: "Eyjafjallajökull",
    location: "Suðurland",
    country: "Iceland",
    type: "stratovolcano",
    elevation: 1651,
    lastEruption: "2010",
    description:
      "An ice-capped stratovolcano in southern Iceland whose 2010 eruption created an enormous ash cloud that disrupted air travel across Europe for weeks, affecting over 10 million passengers. The interaction between magma and glacial ice produced highly explosive phreatomagmatic eruptions, ejecting fine glass-rich ash particles hazardous to jet engines.",
    dangerLevel: 5,
    mineralIds: [
      "eyj_feldspar",
      "eyj_zeolite",
      "eyj_rhyolite_crystal",
      "eyj_icelandic_spar",
      "eyj_ash_lightning_opal",
    ],
    primaryRock: "rhyolite",
    icon: "🧊",
  },
  {
    id: "mount_fuji",
    name: "Mount Fuji",
    location: "Honshu",
    country: "Japan",
    type: "stratovolcano",
    elevation: 3776,
    lastEruption: "1707",
    description:
      "Japan's tallest peak and an iconic symbol of the country. Mount Fuji is a nearly perfectly symmetrical stratovolcano that last erupted during the Edo period in the Hoei eruption of 1707, which created a new crater and deposited ash across vast areas of the Kanto plain including Tokyo. Classified as active by the Japan Meteorological Agency.",
    dangerLevel: 4,
    mineralIds: [
      "mfu_quartz",
      "mfu_mica",
      "mfu_andesine",
      "mfu_jade_inclusion",
      "mfu_imperial_obsidian",
    ],
    primaryRock: "andesite",
    icon: "🗻",
  },
  {
    id: "vesuvius",
    name: "Mount Vesuvius",
    location: "Campania",
    country: "Italy",
    type: "stratovolcano",
    elevation: 1281,
    lastEruption: "1944",
    description:
      "The only active volcano on mainland Europe, infamous for the catastrophic 79 AD eruption that buried the Roman cities of Pompeii and Herculaneum under pyroclastic flows and ash. The eruption released a thermal energy equivalent to 100,000 times the atomic bomb of Hiroshima. Over 3 million people live within its danger zone today.",
    dangerLevel: 8,
    mineralIds: [
      "ves_leucite",
      "ves_augite",
      "ves_vesuvianite",
      "ves_hauyne",
      "ves_pompeii_amber",
    ],
    primaryRock: "andesite",
    icon: "🏛️",
  },
  {
    id: "krakatoa",
    name: "Krakatoa",
    location: "Sunda Strait",
    country: "Indonesia",
    type: "caldera",
    elevation: 813,
    lastEruption: "2023",
    description:
      "A volcanic caldera island in the Sunda Strait between Java and Sumatra. The 1883 eruption was one of the deadliest and most destructive volcanic events in recorded history, producing the loudest sound ever recorded at 180 dB, heard 4,800 km away. The explosion generated tsunamis up to 30 meters high that killed over 36,000 people and lowered global temperatures by 1.2°C for five years.",
    dangerLevel: 9,
    mineralIds: [
      "kra_pumice",
      "kra_volcanic_bomb",
      "kra_anorthite",
      "kra_sunda_arc_diamond",
      "kra_krakatoa_peridot",
    ],
    primaryRock: "rhyolite",
    icon: "💥",
  },
  {
    id: "mauna_loa",
    name: "Mauna Loa",
    location: "Hawaii",
    country: "United States",
    type: "shield",
    elevation: 4169,
    lastEruption: "2022",
    description:
      "The largest active volcano on Earth by both volume and area, Mauna Loa covers over half of the Big Island of Hawaii. Its total height from ocean floor to summit is approximately 10,099 meters, making it taller than Mount Everest when measured from base to peak. The 1950 eruption produced lava flows that reached the ocean in just 3 hours, traveling at speeds up to 9 km/h.",
    dangerLevel: 7,
    mineralIds: [
      "mal_basalt_crystal",
      "mal_spinel",
      "mal_picrite",
      "mal_peridot_gem",
      "mal_mauna_loa_sapphire",
    ],
    primaryRock: "basalt",
    icon: "🌊",
  },
  {
    id: "thera",
    name: "Thera (Santorini)",
    location: "South Aegean",
    country: "Greece",
    type: "caldera",
    elevation: 367,
    lastEruption: "1950",
    description:
      "A partially submerged volcanic caldera in the Aegean Sea, the site of one of history's most powerful eruptions around 1600 BCE. The Minoan eruption of Thera ejected approximately 60 cubic kilometers of material, four times more than Krakatoa in 1883. It generated devastating tsunamis that devastated the Minoan civilization on Crete and may have inspired the legend of Atlantis.",
    dangerLevel: 6,
    mineralIds: [
      "the_obsidian",
      "the_thera_pumice",
      "the_santorini_quartz",
      "the_minoan_crystal",
      "the_atlantis_shard",
    ],
    primaryRock: "rhyolite",
    icon: "🏛️",
  },
];

// ---------------------------------------------------------------------------
// Constants — Minerals (40 total, 5 per volcano)
// ---------------------------------------------------------------------------

export const VL_MINERALS: MineralDef[] = [
  // ---- Mount St. Helens (5) ----
  {
    id: "msh_olivine",
    name: "Cascade Olivine",
    chemicalFormula: "(Mg,Fe)₂SiO₄",
    rarity: "common",
    volcanoId: "mount_st_helens",
    description:
      "A green magnesium-iron silicate mineral commonly found in basaltic lavas, representing the upper mantle material brought to the surface during the 1980 eruption.",
    hardness: 6.5,
    meltingPoint: 1205,
    baseValue: 50,
    color: "olive-green",
    crystalSystem: "orthorhombic",
  },
  {
    id: "msh_pyroxene",
    name: "St. Helens Pyroxene",
    chemicalFormula: "Ca(Mg,Fe)Si₂O₆",
    rarity: "common",
    volcanoId: "mount_st_helens",
    description:
      "Dark green to black clinopyroxene crystals found in andesite lavas, essential indicators of magma chamber conditions and crystallization depth.",
    hardness: 6,
    meltingPoint: 1390,
    baseValue: 45,
    color: "dark-green",
    crystalSystem: "monoclinic",
  },
  {
    id: "msh_magnetite",
    name: "Blast Magnetite",
    chemicalFormula: "Fe₃O₄",
    rarity: "rare",
    volcanoId: "mount_st_helens",
    description:
      "Iron oxide crystals with strong magnetic properties, formed under the extreme pressures of the 1980 lateral blast and found embedded in the hummocky debris avalanche deposits.",
    hardness: 5.5,
    meltingPoint: 1597,
    baseValue: 200,
    color: "black",
    crystalSystem: "cubic",
  },
  {
    id: "msh_hypersthene",
    name: "Spirit Lake Hypersthene",
    chemicalFormula: "(Mg,Fe)SiO₃",
    rarity: "epic",
    volcanoId: "mount_st_helens",
    description:
      "Bronze-iridescent orthopyroxene crystals recovered from the pumice deposits near Spirit Lake, displaying a remarkable schiller effect caused by exsolution lamellae.",
    hardness: 6,
    meltingPoint: 1550,
    baseValue: 600,
    color: "bronze",
    crystalSystem: "orthorhombic",
  },
  {
    id: "msh_volcanic_glass_shard",
    name: "Cryptic Glass Shard",
    chemicalFormula: "SiO₂·(Na,K)AlSi₃O₈",
    rarity: "legendary",
    volcanoId: "mount_st_helens",
    description:
      "Perfectly preserved volcanic glass fragment from the 1980 blast zone, exhibiting a unique blue fluorescence under UV light caused by trace amounts of titanium and copper.",
    hardness: 5.5,
    meltingPoint: 1100,
    baseValue: 1500,
    color: "translucent-blue",
    crystalSystem: "amorphous",
  },

  // ---- Kilauea (5) ----
  {
    id: "kil_peridot",
    name: "Pele's Peridot",
    chemicalFormula: "(Mg,Fe)₂SiO₄",
    rarity: "common",
    volcanoId: "kilauea",
    description:
      "Bright green gem-quality olivine found in Hawaiian lava flows. In Hawaiian mythology, these green crystals are the tears of the volcano goddess Pele.",
    hardness: 6.5,
    meltingPoint: 1205,
    baseValue: 75,
    color: "bright-green",
    crystalSystem: "orthorhombic",
  },
  {
    id: "kil_sulfur_crystal",
    name: "Halemaʻumaʻu Sulfur",
    chemicalFormula: "S₈",
    rarity: "common",
    volcanoId: "kilauea",
    description:
      "Bright yellow orthorhombic sulfur crystals deposited around the fumaroles of Kilauea's summit caldera, formed by the sublimation of volcanic gases.",
    hardness: 2,
    meltingPoint: 115,
    baseValue: 35,
    color: "yellow",
    crystalSystem: "orthorhombic",
  },
  {
    id: "kil_gabbro",
    name: "Magma Chamber Gabbro",
    chemicalFormula: "Ca(Mg,Fe,Al)(Al,Si)₂O₆ + Plagioclase",
    rarity: "rare",
    volcanoId: "kilauea",
    description:
      "Coarse-grained intrusive rock ejected during the 2018 lower Puna eruption, representing a rare window into Kilauea's deep magma plumbing system.",
    hardness: 7,
    meltingPoint: 1400,
    baseValue: 180,
    color: "dark-gray",
    crystalSystem: "various",
  },
  {
    id: "kil_hawaiianite",
    name: "Pahoehoe Hawaiianite",
    chemicalFormula: "NaAlSi₃O₈·CaAl₂Si₂O₈",
    rarity: "epic",
    volcanoId: "kilauea",
    description:
      "A rare trachytic lava specimen with a distinctive ropy pahoehoe surface texture, colored deep blue-black by high titanium and iron content from the 2018 fissure eruption.",
    hardness: 6,
    meltingPoint: 1250,
    baseValue: 550,
    color: "blue-black",
    crystalSystem: "triclinic",
  },
  {
    id: "kil_peles_hair",
    name: "Pele's Hair",
    chemicalFormula: "SiO₂·FeO·MgO",
    rarity: "mythic",
    volcanoId: "kilauea",
    description:
      "Fine golden threads of volcanic glass spun by wind from molten lava fountains, named after the Hawaiian fire goddess. This pristine 30cm specimen is exceptionally rare due to its fragility.",
    hardness: 5,
    meltingPoint: 1050,
    baseValue: 3000,
    color: "golden",
    crystalSystem: "amorphous",
  },

  // ---- Eyjafjallajökull (5) ----
  {
    id: "eyj_feldspar",
    name: "Glacial Feldspar",
    chemicalFormula: "KAlSi₃O₈",
    rarity: "common",
    volcanoId: "eyjafjallajokull",
    description:
      "Pink-white potassium feldspar crystals ejected during the 2010 eruption, found embedded in the ice-melt deposits around the glacier-covered summit.",
    hardness: 6,
    meltingPoint: 1150,
    baseValue: 40,
    color: "pink-white",
    crystalSystem: "triclinic",
  },
  {
    id: "eyj_zeolite",
    name: "Icelandic Zeolite",
    chemicalFormula: "NaAl₂Si₃O₁₀·2H₂O",
    rarity: "common",
    volcanoId: "eyjafjallajokull",
    description:
      "Microcrystalline zeolite minerals formed by hydrothermal alteration of volcanic ash layers in Iceland's geothermal regions, prized for their molecular sieve properties.",
    hardness: 4,
    meltingPoint: 950,
    baseValue: 55,
    color: "white",
    crystalSystem: "monoclinic",
  },
  {
    id: "eyj_rhyolite_crystal",
    name: "Ash Cloud Rhyolite",
    chemicalFormula: "SiO₂(>69%)·Al₂O₃·Na₂O·K₂O",
    rarity: "rare",
    volcanoId: "eyjafjallajokull",
    description:
      "High-silica rhyolite crystal fragments from the 2010 eruption plume, whose fine abrasive particles caused billions in aviation losses by disabling jet engines.",
    hardness: 6.5,
    meltingPoint: 1200,
    baseValue: 210,
    color: "light-gray",
    crystalSystem: "various",
  },
  {
    id: "eyj_icelandic_spar",
    name: "Aurora Icelandic Spar",
    chemicalFormula: "CaCO₃",
    rarity: "epic",
    volcanoId: "eyjafjallajokull",
    description:
      "Optically clear calcite crystal exhibiting strong double refraction, found in cavities within the Eyjafjallajökull ice cap where volcanic heat interacted with glacial meltwater.",
    hardness: 3,
    meltingPoint: 825,
    baseValue: 650,
    color: "transparent",
    crystalSystem: "trigonal",
  },
  {
    id: "eyj_ash_lightning_opal",
    name: "Volcanic Lightning Opal",
    chemicalFormula: "SiO₂·nH₂O",
    rarity: "legendary",
    volcanoId: "eyjafjallajokull",
    description:
      "A precious opal formed in the unique conditions of the 2010 phreatomagmatic eruption where volcanic lightning fused ash particles into opalescent silica, displaying vivid fire-like play of color.",
    hardness: 6,
    meltingPoint: 1600,
    baseValue: 2000,
    color: "multi-color",
    crystalSystem: "amorphous",
  },

  // ---- Mount Fuji (5) ----
  {
    id: "mfu_quartz",
    name: "Sacred Summit Quartz",
    chemicalFormula: "SiO₂",
    rarity: "common",
    volcanoId: "mount_fuji",
    description:
      "Clear to smoky quartz crystals found in the volcanic ejecta of Mount Fuji's Hoei crater, regarded as spiritual talismans in Japanese culture since ancient times.",
    hardness: 7,
    meltingPoint: 1670,
    baseValue: 60,
    color: "clear",
    crystalSystem: "trigonal",
  },
  {
    id: "mfu_mica",
    name: "Fuji Muscovite",
    chemicalFormula: "KAl₂(AlSi₃O₁₀)(OH)₂",
    rarity: "common",
    volcanoId: "mount_fuji",
    description:
      "Silvery-white mica sheets with exceptional flexibility, found in the pumice layers of Fuji's eastern flank, traditionally used in Japanese artisan crafts.",
    hardness: 2.5,
    meltingPoint: 900,
    baseValue: 30,
    color: "silvery",
    crystalSystem: "monoclinic",
  },
  {
    id: "mfu_andesine",
    name: "Samurai Andesine",
    chemicalFormula: "(Na,Ca)(Al,Si)₄O₈",
    rarity: "rare",
    volcanoId: "mount_fuji",
    description:
      "Reddish-orange plagioclase feldspar crystals found in Fuji's andesitic lava flows, named for their warm color reminiscent of traditional samurai armor lacquer.",
    hardness: 6,
    meltingPoint: 1250,
    baseValue: 190,
    color: "red-orange",
    crystalSystem: "triclinic",
  },
  {
    id: "mfu_jade_inclusion",
    name: "Tengu Jade Inclusion",
    chemicalFormula: "NaAlSi₂O₆",
    rarity: "epic",
    volcanoId: "mount_fuji",
    description:
      "A rare jadeite inclusion discovered within Fuji's volcanic breccia, suggesting deep crustal recycling of subducted Pacific plate material. Named after the mythical Tengu spirits.",
    hardness: 7,
    meltingPoint: 1025,
    baseValue: 700,
    color: "emerald-green",
    crystalSystem: "monoclinic",
  },
  {
    id: "mfu_imperial_obsidian",
    name: "Imperial Obsidian",
    chemicalFormula: "SiO₂·(Fe,Mg,Ca,Na,K)",
    rarity: "mythic",
    volcanoId: "mount_fuji",
    description:
      "A flawless black obsidian blade-quality specimen from Mount Fuji's ancient lava domes, with a deep iridescent gold sheen. Historically used for Japanese samurai swords and ritual mirrors.",
    hardness: 5.5,
    meltingPoint: 1200,
    baseValue: 3500,
    color: "black-gold",
    crystalSystem: "amorphous",
  },

  // ---- Vesuvius (5) ----
  {
    id: "ves_leucite",
    name: "Pompeian Leucite",
    chemicalFormula: "KAlSi₂O₆",
    rarity: "common",
    volcanoId: "vesuvius",
    description:
      "White trapezoidal crystals of potassium feldspathoid found abundantly in Vesuvius's tephritic lavas, a key indicator of the volcano's potassic magma series.",
    hardness: 6,
    meltingPoint: 1400,
    baseValue: 50,
    color: "white",
    crystalSystem: "tetragonal",
  },
  {
    id: "ves_augite",
    name: "Herculaneum Augite",
    chemicalFormula: "(Ca,Na)(Mg,Fe,Al)(Si,Al)₂O₆",
    rarity: "common",
    volcanoId: "vesuvius",
    description:
      "Dark green to black clinopyroxene crystals recovered from the pyroclastic deposits at Herculaneum, preserving chemical signatures of the 79 AD eruption conditions.",
    hardness: 6,
    meltingPoint: 1390,
    baseValue: 55,
    color: "black-green",
    crystalSystem: "monoclinic",
  },
  {
    id: "ves_vesuvianite",
    name: "Vesuvianite (Idocrase)",
    chemicalFormula: "Ca₁₀(Mg,Fe)₂Al₄(SiO₄)₅(Si₂O₇)₂(OH,F)₄",
    rarity: "rare",
    volcanoId: "vesuvius",
    description:
      "Brown to green calcium-aluminum sorosilicate named after Mount Vesuvius where it was first discovered, displaying complex bipyramidal crystal forms.",
    hardness: 6.5,
    meltingPoint: 1320,
    baseValue: 220,
    color: "brown-green",
    crystalSystem: "tetragonal",
  },
  {
    id: "ves_hauyne",
    name: "Bay of Naples Hauyne",
    chemicalFormula: "Na₃Ca(Si₃Al₃)O₁₂(SO₄)",
    rarity: "epic",
    volcanoId: "vesuvius",
    description:
      "Vivid blue sodalite-group feldspathoid found only in Vesuvius and a few other Italian volcanoes, colored by sulfate radicals trapped in its crystal lattice.",
    hardness: 6,
    meltingPoint: 1500,
    baseValue: 580,
    color: "bright-blue",
    crystalSystem: "cubic",
  },
  {
    id: "ves_pompeii_amber",
    name: "Pompeii Amber",
    chemicalFormula: "SiO₂·C₁₀H₁₆O (volcanic resin complex)",
    rarity: "legendary",
    volcanoId: "vesuvius",
    description:
      "A unique mineralized amber specimen formed when the 79 AD pyroclastic flow carbonized and vitrified resin-rich wood, trapping it in volcanic glass. Contains perfectly preserved ancient Roman insect inclusions.",
    hardness: 4,
    meltingPoint: 950,
    baseValue: 2500,
    color: "deep-amber",
    crystalSystem: "amorphous",
  },

  // ---- Krakatoa (5) ----
  {
    id: "kra_pumice",
    name: "Krakatoa Raft Pumice",
    chemicalFormula: "SiO₂·Al₂O₃·Na₂O·K₂O·H₂O",
    rarity: "common",
    volcanoId: "krakatoa",
    description:
      "Highly vesicular pumice from the 1883 eruption that floated across the Indian Ocean in vast rafts, some carrying surviving species to new islands thousands of kilometers away.",
    hardness: 6,
    meltingPoint: 1100,
    baseValue: 30,
    color: "pale-gray",
    crystalSystem: "amorphous",
  },
  {
    id: "kra_volcanic_bomb",
    name: "1883 Volcanic Bomb",
    chemicalFormula: "SiO₂·FeO·MgO·CaO",
    rarity: "common",
    volcanoId: "krakatoa",
    description:
      "A bread-crust volcanic bomb ejected during the climactic 1883 explosion, its cracked surface preserving the gas expansion that occurred during its ballistic flight through the atmosphere.",
    hardness: 7,
    meltingPoint: 1350,
    baseValue: 65,
    color: "dark-brown",
    crystalSystem: "amorphous",
  },
  {
    id: "kra_anorthite",
    name: "Sunda Arc Anorthite",
    chemicalFormula: "CaAl₂Si₂O₈",
    rarity: "rare",
    volcanoId: "krakatoa",
    description:
      "Calcium-rich plagioclase feldspar from the subduction zone beneath the Sunda Arc, recording the geochemical signature of the Indo-Australian plate being forced beneath the Eurasian plate.",
    hardness: 6,
    meltingPoint: 1553,
    baseValue: 195,
    color: "white",
    crystalSystem: "triclinic",
  },
  {
    id: "kra_sunda_arc_diamond",
    name: "Anak Krakatoa Diamond",
    chemicalFormula: "SiO₂ (coesite pseudomorph)",
    rarity: "epic",
    volcanoId: "krakatoa",
    description:
      "A micro-diamond pseudomorph formed under the extreme shock pressures of the 1883 caldera collapse, when atmospheric shock waves exceeded 30,000 atmospheres in the eruption column.",
    hardness: 7.5,
    meltingPoint: 1800,
    baseValue: 800,
    color: "colorless",
    crystalSystem: "cubic",
  },
  {
    id: "kra_krakatoa_peridot",
    name: "Caldera Peridot",
    chemicalFormula: "(Mg)₂SiO₄",
    rarity: "mythic",
    volcanoId: "krakatoa",
    description:
      "A forsteritic olivine of extraordinary purity, ejected from the deep mantle source during the 1883 climactic eruption. Its vivid lime-green color and flawless crystal structure make it one of the rarest volcanic gems known.",
    hardness: 7,
    meltingPoint: 1890,
    baseValue: 4000,
    color: "lime-green",
    crystalSystem: "orthorhombic",
  },

  // ---- Mauna Loa (5) ----
  {
    id: "mal_basalt_crystal",
    name: "Tholeiite Basalt Crystal",
    chemicalFormula: "SiO₂·Al₂O₃·FeO·MgO·CaO",
    rarity: "common",
    volcanoId: "mauna_loa",
    description:
      "A well-formed plagioclase crystal within tholeiitic basalt from Mauna Loa's northeast rift zone, representing the dominant lava type that builds the Hawaiian shield volcanoes.",
    hardness: 6,
    meltingPoint: 1200,
    baseValue: 45,
    color: "gray",
    crystalSystem: "triclinic",
  },
  {
    id: "mal_spinel",
    name: "Mokuʻāweoweo Spinel",
    chemicalFormula: "MgAl₂O₄",
    rarity: "common",
    volcanoId: "mauna_loa",
    description:
      "Red to brown spinel crystals found in Mauna Loa's summit caldera (Mokuʻāweoweo), formed by high-temperature metamorphism of limestone xenoliths incorporated into the magma.",
    hardness: 8,
    meltingPoint: 2135,
    baseValue: 80,
    color: "red-brown",
    crystalSystem: "cubic",
  },
  {
    id: "mal_picrite",
    name: "Deep Rift Picrite",
    chemicalFormula: "Mg₂SiO₄·CaAl₂Si₂O₈ (high-Mg basalt)",
    rarity: "rare",
    volcanoId: "mauna_loa",
    description:
      "Magnesium-rich olivine-rich basalt from the deep roots of Mauna Loa's rift system, containing over 20% olivine phenocrysts and representing near-primary mantle melt compositions.",
    hardness: 6.5,
    meltingPoint: 1450,
    baseValue: 230,
    color: "dark-green",
    crystalSystem: "various",
  },
  {
    id: "mal_peridot_gem",
    name: "Kona Coast Peridot",
    chemicalFormula: "(Mg,Fe)₂SiO₄",
    rarity: "epic",
    volcanoId: "mauna_loa",
    description:
      "Gem-quality peridot found in the beach sands of the Kona coast, weathered from Mauna Loa's ancient lava flows and tumbled by Pacific waves into smooth, vivid green gemstones.",
    hardness: 6.5,
    meltingPoint: 1205,
    baseValue: 650,
    color: "yellow-green",
    crystalSystem: "orthorhombic",
  },
  {
    id: "mal_mauna_loa_sapphire",
    name: "Mauna Loa Blue Sapphire",
    chemicalFormula: "Al₂O₃ (Cr,Fe,Ti traces)",
    rarity: "mythic",
    volcanoId: "mauna_loa",
    description:
      "An impossibly rare corundum (sapphire) formed by the unique geochemical conditions at Mauna Loa's magma source, where the Hawaiian mantle plume intersects an ancient subducted slab. Deep cornflower blue.",
    hardness: 9,
    meltingPoint: 2045,
    baseValue: 5000,
    color: "deep-blue",
    crystalSystem: "trigonal",
  },

  // ---- Thera / Santorini (5) ----
  {
    id: "the_obsidian",
    name: "Minoan Obsidian",
    chemicalFormula: "SiO₂",
    rarity: "common",
    volcanoId: "thera",
    description:
      "Jet-black volcanic glass from the Thera caldera, used by the Minoan civilization for tools, weapons, and mirrors. Obsidian from Thera has been found at archaeological sites across the Mediterranean.",
    hardness: 5.5,
    meltingPoint: 1100,
    baseValue: 55,
    color: "black",
    crystalSystem: "amorphous",
  },
  {
    id: "the_thera_pumice",
    name: "Minoan Catastrophe Pumice",
    chemicalFormula: "SiO₂·Al₂O₃·H₂O",
    rarity: "common",
    volcanoId: "thera",
    description:
      "Pumice from the catastrophic Bronze Age eruption of Thera (~1600 BCE), found in archaeological layers at Akrotiri and as far away as the Nile Delta and the Black Sea.",
    hardness: 6,
    meltingPoint: 1050,
    baseValue: 45,
    color: "white-cream",
    crystalSystem: "amorphous",
  },
  {
    id: "the_santorini_quartz",
    name: "Akrotiri Rose Quartz",
    chemicalFormula: "SiO₂",
    rarity: "rare",
    volcanoId: "thera",
    description:
      "Pink quartz crystals found in the hydrothermal veins beneath the Thera caldera, colored by trace phosphorus and aluminum substitutions in the silica lattice.",
    hardness: 7,
    meltingPoint: 1670,
    baseValue: 210,
    color: "pink",
    crystalSystem: "trigonal",
  },
  {
    id: "the_minoan_crystal",
    name: "Minoan Crystal",
    chemicalFormula: "Na₃AlF₆ (cryolite pseudomorph)",
    rarity: "epic",
    volcanoId: "thera",
    description:
      "A rare cryolite pseudomorph preserved in the ash layers of the Minoan eruption, possibly an artifact of the ancient Minoan ritual caches found in the Akrotiri excavations.",
    hardness: 2.5,
    meltingPoint: 1012,
    baseValue: 750,
    color: "colorless-white",
    crystalSystem: "monoclinic",
  },
  {
    id: "the_atlantis_shard",
    name: "Atlantis Shard",
    chemicalFormula: "SiO₂·TiO₂·FeO (unknown structure)",
    rarity: "mythic",
    volcanoId: "thera",
    description:
      "A luminous crystalline fragment of unknown mineralogical composition recovered from the submerged caldera floor of Thera. Exhibits piezoelectric properties and ancient micro-carvings matching Linear A script.",
    hardness: 8.5,
    meltingPoint: 2200,
    baseValue: 6000,
    color: "iridescent-cyan",
    crystalSystem: "unknown",
  },
];

// ---------------------------------------------------------------------------
// Constants — Equipment (8 items)
// ---------------------------------------------------------------------------

export const VL_EQUIPMENT: EquipmentDef[] = [
  {
    id: "heat_suit",
    name: "Thermal Protection Suit",
    description:
      "Advanced multi-layer suit with aerogel insulation and active liquid cooling system, rated for temperatures up to 1200°C. Essential for close-range lava observation.",
    cost: 500,
    heatResistance: 60,
    analysisBonus: 5,
    collectionBonus: 10,
    maxLevel: 5,
    icon: "🥼",
  },
  {
    id: "diamond_drill",
    name: "Diamond-Tipped Drill",
    description:
      "Industrial-grade rotary drill with polycrystalline diamond compact bits, capable of extracting core samples from solidified lava and deep rock formations.",
    cost: 800,
    heatResistance: 20,
    analysisBonus: 15,
    collectionBonus: 20,
    maxLevel: 5,
    icon: "🔧",
  },
  {
    id: "spectrometer",
    name: "Field Spectrometer",
    description:
      "Portable X-ray fluorescence (XRF) spectrometer for real-time elemental analysis of rock and mineral samples in the field.",
    cost: 650,
    heatResistance: 10,
    analysisBonus: 25,
    collectionBonus: 5,
    maxLevel: 5,
    icon: "🔬",
  },
  {
    id: "seismic_sensor",
    name: "Seismic Sensor Array",
    description:
      "Network of broadband seismometers with GPS timing, capable of detecting seismic waves from local micro-earthquakes to distant teleseismic events.",
    cost: 700,
    heatResistance: 15,
    analysisBonus: 20,
    collectionBonus: 0,
    maxLevel: 5,
    icon: "📡",
  },
  {
    id: "gas_mask",
    name: "Volcanic Gas Respirator",
    description:
      "Military-grade full-face respirator with multi-stage chemical filtration for SO2, HCl, HF, and H2S volcanic gases. Extended-duration air supply.",
    cost: 400,
    heatResistance: 10,
    analysisBonus: 10,
    collectionBonus: 15,
    maxLevel: 5,
    icon: "😷",
  },
  {
    id: "cooling_pack",
    name: "Cryogenic Cooling Pack",
    description:
      "Phase-change material cooling vest with endothermic gel packs providing up to 8 hours of active thermal regulation in high-temperature environments.",
    cost: 350,
    heatResistance: 40,
    analysisBonus: 0,
    collectionBonus: 5,
    maxLevel: 5,
    icon: "🧊",
  },
  {
    id: "lava_boat",
    name: "Reinforced Lava Skiff",
    description:
      "Titanium-hulled amphibious boat with ceramic thermal coating, designed for sampling molten lava flows directly from rivers and lava tubes.",
    cost: 1200,
    heatResistance: 80,
    analysisBonus: 10,
    collectionBonus: 25,
    maxLevel: 5,
    icon: "🚣",
  },
  {
    id: "shield_generator",
    name: "Thermal Shield Generator",
    description:
      "Experimental directional heat-deflection device using refractory ceramic panels and forced-air cooling to create a temporary thermal barrier around the research zone.",
    cost: 2000,
    heatResistance: 95,
    analysisBonus: 15,
    collectionBonus: 15,
    maxLevel: 3,
    icon: "🛡️",
  },
];

// ---------------------------------------------------------------------------
// Constants — Research Stations (6)
// ---------------------------------------------------------------------------

export const VL_STATIONS: StationDef[] = [
  {
    id: "seismograph",
    name: "Seismograph Station",
    description:
      "Monitors seismic activity using broadband seismometers. Tracks P-waves, S-waves, and surface waves to detect magma movement and predict eruptions.",
    baseCost: 200,
    upgradeCost: 300,
    maxLevel: 5,
    unlockLevel: 1,
    icon: "📊",
    analysisType: "seismic",
  },
  {
    id: "gas_analyzer",
    name: "Gas Analyzer Lab",
    description:
      "Multi-gas spectrometer system for real-time monitoring of volcanic gas emissions including SO2, CO2, H2S, HCl, and HF. Critical for eruption forecasting.",
    baseCost: 250,
    upgradeCost: 350,
    maxLevel: 5,
    unlockLevel: 3,
    icon: "🧪",
    analysisType: "gas",
  },
  {
    id: "lava_sample",
    name: "Lava Sample Laboratory",
    description:
      "Equipped with petrographic microscopes, XRF analyzers, and mass spectrometers for detailed geochemical analysis of lava and rock samples.",
    baseCost: 300,
    upgradeCost: 400,
    maxLevel: 5,
    unlockLevel: 5,
    icon: "🔬",
    analysisType: "petrology",
  },
  {
    id: "thermal_imaging",
    name: "Thermal Imaging Center",
    description:
      "Forward-looking infrared (FLIR) cameras and thermal mapping systems for monitoring ground deformation, lava flow temperatures, and fumarole activity.",
    baseCost: 350,
    upgradeCost: 450,
    maxLevel: 5,
    unlockLevel: 8,
    icon: "🌡️",
    analysisType: "thermal",
  },
  {
    id: "core_drill",
    name: "Core Drill Platform",
    description:
      "Hydraulic wireline core drilling system capable of extracting continuous rock cores from volcanic edifices up to 500 meters depth.",
    baseCost: 500,
    upgradeCost: 600,
    maxLevel: 5,
    unlockLevel: 12,
    icon: "🔩",
    analysisType: "geology",
  },
  {
    id: "crystal_growth",
    name: "Crystal Growth Chamber",
    description:
      "High-temperature pressure vessel for synthesizing volcanic minerals and studying crystal nucleation kinetics under controlled magmatic conditions.",
    baseCost: 600,
    upgradeCost: 700,
    maxLevel: 5,
    unlockLevel: 18,
    icon: "💎",
    analysisType: "mineralogy",
  },
];

// ---------------------------------------------------------------------------
// Constants — Rock Types (6)
// ---------------------------------------------------------------------------

export const VL_ROCK_TYPES: RockTypeDef[] = [
  {
    type: "basalt",
    name: "Basalt",
    description:
      "A fine-grained mafic extrusive igneous rock formed from the rapid cooling of magnesium-rich and iron-rich lava. The most common rock type in the Earth's oceanic crust.",
    silicaContent: 45,
    viscosity: "low",
    color: "dark-gray to black",
    commonIn: ["Kilauea", "Mauna Loa"],
  },
  {
    type: "andesite",
    name: "Andesite",
    description:
      "An intermediate extrusive igneous rock with a characteristic porphyritic texture of large plagioclase phenocrysts in a fine-grained groundmass. Named after the Andes mountains.",
    silicaContent: 57,
    viscosity: "medium",
    color: "medium-gray",
    commonIn: ["Mount St. Helens", "Mount Fuji", "Vesuvius"],
  },
  {
    type: "rhyolite",
    name: "Rhyolite",
    description:
      "A light-colored felsic extrusive igneous rock with high silica content, equivalent to granite in composition. Associated with explosive eruptions and pyroclastic flows.",
    silicaContent: 72,
    viscosity: "high",
    color: "light-gray to pink",
    commonIn: ["Eyjafjallajökull", "Krakatoa", "Thera"],
  },
  {
    type: "obsidian",
    name: "Obsidian",
    description:
      "A naturally occurring volcanic glass formed when silica-rich lava extruded from a volcano cools rapidly with minimal crystal growth. Used since prehistoric times for tools and weapons.",
    silicaContent: 70,
    viscosity: "high",
    color: "black to dark-brown",
    commonIn: ["Thera", "Mount Fuji"],
  },
  {
    type: "pumice",
    name: "Pumice",
    description:
      "An extremely vesicular volcanic rock formed when gas-rich lava froths as it cools, trapping millions of tiny gas bubbles. Light enough to float on water.",
    silicaContent: 65,
    viscosity: "high",
    color: "pale-gray to white",
    commonIn: ["Krakatoa", "Eyjafjallajökull", "Thera"],
  },
  {
    type: "granite",
    name: "Granite",
    description:
      "A coarse-grained intrusive igneous rock composed mainly of quartz, feldspar, and mica. Forms the continental crust and is the plutonic equivalent of rhyolite.",
    silicaContent: 70,
    viscosity: "high",
    color: "pink-gray speckled",
    commonIn: ["Mount St. Helens", "Mount Fuji"],
  },
];

// ---------------------------------------------------------------------------
// Constants — Eruption Phase Data
// ---------------------------------------------------------------------------

const ERUPTION_PHASE_DATA: Record<EruptionPhase, {
  label: string;
  description: string;
  temperatureRange: [number, number];
  seismicRange: [number, number];
  color: string;
}> = {
  dormant: {
    label: "Dormant",
    description: "No significant volcanic activity. Surface temperatures are near ambient. Minimal seismic readings.",
    temperatureRange: [15, 100],
    seismicRange: [0, 10],
    color: "#4ade80",
  },
  unrest: {
    label: "Unrest",
    description: "Increased seismic activity and gas emissions detected. Ground deformation may be occurring. Monitoring intensified.",
    temperatureRange: [100, 400],
    seismicRange: [10, 40],
    color: "#facc15",
  },
  active: {
    label: "Active",
    description: "Volcano is actively building toward eruption. Lava may be visible, tremors continuous. Evacuation zones activated.",
    temperatureRange: [400, 800],
    seismicRange: [40, 70],
    color: "#f97316",
  },
  erupting: {
    label: "Erupting",
    description: "Full volcanic eruption in progress. Lava flows, ash columns, pyroclastic flows possible. Extreme danger zone.",
    temperatureRange: [800, 1200],
    seismicRange: [70, 100],
    color: "#ef4444",
  },
  cooling: {
    label: "Cooling",
    description: "Eruption activity subsiding. Lava flows cooling and solidifying. Gas emissions decreasing. Monitoring continues.",
    temperatureRange: [200, 600],
    seismicRange: [5, 30],
    color: "#818cf8",
  },
};

// ---------------------------------------------------------------------------
// Constants — Earthquake Magnitude Scale
// ---------------------------------------------------------------------------

const EARTHQUAKE_SCALE: {
  min: number;
  max: number;
  classification: string;
  description: string;
  feltBy: string;
}[] = [
  { min: 0, max: 1.9, classification: "micro", description: "Not felt", feltBy: "not felt" },
  { min: 2.0, max: 2.9, classification: "minor", description: "Felt slightly by some people", feltBy: "few people" },
  { min: 3.0, max: 3.9, classification: "minor", description: "Felt noticeably indoors", feltBy: "many people indoors" },
  { min: 4.0, max: 4.9, classification: "light", description: "Noticeable shaking, rattling", feltBy: "most people" },
  { min: 5.0, max: 5.9, classification: "moderate", description: "Can cause moderate damage", feltBy: "everyone" },
  { min: 6.0, max: 6.9, classification: "strong", description: "Serious damage in populated areas", feltBy: "everyone, widespread" },
  { min: 7.0, max: 7.9, classification: "major", description: "Widespread serious damage", feltBy: "everyone, severe" },
  { min: 8.0, max: 9.9, classification: "great", description: "Devastating over large areas", feltBy: "everyone, catastrophic" },
  { min: 10.0, max: 12.0, classification: "legendary", description: "Extremely rare, immense", feltBy: "continental scale" },
];

// ---------------------------------------------------------------------------
// Constants — Research Topics (for publications)
// ---------------------------------------------------------------------------

const RESEARCH_TOPICS: {
  id: string;
  name: string;
  field: string;
  baseXP: number;
  baseCoins: number;
  minLevel: number;
}[] = [
  { id: "rt_magma_composition", name: "Magma Composition Analysis", field: "Petrology", baseXP: 80, baseCoins: 100, minLevel: 1 },
  { id: "rt_seismic_patterns", name: "Seismic Wave Pattern Recognition", field: "Seismology", baseXP: 100, baseCoins: 120, minLevel: 3 },
  { id: "rt_gas_emissions", name: "Volcanic Gas Emission Modeling", field: "Geochemistry", baseXP: 90, baseCoins: 110, minLevel: 2 },
  { id: "rt_thermal_anomalies", name: "Thermal Anomaly Detection", field: "Geophysics", baseXP: 110, baseCoins: 130, minLevel: 5 },
  { id: "rt_eruption_mechanics", name: "Eruption Trigger Mechanisms", field: "Volcanology", baseXP: 150, baseCoins: 200, minLevel: 8 },
  { id: "rt_crystal_growth", name: "Magmatic Crystal Nucleation Kinetics", field: "Mineralogy", baseXP: 120, baseCoins: 150, minLevel: 6 },
  { id: "rt_ground_deformation", name: "GPS Ground Deformation Monitoring", field: "Geodesy", baseXP: 100, baseCoins: 125, minLevel: 4 },
  { id: "rt_lava_flow_model", name: "Lava Flow Simulation and Prediction", field: "Geophysics", baseXP: 140, baseCoins: 180, minLevel: 10 },
  { id: "rt_hazards_assessment", name: "Volcanic Hazard Risk Assessment", field: "Risk Science", baseXP: 160, baseCoins: 200, minLevel: 12 },
  { id: "rt_climate_impact", name: "Volcanic Aerosol Climate Impact", field: "Climatology", baseXP: 180, baseCoins: 250, minLevel: 15 },
  { id: "rt_tectonics", name: "Subduction Zone Volcanism", field: "Tectonics", baseXP: 200, baseCoins: 300, minLevel: 20 },
  { id: "rt_geothermal", name: "Geothermal Energy Potential", field: "Energy Science", baseXP: 130, baseCoins: 175, minLevel: 7 },
];

// ---------------------------------------------------------------------------
// Constants — Scientist Titles (level 1–45)
// ---------------------------------------------------------------------------

const LEVEL_TITLES: { minLevel: number; maxLevel: number; title: string }[] = [
  { minLevel: 1, maxLevel: 5, title: "Lab Intern" },
  { minLevel: 6, maxLevel: 10, title: "Lab Assistant" },
  { minLevel: 11, maxLevel: 15, title: "Field Researcher" },
  { minLevel: 16, maxLevel: 20, title: "Geologist" },
  { minLevel: 21, maxLevel: 25, title: "Volcanic Analyst" },
  { minLevel: 26, maxLevel: 30, title: "Senior Geologist" },
  { minLevel: 31, maxLevel: 35, title: "Lead Researcher" },
  { minLevel: 36, maxLevel: 40, title: "Chief Volcanologist" },
  { minLevel: 41, maxLevel: 45, title: "Master Volcanologist" },
];

// ---------------------------------------------------------------------------
// Constants — Achievements (15)
// ---------------------------------------------------------------------------

const ACHIEVEMENT_DEFS: Omit<Achievement, "unlocked" | "unlockedAt">[] = [
  { id: "ach_first_descent", name: "First Descent", description: "Visit your first volcano.", reward: { xp: 50, coins: 100 } },
  { id: "ach_mineral_hunter", name: "Mineral Hunter", description: "Collect 10 minerals total.", reward: { xp: 100, coins: 200 } },
  { id: "ach_rock_collector", name: "Rock Collector", description: "Collect samples of all 6 rock types.", reward: { xp: 150, coins: 300 } },
  { id: "ach_eruption_predictor", name: "Eruption Predictor", description: "Correctly predict 5 eruptions.", reward: { xp: 200, coins: 500 } },
  { id: "ach_station_master", name: "Station Master", description: "Upgrade all research stations to level 5.", reward: { xp: 300, coins: 750 } },
  { id: "ach_full_kit", name: "Full Kit", description: "Purchase all 8 equipment items.", reward: { xp: 200, coins: 500 } },
  { id: "ach_mythic_find", name: "Mythic Find", description: "Collect a mythic-tier mineral.", reward: { xp: 500, coins: 1000 } },
  { id: "ach_first_publication", name: "First Publication", description: "Publish your first research paper.", reward: { xp: 150, coins: 250 } },
  { id: "ach_seismologist", name: "Seismologist", description: "Record 25 earthquakes.", reward: { xp: 200, coins: 400 } },
  { id: "ach_gas_expert", name: "Gas Expert", description: "Take 15 gas samples.", reward: { xp: 150, coins: 350 } },
  { id: "ach_expedition_leader", name: "Expedition Leader", description: "Complete 5 expeditions.", reward: { xp: 200, coins: 400 } },
  { id: "ach_temp_mapper", name: "Temperature Mapper", description: "Complete 10 thermal scans.", reward: { xp: 150, coins: 300 } },
  { id: "ach_streak_master", name: "Streak Master", description: "Maintain a 7-day prediction streak.", reward: { xp: 300, coins: 600 } },
  { id: "ach_volcano_veteran", name: "Volcano Veteran", description: "Study all 8 volcanoes.", reward: { xp: 500, coins: 1000 } },
  { id: "ach_senior_volcanologist", name: "Senior Volcanologist", description: "Reach level 30.", reward: { xp: 1000, coins: 2000 } },
];

// ---------------------------------------------------------------------------
// Constants — Lava Flow Directions
// ---------------------------------------------------------------------------

const LAVA_FLOW_DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;

const EXPEDITION_DIFFICULTIES = [
  { difficulty: 1, label: "Scouting Run", riskLevel: 1, baseXP: 30, baseCoins: 50 },
  { difficulty: 2, label: "Survey Mission", riskLevel: 2, baseXP: 60, baseCoins: 100 },
  { difficulty: 3, label: "Research Expedition", riskLevel: 3, baseXP: 100, baseCoins: 200 },
  { difficulty: 4, label: "Deep Descent", riskLevel: 4, baseXP: 180, baseCoins: 350 },
  { difficulty: 5, label: "Extreme Survey", riskLevel: 5, baseXP: 300, baseCoins: 600 },
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
  return `vl_${ts}_${rand}`;
}

function xpForLevel(level: number): number {
  return Math.floor(150 * Math.pow(1.22, level - 1));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function classifyEarthquake(magnitude: number): { classification: string; feltBy: string } {
  for (const entry of EARTHQUAKE_SCALE) {
    if (magnitude >= entry.min && magnitude <= entry.max) {
      return { classification: entry.classification, feltBy: entry.feltBy };
    }
  }
  return { classification: "unknown", feltBy: "unknown" };
}

function classifyGasAlert(so2: number, co2: number, h2s: number, hcl: number, hf: number): "normal" | "elevated" | "high" | "extreme" {
  const score = (so2 / 500) + (co2 / 5000) + (h2s / 50) + (hcl / 100) + (hf / 20);
  if (score < 0.5) return "normal";
  if (score < 1.5) return "elevated";
  if (score < 3.0) return "high";
  return "extreme";
}

function getRarityMultiplier(rarity: MineralRarity): number {
  const multipliers: Record<MineralRarity, number> = {
    common: 1,
    rare: 2.5,
    epic: 6,
    legendary: 15,
    mythic: 40,
  };
  return multipliers[rarity];
}

function getRarityColor(rarity: MineralRarity): string {
  const colors: Record<MineralRarity, string> = {
    common: "#9ca3af",
    rare: "#3b82f6",
    epic: "#a855f7",
    legendary: "#f59e0b",
    mythic: "#ef4444",
  };
  return colors[rarity];
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let state: VolcanoLabState | null = null;

function ensureInit(): VolcanoLabState {
  if (state) return state;

  const now = Date.now();

  const volcanoes: Volcano[] = VL_VOLCANOES.map((v) => ({
    ...v,
    visited: false,
    visitCount: 0,
    currentPhase: "dormant" as EruptionPhase,
    temperature: 25,
    seismicActivity: 2,
    explorationProgress: 0,
  }));

  const minerals: Mineral[] = VL_MINERALS.map((m) => ({
    ...m,
    collected: false,
    collectedAt: null,
    quantity: 0,
    purity: 0,
  }));

  const researchStations: ResearchStation[] = VL_STATIONS.map((st) => ({
    stationId: st.id,
    unlocked: st.unlockLevel <= 1,
    level: 0,
    totalAnalyses: 0,
    lastAnalysisAt: null,
  }));

  const equipment: Equipment[] = VL_EQUIPMENT.map((eq) => ({
    equipmentId: eq.id,
    owned: false,
    equipped: false,
    level: 1,
    durability: 100,
    maxDurability: 100,
  }));

  const achievements: Achievement[] = ACHIEVEMENT_DEFS.map((a) => ({
    ...a,
    unlocked: false,
    unlockedAt: null,
  }));

  // Randomize initial volcano phases
  const rng = seededRandom(now % 100000);
  const phases: EruptionPhase[] = ["dormant", "dormant", "unrest", "dormant", "unrest", "dormant", "active", "dormant"];
  for (let i = 0; i < volcanoes.length; i++) {
    volcanoes[i].currentPhase = phases[i];
    const phaseData = ERUPTION_PHASE_DATA[phases[i]];
    const tempRange = phaseData.temperatureRange;
    const seisRange = phaseData.seismicRange;
    volcanoes[i].temperature = Math.floor(tempRange[0] + rng() * (tempRange[1] - tempRange[0]));
    volcanoes[i].seismicActivity = Math.floor(seisRange[0] + rng() * (seisRange[1] - seisRange[0]));
  }

  state = {
    level: 1,
    xp: 0,
    coins: 500,
    totalCoinsEarned: 500,
    totalCoinsSpent: 0,
    totalXP: 0,
    activeVolcano: null,
    volcanoes,
    minerals,
    mineralCombinations: [],
    researchStations,
    equipment,
    eruptionPredictions: [],
    earthquakes: [],
    gasReadings: [],
    temperatureMap: [],
    publications: [],
    dailySeismicEvent: null,
    achievements,
    unlockedAchievements: [],
    streak: 0,
    bestStreak: 0,
    lastActiveDate: "",
    stats: {
      totalMineralsCollected: 0,
      uniqueMineralsCollected: 0,
      totalCombinations: 0,
      totalAnalysesRun: 0,
      totalPredictions: 0,
      correctPredictions: 0,
      totalEarthquakes: 0,
      totalGasSamples: 0,
      totalThermalScans: 0,
      totalPublications: 0,
      totalCitations: 0,
      totalExpeditions: 0,
      totalExpeditionsSuccess: 0,
      volcanoesVisited: 0,
      volcanoesFullyExplored: 0,
      coinsEarned: 500,
      coinsSpent: 0,
      totalXP: 0,
      playTime: 0,
    },
    expeditions: [],
    createdAt: now,
    lastUpdated: now,
  };

  return state;
}

// ---------------------------------------------------------------------------
// State Access
// ---------------------------------------------------------------------------

export function vlGetState(): VolcanoLabState {
  return ensureInit();
}

export function vlResetState(): void {
  state = null;
}

// ---------------------------------------------------------------------------
// Level & XP
// ---------------------------------------------------------------------------

export function vlGetLevel(): number {
  return ensureInit().level;
}

export function vlAddXP(amount: number): { leveledUp: boolean; newLevel: number } {
  const s = ensureInit();
  let leveledUp = false;
  s.xp += amount;
  s.totalXP += amount;
  s.stats.totalXP += amount;

  while (s.xp >= xpForLevel(s.level) && s.level < 45) {
    s.xp -= xpForLevel(s.level);
    s.level += 1;
    leveledUp = true;

    // Auto-unlock stations at level thresholds
    for (const st of s.researchStations) {
      const def = VL_STATIONS.find((d) => d.id === st.stationId);
      if (def && def.unlockLevel <= s.level) {
        st.unlocked = true;
      }
    }
  }

  if (s.level >= 45) {
    s.xp = 0;
  }

  s.lastUpdated = Date.now();
  vlCheckAchievements();
  return { leveledUp, newLevel: s.level };
}

export function vlGetXPProgress(): { current: number; needed: number; percentage: number } {
  const s = ensureInit();
  if (s.level >= 45) return { current: 0, needed: 0, percentage: 100 };
  const needed = xpForLevel(s.level);
  return {
    current: s.xp,
    needed,
    percentage: needed > 0 ? Math.min(100, (s.xp / needed) * 100) : 100,
  };
}

export function vlGetTitle(): string {
  const level = ensureInit().level;
  for (const entry of LEVEL_TITLES) {
    if (level >= entry.minLevel && level <= entry.maxLevel) {
      return entry.title;
    }
  }
  return "Master Volcanologist";
}

// ---------------------------------------------------------------------------
// Coins
// ---------------------------------------------------------------------------

export function vlGetCoins(): number {
  return ensureInit().coins;
}

export function vlSpendCoins(amount: number): { success: boolean; remaining: number } {
  const s = ensureInit();
  if (s.coins < amount) return { success: false, remaining: s.coins };
  s.coins -= amount;
  s.totalCoinsSpent += amount;
  s.stats.coinsSpent += amount;
  s.lastUpdated = Date.now();
  return { success: true, remaining: s.coins };
}

// ---------------------------------------------------------------------------
// Volcanoes
// ---------------------------------------------------------------------------

export function vlGetVolcanoes(): Volcano[] {
  return ensureInit().volcanoes;
}

export function vlGetActiveVolcano(): Volcano | null {
  const s = ensureInit();
  if (!s.activeVolcano) return null;
  return s.volcanoes.find((v) => v.id === s.activeVolcano) ?? null;
}

export function vlSetActiveVolcano(volcanoId: string): void {
  const s = ensureInit();
  const volcano = s.volcanoes.find((v) => v.id === volcanoId);
  if (!volcano) return;

  s.activeVolcano = volcanoId;

  if (!volcano.visited) {
    volcano.visited = true;
    volcano.visitCount += 1;
    s.stats.volcanoesVisited = s.volcanoes.filter((v) => v.visited).length;
    vlAddXP(25);
  } else {
    volcano.visitCount += 1;
  }

  s.lastUpdated = Date.now();
  vlCheckAchievements();
}

// ---------------------------------------------------------------------------
// Minerals
// ---------------------------------------------------------------------------

export function vlGetMinerals(): Mineral[] {
  return ensureInit().minerals;
}

export function vlGetMineralsByVolcano(volcanoId: string): Mineral[] {
  return ensureInit().minerals.filter((m) => m.volcanoId === volcanoId);
}

export function vlCollectMineral(mineralId: string): { success: boolean; mineral: Mineral | null; xpGained: number; coinsGained: number } {
  const s = ensureInit();
  const mineral = s.minerals.find((m) => m.id === mineralId);
  if (!mineral) return { success: false, mineral: null, xpGained: 0, coinsGained: 0 };

  // Check if the volcano is active
  if (!s.activeVolcano) return { success: false, mineral: null, xpGained: 0, coinsGained: 0 };
  if (mineral.volcanoId !== s.activeVolcano) return { success: false, mineral: null, xpGained: 0, coinsGained: 0 };

  // Collection probability based on rarity
  const rarityChance: Record<MineralRarity, number> = {
    common: 0.85,
    rare: 0.55,
    epic: 0.30,
    legendary: 0.12,
    mythic: 0.04,
  };

  // Equipment bonuses
  let collectionBonus = 0;
  for (const eq of s.equipment) {
    if (eq.owned && eq.equipped) {
      const def = VL_EQUIPMENT.find((d) => d.id === eq.equipmentId);
      if (def) collectionBonus += def.collectionBonus * 0.01 * eq.level;
    }
  }

  const chance = Math.min(0.98, rarityChance[mineral.rarity] + collectionBonus);
  if (Math.random() > chance) {
    return { success: false, mineral: null, xpGained: 5, coinsGained: 0 };
  }

  const purity = Math.floor(60 + Math.random() * 41);
  const quantity = mineral.rarity === "common" ? Math.floor(1 + Math.random() * 3) : 1;

  mineral.collected = true;
  mineral.collectedAt = Date.now();
  mineral.quantity += quantity;
  mineral.purity = Math.max(mineral.purity, purity);

  const xpGained = Math.floor(getRarityMultiplier(mineral.rarity) * 15);
  const coinsGained = Math.floor(mineral.baseValue * getRarityMultiplier(mineral.rarity) * 0.1);

  s.coins += coinsGained;
  s.totalCoinsEarned += coinsGained;
  s.stats.coinsEarned += coinsGained;
  s.stats.totalMineralsCollected += quantity;
  s.stats.uniqueMineralsCollected = s.minerals.filter((m) => m.collected).length;

  vlAddXP(xpGained);
  vlCheckAchievements();
  s.lastUpdated = Date.now();

  return { success: true, mineral, xpGained, coinsGained };
}

export function vlGetCollectedMinerals(): CollectedMineral[] {
  const s = ensureInit();
  return s.minerals
    .filter((m) => m.collected && m.quantity > 0)
    .map((m) => ({
      ...m,
      instanceId: `${m.id}_${m.collectedAt}`,
      collectedAt: m.collectedAt ?? 0,
      purity: m.purity,
      quantity: m.quantity,
    }));
}

// ---------------------------------------------------------------------------
// Mineral Combinations
// ---------------------------------------------------------------------------

export function vlCombineMinerals(
  mineral1Id: string,
  mineral2Id: string,
  mineral3Id?: string
): { success: boolean; combination: MineralCombination | null; xpGained: number } {
  const s = ensureInit();

  if (mineral1Id === mineral2Id) return { success: false, combination: null, xpGained: 0 };
  if (mineral3Id && (mineral3Id === mineral1Id || mineral3Id === mineral2Id)) {
    return { success: false, combination: null, xpGained: 0 };
  }

  const m1 = s.minerals.find((m) => m.id === mineral1Id);
  const m2 = s.minerals.find((m) => m.id === mineral2Id);
  if (!m1 || !m2) return { success: false, combination: null, xpGained: 0 };
  if (!m1.collected || !m2.collected || m1.quantity < 1 || m2.quantity < 1) {
    return { success: false, combination: null, xpGained: 0 };
  }

  let m3 = null;
  if (mineral3Id) {
    m3 = s.minerals.find((m) => m.id === mineral3Id);
    if (!m3 || !m3.collected || m3.quantity < 1) {
      return { success: false, combination: null, xpGained: 0 };
    }
  }

  // Consume minerals
  m1.quantity -= 1;
  m2.quantity -= 1;
  if (m3) m3.quantity -= 1;

  // Determine result rarity
  const inputRarities = [m1.rarity, m2.rarity];
  if (m3) inputRarities.push(m3.rarity);
  const rarityOrder: MineralRarity[] = ["common", "rare", "epic", "legendary", "mythic"];
  const maxRarityIdx = Math.max(...inputRarities.map((r) => rarityOrder.indexOf(r)));
  const resultRarity: MineralRarity = rarityOrder[Math.min(rarityOrder.length - 1, maxRarityIdx + 1)];

  const alloyNames = [
    "Pyroxenite Alloy", "Basaltic Glass Composite", "Magmatic Steel",
    "Obsidian Crystal Matrix", "Peridot Fusion", "Volcanic Damascus",
    "Magma-forged Titanium", "Eruption Tempered Alloy", "Deep Mantle Blend",
    "Tectonic Fusion", "Fumarole Condensate", "Pahoehoe Steel",
    "Plinian Crystal Alloy", "Caldera Compound", "Rift Zone Synthesis",
  ];

  const name = m3
    ? `${m1.name.split(" ").slice(-1)[0]}-${m2.name.split(" ").slice(-1)[0]}-${m3.name.split(" ").slice(-1)[0]} Fusion`
    : `${m1.name.split(" ").slice(-1)[0]}-${m2.name.split(" ").slice(-1)[0]} Alloy`;

  const value = Math.floor((m1.baseValue + m2.baseValue + (m3?.baseValue ?? 0)) * getRarityMultiplier(resultRarity) * 0.5);

  const combination: MineralCombination = {
    id: generateId(),
    name,
    input1Id: mineral1Id,
    input2Id: mineral2Id,
    input3Id: mineral3Id ?? null,
    resultName: pickRandom(alloyNames),
    resultDescription: `A synthetic mineral created by combining ${m1.name} with ${m2.name}${m3 ? ` and ${m3.name}` : ""} under extreme volcanic conditions.`,
    resultRarity,
    value,
    createdAt: Date.now(),
  };

  s.mineralCombinations.push(combination);
  s.stats.totalCombinations += 1;

  const xpGained = Math.floor(30 * getRarityMultiplier(resultRarity));
  vlAddXP(xpGained);
  vlCheckAchievements();
  s.lastUpdated = Date.now();

  return { success: true, combination, xpGained };
}

// ---------------------------------------------------------------------------
// Research Stations
// ---------------------------------------------------------------------------

export function vlGetResearchStations(): ResearchStation[] {
  return ensureInit().researchStations;
}

export function vlUpgradeStation(stationId: string): { success: boolean; cost: number } {
  const s = ensureInit();
  const station = s.researchStations.find((st) => st.stationId === stationId);
  if (!station) return { success: false, cost: 0 };

  const def = VL_STATIONS.find((d) => d.id === stationId);
  if (!def) return { success: false, cost: 0 };

  if (!station.unlocked) return { success: false, cost: 0 };
  if (station.level >= def.maxLevel) return { success: false, cost: 0 };

  const cost = Math.floor(def.baseCost + def.upgradeCost * station.level);
  const spent = vlSpendCoins(cost);
  if (!spent.success) return { success: false, cost };

  station.level += 1;
  vlCheckAchievements();
  s.lastUpdated = Date.now();

  return { success: true, cost };
}

export function vlRunAnalysis(stationId: string): {
  success: boolean;
  stationId: string;
  analysisType: string;
  results: Record<string, number>;
  xpGained: number;
  coinsGained: number;
  quality: number;
} {
  const s = ensureInit();
  const station = s.researchStations.find((st) => st.stationId === stationId);
  if (!station) return { success: false, stationId, analysisType: "", results: {}, xpGained: 0, coinsGained: 0, quality: 0 };

  const def = VL_STATIONS.find((d) => d.id === stationId);
  if (!def || !station.unlocked || station.level < 1) {
    return { success: false, stationId, analysisType: "", results: {}, xpGained: 0, coinsGained: 0, quality: 0 };
  }

  const volcanoId = s.activeVolcano ?? "mount_st_helens";

  // Equipment analysis bonus
  let analysisBonus = 0;
  for (const eq of s.equipment) {
    if (eq.owned && eq.equipped) {
      const eqDef = VL_EQUIPMENT.find((d) => d.id === eq.equipmentId);
      if (eqDef) analysisBonus += eqDef.analysisBonus * 0.01 * eq.level;
    }
  }

  const baseQuality = 50 + station.level * 8 + Math.floor(analysisBonus * 100);
  const quality = clamp(baseQuality + Math.floor(Math.random() * 20), 0, 100);

  const results: Record<string, number> = {};

  switch (def.analysisType) {
    case "seismic":
      results["p_wave_velocity"] = Math.floor(5000 + Math.random() * 3000);
      results["s_wave_velocity"] = Math.floor(2800 + Math.random() * 1500);
      results["tremor_amplitude"] = Math.floor(quality * 0.5 + Math.random() * quality);
      results["event_count"] = Math.floor(1 + Math.random() * 10 * station.level);
      results["dominant_frequency"] = Math.floor(0.5 + Math.random() * 10);
      break;
    case "gas":
      results["so2_flux"] = Math.floor(50 + quality * 5 + Math.random() * 200);
      results["co2_flux"] = Math.floor(200 + quality * 10 + Math.random() * 800);
      results["h2s_concentration"] = Math.floor(quality * 0.3 + Math.random() * 20);
      results["hcl_flux"] = Math.floor(quality * 0.2 + Math.random() * 15);
      results["hf_concentration"] = Math.floor(quality * 0.05 + Math.random() * 5);
      results["temperature"] = Math.floor(200 + quality * 5 + Math.random() * 300);
      break;
    case "petrology":
      results["silica_content"] = Math.floor(40 + Math.random() * 35);
      results["magnesium_number"] = Math.floor(20 + quality * 0.4 + Math.random() * 40);
      results["crystal_content"] = Math.floor(quality * 0.3 + Math.random() * 30);
      results["vesicularity"] = Math.floor(quality * 0.2 + Math.random() * 50);
      results["phenocryst_size_mm"] = Math.floor(quality * 0.05 + Math.random() * 5);
      break;
    case "thermal":
      results["max_temperature_c"] = Math.floor(100 + quality * 10 + Math.random() * 500);
      results["thermal_anomaly_count"] = Math.floor(1 + Math.random() * station.level * 2);
      results["heat_flux_mw"] = Math.floor(quality * 2 + Math.random() * 100);
      results["ground_deformation_mm"] = Math.floor(quality * 0.1 + Math.random() * 20);
      break;
    case "geology":
      results["core_depth_m"] = Math.floor(50 + station.level * 50 + Math.random() * 100);
      results["rock_density"] = Math.floor(2400 + Math.random() * 800);
      results["porosity_pct"] = Math.floor(quality * 0.2 + Math.random() * 20);
      results["permeability_md"] = Math.floor(quality * 0.5 + Math.random() * 50);
      results["layer_count"] = Math.floor(2 + Math.random() * station.level * 2);
      break;
    case "mineralogy":
      results["crystal_size_mm"] = Math.floor(quality * 0.1 + Math.random() * 10);
      results["growth_rate_um_hr"] = Math.floor(quality * 0.5 + Math.random() * 20);
      results["nucleation_count"] = Math.floor(10 + quality + Math.random() * 100);
      results["purity_pct"] = quality;
      results["symmetry_score"] = Math.floor(quality * 0.8 + Math.random() * 20);
      break;
  }

  station.totalAnalyses += 1;
  station.lastAnalysisAt = Date.now();
  s.stats.totalAnalysesRun += 1;

  const xpGained = Math.floor(20 + quality * 0.5 + station.level * 10);
  const coinsGained = Math.floor(10 + quality * 0.3 + station.level * 5);
  s.coins += coinsGained;
  s.totalCoinsEarned += coinsGained;
  s.stats.coinsEarned += coinsGained;

  vlAddXP(xpGained);
  s.lastUpdated = Date.now();

  return { success: true, stationId, analysisType: def.analysisType, results, xpGained, coinsGained, quality };
}

// ---------------------------------------------------------------------------
// Equipment
// ---------------------------------------------------------------------------

export function vlGetEquipment(): Equipment[] {
  return ensureInit().equipment;
}

export function vlPurchaseEquipment(equipmentId: string): { success: boolean; cost: number } {
  const s = ensureInit();
  const eq = s.equipment.find((e) => e.equipmentId === equipmentId);
  if (!eq) return { success: false, cost: 0 };
  if (eq.owned) return { success: false, cost: 0 };

  const def = VL_EQUIPMENT.find((d) => d.id === equipmentId);
  if (!def) return { success: false, cost: 0 };

  const spent = vlSpendCoins(def.cost);
  if (!spent.success) return { success: false, cost: def.cost };

  eq.owned = true;
  eq.equipped = true;
  vlCheckAchievements();
  s.lastUpdated = Date.now();

  return { success: true, cost: def.cost };
}

export function vlEquipItem(equipmentId: string): void {
  const s = ensureInit();
  const eq = s.equipment.find((e) => e.equipmentId === equipmentId);
  if (!eq || !eq.owned) return;
  eq.equipped = !eq.equipped;
  s.lastUpdated = Date.now();
}

// ---------------------------------------------------------------------------
// Eruption Prediction
// ---------------------------------------------------------------------------

export function vlGetEruptionPhase(volcanoId: string): EruptionPhase {
  const s = ensureInit();
  const volcano = s.volcanoes.find((v) => v.id === volcanoId);
  return volcano?.currentPhase ?? "dormant";
}

export function vlPredictEruption(volcanoId: string): {
  success: boolean;
  prediction: EruptionPrediction;
  actualPhase: EruptionPhase;
  correct: boolean;
  xpGained: number;
  coinsGained: number;
} {
  const s = ensureInit();
  const volcano = s.volcanoes.find((v) => v.id === volcanoId);
  if (!volcano) {
    return {
      success: false,
      prediction: {
        id: "",
        volcanoId,
        predictedPhase: "dormant",
        actualPhase: "dormant",
        correct: null,
        predictedAt: 0,
        resolved: false,
      },
      actualPhase: "dormant",
      correct: false,
      xpGained: 0,
      coinsGained: 0,
    };
  }

  // Equipment bonus for prediction accuracy
  let predictionBonus = 0;
  for (const eq of s.equipment) {
    if (eq.owned && eq.equipped && eq.equipmentId === "seismic_sensor") {
      predictionBonus += eq.level * 5;
    }
  }

  // Station analysis bonus
  const seismoStation = s.researchStations.find((st) => st.stationId === "seismograph");
  if (seismoStation && seismoStation.level > 0) {
    predictionBonus += seismoStation.level * 8;
  }

  // Base accuracy: easier to predict dormant/erupting extremes, harder for transitions
  const currentPhase = volcano.currentPhase;
  const phaseAccuracy: Record<EruptionPhase, number> = {
    dormant: 60,
    unrest: 40,
    active: 35,
    erupting: 70,
    cooling: 45,
  };

  const accuracy = Math.min(95, phaseAccuracy[currentPhase] + predictionBonus + s.level * 0.5);

  // Determine what the player predicts vs actual
  const phases: EruptionPhase[] = ["dormant", "unrest", "active", "erupting", "cooling"];

  // Simulate a possible phase transition
  let actualPhase = currentPhase;
  const transitionRoll = Math.random() * 100;
  if (transitionRoll < 20) {
    // Phase transitions
    const phaseIdx = phases.indexOf(currentPhase);
    if (currentPhase === "dormant") actualPhase = "unrest";
    else if (currentPhase === "unrest") actualPhase = Math.random() < 0.5 ? "active" : "dormant";
    else if (currentPhase === "active") actualPhase = Math.random() < 0.6 ? "erupting" : "cooling";
    else if (currentPhase === "erupting") actualPhase = Math.random() < 0.7 ? "cooling" : "erupting";
    else if (currentPhase === "cooling") actualPhase = "dormant";
  }

  // Player prediction: correct if random roll under accuracy
  const correct = Math.random() * 100 < accuracy;
  const predictedPhase = correct ? actualPhase : pickRandom(phases.filter((p) => p !== actualPhase));

  const prediction: EruptionPrediction = {
    id: generateId(),
    volcanoId,
    predictedPhase,
    actualPhase,
    correct,
    predictedAt: Date.now(),
    resolved: true,
  };

  s.eruptionPredictions.push(prediction);
  s.stats.totalPredictions += 1;

  if (correct) s.stats.correctPredictions += 1;

  // Update volcano phase
  volcano.currentPhase = actualPhase;
  const phaseData = ERUPTION_PHASE_DATA[actualPhase];
  volcano.temperature = Math.floor(phaseData.temperatureRange[0] + Math.random() * (phaseData.temperatureRange[1] - phaseData.temperatureRange[0]));
  volcano.seismicActivity = Math.floor(phaseData.seismicRange[0] + Math.random() * (phaseData.seismicRange[1] - phaseData.seismicRange[0]));

  const xpGained = correct ? 50 + s.level * 2 : 10;
  const coinsGained = correct ? 75 + s.level * 3 : 5;

  s.coins += coinsGained;
  s.totalCoinsEarned += coinsGained;
  s.stats.coinsEarned += coinsGained;

  vlAddXP(xpGained);
  vlCheckAchievements();
  s.lastUpdated = Date.now();

  return { success: true, prediction, actualPhase, correct, xpGained, coinsGained };
}

// ---------------------------------------------------------------------------
// Earthquakes
// ---------------------------------------------------------------------------

export function vlGetEarthquakes(): Earthquake[] {
  return ensureInit().earthquakes;
}

export function vlRecordEarthquake(magnitude: number): { earthquake: Earthquake; xpGained: number } {
  const s = ensureInit();
  const clampedMag = clamp(magnitude, 0.1, 12.0);
  const { classification, feltBy } = classifyEarthquake(clampedMag);

  const volcanoId = s.activeVolcano ?? pickRandom(VL_VOLCANOES).id;

  const earthquake: Earthquake = {
    id: generateId(),
    volcanoId,
    magnitude: Math.round(clampedMag * 10) / 10,
    depth: Math.floor(1 + Math.random() * 30),
    timestamp: Date.now(),
    classification,
    feltByPopulation: feltBy,
  };

  s.earthquakes.push(earthquake);
  s.stats.totalEarthquakes += 1;

  // Update volcano seismic activity
  const volcano = s.volcanoes.find((v) => v.id === volcanoId);
  if (volcano) {
    volcano.seismicActivity = clamp(volcano.seismicActivity + clampedMag * 2, 0, 100);
  }

  const xpGained = Math.floor(clampedMag * 10 + Math.random() * 15);
  vlAddXP(xpGained);
  vlCheckAchievements();
  s.lastUpdated = Date.now();

  return { earthquake, xpGained };
}

// ---------------------------------------------------------------------------
// Gas Readings
// ---------------------------------------------------------------------------

export function vlGetGasReadings(): GasReading[] {
  return ensureInit().gasReadings;
}

export function vlTakeGasSample(): { reading: GasReading; xpGained: number; coinsGained: number } {
  const s = ensureInit();
  const volcanoId = s.activeVolcano ?? pickRandom(VL_VOLCANOES).id;

  const volcano = s.volcanoes.find((v) => v.id === volcanoId);
  const phaseMultiplier = volcano ? (ERUPTION_PHASE_DATA[volcano.currentPhase].temperatureRange[1] / 400) : 1;

  const so2 = Math.floor(50 + Math.random() * 450 * phaseMultiplier);
  const co2 = Math.floor(300 + Math.random() * 4700 * phaseMultiplier);
  const h2s = Math.floor(Math.random() * 50 * phaseMultiplier);
  const hcl = Math.floor(Math.random() * 100 * phaseMultiplier);
  const hf = Math.floor(Math.random() * 20 * phaseMultiplier);

  const alertLevel = classifyGasAlert(so2, co2, h2s, hcl, hf);

  const reading: GasReading = {
    id: generateId(),
    volcanoId,
    timestamp: Date.now(),
    so2,
    co2,
    h2s,
    hcl,
    hf,
    alertLevel,
  };

  s.gasReadings.push(reading);
  s.stats.totalGasSamples += 1;

  const xpGained = Math.floor(15 + (alertLevel === "extreme" ? 50 : alertLevel === "high" ? 25 : 0));
  const coinsGained = Math.floor(10 + alertLevel === "extreme" ? 40 : alertLevel === "high" ? 20 : 0);

  s.coins += coinsGained;
  s.totalCoinsEarned += coinsGained;
  s.stats.coinsEarned += coinsGained;

  vlAddXP(xpGained);
  vlCheckAchievements();
  s.lastUpdated = Date.now();

  return { reading, xpGained, coinsGained };
}

// ---------------------------------------------------------------------------
// Temperature Mapping
// ---------------------------------------------------------------------------

export function vlGetTemperatureMap(): TemperaturePoint[] {
  return ensureInit().temperatureMap;
}

export function vlScanTemperature(): { points: TemperaturePoint[]; xpGained: number; coinsGained: number } {
  const s = ensureInit();
  const volcanoId = s.activeVolcano ?? pickRandom(VL_VOLCANOES).id;
  const volcano = s.volcanoes.find((v) => v.id === volcanoId);

  const baseTemp = volcano?.temperature ?? 100;
  const gridSize = 8;
  const newPoints: TemperaturePoint[] = [];

  for (let i = 0; i < gridSize * gridSize; i++) {
    const x = i % gridSize;
    const y = Math.floor(i / gridSize);
    // Simulate a temperature gradient from center (hot) to edges (cool)
    const distFromCenter = Math.sqrt(Math.pow(x - gridSize / 2, 2) + Math.pow(y - gridSize / 2, 2));
    const maxDist = Math.sqrt(Math.pow(gridSize / 2, 2) + Math.pow(gridSize / 2, 2));
    const tempFactor = 1 - (distFromCenter / maxDist) * 0.7;
    const depth = Math.floor(distFromCenter * 20 + Math.random() * 30);
    const temperature = Math.floor(baseTemp * tempFactor + Math.random() * 50 - 25);

    const point: TemperaturePoint = {
      id: generateId(),
      x,
      y,
      temperature: Math.max(0, temperature),
      depth,
      volcanoId,
      timestamp: Date.now(),
    };
    newPoints.push(point);
  }

  // Keep temperature map manageable — replace older entries for same volcano
  s.temperatureMap = s.temperatureMap.filter((tp) => tp.volcanoId !== volcanoId);
  s.temperatureMap.push(...newPoints);

  // Limit total points
  if (s.temperatureMap.length > 500) {
    s.temperatureMap = s.temperatureMap.slice(-500);
  }

  s.stats.totalThermalScans += 1;

  const xpGained = 25 + s.level;
  const coinsGained = 15 + s.level;
  s.coins += coinsGained;
  s.totalCoinsEarned += coinsGained;
  s.stats.coinsEarned += coinsGained;

  vlAddXP(xpGained);
  vlCheckAchievements();
  s.lastUpdated = Date.now();

  return { points: newPoints, xpGained, coinsGained };
}

// ---------------------------------------------------------------------------
// Lava Flow Simulation
// ---------------------------------------------------------------------------

export function vlSimulateLavaFlow(
  volcanoId: string,
  steps: number
): { flow: { x: number; y: number; temp: number; direction: string }[]; xpGained: number } {
  const s = ensureInit();
  const volcano = s.volcanoes.find((v) => v.id === volcanoId);
  if (!volcano) return { flow: [], xpGained: 0 };

  const baseTemp = volcano.temperature;
  const flow: { x: number; y: number; temp: number; direction: string }[] = [];

  let x = 5;
  let y = 5;
  let temp = baseTemp;

  for (let step = 0; step < Math.min(steps, 50); step++) {
    const direction = pickRandom([...LAVA_FLOW_DIRECTIONS]);
    const dx = direction.includes("E") ? 1 : direction.includes("W") ? -1 : 0;
    const dy = direction.includes("S") ? 1 : direction.includes("N") ? -1 : 0;

    x = clamp(x + dx, 0, 10);
    y = clamp(y + dy, 0, 10);

    // Simulate elevation-based flow (flows downhill = temperature-dependent)
    const coolingRate = 0.95 - step * 0.005;
    temp = Math.max(50, Math.floor(temp * coolingRate + Math.random() * 20 - 10));

    flow.push({ x, y, temp, direction });
  }

  const xpGained = Math.floor(steps * 3);
  vlAddXP(xpGained);
  s.lastUpdated = Date.now();

  return { flow, xpGained };
}

// ---------------------------------------------------------------------------
// Publications
// ---------------------------------------------------------------------------

export function vlGetPublications(): Publication[] {
  return ensureInit().publications;
}

export function vlPublishResearch(topicId: string): { success: boolean; publication: Publication | null; xpGained: number; coinsGained: number } {
  const s = ensureInit();
  const topic = RESEARCH_TOPICS.find((t) => t.id === topicId);
  if (!topic) return { success: false, publication: null, xpGained: 0, coinsGained: 0 };
  if (s.level < topic.minLevel) return { success: false, publication: null, xpGained: 0, coinsGained: 0 };

  const volcanoId = s.activeVolcano ?? pickRandom(VL_VOLCANOES).id;

  // Quality based on level, station levels, and minerals collected
  const stationAvgLevel = s.researchStations.filter((st) => st.level > 0).reduce((sum, st) => sum + st.level, 0) / Math.max(1, s.researchStations.filter((st) => st.level > 0).length);
  const mineralBonus = s.stats.uniqueMineralsCollected * 0.5;
  const quality = clamp(Math.floor(30 + s.level * 0.8 + stationAvgLevel * 3 + mineralBonus + Math.random() * 20), 10, 100);

  const citations = Math.floor(quality * (0.5 + Math.random()) * 0.3);
  const xpReward = Math.floor(topic.baseXP * (quality / 50));
  const coinReward = Math.floor(topic.baseCoins * (quality / 50));

  const publication: Publication = {
    id: generateId(),
    title: `${topic.name}: A Case Study of ${VL_VOLCANOES.find((v) => v.id === volcanoId)?.name ?? "Unknown Volcano"}`,
    topicId,
    volcanoId,
    quality,
    citations,
    xpReward,
    coinReward,
    publishedAt: Date.now(),
  };

  s.publications.push(publication);
  s.stats.totalPublications += 1;
  s.stats.totalCitations += citations;

  s.coins += coinReward;
  s.totalCoinsEarned += coinReward;
  s.stats.coinsEarned += coinReward;

  vlAddXP(xpReward);
  vlCheckAchievements();
  s.lastUpdated = Date.now();

  return { success: true, publication, xpGained: xpReward, coinsGained: coinReward };
}

// ---------------------------------------------------------------------------
// Expeditions
// ---------------------------------------------------------------------------

export function vlStartExpedition(volcanoId: string, difficulty: number): {
  success: boolean;
  expedition: Expedition | null;
} {
  const s = ensureInit();
  const volcano = s.volcanoes.find((v) => v.id === volcanoId);
  if (!volcano) return { success: false, expedition: null };

  const diffEntry = EXPEDITION_DIFFICULTIES.find((d) => d.difficulty === difficulty);
  if (!diffEntry) return { success: false, expedition: null };

  // Cost to start
  const cost = diffEntry.baseCoins * difficulty;
  const spent = vlSpendCoins(cost);
  if (!spent.success) return { success: false, expedition: null };

  const expedition: Expedition = {
    id: generateId(),
    volcanoId,
    difficulty,
    riskLevel: diffEntry.riskLevel,
    completed: false,
    success: false,
    mineralsFound: [],
    xpReward: 0,
    coinReward: 0,
    startedAt: Date.now(),
    completedAt: null,
  };

  s.expeditions.push(expedition);
  s.lastUpdated = Date.now();

  return { success: true, expedition };
}

export function vlCompleteExpedition(expeditionId: string): {
  success: boolean;
  expedition: Expedition | null;
  xpGained: number;
  coinsGained: number;
  mineralsFound: Mineral[];
} {
  const s = ensureInit();
  const expedition = s.expeditions.find((e) => e.id === expeditionId);
  if (!expedition || expedition.completed) {
    return { success: false, expedition: expedition ?? null, xpGained: 0, coinsGained: 0, mineralsFound: [] };
  }

  const diffEntry = EXPEDITION_DIFFICULTIES.find((d) => d.difficulty === expedition.difficulty);
  if (!diffEntry) return { success: false, expedition, xpGained: 0, coinsGained: 0, mineralsFound: [] };

  // Success chance based on equipment, level, and difficulty
  let successChance = 50 + s.level * 1.5 - expedition.difficulty * 8;
  for (const eq of s.equipment) {
    if (eq.owned && eq.equipped) {
      const def = VL_EQUIPMENT.find((d) => d.id === eq.equipmentId);
      if (def) successChance += (def.heatResistance + def.collectionBonus) * eq.level * 0.2;
    }
  }
  successChance = clamp(successChance, 10, 95);

  const isSuccess = Math.random() * 100 < successChance;
  expedition.completed = true;
  expedition.success = isSuccess;
  expedition.completedAt = Date.now();

  const foundMinerals: Mineral[] = [];

  if (isSuccess) {
    // Find minerals from this volcano
    const volcanoMinerals = s.minerals.filter((m) => m.volcanoId === expedition.volcanoId);
    const numFinds = Math.floor(1 + Math.random() * expedition.difficulty);

    for (let i = 0; i < numFinds; i++) {
      const target = pickRandom(volcanoMinerals);
      const rarityChance: Record<MineralRarity, number> = {
        common: 0.6,
        rare: 0.25,
        epic: 0.10,
        legendary: 0.04,
        mythic: 0.01,
      };
      if (Math.random() < rarityChance[target.rarity]) {
        target.collected = true;
        target.collectedAt = Date.now();
        target.quantity += 1;
        target.purity = Math.max(target.purity, Math.floor(60 + Math.random() * 41));
        foundMinerals.push(target);
        expedition.mineralsFound.push(target.id);
      }
    }

    s.stats.totalMineralsCollected += foundMinerals.length;
    s.stats.uniqueMineralsCollected = s.minerals.filter((m) => m.collected).length;
  }

  const xpMultiplier = isSuccess ? 1.0 : 0.3;
  const coinMultiplier = isSuccess ? 1.0 : 0.2;
  const xpGained = Math.floor(diffEntry.baseXP * expedition.difficulty * xpMultiplier);
  const coinsGained = Math.floor(diffEntry.baseCoins * expedition.difficulty * coinMultiplier);

  expedition.xpReward = xpGained;
  expedition.coinReward = coinsGained;

  s.coins += coinsGained;
  s.totalCoinsEarned += coinsGained;
  s.stats.coinsEarned += coinsGained;

  s.stats.totalExpeditions += 1;
  if (isSuccess) s.stats.totalExpeditionsSuccess += 1;

  // Update exploration progress
  const volcano = s.volcanoes.find((v) => v.id === expedition.volcanoId);
  if (volcano) {
    volcano.explorationProgress = Math.min(100, volcano.explorationProgress + 10 * expedition.difficulty);
    s.stats.volcanoesFullyExplored = s.volcanoes.filter((v) => v.explorationProgress >= 100).length;
  }

  vlAddXP(xpGained);
  vlCheckAchievements();
  s.lastUpdated = Date.now();

  return { success: true, expedition, xpGained, coinsGained, mineralsFound: foundMinerals };
}

// ---------------------------------------------------------------------------
// Daily Seismic Event
// ---------------------------------------------------------------------------

export function vlGetDailySeismicEvent(): DailySeismic | null {
  const s = ensureInit();
  const today = dateKey();

  if (s.dailySeismicEvent && s.dailySeismicEvent.dateKey === today) {
    return s.dailySeismicEvent;
  }

  // Generate new daily event
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed = (seed * 31 + today.charCodeAt(i)) | 0;
  }
  seed = Math.abs(seed);
  const rng = seededRandom(seed);

  const volcano = pickRandom(VL_VOLCANOES);
  const phases: EruptionPhase[] = ["dormant", "unrest", "active", "erupting", "cooling"];
  const correctPrediction = phases[Math.floor(rng() * phases.length)];

  const descriptions: Record<EruptionPhase, string> = {
    dormant: "Seismic sensors show baseline activity with no anomalies detected.",
    unrest: "Increased tremor frequency detected. Gas emissions slightly elevated.",
    active: "Continuous harmonic tremor observed. Ground deformation accelerating.",
    erupting: "Explosive seismic signals recorded. Ash column reaching high altitude.",
    cooling: "Seismic activity decreasing. Tremor amplitude diminishing steadily.",
  };

  // Update streak
  if (s.lastActiveDate !== "") {
    const yesterday = new Date(Date.now() - 86400000);
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    if (s.lastActiveDate === yKey) {
      s.streak += 1;
    } else if (s.lastActiveDate !== today) {
      s.streak = 0;
    }
  }

  s.dailySeismicEvent = {
    dateKey: today,
    volcanoId: volcano.id,
    eventDescription: descriptions[correctPrediction],
    correctPrediction,
    userPrediction: null,
    completed: false,
    reward: 100 + Math.floor(rng() * 200),
    xpReward: 50 + Math.floor(rng() * 100),
  };

  s.lastUpdated = Date.now();
  return s.dailySeismicEvent;
}

export function vlCompleteDailyPrediction(prediction: string): { correct: boolean; reward: number; xpGained: number } {
  const s = ensureInit();
  const event = vlGetDailySeismicEvent();
  if (!event) return { correct: false, reward: 0, xpGained: 0 };
  if (event.completed) return { correct: false, reward: 0, xpGained: 0 };

  const validPhases: EruptionPhase[] = ["dormant", "unrest", "active", "erupting", "cooling"];
  if (!validPhases.includes(prediction as EruptionPhase)) {
    return { correct: false, reward: 0, xpGained: 0 };
  }

  event.userPrediction = prediction;
  event.completed = true;
  s.lastActiveDate = event.dateKey;

  const correct = prediction === event.correctPrediction;
  if (correct) {
    s.streak += 1;
    if (s.streak > s.bestStreak) s.bestStreak = s.streak;
  } else {
    s.streak = 0;
  }

  const reward = correct ? event.reward : Math.floor(event.reward * 0.1);
  const xpGained = correct ? event.xpReward : Math.floor(event.xpReward * 0.2);

  s.coins += reward;
  s.totalCoinsEarned += reward;
  s.stats.coinsEarned += reward;

  vlAddXP(xpGained);
  vlCheckAchievements();
  s.lastUpdated = Date.now();

  return { correct, reward, xpGained };
}

// ---------------------------------------------------------------------------
// Streaks
// ---------------------------------------------------------------------------

export function vlGetStreak(): number {
  return ensureInit().streak;
}

export function vlGetBestStreak(): number {
  return ensureInit().bestStreak;
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export function vlGetStats(): LabStats {
  return ensureInit().stats;
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

export function vlGetAchievements(): Achievement[] {
  return ensureInit().achievements;
}

export function vlCheckAchievements(): Achievement[] {
  const s = ensureInit();
  const newlyUnlocked: Achievement[] = [];
  const now = Date.now();

  const check = (id: string, condition: boolean) => {
    if (condition) {
      const ach = s.achievements.find((a) => a.id === id);
      if (ach && !ach.unlocked) {
        ach.unlocked = true;
        ach.unlockedAt = now;
        s.unlockedAchievements.push(id);
        s.coins += ach.reward.coins;
        s.totalCoinsEarned += ach.reward.coins;
        s.stats.coinsEarned += ach.reward.coins;
        vlAddXP(ach.reward.xp);
        newlyUnlocked.push(ach);
      }
    }
  };

  // First Descent — visit first volcano
  check("ach_first_descent", s.stats.volcanoesVisited >= 1);

  // Mineral Hunter — collect 10 total
  check("ach_mineral_hunter", s.stats.totalMineralsCollected >= 10);

  // Rock Collector — all rock types (simulated through mineral variety)
  const rockTypesCovered = new Set(VL_MINERALS.filter((m) => s.minerals.find((sm) => sm.id === m.id && sm.collected)).map((m) => {
    const v = VL_VOLCANOES.find((vv) => vv.id === m.volcanoId);
    return v?.primaryRock;
  }).filter(Boolean));
  check("ach_rock_collector", rockTypesCovered.size >= 6);

  // Eruption Predictor — 5 correct predictions
  check("ach_eruption_predictor", s.stats.correctPredictions >= 5);

  // Station Master — all stations level 5
  const allMaxed = s.researchStations.every((st) => {
    const def = VL_STATIONS.find((d) => d.id === st.stationId);
    return st.level >= (def?.maxLevel ?? 5);
  });
  check("ach_station_master", allMaxed);

  // Full Kit — all 8 equipment owned
  check("ach_full_kit", s.equipment.every((eq) => eq.owned));

  // Mythic Find — collect a mythic
  check("ach_mythic_find", s.minerals.some((m) => m.collected && m.rarity === "mythic"));

  // First Publication
  check("ach_first_publication", s.stats.totalPublications >= 1);

  // Seismologist — 25 earthquakes
  check("ach_seismologist", s.stats.totalEarthquakes >= 25);

  // Gas Expert — 15 gas samples
  check("ach_gas_expert", s.stats.totalGasSamples >= 15);

  // Expedition Leader — 5 expeditions
  check("ach_expedition_leader", s.stats.totalExpeditions >= 5);

  // Temperature Mapper — 10 thermal scans
  check("ach_temp_mapper", s.stats.totalThermalScans >= 10);

  // Streak Master — 7-day streak
  check("ach_streak_master", s.bestStreak >= 7);

  // Volcano Veteran — all 8 visited
  check("ach_volcano_veteran", s.stats.volcanoesVisited >= 8);

  // Senior Volcanologist — level 30
  check("ach_senior_volcanologist", s.level >= 30);

  if (newlyUnlocked.length > 0) {
    s.lastUpdated = now;
  }

  return newlyUnlocked;
}

export function vlGetUnlockedAchievements(): Achievement[] {
  const s = ensureInit();
  return s.achievements.filter((a) => a.unlocked);
}

export function vlIsAchievementUnlocked(id: string): boolean {
  const s = ensureInit();
  const ach = s.achievements.find((a) => a.id === id);
  return ach ? ach.unlocked : false;
}

// ---------------------------------------------------------------------------
// Hint System
// ---------------------------------------------------------------------------

const HINTS: string[] = [
  "Mount St. Helens has a rich history — the 1980 lateral blast created a hummocky debris avalanche deposit with unique mineral specimens.",
  "Kilauea produces 'Pele's Hair' — thin strands of volcanic glass formed when molten lava is stretched by wind.",
  "The 2010 Eyjafjallajökull eruption cost the global airline industry an estimated $5 billion in lost revenue.",
  "Mount Fuji last erupted in 1707 during the Edo period, covering Edo (Tokyo) with volcanic ash.",
  "Mount Vesuvius destroyed Pompeii and Herculaneum in 79 AD — the pyroclastic flow reached temperatures of 300°C.",
  "The 1883 Krakatoa eruption produced the loudest sound in recorded history at 180 decibels, heard 4,800 km away.",
  "Mauna Loa is the largest volcano on Earth by volume — it covers over half of the Big Island of Hawaii.",
  "The Thera eruption (~1600 BCE) may have inspired Plato's legend of the lost city of Atlantis.",
  "Upgrade your seismic sensor equipment to improve eruption prediction accuracy.",
  "The Gas Analyzer Lab is your most important tool for early eruption detection.",
  "Combine minerals of different rarities for a chance to create higher-tier alloys.",
  "Higher-level research stations produce better quality analysis results.",
  "Daily seismic predictions build your streak for bonus XP and coins.",
  "Thermal imaging reveals hidden volcanic activity beneath the surface.",
  "Mythic-tier minerals are extremely rare — equip the Lava Boat for best collection odds.",
  "Publishing research papers earns both XP and coins based on your station upgrades.",
  "The Core Drill Platform unlocks at level 12 and provides deep geological data.",
  "Crystal Growth Chamber at high levels can simulate deep magmatic conditions.",
  "Diamond-tipped drills dramatically increase your mineral collection bonus.",
  "Earthquakes near volcanoes are often precursors to eruptions — track them carefully.",
  "SO2 emissions spike dramatically before explosive eruptions — monitor gas readings closely.",
  "Expeditions are risk/reward — higher difficulty means better rewards but lower success chance.",
  "The Shield Generator provides the highest heat resistance of any equipment item.",
  "Basalt is the most common volcanic rock, forming the oceanic crust beneath the oceans.",
  "Obsidian fractures with conchoidal edges, making it ideal for sharp cutting tools.",
  "Pumice is so full of gas bubbles that it can float on water.",
  "Rhyolite has the highest silica content of any volcanic rock and produces the most explosive eruptions.",
  "Andesite is named after the Andes Mountains where it was first studied extensively.",
  "Granite forms deep underground and is only exposed by millions of years of erosion.",
];

let hintIndex = 0;

export function vlGetHint(): string {
  const hint = HINTS[hintIndex % HINTS.length];
  hintIndex += 1;
  return hint;
}

// ---------------------------------------------------------------------------
// Utility Getters
// ---------------------------------------------------------------------------

export function vlGetVolcanoById(id: string): Volcano | null {
  const s = ensureInit();
  return s.volcanoes.find((v) => v.id === id) ?? null;
}

export function vlGetMineralById(id: string): Mineral | null {
  const s = ensureInit();
  return s.minerals.find((m) => m.id === id) ?? null;
}

export function vlGetEruptionPhaseData(phase: EruptionPhase): {
  label: string;
  description: string;
  temperatureRange: [number, number];
  seismicRange: [number, number];
  color: string;
} {
  return ERUPTION_PHASE_DATA[phase];
}

export function vlGetEarthquakeScale(): {
  min: number;
  max: number;
  classification: string;
  description: string;
  feltBy: string;
}[] {
  return EARTHQUAKE_SCALE;
}

export function vlGetResearchTopics(): {
  id: string;
  name: string;
  field: string;
  baseXP: number;
  baseCoins: number;
  minLevel: number;
}[] {
  return RESEARCH_TOPICS;
}

export function vlGetLevelTitles(): { minLevel: number; maxLevel: number; title: string }[] {
  return LEVEL_TITLES;
}

export function vlGetRarityMultiplier(rarity: MineralRarity): number {
  return getRarityMultiplier(rarity);
}

export function vlGetRarityColor(rarity: MineralRarity): string {
  return getRarityColor(rarity);
}

export function vlGetExpeditionDifficulties(): {
  difficulty: number;
  label: string;
  riskLevel: number;
  baseXP: number;
  baseCoins: number;
}[] {
  return EXPEDITION_DIFFICULTIES;
}

export function vlGetMineralCombinations(): MineralCombination[] {
  return ensureInit().mineralCombinations;
}

export function vlGetExpeditions(): Expedition[] {
  return ensureInit().expeditions;
}

export function vlGetActiveExpeditions(): Expedition[] {
  return ensureInit().expeditions.filter((e) => !e.completed);
}

export function vlGetCompletedExpeditions(): Expedition[] {
  return ensureInit().expeditions.filter((e) => e.completed);
}

export function vlGetMineralsByRarity(rarity: MineralRarity): Mineral[] {
  return ensureInit().minerals.filter((m) => m.rarity === rarity);
}

export function vlGetCollectedMineralsByRarity(rarity: MineralRarity): Mineral[] {
  return ensureInit().minerals.filter((m) => m.collected && m.rarity === rarity);
}

export function vlGetEquipmentDef(equipmentId: string): EquipmentDef | null {
  return VL_EQUIPMENT.find((d) => d.id === equipmentId) ?? null;
}

export function vlGetStationDef(stationId: string): StationDef | null {
  return VL_STATIONS.find((d) => d.id === stationId) ?? null;
}
