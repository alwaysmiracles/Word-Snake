// ============================================================================
// Leviathan Depths (利维坦深渊) — Deep-Sea Exploration Wire
// ============================================================================
// A deep-sea exploration game where players dive into ocean depths, encounter
// sea monsters, discover underwater ruins, and battle the legendary Leviathan.
// ============================================================================

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export interface OceanZone {
  id: number;
  name: string;
  nameZh: string;
  minDepth: number;
  maxDepth: number;
  pressureMultiplier: number;
  oxygenDrainRate: number;
  creatureIds: string[];
  ruinIds: string[];
  backgroundHue: number;
  visibilityRange: number;
}

export interface SeaCreature {
  id: string;
  name: string;
  nameZh: string;
  zoneId: number;
  hp: number;
  attack: number;
  defense: number;
  xpReward: number;
  scoreReward: number;
  isBoss: boolean;
  loot: DeepItem[];
  description: string;
}

export interface UnderwaterRuin {
  id: string;
  name: string;
  nameZh: string;
  zoneId: number;
  requiredLevel: number;
  explorationTime: number;
  rewards: DeepItem[];
  lore: string;
  dangerLevel: number;
}

export interface BioluminescentAbility {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  manaCost: number;
  cooldown: number;
  damage: number;
  healingAmount: number;
  duration: number;
  effectType: 'damage' | 'heal' | 'buff' | 'debuff' | 'reveal' | 'shield';
}

export interface EquipmentItem {
  id: string;
  name: string;
  nameZh: string;
  slot: EquipmentSlot;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  oxygenBonus: number;
  attackBonus: number;
  defenseBonus: number;
  abilityPowerBonus: number;
  pressureResistance: number;
  description: string;
}

export type EquipmentSlot =
  | 'divingSuit'
  | 'harpoon'
  | 'sonar'
  | 'lantern'
  | 'oxygenTank';

export interface DeepItem {
  id: string;
  name: string;
  nameZh: string;
  type: 'resource' | 'equipment' | 'material' | 'consumable' | 'artifact';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stackable: boolean;
  quantity: number;
  value: number;
  description: string;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  nameZh: string;
  ingredients: { itemId: string; quantity: number }[];
  result: DeepItem;
  requiredLevel: number;
  requiredZone: number;
}

export interface AchievementDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  condition: (state: LeviathanDepthsState) => boolean;
  rewardXp: number;
  rewardScore: number;
}

export interface LeviathanPhase {
  phase: number;
  name: string;
  nameZh: string;
  hp: number;
  attack: number;
  defense: number;
  abilities: string[];
  loot: DeepItem[];
}

export interface SubmarineUpgrade {
  level: number;
  name: string;
  nameZh: string;
  oxygenCapacity: number;
  pressureResistance: number;
  speedBonus: number;
  costPearls: number;
  costCoins: number;
}

export interface DailyDiveChallenge {
  daySeed: number;
  targetDepth: number;
  targetCreatures: number;
  targetResources: number;
  bonusXp: number;
  bonusScore: number;
  timeLimit: number;
}

export interface LeviathanDepthsState {
  // Core progression
  level: number;
  xp: number;
  totalScore: number;

  // Diving state
  currentZone: number;
  maxDepth: number;
  currentDepth: number;
  oxygen: number;
  maxOxygen: number;
  pressure: number;
  maxPressure: number;
  isDiving: boolean;

  // Equipment
  equippedGear: Record<EquipmentSlot, string | null>;

  // Inventory and collections
  inventory: DeepItem[];
  discoveries: string[];
  creaturesDefeated: string[];
  ruinsExplored: string[];
  loreCollected: string[];

  // Resources
  pearls: number;
  coralFragments: number;
  ancientCoins: number;
  abyssalCrystals: number;

  // Submarine
  submarineLevel: number;
  submarineUpgrades: string[];

  // Bioluminescent abilities
  abilitiesUnlocked: string[];
  abilityCooldowns: Record<string, number>;
  mana: number;
  maxMana: number;

  // Leviathan boss
  leviathanPhase: number;
  leviathanHp: number;
  leviathanDefeated: boolean;
  leviathanEncounters: number;
  leviathanBestDamage: number;

  // Daily dive
  dailyDiveCompleted: boolean;
  dailyDiveProgress: {
    depthReached: number;
    creaturesDefeated: number;
    resourcesCollected: number;
  };
  lastDiveDate: string;

  // Achievements
  achievements: string[];

  // Streak
  streak: number;
  bestStreak: number;

  // Crafting
  recipesKnown: string[];
  itemsCrafted: number;

  // Statistics
  totalDives: number;
  totalCreaturesDefeated: number;
  totalResourcesCollected: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalTimeDiving: number;
  deepestDive: number;
  totalPearlsCollected: number;
  totalCoralCollected: number;

  // Active effects
  activeEffects: {
    type: string;
    remainingTurns: number;
    value: number;
  }[];

  // Log
  diveLog: DiveLogEntry[];
}

export interface DiveLogEntry {
  timestamp: number;
  depth: number;
  zone: number;
  event: string;
  details: string;
  scoreGained: number;
  xpGained: number;
}

// ---------------------------------------------------------------------------
// Constants — Ocean Zones
// ---------------------------------------------------------------------------

export const OCEAN_ZONES: OceanZone[] = [
  {
    id: 0,
    name: 'Sunlit Shallows',
    nameZh: '阳光浅滩',
    minDepth: 0,
    maxDepth: 50,
    pressureMultiplier: 1.0,
    oxygenDrainRate: 1,
    creatureIds: ['clownfish', 'seahorse', 'jellyfish', 'stingray'],
    ruinIds: ['coralShrine'],
    backgroundHue: 190,
    visibilityRange: 100,
  },
  {
    id: 1,
    name: 'Twilight Reef',
    nameZh: '暮光礁石',
    minDepth: 50,
    maxDepth: 200,
    pressureMultiplier: 1.5,
    oxygenDrainRate: 2,
    creatureIds: ['morayEel', 'barracuda', 'seaTurtle', 'giantOctopus'],
    ruinIds: ['sunkenGalleon'],
    backgroundHue: 210,
    visibilityRange: 75,
  },
  {
    id: 2,
    name: 'Midnight Trench',
    nameZh: '午夜海沟',
    minDepth: 200,
    maxDepth: 500,
    pressureMultiplier: 2.5,
    oxygenDrainRate: 3,
    creatureIds: ['anglerfish', 'giantSquid', 'bioluminescentShark'],
    ruinIds: ['lemuriaOutpost'],
    backgroundHue: 230,
    visibilityRange: 50,
  },
  {
    id: 3,
    name: 'Coral Labyrinth',
    nameZh: '珊瑚迷宫',
    minDepth: 500,
    maxDepth: 1000,
    pressureMultiplier: 3.5,
    oxygenDrainRate: 4,
    creatureIds: ['merfolk', 'reefGuardian', 'venomousAnemone'],
    ruinIds: ['atlantisGate'],
    backgroundHue: 160,
    visibilityRange: 40,
  },
  {
    id: 4,
    name: 'Volcanic Vents',
    nameZh: '火山热泉',
    minDepth: 1000,
    maxDepth: 2000,
    pressureMultiplier: 5.0,
    oxygenDrainRate: 5,
    creatureIds: ['lavaCrab', 'magmaEel', 'volcanicSerpent'],
    ruinIds: ['magmaForge'],
    backgroundHue: 10,
    visibilityRange: 30,
  },
  {
    id: 5,
    name: 'Frozen Abyss',
    nameZh: '冰封深渊',
    minDepth: 2000,
    maxDepth: 5000,
    pressureMultiplier: 7.0,
    oxygenDrainRate: 7,
    creatureIds: ['frostLeviathan', 'iceSiren', 'glacialKraken'],
    ruinIds: ['frozenCitadel'],
    backgroundHue: 200,
    visibilityRange: 20,
  },
  {
    id: 6,
    name: 'Hadal Descent',
    nameZh: '超深渊斜坡',
    minDepth: 5000,
    maxDepth: 10000,
    pressureMultiplier: 10.0,
    oxygenDrainRate: 10,
    creatureIds: ['abyssalHorror', 'shadowDrifter', 'voidWalker'],
    ruinIds: [],
    backgroundHue: 270,
    visibilityRange: 10,
  },
  {
    id: 7,
    name: 'The Abyss',
    nameZh: '无尽深渊',
    minDepth: 10000,
    maxDepth: 20000,
    pressureMultiplier: 15.0,
    oxygenDrainRate: 15,
    creatureIds: ['leviathan'],
    ruinIds: [],
    backgroundHue: 300,
    visibilityRange: 5,
  },
];

// ---------------------------------------------------------------------------
// Constants — Sea Creatures
// ---------------------------------------------------------------------------

