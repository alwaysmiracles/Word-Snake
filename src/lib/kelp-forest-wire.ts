import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================================
// Kelp Forest Wire — 海藻森林 Wire Module for Word Snake
// Underwater kelp forest theme with marine creatures, structures, and exploration
// ============================================================================

// ─── Types & Interfaces ───────────────────────────────────────────────────────

type KfRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
type KfSpecies = 'kelp_fish' | 'sea_dragon' | 'coral_crab' | 'jellyfish' | 'sea_otter' | 'moray_eel' | 'octopus';
type KfAbilityType = 'offensive' | 'defensive' | 'utility' | 'summon';

interface KfSpeciesDef {
  id: KfSpecies;
  name: string;
  nameZh: string;
  description: string;
  emoji: string;
  basePower: number;
  habitat: string;
  behavior: string;
}

interface KfCreatureDef {
  id: string;
  name: string;
  nameZh: string;
  species: KfSpecies;
  rarity: KfRarity;
  description: string;
  emoji: string;
  power: number;
  cost: number;
  xpReward: number;
  habitat: string;
}

interface KfGroveDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  emoji: string;
  level: number;
  resources: string[];
  capacity: number;
  unlockLevel: number;
  depth: number;
  color: string;
}

interface KfMaterialDef {
  id: string;
  name: string;
  nameZh: string;
  rarity: KfRarity;
  description: string;
  emoji: string;
  value: number;
  sourceGrove: string;
}

interface KfStructureDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  emoji: string;
  maxLevel: number;
  baseCost: number;
  upgradeCostMultiplier: number;
  category: string;
}

interface KfAbilityDef {
  id: string;
  name: string;
  nameZh: string;
  type: KfAbilityType;
  description: string;
  emoji: string;
  cooldown: number;
  power: number;
  cost: number;
  unlockLevel: number;
  aoeRadius: number;
}

interface KfAchievementDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  emoji: string;
  conditionKey: string;
  targetValue: number;
  rewardXp: number;
  rewardCoins: number;
}

interface KfTitleDef {
  id: string;
  name: string;
  nameZh: string;
  requiredLevel: number;
  emoji: string;
  bonusDescription: string;
}

interface KfArtifactDef {
  id: string;
  name: string;
  nameZh: string;
  rarity: KfRarity;
  description: string;
  emoji: string;
  power: number;
  cost: number;
  passiveEffect: string;
}

interface KfOceanEventDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  emoji: string;
  duration: number;
  effect: string;
  effectDescription: string;
  rewardCoins: number;
  rewardXp: number;
}

interface KfRecipeDef {
  id: string;
  name: string;
  nameZh: string;
  ingredients: Record<string, number>;
  resultMaterial: string;
  resultQuantity: number;
  xpReward: number;
  requiredLevel: number;
  description: string;
  emoji: string;
}

interface KfDailyQuestDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  type: string;
  target: number;
  rewardCoins: number;
  rewardXp: number;
  emoji: string;
}

interface KfFishInstance {
  defId: string;
  caughtAt: number;
  level: number;
  nickname: string;
  timesFed: number;
}

interface KfGroveInstance {
  defId: string;
  discovered: boolean;
  lastDived: number;
  fishCaught: number;
  materialsCollected: number;
  visits: number;
}

interface KfStructureInstance {
  defId: string;
  level: number;
  builtAt: number;
  lastUpgraded: number;
}

interface KfArtifactInstance {
  defId: string;
  activated: boolean;
  activatedAt: number | null;
  charges: number;
}

interface KfAbilityCooldown {
  defId: string;
  lastUsed: number;
  totalUses: number;
}

interface KfDailyQuestState {
  questId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  assignedAt: number;
}

interface KfKelpForestState {
  kfLevel: number;
  kfXp: number;
  kfMaxXp: number;
  kfCoins: number;
  kfFish: Record<string, KfFishInstance>;
  kfGroves: Record<string, KfGroveInstance>;
  kfStructures: Record<string, KfStructureInstance>;
  kfArtifacts: Record<string, KfArtifactInstance>;
  kfAbilities: Record<string, KfAbilityCooldown>;
  kfInventory: Record<string, number>;
  kfCurrentTitle: string;
  kfClaimedAchievements: string[];
  kfEventLog: Array<{ eventId: string; triggeredAt: number }>;
  kfKnownRecipes: string[];
  kfDailyQuest: KfDailyQuestState | null;
  kfLastDailyReset: number;
  kfDayStreak: number;
  kfSelectedGrove: string;
  kfSettings: {
    sfxEnabled: boolean;
    particleEffects: boolean;
    ambientSounds: boolean;
    themeVariant: 'deep' | 'shallow' | 'biolum';
  };
  kfStats: {
    totalCaught: number;
    totalDived: number;
    totalStructuresBuilt: number;
    totalArtifacts: number;
    totalEvents: number;
    totalCoins: number;
    totalXp: number;
  };
}

// ─── Color Constants ──────────────────────────────────────────────────────────

const KF_COLORS = {
  /** Deepest ocean background */
  deepOcean: '#0D1B2A',
  /** Primary kelp green accent */
  kelpGreen: '#2D6A4F',
  /** Warm coral pink for highlights */
  coralPink: '#FF6B6B',
  /** Bioluminescent glow effect */
  biolumBlue: '#00D4FF',
  /** Sandy seafloor tone */
  sandyBottom: '#C9B99A',
  /** Surface water gradient top */
  surface: '#1B2838',
  /** Darker kelp for depth */
  darkKelp: '#1B4332',
  /** Lighter kelp for highlights */
  lightKelp: '#52B788',
  /** White sea foam */
  foam: '#D8F3DC',
  /** Soft pearl highlight */
  pearl: '#E9EDC9',
  /** Deep underwater glow */
  deepGlow: '#00B4D8',
  /** Warm coral orange */
  coralOrange: '#F4845F',
  /** Seafoam green tint */
  seafoam: '#95D5B2',
  /** Midnight dark overlay */
  midnight: '#0B132B',
  /** Abyssal deep overlay */
  abyss: '#1C2541',
  /** Jellyfish translucent pink */
  jellyPink: '#FFB3C6',
  /** Ancient gold accent */
  ancientGold: '#D4A574',
  /** Venom toxic green */
  venomGreen: '#39FF14',
  /** Abyssal purple glow */
  abyssalPurple: '#7B2D8E',
};

const KF_RARITY_COLORS: Record<KfRarity, string> = {
  Common: '#9CA3AF',
  Uncommon: '#34D399',
  Rare: '#60A5FA',
  Epic: '#C084FC',
  Legendary: '#FBBF24',
};

const KF_RARITY_BG_COLORS: Record<KfRarity, string> = {
  Common: '#1F2937',
  Uncommon: '#064E3B',
  Rare: '#1E3A5F',
  Epic: '#3B0764',
  Legendary: '#78350F',
};

const KF_ABILITY_TYPE_COLORS: Record<KfAbilityType, string> = {
  offensive: '#EF4444',
  defensive: '#3B82F6',
  utility: '#10B981',
  summon: '#F59E0B',
};

// ─── Species (7) ──────────────────────────────────────────────────────────────

const KF_SPECIES: KfSpeciesDef[] = [
  {
    id: 'kelp_fish',
    name: 'Kelp Fish',
    nameZh: '海藻鱼',
    description: 'Small colorful fish that dart through the kelp fronds, schooling in shimmering masses',
    emoji: '🐟',
    basePower: 10,
    habitat: 'Kelp stalks and canopy',
    behavior: 'Schooling, diurnal',
  },
  {
    id: 'sea_dragon',
    name: 'Sea Dragon',
    nameZh: '海龙',
    description: 'Elegant leafy sea dragons drifting among the fronds, masters of camouflage',
    emoji: '🐉',
    basePower: 30,
    habitat: 'Dense kelp thickets',
    behavior: 'Solitary, nocturnal',
  },
  {
    id: 'coral_crab',
    name: 'Coral Crab',
    nameZh: '珊瑚蟹',
    description: 'Hardy crabs that scuttle across coral formations guarding their territory',
    emoji: '🦀',
    basePower: 15,
    habitat: 'Coral rubble and rocky bottom',
    behavior: 'Territorial, crepuscular',
  },
  {
    id: 'jellyfish',
    name: 'Jellyfish',
    nameZh: '水母',
    description: 'Translucent bioluminescent jellyfish pulsing rhythmically in the current',
    emoji: '🪼',
    basePower: 20,
    habitat: 'Open water between kelp stalks',
    behavior: 'Drifting, bioluminescent at night',
  },
  {
    id: 'sea_otter',
    name: 'Sea Otter',
    nameZh: '海獭',
    description: 'Playful otters wrapping themselves in kelp as they sleep, cracking shells on their bellies',
    emoji: '🦦',
    basePower: 25,
    habitat: 'Kelp canopy surface',
    behavior: 'Social, diurnal tool users',
  },
  {
    id: 'moray_eel',
    name: 'Moray Eel',
    nameZh: '海鳝',
    description: 'Sinuous eels lurking in rocky crevices within the forest, jaws constantly agape',
    emoji: '🐍',
    basePower: 35,
    habitat: 'Rock crevices and caves',
    behavior: 'Ambush predator, nocturnal',
  },
  {
    id: 'octopus',
    name: 'Octopus',
    nameZh: '章鱼',
    description: 'Brilliant eight-armed creatures changing color and texture at will, true escape artists',
    emoji: '🐙',
    basePower: 28,
    habitat: 'Den cavities under rocks',
    behavior: 'Solitary, nocturnal, highly intelligent',
  },
];

// ─── Creatures (35: 5 rarity × 7 species) ────────────────────────────────────

