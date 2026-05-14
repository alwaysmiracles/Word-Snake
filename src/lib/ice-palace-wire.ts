'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

// =============================================================================
// Ice Palace Wire — Frozen Kingdom Collection & Management Wire
// All constants use IP_ prefix. All hook functions use ip prefix.
// Cyan / blue / white color theme.
// =============================================================================

// === TYPE DEFINITIONS ===

export type IpRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type IpCreatureType = 'sprite' | 'golem' | 'dragon' | 'fox' | 'wolf' | 'bear' | 'owl' | 'serpent' | 'phoenix' | 'elemental'
export type IpSpellSchool = 'frost' | 'blizzard' | 'glacier' | 'aurora' | 'crystal' | 'permafrost'
export type IpRoomId = 'frozen_throne' | 'crystal_garden' | 'frost_library' | 'ice_armory' | 'snow_balcony' | 'glacier_vault' | 'aurora_chamber' | 'permafrost_catacombs'
export type IpArtifactSlot = 'crown' | 'amulet' | 'ring' | 'staff' | 'shield'
export type IpBlizzardSeverity = 'light' | 'moderate' | 'heavy' | 'catastrophic'

// === RARITY CONSTANTS ===

export const IP_RARITY_COMMON: IpRarity = 'common'
export const IP_RARITY_UNCOMMON: IpRarity = 'uncommon'
export const IP_RARITY_RARE: IpRarity = 'rare'
export const IP_RARITY_EPIC: IpRarity = 'epic'
export const IP_RARITY_LEGENDARY: IpRarity = 'legendary'

export const IP_RARITY_COLORS: Record<IpRarity, string> = {
  [IP_RARITY_COMMON]: '#8ecae6',
  [IP_RARITY_UNCOMMON]: '#00b4d8',
  [IP_RARITY_RARE]: '#0077b6',
  [IP_RARITY_EPIC]: '#48cae4',
  [IP_RARITY_LEGENDARY]: '#caf0f8',
}

export const IP_RARITY_XP_MULTIPLIER: Record<IpRarity, number> = {
  [IP_RARITY_COMMON]: 1,
  [IP_RARITY_UNCOMMON]: 1.5,
  [IP_RARITY_RARE]: 2.5,
  [IP_RARITY_EPIC]: 4,
  [IP_RARITY_LEGENDARY]: 7,
}

export const IP_RARITY_DROP_WEIGHTS: Record<IpRarity, number> = {
  [IP_RARITY_COMMON]: 45,
  [IP_RARITY_UNCOMMON]: 28,
  [IP_RARITY_RARE]: 15,
  [IP_RARITY_EPIC]: 5,
  [IP_RARITY_LEGENDARY]: 1,
}

export const IP_RARITY_ICONS: Record<IpRarity, string> = {
  [IP_RARITY_COMMON]: '🧊',
  [IP_RARITY_UNCOMMON]: '❄️',
  [IP_RARITY_RARE]: '🌨️',
  [IP_RARITY_EPIC]: '💎',
  [IP_RARITY_LEGENDARY]: '👑',
}

// === COLOR THEME ===

export const IP_COLOR_CYAN = '#00e5ff'
export const IP_COLOR_ICE_BLUE = '#89c2d9'
export const IP_COLOR_DEEP_BLUE = '#023e8a'
export const IP_COLOR_FROST_WHITE = '#e0fbfc'
export const IP_COLOR_PALE_BLUE = '#caf0f8'
export const IP_COLOR_GLACIER = '#a2d2ff'
export const IP_COLOR_SNOW = '#bde0fe'
export const IP_COLOR_SAPPHIRE = '#219ebc'
export const IP_COLOR_ARCTIC = '#03045e'

// === INTERFACES ===

export interface IpCreatureDef {
  id: string
  name: string
  type: IpCreatureType
  rarity: IpRarity
  hp: number
  attack: number
  defense: number
  speed: number
  magic: number
  description: string
  lore: string
  color: string
}

export interface IpCreatureEntity {
  creatureId: string
  nickname: string
  level: number
  xp: number
  hp: number
  maxHp: number
  frozen: boolean
  frozenAt: number | null
}

export interface IpSpellDef {
  id: string
  name: string
  school: IpSpellSchool
  rarity: IpRarity
  power: number
  manaCost: number
  cooldown: number
  unlockLevel: number
  description: string
  color: string
}

export interface IpSpellEntity {
  spellId: string
  learned: boolean
  mastery: number
  castCount: number
}

export interface IpRoomDef {
  id: IpRoomId
  name: string
  description: string
  unlockLevel: number
  ambientColor: string
  dangerLevel: number
  rewards: string[]
}

export interface IpRoomEntity {
  roomId: IpRoomId
  explored: boolean
  explorationCount: number
  lastExplored: number | null
  secretsFound: number
}

export interface IpArtifactDef {
  id: string
  name: string
  slot: IpArtifactSlot
  rarity: IpRarity
  frostBonus: number
  magicBonus: number
  defenseBonus: number
  description: string
  lore: string
  color: string
}

export interface IpArtifactEntity {
  artifactId: string
  owned: boolean
  equipped: boolean
  acquiredAt: number | null
  powerLevel: number
}

export interface IpAchievementDef {
  id: string
  name: string
  description: string
  condition: string
  rewardXp: number
  hidden: boolean
  icon: string
}

export interface IpAchievementEntity {
  achievementId: string
  unlocked: boolean
  unlockedAt: number | null
}

export interface IpTitleDef {
  level: number
  title: string
  description: string
}

export interface IpBlizzardEvent {
  id: string
  severity: IpBlizzardSeverity
  startedAt: number
  duration: number
  survived: boolean
  damage: number
}

export interface IpDailyReward {
  xpBonus: number
  creatureBonus: boolean
  spellBonus: boolean
  artifactChance: number
  claimed: boolean
}

export interface IcePalaceState {
  level: number
  xp: number
  totalXp: number
  creatures: IpCreatureEntity[]
  spells: IpSpellEntity[]
  rooms: IpRoomEntity[]
  artifacts: IpArtifactEntity[]
  achievements: IpAchievementEntity[]
  title: string
  dailyCast: number
  dailyDate: string
  totalFrozen: number
  totalMelted: number
  blizzardsSurvived: number
  blizzardsEncountered: number
  totalRoomsExplored: number
  totalSpellsCast: number
  totalArtifactsFound: number
  totalAchievements: number
  currentBlizzard: IpBlizzardEvent | null
  dailyReward: IpDailyReward
  streak: number
  bestStreak: number
  seed: number
  tick: number
}

// === FROZEN CREATURES (32) ===