export const SEA_CREATURES: SeaCreature[] = [
  {
    id: 'clownfish',
    name: 'Clownfish',
    nameZh: '小丑鱼',
    zoneId: 0,
    hp: 10,
    attack: 2,
    defense: 1,
    xpReward: 5,
    scoreReward: 10,
    isBoss: false,
    loot: [{ id: 'pearl_small', name: 'Small Pearl', nameZh: '小珍珠', type: 'resource', rarity: 'common', stackable: true, quantity: 1, value: 5, description: 'A shimmering small pearl' }],
    description: 'A colorful little fish darting through coral',
  },
  {
    id: 'seahorse',
    name: 'Seahorse',
    nameZh: '海马',
    zoneId: 0,
    hp: 15,
    attack: 3,
    defense: 2,
    xpReward: 8,
    scoreReward: 15,
    isBoss: false,
    loot: [{ id: 'coral_frag_tiny', name: 'Tiny Coral Fragment', nameZh: '微小珊瑚碎片', type: 'resource', rarity: 'common', stackable: true, quantity: 1, value: 3, description: 'A small piece of living coral' }],
    description: 'A delicate creature curling around seaweed',
  },
  {
    id: 'jellyfish',
    name: 'Jellyfish',
    nameZh: '水母',
    zoneId: 0,
    hp: 20,
    attack: 5,
    defense: 1,
    xpReward: 12,
    scoreReward: 20,
    isBoss: false,
    loot: [{ id: 'bio_gel', name: 'Bioluminescent Gel', nameZh: '生物发光凝胶', type: 'material', rarity: 'uncommon', stackable: true, quantity: 1, value: 15, description: 'Glowing gel from a jellyfish' }],
    description: 'A pulsating translucent creature trailing stinging tentacles',
  },
  {
    id: 'stingray',
    name: 'Stingray',
    nameZh: '黄貂鱼',
    zoneId: 0,
    hp: 30,
    attack: 7,
    defense: 4,
    xpReward: 15,
    scoreReward: 25,
    isBoss: false,
    loot: [{ id: 'pearl_medium', name: 'Medium Pearl', nameZh: '中珍珠', type: 'resource', rarity: 'uncommon', stackable: true, quantity: 1, value: 10, description: 'A lustrous medium-sized pearl' }],
    description: 'A flat diamond-shaped ray gliding across the seafloor',
  },
  {
    id: 'morayEel',
    name: 'Moray Eel',
    nameZh: '海鳗',
    zoneId: 1,
    hp: 45,
    attack: 10,
    defense: 6,
    xpReward: 25,
    scoreReward: 40,
    isBoss: false,
    loot: [{ id: 'eel_skin', name: 'Eel Skin', nameZh: '海鳗皮', type: 'material', rarity: 'uncommon', stackable: true, quantity: 1, value: 20, description: 'Tough, flexible skin from a moray eel' }],
    description: 'A serpentine predator lurking in rocky crevices',
  },
  {
    id: 'barracuda',
    name: 'Barracuda',
    nameZh: '梭鱼',
    zoneId: 1,
    hp: 40,
    attack: 14,
    defense: 5,
    xpReward: 28,
    scoreReward: 45,
    isBoss: false,
    loot: [{ id: 'sharp_tooth', name: 'Sharp Tooth', nameZh: '利齿', type: 'material', rarity: 'common', stackable: true, quantity: 2, value: 8, description: 'A razor-sharp tooth from a barracuda' }],
    description: 'A lightning-fast silver torpedo of the deep',
  },
  {
    id: 'seaTurtle',
    name: 'Sea Turtle',
    nameZh: '海龟',
    zoneId: 1,
    hp: 80,
    attack: 6,
    defense: 15,
    xpReward: 30,
    scoreReward: 50,
    isBoss: false,
    loot: [{ id: 'turtle_shell', name: 'Turtle Shell Fragment', nameZh: '龟甲碎片', type: 'material', rarity: 'rare', stackable: true, quantity: 1, value: 35, description: 'A piece of ancient shell armor' }],
    description: 'A wise ancient reptile with an impenetrable shell',
  },
  {
    id: 'giantOctopus',
    name: 'Giant Octopus',
    nameZh: '巨型章鱼',
    zoneId: 1,
    hp: 70,
    attack: 12,
    defense: 10,
    xpReward: 40,
    scoreReward: 65,
    isBoss: false,
    loot: [{ id: 'ink_sac', name: 'Ink Sac', nameZh: '墨囊', type: 'material', rarity: 'uncommon', stackable: true, quantity: 1, value: 25, description: 'A sac of dark deep-sea ink' }],
    description: 'Eight-armed terror of the twilight zone',
  },
  {
    id: 'anglerfish',
    name: 'Anglerfish',
    nameZh: '鮟鱇鱼',
    zoneId: 2,
    hp: 55,
    attack: 18,
    defense: 8,
    xpReward: 50,
    scoreReward: 80,
    isBoss: false,
    loot: [{ id: 'angler_lure', name: 'Angler Lure', nameZh: '鮟鱇诱饵', type: 'material', rarity: 'rare', stackable: false, quantity: 1, value: 50, description: 'A bioluminescent lure from an anglerfish' }],
    description: 'A grotesque predator with a glowing appendage',
  },
  {
    id: 'giantSquid',
    name: 'Giant Squid',
    nameZh: '巨型鱿鱼',
    zoneId: 2,
    hp: 100,
    attack: 22,
    defense: 12,
    xpReward: 65,
    scoreReward: 100,
    isBoss: false,
    loot: [
      { id: 'squid_beak', name: 'Giant Beak', nameZh: '巨大喙', type: 'material', rarity: 'rare', stackable: false, quantity: 1, value: 60, description: 'A massive beak from the deep' },
      { id: 'ancient_coin', name: 'Ancient Coin', nameZh: '古代硬币', type: 'resource', rarity: 'rare', stackable: true, quantity: 2, value: 40, description: 'A coin from a lost civilization' },
    ],
    description: 'A colossal tentacled beast of the midnight trench',
  },
  {
    id: 'bioluminescentShark',
    name: 'Bioluminescent Shark',
    nameZh: '荧光鲨',
    zoneId: 2,
    hp: 90,
    attack: 25,
    defense: 14,
    xpReward: 60,
    scoreReward: 95,
    isBoss: false,
    loot: [{ id: 'shark_fang', name: 'Luminous Fang', nameZh: '发光獠牙', type: 'material', rarity: 'rare', stackable: true, quantity: 1, value: 45, description: 'A glowing fang from a deep-sea shark' }],
    description: 'A predatory shark that emits an eerie blue glow',
  },
  {
    id: 'merfolk',
    name: 'Merfolk',
    nameZh: '美人鱼族',
    zoneId: 3,
    hp: 120,
    attack: 20,
    defense: 18,
    xpReward: 80,
    scoreReward: 130,
    isBoss: false,
    loot: [
      { id: 'merfolk_scale', name: 'Merfolk Scale', nameZh: '美人鱼鳞片', type: 'material', rarity: 'epic', stackable: true, quantity: 1, value: 80, description: 'An iridescent scale from a merfolk' },
      { id: 'ancient_coin', name: 'Ancient Coin', nameZh: '古代硬币', type: 'resource', rarity: 'rare', stackable: true, quantity: 3, value: 40, description: 'A coin from a lost civilization' },
    ],
    description: 'Elusive humanoid guardians of the coral labyrinth',
  },
  {
    id: 'reefGuardian',
    name: 'Reef Guardian',
    nameZh: '礁石守护者',
    zoneId: 3,
    hp: 200,
    attack: 15,
    defense: 30,
    xpReward: 100,
    scoreReward: 160,
    isBoss: true,
    loot: [
      { id: 'guardian_heart', name: 'Guardian Heart', nameZh: '守护者之心', type: 'artifact', rarity: 'epic', stackable: false, quantity: 1, value: 150, description: 'The crystallized heart of a reef guardian' },
      { id: 'pearl_large', name: 'Large Pearl', nameZh: '大珍珠', type: 'resource', rarity: 'epic', stackable: true, quantity: 1, value: 100, description: 'A magnificent large pearl' },
    ],
    description: 'A massive living coral construct defending ancient secrets',
  },
  {
    id: 'lavaCrab',
    name: 'Lava Crab',
    nameZh: '熔岩蟹',
    zoneId: 4,
    hp: 150,
    attack: 28,
    defense: 22,
    xpReward: 90,
    scoreReward: 150,
    isBoss: false,
    loot: [{ id: 'magma_shell', name: 'Magma Shell', nameZh: '熔岩壳', type: 'material', rarity: 'epic', stackable: false, quantity: 1, value: 90, description: 'A shell forged by volcanic heat' }],
    description: 'A crustacean armored in hardened lava',
  },
  {
    id: 'frostLeviathan',
    name: 'Frost Leviathan',
    nameZh: '冰霜利维坦',
    zoneId: 5,
    hp: 300,
    attack: 35,
    defense: 25,
    xpReward: 150,
    scoreReward: 250,
    isBoss: true,
    loot: [
      { id: 'frost_core', name: 'Frost Core', nameZh: '冰霜核心', type: 'artifact', rarity: 'legendary', stackable: false, quantity: 1, value: 300, description: 'The frozen heart of a frost leviathan' },
      { id: 'abyssal_crystal', name: 'Abyssal Crystal', nameZh: '深渊水晶', type: 'resource', rarity: 'legendary', stackable: true, quantity: 1, value: 200, description: 'A crystal formed under immense pressure' },
    ],
    description: 'A serpentine beast encased in eternal ice',
  },
  {
    id: 'leviathan',
    name: 'Leviathan',
    nameZh: '利维坦',
    zoneId: 7,
    hp: 2000,
    attack: 60,
    defense: 40,
    xpReward: 1000,
    scoreReward: 5000,
    isBoss: true,
    loot: [
      { id: 'leviathan_scale', name: 'Leviathan Scale', nameZh: '利维坦鳞片', type: 'artifact', rarity: 'legendary', stackable: false, quantity: 1, value: 1000, description: 'An impenetrable scale from the Leviathan itself' },
      { id: 'abyssal_crystal', name: 'Abyssal Crystal', nameZh: '深渊水晶', type: 'resource', rarity: 'legendary', stackable: true, quantity: 5, value: 200, description: 'A crystal formed under immense pressure' },
    ],
    description: 'The legendary ruler of the deepest abyss',
  },
];

// ---------------------------------------------------------------------------
// Constants — Underwater Ruins
// ---------------------------------------------------------------------------

export const UNDERWATER_RUINS: UnderwaterRuin[] = [
  {
    id: 'coralShrine',
    name: 'Coral Shrine',
    nameZh: '珊瑚神殿',
    zoneId: 0,
    requiredLevel: 1,
    explorationTime: 30,
    rewards: [
      { id: 'pearl_small', name: 'Small Pearl', nameZh: '小珍珠', type: 'resource', rarity: 'common', stackable: true, quantity: 5, value: 5, description: 'A shimmering small pearl' },
      { id: 'coral_frag_tiny', name: 'Tiny Coral Fragment', nameZh: '微小珊瑚碎片', type: 'resource', rarity: 'common', stackable: true, quantity: 3, value: 3, description: 'A small piece of living coral' },
    ],
    lore: 'An ancient shrine built by the first sea dwellers, devoted to the tide gods.',
    dangerLevel: 1,
  },
  {
    id: 'sunkenGalleon',
    name: 'Sunken Galleon',
    nameZh: '沉没大帆船',
    zoneId: 1,
    requiredLevel: 5,
    explorationTime: 60,
    rewards: [
      { id: 'ancient_coin', name: 'Ancient Coin', nameZh: '古代硬币', type: 'resource', rarity: 'uncommon', stackable: true, quantity: 8, value: 40, description: 'A coin from a lost civilization' },
      { id: 'pearl_medium', name: 'Medium Pearl', nameZh: '中珍珠', type: 'resource', rarity: 'uncommon', stackable: true, quantity: 3, value: 10, description: 'A lustrous medium-sized pearl' },
    ],
    lore: 'A merchant vessel from the Age of Sail, lost to a supernatural storm.',
    dangerLevel: 2,
  },
  {
    id: 'lemuriaOutpost',
    name: 'Lemuria Outpost',
    nameZh: '利莫里亚前哨',
    zoneId: 2,
    requiredLevel: 12,
    explorationTime: 90,
    rewards: [
      { id: 'ancient_coin', name: 'Ancient Coin', nameZh: '古代硬币', type: 'resource', rarity: 'rare', stackable: true, quantity: 12, value: 40, description: 'A coin from a lost civilization' },
      { id: 'lemuria_stone', name: 'Lemuria Stone', nameZh: '利莫里亚石', type: 'artifact', rarity: 'rare', stackable: false, quantity: 1, value: 120, description: 'A stone tablet inscribed with Lemurian script' },
    ],
    lore: 'An outpost of the lost continent of Lemuria, preserved in perfect darkness.',
    dangerLevel: 3,
  },
  {
    id: 'atlantisGate',
    name: 'Atlantis Gate',
    nameZh: '亚特兰蒂斯之门',
    zoneId: 3,
    requiredLevel: 20,
    explorationTime: 120,
    rewards: [
      { id: 'atlantis_shard', name: 'Atlantis Shard', nameZh: '亚特兰蒂斯碎片', type: 'artifact', rarity: 'epic', stackable: false, quantity: 1, value: 250, description: 'A glowing shard from the walls of Atlantis' },
      { id: 'abyssal_crystal', name: 'Abyssal Crystal', nameZh: '深渊水晶', type: 'resource', rarity: 'epic', stackable: true, quantity: 2, value: 200, description: 'A crystal formed under immense pressure' },
    ],
    lore: 'The gateway to the legendary city of Atlantis, sealed by ancient magic.',
    dangerLevel: 4,
  },
  {
    id: 'frozenCitadel',
    name: 'Frozen Citadel',
    nameZh: '冰封城堡',
    zoneId: 5,
    requiredLevel: 30,
    explorationTime: 180,
    rewards: [
      { id: 'frost_core', name: 'Frost Core', nameZh: '冰霜核心', type: 'artifact', rarity: 'legendary', stackable: false, quantity: 1, value: 400, description: 'The frozen heart of a frost leviathan' },
      { id: 'ancient_coin', name: 'Ancient Coin', nameZh: '古代硬币', type: 'resource', rarity: 'epic', stackable: true, quantity: 20, value: 40, description: 'A coin from a lost civilization' },
    ],
    lore: 'A citadel built by ice elementals, frozen in time for millennia.',
    dangerLevel: 5,
  },
];

// ---------------------------------------------------------------------------
// Constants — Bioluminescent Abilities
// ---------------------------------------------------------------------------

export const BIOLUMINESCENT_ABILITIES: BioluminescentAbility[] = [
  { id: 'lightPulse', name: 'Light Pulse', nameZh: '光脉冲', description: 'Emit a blinding pulse of bioluminescent light', manaCost: 10, cooldown: 2, damage: 25, healingAmount: 0, duration: 0, effectType: 'damage' },
  { id: 'sonarWave', name: 'Sonar Wave', nameZh: '声纳波', description: 'Send out a sonar pulse revealing hidden creatures', manaCost: 15, cooldown: 3, damage: 0, healingAmount: 0, duration: 3, effectType: 'reveal' },
  { id: 'deepFreeze', name: 'Deep Freeze', nameZh: '深海冰冻', description: 'Freeze surrounding water, slowing all enemies', manaCost: 20, cooldown: 4, damage: 15, healingAmount: 0, duration: 2, effectType: 'debuff' },
  { id: 'healingAura', name: 'Healing Aura', nameZh: '治愈光环', description: 'Surround yourself with healing bioluminescence', manaCost: 25, cooldown: 5, damage: 0, healingAmount: 40, duration: 0, effectType: 'heal' },
  { id: 'pressureShield', name: 'Pressure Shield', nameZh: '压力护盾', description: 'Create a shield that absorbs damage', manaCost: 20, cooldown: 4, damage: 0, healingAmount: 0, duration: 3, effectType: 'shield' },
  { id: 'inkCloud', name: 'Ink Cloud', nameZh: '墨云', description: 'Release a cloud of dark ink to blind enemies', manaCost: 12, cooldown: 2, damage: 10, healingAmount: 0, duration: 2, effectType: 'debuff' },
  { id: 'tidalSurge', name: 'Tidal Surge', nameZh: '潮汐涌动', description: 'Unleash a powerful wave of ocean energy', manaCost: 30, cooldown: 6, damage: 50, healingAmount: 0, duration: 0, effectType: 'damage' },
  { id: 'bioResonance', name: 'Bio Resonance', nameZh: '生物共振', description: 'Attune to marine life, boosting your abilities', manaCost: 15, cooldown: 5, damage: 0, healingAmount: 0, duration: 4, effectType: 'buff' },
  { id: 'abyssalGaze', name: 'Abyssal Gaze', nameZh: '深渊凝视', description: 'Channel the terror of the abyss to stun enemies', manaCost: 35, cooldown: 8, damage: 30, healingAmount: 0, duration: 1, effectType: 'debuff' },
  { id: 'leviathanCall', name: 'Leviathan Call', nameZh: '利维坦呼唤', description: 'Call upon the power of the Leviathan itself', manaCost: 50, cooldown: 10, damage: 80, healingAmount: 20, duration: 0, effectType: 'damage' },
];

// ---------------------------------------------------------------------------
// Constants — Equipment
// ---------------------------------------------------------------------------

