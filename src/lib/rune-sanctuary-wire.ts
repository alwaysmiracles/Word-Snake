'use client'
import { useState, useCallback, useEffect, useRef } from 'react'

/* ================================================================
   RUNE SANCTUARY — Wire Hook
   A hook-based sanctuary management system for magical rune
   inscription, altar blessing, scroll crafting, artifact
   enchanting, and daily meditation.
   Color theme: indigo / violet / silver
   ================================================================ */

// ─── Type Definitions ─────────────────────────────────────────────

type RsRarityKey = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

type RsElement = 'fire' | 'water' | 'earth' | 'air' | 'light' | 'shadow' | 'void' | 'cosmic'

interface RsRarityInfo {
  key: RsRarityKey
  label: string
  color: string
  glow: string
  xpMultiplier: number
  dropWeight: number
}

interface RsRune {
  id: string
  name: string
  symbol: string
  element: RsElement
  rarity: RsRarityKey
  power: number
  description: string
  lore: string
}

interface RsAltar {
  id: string
  name: string
  element: RsElement
  description: string
  blessingEffect: string
  maxBlessing: number
  icon: string
}

interface RsScroll {
  id: string
  name: string
  rarity: RsRarityKey
  element: RsElement
  power: number
  description: string
  craftCost: number
  effect: string
}

interface RsArtifact {
  id: string
  name: string
  type: 'amulet' | 'staff' | 'orb' | 'robe' | 'ring' | 'crown' | 'blade' | 'shield'
  rarity: RsRarityKey
  element: RsElement
  power: number
  description: string
  enchantCost: number
  lore: string
}

interface RsTitle {
  id: string
  name: string
  requiredLevel: number
  description: string
  color: string
}

interface RsAchievement {
  id: string
  name: string
  description: string
  icon: string
  condition: string
  reward: { type: string; value: number }
}

interface RsAltarBlessing {
  blessed: boolean
  blessingCount: number
  lastBlessedAt: string
  bonusPower: number
}

interface RsMeditationResult {
  xpGained: number
  sanctumPowerGained: number
  elementBonus: string | null
  messages: string[]
}

interface RuneSanctuaryState {
  level: number
  xp: number
  inscribedRunes: string[]
  altarBlessings: Record<string, RsAltarBlessing>
  craftedScrolls: string[]
  enchantedArtifacts: string[]
  unlockedAchievements: string[]
  meditationStreak: number
  lastMeditationDate: string
  totalRunesInscribed: number
  totalScrollsCrafted: number
  totalArtifactsEnchanted: number
  totalMeditations: number
  totalAltarBlessings: number
  sanctumPower: number
  createdAt: string
  updatedAt: string
}

// ─── Constants ────────────────────────────────────────────────────

export const RS_MAX_LEVEL = 50

export const RS_RARITY: Record<RsRarityKey, RsRarityInfo> = {
  common: {
    key: 'common',
    label: 'Common',
    color: '#9CA3AF',
    glow: 'rgba(156,163,175,0.3)',
    xpMultiplier: 1,
    dropWeight: 40,
  },
  uncommon: {
    key: 'uncommon',
    label: 'Uncommon',
    color: '#818CF8',
    glow: 'rgba(129,140,248,0.35)',
    xpMultiplier: 1.5,
    dropWeight: 30,
  },
  rare: {
    key: 'rare',
    label: 'Rare',
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.4)',
    xpMultiplier: 2,
    dropWeight: 18,
  },
  epic: {
    key: 'epic',
    label: 'Epic',
    color: '#C084FC',
    glow: 'rgba(192,132,252,0.45)',
    xpMultiplier: 3,
    dropWeight: 9,
  },
  legendary: {
    key: 'legendary',
    label: 'Legendary',
    color: '#E879F9',
    glow: 'rgba(232,121,249,0.5)',
    xpMultiplier: 5,
    dropWeight: 3,
  },
}

export const RS_RARITY_ORDER: RsRarityKey[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
]

export const RS_ELEMENTS: RsElement[] = [
  'fire',
  'water',
  'earth',
  'air',
  'light',
  'shadow',
  'void',
  'cosmic',
]

export const RS_ELEMENT_COLORS: Record<RsElement, string> = {
  fire: '#F97316',
  water: '#3B82F6',
  earth: '#84CC16',
  air: '#A5F3FC',
  light: '#FBBF24',
  shadow: '#6B21A8',
  void: '#1E1B4B',
  cosmic: '#8B5CF6',
}

export const RS_ELEMENT_GLOWS: Record<RsElement, string> = {
  fire: 'rgba(249,115,22,0.4)',
  water: 'rgba(59,130,246,0.4)',
  earth: 'rgba(132,204,22,0.4)',
  air: 'rgba(165,243,252,0.4)',
  light: 'rgba(251,191,36,0.4)',
  shadow: 'rgba(107,33,168,0.4)',
  void: 'rgba(30,27,75,0.4)',
  cosmic: 'rgba(139,92,246,0.4)',
}

export const RS_THEME = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  accent: '#A78BFA',
  silver: '#C0C0C0',
  background: '#0F0A1A',
  surface: '#1A1130',
  surfaceLight: '#251D40',
  textPrimary: '#E2E8F0',
  textSecondary: '#94A3B8',
  border: '#312E81',
  borderLight: '#4338CA',
}

