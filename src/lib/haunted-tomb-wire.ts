'use client'
import { useState, useCallback, useEffect, useRef } from 'react'

// ────────────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────────────

const HT_MAX_LEVEL = 50

const HT_RARITY_COMMON = { name: 'Common', color: '#6b7280', weight: 50, xpMult: 1, icon: '🪦' }
const HT_RARITY_UNCOMMON = { name: 'Uncommon', color: '#78716c', weight: 30, xpMult: 1.5, icon: '🗿' }
const HT_RARITY_RARE = { name: 'Rare', color: '#d97706', weight: 14, xpMult: 2, icon: '🏺' }
const HT_RARITY_EPIC = { name: 'Epic', color: '#b45309', weight: 5, xpMult: 3, icon: '⚡' }
const HT_RARITY_LEGENDARY = { name: 'Legendary', color: '#f59e0b', weight: 1, xpMult: 5, icon: '👁️' }

const HT_RARITIES = [
  HT_RARITY_COMMON,
  HT_RARITY_UNCOMMON,
  HT_RARITY_RARE,
  HT_RARITY_EPIC,
  HT_RARITY_LEGENDARY,
]

const HT_XP_TABLE: number[] = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,
  3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450,
  11500, 12600, 13750, 14950, 16200, 17500, 18850, 20250, 21700, 23200,
  24750, 26350, 28000, 29700, 31450, 33250, 35100, 37000, 38950, 40950,
  43000, 45100, 47250, 49450, 51700, 54000, 56350, 58750, 61200, 63700,
]

const HT_BASE_HP = 100
const HP_PER_LEVEL = 12
const HT_BASE_SANITY = 80
const SANITY_PER_LEVEL = 8
const HT_BASE_DODGE = 5
const DODGE_PER_LEVEL = 0.5
const HT_BASE_LUCK = 1
const LUCK_PER_LEVEL = 0.3
const HT_BASE_GOLD_FIND = 1
const GOLD_FIND_PER_LEVEL = 0.15
const HT_BASE_TRAP_SENSE = 5
const TRAP_SENSE_PER_LEVEL = 0.8
const HT_EXPLORATION_COOLDOWN_MS = 3000
const HT_GHOST_ENCOUNTER_CHANCE = 0.15
const HT_TRAP_ENCOUNTER_CHANCE = 0.25
const HT_ARTIFACT_FIND_CHANCE = 0.35
const HT_SECRET_CHAMBER_CHANCE = 0.05
const HT_MAX_INVENTORY_SIZE = 50
const HT_MAX_GOLD = 9999999
const HT_MAX_GEMS = 99999
const HT_HEAL_AMOUNT = 25
const HT_SANITY_RESTORE_AMOUNT = 20
const HT_REVIVE_COST_GEMS = 10
const HT_SAVE_KEY = 'haunted-tomb-save'
const HT_AUTO_SAVE_INTERVAL_MS = 15000

// ────────────────────────────────────────────────────────────────
// TITLES
// ────────────────────────────────────────────────────────────────

const HT_TITLES = [
  { id: 'tomb_raider', name: 'Tomb Raider', levelReq: 1, icon: '🗡️', desc: 'A brave soul entering the tomb' },
  { id: 'grave_digger', name: 'Grave Digger', levelReq: 5, icon: '⛏️', desc: 'Unearthing ancient secrets' },
  { id: 'artifact_hunter', name: 'Artifact Hunter', levelReq: 10, icon: '🏺', desc: 'Collector of forgotten relics' },
  { id: 'ghost_whisperer', name: 'Ghost Whisperer', levelReq: 15, icon: '👻', desc: 'Speaker with the dead' },
  { id: 'tomb_master', name: 'Tomb Master', levelReq: 25, icon: '🏛️', desc: 'Master of the catacombs' },
  { id: 'curse_breaker', name: 'Curse Breaker', levelReq: 35, icon: '💎', desc: 'Breaker of ancient hexes' },
  { id: 'pharaoh_warden', name: 'Pharaoh Warden', levelReq: 45, icon: '👑', desc: 'Guardian of royal tombs' },
  { id: 'undying_pharaoh', name: 'Undying Pharaoh', levelReq: 50, icon: '👁️', desc: 'Eternal ruler of the dead' },
]

// ────────────────────────────────────────────────────────────────
// ACHIEVEMENTS
// ────────────────────────────────────────────────────────────────

const HT_ACHIEVEMENTS = [
  { id: 'first_steps', name: 'First Steps', desc: 'Enter the tomb for the first time', icon: '👣', reward: { gold: 50, xp: 25 } },
  { id: 'first_artifact', name: 'Hoarder Begins', desc: 'Find your first artifact', icon: '🏺', reward: { gold: 100, xp: 50 } },
  { id: 'ten_artifacts', name: 'Relic Collector', desc: 'Collect 10 artifacts', icon: '🏺', reward: { gold: 500, xp: 200 } },
  { id: 'twenty_five_artifacts', name: 'Museum Curator', desc: 'Collect 25 artifacts', icon: '🏛️', reward: { gold: 2000, xp: 500, gems: 5 } },
  { id: 'first_ghost', name: 'Ghostly Encounter', desc: 'Encounter your first ghost', icon: '👻', reward: { gold: 75, xp: 40 } },
  { id: 'befriend_ghost', name: 'Spirit Friend', desc: 'Befriend a ghost', icon: '🤝', reward: { gold: 200, xp: 100 } },
  { id: 'befriend_five_ghosts', name: 'Ghost Council', desc: 'Befriend 5 ghosts', icon: '👻', reward: { gold: 1000, xp: 400, gems: 3 } },
  { id: 'survive_ten_traps', name: 'Trap Dodger', desc: 'Survive 10 traps', icon: '🪤', reward: { gold: 150, xp: 75 } },
  { id: 'dodge_twenty_traps', name: 'Shadow Step', desc: 'Dodge 20 traps', icon: '💨', reward: { gold: 300, xp: 150 } },
  { id: 'clear_first_chamber', name: 'Chamber Cleared', desc: 'Clear your first chamber', icon: '🚪', reward: { gold: 200, xp: 100 } },
  { id: 'clear_all_chambers', name: 'Tomb Conqueror', desc: 'Clear all 8 chambers', icon: '🏰', reward: { gold: 5000, xp: 2000, gems: 10 } },
  { id: 'level_ten', name: 'Seasoned Explorer', desc: 'Reach level 10', icon: '⭐', reward: { gold: 500, xp: 0 } },
  { id: 'level_twenty_five', name: 'Veteran Raider', desc: 'Reach level 25', icon: '⭐', reward: { gold: 2000, xp: 0, gems: 5 } },
  { id: 'level_fifty', name: 'Tomb Immortal', desc: 'Reach level 50', icon: '🌟', reward: { gold: 10000, xp: 0, gems: 25 } },
  { id: 'find_legendary', name: 'Legendary Find', desc: 'Find a legendary artifact', icon: '👁️', reward: { gold: 3000, xp: 1000, gems: 10 } },
  { id: 'earn_10k_gold', name: 'Golden Pharaoh', desc: 'Accumulate 10,000 gold', icon: '💰', reward: { gold: 0, xp: 300 } },
  { id: 'hundred_explorations', name: 'Endless Wanderer', desc: 'Complete 100 explorations', icon: '🚶', reward: { gold: 5000, xp: 1500, gems: 8 } },
  { id: 'zero_sanity_escape', name: 'Mad Escape', desc: 'Escape with zero sanity', icon: '🧠', reward: { gold: 100, xp: 50 } },
]

// ────────────────────────────────────────────────────────────────
// CHAMBERS (8 tomb chambers)
// ────────────────────────────────────────────────────────────────

const HT_CHAMBERS = [
  {
    id: 'entrance_hall',
    name: 'Entrance Hall',
    desc: 'A crumbling stone corridor lined with faded hieroglyphs. Dust motes dance in the thin beams of torchlight.',
    dangerLevel: 1,
    goldReward: [10, 30],
    xpReward: [15, 40],
    trapChance: 0.1,
    ghostChance: 0.05,
    artifactChance: 0.2,
    requiredLevel: 1,
    bgTint: '#374151',
  },
  {
    id: 'burial_chamber',
    name: 'Burial Chamber',
    desc: 'Stone sarcophagi line the walls. Some are sealed, others lie open, their contents long since disturbed.',
    dangerLevel: 2,
    goldReward: [20, 60],
    xpReward: [30, 75],
    trapChance: 0.15,
    ghostChance: 0.1,
    artifactChance: 0.25,
    requiredLevel: 3,
    bgTint: '#3f3f46',
  },
  {
    id: 'treasure_vault',
    name: 'Treasure Vault',
    desc: 'Glinting gold and jewels catch the light, but so do the gleaming eyes of ancient guardians.',
    dangerLevel: 3,
    goldReward: [40, 120],
    xpReward: [50, 130],
    trapChance: 0.2,
    ghostChance: 0.12,
    artifactChance: 0.35,
    requiredLevel: 6,
    bgTint: '#44403c',
  },
  {
    id: 'cursed_corridor',
    name: 'Cursed Corridor',
    desc: 'Wails echo through the narrow passageway. The walls seem to shift and breathe with dark energy.',
    dangerLevel: 4,
    goldReward: [30, 90],
    xpReward: [70, 180],
    trapChance: 0.25,
    ghostChance: 0.25,
    artifactChance: 0.2,
    requiredLevel: 9,
    bgTint: '#4a3f35',
  },
  {
    id: 'sphinx_arena',
    name: 'Sphinx Arena',
    desc: 'A vast chamber centered on a massive stone sphinx. Its eyes glow with ancient riddles and malice.',
    dangerLevel: 5,
    goldReward: [60, 180],
    xpReward: [100, 260],
    trapChance: 0.15,
    ghostChance: 0.15,
    artifactChance: 0.4,
    requiredLevel: 14,
    bgTint: '#57534e',
  },
  {
    id: 'mummy_laboratory',
    name: 'Mummy Laboratory',
    desc: 'Preservation tables, canopic jars, and embalming tools fill this grim workshop. The smell of natron lingers.',
    dangerLevel: 6,
    goldReward: [50, 150],
    xpReward: [130, 340],
    trapChance: 0.3,
    ghostChance: 0.2,
    artifactChance: 0.45,
    requiredLevel: 20,
    bgTint: '#5c4a3a',
  },
  {
    id: 'pharaoh_crypt',
    name: 'Pharaoh Crypt',
    desc: 'The final resting place of ancient kings. Golden masks adorn the walls and a massive sarcophagus dominates the room.',
    dangerLevel: 7,
    goldReward: [80, 250],
    xpReward: [180, 460],
    trapChance: 0.3,
    ghostChance: 0.3,
    artifactChance: 0.5,
    requiredLevel: 30,
    bgTint: '#78350f',
  },
  {
    id: 'shadow_realm',
    name: 'Shadow Realm',
    desc: 'A pocket dimension within the tomb where reality blurs. The dead walk freely here and shadows have teeth.',
    dangerLevel: 8,
    goldReward: [100, 350],
    xpReward: [250, 650],
    trapChance: 0.35,
    ghostChance: 0.4,
    artifactChance: 0.55,
    requiredLevel: 40,
    bgTint: '#1c1917',
  },
]

