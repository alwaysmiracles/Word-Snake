// space-explorer-wire.ts — Space Explorer feature for Word Snake
// Pure TypeScript, SSR-safe. All exports use `se` prefix.

// ─── Types ───────────────────────────────────────────────────────────

type PlanetType = "Star" | "Rocky" | "Gas Giant" | "Ice Giant" | "Dwarf" | "Moon" | "Asteroid Belt";

interface PlanetFact {
  text: string;
  unlocked: boolean;
}

interface Planet {
  id: string;
  name: string;
  type: PlanetType;
  distanceFromSun: number;        // AU
  diameterKm: number;
  gravity: number;                // relative to Earth
  orbitalPeriodDays: number;
  knownMoons: number;
  color: string;
  emoji: string;
  description: string;
  facts: PlanetFact[];
}

interface ShipUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxLevel: number;
  effectPerLevel: string;
}

interface Spacecraft {
  fuel: number;
  maxFuel: number;
  shields: number;
  maxShields: number;
  cargoSlots: number;
  maxCargoSlots: number;
  sensorRange: number;
  fuelEfficiency: number;          // multiplier <1 = less fuel used
  warpDrive: boolean;
  upgrades: Record<string, number>; // upgradeId -> level
  cargo: string[];                 // discovery ids
}

type DiscoveryCategory =
  | "mineral"
  | "artifact"
  | "phenomenon"
  | "cosmic_event"
  | "alien_tech"
  | "fossil"
  | "signal"
  | "element";

interface Discovery {
  id: string;
  name: string;
  category: DiscoveryCategory;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  description: string;
  planetOrigin: string;            // planet id where it can be found
  unlocked: boolean;
  unlockedAt: number | null;       // timestamp
  emoji: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  unlocked: boolean;
  unlockedAt: number | null;
  progress: number;
  target: number;
  emoji: string;
}

type AlienEncounterType = "friendly" | "neutral" | "hostile";

interface AlienEncounter {
  type: AlienEncounterType;
  species: string;
  message: string;
  fuelChange: number;
  shieldChange: number;
  reward?: string;                 // discovery id
}

interface MissionLogEntry {
  id: string;
  timestamp: number;
  location: string;
  action: string;
  detail: string;
}

interface DailyMission {
  id: string;
  dateSeed: string;
  description: string;
  targetPlanet: string;
  requiredDiscoveries: number;
  reward: string;
  completed: boolean;
  completedAt: number | null;
}

interface TravelRoute {
  from: string;
  to: string;
  distance: number;
  fuelCost: number;
  duration: number;
}

interface StarMapNode {
  planetId: string;
  name: string;
  x: number;
  y: number;
  color: string;
  emoji: string;
  visited: boolean;
}

interface StatsGrid {
  planetsVisited: number;
  totalPlanets: number;
  discoveriesMade: number;
  totalDiscoveries: number;
  distanceTraveled: number;
  fuelUsed: number;
  currentLocation: string;
  shipUpgrades: number;
}

interface Overview {
  location: string;
  fuelPercent: number;
  shieldPercent: number;
  cargoUsed: number;
  cargoMax: number;
  planetsVisited: number;
  discoveriesCount: number;
  streak: number;
  dailyAvailable: boolean;
  recentLog: MissionLogEntry[];
}

// ─── Planet Data ──────────────────────────────────────────────────────

const SUN: Omit<Planet, "facts"> = {
  id: "sun",
  name: "The Sun",
  type: "Star",
  distanceFromSun: 0,
  diameterKm: 1392700,
  gravity: 27.94,
  orbitalPeriodDays: 0,
  knownMoons: 0,
  color: "#FDB813",
  emoji: "☀️",
  description: "The star at the center of our solar system, a nearly perfect sphere of hot plasma.",
};

const MERCURY: Omit<Planet, "facts"> = {
  id: "mercury",
  name: "Mercury",
  type: "Rocky",
  distanceFromSun: 0.39,
  diameterKm: 4879,
  gravity: 0.38,
  orbitalPeriodDays: 88,
  knownMoons: 0,
  color: "#8C7E6D",
  emoji: "☿️",
  description: "The smallest planet and closest to the Sun, with extreme temperature swings.",
};

const VENUS: Omit<Planet, "facts"> = {
  id: "venus",
  name: "Venus",
  type: "Rocky",
  distanceFromSun: 0.72,
  diameterKm: 12104,
  gravity: 0.9,
  orbitalPeriodDays: 225,
  knownMoons: 0,
  color: "#E8CDA0",
  emoji: "♀️",
  description: "The hottest planet with a thick toxic atmosphere and crushing surface pressure.",
};

const EARTH: Omit<Planet, "facts"> = {
  id: "earth",
  name: "Earth",
  type: "Rocky",
  distanceFromSun: 1.0,
  diameterKm: 12756,
  gravity: 1.0,
  orbitalPeriodDays: 365,
  knownMoons: 1,
  color: "#4A90D9",
  emoji: "🌍",
  description: "Our home planet, the only known world harboring life.",
};

const MARS: Omit<Planet, "facts"> = {
  id: "mars",
  name: "Mars",
  type: "Rocky",
  distanceFromSun: 1.52,
  diameterKm: 6792,
  gravity: 0.38,
  orbitalPeriodDays: 687,
  knownMoons: 2,
  color: "#C1440E",
  emoji: "🔴",
  description: "The Red Planet, with the largest volcano and canyon in the solar system.",
};

const ASTEROID_BELT: Omit<Planet, "facts"> = {
  id: "asteroid_belt",
  name: "Asteroid Belt",
  type: "Asteroid Belt",
  distanceFromSun: 2.7,
  diameterKm: 0,
  gravity: 0,
  orbitalPeriodDays: 0,
  knownMoons: 0,
  color: "#888888",
  emoji: "☄️",
  description: "A region of rocky debris between Mars and Jupiter, remnants of early solar system formation.",
};

const JUPITER: Omit<Planet, "facts"> = {
  id: "jupiter",
  name: "Jupiter",
  type: "Gas Giant",
  distanceFromSun: 5.2,
  diameterKm: 142984,
  gravity: 2.53,
  orbitalPeriodDays: 4333,
  knownMoons: 95,
  color: "#C88B3A",
  emoji: "🟤",
  description: "The largest planet, a gas giant with the iconic Great Red Spot storm.",
};

const SATURN: Omit<Planet, "facts"> = {
  id: "saturn",
  name: "Saturn",
  type: "Gas Giant",
  distanceFromSun: 9.54,
  diameterKm: 120536,
  gravity: 1.07,
  orbitalPeriodDays: 10759,
  knownMoons: 146,
  color: "#E8D191",
  emoji: "🪐",
  description: "Famous for its stunning ring system made of ice and rock particles.",
};

const URANUS: Omit<Planet, "facts"> = {
  id: "uranus",
  name: "Uranus",
  type: "Ice Giant",
  distanceFromSun: 19.2,
  diameterKm: 51118,
  gravity: 0.89,
  orbitalPeriodDays: 30687,
  knownMoons: 28,
  color: "#73C2D0",
  emoji: "🔵",
  description: "An ice giant that rotates on its side, with faint rings and blue-green color.",
};

const NEPTUNE: Omit<Planet, "facts"> = {
  id: "neptune",
  name: "Neptune",
  type: "Ice Giant",
  distanceFromSun: 30.06,
  diameterKm: 49528,
  gravity: 1.14,
  orbitalPeriodDays: 60190,
  knownMoons: 16,
  color: "#3F54BA",
  emoji: "🫧",
  description: "The windiest planet with supersonic storms and a deep blue atmosphere.",
};

const MOON: Omit<Planet, "facts"> = {
  id: "moon",
  name: "The Moon",
  type: "Moon",
  distanceFromSun: 1.0,
  diameterKm: 3475,
  gravity: 0.16,
  orbitalPeriodDays: 27,
  knownMoons: 0,
  color: "#C0C0C0",
  emoji: "🌙",
  description: "Earth's only natural satellite, the site of humanity's first steps beyond our world.",
};