export const IP_FROZEN_CREATURES: IpCreatureDef[] = [
  {
    id: 'frost_sprite', name: 'Frost Sprite', type: 'sprite', rarity: IP_RARITY_COMMON,
    hp: 40, attack: 8, defense: 5, speed: 15, magic: 12,
    description: 'A tiny mischievous spirit that leaves trails of frost on everything it touches.',
    lore: 'Frost sprites are born from the breath of sleeping glaciers. They dance on frozen lakes at midnight.',
    color: '#caf0f8',
  },
  {
    id: 'ice_golem', name: 'Ice Golem', type: 'golem', rarity: IP_RARITY_COMMON,
    hp: 120, attack: 18, defense: 25, speed: 3, magic: 8,
    description: 'A massive humanoid construct of packed ice and ancient frozen magic.',
    lore: 'Ice golems were first carved by the Frost Empress to guard the palace gates during the Eternal Winter.',
    color: '#a2d2ff',
  },
  {
    id: 'snow_dragon', name: 'Snow Dragon', type: 'dragon', rarity: IP_RARITY_RARE,
    hp: 180, attack: 35, defense: 22, speed: 20, magic: 30,
    description: 'A majestic dragon with scales that shimmer like fresh snowfall in sunlight.',
    lore: 'Snow Dragons nest at the peaks of the highest mountains, only descending during the deepest winters.',
    color: '#e0fbfc',
  },
  {
    id: 'crystal_fox', name: 'Crystal Fox', type: 'fox', rarity: IP_RARITY_UNCOMMON,
    hp: 55, attack: 14, defense: 10, speed: 28, magic: 18,
    description: 'A swift fox whose fur refracts light into dazzling crystal patterns.',
    lore: 'Crystal foxes are the messengers of the ice palace, delivering frozen scrolls between rooms.',
    color: '#48cae4',
  },
  {
    id: 'glacier_wolf', name: 'Glacier Wolf', type: 'wolf', rarity: IP_RARITY_UNCOMMON,
    hp: 80, attack: 22, defense: 15, speed: 25, magic: 10,
    description: 'A fierce wolf with a pelt of hardened glacier ice and eyes of deep blue.',
    lore: 'Glacier wolves run in packs across the frozen tundra, their howls creating echoing ice harmonics.',
    color: '#89c2d9',
  },
  {
    id: 'frost_bear', name: 'Frost Bear', type: 'bear', rarity: IP_RARITY_COMMON,
    hp: 150, attack: 25, defense: 28, speed: 5, magic: 5,
    description: 'An enormous bear with fur as white as fresh snow and claws of solid ice.',
    lore: 'Frost bears hibernate for centuries. When they wake, the surrounding landscape is permanently changed.',
    color: '#caf0f8',
  },
  {
    id: 'arctic_owl', name: 'Arctic Owl', type: 'owl', rarity: IP_RARITY_COMMON,
    hp: 45, attack: 10, defense: 8, speed: 20, magic: 15,
    description: 'A silent nocturnal hunter with feathers that glow in moonlight.',
    lore: 'Arctic owls can see through the thickest blizzards and never lose their way home.',
    color: '#bde0fe',
  },
  {
    id: 'ice_serpent', name: 'Ice Serpent', type: 'serpent', rarity: IP_RARITY_UNCOMMON,
    hp: 70, attack: 20, defense: 12, speed: 22, magic: 22,
    description: 'A coiling serpent made of frozen mist that strikes with venomous frost.',
    lore: 'Ice serpents dwell in the frozen rivers beneath the palace, guarding submerged treasures.',
    color: '#00b4d8',
  },
  {
    id: 'winter_phoenix', name: 'Winter Phoenix', type: 'phoenix', rarity: IP_RARITY_EPIC,
    hp: 130, attack: 30, defense: 20, speed: 30, magic: 35,
    description: 'A phoenix reborn not from fire but from the heart of eternal winter.',
    lore: 'The Winter Phoenix dies when spring comes and is reborn at the first frost of autumn.',
    color: '#48cae4',
  },
  {
    id: 'frost_elemental', name: 'Frost Elemental', type: 'elemental', rarity: IP_RARITY_RARE,
    hp: 100, attack: 25, defense: 18, speed: 15, magic: 32,
    description: 'A living manifestation of pure cold energy, constantly shifting form.',
    lore: 'Frost elementals are the architects of the ice palace, reshaping walls with a thought.',
    color: '#00e5ff',
  },
  {
    id: 'snowflake_sprite', name: 'Snowflake Sprite', type: 'sprite', rarity: IP_RARITY_UNCOMMON,
    hp: 35, attack: 6, defense: 4, speed: 30, magic: 20,
    description: 'An impossibly delicate sprite shaped like a perfect six-pointed snowflake.',
    lore: 'No two snowflake sprites are alike. Each carries a unique winter enchantment.',
    color: '#e0fbfc',
  },
  {
    id: 'permafrost_golem', name: 'Permafrost Golem', type: 'golem', rarity: IP_RARITY_RARE,
    hp: 200, attack: 22, defense: 40, speed: 2, magic: 15,
    description: 'An ancient golem made from permanently frozen earth older than civilization.',
    lore: 'Permafrost golems contain fossils of creatures that lived before the first ice age.',
    color: '#023e8a',
  },
  {
    id: 'blizzard_wyrm', name: 'Blizzard Wyrm', type: 'dragon', rarity: IP_RARITY_EPIC,
    hp: 220, attack: 42, defense: 30, speed: 18, magic: 38,
    description: 'A serpentine dragon that lives inside raging blizzards, invisible to the naked eye.',
    lore: 'When a blizzard wyrm dies, the storm it inhabits continues for seven days and seven nights.',
    color: '#03045e',
  },
  {
    id: 'arctic_fox_spirit', name: 'Arctic Fox Spirit', type: 'fox', rarity: IP_RARITY_EPIC,
    hp: 90, attack: 18, defense: 15, speed: 35, magic: 28,
    description: 'The ghostly spirit of an arctic fox that has transcended mortal form.',
    lore: 'Fox spirits can phase between dimensions, appearing in reflections of frozen lakes.',
    color: '#caf0f8',
  },
  {
    id: 'tundra_wolf_alpha', name: 'Tundra Wolf Alpha', type: 'wolf', rarity: IP_RARITY_RARE,
    hp: 110, attack: 30, defense: 20, speed: 28, magic: 15,
    description: 'The pack leader of glacier wolves, marked by silver-tipped fur and icy fangs.',
    lore: 'Tundra Wolf Alphas can summon the entire pack with a single subsonic howl.',
    color: '#219ebc',
  },
  {
    id: 'ice_crown_bear', name: 'Ice Crown Bear', type: 'bear', rarity: IP_RARITY_EPIC,
    hp: 250, attack: 35, defense: 45, speed: 8, magic: 20,
    description: 'A legendary frost bear with a crown of ice crystals growing from its skull.',
    lore: 'Only five Ice Crown Bears have ever been sighted. Each commands an entire frozen mountain.',
    color: '#48cae4',
  },
  {
    id: 'frozen_owl_sage', name: 'Frozen Owl Sage', type: 'owl', rarity: IP_RARITY_RARE,
    hp: 70, attack: 15, defense: 18, speed: 22, magic: 35,
    description: 'An ancient owl whose eyes hold the accumulated wisdom of a thousand winters.',
    lore: 'The Frozen Owl Sage can see into the past by reading the patterns in ice crystals.',
    color: '#a2d2ff',
  },
  {
    id: 'frost_viper', name: 'Frost Viper', type: 'serpent', rarity: IP_RARITY_COMMON,
    hp: 50, attack: 16, defense: 8, speed: 26, magic: 12,
    description: 'A venomous snake whose bite instantly crystallizes the blood of its prey.',
    lore: 'Frost viper venom is used in the most powerful ice spells, making them highly sought after.',
    color: '#89c2d9',
  },
  {
    id: 'ice_moth', name: 'Ice Moth', type: 'sprite', rarity: IP_RARITY_COMMON,
    hp: 25, attack: 4, defense: 3, speed: 20, magic: 8,
    description: 'A delicate moth with wings made of thin ice that refracts moonlight beautifully.',
    lore: 'Ice moths swarm around the Crystal Garden at night, creating a mesmerizing light show.',
    color: '#caf0f8',
  },
  {
    id: 'glacial_turtle', name: 'Glacial Turtle', type: 'golem', rarity: IP_RARITY_UNCOMMON,
    hp: 160, attack: 10, defense: 35, speed: 4, magic: 12,
    description: 'A slow-moving turtle with a shell made from thousand-year-old glacial ice.',
    lore: 'Glacial turtles carry miniature frozen ecosystems on their shells.',
    color: '#bde0fe',
  },
  {
    id: 'rime_stag', name: 'Rime Stag', type: 'elemental', rarity: IP_RARITY_RARE,
    hp: 120, attack: 24, defense: 22, speed: 20, magic: 25,
    description: 'A magnificent stag with antlers made of razor-sharp rime ice crystals.',
    lore: 'Rime Stags appear only at the boundary between autumn and winter, heralding the first frost.',
    color: '#e0fbfc',
  },
  {
    id: 'ice_sculpture_hound', name: 'Ice Sculpture Hound', type: 'wolf', rarity: IP_RARITY_COMMON,
    hp: 65, attack: 16, defense: 14, speed: 22, magic: 8,
    description: 'A hound carved from ice by palace magic, given life through ancient frost incantations.',
    lore: 'Ice sculpture hounds are the loyal guardians of the palace corridors, never sleeping.',
    color: '#a2d2ff',
  },
  {
    id: 'aurora_wyrm', name: 'Aurora Wyrm', type: 'dragon', rarity: IP_RARITY_LEGENDARY,
    hp: 300, attack: 50, defense: 35, speed: 25, magic: 45,
    description: 'A magnificent dragon that channels the northern lights through its translucent body.',
    lore: 'The Aurora Wyrm appears only when all seven colors of the aurora align. Its cry shatters mountains.',
    color: '#48cae4',
  },
  {
    id: 'frost_matriarch', name: 'Frost Matriarch', type: 'sprite', rarity: IP_RARITY_EPIC,
    hp: 110, attack: 28, defense: 20, speed: 18, magic: 40,
    description: 'The queen of all frost sprites, commanding an army of ice and wind.',
    lore: 'The Frost Matriarch once froze an entire invading army mid-charge, preserving them as ice statues.',
    color: '#00e5ff',
  },
  {
    id: 'avalanche_golem', name: 'Avalanche Golem', type: 'golem', rarity: IP_RARITY_EPIC,
    hp: 280, attack: 30, defense: 50, speed: 5, magic: 25,
    description: 'A colossal golem that embodies the destructive power of an avalanche.',
    lore: 'When an Avalanche Golem awakens, entire mountainsides crumble in its wake.',
    color: '#023e8a',
  },
  {
    id: 'polaris_eagle', name: 'Polaris Eagle', type: 'owl', rarity: IP_RARITY_LEGENDARY,
    hp: 140, attack: 38, defense: 22, speed: 40, magic: 30,
    description: 'An enormous eagle that nests on the North Star itself, feathers shining like frozen starlight.',
    lore: 'The Polaris Eagle is said to be the guardian of the celestial north. Its shadow blocks out the aurora.',
    color: '#caf0f8',
  },
  {
    id: 'cryo_hydra', name: 'Cryo Hydra', type: 'serpent', rarity: IP_RARITY_LEGENDARY,
    hp: 350, attack: 45, defense: 38, speed: 15, magic: 42,
    description: 'A multi-headed serpent of pure ice. Each severed head regrows stronger and colder.',
    lore: 'The Cryo Hydra sleeps beneath the palace foundations. Its dreams are the source of every blizzard.',
    color: '#03045e',
  },
  {
    id: 'ice_mirror_fox', name: 'Ice Mirror Fox', type: 'fox', rarity: IP_RARITY_LEGENDARY,
    hp: 100, attack: 20, defense: 18, speed: 45, magic: 42,
    description: 'A fox that can create perfect copies of itself from reflections in ice.',
    lore: 'The Ice Mirror Fox is the trickster of the frozen realm. None know which fox is the original.',
    color: '#48cae4',
  },
  {
    id: 'frostfire_phoenix', name: 'Frostfire Phoenix', type: 'phoenix', rarity: IP_RARITY_LEGENDARY,
    hp: 200, attack: 40, defense: 28, speed: 35, magic: 48,
    description: 'A paradoxical phoenix of both fire and ice, its flames freeze and its ice burns.',
    lore: 'The Frostfire Phoenix was born when a comet of blue fire struck the heart of an ancient glacier.',
    color: '#00e5ff',
  },
  {
    id: 'eternal_frost_spirit', name: 'Eternal Frost Spirit', type: 'elemental', rarity: IP_RARITY_LEGENDARY,
    hp: 180, attack: 35, defense: 30, speed: 20, magic: 50,
    description: 'The primordial spirit of winter itself, older than the concept of seasons.',
    lore: 'Before the world had seasons, the Eternal Frost Spirit ruled all of existence in perpetual ice.',
    color: '#caf0f8',
  },
  {
    id: 'ice_crypt_wraith', name: 'Ice Crypt Wraith', type: 'elemental', rarity: IP_RARITY_EPIC,
    hp: 130, attack: 32, defense: 15, speed: 30, magic: 38,
    description: 'A spectral being formed from the frozen memories of the ancient palace builders.',
    lore: 'The Wraiths whisper secrets of the ice palace in a language that sounds like cracking ice.',
    color: '#023e8a',
  },
]

// === ICE SPELLS (28) ===

