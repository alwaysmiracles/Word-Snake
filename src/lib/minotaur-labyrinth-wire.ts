'use client'
import { useState, useCallback, useEffect, useRef } from 'react'

/* ================================================================
   MINOTAUR LABYRINTH — Wire Hook
   A hook-based labyrinth management system for maze navigation,
   minotaur battles, puzzle solving, item collection, and the
   ancient Theseus myth progression.
   Color theme: stone / brown / gold
   ================================================================ */

// ─── Type Definitions ─────────────────────────────────────────────

type MvRarityKey = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

type MvPathType = 'stone' | 'vine' | 'crystal' | 'bone' | 'gold' | 'shadow' | 'lava' | 'frost' | 'moss' | 'void' | 'water' | 'iron'

type MvRoomType = 'entrance' | 'fork' | 'dead_end' | 'treasure' | 'minotaur_lair' | 'puzzle' | 'shrine' | 'boss'

type MvMinotaurClass = 'guardian' | 'stalker' | 'charger' | 'trickster' | 'boss'

type MvPuzzleType = 'riddle' | 'lever' | 'mirror' | 'sequence' | 'memory' | 'block' | 'sound' | 'light' | 'math' | 'symbol'

type MvItemType = 'weapon' | 'armor' | 'consumable' | 'key' | 'scroll' | 'relic' | 'tool' | 'amulet'

type MvBattleStatus = 'victory' | 'defeat' | 'fled'

type MvPuzzleStatus = 'solved' | 'failed' | 'skipped'

interface MvRarityInfo {
  key: MvRarityKey
  label: string
  color: string
  glow: string
  xpMultiplier: number
  dropWeight: number
}

interface MvPath {
  id: string
  name: string
  type: MvPathType
  description: string
  dangerLevel: number
  lootChance: number
  minotaurChance: number
  puzzleChance: number
  lore: string
}

interface MvRoom {
  id: string
  name: string
  type: MvRoomType
  description: string
  connections: string[]
  dangerLevel: number
  hasMinotaur: boolean
  hasPuzzle: boolean
  hasTreasure: boolean
  lore: string
}

interface MvMinotaur {
  id: string
  name: string
  classType: MvMinotaurClass
  rarity: MvRarityKey
  hp: number
  attack: number
  defense: number
  speed: number
  description: string
  lore: string
  weaknesses: string[]
  resistances: string[]
  xpReward: number
  goldReward: number
}

interface MvPuzzle {
  id: string
  name: string
  type: MvPuzzleType
  description: string
  difficulty: number
  timeLimit: number
  hint: string
  xpReward: number
}

interface MvItem {
  id: string
  name: string
  type: MvItemType
  rarity: MvRarityKey
  power: number
  description: string
  stackable: boolean
  maxStack: number
  goldValue: number
}

interface MvTitle {
  id: string
  name: string
  requiredLevel: number
  description: string
  color: string
}

interface MvAchievement {
  id: string
  name: string
  description: string
  icon: string
  condition: string
  reward: { type: string; value: number }
}

interface MvBattleLog {
  minotaurId: string
  minotaurName: string
  status: MvBattleStatus
  turnsTaken: number
  damageDealt: number
  damageTaken: number
  timestamp: string
}

interface MvPuzzleLog {
  puzzleId: string
  puzzleName: string
  status: MvPuzzleStatus
  attempts: number
  timeSpent: number
  timestamp: string
}

interface MvExploredPath {
  pathId: string
  timesExplored: number
  lastExploredAt: string
  lootFound: number
}

interface MvRoomVisit {
  roomId: string
  timesVisited: number
  lastVisitedAt: string
  cleared: boolean
}

interface MvInventorySlot {
  itemId: string
  quantity: number
  equipped: boolean
  obtainedAt: string
}

interface MvCurrentRun {
  active: boolean
  currentRoomId: string
  currentPathId: string
  enteredAt: string
  turnsElapsed: number
  roomsVisited: string[]
  minotaursDefeated: string[]
  puzzlesSolved: string[]
  treasureCollected: number
}

interface MvCombatState {
  inCombat: boolean
  opponentId: string | null
  opponentHp: number
  opponentMaxHp: number
  playerHp: number
  playerMaxHp: number
  turn: number
  playerShield: number
}

interface MinotaurLabyrinthState {
  level: number
  xp: number
  gold: number
  health: number
  maxHealth: number
  attack: number
  defense: number
  speed: number
  currentRun: MvCurrentRun
  combatState: MvCombatState
  inventory: MvInventorySlot[]
  collectedItems: string[]
  exploredPaths: Record<string, MvExploredPath>
  roomVisits: Record<string, MvRoomVisit>
  battleLog: MvBattleLog[]
  puzzleLog: MvPuzzleLog[]
  unlockedAchievements: string[]
  activeTitleId: string
  totalRoomsExplored: number
  totalMinotaursDefeated: number
  totalPuzzlesSolved: number
  totalGoldEarned: number
  totalItemsCollected: number
  totalRunsCompleted: number
  totalDeaths: number
  totalFledBattles: number
  longestRun: number
  fastestPuzzle: number
  strongestMinotaurDefeated: number
  labyrinthDepth: number
  mazeSeed: number
  createdAt: string
  updatedAt: string
}

// ─── Constants ────────────────────────────────────────────────────

export const MV_MAX_LEVEL = 50

export const MV_RARITY: Record<MvRarityKey, MvRarityInfo> = {
  common: { key: 'common', label: 'Common', color: '#A0937D', glow: 'rgba(160,147,125,0.3)', xpMultiplier: 1, dropWeight: 40 },
  uncommon: { key: 'uncommon', label: 'Uncommon', color: '#C9A96E', glow: 'rgba(201,169,110,0.35)', xpMultiplier: 1.5, dropWeight: 30 },
  rare: { key: 'rare', label: 'Rare', color: '#DAA520', glow: 'rgba(218,165,32,0.4)', xpMultiplier: 2, dropWeight: 18 },
  epic: { key: 'epic', label: 'Epic', color: '#FF8C00', glow: 'rgba(255,140,0,0.45)', xpMultiplier: 3, dropWeight: 9 },
  legendary: { key: 'legendary', label: 'Legendary', color: '#FFD700', glow: 'rgba(255,215,0,0.5)', xpMultiplier: 5, dropWeight: 3 },
}