export const EQUIPMENT_ITEMS: EquipmentItem[] = [
  {
    id: 'basicSuit', name: 'Basic Diving Suit', nameZh: '基础潜水服', slot: 'divingSuit', rarity: 'common',
    oxygenBonus: 5, attackBonus: 0, defenseBonus: 2, abilityPowerBonus: 0, pressureResistance: 10,
    description: 'A standard wetsuit for shallow dives',
  },
  {
    id: 'reinforcedSuit', name: 'Reinforced Suit', nameZh: '强化潜水服', slot: 'divingSuit', rarity: 'uncommon',
    oxygenBonus: 15, attackBonus: 0, defenseBonus: 8, abilityPowerBonus: 0, pressureResistance: 25,
    description: 'A suit reinforced with deep-sea materials',
  },
  {
    id: 'abyssalSuit', name: 'Abyssal Diving Suit', nameZh: '深渊潜水服', slot: 'divingSuit', rarity: 'legendary',
    oxygenBonus: 50, attackBonus: 5, defenseBonus: 25, abilityPowerBonus: 10, pressureResistance: 80,
    description: 'A legendary suit forged from leviathan scales',
  },
  {
    id: 'woodenHarpoon', name: 'Wooden Harpoon', nameZh: '木制鱼叉', slot: 'harpoon', rarity: 'common',
    oxygenBonus: 0, attackBonus: 5, defenseBonus: 0, abilityPowerBonus: 0, pressureResistance: 0,
    description: 'A simple sharpened harpoon',
  },
  {
    id: 'steelHarpoon', name: 'Steel Harpoon', nameZh: '钢铁鱼叉', slot: 'harpoon', rarity: 'uncommon',
    oxygenBonus: 0, attackBonus: 15, defenseBonus: 2, abilityPowerBonus: 0, pressureResistance: 5,
    description: 'A heavy-duty steel harpoon',
  },
  {
    id: 'tridentOfDepths', name: 'Trident of the Depths', nameZh: '深渊三叉戟', slot: 'harpoon', rarity: 'legendary',
    oxygenBonus: 0, attackBonus: 40, defenseBonus: 5, abilityPowerBonus: 15, pressureResistance: 20,
    description: 'An ancient weapon of the merfolk kings',
  },
  {
    id: 'basicSonar', name: 'Basic Sonar', nameZh: '基础声纳', slot: 'sonar', rarity: 'common',
    oxygenBonus: 0, attackBonus: 0, defenseBonus: 0, abilityPowerBonus: 5, pressureResistance: 0,
    description: 'A simple sonar device for detecting nearby creatures',
  },
  {
    id: 'ancientSonar', name: 'Ancient Sonar Array', nameZh: '古代声纳阵列', slot: 'sonar', rarity: 'epic',
    oxygenBonus: 0, attackBonus: 0, defenseBonus: 3, abilityPowerBonus: 25, pressureResistance: 10,
    description: 'Lemurian technology repurposed for modern divers',
  },
  {
    id: 'lanternBasic', name: 'Basic Lantern', nameZh: '基础灯笼', slot: 'lantern', rarity: 'common',
    oxygenBonus: 0, attackBonus: 2, defenseBonus: 0, abilityPowerBonus: 3, pressureResistance: 0,
    description: 'A waterproof lantern for illuminating the depths',
  },
  {
    id: 'bioLantern', name: 'Bioluminescent Lantern', nameZh: '生物荧光灯笼', slot: 'lantern', rarity: 'epic',
    oxygenBonus: 0, attackBonus: 5, defenseBonus: 0, abilityPowerBonus: 20, pressureResistance: 5,
    description: 'A lantern powered by captured bioluminescent organisms',
  },
  {
    id: 'tankSmall', name: 'Small Oxygen Tank', nameZh: '小型氧气罐', slot: 'oxygenTank', rarity: 'common',
    oxygenBonus: 20, attackBonus: 0, defenseBonus: 1, abilityPowerBonus: 0, pressureResistance: 5,
    description: 'A compact oxygen tank for short dives',
  },
  {
    id: 'tankLegendary', name: 'Abyssal Oxygen Tank', nameZh: '深渊氧气罐', slot: 'oxygenTank', rarity: 'legendary',
    oxygenBonus: 100, attackBonus: 0, defenseBonus: 5, abilityPowerBonus: 5, pressureResistance: 30,
    description: 'A tank containing oxygen compressed at abyssal pressures',
  },
];

// ---------------------------------------------------------------------------
// Constants — Submarine Upgrades
// ---------------------------------------------------------------------------

export const SUBMARINE_UPGRADES: SubmarineUpgrade[] = [
  { level: 1, name: 'Dinghy', nameZh: '小舢板', oxygenCapacity: 100, pressureResistance: 10, speedBonus: 1, costPearls: 0, costCoins: 0 },
  { level: 2, name: 'Explorer Pod', nameZh: '探索舱', oxygenCapacity: 150, pressureResistance: 20, speedBonus: 1.2, costPearls: 50, costCoins: 20 },
  { level: 3, name: 'Deep Diver', nameZh: '深潜者', oxygenCapacity: 200, pressureResistance: 35, speedBonus: 1.4, costPearls: 120, costCoins: 50 },
  { level: 4, name: 'Abyss Runner', nameZh: '深渊行者', oxygenCapacity: 280, pressureResistance: 50, speedBonus: 1.7, costPearls: 250, costCoins: 100 },
  { level: 5, name: 'Leviathan Hunter', nameZh: '猎鲸者', oxygenCapacity: 380, pressureResistance: 70, speedBonus: 2.0, costPearls: 400, costCoins: 180 },
  { level: 6, name: 'Pressure Fortress', nameZh: '压力堡垒', oxygenCapacity: 500, pressureResistance: 95, speedBonus: 2.3, costPearls: 600, costCoins: 300 },
  { level: 7, name: 'Bio Submarine', nameZh: '仿生潜艇', oxygenCapacity: 650, pressureResistance: 120, speedBonus: 2.7, costPearls: 900, costCoins: 500 },
  { level: 8, name: 'Ancient Vessel', nameZh: '远古舰船', oxygenCapacity: 850, pressureResistance: 160, speedBonus: 3.2, costPearls: 1400, costCoins: 800 },
  { level: 9, name: 'Abyssal Dreadnought', nameZh: '深渊无畏舰', oxygenCapacity: 1100, pressureResistance: 210, speedBonus: 3.8, costPearls: 2200, costCoins: 1200 },
  { level: 10, name: 'Leviathan Slayer', nameZh: '弑鲸者', oxygenCapacity: 1500, pressureResistance: 300, speedBonus: 4.5, costPearls: 4000, costCoins: 2500 },
];

// ---------------------------------------------------------------------------
// Constants — Leviathan Boss Phases
// ---------------------------------------------------------------------------

export const LEVIATHAN_PHASES: LeviathanPhase[] = [
  {
    phase: 1,
    name: 'Awakening',
    nameZh: '觉醒',
    hp: 2000,
    attack: 40,
    defense: 25,
    abilities: ['lightPulse', 'inkCloud', 'tidalSurge'],
    loot: [
      { id: 'leviathan_eye', name: 'Leviathan Eye', nameZh: '利维坦之眼', type: 'artifact', rarity: 'legendary', stackable: false, quantity: 1, value: 500, description: 'An eye that sees through the deepest darkness' },
    ],
  },
  {
    phase: 2,
    name: 'Wrath',
    nameZh: '狂怒',
    hp: 3500,
    attack: 60,
    defense: 35,
    abilities: ['tidalSurge', 'abyssalGaze', 'deepFreeze', 'leviathanCall'],
    loot: [
      { id: 'leviathan_heart', name: 'Leviathan Heart', nameZh: '利维坦之心', type: 'artifact', rarity: 'legendary', stackable: false, quantity: 1, value: 800, description: 'The pulsing heart of the deep' },
    ],
  },
  {
    phase: 3,
    name: 'Desperation',
    nameZh: '绝境',
    hp: 5000,
    attack: 80,
    defense: 45,
    abilities: ['leviathanCall', 'tidalSurge', 'abyssalGaze', 'deepFreeze', 'inkCloud'],
    loot: [
      { id: 'leviathan_crown', name: 'Crown of the Abyss', nameZh: '深渊王冠', type: 'artifact', rarity: 'legendary', stackable: false, quantity: 1, value: 2000, description: 'The crown that rules the deepest ocean' },
      { id: 'leviathan_scale', name: 'Leviathan Scale', nameZh: '利维坦鳞片', type: 'artifact', rarity: 'legendary', stackable: false, quantity: 3, value: 1000, description: 'An impenetrable scale from the Leviathan itself' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Constants — Crafting Recipes
// ---------------------------------------------------------------------------

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'craftBioGelPack',
    name: 'Bio Gel Pack',
    nameZh: '生物凝胶包',
    ingredients: [{ itemId: 'bio_gel', quantity: 3 }, { itemId: 'coral_frag_tiny', quantity: 2 }],
    result: { id: 'bio_gel_pack', name: 'Bio Gel Pack', nameZh: '生物凝胶包', type: 'consumable', rarity: 'uncommon', stackable: true, quantity: 1, value: 30, description: 'Restores 30 oxygen and 15 mana' },
    requiredLevel: 3,
    requiredZone: 0,
  },
  {
    id: 'craftReinforcedSuit',
    name: 'Reinforced Diving Suit',
    nameZh: '强化潜水服',
    ingredients: [{ itemId: 'eel_skin', quantity: 5 }, { itemId: 'turtle_shell', quantity: 2 }, { itemId: 'pearl_medium', quantity: 3 }],
    result: { id: 'reinforcedSuit', name: 'Reinforced Diving Suit', nameZh: '强化潜水服', type: 'equipment', rarity: 'uncommon', stackable: false, quantity: 1, value: 150, description: 'A suit reinforced with deep-sea materials' },
    requiredLevel: 8,
    requiredZone: 1,
  },
  {
    id: 'craftSteelHarpoon',
    name: 'Steel Harpoon',
    nameZh: '钢铁鱼叉',
    ingredients: [{ itemId: 'sharp_tooth', quantity: 8 }, { itemId: 'angler_lure', quantity: 1 }, { itemId: 'ancient_coin', quantity: 5 }],
    result: { id: 'steelHarpoon', name: 'Steel Harpoon', nameZh: '钢铁鱼叉', type: 'equipment', rarity: 'uncommon', stackable: false, quantity: 1, value: 200, description: 'A heavy-duty steel harpoon' },
    requiredLevel: 10,
    requiredZone: 2,
  },
  {
    id: 'craftBioLantern',
    name: 'Bioluminescent Lantern',
    nameZh: '生物荧光灯笼',
    ingredients: [{ itemId: 'bio_gel', quantity: 5 }, { itemId: 'angler_lure', quantity: 2 }, { itemId: 'shark_fang', quantity: 1 }],
    result: { id: 'bioLantern', name: 'Bioluminescent Lantern', nameZh: '生物荧光灯笼', type: 'equipment', rarity: 'epic', stackable: false, quantity: 1, value: 350, description: 'A lantern powered by captured bioluminescent organisms' },
    requiredLevel: 15,
    requiredZone: 2,
  },
  {
    id: 'craftAbyssalSuit',
    name: 'Abyssal Diving Suit',
    nameZh: '深渊潜水服',
    ingredients: [{ itemId: 'leviathan_scale', quantity: 2 }, { itemId: 'frost_core', quantity: 1 }, { itemId: 'abyssal_crystal', quantity: 3 }, { itemId: 'merfolk_scale', quantity: 5 }],
    result: { id: 'abyssalSuit', name: 'Abyssal Diving Suit', nameZh: '深渊潜水服', type: 'equipment', rarity: 'legendary', stackable: false, quantity: 1, value: 1000, description: 'A legendary suit forged from leviathan scales' },
    requiredLevel: 35,
    requiredZone: 6,
  },
  {
    id: 'craftTridentOfDepths',
    name: 'Trident of the Depths',
    nameZh: '深渊三叉戟',
    ingredients: [{ itemId: 'leviathan_eye', quantity: 1 }, { itemId: 'merfolk_scale', quantity: 5 }, { itemId: 'ancient_coin', quantity: 20 }, { itemId: 'abyssal_crystal', quantity: 2 }],
    result: { id: 'tridentOfDepths', name: 'Trident of the Depths', nameZh: '深渊三叉戟', type: 'equipment', rarity: 'legendary', stackable: false, quantity: 1, value: 1200, description: 'An ancient weapon of the merfolk kings' },
    requiredLevel: 38,
    requiredZone: 7,
  },
  {
    id: 'craftOxygenBoost',
    name: 'Emergency Oxygen Canister',
    nameZh: '应急氧气罐',
    ingredients: [{ itemId: 'coral_frag_tiny', quantity: 5 }, { itemId: 'pearl_small', quantity: 3 }],
    result: { id: 'oxygen_canister', name: 'Emergency Oxygen Canister', nameZh: '应急氧气罐', type: 'consumable', rarity: 'common', stackable: true, quantity: 1, value: 20, description: 'Restores 50 oxygen instantly' },
    requiredLevel: 2,
    requiredZone: 0,
  },
  {
    id: 'craftManaPotion',
    name: 'Bioluminescent Mana Potion',
    nameZh: '荧光法力药剂',
    ingredients: [{ itemId: 'bio_gel', quantity: 2 }, { itemId: 'pearl_small', quantity: 2 }],
    result: { id: 'mana_potion', name: 'Bioluminescent Mana Potion', nameZh: '荧光法力药剂', type: 'consumable', rarity: 'uncommon', stackable: true, quantity: 1, value: 25, description: 'Restores 25 mana' },
    requiredLevel: 4,
    requiredZone: 0,
  },
];

// ---------------------------------------------------------------------------
// Constants — Achievements
// ---------------------------------------------------------------------------

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: 'ach_first_dive', name: 'First Descent', nameZh: '初次下潜', description: 'Complete your first dive', condition: (s) => s.totalDives >= 1, rewardXp: 20, rewardScore: 50 },
  { id: 'ach_depth_100', name: 'Deep Diver', nameZh: '深海潜者', description: 'Reach a depth of 100m', condition: (s) => s.deepestDive >= 100, rewardXp: 50, rewardScore: 150 },
  { id: 'ach_depth_1000', name: 'Abyssal Pioneer', nameZh: '深渊先驱', description: 'Reach a depth of 1,000m', condition: (s) => s.deepestDive >= 1000, rewardXp: 150, rewardScore: 500 },
  { id: 'ach_depth_5000', name: 'Hadal Explorer', nameZh: '超深渊探索者', description: 'Reach a depth of 5,000m', condition: (s) => s.deepestDive >= 5000, rewardXp: 400, rewardScore: 1500 },
  { id: 'ach_depth_10000', name: 'Touching the Abyss', nameZh: '触碰深渊', description: 'Reach a depth of 10,000m', condition: (s) => s.deepestDive >= 10000, rewardXp: 800, rewardScore: 3000 },
  { id: 'ach_creatures_10', name: 'Creature Collector', nameZh: '生物收藏家', description: 'Defeat 10 different creatures', condition: (s) => s.creaturesDefeated.length >= 10, rewardXp: 100, rewardScore: 300 },
  { id: 'ach_all_zones', name: 'World Wanderer', nameZh: '世界漫游者', description: 'Visit all 8 ocean zones', condition: (s) => s.discoveries.length >= 8, rewardXp: 200, rewardScore: 600 },
  { id: 'ach_ruins_3', name: 'Ruins Raider', nameZh: '遗迹掠夺者', description: 'Explore 3 underwater ruins', condition: (s) => s.ruinsExplored.length >= 3, rewardXp: 120, rewardScore: 400 },
  { id: 'ach_ruins_all', name: 'Master Archaeologist', nameZh: '大师考古学家', description: 'Explore all underwater ruins', condition: (s) => s.ruinsExplored.length >= UNDERWATER_RUINS.length, rewardXp: 300, rewardScore: 1000 },
  { id: 'ach_streak_3', name: 'Consistent Diver', nameZh: '坚持不懈的潜者', description: 'Maintain a 3-day dive streak', condition: (s) => s.bestStreak >= 3, rewardXp: 60, rewardScore: 200 },
  { id: 'ach_streak_7', name: 'Weekly Warrior', nameZh: '周勇士', description: 'Maintain a 7-day dive streak', condition: (s) => s.bestStreak >= 7, rewardXp: 200, rewardScore: 700 },
  { id: 'ach_streak_30', name: 'Monthly Master', nameZh: '月度大师', description: 'Maintain a 30-day dive streak', condition: (s) => s.bestStreak >= 30, rewardXp: 1000, rewardScore: 5000 },
  { id: 'ach_craft_10', name: 'Deep Crafter', nameZh: '深海工匠', description: 'Craft 10 items', condition: (s) => s.itemsCrafted >= 10, rewardXp: 100, rewardScore: 350 },
  { id: 'ach_leviathan_phase1', name: 'Leviathan Challenger', nameZh: '利维坦挑战者', description: 'Reach Leviathan Phase 2', condition: (s) => s.leviathanPhase >= 2, rewardXp: 500, rewardScore: 2000 },
  { id: 'ach_leviathan_defeated', name: 'Leviathan Slayer', nameZh: '弑鲸者', description: 'Defeat the Leviathan', condition: (s) => s.leviathanDefeated, rewardXp: 2000, rewardScore: 10000 },
];

