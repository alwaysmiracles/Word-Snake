/**
 * Dawn Tower Wire — 黎明之塔
 *
 * Ascend a magical tower floor by floor, encountering word puzzles,
 * monsters, and treasures on each floor. 100 floors across 10 sections,
 * 20 monsters, 5 equipment slots, word-based combat, daily challenges,
 * and 15 achievements.
 *
 * Storage key: dawn-tower-wire
 * Prefix: dt / DT_
 */

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type DtFloorType = 'battle' | 'puzzle' | 'treasure' | 'trap' | 'boss' | 'shop'

export type DtEquipmentSlot = 'weapon' | 'armor' | 'helmet' | 'boots' | 'accessory'

export type DtElement = 'fire' | 'ice' | 'shadow' | 'lightning' | 'nature' | 'holy' | 'void' | 'arcane'

export type DtRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type DtAttackPattern =
  | 'normal'
  | 'rapid'
  | 'heavy'
  | 'poison'
  | 'heal'
  | 'debuff'
  | 'rage'
  | 'summon'
  | 'shield'
  | 'counter'

export interface DtSectionDef {
  readonly id: string
  readonly name: string
  readonly nameZh: string
  readonly startFloor: number
  readonly endFloor: number
  readonly element: DtElement
  readonly bgColor: string
  readonly accentColor: string
  readonly description: string
  readonly descriptionZh: string
  readonly ambientEmoji: string
}

export interface DtMonsterDef {
  readonly id: string
  readonly name: string
  readonly nameZh: string
  readonly element: DtElement
  readonly hp: number
  readonly attack: number
  readonly defense: number
  readonly speed: number
  readonly xpReward: number
  readonly goldReward: number
  readonly attackPattern: DtAttackPattern
  readonly patternDescription: string
  readonly description: string
  readonly descriptionZh: string
  readonly floors: readonly number[]
  readonly isBoss: boolean
  readonly emoji: string
  readonly wordDifficulty: number
}

export interface DtEquipmentDef {
  readonly id: string
  readonly name: string
  readonly nameZh: string
  readonly slot: DtEquipmentSlot
  readonly rarity: DtRarity
  readonly attack: number
  readonly defense: number
  readonly hp: number
  readonly speed: number
  readonly specialEffect: string
  readonly description: string
  readonly descriptionZh: string
  readonly price: number
  readonly minFloor: number
  readonly element: DtElement | null
  readonly emoji: string
}

export interface DtAchievementDef {
  readonly id: string
  readonly name: string
  readonly nameZh: string
  readonly emoji: string
  readonly description: string
  readonly descriptionZh: string
  readonly condition: (state: DawnTowerState) => boolean
  readonly reward: { gold: number; xp: number }
}

export interface DtShopItemDef {
  readonly id: string
  readonly name: string
  readonly nameZh: string
  readonly price: number
  readonly type: 'potion' | 'scroll' | 'token' | 'equipment'
  readonly effect: string
  readonly description: string
  readonly descriptionZh: string
  readonly emoji: string
  readonly value: number
}

export interface DtBattleState {
  monsterId: string
  monsterHP: number
  monsterMaxHP: number
  monsterAttack: number
  monsterDefense: number
  monsterPattern: DtAttackPattern
  turnCount: number
  wordsTyped: string[]
  damageDealt: number
  damageReceived: number
  statusEffects: string[]
  isVictory: boolean
  isDefeat: boolean
  isFled: boolean
  wordPool: string[]
  currentWord: string
}

export interface DtDailyChallenge {
  targetFloor: number
  floorsClimbed: number
  monstersDefeated: number
  wordsTypedCorrect: number
  goldEarned: number
  isCompleted: boolean
  date: string
}

export interface DtFloorResult {
  newState: DawnTowerState
  floorType: DtFloorType
  rewards: DtFloorReward
  battleState: DtBattleState | null
  message: string
}

export interface DtFloorReward {
  xp: number
  gold: number
  items: string[]
  healAmount: number
  skipTokens: number
  revivalScrolls: number
  equipmentFound: string | null
}