const PLANET_TEMPLATES: readonly Omit<Planet, "facts">[] = [
  SUN, MERCURY, VENUS, EARTH, MOON, MARS, ASTEROID_BELT,
  JUPITER, SATURN, URANUS, NEPTUNE,
] as const;

const PLANET_FACTS: Record<string, string[]> = {
  sun: [
    "The Sun accounts for 99.86% of the total mass of the solar system.",
    "Light from the Sun takes about 8 minutes 20 seconds to reach Earth.",
    "The Sun's core temperature is approximately 15 million degrees Celsius.",
    "The Sun is roughly 4.6 billion years old.",
  ],
  mercury: [
    "Mercury has no atmosphere to retain heat, causing extreme temperature swings.",
    "A day on Mercury (sunrise to sunrise) lasts 176 Earth days.",
    "Mercury has a massive iron core making up about 75% of its radius.",
    "Mercury is shrinking as its iron core slowly cools and contracts.",
  ],
  venus: [
    "Venus rotates backwards compared to most planets (retrograde rotation).",
    "Surface temperatures on Venus average 462°C — hot enough to melt lead.",
    "A day on Venus is longer than its year.",
    "Venus's atmospheric pressure is 90 times greater than Earth's.",
  ],
  earth: [
    "Earth is the densest planet in the solar system.",
    "71% of Earth's surface is covered in water.",
    "Earth's magnetic field protects us from solar wind.",
    "Earth is the only planet not named after a Greek or Roman god.",
  ],
  moon: [
    "The Moon is slowly drifting away from Earth at about 3.8 cm per year.",
    "12 people have walked on the Moon, all during the Apollo program.",
    "The Moon has quakes called 'moonquakes' caused by Earth's gravity.",
    "The same side of the Moon always faces Earth (tidal locking).",
  ],
  mars: [
    "Olympus Mons on Mars is the tallest volcano in the solar system at 21.9 km.",
    "Valles Marineris is a canyon system stretching over 4,000 km long.",
    "Mars has seasons similar to Earth because of its axial tilt.",
    "Evidence suggests liquid water once flowed on Mars's surface.",
  ],
  asteroid_belt: [
    "The Asteroid Belt contains millions of objects, but total mass is less than Earth's Moon.",
    "Ceres, the largest object in the belt, is classified as a dwarf planet.",
    "The gaps in the asteroid belt are caused by Jupiter's gravitational influence.",
    "Most asteroids in the belt are between 1 km and 100 km in diameter.",
  ],
  jupiter: [
    "Jupiter's Great Red Spot is a storm larger than Earth, raging for centuries.",
    "Jupiter has the shortest day of any planet — about 10 hours.",
    "Jupiter's moon Europa may have a subsurface ocean harboring life.",
    "Jupiter acts as a cosmic vacuum cleaner, protecting inner planets from asteroids.",
  ],
  saturn: [
    "Saturn's rings span up to 282,000 km but are only about 10 meters thick.",
    "Saturn is the least dense planet — it would float in a giant bathtub.",
    "Saturn's moon Titan has lakes of liquid methane and ethane.",
    "Winds on Saturn can reach speeds of 1,800 km/h near its equator.",
  ],
  uranus: [
    "Uranus has a 98-degree axial tilt, essentially rolling around the Sun.",
    "Uranus was the first planet discovered with a telescope, by William Herschel in 1781.",
    "Uranus has 13 known rings, discovered in 1977.",
    "Temperatures on Uranus can drop to -224°C, the coldest of any planet.",
  ],
  neptune: [
    "Neptune has the strongest winds of any planet, reaching 2,100 km/h.",
    "Neptune's moon Triton orbits backwards, suggesting it was captured from the Kuiper Belt.",
    "Neptune was the first planet located through mathematical predictions.",
    "It takes Neptune 165 Earth years to orbit the Sun once.",
  ],
};

// ─── Discoveries (55 items) ──────────────────────────────────────────

