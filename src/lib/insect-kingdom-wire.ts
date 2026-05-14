'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

// =============================================================================
// Insect Kingdom Wire — Bug Collection & Habitat Management Wire
// All constants use IK_ prefix. All hook functions use ik prefix.
// Lime / green / emerald color theme.
// =============================================================================

// === TYPE DEFINITIONS ===

export type IkRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type IkInsectType = 'beetle' | 'butterfly' | 'ant' | 'mantis' | 'dragonfly' | 'moth' | 'bee' | 'spider' | 'scorpion' | 'cicada' | 'firefly' | 'cricket' | 'grasshopper' | 'ladybug' | 'wasp' | 'termite' | 'stickbug' | 'centipede' | 'caterpillar'
export type IkHabitatId = 'meadow_garden' | 'rainforest_canopy' | 'desert_dunes' | 'underground_colony' | 'mountain_stream' | 'volcanic_ash_field' | 'moonlit_grove' | 'crystal_cavern'
export type IkFoodId = 'nectar_drop' | 'pollen_ball' | 'sap_lick' | 'fruit_slice' | 'honeycomb' | 'dewdrop'
export type IkEquipSlot = 'net' | 'jar' | 'magnifier' | 'armor' | 'boots' | 'lantern'

export interface IkRarityDef {
  key: IkRarity
  name: string
  color: string
  weight: number
}

export interface IkSpeciesDef {
  id: string
  name: string
  icon: string
  rarity: IkRarity
  type: IkInsectType
  habitat: IkHabitatId
  description: string
  basePower: number
  evolveFrom: string | null
  evolveLevel: number
}

export interface IkHabitatDef {
  id: IkHabitatId
  name: string
  icon: string
  description: string
  unlockLevel: number
  rarityWeights: Record<IkRarity, number>
  background: string
}

export interface IkFoodDef {
  id: IkFoodId
  name: string
  icon: string
  xpValue: number
  happinessBonus: number
  description: string
}

export interface IkEquipmentDef {
  id: string
  name: string
  icon: string
  rarity: IkRarity
  slot: IkEquipSlot
  bonus: number
  description: string
  cost: number
}

export interface IkTitleDef {
  name: string
  levelRequired: number
  icon: string
  description: string
}

export interface IkAchievementDef {
  id: string
  name: string
  icon: string
  description: string
  conditionKey: string
  targetValue: number
  rewardXP: number
  rewardCoins: number
}

export interface InsectEntity {
  id: string
  speciesId: string
  nickname: string
  level: number
  xp: number
  happiness: number
  power: number
  caughtAt: number
  fedToday: boolean
  evolved: boolean
}

export interface HabitatEntity {
  habitatId: IkHabitatId
  unlocked: boolean
  explorationCount: number
  lastExplored: number
  totalFound: number
}

export interface EquipmentEntity {
  equipmentId: string
  owned: boolean
  equipped: boolean
  durability: number
  level: number
  obtainedAt: number
}

export interface AchievementEntity {
  id: string
  unlocked: boolean
  unlockedAt: number
}

// === STATE INTERFACE ===

export interface InsectKingdomState {
  level: number
  xp: number
  totalXp: number
  coins: number
  insects: InsectEntity[]
  habitats: HabitatEntity[]
  equipment: EquipmentEntity[]
  achievements: AchievementEntity[]
  title: string
  dailyCollected: boolean
  dailyDate: string
  totalCaught: number
  totalEvolved: number
  totalReleased: number
  metamorphosisCount: number
  totalFed: number
  totalExplored: number
  totalCoinsEarned: number
  totalCoinsSpent: number
  activeHabitat: IkHabitatId
  streak: number
  bestStreak: number
  seed: number
  tick: number
}

// === CONSTANTS ===

export const IK_MAX_LEVEL = 50

export const IK_XP_TABLE: number[] = (() => {
  const table: number[] = [0]
  for (let i = 1; i <= IK_MAX_LEVEL; i++) {
    table.push(Math.floor(80 * i * (1 + i * 0.15)))
  }
  return table
})()

export const IK_RARITY_COMMON: IkRarityDef = {
  key: 'common', name: 'Common', color: '#84CC16', weight: 50,
}
export const IK_RARITY_UNCOMMON: IkRarityDef = {
  key: 'uncommon', name: 'Uncommon', color: '#22C55E', weight: 30,
}
export const IK_RARITY_RARE: IkRarityDef = {
  key: 'rare', name: 'Rare', color: '#10B981', weight: 14,
}
export const IK_RARITY_EPIC: IkRarityDef = {
  key: 'epic', name: 'Epic', color: '#059669', weight: 5,
}
export const IK_RARITY_LEGENDARY: IkRarityDef = {
  key: 'legendary', name: 'Legendary', color: '#047857', weight: 1,
}

export const IK_RARITIES: IkRarityDef[] = [
  IK_RARITY_COMMON,
  IK_RARITY_UNCOMMON,
  IK_RARITY_RARE,
  IK_RARITY_EPIC,
  IK_RARITY_LEGENDARY,
]

// === 32 INSECT SPECIES ===

