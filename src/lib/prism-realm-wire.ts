'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'

/* ================================================================
   PRISM REALM (棱镜领域) — Wire Hook
   A dimension of pure light and color where players collect
   prismatic crystals, bend light rays, create color combinations,
   and unlock the secrets of the spectrum.
   Color theme: spectrum rainbow
   ================================================================ */

// ─── Type Definitions ─────────────────────────────────────────────

type PrRarityKey = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

type PrColorBand = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'indigo' | 'violet' | 'white'

interface PrRarityInfo {
  key: PrRarityKey
  label: string
  color: string
  glow: string
  energyMultiplier: number
  dropWeight: number
}

interface PrCrystal {
  id: string
  name: string
  rarity: PrRarityKey
  colorBand: PrColorBand
  power: number
  description: string
  lore: string
}

interface PrChamber {
  id: string
  name: string
  colorBand: PrColorBand
  description: string
  requiredFame: number
  bonusType: string
  bonusAmount: number
  icon: string
}

interface PrInstrument {
  id: string
  name: string
  description: string
  effect: string
  cost: number
  power: number
  icon: string
}

interface PrStructureDef {
  id: string
  name: string
  description: string
  maxLevel: number
  baseCost: number
  costPerLevel: number
  effectPerLevel: string
  icon: string
}

interface PrAbilityDef {
  id: string
  name: string
  description: string
  energyCost: number
  cooldown: number
  effect: string
  unlockFame: number
  icon: string
}

interface PrAchievementDef {
  id: string
  name: string
  description: string
  icon: string
  condition: string
  reward: { type: string; value: number }
}

interface PrTitleDef {
  id: string
  name: string
  requiredFame: number
  description: string
  color: string
}

interface PrStructureState {
  [structureId: string]: number // level 0-10
}

interface PrDailyLightTask {
  date: string
  target: number
  current: number
  completed: boolean
  rewardClaimed: boolean
  description: string
}

interface PrismRealmState {
  crystalsCollected: string[]
  chambersVisited: string[]
  instrumentsOwned: string[]
  structures: PrStructureState
  abilitiesLearned: string[]
  achievementsUnlocked: string[]
  currentChamber: string
  lightEnergy: number
  colorCharge: Record<PrColorBand, number>
  spectrumScore: number
  titleIndex: number
  realmFame: number
  wavelengthBalance: number
  dailyLightTask: PrDailyLightTask
  totalCrystalsCollected: number
  totalLightRefracted: number
  totalColorsMixed: number
  totalStructuresUpgraded: number
  totalAbilitiesActivated: number
  totalLensesCalibrated: number
  totalSpectraScanned: number
  totalLightAmplified: number
  totalRaysBent: number
  totalChambersExplored: number
  createdAt: string
  updatedAt: string
}

// ─── Rarity Data ─────────────────────────────────────────────────

const PR_RARITY: Record<PrRarityKey, PrRarityInfo> = {
  common: {
    key: 'common',
    label: 'Common',
    color: '#9CA3AF',
    glow: 'rgba(156,163,175,0.3)',
    energyMultiplier: 1,
    dropWeight: 40,
  },
  uncommon: {
    key: 'uncommon',
    label: 'Uncommon',
    color: '#818CF8',
    glow: 'rgba(129,140,248,0.35)',
    energyMultiplier: 1.5,
    dropWeight: 30,
  },
  rare: {
    key: 'rare',
    label: 'Rare',
    color: '#00E676',
    glow: 'rgba(0,230,118,0.4)',
    energyMultiplier: 2.5,
    dropWeight: 18,
  },
  epic: {
    key: 'epic',
    label: 'Epic',
    color: '#D500F9',
    glow: 'rgba(213,0,249,0.45)',
    energyMultiplier: 4,
    dropWeight: 9,
  },
  legendary: {
    key: 'legendary',
    label: 'Legendary',
    color: '#FFD600',
    glow: 'rgba(255,214,0,0.5)',
    energyMultiplier: 7,
    dropWeight: 3,
  },
}

const PR_RARITY_ORDER: PrRarityKey[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
]

// ─── Spectrum Colors ─────────────────────────────────────────────

const PR_SPECTRUM_COLORS: Record<PrColorBand, string> = {
  red: '#FF1744',
  orange: '#FF9100',
  yellow: '#FFD600',
  green: '#00E676',
  blue: '#2979FF',
  indigo: '#651FFF',
  violet: '#D500F9',
  white: '#FFFFFF',
}

const PR_SPECTRUM_GLOWS: Record<PrColorBand, string> = {
  red: 'rgba(255,23,68,0.4)',
  orange: 'rgba(255,145,0,0.4)',
  yellow: 'rgba(255,214,0,0.4)',
  green: 'rgba(0,230,118,0.4)',
  blue: 'rgba(41,121,255,0.4)',
  indigo: 'rgba(101,31,255,0.4)',
  violet: 'rgba(213,0,249,0.4)',
  white: 'rgba(255,255,255,0.3)',
}

const PR_COLOR_BANDS: PrColorBand[] = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'indigo',
  'violet',
  'white',
]

// ─── Theme ───────────────────────────────────────────────────────

const PR_THEME = {
  primary: '#FF1744',
  secondary: '#2979FF',
  accent: '#FFD600',
  background: '#0A0A1A',
  surface: '#12122A',
  surfaceLight: '#1E1E3E',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888BB',
  border: '#2A2A5A',
  borderLight: '#3A3A7A',
  rainbow: ['#FF1744', '#FF9100', '#FFD600', '#00E676', '#2979FF', '#651FFF', '#D500F9'],
}

// ─── 35 Prismatic Crystals ──────────────────────────────────────

