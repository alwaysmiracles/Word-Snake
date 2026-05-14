'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'

// =============================================================================
// Coral Forge (珊瑚锻造) — Underwater Volcanic Forge Wire for Word Snake
// Coral-smiths craft legendary weapons from living coral in the deep sea.
// All exported types use `Cf` prefix. Constants use `CF_` prefix.
// Hook: `useCoralForge` (default export). Save key: `coral-forge-save`.
// =============================================================================

// =============================================================================
// §1 — Type Definitions
// =============================================================================

export type CfRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type CfSpecies =
  | 'coral_smith'
  | 'magma_crab'
  | 'pearl_enchanter'
  | 'trench_diver'
  | 'reef_knight'
  | 'bubble_mage'
  | 'abyssal_forger'

export type CfAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'summon'

export type CfActionType = 'forge' | 'enchant' | 'dive' | 'harvest' | 'temper' | 'combine' | 'awaken'

export type CfMaterialCategory = 'coral' | 'mineral' | 'essence' | 'shell' | 'lava' | 'abyssal'

export interface CfRarityDef {
  key: CfRarity
  label: string
  color: string
  xpMultiplier: number
  dropWeight: number
}

export interface CfSpeciesDef {
  key: CfSpecies
  label: string
  emoji: string
  description: string
  lore: string
  passiveBonus: string
  color: string
}

export interface CfCreatureDef {
  id: string
  name: string
  species: CfSpecies
  rarity: CfRarity
  description: string
  lore: string
  emoji: string
  power: number
  defense: number
  cost: number
  xpReward: number
}

export interface CfChamberDef {
  id: string
  name: string
  description: string
  lore: string
  emoji: string
  level: number
  resources: Record<string, number>
  capacity: number
  unlockLevel: number
  ambientColor: string
  dangerLevel: number
}

export interface CfMaterialDef {
  id: string
  name: string
  rarity: CfRarity
  category: CfMaterialCategory
  value: number
  description: string
  emoji: string
}

export interface CfStructureDef {
  id: string
  name: string
  description: string
  emoji: string
  maxLevel: number
  baseCost: number
  costScaling: number
  category: 'production' | 'defense' | 'research' | 'storage'
}

export interface CfAbilityDef {
  id: string
  name: string
  description: string
  category: CfAbilityCategory
  cooldown: number
  power: number
  cost: number
  unlockLevel: number
  emoji: string
}

export interface CfAchievementDef {
  id: string
  name: string
  description: string
  targetValue: number
  rewardCoins: number
  rewardXp: number
  emoji: string
}

export interface CfTitleDef {
  id: string
  name: string
  requirement: number
  description: string
  emoji: string
}

export interface CfArtifactDef {
  id: string
  name: string
  description: string
  lore: string
  emoji: string
  rarity: CfRarity
  power: number
  unlockLevel: number
}

export interface CfEventDef {
  id: string
  name: string
  description: string
  lore: string
  emoji: string
  duration: number
  rewardMultiplier: number
  rarity: CfRarity
}

// ── Runtime state types ──────────────────────────────────────────────────────

export interface CfOwnedCreature {
  instanceId: string
  defId: string
  level: number
  xp: number
  awakened: boolean
  acquiredAt: number
}

export interface CfStructureState {
  defId: string
  level: number
}

export interface CfMaterialState {
  defId: string
  count: number
}

export interface CfAbilityState {
  defId: string
  unlocked: boolean
  lastUsed: number
  timesUsed: number
}

export interface CfAchievementState {
  defId: string
  unlocked: boolean
  progress: number
  unlockedAt: number | null
}

export interface CfArtifactState {
  defId: string
  activated: boolean
  activatedAt: number | null
  charges: number
}

export interface CfEventLog {
  id: string
  timestamp: number
  actionType: CfActionType
  message: string
  metadata?: Record<string, number | string | boolean>
}

export interface CfCoralForgeState {
  level: number
  xp: number
  totalXp: number
  coins: number
  totalCoinsEarned: number
  totalCoinsSpent: number
  creatures: CfOwnedCreature[]
  chambers: CfChamberState[]
  materials: CfMaterialState[]
  structures: CfStructureState[]
  abilities: CfAbilityState[]
  achievements: CfAchievementState[]
  artifacts: CfArtifactState[]
  activeTitle: string
  activeChamber: string
  currentEvent: string | null
  eventExpiresAt: number | null
  streak: number
  bestStreak: number
  lastPlayDate: string | null
  totalForged: number
  totalEnchanted: number
  totalDives: number
  totalHarvested: number
  totalTempered: number
  totalCombined: number
  totalAwakened: number
  totalActionsPerformed: number
  eventLog: CfEventLog[]
  dailyActions: number
  dailyDate: string | null
}

export interface CfChamberState {
  defId: string
  unlocked: boolean
  currentDepth: number
  maxDepth: number
  lastExploredAt: number | null
}

// =============================================================================
// §2 — CF_ Constants
// =============================================================================

export const CF_SAVE_KEY = 'coral-forge-save'
export const CF_MAX_LEVEL = 50
export const CF_STARTING_COINS = 100
export const CF_STARTING_XP = 0
export const CF_BASE_XP_PER_ACTION = 15
export const CF_COINS_PER_FORGE = 10
export const CF_COINS_PER_HARVEST = 5
export const CF_STREAK_BONUS_MULTIPLIER = 0.1
export const CF_MAX_CREATURE_LEVEL = 50
export const CF_MAX_EVENT_LOG = 100
export const CF_DAILY_ACTION_LIMIT = 200
export const CF_FORGE_TEMPER_BONUS = 0.15
export const CF_COMBINE_POWER_MULTIPLIER = 1.8
export const CF_AWAKEN_THRESHOLD = 40

// =============================================================================
// §3 — Color Theme Constants
// =============================================================================

export const CF_CORAL_PINK = '#FF7F50'
export const CF_FORGE_ORANGE = '#FF4500'
export const CF_DEEP_BLUE = '#00008B'
export const CF_PEARL_WHITE = '#FFEFFE'
export const CF_LAVA_RED = '#FF0000'
export const CF_SEA_GREEN = '#2E8B57'
export const CF_OBSIDIAN_BLACK = '#1C1C1C'

export const CF_THEME_COLORS = {
  coralPink: CF_CORAL_PINK,
  forgeOrange: CF_FORGE_ORANGE,
  deepBlue: CF_DEEP_BLUE,
  pearlWhite: CF_PEARL_WHITE,
  lavaRed: CF_LAVA_RED,
  seaGreen: CF_SEA_GREEN,
  obsidianBlack: CF_OBSIDIAN_BLACK,
  background: '#0A0A1A',
  surface: '#111128',
  surfaceLight: '#1A1A3E',
  textPrimary: CF_PEARL_WHITE,
  textSecondary: '#B0B0D0',
  accent: CF_CORAL_PINK,
  danger: CF_LAVA_RED,
  success: CF_SEA_GREEN,
  gold: '#FFD700',
  common: '#9CA3AF',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
} as const

// Gradient presets
export const CF_GRADIENTS = {
  forgeGlow: `linear-gradient(135deg, ${CF_FORGE_ORANGE}22, ${CF_CORAL_PINK}22)`,
  deepAbyss: `linear-gradient(180deg, ${CF_DEEP_BLUE}, #050520)`,
  coralBloom: `linear-gradient(135deg, ${CF_CORAL_PINK}, ${CF_FORGE_ORANGE})`,
  pearlShimmer: `linear-gradient(135deg, ${CF_PEARL_WHITE}, #E0C0F0, ${CF_CORAL_PINK})`,
  lavaFlow: `linear-gradient(135deg, ${CF_LAVA_RED}, ${CF_FORGE_ORANGE})`,
  seaDepths: `linear-gradient(180deg, ${CF_SEA_GREEN}, ${CF_DEEP_BLUE})`,
} as const

// =============================================================================
// §4 — CF_SPECIES — 7 Species
// =============================================================================

export const CF_SPECIES: CfSpeciesDef[] = [
  {
    key: 'coral_smith',
    label: 'Coral Smith',
    emoji: '🔧',
    description: 'Master artisans who shape living coral into weapons and armor.',
    lore: 'The Coral Smiths were the first to discover that coral, when heated by volcanic vents, becomes as malleable as clay and as hard as steel when cooled in the abyss.',
    passiveBonus: '+15% forging speed',
    color: CF_CORAL_PINK,
  },
  {
    key: 'magma_crab',
    label: 'Magma Crab',
    emoji: '🦀',
    description: 'Crustaceans with shells forged in underwater magma flows.',
    lore: 'Magma Crabs migrate toward volcanic vents every thousand years. Their shells, cooled in the deep sea, are the strongest natural armor in the ocean.',
    passiveBonus: '+20% defense bonus',
    color: CF_FORGE_ORANGE,
  },
  {
    key: 'pearl_enchanter',
    label: 'Pearl Enchanter',
    emoji: '🫧',
    description: 'Mystic beings who infuse coral weapons with pearl magic.',
    lore: 'Pearl Enchanters speak a language older than the ocean itself. Their whispered incantations can make a coral blade cut through darkness.',
    passiveBonus: '+10% enchant power',
    color: CF_PEARL_WHITE,
  },
  {
    key: 'trench_diver',
    label: 'Trench Diver',
    emoji: '🤿',
    description: 'Fearless explorers who harvest materials from the deepest trenches.',
    lore: 'Only Trench Divers have seen the forge at the bottom of the Mariana Trench. They return with materials that glow with primordial heat.',
    passiveBonus: '+25% harvest yield',
    color: CF_DEEP_BLUE,
  },
  {
    key: 'reef_knight',
    label: 'Reef Knight',
    emoji: '🛡️',
    description: 'Armored guardians who protect the coral forge from deep-sea threats.',
    lore: 'Reef Knights swear an oath to the coral: to protect it from those who would harvest it for vanity. Their armor grows with the reef.',
    passiveBonus: '+18% all stats',
    color: CF_SEA_GREEN,
  },
  {
    key: 'bubble_mage',
    label: 'Bubble Mage',
    emoji: '✨',
    description: 'Spellcasters who weaponize the pressure of deep-sea bubbles.',
    lore: 'At 10,000 meters, a single bubble contains enough compressed energy to power a forge for a year. Bubble Mages harness this force.',
    passiveBonus: '+12% ability power',
    color: '#7DF9FF',
  },
  {
    key: 'abyssal_forger',
    label: 'Abyssal Forger',
    emoji: '⚒️',
    description: 'Legendary smiths who work at the boundary between ocean and magma.',
    lore: 'The Abyssal Forgers alone can work at the point where magma meets the sea, creating weapons that burn underwater and freeze on land.',
    passiveBonus: '+30% rare material chance',
    color: CF_OBSIDIAN_BLACK,
  },
]

// =============================================================================
// §5 — CF_CREATURES — 35 Creatures (5 Tiers × 7 Species)
// =============================================================================

