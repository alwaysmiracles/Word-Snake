// =============================================================================
// lunar-nexus-wire.ts — Lunar Nexus (月光连接) Game System Wire
// A moon-themed feature module with celestial bonds, tarot divination,
// lunar structures, rituals, and moonlight harvesting mechanics.
// =============================================================================

import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =============================================================================
// Types & Interfaces
// =============================================================================

export type LNRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type LNElement = 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'void';
export type LNSeason = 'spring' | 'summer' | 'autumn' | 'winter';
export type LNCelestialType = 'spirit' | 'star_being' | 'moon_walker' | 'tide_caller' | 'dream_weaver' | 'eclipse_guardian' | 'constellation_lord' | 'lunar_sage';

export interface MoonPhaseDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  powerMultiplier: number;
  color: string;
}

export interface TideDef {
  id: string;
  name: string;
  description: string;
  effect: string;
  strength: number;
}

export interface ConstellationDef {
  id: string;
  name: string;
  symbol: string;
  element: LNElement;
  season: LNSeason;
  description: string;
  abilities: string[];
}

export interface CelestialDef {
  id: string;
  name: string;
  rarity: LNRarity;
  type: LNCelestialType;
  power: number;
  description: string;
}

export interface MoonlightItemDef {
  id: string;
  name: string;
  rarity: LNRarity;
  value: number;
  description: string;
}

export interface StructureDef {
  id: string;
  name: string;
  maxLevel: number;
  baseCost: number;
  description: string;
  bonusPerLevel: string;
}

export interface StructureInstance {
  defId: string;
  level: number;
  builtAt: number;
}

export interface AbilityDef {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  power: number;
  moonPhaseReq: number | null;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardMoonlight: number;
  rewardExp: number;
}

export interface TitleDef {
  id: string;
  name: string;
  levelRequired: number;
  description: string;
}

export interface RitualDef {
  id: string;
  name: string;
  description: string;
  requirements: { type: string; id?: string; amount: number }[];
  rewards: { moonlight: number; exp: number; items?: string[] };
  phaseReq: number | null;
}

export interface TarotCardDef {
  id: string;
  name: string;
  description: string;
  meaning: string;
  power: number;
}

export interface CelestialBond {
  celestialId: string;
  bondLevel: number;
  bondedAt: number;
  lastInteraction: number;
}

export interface TarotReading {
  cards: string[];
  drawnAt: number;
  interpretation: string;
}

export interface LNState {
  currentPhase: number;
  dayCounter: number;
  moonlightEnergy: number;
  celestialBonds: CelestialBond[];
  collectedItems: string[];
  structures: StructureInstance[];
  tarotDeck: string[];
  activeReading: TarotReading | null;
  ritualCooldowns: Record<string, number>;
  achievements: string[];
  currentTitle: string;
  totalDivinations: number;
  totalRituals: number;
  totalMoonlight: number;
  tideStrength: number;
  lunarLevel: number;
  lunarExp: number;
}

export interface LNActions {
  lnAdvanceMoon: () => void;
  lnHarvestMoonlight: () => number;
  lnPerformRitual: (ritualId: string) => boolean;
  lnSummonCelestial: (celestialId: string) => boolean;
  lnBondCelestial: (celestialId: string) => boolean;
  lnDrawTarot: () => TarotReading | null;
  lnInterpretReading: () => string;
  lnShuffleDeck: () => void;
  lnBuildStructure: (structDefId: string) => boolean;
  lnUpgradeStructure: (structId: string) => boolean;
  lnCastTide: (tideId: string) => boolean;
  lnChannelMoonlight: (targetId: string) => number;
  lnDivinate: () => TarotReading | null;
  lnObserveConstellation: (constellationId: string) => boolean;
  lnUnlockTitle: (titleId: string) => boolean;
  lnClaimAchievement: (achievementId: string) => boolean;
  lnSacrificeMoonstone: (itemId: string) => number;
  lnBuyMoonstone: (type: string) => boolean;
  lnResetProgress: () => void;
  lnForcePhase: (phase: number) => void;
  lnCollectItem: (itemId: string) => void;
  lnAddMoonlight: (amount: number) => void;
}

// =============================================================================
// Color Constants
// =============================================================================

export const LN_COLOR_NEW_MOON = '#0D0D2B';
export const LN_COLOR_WAXING = '#4A4A8A';
export const LN_COLOR_FULL_MOON = '#FFFACD';
export const LN_COLOR_WANING = '#6A5ACD';
export const LN_COLOR_MOONLIGHT = '#E8E8F0';
export const LN_COLOR_STARLIGHT = '#FFD700';
export const LN_COLOR_TAROT = '#8B0000';
export const LN_COLOR_CELESTIAL = '#DA70D6';

// =============================================================================
// LN_MOON_PHASES — 8 Lunar Phases
// =============================================================================

export const LN_MOON_PHASES: MoonPhaseDef[] = [
  {
    id: 'new_moon',
    name: 'New Moon',
    nameZh: '新月',
    description: 'The moon is hidden in shadow, a time of new beginnings and quiet introspection. Lunar energy is at its lowest ebb, but potential is boundless.',
    powerMultiplier: 0.5,
    color: LN_COLOR_NEW_MOON,
  },
  {
    id: 'waxing_crescent',
    name: 'Waxing Crescent',
    nameZh: '蛾眉月',
    description: 'A sliver of silver emerges from the darkness, carrying the promise of growth. Intentions set now gather strength like the growing light.',
    powerMultiplier: 0.75,
    color: '#1A1A4E',
  },
  {
    id: 'first_quarter',
    name: 'First Quarter',
    nameZh: '上弦月',
    description: 'Half the moon is illuminated, symbolizing decision and action. Challenges are met with clarity, and obstacles crumble under determined will.',
    powerMultiplier: 1.0,
    color: LN_COLOR_WAXING,
  },
  {
    id: 'waxing_gibbous',
    name: 'Waxing Gibbous',
    nameZh: '盈凸月',
    description: 'The moon nears fullness, radiating refining energy. Perfection is sought, adjustments are made, and plans are polished to brilliance.',
    powerMultiplier: 1.25,
    color: '#7B7BB5',
  },
  {
    id: 'full_moon',
    name: 'Full Moon',
    nameZh: '满月',
    description: 'The moon blazes in its full glory, a beacon of culmination and power. Moonlight floods the world, amplifying all magical and celestial forces.',
    powerMultiplier: 2.0,
    color: LN_COLOR_FULL_MOON,
  },
  {
    id: 'waning_gibbous',
    name: 'Waning Gibbous',
    nameZh: '亏凸月',
    description: 'The moon begins its descent, sharing wisdom gleaned from full illumination. Gratitude and reflection guide the lunar warden through this phase.',
    powerMultiplier: 1.25,
    color: LN_COLOR_WANING,
  },
  {
    id: 'last_quarter',
    name: 'Last Quarter',
    nameZh: '下弦月',
    description: 'Half the moon remains, a mirror for release and forgiveness. Old patterns are shed like the fading light, making room for renewal.',
    powerMultiplier: 1.0,
    color: '#5555A0',
  },
  {
    id: 'waning_crescent',
    name: 'Waning Crescent',
    nameZh: '残月',
    description: 'The last whisper of moonlight before darkness returns. Surrender and rest prepare the lunar warden for the next cycle of rebirth.',
    powerMultiplier: 0.75,
    color: '#2D2D5E',
  },
];

// =============================================================================
// LN_TIDES — 8 Tide Types
// =============================================================================

export const LN_TIDES: TideDef[] = [
  {
    id: 'high_tide',
    name: 'High Tide',
    description: 'The lunar seas swell to their peak, flooding the shores with silver luminescence.',
    effect: 'Doubles moonlight harvest for the current cycle',
    strength: 8,
  },
  {
    id: 'low_tide',
    name: 'Low Tide',
    description: 'The waters recede, revealing hidden treasures beneath the lunar seabed.',
    effect: 'Increases chance of finding rare moonlight items by 50%',
    strength: 3,
  },
  {
    id: 'spring_tide',
    name: 'Spring Tide',
    description: 'Sun and moon align in cosmic harmony, creating the most powerful tidal surge.',
    effect: 'Triples celestial bond experience gain for 3 cycles',
    strength: 10,
  },
  {
    id: 'neap_tide',
    name: 'Neap Tide',
    description: 'A gentle, balanced tide when celestial forces reach equilibrium.',
    effect: 'Reduces ritual cooldowns by half for the current cycle',
    strength: 5,
  },
  {
    id: 'phantom_tide',
    name: 'Phantom Tide',
    description: 'An ethereal tide of moonlight that flows between dimensions.',
    effect: 'Allows drawing 2 tarot cards instead of 1 for free',
    strength: 7,
  },
  {
    id: 'crimson_tide',
    name: 'Crimson Tide',
    description: 'Blood-red lunar waters surge with raw, untamed energy.',
    effect: 'Grants 5x ritual power but costs double moonlight',
    strength: 9,
  },
  {
    id: 'dream_tide',
    name: 'Dream Tide',
    description: 'A shimmering tide that blurs the boundary between waking and dreaming.',
    effect: 'Celestial spirits offer bonus gifts and rare encounters',
    strength: 6,
  },
  {
    id: 'void_tide',
    name: 'Void Tide',
    description: 'The tide of nothingness — all light is swallowed, but secrets emerge.',
    effect: 'Reveals hidden achievements and locked tarot cards',
    strength: 12,
  },
];

// =============================================================================
// LN_CONSTELLATIONS — 12 Zodiac Constellations
// =============================================================================

export const LN_CONSTELLATIONS: ConstellationDef[] = [
  {
    id: 'aries',
    name: 'Aries',
    symbol: '\u2648',
    element: 'fire',
    season: 'spring',
    description: 'The Ram charges through the celestial field, igniting courage and initiative in those who observe its fiery form.',
    abilities: ['Charge', 'Ignite', 'Bold Strike', 'Lunar Fury'],
  },
  {
    id: 'taurus',
    name: 'Taurus',
    symbol: '\u2649',
    element: 'earth',
    season: 'spring',
    description: 'The Bull stands resolute beneath the moon, embodying steadfast determination and the unshakeable foundation of lunar power.',
    abilities: ['Earthen Shield', 'Harvest Bloom', 'Stone Skin', 'Titan Grip'],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    symbol: '\u264A',
    element: 'air',
    season: 'spring',
    description: 'The Twins dance across the night sky in eternal conversation, weaving duality and adaptability into lunar magic.',
    abilities: ['Mirror Image', 'Twin Cast', 'Whisper Wind', 'Dual Mind'],
  },
  {
    id: 'cancer',
    name: 'Cancer',
    symbol: '\u264B',
    element: 'water',
    season: 'summer',
    description: 'The Crab carries the moon on its shell, a guardian of emotional depths and intuitive lunar wisdom.',
    abilities: ['Tidal Shell', 'Moon Heal', 'Emotional Shield', 'Tide Call'],
  },
  {
    id: 'leo',
    name: 'Leo',
    symbol: '\u264C',
    element: 'fire',
    season: 'summer',
    description: 'The Lion roars with solar-lunar brilliance, radiating authority and creative power under the night sky.',
    abilities: ['Lunar Roar', 'Royal Aura', 'Blazing Mane', 'Solar Eclipse'],
  },
  {
    id: 'virgo',
    name: 'Virgo',
    symbol: '\u264D',
    element: 'earth',
    season: 'summer',
    description: 'The Maiden tends the celestial gardens with precision, channeling analytical clarity into lunar purification rituals.',
    abilities: ['Purify', 'Harvest Moon', 'Crystal Focus', 'Lunar Analysis'],
  },
  {
    id: 'libra',
    name: 'Libra',
    symbol: '\u264E',
    element: 'air',
    season: 'autumn',
    description: 'The Scales balance light and dark, measuring cosmic justice beneath the equinoctial moon.',
    abilities: ['Balance', 'Harmony Field', 'Karmic Scale', 'Lunar Judgment'],
  },
  {
    id: 'scorpio',
    name: 'Scorpio',
    symbol: '\u264F',
    element: 'water',
    season: 'autumn',
    description: 'The Scorpion lurks in lunar shadows, wielding transformative power and the mysteries of death and rebirth.',
    abilities: ['Venom Strike', 'Shadow Pierce', 'Rebirth', 'Lunar Venom'],
  },
  {
    id: 'sagittarius',
    name: 'Sagittarius',
    symbol: '\u2650',
    element: 'fire',
    season: 'autumn',
    description: 'The Archer launches arrows of starlight toward distant horizons, carrying the spirit of exploration and cosmic truth.',
    abilities: ['Star Arrow', 'Cosmic Shot', 'Wanderlust', 'Lunar Volley'],
  },
  {
    id: 'capricorn',
    name: 'Capricorn',
    symbol: '\u2651',
    element: 'earth',
    season: 'winter',
    description: 'The Sea-Goat climbs the steepest lunar cliffs, mastering discipline and the slow accumulation of ancient wisdom.',
    abilities: ['Mountain Stance', 'Time Weave', 'Lunar Climb', 'Eternal Resolve'],
  },
  {
    id: 'aquarius',
    name: 'Aquarius',
    symbol: '\u2652',
    element: 'air',
    season: 'winter',
    description: 'The Water-Bearer pours cosmic inspiration across the heavens, flooding mortal minds with visionary lunar insight.',
    abilities: ['Flood Gate', 'Vision Pour', 'Astral Stream', 'Lunar Insight'],
  },
  {
    id: 'pisces',
    name: 'Pisces',
    symbol: '\u2653',
    element: 'water',
    season: 'winter',
    description: 'The Fish swim through the boundless ocean of dreams, dissolving boundaries between the conscious and the cosmic.',
    abilities: ['Dream Swim', 'Ocean Pulse', 'Illusion Wave', 'Lunar Dream'],
  },
];

