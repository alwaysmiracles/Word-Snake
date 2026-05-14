'use client'
import { useState, useCallback, useEffect, useRef, useMemo } from 'react'

// ────────────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────────────

const PL_MAX_LEVEL = 50

const PL_RARITY_COMMON = { name: 'Common', color: '#9CA3AF', weight: 50, xpMult: 1, icon: '📜' }
const PL_RARITY_UNCOMMON = { name: 'Uncommon', color: '#34D399', weight: 30, xpMult: 1.5, icon: '📖' }
const PL_RARITY_RARE = { name: 'Rare', color: '#60A5FA', weight: 14, xpMult: 2, icon: '📕' }
const PL_RARITY_EPIC = { name: 'Epic', color: '#A78BFA', weight: 5, xpMult: 3, icon: '📗' }
const PL_RARITY_LEGENDARY = { name: 'Legendary', color: '#FBBF24', weight: 1, xpMult: 5, icon: '⚠️' }

const PL_RARITIES = [
  PL_RARITY_COMMON,
  PL_RARITY_UNCOMMON,
  PL_RARITY_RARE,
  PL_RARITY_EPIC,
  PL_RARITY_LEGENDARY,
]

const PL_XP_TABLE: number[] = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,
  3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450,
  11500, 12600, 13750, 14950, 16200, 17500, 18850, 20250, 21700, 23200,
  24750, 26350, 28000, 29700, 31450, 33250, 35100, 37000, 38950, 40950,
  43000, 45100, 47250, 49450, 51700, 54000, 56350, 58750, 61200, 63700,
]

const PL_BASE_KNOWLEDGE = 50
const PL_KNOWLEDGE_PER_LEVEL = 10
const PL_BASE_FOCUS = 30
const PL_FOCUS_PER_LEVEL = 5
const PL_BASE_LUCK = 1
const PL_LUCK_PER_LEVEL = 0.3
const PL_BASE_COIN_FIND = 1
const PL_COIN_FIND_PER_LEVEL = 0.15
const PL_MAX_COINS = 9999999
const PL_MAX_INVENTORY = 50
const PL_BASE_XP_MULT = 1
const PL_SAVE_KEY = 'phantom-library-save'
const PL_AUTO_SAVE_INTERVAL_MS = 15000

// ────────────────────────────────────────────────────────────────
// TITLES (8)
// ────────────────────────────────────────────────────────────────

const PL_TITLES = [
  { id: 'lost_visitor', name: 'Lost Visitor', levelReq: 1, icon: '🚪', desc: 'A wanderer who stumbled into the Phantom Library' },
  { id: 'page_turner', name: 'Page Turner', levelReq: 5, icon: '📖', desc: 'Eagerly reading every book in sight' },
  { id: 'tome_seeker', name: 'Tome Seeker', levelReq: 10, icon: '📜', desc: 'Hunting for the rarest forbidden grimoires' },
  { id: 'spell_apprentice', name: 'Spell Apprentice', levelReq: 15, icon: '✨', desc: 'Beginning to decipher the ancient incantations' },
  { id: 'phantom_reader', name: 'Phantom Reader', levelReq: 25, icon: '👻', desc: 'The ghosts accept you as one of their own' },
  { id: 'warden_of_wings', name: 'Warden of Wings', levelReq: 35, icon: '🏛️', desc: 'Guardian of all eight library wings' },
  { id: 'archivist_eternal', name: 'Archivist Eternal', levelReq: 45, icon: '📚', desc: 'Keeper of knowledge that transcends death' },
  { id: 'grand_phantom_librarian', name: 'Grand Phantom Librarian', levelReq: 50, icon: '👑', desc: 'The supreme master of the Phantom Library' },
]

// ────────────────────────────────────────────────────────────────
// ACHIEVEMENTS (18)
// ────────────────────────────────────────────────────────────────

const PL_ACHIEVEMENTS = [
  { id: 'first_visit', name: 'First Visit', desc: 'Enter the Phantom Library for the first time', icon: '🚪', reward: { coins: 50, xp: 25 } },
  { id: 'first_tome', name: 'Bookworm Begins', desc: 'Collect your first enchanted tome', icon: '📖', reward: { coins: 100, xp: 50 } },
  { id: 'five_tomes', name: 'Shelf Scholar', desc: 'Collect 5 enchanted tomes', icon: '📚', reward: { coins: 300, xp: 150 } },
  { id: 'fifteen_tomes', name: 'Tome Collector', desc: 'Collect 15 enchanted tomes', icon: '📕', reward: { coins: 800, xp: 400 } },
  { id: 'thirty_tomes', name: 'Grand Bibliophile', desc: 'Collect all 30 enchanted tomes', icon: '🏅', reward: { coins: 5000, xp: 2000 } },
  { id: 'first_spell', name: 'Novice Incantor', desc: 'Decipher your first spell', icon: '✨', reward: { coins: 75, xp: 40 } },
  { id: 'ten_spells', name: 'Spell Weaver', desc: 'Decipher 10 spells', icon: '🔮', reward: { coins: 500, xp: 250 } },
  { id: 'all_spells', name: 'Master of Incantations', desc: 'Decipher all 22 spells', icon: '🌟', reward: { coins: 3000, xp: 1500 } },
  { id: 'first_ghost_friend', name: 'Spirit Acquaintance', desc: 'Befriend your first ghost librarian', icon: '👻', reward: { coins: 100, xp: 60 } },
  { id: 'five_ghost_friends', name: 'Ghost Council', desc: 'Befriend 5 ghost librarians', icon: '👥', reward: { coins: 1000, xp: 500 } },
  { id: 'ten_ghost_friends', name: 'Spectral Assembly', desc: 'Befriend 10 ghost librarians', icon: '🏳️', reward: { coins: 3000, xp: 1200 } },
  { id: 'unlock_all_wings', name: 'Wing Commander', desc: 'Unlock all 8 library wings', icon: '🏛️', reward: { coins: 5000, xp: 2000 } },
  { id: 'first_passage', name: 'Passage Finder', desc: 'Discover your first secret passage', icon: '🚪', reward: { coins: 200, xp: 100 } },
  { id: 'five_passages', name: 'Secret Keeper', desc: 'Discover 5 secret passages', icon: '🗝️', reward: { coins: 1500, xp: 600 } },
  { id: 'level_ten', name: 'Dedicated Reader', desc: 'Reach level 10', icon: '⭐', reward: { coins: 500, xp: 0 } },
  { id: 'level_twenty_five', name: 'Eminent Scholar', desc: 'Reach level 25', icon: '⭐', reward: { coins: 2000, xp: 0 } },
  { id: 'level_fifty', name: 'Immortal Librarian', desc: 'Reach level 50', icon: '🌟', reward: { coins: 10000, xp: 0 } },
  { id: 'hundred_readings', name: 'Midnight Devotee', desc: 'Complete 100 midnight readings', icon: '🌙', reward: { coins: 5000, xp: 1500 } },
]

// ────────────────────────────────────────────────────────────────
// LIBRARY WINGS (8)
// ────────────────────────────────────────────────────────────────

const PL_WINGS = [
  {
    id: 'entrance_hall',
    name: 'Entrance Hall',
    desc: 'A vast marble foyer with floating candles and whispering portraits. Ghostly ushers guide visitors deeper.',
    dangerLevel: 1,
    coinReward: [10, 30],
    xpReward: [15, 40],
    tomeChance: 0.25,
    ghostChance: 0.1,
    passageChance: 0.05,
    requiredLevel: 1,
    bgTint: '#374151',
  },
  {
    id: 'forbidden_section',
    name: 'Forbidden Section',
    desc: 'Books chained to shelves radiate dark energy. The air hums with suppressed incantations.',
    dangerLevel: 3,
    coinReward: [25, 70],
    xpReward: [40, 100],
    tomeChance: 0.35,
    ghostChance: 0.15,
    passageChance: 0.1,
    requiredLevel: 5,
    bgTint: '#4a1d1d',
  },
  {
    id: 'astronomy_tower',
    name: 'Astronomy Tower',
    desc: 'A spiraling tower open to the phantom night sky. Celestial maps float in the air.',
    dangerLevel: 2,
    coinReward: [20, 55],
    xpReward: [35, 85],
    tomeChance: 0.3,
    ghostChance: 0.12,
    passageChance: 0.08,
    requiredLevel: 8,
    bgTint: '#1e1b4b',
  },
  {
    id: 'alchemy_lab',
    name: 'Alchemy Lab',
    desc: 'Bubbling cauldrons and shelves of ingredients that occasionally explode into ghostly sparks.',
    dangerLevel: 4,
    coinReward: [30, 90],
    xpReward: [50, 130],
    tomeChance: 0.3,
    ghostChance: 0.18,
    passageChance: 0.08,
    requiredLevel: 12,
    bgTint: '#3f3f46',
  },
  {
    id: 'historical_archives',
    name: 'Historical Archives',
    desc: 'Endless rows of records from civilizations long dead. The ink still glistens wet on ancient scrolls.',
    dangerLevel: 3,
    coinReward: [25, 75],
    xpReward: [45, 110],
    tomeChance: 0.35,
    ghostChance: 0.15,
    passageChance: 0.1,
    requiredLevel: 18,
    bgTint: '#44403c',
  },
  {
    id: 'dark_arts_wing',
    name: 'Dark Arts Wing',
    desc: 'Shadows writhe on walls and books whisper forbidden secrets. Only the bravest dare enter.',
    dangerLevel: 6,
    coinReward: [50, 150],
    xpReward: [80, 200],
    tomeChance: 0.4,
    ghostChance: 0.25,
    passageChance: 0.12,
    requiredLevel: 25,
    bgTint: '#3b0764',
  },
  {
    id: 'music_chamber',
    name: 'Music Chamber',
    desc: 'Phantom instruments play hauntingly beautiful melodies. Sheet music drifts like snowfall.',
    dangerLevel: 2,
    coinReward: [20, 60],
    xpReward: [35, 90],
    tomeChance: 0.3,
    ghostChance: 0.2,
    passageChance: 0.06,
    requiredLevel: 15,
    bgTint: '#1e3a5f',
  },
  {
    id: 'void_reading_room',
    name: 'The Void Reading Room',
    desc: 'A room that exists outside spacetime. Books here contain knowledge of the beginning and end of everything.',
    dangerLevel: 8,
    coinReward: [100, 350],
    xpReward: [200, 500],
    tomeChance: 0.5,
    ghostChance: 0.3,
    passageChance: 0.15,
    requiredLevel: 38,
    bgTint: '#0f0f23',
  },
]

// ────────────────────────────────────────────────────────────────
// GHOSTLY ENTITIES (35, 5 rarity tiers)
// ────────────────────────────────────────────────────────────────

