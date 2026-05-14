import { useState, useMemo, useCallback } from 'react';

// ============================================================================
// SC_ CONSTANTS — Storm Chaser Data Tables
// ============================================================================

const SC_RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'] as const;
type ScRarity = (typeof SC_RARITIES)[number];

const SC_RARITY_COLORS: Record<ScRarity, string> = {
  Common: '#6B7280',
  Uncommon: '#3B82F6',
  Rare: '#8B5CF6',
  Epic: '#A855F7',
  Legendary: '#FBBF24',
};

const SC_RARITY_XP_MULTIPLIER: Record<ScRarity, number> = {
  Common: 1,
  Uncommon: 1.5,
  Rare: 2.5,
  Epic: 4,
  Legendary: 7,
};

const SC_RARITY_COIN_MULTIPLIER: Record<ScRarity, number> = {
  Common: 1,
  Uncommon: 2,
  Rare: 4,
  Epic: 8,
  Legendary: 15,
};

const SC_CATEGORIES = [
  'Wind',
  'Rain',
  'Lightning',
  'Ice',
  'Heat',
  'Dust',
  'Hybrid',
  'Extreme',
] as const;
type ScCategory = (typeof SC_CATEGORIES)[number];

// ============================================================================
// SC_STORMS — 35 storm types across 5 rarity tiers
// ============================================================================

interface StormDef {
  id: string;
  name: string;
  category: ScCategory;
  rarity: ScRarity;
  description: string;
  windSpeed: number;
  xpReward: number;
  coinReward: number;
  dangerLevel: number;
  icon: string;
}

const SC_STORMS: StormDef[] = [
  // Common (7)
  { id: 'thunderstorm', name: 'Thunderstorm', category: 'Rain', rarity: 'Common', description: 'A classic rain storm with lightning and thunder.', windSpeed: 60, xpReward: 10, coinReward: 5, dangerLevel: 2, icon: '⛈️' },
  { id: 'rain-shower', name: 'Rain Shower', category: 'Rain', rarity: 'Common', description: 'A gentle but widespread rain event.', windSpeed: 25, xpReward: 8, coinReward: 3, dangerLevel: 1, icon: '🌧️' },
  { id: 'gust-front', name: 'Gust Front', category: 'Wind', rarity: 'Common', description: 'A leading edge of cooler air with gusty winds.', windSpeed: 50, xpReward: 9, coinReward: 4, dangerLevel: 1, icon: '💨' },
  { id: 'fog-bank', name: 'Dense Fog Bank', category: 'Hybrid', rarity: 'Common', description: 'Thick fog reducing visibility to near zero.', windSpeed: 5, xpReward: 7, coinReward: 3, dangerLevel: 1, icon: '🌫️' },
  { id: 'dust-devil', name: 'Dust Devil', category: 'Dust', rarity: 'Common', description: 'A small rotating column of dust and debris.', windSpeed: 40, xpReward: 10, coinReward: 5, dangerLevel: 1, icon: '🌀' },
  { id: 'snow-squall', name: 'Snow Squall', category: 'Ice', rarity: 'Common', description: 'A sudden intense burst of heavy snow.', windSpeed: 35, xpReward: 9, coinReward: 4, dangerLevel: 2, icon: '🌨️' },
  { id: 'heat-shimmer', name: 'Heat Shimmer', category: 'Heat', rarity: 'Common', description: 'Blistering heat distorting the air above the ground.', windSpeed: 10, xpReward: 8, coinReward: 3, dangerLevel: 1, icon: '🔥' },
  // Uncommon (7)
  { id: 'supercell', name: 'Supercell', category: 'Extreme', rarity: 'Uncommon', description: 'A powerful rotating thunderstorm capable of producing tornadoes.', windSpeed: 120, xpReward: 25, coinReward: 15, dangerLevel: 5, icon: '🌪️' },
  { id: 'waterspout', name: 'Waterspout', category: 'Hybrid', rarity: 'Uncommon', description: 'A tornado over open water drawing spray upward.', windSpeed: 80, xpReward: 22, coinReward: 12, dangerLevel: 3, icon: '🌊' },
  { id: 'ice-storm', name: 'Ice Storm', category: 'Ice', rarity: 'Uncommon', description: 'Freezing rain coating everything in a layer of ice.', windSpeed: 30, xpReward: 20, coinReward: 10, dangerLevel: 4, icon: '🧊' },
  { id: 'haboob', name: 'Haboob', category: 'Dust', rarity: 'Uncommon', description: 'A massive wall of dust driven by thunderstorm outflow.', windSpeed: 100, xpReward: 24, coinReward: 14, dangerLevel: 4, icon: '🏜️' },
  { id: 'derecho', name: 'Derecho', category: 'Wind', rarity: 'Uncommon', description: 'A widespread long-lived wind storm associated with fast-moving storms.', windSpeed: 130, xpReward: 26, coinReward: 16, dangerLevel: 5, icon: '🌬️' },
  { id: 'hail-storm', name: 'Hail Storm', category: 'Ice', rarity: 'Uncommon', description: 'A severe thunderstorm producing large damaging hailstones.', windSpeed: 70, xpReward: 21, coinReward: 13, dangerLevel: 4, icon: '🧊' },
  { id: 'thunder-snow', name: 'Thundersnow', category: 'Hybrid', rarity: 'Uncommon', description: 'A rare winter thunderstorm with heavy snow and lightning.', windSpeed: 45, xpReward: 23, coinReward: 14, dangerLevel: 3, icon: '❄️' },
  // Rare (7)
  { id: 'hurricane', name: 'Hurricane', category: 'Extreme', rarity: 'Rare', description: 'A massive tropical cyclone with sustained winds over 74 mph.', windSpeed: 160, xpReward: 60, coinReward: 40, dangerLevel: 7, icon: '🌀' },
  { id: 'tornado-ef3', name: 'EF3 Tornado', category: 'Extreme', rarity: 'Rare', description: 'A strong tornado with winds 136-165 mph causing severe damage.', windSpeed: 150, xpReward: 55, coinReward: 35, dangerLevel: 7, icon: '🌪️' },
  { id: 'blizzard', name: 'Blizzard', category: 'Ice', rarity: 'Rare', description: 'A severe snowstorm with sustained winds over 35 mph and low visibility.', windSpeed: 80, xpReward: 50, coinReward: 30, dangerLevel: 6, icon: '🌨️' },
  { id: 'sandstorm', name: 'Sandstorm', category: 'Dust', rarity: 'Rare', description: 'A towering wall of sand engulfing everything in its path.', windSpeed: 110, xpReward: 52, coinReward: 32, dangerLevel: 6, icon: '🏜️' },
  { id: 'flash-flood', name: 'Flash Flood', category: 'Rain', rarity: 'Rare', description: 'Rapid flooding caused by intense rainfall over a short period.', windSpeed: 40, xpReward: 48, coinReward: 28, dangerLevel: 7, icon: '🌊' },
  { id: 'lightning-cluster', name: 'Lightning Cluster', category: 'Lightning', rarity: 'Rare', description: 'An intense concentration of hundreds of lightning strikes.', windSpeed: 55, xpReward: 53, coinReward: 33, dangerLevel: 6, icon: '⚡' },
  { id: 'arctic-blast', name: 'Arctic Blast', category: 'Ice', rarity: 'Rare', description: 'A sudden plunge of bitterly cold air from the polar region.', windSpeed: 65, xpReward: 49, coinReward: 29, dangerLevel: 5, icon: '🥶' },
  // Epic (7)
  { id: 'ef5-tornado', name: 'EF5 Tornado', category: 'Extreme', rarity: 'Epic', description: 'The most destructive tornado with winds over 200 mph wiping towns off the map.', windSpeed: 260, xpReward: 120, coinReward: 80, dangerLevel: 9, icon: '🌪️' },
  { id: 'category5-hurricane', name: 'Category 5 Hurricane', category: 'Extreme', rarity: 'Epic', description: 'A catastrophic hurricane with winds exceeding 157 mph.', windSpeed: 280, xpReward: 130, coinReward: 90, dangerLevel: 10, icon: '🌀' },
  { id: 'fire-whirl', name: 'Fire Whirl', category: 'Hybrid', rarity: 'Epic', description: 'A terrifying spinning column of flames spawned by wildfire heat.', windSpeed: 140, xpReward: 110, coinReward: 75, dangerLevel: 9, icon: '🔥' },
  { id: 'bomb-cyclone', name: 'Bomb Cyclone', category: 'Extreme', rarity: 'Epic', description: 'A rapidly intensifying storm with pressure dropping 24 mb in 24 hours.', windSpeed: 180, xpReward: 115, coinReward: 78, dangerLevel: 8, icon: '💥' },
  { id: 'volcanic-lightning', name: 'Volcanic Lightning', category: 'Lightning', rarity: 'Epic', description: 'Lightning generated within volcanic ash plumes during eruptions.', windSpeed: 90, xpReward: 125, coinReward: 85, dangerLevel: 9, icon: '🌋' },
  { id: 'polar-vortex-break', name: 'Polar Vortex Breakdown', category: 'Ice', rarity: 'Epic', description: 'A destabilization of the polar vortex sending extreme cold southward.', windSpeed: 100, xpReward: 118, coinReward: 82, dangerLevel: 8, icon: '❄️' },
  { id: 'bow-echo', name: 'Derecho Bow Echo', category: 'Wind', rarity: 'Epic', description: 'A massive bow-shaped line of severe thunderstorms producing derecho winds.', windSpeed: 200, xpReward: 122, coinReward: 84, dangerLevel: 8, icon: '🏹' },
  // Legendary (7)
  { id: 'super-outbreak', name: 'Super Outbreak', category: 'Extreme', rarity: 'Legendary', description: 'A historic event with dozens of tornadoes spawning simultaneously across multiple states.', windSpeed: 300, xpReward: 300, coinReward: 200, dangerLevel: 10, icon: '🌪️' },
  { id: 'mega-hurricane', name: 'Mega Hurricane', category: 'Extreme', rarity: 'Legendary', description: 'A hyper-cane of unimaginable scale with sustained winds exceeding 200 mph.', windSpeed: 320, xpReward: 350, coinReward: 250, dangerLevel: 10, icon: '🌀' },
  { id: 'solar-storm', name: 'Coronal Mass Eruption', category: 'Lightning', rarity: 'Legendary', description: 'A massive solar storm sending charged particles toward Earth, creating auroras worldwide.', windSpeed: 0, xpReward: 400, coinReward: 300, dangerLevel: 10, icon: '☀️' },
  { id: 'atmospheric-river', name: 'Pineapple Express', category: 'Rain', rarity: 'Legendary', description: 'An extreme atmospheric river carrying moisture from the tropics causing catastrophic flooding.', windSpeed: 70, xpReward: 280, coinReward: 180, dangerLevel: 9, icon: '🌊' },
  { id: 'ice-age-storm', name: 'Cryogenic Tempest', category: 'Ice', rarity: 'Legendary', description: 'An apocalyptic winter storm dropping temperatures to -80F with 100 mph winds.', windSpeed: 180, xpReward: 320, coinReward: 220, dangerLevel: 10, icon: '🧊' },
  { id: 'el-nino-fury', name: 'El Niño Fury', category: 'Hybrid', rarity: 'Legendary', description: 'The ultimate climate anomaly spawning simultaneous disasters across the globe.', windSpeed: 250, xpReward: 380, coinReward: 280, dangerLevel: 10, icon: '🌏' },
  { id: 'ball-lightning-swarm', name: 'Ball Lightning Swarm', category: 'Lightning', rarity: 'Legendary', description: 'An incredibly rare phenomenon of glowing orbs of plasma hovering and drifting through the air.', windSpeed: 20, xpReward: 500, coinReward: 400, dangerLevel: 10, icon: '🔮' },
];

