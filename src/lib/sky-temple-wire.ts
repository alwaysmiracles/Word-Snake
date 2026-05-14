// Sky Temple Wire Module — Celestial Temple for Word Snake
// Color theme: gold #FBBF24, cream #FEF3C7, sky blue #7DD3FC

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';

// ---------------------------------------------------------------------------
// STM_ prefixed data constants
// ---------------------------------------------------------------------------

export const STM_RARITY_COMMON = 'common' as const;
export const STM_RARITY_UNCOMMON = 'uncommon' as const;
export const STM_RARITY_RARE = 'rare' as const;
export const STM_RARITY_EPIC = 'epic' as const;
export const STM_RARITY_LEGENDARY = 'legendary' as const;

export const STM_GOLD = '#FBBF24';
export const STM_CREAM = '#FEF3C7';
export const STM_SKY_BLUE = '#7DD3FC';
export const STM_WHITE = '#FFFFFF';
export const STM_DEEP_BLUE = '#1E3A5F';
export const STM_LAVENDER = '#C4B5FD';
export const STM_ROSE = '#FDA4AF';

export const STM_TITLE_PILGRIM = 'Pilgrim' as const;
export const STM_TITLE_ACOLYTE = 'Acolyte' as const;
export const STM_TITLE_DEVOTEE = 'Devotee' as const;
export const STM_TITLE_ORACLE = 'Oracle' as const;
export const STM_TITLE_SAGE = 'Sage' as const;
export const STM_TITLE_HIEROPHANT = 'Hierophant' as const;
export const STM_TITLE_STELLAR_GUARDIAN = 'Stellar Guardian' as const;
export const STM_TITLE_CELESTIAL_HIGH_PRIEST = 'Celestial High Priest' as const;

export const STM_EVENT_SOLSTICE = 'summer_solstice' as const;
export const STM_EVENT_EQUINOX = 'vernal_equinox' as const;
export const STM_EVENT_METEOR_SHOWER = 'meteor_shower' as const;
export const STM_EVENT_LUNAR_ECLIPSE = 'lunar_eclipse' as const;
export const STM_EVENT_SOLAR_ECLIPSE = 'solar_eclipse' as const;
export const STM_EVENT_NORTHERN_LIGHTS = 'northern_lights' as const;
export const STM_EVENT_HALO_MOON = 'halo_moon' as const;
export const STM_EVENT_COMET_PASSAGE = 'comet_passage' as const;

export const STM_CHAMBER_HALL_OF_DAWN = 'hall_of_dawn' as const;
export const STM_CHAMBER_CHAMBER_OF_TWILIGHT = 'chamber_of_twilight' as const;
export const STM_CHAMBER_ROOM_OF_STARS = 'room_of_stars' as const;
export const STM_CHAMBER_VAULT_OF_WINDS = 'vault_of_winds' as const;
export const STM_CHAMBER_GARDEN_OF_CLOUDS = 'garden_of_clouds' as const;
export const STM_CHAMBER_SANCTUARY_OF_LIGHT = 'sanctuary_of_light' as const;
export const STM_CHAMBER_POOL_OF_MOONBEAMS = 'pool_of_moonbeams' as const;
export const STM_CHAMBER_THRONE_OF_HEAVENS = 'throne_of_heavens' as const;

export const STM_RELICS: readonly CelestialRelicDef[] = [
  { id: 'sun_stone', name: 'Sun Stone', rarity: STM_RARITY_COMMON, description: 'A warm stone radiating golden light from the heart of a star.', offeringPower: 10, icon: '☀️' },
  { id: 'moon_crystal', name: 'Moon Crystal', rarity: STM_RARITY_COMMON, description: 'A translucent crystal that shimmers with pale lunar energy.', offeringPower: 10, icon: '🌙' },
  { id: 'star_fragment', name: 'Star Fragment', rarity: STM_RARITY_COMMON, description: 'A shard of crystallized starlight that hums softly.', offeringPower: 12, icon: '⭐' },
  { id: 'cloud_pearl', name: 'Cloud Pearl', rarity: STM_RARITY_COMMON, description: 'A pearl formed within the belly of a thundercloud.', offeringPower: 11, icon: '☁️' },
  { id: 'wind_gem', name: 'Wind Gem', rarity: STM_RARITY_COMMON, description: 'A gemstone that swirls with captured breezes.', offeringPower: 10, icon: '💨' },
  { id: 'thunder_orb', name: 'Thunder Orb', rarity: STM_RARITY_COMMON, description: 'A crackling sphere of contained storm energy.', offeringPower: 13, icon: '⚡' },
  { id: 'dew_drop_gem', name: 'Dew Drop Gem', rarity: STM_RARITY_COMMON, description: 'A gemstone that glistens like morning dew on lotus petals.', offeringPower: 9, icon: '💧' },
  { id: 'dawn_feather', name: 'Dawn Feather', rarity: STM_RARITY_UNCOMMON, description: 'A feather shed by the mythical Dawn Phoenix.', offeringPower: 20, icon: '🪶' },
  { id: 'rainbow_prism', name: 'Rainbow Prism', rarity: STM_RARITY_UNCOMMON, description: 'A prism that splits light into all seven celestial colors.', offeringPower: 22, icon: '🌈' },
  { id: 'eclipse_shard', name: 'Eclipse Shard', rarity: STM_RARITY_UNCOMMON, description: 'A fragment of dark glass from a solar eclipse.', offeringPower: 25, icon: '🌑' },
  { id: 'aurora_crystal', name: 'Aurora Crystal', rarity: STM_RARITY_UNCOMMON, description: 'A crystal pulsing with northern lights energy.', offeringPower: 23, icon: '🌌' },
  { id: 'mist_opal', name: 'Mist Opal', rarity: STM_RARITY_UNCOMMON, description: 'An opal swirling with clouds and hidden visions.', offeringPower: 21, icon: '🔮' },
  { id: 'zenith_stone', name: 'Zenith Stone', rarity: STM_RARITY_UNCOMMON, description: 'A stone that always points toward the highest heaven.', offeringPower: 24, icon: '⬆️' },
  { id: 'twilight_sapphire', name: 'Twilight Sapphire', rarity: STM_RARITY_UNCOMMON, description: 'A deep blue sapphire that glows at dusk.', offeringPower: 22, icon: '💎' },
  { id: 'halo_ring', name: 'Halo Ring', rarity: STM_RARITY_RARE, description: 'A golden ring that once crowned a lesser deity.', offeringPower: 40, icon: '💍' },
  { id: 'comet_heart', name: 'Comet Heart', rarity: STM_RARITY_RARE, description: 'The blazing core of a comet, still warm.', offeringPower: 45, icon: '☄️' },
  { id: 'nebula_flame', name: 'Nebula Flame', rarity: STM_RARITY_RARE, description: 'A flame burning with the colors of a distant nebula.', offeringPower: 42, icon: '🔥' },
  { id: 'celestial_harp_string', name: 'Celestial Harp String', rarity: STM_RARITY_RARE, description: 'A string from the harp played by the gods.', offeringPower: 38, icon: '🎵' },
  { id: 'void_pearl', name: 'Void Pearl', rarity: STM_RARITY_RARE, description: 'A pearl from the space between constellations.', offeringPower: 44, icon: '🌑' },
  { id: 'sun_crown_shard', name: 'Sun Crown Shard', rarity: STM_RARITY_RARE, description: 'A fragment from the crown of the Sun God.', offeringPower: 46, icon: '👑' },
  { id: 'star_map_fragment', name: 'Star Map Fragment', rarity: STM_RARITY_RARE, description: 'A piece of the ancient celestial navigation chart.', offeringPower: 41, icon: '🗺️' },
  { id: 'solar_flare_ember', name: 'Solar Flare Ember', rarity: STM_RARITY_RARE, description: 'An ember captured from a solar flare.', offeringPower: 43, icon: '☄️' },
  { id: 'lunar_tear', name: 'Lunar Tear', rarity: STM_RARITY_EPIC, description: 'A tear shed by the Moon Goddess herself.', offeringPower: 80, icon: '💧' },
  { id: 'firmament_shard', name: 'Firmament Shard', rarity: STM_RARITY_EPIC, description: 'A piece of the crystalline dome that separates earth from heaven.', offeringPower: 85, icon: '💠' },
  { id: 'divine_scepter_core', name: 'Divine Scepter Core', rarity: STM_RARITY_EPIC, description: 'The glowing core of the Scepter of Sovereignty.', offeringPower: 90, icon: '🏆' },
  { id: 'heavens_gate_key', name: "Heaven's Gate Key", rarity: STM_RARITY_EPIC, description: 'A key forged from condensed starlight.', offeringPower: 88, icon: '🔑' },
  { id: 'constellation_essence', name: 'Constellation Essence', rarity: STM_RARITY_EPIC, description: 'Liquid starlight extracted from a living constellation.', offeringPower: 82, icon: '✨' },
  { id: 'solar_serpent_scale', name: 'Solar Serpent Scale', rarity: STM_RARITY_EPIC, description: 'A golden scale from the celestial serpent that encircles the sun.', offeringPower: 87, icon: '🐉' },
  { id: 'moon_well_water', name: 'Moon Well Water', rarity: STM_RARITY_EPIC, description: 'Sacred water drawn from the bottomless Moon Well.', offeringPower: 83, icon: '🏺' },
  { id: 'genesis_star_heart', name: 'Genesis Star Heart', rarity: STM_RARITY_LEGENDARY, description: 'The pulsing heart of the first star ever born.', offeringPower: 200, icon: '🌟' },
  { id: 'creator_s_scroll', name: "Creator's Scroll", rarity: STM_RARITY_LEGENDARY, description: 'A scroll containing the true names of every star.', offeringPower: 210, icon: '📜' },
  { id: 'omniscient_orb', name: 'Omniscient Orb', rarity: STM_RARITY_LEGENDARY, description: 'An orb that reveals all secrets of the cosmos.', offeringPower: 220, icon: '🔮' },
  { id: 'eternal_flame_spark', name: 'Eternal Flame Spark', rarity: STM_RARITY_LEGENDARY, description: 'A spark from the flame that burns at the center of all creation.', offeringPower: 215, icon: '🔥' },
  { id: 'celestial_dragons_eye', name: "Celestial Dragon's Eye", rarity: STM_RARITY_LEGENDARY, description: 'The right eye of the great celestial dragon.', offeringPower: 225, icon: '👁️' },
  { id: 'heavenly_pillars_core', name: "Heavenly Pillar's Core", rarity: STM_RARITY_LEGENDARY, description: 'The core of the pillar that holds up the sky.', offeringPower: 230, icon: '🏛️' },
  { id: 'time_sands_vial', name: "Time Sand's Vial", rarity: STM_RARITY_LEGENDARY, description: 'A vial of enchanted sand that controls the flow of time.', offeringPower: 235, icon: '⏳' },
];