const PR_CRYSTALS: PrCrystal[] = [
  // Common (7)
  {
    id: 'ruby-shard',
    name: 'Ruby Shard',
    rarity: 'common',
    colorBand: 'red',
    power: 8,
    description: 'A sharp fragment of crystallized ruby, radiating warm crimson light.',
    lore: 'Born deep within the Red Refraction Hall, these shards pulse with the heartbeat of ancient fire.',
  },
  {
    id: 'crimson-pulse',
    name: 'Crimson Pulse',
    rarity: 'common',
    colorBand: 'red',
    power: 9,
    description: 'A rhythmic crystal that emits pulses of deep crimson energy.',
    lore: 'The Crimson Pulse syncs with the realm\'s frequency, glowing brighter near sources of raw light energy.',
  },
  {
    id: 'rose-prism',
    name: 'Rose Prism',
    rarity: 'common',
    colorBand: 'red',
    power: 7,
    description: 'A delicate pink-tinted prism that softens harsh light into gentle warmth.',
    lore: 'Crafted by the first Light Initiates, the Rose Prism represents compassion in the spectrum.',
  },
  {
    id: 'garnet-fragment',
    name: 'Garnet Fragment',
    rarity: 'common',
    colorBand: 'red',
    power: 10,
    description: 'A dense garnet shard with deep, wine-dark refraction properties.',
    lore: 'Garnet Fragments are remnants of the original prism that shattered to create the seven chambers.',
  },
  {
    id: 'carnelian-glow',
    name: 'Carnelian Glow',
    rarity: 'common',
    colorBand: 'orange',
    power: 8,
    description: 'A warm carnelian crystal that bathes its surroundings in amber radiance.',
    lore: 'Found near the Orange Diffusion Room, Carnelian Glows are prized for their steady, comforting light.',
  },
  {
    id: 'beryl-chip',
    name: 'Beryl Chip',
    rarity: 'common',
    colorBand: 'green',
    power: 9,
    description: 'A small chip of aquamarine beryl with faint green luminescence.',
    lore: 'Though small, Beryl Chips carry the signature frequency of the Green Transmission Bay.',
  },
  {
    id: 'red-jasper-spark',
    name: 'Red Jasper Spark',
    rarity: 'common',
    colorBand: 'red',
    power: 7,
    description: 'A rough jasper stone that produces tiny sparks when struck by light.',
    lore: 'Jasper Sparks are used as kindling in the Light Forge to ignite larger crystal reactions.',
  },
  // Uncommon (7)
  {
    id: 'sapphire-prism',
    name: 'Sapphire Prism',
    rarity: 'uncommon',
    colorBand: 'blue',
    power: 15,
    description: 'A flawless sapphire cut into a precise triangular prism shape.',
    lore: 'The Sapphire Prism was the first instrument used to prove that white light contains all colors.',
  },
  {
    id: 'aqua-beam',
    name: 'Aqua Beam',
    rarity: 'uncommon',
    colorBand: 'blue',
    power: 14,
    description: 'An elongated aquamarine crystal that projects a concentrated beam of blue light.',
    lore: 'When aligned with the Blue Scattering Chamber, the Aqua Beam reveals hidden pathways.',
  },
  {
    id: 'blue-topaz-shift',
    name: 'Blue Topaz Shift',
    rarity: 'uncommon',
    colorBand: 'indigo',
    power: 16,
    description: 'A topaz crystal that shifts between blue and indigo depending on viewing angle.',
    lore: 'The Shift phenomenon is caused by internal nanostructures that diffract light unpredictably.',
  },
  {
    id: 'lapis-shard',
    name: 'Lapis Shard',
    rarity: 'uncommon',
    colorBand: 'indigo',
    power: 13,
    description: 'A fragment of deep-blue lapis lazuli flecked with golden pyrite inclusions.',
    lore: 'Ancient civilizations believed Lapis Shards contained fragments of the night sky itself.',
  },
  {
    id: 'tanzanite-flare',
    name: 'Tanzanite Flare',
    rarity: 'uncommon',
    colorBand: 'violet',
    power: 17,
    description: 'A rare tanzanite crystal that flares with violet light under pressure.',
    lore: 'Only found at the boundary between the Indigo Polarization Zone and the Violet Sanctum.',
  },
  {
    id: 'amber-wave',
    name: 'Amber Wave',
    rarity: 'uncommon',
    colorBand: 'orange',
    power: 14,
    description: 'A polished amber crystal with flowing internal wave patterns.',
    lore: 'The wave patterns in Amber Wave crystals are actually trapped light currents frozen in time.',
  },
  {
    id: 'peridot-chip',
    name: 'Peridot Chip',
    rarity: 'uncommon',
    colorBand: 'green',
    power: 15,
    description: 'A bright olive-green peridot fragment with excellent light transmission.',
    lore: 'Peridot Chips amplify photosynthetic energy in the Photon Garden, accelerating growth.',
  },
  // Rare (7)
  {
    id: 'emerald-refraction',
    name: 'Emerald Refraction',
    rarity: 'rare',
    colorBand: 'green',
    power: 28,
    description: 'A perfect emerald that refracts light into seven distinct spectral beams.',
    lore: 'The Emerald Refraction is the key to unlocking the Green Transmission Bay\'s deepest secrets.',
  },
  {
    id: 'jade-resonance',
    name: 'Jade Resonance',
    rarity: 'rare',
    colorBand: 'green',
    power: 25,
    description: 'A translucent jade crystal that vibrates at the harmonic frequency of green light.',
    lore: 'Jade Resonance crystals hum when brought near other green-spectrum specimens.',
  },
  {
    id: 'alexandrite-shift',
    name: 'Alexandrite Shift',
    rarity: 'rare',
    colorBand: 'green',
    power: 30,
    description: 'A color-changing alexandrite that shifts from green in daylight to red in incandescent light.',
    lore: 'The Alexandrite Shift embodies the duality of the spectrum — always two colors, never one.',
  },
  {
    id: 'tourmaline-beam',
    name: 'Tourmaline Beam',
    rarity: 'rare',
    colorBand: 'violet',
    power: 27,
    description: 'A watermelon tourmaline that emits a dual-color beam from each end.',
    lore: 'The Tourmaline Beam\'s two opposing wavelengths create a visible interference pattern in air.',
  },
  {
    id: 'chrome-diopside',
    name: 'Chrome Diopside',
    rarity: 'rare',
    colorBand: 'green',
    power: 26,
    description: 'A vivid green diopside colored by chromium, with intense chromatic saturation.',
    lore: 'Chrome Diopside is so pure in its green that it absorbs all other wavelengths completely.',
  },
  {
    id: 'golden-beryl',
    name: 'Golden Beryl',
    rarity: 'rare',
    colorBand: 'yellow',
    power: 24,
    description: 'A golden heliodor beryl that captures and concentrates yellow light.',
    lore: 'The Yellow Absorption Lab was built around a massive Golden Beryl that still powers it today.',
  },
  {
    id: 'citrine-refraction',
    name: 'Citrine Refraction',
    rarity: 'rare',
    colorBand: 'yellow',
    power: 29,
    description: 'A natural citrine crystal with extraordinary refractive properties.',
    lore: 'Citrine Refraction crystals never fade — they absorb sunlight and re-emit it perpetually.',
  },
  // Epic (7)
  {
    id: 'amethyst-beam',
    name: 'Amethyst Beam',
    rarity: 'epic',
    colorBand: 'violet',
    power: 42,
    description: 'A massive amethyst cluster that projects a coherent violet beam.',
    lore: 'The Amethyst Beam is said to pierce the veil between the visible spectrum and the ultraviolet beyond.',
  },
  {
    id: 'kunzite-ray',
    name: 'Kunzite Ray',
    rarity: 'epic',
    colorBand: 'violet',
    power: 40,
    description: 'A spodumene crystal that emits a focused ray of pink-violet light.',
    lore: 'Kunzite Rays intensify under moonlight, making them invaluable for nocturnal spectrum research.',
  },
  {
    id: 'charoite-pulse',
    name: 'Charoite Pulse',
    rarity: 'epic',
    colorBand: 'violet',
    power: 44,
    description: 'A swirling charoite stone that sends out pulsing waves of purple energy.',
    lore: 'The Charoite Pulse is the heartbeat of the Violet Interference Sanctum itself.',
  },
  {
    id: 'sugilite-prism',
    name: 'Sugilite Prism',
    rarity: 'epic',
    colorBand: 'violet',
    power: 46,
    description: 'A deep purple sugilite prism that creates three-dimensional light sculptures.',
    lore: 'Looking through a Sugilite Prism reveals colors that have no name in any human language.',
  },
  {
    id: 'lepidolite-wave',
    name: 'Lepidolite Wave',
    rarity: 'epic',
    colorBand: 'indigo',
    power: 41,
    description: 'A lilac-colored lepidolite that generates standing waves of indigo light.',
    lore: 'Lepidolite Waves can cancel out destructive wavelengths, creating zones of perfect calm.',
  },
  {
    id: 'purple-sapphire',
    name: 'Purple Sapphire',
    rarity: 'epic',
    colorBand: 'violet',
    power: 43,
    description: 'A rare padparadscha-adjacent sapphire with deep violet coloration.',
    lore: 'The Purple Sapphire is the only known crystal that can refract ultraviolet into visible light.',
  },
  {
    id: 'indigo-star',
    name: 'Indigo Star',
    rarity: 'epic',
    colorBand: 'indigo',
    power: 45,
    description: 'A star-cut indigo gemstone that emits light in a starburst pattern.',
    lore: 'The Indigo Star was the first crystal placed in the Indigo Polarization Zone millennia ago.',
  },
  // Legendary (7)
  {
    id: 'diamond-focus',
    name: 'Diamond Focus',
    rarity: 'legendary',
    colorBand: 'white',
    power: 70,
    description: 'A flawless diamond that can focus any wavelength of light to infinite precision.',
    lore: 'The Diamond Focus is the pinnacle of optical perfection — no impurity, no flaw, only pure light.',
  },
  {
    id: 'opal-shift',
    name: 'Opal Shift',
    rarity: 'legendary',
    colorBand: 'white',
    power: 65,
    description: 'A precious opal that displays all colors of the spectrum simultaneously.',
    lore: 'The Opal Shift contains every color band locked in eternal play, a miniature rainbow in stone.',
  },
  {
    id: 'rainbow-core',
    name: 'Rainbow Core',
    rarity: 'legendary',
    colorBand: 'white',
    power: 80,
    description: 'The legendary core crystal from which all seven chambers were originally carved.',
    lore: 'Before the realm was divided, the Rainbow Core contained the entire spectrum in perfect unity.',
  },
  {
    id: 'black-opal-void',
    name: 'Black Opal Void',
    rarity: 'legendary',
    colorBand: 'indigo',
    power: 72,
    description: 'A dark opal that absorbs all light, creating localized zones of perfect darkness.',
    lore: 'The Black Opal Void is the antithesis of the Rainbow Core — where it absorbs, the Core radiates.',
  },
  {
    id: 'white-diamond-pure',
    name: 'White Diamond Pure',
    rarity: 'legendary',
    colorBand: 'white',
    power: 85,
    description: 'A colorless diamond of absolute purity, radiating pure white light.',
    lore: 'The White Diamond Pure is said to exist at the center of the White Convergence Nexus.',
  },
  {
    id: 'alexandrite-master',
    name: 'Alexandrite Master',
    rarity: 'legendary',
    colorBand: 'red',
    power: 75,
    description: 'A colossal alexandrite that shifts through the entire spectrum as it rotates.',
    lore: 'The Alexandrite Master is the living proof that all colors are one — they merely wear different faces.',
  },
  {
    id: 'prism-heart',
    name: 'Prism Heart',
    rarity: 'legendary',
    colorBand: 'white',
    power: 90,
    description: 'The mythical heart of the Prism Realm, beating with condensed rainbow energy.',
    lore: 'Legends say whoever possesses the Prism Heart can bend reality itself through the power of light.',
  },
]

// ─── 8 Realm Chambers ────────────────────────────────────────────

const PR_CHAMBERS: PrChamber[] = [
  {
    id: 'red-refraction-hall',
    name: 'Red Refraction Hall',
    colorBand: 'red',
    description: 'A grand hall of crimson crystal where light bends and splits into warm red spectrums. The walls pulse with deep arterial glow.',
    requiredFame: 0,
    bonusType: 'red_energy',
    bonusAmount: 1.2,
    icon: '🔴',
  },
  {
    id: 'orange-diffusion-room',
    name: 'Orange Diffusion Room',
    colorBand: 'orange',
    description: 'A warm chamber where light scatters into orange hues through complex diffusion matrices. The air itself glows amber.',
    requiredFame: 100,
    bonusType: 'orange_energy',
    bonusAmount: 1.3,
    icon: '🟠',
  },
  {
    id: 'yellow-absorption-lab',
    name: 'Yellow Absorption Lab',
    colorBand: 'yellow',
    description: 'A bright laboratory studying how crystals absorb and re-emit yellow wavelengths. Solar collectors line every surface.',
    requiredFame: 250,
    bonusType: 'yellow_energy',
    bonusAmount: 1.4,
    icon: '🟡',
  },
  {
    id: 'green-transmission-bay',
    name: 'Green Transmission Bay',
    colorBand: 'green',
    description: 'A verdant bay where green light is transmitted through living crystal gardens. Plants grow under spectral lamps.',
    requiredFame: 500,
    bonusType: 'green_energy',
    bonusAmount: 1.5,
    icon: '🟢',
  },
  {
    id: 'blue-scattering-chamber',
    name: 'Blue Scattering Chamber',
    colorBand: 'blue',
    description: 'A vast chamber where Rayleigh scattering fills the air with blue light. The ceiling mimics a perpetual sky.',
    requiredFame: 800,
    bonusType: 'blue_energy',
    bonusAmount: 1.6,
    icon: '🔵',
  },
  {
    id: 'indigo-polarization-zone',
    name: 'Indigo Polarization Zone',
    colorBand: 'indigo',
    description: 'A mysterious zone where all light becomes polarized in deep indigo. Only aligned photons can pass through.',
    requiredFame: 1200,
    bonusType: 'indigo_energy',
    bonusAmount: 1.7,
    icon: '🟣',
  },
  {
    id: 'violet-interference-sanctum',
    name: 'Violet Interference Sanctum',
    colorBand: 'violet',
    description: 'A sacred sanctum where interference patterns create mesmerizing violet fractals in the air itself.',
    requiredFame: 1800,
    bonusType: 'violet_energy',
    bonusAmount: 1.8,
    icon: '💜',
  },
  {
    id: 'white-convergence-nexus',
    name: 'White Convergence Nexus',
    colorBand: 'white',
    description: 'The ultimate chamber where all seven colors converge into pure white light. The heart of the Prism Realm.',
    requiredFame: 3000,
    bonusType: 'all_energy',
    bonusAmount: 2.0,
    icon: '⚪',
  },
]

// ─── 30 Optical Instruments ──────────────────────────────────────