// ---------------------------------------------------------------------------
// Constants — Daily Dive Challenge Seeds
// ---------------------------------------------------------------------------

export function generateDailyChallenge(daySeed: number): DailyDiveChallenge {
  const base = daySeed % 100;
  return {
    daySeed,
    targetDepth: 100 + base * 20,
    targetCreatures: 3 + (base % 8),
    targetResources: 5 + (base % 10),
    bonusXp: 50 + base * 2,
    bonusScore: 100 + base * 5,
    timeLimit: 300 + base * 3,
  };
}

// ---------------------------------------------------------------------------
// Helper — XP required per level
// ---------------------------------------------------------------------------

export function xpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(level, 1.4) + 50 * level);
}

export function getMaxLevel(): number {
  return 40;
}

// ---------------------------------------------------------------------------
// Initial State Factory
// ---------------------------------------------------------------------------

export function createLeviathanDepthsState(overrides?: Partial<LeviathanDepthsState>): LeviathanDepthsState {
  const base: LeviathanDepthsState = {
    level: 1,
    xp: 0,
    totalScore: 0,

    currentZone: 0,
    maxDepth: 0,
    currentDepth: 0,
    oxygen: 100,
    maxOxygen: 100,
    pressure: 0,
    maxPressure: 100,
    isDiving: false,

    equippedGear: {
      divingSuit: null,
      harpoon: null,
      sonar: null,
      lantern: null,
      oxygenTank: null,
    },

    inventory: [],
    discoveries: [],
    creaturesDefeated: [],
    ruinsExplored: [],
    loreCollected: [],

    pearls: 0,
    coralFragments: 0,
    ancientCoins: 0,
    abyssalCrystals: 0,

    submarineLevel: 1,
    submarineUpgrades: [],

    abilitiesUnlocked: ['lightPulse', 'inkCloud'],
    abilityCooldowns: {},
    mana: 30,
    maxMana: 30,

    leviathanPhase: 0,
    leviathanHp: 0,
    leviathanDefeated: false,
    leviathanEncounters: 0,
    leviathanBestDamage: 0,

    dailyDiveCompleted: false,
    dailyDiveProgress: {
      depthReached: 0,
      creaturesDefeated: 0,
      resourcesCollected: 0,
    },
    lastDiveDate: '',

    achievements: [],

    streak: 0,
    bestStreak: 0,

    recipesKnown: ['craftBioGelPack', 'craftOxygenBoost', 'craftManaPotion'],
    itemsCrafted: 0,

    totalDives: 0,
    totalCreaturesDefeated: 0,
    totalResourcesCollected: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    totalTimeDiving: 0,
    deepestDive: 0,
    totalPearlsCollected: 0,
    totalCoralCollected: 0,

    activeEffects: [],

    diveLog: [],
  };

  return { ...base, ...overrides };
}

// ============================================================================
// Pure State Functions (ep-prefixed named exports)
// ============================================================================

// ---------------------------------------------------------------------------
// Core Getters
// ---------------------------------------------------------------------------

export function epGetState(state: LeviathanDepthsState): LeviathanDepthsState {
  return state;
}

export function epGetCurrentZone(state: LeviathanDepthsState): OceanZone {
  return OCEAN_ZONES[state.currentZone] ?? OCEAN_ZONES[0];
}

export function epGetZoneById(state: LeviathanDepthsState, zoneId: number): OceanZone | undefined {
  return OCEAN_ZONES.find((z) => z.id === zoneId);
}

export function epGetAllZones(): OceanZone[] {
  return [...OCEAN_ZONES];
}

export function epGetCreatureById(creatureId: string): SeaCreature | undefined {
  return SEA_CREATURES.find((c) => c.id === creatureId);
}

export function epGetCreaturesInZone(zoneId: number): SeaCreature[] {
  return SEA_CREATURES.filter((c) => c.zoneId === zoneId);
}

export function epGetAllCreatures(): SeaCreature[] {
  return [...SEA_CREATURES];
}

export function epGetRuinById(ruinId: string): UnderwaterRuin | undefined {
  return UNDERWATER_RUINS.find((r) => r.id === ruinId);
}

export function epGetRuinsInZone(zoneId: number): UnderwaterRuin[] {
  return UNDERWATER_RUINS.filter((r) => r.zoneId === zoneId);
}

export function epGetAllRuins(): UnderwaterRuin[] {
  return [...UNDERWATER_RUINS];
}

export function epGetAbilityById(abilityId: string): BioluminescentAbility | undefined {
  return BIOLUMINESCENT_ABILITIES.find((a) => a.id === abilityId);
}

export function epGetAllAbilities(): BioluminescentAbility[] {
  return [...BIOLUMINESCENT_ABILITIES];
}

export function epGetEquipmentById(equipmentId: string): EquipmentItem | undefined {
  return EQUIPMENT_ITEMS.find((e) => e.id === equipmentId);
}

export function epGetEquipmentForSlot(slot: EquipmentSlot): EquipmentItem[] {
  return EQUIPMENT_ITEMS.filter((e) => e.slot === slot);
}

export function epGetAllEquipment(): EquipmentItem[] {
  return [...EQUIPMENT_ITEMS];
}

export function epGetSubmarineUpgrade(level: number): SubmarineUpgrade | undefined {
  return SUBMARINE_UPGRADES.find((u) => u.level === level);
}

export function epGetAllSubmarineUpgrades(): SubmarineUpgrade[] {
  return [...SUBMARINE_UPGRADES];
}

export function epGetNextSubmarineUpgrade(state: LeviathanDepthsState): SubmarineUpgrade | undefined {
  return SUBMARINE_UPGRADES.find((u) => u.level === state.submarineLevel + 1);
}

export function epGetLeviathanPhase(phaseNumber: number): LeviathanPhase | undefined {
  return LEVIATHAN_PHASES.find((p) => p.phase === phaseNumber);
}

export function epGetAllLeviathanPhases(): LeviathanPhase[] {
  return [...LEVIATHAN_PHASES];
}

export function epGetRecipeById(recipeId: string): CraftingRecipe | undefined {
  return CRAFTING_RECIPES.find((r) => r.id === recipeId);
}

export function epGetAllRecipes(): CraftingRecipe[] {
  return [...CRAFTING_RECIPES];
}

export function epGetKnownRecipes(state: LeviathanDepthsState): CraftingRecipe[] {
  return CRAFTING_RECIPES.filter((r) => state.recipesKnown.includes(r.id));
}

export function epGetAchievementById(achievementId: string): AchievementDef | undefined {
  return ACHIEVEMENT_DEFS.find((a) => a.id === achievementId);
}

export function epGetAllAchievements(): AchievementDef[] {
  return [...ACHIEVEMENT_DEFS];
}

export function epGetUnlockedAchievements(state: LeviathanDepthsState): AchievementDef[] {
  return ACHIEVEMENT_DEFS.filter((a) => state.achievements.includes(a.id));
}

export function epGetLockedAchievements(state: LeviathanDepthsState): AchievementDef[] {
  return ACHIEVEMENT_DEFS.filter((a) => !state.achievements.includes(a.id));
}

// ---------------------------------------------------------------------------
// Leveling & XP
// ---------------------------------------------------------------------------

export function epGetXpProgress(state: LeviathanDepthsState): { current: number; required: number; percent: number } {
  const required = xpForLevel(state.level);
  return {
    current: state.xp,
    required,
    percent: required > 0 ? Math.min((state.xp / required) * 100, 100) : 100,
  };
}

export function epAddXp(state: LeviathanDepthsState, amount: number): LeviathanDepthsState {
  if (amount <= 0) return state;
  let newState = { ...state, xp: state.xp + amount };
  while (newState.xp >= xpForLevel(newState.level) && newState.level < getMaxLevel()) {
    newState = {
      ...newState,
      xp: newState.xp - xpForLevel(newState.level),
      level: newState.level + 1,
      maxMana: 30 + newState.level * 5,
      maxOxygen: 100 + newState.level * 8,
      mana: 30 + (newState.level + 1) * 5,
    };
  }
  if (newState.level >= getMaxLevel()) {
    newState.xp = 0;
  }
  return newState;
}

export function epAddScore(state: LeviathanDepthsState, amount: number): LeviathanDepthsState {
  return { ...state, totalScore: state.totalScore + Math.max(0, amount) };
}

// ---------------------------------------------------------------------------
// Diving Mechanics
// ---------------------------------------------------------------------------

export function epStartDive(state: LeviathanDepthsState): LeviathanDepthsState {
  if (state.isDiving) return state;
  const sub = epGetSubmarineUpgrade(state.submarineLevel);
  const maxOxy = (sub?.oxygenCapacity ?? 100) + epGetEquipmentOxygenBonus(state);
  const maxPres = (sub?.pressureResistance ?? 100) + epGetEquipmentPressureRes(state);
  return {
    ...state,
    isDiving: true,
    currentDepth: 0,
    oxygen: maxOxy,
    maxOxygen: maxOxy,
    maxPressure: maxPres,
    pressure: 0,
    activeEffects: [],
    abilityCooldowns: {},
    mana: state.maxMana,
    dailyDiveProgress: {
      depthReached: 0,
      creaturesDefeated: 0,
      resourcesCollected: 0,
    },
  };
}