const DISCOVERY_TEMPLATES: readonly Omit<Discovery, "unlocked" | "unlockedAt">[] = [
  // Minerals (14)
  { id: "d_helium3", name: "Helium-3 Deposit", category: "mineral", rarity: "common", description: "A rare isotope valuable for fusion reactors.", planetOrigin: "moon", emoji: "💎" },
  { id: "d_iron_meteorite", name: "Iron Meteorite Fragment", category: "mineral", rarity: "common", description: "A chunk of ancient iron from the asteroid belt.", planetOrigin: "asteroid_belt", emoji: "🪨" },
  { id: "d_mercury_ore", name: "Cinnabar Crystals", category: "mineral", rarity: "common", description: "Bright red mercury sulfide crystals from Mercury's surface.", planetOrigin: "mercury", emoji: "🔴" },
  { id: "d_venus_quartz", name: "Venusian Quartz", category: "mineral", rarity: "uncommon", description: "Quartz formed under Venus's extreme pressure.", planetOrigin: "venus", emoji: "💎" },
  { id: "d_mars_iron", name: "Hematite Spheres", category: "mineral", rarity: "common", description: "Blueberry-shaped iron oxide nodules found on Mars.", planetOrigin: "mars", emoji: "🔴" },
  { id: "d_regolith_sample", name: "Lunar Regolith", category: "mineral", rarity: "common", description: "Fine lunar soil perfect for construction material.", planetOrigin: "moon", emoji: "🌟" },
  { id: "d_jupiter_ammonia", name: "Ammonia Ice Crystal", category: "mineral", rarity: "uncommon", description: "Preserved ammonia ice from Jupiter's upper atmosphere.", planetOrigin: "jupiter", emoji: "🧊" },
  { id: "d_saturn_ring_ice", name: "Saturnian Ring Ice", category: "mineral", rarity: "rare", description: "Pristine ice particle from Saturn's beautiful rings.", planetOrigin: "saturn", emoji: "💎" },
  { id: "d_uranus_diamond", name: "Diamond Rain Shard", category: "mineral", rarity: "legendary", description: "A diamond believed to form in Uranus's extreme interior.", planetOrigin: "uranus", emoji: "💠" },
  { id: "d_neptune_ice", name: "Neptunian Methane Ice", category: "mineral", rarity: "rare", description: "Blue methane ice from Neptune's frigid clouds.", planetOrigin: "neptune", emoji: "🧊" },
  { id: "d_solar_flare_glass", name: "Solar Vitrigraph", category: "mineral", rarity: "legendary", description: "Glass forged by concentrated solar flare energy.", planetOrigin: "sun", emoji: "☀️" },
  { id: "d_mars_water_ice", name: "Subsurface Water Ice", category: "mineral", rarity: "uncommon", description: "Ancient water ice extracted from beneath Mars's surface.", planetOrigin: "mars", emoji: "🧊" },
  { id: "d_asteroid_platinum", name: "Platinum Asteroid Core", category: "mineral", rarity: "rare", description: "A platinum-rich core from a differentiated asteroid.", planetOrigin: "asteroid_belt", emoji: "💎" },
  { id: "d_titan_hydrocarbon", name: "Titan Hydrocarbon Sludge", category: "mineral", rarity: "uncommon", description: "Complex hydrocarbons from Titan's methane lakes.", planetOrigin: "saturn", emoji: "🫧" },

  // Alien Artifacts (10)
  { id: "a_mars_monolith", name: "Mars Monolith Shard", category: "artifact", rarity: "rare", description: "A geometric shard of unknown origin found in a Martian canyon.", planetOrigin: "mars", emoji: "🗿" },
  { id: "a_europa_signal", name: "Europa Subsurface Beacon", category: "artifact", rarity: "legendary", description: "A pulsing beacon detected beneath Europa's ice crust.", planetOrigin: "jupiter", emoji: "📡" },
  { id: "a_titan_probe", name: "Ancient Titan Probe", category: "artifact", rarity: "rare", description: "An ancient robotic probe of clearly non-human origin.", planetOrigin: "saturn", emoji: "🤖" },
  { id: "a_asteroid_beacon", name: "Asteroid Navigation Beacon", category: "artifact", rarity: "uncommon", description: "An alien navigational device mounted on an asteroid.", planetOrigin: "asteroid_belt", emoji: "📡" },
  { id: "a_mercury_mirror", name: "Mercury Heat Shield", category: "artifact", rarity: "rare", description: "An impossibly perfect mirror that reflects all radiation.", planetOrigin: "mercury", emoji: "🪞" },
  { id: "a_neptune_glyph", name: "Neptune Deep Glyph", category: "artifact", rarity: "legendary", description: "Symbols carved into Neptune's ice by unknown hands.", planetOrigin: "neptune", emoji: "🔮" },
  { id: "a_uranus_sphere", name: "Hovering Energy Sphere", category: "artifact", rarity: "legendary", description: "A self-sustaining sphere of energy that defies gravity.", planetOrigin: "uranus", emoji: "🔮" },
  { id: "a_moon_flag", name: "Non-Human Lunar Flag", category: "artifact", rarity: "rare", description: "A weathered flag on the Moon's far side — not from Earth.", planetOrigin: "moon", emoji: "🏴" },
  { id: "a_venus_bottle", name: "Venus Message Bottle", category: "artifact", rarity: "uncommon", description: "A heat-resistant bottle containing an alien message.", planetOrigin: "venus", emoji: "🍾" },
  { id: "a_sun_prism", name: "Solar Singularity Prism", category: "artifact", rarity: "legendary", description: "A device that can focus a star's energy into a single beam.", planetOrigin: "sun", emoji: "🔆" },

  // Space Phenomena (10)
  { id: "p_solar_prominence", name: "Solar Prominence Data", category: "phenomenon", rarity: "common", description: "Recorded data of a massive solar prominence eruption.", planetOrigin: "sun", emoji: "🌟" },
  { id: "p_mars_dust_devil", name: "Mars Dust Devil Log", category: "phenomenon", rarity: "common", description: "Measurements of a towering Martian dust devil.", planetOrigin: "mars", emoji: "🌪️" },
  { id: "p_jupiter_storm", name: "Great Red Spot Scan", category: "phenomenon", rarity: "uncommon", description: "Detailed scan of Jupiter's iconic centuries-old storm.", planetOrigin: "jupiter", emoji: "🌀" },
  { id: "p_saturn_aurora", name: "Saturn Infrared Aurora", category: "phenomenon", rarity: "rare", description: "Rare aurora observations on Saturn's poles.", planetOrigin: "saturn", emoji: "🌌" },
  { id: "p_neptune_dark_spot", name: "Neptune Dark Spot Photo", category: "phenomenon", rarity: "rare", description: "First close-up image of a Neptune dark storm vortex.", planetOrigin: "neptune", emoji: "🌑" },
  { id: "p_uranus_ring_ripple", name: "Uranus Ring Ripple Data", category: "phenomenon", rarity: "uncommon", description: "Seismic ripple data from Uranus's ring system.", planetOrigin: "uranus", emoji: "🌊" },
  { id: "p_mercury_transit", name: "Mercury Transit Record", category: "phenomenon", rarity: "common", description: "Precise timing data of Mercury transiting the Sun.", planetOrigin: "mercury", emoji: "🌑" },
  { id: "p_venus_lightning", name: "Venus Lightning Burst", category: "phenomenon", rarity: "uncommon", description: "Detected electromagnetic signature of Venusian lightning.", planetOrigin: "venus", emoji: "⚡" },
  { id: "p_asteroid_collision", name: "Asteroid Collision Remnants", category: "phenomenon", rarity: "uncommon", description: "Fresh debris from a recent asteroid collision.", planetOrigin: "asteroid_belt", emoji: "💥" },
  { id: "p_earth_aurora", name: "Earth Aurora Spectra", category: "phenomenon", rarity: "common", description: "Detailed spectral analysis of Earth's northern lights.", planetOrigin: "earth", emoji: "🌌" },

  // Cosmic Events (8)
  { id: "c_solar_flare_obs", name: "X-Class Solar Flare Observation", category: "cosmic_event", rarity: "rare", description: "Direct observation of the most powerful class of solar flare.", planetOrigin: "sun", emoji: "💥" },
  { id: "c_meteor_shower", name: "Perseid Meteor Shower Log", category: "cosmic_event", rarity: "common", description: "Detailed log of a brilliant meteor shower from near-Earth.", planetOrigin: "earth", emoji: "☄️" },
  { id: "c_comet_sighting", name: "Long-Period Comet Sighting", category: "cosmic_event", rarity: "uncommon", description: "First sighting of a comet making its closest solar approach.", planetOrigin: "neptune", emoji: "💫" },
  { id: "c_planetary_align", name: "Planetary Alignment Data", category: "cosmic_event", rarity: "legendary", description: "Precise measurements of a rare planetary alignment event.", planetOrigin: "jupiter", emoji: "🪐" },
  { id: "c_moon_eclipse", name: "Total Lunar Eclipse Scan", category: "cosmic_event", rarity: "common", description: "Atmospheric data collected during a total lunar eclipse.", planetOrigin: "moon", emoji: "🌑" },
  { id: "c_supernova_remnant", name: "Distant Supernova Remnant", category: "cosmic_event", rarity: "legendary", description: "Detected light from a supernova in a nearby galaxy.", planetOrigin: "neptune", emoji: "🌟" },
  { id: "c_jupiter_impact", name: "Jupiter Impact Flash", category: "cosmic_event", rarity: "rare", description: "Recorded an asteroid impact flash on Jupiter's surface.", planetOrigin: "jupiter", emoji: "💥" },
  { id: "c_kuiper_belt_object", name: "Kuiper Belt Object Discovery", category: "cosmic_event", rarity: "rare", description: "Discovered a new object at the edge of the solar system.", planetOrigin: "neptune", emoji: "🪨" },

  // Alien Tech (5)
  { id: "t_gravity_lens", name: "Alien Gravity Lens", category: "alien_tech", rarity: "legendary", description: "A device that can bend gravity in a localized field.", planetOrigin: "jupiter", emoji: "🔬" },
  { id: "t_ftl_chip", name: "Faster-Than-Light Chip", category: "alien_tech", rarity: "legendary", description: "An impossibly advanced microchip of unknown origin.", planetOrigin: "saturn", emoji: "💾" },
  { id: "t_force_field", name: "Portable Force Field Gen", category: "alien_tech", rarity: "rare", description: "A device projecting a protective energy barrier.", planetOrigin: "mars", emoji: "🛡️" },
  { id: "t_translation_device", name: "Universal Translator Core", category: "alien_tech", rarity: "legendary", description: "A neural interface capable of translating any language.", planetOrigin: "uranus", emoji: "📡" },
  { id: "t_cloaking_module", name: "Cloaking Module Fragment", category: "alien_tech", rarity: "rare", description: "A fragment of a device that can bend light around objects.", planetOrigin: "neptune", emoji: "🔮" },

  // Fossils & Signals (8)
  { id: "f_mars_microfossil", name: "Mars Microfossil", category: "fossil", rarity: "legendary", description: "Microscopic fossilized structures found in Martian rock.", planetOrigin: "mars", emoji: "🦴" },
  { id: "f_venus_acidophile", name: "Venus Cloud Fossil", category: "fossil", rarity: "rare", description: "Fossilized remains of acid-resistant microbes in Venus's clouds.", planetOrigin: "venus", emoji: "🦠" },
  { id: "f_europa_biofilm", name: "Europa Biofilm Trace", category: "fossil", rarity: "legendary", description: "Biological film traces from Europa's subsurface ocean.", planetOrigin: "jupiter", emoji: "🧫" },
  { id: "f_titan_prebiotic", name: "Titan Prebiotic Molecule", category: "fossil", rarity: "rare", description: "Complex prebiotic molecules found in Titan's atmosphere.", planetOrigin: "saturn", emoji: "🧬" },
  { id: "s_wow_repeated", name: "Repeated WOW! Signal", category: "signal", rarity: "legendary", description: "The famous WOW! signal detected again — from the same direction.", planetOrigin: "neptune", emoji: "📻" },
  { id: "s_fast_radio_burst", name: "Localized FRB Source", category: "signal", rarity: "rare", description: "Traced a fast radio burst to its origin within the solar system.", planetOrigin: "uranus", emoji: "📡" },
  { id: "s_moon_echo", name: "Lunar Echo Anomaly", category: "signal", rarity: "uncommon", description: "Strange repeating echoes detected bouncing off the Moon.", planetOrigin: "moon", emoji: "📻" },
  { id: "s_asteroid_transmit", name: "Asteroid Transmission", category: "signal", rarity: "uncommon", description: "A faint structured signal emanating from within an asteroid.", planetOrigin: "asteroid_belt", emoji: "📡" },
] as const;