const SC_STORM_MAP: Record<string, StormDef> = {};
SC_STORMS.forEach((s) => { SC_STORM_MAP[s.id] = s; });

// ============================================================================
// SC_ZONES — 8 chase zones
// ============================================================================

interface ZoneDef {
  id: string;
  name: string;
  description: string;
  stormFrequency: number;
  travelCost: number;
  unlockLevel: number;
  backgroundHex: string;
  icon: string;
  stormPool: string[];
}

const SC_ZONES: ZoneDef[] = [
  { id: 'great-plains', name: 'Great Plains', description: 'Vast open grasslands perfect for storm spotting.', stormFrequency: 1.2, travelCost: 0, unlockLevel: 1, backgroundHex: '#1E293B', icon: '🌾', stormPool: ['thunderstorm', 'supercell', 'gust-front', 'tornado-ef3', 'derecho', 'hail-storm'] },
  { id: 'tornado-alley', name: 'Tornado Alley', description: 'The legendary corridor where tornadoes are born.', stormFrequency: 1.5, travelCost: 50, unlockLevel: 3, backgroundHex: '#0F172A', icon: '🌪️', stormPool: ['supercell', 'tornado-ef3', 'ef5-tornado', 'super-outbreak', 'lightning-cluster', 'bow-echo'] },
  { id: 'gulf-coast', name: 'Gulf Coast', description: 'Warm waters fuel hurricanes and tropical storms.', stormFrequency: 1.3, travelCost: 80, unlockLevel: 5, backgroundHex: '#1E3A5F', icon: '🌊', stormPool: ['hurricane', 'waterspout', 'flash-flood', 'category5-hurricane', 'mega-hurricane', 'atmospheric-river'] },
  { id: 'mountain-ridge', name: 'Mountain Ridge', description: 'High altitude terrain creates unique orographic weather.', stormFrequency: 1.0, travelCost: 100, unlockLevel: 8, backgroundHex: '#1a1a2e', icon: '⛰️', stormPool: ['thunder-snow', 'blizzard', 'arctic-blast', 'ice-storm', 'snow-squall', 'polar-vortex-break'] },
  { id: 'ocean-basin', name: 'Ocean Basin', description: 'The deep ocean where hurricanes form and grow.', stormFrequency: 1.4, travelCost: 120, unlockLevel: 12, backgroundHex: '#0a1628', icon: '🚢', stormPool: ['hurricane', 'category5-hurricane', 'mega-hurricane', 'waterspout', 'atmospheric-river', 'derecho'] },
  { id: 'arctic-tundra', name: 'Arctic Tundra', description: 'Frozen wasteland with extreme cold-weather phenomena.', stormFrequency: 0.8, travelCost: 150, unlockLevel: 16, backgroundHex: '#0d1b2a', icon: '🥶', stormPool: ['blizzard', 'arctic-blast', 'ice-storm', 'polar-vortex-break', 'ice-age-storm', 'thunder-snow'] },
  { id: 'desert-valley', name: 'Desert Valley', description: 'Scorching heat breeds haboobs and dust storms.', stormFrequency: 0.9, travelCost: 130, unlockLevel: 20, backgroundHex: '#1a0f00', icon: '🏜️', stormPool: ['haboob', 'sandstorm', 'dust-devil', 'heat-shimmer', 'fire-whirl', 'lightning-cluster'] },
  { id: 'volcanic-island', name: 'Volcanic Island', description: 'A remote island where earth meets sky in violent fury.', stormFrequency: 1.6, travelCost: 200, unlockLevel: 25, backgroundHex: '#1a0a0a', icon: '🌋', stormPool: ['volcanic-lightning', 'fire-whirl', 'ball-lightning-swarm', 'solar-storm', 'el-nino-fury', 'mega-hurricane'] },
];

const SC_ZONE_MAP: Record<string, ZoneDef> = {};
SC_ZONES.forEach((z) => { SC_ZONE_MAP[z.id] = z; });

// ============================================================================
// SC_TOOLS — 30 weather instruments/tools
// ============================================================================

interface ToolDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  bonus: number;
  category: string;
  icon: string;
}

const SC_TOOLS: ToolDef[] = [
  { id: 'anemometer', name: 'Anemometer', description: 'Measures wind speed precisely.', cost: 50, bonus: 5, category: 'measurement', icon: '💨' },
  { id: 'barometer', name: 'Barometer', description: 'Tracks atmospheric pressure changes.', cost: 60, bonus: 5, category: 'measurement', icon: '🌡️' },
  { id: 'doppler-radar', name: 'Doppler Radar', description: 'Reveals storm structure and motion.', cost: 200, bonus: 15, category: 'detection', icon: '📡' },
  { id: 'weather-balloon', name: 'Weather Balloon', description: 'Captures upper-atmosphere data profiles.', cost: 80, bonus: 8, category: 'measurement', icon: '🎈' },
  { id: 'lightning-rod', name: 'Lightning Rod', description: 'Safely attracts and grounds lightning strikes.', cost: 120, bonus: 10, category: 'safety', icon: '⚡' },
  { id: 'rain-gauge', name: 'Rain Gauge', description: 'Collects and measures rainfall amounts.', cost: 30, bonus: 3, category: 'measurement', icon: '🌧️' },
  { id: 'hygrometer', name: 'Hygrometer', description: 'Measures relative humidity in the air.', cost: 40, bonus: 4, category: 'measurement', icon: '💧' },
  { id: 'thermometer', name: 'Thermometer', description: 'Records temperature for heat analysis.', cost: 35, bonus: 3, category: 'measurement', icon: '🌡️' },
  { id: 'weather-radio', name: 'Weather Radio', description: 'Receives emergency weather broadcasts.', cost: 45, bonus: 5, category: 'communication', icon: '📻' },
  { id: 'storm-spotter-app', name: 'Storm Spotter App', description: 'Crowdsourced real-time storm reports.', cost: 25, bonus: 3, category: 'communication', icon: '📱' },
  { id: 'disdrometer', name: 'Disdrometer', description: 'Measures raindrop size distribution.', cost: 90, bonus: 7, category: 'measurement', icon: '🔬' },
  { id: 'ceilometer', name: 'Ceilometer', description: 'Measures cloud ceiling height with lasers.', cost: 150, bonus: 12, category: 'detection', icon: '🔦' },
  { id: 'pyranometer', name: 'Pyranometer', description: 'Measures solar radiation intensity.', cost: 110, bonus: 9, category: 'measurement', icon: '☀️' },
  { id: 'laptop-station', name: 'Forecast Laptop', description: 'Runs weather models for prediction.', cost: 300, bonus: 20, category: 'analysis', icon: '💻' },
  { id: 'wind-vane', name: 'Wind Vane', description: 'Shows wind direction for storm approach.', cost: 40, bonus: 4, category: 'measurement', icon: '🧭' },
  { id: 'radiosonde', name: 'Radiosonde', description: 'Advanced atmospheric sounding instrument.', cost: 100, bonus: 8, category: 'measurement', icon: '📡' },
  { id: 'pressure-tendency', name: 'Micro-Barograph', description: 'Continuous pressure logging for trend analysis.', cost: 130, bonus: 10, category: 'measurement', icon: '📉' },
  { id: 'portable-tower', name: 'Portable Mesonet Tower', description: 'Mobile weather station with multiple sensors.', cost: 500, bonus: 30, category: 'detection', icon: '🗼' },
  { id: 'drone-recon', name: 'Reconnaissance Drone', description: 'Aerial storm penetration and photography.', cost: 400, bonus: 25, category: 'detection', icon: '🛸' },
  { id: 'lightning-detector', name: 'Lightning Detector', description: 'Detects electromagnetic pulses from lightning.', cost: 75, bonus: 7, category: 'detection', icon: '⚡' },
  { id: 'spectrometer', name: 'Atmospheric Spectrometer', description: 'Analyzes composition of storm gases.', cost: 180, bonus: 14, category: 'analysis', icon: '🌈' },
  { id: 'photo-station', name: 'Photography Rig', description: 'High-speed camera for lightning capture.', cost: 250, bonus: 18, category: 'documentation', icon: '📸' },
  { id: 'gps-tracker', name: 'GPS Tracker', description: 'Precise storm position tracking.', cost: 55, bonus: 5, category: 'navigation', icon: '📍' },
  { id: 'satellite-feed', name: 'Satellite Feed', description: 'Real-time satellite imagery access.', cost: 350, bonus: 22, category: 'detection', icon: '🛰️' },
  { id: 'field-journal', name: 'Field Journal', description: 'Records observations for documentation.', cost: 15, bonus: 2, category: 'documentation', icon: '📓' },
  { id: 'walkie-talkie', name: 'Walkie-Talkie Set', description: 'Team communication in the field.', cost: 35, bonus: 3, category: 'communication', icon: '📻' },
  { id: 'portable-shelter', name: 'Deployable Shelter', description: 'Emergency protection from extreme conditions.', cost: 200, bonus: 15, category: 'safety', icon: '⛺' },
  { id: 'first-aid-kit', name: 'Weather First Aid Kit', description: 'Medical supplies for weather injuries.', cost: 50, bonus: 5, category: 'safety', icon: '🩹' },
  { id: 'power-inverter', name: 'Power Inverter', description: 'Powers equipment from vehicle battery.', cost: 70, bonus: 6, category: 'utility', icon: '🔋' },
  { id: 'data-logger', name: 'Multi-Channel Data Logger', description: 'Records data from multiple instruments simultaneously.', cost: 160, bonus: 12, category: 'analysis', icon: '💾' },
];

const SC_TOOL_MAP: Record<string, ToolDef> = {};
SC_TOOLS.forEach((t) => { SC_TOOL_MAP[t.id] = t; });

// ============================================================================
// SC_VEHICLES — 25 vehicle upgrades
// ============================================================================

interface VehicleDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  armorBonus: number;
  speedBonus: number;
  sensorBonus: number;
  tier: number;
  icon: string;
}

