// achievement-museum-wire.ts — SSR-safe wire module
// Prefix: ms | NO React | NO localStorage/window | NO setInterval

// ─── Types ────────────────────────────────────────────────────────────────────

type HallName = 'Glory' | 'Speed' | 'Wisdom' | 'Combat' | 'Collection' | 'Social' | 'Exploration' | 'Legends'
type ExhibitRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'

interface Exhibit {
  id: string
  name: string
  hall: HallName
  rarity: ExhibitRarity
  description: string
  lore: string
  collected: boolean
  collectedAt: string | null
  pedestalColor: string
  icon: string
}

interface Hall {
  name: HallName
  description: string
  icon: string
  themeColor: string
  exhibits: Exhibit[]
  completion: number
  unlocked: boolean
  unlockRequirement: string
}

interface TourStop {
  hall: HallName
  exhibitId: string
  narration: string
  duration: number
}

interface Tour {
  id: string
  name: string
  description: string
  stops: TourStop[]
  duration: number
  completed: boolean
  completedAt: string | null
}

interface SouvenirItem {
  id: string
  name: string
  description: string
  price: number
  icon: string
  category: string
  purchased: boolean
}

interface PhotoSpot {
  id: string
  name: string
  hall: HallName
  description: string
  captured: boolean
  capturedAt: string | null
  filter: string
}

interface AudioNarration {
  id: string
  title: string
  hall: HallName
  duration: number
  transcript: string
  unlocked: boolean
}

interface MSAchievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt: string | null
}

interface VisitorRecord {
  date: string
  hallsVisited: HallName[]
  exhibitsCollected: number
  timeSpent: number
}