export const CF_CREATURES: CfCreatureDef[] = [
  // ── Common (7) ─────────────────────────────────────────────────────────────
  {
    id: 'creef_worker',
    name: 'Reef Worker',
    species: 'coral_smith',
    rarity: 'common',
    description: 'A humble smith who shapes basic coral tools and weapons.',
    lore: 'Every master forger began as a reef worker, hammering coral on the volcanic anvil until their hands bled saltwater.',
    emoji: '🔧',
    power: 8,
    defense: 5,
    cost: 50,
    xpReward: 10,
  },
  {
    id: 'cmagma_hatchling',
    name: 'Magma Hatchling',
    species: 'magma_crab',
    rarity: 'common',
    description: 'A young crab whose shell still glows with forge heat.',
    lore: 'Hatchlings are born near volcanic vents, their shells cooling over weeks into a natural armor plate.',
    emoji: '🦀',
    power: 6,
    defense: 10,
    cost: 50,
    xpReward: 10,
  },
  {
    id: 'cpearl_apprentice',
    name: 'Pearl Apprentice',
    species: 'pearl_enchanter',
    rarity: 'common',
    description: 'A novice enchanter learning to coax magic from sea pearls.',
    lore: 'The first spell a Pearl Apprentice learns is "Lumina Mare" — the light of the sea — to guide divers home.',
    emoji: '🫧',
    power: 7,
    defense: 4,
    cost: 50,
    xpReward: 10,
  },
  {
    id: 'ctrench_wader',
    name: 'Trench Wader',
    species: 'trench_diver',
    rarity: 'common',
    description: 'A shallow-water diver gathering surface coral and shells.',
    lore: 'Trench Waders dream of the deep, collecting courage along with coral fragments on every dive.',
    emoji: '🤿',
    power: 9,
    defense: 3,
    cost: 50,
    xpReward: 10,
  },
  {
    id: 'creef_squire',
    name: 'Reef Squire',
    species: 'reef_knight',
    rarity: 'common',
    description: 'A young knight training in the coral guard barracks.',
    lore: 'Reef Squires carry shields made of compressed coral, practicing parries against the ocean current itself.',
    emoji: '🛡️',
    power: 7,
    defense: 8,
    cost: 50,
    xpReward: 10,
  },
  {
    id: 'cbubble_sprout',
    name: 'Bubble Sprout',
    species: 'bubble_mage',
    rarity: 'common',
    description: 'A tiny mage who can create protective bubble shields.',
    lore: 'Bubble Sprouts are born inside giant clam shells, their first cry producing a bubble that carries them to the surface.',
    emoji: '✨',
    power: 10,
    defense: 3,
    cost: 50,
    xpReward: 10,
  },
  {
    id: 'cabyss_scrapper',
    name: 'Abyssal Scrapper',
    species: 'abyssal_forger',
    rarity: 'common',
    description: 'A scavenger who collects forge slag from the sea floor.',
    lore: 'Even the waste of the abyssal forge has value — Scrappers know this better than anyone.',
    emoji: '⚒️',
    power: 8,
    defense: 6,
    cost: 50,
    xpReward: 10,
  },

  // ── Uncommon (7) ───────────────────────────────────────────────────────────
  {
    id: 'ccoral_hammerhand',
    name: 'Coral Hammerhand',
    species: 'coral_smith',
    rarity: 'uncommon',
    description: 'A smith whose hands have been permanently fused with coral hammers.',
    lore: 'The Hammerhand ritual is voluntary. Coral is grafted onto the hands, and within a week, it fuses with bone.',
    emoji: '🔨',
    power: 18,
    defense: 12,
    cost: 200,
    xpReward: 25,
  },
  {
    id: 'cmagma_carapace',
    name: 'Magma Carapace',
    species: 'magma_crab',
    rarity: 'uncommon',
    description: 'A medium crab whose shell has been tempered in lava flows.',
    lore: 'The Carapace has survived three volcanic eruptions. Its shell now bears the marks of magma rivers.',
    emoji: '🦀',
    power: 14,
    defense: 24,
    cost: 200,
    xpReward: 25,
  },
  {
    id: 'cpearl_weaver',
    name: 'Pearl Weaver',
    species: 'pearl_enchanter',
    rarity: 'uncommon',
    description: 'An enchanter who threads pearls into magical coral weapons.',
    lore: 'A Pearl Weaver can turn a common blade into a rarity with a single well-placed pearl inlaid along the edge.',
    emoji: '🫧',
    power: 20,
    defense: 10,
    cost: 200,
    xpReward: 25,
  },
  {
    id: 'ctrench_veteran',
    name: 'Trench Veteran',
    species: 'trench_diver',
    rarity: 'uncommon',
    description: 'An experienced diver who has descended past the thermocline.',
    lore: 'Below the thermocline, the water is near freezing but the volcanic vents still glow. Veterans learn to navigate by heat.',
    emoji: '🤿',
    power: 22,
    defense: 8,
    cost: 200,
    xpReward: 25,
  },
  {
    id: 'creef_sentinel',
    name: 'Reef Sentinel',
    species: 'reef_knight',
    rarity: 'uncommon',
    description: 'A patrolling knight who guards the outer coral perimeter.',
    lore: 'Sentinels communicate through bioluminescent signals, creating an unbreakable chain of watchmen around the forge.',
    emoji: '🛡️',
    power: 16,
    defense: 20,
    cost: 200,
    xpReward: 25,
  },
  {
    id: 'cbubble_conjurer',
    name: 'Bubble Conjurer',
    species: 'bubble_mage',
    rarity: 'uncommon',
    description: 'A mage who summons bubbles of compressed force.',
    lore: 'Conjurers can create bubbles that implode with the force of a depth charge, devastating anything caught inside.',
    emoji: '✨',
    power: 24,
    defense: 6,
    cost: 200,
    xpReward: 25,
  },
  {
    id: 'cabyss_smelter',
    name: 'Abyssal Smelter',
    species: 'abyssal_forger',
    rarity: 'uncommon',
    description: 'A forger who smelts deep-sea minerals in magma pockets.',
    lore: 'The Smelter carries a portable magma pouch, a living ember from the abyssal forge that never goes out.',
    emoji: '⚒️',
    power: 19,
    defense: 14,
    cost: 200,
    xpReward: 25,
  },

  // ── Rare (7) ───────────────────────────────────────────────────────────────
  {
    id: 'ccoral_artificer',
    name: 'Coral Artificer',
    species: 'coral_smith',
    rarity: 'rare',
    description: 'A master smith who creates sentient coral constructs.',
    lore: 'Artificers breathe life into their creations by implanting a pearl heart — the construct then follows its maker faithfully.',
    emoji: '🔧',
    power: 38,
    defense: 25,
    cost: 800,
    xpReward: 60,
  },
  {
    id: 'cmagma_titan_crab',
    name: 'Magma Titan Crab',
    species: 'magma_crab',
    rarity: 'rare',
    description: 'A colossal crab that dwells within the forge itself.',
    lore: 'The Titan Crab is so large that coral grows on its back. Some say it IS the forge, and we merely work upon its shell.',
    emoji: '🦀',
    power: 30,
    defense: 50,
    cost: 800,
    xpReward: 60,
  },
  {
    id: 'cpearl_archmage',
    name: 'Pearl Archmage',
    species: 'pearl_enchanter',
    rarity: 'rare',
    description: 'An archmage whose enchantments last for centuries.',
    lore: 'The Archmage enchanted a blade three hundred years ago. It still glows, still cuts, still whispers to its wielder.',
    emoji: '🫧',
    power: 42,
    defense: 20,
    cost: 800,
    xpReward: 60,
  },
  {
    id: 'ctrench_pioneer',
    name: 'Trench Pioneer',
    species: 'trench_diver',
    rarity: 'rare',
    description: 'The first diver to reach the abyssal forge and return alive.',
    lore: 'The Pioneer carries a map tattooed on their skin — the only surviving chart of the path through the crushing dark.',
    emoji: '🤿',
    power: 45,
    defense: 18,
    cost: 800,
    xpReward: 60,
  },
  {
    id: 'creef_champion',
    name: 'Reef Champion',
    species: 'reef_knight',
    rarity: 'rare',
    description: 'The undefeated champion of the coral arena.',
    lore: 'The Champion has never lost a duel. Their armor is covered in the marks of a thousand battles, each one a victory.',
    emoji: '🛡️',
    power: 35,
    defense: 42,
    cost: 800,
    xpReward: 60,
  },
  {
    id: 'cbubble_stormcaller',
    name: 'Bubble Stormcaller',
    species: 'bubble_mage',
    rarity: 'rare',
    description: 'A mage who commands storms of explosive micro-bubbles.',
    lore: 'When the Stormcaller raises their staff, the entire ocean trembles. Millions of bubbles converge into a wall of pressure.',
    emoji: '✨',
    power: 48,
    defense: 15,
    cost: 800,
    xpReward: 60,
  },
  {
    id: 'cabyss_weaponsmith',
    name: 'Abyssal Weaponsmith',
    species: 'abyssal_forger',
    rarity: 'rare',
    description: 'A legendary smith who forges weapons at the magma-sea boundary.',
    lore: 'The Weaponsmith\'s greatest creation: a trident that burns with cold fire, freezing the water around it into ice crystals.',
    emoji: '⚒️',
    power: 40,
    defense: 30,
    cost: 800,
    xpReward: 60,
  },

  // ── Epic (7) ───────────────────────────────────────────────────────────────
  {
    id: 'ccoral_grandmaster',
    name: 'Coral Grandmaster',
    species: 'coral_smith',
    rarity: 'epic',
    description: 'The supreme coral artisan, capable of forging living weapons.',
    lore: 'The Grandmaster\'s masterwork: a sword that grows, heals, and adapts. It is alive in every sense that matters.',
    emoji: '🔧',
    power: 85,
    defense: 55,
    cost: 3000,
    xpReward: 150,
  },
  {
    id: 'cmagma_volcano_crab',
    name: 'Magma Volcano Crab',
    species: 'magma_crab',
    rarity: 'epic',
    description: 'A living volcano in crab form, erupting on command.',
    lore: 'The Volcano Crab is worshiped by lesser crabs. When it moves, the seafloor cracks and molten rock seeps through.',
    emoji: '🦀',
    power: 70,
    defense: 110,
    cost: 3000,
    xpReward: 150,
  },
  {
    id: 'cpearl_oracle',
    name: 'Pearl Oracle',
    species: 'pearl_enchanter',
    rarity: 'epic',
    description: 'A seer who reads the future in the iridescence of pearls.',
    lore: 'The Oracle can enchant a weapon with a prophecy — the blade will guide its owner toward (or away from) their fate.',
    emoji: '🫧',
    power: 95,
    defense: 45,
    cost: 3000,
    xpReward: 150,
  },
  {
    id: 'ctrench_abysswalker',
    name: 'Trench Abysswalker',
    species: 'trench_diver',
    rarity: 'epic',
    description: 'A diver who has walked the ocean floor at its deepest point.',
    lore: 'At the bottom, the Abysswalker found a door. Behind it was the forge. They chose to bring its secrets back.',
    emoji: '🤿',
    power: 100,
    defense: 40,
    cost: 3000,
    xpReward: 150,
  },
  {
    id: 'creef_paladin',
    name: 'Reef Paladin',
    species: 'reef_knight',
    rarity: 'epic',
    description: 'A holy knight whose shield absorbs all damage and reflects it.',
    lore: 'The Paladin\'s oath: "No darkness shall pass while my coral stands." Their shield has never been breached.',
    emoji: '🛡️',
    power: 80,
    defense: 95,
    cost: 3000,
    xpReward: 150,
  },
  {
    id: 'cbubble_leviathan',
    name: 'Bubble Leviathan',
    species: 'bubble_mage',
    rarity: 'epic',
    description: 'A mage who commands a leviathan made entirely of compressed bubbles.',
    lore: 'The Leviathan is 200 meters long, held together by willpower alone. When it surfaces, the pressure wave sinks ships.',
    emoji: '✨',
    power: 105,
    defense: 35,
    cost: 3000,
    xpReward: 150,
  },
  {
    id: 'cabyss_forge_lord',
    name: 'Abyssal Forge Lord',
    species: 'abyssal_forger',
    rarity: 'epic',
    description: 'The ruler of the abyssal forge, commanding magma and sea alike.',
    lore: 'The Forge Lord sits upon a throne of cooled obsidian coral. Their hammer strikes echo through the entire ocean basin.',
    emoji: '⚒️',
    power: 90,
    defense: 65,
    cost: 3000,
    xpReward: 150,
  },

  // ── Legendary (7) ──────────────────────────────────────────────────────────
  {
    id: 'ccoral_primordial',
    name: 'Coral Primordial',
    species: 'coral_smith',
    rarity: 'legendary',
    description: 'The first coral smith, who taught the ocean to forge itself.',
    lore: 'Before there was a forge, there was the Primordial. They pressed their hands into volcanic rock and the coral grew, and with it, civilization.',
    emoji: '🔧',
    power: 200,
    defense: 130,
    cost: 12000,
    xpReward: 400,
  },
  {
    id: 'cmagma_ancient',
    name: 'Magma Ancient',
    species: 'magma_crab',
    rarity: 'legendary',
    description: 'A primordial crab as old as the first volcanic eruption.',
    lore: 'The Ancient was there when the first undersea volcano erupted. It simply absorbed the magma into its shell and kept walking.',
    emoji: '🦀',
    power: 160,
    defense: 260,
    cost: 12000,
    xpReward: 400,
  },
  {
    id: 'cpearl_celestial',
    name: 'Pearl Celestial',
    species: 'pearl_enchanter',
    rarity: 'legendary',
    description: 'An otherworldly enchanter descended from the moon\'s own pearls.',
    lore: 'The Celestial\'s pearls fall from the sky, not the sea. Each one contains a captured star, and their enchantments are written in starlight.',
    emoji: '🫧',
    power: 220,
    defense: 120,
    cost: 12000,
    xpReward: 400,
  },
  {
    id: 'ctrench_void_dancer',
    name: 'Trench Void Dancer',
    species: 'trench_diver',
    rarity: 'legendary',
    description: 'A diver who has transcended depth itself, dancing in the void.',
    lore: 'The Void Dancer no longer needs to breathe. They move through the abyss like a ghost, harvesting materials from places that should not exist.',
    emoji: '🤿',
    power: 230,
    defense: 100,
    cost: 12000,
    xpReward: 400,
  },
  {
    id: 'creef_immortal',
    name: 'Reef Immortal',
    species: 'reef_knight',
    rarity: 'legendary',
    description: 'A knight who cannot die as long as the coral reef endures.',
    lore: 'The Immortal has been killed a thousand times and reformed each time from the reef. Their armor IS the reef, and the reef IS them.',
    emoji: '🛡️',
    power: 190,
    defense: 240,
    cost: 12000,
    xpReward: 400,
  },
  {
    id: 'cbubble_cosmos',
    name: 'Bubble Cosmos',
    species: 'bubble_mage',
    rarity: 'legendary',
    description: 'A mage who creates pocket universes inside bubbles.',
    lore: 'Inside the Cosmos\'s largest bubble is an entire coral reef ecosystem, complete with its own forge and its own tiny bubble mages.',
    emoji: '✨',
    power: 240,
    defense: 90,
    cost: 12000,
    xpReward: 400,
  },
  {
    id: 'cabyss_worldsmith',
    name: 'Abyssal Worldsmith',
    species: 'abyssal_forger',
    rarity: 'legendary',
    description: 'The forger who shaped the ocean floor with a single hammer strike.',
    lore: 'The Worldsmith\'s hammer fell from the sky in a meteor of coral. Where it struck the seafloor, the first trench was born, and with it, the first forge.',
    emoji: '⚒️',
    power: 210,
    defense: 150,
    cost: 12000,
    xpReward: 400,
  },
]