const PR_INSTRUMENTS: PrInstrument[] = [
  {
    id: 'light-lens',
    name: 'Light Lens',
    description: 'A precision-ground glass lens that focuses scattered light into a tight beam.',
    effect: 'focus_light',
    cost: 50,
    power: 10,
    icon: '🔍',
  },
  {
    id: 'prism-cutter',
    name: 'Prism Cutter',
    description: 'A diamond-tipped tool for cutting perfect prismatic angles from raw crystal.',
    effect: 'cut_crystal',
    cost: 60,
    power: 12,
    icon: '💎',
  },
  {
    id: 'spectrum-analyzer',
    name: 'Spectrum Analyzer',
    description: 'A device that breaks down any light source into its component wavelengths.',
    effect: 'analyze_spectrum',
    cost: 80,
    power: 15,
    icon: '📊',
  },
  {
    id: 'wavelength-tuner',
    name: 'Wavelength Tuner',
    description: 'A precision instrument for tuning crystal resonances to specific wavelengths.',
    effect: 'tune_wavelength',
    cost: 70,
    power: 13,
    icon: '🎛️',
  },
  {
    id: 'color-filter',
    name: 'Color Filter',
    description: 'A set of tinted filters that isolate specific spectral bands from white light.',
    effect: 'filter_color',
    cost: 40,
    power: 8,
    icon: '🎨',
  },
  {
    id: 'beam-splitter',
    name: 'Beam Splitter',
    description: 'A half-silvered mirror that divides a single light beam into two parallel paths.',
    effect: 'split_beam',
    cost: 90,
    power: 16,
    icon: '✂️',
  },
  {
    id: 'diffraction-grating',
    name: 'Diffraction Grating',
    description: 'A finely etched surface that disperses light into a detailed spectral pattern.',
    effect: 'diffract',
    cost: 100,
    power: 18,
    icon: '📐',
  },
  {
    id: 'polarizing-filter',
    name: 'Polarizing Filter',
    description: 'A filter that blocks all light except that oscillating in one plane.',
    effect: 'polarize',
    cost: 75,
    power: 14,
    icon: '☢️',
  },
  {
    id: 'concave-mirror',
    name: 'Concave Mirror',
    description: 'A parabolic mirror that concentrates reflected light to a focal point.',
    effect: 'concentrate',
    cost: 85,
    power: 15,
    icon: '🪞',
  },
  {
    id: 'convex-lens',
    name: 'Convex Lens',
    description: 'A bulging lens that spreads light outward for wide-area illumination.',
    effect: 'disperse',
    cost: 55,
    power: 11,
    icon: '🔭',
  },
  {
    id: 'optical-fiber',
    name: 'Optical Fiber',
    description: 'A flexible glass thread that guides light through total internal reflection.',
    effect: 'guide_light',
    cost: 65,
    power: 12,
    icon: '🔗',
  },
  {
    id: 'laser-emitter',
    name: 'Laser Emitter',
    description: 'A coherent light source that produces an intense, focused monochromatic beam.',
    effect: 'emit_laser',
    cost: 120,
    power: 22,
    icon: '⚡',
  },
  {
    id: 'photon-detector',
    name: 'Photon Detector',
    description: 'A sensitive device that counts individual photons across the spectrum.',
    effect: 'detect_photons',
    cost: 95,
    power: 17,
    icon: '📡',
  },
  {
    id: 'holographic-projector',
    name: 'Holographic Projector',
    description: 'Creates three-dimensional light images using interference patterns.',
    effect: 'project_hologram',
    cost: 150,
    power: 25,
    icon: '🖼️',
  },
  {
    id: 'chromatic-corrector',
    name: 'Chromatic Corrector',
    description: 'An advanced optic that eliminates chromatic aberration in multi-lens systems.',
    effect: 'correct_chroma',
    cost: 110,
    power: 20,
    icon: '🎯',
  },
  {
    id: 'interferometer',
    name: 'Interferometer',
    description: 'A precision instrument that measures light wave interference with extraordinary accuracy.',
    effect: 'measure_interference',
    cost: 140,
    power: 24,
    icon: '〰️',
  },
  {
    id: 'spectroscope',
    name: 'Spectroscope',
    description: 'An observation device that reveals the spectral signature of any light source.',
    effect: 'observe_spectrum',
    cost: 105,
    power: 19,
    icon: '🌈',
  },
  {
    id: 'light-amplifier',
    name: 'Light Amplifier',
    description: 'A crystalline amplifier that boosts light intensity without altering wavelength.',
    effect: 'amplify_light',
    cost: 130,
    power: 23,
    icon: '🔆',
  },
  {
    id: 'color-calibrator',
    name: 'Color Calibrator',
    description: 'A reference device for calibrating all color measurements to international standards.',
    effect: 'calibrate_color',
    cost: 115,
    power: 21,
    icon: '📐',
  },
  {
    id: 'uv-illuminator',
    name: 'UV Illuminator',
    description: 'Emits ultraviolet light that reveals hidden fluorescent patterns in crystals.',
    effect: 'illuminate_uv',
    cost: 135,
    power: 22,
    icon: '☀️',
  },
  {
    id: 'infrared-scope',
    name: 'Infrared Scope',
    description: 'Detects heat radiation beyond the visible spectrum for thermal analysis.',
    effect: 'detect_infrared',
    cost: 125,
    power: 21,
    icon: '🌡️',
  },
  {
    id: 'fluorescence-probe',
    name: 'Fluorescence Probe',
    description: 'A handheld probe that triggers and measures fluorescence in crystal samples.',
    effect: 'probe_fluorescence',
    cost: 100,
    power: 18,
    icon: '🧪',
  },
  {
    id: 'prismatic-array',
    name: 'Prismatic Array',
    description: 'A grid of micro-prisms that creates complex multi-directional light displays.',
    effect: 'array_prisms',
    cost: 160,
    power: 26,
    icon: '🔬',
  },
  {
    id: 'photon-collector',
    name: 'Photon Collector',
    description: 'A wide-aperture dish that gathers and stores ambient photon energy.',
    effect: 'collect_photons',
    cost: 90,
    power: 16,
    icon: '📡',
  },
  {
    id: 'beam-combiner',
    name: 'Beam Combiner',
    description: 'Merges multiple light beams of different wavelengths into a single output.',
    effect: 'combine_beams',
    cost: 145,
    power: 25,
    icon: '🔀',
  },
  {
    id: 'wave-modulator',
    name: 'Wave Modulator',
    description: 'Modulates light wave frequency and amplitude for signal transmission.',
    effect: 'modulate_wave',
    cost: 155,
    power: 27,
    icon: '📻',
  },
  {
    id: 'phase-shifter',
    name: 'Phase Shifter',
    description: 'Adjusts the phase of light waves to create constructive or destructive interference.',
    effect: 'shift_phase',
    cost: 140,
    power: 24,
    icon: '🔄',
  },
  {
    id: 'frequency-doubler',
    name: 'Frequency Doubler',
    description: 'A nonlinear crystal that doubles the frequency of incoming light, halving its wavelength.',
    effect: 'double_frequency',
    cost: 170,
    power: 28,
    icon: '✖️',
  },
  {
    id: 'optical-resonator',
    name: 'Optical Resonator',
    description: 'A pair of aligned mirrors that creates a resonant cavity for light amplification.',
    effect: 'resonate_light',
    cost: 180,
    power: 30,
    icon: '🔊',
  },
  {
    id: 'quantum-light-cell',
    name: 'Quantum Light Cell',
    description: 'A device that traps individual photons in quantum states for manipulation.',
    effect: 'quantum_trap',
    cost: 200,
    power: 35,
    icon: '⚛️',
  },
]

// ─── 25 Realm Structures ─────────────────────────────────────────

const PR_STRUCTURES: PrStructureDef[] = [
  {
    id: 'crystal-amplifier',
    name: 'Crystal Amplifier',
    description: 'Boosts crystal power output by concentrating their inherent light energy.',
    maxLevel: 10,
    baseCost: 100,
    costPerLevel: 50,
    effectPerLevel: '+5% crystal power',
    icon: '大小',
  },
  {
    id: 'color-mixer',
    name: 'Color Mixer',
    description: 'Combines different color charges to produce new spectral effects.',
    maxLevel: 10,
    baseCost: 80,
    costPerLevel: 40,
    effectPerLevel: '+3 color blend slots',
    icon: '🎨',
  },
  {
    id: 'light-forge',
    name: 'Light Forge',
    description: 'A forge powered by concentrated light, used to craft optical instruments.',
    maxLevel: 10,
    baseCost: 120,
    costPerLevel: 60,
    effectPerLevel: '+10% forge efficiency',
    icon: '🔥',
  },
  {
    id: 'spectrum-tower',
    name: 'Spectrum Tower',
    description: 'A towering structure that broadcasts spectrum signals across the realm.',
    maxLevel: 10,
    baseCost: 200,
    costPerLevel: 80,
    effectPerLevel: '+5% broadcast range',
    icon: '🗼',
  },
  {
    id: 'prism-engine',
    name: 'Prism Engine',
    description: 'The core power generator that converts crystal energy into usable light power.',
    maxLevel: 10,
    baseCost: 250,
    costPerLevel: 100,
    effectPerLevel: '+8% energy conversion',
    icon: '⚙️',
  },
  {
    id: 'beam-relay',
    name: 'Beam Relay',
    description: 'A network of relay stations that transmit focused light beams across distances.',
    maxLevel: 10,
    baseCost: 90,
    costPerLevel: 45,
    effectPerLevel: '+2 relay connections',
    icon: '📡',
  },
  {
    id: 'photon-garden',
    name: 'Photon Garden',
    description: 'A garden where photon-sensitive flora grow under precise spectral conditions.',
    maxLevel: 10,
    baseCost: 110,
    costPerLevel: 55,
    effectPerLevel: '+4 garden plots',
    icon: '🌻',
  },
  {
    id: 'wavelength-hub',
    name: 'Wavelength Hub',
    description: 'A central hub for calibrating and distributing wavelength-tuned energy.',
    maxLevel: 10,
    baseCost: 150,
    costPerLevel: 70,
    effectPerLevel: '+6% wavelength accuracy',
    icon: '毂',
  },
  {
    id: 'color-wheel',
    name: 'Color Wheel',
    description: 'A rotating wheel of crystals that generates harmonious color combinations.',
    maxLevel: 10,
    baseCost: 85,
    costPerLevel: 42,
    effectPerLevel: '+2 wheel segments',
    icon: '🎡',
  },
  {
    id: 'light-vault',
    name: 'Light Vault',
    description: 'A secure vault for storing excess light energy for future use.',
    maxLevel: 10,
    baseCost: 130,
    costPerLevel: 65,
    effectPerLevel: '+50 energy capacity',
    icon: '🏦',
  },
  {
    id: 'refraction-array',
    name: 'Refraction Array',
    description: 'An array of precision-aligned prisms for large-scale light manipulation.',
    maxLevel: 10,
    baseCost: 160,
    costPerLevel: 75,
    effectPerLevel: '+7% refraction precision',
    icon: '📐',
  },
  {
    id: 'diffraction-grid',
    name: 'Diffraction Grid',
    description: 'A massive grid that diffracts light into ultra-fine spectral components.',
    maxLevel: 10,
    baseCost: 140,
    costPerLevel: 68,
    effectPerLevel: '+5 spectral lines',
    icon: '🔳',
  },
  {
    id: 'chromatic-furnace',
    name: 'Chromatic Furnace',
    description: 'A furnace that burns raw crystal to produce purified chromatic energy.',
    maxLevel: 10,
    baseCost: 170,
    costPerLevel: 82,
    effectPerLevel: '+8% purification rate',
    icon: '🧪',
  },
  {
    id: 'optical-bench',
    name: 'Optical Bench',
    description: 'A precision workbench for assembling and tuning optical instruments.',
    maxLevel: 10,
    baseCost: 95,
    costPerLevel: 48,
    effectPerLevel: '+4% assembly speed',
    icon: '🛠️',
  },
  {
    id: 'luminance-well',
    name: 'Luminance Well',
    description: 'A deep well that draws raw luminance from the realm\'s crystalline foundation.',
    maxLevel: 10,
    baseCost: 180,
    costPerLevel: 85,
    effectPerLevel: '+6 luminance per cycle',
    icon: '🕳️',
  },
  {
    id: 'rainbow-forge',
    name: 'Rainbow Forge',
    description: 'A legendary forge that can combine all seven spectral colors into one.',
    maxLevel: 10,
    baseCost: 300,
    costPerLevel: 120,
    effectPerLevel: '+10% rainbow yield',
    icon: '🌈',
  },
  {
    id: 'crystal-matrix',
    name: 'Crystal Matrix',
    description: 'A living matrix of interconnected crystals that shares energy between them.',
    maxLevel: 10,
    baseCost: 220,
    costPerLevel: 95,
    effectPerLevel: '+5 matrix nodes',
    icon: '💠',
  },
  {
    id: 'beam-condenser',
    name: 'Beam Condenser',
    description: 'Condenses diffuse light into ultra-dense energy packets for storage.',
    maxLevel: 10,
    baseCost: 135,
    costPerLevel: 62,
    effectPerLevel: '+4% condensation rate',
    icon: '🔧',
  },
  {
    id: 'spectrum-amplifier',
    name: 'Spectrum Amplifier',
    description: 'Amplifies the entire visible spectrum simultaneously for maximum output.',
    maxLevel: 10,
    baseCost: 280,
    costPerLevel: 110,
    effectPerLevel: '+9% spectrum power',
    icon: '📢',
  },
  {
    id: 'color-synthesizer',
    name: 'Color Synthesizer',
    description: 'Synthesizes artificial colors that do not exist in the natural spectrum.',
    maxLevel: 10,
    baseCost: 240,
    costPerLevel: 100,
    effectPerLevel: '+3 synthetic colors',
    icon: '🎹',
  },
  {
    id: 'photon-reactor',
    name: 'Photon Reactor',
    description: 'A nuclear-scale reactor that generates energy from photon annihilation.',
    maxLevel: 10,
    baseCost: 350,
    costPerLevel: 130,
    effectPerLevel: '+12% reactor output',
    icon: '☢️',
  },
  {
    id: 'light-harvester',
    name: 'Light Harvester',
    description: 'An automated system that harvests ambient light from the environment.',
    maxLevel: 10,
    baseCost: 190,
    costPerLevel: 88,
    effectPerLevel: '+7 harvest per hour',
    icon: '🌾',
  },
  {
    id: 'prism-foundry',
    name: 'Prism Foundry',
    description: 'A foundry dedicated to casting new prisms from raw spectral material.',
    maxLevel: 10,
    baseCost: 260,
    costPerLevel: 105,
    effectPerLevel: '+6% prism quality',
    icon: '🏗️',
  },
  {
    id: 'wavelength-forge',
    name: 'Wavelength Forge',
    description: 'A specialized forge for shaping the fundamental wavelength of crystals.',
    maxLevel: 10,
    baseCost: 310,
    costPerLevel: 125,
    effectPerLevel: '+11% wavelength control',
    icon: '🔨',
  },
  {
    id: 'spectrum-citadel',
    name: 'Spectrum Citadel',
    description: 'The ultimate structure — a citadel that commands the entire visible spectrum.',
    maxLevel: 10,
    baseCost: 500,
    costPerLevel: 200,
    effectPerLevel: '+15% all spectrum bonuses',
    icon: '🏰',
  },
]

