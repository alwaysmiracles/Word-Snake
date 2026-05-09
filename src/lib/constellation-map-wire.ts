// ============================================================================
// Constellation Map / Star Atlas System — Wire Module
// Word Snake Game  ·  SSR-safe  ·  No browser APIs
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CoStar {
  id: string;
  constellationId: string;
  name: string;
  x: number;
  y: number;
  brightness: number;       // 1-5
  color: string;
  discovered: boolean;
  discoveredAt: number | null;
  discoveryCondition: string;
  discoveryThreshold: number;
}

interface CoConnection {
  from: string;
  to: string;
}

interface CoConstellation {
  id: string;
  name: string;
  description: string;
  starCount: number;
  stars: CoStar[];
  connections: CoConnection[];
  discovered: boolean;
  completed: boolean;
  bonusReward: number;
  themeColor: string;
}

type CoEventType =
  | 'meteor_shower'
  | 'solar_eclipse'
  | 'northern_lights'
  | 'comet_sighting'
  | 'star_alignment'
  | 'full_moon'
  | 'supernova'
  | 'zodiac_shift';

interface CoCelestialEvent {
  id: string;
  name: string;
  type: CoEventType;
  description: string;
  durationMs: number;
  bonusType: string;
  bonusAmount: number;
  triggeredAt: number | null;
  expiresAt: number | null;
  witnessed: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

interface CoQuest {
  id: string;
  constellationId: string;
  name: string;
  description: string;
  objectives: CoQuestObjective[];
  rewards: CoQuestReward[];
  started: boolean;
  completed: boolean;
  startedAt: number | null;
  completedAt: number | null;
}

interface CoQuestObjective {
  label: string;
  target: number;
  current: number;
  done: boolean;
}

interface CoQuestReward {
  type: 'cosmic_coins' | 'star_power' | 'title' | 'special_star';
  value: number;
  label: string;
}

interface CoAchievement {
  id: string;
  name: string;
  description: string;
  conditionMet: boolean;
  unlockedAt: number | null;
  rewardCoins: number;
}

interface CoDailyStargazing {
  featuredConstellationId: string;
  daySeed: number;
  lastClaimDate: string;     // YYYY-MM-DD
  streakCount: number;
  freeDiscoveryClaimed: boolean;
}

interface CoNavigation {
  zoomLevel: 'overview' | 'constellation' | 'detail';
  centerX: number;
  centerY: number;
  totalDistance: number;
  lastMovedAt: number | null;
}

interface CoStats {
  starsDiscovered: number;
  constellationsCompleted: number;
  celestialEventsWitnessed: number;
  cosmicCoinsEarned: number;
  cosmicCoinsSpent: number;
  navigationDistance: number;
  starPowerXP: number;
  questsCompleted: number;
  achievementsUnlocked: number;
  wordsContributed: number;
  scoreMilestone: number;
}

interface CoState {
  constellations: CoConstellation[];
  celestialEvents: CoCelestialEvent[];
  quests: CoQuest[];
  achievements: CoAchievement[];
  dailyStargazing: CoDailyStargazing;
  navigation: CoNavigation;
  stats: CoStats;
  initialized: boolean;
  activeEventIds: string[];
}

// ---------------------------------------------------------------------------
// Static data — 12 constellations
// ---------------------------------------------------------------------------

function coBuildConstellations(): CoConstellation[] {
  return [
    // 1. Serpent Major
    {
      id: 'serpent_major',
      name: 'Serpent Major',
      description: 'The great serpent that guards the ancient word vault.',
      starCount: 7,
      themeColor: '#44dd88',
      bonusReward: 500,
      discovered: false,
      completed: false,
      stars: [
        coMakeStar('sm_1', 'serpent_major', 'Alpha Serpentis', 1, 2, 5, '#44ffaa', 'score', 0),
        coMakeStar('sm_2', 'serpent_major', 'Beta Serpentis', 2, 3, 4, '#33ee99', 'score', 500),
        coMakeStar('sm_3', 'serpent_major', 'Gamma Serpentis', 3, 4, 3, '#22dd88', 'words', 10),
        coMakeStar('sm_4', 'serpent_major', 'Delta Serpentis', 4, 5, 4, '#55ffbb', 'words', 25),
        coMakeStar('sm_5', 'serpent_major', 'Epsilon Serpentis', 5, 5, 3, '#44eeaa', 'score', 2000),
        coMakeStar('sm_6', 'serpent_major', 'Zeta Serpentis', 6, 6, 5, '#66ffcc', 'words', 50),
        coMakeStar('sm_7', 'serpent_major', 'Eta Serpentis', 7, 7, 4, '#33cc88', 'words', 100),
      ],
      connections: [
        { from: 'sm_1', to: 'sm_2' }, { from: 'sm_2', to: 'sm_3' },
        { from: 'sm_3', to: 'sm_4' }, { from: 'sm_4', to: 'sm_5' },
        { from: 'sm_5', to: 'sm_6' }, { from: 'sm_6', to: 'sm_7' },
      ],
    },
    // 2. Word Weaver
    {
      id: 'word_weaver',
      name: 'Word Weaver',
      description: 'A spider constellation weaving letters into golden threads.',
      starCount: 8,
      themeColor: '#cc88ff',
      bonusReward: 600,
      discovered: false,
      completed: false,
      stars: [
        coMakeStar('ww_1', 'word_weaver', 'Spinner', 5, 1, 5, '#dd99ff', 'score', 0),
        coMakeStar('ww_2', 'word_weaver', 'Thread Alpha', 3, 3, 4, '#bb77ee', 'words', 15),
        coMakeStar('ww_3', 'word_weaver', 'Thread Beta', 7, 3, 4, '#aa66dd', 'words', 20),
        coMakeStar('ww_4', 'word_weaver', 'Thread Gamma', 2, 5, 3, '#cc88ee', 'score', 1500),
        coMakeStar('ww_5', 'word_weaver', 'Thread Delta', 8, 5, 3, '#bb77dd', 'score', 1500),
        coMakeStar('ww_6', 'word_weaver', 'Anchor Left', 3, 7, 4, '#dd99ee', 'words', 40),
        coMakeStar('ww_7', 'word_weaver', 'Anchor Right', 7, 7, 4, '#cc88ff', 'words', 40),
        coMakeStar('ww_8', 'word_weaver', 'Core Silk', 5, 4, 5, '#eeaaff', 'words', 80),
      ],
      connections: [
        { from: 'ww_1', to: 'ww_2' }, { from: 'ww_1', to: 'ww_3' },
        { from: 'ww_2', to: 'ww_4' }, { from: 'ww_3', to: 'ww_5' },
        { from: 'ww_4', to: 'ww_6' }, { from: 'ww_5', to: 'ww_7' },
        { from: 'ww_6', to: 'ww_8' }, { from: 'ww_7', to: 'ww_8' },
      ],
    },
    // 3. Letter Crown
    {
      id: 'letter_crown',
      name: 'Letter Crown',
      description: 'A regal crown forged from the alphabet\'s finest letters.',
      starCount: 6,
      themeColor: '#ffd700',
      bonusReward: 450,
      discovered: false,
      completed: false,
      stars: [
        coMakeStar('lc_1', 'letter_crown', 'Apex Gem', 5, 1, 5, '#ffe744', 'score', 0),
        coMakeStar('lc_2', 'letter_crown', 'Left Jewel', 2, 3, 4, '#ffd700', 'words', 20),
        coMakeStar('lc_3', 'letter_crown', 'Right Jewel', 8, 3, 4, '#ffcc00', 'words', 20),
        coMakeStar('lc_4', 'letter_crown', 'Left Band', 3, 5, 3, '#ffbb00', 'score', 1000),
        coMakeStar('lc_5', 'letter_crown', 'Right Band', 7, 5, 3, '#ffaa00', 'score', 1000),
        coMakeStar('lc_6', 'letter_crown', 'Crest Base', 5, 7, 4, '#ffd700', 'words', 60),
      ],
      connections: [
        { from: 'lc_1', to: 'lc_2' }, { from: 'lc_1', to: 'lc_3' },
        { from: 'lc_2', to: 'lc_4' }, { from: 'lc_3', to: 'lc_5' },
        { from: 'lc_4', to: 'lc_6' }, { from: 'lc_5', to: 'lc_6' },
      ],
    },
    // 4. Vortex
    {
      id: 'vortex',
      name: 'Vortex',
      description: 'A spiral galaxy consuming all stray words into its core.',
      starCount: 9,
      themeColor: '#00ccff',
      bonusReward: 700,
      discovered: false,
      completed: false,
      stars: [
        coMakeStar('vx_1', 'vortex', 'Core', 5, 5, 5, '#00ddff', 'score', 0),
        coMakeStar('vx_2', 'vortex', 'Arm I-1', 6, 4, 4, '#00bbee', 'words', 10),
        coMakeStar('vx_3', 'vortex', 'Arm I-2', 7, 3, 3, '#00aadd', 'score', 800),
        coMakeStar('vx_4', 'vortex', 'Arm I-3', 8, 2, 3, '#0099cc', 'words', 30),
        coMakeStar('vx_5', 'vortex', 'Arm II-1', 4, 6, 4, '#00bbee', 'words', 10),
        coMakeStar('vx_6', 'vortex', 'Arm II-2', 3, 7, 3, '#00aadd', 'score', 800),
        coMakeStar('vx_7', 'vortex', 'Arm II-3', 2, 8, 3, '#0099cc', 'words', 30),
        coMakeStar('vx_8', 'vortex', 'Halo North', 5, 2, 4, '#44ddff', 'score', 2500),
        coMakeStar('vx_9', 'vortex', 'Halo South', 5, 8, 4, '#44ddff', 'words', 70),
      ],
      connections: [
        { from: 'vx_1', to: 'vx_2' }, { from: 'vx_2', to: 'vx_3' },
        { from: 'vx_3', to: 'vx_4' }, { from: 'vx_1', to: 'vx_5' },
        { from: 'vx_5', to: 'vx_6' }, { from: 'vx_6', to: 'vx_7' },
        { from: 'vx_1', to: 'vx_8' }, { from: 'vx_1', to: 'vx_9' },
        { from: 'vx_8', to: 'vx_2' },
      ],
    },
    // 5. Dragon's Eye
    {
      id: 'dragons_eye',
      name: "Dragon's Eye",
      description: 'A diamond-shaped constellation pulsing with ancient power.',
      starCount: 7,
      themeColor: '#ff4444',
      bonusReward: 550,
      discovered: false,
      completed: false,
      stars: [
        coMakeStar('de_1', 'dragons_eye', 'Top Claw', 5, 1, 5, '#ff5555', 'score', 0),
        coMakeStar('de_2', 'dragons_eye', 'Left Iris', 2, 4, 4, '#ff3333', 'words', 15),
        coMakeStar('de_3', 'dragons_eye', 'Right Iris', 8, 4, 4, '#ff3333', 'words', 15),
        coMakeStar('de_4', 'dragons_eye', 'Pupil', 5, 4, 5, '#ff0000', 'score', 3000),
        coMakeStar('de_5', 'dragons_eye', 'Left Burn', 3, 6, 3, '#ee2222', 'words', 35),
        coMakeStar('de_6', 'dragons_eye', 'Right Burn', 7, 6, 3, '#ee2222', 'words', 35),
        coMakeStar('de_7', 'dragons_eye', 'Bottom Fang', 5, 8, 4, '#ff4444', 'score', 5000),
      ],
      connections: [
        { from: 'de_1', to: 'de_2' }, { from: 'de_1', to: 'de_3' },
        { from: 'de_2', to: 'de_4' }, { from: 'de_3', to: 'de_4' },
        { from: 'de_2', to: 'de_5' }, { from: 'de_3', to: 'de_6' },
        { from: 'de_5', to: 'de_7' }, { from: 'de_6', to: 'de_7' },
      ],
    },
    // 6. Phoenix Wings
    {
      id: 'phoenix_wings',
      name: 'Phoenix Wings',
      description: 'The legendary phoenix spreads its blazing wings across the sky.',
      starCount: 8,
      themeColor: '#ff8800',
      bonusReward: 650,
      discovered: false,
      completed: false,
      stars: [
        coMakeStar('pw_1', 'phoenix_wings', 'Heart Flame', 5, 6, 5, '#ffaa22', 'score', 0),
        coMakeStar('pw_2', 'phoenix_wings', 'Left Wing Tip', 1, 2, 4, '#ff9900', 'words', 25),
        coMakeStar('pw_3', 'phoenix_wings', 'Left Wing Mid', 3, 3, 4, '#ff8800', 'score', 1200),
        coMakeStar('pw_4', 'phoenix_wings', 'Right Wing Tip', 9, 2, 4, '#ff9900', 'words', 25),
        coMakeStar('pw_5', 'phoenix_wings', 'Right Wing Mid', 7, 3, 4, '#ff8800', 'score', 1200),
        coMakeStar('pw_6', 'phoenix_wings', 'Head Plume', 5, 3, 5, '#ffbb33', 'words', 45),
        coMakeStar('pw_7', 'phoenix_wings', 'Tail Feather L', 3, 8, 3, '#ff7700', 'score', 2000),
        coMakeStar('pw_8', 'phoenix_wings', 'Tail Feather R', 7, 8, 3, '#ff7700', 'score', 2000),
      ],
      connections: [
        { from: 'pw_1', to: 'pw_2' }, { from: 'pw_2', to: 'pw_3' },
        { from: 'pw_3', to: 'pw_6' }, { from: 'pw_1', to: 'pw_4' },
        { from: 'pw_4', to: 'pw_5' }, { from: 'pw_5', to: 'pw_6' },
        { from: 'pw_1', to: 'pw_7' }, { from: 'pw_1', to: 'pw_8' },
      ],
    },
    // 7. Ice Crystal
    {
      id: 'ice_crystal',
      name: 'Ice Crystal',
      description: 'A perfect hexagon of frozen stellar light.',
      starCount: 6,
      themeColor: '#88ddff',
      bonusReward: 400,
      discovered: false,
      completed: false,
      stars: [
        coMakeStar('ic_1', 'ice_crystal', 'Frost Apex', 5, 1, 5, '#aaeeff', 'score', 0),
        coMakeStar('ic_2', 'ice_crystal', 'Frost Upper Right', 8, 3, 4, '#99ddff', 'words', 15),
        coMakeStar('ic_3', 'ice_crystal', 'Frost Lower Right', 8, 7, 4, '#88ccee', 'score', 1000),
        coMakeStar('ic_4', 'ice_crystal', 'Frost Nadir', 5, 9, 4, '#77bbdd', 'words', 30),
        coMakeStar('ic_5', 'ice_crystal', 'Frost Lower Left', 2, 7, 4, '#88ccee', 'score', 1000),
        coMakeStar('ic_6', 'ice_crystal', 'Frost Upper Left', 2, 3, 4, '#99ddff', 'words', 15),
      ],
      connections: [
        { from: 'ic_1', to: 'ic_2' }, { from: 'ic_2', to: 'ic_3' },
        { from: 'ic_3', to: 'ic_4' }, { from: 'ic_4', to: 'ic_5' },
        { from: 'ic_5', to: 'ic_6' }, { from: 'ic_6', to: 'ic_1' },
      ],
    },
    // 8. Shadow Realm
    {
      id: 'shadow_realm',
      name: 'Shadow Realm',
      description: 'Stars that flicker between light and darkness, weaving mystery.',
      starCount: 8,
      themeColor: '#9944cc',
      bonusReward: 650,
      discovered: false,
      completed: false,
      stars: [
        coMakeStar('sr_1', 'shadow_realm', 'Void Gate', 5, 1, 5, '#aa55dd', 'score', 0),
        coMakeStar('sr_2', 'shadow_realm', 'Whisper', 2, 3, 3, '#8833bb', 'words', 12),
        coMakeStar('sr_3', 'shadow_realm', 'Echo', 8, 3, 3, '#7722aa', 'score', 600),
        coMakeStar('sr_4', 'shadow_realm', 'Phantom', 1, 5, 4, '#9944cc', 'words', 25),
        coMakeStar('sr_5', 'shadow_realm', 'Wraith', 9, 5, 4, '#9944cc', 'words', 25),
        coMakeStar('sr_6', 'shadow_realm', 'Shade', 3, 7, 3, '#8833bb', 'score', 1500),
        coMakeStar('sr_7', 'shadow_realm', 'Umbral', 7, 7, 3, '#7722aa', 'score', 1500),
        coMakeStar('sr_8', 'shadow_realm', 'Abyss Core', 5, 8, 5, '#bb66ee', 'words', 65),
      ],
      connections: [
        { from: 'sr_1', to: 'sr_2' }, { from: 'sr_1', to: 'sr_3' },
        { from: 'sr_2', to: 'sr_4' }, { from: 'sr_3', to: 'sr_5' },
        { from: 'sr_4', to: 'sr_6' }, { from: 'sr_5', to: 'sr_7' },
        { from: 'sr_6', to: 'sr_8' }, { from: 'sr_7', to: 'sr_8' },
      ],
    },
    // 9. Golden Arch
    {
      id: 'golden_arch',
      name: 'Golden Arch',
      description: 'A luminous arc bridging the eastern and western skies.',
      starCount: 7,
      themeColor: '#ffcc00',
      bonusReward: 500,
      discovered: false,
      completed: false,
      stars: [
        coMakeStar('ga_1', 'golden_arch', 'West Pillar', 1, 8, 4, '#ffdd33', 'score', 0),
        coMakeStar('ga_2', 'golden_arch', 'Rise I', 2, 6, 3, '#ffcc00', 'words', 10),
        coMakeStar('ga_3', 'golden_arch', 'Rise II', 4, 3, 4, '#ffbb00', 'score', 700),
        coMakeStar('ga_4', 'golden_arch', 'Keystone', 5, 2, 5, '#ffdd00', 'words', 35),
        coMakeStar('ga_5', 'golden_arch', 'Fall I', 6, 3, 4, '#ffbb00', 'score', 700),
        coMakeStar('ga_6', 'golden_arch', 'Fall II', 8, 6, 3, '#ffcc00', 'words', 30),
        coMakeStar('ga_7', 'golden_arch', 'East Pillar', 9, 8, 4, '#ffdd33', 'score', 2000),
      ],
      connections: [
        { from: 'ga_1', to: 'ga_2' }, { from: 'ga_2', to: 'ga_3' },
        { from: 'ga_3', to: 'ga_4' }, { from: 'ga_4', to: 'ga_5' },
        { from: 'ga_5', to: 'ga_6' }, { from: 'ga_6', to: 'ga_7' },
      ],
    },
    // 10. Nebula Cloud
    {
      id: 'nebula_cloud',
      name: 'Nebula Cloud',
      description: 'A diffuse cloud of glowing gas where new words are born.',
      starCount: 9,
      themeColor: '#ff66aa',
      bonusReward: 750,
      discovered: false,
      completed: false,
      stars: [
        coMakeStar('nc_1', 'nebula_cloud', 'Dust Core', 5, 5, 5, '#ff77bb', 'score', 0),
        coMakeStar('nc_2', 'nebula_cloud', 'Gas Wisp A', 3, 2, 3, '#ee55aa', 'words', 8),
        coMakeStar('nc_3', 'nebula_cloud', 'Gas Wisp B', 7, 2, 3, '#dd44aa', 'score', 500),
        coMakeStar('nc_4', 'nebula_cloud', 'Plasma Knot', 2, 4, 4, '#ff66bb', 'words', 20),
        coMakeStar('nc_5', 'nebula_cloud', 'Ion Stream', 8, 4, 4, '#ff66bb', 'words', 20),
        coMakeStar('nc_6', 'nebula_cloud', 'Stellar Nursery', 4, 7, 4, '#ee55cc', 'score', 1800),
        coMakeStar('nc_7', 'nebula_cloud', 'Birth Chamber', 6, 7, 4, '#dd44cc', 'score', 1800),
        coMakeStar('nc_8', 'nebula_cloud', 'Outer Veil L', 1, 6, 3, '#cc33aa', 'words', 40),
        coMakeStar('nc_9', 'nebula_cloud', 'Outer Veil R', 9, 6, 3, '#cc33aa', 'words', 40),
      ],
      connections: [
        { from: 'nc_1', to: 'nc_2' }, { from: 'nc_1', to: 'nc_3' },
        { from: 'nc_2', to: 'nc_4' }, { from: 'nc_3', to: 'nc_5' },
        { from: 'nc_4', to: 'nc_8' }, { from: 'nc_5', to: 'nc_9' },
        { from: 'nc_1', to: 'nc_6' }, { from: 'nc_1', to: 'nc_7' },
        { from: 'nc_6', to: 'nc_8' }, { from: 'nc_7', to: 'nc_9' },
      ],
    },
    // 11. Crystal Pyramid
    {
      id: 'crystal_pyramid',
      name: 'Crystal Pyramid',
      description: 'A triangular constellation of immense cosmic energy.',
      starCount: 6,
      themeColor: '#44ffcc',
      bonusReward: 480,
      discovered: false,
      completed: false,
      stars: [
        coMakeStar('cp_1', 'crystal_pyramid', 'Apex Stone', 5, 1, 5, '#55ffdd', 'score', 0),
        coMakeStar('cp_2', 'crystal_pyramid', 'Left Facet', 2, 5, 4, '#44eecc', 'words', 20),
        coMakeStar('cp_3', 'crystal_pyramid', 'Right Facet', 8, 5, 4, '#44eecc', 'words', 20),
        coMakeStar('cp_4', 'crystal_pyramid', 'Base Left', 1, 9, 3, '#33ddbb', 'score', 1200),
        coMakeStar('cp_5', 'crystal_pyramid', 'Base Center', 5, 9, 4, '#55ffcc', 'words', 50),
        coMakeStar('cp_6', 'crystal_pyramid', 'Base Right', 9, 9, 3, '#33ddbb', 'score', 1200),
      ],
      connections: [
        { from: 'cp_1', to: 'cp_2' }, { from: 'cp_1', to: 'cp_3' },
        { from: 'cp_2', to: 'cp_4' }, { from: 'cp_2', to: 'cp_5' },
        { from: 'cp_3', to: 'cp_5' }, { from: 'cp_3', to: 'cp_6' },
      ],
    },
    // 12. Infinity Loop
    {
      id: 'infinity_loop',
      name: 'Infinity Loop',
      description: 'A figure-eight constellation representing eternal cycles.',
      starCount: 8,
      themeColor: '#aa88ff',
      bonusReward: 800,
      discovered: false,
      completed: false,
      stars: [
        coMakeStar('il_1', 'infinity_loop', 'Left Cross', 3, 5, 5, '#bb99ff', 'score', 0),
        coMakeStar('il_2', 'infinity_loop', 'Left Top', 1, 2, 4, '#aa88ff', 'words', 18),
        coMakeStar('il_3', 'infinity_loop', 'Left Bot', 1, 8, 4, '#9977ee', 'score', 900),
        coMakeStar('il_4', 'infinity_loop', 'Center', 5, 5, 5, '#cc99ff', 'words', 55),
        coMakeStar('il_5', 'infinity_loop', 'Right Cross', 7, 5, 5, '#bb99ff', 'words', 30),
        coMakeStar('il_6', 'infinity_loop', 'Right Top', 9, 2, 4, '#aa88ff', 'score', 900),
        coMakeStar('il_7', 'infinity_loop', 'Right Bot', 9, 8, 4, '#9977ee', 'words', 45),
        coMakeStar('il_8', 'infinity_loop', 'Nexus', 5, 4, 4, '#ddaaff', 'score', 4000),
      ],
      connections: [
        { from: 'il_1', to: 'il_2' }, { from: 'il_2', to: 'il_3' },
        { from: 'il_3', to: 'il_1' }, { from: 'il_1', to: 'il_4' },
        { from: 'il_4', to: 'il_5' }, { from: 'il_5', to: 'il_6' },
        { from: 'il_6', to: 'il_7' }, { from: 'il_7', to: 'il_5' },
        { from: 'il_4', to: 'il_8' },
      ],
    },
  ];
}

function coMakeStar(
  id: string,
  constellationId: string,
  name: string,
  x: number,
  y: number,
  brightness: number,
  color: string,
  discoveryCondition: string,
  discoveryThreshold: number,
): CoStar {
  return {
    id,
    constellationId,
    name,
    x,
    y,
    brightness,
    color,
    discovered: false,
    discoveredAt: null,
    discoveryCondition,
    discoveryThreshold,
  };
}

// ---------------------------------------------------------------------------
// Static data — 8 celestial events
// ---------------------------------------------------------------------------

function coBuildCelestialEvents(): CoCelestialEvent[] {
  return [
    {
      id: 'meteor_shower',
      name: 'Meteor Shower',
      type: 'meteor_shower',
      description: 'A dazzling rain of meteors grants bonus XP for every word played.',
      durationMs: 300_000,
      bonusType: 'xp_multiplier',
      bonusAmount: 1.5,
      triggeredAt: null,
      expiresAt: null,
      witnessed: false,
      rarity: 'common',
    },
    {
      id: 'solar_eclipse',
      name: 'Solar Eclipse',
      type: 'solar_eclipse',
      description: 'The sun dims — a mysterious modifier shuffles letter values.',
      durationMs: 120_000,
      bonusType: 'mystery_modifier',
      bonusAmount: 2,
      triggeredAt: null,
      expiresAt: null,
      witnessed: false,
      rarity: 'uncommon',
    },
    {
      id: 'northern_lights',
      name: 'Northern Lights',
      type: 'northern_lights',
      description: 'Aurora borealis fills the sky with luck bonuses and vivid colours.',
      durationMs: 240_000,
      bonusType: 'luck_bonus',
      bonusAmount: 3,
      triggeredAt: null,
      expiresAt: null,
      witnessed: false,
      rarity: 'uncommon',
    },
    {
      id: 'comet_sighting',
      name: 'Comet Sighting',
      type: 'comet_sighting',
      description: 'A rare comet streaks across — massive reward for swift players.',
      durationMs: 60_000,
      bonusType: 'big_reward',
      bonusAmount: 1000,
      triggeredAt: null,
      expiresAt: null,
      witnessed: false,
      rarity: 'rare',
    },
    {
      id: 'star_alignment',
      name: 'Star Alignment',
      type: 'star_alignment',
      description: 'All constellations align — every bonus is simultaneously active.',
      durationMs: 60_000,
      bonusType: 'all_bonuses',
      bonusAmount: 1,
      triggeredAt: null,
      expiresAt: null,
      witnessed: false,
      rarity: 'legendary',
    },
    {
      id: 'full_moon',
      name: 'Full Moon',
      type: 'full_moon',
      description: 'The full moon doubles all XP earned during its glow.',
      durationMs: 300_000,
      bonusType: 'xp_multiplier',
      bonusAmount: 2,
      triggeredAt: null,
      expiresAt: null,
      witnessed: false,
      rarity: 'common',
    },
    {
      id: 'supernova',
      name: 'Supernova',
      type: 'supernova',
      description: 'A nearby star explodes — massive burst of cosmic points!',
      durationMs: 30_000,
      bonusType: 'point_burst',
      bonusAmount: 5000,
      triggeredAt: null,
      expiresAt: null,
      witnessed: false,
      rarity: 'rare',
    },
    {
      id: 'zodiac_shift',
      name: 'Zodiac Shift',
      type: 'zodiac_shift',
      description: 'The zodiac wheel turns — random zodiac bonuses activate.',
      durationMs: 180_000,
      bonusType: 'random_zodiac',
      bonusAmount: 4,
      triggeredAt: null,
      expiresAt: null,
      witnessed: false,
      rarity: 'uncommon',
    },
  ];
}

// ---------------------------------------------------------------------------
// Static data — 12 quests (one per constellation)
// ---------------------------------------------------------------------------

function coBuildQuests(constellations: CoConstellation[]): CoQuest[] {
  return constellations.map((c) => ({
    id: `quest_${c.id}`,
    constellationId: c.id,
    name: `${c.name} Chronicle`,
    description: `Discover all stars in the ${c.name} constellation and forge its cosmic pattern.`,
    objectives: [
      { label: `Discover stars in ${c.name}`, target: c.starCount, current: 0, done: false },
      { label: `Connect pattern for ${c.name}`, target: 1, current: 0, done: false },
      { label: `Earn constellation bonus`, target: 1, current: 0, done: false },
    ],
    rewards: [
      { type: 'cosmic_coins', value: c.bonusReward, label: `${c.bonusReward} Cosmic Coins` },
      { type: 'star_power', value: 50, label: '50 Star Power XP' },
      { type: 'title', value: 1, label: `Bearer of ${c.name}` },
    ],
    started: false,
    completed: false,
    startedAt: null,
    completedAt: null,
  }));
}

// ---------------------------------------------------------------------------
// Static data — Achievements
// ---------------------------------------------------------------------------

function coBuildAchievements(): CoAchievement[] {
  return [
    { id: 'ach_first_star', name: 'First Light', description: 'Discover your very first star.', conditionMet: false, unlockedAt: null, rewardCoins: 50 },
    { id: 'ach_five_stars', name: 'Stargazer', description: 'Discover 5 stars total.', conditionMet: false, unlockedAt: null, rewardCoins: 100 },
    { id: 'ach_twenty_stars', name: 'Constellation Hunter', description: 'Discover 20 stars.', conditionMet: false, unlockedAt: null, rewardCoins: 300 },
    { id: 'ach_first_constellation', name: 'Pattern Forger', description: 'Complete your first constellation.', conditionMet: false, unlockedAt: null, rewardCoins: 200 },
    { id: 'ach_all_constellations', name: 'Master of the Heavens', description: 'Complete all 12 constellations.', conditionMet: false, unlockedAt: null, rewardCoins: 2000 },
    { id: 'ach_first_event', name: 'Witness the Cosmos', description: 'Witness your first celestial event.', conditionMet: false, unlockedAt: null, rewardCoins: 75 },
    { id: 'ach_five_events', name: 'Celestial Observer', description: 'Witness 5 different celestial events.', conditionMet: false, unlockedAt: null, rewardCoins: 250 },
    { id: 'ach_star_power_5', name: 'Star Adept', description: 'Reach Star Power Level 5.', conditionMet: false, unlockedAt: null, rewardCoins: 150 },
    { id: 'ach_star_power_10', name: 'Star Sage', description: 'Reach Star Power Level 10.', conditionMet: false, unlockedAt: null, rewardCoins: 500 },
    { id: 'ach_star_power_20', name: 'Star Deity', description: 'Reach Star Power Level 20.', conditionMet: false, unlockedAt: null, rewardCoins: 1500 },
    { id: 'ach_streak_7', name: 'Weekly Astronomer', description: 'Maintain a 7-day stargazing streak.', conditionMet: false, unlockedAt: null, rewardCoins: 200 },
    { id: 'ach_streak_30', name: 'Monthly Astronomer', description: 'Maintain a 30-day stargazing streak.', conditionMet: false, unlockedAt: null, rewardCoins: 800 },
    { id: 'ach_coins_1000', name: 'Cosmic Hoarder', description: 'Earn a total of 1,000 Cosmic Coins.', conditionMet: false, unlockedAt: null, rewardCoins: 100 },
    { id: 'ach_coins_10000', name: 'Wealth of the Stars', description: 'Earn a total of 10,000 Cosmic Coins.', conditionMet: false, unlockedAt: null, rewardCoins: 500 },
    { id: 'ach_first_quest', name: 'Quest Initiate', description: 'Complete your first constellation quest.', conditionMet: false, unlockedAt: null, rewardCoins: 150 },
    { id: 'ach_all_quests', name: 'Quest Master', description: 'Complete all 12 constellation quests.', conditionMet: false, unlockedAt: null, rewardCoins: 3000 },
  ];
}

// ---------------------------------------------------------------------------
// State initialiser
// ---------------------------------------------------------------------------

function coCreateInitialState(): CoState {
  const constellations = coBuildConstellations();
  return {
    constellations,
    celestialEvents: coBuildCelestialEvents(),
    quests: coBuildQuests(constellations),
    achievements: coBuildAchievements(),
    dailyStargazing: {
      featuredConstellationId: 'serpent_major',
      daySeed: coDaySeed(),
      lastClaimDate: '',
      streakCount: 0,
      freeDiscoveryClaimed: false,
    },
    navigation: {
      zoomLevel: 'overview',
      centerX: 5,
      centerY: 5,
      totalDistance: 0,
      lastMovedAt: null,
    },
    stats: {
      starsDiscovered: 0,
      constellationsCompleted: 0,
      celestialEventsWitnessed: 0,
      cosmicCoinsEarned: 0,
      cosmicCoinsSpent: 0,
      navigationDistance: 0,
      starPowerXP: 0,
      questsCompleted: 0,
      achievementsUnlocked: 0,
      wordsContributed: 0,
      scoreMilestone: 0,
    },
    initialized: true,
    activeEventIds: [],
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function coDaySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function coDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function coFindConstellation(state: CoState, id: string): CoConstellation | undefined {
  return state.constellations.find((c) => c.id === id);
}

function coFindStar(state: CoState, id: string): CoStar | undefined {
  for (const c of state.constellations) {
    const star = c.stars.find((s) => s.id === id);
    if (star) return star;
  }
  return undefined;
}

function coFindEvent(state: CoState, id: string): CoCelestialEvent | undefined {
  return state.celestialEvents.find((e) => e.id === id);
}

function coFindQuest(state: CoState, id: string): CoQuest | undefined {
  return state.quests.find((q) => q.id === id);
}

function coEuclideanDist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function coClamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// ---------------------------------------------------------------------------
// State singleton (SSR-safe)
// ---------------------------------------------------------------------------

let state: CoState | null = null;

function ensureInit(): CoState {
  if (!state) {
    state = coCreateInitialState();
  }
  return state;
}

// ============================================================================
// EXPORTED FUNCTIONS
// ============================================================================

// ---- State ----------------------------------------------------------------

/** Returns the current internal state (for debugging / serialisation). */
export function coGetState(): CoState {
  return ensureInit();
}

/** Resets the entire constellation module state to defaults. */
export function coResetState(): void {
  state = null;
}

// ---- Constellations -------------------------------------------------------

/** Returns all 12 constellations. */
export function coGetConstellations(): CoConstellation[] {
  return ensureInit().constellations;
}

/** Returns a single constellation by id. */
export function coGetConstellation(id: string): CoConstellation | undefined {
  return coFindConstellation(ensureInit(), id);
}

/** Returns a single constellation by exact name match. */
export function coGetConstellationByName(name: string): CoConstellation | undefined {
  return ensureInit().constellations.find((c) => c.name === name);
}

// ---- Stars ----------------------------------------------------------------

/** Returns a flat array of every star across all constellations. */
export function coGetStars(): CoStar[] {
  const s = ensureInit();
  return s.constellations.flatMap((c) => c.stars);
}

/** Returns a single star by id. */
export function coGetStar(id: string): CoStar | undefined {
  return coFindStar(ensureInit(), id);
}

/**
 * Attempts to discover a star based on the player's current score / word count.
 * Updates the star and its parent constellation state. Returns the star if discovered,
 * or `null` if conditions were not met or already discovered.
 */
export function coDiscoverStar(id: string): CoStar | null {
  const s = ensureInit();
  const star = coFindStar(s, id);
  if (!star || star.discovered) return null;

  let met = false;
  if (star.discoveryCondition === 'score' && s.stats.scoreMilestone >= star.discoveryThreshold) {
    met = true;
  } else if (star.discoveryCondition === 'words' && s.stats.wordsContributed >= star.discoveryThreshold) {
    met = true;
  }

  if (!met) return null;

  star.discovered = true;
  star.discoveredAt = Date.now();
  s.stats.starsDiscovered++;

  // Mark constellation as discovered once its first star is found
  const constellation = coFindConstellation(s, star.constellationId);
  if (constellation && !constellation.discovered) {
    constellation.discovered = true;
  }

  // Check if constellation is now fully completed
  if (constellation) {
    const allFound = constellation.stars.every((st) => st.discovered);
    if (allFound && !constellation.completed) {
      constellation.completed = true;
      s.stats.constellationsCompleted++;
    }
  }

  return star;
}

/** Returns only the stars the player has discovered so far. */
export function coGetDiscoveredStars(): CoStar[] {
  return coGetStars().filter((s) => s.discovered);
}

// ---- Star Map / Grid ------------------------------------------------------

/** Returns the full star map with constellations, connections, and star positions. */
export function coGetStarMap(): {
  constellations: CoConstellation[];
  grid: (string | null)[][];
} {
  const s = ensureInit();
  return { constellations: s.constellations, grid: coBuildGrid(s) };
}

/** Returns a 10×10 grid mapping each cell to a star id (or null). */
export function coGetStarGrid(): (string | null)[][] {
  return coBuildGrid(ensureInit());
}

/** Returns the { x, y } grid position of a given star. */
export function coGetStarPosition(starId: string): { x: number; y: number } | null {
  const star = coFindStar(ensureInit(), starId);
  if (!star) return null;
  return { x: star.x, y: star.y };
}

function coBuildGrid(s: CoState): (string | null)[][] {
  const grid: (string | null)[][] = Array.from({ length: 10 }, () =>
    Array.from({ length: 10 }, () => null),
  );
  for (const c of s.constellations) {
    for (const star of c.stars) {
      if (star.x >= 0 && star.x < 10 && star.y >= 0 && star.y < 10) {
        grid[star.y][star.x] = star.id;
      }
    }
  }
  return grid;
}

// ---- Celestial Events -----------------------------------------------------

/** Returns all 8 celestial event definitions. */
export function coGetCelestialEvents(): CoCelestialEvent[] {
  return ensureInit().celestialEvents;
}

/** Returns a single celestial event by id. */
export function coGetEvent(id: string): CoCelestialEvent | undefined {
  return coFindEvent(ensureInit(), id);
}

/**
 * Triggers a celestial event, making it active for its configured duration.
 * If the event is already active this is a no-op. Returns the triggered event.
 */
export function coTriggerEvent(eventId: string): CoCelestialEvent | null {
  const s = ensureInit();
  const ev = coFindEvent(s, eventId);
  if (!ev) return null;

  // Already active — skip
  if (s.activeEventIds.includes(eventId)) return ev;

  ev.triggeredAt = Date.now();
  ev.expiresAt = Date.now() + ev.durationMs;

  if (!ev.witnessed) {
    ev.witnessed = true;
    s.stats.celestialEventsWitnessed++;
  }

  s.activeEventIds.push(eventId);
  return ev;
}

/** Returns the list of currently active (non-expired) event ids. */
export function coGetActiveEvents(): CoCelestialEvent[] {
  const s = ensureInit();
  const now = Date.now();
  const active: CoCelestialEvent[] = [];

  // Prune expired
  s.activeEventIds = s.activeEventIds.filter((eid) => {
    const ev = coFindEvent(s, eid);
    if (!ev || !ev.expiresAt || ev.expiresAt < now) return false;
    active.push(ev);
    return true;
  });

  return active;
}

/**
 * Returns the cumulative bonus multiplier from all active events.
 * Adds up bonus amounts grouped by bonus type for easy consumption.
 */
export function coGetEventBonus(): Record<string, number> {
  const active = coGetActiveEvents();
  const bonuses: Record<string, number> = {};
  for (const ev of active) {
    const key = ev.bonusType;
    bonuses[key] = (bonuses[key] ?? 0) + ev.bonusAmount;
  }
  return bonuses;
}

// ---- Constellation Quests -------------------------------------------------

/** Returns all 12 constellation quests. */
export function coGetQuests(): CoQuest[] {
  return ensureInit().quests;
}

/** Returns a single quest by id. */
export function coGetQuest(id: string): CoQuest | undefined {
  return coFindQuest(ensureInit(), id);
}

/**
 * Starts a quest (marks it as in-progress). No-op if already started or completed.
 */
export function coStartQuest(questId: string): CoQuest | null {
  const s = ensureInit();
  const q = coFindQuest(s, questId);
  if (!q || q.started || q.completed) return null;
  q.started = true;
  q.startedAt = Date.now();
  return q;
}

/**
 * Marks a quest as completed and grants its rewards.
 * Returns the quest or null if prerequisites not met.
 */
export function coCompleteQuest(questId: string): CoQuest | null {
  const s = ensureInit();
  const q = coFindQuest(s, questId);
  if (!q || !q.started || q.completed) return null;

  // All objectives must be done
  const allDone = q.objectives.every((o) => o.done);
  if (!allDone) return null;

  q.completed = true;
  q.completedAt = Date.now();
  s.stats.questsCompleted++;

  // Grant rewards
  for (const r of q.rewards) {
    if (r.type === 'cosmic_coins') {
      s.stats.cosmicCoinsEarned += r.value;
    } else if (r.type === 'star_power') {
      s.stats.starPowerXP += r.value;
    }
    // 'title' and 'special_star' are tracked externally
  }

  return q;
}

/** Returns a summary of every quest's progress (current / target for each objective). */
export function coGetQuestProgress(): Array<{
  questId: string;
  name: string;
  completed: boolean;
  objectives: Array<{ label: string; current: number; target: number; done: boolean }>;
}> {
  return ensureInit().quests.map((q) => ({
    questId: q.id,
    name: q.name,
    completed: q.completed,
    objectives: q.objectives.map((o) => ({
      label: o.label,
      current: o.current,
      target: o.target,
      done: o.done,
    })),
  }));
}

/** Returns completion info for a constellation: stars found / total, percent, bonus granted. */
export function coGetConstellationCompletion(id: string): {
  total: number;
  discovered: number;
  percent: number;
  completed: boolean;
  bonusGranted: boolean;
} | null {
  const c = coFindConstellation(ensureInit(), id);
  if (!c) return null;
  const discovered = c.stars.filter((s) => s.discovered).length;
  return {
    total: c.starCount,
    discovered,
    percent: Math.round((discovered / c.starCount) * 100),
    completed: c.completed,
    bonusGranted: c.completed,
  };
}

// ---- Daily Stargazing -----------------------------------------------------

/** Returns today's daily stargazing info: featured constellation, streak, claim status. */
export function coGetDailyStargazing(): CoDailyStargazing & {
  todayStr: string;
  isToday: boolean;
} {
  const s = ensureInit();
  const today = coDateStr();
  const isToday = s.dailyStargazing.lastClaimDate === today;
  const seed = coDaySeed();

  // Rotate featured constellation based on day seed
  const idx = seed % s.constellations.length;
  const featured = s.constellations[idx].id;

  // Auto-advance day if stale
  if (s.dailyStargazing.daySeed !== seed) {
    // Check if yesterday's streak was continuous
    const yesterdaySeed = seed - 1;
    if (s.dailyStargazing.lastClaimDate && s.dailyStargazing.daySeed === yesterdaySeed) {
      // Streak continues — do nothing, will increment on claim
    } else if (s.dailyStargazing.daySeed !== seed) {
      // Gap detected, reset streak
      if (s.dailyStargazing.daySeed !== 0 && s.dailyStargazing.lastClaimDate !== today) {
        s.dailyStargazing.streakCount = 0;
      }
    }
    s.dailyStargazing.daySeed = seed;
    s.dailyStargazing.featuredConstellationId = featured;
    s.dailyStargazing.freeDiscoveryClaimed = false;
  }

  return { ...s.dailyStargazing, todayStr: today, isToday };
}

/**
 * Claims the free daily star discovery. Returns the discovered star id,
 * or null if already claimed today.
 */
export function coClaimDailyStar(): string | null {
  const s = ensureInit();
  const today = coDateStr();
  const daily = coGetDailyStargazing();

  if (daily.freeDiscoveryClaimed) return null;

  // Find first undiscovered star in featured constellation
  const featured = coFindConstellation(s, daily.featuredConstellationId);
  if (!featured) return null;

  const undiscovered = featured.stars.find((st) => !st.discovered);
  if (!undiscovered) return null;

  undiscovered.discovered = true;
  undiscovered.discoveredAt = Date.now();
  s.stats.starsDiscovered++;

  if (!featured.discovered) featured.discovered = true;

  // Check constellation completion
  const allFound = featured.stars.every((st) => st.discovered);
  if (allFound && !featured.completed) {
    featured.completed = true;
    s.stats.constellationsCompleted++;
  }

  // Update daily state
  const wasYesterday = s.dailyStargazing.lastClaimDate === coDateStrForOffset(-1);
  if (s.dailyStargazing.lastClaimDate === today) {
    // Same day claim — no streak change
  } else if (wasYesterday || s.dailyStargazing.lastClaimDate === '') {
    s.dailyStargazing.streakCount++;
  } else {
    s.dailyStargazing.streakCount = 1;
  }

  s.dailyStargazing.lastClaimDate = today;
  s.dailyStargazing.freeDiscoveryClaimed = true;

  return undiscovered.id;
}

/** Returns the current daily streak count. */
export function coGetDailyStreak(): number {
  return coGetDailyStargazing().streakCount;
}

function coDateStrForOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ---- Cosmic Coins ---------------------------------------------------------

/** Returns current cosmic coin balance (earned − spent). */
export function coGetCosmicCoins(): number {
  const s = ensureInit();
  return s.stats.cosmicCoinsEarned - s.stats.cosmicCoinsSpent;
}

/** Adds cosmic coins to the player's balance. */
export function coAddCosmicCoins(amount: number): number {
  const s = ensureInit();
  const clamped = Math.max(0, Math.round(amount));
  s.stats.cosmicCoinsEarned += clamped;
  return s.stats.cosmicCoinsEarned - s.stats.cosmicCoinsSpent;
}

/** Spends cosmic coins if the player has enough. Returns true on success. */
export function coSpendCosmicCoins(amount: number): boolean {
  const s = ensureInit();
  const clamped = Math.max(0, Math.round(amount));
  const balance = s.stats.cosmicCoinsEarned - s.stats.cosmicCoinsSpent;
  if (balance < clamped) return false;
  s.stats.cosmicCoinsSpent += clamped;
  return true;
}

// ---- Cosmic Statistics ----------------------------------------------------

/** Returns the full stats object. */
export function coGetStats(): CoStats {
  return { ...ensureInit().stats };
}

/** Returns the total number of stars discovered so far. */
export function coGetTotalStarsDiscovered(): number {
  return ensureInit().stats.starsDiscovered;
}

/** Returns the total number of constellations (always 12). */
export function coGetTotalConstellations(): number {
  return ensureInit().constellations.length;
}

// ---- Star Power -----------------------------------------------------------

/** Returns the raw star power XP accumulated. */
export function coGetStarPower(): number {
  return ensureInit().stats.starPowerXP;
}

/**
 * Returns the star power level (1-20) derived from XP thresholds.
 * Level formula: level = min(20, floor(sqrt(xp / 100)) + 1)
 */
export function coGetStarPowerLevel(): number {
  const xp = ensureInit().stats.starPowerXP;
  return coClamp(Math.floor(Math.sqrt(xp / 100)) + 1, 1, 20);
}

/** Adds star power XP. Returns the new level. */
export function coAddStarPowerXP(amount: number): number {
  const s = ensureInit();
  s.stats.starPowerXP += Math.max(0, Math.round(amount));
  return coGetStarPowerLevel();
}

// ---- Achievements ---------------------------------------------------------

/** Returns all achievement definitions with their unlock status. */
export function coGetAchievements(): CoAchievement[] {
  return ensureInit().achievements;
}

/**
 * Evaluates all achievement conditions against current state and unlocks any
 * newly met ones. Returns the list of newly unlocked achievement ids.
 */
export function coCheckAchievements(): string[] {
  const s = ensureInit();
  const newly: string[] = [];

  const check = (id: string, cond: boolean) => {
    const a = s.achievements.find((ach) => ach.id === id);
    if (a && !a.conditionMet && cond) {
      a.conditionMet = true;
      a.unlockedAt = Date.now();
      s.stats.achievementsUnlocked++;
      s.stats.cosmicCoinsEarned += a.rewardCoins;
      newly.push(id);
    }
  };

  const disc = s.stats.starsDiscovered;
  const comp = s.stats.constellationsCompleted;
  const evts = s.stats.celestialEventsWitnessed;
  const lvl = coGetStarPowerLevel();
  const streak = s.dailyStargazing.streakCount;
  const earned = s.stats.cosmicCoinsEarned;
  const quests = s.stats.questsCompleted;

  check('ach_first_star', disc >= 1);
  check('ach_five_stars', disc >= 5);
  check('ach_twenty_stars', disc >= 20);
  check('ach_first_constellation', comp >= 1);
  check('ach_all_constellations', comp >= 12);
  check('ach_first_event', evts >= 1);
  check('ach_five_events', evts >= 5);
  check('ach_star_power_5', lvl >= 5);
  check('ach_star_power_10', lvl >= 10);
  check('ach_star_power_20', lvl >= 20);
  check('ach_streak_7', streak >= 7);
  check('ach_streak_30', streak >= 30);
  check('ach_coins_1000', earned >= 1000);
  check('ach_coins_10000', earned >= 10000);
  check('ach_first_quest', quests >= 1);
  check('ach_all_quests', quests >= 12);

  return newly;
}

// ---- Map Overview / Dashboard ---------------------------------------------

/**
 * Returns a high-level overview of the constellation map suitable for a
 * summary card or landing page.
 */
export function coGetConstellationMapOverview(): {
  totalConstellations: number;
  completedConstellations: number;
  totalStars: number;
  discoveredStars: number;
  activeEvents: CoCelestialEvent[];
  starPowerLevel: number;
  cosmicCoins: number;
  dailyStreak: number;
  completionPercent: number;
} {
  const s = ensureInit();
  const totalStars = s.constellations.reduce((sum, c) => sum + c.starCount, 0);
  return {
    totalConstellations: s.constellations.length,
    completedConstellations: s.stats.constellationsCompleted,
    totalStars,
    discoveredStars: s.stats.starsDiscovered,
    activeEvents: coGetActiveEvents(),
    starPowerLevel: coGetStarPowerLevel(),
    cosmicCoins: coGetCosmicCoins(),
    dailyStreak: s.dailyStargazing.streakCount,
    completionPercent: totalStars > 0 ? Math.round((s.stats.starsDiscovered / totalStars) * 100) : 0,
  };
}

/** Returns a dashboard-ready data packet for the constellation map UI. */
export function coGetMapDashboard(): {
  stats: CoStats;
  starPowerLevel: number;
  cosmicCoins: number;
  activeEvents: CoCelestialEvent[];
  dailyStargazing: CoDailyStargazing;
  constellations: Array<{
    id: string;
    name: string;
    completed: boolean;
    starsDiscovered: number;
    starCount: number;
    themeColor: string;
  }>;
  recentAchievements: CoAchievement[];
} {
  const s = ensureInit();
  return {
    stats: { ...s.stats },
    starPowerLevel: coGetStarPowerLevel(),
    cosmicCoins: coGetCosmicCoins(),
    activeEvents: coGetActiveEvents(),
    dailyStargazing: { ...s.dailyStargazing },
    constellations: s.constellations.map((c) => ({
      id: c.id,
      name: c.name,
      completed: c.completed,
      starsDiscovered: c.stars.filter((st) => st.discovered).length,
      starCount: c.starCount,
      themeColor: c.themeColor,
    })),
    recentAchievements: s.achievements
      .filter((a) => a.conditionMet)
      .slice(-5),
  };
}

// ---- Card Data Helpers ----------------------------------------------------

/** Returns card-ready data for a constellation (for UI cards). */
export function coGetConstellationCard(id: string): {
  id: string;
  name: string;
  description: string;
  themeColor: string;
  starCount: number;
  discoveredStars: number;
  completed: boolean;
  bonusReward: number;
  stars: Array<{
    id: string;
    name: string;
    discovered: boolean;
    brightness: number;
    color: string;
  }>;
} | null {
  const c = coFindConstellation(ensureInit(), id);
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    themeColor: c.themeColor,
    starCount: c.starCount,
    discoveredStars: c.stars.filter((s) => s.discovered).length,
    completed: c.completed,
    bonusReward: c.bonusReward,
    stars: c.stars.map((s) => ({
      id: s.id,
      name: s.name,
      discovered: s.discovered,
      brightness: s.brightness,
      color: s.color,
    })),
  };
}

/** Returns card-ready data for a single star. */
export function coGetStarCard(id: string): {
  id: string;
  name: string;
  constellationName: string;
  x: number;
  y: number;
  brightness: number;
  color: string;
  discovered: boolean;
  discoveredAt: number | null;
  discoveryCondition: string;
  discoveryThreshold: number;
} | null {
  const s = ensureInit();
  const star = coFindStar(s, id);
  if (!star) return null;
  const constellation = coFindConstellation(s, star.constellationId);
  return {
    id: star.id,
    name: star.name,
    constellationName: constellation?.name ?? '',
    x: star.x,
    y: star.y,
    brightness: star.brightness,
    color: star.color,
    discovered: star.discovered,
    discoveredAt: star.discoveredAt,
    discoveryCondition: star.discoveryCondition,
    discoveryThreshold: star.discoveryThreshold,
  };
}

/** Returns card-ready data for a celestial event. */
export function coGetEventCard(id: string): {
  id: string;
  name: string;
  type: CoEventType;
  description: string;
  rarity: string;
  bonusType: string;
  bonusAmount: number;
  witnessed: boolean;
  active: boolean;
  expiresAt: number | null;
} | null {
  const ev = coFindEvent(ensureInit(), id);
  if (!ev) return null;
  const now = Date.now();
  return {
    id: ev.id,
    name: ev.name,
    type: ev.type,
    description: ev.description,
    rarity: ev.rarity,
    bonusType: ev.bonusType,
    bonusAmount: ev.bonusAmount,
    witnessed: ev.witnessed,
    active: !!ev.expiresAt && ev.expiresAt > now,
    expiresAt: ev.expiresAt,
  };
}

// ---- Daily & Derived ------------------------------------------------------

/** Returns today's featured constellation (date-seeded rotation). */
export function coGetDailyConstellation(): CoConstellation | undefined {
  const daily = coGetDailyStargazing();
  return coFindConstellation(ensureInit(), daily.featuredConstellationId);
}

/** Returns the reward breakdown for a quest by id. */
export function coGetQuestRewards(id: string): CoQuestReward[] | null {
  const q = coFindQuest(ensureInit(), id);
  if (!q) return null;
  return q.rewards;
}

/** Returns the total navigation distance the player has "traveled" on the star map. */
export function coGetNavigationDistance(): number {
  return ensureInit().navigation.totalDistance;
}

// ---- Aggregate Helpers ----------------------------------------------------

/** Returns the overall completion percentage (0-100) across all stars. */
export function coGetCompletionPercentage(): number {
  const s = ensureInit();
  const total = s.constellations.reduce((sum, c) => sum + c.starCount, 0);
  if (total === 0) return 0;
  return Math.round((s.stats.starsDiscovered / total) * 100);
}

/**
 * Returns information about the next unlockable star (the closest undiscovered
 * star by threshold from the player's current stats).
 */
export function coGetNextUnlock(): {
  starId: string;
  starName: string;
  constellationName: string;
  condition: string;
  threshold: number;
  current: number;
} | null {
  const s = ensureInit();
  let best: CoStar | null = null;
  let bestGap = Infinity;

  for (const c of s.constellations) {
    for (const star of c.stars) {
      if (star.discovered) continue;
      let current = 0;
      if (star.discoveryCondition === 'score') current = s.stats.scoreMilestone;
      else if (star.discoveryCondition === 'words') current = s.stats.wordsContributed;
      const gap = star.discoveryThreshold - current;
      if (gap > 0 && gap < bestGap) {
        bestGap = gap;
        best = star;
      }
    }
  }

  if (!best) return null;
  const constellation = coFindConstellation(s, best.constellationId);
  let current = 0;
  if (best.discoveryCondition === 'score') current = s.stats.scoreMilestone;
  else if (best.discoveryCondition === 'words') current = s.stats.wordsContributed;

  return {
    starId: best.id,
    starName: best.name,
    constellationName: constellation?.name ?? '',
    condition: best.discoveryCondition,
    threshold: best.discoveryThreshold,
    current,
  };
}

/** Returns the total number of distinct celestial events the player has witnessed. */
export function coGetTotalEventsWitnessed(): number {
  return ensureInit().stats.celestialEventsWitnessed;
}

// ---- Game Integration Hooks -----------------------------------------------

/**
 * Feed score milestone data into the constellation system so stars
 * with score-based discovery conditions can be unlocked.
 */
export function coUpdateScoreMilestone(score: number): CoStar[] {
  const s = ensureInit();
  s.stats.scoreMilestone = Math.max(s.stats.scoreMilestone, Math.round(score));
  const newlyDiscovered: CoStar[] = [];
  for (const c of s.constellations) {
    for (const star of c.stars) {
      if (star.discovered) continue;
      if (
        star.discoveryCondition === 'score' &&
        s.stats.scoreMilestone >= star.discoveryThreshold
      ) {
        star.discovered = true;
        star.discoveredAt = Date.now();
        s.stats.starsDiscovered++;
        newlyDiscovered.push(star);
        if (!c.discovered) c.discovered = true;
      }
    }
    // Check constellation completion
    if (!c.completed && c.stars.every((st) => st.discovered)) {
      c.completed = true;
      s.stats.constellationsCompleted++;
    }
  }
  return newlyDiscovered;
}

/**
 * Feed word count data into the constellation system so stars with
 * word-count-based discovery conditions can be unlocked.
 */
export function coUpdateWordCount(count: number): CoStar[] {
  const s = ensureInit();
  s.stats.wordsContributed = Math.max(s.stats.wordsContributed, Math.round(count));
  const newlyDiscovered: CoStar[] = [];
  for (const c of s.constellations) {
    for (const star of c.stars) {
      if (star.discovered) continue;
      if (
        star.discoveryCondition === 'words' &&
        s.stats.wordsContributed >= star.discoveryThreshold
      ) {
        star.discovered = true;
        star.discoveredAt = Date.now();
        s.stats.starsDiscovered++;
        newlyDiscovered.push(star);
        if (!c.discovered) c.discovered = true;
      }
    }
    if (!c.completed && c.stars.every((st) => st.discovered)) {
      c.completed = true;
      s.stats.constellationsCompleted++;
    }
  }
  return newlyDiscovered;
}

/**
 * Update quest objective progress for a constellation. Call this when the player
 * discovers stars or connects patterns. Returns the quest if objectives changed.
 */
export function coUpdateQuestObjective(
  questId: string,
  objectiveIndex: number,
  increment: number,
): CoQuest | null {
  const s = ensureInit();
  const q = coFindQuest(s, questId);
  if (!q || !q.started || q.completed) return null;
  const obj = q.objectives[objectiveIndex];
  if (!obj || obj.done) return null;
  obj.current = Math.min(obj.target, obj.current + Math.max(0, Math.round(increment)));
  if (obj.current >= obj.target) obj.done = true;
  return q;
}

/**
 * Recalculate quest objectives based on the current game state. This syncs
 * constellation discovery progress to quest objectives automatically.
 */
export function coSyncQuestObjectives(): CoQuest[] {
  const s = ensureInit();
  const updated: CoQuest[] = [];

  for (const q of s.quests) {
    if (!q.started || q.completed) continue;
    const c = coFindConstellation(s, q.constellationId);
    if (!c) continue;

    const discoveredCount = c.stars.filter((st) => st.discovered).length;
    const obj0 = q.objectives[0];
    if (obj0 && !obj0.done) {
      obj0.current = Math.min(obj0.target, discoveredCount);
      if (obj0.current >= obj0.target) obj0.done = true;
    }

    // Objective 1: connect pattern (auto done when constellation completed)
    const obj1 = q.objectives[1];
    if (obj1 && !obj1.done && c.completed) {
      obj1.current = obj1.target;
      obj1.done = true;
    }

    // Objective 2: bonus (auto done when constellation completed)
    const obj2 = q.objectives[2];
    if (obj2 && !obj2.done && c.completed) {
      obj2.current = obj2.target;
      obj2.done = true;
    }

    updated.push(q);
  }

  return updated;
}

// ---- Navigation -----------------------------------------------------------

/**
 * Pan the star chart to center on the given grid coordinates.
 * Tracks navigation distance for cosmic statistics.
 */
export function coNavigateTo(x: number, y: number): { x: number; y: number; distance: number } {
  const s = ensureInit();
  const prevX = s.navigation.centerX;
  const prevY = s.navigation.centerY;
  const dist = coEuclideanDist(prevX, prevY, x, y);
  s.navigation.centerX = coClamp(x, 0, 9);
  s.navigation.centerY = coClamp(y, 0, 9);
  s.navigation.totalDistance += dist;
  s.navigation.lastMovedAt = Date.now();
  s.stats.navigationDistance = s.navigation.totalDistance;
  return {
    x: s.navigation.centerX,
    y: s.navigation.centerY,
    distance: Math.round(dist * 100) / 100,
  };
}

/** Set the zoom level of the star chart. */
export function coSetZoomLevel(level: 'overview' | 'constellation' | 'detail'): string {
  const s = ensureInit();
  s.navigation.zoomLevel = level;
  return s.navigation.zoomLevel;
}

/** Returns the current zoom level. */
export function coGetZoomLevel(): 'overview' | 'constellation' | 'detail' {
  return ensureInit().navigation.zoomLevel;
}

// ---- Serialization / Hydration --------------------------------------------

/** Serializes the mutable state to a JSON-safe plain object for persistence. */
export function coSerializeState(): string {
  return JSON.stringify(ensureInit());
}

/** Hydrates the module state from a previously serialized JSON string. */
export function coHydrateState(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as CoState;
    if (!parsed || !Array.isArray(parsed.constellations)) return false;
    state = parsed;
    return true;
  } catch {
    return false;
  }
}