const KF_FISH: KfCreatureDef[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Common (7) — Abundant creatures found in shallow, sunlit waters
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'silver_kelpfish',
    name: 'Silver Kelpfish',
    nameZh: '银色海藻鱼',
    species: 'kelp_fish',
    rarity: 'Common',
    description: 'A shimmering silver fish that blends seamlessly with swaying kelp stalks. Found in large schools near the surface.',
    emoji: '🐟',
    power: 8,
    cost: 10,
    xpReward: 10,
    habitat: 'Sunlit Shallows',
  },
  {
    id: 'leafy_sprout_dragon',
    name: 'Leafy Sprout Dragon',
    nameZh: '叶芽海龙',
    species: 'sea_dragon',
    rarity: 'Common',
    description: 'A young sea dragon with only a few leafy appendages beginning to develop. Often mistaken for floating kelp debris.',
    emoji: '🐉',
    power: 12,
    cost: 15,
    xpReward: 12,
    habitat: 'Emerald Canopy',
  },
  {
    id: 'pebble_crab',
    name: 'Pebble Crab',
    nameZh: '卵石蟹',
    species: 'coral_crab',
    rarity: 'Common',
    description: 'A tiny crab perfectly camouflaged among seafloor pebbles. Uses small stones as shields when threatened.',
    emoji: '🦀',
    power: 10,
    cost: 10,
    xpReward: 10,
    habitat: 'Sandy Bottom',
  },
  {
    id: 'moon_jelly',
    name: 'Moon Jelly',
    nameZh: '海月水母',
    species: 'jellyfish',
    rarity: 'Common',
    description: 'A gentle translucent jellyfish with faint white rings pulsing softly as it drifts through warm surface waters.',
    emoji: '🪼',
    power: 9,
    cost: 12,
    xpReward: 11,
    habitat: 'Open Water',
  },
  {
    id: 'river_otter',
    name: 'River Otter',
    nameZh: '河獭',
    species: 'sea_otter',
    rarity: 'Common',
    description: 'A young otter still learning to navigate kelp beds. Playful and curious, often seen tumbling through fronds.',
    emoji: '🦦',
    power: 11,
    cost: 12,
    xpReward: 11,
    habitat: 'Sea Otter Cove',
  },
  {
    id: 'green_moray',
    name: 'Green Moray',
    nameZh: '绿海鳝',
    species: 'moray_eel',
    rarity: 'Common',
    description: 'A small moray eel with bright green coloration. Hides in rock crevices during the day and hunts at dusk.',
    emoji: '🐍',
    power: 13,
    cost: 15,
    xpReward: 13,
    habitat: 'Rock Crevices',
  },
  {
    id: 'pocket_octopus',
    name: 'Pocket Octopus',
    nameZh: '口袋章鱼',
    species: 'octopus',
    rarity: 'Common',
    description: 'A tiny octopus no larger than a fist. Remarkably intelligent for its size, capable of solving simple mazes.',
    emoji: '🐙',
    power: 10,
    cost: 12,
    xpReward: 11,
    habitat: 'Shell Cavities',
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // Uncommon (7) — Notable creatures requiring moderate skill to encounter
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'golden_kelp_perch',
    name: 'Golden Kelp Perch',
    nameZh: '金色海藻鲈',
    species: 'kelp_fish',
    rarity: 'Uncommon',
    description: 'A bright golden fish that schools in sunlit groves. Its scales reflect light like scattered coins.',
    emoji: '🐟',
    power: 22,
    cost: 40,
    xpReward: 25,
    habitat: 'Emerald Canopy',
  },
  {
    id: 'weedy_seadragon',
    name: 'Weedy Seadragon',
    nameZh: '藻叶海龙',
    species: 'sea_dragon',
    rarity: 'Uncommon',
    description: 'Adorned with elaborate leaf-like projections, this master of disguise is nearly indistinguishable from kelp.',
    emoji: '🐉',
    power: 28,
    cost: 55,
    xpReward: 30,
    habitat: 'Dense Kelp Forest',
  },
  {
    id: 'coral_guard_crab',
    name: 'Coral Guard Crab',
    nameZh: '珊瑚守卫蟹',
    species: 'coral_crab',
    rarity: 'Uncommon',
    description: 'Fiercely defends its coral home from all intruders. Has been observed using anemones as weapons.',
    emoji: '🦀',
    power: 24,
    cost: 45,
    xpReward: 26,
    habitat: 'Coral Garden',
  },
  {
    id: 'blue_blubber_jelly',
    name: 'Blue Blubber Jelly',
    nameZh: '蓝色水泡水母',
    species: 'jellyfish',
    rarity: 'Uncommon',
    description: 'A vivid blue jellyfish trailing four glowing oral arms. Swarms of them create bioluminescent corridors.',
    emoji: '🪼',
    power: 20,
    cost: 38,
    xpReward: 22,
    habitat: 'Twilight Grotto',
  },
  {
    id: 'kelp_roller_otter',
    name: 'Kelp Roller Otter',
    nameZh: '海藻翻滚獭',
    species: 'sea_otter',
    rarity: 'Uncommon',
    description: 'An otter famous for rolling playfully in kelp wraps. Has developed a unique technique to open abalone shells.',
    emoji: '🦦',
    power: 26,
    cost: 48,
    xpReward: 27,
    habitat: 'Sea Otter Cove',
  },
  {
    id: 'snowflake_moray',
    name: 'Snowflake Moray',
    nameZh: '雪花海鳝',
    species: 'moray_eel',
    rarity: 'Uncommon',
    description: 'Striking black and white patterned moral with powerful jaws. Its bite can crush sea urchins whole.',
    emoji: '🐍',
    power: 30,
    cost: 58,
    xpReward: 32,
    habitat: 'Moray Lair',
  },
  {
    id: 'mimic_octopus',
    name: 'Mimic Octopus',
    nameZh: '拟态章鱼',
    species: 'octopus',
    rarity: 'Uncommon',
    description: 'Can contort its body to impersonate lionfish, flatfish, and sea snakes. The ocean greatest actor.',
    emoji: '🐙',
    power: 25,
    cost: 42,
    xpReward: 24,
    habitat: 'Sandy Bottom',
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // Rare (7) — Uncommon encounters in deeper or more dangerous zones
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'phantom_kelp_angel',
    name: 'Phantom Kelp Angel',
    nameZh: '幽灵海藻天使鱼',
    species: 'kelp_fish',
    rarity: 'Rare',
    description: 'Near-invisible fish found only in the deepest kelp shadows. Its translucent body bends light around it.',
    emoji: '🐟',
    power: 45,
    cost: 120,
    xpReward: 60,
    habitat: 'Twilight Grotto',
  },
  {
    id: 'ruby_seadragon',
    name: 'Ruby Seadragon',
    nameZh: '红宝石海龙',
    species: 'sea_dragon',
    rarity: 'Rare',
    description: 'A recently discovered species with ruby-red leafy appendages. Only three populations are known to exist.',
    emoji: '🐉',
    power: 55,
    cost: 150,
    xpReward: 75,
    habitat: 'Deep Kelp Zone',
  },
  {
    id: 'king_crab_juvenile',
    name: 'King Crab Juvenile',
    nameZh: '帝王蟹幼体',
    species: 'coral_crab',
    rarity: 'Rare',
    description: 'A young king crab destined to grow enormous. Already showing the distinctive spined carapace of its species.',
    emoji: '🦀',
    power: 48,
    cost: 130,
    xpReward: 65,
    habitat: 'Abyssal Kelp',
  },
  {
    id: 'crown_jellyfish',
    name: 'Crown Jellyfish',
    nameZh: '皇冠水母',
    species: 'jellyfish',
    rarity: 'Rare',
    description: 'A distinctive jellyfish with a crenulated bell resembling a royal crown. Produces kaleidoscopic light.',
    emoji: '🪼',
    power: 42,
    cost: 110,
    xpReward: 55,
    habitat: 'Deep Open Water',
  },
  {
    id: 'giant_otter',
    name: 'Giant Otter',
    nameZh: '巨型水獭',
    species: 'sea_otter',
    rarity: 'Rare',
    description: 'An exceptionally large otter, apex predator of the kelp forest. Hunts in coordinated family groups.',
    emoji: '🦦',
    power: 50,
    cost: 140,
    xpReward: 70,
    habitat: 'Deep Cove',
  },
  {
    id: 'zebra_moray',
    name: 'Zebra Moray',
    nameZh: '斑马海鳝',
    species: 'moray_eel',
    rarity: 'Rare',
    description: 'Bold black-and-white striped moray with powerful jaws. Feeds primarily on crustaceans and small octopuses.',
    emoji: '🐍',
    power: 52,
    cost: 145,
    xpReward: 72,
    habitat: 'Moray Lair',
  },
  {
    id: 'blue_ring_octopus',
    name: 'Blue-Ring Octopus',
    nameZh: '蓝环章鱼',
    species: 'octopus',
    rarity: 'Rare',
    description: 'Beautiful but deadly, flashing iridescent blue rings when agitated. Its venom is among the most potent in the ocean.',
    emoji: '🐙',
    power: 46,
    cost: 125,
    xpReward: 62,
    habitat: 'Coral Rubble',
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // Epic (7) — Powerful creatures from the deepest, most dangerous areas
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'ancient_kelp_lord',
    name: 'Ancient Kelp Lord',
    nameZh: '远古海藻领主',
    species: 'kelp_fish',
    rarity: 'Epic',
    description: 'A colossal fish said to be as old as the forest itself. Kelp grows directly from its scales in living armor.',
    emoji: '🐟',
    power: 85,
    cost: 350,
    xpReward: 150,
    habitat: 'Ancient Sanctum',
  },
  {
    id: 'phantom_leaf_dragon',
    name: 'Phantom Leaf Dragon',
    nameZh: '幻影叶龙',
    species: 'sea_dragon',
    rarity: 'Epic',
    description: 'An almost mythical dragon with bioluminescent leaves that produce an otherworldly blue-green glow in the dark.',
    emoji: '🐉',
    power: 95,
    cost: 420,
    xpReward: 180,
    habitat: 'Abyssal Kelp',
  },
  {
    id: 'volcano_crab',
    name: 'Volcano Crab',
    nameZh: '火山蟹',
    species: 'coral_crab',
    rarity: 'Epic',
    description: 'A crab armored with volcanic rock from deep hydrothermal vents. Its pincers radiate geothermal heat.',
    emoji: '🦀',
    power: 80,
    cost: 320,
    xpReward: 140,
    habitat: 'Volcanic Vents',
  },
  {
    id: 'aurora_jelly',
    name: 'Aurora Jelly',
    nameZh: '极光水母',
    species: 'jellyfish',
    rarity: 'Epic',
    description: 'Produces shimmering aurora-like light displays that can illuminate the entire forest for miles around.',
    emoji: '🪼',
    power: 78,
    cost: 300,
    xpReward: 130,
    habitat: 'Abyssal Open Water',
  },
  {
    id: 'alpha_sea_otter',
    name: 'Alpha Sea Otter',
    nameZh: '阿尔法海獭',
    species: 'sea_otter',
    rarity: 'Epic',
    description: 'The undisputed leader of the otter colony. Commands respect from every creature in the kelp forest.',
    emoji: '🦦',
    power: 88,
    cost: 370,
    xpReward: 160,
    habitat: 'Ancient Sanctum',
  },
  {
    id: 'giant_green_moray',
    name: 'Giant Green Moray',
    nameZh: '巨型绿海鳝',
    species: 'moray_eel',
    rarity: 'Epic',
    description: 'A massive moray over two meters long with emerald scales. Rules the deepest crevices of the forest.',
    emoji: '🐍',
    power: 92,
    cost: 400,
    xpReward: 170,
    habitat: 'Moray Lair Depths',
  },
  {
    id: 'giant_pacific_octopus',
    name: 'Giant Pacific Octopus',
    nameZh: '北太平洋巨型章鱼',
    species: 'octopus',
    rarity: 'Epic',
    description: 'Largest octopus species with a six-meter arm span. A genius of the deep capable of opening jars and solving puzzles.',
    emoji: '🐙',
    power: 82,
    cost: 340,
    xpReward: 145,
    habitat: 'Deep Den Systems',
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // Legendary (7) — Mythical creatures of immense power and rarity
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'spirit_of_the_forest',
    name: 'Spirit of the Forest',
    nameZh: '森林之灵',
    species: 'kelp_fish',
    rarity: 'Legendary',
    description: 'A glowing ethereal fish embodying the kelp forest spirit itself. Said to appear only to those pure of heart.',
    emoji: '🐟',
    power: 180,
    cost: 1000,
    xpReward: 400,
    habitat: 'Ancient Sanctum Core',
  },
  {
    id: 'leafy_emperor_dragon',
    name: 'Leafy Emperor Dragon',
    nameZh: '叶帝海龙',
    species: 'sea_dragon',
    rarity: 'Legendary',
    description: 'The most elaborate sea dragon ever documented, ruler of all kelp kingdoms. Its leaves contain ancient runes.',
    emoji: '🐉',
    power: 200,
    cost: 1200,
    xpReward: 500,
    habitat: 'Primordial Kelp Throne',
  },
  {
    id: 'titan_coral_crab',
    name: 'Titan Coral Crab',
    nameZh: '泰坦珊瑚蟹',
    species: 'coral_crab',
    rarity: 'Legendary',
    description: 'A massive crab whose shell is a living coral reef ecosystem. Entire colonies of fish shelter within its carapace.',
    emoji: '🦀',
    power: 170,
    cost: 950,
    xpReward: 380,
    habitat: 'Living Coral Mountain',
  },
  {
    id: 'eternal_jellyfish',
    name: 'Eternal Jellyfish',
    nameZh: '永生水母',
    species: 'jellyfish',
    rarity: 'Legendary',
    description: 'An immortal jellyfish that can revert to its juvenile form. Has existed since before the dinosaurs walked the earth.',
    emoji: '🪼',
    power: 165,
    cost: 900,
    xpReward: 360,
    habitat: 'Temporal Vortex',
  },
  {
    id: 'kelp_forest_guardian',
    name: 'Kelp Forest Guardian',
    nameZh: '海藻森林守护者',
    species: 'sea_otter',
    rarity: 'Legendary',
    description: 'A mythical otter that has protected the forest for centuries. Wields an ancient kelp staff of immense power.',
    emoji: '🦦',
    power: 190,
    cost: 1100,
    xpReward: 450,
    habitat: 'Guardian Glade',
  },
  {
    id: 'abyssal_moray_king',
    name: 'Abyssal Moray King',
    nameZh: '深渊海鳝之王',
    species: 'moray_eel',
    rarity: 'Legendary',
    description: 'The largest moray ever recorded at five meters, ruler of the deep trenches. Its eyes glow with abyssal fire.',
    emoji: '🐍',
    power: 210,
    cost: 1300,
    xpReward: 550,
    habitat: 'Throne of Eels',
  },
  {
    id: 'kraken_spawn',
    name: 'Kraken Spawn',
    nameZh: '海妖之子',
    species: 'octopus',
    rarity: 'Legendary',
    description: 'A colossal octopus whispered to be a young kraken. Sailors speak of it dragging entire ships beneath the waves.',
    emoji: '🐙',
    power: 195,
    cost: 1150,
    xpReward: 470,
    habitat: 'Kraken Trench',
  },
];

// ─── Kelp Groves / Zones (8) ──────────────────────────────────────────────────