export const RS_RUNES: RsRune[] = [
  {
    id: 'fehu',
    name: 'Fehu',
    symbol: 'ᚠ',
    element: 'fire',
    rarity: 'common',
    power: 10,
    description: 'Wealth and abundance rune, channeling the flame of prosperity.',
    lore: 'The ancient cattle-wealth symbol, first of the Elder Futhark, burns with the fire of creation and material gain.',
  },
  {
    id: 'uruz',
    name: 'Uruz',
    symbol: 'ᚢ',
    element: 'earth',
    rarity: 'common',
    power: 12,
    description: 'Strength and vitality rune, grounding power from the earth.',
    lore: 'The aurochs horn stands unyielding, drawing raw primal force from deep within the earth.',
  },
  {
    id: 'thurisaz',
    name: 'Thurisaz',
    symbol: 'ᚦ',
    element: 'fire',
    rarity: 'uncommon',
    power: 18,
    description: 'Force and defense rune, a thorn of protective flame.',
    lore: 'The giant\'s thorn burns those who approach with ill intent, a sentinel of crackling fire.',
  },
  {
    id: 'ansuz',
    name: 'Ansuz',
    symbol: 'ᚨ',
    element: 'light',
    rarity: 'uncommon',
    power: 20,
    description: 'Wisdom and divine communication rune, illuminating hidden truths.',
    lore: 'The mouth of Odin whispers illuminated knowledge to those who inscribe this sacred sigil.',
  },
  {
    id: 'raidho',
    name: 'Raidho',
    symbol: 'ᚱ',
    element: 'air',
    rarity: 'common',
    power: 14,
    description: 'Journey and rhythm rune, carrying whispered winds of movement.',
    lore: 'The celestial chariot rides upon air currents, guiding travelers through unseen paths.',
  },
  {
    id: 'kenaz',
    name: 'Kenaz',
    symbol: 'ᚲ',
    element: 'fire',
    rarity: 'uncommon',
    power: 16,
    description: 'Knowledge and creativity rune, an inner torch of inspiration.',
    lore: 'The controlled flame of the torch illuminates the darkness of ignorance, revealing creative sparks.',
  },
  {
    id: 'gebo',
    name: 'Gebo',
    symbol: 'ᚷ',
    element: 'cosmic',
    rarity: 'rare',
    power: 25,
    description: 'Gift and partnership rune, binding cosmic energies in sacred exchange.',
    lore: 'The X-shaped union bridges mortal desires with cosmic intent, forging unbreakable bonds.',
  },
  {
    id: 'wunjo',
    name: 'Wunjo',
    symbol: 'ᚹ',
    element: 'light',
    rarity: 'uncommon',
    power: 18,
    description: 'Joy and harmony rune, radiating light that soothes the spirit.',
    lore: 'The banner of joy unfurls in golden light, bringing warmth to weary hearts.',
  },
  {
    id: 'hagalaz',
    name: 'Hagalaz',
    symbol: 'ᚺ',
    element: 'shadow',
    rarity: 'rare',
    power: 28,
    description: 'Disruption and transformation rune, shattering shadow illusions.',
    lore: 'The hailstone of fate crashes through shadows, tearing down the old to build the new.',
  },
  {
    id: 'nauthiz',
    name: 'Nauthiz',
    symbol: 'ᚾ',
    element: 'earth',
    rarity: 'common',
    power: 15,
    description: 'Need and resistance rune, forging strength through earth-bound trials.',
    lore: 'The bar of necessity presses against the body, tempering the soul like steel in earth\'s crucible.',
  },
  {
    id: 'isa',
    name: 'Isa',
    symbol: 'ᛁ',
    element: 'water',
    rarity: 'common',
    power: 11,
    description: 'Ice and stillness rune, freezing water into crystalline focus.',
    lore: 'The frozen pillar stands in absolute silence, the world of water held in perfect stasis.',
  },
  {
    id: 'jera',
    name: 'Jera',
    symbol: 'ᛃ',
    element: 'earth',
    rarity: 'rare',
    power: 24,
    description: 'Harvest and cycles rune, the earth\'s eternal promise of renewal.',
    lore: 'Two sacred spirals interweave the earth\'s bounty, bringing forth harvest in perfect timing.',
  },
  {
    id: 'eihwaz',
    name: 'Eihwaz',
    symbol: 'ᛇ',
    element: 'void',
    rarity: 'epic',
    power: 35,
    description: 'Endurance and the void rune, standing resolute between worlds.',
    lore: 'The yew tree pierces the veil of void itself, its roots drinking from the well of eternity.',
  },
  {
    id: 'perthro',
    name: 'Perthro',
    symbol: 'ᛈ',
    element: 'cosmic',
    rarity: 'rare',
    power: 26,
    description: 'Mystery and fate rune, revealing the cosmic dance of probability.',
    lore: 'The dice of destiny tumble through cosmic space, each face a possible future made manifest.',
  },
  {
    id: 'algiz',
    name: 'Algiz',
    symbol: 'ᛉ',
    element: 'light',
    rarity: 'rare',
    power: 24,
    description: 'Protection and sanctuary rune, a radiant shield of pure light.',
    lore: 'The elk-sedge rises like blazing light, warding all who shelter beneath its luminous branches.',
  },
  {
    id: 'sowilo',
    name: 'Sowilo',
    symbol: 'ᛊ',
    element: 'fire',
    rarity: 'rare',
    power: 27,
    description: 'Sun and victory rune, an unstoppable fire of triumph.',
    lore: 'The lightning-bolt of solar fire strikes through darkness, declaring victory with searing brilliance.',
  },
  {
    id: 'tiwaz',
    name: 'Tiwaz',
    symbol: 'ᛏ',
    element: 'light',
    rarity: 'epic',
    power: 34,
    description: 'Justice and honor rune, the light of cosmic law guiding warriors.',
    lore: 'The spear of Tyr points skyward, channeling light of unwavering justice and righteous warfare.',
  },
  {
    id: 'berkano',
    name: 'Berkano',
    symbol: 'ᛒ',
    element: 'earth',
    rarity: 'uncommon',
    power: 19,
    description: 'Birth and growth rune, earth\'s nurturing embrace of new life.',
    lore: 'The birch goddess cradles new beginnings, the earth itself swelling with green potential.',
  },
  {
    id: 'ehwaz',
    name: 'Ehwaz',
    symbol: 'ᛖ',
    element: 'air',
    rarity: 'uncommon',
    power: 17,
    description: 'Trust and partnership rune, two spirits riding the wind together.',
    lore: 'The twin horses gallop through air and storm, their trust forging an unbreakable bond.',
  },
  {
    id: 'mannaz',
    name: 'Mannaz',
    symbol: 'ᛗ',
    element: 'light',
    rarity: 'uncommon',
    power: 18,
    description: 'Humanity and self-awareness rune, illuminating the inner landscape.',
    lore: 'The mirror of mankind reflects divine light inward, revealing the luminous nature of self.',
  },
  {
    id: 'laguz',
    name: 'Laguz',
    symbol: 'ᛚ',
    element: 'water',
    rarity: 'uncommon',
    power: 19,
    description: 'Water and intuition rune, flowing with the deep currents of wisdom.',
    lore: 'The waterfall of intuition cascades through the waters of consciousness, pure and unending.',
  },
  {
    id: 'ingwaz',
    name: 'Ingwaz',
    symbol: 'ᛜ',
    element: 'earth',
    rarity: 'rare',
    power: 23,
    description: 'Fertility and potential rune, the seed of power germinating in earth.',
    lore: 'The closed seed holds infinite earth-energy, waiting for the perfect moment of emergence.',
  },
  {
    id: 'dagaz',
    name: 'Dagaz',
    symbol: 'ᛞ',
    element: 'light',
    rarity: 'epic',
    power: 32,
    description: 'Dawn and breakthrough rune, the light that conquers all shadow.',
    lore: 'The dawn breaks through eternal night, a radiant light that transforms darkness into day.',
  },
  {
    id: 'othala',
    name: 'Othala',
    symbol: 'ᛟ',
    element: 'cosmic',
    rarity: 'legendary',
    power: 45,
    description: 'Heritage and cosmic belonging rune, the ancestral star-fire.',
    lore: 'The sacred inheritance of the cosmos flows through this rune, connecting past to the stars.',
  },
  {
    id: 'kaunan',
    name: 'Kaunan',
    symbol: 'ᚲ',
    element: 'fire',
    rarity: 'common',
    power: 13,
    description: 'Torch and illumination rune, the small flame that kindles great fires.',
    lore: 'An older form of the fire-torch, Kaunan warms the spirit against the cold of ignorance.',
  },
  {
    id: 'gibu',
    name: 'Gibu',
    symbol: 'ᚷ',
    element: 'cosmic',
    rarity: 'uncommon',
    power: 20,
    description: 'Equilibrium and cosmic balance rune, the scales of the universe.',
    lore: 'The gift-balance of Gibu weighs cosmic forces against each other, finding harmony in duality.',
  },
  {
    id: 'enguz',
    name: 'Enguz',
    symbol: 'ᛜ',
    element: 'earth',
    rarity: 'uncommon',
    power: 17,
    description: 'Life force and earth energy rune, the vital spark in all living things.',
    lore: 'The life-energy of Enguz pulses through the earth, a heartbeat felt in every stone and root.',
  },
  {
    id: 'sowilu-inverted',
    name: 'Sowilo Inverted',
    symbol: 'ᛊ',
    element: 'shadow',
    rarity: 'epic',
    power: 36,
    description: 'Eclipse and shadow-fire rune, the dark sun that devours light.',
    lore: 'When Sowilo is cast in shadow, its fire becomes an eclipse — consuming, transforming, terrifying.',
  },
  {
    id: 'algiz-inverted',
    name: 'Algiz Inverted',
    symbol: 'ᛉ',
    element: 'void',
    rarity: 'epic',
    power: 33,
    description: 'Hidden vulnerability rune, the void that swallows protective light.',
    lore: 'The inverted elk-sedge opens the void beneath, revealing the fragile truths we hide from ourselves.',
  },
  {
    id: 'othala-inverted',
    name: 'Othala Inverted',
    symbol: 'ᛟ',
    element: 'void',
    rarity: 'legendary',
    power: 48,
    description: 'Cosmic exile rune, severed from the ancestral star-fire.',
    lore: 'The dark mirror of heritage reveals what lies beyond the cosmic boundary — terrifying, liberating.',
  },
  {
    id: 'thurisaz-shadow',
    name: 'Thurisaz Umbral',
    symbol: 'ᚦ',
    element: 'shadow',
    rarity: 'rare',
    power: 29,
    description: 'Shadow-thorn rune, growing in darkness and feeding on fear.',
    lore: 'When the giant\'s thorn is bathed in shadow, it grows into a labyrinth of dark protection.',
  },
  {
    id: 'perthro-void',
    name: 'Perthro Abyssal',
    symbol: 'ᛈ',
    element: 'void',
    rarity: 'epic',
    power: 38,
    description: 'Void-dice rune, rolling fate into the bottomless abyss.',
    lore: 'The dice of destiny fall into the void, where every outcome spirals into beautiful chaos.',
  },
]

export const RS_ALTARS: RsAltar[] = [
  {
    id: 'fire-altar',
    name: 'Fire Altar',
    element: 'fire',
    description: 'A blazing altar wreathed in eternal flame, channeling the raw power of Fehu and Sowilo.',
    blessingEffect: 'Boosts fire rune power by 20% per blessing level',
    maxBlessing: 10,
    icon: '🔥',
  },
  {
    id: 'water-basin',
    name: 'Water Basin',
    element: 'water',
    description: 'A crystalline basin filled with luminous water, reflecting the depth of Isa and Laguz.',
    blessingEffect: 'Boosts water rune power by 20% per blessing level',
    maxBlessing: 10,
    icon: '💧',
  },
  {
    id: 'earth-stone',
    name: 'Earth Stone',
    element: 'earth',
    description: 'An ancient standing stone pulsing with the heartbeat of Uruz and Jera.',
    blessingEffect: 'Boosts earth rune power by 20% per blessing level',
    maxBlessing: 10,
    icon: '🪨',
  },
  {
    id: 'air-shrine',
    name: 'Air Shrine',
    element: 'air',
    description: 'A floating shrine suspended in perpetual wind, carrying whispers of Raidho and Ehwaz.',
    blessingEffect: 'Boosts air rune power by 20% per blessing level',
    maxBlessing: 10,
    icon: '🌬️',
  },
  {
    id: 'light-beacon',
    name: 'Light Beacon',
    element: 'light',
    description: 'A radiant beacon piercing the darkness, amplifying Ansuz, Wunjo, and Tiwaz.',
    blessingEffect: 'Boosts light rune power by 20% per blessing level',
    maxBlessing: 10,
    icon: '✨',
  },
  {
    id: 'shadow-pool',
    name: 'Shadow Pool',
    element: 'shadow',
    description: 'A pool of liquid darkness where Hagalaz and Thurisaz Umbral dance.',
    blessingEffect: 'Boosts shadow rune power by 20% per blessing level',
    maxBlessing: 10,
    icon: '🌑',
  },
  {
    id: 'void-gate',
    name: 'Void Gate',
    element: 'void',
    description: 'A gateway to the space between spaces, resonating with Eihwaz and Perthro Abyssal.',
    blessingEffect: 'Boosts void rune power by 20% per blessing level',
    maxBlessing: 10,
    icon: '🕳️',
  },
  {
    id: 'cosmic-nexus',
    name: 'Cosmic Nexus',
    element: 'cosmic',
    description: 'A convergence point of stellar energy, where Gebo, Othala, and the stars align.',
    blessingEffect: 'Boosts cosmic rune power by 20% per blessing level',
    maxBlessing: 10,
    icon: '🌌',
  },
]

