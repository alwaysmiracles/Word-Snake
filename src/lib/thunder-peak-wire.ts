'use client';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';

// ============================================================================
// THUNDER PEAK — Mountain Storm / Weather Magic Adventure Module
// Color theme: electric blue / yellow / white / silver / dark gray
// ============================================================================

// ============================================================================
// SECTION 1: CONSTANTS (all TP_ prefixed)
// ============================================================================

const TP_MAX_LEVEL = 50;
const TP_MAX_STORM_CRYSTALS = 999_999_999;
const TP_MAX_ALTITUDE = 12_500;
const TP_BASE_XP_PER_LEVEL = 120;
const TP_XP_SCALING_FACTOR = 1.18;
const TP_DAILY_FORECAST_COOLDOWN_MS = 86_400_000;
const TP_SPIRIT_COOLDOWN_MS = 60_000;
const TP_ABILITY_COOLDOWN_BASE_MS = 5_000;
const TP_ASCEND_COOLDOWN_MS = 10_000;
const TP_DISCOVERY_RADIUS = 50;
const TP_BATTLE_DURATION_MS = 30_000;
const TP_OXYGEN_DECAY_RATE = 0.4;
const TP_TEMPERATURE_DECAY_PER_ALT = 0.0065;
const TP_STORM_INTENSITY_MAX = 100;

export const TP_THEME_COLORS = {
  electricBlue: '#00b4ff',
  electricYellow: '#ffd700',
  lightningWhite: '#f0f8ff',
  silver: '#c0c0c0',
  darkGray: '#2d2d3d',
  stormPurple: '#6a0dad',
  plasmaGlow: '#7df9ff',
  thunderGold: '#ffcc00',
  abyssBlack: '#0a0a1a',
  auroraGreen: '#00ff87',
  frozenCyan: '#00e5ff',
  emberOrange: '#ff6600',
  cloudGray: '#8e99a4',
  skyWhite: '#e8f4fd',
};

export const TP_RARITY_TIERS = [
  { key: 'common', label: 'Common', color: TP_THEME_COLORS.silver, multiplier: 1.0 },
  { key: 'uncommon', label: 'Uncommon', color: TP_THEME_COLORS.electricBlue, multiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: TP_THEME_COLORS.stormPurple, multiplier: 2.5 },
  { key: 'epic', label: 'Epic', color: TP_THEME_COLORS.electricYellow, multiplier: 4.0 },
  { key: 'legendary', label: 'Legendary', color: TP_THEME_COLORS.plasmaGlow, multiplier: 7.0 },
] as const;

export const TP_MOUNTAIN_TRAILS = [
  {
    id: 'base_camp',
    name: 'Base Camp',
    altitudeRange: [0, 1200],
    difficulty: 1,
    description: 'The starting point of your Thunder Peak journey. Gentle slopes and light breezes.',
    weatherTypes: ['light_rain', 'drizzle', 'fog_bank'],
    creatures: ['storm_rabbit', 'cloud_fox'],
    discoveries: ['weathered_trail_marker', 'abandoned_tent'],
    bossCreature: null,
    unlockLevel: 1,
    rewardCrystals: 10,
    baseXP: 15,
    temperatureBase: 18,
    oxygenLevel: 100,
    hazards: ['mudslides', 'rock_falls'],
    elementalAffinity: 'neutral',
  },
  {
    id: 'lightning_ridge',
    name: 'Lightning Ridge',
    altitudeRange: [1200, 2800],
    difficulty: 2,
    description: 'A jagged ridgeline where static charges build in the air. Lightning strikes are common.',
    weatherTypes: ['thunderstorm', 'lightning_strike', 'drizzle'],
    creatures: ['thunder_wolf', 'spark_falcon'],
    discoveries: ['ancient_lightning_rod', 'crackled_quartz_deposit'],
    bossCreature: 'thunder_wolf_alpha',
    unlockLevel: 5,
    rewardCrystals: 25,
    baseXP: 30,
    temperatureBase: 8,
    oxygenLevel: 82,
    hazards: ['lightning_strikes', 'rock_falls', 'static_shock'],
    elementalAffinity: 'lightning',
  },
  {
    id: 'storm_pass',
    name: 'Storm Pass',
    altitudeRange: [2800, 4400],
    difficulty: 3,
    description: 'A narrow mountain pass where storms collide from two valleys, creating violent weather.',
    weatherTypes: ['thunderstorm', 'tornado', 'hailstorm', 'rainbow'],
    creatures: ['storm_eagle', 'wind_serpent', 'hail_golem'],
    discoveries: ['lost_storm_shrine', 'wind_carved_arch'],
    bossCreature: 'storm_eagle_matriarch',
    unlockLevel: 12,
    rewardCrystals: 55,
    baseXP: 60,
    temperatureBase: -2,
    oxygenLevel: 64,
    hazards: ['high_winds', 'hail', 'tornado_debris'],
    elementalAffinity: 'wind',
  },
  {
    id: 'thunder_spire',
    name: 'Thunder Spire',
    altitudeRange: [4400, 6000],
    difficulty: 4,
    description: 'A towering spire of dark stone that attracts lightning from miles around.',
    weatherTypes: ['lightning_strike', 'ball_lightning', 'saint_elmos_fire', 'aurora'],
    creatures: ['lightning_elemental', 'thunder_bear', 'static_phantom'],
    discoveries: ['ancient_weather_stone', 'electrified_crystal_cave', 'thunder_forge_ruins'],
    bossCreature: 'thunder_bear_ancient',
    unlockLevel: 20,
    rewardCrystals: 100,
    baseXP: 110,
    temperatureBase: -12,
    oxygenLevel: 48,
    hazards: ['continuous_lightning', 'electromagnetic_fields', 'thin_air'],
    elementalAffinity: 'lightning',
  },
  {
    id: 'cyclone_summit',
    name: 'Cyclone Summit',
    altitudeRange: [6000, 7800],
    difficulty: 5,
    description: 'The summit is perpetually surrounded by rotating cyclones. Only the brave dare ascend.',
    weatherTypes: ['tornado', 'hurricane', 'sandstorm', 'derecho'],
    creatures: ['cyclone_mantis', 'storm_giant', 'dust_devil'],
    discoveries: ['cyclone_amulet', 'whispering_wind_artifact', 'summit_weather_station'],
    bossCreature: 'storm_giant_warlord',
    unlockLevel: 28,
    rewardCrystals: 180,
    baseXP: 200,
    temperatureBase: -22,
    oxygenLevel: 34,
    hazards: ['cyclone_winds', 'low_oxygen', 'ice_paths', 'wind_blades'],
    elementalAffinity: 'wind',
  },
  {
    id: 'tempest_peak',
    name: 'Tempest Peak',
    altitudeRange: [7800, 9600],
    difficulty: 6,
    description: 'Where all weather phenomena converge into a single chaotic tempest of unmatched fury.',
    weatherTypes: ['supercell', 'monsoon', 'typhoon', 'ice_storm', 'thundersnow'],
    creatures: ['tempest_dragon', 'frost_phoenix', 'monsoon_spirit'],
    discoveries: ['tempest_crown_shard', 'frozen_lightning_crystal', 'monsoon_chalice'],
    bossCreature: 'tempest_dragon_prime',
    unlockLevel: 35,
    rewardCrystals: 300,
    baseXP: 350,
    temperatureBase: -35,
    oxygenLevel: 22,
    hazards: ['all_weather_types', 'extreme_cold', 'near_vacuum', 'whiteout'],
    elementalAffinity: 'storm',
  },
  {
    id: 'eye_of_storm',
    name: 'Eye of the Storm',
    altitudeRange: [9600, 11200],
    difficulty: 7,
    description: 'The mythical calm center of the eternal storm. Ancient weather magic radiates from here.',
    weatherTypes: ['aurora', 'volcanic_lightning', 'cosmic_tempest', 'moonbow'],
    creatures: ['sky_leviathan', 'weather_sage', 'aurora_wraith'],
    discoveries: ['eye_of_storm_relic', 'weather_control_orb', 'ancient_storm_tablet'],
    bossCreature: 'sky_leviathan_elder',
    unlockLevel: 42,
    rewardCrystals: 500,
    baseXP: 550,
    temperatureBase: -50,
    oxygenLevel: 12,
    hazards: ['sudden_storm_walls', 'temporal_distortions', 'magnetic_anomalies'],
    elementalAffinity: 'cosmic',
  },
  {
    id: 'apex_eternity',
    name: 'Apex Eternity',
    altitudeRange: [11200, 12500],
    difficulty: 8,
    description: 'The absolute peak of Thunder Peak. Here, reality bends and plasma storms rage eternal.',
    weatherTypes: ['plasma_storm', 'cosmic_tempest', 'volcanic_lightning', 'fire_whirl'],
    creatures: ['plasma_titan', 'eternal_storm_guardian', 'thunder_god_avatar'],
    discoveries: ['apex_eternal_crown', 'storm_god_echo', 'eternal_weather_matrix'],
    bossCreature: 'plasma_titan_prime',
    unlockLevel: 48,
    rewardCrystals: 1000,
    baseXP: 1000,
    temperatureBase: -70,
    oxygenLevel: 5,
    hazards: ['plasma_discharges', 'cosmic_radiation', 'reality_fractures', 'zero_visibility'],
    elementalAffinity: 'plasma',
  },
] as const;

export const TP_WEATHER_PHENOMENA = [
  // Common (6)
  { id: 'light_rain', name: 'Light Rain', tier: 'common', power: 5, description: 'A gentle shower that nourishes the mountain slopes.', icon: '🌧️', element: 'water' },
  { id: 'drizzle', name: 'Drizzle', tier: 'common', power: 3, description: 'Fine mist-like rain that veils the landscape.', icon: '🌦️', element: 'water' },
  { id: 'fog_bank', name: 'Fog Bank', tier: 'common', power: 4, description: 'A dense fog that obscures vision and muffles sound.', icon: '🌫️', element: 'air' },
  { id: 'rainbow', name: 'Rainbow', tier: 'common', power: 7, description: 'A prismatic arc of light that appears after storms.', icon: '🌈', element: 'light' },
  { id: 'sun_dog', name: 'Sun Dog', tier: 'common', power: 6, description: 'Bright spots of light flanking the sun, created by ice crystals.', icon: '☀️', element: 'light' },
  { id: 'hailstorm', name: 'Hailstorm', tier: 'common', power: 18, description: 'A violent storm of ice pellets ranging from pea to grapefruit size.', icon: '🧊', element: 'ice' },
  // Uncommon (6)
  { id: 'thunderstorm', name: 'Thunderstorm', tier: 'uncommon', power: 25, description: 'A classic storm with thunder, lightning, and heavy rain.', icon: '⛈️', element: 'storm' },
  { id: 'lightning_strike', name: 'Lightning Strike', tier: 'uncommon', power: 35, description: 'A focused bolt of lightning striking the mountainside.', icon: '⚡', element: 'lightning' },
  { id: 'tornado', name: 'Tornado', tier: 'uncommon', power: 40, description: 'A violent rotating column of air touching the ground.', icon: '🌪️', element: 'wind' },
  { id: 'sandstorm', name: 'Sandstorm', tier: 'uncommon', power: 22, description: 'A wall of sand and dust driven by powerful winds.', icon: '🏜️', element: 'earth' },
  { id: 'fog_bank_thick', name: 'Fog Bank', tier: 'uncommon', power: 15, description: 'An unnaturally thick fog that seems almost alive.', icon: '🌫️', element: 'air' },
  { id: 'moonbow', name: 'Moonbow', tier: 'uncommon', power: 20, description: 'A rare rainbow created by moonlight on water droplets.', icon: '🌙', element: 'light' },
  // Rare (6)
  { id: 'hurricane', name: 'Hurricane', tier: 'rare', power: 55, description: 'A massive tropical cyclone with sustained winds over 74 mph.', icon: '🌀', element: 'storm' },
  { id: 'blizzard', name: 'Blizzard', tier: 'rare', power: 48, description: 'A severe snowstorm with winds exceeding 35 mph and low visibility.', icon: '❄️', element: 'ice' },
  { id: 'waterspout', name: 'Waterspout', tier: 'rare', power: 38, description: 'A tornado over water, pulling sea spray into a towering column.', icon: '🌊', element: 'water' },
  { id: 'ball_lightning', name: 'Ball Lightning', tier: 'rare', power: 50, description: 'A mysterious floating sphere of electrical energy.', icon: '🔮', element: 'lightning' },
  { id: 'saint_elmos_fire', name: "Saint Elmo's Fire", tier: 'rare', power: 32, description: 'A bright electric discharge on pointed objects during storms.', icon: '✨', element: 'lightning' },
  { id: 'aurora', name: 'Aurora', tier: 'rare', power: 45, description: 'Dancing curtains of light in the polar sky.', icon: '🌌', element: 'cosmic' },
  // Epic (5)
  { id: 'supercell', name: 'Supercell', tier: 'epic', power: 70, description: 'The most powerful type of thunderstorm with a rotating updraft.', icon: '🌪️', element: 'storm' },
  { id: 'derecho', name: 'Derecho', tier: 'epic', power: 65, description: 'A widespread, long-lived wind storm associated with rapidly moving thunderstorms.', icon: '💨', element: 'wind' },
  { id: 'haboob', name: 'Haboob', tier: 'epic', power: 58, description: 'A massive wall of dust driven by thunderstorm outflow.', icon: '🏜️', element: 'earth' },
  { id: 'monsoon', name: 'Monsoon', tier: 'epic', power: 60, description: 'A seasonal reversing wind accompanied by corresponding changes in precipitation.', icon: '🌧️', element: 'water' },
  { id: 'typhoon', name: 'Typhoon', tier: 'epic', power: 72, description: 'A mature tropical cyclone in the western Pacific, the most powerful on Earth.', icon: '🌀', element: 'storm' },
  // Legendary (5)
  { id: 'ice_storm', name: 'Ice Storm', tier: 'legendary', power: 62, description: 'A storm where freezing rain coats everything in a thick layer of ice.', icon: '🧊', element: 'ice' },
  { id: 'thundersnow', name: 'Thundersnow', tier: 'legendary', power: 68, description: 'A rare thunderstorm with snow instead of rain.', icon: '⛄', element: 'storm' },
  { id: 'fire_whirl', name: 'Fire Whirl', tier: 'legendary', power: 80, description: 'A whirlwind of flame created by intense heat and turbulent wind conditions.', icon: '🔥', element: 'fire' },
  { id: 'volcanic_lightning', name: 'Volcanic Lightning', tier: 'legendary', power: 85, description: 'Lightning generated within volcanic ash plumes, called a dirty thunderstorm.', icon: '🌋', element: 'fire' },
  { id: 'plasma_storm', name: 'Plasma Storm', tier: 'legendary', power: 95, description: 'A storm of superheated ionized gas with electromagnetic properties beyond comprehension.', icon: '⚡', element: 'plasma' },
] as const;