export function epEndDive(state: LeviathanDepthsState): LeviathanDepthsState {
  if (!state.isDiving) return state;
  const diveScore = Math.floor(state.currentDepth * 2 + state.dailyDiveProgress.creaturesDefeated * 10 + state.dailyDiveProgress.resourcesCollected * 5);
  const diveXp = Math.floor(state.currentDepth * 0.5 + state.dailyDiveProgress.creaturesDefeated * 5);
  const logEntry: DiveLogEntry = {
    timestamp: Date.now(),
    depth: state.currentDepth,
    zone: state.currentZone,
    event: 'dive_end',
    details: `Completed dive to ${state.currentDepth}m in zone ${OCEAN_ZONES[state.currentZone]?.nameZh ?? 'Unknown'}`,
    scoreGained: diveScore,
    xpGained: diveXp,
  };
  let newState = epAddXp(state, diveXp);
  newState = epAddScore(newState, diveScore);
  newState = {
    ...newState,
    isDiving: false,
    totalDives: newState.totalDives + 1,
    deepestDive: Math.max(newState.deepestDive, state.currentDepth),
    maxDepth: Math.max(newState.maxDepth, state.currentDepth),
    diveLog: [logEntry, ...newState.diveLog].slice(0, 100),
  };
  return newState;
}

export function epDescend(state: LeviathanDepthsState, meters: number): LeviathanDepthsState {
  if (!state.isDiving || state.oxygen <= 0) return state;
  const zone = epGetCurrentZone(state);
  const depthIncrease = Math.max(1, Math.floor(meters));
  const newDepth = state.currentDepth + depthIncrease;
  const newPressure = Math.floor(newDepth * zone.pressureMultiplier * 0.01);
  const oxygenLoss = Math.ceil(zone.oxygenDrainRate * (depthIncrease / 10));
  const newOxygen = Math.max(0, state.oxygen - oxygenLoss);
  let newState: LeviathanDepthsState = {
    ...state,
    currentDepth: newDepth,
    pressure: newPressure,
    oxygen: newOxygen,
    dailyDiveProgress: {
      ...state.dailyDiveProgress,
      depthReached: Math.max(state.dailyDiveProgress.depthReached, newDepth),
    },
  };
  // Auto zone transition
  for (let i = OCEAN_ZONES.length - 1; i >= 0; i--) {
    if (newDepth >= OCEAN_ZONES[i].minDepth) {
      if (newState.currentZone !== OCEAN_ZONES[i].id) {
        newState = { ...newState, currentZone: OCEAN_ZONES[i].id };
        if (!newState.discoveries.includes(OCEAN_ZONES[i].id.toString())) {
          newState = { ...newState, discoveries: [...newState.discoveries, OCEAN_ZONES[i].id.toString()] };
        }
      }
      break;
    }
  }
  // Check oxygen depletion
  if (newOxygen <= 0) {
    newState = epEndDive(newState);
  }
  // Check pressure exceeded
  if (newPressure > newState.maxPressure) {
    newState = {
      ...newState,
      oxygen: Math.max(0, newState.oxygen - Math.floor((newPressure - newState.maxPressure) * 0.5)),
    };
    if (newState.oxygen <= 0) {
      newState = epEndDive(newState);
    }
  }
  return newState;
}

export function epAscend(state: LeviathanDepthsState, meters: number): LeviathanDepthsState {
  if (!state.isDiving) return state;
  const depthDecrease = Math.max(1, Math.floor(meters));
  const newDepth = Math.max(0, state.currentDepth - depthDecrease);
  const zone = epGetCurrentZone(state);
  const newPressure = Math.floor(newDepth * zone.pressureMultiplier * 0.01);
  const oxygenRegen = Math.floor(depthDecrease * 0.1);
  let newState: LeviathanDepthsState = {
    ...state,
    currentDepth: newDepth,
    pressure: newPressure,
    oxygen: Math.min(state.maxOxygen, state.oxygen + oxygenRegen),
  };
  // Auto zone transition
  for (let i = OCEAN_ZONES.length - 1; i >= 0; i--) {
    if (newDepth >= OCEAN_ZONES[i].minDepth) {
      if (newState.currentZone !== OCEAN_ZONES[i].id) {
        newState = { ...newState, currentZone: OCEAN_ZONES[i].id };
      }
      break;
    }
    if (i === 0) {
      newState = { ...newState, currentZone: 0 };
    }
  }
  return newState;
}

// ---------------------------------------------------------------------------
// Oxygen & Pressure
// ---------------------------------------------------------------------------

export function epConsumeOxygen(state: LeviathanDepthsState, amount: number): LeviathanDepthsState {
  const newOxygen = Math.max(0, state.oxygen - amount);
  let newState: LeviathanDepthsState = { ...state, oxygen: newOxygen };
  if (newOxygen <= 0 && state.isDiving) {
    newState = epEndDive(newState);
  }
  return newState;
}

export function epRestoreOxygen(state: LeviathanDepthsState, amount: number): LeviathanDepthsState {
  return { ...state, oxygen: Math.min(state.maxOxygen, state.oxygen + amount) };
}

export function epGetOxygenPercent(state: LeviathanDepthsState): number {
  return state.maxOxygen > 0 ? Math.floor((state.oxygen / state.maxOxygen) * 100) : 0;
}

export function epGetPressurePercent(state: LeviathanDepthsState): number {
  return state.maxPressure > 0 ? Math.min(100, Math.floor((state.pressure / state.maxPressure) * 100)) : 0;
}

export function epIsPressureCritical(state: LeviathanDepthsState): boolean {
  return epGetPressurePercent(state) >= 90;
}

export function epIsOxygenLow(state: LeviathanDepthsState): boolean {
  return epGetOxygenPercent(state) <= 20;
}

// ---------------------------------------------------------------------------
// Equipment
// ---------------------------------------------------------------------------

export function epEquip(state: LeviathanDepthsState, slot: EquipmentSlot, equipmentId: string): LeviathanDepthsState {
  return {
    ...state,
    equippedGear: { ...state.equippedGear, [slot]: equipmentId },
  };
}

export function epUnequip(state: LeviathanDepthsState, slot: EquipmentSlot): LeviathanDepthsState {
  return {
    ...state,
    equippedGear: { ...state.equippedGear, [slot]: null },
  };
}

export function epGetEquippedItem(state: LeviathanDepthsState, slot: EquipmentSlot): EquipmentItem | undefined {
  const id = state.equippedGear[slot];
  if (!id) return undefined;
  return EQUIPMENT_ITEMS.find((e) => e.id === id);
}

export function epGetAllEquipped(state: LeviathanDepthsState): (EquipmentItem | undefined)[] {
  const slots: EquipmentSlot[] = ['divingSuit', 'harpoon', 'sonar', 'lantern', 'oxygenTank'];
  return slots.map((slot) => epGetEquippedItem(state, slot));
}

export function epGetEquipmentOxygenBonus(state: LeviathanDepthsState): number {
  const slots: EquipmentSlot[] = ['divingSuit', 'oxygenTank'];
  let bonus = 0;
  for (const slot of slots) {
    const item = epGetEquippedItem(state, slot);
    if (item) bonus += item.oxygenBonus;
  }
  return bonus;
}

export function epGetEquipmentAttackBonus(state: LeviathanDepthsState): number {
  let bonus = 0;
  const slots: EquipmentSlot[] = ['divingSuit', 'harpoon', 'lantern'];
  for (const slot of slots) {
    const item = epGetEquippedItem(state, slot);
    if (item) bonus += item.attackBonus;
  }
  return bonus;
}

export function epGetEquipmentDefenseBonus(state: LeviathanDepthsState): number {
  let bonus = 0;
  const slots: EquipmentSlot[] = ['divingSuit', 'harpoon', 'sonar'];
  for (const slot of slots) {
    const item = epGetEquippedItem(state, slot);
    if (item) bonus += item.defenseBonus;
  }
  return bonus;
}

export function epGetEquipmentAbilityPowerBonus(state: LeviathanDepthsState): number {
  let bonus = 0;
  const slots: EquipmentSlot[] = ['divingSuit', 'harpoon', 'sonar', 'lantern', 'oxygenTank'];
  for (const slot of slots) {
    const item = epGetEquippedItem(state, slot);
    if (item) bonus += item.abilityPowerBonus;
  }
  return bonus;
}

export function epGetEquipmentPressureRes(state: LeviathanDepthsState): number {
  let bonus = 0;
  const slots: EquipmentSlot[] = ['divingSuit', 'oxygenTank', 'harpoon'];
  for (const slot of slots) {
    const item = epGetEquippedItem(state, slot);
    if (item) bonus += item.pressureResistance;
  }
  return bonus;
}

// ---------------------------------------------------------------------------
// Combat — Creature Encounters
// ---------------------------------------------------------------------------

export function epCalculateDamage(state: LeviathanDepthsState, baseAttack: number): number {
  const weaponBonus = epGetEquipmentAttackBonus(state);
  const abilityPower = epGetEquipmentAbilityPowerBonus(state);
  const buffBonus = epGetActiveEffectValue(state, 'attack');
  const raw = baseAttack + weaponBonus + Math.floor(abilityPower * 0.3) + buffBonus;
  return Math.max(1, raw);
}

export function epCalculateDefense(state: LeviathanDepthsState): number {
  const gearDefense = epGetEquipmentDefenseBonus(state);
  const buffBonus = epGetActiveEffectValue(state, 'defense');
  return Math.max(0, gearDefense + buffBonus);
}

export function epDefeatCreature(state: LeviathanDepthsState, creatureId: string): LeviathanDepthsState {
  const creature = epGetCreatureById(creatureId);
  if (!creature) return state;
  const newState = epAddXp(state, creature.xpReward);
  const withScore = epAddScore(newState, creature.scoreReward);
  const defeated = withScore.creaturesDefeated.includes(creatureId)
    ? withScore.creaturesDefeated
    : [...withScore.creaturesDefeated, creatureId];
  return {
    ...withScore,
    creaturesDefeated: defeated,
    totalCreaturesDefeated: withScore.totalCreaturesDefeated + 1,
    dailyDiveProgress: {
      ...withScore.dailyDiveProgress,
      creaturesDefeated: withScore.dailyDiveProgress.creaturesDefeated + 1,
    },
  };
}

export function epTakeDamage(state: LeviathanDepthsState, amount: number): LeviathanDepthsState {
  const defense = epCalculateDefense(state);
  const shield = epGetActiveEffectValue(state, 'shield');
  const mitigated = Math.max(0, amount - defense - shield);
  const oxygenLoss = Math.floor(mitigated * 0.1);
  let newState: LeviathanDepthsState = {
    ...state,
    totalDamageTaken: state.totalDamageTaken + mitigated,
    oxygen: Math.max(0, state.oxygen - oxygenLoss),
  };
  if (newState.oxygen <= 0 && newState.isDiving) {
    newState = epEndDive(newState);
  }
  return newState;
}

export function epRecordDamageDealt(state: LeviathanDepthsState, amount: number): LeviathanDepthsState {
  return { ...state, totalDamageDealt: state.totalDamageDealt + amount };
}

// ---------------------------------------------------------------------------
// Bioluminescent Abilities
// ---------------------------------------------------------------------------

export function epUnlockAbility(state: LeviathanDepthsState, abilityId: string): LeviathanDepthsState {
  if (state.abilitiesUnlocked.includes(abilityId)) return state;
  return { ...state, abilitiesUnlocked: [...state.abilitiesUnlocked, abilityId] };
}

export function epUseAbility(state: LeviathanDepthsState, abilityId: string): LeviathanDepthsState {
  const ability = epGetAbilityById(abilityId);
  if (!ability) return state;
  if (!state.abilitiesUnlocked.includes(abilityId)) return state;
  if (state.mana < ability.manaCost) return state;
  const cd = state.abilityCooldowns[abilityId] ?? 0;
  if (cd > 0) return state;

  const abilPower = epGetEquipmentAbilityPowerBonus(state);
  const scaledDamage = ability.damage + Math.floor(abilPower * 0.5);
  const scaledHealing = ability.healingAmount + Math.floor(abilPower * 0.3);

  let newState: LeviathanDepthsState = {
    ...state,
    mana: state.mana - ability.manaCost,
    abilityCooldowns: { ...state.abilityCooldowns, [abilityId]: ability.cooldown },
    totalDamageDealt: state.totalDamageDealt + scaledDamage,
  };

  // Apply effects
  if (ability.effectType === 'heal' || scaledHealing > 0) {
    newState = { ...newState, oxygen: Math.min(newState.maxOxygen, newState.oxygen + scaledHealing) };
  }
  if (ability.effectType === 'buff') {
    newState = epAddEffect(newState, { type: 'attack', remainingTurns: ability.duration, value: 10 + Math.floor(abilPower * 0.2) });
  }
  if (ability.effectType === 'shield') {
    newState = epAddEffect(newState, { type: 'shield', remainingTurns: ability.duration, value: 15 + Math.floor(abilPower * 0.3) });
  }
  if (ability.effectType === 'debuff') {
    // Debuffs affect encountered creatures; tracked as score bonus
    newState = epAddScore(newState, Math.floor(scaledDamage * 0.5));
  }
  if (ability.effectType === 'reveal') {
    newState = epAddEffect(newState, { type: 'reveal', remainingTurns: ability.duration, value: 1 });
  }

  return newState;
}

export function epReduceCooldowns(state: LeviathanDepthsState): LeviathanDepthsState {
  const newCooldowns: Record<string, number> = {};
  for (const [key, val] of Object.entries(state.abilityCooldowns)) {
    const reduced = val - 1;
    if (reduced > 0) newCooldowns[key] = reduced;
  }
  const newEffects = state.activeEffects
    .map((e) => ({ ...e, remainingTurns: e.remainingTurns - 1 }))
    .filter((e) => e.remainingTurns > 0);
  return { ...state, abilityCooldowns: newCooldowns, activeEffects: newEffects };
}