export const RS_SCROLLS: RsScroll[] = [
  {
    id: 'scroll-ember-ward',
    name: 'Ember Ward Scroll',
    rarity: 'common',
    element: 'fire',
    power: 8,
    description: 'A scroll that creates a barrier of protective flames around the reader.',
    craftCost: 50,
    effect: 'fire_shield',
  },
  {
    id: 'scroll-tidal-surge',
    name: 'Tidal Surge Scroll',
    rarity: 'common',
    element: 'water',
    power: 8,
    description: 'Summons a wave of cleansing water that washes away negative effects.',
    craftCost: 50,
    effect: 'water_cleanse',
  },
  {
    id: 'scroll-stone-skin',
    name: 'Stone Skin Scroll',
    rarity: 'common',
    element: 'earth',
    power: 10,
    description: 'Hardens the reader\'s skin to the toughness of ancient granite.',
    craftCost: 55,
    effect: 'earth_armor',
  },
  {
    id: 'scroll-gale-step',
    name: 'Gale Step Scroll',
    rarity: 'common',
    element: 'air',
    power: 9,
    description: 'Grants the ability to step between gusts of wind for swift travel.',
    craftCost: 50,
    effect: 'air_speed',
  },
  {
    id: 'scroll-dawn-break',
    name: 'Dawn Break Scroll',
    rarity: 'uncommon',
    element: 'light',
    power: 15,
    description: 'Channels the first light of dawn to blind enemies and reveal secrets.',
    craftCost: 80,
    effect: 'light_reveal',
  },
  {
    id: 'scroll-shadow-veil',
    name: 'Shadow Veil Scroll',
    rarity: 'uncommon',
    element: 'shadow',
    power: 16,
    description: 'Wraps the reader in shadows, rendering them nearly invisible.',
    craftCost: 85,
    effect: 'shadow_stealth',
  },
  {
    id: 'scroll-void-rupture',
    name: 'Void Rupture Scroll',
    rarity: 'rare',
    element: 'void',
    power: 22,
    description: 'Tears a small hole in reality, causing localized space-time distortion.',
    craftCost: 120,
    effect: 'void_tear',
  },
  {
    id: 'scroll-starfall',
    name: 'Starfall Scroll',
    rarity: 'rare',
    element: 'cosmic',
    power: 24,
    description: 'Calls down a meteor shower of cosmic energy from the astral plane.',
    craftCost: 130,
    effect: 'cosmic_rain',
  },
  {
    id: 'scroll-inferno-pact',
    name: 'Inferno Pact Scroll',
    rarity: 'rare',
    element: 'fire',
    power: 23,
    description: 'A pact with ancient fire spirits that unleashes devastating flames.',
    craftCost: 125,
    effect: 'fire_inferno',
  },
  {
    id: 'scroll-abyssal-depth',
    name: 'Abyssal Depth Scroll',
    rarity: 'rare',
    element: 'water',
    power: 22,
    description: 'Drowns the target in spectral waters from the deepest ocean trenches.',
    craftCost: 120,
    effect: 'water_drown',
  },
  {
    id: 'scroll-tremor-call',
    name: 'Tremor Call Scroll',
    rarity: 'uncommon',
    element: 'earth',
    power: 17,
    description: 'Calls forth minor earthquakes that shake the ground and destabilize foes.',
    craftCost: 90,
    effect: 'earth_quake',
  },
  {
    id: 'scroll-zephyr-wings',
    name: 'Zephyr Wings Scroll',
    rarity: 'uncommon',
    element: 'air',
    power: 16,
    description: 'Grants temporary spectral wings that ride the highest winds.',
    craftCost: 85,
    effect: 'air_flight',
  },
  {
    id: 'scroll-radiance-prism',
    name: 'Radiance Prism Scroll',
    rarity: 'rare',
    element: 'light',
    power: 25,
    description: 'Splits light into a devastating spectrum of elemental beams.',
    craftCost: 130,
    effect: 'light_prism',
  },
  {
    id: 'scroll-umbra-bind',
    name: 'Umbra Bind Scroll',
    rarity: 'rare',
    element: 'shadow',
    power: 24,
    description: 'Chains the target in shadow tendrils that drain their vitality.',
    craftCost: 125,
    effect: 'shadow_bind',
  },
  {
    id: 'scroll-null-field',
    name: 'Null Field Scroll',
    rarity: 'epic',
    element: 'void',
    power: 35,
    description: 'Creates a field of absolute negation that silences all magic within.',
    craftCost: 200,
    effect: 'void_null',
  },
  {
    id: 'scroll-nova-flash',
    name: 'Nova Flash Scroll',
    rarity: 'epic',
    element: 'cosmic',
    power: 38,
    description: 'Detonates a miniature supernova that incinerates everything nearby.',
    craftCost: 220,
    effect: 'cosmic_nova',
  },
  {
    id: 'scroll-phoenix-rebirth',
    name: 'Phoenix Rebirth Scroll',
    rarity: 'epic',
    element: 'fire',
    power: 36,
    description: 'Upon death, the reader is reborn in a blaze of phoenix fire.',
    craftCost: 210,
    effect: 'fire_phoenix',
  },
  {
    id: 'scroll-krakens-wrath',
    name: 'Kraken\'s Wrath Scroll',
    rarity: 'epic',
    element: 'water',
    power: 34,
    description: 'Summons spectral tentacles from the deep to crush all enemies.',
    craftCost: 200,
    effect: 'water_kraken',
  },
  {
    id: 'scroll-world-tree',
    name: 'World Tree Scroll',
    rarity: 'epic',
    element: 'earth',
    power: 37,
    description: 'Channels the power of Yggdrasil to heal and empower all allies.',
    craftCost: 215,
    effect: 'earth_yggdrasil',
  },
  {
    id: 'scroll-tempest-fury',
    name: 'Tempest Fury Scroll',
    rarity: 'epic',
    element: 'air',
    power: 35,
    description: 'Commands a devastating tempest of wind, lightning, and hail.',
    craftCost: 205,
    effect: 'air_tempest',
  },
  {
    id: 'scroll-divine-judgment',
    name: 'Divine Judgment Scroll',
    rarity: 'legendary',
    element: 'light',
    power: 50,
    description: 'Calls down the absolute judgment of celestial light upon all foes.',
    craftCost: 400,
    effect: 'light_judgment',
  },
  {
    id: 'scroll-eclipse-eternal',
    name: 'Eternal Eclipse Scroll',
    rarity: 'legendary',
    element: 'shadow',
    power: 52,
    description: 'Plunges the entire battlefield into permanent shadow, empowering allies.',
    craftCost: 420,
    effect: 'shadow_eclipse',
  },
]