export const STM_CHAMBERS: readonly TempleChamberDef[] = [
  { id: STM_CHAMBER_HALL_OF_DAWN, name: 'Hall of Dawn', requiredDevotion: 0, description: 'The entry hall bathed in eternal morning light. New pilgrims begin their journey here.', relics: ['sun_stone', 'dawn_feather', 'dew_drop_gem'], unlockedByDefault: true },
  { id: STM_CHAMBER_CHAMBER_OF_TWILIGHT, name: 'Chamber of Twilight', requiredDevotion: 100, description: 'A serene room where day meets night, filled with violet and amber hues.', relics: ['moon_crystal', 'twilight_sapphire', 'mist_opal'], unlockedByDefault: false },
  { id: STM_CHAMBER_ROOM_OF_STARS, name: 'Room of Stars', requiredDevotion: 300, description: 'An open-air room with no ceiling, revealing the infinite cosmos above.', relics: ['star_fragment', 'aurora_crystal', 'star_map_fragment'], unlockedByDefault: false },
  { id: STM_CHAMBER_VAULT_OF_WINDS, name: 'Vault of Winds', requiredDevotion: 600, description: 'A vast chamber where sacred winds carry whispered prophecies.', relics: ['wind_gem', 'thunder_orb', 'solar_flare_ember'], unlockedByDefault: false },
  { id: STM_CHAMBER_GARDEN_OF_CLOUDS, name: 'Garden of Clouds', requiredDevotion: 1000, description: 'A floating garden where celestial flowers bloom in eternal spring.', relics: ['cloud_pearl', 'rainbow_prism', 'void_pearl'], unlockedByDefault: false },
  { id: STM_CHAMBER_SANCTUARY_OF_LIGHT, name: 'Sanctuary of Light', requiredDevotion: 1500, description: 'The inner sanctum of pure radiance where blessings are granted.', relics: ['halo_ring', 'nebula_flame', 'heavens_gate_key'], unlockedByDefault: false },
  { id: STM_CHAMBER_POOL_OF_MOONBEAMS, name: 'Pool of Moonbeams', requiredDevotion: 2200, description: 'A reflective pool that shows visions when the moon is full.', relics: ['lunar_tear', 'moon_well_water', 'eclipse_shard'], unlockedByDefault: false },
  { id: STM_CHAMBER_THRONE_OF_HEAVENS, name: 'Throne of Heavens', requiredDevotion: 3500, description: 'The highest chamber where the throne of the Celestial Sovereign resides.', relics: ['genesis_star_heart', 'omniscient_orb', 'celestial_dragons_eye'], unlockedByDefault: false },
];

export const STM_OFFERINGS: readonly OfferingItemDef[] = [
  { id: 'incense_sandalwood', name: 'Sandalwood Incense', offeringValue: 5, description: 'A calming incense favored by temple monks.', icon: '🪔' },
  { id: 'incense_lotus', name: 'Lotus Incense', offeringValue: 7, description: 'Rare incense made from celestial lotus petals.', icon: '🪔' },
  { id: 'incense_starlight', name: 'Starlight Incense', offeringValue: 12, description: 'Incense that glows with captured starlight.', icon: '🪔' },
  { id: 'celestial_fruit_peach', name: 'Celestial Peach', offeringValue: 8, description: 'A peach from the orchard of immortals.', icon: '🍑' },
  { id: 'celestial_fruit_pear', name: 'Jade Pear', offeringValue: 10, description: 'A luminescent pear from the cloud orchards.', icon: '🍐' },
  { id: 'celestial_fruit_plum', name: 'Star Plum', offeringValue: 9, description: 'A dark plum bursting with cosmic juice.', icon: '🍒' },
  { id: 'spirit_candle_white', name: 'White Spirit Candle', offeringValue: 6, description: 'A candle that burns with a pure white flame.', icon: '🕯️' },
  { id: 'spirit_candle_gold', name: 'Golden Spirit Candle', offeringValue: 15, description: 'A candle that burns liquid gold.', icon: '🕯️' },
  { id: 'spirit_candle_blue', name: 'Azure Spirit Candle', offeringValue: 13, description: 'A candle whose flame burns the color of the sky.', icon: '🕯️' },
  { id: 'blessed_water_dawn', name: 'Dawn Blessed Water', offeringValue: 8, description: 'Water collected from the first dew of dawn.', icon: '💧' },
  { id: 'blessed_water_moon', name: 'Moon Blessed Water', offeringValue: 11, description: 'Water that has reflected a full moon.', icon: '💧' },
  { id: 'blessed_water_star', name: 'Star Blessed Water', offeringValue: 14, description: 'Water that fell as rain during a meteor shower.', icon: '💧' },
  { id: 'prayer_beads_jade', name: 'Jade Prayer Beads', offeringValue: 10, description: 'Smooth jade beads used in temple meditation.', icon: '📿' },
  { id: 'prayer_beads_cystal', name: 'Crystal Prayer Beads', offeringValue: 16, description: 'Prayer beads carved from a single star crystal.', icon: '📿' },
  { id: 'silk_vestment_white', name: 'White Silk Vestment', offeringValue: 20, description: 'A ceremonial vestment woven from cloud silk.', icon: '👘' },
  { id: 'silk_vestment_gold', name: 'Gold Silk Vestment', offeringValue: 25, description: 'A vestment woven with threads of solid gold.', icon: '👘' },
  { id: 'lotus_flower_white', name: 'White Lotus Flower', offeringValue: 7, description: 'A pristine white lotus that never wilts.', icon: '🪷' },
  { id: 'lotus_flower_blue', name: 'Blue Lotus Flower', offeringValue: 9, description: 'A rare blue lotus that glows at night.', icon: '🪷' },
  { id: 'lotus_flower_gold', name: 'Golden Lotus Flower', offeringValue: 15, description: 'A legendary golden lotus of pure light.', icon: '🪷' },
  { id: 'scroll_prayer', name: 'Prayer Scroll', offeringValue: 8, description: 'A scroll inscribed with ancient blessings.', icon: '📜' },
  { id: 'scroll_protection', name: 'Protection Scroll', offeringValue: 12, description: 'A scroll that wards against negative energy.', icon: '📜' },
  { id: 'scroll_wisdom', name: 'Wisdom Scroll', offeringValue: 18, description: 'A scroll containing the wisdom of the ancients.', icon: '📜' },
  { id: 'wind_chime_silver', name: 'Silver Wind Chime', offeringValue: 10, description: 'A chime that plays notes from the celestial scale.', icon: '🎐' },
  { id: 'wind_chime_gold', name: 'Golden Wind Chime', offeringValue: 20, description: 'A chime that summons favorable winds.', icon: '🎐' },
  { id: 'offering_plate_jade', name: 'Jade Offering Plate', offeringValue: 14, description: 'A plate carved from nephrite jade.', icon: '🍽️' },
  { id: 'offering_bowl_gold', name: 'Golden Offering Bowl', offeringValue: 22, description: 'A ceremonial bowl of pure gold.', icon: '🥣' },
  { id: 'star_lantern', name: 'Star Lantern', offeringValue: 17, description: 'A lantern that floats upward toward the stars.', icon: '🏮' },
  { id: 'moon_rabbit_statue', name: 'Moon Rabbit Statue', offeringValue: 30, description: 'A carved statue of the legendary moon rabbit.', icon: '🐰' },
  { id: 'phoenix_feather_wreath', name: 'Phoenix Feather Wreath', offeringValue: 35, description: 'A wreath woven from phoenix tail feathers.', icon: '🪶' },
  { id: 'dragon_jade_statue', name: 'Dragon Jade Statue', offeringValue: 40, description: 'A masterwork jade carving of a celestial dragon.', icon: '🐲' },
];

export const STM_STRUCTURES: readonly TempleStructureDef[] = [
  { id: 'prayer_altar', name: 'Prayer Altar', buildCost: 0, devotionPerDay: 2, description: 'A simple stone altar for daily prayers.', icon: '⛩️', tier: 1 },
  { id: 'meditation_pavilion', name: 'Meditation Pavilion', buildCost: 50, devotionPerDay: 4, description: 'A quiet pavilion for deep meditation sessions.', icon: '🏮', tier: 1 },
  { id: 'star_observatory', name: 'Star Observatory', buildCost: 120, devotionPerDay: 6, description: 'A dome-shaped tower for observing celestial bodies.', icon: '🔭', tier: 2 },
  { id: 'incense_tower', name: 'Incense Tower', buildCost: 80, devotionPerDay: 5, description: 'A tower where sacred incense burns eternally.', icon: '🗼', tier: 1 },
  { id: 'bell_tower', name: 'Bell Tower', buildCost: 100, devotionPerDay: 5, description: 'A tower housing the great temple bell.', icon: '🔔', tier: 2 },
  { id: 'scripture_library', name: 'Scripture Library', buildCost: 150, devotionPerDay: 7, description: 'A library of ancient celestial scriptures.', icon: '📚', tier: 2 },
  { id: 'moon_bridge', name: 'Moon Bridge', buildCost: 200, devotionPerDay: 8, description: 'An arched bridge that glows under moonlight.', icon: '🌉', tier: 2 },
  { id: 'zen_garden', name: 'Zen Garden', buildCost: 90, devotionPerDay: 4, description: 'A rock garden for peaceful contemplation.', icon: '摆放', tier: 1 },
  { id: 'sacred_pond', name: 'Sacred Pond', buildCost: 130, devotionPerDay: 6, description: 'A pond filled with lotus and blessed koi.', icon: '🐟', tier: 2 },
  { id: 'offering_hall', name: 'Offering Hall', buildCost: 180, devotionPerDay: 7, description: 'A grand hall for placing offerings.', icon: '🏛️', tier: 2 },
  { id: 'pilgrim_lodge', name: 'Pilgrim Lodge', buildCost: 70, devotionPerDay: 3, description: 'Lodging for visiting pilgrims and seekers.', icon: '🏠', tier: 1 },
  { id: 'healing_spring', name: 'Healing Spring', buildCost: 250, devotionPerDay: 9, description: 'A spring whose waters cure all ailments.', icon: '⛲', tier: 3 },
  { id: 'cloud_terrace', name: 'Cloud Terrace', buildCost: 300, devotionPerDay: 10, description: 'An open terrace floating among the clouds.', icon: '☁️', tier: 3 },
  { id: 'solar_shrine', name: 'Solar Shrine', buildCost: 280, devotionPerDay: 10, description: 'A shrine dedicated to the Sun God.', icon: '☀️', tier: 3 },
  { id: 'lunar_shrine', name: 'Lunar Shrine', buildCost: 280, devotionPerDay: 10, description: 'A shrine dedicated to the Moon Goddess.', icon: '🌙', tier: 3 },
  { id: 'stargazing_platform', name: 'Stargazing Platform', buildCost: 350, devotionPerDay: 12, description: 'The highest platform, perfect for stargazing.', icon: '🌌', tier: 3 },
  { id: 'treasure_vault', name: 'Treasure Vault', buildCost: 400, devotionPerDay: 11, description: 'A secure vault for storing precious relics.', icon: '🏦', tier: 4 },
  { id: 'celestial_workshop', name: 'Celestial Workshop', buildCost: 320, devotionPerDay: 9, description: 'Where sacred artifacts are crafted and repaired.', icon: '🔨', tier: 3 },
  { id: 'blessing_fountain', name: 'Blessing Fountain', buildCost: 450, devotionPerDay: 13, description: 'A fountain that dispenses divine blessings.', icon: '⛲', tier: 4 },
  { id: 'eternal_flame_pillar', name: 'Eternal Flame Pillar', buildCost: 500, devotionPerDay: 14, description: 'A pillar crowned with an undying flame.', icon: '🔥', tier: 4 },
  { id: 'crystal_cathedral', name: 'Crystal Cathedral', buildCost: 600, devotionPerDay: 16, description: 'A cathedral built entirely from living crystal.', icon: '💎', tier: 5 },
  { id: 'sky_gate', name: 'Sky Gate', buildCost: 700, devotionPerDay: 18, description: 'The great gate connecting the temple to the heavens.', icon: '⛩️', tier: 5 },
  { id: 'throne_room_annex', name: 'Throne Room Annex', buildCost: 800, devotionPerDay: 20, description: 'An annex to the Throne of Heavens for ceremonies.', icon: '👑', tier: 5 },
  { id: 'infinity_courtyard', name: 'Infinity Courtyard', buildCost: 650, devotionPerDay: 15, description: 'A courtyard that seems to stretch into infinity.', icon: '🌀', tier: 5 },
  { id: 'song_pavilion', name: 'Song Pavilion', buildCost: 380, devotionPerDay: 12, description: 'A pavilion where celestial music echoes eternally.', icon: '🎵', tier: 4 },
];