export function epRestoreMana(state: LeviathanDepthsState, amount: number): LeviathanDepthsState {
  return { ...state, mana: Math.min(state.maxMana, state.mana + amount) };
}

export function epGetManaPercent(state: LeviathanDepthsState): number {
  return state.maxMana > 0 ? Math.floor((state.mana / state.maxMana) * 100) : 0;
}

export function epGetAbilityCooldown(state: LeviathanDepthsState, abilityId: string): number {
  return state.abilityCooldowns[abilityId] ?? 0;
}

export function epCanUseAbility(state: LeviathanDepthsState, abilityId: string): boolean {
  const ability = epGetAbilityById(abilityId);
  if (!ability) return false;
  if (!state.abilitiesUnlocked.includes(abilityId)) return false;
  if (state.mana < ability.manaCost) return false;
  if ((state.abilityCooldowns[abilityId] ?? 0) > 0) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Active Effects
// ---------------------------------------------------------------------------

export function epAddEffect(state: LeviathanDepthsState, effect: { type: string; remainingTurns: number; value: number }): LeviathanDepthsState {
  return { ...state, activeEffects: [...state.activeEffects, effect] };
}

export function epRemoveEffect(state: LeviathanDepthsState, type: string): LeviathanDepthsState {
  return { ...state, activeEffects: state.activeEffects.filter((e) => e.type !== type) };
}

export function epGetActiveEffectValue(state: LeviathanDepthsState, type: string): number {
  return state.activeEffects.filter((e) => e.type === type).reduce((sum, e) => sum + e.value, 0);
}

export function epHasActiveEffect(state: LeviathanDepthsState, type: string): boolean {
  return state.activeEffects.some((e) => e.type === type);
}

export function epClearAllEffects(state: LeviathanDepthsState): LeviathanDepthsState {
  return { ...state, activeEffects: [] };
}

// ---------------------------------------------------------------------------
// Inventory Management
// ---------------------------------------------------------------------------

export function epAddItem(state: LeviathanDepthsState, item: DeepItem): LeviathanDepthsState {
  if (item.stackable) {
    const existing = state.inventory.find((i) => i.id === item.id);
    if (existing) {
      return {
        ...state,
        inventory: state.inventory.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i,
        ),
      };
    }
  }
  return { ...state, inventory: [...state.inventory, { ...item }] };
}

export function epAddItems(state: LeviathanDepthsState, items: DeepItem[]): LeviathanDepthsState {
  let newState = state;
  for (const item of items) {
    newState = epAddItem(newState, item);
  }
  return newState;
}

export function epRemoveItem(state: LeviathanDepthsState, itemId: string, quantity: number): LeviathanDepthsState {
  const existing = state.inventory.find((i) => i.id === itemId);
  if (!existing || existing.quantity < quantity) return state;
  if (existing.quantity === quantity) {
    return { ...state, inventory: state.inventory.filter((i) => i.id !== itemId) };
  }
  return {
    ...state,
    inventory: state.inventory.map((i) =>
      i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i,
    ),
  };
}

export function epHasItem(state: LeviathanDepthsState, itemId: string, quantity: number = 1): boolean {
  const item = state.inventory.find((i) => i.id === itemId);
  return item !== undefined && item.quantity >= quantity;
}

export function epGetItemCount(state: LeviathanDepthsState, itemId: string): number {
  return state.inventory.find((i) => i.id === itemId)?.quantity ?? 0;
}

export function epGetInventoryValue(state: LeviathanDepthsState): number {
  return state.inventory.reduce((sum, item) => sum + item.value * item.quantity, 0);
}

export function epGetInventoryByType(state: LeviathanDepthsState, type: DeepItem['type']): DeepItem[] {
  return state.inventory.filter((i) => i.type === type);
}

export function epGetInventoryByRarity(state: LeviathanDepthsState, rarity: DeepItem['rarity']): DeepItem[] {
  return state.inventory.filter((i) => i.rarity === rarity);
}

// ---------------------------------------------------------------------------
// Resource Collection
// ---------------------------------------------------------------------------

export function epCollectPearls(state: LeviathanDepthsState, amount: number): LeviathanDepthsState {
  return {
    ...state,
    pearls: state.pearls + amount,
    totalPearlsCollected: state.totalPearlsCollected + amount,
    totalResourcesCollected: state.totalResourcesCollected + amount,
    dailyDiveProgress: { ...state.dailyDiveProgress, resourcesCollected: state.dailyDiveProgress.resourcesCollected + amount },
  };
}

export function epCollectCoralFragments(state: LeviathanDepthsState, amount: number): LeviathanDepthsState {
  return {
    ...state,
    coralFragments: state.coralFragments + amount,
    totalCoralCollected: state.totalCoralCollected + amount,
    totalResourcesCollected: state.totalResourcesCollected + amount,
    dailyDiveProgress: { ...state.dailyDiveProgress, resourcesCollected: state.dailyDiveProgress.resourcesCollected + amount },
  };
}

export function epCollectAncientCoins(state: LeviathanDepthsState, amount: number): LeviathanDepthsState {
  return {
    ...state,
    ancientCoins: state.ancientCoins + amount,
    totalResourcesCollected: state.totalResourcesCollected + amount,
    dailyDiveProgress: { ...state.dailyDiveProgress, resourcesCollected: state.dailyDiveProgress.resourcesCollected + amount },
  };
}

export function epCollectAbyssalCrystals(state: LeviathanDepthsState, amount: number): LeviathanDepthsState {
  return {
    ...state,
    abyssalCrystals: state.abyssalCrystals + amount,
    totalResourcesCollected: state.totalResourcesCollected + amount,
    dailyDiveProgress: { ...state.dailyDiveProgress, resourcesCollected: state.dailyDiveProgress.resourcesCollected + amount },
  };
}

export function epSpendPearls(state: LeviathanDepthsState, amount: number): LeviathanDepthsState {
  return state.pearls >= amount ? { ...state, pearls: state.pearls - amount } : state;
}

export function epSpendCoins(state: LeviathanDepthsState, amount: number): LeviathanDepthsState {
  return state.ancientCoins >= amount ? { ...state, ancientCoins: state.ancientCoins - amount } : state;
}

// ---------------------------------------------------------------------------
// Ruins Exploration
// ---------------------------------------------------------------------------

export function epExploreRuin(state: LeviathanDepthsState, ruinId: string): LeviathanDepthsState {
  const ruin = epGetRuinById(ruinId);
  if (!ruin) return state;
  if (state.ruinsExplored.includes(ruinId)) return state;
  if (state.level < ruin.requiredLevel) return state;

  let newState = epAddXp(state, ruin.dangerLevel * 30);
  newState = epAddScore(newState, ruin.dangerLevel * 50);
  newState = epAddItems(newState, ruin.rewards);

  const newRuinsExplored = [...newState.ruinsExplored, ruinId];
  const newLore = ruin.lore && !newState.loreCollected.includes(ruin.lore)
    ? [...newState.loreCollected, ruin.lore]
    : newState.loreCollected;

  // Track resource collection from rewards
  for (const reward of ruin.rewards) {
    if (reward.id.includes('pearl')) newState = epCollectPearls(newState, reward.quantity);
    if (reward.id.includes('coral')) newState = epCollectCoralFragments(newState, reward.quantity);
    if (reward.id.includes('coin')) newState = epCollectAncientCoins(newState, reward.quantity);
    if (reward.id.includes('crystal')) newState = epCollectAbyssalCrystals(newState, reward.quantity);
  }

  const logEntry: DiveLogEntry = {
    timestamp: Date.now(),
    depth: state.currentDepth,
    zone: state.currentZone,
    event: 'ruin_explored',
    details: `Explored ${ruin.nameZh}`,
    scoreGained: ruin.dangerLevel * 50,
    xpGained: ruin.dangerLevel * 30,
  };

  return {
    ...newState,
    ruinsExplored: newRuinsExplored,
    loreCollected: newLore,
    diveLog: [logEntry, ...newState.diveLog].slice(0, 100),
  };
}