const SC_VEHICLES: VehicleDef[] = [
  { id: 'all-terrain-tires', name: 'All-Terrain Tires', description: 'Grip through mud, gravel, and ice.', cost: 100, armorBonus: 1, speedBonus: 2, sensorBonus: 0, tier: 1, icon: '🛞' },
  { id: 'reinforced-bumper', name: 'Reinforced Bumper', description: 'Absorbs debris impacts during chases.', cost: 150, armorBonus: 3, speedBonus: 0, sensorBonus: 0, tier: 1, icon: '🛡️' },
  { id: 'roof-rack', name: 'Equipment Roof Rack', description: 'Mount additional instruments on the roof.', cost: 80, armorBonus: 0, speedBonus: 0, sensorBonus: 2, tier: 1, icon: '📦' },
  { id: 'led-light-bar', name: 'LED Light Bar', description: 'Pierces through rain, fog, and darkness.', cost: 120, armorBonus: 0, speedBonus: 1, sensorBonus: 3, tier: 1, icon: '💡' },
  { id: 'armor-plating', name: 'Steel Armor Plating', description: 'Heavy plating for hail and debris protection.', cost: 300, armorBonus: 8, speedBonus: -2, sensorBonus: 0, tier: 2, icon: '🛡️' },
  { id: 'turbo-charger', name: 'Turbo Engine', description: 'Race ahead of storms for optimal positioning.', cost: 250, armorBonus: 0, speedBonus: 5, sensorBonus: 0, tier: 2, icon: '🏎️' },
  { id: 'radar-dish', name: 'Mobile Radar Dish', description: 'Doppler radar mounted directly on your vehicle.', cost: 400, armorBonus: 0, speedBonus: 0, sensorBonus: 8, tier: 2, icon: '📡' },
  { id: 'gps-nav-system', name: 'GPS Navigation', description: 'Real-time route optimization around storm cells.', cost: 180, armorBonus: 0, speedBonus: 3, sensorBonus: 2, tier: 2, icon: '🗺️' },
  { id: 'intercom-system', name: 'Intercom System', description: 'Coordinate with your chase team efficiently.', cost: 90, armorBonus: 0, speedBonus: 0, sensorBonus: 3, tier: 2, icon: '🎙️' },
  { id: 'kevlar-windows', name: 'Kevlar Windows', description: 'Shatterproof glass for flying debris.', cost: 350, armorBonus: 5, speedBonus: 0, sensorBonus: 0, tier: 2, icon: '🪟' },
  { id: 'tornado-intercept', name: 'TIV Intercept Vehicle', description: 'Purpose-built tornado intercept vehicle with probes.', cost: 800, armorBonus: 12, speedBonus: 4, sensorBonus: 5, tier: 3, icon: '🚐' },
  { id: 'drone-fleet', name: 'Drone Fleet', description: 'Deploy scouting drones for multi-angle observation.', cost: 600, armorBonus: 0, speedBonus: 0, sensorBonus: 10, tier: 3, icon: '🛸' },
  { id: 'mobile-lab', name: 'Mobile Weather Lab', description: 'Full laboratory suite built into an RV.', cost: 700, armorBonus: 6, speedBonus: -1, sensorBonus: 12, tier: 3, icon: '🔬' },
  { id: 'hydrophobic-coat', name: 'Hydrophobic Coating', description: 'Water-repellent coating improves visibility in rain.', cost: 200, armorBonus: 2, speedBonus: 2, sensorBonus: 4, tier: 3, icon: '💧' },
  { id: 'winch-system', name: 'Heavy-Duty Winch', description: 'Rescue yourself from floodwaters and mud.', cost: 280, armorBonus: 3, speedBonus: 0, sensorBonus: 0, tier: 3, icon: '⛓️' },
  { id: 'storm-shield-gen', name: 'EMP Shield Generator', description: 'Protects electronics from lightning EMPs.', cost: 500, armorBonus: 4, speedBonus: 0, sensorBonus: 3, tier: 3, icon: '⚡' },
  { id: 'air-intake-filter', name: 'Sand/Dust Air Filter', description: 'Engine protection in haboobs and dust storms.', cost: 160, armorBonus: 2, speedBonus: 1, sensorBonus: 0, tier: 3, icon: '🔧' },
  { id: 'solar-panels', name: 'Solar Panel Array', description: 'Generate power off-grid for long chases.', cost: 350, armorBonus: 0, speedBonus: 0, sensorBonus: 2, tier: 4, icon: '☀️' },
  { id: 'satellite-uplink', name: 'Satellite Uplink', description: 'Direct satellite communication anywhere on Earth.', cost: 900, armorBonus: 0, speedBonus: 2, sensorBonus: 15, tier: 4, icon: '🛰️' },
  { id: 'hovercraft-kit', name: 'Hovercraft Conversion', description: 'Float over floodwaters and rough terrain.', cost: 1000, armorBonus: 3, speedBonus: 8, sensorBonus: 5, tier: 4, icon: '🚤' },
  { id: 'armored-cabin', name: 'Ballistic Cabin', description: 'Military-grade protection for extreme intercepts.', cost: 1200, armorBonus: 20, speedBonus: -3, sensorBonus: 2, tier: 4, icon: '🏰' },
  { id: 'ai-pilot', name: 'AI Autopilot', description: 'AI-driven route planning and storm tracking.', cost: 1500, armorBonus: 0, speedBonus: 5, sensorBonus: 10, tier: 5, icon: '🤖' },
  { id: 'quantum-sensor', name: 'Quantum Weather Sensor', description: 'Predictive sensing using quantum computing.', cost: 2000, armorBonus: 0, speedBonus: 3, sensorBonus: 25, tier: 5, icon: '🔮' },
  { id: 'fusion-reactor', name: 'Micro Fusion Reactor', description: 'Unlimited clean power for all systems.', cost: 2500, armorBonus: 10, speedBonus: 10, sensorBonus: 15, tier: 5, icon: '⚛️' },
  { id: 'phase-shifter', name: 'Atmospheric Phase Shifter', description: 'Experimental tech to partially phase through storms.', cost: 5000, armorBonus: 30, speedBonus: 15, sensorBonus: 30, tier: 5, icon: '✨' },
];

const SC_VEHICLE_MAP: Record<string, VehicleDef> = {};
SC_VEHICLES.forEach((v) => { SC_VEHICLE_MAP[v.id] = v; });

// ============================================================================
// SC_ABILITIES — 22 weather abilities
// ============================================================================

interface AbilityDef {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  cost: number;
  effect: string;
  unlockLevel: number;
  icon: string;
}

const SC_ABILITIES: AbilityDef[] = [
  { id: 'wind-summon', name: 'Wind Summon', description: 'Call forth targeted gusts to redirect storm debris.', cooldown: 3, cost: 100, effect: 'Redirects light debris away from position.', unlockLevel: 2, icon: '🌬️' },
  { id: 'lightning-redirect', name: 'Lightning Redirect', description: 'Channel lightning strikes to a safe ground point.', cooldown: 5, cost: 150, effect: 'Prevents 1 lightning strike damage.', unlockLevel: 3, icon: '⚡' },
  { id: 'cloud-seed', name: 'Cloud Seeding', description: 'Disperse silver iodide to weaken storm intensity.', cooldown: 10, cost: 200, effect: 'Reduces storm danger level by 1 for 30s.', unlockLevel: 5, icon: '☁️' },
  { id: 'storm-calm', name: 'Eye of Calm', description: 'Create a localized calm zone around your vehicle.', cooldown: 8, cost: 180, effect: 'Shields from wind and rain for 20s.', unlockLevel: 4, icon: '🌟' },
  { id: 'pressure-sense', name: 'Pressure Sense', description: 'Feel minute pressure changes to predict storm behavior.', cooldown: 2, cost: 80, effect: 'Reveals hidden storm spawns for 60s.', unlockLevel: 1, icon: '🌡️' },
  { id: 'thermal-sight', name: 'Thermal Sight', description: 'See temperature gradients revealing storm structure.', cooldown: 4, cost: 120, effect: 'Shows storm core location and intensity.', unlockLevel: 6, icon: '👁️' },
  { id: 'fog-dispel', name: 'Fog Dispel', description: 'Generate warm air currents to burn off fog.', cooldown: 6, cost: 100, effect: 'Clears fog in a 500m radius.', unlockLevel: 3, icon: '🔥' },
  { id: 'ice-shield', name: 'Ice Shield', description: 'Create a protective barrier against hail and ice.', cooldown: 7, cost: 160, effect: 'Blocks hail damage for 15s.', unlockLevel: 7, icon: '🧊' },
  { id: 'wind-dash', name: 'Wind Dash', description: 'Ride tailwinds for rapid vehicle acceleration.', cooldown: 5, cost: 130, effect: 'Boosts speed by 50% for 10s.', unlockLevel: 8, icon: '💨' },
  { id: 'static-harvest', name: 'Static Harvest', description: 'Convert ambient electrical energy into coins.', cooldown: 8, cost: 0, effect: 'Earns 50 coins per lightning strike nearby.', unlockLevel: 9, icon: '💰' },
  { id: 'storm-predict', name: 'Storm Prediction', description: 'Calculate storm trajectory with high accuracy.', cooldown: 15, cost: 250, effect: 'Shows exact storm path for 2 minutes.', unlockLevel: 10, icon: '🧠' },
  { id: 'gravity-well', name: 'Gravity Well', description: 'Create a local pressure anomaly to weaken wind.', cooldown: 12, cost: 300, effect: 'Reduces wind speed by 40% in area for 20s.', unlockLevel: 12, icon: '🕳️' },
  { id: 'thunder-call', name: 'Thunder Call', description: 'Command a targeted lightning strike for observation.', cooldown: 10, cost: 200, effect: 'Forces a lightning strike at a target location.', unlockLevel: 14, icon: '⛈️' },
  { id: 'aqua-breathe', name: 'Aqua Breathe', description: 'Survive underwater during flash floods.', cooldown: 20, cost: 350, effect: 'Survive flood conditions for 30s.', unlockLevel: 11, icon: '🫧' },
  { id: 'dust-vision', name: 'Dust Vision', description: 'See clearly through sandstorms and haboobs.', cooldown: 6, cost: 140, effect: 'Full visibility in dust storms for 45s.', unlockLevel: 13, icon: '🥽' },
  { id: 'cryo-freeze', name: 'Cryo Freeze', description: 'Flash-freeze a section of storm to neutralize it.', cooldown: 18, cost: 400, effect: 'Freezes a small storm cell for 10s.', unlockLevel: 16, icon: '❄️' },
  { id: 'vortex-step', name: 'Vortex Step', description: 'Teleport short distances using wind currents.', cooldown: 4, cost: 180, effect: 'Instant reposition up to 200m.', unlockLevel: 18, icon: '🌀' },
  { id: 'atmo-sync', name: 'Atmospheric Synchronization', description: 'Align your vitals with weather patterns for bonuses.', cooldown: 25, cost: 500, effect: 'Double XP for 1 minute.', unlockLevel: 20, icon: '🔮' },
  { id: 'tempest-control', name: 'Tempest Control', description: 'Partially steer a storm in a chosen direction.', cooldown: 30, cost: 600, effect: 'Deflects storm path 15 degrees.', unlockLevel: 22, icon: '🌪️' },
  { id: 'solar-flare', name: 'Solar Flare Channel', description: 'Harness solar energy to power all equipment.', cooldown: 20, cost: 0, effect: 'All abilities cooldown reduced by 50% for 30s.', unlockLevel: 24, icon: '☀️' },
  { id: 'time-lapse', name: 'Temporal Weather Vision', description: 'See the storm evolve in fast-forward.', cooldown: 15, cost: 450, effect: 'Preview storm evolution for 30 seconds.', unlockLevel: 26, icon: '⏰' },
  { id: 'deity-storm', name: 'Storm Deity Ascension', description: 'Become one with the storm itself.', cooldown: 60, cost: 1000, effect: 'Immune to all damage, triple XP for 45s.', unlockLevel: 30, icon: '👑' },
];

const SC_ABILITY_MAP: Record<string, AbilityDef> = {};
SC_ABILITIES.forEach((a) => { SC_ABILITY_MAP[a.id] = a; });

// ============================================================================
// SC_ACHIEVEMENTS — 18 achievements
// ============================================================================

interface AchievementDef {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  coinReward: number;
  condition: string;
  icon: string;
}