// =============================================================================
// LN_CELESTIALS — 35 Celestial Entities (5 Rarity Tiers)
// =============================================================================

export const LN_CELESTIALS: CelestialDef[] = [
  // Common (7)
  { id: 'celest_lunar_moth', name: 'Lunar Moth', rarity: 'common', type: 'spirit', power: 5, description: 'A gentle moth drawn to moonlight, leaving trails of silver dust in its wake.' },
  { id: 'celest_star_firefly', name: 'Star Firefly', rarity: 'common', type: 'spirit', power: 6, description: 'Tiny fireflies that carry fragments of distant stars in their glowing abdomens.' },
  { id: 'celest_dusk_bat', name: 'Dusk Bat', rarity: 'common', type: 'spirit', power: 4, description: 'A nocturnal companion that navigates by reading the subtle currents of lunar energy.' },
  { id: 'celest_cloud_spryte', name: 'Cloud Spryte', rarity: 'common', type: 'spirit', power: 7, description: 'A mischievous sprite that forms shapes in moonlit clouds and whispers weather secrets.' },
  { id: 'celest_tide_minnow', name: 'Tide Minnow', rarity: 'common', type: 'tide_caller', power: 5, description: 'A shimmering fish that swims through the air during high tide, sensing lunar currents.' },
  { id: 'celest_pebble_golem', name: 'Pebble Golem', rarity: 'common', type: 'spirit', power: 8, description: 'A tiny stone guardian animated by moonlight, fiercely loyal despite its small size.' },
  { id: 'celest_dream_spark', name: 'Dream Spark', rarity: 'common', type: 'dream_weaver', power: 6, description: 'A sentient spark that visits sleeping minds, leaving behind fragments of prophetic dreams.' },
  // Uncommon (7)
  { id: 'celest_moon_rabbit', name: 'Moon Rabbit', rarity: 'uncommon', type: 'moon_walker', power: 15, description: 'The legendary rabbit who lives on the moon, pounding mochi from stardust and lunar rice.' },
  { id: 'celest_frost_hawk', name: 'Frost Hawk', rarity: 'uncommon', type: 'star_being', power: 18, description: 'A raptor made of crystallized moonbeams that soars through the upper atmosphere hunting comets.' },
  { id: 'celest_nightshade_nymph', name: 'Nightshade Nymph', rarity: 'uncommon', type: 'spirit', power: 14, description: 'A graceful spirit who tends poisonous lunar flowers that bloom only in total darkness.' },
  { id: 'celest_tide_whale', name: 'Tide Whale', rarity: 'uncommon', type: 'tide_caller', power: 20, description: 'A massive cetacean that swims through the sky-ocean, its song controlling the ebb and flow of tides.' },
  { id: 'celest_obsidian_fox', name: 'Obsidian Fox', rarity: 'uncommon', type: 'spirit', power: 16, description: 'A sleek fox with a coat of polished obsidian that reflects starlight in dazzling patterns.' },
  { id: 'celest_aurora_serpent', name: 'Aurora Serpent', rarity: 'uncommon', type: 'star_being', power: 17, description: 'A serpentine being that weaves the northern lights through its iridescent, flowing body.' },
  { id: 'celest_echo_owl', name: 'Echo Owl', rarity: 'uncommon', type: 'dream_weaver', power: 13, description: 'A wise owl whose hoots echo through the dream realm, carrying messages between sleeping souls.' },
  // Rare (7)
  { id: 'celest_star_fawn', name: 'Star Fawn', rarity: 'rare', type: 'star_being', power: 35, description: 'A fawn born from a fallen star, its antlers are living constellations that shift with the seasons.' },
  { id: 'celest_moon_phoenix', name: 'Moon Phoenix', rarity: 'rare', type: 'moon_walker', power: 40, description: 'A phoenix reborn not from fire but from moonlight, its feathers glow with cool silver flame.' },
  { id: 'celest_void_siren', name: 'Void Siren', rarity: 'rare', type: 'tide_caller', power: 38, description: 'A haunting singer who dwells at the edge of the void, her voice shaping the tides of darkness.' },
  { id: 'celest_dream_architect', name: 'Dream Architect', rarity: 'rare', type: 'dream_weaver', power: 42, description: 'A cosmic builder who constructs entire dreamscapes from threads of moonlight and memory.' },
  { id: 'celest_celestial_tortoise', name: 'Celestial Tortoise', rarity: 'rare', type: 'star_being', power: 36, description: 'An ancient turtle whose shell bears a map of every constellation, slowly walking across the cosmos.' },
  { id: 'celest_lunar_knight', name: 'Lunar Knight', rarity: 'rare', type: 'moon_walker', power: 45, description: 'A spectral warrior clad in armor forged from solidified moonbeams, eternally guarding the moon palace.' },
  { id: 'celest_tide_dragon', name: 'Tide Dragon', rarity: 'rare', type: 'tide_caller', power: 43, description: 'A serpentine dragon that dwells in the deepest ocean trenches, commanding the gravitational pull of moons.' },
  // Epic (7)
  { id: 'celest_solar_eclipse_spirit', name: 'Solar Eclipse Spirit', rarity: 'epic', type: 'eclipse_guardian', power: 80, description: 'A being born during total eclipse, existing in the eternal twilight between sun and moon.' },
  { id: 'celest_lunar_sage', name: 'Lunar Sage', rarity: 'epic', type: 'lunar_sage', power: 85, description: 'An immortal scholar who has studied every moon cycle since the birth of the world.' },
  { id: 'celest_nebula_queen', name: 'Nebula Queen', rarity: 'epic', type: 'star_being', power: 90, description: 'The sovereign of a distant nebula, she commands legions of star-born creatures across the galaxy.' },
  { id: 'celest_abyssal_leviathan', name: 'Abyssal Leviathan', rarity: 'epic', type: 'tide_caller', power: 95, description: 'A creature so vast it encircles the world, its movements causing the greatest tides in history.' },
  { id: 'celest_dream_sovereign', name: 'Dream Sovereign', rarity: 'epic', type: 'dream_weaver', power: 88, description: 'The ruler of the collective unconscious, whose dreams shape the reality of sleeping mortals.' },
  { id: 'celest_moonshadow_assassin', name: 'Moonshadow Assassin', rarity: 'epic', type: 'eclipse_guardian', power: 82, description: 'A lethal entity that moves through shadows cast by moonlight, striking without warning or sound.' },
  { id: 'celest_constellation_walker', name: 'Constellation Walker', rarity: 'epic', type: 'constellation_lord', power: 87, description: 'A colossal being that walks among the stars, stepping from one constellation to the next.' },
  // Legendary (7)
  { id: 'celest_moon_goddess', name: 'Moon Goddess Selene', rarity: 'legendary', type: 'moon_walker', power: 200, description: 'The divine personification of the moon itself, Selene drives her silver chariot across the night sky.' },
  { id: 'celest_star_forger', name: 'Star Forger Vulcan', rarity: 'legendary', type: 'star_being', power: 220, description: 'The cosmic blacksmith who forges new stars in the heart of supernovae, each one a masterwork.' },
  { id: 'celest_void_emperor', name: 'Void Emperor Nyx', rarity: 'legendary', type: 'eclipse_guardian', power: 250, description: 'The ancient ruler of primordial darkness who existed before the first moon ever shone.' },
  { id: 'celest_cosmic_dreamer', name: 'Cosmic Dreamer Morpheus', rarity: 'legendary', type: 'dream_weaver', power: 230, description: 'The architect of all dreams, who weaves the fabric of reality from the threads of imagination.' },
  { id: 'celest_tidal_colossus', name: 'Tidal Colossus Oceanus', rarity: 'legendary', type: 'tide_caller', power: 210, description: 'A titan whose body is the ocean itself, every wave an extension of its indomitable will.' },
  { id: 'celest_zodiac_sovereign', name: 'Zodiac Sovereign Ophiuchus', rarity: 'legendary', type: 'constellation_lord', power: 240, description: 'The forgotten 13th zodiac, a serpentine master who commands all twelve zodiac constellations.' },
  { id: 'celest_eclipse_dragon', name: 'Eclipse Dragon Apophis', rarity: 'legendary', type: 'eclipse_guardian', power: 260, description: 'The world-serpent who devours the moon during eclipses, the most feared celestial entity in existence.' },
];

// =============================================================================
// LN_MOONLIGHT_ITEMS — 30 Moonlight Collectibles
// =============================================================================

export const LN_MOONLIGHT_ITEMS: MoonlightItemDef[] = [
  // Common (10)
  { id: 'item_moon_dust', name: 'Moon Dust', rarity: 'common', value: 5, description: 'Fine silvery powder collected from moonlit surfaces at dawn.' },
  { id: 'item_star_fragment', name: 'Star Fragment', rarity: 'common', value: 8, description: 'A tiny shard of crystallized starlight that pulses with gentle warmth.' },
  { id: 'item_lunar_pebble', name: 'Lunar Pebble', rarity: 'common', value: 3, description: 'A smooth stone that glows faintly under the light of any moon.' },
  { id: 'item_tide_crystal', name: 'Tide Crystal', rarity: 'common', value: 6, description: 'A translucent crystal formed by the rhythmic compression of lunar tides.' },
  { id: 'item_night_bloom', name: 'Night Bloom', rarity: 'common', value: 4, description: 'A flower that only opens under moonlight, its petals storing lunar essence.' },
  { id: 'item_dew_drop', name: 'Celestial Dew Drop', rarity: 'common', value: 3, description: 'A single drop of dew infused with concentrated moonbeam energy.' },
  { id: 'item_shadow_thread', name: 'Shadow Thread', rarity: 'common', value: 7, description: 'A gossamer thread spun from the boundary between moonlight and shadow.' },
  { id: 'item_cloud_quartz', name: 'Cloud Quartz', rarity: 'common', value: 5, description: 'A fluffy white quartz crystal that floats a few inches above the ground.' },
  { id: 'item_foam_pearl', name: 'Sea Foam Pearl', rarity: 'common', value: 6, description: 'A small luminescent pearl found in the foam of lunar high tides.' },
  { id: 'item_bark_moss', name: 'Moon Bark Moss', rarity: 'common', value: 4, description: 'Bioluminescent moss that grows only on the bark of moon-kissed trees.' },
  // Uncommon (8)
  { id: 'item_moonstone', name: 'Moonstone', rarity: 'uncommon', value: 25, description: 'A pearly gem that shifts between blue and white as the moon changes phases.' },
  { id: 'item_star_dust_vial', name: 'Star Dust Vial', rarity: 'uncommon', value: 30, description: 'A sealed vial containing captured stardust, glittering with trapped constellations.' },
  { id: 'item_lunar_crystal', name: 'Lunar Crystal', rarity: 'uncommon', value: 28, description: 'A prismatic crystal that refracts moonlight into a spectrum of arcane colors.' },
  { id: 'item_eclipse_shard', name: 'Eclipse Shard', rarity: 'uncommon', value: 35, description: 'A fragment of darkness from a solar eclipse, cold to the touch and humming with power.' },
  { id: 'item_tide_essence', name: 'Tide Essence', rarity: 'uncommon', value: 22, description: 'Bottled energy extracted from the strongest tidal pull of the lunar cycle.' },
  { id: 'item_dream_catcher', name: 'Dream Catcher Orb', rarity: 'uncommon', value: 32, description: 'A crystalline sphere containing swirling images of captured dreams and visions.' },
  { id: 'item_silver_leaf', name: 'Silver Leaf', rarity: 'uncommon', value: 20, description: 'A metallic leaf from the legendary Silver Tree that grows on the far side of the moon.' },
  { id: 'item_constellation_map', name: 'Constellation Map Fragment', rarity: 'uncommon', value: 27, description: 'A torn piece of an ancient star map, revealing paths between celestial waypoints.' },
  // Rare (6)
  { id: 'item_phantom_moonstone', name: 'Phantom Moonstone', rarity: 'rare', value: 80, description: 'A moonstone that becomes invisible during the new moon, only visible under starlight alone.' },
  { id: 'item_celestial_core', name: 'Celestial Core', rarity: 'rare', value: 100, description: 'The still-beating heart of a fallen celestial entity, radiating immense power.' },
  { id: 'item_void_crystal', name: 'Void Crystal', rarity: 'rare', value: 90, description: 'A crystal grown in the absolute void between stars, absorbing all surrounding light.' },
  { id: 'item_lunar_horn', name: 'Lunar Unicorn Horn', rarity: 'rare', value: 120, description: 'A spiraled horn shed by the mythical Lunar Unicorn during the full moon.' },
  { id: 'item_eclipse_crown', name: 'Eclipse Crown Shard', rarity: 'rare', value: 95, description: 'A fragment of the crown worn by the Eclipse Guardian during celestial alignments.' },
  { id: 'item_tide_scepter', name: 'Tide Scepter Gem', rarity: 'rare', value: 85, description: 'A gemstone that once adorned the scepter of the ancient Tide Sovereign.' },
  // Epic (4)
  { id: 'item_moon_goddess_tear', name: "Moon Goddess's Tear", rarity: 'epic', value: 300, description: 'A single tear shed by the Moon Goddess, containing infinite sorrow and infinite beauty.' },
  { id: 'item_star_forger_hammer_fragment', name: 'Star Forge Fragment', rarity: 'epic', value: 350, description: 'A piece of the legendary hammer used to forge stars, still hot to the touch.' },
  { id: 'item_void_emperor_sigil', name: 'Void Emperor Sigil', rarity: 'epic', value: 400, description: 'A dark sigil bearing the mark of the Void Emperor, pulsing with absolute nothingness.' },
  { id: 'item_cosmic_dream_thread', name: 'Cosmic Dream Thread', rarity: 'epic', value: 320, description: 'A single thread from the tapestry of dreams woven by the Cosmic Dreamer.' },
  // Legendary (2)
  { id: 'item_lunar_nexus_core', name: 'Lunar Nexus Core', rarity: 'legendary', value: 1000, description: 'The central crystal that powers the entire Lunar Nexus, containing the essence of every moon phase.' },
  { id: 'item_eclipse_dragon_scale', name: 'Eclipse Dragon Scale', rarity: 'legendary', value: 1200, description: 'An impossibly dark scale from the Eclipse Dragon, each one containing a captured eclipse.' },
];