export const IP_ICE_SPELLS: IpSpellDef[] = [
  {
    id: 'frost_touch', name: 'Frost Touch', school: 'frost', rarity: IP_RARITY_COMMON,
    power: 12, manaCost: 5, cooldown: 1, unlockLevel: 1,
    description: 'A basic spell that freezes the surface of anything touched.',
    color: '#caf0f8',
  },
  {
    id: 'ice_shard_barrage', name: 'Ice Shard Barrage', school: 'frost', rarity: IP_RARITY_COMMON,
    power: 18, manaCost: 8, cooldown: 2, unlockLevel: 1,
    description: 'Launches a volley of razor-sharp ice shards at the target.',
    color: '#a2d2ff',
  },
  {
    id: 'frozenarmor', name: 'Frozen Armor', school: 'glacier', rarity: IP_RARITY_COMMON,
    power: 0, manaCost: 10, cooldown: 3, unlockLevel: 2,
    description: 'Encases the caster in a protective layer of hardened ice.',
    color: '#89c2d9',
  },
  {
    id: 'cryo_dart', name: 'Cryo Dart', school: 'frost', rarity: IP_RARITY_UNCOMMON,
    power: 22, manaCost: 7, cooldown: 1, unlockLevel: 3,
    description: 'A focused bolt of intense cold that penetrates armor.',
    color: '#48cae4',
  },
  {
    id: 'blizzard_breath', name: 'Blizzard Breath', school: 'blizzard', rarity: IP_RARITY_UNCOMMON,
    power: 30, manaCost: 15, cooldown: 3, unlockLevel: 4,
    description: 'Exhales a concentrated blizzard that slows and damages all nearby enemies.',
    color: '#e0fbfc',
  },
  {
    id: 'glacier_wall', name: 'Glacier Wall', school: 'glacier', rarity: IP_RARITY_UNCOMMON,
    power: 5, manaCost: 18, cooldown: 4, unlockLevel: 5,
    description: 'Raises a massive wall of glacial ice that blocks attacks and passage.',
    color: '#023e8a',
  },
  {
    id: 'ice_lance', name: 'Ice Lance', school: 'frost', rarity: IP_RARITY_UNCOMMON,
    power: 35, manaCost: 14, cooldown: 2, unlockLevel: 6,
    description: 'Forms a massive ice spear and hurls it with devastating force.',
    color: '#bde0fe',
  },
  {
    id: 'permafrost_bind', name: 'Permafrost Bind', school: 'permafrost', rarity: IP_RARITY_RARE,
    power: 20, manaCost: 16, cooldown: 3, unlockLevel: 7,
    description: 'Roots the target in place with ancient permafrost that never melts.',
    color: '#219ebc',
  },
  {
    id: 'aurora_veil', name: 'Aurora Veil', school: 'aurora', rarity: IP_RARITY_RARE,
    power: 0, manaCost: 22, cooldown: 5, unlockLevel: 8,
    description: 'Wraps allies in a shimmering aurora that deflects spells and heals wounds.',
    color: '#48cae4',
  },
  {
    id: 'crystal_shatter', name: 'Crystal Shatter', school: 'crystal', rarity: IP_RARITY_RARE,
    power: 40, manaCost: 18, cooldown: 3, unlockLevel: 9,
    description: 'Creates crystals around the target and detonates them simultaneously.',
    color: '#00e5ff',
  },
  {
    id: 'frost_nova', name: 'Frost Nova', school: 'blizzard', rarity: IP_RARITY_RARE,
    power: 45, manaCost: 25, cooldown: 4, unlockLevel: 10,
    description: 'Releases a shockwave of absolute cold in all directions.',
    color: '#caf0f8',
  },
  {
    id: 'ice_mirror', name: 'Ice Mirror', school: 'crystal', rarity: IP_RARITY_UNCOMMON,
    power: 0, manaCost: 12, cooldown: 4, unlockLevel: 5,
    description: 'Creates a reflective ice mirror that bounces spells back at attackers.',
    color: '#a2d2ff',
  },
  {
    id: 'glacier_crawl', name: 'Glacier Crawl', school: 'glacier', rarity: IP_RARITY_UNCOMMON,
    power: 15, manaCost: 10, cooldown: 2, unlockLevel: 6,
    description: 'Summons slow-moving glacier hands from the ground to grab enemies.',
    color: '#89c2d9',
  },
  {
    id: 'cryostasis', name: 'Cryostasis', school: 'permafrost', rarity: IP_RARITY_EPIC,
    power: 0, manaCost: 35, cooldown: 8, unlockLevel: 12,
    description: 'Puts the target in complete suspended animation, frozen in time and ice.',
    color: '#023e8a',
  },
  {
    id: 'absolute_zero', name: 'Absolute Zero', school: 'permafrost', rarity: IP_RARITY_LEGENDARY,
    power: 80, manaCost: 50, cooldown: 10, unlockLevel: 20,
    description: 'Drops the temperature to absolute zero, shattering matter at the molecular level.',
    color: '#03045e',
  },
  {
    id: 'aurora_beam', name: 'Aurora Beam', school: 'aurora', rarity: IP_RARITY_EPIC,
    power: 55, manaCost: 30, cooldown: 5, unlockLevel: 14,
    description: 'Channels the northern lights into a devastating beam of prismatic frost energy.',
    color: '#48cae4',
  },
  {
    id: 'ice_prison', name: 'Ice Prison', school: 'glacier', rarity: IP_RARITY_RARE,
    power: 10, manaCost: 22, cooldown: 5, unlockLevel: 11,
    description: 'Encloses the target in an inescapable dome of thick ice.',
    color: '#e0fbfc',
  },
  {
    id: 'snowblind', name: 'Snowblind', school: 'blizzard', rarity: IP_RARITY_UNCOMMON,
    power: 8, manaCost: 12, cooldown: 3, unlockLevel: 4,
    description: 'Fills the area with swirling snow, blinding all enemies.',
    color: '#caf0f8',
  },
  {
    id: 'crystal_storm', name: 'Crystal Storm', school: 'crystal', rarity: IP_RARITY_EPIC,
    power: 60, manaCost: 32, cooldown: 6, unlockLevel: 15,
    description: 'Summons a hurricane of razor-sharp crystal shards from the palace vaults.',
    color: '#00e5ff',
  },
  {
    id: 'frost_chain', name: 'Frost Chain', school: 'frost', rarity: IP_RARITY_RARE,
    power: 28, manaCost: 14, cooldown: 3, unlockLevel: 8,
    description: 'Links multiple targets together with chains of unmelting frost.',
    color: '#bde0fe',
  },
  {
    id: 'winter_grasp', name: 'Winter Grasp', school: 'permafrost', rarity: IP_RARITY_EPIC,
    power: 50, manaCost: 28, cooldown: 5, unlockLevel: 16,
    description: 'The ground erupts with frozen hands that drag enemies into the permafrost.',
    color: '#023e8a',
  },
  {
    id: 'aurora_healing', name: 'Aurora Healing', school: 'aurora', rarity: IP_RARITY_RARE,
    power: -30, manaCost: 20, cooldown: 4, unlockLevel: 10,
    description: 'Wraps the target in aurora light that mends wounds and restores vitality.',
    color: '#48cae4',
  },
  {
    id: 'blizzard_surge', name: 'Blizzard Surge', school: 'blizzard', rarity: IP_RARITY_EPIC,
    power: 65, manaCost: 38, cooldown: 7, unlockLevel: 18,
    description: 'Unleashes the full fury of a class-five blizzard upon the battlefield.',
    color: '#e0fbfc',
  },
  {
    id: 'ice_sculpture', name: 'Ice Sculpture', school: 'crystal', rarity: IP_RARITY_UNCOMMON,
    power: 0, manaCost: 15, cooldown: 4, unlockLevel: 7,
    description: 'Creates an ice clone of the caster that distracts enemies and absorbs damage.',
    color: '#a2d2ff',
  },
  {
    id: 'glacier_charge', name: 'Glacier Charge', school: 'glacier', rarity: IP_RARITY_EPIC,
    power: 70, manaCost: 35, cooldown: 6, unlockLevel: 17,
    description: 'Surrounds the caster with a glacier and charges forward, crushing everything in the path.',
    color: '#89c2d9',
  },
  {
    id: 'frost_weave', name: 'Frost Weave', school: 'frost', rarity: IP_RARITY_RARE,
    power: 25, manaCost: 16, cooldown: 3, unlockLevel: 9,
    description: 'Weaves threads of frost into intricate patterns that slow and weaken enemies.',
    color: '#caf0f8',
  },
  {
    id: 'permafrost_avalanche', name: 'Permafrost Avalanche', school: 'permafrost', rarity: IP_RARITY_LEGENDARY,
    power: 90, manaCost: 55, cooldown: 12, unlockLevel: 25,
    description: 'Triggers a catastrophic avalanche of ancient frozen earth that buries everything.',
    color: '#03045e',
  },
  {
    id: 'aurora_crown', name: 'Aurora Crown', school: 'aurora', rarity: IP_RARITY_LEGENDARY,
    power: 0, manaCost: 45, cooldown: 10, unlockLevel: 22,
    description: 'Bestows a crown of aurora energy that grants immunity to all ice damage and enhances spells.',
    color: '#48cae4',
  },
]

// === PALACE ROOMS (8) ===