export const MV_RARITY_ORDER: MvRarityKey[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

export const MV_PATH_TYPES: MvPathType[] = ['stone', 'vine', 'crystal', 'bone', 'gold', 'shadow', 'lava', 'frost', 'moss', 'void', 'water', 'iron']

export const MV_ROOM_TYPES: MvRoomType[] = ['entrance', 'fork', 'dead_end', 'treasure', 'minotaur_lair', 'puzzle', 'shrine', 'boss']

export const MV_MINOTAUR_CLASSES: MvMinotaurClass[] = ['guardian', 'stalker', 'charger', 'trickster', 'boss']

export const MV_PUZZLE_TYPES: MvPuzzleType[] = ['riddle', 'lever', 'mirror', 'sequence', 'memory', 'block', 'sound', 'light', 'math', 'symbol']

export const MV_ITEM_TYPES: MvItemType[] = ['weapon', 'armor', 'consumable', 'key', 'scroll', 'relic', 'tool', 'amulet']

export const MV_THEME = {
  primary: '#8B7355',
  secondary: '#DAA520',
  accent: '#FFD700',
  stone: '#808080',
  brown: '#8B4513',
  gold: '#FFD700',
  background: '#1A1510',
  surface: '#2A2218',
  surfaceLight: '#3A3020',
  textPrimary: '#F5E6D3',
  textSecondary: '#A0937D',
  border: '#5C4A32',
  borderLight: '#8B7355',
  danger: '#B91C1C',
  health: '#4ADE80',
}

export const MV_PATHS: MvPath[] = [
  { id: 'stone-corridor', name: 'Stone Corridor', type: 'stone', description: 'A damp corridor of rough-hewn stone blocks, worn smooth by countless footsteps.', dangerLevel: 1, lootChance: 0.15, minotaurChance: 0.2, puzzleChance: 0.05, lore: 'These stones were laid by Daedalus himself, each block a piece of his imprisonment.' },
  { id: 'vine-tunnel', name: 'Vine Tunnel', type: 'vine', description: 'Thick roots and creeping vines have overtaken this passage, forming a living tunnel.', dangerLevel: 2, lootChance: 0.25, minotaurChance: 0.15, puzzleChance: 0.1, lore: 'The vines grow from the earth above, reaching down to strangle the labyrinth.' },
  { id: 'crystal-passage', name: 'Crystal Passage', type: 'crystal', description: 'Walls embedded with faintly glowing crystals cast prismatic shadows across the floor.', dangerLevel: 3, lootChance: 0.35, minotaurChance: 0.2, puzzleChance: 0.15, lore: 'The crystals sing when wind blows through cracks, a melody heard only by the lost.' },
  { id: 'bone-hallway', name: 'Bone Hallway', type: 'bone', description: 'Bones of previous wanderers line the walls, arranged in grim decorative patterns.', dangerLevel: 4, lootChance: 0.2, minotaurChance: 0.3, puzzleChance: 0.05, lore: 'Each skull once dreamed of escape. Their arrangements form a map visible only from above.' },
  { id: 'golden-avenue', name: 'Golden Avenue', type: 'gold', description: 'Thin veins of gold trace through the stone walls, glittering in torchlight.', dangerLevel: 3, lootChance: 0.5, minotaurChance: 0.25, puzzleChance: 0.1, lore: 'King Minos lined the deeper passages with gold to tempt the greedy deeper into the maze.' },
  { id: 'shadow-veil-walk', name: 'Shadow Veil Walk', type: 'shadow', description: 'An unnatural darkness clings to this path, absorbing all light sources.', dangerLevel: 5, lootChance: 0.3, minotaurChance: 0.35, puzzleChance: 0.2, lore: 'The shadows here are alive, whispering the names of those who pass through.' },
  { id: 'lava-duct', name: 'Lava Duct', type: 'lava', description: 'Molten rock flows through channels cut into the floor, radiating intense heat.', dangerLevel: 6, lootChance: 0.4, minotaurChance: 0.3, puzzleChance: 0.15, lore: 'Hephaestus forged these channels to fuel the labyrinth\'s deepest furnaces.' },
  { id: 'frost-corridor', name: 'Frost Corridor', type: 'frost', description: 'Icy formations cling to every surface, and your breath crystallizes in the frigid air.', dangerLevel: 5, lootChance: 0.35, minotaurChance: 0.25, puzzleChance: 0.2, lore: 'Boreas breathes through cracks in the foundation, freezing all who linger too long.' },
  { id: 'moss-bridge', name: 'Moss Bridge', type: 'moss', description: 'A narrow bridge over a chasm, its stone surface carpeted in thick green moss.', dangerLevel: 2, lootChance: 0.2, minotaurChance: 0.1, puzzleChance: 0.1, lore: 'The moss remembers the weight of every foot that crossed and will betray those who rush.' },
  { id: 'void-stretch', name: 'Void Stretch', type: 'void', description: 'The walls and floor fade into an inky nothingness at the edges of this path.', dangerLevel: 7, lootChance: 0.45, minotaurChance: 0.4, puzzleChance: 0.25, lore: 'Beyond the walls lies the space between dreams and waking, where the Minotaur was born.' },
  { id: 'water-channel', name: 'Water Channel', type: 'water', description: 'Knee-deep water flows through this corridor, masking the sound of footsteps.', dangerLevel: 3, lootChance: 0.3, minotaurChance: 0.2, puzzleChance: 0.15, lore: 'The water flows from the sacred spring of the labyrinth, purifying nothing it touches.' },
  { id: 'iron-march', name: 'Iron March', type: 'iron', description: 'Rusted iron plates line the walls, groaning and creaking with each step.', dangerLevel: 4, lootChance: 0.25, minotaurChance: 0.3, puzzleChance: 0.1, lore: 'These plates were forged from the weapons of failed heroes, melted down and repurposed.' },
  { id: 'echoing-gallery', name: 'Echoing Gallery', type: 'stone', description: 'A wide corridor with an arched ceiling that amplifies every sound tenfold.', dangerLevel: 3, lootChance: 0.2, minotaurChance: 0.2, puzzleChance: 0.2, lore: 'Daedalus designed this gallery so the Minotaur could hear prey from a hundred paces.' },
  { id: 'root-cellar', name: 'Root Cellar', type: 'vine', description: 'Ancient tree roots have burst through the ceiling and floor, creating obstacles.', dangerLevel: 2, lootChance: 0.3, minotaurChance: 0.1, puzzleChance: 0.15, lore: 'The great olive tree of Knossos reaches here, its roots seeking the labyrinth\'s heart.' },
  { id: 'prismatic-hall', name: 'Prismatic Hall', type: 'crystal', description: 'Massive crystal formations fill this hall, splitting light into dizzying rainbows.', dangerLevel: 4, lootChance: 0.4, minotaurChance: 0.15, puzzleChance: 0.3, lore: 'Looking into the crystals shows not your reflection but your deepest fear.' },
  { id: 'ash-corridor', name: 'Ash Corridor', type: 'bone', description: 'Fine grey ash covers the floor like snow, and the air tastes of old fires.', dangerLevel: 5, lootChance: 0.15, minotaurChance: 0.35, puzzleChance: 0.1, lore: 'The ash of burned offerings to the Minotaur coats everything in grim reminder.' },
  { id: 'tribute-road', name: 'Tribute Road', type: 'gold', description: 'Gold coins and jewels are embedded in the walls, tribute from conquered cities.', dangerLevel: 4, lootChance: 0.6, minotaurChance: 0.3, puzzleChance: 0.05, lore: 'Athens sent seven youths and seven maidens each year, and with them their city\'s wealth.' },
  { id: 'midnight-alley', name: 'Midnight Alley', type: 'shadow', description: 'Perpetual twilight dims this narrow passage, where shadows move independently.', dangerLevel: 6, lootChance: 0.25, minotaurChance: 0.4, puzzleChance: 0.2, lore: 'Here the sun has never shone. The shadows have developed a hunger of their own.' },
  { id: 'obsidian-run', name: 'Obsidian Run', type: 'lava', description: 'Smooth black volcanic glass walls reflect distorted images of those who pass.', dangerLevel: 6, lootChance: 0.35, minotaurChance: 0.35, puzzleChance: 0.15, lore: 'The obsidian was born when the labyrinth\'s original fire cooled in an instant.' },
  { id: 'glacier-trench', name: 'Glacier Trench', type: 'frost', description: 'A deep trench carved by ancient glaciers, its walls slick with frozen condensation.', dangerLevel: 6, lootChance: 0.3, minotaurChance: 0.25, puzzleChance: 0.25, lore: 'A piece of the great northern ice sheet was brought here to preserve something ancient.' },
  { id: 'fern-grotto', name: 'Fern Grotto', type: 'moss', description: 'Bioluminescent ferns illuminate this peaceful grotto with soft blue-green light.', dangerLevel: 1, lootChance: 0.35, minotaurChance: 0.05, puzzleChance: 0.15, lore: 'Ariadne planted these ferns as markers for Theseus, though time has scattered them.' },
  { id: 'abyss-edge', name: 'Abyss Edge', type: 'void', description: 'The path narrows beside a bottomless pit that swallows all light and sound.', dangerLevel: 8, lootChance: 0.5, minotaurChance: 0.45, puzzleChance: 0.3, lore: 'The abyss is where Daedalus threw the failed blueprints. Their whispers echo upward.' },
  { id: 'underground-river', name: 'Underground River', type: 'water', description: 'A swift underground river cuts across the path, its dark waters hiding secrets.', dangerLevel: 4, lootChance: 0.35, minotaurChance: 0.2, puzzleChance: 0.2, lore: 'The river flows from the stygian depths, carrying whispers of those who drowned within.' },
  { id: 'forge-walk', name: 'Forge Walk', type: 'iron', description: 'The air shimmers with heat from ancient forges that still burn along this corridor.', dangerLevel: 5, lootChance: 0.3, minotaurChance: 0.25, puzzleChance: 0.15, lore: 'Minos forced Daedalus to build weapons here, forging chains for the Minotaur.' },
  { id: 'pillar-hall', name: 'Pillar Hall', type: 'stone', description: 'Massive stone pillars support a cathedral-like ceiling, carved with forgotten runes.', dangerLevel: 4, lootChance: 0.25, minotaurChance: 0.25, puzzleChance: 0.15, lore: 'The runes are Daedalus\'s journal, a map of every corridor etched in stone code.' },
  { id: 'honeycomb-maze', name: 'Honeycomb Maze', type: 'gold', description: 'Walls of hexagonal stone cells create a disorienting honeycomb-like maze structure.', dangerLevel: 5, lootChance: 0.4, minotaurChance: 0.3, puzzleChance: 0.2, lore: 'Like the Minotaur itself, this section was built from hexagonal perfection and madness.' },
  { id: 'phantom-corridor', name: 'Phantom Corridor', type: 'shadow', description: 'Ghostly images of previous wanderers repeat their final moments on an endless loop.', dangerLevel: 7, lootChance: 0.3, minotaurChance: 0.4, puzzleChance: 0.25, lore: 'The echoes of the dead are trapped here, forever walking the path that killed them.' },
  { id: 'ember-pass', name: 'Ember Pass', type: 'lava', description: 'Floating embers drift through the air like fireflies in this warm, flickering passage.', dangerLevel: 4, lootChance: 0.3, minotaurChance: 0.2, puzzleChance: 0.1, lore: 'Each ember is a soul that tried to escape and was caught in the labyrinth\'s eternal flames.' },
  { id: 'silent-halls', name: 'Silent Halls', type: 'void', description: 'Complete silence pervades these halls, so total that your heartbeat becomes deafening.', dangerLevel: 8, lootChance: 0.4, minotaurChance: 0.5, puzzleChance: 0.35, lore: 'Sound dies here. Even the Minotaur treads softly in these sacred, quiet halls.' },
  { id: 'marble-causeway', name: 'Marble Causeway', type: 'stone', description: 'A polished marble path reflecting torchlight, leading deeper with deceptive beauty.', dangerLevel: 3, lootChance: 0.2, minotaurChance: 0.15, puzzleChance: 0.1, lore: 'Minos imported this marble from Paros to make the labyrinth feel like a palace, not a prison.' },
]

export const MV_ROOMS: MvRoom[] = [
  { id: 'entrance-hall', name: 'Entrance Hall', type: 'entrance', description: 'The massive stone doorway leading into the labyrinth, carved with warnings in ancient Greek.', connections: ['fork-chamber-alpha', 'stone-corridor'], dangerLevel: 0, hasMinotaur: false, hasPuzzle: false, hasTreasure: false, lore: '"ABANDON ALL HOPE" is carved above the lintel. Ariadne added: "OR BRING THREAD."' },
  { id: 'fork-chamber-alpha', name: 'Fork Chamber Alpha', type: 'fork', description: 'Three passages branch from this circular chamber, each leading in a different direction.', connections: ['entrance-hall', 'vine-tunnel', 'crystal-passage', 'bone-hallway'], dangerLevel: 1, hasMinotaur: false, hasPuzzle: true, hasTreasure: false, lore: 'Ariadne\'s thread points right here, but only the wise understand the direction.' },
  { id: 'dead-end-culvert', name: 'Dead End Culvert', type: 'dead_end', description: 'A cramped alcove with scratched walls where previous wanderers marked their despair.', connections: ['bone-hallway'], dangerLevel: 2, hasMinotaur: false, hasPuzzle: false, hasTreasure: true, lore: 'One wanderer scratched: "The thread lies. The Minotaur waits at the center, not the end."' },
  { id: 'treasure-vault-omega', name: 'Treasure Vault Omega', type: 'treasure', description: 'A vaulted room filled with chests of Athenian tribute and Cretan riches.', connections: ['golden-avenue', 'pillar-hall'], dangerLevel: 4, hasMinotaur: false, hasPuzzle: true, hasTreasure: true, lore: 'King Minos stored the tribute here, guarded by puzzles only a Cretan could solve.' },
  { id: 'minotaur-lair-core', name: 'Minotaur Lair Core', type: 'minotaur_lair', description: 'The central chamber where the Minotaur sleeps atop a mound of bones.', connections: ['void-stretch', 'abyss-edge', 'silent-halls'], dangerLevel: 8, hasMinotaur: true, hasPuzzle: false, hasTreasure: true, lore: 'At the heart of every maze lies the monster that gives it purpose.' },
  { id: 'puzzle-sanctum', name: 'Puzzle Sanctum', type: 'puzzle', description: 'A chamber filled with mechanical contraptions and inscribed riddles on every wall.', connections: ['crystal-passage', 'prismatic-hall', 'forge-walk'], dangerLevel: 3, hasMinotaur: false, hasPuzzle: true, hasTreasure: false, lore: 'Daedalus built this room to test the intellect of those worthy of facing the Minotaur.' },
  { id: 'shrine-of-ariadne', name: 'Shrine of Ariadne', type: 'shrine', description: 'A peaceful shrine dedicated to Ariadne, princess who helped Theseus navigate.', connections: ['fern-grotto', 'moss-bridge', 'water-channel'], dangerLevel: 1, hasMinotaur: false, hasPuzzle: false, hasTreasure: true, lore: 'Ariadne left her diadem here as a beacon. Those who find it may borrow her guidance.' },
  { id: 'boss-chamber-theseus', name: 'Boss Chamber of Theseus', type: 'boss', description: 'A grand arena where the greatest challenge of the labyrinth awaits the worthy.', connections: ['minotaur-lair-core', 'silent-halls', 'abyss-edge'], dangerLevel: 10, hasMinotaur: true, hasPuzzle: false, hasTreasure: true, lore: 'Theseus stood here and slew the Minotaur. Now a greater beast guards this sacred ground.' },
]

export const MV_MINOTAURS: MvMinotaur[] = [
  { id: 'bronze-minotaur', name: 'Bronze Minotaur', classType: 'guardian', rarity: 'common', hp: 60, attack: 8, defense: 12, speed: 4, description: 'A lesser minotaur clad in crude bronze armor, patrolling the outer corridors.', lore: 'Forged from the bronze shields of fallen Athenians, this guardian knows only duty.', weaknesses: ['pierce'], resistances: ['blunt'], xpReward: 25, goldReward: 10 },
  { id: 'shadow-bull', name: 'Shadow Bull', classType: 'stalker', rarity: 'common', hp: 45, attack: 12, defense: 6, speed: 10, description: 'A dark-furred minotaur that strikes from shadows before vanishing.', lore: 'Born from the nightmares of sacrificed children, it feeds on fear itself.', weaknesses: ['light'], resistances: ['shadow'], xpReward: 30, goldReward: 12 },
  { id: 'crystal-horn', name: 'Crystal Horn', classType: 'charger', rarity: 'uncommon', hp: 70, attack: 14, defense: 8, speed: 8, description: 'A minotaur with crystalline horns that refract light into blinding beams.', lore: 'Its horns grew from deep labyrinth crystals, absorbing their prismatic power.', weaknesses: ['blunt'], resistances: ['light', 'magic'], xpReward: 45, goldReward: 20 },
  { id: 'bone-crusher', name: 'Bone Crusher', classType: 'guardian', rarity: 'uncommon', hp: 90, attack: 10, defense: 15, speed: 3, description: 'A massive minotaur wielding a club made from fused human bones.', lore: 'It collects the bones of its victims, adding each new trophy to its terrible weapon.', weaknesses: ['fire'], resistances: ['blunt', 'pierce'], xpReward: 50, goldReward: 22 },
  { id: 'lava-bull', name: 'Lava Bull', classType: 'charger', rarity: 'rare', hp: 85, attack: 18, defense: 10, speed: 7, description: 'A minotaur wreathed in volcanic flame, leaving molten hoofprints behind.', lore: 'It emerged from the lava ducts and never left, becoming the forge\'s eternal guardian.', weaknesses: ['water', 'frost'], resistances: ['fire'], xpReward: 75, goldReward: 35 },
  { id: 'frost-maze-walker', name: 'Frost Maze Walker', classType: 'stalker', rarity: 'rare', hp: 65, attack: 15, defense: 12, speed: 9, description: 'A pale minotaur that freezes the ground it walks on, creating treacherous ice.', lore: 'Imprisoned in frost corridors for centuries, it became one with eternal winter.', weaknesses: ['fire'], resistances: ['frost', 'water'], xpReward: 70, goldReward: 30 },
  { id: 'gold-hoarder', name: 'Gold Hoarder', classType: 'trickster', rarity: 'rare', hp: 75, attack: 13, defense: 14, speed: 6, description: 'A minotaur draped in stolen gold that distracts foes with glittering coins.', lore: 'It believes gold is the source of power, not realizing the gold controls it.', weaknesses: ['earth'], resistances: ['magic'], xpReward: 65, goldReward: 80 },
  { id: 'iron-warden', name: 'Iron Warden', classType: 'guardian', rarity: 'rare', hp: 110, attack: 14, defense: 18, speed: 3, description: 'A hulking minotaur encased in rusted iron plate, nearly impervious.', lore: 'Minos\'s personal smiths created this warden from a thousand defeated swords.', weaknesses: ['magic'], resistances: ['blunt', 'pierce', 'slash'], xpReward: 80, goldReward: 40 },
  { id: 'void-stalker', name: 'Void Stalker', classType: 'stalker', rarity: 'epic', hp: 80, attack: 22, defense: 10, speed: 14, description: 'A minotaur that phases in and out of existence, attacking from impossible angles.', lore: 'It exists between moments, appearing only when it strikes then vanishing before the scream.', weaknesses: ['light', 'void'], resistances: ['physical'], xpReward: 120, goldReward: 55 },
  { id: 'echo-beast', name: 'Echo Beast', classType: 'trickster', rarity: 'epic', hp: 95, attack: 20, defense: 12, speed: 8, description: 'A minotaur that mimics voices and sounds to lure wanderers into traps.', lore: 'It learned every cry for help ever uttered in the labyrinth and reproduces them flawlessly.', weaknesses: ['silence', 'earth'], resistances: ['sound', 'shadow'], xpReward: 110, goldReward: 50 },
  { id: 'moss-titan', name: 'Moss Titan', classType: 'guardian', rarity: 'epic', hp: 150, attack: 16, defense: 20, speed: 2, description: 'An enormous minotaur overgrown with ancient moss, blending into walls.', lore: 'So old it has become part of the labyrinth itself, a living section of the maze.', weaknesses: ['fire', 'slash'], resistances: ['earth', 'nature'], xpReward: 130, goldReward: 60 },
  { id: 'phantom-minotaur', name: 'Phantom Minotaur', classType: 'boss', rarity: 'epic', hp: 120, attack: 24, defense: 14, speed: 11, description: 'The ghostly apparition of the original Minotaur, slain by Theseus.', lore: 'Theseus killed the body, but the Minotaur\'s rage refused to die. It haunts the core still.', weaknesses: ['divine', 'light'], resistances: ['shadow', 'physical'], xpReward: 200, goldReward: 100 },
  { id: 'star-horn-beast', name: 'Star-Horn Beast', classType: 'charger', rarity: 'legendary', hp: 160, attack: 28, defense: 16, speed: 12, description: 'A celestial minotaur with horns of condensed starlight, impossibly radiant.', lore: 'When Ariadne\'s diadem fell into the labyrinth, the Minotaur\'s spirit absorbed its starlight.', weaknesses: ['shadow', 'void'], resistances: ['light', 'divine'], xpReward: 300, goldReward: 150 },
  { id: 'labrys-prime', name: 'Labrys Prime', classType: 'boss', rarity: 'legendary', hp: 200, attack: 30, defense: 22, speed: 6, description: 'The original and eternal Minotaur reborn, wielding the double axe Labrys itself.', lore: 'The Labrys was the first weapon forged for the labyrinth. In the Minotaur\'s hands, it is absolute.', weaknesses: ['divine'], resistances: ['all'], xpReward: 500, goldReward: 300 },
  { id: 'blood-maze-lord', name: 'Blood Maze Lord', classType: 'boss', rarity: 'legendary', hp: 180, attack: 26, defense: 18, speed: 10, description: 'A minotaur that absorbed the essence of every creature that died in the labyrinth.', lore: 'It is not one monster but thousands, wearing the faces of every sacrifice ever offered.', weaknesses: ['purity', 'light'], resistances: ['shadow', 'void', 'physical'], xpReward: 450, goldReward: 250 },
  { id: 'maze-weaver', name: 'Maze Weaver', classType: 'trickster', rarity: 'legendary', hp: 140, attack: 25, defense: 15, speed: 15, description: 'A minotaur that can reshape labyrinth walls at will, trapping victims in dead ends.', lore: 'Daedalus secretly taught one minotaur to read his blueprints. It rewrites the maze to this day.', weaknesses: ['divine'], resistances: ['magic', 'shadow'], xpReward: 400, goldReward: 200 },
  { id: 'granite-golem', name: 'Granite Golem', classType: 'guardian', rarity: 'epic', hp: 170, attack: 14, defense: 25, speed: 1, description: 'A minotaur fused with living stone, nearly indestructible but incredibly slow.', lore: 'When a guardian stood still for a thousand years, the labyrinth grew around it, making it immortal.', weaknesses: ['earth', 'magic'], resistances: ['blunt', 'pierce', 'slash', 'fire'], xpReward: 135, goldReward: 65 },
]

export const MV_PUZZLES: MvPuzzle[] = [
  { id: 'riddle-door', name: 'Riddle Door', type: 'riddle', description: 'A stone door inscribed with an ancient riddle. Answer correctly to pass.', difficulty: 2, timeLimit: 60, hint: 'The answer speaks of what walks on four legs, then two, then three.', xpReward: 30 },
  { id: 'lever-puzzle', name: 'Lever Puzzle', type: 'lever', description: 'Five levers control the doors ahead. Only one combination opens the correct path.', difficulty: 3, timeLimit: 120, hint: 'The wall carvings show the order: up, down, down, up, up.', xpReward: 40 },
  { id: 'mirror-maze', name: 'Mirror Maze', type: 'mirror', description: 'Mirrors create infinite reflections. Find the one true path through illusions.', difficulty: 4, timeLimit: 90, hint: 'True mirrors show your reflection walking; false ones stand still.', xpReward: 50 },
  { id: 'sequence-lock', name: 'Sequence Lock', type: 'sequence', description: 'A series of symbols must be pressed in correct order to unlock the gate.', difficulty: 3, timeLimit: 60, hint: 'Each symbol represents a number: moon=1, star=2, sun=3, eye=4.', xpReward: 35 },
  { id: 'memory-walls', name: 'Memory Walls', type: 'memory', description: 'Tiles light up in a pattern. Reproduce the pattern from memory to proceed.', difficulty: 3, timeLimit: 45, hint: 'Focus on the corners first — the pattern always starts from the top-left.', xpReward: 40 },
  { id: 'block-puzzle', name: 'Block Puzzle', type: 'block', description: 'Stone blocks must be pushed into correct positions to create a walkable path.', difficulty: 4, timeLimit: 180, hint: 'Push the blocks against the walls first, then fill the center gaps.', xpReward: 55 },
  { id: 'sound-chimes', name: 'Sound Chimes', type: 'sound', description: 'Wind chimes play a melody. Recreate it by touching the correct chimes.', difficulty: 3, timeLimit: 60, hint: 'The melody follows a simple scale: do-re-mi-fa-sol-la-ti-do.', xpReward: 45 },
  { id: 'light-beam', name: 'Light Beam', type: 'light', description: 'Rotate mirrors to direct a beam of light from a crystal to the door mechanism.', difficulty: 5, timeLimit: 120, hint: 'Start by angling the mirror nearest the light source toward the second mirror.', xpReward: 60 },
  { id: 'math-of-daedalus', name: 'Math of Daedalus', type: 'math', description: 'Solve a mathematical problem inscribed on the door to unlock the mechanism.', difficulty: 3, timeLimit: 90, hint: 'The formula involves the golden ratio, phi, which Daedalus used in his architecture.', xpReward: 45 },
  { id: 'symbol-match', name: 'Symbol Match', type: 'symbol', description: 'Match pairs of ancient Minoan symbols hidden beneath stone tablets.', difficulty: 2, timeLimit: 60, hint: 'Symbols with curved lines pair together, as do those with straight lines.', xpReward: 30 },
  { id: 'weight-balance', name: 'Weight Balance', type: 'math', description: 'Place weights on a scale to achieve perfect balance and open the door.', difficulty: 4, timeLimit: 90, hint: 'Start with the heaviest weight and adjust incrementally.', xpReward: 50 },
  { id: 'thread-puzzle', name: 'Thread Puzzle', type: 'sequence', description: 'Untangle a complex knot of golden thread without breaking it.', difficulty: 5, timeLimit: 180, hint: 'Always pull the loosest end, never the tightest loop.', xpReward: 65 },
  { id: 'torch-sequence', name: 'Torch Sequence', type: 'light', description: 'Light torches in the correct order based on the frescoes on the walls.', difficulty: 3, timeLimit: 75, hint: 'The frescoes depict the story of the Minotaur in chronological order.', xpReward: 40 },
  { id: 'echo-chamber', name: 'Echo Chamber', type: 'sound', description: 'Speak the correct words into the echo chamber to resonate the lock open.', difficulty: 4, timeLimit: 90, hint: 'The inscription reads: "Speak the name of the one who built this prison."', xpReward: 55 },
  { id: 'constellation-floor', name: 'Constellation Floor', type: 'symbol', description: 'Step on tiles in the pattern of a constellation to reveal the hidden exit.', difficulty: 5, timeLimit: 120, hint: 'The constellation is Taurus — connecting seven stars in a V-shape.', xpReward: 60 },
  { id: 'water-level', name: 'Water Level', type: 'lever', description: 'Operate a series of valves to raise the water level to the marked line.', difficulty: 4, timeLimit: 120, hint: 'Open the first and third valves, then close the second after water reaches halfway.', xpReward: 50 },
  { id: 'bone-riddle', name: 'Bone Riddle', type: 'riddle', description: 'Assemble scattered bones into a skeleton that points toward the correct exit.', difficulty: 4, timeLimit: 90, hint: 'The skeleton reaches toward the east wall, where a hidden passage lies.', xpReward: 55 },
  { id: 'labyrinth-map', name: 'Labyrinth Map', type: 'memory', description: 'Memorize a maze layout shown briefly, then navigate it from memory.', difficulty: 6, timeLimit: 60, hint: 'The maze follows a simple right-hand rule — keep your right hand on the wall.', xpReward: 70 },
  { id: 'golden-scale', name: 'Golden Scale', type: 'block', description: 'Balance golden artifacts of different weights on a set of ancient scales.', difficulty: 5, timeLimit: 150, hint: 'The heaviest artifact is always the Minotaur\'s mask. Place it first.', xpReward: 65 },
  { id: 'divine-trial', name: 'Divine Trial', type: 'riddle', description: 'Answer three questions posed by the gods themselves, projected as spectral voices.', difficulty: 7, timeLimit: 180, hint: 'The gods value humility, cleverness, and courage above all other virtues.', xpReward: 100 },
  { id: 'minotaur-gate', name: 'Minotaur Gate', type: 'symbol', description: 'Arrange stone tablets to form the face of the Minotaur, unlocking the final door.', difficulty: 6, timeLimit: 120, hint: 'The eyes go in the upper corners, the snout forms the base of the triangle.', xpReward: 80 },
  { id: 'siren-song', name: 'Siren Song', type: 'sound', description: 'Identify the correct melody among three overlapping siren songs to pass unharmed.', difficulty: 5, timeLimit: 90, hint: 'The true siren song has exactly seven notes. The others have five and nine.', xpReward: 55 },
]

export const MV_ITEMS: MvItem[] = [
  { id: 'thread-of-ariadne', name: 'Thread of Ariadne', type: 'tool', rarity: 'legendary', power: 50, description: 'A golden thread that marks the path taken, preventing the wanderer from getting lost.', stackable: false, maxStack: 1, goldValue: 500 },
  { id: 'lantern-of-daedalus', name: 'Lantern of Daedalus', type: 'tool', rarity: 'epic', power: 30, description: 'An oil lantern that reveals hidden paths and secret doors within the labyrinth.', stackable: false, maxStack: 1, goldValue: 300 },
  { id: 'bronze-shield', name: 'Bronze Shield', type: 'armor', rarity: 'common', power: 8, description: 'A sturdy bronze shield bearing the emblem of a double axe.', stackable: false, maxStack: 1, goldValue: 25 },
  { id: 'iron-sword', name: 'Iron Sword', type: 'weapon', rarity: 'common', power: 10, description: 'A serviceable iron sword, sharp enough to fend off lesser minotaurs.', stackable: false, maxStack: 1, goldValue: 30 },
  { id: 'health-potion', name: 'Health Potion', type: 'consumable', rarity: 'common', power: 20, description: 'A red potion that restores health when consumed. Tastes of pomegranate.', stackable: true, maxStack: 10, goldValue: 15 },
  { id: 'key-of-knossos', name: 'Key of Knossos', type: 'key', rarity: 'rare', power: 15, description: 'An ornate golden key that opens locked doors throughout the labyrinth.', stackable: false, maxStack: 1, goldValue: 100 },
  { id: 'scroll-of-mapping', name: 'Scroll of Mapping', type: 'scroll', rarity: 'uncommon', power: 12, description: 'Reveals the layout of nearby rooms when read aloud.', stackable: true, maxStack: 5, goldValue: 40 },
  { id: 'minotaur-horn', name: 'Minotaur Horn', type: 'relic', rarity: 'rare', power: 25, description: 'A severed horn from a defeated minotaur, still pulsing with primal energy.', stackable: true, maxStack: 3, goldValue: 75 },
  { id: 'stone-of-protection', name: 'Stone of Protection', type: 'amulet', rarity: 'uncommon', power: 15, description: 'A smooth river stone inscribed with a protective ward against minotaur attacks.', stackable: false, maxStack: 1, goldValue: 50 },
  { id: 'golden-axe', name: 'Golden Axe', type: 'weapon', rarity: 'epic', power: 35, description: 'A ceremonial double axe made of pure gold, the symbol of Minoan power.', stackable: false, maxStack: 1, goldValue: 250 },
  { id: 'chainmail-of-athens', name: 'Chainmail of Athens', type: 'armor', rarity: 'rare', power: 22, description: 'A finely crafted chainmail sent as tribute by the city of Athens.', stackable: false, maxStack: 1, goldValue: 120 },
  { id: 'hermes-boots', name: 'Hermes Boots', type: 'armor', rarity: 'rare', power: 18, description: 'Winged boots that increase movement speed, allowing swift escape from danger.', stackable: false, maxStack: 1, goldValue: 100 },
  { id: 'torch-everflame', name: 'Torch of Everflame', type: 'tool', rarity: 'uncommon', power: 10, description: 'A torch that never goes out, casting reliable light in the darkest passages.', stackable: false, maxStack: 1, goldValue: 35 },
  { id: 'potion-of-strength', name: 'Potion of Strength', type: 'consumable', rarity: 'uncommon', power: 15, description: 'Temporarily boosts attack power for the next battle with a minotaur.', stackable: true, maxStack: 5, goldValue: 30 },
  { id: 'potion-of-fortitude', name: 'Potion of Fortitude', type: 'consumable', rarity: 'uncommon', power: 15, description: 'Temporarily boosts defense for the next encounter with a minotaur.', stackable: true, maxStack: 5, goldValue: 30 },
  { id: 'scroll-of-escape', name: 'Scroll of Escape', type: 'scroll', rarity: 'rare', power: 20, description: 'Instantly teleports the reader back to the labyrinth entrance.', stackable: true, maxStack: 3, goldValue: 80 },
  { id: 'diadem-of-ariadne', name: 'Diadem of Ariadne', type: 'relic', rarity: 'legendary', power: 45, description: 'A divine crown that grants visions of the correct path through the labyrinth.', stackable: false, maxStack: 1, goldValue: 500 },
  { id: 'obsidian-dagger', name: 'Obsidian Dagger', type: 'weapon', rarity: 'uncommon', power: 14, description: 'A razor-sharp dagger carved from volcanic obsidian, ideal for quick strikes.', stackable: false, maxStack: 1, goldValue: 45 },
  { id: 'leather-vest', name: 'Leather Vest', type: 'armor', rarity: 'common', power: 5, description: 'A simple leather vest offering basic protection against claws and horns.', stackable: false, maxStack: 1, goldValue: 15 },
  { id: 'sacred-olive-branch', name: 'Sacred Olive Branch', type: 'consumable', rarity: 'rare', power: 30, description: 'Fully restores health and grants a temporary blessing from Athena.', stackable: true, maxStack: 3, goldValue: 90 },
  { id: 'mirror-shield', name: 'Mirror Shield', type: 'armor', rarity: 'epic', power: 28, description: 'A polished bronze shield that reflects light and magic back at attackers.', stackable: false, maxStack: 1, goldValue: 200 },
  { id: 'compass-of-theseus', name: 'Compass of Theseus', type: 'tool', rarity: 'epic', power: 25, description: 'A compass that always points toward the labyrinth exit, no matter the path.', stackable: false, maxStack: 1, goldValue: 180 },
]

export const MV_TITLES: MvTitle[] = [
  { id: 'lost-wanderer', name: 'Lost Wanderer', requiredLevel: 1, description: 'A soul who has entered the labyrinth with nothing but courage.', color: '#A0937D' },
  { id: 'pathfinder', name: 'Pathfinder', requiredLevel: 5, description: 'Has learned to read the subtle signs that mark the safest routes.', color: '#C9A96E' },
  { id: 'maze-runner', name: 'Maze Runner', requiredLevel: 12, description: 'Navigates the labyrinth with growing confidence and skill.', color: '#DAA520' },
  { id: 'bull-challenger', name: 'Bull Challenger', requiredLevel: 20, description: 'Has faced minotaurs in combat and lived to tell the tale.', color: '#FF8C00' },
  { id: 'riddle-solver', name: 'Riddle Solver', requiredLevel: 28, description: 'Has solved the labyrinth\'s most perplexing puzzles and ancient riddles.', color: '#E8A317' },
  { id: 'thread-bearer', name: 'Thread Bearer', requiredLevel: 35, description: 'Chosen by Ariadne\'s legacy, bearing the sacred thread through the deepest paths.', color: '#FFD700' },
  { id: 'theseus-heir', name: 'Theseus Heir', requiredLevel: 43, description: 'Proven worthy of Theseus\'s legacy, the labyrinth\'s greatest challenger.', color: '#FFDF00' },
  { id: 'labyrinth-king', name: 'Labyrinth King', requiredLevel: 50, description: 'The supreme master of the labyrinth, conqueror of every path, beast, and mystery.', color: '#FFF8DC' },
]

export const MV_ACHIEVEMENTS: MvAchievement[] = [
  { id: 'first-steps', name: 'First Steps', description: 'Enter the labyrinth for the first time.', icon: '👣', condition: 'enter_labyrinth', reward: { type: 'xp', value: 20 } },
  { id: 'first-blood', name: 'First Blood', description: 'Defeat your first minotaur in combat.', icon: '⚔️', condition: 'defeat_first_minotaur', reward: { type: 'xp', value: 40 } },
  { id: 'puzzle-novice', name: 'Puzzle Novice', description: 'Solve your first labyrinth puzzle.', icon: '🧩', condition: 'solve_first_puzzle', reward: { type: 'xp', value: 30 } },
  { id: 'treasure-hunter', name: 'Treasure Hunter', description: 'Collect your first treasure from a treasure room.', icon: '💎', condition: 'find_first_treasure', reward: { type: 'gold', value: 50 } },
  { id: 'path-explorer-10', name: 'Corridor Cartographer', description: 'Explore 10 different labyrinth paths.', icon: '🗺️', condition: 'explore_10_paths', reward: { type: 'xp', value: 80 } },
  { id: 'room-connoisseur', name: 'Room Connoisseur', description: 'Visit every type of room at least once.', icon: '🏛️', condition: 'visit_all_room_types', reward: { type: 'xp', value: 120 } },
  { id: 'minotaur-slayer-5', name: 'Bull Slayer', description: 'Defeat 5 minotaurs in battle.', icon: '🐂', condition: 'defeat_5_minotaurs', reward: { type: 'xp', value: 100 } },
  { id: 'minotaur-slayer-20', name: 'Minotaur Hunter', description: 'Defeat 20 minotaurs in battle.', icon: '🪓', condition: 'defeat_20_minotaurs', reward: { type: 'xp', value: 250 } },
  { id: 'puzzle-master-10', name: 'Riddle Master', description: 'Solve 10 different puzzles.', icon: '🧠', condition: 'solve_10_puzzles', reward: { type: 'xp', value: 150 } },
  { id: 'collector-10', name: 'Labyrinth Collector', description: 'Collect 10 different items.', icon: '🎒', condition: 'collect_10_items', reward: { type: 'xp', value: 100 } },
  { id: 'gold-hoarder', name: 'Gold Hoarder', description: 'Accumulate 500 gold in total.', icon: '💰', condition: 'earn_500_gold', reward: { type: 'xp', value: 120 } },
  { id: 'run-complete', name: 'Successful Escape', description: 'Complete a full labyrinth run from entrance to exit.', icon: '🏁', condition: 'complete_run', reward: { type: 'xp', value: 200 } },
  { id: 'boss-defeater', name: 'Boss Vanquisher', description: 'Defeat a legendary minotaur boss.', icon: '👑', condition: 'defeat_legendary_minotaur', reward: { type: 'xp', value: 300 } },
  { id: 'ariadne-blessed', name: 'Ariadne Blessed', description: 'Obtain the Thread of Ariadne.', icon: '🧵', condition: 'obtain_thread_of_ariadne', reward: { type: 'xp', value: 200 } },
  { id: 'level-25-veteran', name: 'Labyrinth Veteran', description: 'Reach level 25.', icon: '🌟', condition: 'reach_level_25', reward: { type: 'xp', value: 300 } },
  { id: 'level-50-king', name: 'Crown of the Maze', description: 'Reach the maximum level of 50.', icon: '👑', condition: 'reach_level_50', reward: { type: 'xp', value: 1000 } },
  { id: 'explore-all-paths', name: 'Cartographer Supreme', description: 'Explore every labyrinth path at least once.', icon: '🌍', condition: 'explore_all_paths', reward: { type: 'xp', value: 500 } },
  { id: 'no-deaths-10-runs', name: 'Untouchable', description: 'Complete 10 labyrinth runs without dying once.', icon: '🛡️', condition: 'no_deaths_10_runs', reward: { type: 'xp', value: 350 } },
  { id: 'defeat-all-bosses', name: 'Bane of Beasts', description: 'Defeat all legendary-class minotaurs at least once.', icon: '🏆', condition: 'defeat_all_legendaries', reward: { type: 'xp', value: 500 } },
  { id: 'collect-all-rare', name: 'Rare Hoarder', description: 'Collect all rare rarity or higher items.', icon: '🔮', condition: 'collect_all_rare_plus', reward: { type: 'gold', value: 200 } },
]

// ─── XP Table ─────────────────────────────────────────────────────

export const MV_XP_TABLE: number[] = (() => {
  const table: number[] = [0]
  for (let i = 1; i <= MV_MAX_LEVEL; i++) {
    const base = 120
    const growth = 1.16
    const previous = table[i - 1]
    table.push(Math.floor(previous + base * Math.pow(growth, i - 1)))
  }
  return table
})()

export const MV_SAVE_KEY = 'minotaur-labyrinth-save'

export const MV_EXPLORE_BASE_XP = 15

export const MV_BATTLE_BASE_XP = 25

export const MV_PUZZLE_BASE_XP = 20

export const MV_RUN_COMPLETE_XP = 150

export const MV_INITIAL_HEALTH = 100

export const MV_INITIAL_ATTACK = 10

export const MV_INITIAL_DEFENSE = 8

export const MV_INITIAL_SPEED = 7

export const MV_INITIAL_GOLD = 20

export const MV_HEALTH_PER_LEVEL = 12

export const MV_ATTACK_PER_LEVEL = 2

export const MV_DEFENSE_PER_LEVEL = 2

export const MV_SPEED_PER_LEVEL = 1

export const MV_FLEE_CHANCE_BASE = 0.4

export const MV_CRITICAL_HIT_CHANCE = 0.15

export const MV_CRITICAL_HIT_MULTIPLIER = 2.0

export const MV_NEAR_DEATH_THRESHOLD = 0.1

export const MV_MIN_TURNS_FOR_SPEED_RUN = 20

export const MV_MAX_INVENTORY_SIZE = 50

export const MV_BOSS_DEPTH_REQUIREMENT = 8

export const MV_SHRINE_HEAL_AMOUNT = 30

export const MV_TREASURE_GOLD_BASE = 15

export const MV_DEPTH_DIFFICULTY_SCALE = 0.05

// ─── Default State ────────────────────────────────────────────────

const MV_DEFAULT_STATE: MinotaurLabyrinthState = {
  level: 1,
  xp: 0,
  gold: MV_INITIAL_GOLD,
  health: MV_INITIAL_HEALTH,
  maxHealth: MV_INITIAL_HEALTH,
  attack: MV_INITIAL_ATTACK,
  defense: MV_INITIAL_DEFENSE,
  speed: MV_INITIAL_SPEED,
  currentRun: {
    active: false,
    currentRoomId: 'entrance-hall',
    currentPathId: 'stone-corridor',
    enteredAt: '',
    turnsElapsed: 0,
    roomsVisited: [],
    minotaursDefeated: [],
    puzzlesSolved: [],
    treasureCollected: 0,
  },
  combatState: {
    inCombat: false,
    opponentId: null,
    opponentHp: 0,
    opponentMaxHp: 0,
    playerHp: 0,
    playerMaxHp: 0,
    turn: 0,
    playerShield: 0,
  },
  inventory: [],
  collectedItems: [],
  exploredPaths: {},
  roomVisits: {},
  battleLog: [],
  puzzleLog: [],
  unlockedAchievements: [],
  activeTitleId: 'lost-wanderer',
  totalRoomsExplored: 0,
  totalMinotaursDefeated: 0,
  totalPuzzlesSolved: 0,
  totalGoldEarned: 0,
  totalItemsCollected: 0,
  totalRunsCompleted: 0,
  totalDeaths: 0,
  totalFledBattles: 0,
  longestRun: 0,
  fastestPuzzle: 0,
  strongestMinotaurDefeated: 0,
  labyrinthDepth: 0,
  mazeSeed: Math.floor(Math.random() * 100000),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// ─── Helper Functions ─────────────────────────────────────────────

function mvLoadState(): MinotaurLabyrinthState {
  if (typeof window === 'undefined') return { ...MV_DEFAULT_STATE }
  try {
    const raw = localStorage.getItem(MV_SAVE_KEY)
    if (!raw) return { ...MV_DEFAULT_STATE }
    const parsed = JSON.parse(raw) as Partial<MinotaurLabyrinthState>
    return {
      ...MV_DEFAULT_STATE,
      ...parsed,
      currentRun: { ...MV_DEFAULT_STATE.currentRun, ...(parsed.currentRun || {}) },
      combatState: { ...MV_DEFAULT_STATE.combatState, ...(parsed.combatState || {}) },
    }
  } catch {
    return { ...MV_DEFAULT_STATE }
  }
}

function mvSaveState(state: MinotaurLabyrinthState): void {
  if (typeof window === 'undefined') return
  try {
    const toSave = { ...state, updatedAt: new Date().toISOString() }
    localStorage.setItem(MV_SAVE_KEY, JSON.stringify(toSave))
  } catch {
    // Storage full or unavailable — silently degrade
  }
}

function mvCalculateLevel(xp: number): number {
  for (let i = MV_MAX_LEVEL; i >= 1; i--) {
    if (xp >= MV_XP_TABLE[i]) return i
  }
  return 1
}

function mvGetXpForLevel(level: number): number {
  if (level < 1) return 0
  if (level > MV_MAX_LEVEL) return MV_XP_TABLE[MV_MAX_LEVEL]
  return MV_XP_TABLE[level]
}

function mvGetXpProgress(xp: number): { current: number; needed: number; percentage: number } {
  const level = mvCalculateLevel(xp)
  if (level >= MV_MAX_LEVEL) {
    return { current: xp, needed: xp, percentage: 100 }
  }
  const currentLevelXp = MV_XP_TABLE[level]
  const nextLevelXp = MV_XP_TABLE[level + 1]
  const progress = xp - currentLevelXp
  const needed = nextLevelXp - currentLevelXp
  return {
    current: progress,
    needed: needed,
    percentage: Math.min(100, Math.floor((progress / needed) * 100)),
  }
}

function mvGetStatsForLevel(level: number): { maxHealth: number; attack: number; defense: number; speed: number } {
  return {
    maxHealth: MV_INITIAL_HEALTH + (level - 1) * MV_HEALTH_PER_LEVEL,
    attack: MV_INITIAL_ATTACK + (level - 1) * MV_ATTACK_PER_LEVEL,
    defense: MV_INITIAL_DEFENSE + (level - 1) * MV_DEFENSE_PER_LEVEL,
    speed: MV_INITIAL_SPEED + (level - 1) * MV_SPEED_PER_LEVEL,
  }
}

function mvGetCurrentTitle(level: number): MvTitle {
  let bestTitle = MV_TITLES[0]
  for (const title of MV_TITLES) {
    if (level >= title.requiredLevel) {
      bestTitle = title
    }
  }
  return bestTitle
}

function mvRollRarity(minRarity?: MvRarityKey): MvRarityKey {
  const minIndex = minRarity ? MV_RARITY_ORDER.indexOf(minRarity) : 0
  const weights = MV_RARITY_ORDER.slice(minIndex).map((key) => MV_RARITY[key].dropWeight)
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
  let roll = Math.random() * totalWeight
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return MV_RARITY_ORDER[minIndex + i]
  }
  return MV_RARITY_ORDER[minIndex]
}

function mvGenerateDamage(baseAttack: number, targetDefense: number, isCritical: boolean): number {
  const baseDamage = Math.max(1, baseAttack - Math.floor(targetDefense * 0.5))
  const variance = Math.floor(baseDamage * 0.2)
  const roll = Math.floor(Math.random() * (variance * 2 + 1)) - variance
  let damage = baseDamage + roll
  if (isCritical) {
    damage = Math.floor(damage * MV_CRITICAL_HIT_MULTIPLIER)
  }
  return Math.max(1, damage)
}

function mvGetPathById(pathId: string): MvPath | undefined {
  return MV_PATHS.find((p) => p.id === pathId)
}

function mvGetRoomById(roomId: string): MvRoom | undefined {
  return MV_ROOMS.find((r) => r.id === roomId)
}

function mvGetMinotaurById(minotaurId: string): MvMinotaur | undefined {
  return MV_MINOTAURS.find((m) => m.id === minotaurId)
}

function mvGetPuzzleById(puzzleId: string): MvPuzzle | undefined {
  return MV_PUZZLES.find((p) => p.id === puzzleId)
}

function mvGetItemById(itemId: string): MvItem | undefined {
  return MV_ITEMS.find((i) => i.id === itemId)
}

function mvGetTitleById(titleId: string): MvTitle | undefined {
  return MV_TITLES.find((t) => t.id === titleId)
}

function mvGetPathDangerRating(path: MvPath, depth: number): 'safe' | 'moderate' | 'dangerous' | 'deadly' {
  const delta = path.dangerLevel - depth
  if (delta <= -2) return 'safe'
  if (delta <= 0) return 'moderate'
  if (delta <= 2) return 'dangerous'
  return 'deadly'
}

function mvGetMinotaurPowerRating(minotaur: MvMinotaur): number {
  return minotaur.hp + minotaur.attack * 2 + minotaur.defense * 1.5 + minotaur.speed
}

function mvGetPlayerPowerRating(state: MinotaurLabyrinthState): number {
  return state.maxHealth + state.attack * 2 + state.defense * 1.5 + state.speed
}

function mvCanDefeatMinotaur(state: MinotaurLabyrinthState, minotaur: MvMinotaur): { canWin: boolean; odds: number } {
  const playerPower = mvGetPlayerPowerRating(state)
  const monsterPower = mvGetMinotaurPowerRating(minotaur)
  const odds = Math.min(0.95, Math.max(0.05, playerPower / (playerPower + monsterPower)))
  return { canWin: odds > 0.3, odds: Math.floor(odds * 100) }
}

function mvGetRandomPathForDepth(depth: number): MvPath {
  const eligible = MV_PATHS.filter((p) => Math.abs(p.dangerLevel - depth) <= 2)
  const pool = eligible.length > 0 ? eligible : MV_PATHS
  return pool[Math.floor(Math.random() * pool.length)]
}

function mvGetRandomMinotaurForDepth(depth: number): MvMinotaur | undefined {
  const eligible = MV_MINOTAURS.filter((m) => {
    const minotaurPower = (m.hp + m.attack + m.defense + m.speed) / 4
    return Math.abs(minotaurPower / 10 - depth) <= 3
  })
  const pool = eligible.length > 0 ? eligible : MV_MINOTAURS.filter((m) => m.classType !== 'boss')
  if (pool.length === 0) return undefined
  return pool[Math.floor(Math.random() * pool.length)]
}

function mvGetRandomPuzzleForDepth(depth: number): MvPuzzle | undefined {
  const eligible = MV_PUZZLES.filter((p) => Math.abs(p.difficulty - depth) <= 2)
  const pool = eligible.length > 0 ? eligible : MV_PUZZLES.filter((p) => p.difficulty <= 4)
  if (pool.length === 0) return undefined
  return pool[Math.floor(Math.random() * pool.length)]
}

function mvGetRandomItemForRarity(rarity: MvRarityKey): MvItem | undefined {
  const pool = MV_ITEMS.filter((i) => i.rarity === rarity)
  if (pool.length === 0) return undefined
  return pool[Math.floor(Math.random() * pool.length)]
}

function mvCheckAchievementCondition(condition: string, state: MinotaurLabyrinthState): boolean {
  switch (condition) {
    case 'enter_labyrinth':
      return state.totalRoomsExplored > 0
    case 'defeat_first_minotaur':
      return state.totalMinotaursDefeated > 0
    case 'solve_first_puzzle':
      return state.totalPuzzlesSolved > 0
    case 'find_first_treasure':
      return state.currentRun.treasureCollected > 0 || state.totalItemsCollected > 0
    case 'explore_10_paths':
      return Object.keys(state.exploredPaths).length >= 10
    case 'visit_all_room_types': {
      const visitedTypes = new Set(
        Object.values(state.roomVisits)
          .map((v) => {
            const room = MV_ROOMS.find((r) => r.id === v.roomId)
            return room ? room.type : null
          })
          .filter(Boolean),
      )
      return MV_ROOM_TYPES.every((t) => visitedTypes.has(t))
    }
    case 'defeat_5_minotaurs':
      return state.totalMinotaursDefeated >= 5
    case 'defeat_20_minotaurs':
      return state.totalMinotaursDefeated >= 20
    case 'solve_10_puzzles':
      return state.totalPuzzlesSolved >= 10
    case 'collect_10_items':
      return state.collectedItems.length >= 10
    case 'earn_500_gold':
      return state.totalGoldEarned >= 500
    case 'complete_run':
      return state.totalRunsCompleted > 0
    case 'defeat_legendary_minotaur':
      return state.strongestMinotaurDefeated >= 140
    case 'obtain_thread_of_ariadne':
      return state.collectedItems.includes('thread-of-ariadne')
    case 'reach_depth_15':
      return state.labyrinthDepth >= 15
    case 'reach_level_25':
      return state.level >= 25
    case 'reach_level_50':
      return state.level >= 50
    case 'explore_all_paths':
      return Object.keys(state.exploredPaths).length >= MV_PATHS.length
    default:
      return false
  }
}

function mvGetNewAchievements(state: MinotaurLabyrinthState): MvAchievement[] {
  const newOnes: MvAchievement[] = []
  for (const ach of MV_ACHIEVEMENTS) {
    if (state.unlockedAchievements.includes(ach.id)) continue
    if (mvCheckAchievementCondition(ach.condition, state)) {
      newOnes.push(ach)
    }
  }
  return newOnes
}

// ─── Plain Reset Function (no useCallback) ────────────────────────

function mvResetProgress(): MinotaurLabyrinthState {
  const fresh = {
    ...MV_DEFAULT_STATE,
    mazeSeed: Math.floor(Math.random() * 100000),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  mvSaveState(fresh)
  return fresh
}

// ─── The Hook ─────────────────────────────────────────────────────

export default function useMinotaurLabyrinth() {
  const [state, setState] = useState<MinotaurLabyrinthState>(mvLoadState)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const mvDebouncedSave = useCallback((newState: MinotaurLabyrinthState) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    saveTimerRef.current = setTimeout(() => {
      mvSaveState(newState)
    }, 300)
  }, [])

  useEffect(() => {
    const loaded = mvLoadState()
    setState(loaded)
  }, [])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  const mvUpdateState = useCallback(
    (updater: (prev: MinotaurLabyrinthState) => MinotaurLabyrinthState) => {
      setState((prev) => {
        const next = updater(prev)
        mvDebouncedSave(next)
        return next
      })
    },
    [mvDebouncedSave],
  )

  const mvAddXp = useCallback(
    (amount: number) => {
      mvUpdateState((prev) => {
        const newXp = prev.xp + amount
        const newLevel = mvCalculateLevel(newXp)
        const stats = mvGetStatsForLevel(newLevel)
        const newTitle = mvGetCurrentTitle(newLevel)
        const leveledUp = newLevel > prev.level
        return {
          ...prev,
          xp: newXp,
          level: newLevel,
          maxHealth: stats.maxHealth,
          attack: stats.attack,
          defense: stats.defense,
          speed: stats.speed,
          activeTitleId: newTitle.id,
          health: leveledUp ? stats.maxHealth : prev.health,
        }
      })
    },
    [mvUpdateState],
  )

  const mvAddGold = useCallback(
    (amount: number) => {
      mvUpdateState((prev) => ({
        ...prev,
        gold: prev.gold + amount,
        totalGoldEarned: prev.totalGoldEarned + Math.max(0, amount),
      }))
    },
    [mvUpdateState],
  )

  const mvStartRun = useCallback(() => {
    mvUpdateState((prev) => ({
      ...prev,
      currentRun: {
        active: true,
        currentRoomId: 'entrance-hall',
        currentPathId: 'stone-corridor',
        enteredAt: new Date().toISOString(),
        turnsElapsed: 0,
        roomsVisited: ['entrance-hall'],
        minotaursDefeated: [],
        puzzlesSolved: [],
        treasureCollected: 0,
      },
      health: prev.maxHealth,
      labyrinthDepth: 0,
      combatState: {
        inCombat: false,
        opponentId: null,
        opponentHp: 0,
        opponentMaxHp: 0,
        playerHp: prev.maxHealth,
        playerMaxHp: prev.maxHealth,
        turn: 0,
        playerShield: 0,
      },
      roomVisits: {
        ...prev.roomVisits,
        'entrance-hall': {
          roomId: 'entrance-hall',
          timesVisited: (prev.roomVisits['entrance-hall']?.timesVisited || 0) + 1,
          lastVisitedAt: new Date().toISOString(),
          cleared: false,
        },
      },
    }))
    mvAddXp(MV_EXPLORE_BASE_XP)
  }, [mvUpdateState, mvAddXp])

  const mvEndRun = useCallback(
    (success: boolean) => {
      mvUpdateState((prev) => {
        const runTurns = prev.currentRun.turnsElapsed
        const newLongest = Math.max(prev.longestRun, runTurns)
        const newCompleted = success ? prev.totalRunsCompleted + 1 : prev.totalRunsCompleted
        return {
          ...prev,
          currentRun: { ...MV_DEFAULT_STATE.currentRun },
          combatState: {
            ...MV_DEFAULT_STATE.combatState,
            playerMaxHp: prev.maxHealth,
            playerHp: prev.maxHealth,
          },
          totalRunsCompleted: newCompleted,
          longestRun: newLongest,
          labyrinthDepth: 0,
        }
      })
      if (success) {
        mvAddXp(MV_RUN_COMPLETE_XP)
      }
    },
    [mvUpdateState, mvAddXp],
  )

  const mvMoveToRoom = useCallback(
    (roomId: string, pathId: string) => {
      mvUpdateState((prev) => {
        const newDepth = prev.labyrinthDepth + 1
        const alreadyVisited = prev.currentRun.roomsVisited.includes(roomId)
        const updatedVisited = alreadyVisited
          ? prev.currentRun.roomsVisited
          : [...prev.currentRun.roomsVisited, roomId]

        const pathExplored = prev.exploredPaths[pathId]
        const updatedExploredPaths = {
          ...prev.exploredPaths,
          [pathId]: {
            pathId,
            timesExplored: (pathExplored?.timesExplored || 0) + 1,
            lastExploredAt: new Date().toISOString(),
            lootFound: (pathExplored?.lootFound || 0) + (Math.random() < 0.3 ? 1 : 0),
          },
        }

        const roomVisit = prev.roomVisits[roomId]
        const updatedRoomVisits = {
          ...prev.roomVisits,
          [roomId]: {
            roomId,
            timesVisited: (roomVisit?.timesVisited || 0) + 1,
            lastVisitedAt: new Date().toISOString(),
            cleared: roomVisit?.cleared || false,
          },
        }

        return {
          ...prev,
          currentRun: {
            ...prev.currentRun,
            currentRoomId: roomId,
            currentPathId: pathId,
            turnsElapsed: prev.currentRun.turnsElapsed + 1,
            roomsVisited: updatedVisited,
          },
          exploredPaths: updatedExploredPaths,
          roomVisits: updatedRoomVisits,
          labyrinthDepth: newDepth,
          totalRoomsExplored: prev.totalRoomsExplored + (alreadyVisited ? 0 : 1),
        }
      })
      if (!state.currentRun.roomsVisited.includes(roomId)) {
        mvAddXp(MV_EXPLORE_BASE_XP)
      }
    },
    [mvUpdateState, mvAddXp, state.currentRun.roomsVisited],
  )

  const mvIncrementTurn = useCallback(() => {
    mvUpdateState((prev) => ({
      ...prev,
      currentRun: {
        ...prev.currentRun,
        turnsElapsed: prev.currentRun.turnsElapsed + 1,
      },
    }))
  }, [mvUpdateState])

  const mvStartBattle = useCallback(
    (minotaurId: string) => {
      const minotaur = mvGetMinotaurById(minotaurId)
      if (!minotaur) return

      mvUpdateState((prev) => {
        const depthBonus = 1 + prev.labyrinthDepth * 0.05
        const scaledHp = Math.floor(minotaur.hp * depthBonus)
        return {
          ...prev,
          combatState: {
            inCombat: true,
            opponentId: minotaurId,
            opponentHp: scaledHp,
            opponentMaxHp: scaledHp,
            playerHp: prev.health,
            playerMaxHp: prev.maxHealth,
            turn: 0,
            playerShield: 0,
          },
        }
      })
    },
    [mvUpdateState],
  )

  const mvAttack = useCallback(() => {
    mvUpdateState((prev) => {
      if (!prev.combatState.inCombat || !prev.combatState.opponentId) return prev
      const minotaur = mvGetMinotaurById(prev.combatState.opponentId)
      if (!minotaur) return prev

      const isCritical = Math.random() < MV_CRITICAL_HIT_CHANCE
      const playerDamage = mvGenerateDamage(prev.attack, minotaur.defense, isCritical)
      const newOpponentHp = Math.max(0, prev.combatState.opponentHp - playerDamage)

      let minotaurDamage = 0
      let newPlayerHp = prev.combatState.playerHp
      if (newOpponentHp > 0) {
        const minotaurCrit = Math.random() < 0.08
        minotaurDamage = mvGenerateDamage(minotaur.attack, prev.defense, minotaurCrit)
        const shieldAbsorb = Math.min(prev.combatState.playerShield, minotaurDamage)
        newPlayerHp = Math.max(0, newPlayerHp - (minotaurDamage - shieldAbsorb))
      }

      const newTurn = prev.combatState.turn + 1
      const newShield = Math.max(0, prev.combatState.playerShield - minotaurDamage * 0.1)

      if (newOpponentHp <= 0) {
        const rarityMult = MV_RARITY[minotaur.rarity].xpMultiplier
        const depthBonus = 1 + prev.labyrinthDepth * 0.05
        const xpGain = Math.floor(minotaur.xpReward * rarityMult * depthBonus)
        const goldGain = Math.floor(minotaur.goldReward * depthBonus)
        const minotaurPower = minotaur.hp + minotaur.attack + minotaur.defense + minotaur.speed

        const logEntry: MvBattleLog = {
          minotaurId: prev.combatState.opponentId,
          minotaurName: minotaur.name,
          status: 'victory',
          turnsTaken: newTurn,
          damageDealt: playerDamage,
          damageTaken: minotaurDamage,
          timestamp: new Date().toISOString(),
        }

        return {
          ...prev,
          xp: prev.xp + xpGain,
          gold: prev.gold + goldGain,
          totalGoldEarned: prev.totalGoldEarned + goldGain,
          totalMinotaursDefeated: prev.totalMinotaursDefeated + 1,
          strongestMinotaurDefeated: Math.max(prev.strongestMinotaurDefeated, minotaurPower),
          health: newPlayerHp,
          combatState: {
            ...prev.combatState,
            inCombat: false,
            opponentId: null,
            opponentHp: 0,
            turn: newTurn,
          },
          currentRun: {
            ...prev.currentRun,
            minotaursDefeated: [...prev.currentRun.minotaursDefeated, prev.combatState.opponentId],
          },
          battleLog: [...prev.battleLog, logEntry],
          level: mvCalculateLevel(prev.xp + xpGain),
        }
      }

      if (newPlayerHp <= 0) {
        const logEntry: MvBattleLog = {
          minotaurId: prev.combatState.opponentId,
          minotaurName: minotaur.name,
          status: 'defeat',
          turnsTaken: newTurn,
          damageDealt: playerDamage,
          damageTaken: minotaurDamage,
          timestamp: new Date().toISOString(),
        }

        return {
          ...prev,
          totalDeaths: prev.totalDeaths + 1,
          health: 0,
          combatState: {
            ...prev.combatState,
            inCombat: false,
            playerHp: 0,
            turn: newTurn,
          },
          currentRun: { ...MV_DEFAULT_STATE.currentRun },
          battleLog: [...prev.battleLog, logEntry],
          labyrinthDepth: 0,
        }
      }

      return {
        ...prev,
        health: newPlayerHp,
        combatState: {
          ...prev.combatState,
          opponentHp: newOpponentHp,
          playerHp: newPlayerHp,
          turn: newTurn,
          playerShield: newShield,
        },
      }
    })
  }, [mvUpdateState])

  const mvDefend = useCallback(() => {
    mvUpdateState((prev) => {
      if (!prev.combatState.inCombat || !prev.combatState.opponentId) return prev
      const minotaur = mvGetMinotaurById(prev.combatState.opponentId)
      if (!minotaur) return prev

      const shieldGain = Math.floor(prev.defense * 0.5)
      const reducedDamage = mvGenerateDamage(Math.floor(minotaur.attack * 0.6), prev.defense, false)
      const newPlayerHp = Math.max(0, prev.combatState.playerHp - reducedDamage)
      const newTurn = prev.combatState.turn + 1

      if (newPlayerHp <= 0) {
        const logEntry: MvBattleLog = {
          minotaurId: prev.combatState.opponentId,
          minotaurName: minotaur.name,
          status: 'defeat',
          turnsTaken: newTurn,
          damageDealt: 0,
          damageTaken: reducedDamage,
          timestamp: new Date().toISOString(),
        }
        return {
          ...prev,
          totalDeaths: prev.totalDeaths + 1,
          health: 0,
          combatState: { ...prev.combatState, inCombat: false, playerHp: 0, turn: newTurn },
          currentRun: { ...MV_DEFAULT_STATE.currentRun },
          battleLog: [...prev.battleLog, logEntry],
          labyrinthDepth: 0,
        }
      }

      return {
        ...prev,
        health: newPlayerHp,
        combatState: {
          ...prev.combatState,
          playerHp: newPlayerHp,
          turn: newTurn,
          playerShield: prev.combatState.playerShield + shieldGain,
        },
      }
    })
  }, [mvUpdateState])

  const mvFleeBattle = useCallback(() => {
    mvUpdateState((prev) => {
      if (!prev.combatState.inCombat || !prev.combatState.opponentId) return prev
      const minotaur = mvGetMinotaurById(prev.combatState.opponentId)
      if (!minotaur) return prev

      const fleeChance = MV_FLEE_CHANCE_BASE + (prev.speed - minotaur.speed) * 0.05
      const escaped = Math.random() < fleeChance

      if (escaped) {
        const partingDamage = Math.floor(minotaur.attack * 0.3)
        const newHp = Math.max(1, prev.health - partingDamage)
        const logEntry: MvBattleLog = {
          minotaurId: prev.combatState.opponentId,
          minotaurName: minotaur.name,
          status: 'fled',
          turnsTaken: prev.combatState.turn,
          damageDealt: 0,
          damageTaken: partingDamage,
          timestamp: new Date().toISOString(),
        }
        return {
          ...prev,
          health: newHp,
          totalFledBattles: prev.totalFledBattles + 1,
          combatState: { ...prev.combatState, inCombat: false, opponentId: null, opponentHp: 0 },
          battleLog: [...prev.battleLog, logEntry],
        }
      }

      const minotaurDamage = mvGenerateDamage(minotaur.attack, prev.defense, false)
      const newPlayerHp = Math.max(0, prev.combatState.playerHp - minotaurDamage)
      const newTurn = prev.combatState.turn + 1

      if (newPlayerHp <= 0) {
        const logEntry: MvBattleLog = {
          minotaurId: prev.combatState.opponentId,
          minotaurName: minotaur.name,
          status: 'defeat',
          turnsTaken: newTurn,
          damageDealt: 0,
          damageTaken: minotaurDamage,
          timestamp: new Date().toISOString(),
        }
        return {
          ...prev,
          totalDeaths: prev.totalDeaths + 1,
          health: 0,
          combatState: { ...prev.combatState, inCombat: false, playerHp: 0, turn: newTurn },
          currentRun: { ...MV_DEFAULT_STATE.currentRun },
          battleLog: [...prev.battleLog, logEntry],
          labyrinthDepth: 0,
        }
      }

      return {
        ...prev,
        health: newPlayerHp,
        combatState: { ...prev.combatState, playerHp: newPlayerHp, turn: newTurn },
      }
    })
  }, [mvUpdateState])

  const mvSolvePuzzle = useCallback(
    (puzzleId: string, success: boolean, attempts: number, timeSpent: number) => {
      mvUpdateState((prev) => {
        const puzzle = mvGetPuzzleById(puzzleId)
        if (!puzzle) return prev

        const logEntry: MvPuzzleLog = {
          puzzleId,
          puzzleName: puzzle.name,
          status: success ? 'solved' : 'failed',
          attempts,
          timeSpent,
          timestamp: new Date().toISOString(),
        }

        if (success) {
          const depthBonus = 1 + prev.labyrinthDepth * 0.05
          const firstTryBonus = attempts === 1 ? 1.5 : 1
          const xpGain = Math.floor(puzzle.xpReward * depthBonus * firstTryBonus)
          const goldGain = Math.floor(puzzle.difficulty * 5 * depthBonus)
          const newFastest =
            prev.fastestPuzzle === 0 ? timeSpent : Math.min(prev.fastestPuzzle, timeSpent)

          return {
            ...prev,
            xp: prev.xp + xpGain,
            gold: prev.gold + goldGain,
            totalGoldEarned: prev.totalGoldEarned + goldGain,
            totalPuzzlesSolved: prev.totalPuzzlesSolved + 1,
            fastestPuzzle: newFastest,
            level: mvCalculateLevel(prev.xp + xpGain),
            currentRun: {
              ...prev.currentRun,
              puzzlesSolved: [...prev.currentRun.puzzlesSolved, puzzleId],
            },
            puzzleLog: [...prev.puzzleLog, logEntry],
          }
        }

        return { ...prev, puzzleLog: [...prev.puzzleLog, logEntry] }
      })
    },
    [mvUpdateState],
  )

  const mvSkipPuzzle = useCallback(
    (puzzleId: string) => {
      mvUpdateState((prev) => {
        const puzzle = mvGetPuzzleById(puzzleId)
        if (!puzzle) return prev

        const logEntry: MvPuzzleLog = {
          puzzleId,
          puzzleName: puzzle.name,
          status: 'skipped',
          attempts: 0,
          timeSpent: 0,
          timestamp: new Date().toISOString(),
        }

        return { ...prev, puzzleLog: [...prev.puzzleLog, logEntry] }
      })
    },
    [mvUpdateState],
  )

  const mvAddItem = useCallback(
    (itemId: string, quantity: number = 1) => {
      mvUpdateState((prev) => {
        const item = mvGetItemById(itemId)
        if (!item) return prev

        const existingSlot = prev.inventory.find((s) => s.itemId === itemId)
        let newInventory: MvInventorySlot[]

        if (existingSlot) {
          if (item.stackable) {
            const newQuantity = Math.min(existingSlot.quantity + quantity, item.maxStack)
            newInventory = prev.inventory.map((s) =>
              s.itemId === itemId ? { ...s, quantity: newQuantity } : s,
            )
          } else {
            newInventory = prev.inventory
          }
        } else {
          newInventory = [
            ...prev.inventory,
            {
              itemId,
              quantity: item.stackable ? Math.min(quantity, item.maxStack) : 1,
              equipped: false,
              obtainedAt: new Date().toISOString(),
            },
          ]
        }

        const newCollected = prev.collectedItems.includes(itemId)
          ? prev.collectedItems
          : [...prev.collectedItems, itemId]

        return {
          ...prev,
          inventory: newInventory,
          collectedItems: newCollected,
          totalItemsCollected: newCollected.length,
        }
      })
    },
    [mvUpdateState],
  )

  const mvRemoveItem = useCallback(
    (itemId: string, quantity: number = 1) => {
      mvUpdateState((prev) => {
        const existingSlot = prev.inventory.find((s) => s.itemId === itemId)
        if (!existingSlot) return prev

        const newQuantity = existingSlot.quantity - quantity
        const newInventory =
          newQuantity <= 0
            ? prev.inventory.filter((s) => s.itemId !== itemId)
            : prev.inventory.map((s) =>
                s.itemId === itemId ? { ...s, quantity: newQuantity } : s,
              )

        return { ...prev, inventory: newInventory }
      })
    },
    [mvUpdateState],
  )

  const mvEquipItem = useCallback(
    (itemId: string) => {
      mvUpdateState((prev) => {
        const item = mvGetItemById(itemId)
        if (!item) return prev
        if (!prev.inventory.some((s) => s.itemId === itemId)) return prev

        const newInventory = prev.inventory.map((s) => {
          if (s.itemId === itemId) return { ...s, equipped: true }
          const slotItem = mvGetItemById(s.itemId)
          if (slotItem && slotItem.type === item.type && s.equipped) {
            return { ...s, equipped: false }
          }
          return s
        })

        return { ...prev, inventory: newInventory }
      })
    },
    [mvUpdateState],
  )

  const mvUnequipItem = useCallback(
    (itemId: string) => {
      mvUpdateState((prev) => ({
        ...prev,
        inventory: prev.inventory.map((s) =>
          s.itemId === itemId ? { ...s, equipped: false } : s,
        ),
      }))
    },
    [mvUpdateState],
  )

  const mvUseConsumable = useCallback(
    (itemId: string) => {
      mvUpdateState((prev) => {
        const item = mvGetItemById(itemId)
        if (!item || item.type !== 'consumable') return prev
        const slot = prev.inventory.find((s) => s.itemId === itemId)
        if (!slot || slot.quantity <= 0) return prev

        let newHealth = prev.health
        if (itemId === 'sacred-olive-branch') {
          newHealth = prev.maxHealth
        } else {
          newHealth = Math.min(prev.maxHealth, prev.health + item.power)
        }

        const newQuantity = slot.quantity - 1
        const newInventory =
          newQuantity <= 0
            ? prev.inventory.filter((s) => s.itemId !== itemId)
            : prev.inventory.map((s) =>
                s.itemId === itemId ? { ...s, quantity: newQuantity } : s,
              )

        return { ...prev, health: newHealth, inventory: newInventory }
      })
    },
    [mvUpdateState],
  )

  const mvUseScroll = useCallback(
    (itemId: string) => {
      mvUpdateState((prev) => {
        const item = mvGetItemById(itemId)
        if (!item || item.type !== 'scroll') return prev
        const slot = prev.inventory.find((s) => s.itemId === itemId)
        if (!slot || slot.quantity <= 0) return prev

        const newQuantity = slot.quantity - 1
        const newInventory =
          newQuantity <= 0
            ? prev.inventory.filter((s) => s.itemId !== itemId)
            : prev.inventory.map((s) =>
                s.itemId === itemId ? { ...s, quantity: newQuantity } : s,
              )

        let newState: MinotaurLabyrinthState = { ...prev, inventory: newInventory }

        if (itemId === 'scroll-of-escape') {
          newState.currentRun = { ...MV_DEFAULT_STATE.currentRun }
          newState.combatState = {
            ...MV_DEFAULT_STATE.combatState,
            playerMaxHp: prev.maxHealth,
            playerHp: prev.maxHealth,
          }
          newState.labyrinthDepth = 0
        }

        return newState
      })
    },
    [mvUpdateState],
  )

  const mvGenerateLoot = useCallback((depth: number) => {
    const rarity = mvRollRarity()
    const item = mvGetRandomItemForRarity(rarity)
    if (!item) return null
    return { itemId: item.id, rarity: item.rarity }
  }, [])

  const mvCollectTreasure = useCallback(
    (goldAmount: number) => {
      mvUpdateState((prev) => ({
        ...prev,
        gold: prev.gold + goldAmount,
        totalGoldEarned: prev.totalGoldEarned + goldAmount,
        currentRun: {
          ...prev.currentRun,
          treasureCollected: prev.currentRun.treasureCollected + goldAmount,
        },
      }))
    },
    [mvUpdateState],
  )

  const mvHeal = useCallback(
    (amount: number) => {
      mvUpdateState((prev) => ({
        ...prev,
        health: Math.min(prev.maxHealth, prev.health + amount),
      }))
    },
    [mvUpdateState],
  )

  const mvTakeDamage = useCallback(
    (amount: number) => {
      mvUpdateState((prev) => ({
        ...prev,
        health: Math.max(0, prev.health - amount),
      }))
    },
    [mvUpdateState],
  )

  const mvRestoreFullHealth = useCallback(() => {
    mvUpdateState((prev) => ({ ...prev, health: prev.maxHealth }))
  }, [mvUpdateState])

  const mvSetActiveTitle = useCallback(
    (titleId: string) => {
      mvUpdateState((prev) => {
        const title = mvGetTitleById(titleId)
        if (!title || prev.level < title.requiredLevel) return prev
        return { ...prev, activeTitleId: titleId }
      })
    },
    [mvUpdateState],
  )

  const mvCheckAchievements = useCallback((): MvAchievement[] => {
    const newAchievements = mvGetNewAchievements(state)
    if (newAchievements.length === 0) return []

    mvUpdateState((prev) => {
      const newIds = newAchievements.map((a) => a.id)
      const merged = Array.from(new Set([...prev.unlockedAchievements, ...newIds]))

      let bonusXp = 0
      let bonusGold = 0
      for (const ach of newAchievements) {
        if (ach.reward.type === 'xp') bonusXp += ach.reward.value
        if (ach.reward.type === 'gold') bonusGold += ach.reward.value
      }

      return {
        ...prev,
        unlockedAchievements: merged,
        xp: prev.xp + bonusXp,
        gold: prev.gold + bonusGold,
        totalGoldEarned: prev.totalGoldEarned + bonusGold,
        level: mvCalculateLevel(prev.xp + bonusXp),
      }
    })

    return newAchievements
  }, [state, mvUpdateState])

  const mvReset = useCallback(() => {
    const fresh = mvResetProgress()
    setState(fresh)
  }, [])

  const mvVisitShrine = useCallback(() => {
    mvUpdateState((prev) => {
      const healAmount = Math.min(MV_SHRINE_HEAL_AMOUNT, prev.maxHealth - prev.health)
      const goldGain = Math.floor(Math.random() * 10) + 5
      return {
        ...prev,
        health: prev.health + healAmount,
        gold: prev.gold + goldGain,
        totalGoldEarned: prev.totalGoldEarned + goldGain,
      }
    })
  }, [mvUpdateState])

  const mvSellItem = useCallback(
    (itemId: string) => {
      mvUpdateState((prev) => {
        const item = mvGetItemById(itemId)
        if (!item) return prev
        const slot = prev.inventory.find((s) => s.itemId === itemId)
        if (!slot || slot.quantity <= 0) return prev

        const newQuantity = slot.quantity - 1
        const newInventory =
          newQuantity <= 0
            ? prev.inventory.filter((s) => s.itemId !== itemId)
            : prev.inventory.map((s) =>
                s.itemId === itemId ? { ...s, quantity: newQuantity } : s,
              )

        return {
          ...prev,
          gold: prev.gold + item.goldValue,
          inventory: newInventory,
        }
      })
    },
    [mvUpdateState],
  )

  const mvGetRandomEncounter = useCallback((): { type: 'minotaur' | 'puzzle' | 'treasure' | 'nothing'; data: MvMinotaur | MvPuzzle | number | null } => {
    const roll = Math.random() * 100
    const depth = state.labyrinthDepth

    if (roll < 30) {
      const minotaur = mvGetRandomMinotaurForDepth(depth)
      return { type: 'minotaur', data: minotaur || null }
    }
    if (roll < 55) {
      const puzzle = mvGetRandomPuzzleForDepth(depth)
      return { type: 'puzzle', data: puzzle || null }
    }
    if (roll < 75) {
      const goldAmount = Math.floor((Math.random() * MV_TREASURE_GOLD_BASE + MV_TREASURE_GOLD_BASE) * (1 + depth * MV_DEPTH_DIFFICULTY_SCALE))
      return { type: 'treasure', data: goldAmount }
    }
    return { type: 'nothing', data: null }
  }, [state.labyrinthDepth])

  const mvGetRecommendedAction = useCallback((): 'fight' | 'flee' | 'defend' | 'heal' => {
    if (!state.combatState.inCombat || !state.combatState.opponentId) return 'fight'
    const minotaur = mvGetMinotaurById(state.combatState.opponentId)
    if (!minotaur) return 'fight'

    const playerPower = mvGetPlayerPowerRating(state)
    const monsterPower = mvGetMinotaurPowerRating(minotaur)
    const powerRatio = playerPower / (playerPower + monsterPower)

    const healthRatio = state.combatState.playerHp / state.combatState.playerMaxHp
    const opponentHealthRatio = state.combatState.opponentHp / state.combatState.opponentMaxHp

    if (healthRatio < 0.2 && state.inventory.some((s) => s.itemId === 'health-potion')) return 'heal'
    if (powerRatio < 0.3) return 'flee'
    if (healthRatio < 0.4 && opponentHealthRatio > 0.5) return 'defend'
    if (opponentHealthRatio < 0.15) return 'fight'
    if (healthRatio > 0.7 && powerRatio > 0.5) return 'fight'
    if (state.combatState.playerShield < state.defense) return 'defend'
    return 'fight'
  }, [state])

  const mvGetBattlePrediction = useCallback((): { playerWinChance: number; estimatedTurns: number; riskLevel: 'low' | 'medium' | 'high' | 'extreme' } => {
    if (!state.combatState.inCombat || !state.combatState.opponentId) {
      return { playerWinChance: 100, estimatedTurns: 0, riskLevel: 'low' }
    }
    const minotaur = mvGetMinotaurById(state.combatState.opponentId)
    if (!minotaur) {
      return { playerWinChance: 100, estimatedTurns: 0, riskLevel: 'low' }
    }

    const playerPower = mvGetPlayerPowerRating(state)
    const monsterPower = mvGetMinotaurPowerRating(minotaur)
    const winChance = Math.min(95, Math.max(5, Math.floor((playerPower / (playerPower + monsterPower)) * 100)))

    const healthRatio = state.combatState.playerHp / state.combatState.playerMaxHp
    const adjustedChance = Math.floor(winChance * (0.5 + healthRatio * 0.5))

    const playerDps = Math.max(1, state.attack - Math.floor(minotaur.defense * 0.5))
    const monsterDps = Math.max(1, minotaur.attack - Math.floor(state.defense * 0.5))
    const turnsToKill = Math.ceil(state.combatState.opponentHp / playerDps)
    const turnsToDie = Math.ceil(state.combatState.playerHp / monsterDps)

    const estimatedTurns = Math.min(turnsToKill, turnsToDie)

    let riskLevel: 'low' | 'medium' | 'high' | 'extreme' = 'low'
    if (adjustedChance < 20) riskLevel = 'extreme'
    else if (adjustedChance < 40) riskLevel = 'high'
    else if (adjustedChance < 60) riskLevel = 'medium'

    return { playerWinChance: adjustedChance, estimatedTurns, riskLevel }
  }, [state])

  const mvGetPathRecommendation = useCallback(
    (pathId: string): { recommended: boolean; reason: string; riskLevel: 'safe' | 'moderate' | 'dangerous' | 'deadly' } => {
      const path = mvGetPathById(pathId)
      if (!path) return { recommended: false, reason: 'Unknown path', riskLevel: 'moderate' }

      const dangerRating = mvGetPathDangerRating(path, state.labyrinthDepth)
      const playerPower = mvGetPlayerPowerRating(state)
      const powerThreshold = state.labyrinthDepth * 15 + 50

      if (dangerRating === 'deadly' && playerPower < powerThreshold) {
        return { recommended: false, reason: 'This path is too dangerous for your current power level.', riskLevel: dangerRating }
      }
      if (dangerRating === 'safe') {
        return { recommended: true, reason: 'This path looks relatively safe. Good for exploration.', riskLevel: dangerRating }
      }
      if (state.health < state.maxHealth * 0.3) {
        return { recommended: false, reason: 'Your health is too low for risky paths. Heal first.', riskLevel: dangerRating }
      }
      if (path.lootChance > 0.3) {
        return { recommended: true, reason: 'This path has promising treasure opportunities.', riskLevel: dangerRating }
      }
      return { recommended: true, reason: 'A standard path with balanced risk and reward.', riskLevel: dangerRating }
    },
    [state],
  )

  const mvXpProgress = mvGetXpProgress(state.xp)
  const mvCurrentTitle = mvGetTitleById(state.activeTitleId) || MV_TITLES[0]
  const mvEquippedItems = state.inventory.filter((s) => s.equipped)
  const mvTotalInventoryCount = state.inventory.reduce((sum, s) => sum + s.quantity, 0)
  const mvExploredPathCount = Object.keys(state.exploredPaths).length
  const mvVisitedRoomCount = Object.keys(state.roomVisits).length
  const mvWinRate =
    state.battleLog.length > 0
      ? Math.floor(
          (state.battleLog.filter((b) => b.status === 'victory').length / state.battleLog.length) * 100,
        )
      : 0
  const mvPuzzleSuccessRate =
    state.puzzleLog.length > 0
      ? Math.floor(
          (state.puzzleLog.filter((p) => p.status === 'solved').length / state.puzzleLog.length) * 100,
        )
      : 0
  const mvIsInRun = state.currentRun.active
  const mvIsInCombat = state.combatState.inCombat
  const mvCurrentMinotaur = state.combatState.opponentId
    ? mvGetMinotaurById(state.combatState.opponentId)
    : null
  const mvCurrentRoom = mvGetRoomById(state.currentRun.currentRoomId)
  const mvCurrentPath = mvGetPathById(state.currentRun.currentPathId)
  const mvIsMaxLevel = state.level >= MV_MAX_LEVEL
  const mvUnlockedAchievementCount = state.unlockedAchievements.length
  const mvTotalAchievementCount = MV_ACHIEVEMENTS.length
  const mvCollectedItemCount = state.collectedItems.length
  const mvTotalItemCount = MV_ITEMS.length
  const mvAverageDamage =
    state.battleLog.length > 0
      ? Math.floor(state.battleLog.reduce((sum, b) => sum + b.damageDealt, 0) / state.battleLog.length)
      : 0
  const mvHealthPercentage = state.maxHealth > 0
    ? Math.floor((state.health / state.maxHealth) * 100)
    : 0
  const mvIsNearDeath = state.health > 0 && state.health <= state.maxHealth * MV_NEAR_DEATH_THRESHOLD
  const mvIsDead = state.health <= 0 && !state.currentRun.active
  const mvTotalDamageTaken = state.battleLog.reduce((sum, b) => sum + b.damageTaken, 0)
  const mvTotalDamageDealt = state.battleLog.reduce((sum, b) => sum + b.damageDealt, 0)
  const mvAverageBattleTurns =
    state.battleLog.length > 0
      ? Math.floor(state.battleLog.reduce((sum, b) => sum + b.turnsTaken, 0) / state.battleLog.length)
      : 0
  const mvFleeRate =
    state.battleLog.length > 0
      ? Math.floor(
          (state.battleLog.filter((b) => b.status === 'fled').length / state.battleLog.length) * 100,
        )
      : 0
  const mvUnexploredPaths = MV_PATHS.filter((p) => !state.exploredPaths[p.id])
  const mvUnCollectedItems = MV_ITEMS.filter((i) => !state.collectedItems.includes(i.id))
  const mvLockedTitles = MV_TITLES.filter((t) => state.level < t.requiredLevel)
  const mvAvailableTitles = MV_TITLES.filter((t) => state.level >= t.requiredLevel)
  const mvRecentBattles = state.battleLog.slice(-10).reverse()
  const mvRecentPuzzles = state.puzzleLog.slice(-10).reverse()
  const mvDefeatedMinotaurIds = Array.from(new Set(state.battleLog.filter((b) => b.status === 'victory').map((b) => b.minotaurId)))
  const mvSolvedPuzzleIds = Array.from(new Set(state.puzzleLog.filter((p) => p.status === 'solved').map((p) => p.puzzleId)))
  const mvPlayerPower = mvGetPlayerPowerRating(state)
  const mvCombatTurn = state.combatState.turn
  const mvOpponentHealthPercentage =
    state.combatState.opponentMaxHp > 0
      ? Math.floor((state.combatState.opponentHp / state.combatState.opponentMaxHp) * 100)
      : 0
  const mvPlayerShield = state.combatState.playerShield

  return {
    state,
    mvXpProgress,
    mvCurrentTitle,
    mvEquippedItems,
    mvTotalInventoryCount,
    mvExploredPathCount,
    mvVisitedRoomCount,
    mvWinRate,
    mvPuzzleSuccessRate,
    mvIsInRun,
    mvIsInCombat,
    mvCurrentMinotaur,
    mvCurrentRoom,
    mvCurrentPath,
    mvIsMaxLevel,
    mvUnlockedAchievementCount,
    mvTotalAchievementCount,
    mvCollectedItemCount,
    mvTotalItemCount,
    mvAverageDamage,
    mvAddXp,
    mvAddGold,
    mvStartRun,
    mvEndRun,
    mvMoveToRoom,
    mvIncrementTurn,
    mvStartBattle,
    mvAttack,
    mvDefend,
    mvFleeBattle,
    mvSolvePuzzle,
    mvSkipPuzzle,
    mvAddItem,
    mvRemoveItem,
    mvEquipItem,
    mvUnequipItem,
    mvUseConsumable,
    mvUseScroll,
    mvGenerateLoot,
    mvCollectTreasure,
    mvHeal,
    mvTakeDamage,
    mvRestoreFullHealth,
    mvSetActiveTitle,
    mvCheckAchievements,
    mvReset,
    mvHealthPercentage,
    mvIsNearDeath,
    mvIsDead,
    mvTotalDamageTaken,
    mvTotalDamageDealt,
    mvAverageBattleTurns,
    mvFleeRate,
    mvUnexploredPaths,
    mvUnCollectedItems,
    mvLockedTitles,
    mvAvailableTitles,
    mvRecentBattles,
    mvRecentPuzzles,
    mvDefeatedMinotaurIds,
    mvSolvedPuzzleIds,
    mvPlayerPower,
    mvCombatTurn,
    mvOpponentHealthPercentage,
    mvPlayerShield,
    mvVisitShrine,
    mvSellItem,
    mvGetRandomEncounter,
    mvGetRecommendedAction,
    mvGetBattlePrediction,
    mvGetPathRecommendation,
  }
}