const PL_GHOSTS = [
  // Common (10)
  { id: 'phantom_page', name: 'Phantom Page', desc: 'A spectral assistant who reshelves books with invisible hands.', hostility: 0.05, coinReward: [5, 15], xpReward: [10, 25], befriendChance: 0.7, wing: 'entrance_hall' },
  { id: 'whispering_scholar', name: 'Whispering Scholar', desc: 'Murmurs forgotten facts from pages of long-lost encyclopedias.', hostility: 0.1, coinReward: [8, 20], xpReward: [12, 28], befriendChance: 0.6, wing: 'historical_archives' },
  { id: 'flickering_candle', name: 'Flickering Candle', desc: 'A candle flame spirit that illuminates dark corridors on command.', hostility: 0, coinReward: [3, 10], xpReward: [8, 18], befriendChance: 0.85, wing: 'entrance_hall' },
  { id: 'dusty_archivist', name: 'Dusty Archivist', desc: 'An elderly ghost sneezing spectral dust, obsessed with cataloging.', hostility: 0.08, coinReward: [6, 16], xpReward: [10, 22], befriendChance: 0.65, wing: 'historical_archives' },
  { id: 'echo_reader', name: 'Echo Reader', desc: 'A child spirit who reads books aloud, their voice echoing through halls.', hostility: 0.02, coinReward: [2, 8], xpReward: [5, 15], befriendChance: 0.9, wing: 'entrance_hall' },
  { id: 'spectral_mouse', name: 'Spectral Mouse', desc: 'A ghostly mouse that knows every shortcut and secret tunnel.', hostility: 0, coinReward: [3, 8], xpReward: [6, 14], befriendChance: 0.8, wing: 'alchemy_lab' },
  { id: 'ink_wraith', name: 'Ink Wraith', desc: 'A being made of spilled ink that crawls between book spines.', hostility: 0.15, coinReward: [5, 12], xpReward: [8, 20], befriendChance: 0.55, wing: 'forbidden_section' },
  { id: 'bookmark_spirit', name: 'Bookmark Spirit', desc: 'A thin ghostly ribbon that marks your place in any book.', hostility: 0, coinReward: [2, 6], xpReward: [5, 12], befriendChance: 0.95, wing: 'music_chamber' },
  { id: 'tome_keeper', name: 'Tome Keeper', desc: 'A stout ghost who guards the checkout counter, eternally stamping cards.', hostility: 0.05, coinReward: [8, 18], xpReward: [12, 24], befriendChance: 0.7, wing: 'entrance_hall' },
  { id: 'quill_phantom', name: 'Quill Phantom', desc: 'A floating quill that writes in the margins of library books.', hostility: 0.08, coinReward: [4, 10], xpReward: [7, 16], befriendChance: 0.75, wing: 'forbidden_section' },
  // Uncommon (10)
  { id: 'banshee_archivist', name: 'Banshee Archivist', desc: 'Her wail can shatter protective wards, but she guards priceless scrolls.', hostility: 0.25, coinReward: [15, 35], xpReward: [25, 55], befriendChance: 0.4, wing: 'forbidden_section' },
  { id: 'librarian_specter', name: 'Librarian Specter', desc: 'Shushes intruders with a deafening spectral SILENCE.', hostility: 0.2, coinReward: [12, 30], xpReward: [22, 48], befriendChance: 0.45, wing: 'historical_archives' },
  { id: 'scroll_shepherd', name: 'Scroll Shepherd', desc: 'Herds runaway scrolls back to their shelves using ghostly sheepdogs.', hostility: 0.1, coinReward: [10, 25], xpReward: [20, 42], befriendChance: 0.55, wing: 'historical_archives' },
  { id: 'alchemy_ghost', name: 'Alchemy Ghost', desc: 'A failed alchemist whose experiments still bubble centuries later.', hostility: 0.2, coinReward: [12, 28], xpReward: [20, 45], befriendChance: 0.4, wing: 'alchemy_lab' },
  { id: 'constellation_sage', name: 'Constellation Sage', desc: 'A ghost who reads the stars through the tower telescope for prophecies.', hostility: 0.15, coinReward: [10, 26], xpReward: [22, 48], befriendChance: 0.5, wing: 'astronomy_tower' },
  { id: 'phantom_conductor', name: 'Phantom Conductor', desc: 'Leads an orchestra of ghostly instruments in eternal concerts.', hostility: 0.08, coinReward: [12, 28], xpReward: [20, 45], befriendChance: 0.6, wing: 'music_chamber' },
  { id: 'rune_carver', name: 'Rune Carver', desc: 'Inscribes protective runes on the library walls, eternally working.', hostility: 0.18, coinReward: [14, 32], xpReward: [24, 50], befriendChance: 0.35, wing: 'forbidden_section' },
  { id: 'stargazer', name: 'Stargazer', desc: 'A dreamy spirit who floats near the telescope, lost in cosmic visions.', hostility: 0.05, coinReward: [10, 22], xpReward: [18, 40], befriendChance: 0.65, wing: 'astronomy_tower' },
  { id: 'potion_ghost', name: 'Potion Ghost', desc: 'A ghost trapped inside a potion bottle, speaking in bubbles.', hostility: 0.15, coinReward: [10, 24], xpReward: [18, 38], befriendChance: 0.5, wing: 'alchemy_lab' },
  { id: 'sheet_music_spirit', name: 'Sheet Music Spirit', desc: 'Pages of music that dance and sing on their own.', hostility: 0.08, coinReward: [8, 20], xpReward: [16, 35], befriendChance: 0.6, wing: 'music_chamber' },
  // Rare (8)
  { id: 'wraith_reader', name: 'Wraith Reader', desc: 'Reads books so intensely their spectral eyes burn with otherworldly fire.', hostility: 0.35, coinReward: [25, 60], xpReward: [50, 110], befriendChance: 0.25, wing: 'dark_arts_wing' },
  { id: 'forbidden_guardian', name: 'Forbidden Guardian', desc: 'A towering spirit that protects the most dangerous grimoires.', hostility: 0.5, coinReward: [30, 70], xpReward: [55, 120], befriendChance: 0.15, wing: 'forbidden_section' },
  { id: 'celestial_cartographer', name: 'Celestial Cartographer', desc: 'Maps the paths of dead stars onto spectral parchment.', hostility: 0.2, coinReward: [25, 55], xpReward: [45, 100], befriendChance: 0.3, wing: 'astronomy_tower' },
  { id: 'master_alchemist', name: 'Master Alchemist', desc: 'Their ghostly experiments occasionally produce real, miraculous results.', hostility: 0.25, coinReward: [28, 65], xpReward: [50, 110], befriendChance: 0.2, wing: 'alchemy_lab' },
  { id: 'void_scholar', name: 'Void Scholar', desc: 'Has read every book in existence and now exists in a state of pure knowledge.', hostility: 0.3, coinReward: [30, 70], xpReward: [55, 115], befriendChance: 0.2, wing: 'void_reading_room' },
  { id: 'phantom_composer', name: 'Phantom Composer', desc: 'Writes symphonies so beautiful they make the living weep.', hostility: 0.1, coinReward: [25, 55], xpReward: [45, 100], befriendChance: 0.35, wing: 'music_chamber' },
  { id: 'chronicle_wraith', name: 'Chronicle Wraith', desc: 'Records everything that happens in the library in an infinite ledger.', hostility: 0.3, coinReward: [28, 60], xpReward: [48, 105], befriendChance: 0.25, wing: 'historical_archives' },
  { id: 'ink_demon', name: 'Ink Demon', desc: 'A being of pure dark ink that absorbs knowledge from those it touches.', hostility: 0.55, coinReward: [30, 70], xpReward: [55, 120], befriendChance: 0.1, wing: 'dark_arts_wing' },
  // Epic (5)
  { id: 'grand_librarian', name: 'Grand Librarian', desc: 'The original phantom librarian who founded this impossible library.', hostility: 0.15, coinReward: [50, 120], xpReward: [120, 250], befriendChance: 0.1, wing: 'void_reading_room' },
  { id: 'void_walker', name: 'Void Walker', desc: 'A creature from beyond the pages that steps out of books into reality.', hostility: 0.5, coinReward: [55, 130], xpReward: [130, 270], befriendChance: 0.08, wing: 'void_reading_room' },
  { id: 'dark_sorcerer', name: 'Dark Sorcerer', desc: 'A legendary mage whose spirit is bound to the darkest grimoire.', hostility: 0.6, coinReward: [60, 140], xpReward: [140, 290], befriendChance: 0.06, wing: 'dark_arts_wing' },
  { id: 'astral_musician', name: 'Astral Musician', desc: 'Plays an instrument that exists across all dimensions simultaneously.', hostility: 0.2, coinReward: [50, 110], xpReward: [110, 240], befriendChance: 0.12, wing: 'music_chamber' },
  { id: 'time_archivist', name: 'Time Archivist', desc: 'Records history as it happens, existing in all moments at once.', hostility: 0.3, coinReward: [55, 125], xpReward: [125, 260], befriendChance: 0.1, wing: 'historical_archives' },
  // Legendary (2)
  { id: 'omniscient_phantom', name: 'Omniscient Phantom', desc: 'Knows every word ever written. Exists as pure consciousness within the library.', hostility: 0.4, coinReward: [100, 250], xpReward: [300, 600], befriendChance: 0.03, wing: 'void_reading_room' },
  { id: 'library_itself', name: 'The Library Itself', desc: 'The building is alive. Its walls breathe, its shelves rearrange, its heart beats with knowledge.', hostility: 0.5, coinReward: [150, 400], xpReward: [500, 1000], befriendChance: 0.01, wing: 'void_reading_room' },
]

// ────────────────────────────────────────────────────────────────
// ENCHANTED TOMES (30)
// ────────────────────────────────────────────────────────────────

const PL_TOMES = [
  { id: 'whispering_bestiary', name: 'The Whispering Bestiary', desc: 'Illustrations of magical creatures that move and sometimes escape the pages.', rarity: 'common' as const, knowledgeXp: 15, wing: 'entrance_hall' },
  { id: 'basic_spellbook', name: 'Beginner\'s Spell Primer', desc: 'A well-worn primer with basic illumination and levitation charms.', rarity: 'common' as const, knowledgeXp: 12, wing: 'entrance_hall' },
  { id: 'star_chart_compendium', name: 'Star Chart Compendium', desc: 'Contains hand-drawn maps of constellations visible only from the Astronomy Tower.', rarity: 'common' as const, knowledgeXp: 14, wing: 'astronomy_tower' },
  { id: 'potion_basics', name: 'Potion Fundamentals', desc: 'A practical guide to brewing basic elixirs and tinctures.', rarity: 'common' as const, knowledgeXp: 12, wing: 'alchemy_lab' },
  { id: 'history_of_magic', name: 'A History of Magic', desc: 'A thick volume chronicling the rise and fall of magical civilizations.', rarity: 'common' as const, knowledgeXp: 16, wing: 'historical_archives' },
  { id: 'music_theory', name: 'Phantom Music Theory', desc: 'Teaches how to play instruments using spectral resonance.', rarity: 'common' as const, knowledgeXp: 10, wing: 'music_chamber' },
  { id: 'fairy_tales', name: 'The Forbidden Fairy Tales', desc: 'Stories so old they predate language itself.', rarity: 'common' as const, knowledgeXp: 11, wing: 'forbidden_section' },
  { id: 'herbal_manual', name: 'Ghost Gardener\'s Herbal', desc: 'A guide to plants that grow only in haunted soil.', rarity: 'common' as const, knowledgeXp: 13, wing: 'alchemy_lab' },
  { id: 'rune_dictionary', name: 'Dictionary of Ancient Runes', desc: 'Translates thousands of rune systems from forgotten languages.', rarity: 'uncommon' as const, knowledgeXp: 30, wing: 'forbidden_section' },
  { id: 'alchemy_advancement', name: 'Advanced Alchemical Theory', desc: 'Explores transmutation, element synthesis, and philosopher\'s stone creation.', rarity: 'uncommon' as const, knowledgeXp: 35, wing: 'alchemy_lab' },
  { id: 'astral_navigation', name: 'Astral Navigation Manual', desc: 'How to navigate the space between stars using only a telescope and willpower.', rarity: 'uncommon' as const, knowledgeXp: 32, wing: 'astronomy_tower' },
  { id: 'ghost_protocol', name: 'Ghost Communication Protocol', desc: 'Teaches techniques for speaking with spirits and interpreting their messages.', rarity: 'uncommon' as const, knowledgeXp: 28, wing: 'forbidden_section' },
  { id: 'lost_civilizations', name: 'Lost Civilizations Archive', desc: 'Records of ten empires that vanished without a trace.', rarity: 'uncommon' as const, knowledgeXp: 38, wing: 'historical_archives' },
  { id: 'symphonic_magic', name: 'Symphonic Magic Compendium', desc: 'Spells that require musical instruments to cast.', rarity: 'uncommon' as const, knowledgeXp: 30, wing: 'music_chamber' },
  { id: 'dream_journal', name: 'A Phantom\'s Dream Journal', desc: 'The recorded dreams of a ghost, revealing secrets of the afterlife.', rarity: 'uncommon' as const, knowledgeXp: 25, wing: 'forbidden_section' },
  { id: 'constellation_spells', name: 'Constellation Spellbook', desc: 'Spells powered by the alignment of specific star formations.', rarity: 'uncommon' as const, knowledgeXp: 34, wing: 'astronomy_tower' },
  { id: 'dark_rituals', name: 'Tome of Dark Rituals', desc: 'Dangerous summoning circles and binding incantations.', rarity: 'rare' as const, knowledgeXp: 60, wing: 'dark_arts_wing' },
  { id: 'transmutation_grimoire', name: 'The Transmutation Grimoire', desc: 'Contains the formula for turning base metals into ghost silver.', rarity: 'rare' as const, knowledgeXp: 55, wing: 'alchemy_lab' },
  { id: 'prophecy_codex', name: 'Codex of Unfulfilled Prophecies', desc: 'Predictions that haven\'t come true yet — or have they?', rarity: 'rare' as const, knowledgeXp: 65, wing: 'astronomy_tower' },
  { id: 'forbidden_lore', name: 'Lore of the Forbidden', desc: 'Knowledge so dangerous it was erased from history. Except here.', rarity: 'rare' as const, knowledgeXp: 70, wing: 'forbidden_section' },
  { id: 'haunted_melodies', name: 'Haunted Melodies Collection', desc: 'Musical scores that play themselves when opened.', rarity: 'rare' as const, knowledgeXp: 50, wing: 'music_chamber' },
  { id: 'chronicle_of_ages', name: 'Chronicle of All Ages', desc: 'A single book containing the history of every era simultaneously.', rarity: 'rare' as const, knowledgeXp: 68, wing: 'historical_archives' },
  { id: 'necromantic_bible', name: 'The Necromantic Bible', desc: 'The definitive guide to communication with the dead and beyond.', rarity: 'epic' as const, knowledgeXp: 120, wing: 'dark_arts_wing' },
  { id: 'elixir_of_ages', name: 'Elixir of Ages Recipe', desc: 'A single recipe page that promises immortality to the worthy.', rarity: 'epic' as const, knowledgeXp: 130, wing: 'alchemy_lab' },
  { id: 'void_grimoire', name: 'Grimoire of the Void', desc: 'Spells that tap into the space between dimensions where the library exists.', rarity: 'epic' as const, knowledgeXp: 140, wing: 'void_reading_room' },
  { id: 'cosmic_symphony', name: 'The Cosmic Symphony', desc: 'The music of the spheres, transcribed into a playable score.', rarity: 'epic' as const, knowledgeXp: 110, wing: 'music_chamber' },
  { id: 'book_of_souls', name: 'The Book of Souls', desc: 'Contains the names and stories of every spirit in the library.', rarity: 'legendary' as const, knowledgeXp: 300, wing: 'void_reading_room' },
  { id: 'omniscient_lexicon', name: 'The Omniscient Lexicon', desc: 'Defines every word in every language, including those not yet invented.', rarity: 'legendary' as const, knowledgeXp: 350, wing: 'void_reading_room' },
  { id: ' genesis_tome', name: 'Tome of Genesis', desc: 'The first book ever written, containing the original language of creation.', rarity: 'legendary' as const, knowledgeXp: 400, wing: 'dark_arts_wing' },
  { id: 'infinite_page_book', name: 'The Infinite Page', desc: 'A book with no last page. Every time you turn it, a new chapter appears.', rarity: 'legendary' as const, knowledgeXp: 500, wing: 'void_reading_room' },
]