export const STM_ABILITIES: readonly DivineAbilityDef[] = [
  { id: 'sun_beam', name: 'Sun Beam', cooldown: 5, power: 15, description: 'Fires a concentrated beam of sunlight.', unlockCost: 0, icon: '☀️', element: 'light' },
  { id: 'moon_shield', name: 'Moon Shield', cooldown: 8, power: 20, description: 'Creates a protective barrier of moonlight.', unlockCost: 0, icon: '🛡️', element: 'light' },
  { id: 'wind_walk', name: 'Wind Walk', cooldown: 10, power: 12, description: 'Move swiftly on the sacred winds.', unlockCost: 50, icon: '💨', element: 'wind' },
  { id: 'star_fall', name: 'Star Fall', cooldown: 15, power: 35, description: 'Call down a rain of miniature stars.', unlockCost: 100, icon: '⭐', element: 'cosmic' },
  { id: 'thunder_strike', name: 'Thunder Strike', cooldown: 12, power: 28, description: 'Strike with the fury of celestial thunder.', unlockCost: 80, icon: '⚡', element: 'wind' },
  { id: 'healing_rain', name: 'Healing Rain', cooldown: 20, power: 25, description: 'Summon a rain of restorative moonbeams.', unlockCost: 120, icon: '🌧️', element: 'water' },
  { id: 'divine_sight', name: 'Divine Sight', cooldown: 30, power: 10, description: 'See hidden truths and secret paths.', unlockCost: 150, icon: '👁️', element: 'light' },
  { id: 'cloud_step', name: 'Cloud Step', cooldown: 7, power: 8, description: 'Step on clouds as if they were solid ground.', unlockCost: 60, icon: '☁️', element: 'wind' },
  { id: 'eclipse_veil', name: 'Eclipse Veil', cooldown: 25, power: 30, description: 'Shroud yourself in the darkness of an eclipse.', unlockCost: 200, icon: '🌑', element: 'cosmic' },
  { id: 'aurora_blaze', name: 'Aurora Blaze', cooldown: 18, power: 32, description: 'Unleash the colorful fury of the northern lights.', unlockCost: 180, icon: '🌌', element: 'cosmic' },
  { id: 'prayer_boost', name: 'Prayer Boost', cooldown: 60, power: 50, description: 'Amplify all temple devotion gained.', unlockCost: 250, icon: '🪔', element: 'light' },
  { id: 'star_shower', name: 'Star Shower', cooldown: 22, power: 38, description: 'A dazzling shower of shooting stars.', unlockCost: 220, icon: '🌠', element: 'cosmic' },
  { id: 'wind_blessing', name: 'Wind Blessing', cooldown: 14, power: 18, description: 'Bless allies with the speed of the wind.', unlockCost: 90, icon: '🎐', element: 'wind' },
  { id: 'solar_flare', name: 'Solar Flare', cooldown: 30, power: 45, description: 'Unleash a devastating burst of solar energy.', unlockCost: 300, icon: '🔥', element: 'light' },
  { id: 'lunar_tide', name: 'Lunar Tide', cooldown: 20, power: 27, description: 'Summon the gravitational pull of the moon.', unlockCost: 160, icon: '🌊', element: 'water' },
  { id: 'comet_dash', name: 'Comet Dash', cooldown: 8, power: 14, description: 'Dash forward with the speed of a comet.', unlockCost: 70, icon: '☄️', element: 'cosmic' },
  { id: 'zen_mind', name: 'Zen Mind', cooldown: 45, power: 22, description: 'Enter a state of perfect calm and clarity.', unlockCost: 130, icon: '🧘', element: 'light' },
  { id: 'thunder_storm', name: 'Thunder Storm', cooldown: 35, power: 42, description: 'Summon a full celestial thunderstorm.', unlockCost: 280, icon: '⛈️', element: 'wind' },
  { id: 'celestial_ward', name: 'Celestial Ward', cooldown: 40, power: 35, description: 'Create a ward that repels all dark influences.', unlockCost: 320, icon: '💠', element: 'light' },
  { id: 'nebula_burst', name: 'Nebula Burst', cooldown: 28, power: 40, description: 'Explode with the colorful force of a nebula.', unlockCost: 260, icon: '🌌', element: 'cosmic' },
  { id: 'rain_serenity', name: 'Rain Serenity', cooldown: 16, power: 20, description: 'A gentle rain that soothes all anger and fear.', unlockCost: 110, icon: '🌦️', element: 'water' },
  { id: 'sunrise_rebirth', name: 'Sunrise Rebirth', cooldown: 50, power: 55, description: 'Be reborn in the light of a new dawn.', unlockCost: 400, icon: '🌅', element: 'light' },
];

export const STM_ACHIEVEMENTS: readonly AchievementDef[] = [
  { id: 'first_prayer', name: 'First Prayer', description: 'Offer your first prayer at the temple.', requirement: 1, category: 'devotion', icon: '🪔' },
  { id: 'devoted_follower', name: 'Devoted Follower', description: 'Reach 100 total devotion points.', requirement: 100, category: 'devotion', icon: '🙏' },
  { id: 'temple_scholar', name: 'Temple Scholar', description: 'Reach 500 total devotion points.', requirement: 500, category: 'devotion', icon: '📖' },
  { id: 'divine_servant', name: 'Divine Servant', description: 'Reach 1500 total devotion points.', requirement: 1500, category: 'devotion', icon: '✨' },
  { id: 'celestial_master', name: 'Celestial Master', description: 'Reach 5000 total devotion points.', requirement: 5000, category: 'devotion', icon: '🌟' },
  { id: 'relic_collector_5', name: 'Novice Collector', description: 'Collect 5 unique celestial relics.', requirement: 5, category: 'relics', icon: '💎' },
  { id: 'relic_collector_15', name: 'Avid Collector', description: 'Collect 15 unique celestial relics.', requirement: 15, category: 'relics', icon: '🏆' },
  { id: 'relic_collector_35', name: 'Legendary Collector', description: 'Collect all 35 celestial relics.', requirement: 35, category: 'relics', icon: '👑' },
  { id: 'chamber_explorer_3', name: 'Chamber Seeker', description: 'Unlock 3 temple chambers.', requirement: 3, category: 'chambers', icon: '🚪' },
  { id: 'chamber_explorer_6', name: 'Chamber Wanderer', description: 'Unlock 6 temple chambers.', requirement: 6, category: 'chambers', icon: '🏰' },
  { id: 'all_chambers', name: 'Master of Chambers', description: 'Unlock all 8 temple chambers.', requirement: 8, category: 'chambers', icon: '🏅' },
  { id: 'offering_10', name: 'Generous Soul', description: 'Make 10 offerings at the temple.', requirement: 10, category: 'offerings', icon: '🎁' },
  { id: 'offering_50', name: 'Devout Offerer', description: 'Make 50 offerings at the temple.', requirement: 50, category: 'offerings', icon: '💒' },
  { id: 'meditation_7', name: 'Week of Zen', description: 'Complete 7 meditation sessions.', requirement: 7, category: 'meditation', icon: '🧘' },
  { id: 'meditation_30', name: 'Monthly Mindfulness', description: 'Complete 30 meditation sessions.', requirement: 30, category: 'meditation', icon: '☯️' },
  { id: 'constellation_5', name: 'Star Reader', description: 'Map 5 constellations.', requirement: 5, category: 'stars', icon: '⭐' },
  { id: 'constellation_12', name: 'Zodiac Master', description: 'Map all 12 zodiac constellations.', requirement: 12, category: 'stars', icon: '♈' },
  { id: 'legendary_offering', name: 'Legendary Offering', description: 'Offer a legendary rarity relic.', requirement: 1, category: 'legendary', icon: '🔥' },
];

export const STM_TITLES: readonly TitleDef[] = [
  { id: STM_TITLE_PILGRIM, name: 'Pilgrim', requiredDevotion: 0, description: 'A humble traveler who has begun the celestial journey.', bonusMultiplier: 1.0 },
  { id: STM_TITLE_ACOLYTE, name: 'Acolyte', requiredDevotion: 100, description: 'An initiated student of the temple mysteries.', bonusMultiplier: 1.1 },
  { id: STM_TITLE_DEVOTEE, name: 'Devotee', requiredDevotion: 300, description: 'A dedicated follower of the celestial path.', bonusMultiplier: 1.2 },
  { id: STM_TITLE_ORACLE, name: 'Oracle', requiredDevotion: 700, description: 'One who can read the signs in the stars.', bonusMultiplier: 1.35 },
  { id: STM_TITLE_SAGE, name: 'Sage', requiredDevotion: 1200, description: 'A wise scholar who has mastered temple wisdom.', bonusMultiplier: 1.5 },
  { id: STM_TITLE_HIEROPHANT, name: 'Hierophant', requiredDevotion: 2000, description: 'A high priest who interprets divine will.', bonusMultiplier: 1.7 },
  { id: STM_TITLE_STELLAR_GUARDIAN, name: 'Stellar Guardian', requiredDevotion: 3200, description: 'Protector of the celestial relics and chambers.', bonusMultiplier: 2.0 },
  { id: STM_TITLE_CELESTIAL_HIGH_PRIEST, name: 'Celestial High Priest', requiredDevotion: 5000, description: 'The supreme authority of the Sky Temple.', bonusMultiplier: 2.5 },
];

export const STM_CELESTIAL_EVENTS: readonly CelestialEventDef[] = [
  { id: STM_EVENT_SOLSTICE, name: 'Summer Solstice', description: 'The longest day of the year. Sun Stone offerings are doubled.', devotionBonus: 2.0, durationHours: 24, icon: '☀️' },
  { id: STM_EVENT_EQUINOX, name: 'Vernal Equinox', description: 'Day and night are balanced. All relic offerings gain +50%.', devotionBonus: 1.5, durationHours: 24, icon: '🌿' },
  { id: STM_EVENT_METEOR_SHOWER, name: 'Meteor Shower', description: 'Stars fall from the sky! Chance to find rare relics is tripled.', devotionBonus: 1.0, durationHours: 12, icon: '🌠' },
  { id: STM_EVENT_LUNAR_ECLIPSE, name: 'Lunar Eclipse', description: 'The moon turns red. Moon Crystal offerings are tripled.', devotionBonus: 3.0, durationHours: 6, icon: 'blood_moon' },
  { id: STM_EVENT_SOLAR_ECLIPSE, name: 'Solar Eclipse', description: 'Day becomes night. Eclipse Shard offerings are quadrupled.', devotionBonus: 4.0, durationHours: 4, icon: '🌑' },
  { id: STM_EVENT_NORTHERN_LIGHTS, name: 'Northern Lights', description: 'The sky dances with color. Aurora Crystal discoveries doubled.', devotionBonus: 1.8, durationHours: 18, icon: '🌌' },
  { id: STM_EVENT_HALO_MOON, name: 'Halo Moon', description: 'A perfect ring surrounds the moon. All meditation power doubled.', devotionBonus: 2.0, durationHours: 10, icon: '🌕' },
  { id: STM_EVENT_COMET_PASSAGE, name: 'Comet Passage', description: 'A rare comet crosses the sky. Legendary relic chance +200%.', devotionBonus: 2.5, durationHours: 8, icon: '☄️' },
];

export const STM_CONSTELLATIONS: readonly ConstellationDef[] = [
  { id: 'aries', name: 'Aries', stars: 4, season: 'spring', description: 'The Ram — courage and new beginnings.' },
  { id: 'taurus', name: 'Taurus', stars: 5, season: 'spring', description: 'The Bull — strength and determination.' },
  { id: 'gemini', name: 'Gemini', stars: 4, season: 'spring', description: 'The Twins — duality and communication.' },
  { id: 'cancer', name: 'Cancer', stars: 3, season: 'summer', description: 'The Crab — protection and home.' },
  { id: 'leo', name: 'Leo', stars: 5, season: 'summer', description: 'The Lion — leadership and bravery.' },
  { id: 'virgo', name: 'Virgo', stars: 5, season: 'summer', description: 'The Maiden — purity and service.' },
  { id: 'libra', name: 'Libra', stars: 4, season: 'autumn', description: 'The Scales — balance and justice.' },
  { id: 'scorpio', name: 'Scorpio', stars: 6, season: 'autumn', description: 'The Scorpion — passion and transformation.' },
  { id: 'sagittarius', name: 'Sagittarius', stars: 5, season: 'autumn', description: 'The Archer — exploration and philosophy.' },
  { id: 'capricorn', name: 'Capricorn', stars: 4, season: 'winter', description: 'The Goat — discipline and ambition.' },
  { id: 'aquarius', name: 'Aquarius', stars: 5, season: 'winter', description: 'The Water Bearer — innovation and humanity.' },
  { id: 'pisces', name: 'Pisces', stars: 6, season: 'winter', description: 'The Fish — intuition and compassion.' },
];