const KF_GROVES: KfGroveDef[] = [
  {
    id: 'sunlit_shallows',
    name: 'Sunlit Shallows',
    nameZh: '阳光浅滩',
    description: 'Warm shallow waters where golden sunlight pierces through gently swaying kelp. The perfect starting ground for new divers.',
    emoji: '☀️',
    level: 1,
    resources: ['kelp_frond', 'sea_glass', 'driftwood', 'seashell', 'plankton_sample', 'seafoam_moss'],
    capacity: 5,
    unlockLevel: 1,
    depth: 5,
    color: '#22D3EE',
  },
  {
    id: 'emerald_canopy',
    name: 'Emerald Canopy',
    nameZh: '翡翠天蓬',
    description: 'Dense kelp towers reaching toward the surface forming a green cathedral of light and shadow.',
    emoji: '🌿',
    level: 3,
    resources: ['kelp_frond', 'coral_fragment', 'biolum_algae', 'pearl_oyster', 'starfish', 'sea_urchin_spine'],
    capacity: 8,
    unlockLevel: 3,
    depth: 15,
    color: '#34D399',
  },
  {
    id: 'coral_garden',
    name: 'Coral Garden',
    nameZh: '珊瑚花园',
    description: 'A vibrant underwater garden of colorful coral formations buzzing with marine life of every description.',
    emoji: '🪸',
    level: 5,
    resources: ['coral_fragment', 'coral_bud', 'sea_glass', 'anemone_extract', 'brain_coral_piece', 'tube_sponge'],
    capacity: 10,
    unlockLevel: 5,
    depth: 25,
    color: '#F472B6',
  },
  {
    id: 'sea_otter_cove',
    name: 'Sea Otter Cove',
    nameZh: '海獭海湾',
    description: 'A sheltered cove where otters play and crack shells on their bellies. The sound of clicking shells fills the water.',
    emoji: '🦦',
    level: 6,
    resources: ['abalone_shell', 'clam_shell', 'sea_urchin_meat', 'kelp_wrap', 'smooth_pebble', 'driftwood'],
    capacity: 8,
    unlockLevel: 6,
    depth: 20,
    color: '#FB923C',
  },
  {
    id: 'twilight_grotto',
    name: 'Twilight Grotto',
    nameZh: '暮光洞穴',
    description: 'A dim rocky cave where bioluminescent creatures gather. The last traces of sunlight fade into perpetual twilight.',
    emoji: '🫧',
    level: 8,
    resources: ['biolum_algae', 'glow_pearl', 'shadow_kelp', 'cave_crystal', 'deep_shell', 'moonstone_shard'],
    capacity: 12,
    unlockLevel: 8,
    depth: 50,
    color: '#A78BFA',
  },
  {
    id: 'moray_lair',
    name: 'Moray Lair',
    nameZh: '海鳝巢穴',
    description: 'A labyrinth of rocky crevices teeming with moray eels. Only the bravest divers dare enter its winding tunnels.',
    emoji: '🐍',
    level: 10,
    resources: ['eel_skin', 'rock_fragment', 'cave_sponge', 'deep_crystal_shard', 'venom_sac', 'tunnel_moss'],
    capacity: 10,
    unlockLevel: 10,
    depth: 80,
    color: '#F87171',
  },
  {
    id: 'abyssal_kelp',
    name: 'Abyssal Kelp',
    nameZh: '深渊海藻',
    description: 'Impossibly deep kelp thriving in near-total darkness, sustained by chemosynthetic bacteria on its roots.',
    emoji: '🌑',
    level: 14,
    resources: ['abyssal_kelp_strand', 'dark_pearl', 'pressure_crystal', 'void_moss', 'deep_sea_fungus', 'ancient_driftwood'],
    capacity: 15,
    unlockLevel: 14,
    depth: 200,
    color: '#6366F1',
  },
  {
    id: 'ancient_sanctum',
    name: 'Ancient Sanctum',
    nameZh: '远古圣殿',
    description: 'A mythical grove at the heart of the forest, pulsing with ancient power. The kelp here whispers secrets of the deep.',
    emoji: '🏛️',
    level: 20,
    resources: ['sanctum_pearl', 'living_coral_core', 'primordial_kelp', 'trident_fossil', 'ocean_heart_crystal', 'tide_weave'],
    capacity: 20,
    unlockLevel: 20,
    depth: 500,
    color: '#FBBF24',
  },
];

// ─── Materials (30: 6 per rarity × 5 tiers) ──────────────────────────────────

const KF_MATERIALS: KfMaterialDef[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Common (6) — Basic resources found in shallow waters
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'kelp_frond', name: 'Kelp Frond', nameZh: '海藻叶', rarity: 'Common', description: 'A fresh strip of green kelp frond, still moist and supple', emoji: '🌿', value: 3, sourceGrove: 'sunlit_shallows' },
  { id: 'sea_glass', name: 'Sea Glass', nameZh: '海玻璃', rarity: 'Common', description: 'Smooth tumbled glass polished by centuries of ocean waves', emoji: '💎', value: 4, sourceGrove: 'sunlit_shallows' },
  { id: 'driftwood', name: 'Driftwood', nameZh: '浮木', rarity: 'Common', description: 'Weathered wood carried by the tides, bleached pale by salt and sun', emoji: '🪵', value: 2, sourceGrove: 'sunlit_shallows' },
  { id: 'seashell', name: 'Seashell', nameZh: '海螺壳', rarity: 'Common', description: 'A spiral seashell in muted pastel tones, echoing with distant ocean sounds', emoji: '🐚', value: 3, sourceGrove: 'sunlit_shallows' },
  { id: 'plankton_sample', name: 'Plankton Sample', nameZh: '浮游生物样本', rarity: 'Common', description: 'A vial of concentrated plankton glowing faintly with biological energy', emoji: '🧫', value: 2, sourceGrove: 'sunlit_shallows' },
  { id: 'seafoam_moss', name: 'Seafoam Moss', nameZh: '海沫苔藓', rarity: 'Common', description: 'Soft green moss growing on kelp stalks, used in basic crafting recipes', emoji: '🌱', value: 3, sourceGrove: 'sunlit_shallows' },
  // ═══════════════════════════════════════════════════════════════════════════
  // Uncommon (6) — Notable materials from mid-depth zones
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'coral_fragment', name: 'Coral Fragment', nameZh: '珊瑚碎片', rarity: 'Uncommon', description: 'A broken piece of colorful living coral still faintly pulsing with life', emoji: '🪸', value: 12, sourceGrove: 'coral_garden' },
  { id: 'biolum_algae', name: 'Bioluminescent Algae', nameZh: '生物发光藻', rarity: 'Uncommon', description: 'Blue-green algae that glows brilliantly in total darkness', emoji: '✨', value: 15, sourceGrove: 'twilight_grotto' },
  { id: 'starfish', name: 'Starfish', nameZh: '海星', rarity: 'Uncommon', description: 'A five-armed sea star in vivid orange with remarkable regenerative properties', emoji: '⭐', value: 10, sourceGrove: 'emerald_canopy' },
  { id: 'pearl_oyster', name: 'Pearl Oyster', nameZh: '珍珠牡蛎', rarity: 'Uncommon', description: 'A living oyster with significant pearl-forming potential', emoji: '🦪', value: 14, sourceGrove: 'emerald_canopy' },
  { id: 'sea_urchin_spine', name: 'Sea Urchin Spine', nameZh: '海胆刺', rarity: 'Uncommon', description: 'Long slender spines from a purple sea urchin, sharp and resilient', emoji: '🔮', value: 11, sourceGrove: 'coral_garden' },
  { id: 'anemone_extract', name: 'Anemone Extract', nameZh: '海葵精华', rarity: 'Uncommon', description: 'A soothing gel harvested from sea anemones with medicinal properties', emoji: '🌸', value: 13, sourceGrove: 'coral_garden' },
  // ═══════════════════════════════════════════════════════════════════════════
  // Rare (6) — Valuable materials from deep or dangerous locations
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'glow_pearl', name: 'Glow Pearl', nameZh: '荧光珍珠', rarity: 'Rare', description: 'A luminous pearl that emits a soft blue glow, lighting up any dark space', emoji: '💠', value: 45, sourceGrove: 'twilight_grotto' },
  { id: 'abalone_shell', name: 'Abalone Shell', nameZh: '鲍鱼壳', rarity: 'Rare', description: 'An iridescent shell swirling with rainbow colors, highly prized by collectors', emoji: '🌈', value: 50, sourceGrove: 'sea_otter_cove' },
  { id: 'cave_crystal', name: 'Cave Crystal', nameZh: '洞穴水晶', rarity: 'Rare', description: 'A crystal formed in underwater cave walls over thousands of years', emoji: '💎', value: 42, sourceGrove: 'twilight_grotto' },
  { id: 'deep_shell', name: 'Deep Shell', nameZh: '深水贝壳', rarity: 'Rare', description: 'A shell from depths where no sunlight has ever reached', emoji: '🐚', value: 38, sourceGrove: 'moray_lair' },
  { id: 'moonstone_shard', name: 'Moonstone Shard', nameZh: '月光石碎片', rarity: 'Rare', description: 'A pearlescent stone that reflects underwater moonlight in prismatic patterns', emoji: '🌙', value: 48, sourceGrove: 'twilight_grotto' },
  { id: 'tube_sponge', name: 'Tube Sponge', nameZh: '管状海绵', rarity: 'Rare', description: 'A large filtering sponge in brilliant purple, essential for water purification', emoji: '🟣', value: 40, sourceGrove: 'coral_garden' },
  // ═══════════════════════════════════════════════════════════════════════════
  // Epic (6) — Extremely rare materials from the abyssal depths
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'dark_pearl', name: 'Dark Pearl', nameZh: '暗珠', rarity: 'Epic', description: 'An abyssal pearl that absorbs all surrounding light, creating pockets of darkness', emoji: '⚫', value: 120, sourceGrove: 'abyssal_kelp' },
  { id: 'pressure_crystal', name: 'Pressure Crystal', nameZh: '压力水晶', rarity: 'Epic', description: 'A crystal formed under immense ocean pressure, humming with contained energy', emoji: '💠', value: 140, sourceGrove: 'abyssal_kelp' },
  { id: 'eel_skin', name: 'Eel Skin', nameZh: '海鳝皮', rarity: 'Epic', description: 'Rough durable skin shed by a giant moray, nearly indestructible', emoji: '🪩', value: 110, sourceGrove: 'moray_lair' },
  { id: 'void_moss', name: 'Void Moss', nameZh: '虚空苔藓', rarity: 'Epic', description: 'A mysterious moss thriving in total darkness, feeding on ambient magical energy', emoji: '🌿', value: 130, sourceGrove: 'abyssal_kelp' },
  { id: 'venom_sac', name: 'Venom Sac', nameZh: '毒液囊', rarity: 'Epic', description: 'A potent venom gland from a deep-sea creature, valuable for alchemical purposes', emoji: '☠️', value: 150, sourceGrove: 'moray_lair' },
  { id: 'deep_crystal_shard', name: 'Deep Crystal Shard', nameZh: '深渊水晶碎片', rarity: 'Epic', description: 'A shimmering fragment from a deep crystal formation radiating cold energy', emoji: '🔮', value: 125, sourceGrove: 'abyssal_kelp' },
  // ═══════════════════════════════════════════════════════════════════════════
  // Legendary (6) — Mythical materials from the Ancient Sanctum
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'sanctum_pearl', name: 'Sanctum Pearl', nameZh: '圣殿珍珠', rarity: 'Legendary', description: 'A legendary pearl from the heart of the ancient sanctum, said to grant wisdom', emoji: '📿', value: 400, sourceGrove: 'ancient_sanctum' },
  { id: 'living_coral_core', name: 'Living Coral Core', nameZh: '活珊瑚核心', rarity: 'Legendary', description: 'The still-beating heart of an ancient coral formation, pulsing with primordial life force', emoji: '❤️', value: 450, sourceGrove: 'ancient_sanctum' },
  { id: 'primordial_kelp', name: 'Primordial Kelp', nameZh: '太古海藻', rarity: 'Legendary', description: 'Kelp from the very first forest that ever grew in the ocean billions of years ago', emoji: '🌳', value: 420, sourceGrove: 'ancient_sanctum' },
  { id: 'trident_fossil', name: 'Trident Fossil', nameZh: '三叉戟化石', rarity: 'Legendary', description: 'A fossilized trident fragment encrusted with ancient barnacles and ocean minerals', emoji: '🔱', value: 500, sourceGrove: 'ancient_sanctum' },
  { id: 'ocean_heart_crystal', name: 'Ocean Heart Crystal', nameZh: '海洋之心水晶', rarity: 'Legendary', description: 'Said to contain the very pulse of the ocean itself, radiating immense power', emoji: '💙', value: 550, sourceGrove: 'ancient_sanctum' },
  { id: 'tide_weave', name: 'Tide Weave', nameZh: '潮汐织锦', rarity: 'Legendary', description: 'A fabric woven from crystallized ocean currents that flows like living water', emoji: '🌊', value: 480, sourceGrove: 'ancient_sanctum' },
];

// ─── Structures (25) ──────────────────────────────────────────────────────────

