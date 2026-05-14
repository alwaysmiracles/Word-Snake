// ============================================================================
// Atlantis Deep Sea Wire — SSR-safe module for the Word Snake game
// All exports use the `at` / `AT_` prefix. Hook-based pattern.
// NO useEffect, NO useRef, NO Math.random, NO browser APIs.
// ============================================================================

import { useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Seeded PRNG — mulberry32
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export type AtRarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type AtZoneId =
  | 'shallow_reefs'
  | 'kelp_forest'
  | 'twilight_zone'
  | 'deep_coral'
  | 'abyssal_plains'
  | 'hydrothermal_vents'
  | 'the_trench'
  | 'atlantis_core';

export interface AtZone {
  id: AtZoneId;
  name: string;
  nameZh: string;
  depthRange: [number, number];
  description: string;
  dangerLevel: number;       // 1-10
  visibility: number;        // 0-100%
  pressureMultiplier: number;
  creatures: string[];
  artifacts: string[];
  color: string;
}

export interface AtCreature {
  id: string;
  name: string;
  nameZh: string;
  rarity: AtRarityTier;
  zone: AtZoneId;
  description: string;
  hp: number;
  speed: number;
  bioluminescent: boolean;
  hostile: boolean;
  xpReward: number;
  coinReward: number;
  emoji: string;
}

export interface AtArtifact {
  id: string;
  name: string;
  nameZh: string;
  rarity: AtRarityTier;
  zone: AtZoneId;
  description: string;
  value: number;
  technology: string | null;
  emoji: string;
}

export interface AtSubmarine {
  id: string;
  name: string;
  nameZh: string;
  maxDepth: number;
  hullStrength: number;
  oxygenCapacity: number;
  speed: number;
  sonarRange: number;
  cost: number;
  unlocked: boolean;
  emoji: string;
}

export interface AtBuilding {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  level: number;
  maxLevel: number;
  buildCost: number;
  upgradeCost: number;
  bonus: string;
  emoji: string;
}

export interface AtQuest {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  objective: string;
  target: number;
  progress: number;
  reward: { xp: number; coins: number; artifactId: string | null };
  completed: boolean;
  accepted: boolean;
}

export interface AtNPC {
  id: string;
  name: string;
  nameZh: string;
  role: string;
  roleZh: string;
  description: string;
  friendship: number;       // 0-100
  questsGiven: string[];
  emoji: string;
}

export interface AtAchievement {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  unlocked: boolean;
  unlockedAt: number | null;
  reward: { xp: number; coins: number; title: string | null };
}

export interface AtTitle {
  id: string;
  name: string;
  nameZh: string;
  requiredLevel: number;
}

export interface AtDailyDive {
  date: string;
  zoneId: AtZoneId;
  targetDepth: number;
  reward: { xp: number; coins: number };
  completed: boolean;
  progress: number;
}

export interface AtDailyExcavation {
  date: string;
  artifactPool: string[];
  digsRemaining: number;
  maxDigs: number;
  artifactsFound: string[];
  completed: boolean;
}

export interface AtSonarPing {
  depth: number;
  x: number;
  y: number;
  type: 'creature' | 'artifact' | 'ruin' | 'nothing' | 'submarine';
  label: string;
  distance: number;
}

export interface AtExpeditionLog {
  id: string;
  timestamp: number;
  zoneId: AtZoneId;
  depth: number;
  event: string;
  details: string;
}

// ---------------------------------------------------------------------------
// Exported Constants — Depth Zones
// ---------------------------------------------------------------------------

export const AT_ZONES: AtZone[] = [
  {
    id: 'shallow_reefs',
    name: 'Shallow Reefs',
    nameZh: '浅海珊瑚礁',
    depthRange: [0, 50],
    description: 'Sun-drenched coral gardens teeming with colorful tropical fish and gentle sea turtles.',
    dangerLevel: 1,
    visibility: 95,
    pressureMultiplier: 1.0,
    creatures: ['clownfish', 'sea_turtle', 'dolphin', 'stingray', 'seahorse'],
    artifacts: ['coral_shard', 'pearl_earring', 'tide_chart'],
    color: '#00bcd4',
  },
  {
    id: 'kelp_forest',
    name: 'Kelp Forest',
    nameZh: '海藻森林',
    depthRange: [50, 200],
    description: 'Towering kelp columns swaying in the current provide shelter for countless species.',
    dangerLevel: 2,
    visibility: 75,
    pressureMultiplier: 1.2,
    creatures: ['sea_otter', 'garibaldi', 'moray_eel', 'giant_bass', 'octopus'],
    artifacts: ['kelp_charm', 'driftwood_map', 'abalone_shell'],
    color: '#4caf50',
  },
  {
    id: 'twilight_zone',
    name: 'Twilight Zone',
    nameZh: '暮光地带',
    depthRange: [200, 500],
    description: 'The last traces of sunlight fade. Strange shadows move through the dim waters.',
    dangerLevel: 4,
    visibility: 40,
    pressureMultiplier: 1.8,
    creatures: ['hatchetfish', 'swordfish', 'jellyfish_glow', 'lanternfish', 'gulper_eel'],
    artifacts: ['glowing_orb', 'twilight_compass', 'shadow_cloak'],
    color: '#5c6bc0',
  },
  {
    id: 'deep_coral',
    name: 'Deep Coral',
    nameZh: '深水珊瑚',
    depthRange: [500, 1000],
    description: 'Ancient deep-water corals form spectacular gardens in perpetual darkness.',
    dangerLevel: 5,
    visibility: 20,
    pressureMultiplier: 2.5,
    creatures: ['coelacanth', 'nautilus', 'sea_fan_worm', 'vampire_squid', 'spider_crab'],
    artifacts: ['fossil_coral', 'deep_pearl', 'ancient_anchor'],
    color: '#e91e63',
  },
  {
    id: 'abyssal_plains',
    name: 'Abyssal Plains',
    nameZh: '深渊平原',
    depthRange: [1000, 2000],
    description: 'An endless flat desert on the ocean floor, punctuated by bizarre life forms.',
    dangerLevel: 7,
    visibility: 5,
    pressureMultiplier: 4.0,
    creatures: ['anglerfish', 'giant_squid', 'dragon_fish', 'abyssal_amphipod', 'tripod_fish'],
    artifacts: ['black_smoker_crystal', 'abyssal_tablet', 'pressure_gauge'],
    color: '#37474f',
  },
  {
    id: 'hydrothermal_vents',
    name: 'Hydrothermal Vents',
    nameZh: '深海热泉',
    depthRange: [2000, 4000],
    description: 'Superheated mineral-rich water erupts from chimneys, sustaining unique ecosystems.',
    dangerLevel: 8,
    visibility: 10,
    pressureMultiplier: 6.0,
    creatures: ['tube_worm', 'yeti_crab', 'pompeii_worm', 'vent_shrimp', 'blind_crawfish'],
    artifacts: ['vent_crystal', 'heat_resistant_alloy', 'primordial_soup_sample'],
    color: '#ff5722',
  },
  {
    id: 'the_trench',
    name: 'The Trench',
    nameZh: '海沟深渊',
    depthRange: [4000, 8000],
    description: 'The deepest scars on Earth. crushing pressure and complete darkness guard ancient secrets.',
    dangerLevel: 9,
    visibility: 2,
    pressureMultiplier: 10.0,
    creatures: ['dumbo_octopus', 'giant_amphipod', 'hadal_snailfish', 'mariana_ghost', 'titan_worm'],
    artifacts: ['trench_shard', 'crushed_time_capsule', 'void_crystal'],
    color: '#1a237e',
  },
  {
    id: 'atlantis_core',
    name: 'Atlantis Core',
    nameZh: '亚特兰蒂斯核心',
    depthRange: [8000, 12000],
    description: 'The legendary heart of Atlantis. Crystalline structures hum with ancient power.',
    dangerLevel: 10,
    visibility: 50,
    pressureMultiplier: 15.0,
    creatures: ['atlantean_guardian', 'crystal_jellyfish', 'leviathan_serpent', 'ghost_whale', 'poseidons_herald'],
    artifacts: ['trident_fragment', 'atlantean_crystal', 'poseidons_seal', 'atlantis_power_core'],
    color: '#ffd600',
  },
];

// ---------------------------------------------------------------------------
// Exported Constants — Sea Creatures (38)
// ---------------------------------------------------------------------------

export const AT_CREATURES: AtCreature[] = [
  // Shallow Reefs (common)
  { id:'clownfish', name:'Clownfish', nameZh:'小丑鱼', rarity:'common', zone:'shallow_reefs', description:'Orange and white stripes dart between anemone tentacles.', hp:10, speed:4, bioluminescent:false, hostile:false, xpReward:5, coinReward:3, emoji:'🐠' },
  { id:'sea_turtle', name:'Sea Turtle', nameZh:'海龟', rarity:'common', zone:'shallow_reefs', description:'A gentle ancient mariner gliding through warm currents.', hp:30, speed:2, bioluminescent:false, hostile:false, xpReward:8, coinReward:5, emoji:'🐢' },
  { id:'dolphin', name:'Bottlenose Dolphin', nameZh:'宽吻海豚', rarity:'uncommon', zone:'shallow_reefs', description:'Intelligent and playful, these acrobats leap through the waves.', hp:40, speed:8, bioluminescent:false, hostile:false, xpReward:15, coinReward:10, emoji:'🐬' },
  { id:'stingray', name:'Blue-spotted Stingray', nameZh:'蓝点 stingray', rarity:'common', zone:'shallow_reefs', description:'Flattened body undulates over sandy bottoms like a living carpet.', hp:25, speed:3, bioluminescent:false, hostile:true, xpReward:10, coinReward:7, emoji:'🦈' },
  { id:'seahorse', name:'Pygmy Seahorse', nameZh:'侏儒海马', rarity:'uncommon', zone:'shallow_reefs', description:'Tiny master of camouflage clinging to coral branches.', hp:5, speed:1, bioluminescent:false, hostile:false, xpReward:12, coinReward:8, emoji:'🪼' },
  // Kelp Forest
  { id:'sea_otter', name:'Sea Otter', nameZh:'海獭', rarity:'common', zone:'kelp_forest', description:'Wraps itself in kelp fronds while sleeping, cracking shellfish on its belly.', hp:20, speed:5, bioluminescent:false, hostile:false, xpReward:10, coinReward:6, emoji:'🦦' },
  { id:'garibaldi', name:'Garibaldi', nameZh:'加利福尼亚红鱼', rarity:'common', zone:'kelp_forest', description:'Vibrant orange fish fiercely guarding its nest in the kelp.', hp:15, speed:6, bioluminescent:false, hostile:true, xpReward:8, coinReward:5, emoji:'🐟' },
  { id:'moray_eel', name:'Green Moray Eel', nameZh:'绿海鳝', rarity:'uncommon', zone:'kelp_forest', description:'Jaws constantly open, revealing rows of needle-like teeth.', hp:45, speed:4, bioluminescent:false, hostile:true, xpReward:18, coinReward:12, emoji:'🐍' },
  { id:'giant_bass', name:'Giant Sea Bass', nameZh:'巨型鲈鱼', rarity:'rare', zone:'kelp_forest', description:'A massive, docile giant that has survived decades in the kelp.', hp:80, speed:2, bioluminescent:false, hostile:false, xpReward:30, coinReward:25, emoji:'🐡' },
  { id:'octopus', name:'Giant Pacific Octopus', nameZh:'北太平洋巨型章鱼', rarity:'rare', zone:'kelp_forest', description:'Nine-brained invertebrate capable of solving puzzles and changing color.', hp:50, speed:6, bioluminescent:false, hostile:true, xpReward:35, coinReward:22, emoji:'🐙' },
  // Twilight Zone
  { id:'hatchetfish', name:'Hatchetfish', nameZh:'斧头鱼', rarity:'common', zone:'twilight_zone', description:'Silver-bodied with upward-facing tubular eyes to spot predators above.', hp:8, speed:3, bioluminescent:true, hostile:false, xpReward:12, coinReward:8, emoji:'🐟' },
  { id:'swordfish', name:'Swordfish', nameZh:'旗鱼', rarity:'uncommon', zone:'twilight_zone', description:'Blazing fast predator with a razor-sharp bill that cuts through water.', hp:60, speed:10, bioluminescent:false, hostile:true, xpReward:25, coinReward:18, emoji:'⚔️' },
  { id:'jellyfish_glow', name:'Bioluminescent Jellyfish', nameZh:'生物发光水母', rarity:'rare', zone:'twilight_zone', description:'Pulses with ethereal blue light, trailing stinging tentacles like comets.', hp:15, speed:2, bioluminescent:true, hostile:true, xpReward:28, coinReward:20, emoji:'🪼' },
  { id:'lanternfish', name:'Lanternfish', nameZh:'灯笼鱼', rarity:'common', zone:'twilight_zone', description:'Tiny fish with a glowing lure dangling from its lower jaw.', hp:6, speed:4, bioluminescent:true, hostile:false, xpReward:10, coinReward:7, emoji:'💡' },
  { id:'gulper_eel', name:'Gulper Eel', nameZh:'吞噬鳗', rarity:'rare', zone:'twilight_zone', description:'Enormous hinged jaws capable of swallowing prey larger than itself.', hp:55, speed:3, bioluminescent:true, hostile:true, xpReward:32, coinReward:22, emoji:'👅' },
  // Deep Coral
  { id:'coelacanth', name:'Coelacanth', nameZh:'腔棘鱼', rarity:'epic', zone:'deep_coral', description:'A living fossil thought extinct for 65 million years. Pale blue scales shimmer.', hp:90, speed:3, bioluminescent:false, hostile:false, xpReward:60, coinReward:45, emoji:'🦴' },
  { id:'nautilus', name:'Chambered Nautilus', nameZh:'鹦鹉螺', rarity:'uncommon', zone:'deep_coral', description:'Living treasure with a spiral shell of perfect mathematical proportions.', hp:25, speed:2, bioluminescent:false, hostile:false, xpReward:22, coinReward:16, emoji:'🐚' },
  { id:'sea_fan_worm', name:'Sea Fan Worm', nameZh:'海扇蠕虫', rarity:'common', zone:'deep_coral', description:'Delicate filter-feeder that builds intricate fan-shaped colonies on coral.', hp:5, speed:0, bioluminescent:true, hostile:false, xpReward:14, coinReward:9, emoji:'🪸' },
  { id:'vampire_squid', name:'Vampire Squid', nameZh:'吸血鬼乌贼', rarity:'rare', zone:'deep_coral', description:'Neither squid nor octopus. Drapes webbed arms over itself like a cloak.', hp:40, speed:4, bioluminescent:true, hostile:true, xpReward:35, coinReward:28, emoji:'🧛' },
  { id:'spider_crab', name:'Japanese Spider Crab', nameZh:'甘氏巨螯蟹', rarity:'uncommon', zone:'deep_coral', description:'Leg span of 3.7 meters. A gentle giant scuttling across the deep seabed.', hp:70, speed:2, bioluminescent:false, hostile:false, xpReward:20, coinReward:15, emoji:'🦀' },
  // Abyssal Plains
  { id:'anglerfish', name:'Anglerfish', nameZh:'鮟鱇鱼', rarity:'rare', zone:'abyssal_plains', description:'Terrifying jaws illuminated by a bioluminescent lure dangling from its head.', hp:65, speed:3, bioluminescent:true, hostile:true, xpReward:40, coinReward:30, emoji:'🪝' },
  { id:'giant_squid', name:'Giant Squid', nameZh:'大王乌贼', rarity:'epic', zone:'abyssal_plains', description:'Eight arms and two longest tentacles. Legends speak of ships pulled under.', hp:120, speed:7, bioluminescent:false, hostile:true, xpReward:80, coinReward:60, emoji:'🦑' },
  { id:'dragon_fish', name:'Black Dragonfish', nameZh:'黑龙鱼', rarity:'rare', zone:'abyssal_plains', description:'Produces red bioluminescence invisible to most deep-sea creatures.', hp:50, speed:6, bioluminescent:true, hostile:true, xpReward:38, coinReward:28, emoji:'🐉' },
  { id:'abyssal_amphipod', name:'Abyssal Amphipod', nameZh:'深渊端足类', rarity:'common', zone:'abyssal_plains', description:'Translucent crustacean scavenging marine snow on the abyssal floor.', hp:3, speed:2, bioluminescent:false, hostile:false, xpReward:15, coinReward:10, emoji:'🦐' },
  { id:'tripod_fish', name:'Tripod Fish', nameZh:'三脚鱼', rarity:'uncommon', zone:'abyssal_plains', description:'Stands on elongated fin rays like stilts, facing the current to catch falling food.', hp:12, speed:1, bioluminescent:false, hostile:false, xpReward:20, coinReward:14, emoji:'🦿' },
  // Hydrothermal Vents
  { id:'tube_worm', name:'Giant Tube Worm', nameZh:'巨型管虫', rarity:'uncommon', zone:'hydrothermal_vents', description:'Two-meter red plumes harboring chemosynthetic bacteria at superheated vents.', hp:15, speed:0, bioluminescent:false, hostile:false, xpReward:25, coinReward:18, emoji:'🪱' },
  { id:'yeti_crab', name:'Yeti Crab', nameZh:'雪人蟹', rarity:'rare', zone:'hydrothermal_vents', description:'Furry claws cultivate bacteria for food near boiling vent chimneys.', hp:20, speed:2, bioluminescent:false, hostile:false, xpReward:30, coinReward:22, emoji:'🦀' },
  { id:'pompeii_worm', name:'Pompeii Worm', nameZh:'庞贝蠕虫', rarity:'uncommon', zone:'hydrothermal_vents', description:'The most heat-tolerant animal known, thriving at 80°C near vent openings.', hp:5, speed:1, bioluminescent:false, hostile:false, xpReward:22, coinReward:16, emoji:'🐛' },
  { id:'vent_shrimp', name:'Vent Shrimp', nameZh:'热泉虾', rarity:'common', zone:'hydrothermal_vents', description:'Swarm in thousands around black smoker chimneys, grazing bacterial mats.', hp:2, speed:3, bioluminescent:false, hostile:false, xpReward:16, coinReward:11, emoji:'🦐' },
  { id:'blind_crawfish', name:'Blind Cave Crawfish', nameZh:'盲洞穴小龙虾', rarity:'rare', zone:'hydrothermal_vents', description:'Eyeless white crustacean navigating vent fields by chemical sense alone.', hp:18, speed:2, bioluminescent:false, hostile:true, xpReward:28, coinReward:20, emoji:'🦞' },
  // The Trench
  { id:'dumbo_octopus', name:'Dumbo Octopus', nameZh:'小飞象章鱼', rarity:'epic', zone:'the_trench', description:'Ear-like fins flap gracefully in the crushing dark. Deepest-living octopus known.', hp:35, speed:3, bioluminescent:true, hostile:false, xpReward:70, coinReward:55, emoji:'🐘' },
  { id:'giant_amphipod', name:'Giant Amphipod', nameZh:'巨型端足类', rarity:'rare', zone:'the_trench', description:'Supersized version of the tiny crustacean, reaching 30 cm in the hadal zone.', hp:40, speed:4, bioluminescent:false, hostile:true, xpReward:42, coinReward:32, emoji:'🦐' },
  { id:'hadal_snailfish', name:'Hadal Snailfish', nameZh:'深渊狮子鱼', rarity:'rare', zone:'the_trench', description:'Ghostly translucent fish at the very bottom of the ocean, depth record holder.', hp:20, speed:2, bioluminescent:false, hostile:false, xpReward:45, coinReward:35, emoji:'👻' },
  { id:'mariana_ghost', name:'Mariana Ghost Fish', nameZh:'马里亚纳幽灵鱼', rarity:'legendary', zone:'the_trench', description:'Semi-transparent predator that materializes from the darkness without warning.', hp:100, speed:8, bioluminescent:true, hostile:true, xpReward:120, coinReward:90, emoji:'👻' },
  { id:'titan_worm', name:'Titan Worm', nameZh:'泰坦蠕虫', rarity:'legendary', zone:'the_trench', description:'A segmented behemoth 10 meters long burrowing through trench sediments.', hp:150, speed:2, bioluminescent:false, hostile:true, xpReward:150, coinReward:110, emoji:'🐛' },
  // Atlantis Core
  { id:'atlantean_guardian', name:'Atlantean Guardian', nameZh:'亚特兰蒂斯守卫', rarity:'legendary', zone:'atlantis_core', description:'Crystalline construct animated by ancient Atlantean technology.', hp:200, speed:5, bioluminescent:true, hostile:true, xpReward:200, coinReward:150, emoji:'🗿' },
  { id:'crystal_jellyfish', name:'Crystal Jellyfish', nameZh:'水晶水母', rarity:'epic', zone:'atlantis_core', description:'Translucent body refracts light into prismatic displays, harmless but mesmerizing.', hp:10, speed:1, bioluminescent:true, hostile:false, xpReward:55, coinReward:42, emoji:'💎' },
  { id:'leviathan_serpent', name:'Leviathan Serpent', nameZh:'利维坦巨蛇', rarity:'legendary', zone:'atlantis_core', description:'Colossal sea serpent encircling the core, guardian of Poseidon\'s throne.', hp:300, speed:6, bioluminescent:true, hostile:true, xpReward:300, coinReward:250, emoji:'🐍' },
  { id:'ghost_whale', name:'Ghost Whale', nameZh:'幽灵鲸', rarity:'epic', zone:'atlantis_core', description:'Translucent cetacean that phases through solid rock, singing ancient melodies.', hp:250, speed:4, bioluminescent:true, hostile:false, xpReward:100, coinReward:75, emoji:'🐋' },
  { id:'poseidons_herald', name:'Poseidon\'s Herald', nameZh:'波塞冬的传令官', rarity:'legendary', zone:'atlantis_core', description:'A radiant fish-like being that speaks in riddles, herald of the sea god.', hp:180, speed:7, bioluminescent:true, hostile:false, xpReward:250, coinReward:200, emoji:'🔱' },
];

// ---------------------------------------------------------------------------
// Exported Constants — Artifacts (22)
// ---------------------------------------------------------------------------

export const AT_ARTIFACTS: AtArtifact[] = [
  { id:'coral_shard', name:'Polished Coral Shard', nameZh:'抛光珊瑚碎片', rarity:'common', zone:'shallow_reefs', description:'A smooth fragment of rainbow coral, warm to the touch.', value:50, technology:null, emoji:'🪸' },
  { id:'pearl_earring', name:'Pearl Earring', nameZh:'珍珠耳环', rarity:'uncommon', zone:'shallow_reefs', description:'A single iridescent pearl set in corroded bronze, possibly from a shipwreck.', value:200, technology:null, emoji:'📿' },
  { id:'tide_chart', name:'Ancient Tide Chart', nameZh:'古代潮汐图', rarity:'rare', zone:'shallow_reefs', description:'A waterproof parchment showing tidal patterns with annotations in unknown script.', value:500, technology:'tide_prediction', emoji:'📜' },
  { id:'kelp_charm', name:'Kelp Charm', nameZh:'海藻护符', rarity:'common', zone:'kelp_forest', description:'A braided kelp talisman that never decays, emitting a faint forest scent.', value:60, technology:null, emoji:'🌿' },
  { id:'driftwood_map', name:'Driftwood Map', nameZh:'浮木地图', rarity:'uncommon', zone:'kelp_forest', description:'Charcoal markings on sun-bleached driftwood showing a route to deeper waters.', value:250, technology:'depth_navigation', emoji:'🗺️' },
  { id:'abalone_shell', name:'Iridescent Abalone Shell', nameZh:'鲍鱼壳', rarity:'rare', zone:'kelp_forest', description:'Shell interior swirls with every color, used by ancient peoples as currency.', value:600, technology:null, emoji:'🐚' },
  { id:'glowing_orb', name:'Glowing Orb', nameZh:'发光球体', rarity:'uncommon', zone:'twilight_zone', description:'A sphere of captured bioluminescence that illuminates without heat.', value:350, technology:'portable_light', emoji:'🔮' },
  { id:'twilight_compass', name:'Twilight Compass', nameZh:'暮光指南针', rarity:'rare', zone:'twilight_zone', description:'Points toward the strongest bioluminescent source, useful for navigation in darkness.', value:700, technology:'sonar_booster', emoji:'🧭' },
  { id:'shadow_cloak', name:'Shadow Cloak', nameZh:'暗影斗篷', rarity:'epic', zone:'twilight_zone', description:'Woven from deep-sea silk, renders the wearer nearly invisible in low light.', value:1500, technology:'stealth_mode', emoji:'🧥' },
  { id:'fossil_coral', name:'Petrified Coral Fossil', nameZh:'石化珊瑚化石', rarity:'uncommon', zone:'deep_coral', description:'Million-year-old coral preserved in limestone, containing microscopic fossils.', value:400, technology:null, emoji:'🪨' },
  { id:'deep_pearl', name:'Abyssal Black Pearl', nameZh:'深渊黑珍珠', rarity:'epic', zone:'deep_coral', description:'A pearl of perfect darkness that seems to absorb all light around it.', value:2000, technology:'pressure_shield', emoji:'⚫' },
  { id:'ancient_anchor', name:'Atlantean Anchor', nameZh:'亚特兰蒂斯船锚', rarity:'rare', zone:'deep_coral', description:'An impossibly well-preserved anchor inscribed with symbols matching no known civilization.', value:900, technology:null, emoji:'⚓' },
  { id:'black_smoker_crystal', name:'Black Smoker Crystal', nameZh:'黑烟囱晶体', rarity:'rare', zone:'abyssal_plains', description:'A mineral formation grown from superheated vent water, humming with geothermal energy.', value:800, technology:'thermal_generator', emoji:'🔥' },
  { id:'abyssal_tablet', name:'Abyssal Stone Tablet', nameZh:'深渊石碑', rarity:'epic', zone:'abyssal_plains', description:'A basalt slab with cuneiform-like script describing a great flood.', value:1800, technology:'ancient_language', emoji:'🗿' },
  { id:'pressure_gauge', name:'Orichalcum Pressure Gauge', nameZh:'山铜压力计', rarity:'legendary', zone:'abyssal_plains', description:'A device of unknown metal that measures pressure with impossible precision.', value:3500, technology:'pressure_management', emoji:'⚙️' },
  { id:'vent_crystal', name:'Hydrothermal Crystal', nameZh:'热泉水晶', rarity:'uncommon', zone:'hydrothermal_vents', description:'Grown from mineral-rich vent water, contains trapped micro-organisms.', value:450, technology:null, emoji:'💎' },
  { id:'heat_resistant_alloy', name:'Heat-Resistant Alloy', nameZh:'耐热合金', rarity:'epic', zone:'hydrothermal_vents', description:'A metal sample that withstands extreme temperatures, unlike anything modern.', value:2500, technology:'hull_upgrade', emoji:'🔩' },
  { id:'primordial_soup_sample', name:'Primordial Soup Sample', nameZh:'原始汤样本', rarity:'legendary', zone:'hydrothermal_vents', description:'A vial of vent fluid containing organisms that may resemble earliest life.', value:4000, technology:'origin_of_life', emoji:'🧪' },
  { id:'trench_shard', name:'Trench Depth Shard', nameZh:'海沟碎片', rarity:'rare', zone:'the_trench', description:'A crystalline fragment that glows under extreme pressure, found only in the deepest trenches.', value:1200, technology:'depth_sensor', emoji:'✨' },
  { id:'crushed_time_capsule', name:'Crushed Time Capsule', nameZh:'压碎的时间胶囊', rarity:'epic', zone:'the_trench', description:'A reinforced container from the future, its contents barely surviving the pressure.', value:3000, technology:'future_tech', emoji:'📦' },
  { id:'void_crystal', name:'Void Crystal', nameZh:'虚空水晶', rarity:'legendary', zone:'the_trench', description:'Absorbs all electromagnetic radiation. Researchers cannot explain its properties.', value:5000, technology:'void_energy', emoji:'🫧' },
  { id:'trident_fragment', name:'Trident Fragment', nameZh:'三叉戟碎片', rarity:'legendary', zone:'atlantis_core', description:'One prong of a divine weapon, crackling with oceanic energy.', value:8000, technology:'trident_power', emoji:'🔱' },
  { id:'atlantean_crystal', name:'Atlantean Power Crystal', nameZh:'亚特兰蒂斯能量水晶', rarity:'legendary', zone:'atlantis_core', description:'The heart of Atlantis. Generates infinite clean energy from ocean currents.', value:15000, technology:'infinite_energy', emoji:'💠' },
  { id:'poseidons_seal', name:'Poseidon\'s Seal', nameZh:'波塞冬之印', rarity:'legendary', zone:'atlantis_core', description:'A wax seal stamped with the trident of Poseidon, granting passage to the inner sanctum.', value:10000, technology:'divine_protection', emoji:'🏛️' },
  { id:'atlantis_power_core', name:'Atlantis Power Core', nameZh:'亚特兰蒂斯动力核心', rarity:'legendary', zone:'atlantis_core', description:'The central reactor of the lost civilization, still humming after 10,000 years.', value:20000, technology:'atlantis_reborn', emoji:'⚡' },
];

// ---------------------------------------------------------------------------
// Exported Constants — Submarines (8)
// ---------------------------------------------------------------------------

export const AT_SUBMARINES: AtSubmarine[] = [
  { id:'explorer_pod', name:'Explorer Pod', nameZh:'探索舱', maxDepth:200, hullStrength:50, oxygenCapacity:100, speed:3, sonarRange:50, cost:0, unlocked:true, emoji:'🔵' },
  { id:'deep_diver', name:'Deep Diver', nameZh:'深海潜水器', maxDepth:1000, hullStrength:120, oxygenCapacity:200, speed:4, sonarRange:100, cost:2000, unlocked:false, emoji:'🟢' },
  { id:'crystal_sub', name:'Crystal Sub', nameZh:'水晶潜艇', maxDepth:3000, hullStrength:200, oxygenCapacity:350, speed:5, sonarRange:200, cost:8000, unlocked:false, emoji:'🟣' },
  { id:'leviathan', name:'Leviathan', nameZh:'利维坦号', maxDepth:6000, hullStrength:350, oxygenCapacity:500, speed:6, sonarRange:350, cost:20000, unlocked:false, emoji:'🔴' },
  { id:'neptunes_chariot', name:'Neptune\'s Chariot', nameZh:'海神战车', maxDepth:9000, hullStrength:500, oxygenCapacity:700, speed:7, sonarRange:500, cost:50000, unlocked:false, emoji:'🟡' },
  { id:'abyss_walker', name:'Abyss Walker', nameZh:'深渊行者', maxDepth:11000, hullStrength:700, oxygenCapacity:900, speed:5, sonarRange:600, cost:100000, unlocked:false, emoji:'⚫' },
  { id:'trident_class', name:'Trident Class', nameZh:'三叉戟级', maxDepth:12000, hullStrength:1000, oxygenCapacity:1200, speed:8, sonarRange:800, cost:250000, unlocked:false, emoji:'🔱' },
  { id:'atlantis_vessel', name:'Atlantis Vessel', nameZh:'亚特兰蒂斯方舟', maxDepth:15000, hullStrength:2000, oxygenCapacity:2000, speed:10, sonarRange:1000, cost:500000, unlocked:false, emoji:'🏛️' },
];

// ---------------------------------------------------------------------------
// Exported Constants — Buildings (8)
// ---------------------------------------------------------------------------

export const AT_BUILDING_TEMPLATES: Omit<AtBuilding, 'level'>[] = [
  { id:'temple_of_poseidon', name:'Temple of Poseidon', nameZh:'波塞冬神殿', description:'The central shrine where divers offer tribute for safe passage.', maxLevel:10, buildCost:5000, upgradeCost:1500, bonus:'oxygen_regen', emoji:'🏛️' },
  { id:'crystal_palace', name:'Crystal Palace', nameZh:'水晶宫殿', description:'A translucent structure that amplifies sonar signals across all zones.', maxLevel:10, buildCost:8000, upgradeCost:2500, bonus:'sonar_boost', emoji:'💎' },
  { id:'sea_garden', name:'Sea Garden', nameZh:'海底花园', description:'Cultivates rare bioluminescent flora that heals divers and calms creatures.', maxLevel:8, buildCost:3000, upgradeCost:1000, bonus:'hp_regen', emoji:'🌿' },
  { id:'artifact_museum', name:'Artifact Museum', nameZh:'文物博物馆', description:'Displays collected artifacts, increasing their value and unlocking lore.', maxLevel:10, buildCost:6000, upgradeCost:2000, bonus:'artifact_value', emoji:'🏛️' },
  { id:'research_lab', name:'Research Laboratory', nameZh:'研究实验室', description:'Analyzes artifacts and creatures to unlock technology and bonuses.', maxLevel:8, buildCost:10000, upgradeCost:3000, bonus:'tech_unlock', emoji:'🔬' },
  { id:'submarine_dock', name:'Submarine Dock', nameZh:'潜艇船坞', description:'Houses and upgrades submarines, reducing maintenance costs.', maxLevel:8, buildCost:7000, upgradeCost:2000, bonus:'sub_discount', emoji:'🚢' },
  { id:'sonar_tower', name:'Sonar Tower', nameZh:'声纳塔', description:'A massive sonar array that maps the entire ocean floor in real time.', maxLevel:10, buildCost:12000, upgradeCost:4000, bonus:'depth_scan', emoji:'📡' },
  { id:'trident_forge', name:'Trident Forge', nameZh:'三叉戟锻造炉', description:'Forges legendary equipment from rare materials found in the deep.', maxLevel:5, buildCost:20000, upgradeCost:8000, bonus:'craft_legendary', emoji:'🔨' },
];

// ---------------------------------------------------------------------------
// Exported Constants — Quests (10)
// ---------------------------------------------------------------------------

export const AT_QUEST_TEMPLATES: Omit<AtQuest, 'progress' | 'completed' | 'accepted'>[] = [
  { id:'q_first_dive', name:'First Dive', nameZh:'初次下潜', description:'Complete your very first deep sea dive.', objective:'dive_count', target:1, reward:{ xp:50, coins:100, artifactId:'coral_shard' } },
  { id:'q_creature_catalog', name:'Creature Catalog', nameZh:'生物图鉴', description:'Discover 10 different sea creatures across all zones.', objective:'creatures_discovered', target:10, reward:{ xp:200, coins:500, artifactId:'tide_chart' } },
  { id:'q_abyssal_explorer', name:'Abyssal Explorer', nameZh:'深渊探索者', description:'Reach a depth of 2000 meters or more.', objective:'max_depth_reached', target:2000, reward:{ xp:300, coins:800, artifactId:'abyssal_tablet' } },
  { id:'q_artifact_hunter', name:'Artifact Hunter', nameZh:'文物猎人', description:'Collect 15 artifacts from the deep.', objective:'artifacts_collected', target:15, reward:{ xp:400, coins:1000, artifactId:'deep_pearl' } },
  { id:'q_vent_pioneer', name:'Vent Pioneer', nameZh:'热泉先驱', description:'Explore the Hydrothermal Vents zone and survive.', objective:'zone_visited', target:1, reward:{ xp:500, coins:1500, artifactId:'primordial_soup_sample' } },
  { id:'q_trench_dive', name:'Into the Trench', nameZh:'深入海沟', description:'Descend below 5000 meters into The Trench.', objective:'max_depth_reached', target:5000, reward:{ xp:600, coins:2000, artifactId:'void_crystal' } },
  { id:'q_building_master', name:'Building Master', nameZh:'建筑大师', description:'Build and upgrade 5 different Atlantis structures.', objective:'buildings_upgraded', target:5, reward:{ xp:500, coins:2500, artifactId:null } },
  { id:'q_friend_of_the_deep', name:'Friend of the Deep', nameZh:'深渊之友', description:'Reach maximum friendship with 3 different NPCs.', objective:'npc_max_friendship', target:3, reward:{ xp:700, coins:3000, artifactId:'poseidons_seal' } },
  { id:'q_legendary_catch', name:'Legendary Catch', nameZh:'传奇捕获', description:'Encounter and document 3 legendary creatures.', objective:'legendary_encounters', target:3, reward:{ xp:800, coins:4000, artifactId:'trident_fragment' } },
  { id:'q_atlantis_awakened', name:'Atlantis Awakened', nameZh:'亚特兰蒂斯觉醒', description:'Discover the Atlantis Core zone and find the Power Core artifact.', objective:'find_power_core', target:1, reward:{ xp:2000, coins:10000, artifactId:'atlantis_power_core' } },
];

// ---------------------------------------------------------------------------
// Exported Constants — NPCs (6)
// ---------------------------------------------------------------------------

export const AT_NPC_TEMPLATES: Omit<AtNPC, 'friendship'>[] = [
  { id:'npc_scholar', name:'Dr. Marina Oceanus', nameZh:'深海学者', role:'Deep Sea Scholar', roleZh:'深海学者', description:'Brilliant marine biologist who has devoted her life to cataloging deep-sea life.', friendship:0, questsGiven:['q_creature_catalog', 'q_vent_pioneer'], emoji:'👩‍🔬' },
  { id:'npc_captain', name:'Captain Ironbeard', nameZh:'潜水船长', role:'Submarine Captain', roleZh:'潜水船长', description:'Weathered submariner with decades of experience and countless tall tales.', friendship:0, questsGiven:['q_first_dive', 'q_abyssal_explorer'], emoji:'👨‍✈️' },
  { id:'npc_elder', name:'Elder Coralith', nameZh:'人鱼长老', role:'Merfolk Elder', roleZh:'人鱼长老', description:'Ancient merfolk elder who guards the oral history of Atlantis.', friendship:0, questsGiven:['q_artifact_hunter', 'q_atlantis_awakened'], emoji:'🧜‍♀️' },
  { id:'npc_priest', name:'High Priest Thalos', nameZh:'海神祭司', role:'Sea Priest', roleZh:'海神祭司', description:'Mystical figure who communes with ocean spirits and ancient gods.', friendship:0, questsGiven:['q_trench_dive', 'q_legendary_catch'], emoji:'🧙' },
  { id:'npc_craftsman', name:'Grit the Builder', nameZh:'珊瑚工匠', role:'Coral Craftsman', roleZh:'珊瑚工匠', description:'Skilled architect who constructs and upgrades underwater structures.', friendship:0, questsGiven:['q_building_master'], emoji:'👷' },
  { id:'npc_watcher', name:'The Abyssal Watcher', nameZh:'深渊守望者', role:'Abyssal Watcher', roleZh:'深渊守望者', description:'Mysterious entity dwelling in the deepest trench, neither friend nor foe.', friendship:0, questsGiven:['q_friend_of_the_deep'], emoji:'👁️' },
];

// ---------------------------------------------------------------------------
// Exported Constants — Achievements (15)
// ---------------------------------------------------------------------------

export const AT_ACHIEVEMENT_TEMPLATES: Omit<AtAchievement, 'unlocked' | 'unlockedAt'>[] = [
  { id:'ach_first_splash', name:'First Splash', nameZh:'初次入水', description:'Complete your first dive below 50 meters.', reward:{ xp:25, coins:50, title:null } },
  { id:'ach_trench_veteran', name:'Trench Veteran', nameZh:'海沟老兵', description:'Survive a dive below 6000 meters.', reward:{ xp:500, coins:1000, title:null } },
  { id:'ach_creature_master', name:'Creature Master', nameZh:'生物大师', description:'Discover 30 unique sea creatures.', reward:{ xp:600, coins:1500, title:null } },
  { id:'ach_artifact_legend', name:'Artifact Legend', nameZh:'文物传奇', description:'Collect 20 artifacts of epic or legendary rarity.', reward:{ xp:800, coins:2000, title:null } },
  { id:'ach_submarine_collector', name:'Fleet Admiral', nameZh:'舰队司令', description:'Own all 8 submarine types.', reward:{ xp:1000, coins:5000, title:null } },
  { id:'ach_building_empire', name:'Underwater Empire', nameZh:'水下帝国', description:'Build all 8 Atlantis structures to max level.', reward:{ xp:1200, coins:8000, title:null } },
  { id:'ach_quest_hero', name:'Quest Hero', nameZh:'任务英雄', description:'Complete all 10 quests.', reward:{ xp:1500, coins:10000, title:null } },
  { id:'ach_max_friendship', name:'Beloved Diver', nameZh:'深受爱戴的潜水员', description:'Reach max friendship with all 6 NPCs.', reward:{ xp:1000, coins:5000, title:null } },
  { id:'ach_legendary_10', name:'Legendary Ten', nameZh:'传奇十连', description:'Encounter 10 legendary creatures total.', reward:{ xp:2000, coins:8000, title:null } },
  { id:'ach_daily_7', name:'Week of Dives', nameZh:'潜水一周', description:'Complete 7 daily deep dives.', reward:{ xp:300, coins:700, title:null } },
  { id:'ach_excavation_master', name:'Excavation Master', nameZh:'挖掘大师', description:'Find 10 artifacts through daily excavations.', reward:{ xp:500, coins:1200, title:null } },
  { id:'ach_level_50', name:'Maximum Depth', nameZh:'极限深度', description:'Reach diver level 50.', reward:{ xp:5000, coins:20000, title:null } },
  { id:'ach_core_discovery', name:'Core Discovery', nameZh:'核心发现', description:'Reach the Atlantis Core zone.', reward:{ xp:3000, coins:15000, title:null } },
  { id:'ach_sonar_master', name:'Sonar Master', nameZh:'声纳大师', description:'Perform 50 sonar scans.', reward:{ xp:400, coins:1000, title:null } },
  { id:'ach_rich_diver', name:'Rich Diver', nameZh:'富裕潜水员', description:'Accumulate 100,000 coins.', reward:{ xp:1000, coins:5000, title:null } },
];

// ---------------------------------------------------------------------------
// Exported Constants — Titles (8)
// ---------------------------------------------------------------------------

export const AT_TITLES: AtTitle[] = [
  { id:'title_surface', name:'Surface Diver', nameZh:'水面潜水员', requiredLevel:1 },
  { id:'title_coral', name:'Coral Explorer', nameZh:'珊瑚探索者', requiredLevel:5 },
  { id:'title_abyssal', name:'Abyssal Diver', nameZh:'深渊潜水员', requiredLevel:10 },
  { id:'title_vent', name:'Vent Pioneer', nameZh:'热泉先驱', requiredLevel:20 },
  { id:'title_trench', name:'Trench Walker', nameZh:'海沟行者', requiredLevel:30 },
  { id:'title_atlantean', name:'Atlantean Scout', nameZh:'亚特兰蒂斯斥候', requiredLevel:38 },
  { id:'title_guardian', name:'Guardian of the Deep', nameZh:'深海守护者', requiredLevel:45 },
  { id:'title_lord', name:'Lord of Atlantis', nameZh:'亚特兰蒂斯之主', requiredLevel:50 },
];

// ---------------------------------------------------------------------------
// Exported Constants — XP Table
// ---------------------------------------------------------------------------

export const AT_XP_TABLE: number[] = [];
for (let i = 0; i <= 50; i++) {
  AT_XP_TABLE.push(Math.floor(100 * Math.pow(1.25, i)));
}

// ---------------------------------------------------------------------------
// Exported Constants — Rarity colors
// ---------------------------------------------------------------------------

export const AT_RARITY_COLORS: Record<AtRarityTier, string> = {
  common: '#9e9e9e',
  uncommon: '#4caf50',
  rare: '#2196f3',
  epic: '#9c27b0',
  legendary: '#ff9800',
};

// ---------------------------------------------------------------------------
// State Interface
// ---------------------------------------------------------------------------

export interface AtAtlantisDeepState {
  initialized: boolean;
  version: number;
  // Player
  diverName: string;
  level: number;
  xp: number;
  totalXp: number;
  coins: number;
  currentTitleId: string;
  // Depth & Zone
  currentDepth: number;
  maxDepthReached: number;
  currentZoneId: AtZoneId;
  discoveredZoneIds: AtZoneId[];
  // Oxygen & Pressure
  oxygen: number;
  maxOxygen: number;
  pressure: number;
  hullIntegrity: number;
  // Sonar
  sonarLevel: number;
  sonarScansCount: number;
  lastSonarPings: AtSonarPing[];
  // Submarine
  currentSubmarineId: string;
  ownedSubmarineIds: string[];
  // Creatures
  discoveredCreatureIds: string[];
  legendaryEncounterCount: number;
  encounterCount: number;
  // Artifacts
  collectedArtifactIds: string[];
  artifactExcavationCount: number;
  // Buildings
  buildings: AtBuilding[];
  // Quests
  quests: AtQuest[];
  questsCompleted: number;
  // NPCs
  npcs: AtNPC[];
  // Achievements
  achievements: AtAchievement[];
  achievementsUnlocked: number;
  // Daily
  dailyDive: AtDailyDive | null;
  dailyExcavation: AtDailyExcavation | null;
  dailyDivesCompleted: number;
  dailyExcavationArtifacts: number;
  // Technology
  unlockedTechnologies: string[];
  // Expedition Log
  expeditionLog: AtExpeditionLog[];
  // Stats
  diveCount: number;
  totalDistanceTraveled: number;
  totalArtifactsCollected: number;
  // PRNG seed
  seed: number;
}

// ---------------------------------------------------------------------------
// Initial State Factory
// ---------------------------------------------------------------------------

function createInitialState(seed?: number): AtAtlantisDeepState {
  const rng = mulberry32(seed ?? 42);
  const todayStr = 'day_1'; // Placeholder, real date not available

  const quests: AtQuest[] = AT_QUEST_TEMPLATES.map((q) => ({
    ...q,
    progress: 0,
    completed: false,
    accepted: false,
  }));

  const npcs: AtNPC[] = AT_NPC_TEMPLATES.map((n) => ({
    ...n,
    friendship: 0,
  }));

  const achievements: AtAchievement[] = AT_ACHIEVEMENT_TEMPLATES.map((a) => ({
    ...a,
    unlocked: false,
    unlockedAt: null,
  }));

  const buildings: AtBuilding[] = AT_BUILDING_TEMPLATES.map((b) => ({
    ...b,
    level: 0,
  }));

  // Pre-generate daily dive
  const zoneIds = AT_ZONES.map((z) => z.id);
  const dailyZone = zoneIds[Math.floor(rng() * zoneIds.length)];

  const dailyDive: AtDailyDive = {
    date: todayStr,
    zoneId: dailyZone,
    targetDepth: Math.floor(rng() * 3000) + 500,
    reward: { xp: 150, coins: 300 },
    completed: false,
    progress: 0,
  };

  // Pre-generate daily excavation
  const zoneArtifacts = AT_ARTIFACTS.filter((a) => a.zone === dailyZone);
  const excavationPool: string[] = zoneArtifacts.map((a) => a.id);

  const dailyExcavation: AtDailyExcavation = {
    date: todayStr,
    artifactPool: excavationPool,
    digsRemaining: 5,
    maxDigs: 5,
    artifactsFound: [],
    completed: false,
  };

  return {
    initialized: true,
    version: 1,
    diverName: 'Diver',
    level: 1,
    xp: 0,
    totalXp: 0,
    coins: 500,
    currentTitleId: 'title_surface',
    currentDepth: 0,
    maxDepthReached: 0,
    currentZoneId: 'shallow_reefs',
    discoveredZoneIds: ['shallow_reefs'],
    oxygen: 100,
    maxOxygen: 100,
    pressure: 1.0,
    hullIntegrity: 100,
    sonarLevel: 1,
    sonarScansCount: 0,
    lastSonarPings: [],
    currentSubmarineId: 'explorer_pod',
    ownedSubmarineIds: ['explorer_pod'],
    discoveredCreatureIds: [],
    legendaryEncounterCount: 0,
    encounterCount: 0,
    collectedArtifactIds: [],
    artifactExcavationCount: 0,
    buildings,
    quests,
    questsCompleted: 0,
    npcs,
    achievements,
    achievementsUnlocked: 0,
    dailyDive,
    dailyExcavation,
    dailyDivesCompleted: 0,
    dailyExcavationArtifacts: 0,
    unlockedTechnologies: [],
    expeditionLog: [],
    diveCount: 0,
    totalDistanceTraveled: 0,
    totalArtifactsCollected: 0,
    seed: seed ?? 42,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export default function useAtlantisDeep(initialSeed?: number) {
  const [state, setState] = useState<AtAtlantisDeepState>(() =>
    createInitialState(initialSeed),
  );

  // ---- State Accessors ----

  const atGetState = useCallback(() => state, [state]);

  const atGetLevel = useCallback(() => state.level, [state]);

  const atGetExperience = useCallback(() => state.xp, [state]);

  const atGetTotalExperience = useCallback(() => state.totalXp, [state]);

  const atGetTitle = useCallback(() => {
    const title = AT_TITLES.find((t) => t.id === state.currentTitleId);
    return title ?? AT_TITLES[0];
  }, [state]);

  const atGetDepth = useCallback(() => state.currentDepth, [state]);

  const atGetMaxDepth = useCallback(() => state.maxDepthReached, [state]);

  const atGetCurrentZone = useCallback(() => {
    return AT_ZONES.find((z) => z.id === state.currentZoneId) ?? AT_ZONES[0];
  }, [state]);

  const atGetOxygen = useCallback(() => state.oxygen, [state]);

  const atGetMaxOxygen = useCallback(() => state.maxOxygen, [state]);

  const atGetPressure = useCallback(() => state.pressure, [state]);

  const atGetHullIntegrity = useCallback(() => state.hullIntegrity, [state]);

  const atGetCoins = useCallback(() => state.coins, [state]);

  const atGetSonarLevel = useCallback(() => state.sonarLevel, [state]);

  const atGetSonarScans = useCallback(() => state.sonarScansCount, [state]);

  const atGetDiscoveredZones = useCallback(() => {
    return AT_ZONES.filter((z) => state.discoveredZoneIds.includes(z.id));
  }, [state]);

  const atGetDiscoveredCreatures = useCallback(() => {
    return AT_CREATURES.filter((c) =>
      state.discoveredCreatureIds.includes(c.id),
    );
  }, [state]);

  const atGetCollectedArtifacts = useCallback(() => {
    return AT_ARTIFACTS.filter((a) =>
      state.collectedArtifactIds.includes(a.id),
    );
  }, [state]);

  const atGetUnlockedTechnologies = useCallback(
    () => state.unlockedTechnologies,
    [state],
  );

  const atGetNextLevelXP = useCallback(() => {
    if (state.level >= 50) return Infinity;
    return AT_XP_TABLE[state.level + 1] ?? Infinity;
  }, [state]);

  const atGetLevelProgress = useCallback(() => {
    const current = AT_XP_TABLE[state.level] ?? 0;
    const next = AT_XP_TABLE[state.level + 1] ?? Infinity;
    if (next === Infinity) return 1;
    return Math.min(1, (state.xp - current) / (next - current));
  }, [state]);

  // ---- Zone Helpers ----

  const atGetZoneInfo = useCallback(
    (zoneId: AtZoneId) => AT_ZONES.find((z) => z.id === zoneId) ?? null,
    [state],
  );

  const atGetZoneCreatures = useCallback(
    (zoneId: AtZoneId) => AT_CREATURES.filter((c) => c.zone === zoneId),
    [state],
  );

  const atGetZoneArtifacts = useCallback(
    (zoneId: AtZoneId) => AT_ARTIFACTS.filter((a) => a.zone === zoneId),
    [state],
  );

  const atGetZoneDanger = useCallback(
    (zoneId: AtZoneId) => {
      const zone = AT_ZONES.find((z) => z.id === zoneId);
      return zone?.dangerLevel ?? 0;
    },
    [state],
  );

  // ---- Depth & Diving ----

  const atDiveDeep = useCallback(
    (targetDepth: number) => {
      const sub = AT_SUBMARINES.find(
        (s) => s.id === state.currentSubmarineId,
      );
      if (!sub) return state;
      const maxAllowed = sub.maxDepth;
      const clamped = Math.min(targetDepth, maxAllowed);
      const zone =
        [...AT_ZONES].reverse().find(
          (z) => clamped >= z.depthRange[0],
        ) ?? AT_ZONES[0];
      const rng = mulberry32(state.seed + state.diveCount + 1);
      const oxygenConsumed = Math.floor(clamped / 50);
      const pressureLevel =
        clamped * (zone.pressureMultiplier / 10);
      return {
        ...state,
        seed: state.seed + state.diveCount + 1,
        currentDepth: clamped,
        maxDepthReached: Math.max(state.maxDepthReached, clamped),
        currentZoneId: zone.id,
        pressure: Math.round(pressureLevel * 100) / 100,
        oxygen: Math.max(
          0,
          state.maxOxygen - oxygenConsumed,
        ),
        diveCount: state.diveCount + 1,
        discoveredZoneIds: state.discoveredZoneIds.includes(zone.id)
          ? state.discoveredZoneIds
          : [...state.discoveredZoneIds, zone.id],
        expeditionLog: [
          {
            id: `log_${state.diveCount}`,
            timestamp: Date.now(),
            zoneId: zone.id,
            depth: clamped,
            event: 'dive',
            details: `Dove to ${clamped}m in ${zone.nameZh}`,
          },
          ...state.expeditionLog,
        ],
      };
    },
    [state],
  );

  const atSurface = useCallback(() => {
    const oxygenRegen = state.buildings.reduce((acc, b) => {
      if (b.id === 'temple_of_poseidon' && b.level > 0) {
        return acc + b.level * 5;
      }
      return acc;
    }, 0);
    return {
      ...state,
      currentDepth: 0,
      pressure: 1.0,
      oxygen: Math.min(state.maxOxygen, state.oxygen + oxygenRegen + 50),
      currentZoneId: 'shallow_reefs' as AtZoneId,
      hullIntegrity: Math.min(100, state.hullIntegrity + 20),
    };
  }, [state]);

  const atAdjustDepth = useCallback(
    (delta: number) => {
      const newDepth = Math.max(0, state.currentDepth + delta);
      const sub = AT_SUBMARINES.find(
        (s) => s.id === state.currentSubmarineId,
      );
      const maxAllowed = sub?.maxDepth ?? 200;
      const clamped = Math.min(newDepth, maxAllowed);
      const zone = [...AT_ZONES]
        .reverse()
        .find((z) => clamped >= z.depthRange[0]) ?? AT_ZONES[0];
      const pressureLevel =
        clamped * (zone.pressureMultiplier / 10);
      return {
        ...state,
        currentDepth: clamped,
        maxDepthReached: Math.max(state.maxDepthReached, clamped),
        currentZoneId: zone.id,
        pressure: Math.round(pressureLevel * 100) / 100,
        totalDistanceTraveled: state.totalDistanceTraveled + Math.abs(delta),
        discoveredZoneIds: state.discoveredZoneIds.includes(zone.id)
          ? state.discoveredZoneIds
          : [...state.discoveredZoneIds, zone.id],
      };
    },
    [state],
  );

  const atRefuelOxygen = useCallback(() => {
    return {
      ...state,
      oxygen: state.maxOxygen,
    };
  }, [state]);

  const atRepairHull = useCallback(() => {
    const cost = Math.floor((100 - state.hullIntegrity) * 5);
    if (state.coins < cost) return state;
    return {
      ...state,
      hullIntegrity: 100,
      coins: state.coins - cost,
    };
  }, [state]);

  // ---- XP & Leveling ----

  const atGainExperience = useCallback(
    (amount: number) => {
      let newLevel = state.level;
      let newXp = state.xp + amount;
      let newTotalXp = state.totalXp + amount;
      let newMaxOxygen = state.maxOxygen;
      while (
        newLevel < 50 &&
        newXp >= (AT_XP_TABLE[newLevel + 1] ?? Infinity)
      ) {
        newLevel += 1;
        newMaxOxygen += 10;
      }
      // Auto-title upgrade
      const eligibleTitles = AT_TITLES.filter(
        (t) => t.requiredLevel <= newLevel,
      );
      const bestTitle =
        eligibleTitles[eligibleTitles.length - 1] ?? AT_TITLES[0];
      return {
        ...state,
        level: newLevel,
        xp: newXp,
        totalXp: newTotalXp,
        maxOxygen: newMaxOxygen,
        currentTitleId: bestTitle.id,
      };
    },
    [state],
  );

  const atSetTitle = useCallback(
    (titleId: string) => {
      const title = AT_TITLES.find((t) => t.id === titleId);
      if (!title || title.requiredLevel > state.level) return state;
      return { ...state, currentTitleId: titleId };
    },
    [state],
  );

  const atAddCoins = useCallback(
    (amount: number) => ({
      ...state,
      coins: state.coins + amount,
    }),
    [state],
  );

  const atSpendCoins = useCallback(
    (amount: number) => {
      if (state.coins < amount) return state;
      return { ...state, coins: state.coins - amount };
    },
    [state],
  );

  // ---- Sonar System ----

  const atScanSonar = useCallback(() => {
    const rng = mulberry32(
      state.seed + state.sonarScansCount * 7 + 13,
    );
    const sub = AT_SUBMARINES.find(
      (s) => s.id === state.currentSubmarineId,
    );
    const range =
      (sub?.sonarRange ?? 50) + state.sonarLevel * 20;
    const pingCount = 3 + Math.floor(rng() * 5);
    const pings: AtSonarPing[] = [];
    for (let i = 0; i < pingCount; i++) {
      const roll = rng();
      let type: AtSonarPing['type'];
      let label: string;
      if (roll < 0.3) {
        type = 'creature';
        label = '生命信号';
      } else if (roll < 0.5) {
        type = 'artifact';
        label = '金属反应';
      } else if (roll < 0.65) {
        type = 'ruin';
        label = '结构异常';
      } else if (roll < 0.75) {
        type = 'submarine';
        label = '不明潜艇';
      } else {
        type = 'nothing';
        label = '空旷水域';
      }
      pings.push({
        depth: state.currentDepth + Math.floor(rng() * range) - range / 2,
        x: Math.floor(rng() * range * 2) - range,
        y: Math.floor(rng() * range * 2) - range,
        type,
        label,
        distance: Math.floor(rng() * range),
      });
    }
    return {
      ...state,
      sonarScansCount: state.sonarScansCount + 1,
      lastSonarPings: pings,
    };
  }, [state]);

  const atGetSonarPings = useCallback(
    () => state.lastSonarPings,
    [state],
  );

  const atUpgradeSonar = useCallback(() => {
    const cost = state.sonarLevel * 500;
    if (state.coins < cost || state.sonarLevel >= 10) return state;
    return {
      ...state,
      sonarLevel: state.sonarLevel + 1,
      coins: state.coins - cost,
    };
  }, [state]);

  // ---- Creature Encounters ----

  const atEncounterCreature = useCallback(() => {
    const zoneCreatures = AT_CREATURES.filter(
      (c) => c.zone === state.currentZoneId,
    );
    if (zoneCreatures.length === 0) return state;
    const rng = mulberry32(
      state.seed + state.encounterCount * 11 + 7,
    );
    // Weighted by inverse rarity
    const weights: number[] = zoneCreatures.map((c) => {
      switch (c.rarity) {
        case 'common': return 40;
        case 'uncommon': return 25;
        case 'rare': return 15;
        case 'epic': return 5;
        case 'legendary': return 1;
      }
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = rng() * totalWeight;
    let chosenCreature = zoneCreatures[0];
    for (let i = 0; i < zoneCreatures.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        chosenCreature = zoneCreatures[i];
        break;
      }
    }
    const isNew = !state.discoveredCreatureIds.includes(
      chosenCreature.id,
    );
    const isLegendary = chosenCreature.rarity === 'legendary';
    const newDiscovered = isNew
      ? [...state.discoveredCreatureIds, chosenCreature.id]
      : state.discoveredCreatureIds;
    return {
      ...state,
      seed: state.seed + state.encounterCount * 11 + 7,
      discoveredCreatureIds: newDiscovered,
      legendaryEncounterCount: isLegendary
        ? state.legendaryEncounterCount + 1
        : state.legendaryEncounterCount,
      encounterCount: state.encounterCount + 1,
    };
  }, [state]);

  const atGetCreatureInfo = useCallback(
    (creatureId: string) =>
      AT_CREATURES.find((c) => c.id === creatureId) ?? null,
    [state],
  );

  const atGetCreatureByRarity = useCallback(
    (rarity: AtRarityTier) =>
      AT_CREATURES.filter((c) => c.rarity === rarity),
    [state],
  );

  const atFeedCreature = useCallback(
    (creatureId: string) => {
      const creature = AT_CREATURES.find((c) => c.id === creatureId);
      if (!creature) return state;
      const cost = creature.rarity === 'legendary' ? 100 : 20;
      if (state.coins < cost) return state;
      return {
        ...state,
        coins: state.coins - cost,
        xp: state.xp + Math.floor(creature.xpReward * 0.5),
        totalXp: state.totalXp + Math.floor(creature.xpReward * 0.5),
      };
    },
    [state],
  );

  const atFleeCreature = useCallback(() => {
    const fleeXp = 2;
    return {
      ...state,
      xp: state.xp + fleeXp,
      totalXp: state.totalXp + fleeXp,
    };
  }, [state]);

  // ---- Artifacts ----

  const atCollectArtifact = useCallback(
    (artifactId: string) => {
      const artifact = AT_ARTIFACTS.find((a) => a.id === artifactId);
      if (!artifact) return state;
      if (state.collectedArtifactIds.includes(artifactId)) return state;
      const newCollected = [...state.collectedArtifactIds, artifactId];
      const newTech = artifact.technology
        ? state.unlockedTechnologies.includes(artifact.technology)
          ? state.unlockedTechnologies
          : [...state.unlockedTechnologies, artifact.technology]
        : state.unlockedTechnologies;
      return {
        ...state,
        collectedArtifactIds: newCollected,
        unlockedTechnologies: newTech,
        coins: state.coins + artifact.value,
        totalArtifactsCollected: state.totalArtifactsCollected + 1,
      };
    },
    [state],
  );

  const atGetArtifactInfo = useCallback(
    (artifactId: string) =>
      AT_ARTIFACTS.find((a) => a.id === artifactId) ?? null,
    [state],
  );

  const atGetArtifactCount = useCallback(
    () => state.collectedArtifactIds.length,
    [state],
  );

  const atExcavateArtifact = useCallback(() => {
    if (!state.dailyExcavation) return state;
    if (state.dailyExcavation.digsRemaining <= 0) return state;
    const rng = mulberry32(state.seed + state.artifactExcavationCount * 3 + 99);
    const pool = state.dailyExcavation.artifactPool;
    if (pool.length === 0) return state;
    const idx = Math.floor(rng() * pool.length);
    const foundId = pool[idx];
    const alreadyFound = state.dailyExcavation.artifactsFound.includes(foundId);
    const found = alreadyFound
      ? state.dailyExcavation.artifactsFound
      : [...state.dailyExcavation.artifactsFound, foundId];
    const completed = state.dailyExcavation.digsRemaining - 1 <= 0;
    return {
      ...state,
      seed: state.seed + state.artifactExcavationCount * 3 + 99,
      artifactExcavationCount: state.artifactExcavationCount + 1,
      dailyExcavation: {
        ...state.dailyExcavation,
        digsRemaining: state.dailyExcavation.digsRemaining - 1,
        artifactsFound: found,
        completed,
      },
      collectedArtifactIds: alreadyFound
        ? state.collectedArtifactIds
        : [...state.collectedArtifactIds, foundId],
      totalArtifactsCollected: alreadyFound
        ? state.totalArtifactsCollected
        : state.totalArtifactsCollected + 1,
      dailyExcavationArtifacts: alreadyFound
        ? state.dailyExcavationArtifacts
        : state.dailyExcavationArtifacts + 1,
    };
  }, [state]);

  const atAppraiseArtifact = useCallback(
    (artifactId: string) => {
      const artifact = AT_ARTIFACTS.find((a) => a.id === artifactId);
      if (!artifact) return { state, appraisedValue: 0 };
      const museumLevel = state.buildings.find(
        (b) => b.id === 'artifact_museum',
      )?.level ?? 0;
      const bonus = 1 + museumLevel * 0.15;
      return {
        state,
        appraisedValue: Math.floor(artifact.value * bonus),
      };
    },
    [state],
  );

  // ---- Submarines ----

  const atGetSubmarineInfo = useCallback(
    (subId: string) =>
      AT_SUBMARINES.find((s) => s.id === subId) ?? null,
    [state],
  );

  const atGetAvailableSubmarines = useCallback(
    () => AT_SUBMARINES.filter((s) => state.ownedSubmarineIds.includes(s.id)),
    [state],
  );

  const atGetAllSubmarines = useCallback(() => AT_SUBMARINES, [state]);

  const atGetCurrentSubmarine = useCallback(
    () =>
      AT_SUBMARINES.find((s) => s.id === state.currentSubmarineId) ??
      AT_SUBMARINES[0],
    [state],
  );

  const atPurchaseSubmarine = useCallback(
    (subId: string) => {
      const sub = AT_SUBMARINES.find((s) => s.id === subId);
      if (!sub || state.ownedSubmarineIds.includes(subId)) return state;
      if (state.coins < sub.cost) return state;
      return {
        ...state,
        coins: state.coins - sub.cost,
        ownedSubmarineIds: [...state.ownedSubmarineIds, subId],
      };
    },
    [state],
  );

  const atSwitchSubmarine = useCallback(
    (subId: string) => {
      if (!state.ownedSubmarineIds.includes(subId)) return state;
      const sub = AT_SUBMARINES.find((s) => s.id === subId);
      return {
        ...state,
        currentSubmarineId: subId,
        maxOxygen: sub?.oxygenCapacity ?? 100,
        oxygen: sub?.oxygenCapacity ?? 100,
        hullIntegrity: sub ? sub.hullStrength : 100,
      };
    },
    [state],
  );

  const atGetSubmarineStats = useCallback(
    (subId: string) => {
      const sub = AT_SUBMARINES.find((s) => s.id === subId);
      if (!sub) return null;
      const techBonus = state.unlockedTechnologies.includes('hull_upgrade')
        ? 1.2
        : 1;
      return {
        maxDepth: sub.maxDepth,
        hullStrength: Math.floor(sub.hullStrength * techBonus),
        oxygenCapacity: sub.oxygenCapacity,
        speed: sub.speed,
        sonarRange: sub.sonarRange,
      };
    },
    [state],
  );

  // ---- Buildings ----

  const atGetBuildings = useCallback(() => state.buildings, [state]);

  const atGetBuildingInfo = useCallback(
    (buildingId: string) => state.buildings.find((b) => b.id === buildingId) ?? null,
    [state],
  );

  const atBuildStructure = useCallback(
    (buildingId: string) => {
      const building = state.buildings.find((b) => b.id === buildingId);
      if (!building) return state;
      if (building.level > 0) return state;
      if (state.coins < building.buildCost) return state;
      return {
        ...state,
        coins: state.coins - building.buildCost,
        buildings: state.buildings.map((b) =>
          b.id === buildingId ? { ...b, level: 1 } : b,
        ),
      };
    },
    [state],
  );

  const atUpgradeStructure = useCallback(
    (buildingId: string) => {
      const building = state.buildings.find((b) => b.id === buildingId);
      if (!building) return state;
      if (building.level === 0) return state;
      if (building.level >= building.maxLevel) return state;
      const cost = building.upgradeCost * building.level;
      if (state.coins < cost) return state;
      return {
        ...state,
        coins: state.coins - cost,
        buildings: state.buildings.map((b) =>
          b.id === buildingId
            ? { ...b, level: b.level + 1 }
            : b,
        ),
      };
    },
    [state],
  );

  const atGetBuildingBonuses = useCallback(
    (buildingId: string) => {
      const building = state.buildings.find((b) => b.id === buildingId);
      if (!building || building.level === 0) return {};
      switch (building.bonus) {
        case 'oxygen_regen':
          return { oxygenRegen: building.level * 5 };
        case 'sonar_boost':
          return { sonarBonus: building.level * 15 };
        case 'hp_regen':
          return { hpRegen: building.level * 3 };
        case 'artifact_value':
          return { valueMultiplier: 1 + building.level * 0.15 };
        case 'tech_unlock':
          return { researchSpeed: building.level * 10 };
        case 'sub_discount':
          return { discountPercent: building.level * 5 };
        case 'depth_scan':
          return { scanBonus: building.level * 25 };
        case 'craft_legendary':
          return { craftChance: building.level * 8 };
        default:
          return {};
      }
    },
    [state],
  );

  // ---- Quests ----

  const atGetActiveQuests = useCallback(
    () => state.quests.filter((q) => q.accepted && !q.completed),
    [state],
  );

  const atGetAvailableQuests = useCallback(
    () => state.quests.filter((q) => !q.accepted),
    [state],
  );

  const atAcceptQuest = useCallback(
    (questId: string) => {
      return {
        ...state,
        quests: state.quests.map((q) =>
          q.id === questId ? { ...q, accepted: true } : q,
        ),
      };
    },
    [state],
  );

  const atUpdateQuestProgress = useCallback(
    (objective: string, increment: number) => {
      return {
        ...state,
        quests: state.quests.map((q) => {
          if (!q.accepted || q.completed || q.objective !== objective) return q;
          const newProgress = Math.min(q.target, q.progress + increment);
          return { ...q, progress: newProgress };
        }),
      };
    },
    [state],
  );

  const atCompleteQuest = useCallback(
    (questId: string) => {
      const quest = state.quests.find((q) => q.id === questId);
      if (!quest || !quest.accepted || quest.completed) return state;
      if (quest.progress < quest.target) return state;
      const newState = {
        ...state,
        quests: state.quests.map((q) =>
          q.id === questId ? { ...q, completed: true } : q,
        ),
        questsCompleted: state.questsCompleted + 1,
        xp: state.xp + quest.reward.xp,
        totalXp: state.totalXp + quest.reward.xp,
        coins: state.coins + quest.reward.coins,
      };
      if (quest.reward.artifactId) {
        const alreadyCollected = newState.collectedArtifactIds.includes(
          quest.reward.artifactId!,
        );
        if (!alreadyCollected) {
          return {
            ...newState,
            collectedArtifactIds: [
              ...newState.collectedArtifactIds,
              quest.reward.artifactId!,
            ],
            totalArtifactsCollected: newState.totalArtifactsCollected + 1,
          };
        }
      }
      return newState;
    },
    [state],
  );

  const atGetQuestInfo = useCallback(
    (questId: string) => state.quests.find((q) => q.id === questId) ?? null,
    [state],
  );

  // ---- NPCs ----

  const atTalkToNPC = useCallback(
    (npcId: string) => {
      const npc = state.npcs.find((n) => n.id === npcId);
      if (!npc) return { state, dialogue: '' };
      const dialogues: Record<string, string> = {
        npc_scholar:
          'Have you cataloged the bioluminescent jellyfish yet? Fascinating creatures!',
        npc_captain:
          'The deep calls to those who listen. Keep your hull tight, diver.',
        npc_elder:
          'The songs of Atlantis still echo in these waters... if you listen closely.',
        npc_priest:
          'Poseidon tests all who enter his domain. Show respect, and the sea provides.',
        npc_craftsman:
          'Bring me rare materials from the deep, and I shall build wonders.',
        npc_watcher:
          '...You are not the first to seek the core. But you may be the one who reaches it.',
      };
      return {
        state,
        dialogue: dialogues[npcId] ?? 'The sea holds many secrets.',
      };
    },
    [state],
  );

  const atGetNPCInfo = useCallback(
    (npcId: string) => state.npcs.find((n) => n.id === npcId) ?? null,
    [state],
  );

  const atGetNPCRelationship = useCallback(
    (npcId: string) => {
      const npc = state.npcs.find((n) => n.id === npcId);
      return npc?.friendship ?? 0;
    },
    [state],
  );

  const atBefriendNPC = useCallback(
    (npcId: string, amount: number) => {
      return {
        ...state,
        npcs: state.npcs.map((n) => {
          if (n.id !== npcId) return n;
          return {
            ...n,
            friendship: Math.min(100, n.friendship + amount),
          };
        }),
      };
    },
    [state],
  );

  const atGetAllNPCs = useCallback(() => state.npcs, [state]);

  // ---- Achievements ----

  const atGetAchievements = useCallback(() => state.achievements, [state]);

  const atUnlockAchievement = useCallback(
    (achievementId: string) => {
      const ach = state.achievements.find((a) => a.id === achievementId);
      if (!ach || ach.unlocked) return state;
      return {
        ...state,
        achievements: state.achievements.map((a) =>
          a.id === achievementId
            ? { ...a, unlocked: true, unlockedAt: Date.now() }
            : a,
        ),
        achievementsUnlocked: state.achievementsUnlocked + 1,
        xp: state.xp + ach.reward.xp,
        totalXp: state.totalXp + ach.reward.xp,
        coins: state.coins + ach.reward.coins,
      };
    },
    [state],
  );

  const atCheckAchievements = useCallback(() => {
    let s = { ...state };
    const checks: Record<string, boolean> = {
      ach_first_splash: s.maxDepthReached >= 50,
      ach_trench_veteran: s.maxDepthReached >= 6000,
      ach_creature_master: s.discoveredCreatureIds.length >= 30,
      ach_artifact_legend:
        AT_ARTIFACTS.filter(
          (a) =>
            (a.rarity === 'epic' || a.rarity === 'legendary') &&
            s.collectedArtifactIds.includes(a.id),
        ).length >= 20,
      ach_submarine_collector: s.ownedSubmarineIds.length >= 8,
      ach_building_empire:
        s.buildings.filter(
          (b) => b.level >= b.maxLevel,
        ).length >= 8,
      ach_quest_hero: s.questsCompleted >= 10,
      ach_max_friendship: s.npcs.every((n) => n.friendship >= 100),
      ach_legendary_10: s.legendaryEncounterCount >= 10,
      ach_daily_7: s.dailyDivesCompleted >= 7,
      ach_excavation_master: s.dailyExcavationArtifacts >= 10,
      ach_level_50: s.level >= 50,
      ach_core_discovery:
        s.discoveredZoneIds.includes('atlantis_core'),
      ach_sonar_master: s.sonarScansCount >= 50,
      ach_rich_diver: s.coins >= 100000,
    };
    for (const [achId, condition] of Object.entries(checks)) {
      if (condition) {
        const ach = s.achievements.find((a) => a.id === achId);
        if (ach && !ach.unlocked) {
          s = {
            ...s,
            achievements: s.achievements.map((a) =>
              a.id === achId
                ? { ...a, unlocked: true, unlockedAt: Date.now() }
                : a,
            ),
            achievementsUnlocked: s.achievementsUnlocked + 1,
            xp: s.xp + ach.reward.xp,
            totalXp: s.totalXp + ach.reward.xp,
            coins: s.coins + ach.reward.coins,
          };
        }
      }
    }
    return s;
  }, [state]);

  const atGetAchievementProgress = useCallback(
    (achievementId: string) => {
      const ach = state.achievements.find(
        (a) => a.id === achievementId,
      );
      if (!ach) return { progress: 0, total: 0, unlocked: false };
      let progress = 0;
      let total = 0;
      switch (achievementId) {
        case 'ach_first_splash':
          progress = Math.min(50, state.maxDepthReached);
          total = 50;
          break;
        case 'ach_trench_veteran':
          progress = Math.min(6000, state.maxDepthReached);
          total = 6000;
          break;
        case 'ach_creature_master':
          progress = state.discoveredCreatureIds.length;
          total = 30;
          break;
        case 'ach_legendary_10':
          progress = state.legendaryEncounterCount;
          total = 10;
          break;
        case 'ach_daily_7':
          progress = state.dailyDivesCompleted;
          total = 7;
          break;
        case 'ach_level_50':
          progress = state.level;
          total = 50;
          break;
        case 'ach_sonar_master':
          progress = state.sonarScansCount;
          total = 50;
          break;
        default:
          progress = ach.unlocked ? 1 : 0;
          total = 1;
          break;
      }
      return { progress, total, unlocked: ach.unlocked };
    },
    [state],
  );

  // ---- Daily System ----

  const atGetDailyDive = useCallback(
    () => state.dailyDive,
    [state],
  );

  const atStartDailyDive = useCallback(() => {
    if (!state.dailyDive || state.dailyDive.completed) return state;
    return {
      ...state,
      dailyDive: { ...state.dailyDive, progress: state.dailyDive.progress + 1 },
    };
  }, [state]);

  const atCompleteDailyDive = useCallback(() => {
    if (!state.dailyDive || state.dailyDive.completed) return state;
    return {
      ...state,
      dailyDive: { ...state.dailyDive, completed: true },
      dailyDivesCompleted: state.dailyDivesCompleted + 1,
      xp: state.xp + state.dailyDive.reward.xp,
      totalXp: state.totalXp + state.dailyDive.reward.xp,
      coins: state.coins + state.dailyDive.reward.coins,
    };
  }, [state]);

  const atGetDailyExcavation = useCallback(
    () => state.dailyExcavation,
    [state],
  );

  const atStartDailyExcavation = useCallback(() => {
    if (
      !state.dailyExcavation ||
      state.dailyExcavation.completed ||
      state.dailyExcavation.digsRemaining <= 0
    )
      return state;
    // Inline excavation logic
    const rng = mulberry32(state.seed + state.artifactExcavationCount * 3 + 99);
    const pool = state.dailyExcavation.artifactPool;
    if (pool.length === 0) return state;
    const idx = Math.floor(rng() * pool.length);
    const foundId = pool[idx];
    const alreadyFound = state.dailyExcavation.artifactsFound.includes(foundId);
    const found = alreadyFound
      ? state.dailyExcavation.artifactsFound
      : [...state.dailyExcavation.artifactsFound, foundId];
    const completed = state.dailyExcavation.digsRemaining - 1 <= 0;
    return {
      ...state,
      seed: state.seed + state.artifactExcavationCount * 3 + 99,
      artifactExcavationCount: state.artifactExcavationCount + 1,
      dailyExcavation: {
        ...state.dailyExcavation,
        digsRemaining: state.dailyExcavation.digsRemaining - 1,
        artifactsFound: found,
        completed,
      },
      collectedArtifactIds: alreadyFound
        ? state.collectedArtifactIds
        : [...state.collectedArtifactIds, foundId],
      totalArtifactsCollected: alreadyFound
        ? state.totalArtifactsCollected
        : state.totalArtifactsCollected + 1,
      dailyExcavationArtifacts: alreadyFound
        ? state.dailyExcavationArtifacts
        : state.dailyExcavationArtifacts + 1,
    };
  }, [state]);

  // ---- Discovery & Ruins ----

  const atDiscoverRuins = useCallback(() => {
    const rng = mulberry32(state.seed + state.diveCount * 17 + 5);
    const ruinsFound = Math.floor(rng() * 3) + 1;
    const xpGain = ruinsFound * 30;
    const coinGain = ruinsFound * 50;
    return {
      ...state,
      seed: state.seed + state.diveCount * 17 + 5,
      xp: state.xp + xpGain,
      totalXp: state.totalXp + xpGain,
      coins: state.coins + coinGain,
      expeditionLog: [
        {
          id: `ruin_${state.diveCount}`,
          timestamp: Date.now(),
          zoneId: state.currentZoneId,
          depth: state.currentDepth,
          event: 'ruins',
          details: `Discovered ${ruinsFound} ancient ruins at ${state.currentDepth}m`,
        },
        ...state.expeditionLog,
      ],
    };
  }, [state]);

  const atGetDiscoveredRuins = useCallback(() => {
    return state.expeditionLog.filter((e) => e.event === 'ruins');
  }, [state]);

  const atUnlockTechnology = useCallback(
    (techId: string) => {
      if (state.unlockedTechnologies.includes(techId)) return state;
      return {
        ...state,
        unlockedTechnologies: [...state.unlockedTechnologies, techId],
      };
    },
    [state],
  );

  const atHasTechnology = useCallback(
    (techId: string) => state.unlockedTechnologies.includes(techId),
    [state],
  );

  // ---- Expedition Log ----

  const atGetExpeditionLog = useCallback(
    () => state.expeditionLog,
    [state],
  );

  const atAddExpeditionLog = useCallback(
    (event: string, details: string) => ({
      ...state,
      expeditionLog: [
        {
          id: `log_custom_${state.expeditionLog.length}`,
          timestamp: Date.now(),
          zoneId: state.currentZoneId,
          depth: state.currentDepth,
          event,
          details,
        },
        ...state.expeditionLog,
      ],
    }),
    [state],
  );

  const atClearExpeditionLog = useCallback(
    () => ({ ...state, expeditionLog: [] }),
    [state],
  );

  // ---- Stats ----

  const atGetStats = useCallback(
    () => ({
      level: state.level,
      xp: state.xp,
      totalXp: state.totalXp,
      coins: state.coins,
      depth: state.currentDepth,
      maxDepth: state.maxDepthReached,
      creaturesDiscovered: state.discoveredCreatureIds.length,
      artifactsCollected: state.collectedArtifactIds.length,
      divesCompleted: state.diveCount,
      questsCompleted: state.questsCompleted,
      achievementsUnlocked: state.achievementsUnlocked,
      buildingsBuilt: state.buildings.filter((b) => b.level > 0).length,
      distanceTraveled: state.totalDistanceTraveled,
      sonarScans: state.sonarScansCount,
      dailyDivesCompleted: state.dailyDivesCompleted,
    }),
    [state],
  );

  const atGetTitles = useCallback(() => AT_TITLES, [state]);

  const atGetAllQuests = useCallback(() => state.quests, [state]);

  // ---- Name ----

  const atSetDiverName = useCallback(
    (name: string) => ({ ...state, diverName: name }),
    [state],
  );

  // ---- Bulk Discovery for testing ----

  const atDiscoverAllZones = useCallback(() => {
    return {
      ...state,
      discoveredZoneIds: AT_ZONES.map((z) => z.id),
    };
  }, [state]);

  // ---- Capture Creature (documentation only, no side effects) ----

  const atCaptureCreature = useCallback(
    (creatureId: string) => {
      const creature = AT_CREATURES.find((c) => c.id === creatureId);
      if (!creature) return state;
      const alreadyDiscovered = state.discoveredCreatureIds.includes(creatureId);
      return {
        ...state,
        discoveredCreatureIds: alreadyDiscovered
          ? state.discoveredCreatureIds
          : [...state.discoveredCreatureIds, creatureId],
        xp: state.xp + creature.xpReward,
        totalXp: state.totalXp + creature.xpReward,
        coins: state.coins + creature.coinReward,
        encounterCount: state.encounterCount + 1,
        legendaryEncounterCount:
          creature.rarity === 'legendary'
            ? state.legendaryEncounterCount + 1
            : state.legendaryEncounterCount,
      };
    },
    [state],
  );

  // ---- Reset Expedition ----

  const atResetExpedition = useCallback(() => {
    const newState = createInitialState(state.seed + 1);
    return {
      ...newState,
      diverName: state.diverName,
      seed: state.seed + 1,
    };
  }, [state]);

  // ---- Combined Dive-and-Encounter ----

  const atDeepExpedition = useCallback(
    (targetDepth: number) => {
      // Inline dive deep
      const sub = AT_SUBMARINES.find((s) => s.id === state.currentSubmarineId);
      const maxAllowed = sub?.maxDepth ?? 200;
      const clamped = Math.min(targetDepth, maxAllowed);
      const zone = [...AT_ZONES].reverse().find((z) => clamped >= z.depthRange[0]) ?? AT_ZONES[0];
      const rng1 = mulberry32(state.seed + state.diveCount + 1);
      const oxygenConsumed = Math.floor(clamped / 50);
      const pressureLevel = clamped * (zone.pressureMultiplier / 10);
      let s = {
        ...state,
        seed: state.seed + state.diveCount + 1,
        currentDepth: clamped,
        maxDepthReached: Math.max(state.maxDepthReached, clamped),
        currentZoneId: zone.id,
        pressure: Math.round(pressureLevel * 100) / 100,
        oxygen: Math.max(0, state.maxOxygen - oxygenConsumed),
        diveCount: state.diveCount + 1,
        discoveredZoneIds: state.discoveredZoneIds.includes(zone.id)
          ? state.discoveredZoneIds
          : [...state.discoveredZoneIds, zone.id],
        expeditionLog: [
          { id: `log_${state.diveCount}`, timestamp: Date.now(), zoneId: zone.id, depth: clamped, event: 'dive', details: `Dove to ${clamped}m in ${zone.nameZh}` },
          ...state.expeditionLog,
        ],
      };
      // Inline encounter creature
      const zoneCreatures = AT_CREATURES.filter((c) => c.zone === s.currentZoneId);
      if (zoneCreatures.length > 0) {
        const rng2 = mulberry32(s.seed + s.encounterCount * 11 + 7);
        const weights = zoneCreatures.map((c) => {
          switch (c.rarity) { case 'common': return 40; case 'uncommon': return 25; case 'rare': return 15; case 'epic': return 5; case 'legendary': return 1; }
        });
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let roll = rng2() * totalWeight;
        let chosen = zoneCreatures[0];
        for (let i = 0; i < zoneCreatures.length; i++) { roll -= weights[i]; if (roll <= 0) { chosen = zoneCreatures[i]; break; } }
        const isNew = !s.discoveredCreatureIds.includes(chosen.id);
        s = {
          ...s,
          seed: s.seed + s.encounterCount * 11 + 7,
          discoveredCreatureIds: isNew ? [...s.discoveredCreatureIds, chosen.id] : s.discoveredCreatureIds,
          legendaryEncounterCount: chosen.rarity === 'legendary' ? s.legendaryEncounterCount + 1 : s.legendaryEncounterCount,
          encounterCount: s.encounterCount + 1,
        };
      }
      // Inline update quest progress
      s = {
        ...s,
        quests: s.quests.map((q) => {
          if (!q.accepted || q.completed) return q;
          if (q.objective === 'dive_count') return { ...q, progress: Math.min(q.target, q.progress + 1) };
          if (q.objective === 'max_depth_reached') return { ...q, progress: Math.min(q.target, q.progress + Math.max(0, s.currentDepth - state.maxDepthReached)) };
          if (q.objective === 'zone_visited' && s.currentDepth >= 2000 && s.discoveredZoneIds.includes('hydrothermal_vents')) return { ...q, progress: Math.min(q.target, q.progress + 1) };
          return q;
        }),
      };
      return s;
    },
    [state],
  );

  // ---- Render: expose everything ----

  return {
    atGetState,
    atGetLevel,
    atGetExperience,
    atGetTotalExperience,
    atGetTitle,
    atGetDepth,
    atGetMaxDepth,
    atGetCurrentZone,
    atGetOxygen,
    atGetMaxOxygen,
    atGetPressure,
    atGetHullIntegrity,
    atGetCoins,
    atGetSonarLevel,
    atGetSonarScans,
    atGetDiscoveredZones,
    atGetDiscoveredCreatures,
    atGetCollectedArtifacts,
    atGetUnlockedTechnologies,
    atGetNextLevelXP,
    atGetLevelProgress,
    atGetZoneInfo,
    atGetZoneCreatures,
    atGetZoneArtifacts,
    atGetZoneDanger,
    atDiveDeep,
    atSurface,
    atAdjustDepth,
    atRefuelOxygen,
    atRepairHull,
    atGainExperience,
    atSetTitle,
    atAddCoins,
    atSpendCoins,
    atScanSonar,
    atGetSonarPings,
    atUpgradeSonar,
    atEncounterCreature,
    atGetCreatureInfo,
    atGetCreatureByRarity,
    atFeedCreature,
    atFleeCreature,
    atCaptureCreature,
    atCollectArtifact,
    atGetArtifactInfo,
    atGetArtifactCount,
    atExcavateArtifact,
    atAppraiseArtifact,
    atGetSubmarineInfo,
    atGetAvailableSubmarines,
    atGetAllSubmarines,
    atGetCurrentSubmarine,
    atPurchaseSubmarine,
    atSwitchSubmarine,
    atGetSubmarineStats,
    atGetBuildings,
    atGetBuildingInfo,
    atBuildStructure,
    atUpgradeStructure,
    atGetBuildingBonuses,
    atGetActiveQuests,
    atGetAvailableQuests,
    atAcceptQuest,
    atUpdateQuestProgress,
    atCompleteQuest,
    atGetQuestInfo,
    atGetAllQuests,
    atTalkToNPC,
    atGetNPCInfo,
    atGetNPCRelationship,
    atBefriendNPC,
    atGetAllNPCs,
    atGetAchievements,
    atUnlockAchievement,
    atCheckAchievements,
    atGetAchievementProgress,
    atGetDailyDive,
    atStartDailyDive,
    atCompleteDailyDive,
    atGetDailyExcavation,
    atStartDailyExcavation,
    atDiscoverRuins,
    atGetDiscoveredRuins,
    atUnlockTechnology,
    atHasTechnology,
    atGetExpeditionLog,
    atAddExpeditionLog,
    atClearExpeditionLog,
    atGetStats,
    atGetTitles,
    atSetDiverName,
    atDiscoverAllZones,
    atResetExpedition,
    atDeepExpedition,
  };
}