// Pad to 28 with the two remaining
export const TP_ALL_WEATHER = [...TP_WEATHER_PHENOMENA] as const;

export const TP_LIGHTNING_ABILITIES = [
  { id: 'chain_lightning', name: 'Chain Lightning', description: 'A bolt that arcs between multiple enemies.', damage: 30, cooldown: 8000, manaCost: 15, unlockLevel: 1, element: 'lightning', icon: '⚡', range: 'medium', chainCount: 3, isAOE: false },
  { id: 'thunder_clap', name: 'Thunder Clap', description: 'A deafening shockwave that stuns nearby enemies.', damage: 20, cooldown: 12000, manaCost: 20, unlockLevel: 3, element: 'sound', icon: '📢', range: 'close', chainCount: 0, isAOE: true },
  { id: 'static_field', name: 'Static Field', description: 'Creates a zone of crackling static energy.', damage: 10, cooldown: 15000, manaCost: 25, unlockLevel: 5, element: 'lightning', icon: '🔋', range: 'area', chainCount: 0, isAOE: true },
  { id: 'storm_surge', name: 'Storm Surge', description: 'Unleashes a wave of storm energy in a direction.', damage: 45, cooldown: 10000, manaCost: 30, unlockLevel: 8, element: 'storm', icon: '🌊', range: 'long', chainCount: 0, isAOE: true },
  { id: 'lightning_rod', name: 'Lightning Rod', description: 'Summons a bolt from the sky to a target location.', damage: 60, cooldown: 20000, manaCost: 35, unlockLevel: 10, element: 'lightning', icon: '🗼', range: 'targeted', chainCount: 0, isAOE: false },
  { id: 'thunder_shield', name: 'Thunder Shield', description: 'Wraps the caster in a protective electrical barrier.', damage: 0, cooldown: 25000, manaCost: 40, unlockLevel: 12, element: 'lightning', icon: '🛡️', range: 'self', chainCount: 0, isAOE: false },
  { id: 'gale_force', name: 'Gale Force', description: 'Channels powerful winds to push enemies back.', damage: 25, cooldown: 9000, manaCost: 18, unlockLevel: 14, element: 'wind', icon: '💨', range: 'cone', chainCount: 0, isAOE: true },
  { id: 'frost_bolt', name: 'Frost Bolt', description: 'Launches a bolt of freezing energy.', damage: 35, cooldown: 7000, manaCost: 22, unlockLevel: 16, element: 'ice', icon: '🧊', range: 'medium', chainCount: 0, isAOE: false },
  { id: 'thunder_step', name: 'Thunder Step', description: 'Teleports through a lightning bolt to a nearby position.', damage: 15, cooldown: 6000, manaCost: 28, unlockLevel: 18, element: 'lightning', icon: '💨', range: 'self', chainCount: 0, isAOE: false },
  { id: 'storm_call', name: 'Storm Call', description: 'Summons a localized thunderstorm over an area.', damage: 50, cooldown: 30000, manaCost: 50, unlockLevel: 20, element: 'storm', icon: '⛈️', range: 'area', chainCount: 0, isAOE: true },
  { id: 'lightning_fury', name: 'Lightning Fury', description: 'Rapidly fires multiple small lightning bolts.', damage: 12, cooldown: 4000, manaCost: 12, unlockLevel: 22, element: 'lightning', icon: '⚡', range: 'rapid', chainCount: 5, isAOE: false },
  { id: 'hail_barrage', name: 'Hail Barrage', description: 'Calls down a devastating hail of ice chunks.', damage: 40, cooldown: 18000, manaCost: 35, unlockLevel: 24, element: 'ice', icon: '🌨️', range: 'area', chainCount: 0, isAOE: true },
  { id: 'wind_shear', name: 'Wind Shear', description: 'A razor-sharp current of air that slices through enemies.', damage: 38, cooldown: 8000, manaCost: 20, unlockLevel: 26, element: 'wind', icon: '🗡️', range: 'medium', chainCount: 0, isAOE: false },
  { id: 'eye_of_storm_spell', name: 'Eye of the Storm', description: 'Creates a calm zone that reflects all projectiles.', damage: 0, cooldown: 35000, manaCost: 55, unlockLevel: 28, element: 'storm', icon: '👁️', range: 'self', chainCount: 0, isAOE: false },
  { id: 'plasma_discharge', name: 'Plasma Discharge', description: 'Releases a burst of superheated plasma.', damage: 70, cooldown: 25000, manaCost: 45, unlockLevel: 30, element: 'plasma', icon: '☄️', range: 'cone', chainCount: 0, isAOE: true },
  { id: 'tempest_avatar', name: 'Tempest Avatar', description: 'Transforms into a being of pure storm energy temporarily.', damage: 0, cooldown: 60000, manaCost: 80, unlockLevel: 33, element: 'storm', icon: '🌀', range: 'self', chainCount: 0, isAOE: false },
  { id: 'cosmic_ray', name: 'Cosmic Ray', description: 'Channels a beam of cosmic energy from the heavens.', damage: 90, cooldown: 45000, manaCost: 60, unlockLevel: 36, element: 'cosmic', icon: '🌠', range: 'beam', chainCount: 0, isAOE: false },
  { id: 'avalanche_call', name: 'Avalanche Call', description: 'Triggers a controlled avalanche of snow and rock.', damage: 55, cooldown: 30000, manaCost: 40, unlockLevel: 38, element: 'earth', icon: '🏔️', range: 'area', chainCount: 0, isAOE: true },
  { id: 'thunder_god_blessing', name: 'Thunder God Blessing', description: 'Temporarily doubles all storm damage dealt.', damage: 0, cooldown: 90000, manaCost: 70, unlockLevel: 40, element: 'lightning', icon: '👑', range: 'self', chainCount: 0, isAOE: false },
  { id: 'supercell_vortex', name: 'Supercell Vortex', description: 'Creates a massive rotating storm vortex that pulls enemies in.', damage: 65, cooldown: 40000, manaCost: 65, unlockLevel: 42, element: 'storm', icon: '🌪️', range: 'area', chainCount: 0, isAOE: true },
  { id: 'frozen_lightning', name: 'Frozen Lightning', description: 'A hybrid of ice and lightning that freezes and shocks simultaneously.', damage: 75, cooldown: 28000, manaCost: 50, unlockLevel: 44, element: 'ice', icon: '❄️', range: 'medium', chainCount: 2, isAOE: false },
  { id: 'apex_judgment', name: 'Apex Judgment', description: 'The ultimate ability. Channels all storm elements into a devastating final strike.', damage: 150, cooldown: 120000, manaCost: 100, unlockLevel: 48, element: 'plasma', icon: '⚡', range: 'ultimate', chainCount: 0, isAOE: true },
] as const;

export const TP_STORM_SPIRITS = [
  {
    id: 'zephyr',
    name: 'Zephyr',
    title: 'The Gentle Breeze',
    element: 'wind',
    rarity: 'common',
    description: 'A playful spirit of the west wind. Helpful for navigation and reducing fatigue.',
    bonus: { type: 'stamina_recovery', value: 15 },
    summonCost: 20,
    friendshipMax: 100,
    unlockLevel: 2,
    passiveAbility: 'Reduces altitude fatigue by 15%.',
    activeAbility: 'Whispers the safest path ahead for 30 seconds.',
    icon: '🌬️',
  },
  {
    id: 'tempest',
    name: 'Tempest',
    title: 'The Furious Gale',
    element: 'storm',
    rarity: 'uncommon',
    description: 'A fierce spirit born from the heart of thunderstorms. Grants offensive power.',
    bonus: { type: 'storm_damage', value: 12 },
    summonCost: 45,
    friendshipMax: 150,
    unlockLevel: 8,
    passiveAbility: 'Increases storm ability damage by 12%.',
    activeAbility: 'Creates a shockwave that damages all nearby enemies.',
    icon: '⛈️',
  },
  {
    id: 'cyclone',
    name: 'Cyclone',
    title: 'The Spiraling Vortex',
    element: 'wind',
    rarity: 'uncommon',
    description: 'A spinning spirit of immense speed. Excels at evasion and crowd control.',
    bonus: { type: 'dodge_chance', value: 10 },
    summonCost: 40,
    friendshipMax: 150,
    unlockLevel: 14,
    passiveAbility: 'Increases dodge chance by 10%.',
    activeAbility: 'Creates a tornado that lifts enemies into the air for 3 seconds.',
    icon: '🌪️',
  },
  {
    id: 'thunderbird',
    name: 'Thunderbird',
    title: 'The Sky Sentinel',
    element: 'lightning',
    rarity: 'rare',
    description: 'A majestic avian spirit that commands the power of lightning strikes.',
    bonus: { type: 'lightning_damage', value: 18 },
    summonCost: 80,
    friendshipMax: 200,
    unlockLevel: 20,
    passiveAbility: 'Increases lightning ability damage by 18%.',
    activeAbility: 'Summons a devastating lightning strike on all visible enemies.',
    icon: '🦅',
  },
  {
    id: 'frost_wraith',
    name: 'Frost Wraith',
    title: 'The Ice Phantom',
    element: 'ice',
    rarity: 'rare',
    description: 'A ghostly spirit of ancient glacial ice. Slows and freezes enemies.',
    bonus: { type: 'freeze_duration', value: 20 },
    summonCost: 75,
    friendshipMax: 200,
    unlockLevel: 25,
    passiveAbility: 'Increases freeze duration by 20%.',
    activeAbility: 'Freeszes all enemies in a 20-meter radius for 4 seconds.',
    icon: '👻',
  },
  {
    id: 'storm_dragon_whelp',
    name: 'Storm Dragon Whelp',
    title: 'The Emerging Tempest',
    element: 'storm',
    rarity: 'epic',
    description: 'A young dragon spirit with immense potential. Its breath carries the power of storms.',
    bonus: { type: 'all_damage', value: 15 },
    summonCost: 150,
    friendshipMax: 300,
    unlockLevel: 32,
    passiveAbility: 'Increases all ability damage by 15%.',
    activeAbility: 'Breathes a cone of storm energy dealing massive damage.',
    icon: '🐉',
  },
  {
    id: 'plasma_serpent',
    name: 'Plasma Serpent',
    title: 'The Living Current',
    element: 'plasma',
    rarity: 'epic',
    description: 'A serpentine entity made of pure plasma energy. Both beautiful and deadly.',
    bonus: { type: 'mana_regen', value: 25 },
    summonCost: 180,
    friendshipMax: 300,
    unlockLevel: 38,
    passiveAbility: 'Increases mana regeneration by 25%.',
    activeAbility: 'Wraps around the caster, creating a plasma shield that reflects damage.',
    icon: '🐍',
  },
  {
    id: 'apex_spirit',
    name: 'Apex Spirit',
    title: 'The Eternal Storm God',
    element: 'plasma',
    rarity: 'legendary',
    description: 'The primordial spirit of Thunder Peak itself. Master of all weather phenomena.',
    bonus: { type: 'all_stats', value: 30 },
    summonCost: 500,
    friendshipMax: 500,
    unlockLevel: 48,
    passiveAbility: 'Increases ALL stats by 30% while active.',
    activeAbility: 'Unleashes the full fury of Thunder Peak, devastating everything in sight.',
    icon: '👑',
  },
] as const;