const SC_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-chase', name: 'First Chase', description: 'Complete your first storm chase.', xpReward: 50, coinReward: 25, condition: 'chaseCount >= 1', icon: '🏁' },
  { id: 'storm-spotter', name: 'Storm Spotter', description: 'Observe 10 different storm types.', xpReward: 100, coinReward: 50, condition: 'uniqueObserved >= 10', icon: '👁️' },
  { id: 'lightning-photographer', name: 'Lightning Photographer', description: 'Capture 50 lightning photographs.', xpReward: 150, coinReward: 75, condition: 'photoCount >= 50', icon: '📸' },
  { id: 'data-collector', name: 'Data Collector', description: 'Collect 100 weather data points.', xpReward: 200, coinReward: 100, condition: 'dataPoints >= 100', icon: '📊' },
  { id: 'tornado-alley-veteran', name: 'Tornado Alley Veteran', description: 'Chase 20 tornadoes.', xpReward: 300, coinReward: 150, condition: 'tornadoChases >= 20', icon: '🌪️' },
  { id: 'hurricane-hunter', name: 'Hurricane Hunter', description: 'Intercept 5 hurricanes.', xpReward: 350, coinReward: 200, condition: 'hurricaneChases >= 5', icon: '🌀' },
  { id: 'zone-explorer', name: 'Zone Explorer', description: 'Travel to all 8 chase zones.', xpReward: 250, coinReward: 120, condition: 'zonesVisited >= 8', icon: '🗺️' },
  { id: 'tool-master', name: 'Instrument Master', description: 'Deploy all 30 weather tools at least once.', xpReward: 400, coinReward: 200, condition: 'toolsDeployed >= 30', icon: '🔧' },
  { id: 'fully-loaded', name: 'Fully Loaded', description: 'Own 10 vehicle upgrades.', xpReward: 300, coinReward: 150, condition: 'vehicleUpgrades >= 10', icon: '🚗' },
  { id: 'weather-wise', name: 'Weather Wise', description: 'Correctly predict 25 storms.', xpReward: 350, coinReward: 175, condition: 'correctPredictions >= 25', icon: '🧠' },
  { id: 'survivor', name: 'Survivor', description: 'Survive 10 legendary-tier storms.', xpReward: 500, coinReward: 300, condition: 'legendarySurvives >= 10', icon: '💪' },
  { id: 'coin-rain', name: 'Coin Rain', description: 'Accumulate 10,000 coins total.', xpReward: 200, coinReward: 500, condition: 'totalCoins >= 10000', icon: '💰' },
  { id: 'streak-master', name: 'Streak Master', description: 'Maintain a 7-day chase streak.', xpReward: 300, coinReward: 200, condition: 'dayStreak >= 7', icon: '🔥' },
  { id: 'legend-chaser', name: 'Legend Chaser', description: 'Encounter all 7 legendary storms.', xpReward: 1000, coinReward: 500, condition: 'legendaryEncounters >= 7', icon: '👑' },
  { id: 'ability-master', name: 'Weather Mage', description: 'Cast every ability at least once.', xpReward: 450, coinReward: 250, condition: 'abilitiesCast >= 22', icon: '✨' },
  { id: 'elite-forecaster', name: 'Elite Forecaster', description: 'Reach level 20.', xpReward: 500, coinReward: 300, condition: 'level >= 20', icon: '📈' },
  { id: 'all-weather', name: 'All-Weather Hero', description: 'Experience storms from all 8 categories.', xpReward: 600, coinReward: 350, condition: 'categoriesExperienced >= 8', icon: '🌈' },
  { id: 'apex-chaser', name: 'Apex Chaser', description: 'Reach maximum level 30.', xpReward: 2000, coinReward: 1000, condition: 'level >= 30', icon: '🏆' },
];

const SC_ACHIEVEMENT_MAP: Record<string, AchievementDef> = {};
SC_ACHIEVEMENTS.forEach((a) => { SC_ACHIEVEMENT_MAP[a.id] = a; });

// ============================================================================
// SC_TITLES — 8 progression titles
// ============================================================================

const SC_TITLES: { name: string; levelReq: number; color: string }[] = [
  { name: 'Weather Watcher', levelReq: 1, color: '#6B7280' },
  { name: 'Storm Spotter', levelReq: 3, color: '#3B82F6' },
  { name: 'Wind Rider', levelReq: 6, color: '#60A5FA' },
  { name: 'Tempest Chaser', levelReq: 10, color: '#8B5CF6' },
  { name: 'Hurricane Hunter', levelReq: 15, color: '#A855F7' },
  { name: 'Thunder Master', levelReq: 20, color: '#FBBF24' },
  { name: 'Storm Sovereign', levelReq: 25, color: '#F59E0B' },
  { name: 'Storm Deity', levelReq: 30, color: '#EF4444' },
];

// ============================================================================
// STATE INTERFACES
// ============================================================================

interface StormInstance {
  id: string;
  discovered: boolean;
  chaseCount: number;
  observationCount: number;
  photoCount: number;
  dataCollected: number;
  bestWindRecorded: number;
  lastChased: number;
}

interface ZoneInstance {
  id: string;
  unlocked: boolean;
  current: boolean;
  visits: number;
  stormsEncountered: number;
}

interface EquipmentInstance {
  id: string;
  owned: boolean;
  level: number;
  deployed: boolean;
  durability: number;
  maxDurability: number;
  deployedAt: number;
}

interface AbilityCooldown {
  ready: boolean;
  remaining: number;
  lastUsed: number;
}

interface QuestDef {
  completed: boolean;
  progress: number;
  target: number;
  type: string;
}

interface ChaseLogEntry {
  stormId: string;
  zoneId: string;
  xpEarned: number;
  coinsEarned: number;
  timestamp: number;
  result: string;
}

export interface StormChaserState {
  level: number;
  xp: number;
  maxXp: number;
  coins: number;
  totalCoinsEarned: number;
  storms: Record<string, StormInstance>;
  zones: Record<string, ZoneInstance>;
  discoveries: string[];
  achievements: string[];
  currentTitle: number;
  inventory: Record<string, number>;
  dailyQuest: QuestDef;
  dayStreak: number;
  equipment: Record<string, EquipmentInstance>;
  abilityCooldowns: Record<string, AbilityCooldown>;
  chaseLog: ChaseLogEntry[];
  totalChases: number;
  totalObservations: number;
  totalPhotos: number;
  totalDataPoints: number;
  totalPredictions: number;
  correctPredictions: number;
  tornadoChases: number;
  hurricaneChases: number;
  legendarySurvives: number;
  zonesVisitedCount: number;
  toolsDeployedSet: string[];
  abilitiesCastSet: string[];
  categoriesExperiencedSet: string[];
  legendaryEncounterSet: string[];
  currentZoneId: string;
  lastPlayDate: string;
}

// ============================================================================
// DEFAULT STATE
// ============================================================================

function createDefaultStormInstance(id: string): StormInstance {
  return {
    id,
    discovered: false,
    chaseCount: 0,
    observationCount: 0,
    photoCount: 0,
    dataCollected: 0,
    bestWindRecorded: 0,
    lastChased: 0,
  };
}

function createDefaultZoneInstance(id: string, isStarter: boolean): ZoneInstance {
  return {
    id,
    unlocked: isStarter,
    current: isStarter,
    visits: isStarter ? 1 : 0,
    stormsEncountered: 0,
  };
}

function createDefaultEquipmentInstance(id: string): EquipmentInstance {
  return {
    id,
    owned: false,
    level: 1,
    deployed: false,
    durability: 100,
    maxDurability: 100,
    deployedAt: 0,
  };
}

function createDefaultState(): StormChaserState {
  const storms: Record<string, StormInstance> = {};
  SC_STORMS.forEach((s) => { storms[s.id] = createDefaultStormInstance(s.id); });

  const zones: Record<string, ZoneInstance> = {};
  SC_ZONES.forEach((z, idx) => { zones[z.id] = createDefaultZoneInstance(z.id, idx === 0); });

  const equipment: Record<string, EquipmentInstance> = {};
  const allItems = [...SC_TOOLS, ...SC_VEHICLES];
  allItems.forEach((item) => { equipment[item.id] = createDefaultEquipmentInstance(item.id); });

  const cooldowns: Record<string, AbilityCooldown> = {};
  SC_ABILITIES.forEach((a) => {
    cooldowns[a.id] = { ready: true, remaining: 0, lastUsed: 0 };
  });

  return {
    level: 1,
    xp: 0,
    maxXp: 100,
    coins: 0,
    totalCoinsEarned: 0,
    storms,
    zones,
    discoveries: [],
    achievements: [],
    currentTitle: 0,
    inventory: { 'field-journal': 1, 'rain-gauge': 1 },
    dailyQuest: { completed: false, progress: 0, target: 3, type: 'chase_storms' },
    dayStreak: 0,
    equipment,
    abilityCooldowns: cooldowns,
    chaseLog: [],
    totalChases: 0,
    totalObservations: 0,
    totalPhotos: 0,
    totalDataPoints: 0,
    totalPredictions: 0,
    correctPredictions: 0,
    tornadoChases: 0,
    hurricaneChases: 0,
    legendarySurvives: 0,
    zonesVisitedCount: 1,
    toolsDeployedSet: [],
    abilitiesCastSet: [],
    categoriesExperiencedSet: [],
    legendaryEncounterSet: [],
    currentZoneId: 'great-plains',
    lastPlayDate: new Date().toDateString(),
  };
}

// ============================================================================
// HELPER: XP curve
// ============================================================================

function xpForLevel(lvl: number): number {
  return Math.floor(100 * Math.pow(1.35, lvl - 1));
}

function getRarityColor(rarity: ScRarity): string {
  return SC_RARITY_COLORS[rarity];
}

function generateDailyQuest(level: number): QuestDef {
  const questTypes = [
    { type: 'chase_storms', baseTarget: 3 },
    { type: 'observe_storms', baseTarget: 5 },
    { type: 'collect_data', baseTarget: 10 },
    { type: 'photograph_lightning', baseTarget: 4 },
    { type: 'predict_storms', baseTarget: 2 },
  ];
  const q = questTypes[Math.floor(Math.random() * questTypes.length)];
  const scaledTarget = Math.max(q.baseTarget, Math.floor(q.baseTarget * (1 + level * 0.1)));
  return { completed: false, progress: 0, target: scaledTarget, type: q.type };
}

// ============================================================================
// THE HOOK
// ============================================================================