// =============================================================================
// LN_STRUCTURES — 25 Upgradeable Lunar Structures
// =============================================================================

export const LN_STRUCTURES: StructureDef[] = [
  { id: 'struct_moonlight_well', name: 'Moonlight Well', maxLevel: 10, baseCost: 50, description: 'A well that collects and stores pure moonlight, providing a steady flow of lunar energy for rituals and crafting.', bonusPerLevel: '+10 moonlight per harvest' },
  { id: 'struct_star_observatory', name: 'Star Observatory', maxLevel: 10, baseCost: 80, description: 'A grand tower fitted with enchanted lenses for observing distant stars and tracking celestial events.', bonusPerLevel: '+5% divination accuracy' },
  { id: 'struct_lunar_altar', name: 'Lunar Altar', maxLevel: 10, baseCost: 100, description: 'A sacred altar where moon rituals are performed, amplifying the power of every ceremony conducted upon it.', bonusPerLevel: '+15% ritual power' },
  { id: 'struct_tide_shrine', name: 'Tide Shrine', maxLevel: 10, baseCost: 70, description: 'A shrine built on the shore of the lunar sea, attuned to the rhythm of the cosmic tides.', bonusPerLevel: '+8% tide strength' },
  { id: 'struct_crystal_greenhouse', name: 'Crystal Greenhouse', maxLevel: 10, baseCost: 60, description: 'A greenhouse grown from living crystal where moon-flowers and star-vines are cultivated for alchemy.', bonusPerLevel: '+2 rare item find chance' },
  { id: 'struct_dream_sanctum', name: 'Dream Sanctum', maxLevel: 10, baseCost: 120, description: 'A meditation chamber that bridges the waking world and the realm of dreams, enhancing prophetic visions.', bonusPerLevel: '+12% dream interpretation accuracy' },
  { id: 'struct_celestial_beacon', name: 'Celestial Beacon', maxLevel: 10, baseCost: 150, description: 'A towering beacon that shines with captured starlight, attracting celestial spirits from across the cosmos.', bonusPerLevel: '+10% celestial encounter rate' },
  { id: 'struct_moon_gate', name: 'Moon Gate', maxLevel: 10, baseCost: 200, description: 'An ancient portal gateway engraved with lunar runes, allowing passage to hidden moonlit dimensions.', bonusPerLevel: '+1 extra exploration per cycle' },
  { id: 'struct_silver_forge', name: 'Silver Forge', maxLevel: 10, baseCost: 90, description: 'A forge heated by concentrated moonbeams, capable of crafting moonstone tools and lunar equipment.', bonusPerLevel: '+10% crafting success rate' },
  { id: 'struct_tarot_pavilion', name: 'Tarot Pavilion', maxLevel: 10, baseCost: 110, description: 'An elegant open-air pavilion where the tarot cards reveal their deepest meanings under the night sky.', bonusPerLevel: '+1 bonus tarot draw per day' },
  { id: 'struct_ritual_circle', name: 'Ritual Circle', maxLevel: 10, baseCost: 130, description: 'A permanent circle of standing stones inscribed with ancient lunar glyphs for complex ceremony work.', bonusPerLevel: '-5% ritual cooldown reduction' },
  { id: 'struct_astro_tower', name: 'Astrological Tower', maxLevel: 10, baseCost: 140, description: 'A spiraling tower where the movements of celestial bodies are charted and their influence predicted.', bonusPerLevel: '+8% constellation observation bonus' },
  { id: 'struct_void_anchor', name: 'Void Anchor', maxLevel: 10, baseCost: 180, description: 'A mysterious artifact that anchors a pocket of stable space, protecting against void tide incursions.', bonusPerLevel: '+20 void resistance' },
  { id: 'struct_harmony_bell', name: 'Harmony Bell', maxLevel: 10, baseCost: 95, description: 'A massive bell that resonates with the frequency of moonlight, harmonizing lunar energy across structures.', bonusPerLevel: '+5% all structure bonuses' },
  { id: 'struct_spirit_garden', name: 'Spirit Garden', maxLevel: 10, baseCost: 75, description: 'A tranquil garden where celestial spirits rest and regenerate, speeding their return from the astral plane.', bonusPerLevel: '-10% celestial bonding time' },
  { id: 'struct_lunar_library', name: 'Lunar Library', maxLevel: 10, baseCost: 160, description: 'A vast repository of moon lore, star charts, and forgotten rituals from civilizations long past.', bonusPerLevel: '+10% experience gain' },
  { id: 'struct_pearl_refinery', name: 'Pearl Refinery', maxLevel: 10, baseCost: 85, description: 'A refinery that processes raw tide crystals and foam pearls into refined lunar gemstones.', bonusPerLevel: '+15% item value increase' },
  { id: 'struct_shadow_vault', name: 'Shadow Vault', maxLevel: 10, baseCost: 170, description: 'A vault built in perpetual shadow where dangerous celestial artifacts are safely contained and studied.', bonusPerLevel: '+5% legendary find chance' },
  { id: 'struct_eclipse_monument', name: 'Eclipse Monument', maxLevel: 10, baseCost: 250, description: 'A massive obsidian monument that absorbs the power of eclipses, storing it for times of greatest need.', bonusPerLevel: '+25 eclipse power storage' },
  { id: 'struct_zenith_spire', name: 'Zenith Spire', maxLevel: 10, baseCost: 220, description: 'A needle-thin spire that reaches into the upper atmosphere, directly channeling unfiltered stellar energy.', bonusPerLevel: '+20 raw lunar power' },
  { id: 'struct_moon_nursery', name: 'Moon Nursery', maxLevel: 10, baseCost: 65, description: 'A warm, moonlit nursery where young celestial companions are raised and nurtured to maturity.', bonusPerLevel: '+15% celestial bond growth' },
  { id: 'struct_cosmic_anvil', name: 'Cosmic Anvil', maxLevel: 10, baseCost: 190, description: 'An indestructible anvil from the heart of a neutron star, used for forging the most powerful lunar artifacts.', bonusPerLevel: '+10% legendary crafting chance' },
  { id: 'struct_nebula_mirror', name: 'Nebula Mirror', maxLevel: 10, baseCost: 210, description: 'A mirror that reflects images of distant nebulae, revealing secrets of the cosmos to those who gaze within.', bonusPerLevel: '+12% revelation chance' },
  { id: 'struct_eternal_flame', name: 'Eternal Moonflame', maxLevel: 10, baseCost: 175, description: 'A flame that burns with cold moonlight instead of heat, providing eternal illumination for all lunar structures.', bonusPerLevel: '+8% all production speed' },
  { id: 'struct_nexus_core', name: 'Nexus Core Chamber', maxLevel: 10, baseCost: 500, description: 'The heart of the Lunar Nexus itself, a crystalline chamber where all lunar energies converge and amplify.', bonusPerLevel: '+3% total nexus power' },
];

// =============================================================================
// LN_ABILITIES — 22 Lunar/Moon Abilities
// =============================================================================

export const LN_ABILITIES: AbilityDef[] = [
  { id: 'ability_moonbeam', name: 'Moonbeam', description: 'Concentrates a single beam of moonlight to illuminate dark areas and reveal hidden items.', cooldown: 3, power: 10, moonPhaseReq: null },
  { id: 'ability_tide_surge', name: 'Tide Surge', description: 'Commands the lunar tide to surge forward, washing away obstacles and revealing submerged treasures.', cooldown: 5, power: 20, moonPhaseReq: null },
  { id: 'ability_starfall', name: 'Starfall', description: 'Calls down a shower of tiny stars that deal minor damage and light up the battlefield.', cooldown: 8, power: 35, moonPhaseReq: null },
  { id: 'ability_lunar_shield', name: 'Lunar Shield', description: 'Raises a barrier of solidified moonlight that absorbs incoming damage for a limited time.', cooldown: 10, power: 30, moonPhaseReq: null },
  { id: 'ability_celestial_sight', name: 'Celestial Sight', description: 'Temporarily grants the ability to see celestial entities and hidden lunar pathways.', cooldown: 6, power: 15, moonPhaseReq: null },
  { id: 'ability_dream_step', name: 'Dream Step', description: 'Phase through solid matter by stepping partially into the dream realm for a brief moment.', cooldown: 12, power: 40, moonPhaseReq: null },
  { id: 'ability_shadow_meld', name: 'Shadow Meld', description: 'Merge with the shadows cast by moonlight, becoming invisible to enemies and spirits alike.', cooldown: 15, power: 45, moonPhaseReq: null },
  { id: 'ability_moon_heal', name: 'Moon Heal', description: 'Channels restorative moonlight to mend wounds and purify ailments of body and spirit.', cooldown: 8, power: 25, moonPhaseReq: 0 },
  { id: 'ability_waxing_growth', name: 'Waxing Growth', description: 'Accelerates the growth of lunar plants and crystals, boosting resource production.', cooldown: 10, power: 20, moonPhaseReq: 1 },
  { id: 'ability_waning_release', name: 'Waning Release', description: 'Releases stored negative energy, cleansing curses and breaking malevolent enchantments.', cooldown: 10, power: 30, moonPhaseReq: 6 },
  { id: 'ability_full_moon_blessing', name: 'Full Moon Blessing', description: 'During the full moon, receive a massive boost to all lunar abilities and moonlight income.', cooldown: 30, power: 100, moonPhaseReq: 4 },
  { id: 'ability_new_moon_veil', name: 'New Moon Veil', description: 'Wraps the area in absolute darkness during the new moon, disorienting enemies and hiding allies.', cooldown: 20, power: 50, moonPhaseReq: 0 },
  { id: 'ability_eclipse_fury', name: 'Eclipse Fury', description: 'Unleashes the combined power of sun and moon in a devastating blast of twilight energy.', cooldown: 60, power: 200, moonPhaseReq: 4 },
  { id: 'ability_tidal_wave', name: 'Tidal Wave', description: 'Summons a massive wave of lunar water that crashes through everything in its path.', cooldown: 25, power: 80, moonPhaseReq: null },
  { id: 'ability_constellation_call', name: 'Constellation Call', description: 'Invokes the power of a chosen zodiac constellation to grant a temporary powerful boon.', cooldown: 20, power: 60, moonPhaseReq: null },
  { id: 'ability_ritual_mastery', name: 'Ritual Mastery', description: 'Instantly completes the current ritual and doubles all rewards from the ceremony.', cooldown: 45, power: 150, moonPhaseReq: null },
  { id: 'ability_celestial_bond', name: 'Celestial Bond', description: 'Strengthens the bond with a chosen celestial companion, boosting its power and loyalty.', cooldown: 15, power: 35, moonPhaseReq: null },
  { id: 'ability_void_step', name: 'Void Step', description: 'Takes a single step through the void, teleporting to any explored location in an instant.', cooldown: 30, power: 70, moonPhaseReq: 7 },
  { id: 'ability_dream_weave', name: 'Dream Weave', description: 'Manipulates the fabric of dreams, creating illusions that can confuse enemies or guide allies.', cooldown: 18, power: 55, moonPhaseReq: null },
  { id: 'ability_silver_tongue', name: 'Silver Tongue', description: 'Speaks words of lunar enchantment that can charm celestial spirits and negotiate peace.', cooldown: 12, power: 25, moonPhaseReq: 3 },
  { id: 'ability_cosmic_drain', name: 'Cosmic Drain', description: 'Draws life force from enemies and converts it into moonlight energy and healing.', cooldown: 15, power: 45, moonPhaseReq: 5 },
  { id: 'ability_nexus_awakening', name: 'Nexus Awakening', description: 'Awakens the full power of the Lunar Nexus, granting temporary god-like lunar abilities.', cooldown: 120, power: 500, moonPhaseReq: 4 },
];

// =============================================================================
// LN_ACHIEVEMENTS — 18 Achievements
// =============================================================================