interface MSState {
  initialized: boolean
  halls: Hall[]
  exhibits: Exhibit[]
  tours: Tour[]
  activeTour: string | null
  tourProgress: number
  souvenirs: SouvenirItem[]
  photoSpots: PhotoSpot[]
  audioNarrations: AudioNarration[]
  achievements: MSAchievement[]
  museumCoins: number
  totalCoinsEarned: number
  museumLevel: number
  museumScore: number
  visitorHistory: VisitorRecord[]
  todayVisit: VisitorRecord | null
  totalExhibitsCollected: number
  totalToursCompleted: number
  totalPhotosTaken: number
  totalSouvenirsBought: number
  featuredExhibit: Exhibit | null
  dailyStreak: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HALL_DEFS: readonly { name: HallName; desc: string; icon: string; color: string; unlockReq: string }[] = [
  { name: 'Glory', desc: 'Trophies of your greatest victories and proudest moments', icon: '🏆', color: '#f59e0b', unlockReq: '' },
  { name: 'Speed', desc: 'Records of your fastest accomplishments and reflexes', icon: '⚡', color: '#3b82f6', unlockReq: 'Collect 5 exhibits' },
  { name: 'Wisdom', desc: 'Knowledge gathered through puzzles, riddles, and learning', icon: '📖', color: '#22c55e', unlockReq: 'Collect 15 exhibits' },
  { name: 'Combat', desc: 'Mementos from battles fought and challenges conquered', icon: '⚔️', color: '#ef4444', unlockReq: 'Collect 30 exhibits' },
  { name: 'Collection', desc: 'Rare and valuable items assembled over time', icon: '💎', color: '#a855f7', unlockReq: 'Collect 50 exhibits' },
  { name: 'Social', desc: 'Memories of teamwork, collaboration, and community', icon: '🤝', color: '#ec4899', unlockReq: 'Collect 65 exhibits' },
  { name: 'Exploration', desc: 'Artifacts from distant lands and hidden places', icon: '🗺️', color: '#06b6d4', unlockReq: 'Collect 80 exhibits' },
  { name: 'Legends', desc: 'The most legendary and mythical achievements of all', icon: '👑', color: '#eab308', unlockReq: 'Collect 95 exhibits' },
]

const PEDESTAL_COLORS: Record<ExhibitRarity, string> = {
  Common: '#6b7280',
  Uncommon: '#22c55e',
  Rare: '#3b82f6',
  Epic: '#a855f7',
  Legendary: '#f59e0b',
}

const EXHIBIT_DEFS: readonly {
  id: string; name: string; hall: HallName; rarity: ExhibitRarity;
  desc: string; lore: string; icon: string
}[] = [
  // ── Glory Hall (14) ──
  { id: 'gl-1', name: 'First Victory Badge', hall: 'Glory', rarity: 'Common', desc: 'Awarded for your very first achievement', lore: 'Every legend begins with a single step.', icon: '🎖️' },
  { id: 'gl-2', name: 'Golden Trophy', hall: 'Glory', rarity: 'Uncommon', desc: 'A trophy earned through dedication', lore: 'Forged in the fires of perseverance.', icon: '🏆' },
  { id: 'gl-3', name: 'Champion Crown', hall: 'Glory', rarity: 'Rare', desc: 'Worn by those who rise above all', lore: 'The weight of true leadership.', icon: '👑' },
  { id: 'gl-4', name: 'Triumph Banner', hall: 'Glory', rarity: 'Common', desc: 'A banner celebrating a hard-won battle', lore: 'It waves proudly in the halls of memory.', icon: '🚩' },
  { id: 'gl-5', name: 'Victory Medal', hall: 'Glory', rarity: 'Common', desc: 'A medal commemorating a great victory', lore: 'Cold metal, warm memories.', icon: '🥇' },
  { id: 'gl-6', name: 'Star of Excellence', hall: 'Glory', rarity: 'Uncommon', desc: 'Awarded for consistently outstanding performance', lore: 'Stars guide those who achieve.', icon: '⭐' },
  { id: 'gl-7', name: 'Hall of Fame Plaque', hall: 'Glory', rarity: 'Epic', desc: 'Your name etched among the greats', lore: 'Immortality through achievement.', icon: '📜' },
  { id: 'gl-8', name: 'Diamond Championship Ring', hall: 'Glory', rarity: 'Legendary', desc: 'The ultimate symbol of competitive mastery', lore: 'Set with a diamond that reflects every victory.', icon: '💍' },
  { id: 'gl-9', name: 'Silver Laurel Wreath', hall: 'Glory', rarity: 'Uncommon', desc: 'An ancient symbol of triumph', lore: 'Worn by champions since antiquity.', icon: '🌿' },
  { id: 'gl-10', name: 'Glory Shield', hall: 'Glory', rarity: 'Rare', desc: 'A shield that defends your honor', lore: 'Unbroken through a thousand battles.', icon: '🛡️' },
  { id: 'gl-11', name: 'Perfection Trophy', hall: 'Glory', rarity: 'Epic', desc: 'Achieved without a single flaw', lore: 'Perfection is not a destination but a pursuit.', icon: '💎' },
  { id: 'gl-12', name: 'Hero Portrait', hall: 'Glory', rarity: 'Rare', desc: 'A painted portrait of your heroic moment', lore: 'The artist captured not just your likeness but your spirit.', icon: '🖼️' },
  { id: 'gl-13', name: 'Bronze Commemorative Coin', hall: 'Glory', rarity: 'Common', desc: 'A coin minted in your honor', lore: 'Small but significant.', icon: '🪙' },
  { id: 'gl-14', name: 'Scepter of Champions', hall: 'Glory', rarity: 'Legendary', desc: 'The ruling scepter of absolute champions', lore: 'It glows brighter with each victory claimed.', icon: '🪄' },

  // ── Speed Hall (13) ──
  { id: 'sp-1', name: 'Lightning Bolt Trophy', hall: 'Speed', rarity: 'Common', desc: 'For quick reflexes and fast thinking', lore: 'Faster than a thought.', icon: '⚡' },
  { id: 'sp-2', name: 'Sprint Medal', hall: 'Speed', rarity: 'Common', desc: 'Awarded for blazing speed', lore: 'The wind itself could not keep up.', icon: '🏃' },
  { id: 'sp-3', name: 'Velocity Crystal', hall: 'Speed', rarity: 'Uncommon', desc: 'A crystal that vibrates with kinetic energy', lore: 'It hums with the memory of speed.', icon: '💠' },
  { id: 'sp-4', name: 'Chrono Hourglass', hall: 'Speed', rarity: 'Rare', desc: 'An hourglass that slows time for the swift', lore: 'Time bends for those who are fast enough.', icon: '⏳' },
  { id: 'sp-5', name: 'Racer Helmet', hall: 'Speed', rarity: 'Uncommon', desc: 'Worn during record-breaking races', lore: 'Every scratch tells a story of speed.', icon: '🏍️' },
  { id: 'sp-6', name: 'Speed Demon Horns', hall: 'Speed', rarity: 'Epic', desc: 'Trophies from the speed demon challenge', lore: 'Channel the fury of pure velocity.', icon: '😈' },
  { id: 'sp-7', name: 'Turbo Engine Model', hall: 'Speed', rarity: 'Rare', desc: 'A model of the engine that broke the barrier', lore: 'Raw power refined to perfection.', icon: '🔧' },
  { id: 'sp-8', name: 'Flash Boots', hall: 'Speed', rarity: 'Legendary', desc: 'Boots that leave trails of light', lore: 'Step into a world of afterimages.', icon: '👢' },
  { id: 'sp-9', name: 'Stopwatch of Records', hall: 'Speed', rarity: 'Common', desc: 'The stopwatch that timed your greatest feat', lore: 'Every tick is a moment of anticipation.', icon: '⏱️' },
  { id: 'sp-10', name: 'Wind Rider Cape', hall: 'Speed', rarity: 'Uncommon', desc: 'A cape that billows in the wind of speed', lore: 'Fashion meets function at terminal velocity.', icon: '🦸' },
  { id: 'sp-11', name: 'Mach Badge', hall: 'Speed', rarity: 'Rare', desc: 'Breaking the sound barrier of achievement', lore: 'A sonic boom of success.', icon: '🔊' },
  { id: 'sp-12', name: 'Neon Trail Artifact', hall: 'Speed', rarity: 'Epic', desc: 'Captured neon light from a speed run', lore: 'The afterglow of velocity.', icon: '🌈' },
  { id: 'sp-13', name: 'Temporal Crown', hall: 'Speed', rarity: 'Legendary', desc: 'A crown that exists slightly ahead of time', lore: 'The future is now.', icon: '⭐' },

  // ── Wisdom Hall (13) ──
  { id: 'ws-1', name: 'Ancient Scroll', hall: 'Wisdom', rarity: 'Common', desc: 'Contains forgotten knowledge', lore: 'Words that transcended their time.', icon: '📜' },
  { id: 'ws-2', name: 'Philosopher Stone', hall: 'Wisdom', rarity: 'Rare', desc: 'The legendary stone of transmutation', lore: 'Base knowledge transformed into gold.', icon: '🪨' },
  { id: 'ws-3', name: 'Wisdom Owl Statue', hall: 'Wisdom', rarity: 'Common', desc: 'The eternal symbol of wisdom', lore: 'Its marble eyes see all truths.', icon: '🦉' },
  { id: 'ws-4', name: 'Book of Secrets', hall: 'Wisdom', rarity: 'Uncommon', desc: 'A book containing answers to great mysteries', lore: 'Some pages glow with hidden texts.', icon: '📕' },
  { id: 'ws-5', name: 'Crystal Ball', hall: 'Wisdom', rarity: 'Uncommon', desc: 'A scrying tool that reveals hidden truths', lore: 'The mists within show what will be.', icon: '🔮' },
  { id: 'ws-6', name: 'Sage Staff', hall: 'Wisdom', rarity: 'Rare', desc: 'Carried by the wisest scholars', lore: 'Each ring on the staff is a year of study.', icon: '🪄' },
  { id: 'ws-7', name: 'Infinity Equation', hall: 'Wisdom', rarity: 'Epic', desc: 'A mathematical proof of infinite wisdom', lore: 'The equation that explains everything.', icon: '♾️' },
  { id: 'ws-8', name: 'Mind Prism', hall: 'Wisdom', rarity: 'Legendary', desc: 'A prism that splits a single thought into its components', lore: 'Every idea refracted into pure understanding.', icon: '💎' },
  { id: 'ws-9', name: 'Puzzle Cube', hall: 'Wisdom', rarity: 'Common', desc: 'A complex puzzle solved with intellect', lore: 'Millions of configurations, one solution.', icon: '🧩' },
  { id: 'ws-10', name: 'Memory Vault Key', hall: 'Wisdom', rarity: 'Uncommon', desc: 'Unlocks the vault of perfect memory', lore: 'Every moment preserved in crystalline clarity.', icon: '🔑' },
  { id: 'ws-11', name: 'Rune Tablet', hall: 'Wisdom', rarity: 'Rare', desc: 'Ancient runes containing primal knowledge', lore: 'The language before language.', icon: '🪨' },
  { id: 'ws-12', name: 'Oracle Mirror', hall: 'Wisdom', rarity: 'Epic', desc: 'A mirror that shows the question behind the reflection', lore: 'To look is to question.', icon: '🪞' },
  { id: 'ws-13', name: 'Cosmic Library Card', hall: 'Wisdom', rarity: 'Legendary', desc: 'Access to the library of the universe', lore: 'Every book ever written, and many yet to be.', icon: '📚' },

  // ── Combat Hall (13) ──
  { id: 'cb-1', name: 'Warrior Shield', hall: 'Combat', rarity: 'Common', desc: 'A shield that has deflected a thousand blows', lore: 'Its surface tells the story of survival.', icon: '🛡️' },
  { id: 'cb-2', name: 'Battle Axe', hall: 'Combat', rarity: 'Uncommon', desc: 'An axe that carved through obstacles', lore: 'Sharp enough to cleave doubt itself.', icon: '🪓' },
  { id: 'cb-3', name: 'Knight Plaque', hall: 'Combat', rarity: 'Common', desc: 'Honors courage in the face of danger', lore: 'Courage is not the absence of fear.', icon: '🎖️' },
  { id: 'cb-4', name: 'Dragon Scale Armor', hall: 'Combat', rarity: 'Rare', desc: 'Armor forged from dragon scales', lore: 'Impervious to all but the most powerful attacks.', icon: '🐉' },
  { id: 'cb-5', name: 'Sword of Resolve', hall: 'Combat', rarity: 'Uncommon', desc: 'A sword that grows stronger with determination', lore: 'The sharper your will, the sharper the blade.', icon: '⚔️' },
  { id: 'cb-6', name: 'War Banner', hall: 'Combat', rarity: 'Common', desc: 'A banner that rallied troops to victory', lore: 'Under this flag, none fell.', icon: '🚩' },
  { id: 'cb-7', name: 'Combat Medal of Valor', hall: 'Combat', rarity: 'Rare', desc: 'Awarded for extraordinary bravery in battle', lore: 'Given to those who stood when others fled.', icon: '🏅' },
  { id: 'cb-8', name: 'Excalibur Replica', hall: 'Combat', rarity: 'Epic', desc: 'A replica of the legendary sword', lore: 'Worthy hands alone may grasp it.', icon: '🗡️' },
  { id: 'cb-9', name: 'Siege Tower Model', hall: 'Combat', rarity: 'Uncommon', desc: 'A model of the tower that conquered the fortress', lore: 'Engineering meets warfare.', icon: '🏰' },
  { id: 'cb-10', name: 'Phantom Blade', hall: 'Combat', rarity: 'Epic', desc: 'A blade that strikes from the shadows', lore: 'Its wounds do not bleed but drain will.', icon: '🗡️' },
  { id: 'cb-11', name: 'War Drum', hall: 'Combat', rarity: 'Common', desc: 'The drum that rallied the warriors', lore: 'Its beat still echoes in the hearts of the brave.', icon: '🥁' },
  { id: 'cb-12', name: 'Legendary Warhorse Statue', hall: 'Combat', rarity: 'Rare', desc: 'A statue of the horse that carried heroes', lore: 'It never tired, never faltered.', icon: '🐴' },
  { id: 'cb-13', name: 'Godslayer Spear', hall: 'Combat', rarity: 'Legendary', desc: 'A spear that pierced the heavens themselves', lore: 'Forged in the death of a star.', icon: '🔱' },

  // ── Collection Hall (12) ──
  { id: 'cl-1', name: 'Gem Collection', hall: 'Collection', rarity: 'Common', desc: 'A curated set of precious stones', lore: 'Each gem a different hue of beauty.', icon: '💠' },
  { id: 'cl-2', name: 'Rare Stamp Album', hall: 'Collection', rarity: 'Common', desc: 'Stamps from a hundred nations', lore: 'Tiny windows into distant lands.', icon: '📮' },
  { id: 'cl-3', name: 'Antique Vase', hall: 'Collection', rarity: 'Uncommon', desc: 'A vase from an ancient civilization', lore: 'Its patterns tell stories of a forgotten people.', icon: '🏺' },
  { id: 'cl-4', name: 'Coin Collection', hall: 'Collection', rarity: 'Common', desc: 'Coins spanning a thousand years', lore: 'Currency of empires long fallen.', icon: '🪙' },
  { id: 'cl-5', name: 'Mythical Creature Figurine', hall: 'Collection', rarity: 'Rare', desc: 'A figurine of a creature from legend', lore: 'Is it a model, or a memory?', icon: '🦄' },
  { id: 'cl-6', name: 'Star Chart', hall: 'Collection', rarity: 'Uncommon', desc: 'A hand-drawn map of the constellations', lore: 'Each dot a sun, each line a story.', icon: '🌟' },
  { id: 'cl-7', name: 'Artifact Display Case', hall: 'Collection', rarity: 'Rare', desc: 'A case holding fragments of ancient power', lore: 'The glass hums with contained energy.', icon: '🗄️' },
  { id: 'cl-8', name: 'Enchanted Music Box', hall: 'Collection', rarity: 'Epic', desc: 'Plays melodies that enchant the listener', lore: 'The melody changes based on who listens.', icon: '🎵' },
  { id: 'cl-9', name: 'Rare Mineral Specimen', hall: 'Collection', rarity: 'Common', desc: 'A mineral sample from deep underground', lore: 'Formed under pressures we cannot imagine.', icon: '🪨' },
  { id: 'cl-10', name: 'Celestial Globe', hall: 'Collection', rarity: 'Epic', desc: 'A globe that shows the heavens in motion', lore: 'Stars orbit at the touch of a finger.', icon: '🌍' },
  { id: 'cl-11', name: 'Phoenix Feather Collection', hall: 'Collection', rarity: 'Legendary', desc: 'Feathers from multiple phoenix resurrections', lore: 'Each feather from a different rebirth.', icon: '🪶' },
  { id: 'cl-12', name: 'Infinity Puzzle Box', hall: 'Collection', rarity: 'Legendary', desc: 'A puzzle box with infinite solutions', lore: 'Opening it reveals a new puzzle inside.', icon: '📦' },

  // ── Social Hall (12) ──
  { id: 'so-1', name: 'Friendship Bracelet', hall: 'Social', rarity: 'Common', desc: 'A token of lasting friendship', lore: 'Woven with threads of trust.', icon: '🪢' },
  { id: 'so-2', name: 'Team Photo', hall: 'Social', rarity: 'Common', desc: 'A photo capturing the perfect team moment', lore: 'Every face tells a story of cooperation.', icon: '📸' },
  { id: 'so-3', name: 'Unity Crest', hall: 'Social', rarity: 'Uncommon', desc: 'A crest representing group harmony', lore: 'Many minds, one purpose.', icon: '🤝' },
  { id: 'so-4', name: 'Alliance Ring', hall: 'Social', rarity: 'Rare', desc: 'A ring that binds allies together', lore: 'When one falls, all feel the weight.', icon: '💍' },
  { id: 'so-5', name: 'Community Mural', hall: 'Social', rarity: 'Uncommon', desc: 'A mural painted by the entire community', lore: 'Every brushstroke from a different hand.', icon: '🎨' },
  { id: 'so-6', name: 'Message in a Bottle', hall: 'Social', rarity: 'Common', desc: 'A message that traveled across the world', lore: 'It arrived exactly when it was needed.', icon: '🍾' },
  { id: 'so-7', name: 'Guild Charter', hall: 'Social', rarity: 'Rare', desc: 'The founding document of your guild', lore: 'Signed in the ink of shared purpose.', icon: '📜' },
  { id: 'so-8', name: 'Harmony Lyre', hall: 'Social', rarity: 'Epic', desc: 'An instrument that plays when people work together', lore: 'The more who play, the sweeter the song.', icon: '🎶' },
  { id: 'so-9', name: 'Pen Pal Letters', hall: 'Social', rarity: 'Common', desc: 'A collection of letters from distant friends', lore: 'Distance is no match for words.', icon: '✉️' },
  { id: 'so-10', name: 'Crowd Surf Board', hall: 'Social', rarity: 'Uncommon', desc: 'A board that carried you above the crowd', lore: 'The support of many lifts you highest.', icon: '🏄' },
  { id: 'so-11', name: 'Global Connections Map', hall: 'Social', rarity: 'Epic', desc: 'A map showing connections to people worldwide', lore: 'Lines of light crisscrossing the globe.', icon: '🗺️' },
  { id: 'so-12', name: 'Heart of the Community', hall: 'Social', rarity: 'Legendary', desc: 'The pulsing heart of everything we built together', lore: 'It beats for every person who contributed.', icon: '❤️' },

  // ── Exploration Hall (13) ──
  { id: 'ex-1', name: 'Compass Rose', hall: 'Exploration', rarity: 'Common', desc: 'A compass that always points to adventure', lore: 'Its needle is restless.', icon: '🧭' },
  { id: 'ex-2', name: 'Explorer Journal', hall: 'Exploration', rarity: 'Common', desc: 'A journal filled with discoveries', lore: 'Every page a new frontier.', icon: '📓' },
  { id: 'ex-3', name: 'Ancient Map Fragment', hall: 'Exploration', rarity: 'Uncommon', desc: 'A piece of a legendary treasure map', lore: 'Where does the trail lead?', icon: '🗺️' },
  { id: 'ex-4', name: 'Telescope', hall: 'Exploration', rarity: 'Rare', desc: 'A telescope that revealed unknown stars', lore: 'Through its lens, infinity unfolds.', icon: '🔭' },
  { id: 'ex-5', name: 'Expedition Flag', hall: 'Exploration', rarity: 'Common', desc: 'The flag planted at the summit', lore: 'It stood where none had stood before.', icon: '🚩' },
  { id: 'ex-6', name: 'Deep Sea Artifact', hall: 'Exploration', rarity: 'Uncommon', desc: 'An artifact from the ocean depths', lore: 'Pressure and darkness could not hide it forever.', icon: '🌊' },
  { id: 'ex-7', name: 'Lost City Relic', hall: 'Exploration', rarity: 'Rare', desc: 'A relic from a city lost to time', lore: 'It remembers what the world forgot.', icon: '🏛️' },
  { id: 'ex-8', name: 'Portal Keystone', hall: 'Exploration', rarity: 'Epic', desc: 'A stone that once opened doorways to other worlds', lore: 'The doorways remain, waiting to be reopened.', icon: '🚪' },
  { id: 'ex-9', name: 'Mountain Peak Crystal', hall: 'Exploration', rarity: 'Uncommon', desc: 'A crystal found at the highest peak', lore: 'Closer to the sky than anything else.', icon: '🏔️' },
  { id: 'ex-10', name: 'Cave Painting Reproduction', hall: 'Exploration', rarity: 'Common', desc: 'A reproduction of ancient cave art', lore: 'The oldest form of storytelling.', icon: '🎨' },
  { id: 'ex-11', name: 'Desert Rose', hall: 'Exploration', rarity: 'Rare', desc: 'A crystal formation from the deepest desert', lore: 'Beauty born from barrenness.', icon: '🌹' },
  { id: 'ex-12', name: 'Wormhole Generator Model', hall: 'Exploration', rarity: 'Epic', desc: 'A theoretical model for traversing spacetime', lore: 'One day, it will be real.', icon: '🌀' },
  { id: 'ex-13', name: 'Edge of the World Plaque', hall: 'Exploration', rarity: 'Legendary', desc: 'A plaque from the literal edge of the known world', lore: 'Beyond this point, everything is new.', icon: '🌐' },

  // ── Legends Hall (12) ──
  { id: 'lg-1', name: 'Hero Sword', hall: 'Legends', rarity: 'Common', desc: 'The sword of a legendary hero', lore: 'It chose its wielder.', icon: '⚔️' },
  { id: 'lg-2', name: 'Dragon Egg', hall: 'Legends', rarity: 'Rare', desc: 'An egg from the last great dragon', lore: 'It still pulses with warmth.', icon: '🥚' },
  { id: 'lg-3', name: 'Immortal Phoenix Feather', hall: 'Legends', rarity: 'Epic', desc: 'A feather from an immortal phoenix', lore: 'It glows with eternal fire.', icon: '🪶' },
  { id: 'lg-4', name: 'World Tree Seed', hall: 'Legends', rarity: 'Legendary', desc: 'A seed from the mythical World Tree', lore: 'If planted, it could grow to touch the stars.', icon: '🌱' },
  { id: 'lg-5', name: 'Mythril Crown', hall: 'Legends', rarity: 'Rare', desc: 'A crown forged from mythical metal', lore: 'Lighter than air and stronger than steel.', icon: '👑' },
  { id: 'lg-6', name: 'Holy Grail Replica', hall: 'Legends', rarity: 'Epic', desc: 'A replica of the most sought-after artifact', lore: 'Even a replica holds power.', icon: '🏆' },
  { id: 'lg-7', name: 'Kraken Tentacle', hall: 'Legends', rarity: 'Rare', desc: 'A preserved tentacle from the legendary kraken', lore: 'It still moves in moonlight.', icon: '🐙' },
  { id: 'lg-8', name: 'Atlantis Keystone', hall: 'Legends', rarity: 'Legendary', desc: 'The key to the lost city of Atlantis', lore: 'Beneath the waves, it awaits.', icon: '🔱' },
  { id: 'lg-9', name: 'Pandora Box Replica', hall: 'Legends', rarity: 'Epic', desc: 'A sealed replica of Pandora\'s box', lore: 'Do not open it. Whatever you do.', icon: '📦' },
  { id: 'lg-10', name: 'Medusa Shield', hall: 'Legends', rarity: 'Rare', desc: 'A shield with Medusa\'s gaze', lore: 'Those who meet its reflection turn to stone.', icon: '🛡️' },
  { id: 'lg-11', name: 'Excalibur Fragment', hall: 'Legends', rarity: 'Legendary', desc: 'A fragment of the legendary sword in the stone', lore: 'Even a piece holds kingly authority.', icon: '🗡️' },
  { id: 'lg-12', name: 'Philosopher Stone Replica', hall: 'Legends', rarity: 'Epic', desc: 'A replica of the legendary transmutation stone', lore: 'It turns not lead to gold, but knowledge to wisdom.', icon: '💎' },
]

const TOUR_DEFS: readonly {
  id: string; name: string; desc: string; hall: HallName; exhibitId: string; narration: string
}[] = [
  // Tour 1: Beginner's Walk
  { id: 't1', name: "Beginner's Walk", desc: 'A gentle introduction to the museum', hall: 'Glory', exhibitId: 'gl-1', narration: 'Welcome to the museum! Let us begin with your first victory.' },
  { id: 't2', name: "Beginner's Walk", desc: 'A gentle introduction to the museum', hall: 'Speed', exhibitId: 'sp-1', narration: 'Speed is not just about being fast. It is about being efficient.' },
  { id: 't3', name: "Beginner's Walk", desc: 'A gentle introduction to the museum', hall: 'Wisdom', exhibitId: 'ws-1', narration: 'Knowledge is the foundation upon which all great achievements are built.' },
  // Tour 2: Warrior's Path
  { id: 't4', name: "Warrior's Path", desc: 'Explore the combat exhibits', hall: 'Combat', exhibitId: 'cb-1', narration: 'In the Combat Hall, we honor the strength to overcome challenges.' },
  { id: 't5', name: "Warrior's Path", desc: 'Explore the combat exhibits', hall: 'Glory', exhibitId: 'gl-3', narration: 'The Champion Crown represents victory earned through determination.' },
  { id: 't6', name: "Warrior's Path", desc: 'Explore the combat exhibits', hall: 'Legends', exhibitId: 'lg-1', narration: 'The Hero Sword chose a worthy champion. Perhaps it chose you.' },
  // Tour 3: Scholar's Journey
  { id: 't7', name: "Scholar's Journey", desc: 'A tour of wisdom and knowledge', hall: 'Wisdom', exhibitId: 'ws-4', narration: 'The Book of Secrets contains answers to questions you have not yet asked.' },
  { id: 't8', name: "Scholar's Journey", desc: 'A tour of wisdom and knowledge', hall: 'Collection', exhibitId: 'cl-3', narration: 'This vase survived millennia. What will survive of our time?' },
  { id: 't9', name: "Scholar's Journey", desc: 'A tour of wisdom and knowledge', hall: 'Wisdom', exhibitId: 'ws-8', narration: 'The Mind Prism reveals the architecture of thought itself.' },
  // Tour 4: Explorer's Trail
  { id: 't10', name: "Explorer's Trail", desc: 'Discover the exploration exhibits', hall: 'Exploration', exhibitId: 'ex-1', narration: 'Every great journey begins with a single step in the right direction.' },
  { id: 't11', name: "Explorer's Trail", desc: 'Discover the exploration exhibits', hall: 'Exploration', exhibitId: 'ex-4', narration: 'The telescope revealed that the universe is far larger than imagined.' },
  { id: 't12', name: "Explorer's Trail", desc: 'Discover the exploration exhibits', hall: 'Exploration', exhibitId: 'ex-8', narration: 'The Portal Keystone once connected worlds. Now it connects memories.' },
  // Tour 5: Legends Tour
  { id: 't13', name: 'Legends Tour', desc: 'Visit the legendary exhibits', hall: 'Legends', exhibitId: 'lg-4', narration: 'The World Tree Seed contains the blueprint of all creation.' },
  { id: 't14', name: 'Legends Tour', desc: 'Visit the legendary exhibits', hall: 'Legends', exhibitId: 'lg-8', narration: 'Atlantis awaits beneath the waves, patient as the tides.' },
  { id: 't15', name: 'Legends Tour', desc: 'Visit the legendary exhibits', hall: 'Legends', exhibitId: 'lg-11', narration: 'Even a fragment of Excalibur carries the weight of destiny.' },
]

const SOUVENIR_DEFS: readonly { id: string; name: string; desc: string; price: number; icon: string; cat: string }[] = [
  { id: 's1', name: 'Museum Guidebook', desc: 'A comprehensive guide to all exhibits', price: 50, icon: '📕', cat: 'Books' },
  { id: 's2', name: 'Miniature Trophy', desc: 'A small golden trophy replica', price: 100, icon: '🏆', cat: 'Figurines' },
  { id: 's3', name: 'Exhibit Poster', desc: 'A poster featuring the Glory Hall', price: 75, icon: '🖼️', cat: 'Art' },
  { id: 's4', name: 'Crystal Paperweight', desc: 'A crystal paperweight from the shop', price: 150, icon: '💎', cat: 'Desk' },
  { id: 's5', name: 'Museum T-Shirt', desc: 'Official museum merchandise', price: 200, icon: '👕', cat: 'Apparel' },
  { id: 's6', name: 'Enchanted Bookmark', desc: 'A bookmark that glows softly', price: 60, icon: '🔖', cat: 'Books' },
  { id: 's7', name: 'Miniature Sword', desc: 'A tiny replica of the Hero Sword', price: 250, icon: '⚔️', cat: 'Figurines' },
  { id: 's8', name: 'Compass Pendant', desc: 'A compass necklace from the shop', price: 120, icon: '🧭', cat: 'Jewelry' },
  { id: 's9', name: 'Mythical Creature Plushie', desc: 'A soft dragon plush toy', price: 180, icon: '🐉', cat: 'Plushies' },
  { id: 's10', name: 'Star Map Print', desc: 'A beautiful star chart print', price: 90, icon: '🌟', cat: 'Art' },
  { id: 's11', name: 'Museum Mug', desc: 'Start your day with museum coffee', price: 70, icon: '☕', cat: 'Kitchen' },
  { id: 's12', name: 'Legendary Keychain', desc: 'A keychain with a tiny crown', price: 45, icon: '🔑', cat: 'Accessories' },
  { id: 's13', name: 'Hall of Fame Pin', desc: 'An enamel pin of the museum logo', price: 35, icon: '📌', cat: 'Accessories' },
  { id: 's14', name: 'Soundtrack CD', desc: 'The official museum ambient soundtrack', price: 100, icon: '💿', cat: 'Music' },
  { id: 's15', name: 'Puzzle Box', desc: 'A mechanical puzzle from the shop', price: 160, icon: '📦', cat: 'Puzzles' },
  { id: 's16', name: 'Phoenix Feather Pen', desc: 'Write with the elegance of legends', price: 200, icon: '🪶', cat: 'Desk' },
  { id: 's17', name: 'Museum Sticker Pack', desc: '10 stickers featuring exhibits', price: 30, icon: '🏷️', cat: 'Accessories' },
  { id: 's18', name: 'Crystal Snow Globe', desc: 'A snow globe showing the museum', price: 220, icon: '🔮', cat: 'Figurines' },
  { id: 's19', name: 'Explorer Backpack', desc: 'A durable backpack for adventures', price: 300, icon: '🎒', cat: 'Apparel' },
  { id: 's20', name: 'Golden Museum Coin', desc: 'A commemorative golden coin', price: 500, icon: '🪙', cat: 'Collectibles' },
]

const PHOTO_SPOT_DEFS: readonly { id: string; name: string; hall: HallName; desc: string; filter: string }[] = [
  { id: 'ps-1', name: 'Glory Arch', hall: 'Glory', desc: 'Stand beneath the arch of champions', filter: 'golden' },
  { id: 'ps-2', name: 'Crystal Reflection', hall: 'Speed', desc: 'Capture your reflection in the speed crystal', filter: 'blur-speed' },
  { id: 'ps-3', name: 'Wisdom Owl Perch', hall: 'Wisdom', desc: 'Sit beside the great owl statue', filter: 'vintage' },
  { id: 'ps-4', name: 'Combat Arena', hall: 'Combat', desc: 'Stand victorious in the mini arena', filter: 'dramatic' },
  { id: 'ps-5', name: 'Star Gazer Point', hall: 'Exploration', desc: 'Look through the telescope backdrop', filter: 'cosmic' },
  { id: 'ps-6', name: 'Legends Throne', hall: 'Legends', desc: 'Sit upon the throne of legends', filter: 'majestic' },
]

const AUDIO_NARRATION_DEFS: readonly { id: string; title: string; hall: HallName; dur: number; transcript: string }[] = [
  { id: 'an-1', title: 'Welcome to the Museum', hall: 'Glory', dur: 120, transcript: 'Welcome, visitor. This museum holds the memories of your greatest achievements.' },
  { id: 'an-2', title: 'The Glory Hall Story', hall: 'Glory', dur: 180, transcript: 'The Glory Hall was the first wing of the museum, established to honor great victories.' },
  { id: 'an-3', title: 'Speed Through the Ages', hall: 'Speed', dur: 150, transcript: 'Speed has always been prized. From footraces to digital sprints, the pursuit of velocity defines us.' },
  { id: 'an-4', title: 'The Pursuit of Wisdom', hall: 'Wisdom', dur: 200, transcript: 'Wisdom is not found but earned. Each exhibit here represents knowledge gained through effort.' },
  { id: 'an-5', title: 'Tales of Combat', hall: 'Combat', dur: 170, transcript: 'The Combat Hall honors not violence but the courage to face overwhelming challenges.' },
  { id: 'an-6', title: 'The Collector\'s Passion', hall: 'Collection', dur: 140, transcript: 'Collecting is a universal human drive. We gather, organize, and treasure.' },
  { id: 'an-7', title: 'Together We Stand', hall: 'Social', dur: 160, transcript: 'No achievement is truly solitary. The Social Hall celebrates the power of community.' },
  { id: 'an-8', title: 'Beyond the Horizon', hall: 'Exploration', dur: 190, transcript: 'The unknown calls to the brave. The Exploration Hall maps the journey into mystery.' },
  { id: 'an-9', title: 'Echoes of Legend', hall: 'Legends', dur: 210, transcript: 'Legends are not born, they are forged through extraordinary deeds and extraordinary perseverance.' },
  { id: 'an-10', title: 'The Architecture of Memory', hall: 'Glory', dur: 130, transcript: 'This museum itself is a monument. Its halls are designed to evoke the emotions of achievement.' },
  { id: 'an-11', title: 'Conservation and Care', hall: 'Collection', dur: 110, transcript: 'Every exhibit is carefully preserved. The care we give reflects the value we place on memory.' },
  { id: 'an-12', title: 'Your Legacy', hall: 'Legends', dur: 240, transcript: 'Your exhibits here tell the story of who you are. And the empty pedestals tell the story of who you could become.' },
]

const MSAchievement_DEFS: readonly { id: string; name: string; desc: string; icon: string }[] = [
  { id: 'ms-first-visit', name: 'First Visit', desc: 'Visit the museum for the first time', icon: '🏛️' },
  { id: 'ms-collect-10', name: 'Curator', desc: 'Collect 10 exhibits', icon: '🎨' },
  { id: 'ms-collect-50', name: 'Archivist', desc: 'Collect 50 exhibits', icon: '📚' },
  { id: 'ms-collect-100', name: 'Master Collector', desc: 'Collect all 102 exhibits', icon: '👑' },
  { id: 'ms-tour-complete', name: 'Tour Guide', desc: 'Complete a guided tour', icon: '🗺️' },
  { id: 'ms-all-tours', name: 'Museum Expert', desc: 'Complete all 5 tours', icon: '🎓' },
  { id: 'ms-souvenir-5', name: 'Shopaholic', desc: 'Buy 5 souvenirs', icon: '🛍️' },
  { id: 'ms-photo-all', name: 'Photographer', desc: 'Capture all 6 photo spots', icon: '📸' },
  { id: 'ms-level-5', name: 'Rising Star', desc: 'Reach museum level 5', icon: '⭐' },
  { id: 'ms-level-10', name: 'Museum Legend', desc: 'Reach museum level 10', icon: '🌟' },
  { id: 'ms-streak-7', name: 'Weekly Visitor', desc: 'Visit the museum 7 days in a row', icon: '📅' },
  { id: 'ms-all-halls', name: 'Hall Walker', desc: 'Visit all 8 exhibition halls', icon: '🚶' },
]

const LEVEL_THRESHOLDS: readonly number[] = [0, 50, 150, 300, 500, 800, 1200, 1700, 2300, 3000]

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

function buildExhibits(): Exhibit[] {
  return EXHIBIT_DEFS.map(e => ({
    id: e.id, name: e.name, hall: e.hall, rarity: e.rarity,
    description: e.desc, lore: e.lore, collected: false, collectedAt: null,
    pedestalColor: PEDESTAL_COLORS[e.rarity], icon: e.icon,
  }))
}

function buildHalls(exhibits: Exhibit[]): Hall[] {
  return HALL_DEFS.map(h => {
    const hallExhibits = exhibits.filter(e => e.hall === h.name)
    const collected = hallExhibits.filter(e => e.collected).length
    return {
      name: h.name, description: h.desc, icon: h.icon, themeColor: h.color,
      exhibits: hallExhibits, completion: hallExhibits.length > 0 ? Math.round((collected / hallExhibits.length) * 100) : 0,
      unlocked: h.unlockReq === '', unlockRequirement: h.unlockReq,
    }
  })
}

function buildTours(): Tour[] {
  const tourGroups: Record<string, typeof TOUR_DEFS[number][]> = {}
  for (const t of TOUR_DEFS) {
    if (!tourGroups[t.id]) tourGroups[t.id] = []
    tourGroups[t.id].push(t)
  }
  const tours: Tour[] = []
  const tourNames: Record<string, string> = {}
  const tourDescs: Record<string, string> = {}
  for (const t of TOUR_DEFS) {
    tourNames[t.id] = t.name
    tourDescs[t.id] = t.desc
  }
  for (const [id, stops] of Object.entries(tourGroups)) {
    tours.push({
      id,
      name: tourNames[id] || 'Unknown Tour',
      description: tourDescs[id] || '',
      stops: stops.map(s => ({ hall: s.hall, exhibitId: s.exhibitId, narration: s.narration, duration: 30 })),
      duration: stops.length * 30,
      completed: false,
      completedAt: null,
    })
  }
  return tours
}

function buildSouvenirs(): SouvenirItem[] {
  return SOUVENIR_DEFS.map(s => ({
    id: s.id, name: s.name, description: s.desc, price: s.price,
    icon: s.icon, category: s.cat, purchased: false,
  }))
}

function buildPhotoSpots(): PhotoSpot[] {
  return PHOTO_SPOT_DEFS.map(p => ({
    id: p.id, name: p.name, hall: p.hall, description: p.desc,
    captured: false, capturedAt: null, filter: p.filter,
  }))
}

function buildAudioNarrations(): AudioNarration[] {
  return AUDIO_NARRATION_DEFS.map(a => ({
    id: a.id, title: a.title, hall: a.hall, duration: a.dur,
    transcript: a.transcript, unlocked: false,
  }))
}

function buildAchievements(): MSAchievement[] {
  return MSAchievement_DEFS.map(a => ({ id: a.id, name: a.name, description: a.desc, icon: a.icon, unlocked: false, unlockedAt: null }))
}

function getFeaturedExhibit(exhibits: Exhibit[]): Exhibit | null {
  const rng = seededRandom('featured-' + getDateString())
  const available = exhibits.filter(e => e.collected)
  if (available.length === 0) return exhibits[0] || null
  return available[Math.floor(rng() * available.length)]
}

function calculateMuseumLevel(score: number): number {
  let level = 1
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (score >= LEVEL_THRESHOLDS[i]) level = i + 1
    else break
  }
  return level
}