export const IP_PALACE_ROOMS: IpRoomDef[] = [
  {
    id: 'frozen_throne',
    name: 'Frozen Throne',
    description: 'The heart of the ice palace, where the throne of frozen starlight sits upon a dais of clear ice. Ancient frost magic emanates from every surface.',
    unlockLevel: 1,
    ambientColor: '#00e5ff',
    dangerLevel: 1,
    rewards: ['frost_sprite', 'frost_touch', 'ice_shard_barrage'],
  },
  {
    id: 'crystal_garden',
    name: 'Crystal Garden',
    description: 'A breathtaking garden where crystalline flowers bloom in perpetual frost. Each flower holds a frozen memory of a different winter.',
    unlockLevel: 3,
    ambientColor: '#48cae4',
    dangerLevel: 2,
    rewards: ['crystal_fox', 'ice_moth', 'frozenarmor', 'aurora_healing'],
  },
  {
    id: 'frost_library',
    name: 'Frost Library',
    description: 'An infinite library where books are carved from ice and contain the accumulated knowledge of every winter that ever was.',
    unlockLevel: 5,
    ambientColor: '#a2d2ff',
    dangerLevel: 2,
    rewards: ['arctic_owl', 'frozen_owl_sage', 'cryo_dart', 'ice_mirror'],
  },
  {
    id: 'ice_armory',
    name: 'Ice Armory',
    description: 'A vast armory filled with weapons and armor forged from enchanted ice. The metal within never rusts and the blades never dull.',
    unlockLevel: 8,
    ambientColor: '#89c2d9',
    dangerLevel: 3,
    rewards: ['ice_golem', 'ice_sculpture_hound', 'ice_lance', 'glacier_wall'],
  },
  {
    id: 'snow_balcony',
    name: 'Snow Balcony',
    description: 'An open-air balcony overlooking the frozen wasteland. From here, the entire palace glitters under the dancing aurora.',
    unlockLevel: 10,
    ambientColor: '#e0fbfc',
    dangerLevel: 3,
    rewards: ['glacier_wolf', 'snowflake_sprite', 'blizzard_breath', 'snowblind'],
  },
  {
    id: 'glacier_vault',
    name: 'Glacier Vault',
    description: 'A deep underground vault where the most powerful ice artifacts are sealed behind walls of ancient glacial ice.',
    unlockLevel: 15,
    ambientColor: '#023e8a',
    dangerLevel: 4,
    rewards: ['snow_dragon', 'frost_elemental', 'crystal_shatter', 'frost_nova'],
  },
  {
    id: 'aurora_chamber',
    name: 'Aurora Chamber',
    description: 'A cathedral-like chamber where the northern lights are captured and held in crystalline pillars that sing with frozen light.',
    unlockLevel: 20,
    ambientColor: '#48cae4',
    dangerLevel: 5,
    rewards: ['winter_phoenix', 'arctic_fox_spirit', 'aurora_veil', 'aurora_beam'],
  },
  {
    id: 'permafrost_catacombs',
    name: 'Permafrost Catacombs',
    description: 'The deepest and most dangerous section of the palace. Ancient frost wraiths and legendary creatures roam these frozen halls.',
    unlockLevel: 25,
    ambientColor: '#03045e',
    dangerLevel: 5,
    rewards: ['cryo_hydra', 'aurora_wyrm', 'absolute_zero', 'permafrost_avalanche'],
  },
]

// === ICE ARTIFACTS (22) ===

export const IP_ARTIFACTS: IpArtifactDef[] = [
  {
    id: 'frost_ring', name: 'Ring of Frost', slot: 'ring', rarity: IP_RARITY_COMMON,
    frostBonus: 3, magicBonus: 2, defenseBonus: 0,
    description: 'A simple silver ring that glows with a faint blue frost.',
    lore: 'Given to every new frost adept upon entering the palace for the first time.',
    color: '#caf0f8',
  },
  {
    id: 'crystal_amulet', name: 'Crystal Amulet', slot: 'amulet', rarity: IP_RARITY_COMMON,
    frostBonus: 2, magicBonus: 5, defenseBonus: 1,
    description: 'An amulet containing a single perfectly formed ice crystal.',
    lore: 'The crystal inside never melts, even in the hottest desert.',
    color: '#a2d2ff',
  },
  {
    id: 'ice_staff_apprentice', name: 'Apprentice Ice Staff', slot: 'staff', rarity: IP_RARITY_COMMON,
    frostBonus: 4, magicBonus: 4, defenseBonus: 0,
    description: 'A staff carved from a single icicle, warm to the touch despite its frozen nature.',
    lore: 'Every palace apprentice crafts their own staff from the throne room icicles.',
    color: '#89c2d9',
  },
  {
    id: 'frostshield_buckler', name: 'Frost Buckler', slot: 'shield', rarity: IP_RARITY_COMMON,
    frostBonus: 1, magicBonus: 1, defenseBonus: 5,
    description: 'A small shield made of compressed snow that hardens on impact.',
    lore: 'Deceptively fragile-looking, this buckler has stopped a glacier golem charge.',
    color: '#bde0fe',
  },
  {
    id: 'snow_crown_initiate', name: 'Initiate Snow Crown', slot: 'crown', rarity: IP_RARITY_UNCOMMON,
    frostBonus: 5, magicBonus: 6, defenseBonus: 2,
    description: 'A delicate crown woven from enchanted snowflakes that never fall apart.',
    lore: 'Worn by those who have mastered the first circle of frost magic.',
    color: '#e0fbfc',
  },
  {
    id: 'blizzard_ring', name: 'Ring of the Blizzard', slot: 'ring', rarity: IP_RARITY_UNCOMMON,
    frostBonus: 6, magicBonus: 4, defenseBonus: 1,
    description: 'A ring that perpetually generates tiny swirling snowflakes around the wearer.',
    lore: 'Crafted from the heart of a captured blizzard by the Frost Empress.',
    color: '#caf0f8',
  },
  {
    id: 'glacial_amulet', name: 'Glacial Amulet', slot: 'amulet', rarity: IP_RARITY_UNCOMMON,
    frostBonus: 4, magicBonus: 8, defenseBonus: 3,
    description: 'An amulet containing water from a ten-thousand-year-old glacier.',
    lore: 'The water inside shifts and flows, showing visions of ancient frozen landscapes.',
    color: '#48cae4',
  },
  {
    id: 'ice_staff_adept', name: 'Adept Ice Staff', slot: 'staff', rarity: IP_RARITY_UNCOMMON,
    frostBonus: 7, magicBonus: 6, defenseBonus: 1,
    description: 'A staff reinforced with crystal veins that pulse with frost energy.',
    lore: 'This staff was the weapon of choice for the palace guardians during the Great Thaw.',
    color: '#00e5ff',
  },
  {
    id: 'aurora_pendant', name: 'Aurora Pendant', slot: 'amulet', rarity: IP_RARITY_RARE,
    frostBonus: 8, magicBonus: 12, defenseBonus: 5,
    description: 'A pendant that contains a captured fragment of the northern lights.',
    lore: 'The aurora fragment inside dances and shifts, casting rainbow shadows.',
    color: '#48cae4',
  },
  {
    id: 'permafrost_shield', name: 'Permafrost Shield', slot: 'shield', rarity: IP_RARITY_RARE,
    frostBonus: 5, magicBonus: 5, defenseBonus: 15,
    description: 'A massive shield carved from ancient permafrost that predates civilization.',
    lore: 'This shield has never been breached. Its surface is harder than diamond.',
    color: '#023e8a',
  },
  {
    id: 'crystal_wizard_staff', name: 'Crystal Wizard Staff', slot: 'staff', rarity: IP_RARITY_RARE,
    frostBonus: 10, magicBonus: 14, defenseBonus: 3,
    description: 'A magnificent staff topped with a cluster of enchanted ice crystals.',
    lore: 'Each crystal in the cluster holds a different frost spell, accessible to the worthy wielder.',
    color: '#a2d2ff',
  },
  {
    id: 'frost_lord_crown', name: 'Frost Lord Crown', slot: 'crown', rarity: IP_RARITY_RARE,
    frostBonus: 12, magicBonus: 10, defenseBonus: 8,
    description: 'A crown of pure ice that never melts, radiating an aura of intense cold.',
    lore: 'Worn by the Frost Lords who ruled the palace before the Empress ascended.',
    color: '#00e5ff',
  },
  {
    id: 'blizzard_signet', name: 'Blizzard Signet Ring', slot: 'ring', rarity: IP_RARITY_RARE,
    frostBonus: 10, magicBonus: 8, defenseBonus: 4,
    description: 'A signet ring that stamps commands in frost upon any surface.',
    lore: 'Used by ancient frost generals to issue orders that could not be erased or disobeyed.',
    color: '#caf0f8',
  },
  {
    id: 'ice_mirror_shield', name: 'Ice Mirror Shield', slot: 'shield', rarity: IP_RARITY_EPIC,
    frostBonus: 8, magicBonus: 12, defenseBonus: 20,
    description: 'A perfectly smooth shield of mirror ice that reflects any spell cast at it.',
    lore: 'The Ice Mirror Shield was forged during the War of Frozen Suns to counter fire magic.',
    color: '#e0fbfc',
  },
  {
    id: 'aurora_circlet', name: 'Aurora Circlet', slot: 'crown', rarity: IP_RARITY_EPIC,
    frostBonus: 15, magicBonus: 18, defenseBonus: 10,
    description: 'A circlet of living aurora light that hovers above the head without touching it.',
    lore: 'The Aurora Circlet grants its wearer the ability to see through any illusion or storm.',
    color: '#48cae4',
  },
  {
    id: 'cryo_lord_amulet', name: 'Cryo Lord Amulet', slot: 'amulet', rarity: IP_RARITY_EPIC,
    frostBonus: 14, magicBonus: 16, defenseBonus: 8,
    description: 'An amulet containing a preserved ice elemental essence that whispers frost incantations.',
    lore: 'The elemental within teaches its wearer spells that no living mage remembers.',
    color: '#00e5ff',
  },
  {
    id: 'permafrost_scepter', name: 'Permafrost Scepter', slot: 'staff', rarity: IP_RARITY_EPIC,
    frostBonus: 18, magicBonus: 20, defenseBonus: 12,
    description: 'A scepter carved from the oldest known permafrost, containing the essence of the first winter.',
    lore: 'With this scepter, the Frost Empress commanded the Eternal Winter to last a thousand years.',
    color: '#023e8a',
  },
  {
    id: 'eternal_frost_ring', name: 'Eternal Frost Ring', slot: 'ring', rarity: IP_RARITY_EPIC,
    frostBonus: 16, magicBonus: 14, defenseBonus: 10,
    description: 'A ring that radiates cold so intense it freezes the air in a five-foot radius.',
    lore: 'Legend says removing this ring causes the wearer to melt from the sudden warmth.',
    color: '#03045e',
  },
  {
    id: 'crown_of_ice_empress', name: 'Crown of the Ice Empress', slot: 'crown', rarity: IP_RARITY_LEGENDARY,
    frostBonus: 25, magicBonus: 30, defenseBonus: 18,
    description: 'The supreme crown of the ice palace, forged from a frozen star and the first snowfall.',
    lore: 'Only the true ruler of the ice palace can wear this crown without being consumed by its power.',
    color: '#caf0f8',
  },
  {
    id: 'staff_of_eternal_winter', name: 'Staff of Eternal Winter', slot: 'staff', rarity: IP_RARITY_LEGENDARY,
    frostBonus: 30, magicBonus: 35, defenseBonus: 15,
    description: 'The legendary staff that once commanded the world into an eternal ice age.',
    lore: 'When planted in the ground, this staff creates a permanent zone of absolute cold.',
    color: '#00e5ff',
  },
  {
    id: 'heart_of_the_glacier', name: 'Heart of the Glacier', slot: 'amulet', rarity: IP_RARITY_LEGENDARY,
    frostBonus: 20, magicBonus: 25, defenseBonus: 20,
    description: 'A glowing blue gem that is the literal heart of the ancient glacier beneath the palace.',
    lore: 'It beats once every hundred years. Each beat causes an earthquake of ice across the world.',
    color: '#48cae4',
  },
  {
    id: 'aegis_of_permafrost', name: 'Aegis of Permafrost', slot: 'shield', rarity: IP_RARITY_LEGENDARY,
    frostBonus: 18, magicBonus: 18, defenseBonus: 35,
    description: 'An impenetrable shield of primordial permafrost that existed before the world was formed.',
    lore: 'Nothing in existence has ever damaged the Aegis. Not dragonfire, not divine lightning.',
    color: '#03045e',
  },
]