// =============================================================================
// §6 — CF_CHAMBERS — 8 Forge Depths
// =============================================================================

export const CF_CHAMBERS: CfChamberDef[] = [
  {
    id: 'ch_shallow_reef',
    name: 'Shallow Reef Forge',
    description: 'A sunlit forge built into the coral reef, warmed by surface currents.',
    lore: 'The Shallow Reef is where every forger begins. Sunlight filters through the water, and the coral here is soft and easy to shape.',
    emoji: '🌤️',
    level: 1,
    resources: { mat_soft_coral: 3, mat_shell_fragment: 2 },
    capacity: 20,
    unlockLevel: 1,
    ambientColor: '#88DDFF',
    dangerLevel: 1,
  },
  {
    id: 'ch_twilight_grotto',
    name: 'Twilight Grotto',
    description: 'A dim cave where bioluminescent coral provides the only light.',
    lore: 'In the Twilight Grotto, the coral glows with its own light. Forgers here learn to work by feel rather than sight.',
    emoji: '🫧',
    level: 2,
    resources: { mat_glow_coral: 2, mat_pearl_dust: 1, mat_deep_shell: 1 },
    capacity: 35,
    unlockLevel: 5,
    ambientColor: '#4466AA',
    dangerLevel: 2,
  },
  {
    id: 'ch_volcanic_vent',
    name: 'Volcanic Vent Chamber',
    description: 'A superheated forge built directly atop an undersea volcanic vent.',
    lore: 'The Volcanic Vent hisses and spews superheated water. Forgers must wear magma crab shells to survive the temperature.',
    emoji: '🌋',
    level: 3,
    resources: { mat_volcanic_glass: 2, mat_magma_coral: 2, mat_iron_kelp: 1 },
    capacity: 50,
    unlockLevel: 10,
    ambientColor: '#FF4500',
    dangerLevel: 3,
  },
  {
    id: 'ch_pearl_sanctum',
    name: 'Pearl Sanctum',
    description: 'A sacred chamber where the largest pearls are used to enchant weapons.',
    lore: 'The Sanctum holds pearls the size of boulders. Each one hums with ancient magic, waiting for an enchanter worthy of its power.',
    emoji: '🫧',
    level: 4,
    resources: { mat_giant_pearl: 1, mat_pearl_dust: 3, mat_lunar_coral: 1 },
    capacity: 40,
    unlockLevel: 16,
    ambientColor: '#FFEFFE',
    dangerLevel: 2,
  },
  {
    id: 'ch_magma_depths',
    name: 'Magma Depths',
    description: 'The depth where magma meets ocean, creating impossible materials.',
    lore: 'Here, the water boils and the rock flows. The Magma Depths are the true heart of the Coral Forge, where the rarest materials are born.',
    emoji: '🔥',
    level: 5,
    resources: { mat_magma_coral: 3, mat_obsidian_coral: 2, mat_abyssal_iron: 1 },
    capacity: 60,
    unlockLevel: 24,
    ambientColor: '#FF0000',
    dangerLevel: 5,
  },
  {
    id: 'ch_abyssal_foundry',
    name: 'Abyssal Foundry',
    description: 'A colossal forge built from the bones of ancient sea creatures.',
    lore: 'The Abyssal Foundry was not built — it was grown. Coral colonized the skeleton of a leviathan, and forgers shaped it into the greatest forge in the sea.',
    emoji: '🏗️',
    level: 6,
    resources: { mat_leviathan_bone: 1, mat_abyssal_iron: 2, mat_deep_crystal: 2 },
    capacity: 80,
    unlockLevel: 32,
    ambientColor: '#1C1C3C',
    dangerLevel: 6,
  },
  {
    id: 'ch_world_core',
    name: 'World Core Anvil',
    description: 'The anvil that sits atop a crack in the planet\'s mantle.',
    lore: 'The World Core Anvil taps directly into the planetary mantle. A single strike here can forge weapons of world-altering power.',
    emoji: '🌍',
    level: 7,
    resources: { mat_mantle_shard: 1, mantis_shard_world_core: 2, mat_primordial_ember: 1 },
    capacity: 100,
    unlockLevel: 40,
    ambientColor: '#FFD700',
    dangerLevel: 8,
  },
  {
    id: 'ch_eternal_forge',
    name: 'The Eternal Forge',
    description: 'The final chamber, where the ocean\'s oldest secrets are forged into legend.',
    lore: 'No one knows who built the Eternal Forge. It was here before the ocean, before the land, before the world. It simply IS.',
    emoji: '♾️',
    level: 8,
    resources: { mat_primordial_ember: 2, mat_eternal_coral: 1, mat_void_pearl: 1 },
    capacity: 120,
    unlockLevel: 48,
    ambientColor: '#FF7F50',
    dangerLevel: 10,
  },
]

// =============================================================================
// §7 — CF_MATERIALS — 12 Materials
// =============================================================================