// ─── 22 Prismatic Abilities ──────────────────────────────────────

const PR_ABILITIES: PrAbilityDef[] = [
  {
    id: 'refract',
    name: 'Refract',
    description: 'Bend light through a crystal to change its direction and split its spectrum.',
    energyCost: 10,
    cooldown: 0,
    effect: 'redirect_light',
    unlockFame: 0,
    icon: '🔺',
  },
  {
    id: 'disperse',
    name: 'Disperse',
    description: 'Scatter light into its component colors across a wide area.',
    energyCost: 15,
    cooldown: 2,
    effect: 'area_disperse',
    unlockFame: 0,
    icon: '💥',
  },
  {
    id: 'polarize',
    name: 'Polarize',
    description: 'Align all light waves to a single plane, filtering out scattered photons.',
    energyCost: 20,
    cooldown: 3,
    effect: 'plane_filter',
    unlockFame: 50,
    icon: '〰️',
  },
  {
    id: 'interfere',
    name: 'Interfere',
    description: 'Create destructive interference patterns to neutralize unwanted wavelengths.',
    energyCost: 25,
    cooldown: 4,
    effect: 'cancel_wave',
    unlockFame: 100,
    icon: '🌀',
  },
  {
    id: 'amplify',
    name: 'Amplify',
    description: 'Double the intensity of a selected light beam without changing its color.',
    energyCost: 30,
    cooldown: 5,
    effect: 'intensity_double',
    unlockFame: 200,
    icon: '📈',
  },
  {
    id: 'absorb',
    name: 'Absorb',
    description: 'Absorb incoming light energy and store it for later use.',
    energyCost: 5,
    cooldown: 0,
    effect: 'store_energy',
    unlockFame: 150,
    icon: '🧲',
  },
  {
    id: 'scatter',
    name: 'Scatter',
    description: 'Scatter light through a medium to reveal hidden spectral signatures.',
    energyCost: 18,
    cooldown: 2,
    effect: 'reveal_hidden',
    unlockFame: 300,
    icon: '✨',
  },
  {
    id: 'focus',
    name: 'Focus',
    description: 'Focus scattered light into a single concentrated point of maximum intensity.',
    energyCost: 22,
    cooldown: 3,
    effect: 'concentrate_point',
    unlockFame: 350,
    icon: '🎯',
  },
  {
    id: 'bend',
    name: 'Bend',
    description: 'Bend a light ray around obstacles using gravitational lensing.',
    energyCost: 28,
    cooldown: 4,
    effect: 'gravitational_lens',
    unlockFame: 450,
    icon: '🔙',
  },
  {
    id: 'split',
    name: 'Split',
    description: 'Split a white light beam into its seven spectral components.',
    energyCost: 35,
    cooldown: 5,
    effect: 'spectral_split',
    unlockFame: 500,
    icon: '🔀',
  },
  {
    id: 'merge',
    name: 'Merge',
    description: 'Merge two colored beams into a new color through additive mixing.',
    energyCost: 25,
    cooldown: 3,
    effect: 'color_merge',
    unlockFame: 600,
    icon: '🔗',
  },
  {
    id: 'shift',
    name: 'Shift',
    description: 'Shift the wavelength of a light beam, changing its color smoothly.',
    energyCost: 40,
    cooldown: 6,
    effect: 'wavelength_shift',
    unlockFame: 700,
    icon: '🔄',
  },
  {
    id: 'illuminate',
    name: 'Illuminate',
    description: 'Bathe an entire chamber in pure white light, revealing all hidden elements.',
    energyCost: 50,
    cooldown: 8,
    effect: 'full_illumination',
    unlockFame: 800,
    icon: '💡',
  },
  {
    id: 'diffract',
    name: 'Diffract',
    description: 'Create precise diffraction patterns to analyze the composition of any crystal.',
    energyCost: 32,
    cooldown: 4,
    effect: 'composition_analysis',
    unlockFame: 900,
    icon: '📐',
  },
  {
    id: 'reflect',
    name: 'Reflect',
    description: 'Create a perfect mirror surface that reflects all incoming light.',
    energyCost: 20,
    cooldown: 2,
    effect: 'mirror_shield',
    unlockFame: 1000,
    icon: '🪞',
  },
  {
    id: 'refract-master',
    name: 'Refract Master',
    description: 'An advanced refraction technique that bends light through multiple crystal layers.',
    energyCost: 45,
    cooldown: 6,
    effect: 'multi_layer_refract',
    unlockFame: 1200,
    icon: '🔺',
  },
  {
    id: 'color-burst',
    name: 'Color Burst',
    description: 'Release a burst of all seven spectrum colors simultaneously.',
    energyCost: 60,
    cooldown: 10,
    effect: 'rainbow_burst',
    unlockFame: 1400,
    icon: '🎆',
  },
  {
    id: 'photon-storm',
    name: 'Photon Storm',
    description: 'Summon a storm of photons that fills the chamber with chaotic light.',
    energyCost: 70,
    cooldown: 12,
    effect: 'photon_chaos',
    unlockFame: 1600,
    icon: '⛈️',
  },
  {
    id: 'spectrum-surge',
    name: 'Spectrum Surge',
    description: 'Surge all color charges to maximum, granting temporary spectrum mastery.',
    energyCost: 80,
    cooldown: 15,
    effect: 'max_spectrum',
    unlockFame: 2000,
    icon: '🌊',
  },
  {
    id: 'prism-shield',
    name: 'Prism Shield',
    description: 'Create a protective shield of refracted light that absorbs damage.',
    energyCost: 55,
    cooldown: 8,
    effect: 'light_barrier',
    unlockFame: 2400,
    icon: '🛡️',
  },
  {
    id: 'rainbow-beam',
    name: 'Rainbow Beam',
    description: 'Fire a devastating beam that cycles through all colors of the spectrum.',
    energyCost: 90,
    cooldown: 15,
    effect: 'cycling_beam',
    unlockFame: 2800,
    icon: '🌈',
  },
  {
    id: 'light-nova',
    name: 'Light Nova',
    description: 'The ultimate ability — detonate all stored light energy in a brilliant nova.',
    energyCost: 150,
    cooldown: 30,
    effect: 'nova_explosion',
    unlockFame: 3500,
    icon: '💫',
  },
]

// ─── 18 Achievements ─────────────────────────────────────────────

const PR_ACHIEVEMENTS: PrAchievementDef[] = [
  {
    id: 'first-light',
    name: 'First Light',
    description: 'Collect your very first prismatic crystal and begin your journey.',
    icon: '✨',
    condition: 'collect_first_crystal',
    reward: { type: 'light_energy', value: 25 },
  },
  {
    id: 'spectrum-initiate',
    name: 'Spectrum Initiate',
    description: 'Collect 5 different crystals from the Prism Realm.',
    icon: '🔮',
    condition: 'collect_5_crystals',
    reward: { type: 'light_energy', value: 60 },
  },
  {
    id: 'color-collector',
    name: 'Color Collector',
    description: 'Collect 15 different crystals spanning multiple rarity tiers.',
    icon: '💎',
    condition: 'collect_15_crystals',
    reward: { type: 'realm_fame', value: 100 },
  },
  {
    id: 'full-spectrum',
    name: 'Full Spectrum',
    description: 'Collect all 35 prismatic crystals to complete the spectrum.',
    icon: '🌈',
    condition: 'collect_all_crystals',
    reward: { type: 'realm_fame', value: 1000 },
  },
  {
    id: 'chamber-explorer',
    name: 'Chamber Explorer',
    description: 'Visit all 8 realm chambers at least once.',
    icon: '🏛️',
    condition: 'visit_all_chambers',
    reward: { type: 'light_energy', value: 200 },
  },
  {
    id: 'light-worker',
    name: 'Light Worker',
    description: 'Accumulate a total of 500 light energy through crystal collection.',
    icon: '⚡',
    condition: 'earn_500_energy',
    reward: { type: 'realm_fame', value: 50 },
  },
  {
    id: 'energy-master',
    name: 'Energy Master',
    description: 'Accumulate a total of 2000 light energy.',
    icon: '🔋',
    condition: 'earn_2000_energy',
    reward: { type: 'realm_fame', value: 200 },
  },
  {
    id: 'structure-builder',
    name: 'Structure Builder',
    description: 'Upgrade any realm structure to level 5.',
    icon: '🏗️',
    condition: 'upgrade_structure_5',
    reward: { type: 'light_energy', value: 150 },
  },
  {
    id: 'master-builder',
    name: 'Master Builder',
    description: 'Upgrade any realm structure to its maximum level of 10.',
    icon: '🏰',
    condition: 'upgrade_structure_10',
    reward: { type: 'realm_fame', value: 300 },
  },
  {
    id: 'instrument-collector',
    name: 'Instrument Collector',
    description: 'Acquire 15 different optical instruments.',
    icon: '🔧',
    condition: 'own_15_instruments',
    reward: { type: 'light_energy', value: 120 },
  },
  {
    id: 'ability-scholar',
    name: 'Ability Scholar',
    description: 'Learn 10 different prismatic abilities.',
    icon: '📖',
    condition: 'learn_10_abilities',
    reward: { type: 'realm_fame', value: 150 },
  },
  {
    id: 'prismatic-master',
    name: 'Prismatic Master',
    description: 'Learn all 22 prismatic abilities.',
    icon: '👑',
    condition: 'learn_all_abilities',
    reward: { type: 'realm_fame', value: 500 },
  },
  {
    id: 'color-mixer',
    name: 'Color Alchemist',
    description: 'Mix colors 50 times in the Color Mixer structure.',
    icon: '🎨',
    condition: 'mix_colors_50',
    reward: { type: 'light_energy', value: 100 },
  },
  {
    id: 'light-bender',
    name: 'Light Bender',
    description: 'Bend 100 light rays using gravitational lensing.',
    icon: '🔙',
    condition: 'bend_100_rays',
    reward: { type: 'realm_fame', value: 120 },
  },
  {
    id: 'spectrum-scanner',
    name: 'Spectrum Scanner',
    description: 'Scan the spectrum 25 times using the Spectrum Analyzer.',
    icon: '📊',
    condition: 'scan_25_spectra',
    reward: { type: 'light_energy', value: 80 },
  },
  {
    id: 'crystal-hunter',
    name: 'Crystal Hunter',
    description: 'Collect all 7 crystals of any single rarity tier.',
    icon: '💎',
    condition: 'collect_tier_complete',
    reward: { type: 'realm_fame', value: 250 },
  },
  {
    id: 'realm-architect',
    name: 'Realm Architect',
    description: 'Upgrade 10 different realm structures to at least level 3.',
    icon: '🏛️',
    condition: 'upgrade_10_structures_3',
    reward: { type: 'realm_fame', value: 400 },
  },
  {
    id: 'prism-sovereign',
    name: 'Prism Sovereign',
    description: 'Reach the highest title of Prism Sovereign by accumulating 5000 realm fame.',
    icon: '🏆',
    condition: 'reach_prism_sovereign',
    reward: { type: 'light_energy', value: 1000 },
  },
]