export default function useStormChaser(initialState?: StormChaserState) {
  const [state, setState] = useState<StormChaserState>(initialState ?? createDefaultState());

  // --- Level & XP ---
  const getLevel = useCallback(() => state.level, [state]);
  const getXp = useCallback(() => state.xp, [state]);
  const getMaxXp = useCallback(() => state.maxXp, [state]);
  const getCoins = useCallback(() => state.coins, [state]);
  const getXpPercent = useCallback(() => {
    if (state.maxXp <= 0) return 0;
    return Math.min(100, Math.floor((state.xp / state.maxXp) * 100));
  }, [state]);

  const addXp = useCallback((amount: number) => {
    setState((prev) => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;
      while (newXp >= newMaxXp && newLevel < 30) {
        newXp -= newMaxXp;
        newLevel += 1;
        newMaxXp = xpForLevel(newLevel);
      }
      if (newLevel >= 30) {
        newXp = Math.min(newXp, newMaxXp);
      }
      return { ...prev, xp: newXp, level: newLevel, maxXp: newMaxXp };
    });
  }, []);

  const addCoins = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      coins: prev.coins + amount,
      totalCoinsEarned: prev.totalCoinsEarned + amount,
    }));
  }, []);

  const spendCoins = useCallback((amount: number): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.coins < amount) return prev;
      success = true;
      return { ...prev, coins: prev.coins - amount };
    });
    return success;
  }, []);

  // --- Title ---
  const getTitle = useCallback(() => SC_TITLES[state.currentTitle], [state]);
  const getAllTitles = useCallback(() => SC_TITLES, []);
  const getUnlockedTitles = useCallback(() => {
    return SC_TITLES.filter((t) => state.level >= t.levelReq);
  }, [state]);

  const updateTitle = useCallback(() => {
    setState((prev) => {
      let bestIdx = prev.currentTitle;
      for (let i = SC_TITLES.length - 1; i >= 0; i--) {
        if (prev.level >= SC_TITLES[i].levelReq) {
          bestIdx = i;
          break;
        }
      }
      return { ...prev, currentTitle: bestIdx };
    });
  }, []);

  // --- Storm Data ---
  const getStorm = useCallback((id: string) => {
    return SC_STORM_MAP[id] ?? null;
  }, []);

  const getAllStorms = useCallback(() => SC_STORMS, []);
  const getStormsByRarity = useCallback((rarity: ScRarity) => {
    return SC_STORMS.filter((s) => s.rarity === rarity);
  }, []);
  const getStormsByCategory = useCallback((category: ScCategory) => {
    return SC_STORMS.filter((s) => s.category === category);
  }, []);

  const getDiscoveredStorms = useCallback(() => {
    return state.discoveries.map((id) => SC_STORM_MAP[id]).filter(Boolean);
  }, [state]);

  const getUndiscoveredStorms = useCallback(() => {
    return SC_STORMS.filter((s) => !state.discoveries.includes(s.id));
  }, [state]);

  const getStormInstance = useCallback((id: string) => {
    return state.storms[id] ?? null;
  }, [state]);

  const getStormDiscoveryPercent = useCallback(() => {
    if (SC_STORMS.length === 0) return 0;
    return Math.floor((state.discoveries.length / SC_STORMS.length) * 100);
  }, [state]);

  // --- Zone Data ---
  const getZone = useCallback((id: string) => {
    return SC_ZONE_MAP[id] ?? null;
  }, []);
  const getAllZones = useCallback(() => SC_ZONES, []);
  const getCurrentZone = useCallback(() => {
    return SC_ZONE_MAP[state.currentZoneId] ?? null;
  }, [state]);
  const getCurrentZoneId = useCallback(() => state.currentZoneId, [state]);

  const travelToZone = useCallback((zoneId: string) => {
    const zone = SC_ZONE_MAP[zoneId];
    if (!zone) return false;
    setState((prev) => {
      if (prev.coins < zone.travelCost && zone.travelCost > 0) return prev;
      if (prev.level < zone.unlockLevel) return prev;
      const newZones = { ...prev.zones };
      if (!newZones[zoneId]) {
        newZones[zoneId] = createDefaultZoneInstance(zoneId, false);
      }
      newZones[zoneId] = {
        ...newZones[zoneId],
        unlocked: true,
        visits: newZones[zoneId].visits + 1,
      };
      Object.keys(newZones).forEach((k) => {
        newZones[k] = { ...newZones[k], current: k === zoneId };
      });
      return {
        ...prev,
        zones: newZones,
        currentZoneId: zoneId,
        coins: prev.coins - zone.travelCost,
        zonesVisitedCount: Math.max(prev.zonesVisitedCount, Object.values(newZones).filter((z) => z.visits > 0).length),
      };
    });
    return true;
  }, []);

  const getUnlockedZones = useCallback(() => {
    return SC_ZONES.filter((z) => {
      const inst = state.zones[z.id];
      return inst && inst.unlocked;
    });
  }, [state]);

  const getLockedZones = useCallback(() => {
    return SC_ZONES.filter((z) => {
      const inst = state.zones[z.id];
      return !inst || !inst.unlocked;
    });
  }, [state]);

  // --- Chase Mechanics ---
  const discoverStorm = useCallback((stormId: string) => {
    setState((prev) => {
      if (prev.discoveries.includes(stormId)) return prev;
      const storm = SC_STORM_MAP[stormId];
      if (!storm) return prev;
      const newCategories = new Set(prev.categoriesExperiencedSet);
      newCategories.add(storm.category);
      const newLegendarySet = new Set(prev.legendaryEncounterSet);
      if (storm.rarity === 'Legendary') {
        newLegendarySet.add(stormId);
      }
      return {
        ...prev,
        discoveries: [...prev.discoveries, stormId],
        categoriesExperiencedSet: Array.from(newCategories),
        legendaryEncounterSet: Array.from(newLegendarySet),
      };
    });
  }, []);

  const chaseStorm = useCallback((stormId: string) => {
    const storm = SC_STORM_MAP[stormId];
    if (!storm) return { xp: 0, coins: 0, success: false };
    const xpGain = Math.floor(storm.xpReward * SC_RARITY_XP_MULTIPLIER[storm.rarity]);
    const coinGain = Math.floor(storm.coinReward * SC_RARITY_COIN_MULTIPLIER[storm.rarity]);
    discoverStorm(stormId);
    let chaseResult = 'success';
    setState((prev) => {
      const newStorms = { ...prev.storms };
      const inst = newStorms[stormId];
      if (!inst) return prev;
      const isTornado = stormId.includes('tornado') || stormId.includes('ef5') || stormId.includes('ef3');
      const isHurricane = stormId.includes('hurricane') || stormId.includes('mega-hurricane');
      const isLegendary = storm.rarity === 'Legendary';
      const survivedLegendary = isLegendary ? prev.legendarySurvives + 1 : prev.legendarySurvives;
      newStorms[stormId] = {
        ...inst,
        discovered: true,
        chaseCount: inst.chaseCount + 1,
        bestWindRecorded: Math.max(inst.bestWindRecorded, storm.windSpeed),
        lastChased: Date.now(),
      };
      const newLog: ChaseLogEntry = {
        stormId,
        zoneId: prev.currentZoneId,
        xpEarned: xpGain,
        coinsEarned: coinGain,
        timestamp: Date.now(),
        result: chaseResult,
      };
      return {
        ...prev,
        storms: newStorms,
        xp: prev.xp + xpGain,
        maxXp: prev.maxXp,
        level: prev.level,
        coins: prev.coins + coinGain,
        totalCoinsEarned: prev.totalCoinsEarned + coinGain,
        totalChases: prev.totalChases + 1,
        tornadoChases: prev.tornadoChases + (isTornado ? 1 : 0),
        hurricaneChases: prev.hurricaneChases + (isHurricane ? 1 : 0),
        legendarySurvives: survivedLegendary,
        chaseLog: [newLog, ...prev.chaseLog].slice(0, 100),
        dailyQuest: {
          ...prev.dailyQuest,
          progress: prev.dailyQuest.type === 'chase_storms' ? prev.dailyQuest.progress + 1 : prev.dailyQuest.progress,
        },
      };
    });
    return { xp: xpGain, coins: coinGain, success: true };
  }, [discoverStorm]);

  const observeStorm = useCallback((stormId: string) => {
    const storm = SC_STORM_MAP[stormId];
    if (!storm) return { xp: 0, success: false };
    const xpGain = Math.floor(storm.xpReward * 0.6);
    setState((prev) => {
      const newStorms = { ...prev.storms };
      const inst = newStorms[stormId];
      if (!inst) return prev;
      newStorms[stormId] = {
        ...inst,
        discovered: true,
        observationCount: inst.observationCount + 1,
      };
      return {
        ...prev,
        storms: newStorms,
        xp: prev.xp + xpGain,
        maxXp: prev.maxXp,
        level: prev.level,
        totalObservations: prev.totalObservations + 1,
        dailyQuest: {
          ...prev.dailyQuest,
          progress: prev.dailyQuest.type === 'observe_storms' ? prev.dailyQuest.progress + 1 : prev.dailyQuest.progress,
        },
      };
    });
    discoverStorm(stormId);
    return { xp: xpGain, success: true };
  }, [discoverStorm]);

  const photographStorm = useCallback((stormId: string) => {
    const storm = SC_STORM_MAP[stormId];
    if (!storm) return { xp: 0, coins: 0, success: false };
    const xpGain = Math.floor(storm.xpReward * 0.8);
    const coinGain = Math.floor(storm.coinReward * 0.5);
    setState((prev) => {
      const newStorms = { ...prev.storms };
      const inst = newStorms[stormId];
      if (!inst) return prev;
      newStorms[stormId] = {
        ...inst,
        discovered: true,
        photoCount: inst.photoCount + 1,
      };
      return {
        ...prev,
        storms: newStorms,
        xp: prev.xp + xpGain,
        coins: prev.coins + coinGain,
        totalCoinsEarned: prev.totalCoinsEarned + coinGain,
        totalPhotos: prev.totalPhotos + 1,
        dailyQuest: {
          ...prev.dailyQuest,
          progress: prev.dailyQuest.type === 'photograph_lightning' ? prev.dailyQuest.progress + 1 : prev.dailyQuest.progress,
        },
      };
    });
    return { xp: xpGain, coins: coinGain, success: true };
  }, []);

  const collectDataPoint = useCallback((stormId: string) => {
    const storm = SC_STORM_MAP[stormId];
    if (!storm) return { xp: 0, success: false };
    const xpGain = Math.floor(storm.xpReward * 0.4);
    setState((prev) => {
      const newStorms = { ...prev.storms };
      const inst = newStorms[stormId];
      if (!inst) return prev;
      newStorms[stormId] = {
        ...inst,
        discovered: true,
        dataCollected: inst.dataCollected + 1,
      };
      const itemKey = `data_${stormId}`;
      const newInventory = { ...prev.inventory };
      newInventory[itemKey] = (newInventory[itemKey] ?? 0) + 1;
      return {
        ...prev,
        storms: newStorms,
        xp: prev.xp + xpGain,
        inventory: newInventory,
        totalDataPoints: prev.totalDataPoints + 1,
        dailyQuest: {
          ...prev.dailyQuest,
          progress: prev.dailyQuest.type === 'collect_data' ? prev.dailyQuest.progress + 1 : prev.dailyQuest.progress,
        },
      };
    });
    return { xp: xpGain, success: true };
  }, []);

  const analyzeWeather = useCallback(() => {
    const xpGain = 15;
    setState((prev) => ({
      ...prev,
      xp: prev.xp + xpGain,
    }));
    return { xp: xpGain, analysis: 'Atmospheric conditions show convective development with potential for severe weather.' };
  }, []);

  // --- Tool Deployment ---
  const deployTool = useCallback((toolId: string) => {
    const tool = SC_TOOL_MAP[toolId];
    if (!tool) return { success: false };
    setState((prev) => {
      const newEquipment = { ...prev.equipment };
      const inst = newEquipment[toolId];
      if (!inst || !inst.owned) return prev;
      newEquipment[toolId] = {
        ...inst,
        deployed: true,
        durability: Math.max(0, inst.durability - 5),
        deployedAt: Date.now(),
      };
      const newDeployed = prev.toolsDeployedSet.includes(toolId)
        ? prev.toolsDeployedSet
        : [...prev.toolsDeployedSet, toolId];
      return {
        ...prev,
        equipment: newEquipment,
        toolsDeployedSet: newDeployed,
        xp: prev.xp + tool.bonus,
      };
    });
    return { success: true, bonus: tool.bonus };
  }, []);

  const buyTool = useCallback((toolId: string): boolean => {
    const tool = SC_TOOL_MAP[toolId];
    if (!tool) return false;
    let purchased = false;
    setState((prev) => {
      if (prev.coins < tool.cost) return prev;
      if (prev.equipment[toolId]?.owned) return prev;
      purchased = true;
      const newEquipment = { ...prev.equipment };
      newEquipment[toolId] = {
        ...createDefaultEquipmentInstance(toolId),
        owned: true,
      };
      return {
        ...prev,
        equipment: newEquipment,
        coins: prev.coins - tool.cost,
      };
    });
    return purchased;
  }, []);

  const getAllTools = useCallback(() => SC_TOOLS, []);
  const getTool = useCallback((id: string) => SC_TOOL_MAP[id] ?? null, []);
  const getOwnedTools = useCallback(() => {
    return SC_TOOLS.filter((t) => state.equipment[t.id]?.owned);
  }, [state]);

  const getDeployedTools = useCallback(() => {
    return SC_TOOLS.filter((t) => state.equipment[t.id]?.deployed);
  }, [state]);

  const getToolInstance = useCallback((id: string) => {
    return state.equipment[id] ?? null;
  }, [state]);

  // --- Vehicle Upgrades ---
  const upgradeVehicle = useCallback((vehicleId: string): boolean => {
    const vehicle = SC_VEHICLE_MAP[vehicleId];
    if (!vehicle) return false;
    let purchased = false;
    setState((prev) => {
      if (prev.coins < vehicle.cost) return prev;
      if (prev.equipment[vehicleId]?.owned) return prev;
      purchased = true;
      const newEquipment = { ...prev.equipment };
      newEquipment[vehicleId] = {
        ...createDefaultEquipmentInstance(vehicleId),
        owned: true,
      };
      return {
        ...prev,
        equipment: newEquipment,
        coins: prev.coins - vehicle.cost,
      };
    });
    return purchased;
  }, []);

  const getAllVehicles = useCallback(() => SC_VEHICLES, []);
  const getVehicle = useCallback((id: string) => SC_VEHICLE_MAP[id] ?? null, []);
  const getOwnedVehicles = useCallback(() => {
    return SC_VEHICLES.filter((v) => state.equipment[v.id]?.owned);
  }, [state]);
  const getVehiclesByTier = useCallback((tier: number) => {
    return SC_VEHICLES.filter((v) => v.tier === tier);
  }, []);

  const getVehicleStats = useCallback(() => {
    const owned = SC_VEHICLES.filter((v) => state.equipment[v.id]?.owned);
    return {
      totalArmor: owned.reduce((sum, v) => sum + v.armorBonus, 0),
      totalSpeed: owned.reduce((sum, v) => sum + v.speedBonus, 0),
      totalSensor: owned.reduce((sum, v) => sum + v.sensorBonus, 0),
      count: owned.length,
    };
  }, [state]);

  // --- Weather Abilities ---
  const getAbility = useCallback((id: string) => SC_ABILITY_MAP[id] ?? null, []);
  const getAllAbilities = useCallback(() => SC_ABILITIES, []);
  const getUnlockedAbilities = useCallback(() => {
    return SC_ABILITIES.filter((a) => state.level >= a.unlockLevel);
  }, [state]);
  const getLockedAbilities = useCallback(() => {
    return SC_ABILITIES.filter((a) => state.level < a.unlockLevel);
  }, [state]);

  const getAbilityCooldown = useCallback((id: string) => {
    return state.abilityCooldowns[id] ?? null;
  }, [state]);

  const castWeatherAbility = useCallback((abilityId: string) => {
    const ability = SC_ABILITY_MAP[abilityId];
    if (!ability) return { success: false, reason: 'Ability not found' };
    let result: { success: boolean; reason: string } = { success: false, reason: '' };
    setState((prev) => {
      if (prev.level < ability.unlockLevel) {
        result = { success: false, reason: 'Level too low' };
        return prev;
      }
      const cd = prev.abilityCooldowns[abilityId];
      if (!cd || !cd.ready) {
        result = { success: false, reason: 'On cooldown' };
        return prev;
      }
      if (prev.coins < ability.cost) {
        result = { success: false, reason: 'Not enough coins' };
        return prev;
      }
      const newCooldowns = { ...prev.abilityCooldowns };
      newCooldowns[abilityId] = {
        ready: false,
        remaining: ability.cooldown,
        lastUsed: Date.now(),
      };
      const newCastSet = prev.abilitiesCastSet.includes(abilityId)
        ? prev.abilitiesCastSet
        : [...prev.abilitiesCastSet, abilityId];
      result = { success: true, reason: 'Cast successfully' };
      return {
        ...prev,
        abilityCooldowns: newCooldowns,
        coins: prev.coins - ability.cost,
        abilitiesCastSet: newCastSet,
        xp: prev.xp + Math.floor(ability.unlockLevel * 2),
      };
    });
    return result;
  }, []);

  const tickCooldowns = useCallback(() => {
    setState((prev) => {
      const newCooldowns = { ...prev.abilityCooldowns };
      let changed = false;
      Object.keys(newCooldowns).forEach((id) => {
        const cd = newCooldowns[id];
        if (!cd.ready && cd.remaining > 0) {
          const newRemaining = cd.remaining - 1;
          newCooldowns[id] = { ...cd, remaining: newRemaining, ready: newRemaining <= 0 };
          changed = true;
        }
      });
      return changed ? { ...prev, abilityCooldowns: newCooldowns } : prev;
    });
  }, []);

  const resetCooldowns = useCallback(() => {
    setState((prev) => {
      const newCooldowns = { ...prev.abilityCooldowns };
      Object.keys(newCooldowns).forEach((id) => {
        newCooldowns[id] = { ready: true, remaining: 0, lastUsed: 0 };
      });
      return { ...prev, abilityCooldowns: newCooldowns };
    });
  }, []);

  // --- Prediction & Forecasting ---
  const predictStorm = useCallback(() => {
    const currentZone = SC_ZONE_MAP[state.currentZoneId];
    if (!currentZone) return { prediction: null, xp: 0 };
    const pool = currentZone.stormPool;
    const predicted = pool[Math.floor(Math.random() * pool.length)];
    const storm = SC_STORM_MAP[predicted];
    const xpGain = 12;
    setState((prev) => ({
      ...prev,
      xp: prev.xp + xpGain,
      totalPredictions: prev.totalPredictions + 1,
    }));
    return {
      prediction: storm ?? null,
      xp: xpGain,
    };
  }, [state]);

  const forecastWeather = useCallback(() => {
    const currentZone = SC_ZONE_MAP[state.currentZoneId];
    if (!currentZone) return { forecast: 'No zone data available.', xp: 0 };
    const conditions = ['Severe storms likely', 'Scattered thunderstorms', 'Clearing expected', 'Conditions deteriorating', 'Tornado watch probable', 'Hurricane formation detected', 'Flash flood warning', 'Unusual atmospheric pressure'];
    const forecast = conditions[Math.floor(Math.random() * conditions.length)];
    const xpGain = 18;
    setState((prev) => ({
      ...prev,
      xp: prev.xp + xpGain,
    }));
    return { forecast, xp: xpGain };
  }, [state]);

  const recordCorrectPrediction = useCallback(() => {
    setState((prev) => ({
      ...prev,
      correctPredictions: prev.correctPredictions + 1,
      coins: prev.coins + 20,
      dailyQuest: {
        ...prev.dailyQuest,
        progress: prev.dailyQuest.type === 'predict_storms' ? prev.dailyQuest.progress + 1 : prev.dailyQuest.progress,
      },
    }));
  }, []);

  // --- Daily Quest ---
  const getDailyQuest = useCallback(() => state.dailyQuest, [state]);
  const getDailyQuestProgress = useCallback(() => {
    if (!state.dailyQuest) return { percent: 0, current: 0, target: 0 };
    const percent = state.dailyQuest.target > 0
      ? Math.min(100, Math.floor((state.dailyQuest.progress / state.dailyQuest.target) * 100))
      : 0;
    return { percent, current: state.dailyQuest.progress, target: state.dailyQuest.target };
  }, [state]);

  const completeDailyQuest = useCallback(() => {
    setState((prev) => {
      if (prev.dailyQuest.completed) return prev;
      if (prev.dailyQuest.progress < prev.dailyQuest.target) return prev;
      return {
        ...prev,
        dailyQuest: { ...prev.dailyQuest, completed: true },
        coins: prev.coins + 100,
        xp: prev.xp + 50,
      };
    });
  }, []);

  const refreshDailyQuest = useCallback(() => {
    setState((prev) => ({
      ...prev,
      dailyQuest: generateDailyQuest(prev.level),
    }));
  }, []);

  // --- Day Streak ---
  const getDayStreak = useCallback(() => state.dayStreak, [state]);
  const incrementDayStreak = useCallback(() => {
    const today = new Date().toDateString();
    setState((prev) => {
      if (prev.lastPlayDate === today) return prev;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = prev.lastPlayDate === yesterday ? prev.dayStreak + 1 : 1;
      return {
        ...prev,
        dayStreak: newStreak,
        lastPlayDate: today,
      };
    });
  }, []);

  // --- Achievements ---
  const getAchievement = useCallback((id: string) => SC_ACHIEVEMENT_MAP[id] ?? null, []);
  const getAllAchievements = useCallback(() => SC_ACHIEVEMENTS, []);
  const getUnlockedAchievements = useCallback(() => {
    return SC_ACHIEVEMENTS.filter((a) => state.achievements.includes(a.id));
  }, [state]);
  const getLockedAchievements = useCallback(() => {
    return SC_ACHIEVEMENTS.filter((a) => !state.achievements.includes(a.id));
  }, [state]);
  const getAchievementProgress = useCallback(() => {
    if (SC_ACHIEVEMENTS.length === 0) return 0;
    return Math.floor((state.achievements.length / SC_ACHIEVEMENTS.length) * 100);
  }, [state]);

  const checkAchievements = useCallback(() => {
    const newAchievements: string[] = [];
    let totalXp = 0;
    let totalCoins = 0;
    setState((prev) => {
      const checks: Record<string, boolean> = {
        'first-chase': prev.totalChases >= 1,
        'storm-spotter': prev.discoveries.length >= 10,
        'lightning-photographer': prev.totalPhotos >= 50,
        'data-collector': prev.totalDataPoints >= 100,
        'tornado-alley-veteran': prev.tornadoChases >= 20,
        'hurricane-hunter': prev.hurricaneChases >= 5,
        'zone-explorer': prev.zonesVisitedCount >= 8,
        'tool-master': prev.toolsDeployedSet.length >= 30,
        'fully-loaded': SC_VEHICLES.filter((v) => prev.equipment[v.id]?.owned).length >= 10,
        'weather-wise': prev.correctPredictions >= 25,
        'survivor': prev.legendarySurvives >= 10,
        'coin-rain': prev.totalCoinsEarned >= 10000,
        'streak-master': prev.dayStreak >= 7,
        'legend-chaser': prev.legendaryEncounterSet.length >= 7,
        'ability-master': prev.abilitiesCastSet.length >= 22,
        'elite-forecaster': prev.level >= 20,
        'all-weather': prev.categoriesExperiencedSet.length >= 8,
        'apex-chaser': prev.level >= 30,
      };
      Object.entries(checks).forEach(([id, met]) => {
        if (met && !prev.achievements.includes(id)) {
          newAchievements.push(id);
          const ach = SC_ACHIEVEMENT_MAP[id];
          if (ach) {
            totalXp += ach.xpReward;
            totalCoins += ach.coinReward;
          }
        }
      });
      if (newAchievements.length === 0) return prev;
      return {
        ...prev,
        achievements: [...prev.achievements, ...newAchievements],
        xp: prev.xp + totalXp,
        coins: prev.coins + totalCoins,
        totalCoinsEarned: prev.totalCoinsEarned + totalCoins,
      };
    });
    return newAchievements;
  }, []);

  // --- Stats ---
  const getStats = useCallback(() => {
    return {
      level: state.level,
      xp: state.xp,
      maxXp: state.maxXp,
      coins: state.coins,
      totalChases: state.totalChases,
      totalObservations: state.totalObservations,
      totalPhotos: state.totalPhotos,
      totalDataPoints: state.totalDataPoints,
      totalPredictions: state.totalPredictions,
      correctPredictions: state.correctPredictions,
      tornadoChases: state.tornadoChases,
      hurricaneChases: state.hurricaneChases,
      legendarySurvives: state.legendarySurvives,
      discoveries: state.discoveries.length,
      achievements: state.achievements.length,
      dayStreak: state.dayStreak,
      zonesVisited: state.zonesVisitedCount,
      toolsDeployed: state.toolsDeployedSet.length,
      vehicleUpgrades: SC_VEHICLES.filter((v) => state.equipment[v.id]?.owned).length,
      accuracy: state.totalPredictions > 0
        ? Math.floor((state.correctPredictions / state.totalPredictions) * 100)
        : 0,
    };
  }, [state]);

  const getInventory = useCallback(() => state.inventory, [state]);
  const getEquipment = useCallback(() => state.equipment, [state]);
  const getChaseLog = useCallback(() => state.chaseLog, [state]);

  // --- Computed / Derived ---
  const getOverallPower = useCallback(() => {
    const vehicleStats = (() => {
      const owned = SC_VEHICLES.filter((v) => state.equipment[v.id]?.owned);
      return {
        armor: owned.reduce((s, v) => s + v.armorBonus, 0),
        speed: owned.reduce((s, v) => s + v.speedBonus, 0),
        sensor: owned.reduce((s, v) => s + v.sensorBonus, 0),
      };
    })();
    const toolBonus = SC_TOOLS.filter((t) => state.equipment[t.id]?.deployed)
      .reduce((s, t) => s + t.bonus, 0);
    return {
      ...vehicleStats,
      toolBonus,
      totalPower: vehicleStats.armor + vehicleStats.speed + vehicleStats.sensor + toolBonus + state.level * 5,
    };
  }, [state]);

  const getDangerRating = useCallback((stormId: string) => {
    const storm = SC_STORM_MAP[stormId];
    if (!storm) return 0;
    const power = (() => {
      const owned = SC_VEHICLES.filter((v) => state.equipment[v.id]?.owned);
      return owned.reduce((s, v) => s + v.armorBonus, 0);
    })();
    const effectiveDanger = Math.max(1, storm.dangerLevel - Math.floor(power / 10));
    return Math.min(10, effectiveDanger);
  }, [state]);

  const getStormWorth = useCallback((stormId: string) => {
    const storm = SC_STORM_MAP[stormId];
    if (!storm) return { xp: 0, coins: 0 };
    return {
      xp: Math.floor(storm.xpReward * SC_RARITY_XP_MULTIPLIER[storm.rarity]),
      coins: Math.floor(storm.coinReward * SC_RARITY_COIN_MULTIPLIER[storm.rarity]),
    };
  }, []);

  const canAfford = useCallback((cost: number) => state.coins >= cost, [state]);
  const getCoinsNeededForLevel = useCallback((targetLevel: number) => {
    let total = 0;
    for (let i = state.level; i < targetLevel; i++) {
      total += xpForLevel(i);
    }
    return total;
  }, [state]);

  // --- Computed values via useMemo ---
  const titleInfo = useMemo(() => SC_TITLES[state.currentTitle], [state]);

  const rarityDistribution = useMemo(() => {
    const dist: Record<ScRarity, number> = { Common: 0, Uncommon: 0, Rare: 0, Epic: 0, Legendary: 0 };
    state.discoveries.forEach((id) => {
      const storm = SC_STORM_MAP[id];
      if (storm) dist[storm.rarity]++;
    });
    return dist;
  }, [state]);

  const categoryDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    SC_CATEGORIES.forEach((c) => { dist[c] = 0; });
    state.discoveries.forEach((id) => {
      const storm = SC_STORM_MAP[id];
      if (storm) dist[storm.category]++;
    });
    return dist;
  }, [state]);

  const topChasedStorms = useMemo(() => {
    return SC_STORMS
      .map((s) => ({
        ...s,
        chaseCount: state.storms[s.id]?.chaseCount ?? 0,
      }))
      .sort((a, b) => b.chaseCount - a.chaseCount)
      .slice(0, 5);
  }, [state]);

  const mostActiveZone = useMemo(() => {
    let best: ZoneDef | null = null;
    let bestCount = -1;
    SC_ZONES.forEach((z) => {
      const inst = state.zones[z.id];
      if (inst && inst.stormsEncountered > bestCount) {
        bestCount = inst.stormsEncountered;
        best = z;
      }
    });
    return best;
  }, [state]);

  const weatherReport = useMemo(() => {
    const discoveredCount = state.discoveries.length;
    const totalStorms = SC_STORMS.length;
    if (discoveredCount === 0) {
      return 'Begin your journey as a Weather Watcher. Step into the Great Plains and start chasing!';
    }
    const legendaryCount = state.discoveries.filter((id) => SC_STORM_MAP[id]?.rarity === 'Legendary').length;
    if (legendaryCount >= 7) {
      return 'You have witnessed every legendary phenomenon. The atmosphere itself bends to your will.';
    }
    if (state.level >= 20) {
      return `Elite Forecaster reporting ${discoveredCount}/${totalStorms} storms cataloged. ${legendaryCount} legendary encounters recorded.`;
    }
    if (state.totalChases > 50) {
      return `Veteran chaser with ${state.totalChases} pursuits. ${discoveredCount} storm varieties documented across ${state.zonesVisitedCount} zones.`;
    }
    return `${SC_TITLES[state.currentTitle].name} — ${discoveredCount} storms discovered, ${state.totalChases} chases completed.`;
  }, [state]);

  const stormSeasonForecast = useMemo(() => {
    const seasons = ['Spring Tornado Season', 'Summer Hurricane Peak', 'Autumn Derecho Pattern', 'Winter Blizzard Wave'];
    const month = new Date().getMonth();
    let season: string;
    if (month >= 2 && month <= 4) season = seasons[0];
    else if (month >= 5 && month <= 8) season = seasons[1];
    else if (month >= 9 && month <= 10) season = seasons[2];
    else season = seasons[3];
    return { season, intensity: Math.min(10, Math.floor(state.level * 0.4)) };
  }, [state]);

  const powerRank = useMemo(() => {
    const power = state.level * 10
      + state.totalChases * 2
      + state.legendarySurvives * 20
      + SC_VEHICLES.filter((v) => state.equipment[v.id]?.owned).length * 5;
    if (power >= 500) return { rank: 'Mythic', color: '#EF4444', tier: 5 };
    if (power >= 300) return { rank: 'Legendary', color: '#FBBF24', tier: 4 };
    if (power >= 150) return { rank: 'Epic', color: '#A855F7', tier: 3 };
    if (power >= 60) return { rank: 'Rare', color: '#8B5CF6', tier: 2 };
    return { rank: 'Uncommon', color: '#3B82F6', tier: 1 };
  }, [state]);

  // --- Color helpers ---
  const getPrimaryColor = useCallback(() => '#3B82F6', []);
  const getAccentColor = useCallback(() => '#FBBF24', []);
  const getSecondaryColor = useCallback(() => '#8B5CF6', []);
  const getBackgroundColor = useCallback(() => '#1E293B', []);
  const getDarkBackgroundColor = useCallback(() => '#0F172A', []);
  const getTextColor = useCallback(() => '#E2E8F0', []);
  const getStormColorByRarity = useCallback((rarity: ScRarity) => SC_RARITY_COLORS[rarity], []);

  // --- Equipment repair ---
  const repairEquipment = useCallback((equipmentId: string) => {
    const cost = 25;
    setState((prev) => {
      if (prev.coins < cost) return prev;
      const inst = prev.equipment[equipmentId];
      if (!inst || !inst.owned) return prev;
      const newEquipment = { ...prev.equipment };
      newEquipment[equipmentId] = { ...inst, durability: inst.maxDurability };
      return { ...prev, equipment: newEquipment, coins: prev.coins - cost };
    });
  }, []);

  const upgradeEquipment = useCallback((equipmentId: string) => {
    const cost = 50;
    setState((prev) => {
      if (prev.coins < cost) return prev;
      const inst = prev.equipment[equipmentId];
      if (!inst || !inst.owned) return prev;
      const newEquipment = { ...prev.equipment };
      newEquipment[equipmentId] = {
        ...inst,
        level: inst.level + 1,
        maxDurability: inst.maxDurability + 20,
        durability: inst.maxDurability + 20,
      };
      return { ...prev, equipment: newEquipment, coins: prev.coins - cost };
    });
  }, []);

  const undeployTool = useCallback((toolId: string) => {
    setState((prev) => {
      const newEquipment = { ...prev.equipment };
      const inst = newEquipment[toolId];
      if (!inst) return prev;
      newEquipment[toolId] = { ...inst, deployed: false };
      return { ...prev, equipment: newEquipment };
    });
  }, []);

  // --- Inventory management ---
  const getInventoryItem = useCallback((key: string) => state.inventory[key] ?? 0, [state]);
  const addToInventory = useCallback((key: string, amount: number) => {
    setState((prev) => ({
      ...prev,
      inventory: { ...prev.inventory, [key]: (prev.inventory[key] ?? 0) + amount },
    }));
  }, []);
  const removeFromInventory = useCallback((key: string, amount: number) => {
    setState((prev) => {
      const current = prev.inventory[key] ?? 0;
      if (current < amount) return prev;
      const newInventory = { ...prev.inventory };
      newInventory[key] = current - amount;
      if (newInventory[key] <= 0) delete newInventory[key];
      return { ...prev, inventory: newInventory };
    });
  }, []);

  // --- Zone encounter tracking ---
  const recordZoneEncounter = useCallback(() => {
    setState((prev) => {
      const newZones = { ...prev.zones };
      const inst = newZones[prev.currentZoneId];
      if (!inst) return prev;
      newZones[prev.currentZoneId] = {
        ...inst,
        stormsEncountered: inst.stormsEncountered + 1,
      };
      return { ...prev, zones: newZones };
    });
  }, []);

  // --- Reset ---
  const resetState = useCallback(() => {
    setState(createDefaultState());
  }, []);

  const getState = useCallback(() => state, [state]);

  // --- Storm spawning for current zone ---
  const spawnRandomStorm = useCallback(() => {
    const zone = SC_ZONE_MAP[state.currentZoneId];
    if (!zone) return null;
    const pool = zone.stormPool;
    const stormId = pool[Math.floor(Math.random() * pool.length)];
    const storm = SC_STORM_MAP[stormId];
    if (!storm) return null;
    discoverStorm(stormId);
    recordZoneEncounter();
    return storm;
  }, [state, discoverStorm, recordZoneEncounter]);

  const spawnStormByRarity = useCallback((rarity: ScRarity) => {
    const candidates = SC_STORMS.filter((s) => s.rarity === rarity);
    if (candidates.length === 0) return null;
    const storm = candidates[Math.floor(Math.random() * candidates.length)];
    discoverStorm(storm.id);
    return storm;
  }, [discoverStorm]);

  // --- Multi-storm events ---
  const triggerOutbreak = useCallback(() => {
    const eventStorms: StormDef[] = [];
    const count = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const storm = spawnRandomStorm();
      if (storm) eventStorms.push(storm);
    }
    const xpBonus = count * 10;
    setState((prev) => ({ ...prev, xp: prev.xp + xpBonus }));
    return { storms: eventStorms, bonus: xpBonus };
  }, [spawnRandomStorm]);

  const triggerHurricaneEvent = useCallback(() => {
    const hurricane = SC_STORM_MAP['hurricane'] ?? SC_STORM_MAP['category5-hurricane'];
    if (hurricane) {
      discoverStorm(hurricane.id);
    }
    const phases = ['Formation', 'Intensification', 'Landfall', 'Dissipation'];
    const currentPhase = phases[Math.floor(Math.random() * phases.length)];
    return { storm: hurricane, phase: currentPhase };
  }, [discoverStorm]);

  // --- Misc getters ---
  const getStormRarityCounts = useCallback(() => {
    const counts: Record<ScRarity, { total: number; discovered: number }> = {
      Common: { total: 0, discovered: 0 },
      Uncommon: { total: 0, discovered: 0 },
      Rare: { total: 0, discovered: 0 },
      Epic: { total: 0, discovered: 0 },
      Legendary: { total: 0, discovered: 0 },
    };
    SC_STORMS.forEach((s) => {
      counts[s.rarity].total++;
    });
    state.discoveries.forEach((id) => {
      const storm = SC_STORM_MAP[id];
      if (storm) counts[storm.rarity].discovered++;
    });
    return counts;
  }, [state]);

  const getZoneCompletion = useCallback((zoneId: string) => {
    const zone = SC_ZONE_MAP[zoneId];
    if (!zone) return 0;
    const discovered = zone.stormPool.filter((sid) => state.discoveries.includes(sid)).length;
    return zone.stormPool.length > 0 ? Math.floor((discovered / zone.stormPool.length) * 100) : 0;
  }, [state]);

  const getChaseSuccessRate = useCallback(() => {
    if (state.totalChases === 0) return 0;
    return Math.floor((state.totalChases / Math.max(1, state.totalChases + state.legendarySurvives * 0.1)) * 100);
  }, [state]);

  const getTimeSinceLastChase = useCallback(() => {
    const lastEntry = state.chaseLog[0];
    if (!lastEntry) return null;
    return Date.now() - lastEntry.timestamp;
  }, [state]);

  const getRecentChases = useCallback((count: number) => {
    return state.chaseLog.slice(0, count);
  }, [state]);

  const getToolBonusForCategory = useCallback((category: string) => {
    return SC_TOOLS.filter((t) => t.category === category && state.equipment[t.id]?.deployed)
      .reduce((s, t) => s + t.bonus, 0);
  }, [state]);

  const canTravelTo = useCallback((zoneId: string) => {
    const zone = SC_ZONE_MAP[zoneId];
    if (!zone) return false;
    return state.level >= zone.unlockLevel && state.coins >= zone.travelCost;
  }, [state]);

  const getRecommendedZone = useCallback(() => {
    return SC_ZONES.filter((z) => state.level >= z.unlockLevel)
      .sort((a, b) => b.stormFrequency - a.stormFrequency)[0] ?? SC_ZONES[0];
  }, [state]);

  const getNextUnlock = useCallback(() => {
    const next = SC_ZONES.find((z) => state.level < z.unlockLevel);
    return next ?? null;
  }, [state]);

  const isAbilityReady = useCallback((abilityId: string) => {
    const cd = state.abilityCooldowns[abilityId];
    if (!cd) return false;
    return cd.ready;
  }, [state]);

  // --- Event system ---
  const getActiveEvents = useCallback(() => {
    const events: string[] = [];
    if (state.totalChases > 0 && state.totalChases % 10 === 0) {
      events.push('Milestone Chase — Bonus XP activated');
    }
    if (state.dayStreak >= 3) {
      events.push('Streak Bonus — +25% coin rewards');
    }
    if (state.level >= 15) {
      events.push('Elite Access — Legendary storms can now appear');
    }
    return events;
  }, [state]);

  const getCoinMultiplier = useCallback(() => {
    let mult = 1;
    if (state.dayStreak >= 3) mult += 0.25;
    if (state.dayStreak >= 7) mult += 0.25;
    if (SC_VEHICLES.some((v) => v.id === 'static-harvest' && state.equipment[v.id]?.deployed)) {
      mult += 0.1;
    }
    return mult;
  }, [state]);

  const getXpMultiplier = useCallback(() => {
    let mult = 1;
    if (SC_VEHICLES.some((v) => v.id === 'laptop-station' && state.equipment[v.id]?.deployed)) {
      mult += 0.15;
    }
    return mult;
  }, [state]);

  // --- Serialization helpers ---
  const serialize = useCallback(() => {
    return JSON.stringify(state);
  }, [state]);

  const deserialize = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as StormChaserState;
      setState(parsed);
      return true;
    } catch {
      return false;
    }
  }, []);

  // --- Batch operations ---
  const batchChaseStorms = useCallback((stormIds: string[]) => {
    let totalXp = 0;
    let totalCoins = 0;
    stormIds.forEach((id) => {
      const storm = SC_STORM_MAP[id];
      if (storm) {
        totalXp += Math.floor(storm.xpReward * SC_RARITY_XP_MULTIPLIER[storm.rarity]);
        totalCoins += Math.floor(storm.coinReward * SC_RARITY_COIN_MULTIPLIER[storm.rarity]);
        discoverStorm(id);
      }
    });
    setState((prev) => ({
      ...prev,
      xp: prev.xp + totalXp,
      coins: prev.coins + totalCoins,
      totalCoinsEarned: prev.totalCoinsEarned + totalCoins,
      totalChases: prev.totalChases + stormIds.length,
    }));
    return { totalXp, totalCoins, count: stormIds.length };
  }, [discoverStorm]);

  // --- Weather trivia / lore ---
  const getStormLore = useCallback((stormId: string) => {
    const loreMap: Record<string, string> = {
      'supercell': 'Supercells are the rarest and most dangerous type of thunderstorm, with a rotating updraft called a mesocyclone.',
      'ef5-tornado': 'EF5 tornadoes have winds exceeding 200 mph. Only 59 have been recorded in US history since 1950.',
      'category5-hurricane': 'Category 5 hurricanes sustain winds over 157 mph. The Saffir-Simpson scale has no category beyond 5.',
      'fire-whirl': 'Fire whirls can reach temperatures of 2,000°F and generate wind speeds comparable to EF3 tornadoes.',
      'ball-lightning-swarm': 'Ball lightning remains one of the least understood atmospheric phenomena, with fewer than 10% of scientists believing it exists.',
      'thunder-snow': 'Thundersnow occurs when winter storms produce lightning. The snow muffles the thunder, making it sound like a muffled rumble.',
      'haboob': 'Haboobs can grow to 5,000 feet tall and span 100 miles wide, moving at up to 60 mph across desert landscapes.',
    };
    return loreMap[stormId] ?? 'This storm holds secrets yet to be fully understood by meteorological science.';
  }, []);

  const getZoneLore = useCallback((zoneId: string) => {
    const loreMap: Record<string, string> = {
      'great-plains': 'The Great Plains span from Canada to Texas, offering unobstructed views that make storm spotting a dream.',
      'tornado-alley': 'Tornado Alley sees an average of 1,200 tornadoes per year, more than anywhere else on Earth.',
      'gulf-coast': 'Warm Gulf waters fuel tropical systems that can intensify rapidly, sometimes overnight into hurricanes.',
      'arctic-tundra': 'Arctic weather generates some of the most extreme conditions on the planet, with temperatures below -80°F.',
      'volcanic-island': 'Volcanic islands create their own microclimates, and eruptions can trigger volcanic lightning storms.',
    };
    return loreMap[zoneId] ?? 'A mysterious region with unpredictable weather patterns.';
  }, []);

  const getWeatherTip = useCallback(() => {
    const tips = [
      'When chasing supercells, position yourself southeast of the storm for the best visibility of the updraft.',
      'Never drive into flooded roads — just six inches of moving water can knock you off your feet.',
      'Lightning can strike up to 10 miles away from the main thunderstorm. If you hear thunder, you are in danger.',
      'Tornadoes often change direction unpredictably. Always have an escape route planned.',
      'An anemometer is your best friend — knowing wind speed helps assess danger levels instantly.',
      'The safest place during a tornado is an underground shelter or interior room on the lowest floor.',
      'Hurricanes can produce storm surge up to 20 feet above normal tide levels.',
      'Derecho winds can exceed 100 mph over a path hundreds of miles long.',
      'Hailstones can grow larger than grapefruit in the most severe supercells.',
      'Blizzard conditions combine heavy snow with winds over 35 mph, creating whiteout visibility.',
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }, []);

  // --- Return the hook API ---
  return {
    // State access
    state,
    getState,
    getLevel,
    getXp,
    getMaxXp,
    getXpPercent,
    getCoins,
    getDayStreak,
    getTitle,
    titleInfo,
    getAllTitles,
    getUnlockedTitles,
    // XP & coins
    addXp,
    addCoins,
    spendCoins,
    updateTitle,
    // Storm data
    getStorm,
    getAllStorms,
    getStormsByRarity,
    getStormsByCategory,
    getDiscoveredStorms,
    getUndiscoveredStorms,
    getStormInstance,
    getStormDiscoveryPercent,
    getStormRarityCounts,
    getStormWorth,
    getStormColorByRarity,
    // Zone data
    getZone,
    getAllZones,
    getCurrentZone,
    getCurrentZoneId,
    travelToZone,
    getUnlockedZones,
    getLockedZones,
    getZoneCompletion,
    canTravelTo,
    getRecommendedZone,
    getNextUnlock,
    // Chase mechanics
    chaseStorm,
    observeStorm,
    photographStorm,
    collectDataPoint,
    analyzeWeather,
    spawnRandomStorm,
    spawnStormByRarity,
    triggerOutbreak,
    triggerHurricaneEvent,
    discoverStorm,
    recordZoneEncounter,
    // Tools
    getTool,
    getAllTools,
    getOwnedTools,
    getDeployedTools,
    getToolInstance,
    buyTool,
    deployTool,
    undeployTool,
    getToolBonusForCategory,
    // Vehicles
    getVehicle,
    getAllVehicles,
    getOwnedVehicles,
    getVehiclesByTier,
    getVehicleStats,
    upgradeVehicle,
    // Abilities
    getAbility,
    getAllAbilities,
    getUnlockedAbilities,
    getLockedAbilities,
    getAbilityCooldown,
    isAbilityReady,
    castWeatherAbility,
    tickCooldowns,
    resetCooldowns,
    // Prediction
    predictStorm,
    forecastWeather,
    recordCorrectPrediction,
    // Daily quest
    getDailyQuest,
    getDailyQuestProgress,
    completeDailyQuest,
    refreshDailyQuest,
    incrementDayStreak,
    // Achievements
    getAchievement,
    getAllAchievements,
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementProgress,
    checkAchievements,
    // Stats & analytics
    getStats,
    getInventory,
    getEquipment,
    getChaseLog,
    getOverallPower,
    getDangerRating,
    getRecentChases,
    getChaseSuccessRate,
    getTimeSinceLastChase,
    canAfford,
    getCoinsNeededForLevel,
    // Computed
    rarityDistribution,
    categoryDistribution,
    topChasedStorms,
    mostActiveZone,
    weatherReport,
    stormSeasonForecast,
    powerRank,
    getActiveEvents,
    getCoinMultiplier,
    getXpMultiplier,
    // Inventory management
    getInventoryItem,
    addToInventory,
    removeFromInventory,
    // Equipment management
    repairEquipment,
    upgradeEquipment,
    // Colors
    getPrimaryColor,
    getAccentColor,
    getSecondaryColor,
    getBackgroundColor,
    getDarkBackgroundColor,
    getTextColor,
    // Serialization
    serialize,
    deserialize,
    // Batch
    batchChaseStorms,
    // Lore & tips
    getStormLore,
    getZoneLore,
    getWeatherTip,
    // Reset
    resetState,
    // Raw constants access
    SC_STORMS,
    SC_ZONES,
    SC_TOOLS,
    SC_VEHICLES,
    SC_ABILITIES,
    SC_ACHIEVEMENTS,
    SC_TITLES,
    SC_RARITIES,
    SC_CATEGORIES,
  };
}