export const STM_CLOUD_GARDEN_PLANTS: readonly CloudGardenPlantDef[] = [
  { id: 'cloud_rose', name: 'Cloud Rose', growTime: 60, devotionYield: 5, rarity: STM_RARITY_COMMON, description: 'A rose that grows on clouds.', icon: '🌹' },
  { id: 'sky_orchid', name: 'Sky Orchid', growTime: 90, devotionYield: 8, rarity: STM_RARITY_COMMON, description: 'An orchid that blooms in the thin air above.', icon: '🌸' },
  { id: 'star_tulip', name: 'Star Tulip', growTime: 120, devotionYield: 12, rarity: STM_RARITY_UNCOMMON, description: 'A tulip that opens only at night, revealing a star pattern.', icon: '🌷' },
  { id: 'moon_lily', name: 'Moon Lily', growTime: 180, devotionYield: 18, rarity: STM_RARITY_UNCOMMON, description: 'A luminous lily that glows with moonlight.', icon: '🪷' },
  { id: 'sun_blossom', name: 'Sun Blossom', growTime: 150, devotionYield: 15, rarity: STM_RARITY_UNCOMMON, description: 'A golden flower that tracks the sun across the sky.', icon: '🌼' },
  { id: 'celestial_bonsai', name: 'Celestial Bonsai', growTime: 300, devotionYield: 30, rarity: STM_RARITY_RARE, description: 'A miniature tree shaped like a constellation.', icon: '🌳' },
  { id: 'phoenix_fern', name: 'Phoenix Fern', growTime: 240, devotionYield: 25, rarity: STM_RARITY_RARE, description: 'A fern that bursts into flame and regrows.', icon: '🌿' },
  { id: 'eternal_lotus', name: 'Eternal Lotus', growTime: 360, devotionYield: 40, rarity: STM_RARITY_EPIC, description: 'A lotus that never fades and grants eternal peace.', icon: '🪷' },
  { id: 'genesis_sapling', name: 'Genesis Sapling', growTime: 480, devotionYield: 55, rarity: STM_RARITY_LEGENDARY, description: 'A sapling from the world tree that connects all realms.', icon: '🌱' },
];

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export type RelicRarity = typeof STM_RARITY_COMMON | typeof STM_RARITY_UNCOMMON | typeof STM_RARITY_RARE | typeof STM_RARITY_EPIC | typeof STM_RARITY_LEGENDARY;

export interface CelestialRelicDef {
  readonly id: string;
  readonly name: string;
  readonly rarity: RelicRarity;
  readonly description: string;
  readonly offeringPower: number;
  readonly icon: string;
}

export interface TempleChamberDef {
  readonly id: string;
  readonly name: string;
  readonly requiredDevotion: number;
  readonly description: string;
  readonly relics: readonly string[];
  readonly unlockedByDefault: boolean;
}

export interface OfferingItemDef {
  readonly id: string;
  readonly name: string;
  readonly offeringValue: number;
  readonly description: string;
  readonly icon: string;
}

export interface TempleStructureDef {
  readonly id: string;
  readonly name: string;
  readonly buildCost: number;
  readonly devotionPerDay: number;
  readonly description: string;
  readonly icon: string;
  readonly tier: number;
}

export interface DivineAbilityDef {
  readonly id: string;
  readonly name: string;
  readonly cooldown: number;
  readonly power: number;
  readonly description: string;
  readonly unlockCost: number;
  readonly icon: string;
  readonly element: string;
}

export interface AchievementDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly requirement: number;
  readonly category: string;
  readonly icon: string;
}

export interface TitleDef {
  readonly id: string;
  readonly name: string;
  readonly requiredDevotion: number;
  readonly description: string;
  readonly bonusMultiplier: number;
}

export interface CelestialEventDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly devotionBonus: number;
  readonly durationHours: number;
  readonly icon: string;
}

export interface ConstellationDef {
  readonly id: string;
  readonly name: string;
  readonly stars: number;
  readonly season: string;
  readonly description: string;
}

export interface CloudGardenPlantDef {
  readonly id: string;
  readonly name: string;
  readonly growTime: number;
  readonly devotionYield: number;
  readonly rarity: RelicRarity;
  readonly description: string;
  readonly icon: string;
}

export interface CollectedRelic {
  relicId: string;
  quantity: number;
  firstFoundAt: number;
  lastOfferingAt: number;
  totalOffered: number;
}

export interface CloudGardenPlot {
  plantId: string | null;
  plantedAt: number | null;
  isReady: boolean;
  harvestCount: number;
}

export interface MeditationSession {
  startedAt: number;
  endedAt: number | null;
  duration: number;
  devotionGained: number;
  chamberId: string;
}

export interface ConstellationMap {
  constellationId: string;
  mappedAt: number;
  starsConnected: number;
  isComplete: boolean;
}

export interface DailyDevotionQuest {
  date: string;
  prayersCompleted: number;
  offeringsMade: number;
  meditationsCompleted: number;
  relicsFound: number;
  chambersVisited: number;
  isComplete: boolean;
  rewardClaimed: boolean;
}