function calculateMuseumScore(state: MSState): number {
  let score = 0
  score += state.totalExhibitsCollected * 10
  score += state.totalToursCompleted * 50
  score += state.totalPhotosTaken * 20
  score += state.totalSouvenirsBought * 5
  score += state.dailyStreak * 10
  score += state.achievements.filter(a => a.unlocked).length * 30
  return score
}

// ─── Module State ─────────────────────────────────────────────────────────────

let state: MSState | null = null

// ─── Init ─────────────────────────────────────────────────────────────────────

function createDefaultState(): MSState {
  const exhibits = buildExhibits()
  return {
    initialized: false,
    halls: buildHalls(exhibits),
    exhibits,
    tours: buildTours(),
    activeTour: null,
    tourProgress: 0,
    souvenirs: buildSouvenirs(),
    photoSpots: buildPhotoSpots(),
    audioNarrations: buildAudioNarrations(),
    achievements: buildAchievements(),
    museumCoins: 500,
    totalCoinsEarned: 500,
    museumLevel: 1,
    museumScore: 0,
    visitorHistory: [],
    todayVisit: null,
    totalExhibitsCollected: 0,
    totalToursCompleted: 0,
    totalPhotosTaken: 0,
    totalSouvenirsBought: 0,
    featuredExhibit: getFeaturedExhibit(exhibits),
    dailyStreak: 0,
  }
}