// ────────────────────────────────────────────────────────────────
// ARTIFACTS (30+ tomb artifacts)
// ────────────────────────────────────────────────────────────────

const HT_ARTIFACTS = [
  { id: 'scarab_amulet', name: 'Scarab Amulet', desc: 'A jade scarab that pulses with protective energy.', rarity: 'common' as const, stat: 'dodge', value: 2, chamber: 'entrance_hall' },
  { id: 'tattered_map', name: 'Tattered Map', desc: 'A crumbling papyrus showing secret passages.', rarity: 'common' as const, stat: 'trapSense', value: 3, chamber: 'entrance_hall' },
  { id: 'rusty_key', name: 'Rusty Key', desc: 'Opens a forgotten lock somewhere in the tomb.', rarity: 'common' as const, stat: 'luck', value: 1, chamber: 'entrance_hall' },
  { id: 'bone_charm', name: 'Bone Charm', desc: 'Whispered to ward off minor curses.', rarity: 'common' as const, stat: 'maxHp', value: 10, chamber: 'burial_chamber' },
  { id: 'dried_lotus', name: 'Dried Lotus', desc: 'Preserved for millennia, still faintly fragrant.', rarity: 'common' as const, stat: 'maxSanity', value: 8, chamber: 'burial_chamber' },
  { id: 'clay_tablet', name: 'Clay Tablet', desc: 'Inscribed with prayers to Anubis.', rarity: 'common' as const, stat: 'xpMult', value: 0.05, chamber: 'burial_chamber' },
  { id: 'ankh_of_life', name: 'Ankh of Life', desc: 'Symbol of eternal existence, grants vigor.', rarity: 'uncommon' as const, stat: 'maxHp', value: 25, chamber: 'burial_chamber' },
  { id: 'canopic_jar', name: 'Canopic Jar', desc: 'Contains the preserved organ of an ancient priest.', rarity: 'uncommon' as const, stat: 'sanityRestore', value: 15, chamber: 'mummy_laboratory' },
  { id: 'ushabti_figurine', name: 'Ushabti Figurine', desc: 'A small servant figure that answers questions.', rarity: 'uncommon' as const, stat: 'trapSense', value: 8, chamber: 'burial_chamber' },
  { id: 'cobalt_eye', name: 'Cobalt Eye', desc: 'A glass eye inlaid with lapis lazuli.', rarity: 'uncommon' as const, stat: 'luck', value: 3, chamber: 'treasure_vault' },
  { id: 'papyrus_scroll', name: 'Papyrus Scroll', desc: 'Contains a fragment of the Book of the Dead.', rarity: 'uncommon' as const, stat: 'xpMult', value: 0.1, chamber: 'cursed_corridor' },
  { id: 'serpent_staff', name: 'Serpent Staff', desc: 'A wooden staff topped with a carved cobra.', rarity: 'uncommon' as const, stat: 'dodge', value: 5, chamber: 'cursed_corridor' },
  { id: 'faience_beads', name: 'Faience Beads', desc: 'Turquoise ceramic beads strung on flax thread.', rarity: 'common' as const, stat: 'goldFind', value: 0.1, chamber: 'treasure_vault' },
  { id: 'wadi_jar', name: 'Wadi Jar', desc: 'A storage vessel with traces of ancient wine.', rarity: 'common' as const, stat: 'healAmount', value: 10, chamber: 'burial_chamber' },
  { id: 'sphinx_pendant', name: 'Sphinx Pendant', desc: 'Grants the wisdom of the ancient riddler.', rarity: 'rare' as const, stat: 'trapSense', value: 15, chamber: 'sphinx_arena' },
  { id: 'golden_scarab', name: 'Golden Scarab', desc: 'A pure gold scarab beetle of exquisite craftsmanship.', rarity: 'rare' as const, stat: 'goldFind', value: 0.3, chamber: 'treasure_vault' },
  { id: 'obsidian_mirror', name: 'Obsidian Mirror', desc: 'Reflects more than just light.', rarity: 'rare' as const, stat: 'maxSanity', value: 20, chamber: 'cursed_corridor' },
  { id: 'moon_dagger', name: 'Moon Dagger', desc: 'A blade forged from meteoric iron.', rarity: 'rare' as const, stat: 'dodge', value: 10, chamber: 'sphinx_arena' },
  { id: 'horus_falcon', name: 'Horus Falcon', desc: 'A golden falcon statuette with piercing lapis eyes.', rarity: 'rare' as const, stat: 'luck', value: 6, chamber: 'pharaoh_crypt' },
  { id: 'priest_scepter', name: 'Priest Scepter', desc: 'A ceremonial scepter of office and power.', rarity: 'rare' as const, stat: 'xpMult', value: 0.2, chamber: 'pharaoh_crypt' },
  { id: 'heart_scarab', name: 'Heart Scarab', desc: 'Placed on the heart during mummification for protection.', rarity: 'epic' as const, stat: 'maxHp', value: 60, chamber: 'mummy_laboratory' },
  { id: 'thoth_feather', name: 'Thoth Feather', desc: 'A feather of truth from the god of wisdom.', rarity: 'epic' as const, stat: 'maxSanity', value: 45, chamber: 'pharaoh_crypt' },
  { id: 'scepter_of_osiris', name: 'Scepter of Osiris', desc: 'The crook and flail of the god of the underworld.', rarity: 'epic' as const, stat: 'dodge', value: 18, chamber: 'pharaoh_crypt' },
  { id: 'shadow_cloak', name: 'Shadow Cloak', desc: 'A cloak woven from pure darkness.', rarity: 'epic' as const, stat: 'trapSense', value: 25, chamber: 'shadow_realm' },
  { id: 'pharaoh_mask', name: 'Pharaoh Mask', desc: 'The golden death mask of a forgotten king.', rarity: 'legendary' as const, stat: 'maxHp', value: 120, chamber: 'pharaoh_crypt' },
  { id: 'eye_of_ra', name: 'Eye of Ra', desc: 'A blazing solar disc that burns with eternal fire.', rarity: 'legendary' as const, stat: 'luck', value: 20, chamber: 'shadow_realm' },
  { id: 'ankhenaten_ring', name: 'Ankhenaten Ring', desc: 'A signet ring of immense arcane power.', rarity: 'legendary' as const, stat: 'xpMult', value: 0.5, chamber: 'shadow_realm' },
  { id: 'book_of_dead', name: 'Book of the Dead', desc: 'The complete funerary text of an ancient high priest.', rarity: 'legendary' as const, stat: 'maxSanity', value: 80, chamber: 'shadow_realm' },
  { id: 'shadow_blade', name: 'Shadow Blade', desc: 'A sword that exists between worlds.', rarity: 'epic' as const, stat: 'dodge', value: 22, chamber: 'shadow_realm' },
  { id: 'anubis_shrine', name: 'Anubis Shrine', desc: 'A miniature shrine to the god of embalming.', rarity: 'rare' as const, stat: 'healAmount', value: 25, chamber: 'mummy_laboratory' },
  { id: 'emerald_scarab', name: 'Emerald Scarab', desc: 'A scarab carved from a single emerald.', rarity: 'uncommon' as const, stat: 'goldFind', value: 0.2, chamber: 'treasure_vault' },
  { id: 'sand_candle', name: 'Sand Candle', desc: 'Burns with a flame that reveals hidden things.', rarity: 'uncommon' as const, stat: 'trapSense', value: 5, chamber: 'cursed_corridor' },
  { id: 'lapis_amulet', name: 'Lapis Amulet', desc: 'Deep blue lapis lazuli set in electrum.', rarity: 'uncommon' as const, stat: 'maxSanity', value: 12, chamber: 'burial_chamber' },
  { id: 'nile_pearl', name: 'Nile Pearl', desc: 'A perfect pearl from the sacred river.', rarity: 'rare' as const, stat: 'luck', value: 5, chamber: 'sphinx_arena' },
] as const

// ────────────────────────────────────────────────────────────────
// TRAPS (20+ tomb traps)
// ────────────────────────────────────────────────────────────────

