// treasure-hunt-wire.ts — SSR-safe wire module
// Prefix: th | NO React | NO localStorage/window | NO setInterval

// ─── Types ────────────────────────────────────────────────────────────────────

type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'
type ClueType = 'Riddle' | 'Anagram' | 'FillBlank' | 'WordChain'
type RegionName = 'Enchanted Forest' | 'Crystal Cave' | 'Dragon Mountain' | 'Sunken Ship' | 'Mystic Library' | 'Shadow Valley' | 'Phoenix Nest' | 'Star Temple'

interface Region {
  name: RegionName
  description: string
  icon: string
  color: string
  treasureCount: number
  discovered: number
  unlocked: boolean
  unlockRequirement: string
}

interface TreasureLocation {
  id: string
  name: string
  region: RegionName
  rarity: Rarity
  discovered: boolean
  clue: string
  clueType: ClueType
  hint1: string
  hint2: string
  hint3: string
  answer: string
  lore: string
  artifactBonus: string
}

interface HuntState {
  isActive: boolean
  region: RegionName | null
  currentTreasure: TreasureLocation | null
  cluesRevealed: number
  hintsUsed: number
  startTime: number | null
  elapsedSeconds: number
  correctAnswers: number
  incorrectAnswers: number
  artifactsFound: number
  lootCollected: LootItem[]
}

interface LootItem {
  name: string
  rarity: Rarity
  value: number
  description: string
}

interface Artifact {
  name: string
  region: RegionName
  rarity: Rarity
  bonus: string
  bonusValue: number
  equipped: boolean
}

interface StreakMilestone {
  day: number
  reward: string
  claimed: boolean
}

interface THAchievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt: string | null
}

interface DailyExpedition {
  date: string
  region: RegionName
  targetTreasures: number
  timeLimit: number
  completed: boolean
  treasuresFound: number
  bestTime: number | null
}