export const TP_EQUIPMENT_ITEMS = [
  { id: 'storm_gauntlets', name: 'Storm Gauntlets', type: 'hands', rarity: 'common', stats: { lightningPower: 3, defense: 2 }, description: 'Gauntlets imbued with basic storm energy.', cost: 30, levelReq: 1, icon: '🧤' },
  { id: 'lightning_rod_staff', name: 'Lightning Rod Staff', type: 'weapon', rarity: 'common', stats: { lightningPower: 5, manaRegen: 1 }, description: 'A staff topped with a conductive lightning rod.', cost: 50, levelReq: 2, icon: '🪄' },
  { id: 'weather_compass', name: 'Weather Compass', type: 'accessory', rarity: 'uncommon', stats: { prediction: 5, luck: 2 }, description: 'Points toward the nearest weather phenomenon.', cost: 75, levelReq: 5, icon: '🧭' },
  { id: 'storm_cloak', name: 'Storm Cloak', type: 'armor', rarity: 'uncommon', stats: { defense: 8, windResist: 5 }, description: 'A cloak woven from storm clouds.', cost: 80, levelReq: 6, icon: '🧥' },
  { id: 'thunder_boots', name: 'Thunder Boots', type: 'feet', rarity: 'uncommon', stats: { speed: 6, dodge: 3 }, description: 'Boots that crackle with each step.', cost: 70, levelReq: 8, icon: '👢' },
  { id: 'crystal_amulet', name: 'Crystal Amulet', type: 'accessory', rarity: 'rare', stats: { stormPower: 10, manaMax: 20 }, description: 'An amulet containing a purified storm crystal.', cost: 150, levelReq: 10, icon: '📿' },
  { id: 'cyclone_helm', name: 'Cyclone Helm', type: 'head', rarity: 'rare', stats: { defense: 12, windResist: 10 }, description: 'A helmet that generates a miniature cyclone for protection.', cost: 180, levelReq: 14, icon: '⛑️' },
  { id: 'blizzard_ring', name: 'Blizzard Ring', type: 'accessory', rarity: 'rare', stats: { icePower: 12, freezeChance: 5 }, description: 'A ring that radiates freezing energy.', cost: 160, levelReq: 16, icon: '💍' },
  { id: 'storm_breaker_sword', name: 'Storm Breaker Sword', type: 'weapon', rarity: 'epic', stats: { lightningPower: 20, attackSpeed: 8 }, description: 'A legendary sword forged in the heart of a thunderstorm.', cost: 350, levelReq: 22, icon: '⚔️' },
  { id: 'tempest_chestplate', name: 'Tempest Chestplate', type: 'armor', rarity: 'epic', stats: { defense: 25, stormResist: 15 }, description: 'Armor that can withstand the fury of a tempest.', cost: 400, levelReq: 26, icon: '🛡️' },
  { id: 'wind_walker_sandals', name: 'Wind Walker Sandals', type: 'feet', rarity: 'epic', stats: { speed: 15, dodge: 12 }, description: 'Sandals enchanted to walk on wind currents.', cost: 320, levelReq: 28, icon: '🥿' },
  { id: 'thunder_drum', name: 'Thunder Drum', type: 'accessory', rarity: 'epic', stats: { soundPower: 18, stunChance: 8 }, description: 'A drum whose beat summons thunder from the sky.', cost: 300, levelReq: 30, icon: '🥁' },
  { id: 'frost_forged_gauntlets', name: 'Frost Forged Gauntlets', type: 'hands', rarity: 'epic', stats: { icePower: 16, attackSpeed: 6 }, description: 'Gauntlets forged in glacial ice and lightning.', cost: 280, levelReq: 32, icon: '🧤' },
  { id: 'aurora_crown', name: 'Aurora Crown', type: 'head', rarity: 'legendary', stats: { stormPower: 25, manaMax: 50 }, description: 'A crown that shimmers with aurora light.', cost: 700, levelReq: 36, icon: '👑' },
  { id: 'plasma_core_shield', name: 'Plasma Core Shield', type: 'shield', rarity: 'legendary', stats: { defense: 35, reflectDamage: 15 }, description: 'A shield with a contained plasma core.', cost: 800, levelReq: 38, icon: '🔰' },
  { id: 'cosmic_map', name: 'Cosmic Map', type: 'accessory', rarity: 'legendary', stats: { prediction: 20, luck: 15 }, description: 'A map that shows weather patterns across dimensions.', cost: 650, levelReq: 40, icon: '🗺️' },
  { id: 'thunder_god_gauntlets', name: 'Thunder God Gauntlets', type: 'hands', rarity: 'legendary', stats: { lightningPower: 30, chainDamage: 20 }, description: 'Gauntlets said to be worn by the Thunder God himself.', cost: 900, levelReq: 42, icon: '🧤' },
  { id: 'eye_of_storm_pendant', name: 'Eye of the Storm Pendant', type: 'accessory', rarity: 'legendary', stats: { allResist: 20, dodge: 15 }, description: 'A pendant containing the calm center of a storm.', cost: 750, levelReq: 44, icon: '📿' },
  { id: 'apex_eternal_armor', name: 'Apex Eternal Armor', type: 'armor', rarity: 'legendary', stats: { defense: 45, allResist: 25 }, description: 'The ultimate armor forged at Thunder Peak summit.', cost: 1200, levelReq: 48, icon: '🛡️' },
  { id: 'storm_matrix_orb', name: 'Storm Matrix Orb', type: 'accessory', rarity: 'legendary', stats: { allPower: 20, manaRegen: 15 }, description: 'An orb containing the fundamental matrix of all storms.', cost: 1500, levelReq: 50, icon: '🔮' },
] as const;

export const TP_STORM_CREATURES = [
  { id: 'storm_rabbit', name: 'Storm Rabbit', element: 'wind', hp: 20, damage: 3, speed: 12, xpReward: 8, crystalsReward: 2, rarity: 'common', description: 'A small rabbit that rides on gusts of wind.', icon: '🐰', difficulty: 1 },
  { id: 'cloud_fox', name: 'Cloud Fox', element: 'air', hp: 35, damage: 6, speed: 15, xpReward: 12, crystalsReward: 4, rarity: 'common', description: 'A fox that blends perfectly with clouds.', icon: '🦊', difficulty: 1 },
  { id: 'thunder_wolf', name: 'Thunder Wolf', element: 'lightning', hp: 60, damage: 12, speed: 14, xpReward: 20, crystalsReward: 6, rarity: 'uncommon', description: 'A wolf with crackling lightning in its fur.', icon: '🐺', difficulty: 2 },
  { id: 'spark_falcon', name: 'Spark Falcon', element: 'lightning', hp: 40, damage: 15, speed: 22, xpReward: 25, crystalsReward: 8, rarity: 'uncommon', description: 'A falcon that dives at the speed of lightning.', icon: '🦅', difficulty: 2 },
  { id: 'storm_eagle', name: 'Storm Eagle', element: 'storm', hp: 90, damage: 20, speed: 18, xpReward: 40, crystalsReward: 12, rarity: 'rare', description: 'A massive eagle that commands storm clouds.', icon: '🦅', difficulty: 3 },
  { id: 'wind_serpent', name: 'Wind Serpent', element: 'wind', hp: 70, damage: 18, speed: 20, xpReward: 35, crystalsReward: 10, rarity: 'rare', description: 'A serpentine creature that moves through air currents.', icon: '🐍', difficulty: 3 },
  { id: 'hail_golem', name: 'Hail Golem', element: 'ice', hp: 150, damage: 25, speed: 4, xpReward: 45, crystalsReward: 14, rarity: 'rare', description: 'A golem constructed entirely from solid hail.', icon: '🗿', difficulty: 3 },
  { id: 'lightning_elemental', name: 'Lightning Elemental', element: 'lightning', hp: 80, damage: 30, speed: 25, xpReward: 55, crystalsReward: 18, rarity: 'epic', description: 'A being of pure electrical energy.', icon: '⚡', difficulty: 4 },
  { id: 'thunder_bear', name: 'Thunder Bear', element: 'lightning', hp: 200, damage: 35, speed: 8, xpReward: 60, crystalsReward: 20, rarity: 'epic', description: 'An enormous bear whose roar triggers thunder.', icon: '🐻', difficulty: 4 },
  { id: 'static_phantom', name: 'Static Phantom', element: 'lightning', hp: 60, damage: 28, speed: 30, xpReward: 50, crystalsReward: 16, rarity: 'epic', description: 'A ghost that appears as a blur of static electricity.', icon: '👻', difficulty: 4 },
  { id: 'cyclone_mantis', name: 'Cyclone Mantis', element: 'wind', hp: 100, damage: 40, speed: 28, xpReward: 70, crystalsReward: 25, rarity: 'epic', description: 'A praying mantis that generates cyclones with its wings.', icon: '🦗', difficulty: 5 },
  { id: 'storm_giant', name: 'Storm Giant', element: 'storm', hp: 500, damage: 55, speed: 6, xpReward: 100, crystalsReward: 40, rarity: 'epic', description: 'A colossal giant whose footsteps create storms.', icon: '👹', difficulty: 5 },
  { id: 'dust_devil', name: 'Dust Devil', element: 'earth', hp: 50, damage: 15, speed: 35, xpReward: 30, crystalsReward: 10, rarity: 'uncommon', description: 'A small mischievous whirlwind of dust.', icon: '🌪️', difficulty: 2 },
  { id: 'tempest_dragon', name: 'Tempest Dragon', element: 'storm', hp: 800, damage: 70, speed: 16, xpReward: 150, crystalsReward: 60, rarity: 'legendary', description: 'A dragon whose wings span storm clouds across the horizon.', icon: '🐉', difficulty: 6 },
  { id: 'frost_phoenix', name: 'Frost Phoenix', element: 'ice', hp: 300, damage: 50, speed: 22, xpReward: 120, crystalsReward: 45, rarity: 'legendary', description: 'A phoenix reborn in glacial fire and ice.', icon: '🦚', difficulty: 6 },
] as const;

export const TP_DISCOVERIES = [
  { id: 'weathered_trail_marker', name: 'Weathered Trail Marker', type: 'landmark', trail: 'base_camp', description: 'An old wooden marker barely legible under years of weathering.', rarity: 'common', crystalsReward: 5, xpReward: 10, icon: '🪧' },
  { id: 'abandoned_tent', name: 'Abandoned Tent', type: 'camp', trail: 'base_camp', description: 'A tent left behind by a previous explorer. Contains basic supplies.', rarity: 'common', crystalsReward: 8, xpReward: 15, icon: '⛺' },
  { id: 'ancient_lightning_rod', name: 'Ancient Lightning Rod', type: 'artifact', trail: 'lightning_ridge', description: 'A metal rod from an ancient civilization, still conducting electricity.', rarity: 'uncommon', crystalsReward: 15, xpReward: 25, icon: '🗼' },
  { id: 'crackled_quartz_deposit', name: 'Crackled Quartz Deposit', type: 'mineral', trail: 'lightning_ridge', description: 'Quartz crystals permanently charged with static electricity.', rarity: 'uncommon', crystalsReward: 20, xpReward: 30, icon: '💎' },
  { id: 'lost_storm_shrine', name: 'Lost Storm Shrine', type: 'shrine', trail: 'storm_pass', description: 'A forgotten shrine dedicated to an ancient storm deity.', rarity: 'rare', crystalsReward: 35, xpReward: 50, icon: '⛩️' },
  { id: 'wind_carved_arch', name: 'Wind Carved Arch', type: 'formation', trail: 'storm_pass', description: 'A natural arch carved by millennia of relentless wind.', rarity: 'rare', crystalsReward: 30, xpReward: 45, icon: '🌄' },
  { id: 'ancient_weather_stone', name: 'Ancient Weather Stone', type: 'artifact', trail: 'thunder_spire', description: 'A mysterious stone tablet inscribed with weather prediction runes.', rarity: 'rare', crystalsReward: 50, xpReward: 70, icon: '🪨' },
  { id: 'electrified_crystal_cave', name: 'Electrified Crystal Cave', type: 'cave', trail: 'thunder_spire', description: 'A cave system filled with naturally luminescent, electrified crystals.', rarity: 'epic', crystalsReward: 80, xpReward: 100, icon: '🫧' },
  { id: 'thunder_forge_ruins', name: 'Thunder Forge Ruins', type: 'ruin', trail: 'thunder_spire', description: 'The remains of a forge that once crafted weapons from storm energy.', rarity: 'epic', crystalsReward: 100, xpReward: 120, icon: '🏚️' },
  { id: 'cyclone_amulet', name: 'Cyclone Amulet', type: 'treasure', trail: 'cyclone_summit', description: 'An amulet that hums with the power of contained cyclones.', rarity: 'epic', crystalsReward: 120, xpReward: 140, icon: '📿' },
  { id: 'whispering_wind_artifact', name: 'Whispering Wind Artifact', type: 'artifact', trail: 'cyclone_summit', description: 'An ancient device that translates wind patterns into speech.', rarity: 'rare', crystalsReward: 60, xpReward: 80, icon: '📯' },
  { id: 'summit_weather_station', name: 'Summit Weather Station', type: 'structure', trail: 'cyclone_summit', description: 'A modern weather station somehow established at extreme altitude.', rarity: 'uncommon', crystalsReward: 40, xpReward: 60, icon: '📡' },
  { id: 'tempest_crown_shard', name: 'Tempest Crown Shard', type: 'treasure', trail: 'tempest_peak', description: 'A fragment of the legendary Tempest Crown, radiating storm energy.', rarity: 'legendary', crystalsReward: 200, xpReward: 200, icon: '👑' },
  { id: 'frozen_lightning_crystal', name: 'Frozen Lightning Crystal', type: 'mineral', trail: 'tempest_peak', description: 'Lightning permanently suspended in an impossible ice crystal.', rarity: 'legendary', crystalsReward: 250, xpReward: 250, icon: '❄️' },
  { id: 'monsoon_chalice', name: 'Monsoon Chalice', type: 'treasure', trail: 'tempest_peak', description: 'A chalice that never empties, always filled with rainwater.', rarity: 'epic', crystalsReward: 150, xpReward: 160, icon: '🏆' },
  { id: 'eye_of_storm_relic', name: 'Eye of the Storm Relic', type: 'artifact', trail: 'eye_of_storm', description: 'The centerpiece of all weather control magic on Thunder Peak.', rarity: 'legendary', crystalsReward: 400, xpReward: 350, icon: '👁️' },
  { id: 'weather_control_orb', name: 'Weather Control Orb', type: 'artifact', trail: 'eye_of_storm', description: 'A sphere that allows manipulation of local weather patterns.', rarity: 'legendary', crystalsReward: 500, xpReward: 400, icon: '🔮' },
  { id: 'ancient_storm_tablet', name: 'Ancient Storm Tablet', type: 'lore', trail: 'eye_of_storm', description: 'Contains the complete history of Thunder Peak written in storm runes.', rarity: 'epic', crystalsReward: 180, xpReward: 180, icon: '📜' },
  { id: 'apex_eternal_crown', name: 'Apex Eternal Crown', type: 'treasure', trail: 'apex_eternity', description: 'The crown of the Storm God, granting mastery over all weather.', rarity: 'legendary', crystalsReward: 1000, xpReward: 800, icon: '👑' },
  { id: 'storm_god_echo', name: 'Storm God Echo', type: 'entity', trail: 'apex_eternity', description: 'A lingering echo of the Storm God\'s consciousness.', rarity: 'legendary', crystalsReward: 750, xpReward: 600, icon: '👼' },
  { id: 'eternal_weather_matrix', name: 'Eternal Weather Matrix', type: 'artifact', trail: 'apex_eternity', description: 'The fundamental code underlying all weather in existence.', rarity: 'legendary', crystalsReward: 1500, xpReward: 1000, icon: '✨' },
  { id: 'hidden_mountain_spring', name: 'Hidden Mountain Spring', type: 'nature', trail: 'base_camp', description: 'A crystal-clear spring fed by glacial meltwater.', rarity: 'common', crystalsReward: 5, xpReward: 10, icon: '💧' },
  { id: 'thunderbird_nest', name: 'Thunderbird Nest', type: 'nest', trail: 'storm_pass', description: 'A massive nest at the top of a lightning-struck tree.', rarity: 'rare', crystalsReward: 45, xpReward: 55, icon: '🪺' },
  { id: 'storm_giant_footprint', name: 'Storm Giant Footprint', type: 'track', trail: 'cyclone_summit', description: 'An enormous footprint filled with swirling storm clouds.', rarity: 'epic', crystalsReward: 90, xpReward: 110, icon: '👣' },
  { id: 'plasma_geyser', name: 'Plasma Geyser', type: 'formation', trail: 'apex_eternity', description: 'A geyser that erupts with superheated plasma instead of water.', rarity: 'legendary', crystalsReward: 600, xpReward: 500, icon: '🌋' },
] as const;