// ─── Upgrades (5) ────────────────────────────────────────────────────

const UPGRADE_TEMPLATES: readonly ShipUpgrade[] = [
  {
    id: "better_engines",
    name: "Better Engines",
    description: "Improves fuel efficiency, reducing costs for every journey.",
    cost: 20,
    maxLevel: 5,
    effectPerLevel: "Fuel efficiency +10%",
  },
  {
    id: "shield_generator",
    name: "Shield Generator",
    description: "Increases maximum shield capacity for survival.",
    cost: 25,
    maxLevel: 5,
    effectPerLevel: "Max shields +20",
  },
  {
    id: "cargo_bay",
    name: "Cargo Bay Expansion",
    description: "Adds more cargo slots to carry discoveries.",
    cost: 15,
    maxLevel: 5,
    effectPerLevel: "Cargo slots +3",
  },
  {
    id: "sensors",
    name: "Advanced Sensors",
    description: "Increases sensor range to detect more discoveries.",
    cost: 20,
    maxLevel: 5,
    effectPerLevel: "Sensor range +10%",
  },
  {
    id: "warp_drive",
    name: "Warp Drive",
    description: "Enables instantaneous travel between any two planets.",
    cost: 50,
    maxLevel: 1,
    effectPerLevel: "Unlocks warp travel",
  },
] as const;

// ─── Achievements (15) ───────────────────────────────────────────────

const ACHIEVEMENT_TEMPLATES: readonly Omit<Achievement, "unlocked" | "unlockedAt" | "progress">[] = [
  { id: "ach_first_launch", name: "First Launch", description: "Leave Earth for the first time.", condition: "leave_earth", target: 1, emoji: "🚀" },
  { id: "ach_planet_hopper", name: "Planet Hopper", description: "Visit 5 different planets.", condition: "visit_planets", target: 5, emoji: "🪐" },
  { id: "ach_explorer", name: "Explorer", description: "Visit all planets in the solar system.", condition: "visit_all", target: 11, emoji: "🔭" },
  { id: "ach_fuel_manager", name: "Fuel Manager", description: "Refuel 10 times at space stations.", condition: "refuel_count", target: 10, emoji: "⛽" },
  { id: "ach_pack_rat", name: "Pack Rat", description: "Fill your cargo bay to capacity.", condition: "cargo_full", target: 1, emoji: "📦" },
  { id: "ach_rock_collector", name: "Rock Collector", description: "Collect 10 mineral discoveries.", condition: "collect_category", target: 10, emoji: "💎" },
  { id: "ach_ancient_seeker", name: "Ancient Seeker", description: "Find 5 alien artifacts.", condition: "collect_artifacts", target: 5, emoji: "🗿" },
  { id: "ach_cartographer", name: "Cartographer", description: "Discover 30 unique items.", condition: "total_discoveries", target: 30, emoji: "🗺️" },
  { id: "ach_upgraded", name: "Shipwright", description: "Purchase any spacecraft upgrade.", condition: "first_upgrade", target: 1, emoji: "🔧" },
  { id: "ach_fully_upgraded", name: "Maxed Out", description: "Max out all spacecraft upgrades.", condition: "max_upgrades", target: 25, emoji: "⭐" },
  { id: "ach_daily_3", name: "Dedicated Explorer", description: "Complete 3 daily missions.", condition: "daily_streak", target: 3, emoji: "📅" },
  { id: "ach_daily_7", name: "Weekly Voyager", description: "Maintain a 7-day daily streak.", condition: "daily_streak", target: 7, emoji: "🗓️" },
  { id: "ach_long_haul", name: "Long Haul", description: "Travel 50 AU total distance.", condition: "distance_traveled", target: 50, emoji: "✈️" },
  { id: "ach_legendary_find", name: "Legendary Find", description: "Discover a legendary item.", condition: "legendary_found", target: 1, emoji: "🌟" },
  { id: "ach_survivor", name: "Survivor", description: "Survive 3 hostile alien encounters.", condition: "hostile_survived", target: 3, emoji: "🛡️" },
] as const;

// ─── Alien Encounter Data ────────────────────────────────────────────

const FRIENDLY_ENCOUNTERS: AlienEncounter[] = [
  { type: "friendly", species: "Lunari", message: "The Lunari welcome you! Take this fuel as a gift.", fuelChange: 20, shieldChange: 0 },
  { type: "friendly", species: "Celestials", message: "The Celestials offer safe passage through this sector.", fuelChange: 10, shieldChange: 10 },
  { type: "friendly", species: "Nebulans", message: "Nebulan traders share their supplies.", fuelChange: 15, shieldChange: 5 },
  { type: "friendly", species: "Void Walkers", message: "Void Walkers sensed your approach and left fuel caches.", fuelChange: 25, shieldChange: 0 },
];

const NEUTRAL_ENCOUNTERS: AlienEncounter[] = [
  { type: "neutral", species: "Drifters", message: "The Drifters observe you silently, then move on.", fuelChange: 0, shieldChange: 0 },
  { type: "neutral", species: "Comet Riders", message: "Comet Riders zip past — they seem amused by your ship.", fuelChange: 5, shieldChange: 0 },
  { type: "neutral", species: "Echoes", message: "The Echoes transmit a burst of static... then silence.", fuelChange: 0, shieldChange: -5 },
  { type: "neutral", species: "Data Sprites", message: "Tiny Data Sprites swarm your ship, curious about your sensors.", fuelChange: 0, shieldChange: 0, reward: "d_asteroid_platinum" },
];

const HOSTILE_ENCOUNTERS: AlienEncounter[] = [
  { type: "hostile", species: "Void Pirates", message: "Void Pirates open fire! Your shields take a hit.", fuelChange: -10, shieldChange: -15 },
  { type: "hostile", species: "Plasma Wraiths", message: "Plasma Wraiths drain energy from your systems!", fuelChange: -15, shieldChange: -10 },
  { type: "hostile", species: "Dark Corsairs", message: "Dark Corsairs demand tribute! You lose supplies.", fuelChange: -20, shieldChange: -20 },
];

// ─── PRNG ────────────────────────────────────────────────────────────

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = h ^ (h << 13);
    h = h ^ (h >> 17);
    h = h ^ (h << 5);
    return (h >>> 0) / 4294967296;
  };
}

// ─── Internal Helpers ────────────────────────────────────────────────

function clamp(min: number, max: number, val: number): number {
  return Math.max(min, Math.min(max, val));
}