export const CF_MATERIALS: CfMaterialDef[] = [
  {
    id: 'mat_soft_coral',
    name: 'Soft Coral',
    rarity: 'common',
    category: 'coral',
    value: 3,
    description: 'Pliable coral from the shallow reefs, ideal for beginners.',
    emoji: '🪸',
  },
  {
    id: 'mat_shell_fragment',
    name: 'Shell Fragment',
    rarity: 'common',
    category: 'shell',
    value: 4,
    description: 'Broken pieces of sea shells used as basic forging flux.',
    emoji: '🐚',
  },
  {
    id: 'mat_glow_coral',
    name: 'Glow Coral',
    rarity: 'uncommon',
    category: 'coral',
    value: 12,
    description: 'Bioluminescent coral that emits light and mild enchantment energy.',
    emoji: '💡',
  },
  {
    id: 'mat_pearl_dust',
    name: 'Pearl Dust',
    rarity: 'uncommon',
    category: 'essence',
    value: 15,
    description: 'Ground pearls used as a potent enchantment catalyst.',
    emoji: '💫',
  },
  {
    id: 'mat_volcanic_glass',
    name: 'Volcanic Glass',
    rarity: 'uncommon',
    category: 'mineral',
    value: 18,
    description: 'Obsidian formed by underwater volcanic eruptions, extremely sharp.',
    emoji: '🔷',
  },
  {
    id: 'mat_magma_coral',
    name: 'Magma Coral',
    rarity: 'rare',
    category: 'coral',
    value: 40,
    description: 'Coral that grows in magma flows, impossibly hot and alive.',
    emoji: '🪨',
  },
  {
    id: 'mat_iron_kelp',
    name: 'Iron Kelp',
    rarity: 'rare',
    category: 'mineral',
    value: 35,
    description: 'Kelp that absorbs iron from volcanic vents, heavy and metallic.',
    emoji: '🌿',
  },
  {
    id: 'mat_giant_pearl',
    name: 'Giant Pearl',
    rarity: 'rare',
    category: 'essence',
    value: 50,
    description: 'A pearl the size of a fist, containing centuries of stored enchantment.',
    emoji: '🔮',
  },
  {
    id: 'mat_abyssal_iron',
    name: 'Abyssal Iron',
    rarity: 'epic',
    category: 'mineral',
    value: 120,
    description: 'Iron extracted from the abyssal plain, compressed by ocean pressure.',
    emoji: '⬛',
  },
  {
    id: 'mat_obsidian_coral',
    name: 'Obsidian Coral',
    rarity: 'epic',
    category: 'coral',
    value: 140,
    description: 'Coral that has been vitrified by extreme heat into living obsidian.',
    emoji: '🖤',
  },
  {
    id: 'mat_primordial_ember',
    name: 'Primordial Ember',
    rarity: 'epic',
    category: 'lava',
    value: 160,
    description: 'A ember from the world\'s first undersea volcanic eruption, still burning.',
    emoji: '🔥',
  },
  {
    id: 'mat_eternal_coral',
    name: 'Eternal Coral',
    rarity: 'legendary',
    category: 'coral',
    value: 500,
    description: 'Coral that has existed since before the ocean, imbued with creation energy.',
    emoji: '💎',
  },
]

// =============================================================================
// §8 — CF_STRUCTURES — 8 Structures (Upgradeable to Level 10)
// =============================================================================

export const CF_STRUCTURES: CfStructureDef[] = [
  {
    id: 'struct_coral_anvil',
    name: 'Coral Anvil',
    description: 'The primary forging surface, grown from compressed reef coral.',
    emoji: '🔨',
    maxLevel: 10,
    baseCost: 50,
    costScaling: 1.5,
    category: 'production',
  },
  {
    id: 'struct_magma_crucible',
    name: 'Magma Crucible',
    description: 'A vessel that channels volcanic heat for smelting coral and minerals.',
    emoji: '🌋',
    maxLevel: 10,
    baseCost: 80,
    costScaling: 1.6,
    category: 'production',
  },
  {
    id: 'struct_pearl_enchanting_altar',
    name: 'Pearl Enchanting Altar',
    description: 'A sacred altar where pearls are used to imbue weapons with magic.',
    emoji: '🔮',
    maxLevel: 10,
    baseCost: 120,
    costScaling: 1.7,
    category: 'research',
  },
  {
    id: 'struct_depth_press',
    name: 'Depth Press',
    description: 'Uses immense ocean pressure to compress materials into denser forms.',
    emoji: '🔄',
    maxLevel: 10,
    baseCost: 100,
    costScaling: 1.55,
    category: 'production',
  },
  {
    id: 'struct_reef_bastion',
    name: 'Reef Bastion',
    description: 'A living wall of hardened coral that protects the forge from deep-sea predators.',
    emoji: '🏰',
    maxLevel: 10,
    baseCost: 150,
    costScaling: 1.65,
    category: 'defense',
  },
  {
    id: 'struct_thermal_vent_network',
    name: 'Thermal Vent Network',
    description: 'A system of pipes redirecting volcanic heat to all forge chambers.',
    emoji: '🔥',
    maxLevel: 10,
    baseCost: 200,
    costScaling: 1.75,
    category: 'production',
  },
  {
    id: 'struct_abyssal_vault',
    name: 'Abyssal Vault',
    description: 'A pressure-sealed storage vault for rare materials and legendary weapons.',
    emoji: '🏛️',
    maxLevel: 10,
    baseCost: 180,
    costScaling: 1.6,
    category: 'storage',
  },
  {
    id: 'struct_coral_nursery',
    name: 'Coral Nursery',
    description: 'A cultivation chamber where rare coral species are grown for forging.',
    emoji: '🌱',
    maxLevel: 10,
    baseCost: 250,
    costScaling: 1.8,
    category: 'research',
  },
]

// =============================================================================
// §9 — CF_ABILITIES — 8 Abilities (2 per category)
// =============================================================================

export const CF_ABILITIES: CfAbilityDef[] = [
  // Offensive (2)
  {
    id: 'ability_magma_surge',
    name: 'Magma Surge',
    description: 'Unleashes a wave of superheated magma that damages all enemies in range and boosts forge temperature.',
    category: 'offensive',
    cooldown: 60,
    power: 80,
    cost: 30,
    unlockLevel: 3,
    emoji: '🌋',
  },
  {
    id: 'ability_coral_blade_storm',
    name: 'Coral Blade Storm',
    description: 'Summons a tornado of razor-sharp coral fragments that shred through defenses.',
    category: 'offensive',
    cooldown: 90,
    power: 120,
    cost: 50,
    unlockLevel: 18,
    emoji: '🌀',
  },
  // Defensive (2)
  {
    id: 'ability_pearl_barrier',
    name: 'Pearl Barrier',
    description: 'Creates a shimmering barrier of compressed pearl energy that absorbs incoming damage.',
    category: 'defensive',
    cooldown: 75,
    power: 60,
    cost: 25,
    unlockLevel: 5,
    emoji: '🛡️',
  },
  {
    id: 'ability_reef_fortification',
    name: 'Reef Fortification',
    description: 'Rapidly grows a defensive coral wall that blocks attacks and traps enemies.',
    category: 'defensive',
    cooldown: 100,
    power: 100,
    cost: 45,
    unlockLevel: 22,
    emoji: '🧱',
  },
  // Utility (2)
  {
    id: 'ability_depth_sense',
    name: 'Depth Sense',
    description: 'Reveals hidden resources, secret chambers, and lurking threats in the surrounding area.',
    category: 'utility',
    cooldown: 45,
    power: 40,
    cost: 15,
    unlockLevel: 2,
    emoji: '👁️',
  },
  {
    id: 'ability_coral_transmutation',
    name: 'Coral Transmutation',
    description: 'Transforms common materials into rarer ones using volcanic energy and pearl catalysts.',
    category: 'utility',
    cooldown: 120,
    power: 70,
    cost: 40,
    unlockLevel: 28,
    emoji: '⚗️',
  },
  // Summon (2)
  {
    id: 'ability_call_of_the_deep',
    name: 'Call of the Deep',
    description: 'Summons a pod of deep-sea creatures to assist in harvesting and defense.',
    category: 'summon',
    cooldown: 80,
    power: 55,
    cost: 35,
    unlockLevel: 8,
    emoji: '🐋',
  },
  {
    id: 'ability_awaken_leviathan',
    name: 'Awaken Leviathan',
    description: 'Temporarily awakens an ancient leviathan guardian to fight alongside you.',
    category: 'summon',
    cooldown: 180,
    power: 150,
    cost: 80,
    unlockLevel: 35,
    emoji: '🐉',
  },
]

// =============================================================================
// §10 — CF_ACHIEVEMENTS — 10 Achievements
// =============================================================================

export const CF_ACHIEVEMENTS: CfAchievementDef[] = [
  {
    id: 'ach_first_spark',
    name: 'First Spark',
    description: 'Perform your first forge action in the Coral Forge.',
    targetValue: 1,
    rewardCoins: 50,
    rewardXp: 20,
    emoji: '🔥',
  },
  {
    id: 'ach_reef_builder',
    name: 'Reef Builder',
    description: 'Build 3 different structures in the forge.',
    targetValue: 3,
    rewardCoins: 200,
    rewardXp: 80,
    emoji: '🏗️',
  },
  {
    id: 'ach_deep_diver',
    name: 'Deep Diver',
    description: 'Unlock 4 different forge chambers.',
    targetValue: 4,
    rewardCoins: 300,
    rewardXp: 120,
    emoji: '🤿',
  },
  {
    id: 'ach_coral_collector',
    name: 'Coral Collector',
    description: 'Accumulate 5 different types of materials in your inventory.',
    targetValue: 5,
    rewardCoins: 150,
    rewardXp: 60,
    emoji: '🪸',
  },
  {
    id: 'ach_abyssal_forger',
    name: 'Abyssal Forger',
    description: 'Reach forge level 25.',
    targetValue: 25,
    rewardCoins: 500,
    rewardXp: 200,
    emoji: '⚒️',
  },
  {
    id: 'ach_creature_master',
    name: 'Creature Master',
    description: 'Acquire 10 different creatures.',
    targetValue: 10,
    rewardCoins: 600,
    rewardXp: 250,
    emoji: '🦀',
  },
  {
    id: 'ach_enchantment_expert',
    name: 'Enchantment Expert',
    description: 'Enchant 20 items total.',
    targetValue: 20,
    rewardCoins: 400,
    rewardXp: 180,
    emoji: '✨',
  },
  {
    id: 'ach_legendary_smith',
    name: 'Legendary Smith',
    description: 'Reach forge level 50.',
    targetValue: 50,
    rewardCoins: 2000,
    rewardXp: 500,
    emoji: '👑',
  },
  {
    id: 'ach_artifact_keeper',
    name: 'Artifact Keeper',
    description: 'Activate 4 different artifacts.',
    targetValue: 4,
    rewardCoins: 800,
    rewardXp: 300,
    emoji: '💎',
  },
  {
    id: 'ach_stalwart_guardian',
    name: 'Stalwart Guardian',
    description: 'Maintain a daily streak of 7 consecutive days.',
    targetValue: 7,
    rewardCoins: 350,
    rewardXp: 150,
    emoji: '💪',
  },
]

// =============================================================================
// §11 — CF_TITLES — 8 Titles
// =============================================================================