export const TP_ACHIEVEMENTS = [
  { id: 'first_ascent', name: 'First Ascent', description: 'Begin your journey on Thunder Peak.', condition: 'ascend_trail_1_time', xpReward: 20, crystalsReward: 10, icon: '🏔️' },
  { id: 'storm_newborn', name: 'Storm Newborn', description: 'Cast your first weather spell.', condition: 'cast_spell_1_time', xpReward: 30, crystalsReward: 15, icon: '⚡' },
  { id: 'trailblazer', name: 'Trailblazer', description: 'Ascend all 8 mountain trails at least once.', condition: 'ascend_all_trails', xpReward: 200, crystalsReward: 100, icon: '🥾' },
  { id: 'weather_scholar', name: 'Weather Scholar', description: 'Study and master 10 different weather phenomena.', condition: 'master_10_weather', xpReward: 150, crystalsReward: 75, icon: '📚' },
  { id: 'thunder_collector', name: 'Thunder Collector', description: 'Collect 500 Storm Crystals in total.', condition: 'earn_500_crystals', xpReward: 100, crystalsReward: 50, icon: '💎' },
  { id: 'creature_friend', name: 'Creature Friend', description: 'Befriend your first storm spirit.', condition: 'befriend_1_spirit', xpReward: 80, crystalsReward: 40, icon: '🐾' },
  { id: 'spirit_master', name: 'Spirit Master', description: 'Befriend all 8 storm spirits.', condition: 'befriend_all_spirits', xpReward: 500, crystalsReward: 250, icon: '👻' },
  { id: 'discovery_hunter', name: 'Discovery Hunter', description: 'Make 10 discoveries on the mountain.', condition: 'discover_10', xpReward: 120, crystalsReward: 60, icon: '🔍' },
  { id: 'archaeologist', name: 'Archaeologist', description: 'Make all 25 discoveries on Thunder Peak.', condition: 'discover_all', xpReward: 600, crystalsReward: 300, icon: '🏺' },
  { id: 'battle_veteran', name: 'Battle Veteran', description: 'Win 20 storm creature battles.', condition: 'win_20_battles', xpReward: 200, crystalsReward: 100, icon: '⚔️' },
  { id: 'apex_conqueror', name: 'Apex Conqueror', description: 'Reach the summit of Apex Eternity.', condition: 'reach_apex', xpReward: 1000, crystalsReward: 500, icon: '🔝' },
  { id: 'level_25_milestone', name: 'Storm Adept', description: 'Reach level 25.', condition: 'reach_level_25', xpReward: 250, crystalsReward: 100, icon: '📈' },
  { id: 'level_50_milestone', name: 'Storm God', description: 'Reach the maximum level of 50.', condition: 'reach_level_50', xpReward: 1000, crystalsReward: 500, icon: '👑' },
  { id: 'forecast_accuracy', name: 'Weather Prophet', description: 'Correctly predict the weather 10 times in a row.', condition: 'predict_10_correct', xpReward: 150, crystalsReward: 80, icon: '🔮' },
  { id: 'survival_expert', name: 'Survival Expert', description: 'Survive 5 consecutive battles without healing.', condition: 'survive_5_no_heal', xpReward: 180, crystalsReward: 90, icon: '🩹' },
] as const;

export const TP_TITLES = [
  { id: 'storm_watcher', name: 'Storm Watcher', levelReq: 1, description: 'A newcomer who watches the storms from afar.', icon: '👁️', color: TP_THEME_COLORS.silver },
  { id: 'wind_reader', name: 'Wind Reader', levelReq: 7, description: 'Can read the subtlest changes in wind patterns.', icon: '🌬️', color: TP_THEME_COLORS.cloudGray },
  { id: 'lightning_caller', name: 'Lightning Caller', levelReq: 14, description: 'Has learned to call lightning from the sky.', icon: '⚡', color: TP_THEME_COLORS.electricBlue },
  { id: 'storm_rider', name: 'Storm Rider', levelReq: 22, description: 'Rides the storms with confidence and skill.', icon: '🌪️', color: TP_THEME_COLORS.electricYellow },
  { id: 'thunder_master', name: 'Thunder Master', levelReq: 30, description: 'A master of thunder and all its applications.', icon: '⛈️', color: TP_THEME_COLORS.stormPurple },
  { id: 'tempest_lord', name: 'Tempest Lord', levelReq: 38, description: 'Commands the fury of tempests at will.', icon: '🌀', color: TP_THEME_COLORS.emberOrange },
  { id: 'sky_sovereign', name: 'Sky Sovereign', levelReq: 45, description: 'Rules the skies above Thunder Peak.', icon: '👑', color: TP_THEME_COLORS.plasmaGlow },
  { id: 'eternal_storm_god', name: 'Eternal Storm God', levelReq: 50, description: 'The ultimate master of all weather phenomena.', icon: '✨', color: TP_THEME_COLORS.frozenCyan },
] as const;

export const TP_ELEMENTS = [
  { id: 'lightning', name: 'Lightning', color: TP_THEME_COLORS.electricYellow, icon: '⚡', strongAgainst: 'water', weakAgainst: 'earth' },
  { id: 'ice', name: 'Ice', color: TP_THEME_COLORS.frozenCyan, icon: '❄️', strongAgainst: 'wind', weakAgainst: 'fire' },
  { id: 'wind', name: 'Wind', color: TP_THEME_COLORS.silver, icon: '💨', strongAgainst: 'earth', weakAgainst: 'lightning' },
  { id: 'storm', name: 'Storm', color: TP_THEME_COLORS.stormPurple, icon: '⛈️', strongAgainst: 'fire', weakAgainst: 'ice' },
  { id: 'fire', name: 'Fire', color: TP_THEME_COLORS.emberOrange, icon: '🔥', strongAgainst: 'ice', weakAgainst: 'storm' },
  { id: 'earth', name: 'Earth', color: TP_THEME_COLORS.cloudGray, icon: '🏔️', strongAgainst: 'lightning', weakAgainst: 'wind' },
  { id: 'water', name: 'Water', color: TP_THEME_COLORS.electricBlue, icon: '🌊', strongAgainst: 'fire', weakAgainst: 'storm' },
  { id: 'plasma', name: 'Plasma', color: TP_THEME_COLORS.plasmaGlow, icon: '☄️', strongAgainst: 'all', weakAgainst: 'none' },
  { id: 'cosmic', name: 'Cosmic', color: TP_THEME_COLORS.auroraGreen, icon: '🌠', strongAgainst: 'all', weakAgainst: 'none' },
] as const;

export const TP_BATTLE_STATES = ['idle', 'selecting', 'player_turn', 'enemy_turn', 'victory', 'defeat', 'fled'] as const;

export const TP_PANEL_TABS = ['overview', 'trails', 'abilities', 'spirits', 'equipment', 'bestiary', 'discoveries', 'achievements', 'forecast', 'battle'] as const;

export const TP_WEATHER_FORECAST_TYPES = ['clear', 'cloudy', 'rain', 'storm', 'blizzard', 'aurora', 'plasma'] as const;

export const TP_STATUS_EFFECTS = [
  { id: 'electrified', name: 'Electrified', duration: 3000, damagePerTick: 5, icon: '⚡' },
  { id: 'frozen', name: 'Frozen', duration: 4000, damagePerTick: 0, icon: '🧊' },
  { id: 'burning', name: 'Burning', duration: 5000, damagePerTick: 8, icon: '🔥' },
  { id: 'blinded', name: 'Blinded', duration: 2000, damagePerTick: 0, icon: '😵' },
  { id: 'shielded', name: 'Shielded', duration: 5000, damagePerTick: 0, icon: '🛡️' },
  { id: 'hastened', name: 'Hastened', duration: 6000, damagePerTick: 0, icon: '💨' },
  { id: 'slowed', name: 'Slowed', duration: 4000, damagePerTick: 0, icon: '🐌' },
  { id: 'regenerating', name: 'Regenerating', duration: 8000, damagePerTick: -5, icon: '💚' },
] as const;

// ============================================================================
// SECTION 2: TYPES
// ============================================================================

type TPRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type TPElement = 'lightning' | 'ice' | 'wind' | 'storm' | 'fire' | 'earth' | 'water' | 'plasma' | 'cosmic';

type TPBattleState = typeof TP_BATTLE_STATES[number];

type TPTab = typeof TP_PANEL_TABS[number];

interface TPSurvivalStats {
  currentAltitude: number;
  currentTemperature: number;
  currentOxygen: number;
  stamina: number;
  maxStamina: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
}

interface TPSpiritProgress {
  spiritId: string;
  friendship: number;
  isBefriended: boolean;
  timesSummoned: number;
  lastSummonTime: number;
}

interface TPDiscoveredItem {
  discoveryId: string;
  discoveredAt: number;
  trailId: string;
}

interface TPEquippedGear {
  head: string | null;
  armor: string | null;
  hands: string | null;
  feet: string | null;
  weapon: string | null;
  shield: string | null;
  accessory: string | null;
}

interface TPInventoryItem {
  itemId: string;
  quantity: number;
}

interface TPAbilityProgress {
  abilityId: string;
  isUnlocked: boolean;
  castCount: number;
  lastCastTime: number;
  proficiency: number;
}

interface TPWeatherMastery {
  weatherId: string;
  studyCount: number;
  masteryLevel: number;
  isMastered: boolean;
}

interface TPCreatureRecord {
  creatureId: string;
  encounters: number;
  victories: number;
  defeats: number;
  lastEncounter: number;
}

interface TPTitleProgress {
  titleId: string;
  isUnlocked: boolean;
  unlockedAt: number;
}

interface TPAchievementProgress {
  achievementId: string;
  isUnlocked: boolean;
  progress: number;
  target: number;
  unlockedAt: number;
}

interface TPTrailProgress {
  trailId: string;
  timesAscended: number;
  bestTime: number;
  lastAscent: number;
  isUnlocked: boolean;
  currentAltitude: number;
}

interface TPDailyForecast {
  date: string;
  weather: string;
  intensity: number;
  temperature: number;
  windSpeed: number;
  predictedByPlayer: string | null;
  wasCorrect: boolean | null;
}

interface TPBattleLog {
  timestamp: number;
  action: string;
  actor: 'player' | 'enemy';
  damage?: number;
  element?: string;
  isCritical?: boolean;
}

interface TPActiveBattle {
  state: TPBattleState;
  enemyId: string;
  enemyName: string;
  enemyHP: number;
  enemyMaxHP: number;
  enemyElement: TPElement;
  enemyDamage: number;
  enemySpeed: number;
  playerHP: number;
  turnCount: number;
  log: TPBattleLog[];
  statusEffects: Array<{ effectId: string; remainingMs: number; source: 'player' | 'enemy' }>;
  rewards: { xp: number; crystals: number } | null;
  startedAt: number;
}

interface TPNotification {
  id: string;
  type: 'achievement' | 'discovery' | 'level_up' | 'battle' | 'spirit' | 'forecast' | 'equipment';
  message: string;
  timestamp: number;
  icon: string;
}

interface TPState {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXP: number;
  stormCrystals: number;
  totalCrystalsEarned: number;