function getTodaySeed(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function buildPlanets(): Planet[] {
  return PLANET_TEMPLATES.map((tpl) => ({
    ...tpl,
    facts: (PLANET_FACTS[tpl.id] ?? ["No data available."]).map((text) => ({
      text,
      unlocked: false,
    })),
  }));
}

function buildDiscoveries(): Discovery[] {
  return DISCOVERY_TEMPLATES.map((tpl) => ({
    ...tpl,
    unlocked: false,
    unlockedAt: null,
  }));
}

function buildAchievements(): Achievement[] {
  return ACHIEVEMENT_TEMPLATES.map((tpl) => ({
    ...tpl,
    unlocked: false,
    unlockedAt: null,
    progress: 0,
  }));
}

function createDefaultSpacecraft(): Spacecraft {
  return {
    fuel: 100,
    maxFuel: 100,
    shields: 50,
    maxShields: 50,
    cargoSlots: 5,
    maxCargoSlots: 5,
    sensorRange: 1.0,
    fuelEfficiency: 1.0,
    warpDrive: false,
    upgrades: {
      better_engines: 0,
      shield_generator: 0,
      cargo_bay: 0,
      sensors: 0,
      warp_drive: 0,
    },
    cargo: [],
  };
}

// ─── State ───────────────────────────────────────────────────────────

interface SeState {
  spacecraft: Spacecraft;
  currentLocation: string;
  visitedPlanets: string[];
  discoveries: Discovery[];
  achievements: Achievement[];
  planets: Planet[];
  missionLog: MissionLogEntry[];
  dailyCompletedDates: string[];
  dailyStreak: number;
  lastDailyDate: string | null;
  totalDistanceTraveled: number;
  totalFuelUsed: number;
  refuelCount: number;
  hostileEncountersSurvived: number;
  encounterRng: () => number;
}

let _state: SeState | null = null;

function createDefaultState(): SeState {
  const rng = seededRandom("explorer-" + Date.now());
  return {
    spacecraft: createDefaultSpacecraft(),
    currentLocation: "earth",
    visitedPlanets: ["earth"],
    discoveries: buildDiscoveries(),
    achievements: buildAchievements(),
    planets: buildPlanets(),
    missionLog: [],
    dailyCompletedDates: [],
    dailyStreak: 0,
    lastDailyDate: null,
    totalDistanceTraveled: 0,
    totalFuelUsed: 0,
    refuelCount: 0,
    hostileEncountersSurvived: 0,
    encounterRng: rng,
  };
}

function ensureInit(): void {
  if (_state === null) {
    _state = createDefaultState();
  }
}

// ─── State Exports ───────────────────────────────────────────────────

export function seInit(): SeState {
  _state = createDefaultState();
  return _state;
}

export function seGetState(): SeState {
  ensureInit();
  return _state!;
}

export function seResetState(): SeState {
  return seInit();
}

// ─── Navigation ──────────────────────────────────────────────────────

export function seTravelTo(planetId: string): {
  success: boolean;
  message: string;
  encounter?: AlienEncounter;
  fuelUsed: number;
} {
  ensureInit();
  const s = _state!;
  const ship = s.spacecraft;

  const route = seCalculateFuelCost(planetId);
  if (!route.canTravel) {
    return { success: false, message: route.reason, fuelUsed: 0 };
  }

  const fuelUsed = route.fuelCost;
  ship.fuel = Math.max(0, ship.fuel - fuelUsed);
  s.totalFuelUsed += fuelUsed;

  const prevLocation = s.currentLocation;
  s.currentLocation = planetId;

  if (!s.visitedPlanets.includes(planetId)) {
    s.visitedPlanets.push(planetId);
  }

  const distance = route.distance;
  s.totalDistanceTraveled += distance;

  addLog("travel", `Traveled from ${prevLocation} to ${planetId}`, `Distance: ${distance.toFixed(2)} AU, Fuel used: ${fuelUsed.toFixed(1)}`);

  // Random alien encounter (30% chance)
  let encounter: AlienEncounter | undefined;
  if (s.encounterRng() < 0.3 && distance > 0.1) {
    encounter = generateEncounter();
    applyEncounter(encounter);
  }

  seCheckAchievements();

  return { success: true, message: `Arrived at ${planetId}!`, encounter, fuelUsed };
}

function generateEncounter(): AlienEncounter {
  ensureInit();
  const roll = _state!.encounterRng();
  let pool: AlienEncounter[];
  if (roll < 0.4) {
    pool = FRIENDLY_ENCOUNTERS;
  } else if (roll < 0.75) {
    pool = NEUTRAL_ENCOUNTERS;
  } else {
    pool = HOSTILE_ENCOUNTERS;
  }
  return pool[Math.floor(_state!.encounterRng() * pool.length)];
}

function applyEncounter(enc: AlienEncounter): void {
  ensureInit();
  const ship = _state!.spacecraft;
  ship.fuel = clamp(0, ship.maxFuel, ship.fuel + enc.fuelChange);
  ship.shields = clamp(0, ship.maxShields, ship.shields + enc.shieldChange);

  if (enc.type === "hostile" && ship.shields > 0) {
    _state!.hostileEncountersSurvived++;
  }

  if (enc.reward) {
    const disc = _state!.discoveries.find((d) => d.id === enc.reward);
    if (disc && !disc.unlocked) {
      disc.unlocked = true;
      disc.unlockedAt = Date.now();
      addLog("discovery", `Found ${disc.name} via ${enc.species} encounter`, disc.description);
    }
  }

  addLog("encounter", `Encountered ${enc.species} (${enc.type})`, enc.message);
}

export function seGetCurrentLocation(): Planet {
  ensureInit();
  return _state!.planets.find((p) => p.id === _state!.currentLocation) ?? _state!.planets[3]; // earth
}

export function seGetAvailableDestinations(): Planet[] {
  ensureInit();
  return _state!.planets.filter((p) => p.id !== _state!.currentLocation);
}

export function seCalculateFuelCost(planetId: string): {
  canTravel: boolean;
  fuelCost: number;
  distance: number;
  reason: string;
} {
  ensureInit();
  const s = _state!;
  const from = s.planets.find((p) => p.id === s.currentLocation);
  const to = s.planets.find((p) => p.id === planetId);

  if (!to) {
    return { canTravel: false, fuelCost: 0, distance: 0, reason: "Unknown destination." };
  }
  if (!from) {
    return { canTravel: false, fuelCost: 0, distance: 0, reason: "Unknown current location." };
  }
  if (planetId === s.currentLocation) {
    return { canTravel: false, fuelCost: 0, distance: 0, reason: "You are already here." };
  }

  const distance = Math.abs(to.distanceFromSun - from.distanceFromSun);
  const baseCost = 3 + distance * 5;
  const cost = baseCost * s.spacecraft.fuelEfficiency;

  if (s.spacecraft.fuel < cost && !s.spacecraft.warpDrive) {
    return {
      canTravel: false,
      fuelCost: cost,
      distance,
      reason: `Not enough fuel! Need ${cost.toFixed(1)}, have ${s.spacecraft.fuel.toFixed(1)}.`,
    };
  }

  const actualCost = s.spacecraft.warpDrive ? 0 : cost;
  return { canTravel: true, fuelCost: actualCost, distance, reason: "Route available." };
}

// ─── Exploration ─────────────────────────────────────────────────────

export function seExplorePlanet(): {
  facts: string[];
  samples: string[];
  artifacts: string[];
  fuelCaches: number;
} {
  ensureInit();
  const s = _state!;
  const planet = s.planets.find((p) => p.id === s.currentLocation);
  if (!planet) return { facts: [], samples: [], artifacts: [], fuelCaches: 0 };

  const rng = seededRandom("explore-" + planet.id + "-" + Date.now());
  const facts: string[] = [];
  const samples: string[] = [];
  const artifacts: string[] = [];
  let fuelCaches = 0;

  // Unlock facts
  const lockedFacts = planet.facts.filter((f) => !f.unlocked);
  const factsToUnlock = Math.min(lockedFacts.length, 1 + Math.floor(rng() * 2));
  for (let i = 0; i < factsToUnlock; i++) {
    if (lockedFacts[i]) {
      lockedFacts[i].unlocked = true;
      facts.push(lockedFacts[i].text);
    }
  }

  // Discover items based on sensor range
  const sensorBonus = s.spacecraft.sensorRange;
  const discoveriesHere = s.discoveries.filter(
    (d) => d.planetOrigin === planet.id && !d.unlocked,
  );

  for (const disc of discoveriesHere) {
    let chance: number;
    switch (disc.rarity) {
      case "common": chance = 0.5 * sensorBonus; break;
      case "uncommon": chance = 0.3 * sensorBonus; break;
      case "rare": chance = 0.15 * sensorBonus; break;
      case "legendary": chance = 0.05 * sensorBonus; break;
      default: chance = 0.1;
    }

    if (rng() < chance) {
      disc.unlocked = true;
      disc.unlockedAt = Date.now();
      if (disc.category === "mineral" || disc.category === "fossil") {
        samples.push(disc.name);
        if (s.spacecraft.cargo.length < s.spacecraft.cargoSlots) {
          s.spacecraft.cargo.push(disc.id);
        }
      } else if (disc.category === "artifact" || disc.category === "alien_tech") {
        artifacts.push(disc.name);
        if (s.spacecraft.cargo.length < s.spacecraft.cargoSlots) {
          s.spacecraft.cargo.push(disc.id);
        }
      }
    }
  }

  // Fuel cache (20% chance)
  if (rng() < 0.2) {
    const fuelFound = 5 + Math.floor(rng() * 15);
    s.spacecraft.fuel = clamp(0, s.spacecraft.maxFuel, s.spacecraft.fuel + fuelFound);
    fuelCaches = fuelFound;
    addLog("fuel_cache", `Found fuel cache at ${planet.name}`, `+${fuelFound} fuel`);
  }

  addLog("explore", `Explored ${planet.name}`, `Found ${facts.length} facts, ${samples.length} samples, ${artifacts.length} artifacts`);
  seCheckAchievements();
  return { facts, samples, artifacts, fuelCaches };
}

export function seGetPlanetFacts(planetId?: string): PlanetFact[] {
  ensureInit();
  const pid = planetId ?? _state!.currentLocation;
  const planet = _state!.planets.find((p) => p.id === pid);
  return planet?.facts ?? [];
}

export function seCollectSample(): { success: boolean; message: string } {
  ensureInit();
  const s = _state!;
  const ship = s.spacecraft;

  if (ship.cargo.length >= ship.cargoSlots) {
    return { success: false, message: "Cargo bay is full! Upgrade to carry more." };
  }

  const discoveriesHere = s.discoveries.filter(
    (d) =>
      d.planetOrigin === s.currentLocation &&
      !d.unlocked &&
      (d.category === "mineral" || d.category === "fossil"),
  );

  if (discoveriesHere.length === 0) {
    return { success: false, message: "No new samples to collect here." };
  }

  const rng = seededRandom("sample-" + s.currentLocation + "-" + Date.now());
  const found = discoveriesHere[Math.floor(rng() * discoveriesHere.length)];
  found.unlocked = true;
  found.unlockedAt = Date.now();
  ship.cargo.push(found.id);

  addLog("collect", `Collected sample: ${found.name}`, found.description);
  seCheckAchievements();
  return { success: true, message: `Collected: ${found.name} (${found.rarity})` };
}

export function seFindArtifact(): { success: boolean; message: string } {
  ensureInit();
  const s = _state!;
  const ship = s.spacecraft;

  if (ship.cargo.length >= ship.cargoSlots) {
    return { success: false, message: "Cargo bay is full!" };
  }

  const artifactsHere = s.discoveries.filter(
    (d) =>
      d.planetOrigin === s.currentLocation &&
      !d.unlocked &&
      (d.category === "artifact" || d.category === "alien_tech"),
  );

  if (artifactsHere.length === 0) {
    return { success: false, message: "No new artifacts to find here." };
  }

  const rng = seededRandom("artifact-" + s.currentLocation + "-" + Date.now());
  const chance = 0.3 * ship.sensorRange;
  if (rng() > chance) {
    return { success: false, message: "Your sensors didn't detect anything this time." };
  }

  const found = artifactsHere[Math.floor(rng() * artifactsHere.length)];
  found.unlocked = true;
  found.unlockedAt = Date.now();
  ship.cargo.push(found.id);

  addLog("artifact", `Found artifact: ${found.name}`, found.description);
  seCheckAchievements();
  return { success: true, message: `Discovered: ${found.name} (${found.rarity})!` };
}

// ─── Spacecraft ──────────────────────────────────────────────────────

export function seGetSpacecraft(): Spacecraft {
  ensureInit();
  return _state!.spacecraft;
}

export function seUpgradeShip(upgradeId: string): { success: boolean; message: string } {
  ensureInit();
  const s = _state!;
  const ship = s.spacecraft;
  const template = UPGRADE_TEMPLATES.find((u) => u.id === upgradeId);

  if (!template) {
    return { success: false, message: "Unknown upgrade." };
  }

  const currentLevel = ship.upgrades[upgradeId] ?? 0;
  if (currentLevel >= template.maxLevel) {
    return { success: false, message: `${template.name} is already at max level!` };
  }

  const cost = template.cost * (currentLevel + 1);
  if (ship.fuel < cost) {
    return { success: false, message: `Need ${cost} fuel to upgrade ${template.name}.` };
  }

  ship.fuel -= cost;
  ship.upgrades[upgradeId] = currentLevel + 1;

  // Apply upgrade effects
  switch (upgradeId) {
    case "better_engines":
      ship.fuelEfficiency = Math.max(0.3, 1.0 - currentLevel * 0.1);
      break;
    case "shield_generator":
      ship.maxShields = 50 + (currentLevel + 1) * 20;
      ship.shields = ship.maxShields;
      break;
    case "cargo_bay":
      ship.maxCargoSlots = 5 + (currentLevel + 1) * 3;
      break;
    case "sensors":
      ship.sensorRange = 1.0 + (currentLevel + 1) * 0.1;
      break;
    case "warp_drive":
      ship.warpDrive = true;
      break;
  }

  addLog("upgrade", `Upgraded ${template.name} to level ${currentLevel + 1}`, template.effectPerLevel);
  seCheckAchievements();
  return { success: true, message: `${template.name} upgraded to level ${currentLevel + 1}!` };
}

export function seRefuel(): { fuelAdded: number; message: string } {
  ensureInit();
  const s = _state!;
  const ship = s.spacecraft;
  const needed = ship.maxFuel - ship.fuel;
  ship.fuel = ship.maxFuel;
  s.refuelCount++;

  addLog("refuel", "Refueled at space station", `+${needed.toFixed(1)} fuel`);
  seCheckAchievements();
  return { fuelAdded: needed, message: `Refueled +${needed.toFixed(1)} fuel! Tank is full.` };
}

export function seGetFuelLevel(): { current: number; max: number; percent: number } {
  ensureInit();
  const ship = _state!.spacecraft;
  return {
    current: ship.fuel,
    max: ship.maxFuel,
    percent: ship.maxFuel > 0 ? (ship.fuel / ship.maxFuel) * 100 : 0,
  };
}

export function seGetCargo(): Discovery[] {
  ensureInit();
  const s = _state!;
  return s.spacecraft.cargo
    .map((id) => s.discoveries.find((d) => d.id === id))
    .filter((d): d is Discovery => d !== undefined);
}

// ─── Discoveries ─────────────────────────────────────────────────────

export function seGetDiscoveries(): Discovery[] {
  ensureInit();
  return _state!.discoveries;
}

export function seGetDiscoveryById(id: string): Discovery | undefined {
  ensureInit();
  return _state!.discoveries.find((d) => d.id === id);
}

export function seGetUnlockedDiscoveries(): Discovery[] {
  ensureInit();
  return _state!.discoveries.filter((d) => d.unlocked);
}

// ─── Map ─────────────────────────────────────────────────────────────

export function seGetStarMap(): StarMapNode[] {
  ensureInit();
  const s = _state!;
  return s.planets.map((p, i) => {
    const angle = (i / s.planets.length) * Math.PI * 2 - Math.PI / 2;
    const radius = p.distanceFromSun > 0 ? 40 + p.distanceFromSun * 8 : 0;
    return {
      planetId: p.id,
      name: p.name,
      x: Math.round(Math.cos(angle) * radius + 300),
      y: Math.round(Math.sin(angle) * radius + 300),
      color: p.color,
      emoji: p.emoji,
      visited: s.visitedPlanets.includes(p.id),
    };
  });
}

export function seGetTravelRoute(planetId: string): TravelRoute | null {
  ensureInit();
  const s = _state!;
  const from = s.planets.find((p) => p.id === s.currentLocation);
  const to = s.planets.find((p) => p.id === planetId);
  if (!from || !to) return null;

  const distance = Math.abs(to.distanceFromSun - from.distanceFromSun);
  const fuelCost = (3 + distance * 5) * s.spacecraft.fuelEfficiency;
  const baseDuration = distance * 2;
  const engineBonus = s.spacecraft.fuelEfficiency < 1 ? baseDuration * s.spacecraft.fuelEfficiency : baseDuration;

  return {
    from: s.currentLocation,
    to: planetId,
    distance,
    fuelCost,
    duration: Math.round(engineDuration(baseDuration, s)),
  };
}

function engineDuration(base: number, s: SeState): number {
  const engineLevel = s.spacecraft.upgrades.better_engines ?? 0;
  return Math.max(1, base * (1 - engineLevel * 0.08));
}

export function seGetVisitedPlanets(): Planet[] {
  ensureInit();
  const s = _state!;
  return s.visitedPlanets
    .map((id) => s.planets.find((p) => p.id === id))
    .filter((p): p is Planet => p !== undefined);
}

// ─── Daily Mission ───────────────────────────────────────────────────

export function seGetDailyMission(): DailyMission {
  ensureInit();
  const s = _state!;
  const today = getTodaySeed();
  const rng = seededRandom("daily-" + today);
  const planetIndex = Math.floor(rng() * s.planets.length);
  const discoveries = Math.floor(rng() * 3) + 1;
  const reward = 10 + Math.floor(rng() * 20);

  const descriptions = [
    `Travel to ${s.planets[planetIndex].name} and make ${discoveries} discovery.`,
    `Survey ${s.planets[planetIndex].name}. Collect ${discoveries} item(s).`,
    `Navigate to ${s.planets[planetIndex].name} and explore ${discoveries} artifact(s).`,
    `Mission: reach ${s.planets[planetIndex].name} and find ${discoveries} new sample(s).`,
  ];

  return {
    id: "daily-" + today,
    dateSeed: today,
    description: descriptions[Math.floor(rng() * descriptions.length)],
    targetPlanet: s.planets[planetIndex].id,
    requiredDiscoveries: discoveries,
    reward: `+${reward} fuel bonus`,
    completed: s.dailyCompletedDates.includes(today),
    completedAt: s.dailyCompletedDates.includes(today) ? Date.now() : null,
  };
}

export function seIsDailyCompleted(): boolean {
  ensureInit();
  return _state!.dailyCompletedDates.includes(getTodaySeed());
}

export function seGetDailyStreak(): number {
  ensureInit();
  return _state!.dailyStreak;
}

export function seCompleteDaily(): { success: boolean; message: string; fuelReward: number } {
  ensureInit();
  const s = _state!;
  const today = getTodaySeed();
  const mission = seGetDailyMission();

  if (s.dailyCompletedDates.includes(today)) {
    return { success: false, message: "Daily mission already completed today.", fuelReward: 0 };
  }

  const planetVisited = s.visitedPlanets.includes(mission.targetPlanet);
  const discoveriesHere = s.discoveries.filter(
    (d) => d.planetOrigin === mission.targetPlanet && d.unlocked,
  ).length;

  if (!planetVisited || discoveriesHere < mission.requiredDiscoveries) {
    const missing = [];
    if (!planetVisited) missing.push(`visit ${mission.targetPlanet}`);
    if (discoveriesHere < mission.requiredDiscoveries) {
      missing.push(`find ${mission.requiredDiscoveries - discoveriesHere} more discovery(ies)`);
    }
    return { success: false, message: `Requirements not met: ${missing.join(", ")}.`, fuelReward: 0 };
  }

  s.dailyCompletedDates.push(today);

  // Update streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdaySeed = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
  if (s.lastDailyDate === yesterdaySeed) {
    s.dailyStreak++;
  } else {
    s.dailyStreak = 1;
  }
  s.lastDailyDate = today;

  const fuelReward = 20 + s.dailyStreak * 5;
  s.spacecraft.fuel = clamp(0, s.spacecraft.maxFuel, s.spacecraft.fuel + fuelReward);

  addLog("daily", "Completed daily mission!", mission.description);
  seCheckAchievements();
  return { success: true, message: `Daily mission complete! Streak: ${s.dailyStreak}`, fuelReward };
}

// ─── Achievements ────────────────────────────────────────────────────

export function seGetAchievements(): Achievement[] {
  ensureInit();
  return _state!.achievements;
}

export function seCheckAchievements(): Achievement[] {
  ensureInit();
  const s = _state!;
  const newlyUnlocked: Achievement[] = [];

  const update = (id: string, progress: number) => {
    const ach = s.achievements.find((a) => a.id === id);
    if (!ach || ach.unlocked) return;
    ach.progress = Math.max(ach.progress, progress);
    if (ach.progress >= ach.target) {
      ach.unlocked = true;
      ach.unlockedAt = Date.now();
      newlyUnlocked.push(ach);
      addLog("achievement", `Achievement unlocked: ${ach.name}`, ach.description);
    }
  };

  // First Launch
  if (s.visitedPlanets.length > 1) update("ach_first_launch", 1);

  // Planet Hopper / Explorer
  update("ach_planet_hopper", s.visitedPlanets.length);
  update("ach_explorer", s.visitedPlanets.length);

  // Fuel Manager
  update("ach_fuel_manager", s.refuelCount);

  // Pack Rat
  update("ach_pack_rat", s.spacecraft.cargo.length >= s.spacecraft.cargoSlots ? 1 : 0);

  // Rock Collector
  const mineralCount = s.discoveries.filter((d) => d.unlocked && d.category === "mineral").length;
  update("ach_rock_collector", mineralCount);

  // Ancient Seeker
  const artifactCount = s.discoveries.filter(
    (d) => d.unlocked && (d.category === "artifact" || d.category === "alien_tech"),
  ).length;
  update("ach_ancient_seeker", artifactCount);

  // Cartographer
  const totalDisc = s.discoveries.filter((d) => d.unlocked).length;
  update("ach_cartographer", totalDisc);

  // Upgrades
  const totalUpgradeLevels = Object.values(s.spacecraft.upgrades).reduce((a, b) => a + b, 0);
  update("ach_upgraded", totalUpgradeLevels >= 1 ? 1 : 0);
  update("ach_fully_upgraded", totalUpgradeLevels);

  // Daily streak
  update("ach_daily_3", s.dailyStreak);
  update("ach_daily_7", s.dailyStreak);

  // Long haul
  update("ach_long_haul", Math.round(s.totalDistanceTraveled));

  // Legendary find
  const legendaryCount = s.discoveries.filter((d) => d.unlocked && d.rarity === "legendary").length;
  update("ach_legendary_find", legendaryCount);

  // Survivor
  update("ach_survivor", s.hostileEncountersSurvived);

  return newlyUnlocked;
}

// ─── Mission Log ─────────────────────────────────────────────────────

function addLog(action: string, location: string, detail: string): void {
  ensureInit();
  const s = _state!;
  s.missionLog.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    location,
    action,
    detail,
  });
  if (s.missionLog.length > 200) {
    s.missionLog.length = 200;
  }
}