// === LEVEL TITLES (8) ===

export const IP_TITLES: IpTitleDef[] = [
  { level: 1, title: 'Frost Novice', description: 'A newcomer to the ice palace, just beginning to feel the cold.' },
  { level: 5, title: 'Ice Apprentice', description: 'Has learned the first frost incantations and can freeze water.' },
  { level: 10, title: 'Glacial Adept', description: 'Commands glacier magic and can explore the deeper palace rooms.' },
  { level: 15, title: 'Frost Warden', description: 'A guardian of the frozen halls, trusted with palace secrets.' },
  { level: 20, title: 'Blizzard Mage', description: 'Master of storm and blizzard magic, feared by all creatures of warmth.' },
  { level: 30, title: 'Crystal Sage', description: 'A sage of the crystal arts whose wisdom is sought by frost elementals.' },
  { level: 40, title: 'Permafrost Archon', description: 'An archon of ancient ice, commanding the deepest frozen powers.' },
  { level: 50, title: 'Ice Empress', description: 'The supreme ruler of the ice palace and all frozen realms.' },
]

// === ACHIEVEMENTS (15) ===

export const IP_ACHIEVEMENTS: IpAchievementDef[] = [
  {
    id: 'first_freeze', name: 'First Frost', description: 'Freeze your first frozen creature.',
    condition: 'totalFrozen >= 1', rewardXp: 50, hidden: false, icon: '🧊',
  },
  {
    id: 'creature_collector_5', name: 'Cold Collection', description: 'Collect 5 different frozen creatures.',
    condition: 'creatures >= 5', rewardXp: 100, hidden: false, icon: '❄️',
  },
  {
    id: 'creature_collector_15', name: 'Frozen Menagerie', description: 'Collect 15 different frozen creatures.',
    condition: 'creatures >= 15', rewardXp: 300, hidden: false, icon: '🌨️',
  },
  {
    id: 'creature_collector_30', name: 'Complete Bestiary', description: 'Collect all 32 frozen creatures.',
    condition: 'creatures >= 32', rewardXp: 1500, hidden: true, icon: '👑',
  },
  {
    id: 'spell_master_10', name: 'Frost Scholar', description: 'Learn 10 different ice spells.',
    condition: 'spells >= 10', rewardXp: 200, hidden: false, icon: '📖',
  },
  {
    id: 'spell_master_all', name: 'Grand Cryomancer', description: 'Learn all 28 ice spells.',
    condition: 'spells >= 28', rewardXp: 2000, hidden: true, icon: '🧙',
  },
  {
    id: 'explorer_all', name: 'Palace Cartographer', description: 'Explore all 8 palace rooms.',
    condition: 'rooms >= 8', rewardXp: 500, hidden: false, icon: '🗺️',
  },
  {
    id: 'artifact_10', name: 'Relic Hunter', description: 'Collect 10 ice artifacts.',
    condition: 'artifacts >= 10', rewardXp: 300, hidden: false, icon: '🏺',
  },
  {
    id: 'artifact_all', name: 'Curator of Frost', description: 'Collect all 22 ice artifacts.',
    condition: 'artifacts >= 22', rewardXp: 2500, hidden: true, icon: '🏛️',
  },
  {
    id: 'blizzard_survivor_5', name: 'Storm Endurer', description: 'Survive 5 blizzards.',
    condition: 'blizzardsSurvived >= 5', rewardXp: 200, hidden: false, icon: '⛈️',
  },
  {
    id: 'blizzard_survivor_20', name: 'Blizzard King', description: 'Survive 20 blizzards.',
    condition: 'blizzardsSurvived >= 20', rewardXp: 800, hidden: false, icon: '👑',
  },
  {
    id: 'legendary_freeze', name: 'Legendary Frost', description: 'Freeze a legendary creature.',
    condition: 'legendary >= 1', rewardXp: 500, hidden: false, icon: '⭐',
  },
  {
    id: 'max_level', name: 'Frozen Apex', description: 'Reach the maximum level of 50.',
    condition: 'level >= 50', rewardXp: 3000, hidden: true, icon: '🏔️',
  },
  {
    id: 'spell_cast_100', name: 'Spell Weaver', description: 'Cast ice spells 100 times total.',
    condition: 'totalSpellsCast >= 100', rewardXp: 250, hidden: false, icon: '✨',
  },
  {
    id: 'streak_7', name: 'Week of Frost', description: 'Maintain a 7-day streak.',
    condition: 'streak >= 7', rewardXp: 300, hidden: false, icon: '📅',
  },
]

// === MAX LEVEL & XP TABLE ===

export const IP_MAX_LEVEL = 50

export const IP_XP_TABLE: number[] = (() => {
  const table: number[] = [0]
  for (let i = 1; i <= IP_MAX_LEVEL; i++) {
    table[i] = Math.floor(80 * Math.pow(i, 1.35) + i * 20)
  }
  return table
})()

// === DEFAULT STATE ===

function ipCreateDefaultState(): IcePalaceState {
  const now = new Date()
  const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    creatures: [],
    spells: IP_ICE_SPELLS.map((s) => ({
      spellId: s.id,
      learned: s.unlockLevel <= 1,
      mastery: 0,
      castCount: 0,
    })),
    rooms: IP_PALACE_ROOMS.map((r) => ({
      roomId: r.id,
      explored: false,
      explorationCount: 0,
      lastExplored: null,
      secretsFound: 0,
    })),
    artifacts: IP_ARTIFACTS.map((a) => ({
      artifactId: a.id,
      owned: false,
      equipped: false,
      acquiredAt: null,
      powerLevel: 0,
    })),
    achievements: IP_ACHIEVEMENTS.map((a) => ({
      achievementId: a.id,
      unlocked: false,
      unlockedAt: null,
    })),
    title: IP_TITLES[0].title,
    dailyCast: 0,
    dailyDate: todayKey,
    totalFrozen: 0,
    totalMelted: 0,
    blizzardsSurvived: 0,
    blizzardsEncountered: 0,
    totalRoomsExplored: 0,
    totalSpellsCast: 0,
    totalArtifactsFound: 0,
    totalAchievements: 0,
    currentBlizzard: null,
    dailyReward: {
      xpBonus: 0,
      creatureBonus: false,
      spellBonus: false,
      artifactChance: 0,
      claimed: false,
    },
    streak: 0,
    bestStreak: 0,
    seed: Date.now(),
    tick: 0,
  }
}

// === HELPER FUNCTIONS (module-level) ===

function ipGetTitleForLevel(level: number): string {
  let title = IP_TITLES[0].title
  for (const t of IP_TITLES) {
    if (level >= t.level) title = t.title
  }
  return title
}

function ipGetXpRequiredForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= IP_MAX_LEVEL) return Infinity
  return IP_XP_TABLE[level] ?? 100
}

function ipGetTodayKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
}

function ipRandomFromSeed(seed: number, index: number): number {
  let s = seed + index * 2654435761
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b)
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b)
  s ^= s >>> 16
  return (s >>> 0) / 4294967296
}

// === HOOK ===