function ensureInit(): void {
  if (!state) state = createDefaultState()
}

// ─── Exported Functions ───────────────────────────────────────────────────────

export function msInit(): void {
  ensureInit()
  if (state && !state.initialized) {
    state.initialized = true
    updateHallUnlocks()
    state.museumScore = calculateMuseumScore(state)
    state.museumLevel = calculateMuseumLevel(state.museumScore)
  }
}

export function msGetState(): MSState {
  ensureInit()
  return state!
}

export function msResetState(): void {
  state = null
}

export function msGetOverviewCard() {
  ensureInit()
  if (!state) return getDefaultOverview()
  const s = state
  const totalExhibits = s.exhibits.length
  const collected = s.totalExhibitsCollected
  return {
    museumName: 'Achievement Museum',
    level: s.museumLevel,
    score: s.museumScore,
    exhibitsCollected: collected,
    exhibitsTotal: totalExhibits,
    completionPercent: totalExhibits > 0 ? Math.round((collected / totalExhibits) * 100) : 0,
    hallsUnlocked: s.halls.filter(h => h.unlocked).length,
    hallsTotal: s.halls.length,
    toursCompleted: s.totalToursCompleted,
    toursTotal: s.tours.length,
    coins: s.museumCoins,
    dailyStreak: s.dailyStreak,
    featuredExhibit: s.featuredExhibit ? { name: s.featuredExhibit.name, icon: s.featuredExhibit.icon, rarity: s.featuredExhibit.rarity } : null,
    recentActivity: s.visitorHistory.slice(0, 3).map(v => ({ date: v.date, exhibitsCollected: v.exhibitsCollected })),
  }
}