export const IK_SPECIES: IkSpeciesDef[] = [
  // Common (10)
  { id: 'green_ladybug', name: 'Green Ladybug', icon: '🐞', rarity: 'common', type: 'ladybug', habitat: 'meadow_garden', description: 'A cheerful ladybug with an emerald shell that brings luck to gardens.', basePower: 5, evolveFrom: null, evolveLevel: 0 },
  { id: 'honey_bee_worker', name: 'Honey Bee Worker', icon: '🐝', rarity: 'common', type: 'bee', habitat: 'meadow_garden', description: 'A diligent pollinator that never misses a flower in bloom.', basePower: 6, evolveFrom: null, evolveLevel: 0 },
  { id: 'field_cricket', name: 'Field Cricket', icon: '🦗', rarity: 'common', type: 'cricket', habitat: 'meadow_garden', description: 'Its evening song echoes across meadows, a symphony of summer.', basePower: 4, evolveFrom: null, evolveLevel: 0 },
  { id: 'meadow_grasshopper', name: 'Meadow Grasshopper', icon: '🦗', rarity: 'common', type: 'grasshopper', habitat: 'meadow_garden', description: 'Leaps tall grass blades in a single bound, always seeking the next adventure.', basePower: 5, evolveFrom: null, evolveLevel: 0 },
  { id: 'leaf_cutter_ant', name: 'Leaf Cutter Ant', icon: '🐜', rarity: 'common', type: 'ant', habitat: 'rainforest_canopy', description: 'Carries leaves ten times its body weight back to the colony.', basePower: 7, evolveFrom: null, evolveLevel: 0 },
  { id: 'monarch_caterpillar', name: 'Monarch Caterpillar', icon: '🐛', rarity: 'common', type: 'caterpillar', habitat: 'meadow_garden', description: 'Striped and hungry, it devours milkweed leaves endlessly before its transformation.', basePower: 3, evolveFrom: null, evolveLevel: 0 },
  { id: 'scarlet_beetle', name: 'Scarlet Beetle', icon: '🪲', rarity: 'common', type: 'beetle', habitat: 'rainforest_canopy', description: 'A bright red beetle that deters predators with its vivid coloring.', basePower: 8, evolveFrom: null, evolveLevel: 0 },
  { id: 'common_dragonfly', name: 'Common Dragonfly', icon: '🪰', rarity: 'common', type: 'dragonfly', habitat: 'mountain_stream', description: 'Hovers over streams with iridescent wings catching the sunlight.', basePower: 6, evolveFrom: null, evolveLevel: 0 },
  { id: 'garden_spider', name: 'Garden Spider', icon: '🕷️', rarity: 'common', type: 'spider', habitat: 'meadow_garden', description: 'Weaves intricate dew-covered webs between garden fence posts each dawn.', basePower: 7, evolveFrom: null, evolveLevel: 0 },
  { id: 'brown_termite', name: 'Brown Termite', icon: '🐜', rarity: 'common', type: 'termite', habitat: 'underground_colony', description: 'Silent decomposer that recycles fallen wood into fertile soil.', basePower: 4, evolveFrom: null, evolveLevel: 0 },
  // Uncommon (8)
  { id: 'luna_moth', name: 'Luna Moth', icon: '🦋', rarity: 'uncommon', type: 'moth', habitat: 'moonlit_grove', description: 'Its pale green wings glow softly under moonlight, enchanting all who see it.', basePower: 12, evolveFrom: null, evolveLevel: 0 },
  { id: 'emerald_mantis', name: 'Emerald Mantis', icon: '🦟', rarity: 'uncommon', type: 'mantis', habitat: 'rainforest_canopy', description: 'A patient hunter disguised as a leaf, striking with blinding speed.', basePower: 15, evolveFrom: null, evolveLevel: 0 },
  { id: 'golden_firefly', name: 'Golden Firefly', icon: '✨', rarity: 'uncommon', type: 'firefly', habitat: 'moonlit_grove', description: 'Its bioluminescent pulse creates patterns that mesmerize observers.', basePower: 10, evolveFrom: null, evolveLevel: 0 },
  { id: 'crimson_wasp', name: 'Crimson Wasp', icon: '🐝', rarity: 'uncommon', type: 'wasp', habitat: 'desert_dunes', description: 'A fierce desert wasp that builds intricate underground nests.', basePower: 14, evolveFrom: null, evolveLevel: 0 },
  { id: 'violet_cicada', name: 'Violet Cicada', icon: '🪲', rarity: 'uncommon', type: 'cicada', habitat: 'rainforest_canopy', description: 'Sings haunting melodies that reverberate through the jungle canopy.', basePower: 11, evolveFrom: null, evolveLevel: 0 },
  { id: 'giant_stickbug', name: 'Giant Stickbug', icon: '🪵', rarity: 'uncommon', type: 'stickbug', habitat: 'rainforest_canopy', description: 'So perfectly camouflaged that even experts struggle to spot it.', basePower: 9, evolveFrom: null, evolveLevel: 0 },
  { id: 'river_damselfly', name: 'River Damselfly', icon: '🪰', rarity: 'uncommon', type: 'dragonfly', habitat: 'mountain_stream', description: 'Dances above rushing water, its wings reflecting rainbow prisms.', basePower: 13, evolveFrom: null, evolveLevel: 0 },
  { id: 'cave_centipede', name: 'Cave Centipede', icon: '🐛', rarity: 'uncommon', type: 'centipede', habitat: 'crystal_cavern', description: 'Navigates dark crystal tunnels using vibrations from its many legs.', basePower: 14, evolveFrom: null, evolveLevel: 0 },
  // Rare (6)
  { id: 'praying_mantis_emperor', name: 'Praying Mantis Emperor', icon: '🦗', rarity: 'rare', type: 'mantis', habitat: 'mountain_stream', description: 'An apex insect predator with golden-edged forelimbs and royal bearing.', basePower: 22, evolveFrom: null, evolveLevel: 0 },
  { id: 'blue_morpho', name: 'Blue Morpho', icon: '🦋', rarity: 'rare', type: 'butterfly', habitat: 'rainforest_canopy', description: 'Its shimmering blue wings are among the most beautiful sights in nature.', basePower: 18, evolveFrom: null, evolveLevel: 0 },
  { id: 'sun_beetle', name: 'Sun Beetle', icon: '🪲', rarity: 'rare', type: 'beetle', habitat: 'desert_dunes', description: 'Its metallic shell reflects sunlight so brightly it can blind predators.', basePower: 20, evolveFrom: null, evolveLevel: 0 },
  { id: 'volcano_scorpion', name: 'Volcano Scorpion', icon: '🦂', rarity: 'rare', type: 'scorpion', habitat: 'volcanic_ash_field', description: 'Thrives in scorching temperatures near lava flows with armored exoskeleton.', basePower: 25, evolveFrom: null, evolveLevel: 0 },
  { id: 'frost_spider', name: 'Frost Spider', icon: '🕷️', rarity: 'rare', type: 'spider', habitat: 'crystal_cavern', description: 'Spins webs of crystallized silk that sparkle like ice in the cavern depths.', basePower: 21, evolveFrom: null, evolveLevel: 0 },
  { id: 'storm_cicada', name: 'Storm Cicada', icon: '🪲', rarity: 'rare', type: 'cicada', habitat: 'volcanic_ash_field', description: 'Only emerges during electrical storms, its call syncing with thunder.', basePower: 19, evolveFrom: null, evolveLevel: 0 },
  // Epic (5)
  { id: 'ghost_moth', name: 'Ghost Moth', icon: '🦋', rarity: 'epic', type: 'moth', habitat: 'moonlit_grove', description: 'Nearly transparent wings make it appear as a floating specter in the dark.', basePower: 32, evolveFrom: null, evolveLevel: 0 },
  { id: 'crystal_mantis', name: 'Crystal Mantis', icon: '🦟', rarity: 'epic', type: 'mantis', habitat: 'crystal_cavern', description: 'Its body has fused with crystal formations, making it nearly indestructible.', basePower: 35, evolveFrom: null, evolveLevel: 0 },
  { id: 'phoenix_butterfly', name: 'Phoenix Butterfly', icon: '🦋', rarity: 'epic', type: 'butterfly', habitat: 'volcanic_ash_field', description: 'Wings of living flame that reignite from their own ashes when damaged.', basePower: 38, evolveFrom: null, evolveLevel: 0 },
  { id: 'ancient_beetle', name: 'Ancient Beetle', icon: '🪲', rarity: 'epic', type: 'beetle', habitat: 'underground_colony', description: 'A living fossil unchanged for millions of years, encased in petrified bark.', basePower: 30, evolveFrom: null, evolveLevel: 0 },
  { id: 'lightning_firefly', name: 'Lightning Firefly', icon: '⚡', rarity: 'epic', type: 'firefly', habitat: 'volcanic_ash_field', description: 'Each pulse of light carries an electric charge strong enough to stun predators.', basePower: 33, evolveFrom: null, evolveLevel: 0 },
  // Legendary (3)
  { id: 'jewel_dragonfly', name: 'Jewel Dragonfly', icon: '💎', rarity: 'legendary', type: 'dragonfly', habitat: 'crystal_cavern', description: 'Wings made of living gemstones that refract light into infinite colors.', basePower: 50, evolveFrom: null, evolveLevel: 0 },
  { id: 'starlight_moth', name: 'Starlight Moth', icon: '🌙', rarity: 'legendary', type: 'moth', habitat: 'moonlit_grove', description: 'Its wings contain actual starlight, illuminating the grove like a constellation.', basePower: 48, evolveFrom: null, evolveLevel: 0 },
  { id: 'colony_queen_ant', name: 'Colony Queen Ant', icon: '👑', rarity: 'legendary', type: 'ant', habitat: 'underground_colony', description: 'Commands millions with pheromone whispers, the true sovereign of the insect world.', basePower: 55, evolveFrom: null, evolveLevel: 0 },
  // Evolved forms (metamorphosis)
  { id: 'monarch_butterfly', name: 'Monarch Butterfly', icon: '🦋', rarity: 'rare', type: 'butterfly', habitat: 'meadow_garden', description: 'The transformed monarch, embarking on an epic migration spanning continents.', basePower: 20, evolveFrom: 'monarch_caterpillar', evolveLevel: 10 },
  { id: 'emperor_ladybug', name: 'Emperor Ladybug', icon: '🐞', rarity: 'uncommon', type: 'ladybug', habitat: 'meadow_garden', description: 'An evolved ladybug with shimmering golden spots and legendary luck.', basePower: 14, evolveFrom: 'green_ladybug', evolveLevel: 8 },
  { id: 'fortress_termite', name: 'Fortress Termite', icon: '🐜', rarity: 'uncommon', type: 'termite', habitat: 'underground_colony', description: 'Evolved to build impenetrable mounds of hardened clay and resin.', basePower: 12, evolveFrom: 'brown_termite', evolveLevel: 7 },
  { id: 'crystal_spider_queen', name: 'Crystal Spider Queen', icon: '🕷️', rarity: 'epic', type: 'spider', habitat: 'crystal_cavern', description: 'Evolved from a frost spider, she weaves webs of pure diamond-like silk.', basePower: 40, evolveFrom: 'frost_spider', evolveLevel: 15 },
  { id: 'thunder_cicada_king', name: 'Thunder Cicada King', icon: '🪲', rarity: 'epic', type: 'cicada', habitat: 'volcanic_ash_field', description: 'Evolved storm cicada whose song can trigger actual thunderclaps.', basePower: 42, evolveFrom: 'storm_cicada', evolveLevel: 15 },
  { id: 'supreme_mantis', name: 'Supreme Mantis', icon: '🦗', rarity: 'legendary', type: 'mantis', habitat: 'crystal_cavern', description: 'The ultimate predator, evolved beyond any known insect combat form.', basePower: 58, evolveFrom: 'crystal_mantis', evolveLevel: 20 },
  { id: 'eternal_firefly', name: 'Eternal Firefly', icon: '🌟', rarity: 'legendary', type: 'firefly', habitat: 'moonlit_grove', description: 'Never dims — its glow is said to guide lost travelers home safely.', basePower: 52, evolveFrom: 'golden_firefly', evolveLevel: 18 },
  // Additional base species
  { id: 'pine_beetle', name: 'Pine Bark Beetle', icon: '🪲', rarity: 'common', type: 'beetle', habitat: 'mountain_stream', description: 'Borrows deep into pine bark, leaving intricate tunnel patterns in the wood.', basePower: 5, evolveFrom: null, evolveLevel: 0 },
  { id: 'orchid_mantis', name: 'Orchid Mantis', icon: '🌸', rarity: 'rare', type: 'mantis', habitat: 'rainforest_canopy', description: 'Disguised as a perfect orchid flower, it attracts pollinators as prey.', basePower: 23, evolveFrom: null, evolveLevel: 0 },
  { id: 'desert_darkling', name: 'Desert Darkling Beetle', icon: '⚫', rarity: 'common', type: 'beetle', habitat: 'desert_dunes', description: 'A matte-black beetle that stands on its head to collect morning fog for drinking.', basePower: 6, evolveFrom: null, evolveLevel: 0 },
  { id: 'glowworm', name: 'Glowworm Larva', icon: '💡', rarity: 'uncommon', type: 'caterpillar', habitat: 'crystal_cavern', description: 'Dangles sticky silk threads from cavern ceilings, glowing to attract prey.', basePower: 11, evolveFrom: null, evolveLevel: 0 },
  { id: 'peacock_butterfly', name: 'Peacock Butterfly', icon: '🦋', rarity: 'uncommon', type: 'butterfly', habitat: 'meadow_garden', description: 'Stunning eye-spots on its wings startle predators with the illusion of an owl.', basePower: 13, evolveFrom: null, evolveLevel: 0 },
  { id: 'tunnel_wasp', name: 'Tunnel Digger Wasp', icon: '🐝', rarity: 'common', type: 'wasp', habitat: 'underground_colony', description: 'Excavates perfect cylindrical tunnels to create nurseries for its young.', basePower: 7, evolveFrom: null, evolveLevel: 0 },
  { id: 'amber_scorpion', name: 'Amber Scorpion', icon: '🦂', rarity: 'epic', type: 'scorpion', habitat: 'desert_dunes', description: 'Encased in amber-colored armor that fossilizes upon death, preserving it eternally.', basePower: 36, evolveFrom: null, evolveLevel: 0 },
  { id: 'crimson_lacewing', name: 'Crimson Lacewing', icon: '❤️', rarity: 'rare', type: 'dragonfly', habitat: 'moonlit_grove', description: 'Elegant net-veined wings of deep crimson that glow under moonlight like stained glass.', basePower: 24, evolveFrom: null, evolveLevel: 0 },
  // Additional evolved forms
  { id: 'armored_beetle_king', name: 'Armored Beetle King', icon: '🛡️', rarity: 'rare', type: 'beetle', habitat: 'desert_dunes', description: 'Evolved from the desert darkling into an unstoppable living tank of the sands.', basePower: 28, evolveFrom: 'desert_darkling', evolveLevel: 10 },
  { id: 'glowworm_spirit', name: 'Glowworm Spirit', icon: '👻', rarity: 'epic', type: 'caterpillar', habitat: 'crystal_cavern', description: 'An evolved glowworm whose bioluminescence can illuminate entire cavern systems.', basePower: 37, evolveFrom: 'glowworm', evolveLevel: 14 },
]

// === 8 HABITATS ===

export const IK_HABITAT_MEADOW_GARDEN: IkHabitatDef = {
  id: 'meadow_garden',
  name: 'Meadow Garden',
  icon: '🌷',
  description: 'A sun-drenched meadow filled with wildflowers, buzzing with gentle insect life.',
  unlockLevel: 1,
  rarityWeights: { common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 1 },
  background: 'linear-gradient(135deg, #84CC16, #22C55E)',
}

export const IK_HABITAT_RAINFOREST_CANOPY: IkHabitatDef = {
  id: 'rainforest_canopy',
  name: 'Rainforest Canopy',
  icon: '🌿',
  description: 'Dense tropical treetops where exotic insects thrive among orchids and vines.',
  unlockLevel: 1,
  rarityWeights: { common: 45, uncommon: 30, rare: 15, epic: 7, legendary: 3 },
  background: 'linear-gradient(135deg, #059669, #10B981)',
}

export const IK_HABITAT_DESERT_DUNES: IkHabitatDef = {
  id: 'desert_dunes',
  name: 'Desert Dunes',
  icon: '🏜️',
  description: 'Scorching golden sands where only the toughest insects survive and thrive.',
  unlockLevel: 5,
  rarityWeights: { common: 35, uncommon: 30, rare: 20, epic: 10, legendary: 5 },
  background: 'linear-gradient(135deg, #D4A853, #C2956B)',
}

export const IK_HABITAT_UNDERGROUND_COLONY: IkHabitatDef = {
  id: 'underground_colony',
  name: 'Underground Colony',
  icon: '🕳️',
  description: 'A vast subterranean network of tunnels ruled by ancient insect civilizations.',
  unlockLevel: 10,
  rarityWeights: { common: 30, uncommon: 35, rare: 20, epic: 10, legendary: 5 },
  background: 'linear-gradient(135deg, #78350F, #92400E)',
}

export const IK_HABITAT_MOUNTAIN_STREAM: IkHabitatDef = {
  id: 'mountain_stream',
  name: 'Mountain Stream',
  icon: '🏞️',
  description: 'Crystal-clear alpine streams surrounded by moss and mist.',
  unlockLevel: 15,
  rarityWeights: { common: 25, uncommon: 30, rare: 25, epic: 13, legendary: 7 },
  background: 'linear-gradient(135deg, #6EE7B7, #34D399)',
}

export const IK_HABITAT_VOLCANIC_ASH_FIELD: IkHabitatDef = {
  id: 'volcanic_ash_field',
  name: 'Volcanic Ash Field',
  icon: '🌋',
  description: 'Smoldering volcanic terrain where fire-resistant insects forge their strength.',
  unlockLevel: 25,
  rarityWeights: { common: 20, uncommon: 25, rare: 30, epic: 16, legendary: 9 },
  background: 'linear-gradient(135deg, #B91C1C, #DC2626)',
}