export const LN_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'ach_first_harvest', name: 'First Light', description: 'Harvest moonlight for the very first time', conditionKey: 'totalMoonlight', targetValue: 10, rewardMoonlight: 20, rewardExp: 15 },
  { id: 'ach_moon_child', name: 'Moon Child', description: 'Accumulate 500 total moonlight energy', conditionKey: 'totalMoonlight', targetValue: 500, rewardMoonlight: 100, rewardExp: 50 },
  { id: 'ach_ritual_novice', name: 'Ritual Novice', description: 'Complete your first moon ritual', conditionKey: 'totalRituals', targetValue: 1, rewardMoonlight: 30, rewardExp: 25 },
  { id: 'ach_ritual_master', name: 'Ritual Master', description: 'Complete 25 moon rituals', conditionKey: 'totalRituals', targetValue: 25, rewardMoonlight: 200, rewardExp: 150 },
  { id: 'ach_fortune_teller', name: 'Fortune Teller', description: 'Perform 10 tarot divinations', conditionKey: 'totalDivinations', targetValue: 10, rewardMoonlight: 80, rewardExp: 60 },
  { id: 'ach_oracle', name: 'Oracle', description: 'Perform 50 tarot divinations', conditionKey: 'totalDivinations', targetValue: 50, rewardMoonlight: 300, rewardExp: 200 },
  { id: 'ach_celestial_friend', name: 'Celestial Friend', description: 'Bond with your first celestial entity', conditionKey: 'celestialBonds', targetValue: 1, rewardMoonlight: 50, rewardExp: 40 },
  { id: 'ach_spirit_herd', name: 'Spirit Herd', description: 'Bond with 10 different celestial entities', conditionKey: 'celestialBonds', targetValue: 10, rewardMoonlight: 250, rewardExp: 180 },
  { id: 'ach_architect', name: 'Lunar Architect', description: 'Build your first lunar structure', conditionKey: 'structures', targetValue: 1, rewardMoonlight: 40, rewardExp: 30 },
  { id: 'ach_city_builder', name: 'City of the Moon', description: 'Build 15 lunar structures', conditionKey: 'structures', targetValue: 15, rewardMoonlight: 400, rewardExp: 300 },
  { id: 'ach_phase_walker', name: 'Phase Walker', description: 'Witness all 8 moon phases', conditionKey: 'dayCounter', targetValue: 64, rewardMoonlight: 150, rewardExp: 100 },
  { id: 'ach_full_moon_fever', name: 'Full Moon Fever', description: 'Harvest moonlight during 5 different full moons', conditionKey: 'totalMoonlight', targetValue: 2000, rewardMoonlight: 500, rewardExp: 350 },
  { id: 'ach_tarot_collector', name: 'Tarot Collector', description: 'Collect all 22 tarot cards', conditionKey: 'tarotDeck', targetValue: 22, rewardMoonlight: 1000, rewardExp: 500 },
  { id: 'ach_item_hoarder', name: 'Moonlight Hoarder', description: 'Collect 20 different moonlight items', conditionKey: 'collectedItems', targetValue: 20, rewardMoonlight: 300, rewardExp: 200 },
  { id: 'ach_constellation_scholar', name: 'Constellation Scholar', description: 'Observe all 12 zodiac constellations', conditionKey: 'constellations', targetValue: 12, rewardMoonlight: 600, rewardExp: 400 },
  { id: 'ach_tide_rider', name: 'Tide Rider', description: 'Cast 10 different tides', conditionKey: 'totalTides', targetValue: 10, rewardMoonlight: 200, rewardExp: 150 },
  { id: 'ach_lunar_deity', name: 'Lunar Deity', description: 'Reach the maximum lunar level', conditionKey: 'lunarLevel', targetValue: 50, rewardMoonlight: 5000, rewardExp: 2000 },
  { id: 'ach_nexus_complete', name: 'Nexus Complete', description: 'Upgrade all structures to maximum level', conditionKey: 'maxStructures', targetValue: 25, rewardMoonlight: 10000, rewardExp: 5000 },
];

// =============================================================================
// LN_TITLES — 8 Titles (Moon Child to Lunar Deity)
// =============================================================================

export const LN_TITLES: TitleDef[] = [
  { id: 'title_moon_child', name: 'Moon Child', levelRequired: 1, description: 'A young soul just beginning to feel the pull of the moon, eyes wide with celestial wonder.' },
  { id: 'title_moon_gazer', name: 'Moon Gazer', levelRequired: 5, description: 'One who spends countless nights studying the moon, learning the rhythm of its eternal dance.' },
  { id: 'title_tide_caller', name: 'Tide Caller', levelRequired: 10, description: 'A practitioner who has learned to whisper to the lunar tides and command the ocean.' },
  { id: 'title_star_reader', name: 'Star Reader', levelRequired: 18, description: 'An accomplished diviner who reads the stars with uncanny accuracy and deep intuition.' },
  { id: 'title_celestial_walker', name: 'Celestial Walker', levelRequired: 25, description: 'One who has walked among the stars and returned with knowledge beyond mortal understanding.' },
  { id: 'title_lunar_scholar', name: 'Lunar Scholar', levelRequired: 33, description: 'A master of all lunar lore, respected by celestial beings and sought by seekers of wisdom.' },
  { id: 'title_eclipse_guardian', name: 'Eclipse Guardian', levelRequired: 42, description: 'A powerful guardian who stands between worlds during eclipses, maintaining cosmic balance.' },
  { id: 'title_lunar_deity', name: 'Lunar Deity', levelRequired: 50, description: 'An ascended being of pure lunar essence, one with the moon itself, eternal and radiant.' },
];

// =============================================================================
// LN_RITUALS — 15 Moon Rituals
// =============================================================================

export const LN_RITUALS: RitualDef[] = [
  {
    id: 'ritual_dawn_blessing',
    name: 'Dawn Blessing',
    description: 'A simple morning ritual performed at the first light of dawn, greeting the retiring moon and welcoming the new day with gratitude.',
    requirements: [{ type: 'moonlight', amount: 10 }],
    rewards: { moonlight: 25, exp: 15 },
    phaseReq: null,
  },
  {
    id: 'ritual_moonlight_bath',
    name: 'Moonlight Bath',
    description: 'Bathe in concentrated moonlight to cleanse the spirit and restore inner balance, washing away accumulated negative energy.',
    requirements: [{ type: 'moonlight', amount: 20 }, { type: 'item', id: 'item_moon_dust', amount: 3 }],
    rewards: { moonlight: 50, exp: 30 },
    phaseReq: null,
  },
  {
    id: 'ritual_star_summoning',
    name: 'Star Summoning',
    description: 'A ritual to call upon the light of distant stars, temporarily empowering celestial bonds and attracting new spirit companions.',
    requirements: [{ type: 'moonlight', amount: 40 }, { type: 'item', id: 'item_star_fragment', amount: 2 }],
    rewards: { moonlight: 80, exp: 50 },
    phaseReq: 0,
  },
  {
    id: 'ritual_tide_awakening',
    name: 'Tide Awakening',
    description: 'Awakens the primal tide forces, summoning a powerful tide that reshapes the lunar landscape and reveals hidden pathways.',
    requirements: [{ type: 'moonlight', amount: 35 }, { type: 'item', id: 'item_tide_crystal', amount: 1 }],
    rewards: { moonlight: 70, exp: 40 },
    phaseReq: null,
  },
  {
    id: 'ritual_celestial_communion',
    name: 'Celestial Communion',
    description: 'Opens a channel of direct communication with the celestial realm, allowing communion with powerful stellar beings.',
    requirements: [{ type: 'moonlight', amount: 60 }, { type: 'item', id: 'item_dream_catcher', amount: 1 }],
    rewards: { moonlight: 120, exp: 80 },
    phaseReq: 2,
  },
  {
    id: 'ritual_full_moon_transcendence',
    name: 'Full Moon Transcendence',
    description: 'Performed only under the full moon, this ritual elevates the practitioner to a higher state of lunar consciousness.',
    requirements: [{ type: 'moonlight', amount: 100 }, { type: 'item', id: 'item_moonstone', amount: 2 }],
    rewards: { moonlight: 250, exp: 150 },
    phaseReq: 4,
  },
  {
    id: 'ritual_shadow_binding',
    name: 'Shadow Binding',
    description: 'Binds the power of shadows to the lunar warden, granting mastery over darkness and the ability to command shadow entities.',
    requirements: [{ type: 'moonlight', amount: 50 }, { type: 'item', id: 'item_shadow_thread', amount: 3 }],
    rewards: { moonlight: 100, exp: 70 },
    phaseReq: 6,
  },
  {
    id: 'ritual_dream_weaving',
    name: 'Dream Weaving',
    description: 'Weaves the fabric of dreams into tangible form, pulling prophetic visions and hidden knowledge from the dream realm.',
    requirements: [{ type: 'moonlight', amount: 45 }, { type: 'item', id: 'item_night_bloom', amount: 2 }],
    rewards: { moonlight: 90, exp: 60 },
    phaseReq: null,
  },
  {
    id: 'ritual_eclipse_gateway',
    name: 'Eclipse Gateway',
    description: 'Opens a temporary gateway to the eclipse dimension, a realm where sun and moon exist in perfect, dangerous harmony.',
    requirements: [{ type: 'moonlight', amount: 150 }, { type: 'item', id: 'item_eclipse_shard', amount: 1 }],
    rewards: { moonlight: 400, exp: 200 },
    phaseReq: 4,
  },
  {
    id: 'ritual_constellation_alignment',
    name: 'Constellation Alignment',
    description: 'Aligns the zodiac constellations to channel their combined elemental power into the Lunar Nexus.',
    requirements: [{ type: 'moonlight', amount: 80 }, { type: 'item', id: 'item_constellation_map', amount: 1 }],
    rewards: { moonlight: 180, exp: 120 },
    phaseReq: 2,
  },
  {
    id: 'ritual_void_purification',
    name: 'Void Purification',
    description: 'Purges accumulated void corruption from the nexus and restores balance between light and darkness.',
    requirements: [{ type: 'moonlight', amount: 70 }, { type: 'item', id: 'item_void_crystal', amount: 1 }],
    rewards: { moonlight: 150, exp: 100 },
    phaseReq: 0,
  },
  {
    id: 'ritual_lunar_forge',
    name: 'Lunar Forge',
    description: 'Ignites the lunar forge to craft powerful moonstone weapons and enchanted lunar equipment from raw materials.',
    requirements: [{ type: 'moonlight', amount: 90 }, { type: 'item', id: 'item_lunar_crystal', amount: 2 }],
    rewards: { moonlight: 200, exp: 130, items: ['item_phantom_moonstone'] },
    phaseReq: 1,
  },
  {
    id: 'ritual_spirit_feast',
    name: 'Spirit Feast',
    description: 'A grand banquet in honor of bonded celestial spirits, strengthening bonds and earning their deepest gratitude.',
    requirements: [{ type: 'moonlight', amount: 55 }, { type: 'item', id: 'item_silver_leaf', amount: 2 }],
    rewards: { moonlight: 120, exp: 90 },
    phaseReq: 3,
  },
  {
    id: 'ritual_cosmic_harmony',
    name: 'Cosmic Harmony',
    description: 'A grand ritual that synchronizes the Lunar Nexus with the cosmic rhythm, boosting all production and abilities.',
    requirements: [{ type: 'moonlight', amount: 200 }, { type: 'item', id: 'item_celestial_core', amount: 1 }],
    rewards: { moonlight: 500, exp: 300 },
    phaseReq: 4,
  },
  {
    id: 'ritual_nexus_ascension',
    name: 'Nexus Ascension',
    description: 'The ultimate lunar ritual, ascending the Lunar Nexus to its final form and unlocking the secrets of the cosmos.',
    requirements: [{ type: 'moonlight', amount: 500 }, { type: 'item', id: 'item_lunar_nexus_core', amount: 1 }],
    rewards: { moonlight: 2000, exp: 1000 },
    phaseReq: 4,
  },
];

// =============================================================================
// LN_TAROT_CARDS — 22 Tarot-Style Divination Cards
// =============================================================================

export const LN_TAROT_CARDS: TarotCardDef[] = [
  { id: 'tarot_the_fool', name: 'The Fool', description: 'A carefree figure stands at the edge of a cliff beneath a waxing crescent moon, ready to leap into the unknown.', meaning: 'New beginnings, innocence, spontaneity, a leap of faith into the lunar unknown.', power: 5 },
  { id: 'tarot_the_moon_priestess', name: 'The Moon Priestess', description: 'A robed figure sits between two pillars of moonlight, a lunar crescent at her brow, scrolls of destiny unfurled.', meaning: 'Intuition, mystery, hidden knowledge, the subconscious mind speaking through lunar whispers.', power: 15 },
  { id: 'tarot_the_star', name: 'The Star', description: 'A lone figure kneels beneath a magnificent eight-pointed star, pouring lunar water into a still pool.', meaning: 'Hope, inspiration, renewal, guidance from the celestial realm during dark nights.', power: 12 },
  { id: 'tarot_the_moon', name: 'The Moon', description: 'The great moon hangs low between two towers, illuminating a path that leads into shadow and transformation.', meaning: 'Illusion, fear, the unconscious, navigating by moonlight through uncertain terrain.', power: 20 },
  { id: 'tarot_the_sun_moon', name: 'The Sun and Moon', description: 'Two celestial bodies embrace in the sky, their light merging into a single radiance of perfect balance.', meaning: 'Harmony, balance, duality resolved, the wedding of conscious and lunar self.', power: 18 },
  { id: 'tarot_the_tide', name: 'The Tide', description: 'An enormous wave towers over a tiny boat, its surface alive with reflected starlight and lunar rain.', meaning: 'Overwhelming change, emotional upheaval, the unstoppable force of cosmic cycles.', power: 14 },
  { id: 'tarot_the_eclipse', name: 'The Eclipse', description: 'The moon devours the sun in a ring of fire, casting the world into sudden, magical twilight.', meaning: 'Transformation, hidden power revealed, the meeting of opposites in perfect darkness.', power: 25 },
  { id: 'tarot_the_constellation', name: 'The Constellation', description: 'Twelve stars form a perfect zodiac wheel in the night sky, each one connected by threads of silver light.', meaning: 'Destiny, cosmic order, the interconnectedness of all celestial events and mortal fates.', power: 16 },
  { id: 'tarot_the_void', name: 'The Void', description: 'A hole in the fabric of space reveals absolute nothingness, from which new stars are being born.', meaning: 'Potential, the unknown, creation from destruction, the fertile emptiness before the new moon.', power: 22 },
  { id: 'tarot_the_dreamer', name: 'The Dreamer', description: 'A figure sleeps beneath the moon while their dream-self rises into a sky filled with floating islands.', meaning: 'Vision, imagination, the power of dreams to shape reality, prophetic insight.', power: 13 },
  { id: 'tarot_the_celestial', name: 'The Celestial', description: 'A radiant being with skin of starlight and eyes of moonstone extends a hand from the heavens.', meaning: 'Divine intervention, spiritual guidance, the presence of celestial forces in mortal affairs.', power: 30 },
  { id: 'tarot_the_river', name: 'The River of Stars', description: 'A shimmering river of liquid starlight flows through a lunar valley, carrying glowing orbs downstream.', meaning: 'Flow, journey, the passage of time, moving with the current of cosmic events.', power: 10 },
  { id: 'tarot_the_crystal', name: 'The Lunar Crystal', description: 'A massive crystal formation on the moon absorbs all surrounding light, refracting it into rainbow auroras.', meaning: 'Clarity, focus, amplification of power, the concentrated essence of lunar energy.', power: 17 },
  { id: 'tarot_the_harvest', name: 'The Lunar Harvest', description: 'Baskets overflow with glowing moon-fruits and silver grain beneath an amber harvest moon.', meaning: 'Abundance, reward for effort, the fruitful completion of a lunar cycle.', power: 11 },
  { id: 'tarot_the_shadow', name: 'The Shadow Self', description: 'A mirror reflects a figure standing under moonlight, but the reflection moves independently, darkly.', meaning: 'The unconscious mind, hidden fears, aspects of the self that require acknowledgment.', power: 19 },
  { id: 'tarot_the_guardian', name: 'The Lunar Guardian', description: 'A knight in armor of frozen moonlight stands at the gate of a celestial palace, sword drawn.', meaning: 'Protection, vigilance, duty, the strength to stand firm against cosmic threats.', power: 21 },
  { id: 'tarot_the_phantom', name: 'The Phantom Tide', description: 'Ghostly waves pass through solid buildings and mountains, carrying translucent lunar creatures.', meaning: 'The supernatural, things beyond ordinary perception, phenomena that defy physical law.', power: 16 },
  { id: 'tarot_the_nexus', name: 'The Lunar Nexus', description: 'Eight moons orbit a central crystal, their combined light forming a beam that pierces the heavens.', meaning: 'Connection, unity, the convergence of all lunar forces into a single point of power.', power: 28 },
  { id: 'tarot_the_sage', name: 'The Lunar Sage', description: 'An ancient figure with a beard of starlight reads from a book whose pages are made of moonlight.', meaning: 'Wisdom, study, the accumulated knowledge of countless lunar cycles and ages.', power: 23 },
  { id: 'tarot_the_serpent', name: 'The Ouroboros', description: 'A serpent made of moonlight devours its own tail, forming a perfect circle in the star-filled sky.', meaning: 'Cycles, eternity, self-containment, the infinite loop of the lunar phases.', power: 24 },
  { id: 'tarot_the_phoenix', name: 'The Moon Phoenix', description: 'A phoenix made of silver flame rises from a crater on the moon, scattering feathers of frozen light.', meaning: 'Rebirth, transformation, rising from adversity with renewed lunar power.', power: 26 },
  { id: 'tarot_the_cosmos', name: 'The Cosmic Dance', description: 'All celestial bodies orbit in perfect choreography, their movements tracing patterns of divine beauty.', meaning: 'Universal order, the grand design, every event in its proper cosmic place.', power: 35 },
];