// ────────────────────────────────────────────────────────────────
// ROOMS AND CHAMBERS (25)
// ────────────────────────────────────────────────────────────────

const PL_ROOMS = [
  { id: 'main_lobby', name: 'Main Lobby', wing: 'entrance_hall', desc: 'A grand lobby with towering bookshelves and floating candles.', requiredLevel: 1 },
  { id: 'checkout_counter', name: 'Checkout Counter', wing: 'entrance_hall', desc: 'The phantom checkout desk where ghost librarians stamp spectral cards.', requiredLevel: 1 },
  { id: 'reading_nook', name: 'Cozy Reading Nook', wing: 'entrance_hall', desc: 'Overstuffed spectral armchairs near a ghostly fireplace.', requiredLevel: 1 },
  { id: 'map_room', name: 'Cartography Room', wing: 'astronomy_tower', desc: 'Walls covered in celestial maps that shift with the real sky.', requiredLevel: 8 },
  { id: 'observatory', name: 'The Observatory', wing: 'astronomy_tower', desc: 'A massive telescope pointed at constellations that don\'t exist in our sky.', requiredLevel: 10 },
  { id: 'star_chamber', name: 'Star Chamber', wing: 'astronomy_tower', desc: 'A domed room where projected stars swirl around you.', requiredLevel: 12 },
  { id: 'brewing_hall', name: 'Brewing Hall', wing: 'alchemy_lab', desc: 'Cauldrons bubble with luminescent concoctions on every surface.', requiredLevel: 12 },
  { id: 'ingredient_vault', name: 'Ingredient Vault', wing: 'alchemy_lab', desc: 'Shelves of jars containing rare spectral reagents.', requiredLevel: 14 },
  { id: 'transmutation_circle', name: 'Transmutation Circle', wing: 'alchemy_lab', desc: 'A massive circle on the floor that glows during experiments.', requiredLevel: 16 },
  { id: 'scroll_repository', name: 'Scroll Repository', wing: 'historical_archives', desc: 'Thousands of ancient scrolls stored in climate-controlled phantom cases.', requiredLevel: 18 },
  { id: 'chronicle_hall', name: 'Hall of Chronicles', wing: 'historical_archives', desc: 'Massive tomes documenting the history of forgotten civilizations.', requiredLevel: 20 },
  { id: 'artifact_museum', name: 'Artifact Museum', wing: 'historical_archives', desc: 'Display cases of magical artifacts that once belonged to legendary figures.', requiredLevel: 22 },
  { id: 'chained_shelves', name: 'The Chained Shelves', wing: 'forbidden_section', desc: 'Books chained to the walls, their covers glowing with warning runes.', requiredLevel: 5 },
  { id: 'incantation_chamber', name: 'Incantation Chamber', wing: 'forbidden_section', desc: 'A soundproof room where dangerous spells can be practiced safely.', requiredLevel: 8 },
  { id: 'warded_vault', name: 'Warded Vault', wing: 'forbidden_section', desc: 'Protected by seven layers of magical wards. The most dangerous texts reside here.', requiredLevel: 12 },
  { id: 'shadow_stacks', name: 'Shadow Stacks', wing: 'dark_arts_wing', desc: 'A section so dark the books themselves emit faint light to be read.', requiredLevel: 25 },
  { id: 'sacrifice_altar', name: 'Reading Altar', wing: 'dark_arts_wing', desc: 'A stone altar where dark tomes can be safely opened and studied.', requiredLevel: 28 },
  { id: 'soul_library', name: 'Library of Souls', wing: 'dark_arts_wing', desc: 'Books that contain the captured life stories of their authors.', requiredLevel: 32 },
  { id: 'concert_hall', name: 'Phantom Concert Hall', wing: 'music_chamber', desc: 'A grand auditorium where ghostly orchestras perform nightly.', requiredLevel: 15 },
  { id: 'practice_rooms', name: 'Soundproof Practice Rooms', wing: 'music_chamber', desc: 'Individual rooms where spectral musicians rehearse endlessly.', requiredLevel: 17 },
  { id: 'music_archive', name: 'Musical Score Archive', wing: 'music_chamber', desc: 'Every musical composition ever written, organized by spectral musicologists.', requiredLevel: 20 },
  { id: 'infinity_corridor', name: 'Corridor of Infinity', wing: 'void_reading_room', desc: 'A hallway that extends infinitely in both directions.', requiredLevel: 38 },
  { id: 'nowhere_study', name: 'The Nowhere Study', wing: 'void_reading_room', desc: 'A private study room that exists outside of space and time.', requiredLevel: 42 },
  { id: 'endless_archive', name: 'The Endless Archive', wing: 'void_reading_room', desc: 'Shelves that go on forever, containing books from every possible reality.', requiredLevel: 46 },
  { id: 'genesis_room', name: 'Room of Genesis', wing: 'void_reading_room', desc: 'Where the first book was written. The source of all knowledge.', requiredLevel: 50 },
]

// ────────────────────────────────────────────────────────────────
// SPELLS AND INCANTATIONS (22)
// ────────────────────────────────────────────────────────────────

const PL_SPELLS = [
  { id: 'lumos_minima', name: 'Lumos Minima', desc: 'Creates a small ghostly light to read by.', rarity: 'common' as const, focusCost: 5, knowledgeReq: 0, xpReward: 15, wing: 'entrance_hall' },
  { id: 'whisper_wind', name: 'Whisper Wind', desc: 'Summons a breeze that turns pages automatically.', rarity: 'common' as const, focusCost: 8, knowledgeReq: 0, xpReward: 12, wing: 'entrance_hall' },
  { id: 'silence_aura', name: 'Silence Aura', desc: 'Creates a zone of perfect silence for concentrated reading.', rarity: 'common' as const, focusCost: 10, knowledgeReq: 50, xpReward: 18, wing: 'music_chamber' },
  { id: 'ghost_sight', name: 'Ghost Sight', desc: 'Allows you to see invisible spectral text and hidden messages.', rarity: 'common' as const, focusCost: 12, knowledgeReq: 30, xpReward: 16, wing: 'forbidden_section' },
  { id: 'book_recall', name: 'Book Recall', desc: 'Instantly summons a specific book to your hands from anywhere in the library.', rarity: 'uncommon' as const, focusCost: 20, knowledgeReq: 100, xpReward: 30, wing: 'entrance_hall' },
  { id: 'decipher_script', name: 'Decipher Script', desc: 'Translates any written language into your native tongue.', rarity: 'uncommon' as const, focusCost: 25, knowledgeReq: 120, xpReward: 35, wing: 'historical_archives' },
  { id: 'starlight_arrow', name: 'Starlight Arrow', desc: 'Fires a bolt of concentrated starlight. Useful for warding off hostile spirits.', rarity: 'uncommon' as const, focusCost: 30, knowledgeReq: 150, xpReward: 40, wing: 'astronomy_tower' },
  { id: 'elixir_brew', name: 'Elixir Brew', desc: 'Instantly brews a basic knowledge-enhancing potion.', rarity: 'uncommon' as const, focusCost: 25, knowledgeReq: 130, xpReward: 35, wing: 'alchemy_lab' },
  { id: 'ghost_shield', name: 'Phantom Shield', desc: 'Surrounds you with a protective barrier of spectral energy.', rarity: 'uncommon' as const, focusCost: 20, knowledgeReq: 100, xpReward: 28, wing: 'forbidden_section' },
  { id: 'temporal_page', name: 'Temporal Page', desc: 'Shows you what a page looked like when it was first written.', rarity: 'uncommon' as const, focusCost: 30, knowledgeReq: 140, xpReward: 38, wing: 'historical_archives' },
  { id: 'constellation_bind', name: 'Constellation Binding', desc: 'Locks a book using the power of star alignments.', rarity: 'rare' as const, focusCost: 45, knowledgeReq: 250, xpReward: 60, wing: 'astronomy_tower' },
  { id: 'transmute_ink', name: 'Transmute Ink', desc: 'Changes the color and properties of magical ink for advanced spellwork.', rarity: 'rare' as const, focusCost: 40, knowledgeReq: 220, xpReward: 55, wing: 'alchemy_lab' },
  { id: 'soul_read', name: 'Soul Read', desc: 'Reads the emotional imprint left on a book by its previous readers.', rarity: 'rare' as const, focusCost: 50, knowledgeReq: 280, xpReward: 65, wing: 'forbidden_section' },
  { id: 'time_freeze', name: 'Chrono Freeze', desc: 'Freezes time in a small area, letting you read undisturbed.', rarity: 'rare' as const, focusCost: 55, knowledgeReq: 300, xpReward: 70, wing: 'historical_archives' },
  { id: 'dark_vision', name: 'Dark Vision', desc: 'See perfectly in absolute darkness. Essential for the Dark Arts Wing.', rarity: 'rare' as const, focusCost: 40, knowledgeReq: 240, xpReward: 55, wing: 'dark_arts_wing' },
  { id: 'resonance_spell', name: 'Resonance', desc: 'Creates harmonic vibrations that unlock sealed magical containers.', rarity: 'rare' as const, focusCost: 45, knowledgeReq: 260, xpReward: 58, wing: 'music_chamber' },
  { id: 'void_walk', name: 'Void Walk', desc: 'Step through the spaces between pages to teleport short distances.', rarity: 'epic' as const, focusCost: 70, knowledgeReq: 500, xpReward: 120, wing: 'void_reading_room' },
  { id: 'bibliomancy', name: 'Bibliomancy', desc: 'Opens a random page in any book and reveals prophetic meaning.', rarity: 'epic' as const, focusCost: 80, knowledgeReq: 550, xpReward: 130, wing: 'void_reading_room' },
  { id: 'spectral_army', name: 'Spectral Army', desc: 'Summons ghostly scholars to assist in a massive research effort.', rarity: 'epic' as const, focusCost: 90, knowledgeReq: 600, xpReward: 140, wing: 'dark_arts_wing' },
  { id: 'reality_rewrite', name: 'Reality Rewrite', desc: 'Temporarily alters reality by rewriting text in a book of creation.', rarity: 'legendary' as const, focusCost: 150, knowledgeReq: 1000, xpReward: 300, wing: 'void_reading_room' },
  { id: 'omniscience', name: 'Omniscience', desc: 'Briefly know everything contained in every book simultaneously.', rarity: 'legendary' as const, focusCost: 200, knowledgeReq: 1200, xpReward: 400, wing: 'void_reading_room' },
  { id: 'genesis_incantation', name: 'Genesis Incantation', desc: 'The spell that created the library itself. Incredibly dangerous to cast.', rarity: 'legendary' as const, focusCost: 250, knowledgeReq: 1500, xpReward: 500, wing: 'void_reading_room' },
]

// ────────────────────────────────────────────────────────────────
// SECRET PASSAGES (built into rooms)
// ────────────────────────────────────────────────────────────────