function getDefaultOverview() {
  return {
    museumName: 'Achievement Museum', level: 1, score: 0,
    exhibitsCollected: 0, exhibitsTotal: 102, completionPercent: 0,
    hallsUnlocked: 1, hallsTotal: 8, toursCompleted: 0, toursTotal: 5,
    coins: 500, dailyStreak: 0, featuredExhibit: null, recentActivity: [],
  }
}

export function msGetHalls(): Hall[] {
  ensureInit()
  if (!state) return buildHalls(buildExhibits())
  return state.halls
}

export function msGetHallExhibits(hallName: HallName): Exhibit[] {
  ensureInit()
  if (!state) return []
  return state.exhibits.filter(e => e.hall === hallName)
}

export function msGetHallCompletion(hallName: HallName): number {
  ensureInit()
  if (!state) return 0
  const hall = state.halls.find(h => h.name === hallName)
  return hall ? hall.completion : 0
}

export function msGetMuseumScore(): number {
  ensureInit()
  if (!state) return 0
  state.museumScore = calculateMuseumScore(state)
  return state.museumScore
}

export function msGetRecentExhibits(count: number): Exhibit[] {
  ensureInit()
  if (!state) return []
  return state.exhibits.filter(e => e.collected).sort((a, b) => {
    if (!a.collectedAt || !b.collectedAt) return 0
    return b.collectedAt.localeCompare(a.collectedAt)
  }).slice(0, count)
}