export const CF_TITLES: CfTitleDef[] = [
  {
    id: 'title_tide_caller',
    name: 'Tide Caller',
    requirement: 0,
    description: 'A novice who has just begun to hear the ocean\'s call.',
    emoji: '🌊',
  },
  {
    id: 'title_reef_apprentice',
    name: 'Reef Apprentice',
    requirement: 100,
    description: 'An apprentice learning to shape coral under the waves.',
    emoji: '🪸',
  },
  {
    id: 'title_vent_tender',
    name: 'Vent Tender',
    requirement: 300,
    description: 'A skilled worker who tends the volcanic vents.',
    emoji: '🌋',
  },
  {
    id: 'title_deep_smith',
    name: 'Deep Smith',
    requirement: 600,
    description: 'A smith who has descended past the twilight zone.',
    emoji: '⚒️',
  },
  {
    id: 'title_pearl_sage',
    name: 'Pearl Sage',
    requirement: 1000,
    description: 'A sage who understands the language of pearls.',
    emoji: '🔮',
  },
  {
    id: 'title_abyssal_forge_lord',
    name: 'Abyssal Forge Lord',
    requirement: 1800,
    description: 'A lord who commands the forge at the ocean\'s deepest point.',
    emoji: '👑',
  },
  {
    id: 'title_coral_sovereign',
    name: 'Coral Sovereign',
    requirement: 3000,
    description: 'A sovereign whose will shapes the reef itself.',
    emoji: '🏛️',
  },
  {
    id: 'title_world_forge_eternal',
    name: 'World Forge Eternal',
    requirement: 5000,
    description: 'The eternal master of the coral forge, one with the ocean.',
    emoji: '♾️',
  },
]

// =============================================================================
// §12 — CF_ARTIFACTS — 6 Artifacts
// =============================================================================

export const CF_ARTIFACTS: CfArtifactDef[] = [
  {
    id: 'art_flame_trident',
    name: 'Flame Trident',
    description: 'A trident forged from magma coral that burns with underwater fire.',
    lore: 'The Flame Trident was wielded by the first Abyssal Forge Lord. Its three prongs channel magma, fire, and steam simultaneously.',
    emoji: '🔱',
    rarity: 'rare',
    power: 60,
    unlockLevel: 12,
  },
  {
    id: 'art_pearl_of_ages',
    name: 'Pearl of Ages',
    description: 'A pearl that has absorbed enchantments for ten thousand years.',
    lore: 'The Pearl of Ages was found inside the skull of a leviathan that died before the continents formed. It hums with forgotten magic.',
    emoji: '🔮',
    rarity: 'epic',
    power: 100,
    unlockLevel: 20,
  },
  {
    id: 'art_coral_crown',
    name: 'Coral Crown',
    description: 'A living crown that grows new coral with every battle won.',
    lore: 'The Coral Crown was grown, not made. Its maker planted a seed of primordial coral on a band of abyssal iron and waited three centuries.',
    emoji: '👑',
    rarity: 'epic',
    power: 85,
    unlockLevel: 25,
  },
  {
    id: 'art_obsidian_plate',
    name: 'Obsidian Plate',
    description: 'Armor of living obsidian coral that hardens under pressure.',
    lore: 'The deeper you go wearing the Obsidian Plate, the stronger it becomes. At the trench floor, it is virtually indestructible.',
    emoji: '🛡️',
    rarity: 'rare',
    power: 70,
    unlockLevel: 15,
  },
  {
    id: 'art_heart_of_the_vent',
    name: 'Heart of the Vent',
    description: 'The crystallized core of an ancient volcanic vent, pulsing with heat.',
    lore: 'The Heart beats once every hour. Each beat sends a shockwave of heat through the forge, empowering all nearby creatures.',
    emoji: '❤️‍🔥',
    rarity: 'epic',
    power: 110,
    unlockLevel: 30,
  },
  {
    id: 'art_eternal_anvil_shard',
    name: 'Eternal Anvil Shard',
    description: 'A fragment of the Eternal Forge\'s anvil, containing infinite forging potential.',
    lore: 'The Eternal Anvil was shattered in the Cataclysm of Tides. Only seven shards remain, each one capable of forging a legend.',
    emoji: '💎',
    rarity: 'legendary',
    power: 200,
    unlockLevel: 45,
  },
]

// =============================================================================
// §13 — CF_EVENTS — 8 Events
// =============================================================================

export const CF_EVENTS: CfEventDef[] = [
  {
    id: 'event_volcanic_eruption',
    name: 'Volcanic Eruption',
    description: 'An undersea volcano erupts, flooding the forge with magma and rare materials.',
    lore: 'The eruption shakes the entire reef. Magma flows through every chamber, but with destruction comes opportunity — new materials crystallize in the cooling lava.',
    emoji: '🌋',
    duration: 300,
    rewardMultiplier: 2.0,
    rarity: 'rare',
  },
  {
    id: 'event_pearl_bloom',
    name: 'Pearl Bloom',
    description: 'A rare convergence of magical energy causes pearls to form everywhere.',
    lore: 'Once per century, the ocean\'s magic aligns. Every mollusk in range produces a pearl, and existing pearls glow with renewed power.',
    emoji: '🫧',
    duration: 240,
    rewardMultiplier: 1.8,
    rarity: 'rare',
  },
  {
    id: 'event_leviathan_migration',
    name: 'Leviathan Migration',
    description: 'Massive sea creatures pass through the forge, dropping rare materials.',
    lore: 'The leviathans travel on paths older than mountains. In their wake, they leave scales, bones, and occasionally, a pearl the size of a boulder.',
    emoji: '🐋',
    duration: 360,
    rewardMultiplier: 2.2,
    rarity: 'epic',
  },
  {
    id: 'event_abyssal_storm',
    name: 'Abyssal Storm',
    description: 'A powerful deep-sea storm alters currents and uncovers hidden chambers.',
    lore: 'The Abyssal Storm is feared by all creatures except the Abyssal Forgers, who use its energy to power their forges to unprecedented levels.',
    emoji: '⛈️',
    duration: 180,
    rewardMultiplier: 1.5,
    rarity: 'uncommon',
  },
  {
    id: 'event_coral_reckoning',
    name: 'Coral Reckoning',
    description: 'The coral reef enters a rapid growth phase, producing surplus materials.',
    lore: 'During the Reckoning, coral grows so fast it can be heard — a cracking, groaning sound as new branches push through the water.',
    emoji: '🌿',
    duration: 300,
    rewardMultiplier: 1.6,
    rarity: 'uncommon',
  },
  {
    id: 'event_magma_surge',
    name: 'Magma Surge',
    description: 'A surge of volcanic energy boosts all forging temperatures.',
    lore: 'The Magma Surge originates from a crack in the mantle. For a brief time, every forge in the ocean runs hotter than ever before.',
    emoji: '🔥',
    duration: 200,
    rewardMultiplier: 1.9,
    rarity: 'rare',
  },
  {
    id: 'event_void_tide',
    name: 'Void Tide',
    description: 'An anomalous tide from the deep void brings unknown materials.',
    lore: 'The Void Tide is not water — it is absence. Where it touches, things that should not exist materialize briefly before dissolving.',
    emoji: '🌑',
    duration: 420,
    rewardMultiplier: 2.5,
    rarity: 'epic',
  },
  {
    id: 'event_eternal_convergence',
    name: 'Eternal Convergence',
    description: 'All magical forces align, creating a golden age of forging.',
    lore: 'The Eternal Convergence happens only when all seven species work in harmony. Coral, magma, pearl, depth, reef, bubble, and abyss become one.',
    emoji: '✨',
    duration: 600,
    rewardMultiplier: 3.0,
    rarity: 'legendary',
  },
]

// =============================================================================
// §14 — Helpers
// =============================================================================

let cfInstanceCounter = 0
function cfGenerateId(prefix: string): string {
  cfInstanceCounter++
  return `${prefix}_${Date.now()}_${cfInstanceCounter}`
}

function cfGenerateDayKey(now: number): string {
  const d = new Date(now)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function cfXpRequiredForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= CF_MAX_LEVEL) return Infinity
  return Math.floor(100 * level * (1 + level * 0.12))
}

function cfStructureUpgradeCost(baseCost: number, currentLevel: number, scaling: number): number {
  return Math.floor(baseCost * Math.pow(scaling, currentLevel))
}

function cfClampLevel(lvl: number): number {
  return Math.max(1, Math.min(CF_MAX_LEVEL, lvl))
}

function cfRarityMultiplier(rarity: CfRarity): number {
  const map: Record<CfRarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2.5,
    epic: 4,
    legendary: 7,
  }
  return map[rarity] ?? 1
}

function cfRarityLabel(rarity: CfRarity): string {
  const map: Record<CfRarity, string> = {
    common: 'Common',
    uncommon: 'Uncommon',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
  }
  return map[rarity] ?? 'Unknown'
}

function cfRarityColor(rarity: CfRarity): string {
  const map: Record<CfRarity, string> = {
    common: CF_THEME_COLORS.common,
    uncommon: CF_THEME_COLORS.uncommon,
    rare: CF_THEME_COLORS.rare,
    epic: CF_THEME_COLORS.epic,
    legendary: CF_THEME_COLORS.legendary,
  }
  return map[rarity] ?? CF_THEME_COLORS.common
}

function cfSpeciesLabel(species: CfSpecies): string {
  return CF_SPECIES.find(s => s.key === species)?.label ?? 'Unknown'
}

function cfSpeciesEmoji(species: CfSpecies): string {
  return CF_SPECIES.find(s => s.key === species)?.emoji ?? '❓'
}

function cfGetRarityDef(rarity: CfRarity): CfRarityDef {
  const map: Record<CfRarity, CfRarityDef> = {
    common: { key: 'common', label: 'Common', color: CF_THEME_COLORS.common, xpMultiplier: 1, dropWeight: 50 },
    uncommon: { key: 'uncommon', label: 'Uncommon', color: CF_THEME_COLORS.uncommon, xpMultiplier: 1.5, dropWeight: 30 },
    rare: { key: 'rare', label: 'Rare', color: CF_THEME_COLORS.rare, xpMultiplier: 2.5, dropWeight: 14 },
    epic: { key: 'epic', label: 'Epic', color: CF_THEME_COLORS.epic, xpMultiplier: 4, dropWeight: 5 },
    legendary: { key: 'legendary', label: 'Legendary', color: CF_THEME_COLORS.legendary, xpMultiplier: 7, dropWeight: 1 },
  }
  return map[rarity] ?? map.common
}