const PL_PASSAGES = [
  { id: 'behind_fireplace', name: 'Behind the Fireplace', from: 'reading_nook', to: 'chained_shelves', desc: 'A hidden passage concealed behind the spectral flames.', requiredLevel: 3 },
  { id: 'under_checkout', name: 'Under the Counter', from: 'checkout_counter', to: 'scroll_repository', desc: 'A trapdoor beneath the checkout desk leads to the archives.', requiredLevel: 10 },
  { id: 'observatory_ladder', name: 'Observatory Ladder', from: 'observatory', to: 'star_chamber', desc: 'A retractable ladder in the observatory ceiling.', requiredLevel: 12 },
  { id: 'potion_cellar', name: 'Potion Cellar Stairs', from: 'brewing_hall', to: 'ingredient_vault', desc: 'A spiral staircase behind a cauldron shelf.', requiredLevel: 14 },
  { id: 'chronicle_tunnel', name: 'Chronicle Tunnel', from: 'chronicle_hall', to: 'artifact_museum', desc: 'A tunnel dug by previous librarians between archive rooms.', requiredLevel: 22 },
  { id: 'mirror_passage', name: 'Mirror Passage', from: 'shadow_stacks', to: 'soul_library', desc: 'Step through a mirror to reach the Library of Souls.', requiredLevel: 30 },
  { id: 'music_box_door', name: 'Music Box Door', from: 'practice_rooms', to: 'concert_hall', desc: 'Playing the right melody on the ghostly piano opens a hidden door.', requiredLevel: 18 },
  { id: 'void_rift', name: 'The Void Rift', from: 'infinity_corridor', to: 'genesis_room', desc: 'A crack in reality leading directly to the Room of Genesis.', requiredLevel: 48 },
]

// ────────────────────────────────────────────────────────────────
// HAUNTED BOOK EVENTS
// ────────────────────────────────────────────────────────────────

const PL_HAUNTED_EVENTS = [
  { id: 'flying_books', name: 'Flying Books', desc: 'Books launch off shelves and swirl around the room!', type: 'chaos' as const, coinReward: [5, 15], xpReward: [10, 25] },
  { id: 'ink_flood', name: 'Ink Flood', desc: 'Spectral ink spills from nowhere, revealing hidden text on the floor.', type: 'discovery' as const, coinReward: [10, 25], xpReward: [20, 40] },
  { id: 'ghost_reading', name: 'Ghost Reading Circle', desc: 'Several ghosts gather and read aloud. Listening grants wisdom.', type: 'wisdom' as const, coinReward: [0, 5], xpReward: [30, 60] },
  { id: 'book_scream', name: 'Screaming Tome', desc: 'A forbidden book screams when opened. Nearby ghosts flee in terror.', type: 'chaos' as const, coinReward: [5, 10], xpReward: [15, 30] },
  { id: 'self_writing', name: 'Self-Writing Book', desc: 'A book writes itself in real-time, documenting events happening elsewhere.', type: 'discovery' as const, coinReward: [15, 30], xpReward: [25, 50] },
  { id: 'page_rain', name: 'Page Rain', desc: 'Torn pages rain from the ceiling, each containing a fragment of a spell.', type: 'discovery' as const, coinReward: [10, 20], xpReward: [20, 40] },
  { id: 'phantom_lecture', name: 'Phantom Lecture', desc: 'A ghost professor delivers a lecture on an obscure magical topic.', type: 'wisdom' as const, coinReward: [0, 10], xpReward: [40, 70] },
  { id: 'book_curse', name: 'Book Curse', desc: 'A cursed book briefly drains your focus but reveals a dark secret.', type: 'danger' as const, coinReward: [20, 40], xpReward: [35, 60], focusCost: 15 },
  { id: 'library_quake', name: 'Library Quake', desc: 'The shelves shake violently, dislodging hidden items from behind books.', type: 'chaos' as const, coinReward: [15, 35], xpReward: [25, 45] },
  { id: 'spectral_fireplace', name: 'Spectral Fireplace', desc: 'The ghostly fire roars to life, warming your spirit and restoring focus.', type: 'wisdom' as const, coinReward: [0, 5], xpReward: [10, 20], focusRestore: 20 },
]

// ────────────────────────────────────────────────────────────────
// LIBRARY LORE ENTRIES
// ────────────────────────────────────────────────────────────────

const PL_LORE_ENTRIES = [
  { id: 'founding', name: 'The Founding', desc: 'In the year 1247, a dying sorcerer named Mordecai Void cast his final spell, transforming his personal collection into an eternal library that exists between worlds.', wing: 'entrance_hall', requiredLevel: 1, icon: '📜' },
  { id: 'great_fire', name: 'The Great Spectral Fire', desc: 'In 1389, a careless apprentice accidentally summoned a fire elemental that burned three wings. The ghosts rebuilt the library in a single night.', wing: 'entrance_hall', requiredLevel: 3, icon: '🔥' },
  { id: 'librarian_war', name: 'The Librarian War', desc: 'For a century, two rival phantom librarians competed for the title of Head Librarian, each reorganizing the shelves to spite the other.', wing: 'historical_archives', requiredLevel: 8, icon: '⚔️' },
  { id: 'void_incident', name: 'The Void Incident', desc: 'In 1567, someone opened the Tome of Genesis without proper preparation. A fragment of pure void energy escaped and created the Void Reading Room.', wing: 'void_reading_room', requiredLevel: 38, icon: '🕳️' },
  { id: 'music_curse', name: 'The Music Curse', desc: 'A composer enchanted every instrument in the Music Chamber to play endlessly. Only those who truly appreciate music can silence them.', wing: 'music_chamber', requiredLevel: 15, icon: '🎵' },
  { id: 'alchemy_disaster', name: 'The Alchemical Disaster', desc: 'An experiment to create the Philosopher\'s Stone instead created a sentient potion that now roams the Alchemy Lab, occasionally helping visitors.', wing: 'alchemy_lab', requiredLevel: 12, icon: '⚗️' },
  { id: 'star_collision', name: 'The Star Collision', desc: 'A meteorite crashed through the Astronomy Tower roof, carrying with it star-matter that now powers the telescope with otherworldly energy.', wing: 'astronomy_tower', requiredLevel: 10, icon: '☄️' },
  { id: 'forbidden_locking', name: 'The Great Locking', desc: 'When the Forbidden Section grew too dangerous, seven archmages sealed it with chains that can only be broken by those deemed worthy by the books themselves.', wing: 'forbidden_section', requiredLevel: 5, icon: '🔒' },
  { id: 'dark_arts_origin', name: 'Origin of the Dark Arts', desc: 'The Dark Arts Wing was not built — it manifested one night from the collective fears of every librarian who had ever worked here.', wing: 'dark_arts_wing', requiredLevel: 25, icon: '🌑' },
  { id: 'final_prophecy', name: 'The Final Prophecy', desc: 'Hidden in the Genesis Room is a prophecy: when the last page of the Infinite Page is finally read, the library will reveal its true purpose.', wing: 'void_reading_room', requiredLevel: 50, icon: '👁️' },
]

// ────────────────────────────────────────────────────────────────
// RESEARCH QUESTS (10)
// ────────────────────────────────────────────────────────────────

const PL_RESEARCH_QUESTS = [
  { id: 'rq_catalog_lost', name: 'Catalog the Lost', desc: 'Locate and catalog five tomes that have been missing for centuries.', requiredLevel: 3, targets: 5, coinReward: 200, xpReward: 100, wing: 'entrance_hall', icon: '📋' },
  { id: 'rq_star_mapping', name: 'Star Mapping', desc: 'Map three new constellations visible only through the tower telescope.', requiredLevel: 8, targets: 3, coinReward: 350, xpReward: 180, wing: 'astronomy_tower', icon: '🔭' },
  { id: 'rq_alchemical_formula', name: 'Perfect the Formula', desc: 'Successfully brew five different potions in the Alchemy Lab.', requiredLevel: 12, targets: 5, coinReward: 400, xpReward: 200, wing: 'alchemy_lab', icon: '🧪' },
  { id: 'rq_history_restoration', name: 'Restore History', desc: 'Decipher ten ancient scrolls from the Historical Archives.', requiredLevel: 18, targets: 10, coinReward: 600, xpReward: 350, wing: 'historical_archives', icon: '📜' },
  { id: 'rq_music_mastery', name: 'Musical Mastery', desc: 'Learn to play all seven phantom instruments in the Music Chamber.', requiredLevel: 15, targets: 7, coinReward: 500, xpReward: 280, wing: 'music_chamber', icon: '🎹' },
  { id: 'rq_rune_decoding', name: 'Decode the Runes', desc: 'Decipher the meaning of the protective runes on the Forbidden Section chains.', requiredLevel: 8, targets: 1, coinReward: 300, xpReward: 150, wing: 'forbidden_section', icon: '🔮' },
  { id: 'rq_dark_countermeasure', name: 'Dark Countermeasures', desc: 'Develop three spells to counter the hostile entities of the Dark Arts Wing.', requiredLevel: 25, targets: 3, coinReward: 800, xpReward: 400, wing: 'dark_arts_wing', icon: '🛡️' },
  { id: 'rq_void_navigation', name: 'Navigate the Void', desc: 'Successfully traverse the Corridor of Infinity and return unharmed.', requiredLevel: 38, targets: 1, coinReward: 1500, xpReward: 800, wing: 'void_reading_room', icon: '🌀' },
  { id: 'rq_ghost_council', name: 'Convene the Council', desc: 'Befriend enough ghosts to hold a spectral council meeting.', requiredLevel: 20, targets: 5, coinReward: 700, xpReward: 350, wing: 'entrance_hall', icon: '👻' },
  { id: 'rq_genesis_riddle', name: 'The Genesis Riddle', desc: 'Solve the riddle hidden in the Room of Genesis.', requiredLevel: 50, targets: 1, coinReward: 5000, xpReward: 2500, wing: 'void_reading_room', icon: '🏆' },
]

// ────────────────────────────────────────────────────────────────
// LIBRARY SHOP ITEMS
// ────────────────────────────────────────────────────────────────

const PL_SHOP_ITEMS = [
  { id: 'focus_potion', name: 'Focus Potion', desc: 'Restores 30 focus points instantly.', cost: 50, focusRestore: 30, knowledgeBonus: 0, requiredLevel: 1, icon: '🧴' },
  { id: 'knowledge_elixir', name: 'Knowledge Elixir', desc: 'Permanently increases max knowledge by 10.', cost: 200, focusRestore: 0, knowledgeBonus: 10, requiredLevel: 5, icon: '⚗️' },
  { id: 'focus_tea', name: 'Phantom Tea', desc: 'A calming spectral tea that restores 50 focus.', cost: 100, focusRestore: 50, knowledgeBonus: 0, requiredLevel: 3, icon: '🍵' },
  { id: 'scholar_lens', name: 'Scholar\'s Lens', desc: 'Grants +5% XP multiplier for one session.', cost: 500, focusRestore: 0, knowledgeBonus: 0, xpMultBonus: 0.05, requiredLevel: 10, icon: '👓' },
  { id: 'ghost_whistle', name: 'Ghost Whistle', desc: 'Attracts a random ghost to your location.', cost: 150, focusRestore: 0, knowledgeBonus: 0, requiredLevel: 5, icon: '📯' },
  { id: 'enchanted_bookmark', name: 'Enchanted Bookmark', desc: 'Saves your place across any book, granting +2 knowledge per read.', cost: 300, focusRestore: 0, knowledgeBonus: 0, readBonus: 2, requiredLevel: 8, icon: '🔖' },
  { id: 'void_compass', name: 'Void Compass', desc: 'Helps locate secret passages in the current wing.', cost: 400, focusRestore: 0, knowledgeBonus: 0, passageReveal: true, requiredLevel: 15, icon: '🧭' },
  { id: 'master_key', name: 'Skeleton Key', desc: 'Unlocks one locked room without meeting the level requirement.', cost: 1000, focusRestore: 0, knowledgeBonus: 0, unlockRoom: true, requiredLevel: 20, icon: '🗝️' },
]

// ────────────────────────────────────────────────────────────────
// BOOKSHELF ENCOUNTER TYPES
// ────────────────────────────────────────────────────────────────