export function msCollectExhibit(exhibitId: string): boolean {
  ensureInit()
  if (!state) return false
  const exhibit = state.exhibits.find(e => e.id === exhibitId)
  if (!exhibit || exhibit.collected) return false
  exhibit.collected = true
  exhibit.collectedAt = new Date().toISOString()
  state.totalExhibitsCollected++
  state.museumCoins += getExhibitCoinReward(exhibit.rarity)
  state.totalCoinsEarned += getExhibitCoinReward(exhibit.rarity)
  updateHallUnlocks()
  updateHalls()
  state.museumScore = calculateMuseumScore(state)
  state.museumLevel = calculateMuseumLevel(state.museumScore)
  state.featuredExhibit = getFeaturedExhibit(state.exhibits)
  checkMSAchievements()
  return true
}

function getExhibitCoinReward(rarity: ExhibitRarity): number {
  switch (rarity) {
    case 'Common': return 5
    case 'Uncommon': return 10
    case 'Rare': return 25
    case 'Epic': return 50
    case 'Legendary': return 100
  }
}

function updateHallUnlocks(): void {
  if (!state) return
  const collected = state.totalExhibitsCollected
  for (const hall of state.halls) {
    if (hall.unlocked) continue
    const req = hall.unlockRequirement
    if (req.includes('5 exhibits') && collected >= 5) hall.unlocked = true
    if (req.includes('15 exhibits') && collected >= 15) hall.unlocked = true
    if (req.includes('30 exhibits') && collected >= 30) hall.unlocked = true
    if (req.includes('50 exhibits') && collected >= 50) hall.unlocked = true
    if (req.includes('65 exhibits') && collected >= 65) hall.unlocked = true
    if (req.includes('80 exhibits') && collected >= 80) hall.unlocked = true
    if (req.includes('95 exhibits') && collected >= 95) hall.unlocked = true
  }
}