export interface DawnTowerState {
  currentFloor: number
  playerHP: number
  playerMaxHP: number
  playerLevel: number
  playerXP: number
  baseAttack: number
  baseDefense: number
  baseSpeed: number
  gold: number
  totalGoldEarned: number
  totalXPEarned: number
  bestFloor: number
  floorSkipTokens: number
  revivalScrolls: number
  equipment: Record<DtEquipmentSlot, string | null>
  inventory: string[]
  unlockedAchievements: string[]
  defeatedMonsters: string[]
  clearedFloors: number[]
  currentBattle: DtBattleState | null
  dailyChallenge: DtDailyChallenge | null
  dailyChallengeDate: string
  totalMonstersDefeated: number
  totalWordsTyped: number
  totalWordsCorrect: number
  totalTreasuresFound: number
  totalTrapsTriggered: number
  totalPuzzlesSolved: number
  totalTowerClimbs: number
  totalBossesDefeated: number
  totalShopPurchases: number
  isGameOver: boolean
  isVictory: boolean
  lastAction: string
  lastFloorType: DtFloorType
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const DT_GOLDEN_DAWN = '#FFD700'
export const DT_STONE_GRAY = '#808080'
export const DT_CRYSTAL_BLUE = '#00CED1'
export const DT_FLAME_ORANGE = '#FF6347'
export const DT_SHADOW_PURPLE = '#4B0082'
export const DT_STORM_SILVER = '#C0C0C0'
export const DT_NATURE_GREEN = '#228B22'
export const DT_VOID_BLACK = '#0D0D2B'
export const DT_HP_RED = '#DC143C'
export const DT_XP_GREEN = '#32CD32'
export const DT_GOLD_YELLOW = '#FFA500'
export const DT_BOSS_CRIMSON = '#8B0000'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: TOWER SECTIONS (10 sections × 10 floors = 100 floors)
// ═══════════════════════════════════════════════════════════════════

export const DT_SECTIONS: readonly DtSectionDef[] = [
  {
    id: 'stone_foundation',
    name: 'Stone Foundation',
    nameZh: '石之基座',
    startFloor: 1,
    endFloor: 10,
    element: 'arcane',
    bgColor: '#2F2F2F',
    accentColor: '#8B7355',
    description: 'The lowest level of the Dawn Tower. Ancient stone walls echo with forgotten incantations.',
    descriptionZh: '黎明之塔的最底层。古老的石墙回荡着被遗忘的咒语。',
    ambientEmoji: '🪨',
  },
  {
    id: 'crystal_halls',
    name: 'Crystal Halls',
    nameZh: '水晶大厅',
    startFloor: 11,
    endFloor: 20,
    element: 'ice',
    bgColor: '#0D1B2A',
    accentColor: '#00CED1',
    description: ' corridors of shimmering crystal that refract light into dazzling patterns.',
    descriptionZh: '闪烁的水晶走廊将光线折射成令人眼花缭乱的图案。',
    ambientEmoji: '💎',
  },
  {
    id: 'flame_corridors',
    name: 'Flame Corridors',
    nameZh: '火焰走廊',
    startFloor: 21,
    endFloor: 30,
    element: 'fire',
    bgColor: '#1A0A00',
    accentColor: '#FF6347',
    description: 'Scorching passageways where fire elementals dance between rivers of molten rock.',
    descriptionZh: '灼热的通道，火元素在熔岩河流间起舞。',
    ambientEmoji: '🔥',
  },
  {
    id: 'shadow_depths',
    name: 'Shadow Depths',
    nameZh: '暗影深渊',
    startFloor: 31,
    endFloor: 40,
    element: 'shadow',
    bgColor: '#0A0012',
    accentColor: '#4B0082',
    description: 'A realm of perpetual twilight where shadows take on a life of their own.',
    descriptionZh: '永恒黄昏的领域，影子有了自己的生命。',
    ambientEmoji: '🌑',
  },
  {
    id: 'storm_peaks',
    name: 'Storm Peaks',
    nameZh: '风暴之巅',
    startFloor: 41,
    endFloor: 50,
    element: 'lightning',
    bgColor: '#1A1A2E',
    accentColor: '#C0C0C0',
    description: 'Open-air platforms battered by magical lightning storms with breathtaking views.',
    descriptionZh: '被魔法雷暴洗礼的露天平台，景色壮丽。',
    ambientEmoji: '⛈️',
  },
  {
    id: 'nature_gardens',
    name: 'Nature Gardens',
    nameZh: '自然花园',
    startFloor: 51,
    endFloor: 60,
    element: 'nature',
    bgColor: '#0A1F0A',
    accentColor: '#228B22',
    description: 'Lush indoor gardens with bioluminescent plants and territorial forest guardians.',
    descriptionZh: '茂密的室内花园，拥有生物发光的植物和领地性森林守护者。',
    ambientEmoji: '🌿',
  },
  {
    id: 'void_chambers',
    name: 'Void Chambers',
    nameZh: '虚空密室',
    startFloor: 61,
    endFloor: 70,
    element: 'void',
    bgColor: '#05050F',
    accentColor: '#1A0033',
    description: 'Chambers where reality itself unravels. Gravity shifts and space folds.',
    descriptionZh: '现实本身解体的密室。重力改变，空间折叠。',
    ambientEmoji: '🌀',
  },
  {
    id: 'dawn_spire',
    name: 'Dawn Spire',
    nameZh: '黎明尖塔',
    startFloor: 71,
    endFloor: 80,
    element: 'holy',
    bgColor: '#1A1A00',
    accentColor: '#FFD700',
    description: 'The upper spire bathed in eternal golden light. Holy energy flows through every stone.',
    descriptionZh: '沐浴在永恒金色光芒中的上层尖塔。圣光能量流经每一块石头。',
    ambientEmoji: '🌅',
  },
  {
    id: 'starlight_observatory',
    name: 'Starlight Observatory',
    nameZh: '星光天文台',
    startFloor: 81,
    endFloor: 90,
    element: 'arcane',
    bgColor: '#05051A',
    accentColor: '#9370DB',
    description: 'An ancient observatory where the stars themselves whisper prophecies of power.',
    descriptionZh: '古老的天文台，星星本身在低语力量的预言。',
    ambientEmoji: '✨',
  },
  {
    id: 'celestial_throne',
    name: 'Celestial Throne',
    nameZh: '天界王座',
    startFloor: 91,
    endFloor: 100,
    element: 'holy',
    bgColor: '#1A0A00',
    accentColor: '#FFD700',
    description: 'The pinnacle of the Dawn Tower. Only the most worthy may challenge the Celestial Guardian.',
    descriptionZh: '黎明之塔的巅峰。只有最值得的人才能挑战天界守护者。',
    ambientEmoji: '👑',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: MONSTERS (20 monsters with unique attack patterns)
// ═══════════════════════════════════════════════════════════════════

export const DT_MONSTERS: readonly DtMonsterDef[] = [
  // ── Stone Foundation Monsters ──────────────────────────────
  {
    id: 'stone_golem',
    name: 'Stone Golem',
    nameZh: '石魔像',
    element: 'arcane',
    hp: 30,
    attack: 5,
    defense: 8,
    speed: 1,
    xpReward: 15,
    goldReward: 10,
    attackPattern: 'heavy',
    patternDescription: 'Slow but devastating attacks. Ignores some player defense.',
    description: 'A hulking construct of animated stone. Each step shakes the tower.',
    descriptionZh: '由活化石头构成的巨大构造体。每一步都震动着塔楼。',
    floors: [1, 2, 3, 4],
    isBoss: false,
    emoji: '🗿',
    wordDifficulty: 1,
  },
  {
    id: 'stone_rat_swarm',
    name: 'Rat Swarm',
    nameZh: '鼠群',
    element: 'shadow',
    hp: 20,
    attack: 7,
    defense: 2,
    speed: 5,
    xpReward: 12,
    goldReward: 8,
    attackPattern: 'rapid',
    patternDescription: 'Many tiny bites that add up. High speed means less time to react.',
    description: 'Hundreds of magical rats that surge from cracks in the stone walls.',
    descriptionZh: '从石墙裂缝中涌出的数百只魔法老鼠。',
    floors: [1, 2, 5, 6],
    isBoss: false,
    emoji: '🐀',
    wordDifficulty: 1,
  },
  {
    id: 'foundation_guardian',
    name: 'Foundation Guardian',
    nameZh: '基座守护者',
    element: 'arcane',
    hp: 80,
    attack: 12,
    defense: 15,
    speed: 2,
    xpReward: 60,
    goldReward: 50,
    attackPattern: 'shield',
    patternDescription: 'Raises a shield every 3 turns. Must break through with powerful words.',
    description: 'An ancient guardian that has protected the tower\'s foundation for millennia.',
    descriptionZh: '守护塔楼基座数千年的古老守护者。',
    floors: [10],
    isBoss: true,
    emoji: '🛡️',
    wordDifficulty: 2,
  },

  // ── Crystal Halls Monsters ─────────────────────────────────
  {
    id: 'ice_shard_elemental',
    name: 'Ice Shard Elemental',
    nameZh: '冰晶元素',
    element: 'ice',
    hp: 40,
    attack: 9,
    defense: 6,
    speed: 3,
    xpReward: 22,
    goldReward: 15,
    attackPattern: 'normal',
    patternDescription: 'Balanced attacks with occasional freezing effects.',
    description: 'A being of living ice that shatters and reforms constantly.',
    descriptionZh: '由活冰构成的存在，不断碎裂又重新形成。',
    floors: [11, 12, 13],
    isBoss: false,
    emoji: '🧊',
    wordDifficulty: 2,
  },
  {
    id: 'crystal_spider',
    name: 'Crystal Spider',
    nameZh: '水晶蜘蛛',
    element: 'ice',
    hp: 35,
    attack: 11,
    defense: 5,
    speed: 6,
    xpReward: 25,
    goldReward: 18,
    attackPattern: 'poison',
    patternDescription: 'Bites inject crystal venom that deals damage over time.',
    description: 'A spider with crystalline fangs that spins webs of frozen silk.',
    descriptionZh: '拥有水晶獠牙的蜘蛛，编织冰冻的丝网。',
    floors: [14, 15, 16],
    isBoss: false,
    emoji: '🕷️',
    wordDifficulty: 2,
  },
  {
    id: 'frost_archmage',
    name: 'Frost Archmage',
    nameZh: '冰霜大法师',
    element: 'ice',
    hp: 120,
    attack: 18,
    defense: 12,
    speed: 4,
    xpReward: 100,
    goldReward: 80,
    attackPattern: 'debuff',
    patternDescription: 'Weakens player attack every 2 turns with frost hex.',
    description: 'An archmage whose heart was long ago frozen by their own magic.',
    descriptionZh: '心脏早已被自己的魔法冻结的大法师。',
    floors: [20],
    isBoss: true,
    emoji: '❄️',
    wordDifficulty: 3,
  },

  // ── Flame Corridors Monsters ───────────────────────────────
  {
    id: 'fire_imp',
    name: 'Fire Imp',
    nameZh: '火精灵',
    element: 'fire',
    hp: 45,
    attack: 13,
    defense: 4,
    speed: 7,
    xpReward: 28,
    goldReward: 20,
    attackPattern: 'rapid',
    patternDescription: 'Throws fireballs in rapid succession. Very aggressive.',
    description: 'A mischievous imp that delights in setting everything ablaze.',
    descriptionZh: '以焚烧一切为乐的恶作剧小恶魔。',
    floors: [21, 22, 23],
    isBoss: false,
    emoji: '😈',
    wordDifficulty: 3,
  },
  {
    id: 'magma_worm',
    name: 'Magma Worm',
    nameZh: '熔岩虫',
    element: 'fire',
    hp: 60,
    attack: 15,
    defense: 10,
    speed: 2,
    xpReward: 35,
    goldReward: 25,
    attackPattern: 'heavy',
    patternDescription: 'Devastating lunge attacks that can almost one-shot weak players.',
    description: 'A massive worm that swims through rivers of molten rock.',
    descriptionZh: '在熔岩河流中游弋的巨大蠕虫。',
    floors: [24, 25, 26],
    isBoss: false,
    emoji: '🐛',
    wordDifficulty: 3,
  },
  {
    id: 'inferno_dragon',
    name: 'Inferno Dragon',
    nameZh: '炼狱龙',
    element: 'fire',
    hp: 180,
    attack: 25,
    defense: 18,
    speed: 5,
    xpReward: 160,
    goldReward: 120,
    attackPattern: 'rage',
    patternDescription: 'Grows stronger every turn. Must be defeated quickly.',
    description: 'A dragon born from the tower\'s volcanic core. Its rage is legendary.',
    descriptionZh: '从塔楼火山核心诞生的龙。它的愤怒是传奇般的。',
    floors: [30],
    isBoss: true,
    emoji: '🐉',
    wordDifficulty: 4,
  },

  // ── Shadow Depths Monsters ─────────────────────────────────
  {
    id: 'shadow_wraith',
    name: 'Shadow Wraith',
    nameZh: '暗影幽灵',
    element: 'shadow',
    hp: 55,
    attack: 16,
    defense: 3,
    speed: 8,
    xpReward: 38,
    goldReward: 28,
    attackPattern: 'debuff',
    patternDescription: 'Drains player speed each turn, making it harder to type fast.',
    description: 'A wraith that exists between shadow and substance.',
    descriptionZh: '存在于影子与实体之间的幽灵。',
    floors: [31, 32, 33],
    isBoss: false,
    emoji: '👻',
    wordDifficulty: 4,
  },
  {
    id: 'nightmare_hound',
    name: 'Nightmare Hound',
    nameZh: '噩梦猎犬',
    element: 'shadow',
    hp: 70,
    attack: 18,
    defense: 8,
    speed: 6,
    xpReward: 42,
    goldReward: 30,
    attackPattern: 'counter',
    patternDescription: 'Counter-attacks when player misses a word. Stay accurate!',
    description: 'A hound forged from the fears of fallen adventurers.',
    descriptionZh: '由坠落冒险者的恐惧铸就的猎犬。',
    floors: [34, 35, 36],
    isBoss: false,
    emoji: '🐕‍🦺',
    wordDifficulty: 4,
  },
  {
    id: 'abyss_lord',
    name: 'Abyss Lord',
    nameZh: '深渊领主',
    element: 'shadow',
    hp: 250,
    attack: 30,
    defense: 20,
    speed: 4,
    xpReward: 220,
    goldReward: 160,
    attackPattern: 'summon',
    patternDescription: 'Summons shadow clones every 3 turns. Focus damage wisely.',
    description: 'The lord of all shadows. His mere presence dims the light of hope.',
    descriptionZh: '所有暗影的领主。仅他的存在就能让希望之光黯淡。',
    floors: [40],
    isBoss: true,
    emoji: '‍🖤',
    wordDifficulty: 5,
  },

  // ── Storm Peaks Monsters ───────────────────────────────────
  {
    id: 'thunder_bird',
    name: 'Thunder Bird',
    nameZh: '雷鸟',
    element: 'lightning',
    hp: 80,
    attack: 20,
    defense: 6,
    speed: 9,
    xpReward: 48,
    goldReward: 35,
    attackPattern: 'normal',
    patternDescription: 'Extremely fast attacks. Lightning reflexes required.',
    description: 'A magnificent bird wreathed in crackling electrical storms.',
    descriptionZh: '被噼啪作响的风暴雷电包裹的壮丽飞鸟。',
    floors: [41, 42, 43],
    isBoss: false,
    emoji: '🦅',
    wordDifficulty: 5,
  },
  {
    id: 'storm_giant',
    name: 'Storm Giant',
    nameZh: '风暴巨人',
    element: 'lightning',
    hp: 100,
    attack: 22,
    defense: 14,
    speed: 3,
    xpReward: 52,
    goldReward: 38,
    attackPattern: 'heavy',
    patternDescription: 'Earth-shaking blows that stun the player for a turn.',
    description: 'A giant that commands the storms themselves to do his bidding.',
    descriptionZh: '指挥风暴本身为其效力的巨人。',
    floors: [44, 45, 46],
    isBoss: false,
    emoji: '👹',
    wordDifficulty: 5,
  },
  {
    id: 'tempest_sovereign',
    name: 'Tempest Sovereign',
    nameZh: '暴风君主',
    element: 'lightning',
    hp: 320,
    attack: 35,
    defense: 22,
    speed: 6,
    xpReward: 300,
    goldReward: 220,
    attackPattern: 'rage',
    patternDescription: 'Storm intensity increases each turn. Lightning strikes grow stronger.',
    description: 'The living embodiment of the eternal storm that guards the peaks.',
    descriptionZh: '守卫山巅的永恒风暴的活化身。',
    floors: [50],
    isBoss: true,
    emoji: '⚡',
    wordDifficulty: 6,
  },

  // ── Nature Gardens Monsters ────────────────────────────────
  {
    id: 'thorn_vine_beast',
    name: 'Thorn Vine Beast',
    nameZh: '荆棘藤兽',
    element: 'nature',
    hp: 90,
    attack: 18,
    defense: 20,
    speed: 2,
    xpReward: 45,
    goldReward: 32,
    attackPattern: 'heal',
    patternDescription: 'Regenerates HP each turn. Overwhelm it before it heals back.',
    description: 'A beast made of thorny vines that regrows faster than you can cut.',
    descriptionZh: '由荆棘藤蔓组成的野兽，再生速度比你的切割还快。',
    floors: [51, 52, 53],
    isBoss: false,
    emoji: '🌵',
    wordDifficulty: 6,
  },
  {
    id: 'fungal_shambler',
    name: 'Fungal Shambler',
    nameZh: '真菌蹒跚者',
    element: 'nature',
    hp: 110,
    attack: 22,
    defense: 12,
    speed: 4,
    xpReward: 50,
    goldReward: 36,
    attackPattern: 'poison',
    patternDescription: 'Releases toxic spores. Poison damage stacks each turn.',
    description: 'A massive mushroom creature that spreads deadly spores with every step.',
    descriptionZh: '巨大的蘑菇生物，每走一步都散发致命孢子。',
    floors: [54, 55, 56],
    isBoss: false,
    emoji: '🍄',
    wordDifficulty: 6,
  },
  {
    id: 'ancient_treant',
    name: 'Ancient Treant',
    nameZh: '远古树精',
    element: 'nature',
    hp: 400,
    attack: 28,
    defense: 30,
    speed: 1,
    xpReward: 380,
    goldReward: 280,
    attackPattern: 'shield',
    patternDescription: 'Almost impenetrable defense. Must use high-power words to break through.',
    description: 'A treant as old as the tower itself. Its bark is tougher than steel.',
    descriptionZh: '与塔楼同龄的树精。它的树皮比钢铁还硬。',
    floors: [60],
    isBoss: true,
    emoji: '🌳',
    wordDifficulty: 7,
  },

  // ── Void Chambers Boss ─────────────────────────────────────
  {
    id: 'void_reaper',
    name: 'Void Reaper',
    nameZh: '虚空收割者',
    element: 'void',
    hp: 450,
    attack: 38,
    defense: 18,
    speed: 6,
    xpReward: 450,
    goldReward: 320,
    attackPattern: 'debuff',
    patternDescription: 'Erases player memory. Each miss increases the next word difficulty.',
    description: 'A reaper that harvests souls from the void between realities.',
    descriptionZh: '从现实之间的虚空中收割灵魂的死神。',
    floors: [70],
    isBoss: true,
    emoji: '💀',
    wordDifficulty: 8,
  },

  // ── Dawn Spire Boss ────────────────────────────────────────
  {
    id: 'dawn_serpent',
    name: 'Dawn Serpent',
    nameZh: '黎明之蛇',
    element: 'holy',
    hp: 550,
    attack: 42,
    defense: 25,
    speed: 7,
    xpReward: 550,
    goldReward: 400,
    attackPattern: 'heal',
    patternDescription: 'Heals rapidly every 2 turns. Requires sustained high damage to overcome.',
    description: 'A serpent made of pure dawn light. It regenerates faster than most can damage.',
    descriptionZh: '由纯黎明之光构成的巨蛇。它的再生速度超过大多数人的伤害。',
    floors: [80],
    isBoss: true,
    emoji: '🐍',
    wordDifficulty: 9,
  },

  // ── Starlight Observatory Boss ─────────────────────────────
  {
    id: 'constellation_golem',
    name: 'Constellation Golem',
    nameZh: '星座魔像',
    element: 'arcane',
    hp: 700,
    attack: 46,
    defense: 35,
    speed: 5,
    xpReward: 700,
    goldReward: 500,
    attackPattern: 'shield',
    patternDescription: 'Alternates between shield phase and attack phase. 3-turn shield cycle.',
    description: 'A massive gool formed from constellations. Its shields are as tough as the cosmos itself.',
    descriptionZh: '由星座构成的巨大魔像。它的护盾与宇宙本身一样坚固。',
    floors: [90],
    isBoss: true,
    emoji: '🌌',
    wordDifficulty: 9,
  },

  // ── Void Chambers + Dawn Spire Regular Monster ─────────────
  {
    id: 'void_phantom',
    name: 'Void Phantom',
    nameZh: '虚空幽灵',
    element: 'void',
    hp: 130,
    attack: 30,
    defense: 8,
    speed: 7,
    xpReward: 65,
    goldReward: 45,
    attackPattern: 'debuff',
    patternDescription: 'Erases player\'s last typed word every 2 turns.',
    description: 'A phantom from beyond reality. It exists in the spaces between thoughts.',
    descriptionZh: '来自现实之外的幽灵。它存在于思维的缝隙之间。',
    floors: [61, 62, 63, 71, 72],
    isBoss: false,
    emoji: '👤',
    wordDifficulty: 7,
  },

  // ── Starlight Observatory + Celestial Throne ───────────────
  {
    id: 'star_weaver',
    name: 'Star Weaver',
    nameZh: '星辰编织者',
    element: 'arcane',
    hp: 200,
    attack: 38,
    defense: 15,
    speed: 5,
    xpReward: 100,
    goldReward: 70,
    attackPattern: 'summon',
    patternDescription: 'Summons starlight constructs to fight alongside it.',
    description: 'A cosmic entity that weaves starlight into deadly constructs.',
    descriptionZh: '将星光编织成致命构造物的宇宙实体。',
    floors: [81, 82, 83, 91, 92],
    isBoss: false,
    emoji: '🌟',
    wordDifficulty: 8,
  },
  {
    id: 'celestial_guardian',
    name: 'Celestial Guardian',
    nameZh: '天界守护者',
    element: 'holy',
    hp: 999,
    attack: 50,
    defense: 40,
    speed: 8,
    xpReward: 1000,
    goldReward: 500,
    attackPattern: 'rage',
    patternDescription: 'The final boss. Gains power each phase. Requires mastery of all word skills.',
    description: 'The ultimate guardian of the Dawn Tower. Only legends can defeat it.',
    descriptionZh: '黎明之塔的终极守护者。只有传说才能击败它。',
    floors: [100],
    isBoss: true,
    emoji: '👼',
    wordDifficulty: 10,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: EQUIPMENT DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

export const DT_EQUIPMENT: readonly DtEquipmentDef[] = [
  // ── Weapons ────────────────────────────────────────────────
  {
    id: 'wpn_rusty_sword', name: 'Rusty Sword', nameZh: '生锈的剑',
    slot: 'weapon', rarity: 'common', attack: 3, defense: 0, hp: 0, speed: 0,
    specialEffect: 'none', description: 'A worn blade found in the tower\'s entrance.', descriptionZh: '在塔楼入口处发现的磨损刀刃。',
    price: 20, minFloor: 1, element: null, emoji: '🗡️',
  },
  {
    id: 'wpn_crystal_dagger', name: 'Crystal Dagger', nameZh: '水晶匕首',
    slot: 'weapon', rarity: 'uncommon', attack: 8, defense: 1, hp: 0, speed: 3,
    specialEffect: 'ice_crit', description: 'A dagger carved from tower crystal. Chance to freeze.', descriptionZh: '由塔楼水晶雕刻的匕首。有冻结几率。',
    price: 60, minFloor: 11, element: 'ice', emoji: '🔪',
  },
  {
    id: 'wpn_flame_brand', name: 'Flame Brand', nameZh: '烈焰之剑',
    slot: 'weapon', rarity: 'rare', attack: 15, defense: 0, hp: 5, speed: 0,
    specialEffect: 'burn', description: 'A sword wreathed in eternal flame. Burns enemies on hit.', descriptionZh: '被永恒火焰包裹的剑。命中时灼烧敌人。',
    price: 150, minFloor: 21, element: 'fire', emoji: '⚔️',
  },
  {
    id: 'wpn_shadow_blade', name: 'Shadow Blade', nameZh: '暗影之刃',
    slot: 'weapon', rarity: 'epic', attack: 22, defense: 5, hp: 10, speed: 2,
    specialEffect: 'life_steal', description: 'A blade forged from solidified shadow. Heals on kill.', descriptionZh: '由固化暗影锻造的刀刃。击杀时恢复生命。',
    price: 350, minFloor: 31, element: 'shadow', emoji: '🔪',
  },
  {
    id: 'wpn_storm_spear', name: 'Storm Spear', nameZh: '风暴之矛',
    slot: 'weapon', rarity: 'epic', attack: 25, defense: 3, hp: 0, speed: 8,
    specialEffect: 'chain_lightning', description: 'A spear that channels lightning. Attacks hit twice on crit.', descriptionZh: '引导雷电的长矛。暴击时攻击两次。',
    price: 400, minFloor: 41, element: 'lightning', emoji: '🔱',
  },
  {
    id: 'wpn_dawn_breaker', name: 'Dawn Breaker', nameZh: '破晓者',
    slot: 'weapon', rarity: 'legendary', attack: 40, defense: 10, hp: 20, speed: 5,
    specialEffect: 'holy_smite', description: 'The legendary sword of dawn. Extra damage to all monsters.', descriptionZh: '传奇的黎明之剑。对所有怪物造成额外伤害。',
    price: 1000, minFloor: 71, element: 'holy', emoji: '🗡️',
  },
  {
    id: 'wpn_celestial_staff', name: 'Celestial Staff', nameZh: '天界法杖',
    slot: 'weapon', rarity: 'legendary', attack: 50, defense: 15, hp: 30, speed: 10,
    specialEffect: 'cosmic_power', description: 'A staff channeled from starlight itself. Ultimate weapon.', descriptionZh: '由星光本身引导的法杖。终极武器。',
    price: 2000, minFloor: 91, element: 'arcane', emoji: '🪄',
  },

  // ── Armor ──────────────────────────────────────────────────
  {
    id: 'arm_leather_vest', name: 'Leather Vest', nameZh: '皮甲',
    slot: 'armor', rarity: 'common', attack: 0, defense: 3, hp: 10, speed: 0,
    specialEffect: 'none', description: 'Basic leather armor. Better than nothing.', descriptionZh: '基础皮甲。总比没有好。',
    price: 25, minFloor: 1, element: null, emoji: '🦺',
  },
  {
    id: 'arm_crystal_mail', name: 'Crystal Mail', nameZh: '水晶甲',
    slot: 'armor', rarity: 'uncommon', attack: 2, defense: 7, hp: 15, speed: -1,
    specialEffect: 'reflect', description: 'Armor made of tower crystal. Reflects 10% damage.', descriptionZh: '由塔楼水晶制成的盔甲。反射10%伤害。',
    price: 70, minFloor: 11, element: 'ice', emoji: '🛡️',
  },
  {
    id: 'arm_flame_plate', name: 'Flame Plate', nameZh: '烈焰板甲',
    slot: 'armor', rarity: 'rare', attack: 5, defense: 14, hp: 25, speed: -2,
    specialEffect: 'flame_aura', description: 'Plate armor imbued with fire. Burns nearby enemies.', descriptionZh: '注入火焰的板甲。灼烧附近的敌人。',
    price: 180, minFloor: 21, element: 'fire', emoji: '🛡️',
  },
  {
    id: 'arm_void_shroud', name: 'Void Shroud', nameZh: '虚空斗篷',
    slot: 'armor', rarity: 'legendary', attack: 10, defense: 25, hp: 40, speed: 3,
    specialEffect: 'phase_shift', description: 'A cloak woven from void matter. 20% dodge chance.', descriptionZh: '由虚空物质编织的斗篷。20%闪避几率。',
    price: 1200, minFloor: 61, element: 'void', emoji: '🧥',
  },

  // ── Helmets ────────────────────────────────────────────────
  {
    id: 'hlm_iron_cap', name: 'Iron Cap', nameZh: '铁帽',
    slot: 'helmet', rarity: 'common', attack: 0, defense: 2, hp: 5, speed: 0,
    specialEffect: 'none', description: 'A simple iron cap. Provides modest protection.', descriptionZh: '简单的铁帽。提供适度的保护。',
    price: 15, minFloor: 1, element: null, emoji: '⛑️',
  },
  {
    id: 'hlm_crown_of_dawn', name: 'Crown of Dawn', nameZh: '黎明王冠',
    slot: 'helmet', rarity: 'legendary', attack: 15, defense: 15, hp: 30, speed: 5,
    specialEffect: 'radiance', description: 'The ancient crown of the tower\'s first ruler. Boosts all stats.', descriptionZh: '塔楼第一位统治者的古老王冠。提升所有属性。',
    price: 1500, minFloor: 71, element: 'holy', emoji: '👑',
  },

  // ── Boots ──────────────────────────────────────────────────
  {
    id: 'bts_leather_boots', name: 'Leather Boots', nameZh: '皮靴',
    slot: 'boots', rarity: 'common', attack: 0, defense: 1, hp: 0, speed: 2,
    specialEffect: 'none', description: 'Simple boots for climbing tower stairs.', descriptionZh: '用于攀爬塔楼阶梯的简单靴子。',
    price: 15, minFloor: 1, element: null, emoji: '👢',
  },
  {
    id: 'bts_wind_striders', name: 'Wind Striders', nameZh: '御风靴',
    slot: 'boots', rarity: 'rare', attack: 3, defense: 3, hp: 5, speed: 10,
    specialEffect: 'wind_walk', description: 'Boots enchanted with wind magic. Greatly increases speed.', descriptionZh: '注入风之魔法的靴子。大幅提升速度。',
    price: 200, minFloor: 41, element: 'lightning', emoji: '👟',
  },
  {
    id: 'bts_void_walkers', name: 'Void Walkers', nameZh: '虚空行者',
    slot: 'boots', rarity: 'legendary', attack: 8, defense: 8, hp: 15, speed: 15,
    specialEffect: 'teleport', description: 'Boots that let you phase through space itself.', descriptionZh: '能让你穿越空间本身的靴子。',
    price: 1100, minFloor: 61, element: 'void', emoji: '🥾',
  },

  // ── Accessories ────────────────────────────────────────────
  {
    id: 'acc_lucky_charm', name: 'Lucky Charm', nameZh: '幸运符',
    slot: 'accessory', rarity: 'common', attack: 1, defense: 1, hp: 5, speed: 1,
    specialEffect: 'gold_bonus', description: 'A simple charm. Increases gold found by 10%.', descriptionZh: '简单的护身符。增加10%发现的金币。',
    price: 30, minFloor: 1, element: null, emoji: '🍀',
  },
  {
    id: 'acc_hp_amulet', name: 'HP Amulet', nameZh: '生命护符',
    slot: 'accessory', rarity: 'uncommon', attack: 2, defense: 2, hp: 30, speed: 0,
    specialEffect: 'regen', description: 'An amulet that slowly regenerates health.', descriptionZh: '缓慢再生生命的护符。',
    price: 80, minFloor: 5, element: null, emoji: '📿',
  },
  {
    id: 'acc_shadow_ring', name: 'Shadow Ring', nameZh: '暗影戒指',
    slot: 'accessory', rarity: 'epic', attack: 12, defense: 5, hp: 10, speed: 5,
    specialEffect: 'stealth', description: 'A ring that makes the wearer harder to hit.', descriptionZh: '使佩戴者更难被击中的戒指。',
    price: 500, minFloor: 31, element: 'shadow', emoji: '💍',
  },
  {
    id: 'acc_dawn_pendant', name: 'Dawn Pendant', nameZh: '黎明吊坠',
    slot: 'accessory', rarity: 'legendary', attack: 20, defense: 15, hp: 50, speed: 8,
    specialEffect: 'dawn_blessing', description: 'Pendant blessed by the first light of dawn. Ultimate accessory.', descriptionZh: '被第一缕曙光祝福的吊坠。终极饰品。',
    price: 1800, minFloor: 81, element: 'holy', emoji: '📿',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: SHOP ITEMS
// ═══════════════════════════════════════════════════════════════════

export const DT_SHOP_ITEMS: readonly DtShopItemDef[] = [
  {
    id: 'shop_health_potion', name: 'Health Potion', nameZh: '生命药水',
    price: 25, type: 'potion', effect: 'heal_50',
    description: 'Restores 50 HP.', descriptionZh: '恢复50点生命值。', emoji: '🧪', value: 50,
  },
  {
    id: 'shop_health_elixir', name: 'Health Elixir', nameZh: '生命灵药',
    price: 60, type: 'potion', effect: 'heal_full',
    description: 'Fully restores HP.', descriptionZh: '完全恢复生命值。', emoji: '🫗', value: 999,
  },
  {
    id: 'shop_attack_scroll', name: 'Attack Scroll', nameZh: '攻击卷轴',
    price: 40, type: 'scroll', effect: 'atk_boost',
    description: '+5 Attack for next battle.', descriptionZh: '下一场战斗攻击力+5。', emoji: '📜', value: 5,
  },
  {
    id: 'shop_defense_scroll', name: 'Defense Scroll', nameZh: '防御卷轴',
    price: 40, type: 'scroll', effect: 'def_boost',
    description: '+5 Defense for next battle.', descriptionZh: '下一场战斗防御力+5。', emoji: '📜', value: 5,
  },
  {
    id: 'shop_floor_skip', name: 'Floor Skip Token', nameZh: '跳层令牌',
    price: 100, type: 'token', effect: 'skip_floor',
    description: 'Skip the next floor without combat.', descriptionZh: '跳过下一层，无需战斗。', emoji: '🎫', value: 1,
  },
  {
    id: 'shop_revival_scroll', name: 'Revival Scroll', nameZh: '复活卷轴',
    price: 150, type: 'scroll', effect: 'revive',
    description: 'Auto-revive with 50% HP when defeated.', descriptionZh: '被击败时自动以50%生命值复活。', emoji: '📝', value: 1,
  },
  {
    id: 'shop_xp_tome', name: 'XP Tome', nameZh: '经验秘典',
    price: 80, type: 'scroll', effect: 'xp_boost',
    description: '+50% XP from next battle.', descriptionZh: '下一场战斗经验+50%。', emoji: '📕', value: 50,
  },
  {
    id: 'shop_gold_charm', name: 'Gold Charm', nameZh: '金币护符',
    price: 120, type: 'potion', effect: 'gold_boost',
    description: '+50% Gold from next floor.', descriptionZh: '下一层金币+50%。', emoji: '💰', value: 50,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: WORD POOLS BY DIFFICULTY
// ═══════════════════════════════════════════════════════════════════

export const DT_WORD_POOLS: Record<number, string[]> = {
  1: ['cat', 'dog', 'sun', 'run', 'hat', 'bat', 'red', 'big', 'top', 'cup', 'map', 'pen', 'box', 'key', 'jar'],
  2: ['dawn', 'fire', 'stone', 'wolf', 'moon', 'star', 'bird', 'fish', 'tree', 'rain', 'snow', 'wind', 'gold', 'dark', 'dusk'],
  3: ['tower', 'climb', 'magic', 'crystal', 'shadow', 'dragon', 'knight', 'shield', 'potion', 'weapon', 'battle', 'castle', 'forest', 'spirit', 'cursed'],
  4: ['ancient', 'guardian', 'elemental', 'thunder', 'darkness', 'phantom', 'warrior', 'blessing', 'treasure', 'monster', 'artifact', 'enchant', 'fortress', 'whisper', 'conquer'],
  5: ['celestial', 'guardian', 'labyrinth', 'summoner', 'illusion', 'spectrum', 'devastate', 'prophecy', 'obsidian', 'serenity', 'champion', 'mystical', 'overlord', 'hurricane', 'twilight'],
  6: ['archaeology', 'catastrophe', 'enlightened', 'phantasmal', 'thunderbolt', 'equilibrium', 'resilience', 'supernova', 'illuminate', 'phenomenon', 'apocalypse', 'revolution', 'atmosphere', 'mechanical', 'dimensional'],
  7: ['incandescent', 'extraordinary', 'constellation', 'metamorphosis', 'hallucination', 'philosophical', 'constellation', 'transcendent', 'juxtaposition', 'archaeological', 'unpredictable', 'vulnerability', 'electromagnet', 'reconnaissance', 'hieroglyphics'],
  8: ['bibliography', 'sophisticated', 'metamorphosis', 'unprecedented', 'archaeological', 'straightforward', 'accomplished', 'authentication', 'catastrophic', 'encyclopedias', 'extravagantly', 'grandiloquent', 'hallucinogen', 'iconoclastic', 'juxtaposition'],
  9: ['acquiescence', 'bureaucratic', 'circumference', 'disingenuous', 'ecclesiastical', 'fluorescence', 'ganglioneuroma', 'hemorrhagical', 'idiosyncratic', 'jurisprudence', 'kaleidoscopic', 'labyrinthodont', 'magnanimously', 'nonrepresent', 'otorhinolaryng'],
  10: ['antidisestablish', 'circumlocution', 'deoxyribonucleic', 'electroencephal', 'floccinaucinihilip', 'honorificabilitud', 'incomprehensibilit', 'magnetoplasmadyna', 'otorhinolaryngolo', 'pneumonoultramicro', 'supercalifragilis', 'uncharacteristical', 'psychophysicother', 'electrocardiograph', 'intercomprehension'],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: ACHIEVEMENTS (15)
// ═══════════════════════════════════════════════════════════════════

export const DT_ACHIEVEMENTS: readonly DtAchievementDef[] = [
  {
    id: 'ach_first_step',
    name: 'First Step',
    nameZh: '第一步',
    emoji: '👣',
    description: 'Clear floor 1 of the Dawn Tower.',
    descriptionZh: '清除黎明之塔第1层。',
    condition: (s) => s.clearedFloors.includes(1),
    reward: { gold: 20, xp: 10 },
  },
  {
    id: 'ach_stone_master',
    name: 'Stone Master',
    nameZh: '石之大师',
    emoji: '🪨',
    description: 'Clear all 10 floors of the Stone Foundation.',
    descriptionZh: '清除石之基座的所有10层。',
    condition: (s) => s.clearedFloors.filter((f) => f >= 1 && f <= 10).length >= 10,
    reward: { gold: 100, xp: 50 },
  },
  {
    id: 'ach_ten_floors',
    name: 'Aspiring Climber',
    nameZh: '志向远大的攀登者',
    emoji: '🧗',
    description: 'Clear 10 floors total.',
    descriptionZh: '总共清除10层。',
    condition: (s) => s.clearedFloors.length >= 10,
    reward: { gold: 50, xp: 30 },
  },
  {
    id: 'ach_crystal_explorer',
    name: 'Crystal Explorer',
    nameZh: '水晶探索者',
    emoji: '💎',
    description: 'Reach the Crystal Halls (floor 11+).',
    descriptionZh: '到达水晶大厅（第11层以上）。',
    condition: (s) => s.bestFloor >= 11,
    reward: { gold: 75, xp: 40 },
  },
  {
    id: 'ach_first_boss',
    name: 'Boss Slayer',
    nameZh: '首领杀手',
    emoji: '⚔️',
    description: 'Defeat your first boss.',
    descriptionZh: '击败你的第一个首领。',
    condition: (s) => s.totalBossesDefeated >= 1,
    reward: { gold: 100, xp: 60 },
  },
  {
    id: 'ach_word_master',
    name: 'Word Master',
    nameZh: '文字大师',
    emoji: '✍️',
    description: 'Type 100 words correctly in battle.',
    descriptionZh: '在战斗中正确输入100个单词。',
    condition: (s) => s.totalWordsCorrect >= 100,
    reward: { gold: 80, xp: 50 },
  },
  {
    id: 'ach_rich_climber',
    name: 'Rich Climber',
    nameZh: '富有的攀登者',
    emoji: '💰',
    description: 'Accumulate 500 gold.',
    descriptionZh: '累积500金币。',
    condition: (s) => s.totalGoldEarned >= 500,
    reward: { gold: 200, xp: 80 },
  },
  {
    id: 'ach_halfway',
    name: 'Halfway There',
    nameZh: '已经过半',
    emoji: '🏔️',
    description: 'Reach floor 50.',
    descriptionZh: '到达第50层。',
    condition: (s) => s.bestFloor >= 50,
    reward: { gold: 300, xp: 150 },
  },
  {
    id: 'ach_monster_hunter',
    name: 'Monster Hunter',
    nameZh: '怪物猎人',
    emoji: '🦖',
    description: 'Defeat 50 monsters total.',
    descriptionZh: '总共击败50只怪物。',
    condition: (s) => s.totalMonstersDefeated >= 50,
    reward: { gold: 200, xp: 100 },
  },
  {
    id: 'ach_equipment_collector',
    name: 'Equipment Collector',
    nameZh: '装备收藏家',
    emoji: '🎒',
    description: 'Have 5 different equipment pieces.',
    descriptionZh: '拥有5件不同的装备。',
    condition: (s) => s.inventory.length >= 5,
    reward: { gold: 150, xp: 80 },
  },
  {
    id: 'ach_puzzle_genius',
    name: 'Puzzle Genius',
    nameZh: '解谜天才',
    emoji: '🧩',
    description: 'Solve 20 puzzles.',
    descriptionZh: '解决20个谜题。',
    condition: (s) => s.totalPuzzlesSolved >= 20,
    reward: { gold: 180, xp: 90 },
  },
  {
    id: 'ach_void_walker',
    name: 'Void Walker',
    nameZh: '虚空行者',
    emoji: '🌀',
    description: 'Reach the Void Chambers (floor 61+).',
    descriptionZh: '到达虚空密室（第61层以上）。',
    condition: (s) => s.bestFloor >= 61,
    reward: { gold: 400, xp: 200 },
  },
  {
    id: 'ach_level_25',
    name: 'Seasoned Adventurer',
    nameZh: '经验丰富的冒险者',
    emoji: '⭐',
    description: 'Reach player level 25.',
    descriptionZh: '达到玩家等级25。',
    condition: (s) => s.playerLevel >= 25,
    reward: { gold: 500, xp: 250 },
  },
  {
    id: 'ach_dawn_champion',
    name: 'Dawn Champion',
    nameZh: '黎明冠军',
    emoji: '🌅',
    description: 'Reach the Dawn Spire (floor 71+).',
    descriptionZh: '到达黎明尖塔（第71层以上）。',
    condition: (s) => s.bestFloor >= 71,
    reward: { gold: 600, xp: 300 },
  },
  {
    id: 'ach_tower_conqueror',
    name: 'Tower Conqueror',
    nameZh: '塔楼征服者',
    emoji: '👑',
    description: 'Clear all 100 floors and conquer the Dawn Tower.',
    descriptionZh: '清除所有100层并征服黎明之塔。',
    condition: (s) => s.clearedFloors.includes(100),
    reward: { gold: 2000, xp: 1000 },
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: FLOOR TYPE DETERMINATION LOGIC
// ═══════════════════════════════════════════════════════════════════

function dtFloorTypeInternal(floor: number): DtFloorType {
  if (floor % 10 === 0) return 'boss'
  if (floor % 5 === 0) return 'shop'
  const mod = floor % 10
  if (mod === 1 || mod === 3 || mod === 7) return 'battle'
  if (mod === 2 || mod === 6) return 'puzzle'
  if (mod === 4 || mod === 8) return 'treasure'
  return 'trap'
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: XP TABLE (Level 1-50)
// ═══════════════════════════════════════════════════════════════════

const DT_XP_TABLE: readonly number[] = [
  0, 30, 70, 120, 180, 260, 360, 480, 620, 780,
  960, 1160, 1380, 1640, 1920, 2240, 2600, 3000, 3440, 3920,
  4440, 5020, 5660, 6360, 7140, 8000, 8940, 9980, 11120, 12380,
  13760, 15280, 16940, 18740, 20700, 22820, 25140, 27660, 30400, 33360,
  36560, 40000, 43800, 47860, 52220, 56900, 61920, 67300, 73060, 79220,
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: PURE FUNCTIONS — STATE FACTORY & RESET
// ═══════════════════════════════════════════════════════════════════

export function dtInitialState(): DawnTowerState {
  return {
    currentFloor: 1,
    playerHP: 100,
    playerMaxHP: 100,
    playerLevel: 1,
    playerXP: 0,
    baseAttack: 5,
    baseDefense: 3,
    baseSpeed: 3,
    gold: 50,
    totalGoldEarned: 0,
    totalXPEarned: 0,
    bestFloor: 0,
    floorSkipTokens: 1,
    revivalScrolls: 1,
    equipment: { weapon: null, armor: null, helmet: null, boots: null, accessory: null },
    inventory: [],
    unlockedAchievements: [],
    defeatedMonsters: [],
    clearedFloors: [],
    currentBattle: null,
    dailyChallenge: null,
    dailyChallengeDate: '',
    totalMonstersDefeated: 0,
    totalWordsTyped: 0,
    totalWordsCorrect: 0,
    totalTreasuresFound: 0,
    totalTrapsTriggered: 0,
    totalPuzzlesSolved: 0,
    totalTowerClimbs: 0,
    totalBossesDefeated: 0,
    totalShopPurchases: 0,
    isGameOver: false,
    isVictory: false,
    lastAction: 'Enter the Dawn Tower...',
    lastFloorType: 'battle',
  }
}

export function dtResetState(): DawnTowerState {
  return dtInitialState()
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: PURE FUNCTIONS — FLOOR QUERIES
// ═══════════════════════════════════════════════════════════════════

export function dtGetCurrentFloor(state: DawnTowerState): number {
  return state.currentFloor
}

export function dtGetFloorType(floor: number): DtFloorType {
  if (floor < 1 || floor > 100) return 'battle'
  return dtFloorTypeInternal(floor)
}

export function dtGetFloorTypeFromState(state: DawnTowerState): DtFloorType {
  return dtGetFloorType(state.currentFloor)
}

export function dtIsBossFloor(floor: number): boolean {
  return floor % 10 === 0
}

export function dtIsShopFloor(floor: number): boolean {
  return floor % 5 === 0 && floor % 10 !== 0
}

export function dtGetSectionForFloor(floor: number): DtSectionDef {
  const section = DT_SECTIONS.find(
    (s) => floor >= s.startFloor && floor <= s.endFloor
  )
  return section ?? DT_SECTIONS[0]
}

export function dtGetCurrentSection(state: DawnTowerState): DtSectionDef {
  return dtGetSectionForFloor(state.currentFloor)
}

export function dtGetAllSections(): readonly DtSectionDef[] {
  return DT_SECTIONS
}

export function dtGetSectionFloors(section: DtSectionDef): number[] {
  const floors: number[] = []
  for (let i = section.startFloor; i <= section.endFloor; i++) {
    floors.push(i)
  }
  return floors
}

export function dtGetFloorNumber(state: DawnTowerState): number {
  return state.currentFloor
}

export function dtGetFloorDescription(floor: number): string {
  const section = dtGetSectionForFloor(floor)
  const type = dtGetFloorType(floor)
  const floorInSection = floor - section.startFloor + 1
  switch (type) {
    case 'battle':
      return `Floor ${floor}: A ${section.name} battle arena. Floor ${floorInSection} of ${section.name}.`
    case 'puzzle':
      return `Floor ${floor}: A word puzzle awaits in the ${section.name}. Floor ${floorInSection} of ${section.name}.`
    case 'treasure':
      return `Floor ${floor}: A glimmering treasure chest in the ${section.name}. Floor ${floorInSection} of ${section.name}.`
    case 'trap':
      return `Floor ${floor}: Something feels wrong... a trap in the ${section.name}! Floor ${floorInSection} of ${section.name}.`
    case 'boss':
      return `Floor ${floor}: BOSS FLOOR! The guardian of ${section.name} awaits! Floor ${floorInSection} of ${section.name}.`
    case 'shop':
      return `Floor ${floor}: A wandering merchant has set up shop in the ${section.name}. Floor ${floorInSection} of ${section.name}.`
    default:
      return `Floor ${floor} of the Dawn Tower.`
  }
}

export function dtGetFloorDescriptionZh(floor: number): string {
  const section = dtGetSectionForFloor(floor)
  return `${floor}层：${section.nameZh} — ${section.descriptionZh}`
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: PURE FUNCTIONS — MONSTER QUERIES
// ═══════════════════════════════════════════════════════════════════

export function dtGetMonsterForFloor(floor: number): DtMonsterDef | null {
  if (dtGetFloorType(floor) !== 'battle' && dtGetFloorType(floor) !== 'boss') {
    return null
  }
  const candidates = DT_MONSTERS.filter((m) => m.floors.includes(floor))
  if (candidates.length === 0) return null
  if (candidates.length === 1) return candidates[0]
  const idx = floor % candidates.length
  return candidates[idx]
}

export function dtGetAllMonsters(): readonly DtMonsterDef[] {
  return DT_MONSTERS
}

export function dtGetMonsterById(id: string): DtMonsterDef | null {
  return DT_MONSTERS.find((m) => m.id === id) ?? null
}

export function dtGetMonsterName(monsterId: string): string {
  const m = dtGetMonsterById(monsterId)
  return m?.name ?? 'Unknown Monster'
}

export function dtGetMonsterNameZh(monsterId: string): string {
  const m = dtGetMonsterById(monsterId)
  return m?.nameZh ?? '未知怪物'
}

export function dtGetMonsterHP(monsterId: string): number {
  const m = dtGetMonsterById(monsterId)
  return m?.hp ?? 0
}

export function dtGetMonsterAttack(monsterId: string): number {
  const m = dtGetMonsterById(monsterId)
  return m?.attack ?? 0
}

export function dtGetMonsterDefense(monsterId: string): number {
  const m = dtGetMonsterById(monsterId)
  return m?.defense ?? 0
}

export function dtGetMonsterElement(monsterId: string): DtElement {
  const m = dtGetMonsterById(monsterId)
  return m?.element ?? 'arcane'
}

export function dtGetMonsterDescription(monsterId: string): string {
  const m = dtGetMonsterById(monsterId)
  return m?.description ?? 'No description available.'
}

export function dtGetMonsterPattern(monsterId: string): DtAttackPattern {
  const m = dtGetMonsterById(monsterId)
  return m?.attackPattern ?? 'normal'
}

export function dtGetMonsterPatternDescription(monsterId: string): string {
  const m = dtGetMonsterById(monsterId)
  return m?.patternDescription ?? 'No pattern info available.'
}

export function dtGetMonstersForSection(section: DtSectionDef): DtMonsterDef[] {
  return DT_MONSTERS.filter((m) =>
    m.floors.some((f) => f >= section.startFloor && f <= section.endFloor)
  )
}

export function dtGetBossForSection(section: DtSectionDef): DtMonsterDef | null {
  return DT_MONSTERS.find(
    (m) => m.isBoss && m.floors.includes(section.endFloor)
  ) ?? null
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: PURE FUNCTIONS — PLAYER STATS
// ═══════════════════════════════════════════════════════════════════

export function dtGetPlayerHP(state: DawnTowerState): number {
  return state.playerHP
}

export function dtGetPlayerMaxHP(state: DawnTowerState): number {
  return state.playerMaxHP
}

export function dtGetPlayerLevel(state: DawnTowerState): number {
  return state.playerLevel
}

export function dtGetPlayerXP(state: DawnTowerState): number {
  return state.playerXP
}

export function dtGetNextLevelXP(level: number): number {
  if (level >= 50) return DT_XP_TABLE[49]
  return DT_XP_TABLE[level] ?? 79220
}

export function dtGetPlayerAttack(state: DawnTowerState): number {
  const equipBonus = dtGetEquipmentAttackBonus(state)
  return state.baseAttack + equipBonus + Math.floor(state.playerLevel * 1.2)
}

export function dtGetPlayerDefense(state: DawnTowerState): number {
  const equipBonus = dtGetEquipmentDefenseBonus(state)
  return state.baseDefense + equipBonus + Math.floor(state.playerLevel * 0.8)
}

export function dtGetPlayerSpeed(state: DawnTowerState): number {
  const equipBonus = dtGetEquipmentSpeedBonus(state)
  return state.baseSpeed + equipBonus + Math.floor(state.playerLevel * 0.5)
}

export function dtGetPlayerHPBonus(state: DawnTowerState): number {
  const equipBonus = dtGetEquipmentHPBonus(state)
  return equipBonus + Math.floor(state.playerLevel * 3)
}

export function dtGetGold(state: DawnTowerState): number {
  return state.gold
}

export function dtGetFloorSkipTokens(state: DawnTowerState): number {
  return state.floorSkipTokens
}

export function dtGetRevivalScrolls(state: DawnTowerState): number {
  return state.revivalScrolls
}

export function dtGetBestFloor(state: DawnTowerState): number {
  return state.bestFloor
}

export function dtGetTotalStats(state: DawnTowerState): {
  attack: number
  defense: number
  speed: number
  maxHP: number
  level: number
  gold: number
} {
  return {
    attack: dtGetPlayerAttack(state),
    defense: dtGetPlayerDefense(state),
    speed: dtGetPlayerSpeed(state),
    maxHP: dtGetPlayerMaxHP(state) + dtGetPlayerHPBonus(state),
    level: state.playerLevel,
    gold: state.gold,
  }
}

export function dtGetPlayerTitle(state: DawnTowerState): string {
  const floor = state.bestFloor
  if (floor >= 100) return 'Tower Conqueror 🏆'
  if (floor >= 90) return 'Celestial Warrior ⭐'
  if (floor >= 80) return 'Starlight Sage ✨'
  if (floor >= 70) return 'Dawn Champion 🌅'
  if (floor >= 60) return 'Void Walker 🌀'
  if (floor >= 50) return 'Storm Rider ⛈️'
  if (floor >= 40) return 'Shadow Strider 🌑'
  if (floor >= 30) return 'Flame Knight 🔥'
  if (floor >= 20) return 'Crystal Explorer 💎'
  if (floor >= 10) return 'Stone Climber 🪨'
  if (floor >= 1) return 'Tower Novice 🌱'
  return 'Unproven Adventurer ❓'
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: PURE FUNCTIONS — LEVEL UP & XP
// ═══════════════════════════════════════════════════════════════════

export function dtAddXP(state: DawnTowerState, amount: number): DawnTowerState {
  let s = { ...state, playerXP: state.playerXP + amount, totalXPEarned: state.totalXPEarned + amount }
  while (s.playerLevel < 50) {
    const needed = dtGetNextLevelXP(s.playerLevel)
    if (s.playerXP >= needed) {
      s = {
        ...s,
        playerXP: s.playerXP - needed,
        playerLevel: s.playerLevel + 1,
        playerMaxHP: s.playerMaxHP + 10,
        playerHP: Math.min(s.playerHP + 15, s.playerMaxHP + 10),
        baseAttack: s.baseAttack + 1,
        baseDefense: s.baseDefense + 1,
        baseSpeed: s.baseSpeed + (s.playerLevel % 5 === 0 ? 1 : 0),
        lastAction: `Level Up! You are now level ${s.playerLevel + 1}!`,
      }
    } else {
      break
    }
  }
  return s
}

export function dtGetLevelUpRewards(level: number): { hp: number; attack: number; defense: number; speed: number } {
  return {
    hp: 10,
    attack: 1,
    defense: 1,
    speed: level % 5 === 0 ? 1 : 0,
  }
}

export function dtGetLevelProgress(state: DawnTowerState): number {
  if (state.playerLevel >= 50) return 1
  const currentLevelXP = DT_XP_TABLE[state.playerLevel - 1] ?? 0
  const nextLevelXP = DT_XP_TABLE[state.playerLevel] ?? 79220
  const range = nextLevelXP - currentLevelXP
  if (range <= 0) return 1
  return Math.min(1, (state.playerXP - currentLevelXP) / range)
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: PURE FUNCTIONS — EQUIPMENT
// ═══════════════════════════════════════════════════════════════════

export function dtGetAllEquipment(): readonly DtEquipmentDef[] {
  return DT_EQUIPMENT
}

export function dtGetEquipmentById(id: string): DtEquipmentDef | null {
  return DT_EQUIPMENT.find((e) => e.id === id) ?? null
}

export function dtGetEquipmentForSlot(state: DawnTowerState, slot: DtEquipmentSlot): DtEquipmentDef | null {
  const eqId = state.equipment[slot]
  if (!eqId) return null
  return dtGetEquipmentById(eqId)
}

export function dtGetEquippedItems(state: DawnTowerState): Record<DtEquipmentSlot, DtEquipmentDef | null> {
  return {
    weapon: dtGetEquipmentForSlot(state, 'weapon'),
    armor: dtGetEquipmentForSlot(state, 'armor'),
    helmet: dtGetEquipmentForSlot(state, 'helmet'),
    boots: dtGetEquipmentForSlot(state, 'boots'),
    accessory: dtGetEquipmentForSlot(state, 'accessory'),
  }
}

export function dtGetInventory(state: DawnTowerState): DtEquipmentDef[] {
  return state.inventory
    .map((id) => dtGetEquipmentById(id))
    .filter((e): e is DtEquipmentDef => e !== null)
}

export function dtEquipItem(state: DawnTowerState, itemId: string): DawnTowerState {
  const item = dtGetEquipmentById(itemId)
  if (!item) return state
  if (!state.inventory.includes(itemId)) return state

  const currentEquipped = state.equipment[item.slot]
  const newInventory = state.inventory.filter((id) => id !== itemId)
  if (currentEquipped) {
    newInventory.push(currentEquipped)
  }

  return {
    ...state,
    equipment: { ...state.equipment, [item.slot]: itemId },
    inventory: newInventory,
    lastAction: `Equipped ${item.name}!`,
  }
}

export function dtUnequipItem(state: DawnTowerState, slot: DtEquipmentSlot): DawnTowerState {
  const equippedId = state.equipment[slot]
  if (!equippedId) return state

  return {
    ...state,
    equipment: { ...state.equipment, [slot]: null },
    inventory: [...state.inventory, equippedId],
    lastAction: `Unequipped item from ${slot} slot.`,
  }
}

export function dtAddItemToInventory(state: DawnTowerState, itemId: string): DawnTowerState {
  if (state.inventory.includes(itemId)) return state
  return { ...state, inventory: [...state.inventory, itemId] }
}

export function dtRemoveItemFromInventory(state: DawnTowerState, itemId: string): DawnTowerState {
  return { ...state, inventory: state.inventory.filter((id) => id !== itemId) }
}

function dtGetEquipmentAttackBonus(state: DawnTowerState): number {
  let bonus = 0
  for (const slot of Object.keys(state.equipment) as DtEquipmentSlot[]) {
    const eq = dtGetEquipmentForSlot(state, slot)
    if (eq) bonus += eq.attack
  }
  return bonus
}

function dtGetEquipmentDefenseBonus(state: DawnTowerState): number {
  let bonus = 0
  for (const slot of Object.keys(state.equipment) as DtEquipmentSlot[]) {
    const eq = dtGetEquipmentForSlot(state, slot)
    if (eq) bonus += eq.defense
  }
  return bonus
}

function dtGetEquipmentSpeedBonus(state: DawnTowerState): number {
  let bonus = 0
  for (const slot of Object.keys(state.equipment) as DtEquipmentSlot[]) {
    const eq = dtGetEquipmentForSlot(state, slot)
    if (eq) bonus += eq.speed
  }
  return bonus
}

function dtGetEquipmentHPBonus(state: DawnTowerState): number {
  let bonus = 0
  for (const slot of Object.keys(state.equipment) as DtEquipmentSlot[]) {
    const eq = dtGetEquipmentForSlot(state, slot)
    if (eq) bonus += eq.hp
  }
  return bonus
}

export function dtGetEquipmentStats(state: DawnTowerState): {
  attack: number
  defense: number
  speed: number
  hp: number
} {
  return {
    attack: dtGetEquipmentAttackBonus(state),
    defense: dtGetEquipmentDefenseBonus(state),
    speed: dtGetEquipmentSpeedBonus(state),
    hp: dtGetEquipmentHPBonus(state),
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: PURE FUNCTIONS — BATTLE SYSTEM
// ═══════════════════════════════════════════════════════════════════

export function dtInitBattle(state: DawnTowerState): DawnTowerState {
  const monster = dtGetMonsterForFloor(state.currentFloor)
  if (!monster) return state

  const difficulty = Math.min(10, Math.ceil(state.currentFloor / 10))
  const wordPool = dtGetWordsForDifficulty(difficulty)
  const currentWord = wordPool[Math.floor(Math.abs(Math.sin(state.currentFloor * 7)) * wordPool.length)] ?? wordPool[0]

  const battle: DtBattleState = {
    monsterId: monster.id,
    monsterHP: monster.hp,
    monsterMaxHP: monster.hp,
    monsterAttack: monster.attack,
    monsterDefense: monster.defense,
    monsterPattern: monster.attackPattern,
    turnCount: 0,
    wordsTyped: [],
    damageDealt: 0,
    damageReceived: 0,
    statusEffects: [],
    isVictory: false,
    isDefeat: false,
    isFled: false,
    wordPool,
    currentWord,
  }

  return {
    ...state,
    currentBattle: battle,
    lastAction: `A ${monster.name} appears! Type words to attack!`,
    lastFloorType: 'battle',
  }
}

export function dtGetBattleState(state: DawnTowerState): DtBattleState | null {
  return state.currentBattle
}

export function dtGetBattleWord(state: DawnTowerState): string | null {
  return state.currentBattle?.currentWord ?? null
}

export function dtGetBattleMonsterHP(state: DawnTowerState): number {
  return state.currentBattle?.monsterHP ?? 0
}

export function dtGetBattleMonsterMaxHP(state: DawnTowerState): number {
  return state.currentBattle?.monsterMaxHP ?? 0
}

export function dtIsBattleActive(state: DawnTowerState): boolean {
  if (!state.currentBattle) return false
  return !state.currentBattle.isVictory && !state.currentBattle.isDefeat && !state.currentBattle.isFled
}

export function dtProcessBattleWord(state: DawnTowerState, typedWord: string): DawnTowerState {
  if (!state.currentBattle || state.currentBattle.isVictory || state.currentBattle.isDefeat) {
    return state
  }

  const battle = { ...state.currentBattle }
  const isCorrect = typedWord.trim().toLowerCase() === battle.currentWord.toLowerCase()
  const newState = { ...state, totalWordsTyped: state.totalWordsTyped + 1 }

  battle.turnCount++

  if (isCorrect) {
    newState.totalWordsCorrect = state.totalWordsCorrect + 1
    const playerAtk = dtGetPlayerAttack(newState)
    const wordPower = typedWord.length * 2
    const rawDamage = Math.max(1, playerAtk + wordPower - battle.monsterDefense)
    const damage = Math.floor(rawDamage * (0.8 + Math.abs(Math.sin(typedWord.length * 3)) * 0.4))
    battle.monsterHP = Math.max(0, battle.monsterHP - damage)
    battle.damageDealt += damage
    battle.wordsTyped.push(typedWord)
    battle.currentWord = battle.wordPool[Math.floor(Math.abs(Math.sin(damage * battle.turnCount)) * battle.wordPool.length)] ?? battle.wordPool[0]
    newState.lastAction = `Hit! "${typedWord}" dealt ${damage} damage!`

    if (battle.monsterHP <= 0) {
      battle.isVictory = true
      newState.lastAction = `Victory! The ${dtGetMonsterName(battle.monsterId)} was defeated!`
    }
  } else {
    newState.lastAction = `Miss! The word was "${battle.currentWord}", not "${typedWord}".`
    const monsterPattern = battle.monsterPattern
    let monsterDmg = battle.monsterAttack

    if (monsterPattern === 'counter' || monsterPattern === 'rage') {
      monsterDmg = Math.floor(monsterDmg * (1 + battle.turnCount * 0.05))
    } else if (monsterPattern === 'heavy') {
      monsterDmg = Math.floor(monsterDmg * 1.8)
    } else if (monsterPattern === 'rapid') {
      monsterDmg = Math.floor(monsterDmg * 0.6)
    }

    const playerDef = dtGetPlayerDefense(newState)
    const finalDamage = Math.max(1, monsterDmg - Math.floor(playerDef * 0.5))
    newState.playerHP = Math.max(0, newState.playerHP - finalDamage)
    battle.damageReceived += finalDamage
    newState.lastAction += ` Monster attacks for ${finalDamage} damage!`

    if (newState.playerHP <= 0) {
      battle.isDefeat = true
      if (newState.revivalScrolls > 0) {
        const effectiveMaxHP = newState.playerMaxHP + dtGetPlayerHPBonus(newState)
        newState.playerHP = Math.floor(effectiveMaxHP * 0.5)
        newState.revivalScrolls -= 1
        battle.isDefeat = false
        newState.lastAction += ' Revival Scroll activated! You revive with 50% HP!'
      } else {
        newState.lastAction += ' You have been defeated...'
      }
    }
  }

  return { ...newState, currentBattle: battle }
}

export function dtFleeBattle(state: DawnTowerState): DawnTowerState {
  if (!state.currentBattle) return state
  const escaped = Math.abs(Math.sin(state.currentFloor * 13)) > 0.3
  if (escaped) {
    return {
      ...state,
      currentBattle: { ...state.currentBattle, isFled: true },
      lastAction: 'You fled from battle! The monster lets you go...',
    }
  }
  const monsterDmg = Math.floor(state.currentBattle.monsterAttack * 1.5)
  const newHP = Math.max(0, state.playerHP - monsterDmg)
  return {
    ...state,
    playerHP: newHP,
    currentBattle: { ...state.currentBattle, turnCount: state.currentBattle.turnCount + 1 },
    lastAction: `Failed to flee! Monster attacks for ${monsterDmg} damage!`,
  }
}

export function dtResolveBattle(state: DawnTowerState): DawnTowerState {
  if (!state.currentBattle) return state
  const battle = state.currentBattle
  let s: DawnTowerState = { ...state, currentBattle: null }

  if (battle.isVictory) {
    const monster = dtGetMonsterById(battle.monsterId)
    const xpReward = monster?.xpReward ?? 10
    const goldReward = monster?.goldReward ?? 5
    s = dtAddXP(s, xpReward)
    s = dtAddGold(s, goldReward)
    s.totalMonstersDefeated += 1
    if (!s.defeatedMonsters.includes(battle.monsterId)) {
      s.defeatedMonsters = [...s.defeatedMonsters, battle.monsterId]
    }
    if (monster?.isBoss) {
      s.totalBossesDefeated += 1
    }
    if (!s.clearedFloors.includes(s.currentFloor)) {
      s.clearedFloors = [...s.clearedFloors, s.currentFloor]
    }
    if (s.currentFloor > s.bestFloor) {
      s.bestFloor = s.currentFloor
    }
    s.lastAction = `Defeated ${monster?.name ?? 'monster'}! +${xpReward} XP, +${goldReward} Gold.`
  } else if (battle.isDefeat) {
    s.isGameOver = true
    s.lastAction = 'You were defeated. The tower claims another adventurer...'
  }

  return s
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 18: PURE FUNCTIONS — DAMAGE CALCULATION
// ═══════════════════════════════════════════════════════════════════

export function dtCalculateDamage(
  attackerPower: number,
  defenderDefense: number,
  wordLength: number,
  isCritical: boolean
): number {
  const base = Math.max(1, attackerPower + wordLength * 2 - Math.floor(defenderDefense * 0.5))
  const variance = base * (0.8 + Math.abs(Math.sin(wordLength * 7)) * 0.4)
  const critical = isCritical ? 1.5 : 1.0
  return Math.floor(variance * critical)
}

export function dtCalculateXPReward(floor: number, isBoss: boolean, wordsTyped: number): number {
  const base = isBoss ? floor * 10 : floor * 3
  const efficiencyBonus = Math.floor(base * Math.min(1, wordsTyped / 10))
  return base + efficiencyBonus
}

export function dtCalculateGoldReward(floor: number, isBoss: boolean): number {
  const base = isBoss ? floor * 8 : floor * 2
  return Math.floor(base * (0.8 + Math.abs(Math.sin(floor * 5)) * 0.4))
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 19: PURE FUNCTIONS — GOLD & CURRENCY
// ═══════════════════════════════════════════════════════════════════

export function dtAddGold(state: DawnTowerState, amount: number): DawnTowerState {
  return {
    ...state,
    gold: state.gold + amount,
    totalGoldEarned: state.totalGoldEarned + amount,
  }
}

export function dtSpendGold(state: DawnTowerState, amount: number): DawnTowerState {
  if (state.gold < amount) return state
  return { ...state, gold: state.gold - amount }
}

export function dtCanAfford(state: DawnTowerState, amount: number): boolean {
  return state.gold >= amount
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 20: PURE FUNCTIONS — HEALING & DAMAGE
// ═══════════════════════════════════════════════════════════════════

export function dtHealPlayer(state: DawnTowerState, amount: number): DawnTowerState {
  const effectiveMaxHP = state.playerMaxHP + dtGetPlayerHPBonus(state)
  const newHP = Math.min(effectiveMaxHP, state.playerHP + amount)
  return { ...state, playerHP: newHP, lastAction: `Healed ${Math.min(amount, newHP - state.playerHP)} HP!` }
}

export function dtHealFull(state: DawnTowerState): DawnTowerState {
  const effectiveMaxHP = state.playerMaxHP + dtGetPlayerHPBonus(state)
  return { ...state, playerHP: effectiveMaxHP, lastAction: 'Fully healed!' }
}

export function dtDamagePlayer(state: DawnTowerState, amount: number): DawnTowerState {
  return { ...state, playerHP: Math.max(0, state.playerHP - amount) }
}

export function dtRevivePlayer(state: DawnTowerState): DawnTowerState {
  const effectiveMaxHP = state.playerMaxHP + dtGetPlayerHPBonus(state)
  return {
    ...state,
    playerHP: Math.floor(effectiveMaxHP * 0.5),
    isGameOver: false,
    lastAction: 'Revived with 50% HP! The tower grants you another chance.',
  }
}

export function dtIsPlayerDefeated(state: DawnTowerState): boolean {
  return state.playerHP <= 0 || state.isGameOver
}

export function dtIsMonsterDefeated(state: DawnTowerState): boolean {
  return state.currentBattle?.isVictory ?? false
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 21: PURE FUNCTIONS — FLOOR SKIP & REVIVAL
// ═══════════════════════════════════════════════════════════════════

export function dtUseFloorSkip(state: DawnTowerState): DawnTowerState {
  if (state.floorSkipTokens <= 0) return state
  return {
    ...state,
    floorSkipTokens: state.floorSkipTokens - 1,
    lastAction: `Used Floor Skip Token! Skipped floor ${state.currentFloor}.`,
  }
}

export function dtHasFloorSkip(state: DawnTowerState): boolean {
  return state.floorSkipTokens > 0
}

export function dtUseRevivalScroll(state: DawnTowerState): DawnTowerState {
  if (state.revivalScrolls <= 0) return state
  return dtRevivePlayer({ ...state, revivalScrolls: state.revivalScrolls - 1 })
}

export function dtHasRevivalScroll(state: DawnTowerState): boolean {
  return state.revivalScrolls > 0
}

export function dtAddFloorSkipTokens(state: DawnTowerState, count: number): DawnTowerState {
  return { ...state, floorSkipTokens: state.floorSkipTokens + count }
}

export function dtAddRevivalScrolls(state: DawnTowerState, count: number): DawnTowerState {
  return { ...state, revivalScrolls: state.revivalScrolls + count }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 22: PURE FUNCTIONS — SHOP
// ═══════════════════════════════════════════════════════════════════

export function dtGetShopItemsForFloor(floor: number): DtShopItemDef[] {
  if (!dtIsShopFloor(floor)) return []
  const available = DT_SHOP_ITEMS.filter((item) => {
    if (item.type === 'equipment') return false
    return true
  })
  return available
}

export function dtGetAllShopItems(): readonly DtShopItemDef[] {
  return DT_SHOP_ITEMS
}

export function dtBuyShopItem(state: DawnTowerState, itemId: string): DawnTowerState {
  const item = DT_SHOP_ITEMS.find((i) => i.id === itemId)
  if (!item) return state
  if (state.gold < item.price) return state

  let s = dtSpendGold(state, item.price)
  s.totalShopPurchases += 1

  switch (item.effect) {
    case 'heal_50':
      s = dtHealPlayer(s, 50)
      break
    case 'heal_full':
      s = dtHealFull(s)
      break
    case 'skip_floor':
      s = dtAddFloorSkipTokens(s, 1)
      break
    case 'revive':
      s = dtAddRevivalScrolls(s, 1)
      break
    default:
      break
  }

  s.lastAction = `Purchased ${item.name} for ${item.price} gold!`
  return s
}

export function dtGetShopPrice(itemId: string): number {
  const item = DT_SHOP_ITEMS.find((i) => i.id === itemId)
  return item?.price ?? 0
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 23: PURE FUNCTIONS — PUZZLE SYSTEM
// ═══════════════════════════════════════════════════════════════════

export function dtGetPuzzleWords(floor: number): string[] {
  const difficulty = Math.min(10, Math.ceil(floor / 10))
  const pool = DT_WORD_POOLS[difficulty] ?? DT_WORD_POOLS[1]
  const count = 3 + Math.floor(difficulty / 2)
  const words: string[] = []
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const idx = Math.floor(Math.abs(Math.sin(floor * (i + 3) * 7)) * pool.length)
    const word = pool[idx]
    if (word && !words.includes(word)) {
      words.push(word)
    }
  }
  return words
}

export function dtGetPuzzleHint(word: string): string {
  if (word.length <= 2) return `This word has ${word.length} letters.`
  const first = word[0].toUpperCase()
  const last = word[word.length - 1].toUpperCase()
  return `${first}_${'_'.repeat(word.length - 2)}${last} (${word.length} letters)`
}

export function dtSolvePuzzle(state: DawnTowerState, typedWord: string): DawnTowerState {
  const puzzleWords = dtGetPuzzleWords(state.currentFloor)
  const isCorrect = puzzleWords.some(
    (w) => w.toLowerCase() === typedWord.trim().toLowerCase()
  )

  if (isCorrect) {
    const xp = dtCalculateXPReward(state.currentFloor, false, 1)
    const gold = dtCalculateGoldReward(state.currentFloor, false)
    let s = dtAddXP(state, xp)
    s = dtAddGold(s, gold)
    s.totalPuzzlesSolved += 1
    if (!s.clearedFloors.includes(s.currentFloor)) {
      s.clearedFloors = [...s.clearedFloors, s.currentFloor]
    }
    if (s.currentFloor > s.bestFloor) {
      s.bestFloor = s.currentFloor
    }
    return { ...s, lastAction: `Puzzle solved! +${xp} XP, +${gold} Gold.`, lastFloorType: 'puzzle' }
  }

  return {
    ...state,
    lastAction: `Wrong answer! The word "${typedWord}" is not the solution.`,
    lastFloorType: 'puzzle',
  }
}

export function dtGetPuzzleReward(floor: number): { xp: number; gold: number } {
  return {
    xp: dtCalculateXPReward(floor, false, 1),
    gold: dtCalculateGoldReward(floor, false),
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 24: PURE FUNCTIONS — TREASURE SYSTEM
// ═══════════════════════════════════════════════════════════════════

export function dtGenerateTreasure(floor: number): DtFloorReward {
  const gold = dtCalculateGoldReward(floor, false) * 2
  const xp = Math.floor(dtCalculateXPReward(floor, false, 3) * 0.5)
  const healAmount = Math.floor(10 + Math.abs(Math.sin(floor * 3)) * 20)
  const equipmentChance = Math.abs(Math.sin(floor * 11))

  let equipmentFound: string | null = null
  if (equipmentChance > 0.7) {
    const available = DT_EQUIPMENT.filter((e) => e.minFloor <= floor)
    if (available.length > 0) {
      const idx = Math.floor(equipmentChance * available.length) % available.length
      equipmentFound = available[idx].id
    }
  }

  const skipTokens = floor % 20 === 0 ? 1 : 0
  const revivalScrolls = floor % 30 === 0 ? 1 : 0

  return {
    xp,
    gold,
    items: equipmentFound ? [equipmentFound] : [],
    healAmount,
    skipTokens,
    revivalScrolls,
    equipmentFound,
  }
}

export function dtCollectTreasure(state: DawnTowerState): DawnTowerState {
  const reward = dtGenerateTreasure(state.currentFloor)
  let s = dtAddXP(state, reward.xp)
  s = dtAddGold(s, reward.gold)
  s = dtHealPlayer(s, reward.healAmount)
  s.totalTreasuresFound += 1

  if (reward.equipmentFound) {
    s = dtAddItemToInventory(s, reward.equipmentFound)
    const eq = dtGetEquipmentById(reward.equipmentFound)
    s.lastAction = `Found treasure! +${reward.gold} Gold, +${reward.xp} XP, found ${eq?.name ?? 'equipment'}!`
  } else {
    s.lastAction = `Found treasure! +${reward.gold} Gold, +${reward.xp} XP, healed ${reward.healAmount} HP!`
  }

  if (reward.skipTokens > 0) s = dtAddFloorSkipTokens(s, reward.skipTokens)
  if (reward.revivalScrolls > 0) s = dtAddRevivalScrolls(s, reward.revivalScrolls)

  if (!s.clearedFloors.includes(s.currentFloor)) {
    s.clearedFloors = [...s.clearedFloors, s.currentFloor]
  }
  if (s.currentFloor > s.bestFloor) {
    s.bestFloor = s.currentFloor
  }

  return { ...s, lastFloorType: 'treasure' }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 25: PURE FUNCTIONS — TRAP SYSTEM
// ═══════════════════════════════════════════════════════════════════

export function dtGenerateTrap(floor: number): { damage: number; type: string; description: string } {
  const baseDamage = 5 + Math.floor(floor * 1.5)
  const trapTypes = [
    { type: 'spike_floor', description: 'A spike trap springs from the floor!' },
    { type: 'fire_jet', description: 'Jets of fire erupt from the walls!' },
    { type: 'poison_gas', description: 'A cloud of poison gas fills the corridor!' },
    { type: 'falling_rocks', description: 'Rocks fall from the ceiling!' },
    { type: 'ice_blast', description: 'A blast of freezing air hits you!' },
    { type: 'lightning_trap', description: 'Lightning arcs from hidden conduits!' },
  ]
  const idx = Math.floor(Math.abs(Math.sin(floor * 9)) * trapTypes.length)
  const trap = trapTypes[idx] ?? trapTypes[0]
  return { damage: baseDamage, type: trap.type, description: trap.description }
}

export function dtHandleTrap(state: DawnTowerState): DawnTowerState {
  const trap = dtGenerateTrap(state.currentFloor)
  const playerDef = dtGetPlayerDefense(state)
  const actualDamage = Math.max(1, trap.damage - Math.floor(playerDef * 0.3))
  const s = dtDamagePlayer(state, actualDamage)
  s.totalTrapsTriggered += 1
  s.lastAction = `Trap! ${trap.description} Took ${actualDamage} damage!`
  s.lastFloorType = 'trap'
  if (!s.clearedFloors.includes(s.currentFloor)) {
    s.clearedFloors = [...s.clearedFloors, s.currentFloor]
  }
  return s
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 26: PURE FUNCTIONS — CLIMB & ADVANCE
// ═══════════════════════════════════════════════════════════════════

export function dtCanClimb(state: DawnTowerState): boolean {
  if (state.isGameOver) return false
  if (state.currentFloor > 100) return false
  if (state.currentBattle && !state.currentBattle.isVictory && !state.currentBattle.isDefeat) return false
  return true
}

export function dtAdvanceFloor(state: DawnTowerState): DawnTowerState {
  if (state.currentFloor >= 100) {
    return { ...state, isVictory: true, lastAction: 'You have conquered the Dawn Tower!' }
  }
  return {
    ...state,
    currentFloor: state.currentFloor + 1,
    lastFloorType: 'battle',
    lastAction: `Ascending to floor ${state.currentFloor + 1}...`,
  }
}

export function dtClimbResult(state: DawnTowerState): DawnTowerState {
  if (state.floorSkipTokens > 0 && !dtIsBossFloor(state.currentFloor)) {
    let s = dtUseFloorSkip(state)
    s = dtAdvanceFloor(s)
    s.totalTowerClimbs += 1
    return s
  }

  const floorType = dtGetFloorType(state.currentFloor)
  let s = { ...state, lastFloorType: floorType }

  switch (floorType) {
    case 'battle':
      s = dtInitBattle(s)
      break
    case 'puzzle':
      s.lastAction = `Floor ${s.currentFloor}: Solve the word puzzle!`
      break
    case 'treasure':
      s = dtCollectTreasure(s)
      s = dtAdvanceFloor(s)
      break
    case 'trap':
      s = dtHandleTrap(s)
      if (s.playerHP > 0) {
        s = dtAdvanceFloor(s)
      }
      break
    case 'boss':
      s = dtInitBattle(s)
      break
    case 'shop':
      s.lastAction = `Floor ${s.currentFloor}: A merchant awaits! Browse the shop.`
      break
  }

  s.totalTowerClimbs += 1
  return s
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 27: PURE FUNCTIONS — DAILY CHALLENGE
// ═══════════════════════════════════════════════════════════════════

export function dtGetDailyChallenge(state: DawnTowerState): DtDailyChallenge | null {
  return state.dailyChallenge
}

export function dtInitDailyChallenge(state: DawnTowerState, date: string): DawnTowerState {
  const targetFloor = 5 + Math.floor(Math.abs(Math.sin(date.length * 7)) * 10)
  return {
    ...state,
    dailyChallenge: {
      targetFloor,
      floorsClimbed: 0,
      monstersDefeated: 0,
      wordsTypedCorrect: 0,
      goldEarned: 0,
      isCompleted: false,
      date,
    },
    dailyChallengeDate: date,
  }
}

export function dtUpdateDailyProgress(state: DawnTowerState): DawnTowerState {
  if (!state.dailyChallenge || state.dailyChallenge.isCompleted) return state
  const challenge = { ...state.dailyChallenge }
  challenge.floorsClimbed = state.clearedFloors.length
  challenge.monstersDefeated = state.totalMonstersDefeated
  challenge.wordsTypedCorrect = state.totalWordsCorrect
  challenge.goldEarned = state.totalGoldEarned

  if (challenge.floorsClimbed >= challenge.targetFloor) {
    challenge.isCompleted = true
  }

  return { ...state, dailyChallenge: challenge }
}

export function dtIsDailyComplete(state: DawnTowerState): boolean {
  return state.dailyChallenge?.isCompleted ?? false
}

export function dtGetDailyProgress(state: DawnTowerState): number {
  if (!state.dailyChallenge) return 0
  return Math.min(1, state.dailyChallenge.floorsClimbed / state.dailyChallenge.targetFloor)
}

export function dtGetDailyChallengeReward(state: DawnTowerState): { xp: number; gold: number } {
  if (!state.dailyChallenge) return { xp: 0, gold: 0 }
  return { xp: 200, gold: 150 }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 28: PURE FUNCTIONS — ACHIEVEMENTS
// ═══════════════════════════════════════════════════════════════════

export function dtGetAllAchievements(): readonly DtAchievementDef[] {
  return DT_ACHIEVEMENTS
}

export function dtGetUnlockedAchievements(state: DawnTowerState): string[] {
  return state.unlockedAchievements
}

export function dtCheckNewAchievements(state: DawnTowerState): DtAchievementDef[] {
  return DT_ACHIEVEMENTS.filter(
    (a) => !state.unlockedAchievements.includes(a.id) && a.condition(state)
  )
}

export function dtClaimAchievement(state: DawnTowerState, achievementId: string): DawnTowerState {
  const achievement = DT_ACHIEVEMENTS.find((a) => a.id === achievementId)
  if (!achievement) return state
  if (state.unlockedAchievements.includes(achievementId)) return state
  if (!achievement.condition(state)) return state

  let s = dtAddGold(state, achievement.reward.gold)
  s = dtAddXP(s, achievement.reward.xp)
  s.unlockedAchievements = [...s.unlockedAchievements, achievementId]
  s.lastAction = `Achievement Unlocked: ${achievement.emoji} ${achievement.name}! +${achievement.reward.gold} Gold, +${achievement.reward.xp} XP!`
  return s
}

export function dtClaimAllAchievements(state: DawnTowerState): DawnTowerState {
  const newOnes = dtCheckNewAchievements(state)
  let s = { ...state }
  for (const a of newOnes) {
    s = dtClaimAchievement(s, a.id)
  }
  return s
}

export function dtGetAchievementProgress(state: DawnTowerState, achievementId: string): number {
  const ach = DT_ACHIEVEMENTS.find((a) => a.id === achievementId)
  if (!ach) return 0
  return ach.condition(state) ? 1 : 0
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 29: PURE FUNCTIONS — WORD SYSTEM
// ═══════════════════════════════════════════════════════════════════

export function dtGetWordsForDifficulty(difficulty: number): string[] {
  const d = Math.max(1, Math.min(10, difficulty))
  return DT_WORD_POOLS[d] ?? DT_WORD_POOLS[1]
}

export function dtGetBattleWords(floor: number): string[] {
  const difficulty = Math.min(10, Math.ceil(floor / 10))
  return dtGetWordsForDifficulty(difficulty)
}

export function dtGetWordDifficulty(floor: number): number {
  return Math.min(10, Math.ceil(floor / 10))
}

export function dtValidateWord(typed: string, target: string): boolean {
  return typed.trim().toLowerCase() === target.trim().toLowerCase()
}

export function dtGetWordLengthCategory(word: string): 'short' | 'medium' | 'long' | 'epic' {
  if (word.length <= 4) return 'short'
  if (word.length <= 7) return 'medium'
  if (word.length <= 11) return 'long'
  return 'epic'
}

export function dtGetWordScore(word: string, isCorrect: boolean): number {
  if (!isCorrect) return 0
  return word.length * 10 + (word.length > 8 ? 50 : 0)
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 30: PURE FUNCTIONS — PROGRESS & SUMMARY
// ═══════════════════════════════════════════════════════════════════

export function dtGetTowerProgress(state: DawnTowerState): number {
  return state.clearedFloors.length
}

export function dtGetCompletionPercent(state: DawnTowerState): number {
  return Math.floor((state.clearedFloors.length / 100) * 100)
}

export function dtGetSectionsCompleted(state: DawnTowerState): number {
  let count = 0
  for (const section of DT_SECTIONS) {
    if (state.clearedFloors.some((f) => f >= section.startFloor && f <= section.endFloor && f === section.endFloor)) {
      count++
    }
  }
  return count
}

export function dtGetMonstersDefeatedCount(state: DawnTowerState): number {
  return state.totalMonstersDefeated
}

export function dtGetUniqueMonstersDefeated(state: DawnTowerState): number {
  return state.defeatedMonsters.length
}

export function dtGetTotalGoldEarned(state: DawnTowerState): number {
  return state.totalGoldEarned
}

export function dtGetTotalXPEarned(state: DawnTowerState): number {
  return state.totalXPEarned
}

export function dtGetGameSummary(state: DawnTowerState): {
  bestFloor: number
  floorsCleared: number
  level: number
  gold: number
  monstersDefeated: number
  wordsTyped: number
  achievements: number
  completionPercent: number
  title: string
} {
  return {
    bestFloor: state.bestFloor,
    floorsCleared: state.clearedFloors.length,
    level: state.playerLevel,
    gold: state.gold,
    monstersDefeated: state.totalMonstersDefeated,
    wordsTyped: state.totalWordsCorrect,
    achievements: state.unlockedAchievements.length,
    completionPercent: dtGetCompletionPercent(state),
    title: dtGetPlayerTitle(state),
  }
}

export function dtGetFloorReward(floor: number, type: DtFloorType): DtFloorReward {
  const isBoss = type === 'boss'
  switch (type) {
    case 'battle':
    case 'boss':
      return {
        xp: dtCalculateXPReward(floor, isBoss, 5),
        gold: dtCalculateGoldReward(floor, isBoss),
        items: [],
        healAmount: 0,
        skipTokens: 0,
        revivalScrolls: 0,
        equipmentFound: null,
      }
    case 'puzzle':
      return {
        xp: dtCalculateXPReward(floor, false, 1),
        gold: dtCalculateGoldReward(floor, false),
        items: [],
        healAmount: 5,
        skipTokens: 0,
        revivalScrolls: 0,
        equipmentFound: null,
      }
    case 'treasure':
      return dtGenerateTreasure(floor)
    case 'trap':
      return {
        xp: 0,
        gold: 0,
        items: [],
        healAmount: 0,
        skipTokens: 0,
        revivalScrolls: 0,
        equipmentFound: null,
      }
    case 'shop':
      return {
        xp: 0,
        gold: 0,
        items: [],
        healAmount: 0,
        skipTokens: 0,
        revivalScrolls: 0,
        equipmentFound: null,
      }
    default:
      return {
        xp: 0,
        gold: 0,
        items: [],
        healAmount: 0,
        skipTokens: 0,
        revivalScrolls: 0,
        equipmentFound: null,
      }
  }
}

export function dtGetBossCount(): number {
  return DT_MONSTERS.filter((m) => m.isBoss).length
}

export function dtGetTotalEquipmentCount(): number {
  return DT_EQUIPMENT.length
}

export function dtIsVictory(state: DawnTowerState): boolean {
  return state.isVictory || state.clearedFloors.includes(100)
}

export function dtGetEffectiveMaxHP(state: DawnTowerState): number {
  return state.playerMaxHP + dtGetPlayerHPBonus(state)
}

export function dtGetHPPercent(state: DawnTowerState): number {
  const maxHP = dtGetEffectiveMaxHP(state)
  if (maxHP <= 0) return 0
  return Math.floor((state.playerHP / maxHP) * 100)
}

export function dtCanAffordEquipment(state: DawnTowerState, equipmentId: string): boolean {
  const eq = dtGetEquipmentById(equipmentId)
  if (!eq) return false
  return state.gold >= eq.price
}

export function dtBuyEquipment(state: DawnTowerState, equipmentId: string): DawnTowerState {
  const eq = dtGetEquipmentById(equipmentId)
  if (!eq) return state
  if (state.gold < eq.price) return state
  let s = dtSpendGold(state, eq.price)
  s = dtAddItemToInventory(s, equipmentId)
  s.totalShopPurchases += 1
  s.lastAction = `Purchased ${eq.name} for ${eq.price} gold! Added to inventory.`
  return s
}

export function dtGetSellPrice(equipmentId: string): number {
  const eq = dtGetEquipmentById(equipmentId)
  if (!eq) return 0
  return Math.floor(eq.price * 0.4)
}

export function dtSellEquipment(state: DawnTowerState, equipmentId: string): DawnTowerState {
  if (!state.inventory.includes(equipmentId)) return state
  const sellPrice = dtGetSellPrice(equipmentId)
  let s = dtRemoveItemFromInventory(state, equipmentId)
  s = dtAddGold(s, sellPrice)
  const eq = dtGetEquipmentById(equipmentId)
  s.lastAction = `Sold ${eq?.name ?? 'equipment'} for ${sellPrice} gold.`
  return s
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 31: PURE FUNCTIONS — ELEMENT INTERACTIONS
// ═══════════════════════════════════════════════════════════════════

const DT_ELEMENT_ADVANTAGE: Partial<Record<DtElement, DtElement>> = {
  fire: 'nature',
  ice: 'fire',
  shadow: 'holy',
  lightning: 'shadow',
  nature: 'ice',
  holy: 'void',
  void: 'lightning',
  arcane: 'arcane',
}

export function dtGetElementAdvantage(attackerElement: DtElement, defenderElement: DtElement): number {
  if (DT_ELEMENT_ADVANTAGE[attackerElement] === defenderElement) return 1.5
  if (DT_ELEMENT_ADVANTAGE[defenderElement] === attackerElement) return 0.7
  return 1.0
}

export function dtGetElementName(element: DtElement): string {
  const names: Record<DtElement, string> = {
    fire: 'Fire',
    ice: 'Ice',
    shadow: 'Shadow',
    lightning: 'Lightning',
    nature: 'Nature',
    holy: 'Holy',
    void: 'Void',
    arcane: 'Arcane',
  }
  return names[element]
}

export function dtGetElementEmoji(element: DtElement): string {
  const emojis: Record<DtElement, string> = {
    fire: '🔥',
    ice: '❄️',
    shadow: '🌑',
    lightning: '⚡',
    nature: '🌿',
    holy: '✨',
    void: '🌀',
    arcane: '🔮',
  }
  return emojis[element]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 32: PURE FUNCTIONS — BATTLE PATTERNS
// ═══════════════════════════════════════════════════════════════════

export function dtGetPatternMultiplier(pattern: DtAttackPattern, turnCount: number): number {
  switch (pattern) {
    case 'normal': return 1.0
    case 'rapid': return 0.6 + turnCount * 0.02
    case 'heavy': return 1.8
    case 'poison': return 0.8 + turnCount * 0.1
    case 'heal': return 0.5
    case 'debuff': return 0.7 + turnCount * 0.08
    case 'rage': return 1.0 + turnCount * 0.15
    case 'summon': return 0.6 + Math.floor(turnCount / 3) * 0.5
    case 'shield': return turnCount % 3 === 0 ? 0.2 : 1.0
    case 'counter': return 1.3
    default: return 1.0
  }
}

export function dtGetPatternName(pattern: DtAttackPattern): string {
  const names: Record<DtAttackPattern, string> = {
    normal: 'Balanced',
    rapid: 'Rapid Strike',
    heavy: 'Heavy Blow',
    poison: 'Toxic Assault',
    heal: 'Regeneration',
    debuff: 'Weakening Hex',
    rage: 'Berserker Rage',
    summon: 'Minion Summon',
    shield: 'Shield Wall',
    counter: 'Counter Attack',
  }
  return names[pattern]
}

export function dtGetPatternEmoji(pattern: DtAttackPattern): string {
  const emojis: Record<DtAttackPattern, string> = {
    normal: '⚔️',
    rapid: '💨',
    heavy: '🔨',
    poison: '🧪',
    heal: '💚',
    debuff: '💫',
    rage: '😡',
    summon: '👻',
    shield: '🛡️',
    counter: '↩️',
  }
  return emojis[pattern]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 33: PURE FUNCTIONS — RARITY HELPERS
// ═══════════════════════════════════════════════════════════════════

export function dtGetRarityColor(rarity: DtRarity): string {
  const colors: Record<DtRarity, string> = {
    common: '#9CA3AF',
    uncommon: '#22C55E',
    rare: '#3B82F6',
    epic: '#A855F7',
    legendary: '#F59E0B',
  }
  return colors[rarity]
}

export function dtGetRarityName(rarity: DtRarity): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1)
}

export function dtGetRarityEmoji(rarity: DtRarity): string {
  const emojis: Record<DtRarity, string> = {
    common: '⚪',
    uncommon: '🟢',
    rare: '🔵',
    epic: '🟣',
    legendary: '🟡',
  }
  return emojis[rarity]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 34: PURE FUNCTIONS — GAME OVER & RESTART
// ═══════════════════════════════════════════════════════════════════

export function dtGetGameOverState(state: DawnTowerState): boolean {
  return state.isGameOver
}

export function dtGetVictoryState(state: DawnTowerState): boolean {
  return state.isVictory
}

export function dtRestartTower(state: DawnTowerState): DawnTowerState {
  const summary = dtGetGameSummary(state)
  const initial = dtInitialState()
  initial.bestFloor = state.bestFloor
  initial.unlockedAchievements = state.unlockedAchievements
  initial.totalGoldEarned = state.totalGoldEarned
  initial.totalXPEarned = state.totalXPEarned
  initial.totalMonstersDefeated = state.totalMonstersDefeated
  initial.totalWordsTyped = state.totalWordsTyped
  initial.totalWordsCorrect = state.totalWordsCorrect
  initial.totalTreasuresFound = state.totalTreasuresFound
  initial.totalTrapsTriggered = state.totalTrapsTriggered
  initial.totalPuzzlesSolved = state.totalPuzzlesSolved
  initial.totalTowerClimbs = state.totalTowerClimbs
  initial.totalBossesDefeated = state.totalBossesDefeated
  initial.lastAction = `New climb begins! Previous best: Floor ${summary.bestFloor}. Good luck!`
  return initial
}

export function dtGetRunStats(state: DawnTowerState): {
  totalClimbs: number
  totalMonsters: number
  totalWords: number
  totalTreasures: number
  totalTraps: number
  totalPuzzles: number
  totalBosses: number
  totalPurchases: number
} {
  return {
    totalClimbs: state.totalTowerClimbs,
    totalMonsters: state.totalMonstersDefeated,
    totalWords: state.totalWordsCorrect,
    totalTreasures: state.totalTreasuresFound,
    totalTraps: state.totalTrapsTriggered,
    totalPuzzles: state.totalPuzzlesSolved,
    totalBosses: state.totalBossesDefeated,
    totalPurchases: state.totalShopPurchases,
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 35: PURE FUNCTIONS — SECTION-SPECIFIC QUERIES
// ═══════════════════════════════════════════════════════════════════

export function dtGetSectionName(section: DtSectionDef): string {
  return section.name
}

export function dtGetSectionNameZh(section: DtSectionDef): string {
  return section.nameZh
}

export function dtGetSectionDescription(section: DtSectionDef): string {
  return section.description
}

export function dtGetSectionElement(section: DtSectionDef): DtElement {
  return section.element
}

export function dtGetSectionColors(section: DtSectionDef): { bg: string; accent: string } {
  return { bg: section.bgColor, accent: section.accentColor }
}

export function dtGetSectionProgress(state: DawnTowerState, section: DtSectionDef): number {
  const sectionFloors = dtGetSectionFloors(section)
  const cleared = sectionFloors.filter((f) => state.clearedFloors.includes(f))
  return cleared.length
}

export function dtIsSectionComplete(state: DawnTowerState, section: DtSectionDef): boolean {
  return dtGetSectionProgress(state, section) >= 10
}

export function dtGetCurrentSectionProgress(state: DawnTowerState): number {
  const section = dtGetCurrentSection(state)
  return dtGetSectionProgress(state, section)
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 36: PURE FUNCTIONS — STAT COMPARISON
// ═══════════════════════════════════════════════════════════════════

export function dtCompareEquipment(a: DtEquipmentDef, b: DtEquipmentDef): number {
  const scoreA = a.attack * 3 + a.defense * 2 + a.hp + a.speed * 2
  const scoreB = b.attack * 3 + b.defense * 2 + b.hp + b.speed * 2
  return scoreA - scoreB
}

export function dtGetBestWeapon(state: DawnTowerState): DtEquipmentDef | null {
  const weapons = DT_EQUIPMENT.filter(
    (e) => e.slot === 'weapon' && (state.inventory.includes(e.id) || state.equipment.weapon === e.id)
  )
  if (weapons.length === 0) return null
  return weapons.reduce((best, w) => (dtCompareEquipment(w, best) > 0 ? w : best), weapons[0])
}

export function dtGetBestArmor(state: DawnTowerState): DtEquipmentDef | null {
  const armors = DT_EQUIPMENT.filter(
    (e) => e.slot === 'armor' && (state.inventory.includes(e.id) || state.equipment.armor === e.id)
  )
  if (armors.length === 0) return null
  return armors.reduce((best, a) => (dtCompareEquipment(a, best) > 0 ? a : best), armors[0])
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 37: PURE FUNCTIONS — MISC UTILITIES
// ═══════════════════════════════════════════════════════════════════

export function dtGetLastAction(state: DawnTowerState): string {
  return state.lastAction
}

export function dtGetLastFloorType(state: DawnTowerState): DtFloorType | null {
  return state.lastFloorType
}

export function dtGetFloorTypeEmoji(type: DtFloorType): string {
  const emojis: Record<DtFloorType, string> = {
    battle: '⚔️',
    puzzle: '🧩',
    treasure: '💎',
    trap: '⚠️',
    boss: '👑',
    shop: '🏪',
  }
  return emojis[type]
}

export function dtGetFloorTypeName(type: DtFloorType): string {
  const names: Record<DtFloorType, string> = {
    battle: 'Battle',
    puzzle: 'Puzzle',
    treasure: 'Treasure',
    trap: 'Trap',
    boss: 'Boss',
    shop: 'Shop',
  }
  return names[type]
}

export function dtGetTotalAchievementCount(): number {
  return DT_ACHIEVEMENTS.length
}

export function dtGetTotalMonsterCount(): number {
  return DT_MONSTERS.length
}

export function dtGetTotalSectionCount(): number {
  return DT_SECTIONS.length
}

export function dtGetTotalFloorCount(): number {
  return 100
}

export function dtGetMaxLevel(): number {
  return 50
}

export function dtGetAttackSpeedRating(state: DawnTowerState): 'slow' | 'normal' | 'fast' | 'blazing' {
  const speed = dtGetPlayerSpeed(state)
  if (speed >= 15) return 'blazing'
  if (speed >= 10) return 'fast'
  if (speed >= 5) return 'normal'
  return 'slow'
}

export function dtGetPowerLevel(state: DawnTowerState): number {
  const stats = dtGetTotalStats(state)
  return stats.attack + stats.defense + stats.speed + Math.floor(stats.maxHP / 10) + stats.level * 5
}

export function dtGetThreatLevel(floor: number): 'easy' | 'moderate' | 'hard' | 'deadly' | 'legendary' {
  if (floor <= 20) return 'easy'
  if (floor <= 40) return 'moderate'
  if (floor <= 60) return 'hard'
  if (floor <= 80) return 'deadly'
  return 'legendary'
}

export function dtGetThreatColor(level: string): string {
  switch (level) {
    case 'easy': return '#22C55E'
    case 'moderate': return '#EAB308'
    case 'hard': return '#F97316'
    case 'deadly': return '#EF4444'
    case 'legendary': return '#A855F7'
    default: return '#9CA3AF'
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 38: REACT HOOK (DEFAULT EXPORT ONLY)
// ═══════════════════════════════════════════════════════════════════

// React is imported for the default export hook only.
// All named exports above are pure functions — no React hooks used.

import { useState, useCallback, useEffect } from 'react'

export interface UseDawnTowerReturn extends DawnTowerState {
  currentSection: DtSectionDef
  floorType: DtFloorType
  hpPercent: number
  levelProgress: number
  playerTitle: string
  totalStats: ReturnType<typeof dtGetTotalStats>
  completionPct: number
  powerLevel: number
  dtClimbFloor: () => void
  dtProcessWord: (word: string) => void
  dtFlee: () => void
  dtBuyItem: (itemId: string) => void
  dtEquip: (itemId: string) => void
  dtUnequip: (slot: DtEquipmentSlot) => void
  dtBuyEquip: (equipmentId: string) => void
  dtSellEquip: (equipmentId: string) => void
  dtUseSkip: () => void
  dtUseRevival: () => void
  dtHeal: (amount: number) => void
  dtFullHeal: () => void
  dtSolve: (word: string) => void
  dtCollect: () => void
  dtHandleTrap_: () => void
  dtAdvance: () => void
  dtRestart: () => void
  dtClaimAch: (id: string) => void
  dtClaimAllAch: () => void
  dtInitDaily: (date: string) => void
  dtUpdateDaily: () => void
  dtReset: () => void
}

export default function useDawnTower(initialState?: DawnTowerState): UseDawnTowerReturn {
  const [state, setState] = useState<DawnTowerState>(
    initialState ?? dtInitialState()
  )

  // Auto-check achievements on state change
  useEffect(() => {
    setState((prev) => {
      const newOnes = dtCheckNewAchievements(prev)
      if (newOnes.length === 0) return prev
      let s = { ...prev }
      for (const a of newOnes) {
        s = dtClaimAchievement(s, a.id)
      }
      return s
    })
  }, [state.playerLevel, state.bestFloor, state.clearedFloors.length, state.totalMonstersDefeated, state.totalWordsCorrect])

  const dtClimbFloor = useCallback(() => {
    setState((prev) => dtClimbResult(prev))
  }, [])

  const dtProcessWord = useCallback((word: string) => {
    setState((prev) => {
      const afterBattle = dtProcessBattleWord(prev, word)
      if (afterBattle.currentBattle?.isVictory) {
        return dtResolveBattle(afterBattle)
      }
      if (afterBattle.currentBattle?.isDefeat) {
        return dtResolveBattle(afterBattle)
      }
      return afterBattle
    })
  }, [])

  const dtFlee = useCallback(() => {
    setState((prev) => {
      const afterFlee = dtFleeBattle(prev)
      if (afterFlee.currentBattle?.isFled) {
        return { ...afterFlee, currentBattle: null }
      }
      return afterFlee
    })
  }, [])

  const dtBuyItem = useCallback((itemId: string) => {
    setState((prev) => dtBuyShopItem(prev, itemId))
  }, [])

  const dtEquip = useCallback((itemId: string) => {
    setState((prev) => dtEquipItem(prev, itemId))
  }, [])

  const dtUnequip = useCallback((slot: DtEquipmentSlot) => {
    setState((prev) => dtUnequipItem(prev, slot))
  }, [])

  const dtBuyEquip = useCallback((equipmentId: string) => {
    setState((prev) => dtBuyEquipment(prev, equipmentId))
  }, [])

  const dtSellEquip = useCallback((equipmentId: string) => {
    setState((prev) => dtSellEquipment(prev, equipmentId))
  }, [])

  const dtUseSkip = useCallback(() => {
    setState((prev) => dtUseFloorSkip(prev))
  }, [])

  const dtUseRevival = useCallback(() => {
    setState((prev) => dtUseRevivalScroll(prev))
  }, [])

  const dtHeal = useCallback((amount: number) => {
    setState((prev) => dtHealPlayer(prev, amount))
  }, [])

  const dtFullHeal = useCallback(() => {
    setState((prev) => dtHealFull(prev))
  }, [])

  const dtSolve = useCallback((word: string) => {
    setState((prev) => dtSolvePuzzle(prev, word))
  }, [])

  const dtCollect = useCallback(() => {
    setState((prev) => dtCollectTreasure(prev))
  }, [])

  const dtHandleTrap_ = useCallback(() => {
    setState((prev) => dtHandleTrap(prev))
  }, [])

  const dtAdvance = useCallback(() => {
    setState((prev) => dtAdvanceFloor(prev))
  }, [])

  const dtRestart = useCallback(() => {
    setState((prev) => dtRestartTower(prev))
  }, [])

  const dtClaimAch = useCallback((id: string) => {
    setState((prev) => dtClaimAchievement(prev, id))
  }, [])

  const dtClaimAllAch = useCallback(() => {
    setState((prev) => dtClaimAllAchievements(prev))
  }, [])

  const dtInitDaily = useCallback((date: string) => {
    setState((prev) => dtInitDailyChallenge(prev, date))
  }, [])

  const dtUpdateDaily = useCallback(() => {
    setState((prev) => dtUpdateDailyProgress(prev))
  }, [])

  const dtReset = useCallback(() => {
    setState(dtResetState())
  }, [])

  // Computed values
  const currentSection = dtGetCurrentSection(state)
  const floorType = dtGetFloorType(state.currentFloor)
  const hpPercent = dtGetHPPercent(state)
  const levelProgress = dtGetLevelProgress(state)
  const playerTitle = dtGetPlayerTitle(state)
  const totalStats = dtGetTotalStats(state)
  const completionPct = dtGetCompletionPercent(state)
  const powerLevel = dtGetPowerLevel(state)

  return {
    ...state,
    currentSection,
    floorType,
    hpPercent,
    levelProgress,
    playerTitle,
    totalStats,
    completionPct,
    powerLevel,
    dtClimbFloor,
    dtProcessWord,
    dtFlee,
    dtBuyItem,
    dtEquip,
    dtUnequip,
    dtBuyEquip,
    dtSellEquip,
    dtUseSkip,
    dtUseRevival,
    dtHeal,
    dtFullHeal,
    dtSolve,
    dtCollect,
    dtHandleTrap_,
    dtAdvance,
    dtRestart,
    dtClaimAch,
    dtClaimAllAch,
    dtInitDaily,
    dtUpdateDaily,
    dtReset,
  }
}