export function seGetMissionLog(limit?: number): MissionLogEntry[] {
  ensureInit();
  if (limit !== undefined) return _state!.missionLog.slice(0, limit);
  return _state!.missionLog;
}

// ─── UI Helpers ──────────────────────────────────────────────────────

export function seGetOverview(): Overview {
  ensureInit();
  const s = _state!;
  const ship = s.spacecraft;
  const planet = s.planets.find((p) => p.id === s.currentLocation);
  return {
    location: planet?.name ?? "Unknown",
    fuelPercent: ship.maxFuel > 0 ? (ship.fuel / ship.maxFuel) * 100 : 0,
    shieldPercent: ship.maxShields > 0 ? (ship.shields / ship.maxShields) * 100 : 0,
    cargoUsed: ship.cargo.length,
    cargoMax: ship.cargoSlots,
    planetsVisited: s.visitedPlanets.length,
    discoveriesCount: s.discoveries.filter((d) => d.unlocked).length,
    streak: s.dailyStreak,
    dailyAvailable: !s.dailyCompletedDates.includes(getTodaySeed()),
    recentLog: s.missionLog.slice(0, 5),
  };
}

export function seGetStatsGrid(): StatsGrid {
  ensureInit();
  const s = _state!;
  const totalUpgradeLevels = Object.values(s.spacecraft.upgrades).reduce((a, b) => a + b, 0);
  const planet = s.planets.find((p) => p.id === s.currentLocation);
  return {
    planetsVisited: s.visitedPlanets.length,
    totalPlanets: s.planets.length,
    discoveriesMade: s.discoveries.filter((d) => d.unlocked).length,
    totalDiscoveries: s.discoveries.length,
    distanceTraveled: Math.round(s.totalDistanceTraveled * 100) / 100,
    fuelUsed: Math.round(s.totalFuelUsed * 100) / 100,
    currentLocation: planet?.name ?? "Unknown",
    shipUpgrades: totalUpgradeLevels,
  };
}