export const RS_ARTIFACTS: RsArtifact[] = [
  {
    id: 'amulet-of-ember-heart',
    name: 'Amulet of the Ember Heart',
    type: 'amulet',
    rarity: 'uncommon',
    element: 'fire',
    power: 15,
    description: 'A pulsing ruby amulet that radiates warmth and enhances fire runes.',
    enchantCost: 60,
    lore: 'Forged in the caldera of Mount Pyralis, the ember within has burned for a thousand years.',
  },
  {
    id: 'staff-of-tidal-whispers',
    name: 'Staff of Tidal Whispers',
    type: 'staff',
    rarity: 'uncommon',
    element: 'water',
    power: 16,
    description: 'A spiraling staff carved from coral that hums with oceanic melodies.',
    enchantCost: 65,
    lore: 'The Abyssal Sirens once sang into this staff, and their whispers echo still.',
  },
  {
    id: 'orb-of-deep-earth',
    name: 'Orb of Deep Earth',
    type: 'orb',
    rarity: 'rare',
    element: 'earth',
    power: 25,
    description: 'A dense sphere of petrified wood containing the essence of ancient forests.',
    enchantCost: 100,
    lore: 'Each ring within the orb represents a century of growth, compressed into eternal stone.',
  },
  {
    id: 'robe-of-zephyr-weave',
    name: 'Robe of Zephyr Weave',
    type: 'robe',
    rarity: 'rare',
    element: 'air',
    power: 23,
    description: 'A gossamer robe woven from captured wind currents and cloud-silk.',
    enchantCost: 95,
    lore: 'Spun on the highest peaks where air meets the void of space, lighter than a feather.',
  },
  {
    id: 'ring-of-solar-grace',
    name: 'Ring of Solar Grace',
    type: 'ring',
    rarity: 'rare',
    element: 'light',
    power: 26,
    description: 'A golden ring that catches and amplifies any light that touches it.',
    enchantCost: 105,
    lore: 'The Archon of Dawn wore this ring as she ushered in the first morning of the world.',
  },
  {
    id: 'crown-of-shadow-realm',
    name: 'Crown of the Shadow Realm',
    type: 'crown',
    rarity: 'epic',
    element: 'shadow',
    power: 38,
    description: 'A jagged crown forged from solidified darkness, pulsing with umbral energy.',
    enchantCost: 180,
    lore: 'The Shadow King\'s final legacy, his consciousness woven into every facet of the dark crystal.',
  },
  {
    id: 'blade-of-void-sunder',
    name: 'Blade of Void Sunder',
    type: 'blade',
    rarity: 'epic',
    element: 'void',
    power: 40,
    description: 'A sword that cuts through space itself, its edge existing in two dimensions.',
    enchantCost: 195,
    lore: 'Where this blade falls, reality folds. It was used to carve the first gateway into the void.',
  },
  {
    id: 'shield-of-cosmic-bastion',
    name: 'Shield of the Cosmic Bastion',
    type: 'shield',
    rarity: 'epic',
    element: 'cosmic',
    power: 37,
    description: 'A shield containing a captured star fragment, radiating cosmic defensive energy.',
    enchantCost: 185,
    lore: 'The star within this shield chose to die here, its last light serving as eternal protection.',
  },
  {
    id: 'amulet-of-runic-convergence',
    name: 'Amulet of Runic Convergence',
    type: 'amulet',
    rarity: 'legendary',
    element: 'cosmic',
    power: 55,
    description: 'All rune elements converge within this amulet, amplifying their combined power.',
    enchantCost: 350,
    lore: 'When all Elder Futhark runes are inscribed upon its surface, the amulet sings the song of creation.',
  },
  {
    id: 'staff-of-ninth-gate',
    name: 'Staff of the Ninth Gate',
    type: 'staff',
    rarity: 'legendary',
    element: 'void',
    power: 58,
    description: 'A staff that can open the ninth and final gate between reality and the abyss.',
    enchantCost: 380,
    lore: 'Eight gates already exist. This staff was created to unlock the ninth — the one that must never open.',
  },
  {
    id: 'orb-of-eternal-flame',
    name: 'Orb of Eternal Flame',
    type: 'orb',
    rarity: 'epic',
    element: 'fire',
    power: 36,
    description: 'An orb containing a fragment of the primordial fire that birthed the universe.',
    enchantCost: 175,
    lore: 'Before the stars, there was only fire. This orb holds the last ember of that first flame.',
  },
  {
    id: 'robe-of-starry-mantle',
    name: 'Robe of the Starry Mantle',
    type: 'robe',
    rarity: 'epic',
    element: 'cosmic',
    power: 39,
    description: 'A robe embroidered with actual constellations that shift with the real night sky.',
    enchantCost: 190,
    lore: 'The Weaver of Stars created this mantle from the fabric of the night itself.',
  },
  {
    id: 'ring-of-abyssal-depth',
    name: 'Ring of the Abyssal Depth',
    type: 'ring',
    rarity: 'epic',
    element: 'water',
    power: 35,
    description: 'A ring that allows the wearer to breathe and command the deepest waters.',
    enchantCost: 170,
    lore: 'Dredged from the Mariana Rift by the Order of the Drowned Sages.',
  },
  {
    id: 'crown-of-flora-kings',
    name: 'Crown of the Flora Kings',
    type: 'crown',
    rarity: 'rare',
    element: 'earth',
    power: 27,
    description: 'A living crown of woven vines that blooms with seasonal flowers.',
    enchantCost: 110,
    lore: 'Each Flora King added their favorite bloom. The crown now contains every flower that ever existed.',
  },
  {
    id: 'blade-of-wind-shear',
    name: 'Blade of Wind Shear',
    type: 'blade',
    rarity: 'rare',
    element: 'air',
    power: 24,
    description: 'An impossibly thin blade that slices through air itself with devastating precision.',
    enchantCost: 100,
    lore: 'Sharpened in the eye of a hurricane, this blade exists at the boundary between air and void.',
  },
  {
    id: 'shield-of-dawn-guard',
    name: 'Shield of the Dawn Guard',
    type: 'shield',
    rarity: 'rare',
    element: 'light',
    power: 28,
    description: 'A shield that absorbs light during the day and releases it as a blinding flash.',
    enchantCost: 115,
    lore: 'Carried by the Dawn Guard, an order of paladins sworn to protect the first light of each day.',
  },
]

export const RS_TITLES: RsTitle[] = [
  {
    id: 'novice-acolyte',
    name: 'Novice Acolyte',
    requiredLevel: 1,
    description: 'A humble beginning on the path of rune mastery.',
    color: '#9CA3AF',
  },
  {
    id: 'rune-apprentice',
    name: 'Rune Apprentice',
    requiredLevel: 5,
    description: 'Has learned the basic strokes of the Elder Futhark.',
    color: '#818CF8',
  },
  {
    id: 'glyph-scholar',
    name: 'Glyph Scholar',
    requiredLevel: 10,
    description: 'Studied the ancient texts and can read the runic language.',
    color: '#A78BFA',
  },
  {
    id: 'sigil-weaver',
    name: 'Sigil Weaver',
    requiredLevel: 18,
    description: 'Can weave multiple runes into powerful sigil combinations.',
    color: '#C084FC',
  },
  {
    id: 'arcane-inscriber',
    name: 'Arcane Inscriber',
    requiredLevel: 25,
    description: 'Inscribed runes so powerful they resonate with the sanctuary itself.',
    color: '#D946EF',
  },
  {
    id: 'sanctum-keeper',
    name: 'Sanctum Keeper',
    requiredLevel: 33,
    description: 'Chosen guardian of the Rune Sanctuary, keeper of all altars.',
    color: '#E879F9',
  },
  {
    id: 'elder-rune-master',
    name: 'Elder Rune Master',
    requiredLevel: 42,
    description: 'Has mastered all Elder Futhark runes and their shadow variants.',
    color: '#F0ABFC',
  },
  {
    id: 'rune-archon',
    name: 'Rune Archon',
    requiredLevel: 50,
    description: 'The supreme authority of runic magic, one with the cosmic flow.',
    color: '#FDE68A',
  },
]

export const RS_ACHIEVEMENTS: RsAchievement[] = [
  {
    id: 'first-inscription',
    name: 'First Inscription',
    description: 'Inscribe your first rune into the sanctuary.',
    icon: '✒️',
    condition: 'inscribe_first_rune',
    reward: { type: 'xp', value: 25 },
  },
  {
    id: 'ten-runes-inscribed',
    name: 'Rune Collector',
    description: 'Inscribe 10 different runes.',
    icon: '📜',
    condition: 'inscribe_10_runes',
    reward: { type: 'xp', value: 100 },
  },
  {
    id: 'all-fire-runes',
    name: 'Fire Adept',
    description: 'Collect all fire-element runes.',
    icon: '🔥',
    condition: 'collect_all_fire',
    reward: { type: 'sanctum_power', value: 50 },
  },
  {
    id: 'all-water-runes',
    name: 'Water Adept',
    description: 'Collect all water-element runes.',
    icon: '💧',
    condition: 'collect_all_water',
    reward: { type: 'sanctum_power', value: 50 },
  },
  {
    id: 'all-earth-runes',
    name: 'Earth Adept',
    description: 'Collect all earth-element runes.',
    icon: '🌿',
    condition: 'collect_all_earth',
    reward: { type: 'sanctum_power', value: 50 },
  },
  {
    id: 'all-air-runes',
    name: 'Wind Adept',
    description: 'Collect all air-element runes.',
    icon: '💨',
    condition: 'collect_all_air',
    reward: { type: 'sanctum_power', value: 50 },
  },
  {
    id: 'all-light-runes',
    name: 'Light Adept',
    description: 'Collect all light-element runes.',
    icon: '☀️',
    condition: 'collect_all_light',
    reward: { type: 'sanctum_power', value: 50 },
  },
  {
    id: 'all-shadow-runes',
    name: 'Shadow Adept',
    description: 'Collect all shadow-element runes.',
    icon: '🌑',
    condition: 'collect_all_shadow',
    reward: { type: 'sanctum_power', value: 50 },
  },
  {
    id: 'first-altar-blessing',
    name: 'Altar Initiate',
    description: 'Bless your first altar.',
    icon: '🕯️',
    condition: 'bless_first_altar',
    reward: { type: 'xp', value: 40 },
  },
  {
    id: 'all-altars-blessed',
    name: 'Sanctum Consecrated',
    description: 'Bless all eight sanctuary altars at least once.',
    icon: '🏛️',
    condition: 'bless_all_altars',
    reward: { type: 'xp', value: 200 },
  },
  {
    id: 'first-scroll-crafted',
    name: 'Scroll Scribe',
    description: 'Craft your first enchantment scroll.',
    icon: '🧾',
    condition: 'craft_first_scroll',
    reward: { type: 'xp', value: 30 },
  },
  {
    id: 'ten-scrolls-crafted',
    name: 'Scroll Master',
    description: 'Craft 10 different enchantment scrolls.',
    icon: '📚',
    condition: 'craft_10_scrolls',
    reward: { type: 'xp', value: 150 },
  },
  {
    id: 'first-artifact-enchanted',
    name: 'Artificer\'s Touch',
    description: 'Enchant your first mystical artifact.',
    icon: '🔮',
    condition: 'enchant_first_artifact',
    reward: { type: 'xp', value: 35 },
  },
  {
    id: 'ten-artifacts-enchanted',
    name: 'Master Artificer',
    description: 'Enchant 10 different mystical artifacts.',
    icon: '⚜️',
    condition: 'enchant_10_artifacts',
    reward: { type: 'xp', value: 175 },
  },
  {
    id: 'meditation-streak-7',
    name: 'Devoted Meditator',
    description: 'Maintain a meditation streak of 7 days.',
    icon: '🧘',
    condition: 'meditation_streak_7',
    reward: { type: 'xp', value: 80 },
  },
  {
    id: 'meditation-streak-30',
    name: 'Enlightened Sage',
    description: 'Maintain a meditation streak of 30 days.',
    icon: '🕉️',
    condition: 'meditation_streak_30',
    reward: { type: 'sanctum_power', value: 100 },
  },
  {
    id: 'level-25-reached',
    name: 'Quarter Century',
    description: 'Reach level 25 in the Rune Sanctuary.',
    icon: '🌟',
    condition: 'reach_level_25',
    reward: { type: 'xp', value: 300 },
  },
  {
    id: 'level-50-reached',
    name: 'Pinnacle of Power',
    description: 'Reach the maximum level of 50.',
    icon: '👑',
    condition: 'reach_level_50',
    reward: { type: 'sanctum_power', value: 500 },
  },
  {
    id: 'sanctum-power-1000',
    name: 'Sanctum Awakened',
    description: 'Accumulate 1,000 total sanctum power.',
    icon: '💫',
    condition: 'sanctum_power_1000',
    reward: { type: 'xp', value: 250 },
  },
  {
    id: 'legendary-collection',
    name: 'Collector of Legends',
    description: 'Collect all legendary-tier items (runes, scrolls, and artifacts).',
    icon: '🏆',
    condition: 'collect_all_legendary',
    reward: { type: 'sanctum_power', value: 300 },
  },
]