const HT_TRAPS = [
  { id: 'spike_pit', name: 'Spike Pit', desc: 'A concealed pit lined with rusted iron spikes.', minDamage: 15, maxDamage: 30, dodgeBonus: 0, chamber: 'entrance_hall' },
  { id: 'poison_dart', name: 'Poison Dart', desc: 'Tiny holes in the wall shoot poisoned darts when triggered.', minDamage: 10, maxDamage: 25, dodgeBonus: 5, chamber: 'burial_chamber' },
  { id: 'falling_ceiling', name: 'Falling Ceiling', desc: 'Massive stone blocks crash down from above.', minDamage: 30, maxDamage: 55, dodgeBonus: -5, chamber: 'burial_chamber' },
  { id: 'poison_gas', name: 'Poison Gas', desc: 'A noxious green vapor seeps from cracks in the floor.', minDamage: 8, maxDamage: 20, sanityDamage: 10, dodgeBonus: 0, chamber: 'treasure_vault' },
  { id: 'rolling_boulder', name: 'Rolling Boulder', desc: 'A massive stone sphere rolls down the corridor.', minDamage: 25, maxDamage: 50, dodgeBonus: -3, chamber: 'cursed_corridor' },
  { id: 'guillotine_blade', name: 'Guillotine Blade', desc: 'A swinging blade sweeps across the passageway.', minDamage: 20, maxDamage: 45, dodgeBonus: 3, chamber: 'cursed_corridor' },
  { id: 'spear_wall', name: 'Spear Wall', desc: 'Spears thrust from slots in the walls.', minDamage: 15, maxDamage: 35, dodgeBonus: 2, chamber: 'treasure_vault' },
  { id: 'pit_swinger', name: 'Pit Swinger', desc: 'A rope bridge over a bottomless chasm suddenly swings.', minDamage: 18, maxDamage: 40, dodgeBonus: -2, chamber: 'entrance_hall' },
  { id: 'crushing_walls', name: 'Crushing Walls', desc: 'The walls slowly close in with grinding force.', minDamage: 20, maxDamage: 40, dodgeBonus: 0, chamber: 'sphinx_arena' },
  { id: 'fire_jet', name: 'Fire Jet', desc: 'Ancient Greek fire ignites from floor vents.', minDamage: 22, maxDamage: 42, dodgeBonus: 5, chamber: 'mummy_laboratory' },
  { id: 'acid_pool', name: 'Acid Pool', desc: 'A hidden pool of corrosive liquid awaits the unwary.', minDamage: 18, maxDamage: 38, dodgeBonus: 0, chamber: 'mummy_laboratory' },
  { id: 'scythe_trap', name: 'Scythe Trap', desc: 'Bladed scythes swing from concealed ceiling mounts.', minDamage: 16, maxDamage: 36, dodgeBonus: 4, chamber: 'cursed_corridor' },
  { id: 'sand_slide', name: 'Sand Slide', desc: 'The floor gives way to a cascading river of sand.', minDamage: 10, maxDamage: 25, dodgeBonus: 2, chamber: 'entrance_hall' },
  { id: 'electric_rune', name: 'Electric Rune', desc: 'Glowing runes on the floor discharge lightning.', minDamage: 25, maxDamage: 48, sanityDamage: 8, dodgeBonus: 3, chamber: 'pharaoh_crypt' },
  { id: 'mummy_wrap', name: 'Mummy Wrap', desc: 'Bandaged arms reach from the walls to ensnare.', minDamage: 12, maxDamage: 28, sanityDamage: 15, dodgeBonus: -3, chamber: 'mummy_laboratory' },
  { id: 'cursed_idol', name: 'Cursed Idol', desc: 'Touching the idol triggers a powerful curse.', minDamage: 5, maxDamage: 15, sanityDamage: 25, dodgeBonus: 0, chamber: 'treasure_vault' },
  { id: 'shadow_grasp', name: 'Shadow Grasp', desc: 'Dark tendrils reach from the shadows to drag you down.', minDamage: 20, maxDamage: 45, sanityDamage: 20, dodgeBonus: -5, chamber: 'shadow_realm' },
  { id: 'phantom_blades', name: 'Phantom Blades', desc: 'Invisible swords that materialize and slash.', minDamage: 22, maxDamage: 50, dodgeBonus: 0, chamber: 'shadow_realm' },
  { id: 'soul_drain', name: 'Soul Drain', desc: 'A vortex that saps life force and sanity.', minDamage: 15, maxDamage: 35, sanityDamage: 30, dodgeBonus: -2, chamber: 'pharaoh_crypt' },
  { id: 'collapsing_floor', name: 'Collapsing Floor', desc: 'Ancient stonework crumbles beneath your feet.', minDamage: 20, maxDamage: 40, dodgeBonus: 1, chamber: 'sphinx_arena' },
  { id: 'venom_spray', name: 'Venom Spray', desc: 'A pressurized jet of ancient venom.', minDamage: 14, maxDamage: 32, sanityDamage: 5, dodgeBonus: 3, chamber: 'burial_chamber' },
  { id: 'bone_cage', name: 'Bone Cage', desc: 'Rib-like bones erupt from the floor to imprison.', minDamage: 10, maxDamage: 22, dodgeBonus: -4, chamber: 'shadow_realm' },
]

// ────────────────────────────────────────────────────────────────
// GHOSTS / SPIRITS (15+)
// ────────────────────────────────────────────────────────────────

const HT_GHOSTS = [
  { id: 'wandering_spirit', name: 'Wandering Spirit', desc: 'A lost soul searching for its final resting place.', hostility: 0.2, goldReward: [5, 15], xpReward: [10, 25], befriendChance: 0.6, chamber: 'entrance_hall' },
  { id: 'sobbing_phantom', name: 'Sobbing Phantom', desc: 'Endless tears stream from its translucent face.', hostility: 0.1, goldReward: [3, 10], xpReward: [8, 20], befriendChance: 0.8, sanityDrain: 5, chamber: 'burial_chamber' },
  { id: 'guardian_specter', name: 'Guardian Specter', desc: 'Dutifully patrols even in death, attacking intruders.', hostility: 0.7, goldReward: [15, 35], xpReward: [25, 55], befriendChance: 0.25, damage: [10, 25], chamber: 'treasure_vault' },
  { id: 'cursed_mummy', name: 'Cursed Mummy', desc: 'Bandages writhe as it shuffles forward with murderous intent.', hostility: 0.8, goldReward: [20, 45], xpReward: [35, 70], befriendChance: 0.15, damage: [15, 35], sanityDrain: 10, chamber: 'mummy_laboratory' },
  { id: 'priest_ghost', name: 'Priest Ghost', desc: 'A spectral priest performing eternal rites.', hostility: 0.3, goldReward: [10, 25], xpReward: [20, 45], befriendChance: 0.5, sanityDrain: 8, chamber: 'burial_chamber' },
  { id: 'child_spirit', name: 'Child Spirit', desc: 'A small ghost playing with an invisible ball, unaware of the centuries.', hostility: 0.05, goldReward: [2, 8], xpReward: [5, 15], befriendChance: 0.95, chamber: 'entrance_hall' },
  { id: 'warrior_shade', name: 'Warrior Shade', desc: 'A spectral soldier still fighting an ancient war.', hostility: 0.75, goldReward: [18, 40], xpReward: [30, 65], befriendChance: 0.2, damage: [12, 30], chamber: 'sphinx_arena' },
  { id: 'weaver_wraith', name: 'Weaver Wraith', desc: 'Spins webs of shadow and memory, trapping minds.', hostility: 0.6, goldReward: [12, 30], xpReward: [22, 50], befriendChance: 0.3, sanityDrain: 18, chamber: 'cursed_corridor' },
  { id: 'pharaoh_echo', name: 'Pharaoh Echo', desc: 'The residual echo of a mighty ruler demanding tribute.', hostility: 0.5, goldReward: [25, 60], xpReward: [40, 85], befriendChance: 0.35, damage: [10, 20], chamber: 'pharaoh_crypt' },
  { id: 'scribe_ghost', name: 'Scribe Ghost', desc: 'A spectral scribe endlessly writing the same papyrus.', hostility: 0.15, goldReward: [8, 20], xpReward: [15, 35], befriendChance: 0.7, chamber: 'burial_chamber' },
  { id: 'shadow_demon', name: 'Shadow Demon', desc: 'A creature of pure darkness from beyond the veil.', hostility: 0.95, goldReward: [30, 70], xpReward: [50, 100], befriendChance: 0.05, damage: [25, 50], sanityDrain: 25, chamber: 'shadow_realm' },
  { id: 'musician_specter', name: 'Musician Specter', desc: 'Haunting melodies drift from its spectral instruments.', hostility: 0.1, goldReward: [5, 12], xpReward: [10, 22], befriendChance: 0.85, sanityDrain: 3, chamber: 'cursed_corridor' },
  { id: 'anubis_avatar', name: 'Anubis Avatar', desc: 'A manifestation of the jackal-headed god himself.', hostility: 0.65, goldReward: [35, 80], xpReward: [55, 110], befriendChance: 0.2, damage: [20, 45], chamber: 'pharaoh_crypt' },
  { id: 'lost_queen', name: 'Lost Queen', desc: 'A regal phantom searching for her stolen crown.', hostility: 0.4, goldReward: [20, 50], xpReward: [35, 75], befriendChance: 0.45, sanityDrain: 12, chamber: 'pharaoh_crypt' },
  { id: 'scarab_swarm', name: 'Scarab Swarm', desc: 'Thousands of spectral beetles that devour everything.', hostility: 0.85, goldReward: [15, 35], xpReward: [28, 60], befriendChance: 0.1, damage: [18, 38], chamber: 'mummy_laboratory' },
  { id: 'void_walker', name: 'Void Walker', desc: 'An entity that exists between life and death.', hostility: 0.55, goldReward: [28, 65], xpReward: [45, 95], befriendChance: 0.3, damage: [15, 35], sanityDrain: 20, chamber: 'shadow_realm' },
]

// ────────────────────────────────────────────────────────────────
// EXPLORATION EVENTS
// ────────────────────────────────────────────────────────────────

const HT_EVENTS = [
  { id: 'gold_pile', name: 'Gold Pile', desc: 'A pile of ancient gold coins scattered on the floor.', type: 'gold' as const, minAmount: 10, maxAmount: 50 },
  { id: 'gem_vein', name: 'Gem Vein', desc: 'Precious gems embedded in the chamber wall.', type: 'gems' as const, minAmount: 1, maxAmount: 3 },
  { id: 'resting_place', name: 'Resting Place', desc: 'A safe alcove where you can catch your breath.', type: 'heal' as const, healAmount: 30, sanityAmount: 15 },
  { id: 'ancient_inscription', name: 'Ancient Inscription', desc: 'Wall writings that reveal secrets of the tomb.', type: 'xp' as const, minAmount: 20, maxAmount: 60 },
  { id: 'offering_shrine', name: 'Offering Shrine', desc: 'A shrine with offerings left by previous adventurers.', type: 'gold' as const, minAmount: 25, maxAmount: 75 },
  { id: 'healing_spring', name: 'Healing Spring', desc: 'A hidden spring with restorative properties.', type: 'heal' as const, healAmount: 50, sanityAmount: 25 },
  { id: 'cursed_chest', name: 'Cursed Chest', desc: 'A chest that may contain treasure or suffering.', type: 'cursed_chest' as const, goldMin: 30, goldMax: 100, damageMin: 10, damageMax: 30, sanityLoss: 15 },
  { id: 'wandering_merchant', name: 'Wandering Merchant', desc: 'A ghostly merchant willing to trade.', type: 'merchant' as const },
]

// ────────────────────────────────────────────────────────────────
// STATE INTERFACE
// ────────────────────────────────────────────────────────────────

interface HauntedTombState {
  level: number
  xp: number
  totalXp: number
  hp: number
  maxHp: number
  sanity: number
  maxSanity: number
  gold: number
  gems: number
  dodge: number
  luck: number
  goldFind: number
  trapSense: number
  xpMult: number
  healAmount: number
  sanityRestore: number
  collectedArtifacts: string[]
  equippedArtifacts: string[]
  chambersDiscovered: string[]
  chambersCleared: string[]
  currentChamber: string | null
  ghostsEncountered: string[]
  ghostsBefriended: string[]
  trapsTriggered: string[]
  trapsDodged: string[]
  totalExplorations: number
  totalTrapsTriggered: number
  totalTrapsDodged: number
  totalGhostsEncountered: number
  totalGhostsBefriended: number
  totalArtifactsFound: number
  totalGoldEarned: number
  totalDamageTaken: number
  totalSanityLost: number
  totalHealing: number
  title: string
  achievements: string[]
  isExploring: boolean
  isAlive: boolean
  createdAt: number
  lastSaveAt: number
  log: string[]
}