export function seGetPlanetCard(planetId: string): {
  id: string;
  name: string;
  type: PlanetType;
  emoji: string;
  color: string;
  description: string;
  distanceFromSun: number;
  gravity: number;
  diameterKm: number;
  knownMoons: number;
  visited: boolean;
  facts: string[];
  discoveryCount: number;
  undiscoveredCount: number;
} | null {
  ensureInit();
  const s = _state!;
  const planet = s.planets.find((p) => p.id === planetId);
  if (!planet) return null;

  const planetDiscoveries = s.discoveries.filter((d) => d.planetOrigin === planet.id);
  return {
    id: planet.id,
    name: planet.name,
    type: planet.type,
    emoji: planet.emoji,
    color: planet.color,
    description: planet.description,
    distanceFromSun: planet.distanceFromSun,
    gravity: planet.gravity,
    diameterKm: planet.diameterKm,
    knownMoons: planet.knownMoons,
    visited: s.visitedPlanets.includes(planet.id),
    facts: planet.facts.filter((f) => f.unlocked).map((f) => f.text),
    discoveryCount: planetDiscoveries.filter((d) => d.unlocked).length,
    undiscoveredCount: planetDiscoveries.filter((d) => !d.unlocked).length,
  };
}

export function seGetStarMapGrid(): {
  nodes: StarMapNode[];
  connections: { from: StarMapNode; to: StarMapNode }[];
  currentPlayer: StarMapNode | null;
} {
  ensureInit();
  const s = _state!;
  const nodes = seGetStarMap();
  const connections: { from: StarMapNode; to: StarMapNode }[] = [];

  for (let i = 0; i < nodes.length - 1; i++) {
    connections.push({ from: nodes[i], to: nodes[i + 1] });
  }

  return {
    nodes,
    connections,
    currentPlayer: nodes.find((n) => n.planetId === s.currentLocation) ?? null,
  };
}