  currentTrailId: string | null;
  currentAltitude: number;

  survival: TPSurvivalStats;

  spiritProgress: TPSpiritProgress[];
  discoveries: TPDiscoveredItem[];
  equippedGear: TPEquippedGear;
  inventory: TPInventoryItem[];
  abilityProgress: TPAbilityProgress[];
  weatherMastery: TPWeatherMastery[];
  creatureRecords: TPCreatureRecord[];
  titleProgress: TPTitleProgress[];
  achievementProgress: TPAchievementProgress[];
  trailProgress: TPTrailProgress[];
  dailyForecasts: TPDailyForecast[];

  activeBattle: TPActiveBattle | null;

  totalAscensions: number;
  totalBattlesWon: number;
  totalBattlesLost: number;
  totalSpellsCast: number;
  totalSpiritsSummoned: number;
  consecutiveCorrectPredictions: number;
  consecutiveNoHealBattles: number;

  lastForecastDate: string;
  lastAscendTime: number;

  activeTab: TPTab;
  notifications: TPNotification[];

  weatherControlLevel: number;
  stormIntensity: number;
}

// ============================================================================
// SECTION 3: HELPER FUNCTIONS (private, not exported)
// ============================================================================

function tpCalculateXPToNextLevel(currentLevel: number): number {
  return Math.floor(TP_BASE_XP_PER_LEVEL * Math.pow(TP_XP_SCALING_FACTOR, currentLevel - 1));
}

function tpCalculateRarityMultiplier(rarity: TPRarity): number {
  const tier = TP_RARITY_TIERS.find(t => t.key === rarity);
  return tier ? tier.multiplier : 1;
}

function tpGetElementAdvantage(attacker: TPElement, defender: TPElement): number {
  const attackerEl = TP_ELEMENTS.find(e => e.id === attacker);
  const defenderEl = TP_ELEMENTS.find(e => e.id === defender);
  if (!attackerEl || !defenderEl) return 1;
  if (attackerEl.strongAgainst === 'all' && defenderEl.weakAgainst !== 'none') return 1.5;
  if (attackerEl.strongAgainst === defender) return 1.5;
  if (defenderEl.strongAgainst === attacker) return 0.7;
  return 1;
}

function tpCalculateTemperature(altitude: number, baseTemp: number): number {
  return baseTemp - (altitude * TP_TEMPERATURE_DECAY_PER_ALT);
}

function tpCalculateOxygen(altitude: number, baseOxygen: number): number {
  return Math.max(0, baseOxygen - (altitude / TP_MAX_ALTITUDE) * (100 - baseOxygen) - (altitude / TP_MAX_ALTITUDE) * TP_OXYGEN_DECAY_RATE * 10);
}

function tpGenerateRandomWeather(trailId: string): string {
  const trail = TP_MOUNTAIN_TRAILS.find(t => t.id === trailId);
  if (!trail) return 'clear';
  const options = trail.weatherTypes;
  const idx = Math.floor(Math.random() * options.length);
  return options[idx];
}

function tpGenerateDailyForecast(dateStr: string): TPDailyForecast {
  const allWeather = ['clear', 'cloudy', 'rain', 'storm', 'blizzard', 'aurora', 'plasma'];
  const weather = allWeather[Math.floor(Math.random() * allWeather.length)];
  const intensity = Math.floor(Math.random() * TP_STORM_INTENSITY_MAX) + 1;
  const temperature = Math.floor(Math.random() * 60) - 40;
  const windSpeed = Math.floor(Math.random() * 200) + 10;
  return {
    date: dateStr,
    weather,
    intensity,
    temperature,
    windSpeed,
    predictedByPlayer: null,
    wasCorrect: null,
  };
}

function tpGenerateBattleReward(enemyId: string, playerLevel: number): { xp: number; crystals: number } {
  const creature = TP_STORM_CREATURES.find(c => c.id === enemyId);
  const baseXP = creature ? creature.xpReward : 10;
  const baseCrystals = creature ? creature.crystalsReward : 3;
  const levelMultiplier = 1 + (playerLevel * 0.05);
  return {
    xp: Math.floor(baseXP * levelMultiplier),
    crystals: Math.floor(baseCrystals * levelMultiplier),
  };
}

function tpCreateNotification(type: TPNotification['type'], message: string, icon: string): TPNotification {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    message,
    timestamp: Date.now(),
    icon,
  };
}

function tpGetDefaultSurvivalStats(): TPSurvivalStats {
  return {
    currentAltitude: 0,
    currentTemperature: 18,
    currentOxygen: 100,
    stamina: 100,
    maxStamina: 100,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
  };
}

function tpGetDefaultEquippedGear(): TPEquippedGear {
  return {
    head: null,
    armor: null,
    hands: null,
    feet: null,
    weapon: null,
    shield: null,
    accessory: null,
  };
}

function tpGetDefaultState(): TPState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    level: 1,
    xp: 0,
    xpToNextLevel: tpCalculateXPToNextLevel(1),
    totalXP: 0,
    stormCrystals: 50,
    totalCrystalsEarned: 50,

    currentTrailId: 'base_camp',
    currentAltitude: 0,

    survival: tpGetDefaultSurvivalStats(),

    spiritProgress: TP_STORM_SPIRITS.map(s => ({
      spiritId: s.id,
      friendship: 0,
      isBefriended: false,
      timesSummoned: 0,
      lastSummonTime: 0,
    })),

    discoveries: [],

    equippedGear: tpGetDefaultEquippedGear(),
    inventory: [],
    abilityProgress: TP_LIGHTNING_ABILITIES.map(a => ({
      abilityId: a.id,
      isUnlocked: a.unlockLevel <= 1,
      castCount: 0,
      lastCastTime: 0,
      proficiency: 0,
    })),

    weatherMastery: TP_WEATHER_PHENOMENA.map(w => ({
      weatherId: w.id,
      studyCount: 0,
      masteryLevel: 0,
      isMastered: false,
    })),

    creatureRecords: TP_STORM_CREATURES.map(c => ({
      creatureId: c.id,
      encounters: 0,
      victories: 0,
      defeats: 0,
      lastEncounter: 0,
    })),

    titleProgress: TP_TITLES.map(t => ({
      titleId: t.id,
      isUnlocked: t.levelReq <= 1,
      unlockedAt: t.levelReq <= 1 ? Date.now() : 0,
    })),

    achievementProgress: TP_ACHIEVEMENTS.map(a => ({
      achievementId: a.id,
      isUnlocked: false,
      progress: 0,
      target: 1,
      unlockedAt: 0,
    })),

    trailProgress: TP_MOUNTAIN_TRAILS.map(t => ({
      trailId: t.id,
      timesAscended: 0,
      bestTime: 0,
      lastAscent: 0,
      isUnlocked: t.unlockLevel <= 1,
      currentAltitude: t.altitudeRange[0],
    })),

    dailyForecasts: [tpGenerateDailyForecast(today)],

    activeBattle: null,

    totalAscensions: 0,
    totalBattlesWon: 0,
    totalBattlesLost: 0,
    totalSpellsCast: 0,
    totalSpiritsSummoned: 0,
    consecutiveCorrectPredictions: 0,
    consecutiveNoHealBattles: 0,

    lastForecastDate: today,
    lastAscendTime: 0,

    activeTab: 'overview',
    notifications: [],

    weatherControlLevel: 1,
    stormIntensity: 25,
  };
}

function tpCheckAchievementUnlocks(
  prevAchievements: TPAchievementProgress[],
  state: TPState,
  newNotifications: TPNotification[],
): TPAchievementProgress[] {
  const updated = prevAchievements.map(a => {
    if (a.isUnlocked) return a;
    let progress = a.progress;
    let target = a.target;
    let shouldUnlock = false;

    switch (a.achievementId) {
      case 'first_ascent':
        progress = Math.min(state.totalAscensions, 1);
        target = 1;
        shouldUnlock = state.totalAscensions >= 1;
        break;
      case 'storm_newborn':
        progress = Math.min(state.totalSpellsCast, 1);
        target = 1;
        shouldUnlock = state.totalSpellsCast >= 1;
        break;
      case 'trailblazer':
        progress = state.trailProgress.filter(t => t.timesAscended > 0).length;
        target = 8;
        shouldUnlock = progress >= 8;
        break;
      case 'weather_scholar':
        progress = state.weatherMastery.filter(w => w.isMastered).length;
        target = 10;
        shouldUnlock = progress >= 10;
        break;
      case 'thunder_collector':
        progress = Math.min(state.totalCrystalsEarned, 500);
        target = 500;
        shouldUnlock = state.totalCrystalsEarned >= 500;
        break;
      case 'creature_friend':
        progress = state.spiritProgress.filter(s => s.isBefriended).length;
        target = 1;
        shouldUnlock = progress >= 1;
        break;
      case 'spirit_master':
        progress = state.spiritProgress.filter(s => s.isBefriended).length;
        target = 8;
        shouldUnlock = progress >= 8;
        break;
      case 'discovery_hunter':
        progress = Math.min(state.discoveries.length, 10);
        target = 10;
        shouldUnlock = state.discoveries.length >= 10;
        break;
      case 'archaeologist':
        progress = Math.min(state.discoveries.length, 25);
        target = 25;
        shouldUnlock = state.discoveries.length >= 25;
        break;
      case 'battle_veteran':
        progress = Math.min(state.totalBattlesWon, 20);
        target = 20;
        shouldUnlock = state.totalBattlesWon >= 20;
        break;
      case 'apex_conqueror':
        progress = state.trailProgress.find(t => t.trailId === 'apex_eternity')?.timesAscended ?? 0;
        target = 1;
        shouldUnlock = progress >= 1;
        break;
      case 'level_25_milestone':
        progress = Math.min(state.level, 25);
        target = 25;
        shouldUnlock = state.level >= 25;
        break;
      case 'level_50_milestone':
        progress = Math.min(state.level, 50);
        target = 50;
        shouldUnlock = state.level >= 50;
        break;
      case 'forecast_accuracy':
        progress = state.consecutiveCorrectPredictions;
        target = 10;
        shouldUnlock = state.consecutiveCorrectPredictions >= 10;
        break;
      case 'survival_expert':
        progress = Math.min(state.consecutiveNoHealBattles, 5);
        target = 5;
        shouldUnlock = state.consecutiveNoHealBattles >= 5;
        break;
      default:
        break;
    }

    if (shouldUnlock) {
      const achData = TP_ACHIEVEMENTS.find(ad => ad.id === a.achievementId);
      newNotifications.push(
        tpCreateNotification('achievement', `Achievement Unlocked: ${achData?.name ?? a.achievementId}`, achData?.icon ?? '🏆'),
      );
      return { ...a, isUnlocked: true, progress, target, unlockedAt: Date.now() };
    }
    return { ...a, progress, target };
  });
  return updated;
}

function tpCheckTitleUnlocks(
  prevTitles: TPTitleProgress[],
  level: number,
  newNotifications: TPNotification[],
): TPTitleProgress[] {
  return prevTitles.map(t => {
    if (t.isUnlocked) return t;
    const titleData = TP_TITLES.find(td => td.id === t.titleId);
    if (!titleData) return t;
    if (level >= titleData.levelReq) {
      newNotifications.push(
        tpCreateNotification('level_up', `Title Unlocked: ${titleData.name}`, titleData.icon),
      );
      return { ...t, isUnlocked: true, unlockedAt: Date.now() };
    }
    return t;
  });
}

function tpCheckAbilityUnlocks(
  prevAbilities: TPAbilityProgress[],
  level: number,
): TPAbilityProgress[] {
  return prevAbilities.map(a => {
    const abilityData = TP_LIGHTNING_ABILITIES.find(ad => ad.id === a.abilityId);
    if (!abilityData) return a;
    if (!a.isUnlocked && level >= abilityData.unlockLevel) {
      return { ...a, isUnlocked: true };
    }
    return a;
  });
}

function tpCheckTrailUnlocks(
  prevTrails: TPTrailProgress[],
  level: number,
): TPTrailProgress[] {
  return prevTrails.map(t => {
    const trailData = TP_MOUNTAIN_TRAILS.find(td => td.id === t.trailId);
    if (!trailData) return t;
    if (!t.isUnlocked && level >= trailData.unlockLevel) {
      return { ...t, isUnlocked: true };
    }
    return t;
  });
}

// ============================================================================
// SECTION 4: MAIN HOOK
// ============================================================================