const KF_STRUCTURES: KfStructureDef[] = [
  // ── Resource Production ──
  { id: 'kelp_nursery', name: 'Kelp Nursery', nameZh: '海藻苗圃', description: 'A protected area where young kelp can grow safely, increasing kelp frond yield', emoji: '🌱', maxLevel: 10, baseCost: 50, upgradeCostMultiplier: 1.4, category: 'resource' },
  { id: 'pearl_oyster_bed', name: 'Pearl Oyster Bed', nameZh: '珍珠牡蛎床', description: 'Cultivates oysters that produce valuable pearls over time', emoji: '🦪', maxLevel: 10, baseCost: 120, upgradeCostMultiplier: 1.6, category: 'resource' },
  { id: 'kelp_harvester', name: 'Kelp Harvester', nameZh: '海藻收割机', description: 'Automatically harvests mature kelp fronds from surrounding areas', emoji: '⚙️', maxLevel: 10, baseCost: 100, upgradeCostMultiplier: 1.5, category: 'resource' },
  { id: 'creature_feeding_station', name: 'Creature Feeding Station', nameZh: '生物喂食站', description: 'Dispenses food to attract and nourish marine creatures', emoji: '🍽️', maxLevel: 10, baseCost: 130, upgradeCostMultiplier: 1.5, category: 'resource' },
  // ── Exploration ──
  { id: 'observation_platform', name: 'Observation Platform', nameZh: '观察平台', description: 'An underwater platform providing views of passing marine life', emoji: '🔭', maxLevel: 10, baseCost: 80, upgradeCostMultiplier: 1.5, category: 'exploration' },
  { id: 'sonar_beacon_tower', name: 'Sonar Beacon Tower', nameZh: '声纳信标塔', description: 'Pulses sonar waves to map and reveal surrounding kelp areas', emoji: '📡', maxLevel: 10, baseCost: 160, upgradeCostMultiplier: 1.5, category: 'exploration' },
  { id: 'biolum_lantern_post', name: 'Biolum Lantern Post', nameZh: '生物灯笼柱', description: 'Lights up dark areas using cultivated bioluminescent organisms', emoji: '🏮', maxLevel: 10, baseCost: 90, upgradeCostMultiplier: 1.4, category: 'exploration' },
  { id: 'abyssal_diving_bell', name: 'Abyssal Diving Bell', nameZh: '深渊潜水钟', description: 'Enables safe exploration of the deepest and most dangerous groves', emoji: '🔔', maxLevel: 10, baseCost: 280, upgradeCostMultiplier: 1.7, category: 'exploration' },
  // ── Defense ──
  { id: 'coral_defense_wall', name: 'Coral Defense Wall', nameZh: '珊瑚防御墙', description: 'A living wall of hardened coral providing protection from threats', emoji: '🧱', maxLevel: 10, baseCost: 170, upgradeCostMultiplier: 1.6, category: 'defense' },
  { id: 'deep_pressure_dome', name: 'Deep Pressure Dome', nameZh: '深水压力穹顶', description: 'An air-filled dome that protects against deep ocean pressure', emoji: '🏟️', maxLevel: 10, baseCost: 250, upgradeCostMultiplier: 1.8, category: 'defense' },
  // ── Processing ──
  { id: 'coral_propagation_tank', name: 'Coral Propagation Tank', nameZh: '珊瑚繁殖缸', description: 'Grows coral fragments for reef restoration and material production', emoji: '🪸', maxLevel: 10, baseCost: 150, upgradeCostMultiplier: 1.6, category: 'processing' },
  { id: 'medicinal_kelp_lab', name: 'Medicinal Kelp Lab', nameZh: '药用海藻实验室', description: 'Extracts healing compounds from rare kelp species for potions', emoji: '🧪', maxLevel: 10, baseCost: 220, upgradeCostMultiplier: 1.7, category: 'processing' },
  { id: 'kelp_weaving_workshop', name: 'Kelp Weaving Workshop', nameZh: '海藻编织工坊', description: 'Weaves kelp fibers into useful tools, nets, and materials', emoji: '🧶', maxLevel: 10, baseCost: 140, upgradeCostMultiplier: 1.5, category: 'processing' },
  { id: 'water_purification_filter', name: 'Water Purification Filter', nameZh: '水质净化过滤器', description: 'Filters impurities and toxins to keep the forest ecosystem healthy', emoji: '💧', maxLevel: 10, baseCost: 110, upgradeCostMultiplier: 1.4, category: 'processing' },
  // ── Power ──
  { id: 'tidal_generator', name: 'Tidal Generator', nameZh: '潮汐发电机', description: 'Harnesses tidal energy to power all forest operations and structures', emoji: '⚡', maxLevel: 10, baseCost: 180, upgradeCostMultiplier: 1.6, category: 'power' },
  { id: 'oxygen_bubble_column', name: 'Oxygen Bubble Column', nameZh: '氧气气泡柱', description: 'Releases a steady stream of oxygen bubbles to refresh surrounding water', emoji: '🫧', maxLevel: 10, baseCost: 70, upgradeCostMultiplier: 1.3, category: 'power' },
  { id: 'photon_trapping_dome', name: 'Photon Trapping Dome', nameZh: '光子捕获穹顶', description: 'Captures and concentrates surface sunlight for deep-sea kelp growth', emoji: '☀️', maxLevel: 10, baseCost: 380, upgradeCostMultiplier: 1.9, category: 'power' },
  // ── Creature ──
  { id: 'sea_otter_habitat', name: 'Sea Otter Habitat', nameZh: '海獭栖息地', description: 'A comfortable shelter that naturally attracts and houses sea otters', emoji: '🦦', maxLevel: 10, baseCost: 200, upgradeCostMultiplier: 1.7, category: 'creature' },
  { id: 'whale_calling_stone', name: 'Whale Calling Stone', nameZh: '唤鲸石', description: 'A resonant stone that can summon whales for their ancient blessings', emoji: '🐋', maxLevel: 10, baseCost: 350, upgradeCostMultiplier: 1.9, category: 'creature' },
  // ── Knowledge ──
  { id: 'treasure_vault', name: 'Treasure Vault', nameZh: '宝物金库', description: 'Securely stores rare finds, valuable artifacts, and precious materials', emoji: '🏦', maxLevel: 10, baseCost: 300, upgradeCostMultiplier: 1.8, category: 'knowledge' },
  { id: 'ancient_kelp_library', name: 'Ancient Kelp Library', nameZh: '远古海藻图书馆', description: 'An archive of ocean knowledge preserved in waterproof kelp scrolls', emoji: '📚', maxLevel: 10, baseCost: 400, upgradeCostMultiplier: 2.0, category: 'knowledge' },
  { id: 'marine_research_center', name: 'Marine Research Center', nameZh: '海洋研究中心', description: 'Advanced facility studying kelp forest ecosystems and creature behavior', emoji: '🔬', maxLevel: 10, baseCost: 320, upgradeCostMultiplier: 1.8, category: 'knowledge' },
  // ── Legendary ──
  { id: 'kraken_bone_scaffolding', name: 'Kraken Bone Scaffolding', nameZh: '海妖骨脚手架', description: 'Structural support made from ancient kraken bones of immense strength', emoji: '🦴', maxLevel: 10, baseCost: 260, upgradeCostMultiplier: 1.7, category: 'legendary' },
  { id: 'tide_control_gate', name: 'Tide Control Gate', nameZh: '潮汐控制门', description: 'Regulates water flow to manage kelp growth patterns and currents', emoji: '🚪', maxLevel: 10, baseCost: 200, upgradeCostMultiplier: 1.6, category: 'legendary' },
  { id: 'ocean_heart_altar', name: 'Ocean Heart Altar', nameZh: '海洋之心祭坛', description: 'A mystical altar that channels primordial ocean energy for ultimate power', emoji: '💙', maxLevel: 10, baseCost: 500, upgradeCostMultiplier: 2.0, category: 'legendary' },
];

// ─── Abilities (22: offensive 6, defensive 5, utility 6, summon 5) ───────────

const KF_ABILITIES: KfAbilityDef[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Offensive (6) — Direct damage abilities for confronting threats
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'tidal_slam',
    name: 'Tidal Slam',
    nameZh: '潮汐猛击',
    type: 'offensive',
    description: 'Summons a crushing wave that smashes into nearby threats with devastating force',
    emoji: '🌊',
    cooldown: 8000,
    power: 40,
    cost: 15,
    unlockLevel: 1,
    aoeRadius: 3,
  },
  {
    id: 'biolum_burst',
    name: 'Biolum Burst',
    nameZh: '荧光爆裂',
    type: 'offensive',
    description: 'Releases a blinding flash of concentrated bioluminescent light that stuns and damages',
    emoji: '💥',
    cooldown: 12000,
    power: 60,
    cost: 25,
    unlockLevel: 3,
    aoeRadius: 5,
  },
  {
    id: 'eel_strike',
    name: 'Eel Strike',
    nameZh: '海鳝突袭',
    type: 'offensive',
    description: 'Commands a coordinated strike from trained moray eels lurking in the kelp',
    emoji: '⚡',
    cooldown: 10000,
    power: 55,
    cost: 20,
    unlockLevel: 5,
    aoeRadius: 2,
  },
  {
    id: 'jellyfish_sting_barrage',
    name: 'Jellyfish Sting Barrage',
    nameZh: '水母毒刺弹幕',
    type: 'offensive',
    description: 'Unleashes a swarm of stinging jellyfish that blanket the area with venomous tentacles',
    emoji: '🪼',
    cooldown: 15000,
    power: 80,
    cost: 35,
    unlockLevel: 8,
    aoeRadius: 7,
  },
  {
    id: 'krakens_wrath',
    name: "Kraken's Wrath",
    nameZh: '海妖之怒',
    type: 'offensive',
    description: 'Channels the primordial rage of an ancient kraken for catastrophic damage',
    emoji: '🦑',
    cooldown: 30000,
    power: 150,
    cost: 60,
    unlockLevel: 12,
    aoeRadius: 10,
  },
  {
    id: 'coral_shatter',
    name: 'Coral Shatter',
    nameZh: '珊瑚碎裂',
    type: 'offensive',
    description: 'Shatters hardened coral formations into razor-sharp shrapnel in all directions',
    emoji: '💣',
    cooldown: 18000,
    power: 95,
    cost: 40,
    unlockLevel: 15,
    aoeRadius: 6,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // Defensive (5) — Protective abilities for surviving dangerous encounters
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'kelp_shield',
    name: 'Kelp Shield',
    nameZh: '海藻护盾',
    type: 'defensive',
    description: 'Wraps the player in a thick barrier of densely woven kelp fronds',
    emoji: '🛡️',
    cooldown: 10000,
    power: 30,
    cost: 15,
    unlockLevel: 2,
    aoeRadius: 1,
  },
  {
    id: 'coral_armor',
    name: 'Coral Armor',
    nameZh: '珊瑚铠甲',
    type: 'defensive',
    description: 'Encases the player in hardened living coral plating that absorbs damage',
    emoji: '🧱',
    cooldown: 20000,
    power: 70,
    cost: 30,
    unlockLevel: 6,
    aoeRadius: 1,
  },
  {
    id: 'tidal_barrier',
    name: 'Tidal Barrier',
    nameZh: '潮汐屏障',
    type: 'defensive',
    description: 'Raises a massive wall of swirling water that deflects incoming attacks',
    emoji: '🌊',
    cooldown: 25000,
    power: 90,
    cost: 40,
    unlockLevel: 10,
    aoeRadius: 4,
  },
  {
    id: 'pearl_reflection',
    name: 'Pearl Reflection',
    nameZh: '珍珠反射',
    type: 'defensive',
    description: 'Surrounds the player with a pearl aura that reflects damage back at attackers',
    emoji: '💠',
    cooldown: 30000,
    power: 120,
    cost: 55,
    unlockLevel: 14,
    aoeRadius: 2,
  },
  {
    id: 'ocean_sanctuary',
    name: 'Ocean Sanctuary',
    nameZh: '海洋圣所',
    type: 'defensive',
    description: 'Creates an inviolable protected zone where no damage can occur for a duration',
    emoji: '🏛️',
    cooldown: 60000,
    power: 200,
    cost: 80,
    unlockLevel: 18,
    aoeRadius: 8,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // Utility (6) — Support abilities for exploration and resource gathering
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'sonar_ping',
    name: 'Sonar Ping',
    nameZh: '声纳探测',
    type: 'utility',
    description: 'Emits a focused sonar pulse revealing hidden creatures, resources, and structures',
    emoji: '📡',
    cooldown: 5000,
    power: 10,
    cost: 5,
    unlockLevel: 1,
    aoeRadius: 15,
  },
  {
    id: 'current_rider',
    name: 'Current Rider',
    nameZh: '洋流骑乘',
    type: 'utility',
    description: 'Rides a swift ocean current for rapid travel between distant kelp groves',
    emoji: '🌬️',
    cooldown: 8000,
    power: 15,
    cost: 8,
    unlockLevel: 2,
    aoeRadius: 0,
  },
  {
    id: 'biolum_trail',
    name: 'Biolum Trail',
    nameZh: '荧光轨迹',
    type: 'utility',
    description: 'Leaves a persistent glowing trail marking the path through dark waters',
    emoji: '✨',
    cooldown: 10000,
    power: 20,
    cost: 10,
    unlockLevel: 4,
    aoeRadius: 0,
  },
  {
    id: 'oxygen_synthesis',
    name: 'Oxygen Synthesis',
    nameZh: '氧气合成',
    type: 'utility',
    description: 'Synthesizes oxygen from surrounding water molecules for extended deep dives',
    emoji: '🫧',
    cooldown: 15000,
    power: 25,
    cost: 12,
    unlockLevel: 7,
    aoeRadius: 1,
  },
  {
    id: 'kelp_grapple',
    name: 'Kelp Grapple',
    nameZh: '海藻钩索',
    type: 'utility',
    description: 'Launches a tough kelp rope to climb vertical surfaces or pull objects closer',
    emoji: '🪢',
    cooldown: 7000,
    power: 18,
    cost: 8,
    unlockLevel: 3,
    aoeRadius: 0,
  },
  {
    id: 'depth_sense',
    name: 'Depth Sense',
    nameZh: '深度感知',
    type: 'utility',
    description: 'Perceives minute pressure changes to detect distant threats and hidden passages',
    emoji: '👁️',
    cooldown: 12000,
    power: 30,
    cost: 15,
    unlockLevel: 9,
    aoeRadius: 20,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // Summon (5) — Abilities that call marine creatures to aid the player
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'call_the_school',
    name: 'Call the School',
    nameZh: '召唤鱼群',
    type: 'summon',
    description: 'Summons a shimmering school of kelp fish to assist in gathering and distraction',
    emoji: '🐟',
    cooldown: 20000,
    power: 25,
    cost: 20,
    unlockLevel: 3,
    aoeRadius: 5,
  },
  {
    id: 'jellyfish_lantern',
    name: 'Jellyfish Lantern',
    nameZh: '水母灯笼',
    type: 'summon',
    description: 'Releases a swarm of bioluminescent jellyfish to illuminate dark areas',
    emoji: '🪼',
    cooldown: 15000,
    power: 20,
    cost: 15,
    unlockLevel: 5,
    aoeRadius: 8,
  },
  {
    id: 'otter_alliance',
    name: 'Otter Alliance',
    nameZh: '水獭同盟',
    type: 'summon',
    description: 'Calls friendly sea otters to help gather resources and crack open shellfish',
    emoji: '🦦',
    cooldown: 25000,
    power: 35,
    cost: 28,
    unlockLevel: 7,
    aoeRadius: 4,
  },
  {
    id: 'dragon_dance',
    name: 'Dragon Dance',
    nameZh: '龙之舞',
    type: 'summon',
    description: 'Summons majestic sea dragons whose presence boosts all nearby ability power',
    emoji: '🐉',
    cooldown: 35000,
    power: 60,
    cost: 45,
    unlockLevel: 11,
    aoeRadius: 10,
  },
  {
    id: 'ancient_awakening',
    name: 'Ancient Awakening',
    nameZh: '远古觉醒',
    type: 'summon',
    description: 'Awakens the legendary forest guardian spirit for overwhelming cosmic power',
    emoji: '🐋',
    cooldown: 60000,
    power: 180,
    cost: 90,
    unlockLevel: 20,
    aoeRadius: 15,
  },
];