export const IK_HABITAT_MOONLIT_GROVE: IkHabitatDef = {
  id: 'moonlit_grove',
  name: 'Moonlit Grove',
  icon: '🌙',
  description: 'An enchanted forest glade bathed in perpetual silver moonlight.',
  unlockLevel: 20,
  rarityWeights: { common: 20, uncommon: 30, rare: 28, epic: 15, legendary: 7 },
  background: 'linear-gradient(135deg, #1E293B, #334155)',
}

export const IK_HABITAT_CRYSTAL_CAVERN: IkHabitatDef = {
  id: 'crystal_cavern',
  name: 'Crystal Cavern',
  icon: '💎',
  description: 'Luminous underground caves where crystals hum with ancient energy.',
  unlockLevel: 30,
  rarityWeights: { common: 15, uncommon: 25, rare: 30, epic: 20, legendary: 10 },
  background: 'linear-gradient(135deg, #047857, #059669)',
}

export const IK_HABITATS: IkHabitatDef[] = [
  IK_HABITAT_MEADOW_GARDEN,
  IK_HABITAT_RAINFOREST_CANOPY,
  IK_HABITAT_DESERT_DUNES,
  IK_HABITAT_UNDERGROUND_COLONY,
  IK_HABITAT_MOUNTAIN_STREAM,
  IK_HABITAT_VOLCANIC_ASH_FIELD,
  IK_HABITAT_MOONLIT_GROVE,
  IK_HABITAT_CRYSTAL_CAVERN,
]

// === 6 FOOD TYPES ===

export const IK_FOOD_NECTAR_DROP: IkFoodDef = {
  id: 'nectar_drop', name: 'Nectar Drop', icon: '🍯',
  xpValue: 10, happinessBonus: 5, description: 'Sweet flower nectar, a staple food for many insects.',
}
export const IK_FOOD_POLLEN_BALL: IkFoodDef = {
  id: 'pollen_ball', name: 'Pollen Ball', icon: '🌾',
  xpValue: 8, happinessBonus: 3, description: 'Concentrated pollen packed with energy and nutrients.',
}
export const IK_FOOD_SAP_LICK: IkFoodDef = {
  id: 'sap_lick', name: 'Sap Lick', icon: '🪵',
  xpValue: 12, happinessBonus: 4, description: 'Tree sap rich in minerals that strengthens exoskeletons.',
}
export const IK_FOOD_FRUIT_SLICE: IkFoodDef = {
  id: 'fruit_slice', name: 'Fruit Slice', icon: '🍎',
  xpValue: 15, happinessBonus: 8, description: 'Fresh fruit bursting with natural sugars and vitamins.',
}
export const IK_FOOD_HONEYCOMB: IkFoodDef = {
  id: 'honeycomb', name: 'Honeycomb', icon: '🐝',
  xpValue: 20, happinessBonus: 10, description: 'Pure golden honeycomb, the ultimate insect delicacy.',
}
export const IK_FOOD_DEWDROP: IkFoodDef = {
  id: 'dewdrop', name: 'Dewdrop', icon: '💧',
  xpValue: 5, happinessBonus: 2, description: 'A simple morning dewdrop, refreshing and pure.',
}

export const IK_FOOD: IkFoodDef[] = [
  IK_FOOD_NECTAR_DROP,
  IK_FOOD_POLLEN_BALL,
  IK_FOOD_SAP_LICK,
  IK_FOOD_FRUIT_SLICE,
  IK_FOOD_HONEYCOMB,
  IK_FOOD_DEWDROP,
]

// === COLOR THEME CONSTANTS ===

export const IK_COLOR_LIME = '#84CC16'
export const IK_COLOR_GREEN = '#22C55E'
export const IK_COLOR_EMERALD = '#10B981'
export const IK_COLOR_DARK_EMERALD = '#059669'
export const IK_COLOR_DEEP_EMERALD = '#047857'
export const IK_COLOR_MINT = '#34D399'
export const IK_COLOR_LEAF = '#6EE7B7'
export const IK_COLOR_MOSS = '#A7F3D0'
export const IK_COLOR_LIME_BRIGHT = '#A3E635'
export const IK_COLOR_NECTAR = '#FCD34D'
export const IK_COLOR_AMBER = '#F59E0B'
export const IK_COLOR_HONEY = '#FBBF24'

export const IK_INSECT_TYPES: IkInsectType[] = [
  'beetle', 'butterfly', 'ant', 'mantis', 'dragonfly', 'moth', 'bee',
  'spider', 'scorpion', 'cicada', 'firefly', 'cricket', 'grasshopper',
  'ladybug', 'wasp', 'termite', 'stickbug', 'centipede', 'caterpillar',
]

export const IK_TYPE_ICONS: Record<IkInsectType, string> = {
  beetle: '🪲', butterfly: '🦋', ant: '🐜', mantis: '🦟', dragonfly: '🪰',
  moth: '🦋', bee: '🐝', spider: '🕷️', scorpion: '🦂', cicada: '🪲',
  firefly: '✨', cricket: '🦗', grasshopper: '🦗', ladybug: '🐞', wasp: '🐝',
  termite: '🐜', stickbug: '🪵', centipede: '🐛', caterpillar: '🐛',
}

export const IK_TYPE_LABELS: Record<IkInsectType, string> = {
  beetle: 'Beetle', butterfly: 'Butterfly', ant: 'Ant', mantis: 'Mantis',
  dragonfly: 'Dragonfly', moth: 'Moth', bee: 'Bee', spider: 'Spider',
  scorpion: 'Scorpion', cicada: 'Cicada', firefly: 'Firefly', cricket: 'Cricket',
  grasshopper: 'Grasshopper', ladybug: 'Ladybug', wasp: 'Wasp',
  termite: 'Termite', stickbug: 'Stick Bug', centipede: 'Centipede',
  caterpillar: 'Caterpillar',
}

export const IK_HABITAT_TIPS: Record<IkHabitatId, string> = {
  meadow_garden: 'Start here! Common insects are abundant and easy to catch in the gentle meadow.',
  rainforest_canopy: 'The canopy hides many uncommon species. Bring a good magnifier to spot camouflaged insects.',
  desert_dunes: 'Only tough insects survive here. Higher rarity chances but more dangerous species.',
  underground_colony: 'The deep tunnels hold ancient species. Explore carefully — some insects are territorial.',
  mountain_stream: 'Crystal-clear waters attract elegant dragonflies and rare predators near the banks.',
  volcanic_ash_field: 'Fire-resistant insects live here among the embers. Epic and legendary species thrive in the heat.',
  moonlit_grove: 'Nocturnal species glow under the moonlight. Moths and fireflies are most active here.',
  crystal_cavern: 'The rarest habitat. Crystals amplify insect power and attract legendary specimens.',
}

export const IK_HABITAT_ICONS: Record<IkHabitatId, string> = {
  meadow_garden: '🌷', rainforest_canopy: '🌿', desert_dunes: '🏜️',
  underground_colony: '🕳️', mountain_stream: '🏞️', volcanic_ash_field: '🌋',
  moonlit_grove: '🌙', crystal_cavern: '💎',
}

export const IK_RARITY_COLORS: Record<IkRarity, string> = {
  common: '#84CC16', uncommon: '#22C55E', rare: '#10B981', epic: '#059669', legendary: '#047857',
}

export const IK_RARITY_ICONS: Record<IkRarity, string> = {
  common: '⬜', uncommon: '🟩', rare: '💎', epic: '🔱', legendary: '👑',
}

export const IK_SLOT_ICONS: Record<IkEquipSlot, string> = {
  net: '🥅', jar: '🫙', magnifier: '🔍', armor: '🛡️', boots: '👢', lantern: '🕯️',
}

export const IK_SLOT_LABELS: Record<IkEquipSlot, string> = {
  net: 'Net', jar: 'Jar', magnifier: 'Magnifier', armor: 'Armor', boots: 'Boots', lantern: 'Lantern',
}

// === 28 EQUIPMENT ITEMS ===

export const IK_EQUIPMENT: IkEquipmentDef[] = [
  // Nets (4)
  { id: 'basic_net', name: 'Basic Sweep Net', icon: '🏊', rarity: 'common', slot: 'net', bonus: 5, description: 'A simple net for catching the most common insects.', cost: 0 },
  { id: ' reinforced_net', name: 'Reinforced Mesh Net', icon: '🥅', rarity: 'uncommon', slot: 'net', bonus: 12, description: 'Stronger mesh that prevents escapes from uncommon insects.', cost: 200 },
  { id: 'enchanted_net', name: 'Enchanted Silk Net', icon: '🕸️', rarity: 'rare', slot: 'net', bonus: 22, description: 'Woven from enchanted spider silk, it mesmerizes rare insects.', cost: 800 },
  { id: 'legendary_net', name: 'Net of the Ancients', icon: '🌀', rarity: 'legendary', slot: 'net', bonus: 40, description: 'An artifact net that can catch any insect, even the mythical ones.', cost: 5000 },
  // Jars (4)
  { id: 'glass_jar', name: 'Glass Observation Jar', icon: '🫙', rarity: 'common', slot: 'jar', bonus: 3, description: 'A clear jar for safely observing caught insects.', cost: 0 },
  { id: 'ventilated_jar', name: 'Ventilated Habitat Jar', icon: '🏺', rarity: 'uncommon', slot: 'jar', bonus: 8, description: 'Improved air circulation keeps insects happier in captivity.', cost: 150 },
  { id: 'terrarium_jar', name: 'Mini Terrarium Jar', icon: '🏛️', rarity: 'rare', slot: 'jar', bonus: 15, description: 'A self-sustaining ecosystem in a jar for premium insect care.', cost: 600 },
  { id: 'quantum_jar', name: 'Quantum Containment Jar', icon: '🔮', rarity: 'legendary', slot: 'jar', bonus: 30, description: 'A jar that exists in multiple dimensions, perfectly preserving its occupant.', cost: 4000 },
  // Magnifiers (4)
  { id: 'hand_lens', name: 'Hand Lens', icon: '🔍', rarity: 'common', slot: 'magnifier', bonus: 5, description: 'A basic magnifying glass for spotting hidden insects.', cost: 0 },
  { id: 'jewelers_loupe', name: "Jeweler's Loupe", icon: '💎', rarity: 'uncommon', slot: 'magnifier', bonus: 10, description: 'Professional-grade optics that reveal insect details invisible to the naked eye.', cost: 250 },
  { id: 'electron_scope', name: 'Electron Scope', icon: '🔬', rarity: 'rare', slot: 'magnifier', bonus: 20, description: 'Advanced technology that detects the rarest insects by their bio-signatures.', cost: 900 },
  { id: 'omni_lens', name: 'Omni-Perception Lens', icon: '👁️', rarity: 'epic', slot: 'magnifier', bonus: 30, description: 'Sees through every disguise, camouflage, and dimension barrier.', cost: 2500 },
  // Armor (4)
  { id: 'leaf_shield', name: 'Leaf Shield', icon: '🍃', rarity: 'common', slot: 'armor', bonus: 3, description: 'Armor made from hardened leaves, basic protection for your insects.', cost: 100 },
  { id: 'bark_armor', name: 'Bark Plating', icon: '🪵', rarity: 'uncommon', slot: 'armor', bonus: 8, description: 'Tough bark armor that doubles as natural camouflage.', cost: 300 },
  { id: 'chitin_plate', name: 'Chitin Plate Mail', icon: '🛡️', rarity: 'rare', slot: 'armor', bonus: 15, description: 'Forged from shed chitin of powerful insects, very protective.', cost: 1000 },
  { id: 'diamond_carapace', name: 'Diamond Carapace', icon: '💠', rarity: 'legendary', slot: 'armor', bonus: 35, description: 'The ultimate defense, encased in crystallized diamond-hard chitin.', cost: 6000 },
  // Boots (4)
  { id: 'leaf_sandals', name: 'Leaf Sandals', icon: '🍃', rarity: 'common', slot: 'boots', bonus: 3, description: 'Light footwear that muffles footsteps near wary insects.', cost: 80 },
  { id: 'moss_grippers', name: 'Moss Grippers', icon: '🥾', rarity: 'uncommon', slot: 'boots', bonus: 7, description: 'Non-slip boots for navigating damp habitats without disturbing insects.', cost: 200 },
  { id: 'wind_striders', name: 'Wind Striders', icon: '👟', rarity: 'rare', slot: 'boots', bonus: 14, description: 'Enchanted boots that let you move as silently as a breeze.', cost: 700 },
  { id: 'phase_boots', name: 'Phase Boots', icon: '👢', rarity: 'epic', slot: 'boots', bonus: 25, description: 'Step between dimensions, appearing anywhere without warning.', cost: 3000 },
  // Lanterns (4)
  { id: 'candle_lantern', name: 'Candle Lantern', icon: '🕯️', rarity: 'common', slot: 'lantern', bonus: 2, description: 'A simple lantern that attracts nocturnal insects with its warm glow.', cost: 50 },
  { id: 'firefly_lantern', name: 'Firefly Lantern', icon: '✨', rarity: 'uncommon', slot: 'lantern', bonus: 6, description: 'Contains live fireflies that produce an irresistible natural glow.', cost: 180 },
  { id: 'moonstone_lamp', name: 'Moonstone Lamp', icon: '🌙', rarity: 'rare', slot: 'lantern', bonus: 12, description: 'Powered by moonstone, it mimics moonlight to attract the rarest moths.', cost: 850 },
  { id: 'aurora_beacon', name: 'Aurora Beacon', icon: '🌟', rarity: 'legendary', slot: 'lantern', bonus: 28, description: 'Projects dancing aurora light that lures every insect from miles around.', cost: 4500 },
  // Extra equipment (4)
  { id: 'silk_glove', name: 'Silk Handler Glove', icon: '🧤', rarity: 'uncommon', slot: 'armor', bonus: 6, description: 'Fine silk gloves that let you handle insects without triggering their defenses.', cost: 120 },
  { id: 'pheromone_bait', name: 'Pheromone Bait', icon: '🧪', rarity: 'rare', slot: 'lantern', bonus: 16, description: 'Synthetic insect pheromones that attract target species from great distances.', cost: 750 },
  { id: 'night_vision_goggles', name: 'Night Vision Goggles', icon: '🥽', rarity: 'epic', slot: 'magnifier', bonus: 26, description: 'See perfectly in total darkness — essential for moonlit grove exploration.', cost: 2200 },
  { id: 'goliath_net', name: 'Goliath Capture Net', icon: '🕸️', rarity: 'epic', slot: 'net', bonus: 32, description: 'Enormous reinforced net designed specifically for capturing legendary specimens.', cost: 3500 },
]