export default function useThunderPeak() {
  const [state, setState] = useState<TPState>(tpGetDefaultState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // -------------------------------------------------------------------------
  // Computed values via useMemo
  // -------------------------------------------------------------------------

  const currentTitle = useMemo(() => {
    const unlocked = state.titleProgress
      .filter(t => t.isUnlocked)
      .sort((a, b) => {
        const aData = TP_TITLES.find(t => t.id === a.titleId);
        const bData = TP_TITLES.find(t => t.id === b.titleId);
        return (bData?.levelReq ?? 0) - (aData?.levelReq ?? 0);
      });
    if (unlocked.length === 0) return TP_TITLES[0];
    const latest = unlocked[0];
    return TP_TITLES.find(t => t.id === latest.titleId) ?? TP_TITLES[0];
  }, [state.titleProgress]);

  const currentTrail = useMemo(() => {
    if (!state.currentTrailId) return TP_MOUNTAIN_TRAILS[0];
    return TP_MOUNTAIN_TRAILS.find(t => t.id === state.currentTrailId) ?? TP_MOUNTAIN_TRAILS[0];
  }, [state.currentTrailId]);

  const levelProgress = useMemo(() => {
    if (state.xpToNextLevel <= 0) return 100;
    return Math.min(100, (state.xp / state.xpToNextLevel) * 100);
  }, [state.xp, state.xpToNextLevel]);

  const unlockedAbilities = useMemo(() => {
    return TP_LIGHTNING_ABILITIES.filter(a => {
      const progress = state.abilityProgress.find(p => p.abilityId === a.id);
      return progress?.isUnlocked ?? false;
    });
  }, [state.abilityProgress]);

  const unlockedSpirits = useMemo(() => {
    return TP_STORM_SPIRITS.filter(s => {
      const progress = state.spiritProgress.find(p => p.spiritId === s.id);
      return progress?.isBefriended ?? false;
    });
  }, [state.spiritProgress]);

  const masteredWeather = useMemo(() => {
    return TP_WEATHER_PHENOMENA.filter(w => {
      const mastery = state.weatherMastery.find(m => m.weatherId === w.id);
      return mastery?.isMastered ?? false;
    });
  }, [state.weatherMastery]);

  const unlockedAchievements = useMemo(() => {
    return state.achievementProgress.filter(a => a.isUnlocked);
  }, [state.achievementProgress]);

  const totalStatBonus = useMemo(() => {
    let lightningPower = 0;
    let icePower = 0;
    let stormPower = 0;
    let windPower = 0;
    let defense = 0;
    let speed = 0;
    let manaMax = 0;
    let manaRegen = 0;
    let luck = 0;
    let dodge = 0;
    let allDamage = 0;
    let allResist = 0;

    const equippedIds = Object.values(state.equippedGear).filter(Boolean) as string[];
    for (const id of equippedIds) {
      const item = TP_EQUIPMENT_ITEMS.find(eq => eq.id === id);
      if (!item) continue;
      const stats = item.stats as Record<string, number>;
      lightningPower += stats.lightningPower ?? 0;
      icePower += stats.icePower ?? 0;
      stormPower += stats.stormPower ?? 0;
      windPower += stats.windPower ?? 0;
      defense += stats.defense ?? 0;
      speed += stats.speed ?? 0;
      manaMax += stats.manaMax ?? 0;
      manaRegen += stats.manaRegen ?? 0;
      luck += stats.luck ?? 0;
      dodge += stats.dodge ?? 0;
      allDamage += stats.allPower ?? 0;
      allResist += stats.allResist ?? 0;
    }

    const befriendedSpirits = state.spiritProgress.filter(s => s.isBefriended);
    for (const sp of befriendedSpirits) {
      const spirit = TP_STORM_SPIRITS.find(s => s.id === sp.spiritId);
      if (!spirit) continue;
      if (spirit.bonus.type === 'stamina_recovery') {
        lightningPower += 0;
      } else if (spirit.bonus.type === 'storm_damage') {
        stormPower += spirit.bonus.value;
      } else if (spirit.bonus.type === 'lightning_damage') {
        lightningPower += spirit.bonus.value;
      } else if (spirit.bonus.type === 'freeze_duration') {
        icePower += spirit.bonus.value;
      } else if (spirit.bonus.type === 'all_damage') {
        allDamage += spirit.bonus.value;
      } else if (spirit.bonus.type === 'mana_regen') {
        manaRegen += spirit.bonus.value;
      } else if (spirit.bonus.type === 'all_stats') {
        allDamage += spirit.bonus.value;
        defense += Math.floor(spirit.bonus.value / 2);
        dodge += Math.floor(spirit.bonus.value / 3);
      }
    }

    return {
      lightningPower,
      icePower,
      stormPower,
      windPower,
      defense,
      speed,
      manaMax,
      manaRegen,
      luck,
      dodge,
      allDamage,
      allResist,
    };
  }, [state.equippedGear, state.spiritProgress]);

  const todayForecast = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return state.dailyForecasts.find(f => f.date === today);
  }, [state.dailyForecasts]);

  const forecastHistory = useMemo(() => {
    return [...state.dailyForecasts].sort((a, b) => b.date.localeCompare(a.date));
  }, [state.dailyForecasts]);

  const unmadeDiscoveries = useMemo(() => {
    const discoveredIds = new Set(state.discoveries.map(d => d.discoveryId));
    return TP_DISCOVERIES.filter(d => !discoveredIds.has(d.id));
  }, [state.discoveries]);

  const shopItems = useMemo(() => {
    return TP_EQUIPMENT_ITEMS.filter(item => item.levelReq <= state.level);
  }, [state.level]);

  const purchaseableSpirits = useMemo(() => {
    return TP_STORM_SPIRITS.filter(s => {
      const progress = state.spiritProgress.find(p => p.spiritId === s.id);
      return progress && !progress.isBefriended && state.level >= s.unlockLevel;
    });
  }, [state.level, state.spiritProgress]);

  const battleCreaturePool = useMemo(() => {
    if (!state.currentTrailId) return TP_STORM_CREATURES.slice(0, 3);
    const trail = TP_MOUNTAIN_TRAILS.find(t => t.id === state.currentTrailId);
    if (!trail) return TP_STORM_CREATURES.slice(0, 3);
    return TP_STORM_CREATURES.filter(c =>
      (trail.creatures as readonly string[]).includes(c.id) || c.difficulty <= trail.difficulty,
    );
  }, [state.currentTrailId]);

  const stormPowerRating = useMemo(() => {
    const base = state.level * 5;
    const abilityPower = unlockedAbilities.length * 8;
    const spiritPower = unlockedSpirits.length * 15;
    const gearPower = totalStatBonus.allDamage + totalStatBonus.lightningPower + totalStatBonus.icePower + totalStatBonus.stormPower;
    return base + abilityPower + spiritPower + gearPower;
  }, [state.level, unlockedAbilities.length, unlockedSpirits.length, totalStatBonus]);

  const altitudePercent = useMemo(() => {
    return Math.min(100, (state.currentAltitude / TP_MAX_ALTITUDE) * 100);
  }, [state.currentAltitude]);

  // -------------------------------------------------------------------------
  // Actions via useCallback
  // -------------------------------------------------------------------------

  const setActiveTab = useCallback((tab: TPTab) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const dismissNotification = useCallback((notifId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== notifId),
    }));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setState(prev => ({ ...prev, notifications: [] }));
  }, []);

  const addXP = useCallback((amount: number) => {
    setState(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNextLevel;
      let newTotalXP = prev.totalXP + amount;
      const newNotifications: TPNotification[] = [];

      while (newXp >= newXpToNext && newLevel < TP_MAX_LEVEL) {
        newXp -= newXpToNext;
        newLevel += 1;
        newXpToNext = tpCalculateXPToNextLevel(newLevel);
        newNotifications.push(
          tpCreateNotification('level_up', `Level Up! You are now level ${newLevel}!`, '📈'),
        );
      }

      if (newLevel >= TP_MAX_LEVEL) {
        newXp = 0;
        newXpToNext = 0;
      }

      let updatedTitles = prev.titleProgress;
      if (newLevel > prev.level) {
        updatedTitles = tpCheckTitleUnlocks(prev.titleProgress, newLevel, newNotifications);
      }

      let updatedAbilities = prev.abilityProgress;
      if (newLevel > prev.level) {
        updatedAbilities = tpCheckAbilityUnlocks(prev.abilityProgress, newLevel);
      }

      let updatedTrails = prev.trailProgress;
      if (newLevel > prev.level) {
        updatedTrails = tpCheckTrailUnlocks(prev.trailProgress, newLevel);
      }

      const newSurvival = {
        ...prev.survival,
        maxHealth: 100 + (newLevel - 1) * 5,
        maxMana: 50 + (newLevel - 1) * 3,
        maxStamina: 100 + (newLevel - 1) * 2,
        health: prev.survival.maxHealth + (newLevel - 1) * 5,
        mana: prev.survival.maxMana + (newLevel - 1) * 3,
      };

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        xpToNextLevel: newXpToNext,
        totalXP: newTotalXP,
        survival: newSurvival,
        titleProgress: updatedTitles,
        abilityProgress: updatedAbilities,
        trailProgress: updatedTrails,
        notifications: [...prev.notifications, ...newNotifications],
      };
    });
  }, []);

  const addStormCrystals = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      stormCrystals: Math.min(TP_MAX_STORM_CRYSTALS, prev.stormCrystals + amount),
      totalCrystalsEarned: prev.totalCrystalsEarned + amount,
    }));
  }, []);

  const spendStormCrystals = useCallback((amount: number): boolean => {
    let success = false;
    setState(prev => {
      if (prev.stormCrystals < amount) return prev;
      success = true;
      return { ...prev, stormCrystals: prev.stormCrystals - amount };
    });
    return success;
  }, []);

  const selectTrail = useCallback((trailId: string) => {
    setState(prev => {
      const trail = prev.trailProgress.find(t => t.trailId === trailId);
      if (!trail || !trail.isUnlocked) return prev;
      return {
        ...prev,
        currentTrailId: trailId,
        currentAltitude: trail.currentAltitude,
      };
    });
  }, []);

  const ascendTrail = useCallback(() => {
    setState(prev => {
      if (!prev.currentTrailId) return prev;
      const now = Date.now();
      if (now - prev.lastAscendTime < TP_ASCEND_COOLDOWN_MS) return prev;

      const trailData = TP_MOUNTAIN_TRAILS.find(t => t.id === prev.currentTrailId);
      if (!trailData) return prev;
      const trailProgress = prev.trailProgress.find(t => t.trailId === prev.currentTrailId);
      if (!trailProgress || !trailProgress.isUnlocked) return prev;

      const newAltitude = Math.min(
        trailData.altitudeRange[1],
        trailProgress.currentAltitude + Math.floor(Math.random() * 200) + 50,
      );
      const isComplete = newAltitude >= trailData.altitudeRange[1];

      const climbTime = isComplete
        ? Math.floor(Math.random() * 120000) + 60000
        : Math.floor(Math.random() * 60000) + 10000;

      const newSurvival = {
        ...prev.survival,
        currentAltitude: newAltitude,
        currentTemperature: tpCalculateTemperature(newAltitude, trailData.temperatureBase),
        currentOxygen: tpCalculateOxygen(newAltitude, trailData.oxygenLevel),
        stamina: Math.max(0, prev.survival.stamina - Math.floor(Math.random() * 15) + 5),
      };

      const newTrailProgress = prev.trailProgress.map(t => {
        if (t.trailId !== prev.currentTrailId) return t;
        const newTimesAscended = isComplete ? t.timesAscended + 1 : t.timesAscended;
        const newBestTime = isComplete && (t.bestTime === 0 || climbTime < t.bestTime) ? climbTime : t.bestTime;
        return {
          ...t,
          timesAscended: newTimesAscended,
          bestTime: newBestTime,
          lastAscent: now,
          currentAltitude: isComplete ? trailData.altitudeRange[1] : newAltitude,
        };
      });

      const xpGained = isComplete
        ? trailData.baseXP * trailData.difficulty
        : trailData.baseXP;
      const crystalsGained = isComplete
        ? trailData.rewardCrystals
        : Math.floor(trailData.rewardCrystals * 0.3);

      const totalAscensions = prev.totalAscensions + (isComplete ? 1 : 0);

      const newNotifications: TPNotification[] = [];
      if (isComplete) {
        newNotifications.push(
          tpCreateNotification('level_up', `Trail Complete: ${trailData.name}! +${xpGained} XP, +${crystalsGained} Crystals`, '🏔️'),
        );
      }

      return {
        ...prev,
        currentAltitude: newAltitude,
        survival: newSurvival,
        trailProgress: newTrailProgress,
        totalAscensions,
        lastAscendTime: now,
        notifications: [...prev.notifications, ...newNotifications],
      };
    });
  }, []);

  const castAbility = useCallback((abilityId: string) => {
    setState(prev => {
      const abilityData = TP_LIGHTNING_ABILITIES.find(a => a.id === abilityId);
      const abilityProgress = prev.abilityProgress.find(a => a.abilityId === abilityId);
      if (!abilityData || !abilityProgress || !abilityProgress.isUnlocked) return prev;

      const now = Date.now();
      const cooldownRemaining = now - abilityProgress.lastCastTime;
      if (cooldownRemaining < abilityData.cooldown) return prev;

      if (prev.survival.mana < abilityData.manaCost) return prev;

      const newProficiency = Math.min(100, abilityProgress.proficiency + 1);
      const isMastered = newProficiency >= 100;

      const updatedAbilities = prev.abilityProgress.map(a => {
        if (a.abilityId !== abilityId) return a;
        return {
          ...a,
          castCount: a.castCount + 1,
          lastCastTime: now,
          proficiency: newProficiency,
        };
      });

      const newSurvival = {
        ...prev.survival,
        mana: Math.max(0, prev.survival.mana - abilityData.manaCost),
      };

      const newNotifications: TPNotification[] = [];
      if (isMastered && abilityProgress.proficiency < 100) {
        newNotifications.push(
          tpCreateNotification('battle', `Ability Mastered: ${abilityData.name}!`, '⚡'),
        );
      }

      return {
        ...prev,
        abilityProgress: updatedAbilities,
        survival: newSurvival,
        totalSpellsCast: prev.totalSpellsCast + 1,
        notifications: [...prev.notifications, ...newNotifications],
      };
    });
  }, []);

  const studyWeather = useCallback((weatherId: string) => {
    setState(prev => {
      const weatherData = TP_WEATHER_PHENOMENA.find(w => w.id === weatherId);
      if (!weatherData) return prev;

      const updatedMastery = prev.weatherMastery.map(w => {
        if (w.weatherId !== weatherId) return w;
        const newStudyCount = w.studyCount + 1;
        const newMasteryLevel = Math.min(10, Math.floor(newStudyCount / 3) + 1);
        const newIsMastered = newMasteryLevel >= 10;
        return {
          ...w,
          studyCount: newStudyCount,
          masteryLevel: newMasteryLevel,
          isMastered: newIsMastered,
        };
      });

      const xpGain = Math.floor(weatherData.power * tpCalculateRarityMultiplier(weatherData.tier as TPRarity) * 0.5);

      const newNotifications: TPNotification[] = [];
      const prevMastery = prev.weatherMastery.find(w => w.weatherId === weatherId);
      if (prevMastery && !prevMastery.isMastered) {
        const updated = updatedMastery.find(w => w.weatherId === weatherId);
        if (updated?.isMastered) {
          newNotifications.push(
            tpCreateNotification('forecast', `Weather Mastered: ${weatherData.name}!`, weatherData.icon),
          );
        }
      }

      return {
        ...prev,
        weatherMastery: updatedMastery,
        notifications: [...prev.notifications, ...newNotifications],
      };
    });
  }, []);

  const befriendSpirit = useCallback((spiritId: string) => {
    setState(prev => {
      const spiritData = TP_STORM_SPIRITS.find(s => s.id === spiritId);
      const spiritProgress = prev.spiritProgress.find(s => s.spiritId === spiritId);
      if (!spiritData || !spiritProgress || spiritProgress.isBefriended) return prev;
      if (prev.stormCrystals < spiritData.summonCost) return prev;
      if (prev.level < spiritData.unlockLevel) return prev;

      const newNotifications: TPNotification[] = [];
      newNotifications.push(
        tpCreateNotification('spirit', `Spirit Befriended: ${spiritData.name} - ${spiritData.title}!`, spiritData.icon),
      );

      return {
        ...prev,
        stormCrystals: prev.stormCrystals - spiritData.summonCost,
        spiritProgress: prev.spiritProgress.map(s => {
          if (s.spiritId !== spiritId) return s;
          return { ...s, isBefriended: true, friendship: spiritData.friendshipMax };
        }),
        notifications: [...prev.notifications, ...newNotifications],
      };
    });
  }, []);

  const summonSpirit = useCallback((spiritId: string) => {
    setState(prev => {
      const now = Date.now();
      const spiritData = TP_STORM_SPIRITS.find(s => s.id === spiritId);
      const spiritProgress = prev.spiritProgress.find(s => s.spiritId === spiritId);
      if (!spiritData || !spiritProgress || !spiritProgress.isBefriended) return prev;
      if (now - spiritProgress.lastSummonTime < TP_SPIRIT_COOLDOWN_MS) return prev;

      const newNotifications: TPNotification[] = [];
      newNotifications.push(
        tpCreateNotification('spirit', `${spiritData.name} has been summoned!`, spiritData.icon),
      );

      return {
        ...prev,
        spiritProgress: prev.spiritProgress.map(s => {
          if (s.spiritId !== spiritId) return s;
          return {
            ...s,
            timesSummoned: s.timesSummoned + 1,
            lastSummonTime: now,
          };
        }),
        totalSpiritsSummoned: prev.totalSpiritsSummoned + 1,
        notifications: [...prev.notifications, ...newNotifications],
      };
    });
  }, []);

  const feedSpirit = useCallback((spiritId: string, crystalsAmount: number) => {
    setState(prev => {
      const spiritProgress = prev.spiritProgress.find(s => s.spiritId === spiritId);
      const spiritData = TP_STORM_SPIRITS.find(s => s.id === spiritId);
      if (!spiritProgress || !spiritData) return prev;
      if (!spiritProgress.isBefriended) return prev;
      if (prev.stormCrystals < crystalsAmount) return prev;

      const friendshipGain = Math.floor(crystalsAmount / 2);
      const newFriendship = Math.min(spiritData.friendshipMax, spiritProgress.friendship + friendshipGain);

      return {
        ...prev,
        stormCrystals: prev.stormCrystals - crystalsAmount,
        spiritProgress: prev.spiritProgress.map(s => {
          if (s.spiritId !== spiritId) return s;
          return { ...s, friendship: newFriendship };
        }),
      };
    });
  }, []);

  const equipItem = useCallback((itemId: string) => {
    setState(prev => {
      const itemData = TP_EQUIPMENT_ITEMS.find(i => i.id === itemId);
      if (!itemData) return prev;
      if (prev.level < itemData.levelReq) return prev;

      const ownedItem = prev.inventory.find(i => i.itemId === itemId);
      if (!ownedItem || ownedItem.quantity <= 0) return prev;

      const slot = itemData.type as keyof TPEquippedGear;
      if (slot === 'weapon' || slot === 'accessory' || slot === 'armor' || slot === 'shield' || slot === 'head' || slot === 'hands' || slot === 'feet') {
        const currentlyEquipped = prev.equippedGear[slot];
        const newInventory = [...prev.inventory];

        if (currentlyEquipped) {
          const existingIdx = newInventory.findIndex(i => i.itemId === currentlyEquipped);
          if (existingIdx >= 0) {
            newInventory[existingIdx] = { ...newInventory[existingIdx], quantity: newInventory[existingIdx].quantity + 1 };
          } else {
            newInventory.push({ itemId: currentlyEquipped, quantity: 1 });
          }
        }

        const useIdx = newInventory.findIndex(i => i.itemId === itemId);
        if (useIdx >= 0) {
          newInventory[useIdx] = { ...newInventory[useIdx], quantity: newInventory[useIdx].quantity - 1 };
          if (newInventory[useIdx].quantity <= 0) {
            newInventory.splice(useIdx, 1);
          }
        }

        const newNotifications: TPNotification[] = [];
        newNotifications.push(
          tpCreateNotification('equipment', `Equipped: ${itemData.name}`, itemData.icon),
        );

        return {
          ...prev,
          equippedGear: { ...prev.equippedGear, [slot]: itemId },
          inventory: newInventory,
          notifications: [...prev.notifications, ...newNotifications],
        };
      }

      return prev;
    });
  }, []);

  const unequipItem = useCallback((slot: keyof TPEquippedGear) => {
    setState(prev => {
      const equippedId = prev.equippedGear[slot];
      if (!equippedId) return prev;

      const newInventory = [...prev.inventory];
      const existingIdx = newInventory.findIndex(i => i.itemId === equippedId);
      if (existingIdx >= 0) {
        newInventory[existingIdx] = { ...newInventory[existingIdx], quantity: newInventory[existingIdx].quantity + 1 };
      } else {
        newInventory.push({ itemId: equippedId, quantity: 1 });
      }

      return {
        ...prev,
        equippedGear: { ...prev.equippedGear, [slot]: null },
        inventory: newInventory,
      };
    });
  }, []);

  const buyEquipment = useCallback((itemId: string) => {
    setState(prev => {
      const itemData = TP_EQUIPMENT_ITEMS.find(i => i.id === itemId);
      if (!itemData) return prev;
      if (prev.stormCrystals < itemData.cost) return prev;
      if (prev.level < itemData.levelReq) return prev;

      const newInventory = [...prev.inventory];
      const existingIdx = newInventory.findIndex(i => i.itemId === itemId);
      if (existingIdx >= 0) {
        newInventory[existingIdx] = { ...newInventory[existingIdx], quantity: newInventory[existingIdx].quantity + 1 };
      } else {
        newInventory.push({ itemId: itemId, quantity: 1 });
      }

      const newNotifications: TPNotification[] = [];
      newNotifications.push(
        tpCreateNotification('equipment', `Purchased: ${itemData.name}`, itemData.icon),
      );

      return {
        ...prev,
        stormCrystals: prev.stormCrystals - itemData.cost,
        inventory: newInventory,
        notifications: [...prev.notifications, ...newNotifications],
      };
    });
  }, []);

  const makeDiscovery = useCallback((discoveryId: string) => {
    setState(prev => {
      const alreadyDiscovered = prev.discoveries.some(d => d.discoveryId === discoveryId);
      if (alreadyDiscovered) return prev;

      const discoveryData = TP_DISCOVERIES.find(d => d.id === discoveryId);
      if (!discoveryData) return prev;

      const newDiscovery: TPDiscoveredItem = {
        discoveryId,
        discoveredAt: Date.now(),
        trailId: discoveryData.trail,
      };

      const newNotifications: TPNotification[] = [];
      newNotifications.push(
        tpCreateNotification('discovery', `Discovery: ${discoveryData.name}! +${discoveryData.crystalsReward} Crystals`, discoveryData.icon),
      );

      return {
        ...prev,
        discoveries: [...prev.discoveries, newDiscovery],
        stormCrystals: Math.min(TP_MAX_STORM_CRYSTALS, prev.stormCrystals + discoveryData.crystalsReward),
        totalCrystalsEarned: prev.totalCrystalsEarned + discoveryData.crystalsReward,
        notifications: [...prev.notifications, ...newNotifications],
      };
    });
  }, []);

  const startBattle = useCallback((creatureId: string) => {
    setState(prev => {
      const creatureData = TP_STORM_CREATURES.find(c => c.id === creatureId);
      if (!creatureData) return prev;
      if (prev.activeBattle) return prev;

      const newBattle: TPActiveBattle = {
        state: 'selecting',
        enemyId: creatureId,
        enemyName: creatureData.name,
        enemyHP: creatureData.hp,
        enemyMaxHP: creatureData.hp,
        enemyElement: creatureData.element as TPElement,
        enemyDamage: creatureData.damage,
        enemySpeed: creatureData.speed,
        playerHP: prev.survival.health,
        turnCount: 0,
        log: [],
        statusEffects: [],
        rewards: null,
        startedAt: Date.now(),
      };

      return { ...prev, activeBattle: newBattle };
    });
  }, []);

  const useBattleAbility = useCallback((abilityId: string) => {
    setState(prev => {
      if (!prev.activeBattle || prev.activeBattle.state !== 'player_turn') return prev;

      const abilityData = TP_LIGHTNING_ABILITIES.find(a => a.id === abilityId);
      const abilityProgress = prev.abilityProgress.find(a => a.abilityId === abilityId);
      if (!abilityData || !abilityProgress || !abilityProgress.isUnlocked) return prev;
      if (prev.survival.mana < abilityData.manaCost) return prev;

      const elementMultiplier = tpGetElementAdvantage(
        abilityData.element as TPElement,
        prev.activeBattle.enemyElement,
      );

      const isCritical = Math.random() < 0.15;
      const proficiencyBonus = 1 + (abilityProgress.proficiency / 100);
      const totalDamage = Math.floor(
        abilityData.damage * elementMultiplier * proficiencyBonus * (isCritical ? 2 : 1),
      );

      const newEnemyHP = Math.max(0, prev.activeBattle.enemyHP - totalDamage);

      const newLog: TPBattleLog = {
        timestamp: Date.now(),
        action: `Cast ${abilityData.name} for ${totalDamage} damage${isCritical ? ' (CRITICAL!)' : ''}`,
        actor: 'player',
        damage: totalDamage,
        element: abilityData.element,
        isCritical,
      };

      const newState: TPBattleState = newEnemyHP <= 0 ? 'victory' : 'enemy_turn';

      const newNotifications: TPNotification[] = [];

      let newAbilities = prev.abilityProgress;
      const now = Date.now();
      newAbilities = prev.abilityProgress.map(a => {
        if (a.abilityId !== abilityId) return a;
        return { ...a, castCount: a.castCount + 1, lastCastTime: now };
      });

      let rewards: TPActiveBattle['rewards'] = null;
      let newCreatureRecords = prev.creatureRecords;
      let newTotalBattlesWon = prev.totalBattlesWon;
      let newConsecutiveNoHeal = prev.consecutiveNoHealBattles;

      if (newState === 'victory') {
        rewards = tpGenerateBattleReward(prev.activeBattle.enemyId, prev.level);
        newCreatureRecords = prev.creatureRecords.map(c => {
          if (c.creatureId !== prev.activeBattle?.enemyId) return c;
          return {
            ...c,
            encounters: c.encounters + 1,
            victories: c.victories + 1,
            lastEncounter: now,
          };
        });
        newTotalBattlesWon = prev.totalBattlesWon + 1;
        newConsecutiveNoHeal = prev.consecutiveNoHealBattles + 1;
        newNotifications.push(
          tpCreateNotification('battle', `Victory! Defeated ${prev.activeBattle.enemyName}! +${rewards.xp} XP, +${rewards.crystals} Crystals`, '🏆'),
        );
      }

      const newSurvival = {
        ...prev.survival,
        mana: Math.max(0, prev.survival.mana - abilityData.manaCost),
        health: newState === 'victory' ? prev.survival.health : Math.max(0, prev.survival.health - Math.floor(Math.random() * prev.activeBattle.enemyDamage * 0.5)),
      };

      const newAchievements = [...prev.achievementProgress];
      const checkedAchievements = tpCheckAchievementUnlocks(newAchievements, {
        ...prev,
        totalBattlesWon: newTotalBattlesWon,
        consecutiveNoHealBattles: newConsecutiveNoHeal,
        totalSpellsCast: prev.totalSpellsCast + 1,
      }, newNotifications);

      return {
        ...prev,
        activeBattle: {
          ...prev.activeBattle,
          state: newState,
          enemyHP: newEnemyHP,
          turnCount: prev.activeBattle.turnCount + 1,
          log: [...prev.activeBattle.log, newLog],
          rewards,
        },
        abilityProgress: newAbilities,
        survival: newSurvival,
        creatureRecords: newCreatureRecords,
        totalBattlesWon: newTotalBattlesWon,
        totalSpellsCast: prev.totalSpellsCast + 1,
        consecutiveNoHealBattles: newConsecutiveNoHeal,
        achievementProgress: checkedAchievements,
        notifications: [...prev.notifications, ...newNotifications],
      };
    });
  }, []);

  const battleFlee = useCallback(() => {
    setState(prev => {
      if (!prev.activeBattle || prev.activeBattle.state !== 'player_turn') return prev;

      const now = Date.now();
      const newCreatureRecords = prev.creatureRecords.map(c => {
        if (c.creatureId !== prev.activeBattle?.enemyId) return c;
        return { ...c, encounters: c.encounters + 1, lastEncounter: now };
      });

      return {
        ...prev,
        activeBattle: { ...prev.activeBattle, state: 'fled' },
        creatureRecords: newCreatureRecords,
      };
    });
  }, []);

  const endBattle = useCallback(() => {
    setState(prev => {
      if (!prev.activeBattle) return prev;

      const wasVictory = prev.activeBattle.state === 'victory';
      const rewards = prev.activeBattle.rewards;

      const newSurvival = { ...prev.survival, health: wasVictory ? prev.survival.health : Math.floor(prev.survival.maxHealth * 0.5) };
      const newState = { ...prev, activeBattle: null, survival: newSurvival };

      return newState;
    });
  }, []);

  const processBattleReward = useCallback(() => {
    setState(prev => {
      if (!prev.activeBattle || !prev.activeBattle.rewards) return prev;

      const { xp, crystals } = prev.activeBattle.rewards;
      return {
        ...prev,
        stormCrystals: Math.min(TP_MAX_STORM_CRYSTALS, prev.stormCrystals + crystals),
        totalCrystalsEarned: prev.totalCrystalsEarned + crystals,
      };
    });
    addXP(stateRef.current.activeBattle?.rewards?.xp ?? 0);
  }, [addXP]);

  const generateNewForecast = useCallback(() => {
    setState(prev => {
      const today = new Date().toISOString().slice(0, 10);
      if (prev.lastForecastDate === today) return prev;

      const newForecast = tpGenerateDailyForecast(today);

      return {
        ...prev,
        dailyForecasts: [newForecast, ...prev.dailyForecasts.filter(f => f.date !== today)],
        lastForecastDate: today,
      };
    });
  }, []);

  const predictWeather = useCallback((prediction: string) => {
    setState(prev => {
      const today = new Date().toISOString().slice(0, 10);
      const forecast = prev.dailyForecasts.find(f => f.date === today);
      if (!forecast) return prev;
      if (forecast.predictedByPlayer !== null) return prev;

      const isCorrect = forecast.weather === prediction;
      const newForecasts = prev.dailyForecasts.map(f => {
        if (f.date !== today) return f;
        return { ...f, predictedByPlayer: prediction, wasCorrect: isCorrect };
      });

      const newConsecutive = isCorrect
        ? prev.consecutiveCorrectPredictions + 1
        : 0;

      const newNotifications: TPNotification[] = [];
      if (isCorrect) {
        newNotifications.push(
          tpCreateNotification('forecast', `Weather prediction correct! (${prediction}) Streak: ${newConsecutive}`, '✅'),
        );
      } else {
        newNotifications.push(
          tpCreateNotification('forecast', `Weather prediction incorrect. You predicted ${prediction}, actual: ${forecast.weather}`, '❌'),
        );
      }

      const newXpGain = isCorrect ? 25 : 5;

      return {
        ...prev,
        dailyForecasts: newForecasts,
        consecutiveCorrectPredictions: newConsecutive,
        notifications: [...prev.notifications, ...newNotifications],
      };
    });
    if (todayForecast) {
      const isCorrect = todayForecast.weather === (stateRef.current.dailyForecasts.find(f => f.date === new Date().toISOString().slice(0, 10))?.predictedByPlayer);
      addXP(isCorrect ? 25 : 5);
    }
  }, [addXP, todayForecast]);

  const restAtCamp = useCallback(() => {
    setState(prev => ({
      ...prev,
      survival: {
        ...prev.survival,
        health: prev.survival.maxHealth,
        mana: prev.survival.maxMana,
        stamina: prev.survival.maxStamina,
      },
    }));
  }, []);

  const climbHigher = useCallback((amount: number) => {
    setState(prev => {
      const trailData = TP_MOUNTAIN_TRAILS.find(t => t.id === prev.currentTrailId);
      if (!trailData) return prev;

      const newAltitude = Math.min(trailData.altitudeRange[1], prev.currentAltitude + amount);
      const newSurvival = {
        ...prev.survival,
        currentAltitude: newAltitude,
        currentTemperature: tpCalculateTemperature(newAltitude, trailData.temperatureBase),
        currentOxygen: tpCalculateOxygen(newAltitude, trailData.oxygenLevel),
        stamina: Math.max(0, prev.survival.stamina - Math.floor(amount / 50)),
      };

      return { ...prev, currentAltitude: newAltitude, survival: newSurvival };
    });
  }, []);

  const descendTrail = useCallback((amount: number) => {
    setState(prev => {
      const trailData = TP_MOUNTAIN_TRAILS.find(t => t.id === prev.currentTrailId);
      if (!trailData) return prev;

      const newAltitude = Math.max(trailData.altitudeRange[0], prev.currentAltitude - amount);
      const newSurvival = {
        ...prev.survival,
        currentAltitude: newAltitude,
        currentTemperature: tpCalculateTemperature(newAltitude, trailData.temperatureBase),
        currentOxygen: tpCalculateOxygen(newAltitude, trailData.oxygenLevel),
        stamina: Math.min(prev.survival.maxStamina, prev.survival.stamina + Math.floor(amount / 30)),
      };

      return { ...prev, currentAltitude: newAltitude, survival: newSurvival };
    });
  }, []);

  const recoverStamina = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      survival: {
        ...prev.survival,
        stamina: Math.min(prev.survival.maxStamina, prev.survival.stamina + amount),
      },
    }));
  }, []);

  const recoverMana = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      survival: {
        ...prev.survival,
        mana: Math.min(prev.survival.maxMana, prev.survival.mana + amount),
      },
    }));
  }, []);

  const recoverHealth = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      survival: {
        ...prev.survival,
        health: Math.min(prev.survival.maxHealth, prev.survival.health + amount),
      },
    }));
  }, []);

  const triggerRandomEncounter = useCallback(() => {
    setState(prev => {
      const pool = battleCreaturePool.length > 0
        ? battleCreaturePool
        : TP_STORM_CREATURES.slice(0, 3);
      const randomCreature = pool[Math.floor(Math.random() * pool.length)];
      const creatureData = TP_STORM_CREATURES.find(c => c.id === randomCreature.id);
      if (!creatureData) return prev;
      if (prev.activeBattle) return prev;

      const newBattle: TPActiveBattle = {
        state: 'player_turn',
        enemyId: creatureData.id,
        enemyName: creatureData.name,
        enemyHP: creatureData.hp,
        enemyMaxHP: creatureData.hp,
        enemyElement: creatureData.element as TPElement,
        enemyDamage: creatureData.damage,
        enemySpeed: creatureData.speed,
        playerHP: prev.survival.health,
        turnCount: 1,
        log: [{
          timestamp: Date.now(),
          action: `A wild ${creatureData.name} appeared!`,
          actor: 'enemy',
        }],
        statusEffects: [],
        rewards: null,
        startedAt: Date.now(),
      };

      const newNotifications: TPNotification[] = [];
      newNotifications.push(
        tpCreateNotification('battle', `Wild encounter: ${creatureData.name}!`, creatureData.icon),
      );

      return {
        ...prev,
        activeBattle: newBattle,
        notifications: [...prev.notifications, ...newNotifications],
      };
    });
  }, [battleCreaturePool]);

  const setWeatherControlLevel = useCallback((level: number) => {
    setState(prev => ({
      ...prev,
      weatherControlLevel: Math.max(1, Math.min(10, level)),
    }));
  }, []);

  const setStormIntensity = useCallback((intensity: number) => {
    setState(prev => ({
      ...prev,
      stormIntensity: Math.max(0, Math.min(TP_STORM_INTENSITY_MAX, intensity)),
    }));
  }, []);

  const triggerWeatherEvent = useCallback((weatherId: string, intensity?: number) => {
    setState(prev => {
      const weatherData = TP_WEATHER_PHENOMENA.find(w => w.id === weatherId);
      if (!weatherData) return prev;

      const newIntensity = intensity ?? Math.floor(Math.random() * 50) + 50;
      const newNotifications: TPNotification[] = [];
      newNotifications.push(
        tpCreateNotification('forecast', `Weather Event: ${weatherData.name} (Intensity: ${newIntensity})!`, weatherData.icon),
      );

      const damageFromWeather = Math.floor(weatherData.power * (newIntensity / 100));
      const newSurvival = {
        ...prev.survival,
        health: Math.max(1, prev.survival.health - damageFromWeather),
        stamina: Math.max(0, prev.survival.stamina - Math.floor(damageFromWeather / 2)),
      };

      return {
        ...prev,
        stormIntensity: newIntensity,
        survival: newSurvival,
        notifications: [...prev.notifications, ...newNotifications],
      };
    });
  }, []);

  const resetAllProgress = useCallback(() => {
    setState(tpGetDefaultState());
  }, []);

  const getTrailInfo = useCallback((trailId: string) => {
    const trail = TP_MOUNTAIN_TRAILS.find(t => t.id === trailId);
    const progress = stateRef.current.trailProgress.find(t => t.trailId === trailId);
    return { trail, progress };
  }, []);

  const getCreatureInfo = useCallback((creatureId: string) => {
    const creature = TP_STORM_CREATURES.find(c => c.id === creatureId);
    const record = stateRef.current.creatureRecords.find(c => c.creatureId === creatureId);
    return { creature, record };
  }, []);

  const getAbilityCooldownRemaining = useCallback((abilityId: string): number => {
    const abilityData = TP_LIGHTNING_ABILITIES.find(a => a.id === abilityId);
    const abilityProgress = stateRef.current.abilityProgress.find(a => a.abilityId === abilityId);
    if (!abilityData || !abilityProgress) return 0;
    const elapsed = Date.now() - abilityProgress.lastCastTime;
    return Math.max(0, abilityData.cooldown - elapsed);
  }, []);

  const getSpiritCooldownRemaining = useCallback((spiritId: string): number => {
    const progress = stateRef.current.spiritProgress.find(s => s.spiritId === spiritId);
    if (!progress) return 0;
    const elapsed = Date.now() - progress.lastSummonTime;
    return Math.max(0, TP_SPIRIT_COOLDOWN_MS - elapsed);
  }, []);

  const getAscendCooldownRemaining = useCallback((): number => {
    const elapsed = Date.now() - stateRef.current.lastAscendTime;
    return Math.max(0, TP_ASCEND_COOLDOWN_MS - elapsed);
  }, []);

  // -------------------------------------------------------------------------
  // Return the API object
  // -------------------------------------------------------------------------

  return {
    // Raw state
    state,
    level: state.level,
    xp: state.xp,
    xpToNextLevel: state.xpToNextLevel,
    totalXP: state.totalXP,
    stormCrystals: state.stormCrystals,
    totalCrystalsEarned: state.totalCrystalsEarned,
    currentTrailId: state.currentTrailId,
    currentAltitude: state.currentAltitude,
    survival: state.survival,
    activeBattle: state.activeBattle,
    activeTab: state.activeTab,
    notifications: state.notifications,
    weatherControlLevel: state.weatherControlLevel,
    stormIntensity: state.stormIntensity,
    totalAscensions: state.totalAscensions,
    totalBattlesWon: state.totalBattlesWon,
    totalBattlesLost: state.totalBattlesLost,
    totalSpellsCast: state.totalSpellsCast,
    totalSpiritsSummoned: state.totalSpiritsSummoned,

    // Computed values
    currentTitle,
    currentTrail,
    levelProgress,
    unlockedAbilities,
    unlockedSpirits,
    masteredWeather,
    unlockedAchievements,
    totalStatBonus,
    todayForecast,
    forecastHistory,
    unmadeDiscoveries,
    shopItems,
    purchaseableSpirits,
    battleCreaturePool,
    stormPowerRating,
    altitudePercent,

    // Tab actions
    setActiveTab,
    dismissNotification,
    clearAllNotifications,

    // XP & currency
    addXP,
    addStormCrystals,
    spendStormCrystals,

    // Trail actions
    selectTrail,
    ascendTrail,
    climbHigher,
    descendTrail,

    // Ability actions
    castAbility,

    // Weather actions
    studyWeather,
    generateNewForecast,
    predictWeather,
    triggerWeatherEvent,
    setWeatherControlLevel,
    setStormIntensity,

    // Spirit actions
    befriendSpirit,
    summonSpirit,
    feedSpirit,

    // Equipment actions
    buyEquipment,
    equipItem,
    unequipItem,

    // Discovery actions
    makeDiscovery,

    // Battle actions
    startBattle,
    useBattleAbility,
    battleFlee,
    endBattle,
    processBattleReward,
    triggerRandomEncounter,

    // Survival actions
    restAtCamp,
    recoverStamina,
    recoverMana,
    recoverHealth,

    // Utility
    resetAllProgress,
    getTrailInfo,
    getCreatureInfo,
    getAbilityCooldownRemaining,
    getSpiritCooldownRemaining,
    getAscendCooldownRemaining,
  };
}