// ────────────────────────────────────────────────────────────────
// DEFAULT STATE
// ────────────────────────────────────────────────────────────────

function htCreateDefaultState(): HauntedTombState {
  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    hp: HT_BASE_HP,
    maxHp: HT_BASE_HP,
    sanity: HT_BASE_SANITY,
    maxSanity: HT_BASE_SANITY,
    gold: 0,
    gems: 0,
    dodge: HT_BASE_DODGE,
    luck: HT_BASE_LUCK,
    goldFind: HT_BASE_GOLD_FIND,
    trapSense: HT_BASE_TRAP_SENSE,
    xpMult: 1,
    healAmount: HT_HEAL_AMOUNT,
    sanityRestore: HT_SANITY_RESTORE_AMOUNT,
    collectedArtifacts: [],
    equippedArtifacts: [],
    chambersDiscovered: [],
    chambersCleared: [],
    currentChamber: null,
    ghostsEncountered: [],
    ghostsBefriended: [],
    trapsTriggered: [],
    trapsDodged: [],
    totalExplorations: 0,
    totalTrapsTriggered: 0,
    totalTrapsDodged: 0,
    totalGhostsEncountered: 0,
    totalGhostsBefriended: 0,
    totalArtifactsFound: 0,
    totalGoldEarned: 0,
    totalDamageTaken: 0,
    totalSanityLost: 0,
    totalHealing: 0,
    title: 'Tomb Raider',
    achievements: [],
    isExploring: false,
    isAlive: true,
    createdAt: Date.now(),
    lastSaveAt: Date.now(),
    log: [],
  }
}

// ────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────

function htRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function htRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function htClamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function htPickRarity(): string {
  const totalWeight = HT_RARITIES.reduce((sum, r) => sum + r.weight, 0)
  let roll = Math.random() * totalWeight
  for (const rarity of HT_RARITIES) {
    roll -= rarity.weight
    if (roll <= 0) return rarity.name.toLowerCase()
  }
  return 'common'
}

function htGetRarityData(name: string) {
  const key = name.toLowerCase()
  return HT_RARITIES.find(r => r.name.toLowerCase() === key) ?? HT_RARITY_COMMON
}

function htLoadState(): HauntedTombState {
  if (typeof window === 'undefined') return htCreateDefaultState()
  try {
    const raw = localStorage.getItem(HT_SAVE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<HauntedTombState>
      const defaults = htCreateDefaultState()
      return { ...defaults, ...parsed }
    }
  } catch {
    // corrupted save — start fresh
  }
  return htCreateDefaultState()
}

function htSaveState(state: HauntedTombState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(HT_SAVE_KEY, JSON.stringify({ ...state, lastSaveAt: Date.now() }))
  } catch {
    // storage full or unavailable
  }
}

// ────────────────────────────────────────────────────────────────
// THE HOOK
// ────────────────────────────────────────────────────────────────