function updateHalls(): void {
  if (!state) return
  for (const hall of state.halls) {
    const hallExhibits = state.exhibits.filter(e => e.hall === hall.name)
    const collected = hallExhibits.filter(e => e.collected).length
    hall.exhibits = hallExhibits
    hall.completion = hallExhibits.length > 0 ? Math.round((collected / hallExhibits.length) * 100) : 0
  }
}

export function msGetTours(): Tour[] {
  ensureInit()
  if (!state) return buildTours()
  return state.tours
}

export function msStartTour(tourId: string): boolean {
  ensureInit()
  if (!state) return false
  const tour = state.tours.find(t => t.id === tourId)
  if (!tour || tour.completed || state.activeTour) return false
  state.activeTour = tourId
  state.tourProgress = 0
  return true
}

export function msGetTourProgress(): { tourId: string | null; currentStop: number; totalStops: number; percent: number } {
  ensureInit()
  if (!state || !state.activeTour) return { tourId: null, currentStop: 0, totalStops: 0, percent: 0 }
  const tour = state.tours.find(t => t.id === state!.activeTour)
  if (!tour) return { tourId: null, currentStop: 0, totalStops: 0, percent: 0 }
  return {
    tourId: state.activeTour,
    currentStop: state.tourProgress,
    totalStops: tour.stops.length,
    percent: tour.stops.length > 0 ? Math.round((state.tourProgress / tour.stops.length) * 100) : 0,
  }
}

export function msCompleteTour(): boolean {
  ensureInit()
  if (!state || !state.activeTour) return false
  const tour = state.tours.find(t => t.id === state.activeTour)
  if (!tour) return false
  tour.completed = true
  tour.completedAt = new Date().toISOString()
  state.totalToursCompleted++
  state.museumCoins += 100
  state.totalCoinsEarned += 100
  state.activeTour = null
  state.tourProgress = 0
  state.museumScore = calculateMuseumScore(state)
  state.museumLevel = calculateMuseumLevel(state.museumScore)
  checkMSAchievements()
  return true
}

export function msRecordVisit(hallsVisited: HallName[], exhibitsCollected: number, timeSpent: number): void {
  ensureInit()
  if (!state) return
  const visit: VisitorRecord = {
    date: new Date().toISOString(),
    hallsVisited,
    exhibitsCollected,
    timeSpent,
  }
  state.visitorHistory.unshift(visit)
  if (state.visitorHistory.length > 100) state.visitorHistory = state.visitorHistory.slice(0, 100)
  state.todayVisit = visit
  state.dailyStreak++
  state.museumScore = calculateMuseumScore(state)
  state.museumLevel = calculateMuseumLevel(state.museumScore)
  checkMSAchievements()
}

export function msGetVisitStats(): { totalVisits: number; todayExhibits: number; todayTime: number; avgTime: number } {
  ensureInit()
  if (!state) return { totalVisits: 0, todayExhibits: 0, todayTime: 0, avgTime: 0 }
  const total = state.visitorHistory.length
  const today = state.todayVisit
  const totalTime = state.visitorHistory.reduce((sum, v) => sum + v.timeSpent, 0)
  return {
    totalVisits: total,
    todayExhibits: today ? today.exhibitsCollected : 0,
    todayTime: today ? today.timeSpent : 0,
    avgTime: total > 0 ? Math.round(totalTime / total) : 0,
  }
}

export function msGetSouvenirs(): SouvenirItem[] {
  ensureInit()
  if (!state) return buildSouvenirs()
  return state.souvenirs
}

export function msBuySouvenir(souvenirId: string): boolean {
  ensureInit()
  if (!state) return false
  const item = state.souvenirs.find(s => s.id === souvenirId)
  if (!item || item.purchased || state.museumCoins < item.price) return false
  state.museumCoins -= item.price
  item.purchased = true
  state.totalSouvenirsBought++
  state.museumScore = calculateMuseumScore(state)
  checkMSAchievements()
  return true
}