// ─── Achievements (18) ────────────────────────────────────────────────────────

const KF_ACHIEVEMENTS: KfAchievementDef[] = [
  { id: 'ach_first_catch', name: 'First Catch', nameZh: '初次捕获', description: 'Catch your very first marine creature', emoji: '🐟', conditionKey: 'totalCaught', targetValue: 1, rewardXp: 20, rewardCoins: 10 },
  { id: 'ach_tide_pools', name: 'Tide Pool Explorer', nameZh: '潮汐池探索者', description: 'Catch 10 different marine creatures', emoji: '🔍', conditionKey: 'totalCaught', targetValue: 10, rewardXp: 60, rewardCoins: 50 },
  { id: 'ach_deep_dive', name: 'First Deep Dive', nameZh: '初次深潜', description: 'Complete your first kelp grove dive', emoji: '🤿', conditionKey: 'totalDived', targetValue: 1, rewardXp: 25, rewardCoins: 15 },
  { id: 'ach_grove_master', name: 'Grove Master', nameZh: '海藻大师', description: 'Dive into all 8 kelp groves', emoji: '🗺️', conditionKey: 'totalDived', targetValue: 8, rewardXp: 150, rewardCoins: 100 },
  { id: 'ach_builder', name: 'Forest Builder', nameZh: '森林建造者', description: 'Build your first kelp forest structure', emoji: '🔨', conditionKey: 'totalStructuresBuilt', targetValue: 1, rewardXp: 30, rewardCoins: 20 },
  { id: 'ach_architect', name: 'Master Architect', nameZh: '建筑大师', description: 'Build 10 structures in the kelp forest', emoji: '🏗️', conditionKey: 'totalStructuresBuilt', targetValue: 10, rewardXp: 200, rewardCoins: 150 },
  { id: 'ach_artifact_hunter', name: 'Artifact Hunter', nameZh: '文物猎人', description: 'Activate your first ancient artifact', emoji: '🏺', conditionKey: 'totalArtifacts', targetValue: 1, rewardXp: 40, rewardCoins: 30 },
  { id: 'ach_relic_collector', name: 'Relic Collector', nameZh: '圣物收藏家', description: 'Activate all 6 artifacts', emoji: '🏛️', conditionKey: 'totalArtifacts', targetValue: 6, rewardXp: 300, rewardCoins: 200 },
  { id: 'ach_catch_25', name: 'Seasoned Angler', nameZh: '资深渔夫', description: 'Catch a total of 25 creatures', emoji: '🎣', conditionKey: 'totalCaught', targetValue: 25, rewardXp: 100, rewardCoins: 80 },
  { id: 'ach_catch_50', name: 'Expert Angler', nameZh: '专家渔夫', description: 'Catch a total of 50 creatures', emoji: '🏅', conditionKey: 'totalCaught', targetValue: 50, rewardXp: 250, rewardCoins: 200 },
  { id: 'ach_event_witness', name: 'Event Witness', nameZh: '事件目击者', description: 'Witness your first ocean event', emoji: '🌊', conditionKey: 'totalEvents', targetValue: 1, rewardXp: 20, rewardCoins: 15 },
  { id: 'ach_event_chaser', name: 'Event Chaser', nameZh: '事件追踪者', description: 'Witness all 8 ocean events', emoji: '🌟', conditionKey: 'totalEvents', targetValue: 8, rewardXp: 180, rewardCoins: 120 },
  { id: 'ach_dive_20', name: 'Dedicated Diver', nameZh: '专注潜水员', description: 'Complete 20 kelp grove dives', emoji: '🏊', conditionKey: 'totalDived', targetValue: 20, rewardXp: 200, rewardCoins: 150 },
  { id: 'ach_structures_max', name: 'Full Kingdom', nameZh: '完整王国', description: 'Build all 25 structure types', emoji: '👑', conditionKey: 'totalStructuresBuilt', targetValue: 25, rewardXp: 500, rewardCoins: 400 },
  { id: 'ach_wealthy', name: 'Pearl Tycoon', nameZh: '珍珠大亨', description: 'Accumulate 5000 total coins earned', emoji: '💰', conditionKey: 'totalCoins', targetValue: 5000, rewardXp: 250, rewardCoins: 300 },
  { id: 'ach_wise', name: 'Forest Sage', nameZh: '森林贤者', description: 'Accumulate 10000 total XP earned', emoji: '📖', conditionKey: 'totalXp', targetValue: 10000, rewardXp: 400, rewardCoins: 500 },
  { id: 'ach_all_common', name: 'Common Compendium', nameZh: '普通图鉴', description: 'Catch all 7 Common rarity creatures', emoji: '📘', conditionKey: 'totalCaught', targetValue: 7, rewardXp: 80, rewardCoins: 60 },
  { id: 'ach_legendary_catch', name: 'Legend of the Deep', nameZh: '深海传说', description: 'Catch your first Legendary creature', emoji: '🌟', conditionKey: 'totalCaught', targetValue: 35, rewardXp: 500, rewardCoins: 500 },
];

// ─── Titles (8) ───────────────────────────────────────────────────────────────

const KF_TITLES: KfTitleDef[] = [
  { id: 'title_kelp_sprout', name: 'Kelp Sprout', nameZh: '海藻幼苗', requiredLevel: 1, emoji: '🌱', bonusDescription: '+5% XP from catches' },
  { id: 'title_tide_walker', name: 'Tide Walker', nameZh: '潮汐行者', requiredLevel: 3, emoji: '🌊', bonusDescription: '+10% coin rewards' },
  { id: 'title_coral_friend', name: 'Coral Friend', nameZh: '珊瑚之友', requiredLevel: 5, emoji: '🪸', bonusDescription: '-10% structure costs' },
  { id: 'title_kelp_ranger', name: 'Kelp Ranger', nameZh: '海藻游侠', requiredLevel: 8, emoji: '🌿', bonusDescription: '+15% dive rewards' },
  { id: 'title_deep_diver', name: 'Deep Diver', nameZh: '深潜者', requiredLevel: 12, emoji: '🤿', bonusDescription: '+20% ability power' },
  { id: 'title_ocean_warden', name: 'Ocean Warden', nameZh: '海洋守望者', requiredLevel: 16, emoji: '🛡️', bonusDescription: '+25% defense' },
  { id: 'title_forest_sovereign', name: 'Forest Sovereign', nameZh: '森林君主', requiredLevel: 20, emoji: '👑', bonusDescription: '+30% all rewards' },
  { id: 'title_guardian_of_the_abyss', name: 'Guardian of the Abyss', nameZh: '深渊守护者', requiredLevel: 25, emoji: '🌊', bonusDescription: '+50% legendary encounter rate' },
];

// ─── Artifacts (6: rare 2, epic 2, legendary 2) ──────────────────────────────

const KF_ARTIFACTS: KfArtifactDef[] = [
  // ── Rare (2) ──
  {
    id: 'pearl_of_tides',
    name: 'Pearl of Tides',
    nameZh: '潮汐之珠',
    rarity: 'Rare',
    description: 'A pearl that pulses with the eternal rhythm of ocean tides. Grants the holder attunement to water currents.',
    emoji: '💠',
    power: 40,
    cost: 200,
    passiveEffect: '+10% coin rewards from dives',
  },
  {
    id: 'kelp_elder_staff',
    name: 'Kelp Elder Staff',
    nameZh: '海藻长老法杖',
    rarity: 'Rare',
    description: 'A staff grown from ancient kelp, humming with the accumulated wisdom of the forest.',
    emoji: '🪄',
    power: 45,
    cost: 250,
    passiveEffect: '+15% XP from creature catches',
  },
  // ── Epic (2) ──
  {
    id: 'crown_of_corals',
    name: 'Crown of Corals',
    nameZh: '珊瑚王冠',
    rarity: 'Epic',
    description: 'A living coral crown that blooms with bioluminescent flowers. Symbol of authority over reef dwellers.',
    emoji: '👑',
    power: 100,
    cost: 600,
    passiveEffect: '+20% structure efficiency',
  },
  {
    id: 'conch_of_abyssal_echoes',
    name: 'Conch of Abyssal Echoes',
    nameZh: '深渊回音海螺',
    rarity: 'Epic',
    description: 'When held to the ear, reveals the deepest secrets of the ocean trenches and hidden grove locations.',
    emoji: '🐚',
    power: 110,
    cost: 700,
    passiveEffect: 'Reveals hidden materials in all groves',
  },
  // ── Legendary (2) ──
  {
    id: 'trident_of_the_king',
    name: 'Trident of the King',
    nameZh: '王者三叉戟',
    rarity: 'Legendary',
    description: 'The legendary trident that commands all ocean currents. Forged by Poseidon himself in the heart of a volcano.',
    emoji: '🔱',
    power: 250,
    cost: 2000,
    passiveEffect: '+50% ability power, +30% all rewards',
  },
  {
    id: 'heart_of_the_forest',
    name: 'Heart of the Forest',
    nameZh: '森林之心',
    rarity: 'Legendary',
    description: 'The living core of the kelp forest, source of all its power. Pulsates with the primordial energy of the ocean.',
    emoji: '💚',
    power: 300,
    cost: 2500,
    passiveEffect: '+100% creature power, legendary creatures appear more often',
  },
];

// ─── Ocean Events (8) ─────────────────────────────────────────────────────────

const KF_EVENTS: KfOceanEventDef[] = [
  {
    id: 'event_biolum_bloom',
    name: 'Bioluminescent Bloom',
    nameZh: '生物发光盛放',
    description: 'A massive bloom of glowing plankton transforms the entire forest into an ethereal light show of blue and green',
    emoji: '✨',
    duration: 30000,
    effect: 'xp_double',
    effectDescription: 'All creature XP rewards doubled for 30 seconds',
    rewardCoins: 50,
    rewardXp: 30,
  },
  {
    id: 'event_tidal_surge',
    name: 'Tidal Surge',
    nameZh: '潮汐暴涨',
    description: 'A powerful tidal surge brings rare creatures from the open ocean into the normally sheltered groves',
    emoji: '🌊',
    duration: 45000,
    effect: 'rare_boost',
    effectDescription: 'Rare+ creatures appear 3x more frequently',
    rewardCoins: 80,
    rewardXp: 50,
  },
  {
    id: 'event_whale_migration',
    name: 'Whale Migration',
    nameZh: '鲸鱼迁徙',
    description: 'A pod of magnificent whales passes through, leaving behind valuable ambergris and deep pearls',
    emoji: '🐋',
    duration: 60000,
    effect: 'material_bonus',
    effectDescription: 'Bonus rare materials from every dive',
    rewardCoins: 120,
    rewardXp: 80,
  },
  {
    id: 'event_kelp_storm',
    name: 'Kelp Storm',
    nameZh: '海藻风暴',
    description: 'Violent underwater currents uproot kelp, scattering rare materials across every grove floor',
    emoji: '🌪️',
    duration: 20000,
    effect: 'material_triple',
    effectDescription: 'Material collection rate tripled',
    rewardCoins: 60,
    rewardXp: 40,
  },
  {
    id: 'event_coral_spawning',
    name: 'Coral Spawning',
    nameZh: '珊瑚产卵',
    description: 'Corals across the forest release millions of eggs in a spectacular synchronized spawning event',
    emoji: '🪸',
    duration: 40000,
    effect: 'build_discount',
    effectDescription: 'Structure build and upgrade costs reduced by 50%',
    rewardCoins: 100,
    rewardXp: 60,
  },
  {
    id: 'event_abyssal_upwelling',
    name: 'Abyssal Upwelling',
    nameZh: '深渊涌升',
    description: 'Deep water rises from the abyss, carrying rare deep-sea materials to the shallower groves',
    emoji: '⬆️',
    duration: 35000,
    effect: 'rare_materials_shallow',
    effectDescription: 'Rare and epic materials appear in common groves',
    rewardCoins: 90,
    rewardXp: 55,
  },
  {
    id: 'event_moon_jelly_invasion',
    name: 'Moon Jelly Invasion',
    nameZh: '海月水母入侵',
    description: 'Thousands of moon jellyfish drift through in a mesmerizing parade of pulsing translucent bells',
    emoji: '🪼',
    duration: 25000,
    effect: 'jellyfish_spawn',
    effectDescription: 'Jellyfish-type creatures appear in all groves',
    rewardCoins: 70,
    rewardXp: 45,
  },
  {
    id: 'event_ancient_echo',
    name: 'Ancient Echo',
    nameZh: '远古回响',
    description: 'A mysterious resonance emanates from the deepest sanctum, empowering all creatures in the forest',
    emoji: '🕯️',
    duration: 50000,
    effect: 'power_boost',
    effectDescription: 'All creature power increased by 20%',
    rewardCoins: 150,
    rewardXp: 100,
  },
];