const PL_BOOKSHELF_EVENTS = [
  { id: 'bse_empty_scroll', name: 'Blank Scroll', desc: 'An empty scroll that writes itself when held near an enchanted tome.', type: 'discovery' as const, coinReward: [5, 15], xpReward: [10, 20] },
  { id: 'bse_dust_cough', name: 'Century Dust', desc: 'A cloud of ancient dust bursts from the shelf. Knowledge particles float within.', type: 'knowledge' as const, coinReward: [2, 5], xpReward: [15, 30], knowledgeGain: 10 },
  { id: 'bse_ghost_hand', name: 'Ghostly Hand', desc: 'A spectral hand reaches out and hands you a forgotten coin.', type: 'coins' as const, coinReward: [20, 50], xpReward: [5, 10] },
  { id: 'bse_page_tear', name: 'Torn Page', desc: 'A page from a powerful spellbook, torn and incomplete but still usable.', type: 'discovery' as const, coinReward: [10, 25], xpReward: [20, 40] },
  { id: 'bse_bookworm', name: 'Magical Bookworm', desc: 'A tiny glowing worm that has been eating knowledge for centuries. It offers you some.', type: 'knowledge' as const, coinReward: [0, 5], xpReward: [10, 20], knowledgeGain: 15 },
  { id: 'bse_sealed_envelope', name: 'Sealed Envelope', desc: 'An envelope sealed with phantom wax containing a mysterious message.', type: 'discovery' as const, coinReward: [5, 15], xpReward: [15, 30] },
  { id: 'bse_quill_set', name: 'Spectral Quill Set', desc: 'A set of ghostly writing instruments that enhance your deciphering ability.', type: 'discovery' as const, coinReward: [15, 30], xpReward: [25, 45] },
  { id: 'bse_spider_web', name: 'Phantom Spider Web', desc: 'Webs of spectral silk stretch between books. Behind them, something glints.', type: 'coins' as const, coinReward: [30, 60], xpReward: [10, 20] },
  { id: 'bse_crumbling_book', name: 'Crumbling Book', desc: 'A book disintegrates at your touch, but the last readable page contains wisdom.', type: 'knowledge' as const, coinReward: [0, 5], xpReward: [20, 35], knowledgeGain: 20 },
  { id: 'bse_shadow_figure', name: 'Shadow Behind Books', desc: 'A shadowy figure darts between shelves. It drops something as it flees.', type: 'chaos' as const, coinReward: [10, 25], xpReward: [15, 30] },
  { id: 'bse_floating_ink', name: 'Floating Ink Bottle', desc: 'A bottle of enchanted ink that hovers just above the shelf.', type: 'discovery' as const, coinReward: [10, 20], xpReward: [18, 35] },
  { id: 'bse_reading_light', name: 'Phantom Reading Light', desc: 'A spectral lamp materializes, illuminating a hidden inscription.', type: 'knowledge' as const, coinReward: [5, 10], xpReward: [25, 40], knowledgeGain: 12 },
]

// ────────────────────────────────────────────────────────────────
// GHOST FRIENDSHIP LEVELS
// ────────────────────────────────────────────────────────────────

const PL_FRIENDSHIP_LEVELS = [
  { level: 1, name: 'Stranger', icon: '❓', minAffinity: 0, bonus: 'None' },
  { level: 2, name: 'Acquaintance', icon: '👋', minAffinity: 10, bonus: '+5% coin find' },
  { level: 3, name: 'Familiar Face', icon: '🙂', minAffinity: 25, bonus: '+10% coin find' },
  { level: 4, name: 'Companion', icon: '🤝', minAffinity: 50, bonus: '+15% coin find, +10% XP' },
  { level: 5, name: 'Trusted Ally', icon: '💎', minAffinity: 75, bonus: '+20% coin find, +15% XP, +5 focus per read' },
]

// ────────────────────────────────────────────────────────────────
// READING MILESTONES
// ────────────────────────────────────────────────────────────────

const PL_READING_MILESTONES = [
  { id: 'rm_ten', name: 'Curious Reader', desc: 'Read 10 tomes.', target: 10, icon: '📖', xpReward: 50, coinReward: 100 },
  { id: 'rm_twenty_five', name: 'Avid Reader', desc: 'Read 25 tomes.', target: 25, icon: '📚', xpReward: 150, coinReward: 300 },
  { id: 'rm_fifty', name: 'Devoted Reader', desc: 'Read 50 tomes.', target: 50, icon: '📖', xpReward: 300, coinReward: 500 },
  { id: 'rm_hundred', name: 'Scholar Reader', desc: 'Read 100 tomes.', target: 100, icon: '📖', xpReward: 600, coinReward: 1000 },
  { id: 'rm_two_hundred', name: 'Eternal Reader', desc: 'Read 200 tomes.', target: 200, icon: '📖', xpReward: 1200, coinReward: 2500 },
  { id: 'rm_five_hundred', name: 'Omniscient Reader', desc: 'Read 500 tomes.', target: 500, icon: '📖', xpReward: 3000, coinReward: 5000 },
]

// ────────────────────────────────────────────────────────────────
// ENCHANTMENT TYPES FOR FOCUS RESTORATION
// ────────────────────────────────────────────────────────────────

const PL_ENCHANTMENT_TYPES = [
  { id: 'candle_light', name: 'Candle Light', desc: 'A gentle spectral glow that restores focus slowly over time.', focusPerTick: 2, cost: 0, requiredLevel: 1, icon: '🕯️' },
  { id: 'ghost_fireplace', name: 'Ghost Fireplace', desc: 'A roaring phantom fire that warms the soul and restores focus.', focusPerTick: 5, cost: 0, requiredLevel: 5, icon: '🔥' },
  { id: 'spirit_tea_set', name: 'Spirit Tea Set', desc: 'Phantom servants bring you enchanted tea at regular intervals.', focusPerTick: 8, cost: 100, requiredLevel: 10, icon: '🍵' },
  { id: 'focus_crystal', name: 'Focus Crystal', desc: 'A crystal that resonates with knowledge energy, continuously restoring focus.', focusPerTick: 12, cost: 500, requiredLevel: 20, icon: '💎' },
  { id: 'void_meditation', name: 'Void Meditation', desc: 'Meditate in the void between pages. Slowly restores all mental faculties.', focusPerTick: 20, cost: 1000, requiredLevel: 35, icon: '🌀' },
]

// ────────────────────────────────────────────────────────────────
// DAILY READING BONUS TABLE
// ────────────────────────────────────────────────────────────────

const PL_MIDNIGHT_BONUS_TABLE = [
  { minStreak: 1, coinBonus: 10, xpBonus: 20, focusBonus: 0 },
  { minStreak: 3, coinBonus: 25, xpBonus: 40, focusBonus: 5 },
  { minStreak: 5, coinBonus: 50, xpBonus: 70, focusBonus: 10 },
  { minStreak: 7, coinBonus: 100, xpBonus: 120, focusBonus: 15 },
  { minStreak: 14, coinBonus: 200, xpBonus: 250, focusBonus: 25 },
  { minStreak: 30, coinBonus: 500, xpBonus: 600, focusBonus: 50 },
  { minStreak: 60, coinBonus: 1000, xpBonus: 1200, focusBonus: 100 },
  { minStreak: 100, coinBonus: 2500, xpBonus: 3000, focusBonus: 200 },
]

// ────────────────────────────────────────────────────────────────
// LIBRARY CARD RUNE CONFIGURATION
// ────────────────────────────────────────────────────────────────

const PL_RUNE_SLOTS: PlRuneSlot[] = [
  { stat: 'knowledge' as PlStatType, value: 5, tier: 1 },
  { stat: 'focus' as PlStatType, value: 3, tier: 1 },
  { stat: 'coinFind' as PlStatType, value: 0.1, tier: 1 },
  { stat: 'luck' as PlStatType, value: 0.2, tier: 1 },
  { stat: 'xpMult' as PlStatType, value: 0.05, tier: 1 },
]

const PL_RUNE_UPGRADE_COSTS: Record<number, number> = {
  1: 0,
  2: 200,
  3: 800,
  4: 2500,
  5: 8000,
}

const PL_RUNE_VALUE_MULTIPLIERS: Record<number, number> = {
  1: 1,
  2: 1.5,
  3: 2.2,
  4: 3,
  5: 4.5,
}

const PL_RUNE_KNOWLEDGE_PER_LEVEL = 10
const PL_RUNE_FOCUS_PER_LEVEL = 5

// ────────────────────────────────────────────────────────────────
// STAT TYPES — used for rune slot upgrades on the library card
// ────────────────────────────────────────────────────────────────

export type PlStatType = 'knowledge' | 'focus' | 'coinFind' | 'luck' | 'xpMult'

export interface PlRuneSlot {
  stat: PlStatType
  value: number
  tier: number
}

// ────────────────────────────────────────────────────────────────
// STATE INTERFACE
// ────────────────────────────────────────────────────────────────

interface PlResearchProgress {
  questId: string
  currentProgress: number
  targetProgress: number
  completed: boolean
  rewardClaimed: boolean
}

interface PhantomLibraryState {
  level: number
  xp: number
  totalXp: number
  knowledge: number
  maxKnowledge: number
  focus: number
  maxFocus: number
  coins: number
  luck: number
  coinFind: number
  xpMult: number
  title: string
  currentWing: string | null
  currentRoom: string | null
  wingsUnlocked: string[]
  roomsDiscovered: string[]
  collectedTomes: string[]
  decipheredSpells: string[]
  ghostFriends: string[]
  ghostEncounters: string[]
  passagesDiscovered: string[]
  achievements: string[]
  loreDiscovered: string[]
  researchQuests: Record<string, PlResearchProgress>
  totalTomesCollected: number
  totalSpellsDeciphered: number
  totalGhostsBefriended: number
  totalGhostsEncountered: number
  totalPassagesFound: number
  totalCoinsEarned: number
  totalKnowledgeGained: number
  totalReadings: number
  totalExplorations: number
  totalMidnightReadings: number
  totalBookshelfSearches: number
  totalLoreDiscovered: number
  totalResearchCompleted: number
  dailyMidnightAvailable: boolean
  dailyMidnightLastDate: string
  midnightStreak: number
  isExploring: boolean
  hauntedEventActive: boolean
  hauntedEventId: string | null
  createdAt: number
  lastSaveAt: number
  log: string[]
}

// ────────────────────────────────────────────────────────────────
// DEFAULT STATE
// ────────────────────────────────────────────────────────────────

function plCreateDefaultState(): PhantomLibraryState {
  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    knowledge: PL_BASE_KNOWLEDGE,
    maxKnowledge: PL_BASE_KNOWLEDGE,
    focus: PL_BASE_FOCUS,
    maxFocus: PL_BASE_FOCUS,
    coins: 0,
    luck: PL_BASE_LUCK,
    coinFind: PL_BASE_COIN_FIND,
    xpMult: PL_BASE_XP_MULT,
    title: 'Lost Visitor',
    currentWing: null,
    currentRoom: null,
    wingsUnlocked: [],
    roomsDiscovered: [],
    collectedTomes: [],
    decipheredSpells: [],
    ghostFriends: [],
    ghostEncounters: [],
    passagesDiscovered: [],
    achievements: [],
    loreDiscovered: [],
    researchQuests: {},
    totalTomesCollected: 0,
    totalSpellsDeciphered: 0,
    totalGhostsBefriended: 0,
    totalGhostsEncountered: 0,
    totalPassagesFound: 0,
    totalCoinsEarned: 0,
    totalKnowledgeGained: 0,
    totalReadings: 0,
    totalExplorations: 0,
    totalMidnightReadings: 0,
    totalBookshelfSearches: 0,
    totalLoreDiscovered: 0,
    totalResearchCompleted: 0,
    dailyMidnightAvailable: true,
    dailyMidnightLastDate: '',
    midnightStreak: 0,
    isExploring: false,
    hauntedEventActive: false,
    hauntedEventId: null,
    createdAt: Date.now(),
    lastSaveAt: Date.now(),
    log: [],
  }
}

// ────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────

function plRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function plClamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function plPickRarity(): string {
  const totalWeight = PL_RARITIES.reduce((sum, r) => sum + r.weight, 0)
  let roll = Math.random() * totalWeight
  for (const rarity of PL_RARITIES) {
    roll -= rarity.weight
    if (roll <= 0) return rarity.name.toLowerCase()
  }
  return 'common'
}

function plGetRarityData(name: string) {
  const key = name.toLowerCase()
  return PL_RARITIES.find(r => r.name.toLowerCase() === key) ?? PL_RARITY_COMMON
}

function plGetDayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function plLoadState(): PhantomLibraryState {
  if (typeof window === 'undefined') return plCreateDefaultState()
  try {
    const raw = localStorage.getItem(PL_SAVE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PhantomLibraryState>
      const defaults = plCreateDefaultState()
      return { ...defaults, ...parsed }
    }
  } catch {
    // corrupted save
  }
  return plCreateDefaultState()
}

function plSaveState(state: PhantomLibraryState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PL_SAVE_KEY, JSON.stringify({ ...state, lastSaveAt: Date.now() }))
  } catch {
    // storage full
  }
}

// ────────────────────────────────────────────────────────────────
// THE HOOK
// ────────────────────────────────────────────────────────────────