// === 8 TITLES ===

export const IK_TITLES: IkTitleDef[] = [
  { name: 'Larva', levelRequired: 1, icon: '🥚', description: 'A tiny larva just beginning its journey in the insect kingdom.' },
  { name: 'Nymph', levelRequired: 5, icon: '🌱', description: 'A growing nymph discovering the wonders of the miniature world.' },
  { name: 'Pupa', levelRequired: 10, icon: '🫘', description: 'Preparing for transformation, knowledge is crystallizing.' },
  { name: 'Imago', levelRequired: 18, icon: '🦋', description: 'Fully formed, spreading wings into the wider insect kingdom.' },
  { name: 'Swarm Commander', levelRequired: 25, icon: '⚔️', description: 'Commands respect from insects across every habitat.' },
  { name: 'Hive Master', levelRequired: 33, icon: '🏰', description: 'Builder and ruler of thriving insect colonies.' },
  { name: 'Metamorphosis Sage', levelRequired: 42, icon: '🧙', description: 'Understands the deepest secrets of insect transformation.' },
  { name: 'Insect Overlord', levelRequired: 50, icon: '👑', description: 'Supreme ruler of all six-legged creatures, the apex entomologist.' },
]

// === 14 ACHIEVEMENTS ===

export const IK_ACHIEVEMENTS: IkAchievementDef[] = [
  { id: 'ach_first_catch', name: 'First Catch', icon: '🪲', description: 'Catch your very first insect.', conditionKey: 'totalCaught', targetValue: 1, rewardXP: 20, rewardCoins: 25 },
  { id: 'ach_catch_10', name: 'Bug Collector', icon: '📦', description: 'Catch a total of 10 insects.', conditionKey: 'totalCaught', targetValue: 10, rewardXP: 100, rewardCoins: 100 },
  { id: 'ach_catch_50', name: 'Entomologist', icon: '🔬', description: 'Catch a total of 50 insects.', conditionKey: 'totalCaught', targetValue: 50, rewardXP: 500, rewardCoins: 500 },
  { id: 'ach_catch_200', name: 'Grand Collector', icon: '🏛️', description: 'Catch a total of 200 insects.', conditionKey: 'totalCaught', targetValue: 200, rewardXP: 2000, rewardCoins: 2000 },
  { id: 'ach_first_evolve', name: 'First Metamorphosis', icon: '🦋', description: 'Evolve your first insect through metamorphosis.', conditionKey: 'totalEvolved', targetValue: 1, rewardXP: 50, rewardCoins: 75 },
  { id: 'ach_evolve_10', name: 'Master Evolver', icon: '🧬', description: 'Evolve 10 insects total.', conditionKey: 'totalEvolved', targetValue: 10, rewardXP: 300, rewardCoins: 300 },
  { id: 'ach_first_release', name: 'Kind Heart', icon: '💚', description: 'Release your first insect back to the wild.', conditionKey: 'totalReleased', targetValue: 1, rewardXP: 30, rewardCoins: 10 },
  { id: 'ach_release_25', name: 'Conservationist', icon: '🌿', description: 'Release 25 insects to freedom.', conditionKey: 'totalReleased', targetValue: 25, rewardXP: 400, rewardCoins: 200 },
  { id: 'ach_all_habitats', name: 'World Explorer', icon: '🗺️', description: 'Unlock and explore all 8 habitats.', conditionKey: 'habitatsUnlocked', targetValue: 8, rewardXP: 600, rewardCoins: 600 },
  { id: 'ach_explore_50', name: 'Seasoned Explorer', icon: '🧭', description: 'Explore habitats 50 times total.', conditionKey: 'totalExplored', targetValue: 50, rewardXP: 250, rewardCoins: 250 },
  { id: 'ach_feed_100', name: 'Gourmet Keeper', icon: '🍯', description: 'Feed your insects 100 times.', conditionKey: 'totalFed', targetValue: 100, rewardXP: 350, rewardCoins: 300 },
  { id: 'ach_level_25', name: 'Colony Leader', icon: '🏰', description: 'Reach kingdom level 25.', conditionKey: 'level', targetValue: 25, rewardXP: 1000, rewardCoins: 1000 },
  { id: 'ach_level_50', name: 'Insect Overlord', icon: '👑', description: 'Reach the maximum kingdom level.', conditionKey: 'level', targetValue: 50, rewardXP: 5000, rewardCoins: 5000 },
  { id: 'ach_streak_7', name: 'Dedicated Keeper', icon: '📅', description: 'Maintain a 7-day daily collection streak.', conditionKey: 'bestStreak', targetValue: 7, rewardXP: 200, rewardCoins: 200 },
  { id: 'ach_streak_30', name: 'Monthly devotion', icon: '🗓️', description: 'Maintain a 30-day daily collection streak.', conditionKey: 'bestStreak', targetValue: 30, rewardXP: 1000, rewardCoins: 1000 },
  { id: 'ach_unique_20', name: 'Diversity Scholar', icon: '🔬', description: 'Own 20 unique insect species at the same time.', conditionKey: 'uniqueSpecies', targetValue: 20, rewardXP: 800, rewardCoins: 800 },
  { id: 'ach_power_500', name: 'Power Collector', icon: '💪', description: 'Have your insects reach a combined total power of 500.', conditionKey: 'totalPower', targetValue: 500, rewardXP: 600, rewardCoins: 500 },
  { id: 'ach_legendary_catch', name: 'Legend Hunter', icon: '🏆', description: 'Catch a legendary-tier insect.', conditionKey: 'legendaryCaught', targetValue: 1, rewardXP: 1500, rewardCoins: 1500 },
  { id: 'ach_full_equip', name: 'Fully Equipped', icon: '🎒', description: 'Own and equip at least one item in every equipment slot.', conditionKey: 'slotsFilled', targetValue: 6, rewardXP: 400, rewardCoins: 400 },
]

// === HELPER FUNCTIONS ===