export default function useIcePalace() {
  const stateRef = useRef<IcePalaceState>(ipCreateDefaultState())
  const [state, setState] = useState<IcePalaceState>(() => {
    if (typeof window === 'undefined') return ipCreateDefaultState()
    try {
      const saved = localStorage.getItem('ice-palace-save')
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...ipCreateDefaultState(), ...parsed }
      }
    } catch {
      // ignore parse errors
    }
    return ipCreateDefaultState()
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('ice-palace-save', JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  }, [state])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // === SIMPLE GETTERS ===

  const ipGetLevel = (): number => state.level
  const ipGetXp = (): number => state.xp
  const ipGetTotalXp = (): number => state.totalXp
  const ipGetTitle = (): string => state.title
  const ipGetCreatures = (): IpCreatureEntity[] => state.creatures
  const ipGetSpells = (): IpSpellEntity[] => state.spells
  const ipGetRooms = (): IpRoomEntity[] => state.rooms
  const ipGetArtifacts = (): IpArtifactEntity[] => state.artifacts
  const ipGetAchievements = (): IpAchievementEntity[] => state.achievements
  const ipGetDailyCast = (): number => state.dailyCast
  const ipGetDailyDate = (): string => state.dailyDate
  const ipGetTotalFrozen = (): number => state.totalFrozen
  const ipGetTotalMelted = (): number => state.totalMelted
  const ipGetBlizzardsSurvived = (): number => state.blizzardsSurvived
  const ipGetBlizzardsEncountered = (): number => state.blizzardsEncountered
  const ipGetTotalRoomsExplored = (): number => state.totalRoomsExplored
  const ipGetTotalSpellsCast = (): number => state.totalSpellsCast
  const ipGetTotalArtifactsFound = (): number => state.totalArtifactsFound
  const ipGetTotalAchievements = (): number => state.totalAchievements
  const ipGetCurrentBlizzard = (): IpBlizzardEvent | null => state.currentBlizzard
  const ipGetDailyReward = (): IpDailyReward => state.dailyReward
  const ipGetStreak = (): number => state.streak
  const ipGetBestStreak = (): number => state.bestStreak
  const ipGetSeed = (): number => state.seed
  const ipGetTick = (): number => state.tick
  const ipGetCreatureCount = (): number => state.creatures.length
  const ipGetLearnedSpellCount = (): number => state.spells.filter((s) => s.learned).length
  const ipGetExploredRoomCount = (): number => state.rooms.filter((r) => r.explored).length
  const ipGetOwnedArtifactCount = (): number => state.artifacts.filter((a) => a.owned).length
  const ipGetEquippedArtifactCount = (): number => state.artifacts.filter((a) => a.equipped).length
  const ipGetUnlockedAchievementCount = (): number => state.achievements.filter((a) => a.unlocked).length
  const ipGetLegendaryCreatureCount = (): number => {
    return state.creatures.filter((c) => {
      const def = IP_FROZEN_CREATURES.find((f) => f.id === c.creatureId)
      return def && def.rarity === IP_RARITY_LEGENDARY
    }).length
  }
  const ipGetXpRequired = (): number => ipGetXpRequiredForLevel(state.level)
  const ipGetXpProgress = (): number => {
    const needed = ipGetXpRequiredForLevel(state.level)
    if (needed === Infinity || needed <= 0) return 1
    return Math.min(1, state.xp / needed)
  }
  const ipGetOverallProgress = (): number => state.level / IP_MAX_LEVEL
  const ipGetFrozenRatio = (): number => {
    if (state.totalFrozen + state.totalMelted === 0) return 0
    return state.totalFrozen / (state.totalFrozen + state.totalMelted)
  }
  const ipGetTotalFrostPower = (): number => {
    return state.creatures.reduce((sum, c) => {
      const def = IP_FROZEN_CREATURES.find((f) => f.id === c.creatureId)
      return sum + (def ? def.attack + def.magic + def.defense + c.level * 2 : 0)
    }, 0)
  }
  const ipGetTotalArtifactBonus = (): number => {
    return state.artifacts
      .filter((a) => a.equipped)
      .reduce((sum, a) => {
        const def = IP_ARTIFACTS.find((art) => art.id === a.artifactId)
        return sum + (def ? def.frostBonus + def.magicBonus + def.defenseBonus + a.powerLevel * 2 : 0)
      }, 0)
  }

  // === STATE MODIFIERS (useCallback) ===

  const ipAddXp = useCallback((amount: number) => {
    setState((prev) => {
      let { level, xp, totalXp } = prev
      const gained = Math.floor(amount)
      xp += gained
      totalXp += gained
      while (level < IP_MAX_LEVEL && xp >= ipGetXpRequiredForLevel(level)) {
        xp -= ipGetXpRequiredForLevel(level)
        level += 1
      }
      if (level >= IP_MAX_LEVEL) xp = 0
      const title = ipGetTitleForLevel(level)
      return { ...prev, level: Math.min(level, IP_MAX_LEVEL), xp, totalXp, title }
    })
  }, [])

  const ipSetXp = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, xp: Math.max(0, Math.floor(amount)) }))
  }, [])

  const ipSetLevel = useCallback((newLevel: number) => {
    setState((prev) => {
      const clamped = Math.max(1, Math.min(IP_MAX_LEVEL, Math.floor(newLevel)))
      const title = ipGetTitleForLevel(clamped)
      return { ...prev, level: clamped, title }
    })
  }, [])

  const ipFreezeCreature = useCallback((creatureId: string): boolean => {
    let success = false
    setState((prev) => {
      const def = IP_FROZEN_CREATURES.find((c) => c.id === creatureId)
      if (!def) return prev
      if (prev.creatures.some((c) => c.creatureId === creatureId)) return prev
      const entity: IpCreatureEntity = {
        creatureId,
        nickname: def.name,
        level: 1,
        xp: 0,
        hp: def.hp,
        maxHp: def.hp,
        frozen: true,
        frozenAt: Date.now(),
      }
      success = true
      return {
        ...prev,
        creatures: [...prev.creatures, entity],
        totalFrozen: prev.totalFrozen + 1,
      }
    })
    return success
  }, [])

  const ipMeltCreature = useCallback((creatureId: string): boolean => {
    let success = false
    setState((prev) => {
      const idx = prev.creatures.findIndex((c) => c.creatureId === creatureId)
      if (idx === -1) return prev
      success = true
      const newCreatures = [...prev.creatures]
      newCreatures.splice(idx, 1)
      return {
        ...prev,
        creatures: newCreatures,
        totalMelted: prev.totalMelted + 1,
      }
    })
    return success
  }, [])

  const ipLevelUpCreature = useCallback((creatureId: string, xpAmount: number) => {
    setState((prev) => {
      const idx = prev.creatures.findIndex((c) => c.creatureId === creatureId)
      if (idx === -1) return prev
      const creature = prev.creatures[idx]
      const def = IP_FROZEN_CREATURES.find((c) => c.id === creatureId)
      if (!def) return prev
      const newCreatures = [...prev.creatures]
      let newXp = creature.xp + Math.floor(xpAmount)
      let newLevel = creature.level
      while (newLevel < IP_MAX_LEVEL && newXp >= ipGetXpRequiredForLevel(newLevel)) {
        newXp -= ipGetXpRequiredForLevel(newLevel)
        newLevel += 1
      }
      if (newLevel >= IP_MAX_LEVEL) newXp = 0
      newCreatures[idx] = {
        ...creature,
        level: Math.min(newLevel, IP_MAX_LEVEL),
        xp: newXp,
        maxHp: def.hp + (newLevel - 1) * 10,
        hp: def.hp + (newLevel - 1) * 10,
      }
      return { ...prev, creatures: newCreatures }
    })
  }, [])

  const ipRenameCreature = useCallback((creatureId: string, nickname: string) => {
    setState((prev) => {
      const idx = prev.creatures.findIndex((c) => c.creatureId === creatureId)
      if (idx === -1) return prev
      const newCreatures = [...prev.creatures]
      newCreatures[idx] = { ...newCreatures[idx], nickname: nickname.slice(0, 30) }
      return { ...prev, creatures: newCreatures }
    })
  }, [])

  const ipToggleCreatureFrozen = useCallback((creatureId: string) => {
    setState((prev) => {
      const idx = prev.creatures.findIndex((c) => c.creatureId === creatureId)
      if (idx === -1) return prev
      const newCreatures = [...prev.creatures]
      newCreatures[idx] = { ...newCreatures[idx], frozen: !newCreatures[idx].frozen }
      return { ...prev, creatures: newCreatures }
    })
  }, [])

  const ipCastSpell = useCallback((spellId: string): boolean => {
    let success = false
    setState((prev) => {
      const idx = prev.spells.findIndex((s) => s.spellId === spellId)
      if (idx === -1) return prev
      const spell = prev.spells[idx]
      if (!spell.learned) return prev
      success = true
      const newSpells = [...prev.spells]
      newSpells[idx] = {
        ...spell,
        castCount: spell.castCount + 1,
        mastery: Math.min(100, spell.mastery + 1),
      }
      const todayKey = ipGetTodayKey()
      const newDailyCast = prev.dailyDate === todayKey ? prev.dailyCast + 1 : 1
      return {
        ...prev,
        spells: newSpells,
        totalSpellsCast: prev.totalSpellsCast + 1,
        dailyCast: newDailyCast,
        dailyDate: todayKey,
      }
    })
    return success
  }, [])

  const ipLearnSpell = useCallback((spellId: string): boolean => {
    let success = false
    setState((prev) => {
      const idx = prev.spells.findIndex((s) => s.spellId === spellId)
      if (idx === -1) return prev
      if (prev.spells[idx].learned) return prev
      const def = IP_ICE_SPELLS.find((s) => s.id === spellId)
      if (!def || def.unlockLevel > prev.level) return prev
      success = true
      const newSpells = [...prev.spells]
      newSpells[idx] = { ...newSpells[idx], learned: true }
      return { ...prev, spells: newSpells }
    })
    return success
  }, [])

  const ipExploreRoom = useCallback((roomId: string): boolean => {
    let success = false
    setState((prev) => {
      const roomDef = IP_PALACE_ROOMS.find((r) => r.id === roomId)
      if (!roomDef) return prev
      if (roomDef.unlockLevel > prev.level) return prev
      const idx = prev.rooms.findIndex((r) => r.roomId === roomId)
      if (idx === -1) return prev
      const room = prev.rooms[idx]
      success = true
      const newRooms = [...prev.rooms]
      const wasNew = !room.explored
      newRooms[idx] = {
        ...room,
        explored: true,
        explorationCount: room.explorationCount + 1,
        lastExplored: Date.now(),
        secretsFound: room.secretsFound + (wasNew ? 1 : 0),
      }
      return {
        ...prev,
        rooms: newRooms,
        totalRoomsExplored: prev.totalRoomsExplored + 1,
      }
    })
    return success
  }, [])

  const ipFindArtifact = useCallback((artifactId: string): boolean => {
    let success = false
    setState((prev) => {
      const idx = prev.artifacts.findIndex((a) => a.artifactId === artifactId)
      if (idx === -1) return prev
      if (prev.artifacts[idx].owned) return prev
      success = true
      const newArtifacts = [...prev.artifacts]
      newArtifacts[idx] = {
        ...newArtifacts[idx],
        owned: true,
        acquiredAt: Date.now(),
        powerLevel: 1,
      }
      return {
        ...prev,
        artifacts: newArtifacts,
        totalArtifactsFound: prev.totalArtifactsFound + 1,
      }
    })
    return success
  }, [])

  const ipEquipArtifact = useCallback((artifactId: string): boolean => {
    let success = false
    setState((prev) => {
      const idx = prev.artifacts.findIndex((a) => a.artifactId === artifactId)
      if (idx === -1) return prev
      if (!prev.artifacts[idx].owned) return prev
      const def = IP_ARTIFACTS.find((a) => a.id === artifactId)
      if (!def) return prev
      const newArtifacts = [...prev.artifacts]
      newArtifacts[idx] = { ...newArtifacts[idx], equipped: !newArtifacts[idx].equipped }
      success = true
      return { ...prev, artifacts: newArtifacts }
    })
    return success
  }, [])

  const ipUpgradeArtifact = useCallback((artifactId: string): boolean => {
    let success = false
    setState((prev) => {
      const idx = prev.artifacts.findIndex((a) => a.artifactId === artifactId)
      if (idx === -1) return prev
      if (!prev.artifacts[idx].owned) return prev
      const artifact = prev.artifacts[idx]
      success = true
      const newArtifacts = [...prev.artifacts]
      newArtifacts[idx] = { ...artifact, powerLevel: Math.min(10, artifact.powerLevel + 1) }
      return { ...prev, artifacts: newArtifacts }
    })
    return success
  }, [])

  const ipUnlockAchievement = useCallback((achievementId: string): boolean => {
    let success = false
    setState((prev) => {
      const idx = prev.achievements.findIndex((a) => a.achievementId === achievementId)
      if (idx === -1) return prev
      if (prev.achievements[idx].unlocked) return prev
      success = true
      const newAchievements = [...prev.achievements]
      newAchievements[idx] = { ...newAchievements[idx], unlocked: true, unlockedAt: Date.now() }
      return {
        ...prev,
        achievements: newAchievements,
        totalAchievements: prev.totalAchievements + 1,
      }
    })
    return success
  }, [])

  const ipStartBlizzard = useCallback((severity: IpBlizzardSeverity) => {
    setState((prev) => {
      const durationMap: Record<IpBlizzardSeverity, number> = {
        light: 30,
        moderate: 60,
        heavy: 120,
        catastrophic: 240,
      }
      const damageMap: Record<IpBlizzardSeverity, number> = {
        light: 5,
        moderate: 15,
        heavy: 30,
        catastrophic: 60,
      }
      const blizzard: IpBlizzardEvent = {
        id: `blizzard_${Date.now()}`,
        severity,
        startedAt: Date.now(),
        duration: durationMap[severity],
        survived: false,
        damage: damageMap[severity],
      }
      return {
        ...prev,
        currentBlizzard: blizzard,
        blizzardsEncountered: prev.blizzardsEncountered + 1,
      }
    })
  }, [])

  const ipSurviveBlizzard = useCallback(() => {
    let survived = false
    setState((prev) => {
      if (!prev.currentBlizzard || prev.currentBlizzard.survived) return prev
      survived = true
      return {
        ...prev,
        currentBlizzard: { ...prev.currentBlizzard, survived: true },
        blizzardsSurvived: prev.blizzardsSurvived + 1,
      }
    })
    return survived
  }, [])

  const ipEndBlizzard = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentBlizzard: null,
    }))
  }, [])

  const ipClaimDailyReward = useCallback((): { xpBonus: number; creatureFound: boolean; spellFound: boolean } => {
    let result = { xpBonus: 0, creatureFound: false, spellFound: false }
    setState((prev) => {
      const todayKey = ipGetTodayKey()
      if (prev.dailyDate === todayKey && prev.dailyReward.claimed) return prev
      const levelMultiplier = 1 + prev.level * 0.1
      const xpBonus = Math.floor((50 + prev.level * 10) * levelMultiplier)
      const rand1 = ipRandomFromSeed(prev.seed + Date.now(), 0)
      const rand2 = ipRandomFromSeed(prev.seed + Date.now(), 1)
      const creatureFound = rand1 < 0.3
      const spellFound = rand2 < 0.2 && prev.spells.some((s) => !s.learned)
      result = { xpBonus, creatureFound, spellFound }
      const newStreak = prev.dailyDate === ipGetPreviousDayKey(todayKey) ? prev.streak + 1 : 1
      return {
        ...prev,
        dailyReward: {
          xpBonus,
          creatureBonus: creatureFound,
          spellBonus: spellFound,
          artifactChance: ipRandomFromSeed(prev.seed + Date.now(), 2) * 100,
          claimed: true,
        },
        dailyDate: todayKey,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        seed: prev.seed + 1,
      }
    })
    return result
  }, [])

  const ipCheckAchievements = useCallback((): string[] => {
    const unlocked: string[] = []
    const s = stateRef.current
    const checks: Record<string, boolean> = {
      first_freeze: s.totalFrozen >= 1,
      creature_collector_5: s.creatures.length >= 5,
      creature_collector_15: s.creatures.length >= 15,
      creature_collector_30: s.creatures.length >= 32,
      spell_master_10: s.spells.filter((sp) => sp.learned).length >= 10,
      spell_master_all: s.spells.filter((sp) => sp.learned).length >= 28,
      explorer_all: s.rooms.filter((r) => r.explored).length >= 8,
      artifact_10: s.artifacts.filter((a) => a.owned).length >= 10,
      artifact_all: s.artifacts.filter((a) => a.owned).length >= 22,
      blizzard_survivor_5: s.blizzardsSurvived >= 5,
      blizzard_survivor_20: s.blizzardsSurvived >= 20,
      legendary_freeze: s.creatures.some((c) => {
        const def = IP_FROZEN_CREATURES.find((f) => f.id === c.creatureId)
        return def && def.rarity === IP_RARITY_LEGENDARY
      }),
      max_level: s.level >= IP_MAX_LEVEL,
      spell_cast_100: s.totalSpellsCast >= 100,
      streak_7: s.streak >= 7,
    }
    for (const [id, met] of Object.entries(checks)) {
      if (met) {
        const existing = s.achievements.find((a) => a.achievementId === id)
        if (existing && !existing.unlocked) {
          unlocked.push(id)
        }
      }
    }
    return unlocked
  }, [])

  const ipFreezeRandomCreature = useCallback((): IpCreatureDef | null => {
    const s = stateRef.current
    const owned = new Set(s.creatures.map((c) => c.creatureId))
    const available = IP_FROZEN_CREATURES.filter((c) => !owned.has(c.id))
    if (available.length === 0) return null
    const weights = available.map((c) => IP_RARITY_DROP_WEIGHTS[c.rarity])
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    let rand = (ipRandomFromSeed(s.seed + Date.now(), 3)) * totalWeight
    for (let i = 0; i < available.length; i++) {
      rand -= weights[i]
      if (rand <= 0) {
        ipFreezeCreature(available[i].id)
        return available[i]
      }
    }
    ipFreezeCreature(available[0].id)
    return available[0]
  }, [ipFreezeCreature])

  const ipExploreRandomRoom = useCallback((): IpRoomDef | null => {
    const s = stateRef.current
    const available = IP_PALACE_ROOMS.filter((r) => r.unlockLevel <= s.level)
    if (available.length === 0) return null
    const rand = ipRandomFromSeed(s.seed + Date.now(), 4)
    const room = available[Math.floor(rand * available.length)]
    ipExploreRoom(room.id)
    return room
  }, [ipExploreRoom])

  const ipGetCreatureDef = useCallback((creatureId: string): IpCreatureDef | null => {
    return IP_FROZEN_CREATURES.find((c) => c.id === creatureId) ?? null
  }, [])

  const ipGetSpellDef = useCallback((spellId: string): IpSpellDef | null => {
    return IP_ICE_SPELLS.find((s) => s.id === spellId) ?? null
  }, [])

  const ipGetRoomDef = useCallback((roomId: string): IpRoomDef | null => {
    return IP_PALACE_ROOMS.find((r) => r.id === roomId) ?? null
  }, [])

  const ipGetArtifactDef = useCallback((artifactId: string): IpArtifactDef | null => {
    return IP_ARTIFACTS.find((a) => a.id === artifactId) ?? null
  }, [])

  const ipGetAchievementDef = useCallback((achievementId: string): IpAchievementDef | null => {
    return IP_ACHIEVEMENTS.find((a) => a.id === achievementId) ?? null
  }, [])

  const ipGetRarityColor = useCallback((rarity: IpRarity): string => {
    return IP_RARITY_COLORS[rarity] ?? IP_COLOR_CYAN
  }, [])

  const ipGetRarityIcon = useCallback((rarity: IpRarity): string => {
    return IP_RARITY_ICONS[rarity] ?? '🧊'
  }, [])

  const ipGetRarityName = useCallback((rarity: IpRarity): string => {
    const names: Record<IpRarity, string> = {
      common: 'Common',
      uncommon: 'Uncommon',
      rare: 'Rare',
      epic: 'Epic',
      legendary: 'Legendary',
    }
    return names[rarity] ?? 'Unknown'
  }, [])

  const ipGetCreatureXpProgress = useCallback((creatureId: string): number => {
    const creature = stateRef.current.creatures.find((c) => c.creatureId === creatureId)
    if (!creature) return 0
    const needed = ipGetXpRequiredForLevel(creature.level)
    if (needed === Infinity || needed <= 0) return 1
    return Math.min(1, creature.xp / needed)
  }, [])

  const ipGetSpellMasteryProgress = useCallback((spellId: string): number => {
    const spell = stateRef.current.spells.find((s) => s.spellId === spellId)
    if (!spell) return 0
    return spell.mastery / 100
  }, [])

  const ipGetRoomExplorationProgress = useCallback((): number => {
    const explored = stateRef.current.rooms.filter((r) => r.explored).length
    return explored / IP_PALACE_ROOMS.length
  }, [])

  const ipGetBestiaryProgress = useCallback((): number => {
    return stateRef.current.creatures.length / IP_FROZEN_CREATURES.length
  }, [])

  const ipGetSpellbookProgress = useCallback((): number => {
    const learned = stateRef.current.spells.filter((s) => s.learned).length
    return learned / IP_ICE_SPELLS.length
  }, [])

  const ipGetArtifactProgress = useCallback((): number => {
    const owned = stateRef.current.artifacts.filter((a) => a.owned).length
    return owned / IP_ARTIFACTS.length
  }, [])

  const ipGetAchievementProgress = useCallback((): number => {
    const unlocked = stateRef.current.achievements.filter((a) => a.unlocked).length
    return unlocked / IP_ACHIEVEMENTS.length
  }, [])

  const ipGetCreaturesByRarity = useCallback((rarity: IpRarity): IpCreatureEntity[] => {
    return stateRef.current.creatures.filter((c) => {
      const def = IP_FROZEN_CREATURES.find((f) => f.id === c.creatureId)
      return def && def.rarity === rarity
    })
  }, [])

  const ipGetSpellsBySchool = useCallback((school: IpSpellSchool): IpSpellEntity[] => {
    return stateRef.current.spells.filter((s) => {
      const def = IP_ICE_SPELLS.find((sp) => sp.id === s.spellId)
      return def && def.school === school
    })
  }, [])

  const ipGetArtifactsBySlot = useCallback((slot: IpArtifactSlot): IpArtifactEntity[] => {
    return stateRef.current.artifacts.filter((a) => {
      const def = IP_ARTIFACTS.find((art) => art.id === a.artifactId)
      return def && def.slot === slot
    })
  }, [])

  const ipGetCreaturesByType = useCallback((type: IpCreatureType): IpCreatureEntity[] => {
    return stateRef.current.creatures.filter((c) => {
      const def = IP_FROZEN_CREATURES.find((f) => f.id === c.creatureId)
      return def && def.type === type
    })
  }, [])

  const ipGetLearnedSpells = useCallback((): IpSpellEntity[] => {
    return stateRef.current.spells.filter((s) => s.learned)
  }, [])

  const ipGetUnlearnedSpells = useCallback((): IpSpellEntity[] => {
    return stateRef.current.spells.filter((s) => !s.learned)
  }, [])

  const ipGetAvailableSpells = useCallback((): IpSpellEntity[] => {
    const level = stateRef.current.level
    return stateRef.current.spells.filter((s) => {
      if (s.learned) return false
      const def = IP_ICE_SPELLS.find((sp) => sp.id === s.spellId)
      return def && def.unlockLevel <= level
    })
  }, [])

  const ipGetAvailableRooms = useCallback((): IpRoomEntity[] => {
    const level = stateRef.current.level
    return stateRef.current.rooms.filter((r) => {
      const def = IP_PALACE_ROOMS.find((rm) => rm.id === r.roomId)
      return def && def.unlockLevel <= level
    })
  }, [])

  const ipGetLockedRooms = useCallback((): IpRoomEntity[] => {
    const level = stateRef.current.level
    return stateRef.current.rooms.filter((r) => {
      const def = IP_PALACE_ROOMS.find((rm) => rm.id === r.roomId)
      return def && def.unlockLevel > level
    })
  }, [])

  const ipGetEquippedArtifacts = useCallback((): IpArtifactEntity[] => {
    return stateRef.current.artifacts.filter((a) => a.equipped)
  }, [])

  const ipGetUnequippedArtifacts = useCallback((): IpArtifactEntity[] => {
    return stateRef.current.artifacts.filter((a) => a.owned && !a.equipped)
  }, [])

  const ipGetCreatureByDef = useCallback((creatureId: string): IpCreatureEntity | null => {
    return stateRef.current.creatures.find((c) => c.creatureId === creatureId) ?? null
  }, [])

  const ipGetSpellByDef = useCallback((spellId: string): IpSpellEntity | null => {
    return stateRef.current.spells.find((s) => s.spellId === spellId) ?? null
  }, [])

  const ipGetRoomByDef = useCallback((roomId: string): IpRoomEntity | null => {
    return stateRef.current.rooms.find((r) => r.roomId === roomId) ?? null
  }, [])

  const ipGetArtifactByDef = useCallback((artifactId: string): IpArtifactEntity | null => {
    return stateRef.current.artifacts.find((a) => a.artifactId === artifactId) ?? null
  }, [])

  const ipGetAchievementByDef = useCallback((achievementId: string): IpAchievementEntity | null => {
    return stateRef.current.achievements.find((a) => a.achievementId === achievementId) ?? null
  }, [])

  const ipGetCreaturePower = useCallback((creatureId: string): number => {
    const creature = stateRef.current.creatures.find((c) => c.creatureId === creatureId)
    if (!creature) return 0
    const def = IP_FROZEN_CREATURES.find((f) => f.id === creatureId)
    if (!def) return 0
    return def.attack + def.magic + def.defense + creature.level * 2
  }, [])

  const ipGetTopCreatures = useCallback((count: number): IpCreatureEntity[] => {
    return [...stateRef.current.creatures]
      .sort((a, b) => {
        const pa = ipGetCreaturePower(a.creatureId)
        const pb = ipGetCreaturePower(b.creatureId)
        return pb - pa
      })
      .slice(0, count)
  }, [ipGetCreaturePower])

  const ipGetMostCastSpells = useCallback((count: number): IpSpellEntity[] => {
    return [...stateRef.current.spells]
      .filter((s) => s.learned)
      .sort((a, b) => b.castCount - a.castCount)
      .slice(0, count)
  }, [])

  const ipGetLeastExploredRoom = useCallback((): IpRoomEntity | null => {
    const explored = stateRef.current.rooms.filter((r) => r.explored)
    if (explored.length === 0) return null
    return explored.sort((a, b) => a.explorationCount - b.explorationCount)[0]
  }, [])

  const ipIsNewDay = useCallback((): boolean => {
    return stateRef.current.dailyDate !== ipGetTodayKey()
  }, [])

  const ipGetBlizzardDuration = useCallback((): number => {
    if (!stateRef.current.currentBlizzard) return 0
    return stateRef.current.currentBlizzard.duration
  }, [])

  const ipGetBlizzardSeverity = useCallback((): IpBlizzardSeverity | null => {
    if (!stateRef.current.currentBlizzard) return null
    return stateRef.current.currentBlizzard.severity
  }, [])

  const ipGetBlizzardDamage = useCallback((): number => {
    if (!stateRef.current.currentBlizzard) return 0
    return stateRef.current.currentBlizzard.damage
  }, [])

  const ipGetSpellCastCount = useCallback((spellId: string): number => {
    const spell = stateRef.current.spells.find((s) => s.spellId === spellId)
    return spell ? spell.castCount : 0
  }, [])

  const ipGetSpellMastery = useCallback((spellId: string): number => {
    const spell = stateRef.current.spells.find((s) => s.spellId === spellId)
    return spell ? spell.mastery : 0
  }, [])

  const ipGetRoomSecretCount = useCallback((roomId: string): number => {
    const room = stateRef.current.rooms.find((r) => r.roomId === roomId)
    return room ? room.secretsFound : 0
  }, [])

  const ipGetArtifactPowerLevel = useCallback((artifactId: string): number => {
    const artifact = stateRef.current.artifacts.find((a) => a.artifactId === artifactId)
    return artifact ? artifact.powerLevel : 0
  }, [])

  const ipIncrementTick = useCallback(() => {
    setState((prev) => ({ ...prev, tick: prev.tick + 1 }))
  }, [])

  // === RESET (NOT wrapped in useCallback) ===

  function ipResetProgress() {
    const fresh = ipCreateDefaultState()
    setState(fresh)
    stateRef.current = fresh
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('ice-palace-save')
      } catch {
        // ignore
      }
    }
  }

  return {
    // Constants accessors
    ipGetLevel,
    ipGetXp,
    ipGetTotalXp,
    ipGetTitle,
    ipGetCreatures,
    ipGetSpells,
    ipGetRooms,
    ipGetArtifacts,
    ipGetAchievements,
    ipGetDailyCast,
    ipGetDailyDate,
    ipGetTotalFrozen,
    ipGetTotalMelted,
    ipGetBlizzardsSurvived,
    ipGetBlizzardsEncountered,
    ipGetTotalRoomsExplored,
    ipGetTotalSpellsCast,
    ipGetTotalArtifactsFound,
    ipGetTotalAchievements,
    ipGetCurrentBlizzard,
    ipGetDailyReward,
    ipGetStreak,
    ipGetBestStreak,
    ipGetSeed,
    ipGetTick,
    ipGetCreatureCount,
    ipGetLearnedSpellCount,
    ipGetExploredRoomCount,
    ipGetOwnedArtifactCount,
    ipGetEquippedArtifactCount,
    ipGetUnlockedAchievementCount,
    ipGetLegendaryCreatureCount,
    ipGetXpRequired,
    ipGetXpProgress,
    ipGetOverallProgress,
    ipGetFrozenRatio,
    ipGetTotalFrostPower,
    ipGetTotalArtifactBonus,
    // State modifiers
    ipAddXp,
    ipSetXp,
    ipSetLevel,
    ipFreezeCreature,
    ipMeltCreature,
    ipLevelUpCreature,
    ipRenameCreature,
    ipToggleCreatureFrozen,
    ipCastSpell,
    ipLearnSpell,
    ipExploreRoom,
    ipFindArtifact,
    ipEquipArtifact,
    ipUpgradeArtifact,
    ipUnlockAchievement,
    ipStartBlizzard,
    ipSurviveBlizzard,
    ipEndBlizzard,
    ipClaimDailyReward,
    ipCheckAchievements,
    ipFreezeRandomCreature,
    ipExploreRandomRoom,
    ipIncrementTick,
    // Definition accessors
    ipGetCreatureDef,
    ipGetSpellDef,
    ipGetRoomDef,
    ipGetArtifactDef,
    ipGetAchievementDef,
    ipGetRarityColor,
    ipGetRarityIcon,
    ipGetRarityName,
    // Progress getters
    ipGetCreatureXpProgress,
    ipGetSpellMasteryProgress,
    ipGetRoomExplorationProgress,
    ipGetBestiaryProgress,
    ipGetSpellbookProgress,
    ipGetArtifactProgress,
    ipGetAchievementProgress,
    // Filter getters
    ipGetCreaturesByRarity,
    ipGetSpellsBySchool,
    ipGetArtifactsBySlot,
    ipGetCreaturesByType,
    ipGetLearnedSpells,
    ipGetUnlearnedSpells,
    ipGetAvailableSpells,
    ipGetAvailableRooms,
    ipGetLockedRooms,
    ipGetEquippedArtifacts,
    ipGetUnequippedArtifacts,
    // Entity getters
    ipGetCreatureByDef,
    ipGetSpellByDef,
    ipGetRoomByDef,
    ipGetArtifactByDef,
    ipGetAchievementByDef,
    // Computed getters
    ipGetCreaturePower,
    ipGetTopCreatures,
    ipGetMostCastSpells,
    ipGetLeastExploredRoom,
    ipIsNewDay,
    ipGetBlizzardDuration,
    ipGetBlizzardSeverity,
    ipGetBlizzardDamage,
    ipGetSpellCastCount,
    ipGetSpellMastery,
    ipGetRoomSecretCount,
    ipGetArtifactPowerLevel,
    // Reset (plain function)
    ipResetProgress,
  }
}

// === HELPER (module-level) ===

function ipGetPreviousDayKey(todayKey: string): string {
  const parts = todayKey.split('-').map(Number)
  const d = new Date(parts[0], parts[1] - 1, parts[2])
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}