export default function usePhantomLibrary() {
  const [state, setState] = useState<PhantomLibraryState>(plCreateDefaultState)
  const stateRef = useRef<PhantomLibraryState>(state)

  // Sync ref on every state change
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Hydrate from localStorage after mount
  useEffect(() => {
    const saved = plLoadState()
    setState(saved)
  }, [])

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      plSaveState(stateRef.current)
    }, PL_AUTO_SAVE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  // ── Simple getters ─────────────────────────────────────────

  const plGetLevel: () => number = () => state.level
  const plGetXp: () => number = () => state.xp
  const plGetTotalXp: () => number = () => state.totalXp
  const plGetKnowledge: () => number = () => state.knowledge
  const plGetMaxKnowledge: () => number = () => state.maxKnowledge
  const plGetFocus: () => number = () => state.focus
  const plGetMaxFocus: () => number = () => state.maxFocus
  const plGetCoins: () => number = () => state.coins
  const plGetLuck: () => number = () => state.luck
  const plGetCoinFind: () => number = () => state.coinFind
  const plGetXpMult: () => number = () => state.xpMult
  const plGetTitle: () => string = () => state.title
  const plGetCurrentWing: () => string | null = () => state.currentWing
  const plGetCurrentRoom: () => string | null = () => state.currentRoom
  const plGetWingsUnlocked: () => string[] = () => state.wingsUnlocked
  const plGetRoomsDiscovered: () => string[] = () => state.roomsDiscovered
  const plGetCollectedTomes: () => string[] = () => state.collectedTomes
  const plGetDecipheredSpells: () => string[] = () => state.decipheredSpells
  const plGetGhostFriends: () => string[] = () => state.ghostFriends
  const plGetGhostEncounters: () => string[] = () => state.ghostEncounters
  const plGetPassagesDiscovered: () => string[] = () => state.passagesDiscovered
  const plGetAchievements: () => string[] = () => state.achievements
  const plGetTotalTomesCollected: () => number = () => state.totalTomesCollected
  const plGetTotalSpellsDeciphered: () => number = () => state.totalSpellsDeciphered
  const plGetTotalGhostsBefriended: () => number = () => state.totalGhostsBefriended
  const plGetTotalGhostsEncountered: () => number = () => state.totalGhostsEncountered
  const plGetTotalPassagesFound: () => number = () => state.totalPassagesFound
  const plGetTotalCoinsEarned: () => number = () => state.totalCoinsEarned
  const plGetTotalKnowledgeGained: () => number = () => state.totalKnowledgeGained
  const plGetTotalReadings: () => number = () => state.totalReadings
  const plGetTotalExplorations: () => number = () => state.totalExplorations
  const plGetTotalMidnightReadings: () => number = () => state.totalMidnightReadings
  const plGetDailyMidnightAvailable: () => boolean = () => state.dailyMidnightAvailable
  const plGetMidnightStreak: () => number = () => state.midnightStreak
  const plGetIsExploring: () => boolean = () => state.isExploring
  const plGetHauntedEventActive: () => boolean = () => state.hauntedEventActive
  const plGetHauntedEventId: () => string | null = () => state.hauntedEventId
  const plGetLog: () => string[] = () => state.log
  const plGetState: () => PhantomLibraryState = () => state

  // ── XP & Leveling ─────────────────────────────────────────

  const plAddXp = useCallback((amount: number) => {
    const scaled = Math.floor(amount * stateRef.current.xpMult)
    setState(prev => {
      let newXp = prev.xp + scaled
      let newLevel = prev.level
      let newMaxKnowledge = prev.maxKnowledge
      let newMaxFocus = prev.maxFocus
      let newLuck = prev.luck
      let newCoinFind = prev.coinFind

      while (newLevel < PL_MAX_LEVEL && newXp >= PL_XP_TABLE[newLevel]) {
        newXp -= PL_XP_TABLE[newLevel]
        newLevel += 1
        newMaxKnowledge = PL_BASE_KNOWLEDGE + newLevel * PL_KNOWLEDGE_PER_LEVEL
        newMaxFocus = PL_BASE_FOCUS + newLevel * PL_FOCUS_PER_LEVEL
        newLuck = PL_BASE_LUCK + newLevel * PL_LUCK_PER_LEVEL
        newCoinFind = PL_BASE_COIN_FIND + newLevel * PL_COIN_FIND_PER_LEVEL
      }

      if (newLevel >= PL_MAX_LEVEL) {
        newXp = 0
      }

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        totalXp: prev.totalXp + scaled,
        maxKnowledge: newMaxKnowledge,
        maxFocus: newMaxFocus,
        luck: newLuck,
        coinFind: newCoinFind,
        knowledge: Math.min(prev.knowledge, newMaxKnowledge),
        focus: Math.min(prev.focus, newMaxFocus),
      }
    })
  }, [])

  const plGetXpForNextLevel: () => number = () => {
    if (state.level >= PL_MAX_LEVEL) return 0
    return PL_XP_TABLE[state.level]
  }

  const plGetXpProgress: () => number = () => {
    if (state.level >= PL_MAX_LEVEL) return 1
    return state.xp / PL_XP_TABLE[state.level]
  }

  // ── Knowledge & Focus ────────────────────────────────────

  const plAddKnowledge = useCallback((amount: number) => {
    setState(prev => {
      const gained = Math.min(amount, prev.maxKnowledge - prev.knowledge)
      return {
        ...prev,
        knowledge: plClamp(prev.knowledge + amount, 0, prev.maxKnowledge),
        totalKnowledgeGained: prev.totalKnowledgeGained + gained,
      }
    })
  }, [])

  const plUseFocus = useCallback((amount: number): boolean => {
    let success = false
    setState(prev => {
      if (prev.focus < amount) return prev
      success = true
      return { ...prev, focus: prev.focus - amount }
    })
    return success
  }, [])

  const plRestoreFocus = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      focus: plClamp(prev.focus + amount, 0, prev.maxFocus),
    }))
  }, [])

  const plFullRestoreFocus = useCallback(() => {
    setState(prev => ({
      ...prev,
      focus: prev.maxFocus,
    }))
  }, [])

  // ── Coins ───────────────────────────────────────────────

  const plAddCoins = useCallback((amount: number) => {
    setState(prev => {
      const scaled = Math.floor(amount * prev.coinFind)
      const newCoins = plClamp(prev.coins + scaled, 0, PL_MAX_COINS)
      return {
        ...prev,
        coins: newCoins,
        totalCoinsEarned: prev.totalCoinsEarned + scaled,
      }
    })
  }, [])

  const plSpendCoins = useCallback((amount: number): boolean => {
    let success = false
    setState(prev => {
      if (prev.coins < amount) return prev
      success = true
      return { ...prev, coins: prev.coins - amount }
    })
    return success
  }, [])

  // ── Wing System ─────────────────────────────────────────

  const plGetWingById = useCallback((id: string) => {
    return PL_WINGS.find(w => w.id === id) ?? null
  }, [])

  const plGetAccessibleWings: () => typeof PL_WINGS = () => {
    return PL_WINGS.filter(w => w.requiredLevel <= state.level)
  }

  const plUnlockWing = useCallback((wingId: string) => {
    setState(prev => {
      if (prev.wingsUnlocked.includes(wingId)) return prev
      const wing = PL_WINGS.find(w => w.id === wingId)
      if (!wing || prev.level < wing.requiredLevel) return prev
      return {
        ...prev,
        wingsUnlocked: [...prev.wingsUnlocked, wingId],
      }
    })
  }, [])

  const plEnterWing = useCallback((wingId: string) => {
    setState(prev => {
      const wing = PL_WINGS.find(w => w.id === wingId)
      if (!wing || prev.level < wing.requiredLevel) return prev
      const unlocked = prev.wingsUnlocked.includes(wingId)
        ? prev.wingsUnlocked
        : [...prev.wingsUnlocked, wingId]
      return {
        ...prev,
        currentWing: wingId,
        wingsUnlocked: unlocked,
      }
    })
  }, [])

  const plLeaveWing = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentWing: null,
      currentRoom: null,
      isExploring: false,
    }))
  }, [])

  // ── Room System ─────────────────────────────────────────

  const plGetRoomById = useCallback((id: string) => {
    return PL_ROOMS.find(r => r.id === id) ?? null
  }, [])

  const plGetAccessibleRooms: () => typeof PL_ROOMS = () => {
    return PL_ROOMS.filter(r => r.requiredLevel <= state.level)
  }

  const plGetRoomsInWing = useCallback((wingId: string) => {
    return PL_ROOMS.filter(r => r.wing === wingId)
  }, [])

  const plDiscoverRoom = useCallback((roomId: string) => {
    setState(prev => {
      if (prev.roomsDiscovered.includes(roomId)) return prev
      const room = PL_ROOMS.find(r => r.id === roomId)
      if (!room || prev.level < room.requiredLevel) return prev
      return {
        ...prev,
        roomsDiscovered: [...prev.roomsDiscovered, roomId],
      }
    })
  }, [])

  const plEnterRoom = useCallback((roomId: string) => {
    setState(prev => {
      const room = PL_ROOMS.find(r => r.id === roomId)
      if (!room || prev.level < room.requiredLevel) return prev
      const discovered = prev.roomsDiscovered.includes(roomId)
        ? prev.roomsDiscovered
        : [...prev.roomsDiscovered, roomId]
      return {
        ...prev,
        currentRoom: roomId,
        currentWing: room.wing,
        roomsDiscovered: discovered,
      }
    })
  }, [])

  const plLeaveRoom = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentRoom: null,
      isExploring: false,
    }))
  }, [])

  // ── Tome Collection ─────────────────────────────────────

  const plCollectTome = useCallback((tomeId: string) => {
    const tome = PL_TOMES.find(t => t.id === tomeId)
    if (!tome) return
    setState(prev => {
      if (prev.collectedTomes.includes(tomeId)) return prev
      const rarityData = plGetRarityData(tome.rarity)
      const knowledgeXp = Math.floor(tome.knowledgeXp * rarityData.xpMult)
      return {
        ...prev,
        collectedTomes: [...prev.collectedTomes, tomeId],
        totalTomesCollected: prev.totalTomesCollected + 1,
        knowledge: plClamp(prev.knowledge + knowledgeXp, 0, prev.maxKnowledge),
        totalKnowledgeGained: prev.totalKnowledgeGained + knowledgeXp,
      }
    })
  }, [])

  const plReadTome = useCallback((tomeId: string) => {
    const tome = PL_TOMES.find(t => t.id === tomeId)
    if (!tome) return
    setState(prev => {
      if (!prev.collectedTomes.includes(tomeId)) return prev
      const rarityData = plGetRarityData(tome.rarity)
      const xp = Math.floor(tome.knowledgeXp * rarityData.xpMult * 0.5)
      return {
        ...prev,
        totalReadings: prev.totalReadings + 1,
        knowledge: plClamp(prev.knowledge + xp, 0, prev.maxKnowledge),
        totalKnowledgeGained: prev.totalKnowledgeGained + xp,
      }
    })
  }, [])

  // ── Spell System ────────────────────────────────────────

  const plDecipherSpell = useCallback((spellId: string) => {
    const spell = PL_SPELLS.find(s => s.id === spellId)
    if (!spell) return
    setState(prev => {
      if (prev.decipheredSpells.includes(spellId)) return prev
      if (prev.knowledge < spell.knowledgeReq) return prev
      return {
        ...prev,
        decipheredSpells: [...prev.decipheredSpells, spellId],
        totalSpellsDeciphered: prev.totalSpellsDeciphered + 1,
      }
    })
  }, [])

  const plCastSpell = useCallback((spellId: string): boolean => {
    const spell = PL_SPELLS.find(s => s.id === spellId)
    if (!spell) return false
    let success = false
    setState(prev => {
      if (!prev.decipheredSpells.includes(spellId)) return prev
      if (prev.focus < spell.focusCost) return prev
      success = true
      const rarityData = plGetRarityData(spell.rarity)
      const xp = Math.floor(spell.xpReward * rarityData.xpMult)
      return {
        ...prev,
        focus: prev.focus - spell.focusCost,
        xp: prev.xp + xp,
        totalXp: prev.totalXp + xp,
      }
    })
    return success
  }, [])

  // ── Ghost System ────────────────────────────────────────

  const plGetGhostById = useCallback((id: string) => {
    return PL_GHOSTS.find(g => g.id === id) ?? null
  }, [])

  const plGetGhostsInWing = useCallback((wingId: string) => {
    return PL_GHOSTS.filter(g => g.wing === wingId)
  }, [])

  const plEncounterGhost = useCallback((ghostId: string) => {
    setState(prev => {
      if (prev.ghostEncounters.includes(ghostId)) return prev
      const ghost = PL_GHOSTS.find(g => g.id === ghostId)
      if (!ghost) return prev
      const coinReward = plRandomInt(ghost.coinReward[0], ghost.coinReward[1])
      const xpReward = plRandomInt(ghost.xpReward[0], ghost.xpReward[1])
      return {
        ...prev,
        ghostEncounters: [...prev.ghostEncounters, ghostId],
        totalGhostsEncountered: prev.totalGhostsEncountered + 1,
        coins: plClamp(prev.coins + coinReward, 0, PL_MAX_COINS),
        totalCoinsEarned: prev.totalCoinsEarned + coinReward,
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
      }
    })
  }, [])

  const plBefriendGhost = useCallback((ghostId: string): boolean => {
    const ghost = PL_GHOSTS.find(g => g.id === ghostId)
    if (!ghost) return false
    if (Math.random() > ghost.befriendChance) return false
    let success = false
    setState(prev => {
      if (prev.ghostFriends.includes(ghostId)) return prev
      if (!prev.ghostEncounters.includes(ghostId)) return prev
      success = true
      const coinReward = plRandomInt(ghost.coinReward[0], ghost.coinReward[1]) * 2
      const xpReward = plRandomInt(ghost.xpReward[0], ghost.xpReward[1]) * 2
      return {
        ...prev,
        ghostFriends: [...prev.ghostFriends, ghostId],
        totalGhostsBefriended: prev.totalGhostsBefriended + 1,
        coins: plClamp(prev.coins + coinReward, 0, PL_MAX_COINS),
        totalCoinsEarned: prev.totalCoinsEarned + coinReward,
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
      }
    })
    return success
  }, [])

  // ── Secret Passage System ───────────────────────────────

  const plDiscoverPassage = useCallback((passageId: string) => {
    const passage = PL_PASSAGES.find(p => p.id === passageId)
    if (!passage) return
    setState(prev => {
      if (prev.passagesDiscovered.includes(passageId)) return prev
      if (prev.level < passage.requiredLevel) return prev
      return {
        ...prev,
        passagesDiscovered: [...prev.passagesDiscovered, passageId],
        totalPassagesFound: prev.totalPassagesFound + 1,
        roomsDiscovered: prev.roomsDiscovered.includes(passage.to)
          ? prev.roomsDiscovered
          : [...prev.roomsDiscovered, passage.to],
        xp: prev.xp + 100,
        totalXp: prev.totalXp + 100,
      }
    })
  }, [])

  const plGetPassageById = useCallback((id: string) => {
    return PL_PASSAGES.find(p => p.id === id) ?? null
  }, [])

  const plGetPassagesFromRoom = useCallback((roomId: string) => {
    return PL_PASSAGES.filter(p => p.from === roomId)
  }, [])

  // ── Exploration ─────────────────────────────────────────

  const plExplore = useCallback(() => {
    if (stateRef.current.isExploring) return
    setState(prev => ({ ...prev, isExploring: true }))
    setTimeout(() => {
      setState(prev => {
        const wing = prev.currentWing ? PL_WINGS.find(w => w.id === prev.currentWing) : null
        if (!wing) return { ...prev, isExploring: false }
        const coinReward = plRandomInt(wing.coinReward[0], wing.coinReward[1])
        const xpReward = plRandomInt(wing.xpReward[0], wing.xpReward[1])
        return {
          ...prev,
          isExploring: false,
          coins: plClamp(prev.coins + coinReward, 0, PL_MAX_COINS),
          totalCoinsEarned: prev.totalCoinsEarned + coinReward,
          xp: prev.xp + xpReward,
          totalXp: prev.totalXp + xpReward,
          totalExplorations: prev.totalExplorations + 1,
        }
      })
    }, 1500)
  }, [])

  // ── Haunted Book Events ─────────────────────────────────

  const plTriggerHauntedEvent = useCallback((): { event: typeof PL_HAUNTED_EVENTS[number] | null; coins: number; xp: number; focusDelta: number } => {
    if (stateRef.current.hauntedEventActive) return { event: null, coins: 0, xp: 0, focusDelta: 0 }
    const event = PL_HAUNTED_EVENTS[Math.floor(Math.random() * PL_HAUNTED_EVENTS.length)]
    const coins = plRandomInt(event.coinReward[0], event.coinReward[1])
    const xp = plRandomInt(event.xpReward[0], event.xpReward[1])
    const focusDelta = ('focusCost' in event && event.focusCost) ? -event.focusCost : (('focusRestore' in event && event.focusRestore) ? event.focusRestore : 0)

    setState(prev => {
      if (prev.hauntedEventActive) return prev
      return {
        ...prev,
        hauntedEventActive: true,
        hauntedEventId: event.id,
        coins: plClamp(prev.coins + coins, 0, PL_MAX_COINS),
        totalCoinsEarned: prev.totalCoinsEarned + coins,
        xp: prev.xp + xp,
        totalXp: prev.totalXp + xp,
        focus: plClamp(prev.focus + focusDelta, 0, prev.maxFocus),
      }
    })

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        hauntedEventActive: false,
        hauntedEventId: null,
      }))
    }, 5000)

    return { event, coins, xp, focusDelta }
  }, [])

  const plClearHauntedEvent = useCallback(() => {
    setState(prev => ({
      ...prev,
      hauntedEventActive: false,
      hauntedEventId: null,
    }))
  }, [])

  // ── Daily Midnight Reading ───────────────────────────────

  const plCheckMidnightReset = useCallback(() => {
    const today = plGetDayKey()
    setState(prev => {
      if (prev.dailyMidnightLastDate === today) return prev
      const lostStreak = prev.dailyMidnightLastDate !== '' ? prev.midnightStreak : 0
      return {
        ...prev,
        dailyMidnightAvailable: true,
        dailyMidnightLastDate: today,
        midnightStreak: lostStreak,
      }
    })
  }, [])

  const plPerformMidnightReading = useCallback((): boolean => {
    let success = false
    setState(prev => {
      if (!prev.dailyMidnightAvailable) return prev
      success = true
      const streakBonus = prev.midnightStreak * 10
      const baseReward = 100 + streakBonus
      const today = plGetDayKey()
      return {
        ...prev,
        dailyMidnightAvailable: false,
        dailyMidnightLastDate: today,
        midnightStreak: prev.midnightStreak + 1,
        totalMidnightReadings: prev.totalMidnightReadings + 1,
        xp: prev.xp + baseReward,
        totalXp: prev.totalXp + baseReward,
        knowledge: plClamp(prev.knowledge + baseReward, 0, prev.maxKnowledge),
        totalKnowledgeGained: prev.totalKnowledgeGained + baseReward,
      }
    })
    return success
  }, [])

  // ── Title System ────────────────────────────────────────

  const plGetCurrentTitleInfo = useCallback(() => {
    let currentTitle = PL_TITLES[PL_TITLES.length - 1]
    for (const title of PL_TITLES) {
      if (state.level >= title.levelReq) {
        currentTitle = title
      }
    }
    return currentTitle
  }, [state.level])

  const plUpdateTitle = useCallback(() => {
    setState(prev => {
      let newTitle = prev.title
      for (const title of PL_TITLES) {
        if (prev.level >= title.levelReq) {
          newTitle = title.name
        }
      }
      return { ...prev, title: newTitle }
    })
  }, [])

  // ── Achievement Checking ────────────────────────────────

  const plCheckAchievements = useCallback((): string[] => {
    const newlyUnlocked: string[] = []
    setState(prev => {
      const checks: Array<{ id: string; condition: boolean }> = [
        { id: 'first_visit', condition: prev.totalExplorations >= 1 },
        { id: 'first_tome', condition: prev.totalTomesCollected >= 1 },
        { id: 'five_tomes', condition: prev.totalTomesCollected >= 5 },
        { id: 'fifteen_tomes', condition: prev.totalTomesCollected >= 15 },
        { id: 'thirty_tomes', condition: prev.totalTomesCollected >= 30 },
        { id: 'first_spell', condition: prev.totalSpellsDeciphered >= 1 },
        { id: 'ten_spells', condition: prev.totalSpellsDeciphered >= 10 },
        { id: 'all_spells', condition: prev.totalSpellsDeciphered >= 22 },
        { id: 'first_ghost_friend', condition: prev.totalGhostsBefriended >= 1 },
        { id: 'five_ghost_friends', condition: prev.totalGhostsBefriended >= 5 },
        { id: 'ten_ghost_friends', condition: prev.totalGhostsBefriended >= 10 },
        { id: 'unlock_all_wings', condition: prev.wingsUnlocked.length >= 8 },
        { id: 'first_passage', condition: prev.totalPassagesFound >= 1 },
        { id: 'five_passages', condition: prev.totalPassagesFound >= 5 },
        { id: 'level_ten', condition: prev.level >= 10 },
        { id: 'level_twenty_five', condition: prev.level >= 25 },
        { id: 'level_fifty', condition: prev.level >= 50 },
        { id: 'hundred_readings', condition: prev.totalMidnightReadings >= 100 },
      ]

      let newAchievements = [...prev.achievements]
      let addedCoins = 0
      let addedXp = 0

      for (const check of checks) {
        if (!newAchievements.includes(check.id) && check.condition) {
          newAchievements.push(check.id)
          newlyUnlocked.push(check.id)
          const achievement = PL_ACHIEVEMENTS.find(a => a.id === check.id)
          if (achievement) {
            addedCoins += achievement.reward.coins
            addedXp += achievement.reward.xp
          }
        }
      }

      return {
        ...prev,
        achievements: newAchievements,
        coins: plClamp(prev.coins + addedCoins, 0, PL_MAX_COINS),
        totalCoinsEarned: prev.totalCoinsEarned + addedCoins,
        xp: prev.xp + addedXp,
        totalXp: prev.totalXp + addedXp,
      }
    })
    return newlyUnlocked
  }, [])

  // ── Reset ───────────────────────────────────────────────

  const plResetState = useCallback(() => {
    setState(plCreateDefaultState())
  }, [])

  const plManualSave = useCallback(() => {
    plSaveState(stateRef.current)
  }, [])

  // ── Computed / Memoized Values ──────────────────────────

  const plTomeCollectionProgress = useMemo(() => {
    return {
      collected: state.collectedTomes.length,
      total: PL_TOMES.length,
      percentage: Math.floor((state.collectedTomes.length / PL_TOMES.length) * 100),
    }
  }, [state.collectedTomes])

  const plSpellCollectionProgress = useMemo(() => {
    return {
      deciphered: state.decipheredSpells.length,
      total: PL_SPELLS.length,
      percentage: Math.floor((state.decipheredSpells.length / PL_SPELLS.length) * 100),
    }
  }, [state.decipheredSpells])

  const plWingExplorationProgress = useMemo(() => {
    return {
      unlocked: state.wingsUnlocked.length,
      total: PL_WINGS.length,
      percentage: Math.floor((state.wingsUnlocked.length / PL_WINGS.length) * 100),
    }
  }, [state.wingsUnlocked])

  const plGhostFriendshipProgress = useMemo(() => {
    return {
      befriended: state.ghostFriends.length,
      total: PL_GHOSTS.length,
      percentage: Math.floor((state.ghostFriends.length / PL_GHOSTS.length) * 100),
    }
  }, [state.ghostFriends])

  const plRoomDiscoveryProgress = useMemo(() => {
    return {
      discovered: state.roomsDiscovered.length,
      total: PL_ROOMS.length,
      percentage: Math.floor((state.roomsDiscovered.length / PL_ROOMS.length) * 100),
    }
  }, [state.roomsDiscovered])

  const plPassageDiscoveryProgress = useMemo(() => {
    return {
      discovered: state.passagesDiscovered.length,
      total: PL_PASSAGES.length,
      percentage: Math.floor((state.passagesDiscovered.length / PL_PASSAGES.length) * 100),
    }
  }, [state.passagesDiscovered])

  // ── Achievement Info Lookup ──────────────────────────────

  const plGetAchievementInfo = useCallback((id: string) => {
    return PL_ACHIEVEMENTS.find(a => a.id === id) ?? null
  }, [])

  const plGetTitleInfo = useCallback((level: number) => {
    let currentTitle = PL_TITLES[0]
    for (const title of PL_TITLES) {
      if (level >= title.levelReq) {
        currentTitle = title
      }
    }
    return currentTitle
  }, [])

  const plGetTomeInfo = useCallback((id: string) => {
    return PL_TOMES.find(t => t.id === id) ?? null
  }, [])

  const plGetSpellInfo = useCallback((id: string) => {
    return PL_SPELLS.find(s => s.id === id) ?? null
  }, [])

  const plGetHauntedEventInfo = useCallback((id: string) => {
    return PL_HAUNTED_EVENTS.find(e => e.id === id) ?? null
  }, [])

  // ── Lore System ──────────────────────────────────────────

  const plGetLoreEntry = useCallback((id: string) => {
    return PL_LORE_ENTRIES.find(l => l.id === id) ?? null
  }, [])

  const plGetLoreInWing = useCallback((wingId: string) => {
    return PL_LORE_ENTRIES.filter(l => l.wing === wingId)
  }, [])

  const plGetAccessibleLore: () => typeof PL_LORE_ENTRIES = () => {
    return PL_LORE_ENTRIES.filter(l => l.requiredLevel <= state.level)
  }

  const plDiscoverLore = useCallback((loreId: string) => {
    const entry = PL_LORE_ENTRIES.find(l => l.id === loreId)
    if (!entry) return
    setState(prev => {
      if (prev.loreDiscovered.includes(loreId)) return prev
      if (prev.level < entry.requiredLevel) return prev
      return {
        ...prev,
        loreDiscovered: [...prev.loreDiscovered, loreId],
        totalLoreDiscovered: prev.totalLoreDiscovered + 1,
        xp: prev.xp + 75,
        totalXp: prev.totalXp + 75,
        knowledge: plClamp(prev.knowledge + 25, 0, prev.maxKnowledge),
        totalKnowledgeGained: prev.totalKnowledgeGained + 25,
      }
    })
  }, [])

  // ── Friendship & Enchantment Info ────────────────────────

  const plGetFriendshipLevel = useCallback((level: number) => {
    for (const fl of PL_FRIENDSHIP_LEVELS) {
      if (fl.level === level) return fl
    }
    return PL_FRIENDSHIP_LEVELS[0]
  }, [])

  const plGetAllFriendshipLevels: () => typeof PL_FRIENDSHIP_LEVELS = () => {
    return PL_FRIENDSHIP_LEVELS
  }

  const plGetEnchantment = useCallback((id: string) => {
    return PL_ENCHANTMENT_TYPES.find(e => e.id === id) ?? null
  }, [])

  const plGetAccessibleEnchantments: () => typeof PL_ENCHANTMENT_TYPES = () => {
    return PL_ENCHANTMENT_TYPES.filter(e => e.requiredLevel <= state.level)
  }

  const plGetReadingMilestones: () => typeof PL_READING_MILESTONES = () => {
    return PL_READING_MILESTONES
  }

  const plGetCurrentReadingMilestone: () => typeof PL_READING_MILESTONES[number] | null = () => {
    let current: typeof PL_READING_MILESTONES[number] | null = null
    for (const ms of PL_READING_MILESTONES) {
      if (state.totalReadings >= ms.target) {
        current = ms
      }
    }
    return current
  }

  const plGetNextReadingMilestone: () => typeof PL_READING_MILESTONES[number] | null = () => {
    for (const ms of PL_READING_MILESTONES) {
      if (state.totalReadings < ms.target) return ms
    }
    return null
  }

  const plGetMidnightBonusForStreak = useCallback((streak: number) => {
    let bonus = PL_MIDNIGHT_BONUS_TABLE[0]
    for (const entry of PL_MIDNIGHT_BONUS_TABLE) {
      if (streak >= entry.minStreak) {
        bonus = entry
      }
    }
    return bonus
  }, [])

  const plGetLoreProgress = useMemo(() => {
    return {
      discovered: state.loreDiscovered.length,
      total: PL_LORE_ENTRIES.length,
      percentage: Math.floor((state.loreDiscovered.length / PL_LORE_ENTRIES.length) * 100),
    }
  }, [state.loreDiscovered])

  // ── Research Quest System ───────────────────────────────

  const plGetResearchQuest = useCallback((questId: string) => {
    return PL_RESEARCH_QUESTS.find(q => q.id === questId) ?? null
  }, [])

  const plGetAvailableResearchQuests: () => typeof PL_RESEARCH_QUESTS = () => {
    return PL_RESEARCH_QUESTS.filter(q => q.requiredLevel <= state.level)
  }

  const plStartResearchQuest = useCallback((questId: string) => {
    const quest = PL_RESEARCH_QUESTS.find(q => q.id === questId)
    if (!quest) return
    setState(prev => {
      if (prev.researchQuests[questId]) return prev
      if (prev.level < quest.requiredLevel) return prev
      return {
        ...prev,
        researchQuests: {
          ...prev.researchQuests,
          [questId]: {
            questId,
            currentProgress: 0,
            targetProgress: quest.targets,
            completed: false,
            rewardClaimed: false,
          },
        },
      }
    })
  }, [])

  const plAdvanceResearchQuest = useCallback((questId: string, amount: number = 1) => {
    setState(prev => {
      const quest = prev.researchQuests[questId]
      if (!quest || quest.completed) return prev
      const newProgress = Math.min(quest.currentProgress + amount, quest.targetProgress)
      const completed = newProgress >= quest.targetProgress
      const questData = PL_RESEARCH_QUESTS.find(q => q.id === questId)
      if (!questData) return prev
      return {
        ...prev,
        researchQuests: {
          ...prev.researchQuests,
          [questId]: {
            ...quest,
            currentProgress: newProgress,
            completed,
          },
        },
        totalResearchCompleted: completed ? prev.totalResearchCompleted + 1 : prev.totalResearchCompleted,
      }
    })
  }, [])

  const plClaimResearchReward = useCallback((questId: string): boolean => {
    let success = false
    setState(prev => {
      const quest = prev.researchQuests[questId]
      if (!quest || !quest.completed || quest.rewardClaimed) return prev
      const questData = PL_RESEARCH_QUESTS.find(q => q.id === questId)
      if (!questData) return prev
      success = true
      return {
        ...prev,
        researchQuests: {
          ...prev.researchQuests,
          [questId]: { ...quest, rewardClaimed: true },
        },
        coins: plClamp(prev.coins + questData.coinReward, 0, PL_MAX_COINS),
        totalCoinsEarned: prev.totalCoinsEarned + questData.coinReward,
        xp: prev.xp + questData.xpReward,
        totalXp: prev.totalXp + questData.xpReward,
      }
    })
    return success
  }, [])

  // ── Library Shop ────────────────────────────────────────

  const plGetShopItems = useCallback(() => {
    return PL_SHOP_ITEMS.filter(item => item.requiredLevel <= stateRef.current.level)
  }, [])

  const plPurchaseItem = useCallback((itemId: string): boolean => {
    const item = PL_SHOP_ITEMS.find(i => i.id === itemId)
    if (!item) return false
    let success = false
    setState(prev => {
      if (prev.coins < item.cost || prev.level < item.requiredLevel) return prev
      success = true
      let newKnowledge = prev.knowledge
      let newMaxKnowledge = prev.maxKnowledge
      let newFocus = prev.focus
      let newXpMult = prev.xpMult

      if (item.focusRestore > 0) {
        newFocus = plClamp(prev.focus + item.focusRestore, 0, prev.maxFocus)
      }
      if (item.knowledgeBonus > 0) {
        newMaxKnowledge = prev.maxKnowledge + item.knowledgeBonus
        newKnowledge = prev.knowledge + item.knowledgeBonus
      }
      if ('xpMultBonus' in item && item.xpMultBonus) {
        newXpMult = prev.xpMult + item.xpMultBonus
      }

      return {
        ...prev,
        coins: prev.coins - item.cost,
        focus: newFocus,
        knowledge: newKnowledge,
        maxKnowledge: newMaxKnowledge,
        xpMult: newXpMult,
      }
    })
    return success
  }, [])

  // ── Bookshelf Search ────────────────────────────────────

  const plSearchBookshelf = useCallback((): { event: typeof PL_BOOKSHELF_EVENTS[number]; coins: number; xp: number; knowledgeGain: number } => {
    const event = PL_BOOKSHELF_EVENTS[Math.floor(Math.random() * PL_BOOKSHELF_EVENTS.length)]
    const coins = plRandomInt(event.coinReward[0], event.coinReward[1])
    const xp = plRandomInt(event.xpReward[0], event.xpReward[1])
    const knowledgeGain = ('knowledgeGain' in event && event.knowledgeGain) ? event.knowledgeGain : 0

    setState(prev => ({
      ...prev,
      coins: plClamp(prev.coins + coins, 0, PL_MAX_COINS),
      totalCoinsEarned: prev.totalCoinsEarned + coins,
      xp: prev.xp + xp,
      totalXp: prev.totalXp + xp,
      knowledge: plClamp(prev.knowledge + knowledgeGain, 0, prev.maxKnowledge),
      totalKnowledgeGained: prev.totalKnowledgeGained + knowledgeGain,
      totalBookshelfSearches: prev.totalBookshelfSearches + 1,
    }))

    return { event, coins, xp, knowledgeGain }
  }, [])

  // ── Return ──────────────────────────────────────────────

  // ── Library Card Rune System ────────────────────────────

  const plGetRuneSlots: () => PlRuneSlot[] = () => {
    return PL_RUNE_SLOTS
  }

  const plGetRuneUpgradeCost = useCallback((tier: number): number => {
    return PL_RUNE_UPGRADE_COSTS[tier] ?? PL_RUNE_UPGRADE_COSTS[1]
  }, [])

  const plGetRuneValueMultiplier = useCallback((tier: number): number => {
    return PL_RUNE_VALUE_MULTIPLIERS[tier] ?? 1
  }, [])

  // ── Return ──────────────────────────────────────────────

  return {
    // State accessors
    PL_WINGS,
    PL_ROOMS,
    PL_GHOSTS,
    PL_TOMES,
    PL_SPELLS,
    PL_PASSAGES,
    PL_HAUNTED_EVENTS,
    PL_TITLES,
    PL_ACHIEVEMENTS,
    PL_RARITIES,
    PL_LORE_ENTRIES,
    PL_RESEARCH_QUESTS,
    PL_SHOP_ITEMS,
    PL_BOOKSHELF_EVENTS,
    PL_FRIENDSHIP_LEVELS,
    PL_READING_MILESTONES,
    PL_ENCHANTMENT_TYPES,
    PL_MIDNIGHT_BONUS_TABLE,
    PL_RUNE_SLOTS,
    PL_MAX_LEVEL,
    PL_XP_TABLE,

    // Getters
    plGetLevel,
    plGetXp,
    plGetTotalXp,
    plGetKnowledge,
    plGetMaxKnowledge,
    plGetFocus,
    plGetMaxFocus,
    plGetCoins,
    plGetLuck,
    plGetCoinFind,
    plGetXpMult,
    plGetTitle,
    plGetCurrentWing,
    plGetCurrentRoom,
    plGetWingsUnlocked,
    plGetRoomsDiscovered,
    plGetCollectedTomes,
    plGetDecipheredSpells,
    plGetGhostFriends,
    plGetGhostEncounters,
    plGetPassagesDiscovered,
    plGetAchievements,
    plGetTotalTomesCollected,
    plGetTotalSpellsDeciphered,
    plGetTotalGhostsBefriended,
    plGetTotalGhostsEncountered,
    plGetTotalPassagesFound,
    plGetTotalCoinsEarned,
    plGetTotalKnowledgeGained,
    plGetTotalReadings,
    plGetTotalExplorations,
    plGetTotalMidnightReadings,
    plGetDailyMidnightAvailable,
    plGetMidnightStreak,
    plGetIsExploring,
    plGetHauntedEventActive,
    plGetHauntedEventId,
    plGetLog,
    plGetState,

    // XP & Leveling
    plAddXp,
    plGetXpForNextLevel,
    plGetXpProgress,

    // Knowledge & Focus
    plAddKnowledge,
    plUseFocus,
    plRestoreFocus,
    plFullRestoreFocus,

    // Coins
    plAddCoins,
    plSpendCoins,

    // Wings
    plGetWingById,
    plGetAccessibleWings,
    plUnlockWing,
    plEnterWing,
    plLeaveWing,

    // Rooms
    plGetRoomById,
    plGetAccessibleRooms,
    plGetRoomsInWing,
    plDiscoverRoom,
    plEnterRoom,
    plLeaveRoom,

    // Tomes
    plGetTomeInfo,
    plCollectTome,
    plReadTome,
    plTomeCollectionProgress,

    // Spells
    plGetSpellInfo,
    plDecipherSpell,
    plCastSpell,
    plSpellCollectionProgress,

    // Ghosts
    plGetGhostById,
    plGetGhostsInWing,
    plEncounterGhost,
    plBefriendGhost,
    plGhostFriendshipProgress,

    // Passages
    plGetPassageById,
    plGetPassagesFromRoom,
    plDiscoverPassage,
    plPassageDiscoveryProgress,

    // Exploration
    plExplore,

    // Haunted Events
    plGetHauntedEventInfo,
    plTriggerHauntedEvent,
    plClearHauntedEvent,

    // Midnight Reading
    plCheckMidnightReset,
    plPerformMidnightReading,

    // Lore
    plGetLoreEntry,
    plGetLoreInWing,
    plGetAccessibleLore,
    plDiscoverLore,
    plGetLoreProgress,

    // Friendship & Enchantments
    plGetFriendshipLevel,
    plGetAllFriendshipLevels,
    plGetEnchantment,
    plGetAccessibleEnchantments,
    plGetReadingMilestones,
    plGetCurrentReadingMilestone,
    plGetNextReadingMilestone,
    plGetMidnightBonusForStreak,

    // Research Quests
    plGetResearchQuest,
    plGetAvailableResearchQuests,
    plStartResearchQuest,
    plAdvanceResearchQuest,
    plClaimResearchReward,

    // Library Shop
    plGetShopItems,
    plPurchaseItem,

    // Bookshelf Search
    plSearchBookshelf,

    // Titles & Achievements
    plGetCurrentTitleInfo,
    plGetTitleInfo,
    plUpdateTitle,
    plGetAchievementInfo,
    plCheckAchievements,

    // Progress
    plWingExplorationProgress,
    plRoomDiscoveryProgress,

    // Management
    plResetState,
    plManualSave,

    // Library Card Runes
    plGetRuneSlots,
    plGetRuneUpgradeCost,
    plGetRuneValueMultiplier,
  }
}
