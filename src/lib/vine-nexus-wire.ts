/**
 * Vine Nexus Wire — 藤蔓枢纽 (Vine Nexus) feature module for Word Snake
 *
 * A living network of sentient vines connecting ancient groves: recruit 35 vine
 * creatures across 7 species and 5 rarity tiers, explore 8 sacred groves,
 * collect 12 botanical materials, build 8 vine structures, master 8 vine
 * abilities, earn 8 titles, collect 6 artifacts, and face 8 wild events
 * — backed by React hooks with localStorage persistence.
 *
 * Storage key: vine-nexus-save
 * Prefix: vn / VN_
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

export type VnRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type VnSpecies =
  | 'vine_walker'
  | 'thorn_weaver'
  | 'root_singer'
  | 'bloom_guardian'
  | 'moss_spirit'
  | 'bark_golem'
  | 'seed_archon'

export type VnAction = 'grow' | 'weave' | 'bloom' | 'root' | 'pollinate' | 'entangle' | 'evolve'

export type VnResourceId =
  | 'vine_threads'
  | 'thorn_buds'
  | 'moss_spores'
  | 'bloom_petals'
  | 'root_extract'
  | 'sap_drops'
  | 'bark_shields'
  | 'seed_pods'
  | 'nectar_jars'
  | 'chlorophyll_orbs'
  | 'pollen_clouds'
  | 'ancient_wood'

export interface VnSpeciesDef {
  readonly id: VnSpecies
  readonly name: string
  readonly description: string
  readonly lore: string
  readonly emoji: string
  readonly color: string
  readonly passiveAbility: string
  readonly combatBonus: string
}

export interface VnCreatureDef {
  readonly id: string
  readonly name: string
  readonly species: VnSpecies
  readonly rarity: VnRarity
  readonly description: string
  readonly lore: string
  readonly emoji: string
  readonly power: number
  readonly defense: number
  readonly cost: number
  readonly xpReward: number
}

export interface VnChamberDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly lore: string
  readonly emoji: string
  readonly level: number
  readonly resources: VnResourceId[]
  readonly capacity: number
  readonly unlockLevel: number
  readonly ambientColor: string
  readonly dangerLevel: number
}

export interface VnMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: VnRarity
  readonly description: string
  readonly sourceChamber: string
  readonly value: number
  readonly craftBonus: number
}

export interface VnStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly maxLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly effectPerLevel: number
  readonly requiredLevel: number
}

export interface VnAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly action: VnAction
  readonly rarity: VnRarity
  readonly cooldown: number
  readonly power: number
  readonly cost: number
  readonly requiredLevel: number
}

export interface VnAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly conditionKey: string
  readonly targetValue: number
  readonly rewardCoins: number
  readonly rewardXp: number
}

export interface VnTitleDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly requiredLevel: number
  readonly description: string
}

export interface VnArtifactDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: VnRarity
  readonly description: string
  readonly lore: string
  readonly powerBonus: number
  readonly defenseBonus: number
  readonly specialEffect: string
}

export interface VnEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly duration: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly requiredLevel: number
}

export interface VnCreatureState {
  owned: boolean
  count: number
  level: number
  xp: number
  acquiredAt: number | null
}

export interface VnChamberState {
  explored: boolean
  level: number
  gatherCount: number
  creaturesFound: number
  unlockedAt: number | null
}

export interface VnStructureState {
  level: number
  builtAt: number | null
}

export interface VnAbilityState {
  learned: boolean
  castCount: number
  cooldownEnd: number
}

export interface VnArtifactState {
  collected: boolean
  collectedAt: number | null
}

export interface VnAchievementState {
  unlocked: boolean
  unlockedAt: number | null
}

export interface VnEventState {
  activeEventId: string | null
  eventEnd: number
  eventsCompleted: number
}

export interface VnTotals {
  totalGrown: number
  totalWoven: number
  totalBloomed: number
  totalRooted: number
  totalPollinated: number
  totalEntangled: number
  totalEvolved: number
  totalCreaturesFound: number
  totalMaterialsGathered: number
  totalStructuresBuilt: number
  totalAbilitiesCast: number
  totalEventsCompleted: number
}

export interface VnResourceState {
  vine_threads: number
  thorn_buds: number
  moss_spores: number
  bloom_petals: number
  root_extract: number
  sap_drops: number
  bark_shields: number
  seed_pods: number
  nectar_jars: number
  chlorophyll_orbs: number
  pollen_clouds: number
  ancient_wood: number
}

export interface VineNexusState {
  vnLevel: number
  vnXp: number
  vnCoins: number
  vnResources: VnResourceState
  creatures: Record<string, VnCreatureState>
  chambers: Record<string, VnChamberState>
  structures: Record<string, VnStructureState>
  abilities: Record<string, VnAbilityState>
  artifacts: Record<string, VnArtifactState>
  achievements: Record<string, VnAchievementState>
  eventState: VnEventState
  totals: VnTotals
  vnSeed: number
  vnActiveChamber: string | null
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: VN_ CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const VN_MAX_LEVEL = 50
export const VN_SAVE_KEY = 'vine-nexus-save'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const VN_VINE_GREEN = '#228B22'
export const VN_THORN_BROWN = '#8B4513'
export const VN_BLOOM_PINK = '#FF69B4'
export const VN_ROOT_BROWN = '#654321'
export const VN_MOSS_LIME = '#32CD32'
export const VN_PETAL_PURPLE = '#9370DB'
export const VN_NECTAR_GOLD = '#FFD700'

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: VN_SPECIES — 7 Species
// ═══════════════════════════════════════════════════════════════════

export const VN_SPECIES: readonly VnSpeciesDef[] = [
  {
    id: 'vine_walker',
    name: 'Vine Walker',
    description: 'Agile creatures that stride along living vines, traversing the canopy with supernatural grace.',
    lore: 'Born when the first seedling wrapped its tendril around a sleeping forest spirit, Vine Walkers have patrolled the nexus for eons, carrying messages between the oldest groves.',
    emoji: '🌿',
    color: VN_VINE_GREEN,
    passiveAbility: 'Canopy Sprint — moves 30% faster on vine-covered terrain',
    combatBonus: '+10% evasion in groves with active vine bridges',
  },
  {
    id: 'thorn_weaver',
    name: 'Thorn Weaver',
    description: 'Masters of defensive vine manipulation who weave living thorn barriers around the groves.',
    lore: 'Legends say the first Thorn Weaver learned their craft from a wounded dragon whose scales grew into thorned vines. Their barriers have never been breached.',
    emoji: '🦔',
    color: VN_THORN_BROWN,
    passiveAbility: 'Thorn Fortress — creates thorn walls that deal 15% damage to attackers',
    combatBonus: '+20% defense when rooted in place',
  },
  {
    id: 'root_singer',
    name: 'Root Singer',
    description: 'Enchanting beings whose songs travel through underground root networks, communicating with all plant life.',
    lore: 'Root Singers emerged from the deepest layers of the earth, where ancient root systems connect every forest on the planet. Their songs can wake dormant seeds or put trees to sleep.',
    emoji: '🎵',
    color: VN_ROOT_BROWN,
    passiveAbility: 'Deep Chorus — heals all creatures in the grove by 5% per turn',
    combatBonus: '+15% healing power to allied creatures',
  },
  {
    id: 'bloom_guardian',
    name: 'Bloom Guardian',
    description: 'Majestic protectors who command flowering vines to create dazzling displays that blind and disorient foes.',
    lore: 'When the Vine Nexus was young and vulnerable, a single bloom opened at its center that was so radiant it blinded an invading army for seven days. That bloom became the first Guardian.',
    emoji: '🌸',
    color: VN_BLOOM_PINK,
    passiveAbility: 'Petal Storm — 10% chance to stun attackers with blinding petals',
    combatBonus: '+12% power during bloom season events',
  },
  {
    id: 'moss_spirit',
    name: 'Moss Spirit',
    description: 'Ethereal beings formed from ancient moss that sustain the life force of every grove in the nexus.',
    lore: 'Moss Spirits are the oldest consciousness in the Vine Nexus. They predate the first tree and remember when the world was nothing but water and stone. Their patience is infinite.',
    emoji: '🌱',
    color: VN_MOSS_LIME,
    passiveAbility: 'Living Carpet — regenerates 3 HP per turn for all nearby allies',
    combatBonus: '+8% resource generation in moss-rich chambers',
  },
  {
    id: 'bark_golem',
    name: 'Bark Golem',
    description: 'Massive constructs of living bark and vine that serve as the heavy defenders of the nexus.',
    lore: 'Carved by the Seed Archons from the heartwood of the World Vine, Bark Golems are the ultimate expression of the nexus\'s will to survive. Each one contains the soul of a fallen protector.',
    emoji: '🪵',
    color: VN_ROOT_BROWN,
    passiveAbility: 'Iron Bark — reduces all incoming damage by 25% when stationary',
    combatBonus: '+30% defense but -10% movement speed',
  },
  {
    id: 'seed_archon',
    name: 'Seed Archon',
    description: 'Cosmic beings that carry the primordial seeds of creation, capable of growing entire groves from nothing.',
    lore: 'Seed Archons descended from the stars in seeds of pure light. When they planted themselves in the earth, the Vine Nexus sprang into existence. They are the architects of all plant life.',
    emoji: '✨',
    color: VN_NECTAR_GOLD,
    passiveAbility: 'Genesis Bloom — can instantly grow a new vine node anywhere',
    combatBonus: '+20% to all action success rates',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: VN_CREATURES — 35 Creatures (5 per rarity × 7 species)
// ═══════════════════════════════════════════════════════════════════

export const VN_CREATURES: readonly VnCreatureDef[] = [
  // ── Common (5) ──────────────────────────────────────────────────
  {
    id: 'cr_tendril_runner',
    name: 'Tendril Runner',
    species: 'vine_walker',
    rarity: 'common',
    description: 'A swift young vine walker that sprints along tendrils with boundless energy.',
    lore: 'Tendril Runners are the messengers of the Vine Nexus, darting between groves before the dew has settled.',
    emoji: '🏃',
    power: 12,
    defense: 8,
    cost: 50,
    xpReward: 10,
  },
  {
    id: 'cr_bramble_kit',
    name: 'Bramble Kit',
    species: 'thorn_weaver',
    rarity: 'common',
    description: 'A young thorn weaver whose thorn barriers are just beginning to form.',
    lore: 'Bramble Kits practice weaving by tangling morning glory vines around sticks, building tiny fortresses.',
    emoji: '🦔',
    power: 10,
    defense: 14,
    cost: 55,
    xpReward: 10,
  },
  {
    id: 'cr_mossling',
    name: 'Mossling',
    species: 'moss_spirit',
    rarity: 'common',
    description: 'A tiny spirit of moss that drifts on the breeze, leaving trails of green.',
    lore: 'Mosslings are born from raindrops falling on ancient moss. They are the purest expression of renewal.',
    emoji: '🌿',
    power: 8,
    defense: 10,
    cost: 40,
    xpReward: 8,
  },
  {
    id: 'cr_barkling',
    name: 'Barkling',
    species: 'bark_golem',
    rarity: 'common',
    description: 'A small golem of sapling bark, loyal but slow and endearingly clumsy.',
    lore: 'Barklings often trip over their own root-feet, but they always get back up. Their determination is legendary.',
    emoji: '🪵',
    power: 14,
    defense: 12,
    cost: 60,
    xpReward: 12,
  },
  {
    id: 'cr_seedling_scout',
    name: 'Seedling Scout',
    species: 'seed_archon',
    rarity: 'common',
    description: 'A tiny archon that rides on dandelion seeds, scouting new locations to plant.',
    lore: 'Seedling Scouts choose where new groves will grow. Their decisions shape the Vine Nexus for centuries.',
    emoji: '🌱',
    power: 10,
    defense: 8,
    cost: 45,
    xpReward: 10,
  },
  {
    id: 'cr_root_humming',
    name: 'Root Hummer',
    species: 'root_singer',
    rarity: 'common',
    description: 'A young root singer whose gentle humming makes the soil vibrate with life.',
    lore: 'Root Hummers are the youngest root singers, barely able to produce a note. Yet even their faintest hum nurtures the earth beneath them.',
    emoji: '🎶',
    power: 9,
    defense: 11,
    cost: 48,
    xpReward: 9,
  },
  {
    id: 'cr_petal_sprite',
    name: 'Petal Sprite',
    species: 'bloom_guardian',
    rarity: 'common',
    description: 'A tiny guardian surrounded by a halo of falling petals that shimmer in light.',
    lore: 'Petal Sprites are born when the first bloom of spring opens. They protect young flowers from frost and pests until the season ends.',
    emoji: '🌸',
    power: 11,
    defense: 9,
    cost: 52,
    xpReward: 11,
  },

  // ── Uncommon (7) ───────────────────────────────────────────────
  {
    id: 'un_canopy_dancer',
    name: 'Canopy Dancer',
    species: 'vine_walker',
    rarity: 'uncommon',
    description: 'A vine walker that performs acrobatic dances on the highest vine bridges.',
    lore: 'Canopy Dancers train for decades to master the aerial vine ballet. Their movements are so fluid they seem to defy gravity.',
    emoji: '💃',
    power: 24,
    defense: 16,
    cost: 200,
    xpReward: 25,
  },
  {
    id: 'un_thorn_artist',
    name: 'Thorn Artist',
    species: 'thorn_weaver',
    rarity: 'uncommon',
    description: 'A skilled thorn weaver who shapes thorns into intricate defensive patterns.',
    lore: 'The Thorn Artist\'s creations are considered the highest form of art in the Vine Nexus. Each thorn spiral tells a story.',
    emoji: '🎨',
    power: 20,
    defense: 28,
    cost: 220,
    xpReward: 28,
  },
  {
    id: 'un_root_chorister',
    name: 'Root Chorister',
    species: 'root_singer',
    rarity: 'uncommon',
    description: 'A root singer whose harmonies accelerate root growth and strengthen the earth.',
    lore: 'Root Choristers sing in frequencies that only plants can hear. Underground, entire root networks hum in response.',
    emoji: '🎤',
    power: 22,
    defense: 20,
    cost: 210,
    xpReward: 26,
  },
  {
    id: 'un_bloom_herald',
    name: 'Bloom Herald',
    species: 'bloom_guardian',
    rarity: 'uncommon',
    description: 'A bloom guardian that announces the changing seasons with bursts of petals.',
    lore: 'When a Bloom Herald opens its petals, every flower in the grove blooms simultaneously. It is a sight of breathtaking beauty.',
    emoji: '🌺',
    power: 26,
    defense: 18,
    cost: 230,
    xpReward: 28,
  },
  {
    id: 'un_moss_warden',
    name: 'Moss Warden',
    species: 'moss_spirit',
    rarity: 'uncommon',
    description: 'A moss spirit that has grown large enough to tend entire moss gardens.',
    lore: 'Moss Wardens can sense the health of every plant within a mile. They are the first to know when something is wrong.',
    emoji: '🛡️',
    power: 18,
    defense: 26,
    cost: 215,
    xpReward: 27,
  },
  {
    id: 'un_bark_crafter',
    name: 'Bark Crafter',
    species: 'bark_golem',
    rarity: 'uncommon',
    description: 'A skilled golem that crafts tools and weapons from living bark with rough precision.',
    lore: 'Bark Crafters shape wood as a potter shapes clay. Their creations are crude but incredibly durable, growing stronger with each passing year.',
    emoji: '⚒️',
    power: 25,
    defense: 22,
    cost: 225,
    xpReward: 28,
  },
  {
    id: 'un_seed_herald',
    name: 'Seed Herald',
    species: 'seed_archon',
    rarity: 'uncommon',
    description: 'An archon that carries seeds of exotic plants from distant worlds in its luminous cloak.',
    lore: 'Seed Heralds travel between the Vine Nexus and alien forests on the wind, exchanging seeds and genetic material across worlds.',
    emoji: '🌍',
    power: 23,
    defense: 18,
    cost: 235,
    xpReward: 30,
  },

  // ── Rare (7) ───────────────────────────────────────────────────
  {
    id: 'ra_vine_phantom',
    name: 'Vine Phantom',
    species: 'vine_walker',
    rarity: 'rare',
    description: 'A vine walker so fast they become invisible, appearing as a blur of green.',
    lore: 'Vine Phantoms have achieved perfect unity with the vine network. They exist simultaneously in every grove connected by vines.',
    emoji: '👻',
    power: 45,
    defense: 30,
    cost: 800,
    xpReward: 55,
  },
  {
    id: 'ra_thorn_monarch',
    name: 'Thorn Monarch',
    species: 'thorn_weaver',
    rarity: 'rare',
    description: 'The ruler of all thorn weavers, commanding armies of living thorn barriers.',
    lore: 'The Thorn Monarch\'s crown is made of the sharpest thorns in existence. To touch it is to understand the true meaning of defense.',
    emoji: '👑',
    power: 40,
    defense: 55,
    cost: 900,
    xpReward: 60,
  },
  {
    id: 'ra_deeproot_sage',
    name: 'Deeproot Sage',
    species: 'root_singer',
    rarity: 'rare',
    description: 'An ancient root singer whose songs reach the deepest roots of the World Vine.',
    lore: 'The Deeproot Sage has sung to the roots beneath mountains. Their voice can crack stone or mend it, depending on the melody.',
    emoji: '🧙',
    power: 48,
    defense: 38,
    cost: 850,
    xpReward: 58,
  },
  {
    id: 'ra_bloom_commander',
    name: 'Bloom Commander',
    species: 'bloom_guardian',
    rarity: 'rare',
    description: 'A bloom guardian that leads floral armies into battle with devastating petal storms.',
    lore: 'The Bloom Commander\'s petal armies have never lost a battle. Each petal carries the essence of a thousand flowers.',
    emoji: '⚔️',
    power: 52,
    defense: 35,
    cost: 880,
    xpReward: 58,
  },
  {
    id: 'ra_bark_titan',
    name: 'Bark Titan',
    species: 'bark_golem',
    rarity: 'rare',
    description: 'A massive bark golem the size of a small hill, with roots that reach deep underground.',
    lore: 'Bark Titans are so old they have become part of the landscape. Villages have been built on their shoulders without anyone noticing.',
    emoji: '🗿',
    power: 50,
    defense: 60,
    cost: 950,
    xpReward: 65,
  },
  {
    id: 'ra_moss_ancient',
    name: 'Moss Ancient',
    species: 'moss_spirit',
    rarity: 'rare',
    description: 'A moss spirit so old it has developed sapience, sharing memories with every moss it touches.',
    lore: 'Moss Ancients recall events from before the Vine Nexus existed. They speak in slow, rumbling sentences that take hours to complete.',
    emoji: '🌿',
    power: 38,
    defense: 50,
    cost: 870,
    xpReward: 62,
  },
  {
    id: 'ra_seed_crystal',
    name: 'Seed Crystal',
    species: 'seed_archon',
    rarity: 'rare',
    description: 'An archon whose body has crystallized around a primordial seed, radiating creation energy.',
    lore: 'Seed Crystals are archons who have absorbed too much creation energy. Their bodies become living crystals that pulse with the rhythm of growth.',
    emoji: '💎',
    power: 42,
    defense: 45,
    cost: 920,
    xpReward: 63,
  },

  // ── Epic (7) ───────────────────────────────────────────────────
  {
    id: 'ep_nexus_stalker',
    name: 'Nexus Stalker',
    species: 'vine_walker',
    rarity: 'epic',
    description: 'The supreme vine walker who stalks the nexus network, defending all groves simultaneously.',
    lore: 'The Nexus Stalker exists everywhere and nowhere. They patrol every vine bridge at once, striking from shadows that move like living tendrils.',
    emoji: '🕸️',
    power: 85,
    defense: 55,
    cost: 3500,
    xpReward: 130,
  },
  {
    id: 'ep_thorn_overlord',
    name: 'Thorn Overlord',
    species: 'thorn_weaver',
    rarity: 'epic',
    description: 'A thorn weaver who commands an impenetrable fortress of living thorns and steel vines.',
    lore: 'The Thorn Overlord\'s fortress has withstood sieges from armies of stone giants. No weapon has ever pierced its thorn walls.',
    emoji: '🏰',
    power: 75,
    defense: 95,
    cost: 3800,
    xpReward: 135,
  },
  {
    id: 'ep_earthquake_bard',
    name: 'Earthquake Bard',
    species: 'root_singer',
    rarity: 'epic',
    description: 'A root singer whose bass notes can trigger controlled earthquakes to reshape terrain.',
    lore: 'The Earthquake Bard once split a mountain in two with a single sustained note. The two halves now serve as the gates of the nexus.',
    emoji: '🎸',
    power: 90,
    defense: 65,
    cost: 3600,
    xpReward: 128,
  },
  {
    id: 'ep_bloom_phoenix',
    name: 'Bloom Phoenix',
    species: 'bloom_guardian',
    rarity: 'epic',
    description: 'A bloom guardian that rises from its own petals, more powerful each time it blooms.',
    lore: 'The Bloom Phoenix dies and is reborn with each season. Its final bloom is said to be so beautiful that witnessing it grants eternal youth.',
    emoji: '🔥',
    power: 95,
    defense: 60,
    cost: 3700,
    xpReward: 132,
  },
  {
    id: 'ep_ancient_moss_spirit',
    name: 'Ancient Moss Spirit',
    species: 'moss_spirit',
    rarity: 'epic',
    description: 'A moss spirit as old as the Vine Nexus itself, containing the memories of all groves.',
    lore: 'The Ancient Moss Spirit remembers the first sunrise and the first rain. It carries the genetic code of every plant that has ever lived.',
    emoji: '🌿',
    power: 70,
    defense: 85,
    cost: 3900,
    xpReward: 138,
  },
  {
    id: 'ep_bark_leviathan',
    name: 'Bark Leviathan',
    species: 'bark_golem',
    rarity: 'epic',
    description: 'A colossal bark golem that awakens only when the Vine Nexus faces existential threat.',
    lore: 'The Bark Leviathan sleeps beneath the Heart of Nexus, dreaming of battles past. When it wakes, the ground trembles for a hundred miles in every direction.',
    emoji: '🦕',
    power: 88,
    defense: 100,
    cost: 4000,
    xpReward: 140,
  },
  {
    id: 'ep_seed_nova',
    name: 'Seed Nova',
    species: 'seed_archon',
    rarity: 'epic',
    description: 'An archon about to detonate in a supernova of creation energy, spawning new life forms.',
    lore: 'Seed Novas are archons at the peak of their power. When they release their energy, entirely new species are born in the resulting explosion of life.',
    emoji: '💫',
    power: 92,
    defense: 70,
    cost: 4100,
    xpReward: 142,
  },

  // ── Legendary (7) ──────────────────────────────────────────────
  {
    id: 'lg_eternal_vine_sovereign',
    name: 'Eternal Vine Sovereign',
    species: 'vine_walker',
    rarity: 'legendary',
    description: 'The immortal ruler of all vine paths, capable of walking between any two points in the nexus instantly.',
    lore: 'The Eternal Vine Sovereign IS the Vine Nexus. Every vine, every root, every tendril is an extension of their consciousness. They have existed since the first plant took root on earth.',
    emoji: '👑',
    power: 150,
    defense: 110,
    cost: 15000,
    xpReward: 350,
  },
  {
    id: 'lg_world_thorn_colossus',
    name: 'World Thorn Colossus',
    species: 'thorn_weaver',
    rarity: 'legendary',
    description: 'A colossus wrapped in thorns so sharp they can cut through dimensions.',
    lore: 'The World Thorn Colossus guards the boundary between the Vine Nexus and the void beyond. Its thorns form an unbreakable cage around reality itself.',
    emoji: '⚔️',
    power: 140,
    defense: 160,
    cost: 16000,
    xpReward: 380,
  },
  {
    id: 'lg_primordial_root',
    name: 'Primordial Root',
    species: 'root_singer',
    rarity: 'legendary',
    description: 'The original root from which all plant life descended, whose song created the world.',
    lore: 'Before the world existed, the Primordial Root sang. Its song shaped mountains, carved rivers, and planted the seeds of every forest. It still dreams beneath the center of the earth.',
    emoji: '🌍',
    power: 160,
    defense: 120,
    cost: 17000,
    xpReward: 400,
  },
  {
    id: 'lg_eternal_bloom',
    name: 'Eternal Bloom',
    species: 'bloom_guardian',
    rarity: 'legendary',
    description: 'A flower that never wilts, whose petals contain the light of every dawn since time began.',
    lore: 'The Eternal Bloom was the first thing to exist. Its light pushed back the primordial darkness and made space for life. It will be the last thing to exist, its final petal falling at the end of time.',
    emoji: '🌺',
    power: 145,
    defense: 130,
    cost: 15500,
    xpReward: 360,
  },
  {
    id: 'lg_seed_of_creation',
    name: 'Seed of Creation',
    species: 'seed_archon',
    rarity: 'legendary',
    description: 'The primordial seed that contains the blueprint for all life in the universe.',
    lore: 'The Seed of Creation fell from a dying star billions of years ago. When it struck the earth, every plant, every tree, every flower sprang into existence from its infinite potential.',
    emoji: '✨',
    power: 200,
    defense: 100,
    cost: 20000,
    xpReward: 500,
  },
  {
    id: 'lg_moss_worldmind',
    name: 'Moss Worldmind',
    species: 'moss_spirit',
    rarity: 'legendary',
    description: 'A planetary consciousness formed from the combined awareness of all moss on earth.',
    lore: 'The Moss Worldmind is the collective intelligence of every moss colony on the planet. It thinks in geological time, processing a single thought over millennia.',
    emoji: '🧠',
    power: 135,
    defense: 155,
    cost: 16500,
    xpReward: 370,
  },
  {
    id: 'lg_bark_warden_prime',
    name: 'Bark Warden Prime',
    species: 'bark_golem',
    rarity: 'legendary',
    description: 'The original bark golem, forged by the Seed Archons before time began, indestructible and eternal.',
    lore: 'The Bark Warden Prime has stood guard since the dawn of creation. It has never moved, never rested, never wavered. Nothing has ever passed it.',
    emoji: '🗿',
    power: 155,
    defense: 175,
    cost: 18000,
    xpReward: 400,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: VN_CHAMBERS — 8 Groves
// ═══════════════════════════════════════════════════════════════════

export const VN_CHAMBERS: readonly VnChamberDef[] = [
  {
    id: 'whispering_canopy',
    name: 'Whispering Canopy',
    description: 'A sun-dappled grove where vines murmur secrets of the forest to those who listen.',
    lore: 'The Whispering Canopy is where all vine walkers begin their training. The vines here speak in gentle whispers, teaching patience and awareness to those who walk among them.',
    emoji: '🌿',
    level: 1,
    resources: ['vine_threads', 'sap_drops', 'moss_spores'],
    capacity: 5,
    unlockLevel: 1,
    ambientColor: VN_VINE_GREEN,
    dangerLevel: 1,
  },
  {
    id: 'thorn_bastion',
    name: 'Thorn Bastion',
    description: 'A formidable grove of interlocking thorn vines that forms a natural fortress.',
    lore: 'The Thorn Bastion was grown in a single night by the First Thorn Weaver to protect the nexus from a flood of shadow creatures. Its thorns have only grown sharper since.',
    emoji: '🛡️',
    level: 2,
    resources: ['thorn_buds', 'bark_shields', 'vine_threads'],
    capacity: 6,
    unlockLevel: 5,
    ambientColor: VN_THORN_BROWN,
    dangerLevel: 2,
  },
  {
    id: 'root_cathedral',
    name: 'Root Cathedral',
    description: 'A vast underground chamber where ancient roots form cathedral-like arches.',
    lore: 'Beneath the oldest oak in the nexus lies the Root Cathedral. Its root arches are so large that entire ecosystems exist within their hollows, lit by bioluminescent fungi.',
    emoji: '🏛️',
    level: 3,
    resources: ['root_extract', 'ancient_wood', 'sap_drops'],
    capacity: 7,
    unlockLevel: 10,
    ambientColor: VN_ROOT_BROWN,
    dangerLevel: 3,
  },
  {
    id: 'petal_sanctum',
    name: 'Petal Sanctum',
    description: 'A grove perpetually filled with floating flower petals that glow with soft light.',
    lore: 'The Petal Sanctum blooms eternally. Its petals drift upward instead of falling, filling the air with a kaleidoscope of color. Bloom Guardians consider it sacred ground.',
    emoji: '🌸',
    level: 4,
    resources: ['bloom_petals', 'nectar_jars', 'chlorophyll_orbs'],
    capacity: 8,
    unlockLevel: 15,
    ambientColor: VN_BLOOM_PINK,
    dangerLevel: 4,
  },
  {
    id: 'moss_grotto',
    name: 'Moss Grotto',
    description: 'A humid grotto blanketed in layers of luminous moss of every shade of green.',
    lore: 'The Moss Grotto is the oldest chamber in the Vine Nexus. Its moss has been growing for so long that it has developed its own collective intelligence, pulsing with knowledge.',
    emoji: '🌱',
    level: 5,
    resources: ['moss_spores', 'chlorophyll_orbs', 'pollen_clouds'],
    capacity: 8,
    unlockLevel: 20,
    ambientColor: VN_MOSS_LIME,
    dangerLevel: 5,
  },
  {
    id: 'iron_bark_coliseum',
    name: 'Iron Bark Coliseum',
    description: 'A massive arena formed from petrified bark where vine creatures test their strength.',
    lore: 'The Iron Bark Coliseum was carved from a single ancient tree by the Bark Golems. Its walls have absorbed so much combat energy that they glow faintly during battles.',
    emoji: '🏟️',
    level: 6,
    resources: ['bark_shields', 'ancient_wood', 'thorn_buds'],
    capacity: 9,
    unlockLevel: 28,
    ambientColor: VN_ROOT_BROWN,
    dangerLevel: 6,
  },
  {
    id: 'starlight_arboretum',
    name: 'Starlight Arboretum',
    description: 'An arboretum where bioluminescent vines capture starlight and release it as golden glow.',
    lore: 'Seed Archons planted this arboretum as a gift to the Vine Nexus. At night, its vines capture starlight and redistribute it, making the entire grove shimmer like a field of fallen stars.',
    emoji: '✨',
    level: 7,
    resources: ['nectar_jars', 'chlorophyll_orbs', 'seed_pods'],
    capacity: 10,
    unlockLevel: 36,
    ambientColor: VN_NECTAR_GOLD,
    dangerLevel: 7,
  },
  {
    id: 'heart_of_nexus',
    name: 'Heart of Nexus',
    description: 'The central chamber where all vine networks converge. The source of all vine magic.',
    lore: 'At the exact center of the Vine Nexus beats the Heart — a massive, pulsating vine node that connects to every root, every tendril, every flower in existence. To stand here is to feel the heartbeat of all plant life.',
    emoji: '💜',
    level: 8,
    resources: ['seed_pods', 'pollen_clouds', 'ancient_wood', 'nectar_jars'],
    capacity: 12,
    unlockLevel: 45,
    ambientColor: VN_PETAL_PURPLE,
    dangerLevel: 8,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: VN_MATERIALS — 12 Materials
// ═══════════════════════════════════════════════════════════════════

export const VN_MATERIALS: readonly VnMaterialDef[] = [
  {
    id: 'mat_vine_thread',
    name: 'Vine Thread',
    emoji: '🧵',
    rarity: 'common',
    description: 'Strong, flexible threads harvested from living vines. Essential for weaving and crafting.',
    sourceChamber: 'whispering_canopy',
    value: 10,
    craftBonus: 2,
  },
  {
    id: 'mat_thorn_bud',
    name: 'Thorn Bud',
    emoji: '🥀',
    rarity: 'common',
    description: 'Unopened thorn buds that can be cultivated into defensive barriers when planted.',
    sourceChamber: 'thorn_bastion',
    value: 12,
    craftBonus: 3,
  },
  {
    id: 'mat_moss_spore',
    name: 'Moss Spore',
    emoji: '🍄',
    rarity: 'common',
    description: 'Spores from ancient moss that accelerate plant growth when scattered.',
    sourceChamber: 'moss_grotto',
    value: 8,
    craftBonus: 2,
  },
  {
    id: 'mat_bloom_petal',
    name: 'Bloom Petal',
    emoji: '🌺',
    rarity: 'common',
    description: 'Iridescent petals from the eternal blooms, used in potions and enchantments.',
    sourceChamber: 'petal_sanctum',
    value: 15,
    craftBonus: 4,
  },
  {
    id: 'mat_root_extract',
    name: 'Root Extract',
    emoji: '🧪',
    rarity: 'uncommon',
    description: 'Concentrated essence from deep roots that grants temporary earth magic affinity.',
    sourceChamber: 'root_cathedral',
    value: 80,
    craftBonus: 10,
  },
  {
    id: 'mat_sap_drop',
    name: 'Golden Sap Drop',
    emoji: '🍯',
    rarity: 'common',
    description: 'Sweet, golden sap from the World Vine that heals wounds and restores energy.',
    sourceChamber: 'whispering_canopy',
    value: 18,
    craftBonus: 5,
  },
  {
    id: 'mat_bark_shield',
    name: 'Bark Shield Fragment',
    emoji: '🛡️',
    rarity: 'uncommon',
    description: 'A shard of petrified bark from the Iron Bark Coliseum. Exceptionally durable.',
    sourceChamber: 'iron_bark_coliseum',
    value: 90,
    craftBonus: 12,
  },
  {
    id: 'mat_seed_pod',
    name: 'Starlight Seed Pod',
    emoji: '🌱',
    rarity: 'rare',
    description: 'A pod that glows with captured starlight. Contains seeds that grow into luminous plants.',
    sourceChamber: 'starlight_arboretum',
    value: 350,
    craftBonus: 30,
  },
  {
    id: 'mat_nectar_jar',
    name: 'Archon Nectar',
    emoji: '🍯',
    rarity: 'rare',
    description: 'Nectar harvested from archon-tended flowers. Grants visions of the vine network.',
    sourceChamber: 'petal_sanctum',
    value: 300,
    craftBonus: 25,
  },
  {
    id: 'mat_chlorophyll_orb',
    name: 'Chlorophyll Orb',
    emoji: '💚',
    rarity: 'uncommon',
    description: 'A concentrated sphere of pure chlorophyll energy that boosts photosynthesis.',
    sourceChamber: 'moss_grotto',
    value: 75,
    craftBonus: 8,
  },
  {
    id: 'mat_pollen_cloud',
    name: 'Pollen Cloud Essence',
    emoji: '🌤️',
    rarity: 'epic',
    description: 'Captured pollen from every flower in the nexus. Contains the genetic memory of all blooms.',
    sourceChamber: 'heart_of_nexus',
    value: 1500,
    craftBonus: 80,
  },
  {
    id: 'mat_ancient_wood',
    name: 'Ancient Heartwood',
    emoji: '🪵',
    rarity: 'epic',
    description: 'Wood from the absolute center of the World Vine. Indestructible and pulsating with power.',
    sourceChamber: 'root_cathedral',
    value: 1800,
    craftBonus: 100,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: VN_STRUCTURES — 8 Structures
// ═══════════════════════════════════════════════════════════════════

export const VN_STRUCTURES: readonly VnStructureDef[] = [
  {
    id: 'str_vine_bridge',
    name: 'Vine Bridge',
    emoji: '🌉',
    description: 'A living bridge of interwoven vines connecting groves for faster travel.',
    maxLevel: 10,
    baseCost: 100,
    costMultiplier: 1.5,
    effectPerLevel: 5,
    requiredLevel: 1,
  },
  {
    id: 'str_thorn_wall',
    name: 'Thorn Wall',
    emoji: '🧱',
    description: 'A defensive barrier of living thorn vines that damages and slows intruders.',
    maxLevel: 10,
    baseCost: 200,
    costMultiplier: 1.6,
    effectPerLevel: 8,
    requiredLevel: 5,
  },
  {
    id: 'str_root_well',
    name: 'Root Well',
    emoji: '🕳️',
    description: 'A deep well of root extract that generates resources passively over time.',
    maxLevel: 10,
    baseCost: 300,
    costMultiplier: 1.6,
    effectPerLevel: 10,
    requiredLevel: 10,
  },
  {
    id: 'str_bloom_greenhouse',
    name: 'Bloom Greenhouse',
    emoji: '🏡',
    description: 'A greenhouse that accelerates plant growth and increases material yields.',
    maxLevel: 10,
    baseCost: 500,
    costMultiplier: 1.7,
    effectPerLevel: 12,
    requiredLevel: 15,
  },
  {
    id: 'str_moss_shrine',
    name: 'Moss Shrine',
    emoji: '⛩️',
    description: 'A sacred shrine of ancient moss that boosts creature regeneration and healing.',
    maxLevel: 10,
    baseCost: 800,
    costMultiplier: 1.7,
    effectPerLevel: 15,
    requiredLevel: 20,
  },
  {
    id: 'str_bark_forge',
    name: 'Bark Forge',
    emoji: '🔨',
    description: 'A forge fueled by petrified bark that crafts powerful vine equipment.',
    maxLevel: 10,
    baseCost: 1200,
    costMultiplier: 1.8,
    effectPerLevel: 18,
    requiredLevel: 28,
  },
  {
    id: 'str_seed_vault',
    name: 'Seed Vault',
    emoji: '🏦',
    description: 'A secure vault storing rare seeds and genetic material from all vine species.',
    maxLevel: 10,
    baseCost: 2000,
    costMultiplier: 1.8,
    effectPerLevel: 22,
    requiredLevel: 36,
  },
  {
    id: 'str_nexus_core',
    name: 'Nexus Core',
    emoji: '💎',
    description: 'The ultimate structure that amplifies all vine network abilities by a massive margin.',
    maxLevel: 10,
    baseCost: 5000,
    costMultiplier: 2.0,
    effectPerLevel: 30,
    requiredLevel: 45,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: VN_ABILITIES — 8 Abilities
// ═══════════════════════════════════════════════════════════════════

export const VN_ABILITIES: readonly VnAbilityDef[] = [
  {
    id: 'abl_vine_growth',
    name: 'Vine Growth',
    emoji: '🌱',
    description: 'Accelerate vine growth in a target area, creating new pathways and resources.',
    action: 'grow',
    rarity: 'common',
    cooldown: 10,
    power: 20,
    cost: 15,
    requiredLevel: 1,
  },
  {
    id: 'abl_thorn_weave',
    name: 'Thorn Weave',
    emoji: '🕸️',
    description: 'Weave a complex thorn barrier around an area for devastating defensive power.',
    action: 'weave',
    rarity: 'common',
    cooldown: 15,
    power: 25,
    cost: 20,
    requiredLevel: 1,
  },
  {
    id: 'abl_mass_bloom',
    name: 'Mass Bloom',
    emoji: '🌸',
    description: 'Trigger simultaneous blooming across the entire nexus, blinding enemies and healing allies.',
    action: 'bloom',
    rarity: 'uncommon',
    cooldown: 30,
    power: 40,
    cost: 50,
    requiredLevel: 8,
  },
  {
    id: 'abl_deep_root',
    name: 'Deep Root',
    emoji: '🧲',
    description: 'Send roots deep into the earth, draining energy from enemies and strengthening allies.',
    action: 'root',
    rarity: 'uncommon',
    cooldown: 25,
    power: 35,
    cost: 45,
    requiredLevel: 10,
  },
  {
    id: 'abl_pollen_storm',
    name: 'Pollen Storm',
    emoji: '🌤️',
    description: 'Release a massive cloud of enchanted pollen that disorients foes and buffs allies.',
    action: 'pollinate',
    rarity: 'rare',
    cooldown: 45,
    power: 60,
    cost: 100,
    requiredLevel: 18,
  },
  {
    id: 'abl_entangle',
    name: 'Entangle',
    emoji: '🐍',
    description: 'Command vines to entangle and immobilize all enemies in a large area.',
    action: 'entangle',
    rarity: 'rare',
    cooldown: 40,
    power: 55,
    cost: 90,
    requiredLevel: 20,
  },
  {
    id: 'abl_nexus_evolution',
    name: 'Nexus Evolution',
    emoji: '🧬',
    description: 'Trigger rapid evolution in all vine creatures, temporarily boosting all stats.',
    action: 'evolve',
    rarity: 'epic',
    cooldown: 120,
    power: 100,
    cost: 300,
    requiredLevel: 35,
  },
  {
    id: 'abl_world_vine_awakening',
    name: 'World Vine Awakening',
    emoji: '🌍',
    description: 'Awaken the World Vine itself, unleashing cataclysmic vine growth across the entire battlefield.',
    action: 'grow',
    rarity: 'legendary',
    cooldown: 300,
    power: 200,
    cost: 800,
    requiredLevel: 45,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: VN_ACHIEVEMENTS — 10 Achievements
// ═══════════════════════════════════════════════════════════════════

export const VN_ACHIEVEMENTS: readonly VnAchievementDef[] = [
  {
    id: 'ach_first_roots',
    name: 'First Roots',
    emoji: '🌱',
    description: 'Discover your first creature in the Vine Nexus.',
    conditionKey: 'totalCreaturesFound',
    targetValue: 1,
    rewardCoins: 50,
    rewardXp: 25,
  },
  {
    id: 'ach_green_thumb',
    name: 'Green Thumb',
    emoji: '🌿',
    description: 'Grow vines 100 times across the nexus.',
    conditionKey: 'totalGrown',
    targetValue: 100,
    rewardCoins: 200,
    rewardXp: 100,
  },
  {
    id: 'ach_thorn_master',
    name: 'Thorn Master',
    emoji: '🦔',
    description: 'Weave thorn barriers 50 times.',
    conditionKey: 'totalWoven',
    targetValue: 50,
    rewardCoins: 300,
    rewardXp: 150,
  },
  {
    id: 'ach_bloom_season',
    name: 'Bloom Season',
    emoji: '🌸',
    description: 'Trigger mass blooms 25 times.',
    conditionKey: 'totalBloomed',
    targetValue: 25,
    rewardCoins: 350,
    rewardXp: 175,
  },
  {
    id: 'ach_deep_rooted',
    name: 'Deep Rooted',
    emoji: '🧲',
    description: 'Use root abilities 30 times to strengthen the earth.',
    conditionKey: 'totalRooted',
    targetValue: 30,
    rewardCoins: 400,
    rewardXp: 200,
  },
  {
    id: 'ach_pollinator',
    name: 'Master Pollinator',
    emoji: '🐝',
    description: 'Pollinate the nexus 40 times to spread life.',
    conditionKey: 'totalPollinated',
    targetValue: 40,
    rewardCoins: 450,
    rewardXp: 225,
  },
  {
    id: 'ach_collector',
    name: 'Nexus Collector',
    emoji: '📦',
    description: 'Gather 200 materials from the chambers.',
    conditionKey: 'totalMaterialsGathered',
    targetValue: 200,
    rewardCoins: 500,
    rewardXp: 250,
  },
  {
    id: 'ach_architect',
    name: 'Vine Architect',
    emoji: '🏗️',
    description: 'Build all 8 structures to at least level 5.',
    conditionKey: 'totalStructuresBuilt',
    targetValue: 8,
    rewardCoins: 1000,
    rewardXp: 500,
  },
  {
    id: 'ach_full_nexus',
    name: 'Full Nexus',
    emoji: '🌍',
    description: 'Discover 30 different creatures across all species.',
    conditionKey: 'totalCreaturesFound',
    targetValue: 30,
    rewardCoins: 2000,
    rewardXp: 1000,
  },
  {
    id: 'ch_eternal_guardian',
    name: 'Eternal Guardian',
    emoji: '👑',
    description: 'Reach the maximum level and complete 50 events.',
    conditionKey: 'totalEventsCompleted',
    targetValue: 50,
    rewardCoins: 5000,
    rewardXp: 2500,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: VN_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const VN_TITLES: readonly VnTitleDef[] = [
  {
    id: 'title_seedling',
    name: 'Seedling Tender',
    emoji: '🌱',
    requiredLevel: 1,
    description: 'A new caretaker learning the ways of the Vine Nexus.',
  },
  {
    id: 'title_sprout',
    name: 'Vine Sprout',
    emoji: '🌿',
    requiredLevel: 6,
    description: 'Your first tendrils are reaching toward the canopy.',
  },
  {
    id: 'title_cultivator',
    name: 'Root Cultivator',
    emoji: '🧑‍🌾',
    requiredLevel: 12,
    description: 'You nurture the deep roots that sustain the nexus.',
  },
  {
    id: 'title_weaver',
    name: 'Thorn Weaver',
    emoji: '🕸️',
    requiredLevel: 18,
    description: 'Your thorn barriers protect the outer groves from harm.',
  },
  {
    id: 'title_bloomkeeper',
    name: 'Bloom Keeper',
    emoji: '🌸',
    requiredLevel: 24,
    description: 'You tend the eternal blooms that light the Vine Nexus.',
  },
  {
    id: 'title_guardian',
    name: 'Grove Guardian',
    emoji: '🛡️',
    requiredLevel: 32,
    description: 'The chambers trust you with their deepest secrets.',
  },
  {
    id: 'title_archon',
    name: 'Vine Archon',
    emoji: '✨',
    requiredLevel: 40,
    description: 'You command the vine network with archon-like authority.',
  },
  {
    id: 'title_sovereign',
    name: 'Nexus Sovereign',
    emoji: '👑',
    requiredLevel: 50,
    description: 'Master of the Vine Nexus — all roots answer to you.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: VN_ARTIFACTS — 6 Artifacts
// ═══════════════════════════════════════════════════════════════════

export const VN_ARTIFACTS: readonly VnArtifactDef[] = [
  {
    id: 'art_world_vine_fragment',
    name: 'World Vine Fragment',
    emoji: '🌿',
    rarity: 'rare',
    description: 'A shard of the World Vine that pulses with the heartbeat of the nexus.',
    lore: 'This fragment was broken from the World Vine during the First Sundering. It still remembers the song of creation.',
    powerBonus: 25,
    defenseBonus: 15,
    specialEffect: 'Grants passive HP regeneration in all chambers',
  },
  {
    id: 'art_thorn_crown',
    name: 'Thorn Crown',
    emoji: '👑',
    rarity: 'epic',
    description: 'A crown of living thorns that grows to fit its wearer, granting thorn mastery.',
    lore: 'Worn by the First Thorn Weaver, this crown has been passed down through generations. Each thorn contains a defensive enchantment.',
    powerBonus: 20,
    defenseBonus: 50,
    specialEffect: '+30% thorn barrier effectiveness',
  },
  {
    id: 'art_ancient_moss_heart',
    name: 'Ancient Moss Heart',
    emoji: '💚',
    rarity: 'epic',
    description: 'The crystallized heart of the oldest moss spirit, containing millennia of memories.',
    lore: 'When held, the bearer can hear the whispers of every plant that has ever lived. Its knowledge is infinite.',
    powerBonus: 35,
    defenseBonus: 30,
    specialEffect: '+50% material gathering yield',
  },
  {
    id: 'art_eternal_seed',
    name: 'Eternal Seed',
    emoji: '🌱',
    rarity: 'legendary',
    description: 'A seed that never decays, containing the potential for infinite growth.',
    lore: 'The Eternal Seed is one of seven seeds that fell from the heavens. Each one created a Vine Nexus on a different world.',
    powerBonus: 60,
    defenseBonus: 40,
    specialEffect: 'Auto-grows vine nodes in explored chambers',
  },
  {
    id: 'art_root_singers_staff',
    name: "Root Singer's Staff",
    emoji: '🎵',
    rarity: 'rare',
    description: 'A staff carved from a singing root that amplifies root singer abilities.',
    lore: 'The staff hums constantly with the deep song of the earth. When planted, it creates a zone of enhanced root growth.',
    powerBonus: 30,
    defenseBonus: 20,
    specialEffect: '+25% healing ability power',
  },
  {
    id: 'art_nexus_core_shard',
    name: 'Nexus Core Shard',
    emoji: '💎',
    rarity: 'legendary',
    description: 'A fragment of the Heart of Nexus itself. Unimaginably powerful and dangerous.',
    lore: 'The Nexus Core Shard is the most powerful artifact in existence. To wield it is to control the entire Vine Nexus. Few have survived the attempt.',
    powerBonus: 100,
    defenseBonus: 80,
    specialEffect: 'All creature stats doubled in Heart of Nexus',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: VN_EVENTS — 8 Events
// ═══════════════════════════════════════════════════════════════════

export const VN_EVENTS: readonly VnEventDef[] = [
  {
    id: 'evt_bloom_festival',
    name: 'Bloom Festival',
    emoji: '🌸',
    description: 'All flowers in the nexus bloom simultaneously, creating a spectacular display of color and light.',
    duration: 300,
    effectType: 'buff',
    effectDescription: '+50% bloom petal yield for the duration',
    requiredLevel: 1,
  },
  {
    id: 'evt_thorn_surge',
    name: 'Thorn Surge',
    emoji: '🦔',
    description: 'A surge of wild energy causes thorn vines to grow uncontrollably, threatening the groves.',
    duration: 180,
    effectType: 'debuff',
    effectDescription: '-25% movement speed in all chambers, but +20% defense',
    requiredLevel: 5,
  },
  {
    id: 'evt_root_quake',
    name: 'Root Quake',
    emoji: '🌍',
    description: 'Deep roots shift beneath the earth, reshaping the underground network.',
    duration: 240,
    effectType: 'special',
    effectDescription: 'Random chambers may reveal hidden resources or creatures',
    requiredLevel: 10,
  },
  {
    id: 'evt_moss_spread',
    name: 'Moss Spread',
    emoji: '🌿',
    description: 'Ancient moss expands rapidly, covering every surface with lush green growth.',
    duration: 300,
    effectType: 'buff',
    effectDescription: '+40% moss spore yield and +15% creature healing',
    requiredLevel: 15,
  },
  {
    id: 'evt_seed_storm',
    name: 'Seed Storm',
    emoji: '🌬️',
    description: 'A whirlwind of enchanted seeds sweeps through the nexus, planting new growth everywhere.',
    duration: 200,
    effectType: 'buff',
    effectDescription: '+60% seed pod yield, chance of discovering rare creatures',
    requiredLevel: 20,
  },
  {
    id: 'evt_vine_withering',
    name: 'Vine Withering',
    emoji: '🍂',
    description: 'A mysterious blight causes some vines to wither, testing the resilience of the nexus.',
    duration: 180,
    effectType: 'debuff',
    effectDescription: '-30% vine thread yield, but +50% root extract from surviving roots',
    requiredLevel: 28,
  },
  {
    id: 'evt_nectar_rain',
    name: 'Nectar Rain',
    emoji: '🍯',
    description: 'Golden nectar falls from the sky like rain, enriching all plants it touches.',
    duration: 250,
    effectType: 'buff',
    effectDescription: '+70% nectar jar yield and +20% XP from all actions',
    requiredLevel: 36,
  },
  {
    id: 'evt_nexus_awakening',
    name: 'Nexus Awakening',
    emoji: '✨',
    description: 'The Heart of Nexus pulses with immense power, awakening dormant abilities in all creatures.',
    duration: 360,
    effectType: 'special',
    effectDescription: 'All creature power and defense increased by 25%, legendary creature encounters doubled',
    requiredLevel: 45,
  },
]

// ═══════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════

function vnXpRequired(level: number): number {
  if (level <= 0) return 0
  if (level >= VN_MAX_LEVEL) return Infinity
  return Math.floor(100 * level * (1 + level * 0.12))
}

function vnClampLevel(lvl: number): number {
  return Math.max(1, Math.min(VN_MAX_LEVEL, lvl))
}

function vnClampCoins(c: number): number {
  return Math.max(0, Math.floor(c))
}

function vnRarityMultiplier(r: VnRarity): number {
  const map: Record<VnRarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2.2,
    epic: 3.5,
    legendary: 6,
  }
  return map[r] ?? 1
}

function vnRarityColor(r: VnRarity): string {
  switch (r) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#34D399'
    case 'rare': return '#60A5FA'
    case 'epic': return '#A78BFA'
    case 'legendary': return '#FBBF24'
  }
}

function vnSpeciesColor(s: VnSpecies): string {
  const species = VN_SPECIES.find(sp => sp.id === s)
  return species?.color ?? VN_VINE_GREEN
}

function vnCreateResourceState(): VnResourceState {
  return {
    vine_threads: 0,
    thorn_buds: 0,
    moss_spores: 0,
    bloom_petals: 0,
    root_extract: 0,
    sap_drops: 0,
    bark_shields: 0,
    seed_pods: 0,
    nectar_jars: 0,
    chlorophyll_orbs: 0,
    pollen_clouds: 0,
    ancient_wood: 0,
  }
}

function vnCreateCreatureStateMap(): Record<string, VnCreatureState> {
  const map: Record<string, VnCreatureState> = {}
  for (const c of VN_CREATURES) {
    map[c.id] = { owned: false, count: 0, level: 1, xp: 0, acquiredAt: null }
  }
  return map
}

function vnCreateChamberStateMap(): Record<string, VnChamberState> {
  const map: Record<string, VnChamberState> = {}
  for (const ch of VN_CHAMBERS) {
    map[ch.id] = { explored: false, level: 1, gatherCount: 0, creaturesFound: 0, unlockedAt: null }
  }
  return map
}

function vnCreateStructureStateMap(): Record<string, VnStructureState> {
  const map: Record<string, VnStructureState> = {}
  for (const s of VN_STRUCTURES) {
    map[s.id] = { level: 0, builtAt: null }
  }
  return map
}

function vnCreateAbilityStateMap(): Record<string, VnAbilityState> {
  const map: Record<string, VnAbilityState> = {}
  for (const a of VN_ABILITIES) {
    map[a.id] = { learned: false, castCount: 0, cooldownEnd: 0 }
  }
  return map
}

function vnCreateArtifactStateMap(): Record<string, VnArtifactState> {
  const map: Record<string, VnArtifactState> = {}
  for (const ar of VN_ARTIFACTS) {
    map[ar.id] = { collected: false, collectedAt: null }
  }
  return map
}

function vnCreateAchievementStateMap(): Record<string, VnAchievementState> {
  const map: Record<string, VnAchievementState> = {}
  for (const ach of VN_ACHIEVEMENTS) {
    map[ach.id] = { unlocked: false, unlockedAt: null }
  }
  return map
}

function vnCreateInitialState(seed?: number): VineNexusState {
  return {
    vnLevel: 1,
    vnXp: 0,
    vnCoins: 500,
    vnResources: vnCreateResourceState(),
    creatures: vnCreateCreatureStateMap(),
    chambers: vnCreateChamberStateMap(),
    structures: vnCreateStructureStateMap(),
    abilities: vnCreateAbilityStateMap(),
    artifacts: vnCreateArtifactStateMap(),
    achievements: vnCreateAchievementStateMap(),
    eventState: { activeEventId: null, eventEnd: 0, eventsCompleted: 0 },
    totals: {
      totalGrown: 0,
      totalWoven: 0,
      totalBloomed: 0,
      totalRooted: 0,
      totalPollinated: 0,
      totalEntangled: 0,
      totalEvolved: 0,
      totalCreaturesFound: 0,
      totalMaterialsGathered: 0,
      totalStructuresBuilt: 0,
      totalAbilitiesCast: 0,
      totalEventsCompleted: 0,
    },
    vnSeed: seed ?? Date.now(),
    vnActiveChamber: null,
  }
}

function vnLoadState(): VineNexusState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(VN_SAVE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as VineNexusState
  } catch {
    return null
  }
}

function vnSaveState(state: VineNexusState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(VN_SAVE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage errors
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: MAIN HOOK — useVineNexus
// ═══════════════════════════════════════════════════════════════════

export default function useVineNexus() {
  const [state, setState] = useState<VineNexusState>(() => {
    const saved = vnLoadState()
    return saved ?? vnCreateInitialState()
  })

  const stateRef = useRef(state)

  // Sync stateRef inside useEffect (NOT during render)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Persist to localStorage on state changes
  useEffect(() => {
    vnSaveState(state)
  }, [state])

  // ─── Constants on API ──────────────────────────────────────────

  const VN_SPECIES_RO = useMemo(() => VN_SPECIES, [])
  const VN_CREATURES_RO = useMemo(() => VN_CREATURES, [])
  const VN_CHAMBERS_RO = useMemo(() => VN_CHAMBERS, [])
  const VN_MATERIALS_RO = useMemo(() => VN_MATERIALS, [])
  const VN_STRUCTURES_RO = useMemo(() => VN_STRUCTURES, [])
  const VN_ABILITIES_RO = useMemo(() => VN_ABILITIES, [])
  const VN_ACHIEVEMENTS_RO = useMemo(() => VN_ACHIEVEMENTS, [])
  const VN_TITLES_RO = useMemo(() => VN_TITLES, [])
  const VN_ARTIFACTS_RO = useMemo(() => VN_ARTIFACTS, [])
  const VN_EVENTS_RO = useMemo(() => VN_EVENTS, [])

  // ─── Core State ────────────────────────────────────────────────

  const vnGetState = useCallback((): Readonly<VineNexusState> => {
    return Object.freeze({ ...state })
  }, [state])

  const vnResetState = useCallback(() => {
    const s = vnCreateInitialState()
    setState(s)
  }, [])

  // ─── Level / XP ────────────────────────────────────────────────

  const vnGetLevel = useCallback((): number => state.vnLevel, [state.vnLevel])

  const vnGetXp = useCallback((): number => state.vnXp, [state.vnXp])

  const vnGetXpTillNext = useCallback((): number => vnXpRequired(state.vnLevel), [state.vnLevel])

  const vnAddXp = useCallback((amount: number) => {
    let next = state
    setState((prev) => {
      let lvl = prev.vnLevel
      let xp = prev.vnXp + Math.floor(amount)
      while (lvl < VN_MAX_LEVEL && xp >= vnXpRequired(lvl)) {
        xp -= vnXpRequired(lvl)
        lvl += 1
      }
      if (lvl >= VN_MAX_LEVEL) xp = 0
      next = { ...prev, vnLevel: vnClampLevel(lvl), vnXp: xp }
      return next
    })
    return next
  }, [state])

  const vnGetProgress = useCallback((): number => {
    const needed = vnXpRequired(state.vnLevel)
    if (needed === Infinity) return 1
    if (needed <= 0) return 0
    return Math.min(1, state.vnXp / needed)
  }, [state.vnXp, state.vnLevel])

  const vnGetOverallProgress = useCallback((): number => state.vnLevel / VN_MAX_LEVEL, [state.vnLevel])

  // ─── Coins ─────────────────────────────────────────────────────

  const vnGetCoins = useCallback((): number => state.vnCoins, [state.vnCoins])

  const vnAddCoins = useCallback((amount: number) => {
    let next = state
    setState((prev) => {
      next = { ...prev, vnCoins: vnClampCoins(prev.vnCoins + amount) }
      return next
    })
    return next
  }, [state])

  const vnSpendCoins = useCallback((amount: number): { success: boolean; state: VineNexusState } => {
    if (state.vnCoins < amount) return { success: false, state }
    let next = state
    setState((prev) => {
      next = { ...prev, vnCoins: vnClampCoins(prev.vnCoins - amount) }
      return next
    })
    return { success: true, state: next }
  }, [state])

  const vnCanAfford = useCallback((amount: number): boolean => state.vnCoins >= amount, [state.vnCoins])

  // ─── Resources ─────────────────────────────────────────────────

  const vnGetResources = useCallback((): Readonly<VnResourceState> => ({ ...state.vnResources }), [state.vnResources])

  const vnGetResource = useCallback((resourceId: VnResourceId): number => state.vnResources[resourceId] ?? 0, [state.vnResources])

  const vnAddResource = useCallback((resourceId: VnResourceId, amount: number) => {
    let next = state
    setState((prev) => {
      next = {
        ...prev,
        vnResources: { ...prev.vnResources, [resourceId]: Math.max(0, (prev.vnResources[resourceId] ?? 0) + amount) },
      }
      return next
    })
    return next
  }, [state])

  const vnSpendResource = useCallback((resourceId: VnResourceId, amount: number): boolean => {
    const current = state.vnResources[resourceId] ?? 0
    if (current < amount) return false
    setState((prev) => ({
      ...prev,
      vnResources: { ...prev.vnResources, [resourceId]: Math.max(0, current - amount) },
    }))
    return true
  }, [state.vnResources])

  // ─── Title ─────────────────────────────────────────────────────

  const vnGetTitle = useCallback((): VnTitleDef => {
    let current = VN_TITLES[0]
    for (const t of VN_TITLES) {
      if (state.vnLevel >= t.requiredLevel) current = t
    }
    return current
  }, [state.vnLevel])

  const vnGetNextTitle = useCallback((): VnTitleDef | null => {
    for (const t of VN_TITLES) {
      if (state.vnLevel < t.requiredLevel) return t
    }
    return null
  }, [state.vnLevel])

  // ─── Creatures ─────────────────────────────────────────────────

  const vnGetCreatures = useCallback((): readonly VnCreatureDef[] => VN_CREATURES_RO, [VN_CREATURES_RO])

  const vnGetCreatureById = useCallback((id: string): VnCreatureDef | null => VN_CREATURES.find((c) => c.id === id) ?? null, [])

  const vnGetOwnedCreatures = useCallback((): VnCreatureDef[] => VN_CREATURES.filter((c) => state.creatures[c.id]?.owned), [state.creatures])

  const vnGetCreaturesBySpecies = useCallback((species: VnSpecies): VnCreatureDef[] => VN_CREATURES.filter((c) => c.species === species), [])

  const vnGetCreaturesByRarity = useCallback((rarity: VnRarity): VnCreatureDef[] => VN_CREATURES.filter((c) => c.rarity === rarity), [])

  const vnDiscoverCreature = useCallback((creatureId: string): { success: boolean; state: VineNexusState } => {
    const def = VN_CREATURES.find((c) => c.id === creatureId)
    if (!def) return { success: false, state }
    if (state.vnCoins < def.cost) return { success: false, state }
    let next = state
    setState((prev) => {
      const existing = prev.creatures[creatureId]
      if (!existing) return prev
      const wasNew = !existing.owned
      next = {
        ...prev,
        vnCoins: vnClampCoins(prev.vnCoins - def.cost),
        creatures: {
          ...prev.creatures,
          [creatureId]: { ...existing, owned: true, count: existing.count + 1, acquiredAt: Date.now() },
        },
        totals: {
          ...prev.totals,
          totalCreaturesFound: prev.totals.totalCreaturesFound + (wasNew ? 1 : 0),
        },
      }
      return next
    })
    vnAddXp(def.xpReward)
    return { success: true, state: next }
  }, [state, vnAddXp])

  const vnGetCreatureState = useCallback((creatureId: string): VnCreatureState | null => state.creatures[creatureId] ?? null, [state.creatures])

  const vnGetCreatureCount = useCallback((): number => VN_CREATURES.filter((c) => state.creatures[c.id]?.owned).length, [state.creatures])

  // ─── Chambers ──────────────────────────────────────────────────

  const vnGetChambers = useCallback((): readonly VnChamberDef[] => VN_CHAMBERS_RO, [VN_CHAMBERS_RO])

  const vnGetChamberById = useCallback((id: string): VnChamberDef | null => VN_CHAMBERS.find((ch) => ch.id === id) ?? null, [])

  const vnExploreChamber = useCallback((chamberId: string): { success: boolean; state: VineNexusState } => {
    const def = VN_CHAMBERS.find((ch) => ch.id === chamberId)
    if (!def) return { success: false, state }
    if (state.vnLevel < def.unlockLevel) return { success: false, state }
    if (state.chambers[chamberId]?.explored) return { success: false, state }
    let next = state
    setState((prev) => {
      const chState = prev.chambers[chamberId]
      if (!chState) return prev
      next = {
        ...prev,
        chambers: { ...prev.chambers, [chamberId]: { ...chState, explored: true, unlockedAt: Date.now() } },
      }
      return next
    })
    return { success: true, state: next }
  }, [state])

  const vnIsChamberExplored = useCallback((chamberId: string): boolean => state.chambers[chamberId]?.explored ?? false, [state.chambers])

  const vnGetExploredChambers = useCallback((): VnChamberDef[] => VN_CHAMBERS.filter((ch) => state.chambers[ch.id]?.explored), [state.chambers])

  const vnSetActiveChamber = useCallback((chamberId: string | null) => {
    setState((prev) => ({ ...prev, vnActiveChamber: chamberId }))
  }, [])

  const vnGetActiveChamber = useCallback((): string | null => state.vnActiveChamber, [state.vnActiveChamber])

  const vnGatherInChamber = useCallback((chamberId: string): { success: boolean; gathered: { resourceId: VnResourceId; amount: number }[]; state: VineNexusState } => {
    const def = VN_CHAMBERS.find((ch) => ch.id === chamberId)
    if (!def) return { success: false, gathered: [], state }
    const chState = state.chambers[chamberId]
    if (!chState || !chState.explored) return { success: false, gathered: [], state }

    const baseRate = 0.6 + chState.level * 0.03
    const eventBoost = state.eventState.activeEventId === 'evt_moss_spread' ? 1.4 : 1
    const structureBoost = Object.entries(state.structures)
      .filter(([, s]) => s.level > 0)
      .reduce((sum, [sid, s]) => {
        const sd = VN_STRUCTURES.find((st) => st.id === sid)
        return sum + (sd?.effectPerLevel ?? 0) * s.level * 0.01
      }, 0)
    const finalRate = Math.min(1, baseRate * eventBoost + structureBoost)

    const gathered: { resourceId: VnResourceId; amount: number }[] = []
    let next = state

    setState((prev) => {
      const newResources = { ...prev.vnResources }
      let totalMat = prev.totals.totalMaterialsGathered

      for (const resId of def.resources) {
        if (Math.random() <= finalRate) {
          const amount = 1 + Math.floor(Math.random() * 2)
          newResources[resId] = (newResources[resId] ?? 0) + amount
          gathered.push({ resourceId: resId, amount })
          totalMat += amount
        }
      }

      next = {
        ...prev,
        vnResources: newResources,
        chambers: {
          ...prev.chambers,
          [chamberId]: { ...prev.chambers[chamberId], gatherCount: prev.chambers[chamberId].gatherCount + 1 },
        },
        totals: { ...prev.totals, totalMaterialsGathered: totalMat },
      }
      return next
    })

    return { success: true, gathered, state: next }
  }, [state])

  const vnUpgradeChamber = useCallback((chamberId: string): { success: boolean; state: VineNexusState } => {
    const def = VN_CHAMBERS.find((ch) => ch.id === chamberId)
    if (!def) return { success: false, state }
    const chState = state.chambers[chamberId]
    if (!chState || !chState.explored) return { success: false, state }
    const cost = 200 * chState.level
    if (state.vnCoins < cost) return { success: false, state }
    let next = state
    setState((prev) => {
      next = {
        ...prev,
        vnCoins: vnClampCoins(prev.vnCoins - cost),
        chambers: { ...prev.chambers, [chamberId]: { ...prev.chambers[chamberId], level: prev.chambers[chamberId].level + 1 } },
      }
      return next
    })
    return { success: true, state: next }
  }, [state])

  // ─── Materials ─────────────────────────────────────────────────

  const vnGetMaterials = useCallback((): readonly VnMaterialDef[] => VN_MATERIALS_RO, [VN_MATERIALS_RO])

  const vnGetMaterialById = useCallback((id: string): VnMaterialDef | null => VN_MATERIALS.find((m) => m.id === id) ?? null, [])

  const vnGetMaterialsByRarity = useCallback((rarity: VnRarity): VnMaterialDef[] => VN_MATERIALS.filter((m) => m.rarity === rarity), [])

  const vnGetMaterialsByChamber = useCallback((chamberId: string): VnMaterialDef[] => VN_MATERIALS.filter((m) => m.sourceChamber === chamberId), [])

  // ─── Structures ────────────────────────────────────────────────

  const vnGetStructures = useCallback((): readonly VnStructureDef[] => VN_STRUCTURES_RO, [VN_STRUCTURES_RO])

  const vnGetStructureById = useCallback((id: string): VnStructureDef | null => VN_STRUCTURES.find((s) => s.id === id) ?? null, [])

  const vnBuildStructure = useCallback((structureId: string): { success: boolean; state: VineNexusState } => {
    const def = VN_STRUCTURES.find((s) => s.id === structureId)
    if (!def) return { success: false, state }
    if (state.vnLevel < def.requiredLevel) return { success: false, state }
    const sState = state.structures[structureId]
    if (!sState) return { success: false, state }

    const isBuilding = sState.level === 0
    const currentLevel = isBuilding ? 0 : sState.level
    const cost = Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
    if (state.vnCoins < cost) return { success: false, state }

    let next = state
    setState((prev) => {
      const prevS = prev.structures[structureId]
      if (!prevS) return prev
      const newLevel = prevS.level + 1
      next = {
        ...prev,
        vnCoins: vnClampCoins(prev.vnCoins - cost),
        structures: { ...prev.structures, [structureId]: { level: newLevel, builtAt: prevS.builtAt ?? Date.now() } },
        totals: {
          ...prev.totals,
          totalStructuresBuilt: prev.totals.totalStructuresBuilt + (isBuilding ? 1 : 0),
        },
      }
      return next
    })
    return { success: true, state: next }
  }, [state])

  const vnGetStructureLevel = useCallback((structureId: string): number => state.structures[structureId]?.level ?? 0, [state.structures])

  const vnGetStructureUpgradeCost = useCallback((structureId: string): number => {
    const def = VN_STRUCTURES.find((s) => s.id === structureId)
    if (!def) return 0
    const currentLevel = state.structures[structureId]?.level ?? 0
    return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
  }, [state.structures])

  const vnGetTotalStructureEffect = useCallback((): number => {
    return Object.entries(state.structures).reduce((sum, [sid, s]) => {
      const def = VN_STRUCTURES.find((d) => d.id === sid)
      return sum + (def?.effectPerLevel ?? 0) * s.level
    }, 0)
  }, [state.structures])

  const vnGetBuiltStructureCount = useCallback((): number => Object.values(state.structures).filter((s) => s.level > 0).length, [state.structures])

  // ─── Abilities ─────────────────────────────────────────────────

  const vnGetAbilities = useCallback((): readonly VnAbilityDef[] => VN_ABILITIES_RO, [VN_ABILITIES_RO])

  const vnGetAbilityById = useCallback((id: string): VnAbilityDef | null => VN_ABILITIES.find((a) => a.id === id) ?? null, [])

  const vnLearnAbility = useCallback((abilityId: string): { success: boolean; state: VineNexusState } => {
    const def = VN_ABILITIES.find((a) => a.id === abilityId)
    if (!def) return { success: false, state }
    if (state.vnLevel < def.requiredLevel) return { success: false, state }
    if (state.vnCoins < def.cost) return { success: false, state }
    if (state.abilities[abilityId]?.learned) return { success: false, state }
    let next = state
    setState((prev) => {
      const aState = prev.abilities[abilityId]
      if (!aState) return prev
      next = {
        ...prev,
        vnCoins: vnClampCoins(prev.vnCoins - def.cost),
        abilities: { ...prev.abilities, [abilityId]: { ...aState, learned: true } },
      }
      return next
    })
    vnAddXp(def.cost)
    return { success: true, state: next }
  }, [state, vnAddXp])

  const vnCastAbility = useCallback((abilityId: string): { success: boolean; state: VineNexusState } => {
    const def = VN_ABILITIES.find((a) => a.id === abilityId)
    if (!def) return { success: false, state }
    const aState = state.abilities[abilityId]
    if (!aState || !aState.learned) return { success: false, state }
    const now = Date.now()
    if (now < aState.cooldownEnd) return { success: false, state }

    let next = state
    setState((prev) => {
      const prevA = prev.abilities[abilityId]
      if (!prevA) return prev
      const totalsKey = vnActionToTotalsKey(def.action)
      next = {
        ...prev,
        abilities: { ...prev.abilities, [abilityId]: { ...prevA, castCount: prevA.castCount + 1, cooldownEnd: now + def.cooldown * 1000 } },
        totals: { ...prev.totals, [totalsKey]: (prev.totals as any)[totalsKey] + 1, totalAbilitiesCast: prev.totals.totalAbilitiesCast + 1 },
      }
      return next
    })
    vnAddXp(def.power)
    return { success: true, state: next }
  }, [state, vnAddXp])

  const vnIsAbilityLearned = useCallback((abilityId: string): boolean => state.abilities[abilityId]?.learned ?? false, [state.abilities])

  const vnGetLearnedAbilities = useCallback((): VnAbilityDef[] => VN_ABILITIES.filter((a) => state.abilities[a.id]?.learned), [state.abilities])

  const vnGetAbilityCooldown = useCallback((abilityId: string): number => {
    const aState = state.abilities[abilityId]
    if (!aState) return 0
    const remaining = aState.cooldownEnd - Date.now()
    return Math.max(0, remaining)
  }, [state.abilities])

  // ─── Achievements ──────────────────────────────────────────────

  const vnGetAchievements = useCallback((): readonly VnAchievementDef[] => VN_ACHIEVEMENTS_RO, [VN_ACHIEVEMENTS_RO])

  const vnIsAchievementUnlocked = useCallback((id: string): boolean => state.achievements[id]?.unlocked ?? false, [state.achievements])

  const vnGetUnlockedAchievements = useCallback((): VnAchievementDef[] => VN_ACHIEVEMENTS.filter((a) => state.achievements[a.id]?.unlocked), [state.achievements])

  const vnGetLockedAchievements = useCallback((): VnAchievementDef[] => VN_ACHIEVEMENTS.filter((a) => !state.achievements[a.id]?.unlocked), [state.achievements])

  const vnGetAchievementProgress = useCallback((id: string): number => {
    const ach = VN_ACHIEVEMENTS.find((a) => a.id === id)
    if (!ach) return 0
    const current = (state.totals as any)[ach.conditionKey] ?? 0
    return Math.min(1, current / ach.targetValue)
  }, [state.totals])

  // ─── Artifacts ─────────────────────────────────────────────────

  const vnGetArtifacts = useCallback((): readonly VnArtifactDef[] => VN_ARTIFACTS_RO, [VN_ARTIFACTS_RO])

  const vnGetArtifactById = useCallback((id: string): VnArtifactDef | null => VN_ARTIFACTS.find((a) => a.id === id) ?? null, [])

  const vnCollectArtifact = useCallback((artifactId: string): { success: boolean; state: VineNexusState } => {
    const def = VN_ARTIFACTS.find((a) => a.id === artifactId)
    if (!def) return { success: false, state }
    if (state.artifacts[artifactId]?.collected) return { success: false, state }
    let next = state
    setState((prev) => {
      const aState = prev.artifacts[artifactId]
      if (!aState) return prev
      next = {
        ...prev,
        artifacts: { ...prev.artifacts, [artifactId]: { ...aState, collected: true, collectedAt: Date.now() } },
      }
      return next
    })
    vnAddXp(Math.floor(def.powerBonus * vnRarityMultiplier(def.rarity)))
    return { success: true, state: next }
  }, [state, vnAddXp])

  const vnIsArtifactCollected = useCallback((artifactId: string): boolean => state.artifacts[artifactId]?.collected ?? false, [state.artifacts])

  const vnGetCollectedArtifacts = useCallback((): VnArtifactDef[] => VN_ARTIFACTS.filter((a) => state.artifacts[a.id]?.collected), [state.artifacts])

  const vnGetTotalArtifactPowerBonus = useCallback((): number => {
    return VN_ARTIFACTS.filter((a) => state.artifacts[a.id]?.collected).reduce((sum, a) => sum + a.powerBonus, 0)
  }, [state.artifacts])

  const vnGetTotalArtifactDefenseBonus = useCallback((): number => {
    return VN_ARTIFACTS.filter((a) => state.artifacts[a.id]?.collected).reduce((sum, a) => sum + a.defenseBonus, 0)
  }, [state.artifacts])

  // ─── Events ────────────────────────────────────────────────────

  const vnGetEvents = useCallback((): readonly VnEventDef[] => VN_EVENTS_RO, [VN_EVENTS_RO])

  const vnGetEventById = useCallback((id: string): VnEventDef | null => VN_EVENTS.find((e) => e.id === id) ?? null, [])

  const vnStartEvent = useCallback((eventId: string): { success: boolean; state: VineNexusState } => {
    const def = VN_EVENTS.find((e) => e.id === eventId)
    if (!def) return { success: false, state }
    if (state.vnLevel < def.requiredLevel) return { success: false, state }
    if (state.eventState.activeEventId) return { success: false, state }
    let next = state
    setState((prev) => {
      next = {
        ...prev,
        eventState: { activeEventId: eventId, eventEnd: Date.now() + def.duration * 1000, eventsCompleted: prev.eventState.eventsCompleted },
      }
      return next
    })
    return { success: true, state: next }
  }, [state])

  const vnEndEvent = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      eventState: { activeEventId: null, eventEnd: 0, eventsCompleted: prev.eventState.eventsCompleted + (prev.eventState.activeEventId ? 1 : 0) },
    }))
  }, [])

  const vnGetActiveEvent = useCallback((): VnEventDef | null => {
    if (!state.eventState.activeEventId) return null
    const now = Date.now()
    if (now >= state.eventState.eventEnd) return null
    return VN_EVENTS.find((e) => e.id === state.eventState.activeEventId) ?? null
  }, [state.eventState])

  const vnGetEventTimeRemaining = useCallback((): number => {
    if (!state.eventState.activeEventId) return 0
    return Math.max(0, state.eventState.eventEnd - Date.now())
  }, [state.eventState])

  const vnGetTotalEventsCompleted = useCallback((): number => state.eventState.eventsCompleted, [state.eventState.eventsCompleted])

  // ─── Actions ───────────────────────────────────────────────────

  const vnPerformAction = useCallback((action: VnAction): { success: boolean; xpGained: number; coinsGained: number } => {
    const baseXp = 10
    const baseCoins = 5
    const levelMult = 1 + state.vnLevel * 0.05
    const xpGained = Math.floor(baseXp * vnRarityMultiplier('common') * levelMult)
    const coinsGained = Math.floor(baseCoins * levelMult)

    let next = state
    setState((prev) => {
      const totalsKey = vnActionToTotalsKey(action)
      next = {
        ...prev,
        vnXp: prev.vnXp + xpGained,
        vnCoins: vnClampCoins(prev.vnCoins + coinsGained),
        totals: { ...prev.totals, [totalsKey]: (prev.totals as any)[totalsKey] + 1 },
      }
      return next
    })
    return { success: true, xpGained, coinsGained }
  }, [state])

  // ─── Stats / Totals ────────────────────────────────────────────

  const vnGetTotals = useCallback((): Readonly<VnTotals> => ({ ...state.totals }), [state.totals])

  const vnGetTotalCreaturesFound = useCallback((): number => state.totals.totalCreaturesFound, [state.totals])

  const vnGetTotalMaterialsGathered = useCallback((): number => state.totals.totalMaterialsGathered, [state.totals])

  const vnGetTotalAbilitiesCast = useCallback((): number => state.totals.totalAbilitiesCast, [state.totals.totalAbilitiesCast])

  const vnGetTotalActions = useCallback((): number => {
    return state.totals.totalGrown + state.totals.totalWoven + state.totals.totalBloomed +
      state.totals.totalRooted + state.totals.totalPollinated + state.totals.totalEntangled + state.totals.totalEvolved
  }, [state.totals])

  // ─── Helpers ───────────────────────────────────────────────────

  const vnRarityColorFn = useCallback((r: VnRarity): string => vnRarityColor(r), [])
  const vnSpeciesColorFn = useCallback((s: VnSpecies): string => vnSpeciesColor(s), [])
  const vnRarityMultiplierFn = useCallback((r: VnRarity): number => vnRarityMultiplier(r), [])

  // ─── Computed Values ───────────────────────────────────────────

  const currentTitle = useMemo(() => vnGetTitle(), [vnGetTitle])
  const nextTitle = useMemo(() => vnGetNextTitle(), [vnGetNextTitle])
  const xpProgress = useMemo(() => vnGetProgress(), [vnGetProgress])
  const overallProgress = useMemo(() => vnGetOverallProgress(), [vnGetOverallProgress])
  const ownedCreatureCount = useMemo(() => vnGetCreatureCount(), [vnGetCreatureCount])
  const exploredChamberCount = useMemo(() => vnGetExploredChambers().length, [vnGetExploredChambers])
  const builtStructureCount = useMemo(() => vnGetBuiltStructureCount(), [vnGetBuiltStructureCount])
  const learnedAbilityCount = useMemo(() => vnGetLearnedAbilities().length, [vnGetLearnedAbilities])
  const collectedArtifactCount = useMemo(() => vnGetCollectedArtifacts().length, [vnGetCollectedArtifacts])
  const unlockedAchievementCount = useMemo(() => vnGetUnlockedAchievements().length, [vnGetUnlockedAchievements])
  const activeEvent = useMemo(() => vnGetActiveEvent(), [vnGetActiveEvent])

  // ─── Auto-check achievements ───────────────────────────────────

  useEffect(() => {
    let changed = false
    const newAchievements = { ...state.achievements }
    for (const ach of VN_ACHIEVEMENTS) {
      const achState = newAchievements[ach.id]
      if (achState && !achState.unlocked) {
        const value = (state.totals as any)[ach.conditionKey] ?? 0
        if (value >= ach.targetValue) {
          newAchievements[ach.id] = { ...achState, unlocked: true, unlockedAt: Date.now() }
          changed = true
        }
      }
    }
    if (changed) {
      setState((prev) => ({ ...prev, achievements: newAchievements }))
    }
  }, [state.totals, state.vnLevel])

  // ─── Auto-expire events ────────────────────────────────────────

  useEffect(() => {
    if (!state.eventState.activeEventId) return
    if (Date.now() >= state.eventState.eventEnd) {
      setState((prev) => ({
        ...prev,
        eventState: { activeEventId: null, eventEnd: 0, eventsCompleted: prev.eventState.eventsCompleted + 1 },
      }))
    }
  }, [state.eventState])

  // ─── Auto level-up ─────────────────────────────────────────────

  useEffect(() => {
    if (state.vnXp >= vnXpRequired(state.vnLevel) && state.vnLevel < VN_MAX_LEVEL) {
      setState((prev) => {
        let lvl = prev.vnLevel
        let xp = prev.vnXp
        while (lvl < VN_MAX_LEVEL && xp >= vnXpRequired(lvl)) {
          xp -= vnXpRequired(lvl)
          lvl += 1
        }
        if (lvl >= VN_MAX_LEVEL) xp = 0
        if (lvl === prev.vnLevel) return prev
        return { ...prev, vnLevel: vnClampLevel(lvl), vnXp: xp }
      })
    }
  }, [state.vnXp, state.vnLevel])

  // ─── Persist Config ────────────────────────────────────────────

  const vnPersistConfig = useMemo(() => ({
    name: VN_SAVE_KEY,
    version: 1,
  }), [])

  // ============================================================
  // Return Object
  // ============================================================

  return {
    // Constants
    VN_SPECIES: VN_SPECIES_RO,
    VN_CREATURES: VN_CREATURES_RO,
    VN_CHAMBERS: VN_CHAMBERS_RO,
    VN_MATERIALS: VN_MATERIALS_RO,
    VN_STRUCTURES: VN_STRUCTURES_RO,
    VN_ABILITIES: VN_ABILITIES_RO,
    VN_ACHIEVEMENTS: VN_ACHIEVEMENTS_RO,
    VN_TITLES: VN_TITLES_RO,
    VN_ARTIFACTS: VN_ARTIFACTS_RO,
    VN_EVENTS: VN_EVENTS_RO,

    // Color Constants
    VN_VINE_GREEN,
    VN_THORN_BROWN,
    VN_BLOOM_PINK,
    VN_ROOT_BROWN,
    VN_MOSS_LIME,
    VN_PETAL_PURPLE,
    VN_NECTAR_GOLD,

    // Core Constants
    VN_MAX_LEVEL,
    VN_SAVE_KEY,

    // Core State
    vnGetState,
    vnResetState,

    // Level / XP
    vnGetLevel,
    vnGetXp,
    vnGetXpTillNext,
    vnAddXp,

    // Progress
    vnGetProgress,
    vnGetOverallProgress,

    // Coins
    vnGetCoins,
    vnAddCoins,
    vnSpendCoins,
    vnCanAfford,

    // Resources
    vnGetResources,
    vnGetResource,
    vnAddResource,
    vnSpendResource,

    // Title
    vnGetTitle,
    vnGetNextTitle,

    // Creatures
    vnGetCreatures,
    vnGetCreatureById,
    vnGetOwnedCreatures,
    vnGetCreaturesBySpecies,
    vnGetCreaturesByRarity,
    vnDiscoverCreature,
    vnGetCreatureState,
    vnGetCreatureCount,

    // Chambers
    vnGetChambers,
    vnGetChamberById,
    vnExploreChamber,
    vnIsChamberExplored,
    vnGetExploredChambers,
    vnSetActiveChamber,
    vnGetActiveChamber,
    vnGatherInChamber,
    vnUpgradeChamber,

    // Materials
    vnGetMaterials,
    vnGetMaterialById,
    vnGetMaterialsByRarity,
    vnGetMaterialsByChamber,

    // Structures
    vnGetStructures,
    vnGetStructureById,
    vnBuildStructure,
    vnGetStructureLevel,
    vnGetStructureUpgradeCost,
    vnGetTotalStructureEffect,
    vnGetBuiltStructureCount,

    // Abilities
    vnGetAbilities,
    vnGetAbilityById,
    vnLearnAbility,
    vnCastAbility,
    vnIsAbilityLearned,
    vnGetLearnedAbilities,
    vnGetAbilityCooldown,

    // Achievements
    vnGetAchievements,
    vnIsAchievementUnlocked,
    vnGetUnlockedAchievements,
    vnGetLockedAchievements,
    vnGetAchievementProgress,

    // Artifacts
    vnGetArtifacts,
    vnGetArtifactById,
    vnCollectArtifact,
    vnIsArtifactCollected,
    vnGetCollectedArtifacts,
    vnGetTotalArtifactPowerBonus,
    vnGetTotalArtifactDefenseBonus,

    // Events
    vnGetEvents,
    vnGetEventById,
    vnStartEvent,
    vnEndEvent,
    vnGetActiveEvent,
    vnGetEventTimeRemaining,
    vnGetTotalEventsCompleted,

    // Actions
    vnPerformAction,

    // Stats
    vnGetTotals,
    vnGetTotalCreaturesFound,
    vnGetTotalMaterialsGathered,
    vnGetTotalAbilitiesCast,
    vnGetTotalActions,

    // Helpers
    vnRarityColor: vnRarityColorFn,
    vnSpeciesColor: vnSpeciesColorFn,
    vnRarityMultiplier: vnRarityMultiplierFn,

    // Persist Config
    vnPersistConfig,

    // Computed Values
    currentTitle,
    nextTitle,
    xpProgress,
    overallProgress,
    ownedCreatureCount,
    exploredChamberCount,
    builtStructureCount,
    learnedAbilityCount,
    collectedArtifactCount,
    unlockedAchievementCount,
    activeEvent,
  }
}

// ═══════════════════════════════════════════════════════════════════
// INTERNAL: Action to Totals Key Mapping
// ═══════════════════════════════════════════════════════════════════

function vnActionToTotalsKey(action: VnAction): keyof VnTotals {
  const map: Record<VnAction, keyof VnTotals> = {
    grow: 'totalGrown',
    weave: 'totalWoven',
    bloom: 'totalBloomed',
    root: 'totalRooted',
    pollinate: 'totalPollinated',
    entangle: 'totalEntangled',
    evolve: 'totalEvolved',
  }
  return map[action]
}