// ─── Recipes (10) ─────────────────────────────────────────────────────────────

const KF_RECIPES: KfRecipeDef[] = [
  {
    id: 'recipe_kelp_salve',
    name: 'Kelp Healing Salve',
    nameZh: '海藻治愈膏',
    ingredients: { kelp_frond: 3, seafoam_moss: 2 },
    resultMaterial: 'anemone_extract',
    resultQuantity: 1,
    xpReward: 15,
    requiredLevel: 1,
    description: 'A soothing salve crafted from fresh kelp and seafoam moss',
    emoji: '🧴',
  },
  {
    id: 'recipe_glow_lamp',
    name: 'Bioluminescent Lantern',
    nameZh: '生物荧光灯',
    ingredients: { biolum_algae: 2, sea_glass: 1 },
    resultMaterial: 'glow_pearl',
    resultQuantity: 1,
    xpReward: 25,
    requiredLevel: 3,
    description: 'A lantern fueled by cultivated bioluminescent algae',
    emoji: '🏮',
  },
  {
    id: 'recipe_coral_blend',
    name: 'Coral Growth Blend',
    nameZh: '珊瑚生长混合剂',
    ingredients: { coral_fragment: 2, plankton_sample: 3 },
    resultMaterial: 'coral_bud',
    resultQuantity: 2,
    xpReward: 20,
    requiredLevel: 5,
    description: 'A nutrient blend that stimulates rapid coral growth',
    emoji: '🪸',
  },
  {
    id: 'recipe_pearl_polish',
    name: 'Pearl Polishing Compound',
    nameZh: '珍珠抛光剂',
    ingredients: { sea_glass: 3, seashell: 2, driftwood: 1 },
    resultMaterial: 'glow_pearl',
    resultQuantity: 1,
    xpReward: 30,
    requiredLevel: 4,
    description: 'Polishes rough pearls into luminous gems',
    emoji: '💠',
  },
  {
    id: 'recipe_venom_antidote',
    name: 'Venom Antidote',
    nameZh: '解毒剂',
    ingredients: { anemone_extract: 1, seafoam_moss: 3 },
    resultMaterial: 'tube_sponge',
    resultQuantity: 1,
    xpReward: 35,
    requiredLevel: 8,
    description: 'Counteracts the venom of moray eels and blue-ringed octopuses',
    emoji: '💊',
  },
  {
    id: 'recipe_depth_charm',
    name: 'Depth Charm',
    nameZh: '深渊护符',
    ingredients: { cave_crystal: 1, moonstone_shard: 1, deep_shell: 2 },
    resultMaterial: 'pressure_crystal',
    resultQuantity: 1,
    xpReward: 60,
    requiredLevel: 10,
    description: 'A protective charm that helps withstand deep ocean pressure',
    emoji: '🔮',
  },
  {
    id: 'recipe_abyssal_ink',
    name: 'Abyssal Ink',
    nameZh: '深渊墨汁',
    ingredients: { void_moss: 2, eel_skin: 1, deep_crystal_shard: 1 },
    resultMaterial: 'dark_pearl',
    resultQuantity: 1,
    xpReward: 80,
    requiredLevel: 14,
    description: 'Dark ink from abyssal creatures used in ancient deep-sea rituals',
    emoji: '✒️',
  },
  {
    id: 'recipe_sanctum_brew',
    name: 'Sanctum Elixir',
    nameZh: '圣殿灵药',
    ingredients: { sanctum_pearl: 1, living_coral_core: 1 },
    resultMaterial: 'ocean_heart_crystal',
    resultQuantity: 1,
    xpReward: 150,
    requiredLevel: 20,
    description: 'The most powerful elixir, distilled from the heart of the forest',
    emoji: '🧪',
  },
  {
    id: 'recipe_tide_rope',
    name: 'Tide-Resistant Rope',
    nameZh: '抗潮绳索',
    ingredients: { kelp_frond: 5, driftwood: 2, seafoam_moss: 1 },
    resultMaterial: 'primordial_kelp',
    resultQuantity: 1,
    xpReward: 40,
    requiredLevel: 6,
    description: 'An incredibly strong rope woven from treated kelp fibers',
    emoji: '🪢',
  },
  {
    id: 'recipe_kraken_glue',
    name: 'Kraken Adhesive',
    nameZh: '海妖胶水',
    ingredients: { eel_skin: 2, venom_sac: 1, deep_crystal_shard: 1 },
    resultMaterial: 'trident_fossil',
    resultQuantity: 1,
    xpReward: 120,
    requiredLevel: 16,
    description: 'An unbreakable adhesive derived from deep-sea creature secretions',
    emoji: '🦑',
  },
];

// ─── Daily Quests (8) ─────────────────────────────────────────────────────────

const KF_DAILY_QUESTS: KfDailyQuestDef[] = [
  { id: 'dq_catch_three', name: 'Morning Catch', nameZh: '晨间捕捞', description: 'Catch 3 marine creatures today', type: 'catch', target: 3, rewardCoins: 30, rewardXp: 25, emoji: '🐟' },
  { id: 'dq_dive_twice', name: 'Twin Dives', nameZh: '双潜', description: 'Complete 2 kelp grove dives', type: 'dive', target: 2, rewardCoins: 40, rewardXp: 30, emoji: '🤿' },
  { id: 'dq_build_one', name: 'Daily Builder', nameZh: '日常建造', description: 'Build or upgrade 1 structure', type: 'build', target: 1, rewardCoins: 50, rewardXp: 35, emoji: '🔨' },
  { id: 'dq_collect_five', name: 'Resource Rush', nameZh: '资源抢购', description: 'Collect 5 materials from grove dives', type: 'collect', target: 5, rewardCoins: 25, rewardXp: 20, emoji: '🌿' },
  { id: 'dq_use_ability', name: 'Power Practice', nameZh: '能力练习', description: 'Use any ability 3 times', type: 'ability', target: 3, rewardCoins: 35, rewardXp: 28, emoji: '⚡' },
  { id: 'dq_catch_rare', name: 'Rare Find', nameZh: '稀有发现', description: 'Catch a Rare or higher rarity creature', type: 'rare_catch', target: 1, rewardCoins: 80, rewardXp: 60, emoji: '💎' },
  { id: 'dq_dive_deep', name: 'Deep Expedition', nameZh: '深海探险', description: 'Dive into a grove with unlock level 10+', type: 'deep_dive', target: 1, rewardCoins: 60, rewardXp: 50, emoji: '🌑' },
  { id: 'dq_craft_item', name: 'Artisan Work', nameZh: '工匠之作', description: 'Craft any recipe 2 times', type: 'craft', target: 2, rewardCoins: 45, rewardXp: 40, emoji: '🧪' },
];

// ─── XP Table ─────────────────────────────────────────────────────────────────