export interface SkyTempleState {
  devotion: number;
  totalDevotion: number;
  currentTitle: string;
  collectedRelics: Record<string, CollectedRelic>;
  unlockedChambers: string[];
  currentChamber: string;
  offeringInventory: Record<string, number>;
  totalOfferingsMade: number;
  builtStructures: string[];
  unlockedAbilities: string[];
  abilityCooldowns: Record<string, number>;
  achievements: string[];
  meditationCount: number;
  totalMeditationTime: number;
  mappedConstellations: string[];
  cloudGardenPlots: CloudGardenPlot[];
  activeEvent: string | null;
  eventEndTime: number | null;
  dailyQuest: DailyDevotionQuest;
  lastDailyReset: number;
  prayerStreak: number;
  longestPrayerStreak: number;
  lastPrayerAt: number;
  totalPrayers: number;
  relicDiscoveryCount: number;
  structuresBuilt: number;
  blessingsReceived: number;
  starObservationCount: number;
  cloudGardenHarvests: number;
  totalOfferingValue: number;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Default state factory
// ---------------------------------------------------------------------------

function createDefaultSkyTempleState(): SkyTempleState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    devotion: 0,
    totalDevotion: 0,
    currentTitle: STM_TITLE_PILGRIM,
    collectedRelics: {},
    unlockedChambers: [STM_CHAMBER_HALL_OF_DAWN],
    currentChamber: STM_CHAMBER_HALL_OF_DAWN,
    offeringInventory: { incense_sandalwood: 3, lotus_flower_white: 2, spirit_candle_white: 1, blessed_water_dawn: 2 },
    totalOfferingsMade: 0,
    builtStructures: ['prayer_altar'],
    unlockedAbilities: ['sun_beam', 'moon_shield'],
    abilityCooldowns: {},
    achievements: [],
    meditationCount: 0,
    totalMeditationTime: 0,
    mappedConstellations: [],
    cloudGardenPlots: Array.from({ length: 9 }, () => ({ plantId: null, plantedAt: null, isReady: false, harvestCount: 0 })),
    activeEvent: null,
    eventEndTime: null,
    dailyQuest: { date: today, prayersCompleted: 0, offeringsMade: 0, meditationsCompleted: 0, relicsFound: 0, chambersVisited: 0, isComplete: false, rewardClaimed: false },
    lastDailyReset: Date.now(),
    prayerStreak: 0,
    longestPrayerStreak: 0,
    lastPrayerAt: 0,
    totalPrayers: 0,
    relicDiscoveryCount: 0,
    structuresBuilt: 1,
    blessingsReceived: 0,
    starObservationCount: 0,
    cloudGardenHarvests: 0,
    totalOfferingValue: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// The main hook
// ---------------------------------------------------------------------------

export default function useSkyTemple(initialState?: SkyTempleState) {
  const [state, setState] = useState<SkyTempleState>(initialState ?? createDefaultSkyTempleState());
  const stateRef = useRef(state);

  useEffect(() => { stateRef.current = state; }, [state]);

  // =========================================================================
  // Relic Functions
  // =========================================================================

  const getRelicDef = useCallback((relicId: string): CelestialRelicDef | undefined => {
    return STM_RELICS.find(r => r.id === relicId);
  }, []);

  const getCollectedRelic = useCallback((relicId: string): CollectedRelic | undefined => {
    return stateRef.current.collectedRelics[relicId];
  }, []);

  const getCollectedRelicsList = useCallback((): CollectedRelic[] => {
    return Object.values(stateRef.current.collectedRelics);
  }, []);

  const getRelicsByRarity = useCallback((rarity: RelicRarity): CelestialRelicDef[] => {
    return STM_RELICS.filter(r => r.rarity === rarity);
  }, []);

  const getCollectedRelicsByRarity = useCallback((rarity: RelicRarity): CollectedRelic[] => {
    return Object.values(stateRef.current.collectedRelics).filter(cr => {
      const def = STM_RELICS.find(r => r.id === cr.relicId);
      return def?.rarity === rarity;
    });
  }, []);

  const discoverRelic = useCallback((relicId: string, quantity: number = 1) => {
    setState(prev => {
      const def = STM_RELICS.find(r => r.id === relicId);
      if (!def) return prev;
      const existing = prev.collectedRelics[relicId];
      const now = Date.now();
      return {
        ...prev,
        collectedRelics: {
          ...prev.collectedRelics,
          [relicId]: {
            relicId,
            quantity: (existing?.quantity ?? 0) + quantity,
            firstFoundAt: existing?.firstFoundAt ?? now,
            lastOfferingAt: existing?.lastOfferingAt ?? 0,
            totalOffered: existing?.totalOffered ?? 0,
          },
        },
        relicDiscoveryCount: prev.relicDiscoveryCount + quantity,
        updatedAt: now,
      };
    });
  }, []);

  const hasRelic = useCallback((relicId: string): boolean => {
    const cr = stateRef.current.collectedRelics[relicId];
    return !!cr && cr.quantity > 0;
  }, []);

  const getRelicQuantity = useCallback((relicId: string): number => {
    return stateRef.current.collectedRelics[relicId]?.quantity ?? 0;
  }, []);

  const offerRelic = useCallback((relicId: string, quantity: number = 1) => {
    setState(prev => {
      const cr = prev.collectedRelics[relicId];
      if (!cr || cr.quantity < quantity) return prev;
      const def = STM_RELICS.find(r => r.id === relicId);
      if (!def) return prev;
      const now = Date.now();
      const eventBonus = prev.activeEvent
        ? (STM_CELESTIAL_EVENTS.find(e => e.id === prev.activeEvent)?.devotionBonus ?? 1.0)
        : 1.0;
      const devotionGained = Math.floor(def.offeringPower * quantity * eventBonus);
      return {
        ...prev,
        collectedRelics: {
          ...prev.collectedRelics,
          [relicId]: { ...cr, quantity: cr.quantity - quantity, lastOfferingAt: now, totalOffered: cr.totalOffered + quantity },
        },
        devotion: prev.devotion + devotionGained,
        totalDevotion: prev.totalDevotion + devotionGained,
        totalOfferingsMade: prev.totalOfferingsMade + quantity,
        totalOfferingValue: prev.totalOfferingValue + devotionGained,
        updatedAt: now,
      };
    });
  }, []);

  const getRandomRelic = useCallback((maxRarity?: RelicRarity): CelestialRelicDef | null => {
    const rarityOrder: RelicRarity[] = [STM_RARITY_COMMON, STM_RARITY_UNCOMMON, STM_RARITY_RARE, STM_RARITY_EPIC, STM_RARITY_LEGENDARY];
    const maxIdx = maxRarity ? rarityOrder.indexOf(maxRarity) : rarityOrder.length - 1;
    const weights = [50, 30, 14, 5, 1];
    const pool = rarityOrder.slice(0, maxIdx + 1);
    const poolWeights = weights.slice(0, maxIdx + 1);
    const total = poolWeights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;
    let selectedRarity: RelicRarity = STM_RARITY_COMMON;
    for (let i = 0; i < pool.length; i++) {
      roll -= poolWeights[i];
      if (roll <= 0) { selectedRarity = pool[i]; break; }
    }
    const candidates = STM_RELICS.filter(r => r.rarity === selectedRarity);
    return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
  }, []);

  const getTotalRelicCount = useCallback((): number => {
    return Object.values(stateRef.current.collectedRelics).reduce((sum, cr) => sum + cr.quantity, 0);
  }, []);

  const getUniqueRelicCount = useCallback((): number => {
    return Object.values(stateRef.current.collectedRelics).filter(cr => cr.quantity > 0).length;
  }, []);

  // =========================================================================
  // Chamber Functions
  // =========================================================================

  const getChamberDef = useCallback((chamberId: string): TempleChamberDef | undefined => {
    return STM_CHAMBERS.find(c => c.id === chamberId);
  }, []);

  const getAllChambers = useCallback((): TempleChamberDef[] => {
    return [...STM_CHAMBERS];
  }, []);

  const getUnlockedChambers = useCallback((): TempleChamberDef[] => {
    return STM_CHAMBERS.filter(c => stateRef.current.unlockedChambers.includes(c.id));
  }, []);

  const getLockedChambers = useCallback((): TempleChamberDef[] => {
    return STM_CHAMBERS.filter(c => !stateRef.current.unlockedChambers.includes(c.id));
  }, []);

  const isChamberUnlocked = useCallback((chamberId: string): boolean => {
    return stateRef.current.unlockedChambers.includes(chamberId);
  }, []);

  const unlockChamber = useCallback((chamberId: string): boolean => {
    const def = STM_CHAMBERS.find(c => c.id === chamberId);
    if (!def || stateRef.current.unlockedChambers.includes(chamberId)) return false;
    if (stateRef.current.totalDevotion < def.requiredDevotion) return false;
    setState(prev => ({
      ...prev,
      unlockedChambers: [...prev.unlockedChambers, chamberId],
      updatedAt: Date.now(),
    }));
    return true;
  }, []);

  const enterChamber = useCallback((chamberId: string) => {
    if (!stateRef.current.unlockedChambers.includes(chamberId)) return;
    setState(prev => ({ ...prev, currentChamber: chamberId, updatedAt: Date.now() }));
  }, []);

  const getCurrentChamber = useCallback((): TempleChamberDef | undefined => {
    return STM_CHAMBERS.find(c => c.id === stateRef.current.currentChamber);
  }, []);

  const getChamberRelics = useCallback((chamberId: string): CelestialRelicDef[] => {
    const chamber = STM_CHAMBERS.find(c => c.id === chamberId);
    if (!chamber) return [];
    return chamber.relics.map(rId => STM_RELICS.find(r => r.id === rId)).filter(Boolean) as CelestialRelicDef[];
  }, []);

  const getChamberProgress = useCallback((chamberId: string): number => {
    const chamber = STM_CHAMBERS.find(c => c.id === chamberId);
    if (!chamber) return 0;
    if (stateRef.current.unlockedChambers.includes(chamberId)) return 100;
    const devotion = stateRef.current.totalDevotion;
    return Math.min(100, Math.floor((devotion / chamber.requiredDevotion) * 100));
  }, []);

  const getVisitedChamberCount = useCallback((): number => {
    return stateRef.current.unlockedChambers.length;
  }, []);

  // =========================================================================
  // Offering Functions
  // =========================================================================

  const getOfferingDef = useCallback((offeringId: string): OfferingItemDef | undefined => {
    return STM_OFFERINGS.find(o => o.id === offeringId);
  }, []);

  const getAllOfferings = useCallback((): OfferingItemDef[] => {
    return [...STM_OFFERINGS];
  }, []);

  const getOfferingQuantity = useCallback((offeringId: string): number => {
    return stateRef.current.offeringInventory[offeringId] ?? 0;
  }, []);

  const addOfferingItem = useCallback((offeringId: string, quantity: number = 1) => {
    setState(prev => ({
      ...prev,
      offeringInventory: { ...prev.offeringInventory, [offeringId]: (prev.offeringInventory[offeringId] ?? 0) + quantity },
      updatedAt: Date.now(),
    }));
  }, []);

  const makeOffering = useCallback((offeringId: string, quantity: number = 1) => {
    setState(prev => {
      const currentQty = prev.offeringInventory[offeringId] ?? 0;
      if (currentQty < quantity) return prev;
      const def = STM_OFFERINGS.find(o => o.id === offeringId);
      if (!def) return prev;
      const now = Date.now();
      const eventBonus = prev.activeEvent
        ? (STM_CELESTIAL_EVENTS.find(e => e.id === prev.activeEvent)?.devotionBonus ?? 1.0)
        : 1.0;
      const devotionGained = Math.floor(def.offeringValue * quantity * eventBonus);
      return {
        ...prev,
        offeringInventory: { ...prev.offeringInventory, [offeringId]: currentQty - quantity },
        devotion: prev.devotion + devotionGained,
        totalDevotion: prev.totalDevotion + devotionGained,
        totalOfferingsMade: prev.totalOfferingsMade + quantity,
        totalOfferingValue: prev.totalOfferingValue + devotionGained,
        dailyQuest: {
          ...prev.dailyQuest,
          offeringsMade: prev.dailyQuest.offeringsMade + quantity,
        },
        updatedAt: now,
      };
    });
  }, []);

  const getTotalOfferingInventoryCount = useCallback((): number => {
    return Object.values(stateRef.current.offeringInventory).reduce((s, q) => s + q, 0);
  }, []);

  // =========================================================================
  // Prayer Functions
  // =========================================================================

  const performPrayer = useCallback(() => {
    setState(prev => {
      const now = Date.now();
      const today = new Date().toISOString().slice(0, 10);
      const lastPrayerDate = prev.lastPrayerAt > 0 ? new Date(prev.lastPrayerAt).toISOString().slice(0, 10) : '';
      const isConsecutive = lastPrayerDate === new Date(now - 86400000).toISOString().slice(0, 10);
      const newStreak = isConsecutive ? prev.prayerStreak + 1 : 1;
      const devotionGained = 5 + Math.min(newStreak, 10) * 2;
      return {
        ...prev,
        devotion: prev.devotion + devotionGained,
        totalDevotion: prev.totalDevotion + devotionGained,
        prayerStreak: newStreak,
        longestPrayerStreak: Math.max(prev.longestPrayerStreak, newStreak),
        lastPrayerAt: now,
        totalPrayers: prev.totalPrayers + 1,
        dailyQuest: {
          ...prev.dailyQuest,
          date: today,
          prayersCompleted: prev.dailyQuest.date === today ? prev.dailyQuest.prayersCompleted + 1 : 1,
        },
        updatedAt: now,
      };
    });
  }, []);

  const getPrayerStreak = useCallback((): number => {
    return stateRef.current.prayerStreak;
  }, []);

  const getLongestPrayerStreak = useCallback((): number => {
    return stateRef.current.longestPrayerStreak;
  }, []);

  const canPrayToday = useCallback((): boolean => {
    const now = Date.now();
    const today = new Date().toISOString().slice(0, 10);
    const lastPrayerDate = stateRef.current.lastPrayerAt > 0 ? new Date(stateRef.current.lastPrayerAt).toISOString().slice(0, 10) : '';
    return lastPrayerDate !== today;
  }, []);

  const getNextPrayerBonus = useCallback((): number => {
    return 5 + Math.min(stateRef.current.prayerStreak + 1, 10) * 2;
  }, []);

  // =========================================================================
  // Structure Functions
  // =========================================================================

  const getStructureDef = useCallback((structureId: string): TempleStructureDef | undefined => {
    return STM_STRUCTURES.find(s => s.id === structureId);
  }, []);

  const getAllStructures = useCallback((): TempleStructureDef[] => {
    return [...STM_STRUCTURES];
  }, []);

  const getBuiltStructures = useCallback((): TempleStructureDef[] => {
    return STM_STRUCTURES.filter(s => stateRef.current.builtStructures.includes(s.id));
  }, []);

  const getUnbuiltStructures = useCallback((): TempleStructureDef[] => {
    return STM_STRUCTURES.filter(s => !stateRef.current.builtStructures.includes(s.id));
  }, []);

  const isStructureBuilt = useCallback((structureId: string): boolean => {
    return stateRef.current.builtStructures.includes(structureId);
  }, []);

  const buildStructure = useCallback((structureId: string): boolean => {
    const def = STM_STRUCTURES.find(s => s.id === structureId);
    if (!def) return false;
    if (stateRef.current.builtStructures.includes(structureId)) return false;
    if (stateRef.current.devotion < def.buildCost) return false;
    setState(prev => ({
      ...prev,
      devotion: prev.devotion - def.buildCost,
      builtStructures: [...prev.builtStructures, structureId],
      structuresBuilt: prev.structuresBuilt + 1,
      updatedAt: Date.now(),
    }));
    return true;
  }, []);

  const getStructureDevotionPerDay = useCallback((): number => {
    return stateRef.current.builtStructures.reduce((sum, sId) => {
      const def = STM_STRUCTURES.find(s => s.id === sId);
      return sum + (def?.devotionPerDay ?? 0);
    }, 0);
  }, []);

  const getStructuresByTier = useCallback((tier: number): TempleStructureDef[] => {
    return STM_STRUCTURES.filter(s => s.tier === tier);
  }, []);

  const getStructureTierCount = useCallback((): number => {
    const tiers = new Set(stateRef.current.builtStructures.map(sId => {
      const def = STM_STRUCTURES.find(s => s.id === sId);
      return def?.tier ?? 0;
    }));
    return tiers.size;
  }, []);

  const getMaxStructureTier = useCallback((): number => {
    let maxTier = 0;
    for (const sId of stateRef.current.builtStructures) {
      const def = STM_STRUCTURES.find(s => s.id === sId);
      if (def && def.tier > maxTier) maxTier = def.tier;
    }
    return maxTier;
  }, []);

  // =========================================================================
  // Divine Ability Functions
  // =========================================================================

  const getAbilityDef = useCallback((abilityId: string): DivineAbilityDef | undefined => {
    return STM_ABILITIES.find(a => a.id === abilityId);
  }, []);

  const getAllAbilities = useCallback((): DivineAbilityDef[] => {
    return [...STM_ABILITIES];
  }, []);

  const getUnlockedAbilities = useCallback((): DivineAbilityDef[] => {
    return STM_ABILITIES.filter(a => stateRef.current.unlockedAbilities.includes(a.id));
  }, []);

  const getLockedAbilities = useCallback((): DivineAbilityDef[] => {
    return STM_ABILITIES.filter(a => !stateRef.current.unlockedAbilities.includes(a.id));
  }, []);

  const isAbilityUnlocked = useCallback((abilityId: string): boolean => {
    return stateRef.current.unlockedAbilities.includes(abilityId);
  }, []);

  const unlockAbility = useCallback((abilityId: string): boolean => {
    const def = STM_ABILITIES.find(a => a.id === abilityId);
    if (!def) return false;
    if (stateRef.current.unlockedAbilities.includes(abilityId)) return false;
    if (stateRef.current.devotion < def.unlockCost) return false;
    setState(prev => ({
      ...prev,
      devotion: prev.devotion - def.unlockCost,
      unlockedAbilities: [...prev.unlockedAbilities, abilityId],
      updatedAt: Date.now(),
    }));
    return true;
  }, []);

  const useAbility = useCallback((abilityId: string): boolean => {
    if (!stateRef.current.unlockedAbilities.includes(abilityId)) return false;
    const now = Date.now();
    const cooldownEnd = stateRef.current.abilityCooldowns[abilityId] ?? 0;
    if (now < cooldownEnd) return false;
    const def = STM_ABILITIES.find(a => a.id === abilityId);
    if (!def) return false;
    setState(prev => ({
      ...prev,
      abilityCooldowns: { ...prev.abilityCooldowns, [abilityId]: now + def.cooldown * 1000 },
      blessingsReceived: prev.blessingsReceived + 1,
      updatedAt: now,
    }));
    return true;
  }, []);

  const getAbilityCooldownRemaining = useCallback((abilityId: string): number => {
    const cooldownEnd = stateRef.current.abilityCooldowns[abilityId] ?? 0;
    const remaining = cooldownEnd - Date.now();
    return remaining > 0 ? remaining : 0;
  }, []);

  const getAbilitiesByElement = useCallback((element: string): DivineAbilityDef[] => {
    return STM_ABILITIES.filter(a => a.element === element);
  }, []);

  const getAbilityCount = useCallback((): number => {
    return stateRef.current.unlockedAbilities.length;
  }, []);

  // =========================================================================
  // Meditation Functions
  // =========================================================================

  const startMeditation = useCallback((chamberId?: string) => {
    setState(prev => ({
      ...prev,
      updatedAt: Date.now(),
    }));
  }, []);

  const completeMeditation = useCallback((durationSeconds: number, chamberId?: string) => {
    setState(prev => {
      const now = Date.now();
      const devotionGained = Math.floor(durationSeconds / 10) + 3;
      const today = new Date().toISOString().slice(0, 10);
      return {
        ...prev,
        devotion: prev.devotion + devotionGained,
        totalDevotion: prev.totalDevotion + devotionGained,
        meditationCount: prev.meditationCount + 1,
        totalMeditationTime: prev.totalMeditationTime + durationSeconds,
        dailyQuest: {
          ...prev.dailyQuest,
          date: today,
          meditationsCompleted: prev.dailyQuest.date === today ? prev.dailyQuest.meditationsCompleted + 1 : 1,
        },
        updatedAt: now,
      };
    });
  }, []);

  const getMeditationCount = useCallback((): number => {
    return stateRef.current.meditationCount;
  }, []);

  const getTotalMeditationTime = useCallback((): number => {
    return stateRef.current.totalMeditationTime;
  }, []);

  const getMeditationDevotionRate = useCallback((): number => {
    if (stateRef.current.totalMeditationTime === 0) return 0;
    return stateRef.current.totalDevotion / stateRef.current.totalMeditationTime;
  }, []);

  // =========================================================================
  // Constellation / Star Functions
  // =========================================================================

  const getConstellationDef = useCallback((constellationId: string): ConstellationDef | undefined => {
    return STM_CONSTELLATIONS.find(c => c.id === constellationId);
  }, []);

  const getAllConstellations = useCallback((): ConstellationDef[] => {
    return [...STM_CONSTELLATIONS];
  }, []);

  const getMappedConstellations = useCallback((): ConstellationDef[] => {
    return STM_CONSTELLATIONS.filter(c => stateRef.current.mappedConstellations.includes(c.id));
  }, []);

  const getUnmappedConstellations = useCallback((): ConstellationDef[] => {
    return STM_CONSTELLATIONS.filter(c => !stateRef.current.mappedConstellations.includes(c.id));
  }, []);

  const mapConstellation = useCallback((constellationId: string): boolean => {
    const def = STM_CONSTELLATIONS.find(c => c.id === constellationId);
    if (!def) return false;
    if (stateRef.current.mappedConstellations.includes(constellationId)) return false;
    setState(prev => ({
      ...prev,
      mappedConstellations: [...prev.mappedConstellations, constellationId],
      starObservationCount: prev.starObservationCount + def.stars,
      devotion: prev.devotion + def.stars * 3,
      totalDevotion: prev.totalDevotion + def.stars * 3,
      updatedAt: Date.now(),
    }));
    return true;
  }, []);

  const isConstellationMapped = useCallback((constellationId: string): boolean => {
    return stateRef.current.mappedConstellations.includes(constellationId);
  }, []);

  const getConstellationProgress = useCallback((): number => {
    return Math.floor((stateRef.current.mappedConstellations.length / STM_CONSTELLATIONS.length) * 100);
  }, []);

  const getConstellationsBySeason = useCallback((season: string): ConstellationDef[] => {
    return STM_CONSTELLATIONS.filter(c => c.season === season);
  }, []);

  const getStarObservationCount = useCallback((): number => {
    return stateRef.current.starObservationCount;
  }, []);

  // =========================================================================
  // Cloud Garden Functions
  // =========================================================================

  const getCloudGardenPlantDef = useCallback((plantId: string): CloudGardenPlantDef | undefined => {
    return STM_CLOUD_GARDEN_PLANTS.find(p => p.id === plantId);
  }, []);

  const getAllGardenPlants = useCallback((): CloudGardenPlantDef[] => {
    return [...STM_CLOUD_GARDEN_PLANTS];
  }, []);

  const getGardenPlot = useCallback((plotIndex: number): CloudGardenPlot | undefined => {
    return stateRef.current.cloudGardenPlots[plotIndex];
  }, []);

  const getAllGardenPlots = useCallback((): CloudGardenPlot[] => {
    return [...stateRef.current.cloudGardenPlots];
  }, []);

  const plantInGarden = useCallback((plotIndex: number, plantId: string): boolean => {
    const def = STM_CLOUD_GARDEN_PLANTS.find(p => p.id === plantId);
    if (!def) return false;
    const plot = stateRef.current.cloudGardenPlots[plotIndex];
    if (!plot || plot.plantId !== null) return false;
    setState(prev => {
      const newPlots = [...prev.cloudGardenPlots];
      newPlots[plotIndex] = { plantId, plantedAt: Date.now(), isReady: false, harvestCount: plot.harvestCount };
      return { ...prev, cloudGardenPlots: newPlots, updatedAt: Date.now() };
    });
    return true;
  }, []);

  const updateGardenPlots = useCallback(() => {
    setState(prev => {
      const now = Date.now();
      let harvests = 0;
      let devotionGained = 0;
      const newPlots = prev.cloudGardenPlots.map(plot => {
        if (!plot.plantId || plot.isReady) return plot;
        const def = STM_CLOUD_GARDEN_PLANTS.find(p => p.id === plot.plantId);
        if (!def || !plot.plantedAt) return plot;
        if (now - plot.plantedAt >= def.growTime * 1000) {
          devotionGained += def.devotionYield;
          harvests++;
          return { ...plot, isReady: true };
        }
        return plot;
      });
      return {
        ...prev,
        cloudGardenPlots: newPlots,
        devotion: prev.devotion + devotionGained,
        totalDevotion: prev.totalDevotion + devotionGained,
        cloudGardenHarvests: prev.cloudGardenHarvests + harvests,
        updatedAt: now,
      };
    });
  }, []);

  const harvestGardenPlot = useCallback((plotIndex: number): number => {
    const plot = stateRef.current.cloudGardenPlots[plotIndex];
    if (!plot || !plot.isReady || !plot.plantId) return 0;
    const def = STM_CLOUD_GARDEN_PLANTS.find(p => p.id === plot.plantId);
    if (!def) return 0;
    setState(prev => {
      const newPlots = [...prev.cloudGardenPlots];
      newPlots[plotIndex] = { plantId: null, plantedAt: null, isReady: false, harvestCount: plot.harvestCount + 1 };
      return { ...prev, cloudGardenPlots: newPlots, updatedAt: Date.now() };
    });
    return def.devotionYield;
  }, []);

  const getGardenPlotProgress = useCallback((plotIndex: number): number => {
    const plot = stateRef.current.cloudGardenPlots[plotIndex];
    if (!plot || !plot.plantId || !plot.plantedAt) return 0;
    const def = STM_CLOUD_GARDEN_PLANTS.find(p => p.id === plot.plantId);
    if (!def) return 0;
    const elapsed = Date.now() - plot.plantedAt;
    return Math.min(100, Math.floor((elapsed / (def.growTime * 1000)) * 100));
  }, []);

  const getGardenHarvestCount = useCallback((): number => {
    return stateRef.current.cloudGardenHarvests;
  }, []);

  const getReadyPlotCount = useCallback((): number => {
    return stateRef.current.cloudGardenPlots.filter(p => p.isReady).length;
  }, []);

  const getEmptyPlotCount = useCallback((): number => {
    return stateRef.current.cloudGardenPlots.filter(p => p.plantId === null).length;
  }, []);

  // =========================================================================
  // Celestial Event Functions
  // =========================================================================

  const getCelestialEventDef = useCallback((eventId: string): CelestialEventDef | undefined => {
    return STM_CELESTIAL_EVENTS.find(e => e.id === eventId);
  }, []);

  const getAllCelestialEvents = useCallback((): CelestialEventDef[] => {
    return [...STM_CELESTIAL_EVENTS];
  }, []);

  const getActiveEvent = useCallback((): CelestialEventDef | null => {
    if (!stateRef.current.activeEvent) return null;
    if (stateRef.current.eventEndTime && Date.now() > stateRef.current.eventEndTime) return null;
    return STM_CELESTIAL_EVENTS.find(e => e.id === stateRef.current.activeEvent) ?? null;
  }, []);

  const startCelestialEvent = useCallback((eventId: string) => {
    const def = STM_CELESTIAL_EVENTS.find(e => e.id === eventId);
    if (!def) return;
    setState(prev => ({
      ...prev,
      activeEvent: eventId,
      eventEndTime: Date.now() + def.durationHours * 3600000,
      updatedAt: Date.now(),
    }));
  }, []);

  const endCelestialEvent = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeEvent: null,
      eventEndTime: null,
      updatedAt: Date.now(),
    }));
  }, []);

  const getEventTimeRemaining = useCallback((): number => {
    if (!stateRef.current.eventEndTime) return 0;
    const remaining = stateRef.current.eventEndTime - Date.now();
    return remaining > 0 ? remaining : 0;
  }, []);

  const isEventActive = useCallback((): boolean => {
    if (!stateRef.current.activeEvent || !stateRef.current.eventEndTime) return false;
    return Date.now() < stateRef.current.eventEndTime;
  }, []);

  const getEventDevotionBonus = useCallback((): number => {
    if (!stateRef.current.activeEvent) return 1.0;
    const def = STM_CELESTIAL_EVENTS.find(e => e.id === stateRef.current.activeEvent);
    return def?.devotionBonus ?? 1.0;
  }, []);

  // =========================================================================
  // Achievement Functions
  // =========================================================================

  const getAchievementDef = useCallback((achievementId: string): AchievementDef | undefined => {
    return STM_ACHIEVEMENTS.find(a => a.id === achievementId);
  }, []);

  const getAllAchievements = useCallback((): AchievementDef[] => {
    return [...STM_ACHIEVEMENTS];
  }, []);

  const getUnlockedAchievements = useCallback((): AchievementDef[] => {
    return STM_ACHIEVEMENTS.filter(a => stateRef.current.achievements.includes(a.id));
  }, []);

  const getLockedAchievements = useCallback((): AchievementDef[] => {
    return STM_ACHIEVEMENTS.filter(a => !stateRef.current.achievements.includes(a.id));
  }, []);

  const isAchievementUnlocked = useCallback((achievementId: string): boolean => {
    return stateRef.current.achievements.includes(achievementId);
  }, []);

  const checkAndUnlockAchievements = useCallback((): string[] => {
    const s = stateRef.current;
    const newlyUnlocked: string[] = [];
    const checks: Array<[string, boolean]> = [
      ['first_prayer', s.totalPrayers >= 1],
      ['devoted_follower', s.totalDevotion >= 100],
      ['temple_scholar', s.totalDevotion >= 500],
      ['divine_servant', s.totalDevotion >= 1500],
      ['celestial_master', s.totalDevotion >= 5000],
      ['relic_collector_5', getUniqueRelicCount() >= 5],
      ['relic_collector_15', getUniqueRelicCount() >= 15],
      ['relic_collector_35', getUniqueRelicCount() >= 35],
      ['chamber_explorer_3', s.unlockedChambers.length >= 3],
      ['chamber_explorer_6', s.unlockedChambers.length >= 6],
      ['all_chambers', s.unlockedChambers.length >= 8],
      ['offering_10', s.totalOfferingsMade >= 10],
      ['offering_50', s.totalOfferingsMade >= 50],
      ['meditation_7', s.meditationCount >= 7],
      ['meditation_30', s.meditationCount >= 30],
      ['constellation_5', s.mappedConstellations.length >= 5],
      ['constellation_12', s.mappedConstellations.length >= 12],
      ['legendary_offering', Object.values(s.collectedRelics).some(cr => {
        const def = STM_RELICS.find(r => r.id === cr.relicId);
        return def?.rarity === STM_RARITY_LEGENDARY && cr.totalOffered > 0;
      })],
    ];
    for (const [id, condition] of checks) {
      if (condition && !s.achievements.includes(id)) {
        newlyUnlocked.push(id);
      }
    }
    if (newlyUnlocked.length > 0) {
      setState(prev => ({
        ...prev,
        achievements: [...prev.achievements, ...newlyUnlocked],
        updatedAt: Date.now(),
      }));
    }
    return newlyUnlocked;
  }, [getUniqueRelicCount]);

  const getAchievementCount = useCallback((): number => {
    return stateRef.current.achievements.length;
  }, []);

  const getAchievementProgress = useCallback((): number => {
    return Math.floor((stateRef.current.achievements.length / STM_ACHIEVEMENTS.length) * 100);
  }, []);

  const getAchievementsByCategory = useCallback((category: string): AchievementDef[] => {
    return STM_ACHIEVEMENTS.filter(a => a.category === category);
  }, []);

  // =========================================================================
  // Title Functions
  // =========================================================================

  const getTitleDef = useCallback((titleId: string): TitleDef | undefined => {
    return STM_TITLES.find(t => t.id === titleId);
  }, []);

  const getAllTitles = useCallback((): TitleDef[] => {
    return [...STM_TITLES];
  }, []);

  const getUnlockedTitles = useCallback((): TitleDef[] => {
    return STM_TITLES.filter(t => stateRef.current.totalDevotion >= t.requiredDevotion);
  }, []);

  const getLockedTitles = useCallback((): TitleDef[] => {
    return STM_TITLES.filter(t => stateRef.current.totalDevotion < t.requiredDevotion);
  }, []);

  const getCurrentTitle = useCallback((): TitleDef | undefined => {
    return STM_TITLES.find(t => t.id === stateRef.current.currentTitle);
  }, []);

  const setCurrentTitle = useCallback((titleId: string) => {
    const def = STM_TITLES.find(t => t.id === titleId);
    if (!def || stateRef.current.totalDevotion < def.requiredDevotion) return;
    setState(prev => ({ ...prev, currentTitle: titleId, updatedAt: Date.now() }));
  }, []);

  const getTitleProgress = useCallback((): number => {
    const current = STM_TITLES.find(t => t.id === stateRef.current.currentTitle);
    if (!current) return 0;
    const next = STM_TITLES.filter(t => t.requiredDevotion > stateRef.current.totalDevotion).sort((a, b) => a.requiredDevotion - b.requiredDevotion)[0];
    if (!next) return 100;
    const range = next.requiredDevotion - current.requiredDevotion;
    const progress = stateRef.current.totalDevotion - current.requiredDevotion;
    return Math.min(100, Math.floor((progress / range) * 100));
  }, []);

  const getTitleBonusMultiplier = useCallback((): number => {
    const def = STM_TITLES.find(t => t.id === stateRef.current.currentTitle);
    return def?.bonusMultiplier ?? 1.0;
  }, []);

  const getNextTitle = useCallback((): TitleDef | undefined => {
    return STM_TITLES.filter(t => t.requiredDevotion > stateRef.current.totalDevotion).sort((a, b) => a.requiredDevotion - b.requiredDevotion)[0];
  }, []);

  // =========================================================================
  // Daily Quest Functions
  // =========================================================================

  const getDailyQuest = useCallback((): DailyDevotionQuest => {
    return stateRef.current.dailyQuest;
  }, []);

  const isDailyQuestComplete = useCallback((): boolean => {
    const q = stateRef.current.dailyQuest;
    return q.prayersCompleted >= 3 && q.offeringsMade >= 2 && q.meditationsCompleted >= 1;
  }, []);

  const resetDailyQuestIfNeeded = useCallback(() => {
    setState(prev => {
      const today = new Date().toISOString().slice(0, 10);
      if (prev.dailyQuest.date === today) return prev;
      return {
        ...prev,
        dailyQuest: {
          date: today,
          prayersCompleted: 0,
          offeringsMade: 0,
          meditationsCompleted: 0,
          relicsFound: 0,
          chambersVisited: 0,
          isComplete: false,
          rewardClaimed: false,
        },
        lastDailyReset: Date.now(),
        updatedAt: Date.now(),
      };
    });
  }, []);

  const claimDailyReward = useCallback((): number => {
    if (!isDailyQuestComplete()) return 0;
    if (stateRef.current.dailyQuest.rewardClaimed) return 0;
    const reward = 50;
    setState(prev => ({
      ...prev,
      devotion: prev.devotion + reward,
      totalDevotion: prev.totalDevotion + reward,
      dailyQuest: { ...prev.dailyQuest, isComplete: true, rewardClaimed: true },
      updatedAt: Date.now(),
    }));
    return reward;
  }, [isDailyQuestComplete]);

  const getDailyQuestProgress = useCallback((): { prayers: number; offerings: number; meditations: number } => {
    const q = stateRef.current.dailyQuest;
    return { prayers: q.prayersCompleted, offerings: q.offeringsMade, meditations: q.meditationsCompleted };
  }, []);

  // =========================================================================
  // Devotion Functions
  // =========================================================================

  const getDevotion = useCallback((): number => {
    return stateRef.current.devotion;
  }, []);

  const getTotalDevotion = useCallback((): number => {
    return stateRef.current.totalDevotion;
  }, []);

  const spendDevotion = useCallback((amount: number): boolean => {
    if (stateRef.current.devotion < amount) return false;
    setState(prev => ({ ...prev, devotion: prev.devotion - amount, updatedAt: Date.now() }));
    return true;
  }, []);

  const addDevotion = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      devotion: prev.devotion + amount,
      totalDevotion: prev.totalDevotion + amount,
      updatedAt: Date.now(),
    }));
  }, []);

  const getDevotionToNextTitle = useCallback((): number => {
    const next = STM_TITLES.filter(t => t.requiredDevotion > stateRef.current.totalDevotion).sort((a, b) => a.requiredDevotion - b.requiredDevotion)[0];
    if (!next) return 0;
    return next.requiredDevotion - stateRef.current.totalDevotion;
  }, []);

  // =========================================================================
  // Stats & Derived State Functions
  // =========================================================================

  const getTempleLevel = useCallback((): number => {
    const devotion = stateRef.current.totalDevotion;
    if (devotion >= 5000) return 10;
    if (devotion >= 3500) return 9;
    if (devotion >= 2200) return 8;
    if (devotion >= 1500) return 7;
    if (devotion >= 1000) return 6;
    if (devotion >= 600) return 5;
    if (devotion >= 300) return 4;
    if (devotion >= 100) return 3;
    if (devotion >= 30) return 2;
    return 1;
  }, []);

  const getTempleLevelName = useCallback((): string => {
    const level = getTempleLevel();
    const names: Record<number, string> = {
      1: 'Humble Shrine', 2: 'Small Temple', 3: 'Rising Sanctuary',
      4: 'Glorious Temple', 5: 'Grand Temple', 6: 'Majestic Temple',
      7: 'Radiant Sanctuary', 8: 'Ethereal Temple', 9: 'Divine Temple', 10: 'Celestial Citadel',
    };
    return names[level] ?? 'Unknown';
  }, [getTempleLevel]);

  const getBlessingsReceived = useCallback((): number => {
    return stateRef.current.blessingsReceived;
  }, []);

  const getCloudGardenHarvests = useCallback((): number => {
    return stateRef.current.cloudGardenHarvests;
  }, []);

  const getTotalOfferingsMade = useCallback((): number => {
    return stateRef.current.totalOfferingsMade;
  }, []);

  const getTotalOfferingValue = useCallback((): number => {
    return stateRef.current.totalOfferingValue;
  }, []);

  const getRelicDiscoveryCount = useCallback((): number => {
    return stateRef.current.relicDiscoveryCount;
  }, []);

  const getCreatedAt = useCallback((): number => {
    return stateRef.current.createdAt;
  }, []);

  const getUpdatedAt = useCallback((): number => {
    return stateRef.current.updatedAt;
  }, []);

  const getDaysSinceCreation = useCallback((): number => {
    return Math.floor((Date.now() - stateRef.current.createdAt) / 86400000);
  }, []);

  const getTempleCompletionPercent = useCallback((): number => {
    const relicPercent = (getUniqueRelicCount() / STM_RELICS.length) * 30;
    const chamberPercent = (stateRef.current.unlockedChambers.length / STM_CHAMBERS.length) * 20;
    const structurePercent = (stateRef.current.builtStructures.length / STM_STRUCTURES.length) * 15;
    const abilityPercent = (stateRef.current.unlockedAbilities.length / STM_ABILITIES.length) * 15;
    const achievementPercent = (stateRef.current.achievements.length / STM_ACHIEVEMENTS.length) * 10;
    const constellationPercent = (stateRef.current.mappedConstellations.length / STM_CONSTELLATIONS.length) * 10;
    return Math.floor(relicPercent + chamberPercent + structurePercent + abilityPercent + achievementPercent + constellationPercent);
  }, [getUniqueRelicCount]);

  // =========================================================================
  // Computed / Memoized Values
  // =========================================================================

  const templeLevel = useMemo(() => {
    const devotion = state.totalDevotion;
    if (devotion >= 5000) return 10;
    if (devotion >= 3500) return 9;
    if (devotion >= 2200) return 8;
    if (devotion >= 1500) return 7;
    if (devotion >= 1000) return 6;
    if (devotion >= 600) return 5;
    if (devotion >= 300) return 4;
    if (devotion >= 100) return 3;
    if (devotion >= 30) return 2;
    return 1;
  }, [state]);

  const templeLevelName = useMemo(() => {
    const names: Record<number, string> = {
      1: 'Humble Shrine', 2: 'Small Temple', 3: 'Rising Sanctuary',
      4: 'Glorious Temple', 5: 'Grand Temple', 6: 'Majestic Temple',
      7: 'Radiant Sanctuary', 8: 'Ethereal Temple', 9: 'Divine Temple', 10: 'Celestial Citadel',
    };
    return names[templeLevel] ?? 'Unknown';
  }, [templeLevel]);

  const currentTitleDef = useMemo(() => {
    return STM_TITLES.find(t => t.id === state.currentTitle);
  }, [state]);

  const nextTitleDef = useMemo(() => {
    return STM_TITLES.filter(t => t.requiredDevotion > state.totalDevotion).sort((a, b) => a.requiredDevotion - b.requiredDevotion)[0];
  }, [state]);

  const currentChamberDef = useMemo(() => {
    return STM_CHAMBERS.find(c => c.id === state.currentChamber);
  }, [state]);

  const activeEventDef = useMemo(() => {
    if (!state.activeEvent || !state.eventEndTime) return null;
    if (Date.now() > state.eventEndTime) return null;
    return STM_CELESTIAL_EVENTS.find(e => e.id === state.activeEvent) ?? null;
  }, [state]);

  const templeCompletionPercent = useMemo(() => {
    const relicPct = (Object.values(state.collectedRelics).filter(cr => cr.quantity > 0).length / STM_RELICS.length) * 30;
    const chamberPct = (state.unlockedChambers.length / STM_CHAMBERS.length) * 20;
    const structurePct = (state.builtStructures.length / STM_STRUCTURES.length) * 15;
    const abilityPct = (state.unlockedAbilities.length / STM_ABILITIES.length) * 15;
    const achievementPct = (state.achievements.length / STM_ACHIEVEMENTS.length) * 10;
    const constellationPct = (state.mappedConstellations.length / STM_CONSTELLATIONS.length) * 10;
    return Math.floor(relicPct + chamberPct + structurePct + abilityPct + achievementPct + constellationPct);
  }, [state]);

  const devotionColor = useMemo(() => {
    if (state.totalDevotion >= 3500) return STM_GOLD;
    if (state.totalDevotion >= 1500) return STM_LAVENDER;
    if (state.totalDevotion >= 600) return STM_SKY_BLUE;
    if (state.totalDevotion >= 100) return STM_CREAM;
    return STM_WHITE;
  }, [state]);

  const rarityColorMap = useMemo(() => ({
    [STM_RARITY_COMMON]: '#9CA3AF',
    [STM_RARITY_UNCOMMON]: '#34D399',
    [STM_RARITY_RARE]: '#60A5FA',
    [STM_RARITY_EPIC]: '#A78BFA',
    [STM_RARITY_LEGENDARY]: '#FBBF24',
  }), []);

  const structureDevotionPerDay = useMemo(() => {
    return state.builtStructures.reduce((sum, sId) => {
      const def = STM_STRUCTURES.find(s => s.id === sId);
      return sum + (def?.devotionPerDay ?? 0);
    }, 0);
  }, [state]);

  const totalOfferingInventoryCount = useMemo(() => {
    return Object.values(state.offeringInventory).reduce((s, q) => s + q, 0);
  }, [state]);

  const uniqueRelicCount = useMemo(() => {
    return Object.values(state.collectedRelics).filter(cr => cr.quantity > 0).length;
  }, [state]);

  const totalRelicCount = useMemo(() => {
    return Object.values(state.collectedRelics).reduce((sum, cr) => sum + cr.quantity, 0);
  }, [state]);

  // =========================================================================
  // Reset & Serialization
  // =========================================================================

  const resetState = useCallback(() => {
    setState(createDefaultSkyTempleState());
  }, []);

  const getStateSnapshot = useCallback((): SkyTempleState => {
    return { ...stateRef.current };
  }, []);

  const getSerializableState = useCallback((): SkyTempleState => {
    return { ...stateRef.current };
  }, []);

  // =========================================================================
  // Utility Functions
  // =========================================================================

  const formatDevotion = useCallback((value: number): string => {
    if (value >= 10000) return (value / 1000).toFixed(1) + 'K';
    return value.toLocaleString();
  }, []);

  const formatTime = useCallback((ms: number): string => {
    if (ms <= 0) return 'Ready';
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }, []);

  const getRarityLabel = useCallback((rarity: RelicRarity): string => {
    const labels: Record<string, string> = {
      [STM_RARITY_COMMON]: 'Common', [STM_RARITY_UNCOMMON]: 'Uncommon',
      [STM_RARITY_RARE]: 'Rare', [STM_RARITY_EPIC]: 'Epic', [STM_RARITY_LEGENDARY]: 'Legendary',
    };
    return labels[rarity] ?? rarity;
  }, []);

  const getRarityColor = useCallback((rarity: RelicRarity): string => {
    const colors: Record<string, string> = {
      [STM_RARITY_COMMON]: '#9CA3AF', [STM_RARITY_UNCOMMON]: '#34D399',
      [STM_RARITY_RARE]: '#60A5FA', [STM_RARITY_EPIC]: '#A78BFA', [STM_RARITY_LEGENDARY]: '#FBBF24',
    };
    return colors[rarity] ?? '#9CA3AF';
  }, []);

  const getElementColor = useCallback((element: string): string => {
    const colors: Record<string, string> = {
      light: '#FBBF24', wind: '#7DD3FC', water: '#60A5FA', cosmic: '#A78BFA',
    };
    return colors[element] ?? '#9CA3AF';
  }, []);

  const getThemeColors = useCallback(() => ({
    gold: STM_GOLD, cream: STM_CREAM, skyBlue: STM_SKY_BLUE,
    white: STM_WHITE, deepBlue: STM_DEEP_BLUE, lavender: STM_LAVENDER, rose: STM_ROSE,
  }), []);

  const isRelicOfferingBoosted = useCallback((relicId: string): number => {
    const ev = stateRef.current.activeEvent;
    if (!ev) return 1.0;
    const bonus = STM_CELESTIAL_EVENTS.find(e => e.id === ev)?.devotionBonus ?? 1.0;
    const def = STM_RELICS.find(r => r.id === relicId);
    if (!def) return bonus;
    if (ev === STM_EVENT_SOLSTICE && relicId === 'sun_stone') return bonus * 2;
    if (ev === STM_EVENT_LUNAR_ECLIPSE && relicId === 'moon_crystal') return bonus * 3;
    if (ev === STM_EVENT_SOLAR_ECLIPSE && relicId === 'eclipse_shard') return bonus * 4;
    return bonus;
  }, []);

  const getDailyDevotionGoal = useCallback((): number => {
    return 50 + (templeLevel * 10);
  }, [templeLevel]);

  const getDailyDevotionProgress = useCallback((): number => {
    const today = new Date().toISOString().slice(0, 10);
    if (stateRef.current.dailyQuest.date !== today) return 0;
    return stateRef.current.dailyQuest.prayersCompleted * 7 + stateRef.current.dailyQuest.offeringsMade * 15 + stateRef.current.dailyQuest.meditationsCompleted * 10;
  }, []);

  // =========================================================================
  // Batch & Combined Functions
  // =========================================================================

  const performFullTempleRitual = useCallback(() => {
    setState(prev => {
      const now = Date.now();
      const devotionGained = 25;
      return {
        ...prev,
        devotion: prev.devotion + devotionGained,
        totalDevotion: prev.totalDevotion + devotionGained,
        blessingsReceived: prev.blessingsReceived + 1,
        totalPrayers: prev.totalPrayers + 1,
        updatedAt: now,
      };
    });
  }, []);

  const discoverRandomRelic = useCallback((maxRarity?: RelicRarity) => {
    const relic = getRandomRelic(maxRarity);
    if (relic) discoverRelic(relic.id);
    return relic;
  }, [getRandomRelic, discoverRelic]);

  const unlockAllAvailableChambers = useCallback((): number => {
    let unlocked = 0;
    for (const chamber of STM_CHAMBERS) {
      if (unlockChamber(chamber.id)) unlocked++;
    }
    return unlocked;
  }, [unlockChamber]);

  const harvestAllReadyPlots = useCallback((): number => {
    let totalDevotion = 0;
    stateRef.current.cloudGardenPlots.forEach((plot, idx) => {
      if (plot.isReady) {
        totalDevotion += harvestGardenPlot(idx);
      }
    });
    return totalDevotion;
  }, [harvestGardenPlot]);

  const plantGardenFully = useCallback(plantId => {
    let planted = 0;
    stateRef.current.cloudGardenPlots.forEach((plot, idx) => {
      if (plot.plantId === null) {
        if (plantInGarden(idx, plantId)) planted++;
      }
    });
    return planted;
  }, [plantInGarden]);

  const getTempleStatsSummary = useCallback(() => {
    const s = stateRef.current;
    return {
      devotion: s.devotion, totalDevotion: s.totalDevotion, templeLevel: getTempleLevel(),
      title: getCurrentTitle()?.name ?? 'Pilgrim', uniqueRelics: getUniqueRelicCount(),
      chambersUnlocked: s.unlockedChambers.length, structuresBuilt: s.builtStructures.length,
      abilitiesUnlocked: s.unlockedAbilities.length, achievementsUnlocked: s.achievements.length,
      constellationsMapped: s.mappedConstellations.length, totalPrayers: s.totalPrayers,
      meditationCount: s.meditationCount, prayerStreak: s.prayerStreak,
      completionPercent: getTempleCompletionPercent(),
    };
  }, [getTempleLevel, getCurrentTitle, getUniqueRelicCount, getTempleCompletionPercent]);

  // =========================================================================
  // Return object — ~95 exported functions
  // =========================================================================

  return {
    state,
    templeLevel,
    templeLevelName,
    currentTitleDef,
    nextTitleDef,
    currentChamberDef,
    activeEventDef,
    templeCompletionPercent,
    devotionColor,
    rarityColorMap,
    structureDevotionPerDay,
    totalOfferingInventoryCount,
    uniqueRelicCount,
    totalRelicCount,
    // Relic
    getRelicDef,
    getCollectedRelic,
    getCollectedRelicsList,
    getRelicsByRarity,
    getCollectedRelicsByRarity,
    discoverRelic,
    hasRelic,
    getRelicQuantity,
    offerRelic,
    getRandomRelic,
    getTotalRelicCount,
    getUniqueRelicCount,
    // Chamber
    getChamberDef,
    getAllChambers,
    getUnlockedChambers,
    getLockedChambers,
    isChamberUnlocked,
    unlockChamber,
    enterChamber,
    getCurrentChamber,
    getChamberRelics,
    getChamberProgress,
    getVisitedChamberCount,
    // Offering
    getOfferingDef,
    getAllOfferings,
    getOfferingQuantity,
    addOfferingItem,
    makeOffering,
    getTotalOfferingInventoryCount,
    // Prayer
    performPrayer,
    getPrayerStreak,
    getLongestPrayerStreak,
    canPrayToday,
    getNextPrayerBonus,
    // Structure
    getStructureDef,
    getAllStructures,
    getBuiltStructures,
    getUnbuiltStructures,
    isStructureBuilt,
    buildStructure,
    getStructureDevotionPerDay,
    getStructuresByTier,
    getStructureTierCount,
    getMaxStructureTier,
    // Ability
    getAbilityDef,
    getAllAbilities,
    getUnlockedAbilities,
    getLockedAbilities,
    isAbilityUnlocked,
    unlockAbility,
    useAbility,
    getAbilityCooldownRemaining,
    getAbilitiesByElement,
    getAbilityCount,
    // Meditation
    startMeditation,
    completeMeditation,
    getMeditationCount,
    getTotalMeditationTime,
    getMeditationDevotionRate,
    // Constellation
    getConstellationDef,
    getAllConstellations,
    getMappedConstellations,
    getUnmappedConstellations,
    mapConstellation,
    isConstellationMapped,
    getConstellationProgress,
    getConstellationsBySeason,
    getStarObservationCount,
    // Cloud Garden
    getCloudGardenPlantDef,
    getAllGardenPlants,
    getGardenPlot,
    getAllGardenPlots,
    plantInGarden,
    updateGardenPlots,
    harvestGardenPlot,
    getGardenPlotProgress,
    getGardenHarvestCount,
    getReadyPlotCount,
    getEmptyPlotCount,
    // Celestial Event
    getCelestialEventDef,
    getAllCelestialEvents,
    getActiveEvent,
    startCelestialEvent,
    endCelestialEvent,
    getEventTimeRemaining,
    isEventActive,
    getEventDevotionBonus,
    // Achievement
    getAchievementDef,
    getAllAchievements,
    getUnlockedAchievements,
    getLockedAchievements,
    isAchievementUnlocked,
    checkAndUnlockAchievements,
    getAchievementCount,
    getAchievementProgress,
    getAchievementsByCategory,
    // Title
    getTitleDef,
    getAllTitles,
    getUnlockedTitles,
    getLockedTitles,
    getCurrentTitle,
    setCurrentTitle,
    getTitleProgress,
    getTitleBonusMultiplier,
    getNextTitle,
    // Daily Quest
    getDailyQuest,
    isDailyQuestComplete,
    resetDailyQuestIfNeeded,
    claimDailyReward,
    getDailyQuestProgress,
    // Devotion
    getDevotion,
    getTotalDevotion,
    spendDevotion,
    addDevotion,
    getDevotionToNextTitle,
    // Stats
    getTempleLevel,
    getTempleLevelName,
    getBlessingsReceived,
    getCloudGardenHarvests,
    getTotalOfferingsMade,
    getTotalOfferingValue,
    getRelicDiscoveryCount,
    getCreatedAt,
    getUpdatedAt,
    getDaysSinceCreation,
    getTempleCompletionPercent,
    // Utility
    formatDevotion,
    formatTime,
    getRarityLabel,
    getRarityColor,
    getElementColor,
    getThemeColors,
    isRelicOfferingBoosted,
    getDailyDevotionGoal,
    getDailyDevotionProgress,
    // Batch
    performFullTempleRitual,
    discoverRandomRelic,
    unlockAllAvailableChambers,
    harvestAllReadyPlots,
    plantGardenFully,
    getTempleStatsSummary,
    // Reset
    resetState,
    getStateSnapshot,
    getSerializableState,
  };
}