function cfFormatCooldown(seconds: number): string {
  if (seconds <= 0) return 'Ready'
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

// Create the default state
function cfCreateDefaultState(): CfCoralForgeState {
  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    coins: CF_STARTING_COINS,
    totalCoinsEarned: 0,
    totalCoinsSpent: 0,
    creatures: [],
    chambers: CF_CHAMBERS.map((ch, i) => ({
      defId: ch.id,
      unlocked: i === 0,
      currentDepth: 0,
      maxDepth: ch.capacity,
      lastExploredAt: i === 0 ? Date.now() : null,
    })),
    materials: CF_MATERIALS.map(m => ({
      defId: m.id,
      count: m.rarity === 'common' ? 3 : 0,
    })),
    structures: CF_STRUCTURES.map(s => ({
      defId: s.id,
      level: 0,
    })),
    abilities: CF_ABILITIES.map(a => ({
      defId: a.id,
      unlocked: false,
      lastUsed: 0,
      timesUsed: 0,
    })),
    achievements: CF_ACHIEVEMENTS.map(a => ({
      defId: a.id,
      unlocked: false,
      progress: 0,
      unlockedAt: null,
    })),
    artifacts: CF_ARTIFACTS.map(a => ({
      defId: a.id,
      activated: false,
      activatedAt: null,
      charges: 3,
    })),
    activeTitle: 'title_tide_caller',
    activeChamber: 'ch_shallow_reef',
    currentEvent: null,
    eventExpiresAt: null,
    streak: 0,
    bestStreak: 0,
    lastPlayDate: null,
    totalForged: 0,
    totalEnchanted: 0,
    totalDives: 0,
    totalHarvested: 0,
    totalTempered: 0,
    totalCombined: 0,
    totalAwakened: 0,
    totalActionsPerformed: 0,
    eventLog: [],
    dailyActions: 0,
    dailyDate: null,
  }
}

// Save / load from localStorage
function cfLoadState(): CfCoralForgeState {
  if (typeof window === 'undefined') return cfCreateDefaultState()
  try {
    const raw = localStorage.getItem(CF_SAVE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CfCoralForgeState>
      const defaults = cfCreateDefaultState()
      return { ...defaults, ...parsed }
    }
  } catch {
    // ignore parse errors
  }
  return cfCreateDefaultState()
}

function cfSaveState(state: CfCoralForgeState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CF_SAVE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota errors
  }
}

// =============================================================================
// §14 — Main Hook: useCoralForge
// =============================================================================