// ─── 8 Titles ────────────────────────────────────────────────────

const PR_TITLES: PrTitleDef[] = [
  {
    id: 'light-initiate',
    name: 'Light Initiate',
    requiredFame: 0,
    description: 'A newcomer to the Prism Realm, taking their first steps into the spectrum.',
    color: '#9CA3AF',
  },
  {
    id: 'color-apprentice',
    name: 'Color Apprentice',
    requiredFame: 100,
    description: 'Has begun to understand the relationships between light and color.',
    color: '#FF9100',
  },
  {
    id: 'prism-student',
    name: 'Prism Student',
    requiredFame: 300,
    description: 'Studies the behavior of light through prisms and crystals.',
    color: '#FFD600',
  },
  {
    id: 'spectrum-scholar',
    name: 'Spectrum Scholar',
    requiredFame: 600,
    description: 'A learned scholar of the visible spectrum and its hidden properties.',
    color: '#00E676',
  },
  {
    id: 'refraction-expert',
    name: 'Refraction Expert',
    requiredFame: 1000,
    description: 'Master of light refraction and spectral manipulation.',
    color: '#2979FF',
  },
  {
    id: 'chromatic-master',
    name: 'Chromatic Master',
    requiredFame: 2000,
    description: 'Commands the full chromatic spectrum with precision and artistry.',
    color: '#651FFF',
  },
  {
    id: 'light-archon',
    name: 'Light Archon',
    requiredFame: 3500,
    description: 'A being of pure light, archon of the Prism Realm and its chambers.',
    color: '#D500F9',
  },
  {
    id: 'prism-sovereign',
    name: 'Prism Sovereign',
    requiredFame: 5000,
    description: 'The supreme ruler of the Prism Realm, master of all light and color.',
    color: '#FFD600',
  },
]

// ─── PR Constants ────────────────────────────────────────────────

const PR_MAX_ENERGY = 200
const PR_CRYSTAL_COUNT = 35
const PR_CHAMBER_COUNT = 8
const PR_INSTRUMENT_COUNT = 30
const PR_STRUCTURE_COUNT = 25
const PR_ABILITY_COUNT = 22
const PR_ACHIEVEMENT_COUNT = 18
const PR_TITLE_COUNT = 8
const PR_COLLECT_ENERGY_BASE = 15
const PR_REFRACT_ENERGY_COST = 8
const PR_MIX_ENERGY_COST = 12
const PR_UPGRADE_DISCOUNT_STRUCTURE_LEVEL_5 = 0.1
const PR_ABILITY_ENERGY_RETURN_RATE = 0.05
const PR_SAVE_KEY = 'prism-realm-save'
const PR_DAILY_TASK_BASE_TARGET = 5
const PR_WAVELENGTH_BALANCE_MAX = 100
const PR_FAME_PER_RARE_CRYSTAL = 15
const PR_FAME_PER_EPIC_CRYSTAL = 40
const PR_FAME_PER_LEGENDARY_CRYSTAL = 100

// ─── Default State ───────────────────────────────────────────────

const PR_DEFAULT_COLOR_CHARGE: Record<PrColorBand, number> = {
  red: 0,
  orange: 0,
  yellow: 0,
  green: 0,
  blue: 0,
  indigo: 0,
  violet: 0,
  white: 0,
}