interface THState {
  initialized: boolean
  regions: Region[]
  allTreasures: TreasureLocation[]
  hunt: HuntState
  totalTreasuresFound: number
  totalHuntsCompleted: number
  totalCluesSolved: number
  totalHintsUsed: number
  streak: number
  streakHistory: string[]
  streakMilestones: StreakMilestone[]
  achievements: THAchievement[]
  artifacts: Artifact[]
  inventory: LootItem[]
  totalLootValue: number
  dailyExpedition: DailyExpedition
  bestHuntTime: number
  perfectHunts: number
  compassDirection: string
  compassMessage: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const REGION_DEFS: readonly { name: RegionName; description: string; icon: string; color: string; unlockReq: string }[] = [
  { name: 'Enchanted Forest', description: 'A mystical woodland where ancient trees whisper forgotten secrets', icon: '🌲', color: '#22c55e', unlockReq: '' },
  { name: 'Crystal Cave', description: 'A shimmering underground cavern filled with prismatic formations', icon: '💎', color: '#06b6d4', unlockReq: 'Find 5 treasures' },
  { name: 'Dragon Mountain', description: 'A volcanic peak where legendary dragons guard their hoards', icon: '🐉', color: '#ef4444', unlockReq: 'Find 15 treasures' },
  { name: 'Sunken Ship', description: 'An ancient vessel resting on the ocean floor, full of maritime mysteries', icon: '🚢', color: '#3b82f6', unlockReq: 'Find 25 treasures' },
  { name: 'Mystic Library', description: 'An infinite library containing the knowledge of a thousand civilizations', icon: '📚', color: '#a855f7', unlockReq: 'Find 40 treasures' },
  { name: 'Shadow Valley', description: 'A dark valley where shadows dance and secrets lurk in every corner', icon: '🌑', color: '#6b21a8', unlockReq: 'Find 55 treasures' },
  { name: 'Phoenix Nest', description: 'A blazing nest at the peak of an eternal flame mountain', icon: '🔥', color: '#f97316', unlockReq: 'Find 70 treasures' },
  { name: 'Star Temple', description: 'A celestial temple floating among the stars', icon: '⭐', color: '#eab308', unlockReq: 'Find 85 treasures' },
]

const RARITY_CONFIG: Record<Rarity, { color: string; multiplier: number; minLoot: number; maxLoot: number }> = {
  Common: { color: '#9ca3af', multiplier: 1, minLoot: 10, maxLoot: 25 },
  Uncommon: { color: '#22c55e', multiplier: 1.5, minLoot: 25, maxLoot: 50 },
  Rare: { color: '#3b82f6', multiplier: 2, minLoot: 50, maxLoot: 100 },
  Epic: { color: '#a855f7', multiplier: 3, minLoot: 100, maxLoot: 250 },
  Legendary: { color: '#f59e0b', multiplier: 5, minLoot: 250, maxLoot: 500 },
}

const ARTIFACT_DEFS: readonly { name: string; region: RegionName; rarity: Rarity; bonus: string; value: number }[] = [
  { name: 'Forest Amulet', region: 'Enchanted Forest', rarity: 'Common', bonus: 'Extra hint', value: 1 },
  { name: 'Crystal Lens', region: 'Crystal Cave', rarity: 'Uncommon', bonus: 'Reveal clue type', value: 1 },
  { name: 'Dragon Scale', region: 'Dragon Mountain', rarity: 'Rare', bonus: 'Skip wrong answer penalty', value: 2 },
  { name: 'Compass Rose', region: 'Sunken Ship', rarity: 'Uncommon', bonus: 'Better compass hints', value: 1 },
  { name: 'Wisdom Tome', region: 'Mystic Library', rarity: 'Rare', bonus: 'Show first letter', value: 2 },
  { name: 'Shadow Cloak', region: 'Shadow Valley', rarity: 'Epic', bonus: 'Extra life in expedition', value: 3 },
  { name: 'Phoenix Feather', region: 'Phoenix Nest', rarity: 'Epic', bonus: 'Double loot', value: 3 },
  { name: 'Star Map', region: 'Star Temple', rarity: 'Legendary', bonus: 'All bonuses', value: 5 },
]

const ACHIEVEMENT_DEFS: readonly { id: string; name: string; description: string; icon: string }[] = [
  { id: 'first_treasure', name: 'First Find', description: 'Discover your first treasure', icon: '🗝️' },
  { id: 'ten_treasures', name: 'Treasure Hunter', description: 'Find 10 treasures', icon: '💰' },
  { id: 'fifty_treasures', name: 'Master Hunter', description: 'Find 50 treasures', icon: '🏆' },
  { id: 'all_common', name: 'Common Collector', description: 'Find all Common treasures', icon: '🪙' },
  { id: 'rare_find', name: 'Rare Discovery', description: 'Find a Rare treasure', icon: '💎' },
  { id: 'epic_find', name: 'Epic Discovery', description: 'Find an Epic treasure', icon: '🔮' },
  { id: 'legendary_find', name: 'Legendary Discovery', description: 'Find a Legendary treasure', icon: '👑' },
  { id: 'no_hints', name: 'No Hints Needed', description: 'Solve 5 clues without hints', icon: '🧠' },
  { id: 'speed_demon', name: 'Speed Explorer', description: 'Complete a hunt in under 60 seconds', icon: '⚡' },
  { id: 'perfect_hunt', name: 'Perfect Hunt', description: 'Complete a hunt with 100% accuracy', icon: '🎯' },
  { id: 'all_regions', name: 'World Traveler', description: 'Hunt in all 8 regions', icon: '🗺️' },
  { id: 'streak_3', name: 'Streak Starter', description: 'Reach a 3-day streak', icon: '🔥' },
  { id: 'streak_7', name: 'Week Warrior', description: 'Reach a 7-day streak', icon: '📅' },
  { id: 'streak_14', name: 'Fortnight Fighter', description: 'Reach a 14-day streak', icon: '💪' },
  { id: 'collector_100', name: 'Centurion Collector', description: 'Collect 100 total loot items', icon: '🎒' },
]

const STREAK_MILESTONES: readonly { day: number; reward: string }[] = [
  { day: 3, reward: 'Explorer Badge' },
  { day: 7, reward: '500 bonus coins' },
  { day: 14, reward: 'Rare Compass' },
  { day: 21, reward: 'Epic Artifact Fragment' },
  { day: 30, reward: 'Legendary Treasure Map' },
]

// ─── Treasure Clue Definitions (80 total, 10 per region) ─────────────────────

const TREASURE_DEFS: readonly {
  id: string; name: string; region: RegionName; rarity: Rarity;
  clue: string; clueType: ClueType;
  h1: string; h2: string; h3: string;
  answer: string; lore: string; bonus: string
}[] = [
  // ── Enchanted Forest (10) ──
  { id: 'ef-1', name: 'Ancient Oak Heart', region: 'Enchanted Forest', rarity: 'Common', clue: 'I stand tall for centuries, my heart holds the forest\'s magic. What am I?', clueType: 'Riddle', h1: 'I am made of wood', h2: 'Birds nest in my branches', h3: 'My leaves change with seasons', answer: 'oak', lore: 'The heart of the oldest oak in the forest pulses with ancient druidic magic.', bonus: '+5 forest knowledge' },
  { id: 'ef-2', name: 'Fairy Ring', region: 'Enchanted Forest', rarity: 'Uncommon', clue: 'A circle of mushrooms where the wee folk dance at midnight', clueType: 'Riddle', h1: 'Found on the ground', h2: 'Appears after rain', h3: 'Mushrooms grow in a circle', answer: 'fairy ring', lore: 'Stepping inside a fairy ring at midnight grants a single wish.', bonus: '+10 magic resistance' },
  { id: 'ef-3', name: 'Elven Bow', region: 'Enchanted Forest', rarity: 'Rare', clue: 'Anagram: LEEB NOW', clueType: 'Anagram', h1: 'A weapon', h2: 'Used by elves', h3: 'Projectile weapon', answer: 'elven bow', lore: 'Crafted from moonwood, this bow never misses its target.', bonus: '+15 archery skill' },
  { id: 'ef-4', name: 'Moonpetal Crown', region: 'Enchanted Forest', rarity: 'Epic', clue: 'Fill in: Only blooming under the ____ light, these petals can crown a king', clueType: 'FillBlank', h1: 'It appears at night', h2: 'Wolves howl at it', h3: 'Earth has one natural one', answer: 'moon', lore: 'The Moonpetal Crown grants its wearer the ability to speak with forest creatures.', bonus: '+25 charisma' },
  { id: 'ef-5', name: 'Grove Guardian Stone', region: 'Enchanted Forest', rarity: 'Legendary', clue: 'Word Chain: TREE → _____ → _____ → GUARDIAN', clueType: 'WordChain', h1: 'Trees grow in one', h2: 'Guardians protect things', h3: 'A sacred place of trees', answer: 'grove', lore: 'The Grove Guardian Stone is the heart of forest defense, summoning protectors when danger nears.', bonus: '+50 nature affinity' },
  { id: 'ef-6', name: 'Sprites Dust', region: 'Enchanted Forest', rarity: 'Common', clue: 'Anagram: TRIPS DEUS', clueType: 'Anagram', h1: 'Tiny magical creatures', h2: 'Left behind by fairies', h3: 'Glittering powder', answer: 'sprites dust', lore: 'A pinch of sprites dust can heal any forest creature.', bonus: '+5 healing power' },
  { id: 'ef-7', name: 'Whispering Fern', region: 'Enchanted Forest', rarity: 'Common', clue: 'I whisper secrets of the forest to those who listen carefully', clueType: 'Riddle', h1: 'I am a plant', h2: 'I have fronds', h3: 'I grow in shaded areas', answer: 'fern', lore: 'The Whispering Fern speaks prophecies to those patient enough to listen.', bonus: '+5 foresight' },
  { id: 'ef-8', name: 'Druid Staff', region: 'Enchanted Forest', rarity: 'Rare', clue: 'Fill in: The druid carries a ____ carved from the World Tree', clueType: 'FillBlank', h1: 'A long stick', h2: 'Wizards carry these', h3: 'Used for walking and magic', answer: 'staff', lore: 'This staff channels the raw power of nature itself.', bonus: '+20 nature magic' },
  { id: 'ef-9', name: 'Enchanted Acorn', region: 'Enchanted Forest', rarity: 'Uncommon', clue: 'Anagram: COER ANN HENCTED', clueType: 'Anagram', h1: 'Something that grows on trees', h2: 'It contains a seed', h3: 'Squirrels love them', answer: 'enchanted acorn', lore: 'Planting this acorn grows a full tree overnight.', bonus: '+10 botany skill' },
  { id: 'ef-10', name: 'Forest Spirit Lantern', region: 'Enchanted Forest', rarity: 'Epic', clue: 'Word Chain: LIGHT → _____ → FOREST → _____', clueType: 'WordChain', h1: 'A source of illumination', h2: 'Used outdoors', h3: 'Jack carries one', answer: 'lantern', lore: 'The Forest Spirit Lantern reveals hidden paths through the densest woods.', bonus: '+30 pathfinding' },

  // ── Crystal Cave (10) ──
  { id: 'cc-1', name: 'Prism Shard', region: 'Crystal Cave', rarity: 'Common', clue: 'I split light into a rainbow of colors', clueType: 'Riddle', h1: 'I am made of glass-like material', h2: 'I have many flat surfaces', h3: 'Triangular in shape', answer: 'prism', lore: 'A shard from the Great Prism that illuminates the entire cave system.', bonus: '+5 light magic' },
  { id: 'cc-2', name: 'Echo Crystal', region: 'Crystal Cave', rarity: 'Uncommon', clue: 'Anagram: HCEO CRTSYLA', clueType: 'Anagram', h1: 'Found in caves', h2: 'It repeats sounds', h3: 'Transparent mineral', answer: 'echo crystal', lore: 'This crystal can store and replay any sound for eternity.', bonus: '+10 sound mastery' },
  { id: 'cc-3', name: 'Sapphire Heart', region: 'Crystal Cave', rarity: 'Rare', clue: 'Fill in: The deepest blue gem, a _____ heart beats in the cave\'s center', clueType: 'FillBlank', h1: 'A precious blue gem', h2: 'September birthstone', h3: 'Associated with wisdom', answer: 'sapphire', lore: 'The Sapphire Heart sustains all life within the Crystal Cave.', bonus: '+20 wisdom' },
  { id: 'cc-4', name: 'Diamond Needle', region: 'Crystal Cave', rarity: 'Epic', clue: 'Word Chain: CARBON → _____ → _____ → NEEDLE', clueType: 'WordChain', h1: 'The hardest natural material', h2: 'Used in jewelry', h3: 'Made of compressed carbon', answer: 'diamond', lore: 'The Diamond Needle can cut through any material in existence.', bonus: '+35 crafting' },
  { id: 'cc-5', name: 'Cave Ruby Matrix', region: 'Crystal Cave', rarity: 'Legendary', clue: 'I am red, I am rare, I pulse with the heat of the earth\'s core', clueType: 'Riddle', h1: 'A precious red gem', h2: 'July birthstone', h3: 'Associated with passion', answer: 'ruby', lore: 'The Ruby Matrix is the power source for all cave crystals.', bonus: '+50 fire resistance' },
  { id: 'cc-6', name: 'Quartz Compass', region: 'Crystal Cave', rarity: 'Common', clue: 'Anagram: TRQZAU OMCAPSS', clueType: 'Anagram', h1: 'A navigation tool', h2: 'Made from a common mineral', h3: 'Points the way', answer: 'quartz compass', lore: 'Always points toward the nearest crystal formation.', bonus: '+5 navigation' },
  { id: 'cc-7', name: 'Amethyst Cluster', region: 'Crystal Cave', rarity: 'Uncommon', clue: 'Fill in: Purple crystals clustered together, an _____ formation', clueType: 'FillBlank', h1: 'A purple gemstone', h2: 'February birthstone', h3: 'Associated with calm', answer: 'amethyst', lore: 'Meditating near an Amethyst Cluster grants visions of the future.', bonus: '+15 meditation' },
  { id: 'cc-8', name: 'Cave Pearl', region: 'Crystal Cave', rarity: 'Rare', clue: 'I am not from the sea, yet I gleam like my ocean cousins', clueType: 'Riddle', h1: 'I am round and smooth', h2: 'I form in mollusks', h3: 'I am considered a gem', answer: 'pearl', lore: 'This cave pearl formed over millennia from mineral-rich water drops.', bonus: '+20 luck' },
  { id: 'cc-9', name: 'Geode Cache', region: 'Crystal Cave', rarity: 'Common', clue: 'Anagram: GDEOE HCACH', clueType: 'Anagram', h1: 'A rock with crystals inside', h2: 'Looks plain outside', h3: 'Beautiful when cracked open', answer: 'geode cache', lore: 'Contains smaller crystals used for basic spellcasting.', bonus: '+5 spell components' },
  { id: 'cc-10', name: 'Obsidian Mirror', region: 'Crystal Cave', rarity: 'Epic', clue: 'Word Chain: VOLCANO → _____ → DARK → _____', clueType: 'WordChain', h1: 'Black volcanic glass', h2: 'Used by ancient cultures', h3: 'Reflective surface', answer: 'obsidian mirror', lore: 'Gazing into the Obsidian Mirror reveals truths hidden from mortal eyes.', bonus: '+30 divination' },

  // ── Dragon Mountain (10) ──
  { id: 'dm-1', name: 'Dragon Scale', region: 'Dragon Mountain', rarity: 'Common', clue: 'I am the armor of a mighty beast, impervious to common weapons', clueType: 'Riddle', h1: 'I come from a large reptile', h2: 'I am hard and shiny', h3: 'Dragons have many of me', answer: 'dragon scale', lore: 'A single dragon scale can withstand a direct cannon blast.', bonus: '+10 defense' },
  { id: 'dm-2', name: 'Fire Ruby', region: 'Dragon Mountain', rarity: 'Uncommon', clue: 'Anagram: RIFE YBRU', clueType: 'Anagram', h1: 'A red gem', h2: 'Associated with fire', h3: 'Found near volcanoes', answer: 'fire ruby', lore: 'This ruby burns eternally, never cooling to the touch.', bonus: '+15 fire damage' },
  { id: 'dm-3', name: 'Dragon Claw', region: 'Dragon Mountain', rarity: 'Rare', clue: 'Fill in: The dragon\'s _____ can tear through steel like paper', clueType: 'FillBlank', h1: 'Part of a foot', h2: 'Sharp and curved', h3: 'Cats have retractable ones', answer: 'claw', lore: 'Dragon claws are the finest crafting material for legendary weapons.', bonus: '+25 weapon damage' },
  { id: 'dm-4', name: 'Wyrmscale Armor', region: 'Dragon Mountain', rarity: 'Epic', clue: 'Word Chain: DRAGON → _____ → ARMOR → PLATE', clueType: 'WordChain', h1: 'Worn by knights', h2: 'Made from dragon parts', h3: 'Provides protection', answer: 'wyrmscale armor', lore: 'This armor makes its wearer nearly invulnerable to physical attacks.', bonus: '+40 defense' },
  { id: 'dm-5', name: 'Dragon Heart Stone', region: 'Dragon Mountain', rarity: 'Legendary', clue: 'Anagram: ARDONG ERATH STONE', clueType: 'Anagram', h1: 'From the chest of a beast', h2: 'It pulses with life', h3: 'The source of dragon fire', answer: 'dragon heart stone', lore: 'The Dragon Heart Stone contains the compressed life force of an elder dragon.', bonus: '+60 vitality' },
  { id: 'dm-6', name: 'Smoking Fang', region: 'Dragon Mountain', rarity: 'Common', clue: 'I am sharp, I am white, smoke rises from my tip', clueType: 'Riddle', h1: 'A tooth', h2: 'From a fire-breather', h3: 'Used as a dagger', answer: 'smoking fang', lore: 'This fang still smolders with dragon fire centuries after being shed.', bonus: '+10 piercing damage' },
  { id: 'dm-7', name: 'Lava Charm', region: 'Dragon Mountain', rarity: 'Uncommon', clue: 'Fill in: A charm forged in _____ that grants heat resistance', clueType: 'FillBlank', h1: 'Hot liquid rock', h2: 'Flows from volcanoes', h3: 'Orange and glowing', answer: 'lava', lore: 'Wearers can walk through molten lava unharmed.', bonus: '+20 fire resistance' },
  { id: 'dm-8', name: 'Ash Crown', region: 'Dragon Mountain', rarity: 'Rare', clue: 'Anagram: SHA CWORN', clueType: 'Anagram', h1: 'Worn on the head', h2: 'Made from fire residue', h3: 'Symbol of dragon authority', answer: 'ash crown', lore: 'The Ash Crown grants command over lesser fire creatures.', bonus: '+25 leadership' },
  { id: 'dm-9', name: 'Dragon Egg Fragment', region: 'Dragon Mountain', rarity: 'Epic', clue: 'Word Chain: EGG → SHELL → _____ → FRAGMENT', clueType: 'WordChain', h1: 'From a baby dragon', h2: 'Hard outer layer', h3: 'Contains new life', answer: 'dragon egg fragment', lore: 'This fragment can hatch a loyal drake companion.', bonus: '+35 companion bond' },
  { id: 'dm-10', name: 'Inferno Gauntlet', region: 'Dragon Mountain', rarity: 'Rare', clue: 'Fill in: The _____ gauntlet channels dragon fire into devastating punches', clueType: 'FillBlank', h1: 'Worn on the hand', h2: 'Related to extreme heat', h3: 'A large uncontrollable fire', answer: 'inferno gauntlet', lore: 'Each punch unleashes a cone of dragon fire.', bonus: '+30 unarmed damage' },

  // ── Sunken Ship (10) ──
  { id: 'ss-1', name: 'Gold Doubloon', region: 'Sunken Ship', rarity: 'Common', clue: 'I am round, I am gold, pirates fought for me', clueType: 'Riddle', h1: 'A form of currency', h2: 'Used by sailors', h3: 'Spanish coin', answer: 'gold doubloon', lore: 'Each doubloon carries the blessing of the sea god.', bonus: '+5 trading skill' },
  { id: 'ss-2', name: 'Captain\'s Log', region: 'Sunken Ship', rarity: 'Uncommon', clue: 'Anagram: SPTACANI GOL', clueType: 'Anagram', h1: 'Written records', h2: 'Kept by ship leaders', h3: 'Contains voyages', answer: 'captain log', lore: 'The Captain\'s Log reveals the location of other sunken treasure fleets.', bonus: '+15 navigation' },
  { id: 'ss-3', name: 'Trident Shard', region: 'Sunken Ship', rarity: 'Rare', clue: 'Fill in: A fragment of Poseidon\'s _____ washed ashore', clueType: 'FillBlank', h1: 'A three-pronged weapon', h2: 'Associated with the sea god', h3: 'Symbol of ocean power', answer: 'trident', lore: 'This shard grants control over ocean currents.', bonus: '+25 water magic' },
  { id: 'ss-4', name: 'Pearl Necklace', region: 'Sunken Ship', rarity: 'Common', clue: 'Anagram: LERAP CEKLANEC', clueType: 'Anagram', h1: 'Jewelry worn around the neck', h2: 'Made of ocean gems', h3: 'Elegant and classic', answer: 'pearl necklace', lore: 'Worn by the sea queen herself, it grants underwater breathing.', bonus: '+10 water breathing' },
  { id: 'ss-5', name: 'Kraken Eye', region: 'Sunken Ship', rarity: 'Epic', clue: 'I have seen the deepest trenches, my gaze freezes sailors in their tracks', clueType: 'Riddle', h1: 'From a legendary sea monster', h2: 'Used for seeing', h3: 'Round and massive', answer: 'kraken eye', lore: 'The Kraken Eye can reveal anything hidden beneath the waves.', bonus: '+35 underwater vision' },
  { id: 'ss-6', name: 'Coral Crown', region: 'Sunken Ship', rarity: 'Uncommon', clue: 'Fill in: A crown made of _____ from the reef kingdom', clueType: 'FillBlank', h1: 'Marine organisms', h2: 'Colorful underwater structures', h3: 'Reefs are made of them', answer: 'coral', lore: 'The Coral Crown grants dominion over all reef creatures.', bonus: '+15 sea creature command' },
  { id: 'ss-7', name: 'Sea Chart', region: 'Sunken Ship', rarity: 'Common', clue: 'Anagram: SEA TCRAH', clueType: 'Anagram', h1: 'A navigational tool', h2: 'Shows waterways', h3: 'Used by sailors', answer: 'sea chart', lore: 'This chart reveals safe passages through the most dangerous waters.', bonus: '+10 sailing skill' },
  { id: 'ss-8', name: 'Anchor Charm', region: 'Sunken Ship', rarity: 'Common', clue: 'I keep ships in place, I am heavy and strong', clueType: 'Riddle', h1: 'Dropped into the sea', h2: 'Prevents drifting', h3: 'Made of heavy metal', answer: 'anchor', lore: 'The Anchor Charm prevents the wearer from being moved against their will.', bonus: '+5 stability' },
  { id: 'ss-9', name: 'Mermaid Comb', region: 'Sunken Ship', rarity: 'Rare', clue: 'Word Chain: SEA → MERMAID → _____ → COMB', clueType: 'WordChain', h1: 'Used for hair', h2: 'Belongs to a sea creature', h3: 'Made of shell', answer: 'mermaid comb', lore: 'This comb can summon favorable winds and calm seas.', bonus: '+20 weather control' },
  { id: 'ss-10', name: 'Abyssal Pearl', region: 'Sunken Ship', rarity: 'Legendary', clue: 'From the deepest darkest depths, I hold the ocean\'s greatest secret', clueType: 'Riddle', h1: 'From the bottom of the sea', h2: 'Rarer than any other', h3: 'Perfectly round and dark', answer: 'abyssal pearl', lore: 'The Abyssal Pearl contains a pocket dimension of infinite water.', bonus: '+50 water mastery' },

  // ── Mystic Library (10) ──
  { id: 'ml-1', name: 'Ancient Scroll', region: 'Mystic Library', rarity: 'Common', clue: 'I hold words of power, rolled up and sealed with wax', clueType: 'Riddle', h1: 'Made of parchment', h2: 'You unroll me to read', h3: 'Found in libraries', answer: 'ancient scroll', lore: 'This scroll contains a forgotten spell of great utility.', bonus: '+5 spell knowledge' },
  { id: 'ml-2', name: 'Wisdom Grimoire', region: 'Mystic Library', rarity: 'Rare', clue: 'Anagram: DWOIMS ORIGMER', clueType: 'Anagram', h1: 'A book of magic', h2: 'Contains spells', h3: 'Witches use these', answer: 'wisdom grimoire', lore: 'The Wisdom Grimoire teaches spells that enhance mental capacity.', bonus: '+25 intelligence' },
  { id: 'ml-3', name: 'Infinity Quill', region: 'Mystic Library', rarity: 'Epic', clue: 'Fill in: A quill that never runs out of _____ and writes by itself', clueType: 'FillBlank', h1: 'Dark liquid', h2: 'Used for writing', h3: 'Squid produce it', answer: 'ink', lore: 'The Infinity Quill writes the future before it happens.', bonus: '+35 scribing' },
  { id: 'ml-4', name: 'Librarian Badge', region: 'Mystic Library', rarity: 'Common', clue: 'Anagram: LRBIIARN AEBDG', clueType: 'Anagram', h1: 'A symbol of authority', h2: 'Worn by library staff', h3: 'Grants access', answer: 'librarian badge', lore: 'This badge grants access to restricted sections of any library.', bonus: '+5 knowledge access' },
  { id: 'ml-5', name: 'Spellbound Tome', region: 'Mystic Library', rarity: 'Legendary', clue: 'Word Chain: BOOK → SPELL → TOME → _____', clueType: 'WordChain', h1: 'A large book', h2: 'Contains powerful magic', h3: 'Bound in dragon leather', answer: 'spellbound tome', lore: 'Reading the Spellbound Tome grants mastery over all known spells.', bonus: '+60 spell mastery' },
  { id: 'ml-6', name: 'Knowledge Crystal', region: 'Mystic Library', rarity: 'Uncommon', clue: 'Fill in: A _____ that contains the knowledge of a thousand scholars', clueType: 'FillBlank', h1: 'A transparent gem', h2: 'Can store information', h3: 'Found in caves', answer: 'knowledge crystal', lore: 'Touching the Knowledge Crystal grants temporary omniscience.', bonus: '+15 all skills' },
  { id: 'ml-7', name: 'Runestone Tablet', region: 'Mystic Library', rarity: 'Uncommon', clue: 'Anagram: NSTEORNE BTALET', clueType: 'Anagram', h1: 'Ancient writing surface', h2: 'Carved with symbols', h3: 'Viking artifacts', answer: 'runestone tablet', lore: 'The runes on this tablet glow when danger approaches.', bonus: '+15 rune reading' },
  { id: 'ml-8', name: 'Philosopher Ink', region: 'Mystic Library', rarity: 'Rare', clue: 'I can write truths that become reality, I turn thoughts into matter', clueType: 'Riddle', h1: 'A dark liquid', h2: 'Used with a quill', h3: 'Magical version', answer: 'philosopher ink', lore: 'Anything written with Philosopher Ink becomes real.', bonus: '+20 creation magic' },
  { id: 'ml-9', name: 'Enchanted Bookmark', region: 'Mystic Library', rarity: 'Common', clue: 'Anagram: NCNEHANTE DOOKMKAR', clueType: 'Anagram', h1: 'Marks your place', h2: 'In a book', h3: 'Magical version', answer: 'enchanted bookmark', lore: 'This bookmark always returns you to exactly where you left off.', bonus: '+5 concentration' },
  { id: 'ml-10', name: 'Arcanum Codex', region: 'Mystic Library', rarity: 'Epic', clue: 'Word Chain: MAGIC → ARCANE → _____ → CODEX', clueType: 'WordChain', h1: 'The deepest secrets', h2: 'Beyond normal magic', h3: 'A book of ultimate knowledge', answer: 'arcanum codex', lore: 'The Arcanum Codex explains the fundamental nature of magic itself.', bonus: '+40 arcane knowledge' },

  // ── Shadow Valley (10) ──
  { id: 'sv-1', name: 'Shadow Essence', region: 'Shadow Valley', rarity: 'Common', clue: 'I am darkness itself, bottled and contained', clueType: 'Riddle', h1: 'The absence of light', h2: 'Cast by objects', h3: 'Vampires dwell in me', answer: 'shadow essence', lore: 'Shadow Essence can create pockets of absolute darkness.', bonus: '+5 stealth' },
  { id: 'sv-2', name: 'Void Crystal', region: 'Shadow Valley', rarity: 'Rare', clue: 'Anagram: VIDO TCYRSAL', clueType: 'Anagram', h1: 'A dark gemstone', h2: 'Represents emptiness', h3: 'Absorbs light', answer: 'void crystal', lore: 'The Void Crystal can store and release massive amounts of dark energy.', bonus: '+20 dark magic' },
  { id: 'sv-3', name: 'Midnight Blade', region: 'Shadow Valley', rarity: 'Epic', clue: 'Fill in: A blade forged in _____ that cuts through darkness itself', clueType: 'FillBlank', h1: 'The darkest time of night', h2: '12 AM', h3: 'Between dusk and dawn', answer: 'midnight', lore: 'The Midnight Blade becomes invisible in shadows.', bonus: '+35 assassination' },
  { id: 'sv-4', name: 'Phantom Cloak', region: 'Shadow Valley', rarity: 'Uncommon', clue: 'Anagram: NPOMHAT OLCEK', clueType: 'Anagram', h1: 'Worn over clothing', h2: 'Makes you invisible', h3: 'Ghost-related', answer: 'phantom cloak', lore: 'The Phantom Cloak renders its wearer completely invisible in dim light.', bonus: '+15 invisibility' },
  { id: 'sv-5', name: 'Eclipse Stone', region: 'Shadow Valley', rarity: 'Legendary', clue: 'Word Chain: SUN → MOON → _____ → SHADOW', clueType: 'WordChain', h1: 'When one celestial body blocks another', h2: 'Causes temporary darkness', h3: 'A rare astronomical event', answer: 'eclipse stone', lore: 'The Eclipse Stone can blot out the sun when activated.', bonus: '+50 shadow mastery' },
  { id: 'sv-6', name: 'Wraith Whisper', region: 'Shadow Valley', rarity: 'Uncommon', clue: 'Fill in: A _____ carries messages between the living and the dead', clueType: 'FillBlank', h1: 'A ghost-like entity', h2: 'Tormented spirit', h3: 'Between ghost and specter', answer: 'wraith whisper', lore: 'The Wraith Whisper allows communication with the deceased.', bonus: '+15 necromancy' },
  { id: 'sv-7', name: 'Dark Mirror', region: 'Shadow Valley', rarity: 'Rare', clue: 'I show not your reflection, but your deepest fears', clueType: 'Riddle', h1: 'A reflective surface', h2: 'I show what you fear', h3: 'Made of dark glass', answer: 'dark mirror', lore: 'The Dark Mirror reveals your enemies\' weaknesses.', bonus: '+20 enemy insight' },
  { id: 'sv-8', name: 'Umbral Ring', region: 'Shadow Valley', rarity: 'Common', clue: 'Anagram: URMABL GRIN', clueType: 'Anagram', h1: 'Worn on a finger', h2: 'Related to shadows', h3: 'Jewelry', answer: 'umbral ring', lore: 'The Umbral Ring lets you step between shadows.', bonus: '+5 teleportation' },
  { id: 'sv-9', name: 'Nightshade Elixir', region: 'Shadow Valley', rarity: 'Rare', clue: 'Fill in: A potion brewed from _____ that grants night vision', clueType: 'FillBlank', h1: 'A poisonous plant', h2: 'Purple flowers', h3: 'Grows in shade', answer: 'nightshade', lore: 'This elixir grants perfect vision in complete darkness for one hour.', bonus: '+20 night vision' },
  { id: 'sv-10', name: 'Shadow Dragon Fang', region: 'Shadow Valley', rarity: 'Epic', clue: 'Word Chain: SHADOW → DRAGON → FANG → _____', clueType: 'WordChain', h1: 'From a shadowy beast', h2: 'A sharp tooth', h3: 'Used as a weapon', answer: 'shadow dragon fang', lore: 'This fang can poison even the most resilient creature.', bonus: '+30 poison damage' },

  // ── Phoenix Nest (10) ──
  { id: 'pn-1', name: 'Phoenix Feather', region: 'Phoenix Nest', rarity: 'Common', clue: 'I burst into flame yet never burn away', clueType: 'Riddle', h1: 'From a fire bird', h2: 'Red and gold', h3: 'Symbol of rebirth', answer: 'phoenix feather', lore: 'Phoenix feathers can cure any poison or disease.', bonus: '+5 fire resistance' },
  { id: 'pn-2', name: 'Ember Stone', region: 'Phoenix Nest', rarity: 'Uncommon', clue: 'Anagram: MRBEE ENOTS', clueType: 'Anagram', h1: 'A warm stone', h2: 'Glows red', h3: 'From a dying fire', answer: 'ember stone', lore: 'The Ember Stone never cools, providing infinite warmth.', bonus: '+15 warmth' },
  { id: 'pn-3', name: 'Flame Crown', region: 'Phoenix Nest', rarity: 'Epic', clue: 'Fill in: A crown of living _____ that burns all who touch it except its master', clueType: 'FillBlank', h1: 'The visible part of fire', h2: 'Orange and yellow', h3: 'Dances and flickers', answer: 'flame', lore: 'The Flame Crown grants immunity to all fire damage.', bonus: '+40 fire immunity' },
  { id: 'pn-4', name: 'Ash Egg', region: 'Phoenix Nest', rarity: 'Legendary', clue: 'Word Chain: FIRE → ASH → REBIRTH → _____', clueType: 'WordChain', h1: 'From a legendary bird', h2: 'Contains new life', h3: 'Made of burnt remnants', answer: 'ash egg', lore: 'The Ash Egg hatches into a baby phoenix when its master is in mortal peril.', bonus: '+60 resurrection' },
  { id: 'pn-5', name: 'Inferno Wing', region: 'Phoenix Nest', rarity: 'Rare', clue: 'Anagram: NFNERIO GWNI', clueType: 'Anagram', h1: 'From a fire bird', h2: 'Used for flying', h3: 'Always burning', answer: 'inferno wing', lore: 'The Inferno Wing grants the power of flight wreathed in flames.', bonus: '+25 flight' },
  { id: 'pn-6', name: 'Rebirth Essence', region: 'Phoenix Nest', rarity: 'Uncommon', clue: 'Fill in: The _____ of rebirth flows through the phoenix cycle', clueType: 'FillBlank', h1: 'A liquid extract', h2: 'Concentrated form', h3: 'The core of something', answer: 'essence', lore: 'Rebirth Essence can restore youth to the aged.', bonus: '+15 longevity' },
  { id: 'pn-7', name: 'Solar Talon', region: 'Phoenix Nest', rarity: 'Rare', clue: 'I am sharp as the sun is bright, I pierce armor like dawn pierces night', clueType: 'Riddle', h1: 'A bird\'s claw', h2: 'From a sun-associated creature', h3: 'Used as a blade', answer: 'solar talon', lore: 'The Solar Talon glows with the intensity of the sun.', bonus: '+25 radiant damage' },
  { id: 'pn-8', name: 'Cinder Ring', region: 'Phoenix Nest', rarity: 'Common', clue: 'Anagram: NCIDRE RNGI', clueType: 'Anagram', h1: 'Jewelry for the finger', h2: 'Related to fire residue', h3: 'Small and warm', answer: 'cinder ring', lore: 'The Cinder Ring provides a constant protective warmth.', bonus: '+5 protection' },
  { id: 'pn-9', name: 'Ignition Gem', region: 'Phoenix Nest', rarity: 'Uncommon', clue: 'Fill in: A gem that can start any _____ with a single thought', clueType: 'FillBlank', h1: 'Combustion', h2: 'What fire needs to start', h3: 'The beginning of burning', answer: 'ignition', lore: 'The Ignition Gem is the ultimate firestarting tool.', bonus: '+15 fire starting' },
  { id: 'pn-10', name: 'Phoenix Tear', region: 'Phoenix Nest', rarity: 'Epic', clue: 'Word Chain: PHOENIX → TEAR → HEAL → _____', clueType: 'WordChain', h1: 'A drop of liquid', h2: 'From the eye', h3: 'Of a legendary bird', answer: 'phoenix tear', lore: 'A single Phoenix Tear can heal any wound, no matter how severe.', bonus: '+35 healing' },

  // ── Star Temple (10) ──
  { id: 'st-1', name: 'Star Fragment', region: 'Star Temple', rarity: 'Common', clue: 'I fell from the sky, a piece of heaven itself', clueType: 'Riddle', h1: 'From outer space', h2: 'A piece of something larger', h3: 'Glows in the dark', answer: 'star fragment', lore: 'Star Fragments pulse with celestial energy.', bonus: '+5 celestial power' },
  { id: 'st-2', name: 'Nebula Dust', region: 'Star Temple', rarity: 'Uncommon', clue: 'Anagram: ULENAB TSUD', clueType: 'Anagram', h1: 'From space', h2: 'Cosmic cloud material', h3: 'Colorful powder', answer: 'nebula dust', lore: 'Nebula Dust can create miniature galaxies in the palm of your hand.', bonus: '+15 cosmic magic' },
  { id: 'st-3', name: 'Constellation Map', region: 'Star Temple', rarity: 'Rare', clue: 'Fill in: A _____ of the stars that reveals hidden cosmic paths', clueType: 'FillBlank', h1: 'A navigational chart', h2: 'Shows star patterns', h3: 'Used by astronomers', answer: 'constellation map', lore: 'Following the Constellation Map leads to hidden celestial treasure.', bonus: '+25 astronomy' },
  { id: 'st-4', name: 'Cosmic Orb', region: 'Star Temple', rarity: 'Epic', clue: 'Word Chain: STAR → GALAXY → UNIVERSE → _____', clueType: 'WordChain', h1: 'A spherical object', h2: 'Contains everything', h3: 'Related to space', answer: 'cosmic orb', lore: 'The Cosmic Orb contains a miniature universe within it.', bonus: '+35 cosmic power' },
  { id: 'st-5', name: 'Celestial Crown', region: 'Star Temple', rarity: 'Legendary', clue: 'I am the crown of the cosmos, studded with stars and moons', clueType: 'Riddle', h1: 'Worn on the head', h2: 'Made of celestial objects', h3: 'Royal headwear', answer: 'celestial crown', lore: 'The Celestial Crown grants dominion over all celestial bodies.', bonus: '+50 cosmic authority' },
  { id: 'st-6', name: 'Moonstone Shard', region: 'Star Temple', rarity: 'Common', clue: 'Anagram: OSNMOOTNE HDSRA', clueType: 'Anagram', h1: 'A gemstone', h2: 'Associated with the moon', h3: 'Glowing fragment', answer: 'moonstone shard', lore: 'Moonstone Shards amplify lunar magic during full moons.', bonus: '+5 lunar magic' },
  { id: 'st-7', name: 'Solar Flare Gem', region: 'Star Temple', rarity: 'Rare', clue: 'Fill in: A gem that captures the power of a _____ flare', clueType: 'FillBlank', h1: 'From our star', h2: 'A sudden burst of energy', h3: 'The center of our system', answer: 'solar', lore: 'The Solar Flare Gem can release devastating bursts of stellar energy.', bonus: '+25 solar power' },
  { id: 'st-8', name: 'Astral Compass', region: 'Star Temple', rarity: 'Uncommon', clue: 'I point not north, but toward your cosmic destiny', clueType: 'Riddle', h1: 'A directional tool', h2: 'Points to something beyond', h3: 'Related to space travel', answer: 'astral compass', lore: 'The Astral Compass always points toward your greatest adventure.', bonus: '+15 destiny sense' },
  { id: 'st-9', name: 'Void Key', region: 'Star Temple', rarity: 'Epic', clue: 'Anagram: DIVO YKE', clueType: 'Anagram', h1: 'Opens something', h2: 'Related to emptiness', h3: 'Between spaces', answer: 'void key', lore: 'The Void Key can open doorways between dimensions.', bonus: '+35 portal creation' },
  { id: 'st-10', name: 'Infinity Core', region: 'Star Temple', rarity: 'Legendary', clue: 'Word Chain: TIME → SPACE → INFINITY → _____', clueType: 'WordChain', h1: 'The center of something', h2: 'Without end', h3: 'The heart of the temple', answer: 'infinity core', lore: 'The Infinity Core grants its wielder power beyond mortal comprehension.', bonus: '+60 ultimate power' },
]

// ─── PRNG ─────────────────────────────────────────────────────────────────────

function seededRandom(seed: string): () => number {
  let h = 0
  for (let i = 0; i < seed.length; i++) { h = Math.imul(31, h) + seed.charCodeAt(i) | 0; }
  return () => { h = h ^ (h << 13); h = h ^ (h >> 17); h = h ^ (h << 5); return (h >>> 0) / 4294967296; }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function shuffleArray<T>(arr: T[], rng?: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = rng ? Math.floor(rng() * (i + 1)) : Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateLoot(rarity: Rarity, rng: () => number): LootItem {
  const rc = RARITY_CONFIG[rarity]
  const value = Math.floor(rc.minLoot + rng() * (rc.maxLoot - rc.minLoot))
  const prefixes = ['Ancient', 'Glowing', 'Enchanted', 'Shadow', 'Golden', 'Crystal', 'Frost', 'Ember', 'Mystic', 'Royal']
  const suffixes = ['Coin', 'Gem', 'Relic', 'Charm', 'Token', 'Shard', 'Orb', 'Idol', 'Sigil', 'Artifact']
  const name = `${prefixes[Math.floor(rng() * prefixes.length)]} ${suffixes[Math.floor(rng() * suffixes.length)]}`
  const descriptions = [
    `A ${rarity.toLowerCase()} treasure worth ${value} coins`,
    `Shimmers with ${rarity.toLowerCase()} energy`,
    `Grants a small ${rarity.toLowerCase()} bonus`,
    `A collector's ${rarity.toLowerCase()} item`,
    `Radiates subtle ${rarity.toLowerCase()} power`,
  ]
  return {
    name,
    rarity,
    value: Math.round(value * rc.multiplier),
    description: descriptions[Math.floor(rng() * descriptions.length)],
  }
}

function buildDefaultHunt(): HuntState {
  return {
    isActive: false,
    region: null,
    currentTreasure: null,
    cluesRevealed: 0,
    hintsUsed: 0,
    startTime: null,
    elapsedSeconds: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    artifactsFound: 0,
    lootCollected: [],
  }
}

function buildDefaultStreakMilestones(): StreakMilestone[] {
  return STREAK_MILESTONES.map(m => ({ day: m.day, reward: m.reward, claimed: false }))
}

function buildDefaultAchievements(): THAchievement[] {
  return ACHIEVEMENT_DEFS.map(a => ({ id: a.id, name: a.name, description: a.description, icon: a.icon, unlocked: false, unlockedAt: null }))
}

function buildDefaultArtifacts(): Artifact[] {
  return ARTIFACT_DEFS.map(a => ({ name: a.name, region: a.region, rarity: a.rarity, bonus: a.bonus, bonusValue: a.value, equipped: false }))
}

function buildDefaultRegions(): Region[] {
  return REGION_DEFS.map(r => ({
    name: r.name, description: r.description, icon: r.icon, color: r.color,
    treasureCount: 10, discovered: 0, unlocked: r.unlockReq === '', unlockRequirement: r.unlockReq,
  }))
}

function buildDailyExpedition(): DailyExpedition {
  const rng = seededRandom('daily-th-' + getDateString())
  const regions: RegionName[] = ['Enchanted Forest', 'Crystal Cave', 'Dragon Mountain', 'Sunken Ship', 'Mystic Library', 'Shadow Valley', 'Phoenix Nest', 'Star Temple']
  return {
    date: getDateString(),
    region: regions[Math.floor(rng() * regions.length)],
    targetTreasures: 3 + Math.floor(rng() * 4),
    timeLimit: 180 + Math.floor(rng() * 120),
    completed: false,
    treasuresFound: 0,
    bestTime: null,
  }
}

function getCompassDirection(region: RegionName, rng: () => number): string {
  const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest']
  return directions[Math.floor(rng() * directions.length)]
}

function getCompassMessage(region: RegionName): string {
  const messages: Record<string, string[]> = {
    'Enchanted Forest': ['The trees seem to whisper from the north...', 'A faint glow pulses to the east...', 'Birds fly toward a clearing...'],
    'Crystal Cave': ['Crystal formations shimmer to the west...', 'A warm draft comes from below...', 'Light refracts from the south...'],
    'Dragon Mountain': ['Heat radiates from the upper chambers...', 'Smoke rises from the northeast...', 'The ground trembles to the west...'],
    'Sunken Ship': ['Currents flow toward the stern...', 'Bioluminescence glows to the north...', 'A chest glints in the distance...'],
    'Mystic Library': ['Ancient tomes glow on the top shelf...', 'A hidden passage opens to the east...', 'Knowledge radiates from the south...'],
    'Shadow Valley': ['Darkness deepens to the north...', 'A faint light flickers to the west...', 'Shadows move against the wind...'],
    'Phoenix Nest': ['Heat intensifies above...', 'Embers drift from the east...', 'The flames dance toward the south...'],
    'Star Temple': ['Starlight concentrates to the north...', 'A cosmic hum resonates from within...', 'The floor glows beneath your feet...'],
  }
  const msgList = messages[region] || ['The compass spins uncertainly...']
  return msgList[Math.floor(Math.random() * msgList.length)]
}

// ─── Module State ─────────────────────────────────────────────────────────────

let state: THState | null = null

// ─── Init ─────────────────────────────────────────────────────────────────────

function createDefaultState(): THState {
  return {
    initialized: false,
    regions: buildDefaultRegions(),
    allTreasures: TREASURE_DEFS.map(t => ({
      id: t.id, name: t.name, region: t.region, rarity: t.rarity,
      discovered: false, clue: t.clue, clueType: t.clueType,
      hint1: t.h1, hint2: t.h2, hint3: t.h3,
      answer: t.answer, lore: t.lore, artifactBonus: t.bonus,
    })),
    hunt: buildDefaultHunt(),
    totalTreasuresFound: 0,
    totalHuntsCompleted: 0,
    totalCluesSolved: 0,
    totalHintsUsed: 0,
    streak: 0,
    streakHistory: [],
    streakMilestones: buildDefaultStreakMilestones(),
    achievements: buildDefaultAchievements(),
    artifacts: buildDefaultArtifacts(),
    inventory: [],
    totalLootValue: 0,
    dailyExpedition: buildDailyExpedition(),
    bestHuntTime: 0,
    perfectHunts: 0,
    compassDirection: 'North',
    compassMessage: 'The compass awaits your first hunt...',
  }
}

function ensureInit(): void {
  if (!state) state = createDefaultState()
}

// ─── Exported Functions ───────────────────────────────────────────────────────

export function thInit(): void {
  ensureInit()
  if (state && !state.initialized) {
    state.initialized = true
    updateRegionUnlocks()
  }
}

export function thGetState(): THState {
  ensureInit()
  return state!
}

export function thResetState(): void {
  state = null
}

export function thStartHunt(region: RegionName): boolean {
  ensureInit()
  if (!state) return false
  const regionData = state.regions.find(r => r.name === region)
  if (!regionData || !regionData.unlocked) return false
  const undiscovered = state.allTreasures.filter(t => t.region === region && !t.discovered)
  if (undiscovered.length === 0) return false
  const rng = seededRandom(`hunt-${region}-${Date.now()}`)
  const treasure = undiscovered[Math.floor(rng() * undiscovered.length)]
  state.hunt = {
    isActive: true,
    region,
    currentTreasure: treasure,
    cluesRevealed: 1,
    hintsUsed: 0,
    startTime: Date.now(),
    elapsedSeconds: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    artifactsFound: 0,
    lootCollected: [],
  }
  const dirRng = seededRandom(`compass-${Date.now()}`)
  state.compassDirection = getCompassDirection(region, dirRng)
  state.compassMessage = getCompassMessage(region)
  return true
}

export function thAbandonHunt(): void {
  ensureInit()
  if (!state) return
  state.hunt = buildDefaultHunt()
  state.compassMessage = 'The hunt was abandoned. Ready for a new adventure.'
}

export function thGetClue(): { clue: string; clueType: ClueType; hintsRemaining: number } {
  ensureInit()
  if (!state || !state.hunt.isActive || !state.hunt.currentTreasure) {
    return { clue: 'Start a hunt to receive clues', clueType: 'Riddle', hintsRemaining: 3 }
  }
  return {
    clue: state.hunt.currentTreasure.clue,
    clueType: state.hunt.currentTreasure.clueType,
    hintsRemaining: 3 - state.hunt.hintsUsed,
  }
}

export function thUseHint(): string {
  ensureInit()
  if (!state || !state.hunt.isActive || !state.hunt.currentTreasure) return 'No active hunt'
  if (state.hunt.hintsUsed >= 3) return 'No hints remaining'
  state.hunt.hintsUsed++
  state.totalHintsUsed++
  const t = state.hunt.currentTreasure
  if (state.hunt.hintsUsed === 1) return t.hint1
  if (state.hunt.hintsUsed === 2) return t.hint2
  return t.hint3
}

export function thCheckAnswer(answer: string): { correct: boolean; lore: string; loot: LootItem | null; nextAvailable: boolean } {
  ensureInit()
  if (!state || !state.hunt.isActive || !state.hunt.currentTreasure) {
    return { correct: false, lore: '', loot: null, nextAvailable: false }
  }
  const normalized = answer.toLowerCase().trim()
  const correct = normalized === state.hunt.currentTreasure.answer.toLowerCase()
  if (correct) {
    state.hunt.correctAnswers++
    state.hunt.currentTreasure.discovered = true
    state.totalTreasuresFound++
    state.totalCluesSolved++
    const regionData = state.regions.find(r => r.name === state!.hunt.region)
    if (regionData) regionData.discovered++
    const rng = seededRandom(`loot-${state.hunt.currentTreasure.id}-${Date.now()}`)
    const loot = generateLoot(state.hunt.currentTreasure.rarity, rng)
    state.hunt.lootCollected.push(loot)
    state.inventory.push(loot)
    state.totalLootValue += loot.value
    if (state.hunt.hintsUsed === 0) state.perfectHunts++
    checkTHAchievements()
    updateRegionUnlocks()
    const lore = state.hunt.currentTreasure.lore
    const undiscovered = state.allTreasures.filter(t => t.region === state!.hunt.region && !t.discovered)
    const nextAvailable = undiscovered.length > 0
    state.hunt.isActive = false
    state.totalHuntsCompleted++
    if (state.hunt.startTime) {
      const elapsed = (Date.now() - state.hunt.startTime) / 1000
      state.hunt.elapsedSeconds = elapsed
      if (state.bestHuntTime === 0 || elapsed < state.bestHuntTime) state.bestHuntTime = elapsed
    }
    return { correct: true, lore, loot, nextAvailable }
  } else {
    state.hunt.incorrectAnswers++
    return { correct: false, lore: '', loot: null, nextAvailable: true }
  }
}

export function thGetRegions(): Region[] {
  ensureInit()
  if (!state) return buildDefaultRegions()
  return state.regions
}

export function thGetMapOverview() {
  ensureInit()
  if (!state) return { totalRegions: 8, unlockedRegions: 1, totalTreasures: 80, discovered: 0, completion: 0 }
  const unlocked = state.regions.filter(r => r.unlocked).length
  return {
    totalRegions: state.regions.length,
    unlockedRegions: unlocked,
    totalTreasures: state.allTreasures.length,
    discovered: state.totalTreasuresFound,
    completion: Math.round((state.totalTreasuresFound / state.allTreasures.length) * 100),
    regions: state.regions.map(r => ({
      name: r.name, icon: r.icon, color: r.color,
      discovered: r.discovered, total: r.treasureCount,
      unlocked: r.unlocked, completion: Math.round((r.discovered / r.treasureCount) * 100),
    })),
  }
}

export function thGetStatsGrid() {
  ensureInit()
  if (!state) return getDefaultTHStats()
  return {
    totalTreasuresFound: state.totalTreasuresFound,
    totalHuntsCompleted: state.totalHuntsCompleted,
    totalCluesSolved: state.totalCluesSolved,
    totalHintsUsed: state.totalHintsUsed,
    perfectHunts: state.perfectHunts,
    bestHuntTime: state.bestHuntTime,
    totalLootValue: state.totalLootValue,
    inventorySize: state.inventory.length,
    artifactsFound: state.artifacts.filter(a => a.equipped).length,
    streak: state.streak,
    completion: Math.round((state.totalTreasuresFound / state.allTreasures.length) * 100),
  }
}

function getDefaultTHStats() {
  return {
    totalTreasuresFound: 0, totalHuntsCompleted: 0, totalCluesSolved: 0,
    totalHintsUsed: 0, perfectHunts: 0, bestHuntTime: 0, totalLootValue: 0,
    inventorySize: 0, artifactsFound: 0, streak: 0, completion: 0,
  }
}

export function thGetCollectionGrid() {
  ensureInit()
  if (!state) return { items: [], totalValue: 0 }
  const byRarity: Record<Rarity, LootItem[]> = { Common: [], Uncommon: [], Rare: [], Epic: [], Legendary: [] }
  for (const item of state.inventory) {
    byRarity[item.rarity].push(item)
  }
  return {
    items: state.inventory.slice(-50),
    totalValue: state.totalLootValue,
    byRarity,
    totalItems: state.inventory.length,
    commonCount: byRarity.Common.length,
    uncommonCount: byRarity.Uncommon.length,
    rareCount: byRarity.Rare.length,
    epicCount: byRarity.Epic.length,
    legendaryCount: byRarity.Legendary.length,
  }
}

export function thGetAchievementGrid(): THAchievement[] {
  ensureInit()
  if (!state) return buildDefaultAchievements()
  return state.achievements
}

export function thGetCompassHint(): { direction: string; message: string } {
  ensureInit()
  if (!state) return { direction: 'North', message: 'Begin a hunt to use the compass' }
  return { direction: state.compassDirection, message: state.compassMessage }
}

export function thGetHuntOverview() {
  ensureInit()
  if (!state) return { isActive: false, region: null, progress: { correct: 0, incorrect: 0, hints: 0 }, elapsed: 0 }
  const h = state.hunt
  return {
    isActive: h.isActive,
    region: h.region,
    treasure: h.currentTreasure ? { name: h.currentTreasure.name, rarity: h.currentTreasure.rarity, clueType: h.currentTreasure.clueType } : null,
    progress: { correct: h.correctAnswers, incorrect: h.incorrectAnswers, hints: h.hintsUsed },
    elapsed: h.startTime ? Math.round((Date.now() - h.startTime) / 1000) : 0,
    lootCount: h.lootCollected.length,
  }
}

export function thGetStreak(): { current: number; milestones: StreakMilestone[] } {
  ensureInit()
  if (!state) return { current: 0, milestones: buildDefaultStreakMilestones() }
  return { current: state.streak, milestones: state.streakMilestones }
}

export function thGetDailyCard() {
  ensureInit()
  if (!state) return { date: getDateString(), region: 'Enchanted Forest' as RegionName, targetTreasures: 3, timeLimit: 180, completed: false, treasuresFound: 0, bestTime: null }
  const de = state.dailyExpedition
  return {
    date: de.date,
    region: de.region,
    targetTreasures: de.targetTreasures,
    timeLimit: de.timeLimit,
    completed: de.completed,
    treasuresFound: de.treasuresFound,
    bestTime: de.bestTime,
    streak: state.streak,
  }
}

export function thGetAchievements(): THAchievement[] {
  ensureInit()
  if (!state) return buildDefaultAchievements()
  return state.achievements
}

export function thGetDailyStreak(): number {
  ensureInit()
  if (!state) return 0
  return state.streak
}

export function thIsDailyCompleted(): boolean {
  ensureInit()
  if (!state) return false
  return state.dailyExpedition.completed
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function updateRegionUnlocks(): void {
  if (!state) return
  for (const region of state.regions) {
    if (region.unlocked) continue
    const req = region.unlockRequirement
    if (req.includes('5 treasures') && state.totalTreasuresFound >= 5) region.unlocked = true
    if (req.includes('15 treasures') && state.totalTreasuresFound >= 15) region.unlocked = true
    if (req.includes('25 treasures') && state.totalTreasuresFound >= 25) region.unlocked = true
    if (req.includes('40 treasures') && state.totalTreasuresFound >= 40) region.unlocked = true
    if (req.includes('55 treasures') && state.totalTreasuresFound >= 55) region.unlocked = true
    if (req.includes('70 treasures') && state.totalTreasuresFound >= 70) region.unlocked = true
    if (req.includes('85 treasures') && state.totalTreasuresFound >= 85) region.unlocked = true
  }
}

function checkTHAchievements(): void {
  if (!state) return
  const s = state
  const check = (id: string, cond: boolean) => {
    const a = s.achievements.find(x => x.id === id)
    if (a && !a.unlocked && cond) { a.unlocked = true; a.unlockedAt = new Date().toISOString() }
  }
  check('first_treasure', s.totalTreasuresFound >= 1)
  check('ten_treasures', s.totalTreasuresFound >= 10)
  check('fifty_treasures', s.totalTreasuresFound >= 50)
  check('all_common', s.allTreasures.filter(t => t.rarity === 'Common').every(t => t.discovered))
  check('rare_find', s.allTreasures.some(t => t.rarity === 'Rare' && t.discovered))
  check('epic_find', s.allTreasures.some(t => t.rarity === 'Epic' && t.discovered))
  check('legendary_find', s.allTreasures.some(t => t.rarity === 'Legendary' && t.discovered))
  check('no_hints', s.perfectHunts >= 5)
  check('speed_demon', s.bestHuntTime > 0 && s.bestHuntTime < 60)
  check('perfect_hunt', s.perfectHunts >= 1)
  check('all_regions', s.regions.filter(r => r.unlocked).length >= 8)
  check('streak_3', s.streak >= 3)
  check('streak_7', s.streak >= 7)
  check('streak_14', s.streak >= 14)
  check('collector_100', s.inventory.length >= 100)
  checkStreakMilestones()
}

function checkStreakMilestones(): void {
  if (!state) return
  for (const m of state.streakMilestones) {
    if (!m.claimed && state.streak >= m.day) m.claimed = true
  }
}