export function epCanExploreRuin(state: LeviathanDepthsState, ruinId: string): boolean {
  const ruin = epGetRuinById(ruinId);
  if (!ruin) return false;
  if (state.ruinsExplored.includes(ruinId)) return false;
  if (state.level < ruin.requiredLevel) return false;
  if (!state.isDiving) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Submarine Upgrades
// ---------------------------------------------------------------------------

export function epUpgradeSubmarine(state: LeviathanDepthsState): LeviathanDepthsState {
  const nextUpgrade = epGetNextSubmarineUpgrade(state);
  if (!nextUpgrade) return state;
  if (state.pearls < nextUpgrade.costPearls) return state;
  if (state.ancientCoins < nextUpgrade.costCoins) return state;

  let newState = epSpendPearls(state, nextUpgrade.costPearls);
  newState = epSpendCoins(newState, nextUpgrade.costCoins);
  newState = {
    ...newState,
    submarineLevel: nextUpgrade.level,
    submarineUpgrades: [...newState.submarineUpgrades, `sub_${nextUpgrade.level}`],
  };
  return newState;
}

export function epCanUpgradeSubmarine(state: LeviathanDepthsState): boolean {
  const nextUpgrade = epGetNextSubmarineUpgrade(state);
  if (!nextUpgrade) return false;
  return state.pearls >= nextUpgrade.costPearls && state.ancientCoins >= nextUpgrade.costCoins;
}

export function epGetSubmarineStats(state: LeviathanDepthsState): SubmarineUpgrade {
  return SUBMARINE_UPGRADES[state.submarineLevel - 1] ?? SUBMARINE_UPGRADES[0];
}

// ---------------------------------------------------------------------------
// Leviathan Boss Encounters
// ---------------------------------------------------------------------------

export function epStartLeviathanEncounter(state: LeviathanDepthsState): LeviathanDepthsState {
  if (state.currentZone !== 7) return state;
  if (state.leviathanDefeated) return state;
  const phase = LEVIATHAN_PHASES[0];
  return {
    ...state,
    leviathanPhase: 1,
    leviathanHp: phase.hp,
    leviathanEncounters: state.leviathanEncounters + 1,
  };
}

export function epAttackLeviathan(state: LeviathanDepthsState, damage: number): LeviathanDepthsState {
  if (state.leviathanPhase === 0 || state.leviathanDefeated) return state;
  const actualDamage = epCalculateDamage(state, damage);
  const newHp = Math.max(0, state.leviathanHp - actualDamage);
  let newState: LeviathanDepthsState = {
    ...state,
    leviathanHp: newHp,
    leviathanBestDamage: Math.max(state.leviathanBestDamage, actualDamage),
    totalDamageDealt: state.totalDamageDealt + actualDamage,
  };

  // Check phase transition
  const currentPhaseDef = LEVIATHAN_PHASES.find((p) => p.phase === state.leviathanPhase);
  if (currentPhaseDef && newHp <= 0) {
    if (state.leviathanPhase < LEVIATHAN_PHASES.length) {
      const nextPhase = LEVIATHAN_PHASES[state.leviathanPhase]; // phase index matches array index
      if (nextPhase) {
        newState = {
          ...newState,
          leviathanPhase: nextPhase.phase,
          leviathanHp: nextPhase.hp,
        };
        newState = epAddXp(newState, 200 * state.leviathanPhase);
        newState = epAddScore(newState, 500 * state.leviathanPhase);
      }
    }
    if (state.leviathanPhase >= LEVIATHAN_PHASES.length) {
      newState = epDefeatLeviathan(newState);
    }
  }

  return newState;
}

export function epLeviathanAttacks(state: LeviathanDepthsState): LeviathanDepthsState {
  if (state.leviathanPhase === 0) return state;
  const phaseDef = LEVIATHAN_PHASES.find((p) => p.phase === state.leviathanPhase);
  if (!phaseDef) return state;
  return epTakeDamage(state, phaseDef.attack);
}

export function epDefeatLeviathan(state: LeviathanDepthsState): LeviathanDepthsState {
  if (state.leviathanDefeated) return state;
  let newState = epAddXp(state, 1000);
  newState = epAddScore(newState, 5000);
  const allLoot: DeepItem[] = LEVIATHAN_PHASES.flatMap((p) => p.loot);
  newState = epAddItems(newState, allLoot);

  const logEntry: DiveLogEntry = {
    timestamp: Date.now(),
    depth: state.currentDepth,
    zone: 7,
    event: 'leviathan_defeated',
    details: 'Defeated the legendary Leviathan!',
    scoreGained: 5000,
    xpGained: 1000,
  };

  return {
    ...newState,
    leviathanDefeated: true,
    leviathanPhase: LEVIATHAN_PHASES.length + 1,
    leviathanHp: 0,
    diveLog: [logEntry, ...newState.diveLog].slice(0, 100),
  };
}

export function epGetLeviathanHpPercent(state: LeviathanDepthsState): number {
  if (state.leviathanPhase === 0) return 0;
  const phaseDef = LEVIATHAN_PHASES.find((p) => p.phase === state.leviathanPhase);
  if (!phaseDef) return 0;
  return Math.max(0, Math.floor((state.leviathanHp / phaseDef.hp) * 100));
}

export function epGetLeviathanPhaseName(state: LeviathanDepthsState): string {
  const phaseDef = LEVIATHAN_PHASES.find((p) => p.phase === state.leviathanPhase);
  return phaseDef?.nameZh ?? 'Unknown';
}

// ---------------------------------------------------------------------------
// Crafting System
// ---------------------------------------------------------------------------

export function epLearnRecipe(state: LeviathanDepthsState, recipeId: string): LeviathanDepthsState {
  if (state.recipesKnown.includes(recipeId)) return state;
  return { ...state, recipesKnown: [...state.recipesKnown, recipeId] };
}

export function epCanCraft(state: LeviathanDepthsState, recipeId: string): boolean {
  const recipe = epGetRecipeById(recipeId);
  if (!recipe) return false;
  if (!state.recipesKnown.includes(recipeId)) return false;
  if (state.level < recipe.requiredLevel) return false;
  if (state.currentZone < recipe.requiredZone && state.isDiving) return false;
  for (const ing of recipe.ingredients) {
    if (!epHasItem(state, ing.itemId, ing.quantity)) return false;
  }
  return true;
}

export function epCraftItem(state: LeviathanDepthsState, recipeId: string): LeviathanDepthsState {
  if (!epCanCraft(state, recipeId)) return state;
  const recipe = epGetRecipeById(recipeId);
  if (!recipe) return state;

  let newState = state;
  for (const ing of recipe.ingredients) {
    newState = epRemoveItem(newState, ing.itemId, ing.quantity);
  }
  newState = epAddItem(newState, recipe.result);
  newState = epAddXp(newState, recipe.requiredLevel * 5);
  newState = {
    ...newState,
    itemsCrafted: newState.itemsCrafted + 1,
  };

  const logEntry: DiveLogEntry = {
    timestamp: Date.now(),
    depth: state.currentDepth,
    zone: state.currentZone,
    event: 'craft',
    details: `Crafted ${recipe.nameZh}`,
    scoreGained: 0,
    xpGained: recipe.requiredLevel * 5,
  };

  return {
    ...newState,
    diveLog: [logEntry, ...newState.diveLog].slice(0, 100),
  };
}

export function epGetCraftableRecipes(state: LeviathanDepthsState): CraftingRecipe[] {
  return CRAFTING_RECIPES.filter((r) => epCanCraft(state, r.id));
}

export function epGetUncraftableRecipes(state: LeviathanDepthsState): CraftingRecipe[] {
  return CRAFTING_RECIPES.filter((r) => !epCanCraft(state, r.id) && state.recipesKnown.includes(r.id));
}

// ---------------------------------------------------------------------------
// Consumable Usage
// ---------------------------------------------------------------------------

export function epUseConsumable(state: LeviathanDepthsState, itemId: string): LeviathanDepthsState {
  if (!epHasItem(state, itemId, 1)) return state;

  let newState: LeviathanDepthsState;
  switch (itemId) {
    case 'oxygen_canister':
      newState = epRestoreOxygen(state, 50);
      break;
    case 'mana_potion':
      newState = epRestoreMana(state, 25);
      break;
    case 'bio_gel_pack':
      newState = epRestoreOxygen(state, 30);
      newState = epRestoreMana(newState, 15);
      break;
    default:
      return state;
  }

  return epRemoveItem(newState, itemId, 1);
}

export function epCanUseConsumable(state: LeviathanDepthsState, itemId: string): boolean {
  return epHasItem(state, itemId, 1);
}

// ---------------------------------------------------------------------------
// Daily Dive Challenge
// ---------------------------------------------------------------------------

export function epGetDailyChallenge(): DailyDiveChallenge {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return generateDailyChallenge(seed);
}

export function epCompleteDailyDive(state: LeviathanDepthsState): LeviathanDepthsState {
  if (state.dailyDiveCompleted) return state;
  const challenge = epGetDailyChallenge();
  const progress = state.dailyDiveProgress;
  const depthMet = progress.depthReached >= challenge.targetDepth;
  const creaturesMet = progress.creaturesDefeated >= challenge.targetCreatures;
  const resourcesMet = progress.resourcesCollected >= challenge.targetResources;

  if (!depthMet || !creaturesMet || !resourcesMet) return state;

  let newState = epAddXp(state, challenge.bonusXp);
  newState = epAddScore(newState, challenge.bonusScore);
  newState = epCollectPearls(newState, Math.floor(challenge.bonusScore * 0.1));

  return {
    ...newState,
    dailyDiveCompleted: true,
  };
}

export function epIsDailyDiveComplete(state: LeviathanDepthsState): boolean {
  return state.dailyDiveCompleted;
}

export function epGetDailyDiveProgress(state: LeviathanDepthsState): { current: DailyDiveChallenge['daySeed']; targets: DailyDiveChallenge; progress: LeviathanDepthsState['dailyDiveProgress']; met: boolean } {
  const challenge = epGetDailyChallenge();
  const p = state.dailyDiveProgress;
  return {
    current: challenge.daySeed,
    targets: challenge,
    progress: p,
    met: p.depthReached >= challenge.targetDepth && p.creaturesDefeated >= challenge.targetCreatures && p.resourcesCollected >= challenge.targetResources,
  };
}

// ---------------------------------------------------------------------------
// Streak System
// ---------------------------------------------------------------------------

export function epUpdateStreak(state: LeviathanDepthsState, currentDate: string): LeviathanDepthsState {
  if (state.lastDiveDate === currentDate) return state;
  const yesterday = epGetPreviousDate(currentDate);
  const newStreak = state.lastDiveDate === yesterday ? state.streak + 1 : 1;
  const newBest = Math.max(state.bestStreak, newStreak);
  return {
    ...state,
    streak: newStreak,
    bestStreak: newBest,
    lastDiveDate: currentDate,
  };
}

function epGetPreviousDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  const dt = new Date(y, m - 1, d - 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

export function epGetStreakBonus(state: LeviathanDepthsState): number {
  if (state.streak >= 30) return 3.0;
  if (state.streak >= 14) return 2.0;
  if (state.streak >= 7) return 1.5;
  if (state.streak >= 3) return 1.2;
  return 1.0;
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

export function epCheckAchievements(state: LeviathanDepthsState): LeviathanDepthsState {
  let newState = state;
  let xpGained = 0;
  let scoreGained = 0;
  const newlyUnlocked: string[] = [];

  for (const ach of ACHIEVEMENT_DEFS) {
    if (state.achievements.includes(ach.id)) continue;
    if (ach.condition(state)) {
      newlyUnlocked.push(ach.id);
      xpGained += ach.rewardXp;
      scoreGained += ach.rewardScore;
    }
  }

  if (newlyUnlocked.length > 0) {
    newState = { ...newState, achievements: [...newState.achievements, ...newlyUnlocked] };
    newState = epAddXp(newState, xpGained);
    newState = epAddScore(newState, scoreGained);
  }

  return newState;
}

export function epGetAchievementProgress(state: LeviathanDepthsState): { total: number; unlocked: number; percent: number } {
  const total = ACHIEVEMENT_DEFS.length;
  const unlocked = state.achievements.length;
  return { total, unlocked, percent: total > 0 ? Math.floor((unlocked / total) * 100) : 0 };
}

// ---------------------------------------------------------------------------
// Dive Log
// ---------------------------------------------------------------------------

export function epAddDiveLogEntry(state: LeviathanDepthsState, entry: DiveLogEntry): LeviathanDepthsState {
  return { ...state, diveLog: [entry, ...state.diveLog].slice(0, 100) };
}

export function epGetRecentDiveLog(state: LeviathanDepthsState, count: number = 10): DiveLogEntry[] {
  return state.diveLog.slice(0, count);
}

export function epGetDiveLogByEvent(state: LeviathanDepthsState, event: string): DiveLogEntry[] {
  return state.diveLog.filter((e) => e.event === event);
}

export function epGetDiveLogByZone(state: LeviathanDepthsState, zoneId: number): DiveLogEntry[] {
  return state.diveLog.filter((e) => e.zone === zoneId);
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

export function epGetTotalStats(state: LeviathanDepthsState): {
  totalDives: number;
  totalCreaturesDefeated: number;
  totalResourcesCollected: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  deepestDive: number;
  totalPearlsCollected: number;
  totalCoralCollected: number;
} {
  return {
    totalDives: state.totalDives,
    totalCreaturesDefeated: state.totalCreaturesDefeated,
    totalResourcesCollected: state.totalResourcesCollected,
    totalDamageDealt: state.totalDamageDealt,
    totalDamageTaken: state.totalDamageTaken,
    deepestDive: state.deepestDive,
    totalPearlsCollected: state.totalPearlsCollected,
    totalCoralCollected: state.totalCoralCollected,
  };
}

export function epGetCombatPower(state: LeviathanDepthsState): number {
  const atk = epGetEquipmentAttackBonus(state);
  const def = epGetEquipmentDefenseBonus(state);
  const ap = epGetEquipmentAbilityPowerBonus(state);
  return atk + def * 2 + ap * 1.5 + state.level * 3;
}

export function epGetDiveEfficiency(state: LeviathanDepthsState): number {
  if (state.totalDives === 0) return 0;
  return Math.floor(state.deepestDive / state.totalDives);
}

export function epGetDiscoveryPercent(state: LeviathanDepthsState): number {
  const totalDiscoverable = OCEAN_ZONES.length + SEA_CREATURES.length + UNDERWATER_RUINS.length;
  const discovered = state.discoveries.length + state.creaturesDefeated.length + state.ruinsExplored.length;
  return totalDiscoverable > 0 ? Math.floor((discovered / totalDiscoverable) * 100) : 0;
}

// ---------------------------------------------------------------------------
// Creature Loot Generation
// ---------------------------------------------------------------------------

export function epGenerateCreatureLoot(state: LeviathanDepthsState, creatureId: string): DeepItem[] {
  const creature = epGetCreatureById(creatureId);
  if (!creature) return [];
  const lootMultiplier = 1 + state.level * 0.05;
  return creature.loot.map((item) => ({
    ...item,
    quantity: Math.max(1, Math.floor(item.quantity * lootMultiplier)),
  }));
}

// ---------------------------------------------------------------------------
// Random Encounter Check
// ---------------------------------------------------------------------------

export function epCheckForEncounter(state: LeviathanDepthsState, depth: number): SeaCreature | null {
  const zone = epGetCurrentZone(state);
  if (zone.creatureIds.length === 0) return null;
  const encounterChance = Math.min(0.8, 0.1 + depth * 0.00005);
  // Deterministic pseudo-random based on depth
  const hash = (depth * 2654435761) >>> 0;
  const roll = (hash % 10000) / 10000;
  if (roll > encounterChance) return null;
  const idx = hash % zone.creatureIds.length;
  const creatureId = zone.creatureIds[idx];
  return epGetCreatureById(creatureId) ?? null;
}

// ---------------------------------------------------------------------------
// Random Resource Discovery
// ---------------------------------------------------------------------------

export function epDiscoverRandomResource(state: LeviathanDepthsState, depth: number): DeepItem | null {
  const hash = ((depth + 7) * 1597334677) >>> 0;
  const roll = (hash % 10000) / 10000;
  if (roll > 0.3) return null;
  const zone = epGetCurrentZone(state);
  const resources: DeepItem[] = [];

  if (zone.id <= 2) {
    resources.push({ id: 'pearl_small', name: 'Small Pearl', nameZh: '小珍珠', type: 'resource', rarity: 'common', stackable: true, quantity: 1, value: 5, description: 'A shimmering small pearl' });
  }
  if (zone.id >= 1 && zone.id <= 4) {
    resources.push({ id: 'pearl_medium', name: 'Medium Pearl', nameZh: '中珍珠', type: 'resource', rarity: 'uncommon', stackable: true, quantity: 1, value: 10, description: 'A lustrous medium-sized pearl' });
  }
  if (zone.id >= 3) {
    resources.push({ id: 'ancient_coin', name: 'Ancient Coin', nameZh: '古代硬币', type: 'resource', rarity: 'rare', stackable: true, quantity: 1, value: 40, description: 'A coin from a lost civilization' });
  }
  if (zone.id >= 5) {
    resources.push({ id: 'abyssal_crystal', name: 'Abyssal Crystal', nameZh: '深渊水晶', type: 'resource', rarity: 'epic', stackable: true, quantity: 1, value: 200, description: 'A crystal formed under immense pressure' });
  }
  if (zone.id >= 6) {
    resources.push({ id: 'pearl_large', name: 'Large Pearl', nameZh: '大珍珠', type: 'resource', rarity: 'epic', stackable: true, quantity: 1, value: 100, description: 'A magnificent large pearl' });
  }

  if (resources.length === 0) return null;
  const idx = hash % resources.length;
  return resources[idx];
}

// ---------------------------------------------------------------------------
// Dive Summary
// ---------------------------------------------------------------------------

export function epGetDiveSummary(state: LeviathanDepthsState): {
  maxDepth: number;
  creaturesDefeated: number;
  resourcesCollected: number;
  zone: string;
  score: number;
} {
  const zone = epGetCurrentZone(state);
  return {
    maxDepth: state.dailyDiveProgress.depthReached,
    creaturesDefeated: state.dailyDiveProgress.creaturesDefeated,
    resourcesCollected: state.dailyDiveProgress.resourcesCollected,
    zone: zone.nameZh,
    score: state.totalScore,
  };
}

// ---------------------------------------------------------------------------
// Full Reset
// ---------------------------------------------------------------------------

export function epResetState(state: LeviathanDepthsState): LeviathanDepthsState {
  const fresh = createLeviathanDepthsState();
  // Preserve some meta stats
  return {
    ...fresh,
    bestStreak: state.bestStreak,
    totalDives: state.totalDives,
    deepestDive: state.deepestDive,
  };
}

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

export function epSerializeState(state: LeviathanDepthsState): string {
  return JSON.stringify(state);
}

export function epDeserializeState(json: string): LeviathanDepthsState {
  try {
    const parsed = JSON.parse(json);
    return createLeviathanDepthsState(parsed);
  } catch {
    return createLeviathanDepthsState();
  }
}

// ---------------------------------------------------------------------------
// Zone Visibility & Navigation Helpers
// ---------------------------------------------------------------------------

export function epGetVisibilityRange(state: LeviathanDepthsState): number {
  const zone = epGetCurrentZone(state);
  const lanternBonus = epGetEquipmentAbilityPowerBonus(state) * 0.2;
  const revealBonus = epHasActiveEffect(state, 'reveal') ? 20 : 0;
  return Math.floor(zone.visibilityRange + lanternBonus + revealBonus);
}

export function epGetDepthZoneColor(state: LeviathanDepthsState): number {
  return epGetCurrentZone(state).backgroundHue;
}

export function epGetAccessibleZones(state: LeviathanDepthsState): OceanZone[] {
  const maxAccessibleZone = Math.min(OCEAN_ZONES.length - 1, Math.floor(state.level / 5));
  return OCEAN_ZONES.filter((z) => z.id <= maxAccessibleZone);
}

export function epGetZoneProgress(state: LeviathanDepthsState, zoneId: number): { creaturesFound: number; totalCreatures: number; ruinExplored: boolean; discovered: boolean } {
  const zone = epGetZoneById(state, zoneId);
  if (!zone) return { creaturesFound: 0, totalCreatures: 0, ruinExplored: false, discovered: false };
  const creaturesFound = zone.creatureIds.filter((cid) => state.creaturesDefeated.includes(cid)).length;
  const ruinExplored = zone.ruinIds.some((rid) => state.ruinsExplored.includes(rid));
  const discovered = state.discoveries.includes(zoneId.toString());
  return { creaturesFound, totalCreatures: zone.creatureIds.length, ruinExplored, discovered };
}

// ---------------------------------------------------------------------------
// Derived Calculations — no React, no side effects
// ---------------------------------------------------------------------------

export function epCalculateMaxDiveTime(state: LeviathanDepthsState): number {
  const zone = epGetCurrentZone(state);
  if (zone.oxygenDrainRate === 0) return Infinity;
  return Math.floor(state.maxOxygen / zone.oxygenDrainRate * 10);
}

export function epGetDepthPercentInZone(state: LeviathanDepthsState): number {
  const zone = epGetCurrentZone(state);
  const range = zone.maxDepth - zone.minDepth;
  if (range === 0) return 100;
  return Math.min(100, Math.max(0, Math.floor(((state.currentDepth - zone.minDepth) / range) * 100)));
}

export function epGetOverallProgress(state: LeviathanDepthsState): number {
  const levelProgress = state.level / getMaxLevel() * 25;
  const zoneProgress = (state.discoveries.length / OCEAN_ZONES.length) * 25;
  const creatureProgress = (state.creaturesDefeated.length / SEA_CREATURES.length) * 25;
  const achievementProgress = (state.achievements.length / ACHIEVEMENT_DEFS.length) * 25;
  return Math.min(100, Math.floor(levelProgress + zoneProgress + creatureProgress + achievementProgress));
}

export function epGetRiskLevel(state: LeviathanDepthsState): 'safe' | 'moderate' | 'dangerous' | 'extreme' | 'lethal' {
  const pressurePct = epGetPressurePercent(state);
  const oxyPct = epGetOxygenPercent(state);
  if (pressurePct < 30 && oxyPct > 60) return 'safe';
  if (pressurePct < 60 && oxyPct > 30) return 'moderate';
  if (pressurePct < 80 && oxyPct > 15) return 'dangerous';
  if (pressurePct < 95 && oxyPct > 5) return 'extreme';
  return 'lethal';
}

export function epGetRiskColor(state: LeviathanDepthsState): string {
  const risk = epGetRiskLevel(state);
  switch (risk) {
    case 'safe': return '#22c55e';
    case 'moderate': return '#eab308';
    case 'dangerous': return '#f97316';
    case 'extreme': return '#ef4444';
    case 'lethal': return '#dc2626';
  }
}

// ---------------------------------------------------------------------------
// Mana & Ability Power Summary
// ---------------------------------------------------------------------------

export function epGetAbilitySummary(state: LeviathanDepthsState): {
  totalUnlocked: number;
  totalAvailable: number;
  mana: number;
  maxMana: number;
  abilityPower: number;
} {
  return {
    totalUnlocked: state.abilitiesUnlocked.length,
    totalAvailable: BIOLUMINESCENT_ABILITIES.length,
    mana: state.mana,
    maxMana: state.maxMana,
    abilityPower: epGetEquipmentAbilityPowerBonus(state),
  };
}

// ============================================================================
// Default Export Hook — React
// ============================================================================

import { useState, useCallback } from 'react';

export default function useLeviathanDepths(initialState?: Partial<LeviathanDepthsState>) {
  const [state, setState] = useState<LeviathanDepthsState>(() =>
    createLeviathanDepthsState(initialState),
  );

  // ---- Diving ----
  const startDive = useCallback(() => {
    setState((prev) => epStartDive(prev));
  }, []);

  const endDive = useCallback(() => {
    setState((prev) => {
      let next = epEndDive(prev);
      next = epCheckAchievements(next);
      return next;
    });
  }, []);

  const descend = useCallback((meters: number) => {
    setState((prev) => epDescend(prev, meters));
  }, []);

  const ascend = useCallback((meters: number) => {
    setState((prev) => epAscend(prev, meters));
  }, []);

  // ---- Combat ----
  const defeatCreature = useCallback((creatureId: string) => {
    setState((prev) => {
      let next = epDefeatCreature(prev, creatureId);
      const loot = epGenerateCreatureLoot(prev, creatureId);
      next = epAddItems(next, loot);
      next = epCheckAchievements(next);
      return next;
    });
  }, []);

  const takeDamage = useCallback((amount: number) => {
    setState((prev) => epTakeDamage(prev, amount));
  }, []);

  // ---- Abilities ----
  const useAbility = useCallback((abilityId: string) => {
    setState((prev) => {
      let next = epUseAbility(prev, abilityId);
      next = epCheckAchievements(next);
      return next;
    });
  }, []);

  const reduceCooldowns = useCallback(() => {
    setState((prev) => epReduceCooldowns(prev));
  }, []);

  // ---- Equipment ----
  const equip = useCallback((slot: EquipmentSlot, equipmentId: string) => {
    setState((prev) => epEquip(prev, slot, equipmentId));
  }, []);

  const unequip = useCallback((slot: EquipmentSlot) => {
    setState((prev) => epUnequip(prev, slot));
  }, []);

  // ---- Inventory ----
  const addItem = useCallback((item: DeepItem) => {
    setState((prev) => epAddItem(prev, item));
  }, []);

  const removeItem = useCallback((itemId: string, quantity: number) => {
    setState((prev) => epRemoveItem(prev, itemId, quantity));
  }, []);

  const useConsumable = useCallback((itemId: string) => {
    setState((prev) => epUseConsumable(prev, itemId));
  }, []);

  // ---- Ruins ----
  const exploreRuin = useCallback((ruinId: string) => {
    setState((prev) => {
      let next = epExploreRuin(prev, ruinId);
      next = epCheckAchievements(next);
      return next;
    });
  }, []);

  // ---- Submarine ----
  const upgradeSubmarine = useCallback(() => {
    setState((prev) => epUpgradeSubmarine(prev));
  }, []);

  // ---- Leviathan ----
  const startLeviathanEncounter = useCallback(() => {
    setState((prev) => epStartLeviathanEncounter(prev));
  }, []);

  const attackLeviathan = useCallback((damage: number) => {
    setState((prev) => {
      let next = epAttackLeviathan(prev, damage);
      next = epCheckAchievements(next);
      return next;
    });
  }, []);

  const leviathanAttacks = useCallback(() => {
    setState((prev) => epLeviathanAttacks(prev));
  }, []);

  // ---- Crafting ----
  const craftItem = useCallback((recipeId: string) => {
    setState((prev) => {
      let next = epCraftItem(prev, recipeId);
      next = epCheckAchievements(next);
      return next;
    });
  }, []);

  const learnRecipe = useCallback((recipeId: string) => {
    setState((prev) => epLearnRecipe(prev, recipeId));
  }, []);

  // ---- Resources ----
  const collectPearls = useCallback((amount: number) => {
    setState((prev) => epCollectPearls(prev, amount));
  }, []);

  const collectCoralFragments = useCallback((amount: number) => {
    setState((prev) => epCollectCoralFragments(prev, amount));
  }, []);

  const collectAncientCoins = useCallback((amount: number) => {
    setState((prev) => epCollectAncientCoins(prev, amount));
  }, []);

  const collectAbyssalCrystals = useCallback((amount: number) => {
    setState((prev) => epCollectAbyssalCrystals(prev, amount));
  }, []);

  // ---- Daily ----
  const completeDailyDive = useCallback(() => {
    setState((prev) => epCompleteDailyDive(prev));
  }, []);

  const updateStreak = useCallback((currentDate: string) => {
    setState((prev) => epUpdateStreak(prev, currentDate));
  }, []);

  // ---- Abilities (unlock) ----
  const unlockAbility = useCallback((abilityId: string) => {
    setState((prev) => epUnlockAbility(prev, abilityId));
  }, []);

  // ---- Reset ----
  const resetState = useCallback(() => {
    setState((prev) => epResetState(prev));
  }, []);

  // ---- Serialization ----
  const serializeState = useCallback(() => {
    return epSerializeState(state);
  }, [state]);

  const deserializeAndSetState = useCallback((json: string) => {
    setState(epDeserializeState(json));
  }, []);

  // ---- Computed values (direct function calls, no useMemo) ----
  const currentZone = epGetCurrentZone(state);
  const xpProgress = epGetXpProgress(state);
  const oxygenPercent = epGetOxygenPercent(state);
  const pressurePercent = epGetPressurePercent(state);
  const manaPercent = epGetManaPercent(state);
  const riskLevel = epGetRiskLevel(state);
  const riskColor = epGetRiskColor(state);
  const combatPower = epGetCombatPower(state);
  const diveEfficiency = epGetDiveEfficiency(state);
  const discoveryPercent = epGetDiscoveryPercent(state);
  const visibilityRange = epGetVisibilityRange(state);
  const overallProgress = epGetOverallProgress(state);
  const abilitySummary = epGetAbilitySummary(state);
  const achievementProgress = epGetAchievementProgress(state);
  const leviathanHpPercent = epGetLeviathanHpPercent(state);
  const leviathanPhaseName = epGetLeviathanPhaseName(state);
  const diveSummary = epGetDiveSummary(state);
  const dailyDiveInfo = epGetDailyDiveProgress(state);
  const totalStats = epGetTotalStats(state);
  const accessibleZones = epGetAccessibleZones(state);
  const inventoryValue = epGetInventoryValue(state);
  const canUpgradeSub = epCanUpgradeSubmarine(state);
  const craftableRecipes = epGetCraftableRecipes(state);
  const unlockedAchievements = epGetUnlockedAchievements(state);
  const lockedAchievements = epGetLockedAchievements(state);
  const knownRecipes = epGetKnownRecipes(state);
  const depthPercentInZone = epGetDepthPercentInZone(state);
  const maxDiveTime = epCalculateMaxDiveTime(state);
  const streakBonus = epGetStreakBonus(state);
  const isOxygenLow = epIsOxygenLow(state);
  const isPressureCritical = epIsPressureCritical(state);
  const hasActiveEffects = epHasActiveEffect(state, 'attack') || epHasActiveEffect(state, 'shield') || epHasActiveEffect(state, 'reveal');

  return {
    // State
    state,

    // Computed
    currentZone,
    xpProgress,
    oxygenPercent,
    pressurePercent,
    manaPercent,
    riskLevel,
    riskColor,
    combatPower,
    diveEfficiency,
    discoveryPercent,
    visibilityRange,
    overallProgress,
    abilitySummary,
    achievementProgress,
    leviathanHpPercent,
    leviathanPhaseName,
    diveSummary,
    dailyDiveInfo,
    totalStats,
    accessibleZones,
    inventoryValue,
    canUpgradeSub,
    craftableRecipes,
    unlockedAchievements,
    lockedAchievements,
    knownRecipes,
    depthPercentInZone,
    maxDiveTime,
    streakBonus,
    isOxygenLow,
    isPressureCritical,
    hasActiveEffects,

    // Actions
    startDive,
    endDive,
    descend,
    ascend,
    defeatCreature,
    takeDamage,
    useAbility,
    reduceCooldowns,
    equip,
    unequip,
    addItem,
    removeItem,
    useConsumable,
    exploreRuin,
    upgradeSubmarine,
    startLeviathanEncounter,
    attackLeviathan,
    leviathanAttacks,
    craftItem,
    learnRecipe,
    collectPearls,
    collectCoralFragments,
    collectAncientCoins,
    collectAbyssalCrystals,
    completeDailyDive,
    updateStreak,
    unlockAbility,
    resetState,
    serializeState,
    deserializeAndSetState,
  };
}