const KF_XP_TABLE: number[] = [];
for (let i = 0; i <= 50; i++) {
  KF_XP_TABLE.push(Math.floor(100 * Math.pow(i, 1.35)));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function kfXpForLevel(lvl: number): number {
  return Math.floor(100 * Math.pow(lvl, 1.35));
}

function kfRarityMultiplier(rarity: KfRarity): number {
  switch (rarity) {
    case 'Common': return 1;
    case 'Uncommon': return 1.5;
    case 'Rare': return 2.5;
    case 'Epic': return 4;
    case 'Legendary': return 7;
    default: return 1;
  }
}

function kfGetFishDef(id: string): KfCreatureDef | undefined {
  return KF_FISH.find(f => f.id === id);
}

function kfGetGroveDef(id: string): KfGroveDef | undefined {
  return KF_GROVES.find(g => g.id === id);
}

function kfGetStructureDef(id: string): KfStructureDef | undefined {
  return KF_STRUCTURES.find(s => s.id === id);
}

function kfGetAbilityDef(id: string): KfAbilityDef | undefined {
  return KF_ABILITIES.find(a => a.id === id);
}

function kfGetArtifactDef(id: string): KfArtifactDef | undefined {
  return KF_ARTIFACTS.find(a => a.id === id);
}

function kfGetMaterialDef(id: string): KfMaterialDef | undefined {
  return KF_MATERIALS.find(m => m.id === id);
}

function kfGetAchievementDef(id: string): KfAchievementDef | undefined {
  return KF_ACHIEVEMENTS.find(a => a.id === id);
}

function kfGetTitleDef(id: string): KfTitleDef | undefined {
  return KF_TITLES.find(t => t.id === id);
}

function kfGetEventDef(id: string): KfOceanEventDef | undefined {
  return KF_EVENTS.find(e => e.id === id);
}

function kfGetRecipeDef(id: string): KfRecipeDef | undefined {
  return KF_RECIPES.find(r => r.id === id);
}

function kfGetDailyQuestDef(id: string): KfDailyQuestDef | undefined {
  return KF_DAILY_QUESTS.find(q => q.id === id);
}

// ─── Default State ────────────────────────────────────────────────────────────

function createDefaultState(): KfKelpForestState {
  const groves: Record<string, KfGroveInstance> = {};
  for (const g of KF_GROVES) {
    groves[g.id] = {
      defId: g.id,
      discovered: g.unlockLevel === 1,
      lastDived: 0,
      fishCaught: 0,
      materialsCollected: 0,
      visits: g.unlockLevel === 1 ? 1 : 0,
    };
  }

  return {
    kfLevel: 1,
    kfXp: 0,
    kfMaxXp: kfXpForLevel(1),
    kfCoins: 100,
    kfFish: {},
    kfGroves: groves,
    kfStructures: {},
    kfArtifacts: {},
    kfAbilities: {},
    kfInventory: { kelp_frond: 5, seashell: 3, plankton_sample: 4, seafoam_moss: 2, driftwood: 3, sea_glass: 1 },
    kfCurrentTitle: 'title_kelp_sprout',
    kfClaimedAchievements: [],
    kfEventLog: [],
    kfKnownRecipes: ['recipe_kelp_salve'],
    kfDailyQuest: null,
    kfLastDailyReset: Date.now(),
    kfDayStreak: 0,
    kfSelectedGrove: 'sunlit_shallows',
    kfSettings: {
      sfxEnabled: true,
      particleEffects: true,
      ambientSounds: true,
      themeVariant: 'deep',
    },
    kfStats: {
      totalCaught: 0,
      totalDived: 0,
      totalStructuresBuilt: 0,
      totalArtifacts: 0,
      totalEvents: 0,
      totalCoins: 0,
      totalXp: 0,
    },
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export default function useKelpForest(initialState?: KfKelpForestState) {
  const [state, setState] = useState<KfKelpForestState>(initialState ?? createDefaultState());
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // ── Level & XP ────────────────────────────────────────────────────────────

  const addXp = useCallback((amount: number) => {
    setState(prev => {
      let newLevel = prev.kfLevel;
      let newXp = prev.kfXp + amount;
      let newMaxXp = prev.kfMaxXp;
      let newTitle = prev.kfCurrentTitle;

      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel += 1;
        newMaxXp = kfXpForLevel(newLevel);
      }

      for (let i = KF_TITLES.length - 1; i >= 0; i--) {
        if (newLevel >= KF_TITLES[i].requiredLevel) {
          const curIdx = KF_TITLES.findIndex(t => t.id === newTitle);
          if (i > curIdx) {
            newTitle = KF_TITLES[i].id;
          }
          break;
        }
      }

      return {
        ...prev,
        kfLevel: newLevel,
        kfXp: newXp,
        kfMaxXp: newMaxXp,
        kfCurrentTitle: newTitle,
        kfCoins: prev.kfCoins + Math.floor(amount * 0.2),
        kfStats: {
          ...prev.kfStats,
          totalXp: prev.kfStats.totalXp + amount,
          totalCoins: prev.kfStats.totalCoins + Math.floor(amount * 0.2),
        },
      };
    });
  }, []);

  // ── Core Action: catchFish ────────────────────────────────────────────────

  const catchFish = useCallback((fishDefId: string): boolean => {
    const def = kfGetFishDef(fishDefId);
    if (!def) return false;

    let success = false;
    setState(prev => {
      if (prev.kfCoins < def.cost) return prev;

      const instanceId = `${fishDefId}_${Date.now()}`;
      const newInstance: KfFishInstance = {
        defId: fishDefId,
        caughtAt: Date.now(),
        level: 1,
        nickname: '',
        timesFed: 0,
      };

      success = true;
      return {
        ...prev,
        kfCoins: prev.kfCoins - def.cost,
        kfFish: { ...prev.kfFish, [instanceId]: newInstance },
        kfStats: {
          ...prev.kfStats,
          totalCaught: prev.kfStats.totalCaught + 1,
        },
      };
    });

    if (success) {
      addXp(def.xpReward);
    }
    return success;
  }, [addXp]);

  // ── Core Action: diveGrove ────────────────────────────────────────────────

  const diveGrove = useCallback((groveDefId: string): boolean => {
    const def = kfGetGroveDef(groveDefId);
    if (!def) return false;

    let success = false;
    let rewardCoins = 0;
    let rewardXp = 0;

    setState(prev => {
      const grove = prev.kfGroves[groveDefId];
      if (!grove) return prev;
      if (prev.kfLevel < def.unlockLevel) return prev;

      success = true;
      rewardCoins = Math.floor(def.level * 5 + 10);
      rewardXp = Math.floor(def.level * 8);

      // Grant random materials from the grove
      const newInventory = { ...prev.kfInventory };
      const materialsToGive = Math.min(def.resources.length, Math.floor(Math.random() * 3) + 1);
      for (let i = 0; i < materialsToGive; i++) {
        const matId = def.resources[Math.floor(Math.random() * def.resources.length)];
        newInventory[matId] = (newInventory[matId] ?? 0) + 1;
      }

      return {
        ...prev,
        kfGroves: {
          ...prev.kfGroves,
          [groveDefId]: {
            ...grove,
            discovered: true,
            lastDived: Date.now(),
            fishCaught: grove.fishCaught + 1,
            materialsCollected: grove.materialsCollected + materialsToGive,
            visits: grove.visits + 1,
          },
        },
        kfCoins: prev.kfCoins + rewardCoins,
        kfInventory: newInventory,
        kfSelectedGrove: groveDefId,
        kfStats: {
          ...prev.kfStats,
          totalDived: prev.kfStats.totalDived + 1,
          totalCoins: prev.kfStats.totalCoins + rewardCoins,
        },
      };
    });

    if (success) {
      addXp(rewardXp);
    }
    return success;
  }, [addXp]);

  // ── Core Action: buildStructure ───────────────────────────────────────────

  const buildStructure = useCallback((structureDefId: string): boolean => {
    const def = kfGetStructureDef(structureDefId);
    if (!def) return false;

    let success = false;
    setState(prev => {
      const existing = prev.kfStructures[structureDefId];
      const cost = existing
        ? Math.floor(def.baseCost * Math.pow(def.upgradeCostMultiplier, existing.level))
        : def.baseCost;

      if (prev.kfCoins < cost) return prev;
      if (existing && existing.level >= def.maxLevel) return prev;

      success = true;
      const newLevel = existing ? existing.level + 1 : 1;
      const newInstance: KfStructureInstance = {
        defId: structureDefId,
        level: newLevel,
        builtAt: existing ? existing.builtAt : Date.now(),
        lastUpgraded: Date.now(),
      };

      return {
        ...prev,
        kfCoins: prev.kfCoins - cost,
        kfStructures: { ...prev.kfStructures, [structureDefId]: newInstance },
        kfStats: {
          ...prev.kfStats,
          totalStructuresBuilt: prev.kfStats.totalStructuresBuilt + (existing ? 0 : 1),
        },
      };
    });

    if (success && def) {
      addXp(Math.floor(def.baseCost * 0.1));
    }
    return success;
  }, [addXp]);

  // ── Core Action: activateArtifact ─────────────────────────────────────────

  const activateArtifact = useCallback((artifactDefId: string): boolean => {
    const def = kfGetArtifactDef(artifactDefId);
    if (!def) return false;

    let success = false;
    setState(prev => {
      if (prev.kfCoins < def.cost) return prev;

      const existing = prev.kfArtifacts[artifactDefId];
      if (existing && existing.activated) return prev;

      success = true;
      const newInstance: KfArtifactInstance = {
        defId: artifactDefId,
        activated: true,
        activatedAt: Date.now(),
        charges: 3,
      };

      return {
        ...prev,
        kfCoins: prev.kfCoins - def.cost,
        kfArtifacts: { ...prev.kfArtifacts, [artifactDefId]: newInstance },
        kfStats: {
          ...prev.kfStats,
          totalArtifacts: prev.kfStats.totalArtifacts + 1,
        },
      };
    });

    if (success) {
      addXp(def.power);
    }
    return success;
  }, [addXp]);

  // ── Core Action: triggerOceanEvent ────────────────────────────────────────

  const triggerOceanEvent = useCallback((eventDefId: string): boolean => {
    const def = kfGetEventDef(eventDefId);
    if (!def) return false;

    setState(prev => {
      return {
        ...prev,
        kfCoins: prev.kfCoins + def.rewardCoins,
        kfEventLog: [...prev.kfEventLog, { eventId: eventDefId, triggeredAt: Date.now() }],
        kfStats: {
          ...prev.kfStats,
          totalEvents: prev.kfStats.totalEvents + 1,
          totalCoins: prev.kfStats.totalCoins + def.rewardCoins,
        },
      };
    });

    addXp(def.rewardXp);
    return true;
  }, [addXp]);

  // ── Core Action: resetKelpForest ──────────────────────────────────────────

  const resetKelpForest = useCallback(() => {
    setState(createDefaultState());
  }, []);

  // ── Extended: discoverGrove ───────────────────────────────────────────────

  const discoverGrove = useCallback((groveDefId: string): boolean => {
    const def = kfGetGroveDef(groveDefId);
    if (!def) return false;

    let discovered = false;
    setState(prev => {
      if (prev.kfLevel < def.unlockLevel) return prev;
      const grove = prev.kfGroves[groveDefId];
      if (!grove || grove.discovered) return prev;

      discovered = true;
      return {
        ...prev,
        kfGroves: {
          ...prev.kfGroves,
          [groveDefId]: { ...grove, discovered: true },
        },
      };
    });
    return discovered;
  }, []);

  // ── Extended: checkAndClaimAchievements ───────────────────────────────────

  const checkAndClaimAchievements = useCallback((): string[] => {
    const newlyClaimed: string[] = [];

    setState(prev => {
      const claimed = new Set(prev.kfClaimedAchievements);
      const stats = prev.kfStats;

      for (const ach of KF_ACHIEVEMENTS) {
        if (claimed.has(ach.id)) continue;
        const currentVal = stats[ach.conditionKey as keyof typeof stats] as number ?? 0;
        if (currentVal >= ach.targetValue) {
          claimed.add(ach.id);
          newlyClaimed.push(ach.id);
        }
      }

      if (newlyClaimed.length === 0) return prev;

      return { ...prev, kfClaimedAchievements: Array.from(claimed) };
    });

    for (const achId of newlyClaimed) {
      const ach = kfGetAchievementDef(achId);
      if (ach) {
        addXp(ach.rewardXp);
        setState(prev => ({ ...prev, kfCoins: prev.kfCoins + ach.rewardCoins }));
      }
    }

    return newlyClaimed;
  }, [addXp]);

  // ── Extended: useAbility ──────────────────────────────────────────────────

  const useAbility = useCallback((abilityDefId: string): boolean => {
    const def = kfGetAbilityDef(abilityDefId);
    if (!def) return false;

    let used = false;
    setState(prev => {
      if (prev.kfLevel < def.unlockLevel) return prev;
      if (prev.kfCoins < def.cost) return prev;

      const cooldownEntry = prev.kfAbilities[abilityDefId];
      if (cooldownEntry) {
        const elapsed = Date.now() - cooldownEntry.lastUsed;
        if (elapsed < def.cooldown) return prev;
      }

      used = true;
      return {
        ...prev,
        kfCoins: prev.kfCoins - def.cost,
        kfAbilities: {
          ...prev.kfAbilities,
          [abilityDefId]: {
            defId: abilityDefId,
            lastUsed: Date.now(),
            totalUses: (cooldownEntry?.totalUses ?? 0) + 1,
          },
        },
      };
    });

    if (used) {
      addXp(Math.floor(def.power * 0.3));
    }
    return used;
  }, [addXp]);

  // ── Title System ──────────────────────────────────────────────────────────

  const currentTitleInfo = useCallback((): KfTitleDef => {
    const title = kfGetTitleDef(stateRef.current.kfCurrentTitle);
    return title ?? KF_TITLES[0];
  }, []);

  const nextTitleInfo = useCallback((): KfTitleDef | null => {
    const current = kfGetTitleDef(stateRef.current.kfCurrentTitle);
    const currentIdx = KF_TITLES.findIndex(t => t.id === (current?.id ?? ''));
    if (currentIdx < 0 || currentIdx >= KF_TITLES.length - 1) return null;
    return KF_TITLES[currentIdx + 1];
  }, []);

  const titleProgress = useCallback((): number => {
    const current = kfGetTitleDef(stateRef.current.kfCurrentTitle);
    const next = nextTitleInfo();
    if (!current || !next) return 1;
    const range = next.requiredLevel - current.requiredLevel;
    if (range <= 0) return 1;
    return Math.min(1, Math.max(0, (stateRef.current.kfLevel - current.requiredLevel) / range));
  }, [nextTitleInfo]);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const statsSummary = useCallback(() => {
    return { ...stateRef.current.kfStats };
  }, []);

  const completionStats = useCallback(() => {
    const s = stateRef.current;
    const totalFishDefs = KF_FISH.length;
    const uniqueCaught = new Set(Object.values(s.kfFish).map(f => f.defId)).size;
    const totalStructures = KF_STRUCTURES.length;
    const builtStructures = Object.keys(s.kfStructures).length;
    const totalArtifacts = KF_ARTIFACTS.length;
    const activatedArtifacts = Object.values(s.kfArtifacts).filter(a => a.activated).length;
    const totalAchievements = KF_ACHIEVEMENTS.length;
    const claimedAchievements = s.kfClaimedAchievements.length;
    const totalGroves = KF_GROVES.length;
    const discoveredGroves = Object.values(s.kfGroves).filter(g => g.discovered).length;
    const totalRecipes = KF_RECIPES.length;
    const knownRecipes = s.kfKnownRecipes.length;

    return {
      fishCompletion: totalFishDefs > 0 ? uniqueCaught / totalFishDefs : 0,
      structureCompletion: totalStructures > 0 ? builtStructures / totalStructures : 0,
      artifactCompletion: totalArtifacts > 0 ? activatedArtifacts / totalArtifacts : 0,
      achievementCompletion: totalAchievements > 0 ? claimedAchievements / totalAchievements : 0,
      groveCompletion: totalGroves > 0 ? discoveredGroves / totalGroves : 0,
      recipeCompletion: totalRecipes > 0 ? knownRecipes / totalRecipes : 0,
      overallCompletion: (
        (uniqueCaught / totalFishDefs +
        builtStructures / totalStructures +
        activatedArtifacts / totalArtifacts +
        claimedAchievements / totalAchievements +
        discoveredGroves / totalGroves +
        knownRecipes / totalRecipes) / 6
      ) || 0,
    };
  }, []);

  // ── Enriched Data ─────────────────────────────────────────────────────────

  const enrichedFish = useMemo(() => {
    return Object.entries(state.kfFish).map(([instanceId, instance]) => {
      const def = kfGetFishDef(instance.defId);
      return {
        instanceId,
        ...instance,
        def: def ?? null,
        rarityColor: def ? KF_RARITY_COLORS[def.rarity] : '#9CA3AF',
      };
    });
  }, [state.kfFish]);

  const enrichedGroves = useMemo(() => {
    return Object.entries(state.kfGroves).map(([groveId, instance]) => {
      const def = kfGetGroveDef(groveId);
      return {
        groveId,
        ...instance,
        def: def ?? null,
        isUnlocked: def ? state.kfLevel >= def.unlockLevel : false,
        resources: def?.resources ?? [],
      };
    });
  }, [state.kfGroves, state.kfLevel]);

  const enrichedStructures = useMemo(() => {
    return Object.entries(state.kfStructures).map(([structureId, instance]) => {
      const def = kfGetStructureDef(structureId);
      const upgradeCost = def
        ? Math.floor(def.baseCost * Math.pow(def.upgradeCostMultiplier, instance.level))
        : 0;
      return {
        structureId,
        ...instance,
        def: def ?? null,
        upgradeCost,
        isMaxLevel: def ? instance.level >= def.maxLevel : false,
        category: def?.category ?? 'unknown',
      };
    });
  }, [state.kfStructures]);

  const enrichedInventory = useMemo(() => {
    return Object.entries(state.kfInventory)
      .map(([materialId, quantity]) => {
        const def = kfGetMaterialDef(materialId);
        return {
          materialId,
          quantity,
          def: def ?? null,
          totalValue: def ? def.value * quantity : 0,
          rarity: def?.rarity ?? 'Common' as KfRarity,
        };
      })
      .filter(item => item.quantity > 0)
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [state.kfInventory]);

  // ── Computed ──────────────────────────────────────────────────────────────

  const fishByType = useMemo(() => {
    const grouped: Record<KfSpecies, KfCreatureDef[]> = {
      kelp_fish: [], sea_dragon: [], coral_crab: [], jellyfish: [],
      sea_otter: [], moray_eel: [], octopus: [],
    };
    for (const fish of KF_FISH) grouped[fish.species].push(fish);
    return grouped;
  }, []);

  const fishByRarity = useMemo(() => {
    const grouped: Record<KfRarity, KfCreatureDef[]> = {
      Common: [], Uncommon: [], Rare: [], Epic: [], Legendary: [],
    };
    for (const fish of KF_FISH) grouped[fish.rarity].push(fish);
    return grouped;
  }, []);

  const abilitiesByType = useMemo(() => {
    const grouped: Record<KfAbilityType, KfAbilityDef[]> = {
      offensive: [], defensive: [], utility: [], summon: [],
    };
    for (const ability of KF_ABILITIES) grouped[ability.type].push(ability);
    return grouped;
  }, []);

  const materialsByRarity = useMemo(() => {
    const grouped: Record<KfRarity, KfMaterialDef[]> = {
      Common: [], Uncommon: [], Rare: [], Epic: [], Legendary: [],
    };
    for (const mat of KF_MATERIALS) grouped[mat.rarity].push(mat);
    return grouped;
  }, []);

  const structuresByCategory = useMemo(() => {
    const grouped: Record<string, KfStructureDef[]> = {};
    for (const s of KF_STRUCTURES) {
      const cat = s.category ?? 'other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s);
    }
    return grouped;
  }, []);

  const availableCandidates = useMemo(() => {
    return KF_FISH.filter(f => f.cost <= state.kfCoins);
  }, [state.kfCoins]);

  const affordableStructures = useMemo(() => {
    return KF_STRUCTURES.filter(s => {
      const existing = state.kfStructures[s.id];
      if (existing && existing.level >= s.maxLevel) return false;
      const cost = existing
        ? Math.floor(s.baseCost * Math.pow(s.upgradeCostMultiplier, existing.level))
        : s.baseCost;
      return cost <= state.kfCoins;
    });
  }, [state.kfCoins, state.kfStructures]);

  const unlockableAbilities = useMemo(() => {
    return KF_ABILITIES.filter(a => state.kfLevel >= a.unlockLevel);
  }, [state.kfLevel]);

  const pendingAchievements = useMemo(() => {
    const claimed = new Set(state.kfClaimedAchievements);
    const stats = state.kfStats;
    return KF_ACHIEVEMENTS.filter(ach => {
      if (claimed.has(ach.id)) return false;
      const currentVal = stats[ach.conditionKey as keyof typeof stats] as number ?? 0;
      return currentVal >= ach.targetValue;
    }).map(ach => ach.id);
  }, [state.kfClaimedAchievements, state.kfStats]);

  const recentEventLog = useMemo(() => {
    return [...state.kfEventLog]
      .sort((a, b) => b.triggeredAt - a.triggeredAt)
      .slice(0, 10)
      .map(entry => {
        const def = kfGetEventDef(entry.eventId);
        return { ...entry, def: def ?? null };
      });
  }, [state.kfEventLog]);

  const totalInventoryValue = useMemo(() => {
    let total = 0;
    for (const [matId, qty] of Object.entries(state.kfInventory)) {
      const def = kfGetMaterialDef(matId);
      if (def) total += def.value * qty;
    }
    return total;
  }, [state.kfInventory]);

  // ── Convenience Getters ───────────────────────────────────────────────────

  const getKfLevel = useCallback(() => stateRef.current.kfLevel, []);
  const getKfXp = useCallback(() => stateRef.current.kfXp, []);
  const getKfMaxXp = useCallback(() => stateRef.current.kfMaxXp, []);
  const getKfCoins = useCallback(() => stateRef.current.kfCoins, []);
  const getKfXpProgress = useCallback(() => {
    const s = stateRef.current;
    return s.kfMaxXp > 0 ? Math.min(s.kfXp / s.kfMaxXp, 1) : 0;
  }, []);

  const addKfCoins = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      kfCoins: prev.kfCoins + amount,
      kfStats: { ...prev.kfStats, totalCoins: prev.kfStats.totalCoins + amount },
    }));
  }, []);

  const spendKfCoins = useCallback((amount: number): boolean => {
    let success = false;
    setState(prev => {
      if (prev.kfCoins < amount) return prev;
      success = true;
      return { ...prev, kfCoins: prev.kfCoins - amount };
    });
    return success;
  }, []);

  const getFishDefById = useCallback((id: string) => kfGetFishDef(id), []);
  const getGroveDefById = useCallback((id: string) => kfGetGroveDef(id), []);
  const getStructureDefById = useCallback((id: string) => kfGetStructureDef(id), []);
  const getAbilityDefById = useCallback((id: string) => kfGetAbilityDef(id), []);
  const getArtifactDefById = useCallback((id: string) => kfGetArtifactDef(id), []);
  const getMaterialDefById = useCallback((id: string) => kfGetMaterialDef(id), []);
  const getAchievementDefById = useCallback((id: string) => kfGetAchievementDef(id), []);
  const getTitleDefById = useCallback((id: string) => kfGetTitleDef(id), []);
  const getEventDefById = useCallback((id: string) => kfGetEventDef(id), []);
  const getRecipeDefById = useCallback((id: string) => kfGetRecipeDef(id), []);

  const isAbilityOnCooldown = useCallback((abilityDefId: string): boolean => {
    const def = kfGetAbilityDef(abilityDefId);
    const entry = stateRef.current.kfAbilities[abilityDefId];
    if (!def || !entry) return false;
    return Date.now() - entry.lastUsed < def.cooldown;
  }, []);

  const getAbilityCooldownRemaining = useCallback((abilityDefId: string): number => {
    const def = kfGetAbilityDef(abilityDefId);
    const entry = stateRef.current.kfAbilities[abilityDefId];
    if (!def || !entry) return 0;
    return Math.max(0, def.cooldown - (Date.now() - entry.lastUsed));
  }, []);

  const isGroveDiscovered = useCallback((groveDefId: string): boolean => {
    return stateRef.current.kfGroves[groveDefId]?.discovered ?? false;
  }, []);

  const isGroveUnlocked = useCallback((groveDefId: string): boolean => {
    const def = kfGetGroveDef(groveDefId);
    if (!def) return false;
    return stateRef.current.kfLevel >= def.unlockLevel;
  }, []);

  const isArtifactActivated = useCallback((artifactDefId: string): boolean => {
    return stateRef.current.kfArtifacts[artifactDefId]?.activated ?? false;
  }, []);

  const isStructureBuilt = useCallback((structureDefId: string): boolean => {
    return structureDefId in stateRef.current.kfStructures;
  }, []);

  const getStructureLevel = useCallback((structureDefId: string): number => {
    return stateRef.current.kfStructures[structureDefId]?.level ?? 0;
  }, []);

  const getStructureUpgradeCost = useCallback((structureDefId: string): number => {
    const def = kfGetStructureDef(structureDefId);
    const existing = stateRef.current.kfStructures[structureDefId];
    if (!def) return 0;
    return existing
      ? Math.floor(def.baseCost * Math.pow(def.upgradeCostMultiplier, existing.level))
      : def.baseCost;
  }, []);

  const isAchievementClaimed = useCallback((achievementDefId: string): boolean => {
    return stateRef.current.kfClaimedAchievements.includes(achievementDefId);
  }, []);

  const getInventoryCount = useCallback((materialDefId: string): number => {
    return stateRef.current.kfInventory[materialDefId] ?? 0;
  }, []);

  const addToInventory = useCallback((materialDefId: string, quantity: number) => {
    setState(prev => ({
      ...prev,
      kfInventory: {
        ...prev.kfInventory,
        [materialDefId]: (prev.kfInventory[materialDefId] ?? 0) + quantity,
      },
    }));
  }, []);

  const removeFromInventory = useCallback((materialDefId: string, quantity: number): boolean => {
    let success = false;
    setState(prev => {
      const current = prev.kfInventory[materialDefId] ?? 0;
      if (current < quantity) return prev;
      success = true;
      const newInventory = { ...prev.kfInventory };
      newInventory[materialDefId] = current - quantity;
      if (newInventory[materialDefId] <= 0) delete newInventory[materialDefId];
      return { ...prev, kfInventory: newInventory };
    });
    return success;
  }, []);

  const canCraftRecipe = useCallback((recipeDefId: string): boolean => {
    const recipe = kfGetRecipeDef(recipeDefId);
    if (!recipe) return false;
    if (stateRef.current.kfLevel < recipe.requiredLevel) return false;
    for (const [matId, qty] of Object.entries(recipe.ingredients)) {
      if ((stateRef.current.kfInventory[matId] ?? 0) < qty) return false;
    }
    return true;
  }, []);

  const craftRecipe = useCallback((recipeDefId: string): boolean => {
    const recipe = kfGetRecipeDef(recipeDefId);
    if (!recipe) return false;
    if (!canCraftRecipe(recipeDefId)) return false;

    let crafted = false;
    setState(prev => {
      // Verify again under lock
      for (const [matId, qty] of Object.entries(recipe.ingredients)) {
        if ((prev.kfInventory[matId] ?? 0) < qty) return prev;
      }

      crafted = true;
      const newInventory = { ...prev.kfInventory };
      for (const [matId, qty] of Object.entries(recipe.ingredients)) {
        newInventory[matId] = (newInventory[matId] ?? 0) - qty;
        if (newInventory[matId] <= 0) delete newInventory[matId];
      }
      newInventory[recipe.resultMaterial] = (newInventory[recipe.resultMaterial] ?? 0) + recipe.resultQuantity;

      const newKnownRecipes = prev.kfKnownRecipes.includes(recipeDefId)
        ? prev.kfKnownRecipes
        : [...prev.kfKnownRecipes, recipeDefId];

      return { ...prev, kfInventory: newInventory, kfKnownRecipes: newKnownRecipes };
    });

    if (crafted) {
      addXp(recipe.xpReward);
    }
    return crafted;
  }, [canCraftRecipe, addXp]);

  const nicknameFish = useCallback((instanceId: string, nickname: string): boolean => {
    let renamed = false;
    setState(prev => {
      const fish = prev.kfFish[instanceId];
      if (!fish) return prev;
      renamed = true;
      return {
        ...prev,
        kfFish: {
          ...prev.kfFish,
          [instanceId]: { ...fish, nickname },
        },
      };
    });
    return renamed;
  }, []);

  const releaseFish = useCallback((instanceId: string): boolean => {
    let released = false;
    setState(prev => {
      if (!(instanceId in prev.kfFish)) return prev;
      released = true;
      const newFish = { ...prev.kfFish };
      delete newFish[instanceId];
      return { ...prev, kfFish: newFish };
    });
    return released;
  }, []);

  const selectGrove = useCallback((groveDefId: string) => {
    setState(prev => ({ ...prev, kfSelectedGrove: groveDefId }));
  }, []);

  const updateSettings = useCallback((partial: Partial<KfKelpForestState['kfSettings']>) => {
    setState(prev => ({
      ...prev,
      kfSettings: { ...prev.kfSettings, ...partial },
    }));
  }, []);

  // ── Return Object (Pattern A: all constants returned directly) ────────────

  return {
    // ── Constants ──
    KF_COLORS,
    KF_RARITY_COLORS,
    KF_RARITY_BG_COLORS,
    KF_ABILITY_TYPE_COLORS,
    KF_SPECIES,
    KF_FISH,
    KF_GROVES,
    KF_MATERIALS,
    KF_STRUCTURES,
    KF_ABILITIES,
    KF_ACHIEVEMENTS,
    KF_TITLES,
    KF_ARTIFACTS,
    KF_EVENTS,
    KF_RECIPES,
    KF_DAILY_QUESTS,
    KF_XP_TABLE,

    // ── State ──
    kfLevel: state.kfLevel,
    kfXp: state.kfXp,
    kfMaxXp: state.kfMaxXp,
    kfCoins: state.kfCoins,
    kfFish: state.kfFish,
    kfGroves: state.kfGroves,
    kfStructures: state.kfStructures,
    kfArtifacts: state.kfArtifacts,
    kfAbilities: state.kfAbilities,
    kfInventory: state.kfInventory,
    kfCurrentTitle: state.kfCurrentTitle,
    kfClaimedAchievements: state.kfClaimedAchievements,
    kfEventLog: state.kfEventLog,
    kfKnownRecipes: state.kfKnownRecipes,
    kfDailyQuest: state.kfDailyQuest,
    kfDayStreak: state.kfDayStreak,
    kfSelectedGrove: state.kfSelectedGrove,
    kfSettings: state.kfSettings,
    kfStats: state.kfStats,

    // ── Core Actions ──
    catchFish,
    diveGrove,
    buildStructure,
    activateArtifact,
    triggerOceanEvent,
    resetKelpForest,

    // ── Extended Actions ──
    discoverGrove,
    checkAndClaimAchievements,
    useAbility,
    craftRecipe,
    nicknameFish,
    releaseFish,
    selectGrove,
    updateSettings,

    // ── Title System ──
    currentTitleInfo,
    nextTitleInfo,
    titleProgress,

    // ── Stats ──
    statsSummary,
    completionStats,

    // ── Enriched Data ──
    enrichedFish,
    enrichedGroves,
    enrichedStructures,
    enrichedInventory,

    // ── Computed ──
    fishByType,
    fishByRarity,
    abilitiesByType,
    materialsByRarity,
    structuresByCategory,
    availableCandidates,
    affordableStructures,
    unlockableAbilities,
    pendingAchievements,
    recentEventLog,
    totalInventoryValue,

    // ── Convenience Getters ──
    addXp,
    addKfCoins,
    spendKfCoins,
    getKfLevel,
    getKfXp,
    getKfMaxXp,
    getKfCoins,
    getKfXpProgress,
    getFishDefById,
    getGroveDefById,
    getStructureDefById,
    getAbilityDefById,
    getArtifactDefById,
    getMaterialDefById,
    getAchievementDefById,
    getTitleDefById,
    getEventDefById,
    getRecipeDefById,
    isAbilityOnCooldown,
    getAbilityCooldownRemaining,
    isGroveDiscovered,
    isGroveUnlocked,
    isArtifactActivated,
    isStructureBuilt,
    getStructureLevel,
    getStructureUpgradeCost,
    isAchievementClaimed,
    getInventoryCount,
    addToInventory,
    removeFromInventory,
    canCraftRecipe,
  };
}