export default function useHauntedTomb() {
  const [state, setState] = useState<HauntedTombState>(htCreateDefaultState)
  const stateRef = useRef<HauntedTombState>(state)

  // Sync ref on every state change
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Hydrate from localStorage after mount
  useEffect(() => {
    const saved = htLoadState()
    setState(saved)
  }, [])

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      htSaveState(stateRef.current)
    }, HT_AUTO_SAVE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  // ── Simple getters ─────────────────────────────────────────

  const htGetLevel: () => number = () => state.level
  const htGetXp: () => number = () => state.xp
  const htGetTotalXp: () => number = () => state.totalXp
  const htGetHp: () => number = () => state.hp
  const htGetMaxHp: () => number = () => state.maxHp
  const htGetSanity: () => number = () => state.sanity
  const htGetMaxSanity: () => number = () => state.maxSanity
  const htGetGold: () => number = () => state.gold
  const htGetGems: () => number = () => state.gems
  const htGetDodge: () => number = () => state.dodge
  const htGetLuck: () => number = () => state.luck
  const htGetGoldFind: () => number = () => state.goldFind
  const htGetTrapSense: () => number = () => state.trapSense
  const htGetXpMult: () => number = () => state.xpMult
  const htGetHealAmount: () => number = () => state.healAmount
  const htGetSanityRestore: () => number = () => state.sanityRestore
  const htGetTitle: () => string = () => state.title
  const htGetIsAlive: () => boolean = () => state.isAlive
  const htGetIsExploring: () => boolean = () => state.isExploring
  const htGetCurrentChamber: () => string | null = () => state.currentChamber
  const htGetTotalExplorations: () => number = () => state.totalExplorations
  const htGetTotalTrapsTriggered: () => number = () => state.totalTrapsTriggered
  const htGetTotalTrapsDodged: () => number = () => state.totalTrapsDodged
  const htGetTotalGhostsEncountered: () => number = () => state.totalGhostsEncountered
  const htGetTotalGhostsBefriended: () => number = () => state.totalGhostsBefriended
  const htGetTotalArtifactsFound: () => number = () => state.totalArtifactsFound
  const htGetTotalGoldEarned: () => number = () => state.totalGoldEarned
  const htGetTotalDamageTaken: () => number = () => state.totalDamageTaken
  const htGetTotalSanityLost: () => number = () => state.totalSanityLost
  const htGetTotalHealing: () => number = () => state.totalHealing
  const htGetCollectedArtifacts: () => string[] = () => state.collectedArtifacts
  const htGetEquippedArtifacts: () => string[] = () => state.equippedArtifacts
  const htGetChambersDiscovered: () => string[] = () => state.chambersDiscovered
  const htGetChambersCleared: () => string[] = () => state.chambersCleared
  const htGetGhostsEncountered: () => string[] = () => state.ghostsEncountered
  const htGetGhostsBefriended: () => string[] = () => state.ghostsBefriended
  const htGetAchievements: () => string[] = () => state.achievements
  const htGetLog: () => string[] = () => state.log
  const htGetState: () => HauntedTombState = () => state

  // ── XP & Leveling ─────────────────────────────────────────

  const htAddXp = useCallback((amount: number) => {
    const scaled = Math.floor(amount * stateRef.current.xpMult)
    setState(prev => {
      let newXp = prev.xp + scaled
      let newLevel = prev.level
      let newMaxHp = prev.maxHp
      let newMaxSanity = prev.maxSanity
      let newDodge = prev.dodge
      let newLuck = prev.luck
      let newGoldFind = prev.goldFind
      let newTrapSense = prev.trapSense
      let newHealAmount = prev.healAmount
      let newSanityRestore = prev.sanityRestore

      while (newLevel < HT_MAX_LEVEL && newXp >= HT_XP_TABLE[newLevel]) {
        newXp -= HT_XP_TABLE[newLevel]
        newLevel += 1
        newMaxHp = HT_BASE_HP + newLevel * HP_PER_LEVEL
        newMaxSanity = HT_BASE_SANITY + newLevel * SANITY_PER_LEVEL
        newDodge = HT_BASE_DODGE + newLevel * DODGE_PER_LEVEL
        newLuck = HT_BASE_LUCK + newLevel * LUCK_PER_LEVEL
        newGoldFind = HT_BASE_GOLD_FIND + newLevel * GOLD_FIND_PER_LEVEL
        newTrapSense = HT_BASE_TRAP_SENSE + newLevel * TRAP_SENSE_PER_LEVEL
        newHealAmount = HT_HEAL_AMOUNT + newLevel * 0.5
        newSanityRestore = HT_SANITY_RESTORE_AMOUNT + newLevel * 0.4
      }

      if (newLevel >= HT_MAX_LEVEL) {
        newXp = 0
      }

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        totalXp: prev.totalXp + scaled,
        maxHp: newMaxHp,
        maxSanity: newMaxSanity,
        dodge: newDodge,
        luck: newLuck,
        goldFind: newGoldFind,
        trapSense: newTrapSense,
        healAmount: newHealAmount,
        sanityRestore: newSanityRestore,
        hp: Math.min(prev.hp, newMaxHp),
        sanity: Math.min(prev.sanity, newMaxSanity),
      }
    })
  }, [])

  const htGetXpForNextLevel: () => number = () => {
    if (state.level >= HT_MAX_LEVEL) return 0
    return HT_XP_TABLE[state.level]
  }

  const htGetXpProgress: () => number = () => {
    if (state.level >= HT_MAX_LEVEL) return 1
    return state.xp / HT_XP_TABLE[state.level]
  }

  // ── HP & Sanity ───────────────────────────────────────────

  const htTakeDamage = useCallback((amount: number) => {
    setState(prev => {
      const newHp = htClamp(prev.hp - amount, 0, prev.maxHp)
      const isAlive = newHp > 0
      return {
        ...prev,
        hp: newHp,
        totalDamageTaken: prev.totalDamageTaken + amount,
        isAlive,
        isExploring: isAlive ? prev.isExploring : false,
      }
    })
  }, [])

  const htHeal = useCallback((amount?: number) => {
    const heal = amount ?? stateRef.current.healAmount
    setState(prev => {
      const oldHp = prev.hp
      const newHp = htClamp(prev.hp + heal, 0, prev.maxHp)
      return {
        ...prev,
        hp: newHp,
        totalHealing: prev.totalHealing + (newHp - oldHp),
      }
    })
  }, [])

  const htFullHeal = useCallback(() => {
    setState(prev => ({
      ...prev,
      hp: prev.maxHp,
      totalHealing: prev.totalHealing + (prev.maxHp - prev.hp),
    }))
  }, [])

  const htLoseSanity = useCallback((amount: number) => {
    setState(prev => {
      const newSanity = htClamp(prev.sanity - amount, 0, prev.maxSanity)
      return {
        ...prev,
        sanity: newSanity,
        totalSanityLost: prev.totalSanityLost + amount,
      }
    })
  }, [])

  const htRestoreSanity = useCallback((amount?: number) => {
    const restore = amount ?? stateRef.current.sanityRestore
    setState(prev => ({
      ...prev,
      sanity: htClamp(prev.sanity + restore, 0, prev.maxSanity),
    }))
  }, [])

  const htFullSanityRestore = useCallback(() => {
    setState(prev => ({
      ...prev,
      sanity: prev.maxSanity,
    }))
  }, [])

  // ── Gold & Gems ───────────────────────────────────────────

  const htAddGold = useCallback((amount: number) => {
    setState(prev => {
      const scaled = Math.floor(amount * prev.goldFind)
      const newGold = htClamp(prev.gold + scaled, 0, HT_MAX_GOLD)
      return {
        ...prev,
        gold: newGold,
        totalGoldEarned: prev.totalGoldEarned + scaled,
      }
    })
  }, [])

  const htSpendGold = useCallback((amount: number): boolean => {
    let success = false
    setState(prev => {
      if (prev.gold < amount) return prev
      success = true
      return { ...prev, gold: prev.gold - amount }
    })
    return success
  }, [])

  const htAddGems = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      gems: htClamp(prev.gems + amount, 0, HT_MAX_GEMS),
    }))
  }, [])

  const htSpendGems = useCallback((amount: number): boolean => {
    let success = false
    setState(prev => {
      if (prev.gems < amount) return prev
      success = true
      return { ...prev, gems: prev.gems - amount }
    })
    return success
  }, [])

  // ── Chamber System ────────────────────────────────────────

  const htGetChamberById = useCallback((id: string) => {
    return HT_CHAMBERS.find(c => c.id === id) ?? null
  }, [])

  const htGetAccessibleChambers: () => typeof HT_CHAMBERS = () => {
    return HT_CHAMBERS.filter(c => c.requiredLevel <= state.level)
  }

  const htDiscoverChamber = useCallback((chamberId: string) => {
    setState(prev => {
      if (prev.chambersDiscovered.includes(chamberId)) return prev
      const chamber = HT_CHAMBERS.find(c => c.id === chamberId)
      if (!chamber || prev.level < chamber.requiredLevel) return prev
      return {
        ...prev,
        chambersDiscovered: [...prev.chambersDiscovered, chamberId],
      }
    })
  }, [])

  const htEnterChamber = useCallback((chamberId: string) => {
    setState(prev => {
      const chamber = HT_CHAMBERS.find(c => c.id === chamberId)
      if (!chamber || prev.level < chamber.requiredLevel || !prev.isAlive) return prev
      const discovered = prev.chambersDiscovered.includes(chamberId)
        ? prev.chambersDiscovered
        : [...prev.chambersDiscovered, chamberId]
      return {
        ...prev,
        currentChamber: chamberId,
        chambersDiscovered: discovered,
      }
    })
  }, [])

  const htClearChamber = useCallback((chamberId: string) => {
    const chamber = HT_CHAMBERS.find(c => c.id === chamberId)
    if (!chamber) return
    setState(prev => {
      if (prev.chambersCleared.includes(chamberId)) return prev
      const goldReward = htRandomInt(chamber.goldReward[0], chamber.goldReward[1])
      const xpReward = htRandomInt(chamber.xpReward[0], chamber.xpReward[1])
      return {
        ...prev,
        chambersCleared: [...prev.chambersCleared, chamberId],
        gold: htClamp(prev.gold + goldReward, 0, HT_MAX_GOLD),
        totalGoldEarned: prev.totalGoldEarned + goldReward,
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
      }
    })
  }, [])

  const htLeaveChamber = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentChamber: null,
      isExploring: false,
    }))
  }, [])

  // ── Exploration ───────────────────────────────────────────

  const htExplore = useCallback(() => {
    if (!stateRef.current.isAlive || stateRef.current.isExploring) return

    setState(prev => ({ ...prev, isExploring: true }))

    const currentChamber = stateRef.current.currentChamber
    const chamber = currentChamber
      ? HT_CHAMBERS.find(c => c.id === currentChamber)
      : HT_CHAMBERS.find(c => c.requiredLevel <= stateRef.current.level) ?? HT_CHAMBERS[0]

    if (!chamber) return

    const roll = Math.random()
    let logMessages: string[] = []

    if (roll < chamber.artifactChance) {
      // Artifact find
      const chamberArtifacts = HT_ARTIFACTS.filter(a => a.chamber === chamber.id)
      const pool = chamberArtifacts.length > 0 ? chamberArtifacts : HT_ARTIFACTS
      const artifact = pool[htRandomInt(0, pool.length - 1)]
      const rarityData = htGetRarityData(artifact.rarity)
      logMessages.push(`You found ${rarityData.icon} ${artifact.name}!`)
    } else if (roll < chamber.artifactChance + chamber.ghostChance) {
      // Ghost encounter
      const chamberGhosts = HT_GHOSTS.filter(g => g.chamber === chamber.id)
      const pool = chamberGhosts.length > 0 ? chamberGhosts : HT_GHOSTS
      const ghost = pool[htRandomInt(0, pool.length - 1)]
      logMessages.push(`A ghostly apparition: ${ghost.name} appears!`)
    } else if (roll < chamber.artifactChance + chamber.ghostChance + chamber.trapChance) {
      // Trap trigger
      const chamberTraps = HT_TRAPS.filter(t => t.chamber === chamber.id)
      const pool = chamberTraps.length > 0 ? chamberTraps : HT_TRAPS
      const trap = pool[htRandomInt(0, pool.length - 1)]
      logMessages.push(`You triggered the ${trap.name}!`)
    } else {
      // Random event or gold
      const event = HT_EVENTS[htRandomInt(0, HT_EVENTS.length - 1)]
      logMessages.push(`${event.name}: ${event.desc}`)
    }

    setState(prev => ({
      ...prev,
      totalExplorations: prev.totalExplorations + 1,
      isExploring: false,
      log: [...logMessages, ...prev.log].slice(0, 50),
    }))
  }, [])

  const htExploreWithRewards = useCallback(() => {
    if (!stateRef.current.isAlive || stateRef.current.isExploring) return null

    setState(prev => ({ ...prev, isExploring: true }))

    const currentChamber = stateRef.current.currentChamber
    const chamber = currentChamber
      ? HT_CHAMBERS.find(c => c.id === currentChamber)
      : HT_CHAMBERS.find(c => c.requiredLevel <= stateRef.current.level) ?? HT_CHAMBERS[0]

    if (!chamber) {
      setState(prev => ({ ...prev, isExploring: false }))
      return null
    }

    const result: {
      type: 'artifact' | 'ghost' | 'trap' | 'event'
      data: typeof HT_ARTIFACTS[number] | typeof HT_GHOSTS[number] | typeof HT_TRAPS[number] | typeof HT_EVENTS[number]
      dodgeRoll: number
      dodgeSuccess: boolean
      damageTaken: number
      sanityLost: number
      goldFound: number
      xpGained: number
      log: string
    } = {
      type: 'event',
      data: HT_EVENTS[0],
      dodgeRoll: 0,
      dodgeSuccess: false,
      damageTaken: 0,
      sanityLost: 0,
      goldFound: 0,
      xpGained: 0,
      log: '',
    }

    const roll = Math.random()

    if (roll < chamber.artifactChance) {
      const chamberArtifacts = HT_ARTIFACTS.filter(a => a.chamber === chamber.id)
      const pool = chamberArtifacts.length > 0 ? chamberArtifacts : HT_ARTIFACTS
      const artifact = pool[htRandomInt(0, pool.length - 1)]
      const rarityData = htGetRarityData(artifact.rarity)
      const xpGained = Math.floor(30 * rarityData.xpMult)

      setState(prev => {
        const alreadyHas = prev.collectedArtifacts.includes(artifact.id)
        return {
          ...prev,
          collectedArtifacts: alreadyHas ? prev.collectedArtifacts : [...prev.collectedArtifacts, artifact.id],
          totalArtifactsFound: prev.totalArtifactsFound + 1,
          xp: prev.xp + xpGained,
          totalXp: prev.totalXp + xpGained,
          isExploring: false,
          log: [
            `Found ${rarityData.icon} [${rarityData.name}] ${artifact.name}: ${artifact.desc}`,
            ...prev.log,
          ].slice(0, 50),
        }
      })

      result.type = 'artifact'
      result.data = artifact
      result.xpGained = xpGained
      result.log = `Found ${rarityData.icon} [${rarityData.name}] ${artifact.name}`
      return result
    }

    if (roll < chamber.artifactChance + chamber.ghostChance) {
      const chamberGhosts = HT_GHOSTS.filter(g => g.chamber === chamber.id)
      const pool = chamberGhosts.length > 0 ? chamberGhosts : HT_GHOSTS
      const ghost = pool[htRandomInt(0, pool.length - 1)]
      const goldReward = htRandomInt(ghost.goldReward[0], ghost.goldReward[1])
      const xpReward = htRandomInt(ghost.xpReward[0], ghost.xpReward[1])

      const attackRoll = Math.random()
      if (attackRoll < ghost.hostility) {
        // Ghost attacks
        const dmgArr = (ghost as Record<string, unknown>).damage as number[] | undefined
        const dmgMin = dmgArr ? dmgArr[0] : 0
        const dmgMax = dmgArr ? dmgArr[1] : 0
        const sanityDmg = ((ghost as Record<string, unknown>).sanityDrain as number) ?? 0
        const damage = dmgMin > 0 ? htRandomInt(dmgMin, dmgMax) : 0

        setState(prev => {
          const newEncountered = prev.ghostsEncountered.includes(ghost.id)
            ? prev.ghostsEncountered
            : [...prev.ghostsEncountered, ghost.id]
          return {
            ...prev,
            hp: htClamp(prev.hp - damage, 0, prev.maxHp),
            sanity: htClamp(prev.sanity - sanityDmg, 0, prev.maxSanity),
            isAlive: (prev.hp - damage) > 0,
            ghostsEncountered: newEncountered,
            totalGhostsEncountered: prev.totalGhostsEncountered + 1,
            totalDamageTaken: prev.totalDamageTaken + damage,
            totalSanityLost: prev.totalSanityLost + sanityDmg,
            isExploring: false,
            log: [
              `${ghost.name} attacks! -${damage} HP, -${sanityDmg} Sanity`,
              ...prev.log,
            ].slice(0, 50),
          }
        })

        result.type = 'ghost'
        result.data = ghost
        result.damageTaken = damage
        result.sanityLost = sanityDmg
        result.log = `${ghost.name} attacks! -${damage} HP`
      } else {
        // Peaceful encounter or befriend
        const luckBoost = stateRef.current.luck * 0.01
        const befriendRoll = Math.random() + luckBoost

        setState(prev => {
          const newEncountered = prev.ghostsEncountered.includes(ghost.id)
            ? prev.ghostsEncountered
            : [...prev.ghostsEncountered, ghost.id]
          const befriended = befriendRoll < ghost.befriendChance
          const newBefriended = befriended && !prev.ghostsBefriended.includes(ghost.id)
          return {
            ...prev,
            gold: htClamp(prev.gold + goldReward, 0, HT_MAX_GOLD),
            totalGoldEarned: prev.totalGoldEarned + goldReward,
            xp: prev.xp + xpReward,
            totalXp: prev.totalXp + xpReward,
            ghostsEncountered: newEncountered,
            ghostsBefriended: newBefriended
              ? [...prev.ghostsBefriended, ghost.id]
              : prev.ghostsBefriended,
            totalGhostsEncountered: prev.totalGhostsEncountered + 1,
            totalGhostsBefriended: prev.totalGhostsBefriended + (newBefriended ? 1 : 0),
            isExploring: false,
            log: [
              befriended
                ? `You befriended ${ghost.name}! +${goldReward} Gold, +${xpReward} XP`
                : `${ghost.name} fades away peacefully. +${goldReward} Gold`,
              ...prev.log,
            ].slice(0, 50),
          }
        })

        result.type = 'ghost'
        result.data = ghost
        result.goldFound = goldReward
        result.xpGained = xpReward
        result.dodgeSuccess = Math.random() + stateRef.current.luck * 0.01 < ghost.befriendChance
        result.log = `${ghost.name} encounter`
      }
      return result
    }

    if (roll < chamber.artifactChance + chamber.ghostChance + chamber.trapChance) {
      const chamberTraps = HT_TRAPS.filter(t => t.chamber === chamber.id)
      const pool = chamberTraps.length > 0 ? chamberTraps : HT_TRAPS
      const trap = pool[htRandomInt(0, pool.length - 1)]
      const dodgeChance = htClamp(
        stateRef.current.dodge + (trap.dodgeBonus ?? 0) + stateRef.current.trapSense * 0.3,
        0,
        95
      ) / 100
      const dodgeRoll = Math.random()
      const dodged = dodgeRoll < dodgeChance

      if (dodged) {
        setState(prev => {
          const newDodged = prev.trapsDodged.includes(trap.id)
            ? prev.trapsDodged
            : [...prev.trapsDodged, trap.id]
          return {
            ...prev,
            trapsDodged: newDodged,
            totalTrapsDodged: prev.totalTrapsDodged + 1,
            isExploring: false,
            log: [
              `${trap.name} triggered but you dodged it!`,
              ...prev.log,
            ].slice(0, 50),
          }
        })
        result.dodgeSuccess = true
        result.dodgeRoll = dodgeChance
        result.log = `Dodged ${trap.name}!`
      } else {
        const damage = htRandomInt(trap.minDamage, trap.maxDamage)
        const sanityDmg = (trap as Record<string, unknown>).sanityDamage as number ?? 0

        setState(prev => {
          const newTriggered = prev.trapsTriggered.includes(trap.id)
            ? prev.trapsTriggered
            : [...prev.trapsTriggered, trap.id]
          return {
            ...prev,
            hp: htClamp(prev.hp - damage, 0, prev.maxHp),
            sanity: htClamp(prev.sanity - sanityDmg, 0, prev.maxSanity),
            isAlive: (prev.hp - damage) > 0,
            trapsTriggered: newTriggered,
            totalTrapsTriggered: prev.totalTrapsTriggered + 1,
            totalDamageTaken: prev.totalDamageTaken + damage,
            totalSanityLost: prev.totalSanityLost + sanityDmg,
            isExploring: false,
            log: [
              `${trap.name}: -${damage} HP${sanityDmg > 0 ? `, -${sanityDmg} Sanity` : ''}`,
              ...prev.log,
            ].slice(0, 50),
          }
        })
        result.damageTaken = damage
        result.sanityLost = sanityDmg
        result.log = `${trap.name}: -${damage} HP`
      }

      result.type = 'trap'
      result.data = trap
      result.dodgeRoll = dodgeChance
      return result
    }

    // Random event
    const event = HT_EVENTS[htRandomInt(0, HT_EVENTS.length - 1)]
    let goldFound = 0
    let xpGained = 0
    let healed = 0
    let sanityRestored = 0

    setState(prev => {
      let updates: Partial<HauntedTombState> = {
        isExploring: false,
        totalExplorations: prev.totalExplorations + 1,
      }

      switch (event.type) {
        case 'gold': {
          goldFound = htRandomInt(event.minAmount, event.maxAmount)
          const scaledGold = Math.floor(goldFound * prev.goldFind)
          updates.gold = htClamp(prev.gold + scaledGold, 0, HT_MAX_GOLD)
          updates.totalGoldEarned = prev.totalGoldEarned + scaledGold
          break
        }
        case 'gems': {
          const gems = htRandomInt(event.minAmount, event.maxAmount)
          updates.gems = htClamp(prev.gems + gems, 0, HT_MAX_GEMS)
          break
        }
        case 'heal': {
          healed = event.healAmount
          sanityRestored = event.sanityAmount
          updates.hp = htClamp(prev.hp + healed, 0, prev.maxHp)
          updates.sanity = htClamp(prev.sanity + sanityRestored, 0, prev.maxSanity)
          updates.totalHealing = prev.totalHealing + healed
          break
        }
        case 'xp': {
          xpGained = htRandomInt(event.minAmount, event.maxAmount)
          updates.xp = prev.xp + xpGained
          updates.totalXp = prev.totalXp + xpGained
          break
        }
        case 'cursed_chest': {
          if (Math.random() < 0.5) {
            goldFound = htRandomInt(event.goldMin, event.goldMax)
            const scaledGold = Math.floor(goldFound * prev.goldFind)
            updates.gold = htClamp(prev.gold + scaledGold, 0, HT_MAX_GOLD)
            updates.totalGoldEarned = prev.totalGoldEarned + scaledGold
            result.log = `Cursed Chest: Found ${scaledGold} Gold!`
          } else {
            const dmg = htRandomInt(event.damageMin, event.damageMax)
            updates.hp = htClamp(prev.hp - dmg, 0, prev.maxHp)
            updates.sanity = htClamp(prev.sanity - event.sanityLoss, 0, prev.maxSanity)
            updates.isAlive = (prev.hp - dmg) > 0
            updates.totalDamageTaken = prev.totalDamageTaken + dmg
            updates.totalSanityLost = prev.totalSanityLost + event.sanityLoss
            result.damageTaken = dmg
            result.sanityLost = event.sanityLoss
            result.log = `Cursed Chest: CURSED! -${dmg} HP, -${event.sanityLoss} Sanity`
          }
          break
        }
        case 'merchant': {
          result.log = 'A Wandering Merchant appears but has nothing to sell right now.'
          break
        }
      }

      return {
        ...prev,
        ...updates,
        log: [result.log || `${event.name}: ${event.desc}`, ...prev.log].slice(0, 50),
      }
    })

    result.type = 'event'
    result.data = event
    result.goldFound = goldFound
    result.xpGained = xpGained
    if (!result.log) {
      result.log = `${event.name}: ${event.desc}`
    }
    return result
  }, [])

  // ── Artifact System ───────────────────────────────────────

  const htGetArtifactById = useCallback((id: string) => {
    return HT_ARTIFACTS.find(a => a.id === id) ?? null
  }, [])

  const htGetArtifactRarity = useCallback((id: string) => {
    const artifact = HT_ARTIFACTS.find(a => a.id === id)
    if (!artifact) return HT_RARITY_COMMON
    return htGetRarityData(artifact.rarity)
  }, [])

  const htEquipArtifact = useCallback((artifactId: string) => {
    setState(prev => {
      if (!prev.collectedArtifacts.includes(artifactId)) return prev
      if (prev.equippedArtifacts.length >= 6) return prev
      if (prev.equippedArtifacts.includes(artifactId)) return prev
      return {
        ...prev,
        equippedArtifacts: [...prev.equippedArtifacts, artifactId],
      }
    })
  }, [])

  const htUnequipArtifact = useCallback((artifactId: string) => {
    setState(prev => ({
      ...prev,
      equippedArtifacts: prev.equippedArtifacts.filter(id => id !== artifactId),
    }))
  }, [])

  const htGetEquippedStats = useCallback(() => {
    const stats = {
      maxHp: 0,
      maxSanity: 0,
      dodge: 0,
      luck: 0,
      goldFind: 0,
      trapSense: 0,
      xpMult: 0,
      healAmount: 0,
      sanityRestore: 0,
    }

    for (const id of stateRef.current.equippedArtifacts) {
      const artifact = HT_ARTIFACTS.find(a => a.id === id)
      if (!artifact) continue
      switch (artifact.stat) {
        case 'maxHp': stats.maxHp += artifact.value; break
        case 'maxSanity': stats.maxSanity += artifact.value; break
        case 'dodge': stats.dodge += artifact.value; break
        case 'luck': stats.luck += artifact.value; break
        case 'goldFind': stats.goldFind += artifact.value; break
        case 'trapSense': stats.trapSense += artifact.value; break
        case 'xpMult': stats.xpMult += artifact.value; break
        case 'healAmount': stats.healAmount += artifact.value; break
        case 'sanityRestore': stats.sanityRestore += artifact.value; break
      }
    }

    return stats
  }, [])

  const htHasArtifact = useCallback((artifactId: string): boolean => {
    return stateRef.current.collectedArtifacts.includes(artifactId)
  }, [])

  const htIsArtifactEquipped = useCallback((artifactId: string): boolean => {
    return stateRef.current.equippedArtifacts.includes(artifactId)
  }, [])

  // ── Ghost System ──────────────────────────────────────────

  const htGetGhostById = useCallback((id: string) => {
    return HT_GHOSTS.find(g => g.id === id) ?? null
  }, [])

  const htHasEncounteredGhost = useCallback((ghostId: string): boolean => {
    return stateRef.current.ghostsEncountered.includes(ghostId)
  }, [])

  const htHasBefriendedGhost = useCallback((ghostId: string): boolean => {
    return stateRef.current.ghostsBefriended.includes(ghostId)
  }, [])

  const htAttemptBefriend = useCallback((ghostId: string): boolean => {
    const ghost = HT_GHOSTS.find(g => g.id === ghostId)
    if (!ghost) return false
    const luckBoost = stateRef.current.luck * 0.01
    const roll = Math.random() + luckBoost
    const success = roll < ghost.befriendChance

    if (success) {
      setState(prev => {
        if (prev.ghostsBefriended.includes(ghostId)) return prev
        const goldReward = htRandomInt(ghost.goldReward[0], ghost.goldReward[1])
        const xpReward = htRandomInt(ghost.xpReward[0], ghost.xpReward[1])
        return {
          ...prev,
          ghostsBefriended: [...prev.ghostsBefriended, ghostId],
          totalGhostsBefriended: prev.totalGhostsBefriended + 1,
          gold: htClamp(prev.gold + goldReward, 0, HT_MAX_GOLD),
          totalGoldEarned: prev.totalGoldEarned + goldReward,
          xp: prev.xp + xpReward,
          totalXp: prev.totalXp + xpReward,
        }
      })
    }

    return success
  }, [])

  // ── Trap System ───────────────────────────────────────────

  const htGetTrapById = useCallback((id: string) => {
    return HT_TRAPS.find(t => t.id === id) ?? null
  }, [])

  const htHasTriggeredTrap = useCallback((trapId: string): boolean => {
    return stateRef.current.trapsTriggered.includes(trapId)
  }, [])

  const htHasDodgedTrap = useCallback((trapId: string): boolean => {
    return stateRef.current.trapsDodged.includes(trapId)
  }, [])

  const htAttemptDodge = useCallback((trapId: string): boolean => {
    const trap = HT_TRAPS.find(t => t.id === trapId)
    if (!trap) return false
    const dodgeChance = htClamp(
      stateRef.current.dodge + (trap.dodgeBonus ?? 0) + stateRef.current.trapSense * 0.3,
      0,
      95
    ) / 100
    return Math.random() < dodgeChance
  }, [])

  // ── Title System ──────────────────────────────────────────

  const htGetTitleById = useCallback((titleId: string) => {
    return HT_TITLES.find(t => t.id === titleId) ?? null
  }, [])

  const htGetAvailableTitles: () => typeof HT_TITLES = () => {
    return HT_TITLES.filter(t => state.level >= t.levelReq)
  }

  const htSetTitle = useCallback((titleId: string) => {
    const title = HT_TITLES.find(t => t.id === titleId)
    if (!title || stateRef.current.level < title.levelReq) return
    setState(prev => ({ ...prev, title: title.name }))
  }, [])

  const htGetBestTitle: () => typeof HT_TITLES[number] = () => {
    const available = HT_TITLES.filter(t => state.level >= t.levelReq)
    return available[available.length - 1] ?? HT_TITLES[0]
  }

  // ── Achievement System ────────────────────────────────────

  const htGetAchievementById = useCallback((id: string) => {
    return HT_ACHIEVEMENTS.find(a => a.id === id) ?? null
  }, [])

  const htHasAchievement = useCallback((id: string): boolean => {
    return stateRef.current.achievements.includes(id)
  }, [])

  const htUnlockAchievement = useCallback((id: string) => {
    setState(prev => {
      if (prev.achievements.includes(id)) return prev
      const achievement = HT_ACHIEVEMENTS.find(a => a.id === id)
      if (!achievement) return prev
      const reward = achievement.reward
      return {
        ...prev,
        achievements: [...prev.achievements, id],
        gold: htClamp(prev.gold + (reward.gold ?? 0), 0, HT_MAX_GOLD),
        gems: htClamp(prev.gems + (reward.gems ?? 0), 0, HT_MAX_GEMS),
        totalGoldEarned: prev.totalGoldEarned + (reward.gold ?? 0),
      }
    })
  }, [])

  const htCheckAchievements = useCallback(() => {
    setState(prev => {
      const newAchievements: string[] = []
      let goldAdd = 0
      let gemsAdd = 0
      let xpAdd = 0

      const check = (id: string, condition: boolean) => {
        if (prev.achievements.includes(id) || !condition) return
        const ach = HT_ACHIEVEMENTS.find(a => a.id === id)
        if (!ach) return
        newAchievements.push(id)
        goldAdd += ach.reward.gold ?? 0
        gemsAdd += ach.reward.gems ?? 0
        xpAdd += ach.reward.xp ?? 0
      }

      check('first_steps', prev.totalExplorations >= 1)
      check('first_artifact', prev.totalArtifactsFound >= 1)
      check('ten_artifacts', prev.totalArtifactsFound >= 10)
      check('twenty_five_artifacts', prev.totalArtifactsFound >= 25)
      check('first_ghost', prev.totalGhostsEncountered >= 1)
      check('befriend_ghost', prev.totalGhostsBefriended >= 1)
      check('befriend_five_ghosts', prev.totalGhostsBefriended >= 5)
      check('survive_ten_traps', prev.totalTrapsTriggered >= 10)
      check('dodge_twenty_traps', prev.totalTrapsDodged >= 20)
      check('clear_first_chamber', prev.chambersCleared.length >= 1)
      check('clear_all_chambers', prev.chambersCleared.length >= 8)
      check('level_ten', prev.level >= 10)
      check('level_twenty_five', prev.level >= 25)
      check('level_fifty', prev.level >= 50)
      check('find_legendary', prev.collectedArtifacts.some(id => {
        const art = HT_ARTIFACTS.find(a => a.id === id)
        return art?.rarity === 'legendary'
      }))
      check('earn_10k_gold', prev.totalGoldEarned >= 10000)
      check('hundred_explorations', prev.totalExplorations >= 100)
      check('zero_sanity_escape', prev.sanity === 0 && prev.isAlive)

      if (newAchievements.length === 0) return prev

      return {
        ...prev,
        achievements: [...prev.achievements, ...newAchievements],
        gold: htClamp(prev.gold + goldAdd, 0, HT_MAX_GOLD),
        gems: htClamp(prev.gems + gemsAdd, 0, HT_MAX_GEMS),
        xp: prev.xp + xpAdd,
        totalXp: prev.totalXp + xpAdd,
        totalGoldEarned: prev.totalGoldEarned + goldAdd,
      }
    })
  }, [])

  // ── Revive ────────────────────────────────────────────────

  const htRevive = useCallback(() => {
    setState(prev => {
      if (prev.isAlive) return prev
      if (prev.gems < HT_REVIVE_COST_GEMS) return prev
      return {
        ...prev,
        isAlive: true,
        hp: Math.floor(prev.maxHp * 0.5),
        sanity: Math.floor(prev.maxSanity * 0.5),
        gems: prev.gems - HT_REVIVE_COST_GEMS,
      }
    })
  }, [])

  const htCanRevive: () => boolean = () => {
    return !state.isAlive && state.gems >= HT_REVIVE_COST_GEMS
  }

  // ── Shop / Trade ──────────────────────────────────────────

  const htBuyHealPotion = useCallback((): boolean => {
    const cost = 25
    let success = false
    setState(prev => {
      if (prev.gold < cost || prev.hp >= prev.maxHp) return prev
      success = true
      return {
        ...prev,
        gold: prev.gold - cost,
        hp: htClamp(prev.hp + 40, 0, prev.maxHp),
      }
    })
    return success
  }, [])

  const htBuySanityPotion = useCallback((): boolean => {
    const cost = 30
    let success = false
    setState(prev => {
      if (prev.gold < cost || prev.sanity >= prev.maxSanity) return prev
      success = true
      return {
        ...prev,
        gold: prev.gold - cost,
        sanity: htClamp(prev.sanity + 35, 0, prev.maxSanity),
      }
    })
    return success
  }, [])

  const htBuyFullRestore = useCallback((): boolean => {
    const cost = 100
    let success = false
    setState(prev => {
      if (prev.gold < cost) return prev
      success = true
      return {
        ...prev,
        gold: prev.gold - cost,
        hp: prev.maxHp,
        sanity: prev.maxSanity,
      }
    })
    return success
  }, [])

  const htBuyLuckyCharm = useCallback((): boolean => {
    const cost = 50
    let success = false
    setState(prev => {
      if (prev.gold < cost) return prev
      success = true
      return { ...prev, gold: prev.gold - cost }
    })
    if (success) {
      htAddGold(htRandomInt(40, 80))
    }
    return success
  }, [htAddGold])

  const htSellArtifact = useCallback((artifactId: string): boolean => {
    const artifact = HT_ARTIFACTS.find(a => a.id === artifactId)
    if (!artifact) return false
    let success = false
    setState(prev => {
      if (!prev.collectedArtifacts.includes(artifactId)) return prev
      const rarityData = htGetRarityData(artifact.rarity)
      const sellPrice = Math.floor((10 + rarityData.xpMult * 20) * prev.goldFind)
      success = true
      return {
        ...prev,
        collectedArtifacts: prev.collectedArtifacts.filter(id => id !== artifactId),
        equippedArtifacts: prev.equippedArtifacts.filter(id => id !== artifactId),
        gold: htClamp(prev.gold + sellPrice, 0, HT_MAX_GOLD),
        totalGoldEarned: prev.totalGoldEarned + sellPrice,
      }
    })
    return success
  }, [])

  // ── Stats helpers ─────────────────────────────────────────

  const htGetHpPercent: () => number = () => {
    if (state.maxHp <= 0) return 0
    return state.hp / state.maxHp
  }

  const htGetSanityPercent: () => number = () => {
    if (state.maxSanity <= 0) return 0
    return state.sanity / state.maxSanity
  }

  const htGetTotalPlayTime: () => string = () => {
    const elapsed = Date.now() - state.createdAt
    const hours = Math.floor(elapsed / 3600000)
    const minutes = Math.floor((elapsed % 3600000) / 60000)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const htGetLastSaveTime: () => string = () => {
    const elapsed = Date.now() - state.lastSaveAt
    const seconds = Math.floor(elapsed / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m ago`
  }

  const htGetCompletionPercent: () => number = () => {
    let total = 0
    let completed = 0
    total += HT_ARTIFACTS.length
    completed += state.collectedArtifacts.length
    total += HT_CHAMBERS.length
    completed += state.chambersCleared.length
    total += HT_GHOSTS.length
    completed += state.ghostsBefriended.length
    total += HT_ACHIEVEMENTS.length
    completed += state.achievements.length
    total += HT_TRAPS.length
    completed += state.trapsDodged.length
    if (total === 0) return 0
    return Math.floor((completed / total) * 100)
  }

  // ── Save / Load / Reset ───────────────────────────────────

  const htSave = useCallback(() => {
    htSaveState(stateRef.current)
  }, [])

  const htLoad = useCallback(() => {
    const saved = htLoadState()
    setState(saved)
  }, [])

  const htClearLog = useCallback(() => {
    setState(prev => ({ ...prev, log: [] }))
  }, [])

  const htAddLog = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      log: [message, ...prev.log].slice(0, 50),
    }))
  }, [])

  // htResetProgress is a PLAIN function (no useCallback)
  function htResetProgress() {
    const freshState = htCreateDefaultState()
    setState(freshState)
    htSaveState(freshState)
  }

  // ── Export / Import ───────────────────────────────────────

  const htExportSave = useCallback((): string => {
    try {
      return JSON.stringify(stateRef.current)
    } catch {
      return ''
    }
  }, [])

  const htImportSave = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as Partial<HauntedTombState>
      const defaults = htCreateDefaultState()
      const merged = { ...defaults, ...parsed }
      setState(merged)
      htSaveState(merged)
      return true
    } catch {
      return false
    }
  }, [])

  // ── Chamber-specific helpers ──────────────────────────────

  const htGetChamberProgress = useCallback((chamberId: string): { discovered: boolean; cleared: boolean; artifactCount: number; ghostCount: number } => {
    const chamber = HT_CHAMBERS.find(c => c.id === chamberId)
    if (!chamber) return { discovered: false, cleared: false, artifactCount: 0, ghostCount: 0 }
    const chamberArtifacts = HT_ARTIFACTS.filter(a => a.chamber === chamberId)
    const foundArtifacts = chamberArtifacts.filter(a => stateRef.current.collectedArtifacts.includes(a.id))
    const chamberGhosts = HT_GHOSTS.filter(g => g.chamber === chamberId)
    const encounteredGhosts = chamberGhosts.filter(g => stateRef.current.ghostsEncountered.includes(g.id))
    return {
      discovered: stateRef.current.chambersDiscovered.includes(chamberId),
      cleared: stateRef.current.chambersCleared.includes(chamberId),
      artifactCount: foundArtifacts.length,
      ghostCount: encounteredGhosts.length,
    }
  }, [])

  const htGetTotalChamberArtifacts = useCallback((chamberId: string): number => {
    return HT_ARTIFACTS.filter(a => a.chamber === chamberId).length
  }, [])

  const htGetTotalChamberGhosts = useCallback((chamberId: string): number => {
    return HT_GHOSTS.filter(g => g.chamber === chamberId).length
  }, [])

  // ── Collection helpers ────────────────────────────────────

  const htGetCollectedCountByRarity = useCallback((rarity: string): number => {
    return stateRef.current.collectedArtifacts.filter(id => {
      const artifact = HT_ARTIFACTS.find(a => a.id === id)
      return artifact?.rarity === rarity
    }).length
  }, [])

  const htGetTotalCountByRarity = useCallback((rarity: string): number => {
    return HT_ARTIFACTS.filter(a => a.rarity === rarity).length
  }, [])

  // ── Danger assessment ─────────────────────────────────────

  const htGetCurrentDangerLevel: () => number = () => {
    const chamberId = state.currentChamber
    if (!chamberId) return 0
    const chamber = HT_CHAMBERS.find(c => c.id === chamberId)
    return chamber?.dangerLevel ?? 0
  }

  const htGetSurvivalOdds: () => number = () => {
    const hpFactor = state.hp / state.maxHp
    const sanityFactor = state.sanity / state.maxSanity
    const dodgeFactor = state.dodge / 100
    const base = (hpFactor * 0.4 + sanityFactor * 0.3 + dodgeFactor * 0.2 + 0.1) * 100
    return Math.floor(htClamp(base, 5, 99))
  }

  // ── Data accessors (for UI rendering) ─────────────────────

  const htGetAllArtifacts: () => typeof HT_ARTIFACTS = () => HT_ARTIFACTS
  const htGetAllChambers: () => typeof HT_CHAMBERS = () => HT_CHAMBERS
  const htGetAllTraps: () => typeof HT_TRAPS = () => HT_TRAPS
  const htGetAllGhosts: () => typeof HT_GHOSTS = () => HT_GHOSTS
  const htGetAllTitles: () => typeof HT_TITLES = () => HT_TITLES
  const htGetAllAchievements: () => typeof HT_ACHIEVEMENTS = () => HT_ACHIEVEMENTS
  const htGetAllEvents: () => typeof HT_EVENTS = () => HT_EVENTS
  const htGetAllRarities: () => typeof HT_RARITIES = () => HT_RARITIES
  const htGetXpTable: () => number[] = () => HT_XP_TABLE
  const htGetMaxLevel: () => number = () => HT_MAX_LEVEL
  const htGetExplorationCooldown: () => number = () => HT_EXPLORATION_COOLDOWN_MS

  // ── Misc ──────────────────────────────────────────────────

  const htGetRarityColor = useCallback((rarityName: string): string => {
    return htGetRarityData(rarityName).color
  }, [])

  const htGetRarityIcon = useCallback((rarityName: string): string => {
    return htGetRarityData(rarityName).icon
  }, [])

  const htIsMaxLevel: () => boolean = () => state.level >= HT_MAX_LEVEL

  const htGetEffectiveMaxHp: () => number = () => {
    const equipped = htGetEquippedStats()
    return state.maxHp + equipped.maxHp
  }

  const htGetEffectiveMaxSanity: () => number = () => {
    const equipped = htGetEquippedStats()
    return state.maxSanity + equipped.maxSanity
  }

  const htGetEffectiveDodge: () => number = () => {
    const equipped = htGetEquippedStats()
    return state.dodge + equipped.dodge
  }

  const htGetEffectiveLuck: () => number = () => {
    const equipped = htGetEquippedStats()
    return state.luck + equipped.luck
  }

  const htGetEffectiveGoldFind: () => number = () => {
    const equipped = htGetEquippedStats()
    return state.goldFind + equipped.goldFind
  }

  const htGetEffectiveTrapSense: () => number = () => {
    const equipped = htGetEquippedStats()
    return state.trapSense + equipped.trapSense
  }

  const htGetEffectiveXpMult: () => number = () => {
    const equipped = htGetEquippedStats()
    return state.xpMult + equipped.xpMult
  }

  const htGetEffectiveHealAmount: () => number = () => {
    const equipped = htGetEquippedStats()
    return state.healAmount + equipped.healAmount
  }

  const htGetEffectiveSanityRestore: () => number = () => {
    const equipped = htGetEquippedStats()
    return state.sanityRestore + equipped.sanityRestore
  }

  // ──────────────────────────────────────────────────────────
  // RETURN
  // ──────────────────────────────────────────────────────────

  return {
    // State
    state,

    // Getters — core stats
    htGetLevel,
    htGetXp,
    htGetTotalXp,
    htGetXpForNextLevel,
    htGetXpProgress,
    htGetHp,
    htGetMaxHp,
    htGetSanity,
    htGetMaxSanity,
    htGetGold,
    htGetGems,
    htGetDodge,
    htGetLuck,
    htGetGoldFind,
    htGetTrapSense,
    htGetXpMult,
    htGetHealAmount,
    htGetSanityRestore,
    htGetTitle,
    htGetIsAlive,
    htGetIsExploring,
    htGetCurrentChamber,

    // Getters — effective stats (base + equipped)
    htGetEquippedStats,
    htGetEffectiveMaxHp,
    htGetEffectiveMaxSanity,
    htGetEffectiveDodge,
    htGetEffectiveLuck,
    htGetEffectiveGoldFind,
    htGetEffectiveTrapSense,
    htGetEffectiveXpMult,
    htGetEffectiveHealAmount,
    htGetEffectiveSanityRestore,

    // Getters — totals
    htGetTotalExplorations,
    htGetTotalTrapsTriggered,
    htGetTotalTrapsDodged,
    htGetTotalGhostsEncountered,
    htGetTotalGhostsBefriended,
    htGetTotalArtifactsFound,
    htGetTotalGoldEarned,
    htGetTotalDamageTaken,
    htGetTotalSanityLost,
    htGetTotalHealing,

    // Getters — collections
    htGetCollectedArtifacts,
    htGetEquippedArtifacts,
    htGetChambersDiscovered,
    htGetChambersCleared,
    htGetGhostsEncountered,
    htGetGhostsBefriended,
    htGetAchievements,
    htGetLog,
    htGetState,

    // Getters — derived
    htGetHpPercent,
    htGetSanityPercent,
    htGetTotalPlayTime,
    htGetLastSaveTime,
    htGetCompletionPercent,
    htGetCurrentDangerLevel,
    htGetSurvivalOdds,
    htIsMaxLevel,
    htCanRevive,

    // XP & Leveling
    htAddXp,

    // HP & Sanity
    htTakeDamage,
    htHeal,
    htFullHeal,
    htLoseSanity,
    htRestoreSanity,
    htFullSanityRestore,

    // Gold & Gems
    htAddGold,
    htSpendGold,
    htAddGems,
    htSpendGems,

    // Chamber system
    htGetChamberById,
    htGetAccessibleChambers,
    htDiscoverChamber,
    htEnterChamber,
    htClearChamber,
    htLeaveChamber,
    htGetChamberProgress,
    htGetTotalChamberArtifacts,
    htGetTotalChamberGhosts,

    // Exploration
    htExplore,
    htExploreWithRewards,

    // Artifact system
    htGetArtifactById,
    htGetArtifactRarity,
    htEquipArtifact,
    htUnequipArtifact,
    htHasArtifact,
    htIsArtifactEquipped,
    htGetCollectedCountByRarity,
    htGetTotalCountByRarity,

    // Ghost system
    htGetGhostById,
    htHasEncounteredGhost,
    htHasBefriendedGhost,
    htAttemptBefriend,

    // Trap system
    htGetTrapById,
    htHasTriggeredTrap,
    htHasDodgedTrap,
    htAttemptDodge,

    // Title system
    htGetTitleById,
    htGetAvailableTitles,
    htSetTitle,
    htGetBestTitle,

    // Achievement system
    htGetAchievementById,
    htHasAchievement,
    htUnlockAchievement,
    htCheckAchievements,

    // Revive
    htRevive,

    // Shop
    htBuyHealPotion,
    htBuySanityPotion,
    htBuyFullRestore,
    htBuyLuckyCharm,
    htSellArtifact,

    // Save / Load / Reset
    htSave,
    htLoad,
    htResetProgress,
    htClearLog,
    htAddLog,
    htExportSave,
    htImportSave,

    // Rarity helpers
    htGetRarityColor,
    htGetRarityIcon,
    htPickRarity,

    // Data accessors
    htGetAllArtifacts,
    htGetAllChambers,
    htGetAllTraps,
    htGetAllGhosts,
    htGetAllTitles,
    htGetAllAchievements,
    htGetAllEvents,
    htGetAllRarities,
    htGetXpTable,
    htGetMaxLevel,
    htGetExplorationCooldown,
  }
}