export function msGetMuseumCoins(): number {
  ensureInit()
  if (!state) return 500
  return state.museumCoins
}

export function msGetPhotoSpots(): PhotoSpot[] {
  ensureInit()
  if (!state) return buildPhotoSpots()
  return state.photoSpots
}

export function msCapturePhoto(spotId: string): boolean {
  ensureInit()
  if (!state) return false
  const spot = state.photoSpots.find(p => p.id === spotId)
  if (!spot || spot.captured) return false
  spot.captured = true
  spot.capturedAt = new Date().toISOString()
  state.totalPhotosTaken++
  state.museumCoins += 15
  state.totalCoinsEarned += 15
  state.museumScore = calculateMuseumScore(state)
  checkMSAchievements()
  return true
}

export function msGetPhotoGallery(): PhotoSpot[] {
  ensureInit()
  if (!state) return []
  return state.photoSpots.filter(p => p.captured)
}

export function msGetFeaturedExhibit(): Exhibit | null {
  ensureInit()
  if (!state) return null
  return state.featuredExhibit
}

export function msGetAudioGuide(hallName?: HallName): AudioNarration[] {
  ensureInit()
  if (!state) return buildAudioNarrations()
  let narrations = state.audioNarrations
  if (hallName) narrations = narrations.filter(a => a.hall === hallName)
  return narrations
}

export function msGetAchievements(): MSAchievement[] {
  ensureInit()
  if (!state) return buildAchievements()
  return state.achievements
}

export function msCheckAchievements(): void {
  ensureInit()
  if (!state) return
  checkMSAchievements()
}

function checkMSAchievements(): void {
  if (!state) return
  const s = state
  const check = (id: string, cond: boolean) => {
    const a = s.achievements.find(x => x.id === id)
    if (a && !a.unlocked && cond) { a.unlocked = true; a.unlockedAt = new Date().toISOString() }
  }
  check('ms-first-visit', s.visitorHistory.length >= 1)
  check('ms-collect-10', s.totalExhibitsCollected >= 10)
  check('ms-collect-50', s.totalExhibitsCollected >= 50)
  check('ms-collect-100', s.totalExhibitsCollected >= 102)
  check('ms-tour-complete', s.totalToursCompleted >= 1)
  check('ms-all-tours', s.totalToursCompleted >= 5)
  check('ms-souvenir-5', s.totalSouvenirsBought >= 5)
  check('ms-photo-all', state.photoSpots.filter(p => p.captured).length >= 6)
  check('ms-level-5', s.museumLevel >= 5)
  check('ms-level-10', s.museumLevel >= 10)
  check('ms-streak-7', s.dailyStreak >= 7)
  check('ms-all-halls', s.halls.filter(h => h.unlocked).length >= 8)
}

export function msGetMuseumLevel(): number {
  ensureInit()
  if (!state) return 1
  return state.museumLevel
}

export function msGetLevelCard(): { level: number; currentScore: number; nextLevelScore: number; progress: number; title: string } {
  ensureInit()
  if (!state) return { level: 1, currentScore: 0, nextLevelScore: 50, progress: 0, title: 'Novice Visitor' }
  const level = state.museumLevel
  const currentThreshold = LEVEL_THRESHOLDS[Math.min(level - 1, LEVEL_THRESHOLDS.length - 1)]
  const nextThreshold = level < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[level] : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] * 2
  const progress = nextThreshold > currentThreshold ? Math.round(((state.museumScore - currentThreshold) / (nextThreshold - currentThreshold)) * 100) : 100
  const titles = ['Novice Visitor', 'Curious Guest', 'Eager Explorer', 'Hall Wanderer', 'Knowledge Seeker', 'Exhibit Expert', 'Tour Connoisseur', 'Museum Authority', 'Master Curator', 'Living Legend']
  return {
    level,
    currentScore: state.museumScore,
    nextLevelScore: nextThreshold,
    progress: Math.min(100, Math.max(0, progress)),
    title: titles[Math.min(level - 1, titles.length - 1)],
  }
}

export function msGetHallCard(hallName: HallName): { name: string; icon: string; color: string; description: string; completion: number; unlocked: boolean; exhibitCount: number } {
  ensureInit()
  if (!state) return { name: hallName, icon: '🏛️', color: '#9ca3af', description: '', completion: 0, unlocked: false, exhibitCount: 0 }
  const hall = state.halls.find(h => h.name === hallName)
  if (!hall) return { name: hallName, icon: '🏛️', color: '#9ca3af', description: '', completion: 0, unlocked: false, exhibitCount: 0 }
  return {
    name: hall.name, icon: hall.icon, color: hall.themeColor,
    description: hall.description, completion: hall.completion,
    unlocked: hall.unlocked, exhibitCount: hall.exhibits.length,
  }
}

export function msGetExhibitCard(exhibitId: string): Exhibit | null {
  ensureInit()
  if (!state) return null
  return state.exhibits.find(e => e.id === exhibitId) || null
}

export function msGetExhibitGrid(hallName?: HallName): Exhibit[] {
  ensureInit()
  if (!state) return []
  let exhibits = state.exhibits
  if (hallName) exhibits = exhibits.filter(e => e.hall === hallName)
  return exhibits
}

export function msGetTourCard(tourId: string): Tour | null {
  ensureInit()
  if (!state) return null
  return state.tours.find(t => t.id === tourId) || null
}

export function msGetStatsGrid() {
  ensureInit()
  if (!state) return getDefaultStats()
  const s = state
  return {
    totalExhibitsCollected: s.totalExhibitsCollected,
    totalExhibits: s.exhibits.length,
    collectionPercent: Math.round((s.totalExhibitsCollected / s.exhibits.length) * 100),
    totalToursCompleted: s.totalToursCompleted,
    totalPhotosTaken: s.totalPhotosTaken,
    totalSouvenirsBought: s.totalSouvenirsBought,
    museumLevel: s.museumLevel,
    museumScore: s.museumScore,
    museumCoins: s.museumCoins,
    totalCoinsEarned: s.totalCoinsEarned,
    dailyStreak: s.dailyStreak,
    achievementsUnlocked: s.achievements.filter(a => a.unlocked).length,
    achievementsTotal: s.achievements.length,
    hallsUnlocked: s.halls.filter(h => h.unlocked).length,
    hallsTotal: s.halls.length,
  }
}

function getDefaultStats() {
  return {
    totalExhibitsCollected: 0, totalExhibits: 102, collectionPercent: 0,
    totalToursCompleted: 0, totalPhotosTaken: 0, totalSouvenirsBought: 0,
    museumLevel: 1, museumScore: 0, museumCoins: 500, totalCoinsEarned: 500,
    dailyStreak: 0, achievementsUnlocked: 0, achievementsTotal: 12,
    hallsUnlocked: 1, hallsTotal: 8,
  }
}

export function msGetShopCard() {
  ensureInit()
  if (!state) return { coins: 500, items: buildSouvenirs(), categories: ['Books', 'Figurines', 'Art', 'Desk', 'Apparel', 'Jewelry', 'Plushies', 'Music', 'Puzzles', 'Accessories', 'Kitchen', 'Collectibles'] }
  const categories = [...new Set(state.souvenirs.map(s => s.category))]
  return {
    coins: state.museumCoins,
    items: state.souvenirs,
    categories,
    totalItems: state.souvenirs.length,
    purchasedCount: state.souvenirs.filter(s => s.purchased).length,
  }
}

export function msGetPhotoSpotCard(spotId: string): PhotoSpot | null {
  ensureInit()
  if (!state) return null
  return state.photoSpots.find(p => p.id === spotId) || null
}