function ikGenerateId(): string {
  return `ik_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function ikGetTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function ikGetTitleForLevel(level: number): string {
  let title = IK_TITLES[0].name
  for (const t of IK_TITLES) {
    if (level >= t.levelRequired) title = t.name
  }
  return title
}

function ikGetXpRequired(level: number): number {
  if (level <= 0) return 0
  if (level >= IK_MAX_LEVEL) return Infinity
  return IK_XP_TABLE[level] ?? 100
}

function ikRollRarity(weights: Record<IkRarity, number>): IkRarity {
  const total = Object.values(weights).reduce((s, w) => s + w, 0)
  let roll = Math.random() * total
  for (const rarity of IK_RARITIES) {
    roll -= weights[rarity.key]
    if (roll <= 0) return rarity.key
  }
  return 'common'
}

function ikGetSpeciesForHabitatAndRarity(habitatId: IkHabitatId, rarity: IkRarity): IkSpeciesDef | null {
  const eligible = IK_SPECIES.filter(
    (s) => s.habitat === habitatId && s.rarity === rarity && s.evolveFrom === null
  )
  if (eligible.length === 0) return null
  return eligible[Math.floor(Math.random() * eligible.length)]
}

function ikCalculateCatchBonus(equipment: EquipmentEntity[]): number {
  let bonus = 0
  for (const eq of equipment) {
    if (eq.equipped) {
      const def = IK_EQUIPMENT.find((e) => e.id === eq.equipmentId)
      if (def) bonus += def.bonus
    }
  }
  return bonus
}

function ikCheckAchievements(state: InsectKingdomState): AchievementEntity[] {
  const checks: Record<string, number> = {
    totalCaught: state.totalCaught,
    totalEvolved: state.totalEvolved,
    totalReleased: state.totalReleased,
    totalFed: state.totalFed,
    totalExplored: state.totalExplored,
    level: state.level,
    bestStreak: state.bestStreak,
    habitatsUnlocked: state.habitats.filter((h) => h.unlocked).length,
  }
  return state.achievements.map((a) => {
    if (a.unlocked) return a
    const def = IK_ACHIEVEMENTS.find((d) => d.id === a.id)
    if (!def) return a
    const current = checks[def.conditionKey] ?? 0
    if (current >= def.targetValue) {
      return { ...a, unlocked: true, unlockedAt: Date.now() }
    }
    return a
  })
}

function ikCreateDefaultState(): InsectKingdomState {
  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    coins: 50,
    insects: [],
    habitats: IK_HABITATS.map((h) => ({
      habitatId: h.id,
      unlocked: h.unlockLevel <= 1,
      explorationCount: 0,
      lastExplored: 0,
      totalFound: 0,
    })),
    equipment: IK_EQUIPMENT.map((e) => ({
      equipmentId: e.id,
      owned: e.cost === 0,
      equipped: e.cost === 0,
      durability: 100,
      level: 1,
      obtainedAt: e.cost === 0 ? Date.now() : 0,
    })),
    achievements: IK_ACHIEVEMENTS.map((a) => ({
      id: a.id,
      unlocked: false,
      unlockedAt: 0,
    })),
    title: IK_TITLES[0].name,
    dailyCollected: false,
    dailyDate: '',
    totalCaught: 0,
    totalEvolved: 0,
    totalReleased: 0,
    metamorphosisCount: 0,
    totalFed: 0,
    totalExplored: 0,
    totalCoinsEarned: 0,
    totalCoinsSpent: 0,
    activeHabitat: 'meadow_garden',
    streak: 0,
    bestStreak: 0,
    seed: Date.now(),
    tick: 0,
  }
}

// === HOOK ===

export default function useInsectKingdom() {
  const stateRef = useRef<InsectKingdomState>(ikCreateDefaultState())
  const [state, setState] = useState<InsectKingdomState>(() => {
    if (typeof window === 'undefined') return ikCreateDefaultState()
    try {
      const saved = localStorage.getItem('insect-kingdom-save')
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...ikCreateDefaultState(), ...parsed }
      }
    } catch {
      // ignore parse errors
    }
    return ikCreateDefaultState()
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('insect-kingdom-save', JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  }, [state])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // === SIMPLE GETTERS ===

  const ikGetLevel = (): number => state.level
  const ikGetXp = (): number => state.xp
  const ikGetTotalXp = (): number => state.totalXp
  const ikGetCoins = (): number => state.coins
  const ikGetTitle = (): string => state.title
  const ikGetInsects = (): InsectEntity[] => state.insects
  const ikGetHabitats = (): HabitatEntity[] => state.habitats
  const ikGetEquipment = (): EquipmentEntity[] => state.equipment
  const ikGetAchievements = (): AchievementEntity[] => state.achievements
  const ikGetDailyCollected = (): boolean => state.dailyCollected
  const ikGetDailyDate = (): string => state.dailyDate
  const ikGetTotalCaught = (): number => state.totalCaught
  const ikGetTotalEvolved = (): number => state.totalEvolved
  const ikGetTotalReleased = (): number => state.totalReleased
  const ikGetMetamorphosisCount = (): number => state.metamorphosisCount
  const ikGetTotalFed = (): number => state.totalFed
  const ikGetTotalExplored = (): number => state.totalExplored
  const ikGetTotalCoinsEarned = (): number => state.totalCoinsEarned
  const ikGetTotalCoinsSpent = (): number => state.totalCoinsSpent
  const ikGetActiveHabitat = (): IkHabitatId => state.activeHabitat
  const ikGetStreak = (): number => state.streak
  const ikGetBestStreak = (): number => state.bestStreak
  const ikGetInsectCount = (): number => state.insects.length
  const ikGetSeed = (): number => state.seed
  const ikGetTick = (): number => state.tick
  const ikGetUnlockedHabitatCount = (): number => state.habitats.filter((h) => h.unlocked).length
  const ikGetEquippedItemCount = (): number => state.equipment.filter((e) => e.equipped).length
  const ikGetOwnedEquipmentCount = (): number => state.equipment.filter((e) => e.owned).length
  const ikGetUnlockedAchievementCount = (): number => state.achievements.filter((a) => a.unlocked).length
  const ikGetCatchBonus = (): number => ikCalculateCatchBonus(state.equipment)
  const ikGetTodayKey = (): string => ikGetTodayKey()
  const ikGetXpRequired = (): number => ikGetXpRequiredForLevel(state.level)
  const ikGetXpProgress = (): number => {
    const needed = ikGetXpRequiredForLevel(state.level)
    if (needed === Infinity || needed <= 0) return 1
    return Math.min(1, state.xp / needed)
  }
  const ikGetOverallProgress = (): number => state.level / IK_MAX_LEVEL

  function ikGetXpRequiredForLevel(level: number): number {
    if (level <= 0) return 0
    if (level >= IK_MAX_LEVEL) return Infinity
    return IK_XP_TABLE[level] ?? 100
  }

  // === STATE MODIFIERS (useCallback) ===

  const ikAddXp = useCallback((amount: number) => {
    setState((prev) => {
      let { level, xp, totalXp } = prev
      const gained = Math.floor(amount)
      xp += gained
      totalXp += gained
      while (level < IK_MAX_LEVEL && xp >= ikGetXpRequiredForLevel(level)) {
        xp -= ikGetXpRequiredForLevel(level)
        level += 1
      }
      if (level >= IK_MAX_LEVEL) xp = 0
      const title = ikGetTitleForLevel(level)
      return { ...prev, level: Math.min(level, IK_MAX_LEVEL), xp, totalXp, title }
    })
  }, [])

  const ikAddCoins = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      coins: prev.coins + Math.floor(amount),
      totalCoinsEarned: prev.totalCoinsEarned + Math.max(0, Math.floor(amount)),
    }))
  }, [])

  const ikSpendCoins = useCallback((amount: number): boolean => {
    let success = false
    setState((prev) => {
      if (prev.coins < amount) return prev
      success = true
      return {
        ...prev,
        coins: prev.coins - Math.floor(amount),
        totalCoinsSpent: prev.totalCoinsSpent + Math.floor(amount),
      }
    })
    return success
  }, [])

  const ikCanAfford = useCallback((amount: number): boolean => {
    return stateRef.current.coins >= amount
  }, [])

  const ikSetCoins = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, coins: Math.max(0, Math.floor(amount)) }))
  }, [])

  const ikSetLevel = useCallback((newLevel: number) => {
    setState((prev) => {
      const clamped = Math.max(1, Math.min(IK_MAX_LEVEL, Math.floor(newLevel)))
      const title = ikGetTitleForLevel(clamped)
      return { ...prev, level: clamped, title }
    })
  }, [])

  const ikSetXp = useCallback((newXp: number) => {
    setState((prev) => ({ ...prev, xp: Math.max(0, Math.floor(newXp)) }))
  }, [])

  const ikBoostHappiness = useCallback((insectId: string, amount: number) => {
    setState((prev) => ({
      ...prev,
      insects: prev.insects.map((i) =>
        i.id === insectId
          ? { ...i, happiness: Math.min(100, Math.max(0, i.happiness + amount)) }
          : i
      ),
    }))
  }, [])

  const ikBoostAllHappiness = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      insects: prev.insects.map((i) => ({
        ...i,
        happiness: Math.min(100, Math.max(0, i.happiness + amount)),
      })),
    }))
  }, [])

  const ikTrainInsect = useCallback((insectId: string) => {
    setState((prev) => ({
      ...prev,
      insects: prev.insects.map((i) => {
        if (i.id !== insectId) return i
        return { ...i, power: i.power + 1 }
      }),
    }))
  }, [])

  const ikTrainAllInsects = useCallback(() => {
    setState((prev) => ({
      ...prev,
      insects: prev.insects.map((i) => ({ ...i, power: i.power + 1 })),
    }))
  }, [])

  const ikSellInsect = useCallback((insectId: string): number => {
 const insect = stateRef.current.insects.find((i) => i.id === insectId)
    if (!insect) return 0
    const speciesDef = IK_SPECIES.find((s) => s.id === insect.speciesId)
    const sellValue = speciesDef ? Math.floor(speciesDef.basePower * 0.8) : 5
    setState((prev) => ({
      ...prev,
      insects: prev.insects.filter((i) => i.id !== insectId),
      coins: prev.coins + sellValue,
      totalCoinsEarned: prev.totalCoinsEarned + sellValue,
    }))
    return sellValue
  }, [])

  const ikSellAllCommons = useCallback((): number => {
 const commons = stateRef.current.insects.filter((i) => {
      const def = IK_SPECIES.find((s) => s.id === i.speciesId)
      return def?.rarity === 'common'
    })
    const idsToRemove = commons.map((i) => i.id)
    const totalValue = idsToRemove.length * 5
    if (idsToRemove.length === 0) return 0
    setState((prev) => ({
      ...prev,
      insects: prev.insects.filter((i) => !idsToRemove.includes(i.id)),
      coins: prev.coins + totalValue,
      totalCoinsEarned: prev.totalCoinsEarned + totalValue,
      totalReleased: prev.totalReleased + idsToRemove.length,
    }))
    return totalValue
  }, [])

  const ikDuplicateInsect = useCallback((insectId: string): InsectEntity | null => {
    const original = stateRef.current.insects.find((i) => i.id === insectId)
    if (!original) return null
    const clone: InsectEntity = {
      ...original,
      id: ikGenerateId(),
      nickname: original.nickname + ' Clone',
      caughtAt: Date.now(),
    }
    setState((prev) => ({ ...prev, insects: [...prev.insects, clone] }))
    return clone
  }, [])

  const ikCatchInsect = useCallback((speciesId: string): InsectEntity | null => {
    const speciesDef = IK_SPECIES.find((s) => s.id === speciesId)
    if (!speciesDef) return null
    const newInsect: InsectEntity = {
      id: ikGenerateId(),
      speciesId,
      nickname: speciesDef.name,
      level: 1,
      xp: 0,
      happiness: 50,
      power: speciesDef.basePower,
      caughtAt: Date.now(),
      fedToday: false,
      evolved: false,
    }
    setState((prev) => ({
      ...prev,
      insects: [...prev.insects, newInsect],
      totalCaught: prev.totalCaught + 1,
      xp: prev.xp + speciesDef.basePower,
      totalXp: prev.totalXp + speciesDef.basePower,
      coins: prev.coins + Math.floor(speciesDef.basePower * 0.5),
      totalCoinsEarned: prev.totalCoinsEarned + Math.floor(speciesDef.basePower * 0.5),
    }))
    return newInsect
  }, [])

  const ikReleaseInsect = useCallback((insectId: string) => {
    setState((prev) => ({
      ...prev,
      insects: prev.insects.filter((i) => i.id !== insectId),
      totalReleased: prev.totalReleased + 1,
      coins: prev.coins + 10,
      totalCoinsEarned: prev.totalCoinsEarned + 10,
    }))
  }, [])

  const ikReleaseMultiple = useCallback((insectIds: string[]) => {
    const idSet = new Set(insectIds)
    setState((prev) => ({
      ...prev,
      insects: prev.insects.filter((i) => !idSet.has(i.id)),
      totalReleased: prev.totalReleased + insectIds.length,
      coins: prev.coins + insectIds.length * 10,
      totalCoinsEarned: prev.totalCoinsEarned + insectIds.length * 10,
    }))
  }, [])

  const ikEvolveInsect = useCallback((insectId: string): boolean => {
    const s = stateRef.current
    const insect = s.insects.find((i) => i.id === insectId)
    if (!insect) return false
    const speciesDef = IK_SPECIES.find((sp) => sp.id === insect.speciesId)
    if (!speciesDef) return false
    const evolvedForms = IK_SPECIES.filter((sp) => sp.evolveFrom === insect.speciesId)
    if (evolvedForms.length === 0) return false
    const targetForm = evolvedForms[0]
    if (insect.level < targetForm.evolveLevel) return false
    setState((prev) => ({
      ...prev,
      insects: prev.insects.map((i) =>
        i.id === insectId
          ? {
              ...i,
              speciesId: targetForm.id,
              nickname: targetForm.name,
              evolved: true,
              power: targetForm.basePower,
            }
          : i
      ),
      totalEvolved: prev.totalEvolved + 1,
      metamorphosisCount: prev.metamorphosisCount + 1,
    }))
    return true
  }, [])

  const ikFeedInsect = useCallback((insectId: string, foodId: string) => {
    const foodDef = IK_FOOD.find((f) => f.id === foodId)
    if (!foodDef) return
    setState((prev) => ({
      ...prev,
      insects: prev.insects.map((i) => {
        if (i.id !== insectId) return i
        let newXp = i.xp + foodDef.xpValue
        let newLevel = i.level
        while (newLevel < IK_MAX_LEVEL && newXp >= ikGetXpRequiredForLevel(newLevel)) {
          newXp -= ikGetXpRequiredForLevel(newLevel)
          newLevel += 1
        }
        if (newLevel >= IK_MAX_LEVEL) newXp = 0
        const newHappiness = Math.min(100, i.happiness + foodDef.happinessBonus)
        const newPower = i.power + Math.floor(foodDef.xpValue * 0.1)
        return {
          ...i,
          xp: newXp,
          level: newLevel,
          happiness: newHappiness,
          power: newPower,
          fedToday: true,
        }
      }),
      totalFed: prev.totalFed + 1,
    }))
  }, [])

  const ikFeedAllInsects = useCallback((foodId: string) => {
    const foodDef = IK_FOOD.find((f) => f.id === foodId)
    if (!foodDef) return
    setState((prev) => ({
      ...prev,
      insects: prev.insects.map((i) => {
        if (i.fedToday) return i
        let newXp = i.xp + foodDef.xpValue
        let newLevel = i.level
        while (newLevel < IK_MAX_LEVEL && newXp >= ikGetXpRequiredForLevel(newLevel)) {
          newXp -= ikGetXpRequiredForLevel(newLevel)
          newLevel += 1
        }
        if (newLevel >= IK_MAX_LEVEL) newXp = 0
        return {
          ...i,
          xp: newXp,
          level: newLevel,
          happiness: Math.min(100, i.happiness + foodDef.happinessBonus),
          power: i.power + Math.floor(foodDef.xpValue * 0.1),
          fedToday: true,
        }
      }),
      totalFed: prev.totalFed + prev.insects.filter((i) => !i.fedToday).length,
    }))
  }, [])

  const ikEquipItem = useCallback((equipmentId: string) => {
    setState((prev) => {
      const eqDef = IK_EQUIPMENT.find((e) => e.id === equipmentId)
      if (!eqDef) return prev
      const alreadyEquipped = prev.equipment.find(
        (e) => e.equipped && e.equipmentId !== equipmentId && IK_EQUIPMENT.find((d) => d.id === e.equipmentId)?.slot === eqDef.slot
      )
      return {
        ...prev,
        equipment: prev.equipment.map((e) => {
          if (e.equipmentId === equipmentId) return { ...e, equipped: true }
          if (alreadyEquipped && e.equipmentId === alreadyEquipped.equipmentId) return { ...e, equipped: false }
          return e
        }),
      }
    })
  }, [])

  const ikUnequipItem = useCallback((equipmentId: string) => {
    setState((prev) => ({
      ...prev,
      equipment: prev.equipment.map((e) =>
        e.equipmentId === equipmentId ? { ...e, equipped: false } : e
      ),
    }))
  }, [])

  const ikBuyEquipment = useCallback((equipmentId: string): boolean => {
    const eqDef = IK_EQUIPMENT.find((e) => e.id === equipmentId)
    if (!eqDef) return false
    let purchased = false
    setState((prev) => {
      if (prev.coins < eqDef.cost) return prev
      const alreadyOwned = prev.equipment.find((e) => e.equipmentId === equipmentId)
      if (alreadyOwned && alreadyOwned.owned) return prev
      purchased = true
      return {
        ...prev,
        coins: prev.coins - eqDef.cost,
        totalCoinsSpent: prev.totalCoinsSpent + eqDef.cost,
        equipment: prev.equipment.map((e) =>
          e.equipmentId === equipmentId
            ? { ...e, owned: true, obtainedAt: Date.now() }
            : e
        ),
      }
    })
    return purchased
  }, [])

  const ikExploreHabitat = useCallback((habitatId: IkHabitatId): IkSpeciesDef | null => {
    const habitat = stateRef.current.habitats.find((h) => h.habitatId === habitatId)
    if (!habitat || !habitat.unlocked) return null
    const habitatDef = IK_HABITATS.find((h) => h.id === habitatId)
    if (!habitatDef) return null
    const rarity = ikRollRarity(habitatDef.rarityWeights)
    const species = ikGetSpeciesForHabitatAndRarity(habitatId, rarity)
    setState((prev) => ({
      ...prev,
      habitats: prev.habitats.map((h) =>
        h.habitatId === habitatId
          ? { ...h, explorationCount: h.explorationCount + 1, lastExplored: Date.now(), totalFound: h.totalFound + (species ? 1 : 0) }
          : h
      ),
      totalExplored: prev.totalExplored + 1,
      xp: prev.xp + 5,
      totalXp: prev.totalXp + 5,
      coins: prev.coins + 3,
      totalCoinsEarned: prev.totalCoinsEarned + 3,
      activeHabitat: habitatId,
      tick: prev.tick + 1,
      achievements: ikCheckAchievements({
        ...prev,
        totalExplored: prev.totalExplored + 1,
        habitats: prev.habitats.map((h) =>
          h.habitatId === habitatId ? { ...h, explorationCount: h.explorationCount + 1 } : h
        ),
      }),
    }))
    return species
  }, [])

  const ikSetActiveHabitat = useCallback((habitatId: IkHabitatId) => {
    setState((prev) => ({ ...prev, activeHabitat: habitatId }))
  }, [])

  const ikUnlockHabitat = useCallback((habitatId: IkHabitatId): boolean => {
    const habitatDef = IK_HABITATS.find((h) => h.id === habitatId)
    if (!habitatDef) return false
    let unlocked = false
    setState((prev) => {
      if (prev.level < habitatDef.unlockLevel) return prev
      const alreadyUnlocked = prev.habitats.find((h) => h.habitatId === habitatId && h.unlocked)
      if (alreadyUnlocked) return prev
      unlocked = true
      return {
        ...prev,
        habitats: prev.habitats.map((h) =>
          h.habitatId === habitatId ? { ...h, unlocked: true } : h
        ),
        achievements: ikCheckAchievements({
          ...prev,
          habitats: prev.habitats.map((h) =>
            h.habitatId === habitatId ? { ...h, unlocked: true } : h
          ),
        }),
      }
    })
    return unlocked
  }, [])

  const ikUnlockAllAvailableHabitats = useCallback(() => {
    setState((prev) => {
      const updatedHabitats = prev.habitats.map((h) => {
        const def = IK_HABITATS.find((d) => d.id === h.habitatId)
        if (def && prev.level >= def.unlockLevel) return { ...h, unlocked: true }
        return h
      })
      const updated = { ...prev, habitats: updatedHabitats }
      return { ...updated, achievements: ikCheckAchievements(updated) }
    })
  }, [])

  const ikRenameInsect = useCallback((insectId: string, nickname: string) => {
    setState((prev) => ({
      ...prev,
      insects: prev.insects.map((i) =>
        i.id === insectId ? { ...i, nickname: nickname.slice(0, 24) } : i
      ),
    }))
  }, [])

  const ikUpgradeEquipment = useCallback((equipmentId: string) => {
    setState((prev) => ({
      ...prev,
      equipment: prev.equipment.map((e) =>
        e.equipmentId === equipmentId && e.owned
          ? { ...e, level: e.level + 1, durability: 100 }
          : e
      ),
    }))
  }, [])

  const ikRepairEquipment = useCallback((equipmentId: string) => {
    setState((prev) => ({
      ...prev,
      equipment: prev.equipment.map((e) =>
        e.equipmentId === equipmentId && e.owned
          ? { ...e, durability: 100 }
          : e
      ),
    }))
  }, [])

  const ikGetDailyReward = useCallback(() => {
    const today = ikGetTodayKey()
    setState((prev) => {
      if (prev.dailyCollected && prev.dailyDate === today) return prev
      const newStreak = prev.dailyDate === getPreviousDayKey(today) ? prev.streak + 1 : 1
      const newBestStreak = Math.max(prev.bestStreak, newStreak)
      const rewardCoins = 20 + newStreak * 5
      const rewardXp = 15 + newStreak * 3
      return {
        ...prev,
        dailyCollected: true,
        dailyDate: today,
        streak: newStreak,
        bestStreak: newBestStreak,
        coins: prev.coins + rewardCoins,
        totalCoinsEarned: prev.totalCoinsEarned + rewardCoins,
        xp: prev.xp + rewardXp,
        totalXp: prev.totalXp + rewardXp,
        achievements: ikCheckAchievements({
          ...prev,
          dailyCollected: true,
          dailyDate: today,
          streak: newStreak,
          bestStreak: newBestStreak,
        }),
      }
    })
  }, [])

  const ikClaimDailyCoins = useCallback((): number => {
    const reward = 20 + stateRef.current.streak * 5
    const today = ikGetTodayKey()
    setState((prev) => {
      if (prev.dailyCollected && prev.dailyDate === today) return prev
      return {
        ...prev,
        dailyCollected: true,
        dailyDate: today,
        coins: prev.coins + reward,
        totalCoinsEarned: prev.totalCoinsEarned + reward,
      }
    })
    return reward
  }, [])

  const ikGetEvolutionOptions = useCallback((insectId: string): IkSpeciesDef[] => {
    const insect = stateRef.current.insects.find((i) => i.id === insectId)
    if (!insect) return []
    return IK_SPECIES.filter((s) => s.evolveFrom === insect.speciesId)
  }, [])

  const ikCanEvolve = useCallback((insectId: string): boolean => {
    const insect = stateRef.current.insects.find((i) => i.id === insectId)
    if (!insect) return false
    if (insect.evolved) return false
    const options = IK_SPECIES.filter((s) => s.evolveFrom === insect.speciesId)
    if (options.length === 0) return false
    return insect.level >= options[0].evolveLevel
  }, [])

  const ikGetHabitatRarityWeights = useCallback((habitatId: IkHabitatId): Record<IkRarity, number> | null => {
    const def = IK_HABITATS.find((h) => h.id === habitatId)
    return def ? { ...def.rarityWeights } : null
  }, [])

  const ikGetSpeciesDef = useCallback((speciesId: string): IkSpeciesDef | null => {
    return IK_SPECIES.find((s) => s.id === speciesId) ?? null
  }, [])

  const ikGetHabitatDef = useCallback((habitatId: IkHabitatId): IkHabitatDef | null => {
    return IK_HABITATS.find((h) => h.id === habitatId) ?? null
  }, [])

  const ikGetFoodDef = useCallback((foodId: string): IkFoodDef | null => {
    return IK_FOOD.find((f) => f.id === foodId) ?? null
  }, [])

  const ikGetEquipmentDef = useCallback((equipmentId: string): IkEquipmentDef | null => {
    return IK_EQUIPMENT.find((e) => e.id === equipmentId) ?? null
  }, [])

  const ikGetInsectById = useCallback((insectId: string): InsectEntity | null => {
    return stateRef.current.insects.find((i) => i.id === insectId) ?? null
  }, [])

  const ikGetInsectsByRarity = useCallback((rarity: IkRarity): InsectEntity[] => {
    return stateRef.current.insects.filter((i) => {
      const def = IK_SPECIES.find((s) => s.id === i.speciesId)
      return def?.rarity === rarity
    })
  }, [])

  const ikGetInsectsByHabitat = useCallback((habitatId: IkHabitatId): InsectEntity[] => {
    return stateRef.current.insects.filter((i) => {
      const def = IK_SPECIES.find((s) => s.id === i.speciesId)
      return def?.habitat === habitatId
    })
  }, [])

  const ikGetUnfedInsects = useCallback((): InsectEntity[] => {
    return stateRef.current.insects.filter((i) => !i.fedToday)
  }, [])

  const ikGetEvolvedInsects = useCallback((): InsectEntity[] => {
    return stateRef.current.insects.filter((i) => i.evolved)
  }, [])

  const ikGetCatchableSpecies = useCallback((habitatId: IkHabitatId): IkSpeciesDef[] => {
    return IK_SPECIES.filter((s) => s.habitat === habitatId && s.evolveFrom === null)
  }, [])

  const ikGetEvolutionChain = useCallback((speciesId: string): IkSpeciesDef[] => {
    const chain: IkSpeciesDef[] = []
    let current: IkSpeciesDef | undefined = IK_SPECIES.find((s) => s.id === speciesId)
    while (current) {
      chain.unshift(current)
      if (current.evolveFrom) {
        current = IK_SPECIES.find((s) => s.id === current!.evolveFrom)
      } else {
        const evolved = IK_SPECIES.find((s) => s.evolveFrom === current!.id)
        if (evolved) {
          chain.push(evolved)
        }
        current = undefined
      }
    }
    return chain
  }, [])

  const ikGetTotalPower = useCallback((): number => {
    return stateRef.current.insects.reduce((sum, i) => sum + i.power, 0)
  }, [])

  const ikGetAveragePower = useCallback((): number => {
    const insects = stateRef.current.insects
    if (insects.length === 0) return 0
    return Math.floor(insects.reduce((sum, i) => sum + i.power, 0) / insects.length)
  }, [])

  const ikGetStrongestInsect = useCallback((): InsectEntity | null => {
    const insects = stateRef.current.insects
    if (insects.length === 0) return null
    return insects.reduce((best, i) => (i.power > best.power ? i : best), insects[0])
  }, [])

  const ikGetHappiestInsect = useCallback((): InsectEntity | null => {
    const insects = stateRef.current.insects
    if (insects.length === 0) return null
    return insects.reduce((best, i) => (i.happiness > best.happiness ? i : best), insects[0])
  }, [])

  const ikGetNextTitle = useCallback((): IkTitleDef | null => {
    for (const t of IK_TITLES) {
      if (stateRef.current.level < t.levelRequired) return t
    }
    return null
  }, [])

  const ikGetAllTitles = useCallback((): IkTitleDef[] => {
    return [...IK_TITLES]
  }, [])

  const ikGetCurrentTitleInfo = useCallback((): IkTitleDef => {
    let current = IK_TITLES[0]
    for (const t of IK_TITLES) {
      if (stateRef.current.level >= t.levelRequired) current = t
    }
    return current
  }, [])

  const ikSortInsectsByPower = useCallback((): InsectEntity[] => {
    return [...stateRef.current.insects].sort((a, b) => b.power - a.power)
  }, [])

  const ikSortInsectsByLevel = useCallback((): InsectEntity[] => {
    return [...stateRef.current.insects].sort((a, b) => b.level - a.level)
  }, [])

  const ikSortInsectsByHappiness = useCallback((): InsectEntity[] => {
    return [...stateRef.current.insects].sort((a, b) => b.happiness - a.happiness)
  }, [])

  const ikGetSpeciesCollection = useCallback((): Record<string, number> => {
    const counts: Record<string, number> = {}
    for (const insect of stateRef.current.insects) {
      counts[insect.speciesId] = (counts[insect.speciesId] || 0) + 1
    }
    return counts
  }, [])

  const ikGetUniqueSpeciesCount = useCallback((): number => {
    const ids = new Set(stateRef.current.insects.map((i) => i.speciesId))
    return ids.size
  }, [])

  const ikGetDiscoveryProgress = useCallback((): number => {
    const totalBase = IK_SPECIES.filter((s) => s.evolveFrom === null).length
    const owned = new Set(stateRef.current.insects.map((i) => i.speciesId))
    return totalBase > 0 ? owned.size / totalBase : 0
  }, [])

  const ikDecayHappiness = useCallback(() => {
    setState((prev) => ({
      ...prev,
      insects: prev.insects.map((i) => ({
        ...i,
        happiness: Math.max(0, i.happiness - 2),
      })),
    }))
  }, [])

  const ikResetDailyFeed = useCallback(() => {
    setState((prev) => ({
      ...prev,
      insects: prev.insects.map((i) => ({ ...i, fedToday: false })),
      dailyCollected: false,
    }))
  }, [])

  const ikWearEquipment = useCallback((equipmentId: string) => {
    setState((prev) => ({
      ...prev,
      equipment: prev.equipment.map((e) =>
        e.equipmentId === equipmentId && e.owned ? { ...e, equipped: !e.equipped } : e
      ),
    }))
  }, [])

  const ikUnequipAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      equipment: prev.equipment.map((e) => ({ ...e, equipped: false })),
    }))
  }, [])

  const ikGetEquippedBySlot = useCallback((slot: IkEquipSlot): EquipmentEntity | null => {
    return stateRef.current.equipment.find((e) => {
      if (!e.equipped) return false
      const def = IK_EQUIPMENT.find((d) => d.id === e.equipmentId)
      return def?.slot === slot
    }) ?? null
  }, [])

  const ikGetAllSpecies = useCallback((): IkSpeciesDef[] => {
    return [...IK_SPECIES]
  }, [])

  const ikGetBaseSpecies = useCallback((): IkSpeciesDef[] => {
    return IK_SPECIES.filter((s) => s.evolveFrom === null)
  }, [])

  const ikGetEvolvedSpecies = useCallback((): IkSpeciesDef[] => {
    return IK_SPECIES.filter((s) => s.evolveFrom !== null)
  }, [])

  const ikGetSpeciesByType = useCallback((type: IkInsectType): IkSpeciesDef[] => {
    return IK_SPECIES.filter((s) => s.type === type)
  }, [])

  const ikGetSpeciesByRarity = useCallback((rarity: IkRarity): IkSpeciesDef[] => {
    return IK_SPECIES.filter((s) => s.rarity === rarity)
  }, [])

  const ikGetSpeciesByHabitat = useCallback((habitatId: IkHabitatId): IkSpeciesDef[] => {
    return IK_SPECIES.filter((s) => s.habitat === habitatId)
  }, [])

  const ikGetAllHabitats = useCallback((): IkHabitatDef[] => {
    return [...IK_HABITATS]
  }, [])

  const ikGetUnlockedHabitats = useCallback((): IkHabitatDef[] => {
    const unlockedIds = new Set(
      stateRef.current.habitats.filter((h) => h.unlocked).map((h) => h.habitatId)
    )
    return IK_HABITATS.filter((h) => unlockedIds.has(h.id))
  }, [])

  const ikGetLockedHabitats = useCallback((): IkHabitatDef[] => {
    const unlockedIds = new Set(
      stateRef.current.habitats.filter((h) => h.unlocked).map((h) => h.habitatId)
    )
    return IK_HABITATS.filter((h) => !unlockedIds.has(h.id))
  }, [])

  const ikGetAllFood = useCallback((): IkFoodDef[] => {
    return [...IK_FOOD]
  }, [])

  const ikGetAllEquipment = useCallback((): IkEquipmentDef[] => {
    return [...IK_EQUIPMENT]
  }, [])

  const ikGetEquipmentBySlot = useCallback((slot: IkEquipSlot): IkEquipmentDef[] => {
    return IK_EQUIPMENT.filter((e) => e.slot === slot)
  }, [])

  const ikGetEquipmentByRarity = useCallback((rarity: IkRarity): IkEquipmentDef[] => {
    return IK_EQUIPMENT.filter((e) => e.rarity === rarity)
  }, [])

  const ikGetAllAchievements = useCallback((): IkAchievementDef[] => {
    return [...IK_ACHIEVEMENTS]
  }, [])

  const ikGetUnlockedAchievementDefs = useCallback((): IkAchievementDef[] => {
    const unlockedIds = new Set(
      stateRef.current.achievements.filter((a) => a.unlocked).map((a) => a.id)
    )
    return IK_ACHIEVEMENTS.filter((a) => unlockedIds.has(a.id))
  }, [])

  const ikGetLockedAchievementDefs = useCallback((): IkAchievementDef[] => {
    const unlockedIds = new Set(
      stateRef.current.achievements.filter((a) => a.unlocked).map((a) => a.id)
    )
    return IK_ACHIEVEMENTS.filter((a) => !unlockedIds.has(a.id))
  }, [])

  const ikGetRarities = useCallback((): IkRarityDef[] => {
    return [...IK_RARITIES]
  }, [])

  // === RESET (NOT wrapped in useCallback) ===

  function ikResetProgress() {
    const fresh = ikCreateDefaultState()
    setState(fresh)
    stateRef.current = fresh
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('insect-kingdom-save')
      } catch {
        // ignore
      }
    }
  }

  const ikGetRarityColor = useCallback((rarity: IkRarity): string => {
    return IK_RARITY_COLORS[rarity] ?? IK_COLOR_LIME
  }, [])

  const ikGetRarityIcon = useCallback((rarity: IkRarity): string => {
    return IK_RARITY_ICONS[rarity] ?? '⬜'
  }, [])

  const ikGetRarityDef = useCallback((rarity: IkRarity): IkRarityDef | null => {
    return IK_RARITIES.find((r) => r.key === rarity) ?? null
  }, [])

  const ikGetTypeIcon = useCallback((type: IkInsectType): string => {
    return IK_TYPE_ICONS[type] ?? '🐛'
  }, [])

  const ikGetTypeLabel = useCallback((type: IkInsectType): string => {
    return IK_TYPE_LABELS[type] ?? 'Unknown'
  }, [])

  const ikGetSlotIcon = useCallback((slot: IkEquipSlot): string => {
    return IK_SLOT_ICONS[slot] ?? '📦'
  }, [])

  const ikGetSlotLabel = useCallback((slot: IkEquipSlot): string => {
    return IK_SLOT_LABELS[slot] ?? 'Unknown'
  }, [])

  const ikGetHabitatIcon = useCallback((habitatId: IkHabitatId): string => {
    return IK_HABITAT_ICONS[habitatId] ?? '🌍'
  }, [])

  const ikGetHabitatTip = useCallback((habitatId: IkHabitatId): string => {
    return IK_HABITAT_TIPS[habitatId] ?? ''
  }, [])

  const ikGetInsectRarity = useCallback((insectId: string): IkRarity | null => {
    const insect = stateRef.current.insects.find((i) => i.id === insectId)
    if (!insect) return null
    const def = IK_SPECIES.find((s) => s.id === insect.speciesId)
    return def?.rarity ?? null
  }, [])

  const ikGetInsectType = useCallback((insectId: string): IkInsectType | null => {
    const insect = stateRef.current.insects.find((i) => i.id === insectId)
    if (!insect) return null
    const def = IK_SPECIES.find((s) => s.id === insect.speciesId)
    return def?.type ?? null
  }, [])

  const ikGetInsectHabitat = useCallback((insectId: string): IkHabitatId | null => {
    const insect = stateRef.current.insects.find((i) => i.id === insectId)
    if (!insect) return null
    const def = IK_SPECIES.find((s) => s.id === insect.speciesId)
    return def?.habitat ?? null
  }, [])

  const ikGetInsectDescription = useCallback((insectId: string): string => {
    const insect = stateRef.current.insects.find((i) => i.id === insectId)
    if (!insect) return ''
    const def = IK_SPECIES.find((s) => s.id === insect.speciesId)
    return def?.description ?? ''
  }, [])

  const ikGetInsectNickname = useCallback((insectId: string): string => {
    const insect = stateRef.current.insects.find((i) => i.id === insectId)
    return insect?.nickname ?? ''
  }, [])

  const ikIsDailyAvailable = useCallback((): boolean => {
    const today = ikGetTodayKey()
    return !stateRef.current.dailyCollected || stateRef.current.dailyDate !== today
  }, [])

  const ikIsInsectEvolved = useCallback((insectId: string): boolean => {
    const insect = stateRef.current.insects.find((i) => i.id === insectId)
    return insect?.evolved ?? false
  }, [])

  const ikIsInsectFed = useCallback((insectId: string): boolean => {
    const insect = stateRef.current.insects.find((i) => i.id === insectId)
    return insect?.fedToday ?? false
  }, [])

  const ikGetInsectPower = useCallback((insectId: string): number => {
    const insect = stateRef.current.insects.find((i) => i.id === insectId)
    return insect?.power ?? 0
  }, [])

  const ikGetInsectLevel = useCallback((insectId: string): number => {
    const insect = stateRef.current.insects.find((i) => i.id === insectId)
    return insect?.level ?? 0
  }, [])

  const ikGetInsectHappiness = useCallback((insectId: string): number => {
    const insect = stateRef.current.insects.find((i) => i.id === insectId)
    return insect?.happiness ?? 0
  }, [])

  const ikGetInsectXp = useCallback((insectId: string): number => {
    const insect = stateRef.current.insects.find((i) => i.id === insectId)
    return insect?.xp ?? 0
  }, [])

  const ikGetWeakestInsect = useCallback((): InsectEntity | null => {
    const insects = stateRef.current.insects
    if (insects.length === 0) return null
    return insects.reduce((worst, i) => (i.power < worst.power ? i : worst), insects[0])
  }, [])

  const ikGetLowestLevelInsect = useCallback((): InsectEntity | null => {
    const insects = stateRef.current.insects
    if (insects.length === 0) return null
    return insects.reduce((lowest, i) => (i.level < lowest.level ? i : lowest), insects[0])
  }, [])

  const ikGetSaddesInsect = useCallback((): InsectEntity | null => {
    const insects = stateRef.current.insects
    if (insects.length === 0) return null
    return insects.reduce((saddest, i) => (i.happiness < saddest.happiness ? i : saddest), insects[0])
  }, [])

  const ikGetInsectsByType = useCallback((type: IkInsectType): InsectEntity[] => {
    return stateRef.current.insects.filter((i) => {
      const def = IK_SPECIES.find((s) => s.id === i.speciesId)
      return def?.type === type
    })
  }, [])

  const ikGetInsectsByEvolved = useCallback((evolved: boolean): InsectEntity[] => {
    return stateRef.current.insects.filter((i) => i.evolved === evolved)
  }, [])

  const ikGetInsectsAboveLevel = useCallback((minLevel: number): InsectEntity[] => {
    return stateRef.current.insects.filter((i) => i.level >= minLevel)
  }, [])

  const ikGetInsectsAbovePower = useCallback((minPower: number): InsectEntity[] => {
    return stateRef.current.insects.filter((i) => i.power >= minPower)
  }, [])

  const ikGetInsectsByLevelRange = useCallback((minLevel: number, maxLevel: number): InsectEntity[] => {
    return stateRef.current.insects.filter((i) => i.level >= minLevel && i.level <= maxLevel)
  }, [])

  const ikGetHabitatStats = useCallback((habitatId: IkHabitatId) => {
    const habitat = stateRef.current.habitats.find((h) => h.habitatId === habitatId)
    if (!habitat) return { unlocked: false, explorations: 0, totalFound: 0, lastExplored: 0 }
    return {
      unlocked: habitat.unlocked,
      explorations: habitat.explorationCount,
      totalFound: habitat.totalFound,
      lastExplored: habitat.lastExplored,
    }
  }, [])

  const ikSearchInsects = useCallback((query: string): InsectEntity[] => {
    const lower = query.toLowerCase()
    return stateRef.current.insects.filter((i) => {
      const def = IK_SPECIES.find((s) => s.id === i.speciesId)
      const nameMatch = i.nickname.toLowerCase().includes(lower)
      const speciesMatch = def?.name.toLowerCase().includes(lower) ?? false
      const typeMatch = def?.type.toLowerCase().includes(lower) ?? false
      return nameMatch || speciesMatch || typeMatch
    })
  }, [])

  const ikGetInsectXpProgress = useCallback((insectId: string): number => {
    const insect = stateRef.current.insects.find((i) => i.id === insectId)
    if (!insect) return 0
    const needed = ikGetXpRequiredForLevel(insect.level)
    if (needed === Infinity || needed <= 0) return 1
    return Math.min(1, insect.xp / needed)
  }, [])

  const ikGetEvolveProgress = useCallback((insectId: string): number => {
    const insect = stateRef.current.insects.find((i) => i.id === insectId)
    if (!insect) return 0
    const options = IK_SPECIES.filter((s) => s.evolveFrom === insect.speciesId)
    if (options.length === 0) return 1
    const target = options[0]
    if (insect.level >= target.evolveLevel) return 1
    return insect.level / target.evolveLevel
  }, [])

  const ikGetTotalBonusBySlot = useCallback((slot: IkEquipSlot): number => {
    let total = 0
    for (const eq of stateRef.current.equipment) {
      if (eq.equipped) {
        const def = IK_EQUIPMENT.find((d) => d.id === eq.equipmentId)
        if (def && def.slot === slot) total += def.bonus
      }
    }
    return total
  }, [])

  const ikIsEquipmentOwned = useCallback((equipmentId: string): boolean => {
    const eq = stateRef.current.equipment.find((e) => e.equipmentId === equipmentId)
    return eq?.owned ?? false
  }, [])

  const ikIsEquipmentEquipped = useCallback((equipmentId: string): boolean => {
    const eq = stateRef.current.equipment.find((e) => e.equipmentId === equipmentId)
    return eq?.equipped ?? false
  }, [])

  // === RETURN ALL FUNCTIONS ===

  return {
    // Simple Getters
    ikGetLevel,
    ikGetXp,
    ikGetTotalXp,
    ikGetCoins,
    ikGetTitle,
    ikGetInsects,
    ikGetHabitats,
    ikGetEquipment,
    ikGetAchievements,
    ikGetDailyCollected,
    ikGetDailyDate,
    ikGetTotalCaught,
    ikGetTotalEvolved,
    ikGetTotalReleased,
    ikGetMetamorphosisCount,
    ikGetTotalFed,
    ikGetTotalExplored,
    ikGetTotalCoinsEarned,
    ikGetTotalCoinsSpent,
    ikGetActiveHabitat,
    ikGetStreak,
    ikGetBestStreak,
    ikGetInsectCount,
    ikGetSeed,
    ikGetTick,
    ikGetUnlockedHabitatCount,
    ikGetEquippedItemCount,
    ikGetOwnedEquipmentCount,
    ikGetUnlockedAchievementCount,
    ikGetCatchBonus,
    ikGetTodayKey,
    ikGetXpRequired,
    ikGetXpProgress,
    ikGetOverallProgress,
    // State Modifiers
    ikAddXp,
    ikAddCoins,
    ikSpendCoins,
    ikCanAfford,
    ikCatchInsect,
    ikReleaseInsect,
    ikReleaseMultiple,
    ikEvolveInsect,
    ikFeedInsect,
    ikFeedAllInsects,
    ikEquipItem,
    ikUnequipItem,
    ikBuyEquipment,
    ikExploreHabitat,
    ikSetActiveHabitat,
    ikUnlockHabitat,
    ikUnlockAllAvailableHabitats,
    ikRenameInsect,
    ikUpgradeEquipment,
    ikRepairEquipment,
    ikGetDailyReward,
    ikClaimDailyCoins,
    ikDecayHappiness,
    ikResetDailyFeed,
    ikWearEquipment,
    ikUnequipAll,
    // Query Functions
    ikGetEvolutionOptions,
    ikCanEvolve,
    ikGetHabitatRarityWeights,
    ikGetSpeciesDef,
    ikGetHabitatDef,
    ikGetFoodDef,
    ikGetEquipmentDef,
    ikGetInsectById,
    ikGetInsectsByRarity,
    ikGetInsectsByHabitat,
    ikGetUnfedInsects,
    ikGetEvolvedInsects,
    ikGetCatchableSpecies,
    ikGetEvolutionChain,
    ikGetTotalPower,
    ikGetAveragePower,
    ikGetStrongestInsect,
    ikGetHappiestInsect,
    ikGetNextTitle,
    ikGetAllTitles,
    ikGetCurrentTitleInfo,
    ikSortInsectsByPower,
    ikSortInsectsByLevel,
    ikSortInsectsByHappiness,
    ikGetSpeciesCollection,
    ikGetUniqueSpeciesCount,
    ikGetDiscoveryProgress,
    ikGetEquippedBySlot,
    ikGetAllSpecies,
    ikGetBaseSpecies,
    ikGetEvolvedSpecies,
    ikGetSpeciesByType,
    ikGetSpeciesByRarity,
    ikGetSpeciesByHabitat,
    ikGetAllHabitats,
    ikGetUnlockedHabitats,
    ikGetLockedHabitats,
    ikGetAllFood,
    ikGetAllEquipment,
    ikGetEquipmentBySlot,
    ikGetEquipmentByRarity,
    ikGetAllAchievements,
    ikGetUnlockedAchievementDefs,
    ikGetLockedAchievementDefs,
    ikGetRarities,
    ikGetRarityColor,
    ikGetRarityIcon,
    ikGetRarityDef,
    ikGetTypeIcon,
    ikGetTypeLabel,
    ikGetSlotIcon,
    ikGetSlotLabel,
    ikGetHabitatIcon,
    ikGetHabitatTip,
    ikGetInsectRarity,
    ikGetInsectType,
    ikGetInsectHabitat,
    ikGetInsectDescription,
    ikGetInsectNickname,
    ikIsDailyAvailable,
    ikIsInsectEvolved,
    ikIsInsectFed,
    ikGetInsectPower,
    ikGetInsectLevel,
    ikGetInsectHappiness,
    ikGetInsectXp,
    ikGetWeakestInsect,
    ikGetLowestLevelInsect,
    ikGetSaddesInsect,
    ikGetInsectsByType,
    ikGetInsectsByEvolved,
    ikGetInsectsAboveLevel,
    ikGetInsectsAbovePower,
    ikGetInsectsByLevelRange,
    ikGetHabitatStats,
    ikSearchInsects,
    ikGetInsectXpProgress,
    ikGetEvolveProgress,
    ikGetTotalBonusBySlot,
    ikIsEquipmentOwned,
    ikIsEquipmentEquipped,
    ikSetCoins,
    ikSetLevel,
    ikSetXp,
    ikBoostHappiness,
    ikBoostAllHappiness,
    ikTrainInsect,
    ikTrainAllInsects,
    ikSellInsect,
    ikSellAllCommons,
    ikDuplicateInsect,
    // Reset (plain function)
    ikResetProgress,
  }
}

// === HELPER (module-level) ===

function getPreviousDayKey(todayKey: string): string {
  const parts = todayKey.split('-').map(Number)
  const d = new Date(parts[0], parts[1] - 1, parts[2])
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}