// XP table — cumulative XP needed for each level (1-indexed)
export const RS_XP_TABLE: number[] = (() => {
  const table: number[] = [0]
  for (let i = 1; i <= RS_MAX_LEVEL; i++) {
    const base = 100
    const growth = 1.18
    const previous = table[i - 1]
    table.push(Math.floor(previous + base * Math.pow(growth, i - 1)))
  }
  return table
})()

export const RS_SAVE_KEY = 'rune-sanctuary-save'

export const RS_MEDITATION_BASE_XP = 30

export const RS_MEDITATION_STREAK_BONUS = 5

export const RS_ALTAR_BASE_XP = 40

export const RS_INSCRIBE_BASE_XP = 25

export const RS_CRAFT_BASE_XP = 20

export const RS_ENCHANT_BASE_XP = 30

// ─── Default State ────────────────────────────────────────────────

const RS_DEFAULT_STATE: RuneSanctuaryState = {
  level: 1,
  xp: 0,
  inscribedRunes: [],
  altarBlessings: {},
  craftedScrolls: [],
  enchantedArtifacts: [],
  unlockedAchievements: [],
  meditationStreak: 0,
  lastMeditationDate: '',
  totalRunesInscribed: 0,
  totalScrollsCrafted: 0,
  totalArtifactsEnchanted: 0,
  totalMeditations: 0,
  totalAltarBlessings: 0,
  sanctumPower: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// ─── Helper Functions ─────────────────────────────────────────────

function rsLoadState(): RuneSanctuaryState {
  if (typeof window === 'undefined') return { ...RS_DEFAULT_STATE }
  try {
    const raw = localStorage.getItem(RS_SAVE_KEY)
    if (!raw) return { ...RS_DEFAULT_STATE }
    const parsed = JSON.parse(raw) as Partial<RuneSanctuaryState>
    return {
      ...RS_DEFAULT_STATE,
      ...parsed,
    }
  } catch {
    return { ...RS_DEFAULT_STATE }
  }
}

function rsSaveState(state: RuneSanctuaryState): void {
  if (typeof window === 'undefined') return
  try {
    const toSave = { ...state, updatedAt: new Date().toISOString() }
    localStorage.setItem(RS_SAVE_KEY, JSON.stringify(toSave))
  } catch {
    // Storage full or unavailable — silently degrade
  }
}

function rsGetTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

function rsGetYesterdayString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function rsCalculateLevel(xp: number): number {
  for (let i = RS_MAX_LEVEL; i >= 1; i--) {
    if (xp >= RS_XP_TABLE[i]) return i
  }
  return 1
}

function rsGetXpForLevel(level: number): number {
  if (level < 1) return 0
  if (level > RS_MAX_LEVEL) return RS_XP_TABLE[RS_MAX_LEVEL]
  return RS_XP_TABLE[level]
}

function rsGetXpForNextLevel(level: number): number {
  if (level >= RS_MAX_LEVEL) return RS_XP_TABLE[RS_MAX_LEVEL]
  return RS_XP_TABLE[level + 1]
}

function rsFindRuneById(id: string): RsRune | undefined {
  return RS_RUNES.find((r) => r.id === id)
}

function rsFindScrollById(id: string): RsScroll | undefined {
  return RS_SCROLLS.find((s) => s.id === id)
}

function rsFindArtifactById(id: string): RsArtifact | undefined {
  return RS_ARTIFACTS.find((a) => a.id === id)
}

function rsFindAltarById(id: string): RsAltar | undefined {
  return RS_ALTARS.find((a) => a.id === id)
}

function rsFindAchievementById(id: string): RsAchievement | undefined {
  return RS_ACHIEVEMENTS.find((a) => a.id === id)
}

function rsFindTitleForLevel(level: number): RsTitle {
  let best = RS_TITLES[0]
  for (const title of RS_TITLES) {
    if (level >= title.requiredLevel) {
      best = title
    } else {
      break
    }
  }
  return best
}

function rsCheckAchievementConditions(state: RuneSanctuaryState): string[] {
  const newlyUnlocked: string[] = []

  const check = (id: string, condition: () => boolean) => {
    if (!state.unlockedAchievements.includes(id) && condition()) {
      newlyUnlocked.push(id)
    }
  }

  check('first-inscription', () => state.totalRunesInscribed >= 1)
  check('ten-runes-inscribed', () => state.inscribedRunes.length >= 10)

  const fireRunes = RS_RUNES.filter((r) => r.element === 'fire')
  check('all-fire-runes', () => fireRunes.every((r) => state.inscribedRunes.includes(r.id)))

  const waterRunes = RS_RUNES.filter((r) => r.element === 'water')
  check('all-water-runes', () => waterRunes.every((r) => state.inscribedRunes.includes(r.id)))

  const earthRunes = RS_RUNES.filter((r) => r.element === 'earth')
  check('all-earth-runes', () => earthRunes.every((r) => state.inscribedRunes.includes(r.id)))

  const airRunes = RS_RUNES.filter((r) => r.element === 'air')
  check('all-air-runes', () => airRunes.every((r) => state.inscribedRunes.includes(r.id)))

  const lightRunes = RS_RUNES.filter((r) => r.element === 'light')
  check('all-light-runes', () => lightRunes.every((r) => state.inscribedRunes.includes(r.id)))

  const shadowRunes = RS_RUNES.filter((r) => r.element === 'shadow')
  check('all-shadow-runes', () => shadowRunes.every((r) => state.inscribedRunes.includes(r.id)))

  check('first-altar-blessing', () => state.totalAltarBlessings >= 1)
  check('all-altars-blessed', () => RS_ALTARS.every((a) => state.altarBlessings[a.id]?.blessed))

  check('first-scroll-crafted', () => state.totalScrollsCrafted >= 1)
  check('ten-scrolls-crafted', () => state.craftedScrolls.length >= 10)

  check('first-artifact-enchanted', () => state.totalArtifactsEnchanted >= 1)
  check('ten-artifacts-enchanted', () => state.enchantedArtifacts.length >= 10)

  check('meditation-streak-7', () => state.meditationStreak >= 7)
  check('meditation-streak-30', () => state.meditationStreak >= 30)

  check('level-25-reached', () => state.level >= 25)
  check('level-50-reached', () => state.level >= RS_MAX_LEVEL)
  check('sanctum-power-1000', () => state.sanctumPower >= 1000)

  const legendaryRunes = RS_RUNES.filter((r) => r.rarity === 'legendary')
  const legendaryScrolls = RS_SCROLLS.filter((s) => s.rarity === 'legendary')
  const legendaryArtifacts = RS_ARTIFACTS.filter((a) => a.rarity === 'legendary')
  const hasAllLegendary =
    legendaryRunes.every((r) => state.inscribedRunes.includes(r.id)) &&
    legendaryScrolls.every((s) => state.craftedScrolls.includes(s.id)) &&
    legendaryArtifacts.every((a) => state.enchantedArtifacts.includes(a.id))
  check('legendary-collection', () => hasAllLegendary)

  return newlyUnlocked
}

// ─── The Hook ─────────────────────────────────────────────────────

export default function useRuneSanctuary() {
  const [state, setState] = useState<RuneSanctuaryState>(RS_DEFAULT_STATE)
  const stateRef = useRef<RuneSanctuaryState>(state)

  // Sync stateRef
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = rsLoadState()
    setState(loaded)
  }, [])

  // Auto-save whenever state changes
  useEffect(() => {
    if (state.updatedAt !== RS_DEFAULT_STATE.updatedAt) {
      rsSaveState(state)
    }
  }, [state])

  // ── Internal helpers ──────────────────────────────────────────

  const rsAddXp = useCallback(
    (amount: number) => {
      const rarityMult = 1
      const total = Math.floor(amount * rarityMult)
      setState((prev) => {
        const newXp = prev.xp + total
        const newLevel = rsCalculateLevel(newXp)
        return {
          ...prev,
          xp: newXp,
          level: Math.min(newLevel, RS_MAX_LEVEL),
        }
      })
      return total
    },
    []
  )

  const rsCheckAndUnlockAchievements = useCallback(() => {
    const current = stateRef.current
    const newIds = rsCheckAchievementConditions(current)
    if (newIds.length === 0) return []

    setState((prev) => {
      let xpReward = 0
      let powerReward = 0
      for (const id of newIds) {
        const ach = rsFindAchievementById(id)
        if (ach) {
          if (ach.reward.type === 'xp') xpReward += ach.reward.value
          if (ach.reward.type === 'sanctum_power') powerReward += ach.reward.value
        }
      }
      const newXp = prev.xp + xpReward
      const newLevel = rsCalculateLevel(newXp)
      return {
        ...prev,
        xp: newXp,
        level: Math.min(newLevel, RS_MAX_LEVEL),
        sanctumPower: prev.sanctumPower + powerReward,
        unlockedAchievements: [...prev.unlockedAchievements, ...newIds],
      }
    })
    return newIds
  }, [])

  // ── Plain getters ─────────────────────────────────────────────

  const rsGetLevel = (): number => state.level

  const rsGetXp = (): number => state.xp

  const rsGetXpToNext = (): number => {
    if (state.level >= RS_MAX_LEVEL) return 0
    return rsGetXpForNextLevel(state.level) - state.xp
  }

  const rsGetXpProgress = (): number => {
    if (state.level >= RS_MAX_LEVEL) return 1
    const currentThreshold = rsGetXpForLevel(state.level)
    const nextThreshold = rsGetXpForNextLevel(state.level)
    const range = nextThreshold - currentThreshold
    if (range <= 0) return 1
    return Math.min((state.xp - currentThreshold) / range, 1)
  }

  const rsGetInscribedRunes = (): string[] => state.inscribedRunes

  const rsGetRunes = (): RsRune[] => RS_RUNES

  const rsGetRuneById = (id: string): RsRune | undefined => rsFindRuneById(id)

  const rsGetRunesByElement = (element: RsElement): RsRune[] =>
    RS_RUNES.filter((r) => r.element === element)

  const rsGetRunesByRarity = (rarity: RsRarityKey): RsRune[] =>
    RS_RUNES.filter((r) => r.rarity === rarity)

  const rsGetAltar = (id: string): RsAltar | undefined => rsFindAltarById(id)

  const rsGetAltars = (): RsAltar[] => RS_ALTARS

  const rsGetAltarBlessing = (id: string): RsAltarBlessing | undefined =>
    state.altarBlessings[id]

  const rsGetAltarBonuses = (): Record<string, RsAltarBlessing> => state.altarBlessings

  const rsGetCraftedScrolls = (): string[] => state.craftedScrolls

  const rsGetScrolls = (): RsScroll[] => RS_SCROLLS

  const rsGetScrollById = (id: string): RsScroll | undefined => rsFindScrollById(id)

  const rsGetScrollsByElement = (element: RsElement): RsScroll[] =>
    RS_SCROLLS.filter((s) => s.element === element)

  const rsGetScrollsByRarity = (rarity: RsRarityKey): RsScroll[] =>
    RS_SCROLLS.filter((s) => s.rarity === rarity)

  const rsGetEnchantedArtifacts = (): string[] => state.enchantedArtifacts

  const rsGetArtifacts = (): RsArtifact[] => RS_ARTIFACTS

  const rsGetArtifactById = (id: string): RsArtifact | undefined => rsFindArtifactById(id)

  const rsGetArtifactsByType = (type: RsArtifact['type']): RsArtifact[] =>
    RS_ARTIFACTS.filter((a) => a.type === type)

  const rsGetArtifactsByElement = (element: RsElement): RsArtifact[] =>
    RS_ARTIFACTS.filter((a) => a.element === element)

  const rsGetTitles = (): RsTitle[] => RS_TITLES

  const rsGetTitle = (): RsTitle => rsFindTitleForLevel(state.level)

  const rsGetNextTitle = (): RsTitle | undefined => {
    for (const title of RS_TITLES) {
      if (title.requiredLevel > state.level) return title
    }
    return undefined
  }

  const rsGetAchievements = (): RsAchievement[] => RS_ACHIEVEMENTS

  const rsGetUnlockedAchievements = (): string[] => state.unlockedAchievements

  const rsGetAchievementById = (id: string): RsAchievement | undefined =>
    rsFindAchievementById(id)

  const rsGetMeditationStreak = (): number => state.meditationStreak

  const rsGetLastMeditationDate = (): string => state.lastMeditationDate

  const rsGetSanctumPower = (): number => state.sanctumPower

  const rsGetRarityColor = (rarity: RsRarityKey): string => RS_RARITY[rarity].color

  const rsGetRarityInfo = (rarity: RsRarityKey): RsRarityInfo => RS_RARITY[rarity]

  const rsGetElementColor = (element: RsElement): string => RS_ELEMENT_COLORS[element]

  const rsGetElementGlow = (element: RsElement): string => RS_ELEMENT_GLOWS[element]

  const rsGetMaxLevel = (): number => RS_MAX_LEVEL

  const rsGetXpTable = (): number[] => RS_XP_TABLE

  const rsGetRuneCount = (): number => state.inscribedRunes.length

  const rsGetAltarCount = (): number =>
    RS_ALTARS.filter((a) => state.altarBlessings[a.id]?.blessed).length

  const rsGetScrollCount = (): number => state.craftedScrolls.length

  const rsGetArtifactCount = (): number => state.enchantedArtifacts.length

  const rsGetAchievementCount = (): number => state.unlockedAchievements.length

  const rsGetTotalXpEarned = (): number => state.xp

  const rsGetTotalMeditations = (): number => state.totalMeditations

  const rsGetTotalRunesInscribed = (): number => state.totalRunesInscribed

  const rsGetTotalScrollsCrafted = (): number => state.totalScrollsCrafted

  const rsGetTotalArtifactsEnchanted = (): number => state.totalArtifactsEnchanted

  const rsGetTotalAltarBlessings = (): number => state.totalAltarBlessings

  const rsGetStats = () => ({
    level: state.level,
    xp: state.xp,
    sanctumPower: state.sanctumPower,
    runesInscribed: state.inscribedRunes.length,
    altarsBlessed: RS_ALTARS.filter((a) => state.altarBlessings[a.id]?.blessed).length,
    scrollsCrafted: state.craftedScrolls.length,
    artifactsEnchanted: state.enchantedArtifacts.length,
    achievementsUnlocked: state.unlockedAchievements.length,
    meditationStreak: state.meditationStreak,
    totalMeditations: state.totalMeditations,
    completionPercentage: rsGetCompletionPercentage(),
  })

  const rsGetCompletionPercentage = (): number => {
    const runeWeight = 40
    const altarWeight = 15
    const scrollWeight = 20
    const artifactWeight = 15
    const achievementWeight = 10
    const total = runeWeight + altarWeight + scrollWeight + artifactWeight + achievementWeight

    const runePct = RS_RUNES.length > 0 ? state.inscribedRunes.length / RS_RUNES.length : 0
    const altarPct =
      RS_ALTARS.length > 0
        ? RS_ALTARS.filter((a) => state.altarBlessings[a.id]?.blessed).length / RS_ALTARS.length
        : 0
    const scrollPct =
      RS_SCROLLS.length > 0 ? state.craftedScrolls.length / RS_SCROLLS.length : 0
    const artifactPct =
      RS_ARTIFACTS.length > 0 ? state.enchantedArtifacts.length / RS_ARTIFACTS.length : 0
    const achievementPct =
      RS_ACHIEVEMENTS.length > 0
        ? state.unlockedAchievements.length / RS_ACHIEVEMENTS.length
        : 0

    const score =
      runePct * runeWeight +
      altarPct * altarWeight +
      scrollPct * scrollWeight +
      artifactPct * artifactWeight +
      achievementPct * achievementWeight

    return Math.min(Math.round((score / total) * 100), 100)
  }

  const rsGetElementBonus = (element: RsElement): number => {
    const altar = RS_ALTARS.find((a) => a.element === element)
    if (!altar) return 0
    const blessing = state.altarBlessings[altar.id]
    if (!blessing || !blessing.blessed) return 0
    return blessing.blessingCount * 0.2
  }

  const rsGetRunePowerLevel = (runeId: string): number => {
    const rune = rsFindRuneById(runeId)
    if (!rune) return 0
    const hasRune = state.inscribedRunes.includes(runeId)
    if (!hasRune) return 0
    const rarityMult = RS_RARITY[rune.rarity].xpMultiplier
    const altarBonus = rsGetElementBonus(rune.element)
    return Math.floor(rune.power * rarityMult * (1 + altarBonus))
  }

  const rsGetScrollEffectPower = (scrollId: string): number => {
    const scroll = rsFindScrollById(scrollId)
    if (!scroll) return 0
    const hasScroll = state.craftedScrolls.includes(scrollId)
    if (!hasScroll) return 0
    const rarityMult = RS_RARITY[scroll.rarity].xpMultiplier
    const altarBonus = rsGetElementBonus(scroll.element)
    return Math.floor(scroll.power * rarityMult * (1 + altarBonus))
  }

  const rsGetArtifactEnchantmentPower = (artifactId: string): number => {
    const artifact = rsFindArtifactById(artifactId)
    if (!artifact) return 0
    const hasArtifact = state.enchantedArtifacts.includes(artifactId)
    if (!hasArtifact) return 0
    const rarityMult = RS_RARITY[artifact.rarity].xpMultiplier
    const altarBonus = rsGetElementBonus(artifact.element)
    return Math.floor(artifact.power * rarityMult * (1 + altarBonus))
  }

  const rsGetMeditationBonus = (): number => {
    return state.meditationStreak * RS_MEDITATION_STREAK_BONUS
  }

  const rsIsActive = (): boolean => {
    return (
      state.inscribedRunes.length > 0 ||
      Object.keys(state.altarBlessings).length > 0 ||
      state.craftedScrolls.length > 0 ||
      state.enchantedArtifacts.length > 0 ||
      state.totalMeditations > 0
    )
  }

  const rsIsMeditationAvailable = (): boolean => {
    const today = rsGetTodayString()
    return state.lastMeditationDate !== today
  }

  const rsHasRune = (id: string): boolean => state.inscribedRunes.includes(id)

  const rsHasScroll = (id: string): boolean => state.craftedScrolls.includes(id)

  const rsHasArtifact = (id: string): boolean => state.enchantedArtifacts.includes(id)

  const rsHasAchievement = (id: string): boolean => state.unlockedAchievements.includes(id)

  const rsCanInscribeRune = (id: string): boolean => {
    if (!rsFindRuneById(id)) return false
    return !state.inscribedRunes.includes(id)
  }

  const rsCanBlessAltar = (id: string): boolean => {
    const altar = rsFindAltarById(id)
    if (!altar) return false
    const blessing = state.altarBlessings[id]
    if (!blessing) return true
    return blessing.blessingCount < altar.maxBlessing
  }

  const rsCanCraftScroll = (id: string): boolean => {
    if (!rsFindScrollById(id)) return false
    return !state.craftedScrolls.includes(id)
  }

  const rsCanEnchantArtifact = (id: string): boolean => {
    if (!rsFindArtifactById(id)) return false
    return !state.enchantedArtifacts.includes(id)
  }

  const rsGetRunesMatching = (filter: {
    element?: RsElement
    rarity?: RsRarityKey
    inscribed?: boolean
    notInscribed?: boolean
  }): RsRune[] => {
    return RS_RUNES.filter((r) => {
      if (filter.element && r.element !== filter.element) return false
      if (filter.rarity && r.rarity !== filter.rarity) return false
      if (filter.inscribed && !state.inscribedRunes.includes(r.id)) return false
      if (filter.notInscribed && state.inscribedRunes.includes(r.id)) return false
      return true
    })
  }

  const rsGetDailyRewards = (): { xp: number; sanctumPower: number; bonusXp: number } => {
    const streakBonus = state.meditationStreak * RS_MEDITATION_STREAK_BONUS
    const meditationXp = RS_MEDITATION_BASE_XP + streakBonus
    const sanctumPowerReward = Math.floor(meditationXp * 0.5)
    return {
      xp: RS_MEDITATION_BASE_XP,
      sanctumPower: sanctumPowerReward,
      bonusXp: streakBonus,
    }
  }

  const rsGetRuneSynergy = (runeIds: string[]): number => {
    const runes = runeIds.map((id) => rsFindRuneById(id)).filter(Boolean) as RsRune[]
    if (runes.length < 2) return 0
    const elementCounts: Record<string, number> = {}
    for (const rune of runes) {
      elementCounts[rune.element] = (elementCounts[rune.element] || 0) + 1
    }
    const maxSameElement = Math.max(...Object.values(elementCounts))
    let synergy = 0
    if (maxSameElement >= 3) synergy += 0.25
    if (maxSameElement >= 2) synergy += 0.1
    const uniqueElements = Object.keys(elementCounts).length
    if (uniqueElements >= 4) synergy += 0.2
    if (uniqueElements >= 6) synergy += 0.15
    return Math.min(synergy, 0.75)
  }

  const rsGetTotalPower = (): number => {
    let total = 0
    for (const runeId of state.inscribedRunes) {
      total += rsGetRunePowerLevel(runeId)
    }
    for (const scrollId of state.craftedScrolls) {
      total += rsGetScrollEffectPower(scrollId)
    }
    for (const artifactId of state.enchantedArtifacts) {
      total += rsGetArtifactEnchantmentPower(artifactId)
    }
    return total
  }

  // ── State modifiers with useCallback ──────────────────────────

  const rsInscribeRune = useCallback(
    (id: string): { success: boolean; xpGained: number; message: string } => {
      const rune = rsFindRuneById(id)
      if (!rune) return { success: false, xpGained: 0, message: 'Unknown rune.' }
      if (state.inscribedRunes.includes(id)) {
        return { success: false, xpGained: 0, message: 'Rune already inscribed.' }
      }
      const rarityMult = RS_RARITY[rune.rarity].xpMultiplier
      const xpGained = Math.floor(RS_INSCRIBE_BASE_XP * rarityMult)
      const powerGained = Math.floor(rune.power * rarityMult * 0.3)

      setState((prev) => ({
        ...prev,
        inscribedRunes: [...prev.inscribedRunes, id],
        totalRunesInscribed: prev.totalRunesInscribed + 1,
        xp: prev.xp + xpGained,
        level: rsCalculateLevel(prev.xp + xpGained),
        sanctumPower: prev.sanctumPower + powerGained,
      }))

      return {
        success: true,
        xpGained,
        message: `Inscribed ${rune.name} (${rune.symbol}) — ${rune.description}`,
      }
    },
    [state.inscribedRunes]
  )

  const rsBlessAltar = useCallback(
    (id: string): { success: boolean; xpGained: number; message: string } => {
      const altar = rsFindAltarById(id)
      if (!altar) return { success: false, xpGained: 0, message: 'Unknown altar.' }
      const existing = state.altarBlessings[id]
      if (existing && existing.blessingCount >= altar.maxBlessing) {
        return { success: false, xpGained: 0, message: 'Altar already at maximum blessing.' }
      }
      const currentCount = existing ? existing.blessingCount : 0
      const xpGained = RS_ALTAR_BASE_XP + currentCount * 10
      const bonusPower = 10 + currentCount * 5

      setState((prev) => ({
        ...prev,
        altarBlessings: {
          ...prev.altarBlessings,
          [id]: {
            blessed: true,
            blessingCount: currentCount + 1,
            lastBlessedAt: new Date().toISOString(),
            bonusPower: bonusPower,
          },
        },
        totalAltarBlessings: prev.totalAltarBlessings + 1,
        xp: prev.xp + xpGained,
        level: rsCalculateLevel(prev.xp + xpGained),
        sanctumPower: prev.sanctumPower + Math.floor(bonusPower * 0.5),
      }))

      return {
        success: true,
        xpGained,
        message: `Blessed ${altar.name} (level ${currentCount + 1}/${altar.maxBlessing})`,
      }
    },
    [state.altarBlessings]
  )

  const rsCraftScroll = useCallback(
    (id: string): { success: boolean; xpGained: number; message: string } => {
      const scroll = rsFindScrollById(id)
      if (!scroll) return { success: false, xpGained: 0, message: 'Unknown scroll.' }
      if (state.craftedScrolls.includes(id)) {
        return { success: false, xpGained: 0, message: 'Scroll already crafted.' }
      }
      const rarityMult = RS_RARITY[scroll.rarity].xpMultiplier
      const xpGained = Math.floor(RS_CRAFT_BASE_XP * rarityMult)
      const powerGained = Math.floor(scroll.power * rarityMult * 0.25)

      setState((prev) => ({
        ...prev,
        craftedScrolls: [...prev.craftedScrolls, id],
        totalScrollsCrafted: prev.totalScrollsCrafted + 1,
        xp: prev.xp + xpGained,
        level: rsCalculateLevel(prev.xp + xpGained),
        sanctumPower: prev.sanctumPower + powerGained,
      }))

      return {
        success: true,
        xpGained,
        message: `Crafted ${scroll.name} — ${scroll.description}`,
      }
    },
    [state.craftedScrolls]
  )

  const rsEnchantArtifact = useCallback(
    (id: string): { success: boolean; xpGained: number; message: string } => {
      const artifact = rsFindArtifactById(id)
      if (!artifact) return { success: false, xpGained: 0, message: 'Unknown artifact.' }
      if (state.enchantedArtifacts.includes(id)) {
        return { success: false, xpGained: 0, message: 'Artifact already enchanted.' }
      }
      const rarityMult = RS_RARITY[artifact.rarity].xpMultiplier
      const xpGained = Math.floor(RS_ENCHANT_BASE_XP * rarityMult)
      const powerGained = Math.floor(artifact.power * rarityMult * 0.35)

      setState((prev) => ({
        ...prev,
        enchantedArtifacts: [...prev.enchantedArtifacts, id],
        totalArtifactsEnchanted: prev.totalArtifactsEnchanted + 1,
        xp: prev.xp + xpGained,
        level: rsCalculateLevel(prev.xp + xpGained),
        sanctumPower: prev.sanctumPower + powerGained,
      }))

      return {
        success: true,
        xpGained,
        message: `Enchanted ${artifact.name} — ${artifact.description}`,
      }
    },
    [state.enchantedArtifacts]
  )

  const rsMeditate = useCallback((): RsMeditationResult => {
    const today = rsGetTodayString()
    const yesterday = rsGetYesterdayString()
    const isConsecutive = state.lastMeditationDate === yesterday
    const isAlreadyDone = state.lastMeditationDate === today

    if (isAlreadyDone) {
      return {
        xpGained: 0,
        sanctumPowerGained: 0,
        elementBonus: null,
        messages: ['You have already meditated today. Return tomorrow.'],
      }
    }

    const newStreak = isConsecutive ? state.meditationStreak + 1 : 1
    const streakBonus = newStreak * RS_MEDITATION_STREAK_BONUS
    const xpGained = RS_MEDITATION_BASE_XP + streakBonus
    const sanctumPowerGained = Math.floor(xpGained * 0.5)
    const messages: string[] = []

    messages.push(`Meditation complete. +${xpGained} XP, +${sanctumPowerGained} Sanctum Power.`)

    if (newStreak > state.meditationStreak && state.meditationStreak > 0) {
      messages.push(`Streak extended to ${newStreak} day${newStreak !== 1 ? 's' : ''}!`)
    } else if (newStreak === 1 && state.meditationStreak === 0) {
      messages.push('Your meditation journey begins.')
    } else if (!isConsecutive && state.meditationStreak > 0) {
      messages.push(`Streak reset. A new ${newStreak}-day streak begins.`)
    }

    // Random element bonus based on inscribed runes
    let elementBonus: string | null = null
    if (state.inscribedRunes.length > 0) {
      const randomIndex = Math.floor(Math.random() * state.inscribedRunes.length)
      const randomRuneId = state.inscribedRunes[randomIndex]
      const randomRune = rsFindRuneById(randomRuneId)
      if (randomRune) {
        elementBonus = randomRune.element
        const bonusXp = Math.floor(xpGained * 0.1)
        messages.push(
          `${randomRune.name} resonates during meditation — +${bonusXp} bonus ${randomRune.element} XP.`
        )
      }
    }

    if (newStreak >= 7) {
      messages.push('The sanctuary hums with the power of your devotion.')
    }
    if (newStreak >= 30) {
      messages.push('Your meditative aura is visible to all who enter the sanctuary.')
    }

    setState((prev) => ({
      ...prev,
      meditationStreak: newStreak,
      lastMeditationDate: today,
      totalMeditations: prev.totalMeditations + 1,
      xp: prev.xp + xpGained,
      level: rsCalculateLevel(prev.xp + xpGained),
      sanctumPower: prev.sanctumPower + sanctumPowerGained,
    }))

    return {
      xpGained,
      sanctumPowerGained,
      elementBonus,
      messages,
    }
  }, [state.lastMeditationDate, state.meditationStreak, state.inscribedRunes])

  const rsAddSanctumPower = useCallback((amount: number): number => {
    setState((prev) => ({
      ...prev,
      sanctumPower: prev.sanctumPower + amount,
    }))
    return amount
  }, [])

  const rsBatchInscribe = useCallback(
    (ids: string[]): { succeeded: string[]; failed: string[]; totalXp: number } => {
      const succeeded: string[] = []
      const failed: string[] = []
      let totalXp = 0

      for (const id of ids) {
        const rune = rsFindRuneById(id)
        if (!rune || state.inscribedRunes.includes(id)) {
          failed.push(id)
          continue
        }
        succeeded.push(id)
        const rarityMult = RS_RARITY[rune.rarity].xpMultiplier
        totalXp += Math.floor(RS_INSCRIBE_BASE_XP * rarityMult)
      }

      if (succeeded.length > 0) {
        setState((prev) => ({
          ...prev,
          inscribedRunes: [...prev.inscribedRunes, ...succeeded],
          totalRunesInscribed: prev.totalRunesInscribed + succeeded.length,
          xp: prev.xp + totalXp,
          level: rsCalculateLevel(prev.xp + totalXp),
          sanctumPower:
            prev.sanctumPower +
            succeeded.reduce((sum, runeId) => {
              const r = rsFindRuneById(runeId)
              if (!r) return sum
              return sum + Math.floor(r.power * RS_RARITY[r.rarity].xpMultiplier * 0.3)
            }, 0),
        }))
      }

      return { succeeded, failed, totalXp }
    },
    [state.inscribedRunes]
  )

  const rsRemoveInscribedRune = useCallback(
    (id: string): boolean => {
      if (!state.inscribedRunes.includes(id)) return false
      setState((prev) => ({
        ...prev,
        inscribedRunes: prev.inscribedRunes.filter((r) => r !== id),
      }))
      return true
    },
    [state.inscribedRunes]
  )

  const rsRemoveCraftedScroll = useCallback(
    (id: string): boolean => {
      if (!state.craftedScrolls.includes(id)) return false
      setState((prev) => ({
        ...prev,
        craftedScrolls: prev.craftedScrolls.filter((s) => s !== id),
      }))
      return true
    },
    [state.craftedScrolls]
  )

  const rsRemoveEnchantedArtifact = useCallback(
    (id: string): boolean => {
      if (!state.enchantedArtifacts.includes(id)) return false
      setState((prev) => ({
        ...prev,
        enchantedArtifacts: prev.enchantedArtifacts.filter((a) => a !== id),
      }))
      return true
    },
    [state.enchantedArtifacts]
  )

  // ── Plain reset (NO useCallback) ──────────────────────────────

  const rsResetProgress = (): void => {
    const fresh = { ...RS_DEFAULT_STATE, createdAt: new Date().toISOString() }
    setState(fresh)
    stateRef.current = fresh
    rsSaveState(fresh)
  }

  // ── Hook Return Object ────────────────────────────────────────

  return {
    // State accessors
    rsGetLevel,
    rsGetXp,
    rsGetXpToNext,
    rsGetXpProgress,
    rsGetInscribedRunes,
    rsGetRunes,
    rsGetRuneById,
    rsGetRunesByElement,
    rsGetRunesByRarity,
    rsGetRunesMatching,
    rsGetRuneCount,
    rsGetRunePowerLevel,
    rsGetRuneSynergy,
    rsGetAltar,
    rsGetAltars,
    rsGetAltarBlessing,
    rsGetAltarBonuses,
    rsGetAltarCount,
    rsGetCraftedScrolls,
    rsGetScrolls,
    rsGetScrollById,
    rsGetScrollsByElement,
    rsGetScrollsByRarity,
    rsGetScrollCount,
    rsGetScrollEffectPower,
    rsGetEnchantedArtifacts,
    rsGetArtifacts,
    rsGetArtifactById,
    rsGetArtifactsByType,
    rsGetArtifactsByElement,
    rsGetArtifactCount,
    rsGetArtifactEnchantmentPower,
    rsGetTitles,
    rsGetTitle,
    rsGetNextTitle,
    rsGetAchievements,
    rsGetUnlockedAchievements,
    rsGetAchievementById,
    rsGetAchievementCount,
    rsGetMeditationStreak,
    rsGetLastMeditationDate,
    rsGetMeditationBonus,
    rsGetSanctumPower,
    rsGetTotalXpEarned,
    rsGetTotalMeditations,
    rsGetTotalRunesInscribed,
    rsGetTotalScrollsCrafted,
    rsGetTotalArtifactsEnchanted,
    rsGetTotalAltarBlessings,
    rsGetTotalPower,
    rsGetStats,
    rsGetCompletionPercentage,
    rsGetElementBonus,
    rsGetElementColor,
    rsGetElementGlow,
    rsGetRarityColor,
    rsGetRarityInfo,
    rsGetMaxLevel,
    rsGetXpTable,
    rsGetDailyRewards,
    rsIsActive,
    rsIsMeditationAvailable,
    rsHasRune,
    rsHasScroll,
    rsHasArtifact,
    rsHasAchievement,
    rsCanInscribeRune,
    rsCanBlessAltar,
    rsCanCraftScroll,
    rsCanEnchantArtifact,
    // State modifiers
    rsInscribeRune,
    rsBlessAltar,
    rsCraftScroll,
    rsEnchantArtifact,
    rsMeditate,
    rsAddXp,
    rsAddSanctumPower,
    rsBatchInscribe,
    rsCheckAndUnlockAchievements,
    rsRemoveInscribedRune,
    rsRemoveCraftedScroll,
    rsRemoveEnchantedArtifact,
    // Plain reset
    rsResetProgress,
  }
}