export default function useCoralForge() {
  const [state, setState] = useState<CfCoralForgeState>(cfCreateDefaultState)
  const stateRef = useRef<CfCoralForgeState>(state)

  // Load on mount
  useEffect(() => {
    const loaded = cfLoadState()
    setState(loaded)
  }, [])

  // Sync ref & persist
  useEffect(() => {
    stateRef.current = state
    cfSaveState(state)
  }, [state])

  // ── XP & Leveling ──────────────────────────────────────────────────────────

  const addXp = useCallback((rawXp: number, actionType: CfActionType) => {
    setState(prev => {
      const rarityMult = prev.currentEvent
        ? (CF_EVENTS.find(e => e.id === prev.currentEvent)?.rewardMultiplier ?? 1)
        : 1
      const streakMult = 1 + prev.streak * CF_STREAK_BONUS_MULTIPLIER
      const xp = Math.floor(rawXp * rarityMult * streakMult)
      let newXp = prev.xp + xp
      let newLevel = prev.level
      let newCoins = prev.coins
      let totalCoinsEarned = prev.totalCoinsEarned

      while (newLevel < CF_MAX_LEVEL && newXp >= cfXpRequiredForLevel(newLevel)) {
        newXp -= cfXpRequiredForLevel(newLevel)
        newLevel++
        const levelUpBonus = Math.floor(20 * newLevel * cfRarityMultiplier('uncommon'))
        newCoins += levelUpBonus
        totalCoinsEarned += levelUpBonus
      }

      if (newLevel >= CF_MAX_LEVEL) {
        newXp = 0
      }

      newLevel = cfClampLevel(newLevel)

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        totalXp: prev.totalXp + xp,
        coins: newCoins,
        totalCoinsEarned,
        dailyActions: prev.dailyActions + 1,
      }
    })
  }, [])

  // ── Action Tracking ───────────────────────────────────────────────────────

  const logEvent = useCallback((actionType: CfActionType, message: string, metadata?: Record<string, number | string | boolean>) => {
    const entry: CfEventLog = {
      id: cfGenerateId('evt'),
      timestamp: Date.now(),
      actionType,
      message,
      metadata,
    }
    setState(prev => ({
      ...prev,
      eventLog: [entry, ...prev.eventLog].slice(0, CF_MAX_EVENT_LOG),
    }))
  }, [])

  // ── Daily Reset ───────────────────────────────────────────────────────────

  const checkDailyReset = useCallback(() => {
    setState(prev => {
      const today = cfGenerateDayKey(Date.now())
      if (prev.dailyDate !== today) {
        const yesterday = cfGenerateDayKey(Date.now() - 86400000)
        const newStreak = prev.lastPlayDate === yesterday ? prev.streak + 1 : (prev.lastPlayDate === today ? prev.streak : 1)
        return {
          ...prev,
          dailyDate: today,
          dailyActions: 0,
          lastPlayDate: today,
          streak: newStreak,
          bestStreak: Math.max(prev.bestStreak, newStreak),
        }
      }
      return prev
    })
  }, [])

  // ── Achievement Checking ───────────────────────────────────────────────────

  const checkAchievements = useCallback((state: CfCoralForgeState) => {
    const progressMap: Record<string, number> = {
      ach_first_spark: state.totalActionsPerformed,
      ach_reef_builder: state.structures.filter(s => s.level > 0).length,
      ach_deep_diver: state.chambers.filter(c => c.unlocked).length,
      ach_coral_collector: state.materials.filter(m => m.count > 0).length,
      ach_abyssal_forger: state.level,
      ach_creature_master: state.creatures.length,
      ach_enchantment_expert: state.totalEnchanted,
      ach_legendary_smith: state.level,
      ach_artifact_keeper: state.artifacts.filter(a => a.activated).length,
      ach_stalwart_guardian: state.streak,
    }

    let coinsToAdd = 0
    let xpToAdd = 0
    const updatedAchievements = state.achievements.map(ach => {
      if (ach.unlocked) return ach
      const target = CF_ACHIEVEMENTS.find(a => a.id === ach.defId)
      if (!target) return ach
      const progress = progressMap[ach.defId] ?? 0
      if (progress >= target.targetValue) {
        coinsToAdd += target.rewardCoins
        xpToAdd += target.rewardXp
        return { ...ach, unlocked: true, progress, unlockedAt: Date.now() }
      }
      return { ...ach, progress }
    })

    if (coinsToAdd > 0 || xpToAdd > 0) {
      return {
        ...state,
        achievements: updatedAchievements,
        coins: state.coins + coinsToAdd,
        totalCoinsEarned: state.totalCoinsEarned + coinsToAdd,
      }
    }
    return { ...state, achievements: updatedAchievements }
  }, [])

  // ── Title Computation ──────────────────────────────────────────────────────

  const computeBestTitle = useCallback((totalXp: number): string => {
    let best = CF_TITLES[0].id
    for (const title of CF_TITLES) {
      if (totalXp >= title.requirement) {
        best = title.id
      }
    }
    return best
  }, [])

  // ── Action: Forge ──────────────────────────────────────────────────────────

  const doForge = useCallback((materialId?: string, count: number = 1) => {
    setState(prev => {
      const cost = count * 5
      if (prev.coins < cost) return prev
      if (prev.dailyActions >= CF_DAILY_ACTION_LIMIT) return prev

      let newMaterials = [...prev.materials]
      if (materialId) {
        newMaterials = newMaterials.map(m =>
          m.defId === materialId ? { ...m, count: m.count + count } : m
        )
      }

      const eventMult = prev.currentEvent
        ? (CF_EVENTS.find(e => e.id === prev.currentEvent)?.rewardMultiplier ?? 1)
        : 1
      const coinReward = Math.floor(CF_COINS_PER_FORGE * count * eventMult)
      const xpReward = Math.floor(CF_BASE_XP_PER_ACTION * count * eventMult)

      const newState = {
        ...prev,
        materials: newMaterials,
        coins: prev.coins - cost + coinReward,
        totalCoinsEarned: prev.totalCoinsEarned + coinReward,
        totalCoinsSpent: prev.totalCoinsSpent + cost,
        totalForged: prev.totalForged + count,
        totalActionsPerformed: prev.totalActionsPerformed + count,
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
      }

      const withAchievements = checkAchievements(newState)
      withAchievements.activeTitle = computeBestTitle(withAchievements.totalXp)
      return withAchievements
    })
    logEvent('forge', `Forged ${count} item${count > 1 ? 's' : ''} at the coral anvil.`, { materialId, count })
  }, [logEvent, checkAchievements, computeBestTitle])

  // ── Action: Enchant ────────────────────────────────────────────────────────

  const doEnchant = useCallback((creatureInstanceId: string) => {
    setState(prev => {
      const creature = prev.creatures.find(c => c.instanceId === creatureInstanceId)
      if (!creature) return prev
      const cost = Math.floor(15 * cfRarityMultiplier(CF_CREATURES.find(cr => cr.id === creature.defId)?.rarity ?? 'common'))
      if (prev.coins < cost) return prev

      const xpReward = Math.floor(CF_BASE_XP_PER_ACTION * 1.5)
      const newState = {
        ...prev,
        coins: prev.coins - cost,
        totalCoinsSpent: prev.totalCoinsSpent + cost,
        totalEnchanted: prev.totalEnchanted + 1,
        totalActionsPerformed: prev.totalActionsPerformed + 1,
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
      }
      const withAchievements = checkAchievements(newState)
      withAchievements.activeTitle = computeBestTitle(withAchievements.totalXp)
      return withAchievements
    })
    logEvent('enchant', `Enchanted creature ${creatureInstanceId} with pearl magic.`)
  }, [logEvent, checkAchievements, computeBestTitle])

  // ── Action: Dive ───────────────────────────────────────────────────────────

  const doDive = useCallback((chamberId: string) => {
    setState(prev => {
      const chamber = prev.chambers.find(c => c.defId === chamberId)
      if (!chamber || !chamber.unlocked) return prev
      if (prev.dailyActions >= CF_DAILY_ACTION_LIMIT) return prev

      const chamberDef = CF_CHAMBERS.find(ch => ch.id === chamberId)
      if (!chamberDef) return prev

      const eventMult = prev.currentEvent
        ? (CF_EVENTS.find(e => e.id === prev.currentEvent)?.rewardMultiplier ?? 1)
        : 1
      const xpReward = Math.floor(CF_BASE_XP_PER_ACTION * 1.2 * eventMult * chamberDef.dangerLevel)
      const coinReward = Math.floor(8 * chamberDef.level * eventMult)

      const newChambers = prev.chambers.map(c =>
        c.defId === chamberId
          ? { ...c, currentDepth: Math.min(c.currentDepth + 1, c.maxDepth), lastExploredAt: Date.now() }
          : c
      )

      // Harvest materials from chamber resources
      const newMaterials = [...prev.materials]
      for (const [matId, amount] of Object.entries(chamberDef.resources)) {
        const idx = newMaterials.findIndex(m => m.defId === matId)
        if (idx >= 0) {
          newMaterials[idx] = { ...newMaterials[idx], count: newMaterials[idx].count + Math.ceil(amount * eventMult) }
        }
      }

      const newState = {
        ...prev,
        chambers: newChambers,
        materials: newMaterials,
        coins: prev.coins + coinReward,
        totalCoinsEarned: prev.totalCoinsEarned + coinReward,
        totalDives: prev.totalDives + 1,
        totalActionsPerformed: prev.totalActionsPerformed + 1,
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
        activeChamber: chamberId,
      }
      const withAchievements = checkAchievements(newState)
      withAchievements.activeTitle = computeBestTitle(withAchievements.totalXp)
      return withAchievements
    })
    const chamberDef = CF_CHAMBERS.find(ch => ch.id === chamberId)
    logEvent('dive', `Explored ${chamberDef?.name ?? chamberId}.`, { chamberId })
  }, [logEvent, checkAchievements, computeBestTitle])

  // ── Action: Harvest ────────────────────────────────────────────────────────

  const doHarvest = useCallback((chamberId?: string) => {
    setState(prev => {
      const targetChamber = chamberId
        ? prev.chambers.find(c => c.defId === chamberId && c.unlocked)
        : prev.chambers.find(c => c.defId === prev.activeChamber && c.unlocked)
      if (!targetChamber) return prev
      if (prev.dailyActions >= CF_DAILY_ACTION_LIMIT) return prev

      const chamberDef = CF_CHAMBERS.find(ch => ch.id === targetChamber.defId)
      if (!chamberDef) return prev

      const eventMult = prev.currentEvent
        ? (CF_EVENTS.find(e => e.id === prev.currentEvent)?.rewardMultiplier ?? 1)
        : 1
      const coinReward = Math.floor(CF_COINS_PER_HARVEST * chamberDef.level * eventMult)
      const xpReward = Math.floor(CF_BASE_XP_PER_ACTION * 0.8 * eventMult)

      const newMaterials = [...prev.materials]
      for (const [matId, amount] of Object.entries(chamberDef.resources)) {
        const idx = newMaterials.findIndex(m => m.defId === matId)
        if (idx >= 0) {
          const harvestAmount = Math.ceil(amount * 1.5 * eventMult)
          newMaterials[idx] = { ...newMaterials[idx], count: newMaterials[idx].count + harvestAmount }
        }
      }

      const newState = {
        ...prev,
        materials: newMaterials,
        coins: prev.coins + coinReward,
        totalCoinsEarned: prev.totalCoinsEarned + coinReward,
        totalHarvested: prev.totalHarvested + 1,
        totalActionsPerformed: prev.totalActionsPerformed + 1,
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
      }
      const withAchievements = checkAchievements(newState)
      withAchievements.activeTitle = computeBestTitle(withAchievements.totalXp)
      return withAchievements
    })
    logEvent('harvest', `Harvested materials from the forge.`)
  }, [logEvent, checkAchievements, computeBestTitle])

  // ── Action: Temper ─────────────────────────────────────────────────────────

  const doTemper = useCallback((creatureInstanceId: string) => {
    setState(prev => {
      const creature = prev.creatures.find(c => c.instanceId === creatureInstanceId)
      if (!creature) return prev
      if (creature.level >= CF_MAX_CREATURE_LEVEL) return prev
      const cost = Math.floor(20 + creature.level * 5)
      if (prev.coins < cost) return prev

      const xpGain = Math.floor(30 * (1 + creature.level * 0.1))
      const newXp = creature.xp + xpGain
      let newLevel = creature.level
      let remainingXp = newXp

      while (newLevel < CF_MAX_CREATURE_LEVEL && remainingXp >= cfXpRequiredForLevel(newLevel)) {
        remainingXp -= cfXpRequiredForLevel(newLevel)
        newLevel++
      }

      const newCreatures = prev.creatures.map(c =>
        c.instanceId === creatureInstanceId
          ? { ...c, level: newLevel, xp: remainingXp }
          : c
      )

      const xpReward = Math.floor(CF_BASE_XP_PER_ACTION * CF_FORGE_TEMPER_BONUS * 10)
      const newState = {
        ...prev,
        creatures: newCreatures,
        coins: prev.coins - cost,
        totalCoinsSpent: prev.totalCoinsSpent + cost,
        totalTempered: prev.totalTempered + 1,
        totalActionsPerformed: prev.totalActionsPerformed + 1,
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
      }
      const withAchievements = checkAchievements(newState)
      withAchievements.activeTitle = computeBestTitle(withAchievements.totalXp)
      return withAchievements
    })
    logEvent('temper', `Tempered creature ${creatureInstanceId} at the volcanic vent.`)
  }, [logEvent, checkAchievements, computeBestTitle])

  // ── Action: Combine ────────────────────────────────────────────────────────

  const doCombine = useCallback((creatureInstanceIdA: string, creatureInstanceIdB: string) => {
    setState(prev => {
      const creatureA = prev.creatures.find(c => c.instanceId === creatureInstanceIdA)
      const creatureB = prev.creatures.find(c => c.instanceId === creatureInstanceIdB)
      if (!creatureA || !creatureB) return prev
      if (creatureA.instanceId === creatureB.instanceId) return prev
      const cost = Math.floor(50 * cfRarityMultiplier(CF_CREATURES.find(cr => cr.id === creatureA.defId)?.rarity ?? 'common'))
      if (prev.coins < cost) return prev

      const defA = CF_CREATURES.find(cr => cr.id === creatureA.defId)
      const defB = CF_CREATURES.find(cr => cr.id === creatureB.defId)
      if (!defA || !defB) return prev

      const combinedPower = Math.floor((defA.power + defB.power) * CF_COMBINE_POWER_MULTIPLIER)
      const combinedDefense = Math.floor((defA.defense + defB.defense) * CF_COMBINE_POWER_MULTIPLIER)
      const higherLevel = Math.max(creatureA.level, creatureB.level) + 1

      // Keep creatureA, remove creatureB
      const newCreatures = prev.creatures
        .filter(c => c.instanceId !== creatureInstanceIdB)
        .map(c =>
          c.instanceId === creatureInstanceIdA
            ? { ...c, level: Math.min(higherLevel, CF_MAX_CREATURE_LEVEL) }
            : c
        )

      const xpReward = Math.floor(CF_BASE_XP_PER_ACTION * 2)
      const newState = {
        ...prev,
        creatures: newCreatures,
        coins: prev.coins - cost,
        totalCoinsSpent: prev.totalCoinsSpent + cost,
        totalCombined: prev.totalCombined + 1,
        totalActionsPerformed: prev.totalActionsPerformed + 1,
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
      }
      const withAchievements = checkAchievements(newState)
      withAchievements.activeTitle = computeBestTitle(withAchievements.totalXp)
      return withAchievements
    })
    logEvent('combine', `Combined two creatures into a more powerful form.`, { creatureA: creatureInstanceIdA, creatureB: creatureInstanceIdB })
  }, [logEvent, checkAchievements, computeBestTitle])

  // ── Action: Awaken ─────────────────────────────────────────────────────────

  const doAwaken = useCallback((creatureInstanceId: string) => {
    setState(prev => {
      const creature = prev.creatures.find(c => c.instanceId === creatureInstanceId)
      if (!creature) return prev
      if (creature.awakened) return prev
      if (creature.level < CF_AWAKEN_THRESHOLD) return prev

      const cost = 500
      if (prev.coins < cost) return prev

      const newCreatures = prev.creatures.map(c =>
        c.instanceId === creatureInstanceId ? { ...c, awakened: true, level: Math.max(c.level, CF_AWAKEN_THRESHOLD + 5) } : c
      )

      const xpReward = Math.floor(CF_BASE_XP_PER_ACTION * 5)
      const newState = {
        ...prev,
        creatures: newCreatures,
        coins: prev.coins - cost,
        totalCoinsSpent: prev.totalCoinsSpent + cost,
        totalAwakened: prev.totalAwakened + 1,
        totalActionsPerformed: prev.totalActionsPerformed + 1,
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
      }
      const withAchievements = checkAchievements(newState)
      withAchievements.activeTitle = computeBestTitle(withAchievements.totalXp)
      return withAchievements
    })
    logEvent('awaken', `Awakened creature ${creatureInstanceId} to its true form!`)
  }, [logEvent, checkAchievements, computeBestTitle])

  // ── Recruit Creature ───────────────────────────────────────────────────────

  const recruitCreature = useCallback((creatureDefId: string) => {
    setState(prev => {
      const def = CF_CREATURES.find(c => c.id === creatureDefId)
      if (!def) return prev
      if (prev.coins < def.cost) return prev

      const instance: CfOwnedCreature = {
        instanceId: cfGenerateId('cre'),
        defId: creatureDefId,
        level: 1,
        xp: 0,
        awakened: false,
        acquiredAt: Date.now(),
      }

      const newState = {
        ...prev,
        creatures: [...prev.creatures, instance],
        coins: prev.coins - def.cost,
        totalCoinsSpent: prev.totalCoinsSpent + def.cost,
      }
      const withAchievements = checkAchievements(newState)
      return withAchievements
    })
    logEvent('forge', `Recruited a new creature: ${creatureDefId}.`, { creatureDefId })
  }, [logEvent, checkAchievements])

  // ── Upgrade Structure ──────────────────────────────────────────────────────

  const upgradeStructure = useCallback((structureDefId: string) => {
    setState(prev => {
      const structureDef = CF_STRUCTURES.find(s => s.id === structureDefId)
      if (!structureDef) return prev
      const current = prev.structures.find(s => s.defId === structureDefId)
      if (!current) return prev
      if (current.level >= structureDef.maxLevel) return prev

      const cost = cfStructureUpgradeCost(structureDef.baseCost, current.level, structureDef.costScaling)
      if (prev.coins < cost) return prev

      const newStructures = prev.structures.map(s =>
        s.defId === structureDefId ? { ...s, level: s.level + 1 } : s
      )

      const xpReward = Math.floor(CF_BASE_XP_PER_ACTION * 2 * (current.level + 1))
      const newState = {
        ...prev,
        structures: newStructures,
        coins: prev.coins - cost,
        totalCoinsSpent: prev.totalCoinsSpent + cost,
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
      }
      const withAchievements = checkAchievements(newState)
      withAchievements.activeTitle = computeBestTitle(withAchievements.totalXp)
      return withAchievements
    })
    logEvent('forge', `Upgraded structure ${structureDefId}.`)
  }, [logEvent, checkAchievements, computeBestTitle])

  // ── Unlock Chamber ─────────────────────────────────────────────────────────

  const unlockChamber = useCallback((chamberDefId: string) => {
    setState(prev => {
      const chamberDef = CF_CHAMBERS.find(ch => ch.id === chamberDefId)
      if (!chamberDef) return prev
      if (prev.level < chamberDef.unlockLevel) return prev

      const existing = prev.chambers.find(c => c.defId === chamberDefId)
      if (existing?.unlocked) return prev

      const newChambers = prev.chambers.map(c =>
        c.defId === chamberDefId ? { ...c, unlocked: true, lastExploredAt: Date.now() } : c
      )

      const newState = { ...prev, chambers: newChambers }
      const withAchievements = checkAchievements(newState)
      withAchievements.activeTitle = computeBestTitle(withAchievements.totalXp)
      return withAchievements
    })
    logEvent('dive', `Unlocked chamber ${chamberDefId}.`)
  }, [logEvent, checkAchievements, computeBestTitle])

  // ── Use Ability ────────────────────────────────────────────────────────────

  const useAbility = useCallback((abilityDefId: string) => {
    setState(prev => {
      const abilityDef = CF_ABILITIES.find(a => a.id === abilityDefId)
      if (!abilityDef) return prev
      if (prev.level < abilityDef.unlockLevel) return prev

      const abilityState = prev.abilities.find(a => a.defId === abilityDefId)
      if (!abilityState) return prev

      const now = Date.now()
      const elapsed = (now - abilityState.lastUsed) / 1000
      if (abilityState.lastUsed > 0 && elapsed < abilityDef.cooldown) return prev

      if (prev.coins < abilityDef.cost) return prev

      const newAbilities = prev.abilities.map(a =>
        a.defId === abilityDefId
          ? { ...a, unlocked: true, lastUsed: now, timesUsed: a.timesUsed + 1 }
          : a
      )

      const xpReward = Math.floor(abilityDef.power * 0.5)
      const newState = {
        ...prev,
        abilities: newAbilities,
        coins: prev.coins - abilityDef.cost,
        totalCoinsSpent: prev.totalCoinsSpent + abilityDef.cost,
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
      }
      return newState
    })
    logEvent('enchant', `Used ability ${abilityDefId}.`)
  }, [logEvent])

  // ── Activate Artifact ──────────────────────────────────────────────────────

  const activateArtifact = useCallback((artifactDefId: string) => {
    setState(prev => {
      const artifactDef = CF_ARTIFACTS.find(a => a.id === artifactDefId)
      if (!artifactDef) return prev
      if (prev.level < artifactDef.unlockLevel) return prev

      const artifactState = prev.artifacts.find(a => a.defId === artifactDefId)
      if (!artifactState || artifactState.activated || artifactState.charges <= 0) return prev

      const newArtifacts = prev.artifacts.map(a =>
        a.defId === artifactDefId
          ? { ...a, activated: true, activatedAt: Date.now(), charges: a.charges - 1 }
          : a
      )

      const xpReward = Math.floor(artifactDef.power)
      const newState = {
        ...prev,
        artifacts: newArtifacts,
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
      }
      const withAchievements = checkAchievements(newState)
      withAchievements.activeTitle = computeBestTitle(withAchievements.totalXp)
      return withAchievements
    })
    logEvent('awaken', `Activated artifact ${artifactDefId}.`)
  }, [logEvent, checkAchievements, computeBestTitle])

  // ── Trigger Event ──────────────────────────────────────────────────────────

  const triggerEvent = useCallback((eventDefId: string) => {
    setState(prev => {
      const eventDef = CF_EVENTS.find(e => e.id === eventDefId)
      if (!eventDef) return prev

      return {
        ...prev,
        currentEvent: eventDefId,
        eventExpiresAt: Date.now() + eventDef.duration * 1000,
      }
    })
    logEvent('enchant', `Event triggered: ${eventDefId}.`)
  }, [logEvent])

  const clearEvent = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentEvent: null,
      eventExpiresAt: null,
    }))
  }, [])

  // ── Set Active Chamber ─────────────────────────────────────────────────────

  const setActiveChamber = useCallback((chamberId: string) => {
    setState(prev => ({
      ...prev,
      activeChamber: chamberId,
    }))
  }, [])

  // ── Set Active Title ───────────────────────────────────────────────────────

  const setActiveTitle = useCallback((titleId: string) => {
    setState(prev => ({
      ...prev,
      activeTitle: titleId,
    }))
  }, [])

  // ── Reset ──────────────────────────────────────────────────────────────────

  const resetState = useCallback(() => {
    const fresh = cfCreateDefaultState()
    setState(fresh)
    cfSaveState(fresh)
  }, [])

  // ── Computed Values ────────────────────────────────────────────────────────

  const xpToNextLevel = useMemo(() => {
    return cfXpRequiredForLevel(state.level)
  }, [state.level])

  const xpProgress = useMemo(() => {
    if (state.level >= CF_MAX_LEVEL) return 1
    const needed = xpToNextLevel
    if (needed <= 0 || needed === Infinity) return 1
    return Math.min(1, state.xp / needed)
  }, [state.xp, state.level, xpToNextLevel])

  const activeEventDef = useMemo(() => {
    if (!state.currentEvent) return null
    return CF_EVENTS.find(e => e.id === state.currentEvent) ?? null
  }, [state.currentEvent])

  const activeTitleDef = useMemo(() => {
    return CF_TITLES.find(t => t.id === state.activeTitle) ?? CF_TITLES[0]
  }, [state.activeTitle])

  const activeChamberDef = useMemo(() => {
    return CF_CHAMBERS.find(ch => ch.id === state.activeChamber) ?? CF_CHAMBERS[0]
  }, [state.activeChamber])

  const unlockedChambers = useMemo(() => {
    return CF_CHAMBERS.filter(ch =>
      state.chambers.find(c => c.defId === ch.id && c.unlocked)
    )
  }, [state.chambers])

  const availableAbilities = useMemo(() => {
    return CF_ABILITIES.filter(a =>
      state.level >= a.unlockLevel
    )
  }, [state.level])

  const abilityCooldowns = useMemo(() => {
    const now = Date.now()
    const result: Record<string, number> = {}
    for (const aState of state.abilities) {
      const def = CF_ABILITIES.find(a => a.id === aState.defId)
      if (!def) continue
      const elapsed = (now - aState.lastUsed) / 1000
      const remaining = Math.max(0, def.cooldown - elapsed)
      result[aState.defId] = remaining
    }
    return result
  }, [state.abilities])

  const availableArtifacts = useMemo(() => {
    return CF_ARTIFACTS.filter(a =>
      state.level >= a.unlockLevel &&
      !state.artifacts.find(ar => ar.defId === a.id && ar.activated)
    )
  }, [state.level, state.artifacts])

  const totalPower = useMemo(() => {
    let power = 0
    for (const creature of state.creatures) {
      const def = CF_CREATURES.find(c => c.id === creature.defId)
      if (!def) continue
      const levelMult = 1 + creature.level * 0.05
      const awakenMult = creature.awakened ? 2 : 1
      power += Math.floor((def.power + def.defense) * levelMult * awakenMult)
    }
    return power
  }, [state.creatures])

  const materialSummary = useMemo(() => {
    return state.materials.map(ms => {
      const def = CF_MATERIALS.find(m => m.id === ms.defId)
      return { ...ms, def: def ?? null }
    }).filter(ms => ms.count > 0)
  }, [state.materials])

  const recruitAffordableCreatures = useMemo(() => {
    return CF_CREATURES.filter(c => c.cost <= state.coins)
  }, [state.coins])

  const upgradeableStructures = useMemo(() => {
    return CF_STRUCTURES.filter(s => {
      const current = state.structures.find(st => st.defId === s.id)
      if (!current || current.level >= s.maxLevel) return false
      const cost = cfStructureUpgradeCost(s.baseCost, current.level, s.costScaling)
      return cost <= state.coins
    })
  }, [state.coins, state.structures])

  const unlockedStructureDefs = useMemo(() => {
    return state.structures
      .filter(s => s.level > 0)
      .map(s => {
        const def = CF_STRUCTURES.find(sd => sd.id === s.defId)
        return { state: s, def }
      })
      .filter(item => item.def !== null)
  }, [state.structures])

  const achievementsSummary = useMemo(() => {
    return state.achievements.map(ach => {
      const def = CF_ACHIEVEMENTS.find(a => a.id === ach.defId)
      return { ...ach, def: def ?? null }
    })
  }, [state.achievements])

  const creatureDetails = useMemo(() => {
    return state.creatures.map(c => {
      const def = CF_CREATURES.find(cr => cr.id === c.defId)
      const species = def ? CF_SPECIES.find(sp => sp.key === def.species) : null
      return { ...c, def, species }
    })
  }, [state.creatures])

  const recentEvents = useMemo(() => {
    return state.eventLog.slice(0, 20)
  }, [state.eventLog])

  const stats = useMemo(() => ({
    totalPower,
    forgeLevel: state.level,
    totalXp: state.totalXp,
    totalCoinsEarned: state.totalCoinsEarned,
    totalCoinsSpent: state.totalCoinsSpent,
    creatureCount: state.creatures.length,
    structureCount: state.structures.filter(s => s.level > 0).length,
    chamberCount: state.chambers.filter(c => c.unlocked).length,
    achievementCount: state.achievements.filter(a => a.unlocked).length,
    artifactCount: state.artifacts.filter(a => a.activated).length,
    totalForged: state.totalForged,
    totalEnchanted: state.totalEnchanted,
    totalDives: state.totalDives,
    totalHarvested: state.totalHarvested,
    totalTempered: state.totalTempered,
    totalCombined: state.totalCombined,
    totalAwakened: state.totalAwakened,
    streak: state.streak,
    bestStreak: state.bestStreak,
  }), [
    totalPower, state.level, state.totalXp, state.totalCoinsEarned, state.totalCoinsSpent,
    state.creatures.length, state.structures, state.chambers, state.achievements,
    state.artifacts, state.totalForged, state.totalEnchanted, state.totalDives,
    state.totalHarvested, state.totalTempered, state.totalCombined, state.totalAwakened,
    state.streak, state.bestStreak,
  ])

  return {
    // State
    state,
    stateRef,
    // Actions
    doForge,
    doEnchant,
    doDive,
    doHarvest,
    doTemper,
    doCombine,
    doAwaken,
    recruitCreature,
    upgradeStructure,
    unlockChamber,
    useAbility,
    activateArtifact,
    triggerEvent,
    clearEvent,
    setActiveChamber,
    setActiveTitle,
    resetState,
    checkDailyReset,
    // Computed
    xpToNextLevel,
    xpProgress,
    activeEventDef,
    activeTitleDef,
    activeChamberDef,
    unlockedChambers,
    availableAbilities,
    abilityCooldowns,
    availableArtifacts,
    totalPower,
    materialSummary,
    recruitAffordableCreatures,
    upgradeableStructures,
    unlockedStructureDefs,
    achievementsSummary,
    creatureDetails,
    recentEvents,
    stats,
    // Helpers (exposed for UI)
    cfRarityLabel,
    cfRarityColor,
    cfRarityMultiplier,
    cfSpeciesLabel,
    cfSpeciesEmoji,
    cfGetRarityDef,
    cfFormatCooldown,
    cfXpRequiredForLevel,
    cfStructureUpgradeCost,
  }
}