export function seGetDiscoveryCard(discoveryId: string): {
  id: string;
  name: string;
  category: DiscoveryCategory;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  emoji: string;
  description: string;
  planetOrigin: string;
  unlocked: boolean;
  unlockedAt: string | null;
} | null {
  ensureInit();
  const d = _state!.discoveries.find((disc) => disc.id === discoveryId);
  if (!d) return null;
  return {
    id: d.id,
    name: d.name,
    category: d.category,
    rarity: d.rarity,
    emoji: d.emoji,
    description: d.description,
    planetOrigin: d.planetOrigin,
    unlocked: d.unlocked,
    unlockedAt: d.unlockedAt ? new Date(d.unlockedAt).toISOString() : null,
  };
}

export function seGetShipCard(): {
  fuel: { current: number; max: number; percent: number };
  shields: { current: number; max: number; percent: number };
  cargo: { used: number; max: number; items: Discovery[] };
  upgrades: { id: string; name: string; level: number; maxLevel: number; nextCost: number }[];
  capabilities: { sensorRange: number; fuelEfficiency: number; warpDrive: boolean };
} {
  ensureInit();
  const s = _state!;
  const ship = s.spacecraft;
  const fuelPct = ship.maxFuel > 0 ? (ship.fuel / ship.maxFuel) * 100 : 0;
  const shieldPct = ship.maxShields > 0 ? (ship.shields / ship.maxShields) * 100 : 0;

  const upgrades = UPGRADE_TEMPLATES.map((u) => ({
    id: u.id,
    name: u.name,
    level: ship.upgrades[u.id] ?? 0,
    maxLevel: u.maxLevel,
    nextCost: u.cost * ((ship.upgrades[u.id] ?? 0) + 1),
  }));

  const cargoItems = ship.cargo
    .map((id) => s.discoveries.find((d) => d.id === id))
    .filter((d): d is Discovery => d !== undefined);

  return {
    fuel: { current: Math.round(ship.fuel * 10) / 10, max: ship.maxFuel, percent: Math.round(fuelPct * 10) / 10 },
    shields: { current: Math.round(ship.shields * 10) / 10, max: ship.maxShields, percent: Math.round(shieldPct * 10) / 10 },
    cargo: { used: ship.cargo.length, max: ship.cargoSlots, items: cargoItems },
    upgrades,
    capabilities: {
      sensorRange: Math.round(ship.sensorRange * 100) / 100,
      fuelEfficiency: Math.round(ship.fuelEfficiency * 100) / 100,
      warpDrive: ship.warpDrive,
    },
  };
}

export function seGetAchievementGrid(): {
  achievements: {
    id: string;
    name: string;
    description: string;
    emoji: string;
    unlocked: boolean;
    unlockedAt: string | null;
    progress: number;
    target: number;
    percent: number;
  }[];
  totalUnlocked: number;
  totalAchievements: number;
} {
  ensureInit();
  const s = _state!;
  const achievements = s.achievements.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    emoji: a.emoji,
    unlocked: a.unlocked,
    unlockedAt: a.unlockedAt ? new Date(a.unlockedAt).toISOString() : null,
    progress: a.progress,
    target: a.target,
    percent: a.target > 0 ? Math.round((a.progress / a.target) * 100) : 0,
  }));

  return {
    achievements,
    totalUnlocked: achievements.filter((a) => a.unlocked).length,
    totalAchievements: achievements.length,
  };
}

export function seGetDailyCard(): {
  dailyMission: DailyMission;
  streak: number;
  isCompleted: boolean;
  streakRewards: { day: number; reward: string }[];
} {
  ensureInit();
  const mission = seGetDailyMission();
  const streak = _state!.dailyStreak;

  const streakRewards = [
    { day: 3, reward: "Scanner Boost" },
    { day: 7, reward: "Shield Recharge" },
    { day: 14, reward: "Rare Discovery Map" },
    { day: 30, reward: "Legendary Artifact Locator" },
  ];

  return {
    dailyMission: mission,
    streak,
    isCompleted: mission.completed,
    streakRewards,
  };
}

// ─── Planets list accessor ───────────────────────────────────────────

export function seGetAllPlanets(): Planet[] {
  ensureInit();
  return _state!.planets;
}

// ─── Upgrades accessor ───────────────────────────────────────────────

export function seGetAllUpgrades(): ShipUpgrade[] {
  return [...UPGRADE_TEMPLATES];
}