// =============================================================================
// Internal Helper Functions
// =============================================================================

const LN_MAX_LEVEL = 50;

function lnXpRequired(level: number): number {
  if (level <= 0) return 0;
  if (level >= LN_MAX_LEVEL) return Infinity;
  return Math.floor(80 * level * (1 + level * 0.15));
}

function lnClampLevel(lvl: number): number {
  return Math.max(1, Math.min(LN_MAX_LEVEL, lvl));
}

function lnGenerateId(): string {
  return `ln-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function lnRarityMultiplier(r: LNRarity): number {
  const map: Record<LNRarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2.5,
    epic: 5,
    legendary: 10,
  };
  return map[r] ?? 1;
}

function lnStructureCost(structDef: StructureDef, currentLevel: number): number {
  return Math.floor(structDef.baseCost * Math.pow(1.5, currentLevel));
}

function lnGetStructureBonus(state: LNState, structDefId: string): number {
  const instance = state.structures.find((s) => s.defId === structDefId);
  if (!instance) return 0;
  return instance.level;
}

// =============================================================================
// Zustand Store Definition
// =============================================================================

interface LNStore extends LNState, LNActions {
  // Extra internal helpers for the store
}

const LN_INITIAL_STATE: LNState = {
  currentPhase: 0,
  dayCounter: 0,
  moonlightEnergy: 50,
  celestialBonds: [],
  collectedItems: [],
  structures: [],
  tarotDeck: [],
  activeReading: null,
  ritualCooldowns: {},
  achievements: [],
  currentTitle: 'title_moon_child',
  totalDivinations: 0,
  totalRituals: 0,
  totalMoonlight: 0,
  tideStrength: 5,
  lunarLevel: 1,
  lunarExp: 0,
};

export const useLNStore = create<LNStore>()(
  persist(
    (set, get) => ({
      ...LN_INITIAL_STATE,

      // =====================================================================
      // Moon Phase & Day Cycle
      // =====================================================================

      lnAdvanceMoon: () => {
        set((s) => {
          const nextPhase = (s.currentPhase + 1) % 8;
          const nextDay = s.dayCounter + 1;
          const phase = LN_MOON_PHASES[nextPhase];
          const moonlightGain = Math.floor(5 * phase.powerMultiplier);
          return {
            currentPhase: nextPhase,
            dayCounter: nextDay,
            moonlightEnergy: s.moonlightEnergy + moonlightGain,
            totalMoonlight: s.totalMoonlight + moonlightGain,
          };
        });
      },

      lnHarvestMoonlight: () => {
        const s = get();
        const phase = LN_MOON_PHASES[s.currentPhase];
        const structureBonus = s.structures.reduce((acc, inst) => {
          if (inst.defId === 'struct_moonlight_well') {
            return acc + inst.level * 10;
          }
          return acc;
        }, 0);
        const tideBonus = s.tideStrength * 2;
        const baseHarvest = Math.floor(10 * phase.powerMultiplier);
        const total = baseHarvest + structureBonus + tideBonus;
        set((prev) => ({
          moonlightEnergy: prev.moonlightEnergy + total,
          totalMoonlight: prev.totalMoonlight + total,
        }));
        return total;
      },

      lnForcePhase: (phase: number) => {
        const clamped = Math.max(0, Math.min(7, phase));
        set({ currentPhase: clamped });
      },

      lnAddMoonlight: (amount: number) => {
        set((s) => ({
          moonlightEnergy: s.moonlightEnergy + amount,
          totalMoonlight: s.totalMoonlight + amount,
        }));
      },

      // =====================================================================
      // Rituals
      // =====================================================================

      lnPerformRitual: (ritualId: string) => {
        const s = get();
        const ritual = LN_RITUALS.find((r) => r.id === ritualId);
        if (!ritual) return false;
        if (ritual.phaseReq !== null && s.currentPhase !== ritual.phaseReq) return false;
        if (s.ritualCooldowns[ritualId] && s.ritualCooldowns[ritualId] > 0) return false;
        if (s.moonlightEnergy < ritual.requirements[0]?.amount) return false;

        const now = Date.now();
        const cooldownMs = 60000;
        set((prev) => {
          const newEnergy = prev.moonlightEnergy - ritual.requirements[0].amount;
          const newExp = prev.lunarExp + ritual.rewards.exp;
          let newLevel = prev.lunarLevel;
          let remainingExp = newExp;
          while (newLevel < LN_MAX_LEVEL && remainingExp >= lnXpRequired(newLevel)) {
            remainingExp -= lnXpRequired(newLevel);
            newLevel += 1;
          }
          if (newLevel >= LN_MAX_LEVEL) remainingExp = 0;
          const newCooldowns = { ...prev.ritualCooldowns, [ritualId]: now + cooldownMs };
          const newItems = [...prev.collectedItems];
          if (ritual.rewards.items) {
            for (const itemId of ritual.rewards.items) {
              if (!newItems.includes(itemId)) {
                newItems.push(itemId);
              }
            }
          }
          const newAchievements = [...prev.achievements];
          const nextRitualCount = prev.totalRituals + 1;
          const achRitualMaster = LN_ACHIEVEMENTS.find((a) => a.id === 'ach_ritual_master');
          if (achRitualMaster && nextRitualCount >= achRitualMaster.targetValue && !newAchievements.includes(achRitualMaster.id)) {
            newAchievements.push(achRitualMaster.id);
          }
          const achRitualNovice = LN_ACHIEVEMENTS.find((a) => a.id === 'ach_ritual_novice');
          if (achRitualNovice && nextRitualCount >= achRitualNovice.targetValue && !newAchievements.includes(achRitualNovice.id)) {
            newAchievements.push(achRitualNovice.id);
          }
          return {
            moonlightEnergy: newEnergy + ritual.rewards.moonlight,
            totalMoonlight: prev.totalMoonlight + ritual.rewards.moonlight,
            lunarLevel: lnClampLevel(newLevel),
            lunarExp: remainingExp,
            ritualCooldowns: newCooldowns,
            totalRituals: nextRitualCount,
            collectedItems: newItems,
            achievements: newAchievements,
          };
        });
        return true;
      },

      // =====================================================================
      // Celestials
      // =====================================================================

      lnSummonCelestial: (celestialId: string) => {
        const s = get();
        const celestial = LN_CELESTIALS.find((c) => c.id === celestialId);
        if (!celestial) return false;
        const cost = Math.floor(20 * lnRarityMultiplier(celestial.rarity));
        if (s.moonlightEnergy < cost) return false;
        set((prev) => ({
          moonlightEnergy: prev.moonlightEnergy - cost,
        }));
        return true;
      },

      lnBondCelestial: (celestialId: string) => {
        const s = get();
        const celestial = LN_CELESTIALS.find((c) => c.id === celestialId);
        if (!celestial) return false;
        const existingBond = s.celestialBonds.find((b) => b.celestialId === celestialId);
        if (existingBond) {
          set((prev) => ({
            celestialBonds: prev.celestialBonds.map((b) =>
              b.celestialId === celestialId
                ? { ...b, bondLevel: Math.min(b.bondLevel + 1, 10), lastInteraction: Date.now() }
                : b
            ),
            lunarExp: prev.lunarExp + 10,
          }));
          return true;
        }
        const cost = Math.floor(30 * lnRarityMultiplier(celestial.rarity));
        if (s.moonlightEnergy < cost) return false;
        set((prev) => ({
          moonlightEnergy: prev.moonlightEnergy - cost,
          celestialBonds: [
            ...prev.celestialBonds,
            { celestialId, bondLevel: 1, bondedAt: Date.now(), lastInteraction: Date.now() },
          ],
          lunarExp: prev.lunarExp + 25,
        }));
        return true;
      },

      // =====================================================================
      // Tarot
      // =====================================================================

      lnDrawTarot: () => {
        const s = get();
        const available = LN_TAROT_CARDS.filter((c) => !s.tarotDeck.includes(c.id));
        if (available.length === 0) return null;
        const idx = Math.floor(Math.random() * available.length);
        const card = available[idx];
        const drawnCards = [card.id];
        set((prev) => ({
          tarotDeck: [...prev.tarotDeck, card.id],
          totalDivinations: prev.totalDivinations + 1,
          activeReading: {
            cards: drawnCards,
            drawnAt: Date.now(),
            interpretation: card.meaning,
          },
        }));
        return { cards: drawnCards, drawnAt: Date.now(), interpretation: card.meaning };
      },

      lnDivinate: () => {
        const s = get();
        const available = LN_TAROT_CARDS.filter((c) => !s.tarotDeck.includes(c.id));
        if (available.length === 0) return null;
        const drawn: string[] = [];
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        const count = Math.min(3, shuffled.length);
        for (let i = 0; i < count; i++) {
          drawn.push(shuffled[i].id);
        }
        const interpretation = drawn
          .map((id) => LN_TAROT_CARDS.find((c) => c.id === id))
          .filter(Boolean)
          .map((c) => c!.meaning)
          .join(' | ');
        set((prev) => ({
          tarotDeck: [...prev.tarotDeck, ...drawn],
          totalDivinations: prev.totalDivinations + 1,
          activeReading: { cards: drawn, drawnAt: Date.now(), interpretation },
        }));
        return { cards: drawn, drawnAt: Date.now(), interpretation };
      },

      lnInterpretReading: () => {
        const s = get();
        if (!s.activeReading) return 'No active reading to interpret.';
        const cards = s.activeReading.cards
          .map((id) => LN_TAROT_CARDS.find((c) => c.id === id))
          .filter(Boolean);
        if (cards.length === 0) return 'The cards are blank and offer no guidance.';
        if (cards.length === 1) return `The ${cards[0]!.name} reveals: ${cards[0]!.meaning}`;
        const combined = cards.map((c) => c!.name).join(', ');
        const totalPower = cards.reduce((sum, c) => sum + c!.power, 0);
        const intensity = totalPower > 50 ? 'overwhelmingly powerful' : totalPower > 30 ? 'strong and clear' : 'gentle and subtle';
        return `The ${combined} speak with ${intensity} voices. Their combined message: ${cards.map((c) => c!.meaning).join(' ')}`;
      },

      lnShuffleDeck: () => {
        set({ tarotDeck: [], activeReading: null });
      },

      // =====================================================================
      // Structures
      // =====================================================================

      lnBuildStructure: (structDefId: string) => {
        const s = get();
        const structDef = LN_STRUCTURES.find((d) => d.id === structDefId);
        if (!structDef) return false;
        const alreadyBuilt = s.structures.find((inst) => inst.defId === structDefId);
        if (alreadyBuilt) return false;
        const cost = structDef.baseCost;
        if (s.moonlightEnergy < cost) return false;
        set((prev) => ({
          moonlightEnergy: prev.moonlightEnergy - cost,
          structures: [...prev.structures, { defId: structDefId, level: 1, builtAt: Date.now() }],
          lunarExp: prev.lunarExp + 20,
        }));
        return true;
      },

      lnUpgradeStructure: (structId: string) => {
        const s = get();
        const structDef = LN_STRUCTURES.find((d) => d.id === structId);
        if (!structDef) return false;
        const instance = s.structures.find((inst) => inst.defId === structId);
        if (!instance) return false;
        if (instance.level >= structDef.maxLevel) return false;
        const cost = lnStructureCost(structDef, instance.level);
        if (s.moonlightEnergy < cost) return false;
        set((prev) => ({
          moonlightEnergy: prev.moonlightEnergy - cost,
          structures: prev.structures.map((inst) =>
            inst.defId === structId ? { ...inst, level: inst.level + 1 } : inst
          ),
          lunarExp: prev.lunarExp + 15 * instance.level,
        }));
        return true;
      },

      // =====================================================================
      // Tides
      // =====================================================================

      lnCastTide: (tideId: string) => {
        const s = get();
        const tide = LN_TIDES.find((t) => t.id === tideId);
        if (!tide) return false;
        const cost = Math.floor(tide.strength * 3);
        if (s.moonlightEnergy < cost) return false;
        set((prev) => ({
          moonlightEnergy: prev.moonlightEnergy - cost,
          tideStrength: tide.strength,
        }));
        return true;
      },

      // =====================================================================
      // Constellations
      // =====================================================================

      lnObserveConstellation: (constellationId: string) => {
        const s = get();
        const constellation = LN_CONSTELLATIONS.find((c) => c.id === constellationId);
        if (!constellation) return false;
        const cost = 15;
        if (s.moonlightEnergy < cost) return false;
        set((prev) => ({
          moonlightEnergy: prev.moonlightEnergy - cost,
          lunarExp: prev.lunarExp + 30,
        }));
        return true;
      },

      // =====================================================================
      // Titles
      // =====================================================================

      lnUnlockTitle: (titleId: string) => {
        const s = get();
        const title = LN_TITLES.find((t) => t.id === titleId);
        if (!title) return false;
        if (s.lunarLevel < title.levelRequired) return false;
        set({ currentTitle: titleId });
        return true;
      },

      // =====================================================================
      // Achievements
      // =====================================================================

      lnClaimAchievement: (achievementId: string) => {
        const s = get();
        const ach = LN_ACHIEVEMENTS.find((a) => a.id === achievementId);
        if (!ach) return false;
        let met = false;
        switch (ach.conditionKey) {
          case 'totalMoonlight': met = s.totalMoonlight >= ach.targetValue; break;
          case 'totalRituals': met = s.totalRituals >= ach.targetValue; break;
          case 'totalDivinations': met = s.totalDivinations >= ach.targetValue; break;
          case 'celestialBonds': met = s.celestialBonds.length >= ach.targetValue; break;
          case 'structures': met = s.structures.length >= ach.targetValue; break;
          case 'dayCounter': met = s.dayCounter >= ach.targetValue; break;
          case 'tarotDeck': met = s.tarotDeck.length >= ach.targetValue; break;
          case 'collectedItems': met = s.collectedItems.length >= ach.targetValue; break;
          case 'lunarLevel': met = s.lunarLevel >= ach.targetValue; break;
          default: met = false;
        }
        if (!met) return false;
        if (s.achievements.includes(achievementId)) return false;
        set((prev) => ({
          achievements: [...prev.achievements, achievementId],
          moonlightEnergy: prev.moonlightEnergy + ach.rewardMoonlight,
          totalMoonlight: prev.totalMoonlight + ach.rewardMoonlight,
          lunarExp: prev.lunarExp + ach.rewardExp,
        }));
        return true;
      },

      // =====================================================================
      // Items
      // =====================================================================

      lnSacrificeMoonstone: (itemId: string) => {
        const s = get();
        const item = LN_MOONLIGHT_ITEMS.find((i) => i.id === itemId);
        if (!item) return 0;
        const idx = s.collectedItems.indexOf(itemId);
        if (idx === -1) return 0;
        const value = Math.floor(item.value * lnRarityMultiplier(item.rarity));
        set((prev) => ({
          collectedItems: prev.collectedItems.filter((_, i) => i !== idx),
          moonlightEnergy: prev.moonlightEnergy + value,
          totalMoonlight: prev.totalMoonlight + value,
        }));
        return value;
      },

      lnBuyMoonstone: (type: string) => {
        const s = get();
        const costMap: Record<string, number> = {
          common: 10, uncommon: 30, rare: 80, epic: 200, legendary: 500,
        };
        const cost = costMap[type] ?? 50;
        if (s.moonlightEnergy < cost) return false;
        const rarityItems = LN_MOONLIGHT_ITEMS.filter((i) => i.rarity === type);
        if (rarityItems.length === 0) return false;
        const randomItem = rarityItems[Math.floor(Math.random() * rarityItems.length)];
        set((prev) => ({
          moonlightEnergy: prev.moonlightEnergy - cost,
          collectedItems: prev.collectedItems.includes(randomItem.id)
            ? prev.collectedItems
            : [...prev.collectedItems, randomItem.id],
        }));
        return true;
      },

      lnCollectItem: (itemId: string) => {
        set((prev) => ({
          collectedItems: prev.collectedItems.includes(itemId)
            ? prev.collectedItems
            : [...prev.collectedItems, itemId],
        }));
      },

      lnChannelMoonlight: (targetId: string) => {
        const s = get();
        const channelAmount = Math.floor(s.moonlightEnergy * 0.1);
        if (channelAmount <= 0) return 0;
        let bonus = channelAmount;
        const celestial = LN_CELESTIALS.find((c) => c.id === targetId);
        if (celestial) {
          bonus = Math.floor(channelAmount * lnRarityMultiplier(celestial.rarity));
        }
        const structDef = LN_STRUCTURES.find((d) => d.id === targetId);
        if (structDef) {
          const inst = s.structures.find((i) => i.defId === targetId);
          if (inst) {
            bonus = Math.floor(channelAmount * (1 + inst.level * 0.2));
          }
        }
        set((prev) => ({
          moonlightEnergy: Math.max(0, prev.moonlightEnergy - channelAmount),
          lunarExp: prev.lunarExp + Math.floor(bonus * 0.5),
        }));
        return bonus;
      },

      // =====================================================================
      // Reset
      // =====================================================================

      lnResetProgress: () => {
        set({ ...LN_INITIAL_STATE, tarotDeck: [], structures: [], celestialBonds: [], collectedItems: [], achievements: [] });
      },
    }),
    {
      name: 'lunar-nexus-storage',
      partialize: (state) => ({
        currentPhase: state.currentPhase,
        dayCounter: state.dayCounter,
        moonlightEnergy: state.moonlightEnergy,
        celestialBonds: state.celestialBonds,
        collectedItems: state.collectedItems,
        structures: state.structures,
        tarotDeck: state.tarotDeck,
        activeReading: state.activeReading,
        ritualCooldowns: state.ritualCooldowns,
        achievements: state.achievements,
        currentTitle: state.currentTitle,
        totalDivinations: state.totalDivinations,
        totalRituals: state.totalRituals,
        totalMoonlight: state.totalMoonlight,
        tideStrength: state.tideStrength,
        lunarLevel: state.lunarLevel,
        lunarExp: state.lunarExp,
      }),
    }
  )
);

// =============================================================================
// Hook: useLunarNexus
// =============================================================================

export default function useLunarNexus() {
  const state = useLNStore();

  // ---- Getter: Current Phase ----

  const lnGetCurrentPhase = useMemo(() => {
    return LN_MOON_PHASES[state.currentPhase];
  }, [state.currentPhase]);

  // ---- Getter: Tide Effect ----

  const lnGetTideEffect = useMemo(() => {
    return LN_TIDES.find((t) => t.strength === state.tideStrength) ?? LN_TIDES[0];
  }, [state.tideStrength]);

  // ---- Getter: Active Constellations (by current season) ----

  const lnGetActiveConstellations = useMemo(() => {
    const seasonIndex = Math.floor(state.dayCounter / 16) % 4;
    const seasons: LNSeason[] = ['spring', 'summer', 'autumn', 'winter'];
    const currentSeason = seasons[seasonIndex];
    return LN_CONSTELLATIONS.filter((c) => c.season === currentSeason);
  }, [state.dayCounter]);

  // ---- Getter: Bonded Celestials ----

  const lnGetBondedCelestials = useMemo(() => {
    return state.celestialBonds.map((bond) => {
      const def = LN_CELESTIALS.find((c) => c.id === bond.celestialId);
      return { bond, def: def ?? null };
    }).filter((entry) => entry.def !== null);
  }, [state.celestialBonds]);

  // ---- Getter: Tarot Meanings ----

  const lnGetTarotMeanings = useMemo(() => {
    return state.tarotDeck.map((id) => LN_TAROT_CARDS.find((c) => c.id === id)).filter(Boolean);
  }, [state.tarotDeck]);

  // ---- Getter: Ritual Availability ----

  const lnGetRitualAvailability = useMemo(() => {
    return LN_RITUALS.map((ritual) => {
      const phaseOk = ritual.phaseReq === null || ritual.phaseReq === state.currentPhase;
      const moonlightOk = state.moonlightEnergy >= ritual.requirements[0]?.amount;
      const cooldown = state.ritualCooldowns[ritual.id];
      const cooldownOk = !cooldown || cooldown <= Date.now();
      return { ritual, available: phaseOk && moonlightOk && cooldownOk, phaseOk, moonlightOk, cooldownOk };
    });
  }, [state.currentPhase, state.moonlightEnergy, state.ritualCooldowns]);

  // ---- Getter: Total Power ----

  const lnGetTotalPower = useMemo(() => {
    const celestialPower = state.celestialBonds.reduce((sum, bond) => {
      const def = LN_CELESTIALS.find((c) => c.id === bond.celestialId);
      if (!def) return sum;
      return sum + Math.floor(def.power * bond.bondLevel * 0.5);
    }, 0);
    const structurePower = state.structures.reduce((sum, inst) => {
      const def = LN_STRUCTURES.find((d) => d.id === inst.defId);
      if (!def) return sum;
      return sum + inst.level * 5;
    }, 0);
    const phaseMultiplier = LN_MOON_PHASES[state.currentPhase].powerMultiplier;
    const tideBonus = state.tideStrength * 3;
    return Math.floor((celestialPower + structurePower + tideBonus) * phaseMultiplier);
  }, [state.celestialBonds, state.structures, state.currentPhase, state.tideStrength]);

  // ---- Getter: Next Title ----

  const lnGetNextTitle = useMemo(() => {
    const currentIdx = LN_TITLES.findIndex((t) => t.id === state.currentTitle);
    if (currentIdx >= LN_TITLES.length - 1) return null;
    return LN_TITLES[currentIdx + 1] ?? null;
  }, [state.currentTitle]);

  // ---- Getter: Moonlight Rate ----

  const lnGetMoonlightRate = useMemo(() => {
    const phase = LN_MOON_PHASES[state.currentPhase];
    const baseRate = 10 * phase.powerMultiplier;
    const wellBonus = state.structures
      .filter((inst) => inst.defId === 'struct_moonlight_well')
      .reduce((sum, inst) => sum + inst.level * 10, 0);
    const flameBonus = state.structures
      .filter((inst) => inst.defId === 'struct_eternal_flame')
      .reduce((sum, inst) => sum + inst.level * 2, 0);
    const harmonyBonus = state.structures
      .filter((inst) => inst.defId === 'struct_harmony_bell')
      .reduce((sum, inst) => sum + inst.level * 0.05, 0);
    const tideMultiplier = 1 + state.tideStrength * 0.1;
    const libraryBonus = state.structures
      .filter((inst) => inst.defId === 'struct_lunar_library')
      .reduce((sum, inst) => sum + inst.level * 0.1, 0);
    return Math.floor((baseRate + wellBonus + flameBonus) * tideMultiplier * (1 + harmonyBonus) * (1 + libraryBonus));
  }, [state.currentPhase, state.structures, state.tideStrength]);

  // ---- Getter: Constellation Bonus ----

  const lnGetConstellationBonus = useMemo(() => {
    const seasonIndex = Math.floor(state.dayCounter / 16) % 4;
    const seasons: LNSeason[] = ['spring', 'summer', 'autumn', 'winter'];
    const currentSeason = seasons[seasonIndex];
    const matching = LN_CONSTELLATIONS.filter((c) => c.season === currentSeason);
    return matching.length * 5;
  }, [state.dayCounter]);

  // ---- Getter: Phase Multiplier ----

  const lnGetPhaseMultiplier = useMemo(() => {
    return LN_MOON_PHASES[state.currentPhase].powerMultiplier;
  }, [state.currentPhase]);

  // ---- Getter: Unlocked Achievements ----

  const lnGetUnlockedAchievements = useMemo(() => {
    return LN_ACHIEVEMENTS.filter((a) => state.achievements.includes(a.id)).map((a) => {
      let met = false;
      switch (a.conditionKey) {
        case 'totalMoonlight': met = state.totalMoonlight >= a.targetValue; break;
        case 'totalRituals': met = state.totalRituals >= a.targetValue; break;
        case 'totalDivinations': met = state.totalDivinations >= a.targetValue; break;
        case 'celestialBonds': met = state.celestialBonds.length >= a.targetValue; break;
        case 'structures': met = state.structures.length >= a.targetValue; break;
        case 'dayCounter': met = state.dayCounter >= a.targetValue; break;
        case 'tarotDeck': met = state.tarotDeck.length >= a.targetValue; break;
        case 'collectedItems': met = state.collectedItems.length >= a.targetValue; break;
        case 'lunarLevel': met = state.lunarLevel >= a.targetValue; break;
        default: met = false;
      }
      return { def: a, met, unlocked: true };
    });
  }, [state.achievements, state.totalMoonlight, state.totalRituals, state.totalDivinations, state.celestialBonds, state.structures, state.dayCounter, state.tarotDeck, state.collectedItems, state.lunarLevel]);

  // ---- Getter: Title Progress ----

  const lnGetTitleProgress = useMemo(() => {
    const currentIdx = LN_TITLES.findIndex((t) => t.id === state.currentTitle);
    const current = LN_TITLES[currentIdx] ?? LN_TITLES[0];
    const next = currentIdx < LN_TITLES.length - 1 ? LN_TITLES[currentIdx + 1] : null;
    if (!next) return { current, next: null, progress: 1, levelForNext: LN_MAX_LEVEL };
    const progress = Math.min(1, state.lunarLevel / next.levelRequired);
    return { current, next, progress, levelForNext: next.levelRequired };
  }, [state.currentTitle, state.lunarLevel]);

  // ---- Getter: Tarot Deck Size ----

  const lnGetTarotDeckSize = useMemo(() => {
    return { collected: state.tarotDeck.length, total: LN_TAROT_CARDS.length, percent: Math.round((state.tarotDeck.length / LN_TAROT_CARDS.length) * 100) };
  }, [state.tarotDeck]);

  // ---- Getter: Reading Interpretation ----

  const lnGetReadingInterpretation = useMemo(() => {
    if (!state.activeReading) return null;
    const cards = state.activeReading.cards
      .map((id) => LN_TAROT_CARDS.find((c) => c.id === id))
      .filter(Boolean);
    return {
      cards,
      interpretation: state.activeReading.interpretation,
      drawnAt: state.activeReading.drawnAt,
      totalPower: cards.reduce((sum, c) => sum + c!.power, 0),
    };
  }, [state.activeReading]);

  // ---- Return the lnAPI ----

  return {
    // --- Constants ---
    LN_MOON_PHASES,
    LN_TIDES,
    LN_CONSTELLATIONS,
    LN_CELESTIALS,
    LN_MOONLIGHT_ITEMS,
    LN_STRUCTURES,
    LN_ABILITIES,
    LN_ACHIEVEMENTS,
    LN_TITLES,
    LN_RITUALS,
    LN_TAROT_CARDS,
    LN_COLOR_NEW_MOON,
    LN_COLOR_WAXING,
    LN_COLOR_FULL_MOON,
    LN_COLOR_WANING,
    LN_COLOR_MOONLIGHT,
    LN_COLOR_STARLIGHT,
    LN_COLOR_TAROT,
    LN_COLOR_CELESTIAL,

    // --- State ---
    currentPhase: state.currentPhase,
    dayCounter: state.dayCounter,
    moonlightEnergy: state.moonlightEnergy,
    celestialBonds: state.celestialBonds,
    collectedItems: state.collectedItems,
    structures: state.structures,
    tarotDeck: state.tarotDeck,
    activeReading: state.activeReading,
    ritualCooldowns: state.ritualCooldowns,
    achievements: state.achievements,
    currentTitle: state.currentTitle,
    totalDivinations: state.totalDivinations,
    totalRituals: state.totalRituals,
    totalMoonlight: state.totalMoonlight,
    tideStrength: state.tideStrength,
    lunarLevel: state.lunarLevel,
    lunarExp: state.lunarExp,

    // --- Actions ---
    lnAdvanceMoon: state.lnAdvanceMoon,
    lnHarvestMoonlight: state.lnHarvestMoonlight,
    lnPerformRitual: state.lnPerformRitual,
    lnSummonCelestial: state.lnSummonCelestial,
    lnBondCelestial: state.lnBondCelestial,
    lnDrawTarot: state.lnDrawTarot,
    lnInterpretReading: state.lnInterpretReading,
    lnShuffleDeck: state.lnShuffleDeck,
    lnBuildStructure: state.lnBuildStructure,
    lnUpgradeStructure: state.lnUpgradeStructure,
    lnCastTide: state.lnCastTide,
    lnChannelMoonlight: state.lnChannelMoonlight,
    lnDivinate: state.lnDivinate,
    lnObserveConstellation: state.lnObserveConstellation,
    lnUnlockTitle: state.lnUnlockTitle,
    lnClaimAchievement: state.lnClaimAchievement,
    lnSacrificeMoonstone: state.lnSacrificeMoonstone,
    lnBuyMoonstone: state.lnBuyMoonstone,
    lnResetProgress: state.lnResetProgress,
    lnForcePhase: state.lnForcePhase,
    lnCollectItem: state.lnCollectItem,
    lnAddMoonlight: state.lnAddMoonlight,

    // --- Getters ---
    lnGetCurrentPhase,
    lnGetTideEffect,
    lnGetActiveConstellations,
    lnGetBondedCelestials,
    lnGetTarotMeanings,
    lnGetRitualAvailability,
    lnGetTotalPower,
    lnGetNextTitle,
    lnGetMoonlightRate,
    lnGetConstellationBonus,
    lnGetPhaseMultiplier,
    lnGetUnlockedAchievements,
    lnGetTitleProgress,
    lnGetTarotDeckSize,
    lnGetReadingInterpretation,
  };
}

// =============================================================================
// Utility Export Functions — callable outside React
// =============================================================================

/** Returns the current lunar overview stats for dashboard display. */
export function lnGetOverview(): {
  lunarLevel: number;
  lunarExp: number;
  xpTillNext: number;
  moonlightEnergy: number;
  totalMoonlight: number;
  currentPhase: MoonPhaseDef;
  celestialBondCount: number;
  structureCount: number;
  tarotDeckSize: number;
  achievementCount: number;
  totalDivinations: number;
  totalRituals: number;
  dayCounter: number;
} {
  const s = useLNStore.getState();
  return {
    lunarLevel: s.lunarLevel,
    lunarExp: s.lunarExp,
    xpTillNext: lnXpRequired(s.lunarLevel),
    moonlightEnergy: s.moonlightEnergy,
    totalMoonlight: s.totalMoonlight,
    currentPhase: LN_MOON_PHASES[s.currentPhase],
    celestialBondCount: s.celestialBonds.length,
    structureCount: s.structures.length,
    tarotDeckSize: s.tarotDeck.length,
    achievementCount: s.achievements.length,
    totalDivinations: s.totalDivinations,
    totalRituals: s.totalRituals,
    dayCounter: s.dayCounter,
  };
}

/** Returns all bonded celestials with their full definitions and stats. */
export function lnGetFullCelestialBonds(): Array<{
  bond: CelestialBond;
  def: CelestialDef;
  powerContribution: number;
  nextLevelCost: number;
}> {
  const s = useLNStore.getState();
  return s.celestialBonds
    .map((bond) => {
      const def = LN_CELESTIALS.find((c) => c.id === bond.celestialId);
      if (!def) return null;
      return {
        bond,
        def,
        powerContribution: Math.floor(def.power * bond.bondLevel * 0.5),
        nextLevelCost: Math.floor(30 * lnRarityMultiplier(def.rarity) * (bond.bondLevel + 1)),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
}

/** Returns all structures with their definitions, current level, and upgrade cost. */
export function lnGetFullStructures(): Array<{
  def: StructureDef;
  instance: StructureInstance;
  upgradeCost: number;
  canUpgrade: boolean;
  maxed: boolean;
}> {
  const s = useLNStore.getState();
  return s.structures.map((inst) => {
    const def = LN_STRUCTURES.find((d) => d.id === inst.defId);
    if (!def) return null;
    const cost = lnStructureCost(def, inst.level);
    const maxed = inst.level >= def.maxLevel;
    return { def, instance: inst, upgradeCost: cost, canUpgrade: !maxed && s.moonlightEnergy >= cost, maxed };
  }).filter((entry): entry is NonNullable<typeof entry> => entry !== null);
}

/** Returns un-built structures that can be constructed. */
export function lnGetAvailableStructures(): Array<{
  def: StructureDef;
  canAfford: boolean;
}> {
  const s = useLNStore.getState();
  const builtIds = new Set(s.structures.map((inst) => inst.defId));
  return LN_STRUCTURES
    .filter((def) => !builtIds.has(def.id))
    .map((def) => ({
      def,
      canAfford: s.moonlightEnergy >= def.baseCost,
    }));
}

/** Returns un-collected tarot cards with their full definitions. */
export function lnGetMissingTarotCards(): Array<{
  def: TarotCardDef;
  rarity: string;
}> {
  const s = useLNStore.getState();
  const collected = new Set(s.tarotDeck);
  return LN_TAROT_CARDS
    .filter((card) => !collected.has(card.id))
    .map((def) => {
      let rarity = 'Common';
      if (def.power >= 30) rarity = 'Rare';
      else if (def.power >= 20) rarity = 'Uncommon';
      else if (def.power >= 10) rarity = 'Common';
      if (def.power >= 25) rarity = 'Epic';
      if (def.power >= 35) rarity = 'Legendary';
      return { def, rarity };
    });
}

/** Returns the full tarot deck with completion metadata. */
export function lnGetFullTarotDeck(): Array<{
  def: TarotCardDef;
  collected: boolean;
}> {
  const s = useLNStore.getState();
  const collected = new Set(s.tarotDeck);
  return LN_TAROT_CARDS.map((def) => ({
    def,
    collected: collected.has(def.id),
  }));
}

/** Returns all celestials with bond status and summon costs. */
export function lnGetAllCelestials(): Array<{
  def: CelestialDef;
  bonded: boolean;
  bondLevel: number;
  summonCost: number;
  bondCost: number;
}> {
  const s = useLNStore.getState();
  return LN_CELESTIALS.map((def) => {
    const bond = s.celestialBonds.find((b) => b.celestialId === def.id);
    const rarity = lnRarityMultiplier(def.rarity);
    return {
      def,
      bonded: !!bond,
      bondLevel: bond?.bondLevel ?? 0,
      summonCost: Math.floor(20 * rarity),
      bondCost: Math.floor(30 * rarity * ((bond?.bondLevel ?? 0) + 1)),
    };
  });
}

/** Returns celestials filtered by rarity tier. */
export function lnGetCelestialsByRarity(rarity: LNRarity): CelestialDef[] {
  return LN_CELESTIALS.filter((c) => c.rarity === rarity);
}

/** Returns celestials filtered by type. */
export function lnGetCelestialsByType(type: LNCelestialType): CelestialDef[] {
  return LN_CELESTIALS.filter((c) => c.type === type);
}

/** Returns all items with their full definitions and ownership status. */
export function lnGetFullItems(): Array<{
  def: MoonlightItemDef;
  owned: boolean;
  sacrificeValue: number;
}> {
  const s = useLNStore.getState();
  const owned = new Set(s.collectedItems);
  return LN_MOONLIGHT_ITEMS.map((def) => ({
    def,
    owned: owned.has(def.id),
    sacrificeValue: Math.floor(def.value * lnRarityMultiplier(def.rarity)),
  }));
}

/** Returns items filtered by rarity. */
export function lnGetItemsByRarity(rarity: LNRarity): MoonlightItemDef[] {
  return LN_MOONLIGHT_ITEMS.filter((i) => i.rarity === rarity);
}

/** Returns total value of all collected items. */
export function lnGetTotalItemValue(): number {
  const s = useLNStore.getState();
  return s.collectedItems.reduce((sum, id) => {
    const item = LN_MOONLIGHT_ITEMS.find((i) => i.id === id);
    if (!item) return sum;
    return sum + Math.floor(item.value * lnRarityMultiplier(item.rarity));
  }, 0);
}

/** Returns the 8-stat grid for dashboard layout. */
export function lnGetStatsGrid(): Array<{ label: string; value: number | string; sublabel: string }> {
  const s = useLNStore.getState();
  const phase = LN_MOON_PHASES[s.currentPhase];
  const moonlightRate = Math.floor(10 * phase.powerMultiplier);
  return [
    { label: 'Lunar Level', value: s.lunarLevel, sublabel: `XP: ${s.lunarExp}/${lnXpRequired(s.lunarLevel)}` },
    { label: 'Moonlight Energy', value: s.moonlightEnergy, sublabel: `Total: ${s.totalMoonlight}` },
    { label: 'Current Phase', value: phase.name, sublabel: phase.nameZh },
    { label: 'Phase Power', value: `${phase.powerMultiplier}x`, sublabel: 'Harvest multiplier' },
    { label: 'Day Counter', value: s.dayCounter, sublabel: `${Math.floor(s.dayCounter / 8)} cycles` },
    { label: 'Celestial Bonds', value: s.celestialBonds.length, sublabel: `of ${LN_CELESTIALS.length} known` },
    { label: 'Structures', value: s.structures.length, sublabel: `of ${LN_STRUCTURES.length} available` },
    { label: 'Tarot Cards', value: s.tarotDeck.length, sublabel: `of ${LN_TAROT_CARDS.length} total` },
    { label: 'Total Divinations', value: s.totalDivinations, sublabel: 'lifetime' },
    { label: 'Total Rituals', value: s.totalRituals, sublabel: 'completed' },
    { label: 'Achievements', value: s.achievements.length, sublabel: `of ${LN_ACHIEVEMENTS.length}` },
    { label: 'Moonlight Rate', value: `${moonlightRate}/harvest`, sublabel: 'base rate' },
  ];
}

/** Returns all rituals with availability status and detailed requirements. */
export function lnGetFullRituals(): Array<{
  def: RitualDef;
  available: boolean;
  phaseOk: boolean;
  moonlightOk: boolean;
  cooldownOk: boolean;
  currentPhase: MoonPhaseDef;
  requiredPhase: MoonPhaseDef | null;
}> {
  const s = useLNStore.getState();
  return LN_RITUALS.map((ritual) => {
    const phaseOk = ritual.phaseReq === null || ritual.phaseReq === s.currentPhase;
    const moonlightOk = s.moonlightEnergy >= (ritual.requirements[0]?.amount ?? 0);
    const cooldown = s.ritualCooldowns[ritual.id];
    const cooldownOk = !cooldown || cooldown <= Date.now();
    const requiredPhase = ritual.phaseReq !== null ? LN_MOON_PHASES[ritual.phaseReq] : null;
    return {
      def: ritual,
      available: phaseOk && moonlightOk && cooldownOk,
      phaseOk,
      moonlightOk,
      cooldownOk,
      currentPhase: LN_MOON_PHASES[s.currentPhase],
      requiredPhase,
    };
  });
}

/** Returns all achievements with progress tracking toward each target. */
export function lnGetFullAchievements(): Array<{
  def: AchievementDef;
  unlocked: boolean;
  progress: number;
  targetValue: number;
  percent: number;
}> {
  const s = useLNStore.getState();
  return LN_ACHIEVEMENTS.map((ach) => {
    const unlocked = s.achievements.includes(ach.id);
    let progress = 0;
    switch (ach.conditionKey) {
      case 'totalMoonlight': progress = s.totalMoonlight; break;
      case 'totalRituals': progress = s.totalRituals; break;
      case 'totalDivinations': progress = s.totalDivinations; break;
      case 'celestialBonds': progress = s.celestialBonds.length; break;
      case 'structures': progress = s.structures.length; break;
      case 'dayCounter': progress = s.dayCounter; break;
      case 'tarotDeck': progress = s.tarotDeck.length; break;
      case 'collectedItems': progress = s.collectedItems.length; break;
      case 'lunarLevel': progress = s.lunarLevel; break;
      case 'maxStructures': {
        progress = s.structures.filter((inst) => {
          const def = LN_STRUCTURES.find((d) => d.id === inst.defId);
          return def ? inst.level >= def.maxLevel : false;
        }).length;
        break;
      }
      case 'constellations': progress = 0; break;
      case 'totalTides': progress = 0; break;
      default: progress = 0;
    }
    const capped = Math.min(progress, ach.targetValue);
    return {
      def: ach,
      unlocked,
      progress: capped,
      targetValue: ach.targetValue,
      percent: Math.round((capped / ach.targetValue) * 100),
    };
  });
}

/** Returns all titles with unlock status and level requirements. */
export function lnGetFullTitles(): Array<{
  def: TitleDef;
  unlocked: boolean;
  active: boolean;
  levelMet: boolean;
}> {
  const s = useLNStore.getState();
  return LN_TITLES.map((title) => ({
    def: title,
    unlocked: s.lunarLevel >= title.levelRequired,
    active: s.currentTitle === title.id,
    levelMet: s.lunarLevel >= title.levelRequired,
  }));
}

/** Returns all abilities filtered by current moon phase availability. */
export function lnGetAbilitiesByPhase(phaseIndex: number | null): AbilityDef[] {
  return LN_ABILITIES.filter((a) => a.moonPhaseReq === null || a.moonPhaseReq === phaseIndex);
}

/** Returns all abilities sorted by power. */
export function lnGetAbilitiesByPower(): AbilityDef[] {
  return [...LN_ABILITIES].sort((a, b) => b.power - a.power);
}

/** Returns constellations grouped by element. */
export function lnGetConstellationsByElement(): Record<LNElement, ConstellationDef[]> {
  const result: Partial<Record<LNElement, ConstellationDef[]>> = {};
  for (const c of LN_CONSTELLATIONS) {
    if (!result[c.element]) result[c.element] = [];
    result[c.element]!.push(c);
  }
  return result as Record<LNElement, ConstellationDef[]>;
}

/** Returns constellations grouped by season. */
export function lnGetConstellationsBySeason(): Record<LNSeason, ConstellationDef[]> {
  const result: Partial<Record<LNSeason, ConstellationDef[]>> = {};
  for (const c of LN_CONSTELLATIONS) {
    if (!result[c.season]) result[c.season] = [];
    result[c.season]!.push(c);
  }
  return result as Record<LNSeason, ConstellationDef[]>;
}

/** Returns all tides sorted by strength. */
export function lnGetTidesByStrength(): TideDef[] {
  return [...LN_TIDES].sort((a, b) => b.strength - a.strength);
}

/** Returns the current moon phase with cycle progress info. */
export function lnGetPhaseProgress(): {
  phase: MoonPhaseDef;
  phaseIndex: number;
  dayInPhase: number;
  daysPerPhase: number;
  progressPercent: number;
  cycleCount: number;
} {
  const s = useLNStore.getState();
  const daysPerPhase = 8;
  const dayInPhase = s.dayCounter % daysPerPhase;
  const cycleCount = Math.floor(s.dayCounter / (daysPerPhase * 8));
  return {
    phase: LN_MOON_PHASES[s.currentPhase],
    phaseIndex: s.currentPhase,
    dayInPhase,
    daysPerPhase,
    progressPercent: Math.round((dayInPhase / daysPerPhase) * 100),
    cycleCount,
  };
}

/** Returns items grouped by rarity tier. */
export function lnGetItemsGroupedByRarity(): Record<LNRarity, MoonlightItemDef[]> {
  const result: Partial<Record<LNRarity, MoonlightItemDef[]>> = {
    common: [], uncommon: [], rare: [], epic: [], legendary: [],
  };
  for (const item of LN_MOONLIGHT_ITEMS) {
    if (!result[item.rarity]) result[item.rarity] = [];
    result[item.rarity]!.push(item);
  }
  return result as Record<LNRarity, MoonlightItemDef[]>;
}

/** Returns celestials grouped by rarity tier with counts. */
export function lnGetCelestialsGroupedByRarity(): Record<LNRarity, { celestials: CelestialDef[]; count: number; totalPower: number }> {
  const result: Partial<Record<LNRarity, { celestials: CelestialDef[]; count: number; totalPower: number }>> = {
    common: { celestials: [], count: 0, totalPower: 0 },
    uncommon: { celestials: [], count: 0, totalPower: 0 },
    rare: { celestials: [], count: 0, totalPower: 0 },
    epic: { celestials: [], count: 0, totalPower: 0 },
    legendary: { celestials: [], count: 0, totalPower: 0 },
  };
  for (const c of LN_CELESTIALS) {
    if (!result[c.rarity]) result[c.rarity] = { celestials: [], count: 0, totalPower: 0 };
    result[c.rarity]!.celestials.push(c);
    result[c.rarity]!.count += 1;
    result[c.rarity]!.totalPower += c.power;
  }
  return result as Record<LNRarity, { celestials: CelestialDef[]; count: number; totalPower: number }>;
}

/** Returns all rituals with phaseReq grouped for display. */
export function lnGetRitualsByPhase(): Array<{ phaseReq: number | null; phase: MoonPhaseDef | null; rituals: RitualDef[] }> {
  const grouped = new Map<number | null, RitualDef[]>();
  for (const ritual of LN_RITUALS) {
    if (!grouped.has(ritual.phaseReq)) grouped.set(ritual.phaseReq, []);
    grouped.get(ritual.phaseReq)!.push(ritual);
  }
  return Array.from(grouped.entries()).map(([phaseReq, rituals]) => ({
    phaseReq,
    phase: phaseReq !== null ? LN_MOON_PHASES[phaseReq] : null,
    rituals,
  }));
}

/** Returns a rarity color for display purposes. */
export function lnGetRarityColor(rarity: LNRarity): string {
  const colors: Record<LNRarity, string> = {
    common: LN_COLOR_MOONLIGHT,
    uncommon: '#34D399',
    rare: '#60A5FA',
    epic: LN_COLOR_CELESTIAL,
    legendary: LN_COLOR_STARLIGHT,
  };
  return colors[rarity] ?? LN_COLOR_MOONLIGHT;
}

/** Returns a rarity label for display purposes. */
export function lnGetRarityLabel(rarity: LNRarity): string {
  const labels: Record<LNRarity, string> = {
    common: 'Common',
    uncommon: 'Uncommon',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
  };
  return labels[rarity] ?? 'Unknown';
}

/** Validates if a structure upgrade is possible. */
export function lnCanUpgradeStructure(structDefId: string): { canUpgrade: boolean; reason: string; cost: number } {
  const s = useLNStore.getState();
  const structDef = LN_STRUCTURES.find((d) => d.id === structDefId);
  if (!structDef) return { canUpgrade: false, reason: 'Structure definition not found', cost: 0 };
  const instance = s.structures.find((inst) => inst.defId === structDefId);
  if (!instance) return { canUpgrade: false, reason: 'Structure has not been built yet', cost: 0 };
  if (instance.level >= structDef.maxLevel) return { canUpgrade: false, reason: 'Structure is already at maximum level', cost: 0 };
  const cost = lnStructureCost(structDef, instance.level);
  if (s.moonlightEnergy < cost) return { canUpgrade: false, reason: `Insufficient moonlight (need ${cost}, have ${s.moonlightEnergy})`, cost };
  return { canUpgrade: true, reason: 'Ready to upgrade', cost };
}

/** Validates if a ritual can be performed. */
export function lnCanPerformRitual(ritualId: string): { canPerform: boolean; reasons: string[]; cost: number } {
  const s = useLNStore.getState();
  const ritual = LN_RITUALS.find((r) => r.id === ritualId);
  if (!ritual) return { canPerform: false, reasons: ['Ritual not found'], cost: 0 };
  const reasons: string[] = [];
  if (ritual.phaseReq !== null && s.currentPhase !== ritual.phaseReq) {
    const reqPhase = LN_MOON_PHASES[ritual.phaseReq];
    const curPhase = LN_MOON_PHASES[s.currentPhase];
    reasons.push(`Requires ${reqPhase.name} phase, currently ${curPhase.name}`);
  }
  const cost = ritual.requirements[0]?.amount ?? 0;
  if (s.moonlightEnergy < cost) {
    reasons.push(`Insufficient moonlight (need ${cost}, have ${s.moonlightEnergy})`);
  }
  const cooldown = s.ritualCooldowns[ritualId];
  if (cooldown && cooldown > Date.now()) {
    const remaining = Math.ceil((cooldown - Date.now()) / 1000);
    reasons.push(`On cooldown (${remaining}s remaining)`);
  }
  return { canPerform: reasons.length === 0, reasons, cost };
}

/** Returns the complete list of structure IDs that have been maxed out. */
export function lnGetMaxedStructures(): string[] {
  const s = useLNStore.getState();
  return s.structures
    .filter((inst) => {
      const def = LN_STRUCTURES.find((d) => d.id === inst.defId);
      return def ? inst.level >= def.maxLevel : false;
    })
    .map((inst) => inst.defId);
}

/** Returns the title that should be displayed based on current level. */
export function lnGetBestAvailableTitle(): TitleDef {
  const s = useLNStore.getState();
  let best = LN_TITLES[0];
  for (const title of LN_TITLES) {
    if (s.lunarLevel >= title.levelRequired) best = title;
  }
  return best;
}

/** Returns the total combined power of all bonded celestials. */
export function lnGetTotalCelestialPower(): number {
  const s = useLNStore.getState();
  return s.celestialBonds.reduce((sum, bond) => {
    const def = LN_CELESTIALS.find((c) => c.id === bond.celestialId);
    if (!def) return sum;
    return sum + Math.floor(def.power * bond.bondLevel * 0.5);
  }, 0);
}

/** Returns the total production bonus from all structures. */
export function lnGetTotalStructureBonus(): number {
  const s = useLNStore.getState();
  return s.structures.reduce((sum, inst) => sum + inst.level * 5, 0);
}

/** Returns the count of items collected by rarity tier. */
export function lnGetItemCountByRarity(): Record<LNRarity, number> {
  const s = useLNStore.getState();
  const counts: Record<LNRarity, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
  for (const id of s.collectedItems) {
    const item = LN_MOONLIGHT_ITEMS.find((i) => i.id === id);
    if (item) counts[item.rarity] += 1;
  }
  return counts;
}

/** Returns moon phase name with emoji for quick display. */
export function lnGetPhaseEmoji(phaseIndex: number): string {
  const emojis = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  return emojis[phaseIndex] ?? '🌙';
}

/** Returns a summary of the active reading suitable for display. */
export function lnGetReadingSummary(): {
  hasReading: boolean;
  cardCount: number;
  cardNames: string[];
  totalPower: number;
  interpretation: string;
  timeSinceDraw: number | null;
} {
  const s = useLNStore.getState();
  if (!s.activeReading) {
    return { hasReading: false, cardCount: 0, cardNames: [], totalPower: 0, interpretation: '', timeSinceDraw: null };
  }
  const cards = s.activeReading.cards
    .map((id) => LN_TAROT_CARDS.find((c) => c.id === id))
    .filter(Boolean);
  return {
    hasReading: true,
    cardCount: cards.length,
    cardNames: cards.map((c) => c!.name),
    totalPower: cards.reduce((sum, c) => sum + c!.power, 0),
    interpretation: s.activeReading.interpretation,
    timeSinceDraw: Date.now() - s.activeReading.drawnAt,
  };
}

/** Returns all abilities with their phase requirements resolved. */
export function lnGetFullAbilities(): Array<{
  def: AbilityDef;
  phaseAvailable: boolean;
  phaseName: string | null;
  phaseColor: string | null;
}> {
  const s = useLNStore.getState();
  return LN_ABILITIES.map((ability) => {
    const phaseAvailable = ability.moonPhaseReq === null || ability.moonPhaseReq === s.currentPhase;
    const phaseName = ability.moonPhaseReq !== null ? LN_MOON_PHASES[ability.moonPhaseReq].name : null;
    const phaseColor = ability.moonPhaseReq !== null ? LN_MOON_PHASES[ability.moonPhaseReq].color : null;
    return { def: ability, phaseAvailable, phaseName, phaseColor };
  });
}

/** Returns the full moon phase cycle info for the entire 8-phase cycle. */
export function lnGetFullCycle(): Array<{
  phase: MoonPhaseDef;
  index: number;
  isActive: boolean;
  harvestYield: number;
  nextIn: number;
}> {
  const s = useLNStore.getState();
  return LN_MOON_PHASES.map((phase, index) => {
    const isActive = s.currentPhase === index;
    const harvestYield = Math.floor(10 * phase.powerMultiplier);
    const nextIn = isActive ? 0 : (index - s.currentPhase + 8) % 8;
    return { phase, index, isActive, harvestYield, nextIn };
  });
}