const PR_DEFAULT_STATE: PrismRealmState = {
  crystalsCollected: [],
  chambersVisited: [],
  instrumentsOwned: [],
  structures: {},
  abilitiesLearned: [],
  achievementsUnlocked: [],
  currentChamber: 'red-refraction-hall',
  lightEnergy: 50,
  colorCharge: { ...PR_DEFAULT_COLOR_CHARGE },
  spectrumScore: 0,
  titleIndex: 0,
  realmFame: 0,
  wavelengthBalance: 50,
  dailyLightTask: {
    date: '',
    target: PR_DAILY_TASK_BASE_TARGET,
    current: 0,
    completed: false,
    rewardClaimed: false,
    description: 'Collect crystals to fill the realm with light.',
  },
  totalCrystalsCollected: 0,
  totalLightRefracted: 0,
  totalColorsMixed: 0,
  totalStructuresUpgraded: 0,
  totalAbilitiesActivated: 0,
  totalLensesCalibrated: 0,
  totalSpectraScanned: 0,
  totalLightAmplified: 0,
  totalRaysBent: 0,
  totalChambersExplored: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// ─── Helper Functions ────────────────────────────────────────────

function prLoadState(): PrismRealmState {
  if (typeof window === 'undefined') return { ...PR_DEFAULT_STATE }
  try {
    const raw = localStorage.getItem(PR_SAVE_KEY)
    if (!raw) return { ...PR_DEFAULT_STATE }
    const parsed = JSON.parse(raw) as Partial<PrismRealmState>
    return {
      ...PR_DEFAULT_STATE,
      ...parsed,
      colorCharge: {
        ...PR_DEFAULT_COLOR_CHARGE,
        ...(parsed.colorCharge || {}),
      },
      structures: {
        ...(parsed.structures || {}),
      },
    }
  } catch {
    return { ...PR_DEFAULT_STATE }
  }
}

function prSaveState(state: PrismRealmState): void {
  if (typeof window === 'undefined') return
  try {
    const toSave = { ...state, updatedAt: new Date().toISOString() }
    localStorage.setItem(PR_SAVE_KEY, JSON.stringify(toSave))
  } catch {
    // Storage full or unavailable — silently degrade
  }
}

function prGetTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

function prGetYesterdayString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function prClamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function prFindCrystal(id: string): PrCrystal | undefined {
  return PR_CRYSTALS.find((c) => c.id === id)
}

function prFindChamber(id: string): PrChamber | undefined {
  return PR_CHAMBERS.find((c) => c.id === id)
}

function prFindInstrument(id: string): PrInstrument | undefined {
  return PR_INSTRUMENTS.find((i) => i.id === id)
}

function prFindStructure(id: string): PrStructureDef | undefined {
  return PR_STRUCTURES.find((s) => s.id === id)
}

function prFindAbility(id: string): PrAbilityDef | undefined {
  return PR_ABILITIES.find((a) => a.id === id)
}

function prFindAchievement(id: string): PrAchievementDef | undefined {
  return PR_ACHIEVEMENTS.find((a) => a.id === id)
}

function prGetStructureUpgradeCost(structureDef: PrStructureDef, currentLevel: number): number {
  if (currentLevel >= structureDef.maxLevel) return Infinity
  let cost = structureDef.baseCost
  for (let i = 0; i < currentLevel; i++) {
    cost += structureDef.costPerLevel
  }
  return cost
}

function prGetColorBandEnergy(band: PrColorBand): number {
  switch (band) {
    case 'red': return 8
    case 'orange': return 10
    case 'yellow': return 12
    case 'green': return 14
    case 'blue': return 16
    case 'indigo': return 18
    case 'violet': return 20
    case 'white': return 25
  }
}

function prMixTwoColors(band1: PrColorBand, band2: PrColorBand): PrColorBand | null {
  if (band1 === band2) return band1
  const colorMixMap: Record<string, PrColorBand | null> = {
    'red+blue': 'violet',
    'blue+red': 'violet',
    'red+green': 'yellow',
    'green+red': 'yellow',
    'blue+green': 'cyan' as PrColorBand,
    'green+blue': 'cyan' as PrColorBand,
    'red+yellow': 'orange',
    'yellow+red': 'orange',
    'red+violet': 'magenta' as PrColorBand,
    'violet+red': 'magenta' as PrColorBand,
    'blue+yellow': 'white',
    'yellow+blue': 'white',
    'orange+yellow': 'yellow',
    'yellow+orange': 'yellow',
    'green+yellow': 'yellow',
    'yellow+green': 'yellow',
    'indigo+violet': 'violet',
    'violet+indigo': 'violet',
    'red+orange': 'red',
    'orange+red': 'red',
    'blue+indigo': 'indigo',
    'indigo+blue': 'indigo',
    'green+indigo': 'blue',
    'indigo+green': 'blue',
    'red+indigo': 'violet',
    'indigo+red': 'violet',
    'orange+blue': 'white',
    'blue+orange': 'white',
    'green+violet': 'blue',
    'violet+green': 'blue',
    'orange+green': 'yellow',
    'green+orange': 'yellow',
    'orange+violet': 'white',
    'violet+orange': 'white',
    'orange+indigo': 'white',
    'indigo+orange': 'white',
    'white+red': 'white',
    'white+blue': 'white',
    'white+green': 'white',
    'white+yellow': 'white',
    'white+orange': 'white',
    'white+indigo': 'white',
    'white+violet': 'white',
    'red+white': 'white',
    'blue+white': 'white',
    'green+white': 'white',
    'yellow+white': 'white',
    'orange+white': 'white',
    'indigo+white': 'white',
    'violet+white': 'white',
  }
  const key = `${band1}+${band2}`
  return colorMixMap[key] || null
}

function prGenerateDailyTaskDescription(): string {
  const tasks = [
    'Collect crystals to fill the realm with light.',
    'Refract light through prisms to reveal hidden colors.',
    'Mix colors in the Color Mixer to discover new hues.',
    'Bend light rays around obstacles in the chambers.',
    'Calibrate your lenses for maximum precision.',
    'Scan the spectrum for rare crystal signatures.',
    'Amplify light energy using the Crystal Amplifier.',
  ]
  const idx = Math.floor(Math.random() * tasks.length)
  return tasks[idx]
}

// ─── Main Hook ───────────────────────────────────────────────────

export default function usePrismRealm() {
  const [state, setState] = useState<PrismRealmState>(prLoadState)
  const stateRef = useRef(state)

  // Keep ref in sync via useEffect only
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Persist state to localStorage
  useEffect(() => {
    prSaveState(state)
  }, [state])

  // ── Computed Values (useMemo with [state]) ─────────────────────

  const currentTitle = useMemo(() => {
    let bestIndex = 0
    for (let i = PR_TITLES.length - 1; i >= 0; i--) {
      if (state.realmFame >= PR_TITLES[i].requiredFame) {
        bestIndex = i
        break
      }
    }
    return PR_TITLES[bestIndex]
  }, [state])

  const unlockedChambers = useMemo(() => {
    return PR_CHAMBERS.filter(
      (chamber) => state.realmFame >= chamber.requiredFame
    )
  }, [state])

  const availableAbilities = useMemo(() => {
    return PR_ABILITIES.filter(
      (ability) =>
        state.realmFame >= ability.unlockFame &&
        !state.abilitiesLearned.includes(ability.id)
    )
  }, [state])

  const learnedAbilities = useMemo(() => {
    return PR_ABILITIES.filter((ability) =>
      state.abilitiesLearned.includes(ability.id)
    )
  }, [state])

  const collectedCrystals = useMemo(() => {
    return state.crystalsCollected
      .map((id) => prFindCrystal(id))
      .filter((c): c is PrCrystal => c !== undefined)
  }, [state])

  const crystalStats = useMemo(() => {
    const byRarity: Record<PrRarityKey, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const id of state.crystalsCollected) {
      const crystal = prFindCrystal(id)
      if (crystal) {
        byRarity[crystal.rarity]++
      }
    }
    const totalPower = collectedCrystals.reduce((sum, c) => sum + c.power, 0)
    return {
      byRarity,
      total: state.crystalsCollected.length,
      totalPower,
      rareComplete: byRarity.rare >= 7,
      epicComplete: byRarity.epic >= 7,
      legendaryComplete: byRarity.legendary >= 7,
      anyTierComplete:
        byRarity.common >= 7 ||
        byRarity.uncommon >= 7 ||
        byRarity.rare >= 7 ||
        byRarity.epic >= 7 ||
        byRarity.legendary >= 7,
    }
  }, [state, collectedCrystals])

  const structureSummary = useMemo(() => {
    const summary: Array<{
      id: string
      name: string
      level: number
      maxLevel: number
      upgradeCost: number
      icon: string
      effectPerLevel: string
    }> = []
    for (const structDef of PR_STRUCTURES) {
      const level = state.structures[structDef.id] || 0
      const upgradeCost = prGetStructureUpgradeCost(structDef, level)
      summary.push({
        id: structDef.id,
        name: structDef.name,
        level,
        maxLevel: structDef.maxLevel,
        upgradeCost,
        icon: structDef.icon,
        effectPerLevel: structDef.effectPerLevel,
      })
    }
    return summary
  }, [state])

  const achievementsWithStatus = useMemo(() => {
    const today = prGetTodayString()
    const dailyTask = state.dailyLightTask
    let dailyResult
    if (!dailyTask) {
      dailyResult = { isActive: false, isCompleted: false, isRewardClaimed: false, current: 0, target: PR_DAILY_TASK_BASE_TARGET, description: '' }
    } else if (dailyTask.date !== today) {
      dailyResult = { isActive: false, isCompleted: false, isRewardClaimed: false, current: 0, target: PR_DAILY_TASK_BASE_TARGET, description: prGenerateDailyTaskDescription() }
    } else {
      dailyResult = { isActive: true, isCompleted: dailyTask.completed, isRewardClaimed: dailyTask.rewardClaimed, current: dailyTask.current, target: dailyTask.target, description: dailyTask.description }
    }
    return {
      achievements: PR_ACHIEVEMENTS.map((ach) => ({
        ...ach,
        unlocked: state.achievementsUnlocked.includes(ach.id),
      })),
      dailyTaskProgress: dailyResult,
    }
  }, [state])

  const dailyTaskProgress = achievementsWithStatus.dailyTaskProgress

  const colorBalance = useMemo(() => {
    const charges = state.colorCharge
    const total = Object.values(charges).reduce((s, v) => s + v, 0)
    if (total === 0) return { balanced: true, dominant: null as PrColorBand | null, distribution: {} as Record<PrColorBand, number> }
    const distribution = {} as Record<PrColorBand, number>
    let maxBand: PrColorBand = 'red'
    let maxVal = 0
    for (const band of PR_COLOR_BANDS) {
      distribution[band] = total > 0 ? charges[band] / total : 0
      if (charges[band] > maxVal) {
        maxVal = charges[band]
        maxBand = band
      }
    }
    const values = Object.values(distribution)
    const avg = 1 / PR_COLOR_BANDS.length
    const variance = values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length
    const balanced = variance < 0.02
    return { balanced, dominant: maxBand, distribution }
  }, [state])

  const energyEfficiency = useMemo(() => {
    const structureLevels = Object.values(state.structures)
    const totalStructureLevel = structureLevels.reduce((s, l) => s + l, 0)
    const structureBonus = 1 + totalStructureLevel * 0.02
    const titleBonus = 1 + currentTitle.requiredFame / 5000
    const instrumentBonus = 1 + state.instrumentsOwned.length * 0.01
    return {
      structureBonus: Math.round(structureBonus * 100) / 100,
      titleBonus: Math.round(titleBonus * 100) / 100,
      instrumentBonus: Math.round(instrumentBonus * 100) / 100,
      totalMultiplier: Math.round(structureBonus * titleBonus * instrumentBonus * 100) / 100,
    }
  }, [state, currentTitle])

  // ── Actions (useCallback) ──────────────────────────────────────

  const collectCrystal = useCallback((crystalId: string) => {
    const crystal = prFindCrystal(crystalId)
    if (!crystal) return { success: false, message: 'Crystal not found.' }

    setState((prev) => {
      if (prev.crystalsCollected.includes(crystalId)) {
        return { ...prev }
      }

      const rarityInfo = PR_RARITY[crystal.rarity]
      const energyGain = Math.floor(
        PR_COLLECT_ENERGY_BASE * rarityInfo.energyMultiplier * energyEfficiency.totalMultiplier
      )
      const colorEnergy = prGetColorBandEnergy(crystal.colorBand)
      let fameGain = 0

      if (crystal.rarity === 'rare') fameGain = PR_FAME_PER_RARE_CRYSTAL
      else if (crystal.rarity === 'epic') fameGain = PR_FAME_PER_EPIC_CRYSTAL
      else if (crystal.rarity === 'legendary') fameGain = PR_FAME_PER_LEGENDARY_CRYSTAL
      else if (crystal.rarity === 'uncommon') fameGain = 5
      else fameGain = 1

      const today = prGetTodayString()
      const isDailyActive = prev.dailyLightTask.date === today
      const newDailyTask = isDailyActive
        ? {
            ...prev.dailyLightTask,
            current: prev.dailyLightTask.completed
              ? prev.dailyLightTask.current
              : prev.dailyLightTask.current + 1,
            completed:
              prev.dailyLightTask.completed ||
              prev.dailyLightTask.current + 1 >= prev.dailyLightTask.target,
          }
        : {
            date: today,
            target: PR_DAILY_TASK_BASE_TARGET,
            current: 1,
            completed: 1 >= PR_DAILY_TASK_BASE_TARGET,
            rewardClaimed: false,
            description: prGenerateDailyTaskDescription(),
          }

      const newColorCharge = { ...prev.colorCharge }
      newColorCharge[crystal.colorBand] =
        prClamp(newColorCharge[crystal.colorBand] + colorEnergy, 0, 999)

      return {
        ...prev,
        crystalsCollected: [...prev.crystalsCollected, crystalId],
        lightEnergy: Math.min(prev.lightEnergy + energyGain, PR_MAX_ENERGY),
        colorCharge: newColorCharge,
        spectrumScore: prev.spectrumScore + crystal.power,
        realmFame: prev.realmFame + fameGain,
        dailyLightTask: newDailyTask,
        totalCrystalsCollected: prev.totalCrystalsCollected + 1,
      }
    })

    return { success: true, message: `Collected ${crystal.name}!` }
  }, [energyEfficiency.totalMultiplier])

  const refractLight = useCallback((crystalId: string | null) => {
    return setState((prev) => {
      if (prev.lightEnergy < PR_REFRACT_ENERGY_COST) return prev

      let energyGain = 5
      if (crystalId) {
        const crystal = prFindCrystal(crystalId)
        if (crystal && prev.crystalsCollected.includes(crystalId)) {
          energyGain = Math.floor(crystal.power * 0.3)
        }
      }

      return {
        ...prev,
        lightEnergy: prClamp(
          prev.lightEnergy - PR_REFRACT_ENERGY_COST + energyGain,
          0,
          PR_MAX_ENERGY
        ),
        totalLightRefracted: prev.totalLightRefracted + 1,
        spectrumScore: prev.spectrumScore + 2,
      }
    })
  }, [])

  const mixColors = useCallback((band1: PrColorBand, band2: PrColorBand) => {
    const result = prMixTwoColors(band1, band2)
    if (!result) return { success: false, message: 'These colors cannot be mixed.', resultColor: null }

    return new Promise<{ success: boolean; message: string; resultColor: PrColorBand | null }>((resolve) => {
      setState((prev) => {
        if (prev.lightEnergy < PR_MIX_ENERGY_COST) {
          resolve({ success: false, message: 'Not enough light energy to mix colors.', resultColor: null })
          return prev
        }

        if (prev.colorCharge[band1] < 5 || prev.colorCharge[band2] < 5) {
          resolve({
            success: false,
            message: `Need at least 5 charge in both ${band1} and ${band2} to mix.`,
            resultColor: null,
          })
          return prev
        }

        const newColorCharge = { ...prev.colorCharge }
        newColorCharge[band1] = Math.max(0, newColorCharge[band1] - 5)
        newColorCharge[band2] = Math.max(0, newColorCharge[band2] - 5)
        newColorCharge[result] = prClamp(newColorCharge[result] + 8, 0, 999)

        resolve({
          success: true,
          message: `Mixed ${band1} + ${band2} → ${result}!`,
          resultColor: result,
        })

        return {
          ...prev,
          colorCharge: newColorCharge,
          lightEnergy: prev.lightEnergy - PR_MIX_ENERGY_COST,
          totalColorsMixed: prev.totalColorsMixed + 1,
          spectrumScore: prev.spectrumScore + 3,
        }
      })
    })
  }, [])

  const upgradeStructure = useCallback((structureId: string) => {
    const structureDef = prFindStructure(structureId)
    if (!structureDef) return { success: false, message: 'Structure not found.' }

    return new Promise<{ success: boolean; message: string; newLevel: number }>((resolve) => {
      setState((prev) => {
        const currentLevel = prev.structures[structureId] || 0
        if (currentLevel >= structureDef.maxLevel) {
          resolve({ success: false, message: `${structureDef.name} is already at max level.`, newLevel: currentLevel })
          return prev
        }

        const cost = prGetStructureUpgradeCost(structureDef, currentLevel)
        if (prev.lightEnergy < cost) {
          resolve({ success: false, message: `Need ${cost} light energy to upgrade.`, newLevel: currentLevel })
          return prev
        }

        const newLevel = currentLevel + 1
        const fameGain = newLevel >= 10 ? 50 : newLevel >= 5 ? 20 : 5

        resolve({
          success: true,
          message: `${structureDef.name} upgraded to level ${newLevel}!`,
          newLevel,
        })

        return {
          ...prev,
          structures: { ...prev.structures, [structureId]: newLevel },
          lightEnergy: prev.lightEnergy - cost,
          realmFame: prev.realmFame + fameGain,
          totalStructuresUpgraded: prev.totalStructuresUpgraded + 1,
          spectrumScore: prev.spectrumScore + newLevel * 5,
        }
      })
    })
  }, [])

  const activateAbility = useCallback((abilityId: string) => {
    const abilityDef = prFindAbility(abilityId)
    if (!abilityDef) return { success: false, message: 'Ability not found.' }

    return new Promise<{ success: boolean; message: string; effect: string }>((resolve) => {
      setState((prev) => {
        if (!prev.abilitiesLearned.includes(abilityId)) {
          resolve({ success: false, message: 'Ability not yet learned.', effect: '' })
          return prev
        }

        if (prev.lightEnergy < abilityDef.energyCost) {
          resolve({
            success: false,
            message: `Need ${abilityDef.energyCost} energy to activate ${abilityDef.name}.`,
            effect: '',
          })
          return prev
        }

        const energyReturn = Math.floor(abilityDef.energyCost * PR_ABILITY_ENERGY_RETURN_RATE)

        resolve({
          success: true,
          message: `Activated ${abilityDef.name}!`,
          effect: abilityDef.effect,
        })

        return {
          ...prev,
          lightEnergy: prClamp(
            prev.lightEnergy - abilityDef.energyCost + energyReturn,
            0,
            PR_MAX_ENERGY
          ),
          totalAbilitiesActivated: prev.totalAbilitiesActivated + 1,
          spectrumScore: prev.spectrumScore + 10,
        }
      })
    })
  }, [])

  const learnAbility = useCallback((abilityId: string) => {
    const abilityDef = prFindAbility(abilityId)
    if (!abilityDef) return { success: false, message: 'Ability not found.' }

    return new Promise<{ success: boolean; message: string }>((resolve) => {
      setState((prev) => {
        if (prev.abilitiesLearned.includes(abilityId)) {
          resolve({ success: false, message: 'Ability already learned.' })
          return prev
        }

        if (prev.realmFame < abilityDef.unlockFame) {
          resolve({
            success: false,
            message: `Need ${abilityDef.unlockFame} realm fame to learn this ability.`,
          })
          return prev
        }

        resolve({ success: true, message: `Learned ${abilityDef.name}!` })

        return {
          ...prev,
          abilitiesLearned: [...prev.abilitiesLearned, abilityId],
          spectrumScore: prev.spectrumScore + 20,
        }
      })
    })
  }, [])

  const calibrateLens = useCallback(() => {
    setState((prev) => ({
      ...prev,
      totalLensesCalibrated: prev.totalLensesCalibrated + 1,
      spectrumScore: prev.spectrumScore + 1,
      wavelengthBalance: prClamp(prev.wavelengthBalance + 1, 0, PR_WAVELENGTH_BALANCE_MAX),
    }))
  }, [])

  const scanSpectrum = useCallback(() => {
    return setState((prev) => {
      if (prev.lightEnergy < 5) return prev

      const discoveredBand = PR_COLOR_BANDS[Math.floor(Math.random() * PR_COLOR_BANDS.length)]
      const bonusCharge = Math.floor(Math.random() * 10) + 3

      const newColorCharge = { ...prev.colorCharge }
      newColorCharge[discoveredBand] = prClamp(
        newColorCharge[discoveredBand] + bonusCharge,
        0,
        999
      )

      return {
        ...prev,
        colorCharge: newColorCharge,
        lightEnergy: prev.lightEnergy - 5,
        totalSpectraScanned: prev.totalSpectraScanned + 1,
        spectrumScore: prev.spectrumScore + 4,
      }
    })
  }, [])

  const amplifyLight = useCallback((crystalId: string | null) => {
    setState((prev) => {
      if (prev.lightEnergy < 10) return prev

      let amplifierBonus = 1
      if (crystalId) {
        const crystal = prFindCrystal(crystalId)
        if (crystal && prev.crystalsCollected.includes(crystalId)) {
          amplifierBonus = 1 + crystal.power / 50
        }
      }

      const crystalAmpLevel = prev.structures['crystal-amplifier'] || 0
      const structureMultiplier = 1 + crystalAmpLevel * 0.05
      const energyGain = Math.floor(15 * amplifierBonus * structureMultiplier)

      return {
        ...prev,
        lightEnergy: Math.min(prev.lightEnergy - 10 + energyGain, PR_MAX_ENERGY),
        totalLightAmplified: prev.totalLightAmplified + 1,
        spectrumScore: prev.spectrumScore + 5,
      }
    })
  }, [])

  const bendRay = useCallback((crystalId: string | null) => {
    setState((prev) => {
      let bendQuality = 1
      if (crystalId) {
        const crystal = prFindCrystal(crystalId)
        if (crystal && prev.crystalsCollected.includes(crystalId)) {
          bendQuality = 1 + crystal.power / 30
        }
      }

      const refractionArrayLevel = prev.structures['refraction-array'] || 0
      const precisionBonus = 1 + refractionArrayLevel * 0.03
      const scoreGain = Math.floor(3 * bendQuality * precisionBonus)

      return {
        ...prev,
        totalRaysBent: prev.totalRaysBent + 1,
        spectrumScore: prev.spectrumScore + scoreGain,
        wavelengthBalance: prClamp(
          prev.wavelengthBalance + Math.floor(bendQuality),
          0,
          PR_WAVELENGTH_BALANCE_MAX
        ),
      }
    })
  }, [])

  const visitChamber = useCallback((chamberId: string) => {
    const chamber = prFindChamber(chamberId)
    if (!chamber) return false

    let success = false
    setState((prev) => {
      if (prev.realmFame < chamber.requiredFame) return prev

      const alreadyVisited = prev.chambersVisited.includes(chamberId)
      const newVisited = alreadyVisited
        ? prev.chambersVisited
        : [...prev.chambersVisited, chamberId]

      if (!alreadyVisited) {
        success = true
      }

      return {
        ...prev,
        currentChamber: chamberId,
        chambersVisited: newVisited,
        totalChambersExplored: alreadyVisited
          ? prev.totalChambersExplored
          : prev.totalChambersExplored + 1,
        spectrumScore: alreadyVisited
          ? prev.spectrumScore
          : prev.spectrumScore + 25,
      }
    })

    return success
  }, [])

  const acquireInstrument = useCallback((instrumentId: string) => {
    const instrument = prFindInstrument(instrumentId)
    if (!instrument) return { success: false, message: 'Instrument not found.' }

    return new Promise<{ success: boolean; message: string }>((resolve) => {
      setState((prev) => {
        if (prev.instrumentsOwned.includes(instrumentId)) {
          resolve({ success: false, message: 'Instrument already owned.' })
          return prev
        }

        if (prev.lightEnergy < instrument.cost) {
          resolve({
            success: false,
            message: `Need ${instrument.cost} light energy to acquire this instrument.`,
          })
          return prev
        }

        resolve({ success: true, message: `Acquired ${instrument.name}!` })

        return {
          ...prev,
          instrumentsOwned: [...prev.instrumentsOwned, instrumentId],
          lightEnergy: prev.lightEnergy - instrument.cost,
          spectrumScore: prev.spectrumScore + instrument.power,
        }
      })
    })
  }, [])

  const claimDailyReward = useCallback(() => {
    return new Promise<{ success: boolean; message: string; reward: number }>((resolve) => {
      setState((prev) => {
        const today = prGetTodayString()
        if (prev.dailyLightTask.date !== today) {
          resolve({ success: false, message: 'No active daily task.', reward: 0 })
          return prev
        }
        if (!prev.dailyLightTask.completed) {
          resolve({ success: false, message: 'Daily task not yet completed.', reward: 0 })
          return prev
        }
        if (prev.dailyLightTask.rewardClaimed) {
          resolve({ success: false, message: 'Daily reward already claimed.', reward: 0 })
          return prev
        }

        const reward = 30
        resolve({
          success: true,
          message: `Claimed ${reward} light energy as daily reward!`,
          reward,
        })

        return {
          ...prev,
          lightEnergy: Math.min(prev.lightEnergy + reward, PR_MAX_ENERGY),
          dailyLightTask: { ...prev.dailyLightTask, rewardClaimed: true },
          spectrumScore: prev.spectrumScore + 15,
        }
      })
    })
  }, [])

  const checkAchievements = useCallback(() => {
    const newAchievements: string[] = []

    setState((prev) => {
      const check = (condition: string, met: boolean) => {
        if (met && !prev.achievementsUnlocked.includes(condition)) {
          const ach = prFindAchievement(condition)
          if (ach && !newAchievements.includes(ach.id)) {
            newAchievements.push(ach.id)
          }
        }
      }

      check('collect_first_crystal', prev.crystalsCollected.length >= 1)
      check('collect_5_crystals', prev.crystalsCollected.length >= 5)
      check('collect_15_crystals', prev.crystalsCollected.length >= 15)
      check('collect_all_crystals', prev.crystalsCollected.length >= PR_CRYSTAL_COUNT)
      check('visit_all_chambers', prev.chambersVisited.length >= PR_CHAMBER_COUNT)

      const totalEnergyEarned = prev.spectrumScore
      check('earn_500_energy', totalEnergyEarned >= 500)
      check('earn_2000_energy', totalEnergyEarned >= 2000)

      const anyStructureAt5 = Object.values(prev.structures).some((l) => l >= 5)
      const anyStructureAt10 = Object.values(prev.structures).some((l) => l >= 10)
      check('upgrade_structure_5', anyStructureAt5)
      check('upgrade_structure_10', anyStructureAt10)

      check('own_15_instruments', prev.instrumentsOwned.length >= 15)
      check('learn_10_abilities', prev.abilitiesLearned.length >= 10)
      check('learn_all_abilities', prev.abilitiesLearned.length >= PR_ABILITY_COUNT)
      check('mix_colors_50', prev.totalColorsMixed >= 50)
      check('bend_100_rays', prev.totalRaysBent >= 100)
      check('scan_25_spectra', prev.totalSpectraScanned >= 25)

      // Tier complete check
      const rarityCounts: Record<PrRarityKey, number> = {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
      }
      for (const id of prev.crystalsCollected) {
        const c = prFindCrystal(id)
        if (c) rarityCounts[c.rarity]++
      }
      const tierComplete =
        rarityCounts.common >= 7 ||
        rarityCounts.uncommon >= 7 ||
        rarityCounts.rare >= 7 ||
        rarityCounts.epic >= 7 ||
        rarityCounts.legendary >= 7
      check('collect_tier_complete', tierComplete)

      const structuresAt3 = Object.values(prev.structures).filter((l) => l >= 3).length
      check('upgrade_10_structures_3', structuresAt3 >= 10)
      check('reach_prism_sovereign', prev.realmFame >= 5000)

      if (newAchievements.length === 0) return prev

      const achievementRewards = newAchievements.reduce(
        (acc, achId) => {
          const ach = prFindAchievement(achId)
          if (ach) {
            if (ach.reward.type === 'light_energy') acc.energy += ach.reward.value
            else if (ach.reward.type === 'realm_fame') acc.fame += ach.reward.value
          }
          return acc
        },
        { energy: 0, fame: 0 }
      )

      return {
        ...prev,
        achievementsUnlocked: [...prev.achievementsUnlocked, ...newAchievements],
        lightEnergy: Math.min(prev.lightEnergy + achievementRewards.energy, PR_MAX_ENERGY),
        realmFame: prev.realmFame + achievementRewards.fame,
      }
    })

    return newAchievements
  }, [])

  const getTitle = useCallback((index?: number) => {
    if (index !== undefined) {
      return PR_TITLES[index] || PR_TITLES[0]
    }
    return currentTitle
  }, [currentTitle])

  const getProgress = useCallback(() => {
    return {
      crystalCompletion: {
        collected: state.crystalsCollected.length,
        total: PR_CRYSTAL_COUNT,
        percent: Math.round((state.crystalsCollected.length / PR_CRYSTAL_COUNT) * 100),
      },
      chamberExploration: {
        visited: state.chambersVisited.length,
        total: PR_CHAMBER_COUNT,
        percent: Math.round((state.chambersVisited.length / PR_CHAMBER_COUNT) * 100),
      },
      instrumentCollection: {
        owned: state.instrumentsOwned.length,
        total: PR_INSTRUMENT_COUNT,
        percent: Math.round((state.instrumentsOwned.length / PR_INSTRUMENT_COUNT) * 100),
      },
      abilityMastery: {
        learned: state.abilitiesLearned.length,
        total: PR_ABILITY_COUNT,
        percent: Math.round((state.abilitiesLearned.length / PR_ABILITY_COUNT) * 100),
      },
      achievementCompletion: {
        unlocked: state.achievementsUnlocked.length,
        total: PR_ACHIEVEMENT_COUNT,
        percent: Math.round(
          (state.achievementsUnlocked.length / PR_ACHIEVEMENT_COUNT) * 100
        ),
      },
      structureDevelopment: {
        totalLevels: Object.values(state.structures).reduce((s, l) => s + l, 0),
        maxPossible: PR_STRUCTURE_COUNT * 10,
        percent: Math.round(
          (Object.values(state.structures).reduce((s, l) => s + l, 0) /
            (PR_STRUCTURE_COUNT * 10)) *
            100
        ),
      },
      titleProgress: {
        currentIndex: PR_TITLES.findIndex((t) => t.id === currentTitle.id),
        nextTitle:
          PR_TITLES.findIndex((t) => t.id === currentTitle.id) < PR_TITLES.length - 1
            ? PR_TITLES[PR_TITLES.findIndex((t) => t.id === currentTitle.id) + 1]
            : null,
        fameToNext:
          PR_TITLES.findIndex((t) => t.id === currentTitle.id) < PR_TITLES.length - 1
            ? PR_TITLES[PR_TITLES.findIndex((t) => t.id === currentTitle.id) + 1].requiredFame -
              state.realmFame
            : 0,
      },
    }
  }, [state, currentTitle])

  const getStats = useCallback(() => {
    return {
      lightEnergy: state.lightEnergy,
      maxEnergy: PR_MAX_ENERGY,
      energyPercent: Math.round((state.lightEnergy / PR_MAX_ENERGY) * 100),
      spectrumScore: state.spectrumScore,
      realmFame: state.realmFame,
      wavelengthBalance: state.wavelengthBalance,
      titleName: currentTitle.name,
      titleColor: currentTitle.color,
      crystalsCollected: state.crystalsCollected.length,
      chambersVisited: state.chambersVisited.length,
      instrumentsOwned: state.instrumentsOwned.length,
      abilitiesLearned: state.abilitiesLearned.length,
      achievementsUnlocked: state.achievementsUnlocked.length,
      totalCrystalsCollected: state.totalCrystalsCollected,
      totalLightRefracted: state.totalLightRefracted,
      totalColorsMixed: state.totalColorsMixed,
      totalStructuresUpgraded: state.totalStructuresUpgraded,
      totalAbilitiesActivated: state.totalAbilitiesActivated,
      totalLensesCalibrated: state.totalLensesCalibrated,
      totalSpectraScanned: state.totalSpectraScanned,
      totalLightAmplified: state.totalLightAmplified,
      totalRaysBent: state.totalRaysBent,
      totalChambersExplored: state.totalChambersExplored,
    }
  }, [state, currentTitle])

  const getColorInfo = useCallback((band: PrColorBand) => {
    return {
      band,
      color: PR_SPECTRUM_COLORS[band],
      glow: PR_SPECTRUM_GLOWS[band],
      charge: state.colorCharge[band],
      energyValue: prGetColorBandEnergy(band),
    }
  }, [state.colorCharge])

  const getCrystalDetails = useCallback((crystalId: string) => {
    const crystal = prFindCrystal(crystalId)
    if (!crystal) return null
    const rarityInfo = PR_RARITY[crystal.rarity]
    const collected = state.crystalsCollected.includes(crystalId)
    return {
      ...crystal,
      rarityColor: rarityInfo.color,
      rarityGlow: rarityInfo.glow,
      rarityLabel: rarityInfo.label,
      energyMultiplier: rarityInfo.energyMultiplier,
      collected,
      spectrumColor: PR_SPECTRUM_COLORS[crystal.colorBand],
    }
  }, [state.crystalsCollected])

  const getChamberDetails = useCallback((chamberId: string) => {
    const chamber = prFindChamber(chamberId)
    if (!chamber) return null
    const visited = state.chambersVisited.includes(chamberId)
    const unlocked = state.realmFame >= chamber.requiredFame
    const isCurrent = state.currentChamber === chamberId
    return {
      ...chamber,
      visited,
      unlocked,
      isCurrent,
      spectrumColor: PR_SPECTRUM_COLORS[chamber.colorBand],
    }
  }, [state])

  const getStructureDetails = useCallback((structureId: string) => {
    const structDef = prFindStructure(structureId)
    if (!structDef) return null
    const level = state.structures[structureId] || 0
    const upgradeCost = prGetStructureUpgradeCost(structDef, level)
    return {
      ...structDef,
      level,
      upgradeCost,
      isMaxed: level >= structDef.maxLevel,
      totalEffect: level > 0
        ? structDef.effectPerLevel.replace(/^\+/, `×${level} `)
        : 'None',
    }
  }, [state.structures])

  const getAbilityDetails = useCallback((abilityId: string) => {
    const abilityDef = prFindAbility(abilityId)
    if (!abilityDef) return null
    const learned = state.abilitiesLearned.includes(abilityId)
    const available = state.realmFame >= abilityDef.unlockFame
    const canActivate = learned && state.lightEnergy >= abilityDef.energyCost
    return {
      ...abilityDef,
      learned,
      available,
      canActivate,
    }
  }, [state.abilitiesLearned, state.realmFame, state.lightEnergy])

  const resetRealm = useCallback(() => {
    setState({ ...PR_DEFAULT_STATE })
  }, [])

  const spendEnergy = useCallback((amount: number) => {
    let success = false
    setState((prev) => {
      if (prev.lightEnergy < amount) return prev
      success = true
      return { ...prev, lightEnergy: prev.lightEnergy - amount }
    })
    return success
  }, [])

  const addEnergy = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      lightEnergy: Math.min(prev.lightEnergy + amount, PR_MAX_ENERGY),
    }))
  }, [])

  const addFame = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      realmFame: prev.realmFame + amount,
    }))
  }, [])

  const setColorCharge = useCallback((band: PrColorBand, amount: number) => {
    setState((prev) => ({
      ...prev,
      colorCharge: {
        ...prev.colorCharge,
        [band]: prClamp(amount, 0, 999),
      },
    }))
  }, [])

  // ── Return everything ──────────────────────────────────────────

  return {
    // ── Constants ───────────────────────────────────────────────
    PR_MAX_ENERGY,
    PR_CRYSTAL_COUNT,
    PR_CHAMBER_COUNT,
    PR_INSTRUMENT_COUNT,
    PR_STRUCTURE_COUNT,
    PR_ABILITY_COUNT,
    PR_ACHIEVEMENT_COUNT,
    PR_TITLE_COUNT,
    PR_COLLECT_ENERGY_BASE,
    PR_REFRACT_ENERGY_COST,
    PR_MIX_ENERGY_COST,
    PR_UPGRADE_DISCOUNT_STRUCTURE_LEVEL_5,
    PR_ABILITY_ENERGY_RETURN_RATE,
    PR_WAVELENGTH_BALANCE_MAX,
    PR_FAME_PER_RARE_CRYSTAL,
    PR_FAME_PER_EPIC_CRYSTAL,
    PR_FAME_PER_LEGENDARY_CRYSTAL,
    PR_RARITY,
    PR_RARITY_ORDER,
    PR_SPECTRUM_COLORS,
    PR_SPECTRUM_GLOWS,
    PR_COLOR_BANDS,
    PR_THEME,
    PR_CRYSTALS,
    PR_CHAMBERS,
    PR_INSTRUMENTS,
    PR_STRUCTURES,
    PR_ABILITIES,
    PR_ACHIEVEMENTS,
    PR_TITLES,

    // ── State ───────────────────────────────────────────────────
    crystalsCollected: state.crystalsCollected,
    chambersVisited: state.chambersVisited,
    instrumentsOwned: state.instrumentsOwned,
    structures: state.structures,
    abilitiesLearned: state.abilitiesLearned,
    achievementsUnlocked: state.achievementsUnlocked,
    currentChamber: state.currentChamber,
    lightEnergy: state.lightEnergy,
    colorCharge: state.colorCharge,
    spectrumScore: state.spectrumScore,
    titleIndex: state.titleIndex,
    realmFame: state.realmFame,
    wavelengthBalance: state.wavelengthBalance,
    dailyLightTask: state.dailyLightTask,
    totalCrystalsCollected: state.totalCrystalsCollected,
    totalLightRefracted: state.totalLightRefracted,
    totalColorsMixed: state.totalColorsMixed,
    totalStructuresUpgraded: state.totalStructuresUpgraded,
    totalAbilitiesActivated: state.totalAbilitiesActivated,
    totalLensesCalibrated: state.totalLensesCalibrated,
    totalSpectraScanned: state.totalSpectraScanned,
    totalLightAmplified: state.totalLightAmplified,
    totalRaysBent: state.totalRaysBent,
    totalChambersExplored: state.totalChambersExplored,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,

    // ── Computed ────────────────────────────────────────────────
    currentTitle,
    unlockedChambers,
    availableAbilities,
    learnedAbilities,
    collectedCrystals,
    crystalStats,
    structureSummary,
    achievementsWithStatus,
    dailyTaskProgress,
    colorBalance,
    energyEfficiency,

    // ── Actions ─────────────────────────────────────────────────
    collectCrystal,
    refractLight,
    mixColors,
    upgradeStructure,
    activateAbility,
    learnAbility,
    calibrateLens,
    scanSpectrum,
    amplifyLight,
    bendRay,
    visitChamber,
    acquireInstrument,
    claimDailyReward,
    checkAchievements,
    getTitle,
    getProgress,
    getStats,
    getColorInfo,
    getCrystalDetails,
    getChamberDetails,
    getStructureDetails,
    getAbilityDetails,
    resetRealm,
    spendEnergy,
    addEnergy,
    addFame,
    setColorCharge,
  }
}
